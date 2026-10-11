// THE CHAINED ONE'S FLOOR: the Crypt's third floor, themed after its boss (a mock-up; nothing of the
// game imports it).
//
// The owner, 10 Oct 2026: by 07:29, "I’d also like each floor to be themed after the boss.  Add this
// to the ruleset.  We need somewhere between 40-50 unique assets on each floor for each boss.  That
// can include wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the
// looks of doors and gates, traps, and quests." (His art rulebook, Places 7.) By 07:41, offered the
// four floors' themes, floor 3 the Chained One's: the prison. His outline of 9 Oct: "The next floor
// is the prisoner". By 14:13, to floor 2's pieces and moments: "Yes, on to floors 3 and 4
// (Recommended)", offered as: floor 2 goes to the main chat to build in, and the art chat starts the
// Chained One's and the amalgamation's floors side by side.
//
// THE THEME, from the Chained One as he is painted (art/bosses3.ts, on mockup/bosses): "A starved
// giant, muzzled (Recommended)": grey skin over bone, rags, AN IRON CAGE BOLTED OVER HIS FACE with the
// pink burning behind it; a chain from each wrist (the right one ending in a hook), and from the ring
// at the back of his collar a chain to AN IRON BALL dragged behind; he grows wilder as his chains
// break; his sound "Chains and a muffled roar (Recommended)". So floor 3 is THE PRISON THAT HELD HIM:
// chains everywhere, great rings bolted to the walls, cuffs and collars, iron balls, the cage of bars,
// grooves gouged in the flags by a dragged ball, stone torn by his fingers, bars bent and burst; empty
// bowls and an empty trough (he was starved); straw and rags; the jailers' winches, their goads, their
// fire and their kettle. It stands on the Crypt's third floor as he said yes to it (art/crypt.ts,
// CRYPT_FLOORS[2]: about a third of the floor earth, the walls' stones fallen to rough rock in places).
// The main chat lays a cell block on every Crypt floor (a long hall, a row of cells along its back
// wall, each with the game's barred door): these pieces dress it as his prison.
//
// THE RULES IT KEEPS (his art rulebook): crisp pixels, two to a game pixel, light from the upper
// left, three tones a material, the indigo seam between parts; turned to the grid; a step quieter
// than the figures; no glow but an honest fire's orange (no cyan; pink only his eyes over his own gate:
// Colour 3); old, broken and grim but never gory (Places 6: no blood; old stains a dull dark grey); no
// carved words (Words in the world 3). HIS MARKS are never letters: his iron face-cage, and the ball
// and its chain.
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; a tile 64 x 32 on
// the screen; along +x 32 right and 16 down, along +y 32 left and 16 down; heights up.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CRYPT_FLOORS, DIRT, OLD_IRON, OLD_RUST, ROCK, TIMBER } from './crypt';
import type { Theme } from './ground';
import { makeGateArt } from './gates';
import type { GateArt, Mark } from './gates';
import { Iso } from './isokit';
import { GRAIN, INK, ball, compose, hash, limb, lit, mix } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, GOLD, column, hoop, stoneOf, tongue, trunk } from './props';
import type { TrunkLook } from './props';
import { FLAME } from './mkit';
import {
  BEYOND, DEEP, LCX, LCY, PCX, PFOOT, block, box, darkened, dustCloud, fastBlit, fillWith, flame, flat, fx, fy, litSide, lying, mid, onFacePx, painted, recolor, relief, shadeSide, shaded, spotsFrom, sunk, tilesOf,
} from './floorkit';
import type { Moment, Piece, PieceKind, Track } from './floorkit';
import { Deep, FLOOR_DUST, KT, LIGHT_W, TOWARD, dot3, grainStream, onPic, paintGrains, paintPuffs, puffRing } from './floor2';
import type { Grain, Puff } from './floor2';

// =================================================================================================
// The colours

const THEME: Theme = CRYPT_FLOORS[2];
/** The dressed stone of the floor's blocks (the walls' own, from their shade to a lit edge). */
const STONE: Ramp = stoneOf(THEME);
/** The stone of a wall's face turned to the light: its joint, its low tone, its usual, its high, and a lit edge. */
const FACE: Ramp = [THEME.lit[0], THEME.lit[1], THEME.lit[2], THEME.lit[4], THEME.lit[4]];
const SLAB = THEME.slab;
/** Iron that stands (the cage, the post's ring, his ball): old, dull. */
const IRONS: Ramp = OLD_IRON;
/** Small iron things (chains, cuffs, hooks): a little brighter, so they read against stone at a phone's size. */
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
/** His balls' iron: the kit's iron (art/mkit.ts, IRON) a little lit, so a ball's round reads on stone. */
const BALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#3e3a70', '#6c68a8', '#8a86c0'];
/** Iron that must read in a wall or a floor (a chain, a ring, a trap's teeth), and still no brighter than the darkest word (his Colour 4). */
const WALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#3e3a72', '#5a56a0', '#5a56a0'];
/** Iron set in the walls and the floor, a step quieter than what stands (his Colour 4: the places darker than any word). */
const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
const GLINT = '#9a96c8';
/** Straw gone grey with age and damp: a warm grey, never a straw yellow (his Colour 5). */
const STRAW: Ramp = ['#1c1a1a', '#2a2626', '#433d3a', '#56504a', '#625a54'];
/** Turned wood gone dark with use: a bowl's, a spoon's (a plain brown, never a skin's pink: the first fresh look found mauve bowls reading as meat). */
const BOWL_WOOD: Ramp = ['#1a1214', '#1a1214', '#3a2a24', '#563f30', '#6a503c'];
/** Rags: his own (art/bosses3.ts, RAGS), grey-black cloth. */
const RAGS: Ramp = ['#141019', '#141019', '#2a2232', '#43384e', '#4e4458'];
/** A blanket of rags, grey. */
const BLANKET: Ramp = ['#1c1820', '#1c1820', '#3a3440', '#544a58', '#62586a'];
/** Fired clay, plum-grey with age. */
const CLAY: Ramp = ['#1e1626', '#1e1626', '#3a2e44', '#56485e', '#665870'];
/** Sacking. */
const SACK: Ramp = ['#1a1620', '#1a1620', '#342c38', '#4c4250', '#5a505e'];
/** Old stains, dried: dull and dark, never red (Places 6; floor 2's second look found a dull wine reading as blood). */
const STAIN = ['#110f17', '#19161f', '#221e29'] as const;
/** Bone in the wall's dark, a step under bone in the light. */
const DARK_BONE: Ramp = ['#1e1a34', '#1e1a34', '#3e3862', '#5a5484', '#6a6494'];
/** Bone, in the light. */
const OLD_BONE: Ramp = ['#26203e', '#26203e', '#6a6294', '#a29ac6', '#c2bae2'];
/** His skin, grey over bone (art/bosses3.ts, STARVED), in the dark behind his cell's bars. */
const STARVED: Ramp = ['#352c3e', '#352c3e', '#6a5e76', '#a698b0', '#a698b0'];
/** Flakes of rust in the air: grey-brown, never the crypt's mauve (floor 2's second look found that reading as spatter). */
const FLAKE = ['#4a4250', '#2c2632'] as const;

const { tileOf, onTile, around } = tilesOf(THEME);

type V3 = [number, number, number];
type V2 = readonly [number, number];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const len3 = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm3 = (a: V3): V3 => {
  const n = len3(a) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const D2R = Math.PI / 180;

// =================================================================================================
// IRON: chains, rings, balls

/**
 * ONE LINK of a heavy chain at (cx, cy) on the picture, along (dx, dy): `open`, seen through (a ring
 * round its hole, the hole left for the seam's dark), or seen edge on (a short bar). Lit on its upper
 * left. `size` 1 is a giant's chain: a link six pixels long.
 */
function link(p: Px, cx: number, cy: number, dx: number, dy: number, open: boolean, ramp: Ramp, size = 1): void {
  const A = (open ? 3.1 : 2.9) * size;
  const B = (open ? 2.3 : 1.05) * size;
  const ex = -dy;
  const ey = dx;
  const R = Math.ceil(Math.max(A, B)) + 1;
  for (let y = Math.floor(cy - R); y <= cy + R; y++) {
    for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      const rx = x + 0.5 - cx;
      const ry = y + 0.5 - cy;
      const a = (rx * dx + ry * dy) / A;
      const b = (rx * ex + ry * ey) / B;
      if (a * a + b * b > 1) continue;
      if (open) {
        const ha = (rx * dx + ry * dy) / Math.max(0.6, A - 1.45 * size);
        const hb = (rx * ex + ry * ey) / Math.max(0.5, B - 1.35 * size);
        if (ha * ha + hb * hb < 1) continue;
      }
      const toLight = -(rx * 0.72 + ry * 0.7) / Math.max(A, B);
      p.set(x, y, toLight > 0.28 ? ramp[3] : toLight < -0.38 ? ramp[0] : ramp[2]);
    }
  }
}

/**
 * A HEAVY CHAIN along a line of points on the picture: a link every `pitch`, by turns one seen open
 * and one edge on, from the first point (the first link, `first`, open if even). The open ones first,
 * the edge-on ones over them, as each passes through the next's hole. Returns how many links.
 */
function chainAlong(p: Px, pts: ReadonlyArray<V2>, ramp: Ramp = SMALL_IRON, size = 1, first = 0, upTo = Infinity): number {
  const pitch = 4.4 * size;
  const at: [number, number, number, number, boolean][] = [];
  let carry = 0;
  let k = first;
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (L < 1e-6) continue;
    const dx = (x1 - x0) / L;
    const dy = (y1 - y0) / L;
    let s = carry;
    while (s <= L && run + s <= upTo) {
      at.push([x0 + dx * s, y0 + dy * s, dx, dy, k % 2 === 0]);
      k++;
      s += pitch;
    }
    carry = s - L;
    run += L;
  }
  for (const [x, y, dx, dy, open] of at) if (open) link(p, x, y, dx, dy, true, ramp, size);
  for (const [x, y, dx, dy, open] of at) if (!open) link(p, x, y, dx, dy, false, ramp, size);
  return at.length;
}

/** A great iron ring round (cx, cy), `r` its radius and `th` its thickness, squashed `sq` up and down (seen at a slant), lit on its upper left outside and its lower right inside. `gap`: the angle (radians, from the right, down positive) of an opening in it, and how wide. */
function ironRing(p: Px, cx: number, cy: number, r: number, th: number, ramp: Ramp, sq = 1, gap?: readonly [number, number]): void {
  for (let y = Math.floor(cy - r * sq - 1); y <= cy + r * sq + 1; y++) {
    for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const rx = x + 0.5 - cx;
      const ry = (y + 0.5 - cy) / sq;
      const d = Math.hypot(rx, ry);
      if (d > r || d < r - th) continue;
      const ang = Math.atan2(ry, rx);
      if (gap) {
        let da = ang - gap[0];
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < gap[1]) continue;
      }
      const outer = d > r - th / 2;
      const t = -(Math.cos(ang) * 0.72 + Math.sin(ang) * 0.7) * (outer ? 1 : -1);
      p.set(x, y, t > 0.3 ? ramp[3] : t < -0.4 ? ramp[0] : ramp[2]);
    }
  }
}

/** A rivet: a lit point and its shadow. */
function rivet(p: Px, x: number, y: number, ramp: Ramp): void {
  p.set(x, y, ramp[3]).set(x + 1, y, ramp[2]).set(x, y + 1, ramp[2]).set(x + 1, y + 1, ramp[0]);
}

/**
 * AN IRON BALL round (cx, cy), `r` across: dark iron lit on its upper left, one highlight, its
 * foundry's pits faint on it (`pitted`: never darker than its shade, so that none reads as an eye's
 * dark middle: the first fresh look found one). `turn` turns a point of its skin (as seen) to where
 * it was on the ball before it rolled, so that the pits roll round with it. Painted into `deep` at `near` (how near its middle is), each pixel as near as
 * its skin there, or plainly on `p`.
 */
function ironBall(p: Px, cx: number, cy: number, r: number, ramp: Ramp, seed = 0, turn?: (n: V3) => V3, deep?: Deep, near = 0, pitted = true): void {
  for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) {
    for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const nx = (x + 0.5 - cx) / r;
      const ny = (y + 0.5 - cy) / r;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      const i = nx * -0.52 + ny * -0.62 + nz * 0.59;
      let k = i > 0.82 ? 4 : i > 0.5 ? 3 : i > 0.1 ? 2 : i > -0.3 ? 1 : 0;
      // the pits: in the ball's own skin, rolling with it
      const q = turn ? turn([nx, ny, nz]) : ([nx, ny, nz] as V3);
      const lon = Math.atan2(q[1], q[0]);
      const lat = Math.asin(Math.max(-1, Math.min(1, q[2])));
      const cell = hash(Math.floor((lon + Math.PI) * 2.2), Math.floor((lat + 2) * 2.6), 300 + seed);
      if (pitted && cell < 0.16 && k > 1 && k < 4) k -= 1;
      else if (pitted && cell > 0.93 && k >= 2 && k < 4) k = 3;
      // (its rim against what is behind it: never a lit pixel at its edge)
      if (d2 > 0.8 && k >= 3 && i < 0.62) k = 2;
      const c = ramp[k];
      if (deep) deep.put(x, y, near + nz * r * 0.9, c);
      else p.set(x, y, c);
    }
  }
}

// =================================================================================================
// HIS MARK: THE MUZZLE-CAGE. One shape, wherever it is: carved in the wall, laid in the floor, over
// his gate, on a skull on a hook, and torn off him for the quest. He is "A starved giant, muzzled
// (Recommended)": an iron cage over his jaw, the shape of a jaw, from under his eyes to under his chin:
// three bands across it (the top one under his cheekbones, one at his mouth, one round his chin), the
// rims down its sides, short uprights between the bands, each row set between the last's (so that
// none crosses a band: never a cross), rivets where they meet, a strap from each top corner back
// behind his head. (The first fresh look found his mark drawn four ways, and as a cross over a
// tombstone, a helm, "TT" and a monogram: this is the one.)

/** What a point of his mark is. */
type MarkPart = 'iron' | 'rivet' | 'strap' | 'buckle' | 'eye' | 'brow' | 'nose' | 'face' | 'gap' | null;
/** Where the cage's bands are, up his face (t, -1 at his chin to 1 at his crown): its top up over his cheeks, just under his eyes. */
const MUZZLE_TOP = 0.06;
const MUZZLE_MID = -0.42;
/**
 * HIS MUZZLED FACE, flat, as a mark: a long head, round at the crown, broad at the cheekbones, its
 * jaw narrowing; deep-set eyes under a heavy brow; and the cage over his jaw, up over his cheeks,
 * narrower than his head, held on by leather straps round his head: one each side across the cheek
 * from the cage's top to past his head's edge, buckled, and one each side up over the temple from the
 * cage's top corner. (s, t) across and up, each -1 to 1; `px` how big a picture pixel is in that
 * measure (so that no band is thinner than a pixel, and the rivets are left off when it is small).
 * `skull`: a skull's round sockets and the hole of its nose, for a skull in one. `straps`: its straps.
 * (The second fresh look found it a grinning skull with square teeth: a pale dome, slit eyes, an
 * upright grille. Its users now paint the face grey, the iron dark over the skin, and the straps
 * that say "muzzle".)
 */
function muzzled(s: number, t: number, px = 0.08, skull = false, straps = true): MarkPart {
  const half = (tt: number): number => (tt > 0.12 ? 0.68 * Math.sqrt(Math.max(0, 1 - ((tt - 0.12) / 0.88) ** 2)) : tt > -0.3 ? 0.68 : 0.68 - 0.3 * ((-0.3 - tt) / 0.62) ** 1.5);
  const w = Math.max(0.055, px * 0.6);
  const bottom = (ss: number): number => -1 + 0.4 * (ss / 0.62) ** 2;
  const cageHalf = (tt: number): number => half(Math.max(-0.92, Math.min(MUZZLE_TOP, tt))) - 0.16;
  const CH = cageHalf(MUZZLE_TOP);
  const small = px >= 0.07;
  const as = Math.abs(s);
  if (straps) {
    // round the head: across the cheek from the cage's side, a little under its top, to past the head's edge; a buckle on the cheek
    const ts = MUZZLE_TOP - 0.06;
    const sw = Math.max(w * 1.3, px * 0.9);
    if (as >= CH && as <= half(t) + 0.1 && Math.abs(t - ts) < sw) {
      const bk = CH + 0.1;
      if (Math.abs(as - bk) < Math.max(0.045, px * 0.8)) return 'buckle';
      return 'strap';
    }
    // up over the temple from the cage's top corner, past the head's edge
    for (const sd of [-1, 1]) {
      const a: V2 = [sd * (CH - 0.02), MUZZLE_TOP];
      const b: V2 = [sd * 0.6, 0.46];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const k = Math.max(0, Math.min(1, ((s - a[0]) * dx + (t - a[1]) * dy) / (dx * dx + dy * dy)));
      if (k > 0.04 && Math.hypot(s - a[0] - dx * k, t - a[1] - dy * k) < sw * 0.9) return 'strap';
    }
  }
  if (t <= MUZZLE_TOP + w && t >= bottom(s) - w * 1.4 && as <= cageHalf(t) + w) {
    const ch = cageHalf(t);
    const rim = Math.abs(as - ch) < w || Math.abs(t - bottom(s)) < w * 1.4;
    const band = Math.abs(t - MUZZLE_TOP) < w || Math.abs(t - MUZZLE_MID) < w;
    // (the uprights drawing in toward the chin as the jaw does: a cage round a jaw, not a grille of teeth)
    const ups = (t > MUZZLE_MID ? [-0.27, 0, 0.27] : [-0.15, 0.15]).map((u) => (u * ch) / CH);
    const up = ups.some((u) => Math.abs(s - u) < w * 0.9) && t < MUZZLE_TOP && t > bottom(s);
    if (rim || band || up) {
      const atBand = Math.abs(t - MUZZLE_TOP) < w * 1.6 || Math.abs(t - MUZZLE_MID) < w * 1.6;
      const atUp = ups.some((u) => Math.abs(s - u) < w * 1.2) || Math.abs(as - ch) < w * 1.4;
      return atBand && atUp && !small ? 'rivet' : 'iron';
    }
    return as <= half(t) && t >= -0.94 ? 'gap' : null;
  }
  if (t < -1 || t > 1 || as > half(t)) return null;
  if (skull) {
    for (const e of [-0.3, 0.3]) if (((s - e) / 0.19) ** 2 + ((t - 0.2) / 0.17) ** 2 <= 1) return 'eye';
    if (t > 0.01 && t < 0.11 && as < 0.02 + (0.11 - t) * 0.7) return 'nose';
    return 'face';
  }
  // deep-set eyes, each under its own heavy brow (two brows, never one bar across: the first look found a slit across read as a helm's)
  for (const e of [-0.3, 0.3]) {
    if (((s - e) / 0.16) ** 2 + ((t - 0.21) / Math.max(0.065, px * 0.75)) ** 2 <= 1) return 'eye';
    const bt = 0.29 + 0.1 * ((s - e) / 0.2) * Math.sign(e);
    if (Math.abs(s - e) < 0.2 && t > bt && t < bt + Math.max(0.07, px)) return 'brow';
  }
  return 'face';
}

/**
 * HIS MUZZLE-CAGE, in depth: the same cage as rods of iron round the jaw it was made for, about the
 * middle of its top band: forward, left, up; `R` the jaw's reach forward. `burst`: torn off him, a
 * band broken through at one side and an upright snapped short, its straps torn.
 */
function muzzleRods(R: number, burst = false): Rod[] {
  const F = R;
  const A = R * 0.86;
  const at = (deg: number, up: number, k: number): V3 => [Math.cos(deg * D2R) * F * k, Math.sin(deg * D2R) * A * k, up];
  const rods: Rod[] = [];
  // (thin rods with wide gaps between: the second fresh look found thick ones reading as a solid plate with holes, a catcher's mask)
  const band = 0.05 * R;
  const thin = 0.038 * R;
  const LEVELS: ReadonlyArray<readonly [number, number]> = [[0, 1], [-0.5 * R, 0.9], [-0.98 * R, 0.56]];
  const SIDE = 104;
  // the three bands, round the front of the jaw from one side to the other (a gap in the middle one, burst)
  LEVELS.forEach(([up, k], j) => {
    for (let d = -SIDE; d < SIDE - 0.01; d += 8) {
      if (burst && j === 1 && d > 40 && d < 64) continue;
      rods.push({ a: at(d, up, k), b: at(Math.min(SIDE, d + 8), up, k), r: j === 2 ? band * 0.9 : band });
    }
  });
  // the rims down its sides, from band to band
  for (const sd of [-1, 1]) for (let j = 0; j < 2; j++) rods.push({ a: at(sd * SIDE, LEVELS[j][0], LEVELS[j][1]), b: at(sd * SIDE * 0.96, LEVELS[j + 1][0], LEVELS[j + 1][1]), r: thin });
  // the uprights: three between the top band and the middle, two between the middle and the chin's, set between them
  for (const d of [-36, 0, 36]) rods.push({ a: at(d, LEVELS[0][0], LEVELS[0][1]), b: at(d, LEVELS[1][0], LEVELS[1][1]), r: thin });
  for (const d of [-19, 19]) {
    const b = at(d, LEVELS[2][0], LEVELS[2][1]);
    rods.push({ a: at(d, LEVELS[1][0], LEVELS[1][1]), b: burst && d > 0 ? lerp3(at(d, LEVELS[1][0], LEVELS[1][1]), b, 0.4) : b, r: thin });
  }
  // the cup under the chin: two rods from the chin's band down and in to a boss under it
  const boss: V3 = [F * 0.2, 0, -1.14 * R];
  for (const d of [-64, 64]) rods.push({ a: at(d, LEVELS[2][0], LEVELS[2][1]), b: boss, r: thin });
  return rods;
}
/** Its leather straps, back from its top corners round where his head was (torn, `burst`: one long and trailing, one short), and up from them over his temples. */
function muzzleStraps(R: number, burst = false): Rod[] {
  const F = R;
  const A = R * 0.86;
  const at = (deg: number, up: number, k: number): V3 => [Math.cos(deg * D2R) * F * k, Math.sin(deg * D2R) * A * k, up];
  const rods: Rod[] = [];
  for (const sd of [-1, 1]) {
    const a = at(sd * 104, -0.12 * R, 1);
    const long = !burst || sd < 0;
    const pts: V3[] = [a, add3(a, [-R * 0.35, sd * R * 0.12, -R * 0.05]), add3(a, [-R * 0.7, sd * R * 0.1, long ? -R * 0.55 : -R * 0.15]), add3(a, [-R * (long ? 0.9 : 0.75), sd * R * 0.05, long ? -R * 1.0 : -R * 0.25])];
    for (let i = 1; i < (long ? pts.length : 3); i++) rods.push({ a: pts[i - 1], b: pts[i], r: 0.07 * R });
    // up over the temple, from the cage's top corner: torn short
    const c = at(sd * 70, 0, 1);
    rods.push({ a: c, b: add3(c, [-R * 0.2, sd * R * 0.05, R * 0.45]), r: 0.06 * R });
  }
  return rods;
}
/** Where the rivets of muzzleRods(R) are: where the uprights meet the bands, and at the bands' ends. */
function muzzleRivets(R: number): V3[] {
  const F = R;
  const A = R * 0.86;
  const at = (deg: number, up: number, k: number): V3 => [Math.cos(deg * D2R) * F * k, Math.sin(deg * D2R) * A * k, up];
  return [at(-36, 0, 1), at(0, 0, 1), at(36, 0, 1), at(-19, -0.5 * R, 0.9), at(19, -0.5 * R, 0.9), at(-104, 0, 1), at(104, 0, 1), [F * 0.2, 0, -1.14 * R]];
}

interface Rod { a: V3; b: V3; r: number }
/** Where a point of something is seen: on the picture, and how near the eye. */
type View = (q: V3) => [number, number, number];
/** The light, as seen: from the upper left of the picture, and toward the eye (x right, y down, near). */
const LIGHT_V: V3 = norm3([-0.5, -0.62, 0.6]);

/** Rods of iron painted into `deep` as `view` sees them, `normal(q)` the way out of the thing at a point of it as seen (x right, y down, near), so each is lit as it faces. */
function paintRods(deep: Deep, rods: readonly Rod[], view: View, normal: (q: V3) => V3, ramp: Ramp, dim = 0): void {
  for (const rod of rods) {
    const [ax, ay] = view(rod.a);
    const [bx, by] = view(rod.b);
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 2));
    for (let i = 0; i <= n; i++) {
      const q = lerp3(rod.a, rod.b, i / n);
      const [x, y, d] = view(q);
      const lam = dot3(normal(q), LIGHT_V);
      const R = Math.max(0.7, rod.r);
      for (let yy = Math.floor(y - R - 0.5); yy <= y + R + 0.5; yy++) {
        for (let xx = Math.floor(x - R - 0.5); xx <= x + R + 0.5; xx++) {
          const ox = xx + 0.5 - x;
          const oy = yy + 0.5 - y;
          if (ox * ox + oy * oy > (R + 0.3) * (R + 0.3)) continue;
          const hl = -(ox * 0.62 + oy * 0.72) / (R + 0.6);
          const s = lam * 0.75 + hl * 0.45 - dim;
          deep.put(xx, yy, d + (R - Math.hypot(ox, oy)) * 0.3, ramp[s > 0.45 ? 3 : s > -0.05 ? 2 : s > -0.45 ? 1 : 0]);
        }
      }
    }
  }
}

/** A view of a thing upright before the eye: (cx, cy) its middle on the picture, turned `yaw` degrees to its own left (toward the picture's right) and tipped `pitch` degrees forward. Its own forward, left and up. */
function frontView(cx: number, cy: number, yaw: number, pitch = 0): { view: View; turn: (q: V3) => V3 } {
  const cy_ = Math.cos(yaw * D2R);
  const sy = Math.sin(yaw * D2R);
  const cp = Math.cos(pitch * D2R);
  const sp = Math.sin(pitch * D2R);
  // its forward, left and up, as seen (x right, y down, near)
  const F: V3 = [sy * cp, sp, cy_ * cp];
  const L: V3 = [cy_, 0, -sy];
  const U: V3 = [-sy * sp, -cp, -cy_ * sp];
  const turn = (q: V3): V3 => [q[0] * F[0] + q[1] * L[0] + q[2] * U[0], q[0] * F[1] + q[1] * L[1] + q[2] * U[1], q[0] * F[2] + q[1] * L[2] + q[2] * U[2]];
  return {
    turn,
    view: (q) => {
      const t = turn(q);
      return [cx + t[0], cy + t[1], t[2]];
    },
  };
}

// =================================================================================================
// HIS OTHER MARK: the ball and its chain (never letters)

/**
 * THE BALL AND ITS CHAIN, flat, as a mark: the great ball low and to one side, its chain of three big
 * links climbing away from it in a curve, the last link burst open. (s, t) across and up, each -1 to
 * 1. 'ball', 'hole' (in a link), 'link', or null.
 */
function ballAndChainAt(s: number, t: number): 'ball' | 'hole' | 'link' | null {
  if (Math.hypot(s - 0.3, t + 0.36) <= 0.46) return 'ball';
  // the links: each an oval ring round a hole, up and to the left from the ball, each turned a quarter to the last (open, edge on, open, the last burst)
  const L: ReadonlyArray<readonly [number, number, number, boolean]> = [
    [-0.12, 0.1, 0.9, false],
    [-0.36, 0.42, 1.2, true],
    [-0.5, 0.8, 1.45, false],
  ];
  for (const [cx, cy, ang, open] of L) {
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const a = ((s - cx) * ca + (t - cy) * sa) / 0.27;
    const b = (-(s - cx) * sa + (t - cy) * ca) / (open ? 0.19 : 0.1);
    if (a * a + b * b > 1) continue;
    if (open) {
      const ha = ((s - cx) * ca + (t - cy) * sa) / 0.14;
      const hb = (-(s - cx) * sa + (t - cy) * ca) / 0.08;
      if (ha * ha + hb * hb < 1) return 'hole';
    }
    return 'link';
  }
  return null;
}

// =================================================================================================
// WALL TILES: cut into a wall's face

/** Rough rock where the wall's stones have fallen out: lumps of it, each its own shape and size, lit along its upper left and dark where it meets the next, as the crypt's rock is (art/crypt.ts, ROCK). (u, v) on the face. */
function rockAt(u: number, v: number): string {
  const CW = 5;
  const CH = 4;
  const ci = Math.floor((u + 64) / CW);
  const cj = Math.floor(v / CH);
  let best = 99;
  let next = 99;
  let bx = 0;
  let by = 0;
  let bk = 0;
  for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
    const x = i * CW - 64 + hash(i, j, 337) * CW;
    const y = j * CH + hash(i, j, 338) * CH;
    const d = Math.hypot((u + 0.5 - x) * 0.8, v + 0.5 - y);
    if (d < best) {
      next = best;
      best = d;
      bx = x;
      by = y;
      bk = hash(i, j, 339) * 10;
    } else if (d < next) next = d;
  }
  if (next - best < 0.7) return ROCK[0];
  const toLight = -(u + 0.5 - bx) + (v + 0.5 - by);
  return toLight > 1.6 ? ROCK[3] : toLight < -1.8 ? ROCK[0] : bk < 4 ? ROCK[1] : ROCK[2];
}


/** Paint a flat picture's layer onto `p` with the indigo seam round what is on it. */
function seamed(p: Px, layer: Px): void {
  p.blit(compose(null, [layer], null), 0, 0);
}

/**
 * THE BENT BARS: a barred opening in the wall, dark behind, where he came through: one bar still
 * straight, one bowed far over in one smooth curve, as something huge shoved past it; the third
 * snapped off on a slant low over the sill, its socket in the lintel torn empty.
 * Nothing across them. (The first fresh look found bars bent every way reading as letters: no stroke crosses
 * another now.)
 */
function bentBars(p: Px): void {
  const U0 = -10;
  const U1 = 9;
  const V0 = 16;
  const V1 = 44;
  const hole = (u: number, v: number): boolean => u >= U0 && u <= U1 && v >= V0 && v <= V1;
  // its frame: a heavy lintel and sill, the jambs, proud of the face
  relief(p, FACE, (u, v) => u >= U0 - 3 && u <= U1 + 3 && v >= V0 - 4 && v <= V1 + 4 && !hole(u, v), U0 - 4, U1 + 4, V0 - 5, V1 + 5);
  for (let v = V0; v <= V1; v++) for (let u = U0; u <= U1; u++) p.set(fx(u), fy(v), v === V0 ? FACE[1] : DEEP);
  // the sockets in the lintel and the sill, the last torn wide and chipped
  for (const u of [-8, -3, 2]) p.set(fx(u), fy(V1 + 1), DEEP).set(fx(u + 1), fy(V1 + 1), DEEP);
  for (const [u, v] of [[6, 45], [7, 45], [6, 46], [7, 46], [8, 46], [6, 15], [7, 15], [7, 14]] as const) p.set(fx(u), fy(v), DEEP);
  for (const [u, v] of [[5, 47], [9, 47], [8, 13], [5, 14]] as const) p.set(fx(u), fy(v), FACE[4]);
  const b = flat();
  /** A bar from the sill to the lintel, bowed `bow` pixels to the left at its middle: one smooth curve. */
  const bar = (u0: number, bow: number): void => {
    for (let v = V0; v <= V1; v++) {
      const t = (v - V0) / (V1 - V0);
      // (bent most below the middle, where a shoulder shoved: not an even arc)
      const U = Math.round(u0 - bow * Math.sin(Math.PI * t ** 0.75));
      b.set(fx(U), fy(v), DIM_IRON[3]).set(fx(U + 1), fy(v), DIM_IRON[2]).set(fx(U + 2), fy(v), DIM_IRON[0]);
    }
  };
  // (the second fresh look found the three all bowed the same way, like ")))": now one stands straight,
  // one is bowed hard, and the third is snapped)
  bar(-8, 0);
  bar(1, 5);
  // the third, snapped: a stub up from the sill, straight, broken off on a slant; its top half gone, its socket in the lintel torn empty
  for (let v = V0; v <= V0 + 9; v++) {
    if (v <= V0 + 9) b.set(fx(6), fy(v), DIM_IRON[3]);
    if (v <= V0 + 8) b.set(fx(7), fy(v), DIM_IRON[2]);
    if (v <= V0 + 7) b.set(fx(8), fy(v), DIM_IRON[0]);
  }
  seamed(p, b);
}

/**
 * CLAW-TORN STONE: where he tore at the wall with his fingers. Two rakes of four grooves each, gouged
 * deep and raking down across the stone, every groove of a rake beside the others and apart from
 * them, deep where the nails bit in and trailing out shallow; their sides in shade toward the light
 * and fresh and pale on the far side. (Four and slanting, never three upright: nothing like a brand's
 * mark; never touching at their heads: the first look found them reading as a letter.)
 */
function clawTorn(p: Px): void {
  const rakes: ReadonlyArray<readonly [number, number, number, number]> = [
    // where the first nail bit in (u, v), the way it rakes (radians from straight down, toward +u), how long
    [-12, 50, 0.42, 28],
    [-8, 30, 0.62, 18],
  ];
  for (const [u0, v0, ang, len] of rakes) {
    for (let k = 0; k < 4; k++) {
      // (side by side across the way it rakes, four pixels apart; each a little lower than the last, as a hand's are)
      const across = k * 4.4;
      const hu = u0 + Math.cos(ang) * across;
      const hv = v0 + Math.sin(ang) * across * 0.2 - [0, 1.5, 1, 3][k];
      const L = len * [0.8, 1, 0.95, 0.72][k];
      for (let s = 0; s <= L; s += 0.35) {
        const t = s / L;
        const aa = ang + 0.006 * s;
        const u = hu + Math.sin(aa) * s;
        const v = hv - Math.cos(aa) * s;
        const w = 2.8 * Math.sin(Math.PI * Math.min(1, 0.15 + t)) + 0.6;
        for (let c = -w / 2; c <= w / 2; c += 0.5) {
          const U = Math.round(u + Math.cos(aa) * c);
          const V = Math.round(v + Math.sin(aa) * c);
          const side = c / (w / 2);
          p.set(fx(U), fy(V), side < -0.3 ? FACE[0] : side > 0.45 ? (t < 0.8 ? FACE[4] : FACE[3]) : t < 0.75 ? DEEP : FACE[0]);
        }
      }
    }
  }
}

