// THE TINKERER MOVING (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Her brief (23 Oct): “Gleeful mad bomber (Recommended)” (loves the blasts, grinning behind her goggles, a bit reckless);
// “Quick and nimble (Recommended)” (light on her feet, rolling and slipping out of reach); her kit, the wrench over her
// shoulder, “1. Wrench on shoulder (Recommended)”. Asked, 27 Oct, where to start with her: “Her first (Recommended)”; her
// swipe, “Blast jump (Recommended)”. Her moves as the other heroes' are: keys of her own bones (art/skeleton.ts) from her
// stance (dev/sculpt_tinkerer.ts tinkererStance), drawn by her sculpture a frame at a time. His art rulebook's Movement:
// weight first; each her own way (hers: light, quick, bouncing, gleeful); loose things follow (her ponytail); slick; alive
// when still; her feet grip the floor.

import { GRIP_SPEED, UNITS_PER_TILE } from '../art/moves3';
import { bonesAt, elbowFor, solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';
import { TINKERER_BODY, TINK_SWAY, sculptTinkerer, tinkererStance } from './sculpt_tinkerer';

export const FR = 1 / 30;
export const TINK_B = TINKERER_BODY;
/** Her stance: crouched light on her toes, the wrench over her right shoulder, her left fist on her hip. */
export const TSTANCE: Bones = tinkererStance(TINK_B);
const T = TINK_B.tall / 55;

/** A move of hers. */
export interface TinkMove {
  name: string;
  motion: Motion;
  long: number;
  loops: boolean;
  /** How fast the game carries her (tiles a second), and the same in her own measure a second. */
  travel?: number;
  carry?: number;
  /** What she holds at a moment: the wrench off her shoulder (0 to 1), twirled, spun round; a vial out (dev/sculpt_tinkerer.ts TINK_SWAY). */
  hold?: (t: number) => { wrench: number; twirl: boolean; spin: number; vial: number };
  /** When she is off the floor altogether (a hop): from and to, seconds. */
  air?: [number, number][];
}

const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
const bump = (ph: number, at: number, long: number): number => {
  const d = (((ph - at) % 1) + 1) % 1;
  return d < long ? 0.5 - 0.5 * Math.cos((d / long) * Math.PI * 2) : 0;
};
const S0 = TSTANCE;

// ---- STANDING (a 6 s round): HER OWN (his word of the first, 27 Oct: “She needs a unique run and stand”). ALIVE WHEN STILL,
// A GLEEFUL, RECKLESS BOMBER: she stands cocky on the balls of her feet, her weight on her back foot, bouncing; she swings
// the wrench off her shoulder out to her side and TWIRLS it round in her fist like a baton, catches it and slings it back
// up; she pulls a vial off her belt, holds it up by her ear and SHAKES it, her head cocked, listening to it fizz, grinning,
// and tucks it away; and she hops on the spot and GIGGLES, her shoulders shaking. Then cocky again, looking round.
export const TSTAND_LONG = 6.0;
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const plus = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const times = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const STANCE_S = solve(TINK_B, TSTANCE as Posed);
const [CF, CL, CU] = STANCE_S.chest;
/** A point of her own space, from a point of her stance, along her chest's ways (forward, to her left, up). */
const from = (p: V3, fw: number, lf: number, up: number): V3 => plus(p, plus(times(CF, fw * T), plus(times(CL, lf * T), times(CU, up * T))));
/** Her right hand (the wrench's) at a point of her own space, for a pose: as her shoulder and chest are in that pose. */
function rightTo(q: Partial<Bones>, want: V3, e: number): Partial<Bones> {
  const s = solve(TINK_B, { ...TSTANCE, ...q } as Posed);
  const [cf, cl, cu] = s.chest;
  const v: V3 = [want[0] - s.shoulderR[0], want[1] - s.shoulderR[1], want[2] - s.shoulderR[2]];
  return { rhIn: 0, rhx: dot(v, cf), rhy: dot(v, cl), rhz: dot(v, cu), re: e };
}
/** Her left hand at a point of her own space, its elbow pointing `elbow`. */
function leftTo(q: Partial<Bones>, want: V3, elbow: V3): Partial<Bones> {
  const pose = { ...TSTANCE, ...q, lhIn: 2 as const, lhx: want[0], lhy: want[1], lhz: want[2] };
  return { lhIn: 2, lhx: want[0], lhy: want[1], lhz: want[2], le: elbowFor(TINK_B, pose as Posed, true, elbow) };
}
/** Her bounce on the balls of her feet: down (-1), up (1). */
const bob = (k: number): Partial<Bones> => ({ pz: S0.pz + 0.7 * T * k, bend: S0.bend - 2 * k, faceUp: S0.faceUp + 1.5 * k });
/** Cocky: her weight on her back foot, her hip cocked out. */
const cocky = (k: number): Partial<Bones> => ({ side: S0.side + 3 * k, yaw: S0.yaw - 4 * k, faceTilt: S0.faceTilt + 4 * k });
const HAND_R0 = STANCE_S.handR;
const HEAD0 = STANCE_S.head;
/** The keys of what she holds (seconds): the wrench off her shoulder; twirled straight up; spun round; the vial out. */
const STAND_WRENCH: [number, number][] = [[0, 0], [0.85, 0], [1.2, 1], [1.95, 1], [2.25, 0], [TSTAND_LONG, 0]];
const STAND_SPIN: [number, number][] = [[0, 0], [1.38, 0], [1.82, Math.PI * 2], [TSTAND_LONG, Math.PI * 2]];
const STAND_VIAL: [number, number][] = [[0, 0], [2.62, 0], [2.64, 1], [3.66, 1], [3.68, 0], [TSTAND_LONG, 0]];
/** When she is off the floor, hopping. */
const HOP: [number, number] = [4.2, 4.42];
export function tinkerStand(): Motion {
  const keys: Key3[] = [];
  const k = (at: number, pose: Partial<Bones>, e: Key3['ease'] = 'io'): void => {
    keys.push({ at, ease: e, pose });
  };
  // (her right hand held out at her side for the twirl, her arm out straight)
  const side: V3 = from(STANCE_S.shoulderR, 3, -9, -4);
  const twirl = (q: Partial<Bones>): Partial<Bones> => ({ ...q, ...rightTo(q, side, 10), faceTurn: S0.faceTurn - 14, faceUp: S0.faceUp + 2 });
  // (her left at her belt; up by her ear; shaken)
  const belt: V3 = from(STANCE_S.pelvis, 4.5, 4.5, 3);
  const ear = (sh: number): V3 => plus(from(HEAD0, 1.5, 6.5, -1), times(CU, sh * T));
  const hand0 = { ...rightTo({}, HAND_R0, S0.re) };
  // COCKY, BOUNCING
  k(0, { ...bob(0), ...cocky(1), ...hand0 });
  k(0.3, { ...bob(-1), ...cocky(1), ...hand0 });
  k(0.6, { ...bob(1), ...cocky(1), faceTurn: S0.faceTurn - 8, ...hand0 });
  k(0.85, { ...bob(-0.6), ...cocky(0.8), faceTurn: S0.faceTurn - 12, ...hand0 });
  // THE TWIRL: the wrench off her shoulder out to her side, spun round in her fist, caught, slung back up
  k(1.3, twirl({ ...bob(0.4), ...cocky(0.6) }));
  k(1.6, twirl({ ...bob(-0.3), ...cocky(0.6), faceUp: S0.faceUp + 4 }));
  k(1.95, twirl({ ...bob(0.2), ...cocky(0.6) }));
  k(2.25, { ...bob(-0.6), ...cocky(0.8), faceTurn: S0.faceTurn + 4, ...hand0 }, 'out');
  // THE VIAL: off her belt, up by her ear, shaken, her head cocked to it, listening; tucked away again
  const vq = (sh: number, look: number): Partial<Bones> => {
    const q = { ...bob(0.2 * sh), ...cocky(0.4), faceTurn: S0.faceTurn + 22 * look, faceTilt: S0.faceTilt + 10 * look, faceUp: S0.faceUp + 2, ...hand0 };
    return { ...q, ...leftTo(q, ear(sh), [-3, 10, -4]) };
  };
  const bq = (): Partial<Bones> => {
    const q = { ...bob(-0.4), ...cocky(0.6), faceTurn: S0.faceTurn + 6, faceUp: S0.faceUp - 6, ...hand0 };
    return { ...q, ...leftTo(q, belt, [-6, 9, -2]) };
  };
  k(2.45, { ...bob(0), ...cocky(0.8), ...hand0 });
  k(2.62, bq());
  k(2.9, vq(0, 0.6));
  k(3.0, vq(1, 1), 'lin');
  k(3.1, vq(-1, 1), 'lin');
  k(3.2, vq(1, 1), 'lin');
  k(3.3, vq(-1, 1), 'lin');
  k(3.42, vq(0, 0.8));
  k(3.66, bq());
  k(3.9, { ...bob(0.2), ...cocky(0.6), ...hand0 });
  // THE HOP AND THE GIGGLE: down on her knees, up off the floor, down again, her shoulders shaking
  const air = (z: number): Partial<Bones> => ({ lfz: (S0.lfz ?? 0) + z * T, rfz: (S0.rfz ?? 0) + z * T });
  k(4.08, { ...bob(-1.6), ...cocky(0.2), ...hand0, ...air(0) }, 'in');
  k(4.2, { ...bob(0.4), ...cocky(0), faceUp: S0.faceUp + 8, ...hand0, ...air(0) }, 'out');
  k(4.31, { ...bob(1.2), pz: S0.pz + 3.2 * T, ...cocky(0), faceUp: S0.faceUp + 12, ...hand0, ...air(2.4) }, 'io');
  k(4.42, { ...bob(0.4), ...cocky(0), faceUp: S0.faceUp + 10, ...hand0, ...air(0) }, 'in');
  const giggle = (sh: number, up: number): Partial<Bones> => ({ ...bob(up), ...cocky(0.3), shrug: (S0.shrug ?? 0) + 0.28 * sh, faceUp: S0.faceUp + 12 + 3 * sh, faceTilt: S0.faceTilt + 8, hunch: (S0.hunch ?? 0) + 5 * sh, ...hand0, ...air(0) });
  k(4.52, giggle(0.3, -1.2), 'out');
  k(4.63, giggle(1, -0.6));
  k(4.74, giggle(-0.3, -0.2));
  k(4.85, giggle(1, -0.4));
  k(4.96, giggle(-0.3, 0));
  k(5.08, giggle(0.8, -0.2));
  // COCKY AGAIN, LOOKING ROUND
  k(5.4, { ...bob(0.4), ...cocky(0.9), faceTurn: S0.faceTurn - 6, ...hand0 });
  k(5.7, { ...bob(-0.6), ...cocky(1), faceTurn: S0.faceTurn - 2, ...hand0 });
  k(TSTAND_LONG, { ...bob(0), ...cocky(1), ...hand0 });
  return { keys, loop: 0 };
}

// ---- RUNNING: HER OWN, A SKIPPING RUN (his “She needs a unique run and stand”): quick and nimble and gleeful, she skips:
// a step and a little hop on the one foot, a long bound onto the other, a step and a hop on that; her knees flung high, her
// free arm flung up and out with each bound, the wrench on her shoulder, her ponytail bouncing. A round of 0.6 s at a hero's
// speed; each foot down flat on the floor stays where it is (Movement 8).
export const TRUN_ROUND = 0.6;
export const TRUN_CARRY = GRIP_SPEED * UNITS_PER_TILE;
/** Where her hips are along the floor as she runs (each foot down sets down a little before them and goes back past under them). */
const RUN_HIP_X = 1.0;
/**
 * A foot through her skip: down at `land` (its step) and again at `land` + 0.22 (its hop), each for 0.12 of the round; each
 * time down a little ahead of her hips and gone back a little behind them, where her leg reaches with its knee bent (a foot
 * set down further on than her leg reaches never gets to the floor, and slides as it does).
 */
function skipFoot(ph: number, land: number, S: number): { x: number; z: number; p: number } {
  const q = (((ph - land) % 1) + 1) % 1;
  const ON = 0.12;
  const AHEAD_A = RUN_HIP_X + S * ON * 0.5 + 0.5;
  const AHEAD_B = RUN_HIP_X + S * ON * 0.5 - 0.5;
  if (q < ON) return { x: AHEAD_A - S * q, z: 0, p: 0 };
  if (q < 0.22) {
    // (its little hop: up off the floor and down again a little on)
    const v = (q - ON) / (0.22 - ON);
    return { x: AHEAD_A - S * ON + (AHEAD_B - (AHEAD_A - S * ON)) * ease(v), z: 2.2 * T * Math.sin(Math.PI * v), p: 6 * Math.sin(Math.PI * v) };
  }
  if (q < 0.22 + ON) return { x: AHEAD_B - S * (q - 0.22), z: 0, p: 0 };
  // (swung through, its knee flung high, and set down ahead for its next step)
  const v = (q - 0.22 - ON) / (1 - 0.22 - ON);
  const x0 = AHEAD_B - S * ON;
  const go = ease((v - 0.1) / 0.8);
  return { x: x0 + (AHEAD_A - x0) * go, z: 8.5 * T * Math.pow(Math.sin(Math.PI * v), 0.8), p: 34 * Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.3)), 1.5) };
}
export function tinkerRun(): Motion {
  const P = TRUN_ROUND;
  const S = TRUN_CARRY * P;
  const keys: Key3[] = [];
  const n = 36;
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const l = skipFoot(ph, 0, S);
    const r = skipFoot(ph, 0.5, S);
    // (up in each bound and each little hop; down as she lands)
    const bound = bump(ph, 0.3, 0.26) + bump(ph, 0.8, 0.26);
    const hop = bump(ph, 0.1, 0.14) + bump(ph, 0.6, 0.14);
    const land = bump(ph, 0.96, 0.12) + bump(ph, 0.46, 0.12);
    // (her free arm flung up and out with each bound: once a round, with her right foot's)
    const fling = Math.sin((ph - 0.05) * Math.PI * 2);
    const pose: Partial<Bones> = {
      px: 1.5 * T, pz: S0.pz + 0.4 * T + 3.2 * T * bound + 1.0 * T * hop - 1.2 * T * land,
      pitch: 6, yaw: -12 + 3 * fling, twist: -6 + 5 * fling, side: 2 - 2 * fling,
      bend: S0.bend + 2 + 3 * land, hunch: (S0.hunch ?? 0),
      faceUp: S0.faceUp + 7 + 2 * bound, faceTurn: S0.faceTurn + 10, faceTilt: S0.faceTilt - 4 * fling,
      // (her knees pointing forward and up as they are flung high, so neither flips over as its leg swings out before her)
      lfx: l.x, lfy: 1.8 * T, lfz: l.z, lfp: l.p, lft: 8, lk: 14, lkUp: 35,
      rfx: r.x, rfy: -1.8 * T, rfz: r.z, rfp: r.p, rft: -8, rk: -14, rkUp: 35,
    };
    // (the wrench on her shoulder: her fist held where it is on her stance, against her shoulder, riding with her as she
    // leans and twists, bounced a little as she lands)
    const hand0: Partial<Bones> = { rhIn: 0, rhx: S0.rhx, rhy: S0.rhy, rhz: (S0.rhz ?? 0) - 0.35 * T * land + 0.2 * T * bound, re: S0.re };
    const flung = from(STANCE_S.shoulderL, 2 + 2 * fling, 5 + 4 * Math.max(0, fling), -6 + 20 * Math.max(0, fling) - 3 * Math.max(0, -fling));
    const lhand = plus(flung, [pose.px ?? 0, 0, (pose.pz ?? 0) - S0.pz]);
    const q = { ...pose, ...hand0 };
    keys.push({ at: ph * P, ease: 'lin', pose: { ...q, ...leftTo(q, lhand, [-3, 10, -3]) } });
  }
  return { keys, loop: 0 };
}

