// THE WARRIOR'S MOVES, BROUGHT UP TO THE BRAWLER'S LEVEL (the art chat's helper, 6 Nov 2026; docs/mockups/warrior_up/README.md).
// Behind art/warrior_up.ts WARRIOR_UP, off. On his own bones (moves3.ts KNIGHT_BODY), from his own stances (the rear stance,
// his town stance), as moves3.ts has them; the old moves are not changed.
//
// His rulebook, as the Veteran keeps it: every list 30 pictures a second; keys eased in and out; alive when still (he breathes,
// shifts his weight and has habits of his own); every blow by Movement 9 (“Like the wind up and wind down are big but the
// actual punch is lightning quick”): a big wind-up, HELD, the strike in two frames (smeared, with after-images), and a big
// wind-down; his feet gripping the floor (a foot down stays where it is; his run steps as fast as the game carries him).
//
// FOR THE MAIN CHAT, WHAT CHANGES IN THE GAME'S NUMBERS (only with the switch on): Strike's blow lands at 10 frames (0.333 s,
// where the rules have 0.12: TUNE `strike.windup`), both swings; the first swing holds the sword up until 21 frames (its
// poise, 0.7 s) and is over at 36 (1.2 s); the second is over at 27 (0.9 s). Slam lands at 15 (0.5 s; `slam.windup` 0.22).
// The Lunge (the diving thrust), the Whirlwind, being struck and the fall keep their times.

import { BODY, GREAT_BLADE, GRIP_SPEED, KNIGHT_BODY, KNIGHT_DRAW3, KNIGHT_LOOKS3, KNIGHT_TOWN3, REAR3, STRIKE3, THRUST3, UNITS_PER_TILE, gripping, run } from './moves3';
import type { Gait, Move3 } from './moves3';
import { TUNE } from '../game/defs';
import { aimFor, along, bonesAt, chestOf, elbowFor, solve } from './skeleton';
import type { Bones, Key3, Motion, Posed } from './skeleton';
import { wuBackPlace } from './warrior_up';

const FR = 1 / 30;
const B = KNIGHT_BODY;
/** His rear stance and his town stance as the owner saw them brought up (moves3.ts's), before his legs were made true. */
export const WU_REST_SEEN: Bones = REAR3.rest;
export const WU_TOWN_REST_SEEN: Bones = KNIGHT_TOWN3.rest;

// HIS LEGS MADE TRUE ON THE SCREEN. The owner, 6 Nov 2026, seeing the Ranger: “Can you make sure his leg ratio is correct cause it
// seems like all these guys have long upper legs and short legs below the knee”; and, asked whether to mend every hero the same
// way: “Yes, every hero (Recommended)”. His bones are a man's (standing straight his lower leg reads 1.14 times his thigh on the
// screen), but every crouch bent his knees toward the camera, so that each shin was seen end-on and read short (his guard 0.89,
// his run 0.92; from his side toward the camera, 0.57). Mended as the Ranger was, by where his feet and knees go and nothing else:
// his crouch as low, his body, arms and sword as they were; his front foot further forward with its knee turned out over it,
// his back foot further back, its leg longer (art/warrior_up_review.ts wuLegs; tests/warrior_up.test.ts holds every stance and
// held pose of his at 1.05 or more from every side the leg is seen, his run at 1 where a leg bears him).

/** His guard's feet and knees, made true (they were moves3.ts REAR3's: front foot 10.5, knee 4; back foot -9). */
const GUARD_LEGS = { lfx: 18.5, lfy: 0.5, lft: 6, lk: 5, rfx: -17, rfy: -1.5, rft: -55, rk: -40 } as const;
/** How far his front foot and his back foot now stand from where they stood (for the moves' feet that stand where his guard has them). */
const DF = GUARD_LEGS.lfx - WU_REST_SEEN.lfx;
const DB = GUARD_LEGS.rfx - WU_REST_SEEN.rfx;
// HIS SWORD SEEN FROM EVERY SIDE (the coordinator, 6 Nov 2026, before the owner sees him: from down and to the left his sword
// vanished, in his guard and his run wholly behind him; from toward him only a stub of it showed; "his glowing great sword is
// his signature, and a hero must read armed in every facing"). Held as it was, its point low behind him, the blade lay along the
// line from two of his sides to him, and he hid it. Now his hands are back and out by his right hip and the blade is carried
// level behind him, pointing back and out to his right: from every side a good length of it, its point among it, stands clear
// of him (art/warrior_up_review.ts wuBladeSeen; tests/warrior_up.test.ts holds it from all eight sides, in every list he holds
// or runs in). Only how the sword and his sword arm sit is changed: his body, his feet and his legs are as they were.

/** His sword in his guard: his hands (on the floor's own measure) and the way the blade points (it was hands -2.5, -11.5, 25,
 * the blade -162 round and 40 down). */
const GUARD_SWORD = { rhIn: 2, rhx: -2.5, rhy: -17.5, rhz: 34.5, wAz: -142, wEl: 0 } as const;
/** His rear stance, his legs made true and his sword where it is seen. */
export const WU_REST: Bones = { ...WU_REST_SEEN, ...GUARD_LEGS, ...GUARD_SWORD };
/** His sword as his guard holds it, for a key that comes down into his guard from over him (its way round said from there). */
function guardSword(): Partial<Bones> {
  const R = WU_REST;
  return { rhIn: R.rhIn, rhx: R.rhx, rhy: R.rhy, rhz: R.rhz, re: R.re, le: R.le, lhIn: R.lhIn, lhx: R.lhx, lhy: R.lhy, lhz: R.lhz, wAz: R.wAz + 360, wEl: R.wEl, wRoll: R.wRoll };
}
/** His town stance, his legs made true: his feet further apart (they were 1.4 and -1.8 to the side). */
export const WU_TOWN_REST: Bones = { ...WU_TOWN_REST_SEEN, lfy: 8.9, rfy: -6.3 };

/** A foot standing on its toes: the heel up by `deg`, the ball still on the floor (the ankle is that much higher). As moves3.ts. */
function onToes(deg: number): number {
  const a = (deg * Math.PI) / 180;
  return BODY.ball * Math.sin(a) + B.ankle * Math.cos(a) - B.ankle;
}
/** Where the back foot stands from a blow on (as moves3.ts backFoot): its ball where the stance has it, turned -8, on its toes 36. */
function backFoot(heel = 36, turn = -8): Partial<Bones> {
  const a36 = (heel * Math.PI) / 180;
  const t8 = (turn * Math.PI) / 180;
  // (the ball of his back foot in his guard: the foot flat, turned as it is)
  const tr = (WU_REST.rft * Math.PI) / 180;
  const ballX = WU_REST.rfx + B.ball * Math.cos(tr);
  const ballY = WU_REST.rfy - B.stance + B.ball * Math.sin(tr);
  const ankX = ballX - B.ball * Math.cos(a36) * Math.cos(t8);
  const ankY = ballY - B.ball * Math.cos(a36) * Math.sin(t8);
  return { rfx: ankX, rfy: ankY + B.stance, rfp: heel, rfz: onToes(heel), rft: turn };
}
/** His feet planted for a blow: the front foot flat where the stance has it, the back foot on its ball. */
export function plantedFeet(): Partial<Bones> {
  return { lfx: WU_REST.lfx, lfy: WU_REST.lfy, lfz: 0, lfp: 0, lft: WU_REST.lft, lk: WU_REST.lk, ...backFoot(), rk: -6 };
}
/** The first moment of the skip: both feet just off the floor (the front foot lifting, the back pushing up off its ball). */
function lightFeet(): Partial<Bones> {
  return { lfx: 10.6 + DF, lfz: 1.1, lfp: -6, lft: 3, lk: 4, rfx: -9 + DB, rfp: 20, rfz: onToes(20) + 1.3, rft: -40, rk: -24 };
}
/** Both feet off the floor for the skip-step the game's step carries him on (TUNE.swingStep in TUNE.swingStepTime). */
function skipFeet(): Partial<Bones> {
  return { lfx: 11 + DF, lfz: 1.3, lfp: -10, lft: 2, lk: 4, rfx: -9 + DB, rfp: 30, rfz: onToes(30) + 1.8, rft: -24, rk: -10 };
}
const hilt = (x: number, y: number, z: number): Partial<Bones> => ({ rhIn: 0, rhx: x, rhy: y, rhz: z });

// ---------------------------------------------------------------------------------------------
// STANDING

