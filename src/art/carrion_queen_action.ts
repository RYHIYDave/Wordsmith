// THE CARRION QUEEN'S MOVES DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f7_queen/README.md). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, QUEEN_ACTION, off: with it off the game's Carrion
// Queen is every frame as she was (art/carrion_queen2.ts and art/carrion_queen2_moves.ts, untouched; her old moves kept there).
//
// The owner's words, 31 Oct 2026. Offered a Gale pushing toward the drop: “I hesitate to have any move push or something cause I
// don’t want any player to get one shot cause they fell off a cliff or whatever”; then “I don’t want too much of the same thing.  So
// can we do something we haven’t done yet?”; asked to take the drop out, “Yes, no drop-pushes (Recommended)” (offered as: her gust
// shoves you away from her, never toward the edge; the crawler drags you to itself); asked for something no other fight has,
// “Eclipse (Recommended)” (offered as: her flock blots out the sun; the ledge dark but for a few pools of light drifting across it;
// vultures dive at anything outside the light). Under his Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual
// punch is lightning quick”) and his rule for the enemies (28 Oct, “Start from now on, but every enemy is going to need that change
// eventually.  And bigger AOE to compensate for the extra time the player gets to evade”); and of a boss's first pass, “His regular
// arm swipe is pretty lackluster”, “The rakes are lackluster”: so the plain blows big and fierce from the first pass.
//
// Every blow: a big wind-up HELD (the warning), trembling; the strike in TWO FRAMES, smeared with after-images of what strikes along
// the way it came (`qaSmeared`: the strike's frames and the one after); a big wind-down.
//   HER RAKE (`attack`): she bursts up off the rock, hangs high, her talons cocked up and forward, her wings flung wide, her claws'
//     lanes lit on the rock before her: HELD; dropped and raked down and through in two frames, the cult's fire torn along the rock
//     in three gouges out to 3.4 tiles; mantled over the spot, her head stabbing; a hop back.
//   HER GUST (`gust`), no drop-push: reared to her full height, her wings drawn far back and up, the cone before her marked on the
//     rock in rays running STRAIGHT OUT FROM HER: HELD; clapped forward in two frames, the blast driven straight out along the rays,
//     out to 7 tiles; rocked back by her own blow.
//   HER DIVE (`dive`): up off the rock and out of sight, hung there nose down, her line marked: HELD; down her line in two frames,
//     talons first, held a tenth in the crater, 4 tiles out; rips free and beats home.
//   THE ECLIPSE (`eclipse`, new): bowed, then reared, her wings spread to their widest, her beak to the sky, screaming: HELD, while
//     her flock gathers over the drop and the light dims; her wings swept down in two frames, and the flock pours over the ledge and
//     the light goes (art/carrion_queen_action_fx.ts: the dark, the pools of light, the dives out of the dark).
// Her stand, her hop, her call, struck and her death are the game's own (the very same moves).

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { FLARE, MANTLE, Q2_CANVAS, Q2_IDLE, Q2_SCALE, mixWing, paintQueen, standPose, wingBones } from './carrion_queen2';
import type { Grain, QueenPose, WingPose } from './carrion_queen2';
import { Q2_CALL, Q2_DIE, Q2_REEL, Q2_WALK, queen2Grains, queen2Long, queen2MovePose } from './carrion_queen2_moves';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { FLAME } from './mkit';
import type { GameView } from './skin';
import { add, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF. With it on, the game's Carrion Queen is `makeQueenActionArt` (art/act1_figs/queen.ts's to choose) and her rules the numbers below. */
export const QUEEN_ACTION = { on: false };

const FR = 1 / 30;
/** A moment on the game's frames: frame `n`, at 30 a second. */
export const f = (n: number): number => n / 30;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const k = cl01(v);
  return k * k * (3 - 2 * k);
};
const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
const D = Math.PI / 180;
const TAU = Math.PI * 2;
/** Her lengths to a tile (her own, as built: a tile is 32 / sqrt(2/3) of the figures' lengths, and she is built at Q2_SCALE). */
export const QA_TILE = 32 / Math.sqrt(2 / 3) / Q2_SCALE;

// =============================================================================================
// A MOVE MADE OF BEATS: poses at moments, each reached by its own ease (what is held is held, a blow is a flash)

