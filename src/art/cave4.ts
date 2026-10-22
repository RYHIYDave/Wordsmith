// FLOOR 4'S WAY DOWN: THE WALL GIVES WAY TO THE CAVE; AND THE CAVE'S OTHER END, FLOOR 5'S MOUTH (the art chat's,
// 22 Oct 2026). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE; it is behind CAVE4, off.
//
// His words to the main chat, 22 Oct 2026, 11:21 (Pacific): “Level four should end with a wall crumbling down after
// the boss is killed and a cave entrance is exposed.  Then you enter the fleshmancer’s lair.” Asked who draws it, by
// 11:30: “The art chat (Recommended)”; and to the art chat, at 12:04, told the main chat had posted the work: “Go”.
//
// THE SHAPE THE RULES GIVE IT (the main chat's game/ways.ts on its branch exits, behind EXITS): a doorway of three
// tiles cut through a back wall of the amalgamation's hall, its tiles floor with the dark past them; while he lives
// the wall is drawn standing over it; as he dies the rules send { t: 'caveOpens', x, y } (the doorway's middle) and,
// CAVE_OPENING later, walking onto its tiles takes him down. On floor 5 the same doorway shape in a back wall of the
// lair's first room, never walked into: he comes in standing 1.7 tiles inside it.
//
// WHAT HAPPENS (at 30 a second; the frames are the constants below):
//   THE WALL STANDING (`before`): three tiles of the ossuary's skull wall in the hall's back wall, the dead stacked in
//     it as on the rest of the floor (art/floor4.ts, the skull wall), a weight of them behind.
//   THE AMALGAMATION FALLS, AND THE WALL GOES: the stretch shudders, bowing out its whole height, harder and harder,
//     dust spurting from its joints; three skulls pop loose and fall. It bursts (the first jolt): the foot of its
//     middle blown out across the floor, skulls, long bones and lumps of the rock behind thrown out, arcing,
//     bouncing and rolling, and behind them THE DARK: a cave's mouth; a gust of dust and grit blasted out of it. The
//     top of the middle drops after (the second jolt) and breaks on the heap; then its sides give (the third), their
//     tops dropping and breaking (the fourth). Dust rolls out along the floor, hangs, settles and thins.
//   THE CAVE (`after`): a ragged mouth in the rock behind the skull wall, two tiles and more across and taller than
//     the knight, a rim of the stacked dead round it; its floor of earth and rubble going down into the dark, its
//     throat bending away so that its end is never seen; from deep in it, very faint, the Fleshmancer's pink. The
//     rubble lies low on the floor before it, a tile and a half out: walked over, into the mouth.
// THE CAVE'S OTHER END (`lairMouth`): the same mouth in the lair's packed earth and rock (art/lair.ts), its throat
//   climbing away into the dark, a little earth fallen before it.
//
// Shown to him as a film and stills, asked “Is floor 4's end right: the skull wall shaking, bursting and falling back
// into the cave, and floor 5's mouth?”, by 12:51: “Yes, on to the town (Recommended)”.
//
// HOW IT IS PAINTED: everything in the world, in floor 4's own painter in depth (art/floor4.ts, Scene), the dead its
// own skulls and bones and the loose ones on its own falling (stepBodies). The cave behind is painted once, every
// pixel the rock the eye meets along its line of sight through the mouth (its walls a little ragged, lit from the
// upper left, darker the deeper it is), and shows through as the wall's skin breaks from its middle out.
//
// FOR THE GAME, IN TWO LAYERS once open (`CaveArt.under`, `CaveArt.over`): `under` the cave seen through the mouth,
// to lie under whatever stands (as the floor does); `over` the rim, the rubble and the dead lying out on the floor,
// to stand at the wall's face (as a gate's arch does), so that the hero walking into the mouth goes in under its rim.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { DIRT } from './crypt';
import {
  BONE, CAVITY, HEAP_BONE, HEAP_EARTH, PINK, ROCKY, SKULL_WALL, SOFT, Scene, WALL_BONE, axesOf, rot as rotAbout, body, boneEnd, cloud,
  copyBody, dimBone, dirOf, fadeAt, faceWorld, inFaceLight, inFront, letGo, paintBody, paintClouds, skull, skullWallGaps,
  stepBodies, toneAt, wallBonePose, wallSkullPose,
} from './floor4';
import type { Body, Cloud, V3, WallBit } from './floor4';
import { DEEP, PCX, PFOOT, TALL, flat, onFacePx } from './floorkit';
import type { Moment } from './floorkit';
import { TOWARD } from './floor2';
import { GRAIN, blend, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { LAIR, LAIR_ROCK } from './lair';
import { wallFacePixels } from './ground';

/**
 * THE SWITCH: off, nothing of the game uses any of this. ON (the main chat, 22 Oct 2026): his yes in the art chat by 12:51,
 * “Yes, on to the town (Recommended)”; the game draws it only where its rules have a cave, behind EXITS (game/ways.ts).
 */
export const CAVE4 = { on: true };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
const ease = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

// =================================================================================================
// THE MEASURES (the world's picture pixels, KT 40 to a tile along the floor; z up)

/** How many tiles of the wall it takes: the doorway's three. */
export const CAVE_TILES = 3;
/** The frames: how many a second, and how many in all. */
export const CAVE_FPS = 30;
export const CAVE_FRAMES = 126;
/** Its jolts: the burst, the top breaking on the heap, the sides giving, their tops breaking. */
export const CAVE_JOLTS = { burst: 30, drop: 35, break: 41, sides: 48, sideDrop: 52, sideBreak: 58 } as const;
/** When the dust is thin enough over the mouth to see into it, in seconds (the main chat's CAVE_OPENING): its last frame. */
export const CAVE_OPEN_SECS = CAVE_FRAMES / CAVE_FPS;
/**
 * THE MOUTH, in the face's own frame (a along the wall, b out of it toward the room, z up): the skull wall's dead stand
 * in it from its face back to b = -BACK; the mouth opens in the rock behind; its middle `half` across each way, its
 * middle `mid` up and `high` each way up and down, its floor at `floor`; then its throat going on into the rock.
 */
export const MOUTH = { back: 8, half: 46, mid: 24, high: 36, floor: -2 };

// =================================================================================================
// THE ROCK: a little ragged (value noise in the world)

function vnoise(x: number, y: number, z: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const s = (t: number): number => t * t * (3 - 2 * t);
  const u = s(x - xi);
  const v = s(y - yi);
  const w = s(z - zi);
  const h = (i: number, j: number, k: number): number => hash(xi + i + (zi + k) * 7919, yi + j, seed);
  const l = (a: number, b: number, t: number): number => a + (b - a) * t;
  return l(l(l(h(0, 0, 0), h(1, 0, 0), u), l(h(0, 1, 0), h(1, 1, 0), u), v), l(l(h(0, 0, 1), h(1, 0, 1), u), l(h(0, 1, 1), h(1, 1, 1), u), v), w);
}
/** Ragged, about -0.5 to 0.5: big lumps and small. */
function rag(x: number, y: number, z: number, seed: number): number {
  return vnoise(x / 15, y / 15, z / 15, seed) * 0.6 + vnoise(x / 6, y / 6, z / 6, seed + 1) * 0.3 + vnoise(x / 2.6, y / 2.6, z / 2.6, seed + 2) * 0.1 - 0.5;
}

/** Which way the throat goes from the mouth: down into the dark (floor 4), or up out of it (floor 5, seen from below). */
type Way = 'down' | 'up';
/**
 * THE CAVE'S AIR: more than 0 inside it. Past the mouth (b < -BACK), `d` into the rock: its throat narrowing a little
 * and bending away (toward -a), its floor and its middle going down (or up), its walls ragged.
 */
function air(a: number, b: number, z: number, way: Way): number {
  const d = Math.max(0, -b - MOUTH.back);
  const sgn = way === 'down' ? -1 : 1;
  const bend = -0.0016 * Math.max(0, d - LANDING) ** 2;
  const n = rag(a, b, z, 31) * 9;
  // (an arch: its sides near upright from its floor to where it springs, then rounded over; narrowing a little as it goes;
  // a landing of earth a tile in, then its throat going down (or up) into the dark)
  const ra = MOUTH.half - 0.08 * d + n;
  const rz = MOUTH.high - 0.04 * d + n * 0.5;
  const fall = floorFall(d, way);
  const spring = MOUTH.mid + sgn * Math.max(0, fall - 2);
  const fz = MOUTH.floor + sgn * fall + rag(a, b, 0, 37) * 3;
  const e = 1 - (Math.abs(a - bend) / ra) ** 3 - (Math.max(0, z - spring) / rz) ** 2;
  return Math.min(e, (z - fz) / 8);
}
/** How far the throat's floor has gone down (or up) `d` past the mouth: little over its landing, then steeply. */
function floorFall(d: number, way: Way): number {
  const steep = way === 'down' ? 0.62 : 0.38;
  return d < LANDING ? 0.07 * d : 0.07 * LANDING + steep * (d - LANDING);
}
/** How far in the landing reaches past the mouth, before the throat goes down: the doorway's own tile. */
const LANDING = 30;
/** Whether (a, z) on the back of the skull wall (b = -BACK) is in the mouth, and by how much. */
const inMouth = (a: number, z: number, way: Way = 'down'): number => air(a, -MOUTH.back, z, way);
/** Whether (a, z) on the back of the wall is in the band of rough rock round the mouth, where the dead have come away: ragged, and not out at the stretch's ends nor up in the dark. */
const inRim = (a: number, z: number, way: Way = 'down'): boolean => {
  const m = inMouth(a, z, way);
  return m <= 0 && m > -0.62 + rag(a, 0, z, 59) * 0.5 && Math.abs(a) < 54 && z < 64;
};

/** The darkness of the throat with depth: [how deep, how dark] (as the stairwell's own five steps toward its dark). */
const DEPTHS: ReadonlyArray<readonly [number, number]> = [[16, 0], [30, 0.12], [46, 0.36], [66, 0.58], [92, 0.76], [130, 0.9], [Infinity, 0.96]];
const darkAt = (d: number): number => {
  for (const [q, k] of DEPTHS) if (d < q) return k;
  return 0.96;
};

/** The look of a cave: its rock, its earth (the floor), the dead or stones lying on its floor near the mouth, and a glow from far down it. */
interface CaveLook {
  way: Way;
  /** Whether the rough rock shows round the mouth (where a wall's facing has come away). */
  rim: boolean;
  rock: Ramp;
  earth: Ramp;
  bits: Ramp;
  glow: string | null;
}
const EARTH_R: Ramp = [DIRT[0], DIRT[0], DIRT[1], DIRT[3], DIRT[3]];
const FLOOR4_CAVE: CaveLook = { way: 'down', rim: true, rock: ROCKY, earth: EARTH_R, bits: HEAP_BONE, glow: PINK[1] };
const LAIR_ROCKS: Ramp = [LAIR_ROCK[0], LAIR_ROCK[0], LAIR_ROCK[1], LAIR_ROCK[2], LAIR_ROCK[3]];
const LAIR_CAVE: CaveLook = { way: 'up', rim: false, rock: LAIR_ROCKS, earth: EARTH_R, bits: LAIR_ROCKS, glow: null };

/** A picture of the cave as the eye sees it through the mouth: for each pixel, its colour, how near the eye it is, how high, and where its line of sight meets the back of the wall (a, z). */
interface CaveLayer {
  w: number;
  h: number;
  col: (string | null)[];
  depth: Float32Array;
  hz: Float32Array;
  a8: Float32Array;
  z8: Float32Array;
}

/**
 * PAINT THE CAVE once: through every pixel whose line of sight meets the back of the wall in the mouth, along that line
 * into the rock until it meets the cave's wall, floor or roof (or the dark, far down); lit from the upper left as the
 * face it is in is (`alongX`), darker the deeper it is.
 */
function caveLayer(S0: Scene, alongX: boolean, look: CaveLook): CaveLayer {
  const { w, h } = S0.p;
  const out: CaveLayer = { w, h, col: new Array(w * h).fill(null), depth: new Float32Array(w * h), hz: new Float32Array(w * h), a8: new Float32Array(w * h), z8: new Float32Array(w * h) };
  // (a point of the world in the face's frame, and back: along x the world's own; along y, a = -y, b = x)
  const toFace = (p: V3): V3 => (alongX ? p : [-p[1], p[0], p[2]]);
  const toWorldN = (n: V3): V3 => (alongX ? n : [n[1], -n[0], n[2]]);
  const eye: V3 = toFace([1, 1, 0.8]);
  const A = (p: V3): number => air(p[0], p[1], p[2], look.way);
  inFaceLight(alongX, 1, () => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const r0 = toFace(S0.ray(x, y));
        // (where the line meets the back of the wall: b = -BACK)
        const t8 = -MOUTH.back - r0[1];
        const p8 = add(r0, mul(eye, t8));
        if (A(p8) <= 0) {
          // (round the mouth, where the dead in the wall have come away: the rock they were stacked against, rough)
          if (!look.rim || !inRim(p8[0], p8[2], look.way)) continue;
          const i = y * w + x;
          const q = 2;
          const bump = (a: number, z: number): number => rag(a, -MOUTH.back, z, 53) * 7;
          const n = norm([-(bump(p8[0] + q, p8[2]) - bump(p8[0] - q, p8[2])) / (2 * q), 1, -(bump(p8[0], p8[2] + q) - bump(p8[0], p8[2] - q)) / (2 * q) + 0.15]);
          let c = toneAt(toWorldN(n), look.rock, -0.08);
          if (hash(Math.floor(p8[0] / 4), Math.floor(p8[2] / 4), 857) < 0.1) c = look.rock[0];
          c = alongX ? c : mix(c, '#06051a', 0.32);
          out.col[i] = c;
          const hit = add(p8, [0, bump(p8[0], p8[2]) * 0.3, 0]);
          const wW = alongX ? hit : ([hit[1], -hit[0], hit[2]] as V3);
          out.depth[i] = wW[0] * TOWARD[0] + wW[1] * TOWARD[1] + wW[2] * TOWARD[2];
          out.hz[i] = hit[2];
          out.a8[i] = p8[0];
          out.z8[i] = p8[2];
          continue;
        }
        // (on into the rock, away from the eye, until it meets the rock)
        let t = t8;
        let hit: V3 | null = null;
        for (let k = 0; k < 700; k++) {
          t -= 0.5;
          const p = add(r0, mul(eye, t));
          if (A(p) <= 0) {
            // (closer in on where it meets it)
            let lo = t;
            let hi = t + 0.5;
            for (let q = 0; q < 5; q++) {
              const m = (lo + hi) / 2;
              if (A(add(r0, mul(eye, m))) <= 0) lo = m;
              else hi = m;
            }
            hit = add(r0, mul(eye, hi));
            break;
          }
          if (-p[1] > 330) break;
        }
        const i = y * w + x;
        out.a8[i] = p8[0];
        out.z8[i] = p8[2];
        if (!hit) {
          out.col[i] = DEEP;
          out.depth[i] = -1e6;
          out.hz[i] = 0;
          continue;
        }
        // (its face: which way the rock is turned, from how the air changes about it)
        const e = 0.6;
        const n = norm([
          A([hit[0] + e, hit[1], hit[2]]) - A([hit[0] - e, hit[1], hit[2]]),
          A([hit[0], hit[1] + e, hit[2]]) - A([hit[0], hit[1] - e, hit[2]]),
          A([hit[0], hit[1], hit[2] + e]) - A([hit[0], hit[1], hit[2] - e]),
        ]);
        const d = -hit[1] - MOUTH.back;
        const floor = n[2] > 0.55;
        const nW = toWorldN(n);
        // (the floor's earth, stones and the odd scrap of the dead in it near the mouth; the walls' rock)
        let c = floor ? toneAt(nW, look.earth, 0.05) : toneAt(nW, look.rock, -0.02);
        // (in a face turned to screen-right, the whole a shade darker, as the face is: Places 4)
        const dim = (q: string): string => (alongX ? q : mix(q, '#06051a', 0.32));
        if (floor && d < 46 && hash(Math.floor(hit[0] / 3), Math.floor(hit[1] / 3), 811) < 0.13) c = toneAt(nW, look.bits, 0.1);
        if (!floor && hash(Math.floor(hit[0] / 4), Math.floor(hit[2] / 4) + Math.floor(hit[1] / 4) * 31, 812) < 0.08) c = look.rock[0];
        c = mix(dim(c), DEEP, look.way === 'up' ? Math.min(0.96, darkAt(d) + 0.22 + 0.004 * d) : darkAt(d));
        // (from far down the throat, very faint, the Fleshmancer's pink on what it lights)
        if (look.glow && d > 80) c = mix(c, look.glow, 0.32 * clamp01((d - 80) / 60));
        out.col[i] = c;
        const wW = alongX ? hit : ([hit[1], -hit[0], hit[2]] as V3);
        out.depth[i] = wW[0] * TOWARD[0] + wW[1] * TOWARD[1] + wW[2] * TOWARD[2];
        out.hz[i] = hit[2];
      }
    }
  });
  return out;
}

