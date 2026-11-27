// Everyday buildings: shops, diners, gas stations, schools, houses...
// Same contract as landmarks.js: local space, front faces +z, base at y = 0,
// returns { r, h, colliders? }. A.billboard(w, h, at, 'name') paints the
// landmark's name on a board; without 'name' it paints the sign text.
import { Geo } from './builder.js';
import { lighten, darken, shiftHue } from './colors.js';
import { PROPS2 } from './props2.js';

const TAU = Math.PI * 2;

// ---------------------------------------------------------------- rooftop gimmicks
// Giant objects that say what a shop is from across the map.
const TOPS = {
  washer(g, x, y, z, s, P) {
    g.box(2.2 * s, 2.4 * s, 2.0 * s, '#f4f4f0', x, y, z);
    g.cyl(0.8 * s, 0.8 * s, 0.12, 14, '#9aa3ad', x, y + 1.15 * s, z + 1.0 * s, { rx: Math.PI / 2 });
    g.cyl(0.62 * s, 0.62 * s, 0.1, 14, '#7fd0ff', x, y + 1.15 * s, z + 1.04 * s, { rx: Math.PI / 2, glow: true });
    g.box(1.8 * s, 0.3 * s, 0.1, '#c8ced4', x, y + 2.0 * s, z + 1.01 * s);
  },
  sock(g, x, y, z, s, P) {
    g.cyl(0.6 * s, 0.6 * s, 2.4 * s, 10, P.accent, x, y, z);
    g.cyl(0.62 * s, 0.62 * s, 0.4 * s, 10, '#ffffff', x, y + 2.0 * s, z);
    g.sphere(0.6 * s, P.accent, x, y, z + 0.5 * s, { sz: 1.6, w: 9, h: 6 });
  },
  cup(g, x, y, z, s) {
    g.cyl(1.0 * s, 0.75 * s, 1.6 * s, 12, '#f6f2ea', x, y, z);
    g.cyl(0.9 * s, 0.9 * s, 0.05, 12, '#5a3a22', x, y + 1.52 * s, z);
    g.torus(0.45 * s, 0.12 * s, '#f6f2ea', x + 1.05 * s, y + 0.8 * s, z, { tubular: 10 });
    for (let i = 0; i < 3; i++) g.sphere(0.25 * s, '#ffffff', x - 0.3 * s + i * 0.3 * s, y + 2.1 * s + i * 0.35 * s, z, { w: 5, h: 4, glow: true });
  },
  donut(g, x, y, z, s) {
    g.torus(1.1 * s, 0.5 * s, '#d8a05a', x, y + 1.6 * s, z, { tubular: 14, radial: 6 });
    g.torus(1.1 * s, 0.42 * s, '#ff8ab5', x, y + 1.6 * s, z + 0.12 * s, { tubular: 14, radial: 6 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; g.box(0.2 * s, 0.06 * s, 0.06, ['#fff', '#7fd0ff', '#ffe08a'][i % 3], x + Math.cos(a) * 1.1 * s, y + 1.6 * s + Math.sin(a) * 1.1 * s, z + 0.55 * s, { rz: a }); }
    g.box(0.2, 1.1 * s, 0.2, '#555', x, y, z);
  },
  pin(g, x, y, z, s) {
    g.lathe([[0, 0], [0.5, 0], [0.65, 0.8], [0.45, 1.8], [0.25, 2.3], [0.32, 2.8], [0.2, 3.2], [0, 3.3]].map(([a, b]) => [a * s, b * s]), 10, '#fbfaf6', x, y, z);
    g.cyl(0.29 * s, 0.31 * s, 0.25 * s, 10, '#e03a3a', x, y + 2.35 * s, z);
  },
  cone(g, x, y, z, s) {
    g.cone(0.7 * s, 2.2 * s, 10, '#e0b070', x, y + 2.2 * s, z, { rx: Math.PI });
    g.sphere(0.8 * s, '#ffb3cf', x, y + 2.6 * s, z, { w: 9, h: 6 });
    g.sphere(0.65 * s, '#fff4d8', x, y + 3.5 * s, z, { w: 9, h: 6 });
    g.sphere(0.15 * s, '#e03a3a', x, y + 4.2 * s, z, { w: 5, h: 4 });
  },
  slice(g, x, y, z, s) {
    g.push(x, y + 1.5 * s, z, 0, s, 0.3);
    g.cyl(1.6, 1.6, 0.3, 3, '#f2c24c', 0, 0, 0, { rx: Math.PI / 2, rz: Math.PI / 2 });
    g.box(3.2, 0.25, 0.4, '#c88a3a', 0, -1.2, -0.05);
    for (let i = 0; i < 4; i++) g.cyl(0.22, 0.22, 0.36, 8, '#c8402a', -0.6 + (i % 2) * 0.9, -0.4 + Math.floor(i / 2) * 0.6 - 0.2, -0.06, { rx: Math.PI / 2 });
    g.pop();
    g.box(0.2, 1.2 * s, 0.2, '#555', x, y, z);
  },
  bread(g, x, y, z, s) {
    g.sphere(1.2 * s, '#d89a52', x, y + 0.8 * s, z, { sx: 1.6, sy: 0.7, w: 10, h: 6 });
    for (let i = 0; i < 3; i++) g.box(0.12 * s, 0.1 * s, 0.9 * s, '#f0d6a0', x - 0.8 * s + i * 0.8 * s, y + 1.55 * s, z, { ry: 0.5 });
  },
  tooth(g, x, y, z, s) {
    g.sphere(1.0 * s, '#fbfbf6', x, y + 2.0 * s, z, { sx: 1.1, sy: 0.8, w: 9, h: 6 });
    for (const k of [-1, 1]) g.cone(0.45 * s, 1.6 * s, 7, '#fbfbf6', x + k * 0.45 * s, y + 1.9 * s, z, { rx: Math.PI });
    g.sphere(0.12 * s, '#ffffff', x - 0.4 * s, y + 2.4 * s, z + 0.7 * s, { w: 4, h: 3, glow: true });
  },
  book(g, x, y, z, s, P) {
    g.box(2.6 * s, 0.4 * s, 1.9 * s, P.accent, x, y, z, { rx: -0.1 });
    g.box(2.4 * s, 0.32 * s, 1.85 * s, '#fbf6ec', x + 0.08 * s, y + 0.04 * s, z, { rx: -0.1 });
    g.box(2.6 * s, 0.4 * s, 1.9 * s, shiftHue(P.accent, 0.3), x, y + 0.45 * s, z, { rx: -0.1, ry: 0.3 });
  },
  duck(g, x, y, z, s) {
    g.sphere(1.1 * s, '#f6d23a', x, y + 0.9 * s, z, { sz: 1.3, sy: 0.8, w: 10, h: 7 });
    g.sphere(0.7 * s, '#f6d23a', x, y + 1.9 * s, z + 0.5 * s, { w: 9, h: 6 });
    g.sphere(0.35 * s, '#f2862c', x, y + 1.8 * s, z + 1.15 * s, { sy: 0.4, sx: 1.2, w: 6, h: 4 });
    g.sphere(0.1 * s, '#1b1b1f', x + 0.3 * s, y + 2.1 * s, z + 1.0 * s, { w: 4, h: 3 });
    g.sphere(0.1 * s, '#1b1b1f', x - 0.3 * s, y + 2.1 * s, z + 1.0 * s, { w: 4, h: 3 });
  },
  flower(g, x, y, z, s) {
    g.cyl(0.12 * s, 0.12 * s, 2 * s, 5, '#4a8a3a', x, y, z);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; g.sphere(0.5 * s, '#ff7aa8', x + Math.cos(a) * 0.75 * s, y + 2.5 * s + Math.sin(a) * 0.75 * s, z, { sz: 0.35, w: 6, h: 4 }); }
    g.sphere(0.5 * s, '#ffd84a', x, y + 2.5 * s, z + 0.1, { sz: 0.5, w: 8, h: 5 });
  },
  hammer(g, x, y, z, s) {
    g.box(0.35 * s, 3.2 * s, 0.35 * s, '#b07a44', x, y, z, { rz: 0.3 });
    g.box(1.8 * s, 0.7 * s, 0.7 * s, '#7a8590', x - 0.95 * s, y + 3.0 * s, z, { rz: 0.3 });
  },
  bone(g, x, y, z, s) {
    g.cyl(0.3 * s, 0.3 * s, 2.6 * s, 8, '#f6efe0', x - 1.3 * s, y + 1.2 * s, z, { rz: -Math.PI / 2 });
    for (const k of [-1, 1]) for (const j of [-1, 1]) g.sphere(0.42 * s, '#f6efe0', x + k * 1.35 * s, y + 1.2 * s + j * 0.3 * s, z, { w: 7, h: 5 });
  },
  cross(g, x, y, z, s, P, c = '#3ac06a') {
    g.box(0.7 * s, 2.2 * s, 0.4 * s, c, x, y, z, { glow: true });
    g.box(2.2 * s, 0.7 * s, 0.4 * s, c, x, y + 0.75 * s, z, { glow: true });
  },
  redcross(g, x, y, z, s, P) { TOPS.cross(g, x, y, z, s, P, '#e0403a'); },
  envelope(g, x, y, z, s) {
    g.box(2.8 * s, 1.8 * s, 0.25 * s, '#f6f2ea', x, y, z);
    g.box(1.75 * s, 0.1 * s, 0.1, '#c8b88a', x - 0.6 * s, y + 1.2 * s, z + 0.14 * s, { rz: -0.6 });
    g.box(1.75 * s, 0.1 * s, 0.1, '#c8b88a', x + 0.6 * s, y + 1.2 * s, z + 0.14 * s, { rz: 0.6 });
    g.box(0.5 * s, 0.55 * s, 0.05, '#e04848', x + 1.0 * s, y + 1.1 * s, z + 0.15 * s);
  },
  dumbbell(g, x, y, z, s) {
    g.cyl(0.18 * s, 0.18 * s, 3 * s, 8, '#555b63', x - 1.5 * s, y + 1.2 * s, z, { rz: -Math.PI / 2 });
    for (const k of [-1, 1]) g.cyl(0.8 * s, 0.8 * s, 0.5 * s, 10, '#2b2f35', x + k * 1.1 * s - 0.25 * s, y + 1.2 * s, z, { rz: -Math.PI / 2 });
    g.box(0.2, 0.9 * s, 0.2, '#555', x, y, z);
  },
  joystick(g, x, y, z, s) {
    g.box(2.0 * s, 0.6 * s, 1.6 * s, '#2a2a38', x, y, z);
    g.cyl(0.14 * s, 0.14 * s, 1.6 * s, 6, '#cfcfcf', x, y + 0.6 * s, z, { rz: 0.2 });
    g.sphere(0.45 * s, '#e03a6a', x - 0.32 * s, y + 2.2 * s, z, { w: 8, h: 6, glow: true });
    g.cyl(0.25 * s, 0.25 * s, 0.15 * s, 8, '#3ad0ff', x + 0.6 * s, y + 0.6 * s, z + 0.3 * s, { glow: true });
  },
  coin(g, x, y, z, s) {
    g.cyl(1.2 * s, 1.2 * s, 0.3 * s, 16, '#f2c24c', x, y + 1.4 * s, z - 0.15 * s, { rx: Math.PI / 2 });
    g.torus(0.9 * s, 0.07 * s, '#c8962a', x, y + 1.4 * s, z + 0.17 * s, { tubular: 16, radial: 3 });
    g.box(0.2, 0.4, 0.2, '#555', x, y, z);
  },
  popcorn(g, x, y, z, s) {
    g.cyl(1.0 * s, 0.7 * s, 1.8 * s, 10, '#e04848', x, y, z);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; g.ico(0.35 * s, '#fff4c8', x + Math.cos(a) * 0.6 * s, y + 1.9 * s + (i % 3) * 0.2 * s, z + Math.sin(a) * 0.6 * s); }
  },
  bubbles(g, x, y, z, s) {
    for (let i = 0; i < 6; i++) g.sphere((0.4 + (i % 3) * 0.25) * s, '#bfe8ff', x + Math.cos(i * 2.1) * 1.2 * s, y + 0.6 * s + i * 0.45 * s, z + Math.sin(i * 2.1) * 0.5 * s, { w: 8, h: 6, glow: true });
  },
  tire(g, x, y, z, s) {
    g.torus(1.1 * s, 0.45 * s, '#26272b', x, y + 1.5 * s, z, { tubular: 14, radial: 6 });
    g.cyl(0.65 * s, 0.65 * s, 0.4 * s, 10, '#9aa3ad', x, y + 1.5 * s, z - 0.2 * s, { rx: Math.PI / 2 });
  },
  burger(g, x, y, z, s) {
    g.sphere(1.2 * s, '#d89a52', x, y + 1.6 * s, z, { sy: 0.5, w: 10, h: 5 });
    g.cyl(1.25 * s, 1.25 * s, 0.35 * s, 12, '#6a3a22', x, y + 1.0 * s, z);
    g.cyl(1.3 * s, 1.3 * s, 0.12 * s, 12, '#5ab04a', x, y + 1.35 * s, z);
    g.cyl(1.15 * s, 1.15 * s, 0.35 * s, 12, '#d89a52', x, y + 0.6 * s, z);
  },
};