/**
 * HIS REAR STANCE, ALIVE (2 s, 60 pictures). He breathes twice; the weight goes over onto his front foot and back; the
 * point of the great sword stirs behind him as he breathes; and once in the round a habit of his: his chin comes up, his
 * eyes go to his right, and his hands roll on the grip. His feet never move.
 */
function rearAlive(): Motion {
  const R = WU_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.45, pose: { px: 0.6, py: 0.3, pz: R.pz - 1.4, bend: R.bend + 2.6, pitch: R.pitch + 0.8, wEl: R.wEl + 3, rhz: R.rhz + 0.6 } },
      { at: 0.95, pose: { px: 2.6, py: 1.6, pz: R.pz - 0.5, yaw: R.yaw + 3, twist: R.twist - 2.5, roll: 1.6, side: -1.6, bend: R.bend + 0.6, wEl: R.wEl - 1.5, wAz: R.wAz + 2 } },
      { at: 1.3, pose: { px: 1.8, py: 1.1, pz: R.pz - 1.5, bend: R.bend + 2.8, faceUp: R.faceUp + 6, faceTurn: R.faceTurn - 10, wRoll: 7, wEl: R.wEl + 3.5, wAz: R.wAz - 3 } },
      { at: 1.65, pose: { px: 0.5, py: 0.2, pz: R.pz - 0.7, faceUp: R.faceUp + 2, faceTurn: R.faceTurn - 4, wRoll: 3, bend: R.bend + 1 } },
      { at: 2.0, pose: {} },
    ],
    loop: 0,
  };
}
export const WU_REAR3: Move3 = { ...REAR3, name: 'Great sword: the rear stance, alive', rest: WU_REST, motion: rearAlive() };

/** IN TOWN, ALIVE (2.4 s, 72 pictures): two breaths, the weight settling onto his left leg and back, a roll of his shoulders, a look along the street. */
function townAlive(): Motion {
  const T = WU_TOWN_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.6, pose: { pz: T.pz - 0.6, bend: T.bend + 1.6, side: T.side + 0.6 } },
      { at: 1.2, pose: { py: T.py + 0.7, roll: T.roll - 1.4, side: T.side + 1.4, pz: T.pz - 0.2, faceTurn: T.faceTurn + 10, faceUp: T.faceUp + 1 } },
      { at: 1.5, pose: { py: T.py + 0.7, roll: T.roll - 1.4, side: T.side + 1.6, pz: T.pz - 0.5, bend: T.bend + 1.4, faceTurn: T.faceTurn + 14, shrug: 0.45 } },
      { at: 1.85, pose: { py: T.py + 0.35, roll: T.roll - 0.7, side: T.side + 0.8, faceTurn: T.faceTurn + 4, shrug: 0 } },
      { at: 2.4, pose: {} },
    ],
    loop: 0,
  };
}
export const WU_TOWN3: Move3 = { ...KNIGHT_TOWN3, name: 'The knight in town, alive', rest: WU_TOWN_REST, motion: townAlive() };

// ---------------------------------------------------------------------------------------------
// RUNNING: his own run, a heavy armoured man's (below, `wuHeavyRun`): a turn of it in 27 sixtieths of a second, its foot on the
// floor going back under him exactly as fast as the game carries him (4.6 tiles a second), as moves3.ts gripping's.

const RUN_PERIOD = 27 / 60;
/** THE RUN AS THE OWNER SAW IT (90de9707) AND SAID “why is he high stepping with his knees up?”: moves3.ts's run made to grip,
 * its foot set down 18 of 21 before him (after gripping, 25 of 29), carried 9.5 high (after gripping, 11): its swinging thigh came
 * up past level. Kept for the pictures and for the check that sees a prance (tests/warrior_up.test.ts 11). */
const RUN_REACH = 18;
export const WU_GAIT: Gait = {
  reach: 0, push: 0, kick: 0, lean: 13, hunch: 6, sink: 2.07, bob: 0.9, hips: 10, counter: -0.55, yaw: -16, twist: -10,
  // (his sword carried as his guard carries it, so that it is seen from every side: his hands up by his right breast, the blade
  // level behind him and out to his right, steadier than it was; it was hands 6.2, 3.5, -12.1, the blade -160 round and 31 down)
  arms: (swing, step) => ({ rhIn: 0, rhx: 3 + swing * 0.5, rhy: -3.5, rhz: -4, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: -127.5 + swing * 1.5, wEl: -0.5 + 1.5 * Math.cos(step * Math.PI * 2), le: 10, re: 6 }),
};
export const WU_TOWN_GAIT: Gait = {
  reach: 0, push: 0, kick: 0, lean: 10, hunch: 4, sink: 2.07, bob: 0.9, hips: 9, counter: 0.6, yaw: 0, twist: 0,
  arms: (swing) => {
    // (as moves3.ts looseArms: an empty hand swinging low under its shoulder, each forward as the other leg is)
    const L = B.upperArm + B.foreArm;
    const at = (k: number): readonly [number, number] => [L * (-0.19 + 0.54 * k), L * (-0.95 + 0.25 * k)];
    const r = at((1 + swing) / 2);
    const l = at((1 - swing) / 2);
    return { rhIn: 1, rhx: r[0], rhy: -1.8, rhz: r[1], re: 0, lhIn: 1, lhx: l[0], lhy: 1.8, lhz: l[1], le: 0 };
  },
};
/**
 * HOW HIS FEET GO IN HIS RUN, A HEAVY ARMOURED MAN'S (the owner, 7 Nov 2026, of the run before this: “all that time and you
 * screwed up his run.  why is he high stepping with his knees up?”). Driving and grounded: each foot comes down a little before
 * him heel first, rolls flat under him and goes back exactly as fast as the game carries him, and leaves the floor off its toes
 * well behind him, the leg straightened; then its heel tucks up behind him as it recovers, and it comes through LOW, close to the
 * floor, its knee lifting only a little, and reaches forward to be set down. Its thigh never more than about 40 degrees from
 * hanging straight down (art/warrior_up_review.ts WU_THIGH_MOST; tests/warrior_up.test.ts holds it).
 */
