// Body plans for the locals (and the monument statue). Each builder draws a
// creature at the origin, facing +z, feet at y = 0, about 1-1.6 units tall,
// and returns where its head is so a hat can be added on top.
import { lighten, darken, mix } from './colors.js';

const TAU = Math.PI * 2;
const SKIN = ['#f2c9a0', '#e0b088', '#c68a62', '#9a6440', '#6e4630', '#f6d8bc'];

function eyes(g, x, y, z, spread, r = 0.075, o = {}) {
  for (const s of [-1, 1]) {
    g.sphere(r, o.white || '#ffffff', x + s * spread, y, z, { w: 6, h: 4, jitter: 0 });
    g.sphere(r * 0.55, o.pupil || '#1b1b1f', x + s * spread, y + r * 0.05, z + r * 0.62, { w: 5, h: 3, jitter: 0, glow: !!o.glow });
  }
}

export const BODIES = {
  frog(g, c) {
    g.sphere(0.55, c.color, 0, 0.38, 0, { sy: 0.68, sz: 1.05, w: 8, h: 6 });
    g.sphere(0.4, lighten(c.color, 0.35), 0, 0.3, 0.2, { sy: 0.55, w: 7, h: 4 });
    for (const s of [-1, 1]) {
      g.sphere(0.2, c.color, s * 0.24, 0.72, 0.18, { w: 6, h: 4 });
      g.sphere(0.26, darken(c.color, 0.08), s * 0.42, 0.14, -0.12, { sy: 0.5, sz: 1.4, w: 6, h: 4 });
      g.sphere(0.11, darken(c.color, 0.05), s * 0.3, 0.06, 0.42, { sy: 0.5, w: 5, h: 3 });
      g.sphere(0.07, c.accent, s * 0.3, 0.45, -0.25, { w: 4, h: 3 });
    }
    eyes(g, 0, 0.8, 0.26, 0.24, 0.09);
    g.box(0.36, 0.03, 0.04, darken(c.color, 0.45), 0, 0.5, 0.52);
    return { head: [0, 0.6, 0.15], headR: 0.36, top: 0.86 };
  },
  bird(g, c) {
    g.sphere(0.42, c.color, 0, 0.62, 0, { sy: 1.1, w: 8, h: 6 });
    g.sphere(0.3, lighten(c.color, 0.25), 0, 0.55, 0.2, { sy: 1.0, w: 6, h: 4 });
    g.sphere(0.3, c.color, 0, 1.12, 0.06, { w: 8, h: 6 });
    g.cone(0.1, 0.26, 5, c.accent, 0, 1.06, 0.33, { rx: Math.PI / 2 });
    eyes(g, 0, 1.18, 0.24, 0.13, 0.065);
    for (const s of [-1, 1]) {
      g.sphere(0.3, darken(c.color, 0.1), s * 0.4, 0.66, -0.02, { sx: 0.35, sy: 0.9, sz: 1.1, w: 6, h: 4 });
      g.cyl(0.035, 0.035, 0.28, 4, c.accent, s * 0.15, 0.02, 0);
      g.box(0.16, 0.04, 0.22, c.accent, s * 0.15, 0, 0.06);
    }
    g.cone(0.18, 0.3, 4, darken(c.color, 0.15), 0, 0.58, -0.42, { rx: -Math.PI / 2 - 0.4 });
    return { head: [0, 1.12, 0.06], headR: 0.3, top: 1.4 };
  },
  fish(g, c) {
    g.sphere(0.45, c.color, 0, 0.78, 0, { sz: 1.35, sx: 0.75, w: 8, h: 6 });
    g.sphere(0.32, lighten(c.color, 0.3), 0, 0.68, 0.1, { sz: 1.2, sx: 0.6, w: 6, h: 4 });
    g.cone(0.36, 0.45, 4, darken(c.color, 0.1), 0, 0.78, -0.62, { rx: -Math.PI / 2, sx: 0.25 });
    g.box(0.04, 0.32, 0.4, c.accent, 0, 1.15, -0.05);
    for (const s of [-1, 1]) g.box(0.03, 0.18, 0.28, c.accent, s * 0.32, 0.62, 0.05, { rz: s * 0.6 });
    eyes(g, 0, 0.92, 0.42, 0.2, 0.08);
    g.torus(0.07, 0.03, darken(c.color, 0.3), 0, 0.72, 0.6, { tubular: 8, radial: 3 });
    return { head: [0, 0.85, 0.2], headR: 0.36, top: 1.2 };
  },
  robot(g, c) {
    for (const s of [-1, 1]) {
      g.cyl(0.08, 0.08, 0.32, 5, darken(c.color, 0.3), s * 0.2, 0, 0);
      g.box(0.22, 0.08, 0.3, darken(c.color, 0.4), s * 0.2, 0, 0.04);
      g.cyl(0.06, 0.06, 0.42, 5, darken(c.color, 0.25), s * 0.5, 0.42, 0, { rz: s * 0.2 });
      g.sphere(0.09, c.accent, s * 0.58, 0.38, 0, { w: 5, h: 3 });
    }
    g.box(0.8, 0.62, 0.56, c.color, 0, 0.3, 0);
    g.box(0.42, 0.26, 0.04, darken(c.color, 0.35), 0, 0.48, 0.28);
    g.box(0.1, 0.1, 0.04, c.accent, -0.1, 0.55, 0.3, { glow: true });
    g.box(0.1, 0.1, 0.04, '#ff6a6a', 0.08, 0.55, 0.3, { glow: true });
    g.cyl(0.08, 0.08, 0.12, 5, darken(c.color, 0.3), 0, 0.92, 0);
    g.box(0.6, 0.44, 0.48, lighten(c.color, 0.08), 0, 1.02, 0);
    g.box(0.44, 0.16, 0.04, '#1b1b1f', 0, 1.2, 0.24);
    for (const s of [-1, 1]) g.box(0.1, 0.07, 0.04, c.accent, s * 0.12, 1.22, 0.26, { glow: true });
    return { head: [0, 1.24, 0], headR: 0.3, top: 1.46 };
  },
  blob(g, c) {
    g.sphere(0.58, c.color, 0, 0.5, 0, { sy: 0.85, w: 10, h: 7 });
    g.sphere(0.12, lighten(c.color, 0.6), -0.22, 0.82, 0.32, { w: 5, h: 3 });
    eyes(g, 0, 0.62, 0.46, 0.17, 0.09);
    g.box(0.18, 0.04, 0.04, darken(c.color, 0.5), 0, 0.44, 0.55);
    return { head: [0, 0.6, 0], headR: 0.5, top: 0.98 };
  },
  person(g, c, r) {
    const skin = c.skin || SKIN[Math.floor(r() * SKIN.length)];
    for (const s of [-1, 1]) {
      g.cyl(0.09, 0.1, 0.4, 5, darken(c.accent, 0.5), s * 0.14, 0, 0);
      g.box(0.18, 0.08, 0.26, '#2b2b2b', s * 0.14, 0, 0.05);
      g.cyl(0.07, 0.08, 0.5, 5, c.color, s * 0.38, 0.38, 0, { rz: s * 0.25 });
      g.sphere(0.08, skin, s * 0.45, 0.36, 0, { w: 5, h: 3 });
    }
    g.cyl(0.3, 0.4, 0.62, 8, c.color, 0, 0.36, 0);
    g.box(0.06, 0.4, 0.02, c.accent, 0, 0.5, 0.36, { rx: -0.15 });
    g.sphere(0.3, skin, 0, 1.18, 0, { w: 8, h: 6 });
    g.sphere(0.31, darken(c.accent, 0.4), 0, 1.24, -0.04, { sy: 0.8, w: 8, h: 5 });
    eyes(g, 0, 1.2, 0.26, 0.11, 0.06);
    g.sphere(0.05, darken(skin, 0.15), 0, 1.1, 0.3, { w: 4, h: 3 });
    return { head: [0, 1.18, 0], headR: 0.3, top: 1.46 };
  },
  critter(g, c, r) {
    const v = c.variant || 'cat';
    const col = v === 'sheep' ? '#3a3433' : c.color;
    const low = v === 'lizard' || v === 'turtle';
    const by = low ? 0.34 : 0.55;
    if (v === 'sheep') { for (let i = 0; i < 7; i++) g.ico(0.26, '#f4f0e6', (i % 3 - 1) * 0.2, by + (i % 2) * 0.12, (Math.floor(i / 3) - 1) * 0.24); }
    else g.sphere(0.38, col, 0, by, 0, { sz: low ? 1.6 : 1.4, sy: low ? 0.6 : 0.9, w: 8, h: 6 });
    if (v === 'turtle') g.sphere(0.5, c.accent, 0, by + 0.08, -0.05, { sy: 0.6, w: 8, h: 4 });
    if (v === 'cow') for (let i = 0; i < 3; i++) g.sphere(0.13, '#2a2a2a', (i - 1) * 0.22, by + 0.15, (i - 1) * 0.18, { sx: 0.3, w: 5, h: 3 });
    for (const [x, z] of [[-0.2, 0.3], [0.2, 0.3], [-0.2, -0.3], [0.2, -0.3]]) g.cyl(0.07, 0.08, by - 0.05, 5, darken(col, 0.12), x * (low ? 1.4 : 1), 0, z);
    const hy = low ? by + 0.12 : by + 0.34, hz = low ? 0.55 : 0.46;
    g.sphere(0.28, col, 0, hy, hz, { w: 8, h: 6 });
    eyes(g, 0, hy + 0.06, hz + 0.22, 0.11, 0.06);
    g.sphere(0.05, v === 'pig' ? '#d87a8a' : '#2a2a2a', 0, hy - 0.04, hz + 0.28, { w: 4, h: 3 });
    if (v === 'cat') for (const s of [-1, 1]) g.cone(0.1, 0.2, 4, col, s * 0.15, hy + 0.2, hz - 0.02);
    if (v === 'dog') for (const s of [-1, 1]) g.sphere(0.13, darken(col, 0.2), s * 0.26, hy, hz - 0.02, { sy: 1.6, sx: 0.5, w: 5, h: 4 });
    if (v === 'rabbit') for (const s of [-1, 1]) g.sphere(0.08, col, s * 0.1, hy + 0.38, hz - 0.04, { sy: 3.2, sz: 0.6, w: 5, h: 4 });
    if (v === 'mouse') for (const s of [-1, 1]) g.cyl(0.14, 0.14, 0.04, 8, lighten(col, 0.15), s * 0.2, hy + 0.2, hz - 0.04, { rx: Math.PI / 2 });
    if (v === 'pig') { g.cyl(0.11, 0.11, 0.08, 7, lighten(col, 0.1), 0, hy - 0.05, hz + 0.24, { rx: Math.PI / 2 }); for (const s of [-1, 1]) g.cone(0.08, 0.14, 4, col, s * 0.15, hy + 0.2, hz, { rz: -s * 0.4 }); }
    if (v === 'cow') for (const s of [-1, 1]) g.cone(0.05, 0.2, 4, '#efe6d2', s * 0.18, hy + 0.2, hz - 0.04, { rz: -s * 0.6 });
    if (v === 'sheep') for (const s of [-1, 1]) g.sphere(0.07, col, s * 0.27, hy + 0.04, hz, { sx: 1.6, w: 4, h: 3 });
    const tail = v === 'lizard' ? 0.7 : v === 'rabbit' || v === 'sheep' || v === 'turtle' ? 0 : 0.32;
    if (tail) g.cyl(0.03, 0.08, tail, 4, col, 0, by + (low ? -0.1 : 0.1), -0.45, { rx: low ? -1.45 : -0.6 });
    if (v === 'rabbit') g.sphere(0.11, '#ffffff', 0, by + 0.05, -0.5, { w: 5, h: 3 });
    return { head: [0, hy, hz], headR: 0.28, top: hy + 0.26 };
  },
  bear(g, c) {
    for (const s of [-1, 1]) {
      g.sphere(0.18, darken(c.color, 0.1), s * 0.24, 0.14, 0.05, { sy: 0.8, w: 6, h: 4 });
      g.sphere(0.15, c.color, s * 0.5, 0.62, 0.12, { sy: 1.4, w: 6, h: 4 });
    }
    g.sphere(0.55, c.color, 0, 0.62, 0, { sy: 1.05, w: 9, h: 7 });
    g.sphere(0.34, lighten(c.color, 0.3), 0, 0.55, 0.28, { sy: 1.1, w: 6, h: 4 });
    g.sphere(0.38, c.color, 0, 1.28, 0.04, { w: 9, h: 6 });
    for (const s of [-1, 1]) g.sphere(0.13, c.color, s * 0.27, 1.6, 0, { w: 6, h: 4 });
    g.sphere(0.15, lighten(c.color, 0.35), 0, 1.2, 0.34, { sy: 0.8, w: 6, h: 4 });
    g.sphere(0.06, '#1b1b1f', 0, 1.25, 0.47, { w: 4, h: 3 });
    eyes(g, 0, 1.36, 0.32, 0.13, 0.06);
    return { head: [0, 1.28, 0.04], headR: 0.38, top: 1.64 };
  },
  bug(g, c) {
    g.sphere(0.42, c.color, 0, 0.42, -0.08, { sz: 1.3, sy: 0.75, w: 8, h: 6 });
    g.box(0.04, 0.06, 0.95, darken(c.color, 0.4), 0, 0.72, -0.1);
    for (let i = 0; i < 4; i++) g.sphere(0.07, c.accent, (i % 2 ? 1 : -1) * 0.2, 0.68, -0.25 + i * 0.12, { w: 4, h: 3 });
    g.sphere(0.24, darken(c.color, 0.35), 0, 0.44, 0.46, { w: 7, h: 5 });
    eyes(g, 0, 0.52, 0.64, 0.1, 0.06);
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) g.cyl(0.025, 0.03, 0.42, 3, '#222', s * 0.3, 0.02, -0.25 + i * 0.25, { rz: s * 1.0 });
    for (const s of [-1, 1]) { g.cyl(0.015, 0.015, 0.4, 3, '#222', s * 0.08, 0.6, 0.55, { rz: s * 0.5, rx: 0.5 }); g.sphere(0.04, c.accent, s * 0.2, 0.92, 0.7, { w: 4, h: 3 }); }
    return { head: [0, 0.48, 0.46], headR: 0.24, top: 0.68 };
  },
  snail(g, c) {
    g.sphere(0.3, c.accent, 0, 0.2, 0.15, { sz: 2.3, sy: 0.6, w: 8, h: 5 });
    g.sphere(0.24, c.accent, 0, 0.42, 0.55, { w: 7, h: 5 });
    g.sphere(0.48, c.color, 0, 0.62, -0.15, { sz: 0.8, w: 9, h: 7 });
    g.torus(0.3, 0.07, darken(c.color, 0.2), 0, 0.62, -0.15, { ry: Math.PI / 2, rz: 0, tubular: 10, radial: 4, sx: 1 });
    for (const s of [-1, 1]) {
      g.cyl(0.03, 0.03, 0.32, 4, c.accent, s * 0.1, 0.55, 0.62, { rz: s * 0.25 });
      g.sphere(0.07, '#ffffff', s * 0.18, 0.88, 0.62, { w: 5, h: 4 });
      g.sphere(0.04, '#1b1b1f', s * 0.18, 0.89, 0.67, { w: 4, h: 3 });
    }
    return { head: [0, 0.42, 0.55], headR: 0.24, top: 0.96 };
  },
  ghost(g, c) {
    g.sphere(0.5, c.color, 0, 1.05, 0, { w: 9, h: 6, glow: true, sy: 1.05 });
    g.cyl(0.5, 0.58, 0.6, 9, c.color, 0, 0.45, 0, { glow: true, open: true });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; g.cone(0.14, 0.24, 4, c.color, Math.cos(a) * 0.48, 0.24, Math.sin(a) * 0.48, { rx: Math.PI, glow: true }); }
    for (const s of [-1, 1]) g.sphere(0.08, '#1b1b26', s * 0.16, 1.12, 0.44, { sy: 1.5, w: 5, h: 4 });
    g.sphere(0.07, '#1b1b26', 0, 0.9, 0.47, { sy: 1.4, w: 5, h: 4 });
    for (const s of [-1, 1]) g.sphere(0.14, c.color, s * 0.55, 0.85, 0.1, { sx: 0.6, sy: 1.5, glow: true, w: 5, h: 4 });
    return { head: [0, 1.05, 0], headR: 0.5, top: 1.55 };
  },
  mushroom(g, c) {
    for (const s of [-1, 1]) g.sphere(0.13, '#e0d0b0', s * 0.15, 0.08, 0.05, { sy: 0.6, sz: 1.4, w: 5, h: 3 });
    g.cyl(0.24, 0.3, 0.75, 8, '#f4ead6', 0, 0.05, 0);
    eyes(g, 0, 0.55, 0.26, 0.1, 0.06);
    g.box(0.1, 0.03, 0.03, '#5a4632', 0, 0.42, 0.3);
    g.sphere(0.62, c.color, 0, 0.82, 0, { sy: 0.6, w: 10, h: 6 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; g.sphere(0.09, '#fffaf0', Math.cos(a) * 0.38, 1.1, Math.sin(a) * 0.38, { sy: 0.5, w: 5, h: 3 }); }
    g.sphere(0.1, '#fffaf0', 0, 1.18, 0, { sy: 0.5, w: 5, h: 3 });
    return { head: [0, 0.9, 0], headR: 0.45, top: 1.18 };
  },
  crab(g, c) {
    g.sphere(0.42, c.color, 0, 0.42, 0, { sx: 1.4, sy: 0.65, w: 9, h: 6 });
    for (const s of [-1, 1]) {
      g.cyl(0.03, 0.03, 0.28, 4, c.color, s * 0.12, 0.56, 0.18);
      g.sphere(0.075, '#ffffff', s * 0.12, 0.86, 0.2, { w: 5, h: 4 });
      g.sphere(0.04, '#1b1b1f', s * 0.12, 0.87, 0.26, { w: 4, h: 3 });
      g.cyl(0.05, 0.06, 0.4, 4, c.color, s * 0.58, 0.42, 0.22, { rz: s * 1.0, rx: 0.4 });
      g.sphere(0.17, lighten(c.color, 0.05), s * 0.78, 0.62, 0.42, { sx: 0.7, sz: 1.2, w: 6, h: 4 });
      g.cone(0.07, 0.2, 4, c.color, s * 0.78, 0.62, 0.55, { rx: Math.PI / 2 });
      for (let i = 0; i < 3; i++) g.cyl(0.025, 0.035, 0.4, 3, darken(c.color, 0.1), s * 0.55, 0.06, -0.15 + i * 0.15, { rz: s * 1.1 });
    }
    g.box(0.18, 0.03, 0.03, darken(c.color, 0.45), 0, 0.42, 0.36);
    return { head: [0, 0.5, 0.1], headR: 0.35, top: 0.95 };
  },
  octopus(g, c) {
    g.sphere(0.5, c.color, 0, 0.95, -0.05, { sy: 1.2, w: 9, h: 7 });
    eyes(g, 0, 0.88, 0.38, 0.18, 0.1);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      g.cyl(0.05, 0.11, 0.62, 5, darken(c.color, 0.05), Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3, { rz: -Math.cos(a) * 0.7, rx: Math.sin(a) * 0.7 });
    }
    for (let i = 0; i < 5; i++) g.sphere(0.05, lighten(c.color, 0.3), (i - 2) * 0.12, 1.3, 0.3, { w: 4, h: 3 });
    return { head: [0, 1.0, -0.05], headR: 0.5, top: 1.55 };
  },
  golem(g, c) {
    for (const s of [-1, 1]) {
      g.dodec(0.22, darken(c.color, 0.1), s * 0.25, 0.2, 0);
      g.dodec(0.2, c.color, s * 0.62, 0.92, 0.05);
      g.dodec(0.17, darken(c.color, 0.08), s * 0.7, 0.55, 0.08);
    }
    g.dodec(0.52, c.color, 0, 0.82, 0, { sy: 1.05 });
    g.dodec(0.32, lighten(c.color, 0.05), 0, 1.45, 0.05);
    for (const s of [-1, 1]) g.box(0.1, 0.06, 0.04, c.accent, s * 0.12, 1.5, 0.33, { glow: true });
    g.box(0.06, 0.2, 0.04, mix(c.accent, '#ffffff', 0.3), 0.2, 0.9, 0.48, { glow: true, rz: 0.4 });
    return { head: [0, 1.45, 0.05], headR: 0.32, top: 1.75 };
  },
  snowman(g, c) {
    g.sphere(0.5, c.color, 0, 0.45, 0, { w: 9, h: 7 });
    g.sphere(0.36, c.color, 0, 1.08, 0, { w: 9, h: 7 });
    g.sphere(0.27, c.color, 0, 1.58, 0, { w: 8, h: 6 });
    g.cone(0.05, 0.28, 5, c.accent, 0, 1.56, 0.25, { rx: Math.PI / 2 });
    for (const s of [-1, 1]) {
      g.sphere(0.04, '#1b1b1f', s * 0.1, 1.66, 0.23, { w: 4, h: 3 });
      g.cyl(0.02, 0.03, 0.6, 3, '#6b4a2f', s * 0.32, 1.12, 0, { rz: s * 1.1 });
    }
    for (let i = 0; i < 3; i++) g.sphere(0.04, '#1b1b1f', 0, 0.95 + i * 0.14, 0.35, { w: 4, h: 3 });
    g.torus(0.28, 0.06, lighten(c.accent, 0.1), 0, 1.36, 0, { rx: Math.PI / 2, tubular: 10, radial: 3 });
    return { head: [0, 1.58, 0], headR: 0.27, top: 1.83 };
  },
  sprout(g, c) {
    for (const s of [-1, 1]) g.sphere(0.12, darken(c.color, 0.2), s * 0.13, 0.06, 0.04, { sy: 0.6, sz: 1.4, w: 5, h: 3 });
    g.cyl(0.12, 0.18, 0.7, 6, c.color, 0, 0.05, 0);
    for (const s of [-1, 1]) g.sphere(0.2, lighten(c.color, 0.1), s * 0.32, 0.52, 0, { sx: 1.4, sy: 0.35, rz: s * 0.4, w: 6, h: 3 });
    g.sphere(0.27, '#fff2c4', 0, 1.0, 0, { sz: 0.6, w: 8, h: 6 });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; g.sphere(0.15, c.accent, Math.cos(a) * 0.34, 1.0 + Math.sin(a) * 0.34, -0.04, { sz: 0.4, w: 6, h: 3 }); }
    eyes(g, 0, 1.04, 0.13, 0.09, 0.055);
    g.box(0.1, 0.025, 0.03, '#5a4632', 0, 0.92, 0.16);
    return { head: [0, 1.0, 0], headR: 0.3, top: 1.36 };
  },
};