export function tinkerMoves(): TinkMove[] {
  return [
    {
      name: 'Standing: cocky and gleeful', motion: tinkerStand(), long: TSTAND_LONG, loops: true, air: [HOP],
      hold: (t) => ({ wrench: track(STAND_WRENCH, t), twirl: true, spin: track(STAND_SPIN, t) % (Math.PI * 2), vial: track(STAND_VIAL, t) > 0.5 ? 1 : 0 }),
    },
    { name: 'Running: a skipping run', motion: tinkerRun(), long: TRUN_ROUND, loops: true, travel: GRIP_SPEED, carry: TRUN_CARRY },
  ];
}
/** A number through keys (seconds, value), eased between. */
function track(f: [number, number][], t: number): number {
  if (t <= f[0][0]) return f[0][1];
  for (let i = 1; i < f.length; i++) {
    if (t <= f[i][0]) {
      const u = (t - f[i - 1][0]) / (f[i][0] - f[i - 1][0]);
      return f[i - 1][1] + (f[i][1] - f[i - 1][1]) * u * u * (3 - 2 * u);
    }
  }
  return f[f.length - 1][1];
}

/** Her pose at a moment of a move. */
export function tinkerPose(m: Motion, t: number): Posed {
  return bonesAt(m.keys, TSTANCE, t);
}
/** How far behind her head her ponytail is, in time: it swings to where her head was this long ago, and the wind of her going blows it back. */
const LAG = 0.16;
/** How long her ponytail takes to catch up its swing (s), and over how many moments (60ths of a second) it is looked at. */
const PONY_EASE = 0.07;
const PONY_EASE_N = 16;
/**
 * Draw her at a moment of a move: her ponytail swung after her head (Movement 4), streaming back as she runs; the wrench
 * off her shoulder as far as the move has it.
 */
