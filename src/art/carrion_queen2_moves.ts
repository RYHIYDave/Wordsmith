// FLOOR 7'S BOSS, THE CARRION QUEEN MADE NEW: HER MOVES (16 Oct). Her look and stand are art/carrion_queen2.ts; his
// yes to them, 16 Oct, by 09:40: "Yes, animate her (Recommended)", offered as: her look and stand kept, all her moves
// made new, fast and vicious. His pick for how she moves, by 09:02: "Fast and vicious (Recommended)", offered as:
// darting, snapping, quick hops and lunges, wings flaring, never still, never slow. Her moves, as her brief of 13 Oct
// has them: her hop, her talon rake (her blow), her wing gust that shoves you toward the edge, her dive along a marked
// line, her call that brings her flock, her flinch, and her death off the edge (his pick).
//
// Each move is a smooth curve through key poses of her (`through`): her body, her head, her wings bone by bone; her
// feet on their own tracks, so that a foot down stays where it came down (Movement 8). Every move starts on the first
// frame of her stand and ends on it. Her effects (Animations 3, her own way of being wild: grit, torn feathers and the
// cult's fire) are grains laid on her picture after its edge, each a crisp mote of whole pixels.
//
// Behind her switch (art/carrion_queen2.ts, QUEEN2_ON), off: nothing of the game imports this file.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { FOLDED, FLARE, MANTLE, Q2_CANVAS, Q2_IDLE, Q2_SCALE, Q2_STAND, mixWing, paintQueen, standPose, wingBones } from './carrion_queen2';
import type { Grain, QueenPose, WingPose } from './carrion_queen2';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { FLAME } from './mkit';
import { TILE3 } from './new_mobs3';
import type { GameView } from './skin';
import { add, dot, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const k = cl01(v);
  return k * k * (3 - 2 * k);
};
const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
const D = Math.PI / 180;
const TAU = Math.PI * 2;
/** A bump: 0 outside [a, b], rising smoothly to 1 at its middle and back. */
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)) ** 2);

// ---------------------------------------------------------------------------------------------
// HER POSES AS NUMBERS, TO BLEND

function flat(P: QueenPose): number[] {
  const w = (W: WingPose): number[] => [...W.arm, ...W.fore, ...W.hand, ...W.top, ...W.tipTop, W.open, W.fan];
  return [...P.body, P.pitch, P.yaw, P.roll, ...P.head, ...P.look, P.gape, ...w(P.wings[0]), ...w(P.wings[1]), ...P.feet[0], ...P.feet[1], ...P.grasp, P.tail, P.heat, P.lit, P.ruffle, P.wingPitch ?? 0];
}
function unflat(v: number[]): QueenPose {
  let i = 0;
  const n = (): number => v[i++];
  const v3 = (): V3 => [n(), n(), n()];
  const w = (): WingPose => ({ arm: v3(), fore: v3(), hand: v3(), top: v3(), tipTop: v3(), open: n(), fan: n() });
  const body = v3();
  const pitch = n();
  const yaw = n();
  const roll = n();
  const head = v3();
  const look = v3();
  const gape = n();
  const wings: [WingPose, WingPose] = [w(), w()];
  const feet: [V3, V3] = [v3(), v3()];
  const grasp: [number, number] = [n(), n()];
  return { body, pitch, yaw, roll, head, look, gape, wings, feet, grasp, tail: n(), heat: n(), lit: n(), ruffle: n(), wingPitch: n() };
}
/** A key of a move: at this moment, this pose. */
type Key = [number, QueenPose];
/**
 * THROUGH HER KEY POSES, A SMOOTH CURVE: each number of her pose along a curve through its keys, its speed at a key
 * set by its neighbours (so that she never stops dead at a key and goes on), at rest at the first key and the last.
 */
function through(keys: ReadonlyArray<Key>, t: number): QueenPose {
  const K = keys.map(([tk, P]) => [tk, flat(P)] as [number, number[]]);
  if (t <= K[0][0]) return keys[0][1];
  const last = K.length - 1;
  if (t >= K[last][0]) return keys[last][1];
  let i = 0;
  while (i < last - 1 && t >= K[i + 1][0]) i++;
  const tan = (j: number): number[] => (j === 0 || j === last ? K[j][1].map(() => 0) : K[j + 1][1].map((v, q) => (v - K[j - 1][1][q]) / (K[j + 1][0] - K[j - 1][0])));
  const [t0, p0] = K[i];
  const [t1, p1] = K[i + 1];
  const h = t1 - t0;
  const s = (t - t0) / h;
  const m0 = tan(i);
  const m1 = tan(i + 1);
  const h00 = 2 * s * s * s - 3 * s * s + 1;
  const h10 = s * s * s - 2 * s * s + s;
  const h01 = -2 * s * s * s + 3 * s * s;
  const h11 = s * s * s - s * s;
  const out = p0.map((v, q) => h00 * v + h10 * h * m0[q] + h01 * p1[q] + h11 * h * m1[q]);
  // (her wings' bones and faces, and the way she looks, are ways, not places: each is turned from one key's way to the
  // next at a pace that runs on smoothly through the keys, never cut across the middle)
  const v3 = (a: number[]): V3 => [a[0], a[1], a[2]];
  const ang = (a: number[], b: number[]): number => Math.acos(Math.max(-1, Math.min(1, dot(norm(v3(a)), norm(v3(b))))));
  for (const q of WAYS) {
    const at = (j: number): number[] => K[j][1].slice(q, q + 3);
    const th = ang(at(i), at(i + 1));
    if (th < 1e-3) continue;
    const rate = (j: number): number => {
      if (j === 0 || j === last) return 0;
      return (ang(at(j - 1), at(j)) + ang(at(j), at(j + 1))) / (K[j + 1][0] - K[j - 1][0]);
    };
    const e = h01 + (h10 * rate(i) * h) / th + (h11 * rate(i + 1) * h) / th;
    const w = turnTo(v3(at(i)), v3(at(i + 1)), e);
    out[q] = w[0];
    out[q + 1] = w[1];
    out[q + 2] = w[2];
  }
  return unflat(out);
}
/** Where the ways are among a pose's numbers: the way she looks; each wing's arm, forearm, hand, top and tip's top. */
const WAYS = [9, ...[13, 30].flatMap((w) => [w, w + 3, w + 6, w + 9, w + 12])];
/** A way turned toward another, `k` of the way (past either end as the curve asks). */
function turnTo(a0: V3, b0: V3, k: number): V3 {
  const a = norm(a0);
  const b = norm(b0);
  const th = Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
  if (th < 1e-4) return lerp3(a, b, k);
  if (th > Math.PI - 1e-3) return norm(lerp3(a, b, k), [0, 0, 1]);
  const sn = Math.sin(th);
  return add(mul(a, Math.sin((1 - k) * th) / sn), mul(b, Math.sin(k * th) / sn));
}
/** Her pose changed: what is given replaces what was. */
const with_ = (P: QueenPose, o: Partial<QueenPose>): QueenPose => ({ ...P, ...o });
const both = (W: WingPose): [WingPose, WingPose] => [W, W];