type Ease = 'io' | 'lin' | 'out' | 'in';
type Beat = readonly [number, QueenPose, Ease?];
const EASE: Record<Ease, (u: number) => number> = {
  io: (u) => u * u * (3 - 2 * u),
  lin: (u) => u,
  // (thrown on from a blow, slowing: the follow-through)
  out: (u) => 1 - (1 - u) ** 2.4,
  in: (u) => u * u,
};
/** Two of her poses blended: her wings bone by bone (each turned evenly), the way she looks turned, the rest as numbers. */
function mixPose(A: QueenPose, B: QueenPose, k: number): QueenPose {
  const v = (a: V3, b: V3): V3 => lerp3(a, b, k);
  return {
    body: v(A.body, B.body),
    pitch: mix(A.pitch, B.pitch, k),
    yaw: mix(A.yaw, B.yaw, k),
    roll: mix(A.roll, B.roll, k),
    head: v(A.head, B.head),
    look: norm(v(A.look, B.look), [1, 0, 0]),
    gape: mix(A.gape, B.gape, k),
    wings: [mixWing(A.wings[0], B.wings[0], k), mixWing(A.wings[1], B.wings[1], k)],
    feet: [v(A.feet[0], B.feet[0]), v(A.feet[1], B.feet[1])],
    grasp: [mix(A.grasp[0], B.grasp[0], k), mix(A.grasp[1], B.grasp[1], k)],
    tail: mix(A.tail, B.tail, k),
    heat: mix(A.heat, B.heat, k),
    lit: mix(A.lit, B.lit, k),
    ruffle: mix(A.ruffle, B.ruffle, k),
    wingPitch: mix(A.wingPitch ?? 0, B.wingPitch ?? 0, k),
  };
}
/** Her pose `t` seconds into a move made of beats (the first and the last her stand's first frame). */
function beatPose(beats: ReadonlyArray<Beat>, t: number): QueenPose {
  if (t <= beats[0][0]) return beats[0][1];
  for (let i = 1; i < beats.length; i++) {
    const [t1, P1, e] = beats[i];
    if (t <= t1) {
      const [t0, P0] = beats[i - 1];
      return mixPose(P0, P1, EASE[e ?? 'io'](cl01((t - t0) / Math.max(1e-9, t1 - t0))));
    }
  }
  return beats[beats.length - 1][1];
}
/** Held, trembling: 1 from `a` to `b` (eased in and out over two frames), 0 else. */
function heldIn(t: number, a: number, b: number): number {
  return sm((t - a) / (2 * FR)) * (1 - sm((t - (b - 2 * FR)) / (2 * FR)));
}
const with_ = (P: QueenPose, o: Partial<QueenPose>): QueenPose => ({ ...P, ...o });
const both = (W: WingPose): [WingPose, WingPose] => [W, W];
/** A wing's pose raised a few degrees (its bones turned up about her body's line). */
function lift(W: WingPose, deg: number): WingPose {
  const c = Math.cos(deg * D);
  const sn = Math.sin(deg * D);
  const up = (v: V3): V3 => [v[0], v[1] * c - v[2] * sn, v[1] * sn + v[2] * c];
  return { ...W, arm: up(W.arm), fore: up(W.fore), hand: up(W.hand), top: up(W.top), tipTop: up(W.tipTop) };
}
/** A tremble through her held pose: her wings shaking up and down against each other, her head, her body. */
function trembled(P: QueenPose, k: number, t: number, deg: number, seed = 0): QueenPose {
  if (k <= 0) return P;
  const s = Math.sin(t * 40 + seed) * deg * k;
  const s2 = Math.sin(t * 33 + 1.3 + seed) * k;
  return { ...P, wings: [lift(P.wings[0], s), lift(P.wings[1], -s)], head: add(P.head, [s2 * 1.2, 0, s * 0.35]), body: add(P.body, [0, 0, s2 * 0.8]) };
}

// HER WINGS (as her moves have them, art/carrion_queen2_moves.ts: kept there, the same here)
const UP: WingPose = { arm: [-0.1, 0.45, 0.9], fore: [-0.15, 0.42, 0.9], hand: [-0.5, 0.3, 0.8], top: [0, -0.9, 0.4], tipTop: [0.1, -0.8, 0.5], open: 0.85, fan: 0.55 };
const DOWN: WingPose = { arm: [0.25, 0.85, -0.3], fore: [0.35, 0.85, -0.35], hand: [0.5, 0.6, -0.55], top: [0, 0.45, 0.9], tipTop: [0.1, 0.5, 0.85], open: 1, fan: 1 };
const GLIDE: WingPose = { arm: [0, 1, 0.12], fore: [-0.05, 1, 0.05], hand: [-0.25, 0.95, 0], top: [0, 0, 1], tipTop: [0, 0, 1], open: 1, fan: 1 };
const STOOP: WingPose = { arm: [-0.6, 0.75, 0.15], fore: [-0.75, 0.6, 0], hand: [-0.95, 0.25, 0], top: [0, 0, 1], tipTop: [0, 0, 1], open: 0.5, fan: 0.15 };
const DRAWN: WingPose = { arm: [-0.45, 0.45, 0.75], fore: [-0.6, 0.45, 0.65], hand: [-0.75, 0.35, 0.55], top: [-0.2, -0.9, 0.35], tipTop: [-0.1, -0.9, 0.4], open: 1, fan: 1 };
const CLAPPED: WingPose = { arm: [0.55, 0.75, 0.1], fore: [0.75, 0.6, -0.1], hand: [0.8, 0.2, -0.55], top: [-0.8, 0.3, 0.4], tipTop: [-0.8, 0.4, 0.3], open: 1, fan: 1 };
/** Her wings spread to their widest and high, every feather out: the Eclipse's summoning. */
const SPREAD: WingPose = lift({ arm: [0.05, 0.66, 0.75], fore: [0.3, 0.86, 0.42], hand: [0.42, 0.88, 0.2], top: [-0.9, 0.05, 0.42], tipTop: [-0.85, 0.15, 0.5], open: 1, fan: 1 }, 6);

const R0 = (): QueenPose => standPose(0);

// =============================================================================================
// HER RAKE (her blow): up, hung high and HELD, raked down and through in two frames, mantled, back

/**
 * Her rake (seconds; tiles before her). The strike: the last frame of her hold to the frame her talons land (`strike`); her blow
 * at `hit`; her landing `landX` of her lengths on. What it rakes (for the rules): from `from` to `to` before her, within `half`
 * and `spread` more for every tile out to either side (a wedge: 0.65 at her feet, 1.5 at its far end); the three gouges of the
 * cult's fire it tears along the rock run out to `to`. Old: 1.45 s, its blow at 0.72, from 0.2 to 2.5, 0.9 to either side.
 */
