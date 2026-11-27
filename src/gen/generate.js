// The built-in generator: turns a sentence into a world recipe using keywords
// only (no network). Deterministic per sentence, so the same line always gives
// the same world, and `variant` asks for a different take.
//
// A sentence is read as layers that all combine:
//   setting  where it is (the moon, a swamp, under the sea)       -> themes.js
//   places   what's there (a laundromat, a diner, a school)       -> places.js
//   creatures who lives there, and whether one of them is in charge
//   moods, colours, time, weather, terrain and water words
//   leftover nouns ("a desert where it rains SOUP") become landmarks and jokes
import { RNG, hashString } from './rng.js';
import { THEMES, THEME_BY_ID } from './themes.js';
import { PLACES } from './places.js';

// The place whose main building is this landmark kind (to name a diner like a diner).
const PLACE_FOR_KIND = {};
for (const p of PLACES) if (!PLACE_FOR_KIND[p.landmarks[0]]) PLACE_FOR_KIND[p.landmarks[0]] = p;
import {
  CREATURES, SPECIES_LABEL, SPECIES_DEFAULT, MEDIUM_PHRASES, TIME_WORDS, WEATHER_WORDS, MOODS, COLORS,
  SHAPE_WORDS, WATER_WORDS, RULE_VERBS, STAFF_VERBS, STOPWORDS, LANDMARK_WORDS, PROP_WORDS,
} from './lexicon.js';
import {
  cap, plural, singular, fill, worldName, intro, welcome, landmarkName, signText, personName, firstName, localLines,
  RULER_TITLES, heroName, comboWorldName, placeWorldName, COMBO_TAILS, COMBO_LINES, introTail,
} from './text.js';
import { sanitizeRecipe } from './recipe.js';
import { mix, shiftHue, lighten, darken, hexToRgb, rgbToHsl, hslToHex } from '../kit/colors.js';
import { SCATTER, LANDMARK_KINDS } from '../kit/catalog.js';

// Words that only nudge (adjectives, vague nouns) count half.
const WEAK = new Set(['sweet', 'sugary', 'glowing', 'electric', 'tropical', 'royal', 'ancient', 'lost', 'forgotten', 'magical', 'enchanted',
  'mystic', 'mystical', 'festive', 'sleepy', 'dreamy', 'whimsical', 'cold', 'icy', 'frozen', 'snowy', 'fiery', 'burning', 'sandy', 'arid',
  'cosmic', 'digital', 'virtual', 'musical', 'industrial', 'urban', 'lunar', 'alien', 'polar', 'volcanic', 'botanical', 'party', 'star',
  'stars', 'tree', 'fire', 'ash', 'sand', 'snow', 'ice', 'sky', 'cloud', 'clouds', 'magic', 'machine', 'trick', 'harvest', 'cherry', 'blossom',
  'temple', 'lantern', 'lanterns', 'book', 'hill', 'park', 'study', 'reading', 'room', 'hall', 'inside', 'indoor', 'road', 'route', 'court',
  'club', 'stage', 'store', 'shop', 'home', 'mail', 'fair', 'match', 'race', 'gas', 'washing', 'pie', 'slice', 'cheese', 'soup', 'dinner',
  'lunch', 'breakfast', 'money', 'toy', 'pets', 'tools', 'music', 'film', 'camp', 'tent', 'pool', 'spa', 'tunnel', 'tunnels', 'town',
  'gutter', 'date', 'exhibit', 'plane', 'jet', 'pump', 'trash', 'junk', 'crop', 'crops', 'tooth', 'teeth', 'sofa', 'couch', 'oven', 'pier']);

const PREPS = new Set(['on', 'in', 'at', 'under', 'inside', 'beneath', 'below', 'above', 'near', 'by', 'beside', 'behind', 'across', 'over',
  'within', 'underneath', 'atop', 'upon', 'among', 'amongst', 'along', 'outside', 'off', 'past', 'through', 'into', 'onto', 'up', 'down']);

