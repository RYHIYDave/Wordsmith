// FLOOR 3, THE CHAINED ONE'S FLOOR: THE BLACK IRON PRISON, LOOK B (TORCHLIT DARK), ITS PIECES READY FOR THE GAME (the art
// chat, 2 Nov 2026). Behind the switch PRISON, off; nothing of the game imports it until the main chat puts it in.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. His pick for floor
// 3: “Black iron prison (Recommended)”; and of its three looks (docs/mockups/floor3_look), 2 Nov 2026, by 07:52: “B, torchlit
// dark (Recommended)”, offered as: fire baskets on the walls, grates glowing here and there, deep shadow between; the hero and
// words stand out best; the gate the same in all three. Of the bosses' gates: “Its own arch, and we’ll need new ones for the
// other new levels as well” (his gate: art/prison_gate.ts).
//
// WHAT IS HERE, each in the game's own measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32), anchored as
// the game's own are:
//   floor(tx, ty)    THE DARK FLAGS, laid on the world (the stones run on across the tiles; sixteen pictures, every four tiles)
//   tiles            floor tiles laid over them: a grate (dark: embers dying under it), a grate glowing (the fire under it,
//                    four frames), soot, rust stains, a drain, straw before a cell; THE FIRE CHANNEL's pieces, along x and along y (its grated
//                    ends, dark or glowing; the open channel, burnt low, its far side going down; where the open run begins;
//                    two tiles wide, each piece a far half and a near half;
//                    the grated bridge over it)
//   faceLeft/Right   THE PRISON'S WALL a tile at a time, as the game lays walls (turned to screen-left and lit for a wall along
//                    x; to screen-right and in shade for one along y): 80 high as floor 3's walls are, its top fading into the
//                    dark as the game's; dark stone in courses, footed with riveted black iron, an iron rib on [0] and [2]
//                    (`face(alongX, tx, ty)` picks them so the ribs fall every two tiles); rust and soot
//   cellLeft/Right   A CELL'S FRONT as wall tiles: three tiles of the cell block's back wall, bars of black iron and a door,
//                    the cell seen through them
//   hall             THE BOSS HALL, FLAT (as the game's boss hall is): the great grate under where he stands (four tiles each
//                    way, glowing, four frames), the iron ring round it and the grooves his ball has worn, rings in the floor
//                    for the great chains (`hall.floor`); the hall's walls with their great rings and chains slung between
//   pieces           the prison's own: railings along the channel, chains hung from the dark (before a wall, to a hook, a
//                    shackle; free, to a hook, a cage; the great ones in the hall, down to its floor's rings); and floor 3's
//                    own pieces, his yes already (art/floor3.ts), in look B's colours (their colours, not their shapes)
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game, the renderer lays its darkness and cuts a hole where each
// light burns (render.ts, light), and what gives light is drawn over it (drawLights): the fire baskets', the glowing grates',
// the channel's, the great grate's. What the main chat should place is in docs/mockups/floor3_look/README.md ("Made game-
// ready"), and in PRISON_LIGHTS here; the painted light in the pictures he picked was the guide.
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to
// screen-right in shade); a dark base, the place a step quieter than the figures; seams a deep, never black; nothing glowing
// cyan (the friend's) nor pink (the enemy's); fire an honest orange (the props' own embers); real shapes.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Iso } from './isokit';
import { GRAIN, hash } from './kit';
import { EMBER } from './props';
import { SHINES, wallPiece } from './floorkit';
import type { Piece, PieceKind, Spot } from './floorkit';
import { chainedPieces } from './floor3';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const PRISON = { on: false };

// =================================================================================================
// MEASURES

const TW = 32 * GRAIN;
const TH = 16 * GRAIN;
const HALF = TW / 2;
/** How high floor 3's walls stand (picture pixels: the game's WALL_LOOK.tall, 40, at two to a game pixel), and how much of their top fades into the dark (its `fade`, 12). */
export const PRISON_WALL = 80;
export const PRISON_FADE = 24;
/** The game's four steps of a wall's top fading out (art/ground.ts, `put`): how much of each is there, from the top down. */
export const FADE_STEPS = [0.14, 0.38, 0.62, 0.84] as const;
/** The fire channel: how deep its bed lies below the floor (picture pixels). */
export const CHANNEL_DEEP = 20;
/** The great grate in the boss hall: tiles each way. */
export const GREAT = 4;

// =================================================================================================
// LOOK B'S COLOURS (his pick): five tones a material, its seam to its lit edge

type R5 = readonly [string, string, string, string, string];
/** The prison's dark stone: a cool charcoal (its walls). */
export const STONE: R5 = ['#09090d', '#131319', '#1c1c24', '#282731', '#433f4c'];
/** Its floor's flags. */
export const FLAGS: R5 = ['#0b0b10', '#16151c', '#201f27', '#2c2a34', '#46414e'];
/** Black iron. */
export const IRON: R5 = ['#09090c', '#16161b', '#222128', '#323039', '#55505e'];
/** Rust: its dark, its body, its bright. */
export const RUST = ['#2e160e', '#4a2412', '#683417'] as const;
const SOOT = '#060608';
const STRAW = ['#241c16', '#3a2c1e', '#4e3c26'] as const;
const SEAM = '#08080c';
/** What lies beyond everything (the dark under a grate, through a cell's bars). */
const BEYOND = '#040406';
/** Fire: the props' own embers (so the renderer and the checks know it for fire), and the dark reds of a bed of coals. */
const FIRE = EMBER;
const COALS = ['#24100c', '#3a120c', '#2a0f0c'] as const;
/** What shines of itself here: never shaded, never faded. */
const OWN = new Set<string>([...FIRE, ...COALS]);

const SOOT_K = 0.5;
const RUST_K = 0.45;

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hexOf(a);
  const [r1, g1, b1] = hexOf(b);
  return toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
}

/** Smooth noise on a lattice that repeats every `P` cells (so a pattern laid on the world repeats every four tiles). */
function noiseP(x: number, y: number, k: number, P: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const w = (n: number): number => ((n % P) + P) % P;
  const h = (a: number, b: number): number => hash(w(a), w(b), k);
  const a = h(i, j) + (h(i + 1, j) - h(i, j)) * sx;
  const b = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * sx;
  return a + (b - a) * sy;
}
/** Three octaves of it, repeating every four tiles. */
const fbm4 = (x: number, y: number, k = 0): number => 0.55 * noiseP(x, y, k, 4) + 0.3 * noiseP(x * 2, y * 2, k + 11, 8) + 0.15 * noiseP(x * 4, y * 4, k + 23, 16);
/** Noise that repeats every tile along y (for what is laid tile after tile down a run: the channel's bed). */
const fbmRun = (x: number, y: number, k = 0): number => 0.55 * noiseP(x * 3, y * 3, k, 3) + 0.3 * noiseP(x * 5, y * 5, k + 11, 5) + 0.15 * noiseP(x * 9, y * 9, k + 23, 9);