export const QA_RAKE = { long: f(56), up: f(18), hold: [f(18), f(30)] as const, strike: [f(30), f(32)] as const, hit: f(32), landX: 56, hop: [f(44), f(52)] as const, from: 0.2, to: 3.4, half: 0.65, spread: 0.25, lanes: [-24, 0, 24] as const } as const;
function rakeBeats(): Beat[] {
  const R = R0();
  const X = QA_RAKE.landX;
  const [h0, h1] = QA_RAKE.hold;
  const HUNG = with_(R, { body: [-12, 0, 172], pitch: 66, head: [R.head[0] - 6, 0, 190], look: [1, 0, -0.85], gape: 0.75, wings: both(lift(mixWing(UP, FLARE, 0.85), 6)), feet: [[60, 20, 132], [56, -20, 138]], grasp: [0, 0], tail: 1, heat: 1, ruffle: 0.9 });
  return [
    [0, R],
    // (she gathers: crouched, her wings thrown up)
    [f(6), with_(R, { body: [-6, 0, 68], pitch: 16, head: [R.head[0] - 8, 0, R.head[2] - 10], look: [1, 0, -0.4], wings: both(UP), grasp: [0.6, 0.6] })],
    // (up, in one hard wingbeat, her feet swinging up and forward)
    [f(12), with_(R, { body: [-8, 0, 132], pitch: 52, head: [R.head[0] - 4, 0, 170], look: [1, 0, -0.75], wings: both(DOWN), feet: [[22, 20, 46], [16, -20, 50]], grasp: [0.1, 0.1], tail: 0.9, ruffle: 0.6, heat: 0.8 })],
    // (THE WARNING: hung high, her talons cocked up and forward, open; her wings flung up and wide, her head low between them)
    [h0, HUNG],
    [h1, with_(HUNG, { body: [-14, 0, 176], pitch: 68, head: [R.head[0] - 8, 0, 192], feet: [[64, 20, 136], [60, -20, 142]] })],
    // (THE RAKE: dropped and raked down and through in two frames, her wings beating down to drive her)
    [QA_RAKE.hit, with_(R, { body: [X - 14, 0, 70], pitch: 24, head: [R.head[0] + X + 22, 0, 84], look: [1, 0, -0.95], gape: 1, wings: both(mixWing(FLARE, DOWN, 0.85)), feet: [[R.feet[0][0] + X, R.feet[0][1], 0], [R.feet[1][0] + X, R.feet[1][1], 0]], grasp: [1, 1], tail: 1, heat: 1, ruffle: 1 }), 'lin'],
    // (driven on into the rock, mantled over it, her head stabbing down at what is under her)
    [f(36), with_(R, { body: [X - 8, 0, 62], pitch: 12, head: [R.head[0] + X + 26, 0, 74], look: [1, 0, -1], gape: 0.9, wings: both({ ...MANTLE, arm: [0.25, 0.6, 0.6], fore: [0.55, 0.8, 0.0], hand: [0.5, 0.3, -0.8], open: 1, fan: 1 }), grasp: [1, 1], tail: 0.7, heat: 0.9, ruffle: 0.7 }), 'out'],
    [f(40), with_(R, { body: [X - 6, 0, 68], pitch: 18, head: [R.head[0] + X + 8, 0, 100], look: [1, 0, -0.5], gape: 0.5, wings: both({ ...MANTLE, arm: [0.15, 0.6, 0.7], fore: [0.4, 0.88, 0.1], open: 1, fan: 0.9 }), grasp: [1, 1], heat: 0.7 })],
    [QA_RAKE.hop[0], with_(R, { body: [X - 8, 0, R.body[2] - 8], pitch: 22, head: [R.head[0] + X, 0, R.head[2] - 6], look: [1, 0, -0.4], wings: both(mixWing(R.wings[0], UP, 0.3)), grasp: [0.6, 0.6], heat: 0.6 })],
    // (and back to where she stood, in a hop)
    [f(48), with_(R, { body: [X / 2, 0, R.body[2] + 18], pitch: 30, head: [R.head[0] + X / 2 + 6, 0, R.head[2] + 10], wings: both(mixWing(R.wings[0], DOWN, 0.4)), grasp: [0.6, 0.6] })],
    [QA_RAKE.hop[1], with_(R, { body: [-2, 0, R.body[2] - 6], pitch: R.pitch - 4, wings: both(mixWing(R.wings[0], { ...MANTLE, open: 1, fan: 1 }, 0.5)) })],
    [QA_RAKE.long, R],
  ];
}
const RAKE = rakeBeats();
function rakePose(t: number): QueenPose {
  const R = R0();
  const [h0, h1] = QA_RAKE.hold;
  const P = trembled(beatPose(RAKE, t), heldIn(t, h0, h1), t, 3.5);
  const shake = heldIn(t, h0, h1) * Math.sin(t * 38) * 3;
  const landAt = (i: 0 | 1): V3 => [R.feet[i][0] + QA_RAKE.landX, R.feet[i][1], 0];
  // her feet: down where she stood; lifted as she bursts up (hanging under her as her pose has them, her talons trembling as she
  // hangs); raked down onto their spot in her two frames and down there; lifted back to where she stood in her hop
  const foot = (i: 0 | 1): V3 => {
    if (t < f(6)) return R.feet[i];
    if (t < f(12)) return lerp3(R.feet[i], P.feet[i], sm((t - f(6)) / f(6)));
    if (t < QA_RAKE.strike[0]) return add(P.feet[i], [0, 0, shake]);
    // (her strike: her talons raked straight down from where they hung to the rock, in two frames)
    if (t < QA_RAKE.hit) return lerp3(beatPose(RAKE, QA_RAKE.strike[0]).feet[i], landAt(i), (t - QA_RAKE.strike[0]) / (QA_RAKE.hit - QA_RAKE.strike[0]));
    const [a, b] = QA_RAKE.hop;
    if (t < a) return landAt(i);
    if (t < b) {
      const k = sm((t - a) / (b - a));
      const p = lerp3(landAt(i), R.feet[i], k);
      return [p[0], p[1], 18 * Math.sin(Math.PI * k)];
    }
    return R.feet[i];
  };
  return { ...P, feet: [foot(0), foot(1)] };
}

// =============================================================================================
// HER GUST, NO DROP-PUSH: reared, drawn back and HELD, clapped in two frames, the blast straight out from her

/**
 * Her gust (seconds; tiles before her). What its blast strikes (for the rules): what is before her (from `-0.3`) out to `far`,
 * within `wide` and `spread` more for every tile out to either side; it shoves what it strikes STRAIGHT AWAY FROM HER, `push`
 * tiles at her feet and less further out (never less than `least`), over `pushFor` seconds; never toward the drop (the main chat's:
 * where straight away from her would be toward an edge, along the edge instead, or not at all). Its cone marked on the rock
 * from `hold[0]`. Old: 1.45 s, its clap at 0.68, out to 5.5, 1.2 and 0.45 more a tile; 3.4 tiles' shove.
 */
