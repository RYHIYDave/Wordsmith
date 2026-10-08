// (MOCK-UP, NOT IN THE GAME) DECORATIONS: their pictures (game/decor.ts says where they go, and
// has the switch, `DECOR`, which is off; render/render.ts draws them).
//
// The owner, 5 Oct 2026, 12:43: "And more doodads around like molted tapestries or gargoyle heads
// or missing broken floors tiles. That kind of thing. I know it's a tomb but I'd like it to look
// more alive if that makes sense"; 12:44: "And everything looks too flat". ("molted": moth-eaten.)
//
// Painted as everything in the dungeon is: two picture pixels to a game pixel, flat tones, light
// from the upper left of the screen, the deep indigo seam round what stands out, no smoothing.
//   - A TAPESTRY is painted FLAT IN THE PLANE OF ITS WALL'S FACE, by (u, v) as a door's lintel is
//     (art/gates.ts, `Flat`), and cut into strips a quarter of a tile wide, each stood at its own
//     place in the order of things (render.ts, `standDecor`). On the face that looks to +y (lit) it
//     is in its lighter tones; on the one that looks to +x (in shade), a tone darker throughout.
//   - A GARGOYLE'S HEAD is A SOLID, BUILT BY THE HEROES' OWN PAINTER (art/skin.ts: balls and rods,
//     every pixel lit by the way its skin faces, the nearer skin winning), in the 'front' view whose
//     own x is the world's x and whose own y is the world's -y: so the head on a wall that looks to
//     +x looks along its own +x, and the one on a wall that looks to +y along its own -y. Each of the
//     two is built for itself, NOT a mirror of the other, so the light stays on the upper left.
//     What of it would be behind the wall's face is not painted. On the lit face it throws its
//     shadow on the wall, down and a little to the right, as the light from the upper left would.
//   - A BROKEN FLAGSTONE lies flat on the floor, and is laid ON THE FLOOR'S OWN FLAGSTONES (eight to
//     five tiles: art/ground.ts, `floorAt`): its picture is anchored at the top corner of the stone
//     it is, which is always on the grain. Cracked, it is drawn over the stone (which shows through
//     it in its own tone); gone, the dark under it is drawn, and the sides of the stones round it.

import { mix, Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat } from './gates';
import type { Strip } from './gates';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { GRAIN, INK, hash } from './kit';
import type { Ramp } from './kit';
import { IRON } from './mkit';
import { lump, stoneOf } from './props';
import { ball, rod, stage } from './skin';
import type { Sheet, Skin, Stage } from './skin';
import { add, cross, dot, mul, norm } from './skeleton';
import type { V3 } from './skeleton';

/** The dark beyond the walls, and at the bottom of a hole (art/ground.ts). */
const BEYOND = '#07050a';
/** The colour of every shadow laid on the dungeon's stone: the walls' on the floor (art/ground.ts, `makeShade`). */
const SHADOW_RGB = [6, 4, 16] as const;
/** A shadow laid on a wall by what hangs on it or juts out of it: how dark, of 255. */
const WALL_SHADOW = 92;

function setShadow(p: Px, x: number, y: number, a = WALL_SHADOW): void {
  if (!p.inside(x, y) || p.has(x, y)) return;
  const i = (y * p.w + x) * 4;
  p.d[i] = SHADOW_RGB[0];
  p.d[i + 1] = SHADOW_RGB[1];
  p.d[i + 2] = SHADOW_RGB[2];
  p.d[i + 3] = a;
}

// =================================================================================================
// A TATTERED TAPESTRY
//
// Two blocks of wall wide, hung by a sleeve along its top from an iron rod near the top of the
// wall's solid part (the rod's ends, with a knob on each, stand out past the cloth). Broad folds
// down it, each lit on its left flank. A faded design of its own inside a border, worn away in
// patches. Moth holes, small ones here and there and two bigger ones eaten through, the wall
// showing through them in the cloth's shadow. A ragged hem with what is left of a fringe, a tear
// up into it, a corner torn away.

/** Where things are on the plane, in picture pixels: u along the wall from the start of its first block (each block's first column is the seam between two blocks), v up from the floor. */
export const TAPESTRY_WIDE = 64;
const CLOTH_L = 6;
const CLOTH_R = 57;
/** The top of the sleeve the rod runs through, the stitching under it, and where the hem is before it is torn. */
const CLOTH_TOP = 55;
const SLEEVE = 51;
const CLOTH_HEM = 16;
/** The rod: its lower row (it is two rows), and how far it reaches either way. */
const ROD_V = 53;
const ROD_L = 2;
const ROD_R = 61;
/** A fold every so many columns. */
const FOLD = 13;
/** The middle of the cloth along the plane. */
const CLOTH_MID = (CLOTH_L + CLOTH_R) / 2;

/** One tapestry: its cloth, the thread of its design, what the design is, and how it is torn. */
interface Cloth {
  field: Ramp;
  design: Ramp;
  /** The design: is the thread of it at this place? (c: columns from the middle of the cloth, toward the plane's end; v: rows up from the floor.) 2 for the darker thread of it (a book's spine, its cover). */
  motif: (c: number, v: number) => 0 | 1 | 2;
  seed: number;
  /** Which bottom corner is torn away: the one at the start of the plane, or the end. */
  torn: 'start' | 'end';
  /** Where a tear runs up from the hem (columns from the cloth's start). */
  tear: number;
}

/** An old red, gone brown: oxblood. */
const OXBLOOD: Ramp = ['#2a0c14', '#4a1620', '#6a2028', '#8a3232', '#a64a3c'];
/** Moss, gone grey. */
const MOSS: Ramp = ['#141a0c', '#222e16', '#334422', '#475a2c', '#61763a'];
/** The thread of the design: bone, faded. */
const FADED: Ramp = ['#3c3034', '#665446', '#8c7860', '#b09c7e', '#ccbd9c'];

/** A PALE SUN: a disc, a ring of dark round it, and eight rays, the four along the cloth's lines longer than the four between. */
function sunMotif(c: number, v: number): 0 | 1 | 2 {
  const dy = v - 35;
  const r = Math.hypot(c, dy);
  if (r < 4.8) return 1;
  if (r < 6.2) return 0;
  const step = Math.PI / 4;
  const th = Math.atan2(dy, c);
  const k = Math.round(th / step);
  const off = Math.abs(th - k * step) * r;
  const long = k % 2 === 0;
  const reach = long ? 11.5 : 9.5;
  if (r > reach) return 0;
  // (each ray narrows from its root to its point)
  return off < 1.6 * (1 - (r - 6.2) / (reach - 6.2)) + 0.45 ? 1 : 0;
}