export interface HeavyFeet {
  /** How much of a turn each foot is on the floor. */
  stance: number;
  /** How far before his hips (the ankle, the foot flat) it comes down, heel first. */
  reach: number;
  /** How far through its time on the floor it is flat (from, to): after it the heel rises, until it leaves off its toes `off` up. */
  flat: readonly [number, number];
  off: number;
  /** How the heel rises after it (the power of the time since: 1 at an even pace; below 1 quickly at first). */
  rise?: number;
  /** How high the heel is tucked up behind him as it recovers (its lowest point off the floor), and when (how far through its
   * time off the floor it is highest). */
  tuck: number;
  tuckAt: number;
  /** How far through its time off the floor the foot is level again. */
  level?: number;
  /** How far its toes are up as it is set down, heel first (degrees; below 0). */
  land?: number;
  /** When in a foot's time on the floor he is lowest (0 as it comes down, 1 as it leaves; 0.5 by default, half way). */
  lowAt?: number;
  /** How high its lowest point is as it passes under him, and as it reaches forward to be set down. */
  clear: number;
}
export const WU_RUN_FEET: HeavyFeet = { stance: 0.37, reach: 10.72, flat: [0.02, 0.05], off: 45.4, rise: 0.52, tuck: 4.1, tuckAt: 0.18, level: 0.45, clear: 1.29, land: -2.34, lowAt: 0.47 };
/** The way of his body in the run (the moves3.ts Gait's, of which its feet are not used: they are `HeavyFeet`). */
export function wuHeavyRun(g: Gait, f: HeavyFeet = WU_RUN_FEET, more: Partial<Bones> = {}): Motion {
  const period = RUN_PERIOD;
  const n = Math.round(period * 60);
  const travel = GRIP_SPEED * UNITS_PER_TILE * f.stance * period;
  const S = f.stance;
  // (a foot pitched `deg` (heel up; toe up below 0): how far its ankle must move for the point it would stand on (its toe; its
  // heel) to be where that point of it is when it is flat: the foot's own shape, wherever it is)
  const shape = new Map<number, { dx: number; dz: number }>();
  const lifted = (deg: number): { dx: number; dz: number } => {
    const key = Math.round(deg * 100) / 100;
    let r = shape.get(key);
    if (!r) {
      const at = { ...WU_REST, lfx: 0, lfz: 0, lfp: 0 } as Posed;
      const flat = solve(B, at);
      const tip = solve(B, { ...at, lfp: key } as Posed);
      const a = key < 0 ? flat.heelL : flat.toeL;
      const b = key < 0 ? tip.heelL : tip.toeL;
      shape.set(key, (r = { dx: a[0] - b[0], dz: a[2] - b[2] }));
    }
    return r;
  };
  const LAND = f.land ?? -7;
  const [f0, f1] = f.flat;
  // (where its ankle is, relative to the hips, for a moment of the turn: the left foot comes down at the start)
  const foot = (phase: number): { x: number; z: number; pitch: number } => {
    const ph = ((phase % 1) + 1) % 1;
    if (ph < S) {
      // ON THE FLOOR: heel first, rolled flat, the heel rising as it goes back behind him; the point it stands on going back
      // exactly as fast as the game carries him
      const u = ph / S;
      const pitch = u < f0 ? LAND * (1 - smooth01(u / f0)) : u <= f1 ? 0 : f.off * ((u - f1) / (1 - f1)) ** (f.rise ?? 2);
      const k = lifted(pitch);
      return { x: f.reach - travel * u + k.dx, z: k.dz, pitch };
    }
    // OFF THE FLOOR: the heel tucked up behind as it recovers; through low under him; reaching forward to be set down heel first
    const v = (ph - S) / (1 - S);
    // (its toes hanging behind him as the heel tucks up; the foot level by the time it comes through under him, so that it can
    // pass low; its toes up as it is set down, heel first)
    const level = f.level ?? 0.5;
    const pitch = v < f.tuckAt ? f.off + (70 - f.off) * smooth01(v / f.tuckAt) : v < level ? 70 * (1 - smooth01((v - f.tuckAt) / (level - f.tuckAt))) : LAND * smooth01((v - level) / (1 - level));
    const leave = lifted(f.off);
    const land = lifted(LAND);
    const from = f.reach - travel + leave.dx;
    const to = f.reach + land.dx;
    const x = from + (to - from) * smooth01(v);
    // (its lowest point: up behind him, then low as it comes through, and down to the floor as it is set down)
    const tuck = f.tuck * Math.sin(Math.PI * Math.min(1, v / (2 * f.tuckAt))) ** 2;
    // (off the floor at once, and set down at once: a heavy footfall, never a foot dragged along the floor)
    const low = f.clear * Math.min(1, v / 0.012, (1 - v) / 0.012);
    const h = Math.max(v < 2 * f.tuckAt ? tuck : 0, low);
    return { x, z: h + lifted(pitch).dz, pitch };
  };
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const turn = Math.cos(ph * Math.PI * 2);
    const step = (ph * 2) % 1;
    const l = foot(ph);
    const r = foot(ph + 0.5);
    keys.push({
      at: ph * period,
      ease: 'lin',
      pose: {
        ...more,
        pz: -g.sink - g.bob * Math.cos((2 * ph - 2 * S * (f.lowAt ?? 0.5)) * Math.PI * 2),
        yaw: g.yaw - g.hips * turn, pitch: g.lean, roll: 2 * Math.cos((ph - S / 2) * Math.PI * 2),
        twist: g.twist + (1 + g.counter) * g.hips * turn, bend: g.hunch + 1.2 * Math.cos(ph * Math.PI * 4), side: 0,
        faceTurn: 0, faceUp: g.look ?? -2,
        lfx: l.x, lfy: -1.2, lfz: l.z, lfp: l.pitch, lft: 2, lk: 2,
        rfx: r.x, rfy: 1.2, rfz: r.z, rfp: r.pitch, rft: -2, rk: -2,
        ...g.arms(turn, step),
      },
    });
  }
  return { keys, loop: 0 };
}
function smooth01(k: number): number {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
}
export const WU_RUN_SEEN: Move3 = {
  name: 'The knight runs, as he saw it (high-stepping)', held: 'greatsword', build: B, rest: WU_REST, stride: GRIP_SPEED * RUN_PERIOD,
  motion: run(gripping({ ...WU_GAIT, reach: RUN_REACH, push: 21 - RUN_REACH, kick: 9.5, sink: 2.8, bob: 1.9 }, RUN_PERIOD), RUN_PERIOD),
};
export const WU_RUN3: Move3 = { name: 'The knight runs, great sword, gripping', held: 'greatsword', build: B, rest: WU_REST, motion: wuHeavyRun(WU_GAIT), stride: GRIP_SPEED * RUN_PERIOD };
export const WU_TOWN_RUN3: Move3 = { name: 'The knight runs in town, gripping', held: 'greatsword', build: B, rest: WU_TOWN_REST, motion: wuHeavyRun(WU_TOWN_GAIT, WU_RUN_FEET, { py: 0, stow: 1 }), stride: GRIP_SPEED * RUN_PERIOD };

/**
 * COMING TO A STAND OUT OF HIS RUN, from a moment of its turn (`phase`) into a stance (as moves3.ts settle: the foot off the floor
 * steps first, to where the stance has it, then the other if it must; the body half way into the stance as the first comes down),
 * a heavy man's: each foot carried LOW to its place (`lift` above the floor, where moves3.ts lifts it 3.2), so that no knee comes
 * up as he pulls up into his long guard.
 */