/** The diamond's half width at a row, and where in its tile a pixel is (u to screen right-down, v to screen left-down), as art/ground.ts has them. */
const halfWidth = (y: number): number => (y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1);
function onTile(x: number, y: number): [number, number] {
  const px = x + 0.5 - HALF;
  const py = y + 0.5;
  return [(px / HALF + py / (TH / 2)) / 2, (py / (TH / 2) - px / HALF) / 2];
}
/** A floor tile's picture from a painter of the world (x, y in tiles from the tile's own top corner, plus tx, ty). Anchored at its top corner. */
function tileOf(paint: (x: number, y: number) => string | null, tx = 0, ty = 0): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      const c = paint(tx + u, ty + v);
      if (c) p.set(x, y, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

/** A sprite's pixels, whether it was painted under the game's canvas or the tests'. */
function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const c = s.img;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const d = q.getImageData(0, 0, c.width, c.height).data;
  const p = new Px(c.width, c.height);
  p.d.set(d);
  return p;
}

// =================================================================================================
// THE FLOOR: big flags of the dark stone, close-set, each worn on its edge toward the light; soot and grime in drifts. Rows
// half a tile deep, each its own run of stones (half, two thirds or a whole tile long), so the pattern repeats every four tiles.

const FLAG_LONG = [0.5, 2 / 3, 1] as const;
/** The tone of the flag at a point of the world (-1: a joint). */
function flagAt(x: number, y: number): number {
  const row = Math.floor(y * 2);
  const rw = ((row % 8) + 8) % 8;
  const L = FLAG_LONG[Math.floor(hash(rw, 31, 2) * 3)];
  const n = Math.round(4 / L);
  const off = Math.floor(hash(rw, 31, 1) * n) * L * 0.5;
  const xx = x + off;
  const i = Math.floor(xx / L);
  const iw = ((i % n) + n) % n;
  const fu = xx / L - i;
  const fv = y * 2 - row;
  const su = 0.05 / L;
  if (fu < su || fv < 0.07) return -1;
  let k = 2;
  const tone = hash(iw, rw, 33);
  if (tone < 0.22) k = 1;
  else if (tone > 0.86) k = 3;
  if (fu < su + 0.07 || fv > 0.88) k += 1;
  if (fu > 0.93 || fv < 0.15) k -= 1;
  // (a crack across one now and then)
  if (hash(iw, rw, 35) > 0.84) {
    const c = Math.abs(fv - 0.5 - (fu - 0.5) * (hash(iw, rw, 36) - 0.5) * 1.6 - Math.sin(fu * 9) * 0.06);
    if (c < 0.035) return -1;
  }
  return clampK(k);
}
/** The floor at a point of the world, before anything is laid over it. */
export function floorAt(x: number, y: number): string {
  const k = flagAt(x, y);
  if (k < 0) return FLAGS[0];
  let c = FLAGS[k];
  // grime and soot in drifts
  if (fbm4(x, y, 37) > 0.62) c = mixC(c, SOOT, SOOT_K * 0.5);
  return c;
}

// =================================================================================================
// THE FIRE seen through iron: an ember bed, its hot spots yellow, its edges red; dying embers; a bed of coals burnt low

/** The fire under a grate at a point; `edge` 0..1 how near the grate's rim (cooler there); frame `f` of four (it drifts and breathes). */
function fireAt(x: number, y: number, edge: number, f: number, k: number, heat = 0): string {
  const a = (f * Math.PI) / 2;
  const n = fbm4(x * 3 + Math.cos(a) * 0.14, y * 3 + Math.sin(a) * 0.14, 401 + k) + (1 - edge) * 0.2 + heat + [0, 0.025, 0, -0.025][f & 3];
  if (n > 0.9) return FIRE[4];
  if (n > 0.78) return FIRE[3];
  if (n > 0.62) return FIRE[2];
  if (n > 0.46) return FIRE[1];
  return n > 0.36 ? FIRE[0] : COALS[1];
}
/** Embers dying under a dark grate: mostly the dark, a coal here and there. */
function dimFireAt(x: number, y: number): string {
  const n = fbm4(x * 4, y * 4, 409);
  if (n > 0.74) return FIRE[1];
  if (n > 0.64) return FIRE[0];
  if (n > 0.5) return COALS[2];
  return BEYOND;
}
/** Smooth noise that repeats every `P` cells along y only (across a run it runs on). */
function noiseY(x: number, y: number, k: number, P: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const w = (n: number): number => ((n % P) + P) % P;
  const h = (a: number, b: number): number => hash(a, w(b), k);
  const a = h(i, j) + (h(i + 1, j) - h(i, j)) * sx;
  const b = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * sx;
  return a + (b - a) * sy;
}
/**
 * A BED OF COALS BURNT LOW (look B's channel): dark coal in lumps, their tops a dull red, the fire showing in the cracks
 * between them, hotter in some stretches than others. `x` across the run (0 to 2), `y` along it (it repeats every tile).
 */
function coalsAt(x: number, y: number): string {
  const n = 0.6 * noiseY(x * 6, y * 6, 421, 6) + 0.4 * noiseY(x * 12, y * 12, 422, 12);
  const crack = Math.abs(0.65 * noiseY(x * 3, y * 3, 423, 3) + 0.35 * noiseY(x * 7, y * 7, 424, 7) - 0.5);
  const hot = 0.6 * noiseY(x * 1.5, y * 2, 425, 2) + 0.4 * noiseY(x * 4, y * 4, 426, 4);
  if (crack < 0.03) return hot > 0.58 ? FIRE[2] : FIRE[1];
  if (crack < 0.055) return hot > 0.5 ? FIRE[0] : COALS[1];
  if (n > 0.7) return hot > 0.62 ? FIRE[0] : COALS[1];
  return n > 0.45 ? COALS[1] : COALS[0];
}

// =================================================================================================
// A GRATE OF BLACK IRON let into the floor: a heavy rim, riveted; bars close together, a cross bar every half tile; between
// them what is under it; its bars catching the fire on their far edge

type Under = 'fire' | 'dim';
interface Rect { x0: number; y0: number; x1: number; y1: number }
/** A point of a grate (or null where it is not). `alongY`: its bars run along y (else along x). */
function grateAt(x: number, y: number, g: Rect, under: Under, f: number, k: number, rim = 0.09, alongY = true, rimSides: 'all' | 'ends' = 'all'): string | null {
  const fx = x - g.x0;
  const fy = y - g.y0;
  const W = g.x1 - g.x0;
  const H = g.y1 - g.y0;
  if (fx < 0 || fy < 0 || fx >= W || fy >= H) return null;
  // (the rim on all four sides; or, over a channel, only on the sides it rests on: across the run's ends are the next grate's)
  const across = alongY ? Math.min(fx, W - fx) : Math.min(fy, H - fy);
  const toEdge = rimSides === 'all' ? Math.min(fx, fy, W - fx, H - fy) : across;
  if (toEdge < rim) {
    if (toEdge < 0.022) return SEAM;
    const along = rimSides === 'all' ? (fx < rim || W - fx < rim ? fy : fx) : alongY ? fy : fx;
    if (Math.abs(((along * 4) % 1) - 0.5) < 0.07 && Math.abs(toEdge - rim / 2) < 0.03) return IRON[4];
    const towardLight = fx < rim || H - fy < rim;
    return IRON[towardLight ? 3 : 2];
  }
  const a = alongY ? fx : fy;
  const b = alongY ? fy : fx;
  const bu = (((a * 7) % 1) + 1) % 1;
  const bv = (((b * 2) % 1) + 1) % 1;
  const onBar = bu < 0.34;
  const onCross = bv < 0.12;
  const hot = under === 'fire';
  if (onBar || onCross) {
    if (onCross && !onBar) return bv < 0.04 ? IRON[3] : hot ? IRON[2] : IRON[1];
    if (bu < 0.1) return IRON[3];
    if (bu > 0.26) return hot ? RUST[1] : IRON[1];
    return IRON[2];
  }
  const e = Math.min(1, toEdge / 0.5);
  // (a grate a tile across is hot right to its middle: its fire a little hotter than a great grate's at the same reach)
  return under === 'fire' ? fireAt(x, y, 1 - e, f, k, W < 2 ? 0.08 : 0) : dimFireAt(x, y);
}

