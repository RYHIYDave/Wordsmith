// FLOOR 4, THE AMALGAMATION'S FLOOR: THE BURIED CHAPEL OF BONES, LOOK A WITH B'S BREAK-IN, ITS PIECES READY FOR THE GAME (the
// art chat, 2 Nov 2026). Behind the switch CHAPEL, off; nothing of the game imports it until the main chat puts it in.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. His pick for floor
// 4: “Buried chapel of bones”. Of its three looks (docs/mockups/floor4_look), asked which, 2 Nov 2026: “I feel like it needs to
// be B for the story, but A is so good I’m torn”; offered both, his pick by 12:29: “A with B's break-in (Recommended)”, offered
// as: candles in the niches all through; near the way in, one or two walls burst open with the mine's rock, timber props and a
// miner's lantern. The story told where you enter. (His gate: art/chapel_gate.ts.)
//
// WHAT IS HERE, each in the game's own measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32), anchored as
// the game's own are:
//   floor(tx, ty)    THE WORN FLAGS of the chapel's cool grey stone, laid on the world (sixteen pictures, every four tiles)
//   tiles            floor tiles laid over them: grave slabs (one tile; two tiles along x and along y, a head and a foot),
//                    bone dust (in a drift; at a wall's foot along x, along y), bone chips; where the mine broke in, rubble,
//                    earth spilled
//   faceLeft/Right   THE CHAPEL'S WALL a tile at a time, as the game lays walls (turned to screen-left and lit along x, to
//                    screen-right and in shade along y): 80 high as floor 4's walls are, the top fading into the dark as the
//                    game's; a PILASTER every two tiles, the RIBS OF THE VAULT springing from its capital into the dark; TWO
//                    TIERS OF NICHES, the dead stacked in them (long bones' ends, a row of skulls); CANDLES on their sills
//                    (four frames: the flames move). `face(alongX, tx, ty, f)` picks them so the pilasters fall every two tiles
//   breakIn(alongX)  THE BREAK-IN, three tiles of wall burst open: the mine's raw rock through it, timber props shoring it, a
//                    miner's lantern hung on a prop (four frames); with its pieces (the rock spilled before it, a broken pew,
//                    a pew thrown down, a dropped pick) and the floor's rails' end
//   wayIn(alongX)    THE WAY IN FROM FLOOR 3: three tiles of wall with a round arch in it, a short stair coming down through it
//                    from the prison's passage (its black iron and dark stone giving way to the chapel's on the last steps)
//   hall             THE BOSS HALL, FLAT: its walls (the lower niches candlelit, a band of the dead stacked along them over),
//                    the cave to floor 5 in look A's colours (art/cave4.ts, its shape and its film unchanged), its piers
//   pieces           the chapel's own (candles on the floor, the break-in's, the hall's piers) and floor 4's own pieces, his
//                    yes already (art/floor4.ts), in look A's colours (their colours, not their shapes)
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game the renderer lays its darkness and cuts a hole where each
// light burns (render.ts, light), and what gives light is drawn over it: the candles', the lanterns', the way in's. What the
// main chat should place is in docs/mockups/floor4_look/README.md ("Made game-ready") and in CHAPEL_LIGHTS here; the light
// painted into the pictures he picked was the guide.
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to
// screen-right in shade); a dark base, the place a step quieter than the figures; nothing cyan (the friend's), nothing pink
// (the enemy's); fire an honest gold and orange; no cross, no skull over crossed bones, no carved words (floor 4's own rule).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Iso } from './isokit';
import { GRAIN, hash } from './kit';
import { EMBER } from './props';
import { SHINES } from './floorkit';
import type { Piece, PieceKind, Spot } from './floorkit';
import { ossuaryPieces } from './floor4';
import { CAVE_FRAMES, caveFilm } from './cave4';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const CHAPEL = { on: false };

// =================================================================================================
// MEASURES

const TW = 32 * GRAIN;
const TH = 16 * GRAIN;
const HALF = TW / 2;
/** How high floor 4's walls stand (picture pixels: the game's WALL_LOOK.tall, 40, at two to a game pixel), and how much of their top fades into the dark (its `fade`, 12). */
export const CHAPEL_WALL = 80;
export const CHAPEL_FADE = 24;
/** The game's four steps of a wall's top fading out (art/ground.ts, `put`): how much of each is there, from the top down. */
export const FADE_STEPS = [0.14, 0.38, 0.62, 0.84] as const;
/** A bay of the wall: two tiles, a pilaster at its start. */
export const BAY = 2;

// =================================================================================================
// LOOK A'S COLOURS (his pick): a cool grey stone, so that the warmth is the candles'; bone pale ivory. Five tones a material,
// its seam to its lit edge (the look's own, docs/mockups/floor4_look: PALS.candle)

type R5 = readonly [string, string, string, string, string];
export const STONE: R5 = ['#111015', '#1f1d25', '#2c2a33', '#3c3944', '#55515e'];
export const FLAGS: R5 = ['#0f0e12', '#1b1a20', '#26242c', '#33303a', '#47434f'];
export const SLAB: R5 = ['#121116', '#201e26', '#2d2a34', '#3c3844', '#534e5c'];
export const BONE: R5 = ['#1b1717', '#332c29', '#53493f', '#706352', '#8e7f69'];
/** The dead in the walls: the bone a step quieter, in the niches' shade (Colour 4: the place quieter than the figures and the words). */
const WALL_BONE: R5 = ['#1b1717', '#2f2926', '#4a4139', '#62574a', '#7a6c59'];
/** A candle in a niche: its stick in the niche's shade, its top lit by its flame. */
const NICHE_WAX = ['#564c3d', '#665a49'] as const;
const IRON: R5 = ['#0b0a0d', '#17151a', '#242128', '#35313a', '#524c56'];
export const WOOD: R5 = ['#150f0d', '#251a15', '#38281e', '#4c3727', '#634a34'];
export const ROCK: R5 = ['#100d0d', '#1d1817', '#2a2321', '#3a302c', '#4f433d'];
const EARTH: R5 = ['#0e0b0b', '#1a1514', '#251e1c', '#312825', '#3f3430'];
const DUST = ['#2a2522', '#3a332e', '#4c443c'] as const;
const WAX = ['#8c7c62', '#c8b694'] as const;
const SEAM = '#0a090d';
const BEYOND = '#060508';
/** Floor 3's own, on the way in's upper steps: the prison's charcoal stone and black iron (art/prison.ts, look B). */
const PRISON_STONE: R5 = ['#09090d', '#131319', '#1c1c24', '#282731', '#433f4c'];
const PRISON_IRON: R5 = ['#09090c', '#16161b', '#222128', '#323039', '#55505e'];
/** Fire: the props' own embers (so the renderer and the checks know it for fire). A candle's flame: white-gold at its heart, gold, orange at its foot. */
const FIRE = EMBER;
/** What shines of itself here: never shaded, never faded. */
const OWN = new Set<string>([...FIRE]);
/** Candle gold: the light the candles give (look A's warm light, its inner band). */
export const CANDLE_GOLD = '#dca44a';

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
const mixMemo = new Map<string, string>();
function mixC(a: string, b: string, k: number): string {
  const key = `${a}${b}${Math.round(k * 100)}`;
  const hit = mixMemo.get(key);
  if (hit) return hit;
  const [r0, g0, b0] = hexOf(a);
  const [r1, g1, b1] = hexOf(b);
  const out = toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
  if (mixMemo.size < 100000) mixMemo.set(key, out);
  return out;
}
/** A face turned to screen-right, in shade (as art/floorkit.ts `shaded`). */
const shaded = (c: string): string => (OWN.has(c) ? c : mixC(c, '#06051a', 0.32));

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
/** Plain smooth noise (not repeating): for what is painted once. */
function noise(x: number, y: number, k = 0): number {
  return noiseP(x, y, k, 1 << 20);
}
const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);

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
// LITTLE THINGS PAINTED PIXEL BY PIXEL: a skull face on, the end of a long bone, a candle's flame

/** A skull seen face on, 8 x 8: its dome lit from the upper left, its two sockets and nose dark, a row of teeth. */
const SKULL = ['..3443..', '.344443.', '34444332', '31144112', '31143112', '33331322', '.233332.', '..2.2.2.'];
/** The knob of a long bone seen end on, 4 x 3. */
const KNUCKLE = ['.43.', '4332', '.21.'];
/** A tone of the dead's bone at (i, j) of a skull drawn at its top-left (null: none); `down` tones darker. */
export function skullPx(i: number, j: number, down: number, ramp: R5 = BONE): string | null {
  if (j < 0 || j >= 8 || i < 0 || i >= 8) return null;
  const ch = SKULL[j][i];
  if (ch === '.') return null;
  if (ch === '1') return SEAM;
  return ramp[clampK(Number(ch) - down)];
}
function knucklePx(i: number, j: number, down: number, ramp: R5 = BONE): string | null {
  if (j < 0 || j >= 3 || i < 0 || i >= 4) return null;
  const ch = KNUCKLE[j][i];
  if (ch === '.') return null;
  return ramp[clampK(Number(ch) - down)];
}
/** A candle's flame, 2 wide and 4 high over its wick (j 0 its tip): white-gold at its heart, gold, orange at its foot; frame `f` sways its tip and stretches it. */
export function flamePx(i: number, j: number, f: number, seed: number): string | null {
  if (i < 0 || i > 1 || j < 0 || j > 3) return null;
  const k = (f + seed) & 3;
  if (j === 0) return k === 3 ? null : i === (k & 1) ? FIRE[3] : null;
  if (j === 1) return i === 0 ? FIRE[4] : FIRE[3];
  if (j === 2) return i === 0 ? FIRE[4] : FIRE[3];
  return FIRE[2];
}

// =================================================================================================
// THE FLOOR: big flags of the chapel's stone, worn on their edges toward the light, grime in drifts. Rows half a tile deep,
// each its own run of stones (half or three quarters of a tile long), so that the pattern repeats every four tiles.

