// Words the keyword generator understands beyond settings: creatures,
// mediums, time, weather, mood, colour, size, terrain and water modifiers.

// Creature words -> body plan. c: body colours, a: accent, hat: default hat,
// v: critter variant, label: what to call them.
export const CREATURES = [
  { w: ['frog', 'toad', 'tadpole', 'bullfrog'], sp: 'frog', c: ['#7fc46a', '#5fae5a', '#93cf62', '#6fb86a'], a: '#2f5e2a' },
  { w: ['duck', 'duckling'], sp: 'bird', c: ['#f6d55c', '#f2f2ee'], a: '#f2a33d' },
  { w: ['goose', 'swan'], sp: 'bird', c: ['#f4f2ec'], a: '#f2a33d' },
  { w: ['crow', 'raven', 'magpie', 'blackbird', 'vulture'], sp: 'bird', c: ['#2f3138', '#3a3540'], a: '#e8c95a' },
  { w: ['pigeon', 'dove'], sp: 'bird', c: ['#9aa3b0', '#b8b8c4'], a: '#8a5aa8' },
  { w: ['owl'], sp: 'bird', c: ['#a8805a', '#8a6a4a'], a: '#f2d25a' },
  { w: ['penguin', 'puffin'], sp: 'bird', c: ['#2a2d36'], a: '#f2a33d' },
  { w: ['flamingo'], sp: 'bird', c: ['#ff8ab5', '#f7a1c4'], a: '#2a2a2a' },
  { w: ['parrot', 'macaw', 'toucan', 'peacock'], sp: 'bird', c: ['#e0402f', '#2fb05a', '#2f7fe0'], a: '#f2d25a' },
  { w: ['chicken', 'hen', 'rooster', 'chick', 'turkey'], sp: 'bird', c: ['#f4efe4', '#d89a5a'], a: '#e0402f' },
  { w: ['bird', 'seagull', 'gull', 'sparrow', 'robin', 'pelican', 'finch', 'canary', 'hummingbird', 'eagle', 'hawk', 'stork', 'heron'], sp: 'bird', c: ['#c9ced6', '#8fb3d9', '#e6c05a'], a: '#f2a33d' },
  { w: ['fish', 'goldfish', 'salmon', 'trout', 'tuna', 'carp', 'koi', 'guppy', 'eel', 'shark', 'whale', 'dolphin', 'mermaid', 'merfolk', 'seahorse'], sp: 'fish', c: ['#ff9a3d', '#5ab0e0', '#e05a8a', '#f2d25a'], a: '#ffffff' },
  { w: ['robot', 'android', 'droid', 'bot', 'cyborg', 'automaton', 'machine', 'drone', 'computer', 'ai'], sp: 'robot', c: ['#b8c0cc', '#9aa8b8', '#e0b85a'], a: '#5ae0ff' },
  { w: ['slime', 'blob', 'jelly', 'goo', 'ooze', 'amoeba', 'bean', 'potato'], sp: 'blob', c: ['#8ae07a', '#e08ad8', '#7ad0e0', '#f2c95a'], a: '#2a2a2a' },
  { w: ['alien', 'martian', 'extraterrestrial'], sp: 'person', c: ['#8ae07a', '#a8e05a'], a: '#2a2a2a', hat: 'antenna' },
  { w: ['cat', 'kitten', 'kitty', 'fox', 'lynx', 'tiger', 'lion', 'leopard', 'squirrel', 'raccoon'], sp: 'critter', v: 'cat', c: ['#f2a35a', '#8a8a8a', '#3a3a3a', '#f4efe4'], a: '#ffb3c4' },
  { w: ['dog', 'puppy', 'wolf', 'hound', 'poodle', 'corgi', 'horse', 'pony', 'donkey', 'otter', 'beaver', 'weasel', 'badger', 'hedgehog'], sp: 'critter', v: 'dog', c: ['#c89a6a', '#8a6a4a', '#f4efe4', '#5a4a3a'], a: '#2a2a2a' },
  { w: ['rabbit', 'bunny', 'hare', 'kangaroo'], sp: 'critter', v: 'rabbit', c: ['#f4efe4', '#c8b49a', '#9a8a7a'], a: '#ffb3c4' },
  { w: ['mouse', 'mice', 'rat', 'hamster', 'gerbil', 'mole', 'shrew', 'possum', 'koala', 'monkey', 'ape', 'lemur', 'sloth'], sp: 'critter', v: 'mouse', c: ['#9a9aa2', '#c8b49a', '#8a7a6a'], a: '#ffb3c4' },
  { w: ['pig', 'piglet', 'hog', 'boar'], sp: 'critter', v: 'pig', c: ['#f7b6c2', '#e8a0b0'], a: '#d87a8a' },
  { w: ['cow', 'cattle', 'bull', 'ox', 'goat', 'deer', 'moose', 'elk', 'reindeer', 'antelope', 'giraffe', 'yak', 'bison'], sp: 'critter', v: 'cow', c: ['#f4efe4', '#8a6a4a', '#c89a6a'], a: '#2a2a2a' },
  { w: ['sheep', 'lamb', 'llama', 'alpaca', 'poodle'], sp: 'critter', v: 'sheep', c: ['#f6f2ea', '#e8e0d0'], a: '#3a3a3a' },
  { w: ['lizard', 'gecko', 'iguana', 'crocodile', 'alligator', 'dinosaur', 'dragon', 'salamander', 'newt', 'chameleon', 'snake', 'serpent'], sp: 'critter', v: 'lizard', c: ['#6ab05a', '#8ac04a', '#c0503a', '#5aa0a0'], a: '#f2d25a' },
  { w: ['turtle', 'tortoise', 'armadillo'], sp: 'critter', v: 'turtle', c: ['#8ab05a', '#7a9a4a'], a: '#8a6a3a' },
  { w: ['bear', 'panda', 'teddy', 'grizzly', 'yeti', 'bigfoot', 'troll', 'ogre', 'gorilla'], sp: 'bear', c: ['#8a5a3a', '#6a4a3a', '#f4efe4', '#5a5a5a'], a: '#3a2a20' },
  { w: ['bug', 'beetle', 'ant', 'bee', 'wasp', 'moth', 'butterfly', 'ladybug', 'ladybird', 'mantis', 'cricket', 'grasshopper', 'insect', 'spider', 'termite', 'fly', 'flies', 'firefly', 'cockroach', 'caterpillar', 'worm'], sp: 'bug', c: ['#3a3f4a', '#c0402f', '#e0b83a', '#5a8a3a'], a: '#f2d25a' },
  { w: ['snail', 'slug'], sp: 'snail', c: ['#c8b08a', '#a8c08a'], a: '#c07a5a' },
  { w: ['ghost', 'spirit', 'phantom', 'specter', 'spectre', 'ghoul', 'poltergeist', 'wraith', 'soul', 'soul', 'spook'], sp: 'ghost', c: ['#eef2ff', '#dfe8ff', '#e6f6f2'], a: '#2a2a3a' },
  { w: ['jellyfish'], sp: 'ghost', c: ['#ff9ad5', '#a8d8ff'], a: '#ffffff' },
  { w: ['mushroom', 'fungus', 'fungi', 'toadstool', 'shroom', 'mushroomfolk'], sp: 'mushroom', c: ['#d84b3f', '#c89a5a', '#8a6ad8'], a: '#fffaf0' },
  { w: ['crab', 'lobster', 'shrimp', 'prawn', 'crayfish', 'scorpion'], sp: 'crab', c: ['#e0502f', '#e07a3a'], a: '#2a2a2a' },
  { w: ['octopus', 'squid', 'kraken', 'cuttlefish', 'octopi'], sp: 'octopus', c: ['#d86ab0', '#8a6ad8', '#e07a5a'], a: '#2a2a2a' },
  { w: ['golem', 'golems', 'rock', 'rocks', 'pebble', 'pebbles', 'boulder', 'boulders', 'gargoyle', 'gargoyles', 'statue', 'statues'], sp: 'golem', c: ['#9a948a', '#8a8f98', '#a89a88'], a: '#7fe0ff' },
  { w: ['snowman', 'snowmen', 'snowperson'], sp: 'snowman', c: ['#f6f8ff'], a: '#ff8a3d' },
  { w: ['plant', 'flower', 'sprout', 'vegetable', 'carrot', 'turnip', 'radish', 'tomato', 'cabbage', 'cactus', 'tree', 'seedling', 'sunflower', 'fruit', 'apple', 'banana', 'pear'], sp: 'sprout', c: ['#6ab05a', '#8ac04a'], a: '#ff7aa8' },
  // people, by job or costume
  { w: ['wizard', 'sorcerer', 'mage', 'warlock', 'witch', 'magician', 'necromancer'], sp: 'person', c: ['#6a5ad8', '#3a3a5a', '#5a8a5a'], a: '#f2d25a', hat: 'wizard' },
  { w: ['king', 'queen', 'prince', 'princess', 'monarch', 'emperor', 'empress', 'royal', 'royalty', 'duke', 'duchess', 'noble', 'nobles'], sp: 'person', c: ['#a83a4a', '#5a3a8a'], a: '#f2c94c', hat: 'crown' },
  { w: ['knight', 'soldier', 'guard', 'warrior', 'viking', 'samurai', 'gladiator'], sp: 'person', c: ['#9aa3ad', '#6a7a8a'], a: '#c0402f', hat: 'helmet' },
  { w: ['chef', 'cook', 'baker', 'waiter', 'waitress'], sp: 'person', c: ['#f6f2ea'], a: '#e0502f', hat: 'chef' },
  { w: ['pirate', 'buccaneer', 'sailor', 'captain'], sp: 'person', c: ['#8a3a3a', '#3a4a6a'], a: '#2a2a2a', hat: 'pirate' },
  { w: ['cowboy', 'cowgirl', 'sheriff', 'outlaw', 'rancher', 'farmer'], sp: 'person', c: ['#a8704a', '#5a7aa8'], a: '#6b4a2f', hat: 'cowboy' },
  { w: ['clown', 'jester', 'juggler', 'acrobat', 'mime', 'elf', 'elves', 'gnome', 'gnomes', 'leprechaun', 'dwarf', 'dwarves'], sp: 'person', c: ['#e0402f', '#3a8ad8', '#f2d25a'], a: '#ffffff', hat: 'party' },
  { w: ['astronaut', 'cosmonaut', 'diver', 'firefighter'], sp: 'person', c: ['#f2f2f2', '#e0e4ea'], a: '#3a7ad8', hat: 'helmet' },
  { w: ['worker', 'builder', 'miner', 'engineer', 'plumber', 'mechanic', 'construction'], sp: 'person', c: ['#f2a33d', '#3a6ad8'], a: '#f2d25a', hat: 'hardhat' },
  { w: ['angel', 'angels', 'saint', 'cherub'], sp: 'person', c: ['#f6f2ea'], a: '#f2d25a', hat: 'halo' },
  { w: ['devil', 'demon', 'imp', 'goblin', 'minotaur', 'satyr'], sp: 'person', c: ['#c0402f', '#5aa04a'], a: '#2a2a2a', hat: 'horns' },
  { w: ['vampire', 'count', 'dracula'], sp: 'person', c: ['#2a2a3a', '#e8e4f0'], a: '#a01a2a', hat: 'none' },
  { w: ['zombie', 'zombies', 'undead', 'mummy', 'mummies', 'skeleton', 'skeletons', 'werewolf'], sp: 'person', c: ['#8ab07a', '#e8e0c8'], a: '#5a4a3a', hat: 'none' },
  { w: ['fairy', 'fairies', 'pixie', 'sprite', 'nymph'], sp: 'person', c: ['#ff9ad5', '#9ad8ff', '#c8f0a8'], a: '#f2d25a', hat: 'flower' },
  { w: ['tourist', 'student', 'kid', 'child', 'children', 'teen', 'teenager', 'intern', 'athlete'], sp: 'person', c: ['#3a8ad8', '#e05a5a', '#5ab05a'], a: '#f2d25a', hat: 'cap' },
  { w: ['accountant', 'banker', 'lawyer', 'clerk', 'bureaucrat', 'manager', 'executive', 'ceo', 'politician', 'mayor', 'detective', 'butler', 'gentleman', 'lady', 'magnate'], sp: 'person', c: ['#3a3f4a', '#5a5f6a', '#6a4a3a'], a: '#e8e4dc', hat: 'top' },
  { w: ['librarian', 'teacher', 'professor', 'scientist', 'doctor', 'nurse', 'scholar', 'monk', 'nun', 'priest', 'grandma', 'grandpa', 'granny'], sp: 'person', c: ['#8a6a8a', '#5a7a6a', '#f6f2ea'], a: '#e8e4dc', hat: 'bow' },
  { w: ['ninja', 'spy', 'thief', 'burglar', 'rogue', 'hipster', 'artist', 'painter', 'poet', 'musician', 'rapper', 'singer', 'dj'], sp: 'person', c: ['#2a2a3a', '#5a3a6a'], a: '#e05a8a', hat: 'beanie' },
  { w: ['person', 'people', 'human', 'humans', 'villager', 'villagers', 'citizen', 'citizens', 'resident', 'residents', 'folk', 'man', 'men', 'woman', 'women', 'neighbor', 'neighbour', 'local', 'locals', 'shopper', 'customer', 'retiree', 'pensioner', 'gamer', 'baby', 'babies', 'cultist', 'monks'], sp: 'person', c: ['#3a8ad8', '#e05a5a', '#5ab05a', '#e0a83a'], a: '#f2d25a' },
];

