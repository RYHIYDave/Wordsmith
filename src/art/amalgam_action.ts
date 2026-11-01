// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f4_amalgam/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, AMALGAM_ACTION, off: with it off the game's
// Amalgamation is every frame as it was (art/bosses3.ts: its moves there are kept as they are; what these are built on is only said
// again by name, AM_KIT, and its heap may now be REARED UP ON ITS ARMS, by two of its bones' fields no move of the game's sets).
//
// The owner's words, 31 Oct 2026, in his review of every enemy for more action, offered "Bone rain, in place of the skull fan: the
// ossuary's niches shed skulls over the whole floor, shadows first, leaving bone piles that slow you": “Let’s make the change plus
// add the action to all his moves cause he is not intimidating at all”. Then, told it would get every move redone the action way (a
// huge held wind-up, a lightning-fast blow, bigger areas, a combo finisher where it fits): “Just draw it”. Under his rules: Movement
// 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start
// from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player
// gets to evade”).
//
// So it LOOMS: before each big move it REARS UP TO ITS FULL HEIGHT ON ITS ARMS (its hind hands drawn in under it and gripping, the
// heap heaved up off the floor, tipped back and swelling, near twice as high as it lies; its four foremost arms raised, claws
// spread; its maw gaping, the fire in its cracks flaring, every skull's eyes burning), HOLDS there, trembling; and comes down in two
// frames with a weight that shakes the floor (dust, sparks, a ring of cracks: art/amalgam_action_fx.ts). Each move kept what it is:
//   THE SWIPE (`attack`), a combo: its right front arm drawn up and back, held, raked across before it in two frames; its left, the
//     same the other way; then THE FINISHER: reared up, both great arms raised over it, held longest, and slammed down together
//     before it, the heap crashing down behind them: a ring of cracks out over the floor.
//   THE BONE RAIN (`rain`, in place of the skull swarm): reared up, roaring, held; all four arms slammed down: the ossuary shakes,
//     and its walls' niches shed skulls over the whole floor in three waves, each skull's shadow on the floor first, bursting where
//     it lands and leaving a pile of bones that slows you (art/amalgam_action_fx.ts RAIN). The skull swarm stays in art/bosses3.ts,
//     out of this one's set.
//   THE FLOOR ARMS (`floorArms`): reared up higher and held longer; slammed down, flat, the floor cracking out round it; pressed
//     there, shuddering, while more arms of the dead than before, and bigger, burst up under you and round you.
//   DEVOUR (`devour`): reared up, its maw gaping wide, its arms flung out wide, held (the cone marked); THE RAKE, in two frames,
//     both arms flung out and their claws driven into the floor at the end of their reach; THE DRAG, hauled in, all that lies there
//     and you with it; the maw held wide; THE BITE, snapped shut in two frames; the gulp.
// Its stand, its crawl, setting off and stopping, struck, its death and a bone beast bursting out of it are the game's own.

import type { ActorArt } from './actor_types';
import { AMALGAM, AM_CANVAS, AM_KIT, AM_SHAPE, amGeometry } from './bosses3';
import type { HandMove, HandTrack } from './bosses3';
import type { BossShape, Handover } from './boss_checks';
import { TILE3, mobSet, posedOfMob, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Ropes } from './new_mobs3';
import type { Stage } from './skin';
import { add, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';
import { FLAME } from './mkit';

type P = Partial<Bones>;
const K = AM_KIT;
const R = K.REST;
const PL = K.PLANT;
const FR = 1 / 30;
/** A moment on the game's frames: frame `n`, at 30 a second. */
const f = (n: number): number => n / 30;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** THE SWITCH, OFF. With it on, the game's Amalgamation is `makeAmalgamActionArt` (the bestiary's to choose). */
export const AMALGAM_ACTION = { on: false };

// =============================================================================================
// REARED UP ON ITS ARMS: how it looms before its big moves

/** Reared to its full height (art/bosses3.ts amFrameReared): heaved up 14 of its lengths, tipped back 22 degrees, swelling, its maw wide, every arm on it flailing. */
export const REAR = { lift: 14, tilt: 22, heave: 14 } as const;
const REARED: P = { pz: R.pz + REAR.heave, faceUp: REAR.lift, faceTilt: REAR.tilt, pitch: R.pitch, px: -2, draw: 1, pt: 1 };
/** Reared, trembling (a held pose a little shaken: `k` -1 to 1). */
const trembling = (k: number, over: P = {}): P => ({ ...REARED, py: 0.8 * k, pz: (REARED.pz as number) + 0.5 * k, ...over });
/** Its arms reared: the two great front arms raised over it, claws spread; the two at its sides raised out wide; its hind hands drawn in under it, gripping. */
const UP: Readonly<Record<string, V3>> = {
  R1: [62, -40, 76], L1: [44, 66, 84],
  R2: [14, -72, 58], L2: [16, 74, 58],
  R3: [-22, -48, 0], L3: [-20, 50, 0],
};
/** Where its hands come down slammed: the two front ones flat on the floor before it; the two at its sides where they grip at rest. */
const SLAM: Readonly<Record<string, V3>> = {
  R1: [66, -22, 0], L1: [68, 24, 0],
  R2: PL.R2, L2: PL.L2,
};
/** Crashed down: squashed flat on the floor and thrown forward over its hands. */
const CRASH: P = { pz: R.pz - 5, pitch: R.pitch + 7, px: 3, faceUp: 0, faceTilt: 0, draw: 0.8, pt: 1 };
const SQUASH: P = { pz: R.pz - 11, pitch: R.pitch + 10, px: 4, draw: 0.7, pt: 1 };

