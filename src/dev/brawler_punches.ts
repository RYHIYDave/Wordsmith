// THE BRAWLER'S PUNCHES AND HIS COMBOS (a mock-up; nothing of the game imports it).
//
// His words, 24 Oct 2026 (Pacific), asked what his tap, tap and hold and swipe should be: “I want him to have combos
// using his tap and tap+hold.  So maybe tap is jab and tap+hold is cross.  Then tap>tap>tap+hold would be the combo
// you’re talking about”; his slow attack, “Haymaker (Recommended)”; his swipe, “Slip and counter (Recommended)”; then
// “Yeah but let’s make it all three hit combos, so tap, tap, tap is a combo, tap, tap, tap+hold is a different combo”;
// and how they are built, “By position (Recommended)”, offered as: 1st hit, tap jab, hold cross; 2nd, tap hook, hold
// body blow; 3rd, tap uppercut, hold haymaker; any mix a combo, 8 in all, from 6 punches.
//   So (told him so): each punch comes off the other hand from the one before, as a boxer's combos flow; the haymaker is
// always his big right. The first two hits land quick and light; the third has the freeze, the big shockwave and the
// screen kick (his brief, 23 Oct: “Bone-crunching (Recommended)”, offered as fewer, huge blows, a freeze, a shockwave
// and a screen kick on each).
//   THEIR JOBS (asked why you would use one over the other, his pick: “One target vs a crowd (Recommended)”, offered
// as: taps, fastest damage on one enemy, any hit can cancel into the slip, and the uppercut pops it up stunned; holds,
// slow and open to hits, but every blow knocks back, the body blow staggers a group, and the cannonball fires the enemy
// through a whole line): so the body blow's burst runs out along the floor round him.
//   THEIR NAMES (shown a film of the two with each punch's name over him, asked what was off, by 20:58: “Too cluttered
// (Recommended),Haymaker needs to be the name of the heaviest hit”): so the launching finisher of hold, hold, hold,
// the art chat's “cannonball” till then, is THE HAYMAKER; and the other third-hit hold, asked its name, his pick:
// “Overhand (Recommended)”, THE OVERHAND.
//   Each winds up and follows through (Movement 3); each blow plants his feet, turns his hips and carries through
// (Movement 1): his feet stay where they stand, the one under the punching side turning up on its ball. In a combo a
// punch is cut off where its blow has carried through, and the next is wound up from there.

import { bonesAt, project, solve } from '../art/skeleton';
import type { Posed, V3 } from '../art/skeleton';
import type { Bones, Key3, Motion } from '../art/skeleton';
import { BRAWLER_B, FR, GUARD, T, onBall } from './brawler_moves';
import type { BlowAt, BrawlerMove } from './brawler_moves';

type Hand = 'L' | 'R';
/**
 * HOW FAR HIS BODY GOES INTO A PUNCH, over the numbers each punch is written with (his, of the second films: “Too small,
 * not wild”, then “Closer, push further”): his turns, lunges, sinks and leans all so much the bigger.
 */
const WILD = 1.3;
const other = (h: Hand): Hand => (h === 'L' ? 'R' : 'L');

/**
 * His body for a punch with the hand `h`, as so much over and above his guard: `drive`, how far his chest is turned INTO
 * the punch (his left turns it to his right, his right to his left; less than 0, turned away to load it), `yawDrive` the
 * same of his hips; `px` forward; `pyOut` his weight shifted toward the punching side; `dz` up; `dip` his body bent toward
 * the punching side; `pitch` his hips tipped forward (as it is, not over his guard's).
 */
function body(h: Hand, o: { drive?: number; yawDrive?: number; px?: number; pyOut?: number; dz?: number; bend?: number; pitch?: number; dip?: number; faceUp?: number }): Partial<Bones> {
  const s = h === 'L' ? -1 : 1;
  const w = WILD;
  const out: Partial<Bones> = {
    twist: GUARD.twist + s * (o.drive ?? 0) * w,
    yaw: GUARD.yaw + s * (o.yawDrive ?? 0) * w,
    px: (o.px ?? 0) * T * w,
    py: -s * (o.pyOut ?? 0) * T * w,
    pz: GUARD.pz + (o.dz ?? 0) * T * w,
    bend: GUARD.bend + (o.bend ?? 0) * w,
    side: (GUARD.side ?? 0) - s * (o.dip ?? 0) * w,
  };
  if (o.pitch !== undefined) out.pitch = o.pitch * w;
  if (o.faceUp !== undefined) out.faceUp = o.faceUp;
  return out;
}
/** The punching fist, from its shoulder along his chest: `x` forward, `yIn` in across him (less than 0, out to its side), `z` up (in his measure); its elbow swung as `elbow`. */
function fist(h: Hand, x: number, yIn: number, z: number, elbow: number): Partial<Bones> {
  return h === 'L' ? { lhIn: 0, lhx: x * T, lhy: -yIn * T, lhz: z * T, le: elbow } : { rhIn: 0, rhx: x * T, rhy: yIn * T, rhz: z * T, re: elbow };
}
/** The fist straight out at `reach` of his arm's length. */
const ARM = (BRAWLER_B.upperArm + BRAWLER_B.foreArm) / T;
/** The other fist in its guard, raised by `raise` (and moved by `dx` forward). */
function guardOther(h: Hand, raise: number, dx = 0): Partial<Bones> {
  return h === 'L' ? { rhz: GUARD.rhz + raise * T, rhx: GUARD.rhx + dx * T } : { lhz: GUARD.lhz + raise * T, lhx: GUARD.lhx + dx * T };
}
/** The foot under the side `h` up on its ball, its heel `pitch` degrees up and the foot turned `turn` in toward the punch, over the pose `q`. */
function pivot(h: Hand, pitch: number, turn: number, q: Partial<Bones>): Partial<Bones> {
  return onBall(h === 'R', pitch, h === 'R' ? turn : -turn, q);
}
/** A key: the body, the fist, the other fist and the turning foot together. */
function key(at: number, ease: Key3['ease'], h: Hand, b: Partial<Bones>, f: Partial<Bones>, o: Partial<Bones>, foot?: [number, number]): Key3 {
  const pose = { ...b, ...f, ...o };
  return { at: at * FR, ease, pose: foot ? { ...pose, ...pivot(h, foot[0], foot[1], pose) } : pose };
}

