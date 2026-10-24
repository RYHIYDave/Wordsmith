// THE BRAWLER MOVING (the art chat, 24 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct (Pacific), by 22:07: “Bare-knuckle boxer” (jabs, hooks and uppercuts; footwork and combos); “Light and
// bouncy” (always on his toes, darting in and out); “Bone-crunching (Recommended)” (fewer, huge blows: a freeze, a
// shockwave and a screen kick on each); standing still, “Cocky, taunting (Recommended)”. Asked what next, 24 Oct, by 12:43:
// “Animate the brawler (Recommended)”. His art rulebook: Animations 1, “as big and wild and kinetic and weighty as
// possible”; Movement: weight first, every blow winds up and follows through, loose things follow, alive when still, feet
// grip the floor.
//
// His moves are keys of the heroes' own bones (art/skeleton.ts Key3, bonesAt), as the knight's are (art/moves3.ts), drawn
// by the brawler's sculpt (dev/sculpt_classes.ts sculptBrawler) a frame at a time; his coat's tails trail his body
// (COAT_SWING).

import { GRIP_SPEED, HEAD_B, UNITS_PER_TILE } from '../art/moves3';
import { bonesAt, buildOf, solve } from '../art/skeleton';
import type { Bones, Build, Key3, Motion, Posed, V3 } from '../art/skeleton';
import { BRAWLER_BUILD, BRAWLER_LOOKS, COAT_SWING, boxerStance, sculptBrawler } from './sculpt_classes';
import type { Drawn } from './sculpt';
import type { GameView } from '../art/skin';

const FR = 1 / 30;
void FR;

/** His build (his pick, B) and his stance: what every key of his starts from. */
export const BRAWLER_B: Build = (() => {
  const L = BRAWLER_LOOKS[BRAWLER_BUILD];
  return buildOf(L.tall, HEAD_B * L.head, L.shape);
})();
/**
 * HIS STANCE AS HE MOVES (his word, 24 Oct, by 13:38, of a picture of two men sparring: “the guy on the left is kinda what
 * I want to idle stance to be”): more upright than the standing picture's, his feet set wide, his knees soft, his fists up
 * before his chest and chin with his elbows out, his chest turned more toward what he faces.
 */
export const GUARD: Bones = (() => {
  const g = boxerStance(BRAWLER_B);
  const t = BRAWLER_B.tall / 57;
  return {
    ...g,
    pz: -2.9 * t, yaw: -12, twist: 6, bend: 3, pitch: -1, faceUp: 2,
    // his feet set wide, flat on the floor, his legs near straight
    lfx: 6.6 * t, lfy: 5.0 * t, lfz: 0, lfp: 0, rfx: -5.6 * t, rfy: -5.2 * t, rfz: 0, rfp: 0, lk: 10, rk: -8,
    // his fists before his chest, a little apart, his elbows out from his sides (a swing below 0 takes an elbow out)
    lhIn: 0, lhx: 9.0 * t, lhy: -0.4 * t, lhz: -3.4 * t, le: -22,
    rhIn: 0, rhx: 6.6 * t, rhy: 0.6 * t, rhz: -2.8 * t, re: -18,
  };
})();
const T = BRAWLER_B.tall / 57;

/**
 * HIS BOUNCE COMES FROM HIS KNEES AND CALVES, HIS FEET PLANTED (his word, 24 Oct: “He’s not bouncing, he’s like twisting on
 * his ankles?  It looks like he’s dancing.”): `k` of the way up (1) or down into his knees (-1); his feet do not move.
 */
/** How long his shuffle runs, in from his guard and back out to it. */
const SHUFFLE_LONG = 0.2 + 6 * 0.13 + 0.32;
function bob(k: number): Partial<Bones> {
  return { pz: GUARD.pz + (k > 0 ? 1.1 : 0.8) * T * k };
}

