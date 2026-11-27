// The world recipe: one JSON object that fully describes a world. Every recipe,
// whether hand-made, keyword-generated, from the AI or from a shared link,
// passes through sanitizeRecipe() before it is built. It never throws.
import { SCATTER, LANDMARK_KINDS, SPECIES, HATS, SHAPES, GROUNDS, WATERS, TIMES, WEATHERS, MEDIUMS, AMBIENCES, CRITTER_VARIANTS } from '../kit/catalog.js';

export const RECIPE_VERSION = 1;
export const LIMITS = { sentence: 120, name: 48, intro: 360, welcome: 160, landmarkName: 48, sign: 150, localName: 36, role: 44, line: 150, lines: 24 };

const isHex = (s) => typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);
const num = (v, a, b, d) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d);
const CONTROL_RE = new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u2028\\u2029]', 'g');
export function cleanText(s, max, d = '') {
  if (typeof s !== 'string') return d;
  // strip control chars and markup-ish brackets; text is only ever rendered as text, but keep it tidy
  const t = s.replace(CONTROL_RE, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  if (!t) return d;
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}
const pick = (v, list, d) => (list.includes(v) ? v : d);
const hex = (v, d) => (isHex(v) ? v.toLowerCase() : d);

const DEFAULT_PALETTE = { sky: '#4e9fe3', horizon: '#cfe7f3', ground: '#7db357', ground2: '#a5c868', rock: '#8f8b84', water: '#4a9cc8', foliage: '#4c9444', accent: '#d2604a' };
const OPTIONAL_PALETTE = ['peak', 'glow', 'sun', 'foliage2', 'trunk', 'wood', 'metal', 'stone', 'plaster'];

export function sanitizeRecipe(input, fallback = null) {
  const r = input && typeof input === 'object' ? input : {};
  const fb = fallback || {};
  const out = { v: RECIPE_VERSION };
  out.seed = Number.isInteger(r.seed) ? (r.seed >>> 0) : Number.isInteger(fb.seed) ? fb.seed >>> 0 : Math.floor(Math.random() * 2 ** 31);
  out.source = pick(r.source, ['handmade', 'keywords', 'ai', 'shared'], fb.source || 'keywords');
  out.sentence = cleanText(r.sentence, LIMITS.sentence, fb.sentence || 'a world');
  out.name = cleanText(r.name, LIMITS.name, fb.name || 'Somewhere');
  out.intro = cleanText(r.intro, LIMITS.intro, fb.intro || `${out.name}. It is a place.`);
  out.welcome = cleanText(r.welcome, LIMITS.welcome, fb.welcome || `Welcome to ${out.name}.`);
  out.medium = pick(r.medium, MEDIUMS, fb.medium || 'air');

  const p = r.palette && typeof r.palette === 'object' ? r.palette : {};
  const fp = fb.palette || DEFAULT_PALETTE;
  out.palette = {};
  for (const k of Object.keys(DEFAULT_PALETTE)) out.palette[k] = hex(p[k], hex(fp[k], DEFAULT_PALETTE[k]));
  for (const k of OPTIONAL_PALETTE) { const v = hex(p[k], hex(fp[k], null)); if (v) out.palette[k] = v; }

  const t = r.terrain && typeof r.terrain === 'object' ? r.terrain : {};
  const ft = fb.terrain || {};
  out.terrain = {
    shape: pick(t.shape, Object.keys(SHAPES), pick(ft.shape, Object.keys(SHAPES), 'hills')),
    height: num(t.height, 0, 1, num(ft.height, 0, 1, 0.4)),
    roughness: num(t.roughness, 0, 1, num(ft.roughness, 0, 1, 0.4)),
    ground: pick(t.ground, GROUNDS, pick(ft.ground, GROUNDS, 'grass')),
    water: pick(t.water, WATERS, pick(ft.water, WATERS, 'none')),
    road: typeof t.road === 'boolean' ? t.road : ft.road === true,
  };

  const s = r.sky && typeof r.sky === 'object' ? r.sky : {};
  const fs = fb.sky || {};
  out.sky = {
    time: pick(s.time, TIMES, pick(fs.time, TIMES, 'day')),
    weather: pick(s.weather, WEATHERS, pick(fs.weather, WEATHERS, 'clear')),
    clouds: num(s.clouds, 0, 1, num(fs.clouds, 0, 1, 0.4)),
  };

  const amb = Array.isArray(r.ambience) ? r.ambience : fb.ambience || [];
  out.ambience = [...new Set(amb.filter((a) => AMBIENCES.includes(a)))].slice(0, 3);
  if (!out.ambience.length) out.ambience = ['wind'];

  const seen = new Set();
  const sc = Array.isArray(r.scatter) && r.scatter.length ? r.scatter : fb.scatter || [];
  out.scatter = [];
  for (const e of sc) {
    if (!e || !SCATTER[e.prop] || seen.has(e.prop)) continue;
    seen.add(e.prop);
    const entry = { prop: e.prop, density: num(e.density, 0, 1, 0.5) };
    if (isHex(e.tint)) entry.tint = e.tint.toLowerCase();
    out.scatter.push(entry);
    if (out.scatter.length >= 10) break;
  }

  const lm = Array.isArray(r.landmarks) && r.landmarks.length ? r.landmarks : fb.landmarks || [];
  out.landmarks = [];
  for (const e of lm) {
    if (!e || !LANDMARK_KINDS[e.kind]) continue;
    const name = cleanText(e.name, LIMITS.landmarkName, '');
    if (!name) continue;
    const entry = { kind: e.kind, name, sign: cleanText(e.sign, LIMITS.sign, name), scale: num(e.scale, 0.6, 1.8, 1) };
    if (isHex(e.tint)) entry.tint = e.tint.toLowerCase();
    out.landmarks.push(entry);
    if (out.landmarks.length >= 5) break;
  }

  const lo = Array.isArray(r.locals) && r.locals.length ? r.locals : fb.locals || [];
  out.locals = [];
  for (const e of lo) {
    if (!e || !SPECIES[e.species]) continue;
    const name = cleanText(e.name, LIMITS.localName, '');
    if (!name) continue;
    const lines = (Array.isArray(e.lines) ? e.lines : []).map((l) => cleanText(l, LIMITS.line, '')).filter(Boolean).slice(0, LIMITS.lines);
    if (!lines.length) lines.push('Hello.');
    const entry = {
      name, role: cleanText(e.role, LIMITS.role, ''), species: e.species,
      color: hex(e.color, '#c8b49a'), accent: hex(e.accent, '#3a3a3a'),
      hat: pick(e.hat, HATS, 'none'), size: num(e.size, 0.6, 1.6, 1), lines,
    };
    if (e.species === 'critter') entry.variant = pick(e.variant, CRITTER_VARIANTS, 'cat');
    if (e.ruler === true) entry.ruler = true;
    out.locals.push(entry);
    if (out.locals.length >= 5) break;
  }
  return out;
}