// HER FEET ON THEIR OWN TRACKS: a foot is down on its spot, or lifted from one spot to the next along an arc; while
// she is in the air, it hangs under her as her pose has it.
interface Step {
  /** When it lifts and when it comes down. */
  t0: number;
  t1: number;
  /** Where it comes down; how high it is lifted on the way. */
  to: V3;
  lift: number;
}
/** A foot's track: where it stands at first, and its steps; `air`: from when to when it hangs under her as her pose has it. */
function footOn(start: V3, steps: ReadonlyArray<Step>, t: number, posed: V3): V3 {
  let at: V3 = start;
  for (const s of steps) {
    if (t < s.t0) return at;
    if (t < s.t1) {
      const k = (t - s.t0) / (s.t1 - s.t0);
      const e = sm(k);
      const p = lerp3(at, s.to, e);
      // (lifted along an arc; a step with no spot to come down on hangs under her as her pose has it)
      if (s.lift < 0) return lerp3(lerp3(at, posed, sm(k * 3)), lerp3(posed, s.to, sm(k * 3 - 2)), k < 0.5 ? 0 : 1);
      return [p[0], p[1], p[2] + s.lift * Math.sin(Math.PI * k)];
    }
    at = s.to;
  }
  return at;
}

// ---------------------------------------------------------------------------------------------
// HER WINGS IN THE AIR

/** At the top of her upstroke: raised high over her back, her hands half folded back. */
const UP: WingPose = { arm: [-0.1, 0.45, 0.9], fore: [-0.15, 0.42, 0.9], hand: [-0.5, 0.3, 0.8], top: [0, -0.9, 0.4], tipTop: [0.1, -0.8, 0.5], open: 0.85, fan: 0.55 };
/** At the bottom of her downstroke: swept down and forward, every feather spread. */
const DOWN: WingPose = { arm: [0.25, 0.85, -0.3], fore: [0.35, 0.85, -0.35], hand: [0.5, 0.6, -0.55], top: [0, 0.45, 0.9], tipTop: [0.1, 0.5, 0.85], open: 1, fan: 1 };
/** Spread level, gliding. */
const GLIDE: WingPose = { arm: [0, 1, 0.12], fore: [-0.05, 1, 0.05], hand: [-0.25, 0.95, 0], top: [0, 0, 1], tipTop: [0, 0, 1], open: 1, fan: 1 };
/** Her stoop: swept back along her, close, her primaries together (held in the frame of her body's pitch: `wingPitch`). */
const STOOP: WingPose = { arm: [-0.6, 0.75, 0.15], fore: [-0.75, 0.6, 0], hand: [-0.95, 0.25, 0], top: [0, 0, 1], tipTop: [0, 0, 1], open: 0.5, fan: 0.15 };
/** Her stoop at its fastest: swept back tighter still. */
const STOOP_TIGHT: WingPose = { arm: [-0.7, 0.65, 0.1], fore: [-0.85, 0.45, 0], hand: [-0.98, 0.15, 0], top: [0, 0, 1], tipTop: [0, 0, 1], open: 0.35, fan: 0.1 };
/** Her gust drawn back: up and back behind her, trembling. */
const DRAWN: WingPose = { arm: [-0.45, 0.45, 0.75], fore: [-0.6, 0.45, 0.65], hand: [-0.75, 0.35, 0.55], top: [-0.2, -0.9, 0.35], tipTop: [-0.1, -0.9, 0.4], open: 1, fan: 1 };
/** Her gust clapped forward: before her, every feather spread, the air driven out ahead. */
const CLAPPED: WingPose = { arm: [0.55, 0.75, 0.1], fore: [0.75, 0.6, -0.1], hand: [0.8, 0.2, -0.55], top: [-0.8, 0.3, 0.4], tipTop: [-0.8, 0.4, 0.3], open: 1, fan: 1 };

/** A wingbeat: up, down, and back to where it was; `k` from 0 to 1 through it. */
function beat(from: WingPose, k: number, hard = 1): WingPose {
  if (k <= 0 || k >= 1) return from;
  const up = sm(k / 0.4);
  const down = sm((k - 0.35) / 0.35);
  const back = sm((k - 0.72) / 0.28);
  let W = mixWing(from, UP, up * hard);
  W = mixWing(W, DOWN, down * hard);
  return mixWing(W, from, back);
}

// ---------------------------------------------------------------------------------------------
// HER HOP (her walk): quick, low, darting hops, both feet together, a wingbeat to each, her head thrust forward as
// she lands, locked on you.

/** Her hop: twelve frames at twenty a second (0.6 s a hop); her pace in tiles a second. */
export const Q2_WALK = { frames: 12, fps: 20 } as const;
export const Q2_PACE = 1.5;
/** In her hop (seconds into it): her feet leave the rock; they come down again. */
export const Q2_HOP = { off: 0.14, land: 0.44 } as const;
/** Her speed over the rock, in her own lengths a second (she is built at Q2_SCALE). */
const V = (Q2_PACE * TILE3) / Q2_SCALE;
const HOP_T = Q2_WALK.frames / Q2_WALK.fps;
function hopPose(t: number): QueenPose {
  const T = ((t % HOP_T) + HOP_T) % HOP_T;
  const R = standPose(0);
  const L = V * HOP_T;
  // (where her feet are: down from her landing to her next take-off, the rock going by under them; then lifted
  // forward, both together, to come down a hop on)
  const foot = (x0: number, y: number): V3 => {
    const off = Q2_HOP.off;
    const land = Q2_HOP.land;
    if (T >= land) return [x0 + L / 4 - V * (T - land), y, 0];
    if (T < off) return [x0 + L / 4 - V * (T + HOP_T - land), y, 0];
    const k = (T - off) / (land - off);
    return [mix(x0 - L / 4, x0 + L / 4, sm(k)), y, 15 * Math.sin(Math.PI * k) ** 0.8];
  };
  // (her round begins and ends standing as she stands, between her landing and her next gathering)
  const air = bump(T, Q2_HOP.off - 0.02, Q2_HOP.land + 0.02);
  const crouch = bump(T, 0, Q2_HOP.off + 0.04);
  const absorb = bump(T, Q2_HOP.land - 0.02, HOP_T - 0.02);
  const thrust = bump(T, Q2_HOP.land - 0.06, HOP_T);
  // (a wingbeat to each hop: up as she gathers, down hard as she springs, braking open as she lands)
  const k = T / 0.5;
  let W = beat(R.wings[0], k, 0.55);
  W = mixWing(W, { ...MANTLE, fan: 1, open: 1, hand: [0.45, 0.6, -0.65] }, bump(T, Q2_HOP.land - 0.04, Q2_HOP.land + 0.14) * 0.3);
  return with_(R, {
    body: [R.body[0] - 3 * crouch + 5 * air - 1.5 * absorb, 0, R.body[2] - 7 * crouch + 22 * air - 4 * absorb],
    pitch: R.pitch - 7 * crouch + 8 * air - 3 * absorb + 4 * thrust,
    head: [R.head[0] + 9 * thrust - 4 * crouch, R.head[1] * (1 - air), R.head[2] - 4 * crouch + 8 * air - 6 * thrust],
    look: [1, 0, -0.4 - 0.2 * thrust],
    gape: 0.5 * thrust,
    wings: both(W),
    feet: [foot(R.feet[0][0], R.feet[0][1]), foot(R.feet[1][0], R.feet[1][1])],
    grasp: [0.25 + 0.6 * air, 0.25 + 0.6 * air],
    tail: 0.35 + 0.5 * air,
    ruffle: 0.2 + 0.4 * air,
  });
}