/** One punch, from his guard back to it: its keys, the moment it lands, where a combo may cut it off, where its wind-up is reached, how long it is, what bursts off it, and when (if ever) he is off the floor. */
export interface Punch {
  name: string;
  hand: Hand;
  keys: Key3[];
  hit: number;
  cut: number;
  wind: number;
  long: number;
  blow: { size: number; floor?: boolean; roll?: boolean; heavy?: boolean; launch?: boolean; charge?: [number, number]; strike?: number };
  air?: [number, number];
}

// THE TAPS: QUICK AND LIGHT (his: “I need a three tap combo to be much different than a three hold combo”): a fast,
// snappy flurry, each landing in four or five frames, the last a wild leaping uppercut.

/** THE JAB (1st tap), his left: a flick of a cock, then the fist snapped straight out, his left shoulder driven forward and his chin behind it; snapped back. Lands at the fourth frame. */
function jab(): Punch {
  const h: Hand = 'L';
  return {
    name: 'jab', hand: h, hit: 4 * FR, cut: 6 * FR, wind: 3 * FR, long: 12 * FR, blow: { size: 13, strike: 1 * FR },
    keys: [
      { at: 0, pose: {} },
      { at: 3 * FR, ease: 'io', pose: { ...body(h, { drive: -10, px: -1.0, dz: -0.9, bend: 3 }), lhx: GUARD.lhx - 2.0 * T, lhz: GUARD.lhz + 1.8 * T, ...guardOther(h, 1.6) } },
      key(4, 'lin', h, body(h, { drive: 22, yawDrive: 10, px: 3.4, dz: -1.2, bend: 8, faceUp: -3 }), fist(h, ARM * 0.92, 1.6, 5.4, GUARD.le), guardOther(h, 1.6)),
      key(6, 'out', h, body(h, { drive: 25, yawDrive: 11, px: 3.9, dz: -1.3, bend: 9, faceUp: -3 }), fist(h, ARM * 0.95, 1.6, 5.4, GUARD.le), guardOther(h, 1.6)),
      key(9, 'io', h, body(h, { drive: 12, yawDrive: 5, px: 2.0, dz: -0.8, bend: 5 }), fist(h, ARM * 0.55, 1.0, GUARD.lhz / T + 2.4, GUARD.le), guardOther(h, 1.2)),
      { at: 12 * FR, ease: 'io', pose: {} },
    ],
  };
}

/** THE HOOK (2nd tap): a quick coil toward the punching side, then the hips whip round, that foot turning on its ball, and the fist comes round flat at the height of a jaw, his elbow up level with it; carried on through across him. Lands at the fifth frame. */
function hook(h: Hand): Punch {
  return {
    name: `hook (${h === 'L' ? 'left' : 'right'})`, hand: h, hit: 5 * FR, cut: 7 * FR, wind: 4 * FR, long: 15 * FR, blow: { size: 16, strike: 1 * FR },
    keys: [
      { at: 0, pose: {} },
      // (the left, his lead, coils less far: it is already forward)
      key(4, 'io', h, body(h, { drive: h === 'L' ? -13 : -19, yawDrive: h === 'L' ? -9 : -14, px: -1.6, pyOut: 0.8, dz: -2.3, bend: 6, dip: 6 }), fist(h, h === 'L' ? 4.2 : 2.0, h === 'L' ? -2.6 : -4.5, 0.8, -24), guardOther(h, 1.5), [0, 0]),
      key(4.5, 'lin', h, body(h, { drive: 8, yawDrive: 10, px: 0.4, pyOut: 0.1, dz: -2.0, bend: 6 }), fist(h, 9.0, -1.5, 2.0, -30), guardOther(h, 1.5), [18, 12]),
      key(5, 'lin', h, body(h, { drive: 28, yawDrive: 26, px: 2.0, pyOut: -0.5, dz: -1.6, bend: 6, dip: -4, faceUp: -2 }), fist(h, 11.5, 6.5, 2.4, -30), guardOther(h, 1.5), [34, 24]),
      key(7, 'out', h, body(h, { drive: 38, yawDrive: 34, px: 2.4, pyOut: -0.5, dz: -1.7, bend: 7, dip: -5, faceUp: -2 }), fist(h, 10.0, 10.0, 2.2, -30), guardOther(h, 1.5), [38, 28]),
      key(10, 'io', h, body(h, { drive: 36, yawDrive: 32, px: 2.3, pyOut: -0.5, dz: -1.6, bend: 6, dip: -4, faceUp: -2 }), fist(h, 9.6, 10.4, 2.2, -30), guardOther(h, 1.5), [38, 28]),
      { at: 15 * FR, ease: 'io', pose: {} },
    ],
  };
}

