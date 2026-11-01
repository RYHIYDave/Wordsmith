// FLOOR 3'S ENEMIES, MORE ACTION (the art chat's helper, 31 Oct 2026; docs/mockups/action_f3/README.md). A MOCK-UP: NOTHING OF
// THE GAME IMPORTS THIS FILE. What the green troll's rampage leaves on the floor (its shockwave ring), the numbers of his rampage
// and his bull rush for the main chat, and the Boneward's SHIELD WALL (BONEWARD_WALL, off: a Boneward painted as the game's, with
// its shield raised square to you as it comes on, and hits from in front glancing off it).
//
// The owner's review of every enemy for more action, his picks of 31 Oct:
//   THE BRUTE (the green troll, floors 3 to 5): offered "Rampage: two stepping club swings, then a leaping two-fisted slam with a
//     shockwave ring. Bull rush as its second: lowers its head and charges down a marked lane."; his pick “Yes (Recommended)”.
//     His moves are drawn in his own rig (art/monster_brute.ts, BRUTE_RAMPAGE); here, the ring his slam sends out.
//   THE BONEWARD (floors 3 to 5): offered "Keep the spear throw. Shield wall: while it comes at you behind its shield, hits from
//     in front glance off. Get round it, or wait for it to throw."; his pick “Yes (Recommended)”.
// Under his rules: Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”), and for the
// enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate
// for the extra time the player gets to evade”).
//
// Everything on the floor is a picture of a moment (seconds), on a canvas of its own with the floor point it stands on (its
// anchor), in picture pixels (two to a game pixel), as the figures are. Every pixel is whole. Nothing is of the friend's cyan:
// the slam's ring is the floor's own dust and the enemy's pink; the Boneward's glance is white, gold and the enemy's pink.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { INK, MAIL, PINK, hash } from './kit';
import type { Painted } from './kit';
import { FLAME, SOCKET } from './mkit';
import type { Canvas } from './mkit';
import { RAMPAGE_HITS, RAMPAGE_RAISE, RUSH_GO, RUSH_PACE, RUSH_STOP } from './monster_brute';
import { BONEWARD, BW_HIT, BW_PACE, BW_THROW_HIT, TILE3, mobSet } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment } from './new_mobs3';
import type { Stage } from './skin';
import { add, cross, heading, mul, norm } from './skeleton';
import type { Bones, Key3, V3 } from './skeleton';
import { floorPx } from './action_f1_fx';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const FR = 1 / 30;
const TAU = Math.PI * 2;
/** The white of a blow on iron and of the slam's flash: a touch of the enemy's gold in it. */
const WHITE = '#fff8ec';
/** The floor's stone, cracked open; the floor's dust (the troll's own dust, art/monster_brute.ts: MAIL's dull violet). */
const SEAM = '#0b0a11';
const STONE = ['#25222f', '#332f40', '#4a4658'] as const;

/** Which part of a picture that stands up off the floor: what is behind a figure at its middle, what is before it, or all. */
export type Side = 'behind' | 'before' | 'all';
/** Whether a floor point (tiles from the anchor) is on the side asked: before is nearer the camera (lower on the screen). */
const onSide = (fx: number, fy: number, side: Side): boolean => side === 'all' || (fx + fy > 0) === (side === 'before');

// =============================================================================================
// THE GREEN TROLL'S RAMPAGE: ITS NUMBERS, AND THE SHOCKWAVE RING OF ITS SLAM

/**
 * THE RAMPAGE'S NUMBERS (for the main chat; the moves themselves: art/monster_brute.ts rampageTimeline). Seconds from its start.
 *   hits     its three blows: the swing (0.6 s), the backhand (1.167 s), the slam (2.367 s: the clip's `hit`)
 *   reach    a swing strikes a hero within this many tiles of him, in the half of the floor before him (`arc` degrees)
 *   travel   how far the game carries him over the floor (tiles, the way he faces): `rampageTravel(t)`, 2.0 in all (a step in after
 *            each swing, 0.45 each; the leap, 1.1)
 *   raise    from here the club is up over his head (the slam's warning: the ring may be marked on the floor from here, 0.97 s
 *            before the slam)
 */
