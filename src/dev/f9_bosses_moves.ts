// FLOOR 9'S SIDE BOSSES' MOVES, AS POSES A MOMENT AT A TIME AND WHAT THEY THROW ABOUT (a mock-up for his films: tools/f9_bosses_film.ts;
// docs/mockups/f9_side_bosses/README.md). Nothing of the game imports it.
//
// THE TROLL CHIEFTAIN (his pick, 13 Nov 2026: “The first one, but I want the warcry to be a rage that gives him attack speed and move
// speed”): a heavy club smash, two-handed from over his head; a ground slam that cracks the ground in a line before him; his war cry,
// a rage that quickens his blows and his feet; a bull rush down a marked line.
// THE MIST WOLF (his pick: “Bite, claw sweep, howl calling the wolves, lunge, I like the mist cloud too”): a bite; a sweep of a
// forepaw; a howl that calls the floor's wolves out of the mist; a lunge in which it goes to mist and passes through you; a cloud of
// mist that hides it and hurts.
// Each strike is wound up and HELD (its warning marked on the ground where it will land), struck fast, and followed through.

import type { V3 } from '../art/skeleton';
import { CHIEF_STAND, WOLF_STAND } from './sculpt_f9_bosses';
import type { ChiefPose, WolfPose } from './sculpt_f9_bosses';

/** How a span between two keys is eased: `io` slow out and in; `out` fast away then settling (a strike landing); `in` slow then fast (a swing); `lin` even. */
type Ease = 'io' | 'in' | 'out' | 'lin';
type Key<T> = [number, Partial<T>, Ease?];

const easeOf = (e: Ease, k: number): number => (e === 'lin' ? k : e === 'in' ? k * k * k : e === 'out' ? 1 - (1 - k) ** 3 : k * k * (3 - 2 * k));