/** THE UPPERCUT, LEAPING (3rd tap): he drops low, dipped toward the punching side, the fist sunk by his hip; then everything drives up at once and he LEAPS, the fist ripping up through the middle of him and on up over his head, both feet off the floor, his head thrown back after it, the other fist pulled down to his ribs; he hangs at the top; and comes down heavy, sinking into his guard. Lands at the seventh frame. */
function uppercut(h: Hand): Punch {
  const pulled = h === 'L' ? { rhz: GUARD.rhz - 4 * T, rhx: GUARD.rhx - 2 * T } : { lhz: GUARD.lhz - 4 * T, lhx: GUARD.lhx - 2 * T };
  /** both feet up off the floor by `up`, toes hanging down by `toes` degrees */
  const feet = (up: number, toes: number): Partial<Bones> => ({ lfz: GUARD.lfz + up * T, rfz: GUARD.rfz + up * T, lfp: toes, rfp: toes });
  const k = (at: number, ease: Key3['ease'], b: Partial<Bones>, f: Partial<Bones>, o: Partial<Bones>, ft: Partial<Bones> = {}): Key3 => ({ at: at * FR, ease, pose: { ...b, ...f, ...o, ...ft } });
  return {
    name: `uppercut (${h === 'L' ? 'left' : 'right'})`, hand: h, hit: 7 * FR, cut: 11 * FR, wind: 5 * FR, long: 23 * FR, blow: { size: 32, floor: true, heavy: true, strike: 1 * FR },
    air: [6.4 * FR, 11.8 * FR],
    keys: [
      { at: 0, pose: {} },
      k(5, 'io', body(h, { drive: -16, yawDrive: -12, px: -0.6, dz: -7.0, bend: 18, pitch: 7, dip: 10, faceUp: 6 }), fist(h, 8.0, 0, -10, 20), guardOther(h, 2.0)),
      k(6, 'in', body(h, { drive: -16, yawDrive: -12, px: -0.6, dz: -7.2, bend: 18, pitch: 7, dip: 10, faceUp: 6 }), fist(h, 8.0, 0, -9, 20), guardOther(h, 2.0)),
      k(6.5, 'lin', body(h, { drive: 2, yawDrive: 0, px: 0.8, dz: -1.6, bend: 8, pitch: 2, dip: 4, faceUp: 8 }), fist(h, 9.5, 1.2, 3.0, 70), guardOther(h, -1.0)),
      k(7, 'lin', body(h, { drive: 24, yawDrive: 12, px: 1.8, dz: 5.0, bend: -8, pitch: -5, dip: -6, faceUp: 18 }), fist(h, 7.0, 1.8, 15, 110), pulled, feet(3.0, 0)),
      k(9, 'out', body(h, { drive: 26, yawDrive: 13, px: 1.9, dz: 6.6, bend: -10, pitch: -9, dip: -6, faceUp: 24 }), fist(h, 6.0, 1.8, 17, 140), pulled, feet(4.2, 30)),
      k(11, 'in', body(h, { drive: 20, yawDrive: 10, px: 1.6, dz: 2.6, bend: -4, pitch: -4, dip: -4, faceUp: 14 }), fist(h, 6.5, 1.8, 14, 130), pulled, feet(1.4, 0)),
      // (down heavy: he sinks deep as he lands)
      k(12, 'in', body(h, { drive: 12, yawDrive: 6, px: 1.2, dz: -1.0, bend: 6, pitch: 2, faceUp: 6 }), h === 'L' ? { lhx: GUARD.lhx + 1 * T, lhz: GUARD.lhz + 4 * T, le: 60 } : { rhx: GUARD.rhx + 1 * T, rhz: GUARD.rhz + 4 * T, re: 60 }, {}, feet(0, 0)),
      k(14, 'out', body(h, { drive: 6, yawDrive: 3, px: 0.8, dz: -4.2, bend: 12, pitch: 5 }), h === 'L' ? { lhx: GUARD.lhx + 1 * T, lhz: GUARD.lhz + 3 * T, le: 40 } : { rhx: GUARD.rhx + 1 * T, rhz: GUARD.rhz + 3 * T, re: 40 }, {}),
      { at: 23 * FR, ease: 'io', pose: {} },
    ],
  };
}

// THE HOLDS: SLOW AND HEAVY, EACH HARDER THAN THE LAST (his: “What happens when you just tap+hold?  I feel like that should
// have some weight.  Then hold, hold should be stronger.  Hold, hold, hold should be a massive slow combo that ends with
// some crazy punch that like sends whatever it hits out like a projectile or something”): every one wound up long and
// landing with the freeze, the burst bigger at each.

/** THE CROSS (1st hold), his right, HEAVY: he sinks back onto his rear leg, coiled, his right fist drawn back by his jaw, and holds it; then drives it straight through from behind him with everything, his hips and chest whipped round past square and his back heel high. Lands at the tenth frame. */
function crossPunch(): Punch {
  const h: Hand = 'R';
  return {
    name: 'cross', hand: h, hit: 10 * FR, cut: 13 * FR, wind: 6 * FR, long: 24 * FR, blow: { size: 20, heavy: true, strike: 1 * FR },
    keys: [
      { at: 0, pose: {} },
      key(6, 'io', h, body(h, { drive: -22, yawDrive: -12, px: -1.4, pyOut: 0.8, dz: -1.8, bend: 3, pitch: -2 }), fist(h, 3.5, -1.5, 3.0, GUARD.re), guardOther(h, 1.5), [0, 0]),
      key(9, 'io', h, body(h, { drive: -26, yawDrive: -14, px: -1.6, pyOut: 0.9, dz: -2.0, bend: 3, pitch: -3 }), fist(h, 2.8, -1.8, 3.2, GUARD.re), guardOther(h, 1.6), [0, 0]),
      key(9.5, 'lin', h, body(h, { drive: 4, yawDrive: 4, px: 1.0, dz: -1.9, bend: 5 }), fist(h, ARM * 0.6, 1.0, 4.4, GUARD.re), guardOther(h, 1.6), [16, 10]),
      key(10, 'lin', h, body(h, { drive: 36, yawDrive: 22, px: 4.0, pyOut: -0.4, dz: -2.2, bend: 10, faceUp: -4 }), fist(h, ARM * 0.95, 2.4, 5.0, GUARD.re), guardOther(h, 1.6), [36, 26]),
      key(13, 'out', h, body(h, { drive: 40, yawDrive: 24, px: 4.4, pyOut: -0.4, dz: -2.2, bend: 10, faceUp: -4 }), fist(h, ARM * 0.97, 2.4, 5.0, GUARD.re), guardOther(h, 1.6), [38, 28]),
      key(16, 'io', h, body(h, { drive: 38, yawDrive: 23, px: 4.2, pyOut: -0.4, dz: -2.0, bend: 9, faceUp: -3 }), fist(h, ARM * 0.9, 2.2, 5.0, GUARD.re), guardOther(h, 1.4), [36, 26]),
      { at: 24 * FR, ease: 'io', pose: {} },
    ],
  };
}

