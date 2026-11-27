// Turns a recipe into a walkable scene: terrain, water, landmarks, scatter,
// colliders and the list of points of interest.
import * as THREE from 'three';
import { Terrain, HALF, WALK_R } from './terrain.js';
import { RNG } from '../gen/rng.js';
import { Geo } from '../kit/builder.js';
import { PROPS, PROP_MAIN } from '../kit/props.js';
import { LANDMARKS, LANDMARK_MAIN } from '../kit/landmarks.js';
import { SCATTER, LANDMARK_KINDS } from '../kit/catalog.js';
import { mix, darken, lighten, shiftHue, isHex } from '../kit/colors.js';
import { Materials } from './materials.js';

export function resolvePalette(p) {
  const out = { ...p };
  out.foliage2 = isHex(p.foliage2) ? p.foliage2 : shiftHue(p.foliage, 0.025, 0, -0.07);
  out.trunk = isHex(p.trunk) ? p.trunk : mix(darken(p.ground, 0.35), '#6b4a2f', 0.65);
  out.wood = isHex(p.wood) ? p.wood : mix('#8a6240', p.accent, 0.12);
  out.metal = isHex(p.metal) ? p.metal : mix('#5d6670', p.rock, 0.3);
  out.stone = isHex(p.stone) ? p.stone : mix(p.rock, '#c9c1b3', 0.45);
  out.plaster = isHex(p.plaster) ? p.plaster : mix('#efe6d4', p.accent, 0.08);
  out.glow = isHex(p.glow) ? p.glow : mix('#ffd98a', p.accent, 0.15);
  return out;
}

function propColors(pal, key, tint) {
  const P = { ...pal };
  P.main = isHex(tint) ? tint : isHex(key) ? key : (pal[key] || pal.foliage);
  return P;
}

class ColliderGrid {
  constructor(cell = 6) { this.cell = cell; this.map = new Map(); this.list = []; }
  key(i, j) { return i * 4096 + j; }
  add(x, z, r) {
    if (r <= 0) return;
    const c = { x, z, r };
    this.list.push(c);
    const i0 = Math.floor((x - r) / this.cell), i1 = Math.floor((x + r) / this.cell);
    const j0 = Math.floor((z - r) / this.cell), j1 = Math.floor((z + r) / this.cell);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const k = this.key(i, j);
      if (!this.map.has(k)) this.map.set(k, []);
      this.map.get(k).push(c);
    }
  }
  collide(pos, r) {
    const i = Math.floor(pos.x / this.cell), j = Math.floor(pos.z / this.cell);
    for (let a = i - 1; a <= i + 1; a++) for (let b = j - 1; b <= j + 1; b++) {
      const arr = this.map.get(this.key(a, b));
      if (!arr) continue;
      for (const c of arr) {
        const dx = pos.x - c.x, dz = pos.z - c.z, min = c.r + r;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 1e-4;
          pos.x = c.x + (dx / d) * min;
          pos.z = c.z + (dz / d) * min;
        }
      }
    }
  }
  near(x, z, r) {
    const i = Math.floor(x / this.cell), j = Math.floor(z / this.cell);
    for (let a = i - 1; a <= i + 1; a++) for (let b = j - 1; b <= j + 1; b++) {
      const arr = this.map.get(this.key(a, b));
      if (!arr) continue;
      for (const c of arr) if (Math.hypot(x - c.x, z - c.z) < c.r + r) return true;
    }
    return false;
  }
}

