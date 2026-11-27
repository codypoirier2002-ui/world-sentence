// Heightmap terrain: shape presets, water carving, flattening for landmarks,
// face-coloured low-poly mesh and an exact height lookup for walking.
import * as THREE from 'three';
import { makeNoise2D, fbm, ridged, smoothstep, lerp, clamp } from '../gen/noise.js';
import { RNG } from '../gen/rng.js';
import { col } from '../kit/builder.js';

export const HALF = 78;       // terrain spans -HALF..HALF
export const WALK_R = 54;     // the player stays inside this radius

const INDOOR = new Set(['tile', 'carpet', 'metal', 'wood']);

export class Terrain {
  constructor(spec, palette, seed, { segments = 88, medium = 'air' } = {}) {
    this.spec = spec;
    this.palette = palette;
    this.medium = medium;
    this.N = segments;
    this.size = HALF * 2;
    this.cell = this.size / this.N;
    this.rng = new RNG(seed).fork('terrain');
    this.noise = makeNoise2D(this.rng.int(1, 1e9));
    this.noise2 = makeNoise2D(this.rng.int(1, 1e9));
    this.noise3 = makeNoise2D(this.rng.int(1, 1e9));
    this.heights = new Float32Array((this.N + 1) * (this.N + 1));
    this.flats = [];
    this.waterLevel = -1e6;
    this.water = spec.water;
    if (medium === 'underwater') this.water = 'none';
    this._generate();
  }

  idx(i, j) { return j * (this.N + 1) + i; }
  gx(i) { return -HALF + i * this.cell; }

  _shapeHeight(x, z) {
    const { shape, height: a, roughness: ro } = this.spec;
    const n = this.noise, r = Math.hypot(x, z);
    const base = fbm(n, x * 0.018, z * 0.018, 4);
    const detail = fbm(this.noise2, x * 0.09, z * 0.09, 2) * (0.25 + ro * 1.1);
    let h;
    switch (shape) {
      case 'flat':
        h = base * (0.4 + a * 0.8) + detail * 0.35;
        break;
      case 'mountains': {
        const rg = ridged(n, x * 0.02 + 3.1, z * 0.02 - 1.7, 4);
        h = (rg * (10 + 16 * a) - 3) * (0.18 + smoothstep(8, 46, r)) + detail * 1.4;
        break;
      }
      case 'dunes': {
        const th = this.rng.fork('dune').range(0, Math.PI);
        const d = Math.sin((x * Math.cos(th) + z * Math.sin(th)) * 0.13 + base * 3.2);
        h = Math.pow(1 - Math.abs(d), 2) * (1.5 + 3.5 * a) + base * 1.8 + detail * 0.3;
        break;
      }
      case 'canyon': {
        const c = Math.abs(fbm(this.noise3, x * 0.012, z * 0.012, 3));
        h = smoothstep(0.06, 0.2, c) * (6 + 9 * a) + detail * 0.8 + base * 0.8;
        break;
      }
      case 'islands': {
        const f = 1 - smoothstep(16, 58, r + base * 14);
        h = f * (3 + 5 * a) + fbm(this.noise3, x * 0.05, z * 0.05, 3) * 2.2 * f - 3 + detail * f;
        break;
      }
      case 'crater': {
        const rim = Math.exp(-Math.pow((r - 36) / 9, 2)) * (5 + 7 * a);
        h = rim - (1 - smoothstep(0, 36, r)) * (1 + 2 * a) + base * 1.2 + detail * 0.6;
        break;
      }
      case 'terraces': {
        const raw = base * (4 + 8 * a) + detail * 0.5;
        const step = 1.5, fl = Math.floor(raw / step);
        h = fl * step + smoothstep(0.72, 1, raw / step - fl) * step;
        break;
      }
      case 'hills':
      default:
        h = base * (3 + 7 * a) + detail * 1.1;
        break;
    }
    // A natural rim so the world feels enclosed; fog hides what's beyond.
    if (shape !== 'islands') {
      const indoor = INDOOR.has(this.spec.ground);
      const e = indoor ? smoothstep(WALK_R + 3, WALK_R + 8, r) : smoothstep(WALK_R - 2, HALF, r);
      const bumps = 0.6 + 0.4 * fbm(this.noise3, x * 0.04, z * 0.04, 2);
      h += e * e * (indoor ? 9 : (9 + 10 * a) * bumps);
    }
    return h;
  }

  _generate() {
    const N = this.N, H = this.heights;
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) H[this.idx(i, j)] = this._shapeHeight(this.gx(i), this.gx(j));

