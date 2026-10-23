// FLOOR 15, THE GREAT LIBRARY: its ground (art/terrain.ts paints it from the level's own tiles). ACT 2, THE HUSH, its
// lair floor. A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the planning chat's, with his yes as ideas), level 15, THE GREAT
// LIBRARY: "The lair floor that ends the first half: the stolen words are being bound into one book here."; its layout
// "tall halls of shelves, galleries, rolling ladders, chained books and candle chandeliers."; its enemies "the Silent
// Order in force, and creatures of spilled ink."; "the kid may recognize this room. It's the dream's version of the
// library they fell asleep in."; "on the lectern at the heart of the library lies the book of stolen words, nearly
// full."; its palette "Dark wood, candle gold, black ink"; its boss the Censor, in the Reading Room; its Muffled Bell
// "The library's closing bell". To this chat, of floors 11 to 15, his word of 18 Oct, 21:24 Pacific: “Hey go without
// my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”. So it is
// made, and sent him, without waiting.
//
// WHAT IT IS: the city's great library at night, the Order's now, the dream's version of it: its shelves too tall,
// going up into the dark past where any ladder reaches:
// - THE FLOOR, room by room (`LB_ZONE`): the stacks' narrow aisles of dark oak boards, dust thick along the shelves'
//   feet; the great halls' pale marble slabs, a small black square set where four meet, cracked; the Reading Room's parquet laid in a basket
//   weave of walnut and oak, a great worn carpet of indigo and dull gold over its middle; the scriptorium's grey flags,
//   black with the Order's ink. What lies about: books pulled down and dropped, open or shut; loose pages with lines
//   of writing; the Order's ink dripped and pooled; candle wax dripped where the chandeliers hang; dust.
// - THE WALLS: bookcases of dark wood from the floor up into the dark: a base of cupboards, then shelf over shelf of
//   books, their spines oxblood, bottle green, navy, calf, vellum and black, gilt bands dull on them; in the halls and
//   the Reading Room a gallery runs along the shelves, its balustrade against more books above; bay by bay, the
//   Order's black ink slashed across the spines, chained books, a rolling ladder, shelves pulled empty, and in the
//   halls a tall window, the night in its leading. The scriptorium's walls are stone, pigeonholes of rolled scrolls in
//   them and writing on them blacked out by the Order. The wall's top fades up into the dark.
// - THE TOPS: the bookcases' tops seen from above, a lit edge of dark wood, then the dark.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own
// palette (Colour 1: the doc's dark wood, candle gold, black ink); a step quieter than the figures (Places 2) and
// duller than any word's colour (Colour 4: every colour through art/act2_quiet.ts); its dark warm and deep (Colour 2);
// NOTHING GLOWS (Colour 3: the candles and the chandeliers are the pieces'; the ground's gold is gilt and brass,
// dull); no cyan, no pink in it; not mud-brown all over (Colour 5: the books' many colours, the marble, the carpet's
// indigo and the scriptorium's grey against the wood); solid, not flat (Places 4); old and broken (Places 6); crisp.
//
// FOR THE MAIN CHAT: `greatLibraryLook(land)` makes the look for a level from what only the level knows: its floor,
// and what each walkable tile is (LB_ZONE). Edges straight, as walls are.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';
import { quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: dark wood, candle gold (gilt, brass, wax: dull, nothing glowing), black ink; the books' leathers

/** The deep, warm dark under everything. */
export const LB_DEEP: RGB = hex('#0c0a0d');
/**
 * THE BOOKCASES' WOOD, dark walnut, by how a face is turned to the light (to the lower left, lit; at the eye; to the
 * lower right, in shade): its lit edge, body, other body, its dark.
 */
export const LB_WOOD = [
  ['#6e4e36', '#58402c', '#4c3624', '#2a1d14'],
  ['#5a3f2c', '#483322', '#3e2c1e', '#221811'],
  ['#3e2b1f', '#312218', '#2a1d15', '#18110c'],
].map((r) => r.map(hex));
/** The dark at the back of a shelf, behind and over the books. */
export const LB_BACK = ['#1e1610', '#160f0b', '#0f0b09'].map(hex);
/**
 * THE BOOKS' LEATHERS AND CLOTHS, each lit, body, shade: oxblood, bottle green, navy, tan calf, black, vellum, slate
 * cloth, a dull violet.
 */
export const LB_LEATHER = [
  ['#7c3d33', '#622e27', '#46211d'],
  ['#536444', '#3f4e34', '#2d3926'],
  ['#45526e', '#343f57', '#262e40'],
  ['#9c7c54', '#7e6242', '#5c482f'],
  ['#3e383a', '#2c2729', '#1e1a1c'],
  ['#c4b690', '#aa9c78', '#887b5c'],
  ['#5f6973', '#4c555e', '#3a4148'],
  ['#55495f', '#433a4c', '#312a38'],
].map((r) => r.map(hex));
/** GILT (the bands on the spines, the brass fittings): dull candle gold; lit, body, dark. */
export const LB_GILT = ['#b39552', '#8c733f', '#5e4d2b'].map(hex);
/** THE STACKS' BOARDS, dark oak: the gap, shade, body, body, lit. */
export const LB_BOARD = ['#1a130e', '#34261a', '#402f21', '#4b3828', '#5d4632'].map(hex);
/** THE READING ROOM'S PARQUET: walnut (shade, body, lit) and oak (shade, body, lit); the gap. */
export const LB_WALNUT = ['#2e2117', '#3d2c1f', '#4c3828'].map(hex);
export const LB_OAKP = ['#4f3f2c', '#604d36', '#735e44'].map(hex);
export const LB_GAP = hex('#150f0b');
/** THE HALLS' MARBLE: the pale (vein, shade, body, lit) and the black (body, shade, vein, lit); the joint. */
export const LB_PALE = ['#68655e', '#7e7b73', '#8a877e', '#9a978d'].map(hex);
export const LB_BLACK = ['#25252b', '#1e1e23', '#3a3a42', '#34343c'].map(hex);
export const LB_JOINT = hex('#121116');
/** THE GREAT CARPET: the indigo field (shade, body, lit), its border of dull gold (body, lit), its dull red lozenges, its threads where it is worn through. */
export const LB_CARPET = ['#1d2133', '#262b40', '#30364e'].map(hex);
export const LB_BORDER = ['#6c5a34', '#87713f'].map(hex);
export const LB_LOZENGE = hex('#5a2e2a');
export const LB_THREAD = ['#33364a', '#45475a'].map(hex);
/** THE SCRIPTORIUM'S FLAGS, cool grey: the joint, shade, body, body, lit. */
export const LB_FLAG = ['#2a2c30', '#4a4d52', '#56595e', '#62656a', '#74777b'].map(hex);
/** The Order's ink: body, its sheen. */
export const LB_INK = ['#0f0d13', '#24202b'].map(hex);
/** Paper: a page (lit, shade), its lines of writing; candle wax dripped (lit, shade); dust (shade, body). */
export const LB_PAGE = ['#cbc1a6', '#a59b82', '#6d6556'].map(hex);
export const LB_WAX = ['#bcab7c', '#94845d'].map(hex);
export const LB_DUST = ['#5a5148', '#6d655a'].map(hex);
/** Iron (the chains, the window's bars): dark, body, lit. */
export const LB_IRON = ['#1b1c20', '#34363c', '#555961'].map(hex);
/** The night in a window's panes, and the candlelight caught in them. */
export const LB_NIGHT = ['#13161f', '#1c212c', '#28303d', '#6a5f45'].map(hex);
/** THE SCRIPTORIUM'S STONE, dressed ashlar: by row, its lit edge, body, other body, the joint. */
export const LB_STONE = [
  ['#9a978c', '#87847a', '#7c7970', '#4f4d48'],
  ['#7c7a71', '#6d6b63', '#636159', '#403f3b'],
  ['#53524c', '#484741', '#403f3a', '#2a2a27'],
].map((r) => r.map(hex));

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile is (and so how its floor and the walls round it look). */
export const LB_ZONE = {
  /** The stacks: narrow aisles of dark oak boards between the shelves; bookcases to the dark, no gallery. */
  Stacks: 0,
  /** A great hall or a way between rooms: pale marble slabs, a small black square where four meet; bookcases with a gallery, and tall windows. */
  Hall: 1,
  /** The Reading Room (the Censor's): parquet in a basket weave, the great carpet over its middle; bookcases with a gallery. */
  Reading: 2,
  /** The scriptorium, where the Order binds the book: grey flags black with ink; stone walls, pigeonholes, writing blacked out. */
  Scriptorium: 3,
} as const;

export interface LibraryLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** What a walkable tile is (LB_ZONE); a hall where not said. */
  zone?: (tx: number, ty: number) => number;
  /** (art/low_stacks.ts, behind LOW_STACKS, off) The stacks' rows, painted low over the floor: under them the floor is their room's, as `zone` says. */
  rows?: (tx: number, ty: number) => boolean;
}

