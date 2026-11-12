// FLOOR 1, THE WARDEN'S FLOOR: THE KING'S TOMB WITH DAYLIGHT, LOOK B (THE ROOTS BREAK IN), ITS PIECES READY FOR THE GAME (the
// art chat, 2 Nov 2026). Behind the switch TOMB, off; nothing of the game imports it until the main chat puts it in.
//
// His words that began it, 2 Nov 2026, 10:13: “We may as well redo the first level as well.  Why not, we just did every other
// level right?”; his pick of the way, “Tomb with daylight (Recommended)” (the king's grand tomb just under the town: pale carved
// stone, effigies, faded banners, roots breaking through, shafts of daylight from cracks above, the Warden's iron locks; the
// brightest floor, before it gets dark). Of its three looks (docs/mockups/floor1_look), his pick, 2 Nov 2026: “B, roots break
// in”, offered as: thick tree roots through the vaults, moss on the tombs, green-gold light, dripping water. Busier underfoot.
// (His gate: art/tomb_gate.ts.)
//
// WHAT IS HERE, each in the game's own measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32), anchored as
// the game's own are:
//   floor(tx, ty)       THE TOMB'S FLAGS: pale carved flags a tile each, a carved border round each, moss in the joints (sixteen
//                       pictures, every four tiles)
//   tiles               floor tiles over them: THE ROOTS lying across the floor (along x and y, the four bends, the four ends:
//                       flat, the flags heaved round them), A PUDDLE (four frames: the rings of the drips), MOSS, FALLEN LEAVES AND
//                       EARTH under a crack, scattered leaves, THE GRAVE SLABS of the king's court (two tiles long, along x and y)
//   faceLeft/Right      THE TOMB'S WALL a tile at a time, as the game lays walls: 80 high, its top fading into the dark as the
//                       game's; pale dressed stone on a moulded plinth, A PILASTER every two tiles (fluted, a capital of leaves),
//                       and between them A ROTTED BANNER (green-gold, eaten through), A WALL TOMB with its effigy, A BURIAL CELL
//                       barred with the Warden's iron, or THE KING'S CROWN carved; THE TOWN'S ROOTS down it from the vault, moss.
//                       `face(alongX, tx, ty, f)` picks them
//   hall                HIS HALL'S WALL: banners, his cells, the crown, a wall tomb, in order, the roots through them
//   archway(alongX)     THE WAY BETWEEN TWO ROOMS: a round-headed way under a ring of voussoirs, moss on them, a root over it;
//                       strips (art/gates.ts) over the doorway's three tiles and a tile of wall either side, as a gate's arch is
//   stairsUp(alongX)    THE TOWN'S STAIRS COMING DOWN (art/town_ways.ts `floorStairsUp`: its size, anchor and shape pixel for
//                       pixel), in the tomb's stone, the town's daylight pouring down the flight
//   stairwell(way)      THE STAIRWELL DOWN (art/crypt_ways.ts, its opening art/stairwell_open.ts: shape and timing unchanged), in
//                       the tomb's stone (`TOMB_THEME`)
//   pieces              the place's own (the court's tombs, chained and locked or bare; the shafts of daylight, the light where
//                       they fall and their column of lit air; water dripping) and floor 1's own pieces, his yes already
//                       (art/floor1.ts), each in look B's colours (their colours, not their shapes)
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game the renderer lays its darkness and cuts a hole where each
// light burns (render.ts, light), and what gives light is drawn over it. What the main chat should place is in
// docs/mockups/floor1_look/README.md ("Made game-ready") and in TOMB_LIGHTS here. The daylight's shafts are pictures of light:
// drawn ADDED to what is under them (globalCompositeOperation 'lighter'), as the renderer adds a glow, so that they brighten
// what they fall on and are never a solid shape.
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to screen-
// right in shade); a dark base, the place's own colours darker than the darkest word (the daylight makes it bright); nothing
// cyan (the friend's); the enemy's pink only in the Warden and his gate's lock; fire an honest orange.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso } from './isokit';
import { GRAIN, hash } from './kit';
import { COAL, EMBER, GOLD, stoneOf } from './props';
import { FLAME } from './mkit';
import { SHINES } from './floorkit';
import type { Piece, PieceKind, Spot } from './floorkit';
import { WINE, wardenPieceCount, wardenPieceSteps, wardenPieces } from './floor1';
import { Ahead } from '../engine/steps';
import type { LoadStep } from '../engine/steps';
import { CRYPT_FLOORS, OLD_IRON, OLD_RUST, TIMBER } from './crypt';
import { Scene } from './floor4';
import type { V3 } from './floor4';
import { ARCH, ARCH_WIDE, Flat, curveOf, inWay } from './gates';
import type { Strip } from './gates';
import type { Theme } from './ground';
import { makeStairwell } from './crypt_ways';
import { stairwellOpens } from './stairwell_open';
import type { Moment } from './floorkit';
import { STAIRS_UP } from './town_ways';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const TOMB = { on: false };

// =================================================================================================
// MEASURES

const TW = 64;
const TH = 32;
const HALF = TW / 2;
/** How high floor 1's walls stand (picture pixels: the game's WALL_LOOK.tall, 40, at two to a game pixel), and how much of their top fades into the dark (its `fade`, 12). */
export const TOMB_WALL = 80;
export const TOMB_FADE = 24;
/** The game's four steps of a wall's top fading out (art/ground.ts, `put`): how much of each is there, from the top down. */
export const FADE_STEPS = [0.14, 0.38, 0.62, 0.84] as const;
/** A bay of the wall: two tiles, a pilaster at its start (straddling the joint with the bay before). */
export const BAY = 2;

// =================================================================================================
// LOOK B'S COLOURS (his pick; docs/mockups/floor1_look, PALS.roots): a pale green-grey stone, damp; moss; the town's roots; rotted
// green-gold banners; the Warden's iron. Brought down under the darkest word (his Colour 4): the daylight makes it bright.
// Five tones a material: its seam, its shade, its body, its light, its lit edge.

export type R5 = readonly [string, string, string, string, string];
function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
/** Look B's own tones, each brought down by `k` (its hue and its steps kept). */
const down = (r: readonly string[], k: number): R5 => r.map((c) => {
  const [a, b, d] = hexOf(c);
  return toHex(a * k, b * k, d * k);
}) as unknown as R5;

export const STONE: R5 = down(['#1d1f19', '#353a2e', '#4c5040', '#626552', '#767a63'], 0.76);
export const FLAGS: R5 = down(['#1b1d17', '#31342a', '#46493a', '#5a5d4a', '#6c6f5a'], 0.8);
export const SLAB: R5 = down(['#151715', '#272926', '#383a35', '#4a4c45', '#5c5d55'], 0.92);
export const IRON: R5 = ['#0c0a09', '#181412', '#25201c', '#352d27', '#4a3f36'];
/** The king's banners, rotted green-gold; their border and his crown on them, faded gold. */
export const CLOTH: R5 = down(['#14170d', '#232914', '#33391c', '#444a26', '#565c30'], 0.98);
export const TRIM: R5 = down(['#3a3214', '#5a4c1e', '#76662a', '#8e7c36', '#a49246'], 0.62);
export const MOSS: R5 = down(['#10190a', '#1c2c10', '#2a4016', '#3a561e', '#4c6c28'], 0.92);
/** The town's roots: a warm bark brown, lit along their tops. */
export const ROOT: R5 = ['#140e09', '#271b11', '#3a2a1a', '#4f3a24', '#664c30'];
export const LEAF: R5 = down(['#0e180a', '#1a2c11', '#284218', '#365a20', '#46702a'], 0.9);
/** Leaves gone brown, and the earth fallen through the cracks. */
export const DRY: R5 = ['#16100a', '#2a1e12', '#3e2c18', '#523b20', '#664a28'];
export const EARTH: R5 = ['#100d09', '#1d1810', '#2b2417', '#3a3120', '#4a3f2a'];
export const WATER: R5 = ['#0b0f12', '#141d22', '#1f2c32', '#2e4046', '#4a5e60'];
export const BONE: R5 = down(['#2a2620', '#463f35', '#625849', '#7c705c', '#948670'], 0.78);
export const WOOD: R5 = ['#1a120c', '#2e2016', '#422f20', '#57402b', '#6c5236'];
/** The Warden's cloth, a dull wine (never the enemy's pink). */
export const WINE_B: R5 = down(['#1c0c10', '#301418', '#461c22', '#5c262c', '#703236'], 0.92);
export const BRASS: R5 = down(['#24260f', '#3e4019', '#5a5a26', '#747234', '#8c8846'], 0.68);
const SEAM = '#0e0f0b';
const BEYOND = '#07060a';

/**
 * THE DAYLIGHT, look B's green-gold: what a shaft adds to what it falls on (its pictures are drawn added: 'lighter'), in three
 * steps from its rim in; the air of a shaft in three steps; the motes in it. Its glow (the renderer's) and the town's light.
 */