export function buildWorld(recipe, { quality = 'high' } = {}) {
  const rng = new RNG(recipe.seed);
  const pal = resolvePalette(recipe.palette);
  const group = new THREE.Group();
  group.name = 'world';
  const mats = new Materials();
  const animated = [];
  const critters = [];
  const colliders = new ColliderGrid();
  const segs = quality === 'low' ? 64 : 88;
  const terrain = new Terrain(recipe.terrain, pal, recipe.seed, { segments: segs, medium: recipe.medium });

  // --- layout: spawn + landmarks ---------------------------------------
  terrain.flatten(0, 0, 6);
  const lmRng = rng.fork('landmarks');
  const lms = recipe.landmarks || [];
  const baseAng = lmRng.range(0, Math.PI * 2);
  const placed = [];
  lms.forEach((lm, i) => {
    const meta = LANDMARK_KINDS[lm.kind] || { r: 3 };
    const scale = lm.scale ?? 1;
    const rad = meta.r * scale;
    let best = null, bestScore = -Infinity;
    for (let t = 0; t < 14; t++) {
      const ang = i === 0
        ? baseAng + lmRng.range(-0.25, 0.25)
        : baseAng + (i / lms.length) * Math.PI * 2 + lmRng.range(-0.45, 0.45);
      const dist = i === 0 ? lmRng.range(15, 19) : lmRng.range(19, 40);
      const x = Math.cos(ang) * dist, z = Math.sin(ang) * dist;
      let score = 0;
      const h = terrain.rawHeightAt(x, z);
      if (terrain.waterLevel > -1e5 && h < terrain.waterLevel + 0.2) score -= 4 + (terrain.waterLevel - h);
      for (const p of placed) { const d = Math.hypot(x - p.x, z - p.z) - p.rad - rad; if (d < 8) score -= (8 - d); }
      score -= Math.abs(terrain.slopeAt(x, z)) * 0.5;
      score += lmRng.range(0, 0.5);
      if (score > bestScore) { bestScore = score; best = { x, z }; }
    }
    const y = terrain.flatten(best.x, best.z, rad + 2.5, 0.8);
    placed.push({ ...best, y, rad, lm, meta, scale, index: i });
  });
  terrain.finalize();
  group.add(terrain.mesh);
  if (terrain.waterMesh) group.add(terrain.waterMesh);

  // --- landmarks ---------------------------------------------------------
  const lmGeo = new Geo(rng.fork('lmgeo').next);
  const pois = [];
  for (const p of placed) {
    const build = LANDMARKS[p.lm.kind] || LANDMARKS.tower;
    const local = new Geo(rng.fork(`lm${p.index}`).next);
    const P = propColors(pal, LANDMARK_MAIN[p.lm.kind] || 'stone', p.lm.tint);
    const anims = [];
    let board = null;
    const A = {
      spin: (geo, pivot, axis, speed) => anims.push({ type: 'spin', geo, pivot, axis, speed }),
      bob: (geo, pivot, amp, speed) => anims.push({ type: 'bob', geo, pivot, amp, speed }),
      billboard: (w, h, at) => { board = { w, h, at }; },
    };
    const info = build(local, rng.fork(`lmb${p.index}`), P, A) || { r: p.rad, h: 6 };
    // face the spawn point
    const ry = Math.atan2(-p.x, -p.z);
    p.ry = ry;
    lmGeo.merge(local, p.x, p.y, p.z, ry, p.scale);
    const cos = Math.cos(ry), sin = Math.sin(ry);
    const toWorld = (lx, lz) => [p.x + (lx * cos + lz * sin) * p.scale, p.z + (-lx * sin + lz * cos) * p.scale];
    if (info.colliders) {
      for (const c of info.colliders) { const [wx, wz] = toWorld(c.x, c.z); colliders.add(wx, wz, c.r * p.scale); }
    } else if (info.r > 0) colliders.add(p.x, p.z, info.r * p.scale);
    for (const a of anims) {
      const built = a.geo.build();
      const pivot = new THREE.Group();
      const [wx, wz] = toWorld(a.pivot[0], a.pivot[2]);
      pivot.position.set(wx, p.y + a.pivot[1] * p.scale, wz);
      pivot.rotation.y = ry;
      const inner = new THREE.Group();
      inner.scale.setScalar(p.scale);
      pivot.add(inner);
      if (built.solid) inner.add(new THREE.Mesh(built.solid, mats.solid));
      if (built.glow) inner.add(new THREE.Mesh(built.glow, mats.glow));
      group.add(pivot);
      animated.push({ ...a, obj: inner, base: inner.position.clone() });
    }
    pois.push({
      name: p.lm.name, sign: p.lm.sign, kind: p.lm.kind, x: p.x, y: p.y, z: p.z, r: p.rad, h: (info.h || 6) * p.scale, ry,
      scale: p.scale, board, creatureAt: info.creatureAt, creatureScale: info.creatureScale, colors: P,
    });
  }
  const lmBuilt = lmGeo.build();
  if (lmBuilt.solid) { const m = new THREE.Mesh(lmBuilt.solid, mats.solid); m.matrixAutoUpdate = false; group.add(m); }
  if (lmBuilt.glow) { const m = new THREE.Mesh(lmBuilt.glow, mats.glow); m.matrixAutoUpdate = false; group.add(m); }

  // --- scatter -------------------------------------------------------------
  const qScale = quality === 'low' ? 0.6 : 1;
  const scRng = rng.fork('scatter');
  const wl = terrain.waterLevel, hasWater = wl > -1e5;
  const blocked = (x, z, pad) => {
    if (Math.hypot(x, z) < 4.5 + pad) return true;
    for (const p of placed) if (Math.hypot(x - p.x, z - p.z) < p.rad + 1.5 + pad) return true;
    return false;
  };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const tmpC = new THREE.Color();
  let budget = quality === 'low' ? 900 : 1700;
  for (const entry of recipe.scatter || []) {
    const meta = SCATTER[entry.prop];
    const build = PROPS[entry.prop];
    if (!meta || !build) continue;
    const pr = scRng.fork(entry.prop);
    let count = Math.round(meta.max * Math.max(0, Math.min(1, entry.density ?? 0.5)) * qScale);
    if (meta.critter) {
      count = Math.min(count, 40);
      if (count > 0) critters.push(makeCritters(entry, meta, build, count, pr, propColors(pal, PROP_MAIN[entry.prop] || 'accent', entry.tint), terrain, mats, group));
      continue;
    }
    if (meta.place === 'water' || meta.place === 'shore') { if (!hasWater) continue; }
    count = Math.min(count, budget);
    if (count <= 0) continue;
    // 3 variants per prop for variety, each its own instanced mesh
    const variants = Math.min(3, Math.max(1, Math.ceil(count / 12)));
    const P = propColors(pal, PROP_MAIN[entry.prop] || 'foliage', entry.tint);
    const centers = [];
    for (let c = 0; c < 6; c++) centers.push([pr.range(-WALK_R, WALK_R), pr.range(-WALK_R, WALK_R)]);
    const spots = [[], [], []];
    let tries = 0, made = 0;
    const maxR = meta.big ? HALF - 6 : WALK_R + 4;
    while (made < count && tries < count * 14) {
      tries++;
      let x, z;
      if (meta.cluster && pr.chance(0.65)) {
        const c = pr.pick(centers), a = pr.range(0, Math.PI * 2), d = Math.abs(pr.range(-1, 1) * pr.range(0, 1)) * 14;
        x = c[0] + Math.cos(a) * d; z = c[1] + Math.sin(a) * d;
      } else { x = pr.range(-maxR, maxR); z = pr.range(-maxR, maxR); }
      const rr = Math.hypot(x, z);
      if (rr > maxR) continue;
      if (blocked(x, z, meta.big ? 1.5 : 0)) continue;
      const h = terrain.heightAt(x, z);
      let y = h;
      if (meta.place === 'water') { if (!hasWater || h > wl - 0.25) continue; y = wl + 0.03; }
      else if (meta.place === 'shore') { if (h < wl - 0.35 || h > wl + 0.9) continue; }
      else if (meta.place === 'float') { if (hasWater && h < wl) y = wl; y += pr.range(meta.lift?.[0] ?? 2, meta.lift?.[1] ?? 6); }
      else if (meta.place === 'land') { if (hasWater && h < wl + 0.12) continue; if (meta.big && terrain.slopeAt(x, z) > 1.1) continue; }
      if (meta.r > 0 && colliders.near(x, z, meta.r * 1.2)) continue;
      const s = pr.range(meta.scale[0], meta.scale[1]);
      spots[made % variants].push({ x, y, z, s, ry: pr.range(0, Math.PI * 2) });
      if (meta.r > 0 && rr < WALK_R + 2) colliders.add(x, z, meta.r * s);
      made++;
    }
    budget -= made;
    for (let v = 0; v < variants; v++) {
      const list = spots[v];
      if (!list.length) continue;
      const geo = new Geo(pr.fork(`v${v}`).next);
      build(geo, pr.fork(`b${v}`), P);
      const built = geo.build();
      for (const [g, mat] of [[built.solid, meta.sway ? mats.sway(meta.sway) : mats.solid], [built.glow, mats.glow]]) {
        if (!g) continue;
        const im = new THREE.InstancedMesh(g, mat, list.length);
        list.forEach((sp, k) => {
          q.setFromAxisAngle(up, sp.ry);
          im.setMatrixAt(k, m4.compose(pv.set(sp.x, sp.y, sp.z), q, sv.setScalar(sp.s)));
          const f = 0.9 + pr.range(0, 0.2);
          im.setColorAt(k, tmpC.setRGB(f, f, f));
        });
        im.instanceMatrix.needsUpdate = true;
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.computeBoundingSphere();
        im.name = entry.prop;
        group.add(im);
      }
    }
  }

  const spawnYaw = placed.length ? Math.atan2(-placed[0].x, -placed[0].z) : 0;

  return {
    recipe, group, terrain, pois, colliders, mats,
    spawn: { x: 0, z: 0, yaw: spawnYaw },
    waterLevel: terrain.waterLevel,
    heightAt: (x, z) => terrain.heightAt(x, z),
    collide: (pos, r) => colliders.collide(pos, r),
    update(dt, t) {
      mats.update(t);
      if (terrain.waterMesh) terrain.waterMesh.userData.uniforms.uTime.value = t;
      for (const c of critters) c.update(dt, t);
      for (const a of animated) {
        if (a.type === 'spin') a.obj.rotation[a.axis] += dt * a.speed;
        else if (a.type === 'bob') a.obj.position.y = a.base.y + Math.sin(t * a.speed) * a.amp;
      }
    },
    dispose() {
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      mats.dispose();
      terrain.waterMesh?.material.dispose();
      terrain.mesh?.material.dispose();
    },
  };
}