/** The pose at `t` between keys (each key's values held from it on, eased in from the key before by its own ease). */
function posed<T extends object>(base: T, keys: readonly Key<T>[], t: number): T {
  // (each key's pose: the one before it with its values over it)
  const full: T[] = [];
  let was: T = base;
  for (const [, v] of keys) {
    was = { ...was, ...v };
    full.push(was);
  }
  if (t <= keys[0][0]) return full[0];
  for (let i = 1; i < keys.length; i++) {
    if (t > keys[i][0]) continue;
    const a = full[i - 1];
    const b = full[i];
    const k = easeOf(keys[i][2] ?? 'io', (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    const out = { ...b } as Record<string, unknown>;
    for (const key of Object.keys(b)) {
      const x = (a as Record<string, unknown>)[key];
      const y = (b as Record<string, unknown>)[key];
      if (typeof x === 'number' && typeof y === 'number') out[key] = x + (y - x) * k;
      else if (Array.isArray(x) && Array.isArray(y)) out[key] = (x as number[]).map((v, j) => v + ((y as number[])[j] - v) * k);
      else out[key] = k < 0.5 ? x : y;
    }
    return out as T;
  }
  return full[full.length - 1];
}

// =================================================================================================
// THE TROLL CHIEFTAIN'S

export type ChiefMove = 'smash' | 'slam' | 'warcry' | 'rush';

/** When each move's blow lands, and how long the move is (seconds). */
export const CHIEF_MOVES: Record<ChiefMove, { hit: number; long: number }> = {
  smash: { hit: 0.95, long: 2.1 },
  slam: { hit: 1.2, long: 2.6 },
  warcry: { hit: 0.7, long: 3.2 },
  rush: { hit: 1.15, long: 2.5 },
};

/** The club pointed from his fist toward `d` (its head as far as the club is long). */
const club = (fist: V3, d: V3): { fistR: V3; clubEnd: V3 } => ({ fistR: fist, clubEnd: [fist[0] + d[0], fist[1] + d[1], fist[2] + d[2]] });

const SMASH: Key<ChiefPose>[] = [
  [0, {}],
  // (both hands on the handle, the club raised up and back over his head, his body turned away and leaning back: HELD)
  [0.35, { twoHand: true, ...club([10, -20, 96], [-30, -6, 40]), lean: -6, twist: -14, hip: [-2, 0, -2], jaw: 0.2 }],
  [0.6, { ...club([2, -12, 114], [-40, -2, 30]), lean: -12, twist: -18, hip: [-3, 0, 0], jaw: 0.5, footL: [6, 18, 7] }],
  [0.82, { ...club([0, -12, 116], [-40, -2, 32]), lean: -13, twist: -19 }],
  // (swung over and down in front in two frames: the club's head into the ground before him)
  [0.89, { ...club([22, -10, 96], [40, 0, 30]), lean: 8, twist: -2, hip: [3, 0, -3] }, 'in'],
  [0.95, { ...club([34, -8, 46], [50, 0, -34]), lean: 28, twist: 6, hip: [8, 0, -9], jaw: 0.9, footL: [20, 18, 5] }, 'lin'],
  [1.45, { lean: 26, hip: [8, 0, -8], jaw: 0.4 }],
  [2.1, { ...CHIEF_STAND, footL: [10, 18, 5], hip: [4, 0, 0] }],
];

const SLAM: Key<ChiefPose>[] = [
  [0, {}],
  // (crouched low, the club held across before him in both hands)
  [0.4, { twoHand: true, ...club([26, -16, 50], [-6, -58, 6]), lean: 18, hip: [0, 0, -10], jaw: 0.2 }],
  // (up on his toes, the club straight up over his head: HELD, the line marked before him)
  [0.85, { ...club([8, -6, 124], [4, -2, 58]), lean: -8, hip: [0, 0, 5], headUp: 12, jaw: 0.6, footL: [1, 18, 9], footR: [1, -18, 9] }],
  [1.1, { ...club([7, -6, 126], [3, -2, 58]), lean: -10, headUp: 14 }],
  // (driven straight down into the ground before him: the crack runs out along the line)
  [1.2, { ...club([32, -5, 56], [20, 0, -56]), lean: 30, hip: [6, 0, -13], headUp: -4, jaw: 1, footL: [4, 18, 5], footR: [4, -18, 5] }, 'in'],
  [1.9, { lean: 27, hip: [6, 0, -12], jaw: 0.5 }],
  // (the club drawn up out of the ground and back onto his shoulder)
  [2.25, { twoHand: false, ...club([24, -30, 70], [-10, -24, 44]), lean: 8, hip: [4, 0, -4] }],
  [2.6, { ...CHIEF_STAND, hip: [3, 0, 0], footL: [4, 18, 5], footR: [4, -18, 5] }],
];

const WARCRY: Key<ChiefPose>[] = [
  [0, {}],
  // (gathered in, hunched, his left fist drawn to his chest)
  [0.35, { lean: 14, hip: [0, 0, -6], headUp: -10, fistL: [18, 20, 54], ...club([18, -30, 74], [-24, -30, 42]) }],
  // (thrown open: chest out, head back, jaw wide, the club up high, his left arm flung out: the roar, HELD)
  [0.7, { lean: -18, hip: [0, 0, 3], headUp: 38, jaw: 1, fistL: [6, 50, 96], ...club([8, -44, 124], [-8, -22, 52]) }, 'out'],
  [1.55, { lean: -19, headUp: 40, jaw: 1, fistL: [5, 51, 98], ...club([7, -45, 126], [-8, -22, 52]) }],
  // (back down, and the rage on him: three quick heavy strides at you)
  [1.85, { ...CHIEF_STAND, lean: 10, hip: [0, 0, -2], jaw: 0.5 }],
  [2.1, { hip: [14, 0, -1], footR: [24, -18, 12], lean: 14 }, 'lin'],
  [2.3, { hip: [28, 0, -3], footR: [34, -18, 5], footL: [16, 18, 12] }, 'lin'],
  [2.5, { hip: [42, 0, -1], footL: [50, 18, 5], footR: [40, -18, 10] }, 'lin'],
  [2.7, { hip: [52, 0, -2], footR: [54, -18, 5] }, 'lin'],
  [3.2, { ...CHIEF_STAND, hip: [52, 0, 0], footL: [53, 18, 5], footR: [53, -18, 5], lean: 6, jaw: 0.3 }],
];

/** The bull rush: his steps as he charges, a pair a fifth of a second. */
const RUSH: Key<ChiefPose>[] = (() => {
  const k: Key<ChiefPose>[] = [
    [0, {}],
    // (head down, shoulder down, the club tucked under his arm before him like a ram; he paws the ground: HELD, the line marked)
    [0.3, { lean: 26, hip: [-4, 0, -8], headUp: -8, jaw: 0.5, ...club([24, -22, 58], [56, 6, 10]), fistL: [26, 16, 54] }],
    [0.45, { footR: [-6, -18, 13] }],
    [0.58, { footR: [-2, -18, 5] }, 'in'],
    [0.75, { footR: [-8, -18, 13] }],
    [0.88, { footR: [-2, -18, 5] }, 'in'],
    [1.05, { lean: 30, hip: [-6, 0, -9] }],
  ];
  // (the charge: down the line at a run)
  let f = -6;
  for (let i = 0; i < 6; i++) {
    const t = 1.05 + (i + 1) * 0.1;
    f += 28;
    const L = i % 2 === 0;
    k.push([t, { hip: [f, 0, -6 + (i % 2) * 2], footL: L ? [f + 16, 18, 5] : [f - 10, 18, 13], footR: L ? [f - 10, -18, 13] : [f + 16, -18, 5] }, 'lin']);
  }
  // (he skids to a stop)
  k.push([1.85, { hip: [f + 14, 0, -8], lean: 14, footL: [f + 26, 18, 5], footR: [f + 20, -18, 5] }, 'out']);
  k.push([2.5, { ...CHIEF_STAND, hip: [f + 14, 0, 0], footL: [f + 15, 18, 5], footR: [f + 15, -18, 5] }]);
  return k;
})();

/** How far the bull rush carries him (his own lengths). */
export const RUSH_LONG = 6 * 28 + 14 - 6;

/** The troll chieftain at `t` seconds into `move` (his breath going on through it). */
export function chiefPose(move: ChiefMove, t: number): ChiefPose {
  const keys = move === 'smash' ? SMASH : move === 'slam' ? SLAM : move === 'warcry' ? WARCRY : RUSH;
  const p = posed<ChiefPose>(CHIEF_STAND, keys, t);
  return { ...p, breath: 0.5 + 0.5 * Math.sin(t * 2.4) };
}

// =================================================================================================
// THE MIST WOLF'S

export type WolfMove = 'bite' | 'claw' | 'howl' | 'lunge' | 'cloud';

export const WOLF_MOVES: Record<WolfMove, { hit: number; long: number }> = {
  bite: { hit: 0.5, long: 1.25 },
  claw: { hit: 0.46, long: 1.15 },
  howl: { hit: 0.6, long: 2.6 },
  lunge: { hit: 0.8, long: 1.5 },
  cloud: { hit: 1.0, long: 3.0 },
};

const S = WOLF_STAND;
const BITE: Key<WolfPose>[] = [
  [0, {}],
  // (gathered back on its haunches, head low: HELD)
  [0.3, { root: [-6, 0, -6], pitch: 6, headUp: -12, jaw: 0.1, tailUp: -12, pawHL: [-20, 8.5, 3], pawHR: [-25, -8.5, 3] }],
  // (the lunge in, jaws flung open; snapped shut)
  [0.42, { root: [22, 0, -3], pitch: 2, headUp: 8, jaw: 1, pawFL: [46, 8.5, 6], pawFR: [50, -8.5, 4] }, 'in'],
  [0.5, { root: [26, 0, -4], headUp: 2, jaw: 0, pawFL: [48, 8.5, 3], pawFR: [52, -8.5, 3] }, 'lin'],
  [0.75, { root: [20, 0, -2], jaw: 0.4 }],
  [1.25, { ...S, root: [12, 0, 0], pawFL: [37, 8.5, 3], pawFR: [42, -8.5, 3], pawHL: [-4.5, 8.5, 3], pawHR: [-9.5, -8.5, 3] }],
];

const CLAW: Key<WolfPose>[] = [
  [0, {}],
  // (up on its hind legs a little, its near forepaw raised high: HELD)
  [0.3, { root: [-4, 0, 6], pitch: -16, headUp: 4, jaw: 0.6, pawFR: [36, -18, 42], tailUp: 6 }],
  // (swept across before it and down)
  [0.46, { root: [6, 0, 2], pitch: -4, pawFR: [50, 14, 12], jaw: 0.8 }, 'in'],
  [0.6, { root: [6, 0, 0], pitch: 2, pawFR: [40, 4, 3] }, 'out'],
  [1.15, { ...S, root: [4, 0, 0], pawFL: [29, 8.5, 3], pawFR: [34, -8.5, 3], pawHL: [-12.5, 8.5, 3], pawHR: [-17.5, -8.5, 3] }],
];

const HOWL: Key<WolfPose>[] = [
  [0, {}],
  // (its forequarters up, its head thrown back, jaws open: the howl, HELD)
  [0.6, { root: [-6, 0, -4], pitch: -18, headUp: 52, jaw: 0.95, tailUp: 14 }],
  [1.9, { root: [-6, 0, -4], pitch: -19, headUp: 55, jaw: 1, tailUp: 15 }],
  [2.6, { ...S }],
];

/** How far the lunge carries it (its own lengths), through where you stood. */
export const LUNGE_LONG = 150;
const LUNGE: Key<WolfPose>[] = [
  [0, {}],
  // (crouched, head low, the line marked; going to mist)
  [0.35, { root: [-8, 0, -8], pitch: 8, headUp: -6, jaw: 0.6, tailUp: -6 }],
  [0.6, { ghost: 0.85 }],
  // (stretched out, gone to mist, it passes through)
  [0.68, { root: [10, 0, 2], pitch: 0, pawFL: [40, 8.5, 12], pawFR: [46, -8.5, 10], pawHL: [-38, 8.5, 12], pawHR: [-42, -8.5, 10], ghost: 0.9 }, 'in'],
  [0.95, { root: [LUNGE_LONG - 10, 0, 2], pawFL: [LUNGE_LONG + 30, 8.5, 12], pawFR: [LUNGE_LONG + 36, -8.5, 10], pawHL: [LUNGE_LONG - 48, 8.5, 12], pawHR: [LUNGE_LONG - 52, -8.5, 10] }, 'lin'],
  // (lands and takes its shape again beyond you)
  [1.15, { root: [LUNGE_LONG, 0, -3], pitch: 4, pawFL: [LUNGE_LONG + 25, 8.5, 3], pawFR: [LUNGE_LONG + 30, -8.5, 3], pawHL: [LUNGE_LONG - 16.5, 8.5, 3], pawHR: [LUNGE_LONG - 21.5, -8.5, 3], ghost: 0.5 }, 'out'],
  [1.5, { root: [LUNGE_LONG, 0, 0], pitch: 0, headUp: 0, jaw: 0.25, tailUp: 0, ghost: 0 }],
];

const CLOUD: Key<WolfPose>[] = [
  [0, {}],
  // (head low, jaws open, breathing the mist out; going into it)
  [0.35, { root: [0, 0, -4], pitch: 6, headUp: -8, jaw: 0.9 }],
  [1.0, { ghost: 0.7, jaw: 0.6 }],
  [2.4, { ghost: 0.72 }],
  [3.0, { ...S }],
];

/** The mist wolf at `t` seconds into `move`. */
export function wolfPose(move: WolfMove, t: number): WolfPose {
  const keys = move === 'bite' ? BITE : move === 'claw' ? CLAW : move === 'howl' ? HOWL : move === 'lunge' ? LUNGE : CLOUD;
  return { ...posed<WolfPose>(WOLF_STAND, keys, t), t };
}