export const SUN = {
  pool: ['#16190c', '#3b3f22', '#5f5f40'] as const,
  air: ['#0f100b', '#1d1e15', '#2a2c1f'] as const,
  mote: '#5c5e46',
  glow: '#c8d078',
  town: '#d8dca0',
};
/** What shines of itself here: never shaded, never faded, never graded. */
const OWN = new Set<string>([...EMBER, ...FLAME]);

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const mixMemo = new Map<string, string>();
export function mixC(a: string, b: string, k: number): string {
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
/** Three octaves of noise at `n` cells a tile (whole), repeating every four tiles. */
const fbm4 = (x: number, y: number, n: number, k = 0): number =>
  0.55 * noiseP(x * n, y * n, k, 4 * n) + 0.3 * noiseP(x * 2 * n, y * 2 * n, k + 11, 8 * n) + 0.15 * noiseP(x * 4 * n, y * 4 * n, k + 23, 16 * n);
/** Plain smooth noise (not repeating): for what is painted once. */
export function noise(x: number, y: number, k = 0): number {
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

/** THE KING'S CROWN, his mark (the look's own: a band, three tall points each with a ball, two low between), at (i, j) from its middle (j up), `r` its half width: 'gold' (raised), 'dark' (cut), or null. */
export function crownPx(i: number, j: number, r: number): 'gold' | 'dark' | null {
  const u = i / r;
  const v = j / r;
  const a = Math.abs(u);
  if (a > 0.95) return null;
  if (v >= -0.62 && v < -0.22) return v < -0.5 || v > -0.32 ? 'gold' : Math.floor((u + 1) * 5) & 1 ? 'dark' : 'gold';
  if (v < -0.22) return null;
  for (const [c, top] of [[0, 0.62], [-0.68, 0.5], [0.68, 0.5]] as const) {
    const w = 0.16 * (1 - (v + 0.22) / (top + 0.22)) + 0.04;
    if (Math.abs(u - c) < w && v < top) return 'gold';
    if (Math.hypot(u - c, v - top - 0.12) < 0.12) return 'gold';
  }
  for (const c of [-0.34, 0.34]) {
    const w = 0.13 * (1 - (v + 0.22) / 0.44);
    if (Math.abs(u - c) < w && v < 0.22) return 'gold';
  }
  return null;
}

// =================================================================================================
// THINGS THAT STAND, painted in depth: for every pixel the line of sight is followed into the thing, and the first point inside
// it is what is seen. World in tiles (x down the screen to the right, y down to the left), z up in picture pixels. (As floors 4
// and 5's: art/lair_temple.ts on its branch.)

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

// =================================================================================================
// THE FLOOR: great pale flags laid square on the tiles' lines, a carved border round each (its edge toward the light lit), MOSS
// in the joints and creeping out of them, a crack across some, the flags darker where they are damp

/** The tomb's floor at a point of the world, before anything is laid over it. */
export function tombFloorAt(x: number, y: number): string {
  const fu = x - Math.floor(x);
  const fv = y - Math.floor(y);
  const e = Math.min(fu, fv, 1 - fu, 1 - fv);
  const tx = mod(Math.floor(x), 4);
  const ty = mod(Math.floor(y), 4);
  // moss in the joints, and creeping out of them onto the flags in places
  const ms = fbm4(x, y, 4, 623);
  if (e < 0.025) return ms > 0.4 ? MOSS[ms > 0.6 ? 3 : 2] : SEAM;
  if (e < 0.1 && ms > 0.62 && cell(x, y, 16, 627) < 0.7 + (0.1 - e) * 3) return MOSS[cell(x, y, 16, 629) < 0.35 ? 3 : 2];
  if (e < 0.06) return fu < 0.06 || 1 - fv < 0.06 ? FLAGS[4] : FLAGS[1];
  if (e > 0.11 && e < 0.13) return FLAGS[0];
  const tone = hash(tx, ty, 611);
  let k = tone < 0.22 ? 1 : tone > 0.86 ? 3 : 2;
  const n = fbm4(x, y, 5, 613);
  if (n > 0.66) k += 1;
  if (n < 0.3) k -= 1;
  if (hash(tx, ty, 615) > 0.74 && Math.abs(fv - 0.5 - (fu - 0.5) * 0.7 + Math.sin(fu * 13) * 0.04) < 0.014) return SEAM;
  // damp: a darker stain here and there
  const damp = fbm4(x, y, 2, 617);
  if (damp > 0.66 && cell(x, y, 16, 619) < 0.55) k -= 1;
  return FLAGS[clampK(k)];
}
/** A hash of the cell of a point at `n` cells a tile, repeating every four tiles. */
function cell(x: number, y: number, n: number, seed: number): number {
  const m = 4 * n;
  return hash(mod(Math.floor(x * n), m), mod(Math.floor(y * n), m), seed);
}

// =================================================================================================
// FLOOR TILES: THE ROOTS lying across the floor (thick, round, lit along their tops, moss on them, the flags heaved round them);
// A PUDDLE where the water drips (its rings, four frames); MOSS; FALLEN LEAVES AND EARTH under a crack; THE GRAVE SLABS

/** Which way a run goes through a tile: from one edge's middle to another's, or from one edge to the tile's middle. */
export type Edge = '-x' | '+x' | '-y' | '+y';
/** Across the run (0 its middle; `px`, `py` the way across it on the floor) and along it (0 to 1), at a point of the tile, for a run from edge `a` to edge `b` (or to the middle: `b` null); null where past its end. */
function runAt(u: number, v: number, a: Edge, b: Edge | null): { off: number; s: number; px: number; py: number } | null {
  const mid = (e: Edge): [number, number] => (e === '-x' ? [0, 0.5] : e === '+x' ? [1, 0.5] : e === '-y' ? [0.5, 0] : [0.5, 1]);
  const along = (e: Edge): 'x' | 'y' => (e[1] === 'x' ? 'x' : 'y');
  if (b === null || along(a) === along(b)) {
    const ax = along(a) === 'x';
    const s0 = ax ? u : v;
    const off = ax ? v - 0.5 : u - 0.5;
    let s = s0;
    if (b === null) {
      const fromLow = a[0] === '-';
      s = fromLow ? s0 : 1 - s0;
      if (s > 0.66) return null;
    }
    return { off, s, px: ax ? 0 : 1, py: ax ? 1 : 0 };
  }
  // a quarter turn about the corner the two edges meet at, radius a half
  const [ax, ay] = mid(a);
  const [bx, by] = mid(b);
  const cx = ax === 0.5 ? bx : ax;
  const cy = ay === 0.5 ? by : ay;
  const r = Math.hypot(u - cx, v - cy) || 1e-6;
  const ang = Math.atan2(Math.abs(v - cy), Math.abs(u - cx));
  return { off: r - 0.5, s: ang / (Math.PI / 2), px: (u - cx) / r, py: (v - cy) / r };
}
/** How thick a root is (its half width, tiles) at `s` along a tile: thicker and thinner by turns, the same at every tile's edge; thinning to a point at an end. */
function rootHalf(s: number, end: boolean): number {
  const w = 0.12 + 0.018 * Math.sin(Math.PI * 2 * s) + 0.01 * Math.sin(Math.PI * 4 * s + 1);
  return end ? w * Math.max(0, 1 - Math.pow(s / 0.64, 2.2)) : w;
}
/** A ROOT lying across the floor at a point of the tile (u, v), over the floor's colour `c`: the root, its shadow, the flags heaved round it; null where it leaves the floor as it is. */
function rootPx(u: number, v: number, a: Edge, b: Edge | null, c: string, x: number, y: number): string | null {
  const ra = runAt(u, v, a, b);
  if (!ra) return null;
  const end = b === null;
  // (a wobble that is nothing at the tile's edges, so that it meets the next tile's root)
  const wob = Math.sin(Math.PI * ra.s) * (0.05 * Math.sin(ra.s * 7.1 + (a === '-x' || a === '+x' ? 1 : 2)) + 0.03 * Math.sin(ra.s * 17 + 0.4));
  const off = ra.off - (end ? 0 : wob);
  const w = rootHalf(ra.s, end);
  if (w <= 0.004) return null;
  const q = off / w;
  if (Math.abs(q) < 1) {
    // round, lying on the floor: lit as its side turns to the light; bark in streaks along it; moss on its top in places
    const nz = Math.sqrt(Math.max(0, 1 - q * q));
    let k = litTone(ra.px * q, ra.py * q, nz * 1.15);
    if (Math.abs(q) > 0.86) k = Math.min(k, 1);
    const streak = mod(ra.s * 9 + q * 1.3 + hash(Math.floor(q * 3 + 5), 1, 351) * 0.6, 1);
    if (streak < 0.12 && Math.abs(q) < 0.8) k -= 1;
    if (q * (ra.px - ra.py) < 0.1 && nz > 0.5 && fbm4(x, y, 6, 355) > 0.6) return MOSS[clampK(k)];
    return ROOT[clampK(k)];
  }
  // its shadow on the floor on the side away from the light, and the flags heaved and cracked round it
  const away = off * (ra.px * 0.3 - ra.py * 0.5) > 0;
  if (Math.abs(q) < 1.25 && away) return SEAM;
  if (Math.abs(q) < 1.12) return SEAM;
  if (Math.abs(off) < w + 0.14 && c !== SEAM && cell(x, y, 12, 357) > 0.55) return mixC(c, SEAM, 0.45);
  return null;
}
/** A tile of root from edge `a` to edge `b` (or to the middle), over the tomb's floor. */
function rootTile(a: Edge, b: Edge | null, seed: number): Sprite {
  return tileOf((x, y) => {
    const u = x - seed;
    const v = y - 1;
    const c = tombFloorAt(x, y);
    return rootPx(u, v, a, b, c, x, y) ?? c;
  }, seed, 1);
}

/** A PUDDLE on the flags, frame `f` of four: its water, its rim, the vault's light caught in it in a streak, the rings of the drips spreading. */
function puddleTile(f: number): Sprite {
  return tileOf((x, y) => {
    const u = x - 2;
    const v = y - 1;
    const c = tombFloorAt(x, y);
    const q = Math.hypot((u - 0.5) / 0.36, (v - 0.52) / 0.3) + (noise(u * 6, v * 6, 627) - 0.5) * 0.28;
    if (q > 1.06) return c;
    if (q > 1) return mixC(c, SEAM, 0.5);
    const W = WATER;
    // the rings, spreading from where the drops fall (two, a frame apart)
    const dr = Math.hypot((u - 0.46) / 0.9, (v - 0.48) / 0.9);
    for (const r0 of [((f % 4) + 1) * 0.06, (((f + 2) % 4) + 1) * 0.06]) if (Math.abs(dr - r0) < 0.011 && q < 0.92) return W[4];
    // the vault's light caught in it, a streak
    if (Math.abs(u - 0.5 - (v - 0.52) * 0.5) < 0.035 && q < 0.72) return W[4];
    if (Math.abs(u - 0.5 - (v - 0.52) * 0.5 + 0.1) < 0.025 && q < 0.6) return W[3];
    return q > 0.86 ? W[2] : W[3];
  }, 2, 1);
}
/** MOSS over the flags: a soft green cushion in patches, its tufts lit on top. */
function mossTile(): Sprite {
  return tileOf((x, y) => {
    const c = tombFloorAt(x, y);
    const n = fbm4(x, y, 3, 641) + (fbm4(x, y, 12, 643) - 0.5) * 0.3;
    const u = x - 1;
    const v = y - 3;
    const edge = Math.max(0, Math.hypot(u - 0.5, v - 0.5) - 0.3) * 1.2;
    if (n - edge < 0.42) return c;
    const t = cell(x, y, 16, 645);
    return MOSS[n - edge > 0.58 ? (t < 0.3 ? 4 : 3) : t < 0.4 ? 3 : 2];
  }, 1, 3);
}
/** LEAVES: little leaves lying on the flags (green-gold and gone brown), each lit on its upper side, its shadow under it; `earth`: a heap of earth fallen through a crack in the vault, the leaves on and round it. */
function leavesTile(earth: boolean, seed: number): Sprite {
  const base = pixelsOf(tileOf((x, y) => {
    const c = tombFloorAt(x, y);
    if (!earth) return c;
    const u = x - 3;
    const v = y - 2;
    const d = Math.hypot((u - 0.5) / 0.4, (v - 0.5) / 0.32) + (fbm4(x, y, 6, seed) - 0.5) * 0.5;
    if (d > 1) return d < 1.12 && cell(x, y, 16, seed + 1) < 0.5 ? EARTH[1] : c;
    // the heap: lit on its upper left, a clod or a stone here and there
    const h = 1 - d;
    const lx = (u - 0.5) + (v - 0.5) * 0.4;
    let k = h > 0.6 ? 3 : h > 0.3 ? 2 : 1;
    if (lx < -0.1 && h > 0.2) k += 1;
    const st = cell(x, y, 10, seed + 3);
    if (st > 0.86) return STONE[st > 0.95 ? 4 : 3];
    return EARTH[clampK(k)];
  }, 3, 2));
  const n = earth ? 16 : 12;
  for (let i = 0; i < n; i++) {
    const cx = 0.12 + hash(i, 1, seed) * 0.76;
    const cy = 0.12 + hash(i, 2, seed) * 0.76;
    const X = Math.round(HALF + (cx - cy) * 32);
    const Y = Math.round((cx + cy) * 16);
    const brown = hash(i, 3, seed) < 0.45;
    const R = brown ? DRY : LEAF;
    const turn = hash(i, 4, seed) < 0.5 ? 1 : -1;
    const shape: [number, number, number][] = [[0, 0, 3], [1, 0, 4], [2, turn, 2], [-1, 0, 2], [1, -1, 3]];
    if (!base.has(X, Y)) continue;
    for (const [dx, dy, k] of shape) if (base.has(X + dx, Y + dy)) base.set(X + dx, Y + dy, R[k]);
    if (base.has(X, Y + 1)) base.set(X, Y + 1, SEAM);
    if (base.has(X + 1, Y + 1)) base.set(X + 1, Y + 1, R[1]);
  }
  return base.sprite(HALF, 0, GRAIN);
}
/** A knight cut in a grave slab (u along it 0 at his head, v across 0 to 1): his outline, his sword down his middle. */
function slabKnight(u: number, v: number): boolean {
  const a = Math.abs(v - 0.5);
  const ring = Math.hypot((u - 0.16) * 2.2, a * 1.3);
  if (ring > 0.11 && ring < 0.15) return true;
  const half = u < 0.24 ? 0 : u < 0.32 ? 0.3 : 0.3 - (u - 0.32) * 0.22;
  if (u > 0.24 && u < 0.92 && Math.abs(a - half) < 0.035) return true;
  if (u > 0.9 && u < 0.93 && a < half) return true;
  if (u > 0.3 && u < 0.88 && a < 0.025) return true;
  if (u > 0.42 && u < 0.45 && a < 0.16) return true;
  return false;
}
/** A GRAVE SLAB of the king's court, two tiles long, let into the floor: its head's tile (`head`) or its foot's, along x or y; a knight cut in it, moss in the cut and on it. */
function slabTile(alongX: boolean, head: boolean): Sprite {
  return tileOf((x, y) => {
    const u = x - 1;
    const v = y - 2;
    const al = (alongX ? u : v) * 0.5 + (head ? 0 : 0.5);
    const ac = alongX ? v : u;
    const e = Math.min(al * 2, (1 - al) * 2, ac, 1 - ac);
    if (e < 0.025) return SEAM;
    if (e < 0.06) return (alongX ? ac > 0.5 || al < 0.04 : ac < 0.5 || al < 0.04) ? SLAB[1] : SLAB[4];
    if (slabKnight(al, ac)) return fbm4(x, y, 6, 653) > 0.55 ? MOSS[1] : SLAB[0];
    const n = fbm4(x, y, 6, 651);
    if (n > 0.6 && cell(x, y, 16, 655) < 0.6) return MOSS[n > 0.68 ? 3 : 2];
    return SLAB[n > 0.56 ? 3 : n > 0.38 ? 2 : 1];
  }, 1, 2);
}

// =================================================================================================
// THE TOMB'S WALL: pale dressed stone in courses on a moulded plinth; A PILASTER at every bay's start (fluted, a capital carved
// with leaves), straddling the joint with the bay before; in the bay A ROTTED BANNER, A WALL TOMB with its effigy, A BURIAL CELL
// barred with the Warden's iron, THE KING'S CROWN carved in a panel, or bare stone; THE TOWN'S ROOTS down it from the vault,
// some to the floor; MOSS on the lower courses, the plinth, the tops of stones. Laid out along the bay from its start (J, 0 to
// 63: J 32 the joint between its two tiles), in the screen's own terms (`sgn`: which way J runs on the screen), so that the
// light falls from the screen's left on either face.

export type Bay = 'banner' | 'tomb' | 'cell' | 'crown' | 'plain';
/** A root down a bay: where it comes through the vault (J), how far down it reaches (up), how thick at the top, its seed. */
export interface WallRoot { x0: number; end: number; thick: number; seed: number }
export interface TombBay { what: Bay; roots: readonly WallRoot[] }
/** The bays of the tomb's walls (each two tiles): every one with the town's roots in it, some to the floor. */
export const TOMB_BAYS: readonly TombBay[] = [
  { what: 'banner', roots: [{ x0: 46, end: 26, thick: 6.5, seed: 1 }] },
  { what: 'tomb', roots: [{ x0: 20, end: -4, thick: 7.5, seed: 2 }] },
  { what: 'cell', roots: [{ x0: 44, end: 40, thick: 5, seed: 3 }] },
  { what: 'crown', roots: [{ x0: 20, end: 30, thick: 5.5, seed: 4 }, { x0: 46, end: 52, thick: 4, seed: 5 }] },
  { what: 'plain', roots: [{ x0: 30, end: -4, thick: 9, seed: 6 }] },
  { what: 'tomb', roots: [{ x0: 44, end: 46, thick: 4.5, seed: 7 }] },
];
/** His hall's walls, in order along them (bays of two tiles): his banners, his cells, the king's crown, a wall tomb. */
export const HALL_BAYS: readonly TombBay[] = [
  { what: 'banner', roots: [{ x0: 44, end: 36, thick: 5, seed: 11 }] },
  { what: 'cell', roots: [] },
  { what: 'crown', roots: [{ x0: 22, end: -4, thick: 8, seed: 12 }] },
  { what: 'banner', roots: [] },
];
/** The pilaster's half width; the capital's band; a banner's rod and its half width. */
export const TOMB_BAY = { pHalf: 6, capital: 60, capTop: 70, rod: 70, bHalf: 15 };

/** A root down a face at (J, up): how far across it (-1 to 1, screen-relative: less than 0 toward the light), or null. */
function wallRootAt(J: number, up: number, sgn: number, roots: readonly WallRoot[]): number | null {
  let best: number | null = null;
  let bestE = 9;
  for (const r of roots) {
    if (up < r.end || up > 86) continue;
    const t = (up - r.end) / (86 - r.end);
    const thick = r.thick * (0.35 + 0.65 * t) + 0.8;
    const wob = Math.sin(up * 0.09 + r.seed * 1.7) * 5 + Math.sin(up * 0.23 + r.seed) * 2 + (up - r.end) * (hash(r.seed, 1, 311) - 0.5) * 0.12;
    const xm = r.x0 + wob;
    const e = Math.abs(J - xm);
    if (e < thick && e / thick < bestE) {
      bestE = e / thick;
      best = ((J - xm) / thick) * sgn;
    }
    // a side root, thinner, off it
    const at = r.end + (86 - r.end) * (0.3 + hash(r.seed, 2, 313) * 0.4);
    if (up < at && up > at - 20) {
      const dir = hash(r.seed, 3, 315) < 0.5 ? -1 : 1;
      const xs = xm + dir * (at - up) * 0.8 + Math.sin(up * 0.3) * 1.5;
      const ws = 1.1 + ((up - (at - 20)) / 20) * 1.2;
      const es = Math.abs(J - xs);
      if (es < ws && xs > 1 && xs < 63 && es / ws < bestE) {
        bestE = es / ws;
        best = ((J - xs) / ws) * sgn;
      }
    }
  }
  return best;
}

/** The face's stone, coursed and damp: moss on the lower courses, in the joints and on the tops of stones; darker low down. */
function ashlar(J: number, up: number, sgn: number, seed: number, lit: boolean): string {
  const S = STONE;
  const dn = lit ? 0 : 1;
  const CH = 16;
  const cv = up - 12;
  const row = Math.floor(cv / CH);
  const lv = mod(cv, CH);
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = 30 + Math.floor(hash(row, seed, 2) * 14);
  const uu = J * sgn + off + 400;
  const b = Math.floor(uu / L);
  const lu = mod(uu, L);
  if (lv === CH - 1 || lu === 0) return fbm(J / 20, up / 14, seed + 5) > 0.5 ? MOSS[clampK(1 + (lit ? 1 : 0))] : SEAM;
  let kk = 2;
  const tone = hash(b, row * 7 + seed, 3);
  if (tone < 0.18) kk -= 1;
  else if (tone > 0.9) kk += 1;
  if (lv === CH - 2) kk += 1;
  if (lit && lu === 1) kk += 1;
  if (lv === 0 || lu === L - 1) kk -= 1;
  if (hash(b, row, seed + 9) > 0.8 && lv > CH - 5 && lu < 4) kk -= 1;
  if (up < 30 && fbm(J / 18, up / 10, seed + 7) > 0.56) return MOSS[clampK(kk - dn)];
  if (lv >= CH - 3 && fbm(J / 11, up / 8, seed + 13) > 0.62) return MOSS[clampK(kk + 1 - dn)];
  const c = S[clampK(kk - dn)];
  return up < 22 ? mixC(c, S[0], 0.18) : c;
}

/** An effigy in a wall tomb, lying: how high it stands over the chest at `m` from the niche's middle (0: none). */
function effigyProfile(m: number): number {
  if (m < -18 || m > 17) return 0;
  if (m < -11) return Math.hypot(m + 14, 0) < 3.6 ? 7 : 3;
  if (m < -9) return 5;
  if (m < -1) return m > -7 && m < -2 ? 7 : 5;
  if (m < 12) return 4;
  return m < 15 ? 7 : 5;
}

/**
 * THE TOMB'S WALL at a point: `J` along the bay from its start (0 to 63), `up` over the floor; `sgn` which way J runs on the
 * screen (+1 to the right: a wall along x, turned to screen-left and lit; -1: along y, in shade, a tone down). A colour.
 */
function tombAt(J: number, up: number, sgn: number, bay: TombBay, seed: number): string {
  const S = STONE;
  const I = IRON;
  const lit = sgn > 0;
  const dn = lit ? 0 : 1;
  const B = TOMB_BAY;
  // (across the pilaster at the bay's start, and across the bay from its middle; screen-relative: less than 0 toward the light)
  const dd = J < 32 ? J + 0.5 : J + 0.5 - 64;
  const d = dd * sgn;
  const m = (J + 0.5 - 32) * sgn;
  // THE ROOTS of the town's trees, come down through the vault
  const ra = wallRootAt(J + 0.5, up, sgn, bay.roots);
  if (ra !== null) {
    if (Math.abs(ra) > 0.82) return ROOT[0];
    let k = ra < -0.4 ? 3 : ra < 0.25 ? 2 : 1;
    if (hash(J, Math.floor(up / 3), 333) > 0.85) k -= 1;
    if (ra < -0.2 && fbm(J / 6, up / 6, 335 + seed) > 0.6) return MOSS[clampK(k + 1 - dn)];
    return ROOT[clampK(k + 1 - dn)];
  }
  // THE PILASTER: square, 12 across, fluted, on its base, its capital a band of carved leaves
  if (Math.abs(d) <= B.pHalf) {
    const di = Math.round(d - 0.5);
    if (up < 14) {
      if (up < 8 && fbm(J / 8, up / 4, seed + 3) > 0.58) return MOSS[clampK(3 - dn)];
      return up === 13 ? S[clampK(4 - dn)] : up === 12 ? S[clampK(1 - dn)] : up < 2 ? S[clampK(1 - dn)] : S[clampK(3 - dn)];
    }
    if (up >= B.capital && up < B.capTop) {
      if (up === B.capTop - 1) return S[clampK(4 - dn)];
      if (up === B.capital) return SEAM;
      return mod(di + up, 4) < 2 ? S[clampK(3 - dn)] : S[clampK(2 - dn)];
    }
    if (di === -6) return S[clampK(4 - dn)];
    if (di === -5) return S[clampK(3 - dn)];
    if (di >= 5) return S[clampK(1 - dn)];
    if (di === -2 || di === 2) return S[clampK(1 - dn)];
    if (di === -1 || di === 3) return S[clampK(3 - dn)];
    return S[clampK(2 - dn)];
  }
  // THE PLINTH: a moulding, mossed
  if (up < 12) {
    if (fbm(J / 16, up / 6, seed + 3) > 0.55) return MOSS[clampK((up > 8 ? 3 : 2) - dn)];
    if (up === 11) return S[clampK(4 - dn)];
    if (up === 10) return S[clampK(2 - dn)];
    if (up === 9) return SEAM;
    if (up < 2) return S[clampK(1 - dn)];
    return S[clampK(2 - dn)];
  }
  const what = bay.what;
  // A BANNER of the king's from a rod at 70, rotted: its hem eaten ragged, holes through it, moss on it; a border and the crown
  if (what === 'banner' && Math.abs(m) <= B.bHalf + 1) {
    const C = CLOTH;
    const T = TRIM;
    if (up >= B.rod && up < B.rod + 2) return Math.abs(m) > B.bHalf ? I[4] : up === B.rod + 1 ? I[3] : I[1];
    let hem = 30 + Math.floor(hash(seed, Math.floor((m + 20) / 3), 41) * 7) + Math.max(0, 9 - Math.abs(m)) * 0.9;
    if (hash(seed, Math.floor((m + 20) / 4), 45) > 0.6) hem += 10;
    if (Math.abs(m) <= B.bHalf && up < B.rod && up >= hem) {
      if (fbm(m / 5, up / 5, seed + 17) > 0.68) return ashlar(J, up, sgn, seed, lit);
      const f = mod(m + 15, 10);
      let kk = f < 3 ? 4 : f < 7 ? 3 : 2;
      if (Math.abs(m) >= 14.5) kk = 1;
      if (Math.abs(m) >= 12 && Math.abs(m) < 14) return T[clampK(kk - dn)];
      if (up >= hem + 3 && up < hem + 5) return T[clampK(kk - dn)];
      if (up >= 64 && up < 66) return T[clampK(kk - dn)];
      const cr = crownPx(m, up - 49, 9);
      if (cr === 'gold') return T[clampK(kk + 1 - dn)];
      if (cr === 'dark') return T[clampK(kk - 1 - dn)];
      if (fbm(m / 4, up / 4, seed + 7) > 0.66) return MOSS[clampK(kk - dn)];
      if (fbm(m / 6, up / 22, seed + 3) > 0.62) return C[clampK(kk + 1 - dn)];
      return C[clampK(kk - dn)];
    }
  }
  // A WALL TOMB: an arched niche, a chest with a little arcade carved on it, an effigy lying on it mossed
  if (what === 'tomb' && Math.abs(m) <= 24 && up >= 14 && up < 62) {
    const ni = Math.abs(m) < 20 && (up < 44 || (m / 20) ** 2 + ((up - 44) / 13) ** 2 < 1);
    const ri = Math.abs(m) < 24 && (up < 44 || (m / 24) ** 2 + ((up - 44) / 17) ** 2 < 1);
    if (ri && !ni) return S[clampK((m < 0 || up > 50 ? 4 : 1) - dn - (Math.abs(m) > 22 ? 1 : 0))];
    if (ni) {
      const ef = effigyProfile(m * sgn);
      if (up >= 16 && up < 25) {
        if (up === 24) return S[clampK(4 - dn)];
        if (up === 16) return S[clampK(1 - dn)];
        const ar = mod(m + 20, 8);
        if (up < 22 && ar > 1 && ar < 6 && !(up > 19 && (ar === 2 || ar === 5))) return S[clampK(1 - dn)];
        return S[clampK(3 - dn)];
      }
      if (ef && up >= 25 && up < 25 + ef) {
        const top = up === 24 + ef;
        if (fbm(m / 3, up / 3, seed + 21) > 0.5 && up > 25 + ef - 3) return MOSS[clampK((top ? 4 : 3) - dn)];
        return S[clampK((top ? 4 : up < 27 ? 2 : 3) - dn)];
      }
      return mixC(S[clampK(1 - dn)], SEAM, up > 40 ? 0.35 : 0.15);
    }
  }
  // A BURIAL CELL barred with the Warden's iron: an arched opening, bars every six, crossbars, a lock plate; bones in the dark
  if (what === 'cell' && Math.abs(m) <= 21 && up >= 12 && up < 64) {
    const ni = Math.abs(m) < 16 && (up < 42 || (m / 16) ** 2 + ((up - 42) / 14) ** 2 < 1);
    const ri = Math.abs(m) < 21 && (up < 42 || (m / 21) ** 2 + ((up - 42) / 19) ** 2 < 1);
    if (ri && !ni) return S[clampK((m < 0 || up > 48 ? 4 : 1) - dn - (Math.abs(m) > 19 ? 1 : 0))];
    if (ni) {
      if (Math.abs(m) <= 3 && up >= 27 && up < 34) {
        if (Math.abs(m) < 1 && (up === 29 || up === 30)) return SEAM;
        return up === 33 || m < -2.5 ? I[clampK(4 - dn)] : I[2];
      }
      const bm = mod(m + 16, 6);
      if (bm < 2) return bm < 1 ? I[clampK(4 - dn)] : I[1];
      if (up === 24 || up === 25 || up === 46 || up === 47) return up === 25 || up === 47 ? I[clampK(3 - dn)] : I[1];
      const sk = Math.hypot(m + 6, (up - 19) * 1.2);
      if (sk < 3.4) return BONE[clampK((sk < 1.6 ? 2 : 1) - dn)];
      if (up >= 15 && up < 17 && m > -1 && m < 12) return BONE[clampK(1 - dn)];
      return mixC(SEAM, BEYOND, 0.6);
    }
  }
  // THE KING'S CROWN in a carved panel, a little of its gilding left
  if (what === 'crown' && Math.abs(m) <= 15 && up >= 24 && up < 58) {
    const e = Math.min(15 - Math.abs(m), up - 24, 57 - up);
    if (e < 1) return S[clampK((m < 0 || up > 54 ? 4 : 1) - dn)];
    if (e < 3) return S[clampK(3 - dn)];
    if (e < 4) return SEAM;
    const cr = crownPx(m, up - 40, 11);
    if (cr === 'gold') {
      const rim = crownPx(m - 1, up - 39, 11) === null;
      return mixC(S[clampK((rim ? 4 : 3) - dn)], TRIM[3], 0.35);
    }
    if (cr === 'dark') return SEAM;
    if (fbm(m / 4, up / 4, seed + 31) > 0.64) return MOSS[clampK(2 - dn)];
    return S[clampK(1 - dn)];
  }
  return ashlar(J, up, sgn, seed, lit);
}

/** Fade the top of each column of a face, as the game's (its four steps): the rows `top` to `top + TOMB_FADE`. */
function fadeTop(p: Px, topOf: (x: number) => number | null): void {
  for (let x = 0; x < p.w; x++) {
    const top = topOf(x);
    if (top === null) continue;
    for (let k = 0; k < TOMB_FADE; k++) {
      const y = top + k;
      const c = p.get(x, y);
      if (!c || OWN.has(c)) continue;
      p.d[(y * p.w + x) * 4 + 3] = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / TOMB_FADE)]);
    }
  }
}