const FLAG_LONG = [0.5, 2 / 3, 1] as const;
function flagAt(x: number, y: number): number {
  const row = Math.floor(y * 2);
  const rw = ((row % 8) + 8) % 8;
  const L = FLAG_LONG[Math.floor(hash(rw, 41, 2) * 3)];
  const n = Math.round(4 / L);
  const off = Math.floor(hash(rw, 41, 1) * n) * L * 0.5;
  const xx = x + off;
  const i = Math.floor(xx / L);
  const iw = ((i % n) + n) % n;
  const fu = xx / L - i;
  const fv = y * 2 - row;
  const su = 0.05 / L;
  if (fu < su || fv < 0.07) return -1;
  let k = 2;
  const tone = hash(iw, rw, 43);
  if (tone < 0.22) k = 1;
  else if (tone > 0.86) k = 3;
  if (fu < su + 0.07 || fv > 0.88) k += 1;
  if (fu > 0.93 || fv < 0.15) k -= 1;
  if (hash(iw, rw, 45) > 0.84) {
    const c = Math.abs(fv - 0.5 - (fu - 0.5) * (hash(iw, rw, 46) - 0.5) * 1.6 - Math.sin(fu * 9) * 0.06);
    if (c < 0.035) return -1;
  }
  return clampK(k);
}
/** The floor at a point of the world, before anything is laid over it. */
export function floorAt(x: number, y: number): string {
  const k = flagAt(x, y);
  let c = k < 0 ? FLAGS[0] : FLAGS[k];
  if (fbm4(x * 0.9, y * 0.9, 47) > 0.64) c = mixC(c, SEAM, 0.3);
  return c;
}

// =================================================================================================
// FLOOR TILES: GRAVE SLABS let into the flags (a raised border, a carved roundel at the head: no words, no cross); bone dust
// and chips; where the mine broke in, rubble and earth

interface Rect { x0: number; y0: number; x1: number; y1: number }
/** A grave slab's colour at a point of it (x, y in the slab's own tiles), or null. `head`: its head at the low end (along its length). */
function slabAt(x: number, y: number, s: Rect, along: 'x' | 'y', seed: number): string | null {
  if (x < s.x0 || x >= s.x1 || y < s.y0 || y >= s.y1) return null;
  const T = SLAB;
  const e = Math.min(x - s.x0, s.x1 - x, y - s.y0, s.y1 - y);
  if (e < 0.03) return SEAM;
  if (e < 0.11) {
    const towardLight = x - s.x0 < 0.11 || s.y1 - y < 0.11;
    return e < 0.05 ? T[towardLight ? 4 : 1] : T[3];
  }
  if (e < 0.13) return T[1];
  // the carved roundel at its head: a ring, a boss in it
  const [hx, hy] = along === 'y' ? [(s.x0 + s.x1) / 2, s.y0 + 0.36] : [s.x0 + 0.36, (s.y0 + s.y1) / 2];
  const r = Math.hypot(x - hx, y - hy);
  if (r < 0.2) {
    if (r > 0.15) return x - hx - (y - hy) < 0 ? T[4] : T[1];
    if (r > 0.12) return T[1];
    if (r < 0.05) return x - hx < -0.01 ? T[4] : T[3];
  }
  // a crack across some, worn
  const u = (x - s.x0) / (s.x1 - s.x0);
  const v = (y - s.y0) / (s.y1 - s.y0);
  const crack = Math.abs((along === 'y' ? v : u) - 0.66 - ((along === 'y' ? u : v) - 0.5) * 0.4 + Math.sin(u * 11 + seed) * 0.03);
  if (seed % 2 === 1 && crack < 0.012) return SEAM;
  const n = fbm4(x * 6, y * 6, 600 + seed);
  return n > 0.62 ? T[3] : n < 0.3 ? T[1] : T[2];
}
/** A slab tile: `long` tiles of it (1 or 2) along x or y; `part` which of them this is (0 the head). */
function slabTile(along: 'x' | 'y', long: number, part: number, seed: number): Sprite {
  const S: Rect = along === 'x' ? { x0: 0.1 - part, y0: 0.14, x1: long - 0.1 - part, y1: 0.86 } : { x0: 0.14, y0: 0.1 - part, x1: 0.86, y1: long - 0.1 - part };
  return tileOf((x, y) => slabAt(x, y, S, along, seed) ?? floorAt(x + 1 + part, y + 2));
}
/** Bone dust over the flags: in a drift (`at` none), or thick at a wall's foot (the far edge along x, at v = 0; along y, at u = 0). */
function dustTile(at: 'none' | 'x' | 'y', seed: number): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 2, y + 1);
    const dn = fbm4(x * 3.2, y * 3.2, seed);
    if (at === 'none') {
      const d = Math.hypot((x - 0.5) / 0.46, (y - 0.5) / 0.4) + (dn - 0.5) * 0.9;
      if (d > 1) return c;
      return d < 0.5 ? DUST[2] : d < 0.78 ? DUST[1] : DUST[0];
    }
    const nf = at === 'x' ? y : x;
    if (nf < 0.62 && dn > 0.38 + nf * 0.55) return dn > 0.6 ? DUST[2] : dn > 0.5 ? DUST[1] : DUST[0];
    return c;
  });
}
/** Chips of bone scattered over the flags. */
function chipsTile(): Sprite {
  const chips: [number, number, number, number][] = [];
  for (let i = 0; i < 9; i++) chips.push([0.12 + hash(i, 1, 811) * 0.76, 0.12 + hash(i, 2, 811) * 0.76, 2 + Math.floor(hash(i, 3, 811) * 3), hash(i, 4, 811) < 0.5 ? 1 : -1]);
  const p = pixelsOf(tileOf((x, y) => floorAt(x + 3, y + 3)));
  for (const [cx, cy, len, dir] of chips) {
    const X = Math.round(HALF + (cx - cy) * 32);
    const Y = Math.round((cx + cy) * 16);
    for (let k = 0; k < len; k++) {
      const yy = Y + (k > 1 ? dir : 0);
      p.set(X + k, yy, k === 0 ? BONE[3] : BONE[2]);
      if (p.has(X + k, yy + 1)) p.set(X + k, yy + 1, SEAM);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}
/** Rubble where the mine broke in: stones of the raw rock and grit over the flags, thickest at the far edge (toward the break). */
function rubbleTile(at: 'x' | 'y'): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 1, y + 3);
    const nf = at === 'x' ? y : x;
    const n = fbm4(x * 5, y * 5, 821);
    const thick = 0.75 - nf * 0.55;
    if (n < 1 - thick) {
      // grit
      if (hash(Math.floor(x * 30), Math.floor(y * 30), 823) < thick * 0.35) return EARTH[3];
      return c;
    }
    // a stone: lit on its edge toward the light
    const e = fbm4(x * 5 - 0.06, y * 5 + 0.06, 821);
    return n > 1 - thick + 0.12 ? (e < n - 0.02 ? ROCK[4] : ROCK[3]) : e < n ? ROCK[2] : ROCK[1];
  });
}
/** Earth spilled from the break in tongues over the flags, thickest at the far edge. */
function earthTile(at: 'x' | 'y'): Sprite {
  return tileOf((x, y) => {
    const c = floorAt(x + 3, y + 1);
    const nf = at === 'x' ? y : x;
    const n = fbm4(x * 1.6, y * 1.6, 831) - nf * 0.4 + 0.16;
    if (n < 0.46) return c;
    const g = fbm4(x * 7, y * 7, 833);
    if (n < 0.5) return mixC(c, EARTH[1], 0.6);
    return g > 0.62 ? EARTH[4] : g > 0.42 ? EARTH[3] : EARTH[2];
  });
}

// =================================================================================================
// THINGS THAT STAND, painted in depth: for every pixel the line of sight is followed into the thing, and the first point inside
// it is what is seen (as the look's pictures were painted). World in tiles (x down the screen to the right, y down to the
// left), z up in picture pixels; a point (x, y, z) is at (OX + (x - y) 32, OY + (x + y) 16 - z) on the picture.