/** A TREE: a crown of three round lobes, two boughs up into it from a stout trunk, roots spread under it. */
function treeMotif(c: number, v: number): 0 | 1 | 2 {
  const a = Math.abs(c);
  // the crown: three lobes, the middle one higher
  const lobe = (cx: number, cv: number, rx: number, rv: number): boolean => ((c - cx) / rx) ** 2 + ((v - cv) / rv) ** 2 < 1;
  if (lobe(0, 42, 6.5, 5) || lobe(-8, 37.5, 6, 4.5) || lobe(8, 37.5, 6, 4.5)) return 1;
  // two boughs from the trunk up into the side lobes
  if (v >= 31 && v <= 35 && Math.abs(a - (v - 30) * 1.4) < 1.1) return 1;
  // the trunk, widening to the roots
  if (v >= 22 && v <= 38 && a <= 1.5 + (v < 25 ? (25 - v) * 0.9 : 0)) return 1;
  // the roots: spreading along the ground each way
  if (v === 21 && a <= 7.5) return 1;
  if (v === 20 && a >= 5.5 && a <= 9.5) return 1;
  return 0;
}

const CLOTHS: readonly Cloth[] = [
  { field: OXBLOOD, design: FADED, motif: sunMotif, seed: 3, torn: 'end', tear: 15 },
  { field: MOSS, design: FADED, motif: treeMotif, seed: 11, torn: 'start', tear: 44 },
];

export const TAPESTRY_KINDS = CLOTHS.length;

/**
 * (MOCK-UP) THE OWNER'S CHOICE, 8 Oct 2026, of the first pictures: the decorations "Close, but change
 * it" (08:42), the tapestry "A different look" (08:43), and of the looks offered: "Torn and burnt" (08:44) ("Hanging in strips, scorched
 * holes, clearly old."). `burnt: false` gives the moth-eaten cloth of the first pictures, for comparison.
 */
export const TAPESTRY_LOOK = { burnt: true };
/** Soot and char: from the black of a burnt edge to the brown of singed cloth. */
const CHAR: Ramp = ['#0b0706', '#1a0f0b', '#2b1a12', '#3e2719', '#523621'];
/** Below this row the burnt cloth hangs in strips. */
const STRIPS_FROM = CLOTH_HEM + 14;

/** How a burnt cloth is: the lowest row of it in each column (by the column's own u), how many rows of that column's end are charred, its holes (keyed v * 128 + u: 1 burnt through, 2 its charred rim, 3 singed round it), and the few moth holes left. */
interface Burn {
  low: number[];
  tip: number[];
  holes: Map<number, 1 | 2 | 3>;
  moth: Set<number>;
}

function burnOf(c: Cloth): Burn {
  const low: number[] = [];
  const tip: number[] = [];
  // THE STRIPS: three to five columns wide, a slit between most of them; some hang lower than the
  // hem was, most end about where it was, some are burnt short; most ends are charred
  let u = CLOTH_L;
  for (let k = 0; u <= CLOTH_R; k++) {
    const w = 3 + Math.floor(hash(k, c.seed, 81) * 3);
    const r = hash(k, c.seed, 82);
    const end = r < 0.3 ? CLOTH_HEM - 3 - Math.floor(hash(k, c.seed, 83) * 4) : r < 0.72 ? CLOTH_HEM + Math.floor(hash(k, c.seed, 84) * 4) : CLOTH_HEM + 6 + Math.floor(hash(k, c.seed, 85) * 7);
    const charred = hash(k, c.seed, 86) < 0.7;
    for (let i = 0; i < w && u <= CLOTH_R; i++, u++) {
      // (a strip's end is ragged, its corners worn a little higher)
      const rag = i === 0 || i === w - 1 ? 1 + Math.floor(hash(u, c.seed, 87) * 2) : Math.floor(hash(u, c.seed, 88) * 2);
      low[u] = end + rag;
      tip[u] = charred ? 2 : 0;
    }
    if (u <= CLOTH_R && hash(k, c.seed, 89) < 0.7) {
      low[u] = STRIPS_FROM + Math.floor(hash(k, c.seed, 90) * 4);
      tip[u] = 1;
      u++;
    }
  }
  // A CORNER BURNT AWAY, up and across (where the first cloth had its torn corner)
  for (let uu = CLOTH_L; uu <= CLOTH_R; uu++) {
    const fromEnd = c.torn === 'end' ? CLOTH_R - uu : uu - CLOTH_L;
    if (fromEnd < 11) {
      const v = CLOTH_HEM + 9 + Math.round((11 - fromEnd) * 1.7) + Math.floor(hash(uu, c.seed, 91) * 2);
      if (v > low[uu]) {
        low[uu] = v;
        tip[uu] = 2;
      }
    }
  }
  // THREE HOLES BURNT THROUGH: ragged, a charred rim round each, the cloth singed round that and
  // stained above it by the smoke that went up
  const holes = new Map<number, 1 | 2 | 3>();
  const mark = (uu: number, v: number, kind: 1 | 2 | 3): void => {
    const key = v * 128 + uu;
    const was = holes.get(key);
    if (was === undefined || kind < was) holes.set(key, kind);
  };
  for (let h = 0; h < 3; h++) {
    // (one in each third of the cloth, at a height of its own)
    const third = (CLOTH_R - CLOTH_L - 8) / 3;
    const cu = CLOTH_L + 4 + Math.floor(third * h + hash(h, c.seed, 92) * third);
    const cv = STRIPS_FROM + 2 + Math.floor(hash(h, c.seed, 93) * (SLEEVE - STRIPS_FROM - 9));
    const rx = 2.2 + hash(h, c.seed, 94) * 2.4;
    const rv = 1.8 + hash(h, c.seed, 95) * 1.6;
    const m = Math.min(rx, rv);
    for (let dv = -7; dv <= 7; dv++) {
      for (let du = -8; du <= 8; du++) {
        const e = Math.hypot(du / rx, dv / rv) + (hash(cu + du, cv + dv, c.seed + 96) - 0.5) * 0.35;
        if (e < 1) mark(cu + du, cv + dv, 1);
        else if (e < 1 + 1.15 / m) mark(cu + du, cv + dv, 2);
        else if (e < 1 + 2.4 / m && hash(cu + du, cv + dv, c.seed + 97) < 0.8) mark(cu + du, cv + dv, 3);
      }
    }
    // (the smoke's stain: a few rows over it, narrowing and fading as it goes up)
    for (let dv = 1; dv <= 5; dv++) {
      const half = rx * (1 - dv / 7);
      for (let du = -Math.ceil(half); du <= Math.ceil(half); du++) if (Math.abs(du) <= half && hash(cu + du, cv + dv, c.seed + 98) < 0.75 - dv * 0.1) mark(cu + du, Math.round(cv + rv + dv), 3);
    }
  }
  // A FEW SMALL MOTH HOLES are left, from before it burnt
  const moth = new Set<number>();
  for (let k = 0; k < 6; k++) {
    const mu = CLOTH_L + 3 + Math.floor(hash(k, c.seed, 51) * (CLOTH_R - CLOTH_L - 5));
    const mv = STRIPS_FROM + 2 + Math.floor(hash(k, c.seed, 52) * (SLEEVE - STRIPS_FROM - 5));
    moth.add(mv * 128 + mu);
  }
  return { low, tip, holes, moth };
}

