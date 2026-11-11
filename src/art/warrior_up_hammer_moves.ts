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

import type { Sprite } from '../engine/px';
import type { AnimSet, Clip } from './actor_types';
import { lazyFrames } from './kit';
import { KNIGHT_RUN3, UNITS_PER_TILE } from './moves3';
import type { Bones, Posed, V3 } from './skeleton';
import { WU_SIDES } from './warrior_up';
import type { WuSide } from './warrior_up';
import { WU_REAR3, WU_REST, backFoot, lightFeet, onToes, plantedFeet, skipFeet } from './warrior_up_moves';
import { TAKES, onTake } from './warrior_up_weapons';
import type { WeaponTake } from './warrior_up_weapons';
import { axePosed, axeSprite, heavyKit, heavyRest, withAxe } from './warrior_up_axe_moves';
import type { AxeKey, AxeMove, Held } from './warrior_up_axe_moves';

const FR = 1 / 30;

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
/** WHERE SMASH LANDS, for the rules (tiles): the middle of the maul's face on the floor, before where he stands at the blow (his
 * own reach, measured on his frames, after the game's step on a swing, 0.33 tiles: the test holds it), and how far round it
 * the blow strikes: a round a little less than a tile across, whose far edge is about his Strike's reach (1.8; Strike 1.7). */
export const HAMMER_SMASH_AT = 1.4;
export const HAMMER_SMASH_ROUND = 0.4;

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
// EARTHQUAKE (his hold with the maul), BY MOVEMENT 9. Beside his Slam (its wind-up, 0.5 s; struck 1.4 tiles before him; 2.0
// tiles round): a LONGER HELD WIND-UP, he rears right back, the maul behind and above him; the blow on the floor before him; THE
// GROUND HEAVES OUT IN A RING (the game's to draw: its slam). TREMORS (a talent): THE SAME ONE BLOW, and the ground heaves three
// times from it, one after another, each ring wider and weaker (the game's; his frames are Earthquake's).

/** Earthquake's beats (frames): the coil reached, held to; the whirl's last frame; the top reached, held to; the blow; the end. */
export const HAMMER_QUAKE_COIL = 2;
export const HAMMER_QUAKE_COILED = 4;
export const HAMMER_QUAKE_WHIRLED = 13;
export const HAMMER_QUAKE_TOP = 16;
export const HAMMER_QUAKE_HELD = 17;
export const HAMMER_QUAKE_BLOW = 19;
export const HAMMER_QUAKE_END = 49;
/** WHERE THE GROUND HEAVES, for the rules (tiles, seconds): the ring's middle before him (Slam's range: where the face lands),
 * how far it reaches (Slam's), how long it takes to roll out to its edge. TREMORS: three, `TREMORS.after` seconds apart, each
 * `wider` tiles further out and `weaker` (each a share of the first's damage). */
export const HAMMER_QUAKE_AT = 1.4;
export const HAMMER_QUAKE_ROUND = 2.0;
export const HAMMER_QUAKE_ROLL = 0.35;
export const HAMMER_TREMORS = { count: 3, after: 0.35, wider: 0.6, weaker: [1, 0.6, 0.35] } as const;
/** How far round the whirl takes him (degrees: a full turn and the eighth more that brings him back square to the mark). */
export const HAMMER_QUAKE_TURN = 390;

const D = Math.PI / 180;
/**
 * HIS FEET THROUGH THE WHIRL, stepping round under him as he turns (the game does not carry him). His feet are laid on the floor
 * as the floor has them, so a foot that is down stays where it is while his hips turn over it; each in turn lifts and steps
 * round to where his stance puts it for the turn to come: five steps, right, left, right, left, right, the last two home to his
 * guard's own stance (a full turn round). `yaw`: how far round his hips are.
 */