/** Its fire flaring (0 to 1), `t` seconds in: rising from `a` to `b`, held, dying from `c` to `d`. */
const burning = K.burning;

/** A hand's way up into the rear from its grip (lifted off the floor and out to `to`), and trembling there. */
function rearUp(name: string, t0: number, t1: number, holdTo: number, d: V3): HandMove[] {
  const to = UP[name];
  const mid = (t1 + holdTo) / 2;
  return [
    { t0, t1, to, via: [add(PL[name], [0, 0, 20])], lift: 8 },
    { t0: t1, t1: mid, to: add(to, d) },
    { t0: mid, t1: holdTo, to: add(to, mul(d, -0.4)) },
  ];
}
/** A hind hand drawn in under it as it rears (stepped in), and stepped back out to its grip at the end. */
function hindIn(name: string, t0: number, back0: number, back1: number): HandMove[] {
  return [
    { t0, t1: t0 + 0.3, to: UP[name], lift: 7 },
    { t0: back0, t1: back1, to: PL[name], lift: 7 },
  ];
}
/** Back from where it slammed to where it grips (a little step), at the end. */
const homeFrom = (name: string, t0: number, t1: number): HandMove[] => (SLAM[name] === PL[name] ? [] : [{ t0, t1, to: PL[name], lift: 6 }]);

// =============================================================================================
// THE SWIPE, A COMBO: its right arm, its left, and the finisher

/**
 * THE SWIPE'S MOMENTS (seconds; on the game's frames). Each blow: its strike from the last frame of its wind-up to the frame it
 * lands on (two frames), the blow on its last.
 *   the right   drawn up and back by 0.333 s (f10), HELD to 0.667 (f20); its body turns from f20; strike f22-f24, blow 0.8 s
 *   the left    drawn up and back by 1.267 s (f38), HELD to 1.6 (f48); strike f50-f52, blow 1.733 s
 *   finisher    reared by 2.4 s (f72), HELD to 2.867 (f86); strike f88-f90, blow 3.0 s; crashed, pressed, settled by 4.0 s
 */