export function wuSettle(runMove: Move3, phase: number, to: Bones, long = 0.24, lift = WU_STEP_LIFT): Motion {
  const { keys, loop } = runMove.motion;
  const span = keys[keys.length - 1].at - (loop ?? 0);
  const p = bonesAt(keys, runMove.rest, (loop ?? 0) + span * (((phase % 1) + 1) % 1)) as Posed;
  const from: Partial<Bones> = { ...p };
  for (const k of ['from', 'to', 'mixK', 'lh2', 'rh2']) delete (from as Record<string, unknown>)[k];
  const leftFirst = p.lfz > p.rfz;
  const half = (a: number, b: number): number => (a + b) / 2;
  const foot = (left: boolean, where: 'run' | 'up' | 'stance'): Partial<Bones> => {
    if (where === 'run') return left ? { lfx: p.lfx, lfy: p.lfy, lfz: p.lfz, lfp: p.lfp, lft: p.lft } : { rfx: p.rfx, rfy: p.rfy, rfz: p.rfz, rfp: p.rfp, rft: p.rft };
    if (where === 'stance') return left ? { lfx: to.lfx, lfy: to.lfy, lfz: to.lfz, lfp: to.lfp, lft: to.lft } : { rfx: to.rfx, rfy: to.rfy, rfz: to.rfz, rfp: to.rfp, rft: to.rft };
    // (carried low, half way from where it was in the run to where it goes, its toe a little down)
    return left
      ? { lfx: half(p.lfx, to.lfx), lfy: half(p.lfy, to.lfy), lfz: lift, lfp: 6, lft: half(p.lft, to.lft) }
      : { rfx: half(p.rfx, to.rfx), rfy: half(p.rfy, to.rfy), rfz: lift, rfp: 6, rft: half(p.rft, to.rft) };
  };
  const second = !leftFirst;
  const far = Math.hypot((second ? p.lfx : p.rfx) - (second ? to.lfx : to.rfx), (second ? p.lfy : p.rfy) - (second ? to.lfy : to.rfy)) > 1.5;
  const mid: Partial<Bones> = {};
  for (const f of ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt'] as const) mid[f] = (p[f] + to[f]) / 2;
  // (as the first foot comes through, he draws himself up a little over it: his weight checked, his leg not folded under him)
  const up = { pz: Math.max(p.pz, to.pz) + WU_STEP_RISE };
  const steps: Key3[] = [
    { at: 0, pose: from },
    { at: long * 0.22, pose: { ...from, ...up, ...foot(leftFirst, 'up'), ...foot(second, 'run') }, ease: 'out' },
    { at: long * 0.45, pose: { ...mid, ...foot(leftFirst, 'stance'), ...foot(second, 'run') }, ease: 'io' },
  ];
  if (far) steps.push({ at: long * 0.7, pose: { pz: to.pz + WU_STEP_RISE, ...foot(leftFirst, 'stance'), ...foot(second, 'up') }, ease: 'io' });
  steps.push({ at: long, pose: {}, ease: 'io' });
  return { keys: steps };
}
/** How high a foot is carried as he steps into a stance out of his run, and how far he draws himself up over it. */
export const WU_STEP_LIFT = 1.4;
const WU_STEP_RISE = 1.5;

// ---------------------------------------------------------------------------------------------
// STRIKE: THE TWO SWINGS, BY MOVEMENT 9

/** Strike's blow, both swings: the rules' moment (with the switch on, TUNE strike.windup becomes this). */
export const WU_STRIKE_HIT = 10 * FR;
/** Where the first swing holds the sword up while the second may still come (the game's `poise`). */
export const WU_STRIKE_POISE = 21 * FR;
/** The held wind-up of each swing: from, to (frames). The strike is the two frames from its end to the blow. */
export const WU_STRIKE_HELD: readonly [number, number] = [6, 8];

/** The sword held up over his left shoulder after the first swing: where the second begins (moves3.ts strikeUp's). */
function swordUp(): Partial<Bones> {
  return { ...plantedFeet(), px: 3.4, pz: -5.8, yaw: 26, pitch: 7, twist: 22, bend: 6, faceUp: -2, faceTilt: 0, ...hilt(9.5, 11.5, 4.5), wAz: 122, wEl: 84 };
}
function swordHeld(): Partial<Bones> {
  return { ...swordUp(), pz: -6.2, bend: 7 };
}

/**
 * THE FIRST SWING, A RISING CUT. A skip-step in as the game's step carries him (both feet off the floor, 0 to 4); then the
 * WIND-UP: he sinks deep onto his back leg, hips and shoulders wound right round away, the blade drawn further back and down
 * behind him, his eyes on the mark (4 to 6); HELD (6 to 8: a breath, the blade trembling). THE STRIKE, two frames: the hips
 * whip round and the blade comes up through the front of him (9: low on his right, 10: the blow, level across his chest). The
 * WIND-DOWN, big: the blade runs on up over his left shoulder, all of him turned after it, sunk over his front foot (11 to 14);
 * it settles there, held up (to 21, `poise`: the second swing begins from here); then lowered round behind him over his right
 * shoulder and down into his guard (36).
 */
function strikeUp(): Motion {
  const P = plantedFeet();
  // (the coil: wound right round away from the mark, sunk on his back leg, the hilt drawn back past his hip and the blade swung
  // back and UP behind him, its point high over his right shoulder: a great backswing that reads from across the room)
  // (his back foot flat on the floor under his weight, its knee a little in, and his front knee less over its foot, so that
  // neither shin is seen end-on from any of his sides)
  const coil: Partial<Bones> = { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 10, rk: 14, px: -2.4, pz: -7.4, yaw: -62, pitch: 2, twist: -50, bend: 8, faceUp: 2, faceTurn: 6, rhIn: 2, rhx: -6.5, rhy: -12, rhz: 31.5, wAz: -166, wEl: 52.5 };
  const over: Partial<Bones> = { ...P, pz: -4.4, yaw: -12, pitch: 2, twist: -10, bend: 2, faceUp: -6, faceTilt: -10, ...hilt(4, -4, 10), wAz: 195, wEl: 62 };
  return {
    hit: WU_STRIKE_HIT,
    keys: [
      { at: 0, pose: {} },
      // (the skip-step: both feet off the floor at once while the game carries him; the coil begun)
      { at: 1 * FR, pose: { ...lightFeet(), px: -0.3, pz: -4.2, yaw: -44, twist: -34, bend: 7, wAz: -140, wEl: 4 }, ease: 'out' },
      { at: 2 * FR, pose: { ...skipFeet(), px: -0.8, pz: -4.8, yaw: -48, twist: -38, bend: 8, rhIn: 2, rhx: -4.5, rhy: -15, rhz: 33, wAz: -150, wEl: 18 }, ease: 'in' },
      // THE WIND-UP, reached and HELD
      { at: 6 * FR, pose: coil, ease: 'out' },
      { at: 8 * FR, pose: { ...coil, pz: -7.7, yaw: -63, twist: -52, bend: 8.6, wEl: 55.5, wAz: -164 }, ease: 'io' },
      // THE STRIKE: the hips round first, the chest still back, the hilt carried forward at the hip ...
      { at: 9 * FR, pose: { ...P, px: 2.0, pz: -6.2, yaw: -10, pitch: 7, twist: -50, bend: 11, faceUp: -2, rhIn: 2, rhx: 2.5, rhy: -11.5, rhz: 24.5, wAz: -156, wEl: -12 }, ease: 'in' },
      // ... and the blow, the blade level across the front of him, his weight driven onto his front foot
      { at: 10 * FR, pose: { ...P, px: 4.4, pz: -6.9, yaw: 30, pitch: 10, twist: 16, bend: 13, faceUp: -4, ...hilt(15.5, 7.5, -5), wAz: 8, wEl: 12 }, ease: 'lin' },
      // (the blow lands with a freeze: a tenth of a second all but held, as his rulebook's Movement 7 asks of a heavy blow)
      { at: 11 * FR, pose: { ...P, px: 4.6, pz: -7.1, yaw: 33, pitch: 10, twist: 21, bend: 13, faceUp: -4, ...hilt(15, 8.5, -3.5), wAz: 18, wEl: 20 }, ease: 'out' },
      // THE WIND-DOWN: on up over his left shoulder, all of him turned after it
      { at: 20 * FR, pose: swordUp(), ease: 'io' },
      { at: 21 * FR, pose: swordHeld(), ease: 'io' },
      // (no second swing: lowered round behind him over his right shoulder, and down into his guard: the blade the same way
      // round, a whole turn on from where the stance has it)
      { at: 28 * FR, pose: over, ease: 'io' },
      { at: 36 * FR, pose: { wAz: WU_REST.wAz + 360 }, ease: 'io' },
    ],
  };
}
export const WU_STRIKE3: Move3 = { ...STRIKE3, name: 'Strike, the rising cut (Movement 9)', rest: WU_REST, motion: strikeUp(), tail: true, poise: WU_STRIKE_POISE };

/**
 * THE SECOND SWING, THE DOWNWARD SLASH, from the sword held up. A skip-step in (0 to 4); the WIND-UP: the blade cocked further
 * over and back behind his left shoulder, his body wound after it, rising (4 to 6), HELD (6 to 8); THE STRIKE, two frames: down
 * the way it went up (9) and through the front of him at the height of a chest (10, the blow); the WIND-DOWN, big: on round and
 * down behind his right side, deeper than his guard (13 to 17), and up into his guard (27).
 */
function slashDown(): Motion {
  const P = plantedFeet();
  // (cocked: his hands up by the left of his head and a little before it, the blade laid back over his left shoulder, pointing
  // back and up: his hands where they are on the floor's own measure, so that they stay before his head as he winds)
  const H0 = solve(B, { ...WU_REST, ...swordHeld() } as Posed).handR;
  const held1: Partial<Bones> = { ...swordHeld(), ...lightFeet(), pz: -5.6, rhIn: 2, rhx: H0[0], rhy: H0[1], rhz: H0[2] };
  const cocked: Partial<Bones> = { ...swordUp(), ...P, px: 1.2, pz: -4.2, yaw: 30, pitch: 0, twist: 26, bend: -2, faceUp: -2, faceTurn: -4, faceTilt: 6, rhIn: 2, rhx: 7, rhy: 8, rhz: 53.5, wAz: 170.5, wEl: 57 };
  // (the freeze on the blow: where the wind-down begins)
  const FROZE: Partial<Bones> = { ...P, px: 4.4, pz: -7.0, yaw: 0, pitch: 9, twist: -10, bend: 13, faceUp: -4, ...hilt(15, 6, -6), wAz: -16, wEl: 4 };
  return {
    hit: WU_STRIKE_HIT,
    keys: [
      { at: 0, pose: swordHeld() },
      { at: 1 * FR, pose: held1, ease: 'out' },
      { at: 2 * FR, pose: { ...mixPose(held1, cocked, 0.2, WU_REST), ...skipFeet() }, ease: 'in' },
      // THE WIND-UP, reached and HELD
      { at: 6 * FR, pose: cocked, ease: 'out' },
      { at: 8 * FR, pose: { ...cocked, pz: -4.0, wAz: 172.5, wEl: 54, bend: -3, rhz: 54 }, ease: 'io' },
      // THE STRIKE
      { at: 9 * FR, pose: { ...swordUp(), ...P, px: 3, pz: -5.8, yaw: 16, twist: 20, bend: 8, ...hilt(9, 6, 4), wAz: 72, wEl: 57 }, ease: 'in' },
      { at: 10 * FR, pose: { ...P, px: 4.4, pz: -6.8, yaw: 4, pitch: 9, twist: -6, bend: 13, faceUp: -4, ...hilt(15, 7.5, -5), wAz: 8, wEl: 12 }, ease: 'lin' },
      // (the freeze on the blow)
      { at: 11 * FR, pose: FROZE, ease: 'out' },
      // THE WIND-DOWN: on round and down behind his right side, and up into his guard, slowly
      // (round behind him into his guard at an EVEN PACE, its point going as far each frame, gathering pace over the first three
      // frames and slowing over the last three: never near as fast as the strike, now that the blade comes round level at the
      // full length of it)
      ...evenly(FROZE, {}, 11 * FR, 27 * FR, 3 * FR, 3 * FR),
    ],
  };
}
export const WU_SLASH3: Move3 = { ...STRIKE3, name: 'Strike, the downward slash (Movement 9)', rest: WU_REST, motion: slashDown(), tail: true, poise: undefined };
delete (WU_SLASH3 as { poise?: number }).poise;

// ---------------------------------------------------------------------------------------------
// SLAM

export const WU_SLAM_HIT = 15 * FR;
export const WU_SLAM_HELD: readonly [number, number] = [11, 13];
/**
 * SLAM, BY MOVEMENT 9: everything he has, from overhead into the floor. The WIND-UP: the hilt comes up in front of him and on
 * over his head, and he rises right up onto his toes, back arched, the blade far back behind him, his chin down and his eyes
 * on the spot (0 to 10); HELD there (10 to 13). THE STRIKE, two frames: he tips forward off his toes, the front foot stamping a
 * stride on (14), and the blade comes over and buries its point in the floor ahead of him (15, the blow). The WIND-DOWN: the
 * weight of him goes on down after it (17); it is drawn out of the floor and round his right side, low (24), into his guard (34).
 */
function slamDown(): Motion {
  const up = onToes(30);
  const RAISED: Partial<Bones> = { pz: 0.6, yaw: -18, twist: -6, bend: -4, faceUp: -6, lfp: 14, lfz: onToes(14), rfp: 14, rfz: onToes(14), rfx: -9 + DB, rfy: -1.5, ...hilt(10, 3, 8), re: 58, wAz: -130, wEl: 66 };
  const top: Partial<Bones> = { pz: 2.8, yaw: -8, twist: -2, pitch: -4, bend: -12, faceUp: -6, lfp: 30, lfz: up, rfp: 30, rfz: up, rfx: -9 + DB, rfy: -1.5, ...hilt(14, 1, 19), wAz: 158.5, wEl: 67 };
  const low: Partial<Bones> = {
    px: 11, pz: -9.2, yaw: 6, pitch: 15, twist: 2, bend: 30, faceUp: -45,
    lfx: 23 + DF, lfy: 0.5, lfz: 0, lfp: 0, lft: 2, lk: 2, rfx: -9.5 + DB, rfy: -1, rfp: 38, rfz: onToes(38), rft: -10, rk: -4,
    rhIn: 2, rhx: 27, rhy: -1, rhz: 19.3, wAz: 180, wEl: 214,
  };
  return {
    hit: WU_SLAM_HIT,
    keys: [
      // (the hilt up before his face, the blade standing straight up, and on up over his head and back, up onto his toes: the
      // top. Laid on one smooth curve: his hands come up from his guard, out by his hip, the long way round)
      ...smoothKeys([{ at: 0, pose: { wAz: WU_REST.wAz + 360 } }, { at: 3 * FR, pose: { ...RAISED, wAz: 230 } }, { at: 11 * FR, pose: top }], WU_REST),
      { at: 13 * FR, pose: { ...top, pz: 3.1, pitch: -5, bend: -13.5, wEl: 63, faceUp: -10 }, ease: 'io' },
      // THE STRIKE: the hips first, tipping him forward off his toes, the chest still arched back ...
      { at: 14 * FR, pose: { ...top, px: 9.5, pz: 0.5, yaw: 4, pitch: 14, bend: -8, lfx: 16 + DF, lfz: 3.6, lfp: 6, rfp: 34, rfz: onToes(34), ...hilt(14.5, 3, 14), wEl: 148 }, ease: 'in' },
      { at: 15 * FR, pose: low, ease: 'lin' },
      // THE WIND-DOWN
      { at: 17 * FR, pose: { ...low, pz: -10.6, bend: 33 }, ease: 'out' },
      { at: 24 * FR, pose: { ...low, pz: -8.4, pitch: 12, bend: 24, faceUp: -36 }, ease: 'io', as: { wAz: 0, wEl: -34 } },
      // (and he steps back into his guard: the front foot lifted and brought home, then the back foot turned and set)
      { at: 29 * FR, pose: { px: 4, pz: -5, pitch: 8, bend: 12, faceUp: -12, lfx: 15 + DF, lfz: 1.9, lfp: 0, lft: 3, rfx: -9.5 + DB, rfy: -1, rfp: 38, rfz: onToes(38), rft: -10, rk: -4, rhIn: 2, rhx: 3, rhy: -13, rhz: 27, wAz: -105, wEl: -24 }, ease: 'in' },
      { at: 31 * FR, pose: { px: 1, pz: -4.6, pitch: 5, bend: 8, rfx: -9.5 + DB, rfy: -1, rfz: 2.2, rfp: 6, rft: -40, rk: -30, rhIn: 2, rhx: -5, rhy: -18, rhz: 30.5, wAz: -132, wEl: -8 }, ease: 'lin' },
      { at: 34 * FR, pose: {}, ease: 'out' },
    ],
  };
}
export const WU_SLAM3: Move3 = { name: 'Slam, great sword (Movement 9)', held: 'greatsword', build: B, rest: WU_REST, motion: slamDown(), at: 'the moment it lands' };

// ---------------------------------------------------------------------------------------------
// WHIRLWIND: lower, leaning harder out from the blade against its pull, the blade at full stretch; once round in 12 frames (it was
// 8: at 45 degrees a frame a point going round seemed, from some of his new sides, to turn straight back; at 30 it never does).

function whirlBig(): Motion {
  const keys: Key3[] = [];
  const N = 12;
  // (THE PIVOT: the ball of his left foot stays on one spot under him, his heel up, the foot turning on it; his right foot is
  // swung round off the floor, out behind him against the pull of the blade. Before, both feet were carried round in a ring
  // on the floor: they slid.)
  const PIVOT: [number, number] = [1.5, 2.2];
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const yaw = 20 + 360 * k;
    const blade = yaw + 14;
    const away = ((blade + 180) * Math.PI) / 180;
    const lean = 17;
    const a = ((yaw - 125) * Math.PI) / 180;
    const dip = Math.cos(k * Math.PI * 4);
    const pose: Partial<Bones> = {
      px: Math.cos(away) * 2, py: Math.sin(away) * 2, pz: -7 + dip * 0.6,
      yaw, twist: 8, pitch: lean * Math.cos(away), roll: -lean * Math.sin(away), bend: 0,
      faceTurn: yaw + 34, faceUp: -3,
      lfx: 0, lfy: 0, lfz: onToes(28), lfp: 28, lft: yaw + 30, lk: yaw + 35,
      rfx: Math.cos(a) * 10, rfy: Math.sin(a) * 10 + B.stance, rfz: 2.6, rfp: 10, rft: yaw - 40, rk: yaw - 40,
      rhIn: 0, rhx: 17.5, rhy: 6.3, rhz: -3.0, wAz: blade, wEl: -2, le: 0, re: 0,
    };
    // (the left foot put so that its ball is on the pivot: where it lands, worked out on the figure)
    const s0 = solve(B, { ...WU_REST, ...pose } as Posed);
    pose.lfx = PIVOT[0] - (s0.toeL[0] - (pose.lfx as number));
    pose.lfy = PIVOT[1] - (s0.toeL[1] - (pose.lfy as number));
    keys.push({ at: i * FR, ease: 'lin', pose });
  }
  return { keys, loop: 0 };
}
export const WU_WHIRL3: Move3 = { name: 'Whirlwind, great sword', held: 'greatsword', build: B, rest: WU_REST, motion: whirlBig() };

