// FLOOR 5'S STORY PIECES: a few small things for the rooms that tell floor 5's story with no text (the queue's item
// "Draw the floor 5 story pieces", from the main chat's board post of 7 Nov 2026, 14:57; drawn 11 Nov 2026 by a chat of his
// working from the queue). A MOCK-UP: behind LAIR_STORY, off; nothing of the game imports this file. The main chat lays the
// rooms (game/first5.ts SCENES, floor 5 not yet laid so).
//
// HIS WORDS, 7 Nov 2026, 12:00, of what floor 5 should tell: “showing the boring into the ossuary, the take over of the mines,
// and the creation of the cultist temple under the prison and the dark power the fleshmancer has gained from the sunken eye to
// raise all the dead in the prison”; asked how, his pick: “Rooms only, no text (Recommended)”. Asked of the art: two or three
// small pieces tying it to the Sunken Eye (an eye carved in a wall, black swamp water seeping in) and to the prison's dead
// (empty shackles, drag marks).
//
// WHAT IS HERE, each for look A, the mine that becomes his temple (art/lair_temple.ts: his pick, 2 Nov 2026), in its own
// colours for the part it is laid in, measured and anchored as floor 5's own pieces are (art/floor5.ts, art/floorkit.ts):
//   THE EYE IN THE STONE (the temple; a wall tile's piece): a slab of the temple's black stone, framed as its carved panels
//     are, and cut in it in relief THE SUNKEN EYE as floor 10 has him (art/eye_colossus.ts): his eye lying on its side, wider
//     than tall, drawn to a point at each corner, a tall slit down it; under it his tongue rising in an S out of the water, an
//     arm curling up either side. Deep in the slit the enemy's pink, dull (the deep end only: never a glow, no light of its
//     own). As wide as a tile's face and as tall as the temple's hangings, so that it covers the hanging or the panel of the
//     tile it is laid on (not for a pilaster's tile).
//   BLACK WATER DOWN THE WALL (either part; on the wall): a crack down the face, the swamp's black water beading out of it
//     and running down to the floor in streaks. The fen's own black, a dull green sheen on it (art/eye_colossus.ts SLUDGE).
//   BLACK WATER POOLED (either part; floor tiles): where it gathers at the wall's foot, along x or along y: a lobed pool,
//     black, a sheen lying along it, a thin lit line at its near edge, the floor round it dark with the damp.
//   EMPTY SHACKLES (either part; on the wall): two ring bolts, a chain down from each of its own length, the cuffs at their
//     ends sprung open and empty; rust run down the wall under the bolts.
//   DRAG MARKS (either part; floor tiles, laid in a run as the rails are): the furrows of two heels dragged through the
//     mine's earth, its lips pushed up; on the temple's flags the earth they brought with them, smeared in two tracks. Along
//     x, along y, the four bends, and the four ends (where it begins: a scuffed place).
//
// His art rulebook kept: crisp pixels, two to a game pixel; light from the upper left; nothing cyan; the enemy's pink only,
// dull, deep in the Eye's slit (as the cult's marks over the threshold have it in their eyes); no carved words; old and grim,
// never gory (no blood: the marks are earth); a place's pieces, a step quieter than the figures; an original design, drawn
// from the game's own Eye.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { OLD_IRON } from './crypt';
import { GRAIN, hash, mix } from './kit';
import type { Ramp } from './kit';
import { PCX, PFOOT, flat, fx, fy, onFacePx } from './floorkit';
import type { Piece, Spot } from './floorkit';
import { axesOf, toneAt, wallSprite } from './floor4';
import type { V3, WallMake } from './floor4';
import { EARTH, FLAGS, ROCK, STONE, gradeSprite, mineFloorAt, noise, templeFloorAt } from './lair_temple';
import type { LairPart } from './lair_temple';

/** THE SWITCH: off until the main chat lays floor 5's rooms as scenes, on his yes. */
export const LAIR_STORY = { on: false };

// =================================================================================================
// THE COLOURS

