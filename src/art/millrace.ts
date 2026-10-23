// FLOOR 13, THE MILLRACE: its ground (art/terrain.ts paints it from the level's own tiles). ACT 2, THE HUSH.
// A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the planning chat's, with his yes as ideas), level 13, THE
// MILLRACE: "Out a side gate and along the river, following the night carts." Its layout "open like the Pinewood:
// fields left overgrown through the siege, the river with little bridges, a water wheel, and a paper mill"; its
// hazards "the mill race's fast water, and the turning wheel"; its palette "Gold fields, river blue, white sheets";
// its boss the Palimpsest, on the Pulping Floor. To this chat, of floors 11 to 15, his word of 18 Oct, 21:24 Pacific:
// “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for
// 11-15”. So it is made, and sent him, without waiting.
//
// WHAT IT IS: the river meadows outside the city's walls, late in the day, the light low and gold:
// - THE FLOOR is the fields, left to go wild through the siege: the corn gone over, gold, its stalks standing in
//   drifts and leaning, each with its lit ear; green weeds come up through it in patches; poppies (a dull brick red,
//   never the cult's pink), cornflowers and yarrow in drifts; where it was trodden or cut, gold stubble on bare
//   earth. THE CART TRACKS (where the level has them): two ruts of churned mud where the Order's night carts go,
//   grass down the middle. THE MILL YARD (where the level says): worn setts.
// - THE RIVER (where the level has it): river blue, slow, its ripples streaming along its flow, a line of light at
//   its banks; banks of mud and stones, reeds along them. Under a footbridge the water runs on.
// - THE MILL RACE (where the level has it): the channel cut from the river to the wheel, lined with dressed stone,
//   its water fast, white with it, chevrons of foam racing along it.
// - NO WALLS (as the Pinewood, his word for that floor: "The forest and the swamp don’t really have walls"): past the
//   fields the ground goes on at their height, rough pasture never cut, tall and dark, brambles in it, darker the
//   further out. (The hedges, trees, the mill and its wheel, the drying lines are pieces.)
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material; its own palette
// (Colour 1: gold, river blue, after the sewers' brick); a step quieter than the figures (Places 2) and duller than
// any word's colour (Colour 4: every colour through art/act2_quiet.ts); the dark cool and deep (Colour 2); nothing
// glows (Colour 3); solid, crisp pixels.
//
// FOR THE MAIN CHAT: `millraceLook(land)` makes the look for a level from what only the level knows: where its river,
// its mill race and its cart tracks run, and where its mill yard is (each optional).
//
// THE RIVERS FLOWING (art/flowing.ts, behind FLOW, off; the art chat, 23 Oct): with FLOW on, the river is painted as the race
// is, banked in the race's dressed stone, its water lively (foam streaks, standing waves in chevrons, white at its banks), and
// both run: `millraceFlow(land)` gives their water at each frame, for the game to lay over the ground. `land.riverAlong` and
// `land.raceAlong` (how far along each line, tiles, the way it runs: flowing.ts lineAlong) carry what moves along them, and
// `land.riverSide`, `land.raceSide` (which side of it and how far: lineSide) lay its streaks along it round its bends; without
// them it is reckoned on the picture (fine for a short straight water, broken up on a long one).

import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';
import { quietRGB, quietTerrain } from './act2_quiet';
import { FLOW, acrossOf, waterAt } from './flowing';
import type { FlowLayer, WaterStyle } from './flowing';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: gold corn, river blue, the green of weeds, a cool deep dark

