import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRecipe, moreLinesOffline } from '../src/gen/generate.js';
import { sanitizeRecipe } from '../src/gen/recipe.js';
import { THEMES, THEME_BY_ID } from '../src/gen/themes.js';
import { PLACES } from '../src/gen/places.js';
import { MOODS, LANDMARK_WORDS, PROP_WORDS } from '../src/gen/lexicon.js';
import { HATS } from '../src/kit/catalog.js';
import { SCATTER, LANDMARK_KINDS, SPECIES, AMBIENCES, WEATHERS, GROUNDS, SHAPES, TIMES } from '../src/kit/catalog.js';
import { PROPS, PROP_MAIN } from '../src/kit/props.js';
import { LANDMARKS, LANDMARK_MAIN } from '../src/kit/landmarks.js';
import { buildWorld } from '../src/engine/world.js';

const SENTENCES = [
  'a swamp ruled by frogs', 'a mall at the bottom of the ocean', 'a haunted library run by owls', 'spoons', '',
  'a tiny moon with one very proud robot', 'a volcano with a gift shop', '<b>bold</b> forest', 'x'.repeat(500),
  'a cozy office inside a whale', 'an orchard on the dark side of a comet', 'a frozen village of retired snowmen',
];

test('every theme only uses ids that exist in the kit', () => {
  for (const th of THEMES) {
    for (const k of th.landmarks) assert.ok(LANDMARK_KINDS[k], `${th.id}: landmark ${k}`);
    for (const [p] of th.scatter) assert.ok(SCATTER[p], `${th.id}: scatter ${p}`);
    for (const s of th.species) assert.ok(SPECIES[s], `${th.id}: species ${s}`);
    for (const a of th.ambience) assert.ok(AMBIENCES.includes(a), `${th.id}: ambience ${a}`);
    for (const w of th.weather) assert.ok(WEATHERS.includes(w), `${th.id}: weather ${w}`);
    assert.ok(GROUNDS.includes(th.terrain.ground), `${th.id}: ground`);
    assert.ok(SHAPES[th.terrain.shape], `${th.id}: shape`);
  }
});

test('every place and mood only uses ids that exist in the kit', () => {
  for (const p of PLACES) {
    assert.ok(THEME_BY_ID[p.home], `${p.id}: home ${p.home}`);
    for (const k of [...p.landmarks, ...p.extra]) assert.ok(LANDMARK_KINDS[k], `${p.id}: landmark ${k}`);
    for (const [k] of p.props) assert.ok(SCATTER[k], `${p.id}: prop ${k}`);
    for (const sp of p.species) assert.ok(SPECIES[sp], `${p.id}: species ${sp}`);
    for (const h of p.hats) assert.ok(HATS.includes(h), `${p.id}: hat ${h}`);
    for (const a of p.ambience) assert.ok(AMBIENCES.includes(a), `${p.id}: ambience ${a}`);
    if (p.ground) assert.ok(GROUNDS.includes(p.ground), `${p.id}: ground`);
    if (p.time) assert.ok(TIMES.includes(p.time), `${p.id}: time`);
    assert.ok(p.nouns.length && p.pre.length && p.suf.length && p.roles.length && p.things.length, `${p.id}: text`);
  }
  for (const [id, m] of Object.entries(MOODS)) {
    for (const [k] of m.add || []) assert.ok(SCATTER[k], `${id}: prop ${k}`);
    if (m.weather) assert.ok(WEATHERS.includes(m.weather), `${id}: weather`);
    if (m.amb) assert.ok(AMBIENCES.includes(m.amb), `${id}: ambience`);
  }
  for (const k of Object.values(LANDMARK_WORDS)) assert.ok(LANDMARK_KINDS[k], `landmark word -> ${k}`);
  for (const k of Object.values(PROP_WORDS)) assert.ok(SCATTER[k], `prop word -> ${k}`);
});

test('every keyword combines: place + setting + creatures + mood + named things', () => {
  const kinds = (r) => r.landmarks.map((l) => l.kind), props = (r) => r.scatter.map((s) => s.prop);
  const moon = generateRecipe('a laundromat on the moon');
  assert.equal(moon.medium, 'space');
  assert.ok(kinds(moon).includes('laundromat'));
  assert.ok(props(moon).some((p) => ['washing_machine', 'sock', 'laundry_basket'].includes(p)));
  assert.match(moon.intro, /moon/);
  const sea = generateRecipe('a diner at the bottom of the ocean');
  assert.equal(sea.medium, 'underwater');
  assert.ok(kinds(sea).includes('diner'));
  const frogs = generateRecipe('a parking lot in a swamp ruled by frogs');
  assert.equal(frogs.terrain.water, 'swamp');
  assert.ok(kinds(frogs).includes('parking_booth') && kinds(frogs).includes('throne'));
  assert.ok(props(frogs).includes('parking_space'));
  assert.ok(frogs.locals.some((l) => l.ruler && l.species === 'frog'));
  const grave = generateRecipe('a bakery in a graveyard');
  assert.ok(kinds(grave).includes('bakery'));
  assert.ok(props(grave).includes('tombstone'));
  assert.ok(kinds(generateRecipe('a mysterious water tower')).includes('water_tower'));
  assert.ok(props(generateRecipe('a museum of lost socks')).includes('sock'));
  const school = generateRecipe('a school');
  assert.ok(kinds(school).includes('school'));
  assert.equal(school.terrain.road, true);
  const three = generateRecipe('a laundromat and a diner and a gas station on the moon');
  for (const k of ['laundromat', 'diner', 'gas_station']) assert.ok(kinds(three).includes(k), k);
  assert.equal(generateRecipe('a cozy laundromat at midnight').sky.time, 'night');
});