export const QA_GUST = { long: f(60), hold: [f(14), f(30)] as const, strike: [f(30), f(32)] as const, hit: f(32), far: 7.0, wide: 1.6, spread: 0.6, push: 4.0, least: 1.5, pushFor: 0.4, rays: 9 } as const;
function gustBeats(): Beat[] {
  const R = R0();
  const [h0, h1] = QA_GUST.hold;
  const drawn = (deg: number): [WingPose, WingPose] => both(lift(DRAWN, deg));
  return [
    [0, R],
    [f(6), with_(R, { body: [-6, 0, 76], pitch: 30, head: [80, 0, 120], look: [1, 0, -0.3], gape: 0.3, wings: both(mixWing(R.wings[0], DRAWN, 0.4)), heat: 0.6, ruffle: 0.5 })],
    // (THE WARNING: reared to her full height, her wings drawn far back and up, her head back, hissing)
    [h0, with_(R, { body: [-13, 0, 102], pitch: 62, head: [58, 0, 170], look: [0.85, 0, 0.45], gape: 0.6, wings: drawn(10), tail: 1, heat: 1, ruffle: 1 })],
    [h1, with_(R, { body: [-15, 0, 104], pitch: 64, head: [55, 0, 173], look: [0.82, 0, 0.5], gape: 0.7, wings: drawn(16), tail: 1, heat: 1, ruffle: 1 })],
    // (THE CLAP: her wings driven forward in two frames, her body thrown after them, her beak wide)
    [QA_GUST.hit, with_(R, { body: [10, 0, 84], pitch: 16, head: [118, 0, 114], look: [1, 0, -0.15], gape: 1, wings: both(CLAPPED), tail: 0.8, heat: 1, ruffle: 0.8 }), 'lin'],
    // (rocked back on her feet by her own blow)
    [f(40), with_(R, { body: [-8, 0, 86], pitch: 34, head: [84, 0, 134], look: [1, 0, -0.2], gape: 0.5, wings: both(mixWing(CLAPPED, R.wings[0], 0.4)), heat: 0.7, ruffle: 0.5 }), 'out'],
    [f(50), with_(R, { body: [-3, 0, 81], pitch: 27, head: [90, 0, 128], gape: 0.2, wings: both(mixWing(CLAPPED, R.wings[0], 0.88)), heat: 0.5 })],
    [QA_GUST.long, R],
  ];
}
const GUST = gustBeats();
function gustPose(t: number): QueenPose {
  const [h0, h1] = QA_GUST.hold;
  return { ...trembled(beatPose(GUST, t), heldIn(t, h0, h1), t, 2.4, 1), feet: R0().feet };
}

// =============================================================================================
// HER DIVE: up, out of sight, hung nose down and HELD while her line is marked; down it in two frames; held; home

/**
 * Her dive (seconds; tiles before her). She leaves the rock at `launch`; up out of sight and out of reach from `up[0]` to `up[1]`;
 * HELD up there nose down `hold`; down her line in two frames (`strike`), her talons in the rock at `hit`, `strikeX` of her
 * lengths on (her talons 8 more: `at` tiles), held `freeze`; home by `home`. What it strikes (for the rules): within `r` of where her talons strike,
 * and on her line from `line` to it, `half` to either side; her line marked on the rock from `launch`. Old: 2.2 s, her strike at
 * 1.08, 2.86 tiles out, within 1.1 and 0.6 to either side of her line.
 * HIS FIX, 2 Nov 2026, 07:32: “The carrion queen’s dive should be a much bigger AOE, and really sell it with dirt and dust on the
 * impact.” So `r` twice what it was (3.2, was 1.6), and the rock bursts where she strikes (art/carrion_queen_action_fx.ts
 * `paintDiveBurst`): the fountain of dirt, grit and broken rock, the ring of dust rolling out to the area's edge, chunks falling back
 * and bouncing, the dust hanging `dust` seconds after and drifting off; the crater and its cracks left `crater` seconds; the
 * game's shake `shake` (the most it uses).
 */