function whirlFeet(yaw: number): Partial<Bones> {
  const P = plantedFeet() as Record<string, number>;
  const y0 = HAMMER_REST.yaw;
  const polar = (x: number, y: number): [number, number] => [Math.hypot(x, y), Math.atan2(y, x) / D];
  const [rL, aL] = polar(P.lfx, P.lfy);
  const [rR, aR] = polar(P.rfx, P.rfy);
  // (a foot's place and its way for a stance turned `st` from his guard's, drawn in `k` of the way)
  const at = (left: boolean, st: number, k: number): number[] => {
    const r = (left ? rL : rR) * k;
    const a = ((left ? aL : aR) + st) * D;
    return [r * Math.cos(a), r * Math.sin(a), (left ? P.lft : P.rft) + st];
  };
  // (each foot's plants: the stance it is set down in (turned from his guard's, and how near), and the hip turn at which it steps)
  const steps = (left: boolean): { at: number; st: number; k: number }[] => (left
    ? [{ at: -1e9, st: 0, k: 1 }, { at: 55, st: 170, k: 0.62 }, { at: 205, st: 360, k: 1 }]
    : [{ at: -1e9, st: 0, k: 1 }, { at: -20, st: 95, k: 0.62 }, { at: 130, st: 245, k: 0.62 }, { at: 280, st: 360, k: 1 }]);
  const out: Record<string, number> = {};
  const SPAN = 70;
  for (const left of [true, false]) {
    const list = steps(left);
    let i = 0;
    while (i < list.length - 1 && yaw >= list[i + 1].at + SPAN / 2) i++;
    const plant = list[i];
    const next = list[i + 1];
    let [x, y, t] = at(left, plant.st, plant.k);
    let lift = 0;
    // (stepping: lifted and carried round to its next place, over `SPAN` degrees of his turn)
    if (next && yaw > next.at - SPAN / 2 - 1e-9 && yaw < next.at + SPAN / 2) {
      const u = (yaw - (next.at - SPAN / 2)) / SPAN;
      const [x1, y1, t1] = at(left, next.st, next.k);
      x += (x1 - x) * u; y += (y1 - y) * u; t += (t1 - t) * u;
      lift = 3.5 * Math.min(1, 3 * Math.sin(u * Math.PI));
    }
    const k = left ? 'l' : 'r';
    out[`${k}fx`] = x; out[`${k}fy`] = y; out[`${k}ft`] = t; out[`${k}fz`] = lift; out[`${k}fp`] = 0;
  }
  return { ...out, lk: (P.lk as number) + 4, rk: -10 } as Partial<Bones>;
}

/**
 * EARTHQUAKE: A FULL SPIN, THEN DOWN (his pick, 11 Nov 2026: “A full spin, then down”). From its first frame it is not the Smash.
 * THE COIL: he sinks and draws the maul back round to his right side, wound up, his body turned away from the mark (2), HELD
 * (2 to 4). THE WHIRL (4 to 12, a quarter of a second): one full turn and an eighth, the maul's head swept wide and level round
 * him at his waist, both hands together at the butt, his arms out, his body turning with it; HIS FEET STEP ROUND under him,
 * right, left, right, left, each down where it is set (the game does not carry him); the head smeared as it goes. THE WHIRL IS
 * HIS WIND-UP, NOT A BLOW: what hurts is the ring. Out of the turn it goes UP AND OVER THE TOP (13, 14), laid back over his right
 * shoulder (15), HUNG THERE A BEAT (15 to 16), and DOWN, smeared (17), onto the floor 1.4 tiles before him: THE BLOW at 18 (0.6
 * s), deeper than a Smash. A long freeze, sunk over it as the ground heaves (to 23); the heavy haul back into his guard (48).
 */
