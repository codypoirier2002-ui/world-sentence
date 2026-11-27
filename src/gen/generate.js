// The built-in generator: turns a sentence into a world recipe using keywords
// only (no network). Deterministic per sentence, so the same line always
// gives the same world, and "seed" lets you ask for a different take.
import { RNG, hashString } from './rng.js';
import { THEMES, THEME_BY_ID } from './themes.js';
import {
  CREATURES, SPECIES_LABEL, SPECIES_DEFAULT, MEDIUM_PHRASES, TIME_WORDS, WEATHER_WORDS, MOODS, COLORS,
  SHAPE_WORDS, WATER_WORDS, RULE_VERBS, STAFF_VERBS, STOPWORDS,
} from './lexicon.js';
import { cap, plural, singular, worldName, intro, welcome, landmarkName, signText, personName, firstName, localLines, RULER_TITLES } from './text.js';
import { sanitizeRecipe } from './recipe.js';
import { mix, shiftHue, lighten, darken, hexToRgb, rgbToHsl, hslToHex } from '../kit/colors.js';
import { SCATTER } from '../kit/catalog.js';

const WEAK = new Set(['sweet', 'sugary', 'haunted', 'spooky', 'creepy', 'cursed', 'ghostly', 'glowing', 'electric', 'retro', 'tropical', 'royal',
  'ancient', 'lost', 'forgotten', 'magical', 'enchanted', 'mystic', 'mystical', 'festive', 'sleepy', 'dreamy', 'whimsical', 'cold', 'icy',
  'frozen', 'snowy', 'fiery', 'burning', 'sandy', 'arid', 'cosmic', 'digital', 'virtual', 'musical', 'industrial', 'urban', 'lunar', 'alien',
  'polar', 'volcanic', 'botanical', 'party', 'star', 'stars', 'tree', 'fire', 'ash', 'sand', 'snow', 'ice', 'sky', 'cloud', 'clouds', 'magic',
  'machine', 'trick', 'harvest', 'cherry', 'blossom', 'temple', 'lantern', 'lanterns', 'book', 'books', 'hill', 'park', 'study', 'reading']);