type R5 = readonly [string, string, string, string, string];
const SEAM = '#07060a';
/**
 * THE SWAMP'S BLACK WATER: black, and in its sheen the fen's own water (art/fen.ts C_FEN, floor 10's: its darkest tones, and
 * the line of light where its water meets the mud). A dull dark green, never the friend's cyan.
 */
export const SWAMP: R5 = ['#090a0a', '#101814', '#16211b', '#2b3d32', '#506252'];
/** The enemy's pink deep in the Eye's slit: the deep end only, dull (art/floor5.ts RIFT: never brighter than FLAME[0]). */
export const EYE_FIRE = ['#360a2a', '#560e40', '#7a1058'] as const;
/** The small iron of floor 5's own pieces (art/floor5.ts SMALL_IRON), and rust, a dull grey-brown (never the red of blood). */
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
const RUST = ['#3c2e3a', '#4c3e48'] as const;
/** The stone of each part's wall: its seam to its lit edge. */
const WALL: Record<LairPart, R5> = { mine: ROCK, temple: STONE };

const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
const smooth = (a: number, b: number, t: number): number => {
  const k = clamp01((t - a) / (b - a));
  return k * k * (3 - 2 * k);
};

// =================================================================================================
// THE EYE IN THE STONE (the temple)

/** The slab: across the face and up it (a tile's face is u -16 to 15; the temple's hangings reach from 16 to 72). */
export const EYE_SLAB = { u0: -15, u1: 14, v0: 12, v1: 73, frame: 4 };
/** The carving, from the slab's middle line (x = u + 0.5): the eye's middle and half sizes, its iris's ring; where the tongue ends in the water. */
export const EYE_CARVED = { eyeV: 47, halfW: 10.5, up: 7.2, down: 6.2, iris: 4.6, water: 19 };

/** The tongue's middle line at a height, and its half width: an S from the water up to the eye, thick at its root. */
const TONGUE_TOP = EYE_CARVED.eyeV - EYE_CARVED.down;
const tongueX = (v: number): number => 2.2 * Math.sin(((TONGUE_TOP - v) / (TONGUE_TOP - EYE_CARVED.water)) * Math.PI * 2);
const tongueHalf = (v: number): number => 1.5 + (TONGUE_TOP - v) * 0.075;
/** An arm's middle line, side `s` (-1 his left on the screen, +1 his right): up out of the water, leaning out, its tip curled over. */
const ARM: ReadonlyArray<readonly [number, number, number]> = [[6.9, 16, 1.9], [7.1, 21, 1.75], [7.5, 26, 1.55], [8.2, 30, 1.35], [9.2, 32.4, 1.15], [10, 31.4, 1], [9.8, 29.6, 0.85]];

/**
 * What of the carving is at (u, v). Standing out of the field: the eye ('eye': an almond lying on its side, drawn to a point
 * at each corner), the tongue, an arm, the water's line. Cut into the eye: its iris's ring ('ring') and the slit down it
 * ('slit'). Or the field, and all outside it (null).
 */
export function eyeCarvedAt(u: number, v: number): 'eye' | 'ring' | 'slit' | 'tongue' | 'arm' | 'water' | null {
  const E = EYE_CARVED;
  // (only in the slab's field, inside its frame)
  const { u0, u1, v0, v1, frame } = EYE_SLAB;
  if (u < u0 + frame || u > u1 - frame || v < v0 + frame || v > v1 - frame) return null;
  const x = u + 0.5;
  const dv = v + 0.5 - E.eyeV;
  const k = 1 - Math.abs(x / E.halfW) ** 1.55;
  if (k > 0 && dv <= E.up * k ** 0.85 && dv >= -E.down * k ** 0.85) {
    if (Math.abs(x) < 1 && Math.abs(dv) < E.iris) return 'slit';
    return Math.abs(Math.hypot(x, dv) - E.iris) < 0.6 ? 'ring' : 'eye';
  }
  // the tongue under it, in an S down to the water
  if (v < TONGUE_TOP + 1 && v >= E.water && Math.abs(x - tongueX(v)) <= tongueHalf(v)) return 'tongue';
  // an arm either side, curled over at its tip
  for (const s of [-1, 1]) {
    for (let i = 0; i + 1 < ARM.length; i++) {
      const [x0, v0, r0] = ARM[i];
      const [x1, v1, r1] = ARM[i + 1];
      const ax = x - s * x0;
      const av = v + 0.5 - v0;
      const bx = s * (x1 - x0);
      const bv = v1 - v0;
      const t = clamp01((ax * bx + av * bv) / (bx * bx + bv * bv));
      if (Math.hypot(ax - bx * t, av - bv * t) <= r0 + (r1 - r0) * t) return 'arm';
    }
  }
  // the water he rises out of: a line of it, rippled
  if (v === 18 + Math.round(0.9 * Math.sin(x * 0.8))) return 'water';
  return null;
}