export const SWIPE_STRIKES = [[f(22), f(24)], [f(50), f(52)], [f(88), f(90)]] as const;
export const SWIPE_HITS = [f(24), f(52), f(90)] as const;
export const SWIPE_LONG = f(120);
/** Where each rake's claws go: drawn back high at its side; raked across low before it (through these), and on round to its other side. */
const RAKE_R: { back: V3; via: V3[]; to: V3; on: V3 } = { back: [18, -66, 54], via: [[46, -62, 24], [64, -36, 7], [68, -12, 7]], to: [62, -6, 8], on: [58, 3, 32] };
const RAKE_L: { back: V3; via: V3[]; to: V3; on: V3 } = { back: [22, 68, 54], via: [[48, 64, 24], [66, 38, 7], [70, 12, 7]], to: [68, -8, 9], on: [60, -22, 24] };
function swipeHands(): (t: number) => Record<string, V3> {
  const [h1, h2, h3] = SWIPE_HITS;
  return K.handwork({
    R1: {
      start: PL.R1,
      moves: [
        { t0: f(1), t1: f(10), to: RAKE_R.back, lift: 10 },
        { t0: f(10), t1: f(15), to: add(RAKE_R.back, [0.6, -0.8, 1.4]) },
        { t0: f(15), t1: f(20), to: add(RAKE_R.back, [0.2, -0.3, 0.4]) },
        { t0: f(20), t1: f(22), to: add(RAKE_R.back, [-1.2, -1.4, 1.2]) },
        { t0: SWIPE_STRIKES[0][0], t1: h1, to: RAKE_R.to, via: RAKE_R.via, ease: 'strike' },
        { t0: h1, t1: f(32), to: RAKE_R.on, ease: 'io' },
        { t0: f(33), t1: f(42), to: PL.R1, via: [[64, -8, 22]], lift: 8 },
        // the finisher: raised over it with the other, held, slammed
        ...rearUp('R1', f(58), f(72), f(86), [0.6, -0.8, 1.4]),
        { t0: f(86), t1: f(88), to: add(UP.R1, [-1.5, -0.6, 1.5]) },
        { t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.R1, via: [[56, -30, 44]], ease: 'strike' },
        ...homeFrom('R1', f(104), f(114)),
      ],
    },
    L1: {
      start: PL.L1,
      moves: [
        { t0: f(29), t1: f(38), to: RAKE_L.back, lift: 10 },
        { t0: f(38), t1: f(43), to: add(RAKE_L.back, [0.6, 0.8, 1.4]) },
        { t0: f(43), t1: f(48), to: add(RAKE_L.back, [0.2, 0.3, 0.4]) },
        { t0: f(48), t1: f(50), to: add(RAKE_L.back, [-1.2, 1.4, 1.2]) },
        { t0: SWIPE_STRIKES[1][0], t1: h2, to: RAKE_L.to, via: RAKE_L.via, ease: 'strike' },
        { t0: h2, t1: f(60), to: RAKE_L.on, ease: 'io' },
        { t0: f(60), t1: f(76), to: UP.L1, via: [[52, 14, 52]] },
        { t0: f(76), t1: f(81), to: add(UP.L1, [0.6, 0.8, 1.4]) },
        { t0: f(81), t1: f(86), to: add(UP.L1, [0.2, 0.3, 0.6]) },
        { t0: f(86), t1: f(88), to: add(UP.L1, [-1.5, 0.6, 1.5]) },
        { t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.L1, via: [[58, 32, 44]], ease: 'strike' },
        ...homeFrom('L1', f(106), f(116)),
      ],
    },
    R2: { start: PL.R2, moves: rearUp('R2', f(60), f(74), f(86), [0.4, -0.8, 1.0]).concat([{ t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.R2, ease: 'strike' }]) },
    L2: { start: PL.L2, moves: rearUp('L2', f(61), f(75), f(86), [0.4, 0.8, 1.0]).concat([{ t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.L2, ease: 'strike' }]) },
    R3: { start: PL.R3, moves: hindIn('R3', f(56), f(100), f(110)) },
    L3: { start: PL.L3, moves: hindIn('L3', f(57), f(102), f(112)) },
  });
}
function swipeMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    // THE RIGHT: twisted away to its right, rising, its maw opening; HELD, trembling; its body turns; two frames; on round
    { at: f(10), pose: { yaw: -12, pz: R.pz + 4, faceTilt: 10, faceUp: 2, pitch: R.pitch - 2, draw: 0.85, pt: 0.9 }, ease: 'io' },
    { at: f(15), pose: { yaw: -12.5, pz: R.pz + 4.4, faceTilt: 10.5, faceUp: 2, pitch: R.pitch - 2, py: 0.6, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(20), pose: { yaw: -12.2, pz: R.pz + 4.2, faceTilt: 10.2, faceUp: 2, pitch: R.pitch - 2, py: -0.3, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(22), pose: { yaw: -9, pz: R.pz + 3.6, faceTilt: 9, faceUp: 2, pitch: R.pitch - 1, draw: 0.9, pt: 1 }, ease: 'in' },
    { at: SWIPE_HITS[0], pose: { yaw: 10, pz: R.pz - 1, faceTilt: 0, faceUp: 0, pitch: R.pitch + 5, px: 2, draw: 0.6, pt: 1 }, ease: 'lin' },
    { at: f(32), pose: { yaw: 14, pz: R.pz - 2, pitch: R.pitch + 6, px: 3, draw: 0.5, pt: 0.9 }, ease: 'out' },
    // THE LEFT: the same, the other way
    { at: f(38), pose: { yaw: 12, pz: R.pz + 4, faceTilt: 10, faceUp: 2, pitch: R.pitch - 2, draw: 0.85, pt: 0.9 }, ease: 'io' },
    { at: f(43), pose: { yaw: 12.5, pz: R.pz + 4.4, faceTilt: 10.5, faceUp: 2, pitch: R.pitch - 2, py: -0.6, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(48), pose: { yaw: 12.2, pz: R.pz + 4.2, faceTilt: 10.2, faceUp: 2, pitch: R.pitch - 2, py: 0.3, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(50), pose: { yaw: 9, pz: R.pz + 3.6, faceTilt: 9, faceUp: 2, pitch: R.pitch - 1, draw: 0.9, pt: 1 }, ease: 'in' },
    { at: SWIPE_HITS[1], pose: { yaw: -8, pz: R.pz - 1, faceTilt: 0, faceUp: 0, pitch: R.pitch + 5, px: 2, draw: 0.6, pt: 1 }, ease: 'lin' },
    { at: f(58), pose: { yaw: -10, pz: R.pz - 2, pitch: R.pitch + 6, px: 3, draw: 0.5, pt: 0.9 }, ease: 'out' },
    // THE FINISHER: reared up to its full height, HELD longest, trembling; it leans in; two frames; crashed down; pressed; up
    { at: f(72), pose: { ...REARED }, ease: 'io' },
    { at: f(77), pose: trembling(1), ease: 'io' },
    { at: f(82), pose: trembling(-1), ease: 'io' },
    { at: f(86), pose: trembling(0.2), ease: 'io' },
    { at: f(88), pose: { ...REARED, pz: (REARED.pz as number) - 1, faceTilt: REAR.tilt - 2, pitch: R.pitch + 3, px: -1 }, ease: 'in' },
    { at: SWIPE_HITS[2], pose: CRASH, ease: 'lin' },
    { at: f(97), pose: SQUASH, ease: 'out' },
    { at: f(101), pose: { ...SQUASH, pz: R.pz - 9, py: 1.0 }, ease: 'io' },
    { at: f(105), pose: { ...SQUASH, pz: R.pz - 9.6, py: -1.0 }, ease: 'io' },
    { at: f(110), pose: { pz: R.pz - 4, pitch: R.pitch + 4, px: 2, draw: 0.5, pt: 0.7 }, ease: 'io' },
    { at: SWIPE_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: SWIPE_HITS[0], keys };
}

// =============================================================================================
// THE BONE RAIN: reared up, roaring, held; all four arms slammed down; the niches shed their skulls

/**
 * THE BONE RAIN'S MOMENTS. Reared by 0.667 s (f20), HELD roaring to 1.333 (f40), it leans in; strike f42-f44, the blow (all four
 * arms slammed down) 1.467 s; crashed, pressed down, shuddering, while the ossuary sheds its skulls; settled by 3.0 s. The skulls
 * themselves (when each leaves its niche and where it lands) are art/amalgam_action_fx.ts `RAIN`, timed from the blow.
 */
export const RAIN_STRIKE = [f(42), f(44)] as const;
export const RAIN_HIT = f(44);
export const RAIN_LONG = f(90);
function rainHands(): (t: number) => Record<string, V3> {
  const s0 = RAIN_STRIKE[0];
  const h = RAIN_HIT;
  const tracks: Record<string, HandTrack> = {
    R1: { start: PL.R1, moves: [...rearUp('R1', f(2), f(20), f(40), [0.8, -1.0, 1.6]), { t0: f(40), t1: s0, to: add(UP.R1, [-1.5, -0.6, 1.5]) }, { t0: s0, t1: h, to: SLAM.R1, via: [[56, -30, 44]], ease: 'strike' }, ...homeFrom('R1', f(70), f(80))] },
    L1: { start: PL.L1, moves: [...rearUp('L1', f(3), f(21), f(40), [0.8, 1.0, 1.6]), { t0: f(40), t1: s0, to: add(UP.L1, [-1.5, 0.6, 1.5]) }, { t0: s0, t1: h, to: SLAM.L1, via: [[58, 32, 44]], ease: 'strike' }, ...homeFrom('L1', f(72), f(82))] },
    R2: { start: PL.R2, moves: [...rearUp('R2', f(4), f(22), f(40), [0.5, -1.0, 1.2]), { t0: s0, t1: h, to: SLAM.R2, ease: 'strike' }] },
    L2: { start: PL.L2, moves: [...rearUp('L2', f(5), f(23), f(40), [0.5, 1.0, 1.2]), { t0: s0, t1: h, to: SLAM.L2, ease: 'strike' }] },
    R3: { start: PL.R3, moves: hindIn('R3', f(1), f(74), f(84)) },
    L3: { start: PL.L3, moves: hindIn('L3', f(2), f(76), f(86)) },
  };
  return K.handwork(tracks);
}
function rainMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: f(20), pose: { ...REARED }, ease: 'io' },
    // HELD, ROARING: trembling, its maw at its widest, its fire and every skull's eyes at their brightest
    { at: f(25), pose: trembling(1), ease: 'io' },
    { at: f(30), pose: trembling(-1), ease: 'io' },
    { at: f(35), pose: trembling(1), ease: 'io' },
    { at: f(40), pose: trembling(-0.2), ease: 'io' },
    { at: RAIN_STRIKE[0], pose: { ...REARED, pz: (REARED.pz as number) - 1, faceTilt: REAR.tilt - 2, pitch: R.pitch + 3, px: -1 }, ease: 'in' },
    { at: RAIN_HIT, pose: CRASH, ease: 'lin' },
    { at: f(51), pose: SQUASH, ease: 'out' },
    { at: f(55), pose: { ...SQUASH, pz: R.pz - 9, py: 1.2, draw: 0.9 }, ease: 'io' },
    { at: f(59), pose: { ...SQUASH, pz: R.pz - 9.6, py: -1.2, draw: 1 }, ease: 'io' },
    { at: f(63), pose: { ...SQUASH, pz: R.pz - 9, py: 1.0, draw: 0.9 }, ease: 'io' },
    { at: f(68), pose: { ...SQUASH, pz: R.pz - 9.4, py: -0.6, draw: 0.8 }, ease: 'io' },
    { at: f(78), pose: { pz: R.pz - 4, pitch: R.pitch + 4, px: 2, draw: 0.5, pt: 0.7 }, ease: 'io' },
    { at: RAIN_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: RAIN_HIT, keys };
}

// =============================================================================================
// THE FLOOR ARMS: reared higher, held longer; slammed flat; pressed down while the arms of the dead come up

/** THE FLOOR ARMS' MOMENTS. Reared by 0.6 s (f18), HELD to 1.2 (f36), it leans in; strike f38-f40, the slam 1.333 s; pressed down, shuddering, to 2.2 s; settled by 2.8 s. */
export const ARMS_STRIKE = [f(38), f(40)] as const;
export const ARMS_HIT = f(40);
export const ARMS_LONG = f(84);
function armsHands(): (t: number) => Record<string, V3> {
  const s0 = ARMS_STRIKE[0];
  const h = ARMS_HIT;
  return K.handwork({
    R1: { start: PL.R1, moves: [...rearUp('R1', f(2), f(18), f(36), [0.8, -1.0, 1.6]), { t0: f(36), t1: s0, to: add(UP.R1, [-1.5, -0.6, 1.5]) }, { t0: s0, t1: h, to: SLAM.R1, via: [[56, -30, 44]], ease: 'strike' }, ...homeFrom('R1', f(66), f(76))] },
    L1: { start: PL.L1, moves: [...rearUp('L1', f(3), f(19), f(36), [0.8, 1.0, 1.6]), { t0: f(36), t1: s0, to: add(UP.L1, [-1.5, 0.6, 1.5]) }, { t0: s0, t1: h, to: SLAM.L1, via: [[58, 32, 44]], ease: 'strike' }, ...homeFrom('L1', f(68), f(78))] },
    R2: { start: PL.R2, moves: [...rearUp('R2', f(4), f(20), f(36), [0.5, -1.0, 1.2]), { t0: s0, t1: h, to: SLAM.R2, ease: 'strike' }] },
    L2: { start: PL.L2, moves: [...rearUp('L2', f(5), f(21), f(36), [0.5, 1.0, 1.2]), { t0: s0, t1: h, to: SLAM.L2, ease: 'strike' }] },
    R3: { start: PL.R3, moves: hindIn('R3', f(1), f(70), f(80)) },
    L3: { start: PL.L3, moves: hindIn('L3', f(2), f(72), f(82)) },
  });
}
function armsMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: f(18), pose: { ...REARED, draw: 0.9 }, ease: 'io' },
    { at: f(24), pose: trembling(1, { draw: 1 }), ease: 'io' },
    { at: f(30), pose: trembling(-1, { draw: 1 }), ease: 'io' },
    { at: f(36), pose: trembling(0.3, { draw: 1 }), ease: 'io' },
    { at: ARMS_STRIKE[0], pose: { ...REARED, pz: (REARED.pz as number) - 1, faceTilt: REAR.tilt - 2, pitch: R.pitch + 3, px: -1 }, ease: 'in' },
    { at: ARMS_HIT, pose: CRASH, ease: 'lin' },
    { at: f(47), pose: SQUASH, ease: 'out' },
    // pressed down on its hands, shuddering, while the arms of the dead come up
    { at: f(52), pose: { ...SQUASH, pz: R.pz - 9, py: 1.1 }, ease: 'io' },
    { at: f(57), pose: { ...SQUASH, pz: R.pz - 9.8, py: -1.1 }, ease: 'io' },
    { at: f(62), pose: { ...SQUASH, pz: R.pz - 9.2, py: 0.6 }, ease: 'io' },
    { at: f(72), pose: { pz: R.pz - 4, pitch: R.pitch + 4, px: 2, draw: 0.5, pt: 0.7 }, ease: 'io' },
    { at: ARMS_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: ARMS_HIT, keys };
}