/** A tile with a grate in it, the flags round it and rust bled out from its rim. Under it fire (frame f) or dying embers. */
function grateTile(under: Under, f: number): Sprite {
  const G: Rect = { x0: 0.1, y0: 0.1, x1: 0.9, y1: 0.9 };
  return tileOf((x, y) => {
    const c = grateAt(x, y, G, under, f, 11);
    if (c) return c;
    let s = floorAt(x + 2, y + 1);
    const d = Math.max(G.x0 - x, x - G.x1, G.y0 - y, y - G.y1);
    if (d > 0 && d < 0.1 && fbm4(x * 6, y * 6, 331) < 0.6) s = mixC(s, RUST[0], 0.45 * RUST_K + 0.2);
    return s;
  });
}
/** Soot in a drift over the flags. */
function sootTile(): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 1, y + 3);
    const d = Math.hypot((x - 0.5) / 0.5, (y - 0.5) / 0.46) + (fbm4(x * 4, y * 4, 341) - 0.5) * 0.7;
    if (d > 1) return c;
    const k = d < 0.55 ? 0.75 : d < 0.8 ? 0.55 : 0.35;
    const fleck = hash(Math.floor(x * 32), Math.floor(y * 32), 343) > 0.94;
    return fleck ? FLAGS[1] : mixC(c, SOOT, k);
  });
}
/** Rust stains on the flags: water run red off old iron, in tongues. */
function rustTile(): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 3, y + 2);
    const n = fbm4(x * 2.6 + 0.4, y * 2.6, 351);
    const tongue = Math.abs(fbm4(x * 1.2, y * 4.4, 353) - 0.5) < 0.12;
    if (n > 0.6 || (tongue && n > 0.48)) return mixC(c, n > 0.7 ? RUST[1] : RUST[0], n > 0.7 ? 0.55 : 0.5);
    return c;
  });
}
/** Straw kicked out before a cell's bars, in tufts over the flags (its far edge, toward the cell, the thickest). */
function strawTile(): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 2, y + 3);
    const thick = fbm4(x * 3, y * 3, 361) - x * 0.35 + 0.2;
    if (thick < 0.42) return c;
    const s = hash(Math.floor(x * 28 + y * 6), Math.floor(y * 14), 363);
    if (thick < 0.5) return s > 0.6 ? STRAW[0] : c;
    return s > 0.75 ? STRAW[2] : s > 0.3 ? STRAW[1] : STRAW[0];
  });
}
/** A drain in a flag: a round iron grid, the dark under it, the flag dished and stained round it. */
function drainTile(): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 1, y + 1);
    // (round on the floor: an ellipse on the screen)
    const dx = x - 0.5;
    const dy = y - 0.5;
    const r = Math.hypot(dx, dy);
    if (r < 0.2) {
      if (r > 0.17) return IRON[(dx - dy) < 0 ? 3 : 1];
      const slot = Math.abs(((dx + dy) * 9 + 50) % 1 - 0.5) < 0.2;
      return slot ? BEYOND : IRON[2];
    }
    if (r < 0.24) return SEAM;
    if (r < 0.36) return mixC(c, r < 0.3 ? SOOT : RUST[0], 0.45);
    return c;
  });
}

// =================================================================================================
// THE FIRE CHANNEL, two tiles wide (a far half and a near half), laid tile after tile down the middle of the cell block:
// grated over at its ends, open between with railings along it and a grated bridge over it. Its bed lies CHANNEL_DEEP below
// the floor; looking into it, a point of the floor sees down the camera's line, (x - s, y - s, -32 s), to its far side going
// down or to its bed.

/** How wide the channel is (tiles). */
export const CHANNEL_WIDE = 2;
/**
 * What is seen at a point (a across the run, 0 to CHANNEL_WIDE; b along it, 0..1 in the tile) of the open channel: its far
 * side (at a = 0), where the run begins its far end (at b = 0), or its bed. `alongY`: the run along y (its far side turned to
 * screen-right, in shade; its far end to screen-left); along x the other way round.
 */
function channelSeen(a: number, b: number, alongY: boolean, end: boolean): string {
  const t0 = CHANNEL_DEEP / 32;
  const hitSide = a;
  const hitEnd = end ? b : Infinity;
  const hit = Math.min(hitSide, hitEnd);
  if (hit < t0) {
    const z = -32 * hit; // the height on the side seen (0 at the floor, -CHANNEL_DEEP at the bed)
    const along = hitSide <= hitEnd ? b - hit : a - hit;
    // the far side along the run: in shade along y, lit along x; the far end the other way
    const lit = hitSide <= hitEnd ? !alongY : alongY;
    if (z > -3) return z > -1.5 ? IRON[lit ? 4 : 3] : IRON[lit ? 2 : 1];
    const row = Math.floor((z + 200) / 7);
    const joint = (z + 200) % 7 < 1 || (((along * 5 + (row % 2) * 0.5) % 1) + 1) % 1 < 0.08;
    const c = joint ? SEAM : STONE[lit ? 2 : 1];
    // (the fire low in it: the stone near the bed rusted red by it, soot over the rest)
    const d = -z / CHANNEL_DEEP;
    return d > 0.7 && !joint ? mixC(c, RUST[0], 0.45) : d < 0.35 ? mixC(c, SOOT, 0.3) : c;
  }
  return coalsAt(a - t0, b - t0);
}
/**
 * A tile of the channel: its far half (`half` 0, the one away from the eye) or its near half (1). kind: 'grate' (its grated end
 * over the fire, or dark), 'open', 'start' (where the open run begins), 'bridge' (a grate across it to walk over).
 */