/**
 * How tall the walls stand over the floor (picture pixels: the game's own dungeon walls are 80, fading out over their
 * top 24): the shelves going up into the dark; where the wall begins to fade; the gallery's floor and its rail.
 */
export const LB_RISE = 124;
export const LB_FADE = 88;
export const LB_GALLERY = 54;
export const LB_RAIL = 70;
/** The base of cupboards under the shelves, and the shelves' spacing. */
const BASE = 20;
const SHELF = 17;

/** How far each place is from the nearest tile that `is` (tiles), held as a grid, 4 cells to a tile. */
function distanceTo(w: number, h: number, is: (tx: number, ty: number) => boolean): (x: number, y: number) => number {
  const K = 4;
  const W = w * K;
  const H = h * K;
  const d = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) d[j * W + i] = is(Math.floor(i / K), Math.floor(j / K)) ? 0 : 1e9;
  const D2 = Math.SQRT2;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const c = j * W + i;
      let v = d[c];
      if (i > 0) v = Math.min(v, d[c - 1] + 1);
      if (j > 0) {
        v = Math.min(v, d[c - W] + 1);
        if (i > 0) v = Math.min(v, d[c - W - 1] + D2);
        if (i + 1 < W) v = Math.min(v, d[c - W + 1] + D2);
      }
      d[c] = v;
    }
  }
  for (let j = H - 1; j >= 0; j--) {
    for (let i = W - 1; i >= 0; i--) {
      const c = j * W + i;
      let v = d[c];
      if (i + 1 < W) v = Math.min(v, d[c + 1] + 1);
      if (j + 1 < H) {
        v = Math.min(v, d[c + W] + 1);
        if (i + 1 < W) v = Math.min(v, d[c + W + 1] + D2);
        if (i > 0) v = Math.min(v, d[c + W - 1] + D2);
      }
      d[c] = v;
    }
  }
  return (x, y) => {
    const i = Math.max(0, Math.min(W - 1, Math.floor(x * K)));
    const j = Math.max(0, Math.min(H - 1, Math.floor(y * K)));
    return (d[j * W + i] - 0.5) / K;
  };
}

// ---------------------------------------------------------------------------------------------------
// THE FLOOR