function earthquake(): AxeKey[] {
  const P = plantedFeet();
  const top = smashTop();
  const reared: Partial<Bones> = { ...top, lfp: 30, lfz: onToes(30), pz: 2.2, pitch: -9, bend: -22, twist: -16, yaw: -26, faceUp: -14 };
  const low: Partial<Bones> = { ...smashLow(), px: 8.5, pz: -12.5, pitch: 23, bend: 34, faceUp: -32 };
  const keys: AxeKey[] = [{ at: 0, pose: {} }];
  // THE COIL, reached and HELD: wound round to his right, the maul back round at his right side, low
  const coil = (yaw: number, twist: number, sunk: number, rel: number, near: number): Held =>
    hold({ ...whirlFeet(yaw), px: -0.5, pz: sunk, yaw, twist, pitch: 6, bend: 10, faceUp: 4, faceTurn: 10, faceTilt: 0 }, [7, -8, 4], yaw + twist + rel, 4, DOWN, near, SLID);
  const k2 = coil(-78, -30, -8.5, -100, 180);
  const k4 = coil(-86, -32, -9.2, -108, k2.roll);
  keys.push(key(HAMMER_QUAKE_COIL, k2, 'out'), key(HAMMER_QUAKE_COILED, k4, 'io'));
  // THE WHIRL: a frame a key, his hips turned on round, the maul's head swept out and level before him, his feet stepping
  let near = k4.roll;
  const n = HAMMER_QUAKE_WHIRLED - HAMMER_QUAKE_COILED;
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    // (a little eased out of the coil and into the rise)
    const e = 0.7 * u + 0.3 * (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
    const twist = -32 + 20 * u;
    const yaw = -86 + (HAMMER_QUAKE_TURN - 6) * e - (twist + 32);
    const rel = -108 + 88 * Math.min(1, u * 2.2);
    const h = hold({ ...whirlFeet(yaw), px: 0, pz: -8.5 + 1.5 * u, yaw, twist, pitch: 4, bend: 6, faceUp: 2, faceTurn: 6, faceTilt: 0 }, [11, -3, 6.5], yaw + twist + rel, 8 + 6 * u, DOWN, near, SLID);
    near = h.roll;
    keys.push(key(HAMMER_QUAKE_COILED + i, h, 'lin'));
  }
  // UP AND OVER THE TOP out of the turn (his feet home in his guard's stance), laid back over his right shoulder, HUNG a beat
  const k13 = hold({ ...P, px: -0.5, pz: -3.8, yaw: -32, twist: -18, pitch: 1, bend: 0, faceUp: -6 }, [10, -11, 12.5], -46, 56, DOWN, near);
  const k14 = hold({ ...top, lfp: 10, lfz: onToes(10), pz: -1.2, bend: -8, pitch: -2 }, [7, -10.5, 15.5], -14, 88, [1, 0, 0], k13.roll);
  const k15 = hold(reared, [2.5, -10.5, 17], 0, 140, [1, 0, 0.2], k14.roll);
  const k16 = hold({ ...reared, pz: 2.8, pitch: -11, bend: -26, faceUp: -16 }, [1.5, -10.5, 17.2], 0, 150, [1, 0, 0.3], k15.roll);
  // THE STRIKE: over the top, and down onto the floor
  const k17 = hold({ ...P, ...backFoot(40, -8), rk: -4, px: 4.5, pz: -3.5, yaw: -10, pitch: 8, twist: -4, bend: 6, faceUp: -22 }, [11, -5, 14], 0, 52, [1, 0, -0.6], k16.roll, SLID);
  const k18 = onFloor(low, k17.roll, -9, [13, -1, -6]);
  const k23 = onFloor({ ...low, pz: -13.6, bend: 37, pitch: 25 }, k18.roll, -10, [13, -1, -6.6]);
  const after: AxeKey[] = [
    key(14, k13, 'out'),
    key(15, k14, 'lin'),
    key(HAMMER_QUAKE_TOP, k15, 'out'),
    key(HAMMER_QUAKE_HELD, k16, 'io'),
    key(18, k17, 'in'),
    key(HAMMER_QUAKE_BLOW, k18, 'lin'),
    // (a long freeze, sunk over it, as the ground heaves)
    key(24, k23, 'out'),
    ...haulBack(24, low, k23, HAMMER_QUAKE_END - 24),
  ];
  // (the turn is a whole one: from the whirl on, his hips and the maul's way are said a turn further round, the same pose)
  for (const k of after) {
    const pose = k.pose as Record<string, number>;
    pose.yaw = (pose.yaw ?? HAMMER_REST.yaw) + 360;
    pose.wAz = (pose.wAz ?? HAMMER_REST.wAz) + 360;
  }
  return [...keys, ...after];
}
export const HAMMER_QUAKE: AxeMove = maul({
  name: 'Earthquake: a full spin, then down (Movement 9)', keys: earthquake(), hit: HAMMER_QUAKE_BLOW * FR,
  smear: [18 * FR, 20 * FR], smears: [[(HAMMER_QUAKE_COILED + 2) * FR, (HAMMER_QUAKE_WHIRLED + 1) * FR]],
});

