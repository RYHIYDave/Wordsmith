// THE STAIRWELL OPENS: the one moment that plays on every floor of the Crypt as the floor's boss dies
// and the way down opens (a mock-up for his yes; nothing of the game imports it).
//
// The owner's outline, 9 Oct 2026, 22:47 (in the main chat): "kill the warden and find a stairwell
// leading down.  At the bottom of the stairs is Crypt floor 2." The main chat built the stairwell in
// (art/crypt_ways.ts, makeStairwell) with a placeholder for its opening, the game's slam burst and a
// shake, and told him its real moment would be the art chat's, big and wild by his rule. His rule, his
// art rulebook's Animations 1 (10 Oct, 07:47): “Put in the ruleset that I want animations as big and
// wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”
// And (07:53): “And I want all animations checked against this statement before I see them.”
//
// WHAT HAPPENS (the frames are the constants and the notes below; at 30 a second):
//   THE SHOCK (a jolt): a fissure bursts open in the floor at the middle of the opening's near side
//     and races round its outline both ways, its broken edges catching the light, a few forks shooting
//     off it out into the floor; where the floor is earth it crumbles, dirt spilling into it. Dust
//     spurts where it runs. The floor inside it shudders on its own joints.
//   THE HEAVE (a jolt): the floor inside the fissure jumps and drops back loose, its flagstones apart
//     on their joints, the dark of a pit showing between them; jets of dust burst up through them.
//   THE FLOOR GOES, flagstone by flagstone down the line of the steps, one every two or three frames:
//     each tips on its uphill edge, its lit top swinging down toward the eye, then drops and darkens
//     into the pit, dust welling up through the gap it leaves (the pit is never seen standing open);
//     each strikes the bottom as it goes from sight, with a jolt and a spurt of dust up out of the pit.
//     Where the floor is earth it crumbles as it goes, in four clods.
//   THE GREAT BURST (the last one striking the bottom, the biggest jolt): dust bursts out of the whole
//     hole, a heap of it over the opening and a skirt of it rushing out over the floor two or three
//     tiles, past the hero's feet, and a plume of it up high, with streamers; stones are thrown out in
//     arcs, land, bounce and drop back into the hole. Under the skirt the fissure goes; under the heap
//     the pit becomes the stairwell: its steps and its kerb are there when the dust thins. The dust
//     hangs, spreads and drifts; the plume slumps, and everything low spreads into broad sheets on the
//     floor and thins, the stairwell coming out of the haze; its last frame is makeStairwell's
//     picture, to the pixel.
//
// HOW IT IS PAINTED. Everything is in the world and painted as the eye sees it: the floor over the
// opening is the game's own floor (the theme's ground, makeGroundArt: the moment is told which tile its
// anchor is on, and its flagstones are the floor's, its earth the floor's earth), so that before it moves
// it is the floor to the pixel and nothing changes under the eye; it breaks loose on the floor's own
// joints. The pit under it and the stairwell after are a copy of makeStairwell's painter that takes the
// kerb's height and whether the steps are there, and keeps how high in the world what each pixel shows
// is, so that what falls into the hole is hidden by what is nearer the eye. The flagstones are solid
// stones, lit as each face turns to the light (from the upper left); below the floor everything goes
// darker with depth in the stairwell's own five steps. The dust is painted as one mass, billows joined
// where they meet, lit along its tops and dark along its bellies, behind whatever is nearer the eye.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { STAIR_KERB, STAIR_LONG, STAIR_WIDE, makeStairwell } from './crypt_ways';
import { CRYPT_FLOORS, DIRT, ROCK, cryptGround } from './crypt';
import { LIGHT_W } from './floor2';
import { DEEP, fastBlit } from './floorkit';
import type { Moment, Track } from './floorkit';
import { makeGroundArt } from './ground';
import type { GroundArt, Theme } from './ground';
import { GRAIN, hash, mix } from './kit';

type Way = 'x' | 'y';
type V3 = [number, number, number];

// =================================================================================================
// THE STAIRWELL AT ANY HEIGHT OF ITS KERB: makeStairwell's painter (art/crypt_ways.ts), the same pixel
// for pixel at the kerb's own height (tests/stairwell_open.test.ts holds it to it), with the kerb's
// height a number, and, for every pixel, the height in the world of what it shows.

/** The dark at the bottom of a pit, and the stairwell's measures (art/crypt_ways.ts, where they are its own). */
const PIT_DARK = '#04030a';
const KERB_H = 6;
const STEP = 0.25;
const DROP = 6;

/** How dark a thing is at a depth below the floor (picture pixels), in the stairwell's five flat steps toward the dark at the bottom; and how much of it shows. */
const DEPTHS: ReadonlyArray<readonly [number, number]> = [[7, 0.12], [15, 0.34], [24, 0.58], [34, 0.78], [Infinity, 0.93]];
function darkAt(depth: number): number {
  if (depth <= 0) return 0;
  for (const [d, k] of DEPTHS) if (depth < d) return k;
  return 0.93;
}
const DEEPENED = new Map<string, string>();
function deepen(c: string, depth: number): string {
  const k = darkAt(depth);
  if (!k) return c;
  const key = c + k;
  let out = DEEPENED.get(key);
  if (!out) DEEPENED.set(key, (out = mix(c, PIT_DARK, k)));
  return out;
}

/** Rough rock where a stone of the shaft's side has fallen out (art/crypt_ways.ts, roughAt). */
function roughAt(run: number, depth: number, face: readonly string[], rock: readonly string[], dirt: readonly string[]): string {
  const CELL = 6;
  const gx = run / CELL;
  const gy = depth / (CELL * 0.8);
  const cx = Math.floor(gx);
  const cy = Math.floor(gy);
  let best = 9;
  let second = 9;
  let ox = 0;
  let oy = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const px = cx + dx + 0.15 + 0.7 * hash(cx + dx, cy + dy, 321);
      const py = cy + dy + 0.15 + 0.7 * hash(cx + dx, cy + dy, 322);
      const d = Math.hypot(gx - px, gy - py);
      if (d < best) {
        second = best;
        best = d;
        ox = gx - px;
        oy = gy - py;
      } else if (d < second) second = d;
    }
  }
  if (second - best < 0.13) return dirt[0];
  const k = -ox * 0.8 - oy * 0.9;
  if (k > 0.3) return mix(face[3], rock[3], 0.5);
  if (k < -0.3) return mix(face[0], rock[0], 0.5);
  return mix(face[2], rock[1], 0.55);
}

/**
 * The stairwell's picture with its kerb `h` picture pixels high, laid out as makeStairwell's (its
 * anchor at (ox, oy)), and the height in the world of what each pixel shows (-Infinity: the dark).
 * `steps` false: the shaft without its steps (the pit the lid falls into, before the dust clears);
 * `h` 0: no kerb, the floor round the opening is the game's own (not painted).
 */
interface Well {
  p: Px;
  z: Float32Array;
  ox: number;
  oy: number;
}
function paintWell(theme: Theme, way: Way, h: number, steps = true): Well {
  const LONG = STAIR_LONG;
  const WIDE = STAIR_WIDE;
  const K = STAIR_KERB;
  const x0 = way === 'x' ? 0 : -K;
  const y0 = way === 'x' ? -K : 0;
  const x1 = way === 'x' ? LONG + K : WIDE + K;
  const y1 = way === 'x' ? WIDE + K : LONG + K;
  const PAD = 4;
  const ox = Math.ceil(-(x0 - y1) * 32) + PAD;
  const oy = Math.ceil(-(x0 + y0) * 16 + KERB_H) + PAD;
  const W = Math.ceil((x1 - y0) * 32) + ox + PAD;
  const H = Math.ceil((x1 + y1) * 16) + oy + PAD;
  const p = new Px(W, H);
  const zs = new Float32Array(W * H).fill(-Infinity);
  const e = theme.earth;
  const broken = e?.broken ?? 0.07;
  const raw = e?.raw ?? 0;
  const rock = e?.rock;
  const dirt = e?.dirt;
  const tread = theme.slab;
  const faceOf = (axis: 'al' | 'ac') => ((axis === 'ac') === (way === 'x') ? theme.lit : theme.shade);
  const where = (al: number, ac: number): 0 | 1 | 2 => {
    if (al >= 0 && al < LONG && ac >= 0 && ac < WIDE) return 0;
    if (al >= 0 && al < LONG + K && ac >= -K && ac < WIDE + K) return 1;
    return 2;
  };
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const sx = (px + 0.5 - ox) / 32;
      const sk = (py + 0.5 - oy + h) / 16;
      const fx = (sk + sx) / 2;
      const fy = (sk - sx) / 2;
      let c: string | null = null;
      let hit = -Infinity;
      let met = false;
      let prev: 0 | 1 | 2 = 2;
      let prevAc = 0;
      let before = 0;
      for (let d = 0; d < 2.6; d += 1 / 128) {
        const x = fx - d;
        const y = fy - d;
        const z = h - 32 * d;
        const al = way === 'x' ? x : y;
        const ac = way === 'x' ? y : x;
        const here = where(al, ac);
        if (al < 0 && z < 0) {
          if (prev === 0 && ac >= 0 && ac < WIDE) {
            const f = faceOf('al');
            const depth = -z;
            const course = Math.floor(depth / 12);
            const run = ac * 32 + (course % 2) * 11;
            c = deepen(depth % 12 < 1 || run % 22 < 1 ? f[0] : f[2], depth);
          }
          hit = z;
          met = true;
          break;
        }
        if (h === 0 && d === 0 && here !== 0) {
          // (no kerb: the floor round the opening is the game's own)
          hit = 0;
          met = true;
          break;
        }
        if (here === 2) {
          if (z <= 0) {
            hit = 0;
            met = true;
            break;
          }
        } else if (here === 1) {
          if (z <= h && z > 0) {
            if (d === 0) {
              const run = al < 0 || al >= LONG ? ac : al;
              const slab = Math.floor((run + K) / 0.4);
              const joint = Math.abs((run + K) / 0.4 - Math.round((run + K) / 0.4)) < 0.035;
              const lip = (ac >= -0.03 && ac < 0) || (ac >= WIDE && ac < WIDE + 0.03 && al < LONG) || (al >= LONG && al < LONG + 0.03 && ac >= 0 && ac < WIDE);
              c = joint ? theme.mortar : lip ? mix(tread[3], '#ffffff', 0.15) : al < 0.03 || ac < -K + 0.03 ? mix(tread[3], '#ffffff', 0.08) : hash(slab, Math.floor(ac + 9), 301) < 0.3 ? tread[3] : tread[2];
              if (hash(slab, 3, 302) < broken * 1.5 && lip) c = theme.mortar;
            } else {
              const axis: 'al' | 'ac' = prev === 2 ? (prevAc >= WIDE + K ? 'ac' : 'al') : 'ac';
              const f = faceOf(axis);
              const v = h - z;
              c = v < 1 ? f[4] : v > h - 1.2 ? f[0] : f[2];
            }
            hit = z;
            met = true;
            break;
          }
          if (z <= 0) {
            const axis: 'al' | 'ac' = ac < 0 || ac >= WIDE ? 'ac' : 'al';
            const f = faceOf(axis);
            const depth = -z;
            const course = Math.floor(depth / 12);
            const run = (axis === 'ac' ? al : ac) * 32 + (course % 2) * 11;
            const stone = Math.floor(run / 22);
            let col = depth % 12 < 1 || run % 22 < 1 ? f[0] : hash(stone, course, 303) < 0.3 ? f[3] : f[2];
            if (rock && dirt && hash(stone, course, 305) < raw) col = roughAt(run, depth, f, rock, dirt);
            c = deepen(col, depth);
            hit = z;
            met = true;
            break;
          }
        } else if (z < 0 && steps) {
          const k = Math.floor(al / STEP) + 1;
          const top = -DROP * k;
          if (z <= top) {
            let col: string;
            if (before > k) {
              const f = faceOf('al');
              col = top - z > DROP - 1.2 ? f[0] : f[1];
            } else {
              const into = al - (k - 1) * STEP;
              const across = Math.floor(ac * 6);
              const chip = hash(k, across, 307) < broken * 1.5 && into > STEP * 0.7 && ac * 6 - across < 0.55;
              if (into > STEP - 0.035) col = chip ? theme.mortar : mix(tread[3], '#ffffff', 0.12);
              else if (chip && into > STEP * 0.8) col = theme.mortar;
              else if (into < 0.025) col = tread[0];
              else col = hash(k, Math.floor(ac * 3), 309) < 0.35 ? tread[3] : tread[2];
              if (hash(k, 7, 311) < broken * 2 && Math.abs(ac - 0.3 - 0.4 * hash(k, 8, 312) - (into / STEP - 0.5) * 0.25) < 0.02) col = theme.mortar;
            }
            c = deepen(col, -z);
            hit = z;
            met = true;
            break;
          }
          before = k;
        }
        prev = here;
        prevAc = ac;
      }
      if (c === null && !met) {
        const at = (py + 0.5 - oy) / 16;
        const ax = (at + sx) / 2;
        const ay = (at - sx) / 2;
        if (where(way === 'x' ? ax : ay, way === 'x' ? ay : ax) === 0) c = PIT_DARK;
      }
      if (c) p.set(px, py, c);
      zs[py * W + px] = met ? hit : -Infinity;
    }
  }
  return { p, z: zs, ox, oy };
}


