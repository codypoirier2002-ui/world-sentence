// Everyday scatter props: laundromats, parking lots, suburbs, diners, schools...
// Same contract as props.js: base at y = 0, facing +z, P.main = tint or default.
import { lighten, darken, shiftHue } from './colors.js';

const TAU = Math.PI * 2;

export const PROPS2 = {
  washing_machine(g, r, P) {
    g.box(0.9, 1.05, 0.85, P.main);
    g.box(0.9, 0.18, 0.86, darken(P.main, 0.08), 0, 0.87, 0);
    g.cyl(0.33, 0.33, 0.06, 12, '#8a939c', 0, 0.48, 0.43, { rx: Math.PI / 2 });
    g.cyl(0.26, 0.26, 0.05, 12, '#7fd0ff', 0, 0.48, 0.46, { rx: Math.PI / 2, glow: true });
    g.sphere(0.04, '#3ae07a', 0.32, 0.95, 0.44, { w: 4, h: 3, glow: true });
    if (r.chance(0.4)) g.box(0.9, 1.05, 0.85, P.main, 0, 1.05, 0), g.cyl(0.3, 0.3, 0.05, 12, '#2a2a30', 0, 1.5, 0.43, { rx: Math.PI / 2 });
  },
  laundry_basket(g, r, P) {
    g.cyl(0.38, 0.32, 0.45, 8, P.main, 0, 0, 0, { open: true });
    for (let i = 0; i < 4; i++) g.ico(0.2, shiftHue('#e05a5a', r.range(0, 1), -0.2, 0.15), r.range(-0.15, 0.15), 0.4 + i * 0.06, r.range(-0.15, 0.15), { sy: 0.6 });
  },
  clothesline(g, r, P) {
    for (const x of [-2, 2]) { g.box(0.08, 2, 0.08, P.wood, x, 0, 0); g.box(0.6, 0.06, 0.06, P.wood, x, 1.9, 0); }
    g.box(4, 0.02, 0.02, '#e8e8e8', 0, 1.88, 0.2);
    for (let i = 0; i < 5; i++) {
      const c = shiftHue(P.main, r.range(-0.4, 0.4), 0, r.range(-0.1, 0.1)), x = -1.6 + i * 0.8;
      if (r.chance(0.5)) { g.box(0.55, 0.65, 0.03, c, x, 1.22, 0.2); g.box(0.75, 0.2, 0.03, c, x, 1.68, 0.2); }
      else { g.box(0.18, 0.7, 0.04, c, x, 1.18, 0.2); g.box(0.24, 0.12, 0.05, c, x + 0.04, 1.18, 0.24); }
    }
  },
  sock(g, r, P) {
    const c = shiftHue(P.main, r.range(-0.5, 0.5), 0, 0);
    g.cyl(0.16, 0.16, 0.7, 7, c, -0.35, 0.16, 0, { rz: -Math.PI / 2 });
    g.sphere(0.17, c, 0.4, 0.15, 0.08, { sz: 1.5, w: 6, h: 4 });
    g.cyl(0.17, 0.17, 0.12, 7, '#fbfbf6', -0.4, 0.16, 0, { rz: -Math.PI / 2 });
  },
  parking_space(g, r, P) {
    for (const x of [-1.35, 1.35]) g.box(0.12, 0.03, 5, '#f4f4ee', x, 0.01, 0);
    g.box(2.82, 0.03, 0.12, '#f4f4ee', 0, 0.01, -2.5);
    if (r.chance(0.3)) g.box(0.9, 0.03, 0.9, '#3a6ad8', 0, 0.012, 0.6);
  },
  road_sign(g, r, P) {
    g.box(0.08, 2.4, 0.08, '#9aa3ad');
    const t = r.int(0, 2);
    if (t === 0) { g.cyl(0.42, 0.42, 0.05, 8, '#d83a2f', 0, 2.1, 0.06, { rx: Math.PI / 2, rz: Math.PI / 8 }); g.box(0.5, 0.12, 0.02, '#ffffff', 0, 2.04, 0.1); }
    else if (t === 1) g.cyl(0.45, 0.45, 0.05, 3, '#f2c21a', 0, 2.05, 0.06, { rx: Math.PI / 2, rz: Math.PI });
    else { g.box(1.1, 0.35, 0.04, '#2f8a4a', 0.3, 2.1, 0.06); g.cone(0.2, 0.3, 3, '#ffffff', 0.7, 2.1, 0.09, { rz: -Math.PI / 2, sy: 0.5 }); }
  },
  traffic_light(g, r, P) {
    g.box(0.12, 3.2, 0.12, '#3a3f46');
    g.box(0.4, 1.1, 0.35, '#26292e', 0, 3.1, 0);
    const lit = r.int(0, 2);
    ['#ff3a2f', '#ffc02a', '#3ae07a'].forEach((c, i) => g.sphere(0.12, i === lit ? c : darken(c, 0.7), 0, 3.95 - i * 0.33, 0.18, { w: 6, h: 4, glow: i === lit }));
  },
  gas_pump(g, r, P) {
    g.box(0.7, 1.7, 0.5, P.main);
    g.box(0.5, 0.45, 0.04, '#1b1b1f', 0, 1.1, 0.26);
    g.box(0.3, 0.18, 0.05, '#5aff8a', 0, 1.2, 0.28, { glow: true });
    g.box(0.12, 0.5, 0.12, '#2a2a30', 0.42, 0.7, 0);
    g.box(0.8, 0.12, 0.6, darken(P.main, 0.3), 0, 1.7, 0);
  },
  jukebox(g, r, P) {
    g.box(0.9, 1.2, 0.6, darken(P.main, 0.2));
    g.cyl(0.45, 0.45, 0.6, 10, P.main, 0, 1.2, -0.3, { rx: Math.PI / 2, sz: 1 });
    g.torus(0.38, 0.06, '#ff9a3a', 0, 1.2, 0.31, { arc: Math.PI, tubular: 10, radial: 3, glow: true });
    g.box(0.6, 0.4, 0.04, '#7fe0ff', 0, 0.75, 0.31, { glow: true });
  },
  lawn_flamingo(g, r, P) {
    for (const x of [-0.04, 0.04]) g.cyl(0.012, 0.012, 0.55, 3, '#2a2a2a', x, 0, 0);
    g.sphere(0.18, '#ff7ab0', 0, 0.62, 0, { sz: 1.5, w: 6, h: 4 });
    g.cyl(0.03, 0.03, 0.35, 4, '#ff7ab0', 0, 0.65, 0.2, { rx: -0.3 });
    g.sphere(0.07, '#ff7ab0', 0, 0.98, 0.3, { w: 5, h: 3 });
    g.cone(0.03, 0.1, 4, '#2a2a2a', 0, 0.96, 0.36, { rx: 2 });
  },
  garden_gnome(g, r, P) {
    g.cyl(0.13, 0.16, 0.25, 6, '#3a6ad8');
    g.sphere(0.11, '#f2c9a0', 0, 0.33, 0, { w: 6, h: 4 });
    g.sphere(0.1, '#f4f4f4', 0, 0.26, 0.06, { sy: 1.3, w: 5, h: 3 });
    g.cone(0.12, 0.3, 6, P.main, 0, 0.38, 0, { rx: -0.2 });
  },
  bbq_grill(g, r, P) {
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; g.cyl(0.02, 0.02, 0.7, 3, '#2a2a2a', Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, { rz: Math.cos(a) * 0.2 }); }
    g.sphere(0.35, P.main, 0, 0.8, 0, { sy: 0.6, w: 8, h: 5 });
    g.sphere(0.34, darken(P.main, 0.1), 0, 0.88, -0.05, { sy: 0.5, w: 8, h: 4, rx: -0.6 });
    for (let i = 0; i < 3; i++) g.sphere(0.06, '#ffffff', -0.1 + i * 0.1, 1.2 + i * 0.12, 0, { w: 4, h: 3, glow: true });
  },
  swing_set(g, r, P) {
    for (const x of [-1.4, 1.4]) { g.box(0.1, 2.3, 0.1, P.main, x, 0, -0.5, { rx: 0.2 }); g.box(0.1, 2.3, 0.1, P.main, x, 0, 0.5, { rx: -0.2 }); }
    g.box(3, 0.1, 0.1, P.main, 0, 2.2, 0);
    for (const x of [-0.6, 0.6]) { g.box(0.02, 1.6, 0.02, '#888', x - 0.15, 0.6, 0); g.box(0.02, 1.6, 0.02, '#888', x + 0.15, 0.6, 0); g.box(0.45, 0.06, 0.22, '#2a2a30', x, 0.58, 0); }
  },
  slide(g, r, P) {
    g.box(0.9, 1.6, 0.9, lighten(P.main, 0.1), 0, 0, -1.2);
    for (let i = 0; i < 4; i++) g.box(0.7, 0.06, 0.25, '#888', 0, 0.35 + i * 0.4, -1.9 - i * 0.05);
    g.box(0.75, 0.08, 2.6, P.main, 0, 0.75, 0.2, { rx: 0.62 });
  },
  couch(g, r, P) {
    g.box(2, 0.45, 0.9, P.main, 0, 0.15, 0);
    g.box(2, 0.65, 0.25, darken(P.main, 0.08), 0, 0.5, -0.33);
    for (const x of [-0.92, 0.92]) g.box(0.25, 0.5, 0.9, darken(P.main, 0.08), x, 0.3, 0);
    for (const x of [-0.45, 0.45]) g.box(0.85, 0.15, 0.65, lighten(P.main, 0.08), x, 0.6, 0.08);
    for (const [x, z] of [[-0.9, -0.38], [0.9, -0.38], [-0.9, 0.38], [0.9, 0.38]]) g.box(0.08, 0.15, 0.08, '#3a2a1a', x, 0, z);
  },
  floor_lamp(g, r, P) {
    g.cyl(0.22, 0.25, 0.05, 8, '#3a3a3a');
    g.cyl(0.03, 0.03, 1.6, 4, '#3a3a3a', 0, 0, 0);
    g.cyl(0.18, 0.32, 0.4, 8, P.main, 0, 1.55, 0, { open: true });
    g.sphere(0.1, '#fff4c2', 0, 1.6, 0, { w: 5, h: 3, glow: true });
  },
  fridge(g, r, P) {
    g.box(0.85, 1.9, 0.75, P.main);
    g.box(0.86, 0.03, 0.76, darken(P.main, 0.2), 0, 1.25, 0);
    g.box(0.05, 0.4, 0.05, '#9aa3ad', 0.33, 1.4, 0.39);
    g.box(0.05, 0.5, 0.05, '#9aa3ad', 0.33, 0.6, 0.39);
    for (let i = 0; i < 3; i++) g.box(0.12, 0.12, 0.02, shiftHue('#e05a5a', i * 0.3), -0.2 + i * 0.15, 1.5 - i * 0.12, 0.38);
  },
  stove(g, r, P) {
    g.box(0.9, 0.9, 0.7, P.main);
    for (const [x, z] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) g.cyl(0.12, 0.12, 0.03, 8, '#2a2a2a', x, 0.9, z);
    g.box(0.7, 0.4, 0.03, '#2a2a2a', 0, 0.25, 0.36);
    g.cyl(0.22, 0.2, 0.3, 8, '#9aa3ad', 0.2, 0.93, 0.15);
  },
  shelf(g, r, P) {
    g.box(2.2, 1.8, 0.6, '#d8dce0');
    for (let k = 0; k < 4; k++) {
      g.box(2.1, 0.05, 0.55, '#b8bec4', 0, 0.2 + k * 0.42, 0.05);
      for (let i = 0; i < 7; i++) g.box(0.22, 0.3, 0.3, shiftHue(P.main, r.range(-0.5, 0.5), 0, r.range(-0.1, 0.15)), -0.9 + i * 0.3, 0.25 + k * 0.42, 0.15);
    }
  },
  produce_crate(g, r, P) {
    g.box(1, 0.5, 0.7, P.wood);
    const c = r.pick(['#e0402f', '#f2a33d', '#9ad83a', '#f2d23a', '#8a3a8a']);
    for (let i = 0; i < 6; i++) g.sphere(0.15, c, -0.3 + (i % 3) * 0.3, 0.55, -0.15 + Math.floor(i / 3) * 0.3, { w: 6, h: 4 });
  },
  food_cart(g, r, P) {
    g.box(1.6, 1.0, 0.9, '#e8e8e8', 0, 0.35, 0);
    for (const x of [-0.6, 0.6]) g.cyl(0.25, 0.25, 0.12, 8, '#2a2a30', x, 0.25, 0.48, { rx: Math.PI / 2 });
    g.cyl(0.03, 0.03, 1.6, 4, '#888', 0, 1.35, 0);
    g.cone(1.1, 0.5, 8, P.main, 0, 2.8, 0);
    g.box(1.2, 0.35, 0.04, P.main, 0, 1.0, 0.46);
  },
  bowling_pin(g, r, P) {
    g.lathe([[0, 0], [0.22, 0], [0.3, 0.35], [0.2, 0.85], [0.11, 1.05], [0.15, 1.3], [0.09, 1.48], [0, 1.52]], 9, '#fbfaf6', 0, 0, 0, { rz: r.chance(0.3) ? 1.45 : 0, ry: r.range(0, 3) });
    g.cyl(0.13, 0.14, 0.1, 9, '#e03a3a', 0, 1.08, 0);
  },
  dumbbell(g, r, P) {
    g.cyl(0.04, 0.04, 0.7, 6, '#888', -0.35, 0.15, 0, { rz: -Math.PI / 2 });
    for (const x of [-0.3, 0.3]) g.cyl(0.15, 0.15, 0.12, 8, P.main, x - 0.06, 0.15, 0, { rz: -Math.PI / 2 });
  },
  arcade_cabinet(g, r, P) {
    g.box(0.8, 1.8, 0.7, P.main);
    g.box(0.6, 0.5, 0.05, shiftHue('#5ae0ff', r.range(0, 1)), 0, 1.15, 0.33, { glow: true, rx: -0.2 });
    g.box(0.8, 0.12, 0.35, darken(P.main, 0.3), 0, 0.9, 0.45);
    g.sphere(0.05, '#e03a3a', -0.15, 1.02, 0.5, { w: 4, h: 3 });
    g.box(0.8, 0.3, 0.05, shiftHue('#ff6ad5', r.range(0, 1)), 0, 1.75, 0.34, { glow: true });
  },
  rubber_duck(g, r, P) {
    g.sphere(0.32, '#f6d23a', 0, 0.22, 0, { sz: 1.3, sy: 0.75, w: 8, h: 5 });
    g.sphere(0.2, '#f6d23a', 0, 0.55, 0.18, { w: 7, h: 5 });
    g.sphere(0.1, '#f2862c', 0, 0.52, 0.38, { sy: 0.4, sx: 1.3, w: 5, h: 3 });
    g.sphere(0.03, '#1b1b1f', 0.09, 0.62, 0.33, { w: 3, h: 2 });
    g.sphere(0.03, '#1b1b1f', -0.09, 0.62, 0.33, { w: 3, h: 2 });
  },
  bus(g, r, P) {
    g.box(7, 2.4, 2.4, P.main, 0, 0.45, 0);
    g.box(7.05, 0.3, 2.45, '#2a2a30', 0, 1.4, 0);
    for (let i = 0; i < 5; i++) g.box(1, 0.8, 0.05, '#9fd3ff', -2.8 + i * 1.3, 1.75, 1.21, { glow: true });
    for (const x of [-2.4, 2.4]) for (const s of [-1, 1]) g.cyl(0.45, 0.45, 0.28, 10, '#26272b', x, 0.45, s * 1.1, { rx: Math.PI / 2 });
    g.box(0.05, 1, 2, '#9fd3ff', 3.51, 1.6, 0, { glow: true });
  },
  bicycle(g, r, P) {
    for (const x of [-0.5, 0.5]) g.torus(0.32, 0.03, '#2a2a2a', x, 0.33, 0, { tubular: 12, radial: 3 });
    g.box(1.0, 0.05, 0.05, P.main, 0, 0.6, 0, { rz: 0.15 });
    g.box(0.05, 0.5, 0.05, P.main, -0.15, 0.35, 0, { rz: 0.3 });
    g.box(0.25, 0.05, 0.12, '#2a2a2a', -0.25, 0.85, 0);
    g.box(0.05, 0.4, 0.05, P.main, 0.45, 0.6, 0);
    g.box(0.04, 0.04, 0.45, '#2a2a2a', 0.45, 0.98, 0);
  },
  school_desk(g, r, P) {
    g.box(0.8, 0.06, 0.55, P.wood, 0, 0.7, 0);
    for (const [x, z] of [[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]]) g.box(0.05, 0.7, 0.05, '#7a8088', x, 0, z);
    g.box(0.45, 0.05, 0.45, P.main, 0, 0.42, 0.6);
    g.box(0.45, 0.45, 0.05, P.main, 0, 0.45, 0.82);
    if (r.chance(0.5)) g.box(0.3, 0.05, 0.22, '#fbf6ec', 0.1, 0.76, 0);
  },
  kennel(g, r, P) {
    g.box(1.1, 0.8, 1.2, P.main);
    g.roof(1.3, 0.55, 1.4, darken(P.main, 0.3), 0, 0.8, 0);
    g.box(0.45, 0.55, 0.05, '#1b1b1f', 0, 0, 0.61);
    g.cyl(0.18, 0.15, 0.08, 8, '#e05a5a', 0.6, 0, 0.8);
  },
  tree_acacia(g, r, P) {
    const h = r.range(2.6, 3.6);
    g.cyl(0.14, 0.24, h, 5, P.trunk, 0, 0, 0, { rz: r.range(-0.1, 0.1) });
    g.cyl(0.08, 0.12, 1.4, 4, P.trunk, 0.3, h - 0.9, 0, { rz: -0.7 });
    g.cyl(2.2, 1.6, 0.55, 8, P.main, 0.3, h, 0, { sz: 0.8 });
    g.cyl(1.4, 2.0, 0.3, 8, darken(P.main, 0.1), 0.3, h - 0.25, 0, { sz: 0.8 });
  },
  bamboo(g, r, P) {
    for (let i = 0; i < 5; i++) {
      const x = r.range(-0.5, 0.5), z = r.range(-0.5, 0.5), h = r.range(4, 6.5);
      for (let k = 0; k < 5; k++) g.cyl(0.07, 0.08, h / 5 - 0.03, 5, k % 2 ? P.main : lighten(P.main, 0.08), x, (h / 5) * k, z);
      g.box(0.4, 0.04, 0.12, P.foliage, x + 0.2, h * 0.8, z, { rz: -0.4 });
      g.box(0.4, 0.04, 0.12, P.foliage, x - 0.2, h * 0.65, z, { rz: 0.4 });
    }
  },
  phone_booth(g, r, P) {
    g.box(1, 2.4, 1, P.main);
    g.box(0.8, 1.6, 0.05, '#bfe0f4', 0, 0.5, 0.5, { glow: true });
    g.box(1.05, 0.25, 1.05, darken(P.main, 0.2), 0, 2.4, 0);
    g.box(0.7, 0.18, 0.05, '#fff4c2', 0, 2.42, 0.53, { glow: true });
  },
  picnic_table(g, r, P) {
    g.box(1.8, 0.07, 0.8, P.main, 0, 0.75, 0);
    for (const z of [-0.6, 0.6]) g.box(1.8, 0.06, 0.3, P.main, 0, 0.45, z);
    for (const x of [-0.7, 0.7]) { g.box(0.08, 0.8, 1.6, darken(P.main, 0.2), x, 0, 0, { rx: 0 }); }
  },
  beach_ball(g, r, P) {
    g.sphere(0.35, '#ffffff', 0, 0.35, 0, { w: 8, h: 6 });
    ['#e0402f', '#3a7ad8', '#f2c21a'].forEach((c, i) => g.torus(0.33, 0.06, c, 0, 0.35, 0, { ry: (i / 3) * Math.PI, tubular: 12, radial: 3 }));
  },
};

export const PROP_MAIN2 = {
  washing_machine: '#f4f4f0', laundry_basket: '#5ab0e0', clothesline: 'accent', sock: 'accent', parking_space: '#f4f4ee', road_sign: '#9aa3ad',
  traffic_light: '#3a3f46', gas_pump: 'accent', jukebox: '#e04848', lawn_flamingo: '#ff7ab0', garden_gnome: '#e0402f', bbq_grill: '#2a2a30',
  swing_set: 'accent', slide: 'accent', couch: 'accent', floor_lamp: '#f2e2c0', fridge: '#eef0f2', stove: '#e8e8e8', shelf: 'accent',
  produce_crate: 'wood', food_cart: 'accent', bowling_pin: '#fbfaf6', dumbbell: '#2b2f35', arcade_cabinet: '#2a2238', rubber_duck: '#f6d23a',
  bus: '#f2c21a', bicycle: 'accent', school_desk: '#5a6a8a', kennel: '#c8704a', tree_acacia: '#8a9a3a', bamboo: '#8ac04a', phone_booth: '#d83a2f',
  picnic_table: 'wood', beach_ball: '#e0402f',
};