export const RAMPAGE = { hits: RAMPAGE_HITS, reach: 2.1, arc: 180, travel: 2.0, raise: RAMPAGE_RAISE } as const;
/**
 * THE SLAM'S SHOCKWAVE RING. Times are seconds from the slam.
 *   radius   what it strikes: a hero whose middle is within this many tiles of its middle at the slam (2.5; drawn and tested from
 *            2.25 to 2.75: the main chat may set it)
 *   ahead    its middle: this many tiles before where he lands, the way he faces (where his club comes down)
 *   wave     the ring goes out to its edge over this, and breaks up over `fade` after
 *   long     the cracks it leaves are gone by this
 */
export const RING = { radius: 2.5, ahead: 1.25, wave: 0.2, fade: 0.25, long: 1.6 } as const;
/** Whether a hero `x`, `y` tiles from the ring's middle is struck by the slam. */
export const ringStrikes = (x: number, y: number, radius: number = RING.radius): boolean => Math.hypot(x, y) <= radius;
/** The ring's canvas: up to 2.75 tiles round its middle on the floor, and the dust and chips thrown up over it. Its anchor is the ring's middle. */
export const RING_CANVAS: Canvas = { w: 280, h: 196, ax: 140, ay: 126 };
/** How far out the ring has gone, `t` seconds after the slam (tiles). */
export function ringReach(t: number, radius: number = RING.radius): number {
  if (t < 0) return 0;
  const k = clamp01(t / RING.wave);
  return radius * (1 - (1 - k) * (1 - k) * (1 - k));
}

/** A set of whole pixels: each laid once, the last colour said for it winning. */
function pen(px: Px): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 1 || Y < 1 || X >= px.w - 1 || Y >= px.h - 1) return;
    px.set(X, Y, c);
  };
}
/** A round speck `r` across (whole pixels), its middle at (x, y). */
function blob(dot: (x: number, y: number, c: string) => void, x: number, y: number, r: number, c: string, thin = 0, seed = 0): void {
  for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) {
    for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) {
      if (i * i + j * j > r * r + 0.3) continue;
      if (thin > 0 && hash(Math.round(x) + i, Math.round(y) + j, seed) < thin) continue;
      dot(x + i, y + j, c);
    }
  }
}

/** The cracks the slam opens in the floor: from its middle out, jagged, each its own length (tiles), as lists of floor points. */
function cracksOf(R: number): [number, number][][] {
  const out: [number, number][][] = [];
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU + hash(i, 3, 41) * 0.4;
    const long = R * (0.38 + 0.34 * hash(i, 5, 41));
    const pts: [number, number][] = [];
    let a = a0;
    for (let k = 0; k <= 10; k++) {
      const r = 0.22 + (long - 0.22) * (k / 10);
      a += (hash(i, k, 43) - 0.5) * 0.35;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    out.push(pts);
    // (a branch off the longer ones)
    if (long > R * 0.55) {
      const from = pts[5];
      const b = a0 + (hash(i, 7, 41) > 0.5 ? 0.6 : -0.6);
      const br: [number, number][] = [];
      for (let k = 0; k <= 5; k++) br.push([from[0] + Math.cos(b) * k * 0.09 * R * 0.5, from[1] + Math.sin(b) * k * 0.09 * R * 0.5]);
      out.push(br);
    }
  }
  return out;
}

/**
 * THE SHOCKWAVE RING, `t` seconds after the slam (nothing before it, nothing after RING.long), round its middle (the anchor).
 *   floor   the floor where the club came down: a dent, the cracks it opens (red-hot at their lips at first, then dark, then gone);
 *           and the ring going out over the floor, a band of the floor's dust with the enemy's pink at its leading edge, breaking
 *           up once it has reached its edge
 *   air     the flash of the blow (white and the enemy's pink, a moment); the dust thrown up along the ring as it goes, high near
 *           the middle and lower further out; chips of stone flung up and falling back; and the dust settling over the middle
 * The air layer by halves (`side`), as the figures are sorted: 'behind' before a figure at the ring's middle, 'before' after it.
 */