    const sorted = Array.from(H).sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(clamp(p, 0, 1) * (sorted.length - 1))];
    const r = this.rng.fork('water');
    const shape = this.spec.shape;
    let water = this.water;
    if (shape === 'islands' && water !== 'none') water = 'sea';
    this.water = water;

    const carve = (fn) => {
      for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
        const k = this.idx(i, j);
        H[k] = fn(this.gx(i), this.gx(j), H[k]);
      }
    };

    if (water === 'lake') {
      // pick the lowest of a few candidate spots, so the lake sits in a dip
      let cx = 0, cz = 0, center = Infinity;
      for (let t = 0; t < 10; t++) {
        const ang = r.range(0, Math.PI * 2), dist = r.range(20, 32);
        const x = Math.cos(ang) * dist, z = Math.sin(ang) * dist, h = this._shapeHeight(x, z);
        if (h < center) { center = h; cx = x; cz = z; }
      }
      const rad = r.range(10, 15);
      this.waterLevel = Math.min(center + 0.4, pct(0.14));
      const floor = this.waterLevel - 2.6;
      carve((x, z, h) => {
        const d = Math.hypot(x - cx, z - cz) + fbm(this.noise3, x * 0.08, z * 0.08, 2) * 3;
        return lerp(h, Math.min(h, floor), smoothstep(rad + 5, rad * 0.35, d));
      });
      this.lake = { x: cx, z: cz, r: rad };
    } else if (water === 'river') {
      const amp = r.range(6, 14), f = r.range(0.04, 0.07), ph = r.range(0, 6.28);
      const off = r.sign() * r.range(14, 22), rot = r.range(0, Math.PI);
      const cr = Math.cos(rot), sr = Math.sin(rot);
      this.waterLevel = pct(0.3) - 0.2;
      const floor = this.waterLevel - 1.8, width = r.range(4, 6.5);
      carve((x, z, h) => {
        const u = x * cr + z * sr, v = -x * sr + z * cr;
        const c = off + amp * Math.sin(u * f + ph);
        const slope = amp * f * Math.cos(u * f + ph);
        const d = Math.abs(v - c) / Math.sqrt(1 + slope * slope);
        return lerp(h, Math.min(h, floor), smoothstep(width + 4, width * 0.45, d));
      });
      this.river = { amp, f, ph, off, cr, sr, width };
    } else if (water === 'sea') {
      if (shape === 'islands') {
        this.waterLevel = 0;
      } else {
        const th = r.range(0, Math.PI * 2), c = Math.cos(th), s = Math.sin(th);
        this.waterLevel = pct(0.18);
        const deep = this.waterLevel - 4;
        carve((x, z, h) => {
          const t = x * c + z * s + fbm(this.noise3, x * 0.03, z * 0.03, 2) * 7;
          return lerp(h, deep, smoothstep(12, 38, t));
        });
      }
    } else if (water === 'swamp') {
      // flatten the overall amplitude so pools spread out
      const mid = pct(0.5);
      carve((x, z, h) => (Math.hypot(x, z) < WALK_R ? mid + (h - mid) * 0.45 : h));
      const s2 = Array.from(H).sort((a, b) => a - b);
      this.waterLevel = s2[Math.floor(s2.length * 0.42)];
    }
    this.raw = H.slice();
  }

  // Flatten a disc (used for spawn and landmarks). Call before finalize().
  flatten(x, z, radius, minAboveWater = 0.8) {
    let h = this.rawHeightAt(x, z);
    if (this.waterLevel > -1e5) h = Math.max(h, this.waterLevel + minAboveWater);
    this.flats.push({ x, z, r: radius, h });
    return h;
  }

  // A gently curving road that passes beside the spawn point.
  addRoad(rng) {
    const th = rng.range(0, Math.PI * 2);
    const d = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
    const off0 = rng.sign() * rng.range(5.5, 7), amp = rng.range(2, 5), f = rng.range(0.03, 0.06), ph = rng.range(0, 6.28);
    const offAt = (t) => off0 + amp * Math.sin(t * f + ph) - amp * Math.sin(ph);
    // height profile along the road: raw heights, smoothed, kept above water
    const step = 2, ts = [], hs = [];
    for (let t = -HALF * 1.5; t <= HALF * 1.5; t += step) {
      const o = offAt(t), x = n[0] * o + d[0] * t, z = n[1] * o + d[1] * t;
      ts.push(t); hs.push(this.rawHeightAt(x, z));
    }
    const sm = hs.map((_, i) => { let s = 0, c = 0; for (let k = -4; k <= 4; k++) { const v = hs[i + k]; if (v !== undefined) { s += v; c++; } } return s / c; });
    const wl = this.waterLevel > -1e5 ? this.waterLevel + 0.5 : -1e9;
    this.road = { d, n, offAt, ts, hs: sm.map((h) => Math.max(h, wl)), step, half: 3.0 };
  }

  roadAt(x, z) {
    const R = this.road;
    if (!R) return null;
    const t = x * R.d[0] + z * R.d[1];
    const dist = x * R.n[0] + z * R.n[1] - R.offAt(t);
    const fi = (t - R.ts[0]) / R.step, i = Math.max(0, Math.min(R.hs.length - 2, Math.floor(fi))), u = Math.min(1, Math.max(0, fi - i));
    return { t, dist, h: R.hs[i] + (R.hs[i + 1] - R.hs[i]) * u };
  }
  roadDist(x, z) { const r = this.roadAt(x, z); return r ? Math.abs(r.dist) : Infinity; }

  finalize() {
    const N = this.N, H = this.heights;
    if (this.road) {
      for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
        const ra = this.roadAt(this.gx(i), this.gx(j));
        const w = smoothstep(7.5, 3.6, Math.abs(ra.dist));
        if (w > 0) { const k = this.idx(i, j); H[k] = lerp(H[k], ra.h, w); }
      }
    }
    for (const f of this.flats) {
      const R = f.r * 1.9;
      const i0 = Math.max(0, Math.floor((f.x - R + HALF) / this.cell)), i1 = Math.min(N, Math.ceil((f.x + R + HALF) / this.cell));
      const j0 = Math.max(0, Math.floor((f.z - R + HALF) / this.cell)), j1 = Math.min(N, Math.ceil((f.z + R + HALF) / this.cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const d = Math.hypot(this.gx(i) - f.x, this.gx(j) - f.z);
        const w = smoothstep(R, f.r, d);
        if (w > 0) { const k = this.idx(i, j); H[k] = lerp(H[k], f.h, w); }
      }
    }
    this.mesh = this._buildMesh();
    if (this.waterLevel > -1e5) this.waterMesh = this._buildWater();
    if (this.road) this.roadMesh = this._buildRoad();
  }

  _buildRoad() {
    const R = this.road, pos = [], colr = [];
    const asphalt = col('#3a3d42'), white = col('#e8e8e2'), yellow = col('#f2c21a');
    const cuts = [-3.0, -2.78, -0.1, 0.1, 2.78, 3.0];
    const at = (t, o) => {
      const off = R.offAt(t);
      const e = 0.5, t2 = t + e;
      const tx = R.d[0] * e + R.n[0] * (R.offAt(t2) - off), tz = R.d[1] * e + R.n[1] * (R.offAt(t2) - off);
      const len = Math.hypot(tx, tz), px = -tz / len, pz = tx / len;
      const cx = R.n[0] * off + R.d[0] * t, cz = R.n[1] * off + R.d[1] * t;
      const x = cx + px * o, z = cz + pz * o;
      return [x, this.heightAt(x, z) + 0.07, z];
    };
    const seg = 1.6;
    for (let t = -HALF * 1.45; t < HALF * 1.45; t += seg) {
      for (let k = 0; k < cuts.length - 1; k++) {
        const a = at(t, cuts[k]), b = at(t, cuts[k + 1]), c = at(t + seg, cuts[k]), d = at(t + seg, cuts[k + 1]);
        if (Math.hypot(a[0], a[2]) > HALF - 3 || Math.hypot(d[0], d[2]) > HALF - 3) continue;
        const dash = Math.floor(t / (seg * 2)) % 2 === 0;
        const cc = k === 0 || k === 4 ? white : k === 2 ? (dash ? yellow : asphalt) : asphalt;
        const f = 1 + (this.rng.float() - 0.5) * 0.05;
        for (const v of [a, c, b, b, c, d]) { pos.push(...v); colr.push(cc.r * f, cc.g * f, cc.b * f); }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
    g.computeVertexNormals();
    // keep the up-facing side visible whichever way the strip was wound
    const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    mesh.name = 'road';
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  _sample(H, x, z) {
    const fx = clamp((x + HALF) / this.cell, 0, this.N - 1e-4), fz = clamp((z + HALF) / this.cell, 0, this.N - 1e-4);
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
    const a = H[this.idx(i, j)], b = H[this.idx(i + 1, j)], c = H[this.idx(i, j + 1)], d = H[this.idx(i + 1, j + 1)];
    // matches the triangulation in _buildMesh (a,c,b) + (b,c,d)
    if (u + v <= 1) return a + (b - a) * u + (c - a) * v;
    return d + (c - d) * (1 - u) + (b - d) * (1 - v);
  }
  rawHeightAt(x, z) { return this._sample(this.raw, x, z); }
  heightAt(x, z) { return this._sample(this.heights, x, z); }
  slopeAt(x, z) {
    const e = 0.8;
    const dx = this.heightAt(x + e, z) - this.heightAt(x - e, z);
    const dz = this.heightAt(x, z + e) - this.heightAt(x, z - e);
    return Math.hypot(dx, dz) / (2 * e);
  }
  isWater(x, z, margin = 0) { return this.heightAt(x, z) < this.waterLevel + margin; }

  _buildMesh() {
    const N = this.N, H = this.heights, P = this.palette, cell = this.cell;
    const style = this.spec.ground;
    const ground = col(P.ground), ground2 = col(P.ground2), rock = col(P.rock), water = col(P.water);
    const shore = new THREE.Color().copy(ground).lerp(col(this.water === 'swamp' ? '#5b4a2f' : '#e2d29b'), 0.6);
    const bed = new THREE.Color().copy(ground).lerp(water, 0.5).multiplyScalar(0.65);
    const peak = col(P.peak || '#f4f6ff');
    const sorted = Array.from(H).sort((a, b) => a - b);
    const peakH = sorted[Math.floor(sorted.length * 0.93)];
    const pos = new Float32Array(N * N * 18), colr = new Float32Array(N * N * 18);
    const tmp = new THREE.Color();
    const rnd = this.rng.fork('mesh');
    let o = 0;
    const faceColor = (cx, cz, hAvg, slope, ci, cj) => {
      const lw = this.waterLevel;
      if (INDOOR.has(style) && Math.hypot(cx, cz) < WALK_R + 4) {
        if (style === 'tile') tmp.copy(((ci >> 1) + (cj >> 1)) % 2 ? ground : ground2);
        else if (style === 'wood') tmp.copy(ci % 6 === 0 ? ground2 : ground);
        else if (style === 'metal') tmp.copy((ci % 8 === 0 || cj % 8 === 0) ? ground2 : ground);
        else tmp.copy(ground).lerp(ground2, this.noise2(cx * 0.3, cz * 0.3) > 0.55 ? 0.6 : 0);
      } else {
        const patch = smoothstep(0.05, 0.35, this.noise3(cx * 0.045, cz * 0.045));
        if (style === 'lawn' && Math.hypot(cx, cz) < WALK_R) tmp.copy(ground).lerp(ground2, (cj >> 1) % 2 ? 0.55 : 0.1);
        else if (style === 'asphalt') tmp.copy(ground).lerp(ground2, patch * 0.4);
        else tmp.copy(ground).lerp(ground2, patch);
        if (slope > 0.75) tmp.lerp(rock, smoothstep(0.75, 1.2, slope));
        if (this.spec.shape === 'mountains' && hAvg > peakH) tmp.lerp(peak, 0.85);
      }
      if (lw > -1e5) {
        if (hAvg < lw - 0.15) tmp.copy(bed);
        else if (hAvg < lw + 0.45 && !INDOOR.has(style)) tmp.lerp(shore, 0.8);
      }
      const f = 1 + (rnd.float() - 0.5) * 0.08;
      tmp.r *= f; tmp.g *= f; tmp.b *= f;
      return tmp;
    };
    const tri = (x1, y1, z1, x2, y2, z2, x3, y3, z3, ci, cj) => {
      const cx = (x1 + x2 + x3) / 3, cz = (z1 + z2 + z3) / 3, hAvg = (y1 + y2 + y3) / 3;
      const ux = x2 - x1, uy = y2 - y1, uz = z2 - z1, vx = x3 - x1, vy = y3 - y1, vz = z3 - z1;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const slope = Math.hypot(nx, nz) / Math.max(1e-6, Math.abs(ny));
      const c = faceColor(cx, cz, hAvg, slope, ci, cj);
      pos.set([x1, y1, z1, x2, y2, z2, x3, y3, z3], o);
      colr.set([c.r, c.g, c.b, c.r, c.g, c.b, c.r, c.g, c.b], o);
      o += 9;
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x0 = this.gx(i), z0 = this.gx(j), x1 = x0 + cell, z1 = z0 + cell;
      const a = H[this.idx(i, j)], b = H[this.idx(i + 1, j)], c = H[this.idx(i, j + 1)], d = H[this.idx(i + 1, j + 1)];
      tri(x0, a, z0, x0, c, z1, x1, b, z0, i, j);
      tri(x1, b, z0, x0, c, z1, x1, d, z1, i, j);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    mesh.name = 'terrain';
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  _buildWater() {
    const g = new THREE.PlaneGeometry(HALF * 2.6, HALF * 2.6, 44, 44).rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({
      color: col(this.palette.water), transparent: true, opacity: this.water === 'swamp' ? 0.88 : 0.78,
      flatShading: true, depthWrite: false,
    });
    const uniforms = { uTime: { value: 0 } };
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
        transformed.y += sin(position.x * 0.35 + uTime * 1.3) * 0.09 + cos(position.z * 0.41 + uTime * 1.1) * 0.08;`);
    };
    const mesh = new THREE.Mesh(g, mat);
    mesh.position.y = this.waterLevel;
    mesh.renderOrder = 2;
    mesh.userData.uniforms = uniforms;
    mesh.name = 'water';
    return mesh;
  }
}
