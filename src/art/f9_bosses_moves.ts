// FLOOR 9'S SIDE BOSSES' MOVES, AS POSES A MOMENT AT A TIME AND WHAT THEY THROW ABOUT (his films: tools/f9_bosses_film.ts;
// docs/mockups/f9_side_bosses/README.md; and their pictures in the game, art/f9_bosses_art.ts, behind F9_LAIRS, off).
//
// THE TROLL CHIEFTAIN (his pick, 13 Nov 2026: “The first one, but I want the warcry to be a rage that gives him attack speed and move
// speed”): a heavy club smash, two-handed from over his head; a ground slam that cracks the ground in a line before him; his war cry,
// a rage that quickens his blows and his feet; a bull rush down a marked line.
// THE MIST WOLF (his pick: “Bite, claw sweep, howl calling the wolves, lunge, I like the mist cloud too”): a bite; a sweep of a
// forepaw; a howl that calls the floor's wolves out of the mist; a lunge in which it goes to mist and passes through you; a cloud of
// mist that hides it and hurts.
//
// HIS RULES FOR THEM (docs/art/RULEBOOK.md), shown them first done otherwise, his word of 13 Nov: “No man this all sucks.  There are
// rules and these animations do not follow any of the rules.  They need to be wild and crazy”:
//   AS FAR AS IT WILL GO (Animations 1): every move as big, wild, kinetic and weighty as it can be, a notch too high;
//   BIG WIND-UP, LIGHTNING STRIKE (Movement 9): each wound up big and HELD, a wind-up you dread (Monsters 3, 4); the blow itself two
//     frames, smeared with after-images and speed lines (the film draws them, `strikes`); a big wind-down;
//   HEAVY BLOWS LAND WITH A FREEZE (Movement 7), and the screen kicks (Animations): `beats`;
//   WEIGHT (Movement 1): the feet planted, the hips turned, carried through; a landing sinks;
//   LOOSE THINGS FOLLOW (Movement 4): his kilt and necklace, its belly's mist and tail, left behind by their going (`swing`);
//   ALIVE WHEN STILL (Movement 6): breathing;
//   EACH WILD IN HIS OWN WAY (Animations 3): the chieftain's is the earth and brute force (shockwaves, the ground broken, stone and
//     dust flung up, the rage's fire); the wolf's is mist and speed (after-images of it, crescents of its jaws and claws, mist
//     bursting).

import { GRID } from './skeleton';
import type { V3 } from './skeleton';
import { CHIEF_STAND, CK, CLUB_LONG, WK, WOLF_STAND } from './f9_bosses_sculpt';
import type { ChiefPose, WolfPose } from './f9_bosses_sculpt';

/** How a span between two keys is eased: `io` slow out and in; `out` fast away then settling; `in` slow then fast; `lin` even. */
type Ease = 'io' | 'in' | 'out' | 'lin';
type Key<T> = [number, Partial<T>, Ease?];

const easeOf = (e: Ease, k: number): number => (e === 'lin' ? k : e === 'in' ? k * k * k : e === 'out' ? 1 - (1 - k) ** 3 : k * k * (3 - 2 * k));