/**
 * THE EYE IN THE STONE, painted flat (to be set in a face): the slab, its frame, the field sunk, the Eye standing out of it
 * as the temple's own carved mark does (art/lair_temple.ts templeAt, a panel: what stands out lit along its edge toward the
 * light, what is cut in dark); deep in the slit the enemy's pink, dull.
 */
function eyeStone(p: Px): void {
  const S = STONE;
  const { u0, u1, v0, v1, frame } = EYE_SLAB;
  const raised = (u: number, v: number): boolean => {
    const k = eyeCarvedAt(u, v);
    return k !== null && k !== 'ring' && k !== 'slit';
  };
  for (let v = v0; v <= v1; v++) for (let u = u0; u <= u1; u++) {
    const e = Math.min(u - u0, u1 - u, v - v0, v1 - v);
    let c: string;
    if (e < 1) c = u === u0 || v === v1 ? S[4] : S[1];
    else if (e < frame - 1) c = S[3];
    else if (e < frame) c = SEAM;
    else {
      const k = eyeCarvedAt(u, v);
      if (k === 'slit') {
        const dv = Math.abs(v + 0.5 - EYE_CARVED.eyeV);
        c = dv > EYE_CARVED.iris - 1.4 ? SEAM : dv > 1.6 ? EYE_FIRE[1] : EYE_FIRE[2];
      } else if (k === 'ring') c = SEAM;
      else if (k !== null) c = !raised(u - 1, v + 1) ? S[4] : S[3];
      else c = S[1];
    }
    p.set(fx(u), fy(v), c);
  }
}

// =================================================================================================
// BLACK WATER DOWN THE WALL

/**
 * The split in the stone the water comes through (across the face, about `v`), and the runs down from it: where each is
 * across the face, how far down it reaches (0: the floor), how wide it is.
 */
const SEEP = { v: 40, half: 7, runs: [[-6, 24, 1], [-3, 0, 2], [1, 30, 1], [3, 11, 1], [5, 0, 2]] as ReadonlyArray<readonly [number, number, number]> };
/** The split's line: how high it is at `u` across. */
const splitV = (u: number): number => SEEP.v + Math.round(1.4 * Math.sin(u * 0.7 + 1) + (hash(u >> 1, 3, 871) - 0.5) * 1.6);

/**
 * BLACK WATER DOWN THE WALL of a part, painted flat: a split across the stone, the swamp's water welling black along it and
 * running straight down the face in runs of every length, the stone dark with the wet between them, two of them down to the
 * floor, a drop hanging at the end of each
 * of the others; the light lying on the long runs in a short length here and there, a glint in it. (Straight down, each run
 * on its own: wavering and joined they read as a creeper.)
 */
