// The shape Claude must return. Only types and enums live here; lengths and
// ranges are clamped afterwards by sanitizeRecipe(), so a slightly long sign
// never throws away a whole world.
import * as z from 'zod/v4';
import {
  SCATTER, LANDMARK_KINDS, SPECIES, HATS, SHAPES, GROUNDS, WATERS, TIMES, WEATHERS, MEDIUMS, AMBIENCES, CRITTER_VARIANTS,
} from '../src/kit/catalog.js';

const hex = z.string().describe('hex colour, e.g. #6fae4a');

export const WorldSchema = z.object({
  name: z.string().describe('the world’s invented place name, max 40 characters'),
  intro: z.string().describe('intro card: 2-3 short deadpan sentences, max 300 characters'),
  welcome: z.string().describe('text on the welcome sign at the spawn point, max 120 characters'),
  medium: z.enum(MEDIUMS),
  palette: z.object({
    sky: hex, horizon: hex, ground: hex, ground2: hex, rock: hex, water: hex, foliage: hex, accent: hex,
    glow: hex.describe('colour of lit windows, lamps and glowing things'),
  }),
  terrain: z.object({
    shape: z.enum(Object.keys(SHAPES)),
    height: z.number().describe('0 to 1, how tall the terrain is'),
    roughness: z.number().describe('0 to 1, small bumps'),
    ground: z.enum(GROUNDS),
    water: z.enum(WATERS),
    road: z.boolean().describe('a road runs past the spawn point (diners, gas stations, motels, suburbs...)'),
  }),
  sky: z.object({ time: z.enum(TIMES), weather: z.enum(WEATHERS), clouds: z.number().describe('0 to 1') }),
  ambience: z.array(z.enum(AMBIENCES)).describe('1-3 ambient sound beds'),
  scatter: z.array(z.object({
    prop: z.enum(Object.keys(SCATTER)),
    density: z.number().describe('0 to 1'),
    tint: z.string().describe('hex colour to recolour this prop, or "" to keep its default'),
  })).describe('5-9 props scattered around'),
  landmarks: z.array(z.object({
    kind: z.enum(Object.keys(LANDMARK_KINDS)),
    name: z.string().describe('invented name, max 40 characters'),
    sign: z.string().describe('deadpan sign text shown at it, max 120 characters'),
    scale: z.number().describe('0.7 to 1.5'),
    tint: z.string().describe('hex colour for its main material, or ""'),
  })).describe('3-5 points of interest'),
  locals: z.array(z.object({
    name: z.string().describe('invented name, max 30 characters'),
    role: z.string().describe('short job or title, max 40 characters'),
    species: z.enum(Object.keys(SPECIES)),
    variant: z.enum(CRITTER_VARIANTS).describe('only matters when species is critter'),
    color: hex, accent: hex,
    hat: z.enum(HATS),
    size: z.number().describe('0.7 to 1.4'),
    ruler: z.boolean().describe('true for at most one local, if the place has a ruler'),
    lines: z.array(z.string()).describe('exactly 3 lines they say when tapped, each max 110 characters'),
  })).describe('3-5 locals who wander about'),
});

export const LinesSchema = z.object({
  lines: z.array(z.string()).describe('exactly 3 new lines, each max 110 characters'),
});
