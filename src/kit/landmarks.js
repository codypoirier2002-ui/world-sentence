// Landmarks: one-off big structures that become the world's points of interest.
// Each builder draws in local space (front faces +z, base at y = 0) and returns
// { r, h, colliders?, sign? } where r is a collider radius and h the height.
// `A` registers animated parts: A.spin(geo, [px,py,pz], axis, speed) or A.bob(...).
// A.billboard(w, h, [x,y,z]) asks for the sign text to be painted on a board.
import { Geo } from './builder.js';
import { lighten, darken, shiftHue } from './colors.js';

const TAU = Math.PI * 2;

function windowsRing(g, P, r, y, n, w = 0.4, h = 0.6, lit = 1) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    g.box(w, h, 0.1, P.glow, Math.sin(a) * r, y, Math.cos(a) * r, { ry: a, glow: lit > 0 });
  }
}

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
  castle(g, r, P) {
    const s = 5.5;
    g.box(s * 2, 4.5, s * 2, P.main, 0, 0, 0);
    for (let i = -2; i <= 2; i++) {
      for (const [x, z, ry] of [[i * 2, s, 0], [i * 2, -s, 0], [s, i * 2, 1], [-s, i * 2, 1]]) g.box(0.9, 0.8, 0.6, lighten(P.main, 0.04), x, 4.5, z, { ry: ry * Math.PI / 2 });
    }
    for (const [x, z] of [[-s, -s], [s, -s], [-s, s], [s, s]]) {
      g.cyl(1.4, 1.5, 7, 8, lighten(P.main, 0.03), x, 0, z);
      g.cone(1.7, 2.6, 8, P.accent, x, 7, z);
      g.box(0.35, 0.6, 0.1, P.glow, x, 5, z + 1.42, { glow: true });
    }
    g.cyl(1.6, 1.8, 9, 8, P.main, 0, 0, -1);
    g.cone(2.0, 3.2, 8, P.accent, 0, 9, -1);
    g.cyl(0.04, 0.04, 2, 3, P.metal, 0, 12, -1);
    g.box(1.2, 0.7, 0.04, P.accent, 0.6, 13.2, -1);
    g.box(2.4, 3.2, 0.3, darken(P.wood, 0.3), 0, 0, s + 0.05);
    g.cyl(1.2, 1.2, 0.3, 8, darken(P.wood, 0.3), 0, 3.2, s - 0.1, { rx: Math.PI / 2 });
    for (const x of [-3, 3]) g.box(0.6, 0.9, 0.1, P.glow, x, 2.4, s + 0.02, { glow: true });
    return { r: s + 1.2, h: 14 };
  },
  throne(g, r, P) {
    for (let i = 0; i < 3; i++) g.box(6 - i * 1.4, 0.45, 5 - i * 1.1, i % 2 ? lighten(P.stone, 0.05) : P.stone, 0, i * 0.45, -0.3 * i);
    const y = 1.35;
    g.box(2.2, 1.2, 1.8, P.main, 0, y, -0.6);
    g.box(2.2, 4.2, 0.5, P.main, 0, y, -1.5);
    for (const s of [-1, 1]) {
      g.box(0.45, 1.0, 1.8, darken(P.main, 0.1), s * 1.2, y + 1.2, -0.6);
      g.sphere(0.32, P.accent, s * 1.2, y + 2.4, 0.2, { w: 6, h: 4 });
    }
    g.box(1.8, 0.2, 1.5, P.accent, 0, y + 1.2, -0.5);
    for (let i = 0; i < 5; i++) g.cone(0.25, 0.8, 4, P.accent, -0.9 + i * 0.45, y + 4.2, -1.5);
    g.oct(0.4, P.glow, 0, y + 3.6, -1.2, { glow: true });
    return { r: 2.6, h: 7 };
  },
  pyramid(g, r, P) {
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const w = 11 - i * 1.7;
      g.box(w, 1.3, w, i % 2 ? lighten(P.main, 0.05) : P.main, 0, i * 1.3, 0);
    }
    g.box(1.6, 2.6, 1.6, P.accent, 0, steps * 1.3, 0);
    g.box(1.4, 6.5, 0.6, darken(P.main, 0.1), 0, 0, 5.3);
    g.box(1.3, 1.6, 0.1, '#1a1408', 0, steps * 1.3 + 0.3, 0.81);
    return { r: 5.8, h: 11 };
  },
  temple(g, r, P) {
    g.box(10, 0.6, 7, darken(P.stone, 0.05));
    g.box(9, 0.4, 6, P.stone, 0, 0.6, 0);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const x = -4 + i * 1.6;
      for (const z of [-2.5, 2.5]) g.cyl(0.35, 0.4, 4.5, 8, P.main, x, 1, z);
    }
    g.box(9.4, 0.6, 6.4, lighten(P.main, 0.05), 0, 5.5, 0);
    g.roof(9.6, 1.6, 6.8, P.accent, 0, 6.1, 0, { ry: 0 });
    g.box(5, 3.5, 3.5, darken(P.main, 0.15), 0, 1, -0.5);
    g.box(1.2, 2.2, 0.1, P.glow, 0, 1, 1.26, { glow: true });
    return { r: 4.8, h: 8 };
  },
  statue(g, r, P) {
    g.box(3, 2, 3, P.stone);
    g.box(3.4, 0.3, 3.4, darken(P.stone, 0.1), 0, 2, 0);
    const c = P.main;
    g.push(0, 2.3, 0);
    g.cyl(0.4, 0.45, 2.4, 6, c, -0.5, 0, 0);
    g.cyl(0.4, 0.45, 2.4, 6, c, 0.5, 0, 0);
    g.cyl(1.1, 0.8, 2.8, 7, c, 0, 2.2, 0);
    g.sphere(0.75, c, 0, 5.7, 0, { w: 7, h: 5 });
    g.cyl(0.25, 0.3, 2.6, 6, c, 1.2, 2.8, 0, { rz: -2.6 });
    g.cyl(0.25, 0.3, 2.0, 6, c, -1.2, 4.6, 0, { rz: 0.4 });
    g.oct(0.45, P.glow, 2.3, 4.3, 0, { glow: true });
    g.pop();
    return { r: 2.2, h: 9 };
  },
  monument(g, r, P) {
    // the creature itself is added by the world builder (needs the locals' body kit)
    g.box(3.4, 2.2, 3.4, P.stone);
    g.box(3.8, 0.3, 3.8, darken(P.stone, 0.1), 0, 2.2, 0);
    g.box(3.0, 0.5, 0.06, P.accent, 0, 1.0, 1.71);
    return { r: 2.4, h: 8, creatureAt: [0, 2.5, 0], creatureScale: 3.2 };
  },
  monolith(g, r, P) {
    g.box(1.6, 7, 0.6, P.main, 0, 0, 0);
    g.box(2.6, 0.3, 1.6, darken(P.rock, 0.2), 0, 0, 0);
    g.box(0.12, 0.12, 0.02, P.glow, 0, 5.5, 0.31, { glow: true });
    return { r: 1.2, h: 7.5 };
  },
  obelisk(g, r, P) {
    g.box(2.4, 0.8, 2.4, darken(P.main, 0.1));
    g.cyl(0.6, 0.95, 9, 4, P.main, 0, 0.8, 0, { ry: Math.PI / 4 });
    g.cone(0.85, 1.2, 4, P.accent, 0, 9.8, 0, { ry: Math.PI / 4 });
    return { r: 1.4, h: 11 };
  },
  giant_tree(g, r, P) {
    g.cyl(1.2, 2.2, 9, 8, P.trunk);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      g.cyl(0.3, 0.7, 2.5, 5, darken(P.trunk, 0.1), Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6, { rz: Math.cos(a) * 0.8, rx: -Math.sin(a) * 0.8 });
    }
    const f = P.main;
    g.ico(5, f, 0, 12, 0, { sy: 0.7 });
    g.ico(3.5, lighten(f, 0.06), 3, 13.5, 1, { sy: 0.75 });
    g.ico(3.2, darken(f, 0.06), -3, 11, -1.5, { sy: 0.75 });
    g.ico(2.8, lighten(f, 0.1), 0.5, 15, -1, { sy: 0.8 });
    g.box(0.9, 1.4, 0.2, P.glow, 0, 0.2, 1.95, { glow: true });
    return { r: 2.2, h: 17 };
  },
  mushroom_house(g, r, P) {
    g.cyl(1.9, 2.3, 4, 9, '#efe3c8');
    g.sphere(4, P.main, 0, 4, 0, { sy: 0.55, w: 10, h: 6 });
    for (let i = 0; i < 9; i++) {
      const a = r.range(0, TAU), d = r.range(1, 3.2);
      g.ico(0.4, '#fffaf0', Math.cos(a) * d, 4 + 2.1 - d * 0.5, Math.sin(a) * d);
    }
    g.box(1, 1.8, 0.2, darken(P.wood, 0.25), 0, 0, 2.15);
    windowsRing(g, P, 2.05, 2.4, 3, 0.5, 0.5);
    g.cyl(0.25, 0.25, 1.2, 6, '#8a8a8a', 1.8, 5.5, -1);
    return { r: 2.5, h: 7 };
  },
  lighthouse(g, r, P, A) {
    const h = 11;
    g.cyl(1.4, 2.2, h, 10, '#f6f2ea');
    for (let i = 0; i < 3; i++) g.cyl(1.55 + (2 - i) * 0.2, 1.65 + (2 - i) * 0.2, 1.2, 10, P.accent, 0, 1.5 + i * 3.3, 0);
    g.cyl(1.9, 1.9, 0.3, 10, darken(P.accent, 0.2), 0, h, 0);
    g.cyl(1.1, 1.1, 1.8, 8, P.glow, 0, h + 0.3, 0, { glow: true });
    g.cone(1.5, 1.4, 8, P.accent, 0, h + 2.1, 0);
    g.box(0.9, 1.6, 0.2, darken(P.wood, 0.3), 0, 0, 2.05);
    const beam = new Geo(r.next);
    beam.cone(1.1, 9, 6, '#fff6c8', 0, 0, 0, { rz: -Math.PI / 2, glow: true });
    A.spin(beam, [0, h + 1.2, 0], 'y', 0.9);
    return { r: 2.2, h: h + 4 };
  },
  clocktower(g, r, P, A) {
    const h = 12;
    g.box(3.4, h, 3.4, P.main);
    g.box(3.8, 0.4, 3.8, darken(P.main, 0.12), 0, h * 0.35, 0);
    g.box(3.8, 0.4, 3.8, darken(P.main, 0.12), 0, h, 0);
    g.cone(2.8, 4, 4, P.accent, 0, h + 0.4, 0, { ry: Math.PI / 4 });
    g.cyl(1.25, 1.25, 0.2, 14, '#fbf3df', 0, h - 2.2, 1.65, { rx: Math.PI / 2, glow: true });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      g.box(0.08, 0.22, 0.05, '#333', Math.sin(a) * 1.05, h - 2.2 + Math.cos(a) * 1.05 - 0.11, 1.88, { rz: -a });
    }
    g.box(1.1, 2, 0.2, darken(P.wood, 0.3), 0, 0, 1.75);
    const hands = new Geo(r.next);
    hands.box(0.1, 0.95, 0.04, '#1c1c1c', 0, 0, 0);
    hands.box(0.14, 0.6, 0.04, '#1c1c1c', 0, 0, 0.03, { rz: 2.1 });
    A.spin(hands, [0, h - 2.2, 1.95], 'z', -0.25);
    return { r: 2.5, h: h + 4.5 };
  },
  ferris_wheel(g, r, P, A) {
    const R = 6.5, cy = R + 1.4;
    for (const z of [-0.8, 0.8]) {
      g.box(0.35, cy + 0.6, 0.35, P.metal, -2.2, 0, z, { rz: -0.32 });
      g.box(0.35, cy + 0.6, 0.35, P.metal, 2.2, 0, z, { rz: 0.32 });
    }
    g.box(6, 0.4, 2.6, darken(P.stone, 0.05), 0, 0, 0);
    const wheel = new Geo(r.next);
    for (const z of [-0.6, 0.6]) wheel.torus(R, 0.14, P.main, 0, 0, z, { tubular: 18, radial: 4 });
    const cars = 8;
    for (let i = 0; i < cars; i++) {
      const a = (i / cars) * TAU;
      wheel.box(0.12, R, 0.12, lighten(P.main, 0.2), 0, 0, 0, { rz: a });
      wheel.box(1.0, 0.9, 1.0, shiftHue(P.accent, i / cars, 0, 0), Math.sin(a) * R, -Math.cos(a) * R - 1.0, 0);
    }
    wheel.cyl(0.4, 0.4, 1.8, 8, P.metal, 0, 0, -0.9, { rx: Math.PI / 2 });
    A.spin(wheel, [0, cy, 0], 'z', 0.18);
    return { r: 3, h: cy + R + 1, colliders: [{ x: -2.6, z: 0, r: 1.2 }, { x: 2.6, z: 0, r: 1.2 }] };
  },
  carousel(g, r, P, A) {
    g.cyl(4, 4.2, 0.5, 14, P.stone);
    g.cyl(0.4, 0.4, 4, 8, P.metal, 0, 0.5, 0);
    const top = new Geo(r.next);
    top.cyl(4.2, 4.2, 0.4, 14, P.accent, 0, 3.6, 0);
    top.cone(4.4, 1.8, 14, P.main, 0, 4, 0);
    top.cyl(3.6, 3.6, 0.25, 14, lighten(P.stone, 0.1), 0, 0, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU, x = Math.cos(a) * 2.8, z = Math.sin(a) * 2.8;
      top.cyl(0.05, 0.05, 3.4, 4, '#e8d38a', x, 0.2, z);
      const c = shiftHue(P.accent, i / 6, -0.1, 0.1);
      top.box(0.45, 0.6, 1.2, c, x, 1.2, z, { ry: -a });
      top.box(0.3, 0.6, 0.4, c, x + Math.cos(a + Math.PI / 2) * 0.55, 1.6, z + Math.sin(a + Math.PI / 2) * 0.55, { ry: -a });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      top.sphere(0.12, P.glow, Math.cos(a) * 4.25, 3.8, Math.sin(a) * 4.25, { glow: true, w: 4, h: 3 });
    }
    A.spin(top, [0, 0.5, 0], 'y', 0.45);
    return { r: 4.1, h: 6.5 };
  },
  stage(g, r, P) {
    g.box(9, 1.2, 5, P.wood);
    g.box(9.4, 6, 0.5, darken(P.main, 0.2), 0, 1.2, -2.3);
    for (const s of [-1, 1]) {
      g.box(0.6, 6, 5.2, darken(P.main, 0.2), s * 4.7, 0, -0.1);
      g.box(2.2, 5, 0.25, P.main, s * 3.4, 1.2, 1.9);
      g.box(0.4, 0.4, 0.4, '#333', s * 2.5, 6.6, 2.4);
      g.cone(0.3, 0.6, 6, P.glow, s * 2.5, 6.2, 2.4, { rx: Math.PI + 0.4, glow: true });
    }
    g.box(9.6, 1.2, 0.6, P.main, 0, 6.2, 2.0);
    g.box(1, 1.3, 1, '#2a2a2a', -2, 1.2, -1);
    g.cyl(0.04, 0.04, 1.5, 3, '#888', 1.5, 1.2, 0.5);
    g.sphere(0.12, '#222', 1.5, 2.75, 0.5, { w: 5, h: 3 });
    return { r: 4.6, h: 7.5 };
  },
  shop(g, r, P, A) {
    g.box(7, 4.6, 4.5, P.main);
    g.box(7.4, 0.4, 4.9, darken(P.main, 0.2), 0, 4.6, 0);
    g.box(5.4, 2.2, 0.1, P.glow, -0.5, 0.6, 2.26, { glow: true });
    g.box(1.1, 2.6, 0.12, darken(P.main, 0.45), 2.6, 0, 2.27);
    for (let i = 0; i < 7; i++) g.box(1.0, 0.12, 1.6, i % 2 ? P.accent : '#fbf6ec', -3 + i, 3.25, 2.9, { rx: 0.45 });
    A.billboard(5.6, 0.9, [0, 3.95, 2.3]);
    return { r: 3.4, h: 5.4 };
  },
  escalator(g, r, P) {
    const steps = 12;
    for (let i = 0; i < steps; i++) g.box(1.8, 0.35, 0.75, i % 2 ? P.metal : lighten(P.metal, 0.1), 0, i * 0.5, 3.5 - i * 0.6);
    for (const s of [-1, 1]) {
      g.box(0.25, 1.1, 8.2, P.main, s * 1.05, 0, 0.2, { rx: -Math.atan(0.5 / 0.6) * 0.98, sy: 1 });
      g.box(0.15, 0.15, 8.6, '#1c1c1c', s * 1.05, 1.1, 0.2, { rx: -Math.atan(0.5 / 0.6) * 0.98 });
    }
    g.box(3, 0.4, 2.5, P.metal, 0, steps * 0.5, -4.6);
    g.box(3, steps * 0.5, 0.4, darken(P.main, 0.2), 0, 0, -5.8);
    g.box(1.6, 0.6, 0.1, P.glow, 0, steps * 0.5 + 1.8, -5.6, { glow: true });
    return { r: 2.2, h: 8.5 };
  },
  kiosk(g, r, P) {
    g.box(2.6, 2.2, 2.2, P.main);
    g.box(2.0, 1.0, 0.1, P.glow, 0, 1.0, 1.11, { glow: true });
    g.box(3.0, 0.15, 2.6, P.accent, 0, 2.2, 0.15);
    g.box(2.4, 0.15, 0.6, '#fbf6ec', 0, 0.95, 1.3);
    return { r: 1.6, h: 3.4 };
  },
  dome(g, r, P, A) {
    g.cyl(4.2, 4.4, 3, 12, P.main);
    g.sphere(4.2, P.accent, 0, 3, 0, { sy: 0.85, w: 12, h: 6 });
    g.cyl(0.6, 0.6, 1, 8, P.metal, 0, 6.3, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.3;
      g.cyl(0.35, 0.35, 3, 6, lighten(P.main, 0.08), Math.sin(a) * 4.35, 0, Math.cos(a) * 4.35);
    }
    g.box(1.4, 2.2, 0.25, P.glow, 0, 0, 4.2, { glow: true });
    const scope = new Geo(r.next);
    scope.cyl(0.4, 0.5, 3.2, 8, P.metal, 0, 0, 0, { rx: -0.8 });
    A.spin(scope, [0, 6.8, 0], 'y', 0.08);
    return { r: 4.3, h: 9 };
  },
  bridge(g, r, P) {
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = (t - 0.5) * 11, y = Math.sin(t * Math.PI) * 2.2;
      g.box(1.4, 0.45, 3, i % 2 ? P.main : lighten(P.main, 0.05), x, y, 0, { rz: Math.cos(t * Math.PI) * 0.35 });
      for (const z of [-1.4, 1.4]) g.box(0.25, 0.9, 0.25, darken(P.main, 0.1), x, y + 0.4, z);
    }
    for (const s of [-1, 1]) g.box(1.6, 2.2, 3.2, darken(P.main, 0.12), s * 5.8, -1.2, 0);
    return { r: 0, h: 4, colliders: [] };
  },
  shipwreck(g, r, P) {
    g.push(0, -0.6, 0, 0.2, 1, 0.12, 0.35);
    g.box(3.6, 2.2, 10, P.wood, 0, 0, 0);
    g.box(2.6, 1.4, 1.8, P.wood, 0, 0.2, 5.6, { ry: Math.PI / 4, sz: 1.4 });
    g.box(3.6, 0.3, 10, darken(P.wood, 0.25), 0, 2.2, 0);
    g.box(3.2, 2, 3, darken(P.wood, 0.1), 0, 2.4, -3.2);
    g.cyl(0.18, 0.24, 8, 6, darken(P.wood, 0.15), 0, 2.2, 0.8);
    g.box(3.4, 2.6, 0.05, '#e8dfc8', 0, 5.4, 0.9, { rz: 0.1 });
    for (let i = 0; i < 4; i++) g.cyl(0.18, 0.18, 0.3, 6, '#2b2b2b', 1.85, 0.8, -2 + i * 1.4, { rz: Math.PI / 2 });
    g.pop();
    return { r: 3.6, h: 9, colliders: [{ x: 0, z: -3, r: 2.2 }, { x: 0, z: 0.5, r: 2.2 }, { x: 0, z: 3.8, r: 2 }] };
  },
  rocket(g, r, P) {
    g.box(6, 0.5, 6, darken(P.metal, 0.1));
    g.box(0.5, 9, 0.5, P.metal, 2.6, 0.5, 0);
    for (let i = 0; i < 4; i++) g.box(1.2, 0.2, 0.3, P.metal, 2.0, 2 + i * 2, 0);
    g.cyl(1.2, 1.2, 7, 10, '#f3f1ec', 0, 1.6, 0);
    g.cone(1.2, 2.8, 10, P.accent, 0, 8.6, 0);
    g.cyl(0.55, 0.55, 0.15, 10, '#9fd3ff', 0, 6.4, 1.15, { rx: Math.PI / 2, glow: true });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      g.box(0.15, 2, 1.4, P.accent, Math.sin(a) * 1.4, 0.5, Math.cos(a) * 1.4, { ry: a });
    }
    g.cyl(0.9, 0.7, 1.1, 8, darken(P.metal, 0.3), 0, 0.5, 0);
    return { r: 2.4, h: 12 };
  },
  ufo(g, r, P, A) {
    g.push(0, 0.6, 0, 0, 1, 0.25, 0.15);
    g.sphere(4.2, P.metal, 0, 0, 0, { sy: 0.28, w: 14, h: 6 });
    g.sphere(1.9, '#9fe8ff', 0, 0.9, 0, { sy: 0.8, w: 10, h: 5, glow: true });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      g.sphere(0.25, P.glow, Math.cos(a) * 3.6, 0.1, Math.sin(a) * 3.6, { glow: true, w: 5, h: 3 });
    }
    g.pop();
    for (let i = 0; i < 4; i++) g.dodec(0.5, P.rock, r.range(-4, 4), 0.1, r.range(2, 4.5));
    return { r: 3.8, h: 4 };
  },
  radio_dish(g, r, P, A) {
    g.box(3, 0.5, 3, P.stone);
    g.cyl(0.6, 0.9, 4, 8, P.metal, 0, 0.5, 0);
    const dish = new Geo(r.next);
    dish.push(0, 0, 0, 0, 1, 0.6);
    dish.lathe([[0, 0], [2, 0.6], [3.6, 1.8], [4.4, 3]], 14, P.main, 0, 0, 0);
    dish.lathe([[4.3, 3], [3.5, 1.9], [1.9, 0.75], [0, 0.15]], 14, darken(P.main, 0.1), 0, 0, 0);
    dish.cyl(0.08, 0.08, 3.4, 4, P.metal, 0, 0.4, 0);
    dish.sphere(0.3, P.glow, 0, 3.8, 0, { glow: true, w: 5, h: 4 });
    dish.pop();
    A.spin(dish, [0, 4.4, 0], 'y', 0.06);
    return { r: 3, h: 9 };
  },
  portal(g, r, P, A) {
    g.box(6.5, 0.4, 2.2, P.stone);
    for (const s of [-1, 1]) g.box(0.8, 1.2, 1.2, darken(P.stone, 0.1), s * 2.6, 0.4, 0);
    const ring = new Geo(r.next);
    ring.torus(2.6, 0.35, P.main, 0, 0, 0, { tubular: 16, radial: 5 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ring.oct(0.3, P.glow, Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0, { glow: true });
    }
    ring.cyl(2.25, 2.25, 0.05, 16, lighten(P.accent, 0.25), 0, 0, -0.025, { rx: Math.PI / 2, glow: true });
    A.spin(ring, [0, 3.2, 0], 'z', 0.5);
    return { r: 0, h: 6.5, colliders: [{ x: -2.6, z: 0, r: 0.8 }, { x: 2.6, z: 0, r: 0.8 }] };
  },
  stone_circle(g, r, P) {
    const n = 9, R = 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const h = r.range(2.4, 3.6);
      g.box(1.1, h, 0.7, i % 2 ? P.main : lighten(P.main, 0.05), Math.sin(a) * R, 0, Math.cos(a) * R, { ry: a, rz: r.range(-0.08, 0.08) });
    }
    g.box(1.6, 0.7, 1.2, darken(P.main, 0.08), 0, 0, 0);
    g.oct(0.35, P.glow, 0, 1.2, 0, { glow: true });
    const cols = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; cols.push({ x: Math.sin(a) * R, z: Math.cos(a) * R, r: 0.7 }); }
    cols.push({ x: 0, z: 0, r: 0.9 });
    return { r: 0, h: 4, colliders: cols };
  },
  totem(g, r, P) {
    const n = 4;
    for (let i = 0; i < n; i++) {
      const c = i % 2 ? P.main : P.accent, y = i * 1.6;
      g.cyl(0.8, 0.85, 1.6, 8, c, 0, y, 0);
      g.box(0.35, 0.3, 0.2, '#f6efe0', -0.3, y + 0.9, 0.75);
      g.box(0.35, 0.3, 0.2, '#f6efe0', 0.3, y + 0.9, 0.75);
      g.box(0.7, 0.18, 0.2, darken(c, 0.4), 0, y + 0.35, 0.78);
    }
    g.box(3.6, 0.5, 0.6, P.accent, 0, n * 1.6 - 0.8, 0.2);
    g.cone(0.9, 1.0, 8, P.main, 0, n * 1.6, 0);
    return { r: 1, h: n * 1.6 + 1 };
  },
  campfire(g, r, P, A) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      g.dodec(0.3, P.rock, Math.cos(a) * 0.9, 0.1, Math.sin(a) * 0.9);
    }
    for (let i = 0; i < 4; i++) g.cyl(0.12, 0.12, 1.4, 5, P.trunk, 0, 0.15, 0, { rz: Math.PI / 2 - 0.4, ry: i * Math.PI / 2, s: 1 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.5;
      g.cyl(0.3, 0.32, 1.8, 6, P.trunk, Math.cos(a) * 2.6 - 0.9 * Math.sin(a), 0.3, Math.sin(a) * 2.6 + 0.9 * Math.cos(a), { rz: Math.PI / 2, ry: -a + Math.PI / 2 });
    }
    const fire = new Geo(r.next);
    fire.cone(0.55, 1.4, 5, '#ff8a2a', 0, 0, 0, { glow: true });
    fire.cone(0.35, 1.0, 5, '#ffd25a', 0.1, 0, 0.05, { glow: true, ry: 0.6 });
    fire.cone(0.25, 0.8, 4, '#ff5a2a', -0.25, 0, -0.1, { glow: true });
    A.bob(fire, [0, 0.2, 0], 0.08, 9);
    return { r: 1.2, h: 2.5 };
  },
  well(g, r, P) {
    g.cyl(1.2, 1.3, 1.0, 10, P.stone);
    g.cyl(0.95, 0.95, 0.05, 10, '#1f2b33', 0, 0.85, 0);
    for (const s of [-1, 1]) g.box(0.2, 2.4, 0.2, P.wood, s * 1.0, 0.9, 0);
    g.roof(2.6, 0.9, 1.6, P.accent, 0, 3.2, 0, { ry: 0 });
    g.cyl(0.12, 0.12, 2, 6, P.wood, -1, 2.6, 0, { rz: -Math.PI / 2 });
    g.cyl(0.2, 0.18, 0.35, 6, P.wood, 0, 1.6, 0);
    return { r: 1.4, h: 4.2 };
  },
  big_top(g, r, P) {
    const n = 14, R = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      g.box(2.75, 4, 0.2, i % 2 ? P.main : '#fbf6ec', Math.sin(a) * R, 0, Math.cos(a) * R, { ry: a });
    }
    g.cone(6.4, 4.6, n, P.main, 0, 4, 0);
    g.cyl(6.5, 6.5, 0.5, n, '#fbf6ec', 0, 3.8, 0);
    g.cyl(0.08, 0.08, 2, 4, P.metal, 0, 8.4, 0);
    g.box(1.2, 0.7, 0.04, P.accent, 0.6, 9.6, 0);
    g.box(2.4, 3, 0.3, darken(P.main, 0.5), 0, 0, R + 0.05);
    return { r: 6, h: 10.5 };
  },
  skyscraper(g, r, P) {
    const floors = r.int(10, 14), fh = 1.7, w = 6, h = floors * fh;
    g.box(w, h, w, P.main);
    for (let f = 0; f < floors; f++) for (let c = 0; c < 4; c++) {
      const x = -w / 2 + (c + 0.5) * (w / 4), lit = r.chance(0.6);
      for (const [px, pz, ry] of [[x, w / 2, 0], [x, -w / 2, 0], [w / 2, x, 1], [-w / 2, x, 1]]) {
        g.box(0.9, 1.0, 0.08, lit ? P.glow : darken(P.main, 0.35), px, f * fh + 0.4, pz, { ry: ry * Math.PI / 2, glow: lit });
      }
    }
    g.box(w * 0.7, 2, w * 0.7, lighten(P.main, 0.1), 0, h, 0);
    g.cyl(0.08, 0.15, 5, 4, P.metal, 0, h + 2, 0);
    g.sphere(0.25, '#ff4a4a', 0, h + 7.1, 0, { glow: true, w: 5, h: 3 });
    return { r: 4.4, h: h + 7 };
  },
  volcano(g, r, P, A) {
    g.cyl(3, 9, 7, 11, P.main);
    g.cyl(2.8, 2.8, 0.1, 11, '#ff6a1a', 0, 6.85, 0, { glow: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + r.range(0, 0.4);
      g.box(0.5, 0.1, 4.5, '#ff7a2a', Math.sin(a) * 4.6, 3.6, Math.cos(a) * 4.6, { ry: a, rx: 0.7, glow: true });
    }
    for (let i = 0; i < 8; i++) {
      const a = r.range(0, TAU);
      g.dodec(r.range(0.6, 1.2), darken(P.main, 0.15), Math.sin(a) * 9, 0.2, Math.cos(a) * 9);
    }
    const smoke = new Geo(r.next);
    for (let i = 0; i < 4; i++) smoke.ico(1.2 + i * 0.4, '#8a8580', r.range(-0.6, 0.6), i * 1.6, r.range(-0.6, 0.6));
    A.bob(smoke, [0, 8.5, 0], 0.6, 0.7);
    return { r: 8, h: 14 };
  },
  igloo(g, r, P) {
    g.sphere(3, P.main, 0, 0, 0, { sy: 0.85, w: 10, h: 6 });
    g.cyl(1, 1.1, 2.2, 8, lighten(P.main, 0.05), 0, 1, 2.2, { rx: Math.PI / 2 });
    g.box(1.2, 1.4, 0.1, '#3a5670', 0, 0.05, 3.25);
    for (let i = 1; i < 4; i++) g.torus(3 * Math.cos(i * 0.4) * 1.0, 0.04, darken(P.main, 0.06), 0, 3 * 0.85 * Math.sin(i * 0.4), 0, { rx: Math.PI / 2, tubular: 14, radial: 3 });
    return { r: 3, h: 3 };
  },
  pagoda(g, r, P) {
    const tiers = 4;
    for (let i = 0; i < tiers; i++) {
      const w = 5 - i * 0.9, y = i * 2.4;
      g.box(w * 0.75, 2, w * 0.75, i === 0 ? P.main : lighten(P.main, 0.04), 0, y, 0);
      g.cone(w * 0.85, 0.9, 4, P.accent, 0, y + 1.8, 0, { ry: Math.PI / 4 });
      g.box(0.6, 0.8, 0.1, P.glow, 0, y + 0.6, w * 0.375 + 0.01, { glow: true });
    }
    g.cyl(0.05, 0.12, 2.2, 5, '#e8c45a', 0, tiers * 2.4 + 0.4, 0);
    return { r: 2.6, h: tiers * 2.4 + 2.8 };
  },
  crystal_spire(g, r, P) {
    g.cyl(0.0001, 1.6, 3, 6, lighten(P.main, 0.25), 0, 8, 0, { glow: true });
    g.cyl(1.6, 1.2, 8, 6, P.main, 0, 0, 0, { glow: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU, d = 2.2, h = r.range(2.5, 4.5);
      g.cyl(0.0001, 0.5, h * 0.3, 5, lighten(P.main, 0.3), Math.cos(a) * d, h * 0.7, Math.sin(a) * d, { rz: Math.cos(a) * 0.35, rx: -Math.sin(a) * 0.35, glow: true });
      g.cyl(0.5, 0.4, h * 0.7, 5, shiftHue(P.main, 0.05, 0, 0), Math.cos(a) * d, 0, Math.sin(a) * d, { rz: Math.cos(a) * 0.35, rx: -Math.sin(a) * 0.35, glow: true });
    }
    g.dodec(1.8, P.rock, 0, 0, 0, { sy: 0.4 });
    return { r: 2.4, h: 11 };
  },
  skeleton(g, r, P) {
    const bone = P.main;
    for (let i = 0; i < 9; i++) {
      const z = -5 + i * 1.1, s = 1 - Math.abs(i - 4) * 0.08;
      g.torus(2.6 * s, 0.16, bone, 0, 0.2, z, { arc: Math.PI, tubular: 9, radial: 3 });
      g.sphere(0.35, bone, 0, 2.6 * s + 0.2, z, { w: 5, h: 3 });
    }
    g.sphere(1.7, bone, 0, 1.5, 6.5, { sz: 1.5, w: 8, h: 6 });
    g.sphere(0.4, '#2a2a2a', 0.8, 2.0, 7.4, { w: 5, h: 4 });
    g.sphere(0.4, '#2a2a2a', -0.8, 2.0, 7.4, { w: 5, h: 4 });
    for (let i = 0; i < 6; i++) g.cone(0.12, 0.5, 4, bone, -0.75 + i * 0.3, 0.3, 8.6, { rx: Math.PI });
    for (let i = 0; i < 6; i++) g.sphere(0.3 - i * 0.03, bone, 0, 0.5, -5.8 - i * 0.7, { w: 5, h: 3 });
    return { r: 0, h: 4, colliders: [{ x: 0, z: 6.5, r: 1.8 }, { x: 2.5, z: 0, r: 0.6 }, { x: -2.5, z: 0, r: 0.6 }] };
  },
  gazebo(g, r, P) {
    g.cyl(3.2, 3.3, 0.5, 8, P.stone);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + Math.PI / 8;
      g.cyl(0.15, 0.15, 3, 6, '#fbf6ec', Math.sin(a) * 2.9, 0.5, Math.cos(a) * 2.9);
    }
    g.cyl(3.3, 3.3, 0.3, 8, '#fbf6ec', 0, 3.5, 0);
    g.cone(3.6, 2.2, 8, P.accent, 0, 3.8, 0);
    g.sphere(0.25, P.glow, 0, 6.1, 0, { glow: true, w: 5, h: 4 });
    const cols = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + Math.PI / 8; if (i !== 0 && i !== 7) cols.push({ x: Math.sin(a) * 2.9, z: Math.cos(a) * 2.9, r: 0.35 }); }
    return { r: 0, h: 6.5, colliders: cols };
  },
  hot_air_balloon(g, r, P, A) {
    g.box(1.6, 1.0, 1.6, P.wood, 0, 0, 0);
    for (let i = 0; i < 4; i++) g.dodec(0.3, '#c2a77a', -0.9 + (i % 2) * 1.8, 0.1, -0.9 + Math.floor(i / 2) * 1.8);
    const balloon = new Geo(r.next);
    balloon.sphere(3, P.main, 0, 0, 0, { w: 10, h: 8, sy: 1.1 });
    balloon.cyl(3.08, 3.08, 0.9, 10, P.accent, 0, -0.45, 0);
    balloon.cyl(2.2, 2.2, 0.6, 10, P.accent, 0, 2.0, 0);
    balloon.cyl(0.7, 1.5, 1.2, 10, P.accent, 0, -3.6, 0);
    for (const [x, z] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]]) balloon.cyl(0.02, 0.02, 3, 3, '#5a4630', x, -5.6, z);
    balloon.box(1.6, 1.0, 1.6, P.wood, 0, -6.6, 0);
    balloon.cone(0.35, 0.9, 5, '#ffb347', 0, -5.6, 0, { glow: true });
    A.bob(balloon, [0, 11, 0], 0.6, 0.6);
    return { r: 1.2, h: 14 };
  },
  billboard(g, r, P, A) {
    for (const s of [-1, 1]) g.box(0.35, 5, 0.35, P.metal, s * 3, 0, -0.2);
    g.box(7.4, 3.6, 0.3, darken(P.main, 0.2), 0, 4, -0.2);
    A.billboard(7, 3.2, [0, 5.8, 0]);
    for (const s of [-1, 0, 1]) g.box(0.3, 0.3, 0.6, '#333', s * 2.5, 7.75, 0.2);
    return { r: 0, h: 8, colliders: [{ x: -3, z: -0.2, r: 0.4 }, { x: 3, z: -0.2, r: 0.4 }] };
  },
};

