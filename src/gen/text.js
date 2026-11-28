// Deadpan text for the keyword generator: world names, intros, landmark
// names and signs, local names and lines. Templates use {slots} filled from ctx.

export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
export const titleCase = (s) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase());

const IRREGULAR = { mouse: 'mice', goose: 'geese', fish: 'fish', sheep: 'sheep', person: 'people', octopus: 'octopuses', wolf: 'wolves', elf: 'elves', deer: 'deer', moose: 'moose', child: 'children', man: 'men', woman: 'women', cactus: 'cacti', fungus: 'fungi', dwarf: 'dwarves', snowman: 'snowmen', ox: 'oxen', bison: 'bison', shrimp: 'shrimp', salmon: 'salmon', trout: 'trout', tuna: 'tuna', squid: 'squid', species: 'species', mummy: 'mummies', sheriff: 'sheriffs', cuttlefish: 'cuttlefish', koi: 'koi', alpaca: 'alpacas', merfolk: 'merfolk', folk: 'folk', people: 'people', mice: 'mice' };
export function plural(w) {
  if (!w) return w;
  const low = w.toLowerCase();
  if (IRREGULAR[low]) return IRREGULAR[low];
  if (/(s|x|z|ch|sh)$/.test(low)) return w + 'es';
  if (/[^aeiou]y$/.test(low)) return w.slice(0, -1) + 'ies';
  if (/fe$/.test(low)) return w.slice(0, -2) + 'ves';
  return w + 's';
}
const SINGULAR = Object.fromEntries(Object.entries(IRREGULAR).map(([s, p]) => [p, s]));
export function singular(w) {
  const low = w.toLowerCase();
  if (SINGULAR[low] && SINGULAR[low] !== low) return SINGULAR[low];
  if (/ies$/.test(low) && low.length > 4) return low.slice(0, -3) + 'y';
  if (/(ches|shes|xes|sses|zes|uses)$/.test(low)) return low.slice(0, -2);
  if (/ves$/.test(low) && low.length > 4) return low.slice(0, -3) + 'f';
  if (/[^s]s$/.test(low) && low.length > 3 && !/(ous|us|is|ss)$/.test(low)) return low.slice(0, -1);
  return low;
}

export function tidy(s) {
  return s
    .replace(/\b([Tt]he|[Nn]o|[Aa]|[Mm]ost) the\b/g, (m, a) => (/^[Aa]$/.test(a) ? (a === 'A' ? 'The' : 'the') : a))
    .replace(/\b([Aa]) ([aeioAEIO]\w*)/g, (m, a, w) => `${a}n ${w}`)
    .replace(/\b([Aa]n) ([^aeiouAEIOU\s]\w*)/g, (m, a, w) => (/^(hour|honest|heir)/i.test(w) ? m : `${a[0]} ${w}`))
    .replace(/\s+([.,!?])/g, '$1');
}

export function fill(tpl, ctx, rng) {
  return tidy(tpl.replace(/\{(\w+)\}/g, (m, k) => {
    const v = ctx[k];
    if (v === undefined || v === null) return m;
    return Array.isArray(v) ? rng.pick(v) : String(v);
  }));
}

