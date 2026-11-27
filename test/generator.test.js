import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRecipe, moreLinesOffline } from '../src/gen/generate.js';
import { sanitizeRecipe } from '../src/gen/recipe.js';
import { THEMES } from '../src/gen/themes.js';
import { SCATTER, LANDMARK_KINDS, SPECIES, AMBIENCES, WEATHERS, GROUNDS, SHAPES } from '../src/kit/catalog.js';
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
  const r = generateRecipe('a swamp ruled by frogs');
  assert.equal(moreLinesOffline(r, 1, 2).length, 3);
});
