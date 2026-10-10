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
/** Iron set in the walls and the floor, a step quieter than what stands (his Colour 4: the places darker than any word). */
const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
const GLINT = '#9a96c8';
/** Straw gone grey with age and damp: a dull taupe, never a straw yellow (his Colour 5). */
const STRAW: Ramp = ['#1e1a22', '#2e2830', '#463c42', '#5a4e54', '#665a60'];
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
 * AN IRON BALL round (cx, cy), `r` across: lit on its upper left, its foundry's pits on it. `turn`
 * turns a point of its skin (as seen) to where it was on the ball before it rolled, so that the pits
 * roll round with it. Painted into `deep` at `near` (how near its middle is), each pixel as near as
 * its skin there, or plainly on `p`.
 */
function ironBall(p: Px, cx: number, cy: number, r: number, ramp: Ramp, seed = 0, turn?: (n: V3) => V3, deep?: Deep, near = 0): void {
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
      if (cell < 0.16 && k > 0) k = Math.max(1, k - 2);
      else if (cell > 0.93 && k >= 2 && k < 4) k = 3;
      // (its rim against what is behind it: never a lit pixel at its edge)
      if (d2 > 0.8 && k >= 3 && i < 0.62) k = 2;
      const c = ramp[k];
      if (deep) deep.put(x, y, near + nz * r * 0.9, c);
      else p.set(x, y, c);
    }
  }
}

// =================================================================================================
// HIS FACE-CAGE, in depth: the iron cage bolted over his face (art/bosses3.ts: "a band round his brow,
// a band under his chin, bars across his face between them, a strap over his crown", a lock on its
// side), as rods of iron round the middle of the head it was made for: forward, left, up.

interface Rod { a: V3; b: V3; r: number }
/** His face-cage as rods, about the middle of the head (`R` the head's height from its middle). `burst`: torn off him, its lock torn open and a bar snapped short. */
function cageRods(R: number, burst = false): Rod[] {
  const hr: V3 = [R * 0.86, R * 0.78, R];
  const at = (deg: number, up: number, out: number): V3 => [Math.cos(deg * D2R) * hr[0] * out, Math.sin(deg * D2R) * hr[1] * out, up];
  const rods: Rod[] = [];
  const band = 0.12 * R;
  const thin = 0.085 * R;
  const ring = (up: number, from: number, to: number, out: number, rr: number): void => {
    let last = at(from, up, out);
    for (let d = from + 10; d <= to + 0.01; d += 10) {
      const q = at(d, up, out);
      rods.push({ a: last, b: q, r: rr });
      last = q;
    }
  };
  // the brow band, round and round; the chin band, under the jaw and up its sides
  if (burst) {
    ring(R * 0.42, -150, 170, 1.12, band);
  } else ring(R * 0.42, -180, 180, 1.12, band);
  ring(-R * 0.95, -110, 110, 1.05, band * 0.95);
  // the bars across the face, bowed out
  for (const d of [-60, -30, 0, 30, 60]) {
    const a = at(d, R * 0.42, 1.14);
    const b = at(d, -R * 0.95, 1.08);
    const bow = at(d, -R * 0.25, 1.3);
    rods.push({ a, b: bow, r: thin });
    if (burst && d === 30) rods.push({ a: bow, b: lerp3(bow, b, 0.3), r: thin });
    else rods.push({ a: bow, b, r: thin });
  }
  // the strap over the crown, front to back
  let last = at(0, R * 0.42, 1.12);
  for (let k = 1; k <= 8; k++) {
    const th = (k / 8) * Math.PI;
    const q: V3 = [Math.cos(th) * hr[0] * 1.1, 0, R * 0.42 + Math.sin(th) * R * 0.78];
    rods.push({ a: last, b: q, r: band * 0.9 });
    last = q;
  }
  // straps down the sides, from the brow band to the chin band's ends, where it is bolted
  for (const s of [-1, 1]) {
    const a = at(s * 110, R * 0.42, 1.12);
    const b = at(s * 110, -R * 0.95, 1.05);
    rods.push({ a, b, r: thin });
  }
  return rods;
}

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
// HIS MARKS: his face-cage, and the ball and its chain (never letters)

/**
 * HIS CAGED FACE, flat, as a mark (cut in the wall, laid in the floor, over his gate): a long head,
 * the cage's band across the brow, four bars bowed down across the face to the band under the chin,
 * the strap up over the crown; his eyes two slits between the bars, a grim slit of a mouth behind
 * them. (s, t) across and up, each -1 to 1. 'iron', 'eye', 'face', or null.
 */
function caged(s: number, t: number): 'iron' | 'eye' | 'face' | null {
  // the head: long, its crown round, its jaw narrower
  const half = t > 0 ? 0.74 * Math.sqrt(Math.max(0, 1 - t * t)) : 0.74 - 0.2 * t * t;
  if (t < -1 || t > 1 || Math.abs(s) > half) return null;
  const rim = Math.abs(s) > half - 0.12;
  // the brow band, and the chin band round the jaw
  if (Math.abs(t - 0.24) < 0.085) return 'iron';
  if (t < -0.68 && (rim || t < -0.87)) return 'iron';
  // the bars, from the brow band down, bowed out
  if (t < 0.24) {
    const bow = 1 + 0.14 * Math.sin(((0.24 - t) / 1.1) * Math.PI);
    for (const b of [-0.56, -0.12, 0.12, 0.56]) if (Math.abs(s - b * bow) < 0.07) return 'iron';
  }
  // the strap over the crown
  if (t > 0.24 && Math.abs(s) < 0.07) return 'iron';
  // the eyes, between the bars, just under the brow band; the mouth's slit
  for (const e of [-0.34, 0.34]) if (((s - e) / 0.14) ** 2 + ((t - 0.06) / 0.08) ** 2 <= 1) return 'eye';
  if (Math.abs(t + 0.42) < 0.04 && Math.abs(s) < 0.26) return 'eye';
  return 'face';
}

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
 * THE BENT BARS: a barred opening in the wall, dark behind; its bars wrenched every way: one bowed far
 * over to the jamb, the next snapped in two, its upper half hanging bent out of the window, the last
 * torn out of the lintel and bent down over the jamb; the bar across them snapped. Where he came
 * through.
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
  // the sockets in the lintel, one torn wide, chipped
  for (const u of [-8, -4, 0]) p.set(fx(u), fy(V1 + 1), DEEP).set(fx(u + 1), fy(V1 + 1), DEEP);
  for (const [u, v] of [[5, 45], [6, 45], [4, 46], [5, 46], [6, 46], [7, 46], [5, 47]] as const) p.set(fx(u), fy(v), DEEP);
  for (const [u, v] of [[3, 47], [8, 47], [4, 48], [8, 45]] as const) p.set(fx(u), fy(v), FACE[4]);
  const b = flat();
  const bar = (pts: (t: number) => [number, number], n = 60): void => {
    for (let i = 0; i <= n; i++) {
      const [u, v] = pts(i / n);
      const U = Math.round(u);
      const V = Math.round(v);
      b.set(fx(U), fy(V), DIM_IRON[3]).set(fx(U + 1), fy(V), DIM_IRON[2]).set(fx(U + 2), fy(V), DIM_IRON[0]);
    }
  };
  // a straight bar
  bar((t) => [-8, V0 + (V1 - V0) * t]);
  // the next bowed far over against the jamb, low, as a giant's shoulder shoved it
  bar((t) => {
    const v = V0 + (V1 - V0) * t;
    return [-4 - 6 * Math.sin(Math.PI * t ** 0.65), v];
  });
  // snapped: its stub up from the sill, bent a little; its upper half hanging from the lintel, bent out and down
  bar((t) => [0 + 2 * t, V0 + 10 * t], 20);
  bar((t) => (t < 0.5 ? [0, V1 - 9 * (t / 0.5)] : [0 + 6 * ((t - 0.5) / 0.5), V1 - 9 - 5 * ((t - 0.5) / 0.5)]), 30);
  // (torn out at its top, bent out and down across the jamb: in front of the stone)
  bar((t) => (t < 0.45 ? [5, V0 + 12 * (t / 0.45)] : [5 + 6 * ((t - 0.45) / 0.55), V0 + 12 + 6 * Math.sin(((t - 0.45) / 0.55) * 1.6) - 9 * ((t - 0.45) / 0.55) ** 2]));
  // the bar across, snapped: its ends bent
  for (let u = U0; u <= U1; u++) {
    if (u > -9 && u < 7) continue;
    b.set(fx(u), fy(31), DIM_IRON[3]).set(fx(u), fy(30), DIM_IRON[0]);
  }
  for (let k = 0; k < 4; k++) b.set(fx(-9 + k), fy(31 - k), DIM_IRON[3]).set(fx(7 - k), fy(32 + k), DIM_IRON[2]);
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
  // the bowl, upright on the lip: its rim an oval seen from above, its dark empty inside, its round body under
  const w = flat();
  const bu = 1;
  for (let v = 6; v <= 12; v++) {
    const half = 5.6 - (11 - v) * 0.55;
    for (let u = Math.round(bu - half); u < Math.round(bu + half); u++) w.set(fx(u), fy(v), u < bu - 2 ? TIMBER[3] : u > bu + 2 ? TIMBER[1] : TIMBER[2]);
  }
  for (let v = 11; v <= 14; v++) for (let u = bu - 6; u <= bu + 5; u++) {
    const r = ((u + 0.5 - bu) / 6) ** 2 + ((v - 12.5) / 1.9) ** 2;
    if (r > 1) continue;
    w.set(fx(u), fy(v), r > 0.45 ? (v > 12 ? TIMBER[4] : TIMBER[3]) : '#120d1a');
  }
  // the spoon's handle up out of it
  for (let k = 0; k < 5; k++) w.set(fx(bu + 2 + Math.round(k * 0.6)), fy(13 + k), TIMBER[3]);
  seamed(p, w);
}

/**
 * HIS CAGED FACE CUT IN THE WALL, as his mark: the long head standing pale out of the stone in relief,
 * lit along its upper left and dark along its lower right, its shadow on the wall; the dark iron of the
 * cage over it; his eyes and his mouth deep slits behind the bars.
 */
function cageCarved(p: Px): void {
  const S = 12;
  const T = 17;
  const cv = 31;
  const at = (u: number, v: number): ReturnType<typeof caged> => caged((u + 0.5) / S, (v - cv) / T);
  const inHead = (u: number, v: number): boolean => at(u, v) !== null;
  for (let v = cv - T - 2; v <= cv + T; v++) for (let u = -S; u <= S + 1; u++) if (!inHead(u, v) && (inHead(u - 1, v + 1) || inHead(u - 1, v))) p.set(fx(u), fy(v), DEEP);
  for (let v = cv - T - 1; v <= cv + T + 1; v++) {
    for (let u = -S - 1; u <= S; u++) {
      const c = at(u, v);
      if (!c) continue;
      const edgeHi = !inHead(u - 1, v) || !inHead(u, v + 1);
      const edgeLo = !inHead(u + 1, v) || !inHead(u, v - 1);
      if (c === 'iron') {
        const hi = at(u - 1, v) !== 'iron' || at(u, v + 1) !== 'iron';
        p.set(fx(u), fy(v), edgeLo ? DIM_IRON[0] : hi ? DIM_IRON[3] : DIM_IRON[1]);
      } else if (c === 'eye') p.set(fx(u), fy(v), DEEP);
      else p.set(fx(u), fy(v), edgeHi ? FACE[4] : edgeLo ? FACE[1] : at(u, v + 1) === 'iron' ? FACE[2] : FACE[3]);
    }
  }
}

/**
 * THE BALL'S CRATER: where his ball was swung into the wall: a round of stone smashed in, dark at its
 * heart, its broken faces fresh and pale on the far side; cracks run out from it, each its own way
 * and length, chips knocked out round it, and a block beside it shoved back in its course.
 */
function ballCrater(p: Px): void {
  const cu = 0;
  const cv = 30;
  const R = 10;
  for (let v = cv - R - 1; v <= cv + R + 1; v++) {
    for (let u = cu - R - 1; u <= cu + R + 1; u++) {
      const x = u + 0.5 - cu;
      const y = v - cv;
      const ragged = R - 1.6 * hash(Math.round(Math.atan2(y, x) * 5), 1, 310);
      const d = Math.hypot(x, y);
      if (d > ragged) continue;
      // the bowl of it: the side toward the light (up and left) in shade, the far side lit and fresh
      const toLight = (-x * 0.7 + y * 0.7) / Math.max(1, d);
      const c = d < R * 0.3 ? DEEP : d < R * 0.62 ? (toLight > -0.1 ? DEEP : FACE[0]) : toLight > 0.25 ? FACE[0] : toLight < -0.35 ? FACE[4] : FACE[1];
      p.set(fx(u), fy(v), c);
    }
  }
  // the cracks: out from its rim, crooked
  for (let k = 0; k < 6; k++) {
    const a0 = (k / 6) * Math.PI * 2 + hash(k, 2, 311) * 0.7;
    const L = 5 + hash(k, 3, 311) * 8;
    let u = cu + Math.cos(a0) * (R - 1);
    let v = cv + Math.sin(a0) * (R - 1);
    let a = a0;
    for (let s = 0; s < L; s += 0.6) {
      a += (hash(k, Math.floor(s), 312) - 0.5) * 0.5;
      u += Math.cos(a) * 0.6;
      v += Math.sin(a) * 0.6;
      if (Math.abs(u) > 15) break;
      p.set(fx(Math.round(u)), fy(Math.round(v)), DEEP);
      if (s < L * 0.5) p.set(fx(Math.round(u) + 1), fy(Math.round(v)), FACE[3]);
    }
  }
  // chips knocked out round it
  for (let k = 0; k < 8; k++) {
    const a = hash(k, 5, 313) * Math.PI * 2;
    const r = R + 1.5 + hash(k, 6, 313) * 3;
    const u = Math.round(cu + Math.cos(a) * r);
    const v = Math.round(cv + Math.sin(a) * r);
    if (Math.abs(u) < 15) p.set(fx(u), fy(v), DEEP).set(fx(u + 1), fy(v), FACE[4]);
  }
}

/**
 * THE BOWED WALL, the wall's height: where something threw itself against it from behind, again and
 * again. One crack runs from the foot up into the dark, stepping along the courses, wide in the
 * middle; the stones to its right are shoved out of the face, the sides they show along the crack
 * lit, their courses sagging out of line; two of them fallen out to the rough rock behind; grit at
 * its foot.
 */