/** The pose at `t` between keys (each key's values held from it on, eased in from the key before by its own ease). */
function posed<T extends object>(base: T, keys: readonly Key<T>[], t: number): T {
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

/** A moment a blow lands: the scene holds `freeze` seconds there, and the screen kicks `shake` pixels, dying away over `ring` seconds. */
export interface Beat {
  at: number;
  freeze: number;
  shake: number;
  ring: number;
}
/** What the film is told of a move: how long, its blows' landing (`beats`), and when each blow is struck, from and to (`strikes`, its smears and after-images). */
export interface MoveInfo {
  long: number;
  beats: Beat[];
  strikes: [number, number][];
}

/** The club pointed from his fist toward `d` (the club is as long as it is). */
const club = (fist: V3, d: V3): { fistR: V3; clubEnd: V3 } => ({ fistR: fist, clubEnd: [fist[0] + d[0], fist[1] + d[1], fist[2] + d[2]] });
/** A tremble, `a` units, for a held pose straining (frame by frame). */
const shiver = (t: number, a: number): V3 => [Math.sin(t * 97) * a, Math.sin(t * 131) * a * 0.6, Math.sin(t * 113) * a * 0.4];

// =================================================================================================
// THE TROLL CHIEFTAIN'S

export type ChiefMove = 'smash' | 'slam' | 'warcry' | 'rush';

export const CHIEF_MOVES: Record<ChiefMove, MoveInfo> = {
  smash: { long: 2.9, beats: [{ at: 1.32, freeze: 0.12, shake: 8, ring: 0.5 }], strikes: [[1.25, 1.32]] },
  slam: { long: 2.6, beats: [{ at: 1.02, freeze: 0.13, shake: 10, ring: 0.6 }], strikes: [[0.95, 1.02]] },
  warcry: { long: 3.3, beats: [{ at: 0.97, freeze: 0.1, shake: 9, ring: 1.0 }], strikes: [[0.9, 0.97], [2.2, 2.6]] },
  rush: { long: 2.6, beats: [{ at: 1.45, freeze: 0.12, shake: 9, ring: 0.5 }], strikes: [[1.15, 1.45]] },
};

/** Him standing with nothing of a whirl on him, so that each move's eases in from there. */
const CS: ChiefPose = { ...CHIEF_STAND, turn: 0 };

// THE CLUB SMASH: he steps in and swings the club down and round behind him low in both hands, his whole body turning away from you;
// WHIRLS, a whole turn on the spot, the club out at arm's length, low, his kilt flung out; out of the whirl the club swung on up over
// his head and right down behind his back, up on his toes: HELD, straining; and down, two frames, into the ground far before him.
const SMASH: Key<ChiefPose>[] = [
  [0, {}],
  [0.3, { twoHand: true, ...club([16, -26, 56], [-34, -30, 4]), lean: 18, twist: -30, turn: -40, hip: [0, 0, -12], jaw: 0.5, headUp: -6 }],
  // (THE WHIRL)
  [0.55, { ...club([30, -30, 62], [40, -36, 0]), lean: 14, twist: 0, turn: 80, hip: [0, 0, -10] }, 'in'],
  [0.8, { turn: 220, lean: 12 }, 'lin'],
  [0.98, { turn: 330, ...club([20, -30, 90], [10, -30, 50]), lean: 0, hip: [0, 0, -4] }, 'lin'],
  // (out of it, the club on up over his head and down behind his back: HELD)
  [1.12, { turn: 360, ...club([-10, -10, 138], [-28, 6, 30]), lean: -40, twist: -30, hip: [-10, 0, 10], headUp: 32, jaw: 1, footL: [22, 18, 5], footR: [-8, -18, 13] }, 'out'],
  [1.25, { ...club([-11, -10, 139], [-30, 6, 30]), lean: -42, twist: -32, headUp: 34 }],
  // (THE STRIKE, two frames: over and down, the club's head into the ground far before him, his body folded after it)
  [1.28, { ...club([30, -8, 110], [46, 0, 24]), lean: 8, twist: -6, hip: [8, 0, -4] }, 'in'],
  [1.32, { ...club([50, -6, 34], [58, 0, -46]), lean: 54, twist: 24, hip: [20, 0, -22], headUp: -8, jaw: 1, footR: [-2, -18, 5] }, 'lin'],
  // (it bounces in his hands; he holds there, heaving)
  [1.5, { ...club([46, -6, 46], [58, 0, -34]), lean: 48, hip: [18, 0, -19] }, 'out'],
  [1.9, { ...club([48, -6, 40], [58, 0, -42]), lean: 51, hip: [19, 0, -20], jaw: 0.6 }],
  // (the wind-down: hauled up out of the ground and back onto his shoulder)
  [2.3, { twoHand: false, ...club([26, -30, 72], [-14, -24, 44]), lean: 10, twist: 0, hip: [8, 0, -3], headUp: 0, jaw: 0.3 }],
  [2.9, { ...CHIEF_STAND, turn: 360, footL: [18, 18, 5], footR: [-2, -18, 5] }],
];
/** (the smash's end: his feet stepped back under him, one and then the other, each lifted as it goes: so he ends as he stands) */
const SMASH_STEPS: readonly { foot: 'footL' | 'footR'; t0: number; t1: number; from: V3; to: V3 }[] = [
  { foot: 'footR', t0: 2.3, t1: 2.55, from: [-2, -18, 5], to: CHIEF_STAND.footR },
  { foot: 'footL', t0: 2.55, t1: 2.85, from: [18, 18, 5], to: CHIEF_STAND.footL },
];

const SLAM: Key<ChiefPose>[] = [
  [0, {}],
  // (squats deep, the club across before him in both hands)
  [0.3, { twoHand: true, ...club([28, -16, 44], [-6, -58, 4]), lean: 36, hip: [0, 0, -22], headUp: -12, jaw: 0.5, footL: [3, 21, 5], footR: [3, -21, 5] }],
  // (LEAPS: up off the ground, knees drawn up, the club straight up over his head; he hangs there: HELD, the line marked under him)
  [0.62, { ...club([6, -6, 128], [-44, -2, 34]), lean: -24, hip: [6, 0, 84], headUp: 22, jaw: 1, footL: [10, 18, 76], footR: [6, -18, 70] }, 'out'],
  [0.95, { ...club([5, -6, 130], [-46, -2, 34]), lean: -26, hip: [6, 0, 90], footL: [10, 18, 82], footR: [6, -18, 76] }],
  // (THE STRIKE, two frames: down onto the ground with all his weight, the club driven into it before him; he sinks)
  [0.98, { ...club([26, -5, 110], [22, 0, -50]), lean: 16, hip: [8, 0, 44], footL: [12, 20, 38], footR: [12, -20, 34] }, 'in'],
  [1.02, { ...club([42, -4, 40], [16, 0, -60]), lean: 50, hip: [10, 0, -25], headUp: -10, jaw: 1, footL: [12, 24, 5], footR: [12, -24, 5] }, 'lin'],
  [1.5, { ...club([42, -4, 46], [16, 0, -58]), lean: 44, hip: [10, 0, -20], jaw: 0.6 }],
  // (the wind-down: heaves it up out of the crack and back onto his shoulder)
  [1.95, { twoHand: false, ...club([26, -30, 72], [-14, -24, 44]), lean: 10, hip: [10, 0, -4], headUp: 0, jaw: 0.3 }],
  [2.6, { ...CHIEF_STAND, hip: [10, 0, 0], footL: [12, 18, 5], footR: [12, -18, 5] }],
];

// THE WAR CRY: he beats his chest, fists hammering it one and the other, faster and faster, huffing, his club bobbing behind his
// shoulder; hunches, gathering it in; then THROWN OPEN, the roar; the rage on him; and at you, three heavy strides.
const WARCRY: Key<ChiefPose>[] = [
  [0, {}],
  [0.15, { lean: 22, hip: [0, 0, -8], headUp: -10, jaw: 0.6, fistL: [32, 22, 64], ...club([32, -22, 64], [-6, -10, 50]), footL: [1, 21, 5], footR: [1, -21, 5] }],
  [0.25, { fistL: [16, 6, 70], ...club([36, -46, 86], [-6, -10, 50]), lean: 26, jaw: 0.9, headUp: -8 }, 'lin'],
  [0.33, { fistL: [36, 46, 86], ...club([16, -6, 70], [-6, -10, 50]), lean: 22, jaw: 0.4, headUp: -12 }, 'lin'],
  [0.41, { fistL: [16, 6, 70], ...club([36, -46, 86], [-6, -10, 50]), lean: 26, jaw: 0.9, headUp: -8 }, 'lin'],
  [0.49, { fistL: [36, 46, 86], ...club([16, -6, 70], [-6, -10, 50]), lean: 22, jaw: 0.4, headUp: -12 }, 'lin'],
  [0.57, { fistL: [16, 6, 70], ...club([36, -46, 86], [-6, -10, 50]), lean: 26, jaw: 0.9, headUp: -8 }, 'lin'],
  [0.65, { fistL: [36, 46, 86], ...club([16, -6, 70], [-6, -10, 50]), lean: 22, jaw: 0.4, headUp: -12 }, 'lin'],
  [0.73, { fistL: [16, 6, 70], ...club([36, -46, 86], [-6, -10, 50]), lean: 26, jaw: 0.9, headUp: -8 }, 'lin'],
  [0.81, { fistL: [36, 46, 86], ...club([16, -6, 70], [-6, -10, 50]), lean: 22, jaw: 0.4, headUp: -12 }, 'lin'],
  [0.9, { lean: 35, hip: [0, 0, -13], headUp: -23, jaw: 0.2, fistL: [24, 8, 62], ...club([26, -10, 70], [-20, -36, 40]) }],
  // (THROWN OPEN, two frames: up on his toes, chest out, head back, jaw wide, both arms flung up and out: the roar)
  [0.97, { lean: -38, hip: [0, 0, 12], headUp: 60, jaw: 1, fistL: [-6, 68, 118], ...club([-2, -62, 138], [-8, -34, 50]), footL: [1, 23, 11], footR: [1, -23, 11] }, 'lin'],
  [1.85, { lean: -40, hip: [0, 0, 13], headUp: 62, jaw: 1, fistL: [-7, 69, 120], ...club([-3, -63, 140], [-8, -34, 50]) }],
  // (down into a crouch, the rage on him)
  [2.2, { ...CHIEF_STAND, lean: 20, hip: [0, 0, -8], jaw: 0.7, headUp: -4, ...club([26, -28, 66], [-10, -30, 40]), footL: [1, 18, 5], footR: [1, -18, 5] }],
  // (and at you, quick: three heavy strides in the time of one)
  [2.3, { hip: [16, 0, -6], footR: [26, -18, 13], lean: 24 }, 'lin'],
  [2.4, { hip: [32, 0, -9], footR: [38, -18, 5], footL: [20, 18, 13] }, 'lin'],
  [2.5, { hip: [48, 0, -6], footL: [56, 18, 5], footR: [44, -18, 13] }, 'lin'],
  [2.6, { hip: [62, 0, -9], footR: [68, -18, 5] }, 'lin'],
  [3.3, { ...CHIEF_STAND, hip: [62, 0, 0], footL: [63, 18, 5], footR: [63, -18, 5], lean: 8, jaw: 0.4 }],
];

/** How far the bull rush carries him (his own lengths): to where you stand. */
export const RUSH_LONG = 168;
const RUSH: Key<ChiefPose>[] = (() => {
  const k: Key<ChiefPose>[] = [
    [0, {}],
    // (head down, shoulder down, the club tucked under his arm before him like a ram)
    [0.3, { lean: 44, hip: [-8, 0, -16], headUp: -34, jaw: 0.8, ...club([24, -22, 54], [56, 6, 10]), fistL: [26, 16, 50] }],
    // (he paws the ground, twice, hard)
    [0.42, { footR: [-10, -18, 15] }],
    [0.52, { footR: [-2, -18, 5] }, 'in'],
    [0.66, { footR: [-12, -18, 15] }],
    [0.76, { footR: [-2, -18, 5] }, 'in'],
    // (coiled back on his haunches: HELD, the line marked, straining)
    [0.95, { lean: 40, hip: [-20, 0, -20] }],
    [1.15, { lean: 41, hip: [-21, 0, -20] }],
  ];
  // (THE CHARGE, a blur: down the line to you at a run, faster than you can follow)
  let f = -17;
  for (let i = 0; i < 6; i++) {
    const t = 1.15 + (i + 1) * 0.05;
    f += (RUSH_LONG + 17) / 6;
    const L = i % 2 === 0;
    k.push([t, { lean: 50, hip: [f, 0, -10 + (i % 2) * 5], footL: L ? [f + 16, 18, 5] : [f - 12, 18, 14], footR: L ? [f - 12, -18, 14] : [f + 16, -18, 5] }, 'lin']);
  }
  // (he hits, his antlers into you; THE UPPERCUT, the club swung up from under, flinging you; skids back on his heels, the ground
  // piling up before his feet)
  k.push([1.52, { hip: [f + 6, 0, -2], lean: -14, headUp: 26, jaw: 1, ...club([36, -24, 100], [30, -4, 60]), fistL: [20, 30, 70], footL: [f + 22, 18, 5], footR: [f + 14, -18, 5] }, 'out']);
  k.push([1.7, { hip: [f + 10, 0, -10], lean: 6, footL: [f + 24, 18, 5], footR: [f + 18, -18, 5], jaw: 1, ...club([30, -26, 90], [-6, -30, 50]) }, 'out']);
  k.push([2.6, { ...CHIEF_STAND, hip: [f + 10, 0, 0], footL: [f + 11, 18, 5], footR: [f + 11, -18, 5] }]);
  return k;
})();

/** His feet stepped where a move has them step (the smash's end), each lifted as it goes. */
function stepped(move: ChiefMove, p: ChiefPose, t: number): ChiefPose {
  if (move !== 'smash') return p;
  const q = { ...p };
  for (const st of SMASH_STEPS) {
    if (t <= st.t0) continue;
    const k = Math.min(1, (t - st.t0) / (st.t1 - st.t0));
    const e = k * k * (3 - 2 * k);
    q[st.foot] = [st.from[0] + (st.to[0] - st.from[0]) * e, st.from[1] + (st.to[1] - st.from[1]) * e, st.from[2] + (st.to[2] - st.from[2]) * e + 10 * Math.sin(Math.PI * k)];
  }
  return q;
}

/** The troll chieftain at `t` seconds into `move`: breathing, straining where he holds, what hangs off him left behind by his going. */
export function chiefPose(move: ChiefMove, t: number): ChiefPose {
  const keys = move === 'smash' ? SMASH : move === 'slam' ? SLAM : move === 'warcry' ? WARCRY : RUSH;
  const at = (q: number): ChiefPose => posed<ChiefPose>(CS, keys, q);
  const p = stepped(move, at(t), t);
  const was = at(t - 0.07);
  const v = [(p.hip[0] - was.hip[0]) / 0.07, (p.hip[1] - was.hip[1]) / 0.07, (p.hip[2] - was.hip[2]) / 0.07];
  const dl = (p.lean - was.lean) / 0.07;
  const cl = (x: number): number => Math.max(-12, Math.min(12, x));
  // (held poses strain: a tremble in them)
  const held = move === 'smash' ? t > 1.12 && t < 1.25 : move === 'slam' ? t > 0.62 && t < 0.95 : move === 'warcry' ? (t > 0.82 && t < 0.9) || (t > 0.97 && t < 1.85) : t > 0.95 && t < 1.15;
  const sh = held ? shiver(t, move === 'warcry' && t > 0.97 ? 1.6 : 1.0) : [0, 0, 0];
  return {
    ...p,
    hip: [p.hip[0] + sh[0], p.hip[1] + sh[1], p.hip[2] + sh[2]],
    breath: 0.5 + 0.5 * Math.sin(t * 2.4),
    swing: [cl(-v[0] * 0.07 - dl * 0.02), cl(-v[1] * 0.07), cl(-v[2] * 0.09)],
  };
}

// =================================================================================================
// THE MIST WOLF'S

export type WolfMove = 'bite' | 'claw' | 'howl' | 'lunge' | 'cloud';

/** How far the lunge carries it (its own lengths), through where you stood. */
export const LUNGE_LONG = 200;

export const WOLF_MOVES: Record<WolfMove, MoveInfo> = {
  bite: { long: 1.6, beats: [{ at: 0.66, freeze: 0.1, shake: 4, ring: 0.3 }], strikes: [[0.55, 0.66]] },
  claw: { long: 1.9, beats: [{ at: 0.68, freeze: 0.08, shake: 5, ring: 0.3 }, { at: 0.82, freeze: 0.08, shake: 5, ring: 0.3 }, { at: 1.0, freeze: 0.14, shake: 9, ring: 0.5 }], strikes: [[0.6, 0.68], [0.75, 0.82], [0.93, 1.0]] },
  howl: { long: 3.1, beats: [{ at: 0.9, freeze: 0.06, shake: 4, ring: 1.4 }], strikes: [[0.8, 0.9]] },
  lunge: { long: 1.8, beats: [{ at: 0.76, freeze: 0.08, shake: 5, ring: 0.3 }], strikes: [[0.7, 0.84]] },
  cloud: { long: 3.2, beats: [{ at: 0.66, freeze: 0.06, shake: 5, ring: 0.6 }], strikes: [[0.6, 0.66]] },
};

const S = WOLF_STAND;
/** It standing, with its turn, its roll and its paws' turn at nothing, so that each eases in from there. */
const WS: WolfPose = { ...WOLF_STAND, turn: 0, roll: 0, pawsTurn: 0 };
/** Its paws where it stands, moved on `d` (its own lengths). */
const pawsAt = (d: number): Partial<WolfPose> => ({ pawFL: [S.pawFL[0] + d, S.pawFL[1], 3], pawFR: [S.pawFR[0] + d, S.pawFR[1], 3], pawHL: [S.pawHL[0] + d, S.pawHL[1], 3], pawHR: [S.pawHR[0] + d, S.pawHR[1], 3] });

// THE BITE: a savage one. It drops low and coils, turned half away, its head cocked and its lips back, its tail lashing; HELD,
// trembling; then flung at you off its hind legs, stretched out in the air, forelegs reaching, hind legs kicked out behind; its jaws
// snap shut and its weight crashes down on its forepaws; it hangs on and THRASHES, its whole body wrenched side to side and twisting,
// its hind legs scrabbling; then it tosses its head up and flings you off, and backs away, a paw at a time.
const BITE: Key<WolfPose>[] = [
  [0, {}],
  [0.3, { root: [-20, 0, -17], pitch: 15, turn: -20, roll: -5, headUp: -24, headTurn: 18, jaw: 0.6, tailUp: -16, pawHL: [-26, 8.5, 3], pawHR: [-31, -8.5, 3] }],
  [0.55, { root: [-21, 0, -18], pitch: 16, turn: -22, headUp: -25, headTurn: 20, tailUp: -20 }],
  // (THE STRIKE: flung up at you, stretched out, jaws wide; snapped shut, crashing down on its forepaws)
  [0.62, { root: [36, 0, 22], pitch: -14, turn: 3, roll: 0, headUp: 20, headTurn: 0, jaw: 1, pawFL: [70, 10, 24], pawFR: [74, -10, 20], pawHL: [-14, 8.5, 18], pawHR: [-20, -8.5, 14], tailUp: 10 }, 'in'],
  [0.66, { root: [42, 0, 2], pitch: 12, headUp: -12, jaw: 0, pawFL: [64, 9, 3], pawFR: [70, -9, 3], pawHL: [6, 8.5, 3], pawHR: [1, -8.5, 3], tailUp: -4 }, 'lin'],
  // (THE THRASH: wrenched one way and the other, twisting, its hind legs scrabbling)
  [0.73, { turn: 34, roll: 13, headTurn: 40, headUp: -6, root: [42, 4, 3], pawHL: [6, 8.5, 9], tailUp: 14 }, 'lin'],
  [0.8, { turn: -32, roll: -13, headTurn: -42, root: [42, -4, 4], pawHL: [8, 8.5, 3], pawHR: [1, -8.5, 9], tailUp: -12 }, 'lin'],
  [0.87, { turn: 28, roll: 11, headTurn: 34, root: [41, 3, 3], pawHR: [3, -8.5, 3], pawFL: [64, 13, 9], tailUp: 12 }, 'lin'],
  [0.94, { turn: -22, roll: -8, headTurn: -28, root: [40, -3, 2], pawFL: [64, 9, 3], pawFR: [70, -13, 8], tailUp: -8 }, 'lin'],
  [1.0, { turn: 12, roll: 4, headTurn: 14, root: [39, 0, 2], pawFR: [70, -9, 3] }, 'lin'],
  // (THE TOSS: its head flung up and back, the forepaws coming up off the ground with it, jaws open: thrown off)
  [1.12, { turn: 0, roll: 0, headTurn: 0, headUp: 40, jaw: 1, pitch: -18, root: [34, 0, 8], pawFL: [60, 9, 14], pawFR: [64, -9, 10], tailUp: 18 }, 'out'],
  // (backs away, a paw at a time)
  [1.28, { pitch: 0, headUp: 4, jaw: 0.5, root: [28, 0, 0], pawFL: [52, 8.5, 3], pawFR: [58, -8.5, 10] }],
  [1.42, { root: [22, 0, 0], pawFR: [50, -8.5, 3], pawHL: [2, 8.5, 9] }],
  [1.6, { ...WS, root: [16, 0, 0], ...pawsAt(16) }],
];

/** Where the claw's first rake is raised from and swept to (its own lengths), and round what: the sweep's arc. The second is its mirror. */
export const CLAW_ARC = { from: [8, -46, 112] as V3, to: [62, 50, 8] as V3, about: [30, 0, 62] as V3 };
// THE CLAW: A FRENZY. It rears right up on its hind legs, tall as a man and more, both forelegs up and spread, its head thrown up
// snarling: HELD; then RAKE, the near paw round and down across, its body wrenched round after it; RAKE, the far paw back across the
// other way, the body wrenched back; up again, both paws high, and SMASH, both down together, its whole weight on them, its head down.
const CLAW: Key<WolfPose>[] = [
  [0, {}],
  [0.4, { root: [-12, 0, 16], pitch: -66, turn: -24, headUp: 26, headTurn: 16, jaw: 1, pawFR: CLAW_ARC.from, pawFL: [22, 34, 98], tailUp: 26, pawHL: [-20, 8.5, 3], pawHR: [-25, -8.5, 3] }],
  [0.6, { root: [-13, 0, 17], pitch: -67, turn: -26, pawFR: [CLAW_ARC.from[0] - 1, CLAW_ARC.from[1] - 1, CLAW_ARC.from[2] + 1] }],
  // (RAKE: the near paw round and down across, the body wrenched round after it)
  [0.64, { root: [2, 0, 12], pitch: -42, turn: 4, roll: 10, pawFR: [60, -10, 62], pawFL: [26, 36, 94] }, 'lin'],
  [0.68, { root: [8, 0, 8], pitch: -30, turn: 30, roll: 18, headTurn: -22, pawFR: CLAW_ARC.to, pawFL: [30, 38, 92] }, 'lin'],
  // (RAKE: the far paw back across the other way)
  [0.75, { turn: 22, roll: 12, headTurn: 0, pawFL: [46, 44, 84], pawFR: [52, 44, 40] }, 'out'],
  [0.79, { turn: -4, roll: -6, pawFL: [62, 4, 52] }, 'lin'],
  [0.82, { root: [10, 0, 8], turn: -30, roll: -18, headTurn: 24, pawFL: [60, -50, 10], pawFR: [40, 26, 54] }, 'lin'],
  // (up again, both paws high; SMASH, both down together, its head down)
  [0.93, { root: [6, 0, 16], pitch: -56, turn: 0, roll: 0, headTurn: 0, headUp: 24, jaw: 1, pawFL: [26, 18, 104], pawFR: [30, -18, 104] }, 'out'],
  [1.0, { root: [22, 0, -10], pitch: 18, headUp: -12, pawFL: [66, 12, 3], pawFR: [70, -12, 3], tailUp: -8 }, 'lin'],
  [1.25, { root: [24, 0, -8], pitch: 14, jaw: 0.6 }, 'out'],
  [1.5, { root: [20, 0, -2], pitch: 4, pawFL: [50, 8.5, 10], pawFR: [60, -8.5, 3] }],
  [1.65, { pawFL: [41, 8.5, 3], pawFR: [52, -8.5, 10] }],
  [1.9, { ...WS, root: [16, 0, 0], ...pawsAt(16) }],
];

// THE HOWL: it gathers itself low, then rises right up onto its hind legs, upright, its chest thrown out, its head flung straight up,
// jaws wide: the howl, held, its forepaws pawing at the air, swaying, trembling, its mist flaring off it; then down it crashes onto
// its forepaws.
const HOWL: Key<WolfPose>[] = [
  [0, {}],
  [0.45, { root: [0, 0, -9], pitch: 14, headUp: -28, jaw: 0.1, tailUp: -12 }],
  [0.8, { root: [-4, 0, 12], pitch: -80, headUp: 14, jaw: 0.4, pawFL: [8, 14, 74], pawFR: [10, -14, 68], pawHL: [-8, 8.5, 3], pawHR: [-12, -8.5, 3], tailUp: 6 }, 'out'],
  [0.9, { root: [-4, 0, 14], pitch: -86, headUp: 64, jaw: 1, tailUp: 30, pawFL: [12, 18, 84], pawFR: [14, -18, 78] }, 'lin'],
  [1.25, { pawFL: [16, 20, 72], pawFR: [10, -14, 88], turn: 9 }],
  [1.6, { pawFL: [10, 14, 88], pawFR: [16, -20, 72], turn: -9 }],
  [1.95, { pawFL: [16, 20, 74], pawFR: [10, -14, 86], turn: 7 }],
  [2.3, { pawFL: [12, 16, 84], pawFR: [14, -16, 80], turn: 0, headUp: 66 }],
  // (down onto its forepaws, crashing)
  [2.5, { root: [6, 0, -10], pitch: 16, headUp: -14, jaw: 0.4, pawFL: [30, 10, 3], pawFR: [35, -10, 3], tailUp: -8 }, 'in'],
  [3.1, { ...WS }],
];

// THE LUNGE: crouched flat and turned side-on like a runner, its line marked, the mist drawn into it: HELD; gone to mist and through
// you in a blink; it lands beyond you skidding, its claws scoring the ground, and spins round in the skid to face you, crouched.
// (The rules turn it about as the lunge ends: game/act1_rules/f9_bosses.ts.)
const LUNGE: Key<WolfPose>[] = [
  [0, {}],
  [0.4, { root: [-18, 0, -16], pitch: 14, turn: -26, headUp: -12, headTurn: 22, jaw: 0.8, tailUp: -12 }],
  [0.7, { root: [-19, 0, -17], pitch: 15, turn: -28, headTurn: 24, ghost: 0.6 }],
  [0.76, { root: [70, 0, 6], pitch: 0, turn: 0, headTurn: 0, pawFL: [106, 8.5, 12], pawFR: [112, -8.5, 10], pawHL: [22, 8.5, 12], pawHR: [18, -8.5, 10], ghost: 0.95, jaw: 1 }, 'lin'],
  [0.84, { root: [LUNGE_LONG - 10, 0, 6], pawFL: [LUNGE_LONG + 26, 8.5, 12], pawFR: [LUNGE_LONG + 32, -8.5, 10], pawHL: [LUNGE_LONG - 58, 8.5, 12], pawHR: [LUNGE_LONG - 62, -8.5, 10] }, 'lin'],
  // (lands skidding, and spins round in the skid to face back)
  [1.0, { root: [LUNGE_LONG, 0, -8], pitch: 8, turn: 70, roll: -10, pawsTurn: 1, headTurn: 40, ...pawsAt(LUNGE_LONG), ghost: 0.5, jaw: 0.7 }, 'out'],
  [1.25, { turn: 165, roll: 0, headTurn: 10, ghost: 0.15 }, 'out'],
  [1.45, { turn: 180, headTurn: 0, root: [LUNGE_LONG, 0, -10], pitch: 10, headUp: -10, ghost: 0 }, 'out'],
  [1.8, { root: [LUNGE_LONG, 0, 0], pitch: 0, turn: 180, pawsTurn: 1, headUp: 0, jaw: 0.3, tailUp: 0 }],
];

// THE MIST CLOUD: it draws the mist in, its chest swelling, rearing a little; begins to turn; and spins, faster and faster, a TORNADO
// of mist, blasting it out round it, gone into it; turning yet in it, unseen; and spun back out of it, slowing, whole again.
const CLOUD: Key<WolfPose>[] = [
  [0, {}],
  [0.45, { root: [-4, 0, 6], pitch: -12, headUp: 28, jaw: 0.3 }],
  [0.6, { root: [-5, 0, 8], pitch: -14, headUp: 30, turn: 70, pawsTurn: 1 }, 'in'],
  [0.66, { root: [4, 0, -4], pitch: 12, headUp: -16, jaw: 1, turn: 210, ghost: 0.6 }, 'lin'],
  [1.2, { turn: 900, ghost: 0.82 }, 'lin'],
  [2.5, { turn: 1260, ghost: 0.86, jaw: 0.6 }, 'out'],
  [3.2, { ...WS, turn: 1440, pawsTurn: 1, ghost: 0 }, 'out'],
];

/** The mist wolf at `t` seconds into `move`: its loose mist left behind by its going. */
export function wolfPose(move: WolfMove, t: number): WolfPose {
  const keys = move === 'bite' ? BITE : move === 'claw' ? CLAW : move === 'howl' ? HOWL : move === 'lunge' ? LUNGE : CLOUD;
  const at = (q: number): WolfPose => posed<WolfPose>(WS, keys, q);
  const p = at(t);
  const was = at(t - 0.07);
  const v = [(p.root[0] - was.root[0]) / 0.07, (p.root[1] - was.root[1]) / 0.07, (p.root[2] - was.root[2]) / 0.07];
  const cl = (x: number): number => Math.max(-14, Math.min(14, x));
  const held = move === 'bite' ? t > 0.3 && t < 0.55 : move === 'claw' ? t > 0.4 && t < 0.6 : move === 'lunge' ? t > 0.4 && t < 0.7 : move === 'howl' ? t > 0.9 && t < 2.3 : t > 0.45 && t < 0.6;
  const sh = held ? shiver(t, move === 'howl' ? 1.4 : 0.9) : [0, 0, 0];
  // (the bite's coil: its tail lashing; the howl: its mist flaring off it in pulses)
  const lash = move === 'bite' && t < 0.55 ? Math.sin(t * 26) * 14 : 0;
  const flare = move === 'howl' && t > 0.9 && t < 2.3 ? 0.18 + 0.14 * Math.sin(t * 9) : 0;
  return { ...p, t, root: [p.root[0] + sh[0], p.root[1] + sh[1], p.root[2] + sh[2]], tailUp: p.tailUp + lash, ghost: Math.max(p.ghost, flare), swing: [cl(-v[0] * 0.08), cl(-v[1] * 0.08), cl(-v[2] * 0.1)] };
}

// =================================================================================================
// IN THE GAME (art/f9_bosses_art.ts; behind F9_LAIRS, off): each move with him kept on the floor point under him, the ground he
// covers covered by the rules moving him (game/act1_rules/f9_bosses.ts), so that he ends each as he stands; his stand, his walk,
// struck, and his death; and the same of the wolf.

/** A tile, in the figures' own lengths before they are grown (art/new_mobs3.ts TILE3). */
export const TILE3 = 32 / GRID;
/** A tremble's and the poses' own clock for a held loop: `t` round a loop `long` seconds. */
const round = (t: number, long: number): number => ((t % long) + long) % long;

/**
 * HOW FAR A MOVE HAS CARRIED HIM, his own lengths forward, `t` seconds in (the rules move him so far; his picture is kept over the
 * floor point under him): the bull rush and the war cry's strides as far as his pelvis has gone; the slam as far as he leaps, through
 * the time he is off the ground; the smash nowhere.
 */
export function chiefCarry(move: ChiefMove, t: number): number {
  if (move === 'smash') return 0;
  if (move === 'slam') {
    const k = Math.max(0, Math.min(1, (t - 0.3) / 0.72));
    return 11 * k * k * (3 - 2 * k);
  }
  const keys = move === 'warcry' ? WARCRY : RUSH;
  return Math.max(0, posed<ChiefPose>(CHIEF_STAND, keys, t).hip[0]);
}
/** A pose of his moved back `d` (his own lengths) along his forward: kept over a floor point that has gone on so far. */
export function chiefBack(p: ChiefPose, d: number): ChiefPose {
  if (!d) return p;
  return { ...p, hip: [p.hip[0] - d, p.hip[1], p.hip[2]], footL: [p.footL[0] - d, p.footL[1], p.footL[2]], footR: [p.footR[0] - d, p.footR[1], p.footR[2]] };
}
/** The chieftain at `t` seconds into `move` as the game shows him: over the floor point the rules have carried him to. */
export function chiefInPlay(move: ChiefMove, t: number): ChiefPose {
  return chiefBack(chiefPose(move, t), chiefCarry(move, t));
}

/** HIS STAND, WALK, STRUCK AND DEATH IN THE GAME: how many pictures each, how fast; his walk's pace (tiles a second) and loop. */
export const CHIEF_PLAY = {
  idle: { frames: 12, fps: 6 },
  walk: { frames: 12, fps: 12, pace: 1.3 },
  reel: 0.3,
  dies: 3.0,
  /** As his death turns him to stone: from, to (seconds into it). */
  stone: [0.95, 2.5] as const,
} as const;

/** HIM STANDING (his stand's loop, `t` round it): his great chest heaving, his jaw working, his club shifting on his shoulder. */
export function chiefStill(t: number): ChiefPose {
  const L = CHIEF_PLAY.idle.frames / CHIEF_PLAY.idle.fps;
  const a = (round(t, L) / L) * Math.PI * 2;
  const s = CHIEF_STAND;
  return {
    ...s,
    breath: 0.5 + 0.5 * Math.sin(a),
    hip: [0, Math.sin(a) * 1.2, -0.8 + Math.cos(a) * 0.8],
    lean: 4 + Math.sin(a + 0.6) * 2,
    twist: Math.sin(a) * 2,
    headUp: Math.sin(a + 1.2) * 3,
    jaw: 0.25 + 0.2 * Math.max(0, Math.sin(a * 2)),
    fistR: [s.fistR[0], s.fistR[1], s.fistR[2] + Math.sin(a) * 1.4],
    clubEnd: [s.clubEnd[0] + Math.sin(a) * 1.5, s.clubEnd[1], s.clubEnd[2] + Math.sin(a) * 1.4],
    fistL: [s.fistL[0] + Math.sin(a + 0.5) * 1.5, s.fistL[1], s.fistL[2]],
    swing: [0, Math.sin(a) * -0.8, 0],
  };
}

/**
 * HIS WALK (one turn of it, `t` round it): a heavy, rolling stomp, each foot planted flat and the floor going by under it, the other
 * lifted high and set down; his weight rolling over onto the foot that is down, his body turning with his stride, his free arm
 * swinging, his club bouncing on his shoulder, his kilt left behind by his going.
 */
export function chiefWalk(t: number): ChiefPose {
  const W = CHIEF_PLAY.walk;
  const L = W.frames / W.fps;
  const u = round(t, L) / L;
  // (his stride: the floor he covers in a turn, his own lengths; each foot down 0.55 of it)
  const S = (W.pace * L * TILE3) / CK;
  const down = 0.55;
  const foot = (ph: number, l: number): V3 => {
    const v = round(ph, 1);
    if (v < down) return [5 + S * down * (0.5 - v / down), l, 5];
    const k = (v - down) / (1 - down);
    const e = k * k * (3 - 2 * k);
    return [5 + S * down * (-0.5 + e), l * (1 - 0.1 * Math.sin(Math.PI * k)), 5 + 12 * Math.sin(Math.PI * k)];
  };
  const a = u * Math.PI * 2;
  const s = CHIEF_STAND;
  const p: ChiefPose = {
    ...s,
    breath: 0.5 + 0.5 * Math.sin(a * 2),
    footL: foot(u, 18),
    footR: foot(u + 0.5, -18),
    // (lowest as each foot comes down; rolling over onto the foot that is down)
    hip: [3, 4 * Math.cos(a), -2.5 - 3 * Math.cos(a * 2)],
    lean: 12 + Math.cos(a * 2) * 1.5,
    twist: -8 * Math.sin(a),
    headUp: -4 + 2 * Math.cos(a * 2),
    jaw: 0.35,
    fistR: [s.fistR[0], s.fistR[1], s.fistR[2] - 2 * Math.cos(a * 2)],
    clubEnd: [s.clubEnd[0], s.clubEnd[1], s.clubEnd[2] - 3 * Math.cos(a * 2)],
    fistL: [16 - 12 * Math.sin(a), 34, 27 + 4 * Math.cos(a)],
    swing: [0, 0, 0],
  };
  // (what hangs off him, left behind by his going over the floor and by his body's own roll)
  const was = { hip: [3, 4 * Math.cos(a - 0.4), -2.5 - 3 * Math.cos(a * 2 - 0.8)] };
  const dt = (0.4 / (Math.PI * 2)) * L;
  const v = [S / L, (p.hip[1] - was.hip[1]) / dt, (p.hip[2] - was.hip[2]) / dt];
  const cl = (x: number): number => Math.max(-12, Math.min(12, x));
  p.swing = [cl(-v[0] * 0.07), cl(-v[1] * 0.07), cl(-v[2] * 0.09)];
  return p;
}

/** HIM STRUCK (`t` seconds in): rocked back, his head snapped up, a snarl. */
export function chiefReel(t: number): ChiefPose {
  const k = Math.max(0, Math.min(1, t / CHIEF_PLAY.reel));
  const r = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k * 0.4);
  const s = CHIEF_STAND;
  return { ...s, lean: -9 * r, hip: [-4 * r, 0, 1.5 * r], headUp: 14 * r, jaw: 0.3 + 0.6 * r, fistL: [s.fistL[0] - 6 * r, s.fistL[1] + 6 * r, s.fistL[2] + 8 * r], swing: [5 * r, 0, 2 * r] };
}