/** THE BODY BLOW (2nd hold), HEAVY AND HARDER: he drops his level deep, bent toward the punching side, coiled and held; then digs the fist in low and hooking up into the ribs of whatever is before him, all his turn behind it, that foot turning on its ball; carried on through. Lands at the tenth frame. */
function bodyBlow(h: Hand): Punch {
  return {
    name: `body blow (${h === 'L' ? 'left' : 'right'})`, hand: h, hit: 10 * FR, cut: 13 * FR, wind: 6 * FR, long: 24 * FR, blow: { size: 26, heavy: true, floor: true, strike: 1 * FR },
    keys: [
      { at: 0, pose: {} },
      key(6, 'io', h, body(h, { drive: -22, yawDrive: -14, px: -0.8, pyOut: 0.8, dz: -4.5, bend: 10, dip: 8 }), fist(h, 2.5, -3.5, -6.5, 10), guardOther(h, 1.6), [0, 0]),
      key(9, 'io', h, body(h, { drive: -26, yawDrive: -16, px: -1.0, pyOut: 0.9, dz: -5.0, bend: 11, dip: 9 }), fist(h, 2.2, -3.8, -6.8, 10), guardOther(h, 1.7), [0, 0]),
      key(9.5, 'lin', h, body(h, { drive: 6, yawDrive: 6, px: 0.8, dz: -5.2, bend: 14, dip: 5 }), fist(h, 8.5, 0, -7.5, 0), guardOther(h, 1.7), [16, 10]),
      key(10, 'lin', h, body(h, { drive: 30, yawDrive: 24, px: 2.4, pyOut: -0.4, dz: -5.6, bend: 16, dip: 2, faceUp: -5 }), fist(h, 11.5, 5.5, -6.5, -10), guardOther(h, 1.7), [34, 24]),
      key(13, 'out', h, body(h, { drive: 38, yawDrive: 28, px: 2.7, pyOut: -0.4, dz: -5.6, bend: 16, dip: 2, faceUp: -5 }), fist(h, 10.5, 8.5, -5.0, -10), guardOther(h, 1.7), [38, 28]),
      key(16, 'io', h, body(h, { drive: 38, yawDrive: 28, px: 2.7, pyOut: -0.4, dz: -5.4, bend: 15, dip: 2, faceUp: -5 }), fist(h, 10.0, 9.0, -4.6, -10), guardOther(h, 1.6), [38, 28]),
      { at: 24 * FR, ease: 'io', pose: {} },
    ],
  };
}

/** THE OVERHAND (3rd hold, not after two holds; his pick of its name, “Overhand (Recommended)”), his right: he rears right back, his right fist drawn back high behind his head and his left reaching out to measure, and holds it cocked; then it comes round over the top and down through whatever is there with all of him behind it, his hips and chest whipped round past square, his back heel high, a wave rolled out along the floor ahead of him. Lands at the thirteenth frame. */
function overhand(): Punch {
  const h: Hand = 'R';
  const reach = (x: number, y: number, z: number): Partial<Bones> => ({ lhIn: 0, lhx: x * T, lhy: y * T, lhz: z * T, le: GUARD.le });
  return {
    name: 'overhand', hand: h, hit: 12 * FR, cut: 15 * FR, wind: 6 * FR, long: 29 * FR, blow: { size: 36, roll: true, heavy: true, strike: 1 * FR },
    keys: [
      { at: 0, pose: {} },
      key(6, 'io', h, body(h, { drive: -34, yawDrive: -18, px: -2.0, pyOut: 0.9, dz: -1.4, bend: -5, pitch: -7, dip: 7, faceUp: 4 }), fist(h, -3.5, -3.2, 7.5, 120), reach(11, -1, 3), [0, 0]),
      key(8, 'io', h, body(h, { drive: -38, yawDrive: -20, px: -2.2, pyOut: 1.0, dz: -1.6, bend: -6, pitch: -8, dip: 8, faceUp: 4 }), fist(h, -4.5, -3.4, 8.5, 120), reach(11.5, -1, 3), [0, 0]),
      // (cocked: he holds it at the top, all of him drawn back)
      key(11, 'lin', h, body(h, { drive: -38, yawDrive: -20, px: -2.2, pyOut: 1.0, dz: -1.6, bend: -6, pitch: -8, dip: 8, faceUp: 4 }), fist(h, -4.5, -3.4, 8.5, 120), reach(11.5, -1, 3), [0, 0]),
      key(11.5, 'lin', h, body(h, { drive: 2, yawDrive: 4, px: 1.2, dz: -1.8, bend: 4, pitch: 2, dip: 2 }), fist(h, 6.0, 0, 9.5, 45), reach(10.5, -0.7, 2.4), [16, 10]),
      key(12, 'lin', h, body(h, { drive: 42, yawDrive: 28, px: 4.4, pyOut: -0.6, dz: -3.0, bend: 14, pitch: 12, dip: -4, faceUp: -6 }), fist(h, ARM * 0.88, 3.0, 1.0, 0), reach(7.6, -0.4, 1.2), [42, 30]),
      key(15, 'out', h, body(h, { drive: 50, yawDrive: 32, px: 5.0, pyOut: -0.6, dz: -3.2, bend: 18, pitch: 15, dip: -4, faceUp: -6 }), fist(h, ARM * 0.82, 6.5, -4.5, 0), reach(7.3, -0.4, 1.1), [44, 32]),
      key(19, 'io', h, body(h, { drive: 50, yawDrive: 32, px: 5.0, pyOut: -0.6, dz: -3.2, bend: 18, pitch: 15, dip: -4, faceUp: -6 }), fist(h, ARM * 0.8, 6.5, -5.0, 0), reach(7.0, -0.4, 1.0), [44, 32]),
      key(24, 'io', h, body(h, { drive: 8, px: 1.0, dz: -1.0, bend: 4 }), {}, guardOther(h, 0.6), [10, 8]),
      { at: 29 * FR, ease: 'io', pose: {} },
    ],
  };
}

/**
 * THE HAYMAKER (3rd hold after two holds; his: “Haymaker needs to be the name of the heaviest hit”): the massive one. He coils right round, his back half turned, his right fist
 * cocked by his jaw and his left arm out straight before him, sighting along it; his lead foot comes up off the
 * floor, and he holds it there, gathered; then the foot stamps down a stride ahead and he drives the fist straight
 * through with every ounce of him, his hips and chest whipped round past square, his back heel high,
 * his whole body following the fist out. Whatever it hits is blasted away like a cannonball (dev/brawler_fx.ts). Lands at
 * the eighteenth frame.
 */