// ---------------------------------------------------------------------------------------------
// HER TALON RAKE (her blow): she bursts up off the rock in one hard wingbeat; hangs, her talons cocked up and forward,
// trembling (THE WARNING); drops and rakes both feet down and through you; comes down on the spot, mantling over it,
// her head stabbing; hops back to where she stood.

/** Her rake: how long; when her warning begins; when her talons strike; when she comes down; how far forward she lands. */
export const Q2_RAKE = { long: 1.45, warn: 0.46, hit: 0.72, land: 0.8, landX: 34 } as const;
function rakeKeys(): Key[] {
  const R = standPose(0);
  const H = Q2_RAKE.hit;
  const X = Q2_RAKE.landX;
  return [
    [0, R],
    // (she gathers: crouched, her wings thrown up)
    [0.1, with_(R, { body: [-4, 0, 75], pitch: 21, head: [R.head[0] - 3, 0, R.head[2] - 4], wings: both(mixWing(R.wings[0], UP, 0.45)), grasp: [0.45, 0.45] })],
    [0.2, with_(R, { body: [-6, 0, 70], pitch: 16, head: [R.head[0] - 6, 0, R.head[2] - 8], look: [1, 0, -0.4], wings: both(UP), grasp: [0.6, 0.6] })],
    // (up, in one hard wingbeat, her feet swinging up and forward)
    [0.32, with_(R, { body: [-6, 0, 128], pitch: 50, head: [R.head[0] - 4, 0, 168], look: [1, 0, -0.75], wings: both(DOWN), feet: [[18, 20, 40], [12, -20, 44]], grasp: [0.1, 0.1], tail: 0.9, ruffle: 0.6 })],
    // (THE WARNING: hung, her talons cocked up and forward, open; her wings flung up and wide, her head low between them, glaring)
    [Q2_RAKE.warn, with_(R, { body: [-8, 0, 150], pitch: 62, head: [R.head[0] - 2, 0, 170], look: [1, 0, -0.85], gape: 0.6, wings: both(mixWing(UP, FLARE, 0.8)), feet: [[58, 20, 118], [54, -20, 124]], grasp: [0, 0], tail: 1, heat: 0.9, ruffle: 0.8 })],
    [H - 0.1, with_(R, { body: [-6, 0, 146], pitch: 64, head: [R.head[0], 0, 166], look: [1, 0, -0.85], gape: 0.7, wings: both(mixWing(UP, FLARE, 0.9)), feet: [[62, 20, 112], [58, -20, 118]], grasp: [0, 0], tail: 1, heat: 1, ruffle: 0.8 })],
    // (THE RAKE: dropped, both feet driven down and through, her wings beating down to drive her)
    [H, with_(R, { body: [16, 0, 104], pitch: 40, head: [R.head[0] + 20, 0, 132], look: [1, 0, -0.7], gape: 1, wings: both(mixWing(FLARE, DOWN, 0.65)), feet: [[R.feet[0][0] + X + 30, 18, 14], [R.feet[1][0] + X + 26, -18, 18]], grasp: [0.7, 0.7], tail: 0.8, heat: 1, ruffle: 0.6 })],
    // (down on the spot, mantled over it, her head stabbing down at what is under her)
    [H + 0.1, with_(R, { body: [X - 6, 0, R.body[2] - 8], pitch: 14, head: [R.head[0] + X + 16, 0, 92], look: [1, 0, -0.95], gape: 0.8, wings: both({ ...MANTLE, arm: [0.25, 0.6, 0.6], fore: [0.55, 0.8, 0.0], hand: [0.5, 0.3, -0.8], open: 1, fan: 1 }), grasp: [1, 1], tail: 0.6, heat: 0.7 })],
    [H + 0.24, with_(R, { body: [X - 4, 0, R.body[2] - 6], pitch: 18, head: [R.head[0] + X + 6, 0, 104], look: [1, 0, -0.7], gape: 0.3, wings: both({ ...MANTLE, arm: [0.15, 0.6, 0.7], fore: [0.4, 0.88, 0.1], open: 1, fan: 0.9 }), grasp: [1, 1], heat: 0.5 })],
    // (and back to where she stood, in a hop)
    [1.1, with_(R, { body: [16, 0, R.body[2] + 16], pitch: 30, head: [R.head[0] + 8, 0, R.head[2] + 10], wings: both(mixWing(R.wings[0], UP, 0.35)), grasp: [0.6, 0.6] })],
    [1.26, with_(R, { body: [-2, 0, R.body[2] - 6], pitch: R.pitch - 4, wings: both(mixWing(R.wings[0], { ...MANTLE, open: 1, fan: 1 }, 0.5)) })],
    [Q2_RAKE.long, R],
  ];
}
const RAKE_KEYS = rakeKeys();
function rakePose(t: number): QueenPose {
  const P = through(RAKE_KEYS, t);
  const R = standPose(0);
  // (her talons trembling as she hangs)
  const tr = bump(t, Q2_RAKE.warn, Q2_RAKE.hit - 0.08) * Math.sin(t * 90) * 2.5;
  // her feet: down where she stood; lifted as she bursts up (hanging under her as her pose has them); down on her
  // spot after the rake; lifted back to where she stood
  const landAt = (i: 0 | 1): V3 => [R.feet[i][0] + Q2_RAKE.landX, R.feet[i][1], 0];
  const foot = (i: 0 | 1): V3 => {
    if (t < 0.22) return R.feet[i];
    if (t < Q2_RAKE.land) {
      const posed = add(P.feet[i], [0, 0, tr]);
      if (t < 0.3) return lerp3(R.feet[i], posed, sm((t - 0.22) / 0.08));
      if (t > Q2_RAKE.land - 0.06) return lerp3(posed, landAt(i), sm((t - (Q2_RAKE.land - 0.06)) / 0.06));
      return posed;
    }
    return footOn(landAt(i), [{ t0: 1.02, t1: 1.24, to: R.feet[i], lift: 16 }], t, P.feet[i]);
  };
  return { ...P, feet: [foot(0), foot(1)] };
}