function channelTile(kind: 'grate' | 'open' | 'start' | 'bridge', alongY: boolean, half: number, under: Under = 'dim', f = 0): Sprite {
  // (the whole channel's breadth, in this tile's own measure)
  const all: Rect = alongY ? { x0: -half, y0: 0, x1: CHANNEL_WIDE - half, y1: 1 } : { x0: 0, y0: -half, x1: 1, y1: CHANNEL_WIDE - half };
  return tileOf((x, y) => {
    const a = (alongY ? x : y) + half;
    const b = alongY ? y : x;
    if (kind === 'grate') return grateAt(x, y, all, under, f, 21, 0.11, alongY, 'ends') ?? FLAGS[0];
    if (kind === 'bridge') {
      // the deck: a grate across the run (its bars across it), its rims where it meets the open run; through it the bed
      const deck = grateAt(x, y, all, 'dim', 0, 23, 0.1, !alongY, 'ends');
      if (deck && !(deck === BEYOND || deck === COALS[2] || deck === FIRE[0] || deck === FIRE[1])) return deck;
      return channelSeen(a, b, alongY, false);
    }
    return channelSeen(a, b, alongY, kind === 'start');
  });
}

// =================================================================================================
// THE WALLS: the prison's dark stone in courses, footed with a plate of riveted black iron, ribbed with riveted straps; rust
// bled down from the rivets, soot toward the top; the top fading into the dark as the game's walls do

/** What a face may carry instead of its stone at a place (u across the face from its left end on the screen, up from the floor). */
type Dress = (u: number, up: number) => string | undefined;

/** The stone and iron of a face at (u across it from its left end on the screen, up from the floor). */
export function stoneFace(lit: boolean, u: number, up: number, seed: number, rib: boolean): string {
  const S = STONE;
  const I = IRON;
  const top = PRISON_WALL;
  const fromTop = top - up;
  // THE IRON RIB near the tile's start: a strap 7 wide, riveted every 10
  const ribU = u - 5;
  let c: string;
  if (rib && Math.abs(ribU) < 3.5) {
    const rivet = Math.abs(ribU) < 1.5 && (up % 10 === 4 || up % 10 === 5);
    c = rivet ? (ribU < 0 ? I[4] : I[1]) : ribU < -2.5 ? I[lit ? 3 : 2] : ribU > 2.5 ? I[0] : I[lit ? 2 : 1];
  } else if (up < 9) {
    // THE FOOT PLATE: riveted iron, its top edge lit
    if (up === 8) c = I[lit ? 4 : 3];
    else if (up === 7) c = I[lit ? 3 : 2];
    else if (up === 4 && (u % 16 === 8 || u % 16 === 9)) c = I[4];
    else if (up === 0) c = I[0];
    else c = I[lit ? 2 : 1];
  } else {
    // THE STONE, in courses 12 high, blocks 22 to 36 long, a head joint at each tile's start
    const CH = 12;
    const cv = up - 9;
    const row = Math.floor(cv / CH);
    const lv = cv % CH;
    const off = Math.floor(hash(row, seed, 1) * 40);
    const L = 22 + Math.floor(hash(row, seed, 2) * 14);
    const uu = u + off;
    const b = Math.floor(uu / L);
    const lu = uu % L;
    if (lv === CH - 1 || lu === 0 || u === 0) c = SEAM;
    else {
      let k = lit ? 2 : 1;
      const tone = hash(b, row * 7 + seed, 3);
      if (tone < 0.14) k -= 1;
      else if (tone > 0.92) k += 1;
      if (lv === CH - 2) k += 1;
      if (lit && (lu === 1 || u === 1)) k += 1;
      if (lv === 0 || lu === L - 1) k -= 1;
      if (hash(u >> 1, up >> 1, seed + 5) < 0.03) k -= 1;
      c = S[clampK(k)];
    }
  }
  // RUST bled down from the rib's rivets and up from the foot plate
  if (!(rib && Math.abs(ribU) < 3.5)) {
    const col = u >> 1;
    if (rib && Math.abs(ribU) < 9 && hash(col, 3, seed + 21) < 0.5 * RUST_K) {
      const len = 10 + 34 * hash(col, 4, seed + 21) * RUST_K;
      const from = 14 + Math.floor(hash(col, 5, seed + 21) * 4) * 10;
      if (up < from && up > from - len && hash(col, up >> 2, seed + 22) > 0.2) c = mixC(c, RUST[up > from - 8 ? 1 : 0], 0.5 + 0.2 * RUST_K);
    }
    if (up >= 9 && up < 9 + 10 * RUST_K && hash(col, 6, seed + 23) < 0.35 * RUST_K) c = mixC(c, RUST[0], 0.55);
  }
  // SOOT: darker toward the top, in streaks
  const sk = SOOT_K * Math.max(0, 1 - fromTop / 40) * (0.6 + 0.4 * noiseP(u / 9, up / 30, seed + 25, 64));
  if (sk > 0.25) c = mixC(c, SOOT, Math.min(0.75, sk));
  return c;
}

/**
 * A TILE OF WALL: its one face, as the game's walls are laid (art/ground.ts, a face alone): along x its face turned to screen-
 * left, along y to screen-right, standing on the tile's near edge; PRISON_WALL high, its top PRISON_FADE fading out in the
 * game's four steps. `dress` paints what is set in it (a cell's front, the hall's rings and chains). Anchored at the floor
 * point of the tile's top corner, the face hanging to the floor.
 */
function wallTile(alongX: boolean, seed: number, rib: boolean, dress?: Dress): Sprite {
  const H = PRISON_WALL;
  const p = new Px(TW, TH + H);
  const iso = new Iso(p, HALF, H);
  const shade = (u: number, v: number, _w: number, h: number, px: number): string | null => {
    // (the game leaves the first column and the last empty: the joint between two tiles' faces)
    if (px <= 0 || px >= TW - 1) return null;
    const up = h - 1 - v;
    const d = dress ? dress(u, up) : undefined;
    // (what is set in a face turned to screen-right is in its shade, as a wall piece is: art/floorkit.ts onFacePx)
    if (d !== undefined) return alongX || OWN.has(d) ? d : mixC(d, '#06051a', 0.32);
    return stoneFace(alongX, u, up, seed, rib);
  };
  if (alongX) iso.left(0, 1, 1, 0, H, shade);
  else iso.right(1, 0, 1, 0, H, shade);
  // its top fading out, as the game's (four flat steps of how much is there)
  for (let x = 0; x < p.w; x++) {
    let top = -1;
    for (let y = 0; y < p.h; y++) if (p.has(x, y)) {
      top = y;
      break;
    }
    if (top < 0) continue;
    for (let k = 0; k < PRISON_FADE; k++) {
      const y = top + k;
      const c = p.get(x, y);
      if (!c || OWN.has(c)) continue;
      p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / PRISON_FADE)]);
    }
  }
  return p.sprite(HALF, H, GRAIN);
}

// =================================================================================================
// A CELL'S BARRED FRONT, three tiles of the cell block's back wall: an iron frame and lintel, bars of black iron every eight,
// two flat cross bars, a door in the middle with its hinges and lock; through the bars the cell, its straw going back into the
// dark, its back wall with a chain hung on it