export type Face = 'x' | 'y' | 'z' | 'in';
export interface Solid {
  box: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number };
  inside: (x: number, y: number, z: number) => boolean;
  shade: (x: number, y: number, z: number, face: Face) => string | null;
}
/** A picture with a depth for every pixel (x + y of the world point seen there: the larger, the nearer the eye). */
export class Deep {
  readonly dep: Float32Array;
  constructor(readonly p: Px, readonly ox: number, readonly oy: number) {
    this.dep = new Float32Array(p.w * p.h).fill(-1e9);
  }
  at(x: number, y: number, z = 0): [number, number] {
    return [this.ox + (x - y) * 32, this.oy + (x + y) * 16 - z];
  }
  put(x: number, y: number, d: number, c: string | null): boolean {
    x = Math.floor(x);
    y = Math.floor(y);
    if (c === null || x < 0 || y < 0 || x >= this.p.w || y >= this.p.h) return false;
    const i = y * this.p.w + x;
    if (d < this.dep[i]) return false;
    this.dep[i] = d;
    this.p.set(x, y, c);
    return true;
  }
  march(s: Solid, step = 0.012, only?: (px: number, py: number) => boolean): void {
    const b = s.box;
    const corners: [number, number][] = [];
    for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) corners.push(this.at(x, y, z));
    const minX = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0]))));
    const maxX = Math.min(this.p.w - 1, Math.ceil(Math.max(...corners.map((c) => c[0]))));
    const minY = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1]))));
    const maxY = Math.min(this.p.h - 1, Math.ceil(Math.max(...corners.map((c) => c[1]))));
    for (let py = minY; py <= maxY; py++) {
      const sy = py + 0.5 - this.oy;
      for (let px = minX; px <= maxX; px++) {
        if (only && !only(px, py)) continue;
        const q = (px + 0.5 - this.ox) / 32;
        let lo = Math.max(2 * b.x0 - q, 2 * b.y0 + q, (b.z0 + sy) / 16);
        const hi = Math.min(2 * b.x1 - q, 2 * b.y1 + q, (b.z1 + sy) / 16);
        if (hi <= lo) continue;
        const seen = this.dep[py * this.p.w + px];
        if (hi < seen) continue;
        // (no further than what is already there nearer the eye)
        lo = Math.max(lo - step, seen);
        const pt = (t: number): [number, number, number] => [(t + q) / 2, (t - q) / 2, 16 * t - sy];
        let prevT: number | null = null;
        for (let t = hi; t >= lo; t -= step) {
          let [x, y, z] = pt(t);
          if (s.inside(x, y, z)) {
            // (closer in on where it meets it, between the last step outside and this one)
            let tIn = t;
            if (prevT !== null) {
              let tOut = prevT;
              for (let k = 0; k < 6; k++) {
                const m = (tIn + tOut) / 2;
                const [mx, my, mz] = pt(m);
                if (s.inside(mx, my, mz)) tIn = m;
                else tOut = m;
              }
              [x, y, z] = pt(tIn);
            }
            let face: Face = 'in';
            if (prevT !== null) {
              const e = 0.006;
              const [ox, oy, oz] = pt(tIn + e);
              if (!s.inside(ox, y, z)) face = 'x';
              else if (!s.inside(x, oy, z)) face = 'y';
              else if (!s.inside(x, y, oz)) face = 'z';
            }
            this.put(px, py, tIn, s.shade(x, y, z, face));
            break;
          }
          prevT = t;
        }
      }
    }
  }
}
/** The tone of a face lit from the upper left, from its normal in the world (x, y, z): the top lightest, a face to +y (screen-left) lit, to +x in shade. */
export function litTone(nx: number, ny: number, nz: number): number {
  const m = Math.hypot(nx, ny, nz) || 1;
  const l = (nx * -0.3 + ny * 0.5 + nz * 0.82) / m;
  return l > 0.7 ? 4 : l > 0.35 ? 3 : l > 0.0 ? 2 : l > -0.35 ? 1 : 0;
}
/** A lump of raw rock: lumpy, broken into facets, lit from the upper left (`c` its middle, `r` its radii: tiles, tiles, picture pixels). */
function rockSolid(c: [number, number, number], r: [number, number, number], seed: number, ramp: R5 = ROCK, keep?: (x: number, y: number, z: number) => boolean): Solid {
  const f = (x: number, y: number, z: number): number => {
    const dx = (x - c[0]) / r[0];
    const dy = (y - c[1]) / r[1];
    const dz = (z - c[2]) / r[2];
    const n = noise(dx * 1.8 + seed, dy * 1.8 + dz * 1.4, seed) - 0.5 + (noise(dx * 4.1 + dz * 2, dy * 4.1 - seed, seed + 5) - 0.5) * 0.5;
    return dx * dx + dy * dy + dz * dz - 1 - n * 1.1;
  };
  return {
    box: { x0: c[0] - r[0] * 1.3, y0: c[1] - r[1] * 1.3, z0: Math.max(0, c[2] - r[2] * 1.3), x1: c[0] + r[0] * 1.3, y1: c[1] + r[1] * 1.3, z1: c[2] + r[2] * 1.3 },
    inside: (x, y, z) => f(x, y, z) < 0 && z >= 0 && (!keep || keep(x, y, z)),
    shade: (x, y, z) => {
      const e = 0.04;
      const gx = (f(x + e, y, z) - f(x - e, y, z)) / (2 * e);
      const gy = (f(x, y + e, z) - f(x, y - e, z)) / (2 * e);
      const gz = ((f(x, y, z + e * 32) - f(x, y, z - e * 32)) / (2 * e)) * 1.4;
      const m = Math.hypot(gx, gy, gz) || 1;
      // (facets: the normal stepped, so the rock breaks into planes)
      const k = litTone(Math.round(gx / m), Math.round(gy / m), Math.round((gz / m) * 1.4) / 1.4);
      const cr = Math.abs(noise(x * 7 + seed, y * 7 + z / 9, seed + 3) - 0.5) < 0.025;
      return cr ? ramp[0] : ramp[k];
    },
  };
}
/** A box turned about the upright by `yaw`, tipped about its length by `roll` and its across by `pitch`: timber, its grain along it. */
function boxSolid(c: [number, number, number], half: [number, number, number], yaw: number, roll: number, ramp: R5, grain = true, pitch = 0): Solid {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const local = (x: number, y: number, z: number): [number, number, number] => {
    const dx = x - c[0];
    const dy = y - c[1];
    const dz = (z - c[2]) / 32;
    let lx = dx * cy + dy * sy;
    let ly = -dx * sy + dy * cy;
    let lz = dz;
    const lx2 = lx * cp + lz * sp;
    lz = -lx * sp + lz * cp;
    lx = lx2;
    const ly2 = ly * cr + lz * sr;
    lz = -ly * sr + lz * cr;
    ly = ly2;
    return [lx, ly, lz];
  };
  const reach = Math.hypot(half[0], half[1], half[2]);
  return {
    box: { x0: c[0] - reach, y0: c[1] - reach, z0: Math.max(0, c[2] - reach * 32), x1: c[0] + reach, y1: c[1] + reach, z1: c[2] + reach * 32 },
    inside: (x, y, z) => {
      const [lx, ly, lz] = local(x, y, z);
      return Math.abs(lx) < half[0] && Math.abs(ly) < half[1] && Math.abs(lz) < half[2];
    },
    shade: (x, y, z) => {
      const [lx, ly, lz] = local(x, y, z);
      const ex = half[0] - Math.abs(lx);
      const ey = half[1] - Math.abs(ly);
      const ez = half[2] - Math.abs(lz);
      let n: [number, number, number];
      if (ez <= ex && ez <= ey) n = [0, 0, Math.sign(lz)];
      else if (ey <= ex) n = [0, Math.sign(ly), 0];
      else n = [Math.sign(lx), 0, 0];
      let [nx, ny, nz] = n;
      const ny2 = ny * cr - nz * sr;
      nz = ny * sr + nz * cr;
      ny = ny2;
      const nx2 = nx * cp - nz * sp;
      nz = nx * sp + nz * cp;
      nx = nx2;
      const wx = nx * cy - ny * sy;
      const wy = nx * sy + ny * cy;
      let k = Math.min(3, litTone(wx, wy, nz));
      const edges = [ex, ey, ez].filter((v) => v < 0.025).length;
      if (edges >= 2 && k >= 2) k += 1;
      if (grain && Math.abs(((lx * 7 + hash(Math.floor(ly * 20 + 50), 1, 921) * 3) % 1 + 1) % 1 - 0.5) < 0.05) k -= 1;
      return ramp[clampK(k)];
    },
  };
}

/** No pixel left alone (a speck on its own reads as noise): the lone ones taken away. */
export function noLone(p: Px): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (!p.has(x, y)) continue;
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && p.has(x + dx, y + dy)) nb++;
    if (nb === 0) p.erase(x, y);
  }
}

// =================================================================================================
// CANDLES ON THE FLOOR: clusters of them, every height, standing in a pool of their own wax; their flames move (four frames)

/** A cluster's candles: where (tiles from its middle), how tall (picture pixels). */
function clusterOf(n: number, spread: number, seed: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = hash(seed, i, 951) * Math.PI * 2;
    const r = Math.sqrt(hash(seed, i, 953)) * spread * 0.8;
    out.push([Math.cos(a) * r, Math.sin(a) * r, 6 + Math.floor(hash(seed, i, 955) * 14)]);
  }
  return out.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
}
/** CANDLES ON THE FLOOR, frame f: 64 x 64, anchored at the floor point at their middle. */
function candlesOnFloor(n: number, spread: number, seed: number, f: number): Sprite {
  const W = 64;
  const H = 64;
  const AX = 32;
  const AY = 44;
  const p = new Px(W, H);
  const at = (x: number, y: number, z = 0): [number, number] => [AX + (x - y) * 32, AY + (x + y) * 16 - z];
  // the pool of wax under them
  for (let py = AY - 16; py < AY + 16; py++) for (let px = AX - 30; px < AX + 30; px++) {
    const dx = px + 0.5 - AX;
    const dy = py + 0.5 - AY;
    const x = (dx / 32 + dy / 16) / 2;
    const y = (dy / 16 - dx / 32) / 2;
    const r = Math.hypot(x, y) / spread + (noise(x * 9 + seed, y * 9, seed) - 0.5) * 0.5;
    if (r > 0.95) continue;
    p.set(px, py, r > 0.78 ? mixC(WAX[0], FLAGS[1], 0.5) : r < 0.4 && hash(px >> 1, py, seed) < 0.2 ? WAX[1] : WAX[0]);
  }
  for (const [x, y, h] of clusterOf(n, spread, seed)) {
    const [X0, Y0] = at(x, y);
    const X = Math.round(X0 / 2) * 2;
    const Y = Math.round(Y0);
    // (a candle three pixels wide, lit on its left, its top lit by its own flame)
    for (let j = 0; j < h; j++) {
      const top = j > h - 3;
      p.set(X - 1, Y - j, top ? WAX[1] : mixC(WAX[1], WAX[0], 0.4));
      p.set(X, Y - j, top ? WAX[1] : WAX[0]);
      p.set(X + 1, Y - j, mixC(WAX[0], SEAM, 0.45));
    }
    if (hash(Math.floor(x * 50 + 99), Math.floor(y * 50 + 99), 957) < 0.4) p.set(X - 1, Y - h + 3, WAX[1]).set(X - 1, Y - h + 4, WAX[1]);
    p.set(X, Y - h, SEAM);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) {
      const c = flamePx(i, j, f, Math.floor(x * 31 + y * 17 + 40));
      if (c) p.set(X - 1 + i, Y - h - 4 + j, c);
    }
  }
  const s = p.sprite(AX, AY, GRAIN);
  const L = CHAPEL_LIGHTS.floorCandles;
  s.lights = [{ x: AX / GRAIN, y: (AY - L.up) / GRAIN, r: (n > 5 ? L.glow.r : L.glow.r - 4) + (f % 2), color: L.glow.color, a: L.glow.a } as Light];
  return s;
}

