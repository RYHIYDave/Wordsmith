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
import { LAST } from './sculpt';
import type { Drawn, Sculpt } from './sculpt';
import { CONTRAPTION_PICK, CONTRAPTION_POSE, sculptContraptionBuild } from './sculpt_contraption';
import { TINKERER_BODY, TINK_SWAY, bombSculpt, sculptTinkerer, tinkererStance } from './sculpt_tinkerer';

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
  hold?: (t: number) => { wrench: number; twirl: boolean; spin: number; vial: number; held?: Sculpt | null; lay?: number; layWay?: V3; droop?: V3 };
  /** When she is off the floor altogether (a hop): from and to, seconds. */
  air?: [number, number][];
  /** How far the move has carried her along the floor (her own measure, forward) at a moment: a swipe's way. */
  along?: (t: number) => number;
  /** How much taller than a hero's her picture is drawn, its floor point as far down it (a move that throws her high). */
  tall?: number;
  /** The strike itself, a flash (his rulebook's Movement 9), and the jolt of a landing: from and to, seconds; not judged frame by frame. */
  strike?: [number, number][];
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

// ---- HER TAP: A CONTRAPTION THROWN DOWN (his brief, 23 Oct: “I think she’ll set turrets on the ground that fire something.
// Not an arrow or a bolt.  That’s the tap.  We’ll call those “Contraption”.”). A gleeful bomber's way of setting a turret:
// she plucks it off her belt, shut (a squat brass bell, its legs drawn up in it), coils back with it up behind her shoulder,
// and in a flash LOBS it overhand (his art rulebook's Movement 9: a big wind-up, the throw itself a frame or two, a big
// wind-down), following through low across her body; it flies, bounces and springs open where it lands
// (dev/contraption_fx.ts). The wrench stays on her shoulder.
export const TAP_LONG = 1.2;
/** When the Contraption leaves her hand (s), and when she has it in hand from (s). */
export const TAP_LET_GO = 15 / 30;
export const TAP_GRAB = 0.18;
export function tinkerTap(): Motion {
  const keys: Key3[] = [];
  const k = (at: number, pose: Partial<Bones>, e: Key3['ease'] = 'io'): void => {
    keys.push({ at, ease: e, pose });
  };
  const hand0 = { ...rightTo({}, HAND_R0, S0.re) };
  const lhStance = { lhIn: 2 as const, lhx: S0.lhx, lhy: S0.lhy, lhz: S0.lhz, le: S0.le };
  const L = (q: Partial<Bones>, want: V3, elbow: V3): Partial<Bones> => ({ ...q, ...leftTo(q, want, elbow) });
  const belt: V3 = from(STANCE_S.pelvis, 4.5, 4.5, 3);
  // (her body through the throw: coiled back and down, her left shoulder drawn back; then whipped round and forward)
  const coil = (c: number): Partial<Bones> => ({ ...hand0, twist: (S0.twist ?? 0) + 26 * c, yaw: S0.yaw + 8 * c, bend: S0.bend - 11 * c, side: S0.side + 3 * c, px: -1.6 * T * c, pz: S0.pz - 1.1 * T * c, faceTurn: S0.faceTurn - 10 * c, faceUp: S0.faceUp + 4 * c });
  const fling = (c: number): Partial<Bones> => ({ ...hand0, twist: (S0.twist ?? 0) - 18 * c, yaw: S0.yaw - 6 * c, bend: S0.bend + 12 * c, side: S0.side - 1 * c, px: 1.4 * T * c, pz: S0.pz - 0.5 * T * c, faceTurn: S0.faceTurn - 4 * c, faceUp: S0.faceUp + 5 * c });
  k(0, { ...bob(0), ...cocky(1), ...hand0, ...lhStance });
  // (down to her belt for it)
  k(0.12, L({ ...bob(-0.8), ...cocky(0.6), ...hand0, faceUp: S0.faceUp - 6 }, belt, [-6, 9, -2]));
  k(TAP_GRAB, L({ ...bob(-0.9), ...cocky(0.5), ...hand0, faceUp: S0.faceUp - 5 }, plus(belt, times(CU, 0.6 * T)), [-6, 9, -2]));
  // (swung out from her side, clear of her, as she brings it up)
  k(0.26, L({ ...coil(0.4) }, from(STANCE_S.pelvis, 0.5, 9.5, 12.5), [-5, 8, 2]), 'in');
  // (THE WIND-UP: up and back behind her shoulder, coiling, her eyes on where it goes)
  k(0.34, L(coil(0.85), from(STANCE_S.shoulderL, -5.0, 3.8, 5.4), [-4, 7, 5]), 'out');
  k(13 / 30, L(coil(1), from(STANCE_S.shoulderL, -6.6, 4.2, 6.4), [-4, 7, 5]), 'in');
  // (THE THROW: a flash, overhand, let go out ahead of her and up)
  k(TAP_LET_GO, L(fling(0.75), from(STANCE_S.shoulderL, 8.8, 2.8, 4.2), [-3, 8, -2]), 'lin');
  // (THE WIND-DOWN: following through low across her body, weight on her front foot; up again, cocky)
  k(0.56, L(fling(0.92), from(STANCE_S.shoulderL, 10.2, 1.6, -0.6), [2, 6, -6]), 'lin');
  k(0.7, L(fling(1), from(STANCE_S.pelvis, 7.0, -1.0, 9.5), [4, 4, -4]), 'out');
  k(0.86, L({ ...bob(0.5), ...cocky(0.4), ...hand0, faceUp: S0.faceUp + 6, faceTurn: S0.faceTurn - 6 }, from(STANCE_S.pelvis, 5.0, 4.5, 6.5), [-6, 9, -2]));
  k(TAP_LONG, { ...bob(0), ...cocky(1), ...hand0, ...lhStance });
  return { keys, loop: 0 };
}
let SHUT: Sculpt | null = null;
/** The Contraption shut, as she grips it (built once). */
export function shutContraption(): Sculpt {
  if (SHUT) return SHUT;
  const was = { ...CONTRAPTION_POSE };
  Object.assign(CONTRAPTION_POSE, { open: 0, kick: 0, lit: 0 });
  try {
    sculptContraptionBuild('front', CONTRAPTION_PICK);
    SHUT = LAST.sc as Sculpt;
  } finally {
    Object.assign(CONTRAPTION_POSE, was);
  }
  return SHUT;
}