function frontWindows(g, P, w, h, d, wall, frac = 0.62) {
  g.box(w * frac, h * 0.45, 0.1, P.glow, -w * 0.12, 0.55, d / 2 + 0.01, { glow: true });
  for (let i = 1; i < 3; i++) g.box(0.1, h * 0.45, 0.14, darken(wall, 0.45), -w * 0.12 - (w * frac) / 2 + (i * w * frac) / 3, 0.55, d / 2 + 0.03);
  g.box(w * frac + 0.2, 0.16, 0.2, darken(wall, 0.35), -w * 0.12, 0.47, d / 2 + 0.05);
  g.box(1.1, 2.3, 0.12, darken(wall, 0.45), w * 0.33, 0, d / 2 + 0.02);
  g.box(0.85, 1.6, 0.1, P.glow, w * 0.33, 0.45, d / 2 + 0.06, { glow: true });
}

function awning(g, P, w, h, d, c1) {
  const n = Math.max(5, Math.round(w / 0.9));
  for (let i = 0; i < n; i++) g.box(w / n + 0.01, 0.1, 1.5, i % 2 ? c1 : '#fbf6ec', -w / 2 + (i + 0.5) * (w / n), h * 0.62, d / 2 + 0.7, { rx: 0.42 });
}

// A shop with a name board, an awning and something giant on the roof.
function storefront(g, r, P, A, o = {}) {
  const w = o.w ?? 7.5, h = o.h ?? 4.4, d = o.d ?? 5.5;
  const wall = P.main;
  g.box(w, h, d, wall);
  g.box(w + 0.3, 0.35, d + 0.3, darken(wall, 0.22), 0, h, 0);
  g.box(w + 0.1, 0.5, 0.1, darken(wall, 0.3), 0, 0, d / 2 + 0.02);
  frontWindows(g, P, w, h, d, wall);
  if (o.awning !== false) awning(g, P, w * 0.95, h, d, o.awningColor || P.accent);
  if (o.inside) o.inside(g, w, h, d);
  if (o.top) TOPS[o.top](g, o.topX ?? 0, h + 0.35, o.topZ ?? 0, o.topScale ?? 1, P);
  A.billboard(w * 0.78, 0.85, [0, h - 0.62, d / 2 + 0.08], 'name');
  const cols = [];
  const n = Math.max(1, Math.round(w / d));
  for (let i = 0; i < n; i++) cols.push({ x: -w / 2 + (i + 0.5) * (w / n), z: 0, r: Math.max(w / n, d) * 0.55 });
  return { r: 0, h: h + (o.top ? 3.5 : 0.5), colliders: cols };
}