// Labels for body plans when we need a generic word.
export const SPECIES_LABEL = {
  frog: 'frog', bird: 'bird', fish: 'fish', robot: 'robot', blob: 'blob', person: 'person', critter: 'creature',
  bear: 'bear', bug: 'beetle', snail: 'snail', ghost: 'ghost', mushroom: 'mushroom', crab: 'crab', octopus: 'octopus',
  golem: 'golem', snowman: 'snowman', sprout: 'sprout',
};

export const SPECIES_DEFAULT = {
  frog: { c: ['#7fc46a', '#5fae5a'], a: '#2f5e2a' }, bird: { c: ['#c9ced6', '#8fb3d9', '#f6d55c'], a: '#f2a33d' },
  fish: { c: ['#ff9a3d', '#5ab0e0', '#e05a8a'], a: '#ffffff' }, robot: { c: ['#b8c0cc', '#e0b85a'], a: '#5ae0ff' },
  blob: { c: ['#8ae07a', '#e08ad8', '#7ad0e0'], a: '#2a2a2a' }, person: { c: ['#3a8ad8', '#e05a5a', '#5ab05a', '#e0a83a'], a: '#f2d25a' },
  critter: { c: ['#f2a35a', '#8a8a8a', '#c89a6a', '#f4efe4'], a: '#ffb3c4' }, bear: { c: ['#8a5a3a', '#6a4a3a'], a: '#3a2a20' },
  bug: { c: ['#3a3f4a', '#c0402f', '#e0b83a'], a: '#f2d25a' }, snail: { c: ['#c8b08a', '#a8c08a'], a: '#c07a5a' },
  ghost: { c: ['#eef2ff', '#e6f6f2'], a: '#2a2a3a' }, mushroom: { c: ['#d84b3f', '#c89a5a', '#8a6ad8'], a: '#fffaf0' },
  crab: { c: ['#e0502f', '#e07a3a'], a: '#2a2a2a' }, octopus: { c: ['#d86ab0', '#8a6ad8'], a: '#2a2a2a' },
  golem: { c: ['#9a948a', '#8a8f98'], a: '#7fe0ff' }, snowman: { c: ['#f6f8ff'], a: '#ff8a3d' }, sprout: { c: ['#6ab05a', '#8ac04a'], a: '#ff7aa8' },
};