/** The cloth at one column: the lowest row of it (its hem), by its folds, its rags, its tear and its torn corner; or Infinity where there is none (the tear). */
function hemAt(c: Cloth, u: number): number {
  const s = u - CLOTH_L;
  // (the hem is a row lower where a fold comes forward, a row higher between)
  let low = ((s % FOLD) + FOLD) % FOLD < 6 ? CLOTH_HEM : CLOTH_HEM + 1;
  const r = hash(u, c.seed, 41);
  low += r < 0.4 ? 0 : r < 0.75 ? 1 : r < 0.92 ? 2 : 3;
  // (the tear: a slit up into the hem, the cloth either side of it curling away)
  if (s === c.tear) return Infinity;
  if (s === c.tear - 1 || s === c.tear + 1) low = Math.max(low, CLOTH_HEM + 4);
  // (a corner torn away, up and across)
  const fromEnd = c.torn === 'end' ? CLOTH_R - u : u - CLOTH_L;
  if (fromEnd < 8) low = Math.max(low, CLOTH_HEM + 3 + Math.round((8 - fromEnd) * 1.5));
  return low;
}

/** The slit of the tear goes this far up the cloth. */
const TEAR_UP = 9;

/** Moth holes: small ones here and there, two bigger ones, and bites out of the edges. Keyed v * 128 + u. */
function holesOf(c: Cloth): Set<number> {
  const out = new Set<number>();
  const add = (u: number, v: number): void => {
    out.add(v * 128 + u);
  };
  for (let k = 0; k < 13; k++) {
    const u = CLOTH_L + 3 + Math.floor(hash(k, c.seed, 51) * (CLOTH_R - CLOTH_L - 5));
    const v = CLOTH_HEM + 5 + Math.floor(hash(k, c.seed, 52) * (SLEEVE - CLOTH_HEM - 8));
    const size = hash(k, c.seed, 53);
    add(u, v);
    if (size > 0.45) add(u + 1, v);
    if (size > 0.75) add(u, v - 1);
  }
  // two bigger holes, eaten through: ragged, wider than high
  for (let k = 0; k < 2; k++) {
    // (one in each outer third of it, clear of the design in the middle)
    const cu = k === 0 ? CLOTH_L + 6 + Math.floor(hash(k, c.seed, 55) * 7) : CLOTH_R - 6 - Math.floor(hash(k, c.seed, 55) * 7);
    const cv = CLOTH_HEM + 9 + Math.floor(hash(k, c.seed, 56) * 18);
    for (let dv = -2; dv <= 2; dv++) {
      for (let du = -3; du <= 3; du++) {
        const e = (du / 3.2) ** 2 + (dv / 1.9) ** 2;
        if (e < 0.75 || (e < 1.15 && hash(cu + du, cv + dv, c.seed + 57) < 0.5)) add(cu + du, cv + dv);
      }
    }
  }
  // bites out of its two edges
  for (const [u, v] of [[CLOTH_L, 29 + (c.seed % 5)], [CLOTH_L, 30 + (c.seed % 5)], [CLOTH_L + 1, 30 + (c.seed % 5)], [CLOTH_R, 40 - (c.seed % 4)], [CLOTH_R - 1, 40 - (c.seed % 4)], [CLOTH_R, 41 - (c.seed % 4)], [CLOTH_R, 24], [CLOTH_L, 44]] as const) add(u, v);
  return out;
}