// =================================================================================================
// THE WALL'S DEAD: the skull wall's, three tiles of it

/** A bit of the stretch: which of the skull wall's, on which of its three tiles (-1, 0, 1), and where it is (a along the stretch). */
interface Bit {
  s: WallBit;
  i: number;
  tile: number;
  id: number;
  a: number;
}
const BITS: readonly Bit[] = (() => {
  const out: Bit[] = [];
  for (const tile of [-1, 0, 1]) SKULL_WALL.forEach((s, i) => out.push({ s: { ...s, a: s.a + tile * 40 }, i, tile, id: 1000 + (tile + 1) * 300 + i, a: s.a + tile * 40 }));
  return out;
})();
/** Whether a bit of the wall comes down: all in the mouth and about it, a few more at its rim; none out at the stretch's ends nor high in the dark. */
function falls(b: Bit): boolean {
  const m = inMouth(b.a, b.s.z) + b.s.r / 40;
  if (m > -0.12) return true;
  // (round the mouth, the rock showing: most of what was stacked against it comes away)
  if (inRim(b.a, b.s.z) && hash(b.i + b.tile * 97, 1, 821) < 0.85) return true;
  if (m > -0.75 && hash(b.i + b.tile * 97, 2, 821) < 0.25) return true;
  return false;
}