// ------------------------------------------------------------------ names
const NAME_A = ['Bo', 'Gri', 'Plu', 'Ter', 'Mo', 'Fen', 'Wal', 'Dun', 'Pip', 'Tob', 'Mar', 'Hux', 'Nel', 'Os', 'Quil', 'Ruf', 'Sil', 'Taf', 'Ul', 'Vern', 'Wim', 'Yel', 'Zan', 'Bar', 'Clo', 'Dor', 'El', 'Fig', 'Gus', 'Hob', 'Ig', 'Jas', 'Kip', 'Lo', 'Mab', 'Nib', 'Odo', 'Pim', 'Rho', 'Sto', 'Tib', 'Ver', 'Wob', 'Zef', 'Bram', 'Cor', 'Del', 'Fro', 'Glo', 'Hen', 'Jun', 'Ker', 'Lud', 'Mim', 'Nor', 'Orv', 'Pez', 'Quen', 'Rud', 'Sab'];
const NAME_B = ['ble', 'bert', 'wick', 'ston', 'ley', 'ton', 'ny', 'by', 'kin', 'mond', 'bo', 'per', 'dle', 'ro', 'sy', 'ty', 'more', 'gins', 'dred', 'ola', 'ix', 'ana', 'ette', 'win', 'go', 'lo', 'dy', 'mer', 'rick', 'nell', 'bee', 'mo', 'tle', 'via', 'gus', 'pa'];
const SUR_B = ['wick', 'bottom', 'worth', 'thistle', 'kettle', 'pott', 'ridge', 'field', 'sworth', 'hump', 'lethwaite', 'stump', 'muddle', 'whistle', 'pickle', 'button', 'crumb', 'puddle', 'nook', 'fold', 'dimple', 'wobble'];
const TITLES = ['Mrs.', 'Mr.', 'Old', 'Sir', 'Dame', 'Deputy', 'Little', 'Big', 'Professor', 'Auntie', 'Uncle', 'Captain', 'Doctor', 'Madame', 'Brother', 'Sister', 'Officer', 'Nurse', 'Reverend', 'Coach'];
const EPITHETS = ['the Damp', 'the Tall', 'the Brief', 'the Moist', 'the Reasonable', 'the Late', 'the Lesser', 'the Elder', 'the Quiet', 'the Unready', 'the Punctual', 'the Third', 'the Adequate', 'the Persistent', 'the Unbothered', 'the Mild'];
// How others address a local: "Barley" for "Barley the Tall", but the whole
// "Officer Sparklethistle", never just "Officer" or "Old".
const TITLE_SET = new Set(TITLES);
export const callName = (name) => {
  const first = name.split(' ')[0];
  return name.includes(' ') && TITLE_SET.has(first) ? name : first;
};
export const RULER_TITLES = ['Monarch', 'High Chancellor', 'Supreme Leader', 'Grand Overseer', 'President-for-Life', 'Archduke', 'Regent', 'Sovereign', 'Lord Protector', 'Chief Executive', 'Benevolent Despot', 'Interim Emperor'];

export const firstName = (rng) => rng.pick(NAME_A) + rng.pick(NAME_B);

export function personName(rng, pre) {
  const first = rng.pick(NAME_A) + rng.pick(NAME_B);
  const sur = (rng.chance(0.5) && pre ? pre : rng.pick(NAME_A)) + rng.pick(SUR_B);
  switch (rng.int(0, 4)) {
    case 0: return first;
    case 1: return `${rng.pick(TITLES)} ${cap(sur)}`;
    case 2: return `${first} ${rng.pick(EPITHETS)}`;
    default: return `${first} ${cap(sur)}`;
  }
}

// ------------------------------------------------------------------ world name
const NAME_ADJ = ['Upper', 'Lower', 'Greater', 'Little', 'Old', 'New', 'East', 'West', 'North', 'South', 'Far', 'Nether', 'Middle', 'Outer'];
const REGIMES = ['Regency', 'Dominion', 'Commonwealth', 'Republic', 'Protectorate', 'Empire', 'Duchy', 'Principality', 'Administration', 'Kingdom', 'Free State', 'Territories'];

export function worldName(rng, theme, ctx) {
  const pre = rng.pick(theme.pre), suf = rng.pick(theme.suf), place = rng.pick(theme.place);
  const base = cap((ctx.key && rng.chance(ctx.keyBias ?? 0.45) ? ctx.key : pre) + suf.toLowerCase()).replace(/\s+/g, '');
  const opts = [
    () => base,
    () => `${base} ${place}`,
    () => `${rng.pick(NAME_ADJ)} ${base}`,
    () => `The ${place} at ${base}`,
    () => `${base}-on-${cap(rng.pick(theme.pre))}`,
  ];
  if (ctx.ruled && ctx.ruler) opts.push(() => `The ${cap(ctx.speciesSg)} ${rng.pick(REGIMES)} of ${base}`, () => `The ${cap(ctx.speciesSg)} ${rng.pick(REGIMES)}`);
  if (ctx.key) opts.push(() => `${cap(ctx.key)} ${place}`, () => `${rng.pick(['Mount', 'Port', 'Lake', 'Saint', 'Fort', 'Camp'])} ${cap(ctx.key)}`);
  let n = rng.pick(opts)();
  const words = n.toLowerCase().split(/[\s-]+/);
  if (n.length > 40 || new Set(words).size < words.length) n = base;
  return n;
}

