// App flow: title -> building -> intro card -> walking -> back to title.
import { Engine, IS_TOUCH } from './engine/engine.js';
import { buildWorld } from './engine/world.js';
import { playBuildSequence, hideBuild } from './ui/building.js';
import { SAMPLE_WORLD } from './worlds/sample.js';
import { generateRecipe } from './gen/generate.js';
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
    this.current = null;
    this.busy = false;
    this._wireTitle();
    this.els.hudMenu.addEventListener('click', () => this.toTitle());
    this.els.introGo.addEventListener('click', () => this.startWalking());
    // backdrop for the title screen
    this.showBackdrop(SAMPLE_WORLD);
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
    return generateRecipe(sentence, { variant });
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

  openRecipe(input, { viaBuild = false } = {}) {
    const recipe = sanitizeRecipe(input);
    this.els.title.classList.remove('show');
    const world = buildWorld(recipe, { quality: this.engine.quality });
    this.engine.setWorld(world);
    this.engine.walk(false);
    this.current = { recipe, world };
    hideBuild(this.els.building);
    this.showIntro(recipe, world);
  }

  showIntro(recipe, world) {
    const { introName, introText, introFacts, introHint, intro, introEyebrow } = this.els;
    introEyebrow.textContent = 'you have arrived in';
    introName.textContent = recipe.name;
    introText.textContent = recipe.intro;
    introFacts.replaceChildren(...[
      `${world.pois.length} points of interest`,
      `${(recipe.locals || []).length} locals`,
      `${recipe.sky.time}, ${recipe.sky.weather}`,
    ].map((t) => Object.assign(document.createElement('li'), { textContent: t })));
    introHint.textContent = IS_TOUCH
      ? 'Left thumb to walk, right thumb to look. Tap things to talk to them.'
      : 'WASD to walk, click to look around with the mouse. Click things to talk to them.';
    intro.classList.add('show');
    this.els.introGo.focus({ preventScroll: true });
  }

  startWalking() {
    this.els.intro.classList.remove('show');
    this.els.hud.classList.add('show');
    this.els.hudName.textContent = this.current?.recipe.name || '';
    this.engine.walk(true);
  }

  toTitle() {
    this.engine.walk(false);
    this.els.hud.classList.remove('show');
    this.els.intro.classList.remove('show');
    this.els.title.classList.add('show');
    this.els.note.textContent = '';
  }
}