// =================================================================================================
// THE FILM

/** What the film gives, for one face: its frames, the wall standing before, and the cave after in its two layers. */
export interface CaveFilm {
  frames: Sprite[];
  before: Sprite;
  /** The cave once open, whole (its last frame); and in its two layers, for the game: under what stands, and at the wall's face. */
  after: Sprite;
  under: Sprite;
  over: Sprite;
  jolts: number[];
  /** Where the anchor is in the frames' picture (picture pixels): the foot of the face under the middle of the stretch. */
  ax: number;
  ay: number;
}

const MW = 400;
const MH = 300;

/**
 * THE WALL GIVES WAY TO THE CAVE, in a face turned to screen-left (`alongX`: the wall runs along x, the room toward +y)
 * or to screen-right; anchored at the foot of the face under the middle of the doorway's middle tile, as a wall piece is.
 */
function wallGives(alongX: boolean): CaveFilm {
  const { burst: BURST, drop: DROP, break: BREAK, sides: SIDES, sideDrop: SIDE_DROP, sideBreak: SIDE_BREAK } = CAVE_JOLTS;
  const N = CAVE_FRAMES;
  const BULGE0 = 2;
  const POPS = [12, 17, 22];
  /** How high the foot of it is, that bursts out into the hall: above it, all falls in, into the dark. */
  const FOOT = 17;
  // (what bursts out goes toward the eye: down the screen and to the left, or to the right)
  const ax = alongX ? 230 : 170;
  const ay = 168;
  const W0 = faceWorld(alongX);
  const toW = dirOf(W0);
  const keepWall = inFront(alongX);
  /** The middle of the stretch or its sides: the middle first. */
  const segOf = (a: number): 0 | 1 => (Math.abs(a) < 24 ? 0 : 1);
  /** How hard the wall shudders at (a, z): most at its middle, the whole of its height, the whole stretch. */
  const prof = (a: number, z: number): number => Math.max(0, 1 - (a / 66) ** 2 - ((z - 34) / 52) ** 2);
  /** When the wall over each place of the mouth gives: its middle's foot first, its middle's top falling in after, its sides after that; ragged. */
  const breakAt = (a: number, z: number): number => {
    const seg = segOf(a);
    const foot = z < 31;
    const j = Math.round((hash(Math.floor(a / 5), Math.floor(z / 5), 840) - 0.5) * 4);
    if (seg === 0) return (foot ? BURST + Math.round(Math.hypot(a / 24, (z - 10) / 22) * 2) : DROP + 2) + j;
    return (foot ? SIDES + 1 : SIDE_DROP + 2 + (a < 0 ? 0 : 2)) + j;
  };

  // THE LOOSE ONES: the dead that come down, and lumps of the rock that skinned the mouth. Those of its foot burst OUT
  // into the hall; the rest fall IN, back into the cave, and tumble away down its throat into the dark.
  interface Loose { bit: Bit | null; go: number; into: boolean; body: Body; pop: boolean; ramp: Ramp }
  const loose: Loose[] = [];
  const popPick = BITS.filter((b) => b.s.kind === 'skull' && !b.s.back && Math.abs(b.a) < 18 && b.s.z > 25 && b.s.z < 60 && falls(b)).slice(0, POPS.length);
  for (const bit of BITS) {
    if (!falls(bit)) continue;
    const s = bit.s;
    const pop = popPick.indexOf(bit);
    const out = pop >= 0 || (!s.back && s.z < FOOT);
    const go = pop >= 0 ? POPS[pop] : out ? (segOf(bit.a) === 0 ? BURST + Math.round(Math.abs(bit.a) / 12) : SIDES + Math.round(hash(bit.i, bit.tile + 3, 660) * 3)) : breakAt(bit.a, s.z);
    let b: Body;
    if (s.kind === 'skull') {
      const q = wallSkullPose(s, alongX);
      b = body('skull', q.c, s.r, 0, q.F, q.U);
    } else {
      const q = wallBonePose(s);
      b = body('bone', add(q.e, mul(q.d, q.len / 2)), s.r, q.len, q.d);
    }
    loose.push({ bit, go, into: !out, body: b, pop: pop >= 0, ramp: s.back ? dimBone : WALL_BONE });
  }
  for (let k = 0; k < 30; k++) {
    const a = (hash(k, 1, 830) - 0.5) * 2 * (MOUTH.half - 6);
    const z = 3 + hash(k, 2, 830) * 52;
    if (inMouth(a, z) < 0.15) continue;
    const out = z < 12 && k % 2 === 0;
    const go = out ? (segOf(a) === 0 ? BURST + 1 : SIDES + 1) : breakAt(a, z);
    loose.push({ bit: null, go, into: !out, body: body('ore', [a, out ? 3 : -4, z], 2.6 + hash(k, 3, 830) * 2.6), pop: false, ramp: ROCKY });
  }
  /** A bit still in the wall, frame `f`: its shudder, harder and harder, as the hall shakes with his fall; leaning a little out, then back. */
  const shake = (bit: Bit, f: number): V3 => {
    if (f < BULGE0) return [0, 0, 0];
    const s = bit.s;
    const t = clamp01((f - BULGE0) / (BURST - BULGE0));
    const k = prof(bit.a, s.z) * (s.back ? 0.4 : 1);
    const amp = (0.25 + 1.6 * t * t) * k * (f > SIDE_DROP + 4 ? 0.15 : f > BURST ? 0.6 : 1);
    const j = (q: number): number => (hash(bit.i * 7 + bit.tile * 1301 + f, q, 661) - 0.5) * 2;
    return [j(1) * amp, 2.6 * t * k + j(2) * amp * 0.6, j(3) * amp * 0.7 - 1.6 * t * t * k];
  };
  // THE RUBBLE IN THE HALL: what burst out lies low before the mouth, a tile out: walked over, into it
  const CONE = { a: 62, b: 34, h: 6 };
  const coneG = (f: number): number => 0.6 * ease((f - BURST) / 18) + 0.4 * ease((f - SIDES) / 18);
  const coneR = (f: number): [number, number, number] => {
    const g = coneG(f);
    return [CONE.a * (0.45 + 0.55 * g), CONE.b * (0.35 + 0.65 * g), CONE.h * g];
  };
  const groundAt = (f: number) => (a: number, b: number): number => {
    const [ra, rb, h] = coneR(f);
    if (h <= 0) return 0;
    return h * Math.sqrt(Math.max(0, 1 - (a / ra) ** 2 - (Math.max(0, b) / rb) ** 2)) ** 1.4;
  };
  const PILE: { b: Body; ramp: Ramp }[] = [];
  for (let k = 0; k < 16; k++) {
    const t = Math.sqrt((k + 0.5) / 16);
    const ang = k * 2.4;
    const a = Math.cos(ang) * t * CONE.a * 0.8;
    const b = Math.abs(Math.sin(ang)) * t * CONE.b * 0.7 + 3;
    if (k % 3 === 2) {
      const d = hash(k, 1, 664) * Math.PI;
      PILE.push({ b: body('bone', [a, b, 0], 1.3, 12 + hash(k, 2, 664) * 5, [Math.cos(d), Math.sin(d), 0]), ramp: HEAP_BONE });
    } else if (k % 3 === 1) PILE.push({ b: body('ore', [a, b, 0], 2.2 + hash(k, 5, 664) * 1.8), ramp: ROCKY });
    else {
      const t2 = (hash(k, 3, 664) - 0.5) * 1.4;
      PILE.push({ b: body('skull', [a, b, 0], 3.9 + hash(k, 4, 664) * 0.4, 0, norm([Math.sin(t2) + (alongX ? 0.4 : -0.4), Math.cos(t2), 0.3]), [0, 0, 1]), ramp: HEAP_BONE });
    }
  }
  const pileAt = (q: Body, f: number): V3 => {
    const sH = groundAt(f)(q.p[0], q.p[1]);
    const reach = q.kind === 'bone' ? q.r : q.r * 0.9;
    return [q.p[0], q.p[1], sH - reach * 1.25 + Math.min(sH, reach * 1.6)];
  };
  /** The cave's floor under (a, b): the mouth's, then going down its throat (as `air` has it, without its rag). */
  const caveFloor = (b: number): number => MOUTH.floor - floorFall(Math.max(0, -b - MOUTH.back), 'down');
  /** How far into the throat a thing is, past the mouth. */
  const into = (b: number): number => Math.max(0, -b - MOUTH.back);
  /** One frame of what falls in: down, onto the throat's floor, bouncing and sliding on away down it, into the dark. */
  const stepIn = (b: Body): void => {
    if (b.still) return;
    b.v = [b.v[0], b.v[1], b.v[2] - 1.0];
    b.p = add(b.p, b.v);
    if (b.spin) {
      b.F = norm(rotAbout(b.F, b.axis, b.spin));
      b.U = norm(rotAbout(b.U, b.axis, b.spin));
    }
    const long = b.kind === 'bone' || b.kind === 'splinter';
    const low = long ? b.r + Math.abs(b.F[2]) * b.len * 0.5 : b.r * 0.9;
    const d = into(b.p[1]);
    const g = caveFloor(b.p[1]);
    if (b.p[2] - low < g) {
      b.p = [b.p[0], b.p[1], g + low];
      const hard = b.v[2] < -2;
      if (d < LANDING) {
        // (on the landing: it skids and comes to rest, or goes on over its edge)
        b.v = [b.v[0] * 0.9, b.v[1] * 0.92, hard ? -b.v[2] * 0.3 : 0];
        b.spin *= 0.8;
        if (long) b.F = norm([b.F[0], b.F[1], 0]);
        if (!hard && Math.hypot(b.v[0], b.v[1]) < 0.2) {
          b.still = true;
          b.v = [0, 0, 0];
          b.spin = 0;
        }
      } else b.v = [b.v[0] * 0.85, Math.min(b.v[1] * 0.9, -0.5) - 0.45, hard ? -b.v[2] * 0.3 : 0];
    }
    // (its throat's walls turn it back in)
    const lim = MOUTH.half - 8 - 0.08 * d;
    if (Math.abs(b.p[0]) > lim) {
      b.p = [Math.sign(b.p[0]) * lim, b.p[1], b.p[2]];
      b.v = [-b.v[0] * 0.4, b.v[1], b.v[2]];
    }
    if (d > 150) b.still = true;
  };
  // THE RUN, frame by frame
  const bodies = loose.map((L) => copyBody(L.body));
  const outs = bodies.filter((_, k) => !loose[k].into);
  const states: Body[][] = [];
  for (let f = 0; f < N; f++) {
    loose.forEach((L, k) => {
      const b = bodies[k];
      if (b.free || f < L.go) return;
      const seed = L.bit ? L.bit.id : 5000 + k;
      const r = (q: number): number => hash(seed, q, 662) - 0.5;
      const a0 = L.bit ? L.bit.a : L.body.p[0];
      const z0 = L.bit ? L.bit.s.z : L.body.p[2];
      if (L.bit) b.p = add(L.body.p, shake(L.bit, f - 1));
      let v: V3;
      if (L.into) v = [r(1) * 0.8, -(1.8 + (r(2) + 0.5) * 2.6), 0.2 + (r(3) + 0.5) * 1.1];
      else if (L.pop) v = [r(1) * 1.2, 2.2 + r(2), 1.6 + r(3)];
      else {
        // (the foot bursts out: hardest at its middle, low and out)
        const w = 1 - clamp01(Math.hypot(a0 / 30, (z0 - 6) / 16));
        v = [a0 * 0.04 + r(1) * 1.6, 2.6 + 2.6 * w + r(2) * 1.2, 1.4 + 1.6 * w + r(3) * 0.8];
      }
      letGo(b, v, seed, b.kind === 'skull' ? 0.22 : b.kind === 'ore' ? 0.3 : 0.34);
      if (b.kind === 'skull' && !L.into) b.rest = norm([(alongX ? 0.45 : -0.45) + r(9) * 1.1, 1, 0.12]);
    });
    if (f > 0) {
      stepBodies(outs, f, TALL, 0.92, groundAt(f), (a, b) => b < 64 && Math.abs(a) < 96);
      loose.forEach((L, k) => L.into && bodies[k].free && stepIn(bodies[k]));
    }
    // (the last second: what still creeps or rocks in the hall is brought to rest)
    if (f > N - 30) {
      for (const b of outs) {
        if (!b.free || b.still) continue;
        if (!b.ground && Math.hypot(b.v[0], b.v[1], b.v[2]) > 0.9) continue;
        b.v = [b.v[0] * 0.6, b.v[1] * 0.6, b.ground ? 0 : b.v[2] * 0.6];
        b.spin *= 0.6;
        if (Math.hypot(b.v[0], b.v[1], b.v[2]) < 0.12 || f > N - 6) {
          b.still = true;
          b.v = [0, 0, 0];
          b.spin = 0;
        }
      }
    }
    states.push(bodies.map((b, k) => (b.free || !loose[k].bit ? copyBody(b) : { ...copyBody(b), p: add(loose[k].body.p, shake(loose[k].bit!, f)) })));
  }
  const last = states[N - 1];
  const moving = last.filter((b, k) => b.free && !b.still && !(loose[k].into && into(b.p[1]) > LANDING + 20));
  if (moving.length) throw new Error(`the cave's wall (${alongX ? 'left' : 'right'}): something is still moving at the end: ` + moving.map((b) => `${b.kind} ${b.p.map((q) => q.toFixed(1))} v ${b.v.map((q) => q.toFixed(2))}`).join('; '));

  // THE DUST
  const clouds: Cloud[] = [];
  const at = (a: number, b: number, z: number): V3 => [a, b, z];
  // spurting from the joints as it shudders, and from where a skull pops
  for (const [f0, a, z] of [[6, -14, 44], [9, 22, 24], [13, -30, 30], [16, 8, 54], [20, -4, 18], [24, 34, 38], [27, -40, 22]] as const) clouds.push(cloud(f0, at(a, 2, z), [a * 0.02, 1.1, 0.2], 3.4, f0, 30, 6, 8));
  popPick.forEach((b, k) => clouds.push(cloud(POPS[k], at(b.a, 2, b.s.z), [0, 1, 0], 3, 50 + k, 30, 6, 8)));
  // THE CAVE'S BREATH: as each part falls in, a gust of dust and grit blown back out of the dark, rolling out over the floor
  for (const [f0, a, z, R, vb, seed] of [[BURST, 0, 14, 14, 3.0, 61], [BURST + 2, -20, 10, 10, 2.6, 62], [BURST + 2, 22, 12, 10, 2.6, 63], [BREAK, 0, 22, 15, 3.2, 64], [BREAK + 2, -10, 40, 11, 2.0, 65], [SIDES + 1, -34, 12, 11, 2.6, 66], [SIDES + 1, 34, 12, 11, 2.6, 67], [SIDE_BREAK, -24, 24, 12, 2.8, 68], [SIDE_BREAK + 2, 24, 24, 12, 2.8, 69]] as const) {
    clouds.push(cloud(f0, at(a, 5, z), [a * 0.05, vb, 0.45], R, seed, N - 1 - f0 - (seed % 3) * 3, 16, 20));
  }
  // (and over its top as each part falls in, a plume)
  for (const [f0, a, seed] of [[DROP + 2, 0, 71], [SIDE_DROP + 2, -34, 72], [SIDE_DROP + 4, 34, 73]] as const) clouds.push(cloud(f0, at(a, 3, 64), [a * 0.03, 0.8, 0.8], 8, seed, N - 1 - f0 - 4, 16, 20));
  outs.forEach((b) => {
    const k = bodies.indexOf(b);
    const st = b.struck.find((q) => q.vz < -3.4);
    if (st && st.f < N - 40) clouds.push(cloud(st.f, [states[st.f][k].p[0], states[st.f][k].p[1], 1], [0, 0.4, 0.2], 3, 200 + k, 30, 5, 8));
  });

  // THE CAVE behind, painted once
  const cave = caveLayer(new Scene(new Px(MW, MH), ax, ay), alongX, FLOOR4_CAVE);
  const caveFrom = new Int16Array(MW * MH).fill(32767);
  for (let i = 0; i < MW * MH; i++) if (cave.col[i]) caveFrom[i] = breakAt(cave.a8[i], cave.z8[i]);

  // the wall's own dark between the dead, three tiles of it (the skull wall's own)
  const gaps = new Px(MW, MH);
  for (const tile of [-1, 0, 1]) {
    const g = flat();
    skullWallGaps(g);
    gaps.blit(onFacePx(g, alongX), ax - PCX + tile * 32, ay - PFOOT + (alongX ? tile * 16 : -tile * 16));
  }

  const looseOf = new Map<Bit, number>();
  const looseById = new Map<number, number>();
  loose.forEach((L, k) => {
    if (!L.bit) return;
    looseOf.set(L.bit, k);
    looseById.set(L.bit.id, k);
  });
  /** A ramp gone dark as far down the throat as a thing has fallen. */
  const darkened = (r: Ramp, b: number): Ramp => {
    const k = darkAt(into(b));
    return [mix(r[0], DEEP, k), mix(r[1], DEEP, k), mix(r[2], DEEP, k), mix(r[3], DEEP, k), mix(r[4], DEEP, k)];
  };
  const IN_ID = 6000;
  const paint = (f: number, layer: 'all' | 'under' | 'over' = 'all'): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    const inIds = new Set<number>();
    if (layer !== 'under') {
      // the rubble before the mouth, low: the grit of the fall, packed, stones and the dead in it
      const [ra, rb, h] = coneR(f);
      if (h > 0.6) {
        const [A, B, U] = axesOf(W0);
        S.egg(W0(0, 0, 0), [A, B, U], [ra, rb, h], (n, w) => {
          const g = hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3) + Math.floor(w[2] / 3) * 13, 663);
          return g < 0.14 ? DIRT[0] : toneAt(n, HEAP_EARTH, -0.05);
        }, 900, keepWall);
        PILE.forEach((q, k) => {
          const p = pileAt(q.b, f);
          if (p[2] < -q.b.r) return;
          paintBody(S, { ...q.b, p }, q.ramp, 910 + k, W0, keepWall);
        });
      }
      for (const bit of BITS) {
        const s = bit.s;
        const k = looseOf.get(bit);
        const ramp = s.back ? dimBone : WALL_BONE;
        if (k === undefined || !states[f][k].free) {
          // (still in the wall: shuddering with it; once the mouth is open, the dead further in round its rim darken into it)
          const o = shake(bit, f);
          const Wb = (a: number, bb: number, z: number): V3 => W0(a + o[0], bb + o[1], z + o[2]);
          const rim = s.back && inMouth(bit.a, s.z) > -0.45 ? ease((f - BURST) / 10) : 0;
          const rampNow = rim > 0 ? blend(ramp, CAVITY, rim * 0.6) : ramp;
          inFaceLight(alongX, 1, () => {
            if (s.kind === 'skull') {
              const q = wallSkullPose(s, alongX);
              skull(S, { c: Wb(q.c[0], q.c[1], q.c[2]), F: toW(q.F), U: toW(q.U), R: s.r, jaw: null }, rampNow, bit.id, s.back ? undefined : keepWall);
            } else boneEnd(S, Wb, s, rampNow, bit.id, s.back ? undefined : keepWall);
          });
          continue;
        }
        const b = states[f][k];
        if (loose[k].into) continue;
        const inWall = clamp01(1 - (b.p[1] - 5) / 14);
        inFaceLight(alongX, inWall, () => paintBody(S, b, blend(ramp, BONE, 1 - inWall), bit.id, W0, (w: V3): boolean => (alongX ? w[1] : w[0]) >= -9));
      }
      // the lumps of rock thrown out
      loose.forEach((L, k) => {
        if (L.bit || L.into) return;
        const b = states[f][k];
        if (!b.free) return;
        inFaceLight(alongX, clamp01(1 - (b.p[1] - 5) / 14), () => paintBody(S, b, L.ramp, IN_ID + k, W0, (w: V3): boolean => (alongX ? w[1] : w[0]) >= -9));
      });
    }
    // WHAT FELL IN: tumbling away down the throat, darker the further it goes, or lying on the landing (in the layer under)
    if (layer !== 'over') {
      loose.forEach((L, k) => {
        if (!L.into) return;
        const b = states[f][k];
        if (!b.free || into(b.p[1]) > 140) return;
        const id = L.bit ? L.bit.id : IN_ID + k;
        inIds.add(id);
        inFaceLight(alongX, 1, () => paintBody(S, b, darkened(L.ramp, b.p[1]), id, W0));
      });
    }
    // what fell in shows only through the mouth where it is open
    if (inIds.size) {
      for (let i = 0; i < S.id.length; i++) {
        if (!inIds.has(S.id[i])) continue;
        if (cave.col[i] && caveFrom[i] <= f) continue;
        S.id[i] = -1;
        S.z[i] = -Infinity;
        S.p.erase(i % MW, Math.floor(i / MW));
      }
    }
    // the cave, where the wall over it has given
    if (layer !== 'over') {
      for (let i = 0; i < MW * MH; i++) {
        const c = cave.col[i];
        if (!c || caveFrom[i] > f) continue;
        S.put(i % MW, Math.floor(i / MW), cave.depth[i], c, 800, cave.hz[i]);
      }
    }
    if (layer === 'all') paintClouds(S, clouds, f, W0);
    // (nothing of the wall out past the stretch's ends while it is in it)
    for (let i = 0; i < S.id.length; i++) {
      const id = S.id[i];
      if (id < 1000 || id >= 3000) continue;
      const u = (i % MW) - ax;
      if (u >= -47 && u <= 46) continue;
      const k = looseById.get(id) ?? -1;
      if (!(k >= 0 && states[f][k].free)) {
        S.id[i] = -1;
        S.p.erase(i % MW, Math.floor(i / MW));
      }
    }
    S.seams();
    for (let i = 0; i < S.id.length; i++) {
      if (S.id[i] < 0 || S.id[i] === 800 || S.id[i] >= SOFT || inIds.has(S.id[i])) continue;
      const x = i % MW;
      const y = Math.floor(i / MW);
      S.p.set(x, y, fadeAt(S.p.get(x, y)!, S.hz[i]));
    }
    // the wall's own dark between the dead, where it has not given (none of it in the layer under)
    let base: Px | null = null;
    if (layer !== 'under') {
      base = new Px(MW, MH);
      for (let i = 0; i < MW * MH; i++) {
        const x = i % MW;
        const y = Math.floor(i / MW);
        const c = gaps.get(x, y);
        if (!c) continue;
        if (cave.col[i] && caveFrom[i] <= f) continue;
        base.set(x, y, c);
      }
    }
    return compose(base, [S.p], null).sprite(ax, ay, GRAIN);
  };
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) frames.push(paint(f));
  return {
    frames,
    before: frames[0],
    after: frames[N - 1],
    under: paint(N - 1, 'under'),
    over: paint(N - 1, 'over'),
    jolts: [BURST, BREAK, SIDES, SIDE_BREAK],
    ax: ax / GRAIN,
    ay: ay / GRAIN,
  };
}

