// THE PRINCESS'S ULTIMATE: THE SPECTRAL STEED (floor 16's boss). A MOCK-UP, behind PRINCESS_ON (art/princess.ts, off);
// nothing of the game imports it. Her look is art/princess.ts, the steed's art/spectral_steed.ts, her other moves
// art/princess_moves.ts.
//
// His words, 28 Oct, 20:29: “Maybe one of her moves a spectral steed forms under her and she does like dressage jumps all
// over the arena that you have to dodge”; and “It’s her ultimate ability so it can slot into whatever that might have
// been.  I want it to last a while and you have to really dodge around a bit to not get hit.”; his rulebook's Movement 9,
// “Big wind-up, lightning strike”, and of the enemies, “Start from now on”.
//
// THREE MOVES, so that it lasts as long as the game likes:
//   THE STEED FORMS (`rideForm`, 1.4 s): the Hush's grey breath gathers on the floor round her as she spreads her arms
//     and throws her head back (the warning); then a horse of it surges up out of the floor beneath her and lifts her,
//     seated side-saddle; it tosses its head.
//   A LEAP (`rideLeap`, 1.5 s, played as many times as the game likes, each from where the last came down): it gathers,
//     sinking back onto its haunches, its forelegs lifted and folded (the warning, held); it springs; in the air, a
//     capriole, its hind legs kicked out behind at the top, she whirling her vine over her head; it hangs, then comes down
//     in a flash (the strike, two frames, smeared) onto its forehooves, the fog bursting out round them; its hind legs
//     come down, it settles and stands square again. THE GAME CARRIES HER across the floor while it is in the air
//     (`RIDE_LEAP.air`); where it lands is where the blow falls.
//   THE STEED FADES (`rideEnd`, 1.4 s): it sinks back into the floor, thinning to nothing, and sets her down, hovering as
//     she stands.

import { PRINCESS_BODY, PRINCESS_REST } from './princess';
import { add, mul, solve, standing } from './skeleton';
import type { Bones, Key3, Motion, V3 } from './skeleton';
import { STEED_STAND, seatOf, squareSoles } from './spectral_steed';
import type { LegPose, SteedPose } from './spectral_steed';

const B = PRINCESS_BODY;
const FPS = 30;
export type RideMove = 'rideForm' | 'rideLeap' | 'rideEnd';

/** Her pelvis's height standing, as the bones have it (her seat is set from it). */
const PELVIS0 = solve(B, { ...standing(B) } as never).pelvis[2];

// =============================================================================================
// SMOOTH TRACKS: a value through keys, its speed carried smoothly through each (no stop at a key unless it turns back)