/** His guard, tight: his fists up by his cheeks, his elbows tucked in to his ribs (his “brings his hands up closer to his head”). */
const TIGHT: Partial<Bones> = { lhIn: 0, lhx: 7.4 * T, lhy: 0.9 * T, lhz: 4.4 * T, le: 100, rhIn: 0, rhx: 5.0 * T, rhy: -0.8 * T, rhz: 4.8 * T, re: 100 };

/** Where his right fist is at his nose, for the pose `q` (the place a hand is measured from: its shoulder, along his chest). */
function rightFistAtNose(q: Partial<Bones>, across: number): Partial<Bones> {
  const s = solve(BRAWLER_B, { ...GUARD, ...q } as Posed);
  const [hf, hl, hu] = s.face;
  const R = BRAWLER_B.headR;
  // (the side of his nose: a little before his face, the fist's middle a fist's half-width off it)
  const nose = [0, 1, 2].map((i) => s.head[i] + hf[i] * R[0] * 1.55 + hl[i] * R[1] * across - hu[i] * R[2] * 0.25) as unknown as V3;
  const [cf, cl, cu] = s.chest;
  const v = [nose[0] - s.shoulderR[0], nose[1] - s.shoulderR[1], nose[2] - s.shoulderR[2]];
  const d = (a: V3): number => v[0] * a[0] + v[1] * a[1] + v[2] * a[2];
  return { rhIn: 0, rhx: d(cf), rhy: d(cl), rhz: d(cu), re: 70 };
}

/**
 * STANDING (a 5.2 s round), ALL BOXER (his word, 24 Oct: “stick to boxer stuff for idle animations, like brings his hands
 * up closer to his head, rolls his shoulders and neck, swipes his nose with his thumb, does a short couple shadowbox
 * punches”), in the wide guard he showed (GUARD): he bounces from his knees, his feet planted; shuffles his feet; brings his
 * fists up tight by his head; rolls his shoulders, one and the other, and his neck round; swipes his nose with his right
 * thumb and sniffs; throws a jab, a jab and a cross at the air, snapping each back; and bounces on. His word of it, by 15:47:
 * “The step and follow is weird but I think the rest is okay”.
 */
