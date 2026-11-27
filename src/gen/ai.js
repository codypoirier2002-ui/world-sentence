// Browser side of the AI: talks to our small server (never to Claude
// directly, so the API key stays on the server). Every call can fail; callers
// fall back to the built-in generator.

// In dev, Vite proxies /api to `npm run server`. In a production build the
// server URL comes from VITE_WORLD_API (set as a GitHub repo variable).
const BASE = (import.meta.env?.VITE_WORLD_API || '').replace(/\/+$/, '');
const ENABLED = !!BASE || !!import.meta.env?.DEV;

async function call(path, { method = 'GET', body, timeout = 8000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method, signal: ctrl.signal,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { /* not json */ }
    if (!res.ok) {
      if (!data?.error && res.status >= 500) { status.ai = false; const err = new Error('The AI server is not reachable.'); err.offline = true; throw err; }
      const err = new Error(data?.error || `The AI server said ${res.status}.`);
      err.status = res.status; err.capped = !!data?.capped; err.refused = !!data?.refused;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') { const err = new Error('The AI took too long.'); err.timeout = true; throw err; }
    if (e instanceof TypeError) { status.ai = false; const err = new Error('The AI server is not reachable.'); err.offline = true; throw err; }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

let status = { ai: false, checked: false, remaining: 0 };

export async function checkAI() {
  if (!ENABLED) { status = { ai: false, checked: true, remaining: 0 }; return status; }
  try {
    const d = await call('/api/health', { timeout: 4000 });
    status = { ai: !!d?.ai, checked: true, remaining: d?.remaining ?? 0 };
  } catch {
    status = { ai: false, checked: true, remaining: 0 };
  }
  return status;
}

export const aiStatus = () => status;

export async function aiWorld(sentence) {
  const d = await call('/api/world', { method: 'POST', body: { sentence }, timeout: 45000 });
  if (typeof d?.remaining === 'number') status.remaining = d.remaining;
  if (!d?.recipe) throw new Error('The AI sent back nothing.');
  return d.recipe;
}

export async function aiLines(recipe, local) {
  const d = await call('/api/lines', {
    method: 'POST', timeout: 20000,
    body: {
      world: { name: recipe.name, sentence: recipe.sentence, intro: recipe.intro, landmarks: recipe.landmarks.map((l) => l.name), locals: recipe.locals.map((l) => l.name) },
      local: { name: local.name, role: local.role, species: local.species, lines: local.lines },
    },
  });
  if (typeof d?.remaining === 'number') status.remaining = d.remaining;
  return Array.isArray(d?.lines) ? d.lines.filter((x) => typeof x === 'string') : [];
}