const films = new Map<boolean, CaveFilm>();
/** The wall giving way to the cave, in a face turned to screen-left (`alongX`) or to screen-right; made the first time it is asked for and kept. */
export function caveFilm(alongX: boolean): CaveFilm {
  let f = films.get(alongX);
  if (!f) films.set(alongX, (f = wallGives(alongX)));
  return f;
}
/** As one of the floor's moments (art/films.ts plays them): the face turned to screen-left, and `right` the other. */
export function caveMoment(): Moment {
  const l = caveFilm(true);
  const r = caveFilm(false);
  return { name: 'the wall gives way to the cave', frames: l.frames, fps: CAVE_FPS, before: [l.before], after: [l.after], tracks: [], jolts: l.jolts, holds: [], right: { frames: r.frames, before: [r.before], after: [r.after], tracks: [] } };
}

// =================================================================================================
// THE CAVE'S OTHER END: FLOOR 5'S MOUTH, in the lair's earth and rock

/** Floor 5's mouth, in a face turned to screen-left or to screen-right: the cave in the lair's rock, its throat climbing away; a rim of its packed earth and stones round it, a little fallen before it. */
export interface MouthArt {
  under: Sprite;
  over: Sprite;
  whole: Sprite;
  ax: number;
  ay: number;
}
function lairMouthOf(alongX: boolean): MouthArt {
  const ax = alongX ? 230 : 170;
  const ay = 168;
  const W0 = faceWorld(alongX);
  const keepWall = inFront(alongX);
  const cave = caveLayer(new Scene(new Px(MW, MH), ax, ay), alongX, LAIR_CAVE);
  // the lair's own wall, three tiles of its face as the ground paints it, the mouth cut out of it
  const face = new Px(MW, MH);
  for (const j of [-1, 0, 1]) {
    const w = wallFacePixels(LAIR, j + 1, alongX ? 'left' : 'right');
    // (the tile's top corner, from the anchor: the foot of the face under the middle of the middle tile)
    const tx = alongX ? ax + 16 + 32 * j : ax - 16 - 32 * j;
    const ty = ay - 24 + 16 * j;
    face.blit(w.p, tx - w.ax, ty - w.ay);
  }
  for (let i = 0; i < MW * MH; i++) if (cave.col[i]) face.erase(i % MW, Math.floor(i / MW));
  const paint = (layer: 'all' | 'under' | 'over'): Sprite => {
    const S = new Scene(new Px(MW, MH), ax, ay);
    if (layer !== 'under') {
      // its rim: lumps of the lair's packed earth and stones broken back round the mouth
      inFaceLight(alongX, 1, () => {
        for (let k = 0; k < 140; k++) {
          const a = (hash(k, 1, 850) - 0.5) * 2 * 58;
          const z = hash(k, 2, 850) * 66;
          const m = inMouth(a, z, 'up');
          if (m > 0.02 || m < -0.28) continue;
          const r = 2.4 + hash(k, 3, 850) * 3;
          S.ball(W0(a, -1 - hash(k, 4, 850) * 5, z), r, LAIR_ROCKS, 4000 + k, keepWall, -0.05);
        }
      });
      // a little earth and a few stones fallen before it
      const [A, B, U] = axesOf(W0);
      S.egg(W0(0, 0, 0), [A, B, U], [52, 20, 4], (n, w) => (hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 851) < 0.15 ? DIRT[0] : toneAt(n, HEAP_EARTH, -0.05)), 900, keepWall);
      for (let k = 0; k < 9; k++) {
        const a = (hash(k, 5, 850) - 0.5) * 80;
        const b = 3 + hash(k, 6, 850) * 16;
        const r = 2 + hash(k, 7, 850) * 2.5;
        S.ball(W0(a, b, r * 0.8 + 2), r, LAIR_ROCKS, 4200 + k, keepWall);
      }
    }
    if (layer !== 'over') for (let i = 0; i < MW * MH; i++) if (cave.col[i]) S.put(i % MW, Math.floor(i / MW), cave.depth[i], cave.col[i]!, 800, cave.hz[i]);
    S.seams();
    for (let i = 0; i < S.id.length; i++) {
      if (S.id[i] < 0 || S.id[i] === 800) continue;
      const x = i % MW;
      const y = Math.floor(i / MW);
      S.p.set(x, y, fadeAt(S.p.get(x, y)!, S.hz[i]));
    }
    return compose(layer === 'under' ? null : face, [S.p], null).sprite(ax, ay, GRAIN);
  };
  return { under: paint('under'), over: paint('over'), whole: paint('all'), ax: ax / GRAIN, ay: ay / GRAIN };
}
const mouths = new Map<boolean, MouthArt>();
/** Floor 5's mouth, the cave's other end, in a face turned to screen-left (`alongX`) or to screen-right. */
export function lairMouth(alongX: boolean): MouthArt {
  let m = mouths.get(alongX);
  if (!m) mouths.set(alongX, (m = lairMouthOf(alongX)));
  return m;
}