/**
 * A TILE OF WALL: its one face, as the game's walls are laid (art/ground.ts, a face alone): along x its face turned to screen-
 * left, along y to screen-right, standing on the tile's near edge; TOMB_WALL high, its top TOMB_FADE fading out in the game's
 * four steps. `paint(J, up, sgn)` its face (J along the bay from `J0`). Anchored at the floor point of the tile's top corner.
 */
function wallTile(alongX: boolean, J0: number, paint: (J: number, up: number, sgn: number) => string): Sprite {
  const H = TOMB_WALL;
  const p = new Px(TW, TH + H);
  const iso = new Iso(p, HALF, H);
  const tops = new Map<number, number>();
  const shade = (_u: number, v: number, _w: number, h: number, px: number, py: number): string | null => {
    if (v === 0) tops.set(px, py);
    const up = h - 1 - v;
    const J = alongX ? J0 + px : J0 + (TW - 1 - px);
    return paint(J, up, alongX ? 1 : -1);
  };
  if (alongX) iso.left(0, 1, 1, 0, H, shade);
  else iso.right(1, 0, 1, 0, H, shade);
  fadeTop(p, (x) => tops.get(x) ?? null);
  // (the joint between two tiles' faces left empty, as floor 1's own walls leave it: art/ground.ts)
  const joint = alongX ? 0 : TW - 1;
  for (let y = 0; y < p.h; y++) p.erase(joint, y);
  return p.sprite(HALF, H, GRAIN);
}