// =============================================================================================
// DEVOUR: reared, gaping, arms flung wide, held; THE RAKE; THE DRAG; THE BITE

/**
 * DEVOUR'S MOMENTS. Reared, its maw gaping, its arms flung wide by 0.6 s (f18), HELD to 1.133 (f34); it lunges; THE RAKE f36-f38,
 * its claws in the floor at the end of their reach 1.267 s; THE DRAG, hauled in to its maw, to 1.933 s (f58); the maw held wide;
 * THE BITE f64-f66, snapped shut 2.2 s; the gulp; settled by 3.2 s.
 */
export const DEVOUR_STRIKES = [[f(36), f(38)], [f(64), f(66)]] as const;
export const DEVOUR_HITS = [f(38), f(66)] as const;
export const DEVOUR_LONG = f(96);
/** The drag: from the rake (its claws in the floor) to when its claws are in at its maw. */
export const DRAG = [f(38), f(58)] as const;
const WIDE: Readonly<Record<string, V3>> = { R1: [24, -78, 58], L1: [28, 80, 58] };
const RAKED: Readonly<Record<string, V3>> = { R1: [80, -36, 1.6], L1: [82, 38, 1.6] };
const RAKED_ON: Readonly<Record<string, V3>> = { R1: [90, -38, 1.8], L1: [92, 40, 1.8] };
const RAKED_IN: Readonly<Record<string, V3>> = { R1: [56, -18, 2.4], L1: [58, 18, 2.4] };
function devourHands(): (t: number) => Record<string, V3> {
  const [s0] = DEVOUR_STRIKES[0];
  const h = DEVOUR_HITS[0];
  const arm = (name: 'R1' | 'L1', sg: number, d0: number): HandMove[] => [
    { t0: f(2 + d0), t1: f(18 + d0), to: WIDE[name], lift: 8 },
    { t0: f(18 + d0), t1: f(26), to: add(WIDE[name], [0.6, sg * 1.2, 1.4]) },
    { t0: f(26), t1: f(34), to: add(WIDE[name], [0.2, sg * 0.4, 0.4]) },
    { t0: f(34), t1: s0, to: add(WIDE[name], [-1.2, sg * 1.6, 1.6]) },
    { t0: s0, t1: h, to: RAKED[name], via: [[50, sg * 72, 34], [66, sg * 52, 10]], ease: 'strike' },
    { t0: h, t1: f(41), to: RAKED_ON[name], ease: 'io' },
    // THE DRAG: raked in along the floor, claws dug in
    { t0: f(41), t1: DRAG[1], to: RAKED_IN[name], via: [[74, sg * 32, 1.8], [66, sg * 26, 2.0]], ease: 'io' },
    { t0: f(76 + d0), t1: f(86 + d0), to: PL[name], lift: 6 },
  ];
  return K.handwork({
    R1: { start: PL.R1, moves: arm('R1', -1, 0) },
    L1: { start: PL.L1, moves: arm('L1', 1, 1) },
  });
}
/** Reared for the devour: a little lower than its full height, leaning over its maw. */
const GAPE: P = { pz: R.pz + 10, faceUp: 9, faceTilt: 16, pitch: R.pitch, px: -3, draw: 1, pt: 1 };
function devourMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: f(18), pose: GAPE, ease: 'io' },
    { at: f(24), pose: { ...GAPE, py: 0.8, pz: (GAPE.pz as number) + 0.5 }, ease: 'io' },
    { at: f(30), pose: { ...GAPE, py: -0.8, pz: (GAPE.pz as number) - 0.3 }, ease: 'io' },
    { at: f(34), pose: { ...GAPE, py: 0.2 }, ease: 'io' },
    { at: DEVOUR_STRIKES[0][0], pose: { ...GAPE, faceTilt: 14, pitch: R.pitch + 3, px: 0 }, ease: 'in' },
    // THE RAKE: thrown forward over its arms, low
    { at: DEVOUR_HITS[0], pose: { pz: R.pz + 1, faceUp: 0, faceTilt: 0, pitch: R.pitch + 8, px: 18, draw: 1, pt: 1 }, ease: 'lin' },
    { at: f(42), pose: { pz: R.pz, pitch: R.pitch + 9, px: 24, draw: 1, pt: 1 }, ease: 'out' },
    // THE DRAG: hauled back on its arms, the maw held wide
    { at: f(56), pose: { pz: R.pz + 3, pitch: R.pitch - 3, px: -6, draw: 1, pt: 1 }, ease: 'io' },
    { at: f(60), pose: { pz: R.pz + 3.4, pitch: R.pitch - 3.6, px: -6.4, py: 0.5, draw: 1, pt: 1 }, ease: 'io' },
    { at: f(62), pose: { pz: R.pz + 3.2, pitch: R.pitch - 3.4, px: -6.2, py: -0.3, draw: 1, pt: 1 }, ease: 'io' },
    // THE BITE: snapped shut, the brow thrown down and in
    { at: DEVOUR_STRIKES[1][0], pose: { pz: R.pz + 2.8, pitch: R.pitch - 2, px: -5.6, draw: 1, pt: 1 }, ease: 'in' },
    { at: DEVOUR_HITS[1], pose: { pz: R.pz - 3, pitch: R.pitch + 12, px: 13, draw: 0, pt: 1 }, ease: 'lin' },
    { at: f(72), pose: { pz: R.pz - 6, pitch: R.pitch + 15, px: 19, draw: 0.05, pt: 0.9 }, ease: 'out' },
    // the gulp: swelling, its skulls burning bright
    { at: f(78), pose: { pz: R.pz + 4, pitch: R.pitch + 3, px: 7, draw: 0.1, pt: 0.8 }, ease: 'io' },
    { at: f(86), pose: { pz: R.pz + 1, pitch: R.pitch + 1, px: 2, draw: 0.3, pt: 0.6 }, ease: 'io' },
    { at: DEVOUR_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: DEVOUR_HITS[1], keys };
}