export function brawlerStand(): Motion {
  const keys: Key3[] = [];
  let off = 0;
  const add = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: at + off, pose, ease });
  };
  add(0, { ...bob(0) });
  // THREE BOUNCES, the fists a beat behind his body
  for (let i = 0; i < 3; i++) {
    const t0 = i * 0.3;
    add(t0 + 0.15, { ...bob(1), lhz: GUARD.lhz - 0.7, rhz: GUARD.rhz - 0.6 }, 'out');
    add(t0 + 0.3, { ...bob(-1), lhz: GUARD.lhz + 0.6, rhz: GUARD.rhz + 0.5 }, 'in');
  }
  // THE SHUFFLE (his word, by 13:38: “the foot shuffle ... would be a idle animation”; the picture he sent shows it done by
  // the man on the right, the man on the left keeping his feet planted): his feet drawn in under him, then switched front
  // and back, quick, six times, a little hop to each, both feet off the floor between, set down flat where they land
  const MID = (GUARD.lfx + GUARD.rfx) / 2;
  const HALF = 2.4 * T;
  const SHUF = 0.13;
  // where his feet are: k 1, his lead foot forward; -1, switched; GUARD (k null), out in his wide guard
  const spot = (k: number | null): { lfx: number; rfx: number; twist: number } =>
    k === null ? { lfx: GUARD.lfx, rfx: GUARD.rfx, twist: GUARD.twist } : { lfx: MID + HALF * k, rfx: MID - HALF * k, twist: GUARD.twist + 4 * k };
  const mix = (a: number | null, b: number | null, u: number): Partial<Bones> => {
    const p = spot(a);
    const q = spot(b);
    return { lfx: p.lfx + (q.lfx - p.lfx) * u, rfx: p.rfx + (q.rfx - p.rfx) * u, twist: p.twist + (q.twist - p.twist) * u };
  };
  const up = (hop: number, low: number): Partial<Bones> => ({
    pz: GUARD.pz + low * T + 0.8 * T * hop, lfz: GUARD.lfz + 1.0 * T * hop, rfz: GUARD.rfz + 1.0 * T * hop,
  });
  // one hop: his feet lifted clear before they move, set down where they go before he settles
  const hopTo = (t0: number, long: number, a: number | null, b: number | null, low: number, land: number): void => {
    add(t0 + long * 0.23, { ...mix(a, b, 0.06), ...up(0.85, low) }, 'out');
    add(t0 + long * 0.46, { ...mix(a, b, 0.5), ...up(1, low) }, 'io');
    add(t0 + long * 0.69, { ...mix(a, b, 0.94), ...up(0.85, low) }, 'io');
    add(t0 + long * 0.85, { ...mix(a, b, 1), ...up(0, low) }, 'in');
    add(t0 + long, { ...mix(a, b, 1), ...up(0, land) }, 'out');
  };
  hopTo(0.9, 0.2, null, 1, 0.6, 0.4);
  for (let i = 0; i < 6; i++) hopTo(1.1 + i * SHUF, SHUF, i % 2 ? -1 : 1, i % 2 ? 1 : -1, 0.6, 0.4);
  hopTo(1.1 + 6 * SHUF, 0.2, 1, null, 0.4, -0.5);
  add(1.1 + 6 * SHUF + 0.32, { ...bob(0), lfz: GUARD.lfz, rfz: GUARD.rfz }, 'out');
  off = SHUFFLE_LONG;
  // HIS FISTS UP TIGHT BY HIS HEAD; HIS SHOULDERS ROLLED, ONE AND THE OTHER; HIS NECK ROLLED ROUND
  add(1.08, { ...bob(0.4), ...TIGHT, bend: GUARD.bend + 3 }, 'io');
  add(1.3, { ...bob(-0.3), ...TIGHT, side: -6, twist: GUARD.twist + 7, bend: GUARD.bend - 2, faceTilt: 8, rhz: (TIGHT.rhz as number) + 1.2 }, 'io');
  add(1.52, { ...bob(0.3), ...TIGHT, side: 6, twist: GUARD.twist - 5, bend: GUARD.bend - 2, faceTilt: -8, lhz: (TIGHT.lhz as number) + 1.2 }, 'io');
  add(1.72, { ...bob(-0.2), ...TIGHT, faceTilt: -12, faceUp: 6, faceTurn: GUARD.faceTurn + 6 }, 'io');
  add(1.9, { ...bob(0.2), ...TIGHT, faceTilt: 0, faceUp: 12, faceTurn: GUARD.faceTurn }, 'io');
  add(2.06, { ...bob(-0.2), ...TIGHT, faceTilt: 12, faceUp: 4, faceTurn: GUARD.faceTurn - 4 }, 'io');
  add(2.2, { ...bob(0), ...TIGHT, faceTilt: 0, faceUp: 0 }, 'io');
  // HIS NOSE SWIPED WITH HIS RIGHT THUMB, A SNIFF (the head flicked up)
  const swipeFrom = { ...bob(0.2), ...TIGHT, faceUp: 2 };
  add(2.36, { ...swipeFrom, ...rightFistAtNose(swipeFrom, -0.9) }, 'out');
  const swipeTo = { ...bob(0.1), ...TIGHT, faceUp: 9, faceTurn: GUARD.faceTurn - 6 };
  add(2.5, { ...swipeTo, ...rightFistAtNose(swipeTo, 0.9) }, 'io');
  add(2.64, { ...bob(-0.3), ...TIGHT }, 'io');
  // A SHORT COUPLE OF SHADOWBOX PUNCHES: a jab, a jab, a cross, each snapped back to his guard
  const jab: Partial<Bones> = { lhIn: 0, lhx: 17.5 * T, lhy: -1.2 * T, lhz: 3.2 * T, le: 8, twist: GUARD.twist - 6, px: GUARD.px + 0.8 };
  // (each punch shot out fast and stopped at full reach, held there a frame, and snapped back: a fist does not bounce off
  // the air)
  add(2.74, { ...bob(0.2), ...TIGHT, ...jab }, 'out');
  add(2.77, { ...bob(0.2), ...TIGHT, ...jab, lhx: (jab.lhx as number) - 0.3 }, 'io');
  add(2.86, { ...bob(0), ...TIGHT }, 'io');
  add(2.96, { ...bob(0.2), ...TIGHT, ...jab }, 'out');
  add(2.99, { ...bob(0.2), ...TIGHT, ...jab, lhx: (jab.lhx as number) - 0.3 }, 'io');
  add(3.08, { ...bob(0), ...TIGHT }, 'io');
  const cross: Partial<Bones> = { rhIn: 0, rhx: 18 * T, rhy: 2.6 * T, rhz: 3.4 * T, re: 6, twist: GUARD.twist + 14, yaw: GUARD.yaw + 6, px: GUARD.px + 1.4, rfp: GUARD.rfp + 8, rft: GUARD.rft + 10 };
  add(3.2, { ...bob(0.1), ...TIGHT, ...cross }, 'out');
  add(3.24, { ...bob(0.1), ...TIGHT, ...cross, rhx: (cross.rhx as number) - 0.3 }, 'io');
  add(3.38, { ...bob(-0.4), ...TIGHT }, 'in');
  // and back to his guard, bouncing
  add(3.56, { ...bob(0.8) }, 'io');
  add(3.74, { ...bob(-0.8) }, 'io');
  add(3.9, { ...bob(0) }, 'io');
  return { keys, loop: 0 };
}