// ---------------------------------------------------------------------------------------------
// HER WING GUST (shoves you toward the edge): she rears up, her wings drawn far back and up, trembling, her crown
// flaring (THE WARNING); claps them forward in one huge stroke, a blast of grit, torn feathers and the cult's embers
// driven out before her; her own blow rocks her back on her feet; she settles.

/** Her gust: how long; when her warning begins; when her wings clap. */
export const Q2_GUST = { long: 1.45, warn: 0.3, hit: 0.68 } as const;
function gustKeys(): Key[] {
  const R = standPose(0);
  const drawn = (lift: number): [WingPose, WingPose] => both(lifted2(DRAWN, lift));
  const H = Q2_GUST.hit;
  return [
    [0, R],
    [0.15, with_(R, { body: [-6, 0, 88], pitch: 44, head: [72, 0, 146], look: [1, 0, 0.1], gape: 0.3, wings: both(mixWing(R.wings[0], DRAWN, 0.55)), heat: 0.7, ruffle: 0.6 })],
    // (THE WARNING: reared to her full height, her wings drawn back and up, her head back, hissing)
    [Q2_GUST.warn, with_(R, { body: [-10, 0, 96], pitch: 56, head: [64, 0, 160], look: [0.9, 0, 0.35], gape: 0.5, wings: drawn(0), tail: 1, heat: 1, ruffle: 1 })],
    [H - 0.18, with_(R, { body: [-13, 0, 98], pitch: 60, head: [60, 0, 164], look: [0.85, 0, 0.45], gape: 0.6, wings: drawn(8), tail: 1, heat: 1, ruffle: 1 })],
    // (THE CLAP: her wings driven forward, her body thrown after them, her beak wide)
    [H - 0.09, with_(R, { body: [-2, 0, 92], pitch: 40, head: [86, 0, 142], look: [1, 0, 0.1], gape: 0.9, wings: both(mixWing(DRAWN, CLAPPED, 0.5)), tail: 0.9, heat: 1, ruffle: 0.9 })],
    [H, with_(R, { body: [8, 0, 84], pitch: 18, head: [112, 0, 118], look: [1, 0, -0.15], gape: 1, wings: both(CLAPPED), tail: 0.8, heat: 1, ruffle: 0.8 })],
    // (rocked back on her feet by her own blow)
    [H + 0.14, with_(R, { body: [-7, 0, 86], pitch: 34, head: [84, 0, 134], look: [1, 0, -0.2], gape: 0.5, wings: both(mixWing(CLAPPED, R.wings[0], 0.45)), heat: 0.7, ruffle: 0.5 })],
    [H + 0.36, with_(R, { body: [-3, 0, 81], pitch: 27, head: [90, 0, 128], gape: 0.2, wings: both(mixWing(CLAPPED, R.wings[0], 0.88)), heat: 0.5 })],
    [Q2_GUST.long, R],
  ];
}
/** A wing's pose raised a few degrees (its bones turned up about her body's line). */
function lifted2(W: WingPose, deg: number): WingPose {
  const c = Math.cos(deg * D);
  const sn = Math.sin(deg * D);
  const up = (v: V3): V3 => [v[0], v[1] * c - v[2] * sn, v[1] * sn + v[2] * c];
  return { ...W, arm: up(W.arm), fore: up(W.fore), hand: up(W.hand), top: up(W.top), tipTop: up(W.tipTop) };
}
const GUST_KEYS = gustKeys();
function gustPose(t: number): QueenPose {
  const P = through(GUST_KEYS, t);
  const tr = bump(t, Q2_GUST.warn, Q2_GUST.hit - 0.06) * Math.sin(t * 95) * 3;
  return { ...P, wings: [lifted2(P.wings[0], tr), lifted2(P.wings[1], -tr)], head: add(P.head, [0, 0, tr * 0.4]), feet: standPose(0).feet };
}

// ---------------------------------------------------------------------------------------------
// HER DIVE (along a marked line): she launches straight up, beating hard; climbs out of sight above and hangs there
// (the warning is the game's mark on her line); plunges back in a stoop, her wings folded, and strikes talons first
// along the line, held a tenth; rips free and beats back home.

