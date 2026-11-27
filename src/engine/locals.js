// The locals: 3-5 creatures who wander near the landmarks, look at you when
// you get close, and say a line when tapped.
import * as THREE from 'three';
import { Geo } from '../kit/builder.js';
import { buildCreature, GAITS, SPEEDS } from '../kit/creatures.js';
import { RNG } from '../gen/rng.js';
import { WALK_R } from './terrain.js';

const FLOATERS = new Set(['float']);

export class Locals {
  constructor(recipe, world, mats) {
    this.world = world;
    this.list = [];
    this.group = new THREE.Group();
    this.group.name = 'locals';
    this.shadowGeo = new THREE.CircleGeometry(0.5, 12).rotateX(-Math.PI / 2);
    this.shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
    const rng = new RNG(recipe.seed).fork('locals');
    const pois = world.pois;
    recipe.locals.forEach((data, i) => {
      const r = rng.fork(`l${i}`);
      const geo = new Geo(r.next);
      const info = buildCreature(geo, data, r.next);
      const built = geo.build();
      const body = new THREE.Group();
      if (built.solid) body.add(new THREE.Mesh(built.solid, mats.solid));
      if (built.glow) body.add(new THREE.Mesh(built.glow, mats.glow));
      const root = new THREE.Group();
      root.add(body);
      const size = data.size || 1;
      body.scale.setScalar(size);
      const shadow = new THREE.Mesh(this.shadowGeo, this.shadowMat);
      shadow.scale.setScalar(size * (data.species === 'crab' ? 1.5 : 1.1));
      shadow.renderOrder = 1;
      this.group.add(root, shadow);
      // home: the first local waits near the spawn to say hello
      let home;
      if (i === 0) {
        const yaw = world.spawn.yaw;
        home = { x: -Math.sin(yaw) * 6 + r.range(-2, 2), z: -Math.cos(yaw) * 6 + r.range(-2, 2) };
      } else {
        const p = pois[(i - 1) % Math.max(1, pois.length)] || { x: 0, z: 0, r: 2 };
        const a = r.range(0, Math.PI * 2), d = p.r + r.range(3, 6);
        home = { x: p.x + Math.cos(a) * d, z: p.z + Math.sin(a) * d };
      }
      const gait = GAITS[data.species] || 'trot';
      const l = {
        data, index: i, root, body, shadow, info, gait, size, home,
        speed: SPEEDS[gait] * (0.85 + r.range(0, 0.3)), rng: r,
        pos: new THREE.Vector3(home.x, 0, home.z), heading: r.range(0, Math.PI * 2),
        target: null, state: 'idle', timer: r.range(0.5, 3), lastProgress: 0, stuck: 0,
        lineIdx: 0, talkUntil: 0, hop: 0, phase: r.range(0, 10), fetching: false, fetches: 0,
        radius: 0.45 * size * (data.species === 'crab' ? 1.4 : 1),
      };
      this._settle(l);
      this.list.push(l);
    });
    world.group.add(this.group);
  }

  _settle(l) {
    const w = this.world;
    for (let k = 0; k < 8; k++) {
      if (this._okSpot(l, l.pos.x, l.pos.z)) return;
      l.pos.x = l.home.x + l.rng.range(-6, 6);
      l.pos.z = l.home.z + l.rng.range(-6, 6);
    }
    w.collide(l.pos, l.radius);
  }

  _okSpot(l, x, z) {
    const w = this.world;
    if (Math.hypot(x, z) > WALK_R - 2) return false;
    if (!FLOATERS.has(l.gait) && w.waterLevel > -1e5 && w.heightAt(x, z) < w.waterLevel + 0.1) return false;
    if (w.colliders.near(x, z, l.radius + 0.3)) return false;
    return true;
  }

  _pickTarget(l) {
    for (let k = 0; k < 10; k++) {
      const a = l.rng.range(0, Math.PI * 2), d = l.rng.range(2, 9);
      const x = l.home.x + Math.cos(a) * d, z = l.home.z + Math.sin(a) * d;
      if (this._okSpot(l, x, z)) return { x, z };
    }
    return { x: l.home.x, z: l.home.z };
  }

  groundY(l, x, z) {
    const w = this.world;
    const g = w.heightAt(x, z);
    if (FLOATERS.has(l.gait)) return Math.max(g, w.waterLevel > -1e5 ? w.waterLevel : g) + 0.35;
    return Math.max(g, w.waterLevel > -1e5 ? w.waterLevel - 0.2 : g);
  }