// =================================================================================================
// THE WAY BETWEEN TWO ROOMS: a round-headed way under a ring of voussoirs (moss on them), the tomb's wall either side of it to
// the tile beyond, a root come down over it. Strips (art/gates.ts, Flat) from u -32 (the tile before the doorway) to u 128.

/** Its measures from the way's middle: the way's half width, its spring, its rise; the ring. */
export const ARCHWAY = { half: 46, spring: 40, rise: 28, ring: 8 };
function inRound(du: number, up: number, half: number, spring: number, rise: number): boolean {
  if (Math.abs(du) >= half) return false;
  if (up < spring) return up >= 0;
  return (du / half) ** 2 + ((up - spring) / rise) ** 2 < 1;
}
/** Is a point (du from the way's middle, up) in the way through? */
export function inArchway(du: number, up: number): boolean {
  return inRound(du, up, ARCHWAY.half, ARCHWAY.spring, ARCHWAY.rise);
}
/** The ring of voussoirs round a round-headed way at a point (du screen-relative: less than 0 toward the light), if it is on it. */
function ringAt(du: number, up: number, half: number, spring: number, rise: number, ring: number, lit: boolean, seed: number): string | null {
  const S = STONE;
  const dn = lit ? 0 : 1;
  if (inRound(du, up, half, spring, rise)) return null;
  if (up < spring) {
    const a = Math.abs(du);
    if (a >= half + ring) return null;
    const e = a - half;
    if (e < 1) return S[clampK((du < 0 ? 4 : 1) - dn)];
    if (e > ring - 1.2) return SEAM;
    if (mod(up, 16) === 15) return SEAM;
    if (up < 14 && fbm(du / 6, up / 5, seed + 3) > 0.55) return MOSS[clampK(3 - dn)];
    return S[clampK(3 - dn)];
  }
  if (!inRound(du, up, half + ring, spring, rise + ring)) return null;
  const ang = Math.atan2(up - spring, du * (rise / half));
  const n = 11;
  const idx = Math.floor((ang / Math.PI) * n + 0.5);
  const into = (ang / Math.PI) * n + 0.5 - idx;
  const key = idx === Math.floor(n / 2);
  if (!inRound(du, up + 1.2, half + ring - 1.2, spring, rise + ring - 1.2)) return SEAM;
  if (into < 0.07 && !key) return SEAM;
  const inner = !inRound(du, up - 1.5, half + 1.5, spring, rise + 1.5);
  if (inner && (du < 0 || up > spring + rise * 0.6)) return S[clampK(4 - dn)];
  if (fbm(du / 6, up / 6, 371 + seed) > 0.6) return MOSS[clampK(3 - dn)];
  return S[clampK((idx % 2 ? 3 : 2) - dn)];
}
function archwayStrips(alongX: boolean): Strip[] {
  const H = TOMB_WALL + 4;
  const F = new Flat(-32, 128, H);
  const scr = (u: number): number => (alongX ? u + 0.5 - 48 : 48 - (u + 0.5));
  const fadeA = (up: number): number => {
    const k = TOMB_WALL - 1 - up;
    return k < 0 ? 0 : k < TOMB_FADE ? Math.round(255 * FADE_STEPS[Math.floor((k * 4) / TOMB_FADE)]) : 255;
  };
  const A = ARCHWAY;
  const roots: WallRoot[] = [{ x0: 14, end: 50, thick: 5.5, seed: 21 }, { x0: 132, end: -4, thick: 6, seed: 22 }];
  for (let v = 0; v < TOMB_WALL; v++) {
    for (let u = -32; u < 128; u++) {
      const du = scr(u);
      if (inArchway(du, v)) continue;
      // (laid out as a face from the tile before the doorway, J running with the screen: a root over the way's left shoulder, one down the far tile)
      const J = du + 80;
      const sgn = alongX ? 1 : -1;
      const ra = wallRootAt(J, v, 1, roots);
      let c: string;
      if (ra !== null) c = Math.abs(ra) > 0.82 ? ROOT[0] : ROOT[clampK((ra < -0.4 ? 3 : ra < 0.25 ? 2 : 1) + 1)];
      else c = ringAt(du, v, A.half, A.spring, A.rise, A.ring, true, 0) ?? ashlar(Math.floor(J), v, 1, 23, true);
      const a = fadeA(v);
      if (a === 0) continue;
      F.set(u, v, alongX || sgn > 0 ? c : shaded(c), a);
    }
  }
  return F.strips(alongX);
}