// =================================================================================================
// THE FLOOR AS THE GAME LAYS IT (art/ground.ts, makeGroundArt: GroundArt.floor(tx, ty), by where the
// tile is), round the stairwell's anchor on tile `at`; and the pixels of a sprite, in the browser or not.

const GROUNDS = new Map<string, GroundArt>();
function groundOf(theme: Theme): GroundArt {
  const k = CRYPT_FLOORS.indexOf(theme);
  if (k >= 0) return cryptGround(k + 1);
  let g = GROUNDS.get(theme.id);
  if (!g) GROUNDS.set(theme.id, (g = makeGroundArt(theme)));
  return g;
}
function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const cv = s.img;
  const d = (cv.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, cv.width, cv.height);
  const p = new Px(cv.width, cv.height);
  p.d.set(d.data);
  return p;
}

// =================================================================================================
// THE TIMES (frames, at 30 a second) AND MEASURES

/** The shock: the fissure bursts open. */
const SHOCK = 1;
/** The floor inside the fissure starts to shudder on its joints; the heave throws it up loose. */
const SHUDDER = 4;
const HEAVE = 10;
/** The first flagstone tips; one more every two or three frames (GAP on the average), down the line of the steps, all of them within RIPPLE frames. */
const TIP0 = 12;
const GAP = 2.5;
const RIPPLE = 18;
/** Frames a flagstone tips on its uphill edge before it drops, and how far over (radians). */
const TIP_FOR = 5;
const TIP = 1.3;
/** Its fall (picture pixels a frame each frame), and the depth at which it strikes the bottom of the pit, out of sight. */
const G = 1.7;
const BOTTOM = 48;
/** Picture pixels across the floor to a tile (as floor 2's moments: art/floor2.ts, KT); a flagstone's thickness. */
const KT = 40;
const THICK = 7;
/** The screen's kick at each jolt, in the game's pixels (the main chat's to do: see the README). */
const KICK_SHOCK = 4;
const KICK_HEAVE = 6;
const KICK_BURST = 10;

/** Where the light comes from, and which way is toward the eye, in the world (x, y across the floor, z up). */
const LIGHT: V3 = (() => {
  const n = Math.hypot(LIGHT_W[0], LIGHT_W[1], LIGHT_W[2]);
  return [LIGHT_W[0] / n, LIGHT_W[1] / n, LIGHT_W[2] / n];
})();
const EYE: V3 = (() => {
  const n = Math.hypot(KT, KT, 32);
  return [KT / n, KT / n, 32 / n];
})();
/** The world's (x, y) from a point along the way down and across it, and back. */
const toXY = (way: Way, al: number, ac: number): [number, number] => (way === 'x' ? [al, ac] : [ac, al]);
const toAL = toXY;

/** How dark a piece of the floor is at a depth: as deep things are, but not for sagging or tipping a few pixels. */
const lidDark = (depth: number): number => darkAt(depth - 5);

/** A colour a step toward the light (`k` more than 0) or into shade (less). */
const SHIFTED = new Map<string, string>();
function shifted(c: string, k: number): string {
  if (!k) return c;
  const key = c + k;
  let out = SHIFTED.get(key);
  if (!out) SHIFTED.set(key, (out = k > 0 ? mix(c, '#b4b0e0', Math.min(0.5, 0.13 * k)) : mix(c, '#05040c', Math.min(0.7, 0.2 * -k))));
  return out;
}

// =================================================================================================
// THE FLOOR OVER THE OPENING: its flagstones, as the floor lies (they break loose on its own joints,
// `theme.slabs` to a tile), each stone or earth as the floor is there.

interface Cell {
  a0: number;
  a1: number;
  c0: number;
  c1: number;
  earth: boolean;
  /** Its place in the order they go: down the line of the steps, row by row. */
  order: number;
}
/** A piece that moves: a flagstone, or a lump of an earth one; its rest (tiles), the uphill edge it hinges on, and the points of its sides and underside. */
interface Piece {
  cell: number;
  a0: number;
  a1: number;
  c0: number;
  c1: number;
  earth: boolean;
  lump: number;
  hinge: [number, number];
  pts: Float32Array;
  nrm: Float32Array;
  tone: Uint8Array;
  /** How many pixels its top covers lying in its place. */
  lying: number;
}
interface Pose {
  al: number;
  ac: number;
  z: number;
  pitch: number;
  roll: number;
  yaw: number;
  off?: boolean;
}

/** A rotation (3 x 3, rows) from a pose's turns: yaw after pitch after roll. Pitch more than 0: its uphill end down; less: its downhill end down. */
function turnOf(P: Pose): number[] {
  const [cr, sr] = [Math.cos(P.roll), Math.sin(P.roll)];
  const [cp, sp] = [Math.cos(P.pitch), Math.sin(P.pitch)];
  const [cy, sy] = [Math.cos(P.yaw), Math.sin(P.yaw)];
  const R1 = [1, 0, 0, 0, cr, -sr, 0, sr, cr];
  const R2 = [cp, 0, -sp, 0, 1, 0, sp, 0, cp];
  const R3 = [cy, -sy, 0, sy, cy, 0, 0, 0, 1];
  const mul = (A: number[], B: number[]): number[] => {
    const o = new Array<number>(9).fill(0);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) o[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j];
    return o;
  };
  return mul(R3, mul(R2, R1));
}

// =================================================================================================
// DUST: billows, each born, blown up and out, slowed by the air, hanging and drifting, then sinking;
// low down it spreads into a sheet on the floor and thins away, high up it thins where it hangs; all
// painted together as one mass (paintDust), round lobes heaped on lobes.

interface Billow {
  f0: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  /** How much of its speed it keeps each frame. */
  drag: number;
  r0: number;
  grow: number;
  /** Frames it hangs before it sinks; how fast it comes to sink, and its fastest sinking (picture pixels a frame). */
  rest: number;
  sink: number;
  sinkMax: number;
  life: number;
  /** Frames at the end of its life it spreads into a sheet (or thins where it hangs) and goes. */
  flat: number;
  /** How tall for its width (a streamer, more than 1; the skirt along the floor, less). */
  tall: number;
  /** The air's slow drift (tiles a frame). */
  wx: number;
  wy: number;
  seed: number;
}
interface BillowNow {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
}
const smooth = (u: number): number => {
  const v = Math.max(0, Math.min(1, u));
  return v * v * (3 - 2 * v);
};
/** A billow k frames into its life before it spreads or thins: how high it would be, and how big. */
function freeAt(b: Billow, k: number): { mv: number; zFree: number; r: number } {
  const mv = (1 - b.drag ** k) / (1 - b.drag);
  const j = k - b.rest;
  let down = 0;
  if (j > 0) {
    const t1 = b.sinkMax / b.sink;
    down = j <= t1 ? 0.5 * b.sink * j * j : 0.5 * b.sink * t1 * t1 + b.sinkMax * (j - t1);
  }
  // (thinning as it comes down)
  return { mv, zFree: b.z + b.vz * mv - down, r: (b.r0 + b.grow * (1 - Math.exp(-k / 5))) * (1 - 0.3 * Math.min(1, down / 120)) };
}
/** The frame of its life a billow has come down to lie on the floor. */
function landOf(b: Billow): number {
  for (let k = b.rest + 1; k < 300; k++) {
    const { zFree, r } = freeAt(b, k);
    if (zFree <= r * b.tall * 1.1) return k;
  }
  return 300;
}
function billowAt(b: Billow, f: number): BillowNow | null {
  const k = f - b.f0;
  if (k < 0 || k >= b.life) return null;
  const { mv, zFree, r } = freeAt(b, k);
  const rx0 = r * 1.12;
  const ry0 = r * b.tall;
  // (at the end: on the floor it spreads into a sheet and thins; up in the air it thins where it hangs; last, it draws in to nothing)
  const u = smooth((k - (b.life - b.flat)) / b.flat);
  const low = smooth(1 - (zFree - ry0) / (2.5 * ry0 + 4));
  const go = smooth((u - 0.55) / 0.45);
  const spread = 0.5 * Math.min(1, r / 10);
  const rx = rx0 * (1 + u * (spread * low - 0.35 * (1 - low))) * (1 - go);
  const ry = ry0 * (1 - u * (0.45 * low + 0.45 * (1 - low))) * (1 - go);
  if (ry < 2 || rx < 3) return null;
  const z = Math.max(zFree, ry * 0.8);
  return { x: b.x + b.vx * mv + b.wx * k, y: b.y + b.vy * mv + b.wy * k, z, rx, ry };
}