/** What lies about: a book dropped, a loose page, the Order's ink, candle wax, dust. Null where nothing. */
function litter(x: number, y: number, px: number, py: number, wall: number, zone: number): RGB | null {
  const U = alongX(px, py);
  const V = alongY(px, py);
  // (in drifts where the shelves were pulled down or the Order worked, not all over)
  const drift = vnoise(x * 0.4 + 7, y * 0.4, 5140 + zone) > 0.58 ? 1 : 0.25;
  const inky = zone === LB_ZONE.Scriptorium ? 2.2 : 1;
  // THE ORDER'S INK, dripped and pooled: dark pools, a sheen on them
  const ink = fbm(x * 1.5 + 3, y * 1.5, 5131 + zone);
  if (ink > 0.88 - 0.05 * (inky - 1) && drift > 0.5) return mod(U - V, 17) < 2 && ink > 0.9 ? LB_INK[1] : LB_INK[0];
  const dx0 = Math.floor(px / 7);
  const dy0 = Math.floor(py / 5);
  if (hash(dx0, dy0, 5132 + zone) < 0.006 * drift * inky) {
    const ax = dx0 * 7 + 2;
    const ay = dy0 * 5 + 1;
    const r = 1 + Math.floor(hash(dx0, dy0, 5133) * 2);
    const dx = px - ax;
    const dy = py - ay;
    if (dx * dx + 3 * dy * dy <= r * r + 1) return dx < 0 && dy < 0 ? LB_INK[1] : LB_INK[0];
  }
  // DUST, thick along the shelves' feet (thickest in the stacks): grey grains
  if (wall < 0.45 && zone !== LB_ZONE.Scriptorium) {
    const much = (0.45 - wall) / 0.45 * (zone === LB_ZONE.Stacks ? 1 : 0.5);
    const g = hash(px >> 1, py, 5134);
    if (g < 0.22 * much) return g < 0.06 * much ? LB_DUST[1] : LB_DUST[0];
  }
  // CANDLE WAX dripped where a chandelier hangs over: pale gold drops, a pool now and then
  const wx = Math.floor(U / 160);
  const wy = Math.floor(V / 160);
  if (hash(wx, wy, 5135) < 0.3 && wall > 1.2) {
    const cx = wx * 160 + 50 + hash(wx, wy, 5136) * 60;
    const cy = wy * 160 + 50 + hash(wx, wy, 5137) * 60;
    const d = Math.hypot(U - cx, V - cy);
    if (d < 34) {
      const c0 = Math.floor(U / 5);
      const c1 = Math.floor(V / 5);
      if (hash(c0, c1, 5138) < 0.07 * (1 - d / 34) + 0.01) {
        const du = mod(U, 5);
        const dv = mod(V, 5);
        if (du < 3 && dv < 3) return du + dv < 2 ? LB_WAX[0] : LB_WAX[1];
      }
    }
  }
  // A BOOK DROPPED, lying on the floor along the grid: shut (its cover, the pages' edge along one side), or open, face
  // down, its two halves splayed
  const bx = Math.floor(U / 44);
  const by = Math.floor(V / 44);
  if (hash(bx, by, 5141 + zone) < (0.1 + (wall < 1.0 ? 0.08 : 0)) * drift) {
    const lu = U - (bx * 44 + 6 + Math.floor(hash(bx, by, 5142) * 16));
    const lv = V - (by * 44 + 6 + Math.floor(hash(bx, by, 5143) * 16));
    const turned = hash(bx, by, 5144) < 0.5;
    const a = turned ? lv : lu;
    const b = turned ? lu : lv;
    const L = hash(bx, by, 5145) < 0.6 ? 16 : 20;
    const Wd = L === 16 ? 11 : 14;
    const C = LB_LEATHER[Math.floor(hash(bx, by, 5146) * LB_LEATHER.length)];
    const open = hash(bx, by, 5147) < 0.35;
    if (a >= 0 && a < L && b >= 0 && b < Wd + (open ? Wd : 0)) {
      if (open) {
        // face down: two covers, the spine between them; the pages' edges at the ends
        if (Math.abs(b - Wd) < 1.5) return C[2];
        if (a < 1.5 || a >= L - 1.5) return LB_PAGE[1];
        return b < Wd ? C[1] : C[0];
      }
      // shut: the pages' edge along the far side, the spine along the near, the cover between, lit along its top
      if (b >= Wd - 2) return mod(a, 3) === 0 ? LB_PAGE[1] : LB_PAGE[0];
      if (b < 2) return C[2];
      if (a < 1.5) return C[0];
      // gilt on the cover now and then
      if (hash(bx, by, 5148) < 0.4 && (Math.abs(a - 3) < 0.8 || Math.abs(a - L + 4) < 0.8) && b > 3 && b < Wd - 3) return LB_GILT[1];
      return C[1];
    }
  }
  // A LOOSE PAGE, lying on the floor at a slant, lines of writing on it
  const sx = Math.floor(px / 21);
  const sy = Math.floor(py / 12);
  if (hash(sx, sy, 5171 + zone) < (0.03 + (zone === LB_ZONE.Scriptorium ? 0.03 : 0)) * (0.5 + drift)) {
    const ax = sx * 21 + 3 + Math.floor(hash(sx, sy, 5172) * 7);
    const ay = sy * 12 + 3 + Math.floor(hash(sx, sy, 5173) * 3);
    const dx = px - ax;
    const dy = py - ay;
    const slope = Math.floor(dx / 2) * (hash(sx, sy, 5174) < 0.5 ? 1 : -1);
    const e = dy - slope;
    if (dx >= 0 && dx < 9 && e >= 0 && e < 4) {
      if (e === 3) return LB_PAGE[1];
      if ((e === 1 || e === 2) && dx > 1 && dx < 8 && (dx + e) % 3 !== 0) return LB_PAGE[2];
      return LB_PAGE[0];
    }
  }
  return null;
}

/** Darker in toward the walls, where the lamplight does not reach. */
function toWall(c: RGB, x: number, y: number, wall: number, seed: number): RGB {
  return wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, seed) ? mixc(c, LB_DEEP, 0.3) : c;
}