type Track = (t: number) => number;
/** A value through keys [time, value], smooth through each (a monotone cubic: it does not overshoot, and it stops only where it turns back or holds). */
export function track(keys: ReadonlyArray<readonly [number, number]>): Track {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0) m.push(0);
    else {
      // (the harmonic mean of the slopes either side: monotone)
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = ts[i + 1] - ts[i] + 2 * (ts[i] - ts[i - 1]);
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (i < n - 2 && t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
}
const legTrack = (keys: ReadonlyArray<readonly [number, LegPose]>): ((t: number) => LegPose) => {
  const a = [0, 1, 2].map((j) => track(keys.map(([t, l]) => [t, j < l.length ? (l as readonly number[])[j] : 35] as const)));
  return (t) => [a[0](t), a[1](t), a[2](t)] as const;
};
const smooth = (a: number, b: number, t: number): number => {
  const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// THE STEED THROUGH ITS THREE MOVES

/** Standing square, collected, ready to leap: where each move begins and ends. */
export const STEED_READY: SteedPose = { ...STEED_STAND, plant: squareSoles({ x: 0, y: 0, yaw: 0 }), grip: [1, 1, 1, 1], tail: 10 };
const STAND_LEGS = STEED_STAND.legs;
const TUCK_FORE: LegPose = [78, -150, -40];
const FOLD_FORE: LegPose = [58, -112, -30];
const REACH_FORE: LegPose = [22, -14, 22];
const PUSH_HIND: LegPose = [-46, 30, 30];
const KICK_HIND: LegPose = [-82, 6, 20];
const TRAIL_HIND: LegPose = [-40, 30, 30];

export const RIDE_FORM = { long: 1.4, warn: [0.3, 0.5] as const, rise: [0.5, 1.1] as const };
/** A leap: its warning (gathered, held), its spring, the strike (its forehooves coming down, two frames), and when the game carries her (in the air). */
export const RIDE_LEAP = {
  long: 1.5,
  warn: [0.4, 0.55] as const,
  spring: 0.55,
  strike: [32 / FPS, 34 / FPS] as const,
  hit: 34 / FPS,
  /** From when to when it is off the floor (all four hooves up): the game carries her this while, as far as it likes. */
  air: [0.64, 34 / FPS] as const,
};
export const RIDE_END = { long: 1.4, fade: [0.25, 1.15] as const };
export const RIDE_LONG: Readonly<Record<RideMove, number>> = { rideForm: RIDE_FORM.long, rideLeap: RIDE_LEAP.long, rideEnd: RIDE_END.long };

const formZ = track([[0, -40], [0.3, -40], [0.5, -37], [0.8, -14], [1.1, 0], [1.4, 0]]);
const formFormed = track([[0, 0], [0.3, 0.12], [0.5, 0.28], [0.85, 0.85], [1.1, 1], [1.4, 1]]);
const formArch = track([[0, 1], [1.05, 1], [1.2, 0.62], [1.4, 1]]);
const formPitch = track([[0, 0], [0.7, 6], [1.1, 3], [1.25, -2], [1.4, 0]]);

const S0 = 32 / FPS;
const S1 = 34 / FPS;
const leapZ = track([[0, 0], [0.15, 0], [0.4, -3.2], [0.55, -3.4], [0.64, 4], [0.74, 15], [0.84, 20.5], [0.94, 21], [1.0, 19], [S0, 15.5], [S1, 0], [1.21, -6], [1.34, -1.2], [1.5, 0]]);
const leapPitch = track([[0, 0], [0.15, 1], [0.4, 15], [0.55, 16], [0.64, 13], [0.76, 6], [0.9, 0], [S0, -5], [S1, -9], [1.2, -11], [1.36, -2], [1.5, 0]]);
const leapX = track([[0, 0], [0.4, -4], [0.55, -4.4], [0.7, -1], [0.9, 0], [1.5, 0]]);
const leapArch = track([[0, 1], [0.4, 0.86], [0.55, 0.84], [0.8, 0.7], [1.06, 0.78], [1.3, 1], [1.5, 1]]);
const leapTail = track([[0, 10], [0.4, 0], [0.7, 50], [0.9, 70], [S1, 40], [1.5, 10]]);
const foreLegs = legTrack([[0, STAND_LEGS[0]], [0.2, STAND_LEGS[0]], [0.4, FOLD_FORE], [0.55, FOLD_FORE], [0.72, TUCK_FORE], [0.95, TUCK_FORE], [S0, REACH_FORE], [S1, STAND_LEGS[0]], [1.5, STAND_LEGS[0]]]);
const hindLegs = legTrack([[0, STAND_LEGS[2]], [0.55, STAND_LEGS[2]], [0.64, PUSH_HIND], [0.72, TRAIL_HIND], [0.88, KICK_HIND], [1.04, TRAIL_HIND], [S1, TRAIL_HIND], [1.24, STAND_LEGS[2]], [1.5, STAND_LEGS[2]]]);
const gripFore = track([[0, 1], [0.2, 1], [0.32, 0], [S0, 0], [S1, 1], [1.5, 1]]);
const gripHind = track([[0, 1], [0.58, 1], [0.66, 0], [1.06, 0], [1.3, 1], [1.5, 1]]);

const endZ = track([[0, 0], [0.25, 0], [0.7, -10], [1.15, -40], [1.4, -40]]);
const endFormed = track([[0, 1], [0.25, 1], [0.7, 0.6], [1.15, 0], [1.4, 0]]);
const endArch = track([[0, 1], [0.3, 0.6], [1.15, 0.5], [1.4, 0.5]]);
const endGrip = track([[0, 1], [0.25, 1], [0.45, 0], [1.4, 0]]);

/** THE STEED at a moment of one of its three moves. */
export function steedPoseAt(move: RideMove, t: number): SteedPose {
  const churn = (t * 0.9) % 1;
  if (move === 'rideForm') {
    const z = formZ(t);
    const g = Math.max(0, Math.min(1, (z + 5) / 5));
    return { ...STEED_READY, z, pitch: formPitch(t), arch: formArch(t), formed: formFormed(t), churn, grip: [g, g, g, g], tail: 10 };
  }
  if (move === 'rideLeap') {
    const gf = gripFore(t);
    const gh = gripHind(t);
    const f = foreLegs(t);
    const h = hindLegs(t);
    return { ...STEED_READY, x: leapX(t), z: leapZ(t), pitch: leapPitch(t), arch: leapArch(t), tail: leapTail(t), legs: [f, f, h, h], grip: [gf, gf, gh, gh], churn };
  }
  const g = endGrip(t);
  return { ...STEED_READY, z: endZ(t), arch: endArch(t), formed: endFormed(t), grip: [g, g, g, g], churn };
}

// =============================================================================================
// HER, RIDING

/** HER SEATED SIDE-SADDLE on the steed: her hips on its back, facing its way, her body turned a little to its right; both her legs down its right flank (toward the eye as it comes at you), the knees bent; her left hand on her vine reins at its withers; her right hand raised high, whirling her vine. */
export function riderPose(P: SteedPose, lift = 0): Partial<Bones> {
  const seat = seatOf(P);
  const at = add(seat.at, mul(seat.u, 3.2 + lift));
  const foot = (fwd: number, out: number, down: number): V3 => add(add(add(seat.at, mul(seat.f, fwd)), mul(seat.l, out)), [0, 0, -down]);
  const fl = foot(9, -13.5, 22);
  const frt = foot(6, -12.5, 24);
  const rein = add(add(add(seat.at, mul(seat.f, 12)), mul(seat.l, 1.0)), mul(seat.u, 8));
  return {
    px: at[0], py: at[1], pz: at[2] - PELVIS0,
    yaw: P.yaw - 6, pitch: -P.pitch * 0.6 - 4, roll: 0, twist: -10, bend: 2, side: 2,
    faceTurn: -10, faceUp: 4, faceTilt: 4,
    lfx: fl[0], lfy: fl[1] - B.stance, lfz: fl[2] - B.ankle, lfp: 30, lft: 30, lk: 40, lkUp: 20,
    rfx: frt[0], rfy: frt[1] + B.stance, rfz: frt[2] - B.ankle, rfp: 34, rft: 40, rk: 50, rkUp: 20,
    lhIn: 2, lhx: rein[0], lhy: rein[1], lhz: rein[2], le: -20,
    rhIn: 1, rhx: 2, rhy: -5, rhz: 13, re: 30,
  } as Partial<Bones>;
}
/** Her right hand whirling the vine over her head: round a ring above her shoulder (`ph` 0 to 1 round). */
function whirl(ph: number): Partial<Bones> {
  const a = ph * Math.PI * 2;
  return { rhIn: 1, rhx: 2 + 2.2 * Math.cos(a), rhy: -5 + 2.2 * Math.sin(a), rhz: 13 + 0.8 * Math.sin(a) } as Partial<Bones>;
}
const mixPose = (a: Partial<Bones>, b: Partial<Bones>, k: number): Partial<Bones> => {
  const out: Record<string, number> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = (a as Record<string, number>)[key];
    const y = (b as Record<string, number>)[key];
    if (typeof x !== 'number') out[key] = y;
    else if (typeof y !== 'number') out[key] = x;
    else if (key === 'lhIn' || key === 'rhIn') out[key] = k < 0.5 ? x : y;
    else out[key] = x + (y - x) * k;
  }
  return out as Partial<Bones>;
};
/** Her standing (her rest) with her arms spread and her head thrown back: the steed's warning as it forms. */
const SPREAD: Partial<Bones> = { lhIn: 1, lhx: 3, lhy: 13, lhz: -4, le: -40, rhIn: 1, rhx: 3, rhy: -13, rhz: -4, re: 40, faceUp: 20, bend: -6, pitch: -4 } as Partial<Bones>;
/** Her left hand where the bones put it in a pose, on the floor's own lengths (`lhIn` 2): so that a hand going from one way of being placed to another goes straight there. */
function leftHandOn(pose: Partial<Bones>): Partial<Bones> {
  const s = solve(B, { ...PRINCESS_REST, ...pose } as never);
  return { lhIn: 2, lhx: s.handL[0], lhy: s.handL[1], lhz: s.handL[2] };
}
/** Her own pose at a moment of one of the three moves. */
export function riderAt(move: RideMove, t: number): Partial<Bones> {
  const P = steedPoseAt(move, t);
  const R = PRINCESS_REST as Partial<Bones>;
  if (move === 'rideForm') {
    // (standing, she spreads her arms (the warning); the steed rises under her and lifts her into its seat)
    const spread = smooth(0.05, 0.3, t) * (1 - smooth(0.75, 1.1, t));
    const up = mixPose(R, { ...R, ...SPREAD, pz: (R.pz as number) + 3 }, spread);
    const sit = smooth(0.62, 1.12, t);
    const ride = mixPose(riderPose(P), { ...riderPose(P), ...whirl(0) }, smooth(1.1, 1.4, t));
    const pose = mixPose(up, ride, sit);
    const hand = mixPose(leftHandOn(up), leftHandOn(ride), sit);
    return { ...pose, ...hand, pz: Math.max(pose.pz as number, up.pz as number) };
  }
  if (move === 'rideLeap') return { ...riderPose(P), ...whirl(t / RIDE_LEAP.long) };
  const sit = 1 - smooth(0.35, 1.15, t);
  const ride = mixPose(riderPose(P), { ...riderPose(P), ...whirl(0) }, 1 - smooth(0, 0.3, t));
  const pose = mixPose(R, ride, sit);
  const hand = t >= RIDE_END.long - 1e-6 ? {} : mixPose(leftHandOn(R), leftHandOn(ride), sit);
  return { ...pose, ...hand, pz: Math.max(R.pz as number, pose.pz as number) };
}
/** How far her vine is whirled over her head (1) rather than trailing (0), at a moment of one of the three moves. */
export function whirlOf(move: RideMove, t: number): number {
  if (move === 'rideForm') return smooth(0.9, 1.4, t);
  if (move === 'rideLeap') return 1;
  return 1 - smooth(0.1, 0.6, t);
}
/** Her motion through one of the three moves: her pose on every frame the game shows. */
export function rideMotion(move: RideMove): Motion {
  const keys: Key3[] = [];
  const n = Math.round(RIDE_LONG[move] * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: riderAt(move, i / FPS), ease: 'lin' });
  return move === 'rideLeap' ? { keys, hit: RIDE_LEAP.hit } : { keys };
}
