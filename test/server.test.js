import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer, MemoryStore } from '../server/core.js';
import { sanitizeRecipe } from '../src/gen/recipe.js';
import { generateRecipe } from '../src/gen/generate.js';

// A tiny stand-in for the Messages API, so the test needs no key or network.
function mockClaude() {
  const seen = [];
  const srv = http.createServer(async (req, res) => {
    let raw = ''; for await (const c of req) raw += c;
    const body = JSON.parse(raw);
    seen.push(body);
    const user = body.messages[0].content;
    const reply = (status, obj) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (user.includes('BADKEY')) return reply(401, { type: 'error', error: { type: 'authentication_error', message: 'x' } });
    const msg = (text, stop = 'end_turn') => ({ id: 'm', type: 'message', role: 'assistant', model: body.model, content: text ? [{ type: 'text', text }] : [], stop_reason: stop, usage: { input_tokens: 1, output_tokens: 1 } });
    if (user.includes('REFUSE')) return reply(200, msg('', 'refusal'));
    if (body.system.startsWith('You write extra lines')) return reply(200, msg(JSON.stringify({ lines: ['a', 'b', 'c'] })));
    const r = generateRecipe('a swamp ruled by frogs');
    reply(200, msg(JSON.stringify({
      name: 'Test Bog', intro: 'i', welcome: 'w', medium: 'air', palette: { ...r.palette, glow: '#ffffff' }, terrain: r.terrain, sky: r.sky, ambience: ['frogs'],
      scatter: [{ prop: 'reed', density: 0.5, tint: '' }],
      landmarks: [{ kind: 'throne', name: 'Seat', sign: 'Sit elsewhere.', scale: 1, tint: '' }],
      locals: [{ name: 'Ribbet', role: 'king', species: 'frog', variant: 'cat', color: '#00ff00', accent: '#000000', hat: 'crown', size: 1.2, ruler: true, lines: ['x', 'y', 'z'] }],
    })));
  });
  return new Promise((resolve) => srv.listen(0, () => resolve({ srv, seen, url: `http://localhost:${srv.address().port}` })));
}

const post = (handle, path, body, headers = {}) => handle(new Request(`http://x${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }), { ip: '1.2.3.4' });

test('AI server: world, lines, refusals, key errors, caps and CORS', async () => {
  const mock = await mockClaude();
  try {
    const handle = createServer({ env: { ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_BASE_URL: mock.url, PER_IP_DAILY_CAP: '5', ALLOWED_ORIGINS: 'https://example.github.io' }, store: new MemoryStore() });
    const health = await (await handle(new Request('http://x/api/health'), { ip: '1.2.3.4' })).json();
    assert.equal(health.ai, true);
    assert.equal(health.remaining, 5);

    const res = await post(handle, '/api/world', { sentence: 'a swamp ruled by frogs' }, { origin: 'https://example.github.io' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://example.github.io');
    const { recipe } = await res.json();
    assert.equal(recipe.source, 'ai');
    const clean = sanitizeRecipe(recipe);
    assert.equal(clean.locals[0].ruler, true);
    assert.equal(clean.landmarks[0].kind, 'throne');

    const req = mock.seen[0];
    assert.equal(req.model, 'claude-haiku-5-5');
    assert.equal(req.output_config.effort, 'low');
    assert.equal(req.output_config.format.type, 'json_schema');
    assert.ok(!('temperature' in req));

    assert.deepEqual((await (await post(handle, '/api/lines', { world: { name: 'W' }, local: { name: 'L', lines: ['hi'] } })).json()).lines, ['a', 'b', 'c']);
    assert.equal((await post(handle, '/api/world', { sentence: 'REFUSE' })).status, 422);
    const bad = await post(handle, '/api/world', { sentence: 'BADKEY' });
    assert.equal(bad.status, 503);
    assert.ok(!(await bad.text()).includes('test-key'), 'never echoes the key');
    assert.equal((await post(handle, '/api/world', { sentence: '   ' })).status, 400);
    assert.equal((await post(handle, '/api/world', { sentence: 'last one' })).status, 200);
    const capped = await post(handle, '/api/world', { sentence: 'one too many' });
    assert.equal(capped.status, 429);
    assert.equal((await capped.json()).capped, true);
    assert.equal((await post(handle, '/api/world', { sentence: 'x' }, { origin: 'https://evil.example' })).status, 403);
  } finally {
    mock.srv.close();
  }
});

test('AI server without a key says so and the app falls back', async () => {
  const handle = createServer({ env: {}, store: new MemoryStore() });
  assert.equal((await (await handle(new Request('http://x/api/health'))).json()).ai, false);
  const r = await post(handle, '/api/world', { sentence: 'hi' });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).fallback, true);
});