// ---------------------------------------------------------------------------------------------
// THE LUNGE (the diving thrust, his leap since 17 Oct): the dive as it was (the game carries him: its pictures by how far
// through he is); the landing made bigger: the point driven home deeper and HELD a beat, then a big wind-down round into his guard.

function thrustBig(): Motion {
  const keys = THRUST3.motion.keys.map((k) => ({ ...k, pose: { ...k.pose } }));
  const dive = keys.filter((k) => k.at <= 0.5 + 1e-9);
  const R = WU_REST;
  // (the first picture: the coil, but the blade still where his stance has it, trailing at his hip, so that nothing leaps as
  // the game begins the Lunge; it swings forward as he drives off)
  dive[0] = { ...dive[0], pose: { ...dive[0].pose, rhIn: 2, rhx: R.rhx, rhy: R.rhy, rhz: R.rhz, re: R.re, le: R.le, wAz: R.wAz, wEl: R.wEl } };
  // (he drives off at once: the back foot off the floor in the first frames, its leg not thrown straight; his sword elbow
  // swung out as the blade comes forward, so that it comes round beside him and not over the arm)
  dive[1] = { ...dive[1], at: 0.1, ease: 'in', pose: { ...dive[1].pose, rfz: onToes(60) + 4, rfx: R.rfx - 4, lfx: R.lfx - 3, rhx: 4, rhz: -10, re: -38, wAz: -80, wEl: -14 } };
  dive[0] = { ...dive[0], pose: { ...dive[0].pose, px: -1, pz: -7.5, pitch: 14, bend: 10 } };
  // (his feet where his guard has them, the back one up on its toes as before: he dives from his guard)
  dive[0] = { ...dive[0], pose: { ...dive[0].pose, lfx: R.lfx, lfy: R.lfy, lft: R.lft, rfx: R.rfx, rfy: R.rfy } };
  // (coming down, the point is drawn back: HELD back as his front foot reaches for the floor ...)
  const n = dive.length;
  dive[n - 2] = { ...dive[n - 2], ease: 'out', pose: { ...dive[n - 2].pose, rhx: 10.5, re: 22, le: 12 } };
  // (... and PUNCHED OUT as he lands: the blow)
  dive[n - 1] = { ...dive[n - 1], ease: 'in', pose: { ...dive[n - 1].pose, rhx: 21 } };
  // (his front foot landing a little further on, its knee less across him, so that its shin is not seen end-on from before him)
  dive[n - 1] = { ...dive[n - 1], pose: { ...dive[n - 1].pose, lfx: 19, lk: 5 } };
  const from = dive[n - 1].pose;
  const low: Partial<Bones> = { ...from, px: 9.5, pz: -12.6, pitch: 40, bend: 20, rhx: 21.5, rhz: -5.5, wEl: -7 };
  const back: Partial<Bones> = { ...from, px: 4, pz: -8.5, pitch: 20, bend: 12, twist: -24, yaw: -28, rhIn: 1, rhx: 3, rhy: -5, rhz: -15, re: 30, le: 14, wAz: -40, wEl: 8 };
  const lunge: Key3[] = [
    { at: 0.5 + 2 * FR, pose: low, ease: 'out' },
    { at: 0.5 + 6 * FR, pose: { ...low, pz: -12.2, bend: 19 }, ease: 'io' },
    // (the wind-down: drawn back, and his front foot lifted and brought home as he rises; the back foot follows)
    { at: 0.5 + 10 * FR, pose: { ...back, pz: -6, lfx: 13, lfz: 1.9, lfp: 0, rfx: (from.rfx as number), rfz: (from.rfz as number) }, ease: 'in' },
    { at: 0.5 + 12.5 * FR, pose: { ...back, px: 2, pz: -6, pitch: 10, bend: 9, lfx: R.lfx, lfy: R.lfy, lfz: 0, lfp: 0, lft: R.lft, rfx: R.rfx + 1.5, rfz: 2.6, rfp: 0, rft: -30, rhIn: 2, rhx: 1, rhy: -9, rhz: 20, wAz: -105, wEl: 4 }, ease: 'lin' },
    { at: 0.5 + 15 * FR, pose: {}, ease: 'out' },
  ];
  // (and all of it laid on one smooth curve through these keys, so that nothing of him leaps or stalls from any of his sides)
  const once = smoothKeys([...dive, ...lunge], WU_REST);
  // (his back toe kept where it stands for the first picture, the heel rising off it, before the foot leaves the floor)
  const d0 = { ...WU_REST, ...dive[0].pose } as Bones;
  const rolled: Key3 = { at: FR, pose: { ...bonesAt(once, WU_REST, FR), rfx: d0.rfx + 0.4, rfy: d0.rfy, rft: d0.rft, rfp: 38, rfz: onToes(38) } };
  return { keys: smoothKeys([dive[0], rolled, ...dive.slice(1), ...lunge], WU_REST), hit: 0.5 };
}
export const WU_THRUST3: Move3 = { ...THRUST3, rest: WU_REST, motion: thrustBig() };