export function ringPainted(t: number, layer: 'floor' | 'air', radius: number = RING.radius, side: Side = 'all'): Painted {
  const C = RING_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -1e-6 || t > RING.long + 1e-6) return { px, lights };
  const dot = pen(px);
  const at = (x: number, y: number): [number, number] => {
    const [X, Y] = floorPx(x, y);
    return [C.ax + X, C.ay + Y];
  };
  const R = radius;
  const reach = ringReach(t, R);
  /** How much of the ring is left as it breaks up (1 whole, 0 gone). */
  const left = 1 - clamp01((t - RING.wave) / RING.fade);
  const f = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    // the dent where the club came down
    const dent = 1 - clamp01((t - 1.0) / 0.6);
    if (dent > 0) {
      for (let k = 0; k < 40; k++) {
        const a = (k / 40) * TAU;
        const [x, y] = at(Math.cos(a) * 0.26, Math.sin(a) * 0.26);
        if (hash(k, 1, 51) < dent) dot(x, y, STONE[2]);
      }
      for (let j = -6; j <= 6; j++) for (let i = -12; i <= 12; i++) if ((i / 12) ** 2 + (j / 6) ** 2 < 0.55 && hash(i, j, 52) < dent) dot(C.ax + i, C.ay + j, SEAM);
    }
    // the cracks: hot at their lips while the blow is fresh; dark; gone pixel by pixel at the end
    const hot = 1 - clamp01(t / 0.45);
    const gone = clamp01((t - 1.0) / (RING.long - 1.0));
    for (const line of cracksOf(R)) {
      // (the crack runs out with the ring: no further than it has gone)
      for (let k = 1; k < line.length; k++) {
        const [x0, y0] = at(...line[k - 1]);
        const [x1, y1] = at(...line[k]);
        if (Math.hypot(...line[k]) > reach + 0.05) break;
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let j = 0; j <= n; j++) {
          const x = x0 + ((x1 - x0) * j) / n;
          const y = y0 + ((y1 - y0) * j) / n;
          if (hash(Math.round(x), Math.round(y), 53) < gone) continue;
          dot(x, y, SEAM);
          if (k < 4) dot(x, y + 1, SEAM);
          if (hot > 0 && hash(Math.round(x), Math.round(y), 54) < hot * (1 - k / line.length) * 1.6) dot(x, y - 1, k < 3 && hot > 0.5 ? FLAME[3] : PINK[2]);
        }
      }
    }
    // the ring going out over the floor
    if (left > 0 && t <= RING.wave + RING.fade) {
      const band = 0.32 * R;
      const n = Math.round(R * 70);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        for (let b = 0; b < 4; b++) {
          const r = reach - band * (b / 4) * (0.6 + 0.4 * hash(k, b, 55));
          if (r < 0.15) continue;
          const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
          if (hash(k, b + f * 7, 56) > left * (1 - b * 0.18)) continue;
          dot(x, y, b === 0 ? MAIL[3] : MAIL[2]);
        }
        // (its leading edge: the enemy's pink, dotted as the game's warning ring is, while it is going out)
        if (t <= RING.wave + 0.06 && k % 2 === 0) {
          const [x, y] = at(Math.cos(a) * reach, Math.sin(a) * reach);
          dot(x, y, PINK[3]);
        }
      }
    }
    return { px, lights };
  }
  // --- the air ---
  // the flash of the blow
  if (t < 0.1 && side !== 'behind') {
    const k = 1 - t / 0.1;
    const L = 10 + 16 * k;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0.55, -1], [-0.55, -1], [0.8, -0.55], [-0.8, -0.55]] as const) {
      for (let s = 0; s < L * (dy < 0 ? 1.2 : 1); s++) {
        const c = s < L * 0.35 ? WHITE : s < L * 0.7 ? FLAME[4] : PINK[3];
        dot(C.ax + dx * s, C.ay - 2 + dy * s * 0.9, c);
      }
    }
    blob(dot, C.ax, C.ay - 3, 3 + 3 * k, WHITE);
    lights.push({ x: C.ax, y: C.ay - 6, r: 60 + 40 * k, color: SOCKET, a: 0.35 * k });
  }
  // the dust thrown up along the ring as it goes
  if (left > 0 && t <= RING.wave + RING.fade) {
    const n = Math.round(R * 20);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + hash(k, 2, 57) * 0.2;
      const fx = Math.cos(a) * reach;
      const fy = Math.sin(a) * reach;
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      const tall = (4 + 10 * (1 - reach / (R + 0.01))) * (0.7 + 0.6 * hash(k, 3, 57)) * left;
      const r = 2.2 + 1.6 * hash(k, 4, 57);
      for (let s = 0; s < 3; s++) blob(dot, x, y - 1 - (tall * s) / 2.5, r * (1 - s * 0.25), s === 0 ? MAIL[2] : MAIL[3], 1 - left * 0.9, k * 3 + s);
    }
  }
  // chips of stone flung up from the middle, and falling back
  for (let k = 0; k < 14; k++) {
    const life = 0.45 + 0.2 * hash(k, 1, 58);
    if (t > life) continue;
    const a = (k / 14) * TAU + hash(k, 2, 58);
    const out = (0.4 + 0.9 * hash(k, 3, 58)) * (t / life);
    const fx = Math.cos(a) * out;
    const fy = Math.sin(a) * out;
    if (!onSide(fx, fy, side)) continue;
    const [x, y] = at(fx, fy);
    const up = (26 + 22 * hash(k, 4, 58)) * 4 * (t / life) * (1 - t / life);
    const c = STONE[k % 3];
    dot(x, y - up, c);
    if (k % 2 === 0) dot(x + 1, y - up, c);
    if (k % 3 === 0) dot(x, y - up - 1, STONE[2]);
  }
  // the dust settling over the middle
  const settle = t < 0.15 ? 0 : 1 - clamp01((t - 0.15) / 0.95);
  if (settle > 0) {
    for (let k = 0; k < 26; k++) {
      const a = hash(k, 1, 59) * TAU;
      const r = (0.2 + 0.75 * hash(k, 2, 59)) * R * 0.45;
      const fx = Math.cos(a) * r;
      const fy = Math.sin(a) * r;
      if (!onSide(fx, fy, side)) continue;
      const [x, y] = at(fx, fy);
      blob(dot, x, y - 3 - 6 * hash(k, 3, 59) * (1 - settle * 0.5), 2 + 2 * hash(k, 4, 59), k % 3 ? MAIL[2] : MAIL[3], 1 - settle * 0.85, k);
    }
  }
  return { px, lights };
}

