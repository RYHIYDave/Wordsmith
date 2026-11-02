// FLOOR 5, THE FLESHMANCER'S FLOOR: THE MINE THAT BECOMES HIS TEMPLE, LOOK A (THROUGH THE THRESHOLD), ITS PIECES READY FOR
// THE GAME (the art chat, 2 Nov 2026). Behind the switch LAIR_TEMPLE, off; nothing of the game imports it until the main chat
// puts it in. (Not art/lair.ts: that is the game's own floor 5 look today, `LAIR`, and stays as it is.)
//
// His words that began it, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.
// Floor 1 and 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”; for
// floor 5: “I like the temple but I need the mine to be a prominent part of it.  Like you start in the mine then it becomes a
// temple further on”. Of its three looks (docs/mockups/floor5_look), his pick, 2 Nov 2026: “A, through the threshold
// (Recommended)”, offered as: lantern-lit mine, then carved black doorways into the temple, lit pink by the rift. (His gate:
// art/lair_gate.ts.)
//
// WHAT IS HERE, each in the game's own measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32), anchored as
// the game's own are:
//   mine.floor(tx, ty)      THE MINE'S FLOOR: packed earth and grit, stones, laid on the world (sixteen pictures, every four tiles)
//   mine.tiles              floor tiles over it: THE RAILS on their sleepers (straight along x and y, the four bends, the four
//                           ends), grit and stones, grit drifted at a wall's foot (along x, along y)
//   mine.faceLeft/Right     THE MINE'S WALL a tile at a time, as the game lays walls: 80 high, its top fading into the dark as the
//                           game's; RAW ROCK broken in facets, the scores of the picks, a seam of ore; A TIMBER SET every two tiles
//                           (a squared post, the cap along the wall, a wedge), lagging boards between some; A MINER'S LANTERN on
//                           some posts (four frames: its flame moves). `mine.face(alongX, tx, ty, f)` picks them
//   temple.floor(tx, ty)    THE TEMPLE'S FLOOR: great black flags, a tile each, a carved border round each
//   temple.tiles            THE RIFT'S PINK CRACKS through the flags (along x and y, dull or glowing (four frames: they breathe),
//                           and their ends), bones on the flags
//   temple.faceLeft/Right   THE TEMPLE'S WALL: black dressed stone in courses on a moulded plinth, A PILASTER every two tiles, and
//                           between them A HANGING (oxblood, the cult's mark on it in chalk) or A CARVED PANEL with THE SHRIEKING
//                           SKULL (art/floor5.ts `shriekAt`). `temple.face(alongX, tx, ty, f)` picks them
//   threshold(alongX)       THE THRESHOLD: the carved black-stone doorway where the mine meets the temple, cut into the raw rock,
//                           pilasters with the mark on their capitals, a band carved like a row of teeth round a corbelled way, the
//                           mark at its head with the enemy's pink dull in its eyes; strips (art/gates.ts) over the doorway's three
//                           tiles and a tile of wall either side, stood as a gate's arch is
//   mouth(alongX)           THE CAVE'S MOUTH FROM FLOOR 4 (art/cave4.ts `lairMouth`): its cave, its rim, its shape and its anchor
//                           unchanged, in look A's colours, the wall round it the mine's
//   hall                    THE BOSS HALL, FLAT: the temple at its fullest (a hanging or the mark in every bay, the rift's cracks up
//                           its walls, glowing); the rift and the shaft are floor 5's own pieces (the shaft unchanged)
//   pieces                  the place's own (the rails' stops, a cart on the rails, a lantern post, a brazier) and floor 5's own
//                           pieces, his yes already (art/floor5.ts), each in look A's colours for the part it belongs to
//                           (`LAIR_PART`: the mine's warmed toward its rock and timber, the temple's cooled toward its black stone)
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game the renderer lays its darkness and cuts a hole where each
// light burns (render.ts, light), and what gives light is drawn over it: the lanterns', the braziers', the rift's. What the
// main chat should place is in docs/mockups/floor5_look/README.md ("Made game-ready") and in LAIR_LIGHTS here; the light
// painted into the pictures he picked was the guide.
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to
// screen-right in shade); a dark base, the place a step quieter than the figures; nothing cyan (the friend's); the enemy's pink
// only in the rift and its cracks, the cult's marks over the threshold and his gate, and him; fire an honest orange.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Iso } from './isokit';
import { GRAIN, compose, hash } from './kit';
import { EMBER } from './props';
import { FLAME } from './mkit';
import { SHINES } from './floorkit';
import type { Piece, PieceKind, Spot } from './floorkit';
import { lairPieces, shriekAt } from './floor5';
import { lairMouth } from './cave4';
import type { MouthArt } from './cave4';
import { wallFacePixels } from './ground';
import { LAIR } from './lair';
import { CART_LOAD, Scene, paintCart } from './floor4';
import type { V3 } from './floor4';
import { Flat } from './gates';
import type { Strip } from './gates';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const LAIR_TEMPLE = { on: false };

// =================================================================================================
// MEASURES

const TW = 64;
const TH = 32;
const HALF = TW / 2;
/** How high floor 5's walls stand (picture pixels: the game's WALL_LOOK.tall, 40, at two to a game pixel), and how much of their top fades into the dark (its `fade`, 12). */
export const LAIR_WALL = 80;
export const LAIR_FADE = 24;
/** The game's four steps of a wall's top fading out (art/ground.ts, `put`): how much of each is there, from the top down. */
export const FADE_STEPS = [0.14, 0.38, 0.62, 0.84] as const;
/** A bay of the wall: two tiles, a post (the mine) or a pilaster (the temple) at its start. */
export const BAY = 2;

// =================================================================================================
// LOOK A'S COLOURS (his pick; docs/mockups/floor5_look, PALS.threshold): a warm brown rock under the lanterns; past the threshold
// the temple's stone near black, cold. Five tones a material, its seam to its lit edge.

type R5 = readonly [string, string, string, string, string];
export const ROCK: R5 = ['#110d0b', '#211914', '#30251d', '#433428', '#5b4836'];
export const STONE: R5 = ['#08070c', '#121018', '#1c1924', '#282433', '#3b3549'];
export const EARTH: R5 = ['#0f0b09', '#1c1510', '#291f17', '#372a1f', '#4a3a2b'];
export const FLAGS: R5 = ['#09080d', '#131118', '#1d1a24', '#292532', '#3a3446'];
export const BONE: R5 = ['#1a1716', '#302a26', '#4a4139', '#655a4d', '#7f725f'];
export const WOOD: R5 = ['#140d09', '#26180f', '#3a2616', '#50351f', '#6a472a'];
export const IRON: R5 = ['#0a0a0c', '#161518', '#232026', '#332f37', '#4c4752'];
/** The cult's hangings: an old oxblood cloth, a red gone brown (never the enemy's pink). */
export const CLOTH: R5 = ['#120808', '#260e0d', '#3a1512', '#4f1d18', '#652720'];
/** Chalk: the cult's mark painted on the hangings. */
const CHALK = ['#5a554f', '#7c766d'] as const;
/** A seam of ore in the rock, dull. */
const ORE = ['#4a3c24', '#6a5530'] as const;
/** The rails' iron: shade, body, its worn top, the shine on it. */
const RAIL = ['#121010', '#2e2a26', '#463f38', '#5e564c'] as const;
const SEAM = '#07060a';
const BEYOND = '#050407';
/** The rift's own fire in its cracks and in the cult's marks: the enemy's pink (art/mkit.ts FLAME), dull at its deep end. */
const RIFT = FLAME;
/** Where the rift's light stains the stone round a crack: a dark wine, too dark to read as pink. */
const STAIN = '#2a0b24';
/** What shines of itself here: never shaded, never faded, never graded. */
const OWN = new Set<string>([...EMBER, ...FLAME]);

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
/** Three octaves of it, repeating every four tiles (whole-number scales of x and y keep it so). */
const fbm4 = (x: number, y: number, k = 0): number => 0.55 * noiseP(x, y, k, 4) + 0.3 * noiseP(x * 2, y * 2, k + 11, 8) + 0.15 * noiseP(x * 4, y * 4, k + 23, 16);
/** Plain smooth noise (not repeating): for what is painted once. */
export function noise(x: number, y: number, k = 0): number {
  return noiseP(x, y, k, 1 << 20);
}
/** A hash of the cell of a point at `n` cells a tile, repeating every four tiles. */
const cell = (x: number, y: number, n: number, seed: number): number => {
  const m = 4 * n;
  return hash(((Math.floor(x * n) % m) + m) % m, ((Math.floor(y * n) % m) + m) % m, seed);
};

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
export function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const c = s.img;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const d = q.getImageData(0, 0, c.width, c.height).data;
  const p = new Px(c.width, c.height);
  p.d.set(d);
  return p;
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

/** The cult's mark, the shrieking skull, at (i, j) from its middle (j up), `r` its half width: 'bone' (raised, lit) or 'dark' (cut in), or null. */
export function markPx(i: number, j: number, r: number): 'bone' | 'dark' | null {
  return shriekAt((i + 0.5) / r, (j + 0.5) / r);
}

