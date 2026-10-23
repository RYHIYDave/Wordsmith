// FLOOR 9, THE PINEWOOD: its ground (art/terrain.ts paints it from the level's own tiles).
//
// The owner, 13 Oct 2026, to the planning chat: 08:19, “I’d like the forest to be very open.  Really big open
// areas that cross the river on little bridges”; shown its picture in the game's own frame (previews/
// pine_in_game.png; src/dev/preview_act1.ts, hash `pine`, on mockup/act1-levels) and asked “Is this the
// Pinewood?”, by 08:23: “Yes, this is it (Recommended)”, offered as: big open meadows, the river with little
// bridges, groves, twisted trees toward the swamp. And on 12 Oct, 18:56: “The forest and the swamp don’t really
// have walls”. That picture is the measure for this one; the art chat began it on his word of 15 Oct, by 10:28:
// “Yes, floor 9 go (Recommended)”.
//
// WHAT IT IS: an old pine forest on the mountain's lower slopes, between the canyon and the swamp:
// - THE FLOOR is the meadows: grass in slow patches of tone, its blades lit at their tips, clumps of it in
//   tufts; wildflowers scattered, in drifts here and there; bare earth worn through; the trails (where the
//   level has them) of packed earth; toward the wood's edge the grass darker in its shade, strewn with fallen
//   needles and cones.
// - NO WALLS (his word): past the meadows the ground goes on at the same height, the forest floor: a deep
//   litter of brown needles, moss in patches, ferns, fallen twigs; darker the further under the trees. (The
//   trees, the cabin, the bridges are pieces, laid as the game lays them.)
// - THE RIVER, out of the canyon (where the level has it): dark slate water, its ripples streaming along its
//   flow, a line of light where it meets its banks; banks of wet mud and stones, reeds along them; the grass
//   by the water lush. Under a footbridge (walkable) the water runs on, painted under the bridge.
// - THE SWAMP'S SICKNESS creeping in from the east (where the level says): the grass drained grey, violet veins
//   through the ground.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material; a palette
// of its own (Colour 1: the pine greens and needle browns, after the canyon's red rock), a step quieter than
// the figures (Places 2) and duller than any word's colour (Colour 4: every colour here under the dullest
// word's saturation); the shadows fall into a deep, cool dark (Colour 2); nothing glows, nothing cyan or pink
// (Colour 3; the water is slate, its hue clear of cyan; the sickness's violet dull); crisp pixels, no smoothing.
//
// FOR THE MAIN CHAT: `pinewoodLook(land)` makes the look for a level, from what only the level knows: where
// its river runs, where its trails run, and how far the swamp's sickness has crept (each optional).
//
// THE RIVER FLOWING (art/flowing.ts, behind FLOW, off; the art chat, 23 Oct): with FLOW on, the river is painted in the mill
// race's look in the Pinewood's own stone and water: banked with mossy river boulders, its slate water lively (foam streaks,
// standing waves in chevrons, white at its banks), and running: `pinewoodFlow(land)` gives its water at each frame, for the
// game to lay over the ground. `land.riverAlong` (how far along the river's line, tiles, the way it runs: flowing.ts lineAlong)
// carries what moves, and `land.riverSide` (which side of it and how far: lineSide) lays its streaks along it round its bends.

import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';
import { FLOW, acrossOf, waterAt } from './flowing';
import type { FlowLayer, WaterStyle } from './flowing';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