// =================================================================================================
// THE TOWN'S STAIRS COMING DOWN, in the first room's back wall where the game stands them (art/town_ways.ts `floorStairsUp`: its
// picture's size, anchor and shape pixel for pixel, seen through the gate's arch): a flight of the tomb's own stone going up
// away from the room under a vault, moss on its steps' ends, and down it THE TOWN'S DAYLIGHT, brighter the higher, pouring out
// over the treads; at its head the day.

const stairsUp = new Map<boolean, Sprite>();
function stairsUpOf(alongX: boolean): Sprite {
  const had = stairsUp.get(alongX);
  if (had) return had;
  // (the picture: as town_ways.ts's Plane, ARCH_WIDE + 8 across, 112 + ARCH_WIDE / 2 + 12 high, its anchor at 4 or ARCH_WIDE + 4, 112)
  const W = ARCH_WIDE + 8;
  const H = 112 + ARCH_WIDE / 2 + 12;
  const ax = alongX ? 4 : ARCH_WIDE + 4;
  const ay = 112;
  const p = new Px(W, H);
  const S = new Scene(new Px(W, H), ax, ay);
  const { run, rise, half, vault } = STAIRS_UP;
  const mid = ARCH_WIDE / 2 / 0.8;
  const toFace = (q: V3): V3 => (alongX ? [q[0] - mid, q[1], q[2]] : [q[1] - mid, q[0], q[2]]);
  const eye: V3 = [1, 1, 0.8];
  const arch = curveOf(ARCH);
  const inArch = (a: number, z: number): boolean => inWay(ARCH, arch, Math.floor((a + mid) * 0.8), Math.floor(z));
  const stepTop = (d: number): number => (d < 0 ? 0 : (Math.floor(d / run) + 1) * rise);
  const air = (a: number, b: number, z: number): boolean => {
    const d = -b;
    if (d < 0) return true;
    if (Math.abs(a) > half) return false;
    if (z < stepTop(d)) return false;
    const top = vault + d * (rise / run) + Math.sqrt(Math.max(0, 1 - (a / half) ** 2)) * 14 - 14;
    return z < top;
  };
  const wall = (k: number): string => (alongX ? STONE[k] : STONE[Math.max(0, k - 1)]);
  const day = mixC(SUN.town, '#ffffff', 0.15);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r0 = toFace(S.ray(x, y));
      const t0 = -r0[1];
      const a0 = r0[0] + eye[0] * t0;
      const z0 = eye[2] * t0;
      if (z0 < 0 || !inArch(a0, z0)) continue;
      let t = t0;
      let hit: V3 | null = null;
      for (let k = 0; k < 900; k++) {
        t -= 0.4;
        const q: V3 = [r0[0] + eye[0] * t, r0[1] + t, eye[2] * t];
        if (!air(q[0], q[1], q[2])) {
          hit = q;
          break;
        }
        if (-q[1] > 300) break;
      }
      // (past the flight's head: the day)
      let c: string = day;
      if (hit) {
        const d = -hit[1];
        const onTread = hit[2] - stepTop(d) > -0.6 && Math.abs(hit[0]) <= half;
        const onRiser = !onTread && Math.abs(hit[0]) <= half - 0.5 && hit[2] < stepTop(d) + 0.1 && hit[2] >= stepTop(d) - rise - 0.1;
        const inSide = Math.abs(hit[0]) > half - 0.5;
        const end = Math.abs(hit[0]) > half - 9;
        if (onTread) {
          const into = d - Math.floor(d / run) * run;
          c = into < 1.4 ? FLAGS[4] : into > run - 1.6 ? FLAGS[0] : hash(Math.floor(d / run), Math.floor(hit[0] / 22), 951) < 0.35 ? FLAGS[3] : FLAGS[2];
          if (Math.abs(((hit[0] + 60) % 22) - 11) > 10.4) c = SEAM;
          else if (end && hash(Math.floor(d / run), Math.floor(hit[0]), 955) < 0.6) c = MOSS[into < 1.4 ? 3 : 2];
        } else if (onRiser) {
          // a riser, turned to the room: in its own shade under the nosing over it, a joint along its foot
          c = hit[2] - (stepTop(d) - rise) < 1 ? SEAM : hit[2] > stepTop(d) - 1.5 ? wall(0) : hash(Math.floor(d / run), Math.floor(hit[0] / 26), 953) < 0.3 ? wall(2) : wall(1);
        } else if (inSide) {
          const course = Math.floor(hit[2] / 12);
          const runAlong = d + (course % 2) * 14;
          c = hit[2] % 12 < 1 || runAlong % 28 < 1 ? SEAM : hash(Math.floor(runAlong / 28), course, 952) < 0.3 ? wall(3) : wall(2);
          if (hit[2] < 10 + hash(Math.floor(d / 6), 1, 957) * 8 && hash(Math.floor(d / 3), Math.floor(hit[2] / 3), 959) < 0.5) c = MOSS[2];
          if (hit[0] > 0) c = mixC(c, '#06051a', 0.3);
        } else c = wall(1);
        // (the town's daylight down the flight: the higher, the brighter; the treads catch it most)
        const k = d < 6 ? 0.06 : d < 20 ? 0.18 : d < 38 ? 0.3 : d < 58 ? 0.42 : d < 80 ? 0.54 : 0.66;
        c = mixC(c, SUN.town, Math.min(0.84, k * (onTread ? 1.25 : onRiser ? 0.6 : 0.8)));
      }
      p.set(x, y, c);
    }
  }
  const sp = p.sprite(ax, ay, GRAIN);
  stairsUp.set(alongX, sp);
  return sp;
}