const washerRow = (g, w, h, d) => {
  for (let i = 0; i < 4; i++) {
    const x = -w * 0.12 - w * 0.25 + i * (w * 0.5) / 3;
    g.box(0.9, 1.1, 0.9, '#f4f4f0', x, 0.05, d / 2 - 0.7);
    g.cyl(0.32, 0.32, 0.08, 10, '#7fd0ff', x, 0.62, d / 2 - 0.24, { rx: Math.PI / 2 });
  }
};

// A giant version of an everyday prop, for interiors (a sofa the size of a house).
function giant(name, s, rad, h) {
  return (g, r, P) => {
    g.push(0, 0, 0, 0, s);
    PROPS2[name](g, r, { ...P, main: P.main });
    g.pop();
    return { r: rad, h };
  };
}

export const BUILDINGS = {
  bowling_alley: (g, r, P, A) => storefront(g, r, P, A, { top: 'pin', awningColor: '#e03a3a', w: 10, topScale: 1.1 }),
  giant_couch: giant('couch', 4, 4, 5),
  giant_tv: (g, r, P) => { g.push(0, 0, 0, 0, 4.5); g.box(1.0, 0.8, 0.8, '#6b5a48'); g.box(0.75, 0.55, 0.05, '#7fd0ff', -0.05, 0.12, 0.4, { glow: true }); g.cyl(0.01, 0.01, 0.6, 3, '#999', -0.1, 0.8, 0, { rz: 0.5 }); g.cyl(0.01, 0.01, 0.6, 3, '#999', 0.1, 0.8, 0, { rz: -0.5 }); g.pop(); return { r: 2.6, h: 6 }; },
  giant_fridge: giant('fridge', 4, 2.2, 7.6),
  giant_stove: giant('stove', 4, 2.4, 4.8),
  giant_duck: giant('rubber_duck', 7, 2.4, 5),
  giant_sock: giant('sock', 7, 2.2, 3),
  giant_washer: giant('washing_machine', 3.8, 2.4, 6),
  laundromat: (g, r, P, A) => storefront(g, r, P, A, { top: r.chance(0.5) ? 'washer' : 'sock', inside: washerRow, awningColor: '#5ab0e0' }),
  bakery: (g, r, P, A) => storefront(g, r, P, A, { top: 'bread', awningColor: '#e8a33d', w: 6.5 }),
  cafe: (g, r, P, A) => storefront(g, r, P, A, { top: 'cup', awningColor: '#3a7a5a', w: 6.5 }),
  pizzeria: (g, r, P, A) => storefront(g, r, P, A, { top: 'slice', awningColor: '#c0402f' }),
  ice_cream_shop: (g, r, P, A) => storefront(g, r, P, A, { top: 'cone', awningColor: '#ff8ab5', w: 6, h: 3.8 }),
  donut_shop: (g, r, P, A) => storefront(g, r, P, A, { top: 'donut', awningColor: '#ff8ab5', w: 6.5 }),
  burger_joint: (g, r, P, A) => storefront(g, r, P, A, { top: 'burger', awningColor: '#e8502a' }),
  pharmacy: (g, r, P, A) => storefront(g, r, P, A, { top: 'cross', awningColor: '#3ac06a', topScale: 0.8 }),
  dentist: (g, r, P, A) => storefront(g, r, P, A, { top: 'tooth', awningColor: '#7fb8e0', w: 6.5 }),
  pet_shop: (g, r, P, A) => storefront(g, r, P, A, { top: 'bone', awningColor: '#f2a33d' }),
  toy_shop: (g, r, P, A) => storefront(g, r, P, A, { top: 'duck', awningColor: '#e05a8a' }),
  bookshop: (g, r, P, A) => storefront(g, r, P, A, { top: 'book', awningColor: '#3a5a8a' }),
  florist: (g, r, P, A) => storefront(g, r, P, A, { top: 'flower', awningColor: '#6ab05a', w: 6 }),
  hardware_store: (g, r, P, A) => storefront(g, r, P, A, { top: 'hammer', awningColor: '#e0702a', w: 8.5 }),
  arcade: (g, r, P, A) => storefront(g, r, { ...P, glow: '#ff6ad5' }, A, { top: 'joystick', awningColor: '#7a3ad8' }),
  corner_shop: (g, r, P, A) => storefront(g, r, P, A, { awningColor: P.accent, w: 6.5 }),
  post_office: (g, r, P, A) => storefront(g, r, P, A, { top: 'envelope', awningColor: '#3a6ad8', awning: false }),
  gym: (g, r, P, A) => storefront(g, r, P, A, { top: 'dumbbell', awningColor: '#2a2a30', w: 8 }),
  tire_shop: (g, r, P, A) => storefront(g, r, P, A, { top: 'tire', awningColor: '#e0c02a', w: 8 }),
  popcorn_stand: (g, r, P, A) => storefront(g, r, P, A, { top: 'popcorn', w: 4.5, h: 3.2, d: 3.5, awningColor: '#e04848' }),
  barber: (g, r, P, A) => {
    const info = storefront(g, r, P, A, { awningColor: '#3a5ad8', w: 6 });
    for (let i = 0; i < 6; i++) g.cyl(0.25, 0.25, 0.35, 8, i % 3 === 0 ? '#e03a3a' : i % 3 === 1 ? '#ffffff' : '#3a5ad8', -3.4, 1.2 + i * 0.35, 2.9);
    g.sphere(0.28, '#fbfbf6', -3.4, 3.4, 2.9, { w: 6, h: 4, glow: true });
    return info;
  },
  bank(g, r, P, A) {
    const w = 9, h = 5, d = 6;
    g.box(w + 1, 0.6, d + 1.5, darken(P.stone, 0.05), 0, 0, 0.5);
    g.box(w, h, d, P.stone, 0, 0.6, 0);
    for (let i = 0; i < 5; i++) g.cyl(0.35, 0.4, h - 0.3, 8, lighten(P.stone, 0.08), -w / 2 + 1 + i * ((w - 2) / 4), 0.6, d / 2 + 0.8);
    g.box(w + 0.6, 0.5, d + 2.2, lighten(P.stone, 0.05), 0, h + 0.3, 0.5);
    g.roof(w + 0.6, 1.4, d + 2.2, P.stone, 0, h + 0.8, 0.5);
    g.box(1.6, 2.6, 0.12, darken(P.wood, 0.4), 0, 0.6, d / 2 + 0.02);
    TOPS.coin(g, 0, h + 2.0, 0.5, 0.8, P);
    A.billboard(w * 0.6, 0.7, [0, h, d / 2 + 1.62], 'name');
    return { r: 0, h: h + 4, colliders: [{ x: -2.5, z: 0, r: 3.3 }, { x: 2.5, z: 0, r: 3.3 }] };
  },
  cinema(g, r, P, A) {
    const info = storefront(g, r, { ...P, glow: '#ffe8a8' }, A, { awning: false, w: 9, h: 5.5 });
    g.box(7.5, 1.6, 1.4, darken(P.accent, 0.2), 0, 3.2, 3.4);
    for (let i = 0; i < 16; i++) g.sphere(0.12, '#ffe08a', -3.6 + i * 0.48, 4.85, 4.12, { w: 4, h: 3, glow: true });
    g.box(1.2, 4.5, 0.4, P.accent, 3.6, 5.5, 2.4);
    for (let i = 0; i < 6; i++) g.sphere(0.16, '#ff6a6a', 3.6, 6 + i * 0.65, 2.65, { w: 4, h: 3, glow: true });
    return { ...info, h: 10 };
  },
  diner(g, r, P, A) {
    const w = 10, h = 3.2, d = 4.4, chrome = '#d8dde3';
    g.box(w, h, d, chrome);
    for (const s of [-1, 1]) g.cyl(d / 2, d / 2, h, 12, chrome, s * w / 2, 0, 0);
    g.box(w + 0.2, 0.5, d + 0.1, P.accent, 0, 0.9, 0);
    g.box(w * 0.9, 1.1, 0.1, P.glow, 0, 1.6, d / 2 + 0.02, { glow: true });
    for (let i = 0; i < 7; i++) g.box(0.1, 1.1, 0.14, '#9aa3ad', -w * 0.45 + i * (w * 0.9) / 6, 1.6, d / 2 + 0.04);
    g.box(w + 1.2, 0.3, d + 1.2, darken(P.accent, 0.2), 0, h, 0);
    g.box(1.3, 2.4, 0.2, P.glow, 0, 0, d / 2 + 0.6, { glow: true });
    g.box(1.8, 0.2, 1.4, chrome, 0, 2.4, d / 2 + 0.6);
    g.box(0.3, 6.5, 0.3, '#5a6066', w / 2 + 2, 0, 0);
    TOPS.cup(g, w / 2 + 2, 6.5, 0, 0.75, P);
    A.billboard(w * 0.6, 0.9, [0, h + 0.75, 0.6], 'name');
    g.box(w * 0.62, 1.1, 0.2, darken(P.accent, 0.4), 0, h + 0.2, 0.5);
    return { r: 0, h: 9, colliders: [{ x: -3.2, z: 0, r: 2.6 }, { x: 0, z: 0, r: 2.6 }, { x: 3.2, z: 0, r: 2.6 }, { x: w / 2 + 2, z: 0, r: 0.4 }] };
  },
  gas_station(g, r, P, A) {
    const w = 10, d = 6.5, h = 4.3;
    for (const [x, z] of [[-w / 2 + 0.5, -d / 2 + 0.5], [w / 2 - 0.5, -d / 2 + 0.5], [-w / 2 + 0.5, d / 2 - 0.5], [w / 2 - 0.5, d / 2 - 0.5]]) g.box(0.4, h, 0.4, '#e8e8e8', x, 0, z);
    g.box(w, 0.7, d, '#f4f4f0', 0, h, 0);
    g.box(w + 0.05, 0.35, d + 0.05, P.accent, 0, h + 0.2, 0);
    g.box(w * 0.9, 0.06, d * 0.9, '#fff8e0', 0, h - 0.04, 0, { glow: true });
    for (const x of [-2.2, 2.2]) {
      g.box(1.4, 0.25, 3.8, '#9aa3ad', x, 0, 0);
      for (const z of [-1, 1]) { g.box(0.7, 1.6, 0.5, P.accent, x, 0.25, z); g.box(0.5, 0.45, 0.06, '#1b1b1f', x, 1.2, z + 0.27); g.box(0.3, 0.2, 0.06, '#5aff8a', x, 1.3, z + 0.31, { glow: true }); }
    }
    g.box(7, 3.4, 4, P.main, 0, 0, -d / 2 - 3);
    g.box(4.5, 1.6, 0.1, P.glow, -0.8, 0.6, -d / 2 - 0.99, { glow: true });
    g.box(0.4, 7.5, 0.4, '#5a6066', w / 2 + 2.2, 0, d / 2);
    g.box(2.6, 2.6, 0.4, '#f4f4f0', w / 2 + 2.2, 7, d / 2);
    for (let i = 0; i < 3; i++) g.box(2.0, 0.45, 0.06, '#1b1b1f', w / 2 + 2.2, 7.3 + i * 0.75, d / 2 + 0.21);
    for (let i = 0; i < 3; i++) g.box(1.2, 0.3, 0.07, '#ff6a3a', w / 2 + 2.5, 7.38 + i * 0.75, d / 2 + 0.23, { glow: true });
    A.billboard(w * 0.7, 0.6, [0, h + 0.35, d / 2 + 0.06], 'name');
    return { r: 0, h: 10, colliders: [{ x: -w / 2 + 0.5, z: -d / 2 + 0.5, r: 0.4 }, { x: w / 2 - 0.5, z: -d / 2 + 0.5, r: 0.4 }, { x: -w / 2 + 0.5, z: d / 2 - 0.5, r: 0.4 }, { x: w / 2 - 0.5, z: d / 2 - 0.5, r: 0.4 }, { x: -2.2, z: 0, r: 0.9 }, { x: 2.2, z: 0, r: 0.9 }, { x: -1.8, z: -d / 2 - 3, r: 2.2 }, { x: 1.8, z: -d / 2 - 3, r: 2.2 }, { x: w / 2 + 2.2, z: d / 2, r: 0.4 }] };
  },
  motel(g, r, P, A) {
    const n = 6, uw = 2.4, w = n * uw, h = 3, d = 4.5;
    g.box(w, h, d, P.main);
    g.box(w + 0.6, 0.25, d + 2.2, darken(P.accent, 0.1), 0, h, 0.9);
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * uw;
      g.box(0.9, 2.1, 0.1, shiftHue(P.accent, i * 0.07), x - 0.4, 0, d / 2 + 0.02);
      g.box(0.8, 0.7, 0.1, r.chance(0.6) ? P.glow : darken(P.main, 0.4), x + 0.6, 1.1, d / 2 + 0.02, { glow: r.chance(0.6) });
      g.box(0.1, h, 0.1, '#e8e8e8', x - uw / 2 + 0.05, 0, d / 2 + 1.9);
    }
    g.box(0.4, 8, 0.4, '#5a6066', w / 2 + 2, 0, d / 2 + 1);
    g.box(3.4, 1.6, 0.4, P.accent, w / 2 + 2, 7, d / 2 + 1);
    g.box(2.6, 0.5, 0.45, '#ff5a7a', w / 2 + 2, 6.3, d / 2 + 1, { glow: true });
    A.billboard(3.2, 1.4, [w / 2 + 2, 7.8, d / 2 + 1.22], 'name');
    return { r: 0, h: 9, colliders: [-2, -1, 0, 1, 2].map((k) => ({ x: k * 2.9, z: 0, r: 2.4 })).concat([{ x: w / 2 + 2, z: d / 2 + 1, r: 0.4 }]) };
  },
  parking_booth(g, r, P, A) {
    g.box(2, 2.5, 2, P.main);
    g.box(1.6, 1, 0.1, P.glow, 0, 1.2, 1.01, { glow: true });
    g.box(2.4, 0.2, 2.4, darken(P.main, 0.3), 0, 2.5, 0);
    g.box(0.5, 1.1, 0.5, '#f2c21a', 1.6, 0, 1.4);
    const arm = new Geo(r.next);
    for (let i = 0; i < 6; i++) arm.box(0.8, 0.14, 0.14, i % 2 ? '#e03a3a' : '#ffffff', 0.4 + i * 0.8, 0, 0);
    A.bob(arm, [1.6, 1.0, 1.4], 0.0, 1);
    for (const x of [-6, 6]) { g.box(0.3, 7, 0.3, '#7a8088', x, 0, -4); g.box(1.6, 0.3, 0.6, '#7a8088', x, 7, -4); g.box(1.3, 0.12, 0.4, '#fff4c2', x, 6.92, -4, { glow: true }); }
    A.billboard(3.2, 0.7, [0, 3.1, 0.2], 'name');
    g.box(3.4, 0.8, 0.12, darken(P.main, 0.4), 0, 2.7, 0.12);
    return { r: 0, h: 7.5, colliders: [{ x: 0, z: 0, r: 1.3 }, { x: -6, z: -4, r: 0.3 }, { x: 6, z: -4, r: 0.3 }] };
  },
  school(g, r, P, A) {
    const w = 14, h = 5.5, d = 6;
    g.box(w, h, d, P.main);
    g.box(w + 0.4, 0.4, d + 0.4, darken(P.main, 0.25), 0, h, 0);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 6; i++) { const x = -w / 2 + 1.2 + i * 2.3; if (Math.abs(x) < 1.5) continue; g.box(1.4, 1.1, 0.1, row ? P.glow : '#cfe8ff', x, 0.9 + row * 2.4, d / 2 + 0.01, { glow: row === 1 }); }
    g.box(2.4, 3, 1.6, lighten(P.main, 0.08), 0, 0, d / 2 + 0.7);
    g.box(1.6, 2.2, 0.1, darken(P.wood, 0.3), 0, 0, d / 2 + 1.52);
    g.box(3, 2.2, 3, lighten(P.main, 0.05), 0, h, 0);
    g.cone(2.3, 1.6, 4, P.accent, 0, h + 2.2, 0, { ry: Math.PI / 4 });
    g.cyl(0.8, 0.8, 0.1, 12, '#fbf3df', 0, h + 1.1, 1.52, { rx: Math.PI / 2, glow: true });
    g.cyl(0.05, 0.06, 7, 4, '#d8d8d8', w / 2 + 2, 0, d / 2 + 2);
    g.box(1.4, 0.9, 0.04, P.accent, w / 2 + 2.7, 6, d / 2 + 2);
    A.billboard(5.5, 0.8, [0, 3.4, d / 2 + 1.52], 'name');
    return { r: 0, h: h + 4, colliders: [-5, -2.5, 0, 2.5, 5].map((x) => ({ x, z: 0, r: 3.1 })).concat([{ x: w / 2 + 2, z: d / 2 + 2, r: 0.2 }]) };
  },
  playground(g, r, P) {
    for (const x of [-3, 0]) g.box(0.15, 3, 0.15, '#e0402f', x - 1.5, 0, -1, { rz: 0.15 });
    for (const x of [-4.5, -1.5]) { g.box(0.15, 3, 0.15, '#e0402f', x, 0, 1, { rz: -0.15 }); }
    g.box(3.6, 0.15, 0.15, '#e0402f', -3, 2.95, 0);
    for (const x of [-3.7, -2.3]) { g.box(0.03, 1.9, 0.03, '#888', x, 1.0, 0); g.box(0.6, 0.08, 0.3, '#3a7ad8', x, 0.95, 0); }
    g.box(1.2, 2.4, 1.2, '#f2c21a', 3, 0, -1);
    g.box(1, 0.1, 3.6, '#3ac0e0', 3, 1.2, 1.2, { rx: 0.62 });
    g.box(1.4, 0.15, 1.4, '#e0402f', 3, 2.4, -1);
    g.box(3.4, 0.12, 0.3, '#5ab04a', 0.5, 0.5, 3.5, { rz: 0.2 });
    g.box(0.3, 0.5, 0.3, '#888', 0.5, 0, 3.5);
    g.box(3, 0.3, 3, '#e8d49c', -3, 0, 4);
    return { r: 0, h: 3.5, colliders: [{ x: 3, z: -1, r: 0.9 }, { x: -4.5, z: 0, r: 0.3 }, { x: -1.5, z: 0, r: 0.3 }] };
  },
  hospital(g, r, P, A) {
    const w = 11, h = 9, d = 7;
    g.box(w, h, d, '#f4f6f8');
    for (let f = 0; f < 3; f++) for (let i = 0; i < 5; i++) g.box(1.4, 1.2, 0.1, f ? '#bfe0f4' : P.glow, -w / 2 + 1.3 + i * 2.1, 1 + f * 2.7, d / 2 + 0.01, { glow: !f });
    g.box(w + 0.3, 0.4, d + 0.3, '#c8ced4', 0, h, 0);
    g.box(4, 0.3, 2.8, '#e0403a', 0, 3, d / 2 + 1.3);
    for (const x of [-1.8, 1.8]) g.box(0.25, 3, 0.25, '#e8e8e8', x, 0, d / 2 + 2.5);
    TOPS.redcross(g, 0, h + 0.4, 0, 1, P);
    A.billboard(4.5, 0.7, [0, 3.7, d / 2 + 2.72], 'name');
    return { r: 0, h: h + 3, colliders: [-3.5, 0, 3.5].map((x) => ({ x, z: 0, r: 3.6 })) };
  },
  supermarket(g, r, P, A) {
    const w = 15, h = 5.2, d = 9;
    g.box(w, h, d, P.main);
    g.box(w + 0.4, 0.8, d + 0.4, P.accent, 0, h - 0.4, 0);
    g.box(w * 0.7, 2.6, 0.1, P.glow, 0, 0.3, d / 2 + 0.02, { glow: true });
    for (let i = 0; i < 6; i++) g.box(0.12, 2.6, 0.14, darken(P.main, 0.4), -w * 0.35 + i * (w * 0.7) / 5, 0.3, d / 2 + 0.04);
    for (let i = 0; i < 4; i++) { const x = -5 + i * 0.6; g.box(0.5, 0.7, 0.8, '#b9c0c8', x, 0.3, d / 2 + 1.4); }
    A.billboard(w * 0.55, 1.1, [0, h - 0.4, d / 2 + 0.25], 'name');
    return { r: 0, h: h + 0.5, colliders: [-5.5, -1.8, 1.8, 5.5].map((x) => ({ x, z: 0, r: 4.6 })) };
  },
  big_house(g, r, P) {
    const wall = r.pick([P.plaster, P.main, lighten(P.accent, 0.45)]);
    g.box(7, 5, 5.5, wall);
    g.roof(7.6, 2.4, 6.2, darken(P.accent, 0.15), 0, 5, 0);
    g.box(4, 3, 5, lighten(wall, 0.05), 5.4, 0, 0.2);
    g.box(4.4, 0.3, 5.4, darken(P.accent, 0.2), 5.4, 3, 0.2);
    g.box(3.2, 2.6, 0.1, '#e8e8e8', 5.4, 0, 2.72);
    for (let i = 0; i < 4; i++) g.box(3.2, 0.06, 0.12, '#c8ced4', 5.4, 0.6 + i * 0.6, 2.76);
    g.box(1, 2, 0.12, darken(P.wood, 0.25), -1, 0, 2.76);
    for (const [x, y] of [[-2.6, 1.2], [1.2, 1.2], [-2.6, 3.4], [1.2, 3.4], [-1, 3.4]]) g.box(1, 0.9, 0.1, P.glow, x, y, 2.76, { glow: true });
    g.box(3.6, 0.2, 1.6, P.wood, -1, 0, 3.5);
    g.box(3.8, 0.2, 1.8, darken(P.accent, 0.2), -1, 2.4, 3.5);
    for (const x of [-2.6, 0.6]) g.box(0.15, 2.4, 0.15, '#f4f4f0', x, 0, 4.2);
    g.box(0.8, 2.6, 0.8, '#8a4a3a', 2.2, 5.2, -1.4);
    for (let i = 0; i < 9; i++) g.box(0.12, 0.9, 0.08, '#fbfbf6', -3.5 + i * 0.9, 0, 6.5);
    g.box(8, 0.1, 0.06, '#fbfbf6', 0.1, 0.65, 6.5);
    return { r: 0, h: 8, colliders: [{ x: -1.8, z: 0, r: 3.1 }, { x: 1.8, z: 0, r: 3.1 }, { x: 5.4, z: 0.2, r: 2.6 }] };
  },
  apartment(g, r, P) {
    const floors = r.int(5, 8), fh = 2.6, w = 9, d = 7, h = floors * fh;
    g.box(w, h, d, P.main);
    for (let f = 0; f < floors; f++) for (let i = 0; i < 3; i++) {
      const x = -w / 2 + 1.5 + i * 3;
      g.box(1.6, 1.2, 0.1, r.chance(0.55) ? P.glow : darken(P.main, 0.4), x, f * fh + 0.9, d / 2 + 0.01, { glow: r.chance(0.5) });
      if (f > 0) { g.box(2.2, 0.12, 0.9, darken(P.main, 0.2), x, f * fh + 0.3, d / 2 + 0.45); g.box(2.2, 0.6, 0.06, '#c8ced4', x, f * fh + 0.4, d / 2 + 0.88); }
    }
    g.box(w + 0.3, 0.4, d + 0.3, darken(P.main, 0.25), 0, h, 0);
    g.box(1.6, 2.4, 0.12, darken(P.wood, 0.3), 0, 0, d / 2 + 0.02);
    g.box(1.2, 1.2, 1.2, '#9aa3ad', 2.5, h + 0.4, -1.5);
    return { r: 0, h: h + 2, colliders: [{ x: -2.2, z: 0, r: 3.8 }, { x: 2.2, z: 0, r: 3.8 }] };
  },
  bus_stop(g, r, P) {
    g.box(4, 0.12, 1.8, '#9aa3ad', 0, 2.4, -0.3);
    for (const x of [-1.9, 1.9]) g.box(0.1, 2.4, 0.1, '#5a6066', x, 0, -1.1);
    g.box(3.8, 1.8, 0.05, '#bfe0f4', 0, 0.5, -1.15, { glow: true });
    g.box(3, 0.1, 0.5, P.wood, 0, 0.5, -0.8);
    g.box(0.1, 3.2, 0.1, '#5a6066', 2.6, 0, 0.4);
    g.cyl(0.4, 0.4, 0.06, 10, '#3a6ad8', 2.6, 3, 0.4, { rx: Math.PI / 2 });
    const bus = new Geo(r.next);
    BUS(bus, P, 0, 0, 0);
    g.merge(bus, -1, 0, 3.6, 0, 1);
    return { r: 0, h: 3.6, colliders: [{ x: 0, z: -1.1, r: 1 }, { x: -4, z: 3.6, r: 1.4 }, { x: -1, z: 3.6, r: 1.4 }, { x: 2, z: 3.6, r: 1.4 }] };
  },
  car_wash(g, r, P, A) {
    const w = 5, d = 8, h = 4;
    for (const s of [-1, 1]) g.box(0.5, h, d, P.main, s * w / 2, 0, 0);
    g.box(w + 0.5, 0.5, d, darken(P.main, 0.2), 0, h, 0);
    for (let i = 0; i < 4; i++) g.box(w, 0.2, 0.3, shiftHue(P.accent, i * 0.12), 0, h - 0.4, -d / 2 + 1 + i * 2);
    for (const s of [-1, 1]) {
      const brush = new Geo(r.next);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; brush.box(0.15, 3, 0.6, i % 2 ? '#3a7ad8' : '#5ab0e0', Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35, { ry: -a }); }
      A.spin(brush, [s * 1.4, 0.3, 1], 'y', 4 * s);
    }
    TOPS.bubbles(g, 0, h + 0.5, 0, 1, P);
    A.billboard(w * 0.9, 0.7, [0, h + 0.25, d / 2 + 0.05], 'name');
    return { r: 0, h: h + 4, colliders: [{ x: -w / 2, z: -2, r: 0.6 }, { x: -w / 2, z: 2, r: 0.6 }, { x: w / 2, z: -2, r: 0.6 }, { x: w / 2, z: 2, r: 0.6 }] };
  },
  pool(g, r, P) {
    const w = 10, d = 6;
    g.box(w + 1.2, 0.35, d + 1.2, '#e8e2d6', 0, 0, 0);
    g.box(w, 0.06, d, '#3ab0e0', 0, 0.33, 0, { glow: true });
    for (let i = 0; i < 4; i++) g.box(w, 0.08, 0.08, '#ffffff', 0, 0.38, -d / 2 + (i + 1) * (d / 5));
    for (const s of [-1, 1]) g.cyl(0.05, 0.05, 1.2, 4, '#c8ced4', w / 2 - 1, 0.35, s * 0.35 + d / 2 - 0.2);
    g.box(0.8, 0.12, 3, '#3a7ad8', -w / 2 + 0.6, 1.4, 0, { rx: 0 });
    g.box(0.8, 1.4, 0.4, '#c8ced4', -w / 2 - 0.4, 0, 0);
    for (let i = 0; i < 3; i++) { g.box(0.9, 0.3, 2, shiftHue(P.accent, i * 0.15), -3 + i * 2.5, 0.35, d / 2 + 1.6, { rx: 0 }); g.box(0.9, 0.7, 0.2, shiftHue(P.accent, i * 0.15), -3 + i * 2.5, 0.5, d / 2 + 0.6, { rx: -0.6 }); }
    return { r: 0, h: 2, colliders: [] };
  },
  train(g, r, P) {
    g.box(26, 0.8, 4, '#b8b0a2', 0, 0, -3.5);
    for (const z of [0.6, 2.0]) g.box(30, 0.12, 0.15, '#6a6a6a', 0, 0.05, z);
    for (let i = 0; i < 15; i++) g.box(0.3, 0.08, 2.4, '#6a4a2a', -14 + i * 2, 0, 1.3);
    for (let c = 0; c < 3; c++) {
      const x = -9 + c * 8.5, col = c === 0 ? P.accent : P.main;
      g.box(7.6, 2.8, 2.4, col, x, 0.5, 1.3);
      g.box(7.8, 0.3, 2.6, darken(col, 0.3), x, 3.3, 1.3);
      for (let i = 0; i < 4; i++) g.box(1.1, 0.8, 0.06, P.glow, x - 2.7 + i * 1.8, 1.7, 2.51, { glow: true });
      for (const wx of [-2.6, 2.6]) for (const z of [0.5, 2.1]) g.cyl(0.4, 0.4, 0.2, 8, '#26272b', x + wx, 0.4, z, { rx: Math.PI / 2 });
    }
    g.box(10, 0.25, 4.6, darken(P.accent, 0.2), 0, 4.2, -3.5);
    for (const x of [-4, 4]) g.box(0.25, 3.4, 0.25, '#5a6066', x, 0.8, -4.8);
    return { r: 0, h: 4.6, colliders: [-9, -4.5, 0, 4.5, 9].map((x) => ({ x, z: 1.3, r: 1.5 })).concat([{ x: -4, z: -4.8, r: 0.3 }, { x: 4, z: -4.8, r: 0.3 }]) };
  },
  airplane(g, r, P) {
    g.cyl(1.3, 1.3, 14, 12, '#f4f6f8', -7, 2.2, 0, { rz: -Math.PI / 2 });
    g.sphere(1.3, '#f4f6f8', 7, 2.2, 0, { sx: 1.6, w: 10, h: 7 });
    g.cone(1.3, 3.5, 12, '#f4f6f8', -7, 2.2, 0, { rz: Math.PI / 2 });
    g.box(5, 0.25, 15, '#e8ecf0', 0.5, 1.8, 0);
    g.box(2, 3, 0.25, P.accent, -8.6, 2.8, 0, { rz: -0.4 });
    g.box(2.2, 0.2, 5, '#e8ecf0', -8.6, 2.8, 0);
    for (let i = 0; i < 9; i++) g.cyl(0.25, 0.25, 0.05, 8, '#5ab0e0', -5 + i * 1.3, 2.6, 1.28, { rx: Math.PI / 2 });
    g.box(14, 0.3, 0.06, P.accent, 0, 1.8, 1.3);
    for (const z of [-4, 4]) g.cyl(0.6, 0.6, 2.2, 10, '#c8ced4', -0.6, 1.15, z, { rz: -Math.PI / 2 });
    for (const [x, z] of [[5, 0], [0, -1.4], [0, 1.4]]) { g.box(0.2, 1, 0.2, '#5a6066', x, 0, z); g.cyl(0.35, 0.35, 0.3, 8, '#26272b', x, 0.35, z, { rx: Math.PI / 2 }); }
    return { r: 0, h: 5.5, colliders: [-6, -2, 2, 6].map((x) => ({ x, z: 0, r: 1.4 })).concat([{ x: 0.5, z: -5, r: 1 }, { x: 0.5, z: 5, r: 1 }]) };
  },
  chapel(g, r, P) {
    g.box(5, 4.5, 8, P.plaster, 0, 0, -1);
    g.roof(5.6, 2.6, 8.6, darken(P.accent, 0.2), 0, 4.5, -1, { ry: Math.PI / 2 });
    g.box(2.6, 7, 2.6, P.plaster, 0, 0, 3.6);
    g.cone(2, 4, 4, darken(P.accent, 0.2), 0, 7, 3.6, { ry: Math.PI / 4 });
    g.box(0.15, 1.2, 0.15, '#f2c24c', 0, 11, 3.6);
    g.box(0.7, 0.15, 0.15, '#f2c24c', 0, 11.7, 3.6);
    g.cyl(0.5, 0.6, 0.7, 8, '#c8962a', 0, 5.2, 3.6);
    g.box(1.2, 2.4, 0.12, darken(P.wood, 0.3), 0, 0, 4.92);
    for (const z of [-4, -1.5]) for (const s of [-1, 1]) g.box(0.1, 1.8, 0.8, P.glow, s * 2.52, 1.6, z, { glow: true });
    g.cyl(0.6, 0.6, 0.1, 10, P.glow, 0, 5.6, 4.92, { rx: Math.PI / 2, glow: true });
    return { r: 0, h: 12, colliders: [{ x: 0, z: -3, r: 2.6 }, { x: 0, z: 0.5, r: 2.6 }, { x: 0, z: 3.6, r: 1.6 }] };
  },
  museum(g, r, P, A) {
    const info = BUILDINGS.bank(g, r, { ...P, stone: lighten(P.stone, 0.1) }, A);
    for (const x of [-3.5, 3.5]) g.box(1, 3.4, 0.08, x < 0 ? P.accent : shiftHue(P.accent, 0.4), x, 1.2, 3.82);
    return info;
  },
  fire_station(g, r, P, A) {
    const w = 10, h = 5, d = 7;
    g.box(w, h, d, '#c0402f');
    for (const x of [-2.4, 2.4]) { g.box(3.6, 3.4, 0.1, '#e8e8e8', x, 0, d / 2 + 0.01); for (let i = 0; i < 5; i++) g.box(3.6, 0.06, 0.14, '#b8bec4', x, 0.5 + i * 0.6, d / 2 + 0.04); }
    g.box(w + 0.3, 0.4, d + 0.3, '#8a2a20', 0, h, 0);
    g.box(2.4, 4, 2.4, '#c0402f', w / 2 - 1.2, h, -d / 2 + 1.2);
    g.cone(1.8, 1.4, 4, '#3a3a3a', w / 2 - 1.2, h + 4, -d / 2 + 1.2, { ry: Math.PI / 4 });
    g.sphere(0.4, '#ff3a3a', 0, h + 0.6, d / 2 - 0.5, { glow: true, w: 6, h: 4 });
    A.billboard(w * 0.6, 0.7, [0, h - 0.65, d / 2 + 0.06], 'name');
    return { r: 0, h: h + 5.5, colliders: [-3, 0, 3].map((x) => ({ x, z: 0, r: 3.6 })) };
  },
  water_tower(g, r, P, A) {
    for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) g.box(0.3, 9, 0.3, '#7a8088', x, 0, z, { rx: z * 0.03, rz: -x * 0.03 });
    g.cyl(2.8, 2.8, 3.6, 14, P.main, 0, 9, 0);
    g.cone(3, 1.6, 14, darken(P.main, 0.2), 0, 12.6, 0);
    g.box(1, 0.1, 1, '#5a6066', 0, 9, 3);
    A.billboard(4.2, 1.2, [0, 10.8, 2.82], 'name');
    return { r: 0, h: 14.5, colliders: [{ x: 0, z: 0, r: 2.2 }] };
  },
  sports_field(g, r, P, A) {
    const L = 16, W = 9;
    g.box(L, 0.04, W, '#5aa04a', 0, 0, 0);
    for (const z of [-W / 2, W / 2]) g.box(L, 0.06, 0.12, '#ffffff', 0, 0.02, z);
    for (const x of [-L / 2, 0, L / 2]) g.box(0.12, 0.06, W, '#ffffff', x, 0.02, 0);
    for (const s of [-1, 1]) { g.box(0.15, 2.4, 0.15, '#fbfbf6', s * L / 2, 0, -1.6); g.box(0.15, 2.4, 0.15, '#fbfbf6', s * L / 2, 0, 1.6); g.box(0.15, 0.15, 3.4, '#fbfbf6', s * L / 2, 2.3, 0); }
    for (let i = 0; i < 4; i++) g.box(L * 0.8, 0.45, 1, i % 2 ? P.accent : darken(P.accent, 0.15), 0, i * 0.45, -W / 2 - 1.4 - i * 0.9);
    g.box(0.3, 5, 0.3, '#5a6066', L / 2 + 2, 0, -W / 2 - 1);
    g.box(4, 2.4, 0.3, '#1b1b1f', L / 2 + 2, 5, -W / 2 - 1);
    A.billboard(3.6, 2, [L / 2 + 2, 6.2, -W / 2 - 0.84]);
    return { r: 0, h: 7, colliders: [{ x: -L / 2, z: -1.6, r: 0.2 }, { x: -L / 2, z: 1.6, r: 0.2 }, { x: L / 2, z: -1.6, r: 0.2 }, { x: L / 2, z: 1.6, r: 0.2 }, ...[-6, -2, 2, 6].map((x) => ({ x, z: -W / 2 - 2.5, r: 2 }))] };
  },
  pier(g, r, P) {
    for (let i = 0; i < 9; i++) {
      g.box(3, 0.25, 1.4, i % 2 ? P.wood : darken(P.wood, 0.08), 0, 0.6, -i * 1.5);
      for (const x of [-1.4, 1.4]) g.cyl(0.18, 0.18, 2.2, 6, darken(P.wood, 0.25), x, -1.4, -i * 1.5);
    }
    g.box(0.15, 1, 0.15, darken(P.wood, 0.25), 1.4, 0.85, -12);
    g.cyl(0.4, 0.4, 0.4, 6, '#e8e2d6', -1.2, 0.85, -11.5);
    return { r: 0, h: 2, colliders: [] };
  },
};