export function tokenize(sentence) {
  const s = ` ${sentence.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  const words = s.trim().split(' ').filter(Boolean);
  const stems = words.map((w) => singular(w));
  return { text: s, words, stems };
}

const hasWord = (tk, w) => tk.words.includes(w) || tk.stems.includes(w);
const wordIndexAt = (tk, charAt) => tk.text.slice(0, charAt).trim().split(' ').filter(Boolean).length;

function detectMedium(tk) {
  for (const [medium, phrases] of Object.entries(MEDIUM_PHRASES)) {
    for (const p of phrases) {
      if (p.includes(' ')) {
        const at = tk.text.indexOf(` ${p}`);
        if (at >= 0) return { medium, index: wordIndexAt(tk, at), last: wordIndexAt(tk, at) + p.split(' ').length - 1 };
      } else {
        const i = tk.words.findIndex((w, k) => w === p || tk.stems[k] === p);
        if (i >= 0) return { medium, index: i, last: i };
      }
    }
  }
  return null;
}

// Score every theme or place against the sentence. Multi-word entries
// ("gas station") are matched as phrases; their words don't count again.
function scoreList(list, tk) {
  const scores = [];
  for (const th of list) {
    let score = 0, first = Infinity, last = -1, hit = null;
    const used = new Set();
    for (const w of [...th.words, ...(th.phrases || [])].filter((x) => x.includes(' '))) {
      const at = tk.text.indexOf(` ${w} `);
      if (at < 0) continue;
      const i = wordIndexAt(tk, at), n = w.split(' ').length;
      for (let k = 0; k < n; k++) used.add(i + k);
      score += 1.25; first = Math.min(first, i); last = Math.max(last, i + n - 1);
      if (!hit) hit = w;
    }
    const single = new Set(th.words.filter((x) => !x.includes(' ')));
    tk.words.forEach((w, i) => {
      if (used.has(i)) return;
      const st = tk.stems[i];
      if (!single.has(w) && !single.has(st)) return;
      const weak = WEAK.has(w) || WEAK.has(st);
      score += weak ? 0.5 : 1;
      first = Math.min(first, i); last = Math.max(last, i);
      if (!hit || weak === false) hit = hit && !WEAK.has(hit) ? hit : st;
    });
    if (score > 0) scores.push({ th, hit, first, last, score });
  }
  return scores.sort((a, b) => b.score - a.score || a.first - b.first);
}

function detectCreatures(tk) {
  const found = [];
  tk.words.forEach((w, i) => {
    const st = tk.stems[i];
    for (const c of CREATURES) {
      if (c.w.includes(w) || c.w.includes(st)) {
        if (!found.some((f) => f.c === c)) found.push({ c, word: c.w.includes(st) ? st : w, index: i });
        break;
      }
    }
  });
  return found;
}

function detectRule(tk, creatures) {
  // "... ruled by frogs" / "run by owls" / "haunted by accountants"
  for (let i = 0; i < tk.words.length - 1; i++) {
    const w = tk.words[i];
    const isRule = RULE_VERBS.includes(w), isStaff = STAFF_VERBS.includes(w);
    if (!isRule && !isStaff) continue;
    let j = i + 1;
    if (tk.words[j] === 'by') j++;
    while (j < tk.words.length && ['a', 'an', 'the', 'some', 'very', 'two', 'three', 'one', 'single', 'lone', 'local', 'tiny', 'giant', 'old', 'retired', 'grumpy', 'sleepy', 'bored', 'angry', 'polite', 'small', 'big'].includes(tk.words[j])) j++;
    const target = creatures.find((f) => f.index >= j && f.index <= j + 2);
    if (target) return { kind: isRule ? 'ruled' : 'staffed', creature: target };
  }
  return null;
}

function matchList(tk, map) {
  for (const [k, list] of Object.entries(map)) for (const w of list) {
    if (w.includes(' ') ? tk.text.includes(` ${w} `) : hasWord(tk, w)) return k;
  }
  return null;
}

let KNOWN = null, PHRASES = null;
function knownWords() {
  if (KNOWN) return KNOWN;
  KNOWN = new Set();
  PHRASES = [];
  const addAll = (arr) => arr.forEach((w) => (w.includes(' ') ? PHRASES.push(w) : KNOWN.add(w)));
  for (const th of [...THEMES, ...PLACES]) { addAll(th.words); addAll(th.phrases || []); }
  for (const c of CREATURES) addAll(c.w);
  for (const m of [TIME_WORDS, WEATHER_WORDS, SHAPE_WORDS, WATER_WORDS]) for (const l of Object.values(m)) addAll(l);
  for (const m of Object.values(MOODS)) addAll(m.w);
  addAll(Object.keys(COLORS));
  addAll([...RULE_VERBS, ...STAFF_VERBS]);
  for (const l of Object.values(MEDIUM_PHRASES)) addAll(l);
  addAll(Object.keys(LANDMARK_WORDS));
  addAll(Object.keys(PROP_WORDS));
  return KNOWN;
}

function unknownNouns(tk, known) {
  const out = [];
  const inPhrase = new Set(PHRASES.filter((p) => tk.text.includes(` ${p} `)).flatMap((p) => p.split(' ')));
  tk.words.forEach((w, i) => {
    const st = tk.stems[i];
    if (w.length < 3 || STOPWORDS.has(w) || STOPWORDS.has(st) || known.has(w) || known.has(st) || inPhrase.has(w) || /^\d/.test(w)) return;
    if (/(ed|ing|ly|ous|ful|ish|ive|est|less|able|ible)$/.test(w)) return;
    if (!out.includes(st)) out.push(st);
  });
  return out;
}

function sentenceIs(sentence) {
  let s = sentence.trim().replace(/[.!?\s]+$/, '');
  if (!s) return 'a place';
  s = s[0].toLowerCase() + s.slice(1);
  if (/^(a|an|the|my|our|your|some|one|two|three|this|that|every|no|his|her|their)\s/i.test(s)) return s;
  const firstWord = s.split(' ')[0];
  if (singular(firstWord) !== firstWord.toLowerCase() && !/(ss|us|is)$/.test(firstWord)) return `a place full of ${s}`;
  return `${/^[aeiou]/i.test(s) ? 'an' : 'a'} ${s}`;
}

const PROPER = { mars: 'Mars', earth: 'Earth', venus: 'Venus', jupiter: 'Jupiter', saturn: 'Saturn', neptune: 'Neptune', pluto: 'Pluto', 'north pole': 'North Pole', 'south pole': 'South Pole', antarctic: 'Antarctic', halloween: 'Halloween' };
const properNouns = (s) => Object.entries(PROPER).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\b${k}\\b`, 'g'), v), s);