/** THE CORN gone over, from the shade at its foot to its lit ears. */
export const MR_GOLD = ['#3a321f', '#544727', '#6f5d31', '#8a743c', '#a48b47', '#bea456', '#d6be73'].map(hex);
/** The green of the weeds come up through it, shade to lit. */
export const MR_WEED = ['#2c3624', '#3c4a2c', '#4e5f36', '#637444'].map(hex);
/** The wildflowers: poppies a dull brick red, cornflowers a dull blue, yarrow cream (never the cult's pink). */
export const MR_FLOWER = ['#9a3f2c', '#5d6c9c', '#ddd4b2'].map(hex);
/** Bare earth, the cart tracks' mud: shade to light. */
export const MR_EARTH = ['#3a2c22', '#523e2e', '#6c533c', '#866a4c', '#a08460'].map(hex);
/** THE RIVER: river blue, deep to the light on it. */
export const MR_WATER = ['#1c2a3e', '#24364e', '#2e4560', '#3c5674', '#587494', '#9cb0c6'].map(hex);
/** The race's foam. */
export const MR_FOAM = ['#8ea2b6', '#c2ccd4', '#e2e6e8'].map(hex);
/** Its banks: mud, river stones (shade, body, lit), reeds. */
export const MR_MUD = ['#2a2018', '#3b2d22', '#4f3d2e'].map(hex);
export const MR_STONE = ['#4a4844', '#6c6862', '#928d84', '#b0aa9e'].map(hex);
export const MR_REED = ['#4c5230', '#646c3c', '#80864e'].map(hex);
/** The mill yard's setts: shade, body, lit. */
export const MR_SETT = ['#3c3832', '#57524a', '#706a60', '#8a8478'].map(hex);
/** Brambles in the rough pasture, and their berries (a dull dark purple, never pink). */
export const MR_BRAMBLE = ['#262c1e', '#36402a', '#4a5636'].map(hex);
const BERRY: RGB = hex('#3a2638');
/** The deep, cool dark under everything (his rulebook's dark base). */
const DEEP: RGB = hex('#141822');

/** Above a threshold, with a checkered pixel or two where it is near it, so that one tone gives way to the next softly, still crisp. */
function over(t: number, thr: number, px: number, py: number, band = 0.018): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  const k = (t - thr + band) / (2 * band);
  return k > BAYER[py & 1][px & 1];
}
const BAYER = [
  [0.125, 0.625],
  [0.875, 0.375],
];

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

export interface MillLand {
  /** How far a place is from its river's middle, in tiles (Infinity where there is none). */
  river?: (x: number, y: number) => number;
  /** How far a place is from its mill race's middle, in tiles (Infinity where there is none). */
  race?: (x: number, y: number) => number;
  /** Which way the race runs at a place (toward the wheel), along the world's x and y; if not said, along its length one way or the other. */
  raceFlow?: (x: number, y: number) => [number, number];
  /** How far a place is from the middle of its nearest cart track, in tiles. */
  track?: (x: number, y: number) => number;
  /** Whether a place is in the mill yard (paved). */
  yard?: (x: number, y: number) => boolean;
  /** (art/flowing.ts, FLOW) How far along its river's line a place is (tiles, the way it runs), and along its race's (lineAlong). */
  riverAlong?: (x: number, y: number) => number;
  raceAlong?: (x: number, y: number) => number;
  /** (art/flowing.ts, FLOW) How far to the left (+) or right (−) of its river's line a place is (tiles), and of its race's (lineSide). */
  riverSide?: (x: number, y: number) => number;
  raceSide?: (x: number, y: number) => number;
}
/** The river's water reaches this far either side of its middle (tiles), its banks this much further; the race's water and its stone kerb. */
export const MR_RIVER_HALF = 0.62;
const BANK = 0.2;
export const MR_RACE_HALF = 0.34;
const KERB = 0.16;
/** A cart track: its two ruts this far either side of its middle (tiles), each this wide. */
const RUT = 0.22;
const RUT_HALF = 0.07;

// ---------------------------------------------------------------------------------------------------
// THE WATER