export function makeTapestry(theme: Theme, alongX: boolean, variant: number): Strip[] {
  void theme;
  const c = CLOTHS[((variant % CLOTHS.length) + CLOTHS.length) % CLOTHS.length];
  const F = new Flat(0, TAPESTRY_WIDE, 62);
  // (on the face that looks to +y the light falls on it; on the other, a tone darker throughout)
  const fd = alongX ? c.field[1] : c.field[0];
  const fb = alongX ? c.field[2] : c.field[1];
  const fl = alongX ? c.field[3] : c.field[2];
  const db = alongX ? c.design[2] : c.design[1];
  const dd = alongX ? c.design[1] : c.design[0];
  const iron: Ramp = alongX ? IRON : [IRON[0], IRON[0], IRON[0], IRON[2], IRON[3]];
  /** How far along the screen to the right a column is, from the cloth's own screen-left edge: its folds and its light go by the screen, which a plane along +y runs the other way. */
  const rightward = (u: number): number => (alongX ? u - CLOTH_L : CLOTH_R - u);
  const burn = TAPESTRY_LOOK.burnt ? burnOf(c) : null;
  const holes = burn ? burn.moth : holesOf(c);
  const tearU = CLOTH_L + c.tear;
  const inCloth = (u: number, v: number): boolean => {
    if (u < CLOTH_L || u > CLOTH_R || v > CLOTH_TOP) return false;
    if (burn) return v >= burn.low[u];
    if (u === tearU && v < CLOTH_HEM + TEAR_UP) return false;
    return v >= Math.min(hemAt(c, u), CLOTH_HEM + 30);
  };
  // the design, as the plane runs on the screen: its own left is the screen's left on either wall
  const motifAt = (u: number, v: number): 0 | 1 | 2 => c.motif(alongX ? u - CLOTH_MID : CLOTH_MID - u, v);
  // its border: a line two in from its sides and under the sleeve, and a band over the hem
  const band = CLOTH_HEM + 5;
  const border = (u: number, v: number): boolean => {
    if (v < band || v > SLEEVE - 3) return false;
    if (v === SLEEVE - 3 || v === band) return u >= CLOTH_L + 2 && u <= CLOTH_R - 2;
    return u === CLOTH_L + 2 || u === CLOTH_R - 2;
  };
  for (let v = 0; v < F.high; v++) {
    for (let u = 0; u < TAPESTRY_WIDE; u++) {
      if (!inCloth(u, v)) continue;
      // a moth hole: the wall shows through, in the cloth's shadow
      if (holes.has(v * 128 + u)) {
        if (alongX) F.set(u, v, BEYOND, WALL_SHADOW + 40);
        continue;
      }
      // the folds: lit on the left flank of each, in shade on the right
      const p = ((rightward(u) % FOLD) + FOLD) % FOLD;
      const fold = p === 1 || p === 2 ? 1 : p === 8 || p === 9 ? -1 : 0;
      let col = fold > 0 ? fl : fold < 0 ? fd : fb;
      if (v > SLEEVE) {
        // the sleeve the rod runs through: rounded over it, lit on top
        col = v === CLOTH_TOP ? fd : v === CLOTH_TOP - 1 ? fl : v === SLEEVE + 1 ? fd : fb;
      } else if (v === SLEEVE) col = fd; // (the stitching under the sleeve, in the rod's shadow)
      else {
        // (worn: the design gone in patches, the cloth showing; the border more than the figure in the middle)
        const m = motifAt(u, v);
        const worn = hash(u >> 1, v >> 1, 60 + c.seed) < (m > 0 ? (burn ? 0.14 : 0.06) : burn ? 0.3 : 0.16);
        // (the thread of the design keeps its tone over a fold's lit flank, and goes a tone darker in its shade)
        if ((m > 0 || border(u, v)) && !worn) col = m === 2 || fold < 0 ? dd : db;
        // (the hem, and the cloth by the tear: the edge curls, a tone darker)
        if (!burn && (v === hemAt(c, u) || (Math.abs(u - tearU) === 1 && v < CLOTH_HEM + TEAR_UP + 1))) col = fold > 0 ? fb : fd;
      }
      if (burn) {
        // (on the face in shade, the char is a tone darker too)
        const ch = (i: number): string => CHAR[Math.max(0, alongX ? i : i - 1)];
        const h = burn.holes.get(v * 128 + u);
        if (h === 1) {
          if (alongX) F.set(u, v, BEYOND, WALL_SHADOW + 40);
          continue;
        }
        if (h === 2) col = ch(hash(u, v, c.seed + 99) < 0.5 ? 1 : 2);
        else if (h === 3) col = mix(col, ch(2), 0.55);
        // (the end of a strip: charred black at its very end, singed brown above that; a slit's edges curl, a tone darker)
        const end = v - burn.low[u];
        if (burn.tip[u] === 2 && end === 0) col = ch(hash(u, c.seed, 100) < 0.6 ? 0 : 1);
        else if (burn.tip[u] === 2 && end === 1) col = mix(col, ch(2), 0.6);
        else if (burn.tip[u] === 1 && end < 2) col = fold > 0 ? fb : fd;
      }
      F.set(u, v, col);
    }
  }
  // what is left of a fringe along the hem: threads every other column, some gone (none on the burnt cloth)
  for (let u = CLOTH_L; u <= CLOTH_R && !burn; u += 2) {
    const low = hemAt(c, u);
    if (!Number.isFinite(low) || low > CLOTH_HEM + 3 || hash(u, c.seed, 71) < 0.3) continue;
    const n = 1 + Math.floor(hash(u, c.seed, 72) * 3);
    for (let k = 1; k <= n; k++) F.set(u, low - k, k === n ? fd : fb);
  }
  // the rod's two ends, out past the cloth, with a knob on each
  for (let u = ROD_L; u <= ROD_R; u++) {
    if (u >= CLOTH_L && u <= CLOTH_R) continue;
    F.set(u, ROD_V + 1, iron[3]);
    F.set(u, ROD_V, iron[2]);
  }
  for (const end of [ROD_L - 1, ROD_R + 1]) {
    const atStart = end < TAPESTRY_WIDE / 2;
    // (the light is on the screen's left: the start of a plane along +x, the end of one along +y)
    const lit = alongX ? atStart : !atStart;
    const out = atStart ? -1 : 1;
    F.set(end, ROD_V + 2, iron[lit ? 4 : 3]);
    F.set(end, ROD_V + 1, iron[lit ? 4 : 3]);
    F.set(end, ROD_V, iron[2]);
    F.set(end, ROD_V - 1, iron[0]);
    F.set(end + out, ROD_V + 1, iron[lit ? 3 : 2]);
    F.set(end + out, ROD_V, iron[0]);
  }
  // ITS SHADOW ON THE WALL (on the face the light falls on): the cloth hangs a little out from the
  // wall and the rod further, so the shadow is a little down and a hair to the right of the hem and
  // of the side to the right, and the knobs' further down
  if (alongX) {
    const drop = (u: number, v: number, dv: number): void => {
      if (!F.has(u + 1, v - dv)) F.set(u + 1, v - dv, BEYOND, WALL_SHADOW);
    };
    // (the lowest of the cloth in each column, found before any shadow is laid)
    const lows: number[] = [];
    for (let u = CLOTH_L - 1; u <= CLOTH_R; u++) {
      let low = Infinity;
      for (let v = CLOTH_TOP; v >= 0; v--) if (F.has(u, v)) low = v;
      lows.push(low);
    }
    lows.forEach((low, k) => {
      if (Number.isFinite(low)) for (const dv of [1, 2]) drop(CLOTH_L - 1 + k, low, dv);
    });
    for (let v = CLOTH_HEM; v <= CLOTH_TOP; v++) if (inCloth(CLOTH_R, v)) drop(CLOTH_R, v, 1);
    for (const end of [ROD_L - 2, ROD_L - 1, ROD_R + 1, ROD_R + 2]) for (const dv of [3, 4]) drop(end, ROD_V + 1, dv);
  }
  return F.strips(alongX);
}

// =================================================================================================
// A GARGOYLE'S HEAD
//
// A grotesque of carved stone, a little greyer and paler than the wall it comes out of, jutting
// out high up: a heavy brow over two deep eye sockets, broad cheeks, a blunt snout with nostrils,
// a jaw hanging open under it and four fangs, and small horns swept back (or, the other one,
// pointed ears laid back). Built of balls and rods on the heroes' stage, so that it is lit as they
// are and has the same seam round it. Its stone is ONE SOLID (all of it on one part, so no seam
// runs between the brow and the skull): the seam goes round it, and round its mouth and fangs.
// What would be behind the face of the wall is cut away.