// =================================================================================================
// THE WALLS: the chapel's stone in courses on a plinth; A PILASTER at the start of every bay (two tiles), its capital carved
// with a band of knuckle bones, THE RIBS of the vault springing from it into the dark; in each tile a NICHE in each of two
// tiers, the dead stacked in it (the ends of their long bones out in rows, their skulls in a row on top: never gory), CANDLES
// on their sills. Laid out along the bay from its start (J, 0 to 63: J 0 and 32 are the joints between tiles, empty as the
// game's), and painted in the screen's own terms, so that the light falls from the screen's left on either face.

/** The pilaster's middle and its half width, along the bay; each tile's niche: its middle, half width; the tiers: sill, spring. */
const PIL = { c: 6.5, half: 5.5 };
const NICHES = [21.5, 47.5] as const;
const NR = 9;
const TIERS = [{ floor: 11, spring: 26 }, { floor: 40, spring: 48 }] as const;
/** The hall's band of the dead, over its lower niches (up from the floor). */
const BAND = { lo: 38, hi: 57 };

/** What a wall is: a chapel's, or the hall's (its upper tier a band of the dead, more candles). */
type WallKind = 'chapel' | 'hall';

/** The candles on a niche's sill: where across it (from its screen-left, 0 to 17), how tall. */
function nicheCandles(tier: number, id: number, kind: WallKind): { i: number; h: number }[] {
  const out: { i: number; h: number }[] = [];
  const n = tier === 0 ? (kind === 'hall' ? 3 : 2) : 1 + (hash(id, 1, 77) < 0.5 ? 1 : 0);
  for (let k = 0; k < n; k++) out.push({ i: 2 + Math.floor((k + hash(id, k + 2, 77)) * (13 / n)), h: 3 + Math.floor(hash(id, k + 5, 77) * 5) });
  return out;
}

/** Inside a niche at (i, j) from its screen-left and its sill; `h` how high to its head; `down` how much darker (it is in shade). */
function nicheInside(tier: number, i: number, j: number, h: number, id: number): string {
  const back = mixC(STONE[0], BEYOND, 0.5);
  const w = 2 * NR;
  // its reveal: the left side and the head in shadow, the right side catching the light
  if (i < 2 || j > h - 2) return SEAM;
  if (i === w - 1) return STONE[2];
  // THE STACK: rows of bone ends three high, the skulls in a row on top
  const rows = tier === 0 ? 4 : 2;
  const boneTop = rows * 3;
  if (j < boneTop) {
    const r = Math.floor(j / 3);
    const kx = ((i + (r % 2 ? 2 : 0) + (id % 3)) % 5 + 5) % 5;
    return knucklePx(kx, 2 - (j % 3), 1, WALL_BONE) ?? back;
  }
  const sj = j - boneTop;
  if (sj < 8) {
    const sk = skullPx(i - 1, 7 - sj, 1, WALL_BONE) ?? skullPx(i - 9, 7 - sj, 1, WALL_BONE);
    if (sk) return sk;
  }
  return back;
}

/**
 * THE CHAPEL'S WALL at a point: `J` along the bay from its start (0 to 63), `up` over the floor; `sgn` which way J runs on the
 * screen (+1 to the right: a wall along x; -1 to the left: along y); `f` the candles' frame. A colour (the face as it is lit:
 * in shade along y is the caller's), or undefined where nothing is (the joint).
 */
function chapelAt(J: number, up: number, sgn: number, seed: number, f: number, kind: WallKind): string | undefined {
  const S = STONE;
  const tile = J < 32 ? 0 : 1;
  // THE PILASTER: a half-round shaft on a moulded base, a capital at 46 to 52 carved with knuckle bones
  let d = J + 0.5 - PIL.c;
  if (d > 32) d -= 64;
  const ds = d * sgn;
  if (up >= 46 && up < 53 && Math.abs(d) <= PIL.half + 1) {
    if (up === 52) return S[4];
    if (up === 51) return S[3];
    if (up === 46) return S[1];
    return knucklePx(((Math.floor(ds + 40) % 4) + 4) % 4, up - 47, 1) ?? S[2];
  }
  if (up < 46 && Math.abs(d) <= PIL.half + (up < 9 ? 1 : 0)) {
    if (up < 9) {
      if (up === 8) return S[4];
      if (up < 2) return S[1];
      return ds < -PIL.half ? S[3] : ds > PIL.half ? S[0] : S[2];
    }
    if (Math.abs(d) > PIL.half - 0.5) return SEAM;
    if (up === 30 || up === 31) return up === 31 ? S[3] : S[0];
    const k = ds < -4 ? 4 : ds < -2 ? 3 : ds < 1.5 ? 2 : ds < 3.5 ? 1 : 0;
    return S[k];
  }
  // THE RIBS of the vault springing from the capital, up and out into the dark
  if (up >= 52) {
    const cx = d >= 0 ? 34 : -34;
    const r = Math.hypot(d - cx, up + 0.5 - 52);
    if (Math.abs(r - 34) < 2.6 && Math.abs(d) < 26) return S[r > 35.2 ? 4 : r < 33 ? 1 : 3];
    if (Math.abs(r - 34) < 3.4 && Math.abs(d) < 26) return SEAM;
  }
  // THE HALL'S BAND OF THE DEAD over its lower niches, between two string courses
  if (kind === 'hall' && up >= BAND.lo && up < BAND.hi) {
    if (up === BAND.lo || up === BAND.hi - 1) return S[up === BAND.lo ? 1 : 4];
    if (up === BAND.lo + 1 || up === BAND.hi - 2) return S[up === BAND.lo + 1 ? 4 : 1];
    const v = up - BAND.lo - 2;
    const sx = Math.floor((J * sgn + 640) % 9);
    if (v >= 5 && v < 13) return skullPx(sx, 12 - v, 1, WALL_BONE) ?? mixC(BONE[0], BEYOND, 0.4);
    const r = Math.floor(v / 3);
    return knucklePx(((Math.floor(J * sgn + 640) + (r % 2 ? 2 : 0)) % 5 + 5) % 5, 2 - (((v % 3) + 3) % 3), 1, WALL_BONE) ?? mixC(BONE[0], BEYOND, 0.4);
  }
  // THE NICHE of this tile, in each tier
  const nc = NICHES[tile];
  const nx = J + 0.5 - nc;
  for (let tier = 0; tier < 2; tier++) {
    if (kind === 'hall' && tier === 1) continue;
    const { floor, spring } = TIERS[tier];
    if (Math.abs(nx) > NR + 0.5) continue;
    const top = spring + Math.sqrt(Math.max(0, NR * NR - nx * nx));
    if (up < floor - 1 || up > top + 1) continue;
    const id = seed * 7 + tile * 2 + tier;
    if (up === floor - 1) return S[4];
    if (Math.abs(nx) > NR - 0.5 || up > top) return SEAM;
    const i = Math.floor(nx * sgn + NR);
    const j = up - floor;
    // CANDLES on the sill, before the dead
    for (const cd of nicheCandles(tier, id, kind)) {
      if (i < cd.i || i > cd.i + 1) continue;
      if (j < cd.h) return j === cd.h - 1 ? WAX[1] : i === cd.i ? NICHE_WAX[1] : NICHE_WAX[0];
      const fl = flamePx(i - cd.i, cd.h + 3 - j, f, id + cd.i);
      if (fl) return fl;
    }
    return nicheInside(tier, i, j, Math.floor(top - floor), id);
  }
  // THE PLINTH
  if (up < 9) {
    if (up === 8) return S[3];
    if (up === 7) return S[2];
    if (up < 2) return S[1];
    return hash(J >> 3, 1, seed) < 0.12 ? S[1] : S[2];
  }
  // THE STONE, in courses 10 high, blocks 18 to 32 long
  const CH = 10;
  const cv = up - 9;
  const row = Math.floor(cv / CH);
  const lv = cv % CH;
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = 18 + Math.floor(hash(row, seed, 2) * 14);
  const uu = J + off + 400;
  const b = Math.floor(uu / L);
  const lu = uu % L;
  if (lv === CH - 1 || lu === 0) return SEAM;
  let k = 2;
  const tone = hash(b, row * 7 + seed, 3);
  if (tone < 0.16) k -= 1;
  else if (tone > 0.9) k += 1;
  if (lv === CH - 2) k += 1;
  if ((sgn > 0 ? lu === 1 : lu === L - 1)) k += 1;
  if (lv === 0) k -= 1;
  return S[clampK(k)];
}

/** Fade the top of each column of a face, as the game's (its four steps), where `fades` says: the rows `top` to `top + CHAPEL_FADE`. */
function fadeTop(p: Px, topOf: (x: number) => number | null, fades: (x: number, y: number) => boolean): void {
  for (let x = 0; x < p.w; x++) {
    const top = topOf(x);
    if (top === null) continue;
    for (let k = 0; k < CHAPEL_FADE; k++) {
      const y = top + k;
      const c = p.get(x, y);
      if (!c || OWN.has(c) || !fades(x, y)) continue;
      p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / CHAPEL_FADE)]);
    }
  }
}

/**
 * A TILE OF WALL: its one face, as the game's walls are laid (art/ground.ts, a face alone): along x its face turned to screen-
 * left, along y to screen-right, standing on the tile's near edge; CHAPEL_WALL high, its top CHAPEL_FADE fading out in the
 * game's four steps. `k` which tile of the bay (0: the pilaster's). Anchored at the floor point of the tile's top corner.
 */
function wallTile(alongX: boolean, k: number, seed: number, f: number, kind: WallKind): Sprite {
  const H = CHAPEL_WALL;
  const p = new Px(TW, TH + H);
  const iso = new Iso(p, HALF, H);
  const tops = new Map<number, number>();
  const shade = (_u: number, v: number, _w: number, h: number, px: number, py: number): string | null => {
    // (the game leaves the first column and the last empty: the joint between two tiles' faces)
    if (px <= 0 || px >= TW - 1) return null;
    if (v === 0) tops.set(px, py);
    const up = h - 1 - v;
    const J = alongX ? 32 * k + px : 32 * k + (TW - 1 - px);
    const c = chapelAt(J, up, alongX ? 1 : -1, seed, f, kind);
    if (c === undefined) return null;
    return alongX ? c : shaded(c);
  };
  if (alongX) iso.left(0, 1, 1, 0, H, shade);
  else iso.right(1, 0, 1, 0, H, shade);
  fadeTop(p, (x) => tops.get(x) ?? null, () => true);
  const s = p.sprite(HALF, H, GRAIN);
  return s;
}

