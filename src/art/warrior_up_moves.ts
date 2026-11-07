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
import { bonesAt, solve } from './skeleton';
import type { Bones, Key3, Motion, Posed } from './skeleton';

const FR = 1 / 30;
const B = KNIGHT_BODY;
/** His rear stance and his town stance, as moves3.ts has them. */
export const WU_REST: Bones = REAR3.rest;
export const WU_TOWN_REST: Bones = KNIGHT_TOWN3.rest;

/** A foot standing on its toes: the heel up by `deg`, the ball still on the floor (the ankle is that much higher). As moves3.ts. */
function onToes(deg: number): number {
  const a = (deg * Math.PI) / 180;
  return BODY.ball * Math.sin(a) + B.ankle * Math.cos(a) - B.ankle;
}
/** Where the back foot stands from a blow on (as moves3.ts backFoot): its ball where the stance has it, turned -8, on its toes 36. */
function backFoot(): Partial<Bones> {
  const a36 = (36 * Math.PI) / 180;
  const t8 = (-8 * Math.PI) / 180;
  const ballX = -5.5;
  const ballY = -10.9;
  const ankX = ballX - B.ball * Math.cos(a36) * Math.cos(t8);
  const ankY = ballY - B.ball * Math.cos(a36) * Math.sin(t8);
  return { rfx: ankX, rfy: ankY + B.stance, rfp: 36, rfz: onToes(36), rft: -8 };
}
/** His feet planted for a blow: the front foot flat where the stance has it, the back foot on its ball. */
export function plantedFeet(): Partial<Bones> {
  return { lfx: 10.5, lfy: 0.5, lfz: 0, lfp: 0, lft: 2, lk: 2, ...backFoot(), rk: -6 };
}
/** The first moment of the skip: both feet just off the floor (the front foot lifting, the back pushing up off its ball). */
function lightFeet(): Partial<Bones> {
  return { lfx: 10.6, lfz: 1.6, lfp: -6, lft: 3, lk: 4, rfx: -9, rfp: 20, rfz: onToes(20) + 1.3, rft: -40, rk: -24 };
}
/** Both feet off the floor for the skip-step the game's step carries him on (TUNE.swingStep in TUNE.swingStepTime). */
function skipFeet(): Partial<Bones> {
  return { lfx: 11, lfz: 2.6, lfp: -10, lft: 2, lk: 4, rfx: -9, rfp: 30, rfz: onToes(30) + 1.8, rft: -24, rk: -10 };
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
export const WU_REAR3: Move3 = { ...REAR3, name: 'Great sword: the rear stance, alive', motion: rearAlive() };

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
export const WU_TOWN3: Move3 = { ...KNIGHT_TOWN3, name: 'The knight in town, alive', motion: townAlive() };

// ---------------------------------------------------------------------------------------------
// RUNNING: his own run, made to grip (moves3.ts gripping): a turn of it in 27 sixtieths of a second, its foot on the floor going
// back under him exactly as fast as the game carries him (4.6 tiles a second). Driving, heavier and lower than before.

const RUN_PERIOD = 27 / 60;
const GAIT: Gait = {
  reach: 9, push: 12, kick: 9.5, lean: 13, hunch: 6, sink: 2.8, bob: 1.9, hips: 10, counter: -0.55, yaw: -16, twist: -10,
  arms: (swing, step) => ({ rhIn: 0, rhx: 6.2 + swing * 1.4, rhy: 3.5, rhz: -12.1, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: -160 + swing * 6, wEl: -31 + 6 * Math.cos(step * Math.PI * 2), le: 10, re: 6 }),
};
const TOWN_GAIT: Gait = {
  reach: 9, push: 12, kick: 8.5, lean: 10, hunch: 4, sink: 2.4, bob: 1.7, hips: 9, counter: 0.6, yaw: 0, twist: 0,
  arms: (swing) => {
    // (as moves3.ts looseArms: an empty hand swinging low under its shoulder, each forward as the other leg is)
    const L = B.upperArm + B.foreArm;
    const at = (k: number): readonly [number, number] => [L * (-0.19 + 0.54 * k), L * (-0.95 + 0.25 * k)];
    const r = at((1 + swing) / 2);
    const l = at((1 - swing) / 2);
    return { rhIn: 1, rhx: r[0], rhy: -1.8, rhz: r[1], re: 0, lhIn: 1, lhx: l[0], lhy: 1.8, lhz: l[1], le: 0 };
  },
};
function gripRun(g: Gait, more: Partial<Bones> = {}): Motion {
  const m = run(gripping(g, RUN_PERIOD), RUN_PERIOD);
  if (!Object.keys(more).length) return m;
  return { ...m, keys: m.keys.map((k) => ({ ...k, pose: { ...more, ...k.pose } })) };
}
export const WU_RUN3: Move3 = { name: 'The knight runs, great sword, gripping', held: 'greatsword', build: B, rest: WU_REST, motion: gripRun(GAIT), stride: GRIP_SPEED * RUN_PERIOD };
export const WU_TOWN_RUN3: Move3 = { name: 'The knight runs in town, gripping', held: 'greatsword', build: B, rest: WU_TOWN_REST, motion: gripRun(TOWN_GAIT, { py: 0, stow: 1 }), stride: GRIP_SPEED * RUN_PERIOD };

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
  const coil: Partial<Bones> = { ...P, px: -2.4, pz: -7.4, yaw: -62, pitch: 2, twist: -50, bend: 8, faceUp: 2, faceTurn: 6, rhIn: 2, rhx: -7, rhy: -10.5, rhz: 28, wAz: -148, wEl: 38 };
  const over: Partial<Bones> = { ...P, pz: -4.4, yaw: -12, pitch: 2, twist: -10, bend: 2, faceUp: -6, faceTilt: -10, ...hilt(4, -4, 10), wAz: 195, wEl: 62 };
  return {
    hit: WU_STRIKE_HIT,
    keys: [
      { at: 0, pose: {} },
      // (the skip-step: both feet off the floor at once while the game carries him; the coil begun)
      { at: 1 * FR, pose: { ...lightFeet(), px: -0.3, pz: -4.2, yaw: -44, twist: -34, bend: 7, wAz: -162, wEl: -28 }, ease: 'out' },
      { at: 2 * FR, pose: { ...skipFeet(), px: -0.8, pz: -4.8, yaw: -48, twist: -38, bend: 8, rhIn: 2, rhx: -4, rhy: -11.5, rhz: 25, wAz: -160, wEl: -10 }, ease: 'in' },
      // THE WIND-UP, reached and HELD
      { at: 6 * FR, pose: coil, ease: 'out' },
      { at: 8 * FR, pose: { ...coil, pz: -7.7, yaw: -63, twist: -52, bend: 8.6, wEl: 41, wAz: -146 }, ease: 'io' },
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
      // round, 198 being where the stance has it, -162)
      { at: 28 * FR, pose: over, ease: 'io' },
      { at: 36 * FR, pose: { wAz: 198 }, ease: 'io' },
    ],
  };
}
export const WU_STRIKE3: Move3 = { ...STRIKE3, name: 'Strike, the rising cut (Movement 9)', motion: strikeUp(), tail: true, poise: WU_STRIKE_POISE };

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
  const cocked: Partial<Bones> = { ...swordUp(), ...P, px: 1.2, pz: -4.2, yaw: 30, pitch: 0, twist: 26, bend: -2, faceUp: -2, faceTurn: -4, faceTilt: 6, rhIn: 2, rhx: 4, rhy: 8.5, rhz: 50.5, wAz: 158, wEl: 42 };
  return {
    hit: WU_STRIKE_HIT,
    keys: [
      { at: 0, pose: swordHeld() },
      { at: 1 * FR, pose: held1, ease: 'out' },
      { at: 2 * FR, pose: { ...mixPose(held1, cocked, 0.2, WU_REST), ...skipFeet() }, ease: 'in' },
      // THE WIND-UP, reached and HELD
      { at: 6 * FR, pose: cocked, ease: 'out' },
      { at: 8 * FR, pose: { ...cocked, pz: -4.0, wAz: 160, wEl: 39, bend: -3, rhz: 51 }, ease: 'io' },
      // THE STRIKE
      { at: 9 * FR, pose: { ...swordUp(), ...P, px: 3, pz: -5.8, yaw: 16, twist: 20, bend: 8, ...hilt(9, 6, 4), wAz: 93, wEl: 70 }, ease: 'in' },
      { at: 10 * FR, pose: { ...P, px: 4.4, pz: -6.8, yaw: 4, pitch: 9, twist: -6, bend: 13, faceUp: -4, ...hilt(15, 7.5, -5), wAz: 8, wEl: 12 }, ease: 'lin' },
      // (the freeze on the blow)
      { at: 11 * FR, pose: { ...P, px: 4.4, pz: -7.0, yaw: 0, pitch: 9, twist: -10, bend: 13, faceUp: -4, ...hilt(15, 6, -6), wAz: -6, wEl: 6 }, ease: 'out' },
      // THE WIND-DOWN: on round and down behind his right side, and up into his guard, slowly
      { at: 27 * FR, pose: {}, ease: 'io' },
    ],
  };
}
export const WU_SLASH3: Move3 = { ...STRIKE3, name: 'Strike, the downward slash (Movement 9)', motion: slashDown(), tail: true, poise: undefined };
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
  const top: Partial<Bones> = { pz: 2.8, yaw: -8, twist: -2, pitch: -4, bend: -12, faceUp: -6, lfp: 30, lfz: up, rfp: 30, rfz: up, rfx: -9, rfy: -1.5, ...hilt(14, 1, 19), wAz: 180, wEl: 52 };
  const low: Partial<Bones> = {
    px: 11, pz: -9.2, yaw: 6, pitch: 15, twist: 2, bend: 30, faceUp: -45,
    lfx: 21, lfy: 0.5, lfz: 0, lfp: 0, lft: 2, lk: 2, rfx: -9.5, rfy: -1, rfp: 38, rfz: onToes(38), rft: -10, rk: -4,
    rhIn: 2, rhx: 27, rhy: -1, rhz: 19.3, wAz: 180, wEl: 214,
  };
  return {
    hit: WU_SLAM_HIT,
    keys: [
      { at: 0, pose: {} },
      // (the hilt up before his face, the blade standing straight up ...)
      { at: 3 * FR, pose: { pz: 0.6, yaw: -18, twist: -6, bend: -4, faceUp: -6, lfp: 14, lfz: onToes(14), rfp: 14, rfz: onToes(14), rfx: -9, rfy: -1.5, ...hilt(10, 3, 8), wAz: -130, wEl: 66 }, ease: 'io', as: { wAz: 230 } },
      // (... and on up over his head and back, up onto his toes: the top)
      { at: 11 * FR, pose: top, ease: 'io' },
      { at: 13 * FR, pose: { ...top, pz: 3.1, pitch: -5, bend: -13.5, wEl: 48, faceUp: -10 }, ease: 'io' },
      // THE STRIKE: the hips first, tipping him forward off his toes, the chest still arched back ...
      { at: 14 * FR, pose: { ...top, px: 9.5, pz: 0.5, yaw: 4, pitch: 14, bend: -8, lfx: 16, lfz: 3.6, lfp: 6, rfp: 34, rfz: onToes(34), ...hilt(14.5, 3, 14), wEl: 148 }, ease: 'in' },
      { at: 15 * FR, pose: low, ease: 'lin' },
      // THE WIND-DOWN
      { at: 17 * FR, pose: { ...low, pz: -10.6, bend: 33 }, ease: 'out' },
      { at: 24 * FR, pose: { ...low, pz: -8.4, pitch: 12, bend: 24, faceUp: -36 }, ease: 'io', as: { wAz: 0, wEl: -34 } },
      // (and he steps back into his guard: the front foot lifted and brought home, then the back foot turned and set)
      { at: 29 * FR, pose: { px: 4, pz: -6, pitch: 8, bend: 12, faceUp: -12, lfx: 15, lfz: 2.6, lfp: -6, lft: 3, rfx: -9.5, rfy: -1, rfp: 38, rfz: onToes(38), rft: -10, rk: -4, rhIn: 2, rhx: 8, rhy: -8, rhz: 25, wAz: -90, wEl: -40 }, ease: 'in' },
      { at: 31 * FR, pose: { px: 1, pz: -4.6, pitch: 5, bend: 8, rfx: -9.5, rfy: -1, rfz: 2.2, rfp: 6, rft: -40, rk: -30, rhIn: 2, rhx: 1, rhy: -10, rhz: 25, wAz: -140, wEl: -38 }, ease: 'lin' },
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
      rfx: Math.cos(a) * 10, rfy: Math.sin(a) * 10 + B.stance, rfz: 3.4, rfp: 10, rft: yaw - 40, rk: yaw - 40,
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
  dive[0] = { ...dive[0], pose: { ...dive[0].pose, rhIn: 2, rhx: R.rhx, rhy: R.rhy, rhz: R.rhz - 4, re: R.re, le: R.le, wAz: -150, wEl: -32 } };
  // (he drives off at once: the back foot off the floor in the first frames, its leg not thrown straight; his sword elbow
  // swung out as the blade comes forward, so that it comes round beside him and not over the arm)
  dive[1] = { ...dive[1], at: 0.1, ease: 'in', pose: { ...dive[1].pose, rfz: onToes(60) + 4, rfx: -17, rhx: 4, rhz: -10, re: -30, wAz: -80, wEl: -14 } };
  dive[0] = { ...dive[0], pose: { ...dive[0].pose, px: -1, pz: -7.5, pitch: 14, bend: 10 } };
  // (coming down, the point is drawn back: HELD back as his front foot reaches for the floor ...)
  const n = dive.length;
  dive[n - 2] = { ...dive[n - 2], ease: 'out', pose: { ...dive[n - 2].pose, rhx: 10.5, re: 22, le: 12 } };
  // (... and PUNCHED OUT as he lands: the blow)
  dive[n - 1] = { ...dive[n - 1], ease: 'in', pose: { ...dive[n - 1].pose, rhx: 21 } };
  const from = dive[n - 1].pose;
  const low: Partial<Bones> = { ...from, px: 9.5, pz: -12.6, pitch: 40, bend: 20, rhx: 21.5, rhz: -5.5, wEl: -7 };
  const back: Partial<Bones> = { ...from, px: 4, pz: -8.5, pitch: 20, bend: 12, twist: -24, yaw: -28, rhIn: 1, rhx: 3, rhy: -5, rhz: -15, re: 30, le: 14, wAz: 0, wEl: 8 };
  const lunge: Key3[] = [
    { at: 0.5 + 2 * FR, pose: low, ease: 'out' },
    { at: 0.5 + 6 * FR, pose: { ...low, pz: -12.2, bend: 19 }, ease: 'io' },
    // (the wind-down: drawn back, and his front foot lifted and brought home as he rises; the back foot follows)
    { at: 0.5 + 10 * FR, pose: { ...back, lfx: 13, lfz: 2.6, lfp: -6, rfx: (from.rfx as number), rfz: (from.rfz as number) }, ease: 'in' },
    { at: 0.5 + 12.5 * FR, pose: { ...back, px: 2, pz: -6, pitch: 10, bend: 9, lfx: R.lfx, lfy: R.lfy, lfz: 0, lfp: 0, lft: R.lft, rfx: -12, rfz: 2.6, rfp: 0, rft: -30, rhIn: 2, rhx: 1, rhy: -9, rhz: 20, wAz: -90, wEl: -30 }, ease: 'lin' },
    { at: 0.5 + 15 * FR, pose: {}, ease: 'out' },
  ];
  // (and all of it laid on one smooth curve through these keys, so that nothing of him leaps or stalls from any of his sides)
  const once = smoothKeys([...dive, ...lunge], THRUST3.rest);
  // (his back toe kept where it stands for the first picture, the heel rising off it, before the foot leaves the floor)
  const d0 = { ...THRUST3.rest, ...dive[0].pose } as Bones;
  const rolled: Key3 = { at: FR, pose: { ...bonesAt(once, THRUST3.rest, FR), rfx: d0.rfx + 0.4, rfy: d0.rfy, rft: d0.rft, rfp: 38, rfz: onToes(38) } };
  return { keys: smoothKeys([dive[0], rolled, ...dive.slice(1), ...lunge], THRUST3.rest), hit: 0.5 };
}
export const WU_THRUST3: Move3 = { ...THRUST3, motion: thrustBig() };

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
      { at: 3 * FR, pose: { px: from.px + 5, pz: from.pz - 1.8, pitch: from.pitch + 10, bend: from.bend + 18, faceUp: 11, lfx: from.lfx + 3.5, lfz: 2.6, lfp: -6, rhx: from.rhx + 5 } },
      { at: 4.5 * FR, pose: { px: from.px + 6, pz: from.pz - 3.2, pitch: from.pitch + 7, bend: from.bend + 11, faceUp: -14, lfx: from.lfx + 4, lfz: 2.2, lfp: -6, rhx: from.rhx + 6 }, ease: 'io' },
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
  const planted: Partial<Bones> = { rhIn: 2, rhx: 4.5, rhy: -1, rhz: GREAT_BLADE + 1.2, lhIn: 3, lhx: -5.2, lhy: 0, lhz: 0, wAz: 0, wEl: -90, wRoll: 0 };
  // (each foot stays where it is set down: the left where his second step puts it, the right where his first does, until it
  // is swung back to kneel on)
  const stood: Partial<Bones> = { px: -7, pz: -1.8, yaw: -8, pitch: 7, twist: 0, bend: 9, lfx: -1, lfy: 1, lft: 8, lk: 6, lfz: 0, lfp: 0, rfx: -13, rfy: 0, rft: -24, rk: -14, rfz: 0, rfp: 0, ...planted };
  const down: Partial<Bones> = {
    px: -13.5, pz: -16.8, yaw: -6, pitch: 5, twist: 0, bend: 15,
    lfx: -1, lfy: 1, lfz: 0, lfp: 0, lft: 8, lk: 6, rfx: -19.5, rfy: 0.5, rfz: 3.3, rfp: 40, rft: -6, rk: -4,
    ...planted,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      // thrown back: the chest first, the head after it; the back foot lifted to catch him
      { at: 2 * FR, pose: { px: -3.8, pz: -3.6, pitch: -8, bend: -16, faceUp: -10, rfx: -12, rfz: 3.0, rfp: 0, rft: -40 }, ease: 'out' },
      // the first step back (the back foot down), the front foot lifted to follow; the sword swung round low
      { at: 6 * FR, pose: { px: -5.5, pz: -2.8, yaw: -20, pitch: -3, twist: -4, bend: -3, faceUp: 8, rfx: -13, rfz: 0, rfp: 0, rft: -24, rk: -14, lfx: 4, lfz: 2.4, lfp: -6, rhIn: 0, rhx: 8, rhy: 3, rhz: -12, wAz: -90, wEl: -60 }, ease: 'io' },
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
/**
 * DRAWING HIS SWORD (his class card, when he is picked), as it was until he stands in his guard (its `ready`, 31 frames), its
 * feet mended (each foot moves only lifted: his right foot steps back as the blade comes off his back; his left steps out into
 * his guard as it falls behind him), and then his guard, alive, to 41 frames (all the card shows: to the guard and 0.3 s held).
 */
function drawMended(): Motion {
  const T = WU_TOWN_REST;
  const k = KNIGHT_DRAW3.motion.keys;
  const townLeft: Partial<Bones> = { lfx: T.lfx, lfy: T.lfy, lfz: 0, lfp: 0, lft: T.lft, lk: T.lk };
  // (his elbow carried a little higher as the blade comes up off his back, so that it swings round clear and smooth)
  const lifted = { ...k[3], pose: { ...k[3].pose, rfz: 2.8, rfp: 0, re: 180 } };
  // (his hand goes up over his shoulder to the hilt gathering pace and slowing as it takes hold, through a moment half way)
  const half = { at: 8.5 * FR, ease: 'in' as const, pose: { ...mixPose(k[1].pose, k[2].pose, 0.5, T), re: 70 } };
  const taken = { ...k[2], ease: 'out' as const };
  // (his left hand comes to the hilt gathering pace, from where it hung)
  const high = { ...k[4], ease: 'io' as const, pose: { ...k[4].pose, ...townLeft } };
  const high2 = { ...k[5], pose: { ...k[5].pose, ...townLeft } };
  const guard = k[6];
  const step = { at: 27.5 * FR, ease: 'io' as const, pose: { ...mixPose({ ...k[5].pose, ...townLeft }, guard.pose, 0.5, T), lfx: 6, lfy: 1, lfz: 2.6, lfp: -6 } };
  const R = WU_REST;
  return {
    keys: [k[0], k[1], half, taken, lifted, high, high2, step, guard, { at: 36 * FR, pose: { ...R, pz: R.pz - 0.8, bend: R.bend + 1.5, wEl: R.wEl + 2, rhz: R.rhz + 0.3 }, ease: 'io' }, { at: 41 * FR, pose: { ...R }, ease: 'io' }],
  };
}
export const WU_DRAW3: Move3 = { ...KNIGHT_DRAW3, name: 'The knight draws his sword', motion: drawMended() };
export const WU_LOOK3: Move3 = { ...KNIGHT_LOOKS3, name: 'The knight looks about him' };

/** The game's step on each swing of Strike, in his own lengths, by `t` seconds (TUNE.swingStep over TUNE.swingStepTime). */
export function swingCarried(t: number): number {
  return TUNE.swingStep * UNITS_PER_TILE * Math.min(1, Math.max(0, t / TUNE.swingStepTime));
}

/** Every move of his, by the short names the game knows him by (moves3.ts MOVES3's), made new. */
export const WU_MOVES: Record<string, Move3> = {
  rear: WU_REAR3, krun: WU_RUN3, strike: WU_STRIKE3, kslash: WU_SLASH3, slam: WU_SLAM3, whirl: WU_WHIRL3, kthrust: WU_THRUST3,
  kreel: WU_REEL3, klurch: WU_LURCH3, kfall: WU_FALL3, ktown: WU_TOWN3, ktownrun: WU_TOWN_RUN3, klook: WU_LOOK3, kdraw: WU_DRAW3,
};
