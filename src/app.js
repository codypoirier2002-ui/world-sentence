// App flow: title -> building -> intro card -> walking -> back to title.
import * as THREE from 'three';
import { Engine, IS_TOUCH } from './engine/engine.js';
import { Hud } from './ui/hud.js';
import { Sound } from './engine/audio.js';
import { GalleryView } from './ui/gallery.js';
import { gallery, newId } from './store.js';
import { shareLink, decodeRecipe, readHashPayload } from './share.js';
import { buildWorld } from './engine/world.js';
import { playBuildSequence, hideBuild } from './ui/building.js';
import { SAMPLE_WORLD } from './worlds/sample.js';
import { generateRecipe, moreLinesOffline } from './gen/generate.js';
import { checkAI, aiStatus, aiWorld, aiLines } from './gen/ai.js';
import { hashString } from './gen/rng.js';
import { sanitizeRecipe } from './gen/recipe.js';

const $ = (id) => document.getElementById(id);

const PLACEHOLDERS = [
  'a swamp ruled by frogs',
  'a mall at the bottom of the ocean',
  'a desert where it only rains soup',
  'a haunted library run by owls',
  'a tiny moon with one very proud robot',
];

const DICE = [
  'a swamp ruled by frogs', 'a mall at the bottom of the ocean', 'a volcano with a gift shop',
  'a frozen village of retired snowmen', 'a forest where the mushrooms unionized', 'a sleepy moon base staffed by cats',
  'a candy kingdom in the middle of tax season', 'a graveyard where the ghosts run a book club',
  'a desert motel for lonely robots', 'a floating island of very serious pigeons', 'a neon city that never learned to sleep',
  'a beach where the crabs are in charge of lost property', 'an orchard on the dark side of a comet',
  'a misty canyon of philosophical goats', 'a factory that only makes clouds', 'a pumpkin patch at midnight',
];