export const QA_DIVE = { long: f(84), launch: f(10), up: [f(14), f(46)] as const, hold: [f(29), f(46)] as const, strike: [f(46), f(48)] as const, hit: f(48), freeze: f(3), strikeX: 132, at: 4.0, r: 3.2, line: 1.0, half: 0.9, home: f(78), dust: 2.3, crater: 2.0, shake: 8 } as const;
function diveBeats(): Beat[] {
  const R = R0();
  const X = QA_DIVE.strikeX;
  const [h0, h1] = QA_DIVE.hold;
  const hang: V3[] = [[10, 16, -70], [6, -16, -66]];
  const k = (t: number, body: V3, pitch: number, head: V3, look: V3, W: WingPose, o: Partial<QueenPose> = {}, e?: Ease): Beat => [t, with_(R, { body, pitch, head, look, wings: both(W), feet: [add(body, hang[0]), add(body, hang[1])], grasp: [0.5, 0.5], tail: 0.8, ruffle: 0.4, ...o }), e];
  const STOOPED = (dz: number): Partial<QueenPose> => ({ heat: 1, ruffle: 0, wingPitch: -50, gape: 0.6 + dz * 0.01 });
  return [
    [0, R],
    [f(4), with_(R, { body: [-3, 0, 74], pitch: 20, head: [84, 0, 118], wings: both(mixWing(R.wings[0], UP, 0.45)), grasp: [0.5, 0.5] })],
    [f(9), with_(R, { body: [-4, 0, 66], pitch: 14, head: [80, 0, 110], look: [1, 0, -0.2], wings: both(UP), grasp: [0.7, 0.7] })],
    k(f(15), [-4, 0, 158], 62, [40, 0, 230], [0.6, 0, 0.8], DOWN),
    k(f(19), [-6, 0, 246], 64, [36, 0, 316], [0.6, 0, 0.8], mixWing(UP, GLIDE, 0.3)),
    k(f(23), [-6, 0, 312], 56, [44, 0, 376], [0.8, 0, 0.5], mixWing(DOWN, GLIDE, 0.35)),
    // (hung up there, out of sight, turning over into her stoop)
    k(f(26), [-4, 0, 340], 20, [60, 0, 384], [1, 0, -0.6], mixWing(UP, GLIDE, 0.5), { heat: 1 }),
    // (THE WARNING: nose down, her wings swept back along her, HELD, trembling: her line marked under her)
    k(h0, [8, 0, 334], -42, [60, 0, 302], [0.6, 0, -0.8], STOOP, STOOPED(0)),
    k(h1, [10, 0, 336], -46, [62, 0, 302], [0.58, 0, -0.82], STOOP, STOOPED(10)),
    // (THE STRIKE, in two frames: down her line, talons first, into the rock; her wings flung open to brake; held a tenth)
    [QA_DIVE.hit, with_(R, { body: [X - 18, 0, 82], pitch: 22, head: [X + 22, 0, 96], look: [1, 0, -0.9], gape: 1, wings: both(FLARE), grasp: [1, 1], tail: 1, heat: 1, ruffle: 1 }), 'lin'],
    [QA_DIVE.hit + QA_DIVE.freeze, with_(R, { body: [X - 18, 0, 80], pitch: 21, head: [X + 24, 0, 93], look: [1, 0, -0.92], gape: 1, wings: both(FLARE), grasp: [1, 1], tail: 1, heat: 1, ruffle: 1 })],
    // (ripping free, beating back up and home)
    k(f(57), [X - 26, 0, 124], 40, [X + 6, 0, 176], [1, 0, -0.4], DOWN, { feet: [[X - 8, 18, 30], [X - 12, -18, 34]] }),
    k(f(63), [X - 56, 0, 150], 40, [X - 26, 0, 208], [1, 0, -0.4], UP),
    k(f(69), [X - 92, 0, 140], 36, [X - 60, 0, 194], [1, 0, -0.4], DOWN),
    k(f(73), [X - 122, 0, 128], 34, [X - 92, 0, 180], [1, 0, -0.4], mixWing(UP, GLIDE, 0.4)),
    [QA_DIVE.home, with_(R, { body: [-2, 0, 90], pitch: 32, head: [80, 0, 136], look: [1, 0, -0.35], wings: both(mixWing(MANTLE, FLARE, 0.45)), grasp: [0.4, 0.4], tail: 0.7 })],
    [QA_DIVE.long, R],
  ];
}
const DIVE = diveBeats();
function divePose(t: number): QueenPose {
  const [h0, h1] = QA_DIVE.hold;
  const P = trembled(beatPose(DIVE, t), heldIn(t, h0, h1), t, 2.2, 2);
  const R = R0();
  const X = QA_DIVE.strikeX;
  const struck = (i: 0 | 1): V3 => [X + 10 - 4 * i, i ? -16 : 16, 0];
  const [s0, s1] = QA_DIVE.strike;
  const free = QA_DIVE.hit + QA_DIVE.freeze;
  const foot = (i: 0 | 1): V3 => {
    if (t < QA_DIVE.launch) return R.feet[i];
    if (t < QA_DIVE.launch + f(3)) return lerp3(R.feet[i], P.feet[i], sm((t - QA_DIVE.launch) / f(3)));
    if (t < s0) return P.feet[i];
    // (in her two frames her feet go down with her, thrown forward from where they hung under her to the rock: never stretched)
    if (t < s1) {
      const k = (t - s0) / (s1 - s0);
      const H = beatPose(DIVE, s1).body;
      return add(P.body, lerp3(sub(P.feet[i], P.body), sub(struck(i), H), k));
    }
    if (t < free + f(1)) return struck(i);
    if (t < free + f(4)) return lerp3(struck(i), P.feet[i], sm((t - free - f(1)) / f(3)));
    if (t < QA_DIVE.home - f(3)) return P.feet[i];
    if (t < QA_DIVE.home) return lerp3(P.feet[i], R.feet[i], sm((t - (QA_DIVE.home - f(3))) / f(3)));
    return R.feet[i];
  };
  return { ...P, feet: [foot(0), foot(1)] };
}

// =============================================================================================
// THE ECLIPSE: bowed; reared, her wings spread to their widest, screaming, HELD; swept down in two frames: the light goes

/**
 * THE ECLIPSE (seconds; tiles). Her summoning (`eclipse`, `long`): bowed, then reared, HELD from `hold[0]` (her flock gathering
 * over the drop, the light dimming); her wings swept down in two frames (`strike`), at `hit` THE LIGHT GOES: over `fall` the dark
 * comes across the ledge from the drop with her flock; it holds `dark` seconds from `hit`; then her flock scatters and the light
 * comes back over `back`. In the dark (the rules'; art/carrion_queen_action_fx.ts paints it): `pools` pools of light, each `r`
 * across... round, drifting at `drift` tiles a second; while the hero is outside every pool, a vulture dives at him every `every`
 * seconds (the first `first` after the dark falls): its line marked on the rock `warn` seconds first, from `from` tiles off to
 * where he stood, then down it in two frames; it strikes within `hitR` of where he stood and along the last `tail` tiles of its line
 * `half` to either side. A pool is never dived at.
 */