export { CRITTER_VARIANTS } from '../kit/catalog.js';

// Phrases that change the medium regardless of the setting.
export const MEDIUM_PHRASES = {
  underwater: ['underwater', 'undersea', 'submerged', 'sunken', 'beneath the waves', 'under the sea', 'under water', 'under the ocean', 'bottom of the ocean', 'bottom of the sea', 'bottom of a lake', 'ocean floor', 'sea floor', 'seafloor', 'seabed', 'deep sea', 'in the ocean', 'in the sea', 'in the deep', 'atlantis', 'aquatic'],
  space: ['in space', 'outer space', 'on the moon', 'on a moon', 'on mars', 'on venus', 'on jupiter', 'on saturn', 'in orbit', 'on an asteroid', 'on a comet', 'space station', 'zero gravity', 'on a planet', 'alien planet', 'another planet', 'distant planet', 'on the dark side', 'between the stars', 'lunar'],
  cavern: ['underground', 'in a cave', 'inside a cave', 'beneath the earth', 'below ground', 'subterranean', 'inside a mountain', 'under a mountain', 'in a basement', 'in the basement', 'in a sewer', 'sewer', 'sewers', 'in a mine', 'indoors', 'inside a', 'inside an', 'inside the'],
  sky: ['in the sky', 'in the clouds', 'above the clouds', 'on a cloud', 'on the clouds', 'floating', 'sky island', 'sky islands', 'in the air', 'airborne', 'hovering', 'levitating'],
};

