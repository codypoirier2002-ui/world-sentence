// The prop kit as plain data. Shared by the browser (placement rules) and the
// server (the AI is only allowed to pick ids from this list).
//
// place: land | water (floats on water) | shore | float (hovers) | any
// r: collider radius (0 = walk through), max: instance cap at density 1

export const SCATTER = {
  tree_round: { desc: 'round leafy tree', r: 0.35, max: 70, scale: [0.8, 1.4], place: 'land', cluster: true, big: true },
  tree_pine: { desc: 'pine / fir tree', r: 0.35, max: 70, scale: [0.8, 1.5], place: 'land', cluster: true, big: true },
  tree_palm: { desc: 'palm tree', r: 0.3, max: 40, scale: [0.85, 1.25], place: 'land', cluster: true, big: true },
  tree_dead: { desc: 'bare dead tree', r: 0.3, max: 40, scale: [0.8, 1.3], place: 'land', big: true },
  bush: { desc: 'leafy bush', r: 0, max: 90, scale: [0.7, 1.3], place: 'land', cluster: true },
  grass: { desc: 'tufts of grass', r: 0, max: 260, scale: [0.7, 1.4], place: 'land', cluster: true, sway: 0.12, small: true },
  flower: { desc: 'small flowers', r: 0, max: 160, scale: [0.8, 1.3], place: 'land', cluster: true, sway: 0.1, small: true },
  rock: { desc: 'small rocks', r: 0, max: 80, scale: [0.6, 1.4], place: 'any' },
  boulder: { desc: 'big boulder', r: 1.2, max: 24, scale: [0.7, 1.4], place: 'land', big: true },
  mushroom: { desc: 'small mushrooms', r: 0, max: 90, scale: [0.7, 1.6], place: 'land', cluster: true, small: true },
  reed: { desc: 'reeds / cattails at the water edge', r: 0, max: 120, scale: [0.8, 1.3], place: 'shore', cluster: true, sway: 0.08 },
  lily_pad: { desc: 'lily pads floating on water', r: 0, max: 90, scale: [0.7, 1.4], place: 'water', cluster: true },
  log: { desc: 'fallen log', r: 0.5, max: 20, scale: [0.8, 1.2], place: 'land' },
  fence: { desc: 'short wooden fence section', r: 0.3, max: 30, scale: [0.9, 1.1], place: 'land' },
  lamp_post: { desc: 'glowing lamp post', r: 0.2, max: 24, scale: [0.9, 1.1], place: 'land' },
  bench: { desc: 'park bench', r: 0.5, max: 16, scale: [0.95, 1.05], place: 'land' },
};

export const LANDMARK_KINDS = {
  windmill: { desc: 'windmill with turning sails', r: 2.6 },
  tower: { desc: 'tall round stone tower', r: 2.5 },
  fountain: { desc: 'tiered fountain', r: 3.3 },
  cottage: { desc: 'small cottage with a pitched roof', r: 3.2 },
  arch: { desc: 'grand stone archway you can walk through', r: 4.6 },
};