/**
 * A WOODEN BOWL SEEN FROM THE SIDE on a wall's flat picture, standing on (u0, v0): its round belly on a
 * small foot, lit on its left; its rim at the top, the dark inside seen between the far rim and the
 * near one. `R` its half-width.
 */
function bowlSide(b: Px, u0: number, v0: number, R: number): void {
  const H = Math.max(3, Math.round(R * 0.62));
  for (let dv = 0; dv <= H; dv++) {
    const half = dv === 0 ? R * 0.45 : R * Math.sqrt(Math.max(0, 1 - ((H - dv) / (H + 0.4)) ** 2));
    for (let u = Math.round(u0 - half); u <= Math.round(u0 + half); u++) b.set(fx(u), fy(v0 + dv), dv === 0 ? BOWL_WOOD[1] : u < u0 - R * 0.35 ? BOWL_WOOD[3] : u > u0 + R * 0.45 ? BOWL_WOOD[1] : BOWL_WOOD[2]);
  }
  // its mouth seen from a little above: an oval rim, lit along its near edge, round the dark inside
  // (the second fresh look found the old flat rim reading as loaves)
  const ry = Math.max(2, R * 0.42);
  const cv = v0 + H + 1;
  for (let dv = -Math.ceil(ry); dv <= Math.ceil(ry); dv++) {
    for (let u = Math.round(u0 - R); u <= Math.round(u0 + R); u++) {
      const ox = (u - u0) / R;
      const oy = dv / ry;
      if (ox * ox + oy * oy > 1.05) continue;
      const ix = (u - u0) / (R - 1.3);
      const iy = (dv - 0.3) / (ry - 0.9);
      const inside = ix * ix + iy * iy <= 1;
      b.set(fx(u), fy(cv + dv), inside ? (iy < -0.5 ? '#1e1520' : '#120d1a') : dv < 0 ? BOWL_WOOD[4] : BOWL_WOOD[2]);
    }
  }
}

/**
 * THE FEEDING SLOT: a low slot through the wall, a stone lip before it, dark behind; on the lip an
 * empty wooden bowl, licked clean, its spoon in it; scrapes on the stone where it was pushed through.
 */
function feedingSlot(p: Px): void {
  const slot = (u: number, v: number): boolean => u >= -9 && u <= 8 && v >= 6 && v <= 15;
  relief(p, FACE, (u, v) => u >= -12 && u <= 11 && v >= 3 && v <= 19 && !slot(u, v), -13, 12, 2, 20);
  for (let v = 6; v <= 15; v++) for (let u = -9; u <= 8; u++) p.set(fx(u), fy(v), v <= 6 ? FACE[1] : DEEP);
  // the lip, a ledge of stone standing out under it
  for (let u = -12; u <= 11; u++) p.set(fx(u), fy(5), FACE[4]).set(fx(u), fy(4), FACE[2]).set(fx(u), fy(3), FACE[0]);
  for (const [u, l] of [[-10, 3], [7, 4], [-5, 2]] as const) for (let k = 0; k < l; k++) p.set(fx(u + k), fy(5), FACE[0]);
  // the bowl on the lip, seen from the side, its spoon in it
  const w = flat();
  bowlSide(w, 0, 6, 5);
  for (let k = 0; k < 5; k++) w.set(fx(3 + Math.round(k * 0.5)), fy(10 + k), BOWL_WOOD[3]).set(fx(4 + Math.round(k * 0.5)), fy(10 + k), BOWL_WOOD[1]);
  seamed(p, w);
}

/** Is a part of his mark iron (the cage and its rivets)? */
const ironPart = (c: MarkPart): boolean => c === 'iron' || c === 'rivet';
/** Is a part of his mark the leather that holds it on (a strap, its buckle)? */
const strapPart = (c: MarkPart): boolean => c === 'strap' || c === 'buckle';
/** His hands' skin: pale grey, starved (the second fresh look could not see them as hands). */
const HAND_GREY: Ramp = ['#1e1c24', '#3c3944', '#5e5a68', '#827d8c', '#a49eae'];
/** Old leather, dark and grey with age: its shade, its body, its lit edge. */
const STRAP_LEATHER = ['#1a1416', '#332826', '#4a3a34'] as const;
/** The pale stone of a head carved in relief, standing out of the wall into the light: its shade, its body, its lit edge. */
const RELIEF = ['#2a2834', '#3f3c4c', '#575366'] as const;
/** The dark of a field sunk into the stone. */
const SUNK = '#14123a';
/**
 * HIS MUZZLED FACE CUT IN THE WALL, as his mark: a field sunk in the stone, and out of it his long
 * head standing pale in relief, lit along its upper left and dark along its lower right, its shadow
 * on the field; the muzzle-cage over its jaw in dark iron, the face in deep shadow between its bars;
 * his eyes deep under his brow.
 */
function cageCarved(p: Px): void {
  const S = 12;
  const T = 17;
  const cv = 31;
  const at = (u: number, v: number): MarkPart => muzzled((u + 0.5) / S, (v - cv) / T, 1 / S);
  const inIt = (u: number, v: number): boolean => at(u, v) !== null;
  // the field: a long round-topped panel sunk in the stone, its rim in shadow toward the light and lit away from it
  const field = (u: number, v: number): boolean => {
    const x = (u + 0.5) / (S * 0.98);
    const y = (v - cv) / (T * 1.14);
    return y < 0.62 ? Math.abs(x) <= 1 && y >= -1 : x * x + ((y - 0.62) / 0.38) ** 2 <= 1;
  };
  for (let v = cv - T - 4; v <= cv + T + 4; v++) {
    for (let u = -S - 3; u <= S + 2; u++) {
      if (!field(u, v)) continue;
      const hiRim = !field(u - 1, v) || !field(u, v + 1);
      const loRim = !field(u + 1, v) || !field(u, v - 1);
      p.set(fx(u), fy(v), hiRim ? DEEP : loRim ? FACE[3] : SUNK);
    }
  }
  // the head's shadow on the field, down and to the right of it
  for (let v = cv - T - 3; v <= cv + T; v++) for (let u = -S - 2; u <= S + 2; u++) if (field(u, v) && !inIt(u, v) && (inIt(u - 1, v + 1) || inIt(u - 2, v + 1))) p.set(fx(u), fy(v), DEEP);
  for (let v = cv - T - 2; v <= cv + T + 1; v++) {
    for (let u = -S - 2; u <= S + 1; u++) {
      const c = at(u, v);
      if (!c) continue;
      if (ironPart(c)) {
        // (dark iron over the grey skin: the second fresh look found pale bars over dark gaps reading as teeth)
        const hi = !ironPart(at(u - 1, v)) || !ironPart(at(u, v + 1));
        p.set(fx(u), fy(v), c === 'rivet' ? RIVET_LIT : hi ? DIM_IRON[2] : DIM_IRON[0]);
        continue;
      }
      if (c === 'buckle') p.set(fx(u), fy(v), RIVET_LIT);
      else if (c === 'strap') p.set(fx(u), fy(v), !strapPart(at(u, v + 1)) ? STRAP_LEATHER[2] : !strapPart(at(u, v - 1)) ? STRAP_LEATHER[0] : STRAP_LEATHER[1]);
      else if (c === 'eye' || c === 'nose') p.set(fx(u), fy(v), DEEP);
      else if (c === 'gap') p.set(fx(u), fy(v), ironPart(at(u - 1, v + 1)) ? RELIEF[0] : RELIEF[1]);
      else if (c === 'brow') p.set(fx(u), fy(v), RELIEF[0]);
      else {
        const edgeHi = !inIt(u - 1, v) || !inIt(u, v + 1);
        const edgeLo = !inIt(u + 1, v) || !inIt(u, v - 1);
        // (a hollow under each cheekbone, toward the jaw: a starved face)
        const hollow = Math.abs(Math.abs((u + 0.5) / S) - 0.42) < 0.12 && (v - cv) / T > 0.02 && (v - cv) / T < 0.12;
        p.set(fx(u), fy(v), edgeHi ? RELIEF[2] : edgeLo || hollow || at(u, v + 1) === 'brow' ? RELIEF[0] : RELIEF[1]);
      }
    }
  }
}
/** A rivet's lit head on iron set in stone. */
const RIVET_LIT = '#57538e';

/**
 * THE BALL'S CRATER: where his ball was swung into the wall: a shallow dish of stone smashed in, its
 * ragged rim crushed and dented, its side toward the light in shadow and its far side lit and fresh,
 * a small dark pit at its heart; cracks run out from it all round, evenly, thin and dark. (The first
 * fresh look found a deep round hole with pale streaks under it reading, on a corner, as a skull's
 * weeping eye: it is shallow now, its heart small, nothing pale under it.)
 */
function ballCrater(p: Px): void {
  const cu = 0;
  const cv = 30;
  const R = 9;
  /** The rim's reach at an angle: ragged, dented in two places. */
  const reach = (a: number): number => R - 1.4 * hash(Math.round(((a + Math.PI) / (Math.PI * 2)) * 14), 1, 310) - (Math.abs(Math.sin(a * 1.5 + 0.6)) > 0.97 ? 1.5 : 0);
  // the cracks first: out from the rim all round, evenly, each a little crooked, thin
  for (let k = 0; k < 9; k++) {
    let a = (k / 9) * Math.PI * 2 + 0.2 + (hash(k, 2, 311) - 0.5) * 0.25;
    const L = 5 + hash(k, 3, 311) * 4;
    let u = cu + Math.cos(a) * (R - 1);
    let v = cv + Math.sin(a) * (R - 1);
    for (let s_ = 0; s_ < L; s_ += 0.6) {
      a += (hash(k, Math.floor(s_ * 2), 312) - 0.5) * 0.35;
      u += Math.cos(a) * 0.6;
      v += Math.sin(a) * 0.6;
      if (Math.abs(u) > 15) break;
      p.set(fx(Math.round(u)), fy(Math.round(v)), FACE[0]);
    }
  }
  for (let v = cv - R - 2; v <= cv + R + 2; v++) {
    for (let u = cu - R - 2; u <= cu + R + 2; u++) {
      const x = u + 0.5 - cu;
      const y = v - cv;
      const d = Math.hypot(x, y);
      const r = reach(Math.atan2(y, x));
      if (d > r + 1.2) continue;
      // (up and to the left is toward the light)
      const toLight = (-x * 0.7 + y * 0.7) / Math.max(1, d);
      let c: string;
      if (d > r) c = toLight > 0.1 ? FACE[3] : FACE[1];
      else if (d > r - 1.3) c = toLight > 0.2 ? FACE[0] : toLight < -0.3 ? FACE[3] : FACE[1];
      else if (d < 1.8) c = DEEP;
      else c = toLight > 0.25 ? FACE[0] : toLight < -0.25 ? FACE[2] : d < 4 ? FACE[0] : FACE[1];
      p.set(fx(u), fy(v), c);
    }
  }
}

/**
 * THE BOWED WALL, the wall's height: where something threw itself against it from behind, again and
 * again. One crack runs from the foot up into the dark, stepping along the courses, wide in the
 * middle; the stones to its right are shoved out of the face, their courses curving out, most in the
 * middle of the wall: each joint bowed down and back up across them, each stone's top catching the
 * light as it leans out, their sides along the crack lit; grit at its foot. (The first fresh look
 * could not see the bow: the courses curve now.)
 */
function bowedWall(p: Px): void {
  let u = -4;
  const crack: number[] = [];
  for (let v = 0; v <= 79; v++) {
    if (v % 16 === 0 && v > 0) u += hash(v, 1, 320) < 0.5 ? -2 : 2;
    else if (hash(v, 2, 320) < 0.18) u += hash(v, 3, 320) < 0.5 ? -1 : 1;
    crack.push(u);
  }
  const U1 = 15;
  /** How far the wall is shoved out at height v (0 at the foot and the top, most in the middle). */
  const out = (v: number): number => Math.sin((Math.PI * Math.min(76, Math.max(2, v) - 2)) / 74);
  /** How far a joint is bowed down at u, in the shoved stones (most halfway across them). */
  const bowAt = (uu: number, v: number): number => {
    const u0 = crack[Math.max(0, Math.min(79, Math.round(v)))];
    return 3.4 * out(v) * Math.sin((Math.PI * Math.max(0, Math.min(1, (uu - u0) / (U1 + 2 - u0)))));
  };
  // the shoved stones: their courses' joints bowed, each stone lit along its top as it leans out
  for (let v = 0; v <= 79; v++) {
    for (let uu = crack[v] + 1; uu <= U1; uu++) {
      const vb = v + bowAt(uu, v);
      const course = Math.floor(vb / 16);
      const inCourse = vb - course * 16;
      const blockU = uu + (course % 2) * 7;
      const vert = ((blockU % 13) + 13) % 13 === 0;
      const o = out(v);
      let c: string;
      if (inCourse < 1) c = DEEP;
      else if (inCourse > 14.6) c = o > 0.3 ? FACE[4] : FACE[3];
      else if (vert) c = FACE[0];
      else if (((blockU % 13) + 13) % 13 === 1) c = FACE[3];
      else c = inCourse > 11 && o > 0.45 ? FACE[3] : FACE[2];
      p.set(fx(uu), fy(v), c);
    }
  }
  // the crack itself, wide in the middle, the shoved stones' sides along it lit
  for (let v = 0; v <= 79; v++) {
    const w = Math.max(1, Math.round(1 + out(v) * 2.6));
    for (let k = 0; k < w; k++) p.set(fx(crack[v] - k), fy(v), DEEP);
    const side = Math.round(out(v) * 2.2);
    for (let k = 1; k <= side; k++) p.set(fx(crack[v] + k), fy(v), k === 1 ? FACE[4] : FACE[3]);
  }
  // one stone fallen out to the rock behind, left of the crack
  for (let v = 18; v < 26; v++) for (let uu = -13; uu < -5; uu++) p.set(fx(uu), fy(v), v === 25 || uu === -13 ? DEEP : uu === -6 || v === 18 ? FACE[4] : rockAt(uu, v));
  // grit at its foot
  for (let i = 0; i < 8; i++) {
    const U = -9 + Math.floor(hash(i, 1, 322) * 20);
    p.set(fx(U), fy(0), FACE[3]).set(fx(U + 1), fy(0), FACE[1]);
  }
}

/**
 * THE TORN-OUT RING: a great ring's plate wrenched half out of the wall, hanging askew by its one bolt
 * left, the ring on it bent out of round; the bed it was torn from a raw scar in the stone, cracked
 * all round; and off to one side, low, a run of the wall's blocks broken out to the rough rock behind,
 * down to the floor, where they lie (its heap, `tornRingHeap`). (The first fresh look found two torn
 * bolt holes over a breach reading as an angry face with a beard, and no ring: the ring hangs there
 * now, and the breach is to one side.)
 */
function tornRing(p: Px): void {
  // the breach: low and to the right, each course of the wall (16 high) broken out further than the one over it
  const runs: ReadonlyArray<readonly [number, number, number, number]> = [[0, 15, -1, 13], [16, 27, 3, 12]];
  const inBreach = (u: number, v: number): boolean => runs.some(([v0, v1, u0, u1]) => v >= v0 && v <= v1 && u >= u0 + Math.round(2 * hash(v, 1, 334) - 1) && u <= u1 + Math.round(2 * hash(v, 2, 334) - 1));
  for (let v = 0; v <= 28; v++) {
    for (let u = -3; u <= 15; u++) {
      if (!inBreach(u, v)) continue;
      p.set(fx(u), fy(v), !inBreach(u - 1, v) || !inBreach(u, v + 1) ? DEEP : !inBreach(u + 1, v) || !inBreach(u, v - 1) ? FACE[4] : rockAt(u, v));
    }
  }
  // the scar where the plate was: shallow, raw, its bolt holes torn; cracks out from it
  const SU = -4;
  const SV = 42;
  for (const [a, L] of [[-2.6, 7], [-1.2, 6], [0.3, 8], [1.6, 6], [2.6, 5]] as const) {
    for (let r = 5; r < 5 + L; r += 0.6) p.set(fx(Math.round(SU + Math.cos(a) * r + Math.sin(r) * 0.4)), fy(Math.round(SV + Math.sin(a) * r)), FACE[0]);
  }
  for (let v = SV - 5; v <= SV + 5; v++) for (let u = SU - 5; u <= SU + 5; u++) {
    const r = Math.hypot(u + 0.5 - SU, (v - SV) * 1.1);
    if (r > 4.6 + 1.1 * hash(u, v, 330)) continue;
    const toLight = (-(u + 0.5 - SU) + (v - SV)) / Math.max(1, r);
    p.set(fx(u), fy(v), toLight > 0.3 ? FACE[0] : toLight < -0.3 ? FACE[4] : FACE[1]);
  }
  for (const [u, v] of [[SU + 3, SV + 3], [SU + 3, SV - 3], [SU - 3, SV - 3]] as const) p.set(fx(u), fy(v), DEEP).set(fx(u + 1), fy(v), DEEP);
  const c = flat();
  // the plate: hanging from its last bolt (the scar's upper left), turned down and to the right
  const BOLT: V2 = [SU - 3, SV + 3];
  const ang = 0.62;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const onPlate = (x: number, y: number): V2 => [BOLT[0] + x * ca + y * sa, BOLT[1] + x * sa - y * ca];
  for (let y = 0; y <= 7; y += 0.5) for (let x = 0; x <= 7; x += 0.5) {
    const [u, v] = onPlate(x, y);
    const edge = x < 1 || y < 1 ? 3 : x > 6.4 || y > 6.4 ? 0 : 2;
    c.set(fx(Math.round(u)), fy(Math.round(v)), DIM_IRON[edge]);
  }
  rivet(c, fx(BOLT[0]), fy(BOLT[1]), DIM_IRON);
  const [lu, lv] = onPlate(5.5, 5.5);
  rivet(c, fx(Math.round(lu)), fy(Math.round(lv)), DIM_IRON);
  // the ring, from the plate's lower corner: bent out of round, a kink in it
  const [ru, rv] = onPlate(7.5, 8);
  const ring = new Px(c.w, c.h);
  ironRing(ring, fx(ru) + 2.5, fy(rv) + 6, 5.2, 2, WALL_IRON, 1.25, [2.2, 0.32]);
  for (const [x, y] of [[-3, 1], [-4, 2], [-4, 3]] as const) ring.set(fx(ru) + 2 + x, fy(rv) + 6 + y, WALL_IRON[2]);
  p.blit(compose(null, [c, ring], null), 0, 0);
}
/** WHAT CAME DOWN, on the floor before it: the wall's broken blocks, lumps of the rock behind, grit spread out from the wall, and the snapped end of the ring's chain. At the middle of the tile in front of the wall. */
function tornRingHeap(): Sprite {
  const W = 72;
  const H = 52;
  const cx = 36;
  const cy = 30;
  const p = new Px(W, H);
  const under = new Px(W, H);
  // grit spread out from the wall
  for (let i = 0; i < 160; i++) {
    const a = hash(i, 1, 333) * Math.PI;
    const r = Math.sqrt(hash(i, 2, 333)) * 22;
    under.set(Math.round(cx + 2 + Math.cos(a) * r * 1.2), Math.round(cy - 7 + Math.sin(a) * r * 0.5), hash(i, 3, 333) < 0.3 ? FACE[2] : hash(i, 4, 333) < 0.5 ? FACE[1] : ROCK[1]);
  }
  // broken blocks of the face, lit tops, and lumps of rock
  for (const [x, y, w, h] of [[cx - 12, cy - 9, 9, 6], [cx + 4, cy - 10, 11, 7], [cx - 2, cy - 2, 8, 6], [cx + 14, cy - 1, 7, 5], [cx - 18, cy - 2, 6, 4]] as const) {
    lit(p, [STONE[0], STONE[0], STONE[1], STONE[2], STONE[3]], [1, 2], [1, 2], (l) => l.poly([[x, y + 2], [x + 2, y], [x + w, y + 1], [x + w, y + h - 1], [x + w - 2, y + h], [x, y + h]], INK));
  }
  for (const [x, y, r] of [[cx + 10, cy + 4, 2.4], [cx - 7, cy + 4, 2], [cx + 20, cy - 6, 2.2]] as const) ball(p, x, y, r * 1.2, r * 0.8, [ROCK[0], ROCK[0], ROCK[1], ROCK[3], ROCK[3]]);
  // the chain's snapped end, out from under the stones
  const c = new Px(W, H);
  chainAlong(c, [[cx - 6, cy - 4], [cx - 16, cy + 2], [cx - 24, cy + 6], [cx - 30, cy + 5]], DIM_IRON, 0.85);
  ironRing(c, cx - 33, cy + 5, 3, 1.3, DIM_IRON, 0.7, [0, 0.7]);
  return compose(under, [c, p], null).sprite(cx, cy, GRAIN);
}

/**
 * THE CHAIN PORT: a low square mouth at the wall's foot, framed in iron and riveted, its lintel and
 * the jamb toward the light catching it, dark into the next cell; a heavy chain run along the foot of
 * the wall and into it, its links going dark one by one as they go in. (The first fresh look could
 * not find the chain: it is the floor's heaviest now, and it goes in.)
 */
function chainPort(p: Px): void {
  const mouth = (u: number, v: number): boolean => u >= -6 && u <= 9 && v >= 0 && v <= 11 + (Math.abs(u - 1.5) < 5 ? 1 : 0);
  // the iron frame round it, lit along its top and down its left
  for (let v = 0; v <= 15; v++) {
    for (let u = -9; u <= 12; u++) {
      if (mouth(u, v)) continue;
      p.set(fx(u), fy(v), v === 15 ? RIVET_LIT : u === -9 ? DIM_IRON[3] : v === 14 ? DIM_IRON[3] : u === 12 ? DIM_IRON[0] : DIM_IRON[2]);
    }
  }
  // its arch's edge lit, over the mouth and down its left, so the dark reads as a hole in the iron
  for (let v = 0; v <= 13; v++) for (let u = -7; u <= 10; u++) if (!mouth(u, v) && (mouth(u, v - 1) || mouth(u + 1, v))) p.set(fx(u), fy(v), RIVET_LIT);
  for (const [u, v] of [[-8, 13], [11, 13], [-8, 3], [11, 3], [1, 14]] as const) p.set(fx(u), fy(v), DIM_IRON[4]).set(fx(u + 1), fy(v), DIM_IRON[0]);
  // the dark in it, its floor worn bright at the lip
  for (let v = 0; v <= 12; v++) for (let u = -6; u <= 9; u++) if (mouth(u, v)) p.set(fx(u), fy(v), v === 0 && Math.abs(u - 1) < 5 ? FACE[1] : DEEP);
  // the chain: along the foot of the wall from the left and into the mouth, dimming as it goes into the dark
  const c = flat();
  const pts: V3[] = [[-12, 0, 2.5], [-8, 0, 2.5], [-4, 0, 3], [1, 0, 3.5], [7, 0, 4]];
  chainOn(c, pts, (q) => [fx(q[0]), fy(q[2])], 0, 99, 1, WALL_IRON, (s_) => (s_ > 10 ? Math.min(0.92, (s_ - 10) / 9) : 0));
  seamed(p, c);
}

// =================================================================================================
// ON THE WALLS: hung on a face

/** An iron plate bolted to the wall at (u, v), its bolt standing out with an eye. */
function plate(p: Px, u: number, v: number, ramp: Ramp): void {
  for (let dv = -3; dv <= 3; dv++) for (let du = -3; du <= 2; du++) p.set(fx(u + du), fy(v + dv), du === -3 || dv === 3 ? ramp[3] : du === 2 || dv === -3 ? ramp[0] : ramp[2]);
  for (const [du, dv] of [[-2, 2], [1, 2], [-2, -2], [1, -2]] as const) p.set(fx(u + du), fy(v + dv), ramp[4]);
  p.set(fx(u), fy(v), ramp[0]).set(fx(u - 1), fy(v), ramp[0]);
}

/** RINGS AND CHAINS: three great rings bolted on plates along the wall, a heavy chain hanging from each down the stone and heaped at its foot. */
function ringsAndChains(p: Px): void {
  const c = flat();
  const rings: ReadonlyArray<readonly [number, number, number]> = [[-9, 44, 1.5], [0, 50, -1], [8, 41, 0.5]];
  for (const [u, v, sway] of rings) {
    for (let dv = -2; dv <= 2; dv++) for (let du = -2; du <= 1; du++) c.set(fx(u + du), fy(v + dv), du === -2 || dv === 2 ? DIM_IRON[3] : DIM_IRON[1]);
    ironRing(c, fx(u), fy(v - 6), 4.2, 1.6, SMALL_IRON);
    // the chain from the ring's foot down the wall, swaying a little, then heaped on the floor at the foot
    const pts: [number, number][] = [];
    for (let vv = v - 10; vv >= 4; vv -= 2) {
      const t = (v - 10 - vv) / (v - 14);
      pts.push([fx(u + sway * Math.sin(Math.PI * t)), fy(vv)]);
    }
    for (let k = 0; k < 7; k++) {
      const a = (k / 6) * Math.PI * 1.6;
      pts.push([fx(u + Math.sin(a) * 3 + k * 0.2), fy(3 - Math.cos(a) * 1.5)]);
    }
    chainAlong(c, pts, SMALL_IRON, 0.8);
  }
  seamed(p, c);
}


/**
 * IRON BALLS ON A RACK: a rack of timber on two brackets, three of the iron balls the prisoners
 * dragged sitting apart in it, each a dark round with one highlight, its chain hanging from its side
 * over the rack's edge in a loop between it and the next. (The first fresh look found pale balls run together into one lump.)
 */
function ballRack(p: Px): void {
  const c = flat();
  // the brackets
  for (const u of [-13, 12]) for (let v = 22; v <= 30; v++) c.set(fx(u), fy(v), v === 30 ? TIMBER[3] : TIMBER[1]);
  // the chains, a short loop down from each ball under the rack
  const balls: ReadonlyArray<number> = [-10, -1, 8];
  for (const u of balls) {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      pts.push([fx(u + 3 + 2.5 * t), fy(33 - 9 * Math.sin(Math.PI * t * 0.8))]);
    }
    chainAlong(c, pts, SMALL_IRON, 0.55);
  }
  // the rack: a shelf of timber, its front edge lit
  for (let u = -15; u <= 13; u++) c.set(fx(u), fy(31), TIMBER[4]).set(fx(u), fy(30), TIMBER[2]).set(fx(u), fy(29), TIMBER[0]);
  const b = flat();
  for (const u of balls) ironBall(b, fx(u), fy(35.5), 3.9, IRONS, u + 20, undefined, undefined, 0, false);
  p.blit(compose(null, [c, b], null), 0, 0);
}

/** A FIRE BASKET: an iron bracket out of the wall, a basket of iron straps hung from it on a short chain, full of burning coals: frame `f` of four. */
function fireBasket(f: number): (p: Px) => void {
  return (p) => {
    // the bracket: a bar out of a plate on the wall, a hook at its end
    for (let v = 44; v <= 48; v++) p.set(fx(-6), fy(v), IRONS[2]);
    for (let u = -6; u <= 3; u++) p.set(fx(u), fy(48), IRONS[3]).set(fx(u), fy(47), IRONS[1]);
    p.set(fx(3), fy(46), IRONS[3]).set(fx(3), fy(45), IRONS[2]);
    // its chain, short
    for (let v = 38; v <= 44; v++) p.set(fx(3), fy(v), (v % 3 === 0 ? IRONS[1] : IRONS[3]));
    // the basket: straps bowed round a bowl, coals in it
    for (let v = 28; v <= 37; v++) {
      const half = 3 + 4.5 * Math.sin(((v - 27) / 11) * Math.PI * 0.8);
      for (let u = Math.round(3 - half); u <= Math.round(3 + half); u++) {
        const strap = Math.abs((u - 3) % 3) === 0 || v === 37 || v === 28;
        if (strap) p.set(fx(u), fy(v), u < 3 ? IRONS[3] : IRONS[1]);
        else if (v > 33) p.set(fx(u), fy(v), hash(u, v + f, 340) < 0.5 ? COAL[3] : COAL[2]);
      }
    }
    const flames: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
      [[1, 9, 1], [4, 12, 0], [7, 8, -1]],
      [[1, 10, 0], [4, 11, 1], [6, 9, -1]],
      [[0, 8, 1], [4, 13, -1], [7, 9, 0]],
      [[1, 11, -1], [3, 10, 1], [6, 8, 1]],
    ];
    for (const [du, h, lean] of flames[f % 4]) tongue(p, fx(du), fy(37), h, 2.2, lean, EMBER);
    p.set(fx(f % 2 ? 2 : 6), fy(51 - (f % 3)), EMBER[3]);
  };
}

/** Rope, grey with age (never a straw yellow: his Colour 5; floor 2's ROPE). */
const OLD_ROPE: Ramp = ['#1e1820', '#1e1820', '#4a3e48', '#6a5c64', '#7e7078'];
/**
 * THE GOAD AND THE CATCH-POLE, laid on pegs at their own slants: a long pole with an iron spike, and
 * one with a noose of rope at its end, its loop hanging open, its cord run back along the pole to be
 * pulled tight. (The first fresh look could not read their heads: the spike is long and pale, the
 * loop round and open.)
 */
function catchPoles(p: Px): void {
  const c = flat();
  const pole = (u0: number, v0: number, u1: number, v1: number): void => {
    const n = Math.ceil(Math.hypot(u1 - u0, v1 - v0) * 2);
    for (let i = 0; i <= n; i++) {
      const u = Math.round(u0 + ((u1 - u0) * i) / n);
      const v = Math.round(v0 + ((v1 - v0) * i) / n);
      c.set(fx(u), fy(v + 1), TIMBER[3]).set(fx(u), fy(v), TIMBER[2]).set(fx(u), fy(v - 1), TIMBER[0]);
    }
  };
  // the pegs, first (each a stub of timber out of the wall, its end lit), the poles laid over them
  const peg = (u: number, v: number): void => {
    c.set(fx(u), fy(v), TIMBER[4]).set(fx(u + 1), fy(v), TIMBER[2]).set(fx(u), fy(v - 1), TIMBER[2]).set(fx(u + 1), fy(v - 1), TIMBER[0]);
  };
  peg(-9, 39);
  peg(3, 41);
  peg(-1, 23);
  peg(9, 21);
  // the goad: its pole, an iron band at its head, and a long spike
  pole(-13, 40, 5, 43);
  for (const dv of [-1, 0, 1]) c.set(fx(6), fy(43 + dv), SMALL_IRON[2]).set(fx(7), fy(43 + dv), SMALL_IRON[1]);
  for (let k = 0; k <= 6; k++) {
    const half = 1.4 * (1 - k / 7);
    for (let dv = -Math.round(half); dv <= Math.round(half); dv++) c.set(fx(8 + k), fy(43 + Math.round(k * 0.15) + dv), dv > 0 ? SMALL_IRON[3] : dv < 0 ? SMALL_IRON[1] : SMALL_IRON[2]);
  }
  // the catch-pole: its pole, and the noose at its left end: a loop of rope hanging open, its cord back along the pole
  pole(-5, 24, 13, 20);
  const nu = -8.5;
  const nv = 19;
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const u = Math.round(nu + Math.cos(a) * 3.6);
    const v = Math.round(nv + Math.sin(a) * 4.6);
    c.set(fx(u), fy(v), Math.cos(a) - Math.sin(a) < -0.4 ? OLD_ROPE[3] : OLD_ROPE[2]);
  }
  for (let u = -6; u <= -4; u++) c.set(fx(u), fy(23), OLD_ROPE[3]);
  for (let k = 0; k <= 14; k++) c.set(fx(-4 + k), fy(Math.round(22 - k * 0.22)), OLD_ROPE[2]);
  c.set(fx(11), fy(19), OLD_ROPE[3]).set(fx(11), fy(18), OLD_ROPE[2]);
  seamed(p, c);
}

/** EMPTY BOWLS on a shelf: a ledge of stone on a corbel, wooden bowls on it seen from the side: three stacked one in another, and one standing apart with its spoon in it. */
function emptyBowls(p: Px): void {
  for (let u = -14; u <= 13; u++) p.set(fx(u), fy(30), FACE[4]).set(fx(u), fy(29), FACE[3]).set(fx(u), fy(28), FACE[2]).set(fx(u), fy(27), FACE[1]).set(fx(u), fy(26), FACE[0]);
  for (let v = 20; v <= 25; v++) for (let u = -4; u <= 3; u++) p.set(fx(u), fy(v), u === -4 ? FACE[3] : u === 3 ? FACE[0] : FACE[1]);
  const b = flat();
  // the stack: each a little bigger than the one in it, from the bottom up
  bowlSide(b, -7, 31, 4.5);
  bowlSide(b, -7, 33, 5);
  bowlSide(b, -7, 35, 5.5);
  // the one apart, and its spoon
  bowlSide(b, 7, 31, 4.5);
  for (let k = 0; k < 6; k++) b.set(fx(9 + Math.round(k * 0.5)), fy(34 + k), BOWL_WOOD[3]).set(fx(10 + Math.round(k * 0.5)), fy(34 + k), BOWL_WOOD[1]);
  seamed(p, b);
}