/** Her dive: how long; when she leaves the rock; when she hangs out of sight; when she stoops; when she strikes, held how long; how far along her line. */
export const Q2_DIVE = { long: 2.2, launch: 0.24, warn: 0.56, stoop: 0.8, hit: 1.08, freeze: 0.1, strikeX: 100, home: 1.86 } as const;
function diveKeys(): Key[] {
  const R = standPose(0);
  const X = Q2_DIVE.strikeX;
  const H = Q2_DIVE.hit;
  const hang: V3[] = [[10, 16, -70], [6, -16, -66]];
  const k = (t: number, body: V3, pitch: number, head: V3, look: V3, W: WingPose, o: Partial<QueenPose> = {}): Key => [t, with_(R, { body, pitch, head, look, wings: both(W), feet: [add(body, hang[0]), add(body, hang[1])], grasp: [0.5, 0.5], tail: 0.8, ruffle: 0.4, ...o })];
  return [
    [0, R],
    [0.1, with_(R, { body: [-3, 0, 75], pitch: 20, head: [84, 0, 120], wings: both(mixWing(R.wings[0], UP, 0.45)), grasp: [0.5, 0.5] })],
    [0.2, with_(R, { body: [-4, 0, 68], pitch: 14, head: [80, 0, 112], look: [1, 0, -0.2], wings: both(UP), grasp: [0.7, 0.7] })],
    k(0.34, [-4, 0, 150], 62, [40, 0, 222], [0.6, 0, 0.8], DOWN),
    k(0.46, [-6, 0, 236], 64, [36, 0, 306], [0.6, 0, 0.8], mixWing(UP, GLIDE, 0.3)),
    k(Q2_DIVE.warn, [-6, 0, 304], 56, [44, 0, 368], [0.8, 0, 0.5], mixWing(DOWN, GLIDE, 0.35)),
    // (hung up there, out of sight, turning over into her stoop)
    k(0.7, [-4, 0, 336], 30, [60, 0, 380], [1, 0, -0.6], mixWing(UP, GLIDE, 0.5), { heat: 1 }),
    // (THE STOOP: nose down, her wings swept back along her, plunging along her line)
    k(Q2_DIVE.stoop, [10, 0, 318], -40, [62, 0, 286], [0.6, 0, -0.8], STOOP, { heat: 1, ruffle: 0, wingPitch: -50 }),
    k(0.9, [42, 0, 212], -55, [86, 0, 170], [0.55, 0, -0.85], STOOP_TIGHT, { heat: 1, ruffle: 0, wingPitch: -60 }),
    k(0.98, [70, 0, 132], -24, [114, 0, 112], [0.8, 0, -0.6], mixWing(STOOP, FLARE, 0.35), { heat: 1, ruffle: 0.3, wingPitch: -30 }),
    // (her talons thrown forward at the last; her wings flung open to brake)
    [1.04, with_(R, { body: [X - 26, 0, 96], pitch: 26, head: [X + 4, 0, 118], look: [1, 0, -0.7], gape: 0.8, wings: both(mixWing(STOOP, FLARE, 0.8)), feet: [[X + 6, 18, 16], [X + 2, -18, 20]], grasp: [0, 0], tail: 1, heat: 1, ruffle: 0.6, wingPitch: -6 })],
    // (THE STRIKE, held a tenth: talons in the rock along her line, her wings thrown up, her beak wide)
    [H, with_(R, { body: [X - 18, 0, 84], pitch: 22, head: [X + 22, 0, 98], look: [1, 0, -0.9], gape: 1, wings: both(FLARE), grasp: [1, 1], tail: 1, heat: 1, ruffle: 1 })],
    [H + Q2_DIVE.freeze, with_(R, { body: [X - 18, 0, 83], pitch: 21, head: [X + 23, 0, 96], look: [1, 0, -0.9], gape: 1, wings: both(FLARE), grasp: [1, 1], tail: 1, heat: 1, ruffle: 1 })],
    // (ripping free, beating back up and home)
    k(1.32, [X - 24, 0, 124], 40, [X + 6, 0, 176], [1, 0, -0.4], DOWN, { feet: [[X - 6, 18, 30], [X - 10, -18, 34]] }),
    k(1.48, [X - 50, 0, 150], 40, [X - 20, 0, 208], [1, 0, -0.4], UP),
    k(1.64, [X - 80, 0, 136], 36, [X - 46, 0, 190], [1, 0, -0.4], DOWN),
    [Q2_DIVE.home, with_(R, { body: [-2, 0, 90], pitch: 32, head: [80, 0, 136], look: [1, 0, -0.35], wings: both(mixWing(MANTLE, FLARE, 0.45)), grasp: [0.4, 0.4], tail: 0.7 })],
    [Q2_DIVE.long, R],
  ];
}
const DIVE_KEYS = diveKeys();
function divePose(t: number): QueenPose {
  const P = through(DIVE_KEYS, t);
  const R = standPose(0);
  const X = Q2_DIVE.strikeX;
  const struck = (i: 0 | 1): V3 => [X + 10 - 4 * i, i ? -16 : 16, 0];
  const foot = (i: 0 | 1): V3 => {
    if (t < Q2_DIVE.launch) return R.feet[i];
    if (t < Q2_DIVE.launch + 0.08) return lerp3(R.feet[i], P.feet[i], sm((t - Q2_DIVE.launch) / 0.08));
    if (t < Q2_DIVE.hit - 0.04) return P.feet[i];
    if (t < Q2_DIVE.hit) return lerp3(P.feet[i], struck(i), sm((t - (Q2_DIVE.hit - 0.04)) / 0.04));
    if (t < Q2_DIVE.hit + Q2_DIVE.freeze + 0.04) return struck(i);
    if (t < Q2_DIVE.home - 0.08) return lerp3(struck(i), P.feet[i], sm((t - (Q2_DIVE.hit + Q2_DIVE.freeze + 0.04)) / 0.08));
    if (t < Q2_DIVE.home) return lerp3(P.feet[i], R.feet[i], sm((t - (Q2_DIVE.home - 0.08)) / 0.08));
    return R.feet[i];
  };
  return { ...P, feet: [foot(0), foot(1)] };
}

// ---------------------------------------------------------------------------------------------
// HER CALL (brings her flock): she rears up, her wings flung wide and high, her head thrown back, her beak to the sky,
// screeching, trembling; her crown and mark blaze, embers rising off her crown; rings of the cult's fire pulse out
// over the rock; she folds her wings and settles. (Her flock wheeling in is the game's.)

/** Her call: how long; when her screech begins and ends; when the rings of fire go out from her. */
export const Q2_CALL = { long: 1.7, screech: [0.36, 1.24], rings: [0.45, 0.8, 1.15] } as const;
function callKeys(): Key[] {
  const R = standPose(0);
  return [
    [0, R],
    [0.18, with_(R, { body: [-6, 0, 90], pitch: 48, head: [70, 0, 158], look: [0.65, 0, 0.75], gape: 0.5, wings: both(mixWing(R.wings[0], FLARE, 0.7)), heat: 0.8, ruffle: 0.8, tail: 0.8 })],
    [0.38, with_(R, { body: [-8, 0, 98], pitch: 58, head: [62, 0, 178], look: [0.35, 0, 0.94], gape: 1, wings: both(lifted2(FLARE, 8)), heat: 1, ruffle: 1, tail: 1 })],
    [1.22, with_(R, { body: [-9, 0, 99], pitch: 60, head: [60, 0, 180], look: [0.3, 0, 0.95], gape: 1, wings: both(lifted2(FLARE, 10)), heat: 1, ruffle: 1, tail: 1 })],
    [1.44, with_(R, { body: [-4, 0, 86], pitch: 34, head: [82, 0, 136], look: [1, 0, -0.25], gape: 0.2, wings: both(mixWing(FLARE, R.wings[0], 0.7)), heat: 0.6, ruffle: 0.4, tail: 0.5 })],
    [Q2_CALL.long, R],
  ];
}
const CALL_KEYS = callKeys();
function callPose(t: number): QueenPose {
  const P = through(CALL_KEYS, t);
  const tr = bump(t, Q2_CALL.screech[0], Q2_CALL.screech[1]) * Math.sin(t * 100) * 2.4;
  return { ...P, wings: [lifted2(P.wings[0], tr), lifted2(P.wings[1], -tr)], head: add(P.head, [tr * 0.5, 0, tr * 0.3]), feet: standPose(0).feet };
}