// ------------------------------------------------------------------ intro + welcome
const INTRO_TAIL = [
  'Nobody asked for it, but here it is.',
  'Population: {n}, give or take a {speciesSg}.',
  'Visitors are welcome, within reason.',
  'Things happen here at a pace best described as eventually.',
  'It is exactly as advertised, which surprises everyone.',
  'The locals are friendly, if you count staring.',
  'Please keep to the paths. There are no paths.',
  'There is a gift shop somewhere. Nobody has found it.',
  'The tourism board describes it as "there".',
  'It has {nPoi} points of interest, which the council considers plenty.',
  'Bring a coat. Or don’t. It won’t change anything.',
  'Admission to the {thing} is free. Everything else is also free, but nobody believes it.',
  'Locals describe it as "fine". They are being generous.',
  'It is twinned with nowhere, by mutual agreement.',
  'Mind the {thing}.',
  'Directions are available on request and are usually wrong.',
];
const INTRO_RULED = ['The {speciesPl} would like you to know they were elected.', '{ruler} welcomes you, and would like that noted.', 'All visitors must bow, nod, or at least look busy.'];
const INTRO_STAFF = ['The {speciesPl} run things here. They have clipboards.', 'Staff are on hand. Their hands are mostly in their pockets.'];

export function intro(rng, ctx) {
  const first = `${ctx.name} is ${ctx.sentenceIs}.`;
  const pool = ctx.ruled ? [...INTRO_RULED, ...INTRO_TAIL] : ctx.staffed ? [...INTRO_STAFF, ...INTRO_TAIL] : INTRO_TAIL;
  const picks = rng.shuffle(pool).slice(0, 2);
  if (ctx.ruled && !picks.some((p) => INTRO_RULED.includes(p))) picks[0] = rng.pick(INTRO_RULED);
  return [first, ...picks.map((p) => fill(p, ctx, rng))].join(' ');
}

const WELCOME = [
  'Welcome to {name}. Population: some.',
  'Welcome to {name}. Please drive carefully. There are no roads.',
  'Welcome to {name}. Twinned with nowhere.',
  'Welcome to {name}. Est. a while ago.',
  'You are now entering {name}. You may leave at any time. Few do. It’s a long walk.',
  'Welcome to {name}, home of {landmark}.',
  '{name}. You are here. Congratulations.',
  'Welcome to {name}. Speed limit: a gentle stroll.',
  'Welcome to {name}. Please wipe your feet. On what is your business.',
];
export const welcome = (rng, ctx) => fill(rng.pick(WELCOME), ctx, rng);
export const introTail = (rng, ctx) => fill(rng.pick(INTRO_TAIL), ctx, rng);