// ---------------------------------------------------------------------------------------------
// SHOULDER CHARGE (his swipe with the maul). Beside his Lunge (its range, 6 tiles; its half second on the way): A CROUCH, HELD;
// he DRIVES THROUGH, low and fast, HIS LEFT SHOULDER FIRST, the maul trailed behind him in his right hand; WHAT HE MEETS IS
// THROWN ASIDE (the game's); he SKIDS to a stop, the maul's weight carried on round him; back to his guard.

/** Shoulder Charge's beats (frames): the crouch reached, the drive's first and last (the game carries him between), the skid's
 * end, the end. */
export const HAMMER_CHARGE_HELD = 3;
export const HAMMER_CHARGE_GO = 6;
export const HAMMER_CHARGE_STOP = 21;
export const HAMMER_CHARGE_SKID = 27;
export const HAMMER_CHARGE_END = 42;
/** How far the game carries him (tiles): the drive (his Lunge's range, at most) and the skid after it. */
export const HAMMER_CHARGE_FAR = 6;
export const HAMMER_CHARGE_SLIDE = 0.6;
/** How wide what he meets is thrown aside (tiles either side of his path), and how far it is thrown. */
export const HAMMER_CHARGE_WIDE = 0.7;
export const HAMMER_CHARGE_THROW = 1.6;

/** His left arm free: his hand from his left shoulder (forward, to his left, up, as he faces), and how far its elbow is swung. */
const free = (x: number, y: number, z: number, le = 0): Partial<Bones> => ({ lhIn: 1, lhx: x, lhy: y, lhz: z, le });

/** How far along his aim the game has carried him by a moment of the charge (his own lengths). */
function chargeCarried(t: number): number {
  const f = t / FR;
  const go = HAMMER_CHARGE_GO;
  const stop = HAMMER_CHARGE_STOP;
  const drive = HAMMER_CHARGE_FAR * UNITS_PER_TILE;
  if (f <= go) return 0;
  if (f <= stop) return (drive * (f - go)) / (stop - go);
  const k = Math.min(1, (f - stop) / (HAMMER_CHARGE_SKID - stop));
  return drive + HAMMER_CHARGE_SLIDE * UNITS_PER_TILE * (1 - (1 - k) * (1 - k));
}

/**
 * SHOULDER CHARGE, all of it. THE CROUCH: he sinks low, his left shoulder turned to the mark, the maul let down into his right
 * hand alone and drawn back low behind him, his left arm tucked across his chest (3); HELD (3 to 6). THE DRIVE (6 to 21, half
 * a second: the game carries him 6 tiles): his own run's legs, frame for frame a turn of it, driven low and long, his body
 * pitched forward and turned so that HIS LEFT SHOULDER LEADS, his helm tucked behind it; the maul trailed low behind him in his
 * right hand, its face down; his cloth streaming back. THE SKID (21 to 27, the game carrying him on 0.6 tiles, slowing): his
 * front foot planted and sliding, his weight thrown back against it, THE MAUL'S WEIGHT CARRIED ON ROUND HIM, swung low past
 * his right side to before him; his left hand comes to its butt (30); and up into his guard (42).
 */