// "a laundromat on the moon" -> "on the moon": the words from the preposition before the setting word.
function whereFrom(tk, index, last, fallback) {
  if (index == null || index < 0) return fallback;
  let start = -1;
  for (let k = index; k >= Math.max(0, index - 5); k--) if (PREPS.has(tk.words[k])) { start = k; break; }
  if (start < 0) return fallback;
  let end = Math.max(last, index);
  // "inside a" -> "inside a whale"
  for (let k = 0; k < 3 && (PREPS.has(tk.words[end]) || ['a', 'an', 'the', 'of', 'my', 'our', 'some'].includes(tk.words[end])) && end + 1 < tk.words.length; k++) end++;
  const phrase = tk.words.slice(start, end + 1).join(' ');
  return phrase.split(' ').length <= 7 ? properNouns(phrase) : fallback;
}

// Things named outright: "a mysterious water tower", "a museum of lost socks".
function findMentions(tk, map) {
  const found = [], used = new Set();
  const keys = Object.keys(map).sort((a, b) => b.split(' ').length - a.split(' ').length);
  for (const k of keys) {
    if (k.includes(' ')) {
      const at = tk.text.indexOf(` ${k} `);
      if (at < 0) continue;
      const i = wordIndexAt(tk, at), n = k.split(' ').length;
      if ([...Array(n).keys()].some((d) => used.has(i + d))) continue;
      for (let d = 0; d < n; d++) used.add(i + d);
      if (!found.includes(map[k])) found.push(map[k]);
    } else {
      tk.words.forEach((w, i) => {
        if (used.has(i) || (w !== k && tk.stems[i] !== k)) return;
        used.add(i);
        if (!found.includes(map[k])) found.push(map[k]);
      });
    }
  }
  return found;
}

function tintPalette(p, color, amt) {
  return { ...p, accent: color, foliage: mix(p.foliage, color, amt * 0.8), ground2: mix(p.ground2, color, amt), ground: mix(p.ground, color, amt * 0.35), sky: mix(p.sky, color, amt * 0.45), horizon: mix(p.horizon, color, amt * 0.3) };
}
function mapPalette(p, fn) { const out = {}; for (const [k, v] of Object.entries(p)) out[k] = fn(v); return out; }
const desaturate = (p, amt) => mapPalette(p, (v) => { const [h, s, l] = rgbToHsl(hexToRgb(v)); return hslToHex(h, s * (1 - amt), l); });

const BUILT = new Set(['city', 'suburb', 'roadside', 'village', 'interior', 'neon']);
const NO_UNDERWATER = new Set(['bird', 'butterfly', 'bat', 'firefly', 'cloud_puff', 'balloon', 'floating_lantern', 'grass', 'flower', 'reed', 'lily_pad', 'umbrella', 'bbq_grill', 'candle', 'torch']);
const NO_SPACE = new Set(['bird', 'butterfly', 'grass', 'flower', 'reed', 'lily_pad', 'cloud_puff', 'tree_round', 'tree_pine', 'bush', 'firefly']);