function bowedWall(p: Px): void {
  let u = -3;
  const crack: [number, number][] = [];
  for (let v = 0; v <= 79; v++) {
    if (v % 16 === 0 && v > 0) u += hash(v, 1, 320) < 0.5 ? -2 : 2;
    else if (hash(v, 2, 320) < 0.18) u += hash(v, 3, 320) < 0.5 ? -1 : 1;
    crack.push([u, v]);
  }
  for (const [cu, v] of crack) {
    const out = Math.sin((Math.PI * Math.min(72, Math.max(4, v) - 4)) / 68);
    const w = Math.max(1, Math.round(1 + out * 2.6));
    for (let k = 0; k < w; k++) p.set(fx(cu - k), fy(v), DEEP);
    // the shoved stones' sides along the crack, lit; their courses sagging (joints a pixel or two low)
    const side = Math.round(out * 2.4);
    for (let k = 1; k <= side; k++) p.set(fx(cu + k), fy(v), k === 1 ? FACE[4] : FACE[3]);
    const course = (v + Math.round(out * 2)) % 16;
    if (course === 0 && out > 0.2) for (let k = side + 1; k <= side + 10 && cu + k <= 15; k++) p.set(fx(cu + k), fy(v), DEEP).set(fx(cu + k), fy(v + 1), FACE[4]);
  }
  // two stones fallen out to the rock behind
  for (const [u0, v0, w, h] of [[4, 33, 10, 9], [-13, 18, 8, 8]] as const) {
    for (let v = v0; v < v0 + h; v++) for (let uu = u0; uu < u0 + w; uu++) {
      const g = hash(uu, v, 321);
      p.set(fx(uu), fy(v), v === v0 + h - 1 || uu === u0 ? DEEP : uu === u0 + w - 1 || v === v0 ? FACE[4] : rockAt(uu, v));
      void g;
    }
  }
  for (let i = 0; i < 8; i++) {
    const U = -9 + Math.floor(hash(i, 1, 322) * 20);
    p.set(fx(U), fy(0), FACE[3]).set(fx(U + 1), fy(0), FACE[1]);
  }
}

/** Where the torn-out ring was: its plate's bed torn out of the stone high up, and under it a run of the wall's blocks broken out to the rough rock behind, course by course, ragged. */
function tornRing(p: Px): void {
  // the breach: in each course of the wall (16 high) a run of it gone, wider low down
  const runs: ReadonlyArray<readonly [number, number, number, number]> = [[0, 15, -10, 8], [16, 31, -8, 6], [32, 37, -4, 3]];
  const inBreach = (u: number, v: number): boolean => runs.some(([v0, v1, u0, u1]) => v >= v0 && v <= v1 && u >= u0 + Math.round(2 * hash(v, 1, 334) - 1) && u <= u1 + Math.round(2 * hash(v, 2, 334) - 1));
  for (let v = 0; v <= 38; v++) {
    for (let u = -12; u <= 10; u++) {
      if (!inBreach(u, v)) continue;
      // its edges toward the light in shade, its far edges lit; rock behind
      const g = hash(u, v, 332);
      const c = !inBreach(u - 1, v) || !inBreach(u, v + 1) ? DEEP : !inBreach(u + 1, v) || !inBreach(u, v - 1) ? FACE[4] : rockAt(u, v);
      void g;
      p.set(fx(u), fy(v), c);
    }
  }
  // the bed of its plate: a ragged pit, the four bolt holes torn
  for (let v = 39; v <= 51; v++) {
    for (let u = -7; u <= 6; u++) {
      const r = Math.hypot(u + 0.5, (v - 45) * 1.1);
      if (r > 6.5 + 1.2 * hash(u, v, 330)) continue;
      const toLight = (-(u + 0.5) + (v - 45)) / Math.max(1, r);
      p.set(fx(u), fy(v), r < 3 ? DEEP : toLight > 0.2 ? DEEP : toLight < -0.3 ? FACE[4] : FACE[0]);
    }
  }
  for (const [u, v] of [[-6, 50], [5, 50], [-6, 40], [5, 40]] as const) p.set(fx(u), fy(v), DEEP).set(fx(u + 1), fy(v), DEEP).set(fx(u), fy(v - 1), DEEP);
  for (const [a, L] of [[-2.0, 8], [-0.4, 6], [0.5, 9], [2.6, 7]] as const) {
    for (let s = 7; s < 7 + L; s += 0.7) p.set(fx(Math.round(Math.cos(a) * s)), fy(Math.round(45 + Math.sin(a) * s)), DEEP);
  }
}
/** WHAT CAME DOWN, on the floor before it: the ring with its torn plate and bolts, a length of its chain, broken stone and grit. At the middle of the tile in front of the wall. */
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
    under.set(Math.round(cx - 2 + Math.cos(a) * r * 1.2), Math.round(cy - 7 + Math.sin(a) * r * 0.5), hash(i, 3, 333) < 0.3 ? FACE[2] : hash(i, 4, 333) < 0.5 ? FACE[1] : ROCK[1]);
  }
  // broken stone: blocks of the face, lit tops
  for (const [x, y, w, h] of [[cx - 18, cy - 8, 9, 6], [cx + 6, cy - 9, 10, 7], [cx - 6, cy + 2, 7, 5], [cx + 14, cy + 1, 6, 4]] as const) {
    lit(p, [STONE[0], STONE[0], STONE[1], STONE[2], STONE[3]], [1, 2], [1, 2], (l) => l.poly([[x, y + 2], [x + 2, y], [x + w, y + 1], [x + w, y + h - 1], [x + w - 2, y + h], [x, y + h]], INK));
  }
  // the chain, from the ring off along the floor, slack
  const c = new Px(W, H);
  chainAlong(c, [[cx - 4, cy - 2], [cx - 14, cy + 2], [cx - 22, cy + 8], [cx - 30, cy + 6]], DIM_IRON, 0.85);
  // the plate, its bolts still through it, and the ring
  const pl = new Px(W, H);
  lit(pl, DIM_IRON, [1, 2], [1, 2], (l) => l.poly([[cx - 2, cy - 6], [cx + 6, cy - 8], [cx + 9, cy - 3], [cx + 1, cy - 1]], INK));
  for (const [x, y] of [[cx, cy - 5], [cx + 6, cy - 6], [cx + 6, cy - 3]] as const) rivet(pl, x, y, DIM_IRON);
  ironRing(pl, cx - 1, cy, 5.5, 2.2, DIM_IRON, 0.55);
  return compose(under, [p, c, pl], null).sprite(cx, cy, GRAIN);
}

/** THE CHAIN PORT: a low square mouth at the wall's foot, framed in iron and riveted, dark into the next cell; a chain run out of it along the foot of the wall. */
function chainPort(p: Px): void {
  const mouth = (u: number, v: number): boolean => u >= -8 && u <= 7 && v >= 0 && v <= 11 + (Math.abs(u + 0.5) < 5 ? 1 : 0);
  // the iron frame round it
  for (let v = 0; v <= 15; v++) {
    for (let u = -11; u <= 10; u++) {
      if (mouth(u, v)) continue;
      p.set(fx(u), fy(v), u === -11 || v === 15 ? DIM_IRON[3] : u === 10 ? DIM_IRON[0] : DIM_IRON[2]);
    }
  }
  for (const [u, v] of [[-10, 14], [9, 14], [-10, 3], [9, 3], [-1, 14]] as const) p.set(fx(u), fy(v), DIM_IRON[4]).set(fx(u + 1), fy(v), DIM_IRON[0]);
  // the dark in it, its floor worn bright at the lip
  for (let v = 0; v <= 12; v++) for (let u = -8; u <= 7; u++) if (mouth(u, v)) p.set(fx(u), fy(v), v === 0 && Math.abs(u + 1) < 4 ? FACE[1] : DEEP);
  // the chain, run out of it and along the foot of the wall
  const c = flat();
  chainAlong(c, [[fx(1), fy(3)], [fx(-4), fy(2)], [fx(-9), fy(1)], [fx(-13), fy(1)]], DIM_IRON, 0.85);
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
    plate(c, u, v, SMALL_IRON);
    ironRing(c, fx(u), fy(v - 5), 4.4, 1.9, SMALL_IRON);
    // the chain from the ring's foot down the wall, swaying a little, then heaped on the floor at the foot
    const pts: [number, number][] = [];
    for (let vv = v - 9; vv >= 4; vv -= 2) {
      const t = (v - 9 - vv) / (v - 13);
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
 * IRON BALLS ON A RACK: a rack of two timber rails on brackets, three of the iron balls the prisoners
 * dragged sitting in it, their chains hanging down over its front rail in loops.
 */
function ballRack(p: Px): void {
  const c = flat();
  // the brackets, and the back rail
  for (const u of [-12, 11]) for (let v = 24; v <= 31; v++) c.set(fx(u), fy(v), v === 31 ? TIMBER[3] : TIMBER[1]);
  for (let u = -13; u <= 12; u++) c.set(fx(u), fy(33), TIMBER[3]).set(fx(u), fy(32), TIMBER[2]);
  // the chains, hanging in loops from each ball's eye over the front rail
  const balls: ReadonlyArray<readonly [number, number]> = [[-8, 5], [0, 5.5], [8, 4.8]];
  for (const [u, r] of balls) {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      pts.push([fx(u + 2 + 3 * t), fy(30 - 14 * Math.sin(Math.PI * t))]);
    }
    chainAlong(c, pts, SMALL_IRON, 0.6);
    void r;
  }
  const b = flat();
  for (const [u, r] of balls) ironBall(b, fx(u), fy(31 + r), r, BALL_IRON, u + 20);
  // the front rail, over their feet
  const f = flat();
  for (let u = -13; u <= 12; u++) f.set(fx(u), fy(31), TIMBER[4]).set(fx(u), fy(30), TIMBER[2]).set(fx(u), fy(29), TIMBER[0]);
  p.blit(compose(null, [c, b, f], null), 0, 0);
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

/** THE GOAD AND THE CATCH-POLE, hung on pegs at their own slants: a long pole with an iron spike and a hook back from it, and one with a forked iron head, its two prongs curled in, to pin a neck. */
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
  // the goad: its head to the right, a spike and a hook curving back
  pole(-14, 42, 7, 45);
  for (let k = 0; k < 6; k++) c.set(fx(8 + k), fy(45 + Math.round(k * 0.12)), k > 3 ? SMALL_IRON[3] : SMALL_IRON[2]).set(fx(8 + k), fy(44), SMALL_IRON[0]);
  for (let k = 0; k < 5; k++) c.set(fx(9 - Math.round(k * 0.5)), fy(46 + k), SMALL_IRON[3]);
  c.set(fx(8), fy(51), SMALL_IRON[2]).set(fx(7), fy(51), SMALL_IRON[3]);
  // the catch-pole: its forked head to the left, lower, at the other slant
  pole(-6, 29, 13, 25);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 7; k++) {
      const a = (k / 6) * Math.PI * 0.75;
      c.set(fx(Math.round(-7 - Math.sin(a) * 5)), fy(Math.round(29 + s * (1.5 + 3 * Math.sin(a * 0.9)) - s * (k > 4 ? (k - 4) * 1.5 : 0))), SMALL_IRON[3]).set(fx(Math.round(-6 - Math.sin(a) * 5)), fy(Math.round(29 + s * (1.5 + 3 * Math.sin(a * 0.9)) - s * (k > 4 ? (k - 4) * 1.5 : 0)) - 1), SMALL_IRON[1]);
    }
  }
  // the pegs under them
  for (const [u, v] of [[-8, 41], [4, 43], [0, 26], [10, 24]] as const) c.set(fx(u), fy(v - 1), TIMBER[4]).set(fx(u + 1), fy(v - 1), TIMBER[1]).set(fx(u), fy(v - 2), TIMBER[1]);
  seamed(p, c);
}

/** EMPTY BOWLS on a shelf: a ledge of stone on a corbel, two wooden bowls on it, one in the other, and one tipped on its side, its dark inside empty. */
function emptyBowls(p: Px): void {
  for (let u = -14; u <= 13; u++) p.set(fx(u), fy(30), FACE[4]).set(fx(u), fy(29), FACE[3]).set(fx(u), fy(28), FACE[2]).set(fx(u), fy(27), FACE[1]).set(fx(u), fy(26), FACE[0]);
  for (let v = 20; v <= 25; v++) for (let u = -4; u <= 3; u++) p.set(fx(u), fy(v), u === -4 ? FACE[3] : u === 3 ? FACE[0] : FACE[1]);
  const b = flat();
  // a bowl upright: its round body under its rim, the rim an oval seen from above, dark inside
  const bowl = (u0: number, v0: number, R: number): void => {
    for (let v = v0; v <= v0 + Math.round(R * 0.8); v++) {
      const half = R - (v0 + R * 0.8 - v) * 0.5;
      for (let u = Math.round(u0 - half); u < Math.round(u0 + half); u++) b.set(fx(u), fy(v), u < u0 - 2 ? TIMBER[3] : u > u0 + 2 ? TIMBER[1] : TIMBER[2]);
    }
    const top = v0 + R * 0.8;
    for (let v = Math.floor(top - 2); v <= top + 2; v++) for (let u = Math.round(u0 - R - 1); u <= u0 + R; u++) {
      const r = ((u + 0.5 - u0) / R) ** 2 + ((v - top) / 1.8) ** 2;
      if (r > 1) continue;
      b.set(fx(u), fy(v), r > 0.45 ? (v > top ? TIMBER[4] : TIMBER[3]) : '#120d1a');
    }
  };
  bowl(-7, 31, 5.5);
  bowl(-7, 36, 4.2);
  // the one tipped over: its mouth to us, its dark inside
  for (let v = 31; v <= 40; v++) for (let u = 3; u <= 13; u++) {
    const r = ((u + 0.5 - 8) / 5) ** 2 + ((v - 35.5) / 4.4) ** 2;
    if (r > 1) continue;
    b.set(fx(u), fy(v), r < 0.5 ? (v > 35 ? '#120d1a' : TIMBER[0]) : u < 6 || v > 38 ? TIMBER[3] : TIMBER[2]);
  }
  seamed(p, b);
}

