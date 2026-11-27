// Scatter props: small things placed many times (instanced).
// Each builder draws one prop in local space, base at y = 0.
// P = resolved colours: main (tint or default), foliage, foliage2, trunk, rock,
// accent, ground, water, glow, metal, wood.
import { lighten, darken, mix } from './colors.js';

const TAU = Math.PI * 2;

export const PROPS = {
  tree_round(g, r, P) {
    const h = r.range(1.6, 2.4);
    g.cyl(0.16, 0.24, h, 5, P.trunk, 0, 0, 0);
    const f = P.main;
    g.ico(1.25, f, 0, h + 0.7, 0, { sy: 0.9 });
    g.ico(0.85, lighten(f, 0.08), r.range(-0.6, 0.6), h + 1.35, r.range(-0.5, 0.5));
    g.ico(0.7, darken(f, 0.08), r.range(-0.8, 0.8), h + 0.35, r.range(-0.7, 0.7));
  },
  tree_pine(g, r, P) {
    g.cyl(0.14, 0.2, 1.0, 5, P.trunk);
    const f = P.main;
    const tiers = r.int(3, 4);
    for (let i = 0; i < tiers; i++) {
      const w = 1.5 - i * 0.32;
      g.cone(w, 1.5, 6, i % 2 ? lighten(f, 0.05) : f, 0, 0.7 + i * 0.85, 0, { ry: i * 0.5 });
    }
  },
  tree_palm(g, r, P) {
    const h = r.range(3.2, 4.4), lean = r.range(0.1, 0.35);
    const segs = 5;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      g.cyl(0.15, 0.19, h / segs + 0.05, 5, i % 2 ? P.trunk : darken(P.trunk, 0.1), lean * t * t * 3, (h / segs) * i, 0, { rz: -lean * t });
    }
    const tx = lean * 3, ty = h;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU;
      g.box(0.5, 0.06, 2.1, i % 2 ? P.main : lighten(P.main, 0.08), tx + Math.cos(a) * 0.9, ty - 0.2, Math.sin(a) * 0.9, { ry: -a + Math.PI / 2, rx: 0.35 });
    }
    g.ico(0.22, P.trunk, tx + 0.15, ty - 0.25, 0.1);
    g.ico(0.2, darken(P.trunk, 0.15), tx - 0.1, ty - 0.3, -0.15);
  },
  tree_dead(g, r, P) {
    const h = r.range(2.2, 3.2);
    g.cyl(0.1, 0.24, h, 5, P.main);
    for (let i = 0; i < 4; i++) {
      const a = r.range(0, TAU), y = r.range(h * 0.45, h * 0.95), len = r.range(0.7, 1.3);
      g.cyl(0.03, 0.08, len, 4, P.main, Math.cos(a) * 0.1, y, Math.sin(a) * 0.1, { rz: Math.cos(a) * 0.9, rx: -Math.sin(a) * 0.9 });
    }
  },
  bush(g, r, P) {
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) g.ico(r.range(0.45, 0.75), i % 2 ? lighten(P.main, 0.06) : P.main, r.range(-0.5, 0.5), 0.35, r.range(-0.4, 0.4), { sy: 0.8 });
  },
  grass(g, r, P) {
    for (let i = 0; i < 5; i++) {
      const a = r.range(0, TAU), d = r.range(0, 0.25);
      g.cone(0.07, r.range(0.4, 0.7), 3, i % 2 ? P.main : lighten(P.main, 0.1), Math.cos(a) * d, 0, Math.sin(a) * d, { rx: r.range(-0.25, 0.25), rz: r.range(-0.25, 0.25) });
    }
  },
  flower(g, r, P) {
    for (let i = 0; i < 3; i++) {
      const x = r.range(-0.3, 0.3), z = r.range(-0.3, 0.3), h = r.range(0.35, 0.6);
      g.cyl(0.02, 0.02, h, 3, P.foliage2, x, 0, z);
      g.oct(0.11, i === 1 ? lighten(P.main, 0.15) : P.main, x, h + 0.04, z, { sy: 0.6 });
      g.ico(0.05, '#fff6b0', x, h + 0.09, z);
    }
  },
  rock(g, r, P) {
    g.dodec(r.range(0.35, 0.55), P.main, 0, 0.15, 0, { sy: r.range(0.6, 0.9), ry: r.range(0, 3) });
    if (r.chance(0.5)) g.dodec(0.22, lighten(P.main, 0.06), 0.45, 0.08, 0.1, { sy: 0.7 });
  },
  boulder(g, r, P) {
    g.ico(r.range(1.1, 1.6), P.main, 0, 0.5, 0, { sy: r.range(0.65, 0.9), ry: r.range(0, 3) });
    g.ico(0.7, darken(P.main, 0.06), 0.9, 0.2, 0.4, { sy: 0.7 });
  },
  mushroom(g, r, P) {
    const n = r.int(1, 3);
    for (let i = 0; i < n; i++) {
      const s = i === 0 ? 1 : r.range(0.45, 0.7), x = i ? r.range(-0.4, 0.4) : 0, z = i ? r.range(-0.4, 0.4) : 0;
      g.cyl(0.07 * s, 0.1 * s, 0.4 * s, 5, '#f1e6cf', x, 0, z);
      g.sphere(0.32 * s, P.main, x, 0.4 * s, z, { sy: 0.55, w: 7, h: 4 });
      g.ico(0.05 * s, '#ffffff', x + 0.12 * s, 0.55 * s, z + 0.08 * s);
    }
  },
  reed(g, r, P) {
    for (let i = 0; i < 4; i++) {
      const x = r.range(-0.3, 0.3), z = r.range(-0.3, 0.3), h = r.range(0.9, 1.5);
      g.cyl(0.025, 0.035, h, 3, P.main, x, 0, z, { rz: r.range(-0.12, 0.12) });
      if (i % 2 === 0) g.cyl(0.06, 0.06, 0.24, 5, P.trunk, x, h - 0.2, z);
    }
  },
  lily_pad(g, r, P) {
    g.cyl(0.55, 0.55, 0.04, 7, P.main, 0, 0, 0);
    if (r.chance(0.4)) { g.oct(0.13, '#ffd2ec', 0.15, 0.08, 0.1, { sy: 0.7 }); g.ico(0.05, '#fff6b0', 0.15, 0.14, 0.1); }
  },
  log(g, r, P) {
    const len = r.range(1.6, 2.4);
    g.cyl(0.26, 0.28, len, 6, P.main, -len / 2, 0.27, 0, { rz: Math.PI / 2 });
    g.cyl(0.2, 0.2, 0.02, 6, lighten(P.main, 0.25), len / 2 + 0.01, 0.27, 0, { rz: Math.PI / 2 });
  },
  fence(g, r, P) {
    for (let i = -1; i <= 1; i++) g.box(0.12, 1.0, 0.12, P.main, i * 1.0, 0, 0);
    g.box(2.2, 0.1, 0.06, lighten(P.main, 0.05), 0, 0.75, 0.06);
    g.box(2.2, 0.1, 0.06, lighten(P.main, 0.05), 0, 0.4, 0.06);
  },
  lamp_post(g, r, P) {
    g.cyl(0.07, 0.1, 2.6, 6, P.metal);
    g.cyl(0.18, 0.22, 0.1, 6, P.metal, 0, 0, 0);
    g.box(0.34, 0.4, 0.34, P.glow, 0, 2.6, 0, { glow: true });
    g.cone(0.32, 0.25, 4, P.metal, 0, 3.0, 0, { ry: Math.PI / 4 });
  },
  bench(g, r, P) {
    g.box(1.6, 0.08, 0.45, P.main, 0, 0.45, 0);
    g.box(1.6, 0.35, 0.06, P.main, 0, 0.6, -0.2, { rx: -0.15 });
    for (const x of [-0.65, 0.65]) g.box(0.08, 0.45, 0.4, P.metal, x, 0, 0);
  },
};

// Default colour key for each prop's "main" colour when no tint is given.
export const PROP_MAIN = {
  tree_round: 'foliage', tree_pine: 'foliage2', tree_palm: 'foliage', tree_dead: 'trunk', bush: 'foliage',
  grass: 'foliage', flower: 'accent', rock: 'rock', boulder: 'rock', mushroom: 'accent', reed: 'foliage2',
  lily_pad: 'foliage', log: 'trunk', fence: 'wood', lamp_post: 'metal', bench: 'wood',
};

export { mix };