function shoulderCharge(): AxeKey[] {
  const R = HAMMER_REST;
  const P = plantedFeet();
  // (his body in the drive: low, pitched forward, turned to his right so that his left shoulder leads)
  const driving: Partial<Bones> = { px: 2, pz: -8, yaw: -50, pitch: 26, twist: -12, bend: 12, faceUp: 18, faceTurn: 14, faceTilt: 0 };
  const trail = (body: Partial<Bones>, near: number, k = 0): Held => one({ ...body }, [-8 - k, -6, -15 + k], -172, -14, DOWN, near, free(9, -4, -7, -30), SLID - 2);
  const crouch: Partial<Bones> = { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 12, rk: 14, px: -1.4, pz: -11.5, yaw: -52, pitch: 18, twist: -14, bend: 14, faceUp: 14, faceTurn: 12, faceTilt: 0 };
  const k3 = trail(crouch, 180);
  const k6 = trail({ ...crouch, pz: -12.2, pitch: 20, bend: 15 }, k3.roll);
  // (the drive: his run's legs, a whole turn of it over the half second)
  const run = KNIGHT_RUN3.motion.keys;
  const n = run.length - 1;
  const legs = ['lfx', 'lfy', 'lfz', 'lfp', 'lft', 'lk', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'rk'] as const;
  const drive: AxeKey[] = [];
  for (let i = 1; i <= n; i++) {
    const f = HAMMER_CHARGE_GO + ((HAMMER_CHARGE_STOP - HAMMER_CHARGE_GO) * i) / n;
    const at = run[i].pose;
    const leg: Partial<Bones> = {};
    for (const l of legs) if (at[l] !== undefined) (leg as Record<string, number>)[l] = (at[l] as number) * 1.15;
    const bob = Math.sin((i / n) * Math.PI * 4) * 0.6;
    const h = trail({ ...leg, ...driving, pz: driving.pz! + bob }, k6.roll, bob);
    drive.push({ at: f * FR, pose: h.pose, grip: h.grip, ease: 'lin' });
  }
  // THE SKID: his front foot planted and sliding, his weight back; the maul carried on round his right side to before him
  const skidFeet: Partial<Bones> = { lfx: 18, lfy: 1, lfz: 0, lfp: -8, lft: 6, lk: 6, rfx: -10, rfy: -2, rfz: onToes(20), rfp: 20, rft: -30, rk: -14 };
  const k24 = one({ ...skidFeet, px: -2, pz: -10, yaw: -34, pitch: -2, twist: -20, bend: 2, faceUp: 4, faceTurn: 6 }, [0, -12, -14], -112, -10, DOWN, k6.roll, free(10, 6, -6, -10), SLID - 2);
  const k27 = hold({ ...skidFeet, px: 0, pz: -8.6, yaw: -18, pitch: 9, twist: -8, bend: 14, faceUp: -8, faceTurn: 0 }, [12, -2, 1], -34, -12, DOWN, k24.roll, SLID);
  // (his weight comes back over his feet; the maul swung on round his right side, both hands on it, and up behind him)
  const k31 = hold({ ...skidFeet, px: 1.2, pz: -6.6, yaw: -28, pitch: 7, twist: -18, bend: 11, faceUp: -4 }, [11, -3, 4], -92, -4, DOWN, k27.roll, SLID - 3);
  const k36 = hold({ lfx: R.lfx, lfy: R.lfy, lfz: 0, lfp: 0, lft: R.lft, lk: R.lk, rfx: -14, rfy: -1.2, rfz: 2.2, rfp: 6, rft: -40, rk: -30, px: 0.6, pz: -4.8, yaw: -36, pitch: 5, twist: -26, bend: 8, faceUp: -1 }, [10, -4, 6.5], -140, 8, DOWN, k31.roll, -3);
  return [
    { at: 0, pose: {} },
    // THE CROUCH, reached and HELD
    key(HAMMER_CHARGE_HELD, k3, 'out'),
    key(HAMMER_CHARGE_GO, k6, 'io'),
    // THE DRIVE
    ...drive,
    // THE SKID
    key(25, k24, 'out'),
    key(HAMMER_CHARGE_SKID, k27, 'io'),
    key(31, k31, 'io'),
    key(36, k36, 'io'),
    { at: HAMMER_CHARGE_END * FR, pose: { wRoll: Math.round((k36.roll - 180) / 360) * 360 + 180 }, ease: 'out' },
  ];
}
export const HAMMER_CHARGE: AxeMove = maul({
  name: 'Shoulder Charge', keys: shoulderCharge(), hit: HAMMER_CHARGE_GO * FR, carried: chargeCarried,
  holding: () => ({ axe: true, twin: false }),
});
/** (the frames of the charge in which the game carries him: his feet may slide there) */
export function chargeCarriedFrame(i: number): boolean {
  return i > HAMMER_CHARGE_GO && i <= HAMMER_CHARGE_SKID;
}

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
  hstand: HAMMER_STAND, hrun: HAMMER_RUN, smash: HAMMER_SMASH, smash2: HAMMER_SMASH2, quake: HAMMER_QUAKE, charge: HAMMER_CHARGE,
};