const DIES: Key<ChiefPose>[] = [
  [0, {}],
  // (struck his death blow: thrown back, his head snapped up, his free arm flung out, a roar)
  [0.2, { lean: -24, hip: [-7, 0, 4], headUp: 34, jaw: 1, fistL: [-6, 54, 72], ...club([12, -40, 104], [-30, -34, 36]) }, 'out'],
  // (his knees give: down on one knee, the club driven head-first into the ground before him, both hands on it, his head hung)
  [0.62, { twoHand: true, lean: 14, hip: [6, 0, -17], headUp: -12, jaw: 0.6, ...club([28, -8, 46], [52, 0, -22]), footL: [18, 18, 5], footR: [-20, -18, 5] }, 'in'],
  [0.85, { lean: 18, hip: [6, 0, -19], headUp: -18, jaw: 0.4 }, 'out'],
  // (a last roar up at the sky, as the stone creeps up him from the floor: and he is stone, kneeling on his club, roaring)
  [1.3, { lean: 4, hip: [6, 0, -18], headUp: 30, jaw: 1, ...club([28, -8, 48], [52, 0, -24]) }],
  [1.7, { lean: 3, headUp: 33 }],
  [3.0, { lean: 3, headUp: 33 }],
];
/** HIS DEATH (`t` seconds in): to one knee on his club, a last roar, and TURNED TO STONE as he roars (as trolls are), kneeling there. */
export function chiefDie(t: number): ChiefPose {
  const p = posed<ChiefPose>({ ...CHIEF_STAND }, DIES, t);
  const [a, b] = CHIEF_PLAY.stone;
  const k = Math.max(0, Math.min(1, (t - a) / (b - a)));
  // (shaking as the stone takes him, stopping as it does)
  const sh = t > 1.3 && k < 1 ? shiver(t, 1.2 * (1 - k)) : [0, 0, 0];
  const was = posed<ChiefPose>({ ...CHIEF_STAND }, DIES, t - 0.07);
  const v = [(p.hip[0] - was.hip[0]) / 0.07, (p.hip[1] - was.hip[1]) / 0.07, (p.hip[2] - was.hip[2]) / 0.07];
  const cl = (x: number): number => Math.max(-12, Math.min(12, x));
  return { ...p, hip: [p.hip[0] + sh[0], p.hip[1] + sh[1], p.hip[2] + sh[2]], stone: k, rimless: true, swing: k > 0.3 ? [0, 0, 0] : [cl(-v[0] * 0.07), cl(-v[1] * 0.07), cl(-v[2] * 0.09)] };
}

