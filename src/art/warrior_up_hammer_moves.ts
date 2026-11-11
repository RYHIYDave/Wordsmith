// THE WARRIOR'S WARHAMMER, STEP 3: HIS MOVES WITH IT (the art chat's helper, 9 Nov 2026; docs/mockups/warrior_weapons/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF (art/warrior_up_weapons.ts WARRIOR_WEAPONS): nothing of the game imports this file
// (tests/warrior_weapons.test.ts holds it). The hammer is HIS PICK of 9 Nov 2026: “A, the maul (Recommended)” (a squared iron
// block, a bright-rimmed striking face, a spike behind).
//
// Made as his moves with the war axe are (art/warrior_up_axe_moves.ts: THE MODEL, and the machinery: a move's keys, his pose
// at a moment, his painter, the checks), on his own bones and his own stance, every list 30 pictures a second, each blow by his
// rulebook's Movement 9: a big wind-up, HELD; the strike in one or two frames, smeared; a big wind-down. What he does with the
// maul (the main chat's board post of 8 Nov 2026, 06:35; his “All those are good”):
//   STANDING AND RUNNING    his own stand and run as the game has them (frame for frame his body and his legs), the maul in
//                           both hands, its face down; heavier than the axe: it stirs less as he stands, and as he runs it
//                           lags his steps and swings a little
//   SMASH (tap)             one crushing blow straight down before him; a second tap is a second blow, hauled straight up from
//                           the floor where the first lies
//   EARTHQUAKE (hold)       he rears right back, the maul behind and above him, and brings it down on the floor before him:
//                           the ground heaves out in a ring. TREMORS (a talent): THREE BLOWS, the great one and two short
//                           pounds on the same spot after it, each from lower, each weaker
//   SHOULDER CHARGE (swipe) a crouch, held; he drives through low and fast, his left shoulder first, the maul trailed behind
//                           in his right hand; he skids to a stop, the maul's weight carried on round him
//
// HOW HE HOLDS IT, in every move: his LEFT hand at the butt, his RIGHT hand up the haft (his guard's grip), the two never
// changing places; for a blow his right hand slides down the haft to his left, and back up after; in the charge his right hand
// alone. THE HEAD IS NEVER ROLLED ABOUT ITS HAFT: a maul has one face, so from his guard (the haft trailing back, the face
// down) it is swung up ROUND HIS RIGHT SIDE to stand over his right shoulder, which brings the face to the mark of itself; and
// it comes down from there face first.
// THE RULES THAT HOLD IN EVERY FRAME, FROM EVERY SIDE (the axe's checks, held by the test): his helm is seen; the striking face
// points down or toward the mark, never at his own head; both hands on the grip wherever the move has two on it; nothing of the
// maul through him.

import type { Light, Sprite } from '../engine/px';
import type { AnimSet, Clip } from './actor_types';
import { lazyFrames } from './kit';
import { KNIGHT_BODY, KNIGHT_RUN3, UNITS_PER_TILE } from './moves3';
import { solve } from './skeleton';
import type { Bones, Key3, Posed, V3 } from './skeleton';
import { WU_SIDES } from './warrior_up';
import type { WuSide } from './warrior_up';
import { WU_REAR3, WU_REST, backFoot, lightFeet, onToes, plantedFeet, skipFeet } from './warrior_up_moves';
import { TAKES, onTake } from './warrior_up_weapons';
import type { WeaponTake } from './warrior_up_weapons';
import { axePosed, axeSprite, heavyKit, heavyRest, withAxe } from './warrior_up_axe_moves';
import type { AxeKey, AxeMove, Held } from './warrior_up_axe_moves';

const FR = 1 / 30;
const B = KNIGHT_BODY;
const D = Math.PI / 180;

/** HIS WARHAMMER: take A, the maul (his pick, 9 Nov 2026: “A, the maul (Recommended)”). */
export const MAUL: WeaponTake = TAKES.hammerA;
/** HIS GUARD WITH THE MAUL (step 1's, as he saw it: art/warrior_up_weapons.ts GUARD_HEAVY), on his own stance. */
export const HAMMER_REST: Bones = heavyRest(MAUL);
const KIT = heavyKit(MAUL, HAMMER_REST, false);
const { BUTT, SLID, hold, one, key } = KIT;
/** (for whoever makes a move, tools only: the maul's own key-making) */
export const HAMMER_KIT = KIT;
const DOWN: V3 = [0, 0, -1];
/** A move with the maul. */
const maul = (m: Omit<AxeMove, 'take' | 'rest'>): AxeMove => ({ take: MAUL, rest: HAMMER_REST, ...m });