export const TIME_WORDS = {
  night: ['night', 'midnight', 'moonlit', 'moonlight', 'nocturnal', 'nighttime', 'starlit', 'dark', 'darkness', '3am'],
  dusk: ['dusk', 'sunset', 'twilight', 'evening', 'golden hour', 'sundown'],
  dawn: ['dawn', 'sunrise', 'morning', 'daybreak', 'early'],
  day: ['noon', 'midday', 'sunny', 'sunshine', 'bright', 'daytime', 'afternoon', 'summer'],
};

export const WEATHER_WORDS = {
  rain: ['rain', 'rainy', 'raining', 'drizzle', 'drizzly', 'wet', 'puddle', 'puddles', 'monsoon', 'soggy', 'damp'],
  storm: ['storm', 'stormy', 'thunder', 'thunderstorm', 'lightning', 'hurricane', 'tempest', 'typhoon', 'gale'],
  snow: ['snow', 'snowy', 'snowing', 'blizzard', 'snowfall', 'snowflake', 'snowflakes', 'flurry', 'wintry'],
  fog: ['fog', 'foggy', 'mist', 'misty', 'haze', 'hazy', 'murky', 'smog'],
  embers: ['ember', 'embers', 'ash', 'ashes', 'burning', 'inferno', 'smoldering', 'smouldering', 'sparks', 'flaming'],
  leaves: ['autumn', 'fall', 'leaves', 'leafy', 'october', 'harvest'],
  petals: ['spring', 'blossom', 'blossoms', 'petal', 'petals', 'cherry', 'romantic', 'wedding'],
  sparkles: ['sparkle', 'sparkly', 'sparkling', 'glitter', 'glittering', 'twinkling', 'magic', 'magical', 'enchanted', 'dreamy', 'shimmering', 'starry'],
  spores: ['spore', 'spores', 'fungal', 'pollen', 'dusty', 'dandelion'],
  sandstorm: ['sandstorm', 'duststorm', 'windswept', 'dust'],
  bubbles: ['bubble', 'bubbles', 'bubbly', 'fizzy', 'soda', 'soap', 'soapy', 'foam'],
  cloudy: ['cloudy', 'overcast', 'grey', 'gray', 'gloomy', 'dreary', 'drab', 'bleak', 'tuesday', 'monday'],
  clear: ['clear', 'cloudless', 'fine'],
};