export function generateRecipe(sentence, { variant = 0 } = {}) {
  const clean = String(sentence || '').replace(/\s+/g, ' ').trim().slice(0, 120) || 'a quiet place';
  const seed = hashString(`${clean.toLowerCase()}#${variant}`);
  const rng = new RNG(seed);
  const tk = tokenize(clean);
  const med = detectMedium(tk);

  // ---------------------------------------------------------------- what and where
  const sScores = scoreList(THEMES, tk);
  const pScores = scoreList(PLACES, tk);
  const placeHits = pScores.filter((x) => x.score >= 0.75 || (x.score >= 0.5 && !sScores.length)).sort((a, b) => a.first - b.first).slice(0, 3);
  const places = placeHits.map((x) => x.th);
  let settingHit = sScores[0] || null;
  // a lone adjective ("lost", "royal") doesn't get to pick the setting when a place is named
  if (settingHit && settingHit.score < 1 && placeHits.length) settingHit = null;
  let setting = settingHit?.th || null;
  let secondary = sScores.find((x) => x !== settingHit && x.th !== setting && x.score >= 0.75)?.th || null;

  // phrases like "under the sea", "on the moon", "inside a whale" decide the medium
  if (med) {
    const want = med.medium;
    const keep = setting && ((want === 'underwater' && setting.medium === 'underwater') || (want === 'space' && setting.medium === 'space') || (want === 'cavern' && setting.medium === 'cavern') || (want === 'sky' && setting.id === 'sky'));
    if (!keep) {
      const prev = setting;
      if (want === 'underwater') setting = THEME_BY_ID.reef;
      else if (want === 'space') setting = hasWord(tk, 'mars') ? THEME_BY_ID.mars : hasWord(tk, 'moon') || hasWord(tk, 'lunar') ? THEME_BY_ID.moon : THEME_BY_ID.space;
      else if (want === 'cavern') setting = ['cave', 'cavern', 'underground', 'mine', 'grotto', 'subterranean'].some((w) => hasWord(tk, w)) ? THEME_BY_ID.cave : ['sewer', 'sewers'].some((w) => hasWord(tk, w)) ? THEME_BY_ID.sewer : THEME_BY_ID.interior;
      else if (want === 'sky') setting = THEME_BY_ID.sky;
      if (prev && prev !== setting) secondary = prev;
      settingHit = { th: setting, first: med.index, last: med.last, fromMedium: true };
    }
  }
  // "a bakery in a graveyard": a second place after a preposition is where the first one is
  let container = null;
  if (!setting && placeHits.length >= 2) {
    for (const h of placeHits.slice(1)) {
      const a = tk.words[h.first - 1], b = tk.words[h.first - 2];
      if (PREPS.has(a) || (['a', 'an', 'the', 'my'].includes(a) && PREPS.has(b))) { container = h; break; }
    }
    if (container) { setting = THEME_BY_ID[container.th.home] || THEME_BY_ID.suburb; settingHit = { th: setting, first: container.first, last: container.last }; }
  }
  const homeOnly = !setting && places.length > 0;
  const mentionedLmsEarly = findMentions(tk, LANDMARK_WORDS);
  const LM_HOME = { water_tower: 'roadside', lighthouse: 'beach', windmill: 'meadow', ferris_wheel: 'meadow', carousel: 'meadow', pyramid: 'desert', obelisk: 'desert', volcano: 'island', igloo: 'arctic', pagoda: 'zen', shipwreck: 'beach', rocket: 'desert', ufo: 'desert', castle: 'meadow', giant_duck: 'lakeside', big_top: 'meadow', skyscraper: 'city', billboard: 'roadside', escalator: 'interior', giant_couch: 'interior', giant_tv: 'interior', giant_fridge: 'interior', giant_washer: 'interior', clocktower: 'village', well: 'village', bridge: 'lakeside', totem: 'forest', campfire: 'forest', stone_circle: 'meadow', temple: 'jungle', monolith: 'salt_flats', crystal_spire: 'cave' };
  if (!setting) {
    if (places.length) setting = THEME_BY_ID[places[0].home] || THEME_BY_ID.suburb;
    else if (mentionedLmsEarly.length && LM_HOME[mentionedLmsEarly[0]]) setting = THEME_BY_ID[LM_HOME[mentionedLmsEarly[0]]];
    else setting = rng.pick(['meadow', 'forest', 'village', 'fairy', 'dream', 'ruins', 'garden', 'island', 'suburb', 'lakeside'].map((id) => THEME_BY_ID[id]));
  }
  const lead = places[0] || null;
  const where = homeOnly || !lead ? setting.phrase : whereFrom(tk, settingHit?.first, settingHit?.last ?? settingHit?.first, setting.phrase);

  // creatures, rulers and leftover nouns
  const creatures = detectCreatures(tk);
  const rule = detectRule(tk, creatures);
  const unknown = unknownNouns(tk, knownWords()).filter((w) => !creatures.some((c) => c.word === w));
  const key = unknown.length ? unknown[0].replace(/-/g, ' ') : null;

  // ---------------------------------------------------------------- terrain, palette, medium
  const terrain = { road: false, ...setting.terrain };
  let palette = { ...setting.palette };
  if (homeOnly && lead.palette) palette = { ...palette, ...lead.palette };
  else if (container?.th.palette) palette = { ...palette, ...container.th.palette };
  if (lead?.ground && (homeOnly || BUILT.has(setting.id))) terrain.ground = lead.ground;
  let medium = setting.medium || 'air';
  const shapeW = matchList(tk, SHAPE_WORDS);
  if (shapeW && !(medium === 'cavern' && shapeW !== 'flat')) terrain.shape = shapeW;
  const waterW = matchList(tk, WATER_WORDS);
  if (waterW && !(terrain.shape === 'islands' && waterW === 'none')) terrain.water = waterW;
  if (medium === 'underwater' || medium === 'space') terrain.water = 'none';
  if (medium === 'sky' || (terrain.shape === 'islands' && terrain.water === 'none')) terrain.road = false;
  if (places.some((p) => p.road) && medium !== 'underwater' && medium !== 'cavern' && terrain.shape !== 'islands') terrain.road = true;

  // ---------------------------------------------------------------- time, weather, ambience
  let time = rng.pick(setting.time);
  if (homeOnly && lead.time) time = lead.time;
  if (container?.th.time) time = container.th.time;
  const tw = matchList(tk, TIME_WORDS);
  if (tw) time = tw;
  let weather = rng.pick(setting.weather);
  if (homeOnly && lead.weather) weather = lead.weather;
  if (container?.th.weather) weather = container.th.weather;
  const ww = matchList(tk, WEATHER_WORDS);
  if (ww) weather = ww;
  let ambience = [...(places[0]?.ambience || []), ...setting.ambience, ...places.slice(1).flatMap((p) => p.ambience)];

  // ---------------------------------------------------------------- scatter: places first, then the setting
  let scatter = [];
  const addProp = (prop, density) => { if (SCATTER[prop] && !scatter.some((s) => s.prop === prop)) scatter.push({ prop, density }); };
  const mentionedProps = findMentions(tk, PROP_WORDS);
  const mentionedLms = findMentions(tk, LANDMARK_WORDS);
  for (const prop of mentionedProps.slice(0, 4)) addProp(prop, SCATTER[prop].big ? 0.6 : 0.75);
  places.forEach((p, i) => { for (const [prop, d] of p.props.slice(0, i === 0 ? 5 : 3)) addProp(prop, d); });
  for (const [prop, d] of setting.scatter.slice(0, homeOnly ? 3 : places.length ? 4 : 10)) addProp(prop, places.length ? d * 0.8 : d);
  if (secondary) for (const [prop, d] of rng.shuffle(secondary.scatter).slice(0, 2)) addProp(prop, d * 0.7);

  // ---------------------------------------------------------------- moods
  let sizeMul = 1, glowy = false, extraLocals = 0;
  const moodTails = [], moodLines = [];
  for (const [id, m] of Object.entries(MOODS)) {
    if (!m.w.some((w) => (w.includes(' ') ? tk.text.includes(` ${w} `) : hasWord(tk, w)))) continue;
    if (m.time && !tw) time = m.time;
    if (m.weather && !ww && medium === 'air') weather = m.weather;
    if (m.amb && !ambience.includes(m.amb)) ambience.unshift(m.amb);
    if (id === 'abandoned' || id === 'spooky') ambience = ambience.filter((a) => a !== 'crowd' && a !== 'muzak');
    for (const [prop, d] of m.add || []) addProp(prop, d);
    if (m.size) sizeMul = m.size;
    if (m.desat) palette = desaturate(palette, m.desat);
    if (m.lighten) palette = mapPalette(palette, (v) => lighten(v, m.lighten));
    if (m.darken) palette = mapPalette(palette, (v) => darken(v, m.darken));
    if (m.accent) palette.accent = m.accent;
    if (m.foliage) palette.foliage = m.foliage;
    if (m.water && medium === 'air' && terrain.water !== 'sea') terrain.water = m.water;
    if (m.locals) extraLocals = Math.max(extraLocals, m.locals);
    if (m.glow) { glowy = true; palette.glow = palette.glow || '#7ff6ff'; }
    if (id === 'spooky' && !palette.glow) palette.glow = '#b9f2ff';
    if (m.tails) moodTails.push(...m.tails);
    if (m.lines) moodLines.push(...m.lines);
  }

  // medium clean-up
  if (medium === 'underwater') {
    weather = 'bubbles';
    ambience = ['underwater', ...ambience.filter((a) => !['wind', 'birds', 'insects', 'frogs', 'waves', 'rain'].includes(a))];
    scatter = scatter.filter((s) => !NO_UNDERWATER.has(s.prop));
    for (const [prop, d] of [['kelp', 0.5], ['coral', 0.4], ['fish', 0.6]]) addProp(prop, d);
  } else if (medium === 'space') {
    if (['rain', 'storm', 'snow', 'fog', 'leaves', 'petals', 'bubbles'].includes(weather)) weather = 'clear';
    ambience = ambience.filter((a) => !['birds', 'insects', 'frogs', 'waves'].includes(a));
    scatter = scatter.filter((s) => !NO_SPACE.has(s.prop));
    addProp('rock', 0.4);
  } else if (medium === 'cavern') {
    if (setting.id !== 'interior' && setting.id !== 'sewer') time = 'night';
    ambience = ambience.filter((a) => !['wind', 'birds', 'waves'].includes(a));
    if (setting.id === 'cave') ambience.unshift('cave');
    scatter = scatter.filter((s) => !['bird', 'cloud_puff', 'butterfly'].includes(s.prop));
  }
  if (!ambience.length) ambience = ['wind'];
  if (weather === 'snow' && ['grass', 'lawn'].includes(terrain.ground)) { terrain.ground = 'snow'; palette.ground = mix(palette.ground, '#f1f5fa', 0.8); palette.ground2 = mix(palette.ground2, '#dce8f2', 0.8); }
  if (time === 'night' && medium === 'air' && !scatter.some((s) => ['lamp_post', 'lantern', 'torch', 'candle', 'firefly', 'floating_lantern', 'floor_lamp'].includes(s.prop))) addProp(places.length ? 'lamp_post' : rng.pick(['lantern', 'firefly', 'lamp_post', 'torch']), 0.35);

  // colour words
  for (const w of tk.words) {
    const c = COLORS[w];
    if (!c) continue;
    if (c === 'rainbow') { scatter = scatter.map((s, i) => ({ ...s, tint: shiftHue('#ff5a5a', i / Math.max(1, scatter.length)) })); palette.accent = '#ff5ab8'; }
    else if (c === 'pastel') palette = mapPalette(palette, (v) => lighten(v, 0.3));
    else palette = tintPalette(palette, c, 0.45);
    break;
  }
  scatter = scatter.slice(0, 10);
  if (glowy) for (const s of scatter) if (['lamp_post', 'crystal', 'lantern'].includes(s.prop)) s.density = Math.min(1, s.density + 0.2);

  // ---------------------------------------------------------------- locals
  const dominant = rule?.creature || creatures[0] || null;
  const baseSpecies = dominant ? dominant.c.sp : rng.pick(lead ? lead.species : setting.species);
  const speciesSg = dominant ? dominant.word : baseSpecies === 'critter' ? 'creature' : SPECIES_LABEL[baseSpecies];
  const speciesPl = plural(speciesSg);
  const ruled = rule?.kind === 'ruled';
  const staffed = rule?.kind === 'staffed';
  const nLocals = Math.max(rng.int(3, 5), Math.min(5, extraLocals));
  const lone = dominant && dominant.index > 0 && !rule && ['one', 'single', 'lone', 'solitary', 'only'].some((q) => tk.words.slice(Math.max(0, dominant.index - 3), dominant.index).includes(q));
  const generic = ['neighbourhood watch', 'local historian', 'professional bystander', 'self-appointed greeter', 'part-time philosopher', 'retiree'];
  const rulerFirst = firstName(rng);
  const locals = [], usedNames = new Set();
  for (let i = 0; i < nLocals; i++) {
    let c = dominant?.c || null, sp = baseSpecies;
    const place = places.length ? places[i % places.length] : null;
    if (i > 0 && creatures.length > 1 && i % 2 === 0) { const o = creatures[(i / 2) % creatures.length]; c = o.c; sp = o.c.sp; }
    else if (i > 0 && lone) { c = null; sp = rng.pick((place || setting).species.filter((x) => x !== dominant.c.sp)) || 'person'; }
    else if (!dominant) sp = i % 2 === 1 && !homeOnly ? rng.pick(setting.species) : rng.pick(place ? place.species : setting.species);
    let name;
    do { name = personName(rng, rng.pick(place ? place.pre : setting.pre).toLowerCase().replace(/[^a-z]/g, '')); } while (usedNames.has(name));
    usedNames.add(name);
    const isRuler = ruled && i === 0;
    const own = c && c.sp === sp;
    let color = shiftHue(rng.pick(own ? c.c : SPECIES_DEFAULT[sp].c), rng.range(-0.03, 0.03), 0, rng.range(-0.05, 0.05));
    let hat = own && c.hat ? c.hat : rng.pick(place && i < places.length * 2 ? place.hats : ['none', 'none', 'none', 'beanie', 'cap', 'bow', 'flower', 'top', 'party']);
    if (setting.id === 'fairy' && sp === 'person' && rng.chance(0.5)) hat = 'wizard';
    if (setting.id === 'wildwest' && sp === 'person') hat = 'cowboy';
    if (setting.id === 'pirate' && sp === 'person' && rng.chance(0.6)) hat = 'pirate';
    if (isRuler) hat = 'crown';
    const placeRole = place && (i < places.length * 2 || staffed);
    const role = isRuler ? 'ruler of everything here' : placeRole ? rng.pick(place.roles) : rng.pick([...setting.roles, ...generic]);
    const local = {
      name: isRuler ? `${rng.pick(RULER_TITLES)} ${rulerFirst}` : name, role,
      species: sp, color, accent: own ? c.a : SPECIES_DEFAULT[sp].a, hat,
      size: Math.max(0.6, Math.min(1.6, (isRuler ? 1.25 : rng.range(0.8, 1.15)) * sizeMul)),
      lines: [], ruler: isRuler || undefined, _place: placeRole ? place : null,
    };
    if (sp === 'critter') local.variant = c?.v || rng.pick(['cat', 'dog', 'rabbit', 'mouse', 'pig', 'sheep']);
    locals.push(local);
  }
  const rulerLocal = locals.find((l) => l.ruler);

  // ---------------------------------------------------------------- landmarks
  const lms = [];
  const addLm = (kind, extra = {}) => { if (LANDMARK_KINDS[kind] && !lms.some((l) => l.kind === kind)) lms.push({ kind, ...extra }); };
  places.forEach((p, i) => {
    addLm(p.landmarks[0], { place: p, hero: true });
    if (i === 0 && p.landmarks[1] && places.length === 1) addLm(p.landmarks[1], { place: p });
  });
  for (const k of mentionedLms.slice(0, 2)) addLm(k, { mentioned: true });
  if (ruled) addLm('throne');
  if (dominant && rng.chance(ruled ? 0.8 : places.length ? 0.25 : 0.4)) addLm('monument');
  const settingKinds = rng.shuffle(setting.landmarks.filter((k) => k !== 'monument' || dominant));
  const extraKinds = homeOnly ? rng.shuffle(lead.extra || []) : [];
  const nTarget = Math.max(3, Math.min(5, lms.length + (places.length ? 2 : rng.int(3, 4))));
  for (const k of [...extraKinds.slice(0, 1), ...settingKinds.slice(0, places.length ? 1 : 4), ...extraKinds.slice(1)]) if (lms.length < nTarget) addLm(k);
  if (secondary && lms.length < 5) addLm(rng.pick(secondary.landmarks));
  const keyKind = key ? rng.pick(['statue', 'monolith', 'billboard', 'obelisk'].filter((k) => !lms.some((l) => l.kind === k))) : null;
  if (key && keyKind && lms.length < 5 && !mentionedProps.length) lms.push({ kind: keyKind, keyNoun: key });
  for (const k of settingKinds) if (lms.length < 3) addLm(k);
  if (medium === 'underwater') for (let i = lms.length - 1; i >= 0; i--) if (['hot_air_balloon', 'campfire', 'volcano', 'windmill'].includes(lms[i].kind) && !lms[i].hero) lms.splice(i, 1);
  while (lms.length < 3) addLm(rng.pick(['statue', 'well', 'arch', 'kiosk', 'gazebo', 'obelisk']));

  // ---------------------------------------------------------------- text
  const placeThings = places.flatMap((p) => p.things);
  const things = [...placeThings, ...setting.things, ...(key ? [plural(key)] : [])];
  const ctx = {
    key, keyBias: sScores.length || places.length ? 0.4 : 0.85, pre: [...(lead ? lead.pre : []), ...setting.pre], suf: setting.suf,
    things, thing: things, roles: setting.roles, speciesSg, speciesPl, ruled, staffed,
    ruler: rulerLocal?.name || null, rulerShort: rulerLocal ? rulerFirst : null,
    THING: (key || things[0]).toUpperCase(), n: String(rng.int(3, 400)), year: String(rng.int(1950, 1999)),
    weatherWord: { clear: 'weather', cloudy: 'clouds', rain: 'rain', storm: 'storm', snow: 'snow', fog: 'fog', embers: 'ash', bubbles: 'bubbles', leaves: 'leaves', spores: 'spores', sandstorm: 'sand', petals: 'petals', sparkles: 'sparkles' }[weather],
    timeWord: { dawn: 'morning', day: 'daytime', dusk: 'evening', night: 'night' }[time],
    where, settingAdj: homeOnly || container ? null : setting.adj, nPoi: String(lms.length),
    placeNoun: lead ? lead.nouns[0].toLowerCase() : '', placeThing: lead ? lead.things : [],
  };
  // landmark names first: the hero building often names the world
  const landmarks = lms.map((l) => {
    let name;
    if (l.place) name = l.hero ? heroName(rng, l.place, ctx) : PLACE_FOR_KIND[l.kind] ? heroName(rng, PLACE_FOR_KIND[l.kind], ctx) : landmarkName(rng, l.kind, { ...ctx, pre: l.place.pre, suf: l.place.suf, things: l.place.things });
    else if (l.keyNoun) name = `The ${rng.pick(['Great', 'Last', 'Original', 'Famous', 'Municipal', 'Giant'])} ${cap(l.keyNoun)}`;
    else if (PLACE_FOR_KIND[l.kind] && rng.chance(0.75)) name = heroName(rng, PLACE_FOR_KIND[l.kind], ctx);
    else name = landmarkName(rng, l.kind, { ...ctx, pre: setting.pre, suf: setting.suf, things: setting.things });
    const scale = l.kind === 'monument' || l.kind === 'statue' ? Math.min(1.5, sizeMul) : Math.max(0.8, Math.min(1.4, sizeMul * rng.range(0.92, 1.08)));
    return { kind: l.kind, name, scale, _place: l.place, _hero: l.hero };
  });
  ctx.hero = landmarks.find((l) => l._hero)?.name || landmarks[0].name;
  const mentionedLm = landmarks.find((l, i) => lms[i].mentioned);
  const name = !lead ? (mentionedLm && rng.chance(0.6) ? mentionedLm.name : worldName(rng, setting, ctx)) : homeOnly ? placeWorldName(rng, lead, ctx) : comboWorldName(rng, lead, setting, ctx);
  ctx.name = name; ctx.place = name;
  ctx.landmark = landmarks.map((l) => l.name);
  ctx.local = locals.map((l) => l.name.split(' ')[0]);
  for (const lm of landmarks) {
    const c = { ...ctx, NAME: lm.name, n: String(rng.int(2, 40)) };
    lm.sign = lm._place && lm._hero && lm._place.signs.length && rng.chance(0.85) ? fill(rng.pick(lm._place.signs), c, rng) : signText(rng, lm.kind, c);
    delete lm._place; delete lm._hero;
  }

  // what the locals say: something about their place, the place-in-this-setting, their mood, then general chat
  ctx.usedLines = new Set();
  const usedTpl = new Set();
  locals.forEach((l) => {
    const others = locals.filter((o) => o !== l).map((o) => o.name);
    const c = { ...ctx, role: l.role, otherLocal: others, n: String(rng.int(2, 60)) };
    const special = [];
    const p = l._place || (lead && rng.chance(0.5) ? lead : null);
    const fresh = (pool) => { const left = pool.filter((x) => !usedTpl.has(x)); if (!left.length) return null; const t = rng.pick(left); usedTpl.add(t); return t; };
    const pc = p ? { ...c, placeNoun: p.nouns[0].toLowerCase(), placeThing: p.things } : c;
    const say = (pool, cc) => { const t = pool.length ? fresh(pool) : null; if (t) special.push(fill(t, cc, rng)); };
    if (p) say(p.lines, pc);
    if (p && !homeOnly && rng.chance(0.6)) say(COMBO_LINES, pc);
    if (moodLines.length && rng.chance(0.6)) say(moodLines, c);
    const general = localLines(rng, c, !!l.ruler, 3);
    l.lines = [...new Set([...(l.ruler ? general.slice(0, 1) : []), ...special, ...general])].slice(0, 3);
    for (const x of l.lines) ctx.usedLines.add(x);
    delete l._place;
  });

  ctx.sentenceIs = sentenceIs(clean);
  const tails = [];
  if (lead) {
    if (lead.tails.length) tails.push(lead.tails);
    if (!homeOnly) tails.push(COMBO_TAILS.map((t) => t));
  }
  if (moodTails.length) tails.push(moodTails);
  const chosen = tails.map((pool) => fill(rng.pick(pool), { ...ctx, placeThing: ctx.placeThing.length ? ctx.placeThing : ctx.things }, rng)).slice(0, 2);
  let introText = intro(rng, { ...ctx, n: String(rng.int(12, 900)) });
  if (chosen.length) {
    const ic = { ...ctx, n: String(rng.int(12, 900)), nPoi: String(landmarks.length) };
    introText = [`${ctx.name} is ${ctx.sentenceIs}.`, ...chosen, chosen.length < 2 ? introTail(rng, ic) : ''].filter(Boolean).join(' ');
  }
  const welcomeText = welcome(rng, ctx);

  const recipe = {
    v: 1, seed, source: 'keywords', sentence: clean, name, intro: introText, welcome: welcomeText, medium,
    palette, terrain: { ...terrain, height: Math.min(1, terrain.height * (sizeMul > 1 ? 1.2 : 1)) },
    sky: { time, weather, clouds: rng.range(0.2, 0.7) },
    ambience: [...new Set(ambience)].slice(0, 3), scatter, landmarks, locals,
  };
  return sanitizeRecipe(recipe);
}