// =================================================================================================
// A STRETCH OF THREE TILES OF WALL as one picture (the break-in, the way in), as the cave's and the prison's door are: its face
// on the wall's line exactly where the three tiles it takes the place of would stand (the same columns, the same rows), the
// joints between them filled. Anchored at the foot of the face under the middle of its middle tile (the game's doorway's
// anchor: render/dress.ts anchorOf).

/** The stretch's picture: its size, and where its anchor is on it, for a wall along x or along y. */
const STRETCH = { w: 160, h: 200, ay: 136, axX: 92, axY: 68 } as const;

interface Stretch {
  p: Px;
  D: Deep;
  /** The world point where the face's first tile's top corner is (along x: (0, 0), the face y = 1; along y: (0, 0), the face x = 1). */
  alongX: boolean;
  /** Each column's face top row (where the wall's own fade starts), or none. */
  tops: Map<number, number>;
  /** Pixels that are the wall itself (they fade at its top); everything else stands whole. */
  wall: Set<number>;
  /** Every pixel of the face: where on it (U, up), and its depth (so that a frame may paint it again where nothing stands before it). */
  face: Map<number, [number, number, number]>;
  /** The pixels where the face is open (an arch, a hole): what is beyond it is seen there only. */
  open: Set<number>;
}
/** A blank stretch: the face painted by `face(U, up)` (U 0 to 95 from its left end on the screen; null: not there) on the wall's line, with the depth of every pixel. */
function stretchOf(alongX: boolean, face: (U: number, up: number) => string | null, whole: (U: number, up: number) => boolean = () => false): Stretch {
  const p = new Px(STRETCH.w, STRETCH.h);
  const AX = alongX ? STRETCH.axX : STRETCH.axY;
  const AY = STRETCH.ay;
  // (the world's (0, 0) where the anchor (1.5, 1) along x, or (1, 1.5) along y, falls on AX, AY)
  const OX = alongX ? AX - 16 : AX + 16;
  const OY = AY - 40;
  const D = new Deep(p, OX, OY);
  const iso = new Iso(p, OX, OY);
  const tops = new Map<number, number>();
  const wall = new Set<number>();
  const faceMap = new Map<number, [number, number, number]>();
  const open = new Set<number>();
  const shade = (u: number, v: number, _w: number, h: number, px: number, py: number): string | null => {
    if (v === 0) tops.set(px, py);
    const c = face(u, h - 1 - v);
    if (c === null) {
      open.add(py * p.w + px);
      return null;
    }
    // (its depth: the face's own, x + y of the point of the wall seen there)
    const q = (px + 0.5 - OX) / 32;
    const d = Math.fround(alongX ? 2 + q : 2 - q);
    D.dep[py * p.w + px] = d;
    faceMap.set(py * p.w + px, [u, h - 1 - v, d]);
    if (!whole(u, h - 1 - v)) wall.add(py * p.w + px);
    return alongX ? c : shaded(c);
  };
  if (alongX) iso.left(0, 3, 1, 0, CHAPEL_WALL, shade);
  else iso.right(1, 0, 3, 0, CHAPEL_WALL, shade);
  return { p, D, alongX, tops, wall, face: faceMap, open };
}
/** A copy of a stretch, its face painted again by `face` where nothing stands before it (another frame of its candles). */
function restretch(S: Stretch, face: (U: number, up: number) => string | null): Stretch {
  const p = new Px(S.p.w, S.p.h);
  p.d.set(S.p.d);
  const D = new Deep(p, S.D.ox, S.D.oy);
  D.dep.set(S.D.dep);
  for (const [i, [U, up, d]] of S.face) {
    if (D.dep[i] !== d) continue;
    const c = face(U, up);
    if (c !== null) p.set(i % p.w, Math.floor(i / p.w), S.alongX ? c : shaded(c));
  }
  return { ...S, p, D };
}
/** The world point of (a along the stretch's wall from its first tile's start, b out from its face toward the room, z up). */
const worldOf = (alongX: boolean, a: number, b: number): [number, number] => (alongX ? [a, 1 + b] : [1 + b, a]);
/** And back. */
const wallOf = (alongX: boolean, x: number, y: number): [number, number] => (alongX ? [x, y - 1] : [y, x - 1]);
function finishStretch(S: Stretch): Sprite {
  fadeTop(S.p, (x) => S.tops.get(x) ?? null, (x, y) => S.wall.has(y * S.p.w + x));
  noLone(S.p);
  return S.p.sprite(S.alongX ? STRETCH.axX : STRETCH.axY, STRETCH.ay, GRAIN);
}

// =================================================================================================
// THE BREAK-IN: three tiles of the chapel's wall burst open by the mine: a ragged hole through its stone (its edge chipped and
// lit, cracks running out from it), the mine's raw rock pushed through it in great faceted lumps, bulging out over the
// plinth; earth bled down the stone under it; TIMBER PROPS shoring it, a post at either end and a cap across, wedges driven
// over the posts; a MINER'S LANTERN hung on a nail in the cap (its flame moves: four frames). An obstacle where it stands (its
// rock spilled before it is a piece of its own).

/** The hole: its middle (a along the stretch, up), its half sizes. */
export const HOLE = { a: 1.5, up: 34, ra: 1.22, rup: 31 };
/** The props: the posts' places along the stretch, how high the cap's underside is, how far out they stand. */
export const PROPS = { posts: [0.3, 2.7], cap: 70, out: 0.16 };
/** The lantern: where along the stretch, how far under the cap its glass's middle hangs. */
export const LANTERN = { a: 0.78, drop: 18 };