// =============================================================================================
// THE SMEAR, and what the slams throw off

/** The strikes of each move (from the last frame of its wind-up to the frame it lands on), and which hands strike in each. */
export const AM_ACT_STRIKES: Readonly<Record<string, ReadonlyArray<{ s: readonly [number, number]; hands: readonly string[] }>>> = {
  attack: [{ s: SWIPE_STRIKES[0], hands: ['R1'] }, { s: SWIPE_STRIKES[1], hands: ['L1'] }, { s: SWIPE_STRIKES[2], hands: ['R1', 'L1', 'R2', 'L2'] }],
  rain: [{ s: RAIN_STRIKE, hands: ['R1', 'L1', 'R2', 'L2'] }],
  floorArms: [{ s: ARMS_STRIKE, hands: ['R1', 'L1', 'R2', 'L2'] }],
  devour: [{ s: DEVOUR_STRIKES[0], hands: ['R1', 'L1'] }, { s: DEVOUR_STRIKES[1], hands: [] }],
};
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function amSmeared(move: string, t: number): boolean {
  return (AM_ACT_STRIKES[move] ?? []).some(({ s }) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6);
}
/** THE SMEAR'S AFTER-IMAGES of the hands that strike (and, at the bite, of its maw's lips), along the way they came: lines of points, oldest first, as ropes `smear...`. */
function smearOf(move: string, hands: (t: number) => Record<string, V3>, maw?: (t: number) => V3[]): (t: number) => Record<string, V3[]> {
  return (t) => {
    const out: Record<string, V3[]> = {};
    for (const { s, hands: names } of AM_ACT_STRIKES[move] ?? []) {
      if (!(t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6)) continue;
      // (on the frame after it lands, only the last of its way, thinning)
      const from = t > s[1] + 1e-6 ? s[1] - FR * 0.6 : s[0] - FR * 0.3;
      const to = Math.min(t, s[1]);
      const N = 14;
      const at = (k: number): number => from + ((to - from) * k) / N;
      names.forEach((n, j) => {
        const pts: V3[] = [];
        const tips: V3[] = [];
        for (let k = 0; k <= N; k++) {
          const p = hands(at(k))[n];
          const q = hands(at(k) - 0.004)[n];
          const way = norm(sub(p, q), [1, 0, 0]);
          pts.push(p);
          tips.push(add(p, mul(way, 7)));
        }
        out[`smear${j}a`] = pts;
        out[`smear${j}b`] = tips;
      });
      if (maw && names.length === 0) {
        for (let k = 0; k <= N; k++) maw(at(k)).forEach((p, j) => (out[`smearm${j}`] ??= []).push(p));
      }
    }
    return out;
  };
}
/** The smear's after-images: the oldest the enemy's fire, dull; the newest near white. */
const SMEAR = [FLAME[1], FLAME[2], FLAME[3], '#fff0e6'] as const;
function smearBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (!m.ropes) return bits;
  for (const [k, line] of Object.entries(m.ropes)) {
    if (!k.startsWith('smear') || line.length < 2) continue;
    for (let i = 1; i < line.length; i++) {
      const age = i / (line.length - 1);
      const n = Math.max(1, Math.ceil(len3(sub(line[i], line[i - 1])) / 1.2));
      for (let j = 0; j < n; j++) {
        const p = lerp3(line[i - 1], line[i], j / n);
        bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2])], c: age > 0.85 ? SMEAR[3] : age > 0.6 ? SMEAR[2] : age > 0.3 ? SMEAR[1] : SMEAR[0], size: age > 0.5 ? 2 : 1 } });
      }
    }
  }
  return bits;
}
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// THE AMALGAMATION WITH THESE MOVES