// ---------------------------------------------------------------------------------------------
// STANDING AND RUNNING WITH IT: HIS OWN STAND AND RUN AS THE GAME HAS THEM, every number of his body and his legs the game's;
// only his arms are the maul's.

/**
 * HIS GUARD WITH THE MAUL, ALIVE (2 s, 60 pictures): his rear stance as the game has it alive (art/warrior_up_moves.ts WU_REAR3),
 * the head of the maul stirring behind him as the point of his sword does, but LESS: it is the heavier, and hangs.
 */
export const HAMMER_STAND: AxeMove = maul({
  name: 'Warhammer: his guard, alive',
  loop: 0,
  keys: withAxe(WU_REAR3.motion.keys, (p) => {
    const R = WU_REST;
    const A = HAMMER_REST;
    const out: Partial<Bones> = {};
    if (p.wEl !== undefined) out.wEl = A.wEl + (p.wEl - R.wEl) * 0.55;
    if (p.wAz !== undefined) out.wAz = A.wAz + (p.wAz - R.wAz) * 0.7;
    if (p.wRoll !== undefined) out.wRoll = A.wRoll + (p.wRoll - R.wRoll) * 0.5;
    if (p.rhz !== undefined) out.rhz = A.rhz + (p.rhz - R.rhz);
    return out;
  }),
});

/** Where his right hand carries the maul as he runs, from his right shoulder (forward, to his left, up, as he faces): a
 * little lower than the axe, for its weight. */
const RUN_HAND: V3 = [5, -5, -14.8];
const RUN_AZ = -130;
const RUN_ELBOW = 30;
/** How many keys of his run (of its sixteen to a turn) the maul's head is behind his steps: its weight lags them. */
const RUN_LAG = 2;
/**
 * RUNNING WITH THE MAUL: THE GAME'S OWN RUN, frame for frame (moves3.ts KNIGHT_RUN3), the maul carried as his guard has it: both
 * hands on the haft before his right hip, the head trailing up behind his right shoulder, its face down. HEAVIER THAN THE AXE:
 * its head dips and rises further with each step, a sixteenth of a second BEHIND the step that throws it (it lags), swings
 * further from side to side behind him, and his hands give under it as it comes down.
 */
export const HAMMER_RUN: AxeMove = maul({
  name: 'Warhammer: he runs (the game\'s run)',
  loop: 0,
  keys: (() => {
    const run = KNIGHT_RUN3.motion.keys;
    const n = run.length - 1;
    return withAxe(run, (p, i) => {
      // (what the head does, from the key `RUN_LAG` before: the run is a loop, its last key its first)
      const was = run[(((i - RUN_LAG) % n) + n) % n].pose;
      const dip = ((was.wEl ?? -31) + 31) / 5;
      const sway = ((was.wAz ?? -160) + 160) / 5;
      return {
        rhIn: 1, rhx: RUN_HAND[0] + ((p.rhx ?? 6.2) - 6.2), rhy: RUN_HAND[1], rhz: RUN_HAND[2] + dip * 0.7,
        lhIn: 3, lhx: BUTT, lhy: 0, lhz: 0,
        wAz: RUN_AZ + sway * 7.5, wEl: 13 + dip * 6.5, wRoll: 180,
        le: 12, re: RUN_ELBOW,
      };
    });
  })(),
});

// ---------------------------------------------------------------------------------------------
// SMASH (his tap with the maul), BY MOVEMENT 9. Beside his Strike (its reach, 1.7 tiles; the game's step on a swing) but
// HEAVIER AND SLOWER: the blow at 13 frames (0.433 s; his Strike's at 10, his Slam's at 15), ONE CRUSHING BLOW STRAIGHT DOWN
// before him, on a small round of the floor.

/** Smash's blow, both blows: the rules' moment. */
export const HAMMER_SMASH_HIT = 13 * FR;
/** Where the first blow waits, the maul on the floor and he gathered over it, while a second tap may still come (the game's `poise`). */
export const HAMMER_SMASH_POISE = 21 * FR;
/** The held wind-up of each blow: from, to (frames). The strike is the two frames from its end to the blow. */
export const HAMMER_SMASH_HELD: readonly [number, number] = [8, 11];
/** WHERE SMASH LANDS, for the rules (tiles): the middle of the maul's face on the floor, before where he stands when the blow
 * begins (the game's step on a swing, 0.33 tiles, and his own reach: measured on his frames, the test holds it), and how far
 * round it the blow strikes: a round a tile across, whose far edge is his Strike's reach, 1.7. */