// =============================================================================================
// THE GREEN TROLL'S BULL RUSH: ITS NUMBERS AND ITS LANE

/**
 * THE BULL RUSH'S NUMBERS (for the main chat; the moves: art/monster_brute.ts, played as the red troll's charge is: `chargeWind`,
 * `charge`, `chargeStop`).
 *   near, far   used when the hero is this many tiles off (3 to 8)
 *   windup      his warning: head down, a fist on the floor, pawing twice, while the lane is marked (1.0 s)
 *   pace        how fast he runs, tiles a second (11: the red troll's charge is 10)
 *   past        how far past where the hero stood his run goes (tiles), and then his stop carries him `stop` more: the lane is
 *               marked from where he stands to the end of his stop
 *   half        half the lane's width (tiles): what is in it as he comes is run down (the red troll's is 0.75)
 *   recover     his stop: a foot dug in, a stumble and another, rocked back, his head shaken (1.0 s)
 *   endOn       the frames of his run's round (six frames, 0.2 s) the game may end his run on, the stop following, so that the stop
 *               takes him from his stride without a jump: not its frames 1 and 2 (the run goes on a frame or two more, a fifteenth
 *               of a second at most)
 */
export const RUSH = { near: 3, far: 8, windup: RUSH_GO, pace: RUSH_PACE, past: 1.3, stop: RUSH_STOP.far, half: 0.9, recover: RUSH_STOP.all, endOn: [3, 4, 5, 0] as readonly number[] } as const;
/** The lane of one bull rush (art/charge_lane.ts's Lane): from where he stands toward the hero, on past him, to the end of his stop. */
export function rushLane(from: readonly [number, number], hero: readonly [number, number], k: number, gone?: number): { x0: number; y0: number; x1: number; y1: number; half: number; k: number; gone?: number } {
  const dx = hero[0] - from[0];
  const dy = hero[1] - from[1];
  const d = Math.hypot(dx, dy) || 1;
  const L = d + RUSH.past + RUSH.stop;
  const lane = { x0: from[0], y0: from[1], x1: from[0] + (dx / d) * L, y1: from[1] + (dy / d) * L, half: RUSH.half, k };
  return gone === undefined ? lane : { ...lane, gone };
}
/** How long his run takes for a hero `d` tiles off (seconds, from setting off to the start of his stop). */
export const rushRunFor = (d: number): number => (d + RUSH.past) / RUSH.pace;

// =============================================================================================
// THE BONEWARD'S SHIELD WALL

/** The switch: with it on, the Boneward is WALL_BONEWARD (the bestiary's to choose: as the cold Shade, art/action_f2_fx.ts). */
export const BONEWARD_WALL = { on: false };

/**
 * THE SHIELD WALL'S NUMBERS (for the main chat).
 *   arc       a blow from within this many degrees of straight before it (half either side) glances off its shield (120)
 *   up        the wall is up while it stands or walks with its spear in hand, and through its thrust's wind-up to `thrustOpen`
 *             seconds in (it lunges out past the shield's edge then: open until the thrust's end, 1.25 s)
 *   down      from the start of its throw (it lowers the shield to hurl: open), all the while its spear is gone (its bash, its
 *             fetching it), and through its picking it up, until the pick-up's end (`raisedAgain`: the shield back up)
 *   glance    a blow that glances off does nothing, and it holds its ground: it plays `glance` (0.3 s), not `reel`
 */