/** How far into the hole a point of the wall is (less than 1: in it), ragged. */
function holeE(a: number, up: number): number {
  const da = (a - HOLE.a) / HOLE.ra;
  const du = (up - HOLE.up) / HOLE.rup;
  return Math.hypot(da, du) + (fbm(a * 3.1, up / 9, 861) - 0.5) * 0.36;
}
const breakBases = new Map<boolean, Stretch>();
function breakFace(alongX: boolean, f: number) {
  return (U: number, up: number): string | null => {
    // (a along the wall in the world: along y the wall runs to the screen's left)
    const a = alongX ? (U + 0.5) / 32 : 3 - (U + 0.5) / 32;
    const e = holeE(a, up);
    if (e < 1) return null;
    const J = alongX ? U % 64 : (95 - U) % 64;
    let c = chapelAt(J, up, alongX ? 1 : -1, 31, f, 'chapel') ?? SEAM;
    // its edge: chipped, a lit lip on its lower rim, dark under its head
    if (e < 1.07) c = up < HOLE.up + 4 && U + 0.5 < 48 + 30 ? STONE[4] : SEAM;
    else if (e < 1.12) c = STONE[1];
    // cracks running out from it
    const cr = Math.abs(fbm(a * 4.2, up / 10, 863) - 0.5);
    if (e < 1.7 && cr < 0.014 + 0.01 * (1.7 - e)) c = SEAM;
    // earth bled down the stone under the hole
    if (up < HOLE.up && Math.abs(a - HOLE.a) < 1.25 && fbm(a * 2.2, up / 16, 865) > 0.5 + up / 120) c = mixC(c, EARTH[2], 0.6);
    return c;
  };
}
/** The break-in's wall, its rock and its props (the same in every frame), painted once. */
function breakBase(alongX: boolean): Stretch {
  const hit = breakBases.get(alongX);
  if (hit) return hit;
  const S = stretchOf(alongX, breakFace(alongX, 0));
  const { D } = S;
  const W = (a: number, b: number, z: number): [number, number, number] => [...worldOf(alongX, a, b), z];
  // THE MINE'S ROCK, through the hole: a mass filling it from the back of the wall, bulging out of the face, lumps on it
  const [hx, hy] = worldOf(alongX, HOLE.a, 0);
  const lumps: [number, number, number, number, number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const a = HOLE.a + (hash(i, 1, 871) - 0.5) * 1.9;
    const up = 8 + hash(i, 2, 871) * 52;
    if (holeE(a, up) > 0.9) continue;
    lumps.push([a, 0.05 + hash(i, 3, 871) * 0.18, up, 0.24 + hash(i, 4, 871) * 0.18, 9 + hash(i, 5, 871) * 9, i]);
  }
  // (and two great ones fallen over the plinth at the hole's foot)
  lumps.push([HOLE.a - 0.42, 0.16, 7, 0.36, 12, 21], [HOLE.a + 0.38, 0.12, 6, 0.3, 10, 22]);
  const mass = (x: number, y: number, z: number): number => {
    const [a, b] = wallOf(alongX, x, y);
    // (far from the hole, or out from the face beyond any bulge: plainly not the rock's)
    if (b > 0.32) return b;
    const r0 = Math.hypot((a - HOLE.a) / HOLE.ra, (z - HOLE.up) / HOLE.rup);
    if (r0 > 1.25) return r0 - 1.2;
    const e = holeE(a, z);
    // (the rock face: behind the wall's face in the hole, bulging out of it toward the middle)
    const bulge = 0.18 * (1 - e) + (fbm(a * 3, z / 8, 873) - 0.5) * 0.14;
    return Math.max(e - 1.02, b - bulge);
  };
  const lumpF = (x: number, y: number, z: number): number => {
    const [a, b] = wallOf(alongX, x, y);
    let m = Infinity;
    for (const [la, lb, lu, r, rz, s] of lumps) {
      const d0 = Math.hypot((a - la) / r, (b - lb) / (r * 0.8), (z - lu) / rz) - 1;
      if (d0 > 0.3) {
        m = Math.min(m, d0 - 0.25);
        continue;
      }
      const n = (noise(a * 5 + s, z / 6, s + 3) - 0.5) * 0.5;
      m = Math.min(m, d0 - n);
    }
    return m;
  };
  const field = (x: number, y: number, z: number): number => Math.min(mass(x, y, z), lumpF(x, y, z));
  void hx;
  void hy;
  const [bx0, by0] = worldOf(alongX, 0.1, -0.42);
  const [bx1, by1] = worldOf(alongX, 2.9, 0.62);
  S.D.march({
    box: { x0: Math.min(bx0, bx1), y0: Math.min(by0, by1), z0: 0, x1: Math.max(bx0, bx1), y1: Math.max(by0, by1), z1: HOLE.up + HOLE.rup + 8 },
    inside: (x, y, z) => {
      const [, b] = wallOf(alongX, x, y);
      return b > -0.4 && z >= 0 && field(x, y, z) < 0;
    },
    shade: (x, y, z) => {
      const e = 0.03;
      const gx = (field(x + e, y, z) - field(x - e, y, z)) / (2 * e);
      const gy = (field(x, y + e, z) - field(x, y - e, z)) / (2 * e);
      const gz = ((field(x, y, z + e * 32) - field(x, y, z - e * 32)) / (2 * e)) * 1.4;
      const m = Math.hypot(gx, gy, gz) || 1;
      const k = litTone(Math.round((gx / m) * 1.3) / 1.3, Math.round((gy / m) * 1.3) / 1.3, Math.round((gz / m) * 1.3) / 1.3);
      const [a, b] = wallOf(alongX, x, y);
      // (deep in the hole, the rock in the wall's shadow; cracks; earth packed between the lumps)
      const cr = Math.abs(noise(a * 9 + z / 14, z / 7, 877) - 0.5) < 0.03;
      if (cr) return ROCK[0];
      if (lumpF(x, y, z) > 0.05 && fbm(a * 4, z / 6, 879) > 0.6) return EARTH[clampK(k - 1)];
      return ROCK[clampK(b < -0.05 ? k - 1 : k)];
    },
  }, 0.02);
  // THE PROPS: two posts, a cap across them, a wedge over each post
  const timber: Solid[] = [];
  const yaw = alongX ? 0 : Math.PI / 2;
  for (const pa of PROPS.posts) {
    timber.push(boxSolid(W(pa, PROPS.out, PROPS.cap / 2), [0.1, 0.1, PROPS.cap / 64], yaw + 0.04, 0, WOOD));
    timber.push(boxSolid(W(pa, PROPS.out, PROPS.cap - 3), [0.15, 0.12, 3 / 32], yaw, 0, WOOD, false));
  }
  timber.push(boxSolid(W(1.5, PROPS.out, PROPS.cap + 5), [1.42, 0.13, 5 / 32], yaw, 0, WOOD));
  for (const t of timber) D.march(t, 0.01);
  breakBases.set(alongX, S);
  return S;
}
function breakInPicture(alongX: boolean, f: number): Sprite {
  const S = restretch(breakBase(alongX), breakFace(alongX, f));
  const { D } = S;
  // THE LANTERN on its nail in the cap: its hook, its peaked cap, its cage round the glass and the flame, its foot
  const [lx, ly] = D.at(...worldOf(alongX, LANTERN.a, PROPS.out + 0.14), PROPS.cap - LANTERN.drop);
  const X = Math.round(lx);
  const Y = Math.round(ly);
  const d = 100;
  for (let j = -LANTERN.drop + 1; j < -9; j++) D.put(X, Y + j, d, j % 3 === 0 ? IRON[3] : IRON[2]);
  for (let i = -3; i <= 3; i++) D.put(X + i, Y - 9 + Math.floor(Math.abs(i) / 2), d, i < 0 ? IRON[3] : IRON[1]);
  for (let j = -8; j < 3; j++) {
    for (let i = -3; i <= 3; i++) {
      const edge = Math.abs(i) === 3 || j === -8;
      let c: string = edge ? (i < 0 ? IRON[3] : IRON[1]) : FIRE[2];
      if (!edge && i === 0 && j > -7 && j < 2) c = IRON[2];
      if (!edge && Math.abs(i) < 3 && i !== 0 && j > -6 && j < 1) c = j < -3 + (f % 2) ? FIRE[4] : FIRE[3];
      D.put(X + i, Y + j, d, c);
    }
  }
  for (let i = -3; i <= 3; i++) D.put(X + i, Y + 3, d, i < 0 ? IRON[3] : IRON[1]);
  const s = finishStretch(S);
  const L = CHAPEL_LIGHTS.lantern;
  s.lights = [{ x: X / GRAIN, y: (Y - 3) / GRAIN, r: L.glow.r + (f % 2), color: L.glow.color, a: L.glow.a } as Light];
  return s;
}