// =================================================================================================
// THE MOMENT

export interface StairwellNotes {
  /** The frame the last flagstone strikes the bottom (the great burst); the frame the fissure goes, under the dust; the frame the pit becomes the stairwell, under the dust. */
  great: number;
  heal: number;
  swap: number;
  /** The frame each flagstone (or slab of earth) starts to tip, and the frame it strikes the bottom, in the order they go. */
  tips: number[];
  impacts: number[];
  /** The screen's kick at each of the moment's jolts, in the game's pixels (the great burst's dying away over half a second). */
  kicks: number[];
  /** The flagstones and lumps of earth that go; the stones thrown, and how many of them are earth (clods and rock). */
  pieces: number;
  earthPieces: number;
  stones: number;
  earthStones: number;
  /** Every pixel that changes when the fissure goes, and when the pit becomes the stairwell, is under the dust that frame and the next. */
  hidden: boolean;
}
const NOTES = new WeakMap<Moment, StairwellNotes>();
/** What the moment's checks and the main chat need beside the Moment: its kicks, when the pit becomes the stairwell. */
export function stairwellNotes(m: Moment): StairwellNotes {
  const n = NOTES.get(m);
  if (!n) throw new Error('not a stairwell opening');
  return n;
}
/** The screen's kick (game pixels) at each of the moment's jolts, in order. */
export function stairwellKicks(m: Moment): number[] {
  return stairwellNotes(m).kicks;
}

const cache = new Map<string, Moment>();

/**
 * THE STAIRWELL OPENS, in the stone and earth of `theme` (one of CRYPT_FLOORS), its steps going down
 * toward +x (`way` 'x') or +y ('y'), its anchor (the corner of the opening up the screen) on the corner
 * of tile `at` (whole tiles: the floor it breaks is the game's floor there, GroundArt.floor). Anchored
 * as makeStairwell's picture is; its frames are bigger than it (the dust goes up high and out wide) and
 * each is cut to what is painted in it: line them up by the anchor. `before`: none (nothing of it is
 * there before it plays: the floor is the game's own, and its first frame is empty); `after`:
 * makeStairwell's picture, its last frame to the pixel.
 */
export function stairwellOpens(theme: Theme, way: Way, at: readonly [number, number] = [0, 0]): Moment {
  const P = 10;
  const X = ((Math.round(at[0]) % P) + P) % P;
  const Y = ((Math.round(at[1]) % P) + P) % P;
  const key = `${theme.id}:${way}:${X},${Y}`;
  const made = cache.get(key);
  if (made) return made;
  const m = makeMoment(theme, way, X, Y);
  cache.set(key, m);
  return m;
}

