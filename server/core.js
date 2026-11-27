// The AI server, written against web-standard Request/Response so the same
// code runs under Node (server/node.js) and as a Cloudflare Worker
// (server/worker.js). The API key is read from the environment and is never
// sent to the browser, logged, or echoed in errors.
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { WorldSchema, LinesSchema } from './schema.js';
import { WORLD_SYSTEM, LINES_SYSTEM } from './prompt.js';

const DEFAULTS = {
  MODEL: 'claude-haiku-5-5', // fast and cheap: one call per world
  DAILY_CALL_CAP: 300,       // all Claude calls per UTC day (worlds + extra lines)
  PER_IP_DAILY_CAP: 40,      // per visitor per day
  ALLOWED_ORIGINS: '',       // comma separated; localhost is always allowed
};

const today = () => new Date().toISOString().slice(0, 10);

async function hashIp(ip, day) {
  const data = new TextEncoder().encode(`${day}:${ip}:world-sentence`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}

function clean(s, max) {
  return typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

export function createServer({ env, store, log = () => {} }) {
  const cfg = { ...DEFAULTS, ...Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined && v !== '')) };
  const key = env.ANTHROPIC_API_KEY;
  const client = key ? new Anthropic({ apiKey: key, maxRetries: 1, timeout: 40_000, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) }) : null;
  const capTotal = Number(cfg.DAILY_CALL_CAP) || DEFAULTS.DAILY_CALL_CAP;
  const capIp = Number(cfg.PER_IP_DAILY_CAP) || DEFAULTS.PER_IP_DAILY_CAP;
  const origins = String(cfg.ALLOWED_ORIGINS).split(',').map((s) => s.trim()).filter(Boolean);

  const originAllowed = (origin) => {
    if (!origin) return true; // same-origin or non-browser
    if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return true;
    return origins.includes('*') || origins.includes(origin);
  };
  const corsHeaders = (origin) => (origin && originAllowed(origin)
    ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'origin' }
    : {});

  async function usage(ip) {
    const day = today();
    const total = Number(await store.get(`${day}:total`)) || 0;
    const ipKey = `${day}:ip:${await hashIp(ip || 'unknown', day)}`;
    const mine = Number(await store.get(ipKey)) || 0;
    return { day, total, mine, ipKey, remaining: Math.max(0, Math.min(capTotal - total, capIp - mine)) };
  }
  async function spend(u) {
    await store.incr(`${u.day}:total`);
    await store.incr(u.ipKey);
  }

  async function callClaude({ system, user, schema, maxTokens }) {
    const response = await client.messages.parse({
      model: cfg.MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
      output_config: { effort: 'low', format: zodOutputFormat(schema) },
    });
    if (response.stop_reason === 'refusal') return { refused: true };
    if (!response.parsed_output) return { failed: response.stop_reason || 'no output' };
    return { data: response.parsed_output, usage: response.usage };
  }

  function errorResponse(err, cors) {
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      log('Claude rejected the API key (check ANTHROPIC_API_KEY).');
      return json({ error: 'The server’s AI key is not working.', fallback: true }, 503, cors);
    }
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'The AI is busy right now.', fallback: true }, 503, cors);
    if (err instanceof Anthropic.APIConnectionTimeoutError) return json({ error: 'The AI took too long.', fallback: true }, 504, cors);
    if (err instanceof Anthropic.APIError) {
      log(`Claude API error ${err.status ?? ''}: ${err.name}`);
      return json({ error: 'The AI had a problem.', fallback: true }, 502, cors);
    }
    log(`Unexpected error: ${err?.name || 'Error'}: ${String(err?.message || err).slice(0, 200)}`);
    return json({ error: 'Something went wrong.', fallback: true }, 500, cors);
  }

  return async function handle(request, { ip } = {}) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    const cors = corsHeaders(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: originAllowed(origin) ? 204 : 403, headers: cors });
    if (!originAllowed(origin)) return json({ error: 'Origin not allowed.' }, 403);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      const u = await usage(ip);
      return json({ ai: !!client, model: client ? cfg.MODEL : null, remaining: client ? u.remaining : 0 }, 200, cors);
    }

    const isWorld = url.pathname === '/api/world', isLines = url.pathname === '/api/lines';
    if (!isWorld && !isLines) return json({ error: 'Not found.' }, 404, cors);
    if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405, cors);
    if (!client) return json({ error: 'No AI key on the server.', fallback: true }, 503, cors);

    const text = await request.text();
    if (text.length > 16_000) return json({ error: 'Too big.' }, 413, cors);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'Bad JSON.' }, 400, cors); }

    if (isWorld && !clean(body?.sentence, 120)) return json({ error: 'Empty sentence.' }, 400, cors);

    const u = await usage(ip);
    if (u.remaining <= 0) {
      const which = u.total >= capTotal ? 'The daily AI budget is used up' : 'You have built a lot of worlds today';
      return json({ error: `${which}. Worlds will be built offline until tomorrow.`, fallback: true, capped: true }, 429, cors);
    }

    try {
      if (isWorld) {
        const sentence = clean(body.sentence, 120);
        await spend(u);
        const r = await callClaude({ system: WORLD_SYSTEM, user: `Sentence: ${JSON.stringify(sentence)}`, schema: WorldSchema, maxTokens: 8000 });
        if (r.refused) return json({ error: 'The AI would rather not build that one.', fallback: true, refused: true }, 422, cors);
        if (r.failed) return json({ error: 'The AI returned an incomplete world.', fallback: true }, 502, cors);
        log(`world ok (${sentence.length} chars, ${r.usage?.output_tokens ?? '?'} output tokens)`);
        return json({ recipe: { ...r.data, sentence, source: 'ai' }, remaining: u.remaining - 1 }, 200, cors);
      }
      // extra lines for a local
      const w = body.world || {}, l = body.local || {};
      const said = (Array.isArray(l.lines) ? l.lines : []).slice(-12).map((x) => clean(x, 150));
      const user = JSON.stringify({
        world: { name: clean(w.name, 48), sentence: clean(w.sentence, 120), intro: clean(w.intro, 360), landmarks: (Array.isArray(w.landmarks) ? w.landmarks : []).slice(0, 5).map((x) => clean(x, 48)), residents: (Array.isArray(w.locals) ? w.locals : []).slice(0, 5).map((x) => clean(x, 36)) },
        resident: { name: clean(l.name, 36), role: clean(l.role, 44), species: clean(l.species, 20), already_said: said },
      });
      await spend(u);
      const r = await callClaude({ system: LINES_SYSTEM, user, schema: LinesSchema, maxTokens: 1200 });
      if (r.refused || r.failed) return json({ error: 'No new lines.', fallback: true }, 502, cors);
      const lines = (r.data.lines || []).map((x) => clean(x, 150)).filter(Boolean).slice(0, 3);
      return json({ lines, remaining: u.remaining - 1 }, 200, cors);
    } catch (err) {
      return errorResponse(err, cors);
    }
  };
}

// Simple counter stores.
export class MemoryStore {
  constructor() { this.map = new Map(); }
  async get(k) { return this.map.get(k) || 0; }
  async incr(k) { const v = (this.map.get(k) || 0) + 1; this.map.set(k, v); return v; }
}