/** THE STACKS' BOARDS: dark oak laid along x, each board its own tone, butt joints, nail heads; worn paler where feet go. */
function boards(x: number, y: number, px: number, py: number, wall: number): RGB {
  const R = LB_BOARD;
  const U = alongX(px, py);
  const V = alongY(px, py);
  const BW = 16;
  const j = Math.floor(V / BW);
  const v = mod(V, BW);
  const len = 90 + Math.floor(hash(j, 0, 5101) * 4) * 30;
  const off = Math.floor(hash(j, 1, 5101) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const h0 = hash(i, j, 5102);
  let t = h0 > 0.72 ? 3 : h0 < 0.22 ? 1 : 2;
  if (wall > 0.9 && vnoise(x * 0.5, y * 0.5, 5103) > 0.5) t = Math.min(4, t + 1);
  let c = R[t];
  if (h0 > 0.5 && Math.abs(v - 7 - Math.floor(h0 * 5)) < 1 && mod(U + h0 * 90, 61) < 34) c = R[Math.max(1, t - 1)];
  if (v < 2) c = R[0];
  else if (v < 4 && t < 4) c = mixc(c, R[Math.min(4, t + 1)], 0.6);
  if (u < 2) c = R[0];
  if ((Math.abs(u - 7) < 1 || Math.abs(u - len + 7) < 1) && (Math.abs(v - 5) < 1 || Math.abs(v - BW + 4) < 1)) c = R[0];
  return toWall(c, x, y, wall, 5104);
}

/** THE HALLS' MARBLE: great pale slabs, one to a tile, a small square of black marble set where four meet; veined, cracked here and there, worn. */
function marble(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 64;
  const i = Math.floor(U / S);
  const j = Math.floor(V / S);
  const u = mod(U, S);
  const v = mod(V, S);
  // the black square where four slabs meet, its lit edge along the top
  const cu = u > S / 2 ? u - S : u;
  const cv = v > S / 2 ? v - S : v;
  const K = 8;
  if (Math.abs(cu) < K && Math.abs(cv) < K) {
    if (Math.abs(cu) > K - 2 || Math.abs(cv) > K - 2) return toWall(LB_JOINT, x, y, wall, 5111);
    const vn = fbm(U * 0.08, V * 0.08, 5116);
    return toWall(Math.abs(vn - 0.5) < 0.03 ? LB_BLACK[2] : cv < -K + 3 ? LB_BLACK[3] : LB_BLACK[1], x, y, wall, 5111);
  }
  if (u < 2 || v < 2) return toWall(LB_JOINT, x, y, wall, 5111);
  const h0 = hash(i, j, 5112);
  // the veins: a ridged noise running through each slab its own way
  const vn = fbm(U * 0.03 + i * 3.1, V * 0.022 + j * 1.7 + h0 * 5, 5113);
  const vein = Math.abs(vn - 0.5) < 0.02;
  let c = vein ? LB_PALE[0] : h0 > 0.7 ? LB_PALE[3] : h0 < 0.3 ? LB_PALE[1] : LB_PALE[2];
  // the polish catching the light along the slab's upper edge
  if (v < 3 && !vein) c = LB_PALE[3];
  // worn and grimed where feet go
  if (vnoise(x * 0.6, y * 0.6, 5114) > 0.6) c = mixc(c, LB_PALE[1], 0.5);
  // cracked across, now and then
  if (h0 > 0.86 && Math.abs(u - v * 0.8 - 6 - h0 * 14) < 0.8) c = LB_JOINT;
  return toWall(c, x, y, wall, 5115);
}

/** THE READING ROOM'S PARQUET: walnut and oak in a basket weave, squares of four strips laid each way by turns. */
function parquet(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 32;
  const i = Math.floor(U / S);
  const j = Math.floor(V / S);
  const u = mod(U, S);
  const v = mod(V, S);
  const across = ((i + j) & 1) === 0;
  const R = ((i + j) & 1) === 0 ? LB_WALNUT : LB_OAKP;
  const a = across ? v : u;
  const b = across ? u : v;
  const strip = Math.floor(a / 8);
  const sa = mod(a, 8);
  if (sa < 1.5) return toWall(LB_GAP, x, y, wall, 5121);
  if (u < 1.5 || v < 1.5) return toWall(LB_GAP, x, y, wall, 5121);
  const h0 = hash(i * 4 + strip, j, 5122);
  let c = R[h0 > 0.7 ? 2 : h0 < 0.3 ? 0 : 1];
  // the strip's grain along it, and its lit edge
  if (sa < 2.5) c = R[2];
  else if (h0 > 0.4 && mod(b + h0 * 40, 13) < 1.5 && sa > 3) c = R[0];
  // worn dull down the room's middle, where the carpet does not reach
  if (wall > 1.4 && vnoise(x * 0.5, y * 0.5, 5123) > 0.6) c = mixc(c, R[0], 0.4);
  return toWall(c, x, y, wall, 5124);
}

/** THE GREAT CARPET over the Reading Room's middle, `inn` tiles in from its edge: indigo, a border of dull gold, lozenges of dull red; worn to the threads down its middle, ink spilled on it. Null where it does not lie. */
function carpet(x: number, y: number, px: number, py: number, wall: number): RGB | null {
  const EDGE = 2.8;
  const inn = wall - EDGE + 0.12 * (vnoise(x * 3, y * 3, 5130) - 0.5);
  if (inn < 0) return null;
  const U = alongX(px, py);
  const V = alongY(px, py);
  // the fringe at its edge, then the border: a band of dull gold between two dark lines, lozenges of dull red along it
  if (inn < 0.06) return mod(U + V, 4) < 2 ? LB_BORDER[0] : null;
  if (inn < 0.1 || (inn > 0.4 && inn < 0.44)) return LB_CARPET[0];
  if (inn < 0.4) {
    const bd = Math.abs(mod(U, 24) - 12) + Math.abs(mod(V, 24) - 12);
    if (bd < 6) return bd < 2.5 ? LB_BORDER[1] : LB_LOZENGE;
    return inn < 0.14 || inn > 0.36 ? LB_BORDER[1] : LB_BORDER[0];
  }
  // the field: indigo, woven in squares (a lighter line along their edges), a lozenge of dull red in each, ringed in dull gold
  const S = 32;
  const cu = mod(U, S);
  const cv = mod(V, S);
  const dd = Math.abs(cu - S / 2) + Math.abs(cv - S / 2);
  let c = dd < 5 ? LB_LOZENGE : dd < 7 ? LB_BORDER[0] : cu < 2 || cv < 2 ? LB_CARPET[2] : LB_CARPET[1];
  if (dd < 1.5) c = LB_BORDER[1];
  // worn through to its grey threads where the most feet went
  const worn = vnoise(x * 0.9 + 4, y * 0.9, 5132) - 0.7 + (inn > 1.2 ? 0.03 : 0);
  if (worn > 0) {
    const g = hash(px >> 1, py, 5133);
    if (g < worn * 3) c = g < worn ? LB_THREAD[1] : LB_THREAD[0];
  }
  // the pile's nap: a faint lit stroke now and then, and darker where it is trodden flat
  if (hash(px, py >> 1, 5134) < 0.04) c = mixc(c, LB_CARPET[2], 0.6);
  else if (hash(px >> 1, py, 5135) < 0.05) c = LB_CARPET[0];
  return c;
}

/** THE SCRIPTORIUM'S FLAGS: grey slabs, black with the Order's ink where it was spilled working, spattered all over. */
function scriptorium(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SV = 30;
  const j = Math.floor(V / SV);
  const len = 40 + Math.floor(hash(j, 0, 5151) * 3) * 8;
  const off = Math.floor(hash(j, 1, 5151) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const v = mod(V, SV);
  const h0 = hash(i, j, 5152);
  let t = h0 > 0.7 ? 3 : h0 < 0.25 ? 1 : 2;
  if (wall > 1.0 && vnoise(x * 0.45, y * 0.45, 5153) > 0.55) t = Math.min(4, t + 1);
  let c = LB_FLAG[t];
  if (u < 2 || v < 2) c = LB_FLAG[0];
  else if (u < 3 || v < 3) c = LB_FLAG[Math.min(4, t + 1)];
  else if (u >= len - 2 || v >= SV - 2) c = LB_FLAG[1];
  // the ink: spatters flung from the pens, small dark dots everywhere
  if (hash(px, py, 5154) < 0.01 + 0.06 * cl01(vnoise(x * 0.8, y * 0.8, 5155) - 0.55)) c = mixc(c, LB_INK[0], 0.8);
  // A SPILL of it, run out of a dropped pot across the slabs: long and flat, its edge ragged, a sheen along it
  const pi = Math.floor(U / 120);
  const pj = Math.floor(V / 120);
  if (hash(pi, pj, 5156) < 0.3) {
    const cx = pi * 120 + 30 + hash(pi, pj, 5157) * 50;
    const cy = pj * 120 + 30 + hash(pi, pj, 5158) * 50;
    const turned = hash(pi, pj, 5165) < 0.5;
    const a = turned ? V - cy : U - cx;
    const b = turned ? U - cx : V - cy;
    const len = 22 + hash(pi, pj, 5160) * 16;
    const half = (6 + 4 * Math.cos((a / len) * Math.PI * 0.5)) * (a < 0 ? 1 : 1 - 0.4 * (a / len));
    const edge = half + 4 * (vnoise(U * 0.12, V * 0.12, 5159) - 0.5) - Math.abs(b);
    if (a > -len * 0.4 && a < len && edge > 0) return edge > 3 && mod(a - b, 13) < 1.5 ? LB_INK[1] : LB_INK[0];
    if (a > -len * 0.4 && a < len && edge > -1.5) c = mixc(c, LB_INK[0], 0.55);
  }
  // A QUILL dropped: a pale feather, its shaft dark at the tip
  const qi = Math.floor(U / 70);
  const qj = Math.floor(V / 70);
  if (hash(qi, qj, 5161) < 0.25) {
    const qu = U - (qi * 70 + 20 + hash(qi, qj, 5162) * 20);
    const qv = V - (qj * 70 + 20 + hash(qi, qj, 5163) * 20);
    if (qu >= 0 && qu < 22 && Math.abs(qv - qu * 0.3) < 1.2) return qu < 4 ? LB_INK[0] : LB_PAGE[1];
    if (qu >= 8 && qu < 22 && qv - qu * 0.3 >= 1.2 && qv - qu * 0.3 < 1.2 + 3 * Math.sin(((qu - 8) / 14) * Math.PI)) return LB_PAGE[0];
  }
  return toWall(c, x, y, wall, 5164);
}

// ---------------------------------------------------------------------------------------------------
// THE WALLS: the bookcases

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);

/** A bay of the bookcases (between two uprights), one to every 56 picture pixels, steady from run to run. */
interface Bay {
  key: number;
  /** Where along it (0 at its left edge), and how wide. */
  u: number;
  w: number;
  /** 0 books, 1 the Order's ink slashed across them, 2 chained books, 3 a rolling ladder, 4 shelves pulled empty, 5 a tall window (the halls only). */
  kind: number;
}
const BAY = 56;
function bayAt(px: number, zone: number): Bay {
  const k = Math.floor(px / BAY);
  const h = hash(k, 0, 5401);
  let kind = h < 0.16 ? 1 : h < 0.3 ? 2 : h < 0.4 ? 3 : h < 0.52 ? 4 : 0;
  if (zone === LB_ZONE.Hall && hash(k, 1, 5401) < 0.22) kind = 5;
  if (zone === LB_ZONE.Stacks && kind === 3 && hash(k, 2, 5401) < 0.5) kind = 2;
  return { key: k, u: px - k * BAY, w: BAY, kind };
}

/** The pattern of a run of books 14 pixels wide: each book's width. */
const RUNS = [
  [3, 4, 3, 4],
  [2, 3, 4, 5],
  [4, 5, 5],
  [3, 3, 4, 4],
  [5, 4, 3, 2],
  [2, 2, 3, 3, 4],
  [4, 3, 3, 4],
  [3, 5, 3, 3],
] as const;

/** Which book stands at `px` on shelf `r`: its number (steady), where in it (from its left), and its width. */
function bookAt(px: number, r: number): { id: number; at: number; w: number } {
  const g = Math.floor(px / 14);
  const run = RUNS[Math.floor(hash(g, r, 5411) * RUNS.length)];
  let u = px - g * 14;
  for (let i = 0; i < run.length; i++) {
    if (u < run[i]) return { id: g * 8 + i, at: u, w: run[i] };
    u -= run[i];
  }
  return { id: g * 8, at: 0, w: 1 };
}

/** THE SHELVES at height `v` (picture pixels over the floor), along `px`: the books on them, the boards, the shelf's back. `sv` from the shelves' first board. */
function shelves(sv: number, px: number, row: number, bay: Bay, r0: number): RGB {
  const W = LB_WOOD[row];
  const r = Math.floor(sv / SHELF) + r0;
  const s = mod(sv, SHELF);
  // the shelf's board: its front edge lit along the top, dark along the bottom
  if (s < 2) return s === 1 ? W[0] : W[3];
  const book = bookAt(px, r);
  const key = book.id * 31 + r;
  const h = 9 + Math.floor(hash(key, 1, 5412) * 6) + (bay.kind === 2 ? 1 : 0);
  const b = s - 2;
  const pulled = bay.kind === 4 ? 0.55 : 0.06;
  const gone = hash(key, 2, 5413) < pulled;
  // A BOOK LYING FLAT on a shelf pulled empty: a stack of one or two, their pages' edges toward you
  if (bay.kind === 4 && gone) {
    const lay = hash(Math.floor(px / 12), r, 5414);
    if (lay < 0.45 && b < 3 + (lay < 0.2 ? 3 : 0)) {
      const C = LB_LEATHER[Math.floor(hash(Math.floor(px / 12), r + b, 5415) * LB_LEATHER.length)];
      const which = mod(b, 3);
      return which === 2 ? C[0] : mod(px, 12) < 2 ? C[2] : which === 0 ? C[2] : LB_PAGE[mod(px, 3) === 0 ? 1 : 0];
    }
  }
  if (gone || b >= h) {
    // the dark back of the shelf; the board above casting its shade down onto the books' tops
    return LB_BACK[row === 2 ? 2 : b > SHELF - 6 ? 2 : 1];
  }
  const C = LB_LEATHER[Math.floor(hash(key, 3, 5416) * LB_LEATHER.length)];
  // the spine: lit along its left, shaded along its right, the headband along its top
  let c = book.at === 0 ? C[0] : book.at === book.w - 1 ? C[2] : C[1];
  if (row === 2) c = book.at === 0 ? C[1] : C[2];
  if (b === h - 1) c = mixc(C[0], LB_PAGE[1], 0.3);
  // gilt bands near its head and foot, a label between
  if (book.w > 2 && book.at > 0 && book.at < book.w - 1) {
    if (hash(key, 4, 5417) < 0.55 && (b === 2 || b === h - 3)) c = LB_GILT[row === 2 ? 2 : 1];
    else if (hash(key, 5, 5417) < 0.25 && b >= h - 7 && b < h - 4) c = row === 2 ? LB_PAGE[2] : LB_PAGE[1];
  }
  // THE CHAINED BOOKS: a chain from each book's foot hanging in a loop to the rod along the shelf's front
  if (bay.kind === 2 && b < 4) {
    if (b === 0) return mod(px, 2) === 0 ? LB_IRON[2] : LB_IRON[1];
    if (book.at === Math.floor(book.w / 2) && b < 4) return b % 2 === 1 ? LB_IRON[2] : LB_IRON[0];
  }
  return c;
}

/** THE GALLERY at height `gv` over its floor: its beam (a cornice of dark wood, a gilt bead), the balustrade, its rail. */
function gallery(gv: number, px: number, row: number, under: RGB): RGB {
  const W = LB_WOOD[row];
  // the beam the gallery stands on: its underside dark, its face, a gilt bead, its lit top edge
  if (gv < 2) return W[3];
  if (gv < 7) return gv === 4 ? LB_GILT[row === 2 ? 2 : 1] : W[gv === 6 ? 0 : 1];
  // the balustrade: turned posts against the books behind
  const RT = LB_RAIL - LB_GALLERY;
  if (gv >= RT - 3 && gv < RT) return gv === RT - 1 ? W[0] : W[gv === RT - 3 ? 3 : 1];
  if (gv < RT - 3) {
    const pu = mod(px, 7);
    const bulge = gv > 10 && gv < 13 ? 1 : 0;
    if (pu < 2 + bulge) return pu === 0 ? W[0] : W[2];
    return mixc(under, LB_DEEP, 0.15);
  }
  return under;
}

/** THE STONE of the scriptorium's walls, dressed ashlar, writing on it blacked out by the Order; pigeonholes of scrolls bay by bay. */
function stoneWall(v: number, px: number, row: number, bay: Bay): RGB {
  const S = LB_STONE[row];
  const W = LB_WOOD[row];
  // a dado of dark wood, panelled, to the rail
  if (v < 26) {
    if (v < 3) return W[3];
    if (v >= 23) return v === 25 ? W[0] : W[v === 23 ? 3 : 1];
    const pu = mod(px, 28);
    if (pu < 3) return pu === 0 ? W[0] : W[2];
    if (pu === 3 || v === 22) return W[3];
    return W[1];
  }
  // PIGEONHOLES: a grid of square holes in a wooden frame, a scroll's rolled end in most of them
  if (bay.kind === 2 || bay.kind === 4) {
    const top = 26 + 6 * 9;
    if (v < top && bay.u > 6 && bay.u < BAY - 2) {
      const cu = mod(bay.u - 6, 9);
      const cv = mod(v - 26, 9);
      if (cu < 2 || cv < 2) return cu === 0 || cv === 0 ? W[0] : W[2];
      const has = hash(Math.floor((bay.u - 6) / 9), Math.floor((v - 26) / 9) + bay.key * 9, 5431) < 0.75;
      const du = cu - 5;
      const dv = cv - 5;
      if (has && du * du + dv * dv <= 7) return du * du + dv * dv <= 1 ? LB_PAGE[2] : du + dv < 0 ? LB_PAGE[0] : LB_PAGE[1];
      return LB_BACK[row === 2 ? 2 : 1];
    }
  }
  // the ashlar: courses 12 high, blocks offset course by course
  const course = Math.floor((v - 26) / 12);
  const cv = mod(v - 26, 12);
  const off = (course & 1) * 18;
  const bu = mod(px + off, 36);
  let c = cv === 11 || bu === 0 ? S[3] : cv === 10 || bu === 1 ? S[0] : hash(Math.floor((px + off) / 36), course, 5432) > 0.5 ? S[1] : S[2];
  // WRITING ON IT, BLACKED OUT: lines of painted letters, each line struck over with a bar of the Order's ink
  if (bay.kind === 1 || bay.kind === 3) {
    const x0 = 8;
    const lu = bay.u - x0;
    if (lu >= 0 && lu < 40 && v >= 40 && v < 74) {
      const line = Math.floor((74 - v) / 7);
      const lv = mod(74 - v, 7);
      const ink = lv >= 2 && lv < 5 && mod(lu, 4) < 2 + (hash(lu, line, 5433) < 0.3 ? 1 : 0) && lu < 40 - hash(line, 1, 5434) * 14;
      if (ink) c = mixc(LB_INK[0], c, 0.3);
      // the bar: a black block over the line, its ends ragged
      const barEnd = 40 - hash(line, 2, 5435) * 12;
      if (hash(line, 3 + bay.key, 5436) < 0.7 && lv >= 1 && lv < 6 && lu < barEnd + (vnoise(v * 0.5, bay.key, 5437) - 0.5) * 4) c = mod(lu + v, 13) === 0 ? LB_INK[1] : LB_INK[0];
    }
  }
  return c;
}

/** THE FAR WALLS: the bookcases (the stone of the scriptorium), what is in each bay, the gallery, fading into the dark above. */
function wallFace(zone: number, shade: number, v: number, px: number): RGB {
  const row = rowOf(shade + (hash(Math.floor(px / BAY), 9, 5402) - 0.5) * 0.1);
  const bay = bayAt(px, zone);
  const u = bay.u;
  const W = LB_WOOD[row];
  const fade = (c: RGB): RGB => (v > LB_FADE ? mixc(c, LB_DEEP, 0.25 + 0.72 * cl01((v - LB_FADE) / (LB_RISE - LB_FADE))) : c);
  if (zone === LB_ZONE.Scriptorium) return fade(stoneWall(v, px, row, bay));
  // the skirting
  if (v < 3) return v === 2 ? W[0] : W[3];
  // THE UPRIGHTS between the bays, floor to the dark: lit along the left, a moulding, dark along the right
  if (u < 4) return fade(u === 0 ? W[0] : u === 3 ? W[3] : W[1]);
  // --- A TALL WINDOW (the halls): round-headed, leaded, set back in the wall; the night in its panes
  if (bay.kind === 5) {
    const cx = BAY / 2 + 2;
    const half = 16;
    const sill = BASE + 6;
    const springs = 52;
    const du = u - cx;
    const head = springs + Math.sqrt(Math.max(0, half * half - du * du)) * 0.9;
    if (v >= sill - 3 && v < head + 3) {
      const inside = Math.abs(du) < half && v >= sill && v < head;
      if (!inside) return fade(v < sill ? (v === sill - 1 ? W[0] : W[2]) : du < 0 ? W[1] : W[3]);
      // the leading: small diamond panes; the bars the Order set in it
      if (mod(du + half, 11) === 5) return fade(du < 0 ? LB_IRON[2] : LB_IRON[1]);
      const d1 = mod(du + (v - sill), 8);
      const d2 = mod(du - (v - sill), 8);
      if (d1 === 0 || d2 === 0) return fade(LB_IRON[0]);
      const pane = hash(Math.floor((du + v) / 8), Math.floor((du - v) / 8), 5403 + bay.key);
      const lit = pane > 0.86;
      return fade(lit ? LB_NIGHT[3] : v > head - 8 ? LB_NIGHT[0] : pane > 0.5 ? LB_NIGHT[2] : LB_NIGHT[1]);
    }
  }
  // THE BASE: cupboards under the shelves, two panelled doors a bay, brass pulls; a ledge along their top
  if (v < BASE) {
    if (v >= BASE - 3) return v === BASE - 1 ? W[0] : v === BASE - 3 ? W[3] : W[1];
    const half = (BAY - 4) / 2;
    const du = mod(u - 4, half);
    if (du < 2 || v < 5) return du === 0 ? W[3] : W[0];
    if (du === 2 || v === BASE - 4) return W[3];
    if (du === half - 1 || v === 5) return W[row === 2 ? 2 : 0];
    if (Math.abs(du - (u - 4 < half ? half - 4 : 4)) < 1 && Math.abs(v - 11) < 1) return LB_GILT[row === 2 ? 2 : 0];
    return W[row === 2 ? 2 : 1];
  }
  const galleried = zone === LB_ZONE.Hall || zone === LB_ZONE.Reading;
  let c: RGB;
  if (galleried && v >= LB_GALLERY) {
    // the shelves above the gallery, behind its balustrade
    const up = shelves(v - LB_RAIL, px, row, bay.kind === 3 ? { ...bay, kind: 0 } : bay, 20);
    c = gallery(v - LB_GALLERY, px, row, v >= LB_RAIL ? up : mixc(up, LB_DEEP, 0.2));
  } else {
    c = shelves(v - BASE, px, row, bay, 0);
  }
  // THE ORDER'S INK slashed across the spines: a great black brush stroke, its drips running down
  if (bay.kind === 1) {
    const mid = 24 + hash(bay.key, 3, 5404) * 22;
    const slope = (hash(bay.key, 4, 5404) - 0.5) * 0.9;
    const along = mid + (u - BAY / 2) * slope + 2 * Math.sin(u * 0.3 + bay.key);
    const thick = 3.2 + 1.5 * Math.sin((u / BAY) * Math.PI);
    if (u > 6 && u < BAY - 2 && Math.abs(v - along) < thick) c = mod(u + v, 9) === 0 ? LB_INK[1] : LB_INK[0];
    // the drips: from the stroke's lower edge, running down, a bead at the end
    const dk = Math.floor(u / 5);
    const dl = hash(dk, bay.key, 5405);
    if (u > 6 && u < BAY - 2 && mod(u, 5) === 2 && dl < 0.55 && v < along && v > along - thick - 3 - dl * 18) c = LB_INK[0];
  }
  // THE ROLLING LADDER: two rails hooked to a rod high up, its foot out on the floor, rungs; its wood lit
  if (bay.kind === 3) {
    const cx = BAY / 2;
    const top = galleried ? LB_GALLERY - 2 : 74;
    const lean = (v / top) * 3;
    const l = u - (cx - 9 + lean);
    const rr = u - (cx + 7 + lean);
    if (v < top + 1 && (Math.abs(l) < 1.2 || Math.abs(rr) < 1.2)) return fade(l < 0 || rr < 0 ? W[0] : W[2]);
    if (v < top - 2 && l > 0 && rr < 0 && mod(v, 9) < 2) return fade(mod(v, 9) === 1 ? W[0] : W[2]);
    // the rod it rolls on, high along the bay, brass
    if (Math.abs(v - (galleried ? LB_GALLERY - 3 : 72)) < 1.2) return fade(LB_GILT[row === 2 ? 2 : 1]);
  }
  return fade(c);
}

/** THE TOP: the bookcases' tops seen from above, a lit edge of dark wood, then the dark over the rooms. */
function topAt(px: number, py: number, back: number): RGB {
  if (back < 0.05) return LB_WOOD[0][1];
  if (back < 0.09) return LB_WOOD[1][3];
  const r = hash(px >> 1, py, 5431);
  const c = r < 0.85 ? LB_DEEP : mixc(LB_DEEP, LB_WOOD[2][2], 0.15);
  return mixc(c, LB_DEEP, cl01(back));
}

/** A near wall's face, in shadow, cut down (his rule for near cliffs): the cupboards and the shelves over them, dark. */
function nearFace(zone: number, v: number, px: number): RGB {
  const bay = bayAt(px, zone);
  const c = zone === LB_ZONE.Scriptorium ? stoneWall(v, px, 2, bay) : v < BASE ? LB_WOOD[2][mod(px, 26) < 2 ? 3 : 1] : shelves(v - BASE, px, 2, { ...bay, kind: bay.kind === 5 || bay.kind === 3 ? 0 : bay.kind }, 0);
  return mixc(c, LB_DEEP, 0.45);
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

export function greatLibraryLook(land: LibraryLand): TerrainLook {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const zoneAt = (tx: number, ty: number): number => (land.zone && (isFloor(tx, ty) || (!!land.rows && inMap(tx, ty) && land.rows(tx, ty))) ? land.zone(tx, ty) : LB_ZONE.Hall);
  // how far each place is from a wall
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty));
  // how far each place is from the edge of its own room (the Reading Room's carpet keeps to the room, off its doorways)
  const reading = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty) || zoneAt(tx, ty) !== LB_ZONE.Reading);
  /** The room a wall's face looks into: the floor tile at its foot (out from it toward the eye). */
  const roomOf = (shade: number, x: number, y: number): number => {
    const fx = shade < 0 ? x + 0.3 : x;
    const fy = shade < 0 ? y : y + 0.3;
    return zoneAt(Math.floor(fx), Math.floor(fy));
  };
  /** The room nearest a near wall's edge (just in from it, away from the eye). */
  const nearRoom = (x: number, y: number): number => {
    for (const [dx, dy] of [[-0.3, -0.3], [-0.3, 0], [0, -0.3]] as const) if (isFloor(Math.floor(x + dx), Math.floor(y + dy))) return zoneAt(Math.floor(x + dx), Math.floor(y + dy));
    return LB_ZONE.Hall;
  };
  return quietTerrain({
    rise: LB_RISE,
    near: 40,
    // the edges straight, as walls are
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 151,
    floor: (x, y, px, py) => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const z = zoneAt(tx, ty);
      const wd = wall(x, y);
      if (z === LB_ZONE.Reading) {
        const rug = carpet(x, y, px, py, reading(x, y));
        if (rug) {
          // (on the carpet only ink and a dropped page or book; no dust, no wax)
          const left = litter(x, y, px, py, 9, z);
          return left && left !== LB_WAX[0] && left !== LB_WAX[1] ? left : rug;
        }
      }
      const left = litter(x, y, px, py, wd, z);
      if (left) return left;
      if (z === LB_ZONE.Stacks) return boards(x, y, px, py, wd);
      if (z === LB_ZONE.Reading) return parquet(x, y, px, py, wd);
      if (z === LB_ZONE.Scriptorium) return scriptorium(x, y, px, py, wd);
      return marble(x, y, px, py, wd);
    },
    face: (shade, v, px, _py, x, y) => wallFace(roomOf(shade, x, y), shade, v, px),
    top: (_x, _y, px, py, back) => topAt(px, py, back),
    nearFace: (v, px, _py, x, y) => nearFace(nearRoom(x, y), v, px),
    brow: (c) => mixc(c, LB_WOOD[0][0], 0.3),
    foot: [0.45, 0.25],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.32, 0.2] },
  });
}

// (FLOOR 15'S STACKS ONE BLOCK HIGH, art/low_stacks.ts, behind LOW_STACKS, off: the bookcases' own shelves, bays and light, for its low rows; nothing else here changed)
export { shelves as libraryShelves, bayAt as libraryBayAt, rowOf as libraryRowOf };