export const QA_ECLIPSE = {
  long: f(90), bow: f(8), hold: [f(24), f(50)] as const, strike: [f(50), f(52)] as const, hit: f(52),
  fall: 0.2, dark: 8.0, back: 0.3, dim: 0.82,
  pools: 3, r: 1.7, drift: 0.4,
  every: 1.4, first: 0.8, warn: 0.7, from: 4.5, hitR: 0.9, tail: 1.6, half: 0.45,
} as const;
function eclipseBeats(): Beat[] {
  const R = R0();
  const [h0, h1] = QA_ECLIPSE.hold;
  const SCREAM = with_(R, { body: [-10, 0, 104], pitch: 64, head: [54, 0, 192], look: [0.22, 0, 0.97], gape: 1, wings: both(SPREAD), tail: 1, heat: 1, ruffle: 1, lit: 1 });
  return [
    [0, R],
    // (bowed low, her wings drawn in about her, her head down: gathering)
    [QA_ECLIPSE.bow, with_(R, { body: [-4, 0, 70], pitch: 16, head: [98, 0, 100], look: [1, 0, -0.7], gape: 0.2, wings: both(mixWing(R.wings[0], MANTLE, 1)), heat: 0.8, ruffle: 0.5, tail: 0.4 })],
    // (flung up: her wings thrown up and out, her head thrown back)
    [f(17), with_(R, { body: [-8, 0, 96], pitch: 52, head: [66, 0, 172], look: [0.5, 0, 0.86], gape: 0.8, wings: both(mixWing(UP, SPREAD, 0.6)), heat: 1, ruffle: 0.9, tail: 0.9 })],
    // (THE WARNING: reared to her full height, her wings spread to their widest, her beak to the sky, screaming: HELD, shaking)
    [h0, SCREAM],
    [h1, with_(SCREAM, { body: [-11, 0, 106], head: [53, 0, 194], wings: both(lift(SPREAD, 4)) })],
    // (THE STRIKE: her wings swept down and forward in two frames, her body thrown after them, her beak wide: the light goes)
    [QA_ECLIPSE.hit, with_(R, { body: [6, 0, 86], pitch: 28, head: [108, 0, 118], look: [1, 0, -0.3], gape: 1, wings: both(DOWN), tail: 1, heat: 1, ruffle: 1 }), 'lin'],
    // (carried on down by it, mantled, glaring out into the dark)
    [f(58), with_(R, { body: [2, 0, 76], pitch: 20, head: [104, 0, 108], look: [1, 0, -0.5], gape: 0.8, wings: both(mixWing(DOWN, MANTLE, 0.35)), heat: 1, ruffle: 0.8, tail: 0.8 }), 'out'],
    [f(72), with_(R, { body: [-1, 0, 78], pitch: 24, head: [96, 0, 120], look: [1, 0, -0.4], gape: 0.5, wings: both(mixWing(DOWN, MANTLE, 0.85)), heat: 0.8, ruffle: 0.5 })],
    [QA_ECLIPSE.long, R],
  ];
}
const ECLIPSE = eclipseBeats();
function eclipsePose(t: number): QueenPose {
  const [h0, h1] = QA_ECLIPSE.hold;
  const P = trembled(beatPose(ECLIPSE, t), heldIn(t, h0, h1), t, 2.4, 3);
  return { ...P, feet: R0().feet };
}

// =============================================================================================
// THE MOVES BY NAME

/** Her moves done the action way; the rest (her stand, her hop, her call, struck, her death) are the game's own. */
export const QA_NEW = ['attack', 'gust', 'dive', 'eclipse'] as const;
export const QA_MOVES = ['stand', 'walk', 'attack', 'gust', 'dive', 'call', 'eclipse', 'reel', 'dying'] as const;
/** Each new move's strike: from the last frame of its wind-up to the frame it lands on (seconds, on the game's frames). */
export const QA_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: QA_RAKE.strike, gust: QA_GUST.strike, dive: QA_DIVE.strike, eclipse: QA_ECLIPSE.strike };
/** Each new move's held warning (seconds), and its blow. */
export const QA_HOLDS: Readonly<Record<string, readonly [number, number]>> = { attack: QA_RAKE.hold, gust: QA_GUST.hold, dive: QA_DIVE.hold, eclipse: QA_ECLIPSE.hold };
export const QA_HITS: Readonly<Record<string, number>> = { attack: QA_RAKE.hit, gust: QA_GUST.hit, dive: QA_DIVE.hit, eclipse: QA_ECLIPSE.hit };
/** Whether a frame of a move is painted with its smear: the strike's frames, and the one after. */
export function qaSmeared(move: string, t: number): boolean {
  const s = QA_STRIKES[move];
  if (!s) return false;
  return t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
export function queenActionPose(move: string, t: number): QueenPose {
  switch (move) {
    case 'attack':
      return rakePose(t);
    case 'gust':
      return gustPose(t);
    case 'dive':
      return divePose(t);
    case 'eclipse':
      return eclipsePose(t);
    default:
      return queen2MovePose(move, t);
  }
}
export function queenActionLong(move: string): number {
  switch (move) {
    case 'attack':
      return QA_RAKE.long;
    case 'gust':
      return QA_GUST.long;
    case 'dive':
      return QA_DIVE.long;
    case 'eclipse':
      return QA_ECLIPSE.long;
    default:
      return queen2Long(move);
  }
}

// =============================================================================================
// WHAT HER NEW MOVES THROW OFF: her smears, grit and chips, her torn feathers, the cult's fire

const GRIT = ['#5e5664', '#6c6372', '#8a8090'];
const QUILL = ['#110d1a', '#1f1733', '#34285c'];
const WHITE = '#fff6e0';
/** Her talons' tips at a moment (each foot's front three), in her lengths. */
export function talonTips(P: QueenPose): V3[] {
  const out: V3[] = [];
  for (const i of [0, 1] as const) for (const deg of [-30, 0, 30]) out.push(add(P.feet[i], add(mul([Math.cos(deg * D), Math.sin(deg * D), 0], 30), [0, 0, 2])));
  return out;
}
function spray(g: Grain[], c: V3, k: number, n: number, far: number, seed: number): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    if (hash(i, 4, seed) < k * 0.95) continue;
    const a = hash(i, 1, seed) * TAU;
    const r = (0.25 + 0.75 * hash(i, 2, seed)) * far * Math.sqrt(k);
    const up = (10 + 40 * hash(i, 3, seed)) * Math.sin(Math.PI * Math.min(1, k * 1.25));
    g.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.8, Math.max(1, up)], GRIT[i % 3], i % 3 ? 4 : 6]);
  }
}
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
function torn(g: Grain[], c: V3, d: V3, k: number, n: number, far: number, seed: number): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const sp = (0.4 + 0.6 * hash(i, 1, seed)) * far;
    const side: V3 = [(hash(i, 2, seed) - 0.5) * far * 0.9, (hash(i, 3, seed) - 0.5) * far * 0.9, (hash(i, 4, seed) - 0.3) * far * 0.6];
    const q = add(c, add(mul(d, sp * Math.sqrt(k)), mul(side, k)));
    const p: V3 = [q[0], q[1], Math.max(1, q[2] - 50 * k * k)];
    const col = QUILL[i % 3];
    const a = k * 9 + i;
    const lie: V3 = [Math.cos(a) * 3, Math.sin(a) * 3, Math.sin(a * 1.3) * 3];
    g.push([p, col, 4]);
    g.push([add(p, lie), col, 4]);
    g.push([add(p, mul(lie, 2)), QUILL[2], 2]);
  }
}
function embers(g: Grain[], P: QueenPose, t: number, n: number, seed: number, high = 70): void {
  const base = add(P.body, [30, 0, 40]);
  for (let i = 0; i < n; i++) {
    const life = 0.5;
    const k = ((t + hash(i, 1, seed) * life) % life) / life;
    const p = add(base, [(hash(i, 2, seed) - 0.5) * 50 + Math.sin(k * 6 + i) * 4, (hash(i, 3, seed) - 0.5) * 50, 10 + high * k]);
    g.push([p, k < 0.4 ? FLAME[4] : k < 0.75 ? FLAME[3] : FLAME[2], k < 0.5 ? 4 : 2]);
  }
}
/**
 * HER SMEAR, on a strike's frames and the one after: after-images of what strikes, along the way it came from the last frame of
 * her hold (`s0`) to now, the newest white-hot, then gold, then her pink, the oldest dull plum; each point's path sampled `n` times.
 */