// Default "main" colour per landmark: a palette key, or a fixed hex colour.
export const LANDMARK_MAIN = {
  windmill: 'stone', tower: 'stone', fountain: 'stone', cottage: 'plaster', arch: 'stone', castle: 'stone',
  throne: 'accent', pyramid: '#d8b878', temple: '#efe8da', statue: 'stone', monument: '#cfc6b4', monolith: '#1c1c22',
  obelisk: 'stone', giant_tree: 'foliage', mushroom_house: 'accent', lighthouse: '#f6f2ea', clocktower: 'stone',
  ferris_wheel: 'accent', carousel: 'accent', stage: 'accent', shop: 'plaster', escalator: '#9aa3ad', kiosk: 'accent',
  dome: 'plaster', bridge: 'stone', shipwreck: 'wood', rocket: 'metal', ufo: '#a9b2bd', radio_dish: '#e9ecef',
  portal: 'accent', stone_circle: 'stone', totem: 'wood', campfire: 'rock', well: 'stone', big_top: 'accent',
  skyscraper: 'stone', volcano: 'rock', igloo: '#eef6ff', pagoda: 'accent', crystal_spire: 'accent', skeleton: '#efe6d2',
  gazebo: 'accent', hot_air_balloon: 'accent', billboard: 'metal',
};