function haymaker(): Punch {
  const h: Hand = 'R';
  const reach = (x: number, y: number, z: number): Partial<Bones> => ({ lhIn: 0, lhx: x * T, lhy: y * T, lhz: z * T, le: GUARD.le });
  const lead = (dx: number, up: number): Partial<Bones> => ({ lfx: GUARD.lfx + dx * T, lfz: GUARD.lfz + up * T, lfp: up > 0 ? -6 : 0 });
  const coil = body(h, { drive: -50, yawDrive: -26, px: -2.4, pyOut: 1.0, dz: -3.0, bend: 6, pitch: -3, dip: 8, faceUp: 2 });
  const deep = body(h, { drive: -56, yawDrive: -30, px: -2.6, pyOut: 1.1, dz: -3.6, bend: 7, pitch: -4, dip: 9, faceUp: 2 });
  const hit = body(h, { drive: 52, yawDrive: 34, px: 6.5, pyOut: -0.6, dz: -3.4, bend: 14, pitch: 10, faceUp: -4 });
  const out = body(h, { drive: 58, yawDrive: 36, px: 7.0, pyOut: -0.6, dz: -3.4, bend: 16, pitch: 12, faceUp: -4 });
  return {
    name: 'haymaker', hand: h, hit: 16 * FR, cut: 20 * FR, wind: 8 * FR, long: 40 * FR, blow: { size: 46, roll: true, heavy: true, launch: true, charge: [5 * FR, 15 * FR], strike: 1.5 * FR },
    keys: [
      { at: 0, pose: {} },
      // (the lead foot lifted first, where it stands, then drawn in a little as he coils)
      key(4, 'io', h, body(h, { drive: -24, yawDrive: -12, px: -1.2, pyOut: 0.5, dz: -1.6, bend: 3, dip: 4 }), fist(h, 3.5, -1.8, 2.4, GUARD.re), { ...reach(10, -0.5, 3), ...lead(0, 1.4) }, [0, 0]),
      key(8, 'io', h, coil, fist(h, 1.2, -2.2, 2.2, GUARD.re), { ...reach(13, -0.5, 4), ...lead(-0.6, 1.8) }, [0, 0]),
      key(13, 'io', h, deep, fist(h, 0.8, -2.4, 2.4, GUARD.re), { ...reach(13.5, -0.5, 4.2), ...lead(-0.8, 2.2) }, [0, 0]),
      // (the stamp: the foot comes down a stride ahead as the drive begins)
      key(14.5, 'in', h, body(h, { drive: -24, yawDrive: -12, px: 1.0, pyOut: 0.6, dz: -3.6, bend: 9, pitch: 2, dip: 6 }), fist(h, 2.2, -2.0, 2.6, GUARD.re), { ...reach(12, -0.5, 3.6), ...lead(5.0, 1.0) }, [6, 4]),
      key(15, 'lin', h, body(h, { drive: -10, yawDrive: -5, px: 2.2, pyOut: 0.4, dz: -3.8, bend: 10, pitch: 4, dip: 4 }), fist(h, ARM * 0.35, -0.6, 3.0, GUARD.re), { ...reach(10, -0.5, 3), ...lead(5.0, 0) }, [10, 6]),
      key(15.5, 'lin', h, body(h, { drive: 20, yawDrive: 14, px: 4.2, dz: -3.4, bend: 12, pitch: 6 }), fist(h, ARM * 0.66, 1.0, 3.4, GUARD.re), { ...reach(7.5, -0.3, 2.2), ...lead(5.0, 0) }, [24, 16]),
      key(16, 'lin', h, hit, fist(h, ARM * 0.97, 2.4, 3.5, GUARD.re), { ...reach(6.2, -0.2, 1.6), ...lead(5.0, 0) }, [44, 32]),
      key(20, 'out', h, out, fist(h, ARM * 0.99, 2.4, 3.5, GUARD.re), { ...reach(5.9, -0.2, 1.5), ...lead(5.0, 0) }, [46, 34]),
      key(26, 'io', h, out, fist(h, ARM * 0.96, 2.4, 3.2, GUARD.re), { ...reach(5.6, -0.2, 1.4), ...lead(5.0, 0) }, [44, 32]),
      // (and back: the lead foot lifted where it stands, then stepped home)
      key(29, 'io', h, body(h, { drive: 24, yawDrive: 16, px: 4.0, dz: -2.4, bend: 8, pitch: 4 }), fist(h, ARM * 0.7, 2.0, 3.0, GUARD.re), { ...guardOther(h, 0.8), ...lead(5.0, 1.4) }, [24, 16]),
      key(33, 'io', h, body(h, { drive: 8, yawDrive: 4, px: 1.4, dz: -1.4, bend: 4 }), {}, { ...guardOther(h, 0.6), ...lead(1.0, 1.2) }, [8, 6]),
      key(35, 'in', h, body(h, { px: 0.6, dz: -1.6, bend: 3 }), {}, { ...guardOther(h, 0.4), ...lead(0, 0) }),
      { at: 40 * FR, ease: 'io', pose: {} },
    ],
  };
}

/**
 * THE SLIP AND COUNTER, his swipe (his pick, “Slip and counter (Recommended)”, offered as: he ducks and weaves the way you
 * swipe, nothing can hit him, then throws a counter hook at whatever is there; how far, told the other heroes' swipes carry
 * them up to 6 tiles, his pick: “Weaving dash, same reach (Recommended)”, offered as: he bobs and weaves low up to 6 tiles
 * the way you swipe, untouchable, and comes up with a counter hook into whatever is there).
 *   He SLIPS, his head snapped off the line to his right, his fists up tight by his temples, and drops on down into a
 * deep bob; then the WEAVE is a flash (Movement 9, “Big wind-up, lightning strike”): low, his feet off the floor, he
 * weaves under and across to his left as the game carries him the whole way (`dash`); he lands deep, coiled to his left,
 * holds it, and comes up out of it with the left hook, rising through it. Lands at the thirteenth frame. Shown in a film, his
 * answer by 06:57, 25 Oct: “Good, keep it (Recommended)”.
 */