function seep(part: LairPart): (p: Px) => void {
  const lip = WALL[part];
  /** Where the light lies on a long run: the wall's own stone, wet and dark, a glint in it. */
  const sheen = mix(lip[4], SWAMP[2], 0.5);
  /** The stone dark with the wet, under the split and between the runs. */
  const damp = mix(lip[1], SWAMP[0], 0.45);
  return (p) => {
    // the wet stone: dark under the split and down the face about the runs, ragged at its edges, wider at the floor
    for (let v = SEEP.v - 2; v >= 0; v--) {
      const low = v < 6 ? (6 - v) * 0.5 : 0;
      const l = Math.round((v > 24 ? -7 : -4.5) - low + (hash(v >> 1, 1, 873) - 0.5) * 2.2);
      const r = Math.round((v > 28 ? 7 : 6.5) + low + (hash(v >> 1, 2, 873) - 0.5) * 2.2);
      for (let u = l; u <= r; u++) if (v < splitV(Math.max(-SEEP.half, Math.min(SEEP.half, u))) - 1) p.set(fx(u), fy(v), damp);
    }
    // the runs: black, straight down
    for (const [u, foot, wide] of SEEP.runs) {
      const v0 = splitV(u) - 1;
      for (let v = v0; v >= foot; v--) {
        p.set(fx(u), fy(v), wide === 2 && v > 4 && (v + u * 5) % 19 < 3 ? ((v + u * 5) % 19 === 1 ? SWAMP[4] : sheen) : SWAMP[0]);
        if (wide === 2) p.set(fx(u + 1), fy(v), SWAMP[0]);
      }
      if (foot > 0) {
        // the drop hanging at its end: round, a glint on it
        p.set(fx(u), fy(foot - 1), SWAMP[4]).set(fx(u + 1), fy(foot - 1), SWAMP[0]).set(fx(u), fy(foot - 2), SWAMP[0]).set(fx(u + 1), fy(foot - 2), SWAMP[0]);
      } else {
        // where it reaches the floor: spread at the wall's foot
        for (let v = 0; v <= 2; v++) for (let k = -3 + v; k <= 4 - v; k++) p.set(fx(u + k), fy(v), SWAMP[0]);
      }
    }
    // the split: cut dark, the water welling black along it; its lip catching the light at its ends
    for (let u = -SEEP.half; u <= SEEP.half; u++) {
      const v = splitV(u);
      p.set(fx(u), fy(v), SEAM);
      // (under it: the water welling out, black, a glint in it; where none comes, the stone's lip lit)
      const wet = SEEP.runs.some(([ru, , w]) => u >= ru - 1 && u <= ru + w);
      p.set(fx(u), fy(v - 1), wet ? (hash(u, 5, 875) < 0.25 ? SWAMP[4] : SWAMP[0]) : lip[4]);
      if (Math.abs(u) < 4 && hash(u, 1, 875) < 0.5) p.set(fx(u), fy(v + 1), SEAM);
    }
  };
}

// =================================================================================================
// EMPTY SHACKLES

/**
 * The two chains: where each bolt is across the face (in the mine ten apart; in the temple six and a half, its cuffs a
 * little smaller, to hang on the bare stone beside a pilaster, sixteen wide), how many links hang from it, which way its
 * cuff lies open (radians round, the gap's middle). (What hangs out from the wall is seen a little to the side of its bolt.)
 */
const CHAINS: Record<LairPart, ReadonlyArray<{ u: number; links: number; gap: number }>> = {
  mine: [{ u: -5, links: 9, gap: -0.5 }, { u: 5, links: 5, gap: Math.PI + 0.75 }],
  temple: [{ u: -3.25, links: 9, gap: -0.5 }, { u: 3.25, links: 5, gap: Math.PI + 0.75 }],
};
/** A cuff's ring, from its middle to the middle of its iron. */
const CUFF_R: Record<LairPart, number> = { mine: 3.2, temple: 2.9 };
const BOLT_V = 42;
const LINK = 2.5;
/** The cuffs' iron: floor 5's small iron without its brightest tone (as bright as the brightest of floor 5's own on its walls, no brighter). */
const CUFF: Ramp = [SMALL_IRON[0], SMALL_IRON[0], SMALL_IRON[2], SMALL_IRON[3], SMALL_IRON[3]];

