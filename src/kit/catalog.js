// The prop kit as plain data. Shared by the browser (placement rules) and the
// server (the AI may only pick ids from these lists).
//
// place: land | water (floats on water) | shore | float (hovers) | any
// r: collider radius (0 = walk through), max: instance cap at density 1
// critter: animated ambient creatures (move around on their own)

export const SCATTER = {
  // plants
  tree_round: { desc: 'round leafy tree', r: 0.35, max: 70, scale: [0.8, 1.4], place: 'land', cluster: true, big: true },
  tree_pine: { desc: 'pine / fir tree', r: 0.35, max: 70, scale: [0.8, 1.5], place: 'land', cluster: true, big: true },
  tree_palm: { desc: 'palm tree', r: 0.3, max: 40, scale: [0.85, 1.25], place: 'land', cluster: true, big: true },
  tree_dead: { desc: 'bare, spooky dead tree', r: 0.3, max: 40, scale: [0.8, 1.3], place: 'land', big: true },
  tree_willow: { desc: 'drooping willow tree', r: 0.35, max: 30, scale: [0.85, 1.3], place: 'land', cluster: true, big: true, sway: 0.03 },
  tree_blob: { desc: 'whimsical lollipop-shaped tree (candy, toy or dream worlds)', r: 0.3, max: 50, scale: [0.8, 1.4], place: 'land', cluster: true, big: true },
  bush: { desc: 'leafy bush', r: 0, max: 90, scale: [0.7, 1.3], place: 'land', cluster: true },
  grass: { desc: 'tufts of grass', r: 0, max: 260, scale: [0.7, 1.4], place: 'land', cluster: true, sway: 0.12, small: true },
  flower: { desc: 'small flowers', r: 0, max: 160, scale: [0.8, 1.3], place: 'land', cluster: true, sway: 0.1, small: true },
  mushroom: { desc: 'small mushrooms', r: 0, max: 90, scale: [0.7, 1.6], place: 'land', cluster: true, small: true },
  mushroom_giant: { desc: 'giant mushroom as big as a tree', r: 0.5, max: 26, scale: [0.8, 1.5], place: 'land', cluster: true, big: true },
  reed: { desc: 'reeds / cattails at the water edge', r: 0, max: 120, scale: [0.8, 1.3], place: 'shore', cluster: true, sway: 0.08 },
  lily_pad: { desc: 'lily pads floating on water', r: 0, max: 90, scale: [0.7, 1.4], place: 'water', cluster: true },
  cactus: { desc: 'desert cactus', r: 0.3, max: 50, scale: [0.7, 1.4], place: 'land', big: true },
  kelp: { desc: 'tall swaying kelp (underwater)', r: 0, max: 110, scale: [0.7, 1.6], place: 'land', cluster: true, sway: 0.09 },
  coral: { desc: 'colourful coral (underwater)', r: 0, max: 90, scale: [0.6, 1.5], place: 'land', cluster: true },
  vine_arch: { desc: 'arching vines / jungle creepers', r: 0, max: 30, scale: [0.8, 1.3], place: 'land', cluster: true, sway: 0.03 },
  // rocks & minerals
  rock: { desc: 'small rocks', r: 0, max: 80, scale: [0.6, 1.4], place: 'any' },
  boulder: { desc: 'big boulder', r: 1.2, max: 24, scale: [0.7, 1.4], place: 'land', big: true },
  crystal: { desc: 'glowing crystal cluster', r: 0.4, max: 50, scale: [0.6, 1.6], place: 'land', cluster: true },
  ice_spike: { desc: 'jagged ice spikes', r: 0.4, max: 40, scale: [0.7, 1.5], place: 'land', cluster: true },
  shell: { desc: 'sea shells and starfish', r: 0, max: 60, scale: [0.7, 1.4], place: 'any', small: true },
  bones: { desc: 'old bones and a skull', r: 0, max: 30, scale: [0.8, 1.5], place: 'land' },
  log: { desc: 'fallen log', r: 0.5, max: 20, scale: [0.8, 1.2], place: 'land' },
  stump: { desc: 'tree stump', r: 0.4, max: 26, scale: [0.8, 1.3], place: 'land' },
  // built things
  fence: { desc: 'short wooden fence section', r: 0.3, max: 30, scale: [0.9, 1.1], place: 'land' },
  lamp_post: { desc: 'glowing street lamp', r: 0.2, max: 24, scale: [0.9, 1.1], place: 'land' },
  lantern: { desc: 'paper lantern on a pole, warm glow', r: 0.15, max: 30, scale: [0.8, 1.2], place: 'land' },
  torch: { desc: 'burning torch on a stick', r: 0.15, max: 26, scale: [0.9, 1.2], place: 'land' },
  candle: { desc: 'cluster of lit candles', r: 0, max: 50, scale: [0.8, 1.5], place: 'land', small: true },
  bench: { desc: 'park bench', r: 0.5, max: 16, scale: [0.95, 1.05], place: 'land' },
  chair: { desc: 'lone chair', r: 0.3, max: 24, scale: [0.9, 1.1], place: 'land' },
  crate: { desc: 'wooden crates', r: 0.6, max: 30, scale: [0.8, 1.3], place: 'land' },
  barrel: { desc: 'barrels', r: 0.45, max: 30, scale: [0.8, 1.2], place: 'land' },
  traffic_cone: { desc: 'orange traffic cones', r: 0, max: 30, scale: [0.9, 1.2], place: 'land', small: true },
  trash_can: { desc: 'metal trash can', r: 0.35, max: 20, scale: [0.9, 1.1], place: 'land' },
  mailbox: { desc: 'mailbox on a post', r: 0.2, max: 14, scale: [0.9, 1.1], place: 'land' },
  fire_hydrant: { desc: 'fire hydrant', r: 0.2, max: 14, scale: [0.9, 1.1], place: 'land' },
  planter: { desc: 'potted plant / planter box', r: 0.5, max: 30, scale: [0.8, 1.2], place: 'land' },
  cafe_table: { desc: 'cafe table with parasol and chairs', r: 0.9, max: 16, scale: [0.9, 1.1], place: 'land' },
  shopping_cart: { desc: 'abandoned shopping cart', r: 0.4, max: 16, scale: [0.95, 1.05], place: 'land' },
  vending_machine: { desc: 'glowing vending machine', r: 0.6, max: 12, scale: [0.95, 1.05], place: 'land' },
  tombstone: { desc: 'gravestones', r: 0.35, max: 40, scale: [0.8, 1.3], place: 'land', cluster: true },
  pillar_ruin: { desc: 'broken ancient column', r: 0.6, max: 24, scale: [0.7, 1.4], place: 'land', cluster: true },
  statue_small: { desc: 'small statue on a plinth', r: 0.5, max: 12, scale: [0.9, 1.3], place: 'land' },
  tent: { desc: 'camping tent', r: 1.2, max: 12, scale: [0.9, 1.2], place: 'land' },
  hut: { desc: 'small round hut with a thatched roof', r: 1.8, max: 14, scale: [0.9, 1.2], place: 'land', big: true },
  house: { desc: 'little village house', r: 2.4, max: 16, scale: [0.85, 1.15], place: 'land', big: true },
  building: { desc: 'tall city building with lit windows', r: 3.6, max: 22, scale: [0.8, 1.5], place: 'land', big: true },
  car: { desc: 'boxy little car', r: 1.1, max: 16, scale: [0.95, 1.05], place: 'land' },
  pipe: { desc: 'industrial pipes', r: 0.6, max: 24, scale: [0.8, 1.4], place: 'land' },
  gear: { desc: 'giant half-buried cog', r: 0.6, max: 16, scale: [0.7, 1.4], place: 'land' },
  tire_pile: { desc: 'pile of old tyres', r: 0.8, max: 16, scale: [0.8, 1.2], place: 'land' },
  tv: { desc: 'old boxy television, screen glowing', r: 0.4, max: 16, scale: [0.8, 1.3], place: 'land' },
  book_stack: { desc: 'towering stacks of books', r: 0.4, max: 30, scale: [0.6, 1.8], place: 'land', cluster: true },
  lollipop: { desc: 'giant swirly lollipops', r: 0.2, max: 40, scale: [0.7, 1.5], place: 'land', cluster: true },
  gumdrop: { desc: 'giant gumdrops', r: 0.5, max: 50, scale: [0.6, 1.5], place: 'land', cluster: true },
  gift: { desc: 'wrapped presents', r: 0.4, max: 30, scale: [0.6, 1.4], place: 'land', cluster: true },
  pumpkin: { desc: 'pumpkins (some carved and glowing)', r: 0.4, max: 40, scale: [0.6, 1.5], place: 'land', cluster: true },
  haystack: { desc: 'haystacks', r: 0.9, max: 16, scale: [0.8, 1.2], place: 'land' },
  scarecrow: { desc: 'scarecrow', r: 0.2, max: 8, scale: [0.9, 1.1], place: 'land' },
  umbrella: { desc: 'beach parasol with a towel', r: 0.2, max: 18, scale: [0.9, 1.1], place: 'land' },
  sandcastle: { desc: 'sandcastles', r: 0.5, max: 16, scale: [0.6, 1.3], place: 'land' },
  snowman: { desc: 'snowmen', r: 0.5, max: 14, scale: [0.8, 1.2], place: 'land' },
  flag: { desc: 'flag on a pole', r: 0.1, max: 16, scale: [0.9, 1.3], place: 'land', sway: 0.04 },
  anchor: { desc: 'rusty ship anchors', r: 0.4, max: 10, scale: [0.8, 1.3], place: 'any' },
  coin_pile: { desc: 'piles of gold coins', r: 0.4, max: 30, scale: [0.6, 1.4], place: 'land', cluster: true },
  satellite_dish: { desc: 'small satellite dish', r: 0.5, max: 12, scale: [0.8, 1.3], place: 'land' },
  // floating & animated
  cloud_puff: { desc: 'small clouds hovering near the ground', r: 0, max: 30, scale: [0.6, 1.4], place: 'float', lift: [3, 9] },
  balloon: { desc: 'floating party balloons', r: 0, max: 30, scale: [0.8, 1.3], place: 'float', lift: [2, 7] },
  floating_lantern: { desc: 'glowing sky lanterns drifting in the air', r: 0, max: 40, scale: [0.8, 1.3], place: 'float', lift: [4, 14] },
  fish: { desc: 'small fish swimming in schools (underwater worlds)', r: 0, max: 40, scale: [0.7, 1.4], place: 'float', critter: 'swim', lift: [1.5, 6] },
  jellyfish: { desc: 'drifting glowing jellyfish', r: 0, max: 24, scale: [0.7, 1.4], place: 'float', critter: 'drift', lift: [2, 8] },
  bird: { desc: 'birds circling overhead', r: 0, max: 18, scale: [0.8, 1.2], place: 'float', critter: 'fly', lift: [9, 18] },
  butterfly: { desc: 'fluttering butterflies', r: 0, max: 30, scale: [0.7, 1.2], place: 'float', critter: 'flutter', lift: [0.8, 2.5] },
  bat: { desc: 'bats flapping about (spooky or night worlds)', r: 0, max: 18, scale: [0.8, 1.2], place: 'float', critter: 'fly', lift: [5, 12] },
  firefly: { desc: 'glowing fireflies', r: 0, max: 60, scale: [0.8, 1.2], place: 'float', critter: 'flutter', lift: [0.6, 3] },
};

