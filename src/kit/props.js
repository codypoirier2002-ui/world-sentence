// Scatter props: small things placed many times (instanced).
// Each builder draws one prop in local space, base at y = 0, facing +z.
// P = resolved colours: main (tint or default), foliage, foliage2, trunk, rock,
// accent, ground, water, glow, metal, wood, stone, plaster.
import { lighten, darken, mix, shiftHue } from './colors.js';

const TAU = Math.PI * 2;

export const PROPS = {
  // ---------------------------------------------------------------- plants
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
  tree_willow(g, r, P) {
    const h = r.range(2.4, 3.0);
    g.cyl(0.2, 0.34, h, 6, P.trunk);
    g.sphere(1.7, P.main, 0, h + 0.5, 0, { sy: 0.55, w: 8, h: 5 });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + r.range(-0.1, 0.1), d = r.range(1.2, 1.6), len = r.range(1.4, 2.2);
      g.box(0.22, len, 0.08, i % 2 ? P.main : darken(P.main, 0.1), Math.cos(a) * d, h + 0.4 - len, Math.sin(a) * d, { ry: -a });
    }
  },
  tree_blob(g, r, P) {
    const h = r.range(1.8, 2.8);
    g.cyl(0.1, 0.13, h, 5, lighten(P.trunk, 0.35));
    g.sphere(r.range(0.9, 1.2), P.main, 0, h + 0.7, 0, { w: 9, h: 6 });
    g.torus(0.95, 0.1, lighten(P.main, 0.3), 0, h + 0.7, 0, { rx: Math.PI / 2, tubular: 10 });
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
  mushroom(g, r, P) {
    const n = r.int(1, 3);
    for (let i = 0; i < n; i++) {
      const s = i === 0 ? 1 : r.range(0.45, 0.7), x = i ? r.range(-0.4, 0.4) : 0, z = i ? r.range(-0.4, 0.4) : 0;
      g.cyl(0.07 * s, 0.1 * s, 0.4 * s, 5, '#f1e6cf', x, 0, z);
      g.sphere(0.32 * s, P.main, x, 0.4 * s, z, { sy: 0.55, w: 7, h: 4 });
      g.ico(0.05 * s, '#ffffff', x + 0.12 * s, 0.55 * s, z + 0.08 * s);
    }
  },
  mushroom_giant(g, r, P) {
    const h = r.range(3, 4.5);
    g.cyl(0.35, 0.5, h, 7, '#efe3c8');
    g.cyl(0.6, 0.45, 0.1, 7, '#e6d6b4', 0, h * 0.6, 0);
    g.sphere(2.1, P.main, 0, h, 0, { sy: 0.45, w: 9, h: 5 });
    for (let i = 0; i < 6; i++) {
      const a = r.range(0, TAU), d = r.range(0.4, 1.5);
      g.ico(0.22, '#fffaf0', Math.cos(a) * d, h + 0.85 - d * 0.28, Math.sin(a) * d);
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
  cactus(g, r, P) {
    const h = r.range(1.6, 2.6);
    g.cyl(0.28, 0.3, h, 7, P.main);
    g.sphere(0.28, P.main, 0, h, 0, { w: 7, h: 4 });
    for (const s of [-1, 1]) {
      if (r.chance(0.75)) {
        const y = r.range(0.6, h * 0.6), up = r.range(0.5, 0.9);
        g.cyl(0.16, 0.16, 0.45, 6, P.main, s * 0.45, y, 0, { rz: (s * Math.PI) / 2 });
        g.cyl(0.16, 0.16, up, 6, P.main, s * 0.62, y - 0.08, 0);
        g.sphere(0.16, P.main, s * 0.62, y + up - 0.08, 0, { w: 6, h: 3 });
      }
    }
    if (r.chance(0.4)) g.oct(0.12, '#ff7fa8', 0, h + 0.25, 0, { sy: 0.6 });
  },
  kelp(g, r, P) {
    for (let i = 0; i < 3; i++) {
      const x = r.range(-0.4, 0.4), z = r.range(-0.4, 0.4), h = r.range(2.2, 4.2), segs = 5;
      for (let k = 0; k < segs; k++) {
        g.box(0.28, h / segs + 0.05, 0.05, k % 2 ? P.main : lighten(P.main, 0.08), x + Math.sin(k * 1.3) * 0.12, (h / segs) * k, z, { ry: k * 0.7 + i });
      }
    }
  },
  coral(g, r, P) {
    const n = r.int(3, 6);
    const c2 = shiftHue(P.main, 0.08, 0, 0.05);
    for (let i = 0; i < n; i++) {
      const a = r.range(0, TAU), h = r.range(0.4, 1.2);
      g.cyl(0.06, 0.12, h, 5, i % 2 ? P.main : c2, Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, { rz: Math.cos(a) * 0.5, rx: -Math.sin(a) * 0.5 });
      g.ico(0.13, lighten(i % 2 ? P.main : c2, 0.15), Math.cos(a) * (0.2 + h * 0.45), h * 0.9, Math.sin(a) * (0.2 + h * 0.45));
    }
    if (r.chance(0.5)) g.sphere(0.4, darken(P.main, 0.1), 0.5, 0.15, 0.2, { sy: 0.6, w: 6, h: 4 });
  },
  vine_arch(g, r, P) {
    const w = r.range(2, 3);
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, a = t * Math.PI;
      g.ico(0.28, i % 2 ? P.main : darken(P.main, 0.12), -Math.cos(a) * w, Math.sin(a) * 2.6, 0);
    }
    for (let i = 0; i < 4; i++) g.box(0.06, r.range(0.6, 1.4), 0.06, P.foliage2, r.range(-w * 0.6, w * 0.6), r.range(0.8, 1.6), 0);
  },
  // ---------------------------------------------------------------- rocks & minerals
  rock(g, r, P) {
    g.dodec(r.range(0.35, 0.55), P.main, 0, 0.15, 0, { sy: r.range(0.6, 0.9), ry: r.range(0, 3) });
    if (r.chance(0.5)) g.dodec(0.22, lighten(P.main, 0.06), 0.45, 0.08, 0.1, { sy: 0.7 });
  },
  boulder(g, r, P) {
    g.ico(r.range(1.1, 1.6), P.main, 0, 0.5, 0, { sy: r.range(0.65, 0.9), ry: r.range(0, 3) });
    g.ico(0.7, darken(P.main, 0.06), 0.9, 0.2, 0.4, { sy: 0.7 });
  },
  crystal(g, r, P) {
    const n = r.int(3, 5);
    for (let i = 0; i < n; i++) {
      const a = r.range(0, TAU), d = i ? r.range(0.15, 0.45) : 0, h = i ? r.range(0.6, 1.2) : r.range(1.3, 1.9);
      const rx = -Math.sin(a) * d * 0.9, rz = Math.cos(a) * d * 0.9;
      g.cyl(0.001, 0.2, h * 0.3, 5, lighten(P.main, 0.3), Math.cos(a) * d, h * 0.7, Math.sin(a) * d, { rx, rz, glow: true });
      g.cyl(0.2, 0.16, h * 0.7, 5, P.main, Math.cos(a) * d, 0, Math.sin(a) * d, { rx, rz, glow: true });
    }
    g.dodec(0.3, P.rock, 0, 0, 0, { sy: 0.5 });
  },
  ice_spike(g, r, P) {
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) {
      const a = r.range(0, TAU), d = i ? r.range(0.3, 0.6) : 0;
      g.cone(r.range(0.25, 0.4), r.range(1, 2.4), 4, i % 2 ? P.main : lighten(P.main, 0.2), Math.cos(a) * d, 0, Math.sin(a) * d, { rx: r.range(-0.2, 0.2), rz: r.range(-0.2, 0.2), ry: r.range(0, 3) });
    }
  },
  shell(g, r, P) {
    g.cone(0.18, 0.2, 7, P.main, 0, 0, 0, { rx: Math.PI / 2 - 0.2, sz: 0.5 });
    if (r.chance(0.6)) {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        g.box(0.08, 0.04, 0.3, '#ff9a6b', 0.5 + Math.cos(a) * 0.12, 0, 0.3 + Math.sin(a) * 0.12, { ry: -a + Math.PI / 2 });
      }
    }
  },
  bones(g, r, P) {
    const bone = P.main;
    g.sphere(0.3, bone, 0, 0.25, 0, { w: 7, h: 5 });
    g.box(0.08, 0.08, 0.04, '#222', -0.1, 0.28, 0.28);
    g.box(0.08, 0.08, 0.04, '#222', 0.1, 0.28, 0.28);
    for (let i = 0; i < 4; i++) {
      const a = r.range(0, TAU), d = r.range(0.5, 1.0);
      g.cyl(0.05, 0.05, r.range(0.6, 1.0), 4, bone, Math.cos(a) * d, 0.05, Math.sin(a) * d, { rz: Math.PI / 2, ry: r.range(0, 3) });
    }
  },
  log(g, r, P) {
    const len = r.range(1.6, 2.4);
    g.cyl(0.26, 0.28, len, 6, P.main, -len / 2, 0.27, 0, { rz: Math.PI / 2 });
    g.cyl(0.2, 0.2, 0.02, 6, lighten(P.main, 0.25), len / 2 + 0.01, 0.27, 0, { rz: Math.PI / 2 });
  },
  stump(g, r, P) {
    g.cyl(0.4, 0.5, 0.55, 7, P.main);
    g.cyl(0.36, 0.36, 0.02, 7, lighten(P.main, 0.3), 0, 0.55, 0);
    if (r.chance(0.5)) g.sphere(0.12, '#c94b3a', 0.25, 0.62, 0.1, { sy: 0.5, w: 6, h: 3 });
  },
  // ---------------------------------------------------------------- built things
  fence(g, r, P) {
    for (let i = -1; i <= 1; i++) g.box(0.12, 1.0, 0.12, P.main, i * 1.0, 0, 0);
    g.box(2.2, 0.1, 0.06, lighten(P.main, 0.05), 0, 0.75, 0.06);
    g.box(2.2, 0.1, 0.06, lighten(P.main, 0.05), 0, 0.4, 0.06);
  },
  lamp_post(g, r, P) {
    g.cyl(0.07, 0.1, 2.6, 6, P.main);
    g.cyl(0.18, 0.22, 0.1, 6, P.main, 0, 0, 0);
    g.box(0.34, 0.4, 0.34, P.glow, 0, 2.6, 0, { glow: true });
    g.cone(0.32, 0.25, 4, P.main, 0, 3.0, 0, { ry: Math.PI / 4 });
  },
  lantern(g, r, P) {
    g.cyl(0.04, 0.05, 1.8, 4, P.wood);
    g.box(0.5, 0.06, 0.06, P.wood, 0.2, 1.75, 0);
    g.sphere(0.25, P.main, 0.42, 1.38, 0, { sy: 1.25, w: 7, h: 5, glow: true });
    g.cyl(0.12, 0.12, 0.06, 6, '#2b2b2b', 0.42, 1.68, 0);
  },
  torch(g, r, P) {
    g.cyl(0.05, 0.07, 1.4, 5, P.wood);
    g.cyl(0.13, 0.08, 0.25, 6, '#3a3a3a', 0, 1.35, 0);
    g.cone(0.14, 0.4, 5, '#ffb347', 0, 1.55, 0, { glow: true });
    g.cone(0.08, 0.28, 5, '#fff1a8', 0, 1.6, 0, { glow: true });
  },
  candle(g, r, P) {
    for (let i = 0; i < r.int(2, 4); i++) {
      const x = r.range(-0.25, 0.25), z = r.range(-0.25, 0.25), h = r.range(0.15, 0.45);
      g.cyl(0.05, 0.05, h, 6, P.main, x, 0, z);
      g.cone(0.035, 0.1, 4, '#ffd36b', x, h + 0.01, z, { glow: true });
    }
  },
  bench(g, r, P) {
    g.box(1.6, 0.08, 0.45, P.main, 0, 0.45, 0);
    g.box(1.6, 0.35, 0.06, P.main, 0, 0.6, -0.2, { rx: -0.15 });
    for (const x of [-0.65, 0.65]) g.box(0.08, 0.45, 0.4, P.metal, x, 0, 0);
  },
  chair(g, r, P) {
    g.box(0.5, 0.06, 0.5, P.main, 0, 0.45, 0);
    g.box(0.5, 0.55, 0.06, P.main, 0, 0.5, -0.22);
    for (const [x, z] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) g.box(0.05, 0.45, 0.05, darken(P.main, 0.2), x, 0, z);
  },
  crate(g, r, P) {
    g.box(0.9, 0.9, 0.9, P.main, 0, 0, 0, { ry: r.range(-0.2, 0.2) });
    g.box(0.95, 0.12, 0.95, darken(P.main, 0.15), 0, 0.4, 0);
    if (r.chance(0.6)) g.box(0.6, 0.6, 0.6, lighten(P.main, 0.05), 0.15, 0.9, 0.05, { ry: r.range(0.3, 0.9) });
  },
  barrel(g, r, P) {
    const n = r.chance(0.4) ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const x = i * 0.8;
      g.cyl(0.36, 0.32, 1.0, 8, P.main, x, 0, 0);
      g.cyl(0.38, 0.38, 0.06, 8, P.metal, x, 0.2, 0);
      g.cyl(0.38, 0.38, 0.06, 8, P.metal, x, 0.75, 0);
    }
  },
  traffic_cone(g, r, P) {
    g.box(0.45, 0.05, 0.45, '#2a2a2a');
    g.cone(0.18, 0.7, 7, P.main, 0, 0.05, 0);
    g.cyl(0.11, 0.135, 0.1, 7, '#ffffff', 0, 0.3, 0);
  },
  trash_can(g, r, P) {
    g.cyl(0.3, 0.26, 0.85, 8, P.main);
    g.cyl(0.33, 0.33, 0.08, 8, darken(P.main, 0.15), 0, 0.85, 0);
    g.box(0.18, 0.05, 0.05, darken(P.main, 0.3), 0, 0.95, 0);
  },
  mailbox(g, r, P) {
    g.box(0.1, 1.0, 0.1, P.wood);
    g.box(0.36, 0.34, 0.6, P.main, 0, 1.0, 0);
    g.cyl(0.18, 0.18, 0.6, 8, P.main, 0, 1.34, -0.3, { rx: Math.PI / 2, sx: 1, sz: 1 });
    g.box(0.04, 0.25, 0.12, '#e04848', 0.2, 1.2, 0.1);
  },
  fire_hydrant(g, r, P) {
    g.cyl(0.16, 0.18, 0.6, 7, P.main);
    g.sphere(0.17, P.main, 0, 0.6, 0, { w: 7, h: 4 });
    g.cyl(0.07, 0.07, 0.42, 6, darken(P.main, 0.15), -0.21, 0.4, 0, { rz: Math.PI / 2 });
  },
  planter(g, r, P) {
    g.box(1, 0.5, 1, P.stone);
    g.box(0.9, 0.05, 0.9, darken(P.ground, 0.3), 0, 0.48, 0);
    g.ico(0.45, P.main, 0, 0.85, 0, { sy: 0.9 });
    g.ico(0.3, lighten(P.main, 0.1), 0.2, 1.1, 0.1);
  },
  cafe_table(g, r, P) {
    g.cyl(0.45, 0.45, 0.05, 8, '#f3efe6', 0, 0.72, 0);
    g.cyl(0.04, 0.04, 2.0, 5, '#cfcfcf');
    g.cone(1.2, 0.5, 8, P.main, 0, 1.8, 0);
    for (const a of [0, Math.PI]) {
      const x = Math.cos(a) * 0.8, z = Math.sin(a) * 0.8;
      g.push(x, 0, z, a + Math.PI / 2);
      g.box(0.4, 0.05, 0.4, '#d8d1c3', 0, 0.42, 0);
      g.box(0.4, 0.45, 0.05, '#d8d1c3', 0, 0.45, -0.18);
      g.box(0.04, 0.42, 0.04, '#777', 0, 0, 0);
      g.pop();
    }
  },
  shopping_cart(g, r, P) {
    g.box(0.9, 0.5, 0.55, P.main, 0, 0.45, 0, { sx: 1 });
    g.box(0.06, 0.06, 0.6, P.main, -0.52, 1.0, 0);
    g.box(0.06, 0.5, 0.06, P.main, -0.5, 0.6, 0.25);
    g.box(0.06, 0.5, 0.06, P.main, -0.5, 0.6, -0.25);
    for (const [x, z] of [[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]]) g.cyl(0.07, 0.07, 0.04, 6, '#222', x, 0.08, z, { rx: Math.PI / 2 });
  },
  vending_machine(g, r, P) {
    g.box(1.1, 2.0, 0.8, P.main);
    g.box(0.75, 1.3, 0.05, P.glow, -0.12, 0.55, 0.4, { glow: true });
    for (let i = 0; i < 4; i++) g.box(0.6, 0.04, 0.06, darken(P.main, 0.3), -0.12, 0.75 + i * 0.3, 0.43);
    g.box(0.15, 0.4, 0.05, '#222', 0.4, 0.9, 0.41);
  },
  tombstone(g, r, P) {
    const t = r.int(0, 2);
    if (t === 0) { g.box(0.6, 0.8, 0.18, P.main); g.cyl(0.3, 0.3, 0.18, 8, P.main, 0, 0.8, -0.09, { rx: Math.PI / 2, arc: Math.PI }); }
    else if (t === 1) { g.box(0.16, 1.1, 0.16, P.main); g.box(0.6, 0.16, 0.16, P.main, 0, 0.7, 0); }
    else g.box(0.7, 0.6, 0.2, P.main, 0, 0, 0, { rx: -0.15 });
    g.box(0.8, 0.06, 1.2, darken(P.ground, 0.15), 0, 0, 0.6);
  },
  pillar_ruin(g, r, P) {
    const h = r.range(1.2, 3.6);
    g.box(1.1, 0.3, 1.1, darken(P.main, 0.08));
    g.cyl(0.38, 0.42, h, 8, P.main, 0, 0.3, 0);
    if (h > 2.6) g.box(0.95, 0.3, 0.95, lighten(P.main, 0.04), 0, h + 0.3, 0);
    else g.cyl(0.38, 0.38, 0.6, 8, P.main, 0.9, 0.38, 0.3, { rz: Math.PI / 2, ry: 0.5 });
  },
  statue_small(g, r, P) {
    g.box(0.8, 0.8, 0.8, P.stone);
    g.cyl(0.2, 0.28, 0.7, 6, P.main, 0, 0.8, 0);
    g.sphere(0.2, P.main, 0, 1.7, 0, { w: 6, h: 4 });
    g.box(0.7, 0.12, 0.12, P.main, 0, 1.4, 0, { rz: 0.4 });
  },
  tent(g, r, P) {
    g.roof(2.2, 1.5, 2.0, P.main, 0, 0, 0);
    g.box(0.5, 0.9, 0.02, darken(P.main, 0.45), 0, 0, 1.0, { ry: 0 });
  },
  hut(g, r, P) {
    g.cyl(1.4, 1.5, 1.6, 8, P.main);
    g.cone(2.0, 1.6, 8, P.accent, 0, 1.5, 0);
    g.box(0.6, 1.1, 0.1, darken(P.main, 0.45), 0, 0, 1.43);
  },
  house(g, r, P) {
    const w = r.range(2.6, 3.6), d = r.range(2.6, 3.2), h = r.range(2.0, 2.8);
    const wall = r.pick([P.main, P.plaster, lighten(P.main, 0.15)]);
    g.box(w, h, d, wall);
    g.roof(w + 0.4, 1.4, d + 0.5, r.pick([P.accent, darken(P.accent, 0.15), P.wood]), 0, h, 0);
    g.box(0.6, 1.2, 0.08, darken(P.wood, 0.3), 0, 0, d / 2);
    g.box(0.55, 0.5, 0.08, P.glow, -w / 4 - 0.2, h * 0.55, d / 2, { glow: true });
    g.box(0.55, 0.5, 0.08, P.glow, w / 4 + 0.2, h * 0.55, d / 2, { glow: true });
    if (r.chance(0.5)) g.box(0.4, 1, 0.4, darken(wall, 0.25), w / 3, h + 0.4, -d / 5);
  },
  building(g, r, P) {
    const w = r.range(4, 6), d = r.range(4, 6), floors = r.int(3, 8), fh = 1.6, h = floors * fh;
    g.box(w, h, d, P.main);
    g.box(w + 0.2, 0.3, d + 0.2, darken(P.main, 0.2), 0, h, 0);
    const cols = Math.max(2, Math.floor(w / 1.3));
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const lit = r.chance(0.55);
      const x = -w / 2 + (c + 0.5) * (w / cols);
      g.box(0.55, 0.75, 0.06, lit ? P.glow : darken(P.main, 0.4), x, f * fh + 0.55, d / 2, { glow: lit });
      g.box(0.06, 0.75, 0.55, lit ? P.glow : darken(P.main, 0.4), w / 2, f * fh + 0.55, -d / 2 + (c + 0.5) * (d / cols), { glow: lit });
    }
    if (r.chance(0.5)) g.cyl(0.04, 0.04, 2, 4, P.metal, w / 4, h + 0.3, 0);
  },
  car(g, r, P) {
    g.box(2.2, 0.55, 1.1, P.main, 0, 0.25, 0);
    g.box(1.2, 0.5, 1.0, lighten(P.main, 0.08), -0.15, 0.8, 0);
    g.box(1.15, 0.38, 1.02, '#9fd3ff', -0.15, 0.86, 0, { glow: true, sx: 1 });
    for (const [x, z] of [[-0.7, -0.55], [0.7, -0.55], [-0.7, 0.55], [0.7, 0.55]]) g.cyl(0.25, 0.25, 0.2, 8, '#1f1f1f', x, 0.25, z - 0.1, { rx: Math.PI / 2 });
    g.box(0.05, 0.15, 0.25, '#fff4c2', 1.1, 0.45, 0.3, { glow: true });
    g.box(0.05, 0.15, 0.25, '#fff4c2', 1.1, 0.45, -0.3, { glow: true });
  },
  pipe(g, r, P) {
    const h = r.range(1.2, 2.4);
    g.cyl(0.25, 0.25, h, 8, P.main);
    g.cyl(0.32, 0.32, 0.15, 8, darken(P.main, 0.2), 0, h * 0.5, 0);
    g.cyl(0.25, 0.25, 1.4, 8, P.main, 0, h, 0, { rz: Math.PI / 2 });
    g.cyl(0.3, 0.3, 0.12, 8, darken(P.main, 0.2), 0.7, h, 0, { rz: Math.PI / 2 });
    if (r.chance(0.5)) g.cyl(0.15, 0.15, h * 0.8, 6, lighten(P.main, 0.1), 0.6, 0, 0.4);
  },
  gear(g, r, P) {
    const R = 1.2;
    g.cyl(R, R, 0.3, 12, P.main, 0, R * 0.8, -0.15, { rx: Math.PI / 2 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      g.box(0.35, 0.4, 0.3, P.main, Math.cos(a) * (R + 0.12), R * 0.8 + Math.sin(a) * (R + 0.12) - 0.2, -0.15, { rz: a + Math.PI / 2 });
    }
    g.cyl(0.3, 0.3, 0.4, 8, darken(P.main, 0.25), 0, R * 0.8, -0.2, { rx: Math.PI / 2 });
  },
  tire_pile(g, r, P) {
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) g.torus(0.45, 0.17, P.main, r.range(-0.1, 0.1), 0.17 + i * 0.3, r.range(-0.1, 0.1), { rx: Math.PI / 2, tubular: 10, radial: 4 });
  },
  tv(g, r, P) {
    g.box(1.0, 0.8, 0.8, P.main, 0, 0, 0);
    g.box(0.75, 0.55, 0.05, P.glow, -0.05, 0.12, 0.4, { glow: true });
    g.cyl(0.05, 0.05, 0.08, 6, '#333', 0.42, 0.5, 0.42, { rx: Math.PI / 2 });
    g.cyl(0.01, 0.01, 0.6, 3, '#999', -0.1, 0.8, 0, { rz: 0.5 });
    g.cyl(0.01, 0.01, 0.6, 3, '#999', 0.1, 0.8, 0, { rz: -0.5 });
  },
  book_stack(g, r, P) {
    const n = r.int(4, 12);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = r.range(0.12, 0.22);
      g.box(r.range(0.6, 0.8), t, r.range(0.45, 0.55), shiftHue(P.main, r.range(-0.15, 0.15), 0, r.range(-0.1, 0.1)), r.range(-0.05, 0.05), y, 0, { ry: r.range(-0.3, 0.3) });
      y += t;
    }
  },
  lollipop(g, r, P) {
    const h = r.range(1.2, 2.2);
    g.cyl(0.05, 0.05, h, 5, '#fbf6ec');
    g.cyl(0.45, 0.45, 0.14, 10, P.main, 0, h + 0.3, -0.07, { rx: Math.PI / 2 });
    g.torus(0.3, 0.06, '#ffffff', 0, h + 0.3, 0.02, { tubular: 10 });
    g.torus(0.15, 0.05, lighten(P.main, 0.35), 0, h + 0.3, 0.03, { tubular: 8 });
  },
  gumdrop(g, r, P) {
    const c = shiftHue(P.main, r.range(-0.3, 0.3), 0, 0);
    g.cyl(0.25, 0.55, 0.6, 9, c);
    g.sphere(0.25, c, 0, 0.6, 0, { w: 9, h: 4, sy: 0.6 });
  },
  gift(g, r, P) {
    const s = r.range(0.5, 0.9), c = shiftHue(P.main, r.range(-0.2, 0.2), 0, 0);
    g.box(s, s, s, c, 0, 0, 0, { ry: r.range(0, 1) });
    g.box(s + 0.02, s + 0.02, 0.1, '#fff3c4', 0, 0, 0);
    g.box(0.1, s + 0.02, s + 0.02, '#fff3c4', 0, 0, 0);
    g.torus(0.12, 0.04, '#fff3c4', 0.1, s + 0.08, 0, { tubular: 8 });
    g.torus(0.12, 0.04, '#fff3c4', -0.1, s + 0.08, 0, { tubular: 8 });
  },
  pumpkin(g, r, P) {
    const s = r.range(0.5, 0.8), lit = r.chance(0.35);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      g.sphere(s * 0.55, i % 2 ? P.main : darken(P.main, 0.08), Math.cos(a) * s * 0.3, s * 0.5, Math.sin(a) * s * 0.3, { sy: 0.85, w: 7, h: 5 });
    }
    g.cyl(0.05, 0.07, 0.25, 5, '#4a6b2a', 0, s * 0.95, 0);
    if (lit) {
      g.cone(0.1, 0.12, 3, '#ffd36b', -0.15 * s / 0.6, s * 0.62, s * 0.78, { glow: true, rx: Math.PI / 2 });
      g.cone(0.1, 0.12, 3, '#ffd36b', 0.15 * s / 0.6, s * 0.62, s * 0.78, { glow: true, rx: Math.PI / 2 });
      g.box(0.35 * s / 0.6, 0.06, 0.06, '#ffd36b', 0, s * 0.38, s * 0.82, { glow: true });
    }
  },
  haystack(g, r, P) {
    g.cyl(0.7, 1.0, 1.0, 8, P.main);
    g.sphere(0.72, lighten(P.main, 0.05), 0, 1.0, 0, { sy: 0.7, w: 8, h: 4 });
  },
  scarecrow(g, r, P) {
    g.box(0.1, 2.0, 0.1, P.wood);
    g.box(1.6, 0.1, 0.1, P.wood, 0, 1.5, 0);
    g.box(0.6, 0.7, 0.3, P.main, 0, 1.0, 0);
    g.sphere(0.25, '#e8d3a0', 0, 2.0, 0, { w: 6, h: 4 });
    g.cone(0.4, 0.4, 6, '#6b4a2f', 0, 2.15, 0);
    g.box(1.0, 0.25, 0.25, P.main, 0, 1.42, 0);
  },
  umbrella(g, r, P) {
    g.cyl(0.03, 0.03, 2.2, 4, '#fafafa', 0, 0, 0, { rz: 0.15 });
    g.cone(1.3, 0.5, 8, P.main, -0.3, 1.9, 0, { rz: 0.15 });
    g.box(0.8, 0.02, 1.8, lighten(P.accent, 0.2), 0.9, 0.01, 0.4, { ry: 0.3 });
  },
  sandcastle(g, r, P) {
    g.box(1.0, 0.45, 1.0, P.main);
    for (const [x, z] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) {
      g.cyl(0.18, 0.2, 0.75, 6, P.main, x, 0, z);
      g.cone(0.2, 0.25, 6, lighten(P.main, 0.08), x, 0.75, z);
    }
    g.cyl(0.25, 0.3, 0.9, 6, lighten(P.main, 0.05), 0, 0.3, 0);
    g.cyl(0.01, 0.01, 0.4, 3, '#fff', 0, 1.2, 0);
    g.box(0.18, 0.12, 0.01, '#e04848', 0.09, 1.45, 0);
  },
  snowman(g, r, P) {
    g.sphere(0.6, P.main, 0, 0.5, 0, { w: 8, h: 6 });
    g.sphere(0.42, P.main, 0, 1.25, 0, { w: 8, h: 6 });
    g.sphere(0.3, P.main, 0, 1.8, 0, { w: 8, h: 6 });
    g.cone(0.06, 0.3, 5, '#ff8a3d', 0, 1.8, 0.28, { rx: Math.PI / 2 });
    g.cyl(0.25, 0.25, 0.3, 8, '#222', 0, 2.0, 0);
    g.cyl(0.36, 0.36, 0.04, 8, '#222', 0, 2.0, 0);
    g.torus(0.32, 0.07, P.accent, 0, 1.5, 0, { rx: Math.PI / 2, tubular: 10 });
  },
  flag(g, r, P) {
    g.cyl(0.04, 0.05, 3.2, 5, '#d8d8d8');
    g.box(1.1, 0.7, 0.03, P.main, 0.55, 2.4, 0);
    g.box(0.4, 0.7, 0.035, lighten(P.main, 0.4), 0.95, 2.4, 0);
    g.sphere(0.07, '#ffd36b', 0, 3.25, 0, { w: 5, h: 3 });
  },
  anchor(g, r, P) {
    g.box(0.15, 1.6, 0.15, P.main, 0, 0.3, 0, { rz: 0.25 });
    g.torus(0.6, 0.08, P.main, 0.08, 0.6, 0, { arc: Math.PI, rz: Math.PI, tubular: 8 });
    g.torus(0.2, 0.06, P.main, -0.42, 1.95, 0, { tubular: 8 });
    g.box(0.8, 0.12, 0.12, P.main, -0.32, 1.55, 0, { rz: 0.25 });
  },
  coin_pile(g, r, P) {
    g.cone(0.7, 0.5, 8, P.main);
    for (let i = 0; i < 6; i++) g.cyl(0.12, 0.12, 0.03, 8, lighten(P.main, 0.15), r.range(-0.6, 0.6), r.range(0, 0.15), r.range(-0.6, 0.6), { rx: r.range(-0.5, 0.5) });
    if (r.chance(0.4)) g.oct(0.15, '#e04870', 0.1, 0.5, 0.1, { glow: true });
  },
  satellite_dish(g, r, P) {
    g.cyl(0.1, 0.15, 1.2, 6, P.metal);
    g.sphere(0.8, P.main, 0, 1.6, 0.1, { sy: 0.35, rx: -0.7, w: 10, h: 4 });
    g.cyl(0.02, 0.02, 0.8, 3, P.metal, 0, 1.6, 0.4, { rx: 0.8 });
  },
  // ---------------------------------------------------------------- floating & critters
  cloud_puff(g, r, P) {
    for (let i = 0; i < 4; i++) g.ico(r.range(0.7, 1.2), P.main, r.range(-1.2, 1.2), r.range(-0.1, 0.4), r.range(-0.6, 0.6), { sy: 0.65, jitter: 0.04 });
  },
  balloon(g, r, P) {
    for (let i = 0; i < 3; i++) {
      const c = shiftHue(P.main, (i - 1) * 0.12, 0, 0), x = (i - 1) * 0.4, y = r.range(0, 0.4);
      g.sphere(0.35, c, x, y + 1.6, 0, { sy: 1.2, w: 8, h: 6 });
      g.cyl(0.005, 0.005, 1.4, 3, '#eeeeee', x * 0.5, y + 0.15, 0, { rz: -x * 0.25 });
    }
  },
  floating_lantern(g, r, P) {
    g.cyl(0.3, 0.22, 0.6, 6, P.main, 0, 0, 0, { glow: true });
    g.cyl(0.18, 0.18, 0.04, 6, '#fff3c4', 0, -0.02, 0, { glow: true });
  },
  fish(g, r, P) {
    g.sphere(0.3, P.main, 0, 0, 0, { sx: 0.6, sz: 1.3, w: 7, h: 5 });
    g.cone(0.22, 0.35, 4, darken(P.main, 0.1), 0, 0, -0.5, { rx: -Math.PI / 2, sx: 0.3 });
    g.box(0.02, 0.18, 0.2, lighten(P.main, 0.2), 0, 0.2, 0.05);
    g.sphere(0.05, '#111', 0.12, 0.06, 0.25, { w: 4, h: 3 });
    g.sphere(0.05, '#111', -0.12, 0.06, 0.25, { w: 4, h: 3 });
  },
  jellyfish(g, r, P) {
    g.sphere(0.45, P.main, 0, 0, 0, { sy: 0.7, w: 8, h: 5, glow: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      g.box(0.04, 0.9, 0.04, lighten(P.main, 0.3), Math.cos(a) * 0.25, -1.0, Math.sin(a) * 0.25, { glow: true });
    }
  },
  bird(g, r, P) {
    g.sphere(0.22, P.main, 0, 0, 0, { sz: 1.6, w: 6, h: 4 });
    g.box(0.9, 0.03, 0.28, darken(P.main, 0.1), 0.55, 0.05, 0, { rz: 0.25 });
    g.box(0.9, 0.03, 0.28, darken(P.main, 0.1), -0.55, 0.05, 0, { rz: -0.25 });
    g.cone(0.06, 0.15, 4, '#f2b33d', 0, 0.02, 0.42, { rx: Math.PI / 2 });
  },
  butterfly(g, r, P) {
    g.box(0.04, 0.04, 0.22, '#2a2a2a');
    g.box(0.28, 0.02, 0.22, P.main, 0.16, 0, 0.04, { rz: 0.4 });
    g.box(0.28, 0.02, 0.22, P.main, -0.16, 0, 0.04, { rz: -0.4 });
    g.box(0.2, 0.02, 0.16, lighten(P.main, 0.25), 0.13, 0, -0.12, { rz: 0.4 });
    g.box(0.2, 0.02, 0.16, lighten(P.main, 0.25), -0.13, 0, -0.12, { rz: -0.4 });
  },
  bat(g, r, P) {
    g.sphere(0.16, P.main, 0, 0, 0, { w: 5, h: 4 });
    for (const s of [-1, 1]) {
      g.box(0.5, 0.03, 0.3, P.main, s * 0.3, 0.03, 0, { rz: s * 0.3 });
      g.cone(0.05, 0.12, 3, P.main, s * 0.08, 0.12, 0.02);
    }
    g.sphere(0.03, '#ff4a4a', 0.06, 0.04, 0.14, { glow: true, w: 3, h: 2 });
    g.sphere(0.03, '#ff4a4a', -0.06, 0.04, 0.14, { glow: true, w: 3, h: 2 });
  },
  firefly(g, r, P) {
    g.ico(0.07, P.main, 0, 0, 0, { glow: true });
  },
};