export const SLIP_DASH: [number, number] = [6.4 * FR, 9.9 * FR];
export function slipCounter(): { motion: Motion; long: number; blows: BlowAt[]; air: [number, number][]; dash: [number, number] } {
  const h: Hand = 'L';
  const tight = (raise = 0): Partial<Bones> => ({ lhIn: 0, lhx: 7.0 * T, lhy: 0.9 * T, lhz: (4.2 + raise) * T, le: 100, rhIn: 0, rhx: 5.0 * T, rhy: -0.8 * T, rhz: (4.6 + raise) * T, re: 100 });
  const right = (raise = 0): Partial<Bones> => ({ rhIn: 0, rhx: 5.0 * T, rhy: -0.8 * T, rhz: (4.6 + raise) * T, re: 100 });
  const feet = (up: number, toes = 0): Partial<Bones> => ({ lfz: GUARD.lfz + up * T, rfz: GUARD.rfz + up * T, lfp: toes, rfp: toes, lk: (GUARD.lk ?? 0) + up * 6, rk: (GUARD.rk ?? 0) - up * 6 });
  const k = (at: number, ease: Key3['ease'], ...parts: Partial<Bones>[]): Key3 => ({ at: at * FR, ease, pose: Object.assign({}, ...parts) });
  const coiled = body(h, { drive: -16, yawDrive: -10, px: -0.4, pyOut: 0.8, dz: -6.4, bend: 14, dip: 9, faceUp: 6 });
  const cocked = fist(h, 4.0, -2.6, -0.6, -24);
  const keys: Key3[] = [
    { at: 0, pose: {} },
    // (the slip: his head off the line to his right, his fists snapped up by his temples)
    k(3, 'in', body(h, { drive: 6, px: -0.4, dz: -2.4, bend: 6, dip: -8, faceUp: 2 }), tight(), feet(0)),
    // (the bob: on down, deep under whatever comes, his chin tucked, slowing into it)
    k(6, 'out', body(h, { drive: 2, px: 0.4, dz: -6.5, bend: 17, pitch: 6, dip: -2, faceUp: 6 }), tight(-0.8), feet(0)),
    // (THE WEAVE, a flash: off the floor, under and across to his left, carried the whole way)
    k(6.5, 'lin', body(h, { drive: 4, px: 0.6, pyOut: -1.6, dz: -3.4, bend: 12, pitch: 5, dip: -10, faceUp: 6 }), tight(-0.4), feet(1.3, 10)),
    k(7.5, 'lin', body(h, { drive: 0, px: 0.6, dz: -9.0, bend: 22, pitch: 9, dip: 1, faceUp: 8 }), tight(-1.2), feet(1.8, 14)),
    k(8.5, 'lin', body(h, { drive: -8, px: 0.4, pyOut: 1.6, dz: -4.6, bend: 14, pitch: 6, dip: 12, faceUp: 6 }), tight(-0.5), feet(1.5, 12)),
    k(9.5, 'lin', body(h, { drive: -12, yawDrive: -6, px: 0, pyOut: 0.5, dz: -6.2, bend: 15, dip: 10, faceUp: 6 }), tight(-0.4), feet(0.9, 6)),
    // (down, deep and coiled to his left, held: the hook loaded)
    k(10, 'in', coiled, cocked, right(), feet(0)),
    k(12, 'lin', body(h, { drive: -18, yawDrive: -11, px: -0.4, pyOut: 0.85, dz: -6.8, bend: 15, dip: 9.5, faceUp: 6 }), cocked, right(0.2), feet(0)),
    // (THE COUNTER: up out of the crouch with the left hook, lightning quick)
    key(12.5, 'lin', h, body(h, { drive: 8, yawDrive: 10, px: 0.6, pyOut: 0.1, dz: -3.6, bend: 9, dip: 4 }), fist(h, 9.0, -1.5, 1.6, -30), right(0.2), [18, 12]),
    key(13, 'lin', h, body(h, { drive: 30, yawDrive: 26, px: 2.2, pyOut: -0.5, dz: -1.4, bend: 4, dip: -4, faceUp: -2 }), fist(h, 11.5, 6.5, 3.0, -30), guardOther(h, 1.5), [34, 24]),
    key(15, 'out', h, body(h, { drive: 38, yawDrive: 34, px: 2.6, pyOut: -0.5, dz: -1.4, bend: 5, dip: -5, faceUp: -2 }), fist(h, 10.0, 10.0, 2.8, -30), guardOther(h, 1.5), [38, 28]),
    key(18, 'io', h, body(h, { drive: 36, yawDrive: 32, px: 2.4, pyOut: -0.5, dz: -1.4, bend: 5, dip: -4, faceUp: -2 }), fist(h, 9.6, 10.4, 2.6, -30), guardOther(h, 1.5), [38, 28]),
    { at: 27 * FR, ease: 'io', pose: {} },
  ];
  const blows: BlowAt[] = [{ at: 13 * FR, hand: 'left', size: 22, heavy: true, strike: 1 * FR }];
  return { motion: { keys, hit: 13 * FR }, long: 27 * FR, blows, air: [[6.2 * FR, 9.9 * FR]], dash: SLIP_DASH };
}

/** His punches, by name. */
export function brawlerPunches(): Record<string, Punch> {
  const out: Record<string, Punch> = {};
  for (const p of [jab(), crossPunch(), hook('L'), hook('R'), bodyBlow('L'), bodyBlow('R'), uppercut('L'), uppercut('R'), overhand(), haymaker()]) out[p.name] = p;
  return out;
}

/** In a combo, how much of its own wind-up a punch after the first takes, coming from where the one before carried through. */
const QUICK = 0.85;