export const MOODS = {
  spooky: { w: ['haunted', 'spooky', 'creepy', 'cursed', 'eerie', 'sinister', 'ominous', 'macabre', 'gothic', 'ghostly', 'scary', 'horror', 'terrifying', 'doomed'], time: 'night', weather: 'fog', amb: 'eerie', add: [['tree_dead', 0.4], ['candle', 0.3], ['bat', 0.4]] },
  abandoned: { w: ['abandoned', 'forgotten', 'deserted', 'empty', 'derelict', 'ruined', 'decaying', 'overgrown', 'crumbling', 'lonely', 'forsaken', 'vacant', 'dusty', 'last'], weather: 'cloudy', amb: 'wind', add: [['pillar_ruin', 0.3], ['tree_dead', 0.3], ['vine_arch', 0.2]], desat: 0.35 },
  cozy: { w: ['cozy', 'cosy', 'peaceful', 'quiet', 'calm', 'gentle', 'tranquil', 'serene', 'sleepy', 'charming', 'quaint', 'pleasant', 'nice', 'idyllic', 'wholesome', 'lazy', 'relaxing', 'snug'], amb: 'birds', add: [['flower', 0.4], ['lantern', 0.2]] },
  festive: { w: ['festive', 'party', 'celebrating', 'celebration', 'birthday', 'jubilant', 'cheerful', 'happy', 'joyful', 'jolly', 'colorful', 'colourful', 'fun', 'silly', 'disco'], weather: 'sparkles', amb: 'muzak', add: [['balloon', 0.4], ['flag', 0.3], ['lantern', 0.3]] },
  angry: { w: ['angry', 'furious', 'chaotic', 'war', 'warring', 'battle', 'raging', 'grumpy', 'rebellious', 'revolution', 'riot', 'feud', 'cranky'], weather: 'storm', amb: 'wind', add: [['torch', 0.3], ['flag', 0.3]] },
  sad: { w: ['sad', 'melancholy', 'melancholic', 'sorrowful', 'mournful', 'tearful', 'weeping', 'heartbroken', 'depressed', 'bored', 'boring', 'tired', 'weary', 'disappointed', 'existential'], weather: 'rain', amb: 'wind', desat: 0.4 },
  neon: { w: ['neon', 'glowing', 'luminous', 'electric', 'bioluminescent', 'radioactive', 'futuristic', 'cyber', 'holographic', 'synthwave', 'vaporwave'], time: 'night', amb: 'machine', add: [['lamp_post', 0.3], ['crystal', 0.3]], glow: true },
  tiny: { w: ['tiny', 'small', 'little', 'miniature', 'mini', 'teeny', 'itsy', 'pocket', 'micro', 'smallest'], size: 0.72 },
  giant: { w: ['giant', 'huge', 'enormous', 'gigantic', 'massive', 'colossal', 'big', 'biggest', 'vast', 'titanic', 'towering', 'mega', 'great'], size: 1.35 },
  rich: { w: ['golden', 'gold', 'rich', 'wealthy', 'luxurious', 'luxury', 'fancy', 'posh', 'opulent', 'treasure', 'royal', 'expensive', 'billionaire'], add: [['coin_pile', 0.3], ['statue_small', 0.2]], accent: '#f2c94c' },
  ancient: { w: ['ancient', 'old', 'oldest', 'prehistoric', 'primeval', 'antique', 'medieval', 'olden', 'mythical', 'legendary'], add: [['pillar_ruin', 0.3], ['stone_circle', 0]] },
};