// THE MIST WOLF'S, IN THE GAME

/** How far a move has carried it, its own lengths forward, `t` seconds in: as far as its body has gone forward (never back past where it stood). */
export function wolfCarry(move: WolfMove, t: number): number {
  if (move === 'howl' || move === 'cloud') return 0;
  const keys = move === 'bite' ? BITE : move === 'claw' ? CLAW : LUNGE;
  return Math.max(0, posed<WolfPose>(WS, keys, t).root[0]);
}
/** A pose of its moved back `d` (its own lengths) along its forward. */
export function wolfBack(p: WolfPose, d: number): WolfPose {
  if (!d) return p;
  const b = (q: V3): V3 => [q[0] - d, q[1], q[2]];
  return { ...p, root: b(p.root), pawFL: b(p.pawFL), pawFR: b(p.pawFR), pawHL: b(p.pawHL), pawHR: b(p.pawHR) };
}
/** The mist wolf at `t` seconds into `move` as the game shows it: over the floor point the rules have carried it to. */
export function wolfInPlay(move: WolfMove, t: number): WolfPose {
  return wolfBack(wolfPose(move, t), wolfCarry(move, t));
}

export const WOLF_PLAY = {
  idle: { frames: 12, fps: 6 },
  walk: { frames: 10, fps: 16, pace: 2.4 },
  reel: 0.3,
  dies: 2.4,
} as const;