test('every catalog entry has a builder and a default colour', () => {
  for (const k of Object.keys(SCATTER)) { assert.ok(PROPS[k], `prop builder ${k}`); assert.ok(PROP_MAIN[k], `prop colour ${k}`); }
  for (const k of Object.keys(LANDMARK_KINDS)) { assert.ok(LANDMARKS[k], `landmark builder ${k}`); assert.ok(LANDMARK_MAIN[k], `landmark colour ${k}`); }
});

test('generator output is a valid, stable recipe', () => {
  for (const s of SENTENCES) {
    const r = generateRecipe(s);
    assert.deepEqual(sanitizeRecipe(structuredClone(r)), r, `idempotent: ${s.slice(0, 30)}`);
    assert.ok(r.landmarks.length >= 3 && r.landmarks.length <= 5, `landmarks: ${s.slice(0, 30)}`);
    assert.ok(r.locals.length >= 3 && r.locals.length <= 5, `locals: ${s.slice(0, 30)}`);
    assert.ok(r.name.length > 0 && r.intro.length > 0);
    const text = JSON.stringify(r);
    assert.ok(!/\{\w+\}|undefined|NaN|<|>/.test(text), `no template leftovers or markup: ${s.slice(0, 30)}`);
    assert.deepEqual(generateRecipe(s), r, 'deterministic');
  }
  assert.notEqual(generateRecipe('a swamp ruled by frogs', { variant: 1 }).seed, generateRecipe('a swamp ruled by frogs').seed);
});

test('keywords steer the world', () => {
  const swamp = generateRecipe('a swamp ruled by frogs');
  assert.equal(swamp.terrain.water, 'swamp');
  assert.ok(swamp.locals.some((l) => l.ruler && l.species === 'frog' && l.hat === 'crown'));
  assert.ok(swamp.landmarks.some((l) => l.kind === 'throne'));
  const mall = generateRecipe('a mall at the bottom of the ocean');
  assert.equal(mall.medium, 'underwater');
  assert.ok(mall.landmarks.some((l) => ['shop', 'escalator', 'kiosk'].includes(l.kind)));
  assert.ok(mall.scatter.some((s) => s.prop === 'kelp' || s.prop === 'coral'));
  assert.equal(generateRecipe('a pumpkin patch at midnight').sky.time, 'night');
  assert.equal(generateRecipe('a diner on the moon').medium, 'space');
});

test('sanitizer survives hostile input', () => {
  for (const bad of [null, undefined, 42, 'str', [], { palette: 'x', terrain: 5, scatter: 'no', locals: [{}], landmarks: [null] }]) {
    const r = sanitizeRecipe(bad);
    assert.equal(typeof r.name, 'string');
    assert.ok(Array.isArray(r.scatter) && Array.isArray(r.locals) && Array.isArray(r.landmarks));
  }
  const r = sanitizeRecipe({
    name: '<img src=x onerror=alert(1)>' + 'a'.repeat(300), seed: -5,
    palette: { sky: 'red', ground: '#12345G', water: '#abcdef' },
    terrain: { shape: 'cube', height: 99 }, sky: { time: 'noon', weather: 'lava' },
    scatter: [{ prop: 'tree_round', density: 5 }, { prop: 'tree_round' }, { prop: 'nuke' }],
    landmarks: [{ kind: 'castle', name: 'Fort', sign: 'x'.repeat(999) }, { kind: 'death_star', name: 'no' }],
    locals: [{ name: 'Bob', species: 'frog', hat: 'sombrero', size: 50, lines: ['hi', 7, ''] }],
  });
  assert.ok(!r.name.includes('<') && r.name.length <= 48);
  assert.equal(r.palette.sky, '#4e9fe3');
  assert.equal(r.palette.water, '#abcdef');
  assert.equal(r.terrain.shape, 'hills');
  assert.equal(r.terrain.height, 1);
  assert.equal(r.scatter.length, 1);
  assert.equal(r.scatter[0].density, 1);
  assert.equal(r.landmarks.length, 1);
  assert.ok(r.landmarks[0].sign.length <= 150);
  assert.equal(r.locals[0].hat, 'none');
  assert.equal(r.locals[0].size, 1.6);
  assert.deepEqual(r.locals[0].lines, ['hi']);
});

test('worlds build headlessly for every theme', () => {
  for (const th of THEMES) {
    const r = generateRecipe(`a ${th.words[0]}`);
    const w = buildWorld(r, { quality: 'low' });
    assert.ok(w.pois.length >= 3, th.id);
    assert.ok(Number.isFinite(w.heightAt(0, 0)));
    w.update(0.016, 1);
    w.dispose();
  }
  for (const p of PLACES) {
    const w = buildWorld(generateRecipe(`a ${p.words[0]} on the moon`), { quality: 'low' });
    assert.ok(w.pois.length >= 3, p.id);
    w.dispose();
  }
  const r = generateRecipe('a swamp ruled by frogs');
  assert.equal(moreLinesOffline(r, 1, 2).length, 3);
});