// =================================================================================================
// THINGS THAT STAND, painted in depth: for every pixel the line of sight is followed into the thing, and the first point inside
// it is what is seen. World in tiles (x down the screen to the right, y down to the left), z up in picture pixels; a point
// (x, y, z) is at (OX + (x - y) 32, OY + (x + y) 16 - z) on the picture. (As floor 4's chapel: art/chapel.ts on its branch.)

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
  march(s: Solid, step = 0.012): void {
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
        const q = (px + 0.5 - this.ox) / 32;
        let lo = Math.max(2 * b.x0 - q, 2 * b.y0 + q, (b.z0 + sy) / 16);
        const hi = Math.min(2 * b.x1 - q, 2 * b.y1 + q, (b.z1 + sy) / 16);
        if (hi <= lo) continue;
        const seen = this.dep[py * this.p.w + px];
        if (hi < seen) continue;
        lo = Math.max(lo - step, seen);
        const pt = (t: number): [number, number, number] => [(t + q) / 2, (t - q) / 2, 16 * t - sy];
        let prevT: number | null = null;
        for (let t = hi; t >= lo; t -= step) {
          let [x, y, z] = pt(t);
          if (s.inside(x, y, z)) {
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
/** A box turned about the upright by `yaw`: timber, iron, its grain along it. */
function boxSolid(c: [number, number, number], half: [number, number, number], yaw: number, ramp: R5, grain = true): Solid {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const local = (x: number, y: number, z: number): [number, number, number] => {
    const dx = x - c[0];
    const dy = y - c[1];
    return [dx * cy + dy * sy, -dx * sy + dy * cy, (z - c[2]) / 32];
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
      const wx = n[0] * cy - n[1] * sy;
      const wy = n[0] * sy + n[1] * cy;
      let k = Math.min(3, litTone(wx, wy, n[2]));
      const edges = [ex, ey, ez].filter((v) => v < 0.025).length;
      if (edges >= 2 && k >= 2) k += 1;
      if (grain && Math.abs(((lx * 7 + hash(Math.floor(ly * 20 + 50), 1, 921) * 3) % 1 + 1) % 1 - 0.5) < 0.05) k -= 1;
      return ramp[clampK(k)];
    },
  };
}

// =================================================================================================
// THE MINE'S FLOOR: packed earth, trodden smooth in places, darker in drifts; grit, and little stones lit on their upper left

/** The mine's floor at a point of the world, before anything is laid over it. */
export function mineFloorAt(x: number, y: number): string {
  const g = fbm4(x * 2, y * 2, 731);
  let e = g > 0.64 ? 3 : g > 0.47 ? 2 : g > 0.34 ? 1 : 0;
  // a trodden, smoother patch here and there
  const t = fbm4(x, y, 733);
  if (t > 0.6 && e < 2) e = 2;
  // little stones: one in some cells of an eighth of a tile, lit on its upper left, its shadow under it
  const n = 8;
  const cx = Math.floor(x * n);
  const cy = Math.floor(y * n);
  const h = cell(x, y, n, 741);
  if (h < 0.2) {
    const sx = (cx + 0.3 + cell(x, y, n, 743) * 0.4) / n;
    const sy = (cy + 0.3 + cell(x, y, n, 745) * 0.4) / n;
    const r = (0.022 + h * 0.13) * (1 + cell(x, y, n, 747) * 0.6);
    const dx = x - sx;
    const dy = y - sy;
    const d = Math.hypot(dx, dy) / r;
    if (d < 1) return dx + dy < -r * 0.3 ? ROCK[4] : dx + dy < r * 0.25 ? ROCK[3] : ROCK[2];
    if (d < 1.35 && dx + dy > 0) return EARTH[0];
  }
  // grit: flecks two pixels wide
  const gh = cell(x, y, 32, 749);
  if (gh > 0.93) return EARTH[4];
  if (gh < 0.05) return EARTH[0];
  return EARTH[clampK(e)];
}

// =================================================================================================
// THE TEMPLE'S FLOOR: great black flags, one to a tile, laid on the tiles' lines; a carved border round each, its edge toward the
// light lit; a crack across some

/** The temple's floor at a point of the world, before anything is laid over it. */
export function templeFloorAt(x: number, y: number): string {
  const fu = x - Math.floor(x);
  const fv = y - Math.floor(y);
  const e = Math.min(fu, fv, 1 - fu, 1 - fv);
  if (e < 0.025) return SEAM;
  if (e < 0.06) return fu < 0.06 || 1 - fv < 0.06 ? FLAGS[4] : FLAGS[1];
  if (e > 0.11 && e < 0.13) return FLAGS[0];
  const tx = ((Math.floor(x) % 4) + 4) % 4;
  const ty = ((Math.floor(y) % 4) + 4) % 4;
  const tone = hash(tx, ty, 611);
  let k = tone < 0.25 ? 1 : tone > 0.88 ? 3 : 2;
  const n = fbm4(x * 4, y * 4, 613);
  if (n > 0.66) k += 1;
  if (n < 0.3) k -= 1;
  if (hash(tx, ty, 615) > 0.7 && Math.abs(fv - 0.5 - (fu - 0.5) * 0.7 + Math.sin(fu * 13) * 0.04) < 0.014) return SEAM;
  return FLAGS[clampK(k)];
}

// =================================================================================================
// FLOOR TILES OF THE MINE: THE RAILS on their sleepers (two iron rails, a third of a tile apart, on sleepers of timber three to a
// tile), straight, bending a quarter turn, or ending; grit and stones

/** Which way a run of rails goes through a tile: from one edge's middle to another's, or from one edge to the tile's middle. */
export type Edge = '-x' | '+x' | '-y' | '+y';
/** Across the rails (0 their middle) and along them (tiles), at a point of the tile (u, v from its top corner), for rails from edge `a` to edge `b` (or to the middle: `b` null), or null. */
function railsAt(u: number, v: number, a: Edge, b: Edge | null): { off: number; s: number } | null {
  const mid = (e: Edge): [number, number] => (e === '-x' ? [0, 0.5] : e === '+x' ? [1, 0.5] : e === '-y' ? [0.5, 0] : [0.5, 1]);
  const along = (e: Edge): 'x' | 'y' => (e[1] === 'x' ? 'x' : 'y');
  if (b === null || along(a) === along(b)) {
    // straight: along x (from -x to +x, or to the middle) or along y
    const ax = along(a) === 'x';
    const s0 = ax ? u : v;
    const off = ax ? v - 0.5 : u - 0.5;
    let s = s0;
    if (b === null) {
      // (from edge `a` to the middle: what is past the middle is not there)
      const fromLow = a[0] === '-';
      if (fromLow ? s0 > 0.62 : s0 < 0.38) return null;
      s = fromLow ? s0 : 1 - s0;
    }
    return { off, s };
  }
  // a quarter turn about the corner the two edges meet at, radius a half
  const [ax, ay] = mid(a);
  const [bx, by] = mid(b);
  const cx = ax === 0.5 ? bx : ax;
  const cy = ay === 0.5 ? by : ay;
  const r = Math.hypot(u - cx, v - cy);
  const ang = Math.atan2(Math.abs(v - cy), Math.abs(u - cx));
  return { off: r - 0.5, s: (ang / (Math.PI / 2)) * (Math.PI / 4) };
}
/** The rails' colour at a point, over the floor `c`: the iron, the sleepers; null where they are not. */
function railPx(u: number, v: number, a: Edge, b: Edge | null): string | null {
  const ra = railsAt(u, v, a, b);
  if (!ra) return null;
  const ao = Math.abs(ra.off);
  if (ao > 0.36) return null;
  const straight = b === null || a[1] === b[1];
  const per = straight ? 3 : 3 / (Math.PI / 4);
  const sl = (((ra.s * per) % 1) + 1) % 1;
  const ri = Math.abs(ao - 0.2);
  if (ri < 0.026) return RAIL[3];
  if (ri < 0.046) return ao < 0.2 ? RAIL[2] : RAIL[1];
  if (ri < 0.062) return RAIL[0];
  if (ao < 0.34 && sl < 0.32) {
    // a sleeper: its edge toward the light lit, its far edge in shade, a split in some
    if (sl < 0.06) return WOOD[4];
    if (sl > 0.26) return WOOD[0];
    return Math.abs(ra.off - 0.08) < 0.012 ? WOOD[1] : WOOD[3];
  }
  // (between the sleepers, the ballast: grit, darker)
  if (ao < 0.3) return null;
  return null;
}
/** A tile of rails from edge `a` to edge `b` (or to the middle), over the mine's floor. */
function railsTile(a: Edge, b: Edge | null, seed: number): Sprite {
  return tileOf((x, y) => {
    const u = x - seed;
    const v = y - 1;
    const c = railPx(u, v, a, b);
    if (c) return c;
    const f = mineFloorAt(x, y);
    // (the ballast between and about them: grit packed darker)
    const ra = railsAt(u, v, a, b);
    if (ra && Math.abs(ra.off) < 0.3 && cell(x, y, 16, 751) < 0.5) return mixC(f, EARTH[0], 0.35);
    return f;
  }, seed, 1);
}
/** Grit and stones scattered over the floor (`at` none), or drifted thick at a wall's foot (the far edge along x, at v = 0; along y, at u = 0). */
function gritTile(at: 'none' | 'x' | 'y', seed: number): Sprite {
  return tileOf((x, y) => {
    const u = x - 3;
    const v = y - 2;
    const c = mineFloorAt(x, y);
    const n = fbm4(x * 5, y * 5, seed);
    const nf = at === 'none' ? 0.5 : at === 'x' ? v : u;
    const thick = at === 'none' ? 0.3 : 0.72 - nf * 0.9;
    if (n > 1 - thick) {
      const e = fbm4(x * 5 - 0.06, y * 5 + 0.06, seed);
      return n > 1 - thick + 0.1 ? (e < n - 0.02 ? ROCK[4] : ROCK[3]) : e < n ? ROCK[2] : ROCK[1];
    }
    if (at !== 'none' && nf < 0.3 && cell(x, y, 24, seed + 1) < 0.4) return ROCK[2];
    return c;
  }, 3, 2);
}

// =================================================================================================
// FLOOR TILES OF THE TEMPLE: THE RIFT'S CRACKS through the flags (a jagged line, its heart the enemy's fire, the stone round it
// stained a dark wine); dull, or glowing (four frames: a pulse runs along it, as the rift breathes); bones on the flags

/** How far a point of the tile (u, v) is from a crack from edge `a` to edge `b` (or to the middle: then it thins to nothing), and how far along it. */
function crackAt(u: number, v: number, a: Edge, b: Edge | null): { d: number; s: number; thin: number } | null {
  const ax = a[1] === 'x';
  const s0 = ax ? u : v;
  const off = ax ? v - 0.5 : u - 0.5;
  let s = s0;
  let thin = 1;
  if (b === null) {
    const fromLow = a[0] === '-';
    s = fromLow ? s0 : 1 - s0;
    if (s > 0.7) return null;
    thin = Math.max(0, 1 - s / 0.7);
  }
  // (a wobble that is nothing at the tile's edges, so that it meets the next tile's crack)
  const w = Math.sin(Math.PI * s0) * (0.09 * Math.sin(s0 * 9.3 + (ax ? 1 : 2)) + 0.05 * Math.sin(s0 * 23 + 0.7) + (noise(s0 * 14, ax ? 3 : 7, 621) - 0.5) * 0.08);
  return { d: Math.abs(off - w), s, thin };
}
function crackTile(a: Edge, b: Edge | null, glow: boolean, f: number): Sprite {
  return tileOf((x, y) => {
    const u = x - 1;
    const v = y - 2;
    const c = templeFloorAt(x, y);
    const k = crackAt(u, v, a, b);
    if (!k) return c;
    const heart = 0.02 * (0.35 + 0.65 * k.thin);
    const rim = heart + 0.018 * k.thin + 0.004;
    if (k.d < heart) {
      if (!glow) return RIFT[0];
      // (a pulse running along it, frame by frame)
      const p = (((k.s * 2 - f / 4) % 1) + 1) % 1;
      return p < 0.25 ? RIFT[2] : RIFT[1];
    }
    if (k.d < rim) return glow ? RIFT[0] : SEAM;
    if (k.d < rim + 0.05 * k.thin + 0.02) return mixC(c === SEAM ? FLAGS[1] : c, STAIN, glow ? 0.5 : 0.35);
    return c;
  }, 1, 2);
}
/** Bones on the flags: a few long bones and their chips, lit on top, their shadows on the stone. */
function bonesTile(): Sprite {
  const p = pixelsOf(tileOf((x, y) => templeFloorAt(x, y), 2, 3));
  const bits: [number, number, number, number][] = [];
  for (let i = 0; i < 8; i++) bits.push([0.15 + hash(i, 1, 811) * 0.7, 0.15 + hash(i, 2, 811) * 0.7, i < 2 ? 7 + Math.floor(hash(i, 3, 811) * 4) : 2 + Math.floor(hash(i, 3, 811) * 3), hash(i, 4, 811) < 0.5 ? 1 : -1]);
  for (const [cx, cy, len, dir] of bits) {
    const X = Math.round(HALF + (cx - cy) * 32);
    const Y = Math.round((cx + cy) * 16);
    for (let k = 0; k < len; k++) {
      const yy = Y + Math.floor((k * dir) / 3);
      const end = len > 4 && (k === 0 || k === len - 1);
      if (!p.has(X + k, yy)) continue;
      p.set(X + k, yy, end ? BONE[4] : k === 1 ? BONE[3] : BONE[2]);
      if (end && p.has(X + k, yy - 1)) p.set(X + k, yy - 1, BONE[3]);
      if (p.has(X + k, yy + 1)) p.set(X + k, yy + 1, SEAM);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// =================================================================================================
// THE MINE'S WALL: raw rock broken in facets, lit from the upper left; the scores of the picks; a seam of ore slanting through;
// A TIMBER SET every two tiles (a squared post against the rock, the cap along the wall over the posts, a wedge over each
// post) and the miners' lagging boards between some; A MINER'S LANTERN hung on some posts. Laid out along the bay from its start
// (J, 0 to 63: J 0 and 32 are the joints between tiles, empty as the game's), painted in the screen's own terms (`sgn`: which
// way J runs on the screen), so that the light falls from the screen's left on either face.

/** The post: its middle and half width along the bay; the cap; the lagging; the lantern (its middle along the bay, its foot). */
export const MINE_SET = { post: 6.5, half: 5, cap0: 50, cap1: 58, lag0: 34, lantern: 17, lanternFoot: 29 };

/** Raw rock at a point of a face (`s` picture pixels along it, `up` over its foot): lumps about 26 across, each a plane of its own. */
export function rawRock(s: number, up: number, seed: number): string {
  const R = ROCK;
  const cx = s / 26;
  const cy = up / 17;
  let best = 9;
  let second = 9;
  let id = 0;
  const ix = Math.floor(cx);
  const iy = Math.floor(cy);
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const px = ix + i + hash(ix + i, iy + j, seed) * 0.9;
    const py = iy + j + hash(ix + i, iy + j, seed + 1) * 0.9;
    const d = Math.hypot(cx - px, (cy - py) * 1.1);
    if (d < best) {
      second = best;
      best = d;
      id = (ix + i) * 131 + (iy + j) * 17;
    } else if (d < second) second = d;
  }
  const edge = second - best;
  if (edge < 0.06) return SEAM;
  const tilt = hash(id, 3, seed);
  let k = tilt < 0.2 ? 1 : tilt < 0.62 ? 2 : tilt < 0.9 ? 3 : 4;
  if (edge < 0.14) k += tilt < 0.5 ? -1 : 1;
  const sc = hash(Math.floor(s / 9), Math.floor(up / 7), seed + 7);
  if (sc > 0.86 && Math.abs(((s + up * 0.7) % 9) - 4) < 0.6) k -= 1;
  if (hash(s >> 1, up >> 1, seed + 9) > 0.9) k -= 1;
  return R[clampK(k)];
}

/** What a bay of the mine's wall has: a lantern on its post, lagging boards between the posts' tops. */
interface MineBay { lantern: boolean; lagging: boolean }

/** The miner's lantern at (i across from its middle on the screen, j up from its foot), frame `f`: its iron, its glass, its flame; null outside it. */
function lanternPx(i: number, j: number, f: number): string | null {
  const ai = Math.abs(i);
  if (j < 0 || j > 13 || ai > 3) return null;
  if (j === 13) return ai === 0 ? IRON[3] : null;
  if (j === 12) return ai <= 1 ? (i < 0 ? IRON[4] : IRON[2]) : null;
  if (j === 11) return ai <= 2 ? (ai === 2 ? IRON[1] : IRON[3]) : null;
  if (j === 10) return ai <= 3 ? IRON[2] : null;
  if (j === 0) return ai <= 2 ? IRON[1] : null;
  if (j === 1) return IRON[2];
  if (ai === 3) return i < 0 ? IRON[3] : IRON[1];
  // the glass and the flame in it
  if (ai <= 1 && j >= 3 && j <= 7) {
    if (j === 7) return i === [0, -1, 0, 1][f & 3] ? EMBER[3] : EMBER[2];
    if (j === 6) return i === 0 || i === [1, 0, -1, 0][f & 3] ? EMBER[3] : EMBER[2];
    return i === 0 ? EMBER[4] : EMBER[3];
  }
  return j === 2 ? EMBER[1] : EMBER[2];
}

/**
 * THE MINE'S WALL at a point: `J` along the bay from its start (0 to 63), `up` over the floor; `sgn` which way J runs on the
 * screen (+1 to the right: a wall along x; -1 to the left: along y); `f` the lantern's frame. A colour (the face as it is lit:
 * in shade along y is the caller's), or undefined where nothing is.
 */
function mineAt(J: number, up: number, sgn: number, seed: number, f: number, bay: MineBay): string | undefined {
  const W = WOOD;
  const S = MINE_SET;
  let d = J + 0.5 - S.post;
  if (d > 32) d -= 64;
  const ds = d * sgn;
  // THE LANTERN on a nail in the post's side (before the post's own picture: it hangs in front of the rock)
  if (bay.lantern) {
    const li = (J + 0.5 - S.lantern) * sgn;
    const lj = up - S.lanternFoot;
    const lc = lanternPx(Math.round(li - 0.5 * sgn), lj, f);
    if (lc) return lc;
    // its nail and the hook it hangs from
    if (up === S.lanternFoot + 14 && J >= S.post + S.half - 1 && J <= S.lantern) return IRON[3];
    if (up === S.lanternFoot + 13 && J >= S.post + S.half && J <= S.lantern) return IRON[1];
  }
  // THE POST: a squared timber, its edge toward the light lit, a split in it
  if (Math.abs(d) <= S.half && up < S.cap0) {
    if (up < 2) return W[1];
    if (ds <= -S.half + 0.5) return W[4];
    if (ds >= S.half - 1) return W[0];
    const split = hash(seed, 2, 551) * 4 - 2;
    if (Math.abs(d - split) < 0.6 && up > 8 && up < 40) return W[1];
    if (up > 2 && up < 5) return W[2];
    return W[ds < -1 ? 3 : 2];
  }
  // THE CAP across the posts' tops, along the wall
  if (up >= S.cap0 && up < S.cap1) {
    if (up === S.cap1 - 1) return W[4];
    if (up === S.cap0) return W[0];
    if (up === S.cap0 + 1) return W[1];
    const g = hash(J >> 3, 5, seed) > 0.8 ? 1 : 0;
    return W[3 - g];
  }
  // the wedge over each post
  if (up >= S.cap1 && up < S.cap1 + 3) {
    const lim = 3 - (up - S.cap1);
    if (Math.abs(d) <= lim) return Math.abs(d) > lim - 1 ? W[4] : W[3];
  }
  // THE LAGGING: boards laid behind the posts' tops, holding the rock back, gaps between them
  if (bay.lagging && up >= S.lag0 && up < S.cap0) {
    const b = Math.floor((up - S.lag0) / 5);
    const lv = (up - S.lag0) % 5;
    const short = hash(b, 1, seed + 3) < 0.3 && J > 44;
    if (!short) {
      if (lv === 4) return SEAM;
      const k = (lv === 3 ? 3 : 2) - (hash(b, 2, seed + 4) < 0.3 ? 1 : 0);
      // (the boards' ends, sawn, every so often)
      if (Math.abs(((J + b * 13 + seed) % 29) - 14) < 0.6) return W[0];
      return W[clampK(k)];
    }
  }
  // AN ORE SEAM: a band slanting through the rock, flecked dull
  const band = up - 22 - Math.sin(J / 21 + seed) * 6 - J * 0.12;
  if (Math.abs((((band % 70) + 70) % 70) - 35) < 2.2 && hash(J, up, seed + 21) > 0.4) return hash(J, up, seed + 23) > 0.7 ? ORE[1] : ORE[0];
  return rawRock(J + seed * 7, up, seed);
}

// =================================================================================================
// THE TEMPLE'S WALL: black worked stone in great courses on a moulded plinth; A PILASTER at the start of every bay (two tiles);
// in the bay's second tile A HANGING (an old oxblood cloth on an iron rod, ragged at its hem, the cult's mark painted on it in
// chalk) or A CARVED PANEL with THE SHRIEKING SKULL in relief; in his hall the rift's cracks up some tiles of it, glowing

/** What a tile of the temple's wall carries: the pilaster (a bay's first tile), a hanging or a panel (its second); a crack of the rift up it (its middle along the tile), or none. */
interface TempleTile { what: 'pilaster' | 'hanging' | 'panel'; crack: number | null }
/** The pilaster's middle and half width along its tile; a hanging's or panel's half width; the hanging's rod. */
export const TEMPLE_BAY = { pilaster: 7.5, pHalf: 7, hHalf: 13, rod: 70, capital: 60 };

/** The rift's crack up a wall: how far a point (j across the tile, up) is from it, its top. Less than 0.8: its heart. */
function wallCrack(j: number, up: number, x0: number, seed: number): number {
  const top = 34 + hash(seed, 1, 95) * 30;
  if (up > top) return 9;
  const wob = Math.sin(up * 0.35 + seed) * 2.6 + Math.sin(up * 0.9 + seed * 2) * 1.3 + (hash(Math.floor(up / 4), seed, 97) - 0.5) * 2.4;
  return Math.abs(j - x0 - wob) + (up / top) * 1.2;
}

function templeAt(j: number, up: number, sgn: number, seed: number, f: number, t: TempleTile): string | undefined {
  const S = STONE;
  const B = TEMPLE_BAY;
  // THE RIFT'S CRACK up the stone (his hall), before all: it runs through the plinth and the courses
  if (t.crack !== null) {
    const e = wallCrack(j, up, t.crack, seed);
    if (e < 0.8) {
      // (a pulse rising up it, frame by frame, as the rift breathes)
      const hot = ((up + 60 - f * 9) % 36) < 10;
      return up < 10 || hot ? RIFT[2] : RIFT[1];
    }
    if (e < 1.6) return RIFT[0];
  }
  const ds = (j + 0.5 - (t.what === 'pilaster' ? B.pilaster : 16)) * sgn;
  let c: string | undefined;
  if (t.what === 'pilaster' && Math.abs(ds) <= B.pHalf) {
    // THE PILASTER: square, on the plinth, a capital band, a groove down it, its edge toward the light lit
    if (up < 12) c = up === 11 ? S[4] : up < 2 ? S[1] : S[2];
    else if (up >= B.capital && up < B.capital + 6) c = up === B.capital + 5 ? S[4] : up === B.capital ? SEAM : S[3];
    else if (ds <= -B.pHalf + 0.5) c = S[4];
    else if (ds <= -B.pHalf + 1.5) c = S[3];
    else if (ds >= B.pHalf - 1) c = S[0];
    else if (Math.abs(ds) < 0.6) c = S[1];
    else c = S[2];
  } else if (up < 12) {
    // THE PLINTH: a moulding
    c = up === 11 ? S[4] : up === 10 ? S[2] : up === 9 ? SEAM : up < 2 ? S[1] : S[2];
  } else if (t.what === 'hanging' && Math.abs(ds) <= B.hHalf + 1 && up >= B.rod && up < B.rod + 2) {
    // the hanging's rod, its ends knobbed
    c = Math.abs(ds) > B.hHalf ? IRON[4] : up === B.rod + 1 ? IRON[3] : IRON[1];
  } else if (t.what === 'hanging' && Math.abs(ds) <= B.hHalf) {
    // A HANGING from the rod down to a ragged hem; folds lit on their left; the mark in chalk at its middle
    const hem = 16 + Math.floor(hash(seed, Math.floor((ds + 20) / 3), 41) * 7);
    if (up < B.rod && up >= hem) {
      const C = CLOTH;
      const fo = (((ds + 13) % 9) + 9) % 9;
      let kk = fo < 2 ? 3 : fo < 6 ? 2 : 1;
      if (Math.abs(ds) >= B.hHalf - 0.5) kk = 0;
      if (up >= B.rod - 2) kk = Math.min(4, kk + 1);
      const mk = markPx(Math.round(ds - 0.5), up - 44, 9);
      if (mk === 'bone') return mixC(CHALK[1], C[2], 0.35);
      if (mk === 'dark') return C[0];
      if (up < hem + 3 && hash(seed, Math.floor(ds + 20), 43) > 0.75) c = undefined;
      else return C[clampK(kk)];
    }
  } else if (t.what === 'panel' && Math.abs(ds) <= B.hHalf && up >= 22 && up < 62) {
    // A CARVED PANEL: sunk, its frame lit on its upper-left edge; THE SHRIEKING SKULL in relief in it
    const e = Math.min(B.hHalf - Math.abs(ds), up - 22, 61 - up);
    if (e < 1) c = ds < 0 || up > 58 ? S[4] : S[1];
    else if (e < 3) c = S[3];
    else if (e < 4) c = SEAM;
    else {
      const mk = markPx(Math.round(ds - 0.5), up - 42, 9);
      if (mk === 'bone') c = markPx(Math.round(ds - 1.5), up - 41, 9) === null ? S[4] : S[3];
      else if (mk === 'dark') c = SEAM;
      else c = S[1];
    }
  }
  if (c === undefined) {
    // THE STONE, in courses 16 high, blocks 30 to 44 long, their edges dressed
    const CH = 16;
    const cv = up - 12;
    const row = Math.floor(cv / CH);
    const lv = cv % CH;
    const off = Math.floor(hash(row, seed, 1) * 40);
    const L = 30 + Math.floor(hash(row, seed, 2) * 14);
    const uu = j * sgn + off + 400;
    const b = Math.floor(uu / L);
    const lu = (((uu % L) + L) % L);
    if (lv === CH - 1 || lu === 0) c = SEAM;
    else {
      let kk = 2;
      const tone = hash(b, row * 7 + seed, 3);
      if (tone < 0.2) kk -= 1;
      else if (tone > 0.92) kk += 1;
      if (lv === CH - 2) kk += 1;
      if (lu === 1) kk += 1;
      if (lv === 0 || lu === L - 1) kk -= 1;
      c = S[clampK(kk)];
    }
  }
  // the stone round a crack stained by the rift's light
  if (t.crack !== null && c !== SEAM && wallCrack(j, up, t.crack, seed) < 3.2) return mixC(c, STAIN, 0.45);
  return c;
}

/** Fade the top of each column of a face, as the game's (its four steps), where `fades` says: the rows `top` to `top + LAIR_FADE`. */
function fadeTop(p: Px, topOf: (x: number) => number | null, fades: (x: number, y: number) => boolean): void {
  for (let x = 0; x < p.w; x++) {
    const top = topOf(x);
    if (top === null) continue;
    for (let k = 0; k < LAIR_FADE; k++) {
      const y = top + k;
      const c = p.get(x, y);
      if (!c || OWN.has(c) || !fades(x, y)) continue;
      p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / LAIR_FADE)]);
    }
  }
}

/**
 * A TILE OF WALL: its one face, as the game's walls are laid (art/ground.ts, a face alone): along x its face turned to screen-
 * left, along y to screen-right, standing on the tile's near edge; LAIR_WALL high, its top LAIR_FADE fading out in the game's
 * four steps. `paint(J, up, sgn)` its face (J along the bay from `J0`). Anchored at the floor point of the tile's top corner.
 * `glow`: a point of the face (J, up) whose place on the picture is its light's.
 */
function wallTile(alongX: boolean, J0: number, paint: (J: number, up: number, sgn: number) => string | undefined, glow?: [number, number]): { s: Sprite; at: [number, number] | null } {
  const H = LAIR_WALL;
  const p = new Px(TW, TH + H);
  const iso = new Iso(p, HALF, H);
  const tops = new Map<number, number>();
  let at: [number, number] | null = null;
  const shade = (_u: number, v: number, _w: number, h: number, px: number, py: number): string | null => {
    // (floor 5's walls fill the column between two tiles' faces, as the game's own do there: art/lair.ts, its earth `dug`)
    if (v === 0) tops.set(px, py);
    const up = h - 1 - v;
    const J = alongX ? J0 + px : J0 + (TW - 1 - px);
    if (glow && J === glow[0] && up === glow[1]) at = [px, py];
    const c = paint(J, up, alongX ? 1 : -1);
    if (c === undefined) return null;
    return alongX ? c : shaded(c);
  };
  if (alongX) iso.left(0, 1, 1, 0, H, shade);
  else iso.right(1, 0, 1, 0, H, shade);
  fadeTop(p, (x) => tops.get(x) ?? null, () => true);
  return { s: p.sprite(HALF, H, GRAIN), at };
}

// =================================================================================================
// THE THRESHOLD: where the mine meets the temple. A broad front of black worked stone cut into the raw rock round a doorway:
// pilasters either side with the mark on their capitals, a broad band carved like a row of teeth round a corbelled way (its
// sides stepping in toward its head), the mark at its head with the enemy's pink dull in its eyes, a stepped crown over it
// standing whole over the wall's fading top. Strips (art/gates.ts, Flat) from the outer edge of the tile of wall before the
// doorway (u -32) to the outer edge of the tile after it (u 128); u 0 to 96 the doorway's three tiles, open under the head.

/** Its measures, from the way's middle (du) and up: the way's half width and the corbels of its head; the band; the pilasters; the mark; the crown. */
export const THRESHOLD = {
  half: 46, jamb: 42, steps: [[42, 38], [50, 30], [58, 20]] as const, head: 66, band: 10,
  pil0: 58, pil1: 72, cap: 52, reach: 79, markZ: 88, markR: 9, crown: 104, crownHalf: 30,
};

/** Is a point (du from the way's middle, up) in the way through? */
export function inThresholdWay(du: number, up: number): boolean {
  const a = Math.abs(du);
  if (up < 0) return false;
  if (up < THRESHOLD.jamb) return a < THRESHOLD.half;
  for (const [z, h] of THRESHOLD.steps) if (up < z + 8) return a < h;
  return false;
}
/** The front's top over a point along it. */
function thresholdTop(du: number): number {
  const a = Math.abs(du);
  if (a < THRESHOLD.crownHalf - 8) return THRESHOLD.crown;
  if (a < THRESHOLD.crownHalf) return THRESHOLD.crown - 8;
  if (a < THRESHOLD.crownHalf + 10) return LAIR_WALL + 8;
  return LAIR_WALL;
}

/** The threshold's stone: the temple's, a tone lifted (it is the way on, and is seen from across the dark, as his gate is). */
const T_STONE: R5 = ['#0e0c13', '#1a1722', '#25212e', '#332e3e', '#4a4359'];
/** THE THRESHOLD's face at a point (du from the way's middle, screen-relative: less than 0 toward the light; up). Null: the way, or nothing. `wall`: it is the rock of the wall it is cut into (it fades as the wall does). */
function thresholdAt(du: number, up: number): { c: string; wall: boolean } | null {
  const S = T_STONE;
  const T = THRESHOLD;
  const a = Math.abs(du);
  if (inThresholdWay(du, up)) return null;
  const top = thresholdTop(du);
  if (up >= top) return null;
  // its outline in the rock: ragged, cut back; beyond it the raw rock of the wall
  const rag = (hash(Math.floor(up / 6), du < 0 ? 1 : 2, 401) - 0.5) * 3;
  if (a > T.reach) return null;
  if (a > T.pil1 + 2 + rag) return { c: rawRock(Math.floor(du + 200), up, 409), wall: true };
  if (a > T.pil1 + rag) return { c: SEAM, wall: true };
  // its top edge: lit
  if (up === top - 1) return { c: S[4], wall: false };
  if (up === top - 2) return { c: S[3], wall: false };
  // THE PILASTERS, the mark on their capitals
  if (a >= T.pil0 && a < T.pil1) {
    // (x across it from its screen-left edge)
    const pw = T.pil1 - T.pil0;
    const x = du < 0 ? Math.floor(T.pil1 - a) : Math.floor(a - T.pil0);
    if (up >= T.cap && up < T.cap + 14) {
      const mk = markPx(x - pw / 2, up - T.cap - 7, 6);
      if (mk === 'bone') return { c: S[4], wall: false };
      if (mk === 'dark') return { c: SEAM, wall: false };
      return { c: up === T.cap + 13 ? S[4] : up === T.cap ? SEAM : S[2], wall: false };
    }
    if (up < 8) return { c: up === 7 ? S[4] : x === 0 ? S[3] : S[2], wall: false };
    if (x <= 0) return { c: S[4], wall: false };
    if (x >= pw - 1) return { c: SEAM, wall: false };
    if (x >= pw - 2) return { c: S[1], wall: false };
    return { c: x === pw / 2 ? S[1] : S[3], wall: false };
  }
  // THE BAND round the way, carved in blocks like a row of teeth
  let near = 99;
  for (let dy = -T.band; dy <= T.band; dy += 2) for (let dx = -T.band; dx <= T.band; dx += 2) {
    if (Math.hypot(dx, dy) > T.band) continue;
    if (inThresholdWay(du + dx, up + dy)) near = Math.min(near, Math.hypot(dx, dy));
  }
  if (near <= T.band) {
    if (near < 1.5) return { c: up > T.jamb && du > 0 ? S[2] : S[4], wall: false };
    if (near > T.band - 1.2) return { c: SEAM, wall: false };
    // (its inner half carved into a row of teeth, each a block with a dark joint; its outer half plain, lit on its top)
    if (near < 5.5) {
      const along = up < T.jamb ? up : du;
      const k = (((Math.floor(along) % 6) + 6) % 6);
      return { c: k === 0 ? SEAM : k === 1 ? S[4] : S[3], wall: false };
    }
    return { c: near > T.band - 2.6 ? S[1] : S[2], wall: false };
  }
  // THE MARK at its head: carved, the enemy's pink dull in its eyes and its mouth
  const mk = markPx(Math.round(du - 0.5), up - T.markZ, T.markR);
  if (mk === 'bone') return { c: markPx(Math.round(du - 1.5), up - T.markZ + 1, T.markR) === null ? S[4] : S[3], wall: false };
  if (mk === 'dark') return { c: up < T.markZ - 2 ? RIFT[0] : hash(Math.floor(du), up, 411) < 0.5 ? RIFT[1] : RIFT[0], wall: false };
  // a roundel round the mark
  const rr = Math.hypot(du, (up + 0.5 - T.markZ) * 0.9);
  if (rr < T.markR + 4 && rr > T.markR + 2.6) return { c: du - (up - T.markZ) < 0 ? S[4] : SEAM, wall: false };
  // the worked stone between: great blocks
  const row = Math.floor(up / 14);
  const lv = up % 14;
  const lu = (((Math.floor(du) + (row % 2 ? 0 : 17)) % 34) + 34) % 34;
  if (lv === 13 || lu === 0) return { c: SEAM, wall: false };
  if (lv === 12 || lu === 1) return { c: S[3], wall: false };
  return { c: S[1], wall: false };
}

/** THE THRESHOLD, as strips along x or along y, from u -32 (the tile before the doorway) to u 128. */
function thresholdStrips(alongX: boolean): Strip[] {
  const H = THRESHOLD.crown + 4;
  const F = new Flat(-32, 128, H);
  // (along y the plane runs the other way on the screen: the face's pattern laid so its light comes from the screen's left)
  const scr = (u: number): number => (alongX ? u + 0.5 - 48 : 48 - (u + 0.5));
  const tone = (c: string): string => (alongX ? c : shaded(c));
  // the wall's rock fades at the wall's top as the wall does; the carved stone stands whole
  const fadeA = (up: number): number => {
    const k = LAIR_WALL - 1 - up;
    return k < 0 ? 0 : k < LAIR_FADE ? Math.round(255 * FADE_STEPS[Math.floor((k * 4) / LAIR_FADE)]) : 255;
  };
  for (let v = 0; v < H; v++) {
    for (let u = -32; u < 128; u++) {
      const du = scr(u);
      // (the way is open: what is beyond it is the game's own floor)
      if (inThresholdWay(du, v)) continue;
      const r = thresholdAt(du, v);
      if (!r) continue;
      const a = r.wall ? fadeA(v) : 255;
      if (a === 0) continue;
      F.set(u, v, OWN.has(r.c) ? r.c : tone(r.c), a);
    }
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE CAVE'S MOUTH FROM FLOOR 4 in look A: art/cave4.ts's `lairMouth` (his yes), its cave, its rim, its size, its anchor and its
// layers unchanged; the wall round it the mine's (three tiles of its face, where the game's own three would be), and the rim and
// the cave in look A's mine colours

/** The lair's own wall in the mouth's picture, as cave4.ts lays it (three tiles of the game's floor-5 face), to tell it from the rim. */
function lairFaceIn(alongX: boolean, W: number, H: number, ax: number, ay: number): Px {
  const face = new Px(W, H);
  for (const j of [-1, 0, 1]) {
    const w = wallFacePixels(LAIR, j + 1, alongX ? 'left' : 'right');
    const tx = alongX ? ax + 16 + 32 * j : ax - 16 - 32 * j;
    const ty = ay - 24 + 16 * j;
    face.blit(w.p, tx - w.ax, ty - w.ay);
  }
  return face;
}
const mouths = new Map<boolean, MouthArt>();
/** One picture's pixels laid over another's, as they are (their fading kept). */
function layOver(dst: Px, src: Px, dx: number, dy: number): void {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const o = (y * src.w + x) * 4;
    if (src.d[o + 3] === 0) continue;
    const X = x + dx;
    const Y = y + dy;
    if (X < 0 || Y < 0 || X >= dst.w || Y >= dst.h) continue;
    const q = (Y * dst.w + X) * 4;
    for (let k = 0; k < 4; k++) dst.d[q + k] = src.d[o + k];
  }
}
function mouthOf(alongX: boolean, faces: Sprite[]): MouthArt {
  const hit = mouths.get(alongX);
  if (hit) return hit;
  const m = lairMouth(alongX);
  const over = pixelsOf(m.over);
  const W = over.w;
  const H = over.h;
  const ax = Math.round(m.ax * GRAIN);
  const ay = Math.round(m.ay * GRAIN);
  const theirs = lairFaceIn(alongX, W, H, ax, ay);
  const same = (p: Px, o: number): boolean => theirs.d[o + 3] !== 0 && theirs.d[o] === p.d[o] && theirs.d[o + 1] === p.d[o + 1] && theirs.d[o + 2] === p.d[o + 2] && theirs.d[o + 3] === p.d[o + 3];
  // the mouth cut through their wall (their wall there, and nothing of the picture over it)
  const hole = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (theirs.d[i * 4 + 3] !== 0 && over.d[i * 4 + 3] === 0) hole[i] = 1;
  // the mine's three tiles of face, where the lair's were, the mouth cut out of it as theirs was
  const mine = new Px(W, H);
  for (const j of [-1, 0, 1]) {
    const tx = alongX ? ax + 16 + 32 * j : ax - 16 - 32 * j;
    const ty = ay - 24 + 16 * j;
    layOver(mine, pixelsOf(faces[j + 1]), tx - HALF, ty - LAIR_WALL);
  }
  for (let i = 0; i < W * H; i++) if (hole[i]) mine.erase(i % W, Math.floor(i / W));
  // what of their picture is not their wall (the rim, the earth fallen, the cave), graded into the mine's colours
  const graded = (p: Px, keep: (i: number) => boolean): Px => {
    const out = new Px(W, H);
    for (let i = 0; i < W * H; i++) {
      const o = i * 4;
      if (p.d[o + 3] === 0 || !keep(i)) continue;
      const [r, g, b] = hexOf(gradeColour(`#${((p.d[o] << 16) | (p.d[o + 1] << 8) | p.d[o + 2]).toString(16).padStart(6, '0')}`, 'mine'));
      out.d[o] = r;
      out.d[o + 1] = g;
      out.d[o + 2] = b;
      out.d[o + 3] = p.d[o + 3];
    }
    return out;
  };
  const withFace = (rest: Px): Px => {
    const out = new Px(W, H);
    out.d.set(mine.d);
    layOver(out, rest, 0, 0);
    return out;
  };
  const whole = pixelsOf(m.whole);
  const out: MouthArt = {
    under: graded(pixelsOf(m.under), () => true).sprite(ax, ay, GRAIN),
    over: withFace(graded(over, (i) => !same(over, i * 4))).sprite(ax, ay, GRAIN),
    whole: withFace(graded(whole, (i) => hole[i] === 1 || !same(whole, i * 4))).sprite(ax, ay, GRAIN),
    ax: m.ax,
    ay: m.ay,
  };
  mouths.set(alongX, out);
  return out;
}

// =================================================================================================
// THE PLACE'S OWN PIECES

/** A box painted into a picture with a depth (anchored at (AX, AY) on it, the floor's (0, 0) there). */
function pic(W: number, H: number, AX: number, AY: number, paint: (D: Deep) => void): Sprite {
  const p = new Px(W, H);
  paint(new Deep(p, AX, AY));
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

/** THE RAILS' STOP: a beam of timber across the rails' end on two blocks. 64 x 48 at the floor point under its middle. */
function railStop(alongX: boolean): Sprite {
  return pic(64, 48, 32, 30, (D) => {
    const yaw = alongX ? Math.PI / 2 : 0;
    D.march(boxSolid([0, 0, 11], [0.36, 0.09, 4 / 32], yaw, WOOD));
    for (const s of [-0.24, 0.24]) D.march(boxSolid([alongX ? 0 : s, alongX ? s : 0, 4], [0.08, 0.08, 4 / 32], yaw, WOOD, false));
  });
}

/** A CART ON THE RAILS, upright, heaped with ore: floor 4's cart (art/floor4.ts, his yes), its load ore, along x or y. 96 x 88 at the floor point under its middle. */
function cartOnRails(alongX: boolean): Sprite {
  const S = new Scene(new Px(96, 88), 48, 60);
  const L: V3 = alongX ? [1, 0, 0] : [0, 1, 0];
  const Wd: V3 = alongX ? [0, 1, 0] : [-1, 0, 0];
  paintCart(S, { o: [0, 0, 0], L, Wd, Up: [0, 0, 1], spin: 0.3, upSpin: 0, load: CART_LOAD.map(([a, b, c]) => [a, b, c]), bone: false }, 1);
  S.seams();
  const p = compose(null, [S.p], null);
  noLone(p);
  return p.sprite(48, 60, GRAIN);
}

/** A LANTERN POST: a squared post of timber on a sill, an arm out from its head, a miner's lantern hung from it (four frames: its flame). 64 x 128 at the floor point under it. */
function lanternPost(f: number): Sprite {
  const W = 64;
  const H = 128;
  const AX = 32;
  const AY = 112;
  const p = new Px(W, H);
  const D = new Deep(p, AX, AY);
  D.march(boxSolid([0, 0, 2], [0.2, 0.2, 2 / 32], 0.0, WOOD));
  D.march(boxSolid([0, 0, 44], [0.09, 0.09, 42 / 32], 0, WOOD));
  D.march(boxSolid([0, 0.2, 82], [0.06, 0.26, 3 / 32], 0, WOOD));
  D.march(boxSolid([0, 0.08, 72], [0.035, 0.035, 9 / 32], Math.PI / 4, WOOD, false));
  // the lantern, hung from the arm's end, before the post
  const [lx, ly] = D.at(0, 0.38, 60);
  const X = Math.round(lx);
  const Y = Math.round(ly);
  for (let j = 0; j < 8; j++) D.put(X, Y - 14 - j, 9, IRON[2]);
  for (let j = 0; j <= 13; j++) for (let i = -3; i <= 3; i++) {
    const c = lanternPx(i, j, f);
    if (c) D.put(X + i, Y - j, 9, c);
  }
  noLone(p);
  const s = p.sprite(AX, AY, GRAIN);
  const L = LAIR_LIGHTS.lanternPost;
  s.lights = [{ x: X / GRAIN, y: (Y - 5) / GRAIN, r: L.glow.r + (f % 2), color: L.glow.color, a: L.glow.a } as Light];
  return s;
}

/** A BRAZIER of the cult's: a black iron bowl on three legs, the mark on its bowl, its fire an honest orange (four frames). 64 x 96 at the floor point under it. */
function brazier(f: number): Sprite {
  const W = 64;
  const H = 96;
  const AX = 32;
  const AY = 84;
  const p = new Px(W, H);
  const X = AX;
  const Y = AY;
  for (const [lx, ly] of [[-7, 0], [7, 0], [0, 3]] as const) for (let j = 0; j < 20; j++) p.set(X + lx + Math.round((lx * j) / 60), Y + ly - j, j < 2 ? IRON[1] : lx < 0 ? IRON[3] : lx > 0 ? IRON[1] : IRON[2]);
  for (let j = 0; j < 7; j++) {
    const w = 10 - Math.floor(j / 3);
    for (let i = -w; i <= w; i++) p.set(X + i, Y - 20 - (6 - j), j === 0 ? IRON[4] : i < -w + 2 ? IRON[3] : i > w - 2 ? IRON[0] : IRON[1]);
  }
  // the mark on the bowl's front, raised
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) if (markPx(i, -j, 4) === 'bone') p.set(X + i, Y - 23 + j, IRON[3]);
  // the coals and the fire
  for (let i = -9; i <= 9; i++) p.set(X + i, Y - 27, (i + 9 + f) % 3 ? EMBER[1] : EMBER[0]);
  for (let j = 0; j < 15; j++) {
    const w = Math.max(0, Math.round(6.5 * (1 - j / 15) + Math.sin(j * 1.7 + f * 1.6) * 1.2));
    for (let i = -w; i <= w; i++) p.set(X + i + Math.round(Math.sin(j * 0.6 + f * 1.3) * 1.5), Y - 28 - j, j < 3 ? EMBER[2] : Math.abs(i) < w * 0.4 ? (j < 8 ? EMBER[4] : EMBER[3]) : j < 9 ? EMBER[3] : EMBER[2]);
  }
  noLone(p);
  const s = p.sprite(AX, AY, GRAIN);
  const L = LAIR_LIGHTS.brazier;
  s.lights = [{ x: X / GRAIN, y: (Y - 36) / GRAIN, r: L.glow.r + (f % 2), color: L.glow.color, a: L.glow.a } as Light];
  return s;
}

// =================================================================================================
// FLOOR 5'S OWN PIECES IN LOOK A'S COLOURS (his yes already: art/floor5.ts), each in the part it belongs to: the mine's warmed
// toward its rock and timber, the temple's cooled toward its black stone, a little of their own colour kept, as the look he
// picked had them (docs/mockups/floor5_look, `graded`); fire and the enemy's pink are their own light and stay as they are

export type LairPart = 'mine' | 'temple';
/** Which part each of floor 5's own pieces belongs to (where the main chat lays it). The mine shaft is the game's own, unchanged. */
export const LAIR_PART: Record<string, LairPart> = {
  'the lagged wall': 'mine', 'the cave-in': 'mine', 'the drilled face': 'mine', 'the boarded adit': 'mine', "a miner's candle": 'mine',
  'rope and pulley': 'mine', 'the hung kibble': 'mine', 'the trodden way': 'mine', "the rails' bend": 'mine', 'the plank walk': 'mine',
  spoil: 'mine', 'the grasping earth': 'mine', 'the charge': 'mine', 'powder keg': 'mine', 'basket of ore': 'mine',
  'the cart on its side': 'mine', "a miner's bones": 'mine', 'a dropped lantern': 'mine', 'the spilled kibble': 'mine',
  'the winding drum': 'mine', 'the sump pump': 'mine', 'the pile of props': 'mine', 'the mine shaft': 'mine', 'the door': 'mine',
  'the priest in the stone': 'temple', 'the shrine': 'temple', 'black glass': 'temple', "the cult's banner": 'temple',
  "a cultist's robe": 'temple', 'the candle ledge': 'temple', 'the daubed mark': 'temple', 'bones on cords': 'temple',
  "the cult's ring": 'temple', "the cult's slab": 'temple', 'the shrieking skull': 'temple', 'box of candles': 'temple',
  'offering jar': 'temple', 'skulls given to him': 'temple', 'the effigy': 'temple', 'the skull standard': 'temple',
  'the great bone heap': 'temple', 'the long bone heap': 'temple', 'the rift': 'temple', "the cult's coffer": 'temple',
  'the gate': 'temple', "the boss's gate": 'temple', 'his book': 'temple',
};
/** Floor 5's own pieces that stay exactly as they are: the miners' shaft and its cage (art/shaft.ts: its films and the ride up keep their colours with their shape and timing). */
export const LAIR_UNCHANGED = ['the mine shaft'] as const;

/** A colour of floor 5's own as look A has it in the mine or the temple. */
export function gradeColour(c: string, part: LairPart): string {
  if (SHINES.has(c) || OWN.has(c)) return c;
  const [r0, g0, b0] = hexOf(c);
  const l = 0.3 * r0 + 0.55 * g0 + 0.15 * b0;
  const keep = 0.4;
  const t = part === 'temple' ? 1 : 0;
  const wr = 1.06 * (1 - t) + 0.96 * t;
  const wg = 0.99 * (1 - t) + 0.94 * t;
  const wb = 0.86 * (1 - t) + 1.04 * t;
  return toHex((l + (r0 - l) * keep) * wr + 3, (l + (g0 - l) * keep) * wg + 1, (l + (b0 - l) * keep) * wb);
}
const gradedMemo = { mine: new WeakMap<Sprite, Sprite>(), temple: new WeakMap<Sprite, Sprite>() };
/** A picture of floor 5's own in look A's colours for a part (its shape, its anchor and its lights as they were). */
export function gradeSprite(s: Sprite, part: LairPart): Sprite {
  const hit = gradedMemo[part].get(s);
  if (hit) return hit;
  const src = pixelsOf(s);
  const out = new Px(src.w, src.h);
  const memo = new Map<number, string>();
  for (let i = 0; i < src.d.length; i += 4) {
    const a = src.d[i + 3];
    if (a === 0) continue;
    const key = (src.d[i] << 16) | (src.d[i + 1] << 8) | src.d[i + 2];
    let c = memo.get(key);
    if (!c) memo.set(key, (c = gradeColour(`#${key.toString(16).padStart(6, '0')}`, part)));
    const [r, g, b] = hexOf(c);
    out.d[i] = r;
    out.d[i + 1] = g;
    out.d[i + 2] = b;
    out.d[i + 3] = a;
  }
  const d = s.density ?? 1;
  const s2 = out.sprite(s.ax * d, s.ay * d, d);
  if (s.lights) s2.lights = s.lights.map((l) => ({ ...l }));
  gradedMemo[part].set(s, s2);
  return s2;
}
function gradePiece(p: Piece): Piece {
  if ((LAIR_UNCHANGED as readonly string[]).includes(p.name)) return p;
  const part = LAIR_PART[p.name] ?? 'temple';
  const g = (list?: Sprite[]): Sprite[] | undefined => list?.map((s) => gradeSprite(s, part));
  const spots: Spot[] | undefined = p.spots?.map((q) => ({ du: q.du, dv: q.dv, left: q.left.map((s) => gradeSprite(s, part)), right: q.right.map((s) => gradeSprite(s, part)) }));
  return { ...p, frames: g(p.frames), left: g(p.left), right: g(p.right), spots };
}

// =================================================================================================
// THE LIGHTS, for the main chat to place (the renderer's own: a hole cut in the dark, render.ts `spot`, and a glow drawn over it,
// `drawGlow` / a sprite's `lights`). In game pixels, from where each thing is anchored.

export const LAIR_LIGHTS = {
  /** The floor's dark on floor 5 (the game's FAR_DARK is 0.88): look A's lantern-lit dark. */
  dark: 0.8,
  /** A miner's lantern on a post of the mine's wall: a hole at the lantern (its picture's light's point), and its glow, the miners' honest orange (on the picture). */
  lantern: { r: 64, strength: 0.9, glow: { r: 24, color: EMBER[2], a: 0.42 } },
  /** Every tile of the mine's wall without a lantern: a low hole at the foot of its face under its middle, `up` over it, so that the rock reads where the lanterns' light reaches it. */
  mineWall: { up: 26, r: 30, strength: 0.32 },
  /** A lantern post in a room of the mine: a hole at its lantern, its glow on its picture. */
  lanternPost: { r: 72, strength: 0.92, glow: { r: 26, color: EMBER[2], a: 0.44 } },
  /** A brazier of the temple's (as render.ts lights a brazier: 14 up, 62, 0.9), its glow on its picture. */
  brazier: { up: 18, r: 66, strength: 0.9, glow: { r: 26, color: EMBER[2], a: 0.42 } },
  /** A glowing crack of the rift in the flags: a small hole at the tile's middle, and a dim glow of the enemy's deep pink. */
  crack: { r: 34, strength: 0.42, glow: { r: 16, color: RIFT[1], a: 0.16 } },
  /** The rift in his hall (floor 5's own piece, its own glow on its picture): a hole over it. */
  rift: { up: 4, r: 84, strength: 0.62 },
  /** A glowing crack up a wall of his hall: a hole at the foot of the face under its tile's middle, and its glow. */
  wallCrack: { up: 16, r: 36, strength: 0.4, glow: { r: 18, color: RIFT[1], a: 0.18 } },
} as const;

// =================================================================================================
// ALL OF IT

export interface LairPartArt {
  /** The floor of tile (tx, ty) (the mine's repeats every four tiles; the temple's flags are a tile each). */
  floor(tx: number, ty: number): Sprite;
  /** Floor tiles laid over it. */
  tiles: Piece[];
  /** A tile of its wall: along x (turned to screen-left, lit) and along y (to screen-right, in shade); four of each ([0] and [2] a bay's first tile), each four frames. Anchored as the game's walls are. */
  faceLeft: Sprite[][];
  faceRight: Sprite[][];
  /** The wall's face for wall tile (tx, ty), frame f, so that the posts (the pilasters) fall every two tiles along it. */
  face(alongX: boolean, tx: number, ty: number, f?: number): Sprite;
}
export interface LairHall {
  /** His hall's wall: along x (lit) and along y (in shade), four tiles laid in order, k = 0 to 3 (the tile's place along the wall mod 4), each four frames (the rift's cracks breathe). */
  faceLeft: Sprite[][];
  faceRight: Sprite[][];
}
export interface LairArt {
  mine: LairPartArt;
  temple: LairPartArt;
  /** THE THRESHOLD, along x or y: strips from u -32 to 128 (t -1 to 4: the tile before the doorway, its three, the tile after), stood as a gate's arch is. */
  threshold(alongX: boolean): Strip[];
  /** The cave's mouth from floor 4 (art/cave4.ts lairMouth's shape and anchor), the mine's wall round it. */
  mouth(alongX: boolean): MouthArt;
  hall: LairHall;
  /** The place's own pieces and floor 5's own in look A's colours. */
  pieces: Piece[];
}

/** The place's own pieces' names (the rest of `pieces` are floor 5's own, in look A's colours). */
export const LAIR_OWN = ["the rails' stop, along x", "the rails' stop, along y", 'a cart on the rails, along x', 'a cart on the rails, along y', 'a lantern post', 'a brazier'] as const;
/** The part each of the place's own belongs to. */
export const LAIR_OWN_PART: Record<(typeof LAIR_OWN)[number], LairPart> = {
  "the rails' stop, along x": 'mine', "the rails' stop, along y": 'mine', 'a cart on the rails, along x': 'mine', 'a cart on the rails, along y': 'mine', 'a lantern post': 'mine', 'a brazier': 'temple',
};

/** The rails' tiles: their names and their edges. */
export const RAIL_TILES: readonly (readonly [string, Edge, Edge | null])[] = [
  ['rails along x', '-x', '+x'], ['rails along y', '-y', '+y'],
  ['rails bending, low x to low y', '-x', '-y'], ['rails bending, low x to high y', '-x', '+y'],
  ['rails bending, high x to low y', '+x', '-y'], ['rails bending, high x to high y', '+x', '+y'],
  ["rails' end, from low x", '-x', null], ["rails' end, from high x", '+x', null], ["rails' end, from low y", '-y', null], ["rails' end, from high y", '+y', null],
];
/** The rift's cracks' tiles: their names, their edges, whether they glow. */
export const CRACK_TILES: readonly (readonly [string, Edge, Edge | null, boolean])[] = [
  ['a crack of the rift along x', '-x', '+x', false], ['a crack of the rift along y', '-y', '+y', false],
  ['a crack of the rift along x, glowing', '-x', '+x', true], ['a crack of the rift along y, glowing', '-y', '+y', true],
  ['a crack of the rift ending, from low x', '-x', null, false], ['a crack of the rift ending, from high x', '+x', null, false],
  ['a crack of the rift ending, from low y', '-y', null, false], ['a crack of the rift ending, from high y', '+y', null, false],
];

const four = [0, 1, 2, 3];
let made: LairArt | null = null;
/** The place's pictures, made the first time they are asked for and kept (the threshold and the mouth when first asked for). */
export function makeLairTempleArt(): LairArt {
  if (made) return made;
  const tile = (name: string, frames: Sprite[]): Piece => ({ name, kind: 'floor tile' as PieceKind, frames });

  // ---- THE MINE: its floor, its rails and grit, its wall a bay at a time (a lantern on some posts)
  const mineFloors = new Map<string, Sprite>();
  const mineBays: MineBay[] = [{ lantern: true, lagging: true }, { lantern: false, lagging: false }];
  const mineFaces = (alongX: boolean, seed0: number): Sprite[][] => [0, 1, 2, 3].map((k) => {
    const bay = mineBays[k >> 1];
    const seed = seed0 + (k >> 1) * 17;
    const frames = bay.lantern ? four : [0];
    const out = frames.map((f) => {
      const L = LAIR_LIGHTS.lantern;
      const glow: [number, number] = [MINE_SET.lantern, MINE_SET.lanternFoot + 5];
      const { s, at } = wallTile(alongX, 32 * (k % 2), (J, up, sgn) => mineAt(J, up, sgn, seed, f, bay), bay.lantern && k % 2 === 0 ? glow : undefined);
      if (at) s.lights = [{ x: at[0] / GRAIN, y: at[1] / GRAIN, r: L.glow.r + (f % 2), color: L.glow.color, a: L.glow.a } as Light];
      return s;
    });
    return four.map((f) => out[f % out.length]);
  });
  const mineLeft = mineFaces(true, 300);
  const mineRight = mineFaces(false, 307);
  const mine: LairPartArt = {
    floor(tx, ty) {
      const a = ((tx % 4) + 4) % 4;
      const b = ((ty % 4) + 4) % 4;
      const key = `${a},${b}`;
      let s = mineFloors.get(key);
      if (!s) mineFloors.set(key, (s = tileOf((x, y) => mineFloorAt(x, y), a, b)));
      return s;
    },
    tiles: [
      ...RAIL_TILES.map(([n, a, b], i) => tile(n, [railsTile(a, b, i % 4)])),
      tile('grit and stones', [gritTile('none', 761)]),
      tile('grit at a wall along x', [gritTile('x', 763)]),
      tile('grit at a wall along y', [gritTile('y', 765)]),
    ],
    faceLeft: mineLeft,
    faceRight: mineRight,
    face(alongX, tx, ty, f = 0) {
      const along = alongX ? tx : ty;
      const first = ((along % BAY) + BAY) % BAY === 0;
      const pick = hash(tx >> 1, ty >> 1, 77) < 0.45 ? 0 : 2;
      const list = alongX ? mineLeft : mineRight;
      return list[first ? pick : pick + 1][((f % 4) + 4) % 4];
    },
  };

  // ---- THE TEMPLE: its flags, the rift's cracks, its wall a bay at a time (a pilaster, then a hanging or the mark)
  const templeFloors = new Map<string, Sprite>();
  const templeTiles: TempleTile[] = [{ what: 'pilaster', crack: null }, { what: 'hanging', crack: null }, { what: 'pilaster', crack: null }, { what: 'panel', crack: null }];
  const templeFaces = (alongX: boolean, seed0: number, kinds: TempleTile[], hall: boolean): Sprite[][] => kinds.map((t, k) => {
    const seed = seed0 + (k >> 1) * 17;
    const frames = t.crack !== null ? four : [0];
    const out = frames.map((f) => wallTile(alongX, 0, (J, up, sgn) => templeAt(J, up, sgn, seed + (hall ? k : 0), f, t)).s);
    return four.map((f) => out[f % out.length]);
  });
  const templeLeft = templeFaces(true, 400, templeTiles, false);
  const templeRight = templeFaces(false, 407, templeTiles, false);
  const temple: LairPartArt = {
    floor(tx, ty) {
      const a = ((tx % 4) + 4) % 4;
      const b = ((ty % 4) + 4) % 4;
      const key = `${a},${b}`;
      let s = templeFloors.get(key);
      if (!s) templeFloors.set(key, (s = tileOf((x, y) => templeFloorAt(x, y), a, b)));
      return s;
    },
    tiles: [
      ...CRACK_TILES.map(([n, a, b, glow]) => {
        const frames = (glow ? four : [0]).map((f) => crackTile(a, b, glow, f));
        if (glow) {
          const L = LAIR_LIGHTS.crack;
          for (const s of frames) s.lights = [{ x: HALF / GRAIN, y: TH / 2 / GRAIN, r: L.glow.r, color: L.glow.color, a: L.glow.a } as Light];
        }
        return tile(n, frames);
      }),
      tile('bones on the flags', [bonesTile()]),
    ],
    faceLeft: templeLeft,
    faceRight: templeRight,
    face(alongX, tx, ty, f = 0) {
      const along = alongX ? tx : ty;
      const first = ((along % BAY) + BAY) % BAY === 0;
      const pick = hash(tx >> 1, ty >> 1, 79) < 0.5 ? 0 : 2;
      const list = alongX ? templeLeft : templeRight;
      return list[first ? pick : pick + 1][((f % 4) + 4) % 4];
    },
  };

  // ---- HIS HALL: every bay a hanging or the mark, the rift's cracks up its pilasters' tiles
  const hallTiles: TempleTile[] = [{ what: 'pilaster', crack: 22 }, { what: 'hanging', crack: null }, { what: 'pilaster', crack: null }, { what: 'panel', crack: null }];

  const thresholds = new Map<boolean, Strip[]>();
  made = {
    mine,
    temple,
    threshold(alongX) {
      let s = thresholds.get(alongX);
      if (!s) thresholds.set(alongX, (s = thresholdStrips(alongX)));
      return s;
    },
    mouth: (alongX) => mouthOf(alongX, [1, 2, 3].map((k) => (alongX ? mineLeft : mineRight)[k][0])),
    hall: {
      faceLeft: templeFaces(true, 471, hallTiles, true),
      faceRight: templeFaces(false, 472, hallTiles, true),
    },
    pieces: [
      { name: "the rails' stop, along x", kind: 'on the floor', frames: [railStop(true)] },
      { name: "the rails' stop, along y", kind: 'on the floor', frames: [railStop(false)] },
      { name: 'a cart on the rails, along x', kind: 'obstacle', frames: [gradeSprite(cartOnRails(true), 'mine')], shadow: 0.46 },
      { name: 'a cart on the rails, along y', kind: 'obstacle', frames: [gradeSprite(cartOnRails(false), 'mine')], shadow: 0.46 },
      { name: 'a lantern post', kind: 'obstacle', frames: four.map(lanternPost), shadow: 0.2 },
      { name: 'a brazier', kind: 'obstacle', frames: four.map(brazier), shadow: 0.26 },
      ...lairPieces().map(gradePiece),
    ],
  };
  return made;
}
/** Let the place's pictures go (they are made again if they are wanted). */
export function forgetLairTemple(): void {
  made = null;
}