export const WALL = { arc: 120, thrustOpen: BW_HIT - 0.1, glance: 0.3, raisedAgain: 1.0 } as const;
/** Whether a blow from the way `from` (degrees, the blow's way from where the hero is to the Boneward, against the way it faces: 0 head on) glances off. */
export const glances = (from: number): boolean => Math.abs(((((from + 180) % 360) + 360) % 360) - 180) <= WALL.arc / 2;

const REST = BONEWARD.stand.rest;
/**
 * THE WALL: crouched behind the shield, raised square to the front, its top at the skull's jaw so that the helm and the eyes
 * look over it; the spear held overhand by the right shoulder, ready over the shield's rim, its point to the front; the left
 * foot forward, the knees bent. (Only numbers the thrust's own keys name: so its thrust from the wall is the game's own thrust
 * but for where it starts and ends.)
 */
const WALL_POSE: Partial<Bones> = {
  px: 0.6, pz: -3.2, yaw: -4, pitch: 9, roll: 0, twist: -8, bend: 5, side: 0,
  faceUp: 4, faceTurn: 6, faceTilt: 0,
  lfx: 4.4, lfy: 1.4, lft: 6, lk: 20, rfx: -4.6, rfy: -1.2, rft: -16, rk: -18,
  lhIn: 1, lhx: 7.0, lhy: -10.5, lhz: -10.5, le: 0,
  rhIn: 1, rhx: 4.5, rhy: 3.0, rhz: 7.0, re: 70,
  wAz: 20, wEl: -6, pAz: 0, pEl: 3,
  draw: 0.3,
};
const WALL_REST: Bones = { ...REST, ...WALL_POSE };
/** The same numbers as the game's own Boneward has them at rest (to go from its rest to the wall, or back). */
const REST_POSE: Partial<Bones> = Object.fromEntries(Object.keys(WALL_POSE).map((k) => [k, REST[k as keyof Bones]])) as Partial<Bones>;

/** Standing behind its wall: braced, breathing, the spear point drifting a little over the rim. */
function wallStand(): Key3[] {
  const W = WALL_REST;
  return [
    { at: 0, pose: {} },
    { at: 0.5, pose: { px: W.px + 0.5, py: 1.6, pz: W.pz - 1.2, roll: 1.5, side: -1, faceTilt: 3, faceTurn: 9, wEl: W.wEl + 2, draw: 0.38 }, ease: 'io' },
    { at: 0.8, pose: { px: W.px + 0.5, py: 1.6, pz: W.pz - 1.4, roll: 1.5, side: -1, faceTilt: 3, faceTurn: 9, wEl: W.wEl + 2, draw: 0.22 }, ease: 'io' },
    { at: 1.1, pose: { px: W.px - 0.3, py: -1.2, pz: W.pz - 0.4, roll: -1.2, side: 0.8, faceTilt: -1, faceTurn: 4, wEl: W.wEl - 1, draw: 0.4 }, ease: 'io' },
    { at: 1.6, pose: {}, ease: 'io' },
  ];
}

/** Its walk behind the wall, painted (as its plod) for a pace of a tile a second, in eight frames at eleven a second. */
const WALK_FRAMES = 8;
const WALK_FPS = 11;
/**
 * THE BRACED ADVANCE: the left foot (the shield's side) steps out and the right is drawn up after it, the shield kept square to
 * the front and the spear over its rim the whole way; each step lowers it onto the front knee and the shield nods with it. A foot
 * that is down stays where it is on the floor (it goes back under the body as fast as the floor goes by).
 */