/** THE MEADOW'S GRASS, from its deepest shade to its sunlit tips. */
export const C_GRASS = ['#2e3c24', '#40502c', '#536638', '#677a43', '#7c8e4e', '#94a45c', '#b0ba78'].map(hex);
/** The wildflowers: cream, a dull gold, a dull lilac (never the cult's pink). */
export const C_FLOWER = ['#e2dcb8', '#cfc27e', '#a294b0'].map(hex);
/** BARE EARTH and the trails: shade to light. */
export const C_EARTH = ['#44342a', '#5e4834', '#7a5e44', '#927656', '#ac926c'].map(hex);
/** THE FOREST FLOOR'S NEEDLES: shade to light. */
export const C_NEEDLE = ['#2a2017', '#3e3022', '#56432f', '#70583e', '#8c704d'].map(hex);
/** Moss and ferns on it. */
export const C_MOSS = ['#2a3424', '#3a4a2e', '#4e6238'].map(hex);
export const C_FERN = ['#2c3e26', '#415a32', '#58723e'].map(hex);
/** THE RIVER: dark slate water to the light on it. */
export const C_WATER = ['#26303e', '#2f3b4c', '#3a485c', '#4a5a70', '#6c7e96', '#a4b0c0'].map(hex);
/** Its banks: wet mud, river stones (shade, body, lit top), reeds. */
export const C_MUD = ['#241c18', '#35291f', '#4a3a2c'].map(hex);
export const C_STONE = ['#4c4a48', '#6e6a64', '#94908a'].map(hex);
export const C_REED = ['#4a5232', '#626a3e', '#7e8450'].map(hex);
/** THE SWAMP'S SICKNESS: the drained grass it leaves, and the dull violet of its veins. */
export const C_SICK = ['#3a3a34', '#4e4c44', '#66625a'].map(hex);
export const C_VEIN = ['#3e2c4a', '#5a4266', '#76608a'].map(hex);
/** The deep, cool dark under everything (his rulebook's dark base). */
const DEEP: RGB = hex('#121620');

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

/** What only the level knows of its Pinewood (each optional). */
export interface PineLand {
  /** How far a place is from its river's middle, in tiles (Infinity where there is no river). */
  river?: (x: number, y: number) => number;
  /** How far a place is from the middle of its nearest trail, in tiles. */
  trail?: (x: number, y: number) => number;
  /** How sick the ground is with the swamp's violet: 0 none, 1 the most (toward the swamp, east). */
  sick?: (x: number, y: number) => number;
  /** (art/flowing.ts, FLOW) How far along its river's line a place is (tiles, the way it runs: lineAlong), and how far to its left (+) or right (−) (tiles: lineSide). */
  riverAlong?: (x: number, y: number) => number;
  riverSide?: (x: number, y: number) => number;
}
/** The river's water reaches this far either side of its middle (tiles); its banks this much further. */
export const RIVER_HALF = 0.55;
const BANK = 0.2;

// ---------------------------------------------------------------------------------------------------
// THE SWAMP'S SICKNESS: veins of dull violet through the ground, the edges of a scattered grid's cells

function veinAt(x: number, y: number, sick: number): boolean {
  if (sick < 0.25) return false;
  const S = 0.9;
  const gx = x / S;
  const gy = y / S;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let d1 = 9;
  let d2 = 9;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = ix + i + 0.15 + 0.7 * hash(ix + i, iy + j, 1021);
      const cy = iy + j + 0.15 + 0.7 * hash(ix + i, iy + j, 1022);
      const d = Math.hypot(gx - cx, gy - cy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) d2 = d;
    }
  }
  // thicker and more of them the sicker the ground
  return d2 - d1 < 0.015 + 0.03 * sick && vnoise(x * 0.8, y * 0.8, 1023) < 0.1 + 0.55 * sick && vnoise(x * 2.6, y * 2.6, 1024) > 0.3;
}
/** The ground's own colour drained by the sickness, and its veins. */
function sicken(c: RGB, x: number, y: number, px: number, py: number, sick: number): RGB {
  if (sick <= 0) return c;
  if (veinAt(x, y, sick)) return C_VEIN[over(fbm(x * 3, y * 3, 1025), 0.55, px, py) ? 2 : 1];
  const lum = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const grey = lum < 60 ? C_SICK[0] : lum < 95 ? C_SICK[1] : C_SICK[2];
  return mixc(c, grey, 0.75 * sick);
}

// ---------------------------------------------------------------------------------------------------
// THE RIVER