const CELL_W = 96;
const CELL_M = 4;
/** The front's top (its lintel's), kept under the wall's fading top as far as it may be: a hero is 56 high. */
const CELL_TOP = 60;
const LINTEL = 53;
const DOOR_TOP = 50;
function cellFront(u: number, up: number): string | undefined {
  const I = IRON;
  const w = CELL_W - 2 * CELL_M;
  const x = u - CELL_M;
  if (x < -2 || x > w + 1 || up > CELL_TOP) return undefined;
  // the frame: posts at either side, the lintel over
  if (up >= LINTEL) return up >= CELL_TOP - 1 ? I[3] : up === LINTEL ? I[1] : I[2];
  if (x < 2 || x > w - 2) return x < 0 || x === w - 1 ? I[1] : x > w ? I[1] : I[3];
  if (up < 2) return up === 1 ? I[3] : I[1];
  // the door: the middle three bays, its stiles, its lock
  const dm = Math.round(w / 2);
  const inDoor = Math.abs(x - dm) <= 12;
  if (inDoor && up >= DOOR_TOP - 2 && up <= DOOR_TOP) return up === DOOR_TOP ? I[3] : I[1];
  if (inDoor && (Math.abs(x - dm) === 12 || Math.abs(x - dm) === 11) && up < DOOR_TOP) return Math.abs(x - dm) === 12 ? I[1] : I[3];
  if (inDoor && x - dm >= 4 && x - dm <= 9 && up >= 21 && up <= 28) return up === 28 || x - dm === 4 ? I[3] : up === 25 && x - dm === 6 ? BEYOND : I[2];
  // its hinges, on the left stile
  if (inDoor && x - dm >= -12 && x - dm <= -9 && (Math.abs(up - 10) <= 1 || Math.abs(up - 40) <= 1)) return up === 11 || up === 41 ? I[4] : I[2];
  // the cross bars
  if ((up >= 14 && up <= 16) || (up >= 34 && up <= 36)) return up === 16 || up === 36 ? I[3] : I[2];
  // the bars: three wide, every eight, lit on the side toward the light (the left)
  const b = (x + 400) % 8;
  if (b < 3) return b === 0 ? I[3] : b === 1 ? I[2] : I[1];
  // THROUGH THE BARS, the cell: straw (low), its floor going back into the dark, its back wall, a chain on it
  const back = 28;
  if (up < 8) {
    const s = hash(x >> 1, up >> 1, 77);
    return s > 0.7 ? STRAW[2] : s > 0.35 ? STRAW[1] : STRAW[0];
  }
  if (up < back) {
    const d = (up - 8) / (back - 8);
    return d > 0.75 ? BEYOND : d < 0.4 ? FLAGS[1] : FLAGS[0];
  }
  const ch = Math.abs(x - Math.round(w * 0.3));
  if (ch <= 1 && up < 46 && up > back + 2) return (up + (x >> 3)) % 4 < 2 ? I[3] : I[1];
  return up > 44 ? BEYOND : STONE[0];
}

// =================================================================================================
// CHAINS: links of black iron, by turns seen flat (a ring) and edge on (a bar), each lit on its left; hung from out of the dark

type C4 = readonly [string, string, string, string];
const CHAIN: C4 = [IRON[0], IRON[1], IRON[2], IRON[4]];
function chainLink(p: Px, X: number, Y: number, flat: boolean, upright: boolean, c: C4, dark = 0): void {
  const set = (x: number, y: number, k: number): void => {
    p.set(x, y, dark > 0 ? mixC(c[k], BEYOND, dark) : c[k]);
  };
  if (upright) {
    if (flat) {
      for (let dy = 0; dy < 8; dy++) for (let dx = 0; dx < 6; dx++) {
        if ((dx === 0 || dx === 5) && (dy === 0 || dy === 7)) continue;
        if (dx >= 2 && dx <= 3 && dy >= 2 && dy <= 5) continue;
        set(X - 3 + dx, Y + dy, dx <= 1 ? 3 : dx >= 4 ? 1 : dy <= 1 ? 3 : 2);
      }
    } else {
      for (let dy = 1; dy < 9; dy++) {
        set(X - 1, Y + dy, 2);
        set(X, Y + dy, 1);
      }
      set(X - 1, Y + 1, 3);
    }
  } else if (flat) {
    for (let dy = 0; dy < 6; dy++) for (let dx = 0; dx < 8; dx++) {
      if ((dx === 0 || dx === 7) && (dy === 0 || dy === 5)) continue;
      if (dx >= 2 && dx <= 5 && dy >= 2 && dy <= 3) continue;
      set(X - 4 + dx, Y - 3 + dy, dy <= 1 ? 3 : dy >= 4 ? 0 : dx <= 1 ? 3 : 2);
    }
  } else {
    for (let dx = 0; dx < 8; dx++) {
      set(X - 4 + dx, Y - 1, 3);
      set(X - 4 + dx, Y, 1);
    }
  }
}
/** A chain hanging straight down from out of the dark (from y0) to y1, its links lost in the dark in four steps over its top `fade` rows. */
function hangingChain(p: Px, X: number, y0: number, y1: number, fade: number, c: C4 = CHAIN): void {
  let i = 0;
  for (let y = y1 - 6 * Math.floor((y1 - y0) / 6); y < y1; y += 6) {
    const k = y - y0;
    const dark = k < fade ? [0.9, 0.7, 0.5, 0.25][Math.min(3, Math.floor((k * 4) / fade))] : 0;
    chainLink(p, X, y, i++ % 2 === 0, true, c, dark);
  }
}
/** A chain slung slack between two points, sagging `sag` below the line between them. */
function slungChain(p: Px, a: [number, number], b: [number, number], sag: number, c: C4 = CHAIN): void {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) + sag;
  const n = Math.max(2, Math.round(len / 6));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const X = a[0] + (b[0] - a[0]) * t;
    const Y = a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1] + sag * 4 * (1 - 2 * Math.min(1, t + 0.02));
    const upright = Math.abs(dy) > Math.abs(dx) * 1.1;
    chainLink(p, Math.round(X), Math.round(Y) - (upright ? 4 : 0), i % 2 === 0, upright, c);
  }
}
function hookAt(p: Px, X: number, Y: number, c: C4 = CHAIN): void {
  for (let dy = 0; dy < 10; dy++) p.set(X - 1, Y + dy, c[3]).set(X, Y + dy, c[1]);
  const curve: [number, number][] = [[0, 10], [1, 11], [2, 12], [3, 12], [4, 12], [5, 11], [6, 10], [6, 9], [6, 8], [6, 7]];
  for (const [dx, dy] of curve) p.set(X - 1 + dx, Y + dy, dy >= 12 ? c[1] : c[2]).set(X + dx, Y + dy, c[1]);
  p.set(X + 5, Y + 6, c[3]).set(X + 6, Y + 6, c[2]);
}
function shackleAt(p: Px, X: number, Y: number, c: C4 = CHAIN): void {
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 1.7 + Math.PI * 0.65;
    const x = Math.round(X + Math.cos(t) * 5);
    const y = Math.round(Y + 6 + Math.sin(t) * 5);
    p.set(x, y, Math.cos(t) < 0 ? c[3] : c[1]).set(x, y + 1, c[0]);
  }
}
/** A hanging cage on its chain: a ring at the top, bars round it, a floor; seen as a drum, lit on its left. */
function hangingCage(p: Px, X: number, Y: number, c: C4 = CHAIN): void {
  const W = 9;
  const H = 30;
  const inside = mixC(BEYOND, IRON[0], 0.5);
  for (let dy = 4; dy < H; dy++) for (let dx = -W + 1; dx < W; dx++) p.set(X + dx, Y + dy, inside);
  for (let dy = 0; dy < 5; dy++) {
    const w = Math.round(W * Math.sqrt(1 - ((4 - dy) / 5) ** 2));
    for (let dx = -w; dx <= w; dx++) if (Math.abs(dx) === w || dy === 4) p.set(X + dx, Y + dy, dx < 0 ? c[3] : c[1]);
  }
  for (const k of [-1, -0.72, -0.38, 0, 0.38, 0.72, 1]) {
    const dx = Math.round(k * W);
    for (let dy = 4; dy <= H; dy++) p.set(X + dx, Y + dy, k < -0.1 ? c[3] : k > 0.5 ? c[0] : c[2]);
  }
  for (const dy of [4, 16, H]) for (let dx = -W; dx <= W; dx++) {
    const yy = Y + dy + Math.round(Math.sqrt(Math.max(0, 1 - (dx / W) ** 2)) * 2);
    p.set(X + dx, yy, dx < 0 ? c[3] : c[1]);
  }
  p.set(X, Y - 1, c[2]).set(X, Y - 2, c[3]);
}