/** Which way water runs on the picture at (x, y) (a unit, along its banks), from how its distance changes, or as the level says. */
function flowOn(dist: (x: number, y: number) => number, x: number, y: number, said?: (x: number, y: number) => [number, number]): [number, number] {
  let ax: number;
  let ay: number;
  if (said) [ax, ay] = said(x, y);
  else {
    const e = 0.08;
    const gx = dist(x + e, y) - dist(x - e, y);
    const gy = dist(x, y + e) - dist(x, y - e);
    ax = -gy;
    ay = gx;
  }
  const sx = ax - ay;
  const sy = (ax + ay) / 2;
  const l = Math.hypot(sx, sy) || 1;
  return [sx / l, sy / l];
}
/** THE RIVER: river blue, deepest along its middle; ripples streaming along its flow; glints; a line of light at its banks. */
function river(land: MillLand, x: number, y: number, px: number, py: number, d: number): RGB {
  const deep = 1 - d / MR_RIVER_HALF;
  const t = fbm(x * 1.3, y * 1.3, 1331) * 0.6 + deep * 0.5;
  let tone = over(t, 0.62, px, py) ? 1 : over(t, 0.4, px, py) ? 2 : 3;
  if (d > MR_RIVER_HALF - 0.05) return MR_WATER[5];
  if (d > MR_RIVER_HALF - 0.11) tone = Math.max(3, tone);
  let c = MR_WATER[tone];
  const [fx, fy] = flowOn(land.river!, x, y);
  const across = Math.round(-fy * px + fx * py);
  const along = fx * px + fy * py;
  const row = mod(across + Math.round(3 * vnoise(along / 40, across / 6, 1333)), 6);
  const seg = vnoise(along / 9, Math.floor(across / 6), 1334);
  if (seg > 0.55) {
    if (row === 0) c = MR_WATER[Math.min(4, tone + 2)];
    else if (row === 1) c = MR_WATER[Math.max(0, tone - 1)];
  }
  if (hash(px >> 1, py, 1335) < 0.004) c = MR_WATER[5];
  return c;
}
/** THE RACE: fast water between stone kerbs, white with chevrons of foam racing along it toward the wheel. */
function race(land: MillLand, x: number, y: number, px: number, py: number, d: number): RGB {
  const [fx, fy] = flowOn(land.race!, x, y, land.raceFlow);
  const across = -fy * px + fx * py;
  const along = fx * px + fy * py;
  // (streaks of foam drawn out long along it; now and then a standing wave across it, a chevron pointing
  // downstream, broken; the water piled white against its kerbs)
  const deep = 1 - d / MR_RACE_HALF;
  let c = MR_WATER[deep > 0.5 ? 2 : 3];
  const streak = vnoise(along / 14, across / 2.2, 1341);
  if (streak > 0.7) c = MR_FOAM[streak > 0.8 ? 1 : 0];
  else if (streak < 0.22) c = MR_WATER[1];
  const wave = mod(along - (d / MR_RACE_HALF) * 6 + 9 * vnoise(along / 50, 0, 1343), 38);
  if (wave < 1.5 && vnoise(along / 5, across / 3, 1344) > 0.35) c = MR_FOAM[wave < 0.8 ? 2 : 1];
  if (d > MR_RACE_HALF - 0.06) c = MR_FOAM[hash(px >> 1, py, 1345) < 0.5 ? 1 : 0];
  return c;
}
// ---------------------------------------------------------------------------------------------------
// THE WATER FLOWING (FLOW on): the river in the race's look, both running

/** The river's dressed stone kerb (FLOW on), in place of its mud bank: this wide. */
const RIVER_KERB = 0.2;
/** THE RIVER, flowing: slower than the race, less of it foam; THE RACE, fast and white. */
export const MR_RIVER_FLOW: WaterStyle = { water: MR_WATER, foam: MR_FOAM, half: MR_RIVER_HALF, speed: 1.6, chevron: 2.4, foamy: 0.7, seed: 1500 };
export const MR_RACE_FLOW: WaterStyle = { water: MR_WATER, foam: MR_FOAM, half: MR_RACE_HALF, speed: 4, chevron: 1.5, foamy: 1, seed: 1520 };
/** How far along a line a place is: as the level says, or along the picture (32 picture pixels a tile). */
function alongOf(said: ((x: number, y: number) => number) | undefined, x: number, y: number, fx: number, fy: number, px: number, py: number): number {
  return said ? said(x, y) : (fx * px + fy * py) / 32;
}
function flowingRiver(land: MillLand, x: number, y: number, px: number, py: number, d: number, frame: number): RGB {
  const [fx, fy] = flowOn(land.river!, x, y);
  return waterAt(MR_RIVER_FLOW, alongOf(land.riverAlong, x, y, fx, fy, px, py), d, acrossOf(land.riverSide, x, y, fx, fy, px, py), x, y, px, py, frame);
}
function flowingRace(land: MillLand, x: number, y: number, px: number, py: number, d: number, frame: number): RGB {
  const [fx, fy] = flowOn(land.race!, x, y, land.raceFlow);
  return waterAt(MR_RACE_FLOW, alongOf(land.raceAlong, x, y, fx, fy, px, py), d, acrossOf(land.raceSide, x, y, fx, fy, px, py), x, y, px, py, frame);
}
/** THE RIVER'S KERB (FLOW on): the race's dressed stone, block by block along it, lit on top, its foot dark and wet. */
function riverKerb(land: MillLand, x: number, y: number, px: number, py: number, d: number): RGB {
  const k = (d - MR_RIVER_HALF) / RIVER_KERB;
  const [fx, fy] = flowOn(land.river!, x, y);
  const a = alongOf(land.riverAlong, x, y, fx, fy, px, py);
  if (k < 0.18) return MR_STONE[0];
  const blk = Math.floor(a * 2.6 + vnoise(x, y, 1351) * 0.3);
  if (mod(a * 2.6, 1) < 0.07) return MR_STONE[0];
  const t = hash(blk, Math.round(d * 4), 1356);
  const lit = k > 0.62;
  if (k > 0.94) return MR_STONE[1];
  return MR_STONE[lit ? (t < 0.5 ? 3 : 2) : t < 0.5 ? 2 : 1];
}