/**
 * A MOVE LAID ON ONE SMOOTH CURVE THROUGH ITS KEYS (a monotone cubic through each number, eased in at its start and out at
 * its end: never overshooting a key, never drifting where a number holds still, so a foot set down stays down), sampled at
 * 60 a second. His sword hand is measured from his shoulder at every key (one measure for all), so that it too goes on one
 * curve and its reach goes smoothly from key to key.
 */
function smoothKeys(keys: readonly Key3[], rest: Bones, step = 1 / 60): Key3[] {
  /* the numbers of a pose that go smoothly from key to key (skeleton.ts SMOOTH3's) */
  const SMOOTH_FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk', 'lkUp', 'rkUp', 'wAz', 'wEl', 'wRoll', 'draw', 'out', 'gale', 'pt', 'pAz', 'pEl'] as const;
  const P = keys.map((k) => {
    const q = { ...rest, ...k.pose } as Bones;
    const sk = solve(B, q as Posed);
    const h = [sk.handR[0] - sk.shoulderR[0], sk.handR[1] - sk.shoulderR[1], sk.handR[2] - sk.shoulderR[2]];
    return { ...q, rhIn: 1 as const, rhx: h[0], rhy: h[1], rhz: h[2] } as Bones & Record<string, number>;
  });
  const T = keys.map((k) => k.at);
  const n = P.length;
  const tan: Record<string, number[]> = {};
  for (const f of SMOOTH_FIELDS) {
    const y = P.map((p) => (p[f] as number) ?? 0);
    const d = Array.from({ length: n - 1 }, (_, i) => (y[i + 1] - y[i]) / Math.max(1e-9, T[i + 1] - T[i]));
    const m = y.map((_, i) => (i === 0 || i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(d[i]) < 1e-9) {
        m[i] = 0;
        m[i + 1] = 0;
        continue;
      }
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const r = a * a + b * b;
      if (r > 9) {
        const tau = 3 / Math.sqrt(r);
        m[i] = tau * a * d[i];
        m[i + 1] = tau * b * d[i];
      }
    }
    tan[f] = m;
  }
  const out: Key3[] = [];
  const end = T[n - 1];
  const N = Math.round((end - T[0]) / step);
  for (let j = 0; j <= N; j++) {
    const t = Math.min(end, T[0] + j * step);
    let i = 0;
    while (i < n - 2 && t > T[i + 1]) i++;
    const h = T[i + 1] - T[i];
    const u = h > 0 ? (t - T[i]) / h : 0;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    const pose: Record<string, number> = { rhIn: 1, lhIn: P[i].lhIn, stow: P[i].stow };
    for (const f of SMOOTH_FIELDS) {
      const y0 = (P[i][f] as number) ?? 0;
      const y1 = (P[i + 1][f] as number) ?? 0;
      pose[f] = h00 * y0 + h10 * h * tan[f][i] + h01 * y1 + h11 * h * tan[f][i + 1];
    }
    out.push({ at: t, pose: pose as Partial<Bones>, ease: 'lin' });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// STRUCK (7 frames, as before): rocked harder, his head snapping after his chest, a foot going back lifted to catch him.

function reelBig(from: Bones): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { px: from.px - 4.5, pz: from.pz - 1.2, pitch: from.pitch - 9, bend: from.bend - 20, faceUp: -12, rfx: from.rfx - 4, rfz: 3.0, rfp: 0 }, ease: 'out' },
      { at: 4 * FR, pose: { px: from.px - 5, pz: from.pz - 2.6, pitch: from.pitch - 5, bend: from.bend - 9, faceUp: 16, rfx: from.rfx - 5, rfz: 2.2, rfp: -4 }, ease: 'io' },
      { at: 7 * FR, pose: {}, ease: 'io' },
    ],
  };
}
function lurchBig(from: Bones): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 3 * FR, pose: { px: from.px + 5, pz: from.pz - 0.6, pitch: from.pitch + 10, bend: from.bend + 18, faceUp: 11, lfx: from.lfx + 3.5, lfz: 1.3, lfp: -6, rhx: from.rhx + 5 } },
      { at: 4.5 * FR, pose: { px: from.px + 6, pz: from.pz - 1.6, pitch: from.pitch + 7, bend: from.bend + 11, faceUp: -14, lfx: from.lfx + 4, lfz: 1.1, lfp: -6, rhx: from.rhx + 6 }, ease: 'io' },
      { at: 7 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const WU_REEL3: Move3 = { name: 'The knight is struck hard', held: 'greatsword', build: B, rest: WU_REST, motion: reelBig(WU_REST) };
export const WU_LURCH3: Move3 = { name: 'The knight is struck from behind', held: 'greatsword', build: B, rest: WU_REST, motion: lurchBig(WU_REST) };

// ---------------------------------------------------------------------------------------------
// HIS FALL (46 frames, as before): A HERO'S, NOT A COLLAPSE. Not to his knees and then forward on his face: the blow throws him
// back and he gives ground two steps, each foot lifted and set down; the great sword comes round and he drives it point down into
// the floor before him and holds himself up on it, head up; his knees go and he comes down on one of them, hard, behind the
// sword; ONCE MORE HE PUSHES UP on the hilt, half rising, his head lifting to whatever killed him; it fails, he sinks back onto
// his knee, and his head bows over his hands on the hilt as the light goes out of the blade. He is left kneeling behind his
// sword, upright: he does not lie down.

function fallProud(): Motion {
  // (where his left foot is set down by his second step, and stays: before him as he kneels)
  const FOOT = [-1.5, 0.5] as const;
  const planted: Partial<Bones> = { rhIn: 2, rhx: 4.5, rhy: -1, rhz: GREAT_BLADE + 1.2, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: 0, wEl: -90, wRoll: 0 };
  // (each foot stays where it is set down: the left where his second step puts it, the right where his first does, until it
  // is swung back to kneel on)
  const stood: Partial<Bones> = { px: -7, pz: -1.8, yaw: -8, pitch: 7, twist: 0, bend: 9, lfx: FOOT[0], lfy: FOOT[1], lft: 8, lk: 6, lfz: 0, lfp: 0, rfx: -13, rfy: 0, rft: -24, rk: -14, rfz: 0, rfp: 0, ...planted };
  const down: Partial<Bones> = {
    px: -13.5, pz: -16.8, yaw: -6, pitch: 5, twist: 0, bend: 15,
    lfx: FOOT[0], lfy: FOOT[1], lfz: 0, lfp: 0, lft: 8, lk: 6, rfx: -18, rfy: 0.5, rfz: onToes(40), rfp: 40, rft: -6, rk: -4,
    ...planted,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      // thrown back: the chest first, the head after it; the back foot lifted to catch him
      { at: 2 * FR, pose: { px: -3.8, pz: -3.6, pitch: -8, bend: -16, faceUp: -10, rfx: -12, rfz: 3.0, rfp: 0, rft: -40, rhIn: 2, rhx: -4, rhy: -15.5, rhz: 33.5, wAz: -122, wEl: -18 }, ease: 'out' },
      // the first step back (the back foot down), the front foot lifted to follow; the sword swung round low
      { at: 6 * FR, pose: { px: -5.5, pz: -2.8, yaw: -20, pitch: -3, twist: -4, bend: -3, faceUp: 8, rfx: -13, rfz: 0, rfp: 0, rft: -24, rk: -14, lfx: 4, lfz: 2.4, lfp: -6, rhIn: 0, rhx: 8, rhy: 3, rhz: -12, re: -20, wAz: -90, wEl: -60 }, ease: 'io' },
      // the second: the front foot down under him; the point driven into the floor before him, both hands on the hilt
      { at: 11 * FR, pose: { ...stood, pz: -1.4, faceUp: 6, lfz: 0 }, ease: 'io' },
      { at: 15 * FR, pose: { ...stood, pz: -2.4, bend: 11, faceUp: 2, faceTurn: -10, out: 0.1 }, ease: 'io' },
      // his knees go: slowly, his right foot swung back off the floor, and then all at once, down hard on his right knee
      { at: 17 * FR, pose: { ...stood, px: -9.5, pz: -7.5, bend: 12, faceUp: 0, faceTurn: -16, rfx: -17, rfy: 0.3, rfz: 4.2, rfp: 12, rft: -12, rk: -8, out: 0.16 }, ease: 'in' },
      { at: 19 * FR, pose: { ...down, px: -12, pz: -15.6, bend: 13, faceUp: -2, faceTurn: -24, out: 0.25 }, ease: 'lin' },
      { at: 21 * FR, pose: { ...down, pz: -17.4, bend: 18, faceUp: -8, faceTurn: -26, out: 0.3 }, ease: 'out' },
      // ONCE MORE: he pushes up on the hilt, half rising off his knee, his head coming up
      { at: 28 * FR, pose: { ...down, px: -12.5, pz: -12.2, pitch: 2, bend: 6, faceUp: 10, faceTurn: -8, out: 0.35 }, ease: 'io' },
      { at: 31 * FR, pose: { ...down, px: -12.6, pz: -12.0, pitch: 2, bend: 5, faceUp: 12, faceTurn: -6, out: 0.4 }, ease: 'io' },
      // it fails: he sinks back onto his knee, his head bowed over his hands; the light goes out of the blade
      { at: 37 * FR, pose: { ...down, bend: 16, faceUp: -16, faceTurn: -24, out: 0.7 }, ease: 'in' },
      { at: 46 * FR, pose: { ...down, bend: 17, faceUp: -24, faceTurn: -24, out: 1 }, ease: 'out' },
    ],
  };
}
export const WU_FALL3: Move3 = { name: "The knight's fall", held: 'greatsword', build: B, rest: WU_REST, motion: fallProud() };