// Hats sit on top of the head; s scales them to the head size.
export const HATS_BUILD = {
  none() {},
  top(g, x, y, z, s) { g.cyl(0.34 * s, 0.34 * s, 0.04, 10, '#1d1d22', x, y - 0.04, z); g.cyl(0.22 * s, 0.22 * s, 0.36 * s, 10, '#1d1d22', x, y - 0.02, z); g.cyl(0.225 * s, 0.225 * s, 0.07, 10, '#a83a3a', x, y + 0.02, z); },
  crown(g, x, y, z, s) {
    g.cyl(0.23 * s, 0.23 * s, 0.16 * s, 10, '#f2c24c', x, y - 0.06, z, { open: true });
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; g.cone(0.06 * s, 0.16 * s, 4, '#f2c24c', x + Math.cos(a) * 0.2 * s, y + 0.1 * s - 0.06, z + Math.sin(a) * 0.2 * s); }
    g.oct(0.05 * s, '#e0405a', x, y + 0.02, z + 0.23 * s, { glow: true });
  },
  party(g, x, y, z, s, c) { g.cone(0.17 * s, 0.48 * s, 8, c.accent, x, y - 0.05, z, { rz: 0.15 }); g.sphere(0.07 * s, '#ffffff', x - 0.07 * s, y + 0.4 * s, z, { w: 5, h: 3 }); },
  beanie(g, x, y, z, s, c) { g.sphere(0.3 * s, c.accent, x, y - 0.1 * s, z, { sy: 0.75, w: 8, h: 4 }); g.cyl(0.31 * s, 0.31 * s, 0.08 * s, 8, darken(c.accent, 0.2), x, y - 0.18 * s, z); g.sphere(0.08 * s, '#fffaf0', x, y + 0.14 * s, z, { w: 5, h: 3 }); },
  wizard(g, x, y, z, s) { g.cyl(0.44 * s, 0.44 * s, 0.03, 10, '#4a3a8a', x, y - 0.06, z); g.cone(0.26 * s, 0.7 * s, 8, '#4a3a8a', x, y - 0.05, z, { rx: -0.15 }); g.oct(0.06 * s, '#f2d25a', x, y + 0.25 * s, z + 0.17 * s, { glow: true }); },
  chef(g, x, y, z, s) { g.cyl(0.2 * s, 0.2 * s, 0.25 * s, 8, '#fbfaf6', x, y - 0.06, z); g.sphere(0.27 * s, '#fbfaf6', x, y + 0.24 * s, z, { sy: 0.7, w: 8, h: 4 }); },
  helmet(g, x, y, z, s) { g.sphere(0.34 * s, '#a8b0b8', x, y - 0.16 * s, z, { sy: 0.85, w: 9, h: 5 }); g.box(0.42 * s, 0.06 * s, 0.06, '#6a737c', x, y - 0.22 * s, z + 0.3 * s); g.cone(0.05 * s, 0.24 * s, 4, '#c0402f', x, y + 0.08 * s, z); },
  cap(g, x, y, z, s, c) { g.sphere(0.29 * s, c.accent, x, y - 0.12 * s, z, { sy: 0.7, w: 8, h: 4 }); g.box(0.3 * s, 0.03, 0.26 * s, c.accent, x, y - 0.14 * s, z + 0.32 * s); },
  cowboy(g, x, y, z, s) { g.cyl(0.5 * s, 0.5 * s, 0.04, 12, '#8a5a34', x, y - 0.06, z); g.cyl(0.2 * s, 0.24 * s, 0.26 * s, 8, '#8a5a34', x, y - 0.04, z); g.cyl(0.245 * s, 0.245 * s, 0.05, 8, '#3a2a1a', x, y - 0.02, z); },
  bow(g, x, y, z, s, c) { for (const k of [-1, 1]) g.cone(0.1 * s, 0.18 * s, 4, c.accent, x + k * 0.1 * s, y, z, { rz: k * Math.PI / 2 }); g.sphere(0.05 * s, c.accent, x, y, z, { w: 4, h: 3 }); },
  halo(g, x, y, z, s) { g.torus(0.22 * s, 0.035, '#ffe58a', x, y + 0.18 * s, z, { rx: Math.PI / 2, tubular: 12, radial: 3, glow: true }); },
  antenna(g, x, y, z, s, c) { for (const k of [-1, 1]) { g.cyl(0.015, 0.015, 0.32 * s, 3, '#555', x + k * 0.1 * s, y - 0.05, z, { rz: -k * 0.3 }); g.sphere(0.06 * s, c.accent, x + k * 0.19 * s, y + 0.25 * s, z, { glow: true, w: 5, h: 3 }); } },
  horns(g, x, y, z, s) { for (const k of [-1, 1]) g.cone(0.07 * s, 0.28 * s, 5, '#efe6d2', x + k * 0.18 * s, y - 0.06, z, { rz: -k * 0.5 }); },
  flower(g, x, y, z, s) { for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; g.sphere(0.07 * s, '#ff8ab5', x + Math.cos(a) * 0.1 * s, y + 0.02, z + Math.sin(a) * 0.1 * s, { sy: 0.5, w: 5, h: 3 }); } g.sphere(0.06 * s, '#ffe08a', x, y + 0.04, z, { w: 5, h: 3 }); g.cyl(0.015, 0.015, 0.1, 3, '#4a8a3a', x, y - 0.08, z); },
  pirate(g, x, y, z, s) { g.cyl(0.38 * s, 0.32 * s, 0.22 * s, 3, '#1d1d22', x, y - 0.08, z, { ry: Math.PI / 6 }); g.sphere(0.05 * s, '#f4f0e6', x, y + 0.04 * s, z + 0.2 * s, { w: 4, h: 3 }); },
  hardhat(g, x, y, z, s) { g.sphere(0.3 * s, '#f2c21a', x, y - 0.1 * s, z, { sy: 0.75, w: 8, h: 4 }); g.cyl(0.36 * s, 0.36 * s, 0.03, 10, '#f2c21a', x, y - 0.14 * s, z); g.box(0.04, 0.12 * s, 0.5 * s, '#e0a810', x, y - 0.08 * s, z); },
};

export function buildCreature(g, local, rnd) {
  const c = { color: local.color, accent: local.accent, variant: local.variant, skin: local.skin };
  const body = BODIES[local.species] || BODIES.blob;
  const info = body(g, c, rnd);
  const hat = HATS_BUILD[local.hat] || HATS_BUILD.none;
  const s = info.headR / 0.3;
  hat(g, info.head[0], info.top, info.head[2], s, c);
  return info;
}

export const GAITS = {
  frog: 'hop', mushroom: 'hop', snowman: 'hop', sprout: 'hop', bird: 'waddle', bear: 'waddle', fish: 'float', ghost: 'float',
  octopus: 'float', snail: 'glide', robot: 'glide', bug: 'scuttle', crab: 'scuttle', golem: 'stomp', critter: 'trot', person: 'trot', blob: 'squish',
};
export const SPEEDS = { hop: 1.6, waddle: 1.3, float: 1.1, glide: 0.8, scuttle: 2.2, stomp: 0.9, trot: 1.6, squish: 1.2 };