// Default "main" colour per prop: a palette key, or a fixed hex colour.
export const PROP_MAIN = {
  tree_round: 'foliage', tree_pine: 'foliage2', tree_palm: 'foliage', tree_dead: 'trunk', tree_willow: 'foliage2',
  tree_blob: 'accent', bush: 'foliage', grass: 'foliage', flower: 'accent', mushroom: 'accent', mushroom_giant: 'accent',
  reed: 'foliage2', lily_pad: 'foliage', cactus: 'foliage', kelp: 'foliage', coral: 'accent', vine_arch: 'foliage',
  rock: 'rock', boulder: 'rock', crystal: 'accent', ice_spike: '#bfe6ff', shell: '#f6d7c3', bones: '#efe6d2',
  log: 'trunk', stump: 'trunk', fence: 'wood', lamp_post: 'metal', lantern: '#ff8f5a', torch: 'wood', candle: '#f4efe1',
  bench: 'wood', chair: 'wood', crate: 'wood', barrel: 'wood', traffic_cone: '#ff7a2f', trash_can: 'metal',
  mailbox: '#4b6fb0', fire_hydrant: '#d84b3f', planter: 'foliage', cafe_table: 'accent', shopping_cart: '#b9c0c8',
  vending_machine: 'accent', tombstone: 'stone', pillar_ruin: 'stone', statue_small: 'stone', tent: 'accent', hut: 'wood',
  house: 'plaster', building: 'stone', car: 'accent', pipe: 'metal', gear: '#b08a4a', tire_pile: '#2b2b2b', tv: '#6b5a48',
  book_stack: 'accent', lollipop: 'accent', gumdrop: 'accent', gift: 'accent', pumpkin: '#f0862c', haystack: '#e3c66a',
  scarecrow: '#8a5a3c', umbrella: 'accent', sandcastle: '#e8cf8f', snowman: '#f6f8ff', flag: 'accent', anchor: '#6b5a4f',
  coin_pile: '#f5c542', satellite_dish: '#e6e6e6', cloud_puff: '#ffffff', balloon: 'accent', floating_lantern: '#ffb35c',
  fish: 'accent', jellyfish: '#ff9ad5', bird: '#3d3f4a', butterfly: 'accent', bat: '#2a2333', firefly: '#fff27a',
};

export { mix };