// ---------------------------------------------------------------------------------------------
// HIS CARD'S AND TOWN'S: drawing the sword (his class card, when he is picked) and looking about him, as before (their keys
// already eased), painted at 30 a second; the stance he draws into is his rear stance, alive.

/** A pose half way (`k`) between two keys' poses, every number of it (for a key between two others). */
function mixPose(a: Partial<Bones>, b: Partial<Bones>, k: number, rest: Bones): Partial<Bones> {
  const q = bonesAt([{ at: 0, pose: a }, { at: 1, pose: b, ease: 'lin' }], rest, k) as Posed & Record<string, unknown>;
  const out: Record<string, unknown> = { ...q };
  for (const f of ['from', 'to', 'mixK', 'lh2', 'rh2']) delete out[f];
  return out as Partial<Bones>;
}
/** A pose `k` of the way from one key's pose to another's, every number of it, his sword hand on the floor's own measure (so that
 * two keys that hold it in different ways are mixed where it truly is), its elbow and the blade's way between theirs. */
function alongHands(a: Partial<Bones>, b: Partial<Bones>, k: number, rest: Bones = WU_REST): Partial<Bones> {
  const qa = { ...rest, ...a } as Bones;
  const qb = { ...rest, ...b } as Bones;
  const ha = solve(B, qa as Posed).handR;
  const hb = solve(B, qb as Posed).handR;
  const mix = mixPose({ ...a, rhIn: 2, rhx: ha[0], rhy: ha[1], rhz: ha[2] }, { ...b, rhIn: 2, rhx: hb[0], rhy: hb[1], rhz: hb[2] }, k, rest);
  return { ...mix, re: qa.re + (qb.re - qa.re) * k, wAz: qa.wAz + (qb.wAz - qa.wAz) * k, wEl: qa.wEl + (qb.wEl - qa.wEl) * k };
}
/**
 * The keys from one pose to another at an EVEN PACE OF THE POINT of his sword (the way between them as `alongHands` has it),
 * gathering pace over its first `easeIn` seconds and slowing over its last `easeOut`: for a swing that must never be near as
 * fast as the strike before it. A key at every thirtieth of a second, from `t0` (not given: the key before) to `t1`.
 */