// ---- HER SWIPE: THE BLAST JUMP (her pick of it, 27 Oct: “Blast jump (Recommended)”). A gleeful, reckless bomber's way
// out: she yanks a bomb off her bandolier, drops into a deep crouch and slaps it down at her feet, grinning as its fuse
// spits; it goes off under her (the strike, a flash) and she RIDES THE BLAST six tiles the way you swipe (as the other
// heroes' swipes go), whooping, her knees tucked, her free fist flung up and the wrench raised high; she comes down in a
// three-point landing, her left hand slapped to the floor, skidding, and rises cocky. Her feet grip the floor while down.
export const BJ = { grab: 5, crouch: 12, drop: 13, boom: 17, off: 19, apex: 26, reach: 32, land: 35, low: 38, up: 48, end: 57 };
export const BLAST_REACH = 6 * UNITS_PER_TILE;
export const BLAST_HIGH = 62;
const BLAST_SKID = 6;
/** How far she has gone at a frame: blown off over two frames, flying at one pace, skidding to a stop as she lands. */
export function blastAlong(f: number): number {
  const v = (BLAST_REACH - BLAST_SKID) / (BJ.land - BJ.off + 1);
  if (f <= BJ.boom) return 0;
  if (f <= BJ.off) {
    const k = f - BJ.boom;
    return (v / 4) * k * k;
  }
  if (f <= BJ.land) return v + v * (f - BJ.off);
  const u = Math.min(1, (f - BJ.land) / 6);
  return BLAST_REACH - BLAST_SKID + BLAST_SKID * (1 - (1 - u) * (1 - u));
}
/** How high she is off the floor at a frame (her own measure). */
export function blastAir(f: number): number {
  const u = (f - (BJ.boom + 0.5)) / (BJ.land - (BJ.boom + 0.5));
  return u > 0 && u < 1 ? 4 * BLAST_HIGH * u * (1 - u) : 0;
}
function blastJump(): Motion {
  /** A number through keys (frames, value), eased between. */
  const tr = (f: number, ks: [number, number][]): number => track(ks.map(([a, b]) => [a * FR, b] as [number, number]), f * FR);
  /** A foot: down where she stands until the blast; tucked up under her as she flies; down where she lands (and there it stays as she skids on over it). */
  const foot = (side: 1 | -1, f: number): { x: number; z: number; p: number } => {
    const rest = side > 0 ? { x: S0.lfx ?? 0 } : { x: S0.rfx ?? 0 };
    const down = side > 0 ? BJ.land : BJ.land + 1;
    const lands = BLAST_REACH + rest.x + (side > 0 ? 2.5 * T : -1.5 * T);
    const off = BJ.boom + 0.5;
    if (f <= off) return { x: rest.x - blastAlong(f), z: 0, p: 0 };
    if (f >= down) return { x: lands - blastAlong(f), z: 0, p: 0 };
    // (reached out ahead to land on, and straight down onto where it comes down the last moment before it does)
    const over = down - 0.5;
    if (f >= over) return { x: lands - blastAlong(f), z: 4 * T * ((down - f) / 0.5), p: 0 };
    const x = tr(f, [[off, rest.x - blastAlong(off)], [BJ.off + 2, rest.x - 1 * T], [BJ.apex, rest.x + 1.5 * T], [over, lands - blastAlong(over)]]);
    const rel = tr(f, [[off, 0], [BJ.off + 2, 10 * T], [BJ.apex, 11 * T], [over, 4 * T - blastAir(over)]]);
    const v = (f - off) / (over - off);
    return { x, z: Math.max(0, blastAir(f) + rel), p: 34 * Math.sin(Math.PI * Math.min(1, v / 0.85)) * Math.min(1, v / 0.2) };
  };
  const hand0 = { ...rightTo({}, HAND_R0, S0.re) };
  const lhStance = { lhIn: 2 as const, lhx: S0.lhx, lhy: S0.lhy, lhz: S0.lhz, le: S0.le };
  const keys: Key3[] = [];
  for (let i = 0; i <= BJ.end * 2; i++) {
    const f = i / 2;
    const L = foot(1, f);
    const Rf = foot(-1, f);
    const air = blastAir(f);
    // (her body: down into a deep crouch for the bomb, grinning; flung up and arched by the blast; tucked in the air; sunk
    // deep into her landing, leaning on over her feet as she skids; up again, cocky)
    const pose: Partial<Bones> = {
      px: tr(f, [[0, 0], [BJ.crouch, 1.0 * T], [BJ.boom, 1.2 * T], [BJ.off, 0], [BJ.apex, 0], [BJ.land, 1.0 * T], [BJ.low, 3.0 * T], [BJ.up, 0.5 * T], [BJ.end, 0]]),
      pz: (S0.pz ?? 0) + tr(f, [[0, 0], [BJ.grab, -0.6 * T], [BJ.crouch, -6.5 * T], [BJ.boom, -7.2 * T], [BJ.off, 1.5 * T], [BJ.apex, 0.5 * T], [BJ.reach, 0], [BJ.land, -3 * T], [BJ.low, -10.5 * T], [BJ.up, 0.3 * T], [BJ.end, 0]]) + air,
      bend: (S0.bend ?? 0) + tr(f, [[0, 0], [BJ.grab, 4], [BJ.crouch, 20], [BJ.boom, 22], [BJ.off, -10], [BJ.apex, 4], [BJ.reach, 6], [BJ.land, 18], [BJ.low, 36], [BJ.up, 2], [BJ.end, 0]]),
      side: (S0.side ?? 0) + tr(f, [[0, 0], [BJ.crouch, 2], [BJ.off, -2], [BJ.apex, 0], [BJ.low, 4], [BJ.up, 3], [BJ.end, 0]]),
      hunch: (S0.hunch ?? 0) + tr(f, [[0, 0], [BJ.crouch, 6], [BJ.boom, 7], [BJ.off, -4], [BJ.apex, 2], [BJ.low, 10], [BJ.up, 0], [BJ.end, 0]]),
      faceUp: S0.faceUp + tr(f, [[0, 0], [BJ.grab, -4], [BJ.crouch, 14], [BJ.boom, 16], [BJ.off, 18], [BJ.apex, 10], [BJ.land, 6], [BJ.low, 18], [BJ.up, 6], [BJ.end, 0]]),
      faceTilt: S0.faceTilt + tr(f, [[0, 0], [BJ.crouch, 6], [BJ.apex, -6], [BJ.low, 8], [BJ.end, 0]]),
      lfx: L.x, lfy: S0.lfy, lfz: L.z, lfp: L.p,
      rfx: Rf.x, rfy: S0.rfy, rfz: Rf.z, rfp: Rf.p,
    };
    // HER RIGHT (the wrench's): on her shoulder; raised high in the air as she flies, whooping; held up as she lands; swung
    // down and out to her side and slung back up onto her shoulder (as she twirls it standing), never through her
    const lift: V3 = [pose.px ?? 0, 0, (pose.pz ?? 0) - (S0.pz ?? 0)];
    const high = plus(from(STANCE_S.shoulderR, 2.5, -4.5, 10.5), lift);
    const out = plus(from(STANCE_S.shoulderR, 3, -9, -2), lift);
    const home = plus(HAND_R0, lift);
    const seg = (p: V3, q: V3, a: number, b: number): V3 => plus(times(p, 1 - ease((f - a) / (b - a))), times(q, ease((f - a) / (b - a))));
    const q = { ...pose };
    let right: Partial<Bones>;
    if (f <= BJ.boom) right = hand0;
    else {
      const want = f <= BJ.off + 1 ? seg(home, high, BJ.boom, BJ.off + 1) : f <= BJ.low ? high : f <= BJ.up - 4 ? seg(high, out, BJ.low, BJ.up - 4) : seg(out, home, BJ.up - 4, BJ.end - 3);
      const e = tr(f, [[BJ.boom, S0.re ?? 0], [BJ.off + 1, (S0.re ?? 0) + 30], [BJ.low, (S0.re ?? 0) + 30], [BJ.up - 4, 10], [BJ.end - 3, S0.re ?? 0]]);
      right = f >= BJ.end - 3 ? hand0 : rightTo(q, want, e);
    }
    // HER LEFT: to her bandolier for the bomb; down to the floor with it; flung up and out as she flies; slapped to the
    // floor as she lands; back to her hip
    const at = (p: V3): V3 => plus(p, [pose.px ?? 0, 0, (pose.pz ?? 0) - (S0.pz ?? 0)]);
    const chest = at(from(STANCE_S.shoulderL, 2.6, -3.2, -6.5));
    const floorFront: V3 = [10 * T, 2.0 * T, 2.6 * T];
    const flung = at(from(STANCE_S.shoulderL, 1.5, 7, 9));
    const landHand: V3 = [BLAST_REACH + 7 * T - blastAlong(f), 4.5 * T, 2.8 * T];
    const hip = at(from(STANCE_S.pelvis, 3, 6, 5));
    let lh: V3;
    let le: V3 = [-6, 9, -2];
    if (f <= BJ.grab) lh = plus(times([S0.lhx ?? 0, S0.lhy ?? 0, S0.lhz ?? 0], 1 - ease(f / BJ.grab)), times(chest, ease(f / BJ.grab)));
    else if (f <= BJ.crouch) lh = plus(times(chest, 1 - ease((f - BJ.grab) / (BJ.crouch - BJ.grab))), times(floorFront, ease((f - BJ.grab) / (BJ.crouch - BJ.grab))));
    else if (f <= BJ.boom) {
      // (lifted off the floor slowly, then faster as the blast takes her: easing in, never stopping before it)
      const u = Math.pow((f - BJ.crouch) / (BJ.boom - BJ.crouch), 2);
      lh = plus(times(floorFront, 1 - u), times(at(from(STANCE_S.pelvis, 2, 7, 6)), u));
    }
    else if (f <= BJ.reach) {
      lh = plus(times(at(from(STANCE_S.pelvis, 2, 7, 6)), 1 - ease((f - BJ.boom) / 4)), times(flung, ease((f - BJ.boom) / 4)));
      le = [-3, 8, 3];
    } else if (f <= BJ.low) {
      const u = ease((f - BJ.reach) / (BJ.land - BJ.reach));
      lh = plus(times(flung, 1 - u), times(landHand, u));
    } else {
      const u = ease((f - BJ.low) / (BJ.end - BJ.low));
      lh = plus(times(landHand, 1 - u), times([S0.lhx ?? 0, S0.lhy ?? 0, S0.lhz ?? 0], u));
    }
    const left = leftTo({ ...q, ...right }, lh, le);
    // (back on her hip at the end, her elbow turning back out as it was, not snapping to it)
    if (f > BJ.low) {
      const u = ease((f - BJ.low) / (BJ.end - BJ.low));
      left.le = (left.le ?? 0) * (1 - u) + (S0.le ?? 0) * u;
    }
    void lhStance; void hip;
    keys.push({ at: f * FR, ease: 'lin', pose: { ...q, ...right, ...left } });
  }
  return { keys, loop: 0 };
}
let BOMB: Sculpt | null = null;
/** Her bomb, as she holds it (built once). */
export function heldBomb(): Sculpt {
  if (!BOMB) BOMB = bombSculpt();
  return BOMB;
}