/** Cloth gone grey-brown with dirt and damp: an old rag. */
const RAG_CLOTH: Ramp = ['#1a1519', '#1a1519', '#3b3236', '#574a4c', '#685a5a'];
/**
 * RAGS ON A NAIL: an old rag hung up by its two top corners on two nails, its top sagging between
 * them, the cloth falling in long soft folds, its hem torn ragged into strips of different lengths,
 * one corner hanging lower. (The first fresh look found narrow round-topped rags with a hole worn in
 * them reading as hooded shadows with an eye: it is wide and hangs from its corners now, no hole.)
 */
function ragsOnNail(p: Px): void {
  const r = flat();
  const NAILS: ReadonlyArray<V2> = [[-9, 45], [8, 46]];
  /** Its top edge, sagging between the nails. */
  const top = (u: number): number => {
    const t = (u - NAILS[0][0]) / (NAILS[1][0] - NAILS[0][0]);
    return NAILS[0][1] + (NAILS[1][1] - NAILS[0][1]) * t - 5 * Math.sin(Math.PI * Math.max(0, Math.min(1, t)));
  };
  /** Where its hem is under column u: torn into strips, each its own length; one corner lower. */
  const hem = (u: number): number => 21 + Math.floor(hash(Math.floor((u + 40) / 2), 1, 341) * 5) - (u < -6 ? 4 : 0) + (u > 4 ? 2 : 0);
  /** Its folds: soft, down from where it hangs, a deep one under each nail and two between. */
  const fold = (u: number, v: number): number => Math.sin((u + 0.6 * Math.sin(v * 0.25)) * 0.95);
  for (let u = NAILS[0][0] - 1; u <= NAILS[1][0] + 1; u++) {
    for (let v = hem(u); v <= top(u); v++) {
      const f = fold(u, v);
      const edge = u <= NAILS[0][0] - 1 ? RAG_CLOTH[3] : u >= NAILS[1][0] + 1 ? RAG_CLOTH[1] : v >= top(u) - 0.5 ? RAG_CLOTH[4] : null;
      r.set(fx(u), fy(v), edge ?? (v === hem(u) ? RAG_CLOTH[1] : f > 0.55 ? RAG_CLOTH[3] : f < -0.55 ? RAG_CLOTH[1] : RAG_CLOTH[2]));
    }
  }
  // the nails, through its corners
  for (const [u, v] of NAILS) r.set(fx(u), fy(v), IRONS[3]).set(fx(u + 1), fy(v), IRONS[1]).set(fx(u), fy(v + 1), IRONS[2]);
  seamed(p, r);
}

/**
 * THE WALL WINCH, the wall's height: a drum of timber in iron bands on brackets low on the wall, a
 * crank at one end and the ratchet's wheel and pawl at the other; its chain wound on it and run up the
 * wall through two iron guides into the dark. What the jailers hauled his chains up with.
 */
function wallWinch(p: Px): void {
  const c = flat();
  // the brackets
  for (const u of [-11, 9]) for (let v = 12; v <= 26; v++) c.set(fx(u), fy(v), IRONS[2]).set(fx(u + 1), fy(v), IRONS[0]);
  // the drum, along the wall: its top lit, iron bands round it, the chain wound on it
  for (let v = 15; v <= 24; v++) {
    for (let u = -9; u <= 8; u++) {
      const band = u === -7 || u === 6;
      const t = (v - 15) / 9;
      c.set(fx(u), fy(v), band ? (t > 0.6 ? IRONS[3] : IRONS[1]) : t > 0.75 ? TIMBER[3] : t < 0.25 ? TIMBER[0] : TIMBER[2]);
    }
  }
  for (let u = -6; u <= 5; u += 2) for (let v = 16; v <= 23; v += 2) c.set(fx(u), fy(v), (u + v) % 4 === 0 ? SMALL_IRON[3] : SMALL_IRON[1]);
  // the crank: out from its left end and down, a handle
  for (let k = 0; k <= 6; k++) c.set(fx(-12), fy(20 - k), IRONS[3]).set(fx(-13), fy(20 - k), IRONS[1]);
  for (let k = 0; k <= 2; k++) c.set(fx(-14 + k), fy(13), TIMBER[3]).set(fx(-14 + k), fy(12), TIMBER[1]);
  // the ratchet's wheel at its right end, its pawl
  for (let a = 0; a < Math.PI * 2; a += 0.2) c.set(fx(Math.round(10.5 + Math.cos(a) * 2.5)), fy(Math.round(20 + Math.sin(a) * 2.5)), Math.floor(a * 1.6) % 2 ? IRONS[3] : IRONS[1]);
  for (let k = 0; k < 3; k++) c.set(fx(10 + k), fy(25 - k), IRONS[2]);
  // the chain off the drum's top, up the wall through two guides into the dark
  chainAlong(c, [[fx(2), fy(25)], [fx(2), fy(46)], [fx(3), fy(79)]], SMALL_IRON, 0.75);
  for (const v of [44, 66]) for (let u = -2; u <= 6; u++) c.set(fx(u), fy(v + 1), IRONS[3]).set(fx(u), fy(v), u === -2 || u === 6 ? IRONS[2] : IRONS[1]);
  seamed(p, c);
}

/**
 * THE JAILERS' LAMP: an iron lantern hung from a bracket out of the wall: the bracket's arm and its
 * brace, a hook, and the lantern on it: a peaked cap, a frame of four posts with panes of horn between
 * them glowing with the candle inside, a dished foot. Frame `f` of four. (The first fresh look could
 * not make out the small lamp that was here: this is twice its size.)
 */
function jailerLamp(f: number): (p: Px) => void {
  return (p) => {
    // the bracket: a plate on the wall, an arm out along it and a brace under it, a hook at its end
    for (let v = 44; v <= 50; v++) p.set(fx(-9), fy(v), IRONS[3]).set(fx(-8), fy(v), IRONS[1]);
    for (let u = -9; u <= 3; u++) p.set(fx(u), fy(50), IRONS[3]).set(fx(u), fy(49), IRONS[1]);
    for (let k = 0; k <= 5; k++) p.set(fx(-8 + k), fy(44 + k), IRONS[2]);
    p.set(fx(3), fy(48), IRONS[3]).set(fx(3), fy(47), IRONS[2]).set(fx(2), fy(46), IRONS[3]);
    // the lantern's ring and cap: a peak, lit on its left
    p.set(fx(2), fy(45), IRONS[2]).set(fx(1), fy(45), IRONS[3]);
    for (let v = 40; v <= 44; v++) {
      const half = (44 - v) * 1.3 + 0.5;
      for (let u = Math.round(2 - half); u <= Math.round(2 + half); u++) p.set(fx(u), fy(v), u < 2 - half * 0.3 ? IRONS[3] : u > 2 + half * 0.4 ? IRONS[1] : IRONS[2]);
    }
    // its body: the panes glowing, the candle's flame in the middle, the four posts over them, bands top and foot
    const glow = [EMBER[0], EMBER[1], EMBER[0], EMBER[1]][f % 4];
    for (let v = 29; v <= 39; v++) for (let u = -3; u <= 7; u++) p.set(fx(u), fy(v), Math.abs(u - 2) <= 2 && v < 36 ? EMBER[1] : glow);
    const [h, w, lean] = ([[6, 1.6, 0.6], [7, 1.4, 0], [6, 1.7, -0.6], [7, 1.5, 0.4]] as const)[f % 4];
    flame(p, fx(2), fy(30), h, w, lean);
    for (const [u, hi] of [[-4, true], [0, true], [4, false], [8, false]] as const) for (let v = 28; v <= 40; v++) p.set(fx(u), fy(v), hi ? IRONS[3] : IRONS[1]);
    for (let u = -4; u <= 8; u++) p.set(fx(u), fy(40), IRONS[3]).set(fx(u), fy(28), IRONS[2]);
    // the foot, dished, and its knob
    for (let u = -3; u <= 7; u++) p.set(fx(u), fy(27), u < 2 ? IRONS[3] : IRONS[1]);
    for (let u = 0; u <= 4; u++) p.set(fx(u), fy(26), IRONS[2]);
    p.set(fx(2), fy(25), IRONS[1]);
  };
}

/** Bone, pale, as a skull on a wall is (a step under the figures' bone). */
const SKULL_BONE: Ramp = ['#221e38', '#221e38', '#565080', '#7c74a4', '#928ab8'];
/**
 * A SKULL IN ITS MUZZLE on a hook: what is left of a prisoner who died in his: a small pale skull,
 * its sockets dark, the dark iron of the muzzle-cage still round its jaw, hung from a hook in the wall
 * by the cage's two straps; its shadow on the stone.
 */
function spareCage(p: Px): void {
  const S = 9;
  const T = 11;
  const cv = 31;
  const HOOK: V2 = [0, 49];
  const c = flat();
  const at = (u: number, v: number): MarkPart => muzzled((u + 0.5) / S, (v - cv) / T, 1 / S, true);
  const inIt = (u: number, v: number): boolean => at(u, v) !== null;
  // the straps, up from where the cage's own run behind the skull to the hook
  const strapPx = new Set<string>();
  for (const sd of [-1, 1]) {
    const a: V2 = [sd * 0.8 * S, cv + 0.3 * T];
    for (let k = 0; k <= 30; k++) {
      const t = k / 30;
      strapPx.add(`${Math.round(a[0] + (HOOK[0] + sd * 1 - a[0]) * t)},${Math.round(a[1] + (HOOK[1] - 2 - a[1]) * t)}`);
    }
  }
  const strapAt = (u: number, v: number): boolean => strapPx.has(`${u},${v}`) || strapPx.has(`${u - 1},${v}`);
  // its shadow on the wall, down and to the right of it
  for (let v = cv - T - 3; v <= HOOK[1]; v++) for (let u = -S - 2; u <= S + 3; u++) if (!inIt(u, v) && !strapAt(u, v) && (inIt(u - 1, v + 1) || inIt(u - 2, v + 1))) p.set(fx(u), fy(v), DEEP);
  for (let v = cv - T - 2; v <= HOOK[1]; v++) {
    for (let u = -S - 2; u <= S + 2; u++) {
      if (strapAt(u, v) && !inIt(u, v)) {
        c.set(fx(u), fy(v), strapPx.has(`${u},${v}`) ? STRAP_LEATHER[2] : STRAP_LEATHER[0]);
        continue;
      }
      const k = at(u, v);
      if (!k) continue;
      if (ironPart(k)) {
        const hi = !ironPart(at(u - 1, v)) || !ironPart(at(u, v + 1));
        c.set(fx(u), fy(v), k === 'rivet' ? RIVET_LIT : hi ? IRONS[1] : IRONS[0]);
      } else if (k === 'buckle') c.set(fx(u), fy(v), RIVET_LIT);
      else if (k === 'strap') c.set(fx(u), fy(v), !strapPart(at(u, v + 1)) ? STRAP_LEATHER[2] : STRAP_LEATHER[1]);
      else if (k === 'eye' || k === 'nose') c.set(fx(u), fy(v), DEEP);
      else if (k === 'gap') c.set(fx(u), fy(v), SKULL_BONE[1]);
      else {
        const edgeHi = !inIt(u - 1, v) || !inIt(u, v + 1);
        const edgeLo = !inIt(u + 1, v) || !inIt(u, v - 1);
        c.set(fx(u), fy(v), edgeHi ? SKULL_BONE[4] : edgeLo ? SKULL_BONE[1] : v > cv + 0.45 * T ? SKULL_BONE[3] : SKULL_BONE[2]);
      }
    }
  }
  // the hook: an iron peg out of the wall, turned up at its end
  for (let v = HOOK[1] - 2; v <= HOOK[1] + 2; v++) c.set(fx(0), fy(v), IRONS[3]).set(fx(1), fy(v), IRONS[1]);
  c.set(fx(-1), fy(HOOK[1] + 2), IRONS[3]).set(fx(-1), fy(HOOK[1] + 1), IRONS[2]);
  seamed(p, c);
}

// =================================================================================================
// FLOOR TILES (a tile's picture, anchored at its top corner, as the floor's own)

/** Where (x, y) on a tile's picture is on the tile: (u, v), each 0..1 along x and along y. */
const uvOf = (x: number, y: number): [number, number] => {
  const px = x + 0.5 - 32;
  const py = y + 0.5;
  return [(px / 32 + py / 16) / 2, (py / 16 - px / 32) / 2];
};
/** Where (u, v) of a tile is on its picture. */
const xyOf = (u: number, v: number): [number, number] => [32 + (u - v) * 32, (u + v) * 16];
/** Is (x, y) inside a tile's diamond? */
const inTile = (x: number, y: number): boolean => {
  if (y < 0 || y >= 32) return false;
  const hw = y < 16 ? 2 * y + 1 : 2 * (31 - y) + 1;
  return x >= 32 - hw && x < 32 + hw;
};

/**
 * A SOFT TUFT OF OLD STRAW at (cx, cy) on a picture, rx across and ry down: a low mat with a ragged,
 * lumpy edge, mottled in soft patches (no single stalks: the second fresh look found crisp separate
 * strokes reading as scratched letters), its top lit, its foot in shade. Only where `ok` lets it.
 */
function strawTuft(p: Px, cx: number, cy: number, rx: number, ry: number, seed: number, ok: (x: number, y: number) => boolean = () => true): void {
  for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) {
    for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const a = Math.atan2(dy, dx);
      const edge = 1 + 0.18 * Math.sin(4 * a + seed) + 0.1 * Math.sin(7 * a + seed * 2.3);
      const d = Math.hypot(dx, dy) / edge;
      if (d > 1 || !ok(x, y)) continue;
      // soft patches, a few pixels each, lying along
      const patch = hash(Math.floor((x + seed) / 3), Math.floor(y / 2), 353 + seed);
      let tone = patch < 0.3 ? 3 : patch < 0.85 ? 2 : 1;
      if (dy < -0.45 && d > 0.55) tone = Math.max(tone, 3);
      if (dy > 0.4 && d > 0.6) tone = 1;
      if (d > 0.88 && dy > 0) tone = 0;
      if (dx < -0.4 && dy < -0.2 && patch < 0.5) tone = 4;
      p.set(x, y, STRAW[Math.min(4, tone + 0)]);
    }
  }
}

/** OLD STRAW strewn on the flags: soft grey tufts and a trodden mat, lumpy edged, mottled. */
function strawTile(): Sprite {
  const p = tileOf((u, v) => around(u, v));
  const ok = (x: number, y: number): boolean => inTile(x, y);
  for (const [cu, cv, R, seed] of [[0.42, 0.45, 0.26, 1], [0.68, 0.64, 0.15, 2], [0.28, 0.74, 0.12, 3]] as const) {
    const [x, y] = xyOf(cu, cv);
    strawTuft(p, x, y, R * 40, R * 20, seed, ok);
  }
  return p.sprite(32, 0, GRAIN);
}

/** WHERE HIS BALL WAS DRAGGED: two deep furrows gouged across the flags, curving, each a dark bed with its near lip in shade and its far lip broken bright, chips knocked out along them, a slab cracked off one. (The first fresh look could not see them: they are wide and deep now.) */
function ballGrooves(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (const [off, bend, w] of [[-0.14, 0.55, 0.1], [0.18, 0.4, 0.085]] as const) {
    const line = off + bend * x * x - 0.06 * x;
    const d = y - line;
    if (Math.abs(d) < w * 0.45) return DEEP;
    if (Math.abs(d) < w * 0.7) return d < 0 ? '#0e0c20' : '#141130';
    if (Math.abs(d) < w) return d < 0 ? '#100d22' : GROOVE_LIT;
    if (Math.abs(d) < w + 0.04 && hash(Math.floor(u * 28), Math.floor(v * 28), 352) < 0.4) return d < 0 ? SLAB[0] : SLAB[3];
  }
  const c = Math.abs(x - 0.18 - 0.3 * (y + 0.1) + 0.04 * Math.sin(y * 30));
  if (c < 0.016 && y > -0.05 && y < 0.35) return DEEP;
  return around(u, v);
}
/** Stone freshly broken on a floor: its bright edge. */
const GROOVE_LIT = '#463f8e';

/** THE OUBLIETTE: a round pit in the floor into the dark, a heavy grate of iron bars laid over it, all one way, on a rim of iron let into the stone. */
function oubliette(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const r = Math.hypot(x, y);
  if (r > 0.4) return around(u, v);
  if (r > 0.34) return x + y < -0.1 ? DIM_IRON[3] : x + y > 0.15 ? DIM_IRON[0] : DIM_IRON[2];
  // the bars, along x: each lit on its far edge
  for (const b of [-0.2, -0.067, 0.067, 0.2]) {
    const d = y - b;
    if (Math.abs(d) < 0.03) return d < -0.01 ? DIM_IRON[3] : DIM_IRON[2];
    if (Math.abs(d) < 0.042) return DIM_IRON[0];
  }
  // the dark under it, the pit's wall showing on its far side
  return r > 0.27 && x + y < -0.15 ? '#141128' : DEEP;
}

/** THE SMASHED FLAGS: where something very heavy came down: the slab burst into pieces round a dark crater, each piece tipped its own way along deep dark cracks, its far edge lit and its near edge in shade. (The first fresh look could not see it: its cracks are wide and its crater dark now.) */
function smashedFlags(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const r = Math.hypot(x, y * 1.05);
  if (r > 0.42) return around(u, v);
  if (r < 0.09) return r < 0.05 ? DEEP : x + y < 0 ? '#0e0c20' : SLAB[0];
  let best = 9;
  let next = 9;
  let k = 0;
  let bx = 0;
  let by = 0;
  for (let i = 0; i < 11; i++) {
    const a = hash(i, 1, 353) * Math.PI * 2;
    const rr = 0.13 + 0.27 * hash(i, 2, 353) ** 1.2;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    const d = Math.hypot(x - px, y - py);
    if (d < best) {
      next = best;
      best = d;
      k = i;
      bx = px;
      by = py;
    } else if (d < next) next = d;
  }
  if (next - best < 0.022) return DEEP;
  // each piece tipped: lit on the side its tip faces, in shade on the other
  const tip = hash(k, 3, 353) * Math.PI * 2;
  const side = ((x - bx) * Math.cos(tip) + (y - by) * Math.sin(tip)) / Math.max(0.03, best);
  if (next - best < 0.045) return side > 0 ? GROOVE_LIT : '#100d22';
  return side > 0.4 ? SLAB[3] : side < -0.4 ? SLAB[0] : SLAB[1 + (k % 2)];
}

/** HIS MUZZLE IN THE FLOOR, as his mark (as floor 2's \u201cthe hood in the floor\u201d): a dark slab let into the flags, his head laid big in it in grey stone, upright to the eye, the muzzle-cage over its jaw in dark iron, its straps round his head, his eyes dark under his brow. */
function cageInFloor(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  /** His mark at this point, moved (dx, dy) picture pixels. */
  const at = (dx: number, dy: number): MarkPart => muzzled((x - y + dx / 32) / 0.42, -(x + y - 0.02 + dy / 16) / 0.74, 0.1, false, true);
  const c = at(0, 0);
  if (ironPart(c)) return c === 'rivet' ? RIVET_LIT : !ironPart(at(-1, -1)) ? DIM_IRON[2] : DIM_IRON[0];
  if (c === 'buckle') return RIVET_LIT;
  if (c === 'strap') return !strapPart(at(-1, -1)) ? STRAP_LEATHER[2] : !strapPart(at(1, 1)) ? STRAP_LEATHER[0] : STRAP_LEATHER[1];
  if (c === 'eye' || c === 'nose') return DEEP;
  if (c === 'gap') return ironPart(at(1, 1)) ? RELIEF[0] : RELIEF[1];
  if (c === 'brow') return RELIEF[0];
  if (c === 'face') return at(-1, -1) === null ? RELIEF[2] : at(1, 1) === null ? RELIEF[0] : RELIEF[1];
  // the slab round it, dark, its shadow under the head
  return at(-1, -2) !== null ? DEEP : SLAB[0];
}

/** A RING IN THE FLOOR: a great iron ring lying flat on its staple, let into a slab: thick, its top lit, the slab dark through its middle. */
function floorRingTile(): Sprite {
  const p = tileOf((u, v) => {
    const [x, y] = mid(u, v);
    // the staple's plate, sunk in the slab under the ring's far side
    if (Math.abs(x + 0.14) < 0.07 && Math.abs(y + 0.14) < 0.07) return Math.abs(x + 0.14) > 0.05 || Math.abs(y + 0.14) > 0.05 ? DIM_IRON[0] : DIM_IRON[2];
    return SLAB[hash(Math.floor(u * 3), Math.floor(v * 3), 355) < 0.5 ? 2 : 1];
  }, box(0.1, 0.9, 0.1, 0.9));
  const c = new Px(64, 32);
  const [cx, cy] = xyOf(0.53, 0.53);
  // (its side, under its top edge, then its top)
  for (let a = 0; a < Math.PI * 2; a += 0.02) {
    for (let r = 8; r <= 11; r += 0.4) {
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.5;
      if (Math.sin(a) > 0 && r > 10.4) c.set(Math.round(x), Math.round(y) + 1, DIM_IRON[0]);
      c.set(Math.round(x), Math.round(y), r > 10.4 || r < 8.5 ? DIM_IRON[2] : Math.cos(a) + Math.sin(a) * 0.4 < -0.3 ? DIM_IRON[3] : DIM_IRON[2]);
    }
  }
  // the staple, over the ring's far edge
  const [sx, sy] = xyOf(0.36, 0.36);
  for (let k = -2; k <= 2; k++) c.set(Math.round(sx) + k, Math.round(sy) - 1, DIM_IRON[3]).set(Math.round(sx) + k, Math.round(sy), DIM_IRON[1]);
  p.blit(compose(null, [c], null), 0, 0);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) if (!inTile(x, y)) p.erase(x, y);
  return p.sprite(32, 0, GRAIN);
}

// =================================================================================================
// TRAPS


/**
 * THE TRIP CHAIN: two iron bolts in the floor across the tile, a heavy chain between them lying slack
 * along the flags; `sprung`, snatched up taut at a shin's height as something trips it, the bolts
 * jerked over. Anchored at the middle of its tile.
 */
function tripChain(sprung: boolean): Sprite {
  const H = 42;
  const out = new Px(64, H);
  out.blit(tileOf(around), 0, H - 32);
  const ax = 32;
  const ay = H - 16;
  const at = (x: number, y: number, z: number): [number, number] => {
    const [px, py] = onPic(x, y, z);
    return [ax + px, ay + py];
  };
  const c = new Px(64, H);
  // the bolts: squat iron posts with an eye, at either end along y
  const ends: ReadonlyArray<V3> = [[-3, -17, 0], [3, 17, 0]];
  for (const [x, y] of ends) {
    const lean = sprung ? (y < 0 ? 1.5 : -1.5) : 0;
    const [bx, by] = at(x, y, 0);
    const [tx, ty] = at(x, y + lean, 6);
    limb(c, bx, by, tx, ty, 1.8, 1.4, DIM_IRON);
    ironRing(c, tx, ty - 1, 2, 1, DIM_IRON);
  }
  // the chain between them: lying in easy bends on the floor, or taut at a shin's height
  const pts: [number, number][] = [];
  for (let k = 0; k <= 20; k++) {
    const t = k / 20;
    const y = -17 + 34 * t;
    const x = sprung ? -3 + 6 * t : -3 + 6 * t + Math.sin(t * Math.PI * 2.5) * 5;
    const z = sprung ? 6 + 1.5 * Math.sin(t * Math.PI) : 1;
    pts.push(at(x, y, z));
  }
  chainAlong(c, pts, DIM_IRON, 0.7);
  out.blit(compose(null, [c], null), 0, 0);
  return out.sprite(32, H - 16, GRAIN);
}

/**
 * THE MANTRAP: a giant's leg-iron made a trap, set on the flags: its two long jaws laid open flat
 * either side of a square pan, their teeth a big zigzag along their inner edges; its two great flat
 * springs out along the floor either side; `shut`, the jaws snapped up together over the pan, their
 * teeth locked. Anchored at the middle of its tile.
 */
function mantrap(shut: boolean): Sprite {
  const H = 46;
  const base = tileOf(around);
  const out = new Px(64, H);
  out.blit(base, 0, H - 32);
  const t = new Px(64, H);
  const ax = 32;
  const ay = H - 16;
  const at = (x: number, y: number, z: number): [number, number] => {
    const [px, py] = onPic(x, y, z);
    return [ax + px, ay + py];
  };
  const put = (x: number, y: number, z: number, c: string): void => {
    const [px, py] = at(x, y, z);
    t.set(Math.round(px), Math.round(py), c);
  };
  // the springs: flat bows of iron along x from the hinges outward, each with its dark shadow on the flags
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 11; k += 0.25) {
      const x = s * (13 + k);
      const z = 1 + 2.4 * Math.sin((k / 11) * Math.PI);
      for (const y of [-1.8, 1.8]) put(x + 0.6, y + 0.6, 0.2, DIM_IRON[0]);
      for (const y of [-1.6, 1.6]) put(x, y, z, y < 0 ? DIM_IRON[3] : DIM_IRON[2]);
      put(x, 0, z + 0.6, RIVET_LIT);
    }
  }
  // its chain, from the far spring's end to an iron peg driven into the flags
  {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const k = i / 8;
      pts.push(at(24 - 6 * k, -3 - 12 * k + 2 * Math.sin(k * Math.PI), 0.8));
    }
    chainAlong(t, pts, DIM_IRON, 0.7);
    // the peg: a square head on a stub, lit on top
    for (let x = -1.5; x <= 1.5; x += 0.3) for (let y = -1.5; y <= 1.5; y += 0.3) put(18 + x, -15 + y, 2.4, x + y < -1 ? RIVET_LIT : DIM_IRON[3]);
    for (let z = 0; z <= 2.4; z += 0.3) put(19.5, -13.5, z, DIM_IRON[0]);
  }
  // the pan, under the jaws when they are shut
  if (shut) for (let x = -4; x <= 4; x += 0.4) for (let y = -4; y <= 4; y += 0.4) put(x, y, 1.3, Math.abs(x) > 3.6 || Math.abs(y) > 3.6 ? DIM_IRON[0] : DIM_IRON[2]);
  if (!shut) {
    // the jaws, set: two half-moons of heavy iron laid open flat, the far one and the near one, their
    // ends on the hinges either side, a dark gap between them there; their teeth along their inner
    // edges pointing in, each tooth's tip bright; a dark plate in the middle. Each casts a dark line on
    // the flags outside it. (The second fresh look found the last a grey zig-zag scribble at phone size.)
    const RO = 12.5;
    const RI = 9.6;
    const jaw = (side: -1 | 1): void => {
      for (let a = 0.13; a <= Math.PI - 0.13; a += 0.012) {
        const c = Math.cos(a);
        const sn = Math.sin(a) * side;
        // its shadow on the flags, outside it
        put(c * (RO + 0.9) + 0.5, sn * (RO + 0.9) + 0.5, 0.2, '#0c0a1c');
        for (let r = RI; r <= RO; r += 0.3) {
          const lit_ = r > RO - 0.9 ? (side < 0 ? DIM_IRON[3] : DIM_IRON[2]) : r < RI + 0.7 ? DIM_IRON[0] : side < 0 ? DIM_IRON[2] : DIM_IRON[3];
          put(c * r, sn * r, 1.4, lit_);
        }
      }
      // the teeth: big triangles in from the inner edge, lit on one side, dark on the other, their tips bright
      for (let k = 0; k < 7; k++) {
        const a0 = 0.3 + (k / 7) * (Math.PI - 0.6);
        const a1 = a0 + (Math.PI - 0.6) / 7;
        for (let q = 0; q <= 1; q += 0.04) {
          const tooth = 1 - Math.abs(q * 2 - 1);
          const a = a0 + (a1 - a0) * q;
          for (let r = RI - 4.2 * tooth; r <= RI; r += 0.3) {
            const tipOf = r < RI - 3.2;
            put(Math.cos(a) * r, Math.sin(a) * r * side, 1.5, tipOf ? '#6c68a8' : q < 0.5 ? DIM_IRON[3] : DIM_IRON[0]);
          }
        }
      }
    };
    jaw(-1);
    // the plate in the middle: dark, square, its rim lit to the light
    for (let x = -3.4; x <= 3.4; x += 0.3) for (let y = -3.4; y <= 3.4; y += 0.3) put(x, y, 1.2, x < -3 || y < -3 ? DIM_IRON[2] : '#0c0a1c');
    // the hinges: square blocks either side, where the jaws' ends and the springs meet
    for (const s of [-1, 1]) for (let x = -1.6; x <= 1.6; x += 0.3) for (let y = -2.6; y <= 2.6; y += 0.3) put(s * 12 + x, y, 2.2, y < -2 ? RIVET_LIT : x > 1.2 ? DIM_IRON[0] : DIM_IRON[3]);
    jaw(1);
  } else {
    // snapped shut: the two jaws up over the pan in a round arch along x, side by side, teeth locked along its top
    for (let a = 0; a <= Math.PI; a += 0.015) {
      for (let r = 8; r <= 10.5; r += 0.4) {
        for (const y of [-1.4, 1.4]) put(Math.cos(a) * r, y, 1 + Math.sin(a) * r, r > 10.1 ? DIM_IRON[3] : y > 0 ? (Math.cos(a) > 0.3 ? DIM_IRON[1] : DIM_IRON[2]) : DIM_IRON[3]);
      }
      // the teeth: a zigzag along its inner edge
      const tooth = Math.abs(((a / Math.PI) * 18) % 2 - 1);
      put(Math.cos(a) * (8 - 2 * tooth), 0, 1 + Math.sin(a) * (8 - 2 * tooth), DIM_IRON[2]);
    }
  }
  out.blit(compose(null, [t], null), 0, 0);
  return out.sprite(32, H - 16, GRAIN);
}

/**
 * THE BALL HATCH: a square hatch in the wall at a man's chest, framed in iron, set off to one side of
 * its face; inside it in the dark one of his iron balls sits low on the sill, its chain running up
 * into the dark, waiting to swing out; the stone under the sill gouged where it has swung. (The first
 * fresh look found an arch with a ball hung in it reading as a window with a bell; the second found
 * the hatch centred, so that on a corner its two faces made a pair of staring eyes, the shutter over
 * each a brow: now there is one hatch, off to one side, so the two faces of a corner never match; no
 * shutter over it; its lintel in shadow and its sill the lit edge, as a recess is.)
 */
function ballHatch(p: Px): void {
  const U0 = 1;
  const U1 = 12;
  const V0 = 22;
  const V1 = 37;
  const hole = (u: number, v: number): boolean => u >= U0 && u <= U1 && v >= V0 && v <= V1;
  // the iron frame round it (its sill lit, its lintel in shadow), and the dark inside
  for (let v = V0 - 2; v <= V1 + 1; v++) for (let u = U0 - 2; u <= U1 + 2; u++) {
    if (hole(u, v)) p.set(fx(u), fy(v), v <= V0 + 1 ? FACE[0] : u === U0 ? FACE[0] : DEEP);
    else p.set(fx(u), fy(v), v === V0 - 1 ? DIM_IRON[3] : v === V0 - 2 ? DIM_IRON[0] : u === U0 - 2 ? DIM_IRON[2] : DIM_IRON[0]);
  }
  for (const [u, v] of [[U0 - 1, V0 - 2], [U1 + 1, V0 - 2]] as const) p.set(fx(u), fy(v), RIVET_LIT);
  // gouges in the stone under the sill, where it has swung out over it
  for (const [u0, len] of [[3, 6], [7, 8], [10, 5]] as const) for (let k = 0; k < len; k++) p.set(fx(u0 + Math.round(k * 0.3)), fy(V0 - 3 - k), k < len - 2 ? FACE[0] : FACE[1]).set(fx(u0 + 1 + Math.round(k * 0.3)), fy(V0 - 3 - k), FACE[3]);
  const b = flat();
  // its chain, up from the ball into the dark over it
  for (let v = V0 + 8; v <= V1; v++) b.set(fx(7), fy(v), v % 3 === 0 ? DIM_IRON[0] : DIM_IRON[2]);
  // the ball, low on the sill: dark iron, one highlight
  ironBall(b, fx(6.5), fy(V0 + 4), 4.5, IRONS, 7, undefined, undefined, 0, false);
  seamed(p, b);
}

// =================================================================================================
// BREAKABLES: standing at the middle of their foot

/** A BALE OF STRAW, grey with age, its stalks lying along it, two twine bands round it, stray stalks out of its top and its end, on the grid. 56 x 46 at (28, 36). */
function strawBale(): Sprite {
  const W = 56;
  const H = 46;
  const ox = 28;
  const oy = 36;
  const b = new Px(W, H);
  const iso = new Iso(b, ox, oy);
  const A = 0.27;
  const B = 0.18;
  const TWINE = [0.27, 0.73];
  /** The stalks along it: streaks lying lengthways, each row its own tone. */
  const along = (lit_: boolean) => (u: number, v: number, w: number, h: number): string => {
    if (TWINE.some((t) => Math.abs(u - w * t) < 1)) return lit_ ? ROPE_DARK[1] : ROPE_DARK[0];
    if (v === 0) return lit_ ? STRAW[4] : STRAW[3];
    if (v >= h - 1) return STRAW[0];
    const g = hash(Math.floor((u + v * 3) / 6), v, 360);
    return lit_ ? (g < 0.25 ? STRAW[4] : g < 0.7 ? STRAW[3] : STRAW[2]) : g < 0.3 ? STRAW[2] : STRAW[1];
  };
  /** Its end: the cut ends of the stalks, a stipple. */
  const end = (_u: number, v: number, _w: number, h: number, px: number, py: number): string => {
    if (v === 0) return STRAW[3];
    if (v >= h - 1) return STRAW[0];
    const g = hash(px, py, 364);
    return g < 0.2 ? STRAW[3] : g < 0.65 ? STRAW[2] : STRAW[1];
  };
  iso.box(-A, -B, A, B, 0, 17, {
    top: (u, v) => {
      if (TWINE.some((t) => Math.abs(u - t) < 0.03)) return ROPE_DARK[1];
      const g = hash(Math.floor(u * 9 + v * 3), Math.floor(v * 14), 361);
      return v < 0.08 ? STRAW[4] : g < 0.3 ? STRAW[4] : g < 0.85 ? STRAW[3] : STRAW[2];
    },
    left: along(true),
    right: end,
  });
  // stray stalks: out of its top along it, and out of its end
  for (let i = 0; i < 9; i++) {
    const [x, y] = iso.at(-A + 0.04 + hash(i, 1, 362) * (2 * A - 0.08), -B + 0.04 + hash(i, 5, 362) * (2 * B - 0.08), 17);
    const L = 4 + hash(i, 3, 362) * 4;
    b.line(Math.round(x), Math.round(y), Math.round(x + L), Math.round(y + (hash(i, 2, 362) - 0.7) * 3), hash(i, 4, 362) < 0.5 ? STRAW[4] : STRAW[3]);
  }
  for (let i = 0; i < 5; i++) {
    const [x, y] = iso.at(A, -B + 0.04 + hash(i, 6, 362) * (2 * B - 0.08), 3 + hash(i, 7, 362) * 12);
    b.line(Math.round(x), Math.round(y), Math.round(x + 3 + hash(i, 8, 362) * 3), Math.round(y - 1 + hash(i, 9, 362) * 3), STRAW[2]);
  }
  return compose(null, [b], null).sprite(ox, oy, GRAIN);
}
/** Cord, dark. */
const ROPE_DARK = ['#16121c', '#2a2430'] as const;