// ---------------------------------------------------------------------------------------------
// STRUCK (her flinch): her head whips back and her wings snap open, feathers bursting from her breast; her head
// snaps forward, low, to glare; back on her stand.

/** Struck: how long. */
export const Q2_REEL = 0.45;
function reelKeys(): Key[] {
  const R = standPose(0);
  return [
    [0, R],
    [0.08, with_(R, { body: [-11, 0, 84], pitch: 40, head: [70, 0, 148], look: [0.7, 0, 0.6], gape: 0.8, wings: both(mixWing(R.wings[0], FLARE, 0.6)), ruffle: 1, tail: 0.9, heat: 0.8 })],
    [0.2, with_(R, { body: [-6, 0, 79], pitch: 23, head: [102, 0, 112], look: [1, 0, -0.6], gape: 0.6, wings: both(mixWing(R.wings[0], FLARE, 0.25)), ruffle: 0.6, heat: 0.6 })],
    [Q2_REEL, R],
  ];
}
const REEL_KEYS = reelKeys();
function reelPose(t: number): QueenPose {
  return { ...through(REEL_KEYS, t), feet: standPose(0).feet };
}

// ---------------------------------------------------------------------------------------------
// HER DEATH, HIS PICK: OFF THE EDGE. She screams, her head back, her wings flung up; her mark flares and gutters out and
// her crown's fire goes out; she staggers back two steps and claws at the rock, her feet scrabbling; topples backward
// off the edge (the drop behind her), her wings flailing, her feathers swirling up after her.

/** Her death: how long; when she goes over the edge. */
export const Q2_DIE = { long: 2.0, over: 0.85 } as const;
function dieKeys(): Key[] {
  const R = standPose(0);
  const k = (t: number, body: V3, pitch: number, roll: number, head: V3, look: V3, W: WingPose, lit: number, o: Partial<QueenPose> = {}): Key => [t, with_(R, { body, pitch, roll, head, look, wings: both(W), lit, ...o })];
  return [
    [0, R],
    k(0.2, [-6, 0, 92], 50, 0, [66, 0, 170], [0.4, 0, 0.9], FLARE, 1, { gape: 1, heat: 1, ruffle: 1, tail: 1 }),
    k(0.36, [-24, 0, 86], 42, -4, [52, 0, 150], [0.6, 0, 0.6], mixWing(FLARE, R.wings[0], 0.3), 0.8, { gape: 0.9, heat: 0.9, ruffle: 0.8 }),
    k(0.56, [-42, 0, 80], 36, 5, [36, 0, 132], [0.9, 0, 0.1], mixWing(UP, FLARE, 0.5), 0.45, { gape: 0.8, heat: 0.5, ruffle: 0.8 }),
    // (clawing at the rock as it goes from under her)
    k(0.76, [-52, 0, 74], 26, -6, [28, 0, 106], [1, 0, -0.5], mixWing(R.wings[0], DOWN, 0.6), 0.15, { gape: 0.7, heat: 0.2, ruffle: 0.9 }),
    k(Q2_DIE.over, [-60, 0, 74], 44, 8, [6, 0, 126], [0.7, 0, 0.6], mixWing(DOWN, UP, 0.5), 0.05, { gape: 1, heat: 0, ruffle: 1 }),
    // (over, backward, into the drop, her wings flailing)
    k(1.12, [-86, 0, 30], 74, -14, [-40, 0, 104], [0.3, 0, 0.9], UP, 0, { gape: 1, heat: 0, ruffle: 1 }),
    k(1.4, [-108, 0, -34], 86, 18, [-84, 0, 40], [0, 0.3, 1], DOWN, 0, { gape: 0.8, heat: 0, ruffle: 1 }),
    k(1.7, [-124, 0, -96], 88, -20, [-110, 0, -24], [-0.2, -0.3, 1], UP, 0, { gape: 0.6, heat: 0, ruffle: 1 }),
    k(Q2_DIE.long, [-136, 0, -150], 88, 24, [-130, 0, -80], [-0.3, 0.3, 1], DOWN, 0, { gape: 0.5, heat: 0, ruffle: 1 }),
  ];
}
const DIE_KEYS = dieKeys();
function diePose(t: number): QueenPose {
  const P = through(DIE_KEYS, t);
  const R = standPose(0);
  const steps = (i: 0 | 1): Step[] => {
    const y = R.feet[i][1];
    const o = i ? 0.07 : 0;
    return [
      { t0: 0.18 + o, t1: 0.32 + o, to: [-18 - 6 * i, y, 0], lift: 10 },
      { t0: 0.42 + o, t1: 0.56 + o, to: [-38 - 6 * i, y, 0], lift: 10 },
      { t0: 0.62 + o, t1: 0.7 + o, to: [-48 - 4 * i, y * 0.9, 0], lift: 6 },
    ];
  };
  // (from the edge on she is falling: her feet go with her)
  const foot = (i: 0 | 1): V3 => {
    const down = footOn(R.feet[i], steps(i), t, P.feet[i]);
    const hung = add(P.body, [6, R.feet[i][1] * 0.8, -60]);
    return t < Q2_DIE.over ? down : lerp3(down, hung, sm((t - Q2_DIE.over) / 0.25));
  };
  return { ...P, feet: [foot(0), foot(1)], grasp: [t < Q2_DIE.over ? 0.9 : 0.2, t < Q2_DIE.over ? 0.9 : 0.2], drop: t >= Q2_DIE.over };
}

// ---------------------------------------------------------------------------------------------
// THE MOVES BY NAME

/** Her moves: her stand, her hop, her rake, her gust, her dive, her call, struck, her death. */
export const Q2_MOVES = ['stand', 'walk', 'attack', 'gust', 'dive', 'call', 'reel', 'dying'] as const;
export function queen2MovePose(move: string, t: number): QueenPose {
  switch (move) {
    case 'walk':
      return hopPose(t);
    case 'attack':
      return rakePose(t);
    case 'gust':
      return gustPose(t);
    case 'dive':
      return divePose(t);
    case 'call':
      return callPose(t);
    case 'reel':
      return reelPose(t);
    case 'dying':
      return diePose(t);
    default:
      return standPose(t);
  }
}
/** How long a move is (seconds); her stand and hop their rounds. */
export function queen2Long(move: string): number {
  switch (move) {
    case 'walk':
      return HOP_T;
    case 'attack':
      return Q2_RAKE.long;
    case 'gust':
      return Q2_GUST.long;
    case 'dive':
      return Q2_DIVE.long;
    case 'call':
      return Q2_CALL.long;
    case 'reel':
      return Q2_REEL;
    case 'dying':
      return Q2_DIE.long;
    default:
      return Q2_STAND;
  }
}