export function tokenize(sentence) {
  const s = ` ${sentence.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  const words = s.trim().split(' ').filter(Boolean);
  const stems = words.map((w) => singular(w));
  return { text: s, words, stems };
}

const hasWord = (tk, w) => tk.words.includes(w) || tk.stems.includes(w);

function detectMedium(tk) {
  for (const [medium, phrases] of Object.entries(MEDIUM_PHRASES)) {
    for (const p of phrases) {
      if (p.includes(' ') ? tk.text.includes(` ${p} `) || tk.text.includes(` ${p}`) : hasWord(tk, p)) return medium;
    }
  }
  return null;
}

function scoreThemes(tk) {
  const scores = [];
  for (const th of THEMES) {
    let score = 0, first = Infinity, firstStrong = Infinity, hit = null;
    const words = new Set(th.words);
    tk.words.forEach((w, i) => {
      const st = tk.stems[i];
      if (words.has(w) || words.has(st)) {
        const weak = WEAK.has(w) || WEAK.has(st);
        score += weak ? 0.5 : 1;
        first = Math.min(first, i);
        if (!weak) firstStrong = Math.min(firstStrong, i);
        if (!weak && !hit) hit = st;
      }
    });
    for (const p of th.phrases || []) {
      const at = tk.text.indexOf(` ${p} `);
      if (at >= 0) { score += 1; const idx = tk.text.slice(0, at).trim().split(' ').filter(Boolean).length; first = Math.min(first, idx); firstStrong = Math.min(firstStrong, idx); }
    }
    if (score > 0) scores.push({ th, hit, first: firstStrong, score });
  }
  // the head noun ("a SWAMP ruled by frogs", "a VOLCANO with a gift shop") is usually the setting
  const head = Math.min(...scores.map((x) => x.first));
  for (const x of scores) if (x.first === head) x.score += 1.2;
  return scores.sort((a, b) => b.score - a.score);
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

function unknownNouns(tk, known) {
  const out = [];
  tk.words.forEach((w, i) => {
    const st = tk.stems[i];
    if (w.length < 3 || STOPWORDS.has(w) || STOPWORDS.has(st) || known.has(w) || known.has(st) || /^\d/.test(w)) return;
    if (/(ed|ing|ly|ous|ful|ish|ive|est|less|able|ible)$/.test(w)) return;
    out.push(st);
  });
  return out;
}

let KNOWN = null;
function knownWords() {
  if (KNOWN) return KNOWN;
  KNOWN = new Set();
  for (const th of THEMES) { th.words.forEach((w) => KNOWN.add(w)); (th.phrases || []).forEach((p) => p.split(' ').forEach((w) => KNOWN.add(w))); }
  for (const c of CREATURES) c.w.forEach((w) => KNOWN.add(w));
  for (const m of [TIME_WORDS, WEATHER_WORDS, SHAPE_WORDS, WATER_WORDS]) for (const l of Object.values(m)) l.forEach((w) => KNOWN.add(w));
  for (const m of Object.values(MOODS)) m.w.forEach((w) => KNOWN.add(w));
  Object.keys(COLORS).forEach((w) => KNOWN.add(w));
  [...RULE_VERBS, ...STAFF_VERBS].forEach((w) => KNOWN.add(w));
  for (const l of Object.values(MEDIUM_PHRASES)) l.forEach((p) => p.split(' ').forEach((w) => KNOWN.add(w)));
  return KNOWN;
}

function sentenceIs(sentence) {
  // "a swamp ruled by frogs" -> "a swamp ruled by frogs"; "swamp ruled by frogs" -> "a swamp ruled by frogs"
  let s = sentence.trim().replace(/[.!?\s]+$/, '');
  if (!s) return 'a place';
  s = s[0].toLowerCase() + s.slice(1);
  if (/^(a|an|the|my|our|your|some|one|two|three|this|that|every|no|his|her|their)\s/i.test(s)) return s;
  const firstWord = s.split(' ')[0];
  if (singular(firstWord) !== firstWord.toLowerCase() && !/(ss|us|is)$/.test(firstWord)) return `a place full of ${s}`;
  return `${/^[aeiou]/i.test(s) ? 'an' : 'a'} ${s}`;
}

function tintPalette(p, color, amt) {
  const out = { ...p };
  out.accent = color;
  out.foliage = mix(p.foliage, color, amt * 0.8);
  out.ground2 = mix(p.ground2, color, amt);
  out.ground = mix(p.ground, color, amt * 0.35);
  out.sky = mix(p.sky, color, amt * 0.45);
  out.horizon = mix(p.horizon, color, amt * 0.3);
  return out;
}

function desaturate(p, amt) {
  const out = {};
  for (const [k, v] of Object.entries(p)) {
    const [h, s, l] = rgbToHsl(hexToRgb(v));
    out[k] = hslToHex(h, s * (1 - amt), l);
  }
  return out;
}

export function generateRecipe(sentence, { variant = 0 } = {}) {
  const clean = String(sentence || '').replace(/\s+/g, ' ').trim().slice(0, 120) || 'a quiet place';
  const seed = hashString(`${clean.toLowerCase()}#${variant}`);
  const rng = new RNG(seed);
  const tk = tokenize(clean);
  const medium = detectMedium(tk);
  let scores = scoreThemes(tk);
  // phrases used for the medium shouldn't also pick the setting (e.g. "ocean floor")
  if (medium === 'underwater' && scores.length > 1) scores = scores.filter((s) => s.th.id !== 'beach' && s.th.id !== 'island' || s.score > 1);
  let theme = scores[0]?.th;
  if (!theme) {
    if (medium === 'underwater') theme = THEME_BY_ID.reef;
    else if (medium === 'space') theme = hasWord(tk, 'moon') ? THEME_BY_ID.moon : THEME_BY_ID.space;
    else if (medium === 'cavern') theme = THEME_BY_ID.cave;
    else if (medium === 'sky') theme = THEME_BY_ID.sky;
    else theme = rng.pick(['meadow', 'forest', 'village', 'fairy', 'dream', 'ruins', 'garden', 'island'].map((id) => THEME_BY_ID[id]));
  }
  const secondHit = scores.find((s) => s.th !== theme && s.score >= 0.5) || null;
  const second = secondHit?.th || null;

  // creatures, rulers and the unknown "key" noun (e.g. "soup")
  const creatures = detectCreatures(tk);
  const rule = detectRule(tk, creatures);
  const known = knownWords();
  const unknown = unknownNouns(tk, known).filter((w) => !creatures.some((c) => c.word === w));
  let key = unknown.length ? unknown[0].replace(/-/g, ' ') : null;
  if (!key && secondHit?.hit && ['food', 'candy', 'music', 'tech', 'holiday', 'halloween', 'library'].includes(secondHit.th.id)) key = secondHit.hit;

  // ---- terrain & palette
  const terrain = { ...theme.terrain };
  let palette = { ...theme.palette };
  let mediumOut = theme.medium || 'air';
  const shapeW = matchList(tk, SHAPE_WORDS);
  if (shapeW) terrain.shape = shapeW;
  const waterW = matchList(tk, WATER_WORDS);
  if (waterW && !(terrain.shape === 'islands' && waterW === 'none')) terrain.water = waterW;
  if (medium === 'underwater') {
    mediumOut = 'underwater'; terrain.water = 'none';
    if (theme.id !== 'reef') {
      palette = { ...palette, sky: '#0b4f7a', horizon: '#2b8fb0', water: '#1e7fa8', ground: mix(palette.ground, '#d9c48f', 0.45), ground2: mix(palette.ground2, '#bda874', 0.45) };
    }
  } else if (medium === 'space') {
    mediumOut = 'space';
    if (terrain.water !== 'none') terrain.water = 'none';
    if (!['moon', 'space'].includes(theme.id)) {
      palette = { ...palette, sky: '#05060f', horizon: '#1c1f33', ground: mix(palette.ground, '#a3a3ab', 0.6), ground2: mix(palette.ground2, '#8a8a93', 0.6) };
      if (terrain.shape === 'hills' || terrain.shape === 'flat') terrain.shape = hasWord(tk, 'moon') ? 'crater' : terrain.shape;
    }
  } else if (medium === 'cavern') {
    mediumOut = 'cavern';
    if (theme.id !== 'cave' && !theme.medium) palette = { ...palette, sky: '#1a1512', horizon: mix('#3a2f28', palette.horizon, 0.25) };
  } else if (medium === 'sky') {
    terrain.shape = 'islands'; terrain.water = 'none';
  }
  if (mediumOut === 'underwater' || mediumOut === 'space') terrain.water = 'none';

  // ---- time & weather
  let time = rng.pick(theme.time);
  const tw = matchList(tk, TIME_WORDS);
  if (tw) time = tw;
  let weather = rng.pick(theme.weather);
  const ww = matchList(tk, WEATHER_WORDS);
  if (ww) weather = ww;
  if (mediumOut === 'underwater') weather = 'bubbles';
  if (mediumOut === 'space' && ['rain', 'storm', 'snow', 'fog', 'sandstorm', 'leaves', 'petals', 'bubbles'].includes(weather)) weather = 'clear';
  let ambience = [...theme.ambience];

  // ---- moods
  let scatter = theme.scatter.map(([prop, density]) => ({ prop, density }));
  let sizeMul = 1, glowy = false;
  for (const [id, m] of Object.entries(MOODS)) {
    if (!m.w.some((w) => hasWord(tk, w))) continue;
    if (m.time && !tw) time = m.time;
    if (m.weather && !ww && mediumOut === 'air') weather = m.weather;
    if (m.amb && !ambience.includes(m.amb)) ambience.unshift(m.amb);
    if (id === 'abandoned' || id === 'spooky') ambience = ambience.filter((a) => a !== 'crowd');
    if (m.add) for (const [prop, d] of m.add) if (d > 0 && !scatter.some((s) => s.prop === prop)) scatter.push({ prop, density: d });
    if (m.size) sizeMul = m.size;
    if (m.desat) palette = desaturate(palette, m.desat);
    if (m.accent) palette.accent = m.accent;
    if (m.glow) { glowy = true; palette.glow = palette.glow || '#7ff6ff'; }
    if (id === 'spooky' && !palette.glow) palette.glow = '#b9f2ff';
  }
  if (mediumOut === 'underwater') {
    ambience = ['underwater', ...ambience.filter((a) => !['wind', 'birds', 'insects', 'frogs', 'waves'].includes(a))];
    for (const [prop, d] of [['kelp', 0.6], ['coral', 0.5], ['fish', 0.6], ['shell', 0.4]]) if (!scatter.some((s) => s.prop === prop)) scatter.unshift({ prop, density: d });
    scatter = scatter.filter((s) => !['bird', 'butterfly', 'bat', 'firefly', 'cloud_puff', 'balloon', 'floating_lantern', 'grass', 'flower', 'reed', 'lily_pad', 'umbrella'].includes(s.prop));
  } else if (mediumOut === 'space') {
    ambience = ambience.filter((a) => !['birds', 'insects', 'frogs', 'waves', 'wind'].includes(a));
    if (!ambience.length) ambience = ['eerie'];
    scatter = scatter.filter((s) => !['bird', 'butterfly', 'grass', 'flower', 'reed', 'lily_pad', 'cloud_puff', 'tree_round', 'tree_pine', 'bush'].includes(s.prop));
    for (const [prop, d] of [['rock', 0.5], ['crystal', 0.3]]) if (!scatter.some((s) => s.prop === prop)) scatter.push({ prop, density: d });
  } else if (mediumOut === 'cavern') {
    ambience = ['cave', ...ambience.filter((a) => !['wind', 'birds', 'waves'].includes(a))];
    scatter = scatter.filter((s) => !['bird', 'cloud_puff', 'balloon'].includes(s.prop));
    if (theme.id !== 'cave') for (const [prop, d] of [['crystal', 0.3], ['torch', 0.3]]) if (!scatter.some((s) => s.prop === prop)) scatter.push({ prop, density: d });
    time = 'night';
  }
  if (weather === 'snow' && terrain.ground === 'grass') { terrain.ground = 'snow'; palette.ground = mix(palette.ground, '#f1f5fa', 0.8); palette.ground2 = mix(palette.ground2, '#dce8f2', 0.8); }
  if (time === 'night' && !scatter.some((s) => ['lamp_post', 'lantern', 'torch', 'candle', 'firefly', 'floating_lantern'].includes(s.prop)) && mediumOut === 'air') {
    scatter.push({ prop: rng.pick(['lantern', 'firefly', 'lamp_post', 'torch']), density: 0.35 });
  }
  if (second) {
    for (const [prop, d] of rng.shuffle(second.scatter).slice(0, 3)) if (!scatter.some((s) => s.prop === prop)) scatter.push({ prop, density: d * 0.7 });
  }

  // ---- colours from words
  for (const w of tk.words) {
    const c = COLORS[w];
    if (!c) continue;
    if (c === 'rainbow') {
      scatter = scatter.map((s, i) => ({ ...s, tint: shiftHue('#ff5a5a', i / Math.max(1, scatter.length)) }));
      palette.accent = '#ff5ab8';
    } else if (c === 'pastel') {
      for (const k of Object.keys(palette)) palette[k] = lighten(palette[k], 0.3);
    } else {
      palette = tintPalette(palette, c, 0.45);
    }
    break;
  }

  // ---- de-duplicate and cap scatter
  const seen = new Set();
  scatter = scatter.filter((s) => SCATTER[s.prop] && !seen.has(s.prop) && seen.add(s.prop)).slice(0, 10);
  if (glowy) for (const s of scatter) if (['lamp_post', 'crystal', 'lantern'].includes(s.prop)) s.density = Math.min(1, s.density + 0.2);

  // ---- locals
  const dominant = rule?.creature || creatures[0] || null;
  const species = dominant ? dominant.c.sp : rng.pick(theme.species);
  const speciesSg = dominant ? dominant.word : SPECIES_LABEL[species];
  const speciesPl = plural(speciesSg);
  const ruled = rule?.kind === 'ruled';
  const staffed = rule?.kind === 'staffed';
  const nLocals = rng.int(3, 5);
  // "one very proud robot", "a lone ghost": only one of them
  const lone = dominant && dominant.index > 0 && ['one', 'single', 'lone', 'solitary', 'only'].some((q) => tk.words.slice(Math.max(0, dominant.index - 3), dominant.index).includes(q))
    && !['ruled', 'staffed'].includes(rule?.kind);
  const seaSpecies = ['fish', 'octopus', 'crab'];
  const generic = ['neighbourhood watch', 'local historian', 'professional bystander', 'self-appointed greeter', 'part-time philosopher', 'retiree'];
  const locals = [];
  const usedNames = new Set();
  const colorsFor = (c) => (c ? c.c : SPECIES_DEFAULT[species].c);
  const rulerFirst = firstName(rng);
  for (let i = 0; i < nLocals; i++) {
    let c = dominant?.c || null;
    let sp = species;
    // mix in other mentioned creatures, and the odd outsider
    if (i > 0 && creatures.length > 1 && i % 2 === 0) { const o = creatures[(i / 2) % creatures.length]; c = o.c; sp = o.c.sp; }
    else if (i > 0 && lone) { c = null; sp = rng.pick(theme.species.filter((x) => x !== dominant.c.sp)) || 'person'; }
    else if (!dominant && mediumOut === 'underwater' && theme.id !== 'reef' && rng.chance(0.5)) sp = rng.pick(seaSpecies);
    else if (i === nLocals - 1 && !dominant && rng.chance(0.5)) sp = rng.pick(theme.species);
    let name;
    do { name = personName(rng, rng.pick(theme.pre).toLowerCase()); } while (usedNames.has(name));
    usedNames.add(name);
    const isRuler = ruled && i === 0;
    const palC = colorsFor(c && c.sp === sp ? c : null);
    let color = rng.pick(palC);
    if (!c || c.sp !== sp) color = rng.pick(SPECIES_DEFAULT[sp].c);
    color = shiftHue(color, rng.range(-0.03, 0.03), 0, rng.range(-0.05, 0.05));
    let hat = c?.hat && c.sp === sp ? c.hat : rng.pick(['none', 'none', 'none', 'beanie', 'cap', 'bow', 'flower', 'top', 'party']);
    if (theme.id === 'fairy' && sp === 'person' && rng.chance(0.5)) hat = 'wizard';
    if (theme.id === 'factory' && sp === 'person') hat = 'hardhat';
    if (theme.id === 'wildwest' && sp === 'person') hat = 'cowboy';
    if (theme.id === 'pirate' && sp === 'person' && rng.chance(0.6)) hat = 'pirate';
    if (theme.id === 'food' && sp === 'person' && rng.chance(0.5)) hat = 'chef';
    if (theme.id === 'castle' && sp === 'person' && rng.chance(0.4)) hat = 'helmet';
    if (isRuler) hat = 'crown';
    const local = {
      name: isRuler ? `${rng.pick(RULER_TITLES)} ${rulerFirst}` : name,
      role: isRuler ? 'ruler of everything here' : staffed && i < 3 ? rng.pick([...theme.roles, 'assistant manager', 'shift supervisor', 'trainee']) : rng.pick([...theme.roles, ...generic]),
      species: sp, color, accent: (c && c.sp === sp ? c.a : SPECIES_DEFAULT[sp].a),
      hat, size: Math.max(0.6, Math.min(1.6, (isRuler ? 1.25 : rng.range(0.8, 1.15)) * sizeMul)),
      lines: [], ruler: isRuler || undefined,
    };
    if (sp === 'critter') local.variant = c?.v || rng.pick(['cat', 'dog', 'rabbit', 'mouse', 'pig', 'sheep']);
    locals.push(local);
  }
  const rulerLocal = locals.find((l) => l.ruler);

  // ---- landmarks
  let kinds = rng.shuffle(theme.landmarks.filter((k) => k !== 'monument' || dominant));
  if (ruled) kinds = ['throne', ...kinds.filter((k) => k !== 'throne')];
  if (dominant && !kinds.slice(0, 4).includes('monument') && rng.chance(ruled ? 0.8 : 0.4)) kinds.splice(1, 0, 'monument');
  if (second) { const k = rng.pick(second.landmarks); if (!kinds.slice(0, 3).includes(k)) kinds.splice(2, 0, k); }
  if (mediumOut === 'underwater') kinds = kinds.filter((k) => !['hot_air_balloon', 'campfire', 'volcano', 'windmill'].includes(k));
  kinds = [...new Set(kinds)];
  const nLm = Math.min(kinds.length, rng.int(3, 5));
  kinds = kinds.slice(0, nLm);
  const keyLandmark = key && !scores.length ? rng.pick(['shop', 'statue', 'monolith', 'billboard', 'kiosk']) : null;
  if (keyLandmark) kinds = [keyLandmark, ...kinds.filter((k) => k !== keyLandmark)].slice(0, Math.max(3, nLm));

  // ---- text
  const ctx = {
    key, keyBias: scores.length ? 0.4 : 0.85, pre: theme.pre, suf: theme.suf, things: key ? [...theme.things, key, plural(key)] : theme.things, roles: theme.roles,
    speciesSg, speciesPl, ruled, staffed, ruler: rulerLocal?.name || null, rulerShort: rulerLocal ? rulerFirst : null,
    thing: key ? [plural(key), ...theme.things] : theme.things, THING: (key || theme.things[0]).toUpperCase(),
    n: String(rng.int(3, 400)), nPoi: String(kinds.length),
    weatherWord: { clear: 'weather', cloudy: 'clouds', rain: 'rain', storm: 'storm', snow: 'snow', fog: 'fog', embers: 'ash', bubbles: 'bubbles', leaves: 'leaves', spores: 'spores', sandstorm: 'sand', petals: 'petals', sparkles: 'sparkles' }[weather],
    timeWord: { dawn: 'morning', day: 'daytime', dusk: 'evening', night: 'night' }[time],
  };
  const name = worldName(rng, theme, ctx);
  ctx.name = name; ctx.place = name;
  const landmarks = kinds.map((kind, i) => {
    const lmName = i === 0 && keyLandmark ? `The ${rng.pick(['Great', 'Last', 'Original', 'Famous', 'Municipal', 'Old'])} ${cap(key)}` : landmarkName(rng, kind, ctx);
    return { kind, name: lmName, scale: kind === 'monument' || kind === 'statue' ? Math.min(1.5, sizeMul) : Math.max(0.8, Math.min(1.4, sizeMul * rng.range(0.9, 1.1))) };
  });
  ctx.landmark = landmarks.map((l) => l.name);
  ctx.local = locals.map((l) => l.name.split(' ')[0]);
  for (const lm of landmarks) lm.sign = signText(rng, lm.kind, { ...ctx, NAME: lm.name });
  ctx.usedLines = new Set();
  locals.forEach((l, i) => {
    const others = locals.filter((o) => o !== l).map((o) => o.name);
    l.lines = localLines(rng, { ...ctx, role: l.role, otherLocal: others }, !!l.ruler, 3);
  });
  ctx.sentenceIs = sentenceIs(clean);
  const introText = intro(rng, { ...ctx, n: String(rng.int(12, 900)) });
  const welcomeText = welcome(rng, ctx);

  const recipe = {
    v: 1, seed, source: 'keywords', sentence: clean, name, intro: introText, welcome: welcomeText, medium: mediumOut,
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
  const ctx = {
    place: recipe.name, landmark: recipe.landmarks.map((l) => l.name), thing: ['the weather', 'the view', 'the locals', 'the signs', 'visitors'],
    speciesSg: local.species === 'person' ? 'person' : local.species, speciesPl: plural(local.species === 'person' ? 'person' : local.species),
    role: local.role || 'resident', ruler: ruler?.name || null, rulerShort: ruler?.name || null,
    otherLocal: recipe.locals.filter((l) => l !== local).map((l) => l.name), weatherWord: 'weather',
    timeWord: { dawn: 'morning', day: 'daytime', dusk: 'evening', night: 'night' }[recipe.sky.time], usedLines: new Set(),
  };
  return localLines(rng, ctx, !!local.ruler, 3);
}