/** How high the middle of the head is, over the floor at the foot of its wall, in picture pixels (the wall's solid part is 56): as first shown, and as the owner asked for it. */
export const GARGOYLE_MOUNT = 35;
const GARGOYLE_MOUNT_HIGH = 42;
/** How much bigger than its own measure below the head is built: as first shown, and as asked for. */
const HEAD_FIRST = 1.15;
const HEAD_SMALL = 0.75;
/**
 * (MOCK-UP) THE OWNER, 8 Oct 2026, 08:44, of the first pictures' gargoyle: "It’s too big and too low on
 * the wall." `small: true` builds it at about two thirds of its first size, its middle 7 picture
 * pixels higher, so that it sits in the top half of the wall's solid part and no higher than it.
 * `small: false` gives the first one, for comparison.
 */
export const GARGOYLE_LOOK = { small: true };
/** The heroes' light as the figure's own space has it (skin.ts: from the upper left of the screen and a little toward the eye). */
function lightIn(st: Stage): V3 {
  const L: V3 = [-0.52, -0.62, 0.59];
  const b = st.back;
  return norm([b[0][0] * L[0] + b[0][1] * L[1] + b[0][2] * L[2], b[1][0] * L[0] + b[1][1] * L[1] + b[1][2] * L[2], b[2][0] * L[0] + b[2][1] * L[1] + b[2][2] * L[2]]);
}

type T3 = readonly [number, number, number];
/** One solid of the head: a ball (its middle, and its three half-lengths along the head's forward, left and up) or a rod (two ends, two radii), in the head's own measure; and what it is: stone, the skull with the eyes in it, the dark of the mouth, or a fang. */
type Part = { ball: T3; axes: T3; tilt?: number; is: 'stone' | 'skull' | 'mouth' } | { rod: readonly [T3, T3]; r: readonly [number, number]; is: 'stone' | 'fang' };

/** Darker than any stone: the deep of an eye or a mouth. */
const DEEP: Ramp = ['#0a081c', '#0a081c', '#120f2e', '#18143a', '#18143a'];

/** The parts of the head: the first is the snout (its nostrils are marked on it). */
function headParts(variant: number): Part[] {
  const horns = variant % 2 === 0;
  const parts: Part[] = [
    // the snout, broad and blunt, below the eyes
    { ball: [15.6, 0, -0.6], axes: [5.8, 4.4, 3.1], is: 'stone' },
    // where it comes out of the wall: a swelling of stone, cut by the wall's face
    { ball: [2.5, 0, -1.5], axes: [5.5, 8.5, 9.5], is: 'stone' },
    // the skull, with the eyes in it
    { ball: [7, 0, 3.5], axes: [7.4, 8, 7.2], is: 'skull' },
    // the cheeks
    { ball: [11, 5, 0.6], axes: [4, 3.2, 3.2], is: 'stone' },
    { ball: [11, -5, 0.6], axes: [4, 3.2, 3.2], is: 'stone' },
    // the brow: two heavy bosses over the eyes, slanting down to the nose
    { ball: [12.6, 3.7, 7.2], axes: [3, 3.8, 2.1], tilt: -14, is: 'stone' },
    { ball: [12.6, -3.7, 7.2], axes: [3, 3.8, 2.1], tilt: 14, is: 'stone' },
    // the jaw, hanging open
    { ball: [13.4, 0, -6.7], axes: [5.2, 4.5, 2.3], is: 'stone' },
    // the mouth, dark, between the snout and the jaw
    { ball: [14.4, 0, -4.2], axes: [4.6, 3.9, 2.1], is: 'mouth' },
    // the fangs: two down from the snout, two up from the jaw
    { rod: [[18.8, 2.2, -2.4], [19.1, 2.2, -5.8]], r: [1.2, 0.35], is: 'fang' },
    { rod: [[18.8, -2.2, -2.4], [19.1, -2.2, -5.8]], r: [1.2, 0.35], is: 'fang' },
    { rod: [[17.2, 3.3, -5.4], [17.5, 3.5, -2.8]], r: [1.05, 0.3], is: 'fang' },
    { rod: [[17.2, -3.3, -5.4], [17.5, -3.5, -2.8]], r: [1.05, 0.3], is: 'fang' },
  ];
  for (const s of [1, -1]) {
    if (horns) {
      // small horns swept back from the top of the skull
      parts.push({ rod: [[6.5, 5 * s, 9.5], [4.4, 7.6 * s, 13.4]], r: [2.1, 1.5], is: 'stone' });
      parts.push({ rod: [[4.4, 7.6 * s, 13.4], [2.6, 7 * s, 17.6]], r: [1.5, 0.45], is: 'stone' });
    } else {
      // pointed ears, laid back
      parts.push({ rod: [[5.2, 7.4 * s, 6], [2.4, 11.8 * s, 11.8]], r: [2.5, 0.4], is: 'stone' });
    }
  }
  return parts;
}

/** The eyes: two deep sockets under the brow, cut in the skull. (`p`: a place on the skull, in the head's own measure.) */
function eyeAt(p: V3): 0 | 1 | 2 {
  for (const s of [1, -1]) {
    const dl = (p[1] - 3.5 * s) / 2.1;
    const du = (p[2] - 4.4) / 1.7;
    const e = dl * dl + du * du;
    // (deep in each, a point of the stone catches what light there is: 2)
    if (p[0] > 9 && e < 1) return e < 0.12 ? 2 : 1;
  }
  return 0;
}