/** THE ROCK SPILLED FROM THE BREAK: lumps of it and earth heaped on the floor before it, a tile and a half along the wall and half a tile out. Anchored at the floor point under its middle, at the wall's foot. */
function rockSpill(alongX: boolean): Sprite {
  const p = new Px(120, 96);
  const AX = 60;
  const AY = 66;
  const D = new Deep(p, AX, AY);
  const W = (a: number, b: number, z: number): [number, number, number] => [...(alongX ? [a, b] : [b, a]) as [number, number], z];
  // the earth: a long low heap
  D.march(rockSolid(W(0, 0.2, -3), alongX ? [0.95, 0.42, 13] : [0.42, 0.95, 13], 9, EARTH));
  // the lumps on it and tumbled before it
  for (let i = 0; i < 6; i++) {
    const a = (hash(i, 1, 881) - 0.5) * 1.5;
    const b = 0.1 + hash(i, 2, 881) * 0.4;
    const r = 0.13 + hash(i, 3, 881) * 0.12;
    D.march(rockSolid(W(a, b, 6 + r * 20), [r, r, 6 + r * 30], 40 + i));
  }
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}
/** A PEW, broken: snapped in two, each half's broken end down on the floor (`lie` 'snapped'), or thrown down on its back. 96 x 72 at the floor point under its middle. */
function pew(lie: 'snapped' | 'back', yaw: number): Sprite {
  const p = new Px(96, 72);
  const AX = 48;
  const AY = 50;
  const D = new Deep(p, AX, AY);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const at = (along: number, across: number): [number, number] => [along * cy - across * sy, along * sy + across * cy];
  if (lie === 'back') {
    const [bx, by] = at(0, 0);
    D.march(boxSolid([bx, by, 2], [0.72, 0.3, 2 / 32], yaw, 0, WOOD));
    const [sx, sy2] = at(0, 0.26);
    D.march(boxSolid([sx, sy2, 9], [0.72, 0.035, 8 / 32], yaw, 0, WOOD));
    for (const e of [-0.6, 0.6]) {
      const [lx, ly] = at(e, 0.42);
      D.march(boxSolid([lx, ly, 12], [0.04, 0.15, 2 / 32], yaw, 0, WOOD, false));
    }
  } else {
    for (const side of [-1, 1]) {
      const [hx, hy] = at(side * 0.42, 0);
      D.march(boxSolid([hx, hy, 9], [0.36, 0.17, 2 / 32], yaw + side * 0.2, 0, WOOD, true, side * 0.34));
      const [bx, by] = at(side * 0.42, -0.15);
      D.march(boxSolid([bx, by, 17], [0.36, 0.035, 9 / 32], yaw + side * 0.2, 0, WOOD, true, side * 0.34));
      const [lx, ly] = at(side * 0.66, 0.02);
      D.march(boxSolid([lx, ly, 6], [0.035, 0.14, 6 / 32], yaw + side * 0.2, 0, WOOD, false));
    }
    // splinters at the break
    for (let i = 0; i < 5; i++) {
      const [x, y] = at((hash(i, 1, 891) - 0.5) * 0.2, (hash(i, 2, 891) - 0.5) * 0.3);
      const [X, Y] = D.at(x, y, 1);
      D.put(Math.round(X), Math.round(Y), x + y + 0.4, WOOD[3]);
      D.put(Math.round(X) + 1, Math.round(Y), x + y + 0.4, WOOD[2]);
    }
  }
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}
/** A MINER'S PICK dropped on the flags: its iron head (one point long, one short), its haft of old wood. 80 x 48 at the floor point under its middle. */
function droppedPick(): Sprite {
  const p = new Px(80, 48);
  const AX = 40;
  const AY = 28;
  const D = new Deep(p, AX, AY);
  const yaw = 0.5;
  D.march(boxSolid([0, 0, 2], [0.5, 0.035, 2 / 32], yaw, 0, WOOD));
  const [hx, hy] = [0.46 * Math.cos(yaw), 0.46 * Math.sin(yaw)];
  D.march(boxSolid([hx, hy, 3], [0.045, 0.28, 2.5 / 32], yaw, 0, IRON, false));
  D.march(boxSolid([hx - 0.02 * Math.sin(yaw), hy + 0.31 * Math.cos(yaw), 2], [0.03, 0.06, 1.5 / 32], yaw, 0, IRON, false));
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE WAY IN FROM FLOOR 3: where the prison's passage comes out (floor 3 ends with a door out the back of the Chained One's
// hall onto a passage going down: art/prison_exit.ts). Three tiles of the chapel's wall with a ROUND ARCH in its middle, two
// tiles across (dressed jambs, a ring of voussoirs, its keystone), standing whole over the wall's fading top; through it A
// SHORT STAIR coming down into the first chapel, its last steps the chapel's stone, its upper ones the prison's charcoal stone
// nosed with black iron; the passage's side wall going up with it, the chapel's stone low, the prison's above; beyond, the
// dark, and the firelight of floor 3's fire basket at its head (the renderer's: its `lights`, flickering).

/** The arch: its middle along the stretch (a), its half width, where it springs, its ring. */
export const WAY_ARCH = { a: 1.5, r: 32, spring: 36, ring: 10 };
/** The stair: its steps' tread (tiles) and rise (picture pixels), how many, how far back the prison's begin. */
export const WAY_STAIR = { tread: 0.375, rise: 8, steps: 6, prisonFrom: 2 };

function inWayArch(U: number, up: number): boolean {
  const du = U + 0.5 - WAY_ARCH.a * 32;
  if (Math.abs(du) >= WAY_ARCH.r) return false;
  return up < WAY_ARCH.spring || Math.hypot(du, up + 0.5 - WAY_ARCH.spring) < WAY_ARCH.r;
}
function wayInPicture(alongX: boolean, f: number): Sprite {
  const A = WAY_ARCH;
  const S = stretchOf(alongX, (U, up) => {
    if (inWayArch(U, up)) return null;
    const du = U + 0.5 - A.a * 32;
    // THE ARCH'S RING: voussoirs round the opening, a keystone; the jambs dressed
    const r = Math.hypot(du, Math.max(0, up + 0.5 - A.spring));
    if (up >= A.spring - 2 && r < A.r + A.ring) {
      if (r < A.r + 1) return STONE[4];
      if (r > A.r + A.ring - 1) return SEAM;
      const ang = Math.atan2(Math.max(0, up + 0.5 - A.spring), du);
      const seg = Math.floor((ang / Math.PI) * 9);
      const into = (ang / Math.PI) * 9 - seg;
      if (into < 0.07) return SEAM;
      if (seg === 4) return into < 0.2 ? STONE[4] : STONE[3];
      return seg % 2 ? STONE[2] : into < 0.2 ? STONE[4] : STONE[3];
    }
    const e = Math.abs(du) - A.r;
    if (up < A.spring && e >= 0 && e < 6) {
      if (up % 12 === 11) return SEAM;
      return e < 1 ? STONE[4] : e > 5 ? SEAM : STONE[3];
    }
    const J = alongX ? U % 64 : (95 - U) % 64;
    return chapelAt(J, up, alongX ? 1 : -1, 37, f, 'chapel') ?? SEAM;
  }, (U, up) => {
    // (the ring and the jambs stand whole over the wall's fading top: only the plain wall fades)
    const du = U + 0.5 - A.a * 32;
    return Math.hypot(du, Math.max(0, up + 0.5 - A.spring)) < A.r + A.ring;
  });
  const { D } = S;
  const T = WAY_STAIR;
  // THROUGH THE ARCH: the stair (b from the face back into the wall: less than 0), its side wall, the dark; seen along each line
  // of sight through the opening
  const floorZ = (s: number): number => (s <= 0.04 ? 0 : Math.min(T.steps, Math.ceil((s - 0.04) / T.tread)) * T.rise);
  const left = A.a - A.r / 32; // the passage's side wall that is seen (its face turned to the room's side of the arch)
  const right = A.a + A.r / 32;
  const [wx0, wy0] = worldOf(alongX, left - 0.05, -3.5);
  const [wx1, wy1] = worldOf(alongX, right + 0.05, 0.02);
  D.march({
    box: { x0: Math.min(wx0, wx1), y0: Math.min(wy0, wy1), z0: 0, x1: Math.max(wx0, wx1), y1: Math.max(wy0, wy1), z1: 90 },
    inside: (x, y, z) => {
      const [a, b] = wallOf(alongX, x, y);
      if (b > 0.001) return false;
      const s = -b;
      if (a <= left || a >= right) return true;
      return z < floorZ(s) || s > 3.4;
    },
    shade: (x, y, z, face) => {
      const [a, b] = wallOf(alongX, x, y);
      const s = -b;
      const prison = s > T.prisonFrom;
      // how far up the dark it is
      const dark = s > 3.3 ? 1 : Math.max(0, (s - 1.1) / 2.6);
      let c: string;
      if (a <= left + 0.001 || a >= right - 0.001) {
        // the side wall: in courses; the chapel's stone low, the prison's above
        const row = Math.floor((z + 400) / 10);
        const joint = (z + 400) % 10 < 1 || (((s * 3 + (row % 2) * 0.5) % 1) + 1) % 1 < 0.06;
        const R = z > floorZ(s) + 2 && prison ? PRISON_STONE : STONE;
        c = joint ? SEAM : R[2];
      } else {
        const st = Math.min(T.steps, Math.ceil((s - 0.04) / T.tread));
        const R = st > T.prisonFrom / T.tread ? PRISON_STONE : STONE;
        // the tread (lit), its nose (lit edge; iron on the prison's), the riser (turned to the room: lit as the face is)
        const zr = floorZ(s);
        const onTread = face === 'z' || z >= zr - 0.6;
        const nose = (((s - 0.04) / T.tread) % 1 + 1) % 1 > 0.86;
        if (onTread) c = nose ? (st > T.prisonFrom / T.tread ? PRISON_IRON[4] : R[4]) : R[3];
        else c = (zr - z) < 1.5 ? (st > T.prisonFrom / T.tread ? PRISON_IRON[2] : R[1]) : R[2];
        if (s <= 0.04) c = STONE[4];
      }
      return mixC(alongX ? c : shaded(c), BEYOND, Math.min(0.92, dark * 0.95));
    },
  }, 0.012, (px, py) => S.open.has(py * S.p.w + px));
  const s = finishStretch(S);
  // (the firelight of floor 3's basket at the stair's head, out of sight up it: its glow in the arch's head)
  const L = CHAPEL_LIGHTS.wayIn;
  const [gx, gy] = S.D.at(...worldOf(alongX, A.a, -0.6), L.up);
  s.lights = [{ x: Math.round(gx) / GRAIN, y: Math.round(gy) / GRAIN, r: L.glow.r + [0, 1, 0, -1][f & 3], color: L.glow.color, a: L.glow.a + [0, 0.02, 0.01, -0.01][f & 3] } as Light];
  return s;
}

// =================================================================================================
// THE HALL'S PIERS: at its back corners, fluted, on square plinths, up to a capital carved with knuckle bones at 100, the ribs
// of the vault springing from it over the hall and lost in the dark (fading in the game's four steps). Obstacles.

export const PIER = { cap: 100, r: 0.24, climb: 90, reach: 2.0 };
function pierPicture(towardX: number): Sprite {
  const W = 220;
  const H = 260;
  const AX = 110;
  const AY = 240;
  const p = new Px(W, H);
  const D = new Deep(p, AX, AY);
  const cap = PIER.cap;
  const top = cap + 12;
  D.march({
    box: { x0: -0.4, y0: -0.4, z0: 0, x1: 0.4, y1: 0.4, z1: top },
    inside: (x, y, z) => {
      if (z < 10) return Math.max(Math.abs(x), Math.abs(y)) < 0.34;
      if (z < 15) return Math.hypot(x, y) < 0.3;
      if (z >= cap) return Math.hypot(x, y) < (z < cap + 4 ? 0.3 : 0.37);
      return Math.hypot(x, y) < PIER.r;
    },
    shade: (x, y, z, face) => {
      const a = Math.atan2(y, x);
      const lt = Math.cos(a - 2.0);
      let k = lt > 0.65 ? 4 : lt > 0.15 ? 3 : lt > -0.35 ? 2 : lt > -0.8 ? 1 : 0;
      if (z >= 15 && z < cap && Math.cos(a * 8 + 0.4) < -0.75) k -= 1;
      if (z < 10) k = face === 'z' ? 3 : face === 'y' ? 2 : 1;
      else if (z < 15) k = Math.min(4, k + 1);
      else if (z >= cap) k = face === 'z' || z >= top - 2 ? 4 : z < cap + 4 ? k - 1 : k;
      if (z >= cap + 4 && z < top - 2 && face !== 'z') {
        const kn = knucklePx(((Math.floor(a * 9 + 40) % 4) + 4) % 4, Math.floor(z - cap - 4) % 3, lt > 0 ? 0 : 1);
        if (kn) return kn;
      }
      return STONE[clampK(k)];
    },
  }, 0.01);
  // THE RIBS: up off the capital near upright, then curving out over the hall (toward its middle, and along its two walls)
  const fadeFrom = top + 10;
  const dirs: [number, number, number][] = [[towardX, 0, 1], [0, 1, 1], [towardX, 1, 1.2]];
  for (const [ux, uy, k] of dirs) {
    const m = Math.hypot(ux, uy);
    const reach = PIER.reach * k;
    const climb = PIER.climb * (k > 1 ? 1.1 : 1);
    const n = Math.ceil((reach * 40 + climb) * 3);
    let last: [number, number] | null = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const sx = 1 - Math.cos((t * Math.PI) / 2);
      const wx = (ux / m) * (0.26 + reach * sx);
      const wy = (uy / m) * (0.26 + reach * sx);
      const wz = top + climb * Math.sin((t * Math.PI) / 2);
      const [X0, Y0] = D.at(wx, wy, wz);
      const fstep = Math.floor(((wz - fadeFrom) / (climb * 0.85)) * 4);
      if (fstep >= 4) break;
      const [tx, ty] = last ? [X0 - last[0], Y0 - last[1]] : [0, -1];
      last = [X0, Y0];
      const tm = Math.hypot(tx, ty) || 1;
      let nx = -ty / tm;
      let ny = tx / tm;
      if (nx + ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const across = dx * nx + dy * ny;
        const along = Math.abs(dx * (tx / tm) + dy * (ty / tm));
        if (Math.abs(across) > 3.2 || along > 1.2) continue;
        const c = across > 2.4 ? STONE[4] : across > 0.8 ? STONE[3] : across > -0.8 ? STONE[2] : across > -2.4 ? STONE[1] : SEAM;
        const X = Math.round(X0) + dx;
        const Y = Math.round(Y0) + dy;
        // (lost in the dark as it climbs: the game's four steps of a wall's fading top)
        if (D.put(X, Y, wx + wy, c)) p.d[(Y * W + X) * 4 + 3] = fstep < 0 ? 255 : Math.round(255 * FADE_STEPS[3 - fstep]);
      }
    }
  }
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// FLOOR 4'S OWN PIECES IN LOOK A'S COLOURS: their colours drawn toward the stone's grey and the bone's ivory (a third of their
// colour kept, warmed), as the look's pictures had them (docs/mockups/floor4_look, `graded`); fire is fire and stays as it is

/** A colour of floor 4's own pieces as look A has it. */
export function gradedA(c: string): string {
  if (SHINES.has(c)) return c;
  const [r0, g0, b0] = hexOf(c);
  const l = 0.3 * r0 + 0.55 * g0 + 0.15 * b0;
  return toHex((l + (r0 - l) * 0.3) * 1.04 + 5, (l + (g0 - l) * 0.3) * 0.98 + 2, (l + (b0 - l) * 0.3) * 0.86 - 2);
}
/** And what of the enemy's own was in them stays: his pink in the cave's far glow is a shine of his (art/floor4.ts PINK). */
const gradedMemo = new WeakMap<Sprite, Sprite>();
export function gradeSprite(s: Sprite): Sprite {
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
    if (!c) memo.set(key, (c = gradedA(`#${key.toString(16).padStart(6, '0')}`)));
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
// THE CAVE TO FLOOR 5 in look A's colours: art/cave4.ts's film (his yes), its shape, its size, its anchor and its timing
// unchanged; its skull wall, its rubble and its dust graded as floor 4's pieces are, so that it stands among the hall's walls

export interface ChapelCave {
  /** The wall standing (while he lives), its frames from his fall (CAVE_FRAMES, at 30 a second), the cave once open in its two layers. */
  before: Sprite;
  frame(f: number): Sprite;
  under: Sprite;
  over: Sprite;
  jolts: number[];
}
const caves = new Map<boolean, ChapelCave>();
export function chapelCave(alongX: boolean): ChapelCave {
  const hit = caves.get(alongX);
  if (hit) return hit;
  const film = caveFilm(alongX);
  const frames = new Map<number, Sprite>();
  const c: ChapelCave = {
    before: gradeSprite(film.before),
    frame(f) {
      const k = Math.max(0, Math.min(CAVE_FRAMES - 1, Math.floor(f)));
      let s = frames.get(k);
      if (!s) frames.set(k, (s = gradeSprite(film.frames[k])));
      return s;
    },
    under: gradeSprite(film.under),
    over: gradeSprite(film.over),
    jolts: film.jolts,
  };
  caves.set(alongX, c);
  return c;
}

// =================================================================================================
// THE LIGHTS, for the main chat to place (the renderer's own: a hole cut in the dark, render.ts `spot`, and a warm glow drawn
// over it, `drawGlow` / a sprite's `lights`). In game pixels, from where each thing is anchored.

export const CHAPEL_LIGHTS = {
  /** The floor's dark on floor 4: the Crypt's FAR_DARK is 0.88; look A's candlelit dark. */
  dark: 0.82,
  /** The candles in the niches of a tile of wall: a hole at its face (from the foot of the face under its middle, `up`), and its glow. One to every wall tile. */
  niche: { up: 14, r: 34, strength: 0.6, glow: { r: 16, color: CANDLE_GOLD, a: 0.26 } },
  /** The hall's walls, their lower niches fuller: the same, a little stronger. */
  hallNiche: { up: 9, r: 36, strength: 0.66, glow: { r: 16, color: CANDLE_GOLD, a: 0.3 } },
  /** Candles on the floor (the pieces): a hole at the cluster, `up` over its foot, and its glow (on the pieces' own `lights`). */
  floorCandles: { up: 12, r: 48, strength: 0.82, glow: { r: 20, color: CANDLE_GOLD, a: 0.36 } },
  /** A miner's lantern on a break-in's prop: a hole at it, and its glow, an honest orange (the miners' fire, not the chapel's gold). */
  lantern: { r: 60, strength: 0.88, glow: { r: 24, color: EMBER[2], a: 0.4 } },
  /** The way in: floor 3's fire basket burning low up the stair, out of sight: a hole in the arch's head, `up` over the floor, and its glow. */
  wayIn: { up: 40, r: 44, strength: 0.6, glow: { r: 26, color: EMBER[2], a: 0.3 } },
} as const;

// =================================================================================================
// ALL OF IT

export interface ChapelHall {
  /** The hall's wall: along x (lit) and along y (in shade), four tiles laid in order, k = 0 to 3 (the tile's place along the wall mod 4), each four frames (the candles). */
  faceLeft: Sprite[][];
  faceRight: Sprite[][];
  /** The cave to floor 5 in a back wall of the hall (art/cave4.ts's, in look A's colours). */
  cave(alongX: boolean): ChapelCave;
}
export interface ChapelStretch {
  /** Four frames (the flames move), each three tiles of wall as one picture, anchored at the foot of the face under the middle of its middle tile. */
  frames: Sprite[];
}
export interface ChapelArt {
  /** The worn flags of tile (tx, ty). */
  floor(tx: number, ty: number): Sprite;
  /** Floor tiles laid over the flags: grave slabs, bone dust, chips; the break-in's rubble and earth. */
  tiles: Piece[];
  /** A tile of the chapel's wall: along x (turned to screen-left, lit) and along y (to screen-right, in shade); four of each ([0] and [2] carry a pilaster: a bay's first tile), each four frames (its candles). Anchored as the game's walls are. */
  faceLeft: Sprite[][];
  faceRight: Sprite[][];
  /** The wall's face for wall tile (tx, ty), frame f, so that the pilasters fall every two tiles along it. */
  face(alongX: boolean, tx: number, ty: number, f?: number): Sprite;
  /** The break-in, three tiles of a wall along x or y. */
  breakIn(alongX: boolean): ChapelStretch;
  /** The way in from floor 3, three tiles of a wall along x or y. */
  wayIn(alongX: boolean): ChapelStretch;
  /** The boss hall, flat. */
  hall: ChapelHall;
  /** The chapel's own pieces and floor 4's own in look A's colours. */
  pieces: Piece[];
}

/** The chapel's own pieces' names (the rest of `pieces` are floor 4's own, in look A's colours). */
export const CHAPEL_OWN = [
  'candles on the floor, a few', 'candles on the floor, many', 'rock spilled from the break, along x', 'rock spilled from the break, along y',
  'a broken pew', 'a pew thrown down', 'a dropped pick', 'a pier of the hall, its ribs toward x', 'a pier of the hall, its ribs away from x',
] as const;

const four = [0, 1, 2, 3];
let made: ChapelArt | null = null;
/** The chapel's pictures, made the first time they are asked for and kept (the stretches and the cave when first asked for). */
export function makeChapelArt(): ChapelArt {
  if (made) return made;
  const floors = new Map<string, Sprite>();
  const faces = (alongX: boolean, kind: WallKind, seed0: number): Sprite[][] => [0, 1, 2, 3].map((k) => four.map((f) => wallTile(alongX, k % 2, seed0 + k * 17, f, kind)));
  const faceLeft = faces(true, 'chapel', 300);
  const faceRight = faces(false, 'chapel', 307);
  const tile = (name: string, frames: Sprite[]): Piece => ({ name, kind: 'floor tile' as PieceKind, frames });
  const stretches = new Map<string, ChapelStretch>();
  const stretch = (key: string, make: (f: number) => Sprite): ChapelStretch => {
    let s = stretches.get(key);
    if (!s) stretches.set(key, (s = { frames: four.map(make) }));
    return s;
  };
  const own = ossuaryPieces().map(gradePiece);
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
      tile('a grave slab', [slabTile('y', 1, 0, 1)]),
      tile('a grave slab along x, its head', [slabTile('x', 2, 0, 2)]),
      tile('a grave slab along x, its foot', [slabTile('x', 2, 1, 2)]),
      tile('a grave slab along y, its head', [slabTile('y', 2, 0, 3)]),
      tile('a grave slab along y, its foot', [slabTile('y', 2, 1, 3)]),
      tile('bone dust', [dustTile('none', 701)]),
      tile('bone dust at a wall along x', [dustTile('x', 703)]),
      tile('bone dust at a wall along y', [dustTile('y', 705)]),
      tile('bone chips', [chipsTile()]),
      tile('rubble from the break, along x', [rubbleTile('x')]),
      tile('rubble from the break, along y', [rubbleTile('y')]),
      tile('earth spilled from the break, along x', [earthTile('x')]),
      tile('earth spilled from the break, along y', [earthTile('y')]),
    ],
    faceLeft,
    faceRight,
    face(alongX, tx, ty, f = 0) {
      const along = alongX ? tx : ty;
      const first = ((along % BAY) + BAY) % BAY === 0;
      const pick = hash(tx >> 1, ty >> 1, 77) < 0.5 ? 0 : 2;
      const list = alongX ? faceLeft : faceRight;
      return list[first ? pick : pick + 1][((f % 4) + 4) % 4];
    },
    breakIn: (alongX) => stretch(`break${alongX}`, (f) => breakInPicture(alongX, f)),
    wayIn: (alongX) => stretch(`way${alongX}`, (f) => wayInPicture(alongX, f)),
    hall: {
      faceLeft: faces(true, 'hall', 371),
      faceRight: faces(false, 'hall', 372),
      cave: chapelCave,
    },
    pieces: [
      { name: 'candles on the floor, a few', kind: 'on the floor', frames: four.map((f) => candlesOnFloor(4, 0.24, 3, f)) },
      { name: 'candles on the floor, many', kind: 'on the floor', frames: four.map((f) => candlesOnFloor(8, 0.36, 5, f)) },
      { name: 'rock spilled from the break, along x', kind: 'obstacle', frames: [rockSpill(true)], shadow: 0.5 },
      { name: 'rock spilled from the break, along y', kind: 'obstacle', frames: [rockSpill(false)], shadow: 0.5 },
      { name: 'a broken pew', kind: 'obstacle', frames: [pew('snapped', 0.3)], shadow: 0.44 },
      { name: 'a pew thrown down', kind: 'obstacle', frames: [pew('back', -0.45)], shadow: 0.44 },
      { name: 'a dropped pick', kind: 'on the floor', frames: [droppedPick()] },
      { name: 'a pier of the hall, its ribs toward x', kind: 'obstacle', frames: [pierPicture(1)], shadow: 0.4 },
      { name: 'a pier of the hall, its ribs away from x', kind: 'obstacle', frames: [pierPicture(-1)], shadow: 0.4 },
      ...own,
    ],
  };
  return made;
}
/** Let the chapel's pictures go (they are made again if they are wanted). */
export function forgetChapel(): void {
  made = null;
}