// ------------------------------------------------------------------ landmarks
export const KIND_WORD = {
  windmill: 'Windmill', tower: 'Tower', fountain: 'Fountain', cottage: 'Cottage', arch: 'Arch', castle: 'Castle', throne: 'Throne',
  pyramid: 'Pyramid', temple: 'Temple', statue: 'Statue', monument: 'Monument', monolith: 'Monolith', obelisk: 'Obelisk', giant_tree: 'Great Tree',
  mushroom_house: 'Mushroom House', lighthouse: 'Lighthouse', clocktower: 'Clock Tower', ferris_wheel: 'Wheel', carousel: 'Carousel',
  stage: 'Stage', shop: 'Emporium', escalator: 'Escalator', kiosk: 'Kiosk', dome: 'Observatory', bridge: 'Bridge', shipwreck: 'Wreck',
  rocket: 'Rocket', ufo: 'Saucer', radio_dish: 'Listening Dish', portal: 'Portal', stone_circle: 'Stones', totem: 'Totem', campfire: 'Campfire',
  well: 'Well', big_top: 'Big Top', skyscraper: 'Tower', volcano: 'Volcano', igloo: 'Igloo', pagoda: 'Pagoda', crystal_spire: 'Spire',
  skeleton: 'Bones', gazebo: 'Bandstand', hot_air_balloon: 'Balloon', billboard: 'Billboard',
  laundromat: 'Laundromat', bakery: 'Bakery', cafe: 'Café', pizzeria: 'Pizzeria', ice_cream_shop: 'Creamery', donut_shop: 'Donuts',
  burger_joint: 'Burgers', pharmacy: 'Pharmacy', dentist: 'Dental', pet_shop: 'Pet Shop', toy_shop: 'Toy Shop', bookshop: 'Books',
  florist: 'Florist', hardware_store: 'Hardware', arcade: 'Arcade', corner_shop: 'Corner Shop', post_office: 'Post Office', gym: 'Gym',
  tire_shop: 'Tyres', popcorn_stand: 'Popcorn Stand', barber: 'Barber', bank: 'Bank', cinema: 'Cinema', diner: 'Diner',
  gas_station: 'Gas Station', motel: 'Motel', parking_booth: 'Car Park', school: 'School', playground: 'Playground', hospital: 'Hospital',
  supermarket: 'Supermarket', big_house: 'House', apartment: 'Apartments', bus_stop: 'Bus Stop', car_wash: 'Car Wash', pool: 'Pool',
  train: 'Station', airplane: 'Airfield', chapel: 'Chapel', museum: 'Museum', fire_station: 'Fire Station', water_tower: 'Water Tower',
  sports_field: 'Pitch', pier: 'Pier', bowling_alley: 'Lanes', giant_couch: 'Sofa', giant_tv: 'Television', giant_fridge: 'Fridge',
  giant_stove: 'Stove', giant_duck: 'Duck', giant_sock: 'Sock', giant_washer: 'Washing Machine',
};
const LM_ADJ = ['Great', 'Lesser', 'Old', 'New', 'Mostly Original', 'Second-Best', 'Slightly Famous', 'Unremarkable', 'Grand', 'Lonely', 'Former', 'Leaning', 'Municipal', 'Official', 'Disputed', 'Tolerable', 'Reasonable', 'Surprisingly Large', 'Historic', 'Almost Finished'];

export function landmarkName(rng, kind, ctx) {
  const w = KIND_WORD[kind] || 'Landmark';
  const opts = [
    () => `The ${rng.pick(LM_ADJ)} ${w}`,
    () => `${cap(rng.pick(ctx.pre))} ${w}`,
    () => `The ${w} of ${titleCase(rng.pick(ctx.things).replace(/^the /, ''))}`,
    () => `Old ${cap(rng.pick(ctx.pre))}${rng.pick(ctx.suf)} ${w}`,
  ];
  if (ctx.ruler) opts.push(() => `${ctx.rulerShort}’s ${w}`);
  if (ctx.key) opts.push(() => `The ${cap(ctx.key)} ${w}`);
  if (kind === 'monument' || kind === 'statue') opts.push(() => `The ${cap(ctx.speciesSg)} Monument`, () => `Statue of ${ctx.rulerShort || 'Someone Important'}`);
  if (kind === 'volcano') opts.push(() => `Mount ${cap(rng.pick(ctx.pre))}`);
  if (kind === 'shop') opts.push(() => `${cap(rng.pick(ctx.pre))}${rng.pick(['mart', ' & Sons', ' Outlet', ' Discount Barn', ' Boutique'])}`);
  if (kind === 'throne') opts.push(() => `The ${cap(ctx.speciesSg)} Throne`, () => 'The Seat of Power (Damp)');
  let n = rng.pick(opts)();
  if (n.length > 44) n = `The ${w}`;
  return n;
}