function smear(g: Grain[], move: string, t: number, pts: (P: QueenPose) => V3[], n: number, back: boolean, big = 6): void {
  const [s0, s1] = QA_STRIKES[move];
  const t1 = Math.min(t, s1);
  const after = t > s1 + 1e-6;
  for (let q = 0; q <= n; q++) {
    const tq = s0 + ((t1 - s0) * q) / n;
    const age = (t1 - tq) / (s1 - s0) + (after ? 0.6 : 0);
    const col = age < 0.18 ? WHITE : age < 0.45 ? FLAME[4] : age < 0.8 ? FLAME[3] : age < 1.2 ? FLAME[2] : FLAME[1];
    const size = age < 0.45 ? big : age < 1 ? 4 : 2;
    for (const p of pts(queenActionPose(move, tq))) g.push([p, col, size, back && age > 0.3]);
  }
}
/** HER SMEAR at a moment of one of her new moves (none but on its strike's frames and the one after), from in front or behind. */
export function qaSmear(move: string, t: number, view: GameView = 'front'): Grain[] {
  const g: Grain[] = [];
  if (!qaSmeared(move, t)) return g;
  const back = view === 'back';
  if (move === 'attack') smear(g, move, t, talonTips, 40, back, 6);
  else if (move === 'dive') smear(g, move, t, (P) => [P.head, P.body, add(P.body, [0, 12, 30]), add(P.body, [0, -12, 30]), add(P.body, [10, 0, -20]), wingBones(P, 1).wr, wingBones(P, -1).wr, wingBones(P, 1).tip, wingBones(P, -1).tip], 40, back, 6);
  else smear(g, move, t, wingPts, 40, back, 6);
  return g;
}
/** Her wings' leading points (wrist and tip of each), in her lengths. */
const wingPts = (P: QueenPose): V3[] => [1, -1].flatMap((sd) => {
  const w = wingBones(P, sd as 1 | -1);
  return [w.wr, w.tip, lerp3(w.wr, w.tip, 0.5), w.trail[1]];
});
/** What one of her new moves throws off at a moment, from in front or behind (her other moves: the game's own). */
export function queenActionGrains(move: string, t: number, view: GameView = 'front'): Grain[] {
  if (!QA_NEW.includes(move as (typeof QA_NEW)[number])) return queen2Grains(move, t, view);
  const g: Grain[] = [];
  if (move === 'attack') {
    // (a downdraft of grit off the rock as she bursts up)
    dustRing(g, [0, 0, 0], (t - f(9)) / 0.35, 20, 90, 1811);
    g.push(...qaSmear(move, t, view));
    // (the cult's fire torn off her talons as they bite the rock: sparks thrown up and on; the gouges along the rock are the floor's,
    // art/carrion_queen_action_fx.ts)
    const k = (t - QA_RAKE.hit) / 0.4;
    if (k > 0 && k < 1) {
      for (const p of talonTips(rakePose(QA_RAKE.hit))) {
        for (let i = 0; i < 4; i++) {
          const s = hash(i, p[1] | 0, 1812);
          const q: V3 = [p[0] + (10 + 50 * s) * Math.sqrt(k), p[1] * (1 + 0.4 * k), 2 + (30 + 20 * s) * Math.sin(Math.PI * Math.min(1, k * 1.3))];
          g.push([q, k < 0.25 ? WHITE : k < 0.5 ? FLAME[4] : k < 0.75 ? FLAME[3] : FLAME[2], k < 0.5 ? 4 : 2]);
        }
      }
    }
    // (rock chips and dust kicked up where she comes down, and where she lands back)
    spray(g, [QA_RAKE.landX + 10, 0, 0], (t - QA_RAKE.hit) / 0.55, 34, 80, 1813);
    dustRing(g, [QA_RAKE.landX + 10, 0, 0], (t - QA_RAKE.hit) / 0.45, 24, 100, 1814);
    dustRing(g, [0, 0, 0], (t - QA_RAKE.hop[1]) / 0.25, 10, 44, 1815);
    if (t > QA_RAKE.up && t < QA_RAKE.hit) embers(g, rakePose(t), t, 8, 1816);
  }
  if (move === 'gust') {
    g.push(...qaSmear(move, t, view));
    // THE BLAST, STRAIGHT OUT FROM HER: grit, her torn feathers and the cult's embers, each along a ray from her, never sideways
    const k = (t - QA_GUST.hit + FR) / 0.6;
    if (k > 0 && k < 1) {
      for (let i = 0; i < 150; i++) {
        if (hash(i, 5, 1821) < k * 0.8) continue;
        const lim = Math.atan(QA_GUST.spread) * 0.95;
        const a = (hash(i, 1, 1821) * 2 - 1) * lim;
        const r = 40 + (120 + 140 * hash(i, 3, 1821)) * Math.sqrt(k);
        const z = 4 + hash(i, 2, 1821) * 110 * (1 - 0.5 * k);
        const col = i % 9 === 0 ? FLAME[3] : i % 9 === 1 ? FLAME[2] : i % 4 === 0 ? '#a49aac' : GRIT[i % 3];
        const p: V3 = [Math.cos(a) * r, Math.sin(a) * r, Math.max(1, z)];
        g.push([p, col, i % 5 ? 4 : 6]);
        // (driven: a streak of the air behind each, back toward her along its own ray)
        if (i % 2 === 0) for (let q = 1; q <= 3; q++) g.push([[Math.cos(a) * (r - 8 * q), Math.sin(a) * (r - 8 * q), p[2]], q === 1 ? col : '#8a8090', 2]);
      }
      torn(g, [70, 0, 90], [1, 0, 0.05], k, 18, 240, 1822);
    }
    dustRing(g, [10, 0, 0], (t - QA_GUST.hit) / 0.45, 30, 170, 1823);
    if (t > f(6) && t < f(40)) embers(g, gustPose(t), t, 8, 1824);
  }
  if (move === 'dive') {
    dustRing(g, [0, 0, 0], (t - QA_DIVE.launch - FR) / 0.4, 20, 120, 1831);
    // (her smear: her whole body down the way she came, her quills' after-images edged in her pink)
    g.push(...qaSmear(move, t, view));
    // (where she strikes, the rock bursts: painted on the eyrie, not on her: art/carrion_queen_action_fx.ts paintDiveBurst; here only
    // the grit kicked off her own talons as they bite)
    spray(g, [QA_DIVE.strikeX + 14, 0, 0], (t - QA_DIVE.hit) / 0.35, 20, 60, 1832);
    dustRing(g, [0, 0, 0], (t - QA_DIVE.home) / 0.3, 10, 50, 1834);
  }
  if (move === 'eclipse') {
    const [h0, h1] = QA_ECLIPSE.hold;
    if (t > f(12) && t < f(60)) embers(g, eclipsePose(t), t, 14, 1841, 110);
    // (her feathers shaken loose as she screams, whirled up)
    const kk = (t - h0) / (h1 - h0);
    if (kk > 0 && kk < 1) torn(g, add(eclipsePose(t).body, [10, 0, 60]), [0, 0, 1], kk, 10, 120, 1842);
    g.push(...qaSmear(move, t, view));
    // (at her sweep: her feathers torn off and flung out round her, and a ring of dust thrown out over the rock)
    torn(g, [20, 0, 90], [0.6, 0, -0.2], (t - QA_ECLIPSE.hit + FR) / 0.6, 22, 220, 1843);
    dustRing(g, [0, 0, 0], (t - QA_ECLIPSE.hit) / 0.5, 30, 200, 1844);
  }
  return g;
}