function wallWalk(): Key3[] {
  const W = WALL_REST;
  const n = WALK_FRAMES;
  const d = (BW_PACE * TILE3) / WALK_FPS;
  // the left foot: down from frame 3 to frame 0 of the next round (going back under the body), up and forward over frames 1 and 2
  const L0 = W.lfx + 1.5 * d;
  const lfx = (j: number): number => (j >= 3 ? L0 - d * (j - 3) : j === 0 ? L0 - 5 * d : L0 - 5 * d + 5 * d * [0, 0.42, 0.85][j]);
  const LFZ = [0, 2.6, 1.6, 0, 0, 0, 0, 0];
  // the right foot: down from frame 7 to frame 4, up and forward over frames 5 and 6 (drawn up behind the left)
  const R0 = W.rfx + 3 * d;
  const rfx = (j: number): number => (j === 7 || j <= 4 ? R0 - d * ((j + 1) % n) : R0 - 5 * d + 5 * d * [0, 0, 0, 0, 0, 0.42, 0.85, 1][j]);
  const RFZ = [0, 0, 0, 0, 0, 2.2, 1.4, 0];
  //                0     1     2     3     4     5     6     7
  const PZ = [-0.4, 0.2, -0.3, -1.2, -0.6, 0, -0.4, -1.0];
  const PITCH = [0, -1, 0, 1.5, 0.5, -0.5, 0, 1];
  const ROLL = [1, 2, 1, -0.5, -1.5, -2, -1, 0];
  const SH = [0, -0.4, -0.2, 0.6, 0.3, 0, 0.2, 0.5];
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    keys.push({
      at: i / WALK_FPS,
      ease: 'lin',
      pose: {
        px: W.px, pz: W.pz + PZ[j], pitch: W.pitch + PITCH[j], roll: ROLL[j], side: -ROLL[j] * 0.4, yaw: W.yaw + ROLL[j] * 0.5,
        lfx: lfx(j), lfz: LFZ[j], lfp: LFZ[j] > 0 ? -6 : 0, rfx: rfx(j), rfz: RFZ[j], rfp: RFZ[j] > 0 ? -6 : 0,
        lhz: W.lhz - SH[j], pEl: W.pEl + SH[j] * 1.5, rhz: W.rhz - SH[j] * 0.6,
        faceTurn: W.faceTurn - ROLL[j] * 0.5, faceTilt: ROLL[j] * 0.6,
        draw: 0.3 + 0.08 * Math.sin((j / n) * TAU),
      },
    });
  }
  return keys;
}

/** STRUCK from the side or behind (as the game's struck, from the wall): rocked back, the shield knocked out of line, the jaw knocked open; its feet stay. */
function wallStruck(): Key3[] {
  const W = WALL_REST;
  return [
    { at: 0, pose: {} },
    { at: 0.06, pose: { px: W.px - 2.4, pz: W.pz - 0.8, pitch: W.pitch - 9, bend: W.bend - 7, twist: W.twist - 8, faceUp: 14, faceTilt: -4, lhx: W.lhx - 2.5, lhz: W.lhz - 1.5, pAz: 12, pEl: 10, rhz: W.rhz + 1.5, draw: 0.85, pt: 0.9 }, ease: 'out' },
    { at: 0.14, pose: { px: W.px - 1.4, pz: W.pz - 0.9, pitch: W.pitch - 3, bend: W.bend - 2, faceUp: 6, lhx: W.lhx - 1.2, pAz: 5, draw: 0.4, pt: -0.7 }, ease: 'io' },
    { at: 0.3, pose: {}, ease: 'io' },
  ];
}

/** THE GLANCE: a blow from in front rings off the shield; it holds its ground, barely rocked (the shield driven in a hair, its weight set back on its back foot). */
function wallGlance(): Key3[] {
  const W = WALL_REST;
  return [
    { at: 0, pose: {} },
    { at: 0.05, pose: { px: W.px - 0.8, pz: W.pz - 0.4, pitch: W.pitch - 2, lhx: W.lhx - 1.4, pEl: W.pEl + 4, faceUp: W.faceUp + 3, draw: 0.55 }, ease: 'out' },
    { at: 0.15, pose: { px: W.px - 0.3, pz: W.pz - 0.2, pitch: W.pitch - 0.5, lhx: W.lhx - 0.4, pEl: W.pEl + 1, draw: 0.4 }, ease: 'io' },
    { at: WALL.glance, pose: {}, ease: 'io' },
  ];
}

/** The shield's half-width and half-height (art/new_mobs3.ts: its planks' face), and where on it a blow from in front rings: high on its middle, over its rune. */
const SHIELD_HALF = [7.6, 20.5] as const;
const STRUCK_UP = 13.5;
/** The shield at a moment: its middle, the way its face looks, across it and up it; and where a blow from in front rings on it. */
function shieldAt(m: Moment): { c: V3; p: V3; n: V3; across: V3; up: V3 } {
  const q = m.q;
  const n = heading(q.pAz, 0);
  const up = norm(add([0, 0, 1], mul(n, -Math.tan((q.pEl * Math.PI) / 180))));
  const across = norm(cross(up, n));
  const c = add(add(m.s.handL, mul(n, 1.7)), mul(up, -8.6));
  return { c, p: add(add(c, mul(up, STRUCK_UP)), mul(n, 0.9)), n, across, up };
}