/** RAGS ON A NAIL: a long strip of his grey rags hung from a nail, a hole worn in it, its foot torn into strips. */
function ragsOnNail(p: Px): void {
  const r = flat();
  r.set(fx(0), fy(48), IRONS[3]).set(fx(1), fy(48), IRONS[1]);
  for (let v = 16; v <= 47; v++) {
    const t = (47 - v) / 31;
    const half = 2 + 4.5 * Math.sqrt(t);
    const lean = Math.sin(t * 2.4) * 1.5;
    for (let u = Math.round(lean - half); u <= Math.round(lean + half); u++) {
      // torn into strips at its foot; a hole worn through
      if (t > 0.78 && Math.abs((u + 20) % 3) === 0 && hash(u, 1, 341) < 0.8 && v < 16 + Math.round(hash(u, 2, 341) * 6)) continue;
      if (t > 0.78 && (u + 20) % 3 === 0) continue;
      if (Math.hypot(u - 1.5, v - 30) < 1.8) continue;
      const d = (u - lean) / half;
      const fold = Math.abs(((u - Math.round(lean) + 30) % 4) - 1.5) < 0.6 && t > 0.3;
      r.set(fx(u), fy(v), fold ? RAGS[1] : d < -0.4 ? RAGS[3] : d > 0.55 ? RAGS[1] : RAGS[2]);
    }
  }
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

/** THE JAILER'S LAMP: a shallow iron lamp hung on a short chain from a hook, oil in it, its wick alight at the spout: frame `f` of four. */
function jailerLamp(f: number): (p: Px) => void {
  return (p) => {
    for (let u = -2; u <= 1; u++) p.set(fx(u), fy(48), IRONS[3]).set(fx(u), fy(47), IRONS[1]);
    p.set(fx(0), fy(46), IRONS[3]).set(fx(0), fy(45), IRONS[2]);
    for (let v = 37; v <= 44; v++) p.set(fx(0), fy(v), v % 3 === 1 ? IRONS[1] : IRONS[3]);
    // the lamp: a shallow dish, its spout out to the right, a ring to hang it by
    for (let v = 31; v <= 36; v++) {
      const half = 5.5 - (36 - v) * 0.6;
      for (let u = Math.round(-half); u <= Math.round(half); u++) p.set(fx(u), fy(v), v === 36 ? IRONS[4] : u < -2 ? IRONS[3] : u > 2 ? IRONS[1] : IRONS[2]);
    }
    for (let k = 0; k < 4; k++) p.set(fx(5 + k), fy(35 - Math.floor(k / 2)), IRONS[2]).set(fx(5 + k), fy(36 - Math.floor(k / 2)), IRONS[3]);
    const [h, w, lean] = ([[6, 1.8, 1], [7, 1.6, 0], [5, 2, -1], [7, 1.7, 1]] as const)[f % 4];
    flame(p, fx(8), fy(35), h, w, lean);
  };
}

/** A SKULL IN ITS FACE-CAGE on a hook: what is left of a prisoner who died in his: the iron cage bolted over his face hung by the strap over its crown, turned a little, his skull still in it behind the bars. */
function spareCage(p: Px): void {
  for (let v = 47; v <= 51; v++) p.set(fx(0), fy(v), IRONS[3]).set(fx(1), fy(v), IRONS[1]);
  const c = flat();
  const deep = new Deep(c);
  const R = 11;
  const { view, turn } = frontView(fx(0), fy(47) + 14.5, 30, 10);
  // the skull, inside: its cranium, its sockets turned with it, its jaw
  const [sx, sy, sd] = view([1, 0, 1]);
  const skull = new Px(c.w, c.h);
  ball(skull, sx, sy, 8.2, 8.6, DARK_BONE);
  const [jx, jy] = view([3.5, 0, -7]);
  ball(skull, jx, jy + 1, 5, 3.4, DARK_BONE);
  for (const s of [-3.2, 3.2]) {
    const [ex, ey] = view([8, s, 0.5]);
    skull.rect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3, DEEP);
  }
  const [nx, ny] = view([8.5, 0, -2.5]);
  skull.set(Math.round(nx), Math.round(ny), DEEP);
  for (let k = -2; k <= 2; k += 2) {
    const [tx, ty] = view([8, k, -5]);
    skull.set(Math.round(tx), Math.round(ty), DEEP);
  }
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const col = skull.get(x, y);
    if (col) deep.put(x, y, sd, col);
  }
  paintRods(deep, cageRods(R), view, (q) => norm3(turn([q[0] - R * 0.3, q[1], q[2]])), SMALL_IRON);
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