// ---------------------------------------------------------------------------------------------
// HER EFFECTS: grit and rock chips in the Ledge Road's own colours, her torn feathers, the cult's fire

const GRIT = ['#5e5664', '#6c6372', '#8a8090'];
const QUILL = ['#110d1a', '#1f1733', '#34285c'];
/** Her talons' tips at a moment (each foot's front three), in her lengths. */
function talonTips(P: QueenPose): V3[] {
  const out: V3[] = [];
  for (const i of [0, 1] as const) for (const deg of [-30, 0, 30]) {
    const d: V3 = [Math.cos(deg * D), Math.sin(deg * D), 0];
    out.push(add(P.feet[i], add(mul(d, 30), [0, 0, 2])));
  }
  return out;
}
/** A spray of grit and chips off the rock at `c`, `k` from 0 (just struck) to 1 (settled); how far it flies. */
function spray(g: Grain[], c: V3, k: number, n: number, far: number, seed: number): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    if (hash(i, 4, seed) < k * 0.95) continue;
    const a = hash(i, 1, seed) * TAU;
    const r = (0.25 + 0.75 * hash(i, 2, seed)) * far * Math.sqrt(k);
    const up = (10 + 30 * hash(i, 3, seed)) * Math.sin(Math.PI * Math.min(1, k * 1.25));
    g.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.8, Math.max(1, up)], GRIT[i % 3], i % 3 ? 4 : 6]);
  }
}
/** A ring of dust going out over the rock from `c`: thick, two rows deep, thinning as it goes. */
function dustRing(g: Grain[], c: V3, k: number, r0: number, r1: number, seed: number, cols: ReadonlyArray<string> = GRIT): void {
  if (k <= 0 || k >= 1) return;
  const r = mix(r0, r1, Math.sqrt(k));
  const n = Math.round(r / 2.5);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < n; i++) {
      if (hash(i, 7 + row, seed) < k * 0.85) continue;
      const a = (i / n) * TAU + hash(i, 8, seed) * 0.15;
      const rr = r - row * 7 * (1 - k);
      g.push([[c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, 1 + 6 * hash(i, 9, seed) * (1 - k)], cols[(i + row) % cols.length], row ? 4 : i % 3 ? 4 : 6]);
    }
  }
}
/** Her feathers torn off her, flying out from `c` along `d`, turning and falling. */
function torn(g: Grain[], c: V3, d: V3, k: number, n: number, far: number, seed: number): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const sp = (0.4 + 0.6 * hash(i, 1, seed)) * far;
    const side: V3 = [(hash(i, 2, seed) - 0.5) * far * 0.9, (hash(i, 3, seed) - 0.5) * far * 0.9, (hash(i, 4, seed) - 0.3) * far * 0.6];
    const q = add(c, add(mul(d, sp * Math.sqrt(k)), mul(side, k)));
    const p: V3 = [q[0], q[1], Math.max(1, q[2] - 50 * k * k)];
    const col = QUILL[i % 3];
    // (each a feather of three grains, turning as it goes)
    const a = k * 9 + i;
    const lie: V3 = [Math.cos(a) * 3, Math.sin(a) * 3, Math.sin(a * 1.3) * 3];
    g.push([p, col, 4]);
    g.push([add(p, lie), col, 4]);
    g.push([add(p, mul(lie, 2)), QUILL[2], 2]);
  }
}
/** Embers of the cult's fire rising off her crown. */
function embers(g: Grain[], P: QueenPose, t: number, n: number, seed: number): void {
  const base = add(P.body, [30, 0, 40]);
  for (let i = 0; i < n; i++) {
    const life = 0.5;
    const k = ((t + hash(i, 1, seed) * life) % life) / life;
    const p = add(base, [(hash(i, 2, seed) - 0.5) * 40 + Math.sin(k * 6 + i) * 4, (hash(i, 3, seed) - 0.5) * 40, 10 + 70 * k]);
    g.push([p, k < 0.4 ? FLAME[4] : k < 0.75 ? FLAME[3] : FLAME[2], k < 0.5 ? 4 : 2]);
  }
}
/** What her move throws off at a moment, from in front or behind: grains. */
export function queen2Grains(move: string, t: number, view: GameView = 'front'): Grain[] {
  const g: Grain[] = [];
  const back = view === 'back';
  if (move === 'walk') {
    // (a puff of grit off the rock where she lands)
    const T = ((t % HOP_T) + HOP_T) % HOP_T;
    const k = (T - Q2_HOP.land) / 0.16;
    if (k > 0 && k < 1) {
      for (const i of [0, 1] as const) {
        const f = hopPose(Q2_HOP.land).feet[i];
        dustRing(g, [f[0] - V * (T - Q2_HOP.land), f[1], 0], k, 6, 22, 900 + i);
      }
    }
  }
  if (move === 'attack') {
    // THE RAKE'S CLAW-STREAKS: where her talons went through the air, the cult's fire, fading
    if (t > Q2_RAKE.hit - 0.12 && t < Q2_RAKE.hit + 0.14) {
      for (let k = 0; k < 10; k++) {
        const ta = t - k * 0.012;
        if (ta < Q2_RAKE.hit - 0.12 || ta > Q2_RAKE.hit + 0.02) continue;
        const age = (t - Q2_RAKE.hit) / 0.14;
        const col = age > 0.6 ? FLAME[1] : age > 0.2 ? FLAME[2] : k < 3 ? FLAME[4] : FLAME[3];
        for (const p of talonTips(rakePose(ta))) g.push([p, col, k < 4 ? 4 : 2, back]);
      }
    }
    // (rock chips and dust kicked up where she comes down, and where she lands back)
    spray(g, [Q2_RAKE.landX + 6, 0, 0], (t - Q2_RAKE.land) / 0.5, 24, 60, 811);
    dustRing(g, [Q2_RAKE.landX + 6, 0, 0], (t - Q2_RAKE.land) / 0.4, 20, 70, 815);
    dustRing(g, [0, 0, 0], (t - 1.22) / 0.2, 10, 40, 816);
  }
  if (move === 'gust') {
    // THE BLAST: grit, her torn feathers and the cult's embers driven out before her; a ring of dust off the rock
    const k = (t - Q2_GUST.hit + 0.04) / 0.55;
    if (k > 0 && k < 1) {
      for (let i = 0; i < 110; i++) {
        if (hash(i, 5, 821) < k * 0.85) continue;
        const y = (hash(i, 1, 821) - 0.5) * 320;
        const z = 4 + hash(i, 2, 821) * 120;
        const x = 60 + (110 + 300 * hash(i, 3, 821)) * Math.sqrt(k) + Math.abs(y) * 0.1;
        const col = i % 9 === 0 ? FLAME[3] : i % 9 === 1 ? FLAME[2] : i % 4 === 0 ? '#a49aac' : GRIT[i % 3];
        const p: V3 = [x, y * (1 + 0.5 * k), Math.max(1, z - 24 * k)];
        g.push([p, col, i % 5 ? 4 : 6]);
        // (driven: a streak of the air behind each, pale)
        if (i % 2 === 0) for (let q = 1; q <= 3; q++) g.push([add(p, [-7 * q, 0, 0]), q === 1 ? col : '#8a8090', 2]);
      }
      torn(g, [70, 0, 90], [1, 0, 0.1], k, 14, 220, 822);
    }
    dustRing(g, [10, 0, 0], (t - Q2_GUST.hit) / 0.45, 30, 150, 823);
    if (t > 0.1 && t < 0.9) embers(g, gustPose(t), t, 6, 824);
  }
  if (move === 'dive') {
    // (a downdraft of grit off the rock as she launches)
    dustRing(g, [0, 0, 0], (t - Q2_DIVE.launch - 0.04) / 0.4, 20, 110, 831);
    // THE STOOP'S STREAK: in her own quills, behind her head and wrists
    if (t > Q2_DIVE.stoop + 0.04 && t < Q2_DIVE.hit) {
      for (let k = 1; k < 9; k++) {
        const ta = t - k * 0.016;
        if (ta < Q2_DIVE.stoop) continue;
        const P = divePose(ta);
        const pts = [P.head, wingBones(P, 1).wr, wingBones(P, -1).wr];
        for (const p of pts) g.push([p, QUILL[Math.min(2, Math.floor(k / 3))], k < 4 ? 4 : 2, true]);
      }
    }
    // (the crater: chips and a ring of dust where she strikes)
    spray(g, [Q2_DIVE.strikeX + 14, 0, 0], (t - Q2_DIVE.hit) / 0.6, 34, 80, 832);
    dustRing(g, [Q2_DIVE.strikeX + 10, 0, 0], (t - Q2_DIVE.hit) / 0.5, 20, 120, 833);
    dustRing(g, [0, 0, 0], (t - Q2_DIVE.home) / 0.3, 10, 50, 834);
  }
  if (move === 'call') {
    // RINGS OF THE CULT'S FIRE pulsing out over the rock; embers rising off her crown
    for (const [i, at] of Q2_CALL.rings.entries()) {
      const k = (t - at) / 0.5;
      dustRing(g, [0, 0, 0], k, 40, 240, 840 + i, k < 0.4 ? [FLAME[4], FLAME[3]] : k < 0.7 ? [FLAME[3], FLAME[2]] : [FLAME[2], FLAME[1]]);
    }
    if (t > 0.18 && t < 1.44) embers(g, callPose(t), t, 12, 845);
  }
  if (move === 'reel') {
    // (her feathers bursting from her breast)
    const P = standPose(0);
    torn(g, add(P.body, [30, 0, 0]), [0.6, 0, 0.5], (t - 0.03) / 0.38, 14, 70, 851);
  }
  if (move === 'dying') {
    // (her feathers swirling up after her as she falls)
    const k = (t - Q2_DIE.over) / (Q2_DIE.long - Q2_DIE.over);
    if (k > 0) {
      const P = diePose(t);
      for (let i = 0; i < 16; i++) {
        const born = hash(i, 1, 861) * 0.6;
        if (k < born) continue;
        const a = (k - born) * 5 + i;
        const p = add(P.body, [Math.cos(a) * (20 + 30 * hash(i, 2, 861)), Math.sin(a) * (20 + 30 * hash(i, 3, 861)), 40 + 160 * (k - born)]);
        if (p[2] < 2 && p[0] > -40) continue;
        g.push([p, QUILL[i % 3], 4]);
        g.push([add(p, [Math.cos(a * 2) * 3, 0, Math.sin(a * 2) * 3]), QUILL[i % 3], 4]);
      }
    }
    // (her feet scrabbling at the rock: grit)
    spray(g, [-46, 0, 0], (t - 0.62) / 0.4, 16, 40, 862);
  }
  return g;
}