export function drawTinkerAt(view: GameView, m: TinkMove, t: number, turn = 0): Drawn {
  const at = (u: number): number => (m.loops ? (((u % m.long) + m.long) % m.long) : Math.max(0, Math.min(m.long, u)));
  const headAt = (u: number): V3 => solve(TINK_B, tinkerPose(m.motion, at(u))).head;
  const blown = (m.carry ?? 0) * LAG;
  // (where her head was against where it is, over the last moments, the nearest the most: so her ponytail eases after a
  // sudden stop, as hair does, and never whips from one side to the other between two frames)
  const v = [0, 0, 0];
  let all = 0;
  for (let k = 0; k < PONY_EASE_N; k++) {
    const u = t - k / 60;
    const w = Math.exp(-k / 60 / PONY_EASE);
    const now = headAt(u);
    const was = headAt(u - LAG);
    for (let c = 0; c < 3; c++) v[c] += w * (was[c] - now[c]) * 2.2;
    all += w;
  }
  for (let c = 0; c < 3; c++) v[c] /= all;
  v[0] -= blown * 0.35;
  v[2] -= blown > 0 ? -1.5 : 0;
  const cap = m.carry ? 9 : 5;
  const n = Math.hypot(v[0], v[1], v[2]);
  TINK_SWAY.pony = n > cap ? [(v[0] * cap) / n, (v[1] * cap) / n, (v[2] * cap) / n] : [v[0], v[1], v[2]];
  const h = m.hold ? m.hold(at(t)) : { wrench: 0, twirl: false, spin: 0, vial: 0 };
  Object.assign(TINK_SWAY, h);
  try {
    return sculptTinkerer(view, tinkerPose(m.motion, at(t)) as unknown as Bones, turn);
  } finally {
    Object.assign(TINK_SWAY, { pony: [0, 0, 0], wrench: 0, twirl: false, spin: 0, vial: 0 });
  }
}
