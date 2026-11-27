// Local / any-Node-host entry point:  npm run server
// Reads ANTHROPIC_API_KEY from the environment or from server/.env.
// The key is never printed.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, MemoryStore } from './core.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function loadDotEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

// Counts survive restarts so the daily cap holds.
class FileStore extends MemoryStore {
  constructor(file) {
    super();
    this.file = file;
    try { this.map = new Map(Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))); } catch { /* fresh */ }
    const day = new Date().toISOString().slice(0, 10);
    for (const k of this.map.keys()) if (!k.startsWith(day)) this.map.delete(k);
  }
  async incr(k) {
    const v = await super.incr(k);
    try { fs.writeFileSync(this.file, JSON.stringify(Object.fromEntries(this.map))); } catch { /* read-only disk is fine */ }
    return v;
  }
}

const env = { ...loadDotEnv(path.join(here, '.env')), ...process.env };
const port = Number(env.PORT) || 8787;
const log = (msg) => console.log(`[world-sentence] ${msg}`);
const handle = createServer({ env, store: new FileStore(path.join(here, '.usage.json')), log });

const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const c of req) { size += c.length; if (size > 32_000) { res.writeHead(413).end(); return; } chunks.push(c); }
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: Object.entries(req.headers).filter(([, v]) => typeof v === 'string'),
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    });
    const ip = (env.TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket.remoteAddress || 'local';
    const response = await handle(request, { ip });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    log(`request failed: ${err?.name || 'Error'}`);
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' });
    res.end('{"error":"server error","fallback":true}');
  }
});

server.listen(port, () => {
  log(`AI server listening on http://localhost:${port}`);
  log(env.ANTHROPIC_API_KEY
    ? `API key found (not shown). Model: ${env.MODEL || 'claude-haiku-5-5'}. Daily cap: ${env.DAILY_CALL_CAP || 300} calls.`
    : 'No ANTHROPIC_API_KEY found. Put it in server/.env. Until then the app uses its built-in generator.');
});
