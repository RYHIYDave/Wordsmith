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
import { AMALGAM, AM_CANVAS, AM_KIT, AM_SHAPE, OSS, amGeometry } from './bosses3';
import type { HandMove, HandTrack } from './bosses3';
import type { BossShape, Handover } from './boss_checks';
import { TILE3, mobSet, posedOfMob, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Ropes } from './new_mobs3';
import type { Stage } from './skin';
import { add, cross, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';
import { FLAME } from './mkit';
import { BONE as BONE_W, PINK as PINK_W, hash } from './kit';
import type { Ramp } from './kit';

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
// THE SWIPE, A COMBO: THE RAKES REDONE (the second round), and the finisher as it was

/**
 * HIS WORD ON THE FIRST ROUND'S RAKES (1 Nov 2026): “His regular arm swipe is pretty lackluster”; “The rakes are lackluster”. So
 * each rake is now the wildest blow it has. THE RIGHT: its great right arm hauled up and back high over its hump, the heap twisted
 * away and heaved half up, its weight thrown onto its left arms, its maw snarling: HELD, trembling; it turns; THE RAKE in two
 * frames, a vast arc of bone claws swept across the floor before it, the whole heap lunging into it; the freeze on the hit; the arm
 * carried right round, the heap rocking on with it and back. THE LEFT, a backhand from the other side, bigger again. Then the
 * finisher, as it was (its moments 16 frames later).
 *   the right     hauled up by 0.333 s (f10), HELD to 0.6 (f18), it turns f18-f20; strike f20-f22, its blow 0.733 s; frozen to
 *                 f24; carried round to f30, rocking to f42
 *   the left      hauled up from 1.2 s (f36) by 1.6 (f48), HELD to 1.867 (f56), it turns f56-f58; strike f58-f60, its blow
 *                 2.0 s; frozen to f62; carried round to f68, rocking to f74
 *   finisher      rearing from 2.467 s (f74), reared by 2.933 (f88), HELD to 3.4 (f102); strike f104-f106, its blow 3.533 s;
 *                 crashed, pressed, settled by 4.533 s (f136)
 */
export const FINISHER_LATER = 16;
const S = FINISHER_LATER;
export const SWIPE_STRIKES = [[f(20), f(22)], [f(58), f(60)], [f(88 + S), f(90 + S)]] as const;
export const SWIPE_HITS = [f(22), f(60), f(90 + S)] as const;
export const SWIPE_LONG = f(120 + S);
/** The freeze on each rake's hit: held still this long after it lands (seconds). */
export const RAKE_FREEZE = f(2);
/**
 * THE RAKES' WAYS (the figure's own lengths; forward, to its left, up; from its middle as the move began): hauled up and back
 * (`back`), swept across through `via` to `to` in two frames, and carried on round to `on`. The slash each throws (`out`: how far
 * from its middle the vast arc of its claws reaches, in tiles) is art/amalgam_action.ts `rakeTrail`.
 */
export const RAKES = [
  { hand: 'R1', side: -1, strike: SWIPE_STRIKES[0], back: [-10, -54, 70] as V3, via: [[30, -76, 36], [70, -62, 10], [94, -22, 6]] as V3[], to: [80, 22, 8] as V3, on: [62, 18, 44] as V3, out: 3.3 },
  { hand: 'L1', side: 1, strike: SWIPE_STRIKES[1], back: [-2, 64, 68] as V3, via: [[34, 80, 38], [74, 64, 10], [98, 22, 6]] as V3[], to: [84, -28, 8] as V3, on: [72, -10, 48] as V3, out: 3.5 },
] as const;
const RK = RAKES;
/** Wound up for a rake (`sg` -1 its right, 1 its left; `big` the backhand's more): twisted away, heaved half up and tipped back, its weight thrown onto its other side, its maw snarling. */
const windUp = (sg: number, big: number): P => ({ yaw: 16 * sg * big, pz: R.pz + 6 * big, faceUp: 11 * big, faceTilt: 19 * big, pitch: R.pitch - 3, px: -4 * big, py: -3 * sg, draw: 0.95, pt: 1 });
/** Lunged into the rake as it lands: turned through, thrown forward and down over its hands. */
const lunged = (sg: number, big: number): P => ({ yaw: -34 * sg * big, pz: R.pz - 2 * big, faceUp: 0, faceTilt: 0, pitch: R.pitch + 7, px: 21 * big, py: 2 * sg, draw: 0.55, pt: 1 });
const W1 = windUp(-1, 1);
const W2 = windUp(1, 1.15);
const H1 = lunged(-1, 1);
const H2 = lunged(1, 1.15);
/** Where a hand grips the floor under it turned and moved as in `pose` (its grip at rest, carried with it). */
function plantAt(name: string, pose: P, k = 1): V3 {
  const a = ((pose.yaw as number) ?? 0) * (Math.PI / 180);
  const p = mul(PL[name], k);
  return [(pose.px ?? 0) + p[0] * Math.cos(a) - p[1] * Math.sin(a), (pose.py ?? 0) + p[0] * Math.sin(a) + p[1] * Math.cos(a), 0];
}
/** ITS WEIGHT SHIFTED: the hands it stands on step to where they grip under it wound up, are flung on with it as it lunges (lifted in the strike's two frames, down again as it lands), and step back. */
function bracing(name: string, d: number, wound: P, struck: P, strike: readonly [number, number], back: number | null, start: number): HandMove[] {
  const out: HandMove[] = [
    { t0: f(start + d), t1: f(start + 7 + d), to: plantAt(name, wound, wound === W2 ? 0.76 : 0.9), lift: 6 },
    { t0: strike[0], t1: strike[1], to: plantAt(name, struck), lift: 9 },
  ];
  if (back !== null) out.push({ t0: f(back + d), t1: f(back + 7 + d), to: PL[name], lift: 6 });
  return out;
}
/** After the backhand, a hand it stands on stepped in under it as it rocks back (from frame `at`, seven frames), ready to rear. */
const settle = (name: string, at: number, pose: P = { yaw: -18, px: 12, py: 1.5 }): HandMove => ({ t0: f(at), t1: f(at + 7), to: plantAt(name, pose), lift: 6 });
function swipeHands(): (t: number) => Record<string, V3> {
  const [h1, h2, h3] = SWIPE_HITS;
  const [r, l] = RK;
  const s1 = SWIPE_STRIKES[0];
  const s2 = SWIPE_STRIKES[1];
  return K.handwork({
    R1: {
      start: PL.R1,
      moves: [
        // HAULED UP AND BACK, high over its hump; HELD, trembling; drawn a hair further as it turns
        { t0: f(1), t1: f(10), to: r.back, via: [[36, -66, 50]], lift: 12 },
        { t0: f(10), t1: f(14), to: add(r.back, [0.6, -0.8, 1.2]) },
        { t0: f(14), t1: f(18), to: add(r.back, [0.2, -0.3, 0.4]) },
        { t0: f(18), t1: f(20), to: add(r.back, [-1.4, -1.2, 1.4]) },
        // THE RAKE: two frames, across the floor before it; frozen on the hit; carried right round, up over its brow
        { t0: s1[0], t1: h1, to: r.to, via: r.via, ease: 'strike' },
        { t0: h1 + RAKE_FREEZE, t1: f(30), to: r.on, via: [[82, 26, 20]], ease: 'io' },
        { t0: f(31), t1: f(42), to: PL.R1, via: [[78, 0, 32]], lift: 8 },
        // (as the backhand is wound up: its weight thrown onto it, gripping in under it; flung on with it as it lunges)
        { t0: f(44), t1: f(51), to: [34, -38, 0], lift: 6 },
        { t0: s2[0], t1: s2[1], to: plantAt('R1', H2), lift: 9 },
        // the finisher: raised over it with the other, held, slammed
        ...rearUp('R1', f(58 + S), f(72 + S), f(86 + S), [0.6, -0.8, 1.4]),
        { t0: f(86 + S), t1: f(88 + S), to: add(UP.R1, [-1.5, -0.6, 1.5]) },
        { t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.R1, via: [[56, -30, 44]], ease: 'strike' },
        ...homeFrom('R1', f(104 + S), f(114 + S)),
      ],
    },
    L1: {
      start: PL.L1,
      moves: [
        // (as the right is wound up: its weight thrown onto it, gripping in under it; flung on with it as it lunges)
        { t0: f(3), t1: f(10), to: [40, 36, 0], lift: 6 },
        { t0: s1[0], t1: s1[1], to: plantAt('L1', H1), lift: 9 },
        { t0: f(36), t1: f(48), to: l.back, via: [[52, 62, 32]], lift: 12 },
        { t0: f(48), t1: f(52), to: add(l.back, [0.6, 0.8, 1.2]) },
        { t0: f(52), t1: f(56), to: add(l.back, [0.2, 0.3, 0.4]) },
        { t0: f(56), t1: f(58), to: add(l.back, [-1.4, 1.2, 1.4]) },
        { t0: s2[0], t1: h2, to: l.to, via: l.via, ease: 'strike' },
        { t0: h2 + RAKE_FREEZE, t1: f(68), to: l.on, via: [[88, -24, 22]], ease: 'io' },
        // (on up into the finisher's rear, from where it was carried round to: up and out over its brow)
        { t0: f(60 + S), t1: f(76 + S), to: UP.L1, via: [[80, 6, 52], [66, 42, 70]] },
        { t0: f(76 + S), t1: f(81 + S), to: add(UP.L1, [0.6, 0.8, 1.4]) },
        { t0: f(81 + S), t1: f(86 + S), to: add(UP.L1, [0.2, 0.3, 0.6]) },
        { t0: f(86 + S), t1: f(88 + S), to: add(UP.L1, [-1.5, 0.6, 1.5]) },
        { t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.L1, via: [[58, 32, 44]], ease: 'strike' },
        ...homeFrom('L1', f(106 + S), f(116 + S)),
      ],
    },
    R2: { start: PL.R2, moves: [...bracing('R2', 0, W1, H1, s1, 31, 2), ...bracing('R2', 0, W2, H2, s2, null, 38), settle('R2', 65), ...rearUp('R2', f(60 + S), f(74 + S), f(86 + S), [0.4, -0.8, 1.0]), { t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.R2, ease: 'strike' }] },
    L2: { start: PL.L2, moves: [...bracing('L2', 2, W1, H1, s1, 30, 2), ...bracing('L2', 2, W2, H2, s2, null, 38), settle('L2', 66), ...rearUp('L2', f(61 + S), f(75 + S), f(86 + S), [0.4, 0.8, 1.0]), { t0: SWIPE_STRIKES[2][0], t1: h3, to: SLAM.L2, ease: 'strike' }] },
    R3: { start: PL.R3, moves: [...bracing('R3', 3, W1, H1, s1, 27, 2), ...bracing('R3', 3, W2, H2, s2, null, 39), settle('R3', 64, { yaw: -33, px: 20, py: -1 }), ...hindIn('R3', f(56 + S), f(100 + S), f(110 + S))] },
    L3: { start: PL.L3, moves: [...bracing('L3', 1, W1, H1, s1, 29, 2), ...bracing('L3', 1, W2, H2, s2, null, 39), settle('L3', 65, { yaw: -22, px: 15, py: 0 }), ...hindIn('L3', f(57 + S), f(102 + S), f(112 + S))] },
  });
}
function swipeMotion(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    // THE RIGHT: hauled up, the heap twisted away and heaved half up, its weight on its left; HELD, trembling
    { at: f(10), pose: W1, ease: 'io' },
    { at: f(14), pose: { ...W1, py: (W1.py as number) + 0.7, pz: (W1.pz as number) + 0.4 }, ease: 'io' },
    { at: f(18), pose: { ...W1, py: (W1.py as number) - 0.3 }, ease: 'io' },
    // it turns, the hips first; the rake in two frames, the heap lunging into it; frozen on the hit
    { at: f(20), pose: { ...W1, yaw: (W1.yaw as number) + 4, px: (W1.px as number) + 1 }, ease: 'in' },
    { at: SWIPE_HITS[0], pose: H1, ease: 'lin' },
    { at: SWIPE_HITS[0] + RAKE_FREEZE, pose: H1, ease: 'lin' },
    // carried right round: the heap rocking on with it, and back
    { at: f(30), pose: { ...H1, yaw: 42, px: 24, pz: R.pz - 3, pitch: R.pitch + 8, py: 3.5, draw: 0.45 }, ease: 'out' },
    { at: f(36), pose: { yaw: 14, px: 11, pz: R.pz - 0.5, pitch: R.pitch + 3, py: -1.5, draw: 0.5, pt: 0.9 }, ease: 'io' },
    { at: f(42), pose: { yaw: 4, px: 3, pz: R.pz + 1.5, pitch: R.pitch, py: 0.5, draw: 0.7, pt: 0.9 }, ease: 'io' },
    // THE LEFT, a backhand from the other side, bigger again
    { at: f(48), pose: W2, ease: 'io' },
    { at: f(52), pose: { ...W2, py: (W2.py as number) - 0.7, pz: (W2.pz as number) + 0.4 }, ease: 'io' },
    { at: f(56), pose: { ...W2, py: (W2.py as number) + 0.3 }, ease: 'io' },
    { at: f(58), pose: { ...W2, yaw: (W2.yaw as number) - 4, px: (W2.px as number) + 1 }, ease: 'in' },
    { at: SWIPE_HITS[1], pose: H2, ease: 'lin' },
    { at: SWIPE_HITS[1] + RAKE_FREEZE, pose: H2, ease: 'lin' },
    { at: f(68), pose: { ...H2, yaw: -48, px: 28, pz: R.pz - 4, pitch: R.pitch + 9, py: -4, draw: 0.45 }, ease: 'out' },
    { at: f(74), pose: { yaw: -18, px: 12, pz: R.pz - 1, pitch: R.pitch + 4, py: 1.5, draw: 0.5, pt: 0.9 }, ease: 'io' },
    // THE FINISHER (as the first round's, 16 frames later): reared up to its full height, HELD longest; slammed; crashed down
    { at: f(72 + S), pose: { ...REARED }, ease: 'io' },
    { at: f(77 + S), pose: trembling(1), ease: 'io' },
    { at: f(82 + S), pose: trembling(-1), ease: 'io' },
    { at: f(86 + S), pose: trembling(0.2), ease: 'io' },
    { at: f(88 + S), pose: { ...REARED, pz: (REARED.pz as number) - 1, faceTilt: REAR.tilt - 2, pitch: R.pitch + 3, px: -1 }, ease: 'in' },
    { at: SWIPE_HITS[2], pose: CRASH, ease: 'lin' },
    { at: f(97 + S), pose: SQUASH, ease: 'out' },
    { at: f(101 + S), pose: { ...SQUASH, pz: R.pz - 9, py: 1.0 }, ease: 'io' },
    { at: f(105 + S), pose: { ...SQUASH, pz: R.pz - 9.6, py: -1.0 }, ease: 'io' },
    { at: f(110 + S), pose: { pz: R.pz - 4, pitch: R.pitch + 4, px: 2, draw: 0.5, pt: 0.7 }, ease: 'io' },
    { at: SWIPE_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: SWIPE_HITS[0], keys };
}

// ---------------------------------------------------------------------------------------------
// THE FIRST ROUND'S RAKES, kept only for the picture of them beside the new (dev/action_f4_amalgam_scene.ts): not its moves

export const SWIPE1_STRIKES = [[f(22), f(24)], [f(50), f(52)], [f(88), f(90)]] as const;
export const SWIPE1_HITS = [f(24), f(52), f(90)] as const;
export const SWIPE1_LONG = f(120);
const RAKE1_R: { back: V3; via: V3[]; to: V3; on: V3 } = { back: [18, -66, 54], via: [[46, -62, 24], [64, -36, 7], [68, -12, 7]], to: [62, -6, 8], on: [58, 3, 32] };
const RAKE1_L: { back: V3; via: V3[]; to: V3; on: V3 } = { back: [22, 68, 54], via: [[48, 64, 24], [66, 38, 7], [70, 12, 7]], to: [68, -8, 9], on: [60, -22, 24] };
function swipeHands1(): (t: number) => Record<string, V3> {
  const [h1, h2, h3] = SWIPE1_HITS;
  return K.handwork({
    R1: {
      start: PL.R1,
      moves: [
        { t0: f(1), t1: f(10), to: RAKE1_R.back, lift: 10 },
        { t0: f(10), t1: f(15), to: add(RAKE1_R.back, [0.6, -0.8, 1.4]) },
        { t0: f(15), t1: f(20), to: add(RAKE1_R.back, [0.2, -0.3, 0.4]) },
        { t0: f(20), t1: f(22), to: add(RAKE1_R.back, [-1.2, -1.4, 1.2]) },
        { t0: SWIPE1_STRIKES[0][0], t1: h1, to: RAKE1_R.to, via: RAKE1_R.via, ease: 'strike' },
        { t0: h1, t1: f(32), to: RAKE1_R.on, ease: 'io' },
        { t0: f(33), t1: f(42), to: PL.R1, via: [[64, -8, 22]], lift: 8 },
        ...rearUp('R1', f(58), f(72), f(86), [0.6, -0.8, 1.4]),
        { t0: f(86), t1: f(88), to: add(UP.R1, [-1.5, -0.6, 1.5]) },
        { t0: SWIPE1_STRIKES[2][0], t1: h3, to: SLAM.R1, via: [[56, -30, 44]], ease: 'strike' },
        ...homeFrom('R1', f(104), f(114)),
      ],
    },
    L1: {
      start: PL.L1,
      moves: [
        { t0: f(29), t1: f(38), to: RAKE1_L.back, lift: 10 },
        { t0: f(38), t1: f(43), to: add(RAKE1_L.back, [0.6, 0.8, 1.4]) },
        { t0: f(43), t1: f(48), to: add(RAKE1_L.back, [0.2, 0.3, 0.4]) },
        { t0: f(48), t1: f(50), to: add(RAKE1_L.back, [-1.2, 1.4, 1.2]) },
        { t0: SWIPE1_STRIKES[1][0], t1: h2, to: RAKE1_L.to, via: RAKE1_L.via, ease: 'strike' },
        { t0: h2, t1: f(60), to: RAKE1_L.on, ease: 'io' },
        { t0: f(60), t1: f(76), to: UP.L1, via: [[52, 14, 52]] },
        { t0: f(76), t1: f(81), to: add(UP.L1, [0.6, 0.8, 1.4]) },
        { t0: f(81), t1: f(86), to: add(UP.L1, [0.2, 0.3, 0.6]) },
        { t0: f(86), t1: f(88), to: add(UP.L1, [-1.5, 0.6, 1.5]) },
        { t0: SWIPE1_STRIKES[2][0], t1: h3, to: SLAM.L1, via: [[58, 32, 44]], ease: 'strike' },
        ...homeFrom('L1', f(106), f(116)),
      ],
    },
    R2: { start: PL.R2, moves: rearUp('R2', f(60), f(74), f(86), [0.4, -0.8, 1.0]).concat([{ t0: SWIPE1_STRIKES[2][0], t1: h3, to: SLAM.R2, ease: 'strike' }]) },
    L2: { start: PL.L2, moves: rearUp('L2', f(61), f(75), f(86), [0.4, 0.8, 1.0]).concat([{ t0: SWIPE1_STRIKES[2][0], t1: h3, to: SLAM.L2, ease: 'strike' }]) },
    R3: { start: PL.R3, moves: hindIn('R3', f(56), f(100), f(110)) },
    L3: { start: PL.L3, moves: hindIn('L3', f(57), f(102), f(112)) },
  });
}
function swipeMotion1(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: f(10), pose: { yaw: -12, pz: R.pz + 4, faceTilt: 10, faceUp: 2, pitch: R.pitch - 2, draw: 0.85, pt: 0.9 }, ease: 'io' },
    { at: f(15), pose: { yaw: -12.5, pz: R.pz + 4.4, faceTilt: 10.5, faceUp: 2, pitch: R.pitch - 2, py: 0.6, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(20), pose: { yaw: -12.2, pz: R.pz + 4.2, faceTilt: 10.2, faceUp: 2, pitch: R.pitch - 2, py: -0.3, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(22), pose: { yaw: -9, pz: R.pz + 3.6, faceTilt: 9, faceUp: 2, pitch: R.pitch - 1, draw: 0.9, pt: 1 }, ease: 'in' },
    { at: SWIPE1_HITS[0], pose: { yaw: 10, pz: R.pz - 1, faceTilt: 0, faceUp: 0, pitch: R.pitch + 5, px: 2, draw: 0.6, pt: 1 }, ease: 'lin' },
    { at: f(32), pose: { yaw: 14, pz: R.pz - 2, pitch: R.pitch + 6, px: 3, draw: 0.5, pt: 0.9 }, ease: 'out' },
    { at: f(38), pose: { yaw: 12, pz: R.pz + 4, faceTilt: 10, faceUp: 2, pitch: R.pitch - 2, draw: 0.85, pt: 0.9 }, ease: 'io' },
    { at: f(43), pose: { yaw: 12.5, pz: R.pz + 4.4, faceTilt: 10.5, faceUp: 2, pitch: R.pitch - 2, py: -0.6, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(48), pose: { yaw: 12.2, pz: R.pz + 4.2, faceTilt: 10.2, faceUp: 2, pitch: R.pitch - 2, py: 0.3, draw: 0.95, pt: 1 }, ease: 'io' },
    { at: f(50), pose: { yaw: 9, pz: R.pz + 3.6, faceTilt: 9, faceUp: 2, pitch: R.pitch - 1, draw: 0.9, pt: 1 }, ease: 'in' },
    { at: SWIPE1_HITS[1], pose: { yaw: -8, pz: R.pz - 1, faceTilt: 0, faceUp: 0, pitch: R.pitch + 5, px: 2, draw: 0.6, pt: 1 }, ease: 'lin' },
    { at: f(58), pose: { yaw: -10, pz: R.pz - 2, pitch: R.pitch + 6, px: 3, draw: 0.5, pt: 0.9 }, ease: 'out' },
    { at: f(72), pose: { ...REARED }, ease: 'io' },
    { at: f(77), pose: trembling(1), ease: 'io' },
    { at: f(82), pose: trembling(-1), ease: 'io' },
    { at: f(86), pose: trembling(0.2), ease: 'io' },
    { at: f(88), pose: { ...REARED, pz: (REARED.pz as number) - 1, faceTilt: REAR.tilt - 2, pitch: R.pitch + 3, px: -1 }, ease: 'in' },
    { at: SWIPE1_HITS[2], pose: CRASH, ease: 'lin' },
    { at: f(97), pose: SQUASH, ease: 'out' },
    { at: f(101), pose: { ...SQUASH, pz: R.pz - 9, py: 1.0 }, ease: 'io' },
    { at: f(105), pose: { ...SQUASH, pz: R.pz - 9.6, py: -1.0 }, ease: 'io' },
    { at: f(110), pose: { pz: R.pz - 4, pitch: R.pitch + 4, px: 2, draw: 0.5, pt: 0.7 }, ease: 'io' },
    { at: SWIPE1_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: SWIPE1_HITS[0], keys };
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
// THE GRASPING FAN (2 Nov 2026): ITS BASIC ATTACK, IN PLACE OF THE SWIPE COMBO
//
// The owner, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you
// over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)”. So the swipe combo (rake,
// rake, rearing slam) goes; asked what in its place, his pick: “Grasping fan (Recommended)”, offered as: a dozen arms burst from its
// heap and shoot across the floor in a wide fan, snatch at you, then drag back in. Its bone rain, mites, floor arms and devour stay.
//
// THE GRASPING FAN: the heap SWELLS, heaving itself up, its great front hands drawn in under it, and out of its front A DOZEN ARMS OF
// THE DEAD BUNCH AND STRAIN, knotted against it, trembling, while each one's line is MARKED on the floor before it: HELD; in TWO
// FRAMES the heap lurches forward and THE ARMS SHOOT OUT ACROSS THE FLOOR in a wide fan, smeared, each a real arm of its own bones and
// flesh (a dark sinewy upper arm, a bone elbow, the two bones of the forearm, a dead hand with its claws spread); THEY SNATCH SHUT; and
// it HAULS THEM BACK IN along the floor, clawing, heaving itself back on them, until they are in it again.

/** Its moments (seconds, on the game's frames): swelling to 0.4 s, HELD to 1.0 s; the strike frames 30 to 32; snatched shut by 1.2 s; hauled back in to 1.9 s; its stand by 2.6 s. */
export const FAN_STRIKE = [f(30), f(32)] as const;
export const FAN_HIT = f(32);
export const FAN_LONG = f(78);
/** THE FAN: `n` arms from `from` to `to` degrees (its right to its left), reaching `reach` tiles from its middle (each a little more or less, `vary`); a hero within `r` of an arm's line, from `near` tiles out, is struck as they land; the lines marked from `mark` s. */
export const FAN = { n: 12, from: -60, to: 60, reach: 4.75, vary: 0.45, near: 1.0, r: 0.6, mark: 0.1, swell: f(12), snatch: f(36), back: f(58), gone: f(62) } as const;
/** The heap's own flesh, dark: its arms' sinew; and its bones (art/bosses3.ts OSS and its dimmer). */
const FLESH: Ramp = ['#120d20', '#120d20', '#2c2140', '#463a64', '#463a64'];
/** How far out its arms are `t` seconds in (0 in it, bunched; 1 at full reach), and how open its hands (1 spread, 0 shut). */
export function fanOut(t: number): { out: number; grab: number } {
  const [s0, s1] = FAN_STRIKE;
  const sm = (k: number): number => k * k * (3 - 2 * k);
  if (t <= s0) return { out: 0.06 + 0.03 * clamp01((t - 0.15) / 0.3), grab: 0.2 + 0.8 * clamp01((t - 0.3) / 0.4) };
  if (t <= s1) return { out: (t - s0) / (s1 - s0) * 0.98 + 0.02 * 0, grab: 1 };
  if (t <= FAN.snatch) {
    const k = sm(clamp01((t - s1) / (FAN.snatch - s1)));
    return { out: 1 + 0.045 * k, grab: 1 - k };
  }
  if (t <= f(40)) return { out: 1.045 - 0.01 * sm(clamp01((t - FAN.snatch) / (f(40) - FAN.snatch))), grab: 0 };
  if (t <= FAN.back) return { out: 1.035 - 1.0 * sm(clamp01((t - f(40)) / (FAN.back - f(40)))), grab: 0.1 + 0.15 * Math.sin(t * 40) ** 2 };
  return { out: 0.035 * (1 - clamp01((t - FAN.back) / (FAN.gone - FAN.back))), grab: 0.2 };
}
/** Arm `i` of the fan: its way (degrees from its forward, to its left), and its reach (tiles). */
export function fanArmWay(i: number): { deg: number; reach: number } {
  const deg = FAN.from + ((FAN.to - FAN.from) * i) / (FAN.n - 1) + (hash(i, 1, 2201) - 0.5) * 6;
  return { deg, reach: FAN.reach + (hash(i, 2, 2201) - 0.5) * 2 * FAN.vary };
}
/** Arm `i` at `t` seconds in, with the heap `px` on: where it bursts out of the heap, its elbow, its wrist, the way its hand points and its side; how open. */
export function fanArmAt(i: number, t: number, px: number): { base: V3; elbow: V3; wrist: V3; fd: V3; side: V3; grab: number; out: number } {
  const { deg, reach } = fanArmWay(i);
  const th = (deg * Math.PI) / 180;
  const o: V3 = [Math.cos(th), Math.sin(th), 0];
  const sd: V3 = [-o[1], o[0], 0];
  const { out, grab } = fanOut(t);
  const base: V3 = [px + o[0] * 34, o[1] * 34, 11 + 2 * Math.sin(i * 1.7)];
  const far = reach * TILE3 - 16;
  const shiver = t < FAN_STRIKE[0] && t > 0.3 ? Math.sin(t * 47 + i * 2.1) * 0.9 : 0;
  // BUNCHED, while it is held: each wrist reared up off the front of the heap, clawing at the air, straining, the elbow cocked out to
  // the side; as they go out, down onto the floor and along it, the elbow bowed out the other way, low
  const bunch = clamp01(1 - out / 0.12);
  const along = 34 + (far - 34) * out;
  const z0 = 22 + 9 * Math.abs(Math.sin(i * 2.3)) + shiver;
  const wrist: V3 = add(add([px * (1 - out), 0, 0], mul(o, along + 14 * bunch)), [shiver * 0.4 * sd[0], shiver * 0.4 * sd[1], bunch * z0 + (1 - bunch) * (3.5 + 10 * (1 - out))]);
  const kink = (i % 2 ? 1 : -1) * (5 + 4 * hash(i, 4, 2201));
  const mid = lerp3(base, wrist, 0.46);
  const lift = bunch * 12 + (1 - bunch) * (8 * (1 - 0.6 * out) + 3);
  const elbow: V3 = add(mid, add(mul(sd, kink * (bunch * 1.4 + (1 - bunch) * (0.6 + 0.4 * out))), [0, 0, lift]));
  const fd = norm(sub(wrist, elbow), o);
  const side = norm(cross([0, 0, 1], fd), sd);
  return { base, elbow, wrist, fd, side, grab, out };
}
/** The fan's lines on the floor (tiles before it, to its left): from `near` out to each arm's reach. */
export function fanLines(): { deg: number; reach: number }[] {
  return Array.from({ length: FAN.n }, (_, i) => fanArmWay(i));
}
/** Whether the fan strikes a hero `x` tiles before it and `y` to its left (as its arms land, `FAN_HIT`): within `r` of an arm's line. */
export function fanStrikes(x: number, y: number): boolean {
  return fanLines().some(({ deg, reach }) => {
    const th = (deg * Math.PI) / 180;
    const along = x * Math.cos(th) + y * Math.sin(th);
    const across = -x * Math.sin(th) + y * Math.cos(th);
    return along >= FAN.near && along <= reach + 0.2 && Math.abs(across) <= FAN.r;
  });
}
/** THE FAN'S ARMS as solids, at a moment (and their smear as they shoot out). */
function fanBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (m.move !== FAN_NAME || m.t > FAN.gone) return bits;
  const t = m.t;
  const put = (part: string, shape: Bit['shape']): void => void bits.push({ part, piece: part, shape });
  const px = (m.q.px as number) ?? 0;
  for (let i = 0; i < FAN.n; i++) {
    const a = fanArmAt(i, t, px);
    if (a.out < 0.025 && t > FAN.back) continue;
    const part = `fan${i}`;
    const r = 2.9 + 0.5 * hash(i, 3, 2201);
    // where it bursts out of the heap: a knot of its flesh
    put(part, { k: 'ball', c: a.base, ax: sphere(r * 1.5), skin: FLESH });
    // the upper arm, dark sinew, a ridge of bone down it
    put(part, { k: 'rod', a: a.base, b: a.elbow, ra: r * 1.15, rb: r * 0.9, ramp: FLESH, far: true });
    put(part, { k: 'rod', a: lerp3(a.base, a.elbow, 0.25), b: lerp3(a.base, a.elbow, 0.85), ra: r * 0.42, rb: r * 0.36, ramp: K.DEEP_OSS, far: true });
    // the elbow, bone; the forearm's two bones
    put(part, { k: 'ball', c: a.elbow, ax: sphere(r * 1.05), skin: OSS, far: true });
    const fd2 = norm(sub(a.wrist, a.elbow), a.fd);
    const sd = norm(cross(fd2, [0, 0, 1]), a.side);
    for (const q of [-1, 1]) put(part, { k: 'rod', a: add(a.elbow, mul(sd, q * r * 0.42)), b: add(a.wrist, mul(sd, q * r * 0.3)), ra: r * 0.5, rb: r * 0.4, ramp: OSS, far: true });
    // the hand: the dead's, big, its claws spread, then snatched shut
    K.deadHand((pp, pc, sh) => put(pp, sh), part, a.wrist, a.fd, a.side, r * 1.25, a.grab, OSS);
    // (its claws' tips burning with the enemy's fire as they snatch)
    if (a.out > 0.9 && t < FAN.snatch + 0.1) bits.push({ part: 'fanglint', piece: 'fanglint', shape: { k: 'glow', p: add(a.wrist, mul(a.fd, r * 5)), c: '#ff3a78', r: 7, a: 0.3 } });
  }
  // THE SMEAR: as they shoot out, after-images of each arm along the way it came, bone-white at their heads, the enemy's pink behind
  if (t > FAN_STRIKE[0] + 1e-6 && t <= FAN_HIT + FR + 1e-6) {
    const thin = t > FAN_HIT + 1e-6;
    const k0 = thin ? 0.82 : 0.02;
    const k1 = Math.min(1, fanOut(Math.min(t, FAN_HIT)).out);
    for (let i = 0; i < FAN.n; i++) {
      const { deg, reach } = fanArmWay(i);
      const th = (deg * Math.PI) / 180;
      const o: V3 = [Math.cos(th), Math.sin(th), 0];
      const sd: V3 = [-o[1], o[0], 0];
      const far = reach * TILE3 - 16;
      for (let d = 34 + (far - 34) * k0; d <= 34 + (far - 34) * k1; d += 1.4) {
        const age = 1 - (d - 34) / Math.max(1, far - 34);
        for (const q of [-1, 0, 1]) {
          if (q !== 0 && age > 0.5) continue;
          const c = age < 0.12 ? '#fff0e6' : age < 0.35 ? BONE_W[3] : age < 0.6 ? PINK_W[3] : PINK_W[2];
          bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [px * 0 + o[0] * d + sd[0] * q * 2.2, o[1] * d + sd[1] * q * 2.2, 4 + 8 * age], c, size: age < 0.4 ? 2 : 1 } });
        }
      }
    }
  }
  return bits;
}
const FAN_NAME = 'The grasping fan';
/** Its swelling: heaved up, tipped back a little, swollen, its maw open. */
const SWELL: P = { pz: R.pz + 7, faceUp: 8, faceTilt: 12, pitch: R.pitch - 3, px: -5, draw: 1, pt: 1 };
/** Its lurch as the arms go out: thrown forward and down. */
const LURCH: P = { pz: R.pz - 3, faceUp: 0, faceTilt: 0, pitch: R.pitch + 8, px: 12, draw: 1, pt: 1 };
function fanHands(): (t: number) => Record<string, V3> {
  const [s0, s1] = FAN_STRIKE;
  return K.handwork({
    // its great front hands drawn in under it, gripping, as it swells; flung on and slammed flat before it as it lurches; back after
    R1: { start: PL.R1, moves: [{ t0: f(2), t1: f(11), to: [42, -30, 0], lift: 8 }, { t0: s0, t1: s1, to: SLAM.R1, via: [[56, -30, 20]], ease: 'strike' }, { t0: f(60), t1: f(70), to: PL.R1, lift: 6 }] },
    L1: { start: PL.L1, moves: [{ t0: f(3), t1: f(12), to: [44, 32, 0], lift: 8 }, { t0: s0, t1: s1, to: SLAM.L1, via: [[58, 32, 20]], ease: 'strike' }, { t0: f(61), t1: f(71), to: PL.L1, lift: 6 }] },
  });
}
function fanMotion(): Motion {
  const [s0] = FAN_STRIKE;
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: FAN.swell, pose: SWELL, ease: 'io' },
    { at: f(17), pose: { ...SWELL, py: 0.8, pz: (SWELL.pz as number) + 0.5 }, ease: 'io' },
    { at: f(22), pose: { ...SWELL, py: -0.8, pz: (SWELL.pz as number) - 0.3 }, ease: 'io' },
    { at: f(27), pose: { ...SWELL, py: 0.3, pz: (SWELL.pz as number) + 0.3 }, ease: 'io' },
    { at: s0, pose: { ...SWELL, px: -6, pz: (SWELL.pz as number) + 0.6 }, ease: 'in' },
    { at: FAN_HIT, pose: LURCH, ease: 'lin' },
    { at: FAN.snatch, pose: { ...LURCH, pz: R.pz - 5, pitch: R.pitch + 9, px: 13, draw: 0.9 }, ease: 'out' },
    { at: f(40), pose: { ...LURCH, pz: R.pz - 4.6, pitch: R.pitch + 8.6, px: 12.6, draw: 0.9 }, ease: 'io' },
    // HAULED BACK: heaving itself back on its arms
    { at: f(50), pose: { pz: R.pz + 3, faceUp: 4, faceTilt: 6, pitch: R.pitch - 4, px: 1, draw: 1, pt: 1 }, ease: 'io' },
    { at: FAN.back, pose: { pz: R.pz + 2, faceUp: 2, faceTilt: 3, pitch: R.pitch - 2, px: -1, draw: 0.8, pt: 0.9 }, ease: 'io' },
    { at: f(68), pose: { pz: R.pz - 1, pitch: R.pitch + 1, px: 0, draw: 0.5, pt: 0.8 }, ease: 'io' },
    { at: FAN_LONG, pose: {}, ease: 'io' },
  ];
  return { hit: FAN_HIT, keys };
}
/** The middle of the fan's hands at a moment (the end it strikes with, for the review): arm 5's, in front of it. */
export function fanTip(t: number, px: number): V3 {
  return fanArmAt(5, t, px).wrist;
}