/** Punches one after another as a combo: each cut off where its blow has carried through, the next wound up from there; the last played out to his guard. */
export function chain(ps: Punch[]): { motion: Motion; long: number; blows: BlowAt[]; air: [number, number][] } {
  const keys: Key3[] = [];
  const blows: BlowAt[] = [];
  const air: [number, number][] = [];
  let from = 0;
  ps.forEach((p, i) => {
    const last = i === ps.length - 1;
    // (THE SAME FIST AGAIN, the overhand or the haymaker after a right: carried through across him, it is brought home to his guard
    // before it is drawn back for the next, so that his arm never whips round from the one to the other)
    let regather = 0;
    if (i > 0 && ps[i - 1].hand === p.hand) {
      const was = keys[keys.length - 1].pose;
      const home = p.hand === 'L' ? { lhIn: GUARD.lhIn, lhx: GUARD.lhx, lhy: GUARD.lhy, lhz: GUARD.lhz, le: GUARD.le } : { rhIn: GUARD.rhIn, rhx: GUARD.rhx, rhy: GUARD.rhy, rhz: GUARD.rhz, re: GUARD.re };
      const half: Partial<Bones> = {};
      for (const f of ['twist', 'yaw', 'px', 'py', 'pz', 'bend', 'side', 'pitch'] as const) {
        const a = (was[f] ?? GUARD[f]) as number;
        (half as Record<string, number>)[f] = a + ((GUARD[f] as number) - a) * 0.5;
      }
      regather = 5 * FR;
      keys.push({ at: from + FR + regather, pose: { ...was, ...half, ...home }, ease: 'io' });
    }
    // (where this punch's own time 0 falls: the first at once; the next so that its wind-up is reached QUICK of its own time
    // after the one before has carried through and held a frame there; on a whole frame, so that each punch is seen frame
    // for frame as it is alone)
    const off = i === 0 ? 0 : Math.round((from + FR + regather + QUICK * p.wind - p.wind) / FR) * FR;
    for (const k of p.keys) {
      if (i > 0 && k.at < p.wind - 1e-9) continue;
      if (!last && k.at > p.cut + 1e-9) continue;
      // (into the wind-up from a stop, eased both ways; from the fist's homecoming, on from it without a stop and slowing in)
      keys.push({ ...k, at: k.at + off, ease: i > 0 && Math.abs(k.at - p.wind) < 1e-9 ? (regather ? 'out' : 'io') : k.ease });
    }
    // (carried through, he holds it a frame: a fist that has gone out comes to a stop before it is drawn back for the next)
    if (!last) keys.push({ at: off + p.cut + FR, pose: keys[keys.length - 1].pose, ease: 'lin' });
    blows.push({ at: off + p.hit, hand: p.hand === 'L' ? 'left' : 'right', ...p.blow, charge: p.blow.charge ? [off + p.blow.charge[0], off + p.blow.charge[1]] : undefined });
    if (p.air) air.push([off + p.air[0], off + p.air[1]]);
    from = off + p.cut;
  });
  const end = keys[keys.length - 1].at;
  return { motion: { keys, hit: blows[0].at }, long: end, blows, air };
}

/** Which punch a press makes, at its place in a combo, the hand before it given, and how many holds came before it (his “By position (Recommended)”; the third of three holds, the haymaker). */
export function punchFor(place: 0 | 1 | 2, hold: boolean, before: Hand | null, holds = 0): Punch {
  const P = brawlerPunches();
  const hand: Hand = before === null ? (hold ? 'R' : 'L') : other(before);
  if (place === 0) return hold ? P.cross : P.jab;
  if (place === 1) return hold ? P[`body blow (${hand === 'L' ? 'left' : 'right'})`] : P[`hook (${hand === 'L' ? 'left' : 'right'})`];
  if (hold) return holds >= 2 ? P.haymaker : P.overhand;
  return P[`uppercut (${hand === 'L' ? 'left' : 'right'})`];
}

/** The combo made by three presses (true a hold, false a tap). */
export function comboOf(presses: [boolean, boolean, boolean]): Punch[] {
  const out: Punch[] = [];
  let before: Hand | null = null;
  let holds = 0;
  presses.forEach((hold, i) => {
    const p = punchFor(i as 0 | 1 | 2, hold, before, holds);
    out.push(p);
    before = p.hand;
    if (hold) holds++;
  });
  return out;
}

/** The eight combos, named by their presses. */
export const COMBOS: [string, [boolean, boolean, boolean]][] = [
  ['tap, tap, tap', [false, false, false]],
  ['tap, tap, hold', [false, false, true]],
  ['tap, hold, tap', [false, true, false]],
  ['tap, hold, hold', [false, true, true]],
  ['hold, tap, tap', [true, false, false]],
  ['hold, tap, hold', [true, false, true]],
  ['hold, hold, tap', [true, true, false]],
  ['hold, hold, hold', [true, true, true]],
];

/** The numbers of a pose that go smoothly from key to key (as art/skeleton.ts SMOOTH3 has them), and the two that say where a hand is measured from. */
const FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk'] as const;
/**
 * A move BAKED: a key for every sixtieth of a second, each the whole pose the move has then. (Between keys far apart, an
 * elbow is carried round by the short way between where the two keys have it, and when a body whips round in two or three
 * frames that way can throw it; key by key, each elbow is where that moment's own pose puts it, and goes on smoothly.)
 */
export function bake(m: Motion, long: number, fps = 60, soften = 2, quiet: [number, number][] = []): Motion {
  const n = Math.round(long * fps);
  const at = Array.from({ length: n + 1 }, (_, i) => Math.min(long, i / fps));
  const poses = at.map((t) => bonesAt(m.keys, GUARD, t));
  // (SOFTENED: each number passed `soften` times over its neighbours, 1 4 6 4 1, so that no part of him starts or stops
  // between one frame and the next faster than a body does; the ends held as they are)
  const vals: Record<string, number[]> = {};
  for (const f of FIELDS) {
    let v = poses.map((q) => q[f] as number);
    for (let r = 0; r < soften; r++) {
      const g = (i: number): number => v[Math.max(0, Math.min(n, i))];
      v = v.map((_, i) => (i === 0 || i === n ? v[i] : (g(i - 2) + 4 * g(i - 1) + 6 * g(i) + 4 * g(i + 1) + g(i + 2)) / 16));
    }
    vals[f] = v;
  }
  const keys: Key3[] = at.map((t, i) => {
    const pose: Partial<Bones> = { lhIn: poses[i].lhIn, rhIn: poses[i].rhIn };
    for (const f of FIELDS) (pose as Record<string, number>)[f] = vals[f][i];
    return { at: t, pose, ease: 'lin' };
  });
  // (steadied each of three ways, keeping whichever leaves the elbows smoothest: the most any one changes its pace or way
  // from one frame to the next, at thirty a second, the least)
  let best: Key3[] = keys;
  let bestRough = Infinity;
  for (const goOn of [0, 0.2, 0.35, 0.5, 0.7, 0.85]) {
    const tried = keys.map((k) => ({ ...k, pose: { ...k.pose } }));
    steadyElbows(tried, goOn);
    const rough = 1000 * jerks(tried, fps, quiet) + roughness(tried, fps);
    if (rough < bestRough) {
      bestRough = rough;
      best = tried;
    }
  }
  return { keys: best, hit: m.hit };
}