/** IT STANDING: its flanks heaving, its head low and turning a little, its tail swaying, its mist drifting off it. */
export function wolfStill(t: number): WolfPose {
  const L = WOLF_PLAY.idle.frames / WOLF_PLAY.idle.fps;
  const a = (round(t, L) / L) * Math.PI * 2;
  return { ...WOLF_STAND, t, root: [0, 0, Math.sin(a) * 0.9], pitch: 2 + Math.sin(a + 0.8) * 1.5, headUp: -4 + Math.sin(a + 1.4) * 3, headTurn: Math.sin(a) * 5, jaw: 0.3 + 0.12 * Math.sin(a * 2), tailUp: -4 + Math.sin(a) * 5, swing: [Math.sin(a) * 1.5, Math.cos(a) * 2, 0] };
}

/**
 * ITS WALK (one turn of it, `t` round it): a long, low, gliding trot, each foreleg and the hind leg across from it together, its paws
 * gripping the floor as it goes by; its back level, its head low and forward, its tail out behind it streaming.
 */
export function wolfWalk(t: number): WolfPose {
  const W = WOLF_PLAY.walk;
  const L = W.frames / W.fps;
  const u = round(t, L) / L;
  const S = (W.pace * L * TILE3) / WK;
  const down = 0.5;
  const paw = (ph: number, home: V3): V3 => {
    const v = round(ph, 1);
    if (v < down) return [home[0] + S * down * (0.5 - v / down), home[1], 3];
    const k = (v - down) / (1 - down);
    const e = k * k * (3 - 2 * k);
    return [home[0] + S * down * (-0.5 + e), home[1], 3 + 9 * Math.sin(Math.PI * k)];
  };
  const a = u * Math.PI * 2;
  const s = WOLF_STAND;
  return {
    ...s,
    t,
    root: [4, 0, -3 + 1.6 * Math.cos(a * 2)],
    pitch: 4 + Math.sin(a * 2) * 1.2,
    headUp: -10 + 2 * Math.cos(a * 2),
    headTurn: 0,
    jaw: 0.4,
    pawFL: paw(u, s.pawFL),
    pawHR: paw(u, s.pawHR),
    pawFR: paw(u + 0.5, s.pawFR),
    pawHL: paw(u + 0.5, s.pawHL),
    tailUp: 6 + 3 * Math.sin(a * 2),
    swing: [-Math.min(14, (S / L) * 0.08), 0, -1.6 * Math.sin(a * 2)],
  };
}