// =================================================================================================
// THE STAIRWELL DOWN (art/crypt_ways.ts makeStairwell, and its opening, art/stairwell_open.ts: their shape and timing the game's),
// in the tomb's stone: the floor's own painters given the tomb's colours

/** The tomb's stone as a theme of the game's ground painters (art/ground.ts Theme): floor 1's own (CRYPT_FLOORS[0]) in look B's colours. */
export const TOMB_THEME: Theme = {
  ...CRYPT_FLOORS[0],
  id: 'tomb',
  mortar: SEAM,
  slab: [FLAGS[0], FLAGS[1], FLAGS[2], FLAGS[3]],
  cap: [STONE[1], STONE[2], STONE[3], STONE[3], STONE[4]],
  capLow: [STONE[0], STONE[1], STONE[2], STONE[2], STONE[3]],
  lit: [SEAM, STONE[1], STONE[2], STONE[2], STONE[3]],
  shade: [BEYOND, STONE[0], STONE[1], STONE[1], STONE[2]],
  earth: { ...CRYPT_FLOORS[0].earth!, dirt: [EARTH[0], EARTH[1], EARTH[2], EARTH[3]], rock: [STONE[0], STONE[1], STONE[2], STONE[3]] },
};

// =================================================================================================
// THE PLACE'S OWN PIECES

/** A thing painted into a picture with a depth (anchored at (AX, AY) on it, the floor's (0, 0) there). */
function pic(W: number, H: number, AX: number, AY: number, paint: (D: Deep) => void): Sprite {
  const p = new Px(W, H);
  paint(new Deep(p, AX, AY));
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

/** The court's tombs: a chest of the tomb's stone on a plinth, a little arcade carved round its sides, its lid overhanging, an EFFIGY lying on it; moss on them. */
const CH = { len: 1.9, wide: 0.42, plinth: 4, top: 22, lid: 27 };
type Mat = 'plinth' | 'chest' | 'lid' | 'effigy' | 'iron';
/** A TOMB OF THE KING'S COURT, along x or y, its head toward -x (or -y); `bound`: in THE WARDEN'S IRON, two straps round it riveted and a lock hung on its side. 112 x 108 at the floor point under its middle. */
function courtTomb(alongX: boolean, bound: boolean): Sprite {
  return pic(112, 108, 56, 78, (D) => {
    const hl = CH.len / 2;
    const hw = CH.wide;
    const loc = (x: number, y: number): [number, number] => (alongX ? [x, y] : [y, x]);
    const straps = [-hl * 0.45, hl * 0.42];
    const eff = (a: number, b: number, z: number): number => {
      const zb = z - CH.lid;
      const e = (ca: number, cb: number, cz: number, ra: number, rb: number, rz: number): number => ((a - ca) / ra) ** 2 + ((b - cb) / rb) ** 2 + ((zb - cz) / rz) ** 2 - 1;
      return Math.min(
        e(-hl * 0.78, 0, 4, 0.13, 0.13, 5.5),
        e(-hl * 0.86, 0, 1.2, 0.12, 0.22, 2.2),
        e(-hl * 0.05, 0, 2.4, hl * 0.66, 0.2, 4.2),
        e(-hl * 0.32, 0, 6.2, 0.1, 0.09, 2.6),
        e(hl * 0.74, -0.08, 5.5, 0.06, 0.055, 6), e(hl * 0.74, 0.08, 5.5, 0.06, 0.055, 6),
      );
    };
    const mat = (x: number, y: number, z: number): Mat | null => {
      const [a, b] = loc(x, y);
      if (z < 0) return null;
      const strap = bound && straps.some((s) => Math.abs(a - s) < 0.05);
      if (z < CH.plinth) return Math.abs(a) < hl + 0.06 && Math.abs(b) < hw + 0.06 ? 'plinth' : null;
      if (z < CH.top) {
        if (strap && Math.abs(a) < hl + 0.03 && Math.abs(b) < hw + 0.03) return 'iron';
        return Math.abs(a) < hl && Math.abs(b) < hw ? 'chest' : null;
      }
      if (z < CH.lid) {
        if (strap && Math.abs(a) < hl + 0.08 && Math.abs(b) < hw + 0.08 && z < CH.lid + 1) return 'iron';
        return Math.abs(a) < hl + 0.05 && Math.abs(b) < hw + 0.05 ? 'lid' : null;
      }
      if (z < CH.lid + 14 && Math.abs(a) < hl && Math.abs(b) < hw) {
        if (eff(a, b, z) < 0) return strap && eff(a, b, z - 1) < 0 && eff(a, b, z + 1.2) >= 0 ? 'iron' : 'effigy';
        if (strap && eff(a, b, z - 1.2) < 0) return 'iron';
      }
      return null;
    };
    const reach = Math.max(hl, hw) + 0.15;
    D.march({
      box: { x0: -reach, y0: -reach, z0: 0, x1: reach, y1: reach, z1: CH.lid + 16 },
      inside: (x, y, z) => mat(x, y, z) !== null,
      shade: (x, y, z, face) => {
        const m = mat(x, y, z) ?? 'chest';
        const [a, b] = loc(x, y);
        let k = 2;
        if (m === 'effigy') {
          const e = 0.03;
          const gx = eff(...loc(x + e, y), z) - eff(...loc(x - e, y), z);
          const gy = eff(...loc(x, y + e), z) - eff(...loc(x, y - e), z);
          const gz = (eff(a, b, z + 1) - eff(a, b, z - 1)) * 0.8;
          const n = Math.hypot(gx, gy, gz) || 1;
          const l = (gx * -0.3 + gy * 0.45 + gz * 0.85) / n;
          k = l > 0.62 ? 4 : l > 0.28 ? 3 : l > -0.1 ? 2 : 1;
          if (l > 0.3 && fbm(a * 9, b * 9 + z / 8, 881) > 0.48) return MOSS[clampK(k)];
          return STONE[clampK(k)];
        }
        if (face === 'z') k = m === 'lid' ? 4 : 3;
        else if (face === 'y') k = 3;
        else if (face === 'x') k = 1;
        if (m === 'iron') return IRON[clampK(k)];
        let col = STONE[clampK(k)];
        if (m === 'chest' && face !== 'z') {
          const along = face === 'y' ? (alongX ? a : b) : alongX ? b : a;
          const ar = mod(along * 32 + 40, 9);
          const up = z - CH.plinth;
          if (up > 3 && up < 14 && ar > 1.5 && ar < 7.5 && !(up > 10 && (ar < 2.5 || ar > 6.5))) col = STONE[clampK(k - 1)];
          if (up >= CH.top - CH.plinth - 1) col = STONE[clampK(k + 1)];
        }
        if (m === 'lid' && face !== 'z' && z > CH.lid - 1.5) col = STONE[clampK(k + 1)];
        if (m === 'plinth') col = STONE[clampK(k - 1)];
        if ((face === 'z' || z < CH.plinth + 3) && fbm(a * 8 + z / 6, b * 8, 883) > 0.55) col = MOSS[clampK(k)];
        return col;
      },
    }, 0.01);
    if (bound) {
      // THE LOCK hung on the strap at the chest's side toward the eye: plain old iron (the Warden's fire is only in his gate's lock)
      const [lx, ly] = alongX ? [straps[1], hw + 0.04] : [hw + 0.04, straps[1]];
      const [X0, Y0] = D.at(lx, ly, CH.top - 6);
      const X = Math.round(X0);
      const Y = Math.round(Y0);
      const d = lx + ly + 0.05;
      for (let j = -3; j < 0; j++) for (const i of [-2, 2]) D.put(X + i, Y + j, d, IRON[3]);
      D.put(X - 1, Y - 4, d, IRON[3]);
      D.put(X, Y - 4, d, IRON[3]);
      D.put(X + 1, Y - 4, d, IRON[2]);
      for (let j = 0; j < 6; j++) for (let i = -3; i <= 3; i++) D.put(X + i, Y + j, d, i === -3 || j === 0 ? IRON[4] : i === 3 || j === 5 ? IRON[0] : i === 0 && (j === 2 || j === 3) ? SEAM : IRON[2]);
    }
  });
}

/**
 * A SHAFT OF DAYLIGHT, from a crack in the vault: `r` its radius at the floor (tiles). Two pictures, both of LIGHT (drawn added to
 * what is under them, 'lighter', as a glow is): THE POOL where it falls (`pool`, flat with the floor: three bands, their edges a
 * checker of two-pixel squares) and THE COLUMN OF LIT AIR (`air`, four frames: leaning from the upper left, streaked along its
 * length, brightest low down and giving out in steps up into the dark, motes of dust turning in it). Both anchored at the pool's
 * middle on the floor.
 */
export const SHAFT_LEAN: readonly [number, number] = [0.0085, 0.004];
export const SHAFT_TOP = 300;
export const SHAFTS = { small: 0.4, middle: 0.52, large: 0.66 } as const;
function shaftPool(r: number): Sprite {
  // (whole game pixels: its size and anchor even)
  const even = (v: number): number => Math.ceil(v / 2) * 2;
  const rx = even(r * 1.15 * 45.3 + 4);
  const ry = even(r * 1.15 * 22.7 + 4);
  const W = rx * 2;
  const H = ry * 2;
  const p = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    // (the floor's point under the pixel, tiles from the middle)
    const sx = (x + 0.5 - rx) / 32;
    const sy = (y + 0.5 - ry) / 16;
    const wx = (sx + sy) / 2;
    const wy = (sy - sx) / 2;
    const jit = ((x >> 1) + (y >> 1)) & 1 ? 0.045 : -0.045;
    const d = Math.hypot(wx, wy) / r + jit;
    const k = d < 0.55 ? 3 : d < 0.85 ? 2 : d < 1.08 ? 1 : 0;
    if (k) p.set(x, y, SUN.pool[k - 1]);
  }
  return p.sprite(rx, ry, GRAIN);
}
function shaftAir(r: number, f: number): Sprite {
  const top = SHAFT_TOP;
  const rx = r * 45.25;
  const ry = r * 22.6;
  const [lx, ly] = SHAFT_LEAN;
  const shift = (z: number): [number, number] => [(-lx * z + ly * z) * 32, (-lx * z - ly * z) * 16 - z];
  const [tx, ty] = shift(top);
  // (whole game pixels: its size and anchor even)
  const X0 = Math.floor((Math.min(0, tx) - rx - 3) / 2) * 2;
  const X1 = Math.ceil((Math.max(0, tx) + rx + 3) / 2) * 2;
  const Y0 = Math.floor((ty - ry - 3) / 2) * 2;
  const Y1 = Math.ceil((ry + 3) / 2) * 2;
  const W = X1 - X0;
  const H = Y1 - Y0;
  const p = new Px(W, H);
  const lowZ = new Float32Array(W * H).fill(-1);
  const across = new Float32Array(W * H);
  for (let z = 0; z <= top; z++) {
    const [cx, cy] = shift(z);
    for (let py = Math.max(0, Math.floor(cy - ry - Y0)); py <= Math.min(H - 1, Math.ceil(cy + ry - Y0)); py++) {
      const vy = (py + Y0 + 0.5 - cy) / ry;
      if (Math.abs(vy) >= 1) continue;
      const hw = rx * Math.sqrt(1 - vy * vy);
      for (let px = Math.max(0, Math.floor(cx - hw - X0)); px <= Math.min(W - 1, Math.ceil(cx + hw - X0)); px++) {
        const ux = (px + X0 + 0.5 - cx) / rx;
        if (ux * ux + vy * vy >= 1) continue;
        const i = py * W + px;
        if (lowZ[i] < 0) {
          lowZ[i] = z;
          across[i] = ux;
        }
      }
    }
  }
  const bi = Math.round(r * 100);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = py * W + px;
    const z = lowZ[i];
    if (z < 0) continue;
    const h = z / top;
    const u = across[i];
    const chk = ((px >> 1) + (py >> 1)) & 1;
    let step = h < 0.18 + (chk ? 0.03 : 0) ? 3 : h < 0.42 + (chk ? 0.03 : 0) ? 2 : h < 0.7 + (chk ? 0.04 : 0) ? 1 : h < 0.92 && chk ? 1 : 0;
    if (Math.abs(u) > 0.78 + (chk ? 0.05 : 0)) step -= 1;
    const st = Math.floor((u + 1) * 5 + hash(bi, 7, 911) * 2);
    if (hash(st, bi, 913) > 0.62) step -= 1;
    // (the motes of dust, two-pixel squares, turning in it: a little higher each frame)
    const my = (py >> 1) + Math.floor(f * 1.5);
    if (h < 0.55 && Math.abs(u) < 0.8 && hash(px >> 1, my, 917 + bi) > 0.984) {
      p.set(px, py, SUN.mote);
      continue;
    }
    if (step <= 0) continue;
    p.set(px, py, SUN.air[step - 1]);
  }
  return p.sprite(-X0, -Y0, GRAIN);
}
/** WATER DRIPPING from a root in the vault into a puddle, frame `f` of eight: a drop falling (and one a frame behind it), a splash where it strikes. 16 x 184 at the floor point it strikes. */
export const DRIP_FRAMES = 8;
function drip(f: number): Sprite {
  const W = 16;
  const H = 184;
  const AX = 8;
  const AY = 176;
  const p = new Px(W, H);
  // the drop: falling faster as it goes (from 170 up), three pixels long, its head lit
  const fall = [170, 150, 122, 86, 42, 4];
  if (f < fall.length) {
    const h = fall[f];
    const len = f < 2 ? 2 : 4;
    for (let j = 0; j < len; j++) p.set(AX, AY - h - j, j === 0 ? WATER[4] : WATER[3]);
    p.set(AX + 1, AY - h, WATER[3]);
  }
  // the splash: a crown of little drops thrown up and out, falling back
  if (f >= 5) {
    const t = f - 5;
    for (const [dx, up] of [[-3, 3 + t], [3, 3 + t], [-5, 1 + t], [5, 1 + t], [0, 6 + 2 * t]] as const) {
      const yy = AY - Math.max(1, up - t * t);
      p.set(AX + dx, yy, WATER[4]).set(AX + dx + (dx < 0 ? -1 : 1), yy, WATER[3]);
    }
  }
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// FLOOR 1'S OWN PIECES IN LOOK B'S COLOURS (his yes already: art/floor1.ts): each colour sorted into its family by the nearest of
// floor 1's own colours (the dressed stone, the old iron, the timber, the Warden's wine, bone, gold) and put at the same place in
// that family in look B's own, as the look he picked had them (docs/mockups/floor1_look, `graded`); fire and the enemy's pink
// are their own light and stay as they are

type Fam = 'stone' | 'iron' | 'wood' | 'wine' | 'bone' | 'brass';
/** Fire and its coals: their own light, kept as they are. */
const FIRE_KEPT = new Set<string>([...EMBER, ...COAL, ...FLAME].map((c) => c.toLowerCase()));
const TH1 = CRYPT_FLOORS[0];
const KNOWN: [Fam, readonly string[]][] = [
  ['stone', [...TH1.slab, ...TH1.cap, ...TH1.capLow, ...TH1.lit, ...TH1.shade, TH1.mortar, ...stoneOf(TH1), '#1a162e', '#363052', '#544c7a', '#6e6696', '#2c2840', '#3e3a54', '#575270']],
  ['iron', [...OLD_IRON, ...OLD_RUST, '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc', '#9a96c8']],
  ['wood', [...TIMBER]],
  ['wine', [...WINE]],
  ['bone', ['#26203e', '#6a6294', '#a29ac6', '#c2bae2', '#1e1a34', '#3e3862', '#5a5484', '#3a3252', '#867ea4', '#b8b0d2', '#d4cce8']],
  ['brass', [...GOLD]],
];
/** Look B's family for each of floor 1's (its stone a step lighter than the walls', so a piece stands off them). */
const RAMPS: Record<Fam, R5> = {
  stone: down(['#1d1f19', '#353a2e', '#4c5040', '#626552', '#767a63'], 0.86),
  iron: IRON,
  wood: WOOD,
  wine: WINE_B,
  bone: BONE,
  brass: down(['#24260f', '#3e4019', '#5a5a26', '#747234', '#8c8846'], 0.9),
};
const lumOf = (c: string): number => {
  const [r, g, b] = hexOf(c);
  return 0.3 * r + 0.55 * g + 0.15 * b;
};
const RANGE = new Map<Fam, [number, number]>(KNOWN.map(([f, cs]) => [f, [Math.min(...cs.map(lumOf)), Math.max(...cs.map(lumOf))]]));
const gradeMemo = new Map<string, string>();
/** A colour of floor 1's own as look B has it. */
export function gradeColour(c: string): string {
  const lc = c.toLowerCase();
  if (SHINES.has(lc) || OWN.has(lc) || SHINES.has(c) || OWN.has(c) || FIRE_KEPT.has(lc)) return c;
  const hit = gradeMemo.get(lc);
  if (hit) return hit;
  const [r, g, b] = hexOf(lc);
  let best: Fam = 'stone';
  let bd = 1e9;
  for (const [f, cs] of KNOWN) for (const k of cs) {
    const [r2, g2, b2] = hexOf(k);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bd) {
      bd = d;
      best = f;
    }
  }
  const ramp = RAMPS[best];
  const [lo, hi] = RANGE.get(best)!;
  const t = Math.max(0, Math.min(4, ((lumOf(lc) - lo) / Math.max(1, hi - lo)) * 4.4 - 0.2));
  const i = Math.min(3, Math.floor(t));
  const out = mixC(ramp[i], ramp[i + 1], t - i);
  gradeMemo.set(lc, out);
  return out;
}
let gradedMemo = new WeakMap<Sprite, Sprite>();
/** The game's pictures graded in this look, let go (let go with its floor's look: render.ts forgetLooks; his “it’s crashing every couple of levels”). */
export function forgetGraded(): void {
  gradedMemo = new WeakMap();
}
/** A picture of floor 1's own in look B's colours (its shape, its anchor and its lights as they were). */
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
    if (!c) memo.set(key, (c = gradeColour(`#${key.toString(16).padStart(6, '0')}`)));
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
// THE LIGHTS, for the main chat to place (the renderer's own: a hole cut in the dark, render.ts `spot`, and a glow drawn over it,
// `drawGlow` / a sprite's `lights`). In game pixels, from where each thing is anchored.