/**
 * How many times an elbow, as the eye sees it at thirty a second from in front and from behind, leaps (more than twice as
 * far as the frames either side), stalls and goes on, or turns straight back at speed: the boss checks' JERK, as
 * tests/brawler_moves.test.ts has them.
 */
function jerks(keys: Key3[], fps: number, quiet: [number, number][] = []): number {
  const every = Math.max(1, Math.round(fps / 30));
  let count = 0;
  for (const joint of ['elbowL', 'elbowR'] as const) {
    const at: V3[] = [];
    for (let i = 0; i < keys.length; i += every) at.push(solve(BRAWLER_B, { ...GUARD, ...keys[i].pose } as Posed)[joint]);
    for (const view of ['front', 'back'] as const) {
      const xy = at.map((p) => project(p, view));
      const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      const cos = (u: readonly [number, number], v: readonly [number, number]): number => (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
      for (let i = 1; i < sp.length - 1; i++) {
        if (struck(i / 30, quiet)) continue;
        const [a, b, c] = [sp[i - 1], sp[i], sp[i + 1]];
        if (b > 4 && b > 2.2 * Math.max(a, c)) count++;
        if (a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c) && cos(st[i - 1], st[i + 1]) > 0.5) count++;
        if (cos(st[i - 1], st[i]) < -0.5 && a > 3 && b > 3) count++;
      }
    }
  }
  return count;
}

/** Whether the moment `t` falls where a punch itself is thrown (a frame either side of it): there the fist goes in a flash, smeared, and is not judged frame by frame. */
export function struck(t: number, quiet: [number, number][]): boolean {
  return quiet.some(([a, b]) => t >= a - 1e-6 && t <= b + 1e-6);
}
/** Where each punch of a move is thrown: from a frame before its strike begins to a frame after it lands. */
export function strikes(blows: BlowAt[]): [number, number][] {
  return blows.map((b) => [b.at - (b.strike ?? 0) - FR, b.at + FR]);
}

/** How rough the elbows' going is: the most either changes its step from one frame to the next, at thirty a second. */
function roughness(keys: Key3[], fps: number): number {
  const every = Math.max(1, Math.round(fps / 30));
  let worst = 0;
  for (const joint of ['elbowL', 'elbowR'] as const) {
    const at: V3[] = [];
    for (let i = 0; i < keys.length; i += every) at.push(solve(BRAWLER_B, { ...GUARD, ...keys[i].pose } as Posed)[joint]);
    for (let i = 2; i < at.length; i++) {
      const d = Math.hypot(at[i][0] - 2 * at[i - 1][0] + at[i - 2][0], at[i][1] - 2 * at[i - 1][1] + at[i - 2][1], at[i][2] - 2 * at[i - 1][2] + at[i - 2][2]);
      worst = Math.max(worst, d);
    }
  }
  return worst;
}

/**
 * STEADY ELBOWS: frame by frame, each elbow's swing nudged (by no more than STEADY_REACH degrees from where the move puts
 * it) to wherever lies nearest where the elbow would be if it went on as it was going, a little cost on every degree
 * nudged. (Where a hand
 * crosses the height of its shoulder, or comes in to the body, the same swing can stand the elbow on the other side of
 * the arm from one frame to the next; so an elbow never flies over: it goes on from where it was.)
 */
const STEADY_REACH = 150;
const STEADY_COST = 0.003;
function steadyElbows(keys: Key3[], goOn: number): void {
  for (const side of ['le', 're'] as const) {
    const joint = side === 'le' ? 'elbowL' : 'elbowR';
    let was: V3 | null = null;
    let before: V3 | null = null;
    for (const k of keys) {
      // (where it would be if it went on as it was going, a little slowed)
      const goes: V3 | null = was && before ? [was[0] + (was[0] - before[0]) * goOn, was[1] + (was[1] - before[1]) * goOn, was[2] + (was[2] - before[2]) * goOn] : was;
      const q = { ...GUARD, ...k.pose } as Posed;
      const want = q[side];
      let best = want;
      let bestCost = Infinity;
      let bestAt: V3 | null = null;
      for (let d = -STEADY_REACH; d <= STEADY_REACH; d += 3) {
        const e = solve(BRAWLER_B, { ...q, [side]: want + d } as Posed)[joint];
        const moved = goes ? (e[0] - goes[0]) ** 2 + (e[1] - goes[1]) ** 2 + (e[2] - goes[2]) ** 2 : 0;
        const cost = moved + STEADY_COST * d * d;
        if (cost < bestCost) {
          bestCost = cost;
          best = want + d;
          bestAt = e;
        }
      }
      (k.pose as Record<string, number>)[side] = best;
      before = was;
      was = bestAt;
    }
  }
}

/** His punches each from his guard, and his eight combos, ready to draw and check. */
export function brawlerFights(): BrawlerMove[] {
  const out: BrawlerMove[] = [];
  for (const p of Object.values(brawlerPunches())) {
    const c = chain([p]);
    out.push({ name: `Punch: ${p.name}`, motion: bake(c.motion, c.long, 60, 1, strikes(c.blows)), long: c.long, loops: false, blows: c.blows, air: c.air });
  }
  for (const [name, presses] of COMBOS) {
    const ps = comboOf(presses);
    const c = chain(ps);
    // (a combo softened a pass more than a punch alone: where one punch gives way to the next, nothing of him pauses and goes on)
    out.push({ name: `Combo: ${name} (${ps.map((p) => p.name).join(', ')})`, motion: bake(c.motion, c.long, 60, 2, strikes(c.blows)), long: c.long, loops: false, blows: c.blows, air: c.air });
  }
  const s = slipCounter();
  out.push({ name: 'Swipe: slip and counter', motion: bake(s.motion, s.long, 60, 1, [...strikes(s.blows), s.dash]), long: s.long, loops: false, blows: s.blows, air: s.air, dash: s.dash });
  return out;
}