/** How long the glance's light lasts on the shield (seconds from the blow). */
const GLANCE_LONG = 0.24;
/**
 * THE GLANCE ON THE SHIELD, `m.t` seconds after the blow (in its `glance` only): a white star where it struck, high on the
 * shield's face over its rune; A RING going out over the face from there, white and then the enemy's pink, as the iron rings with
 * it; and sparks thrown off the face (white, the enemy's gold and pink), falling as they go. None of it the friend's cyan. Seen
 * from behind, the blow is on the far face of the shield: only the sparks that fly out past its edges are seen.
 */
export function glanceBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (m.move !== GLANCE_NAME || m.dying) return bits;
  const t = m.t;
  if (t > GLANCE_LONG + 1e-6) return bits;
  const { c, p, n, across, up } = shieldAt(m);
  const facing = n[0] * st.eye[0] + n[1] * st.eye[1] + n[2] * st.eye[2] > 0;
  /** (from behind: whether a point is out past the shield's edge, where it is seen) */
  const past = (q: V3): boolean => {
    const d = [q[0] - c[0], q[1] - c[1], q[2] - c[2]];
    const a = d[0] * across[0] + d[1] * across[1] + d[2] * across[2];
    const b = d[0] * up[0] + d[1] * up[1] + d[2] * up[2];
    // (and clear of the body behind it: over its shoulders, or wide of them)
    return Math.abs(a) > 13 || (b > SHIELD_HALF[1] + 1 && q[2] > m.s.shoulderL[2] + 3);
  };
  const put = (q: V3, col: string, size: number): void => {
    if (!facing && !past(q)) return;
    bits.push({ part: 'glance', piece: 'glance', shape: { k: 'mote', p: q, c: col, size } });
  };
  const on = (a: number, b: number, lift = 0.4): V3 => add(add(add(p, mul(across, a)), mul(up, b)), mul(n, lift));
  // the star, a moment
  if (t < 0.1) {
    const k = 1 - t / 0.1;
    // (from behind, its rays reach out past the shield's edge: what of the star is seen)
    const L = facing ? 4 + 8 * k : 7 + 10 * k;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]] as const) {
      const long = Math.abs(a) + Math.abs(b) > 1.2 ? L * 0.55 : L;
      for (let s = 0.5; s <= long; s += 0.7) put(on(a * s, b * s), s < long * 0.6 ? WHITE : FLAME[4], s < long * 0.35 && k > 0.4 ? 2 : 1);
    }
    put(on(0, 0, 0.6), WHITE, 2);
    bits.push({ part: 'glance', piece: 'glance', shape: { k: 'glow', p, c: FLAME[3], r: 12 + 10 * k, a: 0.55 * k } });
  }
  // the ring over the face
  if (t < 0.18) {
    const k = t / 0.18;
    const r = 2 + 7.5 * Math.sqrt(k);
    const col = k < 0.45 ? WHITE : SOCKET;
    const dots = 22;
    for (let i = 0; i < dots; i++) {
      if (k > 0.55 && (i + Math.floor(k * 6)) % 3 === 2) continue;
      const a = (i / dots) * TAU;
      const b = Math.sin(a) * r * 0.95;
      // (on the shield's face only: not off its edge into the air)
      if (Math.abs(Math.cos(a) * r) > SHIELD_HALF[0] - 0.5 || STRUCK_UP + b > SHIELD_HALF[1] - 0.5) continue;
      put(on(Math.cos(a) * r, b, 0.3), col, 1);
    }
  }
  // the sparks, thrown off the face and falling
  const many = facing ? 14 : 22;
  for (let i = 0; i < many; i++) {
    const life = 0.14 + 0.1 * hash(i, 1, 61);
    if (t > life) continue;
    const a = (i / many) * TAU + hash(i, 2, 61);
    const v = (facing ? 22 : 34) + 22 * hash(i, 3, 61);
    const out = add(add(mul(across, Math.cos(a)), mul(up, Math.sin(a) * 0.8 + 0.35)), mul(n, 0.9 + 0.5 * hash(i, 4, 61)));
    const at = (u: number): V3 => add(add(p, mul(out, v * u)), [0, 0, -70 * u * u]);
    const col = i % 4 === 0 ? SOCKET : i % 4 === 1 ? FLAME[3] : i % 4 === 2 ? FLAME[4] : WHITE;
    put(at(t), col, t < life * 0.5 && i % 3 === 0 ? 2 : 1);
    if (t > FR) put(at(t - FR * 0.5), col === WHITE ? FLAME[4] : col, 1);
  }
  return bits;
}
const GLANCE_NAME = 'The Boneward’s blow glances off its shield';