const SIGN_GENERIC = [
  '{NAME}. Built in a year nobody can agree on.',
  '{NAME}. Please do not climb it. It has asked.',
  '{NAME}. Closed for reasons. Open for other reasons.',
  'Visitors must be at least {n} {speciesPl} tall to enjoy {NAME}.',
  'This is {NAME}. That’s it. That’s the sign.',
  '{NAME}. Opening hours: occasionally.',
  '{NAME}. Gift shop permanently coming soon.',
  '{NAME}. Please keep all opinions to yourself.',
  '{NAME}. Do not stare at it for too long. It gets shy.',
  '{NAME}. Last renovated: never. Next renovation: also never.',
  '{NAME}. Maximum occupancy: {n}. Current occupancy: also {n}, somehow.',
  '{NAME}. Photography allowed. Posing discouraged.',
  '{NAME}. Do not lick. This means you, {local}.',
  '{NAME}. Respect it. It has been here longer than you, probably.',
  '{NAME}. Sponsored by nobody. Accepting sponsors.',
  '{NAME}. Height: impressive. Purpose: under review.',
  '{NAME}. No {thing} beyond this point. (Plenty of {thing} beyond this point.)',
  '{NAME}. Voted most {superlative} thing in {place}, by {n} {speciesPl}.',
  '{NAME}. Please leave it exactly as confused as you found it.',
  '{NAME}. Lost property: one {lost}. If found, keep it.',
  '{NAME}. Formerly {formerly}. Some of it still is.',
  '{NAME}. If you can read this, you are standing next to {NAME}.',
  '{NAME}. Enjoy responsibly.',
];
const SIGN_KIND = {
  windmill: ['{NAME}. It mills nothing. It is not asked to.', '{NAME}. Wind not included.'],
  tower: ['{NAME}. Stairs: {n}. Elevator: rumoured.', '{NAME}. View from the top: more of {place}.'],
  fountain: ['Coins thrown in {NAME} will be kept. Wishes will be reviewed.', '{NAME}. Not for drinking. Not for swimming. Mostly for looking.'],
  throne: ['{NAME}. Reserved for {ruler}. Do not sit. {ruler} will know.', '{NAME}. Sitting on it does not make you in charge. We checked.'],
  castle: ['{NAME}. Moat currently between moats.', '{NAME}. Siege by appointment only.'],
  monument: ['{NAME}. Likeness approximate. Ego exact.', '{NAME}. Erected in honour of {ruler}, by {ruler}.'],
  statue: ['{NAME}. Likeness approximate. Ego exact.', '{NAME}. The pose was its own idea.'],
  portal: ['{NAME}. Leads somewhere. Not far enough.', '{NAME}. Do not enter. It’s for display only.'],
  volcano: ['{NAME}. Dormant. Please don’t bring it up.', '{NAME}. Do not throw anything in. It throws things back.'],
  shop: ['{NAME}. Everything must go. Nothing has gone.', '{NAME}. Now with doors.'],
  escalator: ['{NAME}. Goes up. That’s the whole thing.', '{NAME}. Out of order since it was in order.'],
  kiosk: ['{NAME}. Tickets for: unclear.', '{NAME}. Back in 5 minutes (since {year}).'],
  billboard: ['{NAME}: YOU ARE HERE. (Just in case.)', 'THIS SPACE AVAILABLE. ALSO THE ONE NEXT TO IT.', 'HAVE YOU TRIED {THING}? YOU HAVE NOW.'],
  clocktower: ['{NAME}. The time is approximately now.', '{NAME}. Correct twice a day. Proud of it.'],
  ferris_wheel: ['{NAME}. Round trip only.', '{NAME}. You will end up where you started. Enjoy.'],
  carousel: ['{NAME}. All horses are spoken for.', '{NAME}. Goes round. Comes back. Every time.'],
  shipwreck: ['{NAME}. Sank in {year}. Still sinking, technically.', '{NAME}. Captain’s whereabouts: none of your business.'],
  skeleton: ['{NAME}. Do not ask it questions. It’s tired.', '{NAME}. It was like this when we got here.'],
  rocket: ['{NAME}. Launch postponed until further notice. Notice postponed.', '{NAME}. Countdown currently at a comfortable 10.'],
  ufo: ['{NAME}. Fully identified. Parking ticket issued.', '{NAME}. The occupants have left a forwarding address.'],
  monolith: ['{NAME}. Do not touch. Do not think about touching.', '{NAME}. Has been asked what it wants. Declined to comment.'],
  well: ['{NAME}. Wishes processed in the order received. Current wait: {n} years.', '{NAME}. Echo service temporarily reduced.'],
  stone_circle: ['{NAME}. Do not rearrange. We just got them how they like it.', '{NAME}. Purpose: forgotten. Vibes: intact.'],
  campfire: ['{NAME}. Ghost stories discouraged. Ghosts encouraged.', '{NAME}. Marshmallows sold separately. Not sold.'],
  igloo: ['{NAME}. Please close the door. There is no door.'],
  bridge: ['{NAME}. Crosses nothing in particular.', '{NAME}. Trolls: none currently employed.'],
  dome: ['{NAME}. Observations: ongoing. Results: pending.', '{NAME}. Looking at the sky so you don’t have to.'],
  radio_dish: ['{NAME}. Listening for signals. Has heard one cough.', '{NAME}. Please speak up.'],
  stage: ['{NAME}. Tonight’s performance: cancelled. Tomorrow’s: also, probably.', '{NAME}. Applause optional. Encouraged. Expected.'],
  big_top: ['{NAME}. Show starts when the clowns find their shoes.'],
  skyscraper: ['{NAME}. Floors 3 through 11 are imaginary.', '{NAME}. The top floor is just more floor.'],
  pyramid: ['{NAME}. Pointy end up. Please keep it that way.'],
  temple: ['{NAME}. Remove your shoes. Then put them back on. It’s cold.', '{NAME}. Quiet please. The silence is old.'],
  giant_tree: ['{NAME}. Older than the town. Younger than its grudges.', '{NAME}. Do not carve initials. It remembers faces.'],
  mushroom_house: ['{NAME}. Do not eat the house.', '{NAME}. Residents report it is "fine, a bit damp".'],
  lighthouse: ['{NAME}. Keeper on holiday. Ships asked to use their judgement.'],
  obelisk: ['{NAME}. Points at the sky. Has its reasons.'],
  totem: ['{NAME}. The top face is in charge.', '{NAME}. Faces not to scale.'],
  pagoda: ['{NAME}. Several floors of contemplation. One more if you count the stairs.'],
  crystal_spire: ['{NAME}. Hums at night. Requests for silence denied.'],
  gazebo: ['{NAME}. Shelter from light rain only.', '{NAME}. Brass band appears Sundays, uninvited.'],
  hot_air_balloon: ['{NAME}. Departures daily. Arrivals debated.'],
  arch: ['You may walk through {NAME}. You will still be here.', '{NAME}. Commemorates an event. Details withheld.'],
  cottage: ['{NAME}. Residents out. Kettle on.', '{NAME}. Private property. Public curiosity.'],
};
const SUPERLATIVES = ['adequate', 'beige', 'present', 'tolerable', 'upright', 'noticeable', 'stationary', 'medium', 'likely', 'local'];
const FORMERLY = ['a bigger thing', 'a smaller thing', 'a rumour', 'a car park', 'somewhere else', 'quite popular', 'a different colour', 'a duck pond'];
const LOST = ['umbrella', 'left shoe', 'sense of direction', 'sandwich', 'grudge', 'hat (sentimental)', 'good idea', 'spoon'];