export function makeGargoyle(theme: Theme, alongX: boolean, variant: number): Sprite {
  // (carved stone: the dungeon's own, a little greyer and paler than its walls, so that it stands off them)
  const stone = stoneOf(theme).map((c) => mix(c, '#9896b4', 0.22)) as unknown as Ramp;
  const fang: Ramp = [theme.lit[1], theme.lit[2], mix(theme.lit[4], '#ffffff', 0.2), mix(theme.lit[4], '#ffffff', 0.45), mix(theme.lit[4], '#ffffff', 0.6)];
  const ax = 88;
  const ay = 150;
  const st = stage('front', ax, ay);
  const MOUNT = GARGOYLE_LOOK.small ? GARGOYLE_MOUNT_HIGH : GARGOYLE_MOUNT;
  const HEAD = GARGOYLE_LOOK.small ? HEAD_SMALL : HEAD_FIRST;
  // the head's own forward, left and up, in the figure's space (the world's x, minus the world's y, up)
  const fwd: V3 = alongX ? [0, -1, 0] : [1, 0, 0];
  const up: V3 = [0, 0, 1];
  const left = cross(up, fwd);
  const at = (q: T3): V3 => add(add(add([0, 0, MOUNT], mul(fwd, q[0] * HEAD)), mul(left, q[1] * HEAD)), mul(up, q[2] * HEAD));
  const out = (p: V3): number => dot(p, fwd);
  const parts = headParts(variant);
  // (all of its stone is one solid: one part, the nearer skin winning within it)
  const carved = st.part(at([8, 0, 0]));
  const sheets: Sheet[] = [];
  for (const q of parts) {
    if ('ball' in q) {
      const c = at(q.ball);
      // (a ball may be tipped about the head's forward line: a brow boss slanting down to the nose)
      const t = ((q.tilt ?? 0) * Math.PI) / 180;
      const l2 = add(mul(left, Math.cos(t)), mul(up, Math.sin(t)));
      const u2 = add(mul(up, Math.cos(t)), mul(left, -Math.sin(t)));
      const axes: [V3, V3, V3] = [mul(fwd, q.axes[0] * HEAD), mul(l2, q.axes[1] * HEAD), mul(u2, q.axes[2] * HEAD)];
      const sheet = q.is === 'mouth' ? st.part(c) : carved;
      const ramp = q.is === 'mouth' ? DEEP : stone;
      const skin: Skin = (u, tone) => {
        const p = add(c, add(add(mul(axes[0], u[0]), mul(axes[1], u[1])), mul(axes[2], u[2])));
        // (what would be behind the face of the wall is not there)
        if (out(p) < 0) return null;
        if (q.is === 'skull') {
          const local: V3 = [out(p) / HEAD, dot(p, left) / HEAD, (p[2] - MOUNT) / HEAD];
          const eye = eyeAt(local);
          if (eye === 2) return stone[1];
          if (eye === 1) return DEEP[Math.min(tone, 2)];
        }
        return ramp[tone];
      };
      ball(sheet, st, c, axes, skin);
      sheets.push(sheet);
    } else {
      const a = at(q.rod[0]);
      const b = at(q.rod[1]);
      const sheet = q.is === 'fang' ? st.part(add(a, mul(fwd, 0.5))) : carved;
      rod(sheet, st, a, b, q.r[0] * HEAD, q.r[1] * HEAD, q.is === 'fang' ? fang : stone);
      sheets.push(sheet);
    }
  }
  // the nostrils: two dark points on the front of the snout (drawn on it, so no seam goes round them)
  const snout = parts[0] as { ball: T3 };
  for (const s of [1, -1]) {
    const [x, y] = st.at(at([snout.ball[0] + 5.2, 1.7 * s, snout.ball[2] + 1.1]));
    carved.mark(x - 0.5, y - 0.5, DEEP[0]);
  }
  const px = st.whole(null);
  // ITS SHADOW ON THE WALL, where the light falls on the wall (the face that looks to +y): every
  // point of the head's skin sent along the light onto the wall's face
  if (alongX) {
    const L = lightIn(st);
    const lf = dot(L, fwd);
    const mask = new Uint8Array(px.w * px.h);
    const cast = (p: V3): void => {
      const f = out(p);
      if (f < 0 || lf <= 0.05) return;
      const s = add(p, mul(L, -f / lf));
      if (s[2] < 1) return;
      const [x, y] = st.at(s);
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) if (px.inside(xi + dx, yi + dy)) mask[(yi + dy) * px.w + xi + dx] = 1;
    };
    for (const q of parts) {
      if ('ball' in q) {
        const c = at(q.ball);
        for (let i = 0; i <= 24; i++) {
          for (let j = 0; j < 48; j++) {
            const th = (i / 24) * Math.PI;
            const ph = (j / 48) * Math.PI * 2;
            const e: V3 = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
            cast(add(c, add(add(mul(fwd, e[0] * q.axes[0] * HEAD), mul(left, e[1] * q.axes[1] * HEAD)), mul(up, e[2] * q.axes[2] * HEAD))));
          }
        }
      } else {
        const a = at(q.rod[0]);
        const b = at(q.rod[1]);
        for (let i = 0; i <= 16; i++) cast(add(a, mul(add(b, mul(a, -1)), i / 16)));
      }
    }
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (mask[y * px.w + x]) setShadow(px, x, y);
  }
  const box = px.bounds(GRAIN);
  if (!box) return px.sprite(ax, ay, GRAIN);
  return px.crop(box.x, box.y, box.w, box.h).sprite(ax - box.x, ay - box.y, GRAIN);
}

export const GARGOYLE_KINDS = 2;

// =================================================================================================
// A BROKEN FLAGSTONE
//
// The floor's flagstones are laid on the world, eight to five tiles (art/ground.ts, `floorAt`): a
// stone is a diamond 40 picture pixels across and 20 down, its top corner on the grain. A stone's
// own place (fu, fv), each 0 to 1 from that corner: fu down the screen to the right, fv to the
// left. The joint round a stone is the part of it within 0.075 of its two upper edges.
//   CRACKED: cracks out from where a blow fell near its middle, the piece of it nearest the eye
//   sunk a little (in shadow, the broken side of the stone behind showing over it), a pit knocked
//   out where it was struck, a crack running on into the stone beside it, bits about.
//   GONE: the dark where it lay, its two far sides seen going down (the stone beyond each, its
//   thickness, then the dark); a corner of it still there, or not; a piece of it fallen in; the
//   stone beside it cracked by the same blow; bits about.

/** The picture of a broken stone: its size, and where the stone's top corner is in it (room for the stones beside it). */
const SW = 104;
const SH = 52;
const SAX = 52;
const SAY = 10;
/** One stone, in picture pixels: across the screen and down it. */
const SLAB_X = 20;
const SLAB_Y = 10;
/** How deep the sides of a hole are seen going down, in picture pixels: the stone's thickness, then the dark. */
const HOLE_SIDE = 7;
const SLAB_THICK = 3;
/** The dark of a crack, deeper than the joints between the stones. */
const CRACK_DARK = '#07061a';

/** Where in a stone (its top corner at ox, oy in the picture) a picture pixel is: (fu, fv). */
function slabPlace(x: number, y: number, ox = SAX, oy = SAY): [number, number] {
  const dx = x + 0.5 - ox;
  const dy = y + 0.5 - oy;
  return [(dx / SLAB_X + dy / SLAB_Y) / 2, (dy / SLAB_Y - dx / SLAB_X) / 2];
}
/** The picture pixel at a place of a stone whose top corner is at (ox, oy). */
function slabPixel(fu: number, fv: number, ox = SAX, oy = SAY): [number, number] {
  return [ox + (fu - fv) * SLAB_X, oy + (fu + fv) * SLAB_Y];
}