// Ambient creatures that move by themselves: birds circle, fish swim in loops,
// butterflies and fireflies flutter, jellyfish drift.
function makeCritters(entry, meta, build, count, pr, P, terrain, mats, group) {
  const geo = new Geo(pr.fork('geo').next);
  build(geo, pr.fork('b'), P);
  const built = geo.build();
  const meshes = [];
  for (const [g, mat] of [[built.solid, mats.solid], [built.glow, mats.glow]]) {
    if (!g) continue;
    const im = new THREE.InstancedMesh(g, mat, count);
    im.frustumCulled = false;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(im);
    meshes.push(im);
  }
  const wl = terrain.waterLevel;
  const kind = meta.critter;
  const items = [];
  const groups = kind === 'swim' ? Math.max(1, Math.round(count / 6)) : count;
  const centers = [];
  for (let i = 0; i < groups; i++) centers.push([pr.range(-WALK_R * 0.9, WALK_R * 0.9), pr.range(-WALK_R * 0.9, WALK_R * 0.9)]);
  for (let i = 0; i < count; i++) {
    const c = centers[i % groups];
    const cx = c[0] + (kind === 'swim' ? pr.range(-2, 2) : 0), cz = c[1] + (kind === 'swim' ? pr.range(-2, 2) : 0);
    const ground = Math.max(terrain.heightAt(cx, cz), wl > -1e5 ? wl : -1e9);
    const lift = pr.range(meta.lift?.[0] ?? 2, meta.lift?.[1] ?? 6);
    items.push({
      cx, cz, y0: ground + lift, ph: pr.range(0, Math.PI * 2), s: pr.range(meta.scale[0], meta.scale[1]),
      R: kind === 'fly' ? pr.range(6, 16) : kind === 'swim' ? pr.range(3, 7) : kind === 'drift' ? pr.range(1, 3) : pr.range(0.8, 2.5),
      w: (kind === 'fly' ? pr.range(0.25, 0.5) : kind === 'swim' ? pr.range(0.25, 0.45) : pr.range(0.3, 0.8)) * (pr.chance(0.5) ? 1 : -1),
    });
  }
  if (kind === 'swim') { // a school shares a direction
    for (let i = 0; i < count; i++) { const lead = items[i % groups]; items[i].w = lead.w; items[i].R = lead.R + pr.range(-0.8, 0.8); }
  }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
  return {
    update(dt, t) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        let x, y, z, ry, sx = it.s, sy = it.s;
        if (kind === 'flutter') {
          x = it.cx + Math.sin(t * it.w + it.ph) * it.R + Math.sin(t * 2.1 + it.ph * 3) * 0.4;
          z = it.cz + Math.cos(t * it.w * 0.8 + it.ph) * it.R + Math.cos(t * 1.7 + it.ph) * 0.4;
          y = it.y0 + Math.sin(t * 1.3 + it.ph) * 0.5;
          ry = t * it.w + it.ph;
          sx = it.s * (0.35 + 0.65 * Math.abs(Math.sin(t * 14 + it.ph)));
        } else if (kind === 'drift') {
          x = it.cx + Math.sin(t * 0.12 + it.ph) * it.R;
          z = it.cz + Math.cos(t * 0.1 + it.ph) * it.R;
          y = it.y0 + Math.sin(t * 0.6 + it.ph) * 0.8;
          ry = it.ph;
          sy = it.s * (0.9 + 0.12 * Math.sin(t * 2.2 + it.ph));
        } else {
          const a = it.ph + t * it.w;
          x = it.cx + Math.cos(a) * it.R; z = it.cz + Math.sin(a) * it.R;
          y = it.y0 + Math.sin(t * 0.9 + it.ph) * (kind === 'swim' ? 0.4 : 1.2);
          const dx = -Math.sin(a) * Math.sign(it.w), dz = Math.cos(a) * Math.sign(it.w);
          ry = Math.atan2(dx, dz);
          if (kind === 'fly') sx = it.s * (0.55 + 0.45 * Math.abs(Math.sin(t * 6 + it.ph)));
          else ry += Math.sin(t * 6 + it.ph) * 0.15;
        }
        e.set(0, ry, 0);
        q.setFromEuler(e);
        m.compose(pv.set(x, y, z), q, sv.set(sx, sy, it.s));
        for (const im of meshes) im.setMatrixAt(i, m);
      }
      for (const im of meshes) im.instanceMatrix.needsUpdate = true;
    },
  };
}