// =============================================================================================
// HER PICTURES

/** One frame of her in a move, `t` seconds in, from in front or behind, as painted (her death without her pink edge, as the game's). */
export function queenActionPainted(move: string, t: number, view: GameView = 'front'): Painted {
  return paintQueen(view, queenActionPose(move, t), t, queenActionGrains(move, t, view), move !== 'dying');
}
/** THE CARRION QUEEN WITH THESE MOVES, as the game holds a monster's pictures (as makeQueen2Art, her rake, gust and dive new, and the Eclipse among her moves). */
export function makeQueenActionArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (move: string, t: number): Sprite => toSprite(queenActionPainted(move, t, view), move === 'dying' ? null : { x: Q2_CANVAS.ax, y: Q2_CANVAS.ay - 120, r: 140, color: '#ff3a78', a: 0.08 }, Q2_CANVAS.ax, Q2_CANVAS.ay);
    const clip = (move: string, long: number, fps: number, hit?: number): Clip => ({ frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(move, i / fps)), fps, ...(hit === undefined ? {} : { hit }) });
    const attack = clip('attack', QA_RAKE.long, 30, QA_RAKE.hit);
    return {
      idle: lazyFrames(Q2_IDLE.frames, (i) => frame('stand', i / Q2_IDLE.fps)),
      walk: lazyFrames(Q2_WALK.frames, (i) => frame('walk', i / Q2_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[12, 24, 32][i]]),
      idleFps: Q2_IDLE.fps,
      walkFps: Q2_WALK.fps,
      clips: {
        attack,
        die: clip('dying', Q2_DIE.long, 20),
        reel: clip('reel', Q2_REEL, 30),
        moves: {
          gust: clip('gust', QA_GUST.long, 30, QA_GUST.hit),
          dive: clip('dive', QA_DIVE.long, 30, QA_DIVE.hit),
          call: clip('call', Q2_CALL.long, 30),
          eclipse: clip('eclipse', QA_ECLIPSE.long, 30, QA_ECLIPSE.hit),
        },
      },
    };
  };
  return { front: set('front'), back: set('back') };
}