/** A bit of broken stone lying on the floor, as the floor's rubble is painted (art/props.ts, `lump`): lit on its upper left, its shadow under it. */
function chip(p: Px, x: number, y: number, w: number, h: number, theme: Theme, k: number): void {
  lump(p, stoneOf(theme), theme.mortar, x, y, w, h, k + 90);
}

/** The lit lip of a broken edge of the floor's stone. */
const lipOf = (theme: Theme): string => mix(theme.slab[3], '#ffffff', 0.26);

/** A crack in a stone (its top corner at ox, oy): a line that wanders from one place of it to another, two pixels wide over most of its way, its near lip lit. */
function crackLine(p: Px, theme: Theme, a: P2, b: P2, seed: number, ox = SAX, oy = SAY, wideFor = 0.7): void {
  const [x0, y0] = slabPixel(a[0], a[1], ox, oy);
  const [x1, y1] = slabPixel(b[0], b[1], ox, oy);
  const n = Math.max(2, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
  const lip = lipOf(theme);
  let wob = 0;
  const marks: [number, number, boolean][] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    if (i % 3 === 0) wob = Math.max(-1.3, Math.min(1.3, wob + (hash(i, seed, 71) - 0.5) * 1.8));
    // (it wanders square to its way, and not at its two ends)
    const nx = -(y1 - y0) / n;
    const ny = (x1 - x0) / n;
    const nl = Math.hypot(nx, ny) || 1;
    const x = Math.round(x0 + (x1 - x0) * k + (nx / nl) * wob * Math.sin(Math.PI * k) - 0.5);
    const y = Math.round(y0 + (y1 - y0) * k + (ny / nl) * wob * Math.sin(Math.PI * k) - 0.5);
    marks.push([x, y, k < wideFor]);
  }
  const inStone = (x: number, y: number): boolean => {
    const [fu, fv] = slabPlace(x, y, ox, oy);
    return fu >= 0.05 && fv >= 0.05 && fu < 1 && fv < 1;
  };
  for (const [x, y, wide] of marks) {
    if (!inStone(x, y)) continue;
    p.set(x, y, CRACK_DARK);
    // (wide near where it began: the stone beside it broken away too)
    if (wide && inStone(steep ? x + 1 : x, steep ? y : y + 1)) p.set(steep ? x + 1 : x, steep ? y : y + 1, theme.mortar);
  }
  // the near lip of the crack catches the light (below it, or to its right where it runs down the screen)
  for (const [x, y] of marks) {
    const lx = steep ? x + 1 : x;
    const ly = steep ? y : y + 1;
    if (!inStone(x, y) || !inStone(lx, ly) || p.has(lx, ly)) continue;
    p.set(lx, ly, lip);
  }
}

/** A CRACKED stone, its top corner at (ox, oy): see the head of this part. */
function crackStone(p: Px, theme: Theme, v: number, ox = SAX, oy = SAY): [number, number] {
  const hit = CRACK_HIT[v];
  const ends = CRACK_ENDS[v];
  const [hx, hy] = slabPixel(hit[0], hit[1], ox, oy);
  // (the cracks' ways out from where it was struck, as angles on the screen; the piece that sank lies between the two either side of straight down)
  const angle = (x: number, y: number): number => Math.atan2(y - hy, x - hx);
  const rays = ends.map((e) => {
    const [x, y] = slabPixel(e[0], e[1], ox, oy);
    return angle(x, y);
  });
  rays.sort((a, b) => a - b);
  const down = Math.PI / 2;
  let lo = rays[rays.length - 1] - Math.PI * 2;
  let hi = rays[0];
  for (let i = 0; i + 1 < rays.length; i++) if (rays[i] <= down && rays[i + 1] > down) [lo, hi] = [rays[i], rays[i + 1]];
  const sunk = (x: number, y: number): boolean => {
    let a = angle(x + 0.5, y + 0.5);
    if (a < lo) a += Math.PI * 2;
    if (a > hi) a -= Math.PI * 2;
    const [fu, fv] = slabPlace(x, y, ox, oy);
    return a > lo && a < hi && fu >= 0.075 && fv >= 0.075 && fu < 1 && fv < 1 && Math.hypot(x + 0.5 - hx, (y + 0.5 - hy) * 2) > 2.5;
  };
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      if (!sunk(x, y)) continue;
      // the broken side of the stone behind it, two pixels of it over the sunk piece: lit where it looks to the lower left
      if (!sunk(x, y - 1) || !sunk(x, y - 2)) {
        const face = x + 0.5 < hx ? theme.lit : theme.shade;
        p.set(x, y, !sunk(x, y - 1) ? face[4] : face[2]);
        continue;
      }
      // (sunk: in shadow, as a shadow on the floor is laid)
      const i = (y * SW + x) * 4;
      p.d[i] = SHADOW_RGB[0];
      p.d[i + 1] = SHADOW_RGB[1];
      p.d[i + 2] = SHADOW_RGB[2];
      p.d[i + 3] = 150;
    }
  }
  ends.forEach((e, k) => crackLine(p, theme, hit, e, v * 7 + k, ox, oy));
  // where it was struck: a pit knocked out of it, its near lip lit
  const cx = Math.round(hx - 0.5);
  const cy = Math.round(hy - 0.5);
  for (const [dx, dy] of [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, -1], [0, -1], [1, -1], [-1, 1], [0, 1], [1, 1]] as const) p.set(cx + dx, cy + dy, CRACK_DARK);
  for (const dx of [-2, -1, 0, 1, 2]) if (!p.has(cx + dx, cy + 2)) p.set(cx + dx, cy + 2, lipOf(theme));
  return [cx, cy];
}

