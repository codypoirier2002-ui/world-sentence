// Share a world as a link: the whole recipe, compressed into the URL hash.
// Opening the link rebuilds the exact same world without calling any server.
const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

const canCompress = typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

export async function encodeRecipe(recipe) {
  const json = enc.encode(JSON.stringify(recipe));
  if (canCompress) {
    try { return `z${toB64url(await pipe(json, new CompressionStream('deflate-raw')))}`; } catch { /* fall back */ }
  }
  return `j${toB64url(json)}`;
}

export async function decodeRecipe(payload) {
  if (typeof payload !== 'string' || payload.length < 2 || payload.length > 60000) throw new Error('bad link');
  const kind = payload[0], body = fromB64url(payload.slice(1));
  let bytes;
  if (kind === 'z') {
    if (!canCompress) throw new Error('This browser cannot open compressed links.');
    bytes = await pipe(body, new DecompressionStream('deflate-raw'));
  } else if (kind === 'j') bytes = body;
  else throw new Error('bad link');
  if (bytes.length > 300000) throw new Error('link too big');
  return JSON.parse(dec.decode(bytes));
}

export async function shareLink(recipe) {
  const payload = await encodeRecipe(recipe);
  const url = new URL(window.location.href);
  url.hash = `w=${payload}`;
  return url.toString();
}

export function readHashPayload() {
  const m = /^#w=(.+)$/.exec(window.location.hash || '');
  return m ? m[1] : null;
}