export const LANDMARK_KINDS = {
  windmill: { desc: 'windmill with turning sails', r: 2.6 },
  tower: { desc: 'tall round stone tower', r: 2.5 },
  fountain: { desc: 'tiered fountain', r: 3.3 },
  cottage: { desc: 'small cottage with a pitched roof', r: 3.2 },
  arch: { desc: 'grand archway you can walk through', r: 4.6 },
  castle: { desc: 'small castle with towers and a gate', r: 7 },
  throne: { desc: 'giant throne on a stepped dais', r: 3.4 },
  pyramid: { desc: 'stepped pyramid', r: 6 },
  temple: { desc: 'columned temple', r: 5.2 },
  statue: { desc: 'giant statue of a heroic-looking figure on a plinth', r: 2.6 },
  monument: { desc: 'giant statue of the locals’ own species', r: 2.6 },
  monolith: { desc: 'mysterious black monolith', r: 1.4 },
  obelisk: { desc: 'tall pointed obelisk', r: 1.6 },
  giant_tree: { desc: 'enormous ancient tree', r: 3 },
  mushroom_house: { desc: 'house inside a giant mushroom', r: 3.4 },
  lighthouse: { desc: 'striped lighthouse with a turning lamp', r: 2.4 },
  clocktower: { desc: 'clock tower with moving hands', r: 2.6 },
  ferris_wheel: { desc: 'turning ferris wheel', r: 4.5 },
  carousel: { desc: 'spinning carousel', r: 4.2 },
  stage: { desc: 'performance stage with curtains', r: 5 },
  shop: { desc: 'shopfront with an awning and a glowing window', r: 3.8 },
  escalator: { desc: 'escalator going up to nowhere', r: 3.4 },
  kiosk: { desc: 'little booth / kiosk / ticket window', r: 2 },
  dome: { desc: 'domed observatory or rotunda', r: 4.6 },
  bridge: { desc: 'arched stone bridge', r: 5.5 },
  shipwreck: { desc: 'tilted shipwreck', r: 5 },
  rocket: { desc: 'rocket on a launch pad', r: 3 },
  ufo: { desc: 'crashed flying saucer, glowing', r: 4 },
  radio_dish: { desc: 'giant radio telescope dish', r: 4 },
  portal: { desc: 'spinning glowing portal ring', r: 2.8 },
  stone_circle: { desc: 'ring of standing stones', r: 0 },
  totem: { desc: 'carved totem pole', r: 1.2 },
  campfire: { desc: 'campfire with log seats', r: 2.4 },
  well: { desc: 'old stone well', r: 1.6 },
  big_top: { desc: 'striped circus tent', r: 6 },
  skyscraper: { desc: 'very tall tower block with glowing windows', r: 4.5 },
  volcano: { desc: 'small volcano with a glowing crater', r: 8 },
  igloo: { desc: 'igloo', r: 3 },
  pagoda: { desc: 'tiered pagoda', r: 3.6 },
  crystal_spire: { desc: 'enormous glowing crystal spire', r: 2.6 },
  skeleton: { desc: 'giant skeleton of some long-gone creature', r: 4 },
  gazebo: { desc: 'gazebo / bandstand', r: 3.4 },
  hot_air_balloon: { desc: 'hot air balloon hovering above a basket', r: 1.5 },
  billboard: { desc: 'huge billboard showing the sign text', r: 2.2 },
};