/** A WATER JUG of fired clay: a round belly, a narrow neck and lip, a handle, a chip out of the lip. 32 x 46 at (16, 41). */
function waterJug(): Sprite {
  const W = 32;
  const H = 46;
  const cx = 16;
  const foot = 41;
  const top = 10;
  const body = new Px(W, H);
  const hand = new Px(W, H);
  const half = (t: number): number => (t < 0.18 ? 3.6 - t * 3 : t < 0.32 ? 3.1 + (t - 0.18) * 22 : 6.2 + 4.2 * Math.sin(((t - 0.32) / 0.68) * Math.PI * 0.95));
  lit(body, CLAY, [1, 3], [1, 4], (l) => column(l, cx, top, foot - 1, half));
  body.ellipse(cx, top, 3.6, 1.2, CLAY[3]);
  body.ellipse(cx, top + 0.3, 2.2, 0.7, DEEP);
  body.set(cx + 2, top - 1, INK);
  // the handle, from the neck to the shoulder
  for (let a = -1.2; a <= 1.4; a += 0.1) hand.set(Math.round(cx + 6 + Math.cos(a) * 4), Math.round(top + 9 + Math.sin(a) * 6), a < 0 ? CLAY[3] : CLAY[2]);
  // a band of dull grey slip round its belly
  for (let x = cx - 9; x <= cx + 9; x++) if (body.has(x, foot - 13)) body.set(x, foot - 13, body.get(x, foot - 13) === CLAY[3] ? CLAY[2] : CLAY[1]);
  return compose(null, [hand, body], null).sprite(cx, foot, GRAIN);
}

/** A MEAL SACK, near empty: slumped on itself, tied at its neck, its cloth fallen in folds. 36 x 40 at (18, 35). */
function mealSack(): Sprite {
  const W = 36;
  const H = 40;
  const cx = 18;
  const foot = 35;
  const p = new Px(W, H);
  const half = (t: number): number => (t < 0.22 ? 2.5 + t * 6 : 4 + 9.5 * Math.sin(((t - 0.22) / 0.78) * Math.PI * 0.62) ** 0.7);
  lit(p, SACK, [1, 3], [1, 4], (l) => {
    column(l, cx, foot - 26, foot - 1, half);
    l.ellipse(cx + 1, foot - 2, 13, 3, INK);
  });
  // its folds, slumped
  for (const [x0, y0, x1, y1] of [[cx - 6, foot - 12, cx - 3, foot - 3], [cx + 3, foot - 14, cx + 6, foot - 4], [cx - 1, foot - 18, cx, foot - 9]] as const) p.line(x0, y0, x1, y1, SACK[1]);
  // the cord at its neck, its ends hanging
  for (let x = cx - 3; x <= cx + 3; x++) p.set(x, foot - 22, ROPE_DARK[1]);
  p.line(cx + 2, foot - 22, cx + 4, foot - 17, ROPE_DARK[1]);
  // its mouth, tied above the cord
  for (let y = foot - 27; y < foot - 22; y++) for (let x = cx - 2 - (foot - 22 - y) * 0.4; x <= cx + 2 + (foot - 22 - y) * 0.4; x++) p.set(Math.round(x), y, y === foot - 27 ? SACK[3] : SACK[2]);
  return compose(null, [p], null).sprite(cx, foot, GRAIN);
}

/** A BOX OF IRONS: a small chest of planks bound in iron straps at its corners, spare cuffs and a chain's end hung over its side. 52 x 44 at (26, 34). */
function ironsBox(): Sprite {
  const W = 52;
  const H = 44;
  const ox = 26;
  const oy = 34;
  const b = new Px(W, H);
  const iso = new Iso(b, ox, oy);
  const A = 0.24;
  const B = 0.17;
  const planked = (lit_: boolean) => (u: number, v: number, w: number, h: number): string => {
    if (u <= 1 || u >= w - 2) return lit_ ? (u <= 1 ? IRONS[3] : IRONS[2]) : IRONS[1];
    if (v === 0) return lit_ ? TIMBER[3] : TIMBER[2];
    if (v >= h - 1) return TIMBER[0];
    if (v % 5 === 0) return lit_ ? TIMBER[1] : TIMBER[0];
    return lit_ ? TIMBER[2] : mix(TIMBER[0], TIMBER[2], 0.4);
  };
  iso.box(-A, -B, A, B, 0, 13, { top: (u, v) => (Math.abs(((u * 3) % 1) - 0.5) > 0.44 ? TIMBER[1] : v < 0.12 || u < 0.08 ? TIMBER[4] : TIMBER[3]), left: planked(true), right: planked(false) });
  // a cuff and its chain hung over its near side
  const c = new Px(W, H);
  const [x0, y0] = iso.at(-0.02, B, 13);
  chainAlong(c, [[x0, y0], [x0 - 2, y0 + 6], [x0 - 1, y0 + 10]], SMALL_IRON, 0.6);
  ironRing(c, x0 + 6, y0 - 2, 4.2, 1.8, SMALL_IRON, 0.55);
  return compose(null, [b, c], null).sprite(ox, oy, GRAIN);
}

/** WHAT A BREAKABLE LEAVES, on the floor where it stood: spread in an oval twice as wide as deep. */
function brokenOf(kind: 'bale' | 'jug' | 'sack' | 'box'): Sprite {
  const W = 60;
  const H = 36;
  const cx = 30;
  const cy = 20;
  const p = new Px(W, H);
  const under = new Px(W, H);
  const strewn = (n: number, rx: number, ry: number, seed: number, tones: readonly string[]): void => {
    for (let i = 0; i < n; i++) {
      const a = hash(i, 1, seed) * Math.PI * 2;
      const r = Math.sqrt(hash(i, 2, seed));
      const x = cx + Math.cos(a) * r * rx;
      const y = cy + Math.sin(a) * r * ry;
      const ang = hash(i, 3, seed) * Math.PI;
      const L = 2 + hash(i, 4, seed) * 4;
      under.line(Math.round(x), Math.round(y), Math.round(x + Math.cos(ang) * L), Math.round(y + Math.sin(ang) * L * 0.5), tones[i % tones.length]);
    }
  };
  if (kind === 'bale') {
    strewn(70, 22, 9, 363, [STRAW[3], STRAW[2], STRAW[2], STRAW[4]]);
    // the cut cords
    for (const [x, y, d] of [[cx - 10, cy - 2, 1], [cx + 6, cy + 3, -1]] as const) for (let k = 0; k < 9; k++) p.set(x + k, y + Math.round(Math.sin(k * 0.8) * d), ROPE_DARK[1]);
  } else if (kind === 'jug') {
    under.ellipse(cx, cy + 1, 14, 4.4, STAIN[1]);
    under.ellipse(cx - 2, cy, 9, 2.6, STAIN[0]);
    for (const [x, y, w, h, k] of [[cx - 13, cy - 4, 6, 4, 0], [cx + 4, cy - 5, 7, 5, 1], [cx - 3, cy + 3, 5, 3, 2], [cx + 12, cy + 1, 4, 3, 3]] as const) {
      lit(p, [CLAY[1], CLAY[1], CLAY[3], CLAY[4], CLAY[4]], [1, 2], [1, 2], (l) => l.poly([[x, y + 1], [x + 2 + k % 2, y], [x + w, y + 1], [x + w - 1, y + h], [x + 1, y + h]], INK));
    }
    // the neck, whole, on its side
    lit(p, CLAY, [1, 2], [1, 2], (l) => l.rect(cx + 8, cy - 9, 6, 3, INK));
  } else if (kind === 'sack') {
    lit(p, SACK, [1, 2], [1, 3], (l) => l.poly([[cx - 16, cy - 2], [cx - 4, cy - 6], [cx + 12, cy - 3], [cx + 15, cy + 3], [cx - 2, cy + 5], [cx - 14, cy + 3]], INK));
    p.line(cx - 10, cy - 1, cx + 6, cy + 1, SACK[1]);
    // the tear, and a few husks out of it
    p.line(cx + 3, cy - 4, cx + 9, cy + 2, DEEP);
    strewn(8, 10, 4, 364, [STRAW[2], STRAW[3]]);
  } else {
    const staves = (list: ReadonlyArray<readonly [number, number, number, 1 | -1]>): void => {
      for (const [x, y, len, way] of list) for (let k = 0; k < len; k++) {
        const xx = x + (way > 0 ? k : -k);
        const yy = y + Math.floor(k / 2);
        p.set(xx, yy, TIMBER[3]).set(xx, yy + 1, TIMBER[2]).set(xx, yy + 2, TIMBER[0]);
      }
    };
    staves([[cx - 19, cy - 4, 11, 1], [cx + 2, cy + 3, 12, 1], [cx + 9, cy - 8, 9, 1]]);
    const c = new Px(W, H);
    ironRing(c, cx - 3, cy - 2, 4.6, 2.2, SMALL_IRON, 0.55, [-1.2, 0.5]);
    chainAlong(c, [[cx + 6, cy + 9], [cx + 12, cy + 6], [cx + 18, cy + 9], [cx + 24, cy + 7]], SMALL_IRON, 0.6);
    p.blit(compose(null, [c], null), 0, 0);
  }
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// ON THE FLOOR: lying along its lines, at the middle of their floor

/** A BURST CUFF: one of his wrist-irons lying open on the floor, sprung apart at its hinge: two thick half rounds of iron, their tops lit and their sides in shade, splayed; a rivet glinting at the hinge; links of its chain still on one. */
function burstCuff(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  for (const [cx, cy, a0, a1] of [[LCX - 7, LCY - 1, 1.0, 4.3], [LCX + 6, LCY + 3, -1.8, 1.5]] as const) {
    for (let h = 4; h >= 0; h--) {
      for (let a = a0; a <= a1; a += 0.02) {
        for (let r = 6; r <= 10.5; r += 0.4) {
          const x = cx + Math.cos(a) * r * 1.35;
          const y = cy + Math.sin(a) * r * 0.62 - h;
          const top = h === 4;
          p.set(Math.round(x), Math.round(y), top ? (r > 9.9 || r < 6.6 ? SMALL_IRON[3] : Math.sin(a) < 0.1 ? SMALL_IRON[4] : SMALL_IRON[3]) : Math.sin(a) > 0 ? SMALL_IRON[2] : SMALL_IRON[1]);
        }
      }
    }
  }
  rivet(p, LCX - 1, LCY - 9, SMALL_IRON);
  p.set(LCX - 1, LCY - 9, GLINT);
  const c = new Px(LCX * 2, LCY * 2);
  chainAlong(c, [[LCX + 18, LCY + 3], [LCX + 24, LCY], [LCX + 30, LCY + 2]], SMALL_IRON, 0.85);
  return compose(null, [p, c], null).sprite(LCX, LCY, GRAIN);
}

/** A BALL AND ITS CHAIN: one of the iron balls the prisoners dragged, its chain trailing off along the floor to an open cuff. Stands up off the floor. 64 x 40 at (24, 30). */
function ballAndChain(): Sprite {
  const W = 64;
  const H = 40;
  const cx = 24;
  const cy = 30;
  const c = new Px(W, H);
  chainAlong(c, [[cx + 6, cy - 4], [cx + 14, cy - 1], [cx + 22, cy + 2], [cx + 30, cy + 2]], SMALL_IRON, 0.8);
  ironRing(c, cx + 35, cy + 1, 5, 2, SMALL_IRON, 0.55, [-0.4, 0.45]);
  const b = new Px(W, H);
  ironBall(b, cx, cy - 8, 8.5, IRONS, 1);
  // its eye, where the chain is fast
  ironRing(b, cx + 7, cy - 6, 2.2, 1.2, SMALL_IRON);
  return compose(null, [c, b], null).sprite(cx, cy, GRAIN);
}

/** A SNAPPED CHAIN: a length of heavy chain lying in an S along the floor, one link burst open at its end, two loose links by it. */
function snappedChain(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  const pts: [number, number][] = [];
  for (let k = 0; k <= 30; k++) {
    const t = k / 30;
    pts.push([LCX - 24 + 46 * t, LCY + Math.sin(t * Math.PI * 2) * 6 + t * 4 - 2]);
  }
  chainAlong(p, pts, SMALL_IRON, 0.85);
  // the burst link, and two loose
  ironRing(p, LCX + 26, LCY + 3, 3, 1.3, SMALL_IRON, 0.7, [0, 0.6]);
  link(p, LCX + 18, LCY + 10, 0.8, 0.6, true, SMALL_IRON, 0.85);
  link(p, LCX - 14, LCY + 9, 1, -0.2, false, SMALL_IRON, 0.85);
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** A BOWL KICKED OVER: a big wooden bowl lying on its side where it was kicked, its mouth turned to us, the dark inside it, its lit rim round it; its spoon flung away by it; licked clean. */
function bowlKicked(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  const bx = LCX - 5;
  const by = LCY - 3;
  // its belly behind the rim, round to the right
  lit(p, BOWL_WOOD, [1, 2], [1, 3], (l) => l.ellipse(bx + 3, by, 7.5, 6.5, INK));
  // the rim, an upright oval, lit on its upper left, and the dark inside it
  for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) {
    const r = (x / 5.4) ** 2 + (y / 6.6) ** 2;
    if (r > 1) continue;
    p.set(bx + x, by + y, r > 0.62 ? (x + y < 0 ? BOWL_WOOD[4] : BOWL_WOOD[2]) : y > 2 ? '#1a1220' : '#120d1a');
  }
  // the spoon, flung away
  limb(p, LCX + 9, LCY + 6, LCX + 18, LCY + 2, 0.9, 0.9, BOWL_WOOD);
  p.ellipse(LCX + 20, LCY + 1, 2.8, 1.6, BOWL_WOOD[3]);
  p.ellipse(LCX + 20, LCY + 1.3, 1.6, 0.8, BOWL_WOOD[1]);
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** HIS PALLET: a heap of old straw flattened on the floor where he lay, roughly long and square, its stalks every way and its edges ragged with strays; a rough grey blanket thrown over the half of it, rumpled, its edge wavering, a fold or two across it, its near corner turned back. */
function strawPallet(): Sprite {
  const p = lying((l, under) => {
    // the straw: a flat mat, its edge ragged by a pixel or two, its stalks lying mostly along it, a few strays out of its ends
    const X0 = LCX - 25;
    const X1 = LCX + 22;
    const Y0 = LCY - 9;
    const Y1 = LCY + 9;
    for (let y = Y0; y <= Y1; y++) {
      const e0 = X0 + Math.floor(hash(y, 1, 365) * 3);
      const e1 = X1 - Math.floor(hash(y, 2, 365) * 3);
      for (let x = e0; x <= e1; x++) {
        const g = hash(Math.floor((x + (y % 3) * 2) / 4), y, 366);
        under.set(x, y, y === Y0 || x === e0 ? STRAW[4] : y === Y1 || x === e1 ? STRAW[1] : g < 0.2 ? STRAW[4] : g < 0.62 ? STRAW[3] : STRAW[2]);
      }
    }
    for (let i = 0; i < 10; i++) {
      const left = i % 2 === 0;
      const y = Y0 + 2 + Math.floor(hash(i, 1, 367) * (Y1 - Y0 - 4));
      const x = left ? X0 + 1 : X1 - 1;
      under.line(x, y, x + (left ? -3 : 3) - Math.floor(hash(i, 2, 367) * 2) * (left ? 1 : -1), y + Math.round((hash(i, 3, 367) - 0.5) * 3), STRAW[3]);
    }
    // the blanket over the right of it: its edge wavering, rumpled (soft swells lit toward the light), a fold across it, its near corner turned back
    const edge = (y: number): number => LCX - 4 + Math.round(Math.sin((y - LCY) * 0.5) * 2 + Math.sin(y * 1.3) * 0.6);
    const far = (x: number): number => LCY - 10 + Math.round(Math.sin(x * 0.45) * 1.2);
    const near = (x: number): number => LCY + 10 - Math.round(Math.sin(x * 0.37 + 1) * 1.2);
    for (let x = LCX - 8; x <= LCX + 24; x++) {
      for (let y = far(x); y <= near(x); y++) {
        if (x < edge(y) || x > LCX + 22 + Math.round(Math.sin(y * 0.7) * 1.5)) continue;
        if (x > LCX + 22 - (y - LCY - 5) * 2 && y > LCY + 5) continue;
        const h = Math.sin((x - LCX) * 0.28 + Math.sin(y * 0.4)) * 0.6 + Math.sin((y - LCY) * 0.35 + x * 0.05) * 0.4;
        const hl = Math.sin((x - 1 - LCX) * 0.28 + Math.sin((y - 1) * 0.4)) * 0.6 + Math.sin((y - 1 - LCY) * 0.35 + (x - 1) * 0.05) * 0.4;
        const top = x === edge(y) || y === far(x);
        l.set(x, y, top ? BLANKET[4] : y === near(x) ? BLANKET[1] : h - hl > 0.12 ? BLANKET[1] : h - hl < -0.12 ? BLANKET[3] : BLANKET[2]);
      }
    }
    // the corner turned back: its underside, paler, a triangle
    for (let k = 0; k <= 5; k++) for (let j = 0; j <= 5 - k; j++) l.set(LCX + 22 - (5 - k) * 2 + j, LCY + 5 + k, k === 0 || j === 0 ? BLANKET[4] : BLANKET[3]);
  });
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** A TORN-OUT BAR: one of the cell's bars wrenched out of its sill, lying on the floor: a straight round bar of iron with one sharp kink where it was bent, one end snapped jagged, the other still in a lump of the mortar it was set in. */
function tornBar(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  // along the floor's line (+x: right and down), kinked a third of the way along
  const A: V2 = [LCX - 22, LCY - 6];
  const K: V2 = [LCX - 8, LCY + 1];
  const E: V2 = [LCX + 20, LCY + 3];
  limb(p, A[0], A[1], K[0], K[1], 1.7, 1.7, IRONS);
  limb(p, K[0], K[1], E[0], E[1], 1.7, 1.7, IRONS);
  // the kink: a bright crease on its outside
  p.set(Math.round(K[0]), Math.round(K[1]) - 2, GLINT).set(Math.round(K[0]) - 1, Math.round(K[1]) - 2, IRONS[3]);
  // the snapped end: jagged
  for (const [dx, dy] of [[-1, -2], [-2, 0], [-1, 1], [-3, -1]] as const) p.set(Math.round(A[0]) + dx, Math.round(A[1]) + dy, IRONS[1]);
  p.set(Math.round(A[0]) - 2, Math.round(A[1]) - 1, IRONS[3]);
  // the lump of mortar on the other end, torn out with it: jagged and broken-cornered, a crack across
  // it, crumbs of it by it (the second fresh look found a round knob reading as a drumstick)
  lit(p, STONE, [1, 2], [1, 2], (l) => l.poly([[E[0] - 3, E[1] - 3], [E[0] + 1, E[1] - 7], [E[0] + 3, E[1] - 5], [E[0] + 7, E[1] - 8], [E[0] + 10, E[1] - 3], [E[0] + 8, E[1] - 1], [E[0] + 11, E[1] + 2], [E[0] + 6, E[1] + 5], [E[0] + 3, E[1] + 3], [E[0], E[1] + 5], [E[0] - 3, E[1] + 1]], INK));
  for (const [dx, dy] of [[4, -6], [5, -5], [5, -4], [6, -3], [7, -2]] as const) p.set(Math.round(E[0]) + dx, Math.round(E[1]) + dy, INK);
  for (const [dx, dy] of [[13, 4], [14, 4]] as const) p.set(Math.round(E[0]) + dx, Math.round(E[1]) + dy, STONE[2]);
  p.set(Math.round(E[0]) + 13, Math.round(E[1]) + 5, STONE[0]);
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}


// =================================================================================================
// STANDING THINGS, built on the grid; anchored at the middle of their tile

/** A view of a thing in the world from (cx, cy) on the picture: its own forward, left and up as ways in the world (x, y across the floor, z up). Where a point of it is seen, how near, and which way a way in it faces as seen. */
function worldView(cx: number, cy: number, F: V3, L: V3, U: V3): { view: View; seen: (w: V3) => V3; world: (q: V3) => V3 } {
  const world = (q: V3): V3 => [q[0] * F[0] + q[1] * L[0] + q[2] * U[0], q[0] * F[1] + q[1] * L[1] + q[2] * U[1], q[0] * F[2] + q[1] * L[2] + q[2] * U[2]];
  const seen = (w: V3): V3 => norm3([(w[0] - w[1]) * 0.8, (w[0] + w[1]) * 0.4 - w[2], dot3(w, TOWARD)]);
  return {
    world,
    seen,
    view: (q) => {
      const w = world(q);
      const [x, y] = onPic(w[0], w[1], w[2]);
      return [cx + x, cy + y, dot3(w, TOWARD)];
    },
  };
}

/**
 * THE CAGE: a prisoner's cage of heavy iron a tile across and a head taller than a man, stood on the
 * floor of the cell block: a band of flat iron at its foot and its head, four thick bars to a side,
 * each run up through the head band to a point, three bars across its top; its floor dark, old straw
 * and a length of chain on it; its door on its near side swung wide open on its hinges, the great
 * lock on its edge hanging open. (The first fresh look found thin bars all round reading as a phone
 * box or a locker: the bars are few and thick and pointed, the door stands wide.) 104 x 128 at (52, 104).
 */
function ironCage(): Sprite {
  const W = 104;
  const H = 128;
  const ox = 52;
  const oy = 104;
  const A = 0.42;
  const TOP = 66;
  const SPIKE = 7;
  const back = new Px(W, H);
  const mid_ = new Px(W, H);
  const front = new Px(W, H);
  const bi = new Iso(back, ox, oy);
  const fi = new Iso(front, ox, oy);
  // its floor, dark; straw on it, and a chain
  bi.top(-A, -A, A, A, 0, (u, v) => (hash(Math.floor(u * 8), Math.floor(v * 8), 372) < 0.5 ? '#100d20' : '#151229'));
  // (old straw in soft tufts, trodden into a mat at the back: no single stalks)
  for (const [u, v, rx, ry, seed] of [[-0.12, -0.18, 15, 6.5, 4], [0.2, 0.12, 9, 4, 5], [-0.26, 0.18, 7, 3.2, 6]] as const) {
    const [px, py] = bi.at(u, v, 1);
    strawTuft(mid_, px, py, rx, ry, seed);
  }
  const [c0x, c0y] = bi.at(-0.3, -0.25, 1);
  const [c1x, c1y] = bi.at(0.1, 0.05, 1);
  const [c2x, c2y] = bi.at(0.28, -0.2, 1);
  chainAlong(mid_, [[c0x, c0y], [c1x, c1y], [c2x, c2y]], DIM_IRON, 0.8);
  /** A thick bar up from (x, y) on the floor through the head band to a point: lit on its left, dark on its right; dark on the far sides. */
  const bar = (iso: Iso, p: Px, x: number, y: number, far: boolean, z0 = 3, z1 = TOP + SPIKE, shade = false): void => {
    const [x0, y0] = iso.at(x, y, z0);
    const [, y1] = iso.at(x, y, z1);
    const X = Math.round(x0);
    for (let Y = Math.round(y1); Y <= Math.round(y0); Y++) {
      const tip = Y < Math.round(y1) + 3;
      const l = far ? IRONS[2] : shade ? IRONS[2] : IRONS[3];
      const m = far ? IRONS[1] : shade ? IRONS[1] : IRONS[2];
      if (tip) p.set(X, Y, Y === Math.round(y1) ? l : m).set(X + (Y > Math.round(y1) + 1 ? 1 : 0), Y, IRONS[0]);
      else p.set(X - 1, Y, l).set(X, Y, m).set(X + 1, Y, IRONS[0]);
    }
  };
  /** A flat band of iron round the cage at height z: its far two sides dark, its near two lit. */
  const band = (iso: Iso, z: number, far: boolean): void => {
    if (far) {
      iso.box(-A, -A, A, -A + 0.03, z, z + 4, { top: () => IRONS[2], left: () => IRONS[1], right: () => IRONS[0] });
      iso.box(-A, -A, -A + 0.03, A, z, z + 4, { top: () => IRONS[2], left: () => IRONS[1], right: () => IRONS[0] });
    } else {
      iso.box(-A, A - 0.03, A, A, z, z + 4, { top: () => IRONS[3], left: litSide(IRONS), right: shadeSide(IRONS) });
      iso.box(A - 0.03, -A, A, A, z, z + 4, { top: () => IRONS[2], left: litSide(IRONS), right: shadeSide(IRONS) });
    }
  };
  band(bi, 0, true);
  band(bi, TOP, true);
  for (let k = 0; k <= 3; k++) {
    const t = -A + (k * 2 * A) / 3;
    bar(bi, back, t, -A, true);
    bar(bi, back, -A, t, true);
  }
  // the three bars across its top
  for (const t of [-0.21, 0, 0.21]) {
    const [x0, y0] = bi.at(-A, t, TOP + 4);
    const [x1, y1] = bi.at(A, t, TOP + 4);
    back.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), IRONS[2]);
    back.line(Math.round(x0), Math.round(y0) + 1, Math.round(x1), Math.round(y1) + 1, IRONS[0]);
  }
  // the near sides: the side toward screen-right all bars; the side toward screen-left its corner bars and the doorway between them
  band(fi, 0, false);
  band(fi, TOP, false);
  for (let k = 0; k <= 3; k++) bar(fi, front, A, -A + (k * 2 * A) / 3, false, 3, TOP + SPIKE, true);
  bar(fi, front, -A, A, false);
  // the door: hung from the corner bar, swung wide open out toward us; its frame, its bars, its lock hanging open
  const door = new Px(W, H);
  const di = new Iso(door, ox, oy);
  const swing = 1.15;
  const doorW = 2 * A - 0.06;
  const at = (s: number): [number, number] => [-A + 0.03 + s * Math.cos(swing) * doorW, A + s * Math.sin(swing) * doorW];
  for (const s of [1 / 3, 2 / 3, 1]) {
    const [x, y] = at(s);
    bar(di, door, x, y, false, 4, TOP - 1);
  }
  for (const z of [4, TOP - 4, 34]) {
    const [x0, y0] = di.at(...at(0), z);
    const [x1, y1] = di.at(...at(1), z);
    door.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), IRONS[3]);
    door.line(Math.round(x0), Math.round(y0) + 1, Math.round(x1), Math.round(y1) + 1, IRONS[1]);
  }
  const [lx, ly] = di.at(...at(1), 30);
  door.rect(Math.round(lx) - 2, Math.round(ly), 5, 6, IRONS[3]);
  door.rect(Math.round(lx) - 1, Math.round(ly) + 1, 3, 4, IRONS[2]);
  for (let a = Math.PI; a <= Math.PI * 1.75; a += 0.15) door.set(Math.round(lx + 0.5 + Math.cos(a) * 2.5), Math.round(ly + Math.sin(a) * 3), IRONS[3]);
  return compose(null, [back, mid_, front, door], null).sprite(ox, oy, GRAIN);
}

/** THE CHAIN POST: a squat post of dressed stone, a staple in its near face and a great ring on it, a heavy chain from the ring down to the floor, wound once round the post's foot and off across the floor to an open cuff. 104 x 76 at (52, 56). */
function chainPost(): Sprite {
  const W = 104;
  const H = 76;
  const ox = 52;
  const oy = 56;
  const s = new Px(W, H);
  const iso = new Iso(s, ox, oy);
  block(iso, STONE, -0.13, -0.13, 0.13, 0.13, 0, 30);
  block(iso, STONE, -0.15, -0.15, 0.15, 0.15, 30, 34);
  const c = new Px(W, H);
  const [rx, ry] = iso.at(-0.03, 0.13, 22);
  rivet(c, Math.round(rx) - 1, Math.round(ry) - 2, SMALL_IRON);
  ironRing(c, rx, ry + 4, 5, 2.1, SMALL_IRON);
  // the chain: from the ring's foot down to the floor, round the post's foot on its near sides, and off across the floor
  const pts: [number, number][] = [[rx, ry + 9]];
  const [d0x, d0y] = iso.at(-0.08, 0.2, 0);
  pts.push([d0x, d0y - 1]);
  for (let k = 0; k <= 8; k++) {
    const a = Math.PI * 0.75 - (k / 8) * Math.PI * 0.9;
    const [x, y] = iso.at(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0);
    pts.push([x, y]);
  }
  const [e0x, e0y] = iso.at(0.42, 0.2, 0);
  const [e1x, e1y] = iso.at(0.7, 0.55, 0);
  pts.push([e0x, e0y], [e1x, e1y]);
  chainAlong(c, pts, SMALL_IRON, 0.85);
  ironRing(c, e1x + 5, e1y + 2, 4.6, 2, SMALL_IRON, 0.55, [0.3, 0.45]);
  return compose(null, [s, c], null).sprite(ox, oy, GRAIN);
}

/** THE FEED TROUGH: a long trough of planks along x on two trestle feet, its sides leaning out, its ends boarded, empty and dry, a scrap or two left in its bottom; iron straps at its ends. 84 x 48 at (42, 34). */
function feedTrough(): Sprite {
  const W = 84;
  const H = 48;
  const ox = 42;
  const oy = 34;
  const back = new Px(W, H);
  const mid_ = new Px(W, H);
  const front = new Px(W, H);
  const bi = new Iso(back, ox, oy);
  const fi = new Iso(front, ox, oy);
  const A = 0.4;
  const Z0 = 5;
  const Z1 = 15;
  const BOT = 0.07;
  const TOP = 0.16;
  // the trestle feet at its ends: an X of timber each, under it
  for (const x of [-A + 0.07, A - 0.07]) {
    const iso = x < 0 ? bi : fi;
    const p = x < 0 ? back : front;
    for (const s of [-1, 1]) {
      const [x0, y0] = iso.at(x, s * TOP, 0);
      const [x1, y1] = iso.at(x, -s * BOT, Z0 + 2);
      limb(p, x0, y0, x1, y1, 1.2, 1.2, TIMBER);
    }
  }
  // the far side, leaning out (seen from inside, in shade), and the bottom inside it
  bi.quad(bi.at(-A, -BOT, Z0), bi.at(A, -BOT, Z0), bi.at(A, -TOP, Z1), bi.at(-A, -TOP, Z1), (t, s_) => (t > 0.85 ? TIMBER[3] : Math.floor(t * 3) !== Math.floor((t + 0.06) * 3) ? TIMBER[0] : hash(Math.floor(s_ * 9), 1, 371) < 0.3 ? mix(TIMBER[0], TIMBER[2], 0.6) : mix(TIMBER[0], TIMBER[2], 0.4)));
  bi.top(-A, -BOT, A, BOT, Z0, (u) => (Math.abs(u - 0.3) < 0.02 || Math.abs(u - 0.62) < 0.03 ? STRAW[2] : '#16101c'));
  // its ends, boarded (the far end inside, in shade)
  bi.slopeRight(-A, -BOT, BOT, Z0, -A, -TOP, TOP, Z1, (t) => (t > 0.85 ? TIMBER[3] : TIMBER[1]));
  // the near side, leaning out toward us, lit; its planks
  fi.quad(fi.at(-A, BOT, Z0), fi.at(A, BOT, Z0), fi.at(A, TOP, Z1), fi.at(-A, TOP, Z1), (t, s_) => (t > 0.86 ? TIMBER[4] : t < 0.1 ? TIMBER[1] : Math.floor(t * 3) !== Math.floor((t + 0.07) * 3) ? TIMBER[1] : s_ < 0.02 ? TIMBER[4] : TIMBER[3]));
  // the near end, in shade
  fi.slopeRight(A, -BOT, BOT, Z0, A, -TOP, TOP, Z1, (t) => (t > 0.85 ? TIMBER[2] : mix(TIMBER[0], TIMBER[2], 0.5)));
  // iron straps round its ends
  for (const x of [-A + 0.03, A - 0.04]) {
    const [a0, b0] = fi.at(x, BOT, Z0);
    const [a1, b1] = fi.at(x, TOP, Z1);
    mid_.line(Math.round(a0), Math.round(b0), Math.round(a1), Math.round(b1), IRONS[2]);
  }
  return compose(null, [back, front, mid_], null).sprite(ox, oy, GRAIN);
}