export function signText(rng, kind, ctx) {
  const pool = [...(SIGN_KIND[kind] || []), ...(SIGN_KIND[kind] || []), ...SIGN_GENERIC]
    .filter((t) => (ctx.ruler ? true : !t.includes('{ruler}')));
  const c = { ...ctx, superlative: SUPERLATIVES, formerly: FORMERLY, lost: LOST, n: String(rng.int(2, 40)), year: String(rng.int(1300, 1999)) };
  let t = fill(rng.pick(pool), c, rng);
  if (t.length > 140) t = fill(rng.pick(SIGN_GENERIC.slice(0, 6)), c, rng);
  return t;
}

// ------------------------------------------------------------------ locals' lines
const LINES = [
  'Welcome to {place}. That’s all I was told to say.',
  'Have you seen {landmark}? Don’t. I mean, do. But don’t.',
  'I’ve lived here {n} years and I’m still not used to the {thing}.',
  'I’m the {role}. It’s mostly paperwork.',
  'Lovely {weatherWord} today. Same as yesterday.',
  'I used to be a {formerJob}. Then I wasn’t.',
  'Don’t touch the {thing}. I mean it. Well, I mostly mean it.',
  'You’re not from here. I can tell by the way you walk. Upright.',
  '{landmark} was here before me. It never lets me forget it.',
  'Some say {place} is boring. Those people are right, but they’re rude about it.',
  'I’m on my break. I’ve been on my break for {n} {timeUnit}.',
  'Shh. I’m thinking about {thing}.',
  'Do you like {thing}? Wrong answer. Kidding. There is no right answer.',
  'I don’t get many visitors. I get normal amounts. Regular amounts.',
  '{landmark}? Overrated. I go there every day.',
  'Mind the {thing}. Nobody else does.',
  'I once walked to the edge of {place}. It’s just more {place}.',
  'Ask me about {thing}. Actually, don’t.',
  'I’m not lost. This is where I stand.',
  'Nice hat. You’re not wearing a hat. That’s what makes it nice.',
  'If you see {otherLocal}, tell them I said nothing.',
  '{otherLocal} still owes me for the {thing}. I’m not bitter. I’m keeping count.',
  'Everyone here is a {speciesSg}. Except you. We’ve noticed.',
  'I’m having a {adj} day. Thank you for not asking.',
  'They put up a sign at {landmark}. Now everyone reads it. I liked it before.',
  'Is it {timeWord}? It’s always {timeWord} here. We’ve filed a complaint.',
  'My hobbies include standing here and also standing over there.',
  'Please don’t step on the {thing}. Or do. I’m not in charge of the {thing}.',
  'I wrote a poem about {thing}. It’s one word long. You can guess it.',
  'Tourists ask me for directions. I point. They leave. Works every time.',
  'I came here for the {thing}. I stayed for the {thing}. Don’t ask.',
  'I’m the {role}. Ask me anything. I’ll decide later if I answer.',
  'The {speciesPl} have a meeting on Thursdays. I’m not invited. I’m the chair.',
  'Don’t tell anyone, but {landmark} is hollow. Or it isn’t. Don’t tell anyone either way.',
  'I believe in you. Mostly because you’re standing right there.',
];
const RULED_LINES = [
  '{ruler} is doing a wonderful job. {ruler} asked me to say that.',
  'Please don’t tell {ruler} you saw me here.',
  'All hail {ruler}. Quietly. {ruler} has a headache.',
  'I voted for {ruler}. Everyone did. There was one box.',
  '{ruler} once looked at me. I think about it constantly.',
];
const RULER_SELF = [
  'You may approach. Slowly. With admiration.',
  'Yes, I am {rulerShort}. No, you may not have a turn.',
  'Everything you can see belongs to me. Including that. And that.',
  'I was elected. Unanimously. By me.',
  'Do you like the {thing}? I commissioned it. I commissioned all of it.',
  'Bow if you like. Nod if you must. Wave and you’re out.',
];
const FORMER = ['lighthouse keeper', 'professional sitter', 'cloud', 'small business', 'rumour', 'competitive napper', 'tour guide', 'very large pebble', 'mime (loud)', 'weather vane'];
const ADJS = ['medium', 'beige', 'perfectly adequate', 'lateral', 'moist', 'administrative', 'quiet', 'long'];
const TIME_UNIT = ['minutes', 'weeks', 'years', 'Tuesdays', 'seasons'];

