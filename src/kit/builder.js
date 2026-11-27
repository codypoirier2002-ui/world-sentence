// A tiny geometry DSL for low-poly props. Every part is baked into one
// non-indexed BufferGeometry with flat normals and per-face vertex colors,
// so a whole prop (or a whole set of landmarks) renders in one draw call.
import * as THREE from 'three';

const primCache = new Map();
function prim(key, make) {
  let arr = primCache.get(key);
  if (!arr) {
    let g = make();
    if (g.index) g = g.toNonIndexed();
    arr = g.attributes.position.array.slice();
    g.dispose();
    primCache.set(key, arr);
  }
  return arr;
}

const colorCache = new Map();
export function col(c) {
  if (c && c.isColor) return c;
  const key = String(c);
  let out = colorCache.get(key);
  if (!out) {
    out = new THREE.Color();
    try { out.set(c); } catch { out.set('#ff00ff'); }
    colorCache.set(key, out);
  }
  return out;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _v = new THREE.Vector3();
const _c = new THREE.Color();

export class Geo {
  constructor(rng) {
    this.rng = rng || Math.random;
    this.solid = []; this.solidC = [];
    this.glow = []; this.glowC = [];
    this.stack = [new THREE.Matrix4()];
  }

  // Transform stack for sub-assemblies.
  push(x = 0, y = 0, z = 0, ry = 0, s = 1, rx = 0, rz = 0) {
    _e.set(rx, ry, rz);
    _q.setFromEuler(_e);
    const m = new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s.set(s, s, s));
    this.stack.push(this.top().clone().multiply(m));
    return this;
  }
  pop() { if (this.stack.length > 1) this.stack.pop(); return this; }
  top() { return this.stack[this.stack.length - 1]; }

  _matrix(x, y, z, o, sx = 1, sy = 1, sz = 1) {
    _e.set(o.rx || 0, o.ry || 0, o.rz || 0);
    _q.setFromEuler(_e);
    const s = o.s ?? 1;
    _s.set((o.sx ?? 1) * s * sx, (o.sy ?? 1) * s * sy, (o.sz ?? 1) * s * sz);
    _m.compose(_p.set(x, y, z), _q, _s);
    return _m.premultiply(this.top());
  }

  add(pos, color, m, o = {}) {
    const glow = !!o.glow;
    const P = glow ? this.glow : this.solid;
    const C = glow ? this.glowC : this.solidC;
    const base = col(color);
    const jitter = o.jitter ?? (glow ? 0 : 0.07);
    for (let i = 0; i < pos.length; i += 9) {
      const f = 1 + (this.rng() - 0.5) * 2 * jitter;
      _c.setRGB(Math.min(1, base.r * f), Math.min(1, base.g * f), Math.min(1, base.b * f));
      for (let k = 0; k < 9; k += 3) {
        _v.set(pos[i + k], pos[i + k + 1], pos[i + k + 2]).applyMatrix4(m);
        P.push(_v.x, _v.y, _v.z);
        C.push(_c.r, _c.g, _c.b);
      }
    }
    return this;
  }

  // Boxes, cylinders and cones sit on (x, y, z): y is the bottom.
  box(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
    return this.add(pos, color, this._matrix(x, y, z, o, w, h, d), o);
  }
  cyl(rTop, rBot, h, seg, color, x = 0, y = 0, z = 0, o = {}) {
    const rm = Math.max(rTop, rBot, 1e-4);
    const a = (rTop / rm).toFixed(2), b = (rBot / rm).toFixed(2);
    const key = `cyl:${a}:${b}:${seg}:${o.open ? 1 : 0}`;
    const pos = prim(key, () => new THREE.CylinderGeometry(+a, +b, 1, seg, 1, !!o.open).translate(0, 0.5, 0));
    return this.add(pos, color, this._matrix(x, y, z, o, rm, h, rm), o);
  }
  cone(r, h, seg, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim(`cone:${seg}`, () => new THREE.ConeGeometry(1, 1, seg).translate(0, 0.5, 0));
    return this.add(pos, color, this._matrix(x, y, z, o, r, h, r), o);
  }
  // Round things are centred on (x, y, z).
  sphere(r, color, x = 0, y = 0, z = 0, o = {}) {
    const w = o.w ?? 7, hh = o.h ?? 5;
    const pos = prim(`sph:${w}:${hh}`, () => new THREE.SphereGeometry(1, w, hh));
    return this.add(pos, color, this._matrix(x, y, z, o, r, r, r), o);
  }
  ico(r, color, x = 0, y = 0, z = 0, o = {}) {
    const d = o.detail ?? 0;
    const pos = prim(`ico:${d}`, () => new THREE.IcosahedronGeometry(1, d));
    return this.add(pos, color, this._matrix(x, y, z, o, r, r, r), o);
  }
  dodec(r, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim('dodec', () => new THREE.DodecahedronGeometry(1, 0));
    return this.add(pos, color, this._matrix(x, y, z, o, r, r, r), o);
  }
  oct(r, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim('oct', () => new THREE.OctahedronGeometry(1, 0));
    return this.add(pos, color, this._matrix(x, y, z, o, r, r, r), o);
  }
  tet(r, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim('tet', () => new THREE.TetrahedronGeometry(1, 0));
    return this.add(pos, color, this._matrix(x, y, z, o, r, r, r), o);
  }
  torus(R, r, color, x = 0, y = 0, z = 0, o = {}) {
    const rs = o.radial ?? 5, ts = o.tubular ?? 12, arc = o.arc ?? Math.PI * 2;
    const key = `tor:${(r / R).toFixed(3)}:${rs}:${ts}:${arc.toFixed(3)}`;
    const pos = prim(key, () => new THREE.TorusGeometry(1, r / R, rs, ts, arc));
    return this.add(pos, color, this._matrix(x, y, z, o, R, R, R), o);
  }
  // Triangular prism roof: ridge along x, base on y.
  roof(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim('roof', () => {
      const s = new THREE.Shape();
      s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.lineTo(-0.5, 0);
      return new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5).rotateY(Math.PI / 2);
    });
    return this.add(pos, color, this._matrix(x, y, z, o, w, h, d), o);
  }
  // A flat quad lying on y (for paths, rugs, puddles, water lilies).
  disc(r, seg, color, x = 0, y = 0, z = 0, o = {}) {
    const pos = prim(`disc:${seg}`, () => new THREE.CircleGeometry(1, seg).rotateX(-Math.PI / 2));
    return this.add(pos, color, this._matrix(x, y, z, o, r, 1, r), o);
  }
  lathe(points, seg, color, x = 0, y = 0, z = 0, o = {}) {
    const key = `lathe:${seg}:${points.map((p) => p.join(',')).join(';')}`;
    const pos = prim(key, () => new THREE.LatheGeometry(points.map(([a, b]) => new THREE.Vector2(a, b)), seg));
    return this.add(pos, color, this._matrix(x, y, z, o), o);
  }

  // Bake another builder's triangles into this one.
  merge(other, x = 0, y = 0, z = 0, ry = 0, s = 1) {
    _e.set(0, ry, 0); _q.setFromEuler(_e);
    const m = new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s.set(s, s, s)).premultiply(this.top());
    for (const [src, srcC, dst, dstC] of [[other.solid, other.solidC, this.solid, this.solidC], [other.glow, other.glowC, this.glow, this.glowC]]) {
      for (let i = 0; i < src.length; i += 3) {
        _v.set(src[i], src[i + 1], src[i + 2]).applyMatrix4(m);
        dst.push(_v.x, _v.y, _v.z);
        dstC.push(srcC[i], srcC[i + 1], srcC[i + 2]);
      }
    }
    return this;
  }

  get empty() { return this.solid.length === 0 && this.glow.length === 0; }

  static toGeometry(P, C) {
    if (!P.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    g.computeVertexNormals(); // non-indexed => flat faces
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }

  build() {
    return { solid: Geo.toGeometry(this.solid, this.solidC), glow: Geo.toGeometry(this.glow, this.glowC) };
  }
}