/** THE GREAT WINCH: two trestles of timber, a drum between them turning on an iron axle, a crank at each end; its chain wound on the drum and run off it down to the floor and away. What his chains were hauled in by. 112 x 84 at (56, 60). */
function greatWinch(): Sprite {
  const W = 112;
  const H = 84;
  const ox = 56;
  const oy = 60;
  const back = new Px(W, H);
  const drum = new Px(W, H);
  const front = new Px(W, H);
  const bi = new Iso(back, ox, oy);
  const fi = new Iso(front, ox, oy);
  const X = 0.36;
  const AX = 30;
  // the trestles: at each end two legs splayed along y, meeting at the axle, a foot beam
  for (const x of [-X, X]) {
    const iso = x < 0 ? bi : fi;
    const p = x < 0 ? back : front;
    for (const y of [-0.22, 0.22]) {
      const [x0, y0] = iso.at(x, y, 0);
      const [x1, y1] = iso.at(x, 0, AX + 4);
      limb(p, x0, y0, x1, y1, 1.8, 1.6, x < 0 && y < 0 ? darkened(TIMBER) : TIMBER);
    }
    block(iso, TIMBER, x - 0.04, -0.26, x + 0.04, 0.26, 0, 3);
  }
  // the drum: a round along x, its near side lit, iron bands, the chain wound on it
  const R = 8;
  for (let i = 0; i <= 120; i++) {
    const x = -X + 0.06 + (i / 120) * (2 * X - 0.12);
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      const y = (Math.cos(a) * R) / 32;
      const z = AX + Math.sin(a) * R;
      const [px, py] = new Iso(drum, ox, oy).at(x, y, z);
      // (its face toward us: y > 0 and up)
      const facing = Math.cos(a) * 0.6 + Math.sin(a) * 0.8;
      if (facing < -0.2) continue;
      const band = Math.abs(i - 10) < 2 || Math.abs(i - 110) < 2;
      const wound = i > 22 && i < 98 && Math.floor(i / 3) % 2 === 0;
      const tone = facing > 0.75 ? 3 : facing > 0.2 ? 2 : 1;
      drum.set(Math.round(px), Math.round(py), band ? IRONS[tone] : wound ? SMALL_IRON[Math.min(3, tone)] : TIMBER[tone]);
    }
  }
  // the cranks: out from the axle's ends along y, a handle on each
  for (const x of [-X - 0.03, X + 0.03]) {
    const iso = x < 0 ? bi : fi;
    const p = x < 0 ? back : front;
    const [a0x, a0y] = iso.at(x, 0, AX);
    const [a1x, a1y] = iso.at(x, x < 0 ? -0.05 : 0.05, AX - 12);
    limb(p, a0x, a0y, a1x, a1y, 1.1, 1.1, IRONS);
    limb(p, a1x, a1y, a1x + (x < 0 ? -6 : 6), a1y + 3, 1.3, 1.3, TIMBER);
  }
  // the chain off the drum's near side, down to the floor and away toward us
  const c = new Px(W, H);
  const [d0x, d0y] = fi.at(0.05, R / 32, AX);
  const [f0x, f0y] = fi.at(0.1, 0.42, 0);
  const [f1x, f1y] = fi.at(0.2, 0.9, 0);
  chainAlong(c, [[d0x, d0y], [f0x, f0y - 3], [(f0x + f1x) / 2, (f0y + f1y) / 2], [f1x, f1y]], SMALL_IRON, 0.8);
  return compose(null, [back, drum, front, c], null).sprite(ox, oy, GRAIN);
}

/** THE JAILERS' KETTLE: a ring of stones round a fire, three iron rods leaned together over it and a black kettle hung from them on a chain, the fire licking up round it: frame `f` of four. 64 x 84 at (32, 66). */
function jailersKettle(f: number): Sprite {
  const W = 64;
  const H = 84;
  const cx = 32;
  const foot = 66;
  const stones = new Px(W, H);
  const iron = new Px(W, H);
  const fire = new Px(W, H);
  const kettle = new Px(W, H);
  // the ring of stones: lumps round an oval, the far ones first
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.2;
    const x = cx + Math.cos(a) * 15;
    const y = foot - 3 + Math.sin(a) * 6;
    ball(stones, x, y, 3.4 + hash(k, 1, 380), 2.6, STONE);
  }
  // the coals in it
  for (let y = foot - 7; y <= foot; y++) for (let x = cx - 11; x <= cx + 11; x++) if (((x - cx) / 11) ** 2 + ((y - foot + 3) / 4) ** 2 <= 1) fire.set(x, y, hash(x, y + f * 5, 381) < 0.4 ? COAL[3] : COAL[2]);
  // the rods: three, leaned together over the fire
  const apex: V2 = [cx, foot - 58];
  for (const [x, y] of [[cx - 20, foot - 1], [cx + 19, foot - 4], [cx + 3, foot + 3]] as const) limb(iron, x, y, apex[0], apex[1], 1, 0.9, IRONS);
  // the chain down from where they meet, and the kettle on it: black iron, a lid, a spout
  for (let y = apex[1] + 2; y <= foot - 34; y++) iron.set(cx, y, (y % 3) === 0 ? IRONS[1] : IRONS[3]);
  for (let a = Math.PI; a <= Math.PI * 2; a += 0.1) iron.set(Math.round(cx + Math.cos(a) * 7), Math.round(foot - 26 + Math.sin(a) * 8), IRONS[2]);
  lit(kettle, IRONS, [1, 3], [1, 4], (l) => column(l, cx, foot - 26, foot - 13, (t) => 6.5 + 2.6 * Math.sin(t * Math.PI)));
  kettle.ellipse(cx, foot - 26, 6.5, 1.8, IRONS[3]);
  kettle.ellipse(cx, foot - 27, 2, 0.8, IRONS[4]);
  limb(kettle, cx + 7, foot - 20, cx + 12, foot - 25, 1.4, 0.9, IRONS);
  // the flames, up round its belly
  const flames: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
    [[-8, 9, 1], [-3, 13, 0], [3, 12, 1], [8, 8, -1]],
    [[-8, 10, 0], [-2, 12, 1], [4, 13, -1], [8, 9, 0]],
    [[-7, 8, 1], [-3, 14, -1], [2, 11, 0], [8, 10, -1]],
    [[-8, 11, -1], [-2, 11, 0], [3, 14, 1], [7, 8, 1]],
  ];
  for (const [dx, h, lean] of flames[f % 4]) tongue(fire, cx + dx, foot - 4, h, 2.6, lean, EMBER);
  const s = compose(null, [stones, iron, kettle], fire).sprite(cx, foot, GRAIN);
  s.lights = [{ x: cx / GRAIN, y: (foot - 10) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: 0.48 }];
  // (the kettle in front of the flames that rise behind it: its belly over them)
  return s;
}

/** THE ANVIL: a smith's anvil on a stump of timber, where the irons were riveted shut on them; its horn out to one side, a hammer leaned on the stump, rivets on the floor. 72 x 60 at (36, 46). */
function anvil(): Sprite {
  const W = 72;
  const H = 60;
  const ox = 36;
  const oy = 46;
  const wood = new Px(W, H);
  const iron = new Px(W, H);
  lit(wood, TIMBER, [1, 4], [1, 5], (l) => {
    column(l, ox, oy - 16, oy - 2, () => 10);
    l.ellipse(ox, oy - 2, 10, 3, INK);
  });
  wood.ellipse(ox, oy - 16, 10, 3.2, TIMBER[3]);
  wood.ellipse(ox, oy - 16, 6, 1.8, TIMBER[2]);
  const iso = new Iso(iron, ox, oy);
  // its foot, its waist, its face; the horn out along x
  block(iso, IRONS, -0.14, -0.1, 0.14, 0.1, 16, 20);
  block(iso, IRONS, -0.08, -0.05, 0.08, 0.05, 20, 25);
  block(iso, IRONS, -0.2, -0.09, 0.16, 0.09, 25, 31);
  const [h0x, h0y] = iso.at(0.16, 0, 28);
  limb(iron, h0x, h0y, h0x + 13, h0y + 4, 3, 0.8, IRONS);
  // a glint on its face's edge
  const [gx, gy] = iso.at(-0.1, 0.09, 31);
  iron.set(Math.round(gx), Math.round(gy), GLINT);
  // the hammer leaned on the stump
  limb(iron, ox + 12, oy - 1, ox + 6, oy - 20, 0.9, 0.9, TIMBER);
  limb(iron, ox + 2, oy - 22, ox + 10, oy - 18, 2, 2, IRONS);
  // rivets
  for (const [x, y] of [[ox - 16, oy + 3], [ox - 11, oy + 6], [ox + 15, oy + 5]] as const) rivet(iron, x, y, SMALL_IRON);
  return compose(null, [wood, iron], null).sprite(ox, oy, GRAIN);
}

/** A HEAP OF CHAINS: heavy chain dumped in a tangle, coil on coil, nearly knee high, ends hanging out of it. 80 x 52 at (40, 40). */
function heapOfChains(): Sprite {
  const W = 80;
  const H = 52;
  const ox = 40;
  const oy = 40;
  const layers: Px[] = [];
  // coils one over the other, each smaller and higher, from the far side round to the near
  for (let k = 0; k < 6; k++) {
    const c = new Px(W, H);
    const r = 20 - k * 2.6;
    const z = k * 3.6;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 28; i++) {
      const a = Math.PI * (1.15 + (i / 28) * 1.7) + k * 0.9;
      pts.push([ox + Math.cos(a) * r * 1.1 + (hash(k, 1, 390) - 0.5) * 4, oy - 4 - z + Math.sin(a) * r * 0.45]);
    }
    chainAlong(c, pts, SMALL_IRON, 0.8, k);
    layers.push(c);
  }
  // the ends hanging out of it, along the floor
  const e = new Px(W, H);
  chainAlong(e, [[ox + 10, oy - 6], [ox + 20, oy], [ox + 30, oy + 4]], SMALL_IRON, 0.8);
  chainAlong(e, [[ox - 12, oy - 2], [ox - 22, oy + 3], [ox - 28, oy + 8]], SMALL_IRON, 0.8, 1);
  // the near half of each coil over the heap under it
  return compose(null, [e, ...layers], null).sprite(ox, oy, GRAIN);
}

/** THE STONE BENCH: a long slab of dark stone along x on two squat blocks, where prisoners were sat in irons: two great rings on the slab's near edge, a leg-iron on a chain from each, and a slack chain between the two irons on the floor. 88 x 48 at (44, 34). */
function stoneBench(): Sprite {
  const W = 88;
  const H = 48;
  const ox = 44;
  const oy = 34;
  const s = new Px(W, H);
  const iso = new Iso(s, ox, oy);
  const DARK = darkened(STONE);
  // the blocks, then the slab over them
  for (const x of [-0.3, 0.22]) block(iso, darkened(DARK), x, -0.1, x + 0.1, 0.1, 0, 9);
  block(iso, DARK, -0.4, -0.14, 0.4, 0.14, 9, 14);
  const c = new Px(W, H);
  const cuffs: [number, number][] = [];
  for (const x of [-0.2, 0.12]) {
    const [rx, ry] = iso.at(x, 0.14, 11);
    rivet(c, Math.round(rx) - 1, Math.round(ry) - 1, SMALL_IRON);
    ironRing(c, rx, ry + 3, 3.4, 1.5, SMALL_IRON);
    const [cx, cy] = iso.at(x - 0.05, 0.45, 0);
    ironRing(c, cx, cy, 4.6, 2, SMALL_IRON, 0.55);
    chainAlong(c, [[rx, ry + 6], [cx + 2, cy - 5]], SMALL_IRON, 0.6);
    cuffs.push([cx, cy]);
  }
  chainAlong(c, [[cuffs[0][0] + 4, cuffs[0][1] + 1], [(cuffs[0][0] + cuffs[1][0]) / 2, (cuffs[0][1] + cuffs[1][1]) / 2 + 5], [cuffs[1][0] - 4, cuffs[1][1] + 1]], SMALL_IRON, 0.6);
  return compose(null, [s, c], null).sprite(ox, oy, GRAIN);
}

/** THE JAILERS' CHEST (the game's chest): old timber bound in iron, a great hasp and lock. */
const JAILERS_CHEST: TrunkLook = { a: 0.36, b: 0.24, rim: 14, rise: 6, wood: TIMBER, lid: TIMBER, metal: IRONS, stone: null, planks: [6, 11] };
function jailersChest(open: boolean): Sprite {
  return trunk(56, 64, 28, 48, JAILERS_CHEST, open).sprite(28, 48, GRAIN);
}

// =================================================================================================
// DOORS AND GATES

/**
 * THE DOOR'S LEAF on this floor: a cell door of iron plates riveted in rows, a grille of bars high in
 * it to look in through, a great bolt across it at the lock. As the game's leaf (art/gates.ts,
 * makeDoorLeaf): from its hinge (the anchor, on the floor) to its free end, (ex, ey) picture pixels
 * away along the floor.
 */
export function cellDoorLeaf(ex: number, ey: number, high = 56, inShade = false): Sprite {
  const pad = 6;
  const w = Math.abs(ex) + pad * 2;
  const h = high + Math.abs(ey) + pad * 2;
  const p = new Px(w, h);
  const ox = ex >= 0 ? pad : pad - ex;
  const oy = high + pad + (ey < 0 ? -ey : 0);
  const at = (t: number, up: number): [number, number] => [Math.round(ox + ex * t), Math.round(oy + ey * t - up)];
  const steps = Math.max(Math.abs(ex), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = at(t, 0);
    // (plates: their seams across, every third of it, and down its middle)
    const seamDown = Math.abs(t - 0.5) < 0.6 / steps;
    for (let up = 0; up < high; up++) {
      let c = t < 0.04 ? IRONS[3] : t > 0.96 ? IRONS[1] : IRONS[2];
      const row = up % 14;
      if (row === 0 || seamDown) c = IRONS[0];
      if (row === 1 && !seamDown) c = IRONS[3];
      // rivets along the seams
      if ((row === 2 || row === 12) && i % 4 === 2) c = GLINT;
      // the grille, high in it: bars down, dark between
      if (t > 0.28 && t < 0.72 && up >= high - 20 && up <= high - 9) c = Math.abs((((t - 0.28) * 14) % 1) - 0.5) < 0.2 ? IRONS[3] : DEEP;
      if (up === high - 1) c = IRONS[4];
      if (up === 0) c = IRONS[0];
      p.set(x, y - up, c);
    }
  }
  // the bolt: a heavy bar along it at the lock, its knob at the free end
  for (let i = Math.round(steps * 0.55); i <= steps; i++) {
    const [x, y] = at(i / steps, Math.round(high * 0.44));
    p.set(x, y, IRONS[4]).set(x, y + 1, IRONS[3]).set(x, y + 2, IRONS[1]);
  }
  const [kx, ky] = at(0.94, Math.round(high * 0.44) + 1);
  p.rect(kx - 1, ky - 2, 3, 4, IRONS[3]);
  return (inShade ? recolor(p, shaded) : p).sprite(ox, oy, GRAIN);
}
function leafOf(ex: number, ey: number): Sprite {
  const dx = (ex / 32 + ey / 16) / 2;
  const dy = (ey / 16 - ex / 32) / 2;
  return cellDoorLeaf(ex, ey, 56, Math.abs(dy) > Math.abs(dx));
}

/** THE MARK OVER THIS FLOOR'S GATES (art/gates.ts, a Mark): the ball and its chain cut in a roundel on the keystone, in stone, giving off no light. */
const ballMark: Mark = (x, y, st, _lit, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const S = 8.6;
  const c = ballAndChainAt(x / S, y / S);
  // (standing out of a sunk field: lit along the edges toward the light, its shadow on the field on the far side)
  if (c === 'ball') {
    const nx = (x / S - 0.3) / 0.46;
    const ny = (y / S + 0.36) / 0.46;
    const i = (lightLow ? nx : -nx) * -0.55 + ny * 0.75;
    return i > 0.3 ? st.light : i < -0.45 ? st.joint : st.body;
  }
  if (c === 'link') return ballAndChainAt((x + (lightLow ? -1 : 1)) / S, (y + 1) / S) === 'link' ? st.body : st.light;
  if (c === 'hole') return st.joint;
  // the field: sunk and dark, the shadow of what stands out of it falling on it
  if (ballAndChainAt((x - (lightLow ? -1.2 : 1.2)) / S, (y - 1.2) / S) !== null) return st.joint;
  return st.dark;
};
/** OVER HIS OWN GATE: his muzzled face cut in the stone, his eyes burning under his brow with the enemy's pink (as the game's boss gate has the Warden's). */
const cageMark: Mark = (x, y, st, lit_, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const S = 8.2;
  const T = 8.8;
  const px = 1 / (S * 1.35);
  const at = (dx: number, dy: number): MarkPart => muzzled((x + dx) / S, (y + 0.4 + dy) / T, px);
  const c = at(0, 0);
  // (the light's side: up, and along the plane toward its low end or its high one)
  const toward = lightLow ? -1 : 1;
  if (c === 'eye') {
    const core = Math.abs((y + 0.4) / T - 0.2) < 0.05 && Math.abs(Math.abs(x / S) - 0.3) < 0.09;
    return lit_ ? (core ? FLAME[4] : FLAME[3]) : core ? FLAME[2] : FLAME[1];
  }
  // (dark iron and straps over the face, the face between the bars in shade: never pale bars over dark gaps, which read as teeth)
  if (ironPart(c) || c === 'strap') return ironPart(at(toward * 0.74, 0.74)) || at(toward * 0.74, 0.74) === 'strap' ? st.joint : st.dark;
  if (c === 'buckle') return st.light;
  if (c === 'gap') return st.dark;
  if (c === 'brow') return st.dark;
  if (c === 'face' || c === 'nose') return at(toward * 0.74, 0.74) === null ? st.light : at(-toward * 0.74, -0.74) === null ? st.dark : st.odd;
  // the field: sunk and dark, the shadow of the head falling on it
  if (at(-toward * 0.9, -0.9) !== null) return st.joint;
  return st.dark;
};

let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): its stone, the ball and chain over its gates, his caged face over his own, its cell doors of riveted iron. */
export function chainedGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: ballMark, bossMark: cageMark, leaf: leafOf }));
}

// =================================================================================================
// QUESTS

/** His cage's iron: dark, a step under the old iron of what stands (the first fresh look found it pale lavender). */
const CAGE_IRON: Ramp = ['#110f24', '#16142c', '#2a2650', '#47437a', '#47437a'];
/** Its straps' old leather, as a ramp. */
const STRAP_RAMP: Ramp = [STRAP_LEATHER[0], STRAP_LEATHER[0], STRAP_LEATHER[1], STRAP_LEATHER[2], STRAP_LEATHER[2]];
/** HIS MUZZLE-CAGE, torn off him where he fell: the trophy for the armourer. The cage of dark iron lying on the floor, tipped back on its rim with its bands and uprights to the eye (his mark, as over his gate): open thin bars with wide gaps (the second fresh look found thick ones a catcher's mask), its middle band burst through and an upright snapped, its leather straps torn, one long and trailing with its buckle. 72 x 60 at (36, 50). */
function hisCage(): Sprite {
  const W = 72;
  const H = 60;
  const cx = 36;
  const foot = 50;
  const p = new Px(W, H);
  const deep = new Deep(p);
  const R = 18;
  const rods = muzzleRods(R, true);
  const straps = muzzleStraps(R, true);
  const { view: v0, turn } = frontView(cx, foot - 16, 22, 10);
  // (set down so that its lowest point is on the floor)
  let low = -Infinity;
  for (const r of [...rods, ...straps]) for (const q of [r.a, r.b]) low = Math.max(low, v0(q)[1] + r.r);
  const view: View = (q) => {
    const [x, y, d] = v0(q);
    return [x, y + (foot - 1 - low), d];
  };
  const normal = (q: V3): V3 => norm3(turn([q[0], q[1] / 0.86, R * 0.3]));
  paintRods(deep, straps, view, normal, STRAP_RAMP);
  paintRods(deep, rods, view, normal, CAGE_IRON);
  for (const q of muzzleRivets(R)) {
    const [x, y, d] = view(q);
    if (d > -R * 0.2) deep.put(Math.round(x), Math.round(y), d + R, RIVET_LIT);
  }
  // a buckle on the long strap
  {
    const a: V3 = [Math.cos(-104 * D2R) * R, Math.sin(-104 * D2R) * R * 0.86, -0.12 * R];
    const [x, y, d] = view(add3(a, [-R * 0.5, -R * 0.12, -R * 0.25]));
    for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] as const) deep.put(Math.round(x) + dx, Math.round(y) + dy, d + R, dy < 0 || dx < 0 ? RIVET_LIT : CAGE_IRON[2]);
  }
  return compose(null, [p], null).sprite(cx, foot, GRAIN);
}

// =================================================================================================
// THE SET

/**
 * WHERE EACH WALL PIECE MAY BE SET: its first spot, then others, (across, up) in picture pixels: low,
 * middle and high on the wall, and across it, each within its own tile's face and below where the
 * wall fades into the dark (his note on floor 1's: "I don’t like the wall panels all being in the
 * exact same spot").
 */
const SPOTS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  'bent bars': [[-2, -12], [3, -2], [-1, 7]],
  'claw-torn stone': [[3, -15], [-2, -5], [-3, 5]],
  'the feeding slot': [[4, -3], [-3, 24], [-3, 36]],
  'the cage carved': [[-3, -12], [-4, -4], [3, 5]],
  "the ball's crater": [[0, -16], [0, -5], [0, 9]],
  'the bowed wall': [[0, 0], [-3, 0], [-1, 0]],
  'the torn-out ring': [[0, 0]],
  'the chain port': [[0, 0]],
  'the cell grate': [[0, 0], [-1, 0], [1, 0]],
  'rings and chains': [[0, 0], [-2, 0], [1, 0]],
  'balls on a rack': [[1, -21], [0, -9], [0, 15]],
  'fire basket': [[5, -28], [5, -13], [-8, 7]],
  'goad and catch-pole': [[0, -13], [0, -2], [-2, 9]],
  'empty bowls': [[1, -20], [-1, 2], [-2, 13]],
  'rags on a nail': [[5, -17], [-4, -5], [-5, 7]],
  'the wall winch': [[0, 0], [-1, 0], [1, 0]],
  "the jailers' lamp": [[7, -25], [-4, -7], [-7, 5]],
  'a skull in its cage': [[6, -19], [6, -8], [-7, 3]],
  'the ball hatch': [[0, 0]],
};
const spotsOf = spotsFrom(SPOTS);

let made: Piece[] | null = null;
/** THE CHAINED ONE'S FLOOR, every piece, painted the first time they are asked for and kept. */
export function chainedPieces(): Piece[] {
  if (made) return made;
  const w = (name: string, kind: PieceKind, paint: (p: Px) => void): Piece => ({ name, kind, ...spotsOf(name, paint) });
  const fireLight = (h: number, du0 = 0) => (f: number, du: number, dv: number) => (alongX: boolean): Light[] => [{ x: (PCX + du + du0) / GRAIN, y: (PFOOT - h - dv) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: alongX ? 0.5 : 0.42 }];
  const G = chainedGates();
  made = [
    // wall tiles
    w('bent bars', 'wall tile', bentBars),
    w('claw-torn stone', 'wall tile', clawTorn),
    w('the feeding slot', 'wall tile', feedingSlot),
    w('the cage carved', 'wall tile', cageCarved),
    w("the ball's crater", 'wall tile', ballCrater),
    w('the bowed wall', 'wall tile', bowedWall),
    { name: 'the torn-out ring', kind: 'wall tile', ...spotsOf('the torn-out ring', tornRing), frames: [tornRingHeap()], shadow: 0.42 },
    w('the chain port', 'wall tile', chainPort),
    w('the cell grate', 'wall tile', cellGrate),
    // on the walls
    w('rings and chains', 'on the wall', ringsAndChains),
    w('balls on a rack', 'on the wall', ballRack),
    { name: 'fire basket', kind: 'on the wall', ...spotsOf('fire basket', fireBasket as unknown as (p: Px) => void, 4, fireLight(42, 3)) },
    w('goad and catch-pole', 'on the wall', catchPoles),
    w('empty bowls', 'on the wall', emptyBowls),
    w('rags on a nail', 'on the wall', ragsOnNail),
    w('the wall winch', 'on the wall', wallWinch),
    { name: "the jailers' lamp", kind: 'on the wall', ...spotsOf("the jailers' lamp", jailerLamp as unknown as (p: Px) => void, 4, fireLight(33, 2)) },
    w('a skull in its cage', 'on the wall', spareCage),
    // floor tiles
    { name: 'old straw', kind: 'floor tile', frames: [strawTile()] },
    { name: 'ball grooves', kind: 'floor tile', frames: [onTile(ballGrooves)] },
    { name: 'the oubliette', kind: 'floor tile', frames: [onTile(oubliette)] },
    { name: 'the smashed flags', kind: 'floor tile', frames: [onTile(smashedFlags)] },
    { name: 'his muzzle in the floor', kind: 'floor tile', frames: [onTile(cageInFloor, box(0.05, 0.95, 0.05, 0.95))] },
    { name: 'a ring in the floor', kind: 'floor tile', frames: [floorRingTile()] },
    // traps
    { name: 'the trip chain', kind: 'trap', frames: [tripChain(false), tripChain(true)] },
    { name: 'the mantrap', kind: 'trap', frames: [mantrap(false), mantrap(true)] },
    w('the ball hatch', 'trap', ballHatch),
    // breakables: whole, and what each leaves broken
    { name: 'straw bale', kind: 'breakable', frames: [strawBale(), brokenOf('bale')], shadow: 0.3 },
    { name: 'water jug', kind: 'breakable', frames: [waterJug(), brokenOf('jug')], shadow: 0.2 },
    { name: 'meal sack', kind: 'breakable', frames: [mealSack(), brokenOf('sack')], shadow: 0.26 },
    { name: 'box of irons', kind: 'breakable', frames: [ironsBox(), brokenOf('box')], shadow: 0.28 },
    // on the floor
    { name: 'a burst cuff', kind: 'on the floor', frames: [burstCuff()] },
    { name: 'ball and chain', kind: 'on the floor', frames: [ballAndChain()], shadow: 0.3 },
    { name: 'a snapped chain', kind: 'on the floor', frames: [snappedChain()] },
    { name: 'a bowl kicked over', kind: 'on the floor', frames: [bowlKicked()] },
    { name: 'his pallet', kind: 'on the floor', frames: [strawPallet()] },
    { name: 'a torn-out bar', kind: 'on the floor', frames: [tornBar()] },
    // obstacles
    { name: 'the cage', kind: 'obstacle', frames: [ironCage()], shadow: 0.62 },
    { name: 'the chain post', kind: 'obstacle', frames: [chainPost()], shadow: 0.3 },
    { name: 'the feed trough', kind: 'obstacle', frames: [feedTrough()], shadow: 0.5 },
    { name: 'the great winch', kind: 'obstacle', frames: [greatWinch()], shadow: 0.55 },
    { name: "the jailers' kettle", kind: 'obstacle', frames: [0, 1, 2, 3].map(jailersKettle), shadow: 0.36 },
    { name: 'the anvil', kind: 'obstacle', frames: [anvil()], shadow: 0.34 },
    { name: 'a heap of chains', kind: 'obstacle', frames: [heapOfChains()], shadow: 0.5 },
    { name: 'the stone bench', kind: 'obstacle', frames: [stoneBench()], shadow: 0.5 },
    { name: "the jailers' chest", kind: 'obstacle', frames: [jailersChest(false), jailersChest(true)], shadow: 0.38 },
    // doors and gates
    { name: 'the door', kind: 'door', gates: G, frames: [G.leaf(32, 16), G.leaf(-32, 16), G.post] },
    { name: 'the gate', kind: 'gate', gates: G, frames: [...G.arch(true, false, false).map((q) => q.s), G.pillar(false)] },
    { name: "the boss's gate", kind: 'gate', gates: G, frames: [...G.arch(true, true, false).map((q) => q.s), G.pillar(true)] },
    // quests
    { name: "the Chained One's face-cage", kind: 'quest', frames: [hisCage()], shadow: 0.3 },
  ];
  return made;
}

// =================================================================================================
// THE MOMENTS AROUND THE HERO. His idea, 10 Oct, 07:52: “I’d also like a couple environmental things
// happening around you for immersion unique for each floor.  Something shifts above you and dust comes
// down, you spook a pack of birds and they fly off,  a root shrivels as you walk by.  That sort of
// stuff”. Each checked against his rulebook's Animations 1 before he sees it: “as big and wild and
// kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”

/** A moment's film for one face of a wall (or the floor's one). */
interface Film { frames: Sprite[]; before: Sprite[]; after: Sprite[]; tracks: Track[]; jolts: number[] }

/**
 * IN A WALL'S FACE: where a point is on the picture, from the anchor at the foot of the face under
 * the middle of its tile (as a wall piece's): `a` along the face (picture pixels, KT to a tile; on the
 * picture, 0.8 of a pixel across for each), `b` out from it into the room, `z` up. The face turned to
 * screen-left (`alongX`: the world's x along it, y out of it) or to screen-right (y along it, the
 * other way, and x out of it): the same picture laid on the other wall, its light still from the
 * upper left.
 */
function faceAt(alongX: boolean): (a: number, b: number, z: number) => [number, number] {
  return alongX ? (a, b, z) => [0.8 * (a - b), 0.4 * (a + b) - z] : (a, b, z) => [0.8 * (a + b), 0.4 * (b - a) - z];
}
/** The same point in the world (x, y across the floor, z up), for the dust (floor 2's puffs). */
function faceWorld(alongX: boolean): (a: number, b: number, z: number) => V3 {
  return alongX ? (a, b, z) => [a, b, z] : (a, b, z) => [b, -a, z];
}
/** A heading in the world for a way along the face (`da`) and out of it (`db`). */
function faceHeading(alongX: boolean, da: number, db: number): number {
  return alongX ? Math.atan2(db, da) : Math.atan2(-da, db);
}
/** Paint (u, v) of a wall's flat face (u across it in picture pixels, v up) at (ax, ay), slanted with the face as onFacePx slants a wall piece, in shade on the face turned to screen-right. */
function onWall(p: Px, ax: number, ay: number, alongX: boolean, u: number, v: number, c: string): void {
  const U = Math.round(u);
  p.set(ax + U, ay - Math.round(v) + (alongX ? Math.floor(U / 2) : Math.floor(-U / 2)), alongX || SHINES_HERE.has(c) ? c : shaded(c));
}
/** What gives its own light here, and keeps it in shade: his eyes, fire. */
const SHINES_HERE = new Set<string>([...FLAME, ...EMBER]);
/** Everything painted on `p` but what shines, in shade (the face turned to screen-right). */
function inShade(p: Px): Px {
  return recolor(p, (c) => (SHINES_HERE.has(c) ? c : shaded(c)));
}

/** Cut a frame down to what is painted in it (most of a moment's big frame is empty), keeping its anchor. */
function cut(out: Px, ax: number, ay: number): Sprite {
  const bb = out.bounds(GRAIN);
  if (!bb) return new Px(GRAIN, GRAIN).sprite(0, 0, GRAIN);
  const c = new Px(bb.w, bb.h);
  fastBlit(c, out, -bb.x, -bb.y);
  return c.sprite(ax - bb.x, ay - bb.y, GRAIN);
}

/** How many pixels differ between two frames of the same canvas. */
function differ(a: Px, b: Px): number {
  let n = 0;
  for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2] || a.d[i + 3] !== b.d[i + 3]) n++;
  return n;
}

/** A small thing flung and falling (a chip of stone, a rivet): bouncing where it meets the floor, sliding to a stop there. Where it is, frame by frame, from `f0`. */
function flung(f0: number, o: V3, v: V3, n: number, G: number, bounce = 0.4, floor = 1): (V3 | null)[] {
  const out: (V3 | null)[] = [];
  let q: V3 = [...o];
  let w: V3 = [...v];
  let down = false;
  for (let f = 0; f < n; f++) {
    if (f < f0) {
      out.push(null);
      continue;
    }
    if (f > f0 && !down) {
      w = [w[0], w[1], w[2] - G];
      q = [q[0] + w[0], q[1] + w[1], q[2] + w[2]];
      if (q[2] <= floor) {
        q[2] = floor;
        if (w[2] < -2.2) w = [w[0] * 0.6, w[1] * 0.6, -w[2] * bounce];
        else w = [w[0] * 0.55, w[1] * 0.55, 0];
      }
      if (q[2] <= floor && Math.hypot(w[0], w[1]) < 0.4 && w[2] === 0) down = true;
    }
    out.push([...q] as V3);
  }
  return out;
}

/**
 * Links of a heavy chain along a line of points in the world (or a face's measure), each link a
 * fixed way along it from its first point (so that a link is the same link from frame to frame, and
 * slides along as the chain moves), from `from` to `to` of its length; seen as `see` puts a point on
 * the picture. `dim(s)`: how far a link `s` along it is gone into the dark.
 */
function chainOn(p: Px, pts: readonly V3[], see: (q: V3) => [number, number], from: number, to: number, size = 1, ramp: Ramp = SMALL_IRON, dim?: (s: number) => number): void {
  const pitch = 5 * size;
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len3(sub3(pts[i], pts[i - 1])));
  const at = (s: number): V3 => {
    let i = 1;
    while (i < pts.length - 1 && cum[i] < s) i++;
    const t = cum[i] > cum[i - 1] ? (s - cum[i - 1]) / (cum[i] - cum[i - 1]) : 0;
    return lerp3(pts[i - 1], pts[i], Math.max(0, Math.min(1, t)));
  };
  const links: [number, number, number, number, boolean, number][] = [];
  const k0 = Math.ceil(from / pitch);
  for (let k = k0; k * pitch <= Math.min(to, cum[cum.length - 1]); k++) {
    const s = k * pitch;
    const [x, y] = see(at(s));
    const [x0, y0] = see(at(Math.max(0, s - 1.5)));
    const [x1, y1] = see(at(s + 1.5));
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    links.push([x, y, (x1 - x0) / L, (y1 - y0) / L, k % 2 === 0, dim ? dim(s) : 0]);
  }
  const r = (d: number): Ramp => (d > 0 ? (ramp.map((c) => mix(c, DEEP, d)) as unknown as Ramp) : ramp);
  for (const [x, y, dx, dy, open, d] of links) if (open) link(p, x, y, dx, dy, true, r(d), size);
  for (const [x, y, dx, dy, open, d] of links) if (!open) link(p, x, y, dx, dy, false, r(d), size);
}