const B = BONEWARD;
const more = B.more ?? {};
/** One of the game's own moves from the wall: `from` (its first key, said over the move's own rest) and `to` (its last) in place of its own; the rest of its keys its own. */
function retimed(keys: ReadonlyArray<Key3>, first: Partial<Bones> | null, last: Partial<Bones> | null): Key3[] {
  const out = keys.map((k) => ({ ...k }));
  // (from the wall it eases out of it as well as into its first pose: the way there is new)
  if (first) {
    out[0] = { ...out[0], pose: { ...out[0].pose, ...first } };
    out[1] = { ...out[1], ease: 'io' };
  }
  if (last) out[out.length - 1] = { ...out[out.length - 1], pose: { ...out[out.length - 1].pose, ...last } };
  return out;
}
/** A move of the game's own Boneward, its every number said over its rest (so that it may be given another rest, the wall, and be the same). */
function over(keys: ReadonlyArray<Key3>, rest: Bones): Key3[] {
  return keys.map((k) => ({ ...k, pose: { ...Object.fromEntries(Object.keys(WALL_POSE).map((f) => [f, rest[f as keyof Bones]])), ...k.pose } }));
}

const wallMove = (name: string, keys: Key3[], extra: Partial<MobMove> = {}, loop?: number): MobMove => ({ name, rest: WALL_REST, motion: loop === undefined ? { keys } : { keys, loop }, ...extra });
const thrown = more.throw as MobMove;
const picked = more.pickUp as MobMove;

/**
 * THE BONEWARD BEHIND ITS SHIELD WALL (BONEWARD_WALL): the game's Boneward, but that it stands and walks behind its raised
 * shield; its thrust is the game's own from there and back to there; its throw is the game's own, from there (lowering the
 * shield as it raises the spear: the opening); its shield bash, and its stand and walk while its spear is gone, are the game's
 * own; it picks its spear up as the game's does and raises its shield again; struck from the side or behind it is rocked as the
 * game's is; struck from in front its blow glances off (`glance`).
 */
export const WALL_BONEWARD: Mob = {
  ...B,
  stand: wallMove('The Boneward braced behind its shield', wallStand(), {}, 0),
  walk: { ...wallMove('The Boneward advances behind its shield', wallWalk(), { period: WALK_FRAMES / WALK_FPS, ground: BW_PACE * TILE3 }, 0) },
  walkFrames: WALK_FRAMES,
  walkFps: WALK_FPS,
  attack: { ...B.attack, name: 'The Boneward thrusts from behind its shield', rest: WALL_REST, motion: { ...B.attack.motion, keys: retimed(B.attack.motion.keys, {}, null) } },
  reel: wallMove('The Boneward is struck from the side', wallStruck()),
  dying: { ...B.dying, rest: WALL_REST },
  more: {
    ...more,
    // (its throw from the wall: the game's own, but that it begins from the wall and not from its rest)
    throw: { ...thrown, name: 'The Boneward lowers its shield and throws', motion: { ...thrown.motion, keys: retimed(thrown.motion.keys, WALL_POSE, null) } },
    // (its pick-up, the game's own, said over the wall; at its end, back behind the wall)
    pickUp: { ...picked, rest: WALL_REST, motion: { ...picked.motion, keys: retimed(over(picked.motion.keys, REST), null, Object.fromEntries(Object.keys(WALL_POSE).map((f) => [f, WALL_REST[f as keyof Bones]])) as Partial<Bones>) } },
    glance: wallMove(GLANCE_NAME, wallGlance()),
  },
  bits: (st, m) => [...B.bits(st, m), ...glanceBits(st, m)],
};
void REST_POSE;
void BW_THROW_HIT;
/** The Boneward behind its wall as the game holds a monster (as art/new_mobs3.ts makeBonewardArt3). */
export function makeWallBonewardArt(pace = BONEWARD.pace): ActorArt {
  return { front: mobSet(WALL_BONEWARD, 'front', pace), back: mobSet(WALL_BONEWARD, 'back', pace) };
}
void INK;