/** A CHAIN HUNG FROM THE DARK BEFORE A WALL, as a wall piece (anchored at the foot of the face under its tile's middle): from over the wall's top, out of the dark, down to a hook or a shackle. */
function chainOnWall(end: 'hook' | 'shackle', du: number): { left: Sprite; right: Sprite } {
  return wallPiece((p) => {
    // (the flat picture: 48 x 120, its foot at 104 under its middle: art/floorkit.ts)
    const X = 24 + du;
    const y1 = 104 - (end === 'hook' ? 46 : 38);
    hangingChain(p, X, 0, y1, 40);
    if (end === 'hook') hookAt(p, X, y1);
    else shackleAt(p, X, y1);
  });
}
/**
 * A CHAIN HUNG FROM THE DARK IN THE OPEN (a hall's middle): from out of the dark high over the screen down to its end `up`
 * over the floor: a hook, a cage, or (the great ones in his hall) a ring let into the floor. Anchored at the floor point under it.
 */
function chainFree(end: 'hook' | 'cage' | 'floor', up: number): Sprite {
  const W = 32;
  const H = up + 230;
  const p = new Px(W, H + 8);
  const X = 16;
  const foot = H;
  const y1 = foot - up - (end === 'floor' ? 2 : 0);
  hangingChain(p, X, 0, y1, 90);
  if (end === 'hook') hookAt(p, X, y1);
  if (end === 'cage') hangingCage(p, X, y1);
  if (end === 'floor') {
    // (the last link through the ring let into the floor)
    for (let dx = -4; dx <= 4; dx++) p.set(X + dx, foot - 1, dx < 0 ? IRON[3] : IRON[1]).set(X + dx, foot, IRON[0]);
  }
  return p.sprite(X, foot, GRAIN);
}

// =================================================================================================
// THE RAILINGS along the open channel: iron posts with a knob, two rails, a tile's length; and a post on its own to end a run

/** A tile's length of railing: along y (from y 0 to 1) or along x; its post at the run's far end. Anchored at the floor point under its middle. */
function railing(alongY: boolean, post: 'far' | 'only'): Sprite {
  const p = new Px(56, 96);
  const iso = alongY ? new Iso(p, 28 + 16, 80 - 8) : new Iso(p, 28 - 16, 80 - 8);
  const end = (t: number): [number, number] => (alongY ? [0, t] : [t, 0]);
  if (post !== 'only') {
    for (const z of [20, 32]) {
      const [ax, ay] = iso.at(...end(0), z);
      const [bx, by] = iso.at(...end(1), z);
      const n = Math.ceil(Math.abs(bx - ax));
      for (let i = 0; i <= n; i++) {
        const X = Math.round(ax + ((bx - ax) * i) / n);
        const Y = Math.round(ay + ((by - ay) * i) / n);
        p.set(X, Y, IRON[3]).set(X, Y + 1, IRON[1]);
      }
    }
  }
  const [px, py] = post === 'only' ? iso.at(...end(0.5)) : iso.at(...end(0));
  const X = Math.round(px);
  const Y = Math.round(py);
  for (let v = 0; v < 36; v++) p.set(X - 1, Y - v, IRON[3]).set(X, Y - v, IRON[2]).set(X + 1, Y - v, IRON[0]);
  p.set(X - 1, Y - 37, IRON[4]).set(X, Y - 37, IRON[3]).set(X + 1, Y - 37, IRON[1]);
  p.set(X - 1, Y - 38, IRON[3]).set(X, Y - 38, IRON[2]);
  // (its foot: a little plate)
  p.set(X - 2, Y, IRON[3]).set(X + 2, Y, IRON[0]);
  return p.sprite(28, 80, GRAIN);
}

// =================================================================================================
// THE BOSS HALL, FLAT: the great grate under where he stands, four tiles each way; THE IRON RING let into the floor round it,
// riveted; the grooves his ball has worn round it, scored in the flags; rings let into the floor for the great chains; the
// hall's walls, a great ring on a plate every four tiles with chains slung slack between

/** The rings in the hall's floor that the great chains from the dark come down to, from the great grate's far corner (tiles). */
export const HALL_RINGS: readonly [number, number][] = [[-1.1, 0.6], [5.5, -0.8], [5.9, 2.2]];
/** The iron ring round the great grate, and the grooves worn round it: radii from its middle (tiles). */
const RING_R = 3.0;
const GROOVES = [3.35, 3.9] as const;
/** How far round the great grate the hall's floor is its own (tiles from the grate's far corner, each way). */
export const HALL_REACH = { lo: -3, hi: GREAT + 3 } as const;

/** The hall's floor at a point (x, y tiles from the great grate's far corner; wx, wy the world's, for the flags), frame f. */
function hallAt(x: number, y: number, wx: number, wy: number, f: number): string {
  const G: Rect = { x0: 0, y0: 0, x1: GREAT, y1: GREAT };
  const g = grateAt(x, y, G, 'fire', f, 7, 0.16);
  if (g) return g;
  let c = floorAt(wx, wy);
  const m = GREAT / 2;
  const r = Math.hypot(x - m, y - m);
  // the iron ring: a band let into the flags, riveted, its edge toward the light lit
  if (Math.abs(r - RING_R) < 0.08) {
    const ang = Math.atan2(y - m, x - m);
    const rivet = Math.abs(((ang / (Math.PI * 2)) * 28 + 100) % 1 - 0.5) < 0.12 && Math.abs(r - RING_R) < 0.03;
    if (Math.abs(r - RING_R) > 0.065) return SEAM;
    return rivet ? IRON[4] : (x - m) - (y - m) < 0 ? IRON[3] : IRON[2];
  }
  // the grooves his ball has worn
  for (const rr of GROOVES) {
    if (Math.abs(r - rr) < 0.035 && fbm4(x * 2, y * 2, 313) > 0.3) c = FLAGS[0];
    else if (Math.abs(r - rr - 0.05) < 0.02 && fbm4(x * 2, y * 2, 313) > 0.3) c = FLAGS[3];
  }
  // the rings let into the floor
  for (const [rx, ry] of HALL_RINGS) {
    const d = Math.hypot(x - rx, y - ry);
    if (d < 0.22) return d < 0.1 ? IRON[0] : d < 0.16 ? (x < rx ? IRON[4] : IRON[2]) : IRON[1];
    if (d < 0.3) c = mixC(c, RUST[0], 0.4);
  }
  // soot round the grate's rim
  const toGrate = Math.max(G.x0 - x, x - G.x1, G.y0 - y, y - G.y1);
  if (toGrate > 0 && toGrate < 0.35) c = mixC(c, SOOT, 0.35);
  return c;
}