/**
 * A ROPE OF POINTS, worked out by small steps (Verlet's way, as the boss's chains are: art/boss_chains.ts
 * on mockup/bosses): each point keeps the way it was going, gravity pulls it down, its links are
 * pulled back to their length again and again, it is kept out of the floor and out of the wall (or
 * whatever `keep` keeps it out of), and what lies on the floor drags.
 */
class Rope {
  x: V3[];
  p: V3[];
  inv: number[];
  rest: number;
  constructor(pts: readonly V3[], public G: number, public R: number) {
    this.x = pts.map((q) => [...q] as V3);
    this.p = pts.map((q) => [...q] as V3);
    this.inv = pts.map(() => 1);
    this.rest = 0;
    for (let i = 1; i < pts.length; i++) this.rest += len3(sub3(pts[i], pts[i - 1]));
    this.rest /= pts.length - 1;
  }
  /** One small step of `dt` of a frame: `pin(i)` the points held (and where), `keep(q)` puts a point out of what it may not be in (returning whether it touched), the floor's grip, how much of its swing it keeps, how hard it bounces off the floor. */
  step(dt: number, pin: (i: number) => V3 | null, keep: (q: V3, i: number) => boolean, grip = 0.9, air = 0.998, bounce = 0.3, iters = 14): void {
    const n = this.x.length;
    const g = this.G * dt * dt;
    for (let i = 0; i < n; i++) {
      const q = pin(i);
      if (q || this.inv[i] === 0) continue;
      const x = this.x[i];
      const v = mul3(sub3(x, this.p[i]), air);
      this.p[i] = [...x] as V3;
      this.x[i] = [x[0] + v[0], x[1] + v[1], x[2] + v[2] - g * (this.inv[i] > 0 ? 1 : 0)];
    }
    for (let it = 0; it < iters; it++) {
      for (let i = 0; i < n; i++) {
        const q = pin(i);
        if (q) this.x[i] = [...q] as V3;
      }
      for (let i = 0; i + 1 < n; i++) {
        const a = this.x[i];
        const b = this.x[i + 1];
        const wa = pin(i) ? 0 : this.inv[i];
        const wb = pin(i + 1) ? 0 : this.inv[i + 1];
        if (wa + wb === 0) continue;
        const d = sub3(b, a);
        const L = len3(d) || 1e-6;
        const k = (L - this.rest) / L / (wa + wb);
        this.x[i] = [a[0] + d[0] * k * wa, a[1] + d[1] * k * wa, a[2] + d[2] * k * wa];
        this.x[i + 1] = [b[0] - d[0] * k * wb, b[1] - d[1] * k * wb, b[2] - d[2] * k * wb];
      }
      for (let i = 0; i < n; i++) {
        if (pin(i)) continue;
        const q = this.x[i];
        if (q[2] < this.R) {
          const vz = q[2] - this.p[i][2];
          q[2] = this.R;
          // (struck hard, it bounces; else it lies and drags)
          this.p[i][2] = vz < -1.2 * dt ? q[2] + vz * bounce : q[2];
          this.p[i][0] = q[0] - (q[0] - this.p[i][0]) * grip;
          this.p[i][1] = q[1] - (q[1] - this.p[i][1]) * grip;
        }
        keep(q, i);
      }
    }
  }
}
/** A smooth step from 0 to 1. */
const smooth = (t: number): number => {
  const k = Math.max(0, Math.min(1, t));
  return k * k * (3 - 2 * k);
};

// =================================================================================================
// DUST, as the first fresh look asked for it: it found the old puffs flat grey blobs that popped in
// whole, sat over the blows and then broke into blobs that shrank away where they were (the speckle
// he will not have). Now: fewer, bigger clouds; each grows out of the point it is struck from over
// its first three frames; it blows out fast, then hangs, spreads and drifts; then it settles,
// sinking onto the floor and flattening into a low sheet that shrinks away as one. Round, and shaded
// as a round thing is: its top lit, its belly dark. Painted under what moves in the moment, so that
// it never hides the blow.

/** A cloud: born on frame `f0` at `o` (in the moment's own measure, picture pixels), thrown `v` a frame at first, growing to `r` across, hanging `hang` frames before it settles. */
export interface Cloud { f0: number; o: V3; v: V3; r: number; hang: number; seed: number }
/** Dust: its dark belly, its body in shade, its body, its lit top (the floor's dust, a step either way). */
const DUST: readonly [string, string, string, string] = ['#322e54', '#433f68', '#55517e', '#696594'];
const CLOUD_GROW = [0.3, 0.6, 0.85] as const;
/** How many frames a settled sheet takes to slide on and shrink away. */
const CLOUD_SHRINK = 10;
/** How many frames a cloud takes to sink onto the floor and flatten: longer the higher it hangs. */
const settleOf = (c: Cloud): number => Math.round(8 + Math.max(0, c.o[2]) / 5);
/** The last frame a cloud is seen on. */
function cloudEnd(c: Cloud): number {
  return c.f0 + CLOUD_GROW.length + c.hang + settleOf(c) + CLOUD_SHRINK - 1;
}
/**
 * Where a cloud is, how big, how flattened and how thin, `k` frames after it is born (null: not yet,
 * or gone). (The second fresh look found the old cloud dropping in ONE frame from the air to a flat
 * strip on the floor, and the strip then fading where it lay: now it sinks and flattens together
 * over many frames, easing in and out, and the sheet it becomes slides on along the floor as it
 * shrinks away as one.)
 */
export function dustCloudAt(c: Cloud, k: number): { q: V3; r: number; sx: number; sy: number; thin: number } | null {
  if (k < 0) return null;
  const G = CLOUD_GROW.length;
  // thrown out fast and slowing; then drifting on, slowly
  const go = (1 - 0.7 ** (k + 1)) / 0.3 + Math.max(0, k - G) * 0.12;
  let q: V3 = [c.o[0] + c.v[0] * go, c.o[1] + c.v[1] * go, c.o[2] + c.v[2] * go + 2.5 * (1 - Math.exp(-k / 3))];
  let r = c.r * (k < G ? CLOUD_GROW[k] : 1 + 0.4 * Math.min(1, (k - G) / Math.max(1, c.hang + 4)));
  let sx = 1;
  let sy = 1;
  const t0 = G + c.hang;
  const S = settleOf(c);
  // darkening as it spreads
  let thin = Math.min(1, Math.max(0, k - G) / (c.hang + S));
  if (k >= t0) {
    // settling: sinking onto the floor and flattening as it goes, both by time, easing in and out
    const u = Math.min(1, (k - t0 + 1) / S);
    const e = u * u * (3 - 2 * u);
    q = [q[0], q[1], q[2] * (1 - e) + 1 * e];
    sy = 1 - 0.62 * e;
    sx = 1 + 0.4 * e;
  }
  if (k >= t0 + S) {
    // a low sheet on the floor, sliding on along it and shrinking away as one
    const t = (k - t0 - S + 1) / (CLOUD_SHRINK + 1);
    if (t >= 1) return null;
    const along = Math.hypot(c.v[0], c.v[1]) || 1;
    const slide = 0.9 * (k - t0 - S + 1);
    q = [q[0] + (c.v[0] / along) * slide, q[1] + (c.v[1] / along) * slide, q[2]];
    r *= Math.sqrt(1 - t);
    sy *= 1 - 0.3 * t;
    thin = 1;
  }
  return { q, r, sx, sy, thin };
}
/** The lobes a cloud is made of: (across, down, how big), in its own size: a big one in the middle, six round it, each its own. */
function lobesOf(seed: number): [number, number, number][] {
  const out: [number, number, number][] = [[0, 0.04, 0.6]];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + hash(i, seed, 504) * 0.7;
    const d = 0.42 + hash(i, seed, 501) * 0.2;
    out.push([Math.cos(a) * d * 1.15, Math.sin(a) * d * 0.8 - 0.05, 0.34 + hash(i, seed, 503) * 0.16]);
  }
  return out;
}
/**
 * Paint a cloud on frame `f`, where `pic` puts a point of the moment on the picture: solid, its lobes
 * each a round shaded swelling with a broken, scalloped edge (no see-through checker, which the second
 * fresh look found reads as netting and shimmers on a phone), lit on top and dark in its belly, and
 * a step darker as it spreads and settles.
 */
function paintCloud(p: Px, c: Cloud, f: number, pic: (q: V3) => [number, number]): void {
  const k = f - c.f0;
  const at = dustCloudAt(c, k);
  if (!at) return;
  const { q, r, sx, sy, thin } = at;
  if (r < 1) return;
  const [cx, cy] = pic(q);
  // (its lobes boiling: each swelling and shrinking on its own, the outer ones drifting outward)
  const spread = 1 + 0.25 * Math.min(1, k / 10);
  const lobes = lobesOf(c.seed).map(([x, y, lr], i) => [cx + x * spread * r * sx, cy + y * spread * r * sy, Math.max(0.9, lr * r * (1 + 0.1 * Math.sin(k * 0.6 + i * 1.7))), i] as const);
  const x0 = Math.floor(cx - r * sx * 1.6);
  const x1 = Math.ceil(cx + r * sx * 1.6);
  const y0 = Math.floor(cy - r * sy * 1.4);
  const y1 = Math.ceil(cy + r * sy * 1.4);
  const dim = (sy < 0.6 ? 1 : 0) + (thin > 0.7 ? 1 : 0);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      let best = -Infinity;
      for (const [lx, ly, lr, i] of lobes) {
        const dx = (x + 0.5 - lx) / (lr * sx);
        const dy = (y + 0.5 - ly) / (lr * sy);
        // a scalloped rim: each lobe's edge bulging and notching round it, slowly turning
        const a = Math.atan2(dy, dx);
        const rim = 1 + 0.16 * Math.sin(5 * a + i * 2.1 + c.seed + k * 0.12) + 0.08 * Math.sin(9 * a + i * 1.3);
        const d2 = dx * dx + dy * dy;
        if (d2 > rim * rim) continue;
        best = Math.max(best, -0.45 * dx - 0.89 * dy);
      }
      if (best === -Infinity) continue;
      const tone = best > 0.5 ? 3 : best > -0.15 ? 2 : best > -0.6 ? 1 : 0;
      p.set(x, y, DUST[Math.max(0, tone - dim)]);
    }
  }
}

/**
 * A GREAT RING hanging from its bolt toward `dir` (a way on the picture), bent `bend` out of round:
 * pulled long toward the chain on it and pinched across. Lit on its upper left outside.
 */
function bentRing(p: Px, cx: number, cy: number, r: number, th: number, ramp: Ramp, dir: V2, bend: number): void {
  const L = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / L;
  const uy = dir[1] / L;
  const long = 1 + bend;
  const short = 1 - bend * 0.45;
  const R = Math.ceil(r * long) + 1;
  for (let y = Math.floor(cy - R); y <= cy + R; y++) {
    for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      const rx = x + 0.5 - cx;
      const ry = y + 0.5 - cy;
      const a = (rx * ux + ry * uy) / long;
      const b = (-rx * uy + ry * ux) / short;
      const d = Math.hypot(a, b);
      if (d > r || d < r - th) continue;
      const outer = d > r - th / 2;
      const t = (-(rx * 0.72 + ry * 0.7) / Math.max(1, Math.hypot(rx, ry))) * (outer ? 1 : -1);
      p.set(x, y, t > 0.3 ? ramp[3] : t < -0.4 ? ramp[0] : ramp[2]);
    }
  }
}

/** A lump of broken stone a few pixels across at (x, y), turned `turn` (it tumbles as it flies): lit on its upper left. */
function chunkAt(p: Px, x: number, y: number, size: number, turn: number, ramp: Ramp = STONE): void {
  const X = Math.round(x);
  const Y = Math.round(y);
  const pts: V2[] = [];
  for (let k = 0; k < 5; k++) {
    const a = turn + (k / 5) * Math.PI * 2;
    const rr = size * (0.75 + 0.35 * hash(k, Math.round(size * 10), 520));
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.85]);
  }
  for (let yy = -Math.ceil(size); yy <= Math.ceil(size); yy++) {
    for (let xx = -Math.ceil(size); xx <= Math.ceil(size); xx++) {
      // inside the turned five-sided lump?
      let inside = true;
      for (let k = 0; k < 5; k++) {
        const [ax_, ay_] = pts[k];
        const [bx_, by_] = pts[(k + 1) % 5];
        if ((bx_ - ax_) * (yy + 0.5 - ay_) - (by_ - ay_) * (xx + 0.5 - ax_) < 0) inside = false;
      }
      if (!inside) continue;
      const l = -(xx + 0.5) * 0.6 - (yy + 0.5) * 0.8;
      p.set(X + xx, Y + yy, l > size * 0.35 ? ramp[4] : l > -size * 0.3 ? ramp[2] : ramp[1]);
    }
  }
}

/**
 * THE CHAINS PULL. Three heavy chains hang from great rings on a wall, slack down the stone and away
 * along its foot into a chain port, a dark mouth a tile along, into the cell beyond (`before`). It
 * begins at once: the rings shudder on their plates, mortar trickles from round them, the chains
 * twitch, and deep in the dark of the port two pink eyes catch the light. Then something hauls (a
 * jolt): all three are snatched up off the floor, links sliding away into the port, the rings
 * wrenched long on their bolts, the stone cracking out round the plates, dust blasting out of the
 * port and off the plates; it lets them out a little; then hauls again, harder (a jolt): taut and
 * straight they thrum, more links gone, the rings bent further, the cracks running on, the first
 * plate tearing out of the wall, mortar pouring from it; and it rips out (a jolt): the plate and its
 * ring and chunks of the wall are flung out into the room, the chunks bouncing away across the floor
 * toward the hero, the freed chain whipping out after its ring in a great S across the floor and
 * slapping down (a jolt), bouncing, and slapping down again smaller. Whatever pulled lets go: the
 * eyes go back into the dark, the other two drop slack and swing out and back against the stone and
 * hang still, and the dust settles onto the floor and is gone. What is left: the torn plate, its ring
 * and its chain lying out across the floor, the hole and the cracks, the two chains hanging, their
 * rings bent, the chunks where they stopped. For the face turned to screen-left (`alongX`) or to
 * screen-right; anchored as a wall piece is. Its frames reach a tile and a half along the wall (it
 * plays where the wall runs on past its tile to the port) and two tiles out into the room.
 */
function chainsPull(alongX: boolean): Film & { yanks: number[]; rip: number; slap: number } {
  const W = 300;
  const H = 210;
  const ax = 160;
  const ay = 120;
  // (on the face turned to screen-right the port is on the other side of the rings, toward the eye,
  // so that the chains run down to it there too: the first fresh look found them on that face running
  // up and across to it, as if they floated)
  const M = alongX ? 1 : -1;
  const face = faceAt(alongX);
  const see = (a: number, b: number, z: number): [number, number] => face(M * a, b, z);
  const pic = (q: V3): [number, number] => {
    const [x, y] = see(q[0], q[1], q[2]);
    return [ax + x, ay + y];
  };
  const G = 1.35;
  const SUB = 6;
  const R = 1.9;
  const N = 28;
  // the rings' bolts (a along, b out, z up), and where each chain goes into the port
  const BOLTS: V3[] = [[-22, R, 46], [-5, R, 52], [12, R, 45]];
  const PORT = 48;
  const ENTRY: V3[] = [[PORT - 7, R, 4.5], [PORT, R, 6], [PORT + 7, R, 4.5]];
  const RING_R = 4.4;
  const tautOf = (i: number): number => len3(sub3(ENTRY[i], BOLTS[i])) + 0.5;
  const SLACK = 40;
  const L0 = BOLTS.map((_, i) => tautOf(i) + SLACK);
  // THE TIMELINE (frames)
  const SHUDDER = 1;
  const EYES = 3;
  const YANK1 = 8;
  const YANK2 = 17;
  const RIP = 26;
  /** How much of chain i is out of the port at time t. */
  const outLen = (i: number, t: number): number => {
    if (t < YANK1) return L0[i] - (t >= SHUDDER ? 1.6 * (t - SHUDDER) * 0.3 + 1.2 * Math.abs(Math.sin(t * 2.1 + i)) : 0);
    const y1 = 22 * smooth((t - YANK1) / 2.5) - 6 * smooth((t - YANK1 - 4) / 4);
    if (t < YANK2) return Math.max(tautOf(i) + 3, L0[i] - 3.5 - y1);
    if (t < RIP) return Math.max(tautOf(i), L0[i] - 19.5 - SLACK * smooth((t - YANK2) / 2.5));
    // let go: they run back out of the port, the torn one most, after its ring
    return tautOf(i) + (i === 0 ? 46 * (1 - Math.exp(-(t - RIP) / 3)) : 22 * (1 - Math.exp(-(t - RIP) / 2.5)));
  };
  const dirOf = (i: number): V3 => norm3(sub3(ENTRY[i], BOLTS[i]));
  /** Where each bolt is: shuddering at first; the first tearing out of the wall from the second haul. */
  const boltAt = (i: number, t: number): V3 => {
    const f = Math.floor(t);
    let q = BOLTS[i];
    if (f >= SHUDDER && f < YANK1) q = add3(q, [(hash(f, i, 530) - 0.5) * 1.4, 0, (hash(f, i, 531) - 0.5) * 1.4]);
    if (i === 0 && t >= YANK2 && t < RIP) q = add3(q, add3(mul3(dirOf(0), 1.2 * smooth((t - YANK2) / 6)), [0, 2.2 * smooth((t - YANK2) / 8), 0]));
    return q;
  };
  /** How bent each ring is (pulled long toward its chain): more at each haul, and it stays. */
  const bendOf = (i: number, f: number): number => (f >= YANK2 ? 0.28 + (i === 0 ? 0.08 : 0) : f >= YANK1 ? 0.14 : 0) + (f === YANK1 || f === YANK2 ? 0.1 : 0);
  // THE CHAINS, laid as they hang: down from the ring to the floor at the wall's foot, then along it to the port in easy bends
  const ropes: Rope[] = BOLTS.map((bolt, i) => {
    const pts: V3[] = [];
    const down = bolt[2] - R;
    const along = ENTRY[i][0] - bolt[0];
    const extra = L0[i] - down - along;
    for (let k = 0; k <= N; k++) {
      const s = (k / N) * L0[i];
      if (s < down) pts.push([bolt[0] + 0.5 * Math.sin(s * 0.2), R + 0.3, bolt[2] - s]);
      else {
        const t = (s - down) / (L0[i] - down);
        const wig = Math.sin(t * Math.PI * (2 + i * 0.5) + i) * Math.min(14, extra * 0.35);
        pts.push([bolt[0] + along * t, R + Math.abs(wig) + 0.2, R]);
      }
    }
    const r = new Rope(pts, G, R);
    r.rest = L0[i] / N;
    return r;
  });
  const keepOut = (q: V3): boolean => {
    if (q[1] < R) {
      q[1] = R;
      return true;
    }
    return false;
  };
  // settle them where they lie (as they have lain for years)
  for (let s = 0; s < 120 * SUB; s++) for (const [i, r] of ropes.entries()) r.step(1 / SUB, (k) => (k === 0 ? BOLTS[i] : k === N ? ENTRY[i] : null), keepOut, 0.6, 0.96);
  // THE RUN: frame by frame, in small steps
  const FMAX = 160;
  const states: { pts: V3[][]; bolts: V3[]; out: number[] }[] = [];
  let slap = -1;
  let slap2 = -1;
  for (let f = 0; f < FMAX; f++) {
    if (slap > 0 && f === slap + 1) {
      // (the whip's crack: the chain's free end lashes up off the floor and on toward the hero, to slap
      // down a second time, as hard; the second fresh look's raise)
      const r = ropes[0];
      const L = Math.round(N * 0.6);
      for (let k = 0; k <= L; k++) {
        const sk = 1 - k / L;
        r.p[k] = sub3(r.x[k], mul3([0.9 * sk, 2.2 * sk, 5.2 * sk], 1 / SUB));
      }
    }
    if (f === RIP) {
      // the first plate tears out: its chain's end, ring and plate on it, flung out into the room and
      // down, the chain behind it whipped into an S (each point thrown less the nearer the port it is,
      // and to one side and the other along it)
      const r = ropes[0];
      r.inv[0] = 1 / 4;
      for (let k = 0; k <= N; k++) {
        const s = 1 - k / N;
        // (toward the hero: out of the wall and along it toward the port's side; the S across that way)
        const across = 3 * Math.sin(Math.PI * s * 1.7) * s;
        const v: V3 = [3.4 * s ** 1.2 + across * 0.85, 8.6 * s ** 1.2 + 0.3 - across * 0.53, 1.5 * s];
        r.p[k] = sub3(r.x[k], mul3(v, 1 / SUB));
      }
      // and the other two, let go, spring away from the stone into the room
      for (const i of [1, 2]) for (let k = 1; k < N; k++) ropes[i].p[k] = sub3(ropes[i].x[k], [0, (-4.6 * Math.sin((Math.PI * k) / N)) / SUB, 0]);
    }
    for (let s = 0; s < SUB; s++) {
      const t = f + s / SUB;
      for (const [i, r] of ropes.entries()) {
        r.rest = outLen(i, t) / N;
        const bolt = boltAt(i, t);
        const free0 = i === 0 && f >= RIP;
        // (strained taut, they thrum: a shiver either way, no more one way than the other)
        if (t >= YANK2 + 2 && t < RIP && s === 0) for (let k = 3; k < N - 2; k += 4) r.x[k][1] += (hash(k, f + i * 50, 476) - 0.5) * 1.4;
        r.step(1 / SUB, (k) => (k === 0 && !free0 ? bolt : k === N ? ENTRY[i] : null), keepOut, 0.88, 0.997, i === 0 ? 0.55 : 0.3);
      }
    }
    // (it strikes the floor: the first frame it is down on it, or its fall stopped short)
    const z0 = ropes[0].x[0][2];
    if (f > RIP + 1 && slap < 0 && z0 <= R + 3 && states[f - 1].pts[0][0][2] - z0 > 4) slap = f;
    else if (slap > 0 && f > slap + 4 && slap2 < 0 && z0 <= R + 3 && states[f - 1].pts[0][0][2] - z0 > 3) slap2 = f;
    states.push({ pts: ropes.map((r) => r.x.map((q) => [...q] as V3)), bolts: BOLTS.map((_, i) => boltAt(i, f)), out: BOLTS.map((_, i) => outLen(i, f)) });
  }
  if (slap < 0) throw new Error('the torn ring never strikes the floor');
  if (slap2 < 0) throw new Error('the torn ring never strikes the floor a second time');
  // WHAT FLIES: chunks of the wall from where the plate tore out, thrown out in arcs toward the hero, bouncing
  const chunks = Array.from({ length: 6 }, (_, k) => ({
    // (bigger, and thrown harder toward the hero: the second fresh look's raise)
    size: 3.6 + hash(k, 9, 477) * 2.2,
    path: flung(RIP, add3(BOLTS[0], [(hash(k, 1, 477) - 0.5) * 6, 2, (hash(k, 2, 477) - 0.5) * 6]), [0.6 + (hash(k, 3, 477) - 0.4) * 3, 4.6 + hash(k, 4, 477) * 3.4, 1.6 + hash(k, 5, 477) * 2.6], FMAX, G, 0.5, 2.2),
  }));
  // mortar trickling from round the plates at first, pouring from the first as it tears
  interface Bit { f0: number; o: V3; v: V3 }
  const grit: Bit[] = [];
  for (let k = 0; k < 30; k++) {
    const i = k % 3;
    const f0 = SHUDDER + Math.floor(hash(k, 1, 470) * (YANK2 - SHUDDER));
    grit.push({ f0, o: add3(BOLTS[i], [(hash(k, 2, 470) - 0.5) * 7, 0.8, -3 - hash(k, 3, 470) * 2]), v: [0, 0.1 + hash(k, 4, 470) * 0.3, 0] });
  }
  for (let k = 0; k < 16; k++) grit.push({ f0: YANK2 + Math.floor(k / 2), o: add3(BOLTS[0], [(hash(k, 5, 470) - 0.5) * 6, 1, -4]), v: [(hash(k, 6, 470) - 0.5) * 0.6, 0.3 + hash(k, 7, 470) * 0.5, 0.4] });
  const gritAt = (g: Bit, f: number): V3 | null => {
    const t = f - g.f0;
    if (t < 0) return null;
    const z = g.o[2] + g.v[2] * t - 0.5 * G * t * t;
    if (z < 0.5) return null;
    return [g.o[0] + g.v[0] * t, g.o[1] + g.v[1] * t, z];
  };
  // THE DUST: out of the port and off the plates at each haul; a great cloud where the plate tears out; along the floor where the chain slaps down
  const clouds: Cloud[] = [];
  for (const [j, f0] of [YANK1, YANK2].entries()) {
    clouds.push({ f0, o: [PORT, R + 4, 8], v: [0.4, 1.5 + j * 0.3, 0.1], r: 9 + j * 2, hang: 5, seed: 10 + j });
    BOLTS.forEach((b, i) => clouds.push({ f0, o: add3(b, [1, 3, -4]), v: [0.2, 0.7, 0], r: 4.5 + j, hang: 3, seed: 20 + j * 5 + i }));
  }
  clouds.push({ f0: RIP, o: add3(BOLTS[0], [0, 4, -2]), v: [-0.5, 1.3, 0.2], r: 13, hang: 6, seed: 40 });
  {
    const q = states[slap].pts[0];
    clouds.push({ f0: slap, o: [q[0][0] + 6, q[0][1] - 6, 2], v: [0.6, 0.4, 0], r: 10, hang: 4, seed: 41 });
    clouds.push({ f0: slap + 1, o: [q[Math.round(N * 0.4)][0], q[Math.round(N * 0.4)][1], 2], v: [-0.4, 0.5, 0], r: 8, hang: 3, seed: 42 });
    const q2 = states[slap2].pts[0];
    clouds.push({ f0: slap2, o: [q2[0][0] + 4, q2[0][1] - 4, 2], v: [0.5, 0.6, 0], r: 9, hang: 3, seed: 43 });
  }
  /** His eyes in the dark of the port: how bright (0 to 4) on frame f. */
  // HIS EYES in the port: opening over three frames, then a steady matched pink pair until the rip;
  // then drawing back into the hole over eight frames, smaller, nearer each other and dimmer
  const EYES_BACK = 8;
  const eyeAt = (f: number): { lvl: number; apart: number; w: number; h: number } => {
    if (f < EYES) return { lvl: 0, apart: 9, w: 4, h: 2 };
    if (f < EYES + 3) return { lvl: f - EYES + 1, apart: 9, w: f - EYES >= 1 ? 4 : 3, h: f - EYES >= 1 ? 2 : 1 };
    if (f <= RIP) return { lvl: 3, apart: 9, w: 4, h: 2 };
    const t = (f - RIP) / EYES_BACK;
    if (t >= 1) return { lvl: 0, apart: 4, w: 1, h: 1 };
    return { lvl: Math.ceil(3 * (1 - t)), apart: 9 - 5 * t, w: t < 0.3 ? 4 : t < 0.6 ? 3 : 2, h: t < 0.4 ? 2 : 1 };
  };
  const eyesOf = (f: number): number => eyeAt(f).lvl;
  // IT IS OVER when the chains have come to rest, the chunks lie still and the dust is gone
  let END = Math.max(...clouds.map(cloudEnd)) + 1;
  for (const c of chunks) {
    const k = c.path.findIndex((q, i) => i > RIP + 2 && q !== null && c.path[i - 1] !== null && q[0] === c.path[i - 1]![0] && q[1] === c.path[i - 1]![1] && q[2] === c.path[i - 1]![2]);
    END = Math.max(END, k - 1);
  }
  for (let f = slap + 10; f < FMAX; f++) {
    if (states[f].pts.every((pts, i) => pts.every((q, k) => len3(sub3(q, states[f - 1].pts[i][k])) < 0.25))) {
      END = Math.max(END, f);
      break;
    }
  }
  END = Math.min(FMAX - 1, END);
  // THE CRACKS round the plates: out from each, a little further at each haul (the first's furthest), staying
  const CRACKS = BOLTS.map((_, i) => Array.from({ length: 5 }, (_, k) => ({ a: (k / 5) * Math.PI * 2 + hash(k, i, 532) * 0.8, L: 5 + hash(k, i, 533) * 5 })));
  const crackLen = (i: number, f: number): number => (f >= YANK2 ? Math.min(1, (f - YANK2 + 1) / 3) * (i === 0 ? 1.6 : 1) + 1 : f >= YANK1 ? Math.min(1, (f - YANK1 + 1) / 3) : 0);
  /** Paint frame f. */
  const paint = (f: number): Px => {
    const st = states[f];
    const wall = new Px(W, H);
    const put = (u: number, v: number, c: string): void => onWall(wall, ax, ay, alongX, M * u, v, c);
    // THE PORT, a tile along: its iron frame, the dark in it, his eyes in the dark
    const pu = 0.8 * PORT;
    for (let v = 0; v <= 19; v++) {
      for (let u = Math.round(pu - 13); u <= pu + 12; u++) {
        const mouth = Math.abs(u - pu + 0.5) <= 9.5 && v <= 14 + (Math.abs(u - pu + 0.5) < 6 ? 1 : 0);
        if (mouth) put(u, v, v === 0 && Math.abs(u - pu) < 5 ? FACE[1] : DEEP);
        else put(u, v, u <= pu - 12 || v === 19 ? DIM_IRON[3] : u >= pu + 11 ? DIM_IRON[0] : DIM_IRON[2]);
      }
    }
    for (const [du, v] of [[-11, 17], [10, 17], [-11, 3], [10, 3], [0, 17]] as const) put(pu + du, v, DIM_IRON[4]);
    // (his eyes go on their own layer, over the chains: steady, never covered by a link passing)
    const eyesL = new Px(W, H);
    const eye = eyeAt(f);
    if (eye.lvl > 0) {
      // (a matched pair high in the dark, each a pink slit, its middle the brightest; never the fire's gold)
      for (const s of [-1, 1]) {
        const ec = pu - 0.5 + (s * eye.apart) / 2;
        const eu = Math.round(ec - eye.w / 2);
        const body = FLAME[Math.min(2, eye.lvl)];
        const rim = FLAME[Math.max(0, eye.lvl - 2)];
        for (let du = 0; du < eye.w; du++) {
          const mid = eye.w >= 3 ? du >= 1 && du <= eye.w - 2 : true;
          onWall(eyesL, ax, ay, alongX, M * (eu + du), 12, mid ? body : rim);
          if (eye.h >= 2) onWall(eyesL, ax, ay, alongX, M * (eu + du), 11, mid ? rim : FLAME[0]);
        }
      }
    }
    // THE PLATES (and the first's crater once it is gone), and the cracks round them
    st.bolts.forEach((bolt, i) => {
      const u0 = 0.8 * BOLTS[i][0];
      const v0 = BOLTS[i][2];
      for (const { a, L } of CRACKS[i]) {
        const len = L * crackLen(i, f);
        for (let s = 4; s < 4 + len; s += 0.7) put(u0 + Math.cos(a) * s + Math.sin(s * 1.3) * 0.5, v0 + Math.sin(a) * s, DEEP);
      }
      if (i === 0 && f >= RIP) {
        for (let v = v0 - 6; v <= v0 + 6; v++) for (let u = u0 - 6; u <= u0 + 6; u++) {
          const r = Math.hypot(u - u0, (v - v0) * 1.1);
          if (r > 5.5 + 1.4 * hash(Math.round(u), Math.round(v), 478)) continue;
          const toLight = (-(u - u0) + (v - v0)) / Math.max(1, r);
          put(u, v, r < 2.5 ? DEEP : toLight > 0.2 ? DEEP : toLight < -0.3 ? FACE[4] : FACE[0]);
        }
      } else {
        const du = 0.8 * (bolt[0] - BOLTS[i][0]);
        const dv = bolt[2] - BOLTS[i][2];
        for (let v = -3; v <= 3; v++) for (let u = -3; u <= 3; u++) put(u0 + u + du, v0 + v + dv, u === -3 || v === 3 ? DIM_IRON[3] : u === 3 || v === -3 ? DIM_IRON[0] : DIM_IRON[2]);
      }
    });
    // THE DUST, under what moves
    const dust = new Px(W, H);
    for (const c of clouds) paintCloud(dust, c, f, pic);
    // THE CHAINS: the farthest out from the wall last; each from its ring to the port, a link or two on into its dark
    const chainL = new Px(W, H);
    const order = [0, 1, 2].sort((m, n) => st.pts[m].reduce((t, q) => t + q[1], 0) - st.pts[n].reduce((t, q) => t + q[1], 0));
    for (const i of order) {
      const pts = st.pts[i];
      const all = [...pts, add3(ENTRY[i], [3, -6, -0.5])];
      chainOn(chainL, all, pic, RING_R * 1.6, st.out[i] + 6, 1.3, SMALL_IRON, (s) => (s > st.out[i] ? Math.min(0.85, (s - st.out[i]) / 6) : 0));
      const [bx, by] = pic(pts[0]);
      const [nx, ny] = pic(pts[2]);
      const bend = bendOf(i, f);
      const dir: V2 = [nx - bx, ny - by];
      const dl = Math.hypot(dir[0], dir[1]) || 1;
      bentRing(chainL, bx + (dir[0] / dl) * RING_R * (1 + bend), by + (dir[1] / dl) * RING_R * (1 + bend), RING_R * 1.05, 2.2, SMALL_IRON, dir, bend);
      if (i === 0 && f >= RIP) {
        // the torn plate, on the ring's end, tumbling
        const tilt = (f - RIP) * 0.5;
        for (let v = -3; v <= 3; v++) for (let u = -3; u <= 3; u++) {
          const x = Math.round(bx + u * Math.cos(tilt) - v * Math.sin(tilt) * 0.6);
          const y = Math.round(by + v * Math.cos(tilt) * 0.8 + u * Math.sin(tilt) * 0.4);
          chainL.set(x, y, u + v < -3 ? SMALL_IRON[3] : u + v > 3 ? SMALL_IRON[0] : SMALL_IRON[2]);
        }
      } else rivet(chainL, Math.round(bx) - 1, Math.round(by) - 1, SMALL_IRON);
    }
    const bits = new Px(W, H);
    for (const [k, c] of chunks.entries()) {
      const q = c.path[f];
      if (!q) continue;
      const [x, y] = pic(q);
      const moving = f > 0 && c.path[f - 1] !== null && len3(sub3(q, c.path[f - 1]!)) > 0.2;
      chunkAt(bits, x, y, c.size, (moving ? f * 0.9 : 0) + k);
    }
    for (const g of grit) {
      const q = gritAt(g, f);
      if (!q) continue;
      const [x, y] = pic(q);
      bits.set(Math.round(x), Math.round(y), FACE[3]).set(Math.round(x) + 1, Math.round(y), FACE[3]).set(Math.round(x), Math.round(y) + 1, FACE[1]).set(Math.round(x) + 1, Math.round(y) + 1, FACE[1]);
    }
    let fig = compose(null, [chainL], bits);
    let base = wall;
    if (!alongX) {
      fig = inShade(fig);
      base = inShade(wall);
    }
    const all = new Px(W, H);
    fastBlit(all, base, 0, 0);
    fastBlit(all, dust, 0, 0);
    fastBlit(all, fig, 0, 0);
    fastBlit(all, eyesL, 0, 0);
    return all;
  };
  // THE FRAMES, to where it is all still
  const frames: Sprite[] = [];
  for (let f = 0; f <= END; f++) frames.push(cut(paint(f), ax, ay));
  // THE TRACKS: the middle of each chain, the torn ring, the chunks, his eyes
  const rel = (q: V3, size: number, prev: [number, number] | null): { x: number; y: number; shown: number; size: number } => {
    const [x, y] = see(q[0], q[1], q[2]);
    return { x, y, shown: 1, size: size + (prev ? Math.hypot(x - prev[0], y - prev[1]) : 0) };
  };
  const along = (name: string, pos: (f: number) => V3 | null, size: number): Track => {
    const t: Track = { name, at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= END; f++) {
      const q = pos(f);
      if (!q) {
        t.at.push(null);
        continue;
      }
      const a = rel(q, size, prev);
      t.at.push(a);
      prev = [a.x, a.y];
    }
    return t;
  };
  const tracks: Track[] = [0, 1, 2].map((i) => along(`chain ${i + 1}`, (f) => states[f].pts[i][Math.round(N / 2)], 10));
  tracks.push(along('the torn ring', (f) => states[f].pts[0][0], 12));
  chunks.forEach((c, k) => tracks.push(along(`chunk ${k + 1}`, (f) => c.path[f], 5)));
  {
    const t: Track = { name: 'his eyes', at: [] };
    for (let f = 0; f <= END; f++) {
      const [x, y] = see(PORT - 1, R, 12);
      t.at.push({ x, y, shown: eyesOf(f) / 3, size: 4 });
    }
    tracks.push(t);
  }
  return { frames, before: [frames[0]], after: [frames[END]], tracks, jolts: [YANK1, YANK2, RIP, slap, slap2], yanks: [YANK1, YANK2], rip: RIP, slap };
}