/** A stone GONE, its top corner at (ox, oy): see the head of this part. `keep`: which corner of it is still there (or none). */
function holeStone(p: Px, theme: Theme, keep: 'near' | 'right' | 'none', piece: P2, ox = SAX, oy = SAY): void {
  const kept = (fu: number, fv: number): boolean =>
    keep === 'near' ? fu + fv > 1.55 + 0.06 * Math.sin(fu * 23) : keep === 'right' ? fu > 0.74 + 0.05 * Math.sin(fv * 19) && fv < 0.42 : false;
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      const [fu, fv] = slabPlace(x, y, ox, oy);
      if (fu < 0 || fv < 0 || fu >= 1 || fv >= 1) continue;
      if (kept(fu, fv)) {
        // (the broken edge of what is left: lit where the dark is up the screen from it)
        const [gu, gv] = slabPlace(x, y - 1, ox, oy);
        if (!kept(gu, gv) && gu >= 0.075 && gv >= 0.075) p.set(x, y, lipOf(theme));
        continue;
      }
      // how far down the side under each far edge of the hole a pixel is, in picture pixels; or
      // under the broken edge of what is left of the stone, where that looks to the eye
      const dR = fv / (0.5 / SLAB_Y);
      const dL = fu / (0.5 / SLAB_Y);
      let dK = HOLE_SIDE;
      for (let k = 1; k <= HOLE_SIDE; k++) {
        const [gu, gv] = slabPlace(x, y - k, ox, oy);
        if (gu >= 0 && gv >= 0 && gu < 1 && gv < 1 && kept(gu, gv)) {
          dK = k - 1;
          break;
        }
      }
      let col = BEYOND;
      const d = Math.min(dR, dL, dK);
      const lit = dR <= dL || dK <= dL;
      if (d < HOLE_SIDE) {
        const face = lit ? theme.lit : theme.shade;
        const k = Math.floor(d);
        col = k === 0 ? face[4] : k < SLAB_THICK ? face[2] : k < SLAB_THICK + 2 ? mix(face[1], BEYOND, 0.45) : mix(face[0], BEYOND, 0.7);
      } else if (hash(x, y, 81) < 0.06) col = theme.shade[0];
      p.set(x, y, col);
    }
  }
  // a piece of it fallen in, lying in the dark (in the hole's shade: the stone's own tones, a step down)
  const [fx, fy] = slabPixel(piece[0], piece[1], ox, oy);
  const deep = stoneOf(theme);
  lump(p, [deep[0], deep[0], deep[1], deep[2], deep[3]], BEYOND, Math.round(fx) - 4, Math.round(fy) - 2, 8, 4, 31);
}

type P2 = readonly [number, number];
/** Where each cracked stone was struck, and where its cracks run out to (in the stone's own measure). */
const CRACK_HIT: readonly P2[] = [[0.46, 0.52], [0.55, 0.42], [0.4, 0.45]];
const CRACK_ENDS: ReadonlyArray<readonly P2[]> = [
  [[0.12, 0.95], [0.98, 0.22], [0.3, 0.06], [0.98, 0.78]],
  [[0.96, 0.6], [0.08, 0.3], [0.62, 0.97], [0.5, 0.05]],
  [[0.97, 0.45], [0.2, 0.96], [0.06, 0.12], [0.75, 0.97]],
];
/** Bits about a broken stone: [x, y, width, height], picture pixels from its top corner. */
const BITS: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[22, 5, 6, 4], [-28, 12, 5, 3], [6, 26, 4, 3], [-13, 1, 3, 2]],
  [[-26, 4, 6, 4], [21, 17, 5, 3], [-9, 27, 4, 3], [12, 1, 3, 2]],
  [[24, 11, 5, 4], [-24, 3, 6, 3], [1, 27, 5, 3], [-18, 21, 3, 2]],
];

/** A stone CRACKED across, a crack running on into the stone beside it, and bits about. */
function makeCrack(theme: Theme, variant: number): Sprite {
  const p = new Px(SW, SH);
  const v = variant % 3;
  crackStone(p, theme, v);
  // (the crack that runs on into the stone beside it: to the lower right, or the lower left)
  const right = v !== 1;
  const [nx, ny] = right ? slabPixel(1, 0) : slabPixel(0, 1);
  crackLine(p, theme, right ? [0.06, 0.5 + v * 0.1] : [0.45 + v * 0.1, 0.06], right ? [0.5, 0.42] : [0.4, 0.55], 40 + v, nx, ny, 0.2);
  BITS[v].forEach(([x, y, w, h], k) => chip(p, SAX + x, SAY + y, w, h, theme, k));
  return p.sprite(SAX, SAY, GRAIN);
}

/** A stone GONE, the stone beside it cracked by the same blow, and bits about. */
function makeHole(theme: Theme, variant: number): Sprite {
  const p = new Px(SW, SH);
  const v = variant % 3;
  holeStone(p, theme, (['near', 'right', 'none'] as const)[v], [[0.62, 0.55], [0.4, 0.62], [0.55, 0.5]][v] as unknown as P2);
  // the stone beside it, to the lower left or the lower right, cracked
  const [nx, ny] = v === 1 ? slabPixel(0, 1) : slabPixel(1, 0);
  crackStone(p, theme, (v + 1) % 3, nx, ny);
  BITS[(v + 1) % 3].forEach(([x, y, w, h], k) => chip(p, SAX + x, SAY + y, w, h, theme, k + 5));
  return p.sprite(SAX, SAY, GRAIN);
}

export const SLAB_KINDS = 3;

// =================================================================================================

/** The pictures of the decorations: each painted the first time it is asked for, and kept. */
export interface DecorArt {
  /** A tapestry on a wall's face in a plane along +x (it looks to +y) or along +y: its strips, u = 0 where its block begins along the plane. */
  tapestry(alongX: boolean, variant: number): Strip[];
  /** A gargoyle's head on a wall's face in a plane along +x or along +y, anchored at the floor at the foot of the wall under its middle. */
  gargoyle(alongX: boolean, variant: number): Sprite;
  /** A broken flagstone, anchored at the stone's top corner. */
  slab(kind: 'crack' | 'hole', variant: number): Sprite;
}

export function makeDecorArt(theme: Theme = VAULT): DecorArt {
  const kept = new Map<string, Strip[] | Sprite>();
  const keep = <T extends Strip[] | Sprite>(key: string, make: () => T): T => {
    let s = kept.get(key) as T | undefined;
    if (!s) kept.set(key, (s = make()));
    return s;
  };
  return {
    tapestry: (alongX, variant) => keep(`t${alongX ? 1 : 0}:${variant % TAPESTRY_KINDS}`, () => makeTapestry(theme, alongX, variant % TAPESTRY_KINDS)),
    gargoyle: (alongX, variant) => keep(`g${alongX ? 1 : 0}:${variant % GARGOYLE_KINDS}`, () => makeGargoyle(theme, alongX, variant % GARGOYLE_KINDS)),
    slab: (kind, variant) => keep(`${kind}:${variant % SLAB_KINDS}`, () => (kind === 'crack' ? makeCrack(theme, variant % SLAB_KINDS) : makeHole(theme, variant % SLAB_KINDS))),
  };
}
