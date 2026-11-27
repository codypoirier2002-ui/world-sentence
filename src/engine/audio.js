// Procedural ambient sound with the Web Audio API: no sound files at all.
// Beds (wind, waves, frogs, muzak...) fade in per world; one-shots for talk
// blips, footsteps, discoveries and thunder.

const PENTA = [0, 2, 4, 7, 9];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try { this.muted = localStorage.getItem('ws-muted') === '1'; } catch { /* private mode */ }
    this.beds = [];
    this.timers = [];
    this.active = false;
  }

  // Must be called from a user gesture (iOS).
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const c = this.ctx;
      this.comp = c.createDynamicsCompressor();
      this.comp.threshold.value = -18;
      this.master = c.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.comp).connect(c.destination);
      const len = c.sampleRate * 2;
      this.noise = c.createBuffer(1, len, c.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('ws-muted', m ? '1' : '0'); } catch { /* ignore */ }
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.1);
  }

  // ---------------------------------------------------------------- building blocks
  _noiseSrc() { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; s.loopStart = Math.random(); s.start(); return s; }
  _filter(type, freq, q = 0.7) { const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; }
  _gain(v) { const g = this.ctx.createGain(); g.gain.value = v; return g; }
  _lfo(freq, depth, target) { const o = this.ctx.createOscillator(); o.frequency.value = freq; const g = this._gain(depth); o.connect(g).connect(target); o.start(); return o; }
  _pan(x) { const p = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null; if (p) p.pan.value = x; return p; }
  _every(min, max, fn) {
    const loop = () => { if (!this.active) return; fn(); this.timers.push(setTimeout(loop, (min + Math.random() * (max - min)) * 1000)); };
    this.timers.push(setTimeout(loop, Math.random() * max * 1000));
  }
  _tone({ freq, type = 'sine', dur = 0.2, vol = 0.1, attack = 0.005, at = 0, to = null, dest = null, pan = 0 }) {
    const c = this.ctx, t = c.currentTime + at;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = this._pan(pan);
    o.connect(g); if (p) g.connect(p).connect(dest || this.master); else g.connect(dest || this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  _burst({ dur = 0.1, vol = 0.1, type = 'bandpass', freq = 1000, q = 1, at = 0, dest = null }) {
    const c = this.ctx, t = c.currentTime + at;
    const s = c.createBufferSource(); s.buffer = this.noise; s.loopStart = Math.random();
    const f = this._filter(type, freq, q);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(dest || this.master);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  _bed(vol) {
    const g = this._gain(0.0001);
    g.connect(this.master);
    g.gain.setTargetAtTime(vol, this.ctx.currentTime, 1.2);
    const nodes = [];
    this.beds.push({ g, nodes });
    return { out: g, keep: (...n) => nodes.push(...n) };
  }

  // ---------------------------------------------------------------- beds
  wind(v = 0.32) { const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('lowpass', 420, 0.8); const g = this._gain(0.7); s.connect(f).connect(g).connect(b.out); b.keep(s, this._lfo(0.07, 260, f.frequency), this._lfo(0.05, 0.3, g.gain)); }
  rain(v = 0.26) { const b = this._bed(v); const s = this._noiseSrc(); const f1 = this._filter('highpass', 900); const f2 = this._filter('lowpass', 7000); s.connect(f1).connect(f2).connect(b.out); b.keep(s); this._every(0.05, 0.25, () => this._burst({ dur: 0.03, vol: 0.06, freq: 2500 + Math.random() * 3000, q: 4, dest: b.out })); }
  waves(v = 0.4) { const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('lowpass', 650); const g = this._gain(0.5); s.connect(f).connect(g).connect(b.out); b.keep(s, this._lfo(0.11, 0.45, g.gain), this._lfo(0.11, 300, f.frequency)); }
  water(v = 0.12) { const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('bandpass', 1300, 0.6); s.connect(f).connect(b.out); b.keep(s, this._lfo(3.1, 400, f.frequency)); this._every(0.3, 1.2, () => this._tone({ freq: 700 + Math.random() * 700, to: 1200 + Math.random() * 600, dur: 0.06, vol: 0.02, dest: b.out })); }
  underwater(v = 0.4) {
    const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('lowpass', 240); s.connect(f).connect(b.out); b.keep(s, this._lfo(0.08, 90, f.frequency));
    this._every(0.6, 2.4, () => { const n = 1 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) this._tone({ freq: 260 + Math.random() * 200, to: 700 + Math.random() * 500, dur: 0.09, vol: 0.05, at: i * 0.09, dest: b.out, pan: Math.random() * 1.4 - 0.7 }); });
  }
  birds(v = 0.5) {
    const b = this._bed(v);
    this._every(1.4, 5, () => {
      const base = 2200 + Math.random() * 1800, n = 2 + Math.floor(Math.random() * 5), pan = Math.random() * 1.6 - 0.8;
      for (let i = 0; i < n; i++) this._tone({ freq: base * (0.9 + Math.random() * 0.25), to: base * (1.2 + Math.random() * 0.4), dur: 0.07 + Math.random() * 0.05, vol: 0.05, type: 'sine', at: i * 0.11, dest: b.out, pan });
    });
  }
  insects(v = 0.3) {
    const b = this._bed(v);
    this._every(0.6, 1.6, () => { const f = 4200 + Math.random() * 900, pan = Math.random() * 1.6 - 0.8; for (let i = 0; i < 3; i++) this._tone({ freq: f, dur: 0.04, vol: 0.025, type: 'triangle', at: i * 0.06, dest: b.out, pan }); });
  }
  frogs(v = 0.55) {
    const b = this._bed(v);
    this._every(0.9, 3.5, () => {
      const f = 85 + Math.random() * 70, pan = Math.random() * 1.6 - 0.8, lp = this._filter('lowpass', 700, 4), p = this._pan(pan);
      if (p) lp.connect(p).connect(b.out); else lp.connect(b.out);
      for (let i = 0; i < 2; i++) this._tone({ freq: f, to: f * 1.25, dur: 0.12, vol: 0.12, type: 'sawtooth', at: i * 0.16, dest: lp });
    });
  }
  city(v = 0.3) {
    const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('lowpass', 160); s.connect(f).connect(b.out); b.keep(s);
    this._every(3, 9, () => { const c = this.ctx, t = c.currentTime; const n = this._noiseSrc(); const bp = this._filter('bandpass', 400, 2); const g = this._gain(0.0001); n.connect(bp).connect(g).connect(b.out); g.gain.exponentialRampToValueAtTime(0.08, t + 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8); bp.frequency.linearRampToValueAtTime(900, t + 2.8); setTimeout(() => n.stop(), 3000); });
    this._every(12, 30, () => { this._tone({ freq: 330, type: 'square', dur: 0.25, vol: 0.012, dest: b.out }); this._tone({ freq: 262, type: 'square', dur: 0.3, vol: 0.012, at: 0.28, dest: b.out }); });
  }
  crowd(v = 0.22) {
    const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('bandpass', 900, 0.8); const g = this._gain(0.4); s.connect(f).connect(g).connect(b.out); b.keep(s, this._lfo(5.3, 0.25, g.gain), this._lfo(2.1, 400, f.frequency));
    this._every(0.3, 1.2, () => this._tone({ freq: 160 + Math.random() * 160, to: 140 + Math.random() * 200, dur: 0.15, vol: 0.02, type: 'triangle', dest: b.out, pan: Math.random() * 1.6 - 0.8 }));
  }
  cave(v = 0.5) {
    const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('lowpass', 90); const g = this._gain(0.6); s.connect(f).connect(g).connect(b.out); b.keep(s);
    const delay = this.ctx.createDelay(1); delay.delayTime.value = 0.33; const fb = this._gain(0.42); delay.connect(fb).connect(delay); delay.connect(b.out);
    this._every(0.8, 3, () => this._tone({ freq: 900 + Math.random() * 900, to: 600 + Math.random() * 400, dur: 0.12, vol: 0.06, dest: delay, pan: Math.random() * 1.4 - 0.7 }));
  }
  machine(v = 0.3) {
    const b = this._bed(v); const c = this.ctx;
    for (const fr of [55, 110.5]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; const lp = this._filter('lowpass', 260); const g = this._gain(0.06); o.connect(lp).connect(g).connect(b.out); o.start(); b.keep(o); }
    this._every(1.1, 1.3, () => this._burst({ dur: 0.08, vol: 0.06, freq: 2200, q: 6, dest: b.out }));
  }
  eerie(v = 0.3) {
    const b = this._bed(v); const c = this.ctx; const lp = this._filter('lowpass', 900); lp.connect(b.out);
    for (const fr of [110, 116.5, 164.8]) { const o = c.createOscillator(); o.frequency.value = fr; const g = this._gain(0.05); o.connect(g).connect(lp); o.start(); b.keep(o, this._lfo(0.05 + Math.random() * 0.1, 3, o.frequency)); }
    this._every(6, 14, () => this._tone({ freq: midi(84 + PENTA[Math.floor(Math.random() * 5)]), dur: 2.5, vol: 0.02, attack: 0.6, dest: b.out, pan: Math.random() - 0.5 }));
  }
  fire(v = 0.35) {
    const b = this._bed(v); const s = this._noiseSrc(); const f = this._filter('lowpass', 220); const g = this._gain(0.4); s.connect(f).connect(g).connect(b.out); b.keep(s);
    this._every(0.03, 0.18, () => this._burst({ dur: 0.02 + Math.random() * 0.03, vol: 0.02 + Math.random() * 0.06, type: 'highpass', freq: 1800 + Math.random() * 2500, dest: b.out }));
  }
  muzak(v = 0.5) {
    const b = this._bed(v); const lp = this._filter('lowpass', 2400); lp.connect(b.out);
    const prog = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
    let i = 0;
    this._every(2.2, 2.2, () => {
      const ch = prog[i++ % prog.length];
      for (const n of ch) this._tone({ freq: midi(n), type: 'triangle', dur: 2.1, vol: 0.025, attack: 0.08, dest: lp });
      for (let k = 0; k < 4; k++) if (Math.random() < 0.7) this._tone({ freq: midi(72 + PENTA[Math.floor(Math.random() * 5)] + (Math.random() < 0.3 ? 12 : 0)), dur: 0.45, vol: 0.028, attack: 0.02, at: k * 0.55, dest: lp });
    });
  }
  chimes(v = 0.5) {
    const b = this._bed(v);
    this._every(1.5, 5, () => { const n = midi(76 + PENTA[Math.floor(Math.random() * 5)] + (Math.random() < 0.4 ? 12 : 0)), pan = Math.random() * 1.4 - 0.7; this._tone({ freq: n, dur: 2.2, vol: 0.035, dest: b.out, pan }); this._tone({ freq: n * 2.76, dur: 1.2, vol: 0.01, dest: b.out, pan }); });
  }

  // ---------------------------------------------------------------- world
  startWorld(recipe) {
    if (!this.ctx) return;
    this.stopWorld();
    this.active = true;
    const set = new Set(recipe.ambience || []);
    const w = recipe.sky.weather, time = recipe.sky.time, medium = recipe.medium;
    if (w === 'rain' || w === 'storm') { set.add('rain'); if (w === 'storm') set.add('wind'); }
    if (w === 'snow' || w === 'sandstorm' || w === 'fog') set.add('wind');
    if (medium === 'underwater') { set.delete('wind'); set.delete('birds'); set.delete('rain'); set.add('underwater'); }
    if (time === 'night' && medium === 'air' && set.has('birds')) { set.delete('birds'); set.add('insects'); }
    if (recipe.terrain.water === 'sea' && medium === 'air') set.add('waves');
    for (const k of set) if (typeof this[k] === 'function' && !['startWorld', 'stopWorld'].includes(k)) { try { this[k](); } catch { /* one bad bed shouldn't stop the rest */ } }
  }

  stopWorld() {
    this.active = false;
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const b of this.beds) {
      b.g.gain.setTargetAtTime(0.0001, now, 0.4);
      setTimeout(() => { for (const n of b.nodes) { try { n.stop?.(); } catch { /* already stopped */ } } b.g.disconnect(); }, 1600);
    }
    this.beds = [];
  }

  // ---------------------------------------------------------------- one-shots
  talk(local, line) {
    if (!this.ctx || this.muted) return;
    const base = { frog: 52, bird: 76, fish: 70, robot: 58, blob: 64, person: 60, critter: 66, bear: 48, bug: 80, snail: 62, ghost: 67, mushroom: 63, crab: 68, octopus: 55, golem: 43, snowman: 61, sprout: 72 }[local.species] || 62;
    const pitch = base - Math.round(((local.size || 1) - 1) * 10);
    const type = local.species === 'robot' ? 'square' : local.species === 'ghost' ? 'sine' : 'triangle';
    const n = Math.min(12, Math.max(3, Math.round(line.length / 7)));
    for (let i = 0; i < n; i++) {
      const f = midi(pitch + PENTA[Math.floor(Math.random() * 5)] - 2);
      this._tone({ freq: f, to: f * (0.92 + Math.random() * 0.2), type, dur: 0.07, vol: 0.06, at: i * 0.085 });
    }
  }
  step(swimming) {
    if (!this.ctx || this.muted) return;
    if (swimming) this._burst({ dur: 0.18, vol: 0.05, freq: 1200, q: 0.8 });
    else this._burst({ dur: 0.05, vol: 0.035, type: 'lowpass', freq: 500 + Math.random() * 300 });
  }
  found() {
    if (!this.ctx || this.muted) return;
    [72, 76, 79, 84].forEach((n, i) => this._tone({ freq: midi(n), dur: 0.5, vol: 0.05, at: i * 0.09 }));
  }
  thunder() {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = this._filter('lowpass', 160);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    s.connect(f).connect(g).connect(this.master);
    s.start(t); s.stop(t + 3.4);
  }
}