/** THE MILLRACE'S WATER, FLOWING (FLOW): its race and its river, at each frame, for the game to lay over the ground. */
export function millraceFlow(land: MillLand): FlowLayer {
  return {
    at: (x, y) => (!!land.race && land.race(x, y) < MR_RACE_HALF) || (!!land.river && land.river(x, y) < MR_RIVER_HALF),
    paint: (x, y, px, py, frame) => {
      if (land.race) {
        const d = land.race(x, y);
        if (d < MR_RACE_HALF) return quietRGB(flowingRace(land, x, y, px, py, d, frame));
      }
      return quietRGB(flowingRiver(land, x, y, px, py, land.river!(x, y), frame));
    },
  };
}

/** THE RACE'S KERB: dressed stone, block by block, lit on top. */
function kerb(x: number, y: number, px: number, py: number, d: number): RGB {
  const blk = Math.floor((x + y) * 3.2 + vnoise(x, y, 1351) * 0.3);
  const joint = mod((x + y) * 3.2, 1) < 0.08;
  const lit = d > MR_RACE_HALF + KERB * 0.6;
  if (joint) return MR_STONE[0];
  const t = hash(blk, 0, 1352);
  return MR_STONE[lit ? (t < 0.5 ? 2 : 1) : t < 0.5 ? 1 : 0];
}
/** ITS BANK: mud, river stones lit at their upper left, the water's line at its foot. */
function bank(x: number, y: number, px: number, py: number): RGB {
  const t = fbm(x * 2, y * 2, 1361);
  let c = MR_MUD[over(t, 0.6, px, py) ? 2 : over(t, 0.38, px, py) ? 1 : 0];
  const cy = Math.floor(py / 4);
  const cx = Math.floor((px + (cy % 2) * 3) / 7);
  if (hash(cx, cy, 1362) < 0.3) {
    const ax = cx * 7 - (cy % 2) * 3 + Math.floor(hash(cx, cy, 1363) * 4);
    const ay = cy * 4 + Math.floor(hash(cx, cy, 1365) * 2);
    const w = 2 + Math.floor(hash(cx, cy, 1364) * 2);
    if (py === ay && px >= ax && px < ax + w) c = MR_STONE[2];
    else if (py === ay + 1 && px >= ax && px < ax + w) c = MR_STONE[px === ax ? 1 : 0];
  }
  return c;
}
/** By the water: rank green grass and reeds standing in it. */
function riverside(x: number, y: number, px: number, py: number): RGB {
  const t = fbm(x * 1.6, y * 1.6, 1371);
  let c = MR_WEED[over(t, 0.55, px, py) ? 2 : 1];
  const cx = Math.floor(px / 3);
  const cy = Math.floor(py / 5);
  if (hash(cx, cy, 1372) < 0.45) {
    const ax = cx * 3 + Math.floor(hash(cx, cy, 1373) * 2);
    const ay = cy * 5 + Math.floor(hash(cx, cy, 1374) * 2);
    if (px === ax) {
      if (py === ay) c = MR_REED[2];
      else if (py === ay + 1 || py === ay + 2) c = MR_REED[1];
      else if (py === ay + 3) c = MR_WEED[0];
    }
  }
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE FIELDS

/**
 * A CLUMP OF CORN gone over, if (px, py) is in one: three to five stalks two pixels apart, three to five tall, leaning
 * with the drift as the wind laid them, each with its ear lit at the top; a line of shade at their foot; or nothing.
 * Thick where the corn stands, thin where it was trodden. (Cells in staggered rows, each clump anywhere in its cell.)
 */
function stalkAt(x: number, y: number, px: number, py: number, tone: number, much: number): RGB | null {
  const cy = Math.floor(py / 6);
  const sx = px + (cy % 2) * 4;
  const cx = Math.floor(sx / 8);
  if (hash(cx, cy, 1381) >= much) return null;
  const ax = cx * 8 - (cy % 2) * 4 + Math.floor(hash(cx, cy, 1382) * 3);
  const foot = cy * 6 + 4 + Math.floor(hash(cx, cy, 1383) * 2);
  const n = 3 + Math.floor(hash(cx, cy, 1384) * 3);
  const lean = vnoise(x * 0.45, y * 0.45, 1385) > 0.5 ? 1 : -1;
  const dy = foot - py;
  if (dy < 0) return null;
  if (dy === 0) return px >= ax - 1 && px <= ax + 2 * n - 1 ? MR_GOLD[Math.max(0, tone - 2)] : null;
  for (let k = 0; k < n; k++) {
    const tall = 3 + Math.floor(hash(cx * 5 + k, cy, 1386) * 3);
    if (dy > tall) continue;
    // (the top two pixels lean over)
    const bx = ax + 2 * k + (dy >= tall - 1 ? lean : 0);
    if (px !== bx) continue;
    if (dy === tall) return MR_GOLD[Math.min(6, tone + 2)];
    if (dy === tall - 1) return MR_GOLD[Math.min(6, tone + 1)];
    return MR_GOLD[tone];
  }
  return null;
}
/** A wildflower here, in drifts: a head of two pixels, a stem and shade under it; or nothing. Poppies, cornflowers, yarrow. */
function flowerAt(x: number, y: number, px: number, py: number): RGB | null {
  const drift = fbm(x * 0.55 + 9, y * 0.55, 1391);
  const want = drift > 0.62 ? 0.28 : drift > 0.52 ? 0.07 : 0.008;
  const cy = Math.floor(py / 5);
  const cx = Math.floor((px + (cy % 2) * 3) / 6);
  if (hash(cx, cy, 1392) >= want) return null;
  const ax = cx * 6 - (cy % 2) * 3 + Math.floor(hash(cx, cy, 1393) * 4);
  const ay = cy * 5 + Math.floor(hash(cx, cy, 1394) * 3);
  // (each drift mostly one kind: poppies in one, cornflowers in another)
  const kind = Math.floor(fbm(x * 0.9, y * 0.9, 1395) * 2.99 + hash(cx, cy, 1396) * 0.5) % 3;
  const big = hash(cx, cy, 1397) < 0.3;
  if (big && py === ay - 1 && px === ax) return MR_FLOWER[kind];
  if (py === ay && (px === ax || px === ax + 1 || (big && px === ax - 1))) return MR_FLOWER[kind];
  if (py === ay + 1 && px === ax) return MR_WEED[1];
  return null;
}
/** Gold stubble where the corn was cut or trodden flat: short stalks in rows on bare earth. */
function stubble(x: number, y: number, px: number, py: number): RGB {
  const t = fbm(x * 1.8, y * 1.8, 1401);
  let c = MR_EARTH[over(t, 0.55, px, py) ? 2 : 1];
  const r = mod(px + py * 2, 5);
  if (r === 0 && hash(px >> 1, py, 1402) < 0.6) c = MR_GOLD[hash(px, py >> 1, 1403) < 0.5 ? 5 : 4];
  else if (r === 1 && hash(px >> 1, py, 1402) < 0.4) c = MR_GOLD[2];
  return c;
}

function fieldsOf(land: MillLand) {
  return (x: number, y: number, px: number, py: number, inside: number): RGB => {
    // the water, under a footbridge, and its banks
    if (land.race) {
      const d = land.race(x, y);
      if (d < MR_RACE_HALF) return FLOW.on ? flowingRace(land, x, y, px, py, d, 0) : race(land, x, y, px, py, d);
      if (d < MR_RACE_HALF + KERB) return kerb(x, y, px, py, d);
    }
    if (land.river) {
      const d = land.river(x, y);
      if (d < MR_RIVER_HALF) return FLOW.on ? flowingRiver(land, x, y, px, py, d, 0) : river(land, x, y, px, py, d);
      if (FLOW.on && d < MR_RIVER_HALF + RIVER_KERB) return riverKerb(land, x, y, px, py, d);
      if (d < MR_RIVER_HALF + BANK) return bank(x, y, px, py);
      if (d < MR_RIVER_HALF + BANK + 0.25) return riverside(x, y, px, py);
    }
    // the mill yard: worn setts, in courses, grass in the joints at its edges
    if (land.yard && land.yard(x, y)) {
      // (worn through to the earth in places, the setts sunk and uneven, weeds in the joints)
      const worn = fbm(x * 1.3, y * 1.3, 1410);
      if (over(worn, 0.68, px, py)) return over(fbm(x * 4, y * 4, 1415), 0.5, px, py) ? MR_EARTH[2] : MR_EARTH[1];
      const row = Math.floor(py / 3);
      const off = (row % 2) * 3 + Math.floor(hash(row, 0, 1416) * 2);
      const col = Math.floor((px + off) / 5);
      const jx = mod(px + off, 5) === 0;
      const jy = mod(py, 3) === 0;
      if (jx || jy) return hash(col, row, 1411) < 0.3 ? MR_WEED[1] : MR_SETT[0];
      const t = hash(col, row, 1412);
      const top = mod(py, 3) === 1 && mod(px + off, 5) < 3;
      return MR_SETT[top ? (t < 0.5 ? 3 : 2) : t < 0.35 ? 1 : 2];
    }
    // the corn's own tone, in slow patches, a little darker toward the rough
    const shade = 1 - cl(inside * 1.6, 0, 1);
    const t = fbm(x * 0.42, y * 0.42, 1421) - 0.25 * shade;
    const tone = over(t, 0.6, px, py) ? 4 : over(t, 0.36, px, py) ? 3 : 2;
    let c = MR_GOLD[tone];
    // the cart tracks: two ruts of churned mud, puddles in them, grass down the middle
    const td = land.track ? land.track(x, y) : Infinity;
    if (td < RUT + RUT_HALF + 0.12) {
      const r = Math.abs(td - RUT);
      if (r < RUT_HALF || (r < RUT_HALF + 0.05 && over(1 - (r - RUT_HALF) / 0.05, 0.5, px, py, 0.3))) {
        const e = fbm(x * 2.4, y * 2.4, 1431);
        c = MR_EARTH[over(e, 0.6, px, py) ? 2 : over(e, 0.4, px, py) ? 1 : 0];
        if (vnoise(x * 1.5, y * 1.5, 1432) > 0.72) c = MR_WATER[over(e, 0.5, px, py) ? 3 : 2];
        return c;
      }
      // (between and beside the ruts the corn is trodden: stubble and weeds)
      return over(fbm(x * 3, y * 3, 1433), 0.5, px, py) ? stubble(x, y, px, py) : MR_WEED[2];
    }
    // trodden or cut patches: stubble
    const cut = fbm(x * 0.7 + 4, y * 0.7, 1441);
    if (over(cut, 0.8, px, py)) return stubble(x, y, px, py);
    // weeds come up through it here and there, in small clumps
    const weed = fbm(x * 1.6 + 2, y * 1.6, 1443);
    if (over(weed, 0.74, px, py)) {
      c = MR_WEED[over(fbm(x * 3, y * 3, 1444), 0.5, px, py) ? 2 : 1];
      const st = stalkAt(x, y, px, py, 2, 0.12);
      return st ?? c;
    }
    const fl = flowerAt(x, y, px, py);
    if (fl) return fl;
    // (between the clumps, the shade among the stalks)
    c = MR_GOLD[Math.max(1, tone - 1)];
    const st = stalkAt(x, y, px, py, tone, 0.6 + 0.3 * fbm(x * 1.1, y * 1.1, 1445));
    if (st) c = st;
    if (shade > 0.5) c = mixc(c, DEEP, 0.1 * (shade - 0.5));
    return c;
  };
}

// ---------------------------------------------------------------------------------------------------
// THE ROUGH, past the fields at the same height (no walls)

/** A bramble here: a dark tangle of arching canes, lit along their tops, a berry or two; or nothing. */
function brambleAt(x: number, y: number, px: number, py: number): RGB | null {
  const grow = fbm(x * 0.8 + 3, y * 0.8, 1451);
  const cy = Math.floor(py / 8);
  const cx = Math.floor((px + (cy % 2) * 7) / 14);
  if (hash(cx, cy, 1452) >= (grow > 0.5 ? 0.7 : 0.1)) return null;
  const ax = cx * 14 - (cy % 2) * 7 + 3 + Math.floor(hash(cx, cy, 1453) * 6);
  const ay = cy * 8 + 1 + Math.floor(hash(cx, cy, 1454) * 3);
  const w = 4 + Math.floor(hash(cx, cy, 1455) * 3);
  const dx = px - ax;
  const dy = py - ay;
  const a = Math.abs(dx);
  if (a > w || dy < 0 || dy > 5) return null;
  // (a mound of canes: its outline a low arch, lit on top, dark within; berries)
  const top = Math.round(2 * (a / w) * (a / w));
  if (dy < top) return null;
  if (dy === top) return MR_BRAMBLE[2];
  if (hash(px, py, 1456) < 0.05) return BERRY;
  return dy >= 4 ? MR_BRAMBLE[0] : MR_BRAMBLE[1];
}
function roughOf(land: MillLand) {
  return (x: number, y: number, px: number, py: number, back: number): RGB => {
    if (land.race) {
      const d = land.race(x, y);
      if (d < MR_RACE_HALF) return FLOW.on ? flowingRace(land, x, y, px, py, d, 0) : race(land, x, y, px, py, d);
      if (d < MR_RACE_HALF + KERB) return kerb(x, y, px, py, d);
    }
    if (land.river) {
      const d = land.river(x, y);
      if (d < MR_RIVER_HALF) return FLOW.on ? flowingRiver(land, x, y, px, py, d, 0) : river(land, x, y, px, py, d);
      if (FLOW.on && d < MR_RIVER_HALF + RIVER_KERB) return riverKerb(land, x, y, px, py, d);
      if (d < MR_RIVER_HALF + BANK) return bank(x, y, px, py);
      if (d < MR_RIVER_HALF + BANK + 0.6) return riverside(x, y, px, py);
    }
    // at the field's edge, the corn gives way to the rough in a ragged fringe of long grass
    const t = fbm(x * 0.6, y * 0.6, 1461) - 0.3 * back;
    const tone = over(t, 0.55, px, py) ? 3 : over(t, 0.36, px, py) ? 2 : 1;
    let c = MR_WEED[tone];
    // tall grass, its seed heads gold, thick
    const st = stalkAt(x, y, px, py, 2 + (tone > 2 ? 1 : 0), 0.5);
    if (st) c = mixc(st, MR_WEED[tone], 0.45);
    const br = brambleAt(x, y, px, py);
    if (br) c = br;
    c = mixc(c, DEEP, 0.05 + 0.22 * back);
    return c;
  };
}

/** THE MILLRACE'S GROUND, for a level's own river, race, tracks and yard. */
export function millraceLook(land: MillLand = {}): TerrainLook {
  const rough = roughOf(land);
  return quietTerrain({
    // no walls: the rough goes on at the fields' height; its hedges and trees are pieces
    rise: 0,
    near: 0,
    round: 0.5,
    rag: 0.36,
    fine: 0.07,
    seed: 131,
    floor: fieldsOf(land),
    // (no faces at the fields' height: these are never asked for, but a look has them)
    face: (_s, _v, px, py, x, y) => rough(x, y, px, py, 0),
    top: (x, y, px, py, back) => rough(x, y, px, py, back),
    nearFace: (_v, px, py, x, y) => rough(x, y, px, py, 0),
    brow: (c) => c,
    foot: [0, 0],
  });
}