/** Its canvas: room over it for it reared and its arms raised, and before it for its rake and what it drags in. */
export const ACT_CANVAS: MobCanvas = { w: 460, h: 370, ax: 210, ay: 236 };
let MADE: Mob | null = null;
/** THE AMALGAMATION AS FREE AS THE GAME'S, with these moves (made the first time asked for). */
export function amalgamActionMob(): Mob {
  if (MADE) return MADE;
  const base = AMALGAM;
  const sw = swipeHands();
  const rh = rainHands();
  const ah = armsHands();
  const dh = devourHands();
  const slams = (hit: number, seed: number, hands: (t: number) => Record<string, V3>) => (t: number): Record<string, V3[]> => {
    const h = hands(hit);
    return K.slamBurst([h.R1, h.L1, h.R2, h.L2].filter((p) => p[2] < 1), t - hit, seed, 1.3) as Record<string, V3[]>;
  };
  const merge = (...rs: Record<string, ReadonlyArray<V3>>[]): Record<string, V3[]> => {
    const out: Record<string, V3[]> = {};
    for (const r of rs) for (const [k, v] of Object.entries(r)) out[k] = [...(out[k] ?? []), ...v];
    return out;
  };
  const swSmear = smearOf('attack', sw);
  const rakeSlam = (t: number): Record<string, V3[]> => {
    const h = sw(SWIPE_HITS[0]);
    const g = sw(SWIPE_HITS[1]);
    return merge(K.slamBurst([h.R1], t - SWIPE_HITS[0], 71, 0.8) as Record<string, V3[]>, K.slamBurst([g.L1], t - SWIPE_HITS[1], 72, 0.8) as Record<string, V3[]>);
  };
  const attack = K.amMove('The swipe, the other swipe, and the slam', swipeMotion(), sw, {
    also: (t) => merge(swSmear(t), rakeSlam(t), slams(SWIPE_HITS[2], 73, sw)(t), { burn: [[Math.max(0.6 * burning(t, 0.05, 0.33, 0.8, 1.1), 0.6 * burning(t, 0.95, 1.27, 1.73, 2.0), burning(t, 1.95, 2.4, 3.0, 3.6)), 0, 0]] }),
  });
  const rain = K.amMove('The bone rain', rainMotion(), rh, {
    also: (t) => merge(smearOf('rain', rh)(t), slams(RAIN_HIT, 74, rh)(t), { burn: [[burning(t, 0.05, 0.6, RAIN_HIT + 0.4, RAIN_HIT + 1.2), 0, 0]] }),
  });
  const floorArms = K.amMove('Arms from the floor', armsMotion(), ah, {
    also: (t) => merge(smearOf('floorArms', ah)(t), slams(ARMS_HIT, 97, ah)(t), { burn: [[burning(t, 0.05, 0.55, ARMS_HIT + 0.3, ARMS_HIT + 1.0), 0, 0]] }),
  });
  const devour = K.amMove('Devour', devourMotion(), dh, {
    also: (t) => merge(smearOf('devour', dh)(t), K.slamBurst([dh(DEVOUR_HITS[0]).R1, dh(DEVOUR_HITS[0]).L1], t - DEVOUR_HITS[0], 98, 0.9) as Record<string, V3[]>, {
      devourT: [[t - DEVOUR_HITS[0], 0, 0]],
      burn: [[Math.max(burning(t, 0.05, 0.55, DEVOUR_HITS[0], DEVOUR_HITS[0] + 0.3) * 0.8, burning(t, DEVOUR_HITS[1] - 0.05, DEVOUR_HITS[1] + 0.1, DEVOUR_HITS[1] + 0.5, DEVOUR_HITS[1] + 1.0)), 0, 0]],
    }),
  });
  const more: Record<string, MobMove> = { setOff: base.more!.setOff, halt: base.more!.halt, burst: base.more!.burst, rain, floorArms, devour };
  MADE = {
    ...base,
    id: 'amalgam+action',
    canvas: ACT_CANVAS,
    aura: { ...base.aura, x: ACT_CANVAS.ax - 4, y: ACT_CANVAS.ay - 34 },
    attack,
    hit: SWIPE_HITS[0],
    more,
    bits: (st: Stage, m: Moment) => [...base.bits(st, m), ...smearBits(m)],
  };
  return MADE;
}
void AM_CANVAS;