/** IT STRUCK: flinched back, its head flung up, a snarl. */
export function wolfReel(t: number): WolfPose {
  const k = Math.max(0, Math.min(1, t / WOLF_PLAY.reel));
  const r = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k * 0.4);
  return { ...WOLF_STAND, t, root: [-6 * r, 0, 2 * r], pitch: -8 * r, headUp: 14 * r, jaw: 0.25 + 0.7 * r, tailUp: -10 * r, swing: [6 * r, 0, 1 * r] };
}

const WOLF_DIES: Key<WolfPose>[] = [
  [0, {}],
  // (struck its death blow: rearing back, its head flung up, a howl cut short)
  [0.18, { root: [-9, 0, 7], pitch: -16, headUp: 30, jaw: 1, tailUp: -20 }, 'out'],
  // (its legs give; it sinks down onto its belly, its head going down)
  [0.55, { root: [-4, 0, -17], pitch: 6, headUp: -14, jaw: 0.5, pawFL: [30, 12, 3], pawFR: [35, -12, 3], pawHL: [-14, 11, 3], pawHR: [-19, -11, 3], ghost: 0.2 }, 'in'],
  [0.95, { root: [0, 0, -27], pitch: 10, headUp: -26, jaw: 0.3, ghost: 0.45 }, 'out'],
  // (and it comes apart into the mist it was, from its tail to its eyes, and is blown away)
  [1.2, { ghost: 0.6, gone: 0 }],
  [2.2, { ghost: 0.9, gone: 1 }],
  [2.4, { gone: 1 }],
];
/** ITS DEATH (`t` seconds in): its legs give, it sinks down, and it comes apart into nothing, its eyes last. */
export function wolfDie(t: number): WolfPose {
  const p = posed<WolfPose>({ ...WOLF_STAND, gone: 0 }, WOLF_DIES, t);
  return { ...p, t, rimless: true };
}

/** His club's head at a pose (his own lengths): where it lands. */
export function chiefClubHead(p: ChiefPose): V3 {
  const a = p.fistR;
  const b = p.clubEnd;
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const n = Math.hypot(d[0], d[1], d[2]) || 1;
  const L = CLUB_LONG * 0.95;
  return [a[0] + p.hip[0] + (d[0] / n) * L, a[1] + p.hip[1] + (d[1] / n) * L, a[2] + p.hip[2] + (d[2] / n) * L];
}