export const HAMMER_SMASH_AT = 1.2;
export const HAMMER_SMASH_ROUND = 0.5;

/** Where his left fist is at the top of a Smash's wind-up, and at the end of its hold (from the middle of his hips: forward, to
 * his left, up): back by his right ear, so that his helm is seen from every side. */
const TOP_HANDS: V3 = [3, -10, 17.5];
const TOP_HANDS2: V3 = [2, -10, 18];
/** His body at the top of a Smash: up on his toes, arched back, wound a little to his right, his chin down and his eyes on the spot. */
function smashTop(): Partial<Bones> {
  const P = plantedFeet();
  return { ...P, lfp: 24, lfz: onToes(24), ...backFoot(44, -8), rk: -4, px: 0.5, pz: 1.4, yaw: -22, pitch: -5, twist: -12, bend: -14, faceUp: -10, faceTurn: 0, faceTilt: 0 };
}
/** His body at the blow: a stride's weight thrown down onto his front foot, bent deep over the maul, his knees sunk. */
function smashLow(): Partial<Bones> {
  const P = plantedFeet();
  return { ...P, ...backFoot(40, -8), rk: -4, px: 7.5, pz: -10.5, yaw: -4, pitch: 20, twist: 0, bend: 30, faceUp: -30, faceTurn: 0 };
}
/** The maul on the floor before him (its face flat on it), both hands low on the haft: `sunk`, how much further he has gone down after it. */
function onFloor(body: Partial<Bones>, near: number, el = -9, butt: V3 = [13, -1, -5]): Held {
  return hold(body, butt, 0, el, DOWN, near, SLID);
}
/** THE WIND-DOWN OF A BLOW ON THE FLOOR, from where he is sunk over it (`from`, a frame) into his guard, `long` frames: his
 * body comes up first, the head still on the floor and dragged a little toward him; then it is hauled up off the floor, its
 * weight swinging it low round his right side as his right hand slides back up the haft; and up behind his shoulder. */
function haulBack(from: number, low: Partial<Bones>, sunk: Held, long = 22): AxeKey[] {
  const P = plantedFeet();
  const f = (k: number): number => from + Math.round(long * k);
  // (he gathers: his hips back and up, his hands risen, the head of the maul still on the floor: where a second tap begins)
  const gathered = hold({ ...low, px: 5.4, pz: -8.6, pitch: 15, bend: 22, faceUp: -22 }, [12, -1, -2.5], 0, -16, DOWN, sunk.roll, SLID);
  // (hauled off the floor: its head swung out low to his right)
  const off = hold({ ...P, ...backFoot(40, -8), rk: -4, px: 3.4, pz: -7.4, yaw: -16, pitch: 11, twist: -8, bend: 16, faceUp: -12 }, [12, -2, 1], -34, -12, DOWN, gathered.roll, SLID);
  const round = hold({ ...P, px: 1.6, pz: -6.0, yaw: -28, pitch: 8, twist: -18, bend: 12, faceUp: -5 }, [11, -3, 4], -92, -4, DOWN, off.roll, SLID - 3);
  const behind = hold({ ...P, px: 0.4, pz: -4.6, yaw: -36, pitch: 5, twist: -26, bend: 8, faceUp: -1 }, [10, -4, 6.5], -140, 8, DOWN, round.roll, -3);
  return [
    key(f(0.23), gathered, 'io'),
    key(f(0.5), off, 'io'),
    key(f(0.68), round, 'lin'),
    key(f(0.84), behind, 'lin'),
    { at: f(1) * FR, pose: { wRoll: 180 }, ease: 'out' },
  ];
}