// More lines for a local once you've heard them all (offline version).
export function moreLinesOffline(recipe, localIndex, round = 1) {
  const local = recipe.locals[localIndex];
  const rng = new RNG(hashString(`${recipe.seed}:${localIndex}:${round}`));
  const ruler = recipe.locals.find((l) => l.ruler);
  const place = PLACES.find((p) => p.roles.includes(local.role));
  const ctx = {
    place: recipe.name, landmark: recipe.landmarks.map((l) => l.name), thing: place ? place.things : ['the weather', 'the view', 'the locals', 'the signs', 'visitors'],
    speciesSg: local.species === 'person' ? 'person' : local.species, speciesPl: plural(local.species === 'person' ? 'person' : local.species),
    role: local.role || 'resident', ruler: ruler?.name || null, rulerShort: ruler?.name || null,
    otherLocal: recipe.locals.filter((l) => l !== local).map((l) => l.name), weatherWord: 'weather', where: 'here', year: String(rng.int(1950, 1999)),
    timeWord: { dawn: 'morning', day: 'daytime', dusk: 'evening', night: 'night' }[recipe.sky.time], usedLines: new Set(local.lines),
  };
  const out = localLines(rng, ctx, !!local.ruler, 3);
  if (place && rng.chance(0.7)) out[0] = fill(rng.pick(place.lines), { ...ctx, n: String(rng.int(2, 60)) }, rng);
  return out;
}