// ---------------------------------------------------------------------------------------------
// AS THE GAME WOULD HOLD THEM (for the bake, tools/bake_heroes.mjs, and the film): each move's frames as the lists the game
// holds a hero's in (art/actor_types.ts AnimSet), in the shape his war axe's are (art/warrior_up_axe_moves.ts makeWarriorAxeArt).

const FPS = 30;
/** How many pictures of the drive the game spreads over it, by how far through he is (as his Lunge's and the Leaping Chop's). */
export const HAMMER_DRIVE_FRAMES = 16;

function setOf(side: WuSide): AnimSet {
  const at = (m: AxeMove, t: number): Sprite => axeSprite(m, t, side);
  const end = (m: AxeMove): number => m.keys[m.keys.length - 1].at;
  const round = (m: AxeMove): Sprite[] => {
    const t0 = m.loop ?? 0;
    const n = Math.max(1, Math.round((end(m) - t0) * FPS));
    return lazyFrames(n, (i) => at(m, t0 + i / FPS));
  };
  const clip = (m: AxeMove, t0 = 0, t1 = end(m)): Clip => {
    const n = Math.max(1, Math.round((t1 - t0) * FPS) + 1);
    const c: Clip = { frames: lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / FPS))), fps: FPS };
    if (m.hit !== undefined && m.hit >= t0 - 1e-6 && m.hit <= t1 + 1e-6) c.hit = m.hit - t0;
    if (m.tail) c.tail = true;
    if (m.poise !== undefined && m.poise >= t0 && m.poise <= t1) c.poise = m.poise - t0;
    return c;
  };
  const spread = (m: AxeMove, n: number, t0: number, t1: number): Clip => ({ frames: lazyFrames(n, (i) => at(m, t0 + ((t1 - t0) * i) / (n - 1))), fps: (n - 1) / Math.max(1e-6, t1 - t0) });
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(HAMMER_SMASH);
  const heavy = clip(HAMMER_QUAKE);
  const go = HAMMER_CHARGE_GO * FR;
  const stop = HAMMER_CHARGE_STOP * FR;
  const leap = spread(HAMMER_CHARGE, HAMMER_DRIVE_FRAMES, go, stop);
  return {
    idle: round(HAMMER_STAND),
    walk: round(HAMMER_RUN),
    attack: three(attack),
    heavy: three(heavy),
    leap: lazyFrames(3, (i) => leap.frames[Math.round([0.05, 0.45, 0.9][i] * (HAMMER_DRIVE_FRAMES - 1))]),
    idleFps: FPS,
    walkFps: FPS,
    clips: {
      // SMASH: the first blow (it waits at its `poise`, the maul on the floor, while a second tap may come) and the second
      attack,
      attack2: clip(HAMMER_SMASH2),
      // EARTHQUAKE (and TREMORS: the same frames; the game rolls out the three rings)
      heavy,
      // SHOULDER CHARGE: the drive by how far through he is (16 pictures), the skid and back to his guard; its crouch below
      leap,
      land: clip(HAMMER_CHARGE, stop),
      moves: { chargeCrouch: clip(HAMMER_CHARGE, 0, go) },
    },
  };
}

/**
 * HIS PICTURES WITH THE MAUL, in a dungeon, from all eight of his sides, each an AnimSet of the very same lists, each side's
 * made when first asked for and each frame painted when first read (his struck, his fall, town and his card with it:
 * art/warrior_up_heavy_art.ts).
 */
export function makeWarriorHammerArt(): Record<WuSide, AnimSet> {
  const out = {} as Record<WuSide, AnimSet>;
  for (const side of WU_SIDES) Object.defineProperty(out, side, { enumerable: true, configurable: true, get: () => {
    const set = setOf(side);
    Object.defineProperty(out, side, { value: set, enumerable: true });
    return set;
  } });
  return out;
}

export { FR as HAMMER_FRAME };