/** THE HALL'S WALL, four tiles of it, laid in order along the wall (k = 0 to 3, the tile's place along it mod 4): a great ring every four tiles, the chain slung to the next. */
function hallDress(k: number, alongX: boolean): Dress {
  // (the four tiles' faces painted on one flat picture, u from the left end on the screen, and the chain on to the next set's ring)
  const p = new Px(128 + 32, PRISON_WALL);
  const y = (up: number): number => PRISON_WALL - 1 - up;
  const ringAt = 16;
  const dv = 52;
  slungChain(p, [ringAt + 6, y(dv - 16)], [ringAt + 128 - 6, y(dv - 16)], 16);
  for (const X of [ringAt, ringAt + 128]) {
    // the plate: riveted, a staple
    for (let du = -7; du <= 7; du++) for (let v = -7; v <= 7; v++) {
      const edge = Math.abs(du) >= 6 || Math.abs(v) >= 6;
      p.set(X + du, y(dv + v), edge ? IRON[0] : Math.abs(du) === 4 && Math.abs(v) === 4 ? IRON[4] : du < 0 ? IRON[3] : IRON[2]);
    }
    // the great ring hanging from it
    for (let a = 0; a < 72; a++) {
      const t = (a / 72) * Math.PI * 2;
      const X2 = Math.round(X + Math.cos(t) * 8);
      const Y2 = Math.round(y(dv - 14) + Math.sin(t) * 8);
      if (Y2 <= y(dv - 6)) continue;
      p.set(X2, Y2, Math.cos(t) < 0 ? IRON[3] : IRON[1]).set(X2, Y2 + 1, IRON[0]);
    }
  }
  // (along y the tiles run the other way on the screen: the k-th along the wall is the (3 - k)-th from the left; the ring then on its right)
  const at = alongX ? k : 3 - k;
  return (u, up) => {
    if (up < 0 || up >= PRISON_WALL) return undefined;
    const col = alongX ? at * 32 + u : at * 32 + u + 0;
    const c = p.get(col, y(up)) ?? (col < 32 ? p.get(col + 128, y(up)) : null);
    return c ?? undefined;
  };
}

// =================================================================================================
// FLOOR 3'S OWN PIECES IN LOOK B'S COLOURS: their colours drawn toward the stone's charcoal (a third of their colour kept), a
// shade darker; fire is fire and stays as it is

/** A colour of floor 3's own pieces as look B has it. */
export function gradedB(c: string): string {
  if (SHINES.has(c)) return c;
  const [r, g, b] = hexOf(c);
  const l = 0.3 * r + 0.55 * g + 0.15 * b;
  return toHex((l + (r - l) * 0.35) * 0.92 + 2, (l + (g - l) * 0.35) * 0.92, (l + (b - l) * 0.35) * 0.95 + 2);
}
const gradedMemo = new WeakMap<Sprite, Sprite>();
function gradeSprite(s: Sprite): Sprite {
  const hit = gradedMemo.get(s);
  if (hit) return hit;
  const src = pixelsOf(s);
  const out = new Px(src.w, src.h);
  const memo = new Map<number, string>();
  for (let i = 0; i < src.d.length; i += 4) {
    const a = src.d[i + 3];
    if (a === 0) continue;
    const key = (src.d[i] << 16) | (src.d[i + 1] << 8) | src.d[i + 2];
    let c = memo.get(key);
    if (!c) memo.set(key, (c = gradedB(`#${key.toString(16).padStart(6, '0')}`)));
    const [r, g, b] = hexOf(c);
    out.d[i] = r;
    out.d[i + 1] = g;
    out.d[i + 2] = b;
    out.d[i + 3] = a;
  }
  const d = s.density ?? 1;
  const s2 = out.sprite(s.ax * d, s.ay * d, d);
  if (s.lights) s2.lights = s.lights.map((l) => ({ ...l }));
  gradedMemo.set(s, s2);
  return s2;
}
function gradePiece(p: Piece): Piece {
  const g = (list?: Sprite[]): Sprite[] | undefined => list?.map(gradeSprite);
  const spots: Spot[] | undefined = p.spots?.map((q) => ({ du: q.du, dv: q.dv, left: q.left.map(gradeSprite), right: q.right.map(gradeSprite) }));
  return { ...p, frames: g(p.frames), left: g(p.left), right: g(p.right), spots };
}

// =================================================================================================
// THE LIGHTS, for the main chat to place (the renderer's own: a hole cut in the dark, render.ts `spot`, and a warm glow drawn
// over it, `drawGlow` / a sprite's `lights`). In game pixels, from where each thing is anchored.

export const PRISON_LIGHTS = {
  /** The floor's dark in the prison: the Crypt's FAR_DARK is 0.88; look B's deep shadow between the fires. */
  dark: 0.8,
  /** A fire basket on the wall (the floor's own, 'fire basket'): its hole round its fire (up the wall from the face's foot), and its glow. */
  basket: { up: 22, r: 56, strength: 0.85, glow: { r: 28, color: EMBER[2], a: 0.34 } },
  /** A glowing grate (a tile): its hole round the tile's middle (8 down from the tile's top corner), and its glow. */
  grate: { down: 8, r: 44, strength: 0.75, glow: { r: 30, color: EMBER[2], a: 0.34 } },
  /** The open channel burnt low: a hole every second tile of it, weaker; a glowing grate over its end as a grate's. */
  channel: { down: 8, r: 38, strength: 0.55, glow: { r: 26, color: EMBER[1], a: 0.28 } },
  /** The great grate in his hall: one hole round its middle, and its glow; his own light as a boss's (render.ts) besides. */
  great: { r: 130, strength: 0.95, glow: { r: 84, color: EMBER[2], a: 0.44 } },
} as const;

// =================================================================================================
// ALL OF IT