/** The way the eye looks, in the world: right across the picture, down it, and toward the eye (floor 2's TOWARD). */
const CAM_R: V3 = norm3([1, -1, 0]);
const CAM_T: V3 = norm3([TOWARD[0], TOWARD[1], TOWARD[2]]);
const CAM_D: V3 = norm3([CAM_T[1] * CAM_R[2] - CAM_T[2] * CAM_R[1], CAM_T[2] * CAM_R[0] - CAM_T[0] * CAM_R[2], CAM_T[0] * CAM_R[1] - CAM_T[1] * CAM_R[0]]);
/** A way `v` turned `ang` radians about the unit axis `k` (Rodrigues). */
function turnAbout(v: V3, k: V3, ang: number): V3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const d = dot3(v, k);
  const x: V3 = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
  return [v[0] * c + x[0] * s + k[0] * d * (1 - c), v[1] * c + x[1] * s + k[1] * d * (1 - c), v[2] * c + x[2] * s + k[2] * d * (1 - c)];
}
/** A box of the world: [x0, x1], [y0, y1], [z0, z1], picture pixels. */
type Box3 = readonly [number, number, number, number, number, number];
/** A point put out of a box, if it is in it (`pad` more all round), the shortest way. */
function outOfBox(q: V3, b: Box3, pad: number): boolean {
  const [x0, x1, y0, y1, z0, z1] = b;
  if (q[0] < x0 - pad || q[0] > x1 + pad || q[1] < y0 - pad || q[1] > y1 + pad || q[2] < z0 - pad || q[2] > z1 + pad) return false;
  const ds: [number, number, number][] = [[0, x0 - pad - q[0], 0], [0, x1 + pad - q[0], 0], [1, y0 - pad - q[1], 0], [1, y1 + pad - q[1], 0], [2, z1 + pad - q[2], 0]];
  let best = ds[0];
  for (const d of ds) if (Math.abs(d[1]) < Math.abs(best[1])) best = d;
  q[best[0]] += best[1];
  return true;
}
/** How near the eye the nearest of `boxes` is, seen at (X, Y) from where the world's (0, 0, 0) is on the picture; or null. */
function boxDepth(X: number, Y: number, boxes: readonly Box3[]): number | null {
  let best: number | null = null;
  for (const [x0, x1, y0, y1, z0, z1] of boxes) {
    // along the line of sight, x and y each grow 1.25 for each pixel up
    const lo = Math.max(z0, (x0 - 0.625 * X) / 1.25 - Y, (y0 + 0.625 * X) / 1.25 - Y);
    const hi = Math.min(z1, (x1 - 0.625 * X) / 1.25 - Y, (y1 + 0.625 * X) / 1.25 - Y);
    if (hi < lo) continue;
    const x = 1.25 * (Y + hi) + 0.625 * X;
    const y = 1.25 * (Y + hi) - 0.625 * X;
    const d = dot3([x, y, hi], TOWARD);
    if (best === null || d > best) best = d;
  }
  return best;
}
/** Links of a chain along points of the world, painted into `deep` from (ax, ay), each as near as it is. */
function chainInDepth(deep: Deep, pts: readonly V3[], ax: number, ay: number, from: number, to: number, size: number, ramp: Ramp): void {
  const pitch = 5 * size;
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len3(sub3(pts[i], pts[i - 1])));
  const at = (s: number): V3 => {
    let i = 1;
    while (i < pts.length - 1 && cum[i] < s) i++;
    const t = cum[i] > cum[i - 1] ? (s - cum[i - 1]) / (cum[i] - cum[i - 1]) : 0;
    return lerp3(pts[i - 1], pts[i], Math.max(0, Math.min(1, t)));
  };
  const scratch = new Px(16, 16);
  // (the open ones first, then the ones edge on, each through the last's hole)
  for (const pass of [true, false]) {
    for (let k = Math.ceil(from / pitch); k * pitch <= Math.min(to, cum[cum.length - 1]); k++) {
      if ((k % 2 === 0) !== pass) continue;
      const q = at(k * pitch);
      const [x, y] = onPic(q[0], q[1], q[2]);
      const a = onPic(...at(Math.max(0, k * pitch - 1.5)));
      const b = onPic(...at(k * pitch + 1.5));
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      scratch.d.fill(0);
      const fx_ = x - Math.floor(x);
      const fy_ = y - Math.floor(y);
      link(scratch, 8 + fx_, 8 + fy_, (b[0] - a[0]) / L, (b[1] - a[1]) / L, pass, ramp, size);
      const near = dot3(q, TOWARD) + (pass ? 0 : 0.5);
      for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
        const c = scratch.get(xx, yy);
        if (c) deep.put(ax + Math.floor(x) - 8 + xx, ay + Math.floor(y) - 8 + yy, near, c);
      }
    }
  }
}

/**
 * THE BALL FALLS. One of the giant's iron balls sits on top of a tall ragged heap of fallen masonry,
 * its chain down the heap's side to a block of stone at its foot (`before`). Grit trickles from under
 * it and the stones round it shift; it rocks out toward the edge and back, several pixels, and again
 * further; then it tips over the edge and drops the heap's height, falling faster every frame, two
 * stones tumbling after it, and smashes into the flags (a jolt): they crack out round it and the
 * broken pieces jump, chips fly, dust bursts out low along the floor; it bounces high, well clear of
 * the dust, comes down again (a jolt) and bounces smaller, and rolls on toward the hero a long heavy
 * way, turning over, its chain paying out behind it until it goes taut: it snatches the block off
 * the heap's foot and drags it, and the ball, held, rocks back on its chain and is still. What is
 * left: the ball where it stopped, on the floor, its chain taut to the dragged block, the smashed
 * flags, the chips and the stones where they lie. (The first fresh look found the heap a tidy
 * plinth, the bounce lost in the dust, the ball sinking into the floor at the end: the heap is three
 * times as tall and ragged, the dust low, and the ball lies on the floor.) On the heap's own anchor,
 * at the middle of its tile.
 */
function ballFalls(): Film & { impact: number; second: number; taut: number } {
  const W = 320;
  const H = 260;
  const ax = 170;
  const ay = 150;
  const G = 1.5;
  const SUB = 4;
  const R = 10;
  // THE HEAP: a tall mound of the fallen wall, rubble and broken blocks every size, the biggest low, a
  // squared block on its top that the ball sits on; its near side (toward +y, the hero) steep, a sheer
  // drop under the block, a clear space of floor at its foot
  const PEAK: Box3 = [-8, 7, -12, 2, 44, 56];
  interface Lump { c: V3; r: number; rock: boolean; turn: number }
  const LUMPS: Lump[] = [];
  {
    let i = 0;
    for (let band = 0; band < 7; band++) {
      const z = band * 7;
      const n = 13 - band;
      for (let k = 0; k < n; k++, i++) {
        const a = (k / n) * Math.PI * 2 + hash(i, 1, 550) * 0.7;
        const r = 8 - band * 0.65 + hash(i, 2, 550) * 2.2;
        const cone = 31 * (1 - z / 66);
        let c: V3 = [Math.cos(a) * (cone - r * 0.5), -5 + Math.sin(a) * (cone - r * 0.5), z + r * 0.55];
        // (toward the hero: drawn back to a steep face, and none at its foot under the block)
        if (Math.sin(a) > 0.45) c = [c[0], Math.min(c[1], 3 - r * 0.6), c[2]];
        LUMPS.push({ c, r, rock: hash(i, 3, 550) < 0.45, turn: hash(i, 4, 550) * Math.PI * 2 });
      }
    }
  }
  /** Put a ball of `rad` at q out of the heap, if it is in it (the shortest way out of whatever it is in): the way it was pushed, or null. */
  const outOfHeap = (q: V3, rad: number): V3 | null => {
    let n: V3 | null = null;
    for (const L of LUMPS) {
      const d = sub3(q, L.c);
      const len = len3(d);
      if (len < L.r + rad && len > 1e-6) {
        const k = (L.r + rad) / len;
        q[0] = L.c[0] + d[0] * k;
        q[1] = L.c[1] + d[1] * k;
        q[2] = L.c[2] + d[2] * k;
        n = mul3(d, 1 / len);
      }
    }
    const cp: V3 = [Math.max(PEAK[0], Math.min(PEAK[1], q[0])), Math.max(PEAK[2], Math.min(PEAK[3], q[1])), Math.max(PEAK[4], Math.min(PEAK[5], q[2]))];
    const d = sub3(q, cp);
    const len = len3(d);
    if (len < rad) {
      const nn = len > 1e-6 ? mul3(d, 1 / len) : ([0, 0, 1] as V3);
      q[0] = cp[0] + nn[0] * rad;
      q[1] = cp[1] + nn[1] * rad;
      q[2] = cp[2] + nn[2] * rad;
      n = nn;
    }
    return n;
  };
  const HOME: V3 = [-1, -5, 56 + R];
  // the block the chain is fast to, at the heap's foot, and its size
  const BLOCK0: V3 = [-30, 16, 0];
  const BW = 7;
  const BD = 5;
  const BH = 8;
  const blockBox = (q: V3): Box3 => [q[0] - BW, q[0] + BW, q[1] - BD, q[1] + BD, 0, BH];
  const CHAIN_L = 128;
  // the ball's own measure, turned as it rolls: its body's x, y, z as ways in the world
  const EYE: V3 = norm3([-0.3, -0.2, 0.93]);
  const eyeOf = (c: V3, m: [V3, V3, V3]): V3 => add3(c, mul3(add3(add3(mul3(m[0], EYE[0]), mul3(m[1], EYE[1])), mul3(m[2], EYE[2])), R + 0.6));
  // THE TIMELINE: the shifting and the rocking; the drop
  const ROCKS = [0, 0.6, 1.8, 3.2, 4.4, 3.8, 2, 0.2, -1.2, -0.6, 1.4, 3.6, 5.4, 6.8];
  const GO = ROCKS.length;
  const D: V3 = [0, 1, 0];
  // THE BALL, step by step (and the block, once the chain drags it)
  interface State { c: V3; m: [V3, V3, V3]; b: V3 }
  const balls: State[] = [];
  let c: V3 = [...HOME];
  let v: V3 = [0, 0, 0];
  let m: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  let blk: V3 = [...BLOCK0];
  let bv: V3 = [0, 0, 0];
  let impact = -1;
  let second = -1;
  let taut = -1;
  let stopped = -1;
  let spin: V3 = [0, 0, 0];
  const FMAX = 200;
  const rollBy = (d: V3): void => {
    // rolling on the floor (or a block's top) by d: turned about the way across it
    const L = Math.hypot(d[0], d[1]);
    if (L < 1e-7) return;
    const axis = norm3([-d[1], d[0], 0]);
    m = m.map((q) => turnAbout(q, axis, L / R)) as [V3, V3, V3];
  };
  for (let f = 0; f < FMAX; f++) {
    if (f < GO) {
      const s = ROCKS[f];
      const was = f > 0 ? ROCKS[f - 1] : 0;
      c = add3(HOME, mul3(D, s));
      rollBy(mul3(D, s - was));
      // (tipped off the edge with a lurch, so that it falls clear of the heap the whole of its height: the second fresh look found it rolling down the face)
      if (f === GO - 1) v = [0.3, 4.4, 1.0];
    } else if (stopped < 0) {
      for (let k = 0; k < SUB; k++) {
        const dt = 1 / SUB;
        v = [v[0], v[1], v[2] - G * dt];
        const was = [...c] as V3;
        c = add3(c, mul3(v, dt));
        let touching: V3 | null = null;
        {
          const q: V3 = [...c];
          const n = outOfHeap(q, R);
          if (n) {
            c = q;
            const vn = dot3(v, n);
            if (vn < 0) v = sub3(v, mul3(n, vn * 1.3));
            touching = n;
          }
        }
        if (c[2] < R) {
          c[2] = R;
          touching = [0, 0, 1];
          if (v[2] < -2.2) {
            if (impact < 0) impact = f;
            else if (second < 0 && f > impact + 3) second = f;
            // it bounces: high the first time, smaller the next; the blow takes a little of its way along the floor
            v = [v[0] * 0.9, v[1] * 0.9, -v[2] * (second < 0 ? 0.64 : 0.34)];
          } else {
            v = [v[0], v[1], 0];
            // rolling on the stone: slowing, steadily (a heavy thing rolls on)
            const h = Math.hypot(v[0], v[1]);
            const k2 = h > 1e-9 ? Math.max(0, h - (taut >= 0 ? 0.07 : 0.022) * dt) / h : 0;
            v = [v[0] * k2, v[1] * k2, 0];
          }
        }
        // the chain: taut once the ball is its length from the block; it snatches the block and drags it, and the ball is held and pulled back
        if (impact >= 0) {
          const e = eyeOf(c, m);
          const ring: V3 = [blk[0], blk[1], BH + 1];
          const dd = sub3(e, ring);
          const L = len3(dd);
          if (L > CHAIN_L) {
            const n = mul3(dd, 1 / L);
            c = sub3(c, mul3(n, L - CHAIN_L));
            const vr = dot3(v, n);
            if (vr > 0) {
              // snatched: the block jerked after it; the ball pulled up short, rocked back, its way along the chain's swing checked
              if (taut < 0) taut = f;
              bv = add3(bv, mul3([n[0], n[1], 0], vr * 1.3));
              v = mul3(sub3(v, mul3(n, vr * 1.6)), 0.6);
            }
          }
        }
        const moved = sub3(c, was);
        if (touching) rollBy(moved);
        else {
          const w = len3(spin);
          if (w > 1e-7) m = m.map((q) => turnAbout(q, mul3(spin, 1 / w), w * dt)) as [V3, V3, V3];
        }
        if (touching) spin = mul3(norm3([-moved[1], moved[0], 0]), Math.hypot(moved[0], moved[1]) / R / dt);
        // the block: slides on the floor, gripping it hard
        blk = add3(blk, mul3(bv, dt));
        const bs = Math.hypot(bv[0], bv[1]);
        const kb = bs > 1e-9 ? Math.max(0, bs - 0.13 * dt) / bs : 0;
        bv = [bv[0] * kb, bv[1] * kb, 0];
      }
      if (impact >= 0 && taut >= 0 && f > taut + 4 && c[2] <= R + 0.01 && Math.hypot(v[0], v[1]) < 0.15 && Math.hypot(bv[0], bv[1]) < 0.1) {
        stopped = f;
        v = [0, 0, 0];
      }
    }
    balls.push({ c: [...c] as V3, m: m.map((q) => [...q]) as [V3, V3, V3], b: [...blk] as V3 });
  }
  if (impact < 0) throw new Error('the ball never strikes the floor');
  if (taut < 0) throw new Error('the chain never goes taut');
  if (stopped < 0) throw new Error('the ball never stops');
  const hit = balls[impact].c;
  // THE CHAIN, from the eye on the ball, down the heap's side and along the floor to the block's ring
  const N = 26;
  const ring0: V3 = [BLOCK0[0], BLOCK0[1], BH + 1];
  const start = eyeOf(HOME, balls[0].m);
  const path: V3[] = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    // (draped: down the heap's near face, then along its foot to the block)
    const mid_: V3 = [-22, 4, 22];
    path.push(t < 0.5 ? lerp3(start, mid_, t / 0.5) : lerp3(mid_, ring0, (t - 0.5) / 0.5));
  }
  const rope = new Rope(path, G, 1.5);
  rope.rest = CHAIN_L / N;
  const keep = (b: State) => (q: V3, i: number): boolean => {
    let hitAny = outOfHeap(q, 1.4) !== null;
    if (i < N - 1) hitAny = outOfBox(q, blockBox(b.b), 1.2) || hitAny;
    if (i > 1) {
      const d = sub3(q, b.c);
      const L = len3(d);
      if (L < R + 1.4 && L > 1e-6) {
        const n = mul3(d, (R + 1.4) / L);
        q[0] = b.c[0] + n[0];
        q[1] = b.c[1] + n[1];
        q[2] = b.c[2] + n[2];
        hitAny = true;
      }
    }
    return hitAny;
  };
  for (let s = 0; s < 80 * 4; s++) rope.step(1 / 4, (i) => (i === 0 ? start : i === N ? ring0 : null), keep(balls[0]), 0.5, 0.95);
  const chains: V3[][] = [];
  for (let f = 0; f < FMAX; f++) {
    const b = balls[f];
    const b0 = balls[Math.max(0, f - 1)];
    for (let s = 0; s < 4; s++) {
      const t = (s + 1) / 4;
      const c_ = lerp3(b0.c, b.c, t);
      const bb = lerp3(b0.b, b.b, t);
      const e = eyeOf(c_, t < 1 ? b0.m : b.m);
      rope.step(1 / 4, (i) => (i === 0 ? e : i === N ? ([bb[0], bb[1], BH + 1] as V3) : null), keep({ c: c_, m: b.m, b: bb }), 0.86, 0.997, 0.32);
    }
    chains.push(rope.x.map((q) => [...q] as V3));
  }
  // WHAT GOES WITH IT: a pebble first; stones tumbling off the top after the ball; the flags' broken pieces jumping; chips
  const pebble = flung(2, [PEAK[1] - 3, PEAK[3] - 2, PEAK[5] + 1.5], [0.6, 0.9, 1.2], FMAX, G, 0.45, 1.5);
  // (part of the heap's top comes down with it: five stones, the second fresh look's raise)
  const stones = [0, 1, 2, 3, 4].map((k) => ({ size: 3.8 - k * 0.3, path: flung(GO + 1 + k, [PEAK[0] + 2 + k * 3.2, PEAK[3] + 1, PEAK[5] + 2.5], [0.7 - k * 0.35, 1.6 + k * 0.3, 0.9], FMAX, G, 0.42, 3) }));
  const FLAGS = Array.from({ length: 5 }, (_, k) => {
    const a = (k / 5) * Math.PI * 2 + 0.4;
    const r = 13 + hash(k, 1, 541) * 4;
    return { a, o: [hit[0] + Math.cos(a) * r, hit[1] + Math.sin(a) * r * 0.9, 0] as V3, up: 3 + hash(k, 2, 541) * 1.8, tilt: (hash(k, 3, 541) - 0.5) * 0.8 };
  });
  /** How high a broken flag piece is, and how it is tipped, f frames on: jumping at the blow and falling back, left tipped. */
  const flagAt = (k: number, f: number): { z: number; tip: number } => {
    const t = f - impact;
    if (t < 0) return { z: 0, tip: 0 };
    const F = FLAGS[k];
    const z = Math.max(0, F.up * t - 0.5 * G * 1.2 * t * t);
    return { z, tip: F.tilt * Math.min(1, t / 4) };
  };
  const chips = Array.from({ length: 10 }, (_, k) => {
    const a = hash(k, 1, 482) * Math.PI * 2;
    const sp = 2 + 2.4 * hash(k, 2, 482);
    return flung(impact, [hit[0] + Math.cos(a) * 5, hit[1] + Math.sin(a) * 5, 2], [Math.cos(a) * sp, Math.sin(a) * sp, 2.5 + 3.5 * hash(k, 3, 482)], FMAX, G, 0.4, 1);
  });
  const CRACKS = Array.from({ length: 9 }, (_, k) => {
    const a = (k / 9) * Math.PI * 2 + hash(k, 1, 480) * 0.5;
    const L = 12 + hash(k, 2, 480) * 14;
    const pts: [number, number][] = [];
    let x = hit[0] + Math.cos(a) * 5;
    let y = hit[1] + Math.sin(a) * 5;
    let ang = a;
    for (let s = 0; s < L; s += 1.2) {
      ang += (hash(k, Math.floor(s), 481) - 0.5) * 0.7;
      x += Math.cos(ang) * 1.2;
      y += Math.sin(ang) * 1.2;
      pts.push([x, y]);
    }
    return pts;
  });
  // THE DUST: low along the floor at the blow (the ball bounces up clear of it); smaller at the second; where the block is snatched
  const clouds: Cloud[] = [];
  // (puffing up a little off the floor, and out along it, then settling)
  clouds.push({ f0: impact, o: [hit[0], hit[1] + 2, 2], v: [0.3, 0.5, 0.9], r: 12, hang: 3, seed: 60 });
  for (const sd of [-1, 1]) clouds.push({ f0: impact, o: [hit[0] + sd * 6, hit[1] - sd * 5, 2], v: [sd * 1.8, -sd * 1.4, 0.6], r: 8, hang: 2, seed: 61 + sd });
  if (second > 0) clouds.push({ f0: second, o: [balls[second].c[0], balls[second].c[1] + 3, 2], v: [0.4, 1, 0.6], r: 7, hang: 2, seed: 64 });
  clouds.push({ f0: taut + 1, o: [balls[taut].b[0], balls[taut].b[1] + 4, 2], v: [0.2, 0.8, 0.5], r: 7, hang: 2, seed: 65 });
  // grit from under the ball, sifting down the heap's near face as it rocks
  const grit: { f0: number; o: V3 }[] = [];
  for (let k = 0; k < 14; k++) grit.push({ f0: 1 + Math.floor(k * 0.9), o: [HOME[0] + (hash(k, 3, 483) - 0.5) * 12, PEAK[3] + 1 + hash(k, 4, 483) * 2, PEAK[5] - 1] });
  // IT IS OVER when the ball, the block, the chain and all that flew have come to rest and the dust is gone
  const still = (path: (V3 | null)[]): number => path.findIndex((q, i) => i > 3 && q !== null && path[i - 1] !== null && q[0] === path[i - 1]![0] && q[1] === path[i - 1]![1] && q[2] === path[i - 1]![2]) - 1;
  let END = Math.max(stopped + 3, ...clouds.map(cloudEnd), ...chips.map(still), ...stones.map((s) => still(s.path)), impact + 12);
  for (let f = stopped; f < FMAX; f++) if (chains[f].every((q, i) => len3(sub3(q, chains[f - 1][i])) < 0.35)) {
    END = Math.max(END, f);
    break;
  }
  END = Math.min(FMAX - 1, END);
  // THE HEAP'S PICTURE, and how near the eye each pixel of it is: the squared block on its top, then
  // every lump of rubble, each a rough faceted lump lit from the upper left, as near as its face is
  const heap = new Px(W, H);
  const heapDepth = new Float32Array(W * H).fill(-1e9);
  const SR: Ramp = [STONE[0], STONE[0], STONE[1], STONE[2], STONE[3]];
  const RR: Ramp = [ROCK[0], ROCK[0], ROCK[1], ROCK[2], ROCK[3]];
  {
    const pk = new Px(W, H);
    new Iso(pk, ax, ay).box(PEAK[0] / KT, PEAK[2] / KT, PEAK[1] / KT, PEAK[3] / KT, PEAK[4], PEAK[5], {
      top: (u, vv) => (vv < 0.08 || u < 0.07 ? STONE[3] : hash(Math.floor(u * 5), Math.floor(vv * 5), 484) < 0.3 ? STONE[1] : STONE[2]),
      left: (u, vv, w, h) => (vv === 0 ? STONE[3] : vv >= h - 1 ? STONE[0] : u === 0 ? STONE[2] : (u + vv * 2) % 11 === 0 ? STONE[0] : mix(STONE[1], STONE[2], 0.6)),
      right: (_u, vv, _w, h) => (vv === 0 ? STONE[2] : vv >= h - 1 ? STONE[0] : mix(STONE[0], STONE[1], 0.5)),
    });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const col = pk.get(x, y);
      if (!col) continue;
      heap.set(x, y, col);
      heapDepth[y * W + x] = boxDepth(x + 0.5 - ax, y + 0.5 - ay, [PEAK]) ?? -1e9;
    }
  }
  for (const L of LUMPS) {
    const [px, py] = onPic(L.c[0], L.c[1], L.c[2]);
    const cx = ax + px;
    const cy = ay + py;
    const rx = L.r * 1.12;
    const ry = L.r * 0.92;
    const ramp = L.rock ? RR : SR;
    const near = dot3(L.c, TOWARD);
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) {
      for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        const a = Math.atan2(dy, dx);
        // (rough: its outline bumped, flat-sided)
        const edge = 1 - 0.13 * Math.abs(Math.sin((a + L.turn) * 2.5)) - 0.06 * Math.sin((a + L.turn) * 5);
        const d2 = dx * dx + dy * dy;
        if (d2 > edge * edge) continue;
        const nz = Math.sqrt(Math.max(0, 1 - d2 / (edge * edge)));
        const depth = near + nz * L.r * 0.9;
        if (depth <= heapDepth[y * W + x]) continue;
        // faceted: the way it faces snapped to one of its five flat sides
        const sector = Math.round(((a + L.turn) / (Math.PI * 2)) * 5);
        const fa = (sector / 5) * Math.PI * 2 - L.turn;
        const r_ = Math.sqrt(d2) / edge;
        const nx = Math.cos(fa) * Math.min(1, r_ * 1.4);
        const ny = Math.sin(fa) * Math.min(1, r_ * 1.4);
        const lam = -0.55 * nx - 0.65 * ny + 0.5 * (1 - Math.min(1, r_ * 1.4));
        heap.set(x, y, r_ > 0.93 && dx + dy > 0.4 ? ramp[0] : lam > 0.35 ? ramp[4] : lam > -0.05 ? ramp[3] : lam > -0.45 ? ramp[2] : ramp[1]);
        heapDepth[y * W + x] = depth;
      }
    }
  }
  /** The ball's skin, turned as the ball is: a point of it as seen, to where it is on the ball. */
  const turnOf = (mm: [V3, V3, V3]) => (n: V3): V3 => {
    const w = add3(add3(mul3(CAM_R, n[0]), mul3(CAM_D, n[1])), mul3(CAM_T, n[2]));
    return [dot3(w, mm[0]), dot3(w, mm[1]), dot3(w, mm[2])];
  };
  const paint = (f: number): Px => {
    const b = balls[f];
    const floor = new Px(W, H);
    // the flags smashed where it struck (from the blow on): the dent, the cracks running out (a frame or two to run their length)
    if (f >= impact) {
      const [hx, hy] = onPic(hit[0], hit[1], 0);
      for (let y = -6; y <= 6; y++) for (let x = -10; x <= 10; x++) {
        const r = (x / 9) ** 2 + (y / 4.8) ** 2;
        if (r <= 1) floor.set(Math.round(ax + hx + x), Math.round(ay + hy + y), r < 0.4 ? DEEP : y < 0 ? '#100d22' : SLAB[0]);
      }
      const grow = Math.min(1, (f - impact + 1) / 3);
      CRACKS.forEach((pts, k) => pts.slice(0, Math.ceil(pts.length * grow)).forEach(([x, y], j) => {
        const [px, py] = onPic(x, y, 0);
        floor.set(Math.round(ax + px), Math.round(ay + py), DEEP);
        if (j < pts.length * 0.5) floor.set(Math.round(ax + px) + 1, Math.round(ay + py), k % 2 ? DEEP : GROOVE_LIT);
      }));
    }
    // the ball's shadow on the floor under it, smaller the higher it is
    {
      const [sx, sy] = onPic(b.c[0], b.c[1], 0);
      const up = Math.max(0, b.c[2] - R);
      const rr = R * (1.05 - Math.min(0.5, up / 70));
      for (let y = -Math.ceil(rr * 0.5); y <= rr * 0.5; y++) for (let x = -Math.ceil(rr); x <= rr; x++) {
        const q = (x / rr) ** 2 + (y / (rr * 0.5)) ** 2;
        if (q > 1) continue;
        const X = Math.round(ax + sx + x + 2);
        const Y = Math.round(ay + sy + y + 1);
        if (heapDepth[Y * W + X] > -1e8) continue;
        floor.set(X, Y, q < 0.5 && up < 30 ? '#0a0918' : '#100e22');
      }
    }
    // THE DUST, low, on the floor under all that stands and moves
    for (const cl of clouds) paintCloud(floor, cl, f, (q) => {
      const [x, y] = onPic(q[0], q[1], q[2]);
      return [ax + x, ay + y];
    });
    // THE HEAP, THE BALL, ITS CHAIN, THE BLOCK, THE BROKEN FLAGS, each pixel as near as it is
    const things = new Px(W, H);
    const dt = new Deep(things);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const col = heap.get(x, y);
      if (col) dt.put(x, y, heapDepth[y * W + x], col);
    }
    // the block, dragged
    {
      const bb = blockBox(b.b);
      const bp = new Px(W, H);
      new Iso(bp, ax, ay).box(bb[0] / KT, bb[2] / KT, bb[1] / KT, bb[3] / KT, bb[4], bb[5], { top: (u, vv) => (vv < 0.1 || u < 0.08 ? STONE[3] : STONE[2]), left: litSide(SR), right: shadeSide(SR) });
      const [rx, ry] = onPic(b.b[0], b.b[1], BH + 0.5);
      ironRing(bp, ax + rx, ay + ry, 2.6, 1.2, SMALL_IRON, 0.6);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const col = bp.get(x, y);
        if (col) dt.put(x, y, (boxDepth(x + 0.5 - ax, y + 0.5 - ay, [bb]) ?? dot3(add3(b.b, [0, 0, BH]), TOWARD)) + 0.5, col);
      }
    }
    // the broken flags, jumping
    FLAGS.forEach((F, k) => {
      const { z, tip } = flagAt(k, f);
      if (f < impact) return;
      const fp = new Px(W, H);
      const fi = new Iso(fp, ax, ay);
      const s = 0.1;
      fi.box((F.o[0] - 5) / KT, (F.o[1] - 4) / KT, (F.o[0] + 5) / KT, (F.o[1] + 4) / KT, z, z + 2, { top: (u) => (u + tip < 0.35 ? SLAB[3] : u + tip > 0.8 ? SLAB[1] : SLAB[2]), left: () => SLAB[0], right: () => '#100d22' });
      void s;
      const d = dot3([F.o[0], F.o[1], z + 2], TOWARD);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const col = fp.get(x, y);
        if (col) dt.put(x, y, d, col);
      }
    });
    // (the chain's links begin a shackle's length off the ball: the second fresh look found the first
    // link, lying on the ball's face, reading as a dark-ringed pupil as it rolled)
    chainInDepth(dt, [eyeOf(b.c, b.m), ...chains[f].slice(1)], ax, ay, 6.5, 999, 0.85, SMALL_IRON);
    const [bx, by] = onPic(b.c[0], b.c[1], b.c[2]);
    ironBall(things, ax + bx, ay + by, R, BALL_IRON, 5, turnOf(b.m), dt, dot3(b.c, TOWARD));
    // its eye, where the chain is fast: a pale iron shackle, a short thick bar from the ball out to the
    // first link (no ring, no hole), if it is on the side toward us
    const e = eyeOf(b.c, b.m);
    if (dot3(sub3(e, b.c), TOWARD) > -1) {
      const nx = chains[f][1] ?? e;
      const dir = sub3(nx, e);
      const dl = len3(dir) || 1;
      const tip = add3(e, mul3(dir, Math.min(6.5, dl) / dl));
      const [ex, ey] = onPic(e[0], e[1], e[2]);
      const [tx, ty] = onPic(tip[0], tip[1], tip[2]);
      const lug = new Px(W, H);
      const n = Math.max(2, Math.ceil(Math.hypot(tx - ex, ty - ey) * 2));
      for (let i = 0; i <= n; i++) {
        const x = Math.round(ax + ex + ((tx - ex) * i) / n);
        const y = Math.round(ay + ey + ((ty - ey) * i) / n);
        lug.set(x, y + 1, SMALL_IRON[1]);
      }
      for (let i = 0; i <= n; i++) {
        const x = Math.round(ax + ex + ((tx - ex) * i) / n);
        const y = Math.round(ay + ey + ((ty - ey) * i) / n);
        lug.set(x, y, SMALL_IRON[3]);
      }
      lug.set(Math.round(ax + ex), Math.round(ay + ey), SMALL_IRON[4]);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const col = lug.get(x, y);
        if (col) dt.put(x, y, dot3(e, TOWARD) + 1, col);
      }
    }
    // the stones tumbling after it
    for (const [k, st] of stones.entries()) {
      const q = st.path[f];
      if (!q) continue;
      const qq: V3 = [...q];
      outOfHeap(qq, st.size);
      const [x, y] = onPic(qq[0], qq[1], qq[2]);
      const sp = new Px(W, H);
      const moving = f > 0 && st.path[f - 1] !== null && len3(sub3(q, st.path[f - 1]!)) > 0.2;
      chunkAt(sp, ax + x, ay + y, st.size, (moving ? f * 0.8 : 0) + k * 2);
      const d = dot3(qq, TOWARD) + st.size;
      for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
        const col = sp.get(xx, yy);
        if (col) dt.put(xx, yy, d, col);
      }
    }
    const out = compose(floor, [things], null);
    // the pebble, the chips, the grit
    const bits = new Px(W, H);
    const pb = pebble[f];
    if (pb) {
      const q: V3 = [...pb];
      outOfHeap(q, 1.2);
      const [x, y] = onPic(q[0], q[1], q[2]);
      bits.rect(Math.round(ax + x) - 1, Math.round(ay + y) - 1, 3, 2, STONE[3]).set(Math.round(ax + x) + 1, Math.round(ay + y), STONE[1]).set(Math.round(ax + x) - 1, Math.round(ay + y), STONE[4]);
    }
    for (const ch of chips) {
      const q = ch[f];
      if (!q) continue;
      const [x, y] = onPic(q[0], q[1], q[2]);
      bits.set(Math.round(ax + x), Math.round(ay + y), STONE[4]).set(Math.round(ax + x) + 1, Math.round(ay + y), STONE[2]).set(Math.round(ax + x), Math.round(ay + y) + 1, STONE[1]);
    }
    for (const g of grit) {
      const t = f - g.f0;
      if (t < 0) continue;
      const q: V3 = [g.o[0] + 0.2 * t, g.o[1] + 0.35 * t, g.o[2] - 0.5 * G * t * t];
      if (q[2] < 0.5) continue;
      outOfHeap(q, 1);
      const [x, y] = onPic(q[0], q[1], q[2]);
      bits.set(Math.round(ax + x), Math.round(ay + y), STONE[3]).set(Math.round(ax + x) + 1, Math.round(ay + y), STONE[3]).set(Math.round(ax + x), Math.round(ay + y) + 1, STONE[1]).set(Math.round(ax + x) + 1, Math.round(ay + y) + 1, STONE[1]);
    }
    fastBlit(out, compose(null, [bits], null), 0, 0);
    return out;
  };
  // (painted first, then the tail cut where nothing more than a few pixels changes: the last of the dust and the chain settling)
  const painted: Px[] = [];
  for (let f = 0; f <= END; f++) painted.push(paint(f));
  const changed = (a: Px, b: Px): number => {
    let n = 0;
    for (let k = 0; k < a.d.length; k++) if (a.d[k] !== b.d[k]) n++;
    return n;
  };
  while (END > impact + 12 && changed(painted[END], painted[END - 1]) < 24) END--;
  const frames: Sprite[] = [];
  for (let f = 0; f <= END; f++) frames.push(cut(painted[f], ax, ay));
  // THE TRACKS
  const tr = (name: string, pos: (f: number) => V3 | null, size: number): Track => {
    const t: Track = { name, at: [] };
    let prev_: [number, number] | null = null;
    for (let f = 0; f <= END; f++) {
      const q = pos(f);
      if (!q) {
        t.at.push(null);
        continue;
      }
      const [x, y] = onPic(q[0], q[1], q[2]);
      t.at.push({ x, y, shown: 1, size: size + (prev_ ? Math.hypot(x - prev_[0], y - prev_[1]) : 0) });
      prev_ = [x, y];
    }
    return t;
  };
  const tracks: Track[] = [
    tr('the ball', (f) => balls[f].c, 2 * R),
    tr('the block', (f) => balls[f].b, 10),
    tr('the pebble', (f) => pebble[f], 4),
    ...stones.map((st, k) => tr(`stone ${k + 1}`, (f) => st.path[f], 6)),
    ...chips.map((ch, k) => tr(`chip ${k + 1}`, (f) => ch[f], 3)),
    ...FLAGS.map((F, k) => tr(`flag ${k + 1}`, (f) => (f >= impact ? [F.o[0], F.o[1], flagAt(k, f).z] : null), 8)),
  ];
  return { frames, before: [frames[0]], after: [frames[END]], tracks, jolts: second > 0 ? [impact, second] : [impact], impact, second, taut };
}