/** EMPTY SHACKLES of a part: the ring bolts and their rust painted in the face; the chains and the open cuffs hanging before it. */
function shackles(part: LairPart): WallMake {
  const chains = CHAINS[part];
  return {
    flat: (p) => {
      for (const ch of chains) {
        const u0 = Math.round(ch.u);
        // the bolt's plate, let into the wall, and the eye of the bolt
        for (let dv = -1; dv <= 2; dv++) for (let du = -2; du <= 1; du++) p.set(fx(u0 + du), fy(BOLT_V + dv), du === -2 || dv === 2 ? SMALL_IRON[3] : du === 1 || dv === -1 ? SMALL_IRON[0] : SMALL_IRON[2]);
        p.set(fx(u0 - 1), fy(BOLT_V), SEAM).set(fx(u0), fy(BOLT_V), SEAM);
        // rust run down the wall under it
        for (let k = 0; k < 7 + (u0 < 0 ? 3 : 0); k++) if (hash(k, u0, 881) > 0.2) p.set(fx(u0 - 1 + (k > 4 ? 1 : 0)), fy(BOLT_V - 2 - k), k < 3 ? RUST[1] : RUST[0]);
      }
    },
    solid: (S, W) => {
      const [A, B, U] = axesOf(W);
      const out = 2.4;
      chains.forEach((ch, i) => {
        const a = ch.u / 0.8;
        // the chain: links, every other one on its edge
        for (let k = 0; k < ch.links; k++) {
          const z = BOLT_V - 1.6 - k * LINK;
          S.egg(W(a, out, z), k % 2 ? [B, A, U] : [A, B, U], [0.55, 1.15, 1.6], (n) => toneAt(n, k % 2 ? OLD_IRON : CUFF, 0.1), 300 + i * 20 + (k % 2));
        }
        // the cuff: a broad ring of iron hanging by its hasp, sprung open, nothing in it
        const zc = BOLT_V - 1.6 - ch.links * LINK - 2.6;
        const R = CUFF_R[part];
        let prev: V3 | null = null;
        const open = 0.68;
        for (let t = ch.gap + open; t <= ch.gap + Math.PI * 2 - open + 0.01; t += 0.22) {
          const q = W(a + (Math.cos(t) * R) / 0.8, out + 0.4, zc + Math.sin(t) * R);
          if (prev) S.rod(prev, q, part === 'temple' ? 0.8 : 0.9, part === 'temple' ? 0.8 : 0.9, CUFF, 310 + i * 20);
          prev = q;
        }
        // its hasp, hanging loose from the cuff's open end
        const te = ch.gap - open;
        const he = W(a + (Math.cos(te) * R) / 0.8, out + 0.6, zc + Math.sin(te) * R);
        S.rod(he, [he[0], he[1], he[2] - 2.6], 0.55, 0.5, OLD_IRON, 311 + i * 20);
      });
    },
  };
}

// =================================================================================================
// FLOOR TILES: a tile's picture (64 x 32, anchored at its top corner, as the floor's own), painted over its part's floor

const TW = 64;
const TH = 32;
const HALF = TW / 2;
const halfWidth = (y: number): number => (y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1);
/** A floor tile's picture from a painter of the world (x, y in tiles; the tile is the one at (tx, ty), u and v across it from its top corner). */
function tileOf(paint: (u: number, v: number, x: number, y: number) => string, tx: number, ty: number): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const px = x + 0.5 - HALF;
      const py = y + 0.5;
      const u = (px / HALF + py / (TH / 2)) / 2;
      const v = (py / (TH / 2) - px / HALF) / 2;
      p.set(x, y, paint(u, v, tx + u, ty + v));
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}
const floorAt = (part: LairPart) => (x: number, y: number): string => (part === 'mine' ? mineFloorAt(x, y) : templeFloorAt(x, y));

// ---- BLACK WATER POOLED at a wall's foot

/** How far the pool reaches out from the wall, `s` along it (0 to 1): half a round pool lying against the wall under where the water comes down, its edge wavering. */
export const POOL = { r: 0.44 };
const poolReach = (s: number, seed: number): number => Math.sqrt(Math.max(0, POOL.r ** 2 - (s - 0.5) ** 2)) * (0.92 + 0.13 * Math.sin(s * 9 + seed) + 0.07 * Math.sin(s * 19 + seed * 2.3));