// ---------------------------------------------------------------------------------------------
// HER PICTURES

/** One frame of her in a move, `t` seconds in, from in front or behind, as painted (her death without her pink edge, as the game paints every monster's). */
export function queen2MovePainted(move: string, t: number, view: GameView = 'front'): Painted {
  return paintQueen(view, queen2MovePose(move, t), t, queen2Grains(move, t, view), move !== 'dying');
}
/** THE CARRION QUEEN, as the game holds a monster's pictures. */
export function makeQueen2Art(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (move: string, t: number): Sprite => toSprite(queen2MovePainted(move, t, view), move === 'dying' ? null : { x: Q2_CANVAS.ax, y: Q2_CANVAS.ay - 120, r: 140, color: '#ff3a78', a: 0.08 }, Q2_CANVAS.ax, Q2_CANVAS.ay);
    const clip = (move: string, long: number, fps: number, hit?: number): Clip => ({ frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(move, i / fps)), fps, ...(hit === undefined ? {} : { hit }) });
    const attack = clip('attack', Q2_RAKE.long, 30, Q2_RAKE.hit);
    return {
      idle: lazyFrames(Q2_IDLE.frames, (i) => frame('stand', i / Q2_IDLE.fps)),
      walk: lazyFrames(Q2_WALK.frames, (i) => frame('walk', i / Q2_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[9, 18, 22][i]]),
      idleFps: Q2_IDLE.fps,
      walkFps: Q2_WALK.fps,
      clips: {
        attack,
        die: clip('dying', Q2_DIE.long, 20),
        reel: clip('reel', Q2_REEL, 30),
        moves: { gust: clip('gust', Q2_GUST.long, 30, Q2_GUST.hit), dive: clip('dive', Q2_DIVE.long, 30, Q2_DIVE.hit), call: clip('call', Q2_CALL.long, 30) },
      },
    };
  };
  return { front: set('front'), back: set('back') };
}