export const TOMB_LIGHTS = {
  /** The floor's dark on floor 1 (the game's FAR_DARK is 0.88, the town's 0.45): the brightest floor, a cool dark a little lifted toward green. */
  dark: { a: 0.5, rgb: [6, 8, 10] as const },
  /** A SHAFT OF DAYLIGHT (its pictures are drawn added): a hole where it falls (at its pool's middle), by its size; a second, wider and fainter, half way up its column, so the air reads; a green-gold glow at its foot. */
  shaft: {
    small: { r: 52, strength: 0.88 },
    middle: { r: 62, strength: 0.92 },
    large: { r: 74, strength: 0.96 },
    column: { up: 50, r: 44, strength: 0.42 },
    glow: { r: 30, color: SUN.glow, a: 0.24 },
  },
  /** THE TOWN'S STAIRS: the daylight down the flight onto the first room's floor: a hole at the arch's foot (the middle of the doorway, a little into the room), and its glow. */
  stairs: { into: 0.6, up: 6, r: 84, strength: 0.95, glow: { r: 40, color: SUN.town, a: 0.26 } },
  /** A CRESSET (floor 1's own, its fire honest orange, its glow on its picture): a hole at it, as the renderer lights a brazier. */
  cresset: { up: 18, r: 66, strength: 0.9 },
  /** Every tile of wall that stands: a low hole at the foot of its face under its middle, so that the stone reads in the room's daylight. */
  wall: { up: 26, r: 34, strength: 0.36 },
} as const;

// =================================================================================================
// ALL OF IT