// Living things that wander about: body plans for the locals.
export const SPECIES = {
  frog: 'frog or toad', bird: 'any bird (duck, crow, owl, penguin, pigeon...)', fish: 'fish that floats about',
  robot: 'robot', blob: 'squishy blob / slime / jelly', person: 'small round person (wizards, chefs, tourists, clerks...)',
  critter: 'four-legged animal (cat, dog, fox, cow, pig, sheep, rabbit, lizard...)', bear: 'chunky bear-like biped',
  bug: 'insect (beetle, ant, bee...)', snail: 'snail or slug', ghost: 'floating ghost', mushroom: 'walking mushroom',
  crab: 'crab or lobster', octopus: 'octopus or squid', golem: 'rock golem / stone creature', snowman: 'living snowman',
  sprout: 'walking plant, flower or vegetable',
};

export const HATS = ['none', 'top', 'crown', 'party', 'beanie', 'wizard', 'chef', 'helmet', 'cap', 'cowboy', 'bow', 'halo', 'antenna', 'horns', 'flower', 'pirate', 'hardhat'];

export const SHAPES = {
  flat: 'mostly flat ground', hills: 'rolling hills', mountains: 'steep mountains around a valley', dunes: 'sand dunes',
  canyon: 'plateaus cut by winding canyons', islands: 'islands in the sea (or floating sky islands when water is "none")',
  crater: 'a big crater with a rim', terraces: 'stepped terraces',
};
export const GROUNDS = ['grass', 'sand', 'snow', 'rock', 'mud', 'dirt', 'moss', 'ash', 'ice', 'candy', 'tile', 'carpet', 'metal', 'wood'];
export const WATERS = ['none', 'lake', 'river', 'sea', 'swamp'];
export const TIMES = ['dawn', 'day', 'dusk', 'night'];
export const WEATHERS = ['clear', 'cloudy', 'rain', 'storm', 'snow', 'fog', 'embers', 'bubbles', 'leaves', 'spores', 'sandstorm', 'petals', 'sparkles'];
export const MEDIUMS = ['air', 'underwater', 'space', 'cavern'];
export const MEDIUM_DESC = { air: 'open sky', underwater: 'the whole world is under the sea (blue haze, no sky)', space: 'airless, black starry sky', cavern: 'enclosed: a dark ceiling instead of sky (caves, big indoor halls)' };
export const AMBIENCES = ['wind', 'birds', 'insects', 'frogs', 'water', 'waves', 'underwater', 'city', 'crowd', 'cave', 'machine', 'eerie', 'fire', 'muzak', 'chimes'];