/**
 * THE FIRST BLOW. A skip-step in as the game's step carries him (both feet off the floor, 0 to 2), the maul begun on its way:
 * SWUNG UP ROUND HIS RIGHT SIDE, its head rising out to his right (4) and on up over him, to stand tipped back OVER HIS RIGHT
 * SHOULDER, his hands by his right ear, ITS FACE TOWARD THE MARK, he up on his toes with his back arched and his chin down
 * (8); HELD (8 to 11: it tips further back, he rises a little more). THE STRIKE, two frames: his hips drop and his hands come
 * down before him, his right hand sliding down the haft to his left, the maul over the top (12) and STRAIGHT DOWN ONTO THE
 * FLOOR before him, its face flat on it, all his weight thrown down after it (13, the blow); a freeze, he sinking on over it
 * (16). THE WIND-DOWN, heavy: he gathers, his hips back and up, the head still on the floor (21: it waits here, `poise`); then
 * it is hauled up off the floor, swung low round his right side, and up behind his shoulder into his guard (38).
 */
function smashDown(): AxeKey[] {
  const P = plantedFeet();
  const top = smashTop();
  const low = smashLow();
  // (THE MAUL IS SWUNG LOW ROUND HIS RIGHT SIDE AND UP BEFORE HIS RIGHT SHOULDER, its face kept down: so it comes up past
  // upright with its face turned toward the mark of itself, the head never rolled about its haft, and never passes before his helm)
  const k1 = hold({ ...lightFeet(), px: -0.2, pz: -4.0, yaw: -42, twist: -30, bend: 6 }, [11, -4, 8], -146, 8, DOWN, 180);
  const k2 = hold({ ...skipFeet(), px: -0.4, pz: -4.4, yaw: -40, twist: -28, bend: 7 }, [12.5, -7, 7], -112, -8, DOWN, k1.roll, SLID);
  // (landed: the head swung on, low before his right hip, and rising)
  const k4 = hold({ ...P, px: -0.4, pz: -4.6, yaw: -34, twist: -22, pitch: 3, bend: 4, faceUp: -4 }, [12, -9, 9.5], -36, 22, DOWN, k2.roll, SLID);
  const k5 = hold({ ...P, px: -0.5, pz: -3.6, yaw: -30, twist: -18, pitch: 1, bend: 0, faceUp: -6 }, [10, -11, 12.5], -46, 56, DOWN, k4.roll);
  const k6 = hold({ ...top, lfp: 10, lfz: onToes(10), pz: -1.2, bend: -8, pitch: -2 }, [7, -10.5, 15.5], -14, 88, [1, 0, 0], k5.roll);
  const k7 = hold({ ...top, lfp: 14, lfz: onToes(14), pz: -0.4, bend: -11, pitch: -3 }, [4.5, -11, 15.8], 0, 112, [1, 0, 0], k6.roll);
  const k8 = hold(top, TOP_HANDS, 0, 132, [1, 0, 0.1], k7.roll);
  const k11 = hold({ ...top, pz: 2.0, pitch: -6, bend: -16, faceUp: -12 }, TOP_HANDS2, 0, 140, [1, 0, 0.2], k8.roll);
  // THE STRIKE: over the top ...
  const k12 = hold({ ...P, ...backFoot(40, -8), rk: -4, px: 4.5, pz: -3.5, yaw: -10, pitch: 8, twist: -4, bend: 6, faceUp: -22 }, [11, -5, 14], 0, 52, [1, 0, -0.6], k11.roll, SLID);
  // ... and down onto the floor
  const k13 = onFloor(low, k12.roll);
  const k16 = onFloor({ ...low, pz: -12.2, bend: 34, pitch: 21 }, k13.roll, -10, [13, -1, -5.6]);
  return [
    { at: 0, pose: {} },
    key(1, k1, 'out'),
    key(2, k2, 'lin'),
    key(4, k4, 'lin'),
    key(5, k5, 'lin'),
    key(6, k6, 'lin'),
    key(7, k7, 'lin'),
    // THE WIND-UP, reached and HELD
    key(8, k8, 'out'),
    key(11, k11, 'io'),
    // THE STRIKE
    key(12, k12, 'in'),
    key(13, k13, 'lin'),
    // (the blow lands with a freeze: his rulebook's Movement 7; he sinks on over it)
    key(16, k16, 'out'),
    // THE WIND-DOWN
    ...haulBack(16, low, k16),
  ];
}
export const HAMMER_SMASH: AxeMove = maul({ name: 'Smash, the first blow (Movement 9)', keys: smashDown(), hit: HAMMER_SMASH_HIT, poise: HAMMER_SMASH_POISE, tail: true, smear: [12 * FR, 14 * FR] });

