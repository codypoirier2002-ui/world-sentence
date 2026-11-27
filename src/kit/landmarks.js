// Landmarks: one-off big structures that become the world's points of interest.
// Each builder draws in local space (front faces +z, base at y = 0) and returns
// { r, h, colliders? } where r is a collider radius and h the height.
// `A` registers animated parts: A.spin(geo, [px,py,pz], axis, speed) or A.bob(...).
import { Geo } from './builder.js';
import { lighten, darken } from './colors.js';

const TAU = Math.PI * 2;

export const LANDMARKS = {
  windmill(g, r, P, A) {
    g.cyl(1.7, 2.4, 7, 8, P.main, 0, 0, 0);
    g.cone(2.3, 2.4, 8, P.accent, 0, 7, 0);
    g.box(0.9, 1.5, 0.3, darken(P.wood, 0.3), 0, 0, 2.25);
    g.box(0.5, 0.6, 0.2, P.glow, 0, 4.2, 2.0, { glow: true });
    g.cyl(0.25, 0.25, 0.8, 6, P.wood, 0, 6, 1.6, { rx: Math.PI / 2 });
    const blades = new Geo(r.next);
    for (let i = 0; i < 4; i++) {
      blades.push(0, 0, 0, 0, 1, 0, (i / 4) * TAU);
      blades.box(0.16, 4.4, 0.08, P.wood, 0, 0.3, 0);
      blades.box(0.9, 3.4, 0.04, lighten(P.wood, 0.35), 0.5, 1.1, 0.03);
      blades.pop();
    }
    A.spin(blades, [0, 6, 2.5], 'z', 0.6);
    return { r: 2.5, h: 9.5 };
  },
  tower(g, r, P) {
    const h = r.range(9, 12);
    g.cyl(1.9, 2.3, h, 8, P.main);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      g.box(0.7, 0.7, 0.5, lighten(P.main, 0.05), Math.cos(a) * 2.05, h, Math.sin(a) * 2.05, { ry: -a });
    }
    g.cyl(2.25, 2.25, 0.3, 8, darken(P.main, 0.1), 0, h - 0.3, 0);
    g.cone(1.9, 3.2, 8, P.accent, 0, h + 0.7, 0);
    g.cyl(0.03, 0.03, 1.2, 3, P.metal, 0, h + 3.8, 0);
    g.box(0.6, 0.35, 0.03, P.accent, 0.3, h + 4.6, 0);
    for (let i = 0; i < 3; i++) g.box(0.4, 0.7, 0.2, P.glow, 0, 2.5 + i * 2.6, 2.15 - i * 0.05, { glow: true });
    g.box(1.0, 1.7, 0.3, darken(P.wood, 0.25), 0, 0, 2.2);
    return { r: 2.4, h: h + 4 };
  },
  fountain(g, r, P, A) {
    g.cyl(3, 3.2, 0.7, 10, P.main);
    g.cyl(2.6, 2.6, 0.1, 10, P.water, 0, 0.55, 0);
    g.cyl(0.4, 0.55, 2.2, 8, lighten(P.main, 0.05), 0, 0.6, 0);
    g.cyl(1.3, 0.6, 0.35, 8, P.main, 0, 2.6, 0);
    g.cyl(1.1, 1.1, 0.06, 8, P.water, 0, 2.9, 0);
    g.ico(0.35, P.accent, 0, 3.3, 0);
    const spray = new Geo(r.next);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      spray.ico(0.12, lighten(P.water, 0.4), Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9, { glow: true });
    }
    A.spin(spray, [0, 3.0, 0], 'y', 0.8);
    return { r: 3.2, h: 4 };
  },
  cottage(g, r, P) {
    g.box(5, 3, 4, P.main);
    g.roof(5.6, 2.2, 4.8, P.accent, 0, 3, 0);
    g.box(1, 1.8, 0.1, darken(P.wood, 0.25), 0, 0, 2.0);
    g.box(0.8, 0.7, 0.1, P.glow, -1.6, 1.3, 2.0, { glow: true });
    g.box(0.8, 0.7, 0.1, P.glow, 1.6, 1.3, 2.0, { glow: true });
    g.box(0.6, 1.8, 0.6, darken(P.main, 0.2), 1.6, 3.4, -0.8);
    return { r: 3.1, h: 5.5 };
  },
  arch(g, r, P) {
    const w = 3.2;
    for (const s of [-1, 1]) {
      g.box(1.1, 5, 1.1, P.main, s * w, 0, 0);
      g.box(1.4, 0.4, 1.4, darken(P.main, 0.1), s * w, 0, 0);
    }
    g.box(w * 2 + 2.2, 1.1, 1.4, lighten(P.main, 0.05), 0, 5, 0);
    g.box(w * 2 + 2.6, 0.3, 1.6, P.accent, 0, 6.1, 0);
    g.oct(0.5, P.glow, 0, 6.9, 0, { glow: true });
    return { r: 0, h: 7, colliders: [{ x: -w, z: 0, r: 0.9 }, { x: w, z: 0, r: 0.9 }] };
  },
};

export const LANDMARK_MAIN = {
  windmill: 'stone', tower: 'stone', fountain: 'stone', cottage: 'plaster', arch: 'stone',
};