/** OLD STRAW strewn on the flags: grey strands lying every way in ragged clumps, thick in their middles, a few stray. */
function strawTile(): Sprite {
  const p = tileOf((u, v) => around(u, v));
  const clumps: ReadonlyArray<readonly [number, number, number, number]> = [[0.42, 0.45, 0.26, 70], [0.66, 0.62, 0.16, 34], [0.3, 0.72, 0.13, 22]];
  let i = 0;
  for (const [cu, cv, R, n] of clumps) {
    for (let k = 0; k < n; k++, i++) {
      const r = Math.sqrt(hash(i, 1, 350)) * R;
      const a = hash(i, 2, 350) * Math.PI * 2;
      const [x, y] = xyOf(cu + Math.cos(a) * r, cv + Math.sin(a) * r);
      const ang = hash(i, 3, 350) * Math.PI;
      const L = 3 + hash(i, 4, 350) * 6;
      const tone = hash(i, 5, 350) < 0.15 ? STRAW[4] : hash(i, 6, 350) < 0.55 ? STRAW[3] : STRAW[2];
      for (let s = -L / 2; s <= L / 2; s += 0.5) {
        const X = Math.round(x + Math.cos(ang) * s);
        const Y = Math.round(y + Math.sin(ang) * s * 0.5);
        if (inTile(X, Y)) p.set(X, Y, tone);
        if (inTile(X, Y + 1) && hash(X, Y, 351) < 0.3) p.set(X, Y + 1, STRAW[1]);
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** WHERE HIS BALL WAS DRAGGED: two furrows gouged across the flags, curving, each a dark bed with its near lip in shade and its far lip lit, chips knocked out along them, the slab cracked off one. */
function ballGrooves(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  for (const [off, bend, w] of [[-0.13, 0.55, 0.07], [0.17, 0.4, 0.06]] as const) {
    const line = off + bend * x * x - 0.06 * x;
    const d = y - line;
    if (Math.abs(d) < w * 0.5) return DEEP;
    if (Math.abs(d) < w) return d < 0 ? '#100d22' : SLAB[3];
    if (Math.abs(d) < w + 0.035 && hash(Math.floor(u * 28), Math.floor(v * 28), 352) < 0.35) return d < 0 ? SLAB[0] : SLAB[3];
  }
  const c = Math.abs(x - 0.18 - 0.3 * (y + 0.1) + 0.04 * Math.sin(y * 30));
  if (c < 0.014 && y > -0.05 && y < 0.35) return DEEP;
  return around(u, v);
}

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

/** THE SMASHED FLAGS: where something very heavy came down: the slab burst into pieces round a shallow crater, each piece tipped its own way along fine dark cracks, the far edge of each lit. */
function smashedFlags(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const r = Math.hypot(x, y * 1.05);
  if (r > 0.4) return around(u, v);
  if (r < 0.07) return r < 0.04 ? DEEP : x + y < 0 ? '#100d22' : SLAB[0];
  let best = 9;
  let next = 9;
  let k = 0;
  for (let i = 0; i < 13; i++) {
    const a = hash(i, 1, 353) * Math.PI * 2;
    const rr = 0.12 + 0.28 * hash(i, 2, 353) ** 1.2;
    const d = Math.hypot(x - Math.cos(a) * rr, y - Math.sin(a) * rr);
    if (d < best) {
      next = best;
      best = d;
      k = i;
    } else if (d < next) next = d;
  }
  const crack = 0.012 + 0.012 * (1 - r / 0.4);
  if (next - best < crack) return DEEP;
  const t = hash(k, 3, 353);
  if (next - best < crack + 0.025) return t < 0.5 ? SLAB[3] : SLAB[0];
  return t < 0.33 ? SLAB[1] : t < 0.66 ? SLAB[2] : SLAB[3];
}

/** HIS CAGED FACE IN THE FLOOR, as his mark: his head laid big in a slab in pale stone, the cage over it in dark iron, his eyes and mouth black slits behind the bars. */
function cageInFloor(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // (stood up the slab: his crown toward its far corner)
  const at = (dx: number, dy: number): ReturnType<typeof caged> => caged((x - y + dx) / 0.42, -(x + y + dy) / 0.62);
  const c = at(0, 0);
  if (c === 'iron') return at(0.03, 0.03) === 'iron' ? DIM_IRON[1] : DIM_IRON[2];
  if (c === 'eye') return DEEP;
  if (c === 'face') return at(-0.04, -0.04) === null ? SLAB[3] : at(0.04, 0.04) === null ? SLAB[0] : SLAB[2];
  return SLAB[1];
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
 * THE MANTRAP: a giant's leg-iron made a trap, laid open flat on the flags: its two jaws a round of
 * iron split at its hinges, toothed along their inner edge, the pan in the middle, its two great flat
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
  // the springs: flat bows of iron along x from the hinges outward
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 14; k += 0.25) {
      const x = s * (11 + k);
      const z = 1 + 2.2 * Math.sin((k / 14) * Math.PI);
      for (const y of [-1.6, 1.6]) put(x, y, z, y < 0 ? DIM_IRON[3] : DIM_IRON[2]);
      put(x, 0, z + 0.6, DIM_IRON[3]);
    }
  }
  // the pan
  for (let a = 0; a < Math.PI * 2; a += 0.05) for (let r = 0; r <= 4.5; r += 0.5) put(Math.cos(a) * r, Math.sin(a) * r, 1, r > 3.8 ? DIM_IRON[1] : Math.cos(a) + Math.sin(a) < -0.6 && r > 2 ? DIM_IRON[3] : DIM_IRON[2]);
  if (!shut) {
    // the jaws, open flat: a round of iron, split at its hinges (on x); teeth on its inner edge, pointing in
    for (let a = 0; a < Math.PI * 2; a += 0.02) {
      if (Math.abs(Math.sin(a)) < 0.06) continue;
      for (let r = 8.5; r <= 11; r += 0.4) put(Math.cos(a) * r, Math.sin(a) * r, r > 10.4 ? 0.5 : 1.2, r > 10.4 ? DIM_IRON[0] : Math.sin(a) < 0 ? DIM_IRON[3] : DIM_IRON[2]);
    }
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + 0.2;
      if (Math.abs(Math.sin(a)) < 0.25) continue;
      for (let r = 6; r <= 8.5; r += 0.4) put(Math.cos(a) * r, Math.sin(a) * r, 1.4, DIM_IRON[3]);
    }
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

/** THE BALL HATCH: an arched hatch in the wall, dark inside, an iron ball on a short chain hanging just within it where it swings out from; the sill scored by it. */
function ballHatch(p: Px): void {
  const arch = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 8 && v >= 24 && (v <= 38 || (u + 0.5) ** 2 + ((v - 38) * 1.3) ** 2 <= 64);
  relief(p, FACE, (u, v) => Math.abs(u + 0.5) <= 11 && v >= 21 && (v <= 38 || (u + 0.5) ** 2 + ((v - 38) * 1.3) ** 2 <= 121) && !arch(u, v), -12, 11, 20, 48);
  sunk(p, FACE, arch, -9, 8, 24, 45, DEEP);
  for (let u = -8; u <= 7; u++) p.set(fx(u), fy(24), FACE[2]).set(fx(u), fy(23), FACE[0]);
  for (const u of [-5, -1, 3]) p.set(fx(u), fy(24), DEEP).set(fx(u + 1), fy(24), DEEP);
  // the ball, just inside, half in the dark: only its upper left catches what light comes in
  const b = flat();
  for (let v = 26; v <= 36; v++) for (let u = -5; u <= 4; u++) {
    const x = (u + 0.5) / 5;
    const y = (v - 31) / 5;
    const d = x * x + y * y;
    if (d > 1) continue;
    const i = -x * 0.6 + y * 0.6 + Math.sqrt(1 - d) * 0.3;
    b.set(fx(u), fy(v), i > 0.55 ? DIM_IRON[3] : i > 0.15 ? DIM_IRON[2] : DIM_IRON[0]);
  }
  for (let v = 37; v <= 44; v++) b.set(fx(0), fy(v), v % 3 === 0 ? DIM_IRON[0] : DIM_IRON[2]);
  seamed(p, b);
}

// =================================================================================================
// BREAKABLES: standing at the middle of their foot

/** A BALE OF STRAW, grey with age, bound with two cords, on the grid. 56 x 46 at (28, 36). */
function strawBale(): Sprite {
  const W = 56;
  const H = 46;
  const ox = 28;
  const oy = 36;
  const b = new Px(W, H);
  const iso = new Iso(b, ox, oy);
  const A = 0.27;
  const B = 0.2;
  const strands = (lit_: boolean) => (u: number, v: number, w: number, h: number, px: number, py: number): string => {
    if (Math.abs(u - w * 0.28) < 1 || Math.abs(u - w * 0.72) < 1) return lit_ ? ROPE_DARK[1] : ROPE_DARK[0];
    if (v === 0) return lit_ ? STRAW[4] : STRAW[3];
    if (v >= h - 1) return STRAW[0];
    const g = hash(px, Math.floor(py / 2) + (px % 3), 360);
    return lit_ ? (g < 0.3 ? STRAW[3] : g < 0.8 ? STRAW[2] : STRAW[1]) : g < 0.3 ? STRAW[2] : STRAW[1];
  };
  iso.box(-A, -B, A, B, 0, 17, {
    top: (u, v) => {
      if (Math.abs(u - 0.28) < 0.04 || Math.abs(u - 0.72) < 0.04) return ROPE_DARK[1];
      const g = hash(Math.floor(u * 40), Math.floor(v * 12), 361);
      return g < 0.3 ? STRAW[4] : g < 0.85 ? STRAW[3] : STRAW[2];
    },
    left: strands(true),
    right: strands(false),
  });
  // strands sticking out of it
  for (let i = 0; i < 10; i++) {
    const [x, y] = iso.at(-A + hash(i, 1, 362) * 2 * A, -B, 17);
    b.line(Math.round(x), Math.round(y), Math.round(x + (hash(i, 2, 362) - 0.5) * 8), Math.round(y - 2 - hash(i, 3, 362) * 3), STRAW[3]);
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

/** A BURST CUFF: one of his wrist-irons lying open on the floor, sprung apart at its hinge: two thick half rounds of iron, their tops lit and their sides in shade, splayed; links of its chain still on one. */
function burstCuff(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  for (const [cx, cy, a0, a1] of [[LCX - 7, LCY - 1, 1.0, 4.3], [LCX + 6, LCY + 3, -1.8, 1.5]] as const) {
    for (let h = 3; h >= 0; h--) {
      for (let a = a0; a <= a1; a += 0.02) {
        for (let r = 6; r <= 10; r += 0.4) {
          const x = cx + Math.cos(a) * r * 1.35;
          const y = cy + Math.sin(a) * r * 0.62 - h;
          const top = h === 3;
          p.set(Math.round(x), Math.round(y), top ? (r > 9.4 || r < 6.6 ? SMALL_IRON[2] : Math.sin(a) < 0.1 ? SMALL_IRON[3] : SMALL_IRON[2]) : Math.sin(a) > 0 ? SMALL_IRON[1] : SMALL_IRON[0]);
        }
      }
    }
  }
  rivet(p, LCX - 1, LCY - 8, SMALL_IRON);
  const c = new Px(LCX * 2, LCY * 2);
  chainAlong(c, [[LCX + 18, LCY + 3], [LCX + 24, LCY], [LCX + 30, LCY + 2]], SMALL_IRON, 0.8);
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

/** A BOWL KICKED OVER: a wooden bowl upside down where it was kicked, a spoon flung by it. */
function bowlKicked(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  lit(p, TIMBER, [1, 2], [1, 3], (l) => {
    for (let y = LCY - 6; y <= LCY + 1; y++) {
      const half = 7 * Math.sqrt(Math.max(0, 1 - ((LCY + 1 - y) / 8) ** 2));
      l.rect(Math.round(LCX - 4 - half), y, Math.round(half * 2), 1, INK);
    }
    l.ellipse(LCX - 4, LCY + 1, 7.5, 2.2, INK);
  });
  // its foot ring on top
  p.ellipse(LCX - 4, LCY - 6, 3, 1, TIMBER[4]);
  // the spoon
  p.line(LCX + 6, LCY + 4, LCX + 15, LCY + 1, TIMBER[3]);
  p.ellipse(LCX + 17, LCY + 1, 2.4, 1.3, TIMBER[2]);
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** HIS PALLET: a mat of old straw flattened along the floor, a grey rag blanket rumpled over half of it, kicked back, its hem torn. */
function strawPallet(): Sprite {
  const p = lying((l, under) => {
    for (let i = 0; i < 150; i++) {
      const x = LCX - 24 + hash(i, 1, 365) * 46;
      const y = LCY - 9 + hash(i, 2, 365) * 18;
      const L = 3 + hash(i, 3, 365) * 5;
      under.line(Math.round(x), Math.round(y), Math.round(x + L), Math.round(y + (hash(i, 4, 365) - 0.5) * 3), hash(i, 5, 365) < 0.3 ? STRAW[3] : hash(i, 6, 365) < 0.6 ? STRAW[2] : STRAW[4]);
    }
    // the blanket: rumpled, its ridges lit on the side to the light, its hollows in shade
    for (let y = LCY - 9; y <= LCY + 9; y++) {
      for (let x = LCX - 6; x <= LCX + 23; x++) {
        const edge = LCX - 4 + Math.round(Math.sin((y - LCY) * 0.5) * 2) + (y > LCY ? Math.round((y - LCY) * -0.3) : 0);
        if (x < edge || x > LCX + 21 + Math.round(Math.sin(y * 0.9) * 1.5)) continue;
        if (y === LCY + 9 && (x % 3) === 0) continue;
        const w = Math.sin((x - LCX) * 0.55 + Math.sin(y * 0.3) * 1.5);
        l.set(x, y, x === edge ? BLANKET[4] : w > 0.6 ? BLANKET[3] : w < -0.6 ? BLANKET[1] : BLANKET[2]);
      }
    }
  });
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** A TORN-OUT BAR: one of the cell's bars wrenched out of its sill and bent nearly double, lying on the floor, a lump of the stone it was set in still on its end. */
function tornBar(): Sprite {
  const p = new Px(LCX * 2, LCY * 2);
  const pts: [number, number][] = [];
  for (let k = 0; k <= 40; k++) {
    const t = k / 40;
    const a = t * Math.PI * 0.95;
    pts.push([LCX - 22 + Math.sin(a) * 26 + t * 10, LCY - 7 + (1 - Math.cos(a)) * 7]);
  }
  for (let i = 1; i < pts.length; i++) limb(p, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 1.9, 1.9, IRONS);
  const [ex, ey] = pts[pts.length - 1];
  lit(p, STONE, [1, 2], [1, 2], (l) => l.poly([[ex - 6, ey - 2], [ex, ey - 6], [ex + 7, ey - 3], [ex + 6, ey + 3], [ex - 4, ey + 4]], INK));
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
 * THE CAGE: a cage of iron bars a tile across and taller than a man, stood on the floor of the cell
 * block: a frame of flat iron at its foot and its head, bars all round, three across its top; its door
 * on its near side torn half off its hinges and hanging open, a bar of it bent out; old straw on its
 * floor. 104 x 128 at (52, 104).
 */
function ironCage(): Sprite {
  const W = 104;
  const H = 128;
  const ox = 52;
  const oy = 104;
  const A = 0.42;
  const TOP = 78;
  const back = new Px(W, H);
  const mid_ = new Px(W, H);
  const front = new Px(W, H);
  const bi = new Iso(back, ox, oy);
  const fi = new Iso(front, ox, oy);
  // the straw on its floor
  for (let i = 0; i < 70; i++) {
    const x = -A + 0.05 + hash(i, 1, 370) * (2 * A - 0.1);
    const y = -A + 0.05 + hash(i, 2, 370) * (2 * A - 0.1);
    const [px, py] = bi.at(x, y, 1);
    const ang = hash(i, 3, 370) * Math.PI;
    mid_.line(Math.round(px), Math.round(py), Math.round(px + Math.cos(ang) * 4), Math.round(py + Math.sin(ang) * 2), hash(i, 4, 370) < 0.3 ? STRAW[3] : STRAW[2]);
  }
  /** A bar up from (x, y) on the floor to the head of the cage: lit on its left, dark on its right; dark all over on the far sides. */
  const bar = (iso: Iso, p: Px, x: number, y: number, far: boolean, z0 = 3, z1 = TOP, lean: V2 = [0, 0], shadeX = false): void => {
    const [x0, y0] = iso.at(x, y, z0);
    const [x1, y1] = iso.at(x + lean[0], y + lean[1], z1);
    const n = Math.ceil(Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) {
      const X = Math.round(x0 + ((x1 - x0) * i) / n);
      const Y = Math.round(y0 + ((y1 - y0) * i) / n);
      p.set(X, Y, far ? IRONS[1] : shadeX ? IRONS[2] : IRONS[3]).set(X + 1, Y, far ? IRONS[0] : shadeX ? IRONS[1] : IRONS[2]);
    }
  };
  /** A flat band of iron round the cage at height z: along its four sides, the far two dark. */
  const band = (iso: Iso, p: Px, z: number, far: boolean): void => {
    if (far) {
      iso.box(-A, -A, A, -A + 0.02, z, z + 3, { top: () => IRONS[2], left: () => IRONS[1], right: () => IRONS[0] });
      iso.box(-A, -A, -A + 0.02, A, z, z + 3, { top: () => IRONS[2], left: () => IRONS[1], right: () => IRONS[0] });
    } else {
      iso.box(-A, A - 0.02, A, A, z, z + 3, { top: () => IRONS[3], left: litSide(IRONS), right: shadeSide(IRONS) });
      iso.box(A - 0.02, -A, A, A, z, z + 3, { top: () => IRONS[2], left: litSide(IRONS), right: shadeSide(IRONS) });
    }
  };
  band(bi, back, 0, true);
  band(bi, back, TOP, true);
  for (let k = 0; k <= 6; k++) {
    const t = -A + (k * 2 * A) / 6;
    bar(bi, back, t, -A, true);
    bar(bi, back, -A, t, true);
  }
  // the three bars across its top
  for (const t of [-0.2, 0, 0.2]) {
    const [x0, y0] = bi.at(-A, t, TOP + 3);
    const [x1, y1] = bi.at(A, t, TOP + 3);
    back.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), IRONS[2]);
  }
  band(fi, front, 0, false);
  band(fi, front, TOP, false);
  // the near sides: bars all along the side toward screen-right; on the side toward screen-left, the door's gap
  for (let k = 0; k <= 6; k++) bar(fi, front, A, -A + (k * 2 * A) / 6, false, 3, TOP, [0, 0], true);
  for (const k of [0, 1, 5, 6]) bar(fi, front, -A + (k * 2 * A) / 6, A, false);
  // the door: hung from its hinge at the gap's left, swung wide open toward us, torn off its upper
  // hinge so that it sags, its free end's foot on the floor; one bar of it bent
  const hx = -A + (2 * 2 * A) / 6;
  const doorW = (3 * 2 * A) / 6;
  const swing = 1.35;
  const at = (s: number): [number, number] => [hx + s * Math.cos(swing) * doorW, A + s * Math.sin(swing) * doorW];
  const door = new Px(W, H);
  const di = new Iso(door, ox, oy);
  for (let k = 0; k <= 3; k++) {
    const s = k / 3;
    const [x, y] = at(s);
    bar(di, door, x, y, false, 3 - 3 * s, TOP - 4 - 9 * s, k === 2 ? [0.07, 0.02] : [0, 0]);
  }
  for (const [z, sag] of [[4, 3], [TOP - 6, 9]] as const) {
    const [x0, y0] = at(0);
    const [x1, y1] = at(1);
    const [p0x, p0y] = di.at(x0, y0, z);
    const [p1x, p1y] = di.at(x1, y1, z - sag);
    door.line(Math.round(p0x), Math.round(p0y), Math.round(p1x), Math.round(p1y), IRONS[3]);
    door.line(Math.round(p0x), Math.round(p0y) + 1, Math.round(p1x), Math.round(p1y) + 1, IRONS[1]);
  }
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

/** THE FEED TROUGH: a long trough hewn from one stone, along x: empty and dry, scraped bare inside by fingers, a crack down its near end. 80 x 44 at (40, 30). */
function feedTrough(): Sprite {
  const W = 80;
  const H = 44;
  const ox = 40;
  const oy = 30;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  const A = 0.42;
  const B = 0.17;
  iso.box(-A, -B, A, B, 0, 12, {
    top: (u, v) => {
      const inside = u > 0.07 && u < 0.93 && v > 0.24 && v < 0.8;
      if (!inside) return v < 0.12 || u < 0.04 ? STONE[4] : STONE[3];
      // the hollow: its far wall (toward -y) in the light under the rim, its end walls, its bed in shade
      if (v < 0.42) return v < 0.3 ? STONE[2] : STONE[1];
      if (u < 0.12) return STONE[1];
      return '#13112a';
    },
    left: litSide(STONE),
    right: shadeSide(STONE),
  });
  // scrapes in its bed
  for (const [x0, y0] of [[-0.2, 0.06], [0.05, 0.04], [0.22, 0.07]] as const) {
    const [a, b] = iso.at(x0, y0, 12);
    p.line(Math.round(a), Math.round(b), Math.round(a) + 3, Math.round(b) + 1, STONE[0]);
  }
  const [cx, cy] = iso.at(A, 0.04, 12);
  for (let k = 0; k < 9; k++) p.set(Math.round(cx + 1 - (k % 2)), Math.round(cy + k), DEEP);
  return compose(null, [p], null).sprite(ox, oy, GRAIN);
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

/** THE STONE BENCH: a long bench of dressed stone along x where prisoners were sat in irons: two great rings on its near face, a leg-iron on each, a slack chain between them on the floor. 88 x 48 at (44, 34). */
function stoneBench(): Sprite {
  const W = 88;
  const H = 48;
  const ox = 44;
  const oy = 34;
  const s = new Px(W, H);
  const iso = new Iso(s, ox, oy);
  block(iso, STONE, -0.4, -0.13, 0.4, 0.13, 0, 15);
  const c = new Px(W, H);
  const cuffs: [number, number][] = [];
  for (const x of [-0.22, 0.2]) {
    const [rx, ry] = iso.at(x, 0.13, 10);
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
  const c = ballAndChainAt(x / 8.4, y / 8.4);
  if (c === 'ball') {
    const nx = (x / 8.4 - 0.3) / 0.46;
    const ny = (y / 8.4 + 0.36) / 0.46;
    const i = (lightLow ? nx : -nx) * 0.6 + ny * 0.7;
    return i > 0.35 ? st.light : i < -0.35 ? st.dark : st.body;
  }
  if (c === 'link') return ballAndChainAt((x + (lightLow ? -1 : 1)) / 8.4, (y + 1) / 8.4) === 'link' ? st.body : st.light;
  if (c === 'hole') return st.dark;
  return st.odd;
};
/** OVER HIS OWN GATE: his caged face cut in the stone, his eyes burning behind the bars with the enemy's pink (as the game's boss gate has the Warden's). */
const cageMark: Mark = (x, y, st, lit_, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const c = caged(x / 8.2, y / 8.6);
  if (c === 'eye') {
    const core = Math.abs(y / 8.6 - 0.05) < 0.04 && Math.abs(Math.abs(x / 8.2) - 0.34) < 0.08;
    return lit_ ? (core ? FLAME[4] : FLAME[3]) : core ? FLAME[2] : FLAME[1];
  }
  if (c === 'iron') return caged((x + (lightLow ? -1 : 1)) / 8.2, (y + 1) / 8.6) === 'iron' ? st.body : st.light;
  if (c === 'face') return st.joint;
  return st.dark;
};

let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): its stone, the ball and chain over its gates, his caged face over his own, its cell doors of riveted iron. */
export function chainedGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: ballMark, bossMark: cageMark, leaf: leafOf }));
}

// =================================================================================================
// QUESTS

/** HIS FACE-CAGE, torn off him where he fell: the trophy for the armourer. The iron cage lying on the floor face up, tipped a little toward the hero, burst, its lock torn open and a bar snapped short; a glint on it, so it reads as a thing to take. 56 x 48 at (28, 38). */
function hisCage(): Sprite {
  const W = 56;
  const H = 48;
  const cx = 28;
  const foot = 38;
  const p = new Px(W, H);
  const deep = new Deep(p);
  const R = 11;
  // its face up and a little toward us, its crown toward the far left along the floor
  const F = norm3([0.25, 0.3, 0.92]);
  const U0 = norm3([-0.75, 0.55, 0]);
  const fu = dot3(U0, F);
  const U = norm3([U0[0] - F[0] * fu, U0[1] - F[1] * fu, U0[2] - F[2] * fu]);
  const L: V3 = [U[1] * F[2] - U[2] * F[1], U[2] * F[0] - U[0] * F[2], U[0] * F[1] - U[1] * F[0]];
  const { view, world, seen } = worldView(cx, foot - 9, F, L, U);
  paintRods(deep, cageRods(R, true), view, (q) => seen(world(norm3([q[0] - R * 0.25, q[1], q[2]]))), SMALL_IRON);
  const [lx, ly] = view([Math.cos(-100 * D2R) * R * 0.9, Math.sin(-100 * D2R) * R * 0.85, -R * 0.4]);
  for (let y = Math.round(ly) - 2; y <= Math.round(ly) + 2; y++) for (let x = Math.round(lx) - 2; x <= Math.round(lx) + 2; x++) deep.put(x, y, 40, x === Math.round(lx) - 2 ? SMALL_IRON[3] : SMALL_IRON[2]);
  const out = compose(null, [p], null);
  out.set(cx + 6, foot - 24, GOLD[3]).set(cx + 7, foot - 24, GOLD[2]);
  return out.sprite(cx, foot, GRAIN);
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
  'bent bars': [[-1, -12], [0, -1], [-3, 7]],
  'claw-torn stone': [[4, -15], [2, -8], [-3, 5]],
  'the feeding slot': [[4, -3], [4, 26], [-3, 35]],
  'the cage carved': [[6, -13], [5, -2], [-7, 8]],
  "the ball's crater": [[-1, -10], [0, 3], [-1, 10]],
  'the bowed wall': [[0, 0], [-3, 0], [2, 0]],
  'the torn-out ring': [[0, 0]],
  'the chain port': [[0, 0]],
  'the cell window': [[0, -14], [1, -7], [0, 1]],
  'rings and chains': [[0, 0], [-2, 0], [1, 0]],
  'balls on a rack': [[1, -15], [1, -4], [-2, 12]],
  'fire basket': [[3, -28], [-10, 0], [-6, 7]],
  'goad and catch-pole': [[1, -21], [0, -13], [1, -1]],
  'empty bowls': [[1, -20], [2, -3], [-2, 13]],
  'rags on a nail': [[6, -15], [6, -4], [-10, 6]],
  'the wall winch': [[0, 0], [-1, 0], [1, 0]],
  "the jailers' lamp": [[6, -31], [-11, -1], [-3, 7]],
  'a skull in its cage': [[2, -18], [-3, -7], [-3, 2]],
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
    w('the cell window', 'wall tile', cellWindow),
    // on the walls
    w('rings and chains', 'on the wall', ringsAndChains),
    w('balls on a rack', 'on the wall', ballRack),
    { name: 'fire basket', kind: 'on the wall', ...spotsOf('fire basket', fireBasket as unknown as (p: Px) => void, 4, fireLight(42, 3)) },
    w('goad and catch-pole', 'on the wall', catchPoles),
    w('empty bowls', 'on the wall', emptyBowls),
    w('rags on a nail', 'on the wall', ragsOnNail),
    w('the wall winch', 'on the wall', wallWinch),
    { name: "the jailers' lamp", kind: 'on the wall', ...spotsOf("the jailers' lamp", jailerLamp as unknown as (p: Px) => void, 4, fireLight(38, 8)) },
    w('a skull in its cage', 'on the wall', spareCage),
    // floor tiles
    { name: 'old straw', kind: 'floor tile', frames: [strawTile()] },
    { name: 'ball grooves', kind: 'floor tile', frames: [onTile(ballGrooves)] },
    { name: 'the oubliette', kind: 'floor tile', frames: [onTile(oubliette)] },
    { name: 'the smashed flags', kind: 'floor tile', frames: [onTile(smashedFlags)] },
    { name: 'the cage in the floor', kind: 'floor tile', frames: [onTile(cageInFloor, box(0.08, 0.92, 0.08, 0.92))] },
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
    { name: "the Chained One's face-cage", kind: 'quest', frames: [hisCage()], shadow: 0.26 },
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
      if (q[2] <= floor && Math.hypot(w[0], w[1]) < 0.15 && w[2] === 0) down = true;
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

/**
 * THE CHAINS PULL. Three heavy chains hang from great rings on a wall, slack down the stone and away
 * along its foot into a chain port, a dark mouth a tile along, into the cell beyond (`before`).
 * Something on the other side takes them up: they creep toward the dark, then all three are hauled
 * at once, snatched up off the floor and snapped taut against the stone (a jolt): dust bursts off
 * the wall all along them, the rings jerk on their plates and grit spurts from round them; they
 * strain and thrum; something heaves again (a jolt), the stone cracks round the first ring's plate,
 * it creeps out of the wall; on the third it rips out (a jolt), stone flying, and that chain whips
 * across the others, its ring and plate on its end, and down onto the floor (a jolt), its links
 * bouncing, and lies there; whatever pulled lets go, and the other two drop slack, swing out into
 * the room and back against the stone, and hang still (`after`: the torn ring on the floor, the hole
 * it left, the two chains hanging). For the face turned to screen-left (`alongX`) or to screen-right;
 * anchored as a wall piece is. Its frames reach a tile and a half along the wall: it plays where the
 * wall runs on past its tile to the chain port.
 */
function chainsPull(alongX: boolean): Film & { taut: number; yank: number; rip: number; land: number } {
  const W = 232;
  const H = 156;
  const ax = 96;
  const ay = 124;
  const see = faceAt(alongX);
  const toWorld = faceWorld(alongX);
  const pic = (q: V3): [number, number] => {
    const [x, y] = see(q[0], q[1], q[2]);
    return [ax + x, ay + y];
  };
  const G = 1.35;
  const SUB = 6;
  const R = 1.9;
  const N = 26;
  // the rings' bolts (a along, b out, z up), and where each chain goes into the port
  const BOLTS: V3[] = [[-22, R, 46], [-5, R, 52], [12, R, 45]];
  const PORT = 48;
  const ENTRY: V3[] = [[PORT - 8, R, 4], [PORT, R, 5.5], [PORT + 8, R, 4]];
  const RING_R = 4.4;
  // how long each chain is outside the port: as it hangs, and stretched straight (from its ring's foot)
  const tautOf = (i: number): number => len3(sub3(ENTRY[i], BOLTS[i])) + 0.5;
  const SLACK = 42;
  const L0 = BOLTS.map((_, i) => tautOf(i) + SLACK);
  // THE TIMELINE (frames): it creeps; the haul (taut on TAUT); the second heave; the rip; let go
  const CREEP = 1;
  const HAUL = 9;
  const REEL = 13;
  const TAUT = HAUL + Math.ceil((SLACK - 5) / REEL);
  const YANK = TAUT + 9;
  const RIP = YANK + 8;
  const outLen = (i: number, t: number): number => {
    const creep = 5 * smooth((t - CREEP) / 5);
    if (t < HAUL) return L0[i] - creep;
    if (t < RIP || i === 0) return Math.max(tautOf(i), L0[i] - 5 - REEL * (t - HAUL));
    // let go: the two that are left run back out of the port a way
    return tautOf(i) + 18 * (1 - Math.exp(-(t - RIP) / 2.2));
  };
  // the bolts strain at their plates when it hauls: a jerk out toward the pull, shuddering; the first creeps out of the wall
  const dirOf = (i: number): V3 => norm3(sub3(ENTRY[i], BOLTS[i]));
  const SHUD = [1.6, -0.6, 1, -0.3, 0.6, 0, 0.3, 0];
  const boltAt = (i: number, t: number): V3 => {
    let k = 0;
    if (t >= TAUT && t < RIP) {
      const a = Math.floor(t) - TAUT;
      const y = Math.floor(t) - YANK;
      k = (a < SHUD.length ? SHUD[a] : 0) + (y >= 0 && y < SHUD.length ? 1.4 * SHUD[y] : 0);
      if (i === 0) k += Math.min(3.2, Math.max(0, t - TAUT - 2) * 0.22) + (y >= 0 ? 1.2 : 0);
    }
    return add3(BOLTS[i], mul3(dirOf(i), k));
  };
  /** Where the ring hangs, round its bolt, toward the chain. */
  const ringOf = (bolt: V3, next: V3): V3 => add3(bolt, mul3(norm3(sub3(next, bolt)), RING_R));
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
  for (let s = 0; s < 120 * SUB; s++) {
    for (const [i, r] of ropes.entries()) r.step(1 / SUB, (k) => (k === 0 ? BOLTS[i] : k === N ? ENTRY[i] : null), keepOut, 0.6, 0.96);
  }
  // WHAT FLIES: chips of stone off the torn ring's plate; dust; grit
  const FMAX = 150;
  const puffs: Puff[] = [];
  const wd = (a: number, b: number, z: number): V3 => toWorld(a, b, z);
  const outward = faceHeading(alongX, 0, 1);
  const burst = (f0: number, at: V3, n: number, v: number, big: number, seed: number, rise = -1.1, spread = 1.2): void => {
    for (let k = 0; k < n; k++) {
      const [x, y, z] = wd(at[0] + (hash(k, seed, 461) - 0.5) * 4, at[1] + 1, at[2] + (hash(k, seed, 462) - 0.5) * 3);
      puffs.push({ f0, x, y, z, ang: outward + (hash(k, seed, 463) - 0.5) * spread * 2, v: v * (0.6 + 0.8 * hash(k, seed, 464)), r0: 1.6, grow: big * (0.7 + 0.5 * hash(k, seed, 465)), rise: rise - 0.5 * hash(k, seed, 466), life: 9 + Math.floor(hash(k, seed, 467) * 5), seed: seed * 20 + k });
    }
  };
  // grit spurting from round the plates as they strain, and sifting down the wall all along (laid out once it is known when it ends)
  interface Bit { f0: number; o: V3; v: V3 }
  const grit: Bit[] = [];
  const gritAt = (g: Bit, f: number): V3 | null => {
    const t = f - g.f0;
    if (t < 0) return null;
    const z = g.o[2] + g.v[2] * t - 0.5 * G * t * t;
    if (z < 0.5) return null;
    return [g.o[0] + g.v[0] * t, g.o[1] + g.v[1] * t, z];
  };
  // THE RUN: frame by frame, in small steps
  const states: { pts: V3[][]; bolts: V3[]; out: number[] }[] = [];
  let land = -1;
  const torn: V3[] = [];
  for (let f = 0; f < FMAX; f++) {
    if (f === RIP) {
      // the first ring tears out: its chain's end, ring and plate on it, flung toward the port and out of the wall
      const r = ropes[0];
      r.inv[0] = 1 / 5;
      const d = dirOf(0);
      for (let k = 0; k <= N; k++) {
        const s = 1 - k / N;
        const v: V3 = [d[0] * 2.4 * s, 5.8 * s + 0.4, 3.6 * s];
        // (a frame's way, in the rope's small steps)
        r.p[k] = sub3(r.x[k], mul3(v, 1 / SUB));
      }
    }
    if (f === RIP) {
      // and the other two, let go, spring away from the stone into the room
      for (const i of [1, 2]) for (let k = 1; k < N; k++) {
        const s = Math.sin((Math.PI * k) / N);
        ropes[i].p[k] = sub3(ropes[i].x[k], [0, (-4.6 * s) / SUB, 0]);
      }
    }
    for (let s = 0; s < SUB; s++) {
      const t = f + s / SUB;
      for (const [i, r] of ropes.entries()) {
        r.rest = outLen(i, t) / N;
        const bolt = boltAt(i, t);
        const free0 = i === 0 && f >= RIP;
        // (strained taut, they thrum)
        if (t >= TAUT && t < RIP && s === 0) for (let k = 3; k < N - 2; k += 4) r.x[k][1] += (hash(k, f + i * 50, 476) - 0.4) * 1.1;
        r.step(1 / SUB, (k) => (k === 0 && !free0 ? bolt : k === N ? ENTRY[i] : null), keepOut, 0.88, 0.997, i === 0 ? 0.6 : 0.3);
      }
    }
    if (f > RIP && land < 0 && ropes[0].x[0][2] <= R + 0.05) land = f;
    if (f >= RIP) torn.push([...ropes[0].x[0]] as V3);
    states.push({ pts: ropes.map((r) => r.x.map((q) => [...q] as V3)), bolts: BOLTS.map((_, i) => boltAt(i, f)), out: BOLTS.map((_, i) => outLen(i, f)) });
  }
  if (land < 0) throw new Error('the torn ring never strikes the floor');
  // IT IS OVER when the chains have come to rest (none of their links moving a tenth of a pixel in a frame)
  let END = FMAX - 1;
  for (let f = land + 10; f < FMAX; f++) {
    const still = states[f].pts.every((pts, i) => pts.every((q, k) => len3(sub3(q, states[f - 1].pts[i][k])) < 0.1));
    if (still) {
      END = f;
      break;
    }
  }
  // the grit: a grain loosed every other frame from round a plate, the last meeting the floor on END; and spurts as it hauls
  for (let k = 0; ; k++) {
    const i = Math.floor(hash(k, 1, 470) * 3);
    const o = add3(BOLTS[i], [(hash(k, 2, 470) - 0.5) * 6, 0.6, -3]);
    const fall = Math.ceil(Math.sqrt((2 * (o[2] - 0.5)) / G));
    const f0 = END - fall - 2 * k;
    if (f0 < 1) break;
    if (i === 0 && f0 >= RIP) continue;
    grit.push({ f0, o, v: [0, 0.05, 0] });
  }
  for (const f0 of [TAUT, YANK]) for (let k = 0; k < 12; k++) {
    const i = k % 3;
    grit.push({ f0, o: add3(BOLTS[i], [(hash(k, f0, 471) - 0.5) * 7, 1, (hash(k, f0, 472) - 0.5) * 6]), v: [(hash(k, f0, 473) - 0.5) * 1.6, 0.4 + hash(k, f0, 474) * 1.2, 0.8 + hash(k, f0, 475) * 1.6] });
  }

  // the dust: off the wall all along each chain as it slams against it; round the plates; the crater; where the ring strikes
  for (const f0 of [TAUT, YANK]) {
    const n = f0 === TAUT ? 5 : 3;
    states[f0].pts.forEach((pts, i) => {
      for (let k = 1; k <= n; k++) burst(f0, pts[Math.round((k / (n + 1)) * N)], 2, f0 === TAUT ? 1.8 : 1.2, f0 === TAUT ? 4.2 : 3, 10 + i * 7 + k + (f0 === YANK ? 40 : 0));
    });
  }
  burst(RIP, BOLTS[0], 8, 3.4, 3.6, 90, -1.6, 1.4);
  for (const p of puffRing(land, ...(wd(torn[land - RIP][0], torn[land - RIP][1], 0).slice(0, 2) as [number, number]), 0, 12, 1.6, 3.6, 95)) puffs.push(p);
  // chips of the wall, flung from where the ring tore out, bouncing, lying where they stop
  const chips = Array.from({ length: 9 }, (_, k) => flung(RIP, add3(BOLTS[0], [(hash(k, 1, 477) - 0.5) * 6, 1.5, (hash(k, 2, 477) - 0.5) * 6]), [(hash(k, 3, 477) - 0.5) * 3.2, 1 + hash(k, 4, 477) * 3, 1 + hash(k, 5, 477) * 3.5], FMAX, G, 0.42, 0.8));
  /** Paint frame f (`rest`: the last, all still). */
  const paint = (f: number): Px => {
    const st = states[f];
    const wall = new Px(W, H);
    const put = (u: number, v: number, c: string): void => onWall(wall, ax, ay, alongX, u, v, c);
    // THE PORT, a tile along: its iron frame, the dark in it
    const pu = 0.8 * PORT;
    for (let v = 0; v <= 19; v++) {
      for (let u = Math.round(pu - 13); u <= pu + 12; u++) {
        const mouth = Math.abs(u - pu + 0.5) <= 9.5 && v <= 14 + (Math.abs(u - pu + 0.5) < 6 ? 1 : 0);
        if (mouth) put(u, v, v === 0 && Math.abs(u - pu) < 5 ? FACE[1] : DEEP);
        else put(u, v, u <= pu - 12 || v === 19 ? DIM_IRON[3] : u >= pu + 11 ? DIM_IRON[0] : DIM_IRON[2]);
      }
    }
    for (const [du, v] of [[-11, 17], [10, 17], [-11, 3], [10, 3], [0, 17]] as const) put(pu + du, v, DIM_IRON[4]);
    // THE PLATES, and the first one's crater once it has gone
    st.bolts.forEach((bolt, i) => {
      const u0 = 0.8 * BOLTS[i][0];
      const v0 = BOLTS[i][2];
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
        for (let v = -3; v <= 3; v++) for (let u = -3; u <= 3; u++) put(u0 + u + (i === 0 ? du * 0.4 : 0), v0 + v + (i === 0 ? dv * 0.4 : 0), u === -3 || v === 3 ? DIM_IRON[3] : u === 3 || v === -3 ? DIM_IRON[0] : DIM_IRON[2]);
      }
      // (the stone cracking round the first plate as it is torn at)
      if (i === 0 && f >= YANK) {
        const grow = Math.min(1, (f - YANK + 1) / 5);
        for (const [a, L] of [[-2.2, 9], [-0.5, 7], [0.6, 10], [2.5, 8]] as const) for (let s = 5; s < 5 + L * grow; s += 0.7) put(u0 + Math.cos(a) * s, v0 + Math.sin(a) * s, DEEP);
      }
    });
    // THE CHAINS: the farthest out from the wall last; each from its ring's foot to the port, and a link or two on into its dark
    const chainL = new Px(W, H);
    const order = [0, 1, 2].sort((m, n) => st.pts[m].reduce((t, q) => t + q[1], 0) - st.pts[n].reduce((t, q) => t + q[1], 0));
    for (const i of order) {
      const pts = st.pts[i];
      const ring = ringOf(pts[0], pts[1]);
      const all = [...pts, add3(ENTRY[i], [3, -6, -0.5])];
      chainOn(chainL, all, pic, RING_R * 1.6, st.out[i] + 6, 1.1, SMALL_IRON, (s) => (s > st.out[i] ? Math.min(0.85, (s - st.out[i]) / 6) : 0));
      const [rx, ry] = pic(ring);
      ironRing(chainL, rx, ry, RING_R * 0.95, 1.9, SMALL_IRON);
      // the torn plate, on the ring's end
      if (i === 0 && f >= RIP) {
        const [bx, by] = pic(pts[0]);
        const tilt = (f - RIP) * 0.5;
        for (let v = -3; v <= 3; v++) for (let u = -3; u <= 3; u++) {
          const x = Math.round(bx + u * Math.cos(tilt) - v * Math.sin(tilt) * 0.6);
          const y = Math.round(by + v * Math.cos(tilt) * 0.8 + u * Math.sin(tilt) * 0.4);
          chainL.set(x, y, u + v < -3 ? SMALL_IRON[3] : u + v > 3 ? SMALL_IRON[0] : SMALL_IRON[2]);
        }
      } else {
        const [bx, by] = pic(pts[0]);
        rivet(chainL, Math.round(bx) - 1, Math.round(by) - 1, SMALL_IRON);
      }
    }
    const bits = new Px(W, H);
    for (const c of chips) {
      const q = c[f];
      if (!q) continue;
      const [x, y] = pic(q);
      bits.set(Math.round(x), Math.round(y), FACE[4]).set(Math.round(x) + 1, Math.round(y), FACE[1]).set(Math.round(x), Math.round(y) + 1, FACE[1]);
    }
    for (const g of grit) {
      const q = gritAt(g, f);
      if (!q) continue;
      const [x, y] = pic(q);
      bits.set(Math.round(x), Math.round(y), FACE[3]).set(Math.round(x) + 1, Math.round(y), FACE[3]).set(Math.round(x), Math.round(y) + 1, FACE[1]).set(Math.round(x) + 1, Math.round(y) + 1, FACE[1]);
    }
    let out = compose(wall, [chainL], bits);
    if (!alongX) out = inShade(out);
    const dust = new Px(W, H);
    paintPuffs(puffs, f, ax, ay, dust, null, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    fastBlit(out, dust, 0, 0);
    return out;
  };
  // THE FRAMES, to where it hangs still
  const pics: Px[] = [];
  for (let f = 0; f <= END; f++) pics.push(paint(f));
  const end = END;
  const frames = pics.map((p) => cut(p, ax, ay));
  // THE TRACKS: the middle of each chain, the torn ring, the chips
  const rel = (q: V3, size: number, prev: [number, number] | null): { x: number; y: number; shown: number; size: number } => {
    const [x, y] = see(q[0], q[1], q[2]);
    return { x, y, shown: 1, size: size + (prev ? Math.hypot(x - prev[0], y - prev[1]) : 0) };
  };
  const tracks: Track[] = [];
  for (let i = 0; i < 3; i++) {
    const t: Track = { name: `chain ${i + 1}`, at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= end; f++) {
      const a = rel(states[f].pts[i][Math.round(N / 2)], 10, prev);
      t.at.push(a);
      prev = [a.x, a.y];
    }
    tracks.push(t);
  }
  {
    const t: Track = { name: 'the torn ring', at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= end; f++) {
      const a = rel(states[f].pts[0][0], 12, prev);
      t.at.push(a);
      prev = [a.x, a.y];
    }
    tracks.push(t);
  }
  chips.forEach((c, k) => {
    const t: Track = { name: `chip ${k + 1}`, at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= end; f++) {
      const q = c[f];
      if (!q) {
        t.at.push(null);
        continue;
      }
      const a = rel(q, 4, prev);
      t.at.push(a);
      prev = [a.x, a.y];
    }
    tracks.push(t);
  });
  return { frames, before: [frames[0]], after: [frames[end]], tracks, jolts: [TAUT, YANK, RIP, land], taut: TAUT, yank: YANK, rip: RIP, land };
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
 * THE BALL FALLS. One of the giant's iron balls sits on top of a heap of fallen stone, its chain down
 * the heap's side and away along the floor (`before`). Grit sifts from under it and a pebble breaks
 * away and tumbles down; the ball creaks over toward the edge and back, and again, further; then it
 * goes: rolls off the edge, turning, and drops, falling faster every frame, and smashes into the
 * flagstones (a jolt): the flags crack out round it, chips fly, dust bursts out across the floor. It
 * bounces, its chain snatched off the heap after it and slapping down, strikes again (a jolt), and
 * rolls on toward the hero, turning over, dragging its chain rattling behind it, slowing, and stops
 * (`after`: the ball where it stopped, its chain trailing back, the cracked flags, the chips). On the
 * heap's own anchor, at the middle of its tile.
 */
function ballFalls(): Film & { impact: number; second: number } {
  const W = 208;
  const H = 168;
  const ax = 84;
  const ay = 100;
  const G = 1.5;
  const SUB = 4;
  const R = 10;
  // THE HEAP: a broad base block, a block on it standing over its near edges
  const BASE: Box3 = [-20, 6, -18, 4, 0, 15];
  const TOP: Box3 = [-13, 8, -11, 6, 15, 29];
  const FALLEN: Box3 = [-30, -14, -4, 10, 0, 9];
  const BOXES: Box3[] = [BASE, TOP, FALLEN];
  const D = norm3([1, 0.72, 0]);
  const HOME: V3 = [1, -1, 29 + R];
  // the ball's own measure, turned as it rolls: its body's x, y, z as ways in the world
  let M: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const EYE: V3 = norm3([-0.25, 0.85, 0.35]);
  const eyeOf = (c: V3, m: [V3, V3, V3]): V3 => add3(c, mul3(add3(add3(mul3(m[0], EYE[0]), mul3(m[1], EYE[1])), mul3(m[2], EYE[2])), R + 0.6));
  // THE TIMELINE: the pebble; the creaks; the roll
  const PEBBLE = 2;
  const ROCKS = [0, 0, 0, 0, 1, 2.2, 2.8, 2, 0.6, -0.4, 0.8, 2.4, 3.8, 5];
  const GO = ROCKS.length;
  // THE BALL, step by step
  interface BallState { c: V3; m: [V3, V3, V3]; v: V3 }
  const balls: BallState[] = [];
  let c: V3 = [...HOME];
  let prev: V3 = [...HOME];
  let impact = -1;
  let second = -1;
  let spin: V3 = [0, 0, 0];
  let stopped = -1;
  const FMAX = 170;
  for (let f = 0; f < FMAX; f++) {
    if (f < GO) {
      // creaking: rocked out toward the edge along its way, and back, rolling as it goes
      const s = ROCKS[f];
      const was = f > 0 ? ROCKS[f - 1] : 0;
      c = add3(HOME, mul3(D, s));
      const axis = norm3([-D[1], D[0], 0]);
      M = M.map((v) => turnAbout(v, axis, (s - was) / R)) as [V3, V3, V3];
      prev = sub3(c, mul3(D, f === GO - 1 ? 1.7 : s - was));
    } else if (stopped < 0) {
      for (let k = 0; k < SUB; k++) {
        const dt = 1 / SUB;
        const v = sub3(c, prev);
        prev = [...c] as V3;
        c = [c[0] + v[0], c[1] + v[1], c[2] + v[2] - G * dt * dt];
        let touching: V3 | null = null;
        for (const b of BOXES) {
          const cp: V3 = [Math.max(b[0], Math.min(b[1], c[0])), Math.max(b[2], Math.min(b[3], c[1])), Math.max(b[4], Math.min(b[5], c[2]))];
          const d = sub3(c, cp);
          const L = len3(d);
          if (L < R) {
            const n = L > 1e-6 ? mul3(d, 1 / L) : ([0, 0, 1] as V3);
            c = add3(cp, mul3(n, R));
            touching = n;
          }
        }
        if (c[2] < R) {
          const vz = (c[2] - prev[2]) / dt;
          c[2] = R;
          touching = [0, 0, 1];
          if (vz < -1.6) {
            if (impact < 0) impact = f;
            else if (second < 0 && f > impact + 2) second = f;
            // it bounces, a little; its way along the floor kept, but for what the blow takes
            prev[2] = R - (-vz * (impact === f ? 0.5 : 0.3)) * dt;
            prev[0] = c[0] - (c[0] - prev[0]) * 0.86;
            prev[1] = c[1] - (c[1] - prev[1]) * 0.86;
          } else {
            prev[2] = R;
            // rolling on the stone, dragging its chain: slowing
            prev[0] = c[0] - (c[0] - prev[0]) * 0.988;
            prev[1] = c[1] - (c[1] - prev[1]) * 0.988;
          }
        }
        // turning: rolling on what it touches, spinning on as it was in the air
        const mv = sub3(c, prev);
        if (touching) {
          const along = sub3(mv, mul3(touching, dot3(mv, touching)));
          const L = len3(along);
          if (L > 1e-6) spin = mul3(norm3([touching[1] * along[2] - touching[2] * along[1], touching[2] * along[0] - touching[0] * along[2], touching[0] * along[1] - touching[1] * along[0]]), L / R);
          else spin = [0, 0, 0];
        }
        const w = len3(spin);
        if (w > 1e-7) M = M.map((v) => turnAbout(v, mul3(spin, 1 / w), w)) as [V3, V3, V3];
      }
      if (impact >= 0 && f > impact + 6 && c[2] <= R + 0.01 && Math.hypot(c[0] - prev[0], c[1] - prev[1]) < 0.05) {
        stopped = f;
        prev = [...c] as V3;
      }
    }
    balls.push({ c: [...c] as V3, m: M.map((v) => [...v]) as [V3, V3, V3], v: sub3(c, prev) });
  }
  if (impact < 0) throw new Error('the ball never strikes the floor');
  if (stopped < 0) throw new Error('the ball never stops');
  // THE CHAIN: from the eye on the ball, down the heap's side and away along the floor behind
  const N = 22;
  const start = eyeOf(HOME, balls[0].m);
  const path: V3[] = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    if (t < 0.45) {
      const u = t / 0.45;
      path.push([start[0] - 4 * u, start[1] + 3 + 2 * u, start[2] - u * (start[2] - 1.5)]);
    } else {
      const u = (t - 0.45) / 0.55;
      path.push([start[0] - 4 - 34 * u, start[1] + 5 + 6 * Math.sin(u * 3), 1.5]);
    }
  }
  const rope = new Rope(path, G, 1.5);
  rope.rest = 3.4;
  const keep = (b: BallState) => (q: V3, i: number): boolean => {
    let hit = false;
    for (const bx of BOXES) hit = outOfBox(q, bx, 1.4) || hit;
    if (i > 1) {
      const d = sub3(q, b.c);
      const L = len3(d);
      if (L < R + 1.4 && L > 1e-6) {
        const n = mul3(d, (R + 1.4) / L);
        q[0] = b.c[0] + n[0];
        q[1] = b.c[1] + n[1];
        q[2] = b.c[2] + n[2];
        hit = true;
      }
    }
    return hit;
  };
  for (let s = 0; s < 80 * 4; s++) rope.step(1 / 4, (i) => (i === 0 ? start : null), keep(balls[0]), 0.5, 0.95);
  const chains: V3[][] = [];
  let chainStill = -1;
  for (let f = 0; f < FMAX; f++) {
    const b = balls[f];
    const b0 = balls[Math.max(0, f - 1)];
    for (let s = 0; s < 4; s++) {
      const t = (s + 1) / 4;
      const c_ = lerp3(b0.c, b.c, t);
      const e = eyeOf(c_, t < 1 ? b0.m : b.m);
      rope.step(1 / 4, (i) => (i === 0 ? e : null), keep({ c: c_, m: b.m, v: b.v }), 0.86, 0.997, 0.32);
    }
    chains.push(rope.x.map((q) => [...q] as V3));
    if (f > stopped && chainStill < 0 && rope.x.every((q, i) => len3(sub3(q, chains[f - 1][i])) < 0.08)) chainStill = f;
  }
  // THE BLOW: where it struck; the cracks out from there; chips; dust
  const hit = balls[impact].c;
  const CRACKS = Array.from({ length: 8 }, (_, k) => {
    const a = (k / 8) * Math.PI * 2 + hash(k, 1, 480) * 0.6;
    const L = 9 + hash(k, 2, 480) * 14;
    const pts: [number, number][] = [];
    let x = hit[0] + Math.cos(a) * 4;
    let y = hit[1] + Math.sin(a) * 4;
    let ang = a;
    for (let s = 0; s < L; s += 1.2) {
      ang += (hash(k, Math.floor(s), 481) - 0.5) * 0.7;
      x += Math.cos(ang) * 1.2;
      y += Math.sin(ang) * 1.2;
      pts.push([x, y]);
    }
    return pts;
  });
  const chips = Array.from({ length: 10 }, (_, k) => {
    const a = hash(k, 1, 482) * Math.PI * 2;
    const sp = 2 + 2.4 * hash(k, 2, 482);
    return flung(impact, [hit[0] + Math.cos(a) * 5, hit[1] + Math.sin(a) * 5, 2], [Math.cos(a) * sp, Math.sin(a) * sp, 2.5 + 3.5 * hash(k, 3, 482)], FMAX, G, 0.4, 1);
  });
  const pebble = flung(PEBBLE, [TOP[1] - 2, TOP[3] - 4, TOP[5] + 1.5], [0.9, 0.7, 1.2], FMAX, G, 0.45, 1.2);
  // (the pebble rolls down the heap's face: kept out of the blocks)
  const puffs: Puff[] = [...puffRing(impact, 0, 0, 0, 16, 6.5, 4.4, 120), ...puffRing(impact, 0, 0, 0, 12, 2.6, 4, 121)];
  if (second > 0) puffs.push(...puffRing(second, balls[second].c[0] - hit[0], balls[second].c[1] - hit[1], 0, 12, 4, 3.2, 130));
  // IT IS OVER when the ball and its chain have come to rest and the dust is gone
  const dustGone = impact + 22;
  const END = Math.max(stopped, Math.min(stopped + 12, chainStill < 0 ? stopped : chainStill), dustGone);
  // grit from under the ball, sifting down the heap's face: one every other frame, the last landing at END
  const grit: { f0: number; o: V3 }[] = [];
  for (let k = 0; ; k++) {
    const o: V3 = [TOP[1] + 1 + (hash(k, 1, 483) - 0.5) * 6, TOP[3] + 1 + (hash(k, 2, 483) - 0.5) * 4, TOP[5] - 1];
    const fall = Math.ceil(Math.sqrt((2 * o[2]) / G));
    const f0 = END - fall - 2 * k;
    if (f0 < 1) break;
    grit.push({ f0, o });
  }
  for (let k = 0; k < 10; k++) grit.push({ f0: GO, o: [HOME[0] + (hash(k, 3, 483) - 0.5) * 10, HOME[1] + 4 + hash(k, 4, 483) * 3, TOP[5] - 1] });
  // THE HEAP'S PICTURE, and how near the eye each pixel of it is
  const heap = new Px(W, H);
  const iso = new Iso(heap, ax, ay);
  for (const b of BOXES) {
    iso.box(b[0] / KT, b[2] / KT, b[1] / KT, b[3] / KT, b[4], b[5], {
      top: (u, v) => (v < 0.06 || u < 0.05 ? STONE[4] : hash(Math.floor(u * 9), Math.floor(v * 7), 484) < 0.2 ? STONE[2] : STONE[3]),
      left: (u, v, w, h) => (v === 0 ? STONE[3] : v >= h - 1 ? STONE[1] : u === 0 ? STONE[3] : hash(u >> 2, v >> 2, 485) < 0.15 ? STONE[1] : STONE[2]),
      right: (_u, v, _w, h) => (v === 0 ? STONE[2] : v >= h - 1 ? STONE[0] : mix(STONE[0], STONE[2], 0.4)),
    });
  }
  // a crack down the top block, and its broken corner
  const [k0x, k0y] = iso.at(TOP[0] / KT + 0.1, TOP[3] / KT, 27);
  for (let k = 0; k < 10; k++) heap.set(Math.round(k0x) + (k % 3 === 0 ? 1 : 0), Math.round(k0y) + k, DEEP);
  const heapDepth = new Float32Array(W * H);
  heapDepth.fill(-1e9);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (heap.has(x, y)) heapDepth[y * W + x] = boxDepth(x + 0.5 - ax, y + 0.5 - ay, BOXES) ?? -1e9;
  // rubble round its foot (on the floor, under all)
  const rubble = new Px(W, H);
  for (const [x, y, r] of [[-34, 12, 3.4], [-12, 12, 2.6], [10, -20, 3], [-26, -20, 2.8], [-36, -2, 2.4], [-6, 9, 2], [-18, 14, 2.2]] as const) {
    const [px, py] = onPic(x, y, r * 0.6);
    ball(rubble, ax + px, ay + py, r * 1.2, r * 0.8, STONE);
  }
  // and broken stone lying on the ledges of the heap (part of it: each as near as it is)
  for (const [x, y, z, r] of [[-17, -14, 15, 3], [-4, -15, 15, 2.6], [-25, 6, 9, 2.8], [-18, 0, 9, 2.2], [-10, -6, 29, 2.4]] as const) {
    const [px, py] = onPic(x, y, z + r * 0.5);
    const st = new Px(W, H);
    ball(st, ax + px, ay + py, r * 1.25, r * 0.85, STONE);
    const d = dot3([x, y, z + r], TOWARD);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const col = st.get(xx, yy);
      if (col && d > heapDepth[yy * W + xx]) {
        heap.set(xx, yy, col);
        heapDepth[yy * W + xx] = d;
      }
    }
  }
  /** The ball's skin, turned as the ball is: a point of it as seen, to where it is on the ball. */
  const turnOf = (m: [V3, V3, V3]) => (n: V3): V3 => {
    const w = add3(add3(mul3(CAM_R, n[0]), mul3(CAM_D, n[1])), mul3(CAM_T, n[2]));
    return [dot3(w, m[0]), dot3(w, m[1]), dot3(w, m[2])];
  };
  const paint = (f: number): Px => {
    const b = balls[f];
    const floor = new Px(W, H);
    // the flags cracked where it struck (from the blow on), its dent
    if (f >= impact) {
      for (let y = -6; y <= 6; y++) for (let x = -9; x <= 9; x++) {
        const r = (x / 8) ** 2 + (y / 4.4) ** 2;
        const [px, py] = onPic(hit[0], hit[1], 0);
        if (r <= 1) floor.set(Math.round(ax + px + x), Math.round(ay + py + y), r < 0.45 ? DEEP : y < 0 ? '#100d22' : SLAB[0]);
      }
      CRACKS.forEach((pts, k) => pts.forEach(([x, y], j) => {
        const [px, py] = onPic(x, y, 0);
        floor.set(Math.round(ax + px), Math.round(ay + py), DEEP);
        if (j < pts.length * 0.6) floor.set(Math.round(ax + px) + 1, Math.round(ay + py), k % 2 ? DEEP : SLAB[3]);
      }));
    }
    // its shadow on the floor under it, smaller and fainter the higher it is
    {
      const [sx, sy] = onPic(b.c[0], b.c[1], 0);
      const up = Math.max(0, b.c[2] - R);
      const rr = R * (1.05 - Math.min(0.5, up / 70));
      if (b.c[2] - R < 26 || true) {
        for (let y = -Math.ceil(rr * 0.5); y <= rr * 0.5; y++) for (let x = -Math.ceil(rr); x <= rr; x++) {
          const q = (x / rr) ** 2 + (y / (rr * 0.5)) ** 2;
          if (q > 1) continue;
          const X = Math.round(ax + sx + x + 2);
          const Y = Math.round(ay + sy + y + 1);
          if (heapDepth[Y * W + X] > -1e8 && heap.has(X, Y)) continue;
          floor.set(X, Y, q < 0.5 && up < 30 ? '#0a0918' : '#100e22');
        }
      }
    }
    fastBlit(floor, compose(null, [rubble], null), 0, 0);
    // THE HEAP, THE BALL AND ITS CHAIN, each pixel as near as it is
    const scene = new Px(W, H);
    const deep = new Deep(scene);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const col = heap.get(x, y);
      if (col) deep.put(x, y, heapDepth[y * W + x], col);
    }
    const things = new Px(W, H);
    const dt = new Deep(things);
    // (the deep's own measure of nearness is the world's: what the heap shares)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (heap.has(x, y)) dt.z[y * W + x] = heapDepth[y * W + x];
    chainInDepth(dt, [eyeOf(b.c, b.m), ...chains[f].slice(1)], ax, ay, 2, 999, 0.85, SMALL_IRON);
    const [bx, by] = onPic(b.c[0], b.c[1], b.c[2]);
    ironBall(things, ax + bx, ay + by, R, BALL_IRON, 5, turnOf(b.m), dt, dot3(b.c, TOWARD));
    // its eye, where the chain is fast, if it is on the side toward us
    const e = eyeOf(b.c, b.m);
    if (dot3(sub3(e, b.c), TOWARD) > -2) {
      const [ex, ey] = onPic(e[0], e[1], e[2]);
      const ring = new Px(W, H);
      ironRing(ring, ax + ex, ay + ey, 2.2, 1.2, SMALL_IRON);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const col = ring.get(x, y);
        if (col) dt.put(x, y, dot3(e, TOWARD) + 1, col);
      }
    }
    // the dust off the blow: what is behind where it struck under the ball, what is before it over
    const [hx, hy] = onPic(hit[0], hit[1], 0);
    const dustOver = new Px(W, H);
    const dustUnder = new Px(W, H);
    paintPuffs(puffs, f, ax + hx, ay + hy, dustOver, dustUnder, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    fastBlit(floor, dustUnder, 0, 0);
    const out = compose(floor, [scene, things], null);
    fastBlit(out, dustOver, 0, 0);
    // the pebble, the chips, the grit
    const bits = new Px(W, H);
    const pb = pebble[f];
    if (pb) {
      const q: V3 = [...pb];
      for (const bx_ of BOXES) outOfBox(q, bx_, 1.2);
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
      const q: V3 = [g.o[0] + 0.3 * t, g.o[1] + 0.25 * t, g.o[2] - 0.5 * G * t * t];
      if (q[2] < 0.5) continue;
      for (const bx_ of BOXES) outOfBox(q, bx_, 1);
      const [x, y] = onPic(q[0], q[1], q[2]);
      bits.set(Math.round(ax + x), Math.round(ay + y), STONE[3]).set(Math.round(ax + x) + 1, Math.round(ay + y), STONE[3]).set(Math.round(ax + x), Math.round(ay + y) + 1, STONE[1]).set(Math.round(ax + x) + 1, Math.round(ay + y) + 1, STONE[1]);
    }
    fastBlit(out, compose(null, [bits], null), 0, 0);
    return out;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f <= END; f++) frames.push(cut(paint(f), ax, ay));
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
    tr("its chain's end", (f) => chains[f][N], 6),
    tr('the pebble', (f) => pebble[f], 4),
    ...chips.map((ch, k) => tr(`chip ${k + 1}`, (f) => ch[f], 3)),
  ];
  return { frames, before: [frames[0]], after: [frames[END]], tracks, jolts: second > 0 ? [impact, second] : [impact], impact, second };
}

/** THE CELL WINDOW's opening and frame: a barred window into a cell, a heavy lintel and sill of dressed stone, dark inside (its bars are cellBars'). */
const CW_U0 = -12;
const CW_U1 = 11;
const CW_V0 = 18;
const CW_V1 = 50;
const CW_BARS = [-8, -3, 2, 7] as const;
const CW_CROSS = 31;
function cellWindowFrame(p: Px): void {
  const hole = (u: number, v: number): boolean => u >= CW_U0 && u <= CW_U1 && v >= CW_V0 && v <= CW_V1;
  relief(p, FACE, (u, v) => u >= CW_U0 - 3 && u <= CW_U1 + 3 && v >= CW_V0 - 4 && v <= CW_V1 + 4 && !hole(u, v), CW_U0 - 4, CW_U1 + 4, CW_V0 - 5, CW_V1 + 5);
  for (let v = CW_V0; v <= CW_V1; v++) for (let u = CW_U0; u <= CW_U1; u++) p.set(fx(u), fy(v), v === CW_V0 ? FACE[1] : DEEP);
  // the sockets of the bars in the lintel and the sill
  for (const u of CW_BARS) p.set(fx(u), fy(CW_V1 + 1), DEEP).set(fx(u + 1), fy(CW_V1 + 1), DEEP).set(fx(u), fy(CW_V0 - 1), FACE[0]);
}
/** THE CELL WINDOW, as a wall piece: its frame, four bars and one across them, riveted where they cross; dark behind. What the bars-shaking moment plays in. */
function cellWindow(p: Px): void {
  cellWindowFrame(p);
  const b = flat();
  for (const u of CW_BARS) for (let v = CW_V0; v <= CW_V1; v++) b.set(fx(u), fy(v), IRONS[3]).set(fx(u + 1), fy(v), IRONS[1]);
  for (let u = CW_U0; u <= CW_U1; u++) b.set(fx(u), fy(CW_CROSS + 1), IRONS[3]).set(fx(u), fy(CW_CROSS), IRONS[1]);
  for (const u of CW_BARS) b.set(fx(u), fy(CW_CROSS + 1), IRONS[4]);
  seamed(p, b);
}

/**
 * THE BARS SHAKE. A barred cell window, dark inside (`before`). The bars tremble; out of the dark
 * inside come two great grey hands, and their fingers close round two of the bars; two pink eyes
 * open high in the dark behind them. Then he shakes them: three times, each harder than the last
 * (each a jolt), the bars wrenched out and in and side to side in their sockets, rust and grit
 * jolting off them in showers, dust bursting from the joints of the stone round the window, his eyes
 * flaring; at the third a bar bends out of the window into the room and its rivet pops off and flies,
 * bouncing across the floor. He holds it, trembling; his fingers slide off the bars and his hands sink
 * back into the dark, and his eyes go back into it after them, nearer each other and smaller and
 * dimmer as they go (`after`: the window, its bar bent out, the rivet on the floor). For the face
 * turned to screen-left (`alongX`) or to screen-right; anchored as a wall piece is.
 */
function barsShake(alongX: boolean): Film & { yanks: number[] } {
  const W = 132;
  const H = 128;
  const ax = 56;
  const ay = 100;
  const see = faceAt(alongX);
  const toWorld = faceWorld(alongX);
  /** (u across the face in picture pixels, v up, b out into the room) on the picture. */
  const pic = (u: number, v: number, b: number): [number, number] => {
    const [x, y] = see(u / 0.8, b, v);
    return [ax + x, ay + y];
  };
  const G = 1.3;
  // THE TIMELINE
  const RATTLE = 1;
  const HANDS = [2, 7] as const;
  const EYES = 8;
  const YANKS = [11, 20, 30];
  const BEND = YANKS[2];
  const LET_GO = 40;
  const SINK = [42, 50] as const;
  const EYES_GO = [45, 54] as const;
  // the shaking: how far the grille is wrenched (across the face, and out into the room) frame by frame
  const BURSTS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
    [[1.6, 3.4], [-1.4, -2.2], [1.2, 2.8], [-1, -1.8], [0.8, 2], [-0.5, -1], [0.4, 1.2]],
    [[-2, 4.4], [1.8, -2.6], [-1.6, 3.6], [1.4, -2.2], [-1, 2.6], [0.8, -1.4], [-0.5, 1.4], [0.3, -0.6]],
    [[2.4, 5.4], [-2.2, -3], [2, 4.4], [-1.6, -2.4], [1.2, 3], [-0.8, -1.4]],
  ];
  const shakeOf = (f: number): [number, number] => {
    for (const [k, y] of YANKS.entries()) {
      const i = f - y;
      if (i >= 0 && i < BURSTS[k].length) return [BURSTS[k][i][0], BURSTS[k][i][1]];
    }
    // trembling while he holds them, and the first touch
    if (f >= RATTLE && f < RATTLE + 3) return [[0.8, -0.6, 0.4][f - RATTLE], 0];
    if (f >= HANDS[1] && f < LET_GO) return [0.5 * Math.sin(f * 2.1), 0.7 * Math.sin(f * 2.9)];
    return [0, 0];
  };
  /** How far a bar moves with the shake, `v` up it: most in its middle. The two he holds most. */
  const prof = (v: number): number => 0.3 + 0.7 * Math.sin((Math.PI * (v - CW_V0)) / (CW_V1 - CW_V0));
  const held = [0, 3];
  /** The bent bar: out into the room, bowed, from the third heave on. */
  const bent = (k: number, v: number, f: number): number => (k === 3 && f >= BEND ? 8 * Math.sin((Math.PI * (v - CW_V0)) / (CW_V1 - CW_V0)) * Math.min(1, (f - BEND + 1) / 2) : 0);
  /** Where a point of bar k is, `v` up it, on frame f: (u, b). */
  const barAt = (k: number, v: number, f: number): [number, number] => {
    const [su, sb] = shakeOf(f);
    const w = (held.includes(k) ? 1 : 0.5) * prof(v);
    return [CW_BARS[k] + su * w, sb * w + bent(k, v, f)];
  };
  // HIS HANDS: where each grips (which bar, its fingers' heights, which side they come round from)
  const HANDS_AT: ReadonlyArray<{ bar: number; vs: number[]; side: 1 | -1 }> = [
    { bar: 0, vs: [27, 30, 33, 36], side: 1 },
    { bar: 3, vs: [25, 28, 31, 34], side: -1 },
  ];
  /** How far in the dark his hands are (1: all dark, not yet come), and how far his fingers are round the bars, on frame f. */
  const handDim = (f: number): number => (f < HANDS[0] ? 1 : f < HANDS[1] ? 1 - smooth((f - HANDS[0]) / (HANDS[1] - HANDS[0])) : f < SINK[0] ? 0 : smooth((f - SINK[0]) / (SINK[1] - SINK[0])));
  const grip = (f: number): number => (f < HANDS[0] + 2 ? 0 : f < HANDS[1] + 1 ? smooth((f - HANDS[0] - 2) / 4) : f < LET_GO ? 1 : 1 - smooth((f - LET_GO) / 3));
  // HIS EYES: how bright (0 to 4), how far apart and how big, on frame f
  const eyeOf = (f: number): { lvl: number; apart: number; big: number; up: number } => {
    if (f < EYES) return { lvl: 0, apart: 10, big: 0, up: 0 };
    if (f < EYES + 3) return { lvl: [2, 3, 4][f - EYES], apart: 10, big: f - EYES < 1 ? 0.5 : 1, up: 0 };
    if (f < EYES_GO[0]) {
      const flare = YANKS.some((y) => f - y >= 0 && f - y < 3) ? 1.5 : 1;
      return { lvl: 4, apart: 10, big: flare, up: 0 };
    }
    const t = Math.min(1, (f - EYES_GO[0]) / (EYES_GO[1] - EYES_GO[0]));
    return { lvl: Math.max(0, Math.ceil(4 * (1 - t) - 0.01)), apart: 10 - 5 * t, big: 1 - 0.5 * t, up: 1.5 * t };
  };
  // THE RIVET, popped off the bent bar at the third heave
  const rivetPath = flung(BEND, [CW_BARS[3] + 0.5, 1.5, CW_CROSS], [0.6, 3.4, 2.6], 120, G, 0.45, 1);
  // (flung's (x, y, z) here are (u, b, v))
  // RUST AND GRIT shaken off: at every frame of a heave, a shower from the bars; dust from the stone's joints round the window at each heave
  interface Grain2 { f0: number; u: number; v: number; b: number; vu: number; vb: number }
  const grains: Grain2[] = [];
  YANKS.forEach((y, j) => {
    for (let i = 0; i < 6 + j * 2; i++) for (let k = 0; k < 3; k++) {
      const n = j * 100 + i * 3 + k;
      grains.push({ f0: y + i, u: CW_BARS[Math.floor(hash(n, 1, 490) * 4)] + hash(n, 2, 490) * 2, v: CW_V0 + hash(n, 3, 490) * (CW_V1 - CW_V0), b: 1, vu: (hash(n, 4, 490) - 0.5) * 0.8, vb: 0.3 + hash(n, 5, 490) * 1.2 });
    }
  });
  const puffs: Puff[] = [];
  const outward = faceHeading(alongX, 0, 1);
  YANKS.forEach((y, j) => {
    const corners: ReadonlyArray<readonly [number, number]> = [[CW_U0 - 3, CW_V1 + 3], [CW_U1 + 3, CW_V1 + 3], [CW_U0 - 3, CW_V0 - 2], [CW_U1 + 3, CW_V0 - 2], [0, CW_V1 + 4], [0, CW_V0 - 3]];
    corners.forEach(([u, v], k) => {
      const [x, yy, z] = toWorld(u / 0.8, 1, v);
      puffs.push({ f0: y, x, y: yy, z, ang: outward + (hash(k, j, 491) - 0.5) * 1.6, v: 1.4 + j * 0.5 + hash(k, j, 492), r0: 1.5, grow: 3 + j, rise: -1.2 - 0.4 * hash(k, j, 493), life: 9 + j * 2, seed: 300 + j * 10 + k });
    });
  });
  // mortar chips off the sill as the bar bends, falling
  const chips = Array.from({ length: 6 }, (_, k) => flung(BEND, [CW_BARS[3] - 3 + k * 1.4, 1.2, CW_V0 - 1], [(hash(k, 1, 494) - 0.5) * 1.2, 1 + hash(k, 2, 494) * 1.6, 0.6 + hash(k, 3, 494) * 1.4], 120, G, 0.35, 1));
  // IT IS OVER when the rivet has stopped, the eyes are gone and the last grit is down
  const rivetStill = rivetPath.findIndex((q, i) => i > BEND + 2 && q !== null && rivetPath[i - 1] !== null && q[0] === rivetPath[i - 1]![0] && q[1] === rivetPath[i - 1]![1] && q[2] === rivetPath[i - 1]![2]);
  const END = Math.max(EYES_GO[1] + 2, rivetStill, SINK[1] + 2);
  // grit trickling from the bars and the sill all the while, the last landing at END
  for (let k = 0; ; k++) {
    const v = CW_V0 + hash(k, 1, 495) * 6;
    const fall = Math.ceil(Math.sqrt((2 * v) / G));
    const f0 = END - fall - 2 * k;
    if (f0 < 1) break;
    grains.push({ f0, u: CW_U0 + 2 + hash(k, 2, 495) * (CW_U1 - CW_U0 - 4), v, b: 1.2, vu: 0, vb: 0.15 });
  }
  const grainAt = (g: Grain2, f: number): [number, number, number] | null => {
    const t = f - g.f0;
    if (t < 0) return null;
    const v = g.v - 0.5 * G * t * t;
    if (v < 0.5) return null;
    return [g.u + g.vu * t, v, g.b + g.vb * t];
  };
  // THE WINDOW'S STONE: the same on every frame
  const frame = flat();
  cellWindowFrame(frame);
  const stone = new Px(W, H);
  fastBlit(stone, onFacePx(frame, alongX), ax - PCX, ay - PFOOT);
  const dimmed = (c: string, d: number): string => (d > 0 ? mix(c, DEEP, d) : c);
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
    // HIS HANDS: the backs of them in the dark behind the bars, and the arms going back into it
    for (const hnd of HANDS_AT) {
      if (dim >= 1) continue;
      const [bu, bb] = barAt(hnd.bar, hnd.vs[1], f);
      const mv = (hnd.vs[0] + hnd.vs[3]) / 2 - dim * 2;
      const behind = bu - hnd.side * 3.5;
      for (let v = mv - 5; v <= mv + 5; v++) for (let u = behind - 4; u <= behind + 4; u++) {
        const r = ((u - behind) / 4.5) ** 2 + ((v - mv) / 5) ** 2;
        if (r > 1) continue;
        put(back, u, v, Math.min(0, bb), dimmed(r < 0.4 ? STARVED[1] : '#221a2a', 0.45 + dim * 0.55));
      }
      for (let v = mv - 12; v < mv - 5; v++) for (let u = behind - 3 - (mv - 5 - v) * 0.3; u <= behind + 3; u++) put(back, u, v, 0, dimmed('#1c1524', 0.5 + dim * 0.5));
    }
    // HIS EYES, high in the dark, behind the bars
    const e = eyeOf(f);
    if (e.lvl > 0) {
      const cu = 0;
      const cv = 44 + e.up;
      for (const s of [-1, 1]) {
        const eu = Math.round(cu + (s * e.apart) / 2 - 1);
        const core = e.lvl >= 4 ? FLAME[4] : e.lvl >= 3 ? FLAME[3] : e.lvl >= 2 ? FLAME[2] : FLAME[1];
        const body = e.lvl >= 3 ? FLAME[3] : e.lvl >= 2 ? FLAME[2] : FLAME[1];
        const w = e.big >= 1.5 ? 4 : e.big >= 1 ? 3 : e.big >= 0.75 ? 2 : 1;
        const h = e.big >= 1.5 ? 3 : e.big >= 0.75 ? 2 : 1;
        // (a ring of his fire round each, on the dark, while they burn bright)
        if (e.lvl >= 3) for (let du = -1; du <= w; du++) for (const dv of [-1, h]) put(back, eu + du, cv + dv, 0, FLAME[0]);
        for (let du = 0; du < w; du++) for (let dv = 0; dv < h; dv++) put(back, eu + du, cv + dv, 0, du === 0 && dv === h - 1 ? core : body);
      }
    }
    // THE BARS
    for (let k = 0; k < CW_BARS.length; k++) {
      for (let v = CW_V0; v <= CW_V1; v += 0.5) {
        const [u, b] = barAt(k, v, f);
        const [x, y] = pic(u, v, b);
        bars.set(Math.round(x), Math.round(y), IRONS[3]).set(Math.round(x) + 1, Math.round(y), IRONS[1]);
      }
    }
    // the bar across them: following each bar it is riveted to, but the bent one, once its rivet is gone
    for (let u = CW_U0; u <= CW_U1; u += 0.5) {
      let du = 0;
      let db = 0;
      const ks = [0, 1, 2, 3].filter((k) => !(k === 3 && f >= BEND));
      let wsum = 0;
      for (const k of ks) {
        const wgt = 1 / (0.5 + Math.abs(u - CW_BARS[k]));
        const [bu, bb] = barAt(k, CW_CROSS, f);
        du += (bu - CW_BARS[k]) * wgt;
        db += bb * wgt;
        wsum += wgt;
      }
      const [x, y] = pic(u + du / wsum, CW_CROSS, db / wsum);
      bars.set(Math.round(x), Math.round(y), IRONS[3]).set(Math.round(x), Math.round(y) + 1, IRONS[1]);
    }
    for (let k = 0; k < CW_BARS.length; k++) {
      if (k === 3 && f >= BEND) continue;
      const [u, b] = barAt(k, CW_CROSS, f);
      const [x, y] = pic(u, CW_CROSS + 0.5, b);
      bars.set(Math.round(x), Math.round(y), IRONS[4]);
    }
    // HIS HANDS ROUND THE BARS: four great fingers closed round each, over it: each finger a rounded
    // length of grey skin, lit along its top, dark under it where it lies on the next; the middle two
    // longest; their knuckles round on the side they come from, their tips round the bar's near side;
    // the thumb round the other side over them. (In the dark of the window: a step dim even when come.)
    for (const hnd of HANDS_AT) {
      if (dim >= 1 || g <= 0) continue;
      const d = 0.25 + 0.75 * dim;
      hnd.vs.forEach((vj, j) => {
        const v = vj - dim * 2;
        const [bu, bb] = barAt(hnd.bar, v, f);
        const reach = -1.5 + (7 * [0.85, 1, 0.95, 0.72][j]) * g;
        for (const [dv, row] of [[1, 0], [0, 1], [-1, 1], [-2, 2]] as const) {
          for (let s = -2.5 + (row !== 1 ? 0.5 : 0); s <= reach - (row !== 1 ? 0.5 : 0); s += 0.5) {
            const u = bu + hnd.side * s + (hnd.side < 0 ? 1 : 0);
            const tip = s > reach - 1.2;
            const c = row === 0 ? (tip ? STARVED[4] : STARVED[3]) : row === 1 ? (tip ? STARVED[1] : s < -1.5 ? STARVED[3] : STARVED[2]) : STARVED[1];
            put(hands, u, v + dv, bb + 0.6, dimmed(c, d));
          }
        }
      });
      // the thumb, round the other side of the bar, over the top finger
      const vt = hnd.vs[3] + 2.6 - dim * 2;
      const [bu, bb] = barAt(hnd.bar, vt, f);
      for (let s = 0; s <= 1 + 3 * g; s += 0.5) for (const dv of [0, 1]) put(hands, bu - hnd.side * (s - 1) + (hnd.side < 0 ? 0 : 1), vt + dv, bb + 0.6, dimmed(dv ? STARVED[3] : STARVED[2], d));
    }
    // the rivet, the chips, the grit
    const bits = new Px(W, H);
    const rv = rivetPath[f];
    if (rv) {
      const [x, y] = pic(rv[0], rv[2], rv[1]);
      bits.rect(Math.round(x), Math.round(y), 2, 2, IRONS[3]).set(Math.round(x) + 1, Math.round(y) + 1, IRONS[1]);
    }
    for (const ch of chips) {
      const q = ch[f];
      if (!q) continue;
      const [x, y] = pic(q[0], q[2], q[1]);
      bits.set(Math.round(x), Math.round(y), FACE[4]).set(Math.round(x) + 1, Math.round(y), FACE[1]);
    }
    for (const gr of grains) {
      const q = grainAt(gr, f);
      if (!q) continue;
      const [x, y] = pic(q[0], q[1], q[2]);
      const c0 = gr.b > 1.1 ? FACE[3] : FLAKE[0];
      const c1 = gr.b > 1.1 ? FACE[1] : FLAKE[1];
      bits.set(Math.round(x), Math.round(y), c0).set(Math.round(x) + 1, Math.round(y), c0).set(Math.round(x), Math.round(y) + 1, c1).set(Math.round(x) + 1, Math.round(y) + 1, c1);
    }
    const out = new Px(W, H);
    fastBlit(out, stone, 0, 0);
    let fig = compose(back, [bars, hands], bits);
    if (!alongX) fig = inShade(fig);
    fastBlit(out, fig, 0, 0);
    paintPuffs(puffs, f, ax, ay, out, null, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    return out;
  };
  const frames: Sprite[] = [];
  for (let f = 0; f <= END; f++) frames.push(cut(paint(f), ax, ay));
  // THE TRACKS
  const rel = (x: number, y: number): [number, number] => [x - ax, y - ay];
  const tracks: Track[] = [];
  {
    const t: Track = { name: 'the bars', at: [] };
    for (let f = 0; f <= END; f++) {
      const [u, b] = barAt(0, CW_CROSS, f);
      const [x, y] = rel(...pic(u, CW_CROSS, b));
      t.at.push({ x, y, shown: 1, size: 12 });
    }
    tracks.push(t);
  }
  {
    const t: Track = { name: 'the bent bar', at: [] };
    for (let f = 0; f <= END; f++) {
      const [u, b] = barAt(3, CW_CROSS, f);
      const [x, y] = rel(...pic(u, CW_CROSS, b));
      t.at.push({ x, y, shown: 1, size: 10 });
    }
    tracks.push(t);
  }
  HANDS_AT.forEach((hnd, i) => {
    const t: Track = { name: `his hand ${i + 1}`, at: [] };
    for (let f = 0; f <= END; f++) {
      const [u, b] = barAt(hnd.bar, hnd.vs[1], f);
      const [x, y] = rel(...pic(u, hnd.vs[1] - handDim(f) * 2, b));
      t.at.push({ x, y, shown: 1 - handDim(f), size: 10 });
    }
    tracks.push(t);
  });
  {
    const t: Track = { name: 'his eyes', at: [] };
    for (let f = 0; f <= END; f++) {
      const e = eyeOf(f);
      const [x, y] = rel(...pic(-0.5, 45 + e.up, 0));
      t.at.push({ x, y, shown: e.lvl / 4, size: 6 });
    }
    tracks.push(t);
  }
  {
    const t: Track = { name: 'the rivet', at: [] };
    let prev: [number, number] | null = null;
    for (let f = 0; f <= END; f++) {
      const q = rivetPath[f];
      if (!q) {
        t.at.push(null);
        continue;
      }
      const [x, y] = rel(...pic(q[0], q[2], q[1]));
      t.at.push({ x, y, shown: 1, size: 4 + (prev ? Math.hypot(x - prev[0], y - prev[1]) : 0) });
      prev = [x, y];
    }
    tracks.push(t);
  }
  return { frames, before: [frames[0]], after: [frames[END]], tracks, jolts: [...YANKS], yanks: YANKS };
}

let moments: Moment[] | null = null;
/** Floor 3's moments around the hero, made the first time they are asked for and kept. */
export function chainedMoments(): Moment[] {
  if (moments) return moments;
  const cl = chainsPull(true);
  const cr = chainsPull(false);
  const chains: Moment = { name: 'the chains pull', frames: cl.frames, fps: 30, before: cl.before, after: cl.after, tracks: cl.tracks, jolts: cl.jolts, holds: [], right: { frames: cr.frames, before: cr.before, after: cr.after, tracks: cr.tracks } };
  const b = ballFalls();
  const ball_: Moment = { name: 'the ball falls', frames: b.frames, fps: 30, before: b.before, after: b.after, tracks: b.tracks, jolts: b.jolts, holds: [] };
  const sl = barsShake(true);
  const sr = barsShake(false);
  const bars: Moment = { name: 'the bars shake', frames: sl.frames, fps: 30, before: sl.before, after: sl.after, tracks: sl.tracks, jolts: sl.jolts, holds: [], right: { frames: sr.frames, before: sr.before, after: sr.after, tracks: sr.tracks } };
  return (moments = [chains, ball_, bars]);
}