/** Which way the river flows on the picture at (x, y) (a unit, along its banks), from how its distance changes. */
function flowOn(land: PineLand, x: number, y: number): [number, number] {
  const r = land.river!;
  const e = 0.08;
  const gx = r(x + e, y) - r(x - e, y);
  const gy = r(x, y + e) - r(x, y - e);
  // across the river in the world is (gx, gy); along it, square to that; on the picture (x - y, (x + y) / 2)
  const ax = -gy;
  const ay = gx;
  const sx = ax - ay;
  const sy = (ax + ay) / 2;
  const l = Math.hypot(sx, sy) || 1;
  return [sx / l, sy / l];
}
/** THE WATER: dark slate, deepest along its middle; ripples streaming along its flow; glints; a line of light where it meets its banks. */
function water(land: PineLand, x: number, y: number, px: number, py: number, d: number): RGB {
  const deep = 1 - d / RIVER_HALF;
  const t = fbm(x * 1.4, y * 1.4, 1031) * 0.6 + deep * 0.5;
  let tone = over(t, 0.62, px, py) ? 1 : over(t, 0.4, px, py) ? 2 : 3;
  if (d > RIVER_HALF - 0.05) return C_WATER[5];
  if (d > RIVER_HALF - 0.11) tone = Math.max(3, tone);
  let c = C_WATER[tone];
  // ripples: short streaks along the flow, lit over a pixel of shade, broken by slow noise
  const [fx, fy] = flowOn(land, x, y);
  const across = Math.round(-fy * px + fx * py);
  const along = fx * px + fy * py;
  const row = mod(across + Math.round(3 * vnoise(along / 40, across / 6, 1033)), 6);
  const seg = vnoise(along / 9, Math.floor(across / 6), 1034);
  if (seg > 0.55) {
    if (row === 0) c = C_WATER[Math.min(4, tone + 2)];
    else if (row === 1) c = C_WATER[Math.max(0, tone - 1)];
  }
  // glints of the sky
  if (hash(px >> 1, py, 1035) < 0.004) c = C_WATER[5];
  return c;
}
// ---------------------------------------------------------------------------------------------------
// THE RIVER FLOWING (FLOW on): in the mill race's look, in the Pinewood's own stone and water

/** The river's foam, slate going white (its hue clear of cyan). */
export const C_FOAM = ['#8a94a2', '#b6bec8', '#dadee2'].map(hex);
/** Its boulders' moss caps. */
const BOULDERS = 0.24;
/** THE RIVER, flowing: a mountain stream come down out of the canyon, quick and broken white. */
export const C_RIVER_FLOW: WaterStyle = { water: C_WATER, foam: C_FOAM, half: RIVER_HALF, speed: 2, chevron: 1.5, foamy: 0.8, seed: 1600 };
function flowingWater(land: PineLand, x: number, y: number, px: number, py: number, d: number, frame: number): RGB {
  const [fx, fy] = flowOn(land, x, y);
  const s = land.riverAlong ? land.riverAlong(x, y) : (fx * px + fy * py) / 32;
  return waterAt(C_RIVER_FLOW, s, d, acrossOf(land.riverSide, x, y, fx, fy, px, py), x, y, px, py, frame);
}
/** ITS BANKS OF BOULDERS (FLOW on): rounded river stones packed along it, lit at their upper left, moss on their tops, dark wet gaps between. */
function boulders(x: number, y: number, px: number, py: number, d: number): RGB {
  const k = (d - RIVER_HALF) / BOULDERS;
  // (each stone a cell round a point scattered over the world, a fifth of a tile apart)
  const S = 0.19;
  const gx = x / S;
  const gy = y / S;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let d1 = 9;
  let d2 = 9;
  let cx = 0;
  let cy = 0;
  let id = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const qx = ix + i + 0.15 + 0.7 * hash(ix + i, iy + j, 1061);
      const qy = iy + j + 0.15 + 0.7 * hash(ix + i, iy + j, 1062);
      const dd = Math.hypot(gx - qx, gy - qy);
      if (dd < d1) {
        d2 = d1;
        d1 = dd;
        cx = qx;
        cy = qy;
        id = (ix + i) * 7919 + (iy + j);
      } else if (dd < d2) d2 = dd;
    }
  }
  // the dark wet gaps between them, darker nearer the water
  if (d2 - d1 < 0.16) return k < 0.35 ? C_MUD[0] : C_MUD[1];
  // where on the stone, on the picture: lit at its upper left, shaded at its lower right
  const wx = gx - cx;
  const wy = gy - cy;
  const ox = (wx - wy) * S * 32;
  const oy = (wx + wy) * S * 16;
  const lit = -ox * 0.5 - oy;
  if (oy < -1.2 && hash(id, 0, 1063) < 0.5 && k > 0.3) return C_MOSS[over(fbm(x * 3, y * 3, 1064), 0.5, px, py) ? 2 : 1];
  let c = lit > 1.4 ? C_STONE[2] : lit < -1.4 ? C_STONE[0] : C_STONE[1];
  // (the stones nearest the water wet and dark)
  if (k < 0.3) c = mixc(c, C_WATER[1], 0.4);
  return c;
}

