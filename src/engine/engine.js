// Renderer, scene graph, main loop and adaptive resolution.
import * as THREE from 'three';
import { Sky } from './sky.js';
import { Controls } from './controls.js';
import { Weather } from './weather.js';

export const IS_TOUCH = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export class Engine {
  constructor(canvas, ui) {
    this.canvas = canvas;
    const dpr = window.devicePixelRatio || 1;
    const weak = IS_TOUCH || (navigator.hardwareConcurrency || 4) <= 4;
    this.quality = weak ? 'low' : 'high';
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: !IS_TOUCH && dpr < 2, powerPreference: 'high-performance', alpha: false, stencil: false,
    });
    this.maxPR = Math.min(dpr, IS_TOUCH ? 1.6 : 1.25);
    this.minPR = Math.min(this.maxPR, 0.6);
    this.pr = this.maxPR;
    this.renderer.setPixelRatio(this.pr);
    this.renderer.setClearColor(0x0b0d14, 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(IS_TOUCH ? 72 : 68, 1, 0.1, 900);
    this.sky = new Sky(this.scene);
    this.weather = new Weather(this.scene, this.quality);
    this.onLightning = null;
    this._nextFlash = 0;
    this.controls = new Controls(canvas, this.camera, ui);
    this.world = null;
    this.mode = 'orbit'; // 'orbit' (title backdrop) | 'walk'
    this.orbitT = 0;
    this.listeners = new Set();
    this.timer = new THREE.Timer();
    this.timer.connect?.(document);
    this.time = 0;
    this._frames = []; this._lastAdjust = 0; this._lastDrop = -1e9;
    this.stats = { fps: 0, frameMs: 0 };

    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    window.visualViewport?.addEventListener('resize', this._resize);
    this.resize();
    this.renderer.setAnimationLoop(() => this._tick());
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = (w < h ? (IS_TOUCH ? 74 : 70) : (IS_TOUCH ? 68 : 66));
    this.camera.updateProjectionMatrix();
  }

  setWorld(world) {
    if (this.world) {
      this.scene.remove(this.world.group);
      this.world.dispose();
    }
    this.world = world;
    if (world) {
      this.scene.add(world.group);
      this.applyAtmosphere(world.recipe);
    }
  }

  applyAtmosphere(recipe) {
    this.sky.apply(recipe);
    this.weather.apply(recipe, this.world);
    this.renderer.setClearColor(this.sky.horizon || 0x000000, 1);
    this._nextFlash = this.time + 4 + Math.random() * 6;
  }

  walk(on) {
    this.mode = on ? 'walk' : 'orbit';
    this.controls.enabled = on;
    if (on && this.world) this.controls.setWorld(this.world, this.world.spawn);
    if (!on) this.controls.releaseLock();
  }

  onFrame(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  _orbit(dt) {
    this.orbitT += dt * 0.035;
    const w = this.world;
    const r = 36, a = this.orbitT;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const g = w ? Math.max(w.heightAt(x, z), w.waterLevel) : 0;
    this.camera.position.set(x, g + 13, z);
    this.camera.lookAt(0, (w ? w.heightAt(0, 0) : 0) + 2, 0);
  }

  _adapt(dt, now) {
    this._frames.push(dt);
    if (this._frames.length > 90) this._frames.shift();
    if (now - this._lastAdjust < 1.5 || this._frames.length < 60) return;
    const avg = this._frames.reduce((a, b) => a + b, 0) / this._frames.length;
    this.stats.frameMs = avg * 1000;
    this.stats.fps = 1 / avg;
    if (avg > 1 / 45 && this.pr > this.minPR) {
      this.pr = Math.max(this.minPR, this.pr * 0.85);
      this.renderer.setPixelRatio(this.pr); this.resize();
      this._lastAdjust = now; this._lastDrop = now; this._frames.length = 0;
    } else if (avg < 1 / 57 && this.pr < this.maxPR && now - this._lastDrop > 10) {
      this.pr = Math.min(this.maxPR, this.pr * 1.08);
      this.renderer.setPixelRatio(this.pr); this.resize();
      this._lastAdjust = now; this._frames.length = 0;
    }
  }

  _tick() {
    this.timer.update();
    const dt = Math.min(0.05, this.timer.getDelta());
    this.time += dt;
    if (this.mode === 'walk') this.controls.update(dt);
    else this._orbit(dt);
    if (this.world) this.world.update(dt, this.time, this.camera);
    this.sky.update(dt, this.time, this.camera, this.renderer.getPixelRatio());
    this.weather.update(this.time, this.camera, this.renderer);
    if (this.weather.kind === 'storm' && this.time > this._nextFlash) {
      this._nextFlash = this.time + 6 + Math.random() * 10;
      this.sky.lightning();
      this.onLightning?.();
    }
    for (const fn of this.listeners) fn(dt, this.time);
    this.renderer.render(this.scene, this.camera);
    this._adapt(dt, this.time);
  }

  // Grab a small JPEG of the current view (for the gallery).
  snapshot(w = 240, h = 150) {
    this.renderer.render(this.scene, this.camera);
    const src = this.renderer.domElement;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const sa = src.width / src.height, da = w / h;
    let sw = src.width, sh = src.height, sx = 0, sy = 0;
    if (sa > da) { sw = sh * da; sx = (src.width - sw) / 2; } else { sh = sw / da; sy = (src.height - sh) / 2; }
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
    try { return c.toDataURL('image/jpeg', 0.72); } catch { return null; }
  }
}