export const COLORS = {
  red: '#e0402f', crimson: '#b8202f', scarlet: '#e0302f', orange: '#f2862c', amber: '#f2a32c', yellow: '#f2d23a',
  golden: '#f2c24c', gold: '#f2c24c', green: '#4fb04a', emerald: '#2fa86a', lime: '#9ad83a', teal: '#2fa8a0',
  turquoise: '#3ad0c0', cyan: '#3ad8e8', blue: '#3a7ae0', azure: '#4a9af0', navy: '#2a3a7a', indigo: '#4a3aa8',
  purple: '#8a4ad8', violet: '#9a5ae0', lavender: '#b8a0f0', magenta: '#e03aa8', pink: '#ff7ab8', rose: '#f08aa8',
  brown: '#8a5a3a', beige: '#e0d0b0', black: '#2a2a30', white: '#f4f2ee', grey: '#9a9aa2', gray: '#9a9aa2',
  silver: '#c8ccd4', rainbow: 'rainbow', pastel: 'pastel', beige2: '#e0d0b0',
};

export const SHAPE_WORDS = {
  hills: ['hill', 'hills', 'hilly', 'rolling', 'slope', 'slopes', 'mound', 'mounds'],
  mountains: ['mountain', 'mountains', 'mountainous', 'peak', 'peaks', 'alps', 'cliff', 'cliffs', 'summit', 'ridge'],
  dunes: ['dune', 'dunes'],
  canyon: ['canyon', 'canyons', 'gorge', 'ravine', 'mesa', 'plateau', 'chasm'],
  islands: ['island', 'islands', 'archipelago', 'atoll', 'isle', 'isles'],
  crater: ['crater', 'caldera', 'bowl', 'pit', 'arena', 'stadium', 'colosseum'],
  terraces: ['terrace', 'terraces', 'terraced', 'steps', 'stairs', 'staircase', 'tiers'],
  flat: ['flat', 'plain', 'plains', 'prairie', 'parking', 'lot', 'pancake', 'tundra', 'steppe', 'floor'],
};