export interface TombHall {
  /** His hall's wall, in order along it: k = 0 to 7 (the tile's place along the wall mod 8), each four frames. */
  faceLeft: Sprite[][];
  faceRight: Sprite[][];
}
export interface TombArt {
  /** The floor of tile (tx, ty) (it repeats every four tiles). */
  floor(tx: number, ty: number): Sprite;
  /** Floor tiles laid over it. */
  tiles: Piece[];
  /** A tile of its wall: along x (turned to screen-left, lit) and along y (to screen-right, in shade); two to each of TOMB_BAYS ([2b] a bay's first tile, [2b + 1] its second), each four frames. Anchored as the game's walls are. */
  faceLeft: Sprite[][];
  faceRight: Sprite[][];
  /** The wall's face for wall tile (tx, ty), frame f, so that the pilasters fall every two tiles along it. */
  face(alongX: boolean, tx: number, ty: number, f?: number): Sprite;
  hall: TombHall;
  /** THE WAY BETWEEN TWO ROOMS, along x or y: strips from u -32 to 128 (t -1 to 4), stood as a gate's arch is. */
  archway(alongX: boolean): Strip[];
  /** THE TOWN'S STAIRS COMING DOWN: as art/town_ways.ts floorStairsUp (its size, anchor and shape), in the tomb's stone and the town's daylight. */
  stairsUp(alongX: boolean): Sprite;
  /** THE STAIRWELL DOWN, as art/crypt_ways.ts makeStairwell (its shape), in the tomb's stone; and its opening (art/stairwell_open.ts, its frames and timing). */
  stairwell(way: 'x' | 'y'): Sprite;
  stairwellOpens(way: 'x' | 'y', at?: readonly [number, number]): Moment;
  /** The place's own pieces and floor 1's own in look B's colours. */
  pieces: Piece[];
}

/** The place's own pieces' names (the rest of `pieces` are floor 1's own, in look B's colours). */
export const TOMB_OWN = [
  'a chained tomb, along x', 'a chained tomb, along y', 'a tomb of the court, along x', 'a tomb of the court, along y',
  'daylight on the floor, small', 'daylight on the floor, middle', 'daylight on the floor, large',
  'a shaft of daylight, small', 'a shaft of daylight, middle', 'a shaft of daylight, large', 'water dripping',
] as const;
/** The pieces that are light, drawn added to what is under them ('lighter'): the daylight's pools (with the floor) and its columns (stood). */
export const TOMB_ADDED = new Set<string>(TOMB_OWN.filter((n) => n.includes('daylight')));

/** The roots' tiles: their names and their edges. */
export const ROOT_TILES: readonly (readonly [string, Edge, Edge | null])[] = [
  ['a root along x', '-x', '+x'], ['a root along y', '-y', '+y'],
  ['a root bending, low x to low y', '-x', '-y'], ['a root bending, low x to high y', '-x', '+y'],
  ['a root bending, high x to low y', '+x', '-y'], ['a root bending, high x to high y', '+x', '+y'],
  ["a root's end, from low x", '-x', null], ["a root's end, from high x", '+x', null], ["a root's end, from low y", '-y', null], ["a root's end, from high y", '+y', null],
];
/** The grave slabs' tiles: two to a slab, its head's and its foot's, along x and along y. */
export const SLAB_TILES: readonly (readonly [string, boolean, boolean])[] = [
  ['a grave slab along x, its head', true, true], ['a grave slab along x, its foot', true, false],
  ['a grave slab along y, its head', false, true], ['a grave slab along y, its foot', false, false],
];

const four = [0, 1, 2, 3];
let made: TombArt | null = null;
/** Its pictures let go (its floor left: render.ts forgetLooks; his “it’s crashing every couple of levels”), made again if wanted. */
export function forgetMade(): void {
  made = null;
}
/** Its stairwell (each way down), alone: the same picture as its art's `stairwell`, without making the rest of its pictures. */
export function tombStairwell(way: 'x' | 'y'): Sprite {
  return makeStairwell(TOMB_THEME, way);
}
/** The place's pictures, made the first time they are asked for and kept (the archway, the stairs and the stairwell when first asked for). */
/**
 * THE TOMB'S PICTURES IN PARTS (main.ts LOAD_SLICE; the queue's make-floors-look-builders-in-parts): what it makes all at once as it
 * is made (its walls' faces, its tiles, its own pieces and floor 1's in its colours), each a part. As they are made each part is
 * taken from here where a step of the loading screen has made it ahead (tombSteps), or made then, as before: the same makers, the
 * same pictures. A part is taken once, and all of it is let go of with the tomb's pictures (forgetTomb).
 */
const TOMB_AHEAD = new Ahead();
/** How the builder gets a part: `key` its name, `make` how it is made. Building, it is taken or made; planning, it is listed as a step. */
type Part = <T>(key: string, make: () => T) => T;
const taken: Part = (key, make) => TOMB_AHEAD.take(key, make);
/** (planning: each part listed as a step, nothing made; what the builder builds with it is thrown away) */
const planned = (steps: LoadStep[]): Part => (key, make) => {
  steps.push(TOMB_AHEAD.step(key, make));
  return null as never;
};
/** (for the tests) How many parts are put by, not yet taken. */
export function tombPartsHeld(): number {
  return TOMB_AHEAD.size;
}
/** What the tomb makes at once as it is made, a part at a time: `part` gives each (planning, it lists them). */
function tombPartsOf(part: Part): { left: Sprite[][]; right: Sprite[][]; hallLeft: Sprite[][]; hallRight: Sprite[][]; tiles: Piece[]; pieces: Piece[] } {
  const tile = (name: string, frames: Sprite[]): Piece => ({ name, kind: 'floor tile' as PieceKind, frames });
  const faces = (key: string, alongX: boolean, bays: readonly TombBay[], seed0: number): Sprite[][] => bays.flatMap((bay, b) => [0, 1].map((half) => {
    const s = part(`${key}:${b}:${half}`, () => wallTile(alongX, 32 * half, (J, up, sgn) => tombAt(J, up, sgn, bay, seed0 + b * 17)));
    return four.map(() => s);
  }));
  const shaft = (n: keyof typeof SHAFTS): Piece[] => [
    { name: `daylight on the floor, ${n}`, kind: 'on the floor', frames: [part(`pool:${n}`, () => shaftPool(SHAFTS[n]))] },
    { name: `a shaft of daylight, ${n}`, kind: 'on the floor', frames: four.map((f) => part(`air:${n}:${f}`, () => shaftAir(SHAFTS[n], f))) },
  ];
  return {
    left: faces('left', true, TOMB_BAYS, 300),
    right: faces('right', false, TOMB_BAYS, 307),
    hallLeft: faces('hall left', true, HALL_BAYS, 471),
    hallRight: faces('hall right', false, HALL_BAYS, 472),
    tiles: [
      ...ROOT_TILES.map(([n, a, b], i) => tile(n, [part(`tile:${n}`, () => rootTile(a, b, i % 4))])),
      tile('a puddle', four.map((f) => part(`puddle:${f}`, () => puddleTile(f)))),
      tile('moss', [part('moss', () => mossTile())]),
      tile('fallen leaves and earth', [part('leaves and earth', () => leavesTile(true, 661))]),
      tile('fallen leaves', [part('leaves', () => leavesTile(false, 671))]),
      ...SLAB_TILES.map(([n, ax, head]) => tile(n, [part(`tile:${n}`, () => slabTile(ax, head))])),
    ],
    pieces: [
      { name: 'a chained tomb, along x', kind: 'obstacle', frames: [part('chained x', () => courtTomb(true, true))], shadow: 0.55 },
      { name: 'a chained tomb, along y', kind: 'obstacle', frames: [part('chained y', () => courtTomb(false, true))], shadow: 0.55 },
      { name: 'a tomb of the court, along x', kind: 'obstacle', frames: [part('court x', () => courtTomb(true, false))], shadow: 0.55 },
      { name: 'a tomb of the court, along y', kind: 'obstacle', frames: [part('court y', () => courtTomb(false, false))], shadow: 0.55 },
      ...shaft('small'),
      ...shaft('middle'),
      ...shaft('large'),
      { name: 'water dripping', kind: 'on the floor', frames: Array.from({ length: DRIP_FRAMES }, (_, f) => part(`drip:${f}`, () => drip(f))) },
      // (floor 1's own pieces in look B's colours, each a part: floor 1's list made a piece a step first, art/floor1.ts wardenPieceSteps)
      ...Array.from({ length: wardenPieceCount() }, (_, i) => part(`warden:${i}`, () => gradePiece(wardenPieces()[i]))),
    ],
  };
}
/**
 * THE TOMB'S PICTURES AS STEPS OF THE LOADING SCREEN'S (main.ts LOAD_SLICE, art/floors.ts lookPieceSteps): floor 1's own pieces a
 * piece a step, then each part the tomb makes at once, then the tomb itself (it takes them). None once it is made.
 */
export function tombSteps(): LoadStep[] {
  if (made) return [];
  const steps: LoadStep[] = [...wardenPieceSteps()];
  tombPartsOf(planned(steps));
  steps.push(() => void makeTombArt());
  return steps;
}
export function makeTombArt(): TombArt {
  if (made) return made;
  const floors = new Map<string, Sprite>();
  const own = tombPartsOf(taken);
  const left = own.left;
  const right = own.right;
  const archways = new Map<boolean, Strip[]>();
  made = {
    floor(tx, ty) {
      const a = mod(tx, 4);
      const b = mod(ty, 4);
      const key = `${a},${b}`;
      let s = floors.get(key);
      if (!s) floors.set(key, (s = tileOf((x, y) => tombFloorAt(x, y), a, b)));
      return s;
    },
    tiles: own.tiles,
    faceLeft: left,
    faceRight: right,
    face(alongX, tx, ty, f = 0) {
      const along = alongX ? tx : ty;
      const second = mod(along, BAY) === 1;
      const b = Math.floor(hash(Math.floor(along / 2), alongX ? ty : tx, alongX ? 77 : 79) * TOMB_BAYS.length);
      return (alongX ? left : right)[2 * b + (second ? 1 : 0)][mod(f, 4)];
    },
    hall: { faceLeft: own.hallLeft, faceRight: own.hallRight },
    archway(alongX) {
      let s = archways.get(alongX);
      if (!s) archways.set(alongX, (s = archwayStrips(alongX)));
      return s;
    },
    stairsUp: stairsUpOf,
    stairwell: (way) => makeStairwell(TOMB_THEME, way),
    stairwellOpens: (way, at = [0, 0]) => stairwellOpens(TOMB_THEME, way, at),
    pieces: own.pieces,
  };
  return made;
}
/** Let the place's pictures go (they are made again if they are wanted). */
export function forgetTomb(): void {
  made = null;
  TOMB_AHEAD.clear();
}
void BRASS;