/**
 * THE SECOND BLOW (a second tap, while the first waits with the maul on the floor: as his Strike's second swing follows its
 * first). From where the first waits: a skip-step in (0 to 2) as he HEAVES IT STRAIGHT UP OFF THE FLOOR before his right
 * shoulder, its face toward the mark all the way (4, 6), to the very same top, tipped back over his right shoulder (8); HELD
 * (8 to 11). THE STRIKE and the blow as the first's (12; 13, the blow); the same freeze (16) and the same heavy wind-down,
 * which ends in his guard of itself (38).
 */
function smashAgain(): AxeKey[] {
  const first = smashDown();
  const top = smashTop();
  const low = smashLow();
  // (where the first waits: its pose at its `poise`)
  const at = axePosed(maul({ name: '', keys: first }), HAMMER_SMASH_POISE);
  const from: AxeKey = { at: 0, pose: stripped(at.q), grip: at.rightOn };
  const k1 = hold({ ...lightFeet(), px: 5.0, pz: -8.0, yaw: -6, pitch: 14, twist: -2, bend: 20, faceUp: -20 }, [12, -2, -1], 0, -6, DOWN, 180, SLID);
  const k2 = hold({ ...skipFeet(), px: 4.4, pz: -6.6, yaw: -8, pitch: 11, twist: -3, bend: 14, faceUp: -18 }, [12, -5, 1.5], -32, 6, DOWN, 180, SLID);
  const k4 = hold({ ...plantedFeet(), px: 3.0, pz: -3.6, yaw: -16, pitch: 5, twist: -10, bend: 4, faceUp: -10 }, [11, -10.5, 10], -56, 44, DOWN, 180, SLID);
  const k5 = hold({ ...plantedFeet(), px: 1.5, pz: -2.8, yaw: -24, pitch: 2, twist: -14, bend: 0, faceUp: -8 }, [10, -11.5, 12.5], -50, 60, DOWN, 180, SLID - 3);
  const k6 = hold({ ...top, lfp: 10, lfz: onToes(10), pz: -0.6, bend: -8, pitch: -2 }, [7, -10.5, 15.5], -14, 88, [1, 0, 0], 180, SLID);
  const k8 = hold(top, TOP_HANDS, 0, 132, [1, 0, 0.1], 180);
  const k11 = hold({ ...top, pz: 2.0, pitch: -6, bend: -16, faceUp: -12 }, TOP_HANDS2, 0, 140, [1, 0, 0.2], 180);
  return [
    from,
    key(1, k1, 'out'),
    key(2, k2, 'lin'),
    key(4, k4, 'lin'),
    key(5, k5, 'lin'),
    key(6, k6, 'lin'),
    key(8, k8, 'out'),
    key(11, k11, 'io'),
    // (from the top on: the first blow's own keys)
    ...first.filter((k) => k.at > 11 * FR + 1e-6),
  ];
}
/** A pose with nothing left of the key it was read between (for a key that begins where another move waits). */
function stripped(q: Posed): Partial<Bones> {
  const out: Record<string, unknown> = { ...q };
  for (const f of ['from', 'to', 'mixK', 'lh2', 'rh2']) delete out[f];
  return out as Partial<Bones>;
}
export const HAMMER_SMASH2: AxeMove = maul({ name: 'Smash, the second blow (Movement 9)', keys: smashAgain(), hit: HAMMER_SMASH_HIT, tail: true, smear: [12 * FR, 14 * FR] });

// ---------------------------------------------------------------------------------------------
// THE CHECKS' MEASURES (for the test, the pictures and the README)

/** Where the middle of the maul's striking face is at a moment of a move, in his own lengths (forward of where he stands, to
 * his left, above the floor), and the same forward in tiles. */
export function faceAt(m: AxeMove, t: number): { at: V3; tiles: number } {
  const p = axePosed(m, t);
  const at = onTake(p.placed, [MAUL.heart + 5, 7.95, 0]);
  return { at, tiles: at[0] / UNITS_PER_TILE };
}

/** Every move with the maul, by a short name. */
export const HAMMER_MOVES: Record<string, AxeMove> = {
  hstand: HAMMER_STAND, hrun: HAMMER_RUN, smash: HAMMER_SMASH, smash2: HAMMER_SMASH2,
};

export { FR as HAMMER_FRAME };
// (kept for the lists below)
void [lazyFrames, axeSprite, WU_SIDES, solve, D, B, one];
export type { AnimSet, Clip, Light, Sprite, WuSide, Key3 };