/** THE PINEWOOD'S RIVER, FLOWING (FLOW): its water at each frame, for the game to lay over the ground. */
export function pinewoodFlow(land: PineLand): FlowLayer {
  return {
    at: (x, y) => !!land.river && land.river(x, y) < RIVER_HALF,
    paint: (x, y, px, py, frame) => flowingWater(land, x, y, px, py, land.river!(x, y), frame),
  };
}

/** ITS BANK: wet mud, river stones lit at their upper left, the water's line of light at its foot. */
function bank(x: number, y: number, px: number, py: number): RGB {
  const t = fbm(x * 2, y * 2, 1041);
  let c = C_MUD[over(t, 0.6, px, py) ? 2 : over(t, 0.38, px, py) ? 1 : 0];
  const cy = Math.floor(py / 4);
  const cx = Math.floor((px + (cy % 2) * 3) / 7);
  if (hash(cx, cy, 1042) < 0.3) {
    const ax = cx * 7 - (cy % 2) * 3 + Math.floor(hash(cx, cy, 1043) * 4);
    const ay = cy * 4 + Math.floor(hash(cx, cy, 1045) * 2);
    const w = 2 + Math.floor(hash(cx, cy, 1044) * 2);
    if (py === ay && px >= ax && px < ax + w) c = C_STONE[2];
    else if (py === ay + 1 && px >= ax && px < ax + w) c = C_STONE[px === ax ? 1 : 0];
  }
  return c;
}
/** By the water: lush dark grass and reeds standing in it. */
function riverside(x: number, y: number, px: number, py: number): RGB {
  const t = fbm(x * 1.6, y * 1.6, 1051);
  let c = C_GRASS[over(t, 0.55, px, py) ? 3 : 2];
  // reeds: thin stalks two or three pixels tall, a lit tip, a dark foot
  const cx = Math.floor(px / 3);
  const cy = Math.floor(py / 5);
  if (hash(cx, cy, 1052) < 0.45) {
    const ax = cx * 3 + Math.floor(hash(cx, cy, 1053) * 2);
    const ay = cy * 5 + Math.floor(hash(cx, cy, 1054) * 2);
    if (px === ax) {
      if (py === ay) c = C_REED[2];
      else if (py === ay + 1 || py === ay + 2) c = C_REED[1];
      else if (py === ay + 3) c = C_GRASS[0];
    }
  }
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE FLOOR: the meadows

/** A tuft of grass, if (px, py) is within one: three to five blades, their tips lit over a body, its shadow under. */
function tuftAt(px: number, py: number, tone: number, tufts: number): { inside: boolean; c: RGB | null } {
  const ty = Math.floor(py / 7);
  const sx = px + (ty % 2) * 5;
  const tx = Math.floor(sx / 10);
  if (hash(tx, ty, 1061) >= tufts) return { inside: false, c: null };
  const ax = tx * 10 + Math.floor(hash(tx, ty, 1062) * 5) - (ty % 2) * 5;
  const ay = ty * 7 + Math.floor(hash(tx, ty, 1067) * 3);
  const n = 3 + Math.floor(hash(tx, ty, 1063) * 3);
  const dx = px - ax;
  const dy = py - ay;
  if (dx < 0 || dx >= 2 * n - 1 || dy < 0 || dy > 3) return { inside: false, c: null };
  // each blade a pixel wide, every other pixel across, their heights uneven
  const blade = dx % 2 === 0;
  const h = blade ? 1 + Math.floor(hash(tx * 7 + dx, ty, 1064) * 2) : 0;
  const top = 2 - h;
  if (blade && dy === top) return { inside: true, c: C_GRASS[Math.min(6, tone + 2)] };
  if (blade && dy > top && dy < 3) return { inside: true, c: C_GRASS[Math.min(6, tone + 1)] };
  if (dy === 3) return { inside: true, c: C_GRASS[Math.max(0, tone - 1)] };
  return { inside: true, c: null };
}
/** A blade or a tuft of grass here, lit at its tip, its shadow under it; or nothing. (Cells in staggered rows, each mark set anywhere in its cell, so that no grid shows.) Exported for the tests. */
export function grassMark(px: number, py: number, tone: number, tufts: number): RGB | null {
  const tuft = tuftAt(px, py, tone, tufts);
  if (tuft.inside) return tuft.c;
  // blades: a lit tip over a pixel of shade, scattered thick (never into a tuft)
  const r = Math.floor(py / 2);
  if (hash(px, r, 1065) < 0.16 && !tuftAt(px, 2 * r, tone, tufts).inside && !tuftAt(px, 2 * r + 1, tone, tufts).inside) {
    if (py === r * 2) return C_GRASS[Math.min(6, tone + 1)];
    return C_GRASS[Math.max(0, tone - 1)];
  }
  return null;
}
/** A wildflower here: a head two pixels across (a bigger one now and then), a pixel of stem and shade under it; or nothing. */
function flowerAt(x: number, y: number, px: number, py: number): RGB | null {
  const drift = fbm(x * 0.6 + 9, y * 0.6, 1071);
  const want = drift > 0.6 ? 0.3 : drift > 0.5 ? 0.08 : 0.01;
  const cy = Math.floor(py / 5);
  const cx = Math.floor((px + (cy % 2) * 3) / 6);
  if (hash(cx, cy, 1072) >= want) return null;
  const ax = cx * 6 - (cy % 2) * 3 + Math.floor(hash(cx, cy, 1073) * 4);
  const ay = cy * 5 + Math.floor(hash(cx, cy, 1074) * 3);
  const kind = Math.floor(fbm(x * 1.1, y * 1.1, 1075) * 2.99 + hash(cx, cy, 1076) * 0.7) % 3;
  const big = hash(cx, cy, 1077) < 0.25;
  if (big && py === ay - 1 && px === ax) return C_FLOWER[kind];
  if (py === ay && (px === ax || px === ax + 1 || (big && px === ax - 1))) return C_FLOWER[kind];
  if (py === ay + 1 && px === ax) return C_GRASS[1];
  return null;
}
/** Fallen needles and cones strewn over the grass toward the wood: dashes two pixels long; or nothing. */
function strewn(px: number, py: number, much: number): RGB | null {
  const cx = Math.floor(px / 5);
  const cy = Math.floor(py / 3);
  if (hash(cx, cy, 1081) >= much) return null;
  const ax = cx * 5 + Math.floor(hash(cx, cy, 1082) * 3);
  const ay = cy * 3 + 1;
  const cone = hash(cx, cy, 1083) < 0.08;
  if (cone) {
    if (py === ay && (px === ax || px === ax + 1)) return px === ax ? C_NEEDLE[4] : C_NEEDLE[3];
    if (py === ay + 1 && (px === ax || px === ax + 1)) return C_NEEDLE[1];
    return null;
  }
  if (py === ay && (px === ax || px === ax + 1)) return C_NEEDLE[hash(cx, cy, 1084) < 0.5 ? 3 : 4];
  return null;
}

function meadowOf(land: PineLand) {
  return (x: number, y: number, px: number, py: number, inside: number): RGB => {
    const sick = land.sick ? cl(land.sick(x, y), 0, 1) : 0;
    // the river, under a footbridge, and its banks
    if (land.river) {
      const d = land.river(x, y);
      if (d < RIVER_HALF) return FLOW.on ? flowingWater(land, x, y, px, py, d, 0) : water(land, x, y, px, py, d);
      if (FLOW.on && d < RIVER_HALF + BOULDERS) return sicken(boulders(x, y, px, py, d), x, y, px, py, sick);
      if (d < RIVER_HALF + BANK) return sicken(bank(x, y, px, py), x, y, px, py, sick);
      if (d < RIVER_HALF + BANK + 0.25) return sicken(riverside(x, y, px, py), x, y, px, py, sick);
    }
    // the grass's own tone, in slow patches, darker in the wood's shade toward its edge
    const shade = 1 - cl(inside * 1.6, 0, 1);
    const t = fbm(x * 0.45, y * 0.45, 1091) - 0.3 * shade;
    const tone = over(t, 0.58, px, py) ? 5 : over(t, 0.4, px, py) ? 4 : over(t, 0.26, px, py) ? 3 : 2;
    let c = C_GRASS[tone];
    // the trails, of packed earth, their edges ragged with grass
    const tw = 0.24 + 0.08 * vnoise(x * 2, y * 2, 1093);
    const td = land.trail ? land.trail(x, y) : Infinity;
    const bare = fbm(x * 0.8 + 4, y * 0.8, 1095);
    if (td < tw || (td < tw + 0.12 && over(1 - (td - tw) / 0.12, 0.5, px, py, 0.3)) || over(bare, 0.78, px, py)) {
      const e = fbm(x * 2.2, y * 2.2, 1097);
      const et = over(e, 0.62, px, py) ? 3 : over(e, 0.38, px, py) ? 2 : 1;
      c = C_EARTH[et];
      // pebbles and ruts: a lit pixel over a shaded one
      const cx = Math.floor(px / 7);
      const cy = Math.floor(py / 4);
      if (hash(cx, cy, 1098) < 0.12) {
        const ax = cx * 7 + 1 + Math.floor(hash(cx, cy, 1099) * 4);
        const ay = cy * 4 + 1;
        if (py === ay && (px === ax || px === ax + 1)) c = C_EARTH[4];
        else if (py === ay + 1 && (px === ax || px === ax + 1)) c = C_EARTH[0];
      }
      // a few blades of grass come through
      if (hash(px >> 1, py >> 1, 1100) < 0.04 && td > tw * 0.5) c = C_GRASS[3];
      return sicken(c, x, y, px, py, sick);
    }
    const mark = grassMark(px, py, tone, 0.12 + 0.25 * fbm(x * 1.2, y * 1.2, 1101));
    if (mark) c = mark;
    const fl = shade < 0.4 ? flowerAt(x, y, px, py) : null;
    if (fl) c = fl;
    const st = strewn(px, py, shade * 0.55);
    if (st) c = st;
    if (shade > 0.5) c = mixc(c, DEEP, 0.12 * (shade - 0.5));
    return sicken(c, x, y, px, py, sick);
  };
}

// ---------------------------------------------------------------------------------------------------
// THE FOREST FLOOR, past the meadows at the same height (no walls)

/** A fern here: a fan of fronds arching out from its heart, lit along their tops, a dark heart; or nothing. */
function fernAt(x: number, y: number, px: number, py: number): RGB | null {
  const grow = fbm(x * 0.9 + 3, y * 0.9, 1111);
  const cy = Math.floor(py / 9);
  const cx = Math.floor((px + (cy % 2) * 7) / 14);
  if (hash(cx, cy, 1112) >= (grow > 0.52 ? 0.6 : 0.06)) return null;
  const ax = cx * 14 - (cy % 2) * 7 + 4 + Math.floor(hash(cx, cy, 1113) * 6);
  const ay = cy * 9 + 1 + Math.floor(hash(cx, cy, 1114) * 3);
  const w = 3 + Math.floor(hash(cx, cy, 1115) * 3);
  const dx = px - ax;
  const dy = py - ay;
  const a = Math.abs(dx);
  if (a > w + 1 || dy < 0 || dy > 4) return null;
  // each frond: rising from the heart and arching down at its tip
  const arch = a <= 1 ? 1 : a >= w ? 2 + (a - w) : 0;
  if (dy === arch && a > 0) return C_FERN[2];
  if (dy === arch + 1 && a > 0 && a <= w) return C_FERN[1];
  if (dy >= 2 && dy <= 3 && a <= 1) return C_FERN[0];
  return null;
}

function forestFloorOf(land: PineLand) {
  return (x: number, y: number, px: number, py: number, back: number): RGB => {
    const sick = land.sick ? cl(land.sick(x, y), 0, 1) : 0;
    if (land.river) {
      const d = land.river(x, y);
      if (d < RIVER_HALF) return FLOW.on ? flowingWater(land, x, y, px, py, d, 0) : water(land, x, y, px, py, d);
      if (FLOW.on && d < RIVER_HALF + BOULDERS) return sicken(boulders(x, y, px, py, d), x, y, px, py, sick);
      if (d < RIVER_HALF + BANK) return sicken(bank(x, y, px, py), x, y, px, py, sick);
      if (d < RIVER_HALF + BANK + 0.6) return sicken(riverside(x, y, px, py), x, y, px, py, sick);
    }
    // at the wood's edge, the meadow's grass gives way: long grass and ferns in a ragged fringe
    if (back < 0.12 && over(1 - back / 0.12, 0.5, px, py, 0.4)) {
      const fern = fernAt(x, y, px, py);
      if (fern) return sicken(fern, x, y, px, py, sick);
      const m = grassMark(px, py, 2, 0.4);
      return sicken(m ?? C_GRASS[1], x, y, px, py, sick);
    }
    // the needles, in slow patches; darker the further under the trees
    const t = fbm(x * 0.7, y * 0.7, 1121) - 0.25 * back;
    const tone = over(t, 0.55, px, py) ? 3 : over(t, 0.36, px, py) ? 2 : 1;
    let c = C_NEEDLE[tone];
    // moss in patches
    const moss = fbm(x * 1.1 + 7, y * 1.1, 1123);
    if (over(moss, 0.66, px, py)) c = C_MOSS[over(fbm(x * 3, y * 3, 1124), 0.55, px, py) ? 2 : 1];
    else {
      // the needles' own litter: fallen needles two pixels long lying flat, lit and shaded, thick over the ground
      const r = Math.floor((px + (py % 2)) / 2);
      const h = hash(r, py, 1126);
      const lying = hash(r, py >> 1, 1125) < 0.5;
      if (h < 0.22) c = C_NEEDLE[Math.min(4, tone + (lying ? 2 : 1))];
      else if (h < 0.36) c = C_NEEDLE[Math.max(0, tone - 1)];
    }
    const fern = fernAt(x, y, px, py);
    if (fern) c = fern;
    // fallen twigs: a few pixels along the grid, lit, a shadow under
    const cx = Math.floor(px / 13);
    const cy = Math.floor(py / 7);
    if (hash(cx, cy, 1127) < 0.06) {
      const ax = cx * 13 + 1 + Math.floor(hash(cx, cy, 1128) * 6);
      const ay = cy * 7 + 2;
      const run = px - ax;
      if (run >= 0 && run < 5 && py === ay + Math.floor(run / 2)) c = C_EARTH[4];
      else if (run >= 0 && run < 5 && py === ay + 1 + Math.floor(run / 2)) c = C_NEEDLE[0];
    }
    // under the trees, into the deep dark
    c = mixc(c, DEEP, 0.04 + 0.2 * back);
    return sicken(c, x, y, px, py, sick);
  };
}

/** THE PINEWOOD'S GROUND, for a level's own river, trails and sickness. */
export function pinewoodLook(land: PineLand = {}): TerrainLook {
  const forest = forestFloorOf(land);
  return {
    // his word: no walls. The forest floor goes on at the meadow's height; its trees are pieces.
    rise: 0,
    near: 0,
    round: 0.5,
    rag: 0.36,
    fine: 0.07,
    seed: 91,
    floor: meadowOf(land),
    // (no faces at the meadow's height: these are never asked for, but a look has them)
    face: (_s, _v, px, py, x, y) => forest(x, y, px, py, 0),
    top: (x, y, px, py, back) => forest(x, y, px, py, back),
    nearFace: (_v, px, py, x, y) => forest(x, y, px, py, 0),
    brow: (c) => c,
    foot: [0, 0],
  };
}