/**
 * HE RUNS (his word, 24 Oct, of the boxer's step-and-follow carried over the floor: “Nah man, just have him run, that looks
 * like he has shit and is shuffling to the bathroom”): a heavy man's run, two steps a round, each foot on the floor a third
 * of it and both off it between, leaning into it with his head up; his hips swing with his legs and his chest against them;
 * his fists balled, his arms driving low at his sides, bent, each forward as the other leg is.
 *   HIS FEET GRIP THE FLOOR (Movement 8; his word of the step-and-follow: “Feet slide on the spot (Recommended)”): the game
 * carries him at a hero's own speed, and a foot down goes back under him just as fast, flat, so that it stays where it is;
 * it lifts before it goes forward, its heel flung up behind, and is set down flat before it stops.
 */
export const RUN_ROUND = 12 / 30;
/** How far forward the game carries him a second, in his own measure: a hero's speed in the game (art/moves3.ts GRIP_SPEED). */
export const RUN_CARRY = GRIP_SPEED * UNITS_PER_TILE;
const RUN_ON = 0.32;
export function brawlerRun(): Motion {
  const P = RUN_ROUND;
  const S = RUN_CARRY * P;
  const A = (S * RUN_ON) / 2;
  const C = -1 * T;
  const DWELL = 0.1;
  const KICK = 8 * T;
  const foot = (phase: number): { x: number; z: number; p: number } => {
    const q = ((phase % 1) + 1) % 1;
    if (q < RUN_ON) return { x: C + A - S * q, z: 0, p: 0 };
    const v = (q - RUN_ON) / (1 - RUN_ON);
    const u = Math.max(0, Math.min(1, (v - DWELL) / (1 - 2 * DWELL)));
    const go = u * u * (3 - 2 * u);
    // (up quick, the heel flung up behind, then the foot carried through and reached out flat to land)
    const z = KICK * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.6)), 0.6);
    const p = v < 0.25 ? 45 * (v / 0.25) : v < 0.85 ? 45 - 51 * ((v - 0.25) / 0.6) : -6 * (1 - (v - 0.85) / 0.15);
    return { x: C + A + S * go - S * q, z, p };
  };
  const L = BRAWLER_B.upperArm + BRAWLER_B.foreArm;
  // (an arm: k 0 furthest back, nearly straight; 1 furthest forward, bent, the fist come up before his belly)
  const arm = (k: number): [number, number] => [L * (-0.22 + 0.62 * k), L * (-0.86 + 0.36 * k)];
  const HIPS = 8;
  const COUNTER = 0.6;
  const keys: Key3[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const turn = Math.cos(ph * Math.PI * 2);
    const l = foot(ph);
    const r = foot(ph + 0.5);
    const ra = arm((1 + turn) / 2);
    const la = arm((1 - turn) / 2);
    keys.push({
      at: ph * P,
      ease: 'lin',
      pose: {
        px: 0, py: 0,
        pz: -4 * T - 1.2 * T * Math.cos((ph - RUN_ON / 2) * Math.PI * 4),
        yaw: -HIPS * turn, pitch: 10, roll: 2 * Math.cos((ph - RUN_ON / 2) * Math.PI * 2),
        twist: (1 + COUNTER) * HIPS * turn, bend: 5 + 1.2 * Math.cos(ph * Math.PI * 4), side: 0,
        faceTurn: 0, faceUp: 4, faceTilt: 0,
        lfx: l.x, lfy: -0.8 * T, lfz: l.z, lfp: l.p, lft: 2, lk: 2,
        rfx: r.x, rfy: 0.8 * T, rfz: r.z, rfp: r.p, rft: -2, rk: -2,
        rhIn: 1, rhx: ra[0], rhy: -1.6 * T, rhz: ra[1], re: 12,
        lhIn: 1, lhx: la[0], lhy: 1.6 * T, lhz: la[1], le: 12,
      },
    });
  }
  return { keys, loop: 0 };
}