export function tinkerMoves(): TinkMove[] {
  return [
    {
      name: 'Standing: cocky and gleeful', motion: tinkerStand(), long: TSTAND_LONG, loops: true, air: [HOP],
      hold: (t) => ({ wrench: track(STAND_WRENCH, t), twirl: true, spin: track(STAND_SPIN, t) % (Math.PI * 2), vial: track(STAND_VIAL, t) > 0.5 ? 1 : 0 }),
    },
    { name: 'Running: a skipping run', motion: tinkerRun(), long: TRUN_ROUND, loops: true, travel: GRIP_SPEED, carry: TRUN_CARRY },
    {
      name: 'Swipe: a blast jump', motion: blastJump(), long: BJ.end * FR, loops: false, tall: 80,
      along: (t) => blastAlong(t / FR),
      air: [[(BJ.boom + 0.5) * FR, BJ.land * FR]],
      // (the blast that throws her up, a flash: the frames it takes to fling her off the floor)
      strike: [[BJ.boom * FR, (BJ.off + 1) * FR], [(BJ.land - 1) * FR, (BJ.land + 1) * FR]],
      hold: (t) => {
        const f = t / FR;
        // (raised as she flies; held up as she lands and her fist comes back to her shoulder; slung back over it once it is there)
        const up = track([[0, 0], [BJ.boom * FR, 0], [(BJ.off + 1) * FR, 1], [(BJ.up - 2) * FR, 1], [(BJ.end - 3) * FR, 0]], t);
        return { wrench: up, twirl: true, spin: 0, vial: 0, held: f >= BJ.grab && f < BJ.drop ? heldBomb() : null };
      },
    },
    {
      name: 'Tap: a Contraption thrown down', motion: tinkerTap(), long: TAP_LONG, loops: false,
      hold: (t) => ({ wrench: 0, twirl: false, spin: 0, vial: 0, held: t >= TAP_GRAB && t < TAP_LET_GO ? shutContraption() : null }),
    },
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
  // (the wind of her going: the game's pace as she runs; as fast as a swipe carries her, as it does)
  const pace = m.along ? Math.abs(m.along(at(t) + FR / 2) - m.along(Math.max(0, at(t) - FR / 2))) / FR : 0;
  const blown = (m.carry ?? Math.min(TRUN_CARRY * 1.5, pace)) * LAG;
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
  const cap = m.carry || pace > 20 ? 9 : 5;
  const n = Math.hypot(v[0], v[1], v[2]);
  TINK_SWAY.pony = n > cap ? [(v[0] * cap) / n, (v[1] * cap) / n, (v[2] * cap) / n] : [v[0], v[1], v[2]];
  const h = m.hold ? m.hold(at(t)) : { wrench: 0, twirl: false, spin: 0, vial: 0 };
  Object.assign(TINK_SWAY, { held: null, tall: m.tall ?? 0, lay: 0, droop: [0, 0, 0] }, h);
  try {
    return sculptTinkerer(view, tinkerPose(m.motion, at(t)) as unknown as Bones, turn);
  } finally {
    Object.assign(TINK_SWAY, { pony: [0, 0, 0], wrench: 0, twirl: false, spin: 0, vial: 0, held: null, tall: 0, lay: 0, droop: [0, 0, 0] });
  }
}
