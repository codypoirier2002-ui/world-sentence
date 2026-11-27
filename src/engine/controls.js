// First-person controls.
// Phone: left side = floating joystick, right side = drag to look, short tap = interact.
// Desktop: WASD / arrows, Shift to run, Space to hop, click to capture the mouse,
// click again (or E) to interact with whatever is under the crosshair.
import * as THREE from 'three';
import { WALK_R } from './terrain.js';

const EYE = 1.65;
const PLAYER_R = 0.45;

export class Controls {
  constructor(canvas, camera, ui) {
    this.canvas = canvas;
    this.camera = camera;
    this.ui = ui; // { joyBase, joyKnob, crosshair }
    this.enabled = false;
    this.yaw = 0; this.pitch = 0;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.vy = 0; this.airY = 0; this.grounded = true;
    this.keys = new Set();
    this.joy = { id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
    this.look = new Map(); // pointerId -> {x, y, t, sx, sy, moved}
    this.mouseDrag = null;
    this.world = null;
    this.onTap = null;
    this.onMoveStart = null;
    this.locked = false;
    this.swimming = false;
    this.bob = 0;
    this.stepDist = 0;
    this.onStep = null;
    this._bind();
  }

  setWorld(world, spawn) {
    this.world = world;
    this.pos.set(spawn.x, 0, spawn.z);
    this.yaw = spawn.yaw ?? 0; this.pitch = -0.04;
    this.vel.set(0, 0, 0); this.vy = 0; this.airY = 0;
    this._groundY = this._targetY();
    this.camera.position.set(this.pos.x, this._groundY, this.pos.z);
    this._applyRotation();
  }

  _bind() {
    const c = this.canvas;
    c.style.touchAction = 'none';
    c.addEventListener('pointerdown', (e) => this._down(e));
    window.addEventListener('pointermove', (e) => this._move(e));
    window.addEventListener('pointerup', (e) => this._up(e));
    window.addEventListener('pointercancel', (e) => this._up(e, true));
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if (!this.enabled || e.target.closest?.('input, textarea')) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
      if (k === ' ' && this.grounded && !this.swimming) { this.vy = 5.2; this.grounded = false; }
      if (k === 'e' || k === 'enter') this.onTap?.(window.innerWidth / 2, window.innerHeight / 2, true);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); this._resetJoy(); this.look.clear(); });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === c;
      this.ui.crosshair?.classList.toggle('on', this.locked);
    });
  }

  _down(e) {
    if (!this.enabled) return;
    if (e.pointerType === 'mouse') {
      if (this.locked) { this.onTap?.(window.innerWidth / 2, window.innerHeight / 2, true); return; }
      this.mouseDrag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false };
      return;
    }
    e.preventDefault();
    const leftZone = e.clientX < window.innerWidth * 0.45;
    if (leftZone && this.joy.id === null) {
      // keep the joystick ring fully on screen
      const x0 = Math.max(66, Math.min(window.innerWidth - 66, e.clientX));
      const y0 = Math.max(66, Math.min(window.innerHeight - 66, e.clientY));
      this.joy = { id: e.pointerId, x0, y0, dx: 0, dy: 0 };
      this._showJoy(true);
      this.onMoveStart?.();
    } else {
      this.look.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false });
    }
  }

  _move(e) {
    if (!this.enabled) return;
    if (e.pointerType === 'mouse') {
      if (this.locked) { this._rotate(e.movementX * 0.0024, e.movementY * 0.0024); return; }
      const d = this.mouseDrag;
      if (d) {
        this._rotate((e.clientX - d.x) * 0.005, (e.clientY - d.y) * 0.005);
        d.x = e.clientX; d.y = e.clientY;
        if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true;
      }
      return;
    }
    if (e.pointerId === this.joy.id) {
      let dx = e.clientX - this.joy.x0, dy = e.clientY - this.joy.y0;
      const max = 56, len = Math.hypot(dx, dy);
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      this.joy.dx = dx / max; this.joy.dy = dy / max;
      if (this.ui.joyKnob) this.ui.joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      return;
    }
    const l = this.look.get(e.pointerId);
    if (l) {
      const sens = 0.0062;
      this._rotate((e.clientX - l.x) * sens, (e.clientY - l.y) * sens * 0.85);
      l.x = e.clientX; l.y = e.clientY;
      if (Math.hypot(e.clientX - l.sx, e.clientY - l.sy) > 10) l.moved = true;
    }
  }

  _up(e, cancelled = false) {
    if (e.pointerType === 'mouse') {
      const d = this.mouseDrag;
      this.mouseDrag = null;
      if (!this.enabled || !d || cancelled) return;
      if (!d.moved && performance.now() - d.t < 400) {
        const hit = this.onTap?.(e.clientX, e.clientY, false);
        if (!hit && this.canvas.requestPointerLock && !matchMedia('(pointer: coarse)').matches) {
          try { const p = this.canvas.requestPointerLock(); p?.catch?.(() => {}); } catch { /* ignore */ }
        }
      }
      return;
    }
    if (e.pointerId === this.joy.id) { this._resetJoy(); return; }
    const l = this.look.get(e.pointerId);
    if (l) {
      this.look.delete(e.pointerId);
      if (!cancelled && this.enabled && !l.moved && performance.now() - l.t < 350) this.onTap?.(e.clientX, e.clientY, false);
    }
  }

  _resetJoy() {
    this.joy = { id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
    this._showJoy(false);
  }

  _showJoy(on) {
    const { joyBase, joyKnob } = this.ui;
    if (!joyBase) return;
    joyBase.classList.toggle('on', on);
    if (on) { joyBase.style.left = `${this.joy.x0}px`; joyBase.style.top = `${this.joy.y0}px`; }
    if (joyKnob) joyKnob.style.transform = 'translate(0px, 0px)';
  }

  _rotate(dx, dy) {
    this.yaw -= dx;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy, -1.35, 1.35);
    this._applyRotation();
  }

  _applyRotation() {
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  releaseLock() { if (document.pointerLockElement) document.exitPointerLock?.(); }

  _targetY() {
    const w = this.world;
    if (!w) return EYE;
    const g = w.heightAt(this.pos.x, this.pos.z);
    const wl = w.waterLevel;
    this.swimming = wl > -1e5 && g < wl - 0.9;
    return (this.swimming ? wl - 0.35 : g) + EYE;
  }

  update(dt) {
    if (!this.enabled || !this.world) return;
    let ix = 0, iz = 0;
    const k = this.keys;
    if (k.has('w') || k.has('arrowup')) iz -= 1;
    if (k.has('s') || k.has('arrowdown')) iz += 1;
    if (k.has('a') || k.has('arrowleft')) ix -= 1;
    if (k.has('d') || k.has('arrowright')) ix += 1;
    let mag = Math.hypot(ix, iz);
    if (mag > 1) { ix /= mag; iz /= mag; mag = 1; }
    let speed = k.has('shift') ? 9 : 5;
    if (this.joy.id !== null) {
      ix += this.joy.dx; iz += this.joy.dy;
      const jm = Math.min(1, Math.hypot(this.joy.dx, this.joy.dy));
      speed = 3 + jm * 4.5;
      mag = Math.min(1, Math.hypot(ix, iz));
      if (mag > 0.001) { const n = Math.hypot(ix, iz); ix = ix / n * mag; iz = iz / n * mag; }
    }
    if (this.swimming) speed *= 0.55;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const tx = (ix * cos + iz * sin) * speed, tz = (-ix * sin + iz * cos) * speed;
    const accel = mag > 0.01 ? 12 : 9;
    this.vel.x += (tx - this.vel.x) * Math.min(1, accel * dt);
    this.vel.z += (tz - this.vel.z) * Math.min(1, accel * dt);

    const ox = this.pos.x, oz = this.pos.z;
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    // steep slopes push back a little
    const h0 = this.world.heightAt(ox, oz), h1 = this.world.heightAt(this.pos.x, this.pos.z);
    const step = Math.hypot(this.pos.x - ox, this.pos.z - oz);
    if (step > 1e-4 && (h1 - h0) / step > 1.6 && !this.swimming) { this.pos.x = ox; this.pos.z = oz; }
    this.world.collide(this.pos, PLAYER_R);
    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > WALK_R) { this.pos.x *= WALK_R / r; this.pos.z *= WALK_R / r; }

    const target = this._targetY();
    // gravity / hop
    if (!this.grounded || this.vy > 0) {
      this.vy -= 14 * dt;
      this.airY += this.vy * dt;
      if (this.airY <= 0) { this.airY = 0; this.vy = 0; this.grounded = true; }
    }
    this._groundY += (target - this._groundY) * Math.min(1, dt * 12);
    const moving = Math.hypot(this.vel.x, this.vel.z);
    this.bob += moving * dt * 1.9;
    const bobY = this.swimming ? Math.sin(performance.now() * 0.002) * 0.08 : Math.sin(this.bob) * 0.045 * Math.min(1, moving / 4);
    this.camera.position.set(this.pos.x, this._groundY + this.airY + bobY, this.pos.z);
    this.stepDist += moving * dt;
    if (this.stepDist > 1.9 && this.grounded) { this.stepDist = 0; this.onStep?.(this.swimming); }
  }

  get moving() { return Math.hypot(this.vel.x, this.vel.z) > 0.3; }
}