function makeMoment(theme: Theme, way: Way, TX: number, TY: number): Moment {
  const final = makeStairwell(theme, way);
  const wells = new Map<string, Well>();
  const wellAt = (h: number, steps: boolean): Well => {
    const k = `${h}:${steps}`;
    let w = wells.get(k);
    if (!w) wells.set(k, (w = paintWell(theme, way, h, steps)));
    return w;
  };
  const W0 = wellAt(KERB_H, true);
  const BW = W0.p.w;
  const BH = W0.p.h;
  // the frame: the stairwell's picture with room round it for the dust
  const PADX = 240;
  const PADT = 300;
  const PADB = 170;
  const FW = BW + 2 * PADX;
  const FH = BH + PADT + PADB;
  const AX = W0.ox + PADX;
  const AY = W0.oy + PADT;
  /** A point of the world (x, y tiles from the anchor, z picture pixels) on the frame. */
  const scr = (x: number, y: number, z: number): [number, number] => [AX + (x - y) * 32, AY + (x + y) * 16 - z];
  const XY = (al: number, ac: number): [number, number] => toXY(way, al, ac);
  const L = STAIR_LONG;
  const Wd = STAIR_WIDE;
  const K = STAIR_KERB;
  const e = theme.earth;
  const dirt = e?.dirt ?? DIRT;
  const rock = e?.rock ?? ROCK;
  const gone = e?.gone ?? 0;
  const earthy = new Set([...(e ? [...e.dirt, ...e.rock] : [])].map((c) => c.toLowerCase()));

  // ----- THE FLOOR AS IT LIES round the anchor (the game's own tiles), on the frame
  const ground = groundOf(theme);
  const floor = new Px(FW, FH);
  for (let ty = -2; ty <= 4; ty++) {
    for (let tx = -2; tx <= 4; tx++) {
      const s = ground.floor(TX + tx, TY + ty);
      const p = pixelsOf(s);
      const [x, y] = scr(tx, ty, 0);
      fastBlit(floor, p, Math.round(x - s.ax * (s.density ?? 1)), Math.round(y - s.ay * (s.density ?? 1)));
    }
  }
  /** The floor's colour at the pixel a point of the floor (tiles along, across) lies on. */
  const floorAt = (al: number, ac: number): string | null => {
    const [x, y] = XY(al, ac);
    const [sx, sy] = scr(x, y, 0);
    return floor.get(Math.floor(sx), Math.floor(sy));
  };

  // ----- THE FLAGSTONES over the opening: on the floor's joints (`slabs` to a tile), slivers kept with their neighbours
  const S = theme.slabs;
  const joints = (start: number, len: number): number[] => {
    const out = [0];
    for (let k = Math.ceil(start * S - 1e-9); k / S - start < len; k++) {
      const j = k / S - start;
      if (j > 0.22 && j < len - 0.22) out.push(j);
    }
    out.push(len);
    return out;
  };
  const [A0, C0] = toAL(way, TX, TY);
  const rows = joints(A0, L);
  const cols = joints(C0, Wd);
  const cells: Cell[] = [];
  for (let r = 0; r + 1 < rows.length; r++) {
    for (let c = 0; c + 1 < cols.length; c++) {
      let n = 0;
      let dirtN = 0;
      for (let al = rows[r] + 0.03; al < rows[r + 1]; al += 0.06) {
        for (let ac = cols[c] + 0.03; ac < cols[c + 1]; ac += 0.06) {
          n++;
          const col = floorAt(al, ac);
          if (col && earthy.has(col)) dirtN++;
        }
      }
      cells.push({ a0: rows[r], a1: rows[r + 1], c0: cols[c], c1: cols[c + 1], earth: dirtN > 0.45 * n, order: 0 });
    }
  }
  // (their order: down the steps row by row, across each row from the far side and the near by turns)
  cells.forEach((c, i) => (c.order = i));
  {
    const nc = cols.length - 1;
    cells.forEach((c, i) => {
      const r = Math.floor(i / nc);
      const k = i % nc;
      c.order = r * nc + (r % 2 ? nc - 1 - k : k);
    });
  }

  // ----- THE PIECES: a flagstone each, or an earth one in four lumps
  const pieces: Piece[] = [];
  cells.forEach((c, ci) => {
    const parts: [number, number, number, number][] = c.earth
      ? [
          [c.a0, (c.a0 + c.a1) / 2, c.c0, (c.c0 + c.c1) / 2],
          [c.a0, (c.a0 + c.a1) / 2, (c.c0 + c.c1) / 2, c.c1],
          [(c.a0 + c.a1) / 2, c.a1, c.c0, (c.c0 + c.c1) / 2],
          [(c.a0 + c.a1) / 2, c.a1, (c.c0 + c.c1) / 2, c.c1],
        ]
      : [[c.a0, c.a1, c.c0, c.c1]];
    parts.forEach(([a0, a1, c0, c1], lump) => {
      const hinge: [number, number] = [a0, (c0 + c1) / 2];
      const pts: number[] = [];
      const nrm: number[] = [];
      const tone: number[] = [];
      const st = 0.45 / KT;
      const add = (al: number, ac: number, z: number, n: V3, t: number): void => {
        pts.push((al - hinge[0]) * KT, (ac - hinge[1]) * KT, z);
        nrm.push(n[0], n[1], n[2]);
        tone.push(t);
      };
      // its four sides, a flagstone's thickness, and its underside (its top is painted from the floor itself)
      for (let z = -0.25; z > -THICK; z -= 0.45) {
        const t = z > -1 ? 2 : z < -THICK + 1.2 ? 0 : 1;
        for (let al = a0; al < a1; al += st) {
          add(al, c0, z, [0, -1, 0], t);
          add(al, c1, z, [0, 1, 0], t);
        }
        for (let ac = c0; ac < c1; ac += st) {
          add(a0, ac, z, [-1, 0, 0], t);
          add(a1, ac, z, [1, 0, 0], t);
        }
      }
      for (let al = a0; al < a1; al += st * 1.4) for (let ac = c0; ac < c1; ac += st * 1.4) add(al, ac, -THICK, [0, 0, -1], 3 + (hash(Math.floor(al * 20), Math.floor(ac * 20), 601 + ci) < 0.4 ? 1 : 0));
      pieces.push({ cell: ci, a0, a1, c0, c1, earth: c.earth, lump, hinge, pts: Float32Array.from(pts), nrm: Float32Array.from(nrm), tone: Uint8Array.from(tone), lying: 0 });
    });
  });
  const SIDE_STONE = [theme.shade[0], theme.shade[1], mix(theme.slab[3], '#ffffff', 0.12), DIRT[0], theme.mortar];
  const SIDE_EARTH = [dirt[0], dirt[1], dirt[3], dirt[0], DIRT[0]];
  /** A broken edge of the floor where it catches the light: stone, earth. */
  const LIT_EDGE = mix(theme.slab[3], '#ffffff', 0.2);
  const EARTH_EDGE = dirt[3];

  /** When each piece tips, and the frame it strikes the bottom. */
  // (one every GAP frames; closer together where the floor's joints make more of them, so that it is never longer)
  // (an earth one crumbles as it goes: its downhill lumps a frame before the uphill ones)
  const gap = Math.min(GAP, RIPPLE / Math.max(1, cells.length - 1));
  const tipOf = (p: Piece): number => TIP0 + Math.floor(gap * cells[p.cell].order) + (p.earth && p.lump < 2 ? 1 : 0);
  /** The frame each flagstone (or slab of earth) strikes the bottom, out of sight: when it has gone from sight (found below, as it is painted). */
  const cutAt = cells.map(() => Infinity);
  // (the smaller a stone, the less it shudders and rattles: a sliver lost behind its neighbour for a pixel's sag is gone)
  const jig = cells.map((c) => Math.min(1, Math.min(c.a1 - c.a0, c.c1 - c.c0) / 0.5));
  /** How far over each tips, of TIP (less for one that would go under its downhill neighbour too fast to be seen going: found below). */
  const tipScale = cells.map(() => 1);
  const tipFor = (p: Piece): number => (p.earth ? 3 : TIP_FOR);
  const SAG = -1;
  const heaved = (p: Piece, f: number, rattle: number): number => {
    const k = f - HEAVE;
    return [3.5 + hash(p.cell, 1, 612), 2.5, 0.8, -0.6 * jig[p.cell]][k] ?? SAG * jig[p.cell] + rattle * 0.7 * Math.sin(f * 2.3 + p.cell * 1.7 + p.lump);
  };
  const poseOf = (p: Piece, f: number): Pose => {
    const [ha, hc] = p.hinge;
    const rest: Pose = { al: ha, ac: hc, z: 0, pitch: 0, roll: 0, yaw: 0 };
    if (f < SHUDDER) return rest;
    if (f < HEAVE) {
      // (the floor shudders on its joints, each stone its own way)
      const w = Math.sin(f * 2.9 + p.cell * 2.1 + p.lump) * jig[p.cell];
      return { ...rest, z: 0.9 * w, roll: 0.025 * jig[p.cell] * Math.sin(f * 3.7 + p.cell), pitch: 0.02 * w };
    }
    const T = tipOf(p);
    if (f < T) return { ...rest, z: heaved(p, f, jig[p.cell]), pitch: 0.035 * jig[p.cell] * Math.sin(f * 1.9 + p.cell), roll: 0.045 * jig[p.cell] * Math.sin(f * 2.6 + p.cell * 1.3) };
    const TF = tipFor(p);
    const turn = (p.earth ? 0.5 : TIP) * tipScale[p.cell];
    const rollTo = (p.earth ? 0.35 : 0.14) * (hash(p.cell, p.lump, 613) < 0.5 ? -1 : 1);
    if (f < T + TF) {
      // IT TIPS ON ITS UPHILL EDGE: its downhill end dropping, faster and faster
      const u = ((f - T + 1) / TF) ** 1.5;
      return { ...rest, z: heaved(p, f, 0), pitch: -turn * u, roll: rollTo * u };
    }
    // AND DROPS INTO THE PIT, turning on over, darker the deeper
    const kk = f - (T + TF - 1);
    const z0 = heaved(p, T + TF - 1, 0);
    const z = z0 - 0.5 * G * kk * kk;
    const spin = p.earth ? 0.22 : 0.1;
    // (gone when it has struck the bottom, out of sight)
    return { al: ha + 0.025 * kk, ac: hc, z, pitch: -turn - spin * kk, roll: rollTo * (1 + 0.15 * kk), yaw: 0, off: f >= cutAt[p.cell] || z < -BOTTOM - 3 };
  };

  /**
   * The floor over the opening in frame f, piece by piece, painted into `scene` over the pit (`zb` the
   * heights of what it shows, `owner` each pixel's piece); each piece's size on the screen and its middle.
   */
  const drawPieces = (f: number, scene: Px, zb: Float32Array, owner: Int16Array): { sizes: number[]; mids: ([number, number] | null)[] } => {
    /** Put a point (screen x, y; its height on the ray through the pixel's middle) if nothing nearer is there. */
    const put = (sx: number, sy: number, z: number, c: string, who: number, dark: number): void => {
      const X = Math.floor(sx);
      const Y = Math.floor(sy);
      if (X < 0 || Y < 0 || X >= FW || Y >= FH) return;
      const i = Y * FW + X;
      const zz = z + ((sy - (Y + 0.5)) * 100) / 132;
      if (zz <= zb[i]) return;
      zb[i] = zz;
      owner[i] = who;
      scene.set(X, Y, dark ? mix(c, PIT_DARK, dark) : c);
    };
    const sizes: number[] = [];
    const mids: ([number, number] | null)[] = [];
    {
      pieces.forEach((p, pi) => {
        const Pz = poseOf(p, f);
        if (Pz.off) {
          sizes.push(0);
          mids.push(null);
          return;
        }
        const R = turnOf(Pz);
        const H: V3 = [Pz.al * KT, Pz.ac * KT, Pz.z];
        const Hr: V3 = [p.hinge[0] * KT, p.hinge[1] * KT, 0];
        const world = (la: number, lc: number, lz: number): V3 => {
          const a = la - Hr[0];
          const c = lc - Hr[1];
          return [H[0] + R[0] * a + R[1] * c + R[2] * lz, H[1] + R[3] * a + R[4] * c + R[5] * lz, H[2] + R[6] * a + R[7] * c + R[8] * lz];
        };
        const onScreen = (w: V3): [number, number] => {
          const [x, y] = XY(w[0] / KT, w[1] / KT);
          return scr(x, y, w[2]);
        };
        // its top: every pixel it covers, found by where the eye's ray through it meets its face, coloured
        // as the floor is where that point of it lay
        const n: V3 = [R[2], R[5], R[8]];
        const [nx, ny] = toXY(way, n[0], n[1]);
        const lit = nx * LIGHT[0] + ny * LIGHT[1] + n[2] * LIGHT[2];
        const step = Math.max(-2, Math.min(2, Math.round(4 * (lit - LIGHT[2]))));
        const corners = [world(p.a0 * KT, p.c0 * KT, 0), world(p.a1 * KT, p.c0 * KT, 0), world(p.a1 * KT, p.c1 * KT, 0), world(p.a0 * KT, p.c1 * KT, 0)].map(onScreen);
        const x0 = Math.floor(Math.min(...corners.map((q) => q[0]))) - 1;
        const x1 = Math.ceil(Math.max(...corners.map((q) => q[0]))) + 1;
        const y0 = Math.floor(Math.min(...corners.map((q) => q[1]))) - 1;
        const y1 = Math.ceil(Math.max(...corners.map((q) => q[1]))) + 1;
        const denom = n[0] * KT + n[1] * KT + n[2] * 32;
        if (Math.abs(denom) > 1e-6 && nx * EYE[0] + ny * EYE[1] + n[2] * EYE[2] > 0.02) {
          for (let py = Math.max(0, y0); py <= Math.min(FH - 1, y1); py++) {
            for (let px = Math.max(0, x0); px <= Math.min(FW - 1, x1); px++) {
              const sx = px + 0.5 - AX;
              const sy = py + 0.5 - AY;
              const gx = (sx / 32 + sy / 16) / 2;
              const gy = (sy / 16 - sx / 32) / 2;
              const [ga, gc] = toAL(way, gx, gy);
              const G0: V3 = [ga * KT, gc * KT, 0];
              const t = (n[0] * (H[0] - G0[0]) + n[1] * (H[1] - G0[1]) + n[2] * (H[2] - G0[2])) / denom;
              const Pw: V3 = [G0[0] + t * KT, G0[1] + t * KT, t * 32];
              // (back to where it lay: the turn undone)
              const d0 = Pw[0] - H[0];
              const d1 = Pw[1] - H[1];
              const d2 = Pw[2] - H[2];
              const la = (R[0] * d0 + R[3] * d1 + R[6] * d2 + Hr[0]) / KT;
              const lc = (R[1] * d0 + R[4] * d1 + R[7] * d2 + Hr[1]) / KT;
              if (la < p.a0 || la >= p.a1 || lc < p.c0 || lc >= p.c1) continue;
              let col = floorAt(la, lc);
              if (!col) continue;
              const i = py * FW + px;
              if (Pw[2] <= zb[i]) continue;
              zb[i] = Pw[2];
              owner[i] = pi;
              // (an earth one, broken loose: its clods' crumbling edges, lit on the far sides, dark in the cracks between them)
              if (p.earth && f >= HEAVE) {
                const rag = 0.03 * hash(Math.floor(la * 30), Math.floor(lc * 30), 677);
                if (Math.min(p.a1 - la, p.c1 - lc) < 0.028 + rag) col = DIRT[0];
                else if (Math.min(la - p.a0, lc - p.c0) < 0.024 + rag) col = EARTH_EDGE;
              }
              const c2 = shifted(col, step);
              const dk = lidDark(-Pw[2]);
              scene.set(px, py, dk ? mix(c2, PIT_DARK, dk) : c2);
            }
          }
        }
        // its sides and underside (its broken edges, dark; the earth's, dirt)
        const ramp = p.earth ? SIDE_EARTH : SIDE_STONE;
        for (let i = 0; i < p.tone.length; i++) {
          const na = p.nrm[i * 3];
          const nc = p.nrm[i * 3 + 1];
          const nz = p.nrm[i * 3 + 2];
          const wa = R[0] * na + R[1] * nc + R[2] * nz;
          const wc = R[3] * na + R[4] * nc + R[5] * nz;
          const wz = R[6] * na + R[7] * nc + R[8] * nz;
          const [ex, ey] = toXY(way, wa, wc);
          if (ex * EYE[0] + ey * EYE[1] + wz * EYE[2] <= 0.02) continue;
          const w = world(p.pts[i * 3] + Hr[0], p.pts[i * 3 + 1] + Hr[1], p.pts[i * 3 + 2]);
          const [sx, sy] = onScreen(w);
          const l = ex * LIGHT[0] + ey * LIGHT[1] + wz * LIGHT[2];
          let c = ramp[p.tone[i]];
          if (p.tone[i] < 3) c = shifted(c, l > 0.3 ? 1 : l < -0.2 ? -1 : 0);
          put(sx, sy, w[2], c, pi, lidDark(-w[2]));
        }
        const xs = corners.map((q) => q[0]);
        const ys = corners.map((q) => q[1]);
        sizes.push(Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)));
        const mid = onScreen(world(((p.a0 + p.a1) / 2) * KT, ((p.c0 + p.c1) / 2) * KT, -THICK / 2));
        mids.push(mid);
      });
    }
    return { sizes, mids };
  };
  /** How much of each piece shows, from what drawPieces painted (each pixel of it, less the deeper it is in the dark). */
  const seenOf = (zb: Float32Array, owner: Int16Array): number[] => {
    const seen = new Array<number>(pieces.length).fill(0);
    for (let i = 0; i < owner.length; i++) if (owner[i] >= 0) seen[owner[i]] += 1 - lidDark(-zb[i]);
    return seen;
  };

  // EACH STRIKES THE BOTTOM as it goes from sight (with a jolt, which is when it may go at once): the
  // frame at which what shows of it falls by more than a third, or to almost nothing
  // (and one that, tipping, would go under its downhill neighbour faster than that tips less far, and all is found again)
  const pit = wellAt(0, false);
  const dropFrom = cells.map((_, ci) => Math.max(...pieces.filter((p) => p.cell === ci).map((p) => tipOf(p) + tipFor(p))));
  const tipFrom = cells.map((_, ci) => Math.min(...pieces.filter((p) => p.cell === ci).map(tipOf)));
  for (let tries = 0; tries < 8; tries++) {
    cutAt.fill(Infinity);
    const lying = cells.map(() => 1);
    const was = cells.map(() => 1);
    const hidden = cells.map(() => false);
    for (let f = SHOCK; f < TIP0 + RIPPLE + 40 && cutAt.some((c) => c === Infinity); f++) {
      // (again, while any goes this frame: what goes uncovers what was behind it)
      for (let again = true; again; ) {
        again = false;
        const scene = new Px(FW, FH);
        const zb = new Float32Array(FW * FH);
        const owner = new Int16Array(FW * FH).fill(-1);
        fastBlit(scene, pit.p, PADX, PADT);
        for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) zb[(y + PADT) * FW + x + PADX] = pit.z[y * BW + x];
        drawPieces(f, scene, zb, owner);
        const seen = seenOf(zb, owner);
        const now = cells.map((_c, ci) => {
          const s = pieces.reduce((t, p, pi) => t + (p.cell === ci ? seen[pi] : 0), 0);
          if (f < tipFrom[ci]) lying[ci] = Math.max(lying[ci], s);
          return Math.min(1, s / lying[ci]);
        });
        cells.forEach((_c, ci) => {
          if (cutAt[ci] < Infinity || f < dropFrom[ci] || !(was[ci] - now[ci] > 0.3 || now[ci] < 0.12)) return;
          cutAt[ci] = f;
          again = true;
        });
        if (again) continue;
        now.forEach((v, ci) => {
          if (f >= tipFrom[ci] && f < dropFrom[ci] && was[ci] - v > 0.32) hidden[ci] = true;
          was[ci] = v;
        });
      }
    }
    if (!hidden.some(Boolean)) break;
    hidden.forEach((b, ci) => b && (tipScale[ci] *= 0.8));
  }
  const cellImpacts = cutAt;
  const great = Math.max(...cutAt);

  // ----- THE FISSURE: round the opening's outline from the middle of its near side both ways, and its forks out into the floor
  interface Crack { pts: [number, number][]; f0: number; v: number; burst: number; width: number }
  const cracks: Crack[] = [];
  const line = (pts: [number, number][], f0: number, v: number, burst: number, width: number): void => {
    // (points every fortieth of a tile)
    const out: [number, number][] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [a0, c0] = pts[i - 1];
      const [a1, c1] = pts[i];
      const n = Math.max(1, Math.ceil(Math.hypot(a1 - a0, c1 - c0) * 40));
      for (let k = 1; k <= n; k++) out.push([a0 + ((a1 - a0) * k) / n, c0 + ((c1 - c0) * k) / n]);
    }
    cracks.push({ pts: out, f0, v, burst, width });
  };
  const RIM = 0.006;
  line([[L / 2, Wd - RIM], [L - RIM, Wd - RIM], [L - RIM, RIM], [L / 2 + 0.02, RIM]], SHOCK, 0.55, 0.22, 2);
  line([[L / 2, Wd - RIM], [RIM, Wd - RIM], [RIM, RIM], [L / 2 - 0.02, RIM]], SHOCK, 0.55, 0.22, 2);
  /** Where along the outline (tiles from the start, either way) a point is passed by the fissure, and on which frame. */
  const passed = (dist: number): number => SHOCK + Math.max(0, Math.ceil((dist - 0.22) / 0.55));
  // forks: out from the outline into the floor, each a few jagged runs
  const FORKS: [number, number, number, number, number][] = [
    // [along, across, out along, out across, how far along the fissure it is]
    [L * 0.72, Wd, 0.25, 1, L * 0.22],
    [L, Wd * 0.45, 1, -0.2, L / 2 + Wd * 0.55],
    [0, Wd * 0.6, -1, 0.3, L / 2 + Wd * 0.4],
    [L * 0.3, 0, -0.3, -1, L / 2 + Wd + L * 0.3],
  ];
  FORKS.forEach(([a, c, oa, oc, dist], i) => {
    const len = 0.34 + 0.2 * hash(i, 1, 621);
    const n = Math.hypot(oa, oc);
    const [ua, uc] = [oa / n, oc / n];
    const pts: [number, number][] = [[a, c]];
    for (let k = 1; k <= 5; k++) {
      const t = (len * k) / 5;
      const side = (hash(i, k, 622) - 0.5) * 0.12;
      pts.push([a + ua * t - uc * side, c + uc * t + ua * side]);
    }
    line(pts, passed(dist) + 1, 0.12, 0, 1);
  });
  const openOf = (c: Crack, f: number): number => Math.min(c.pts.length - 1, Math.floor((c.burst + (f - c.f0 + 1) * c.v) * 40));
  const frontOf = (c: Crack, f: number): [number, number] | null => {
    if (f < c.f0) return null;
    const i = openOf(c, f);
    return i > (f > c.f0 ? openOf(c, f - 1) : -1) ? c.pts[i] : null;
  };

  // ----- THE DUST of this floor: grey-violet stone dust, plum-mauve the more earth (floor 4's body 91, 77, 103)
  const t4 = Math.min(1, gone / 0.45);
  const DUST: readonly [string, string, string, string] = [
    mix('#2c283c', '#2f2633', t4),
    mix('#46425a', '#463a4e', t4),
    mix('#56506a', '#5b4d67', t4),
    mix('#6a6480', '#6e5f72', t4),
  ];
  const billows: Billow[] = [];
  let seed = 0;
  const h = (i: number, j: number, s: number): number => hash(i, j, s);
  const blow = (b: Omit<Billow, 'seed' | 'drag' | 'tall' | 'sink' | 'sinkMax' | 'rest' | 'flat' | 'wx' | 'wy'> & Partial<Billow>): void => {
    billows.push({ drag: 0.8, tall: 1, sink: 0.1, sinkMax: 2, rest: 6, flat: 10, wx: 0, wy: 0, ...b, seed: seed++ } as Billow);
  };
  /** A point on the opening's outline pushed out `out` tiles, a fraction `t` of the way round it; and which way is out there. */
  const round = (t: number, out: number): [number, number, number, number] => {
    const a0 = -out;
    const a1 = L + out;
    const c0 = -out;
    const c1 = Wd + out;
    const per = 2 * (a1 - a0 + c1 - c0);
    let s = (((t % 1) + 1) % 1) * per;
    if (s < a1 - a0) return [a0 + s, c0, 0, -1];
    if ((s -= a1 - a0) < c1 - c0) return [a1, c0 + s, 1, 0];
    if ((s -= c1 - c0) < a1 - a0) return [a1 - s, c1, 0, 1];
    s -= a1 - a0;
    return [a0, c1 - s, -1, 0];
  };
  // the fissure's fronts: dust puffs up where it runs, every frame on one side or the other, a low ridge along it
  for (let f = SHOCK; f < HEAVE; f++) {
    cracks.slice(0, 2).forEach((c, ci) => {
      const p = frontOf(c, f);
      if (!p) return;
      const [x, y] = XY(p[0], p[1]);
      blow({ f0: f, x, y, z: 2, vx: 0, vy: 0, vz: 2.4 + h(f, ci, 631), r0: 2.6, grow: 3 + 1.5 * h(ci, f, 632), life: 11, rest: 3, sinkMax: 1, flat: 7, tall: 0.9 });
    });
  }
  // the heave: jets of dust up through the joints, and a low spill all round the fissure
  for (let i = 0; i < 6; i++) {
    const cell = cells[Math.floor(h(i, 1, 633) * cells.length)];
    const al = h(i, 2, 633) < 0.5 ? cell.a0 + 0.02 : cell.a1 - 0.02;
    const ac = cell.c0 + (cell.c1 - cell.c0) * (0.2 + 0.6 * h(i, 3, 633));
    const [x, y] = XY(Math.max(0.05, al), ac);
    // (a jet: its billows thrown together, each slower than the one before, drawn out behind its head)
    const v = 4.5 + 2.5 * h(i, 0, 634);
    for (let j = 0; j < 3; j++) blow({ f0: HEAVE, x, y, z: 2, vx: 0, vy: 0, vz: v * (1 - 0.25 * j), r0: 3.8 - 0.4 * j, grow: 5 - j + 1.5 * h(j, i, 635), life: 15 - j, rest: 4, sinkMax: 2, flat: 8 });
  }
  for (let i = 0; i < 10; i++) {
    const [al, ac, oa, oc] = round((i + 0.8 * h(i, 2, 636)) / 10, 0);
    const [x, y] = XY(al, ac);
    const v = 0.04 + 0.06 * h(i, 3, 636);
    const [vx, vy] = XY(oa * v, oc * v);
    blow({ f0: HEAVE + (i % 2), x, y, z: 2, vx, vy, vz: 1, r0: 3, grow: 3 + 4 * h(i, 1, 636), life: 14 + Math.floor(5 * h(i, 4, 636)), rest: 3, sinkMax: 1, flat: 8, tall: 0.75 });
  }
  // each flagstone as it goes: dust gushes up through the gap it leaves and hangs there over it (the pit
  // is never seen open till the great burst has come and gone); and as it strikes the bottom a spurt of
  // dust from below, up out of the pit, bigger down the line
  pieces.forEach((p, pi) => {
    if (p.earth && p.lump !== 3) return;
    const c = cells[p.cell];
    const k = c.order / Math.max(1, cells.length - 1);
    const D = tipOf(p) + tipFor(p) - 1;
    for (let j = 0; j < 4; j++) {
      const [x, y] = XY(c.a0 + (c.a1 - c.a0) * (0.25 + 0.5 * h(pi, j, 641)), c.c0 + (c.c1 - c.c0) * (0.2 + 0.6 * h(j, pi, 642)));
      const f0 = D + j;
      // (some rising out of it, some welling up in it to the floor's level and filling it)
      blow({ f0, x, y, z: -8, vx: 0, vy: 0, vz: j % 2 ? 1.1 + 0.6 * h(pi, j, 643) : 2.2 + 1.2 * h(pi, j, 643), r0: 3, grow: 4 + 2.5 * h(j, pi, 644), life: Math.max(20, great + 12 - f0), rest: 8, sink: 0.04, sinkMax: 0.5, flat: 10 });
    }
    const I = cellImpacts[p.cell];
    for (let j = 0; j < 3; j++) {
      const [x, y] = XY(c.a0 + (c.a1 - c.a0) * (0.2 + 0.6 * h(pi, j, 645)), c.c0 + (c.c1 - c.c0) * (0.2 + 0.6 * h(j, pi, 646)));
      blow({ f0: I + (j % 2), x, y, z: -24, vx: 0, vy: 0, vz: 7 + 5 * k + 3 * h(pi, j, 647), r0: 3, grow: 3 + 3 * k + 2 * h(j, pi, 648), life: 22, rest: 5, sinkMax: 2, flat: 12 });
    }
  });
  // THE GREAT BURST. A heap of dust over the whole opening and its kerb, higher in the middle (under it
  // the pit becomes the stairwell), low along the near sides, which lie lower on the screen
  {
    let i = 0;
    // (a dome: big billows high in the middle, smaller and lower toward its rim, never in rows)
    for (let al = -0.28; al <= L + 0.55; al += 0.32) {
      for (let ac = -0.28; ac <= Wd + 0.55; ac += 0.32, i++) {
        const ja = al + (h(i, 1, 651) - 0.5) * 0.26;
        const jc = ac + (h(i, 2, 651) - 0.5) * 0.26;
        const [x, y] = XY(ja, jc);
        const mid = Math.max(0, 1 - Math.hypot((ja - L / 2) / (L / 2 + 0.45), (jc - Wd / 2) / (Wd / 2 + 0.45)));
        const big = h(i, 8, 651);
        blow({ f0: great + (i % 2), x, y, z: 3 + 30 * mid ** 0.8 * (0.55 + 0.45 * h(i, 3, 651)), vx: 0, vy: 0, vz: 0.8 + 3 * mid * h(i, 4, 651), r0: 6 + 5 * mid + 3 * big, grow: 4 + 8 * big, life: 50 + Math.floor(6 * h(i, 6, 651)), rest: 20 + Math.floor(6 * h(i, 7, 651)), sink: 0.08, sinkMax: 1.2, flat: 22 });
      }
    }
  }
  // the plume: billows of every size blown up out of the hole, the slow ones low and the fast high, a
  // column from the floor up, spreading as it goes and drifting; a few streamers shooting out of it
  const [cx, cy] = XY(L / 2, Wd / 2);
  const WX = 0.006;
  const WY = -0.004;
  for (let i = 0; i < 48; i++) {
    const [x, y] = XY(0.15 + (L - 0.3) * h(i, 1, 652), 0.12 + (Wd - 0.24) * h(i, 2, 652));
    const up = ((i + 0.5) / 48) ** 0.75;
    const spread = 0.02 + 0.06 * up;
    const big = h(i, 7, 652) ** 1.4;
    blow({ f0: great + (i % 4), x, y, z: 4, vx: (x - cx) * spread + (h(i, 4, 652) - 0.5) * 0.04, vy: (y - cy) * spread + (h(i, 5, 652) - 0.5) * 0.04, vz: 6 + 26 * up * (0.85 + 0.3 * h(i, 3, 652)), drag: 0.78, r0: 3 + 5 * big, grow: 4 + 13 * big + 3 * up, life: 0, rest: 12 + Math.floor(6 * h(i, 8, 652)), sink: 0.5, sinkMax: 6, flat: 18, wx: WX, wy: WY });
    // (it hangs, then the column slumps: each billow comes down onto the floor and spreads there into a sheet)
    const b = billows[billows.length - 1];
    b.life = landOf(b) + b.flat + 2;
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const [x, y] = XY(L / 2 + Math.cos(a) * L * 0.3, Wd / 2 + Math.sin(a) * Wd * 0.3);
    const [ox, oy] = XY(Math.cos(a), Math.sin(a));
    const vz = 20 + 10 * h(i, 1, 653);
    // (a streamer: a run of small billows thrown together, each a little slower, so that it draws out into a tail behind its head)
    for (let j = 0; j < 6; j++) blow({ f0: great + 1, x, y, z: 8, vx: ox * 0.16 * (1 - 0.06 * j), vy: oy * 0.16 * (1 - 0.06 * j), vz: vz * (1 - 0.06 * j), r0: 3.6 - 0.3 * j, grow: 4 - 0.5 * j, life: 30 - 2 * j, rest: 9, sinkMax: 2, flat: 12, tall: 1.25, wx: WX, wy: WY });
  }
  // the skirt: rushing out low over the floor from all round the kerb, the fastest two or three tiles past
  // where one stands beside it, rolling as it goes; then it lies and spreads into sheets
  for (let i = 0; i < 56; i++) {
    const [al, ac, oa, oc] = round(i / 56 + 0.005, K * 0.9);
    const ra = al - L / 2;
    const rc = ac - Wd / 2;
    const rn = Math.hypot(ra, rc) || 1;
    let da = oa + (0.7 * ra) / rn;
    let dc = oc + (0.7 * rc) / rn;
    const dn = Math.hypot(da, dc);
    da /= dn;
    dc /= dn;
    const [x, y] = XY(al, ac);
    // (fast and slow together, so that it covers the floor from the kerb out to its front, not in rings)
    for (let j = 0; j < 3; j++) {
      const t = (j + h(i, 2 + j, 654)) / 3;
      const v = 0.1 + 0.48 * t;
      const [vx, vy] = XY(da * v, dc * v);
      blow({ f0: great + 1 + ((i + j) % 2), x, y, z: 3, vx, vy, vz: 0.5, drag: 0.87, r0: 5, grow: 5 + 8 * t + 2 * h(i, 5 + j, 654), life: 46 - Math.floor(12 * t) + Math.floor(4 * h(i, 8 + j, 654)), rest: 3, sink: 0.05, sinkMax: 0.4, flat: 22, tall: 0.72, wx: WX * 0.5, wy: WY * 0.5 });
    }
  }

  // ----- THE STONES thrown out of the hole in arcs: they land on the floor beyond the kerb, bounce, and drop back into the hole
  // (each a chunk of the floor: its lit face, its body, its shade, its dark edge)
  type Tones = readonly [string, string, string, string];
  interface Stone { f0: number; size: number; tones: Tones; path: V3[]; spin: number }
  const STONE_TONES: Tones = [mix(theme.slab[3], '#c8c6f0', 0.42), theme.slab[3], theme.slab[1], theme.slab[0]];
  const ROCK_TONES: Tones = [mix(rock[3], '#d0cce8', 0.3), rock[3], rock[2], rock[0]];
  const CLOD_TONES: Tones = [mix(dirt[3], '#a08494', 0.4), dirt[3], dirt[2], dirt[0]];
  const stones: Stone[] = [];
  {
    // [launch along, across; where it lands on the floor beyond the far kerb or past the top of the steps;
    // where it comes back down into the hole, near its far side, where the eye sees deep into the pit]
    const K2 = K + 0.26;
    const THROWS: [number, number, number, number, number, number, number][] = [
      // [launch al, ac, land al, ac, back al, ac, size]
      [L * 0.3, 0.3, L * 0.22, -K2, L * 0.32, 0.26, 16],
      [L * 0.62, 0.3, L * 0.7, -K2 - 0.05, L * 0.56, 0.28, 14],
      [0.3, Wd * 0.35, -K2, Wd * 0.25, 0.34, 0.28, 13],
      [0.3, Wd * 0.75, -K2 + 0.05, Wd * 0.85, 0.42, 0.3, 12],
      [L * 0.45, 0.25, L * 0.42, -K2 - 0.1, L * 0.46, 0.27, 13],
      [L * 0.85, 0.3, L * 0.92, -K2, L * 0.6, 0.3, 12],
      [0.6, Wd * 0.5, -K2 - 0.04, Wd * 0.6, 0.48, 0.26, 15],
    ];
    const g = 1.6;
    THROWS.forEach(([a, c, la, lc, ba, bc, size], i) => {
      const vz1 = (size >= 14 ? 8.4 : 7.6) + 0.5 * h(i, 2, 661);
      const T1 = Math.round((2 * vz1) / g);
      // (it strikes the floor and bounces back, lower, over the rim and down into the hole)
      const [lx, ly] = XY(la, lc);
      const [bx, by] = XY(ba, bc);
      const dist = Math.hypot((bx - lx - (by - ly)) * 32, (bx - lx + by - ly) * 16);
      const T2 = Math.max(4, Math.ceil(dist / 6));
      // (high enough a bounce to clear the floor until it is over the hole)
      let tEdge = 1;
      for (let t = 0; t <= 1; t += 0.02) {
        const al = la + (ba - la) * t;
        const ac = lc + (bc - lc) * t;
        if (al > 0.06 && al < L - 0.06 && ac > 0.06 && ac < Wd - 0.06) {
          tEdge = t;
          break;
        }
      }
      const vz2 = Math.max(0.45 * vz1, 0.5 * g * (tEdge * T2 + 1.5));
      const path: V3[] = [];
      let fall = 0;
      for (let k = 0; ; k++) {
        let al: number;
        let ac: number;
        let z: number;
        if (k <= T1) {
          const t = k / T1;
          [al, ac] = [a + (la - a) * t, c + (lc - c) * t];
          z = k === T1 ? 0 : 1 + vz1 * k - 0.5 * g * k * k;
        } else {
          const j = k - T1;
          const t = Math.min(1, j / T2);
          [al, ac] = [la + (ba - la) * t, lc + (bc - lc) * t];
          z = vz2 * j - 0.5 * g * j * j;
          // (into the hole, falling no faster than its own size a frame, darker the deeper, until it is lost in the dark)
          if (z < 0) {
            fall = Math.max(fall - (size + 1), Math.min(fall, z));
            z = fall;
          }
          if (z < -36) break;
        }
        const [x, y] = XY(al, ac);
        path.push([x, y, z]);
      }
      const tones = e && h(i, 3, 661) < gone * 1.6 ? (i % 2 ? CLOD_TONES : ROCK_TONES) : STONE_TONES;
      stones.push({ f0: great + 1 + (i % 3), size, tones, path, spin: (h(i, 4, 661) - 0.5) * 0.6 });
    });
  }
  /** A stone's shape: a rounded lump, turned `ang`, lit from the upper left; each pixel of it: 0 its lit face, 1 its body, 2 its shade, 3 its dark edge, -1 none. */
  const stoneShape = (size: number, ang: number, sd: number): number[][] => {
    const out: number[][] = [];
    const r = size / 2;
    for (let dy = 0; dy < size; dy++) {
      const row: number[] = [];
      for (let dx = 0; dx < size; dx++) {
        const ox = dx + 0.5 - r;
        const oy = dy + 0.5 - r;
        const a = Math.atan2(oy, ox) - ang;
        const rr = r * (0.88 + 0.08 * Math.cos(a * 3 + sd) + 0.05 * Math.cos(a * 5 + sd * 2));
        const d = Math.hypot(ox, oy);
        if (d > rr) {
          row.push(-1);
          continue;
        }
        const nx = ox / rr;
        const ny = oy / rr;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        // (its faces: the top turned to the light flat, as a broken stone's are)
        const lit = 0.9 * (-0.55 * nx - 0.7 * ny) + 0.5 * Math.round(nz * 2) / 2;
        if (d > rr - 1.3 && ox + oy > -r * 0.2) row.push(3);
        else row.push(lit > 0.55 ? 0 : lit > 0.12 ? 1 : lit > -0.25 ? 2 : 3);
      }
      out.push(row);
    }
    return out;
  };

  // ----- THE FRAMES
  const tracks: Track[] = [];
  // (one for each flagstone, and for each slab of earth as it crumbles, all its lumps together)
  const cellTrack = cells.map((c, i) => {
    const t: Track = { name: `${c.earth ? 'a slab of earth' : 'a flagstone'} (${i + 1}, going ${c.order + 1})`, at: [] };
    tracks.push(t);
    return t;
  });
  const cellLying = cells.map(() => 0);
  const stoneTrack = stones.map((_, i) => {
    const t: Track = { name: `a stone thrown (${i + 1})`, fromEdge: true, at: [] };
    tracks.push(t);
    return t;
  });

  /** One frame: the scene (without the dust), the dust over it, and what of each piece and stone shows. */
  /** The frame the fissure has gone, under the dust (found below). */
  let heal = -1;
  const paint = (f: number, swapped: boolean, record: boolean, healed = heal >= 0 && f >= heal): { out: Px; scene: Px; dust: Uint8Array } => {
    const scene = new Px(FW, FH);
    const zb = new Float32Array(FW * FH).fill(0);
    const owner = new Int16Array(FW * FH).fill(-1);
    if (f >= SHOCK) {
      // THE PIT under the floor (and after it is the stairwell, under the dust, the stairwell)
      const w = swapped ? wellAt(KERB_H, true) : wellAt(0, false);
      fastBlit(scene, w.p, PADX, PADT);
      for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) zb[(y + PADT) * FW + x + PADX] = w.z[y * BW + x];
    }
    // THE FLOOR OVER THE OPENING, piece by piece
    const { sizes, mids } = f >= SHOCK && !swapped ? drawPieces(f, scene, zb, owner) : { sizes: [] as number[], mids: [] as ([number, number] | null)[] };
    // THE FISSURE and its forks, over the floor (until the dust hides them going)
    if (f >= SHOCK && !swapped && !healed) {
      const crackAt = new Uint8Array(FW * FH);
      cracks.forEach((c, ci) => {
        if (f < c.f0) return;
        const n = openOf(c, f);
        /** A smooth wandering, -1 to 1, along the fissure (knots every `k` points). */
        const wander = (i: number, k: number, s: number): number => {
          const u = i / k;
          const i0 = Math.floor(u);
          const t = smooth(u - i0);
          return 2 * (hash(i0, ci, s) * (1 - t) + hash(i0 + 1, ci, s) * t) - 1;
        };
        // (only on the floor, or on a stone of it still lying near its place: never over the pit)
        const set = (X: number, Y: number, col: string): void => {
          if (X < 0 || Y < 0 || X >= FW || Y >= FH) return;
          const i = Y * FW + X;
          if (scene.has(X, Y) && !crackAt[i] && !(owner[i] >= 0 && zb[i] > -3)) return;
          scene.set(X, Y, col);
          crackAt[i] = 1;
        };
        for (let i = 0; i < n; i++) {
          const [a0, c0] = c.pts[i];
          const [x0, y0] = scr(...XY(a0, c0), 0);
          // (it wanders up and down, jagged; it opens narrow and gapes wider a frame or two after the front has passed)
          const j = Math.round(2.2 * wander(i, 7, 671) + 0.6 * wander(i, 2, 674));
          const X = Math.floor(x0);
          const Y = Math.floor(y0) + j;
          const age = f - (c.f0 - 1 + Math.ceil((i / 40 - c.burst) / c.v));
          const gape = Math.max(1, Math.min(age + 1, c.width + Math.round(0.8 + 0.8 * wander(i, 5, 675))));
          const col = floorAt(a0, c0);
          const onEarth = !!col && earthy.has(col);
          if (onEarth) {
            // crumbling: wider and ragged, its broken edge the earth's lit clods, dirt spilling into it
            set(X, Y - 1, EARTH_EDGE);
            for (let g = 0; g <= gape; g++) set(X, Y + g, g === gape ? dirt[0] : DIRT[0]);
            if (hash(i, ci, 672) < 0.45) set(X, Y + gape + 1, dirt[0]);
            if (hash(i, ci, 673) < 0.35) set(X, Y - 2, dirt[1]);
            if (hash(i, ci, 676) < 0.25 && gape > 1) set(X, Y + 1, dirt[1]);
          } else {
            set(X, Y - 1, LIT_EDGE);
            for (let g = 0; g < gape; g++) set(X, Y + g, DEEP);
            set(X, Y + gape, theme.mortar);
          }
        }
      });
    }
    // THE STONES: under the dust while they are down in the hole, over it while they fly
    const stoneAt = (s: Stone): { x: number; y: number; z: number } | null => {
      const k = f - s.f0;
      if (k < 0 || k >= s.path.length) return null;
      const [x, y, z] = s.path[k];
      return { x, y, z };
    };
    const stoneSeen: ({ x: number; y: number; shown: number } | null)[] = stones.map(() => null);
    const drawStone = (s: Stone, si: number, target: Px, test: boolean): void => {
      const q = stoneAt(s);
      if (!q) return;
      const [sx, sy] = scr(q.x, q.y, q.z);
      const shape = stoneShape(s.size, s.spin * (f - s.f0), si * 1.7);
      let all = 0;
      let seen = 0;
      for (let dy = 0; dy < s.size; dy++) {
        for (let dx = 0; dx < s.size; dx++) {
          const v = shape[dy][dx];
          if (v < 0) continue;
          all++;
          const X = Math.floor(sx - s.size / 2 + dx);
          const Y = Math.floor(sy - s.size + dy);
          if (X < 0 || Y < 0 || X >= FW || Y >= FH) continue;
          const zz = q.z + (s.size - dy) * 0.5;
          if (test && zz <= zb[X + Y * FW]) continue;
          const dk = darkAt(-q.z);
          target.set(X, Y, dk ? mix(s.tones[v], PIT_DARK, dk) : s.tones[v]);
          seen += 1 - dk;
        }
      }
      stoneSeen[si] = { x: sx - AX, y: sy - AY, shown: all ? seen / all : 0 };
    };
    stones.forEach((s, si) => {
      const q = stoneAt(s);
      if (q && q.z < 0) drawStone(s, si, scene, true);
    });
    // THE DUST over all, as one mass
    const out = new Px(FW, FH);
    fastBlit(out, scene, 0, 0);
    const dust = paintDust(out, f, zb, scene);
    stones.forEach((s, si) => {
      const q = stoneAt(s);
      if (q && q.z >= 0) drawStone(s, si, out, false);
    });
    if (record) {
      const seen = seenOf(zb, owner);
      cells.forEach((_c, ci) => {
        const mine = pieces.map((p, pi) => (p.cell === ci && mids[pi] ? pi : -1)).filter((pi) => pi >= 0);
        if (!mine.length || f < SHOCK || swapped) {
          cellTrack[ci].at.push(null);
          return;
        }
        const s = mine.reduce((t, pi) => t + seen[pi], 0);
        // (against all of it that shows lying in its place, before it tips)
        if (f < Math.min(...pieces.filter((p) => p.cell === ci).map(tipOf))) cellLying[ci] = Math.max(cellLying[ci], s, 1);
        const mx = mine.reduce((t, pi) => t + mids[pi]![0], 0) / mine.length;
        const my = mine.reduce((t, pi) => t + mids[pi]![1], 0) / mine.length;
        const size = Math.max(8, ...mine.map((pi) => sizes[pi]));
        cellTrack[ci].at.push({ x: mx - AX, y: my - AY, shown: Math.min(1, s / cellLying[ci]), size });
      });
      stones.forEach((s, si) => {
        const q = stoneSeen[si];
        stoneTrack[si].at.push(q ? { x: q.x, y: q.y, shown: q.shown, size: s.size + 2 } : null);
      });
    }
    return { out, scene, dust };
  };

  /**
   * The dust of frame f painted over `out` (the scene, `zb` the heights of what it shows): every billow
   * a round body with lobes round its rim, all of them one mass where they meet; lit from the upper
   * left as its surface turns, its tops lit, its bellies and the creases between its lobes dark, the
   * higher the lighter; behind whatever is nearer the eye (the floor in front of the pit hides dust
   * still down in it). Never a lone speck. Its mask returned.
   */
  function paintDust(out: Px, f: number, zb: Float32Array, scene: Px): Uint8Array {
    const mask = new Uint8Array(FW * FH);
    const live: { b: Billow; s: BillowNow; sx: number; sy: number }[] = [];
    for (const b of billows) {
      const st = billowAt(b, f);
      if (!st) continue;
      const [sx, sy] = scr(st.x, st.y, st.z);
      live.push({ b, s: st, sx, sy });
    }
    if (!live.length) return mask;
    let X0 = FW;
    let Y0 = FH;
    let X1 = -1;
    let Y1 = -1;
    for (const { s, sx, sy } of live) {
      X0 = Math.min(X0, Math.floor(sx - s.rx * 1.2));
      X1 = Math.max(X1, Math.ceil(sx + s.rx * 1.2));
      Y0 = Math.min(Y0, Math.floor(sy - s.ry * 1.2));
      Y1 = Math.max(Y1, Math.ceil(sy + s.ry * 1.2));
    }
    X0 = Math.max(1, X0);
    Y0 = Math.max(1, Y0);
    X1 = Math.min(FW - 2, X1);
    Y1 = Math.min(FH - 2, Y1);
    if (X1 < X0 || Y1 < Y0) return mask;
    const w = X1 - X0 + 1;
    const hh = Y1 - Y0 + 1;
    const n = w * hh;
    // the mass: how much dust is at each pixel (where enough is, it is dust), and how near the eye its surface is
    const F = new Float32Array(n);
    const M = new Float32Array(n).fill(-1e9);
    const Sm = new Float32Array(n);
    const Zt = new Float32Array(n);
    const KS = 4.5;
    for (const { b, s, sx, sy } of live) {
      const dep = 24.6 * (s.x + s.y) + 0.49 * s.z;
      const R = Math.min(s.rx, s.ry * 1.3);
      const k = f - b.f0;
      const p3 = b.seed * 2.39 + k * 0.05;
      const p5 = b.seed * 1.37 - k * 0.04;
      const [c3, s3, c5, s5] = [Math.cos(p3), Math.sin(p3), Math.cos(p5), Math.sin(p5)];
      const a3 = 0.075;
      const a5 = 0.045;
      const ya = Math.max(Y0, Math.floor(sy - s.ry * 1.2));
      const yb = Math.min(Y1, Math.ceil(sy + s.ry * 1.2));
      const xa = Math.max(X0, Math.floor(sx - s.rx * 1.2));
      const xb = Math.min(X1, Math.ceil(sx + s.rx * 1.2));
      for (let y = ya; y <= yb; y++) {
        const dy = (y + 0.5 - sy) / s.ry;
        for (let x = xa; x <= xb; x++) {
          const dx = (x + 0.5 - sx) / s.rx;
          const d2 = dx * dx + dy * dy;
          if (d2 > 1.44) continue;
          const d = Math.sqrt(d2) + 1e-6;
          const c = dx / d;
          const sn = dy / d;
          const cc = c * c;
          const ss = sn * sn;
          const lob = 1 + a3 * (c * (4 * cc - 3) * c3 - sn * (3 - 4 * ss) * s3) + a5 * (c * (16 * cc * cc - 20 * cc + 5) * c5 - sn * (16 * ss * ss - 20 * ss + 5) * s5);
          const q = d2 / (lob * lob);
          if (q >= 1.3) continue;
          const o = (y - Y0) * w + x - X0;
          if (q < 1) F[o] += 1 - q;
          const hg = q < 1 ? dep + R * Math.sqrt(1 - q) : dep - R * (q - 1) * 0.8;
          if (hg > M[o]) {
            Sm[o] = Sm[o] * Math.exp((M[o] - hg) / KS) + 1;
            M[o] = hg;
            Zt[o] = s.z;
          } else Sm[o] += Math.exp((hg - M[o]) / KS);
        }
      }
    }
    const T = 0.12;
    const H = new Float32Array(n);
    const inside = new Uint8Array(n);
    for (let y = Y0; y <= Y1; y++) {
      for (let x = X0; x <= X1; x++) {
        const o = (y - Y0) * w + x - X0;
        if (F[o] < T) continue;
        const hg = M[o] + KS * Math.log(Sm[o]);
        // (behind what is nearer the eye: the floor, a stone of it, the kerb)
        const i = y * FW + x;
        const zs = scene.d[i * 4 + 3] ? zb[i] : 0;
        const ds = (24.6 * (y + 0.5 - AY + zs)) / 16 + 0.49 * zs;
        if (hg < ds - 0.5) continue;
        H[o] = hg;
        inside[o] = 1;
      }
    }
    // (its surface smoothed a little, so that close-packed billows make no ribs)
    const Hs = new Float32Array(n);
    for (let y = Y0; y <= Y1; y++) {
      for (let x = X0; x <= X1; x++) {
        const o = (y - Y0) * w + x - X0;
        if (!inside[o]) continue;
        let t = 0;
        let c = 0;
        for (let dy = -1; dy <= 1; dy++) {
          if (y + dy < Y0 || y + dy > Y1) continue;
          for (let dx = -1; dx <= 1; dx++) {
            if (x + dx < X0 || x + dx > X1) continue;
            const q = o + dy * w + dx;
            if (!inside[q]) continue;
            t += H[q];
            c++;
          }
        }
        Hs[o] = t / c;
      }
    }
    H.set(Hs);
    const LX = -0.47;
    const LY = -0.74;
    const LZ = 0.51;
    for (let y = Y0; y <= Y1; y++) {
      for (let x = X0; x <= X1; x++) {
        const o = (y - Y0) * w + x - X0;
        if (!inside[o]) continue;
        const l = x > X0 && inside[o - 1];
        const r = x < X1 && inside[o + 1];
        const u = y > Y0 && inside[o - w];
        const dn = y < Y1 && inside[o + w];
        let nx: number;
        let ny: number;
        let nz: number;
        if (l && r && u && dn) {
          // (inside: as its surface turns)
          const gx = (H[o + 1] - H[o - 1]) / 2;
          const gy = (H[o + w] - H[o - w]) / 2;
          const m = Math.hypot(gx, gy, 1);
          [nx, ny, nz] = [-gx / m, -gy / m, 1 / m];
        } else {
          // (its rim: turned out, away from the mass)
          const fx = (x < X1 ? F[o + 1] : 0) - (x > X0 ? F[o - 1] : 0);
          const fy = (y < Y1 ? F[o + w] : 0) - (y > Y0 ? F[o - w] : 0);
          const m = Math.hypot(fx, fy) || 1;
          [nx, ny, nz] = [(-fx / m) * 0.92, (-fy / m) * 0.92, 0.39];
        }
        const lit = LX * nx + LY * ny + LZ * nz + 0.1 * Math.tanh((Zt[o] - 25) / 40);
        out.set(x, y, DUST[lit > 0.74 ? 3 : lit > 0.36 ? 2 : lit > -0.18 ? 1 : 0]);
        mask[y * FW + x] = 1;
      }
    }
    // (never a lone speck: his note on the rats)
    for (let y = Y0; y <= Y1; y++) {
      for (let x = X0; x <= X1; x++) {
        if (!mask[y * FW + x]) continue;
        let k = 0;
        for (let dy = -1; dy <= 1 && !k; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && out.has(x + dx, y + dy)) k++;
        if (!k) {
          out.erase(x, y);
          mask[y * FW + x] = 0;
        }
      }
    }
    return mask;
  }

  // WHEN THE FISSURE GOES, AND WHEN THE PIT BECOMES THE STAIRWELL: each at the first frame at which the
  // dust hides every pixel that changes, that frame and the next (the fissure and its forks while the skirt
  // lies over the floor round the kerb; the pit after every stone has gone back into it)
  /** Whether every pixel that differs between two ways of painting a frame is under the dust, both ways. */
  const hidden = (g: number, A: [boolean, boolean], B: [boolean, boolean]): boolean => {
    const a = paint(g, A[0], false, A[1]);
    const b = paint(g, B[0], false, B[1]);
    for (let i = 0; i < FW * FH; i++) {
      const j = i * 4;
      if (a.scene.d[j + 3] === b.scene.d[j + 3] && a.scene.d[j] === b.scene.d[j] && a.scene.d[j + 1] === b.scene.d[j + 1] && a.scene.d[j + 2] === b.scene.d[j + 2]) continue;
      if (!a.dust[i] || !b.dust[i]) return false;
    }
    return true;
  };
  for (let f = great + 2; f < great + 24 && heal < 0; f++) if (hidden(f, [false, false], [false, true]) && hidden(f + 1, [false, false], [false, true])) heal = f;
  if (heal < 0) throw new Error(`the stairwell opening (${theme.id}, ${way}): no frame in which the dust hides the fissure going`);
  const stonesGone = Math.max(...stones.map((s) => s.f0 + s.path.length));
  let swap = -1;
  for (let f = Math.max(great + 18, stonesGone, heal + 1); f < great + 36 && swap < 0; f++) if (hidden(f, [false, true], [true, true]) && hidden(f + 1, [false, true], [true, true])) swap = f;
  if (swap < 0) throw new Error(`the stairwell opening (${theme.id}, ${way}): no frame in which the dust hides the pit becoming the stairwell`);
  let last = swap + 1;
  for (let f = swap; f < swap + 120; f++) if (billows.some((b) => billowAt(b, f))) last = f + 1;
  const N = last + 1;

  const frames: Sprite[] = [];
  const cut = (p: Px): Sprite => {
    const bb = p.bounds(GRAIN);
    if (!bb) return new Px(GRAIN, GRAIN).sprite(AX % GRAIN, AY % GRAIN, GRAIN);
    const q = new Px(bb.w, bb.h);
    fastBlit(q, p, -bb.x, -bb.y);
    return q.sprite(AX - bb.x, AY - bb.y, GRAIN);
  };
  // (the first frame: nothing, and nothing of it followed)
  tracks.forEach((t) => t.at.push(null));
  for (let f = 0; f < N; f++) frames.push(cut(f === 0 ? new Px(FW, FH) : paint(f, f >= swap, true, f >= heal).out));
  // THE JOLTS: the shock, the heave, each flagstone striking the bottom, the great burst
  const joltKick = new Map<number, number>([[SHOCK, KICK_SHOCK], [HEAVE, KICK_HEAVE]]);
  const orderOf = cells.map((c) => c.order);
  cellImpacts.forEach((f, ci) => joltKick.set(f, Math.max(joltKick.get(f) ?? 0, Math.round(3 + (3 * orderOf[ci]) / Math.max(1, cells.length - 1)))));
  joltKick.set(great, KICK_BURST);
  const jolts = [...joltKick.keys()].sort((a, b) => a - b);
  const m: Moment = { name: 'the stairwell opens', frames, fps: 30, before: null, after: [final], tracks, jolts, holds: [] };
  const inOrder = cells.map((c, ci) => ci).sort((p, q) => cells[p].order - cells[q].order);
  const tips = inOrder.map((ci) => Math.min(...pieces.filter((p) => p.cell === ci).map(tipOf)));
  const impacts = inOrder.map((ci) => cutAt[ci]);
  NOTES.set(m, { great, heal, swap, tips, impacts, kicks: jolts.map((j) => joltKick.get(j)!), pieces: pieces.length, earthPieces: pieces.filter((p) => p.earth).length, stones: stones.length, earthStones: stones.filter((s) => s.tones !== STONE_TONES).length, hidden: true });
  return m;
}