/** THE AMALGAMATION WITH THESE MOVES, as the game holds a monster. */
export function makeAmalgamActionArt(pace = AMALGAM.pace): ActorArt {
  const mob = amalgamActionMob();
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// AS THE CHECKS SEE IT

function moveOfMob(mob: Mob, move: string): MobMove | undefined {
  return move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : move === 'dying' ? mob.dying : mob.more?.[move];
}
function longOfMove(mv: MobMove): number {
  const k = mv.motion.keys;
  return k.length ? k[k.length - 1].at : 1;
}
/** Its heap and arms at a moment of a move of this one. */
function actAt(mob: Mob, move: string, t: number, s: Skeleton, q: Posed): ReturnType<typeof amGeometry> {
  const mv = moveOfMob(mob, move);
  const L = mv ? longOfMove(mv) : 1;
  const ropes = mv?.ropes ? mv.ropes(mv.motion.loop !== undefined ? ((t % L) + L) % L : t) : undefined;
  return amGeometry(s, q, ropes);
}
const handOf = (g: ReturnType<typeof amGeometry>, n: string): V3 => (g.arms.find((a) => a.name === n) as { hand: V3 }).hand;
/**
 * IT AS THE CHECKS SEE IT (art/boss_checks.ts), with these moves: its heap's lumps (reared, tipped with it) and its six great arms
 * as the game's (art/bosses3.ts AM_SHAPE); the end it strikes with (in the swipe, the raking hand; in the slams, the top of its heap
 * thrown down behind its hands, as the game's own slam; in the rake, between its two front hands; at the bite, its brow); each
 * move's blows (a combo's, each its own), smeared; and where its moves hand over.
 */
export function amActionShape(mob: Mob = amalgamActionMob()): BossShape {
  const blows: Record<string, { hit: number; strike: readonly [number, number]; from: number; until?: number }[]> = {
    attack: [
      { hit: SWIPE_HITS[0], strike: SWIPE_STRIKES[0], from: 0, until: f(33) },
      { hit: SWIPE_HITS[1], strike: SWIPE_STRIKES[1], from: f(33), until: f(60) },
      { hit: SWIPE_HITS[2], strike: SWIPE_STRIKES[2], from: f(60) },
    ],
    rain: [{ hit: RAIN_HIT, strike: RAIN_STRIKE, from: 0 }],
    floorArms: [{ hit: ARMS_HIT, strike: ARMS_STRIKE, from: 0 }],
    devour: [
      { hit: DEVOUR_HITS[0], strike: DEVOUR_STRIKES[0], from: 0, until: f(44) },
      { hit: DEVOUR_HITS[1], strike: DEVOUR_STRIKES[1], from: f(44) },
    ],
  };
  const moves = ['attack', 'reel', 'floorArms', 'rain', 'devour', 'burst'];
  const handovers: Handover[] = [
    { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    ...moves.flatMap((m): Handover[] => [
      { from: 'stand', at: 0, to: m, toAt: 0 },
      { from: m, at: 'end', to: 'stand', toAt: 0 },
    ]),
  ];
  return {
    ...AM_SHAPE,
    grips: (move, t, s, q) => actAt(mob, move, t, s, q).arms.map((a) => ({ name: `hand ${a.name}`, p: a.hand })),
    arms: (move, t, s, q) => actAt(mob, move, t, s, q).arms.map((a) => ({ name: a.name, sh: a.sh, el: a.el, hand: a.hand })),
    follow: (move, t, s, q) => {
      const { frame, arms } = actAt(mob, move, t, s, q);
      const out: Record<string, V3> = { hump: frame.lumps[3].c, brow: frame.lumps[2].c, middle: frame.lumps[1].c };
      for (const a of arms) out[`hand${a.name}`] = a.hand;
      return out;
    },
    tip: (move, t, s, q) => {
      const g = (): ReturnType<typeof amGeometry> => actAt(mob, move, t, s, q);
      if (move === 'attack') {
        if (t <= f(36) + 1e-6) return handOf(g(), 'R1');
        if (t >= f(38) - 1e-6 && t <= f(64) + 1e-6) return handOf(g(), 'L1');
        if (t >= f(74)) return g().frame.lumps[3].c;
        return null;
      }
      if (move === 'rain' || move === 'floorArms') return g().frame.lumps[3].c;
      if (move === 'devour') {
        if (t <= f(50) + 1e-6) return lerp3(handOf(g(), 'R1'), handOf(g(), 'L1'), 0.5);
        if (t >= f(53) - 1e-6) return g().frame.lumps[2].c;
        return null;
      }
      return AM_SHAPE.tip?.(move, t, s, q) ?? null;
    },
    blows,
    smeared: amSmeared,
    handovers,
  };
}

// =============================================================================================
// FOR THE GAME: the numbers of its moves, in tiles

const tilesOf = (p: V3): [number, number] => [p[0] / TILE3, p[1] / TILE3];
/** Where a hand of it is at a moment of one of these moves (tiles before it, to its left; its height in its own lengths). */
export function handAt(move: string, name: string, t: number): [number, number, number] {
  const mob = amalgamActionMob();
  const g = actAt(mob, move, t, skeletonAt(mob, move, t), posedOfMob(mob, move, t));
  const h = handOf(g, name);
  return [...tilesOf(h), h[2]];
}
/** How high it stands at a moment of a move (its own lengths over the floor, its heap's top; and its highest claw). */
export function heightAt(move: string, t: number): { heap: number; claws: number } {
  const mob = amalgamActionMob();
  const g = actAt(mob, move, t, skeletonAt(mob, move, t), posedOfMob(mob, move, t));
  const heap = Math.max(...g.frame.lumps.map((L) => L.c[2] + L.r[2]));
  const claws = Math.max(...g.arms.map((a) => a.hand[2]));
  return { heap, claws };
}
void clamp01;
void sub;