export const WATER_WORDS = {
  lake: ['lake', 'lakes', 'pond', 'ponds', 'pool', 'pools', 'lagoon', 'reservoir', 'loch', 'oasis'],
  river: ['river', 'rivers', 'stream', 'streams', 'creek', 'brook', 'canal', 'canals', 'waterway', 'delta', 'waterfall'],
  sea: ['sea', 'ocean', 'coast', 'coastal', 'shore', 'seaside', 'harbor', 'harbour', 'bay', 'beach', 'gulf', 'cove'],
  swamp: ['swamp', 'swampy', 'marsh', 'marshy', 'bog', 'boggy', 'flooded', 'wetland', 'bayou'],
  none: ['dry', 'arid', 'waterless', 'parched', 'drought'],
};

export const RULE_VERBS = ['ruled', 'governed', 'owned', 'controlled', 'conquered', 'dominated', 'reigned', 'led', 'presided', 'claimed', 'annexed', 'colonized', 'colonised', 'occupied', 'invaded', 'overrun'];
export const STAFF_VERBS = ['run', 'managed', 'staffed', 'operated', 'maintained', 'kept', 'guarded', 'patrolled', 'served', 'tended', 'built', 'founded', 'organized', 'organised'];
export const LIVE_VERBS = ['inhabited', 'populated', 'haunted', 'infested', 'full', 'home', 'filled', 'crawling', 'teeming', 'packed', 'crowded', 'where', 'with', 'for', 'of'];

export const STOPWORDS = new Set(`a an the of in on at by to for from with without into onto over under above below beneath behind beside between
  where which who whom whose that this these those there here is are was were be been being am it its it's their they them his her he she
  and or but nor so yet if then than as only just very really quite rather too also not no all any some every each one two three few many
  much more most less least made make makes making run ruled ruling governed owned full filled home inside outside near far around
  about after before during while when until up down out off again ever never always sometimes often still even like same other another
  own such what why how can could will would should may might must shall do does did done has have had having get got place world land
  kind sort type thing things way lot lots bit area zone region somewhere nowhere everywhere everything nothing something anything
  my your our we you i me us im were where's whos thats only every entire whole new old big small little tiny giant huge great
  everyone everybody someone somebody anyone anybody nobody charge middle side top bottom edge center centre corner end part piece half
  front back left right inside outside west east north south day week year time times`.split(/\s+/));