export function localLines(rng, ctx, isRuler, count = 3) {
  const pool = isRuler ? [...RULER_SELF, ...LINES] : ctx.ruler ? [...RULED_LINES, ...LINES] : LINES;
  const c = { ...ctx, formerJob: FORMER, adj: ADJS, timeUnit: TIME_UNIT, n: String(rng.int(2, 60)) };
  const out = [];
  const used = ctx.usedLines || new Set();
  const shuffled = rng.shuffle(pool);
  for (const t of shuffled) {
    if (out.length >= count) break;
    if (used.has(t)) continue;
    if (t.includes('{otherLocal}') && !ctx.otherLocal) continue;
    // "Everyone here is a person. Except you." is no joke, and it isn't true when a dog lives here too
    if (t.startsWith('Everyone here is a {speciesSg}') && (ctx.speciesSg === 'person' || ctx.mixedSpecies)) continue;
    used.add(t);
    out.push(fill(t, { ...c, n: String(rng.int(2, 60)) }, rng));
  }
  if (isRuler && !out.some((l) => RULER_SELF.some((r) => l.startsWith(r.slice(0, 12))))) out[0] = fill(rng.pick(RULER_SELF), c, rng);
  return out;
}

// ------------------------------------------------------------------ places x settings
const SMALL = new Set(['a', 'an', 'the', 'of', 'on', 'in', 'at', 'by', 'to', 'for', 'and', 'under', 'inside', 'near', 'with', 'from', 'over', 'into', 'up', 'down']);
export const titlePhrase = (s, mid = false) => s.split(' ').map((w, i) => ((i > 0 || mid) && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : cap(w))).join(' ');