/** THE CELL GRATE's opening: a tall barred front to a cell, from the floor up to a heavy lintel, its four thick bars (u across the face, picture pixels). */
const CG_U0 = -12;
const CG_U1 = 11;
const CG_V1 = 60;
const CG_BARS = [-8, 0, 8] as const;
/** The grate's stone: its jambs and lintel standing proud, the dark of the cell inside, the bars' sockets. */
function cellGrateFrame(p: Px): void {
  const hole = (u: number, v: number): boolean => u >= CG_U0 && u <= CG_U1 && v >= 0 && v <= CG_V1;
  relief(p, FACE, (u, v) => u >= CG_U0 - 3 && u <= CG_U1 + 3 && v >= 0 && v <= CG_V1 + 5 && !hole(u, v), CG_U0 - 4, CG_U1 + 4, 0, CG_V1 + 6);
  for (let v = 0; v <= CG_V1; v++) for (let u = CG_U0; u <= CG_U1; u++) p.set(fx(u), fy(v), v === CG_V1 ? FACE[1] : DEEP);
  for (const u of CG_BARS) p.set(fx(u - 1), fy(CG_V1 + 1), DEEP).set(fx(u), fy(CG_V1 + 1), DEEP).set(fx(u + 1), fy(CG_V1 + 1), DEEP);
}
/** One thick bar of the grate on a flat picture, straight from the floor to the lintel: lit on its left, dark on its right, a rivet's head at its foot. */
function grateBar(b: Px, u: number): void {
  for (let v = 0; v <= CG_V1; v++) b.set(fx(u - 1), fy(v), IRONS[3]).set(fx(u), fy(v), IRONS[2]).set(fx(u + 1), fy(v), IRONS[0]);
  b.set(fx(u - 1), fy(CG_V1 - 2), GLINT).set(fx(u - 1), fy(2), IRONS[4]);
}
/** THE CELL GRATE, as a wall piece, the wall's height: the barred front of a cell from the floor to its lintel, four thick bars, dark inside. What the bars-shaking moment plays in. */
function cellGrate(p: Px): void {
  cellGrateFrame(p);
  const b = flat();
  for (const u of CG_BARS) grateBar(b, u);
  seamed(p, b);
}

/**
 * THE BARS SHAKE. The barred front of a cell, a tall grate from the floor to its lintel, black
 * inside (`before`). The bars tremble; two pink eyes rise into the gaps high in the dark, a matched
 * pair, and under them two huge grey hands come up out of the black and close round the two outer
 * bars, behind them, their knuckled fingers wrapped round each. Then he shakes them: three heaves,
 * each harder (each a jolt): the bars flex and spring, rattling side to side and out into the room
 * and back, the mortar cracking out from the grate's corners further each time, stones popping out
 * of the jambs and bouncing away across the floor, dust blasting from the joints, his eyes
 * narrowing and flaring; at the third the bar in his hand toward the eye bows right out of the grate
 * into the room, both its ends still fast, and the pin at its head shoots out across the floor in an
 * arc, pinging as it bounces. He holds it, trembling; his fingers open, and his hands slide down off
 * the bars into the black; his eyes go back into it, smaller and dimmer and nearer each other. What
 * is left (`after`): the grate, a bar bowed out, the cracks, the stones and the pin on the floor.
 * (The first fresh look found the old window torso-sized, a flicker at a phone's size, its hands
 * thin strips, its eyes one pink and one gold pixel, its rivet lost: this is the full height of the
 * wall, the hands huge, the eyes a pair, the pin shot well out.) For the face turned to screen-left
 * (`alongX`) or to screen-right; anchored as a wall piece is.
 */
function barsShake(alongX: boolean): Film & { yanks: number[] } {
  const W = 240;
  const H = 190;
  const ax = 120;
  const ay = 130;
  const face = faceAt(alongX);
  /** (u across the face in picture pixels, v up, b out into the room) on the picture. */
  const pic = (u: number, v: number, b: number): [number, number] => {
    const [x, y] = face(u / 0.8, b, v);
    return [ax + x, ay + y];
  };
  const G = 1.3;
  // THE TIMELINE
  const RATTLE = 1;
  const EYES = [2, 8] as const;
  const HANDS = [4, 10] as const;
  const YANKS = [11, 20, 30];
  const BEND = YANKS[2];
  const LET_GO = 40;
  const SINK = [42, 52] as const;
  const EYES_GO = [44, 54] as const;
  // the bar that bows out at the last heave: the outer one in his hand on the side the room is seen from (so that it bows out clear of the others)
  const BENT = alongX ? 0 : 2;
  const held = [0, 2];
  // the shaking: how far the grate is wrenched (across the face, and out into the room) frame by frame at each heave
  const BURSTS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
    [[1.6, 5], [-1.4, -2], [1.2, 4], [-1, -1.4], [0.7, 2.4], [-0.4, -0.8], [0.2, 0.8]],
    [[-1.8, 6], [1.6, -2.4], [-1.4, 5], [1.2, -1.8], [-0.8, 3], [0.5, -1], [-0.3, 1.2], [0.1, -0.4]],
    [[2, 7], [-1.8, -2], [1.6, 6], [-1.2, -1.8], [0.9, 3.6], [-0.6, -1.2], [0.3, 1]],
  ];
  const shakeOf = (f: number): [number, number] => {
    for (const [k, y] of YANKS.entries()) {
      const i = f - y;
      if (i >= 0 && i < BURSTS[k].length) return [BURSTS[k][i][0], BURSTS[k][i][1]];
    }
    if (f >= RATTLE && f < RATTLE + 3) return [[0.8, -0.6, 0.4][f - RATTLE], 0];
    if (f >= HANDS[1] && f < LET_GO) return [0.4 * Math.sin(f * 2.1), 0.6 * Math.sin(f * 2.9)];
    return [0, 0];
  };
  /** How much a bar flexes with the shake, `v` up it: most in its middle, the ones he holds most. */
  const prof = (v: number): number => Math.sin((Math.PI * v) / CG_V1);
  /** The bowed bar: out into the room from the last heave, both ends fast. */
  const bow = (k: number, v: number, f: number): number => (k === BENT && f >= BEND ? 13 * Math.sin((Math.PI * v) / CG_V1) * Math.min(1, (f - BEND + 1) / 2) : 0);
  /** Where a point of bar k is, `v` up it, on frame f: (u, b). */
  const barAt = (k: number, v: number, f: number): [number, number] => {
    const [su, sb] = shakeOf(f);
    const w = (held.includes(k) ? 1 : 0.55) * prof(v);
    return [CG_BARS[k] + su * w, sb * w + bow(k, v, f)];
  };
  // HIS HANDS: which bar each grips, where its fingers are up it, and which side it comes round from
  const GRIPS: ReadonlyArray<{ bar: number; v: number; side: 1 | -1 }> = [
    { bar: 0, v: 40, side: 1 },
    { bar: 2, v: 38, side: -1 },
  ];
  /** How far in the dark his hands are (1: all dark, not come or gone), how far below where they grip, and how far his fingers are closed round the bars, on frame f. */
  // (they come out of the dark rising; they go sliding down and back behind the sill, never darkening in place)
  const handDim = (f: number): number => (f < HANDS[0] ? 1 : f < HANDS[1] ? 1 - smooth((f - HANDS[0]) / (HANDS[1] - HANDS[0])) : 0);
  const SLIDE = 54;
  const handLow = (f: number): number => (f < HANDS[1] ? 14 * (1 - smooth((f - HANDS[0] + 1) / (HANDS[1] - HANDS[0] + 1))) : f < SINK[0] - 1 ? 0 : SLIDE * smooth(Math.min(1, (f - SINK[0] + 2) / (SINK[1] - SINK[0] + 2))));
  const handBack = (f: number): number => (f < SINK[0] - 1 ? 0 : 4 * smooth(Math.min(1, (f - SINK[0] + 2) / (SINK[1] - SINK[0] + 2))));
  /** How much of a hand is seen (above the sill), on frame f. */
  const handShown = (hnd: { v: number }, f: number): number => (1 - handDim(f)) * Math.max(0, Math.min(1, (hnd.v - handLow(f) + 8) / 24));
  const grip = (f: number): number => (f < HANDS[1] - 3 ? 0.15 : f < HANDS[1] + 1 ? 0.15 + 0.85 * smooth((f - HANDS[1] + 3) / 4) : f < LET_GO ? 1 : 1 - 0.8 * smooth((f - LET_GO + 1) / 4));
  // HIS EYES: how bright (0 to 4), how high, how far apart, how open (rows), on frame f
  const eyeOf = (f: number): { lvl: number; v: number; apart: number; open: number } => {
    if (f < EYES[0]) return { lvl: 0, v: 46, apart: 8, open: 0 };
    if (f < EYES[1]) {
      const t = (f - EYES[0] + 1) / (EYES[1] - EYES[0] + 1);
      return { lvl: Math.ceil(4 * t), v: 46 + 10 * smooth(t), apart: 8, open: t > 0.5 ? 2 : 1 };
    }
    if (f < EYES_GO[0]) {
      const flare = YANKS.some((y) => f - y >= 0 && f - y < 3);
      return { lvl: 4, v: 56, apart: 8, open: flare ? 1 : 2 };
    }
    const t = Math.min(1, (f - EYES_GO[0] + 1) / (EYES_GO[1] - EYES_GO[0] + 1));
    return { lvl: Math.max(0, Math.ceil(4 * (1 - t) - 0.01)), v: 56 - 4 * t, apart: 8 - 3 * t, open: t < 0.5 ? 2 : 1 };
  };
  // THE PIN, shot out of the bowed bar's head at the last heave, across the floor in an arc, bouncing
  const pinPath = flung(BEND, [CG_BARS[BENT], 2, CG_V1 - 3], [alongX ? -0.8 : 0.8, 3.6, 2.8], 140, G, 0.5, 1.2);
  // (flung's (x, y, z) here are (u, b, v))
  const pings = new Set<number>();
  for (let f = BEND + 2; f < pinPath.length; f++) {
    const a = pinPath[f - 2];
    const b = pinPath[f - 1];
    const c = pinPath[f];
    if (a && b && c && b[2] <= 1.21 && a[2] > b[2] && c[2] > b[2]) pings.add(f - 1);
  }
  // STONES popping out of the jambs and the lintel at each heave, bouncing away across the floor
  const stones = YANKS.flatMap((y, j) => Array.from({ length: 2 + j }, (_, k) => {
    const n = j * 10 + k;
    const side = hash(n, 1, 560) < 0.5 ? -1 : 1;
    const u = side < 0 ? CG_U0 - 2 : CG_U1 + 2;
    const v = 8 + hash(n, 2, 560) * (CG_V1 - 4);
    return { size: 2.4 + hash(n, 3, 560) * 1.6, path: flung(y, [u, 1.5, v], [side * (0.4 + hash(n, 4, 560)), 1.6 + hash(n, 5, 560) * 2, 0.8 + hash(n, 6, 560) * 1.6], 140, G, 0.42, 1.6) };
  }));
  // RUST AND GRIT shaken off the bars at each heave
  interface Grain2 { f0: number; u: number; v: number; b: number; vu: number; vb: number }
  const grains: Grain2[] = [];
  YANKS.forEach((y, j) => {
    for (let i = 0; i < 5 + j * 2; i++) for (let k = 0; k < 2; k++) {
      const n = j * 100 + i * 3 + k;
      grains.push({ f0: y + i, u: CG_BARS[Math.floor(hash(n, 1, 490) * 4)] + hash(n, 2, 490) * 2 - 1, v: 10 + hash(n, 3, 490) * (CG_V1 - 14), b: 1.5, vu: (hash(n, 4, 490) - 0.5) * 0.8, vb: 0.3 + hash(n, 5, 490) * 1.2 });
    }
  });
  const grainAt = (g: Grain2, f: number): [number, number, number] | null => {
    const t = f - g.f0;
    if (t < 0) return null;
    const v = g.v - 0.5 * G * t * t;
    if (v < 0.5) return null;
    return [g.u + g.vu * t, v, g.b + g.vb * t];
  };
  // DUST blasting from the joints round the grate at each heave (in the face's own measure: a along, b out, z up)
  const clouds: Cloud[] = [];
  YANKS.forEach((y, j) => {
    const at: ReadonlyArray<readonly [number, number]> = [[CG_U0 - 3, CG_V1 + 4], [CG_U1 + 3, CG_V1 + 4], [CG_U0 - 3, 30 + j * 6], [CG_U1 + 3, 24 + j * 8]];
    at.forEach(([u, v], k) => {
      if ((j + k) % 2 === 1 && j < 2) return;
      clouds.push({ f0: y, o: [(u + (u < 0 ? -3 : 3)) / 0.8, 3, v], v: [(u < 0 ? -1.4 : 1.4), 1.2 + 0.3 * j, 0.2], r: 5 + j * 1.2, hang: 2, seed: 70 + j * 5 + k });
    });
  });
  // IT IS OVER when the pin and the stones lie still, the eyes are gone, the hands are gone and the dust is down
  const still = (path: (V3 | null)[]): number => path.findIndex((q, i) => i > 3 && q !== null && path[i - 1] !== null && q[0] === path[i - 1]![0] && q[1] === path[i - 1]![1] && q[2] === path[i - 1]![2]) - 1;
  const END = Math.max(EYES_GO[1] + 2, SINK[1] + 2, still(pinPath), ...stones.map((s) => still(s.path)), ...clouds.map(cloudEnd));
  // THE GRATE'S STONE: the same on every frame
  const frame = flat();
  cellGrateFrame(frame);
  const stone = new Px(W, H);
  fastBlit(stone, onFacePx(frame, alongX), ax - PCX, ay - PFOOT);
  const dimmed = (c: string, d: number): string => (d > 0 ? mix(c, DEEP, Math.min(1, d)) : c);
  const paint = (f: number): Px => {
    const back = new Px(W, H);
    const bars = new Px(W, H);
    const hands = new Px(W, H);
    const put = (p: Px, u: number, v: number, b: number, c: string): void => {
      const [x, y] = pic(u, v, b);
      p.set(Math.round(x), Math.round(y), c);
    };
    const dim = handDim(f);
    const g = grip(f);
    const low = handLow(f);
    // HIS EYES, in the gaps high in the dark: a matched pair, pink burning to gold as they flare, narrowing at each heave
    const e = eyeOf(f);
    if (e.lvl > 0) {
      for (const s of [-1, 1]) {
        const eu = Math.round((s * e.apart) / 2) - 1;
        // (each the same: a pink slit, its middle two pixels the brightest; burning hotter, both alike, as he heaves)
        const body = FLAME[Math.min(2, Math.max(1, e.lvl - 1))];
        const rim = FLAME[Math.max(0, Math.min(1, e.lvl - 2))];
        for (let du = 0; du < 3; du++) put(back, eu + du, e.v, 0, du === 1 ? body : e.lvl >= 3 ? body : rim);
        if (e.open >= 2) for (let du = 0; du < 3; du++) put(back, eu + du, e.v - 1, 0, du === 1 ? body : rim);
      }
    }
    // HIS HANDS, behind the bars: big and pale grey; the back of each in the dark beside its bar, the
    // wrist under it and the forearm going down and back into the black; four fingers curled round
    // the front of the bar, one over the other, a dark gap between each; the thumb wrapped across the
    // near side of the bar under them. They go by sliding down and back behind the sill, the forearms
    // first (the second fresh look found them darkening in place, and too small to read as hands).
    const inOpening = (v: number): boolean => v >= 1;
    for (const hnd of GRIPS) {
      if (dim >= 1) continue;
      const v0 = hnd.v - low;
      const back_ = handBack(f);
      const d = dim * 0.85;
      const sd = hnd.side;
      const [bu, bb] = barAt(hnd.bar, v0, f);
      const bz = Math.min(0, bb) - 1 - back_;
      const putIn = (p: Px, u: number, v: number, b: number, c: string): void => {
        if (inOpening(v)) put(p, u, v, b, c);
      };
      // the forearm, down and back from the wrist into the dark, darker the further it goes
      for (let v = v0 - 30; v < v0 - 12; v++) {
        const t = (v0 - 12 - v) / 18;
        const cu = bu + sd * (4.5 + 2.5 * t);
        const hw = 3.2 + 0.8 * t;
        for (let u = Math.floor(cu - hw); u <= Math.ceil(cu + hw); u++) {
          const x = (u - cu) / hw;
          if (Math.abs(x) > 1) continue;
          const tone = x * sd < -0.5 ? HAND_GREY[2] : x * sd > 0.55 ? HAND_GREY[0] : HAND_GREY[1];
          putIn(back, u, v, bz - 2 * t, dimmed(tone, Math.min(1, d + 0.25 + 0.7 * t)));
        }
      }
      // the wrist, and the back of the hand over it, broad, lit along its top
      for (let v = v0 - 13; v <= v0 + 8; v++) for (let u = -4; u <= 12; u++) {
        const wrist = v < v0 - 6;
        const r = wrist ? ((u - 4.5) / 3.6) ** 2 : ((u - 4) / 7.5) ** 2 + ((v - v0 - 0.5) / 7.5) ** 2;
        if (r > 1) continue;
        const top = !wrist && v > v0 + 4;
        const tone = top ? HAND_GREY[3] : wrist ? HAND_GREY[1] : r < 0.5 ? HAND_GREY[2] : HAND_GREY[1];
        putIn(back, bu + sd * u, v, bz, dimmed(tone, d + (wrist ? 0.15 : 0)));
      }
      // the fingers: four, curled round the front of the bar from the hand's side, shaded as one mass
      // (lit along its top, in shade along its foot), their tips lit and each ending its own length,
      // one dark gap between the middle two (stripes between all four read as a grille)
      const fingers = [5.5, 2, -1.5, -5];
      fingers.forEach((dv, j) => {
        const reach = (j === 1 || j === 2 ? 3.8 : 2.8) * g - 0.8;
        for (let dy = -1.5; dy <= 1.5; dy += 1) {
          const v = v0 + dv + dy;
          const [fu, fb] = barAt(hnd.bar, v, f);
          const row = v - (v0 - 6.5);
          const end = reach - (Math.abs(dy) > 1 ? 0.8 : 0);
          for (let s_ = -5; s_ <= end; s_ += 0.5) {
            const tip = s_ > end - 1;
            const gap = j === 1 && dy < -1;
            const c = gap ? HAND_GREY[0] : tip ? HAND_GREY[4] : row > 11.5 ? HAND_GREY[3] : row < 2 ? HAND_GREY[1] : HAND_GREY[2];
            putIn(hands, fu - sd * s_, v, fb + 1, dimmed(c, d));
          }
        }
      });
      // the thumb, wrapped across the near side of the bar under the fingers, pointing up and over
      const tv = v0 - 9.5;
      const [tu, tb] = barAt(hnd.bar, tv, f);
      const tl = 2 + 4 * g;
      for (let s_ = -4; s_ <= tl - 4; s_ += 0.5) {
        const lift = (s_ + 4) * 0.35;
        const tip = s_ > tl - 5;
        for (const [dy, c] of [[1, HAND_GREY[4]], [0, tip ? HAND_GREY[4] : HAND_GREY[3]], [-1, HAND_GREY[1]]] as const) putIn(hands, tu - sd * s_, tv + lift + dy, tb + 1.5, dimmed(c, d));
      }
    }
    // THE BARS, thick, and where they moved fast a smear back toward where they were
    for (let k = 0; k < CG_BARS.length; k++) {
      for (let v = 0; v <= CG_V1; v += 0.5) {
        const [u, b] = barAt(k, v, f);
        const [x, y] = pic(u, v, b);
        if (f > 0) {
          const [u0, b0] = barAt(k, v, f - 1);
          const [x0, y0] = pic(u0, v, b0);
          if (Math.hypot(x - x0, y - y0) > 3.5) for (const t of [0.35, 0.65]) bars.set(Math.round(x0 + (x - x0) * t), Math.round(y0 + (y - y0) * t), IRONS[1]);
        }
        bars.set(Math.round(x) - 1, Math.round(y), IRONS[3]).set(Math.round(x), Math.round(y), IRONS[2]).set(Math.round(x) + 1, Math.round(y), IRONS[0]);
      }
    }
    // the pin, the stones, the grit
    const bits = new Px(W, H);
    const pn = pinPath[f];
    if (pn) {
      const [x, y] = pic(pn[0], pn[2], pn[1]);
      // (bigger and brighter, and smeared back along its arc while it flies fast: the second fresh look could not see it)
      const pp = f > 0 ? pinPath[f - 1] : null;
      if (pp) {
        const [x0, y0] = pic(pp[0], pp[2], pp[1]);
        const L = Math.hypot(x - x0, y - y0);
        if (L > 3) for (let t = 0.35; t < 1; t += 0.5 / L) bits.rect(Math.round(x0 + (x - x0) * t) - 1, Math.round(y0 + (y - y0) * t), 2, 2, IRONS[2]);
      }
      bits.rect(Math.round(x) - 2, Math.round(y) - 2, 5, 5, IRONS[3]).rect(Math.round(x) - 2, Math.round(y) - 2, 2, 2, GLINT).set(Math.round(x) + 2, Math.round(y) + 2, IRONS[0]).set(Math.round(x) + 2, Math.round(y) + 1, IRONS[1]).set(Math.round(x) + 1, Math.round(y) + 2, IRONS[1]);
      // (pinging off the stone: a glint either side of it as it strikes)
      if (pings.has(f)) for (const [dx, dy] of [[-3, -1], [-4, -1], [3, -1], [4, -1], [0, -3], [0, -4]] as const) bits.set(Math.round(x) + dx, Math.round(y) + dy, Math.abs(dx) === 4 || dy === -4 ? IRONS[3] : GLINT);
    }
    for (const [k, st] of stones.entries()) {
      const q = st.path[f];
      if (!q) continue;
      const [x, y] = pic(q[0], q[2], q[1]);
      const moving = f > 0 && st.path[f - 1] !== null && len3(sub3(q, st.path[f - 1]!)) > 0.2;
      chunkAt(bits, x, y, st.size, (moving ? f * 0.9 : 0) + k, [FACE[0], FACE[1], FACE[2], FACE[3], FACE[4]]);
    }
    for (const gr of grains) {
      const q = grainAt(gr, f);
      if (!q) continue;
      const [x, y] = pic(q[0], q[1], q[2]);
      bits.set(Math.round(x), Math.round(y), FLAKE[0]).set(Math.round(x) + 1, Math.round(y), FLAKE[0]).set(Math.round(x), Math.round(y) + 1, FLAKE[1]).set(Math.round(x) + 1, Math.round(y) + 1, FLAKE[1]);
    }
    const out = new Px(W, H);
    fastBlit(out, stone, 0, 0);
    // the stone cracking out from the grate's corners and along its jambs, further at every heave, and where the stones popped out
    const heaves = YANKS.filter((y) => f >= y).length;
    if (heaves > 0) {
      const CRACKS: ReadonlyArray<readonly [number, number, number]> = [[CG_U0 - 3, CG_V1 + 5, 2.3], [CG_U1 + 3, CG_V1 + 5, 0.9], [CG_U0 - 3, 26, 3.4], [CG_U1 + 3, 34, -0.2], [CG_U0 - 3, 46, 2.7], [CG_U1 + 3, 14, 0.4]];
      CRACKS.forEach(([u0, v0, a0], k) => {
        let u = u0;
        let v = v0;
        let a = a0;
        const L = 3 + 4 * Math.min(heaves, 1 + Math.floor(k / 2)) + (k % 2) * 2;
        for (let t = 0; t < L; t += 0.7) {
          a += (hash(k, Math.floor(t), 496) - 0.5) * 0.5;
          u += Math.cos(a) * 0.7;
          v += Math.sin(a) * 0.7;
          if (u < -16 || u > 15) break;
          onWall(out, ax, ay, alongX, u, v, DEEP);
        }
      });
      stones.forEach((st, k) => {
        if (f < YANKS[Math.floor(k / 3)] || !st.path[f]) return;
        const o = st.path.find((q) => q !== null)!;
        for (let dv = -1; dv <= 1; dv++) for (let du = -1; du <= 1; du++) onWall(out, ax, ay, alongX, o[0] + du, o[2] + dv, du === 1 || dv === -1 ? FACE[3] : DEEP);
      });
    }
    // the dust, under all that moves
    for (const cl of clouds) paintCloud(out, cl, f, (q) => pic(q[0] * 0.8, q[2], q[1]));
    let fig = compose(back, [bars, hands], bits);
    if (!alongX) fig = inShade(fig);
    fastBlit(out, fig, 0, 0);
    return out;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f <= END; f++) frames.push(cut(paint(f), ax, ay));
  // THE TRACKS
  const rel = (x: number, y: number): [number, number] => [x - ax, y - ay];
  const tracks: Track[] = [];
  const barTrack = (name: string, k: number): Track => {
    const t: Track = { name, at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= END; f++) {
      const [u, b] = barAt(k, CG_V1 / 2, f);
      const [x, y] = rel(...pic(u, CG_V1 / 2, b));
      const sp = prev ? Math.hypot(x - prev[0], y - prev[1]) : 0;
      t.at.push({ x, y, shown: 1, size: 8 + (sp > 3.5 ? sp * 0.6 : 0) });
      prev = [x, y];
    }
    return t;
  };
  tracks.push(barTrack('the bars', BENT === 0 ? 2 : 0), barTrack('the bowed bar', BENT));
  GRIPS.forEach((hnd, i) => {
    const t: Track = { name: `his hand ${i + 1}`, at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= END; f++) {
      const [u, b] = barAt(hnd.bar, hnd.v, f);
      const [x, y] = rel(...pic(u, hnd.v - handLow(f), b));
      const sp = prev ? Math.hypot(x - prev[0], y - prev[1]) : 0;
      t.at.push({ x, y, shown: handShown(hnd, f), size: 12 + (sp > 3.5 ? sp * 0.6 : 0) });
      prev = [x, y];
    }
    tracks.push(t);
  });
  {
    const t: Track = { name: 'his eyes', at: [] };
    for (let f = 0; f <= END; f++) {
      const e = eyeOf(f);
      const [x, y] = rel(...pic(0, e.v, 0));
      t.at.push({ x, y, shown: e.lvl / 4, size: 6 });
    }
    tracks.push(t);
  }
  const path = (name: string, p: (V3 | null)[], size: number): Track => {
    const t: Track = { name, at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= END; f++) {
      const q = p[f];
      if (!q) {
        t.at.push(null);
        continue;
      }
      const [x, y] = rel(...pic(q[0], q[2], q[1]));
      t.at.push({ x, y, shown: 1, size: size + (prev ? Math.hypot(x - prev[0], y - prev[1]) : 0) });
      prev = [x, y];
    }
    return t;
  };
  tracks.push(path('the pin', pinPath, 4));
  stones.forEach((st, k) => tracks.push(path(`stone ${k + 1}`, st.path, 5)));
  return { frames, before: [frames[0]], after: [frames[END]], tracks, jolts: [...YANKS], yanks: YANKS };
}

let moments: Moment[] | null = null;
/** Floor 3's moments around the hero, made the first time they are asked for and kept. */
export function chainedMoments(): Moment[] {
  if (moments) return moments;
  const cl = chainsPull(true);
  const cr = chainsPull(false);
  const chains: Moment = { name: 'the chains pull', frames: cl.frames, fps: 30, before: cl.before, after: cl.after, tracks: cl.tracks, jolts: cl.jolts, holds: [], right: { frames: cr.frames, before: cr.before, after: cr.after, tracks: cr.tracks } };
  if (cr.frames.length !== cl.frames.length) throw new Error('the chains pull: its two faces of different lengths');
  const b = ballFalls();
  const ball_: Moment = { name: 'the ball falls', frames: b.frames, fps: 30, before: b.before, after: b.after, tracks: b.tracks, jolts: b.jolts, holds: [] };
  const sl = barsShake(true);
  const sr = barsShake(false);
  const bars: Moment = { name: 'the bars shake', frames: sl.frames, fps: 30, before: sl.before, after: sl.after, tracks: sl.tracks, jolts: sl.jolts, holds: [], right: { frames: sr.frames, before: sr.before, after: sr.after, tracks: sr.tracks } };
  return (moments = [chains, ball_, bars]);
}