function BUS(g, P, x, y, z) {
  g.box(9, 2.6, 2.6, '#f2c21a', x, y + 0.5, z);
  g.box(9.1, 0.4, 2.7, '#2a2a30', x, y + 1.6, z);
  for (let i = 0; i < 6; i++) g.box(1.1, 0.9, 0.06, '#9fd3ff', x - 3.6 + i * 1.35, y + 1.9, z + 1.31, { glow: true });
  g.box(0.06, 1.2, 2.2, '#9fd3ff', x + 4.51, y + 1.7, z, { glow: true });
  for (const wx of [-3, 3]) for (const s of [-1, 1]) g.cyl(0.5, 0.5, 0.3, 10, '#26272b', x + wx, y + 0.5, z + s * 1.2, { rx: Math.PI / 2 });
  g.box(0.08, 0.3, 0.5, '#fff4c2', x + 4.52, y + 0.8, z + 0.8, { glow: true });
  g.box(0.08, 0.3, 0.5, '#fff4c2', x + 4.52, y + 0.8, z - 0.8, { glow: true });
}
export { BUS, TOPS };

export const BUILDING_MAIN = {
  bowling_alley: '#2a3a5a', giant_couch: 'accent', giant_tv: '#6b5a48', giant_fridge: '#eef0f2', giant_stove: '#e8e8e8', giant_duck: '#f6d23a', giant_sock: 'accent', giant_washer: '#f4f4f0',
  laundromat: '#e8eef2', bakery: '#f2dcc0', cafe: '#e6dccb', pizzeria: '#f0e2c8', ice_cream_shop: '#fbe4ee', donut_shop: '#fbe8d8',
  burger_joint: '#f6e2c2', pharmacy: '#eef4ee', dentist: '#eef4fa', pet_shop: '#f4ead2', toy_shop: '#fbe0ea', bookshop: '#e4dccb',
  florist: '#eef6e4', hardware_store: '#e8e0d0', arcade: '#2a2238', corner_shop: 'plaster', post_office: '#e8eef6', gym: '#d8dce0',
  tire_shop: '#d8d4cc', popcorn_stand: '#fbeee0', barber: '#eef0f6', bank: 'stone', cinema: '#3a2a3a', diner: 'accent', gas_station: '#e8e4dc',
  motel: '#f2e2c8', parking_booth: '#e8e8e2', school: '#c8704a', playground: 'accent', hospital: '#f4f6f8', supermarket: '#eef0f2',
  big_house: 'plaster', apartment: '#c8b8a0', bus_stop: 'metal', car_wash: '#e0e6ec', pool: 'accent', train: '#d8dce4', airplane: 'accent',
  chapel: 'plaster', museum: 'stone', fire_station: '#c0402f', water_tower: '#c8d0d8', sports_field: 'accent', pier: 'wood',
};