/** A move of his, ready to draw: its keys, how long it is, and whether it goes round. */
export interface BrawlerMove {
  name: string;
  motion: Motion;
  long: number;
  loops: boolean;
  /** How fast the game carries him across the floor while it plays (tiles a second; 0 for none): his coat blown back by it. */
  travel?: number;
  /** ... and the same, forward, in his own measure a second: a foot down on the floor goes back under him just as fast. */
  carry?: number;
}
export function brawlerMoves(): BrawlerMove[] {
  return [
    { name: 'Standing: boxer habits', motion: brawlerStand(), long: 3.9 + SHUFFLE_LONG, loops: true },
    { name: 'Running', motion: brawlerRun(), long: RUN_ROUND, loops: true, travel: GRIP_SPEED, carry: RUN_CARRY },
  ];
}

/** His pose at a moment of a move. */
export function brawlerPose(m: Motion, t: number): Posed {
  return bonesAt(m.keys, GUARD, t);
}

/**
 * Draw him at a moment of a move, his coat's tails trailing behind where his body has been: they hang from where his hips
 * were `LAG` seconds ago, as cloth does (Movement 4, “Loose things follow”).
 */
const LAG = 0.12;
export function drawBrawlerAt(view: GameView, m: Move, t: number, turn = 0): Drawn {
  const pose = brawlerPose(m.motion, t);
  const before = brawlerPose(m.motion, m.loops ? (((t - LAG) % m.long) + m.long) % m.long : Math.max(0, t - LAG));
  const now = solve(BRAWLER_B, pose).pelvis;
  const was = solve(BRAWLER_B, before).pelvis;
  const blown = (m.travel ?? 0) * 0.9;
  const v: V3 = [(was[0] - now[0]) * 1.4 - blown, (was[1] - now[1]) * 1.4, (was[2] - now[2]) * 0.8 + blown * 0.25];
  const cap = 4.5;
  const n = Math.hypot(v[0], v[1], v[2]);
  COAT_SWING.v = n > cap ? [(v[0] * cap) / n, (v[1] * cap) / n, (v[2] * cap) / n] : v;
  try {
    return sculptBrawler(view, pose, BRAWLER_BUILD, undefined, turn);
  } finally {
    COAT_SWING.v = [0, 0, 0];
  }
}
type Move = BrawlerMove;