/** BLACK WATER POOLED at the foot of a wall along x (the tile's far edge, v = 0) or along y (u = 0), over a part's floor. */
function pooled(part: LairPart, at: 'x' | 'y'): Sprite {
  const floor = floorAt(part);
  const seed = at === 'x' ? 0.7 : 2.9;
  return tileOf((u, v, x, y) => {
    const s = at === 'x' ? u : v;
    const out = at === 'x' ? v : u;
    const reach = poolReach(s, seed);
    const d = reach - out;
    const f = floor(x, y);
    if (reach <= 0 || d < -0.06) return f;
    // the floor round it, dark with the damp
    if (d < 0) return mix(f === SEAM ? FLAGS[1] : f, SWAMP[0], d > -0.028 ? 0.6 : 0.32);
    // its near edge: the line of light where the water meets the floor, in a few short lengths (never a ring round it)
    if (d < 0.03 && s > 0.24 && s < 0.76 && noise(s * 11, seed, 883) > 0.42) return noise(s * 23, seed, 884) > 0.45 ? SWAMP[4] : SWAMP[3];
    // black and still; the sheen lying along its middle in a streak or two
    const rel = out / reach;
    if (rel > 0.3 && rel < 0.64) {
      const n = noise(s * 3 + seed, rel * 5, 885);
      if (n > 0.66) return SWAMP[3];
      if (n > 0.5) return SWAMP[2];
      return SWAMP[1];
    }
    return rel > 0.22 && rel < 0.72 ? SWAMP[1] : SWAMP[0];
  }, at === 'x' ? 1 : 2, at === 'x' ? 2 : 1);
}

// ---- DRAG MARKS, laid in a run as the rails are (art/lair_temple.ts RAIL_TILES)

export type Edge = '-x' | '+x' | '-y' | '+y';
/** The marks' tiles: their names and their edges (an end: to the tile's middle, where it began). */
export const DRAG_TILES: readonly (readonly [string, Edge, Edge | null])[] = [
  ['drag marks along x', '-x', '+x'], ['drag marks along y', '-y', '+y'],
  ['drag marks bending, low x to low y', '-x', '-y'], ['drag marks bending, low x to high y', '-x', '+y'],
  ['drag marks bending, high x to low y', '+x', '-y'], ['drag marks bending, high x to high y', '+x', '+y'],
  ["drag marks' end, from low x", '-x', null], ["drag marks' end, from high x", '+x', null], ["drag marks' end, from low y", '-y', null], ["drag marks' end, from high y", '+y', null],
];
/** The swath of what was dragged: its half width; the two heels' furrows in it (how far each is from its middle, a furrow's half width); the earth pushed up along its sides; an end's scuffed place. */
export const DRAG = { half: 0.15, heel: 0.07, bed: 0.021, lip: 0.04, patch: 0.21 };

/**
 * Where a point of the tile (u, v) is by a run from edge `a` to edge `b` (or to the middle): `off` across it (tiles; more
 * than 0 toward the side its lips are lit on, the one away from the light), `s` along it (0 to 1), and, for an end, `past`:
 * how far short of the middle (tiles along the run; less than 0 past it). The run wanders a little, and not at all at the
 * tile's edges, so that a run's tiles meet.
 */
function runAt(u: number, v: number, a: Edge, b: Edge | null): { off: number; s: number; past: number } {
  const along = (e: Edge): 'x' | 'y' => (e[1] === 'x' ? 'x' : 'y');
  if (b === null || along(a) === along(b)) {
    const ax = along(a) === 'x';
    const s0 = ax ? u : v;
    const s = b === null && a[0] === '+' ? 1 - s0 : s0;
    const wander = Math.sin(Math.PI * s0) * (0.035 * Math.sin(s0 * 7.1 + (ax ? 0.6 : 2.2)) + 0.02 * Math.sin(s0 * 17 + 1));
    return { off: (ax ? v : u) - 0.5 - wander, s, past: b === null ? 0.5 - s : 1 };
  }
  // a quarter turn about the corner the two edges meet at, radius a half
  const cx = a[0] === '-' ? 0 : 1;
  const cy = b[0] === '-' ? 0 : 1;
  const r = Math.hypot(u - cx, v - cy);
  const s = Math.atan2(Math.abs(v - cy), Math.abs(u - cx)) / (Math.PI / 2);
  const wander = Math.sin(Math.PI * s) * 0.03 * Math.sin(s * 6.3 + cx + cy * 2);
  // (its lit side: the one toward the eye and a little to the right, as the light falls from the upper left)
  const lit = ((u - cx) * 1.3 + (v - cy) * 0.7) / (r || 1) >= 0 ? 1 : -1;
  return { off: (r - 0.5 - wander) * lit, s, past: 1 };
}