  update(dt, t, player) {
    for (const l of this.list) {
      const toPlayer = Math.hypot(player.x - l.pos.x, player.z - l.pos.z);
      let moving = 0;
      if (l.state === 'talk') {
        if (t > l.talkUntil) { l.state = 'idle'; l.timer = l.rng.range(1, 3); }
        this._face(l, Math.atan2(player.x - l.pos.x, player.z - l.pos.z), dt, 8);
      } else if (l.state === 'idle') {
        l.timer -= dt;
        if (toPlayer < 4.5) this._face(l, Math.atan2(player.x - l.pos.x, player.z - l.pos.z), dt, 3);
        if (l.timer <= 0) { l.target = this._pickTarget(l); l.state = 'walk'; l.stuck = 0; l.lastProgress = Infinity; }
      } else if (l.state === 'walk') {
        const dx = l.target.x - l.pos.x, dz = l.target.z - l.pos.z, d = Math.hypot(dx, dz);
        if (d < 0.35) { l.state = 'idle'; l.timer = l.rng.range(2, 6); }
        else {
          this._face(l, Math.atan2(dx, dz), dt, 4);
          // walk the way it's facing (so turns look natural), don't walk through the player
          const step = Math.min(d, l.speed * dt);
          const nx = l.pos.x + Math.sin(l.heading) * step, nz = l.pos.z + Math.cos(l.heading) * step;
          if (Math.hypot(player.x - nx, player.z - nz) > 1.1 + l.radius) { l.pos.x = nx; l.pos.z = nz; moving = 1; }
          this.world.collide(l.pos, l.radius);
          if (d < l.lastProgress - 0.05) { l.lastProgress = d; l.stuck = 0; } else l.stuck += dt;
          if (l.stuck > 2.5) { l.state = 'idle'; l.timer = l.rng.range(0.5, 2); }
        }
      }
      this._animate(l, t, dt, moving);
    }
  }

  _face(l, target, dt, rate) {
    let diff = target - l.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    l.heading += diff * Math.min(1, dt * rate);
  }

  _animate(l, t, dt, moving) {
    const p = l.phase + t;
    const gy = this.groundY(l, l.pos.x, l.pos.z);
    let y = 0, rz = 0, rx = 0, sy = 1, sxz = 1, yaw = l.heading;
    switch (l.gait) {
      case 'hop': { const h = Math.abs(Math.sin(p * 5)); y = moving ? h * 0.32 : 0; sy = moving ? 0.92 + h * 0.12 : 1 + Math.sin(p * 2) * 0.02; break; }
      case 'waddle': rz = moving ? Math.sin(p * 9) * 0.14 : Math.sin(p * 1.5) * 0.03; y = moving ? Math.abs(Math.sin(p * 9)) * 0.05 : 0; break;
      case 'float': y = 0.25 + Math.sin(p * 1.6) * 0.14; rz = Math.sin(p * 0.9) * 0.06; rx = moving ? 0.12 : 0; break;
      case 'glide': y = Math.sin(p * 3) * 0.01; rx = moving ? 0.06 : 0; break;
      case 'scuttle': y = moving ? Math.abs(Math.sin(p * 16)) * 0.04 : 0; if (l.data.species === 'crab') yaw += Math.PI / 2 * (moving ? 1 : 0.0); break;
      case 'stomp': y = moving ? Math.abs(Math.sin(p * 4)) * 0.08 : 0; rz = moving ? Math.sin(p * 4) * 0.06 : 0; break;
      case 'squish': { const s = Math.sin(p * (moving ? 8 : 2.5)); sy = 1 + s * (moving ? 0.12 : 0.04); sxz = 1 - s * (moving ? 0.06 : 0.02); y = moving ? Math.max(0, s) * 0.1 : 0; break; }
      default: y = moving ? Math.abs(Math.sin(p * 8)) * 0.07 : Math.sin(p * 2) * 0.01; rz = moving ? Math.sin(p * 8) * 0.04 : 0;
    }
    if (l.hop > 0) { l.hop = Math.max(0, l.hop - dt * 2.2); y += Math.sin(l.hop * Math.PI) * 0.45; }
    l.root.position.set(l.pos.x, gy + y, l.pos.z);
    l.root.rotation.set(rx, yaw, rz, 'YXZ');
    l.body.scale.set(l.size * sxz, l.size * sy, l.size * sxz);
    l.shadow.position.set(l.pos.x, Math.max(this.world.heightAt(l.pos.x, l.pos.z), this.world.waterLevel) + 0.04, l.pos.z);
  }

  // Player <-> locals: push the player out of their way.
  pushPlayer(pos, r) {
    for (const l of this.list) {
      const dx = pos.x - l.pos.x, dz = pos.z - l.pos.z, min = r + l.radius, d = Math.hypot(dx, dz);
      if (d < min && d > 1e-4) { pos.x = l.pos.x + (dx / d) * min; pos.z = l.pos.z + (dz / d) * min; }
    }
  }

  headPoint(l, out) {
    return out.set(l.pos.x, l.root.position.y + (l.info.top + 0.35) * l.size, l.pos.z);
  }

  hitSpheres() {
    return this.list.map((l) => ({
      type: 'local', ref: l,
      center: new THREE.Vector3(l.pos.x, l.root.position.y + l.info.top * l.size * 0.5, l.pos.z),
      radius: Math.max(0.7, l.info.top * l.size * 0.62),
    }));
  }

  startTalk(l, t) {
    l.state = 'talk';
    l.talkUntil = t + 6;
    l.hop = 1;
  }

  dispose() {
    this.shadowGeo.dispose();
    this.shadowMat.dispose();
    this.group.traverse((o) => { if (o.isMesh && o.geometry !== this.shadowGeo) o.geometry.dispose(); });
  }
}