export class App {
  constructor() {
    this.els = {
      title: $('title'), form: $('build-form'), input: $('sentence'), dice: $('dice'), build: $('build'), note: $('title-note'),
      openSample: $('open-sample'), openGallery: $('open-gallery'), galleryCount: $('gallery-count'),
      building: { screen: $('building'), sentenceEl: $('build-sentence'), stageEl: $('build-stage'), barEl: $('build-bar') },
      intro: $('intro'), introName: $('intro-name'), introText: $('intro-text'), introFacts: $('intro-facts'), introGo: $('intro-go'),
      introHint: $('intro-hint'), introEyebrow: $('intro-eyebrow'),
      hud: $('hud'), hudName: $('hud-name'), hudFound: $('hud-found'), hudMenu: $('hud-menu'),
    };
    this.engine = new Engine($('scene'), { joyBase: $('joy'), joyKnob: $('joy-knob'), crosshair: $('crosshair') });
    this.hud = new Hud();
    this.sound = new Sound();
    const unlock = () => this.sound.unlock();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    this.engine.controls.onStep = (swimming) => this.sound.step(swimming);
    this.engine.onLightning = () => setTimeout(() => this.sound.thunder(), 400 + Math.random() * 1400);
    const soundBtn = $('hud-sound');
    soundBtn.classList.toggle('off', this.sound.muted);
    soundBtn.addEventListener('click', () => { this.sound.unlock(); this.sound.setMuted(!this.sound.muted); soundBtn.classList.toggle('off', this.sound.muted); });
    $('hud-time').addEventListener('click', () => this.cycleTime());
    $('hud-share').addEventListener('click', () => this.share());
    this.galleryView = new GalleryView({ onOpen: (e) => this.openSaved(e), onClose: () => this.refreshCount() });
    this.els.openGallery.addEventListener('click', () => this.galleryView.show());
    this.refreshCount();
    window.addEventListener('hashchange', () => this.openFromHash());
    this.raycaster = new THREE.Raycaster();
    this.engine.controls.onTap = (x, y) => this.interact(x, y);
    this.engine.onFrame((dt, t) => this.frame(dt, t));
    this.current = null;
    this.busy = false;
    let saveTimer = 0;
    this.onRecipeChanged = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => this.saveNow(), 800); };
    window.addEventListener('pagehide', () => this.saveNow());
    this._wireTitle();
    this.els.hudMenu.addEventListener('click', () => this.toTitle());
    this.els.introGo.addEventListener('click', () => this.startWalking());
    // backdrop for the title screen (or straight into a shared world)
    this.showBackdrop(SAMPLE_WORLD);
    checkAI().then((st) => this.showAIChip(st));
    this.openFromHash();
  }

  refreshCount() {
    const n = gallery.count();
    this.els.galleryCount.textContent = n ? String(n) : '';
  }

  async openFromHash() {
    const payload = readHashPayload();
    if (!payload || this.busy) return;
    try {
      const shared = sanitizeRecipe(await decodeRecipe(payload));
      const existing = gallery.list().find((e) => e.recipe.seed === shared.seed && e.recipe.name === shared.name);
      if (existing) this.openSaved(existing);
      else this.openRecipe(shared, { shared: true });
    } catch {
      this.els.note.textContent = 'That world link didn\u2019t work. It may have been cut short when it was copied.';
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  openSaved(entry) {
    this.openRecipe(entry.recipe, { saved: entry });
  }

  saveNow() {
    const cur = this.current;
    if (!cur?.id) return;
    gallery.update(cur.id, { recipe: cur.recipe, name: cur.recipe.name, found: [...cur.found], total: cur.world.pois.length });
  }

  async share() {
    const cur = this.current;
    if (!cur) return;
    let url;
    try { url = await shareLink(cur.recipe); } catch { this.hud.toast(['Could not make a link for this world.']); return; }
    const title = cur.recipe.name;
    if (navigator.share && IS_TOUCH) {
      try { await navigator.share({ title, text: `${title}: ${cur.recipe.sentence}`, url }); return; } catch (e) { if (e?.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      this.hud.toast(['Link copied. Anyone who opens it gets ', title, '.']);
    } catch {
      window.prompt('Copy this link to share the world:', url);
    }
  }

  showAIChip(st) {
    const chip = $('ai-chip');
    if (!chip) return;
    chip.textContent = st.ai ? (st.remaining > 0 ? 'AI worlds on' : 'AI resting until tomorrow') : 'offline worlds';
    chip.title = st.ai ? 'Worlds are designed by Claude' : 'Worlds are built by the built-in generator';
    chip.classList.toggle('on', st.ai && st.remaining > 0);
  }

  _wireTitle() {
    const { form, input, dice, openSample } = this.els;
    let p = 0;
    this._phTimer = setInterval(() => {
      if (document.activeElement === input || input.value) return;
      p = (p + 1) % PLACEHOLDERS.length;
      input.placeholder = PLACEHOLDERS[p];
    }, 3200);
    dice.addEventListener('click', () => {
      let s;
      do { s = DICE[Math.floor(Math.random() * DICE.length)]; } while (s === input.value && DICE.length > 1);
      input.value = s;
      input.focus({ preventScroll: true });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = (input.value.trim() || input.placeholder || '').slice(0, 120);
      input.blur();
      this.buildFromSentence(s);
    });
    openSample.addEventListener('click', () => this.openRecipe(structuredClone(SAMPLE_WORLD)));
  }

  showBackdrop(recipe) {
    const world = buildWorld(sanitizeRecipe(recipe), { quality: this.engine.quality });
    this.engine.setWorld(world);
    this.engine.walk(false);
  }

  async makeRecipe(sentence) {
    // Building the same sentence twice gives a new take on it.
    const key = sentence.trim().toLowerCase();
    this.takes = this.takes || new Map();
    const variant = this.takes.get(key) ?? 0;
    this.takes.set(key, variant + 1);
    const base = generateRecipe(sentence, { variant });
    this.buildNote = '';
    if (!aiStatus().ai) return base;
    try {
      const ai = await aiWorld(sentence);
      return mergeAI(ai, base, hashString(`${sentence}:${Date.now()}`));
    } catch (err) {
      this.buildNote = err.capped ? err.message : err.refused ? 'The AI passed on this one, so it was built offline.' : `${err.message} Built offline instead.`;
      this.showAIChip(aiStatus());
      return base;
    }
  }

  async buildFromSentence(sentence) {
    if (this.busy || !sentence) return;
    this.busy = true;
    this.els.title.classList.remove('show');
    try {
      const recipe = await playBuildSequence(this.els.building, sentence, this.makeRecipe(sentence));
      this.openRecipe(recipe, { viaBuild: true });
    } catch (err) {
      console.error(err);
      hideBuild(this.els.building);
      this.els.title.classList.add('show');
      this.els.note.textContent = 'That one fell over. Try again?';
    } finally {
      this.busy = false;
    }
  }

  openRecipe(input, { viaBuild = false, saved = null, shared = false } = {}) {
    const recipe = sanitizeRecipe(input);
    this.els.title.classList.remove('show');
    this.galleryView?.el.classList.remove('show');
    const world = buildWorld(recipe, { quality: this.engine.quality });
    this.engine.setWorld(world);
    this.engine.walk(false);
    this.current = { recipe, world, found: new Set(saved?.found || []), hinted: !!saved, id: saved?.id || null };
    if (!saved && recipe.source !== 'handmade') {
      this.current.id = newId();
      gallery.save({ id: this.current.id, name: recipe.name, sentence: recipe.sentence, source: recipe.source, createdAt: Date.now(), recipe, found: [], total: world.pois.length, received: shared || undefined });
      this.refreshCount();
    }
    hideBuild(this.els.building);
    this.showIntro(recipe, world, saved ? 'welcome back to' : shared ? 'someone sent you to' : 'you have arrived in');
    // a thumbnail for the gallery, taken from the slow orbit behind the intro card
    if (this.current.id && !saved?.thumb) {
      const id = this.current.id;
      setTimeout(() => { if (this.current?.id === id) { const thumb = this.engine.snapshot(); if (thumb) gallery.update(id, { thumb }); } }, 700);
    }
  }

  showIntro(recipe, world, eyebrow = 'you have arrived in') {
    const { introName, introText, introFacts, introHint, intro, introEyebrow } = this.els;
    introEyebrow.textContent = eyebrow;
    introName.textContent = recipe.name;
    introText.textContent = recipe.intro;
    introFacts.replaceChildren(...[
      `${world.pois.length} points of interest`,
      `${(recipe.locals || []).length} locals`,
      `${recipe.sky.time}, ${recipe.sky.weather}`,
      recipe.source === 'ai' ? 'designed by Claude' : recipe.source === 'handmade' ? 'hand-made' : 'built offline',
    ].map((t) => Object.assign(document.createElement('li'), { textContent: t })));
    if (this.buildNote) introFacts.append(Object.assign(document.createElement('li'), { textContent: this.buildNote, className: 'warn' }));
    this.buildNote = '';
    introHint.textContent = IS_TOUCH
      ? 'Left thumb to walk, right thumb to look. Tap things to talk to them.'
      : 'WASD to walk, click to look around with the mouse. Click things to talk to them.';
    intro.classList.add('show');
    this.els.introGo.focus({ preventScroll: true });
  }

  startWalking() {
    this.els.intro.classList.remove('show');
    this.els.hud.classList.add('show');
    this.hud.setWorld(this.current?.recipe.name || '');
    this.hud.setFound(this.current.found.size, this.current.world.pois.length);
    this.engine.walk(true);
    this.sound.unlock();
    this.sound.startWorld(this.current.recipe);
  }

  cycleTime() {
    const cur = this.current;
    if (!cur) return;
    const order = ['dawn', 'day', 'dusk', 'night'];
    const next = order[(order.indexOf(cur.recipe.sky.time) + 1) % order.length];
    cur.recipe.sky.time = next;
    this.engine.applyAtmosphere(cur.recipe);
    this.sound.startWorld(cur.recipe);
    this.hud.toast(['It is now ', next, '.'], 1600);
    this.onRecipeChanged?.();
  }

  // ---------------------------------------------------------------- interaction
  interact(x, y) {
    if (!this.current || this.engine.mode !== 'walk') return false;
    const w = this.engine.world, cam = this.engine.camera;
    this.raycaster.setFromCamera(new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1), cam);
    const ray = this.raycaster.ray, sphere = new THREE.Sphere(), hitAt = new THREE.Vector3();
    const pad = IS_TOUCH ? 1.35 : 1.1;
    let best = null, bestD = Infinity;
    const test = (c) => {
      sphere.set(c.center, c.radius * pad);
      if (ray.intersectSphere(sphere, hitAt)) {
        const d = ray.origin.distanceTo(c.center);
        if (d < bestD && d < 32) { best = c; bestD = d; }
      }
    };
    for (const c of w.locals.hitSpheres()) test(c);
    for (const c of w.signs) test(c);
    if (!best) for (const p of w.pois) test({ type: 'poi', poi: p, center: new THREE.Vector3(p.x, p.y + p.h * 0.4, p.z), radius: Math.max(2.2, p.r) });
    if (!best) { this.hud.hideBubble(); return false; }
    if (best.type === 'local') this.talk(best.ref);
    else if (best.type === 'sign') this.hud.showSign(best.title, best.text, best.center);
    else this.hud.showSign(best.poi.name, best.poi.sign, best.center);
    return true;
  }

  talk(l) {
    const t = this.engine.time;
    this.engine.world.locals.startTalk(l, t);
    const lines = l.data.lines;
    if (l.lineIdx >= lines.length) {
      if (l.fetching) { this.hud.showBubble(l, '\u2026', t); return; }
      l.lineIdx = 0;
    }
    const line = lines[l.lineIdx++];
    this.hud.showBubble(l, line, t);
    this.sound?.talk(l.data, line);
    if (l.lineIdx >= lines.length - 1 && !l.fetching && l.fetches < 3) this.fetchMoreLines(l);
  }

  async fetchMoreLines(l) {
    const recipe = this.current?.recipe;
    if (!recipe) return;
    l.fetching = true;
    l.fetches++;
    let more = [];
    try {
      if (aiStatus().ai) more = await aiLines(recipe, l.data);
    } catch { /* fall through to offline lines */ }
    if (!more.length) more = moreLinesOffline(recipe, l.index, l.fetches);
    const seen = new Set(l.data.lines);
    l.data.lines.push(...more.filter((x) => x && !seen.has(x)).slice(0, 3));
    l.fetching = false;
    this.onRecipeChanged?.();
  }

  frame(dt, t) {
    if (this.engine.mode !== 'walk' || !this.current) return;
    const w = this.engine.world, p = this.engine.controls.pos, cur = this.current;
    this.hud.update(t, this.engine.camera, w.locals, p);
    for (const poi of w.pois) {
      if (cur.found.has(poi.name) || Math.hypot(p.x - poi.x, p.z - poi.z) > poi.r + 7) continue;
      cur.found.add(poi.name);
      this.hud.setFound(cur.found.size, w.pois.length);
      this.sound.found();
      if (cur.found.size === w.pois.length) {
        this.hud.toast(['Found ', poi.name, `. That\u2019s everything in ${cur.recipe.name}. Nothing happens. Well done.`], 5200);
      } else this.hud.toast(['Found ', poi.name, ` (${cur.found.size} of ${w.pois.length})`]);
      this.onRecipeChanged?.();
    }
    if (!cur.hinted) {
      const near = w.locals.list.find((l) => Math.hypot(p.x - l.pos.x, p.z - l.pos.z) < 5);
      if (near) { cur.hinted = true; this.hud.toast([IS_TOUCH ? 'Tap ' : 'Click ', near.data.name, ' to say hello.'], 3600); }
    }
  }

  toTitle() {
    this.saveNow();
    if (readHashPayload()) history.replaceState(null, '', window.location.pathname + window.location.search);
    this.refreshCount();
    this.sound.stopWorld();
    this.hud.hideBubble();
    this.hud.hideSign();
    this.engine.walk(false);
    this.els.hud.classList.remove('show');
    this.els.intro.classList.remove('show');
    this.els.title.classList.add('show');
    this.els.note.textContent = '';
  }
}

// Fill any gaps in an AI recipe from the offline one, so a world always has
// 3-5 landmarks and locals even if the model skimped.
export function mergeAI(ai, base, seed) {
  const r = sanitizeRecipe({ ...ai, seed, source: 'ai' }, base);
  for (const [k, min] of [['landmarks', 3], ['locals', 3]]) {
    for (const extra of base[k]) {
      if (r[k].length >= min) break;
      if (k === 'landmarks' && r[k].some((x) => x.kind === extra.kind)) continue;
      r[k].push(extra);
    }
  }
  if (r.scatter.length < 4) for (const s of base.scatter) if (r.scatter.length < 6 && !r.scatter.some((x) => x.prop === s.prop)) r.scatter.push(s);
  return r;
}