/** A tile of DRAG MARKS from edge `a` to edge `b` (or to the middle), over a part's floor. */
function dragTile(part: LairPart, a: Edge, b: Edge | null, seed: number): Sprite {
  const floor = floorAt(part);
  const D = DRAG;
  return tileOf((u, v, x, y) => {
    const f = floor(x, y);
    const k = runAt(u, v, a, b);
    const base = f === SEAM ? FLAGS[1] : f;
    // where it began (an end): a scuffed place round the tile's middle, the swath running out of it
    const scuff = b === null ? Math.hypot((u - 0.5) / 1.2, (v - 0.5) / 1.05) / D.patch + (noise(u * 9, v * 9, 887 + seed) - 0.5) * 0.36 : 9;
    if (k.past < 0 && scuff > 1.22) return f;
    const ao = Math.abs(k.off);
    // (the swath's edge, ragged; the scratches along it, long and thin)
    const half = D.half + (noise(k.s * 7 + seed, k.off > 0 ? 1.5 : 6.5, 889) - 0.5) * 0.05;
    const scratch = noise(k.s * 2.6 + seed, k.off * 34, 891);
    const inRun = k.past >= 0;
    const heel = inRun && Math.abs(ao - D.heel) < D.bed;
    const lower = (u - 0.5) * 1.3 + (v - 0.5) * 0.7 > 0;
    if (part === 'mine') {
      // THE MINE'S EARTH: scraped smooth and dark by what was dragged, the two heels' furrows cut in it, the earth pushed up
      // along its sides and lit on the side away from the light
      if (scuff < 1) return heel ? SEAM : scratch > 0.66 ? EARTH[2] : scratch < 0.3 ? EARTH[0] : EARTH[1];
      if (scuff < 1.22) return lower ? (noise(u * 20, v * 20, 893) > 0.3 ? ROCK[4] : EARTH[4]) : EARTH[0];
      if (heel) return SEAM;
      if (ao < half) return scratch > 0.68 ? EARTH[2] : scratch < 0.28 ? EARTH[0] : EARTH[1];
      if (ao < half + D.lip) return k.off > 0 ? (noise(k.s * 16 + seed, 3, 895) > 0.28 ? ROCK[4] : EARTH[4]) : EARTH[0];
      return f;
    }
    // THE TEMPLE'S FLAGS: the earth they brought with them: a swath of its dust over the black stone, the two heels' tracks
    // thick with it, clods of it broken off along the way
    const clod = hash(Math.floor(x * 26), Math.floor(y * 26), 897);
    if (scuff < 1) return scratch > 0.6 ? mix(EARTH[4], base, 0.25) : scratch < 0.3 ? mix(EARTH[2], base, 0.35) : mix(EARTH[3], base, 0.3);
    if (!inRun) return f;
    if (heel) return clod < 0.3 ? ROCK[4] : scratch > 0.3 ? EARTH[4] : EARTH[3];
    if (ao < half) return scratch > 0.6 ? mix(base, EARTH[4], 0.62) : scratch < 0.3 ? mix(base, EARTH[2], 0.45) : mix(base, EARTH[3], 0.55);
    if (ao < half + D.lip && clod < 0.09) return clod < 0.03 ? EARTH[4] : mix(EARTH[3], base, 0.2);
    return f;
  }, seed % 4, (seed * 3 + 1) % 4);
}

// =================================================================================================
// ALL OF IT