function evenly(a: Partial<Bones>, b: Partial<Bones>, t0: number, t1: number, easeIn: number, easeOut = easeIn): Key3[] {
  const N = 48;
  const tip = (u: number): readonly number[] => {
    const q = { ...WU_REST, ...alongHands(a, b, u) } as Posed;
    const s = solve(B, q);
    return [s.handR[0] + s.point[0] * GREAT_BLADE, s.handR[1] + s.point[1] * GREAT_BLADE, s.handR[2] + s.point[2] * GREAT_BLADE];
  };
  // (how far the point has gone, at each of N steps of the way)
  const far = [0];
  let p = tip(0);
  for (let i = 1; i <= N; i++) {
    const n = tip(i / N);
    far.push(far[i - 1] + Math.hypot(n[0] - p[0], n[1] - p[1], n[2] - p[2]));
    p = n;
  }
  const total = far[N];
  // (how far it should have gone by `t`: a pace rising evenly over `easeIn`, held, and falling evenly over the last `easeOut`)
  const T = t1 - t0;
  const v = 1 / (T - (easeIn + easeOut) / 2);
  const gone = (t: number): number =>
    t < easeIn ? (v * t * t) / (2 * easeIn) : t > T - easeOut ? 1 - (v * (T - t) ** 2) / (2 * easeOut) : v * (t - easeIn / 2);
  const keys: Key3[] = [];
  const n = Math.round(T / FR);
  for (let j = 1; j <= n; j++) {
    const want = gone(j * FR) * total;
    let i = 0;
    while (i < N - 1 && far[i + 1] < want) i++;
    const u = (i + (want - far[i]) / Math.max(1e-9, far[i + 1] - far[i])) / N;
    keys.push({ at: t0 + j * FR, pose: j === n ? b : alongHands(a, b, Math.min(1, u)), ease: 'lin' });
  }
  return keys;
}
/**
 * His right hand on the hilt where it lies on his back (art/warrior_up.ts wuBackPlace: point up), the sword lying in it just as it
 * lies there (as art/carried.ts holdOnBack, for his own place): for the key at which he takes hold of it. `body`: how his chest is
 * turned at that key.
 */
function holdOnHisBack(body: Pick<Bones, 'yaw' | 'pitch' | 'roll' | 'twist' | 'bend' | 'side'>): Partial<Bones> {
  const p = wuBackPlace(B);
  const chest = chestOf(body);
  return { rhIn: 0, rhx: p.at[0], rhy: p.at[1] + B.shoulderHalf, rhz: p.at[2] + B.shoulderDrop, ...aimFor(along(chest, p.point), along(chest, p.across)) };
}
/**
 * DRAWING HIS SWORD (his class card, when he is picked), from where it now lies on his back, point up: his arms unfold and his
 * right hand goes back to the hilt at the small of his back (6 to 11); he swings it out round his right side, the blade still
 * standing up (15), and up into his high guard, both hands on the hilt at his right shoulder (20 to 24), the blade over him
 * all the way; then down behind him into his guard as before, his feet mended (each moves only lifted: his right foot steps
 * back as the blade comes round; his left steps out into his guard), and his guard, alive, to 41 frames (all the card shows: to
 * the guard and 0.3 s held).
 */
function drawMended(): Motion {
  const T = WU_TOWN_REST;
  const k = KNIGHT_DRAW3.motion.keys;
  const townLeft: Partial<Bones> = { lfx: T.lfx, lfy: T.lfy, lfz: 0, lfp: 0, lft: T.lft, lk: T.lk };
  // (his chest turned a little to his right as the hand goes back; his left hand let fall to his side)
  const turned = { yaw: -16, pitch: 2, roll: 0, twist: -12, bend: 2, side: -3 };
  const hanging: Partial<Bones> = { lhIn: 0, lhx: 3, lhy: 3, lhz: -20.5, le: -8 };
  const face: Partial<Bones> = { faceTurn: -6, faceUp: 2 };
  // (on its way back: his hand out by his right hip, his elbow out and back)
  const reach: Partial<Bones> = { ...turned, ...face, pz: -1, ...hanging, rhIn: 0, rhx: -1.5, rhy: -4.5, rhz: -15 };
  reach.re = elbowFor(B, { ...T, ...reach } as Posed, false, [-0.6, -0.8, 0]);
  // (his hand on the hilt where it lies on his back)
  const taken: Partial<Bones> = { ...turned, ...face, pz: -1.4, ...hanging, ...holdOnHisBack({ ...T, ...turned }) };
  taken.re = elbowFor(B, { ...T, ...taken } as Posed, false, [-0.5, -0.85, 0.1], reach.re as number);
  // (half way: his hand gathering pace toward the hilt)
  const half = { at: 8.5 * FR, ease: 'in' as const, pose: { ...mixPose(reach, taken, 0.5, T), re: ((reach.re as number) + (taken.re as number)) / 2 } };
  // (swung out round his right side, the hilt at his hip and the blade still standing up beside him, going back; his right foot
  // lifted to step back into his guard)
  const R = WU_REST;
  const lifted: Partial<Bones> = {
    yaw: -24, pitch: 2, roll: 0, twist: -16, bend: 2, side: -2, ...face, pz: -1.8, px: -0.5,
    rfz: 2.8, rfp: 0, rfx: (T.rfx + R.rfx) / 2, rfy: (T.rfy + R.rfy) / 2, rft: -36, rk: -26,
    ...hanging, lhx: 7, lhy: 0, lhz: -15, rhIn: 0, rhx: 5, rhy: -7, rhz: -8, wAz: -140, wEl: 70, wRoll: 0,
  };
  lifted.re = elbowFor(B, { ...T, ...lifted } as Posed, false, [-0.3, -0.8, -0.5], taken.re as number);
  // (his left hand comes to the hilt gathering pace, from where it hung)
  const high = { ...k[4], ease: 'io' as const, pose: { ...k[4].pose, ...townLeft } };
  const high2 = { ...k[5], pose: { ...k[5].pose, ...townLeft } };
  // (his right foot set down where his guard has it, and his guard's feet: his legs made true)
  const backSet = { rfx: R.rfx, rfy: R.rfy, rft: R.rft, rk: R.rk };
  const high3 = { ...high, pose: { ...high.pose, ...backSet } };
  const high4 = { ...high2, pose: { ...high2.pose, ...backSet } };
  // (into his guard: his sword where his guard has it now, the blade the same way round as it comes down behind him)
  const guard = { ...k[6], pose: { ...k[6].pose, ...guardSword(), lfx: R.lfx, lfy: R.lfy, lft: R.lft, lk: R.lk, ...backSet }, as: { wAz: R.wAz } };
  const step = { at: 27.5 * FR, ease: 'io' as const, pose: { ...mixPose({ ...high4.pose }, { ...guard.pose, wAz: R.wAz + 360 }, 0.5, T), lfz: 1.3, lfp: -6 } };
  return {
    keys: [k[0], { at: 6 * FR, pose: reach, ease: 'io' }, half, { at: 11 * FR, pose: { ...taken, stow: 0 }, ease: 'out' }, { at: 15 * FR, pose: { ...lifted, stow: 0 }, ease: 'in' }, high3, high4, step, guard, { at: 36 * FR, pose: { ...R, pz: R.pz - 0.8, bend: R.bend + 1.5, wEl: R.wEl + 2, rhz: R.rhz + 0.3 }, ease: 'io' }, { at: 41 * FR, pose: { ...R }, ease: 'io' }],
  };
}
export const WU_DRAW3: Move3 = { ...KNIGHT_DRAW3, name: 'The knight draws his sword', rest: WU_TOWN_REST, motion: drawMended() };
export const WU_LOOK3: Move3 = { ...KNIGHT_LOOKS3, name: 'The knight looks about him', rest: WU_TOWN_REST };

/** The game's step on each swing of Strike, in his own lengths, by `t` seconds (TUNE.swingStep over TUNE.swingStepTime). */
export function swingCarried(t: number): number {
  return TUNE.swingStep * UNITS_PER_TILE * Math.min(1, Math.max(0, t / TUNE.swingStepTime));
}

/** Every move of his, by the short names the game knows him by (moves3.ts MOVES3's), made new. */
export const WU_MOVES: Record<string, Move3> = {
  rear: WU_REAR3, krun: WU_RUN3, strike: WU_STRIKE3, kslash: WU_SLASH3, slam: WU_SLAM3, whirl: WU_WHIRL3, kthrust: WU_THRUST3,
  kreel: WU_REEL3, klurch: WU_LURCH3, kfall: WU_FALL3, ktown: WU_TOWN3, ktownrun: WU_TOWN_RUN3, klook: WU_LOOK3, kdraw: WU_DRAW3,
};