export interface PrisonHall {
  /** The hall's floor tile at world tile (tx, ty), which is (dx, dy) tiles from the great grate's far corner: frames (the grate's four, else one). Null where it is the plain floor. */
  floor(tx: number, ty: number, dx: number, dy: number): Sprite[] | null;
  /** The hall's wall: along x (lit) and along y (in shade), four tiles laid in order, k = 0 to 3 (the tile's place along the wall mod 4): a great ring every four tiles, chains slung slack between. */
  faceLeft: Sprite[];
  faceRight: Sprite[];
}
export interface PrisonArt {
  /** The dark flags of tile (tx, ty). */
  floor(tx: number, ty: number): Sprite;
  /** Floor tiles laid over the flags: grates, soot, rust, a drain, the fire channel's pieces. */
  tiles: Piece[];
  /** A tile of the prison's wall: along x (turned to screen-left, lit) and along y (to screen-right, in shade); four of each, an iron rib on [0] and [2]. Anchored as the game's walls are. */
  faceLeft: Sprite[];
  faceRight: Sprite[];
  /** The wall's face for wall tile (tx, ty), so that the ribs fall every two tiles along it. */
  face(alongX: boolean, tx: number, ty: number): Sprite;
  /** A cell's front: three tiles of a wall along x (cellLeft) or along y (cellRight), [k] the tile at the front's start + k along the wall. */
  cellLeft: Sprite[];
  cellRight: Sprite[];
  /** The boss hall, flat. */
  hall: PrisonHall;
  /** The prison's own pieces (railings, chains hung from the dark) and floor 3's own in look B's colours. */
  pieces: Piece[];
}

let made: PrisonArt | null = null;
/** The prison's pictures, made the first time they are asked for and kept. */
export function makePrisonArt(): PrisonArt {
  if (made) return made;
  const floors = new Map<string, Sprite>();
  const halls = new Map<string, Sprite[]>();
  const faceLeft = [0, 1, 2, 3].map((k) => wallTile(true, 300 + k * 17, k % 2 === 0));
  const faceRight = [0, 1, 2, 3].map((k) => wallTile(false, 307 + k * 17, k % 2 === 0));
  const four = [0, 1, 2, 3];
  const tile = (name: string, frames: Sprite[]): Piece => ({ name, kind: 'floor tile' as PieceKind, frames });
  // (a glowing tile's own glow, at its middle, as PRISON_LIGHTS has it: for the main chat to draw over the dark where it lays one)
  const glowing = (s: Sprite[]): Sprite[] => {
    const g = PRISON_LIGHTS.grate.glow;
    for (const q of s) q.lights = [{ x: HALF / GRAIN, y: PRISON_LIGHTS.grate.down, r: g.r, color: g.color, a: g.a } as Light];
    return s;
  };
  const channel = (alongY: boolean): Piece[] => {
    const w = alongY ? 'along y' : 'along x';
    const out: Piece[] = [];
    for (const [half, side] of [[0, 'far'], [1, 'near']] as const) {
      const h = `, its ${side} half`;
      out.push(
        tile(`the channel's grate ${w}${h}`, [channelTile('grate', alongY, half, 'dim')]),
        tile(`the channel's grate ${w}, glowing${h}`, glowing(four.map((f) => channelTile('grate', alongY, half, 'fire', f)))),
        tile(`the open channel ${w}${h}`, [channelTile('open', alongY, half)]),
        tile(`the open channel ${w}, where it begins${h}`, [channelTile('start', alongY, half)]),
        tile(`the bridge ${w}${h}`, [channelTile('bridge', alongY, half)]),
      );
    }
    return out;
  };
  const own = chainedPieces().map(gradePiece);
  const onWall = (name: string, end: 'hook' | 'shackle'): Piece => {
    const spots = [0, -6, 6].map((du) => ({ du, dv: 0, ...((): { left: Sprite[]; right: Sprite[] } => {
      const w = chainOnWall(end, du);
      return { left: [w.left], right: [w.right] };
    })() }));
    return { name, kind: 'on the wall', left: spots[0].left, right: spots[0].right, spots };
  };
  made = {
    floor(tx, ty) {
      const a = ((tx % 4) + 4) % 4;
      const b = ((ty % 4) + 4) % 4;
      const key = `${a},${b}`;
      let s = floors.get(key);
      if (!s) floors.set(key, (s = tileOf((x, y) => floorAt(x, y), a, b)));
      return s;
    },
    tiles: [
      tile('a grate', [grateTile('dim', 0)]),
      tile('a grate, glowing', glowing(four.map((f) => grateTile('fire', f)))),
      tile('soot', [sootTile()]),
      tile('rust stains', [rustTile()]),
      tile('a drain', [drainTile()]),
      tile('straw before a cell', [strawTile()]),
      ...channel(true),
      ...channel(false),
    ],
    faceLeft,
    faceRight,
    face(alongX, tx, ty) {
      const along = alongX ? tx : ty;
      const rib = ((along % 2) + 2) % 2 === 0;
      const pick = hash(tx, ty, 77) < 0.5 ? 0 : 2;
      const list = alongX ? faceLeft : faceRight;
      return list[rib ? pick : pick + 1];
    },
    cellLeft: [0, 1, 2].map((k) => wallTile(true, 351 + k, false, (u, up) => cellFront(k * 32 + u, up))),
    cellRight: [0, 1, 2].map((k) => wallTile(false, 355 + k, false, (u, up) => cellFront((2 - k) * 32 + u, up))),
    hall: {
      floor(tx, ty, dx, dy) {
        if (dx < HALL_REACH.lo || dy < HALL_REACH.lo || dx >= HALL_REACH.hi || dy >= HALL_REACH.hi) return null;
        const inGrate = dx >= 0 && dy >= 0 && dx < GREAT && dy < GREAT;
        const key = `${((tx % 4) + 4) % 4},${((ty % 4) + 4) % 4},${dx},${dy}`;
        let s = halls.get(key);
        if (!s) {
          const n = inGrate ? 4 : 1;
          s = [];
          for (let f = 0; f < n; f++) s.push(tileOf((x, y) => hallAt(dx + x, dy + y, tx + x, ty + y, f)));
          halls.set(key, s);
        }
        return s;
      },
      faceLeft: [0, 1, 2, 3].map((k) => wallTile(true, 371 + k * 3, k === 2, hallDress(k, true))),
      faceRight: [0, 1, 2, 3].map((k) => wallTile(false, 372 + k * 3, k === 2, hallDress(k, false))),
    },
    pieces: [
      { name: 'railing along y', kind: 'obstacle', frames: [railing(true, 'far')] },
      { name: 'railing along x', kind: 'obstacle', frames: [railing(false, 'far')] },
      { name: 'railing post', kind: 'obstacle', frames: [railing(true, 'only')] },
      onWall('a chain from the dark, a hook', 'hook'),
      onWall('a chain from the dark, a shackle', 'shackle'),
      { name: 'a chain from the dark, hanging to a hook', kind: 'on the floor', frames: [chainFree('hook', 50)] },
      { name: 'a chain from the dark, hanging to a cage', kind: 'on the floor', frames: [chainFree('cage', 70)] },
      { name: 'a great chain from the dark', kind: 'on the floor', frames: [chainFree('floor', 0)] },
      ...own,
    ],
  };
  return made;
}
/** Let the prison's pictures go (they are made again if they are wanted). */
export function forgetPrison(): void {
  made = null;
}
/** The prison's own pieces' names (the rest of `pieces` are floor 3's own, in look B's colours). */
export const PRISON_OWN = [
  'railing along y', 'railing along x', 'railing post', 'a chain from the dark, a hook', 'a chain from the dark, a shackle',
  'a chain from the dark, hanging to a hook', 'a chain from the dark, hanging to a cage', 'a great chain from the dark',
] as const;