/**
 * WHERE EACH WALL PIECE MAY BE SET (across, up), its first its own (art/floor5.ts SPOTS). IN THE MINE anywhere on the rock
 * (best on a bay's second tile, clear of the post). IN THE TEMPLE the shackles and the water are set over to the bare stone
 * beside a pilaster (a bay's first tile: its stone is clear from u -1 to 15 on a face along x; on one along y the pilaster is
 * at the tile's other end, so there the piece is set as far the other way: `du` is the lit face's), and the Eye covers the
 * hanging or the panel of a bay's second tile. The water always runs down to the floor.
 */
const SPOTS: Record<LairPart, Record<string, ReadonlyArray<readonly [number, number]>>> = {
  mine: { 'empty shackles': [[0, 0], [-3, 4], [4, -3]], 'black water down the wall': [[0, 0], [-7, 0], [6, 0]] },
  temple: { 'empty shackles': [[8, 0], [8, 4]], 'black water down the wall': [[7, 0], [6, 0]], 'the Eye in the stone': [[0, 0]] },
};

/** The names of the story's pieces in each part (the Eye is the temple's alone). */
export const LAIR_STORY_PIECES = ['empty shackles', 'black water down the wall', 'black water pooled, at a wall along x', 'black water pooled, at a wall along y', ...DRAG_TILES.map((t) => t[0])] as const;
export const LAIR_STORY_TEMPLE_ONLY = ['the Eye in the stone'] as const;

export interface LairStoryArt {
  /** The pieces for the mine's rooms, and for the temple's: the same names in both, each in its part's colours and over its part's floor; the Eye in the temple's only. */
  mine: Piece[];
  temple: Piece[];
}

/** A wall piece painted flat, at each of its spots, on both faces. */
function flatWall(name: string, kind: Piece['kind'], paint: (p: Px) => void, part: LairPart): Piece {
  const spots: Spot[] = (SPOTS[part][name] ?? [[0, 0]]).map(([du, dv]) => {
    const f = flat();
    paint(f);
    const set = (d: number): Px => {
      const g = flat();
      g.blit(f, d, -dv);
      return g;
    };
    return { du, dv, left: [onFacePx(set(du), true).sprite(PCX, PFOOT, GRAIN)], right: [onFacePx(set(part === 'temple' ? -du - 1 : du), false).sprite(PCX, PFOOT, GRAIN)] };
  });
  return { name, kind, left: spots[0].left, right: spots[0].right, spots };
}
/** A wall piece with what stands out of the wall (art/floor4.ts wallSprite), at each of its spots, on both faces, in a part's colours. */
function solidWall(name: string, make: WallMake, part: LairPart): Piece {
  const spots: Spot[] = (SPOTS[part][name] ?? [[0, 0]]).map(([du, dv]) => ({
    du, dv, left: [gradeSprite(wallSprite(make, true, du, dv), part)], right: [gradeSprite(wallSprite(make, false, part === 'temple' ? -du - 1 : du, dv), part)],
  }));
  return { name, kind: 'on the wall', left: spots[0].left, right: spots[0].right, spots };
}

let made: LairStoryArt | null = null;
/** Its pictures let go, made again if wanted (as the floor's own are let go with its look). */
export function forgetLairStory(): void {
  made = null;
}
/** THE STORY'S PIECES, painted the first time they are asked for and kept. */
export function makeLairStoryArt(): LairStoryArt {
  if (made) return made;
  const of = (part: LairPart): Piece[] => [
    solidWall('empty shackles', shackles(part), part),
    flatWall('black water down the wall', 'on the wall', seep(part), part),
    { name: 'black water pooled, at a wall along x', kind: 'floor tile', frames: [pooled(part, 'x')] },
    { name: 'black water pooled, at a wall along y', kind: 'floor tile', frames: [pooled(part, 'y')] },
    ...DRAG_TILES.map(([name, a, b], i): Piece => ({ name, kind: 'floor tile', frames: [dragTile(part, a, b, i + 1)] })),
  ];
  made = { mine: of('mine'), temple: [flatWall('the Eye in the stone', 'wall tile', eyeStone, 'temple'), ...of('temple')] };
  return made;
}