// The name of a place's main building: "Lunar Launderette", "Suds & Sons".
export function heroName(rng, place, ctx) {
  const noun = rng.pick(place.nouns), pre = rng.pick(place.pre), suf = rng.pick(place.suf);
  const opts = [
    () => `${pre} ${noun}`,
    () => (/^[A-Za-z]+$/.test(pre) ? `${cap(pre.toLowerCase())}${suf} ${noun}` : `${pre} ${noun}`),
    () => `${pre} & Sons`,
    () => `${pre}${rng.pick(['-O-Rama', ' Express', ' Deluxe', ' Plus', ' 24'])}`,
  ];
  if (ctx.settingAdj) opts.push(() => `${rng.pick(ctx.settingAdj)} ${noun}`, () => `${rng.pick(ctx.settingAdj)} ${noun}`);
  if (ctx.rulerShort) opts.push(() => `${ctx.rulerShort}’s ${noun}`);
  let n = rng.pick(opts)();
  if (n.length > 40) n = `${pre} ${noun}`;
  return n;
}

// World names when there's both a place and a setting.
export function comboWorldName(rng, place, setting, ctx) {
  const noun = rng.pick(place.nouns), sPre = rng.pick(setting.pre), pSuf = rng.pick(place.suf), sPlace = rng.pick(setting.place);
  const opts = [
    () => `The ${noun} ${titlePhrase(ctx.where, true)}`,
    () => `${rng.pick(setting.adj)} ${noun}`,
    () => (/^[A-Za-z]+$/.test(sPre) ? `${cap(sPre.toLowerCase())}${pSuf} ${sPlace}` : `${sPre} ${sPlace}`),
    () => `${rng.pick(place.pre)} ${sPlace}`,
    () => ctx.hero,
  ];
  let n = rng.pick(opts)();
  const words = n.toLowerCase().split(/[\s-]+/);
  if (n.length > 44 || new Set(words).size < words.length) n = ctx.hero || `${rng.pick(setting.adj)} ${noun}`;
  return n;
}

// World names for a place on its own: "Sudsville Laundromat", "The Diner on Elm Street".
export function placeWorldName(rng, place, ctx) {
  const noun = rng.pick(place.nouns), pre = rng.pick(place.pre), suf = rng.pick(place.suf);
  const street = `${rng.pick(['Elm', 'Maple', 'Station', 'High', 'Mill', 'Church', 'Bridge', 'Canal', 'Orchard', 'Market'])} ${rng.pick(['Street', 'Road', 'Lane', 'Avenue', 'Way'])}`;
  const opts = [
    () => (/^[A-Za-z]+$/.test(pre) ? `${cap(pre.toLowerCase())}${suf} ${noun}` : `${pre} ${noun}`),
    () => `The ${noun} on ${street}`,
    () => `${pre} ${noun}`,
    () => ctx.hero,
  ];
  if (ctx.key) opts.push(() => `The ${cap(ctx.key)} ${noun}`);
  let n = rng.pick(opts)();
  if (n.length > 44) n = ctx.hero;
  return n;
}

export const COMBO_TAILS = [
  'It is a perfectly ordinary {placeNoun}, apart from being {where}.',
  'Nobody remembers why there is a {placeNoun} {where}. Business is steady.',
  'It is the only {placeNoun} {where}, which the staff mention often.',
  'Opening a {placeNoun} {where} was described at the time as brave.',
  'Everything takes a little longer {where}, especially the {placeThing}.',
];
export const COMBO_LINES = [
  'We opened {where} because the rent was cheaper. It was not cheaper.',
  'Customers ask why there’s a {placeNoun} {where}. Customers ask too many questions.',
  'Everything takes longer {where}. Especially the {placeThing}.',
  'There is no other {placeNoun} {where}. We checked. Twice.',
  'Being {where} has been great for business. We have no business, but it’s been great.',
  'My mum said I’d never work {where}. Look at me now.',
  'The commute is fine. It’s mostly {where}.',
];

export const pickFilled = (rng, pool, ctx) => fill(rng.pick(pool), ctx, rng);