// =============================================================================================
// THE SMEAR, and what the slams throw off

/** The strikes of each move (from the last frame of its wind-up to the frame it lands on), and which hands strike in each. */
export const AM_ACT_STRIKES: Readonly<Record<string, ReadonlyArray<{ s: readonly [number, number]; hands: readonly string[] }>>> = {
  attack: [{ s: FAN_STRIKE, hands: ['R1', 'L1'] }],
  rain: [{ s: RAIN_STRIKE, hands: ['R1', 'L1', 'R2', 'L2'] }],
  floorArms: [{ s: ARMS_STRIKE, hands: ['R1', 'L1', 'R2', 'L2'] }],
  devour: [{ s: DEVOUR_STRIKES[0], hands: ['R1', 'L1'] }, { s: DEVOUR_STRIKES[1], hands: [] }],
};
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function amSmeared(move: string, t: number): boolean {
  return (AM_ACT_STRIKES[move] ?? []).some(({ s }) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6);
}
/** THE SMEAR'S AFTER-IMAGES of the hands that strike (and, at the bite, of its maw's lips), along the way they came: lines of points, oldest first, as ropes `smear...`. */
function smearOf(move: string, hands: (t: number) => Record<string, V3>, maw?: (t: number) => V3[], strikes = AM_ACT_STRIKES[move] ?? []): (t: number) => Record<string, V3[]> {
  return (t) => {
    const out: Record<string, V3[]> = {};
    for (const { s, hands: names } of strikes) {
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

// ---------------------------------------------------------------------------------------------
// THE RAKE'S SLASH: the vast arc of its claws, the after-images of them, the bone chips and dust flung

/** A rake's slash stays whole through the freeze on its hit, then thins out over these four frames. */
export const RAKE_FADE = f(4);
/** How many moments of a rake's way its slash is drawn through (its strike's two frames). */
const RAKE_N = 30;
/**
 * THE WAY A RAKE'S HAND WENT through its strike, up to `t` (the figure's own lengths, oldest first): RAKE_N + 1 moments from the
 * last frame of its wind-up to `t` (or to where it landed).
 */
function rakeWay(hands: (t: number) => Record<string, V3>, i: number, t: number): V3[] {
  const rk = RK[i];
  const [s0, s1] = rk.strike;
  const to = Math.min(t, s1);
  const out: V3[] = [];
  // (where its hand truly is, its arm put within reach: the figure as the game paints it, with the swipe combo: its picture's own)
  const mob = MADE ? amalgamSwipeMob() : null;
  for (let k = 0; k <= RAKE_N; k++) {
    const tt = s0 + ((to - s0) * k) / RAKE_N;
    const h = hands(tt);
    if (!mob) {
      out.push(h[rk.hand]);
      continue;
    }
    const g = amGeometry(skeletonAt(mob, 'attack', tt), posedOfMob(mob, 'attack', tt), { amR3: [h.R3], amL3: [h.L3] });
    out.push((g.arms.find((a) => a.name === rk.hand) as { hand: V3 }).hand);
  }
  return out;
}
/** THE WAY A RAKE'S HAND WENT through the whole of its strike (the figure's own lengths, oldest first): for its gouges in the floor (art/amalgam_action_fx.ts). */
export function rakePath(i: number): V3[] {
  amalgamActionMob();
  return rakeWay(SWIPE_HANDS as (t: number) => Record<string, V3>, i, RK[i].strike[1]);
}
let SWIPE_HANDS: ((t: number) => Record<string, V3>) | null = null;
/** How much of a rake's slash is left at `t` (1 whole, 0 gone), or -1 if none is drawn then. */
export function rakeLeft(i: number, t: number): number {
  const [s0, s1] = RK[i].strike;
  if (t <= s0 + 1e-6) return -1;
  const end = s1 + RAKE_FREEZE;
  if (t <= end + 1e-6) return 1;
  const k = 1 - (t - end) / RAKE_FADE;
  return k > 1e-6 ? k : -1;
}
/** The rake's slash as ropes: `rake<i>` its hand's way, `rake<i>k` [how much is left, how far out it reaches (lengths), its side]. */
function rakeRopes(hands: (t: number) => Record<string, V3>): (t: number) => Record<string, V3[]> {
  return (t) => {
    const out: Record<string, V3[]> = {};
    RK.forEach((rk, i) => {
      const left = rakeLeft(i, t);
      if (left < 0) return;
      out[`rake${i}`] = rakeWay(hands, i, t);
      out[`rake${i}k`] = [[left, rk.out * TILE3, rk.side]];
    });
    // (THE WARNING: the claws of the arm hauled up glowing with the enemy's fire, brighter and brighter while it is held)
    RK.forEach((rk, i) => {
      const [s0] = rk.strike;
      const from = s0 - f(12);
      if (t < from || t > s0 + 1e-6) return;
      const h = rakeWay(hands, i, s0)[0];
      const mob = MADE ? amalgamSwipeMob() : null;
      let at = h;
      if (mob) {
        const hh = hands(t);
        const g = amGeometry(skeletonAt(mob, 'attack', t), posedOfMob(mob, 'attack', t), { amR3: [hh.R3], amL3: [hh.L3] });
        at = (g.arms.find((a) => a.name === rk.hand) as { hand: V3 }).hand;
      }
      out[`glint${i}`] = [at, [clamp01((t - from) / f(8)), 0, 0]];
    });
    return out;
  };
}
/** Bone chips and dust flung off the floor along a rake's way as its claws tear across it (`since` its hit). */
function rakeChips(hands: (t: number) => Record<string, V3>, i: number, since: number): Record<string, V3[]> {
  if (since < 0 || since > 0.7) return {};
  const way = rakeWay(hands, i, RK[i].strike[1]);
  const chips: V3[] = [];
  for (let k = 6; k < way.length; k += 2) {
    const p = way[k];
    const o = norm([p[0], p[1], 0], [1, 0, 0]);
    for (let j = 0; j < 3; j++) {
      const life = 0.35 + 0.3 * hash01(k, j, 2101 + i);
      if (since > life) continue;
      const sp = 30 + 70 * hash01(k, j + 5, 2101 + i);
      const vz = 50 + 90 * hash01(k, j + 9, 2101 + i);
      const a = (hash01(k, j + 13, 2101 + i) - 0.5) * 1.4;
      const d: V3 = [o[0] * Math.cos(a) - o[1] * Math.sin(a), o[0] * Math.sin(a) + o[1] * Math.cos(a), 0];
      const tt = since + 0.02;
      chips.push([p[0] + d[0] * sp * tt, p[1] + d[1] * sp * tt, Math.max(0.8, 1.5 + vz * tt - 300 * tt * tt)]);
    }
  }
  const low = way.filter((p) => p[2] < 14);
  return { ...(K.slamBurst(low, since, 2111 + i, 1.1) as Record<string, V3[]>), [`chips${i}`]: chips };
}
const hash01 = hash;
/** The slash's colours: its claws' streaks bone-white, newest near white; between them the enemy's pink, darkening as it goes back. */
const SLASH = { white: '#fff0e6', bone: BONE_W[3], boneDim: BONE_W[2], hot: PINK_W[3], pink: PINK_W[2], deep: PINK_W[1] } as const;
/** Where the claws' four streaks lie across the slash (0 its inner edge, at its claws; 1 its outer edge, its reach). */
const STREAKS = [0.04, 0.35, 0.66, 0.97] as const;
/**
 * THE VAST ARC OF ITS CLAWS, a rake's slash: four streaks of its claws, from where its claws are out to `out` (its reach), swept
 * round its middle along the way its hand went: widest at the hand, narrowing back along the way it came (and only as its claws
 * come down low over the floor: drawn up high it is only the arm's own smear); each streak thick and near white at its head, bone,
 * then the enemy's pink, thinning to nothing at its tail; a thin haze of the enemy's pink between them; low over the floor and
 * falling to it at the outer edge. After-images of its claws along the way too. Thinning as it goes.
 */
function rakeBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  const ropes = m.ropes;
  if (!ropes) return bits;
  const mote = (p: V3, c: string, size: number): void => {
    bits.push({ part: 'slash', piece: 'slash', shape: { k: 'mote', p, c, size } });
  };
  for (let i = 0; i < RK.length; i++) {
    const glint = ropes[`glint${i}`];
    if (glint) {
      const [h, [g]] = glint;
      bits.push({ part: 'slash', piece: 'slash', shape: { k: 'glow', p: h, c: '#ff3a78', r: 10 + 8 * g, a: 0.25 + 0.25 * g } });
      for (let c = 0; c < 6; c++) {
        const a = (c / 6) * Math.PI * 2 + m.t * 9;
        const p: V3 = [h[0] + Math.cos(a) * 4, h[1] + Math.sin(a) * 4, h[2] + 3 + Math.sin(a * 2) * 2];
        if (hash01(c, Math.floor(m.t * 30), 2151) < 0.4 + 0.6 * g) mote(p, g > 0.7 && c % 2 ? SLASH.white : SLASH.hot, g > 0.5 && c % 3 === 0 ? 2 : 1);
      }
    }
    const way = ropes[`rake${i}`];
    const info = ropes[`rake${i}k`]?.[0];
    if (!way || !info || way.length < 2) continue;
    const [keep, OUT] = info;
    const n = way.length - 1;
    const seed = 2131 + i * 7 + Math.floor(m.t * 30 + 0.5);
    const at = (k: number): { a: number; r: number; z: number; low: number } => {
      const p = way[k];
      return { a: Math.atan2(p[1], p[0]), r: Math.hypot(p[0], p[1]) + 8, z: Math.max(12, p[2] + 4), low: clamp01((28 - p[2]) / 14) };
    };
    for (let k = 1; k <= n; k++) {
      const age = 1 - k / n;
      // (as it thins, its oldest end is eaten away first)
      if (age > keep) continue;
      const A = at(k - 1);
      const B = at(k);
      let da = B.a - A.a;
      if (da > Math.PI) da -= 2 * Math.PI;
      if (da < -Math.PI) da += 2 * Math.PI;
      const steps = Math.max(1, Math.ceil((Math.abs(da) * OUT + Math.abs(B.r - A.r) + Math.abs(B.z - A.z)) / 1.2));
      for (let j = 0; j < steps; j++) {
        const u = j / steps;
        const ang = A.a + da * u;
        const rin = A.r + (B.r - A.r) * u;
        const zin = A.z + (B.z - A.z) * u;
        const low = A.low + (B.low - A.low) * u;
        const ag = Math.min(1, age + (1 / n) * (1 - u));
        // (drawn up high, coming down, it is only the arm's own smear)
        if (low < 0.2) continue;
        const wide = Math.max(0, 1 - Math.pow(ag, 1.6)) * low;
        const rout = rin + (OUT - rin) * wide;
        const span = rout - rin;
        const across = Math.max(1, Math.ceil(span / 1.1));
        const co = Math.cos(ang);
        const sn = Math.sin(ang);
        // (each streak's thickness: most at its head, thinning to its tail; less when keeping less)
        const thick = Math.pow(1 - ag, 0.7) * (0.4 + 0.6 * keep);
        const core = 0.4 + 1.5 * thick;
        const edge = core + 1.2;
        for (let q = 0; q <= across; q++) {
          const v = q / across;
          const r = rin + span * v;
          const p: V3 = [co * r, sn * r, Math.max(1.2, zin + (5 - zin) * v * low)];
          let d = 99;
          for (const c of STREAKS) d = Math.min(d, Math.abs(v - c) * span);
          if (span < 2) d = 0;
          if (d < core) mote(p, ag < 0.24 ? SLASH.white : ag < 0.5 ? SLASH.bone : ag < 0.75 ? SLASH.hot : SLASH.pink, ag < 0.5 && d < core - 0.6 ? 2 : 1);
          else if (d < edge) {
            if (ag < 0.8 && hash01(k * 37 + j, q, seed) < 0.85 * keep) mote(p, ag < 0.4 ? SLASH.hot : SLASH.pink, 1);
          } else if (ag < 0.05 && low > 0.5) mote(p, SLASH.boneDim, 1);
          else if (hash01(k * 37 + j, q, seed + 1) < 0.16 * (1 - ag) * keep * low) mote(p, ag < 0.4 ? SLASH.pink : SLASH.deep, 1);
        }
      }
    }
    // AFTER-IMAGES OF ITS CLAWS along the way, older and older
    for (const g of [0.22, 0.46, 0.7]) {
      if (g > keep) continue;
      const k = Math.round((1 - g) * n);
      const p = way[k];
      const o = norm([p[0], p[1], 0], [1, 0, 0]);
      const side: V3 = [-o[1], o[0], 0];
      for (let c = 0; c < 4; c++) {
        const spread = (c - 1.5) * 0.22;
        const d = norm(add(add(o, mul(side, spread)), [0, 0, -0.25]));
        for (let s = 0; s <= 14; s += 1.2) mote(add(add(p, [0, 0, 1.5]), mul(d, s)), g < 0.3 ? SLASH.bone : g < 0.5 ? SLASH.hot : SLASH.pink, 1);
      }
    }
    // BONE CHIPS flung off the floor
    for (const p of ropes[`chips${i}`] ?? []) mote(p, hash01(p[0], p[1], 2141) < 0.5 ? SLASH.bone : SLASH.boneDim, hash01(p[1], p[0], 2143) < 0.35 ? 2 : 1);
  }
  return bits;
}

// =============================================================================================
// THE AMALGAMATION WITH THESE MOVES

/** Its canvas: room over it for it reared and its arms raised, and before it for its rake and what it drags in. */
export const ACT_CANVAS: MobCanvas = { w: 500, h: 400, ax: 210, ay: 236 };
let MADE: Mob | null = null;
/** THE AMALGAMATION AS FREE AS THE GAME'S, with these moves (made the first time asked for). */
export function amalgamActionMob(): Mob {
  if (MADE) return MADE;
  const base = AMALGAM;
  const sw = swipeHands();
  SWIPE_HANDS = sw;
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
  const swRake = rakeRopes(sw);
  // (the second round's swipe combo, kept for the picture of it beside the new: `amalgamSwipeMob`; not its moves)
  SWIPE_MOVE = K.amMove('The swipe, the other swipe, and the slam', swipeMotion(), sw, {
    also: (t) => merge(swSmear(t), swRake(t), rakeChips(sw, 0, t - SWIPE_HITS[0]), rakeChips(sw, 1, t - SWIPE_HITS[1]), slams(SWIPE_HITS[2], 73, sw)(t), {
      burn: [[Math.max(0.7 * burning(t, 0.05, 0.33, SWIPE_HITS[0] + 0.1, SWIPE_HITS[0] + 0.45), 0.8 * burning(t, 1.2, 1.6, SWIPE_HITS[1] + 0.1, SWIPE_HITS[1] + 0.45), burning(t, f(58 + S) - 0.02, f(72 + S), SWIPE_HITS[2], SWIPE_HITS[2] + 0.6)), 0, 0]],
    }),
  });
  // THE GRASPING FAN (2 Nov), its basic attack
  const fh = fanHands();
  const attack = K.amMove(FAN_NAME, fanMotion(), fh, {
    also: (t) => merge(smearOf('attack', fh)(t), K.slamBurst([fh(FAN_HIT).R1, fh(FAN_HIT).L1], t - FAN_HIT, 77, 1.0) as Record<string, V3[]>, {
      burn: [[burning(t, 0.05, 0.45, FAN_HIT + 0.1, FAN_HIT + 0.6), 0, 0]],
    }),
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
    hit: FAN_HIT,
    more,
    bits: (st: Stage, m: Moment) => [...base.bits(st, m), ...smearBits(m), ...rakeBits(m), ...fanBits(m)],
  };
  return MADE;
}
let SWIPE_MOVE: MobMove | null = null;
/** IT WITH THE SECOND ROUND'S SWIPE COMBO as its attack (only for the picture of it beside the new fan; not its moves). */
let MADE2: Mob | null = null;
export function amalgamSwipeMob(): Mob {
  if (MADE2) return MADE2;
  const mob = amalgamActionMob();
  MADE2 = { ...mob, id: 'amalgam+action swipe', attack: SWIPE_MOVE as MobMove, hit: SWIPE_HITS[0] };
  return MADE2;
}
void AM_CANVAS;

/** IT WITH THE FIRST ROUND'S RAKES (only for the picture of them beside the new: dev/action_f4_amalgam_scene.ts; not its moves). */
let MADE1: Mob | null = null;
export function amalgamRound1Mob(): Mob {
  if (MADE1) return MADE1;
  const mob = amalgamActionMob();
  const sw = swipeHands1();
  const strikes = [{ s: SWIPE1_STRIKES[0], hands: ['R1'] }, { s: SWIPE1_STRIKES[1], hands: ['L1'] }, { s: SWIPE1_STRIKES[2], hands: ['R1', 'L1', 'R2', 'L2'] }];
  const smear = smearOf('attack', sw, undefined, strikes);
  const slam = (t: number): Record<string, V3[]> => {
    const at = (h: number, n: string): V3 => sw(h)[n];
    const burst = (pts: V3[], since: number, seed: number, k: number): Record<string, ReadonlyArray<V3>> => K.slamBurst(pts, since, seed, k) as Record<string, V3[]>;
    const out: Record<string, V3[]> = {};
    for (const r of [burst([at(SWIPE1_HITS[0], 'R1')], t - SWIPE1_HITS[0], 71, 0.8), burst([at(SWIPE1_HITS[1], 'L1')], t - SWIPE1_HITS[1], 72, 0.8), burst(['R1', 'L1', 'R2', 'L2'].map((n) => at(SWIPE1_HITS[2], n)).filter((p) => p[2] < 1), t - SWIPE1_HITS[2], 73, 1.3)]) for (const [k, v] of Object.entries(r)) out[k] = [...(out[k] ?? []), ...v];
    return out;
  };
  const attack = K.amMove('The first round’s swipe', swipeMotion1(), sw, { also: (t) => ({ ...slam(t), ...smear(t), burn: [[Math.max(0.6 * burning(t, 0.05, 0.33, 0.8, 1.1), 0.6 * burning(t, 0.95, 1.27, 1.73, 2.0), burning(t, 1.95, 2.4, 3.0, 3.6)), 0, 0]] }) });
  MADE1 = { ...mob, id: 'amalgam+action round 1', attack, hit: SWIPE1_HITS[0], bits: (st: Stage, m: Moment) => [...AMALGAM.bits(st, m), ...smearBits(m)] };
  return MADE1;
}
/** It with the first round's rakes, as the game holds a monster (for the pictures only). */
export function makeAmalgamRound1Art(pace = AMALGAM.pace): ActorArt {
  const mob = amalgamRound1Mob();
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

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
    attack: [{ hit: FAN_HIT, strike: FAN_STRIKE, from: 0 }],
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
      // (the fan: the hand of its middle arm, as it shoots out and is hauled back)
      if (move === 'attack') return t <= FAN.back + 1e-6 ? fanTip(t, (q.px as number) ?? 0) : null;
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
