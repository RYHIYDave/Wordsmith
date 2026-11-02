// THE CRIER'S MOVES DONE THE ACTION WAY (the art chat's helper, 2 Nov 2026; docs/mockups/action_f11_crier/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. All of it is behind one switch, CRIER_ACTION, off: with it off the game's
// Crier is every frame as he was (art/crier.ts, art/crier_moves.ts, art/crier_shots.ts: his moves there are kept as they are).
//
// The owner's words: his review of every enemy for more action, 31 Oct 2026, offered “Shout off the walls, in place of the cone:
// his silent shout hits the square's walls and bounces back across from three sides. Find the one spot none of them reach”, he
// answered “Crier needs more work as well”. Read as: every move of his redone the action way, as the Chained One and the
// Amalgamation (whose answer, when told the same, was “Just draw it”). Under his Movement 9 (24 Oct, “Like the wind up and wind
// down are big but the actual punch is lightning quick”), his rule for the enemies (28 Oct, “Start from now on, but every enemy
// is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”), and his
// rulebook's Monsters 9, Action, like a movie (his yes, 1 Nov).
//
// So his four, each a big wind-up HELD (the warning), the blow in TWO FRAMES smeared with after-images, a big wind-down; and what
// he sends out bigger, filling his square (art/crier_action_fx.ts):
//   THE TRUMPET SWING (`attack`), a combo: the trumpet hauled back round to his right in both hands, HELD; swung round across
//     before him at full reach in two frames; carried on round and hauled back over his left shoulder, HELD; the backswing across
//     the other way; then THE FINISHER: raised straight up over his head, arched back, HELD the longest; slammed down over the top,
//     bell first, at the end of a long stride: a ring of silence goes out over the floor where it lands.
//   THE SHOUT OFF THE WALLS (`shout`, in place of the cone): the trumpet to his lips, bell up, his chest heaving, the air round the
//     bell rippling: HELD, long, while the floor is marked; thrown into the shout in two frames: a wave of silence crosses the
//     square before him, hits its walls and comes back across from three sides. One spot none of them reach.
//   THE SCROLL DOWN A LANE (`proclaim`): the decree drawn from his satchel and held high, HELD, the lane marked down the square;
//     flung down in two frames: it unrolls down the lane in a smear, and its letters burn along it a while (floor taken away).
//   HE CALLS THE CROWD (`crowd`): sunk down, the trumpet at his lips, its bell to the floor, his chest heaving: HELD, the mouths of
//     the lanes into the square welling with the Hush; flung up to the sky in two frames, the call: the Hushed pour in.
// His stand, march, setting off and stopping, struck and his death are the game's own (the very same moves).

import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import type { BossShape, CheckThing } from './boss_checks';
import { CROWD_NAME, CR_BASE, CR_BODY, CR_K, D, HUSH, SWING_NAME, TRUMPET_HOLD, crierBits, trumpetOf, trumpetR } from './crier';
import type { P } from './crier';
import { CRIER_MOB, CR_SHAPE } from './crier_moves';
import { hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, mobSet, posedOfMob, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Ropes } from './new_mobs3';
import { add, dot, elbowFor, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. With it on, the game's Crier is `makeCrierActionArt` (the bestiary's to choose), his rules as the README says. */
export const CRIER_ACTION = { on: false };

const B = CR_BODY;
const K = CR_K;
const R = CR_BASE;
const FR = 1 / 30;
/** A moment on the game's frames: frame `n`, at 30 a second. */
export const f = (n: number): number => n / 30;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const rampAt = (t: number, a: number, b: number): number => clamp01((t - a) / Math.max(1e-9, b - a));
/** A small tremble (his own lengths), different each frame, on the game's frames. */
const shiver = (t: number, amp: number, seed: number): number => (hash(Math.round(t * 30), seed, 4111) - 0.5) * 2 * amp;

// =============================================================================================
// POSES: his hands and his trumpet, said as the old moves say them

/** His elbows pointed as nearly toward these ways as his arms let them (as art/crier_moves.ts's own). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** His mouth in a pose (the figure's own space): where the trumpet's mouthpiece goes. */
function mouthOf(pose: P): V3 {
  const s = solve(B, { ...R, ...pose } as Posed);
  const fc = s.face;
  return add(s.head, add(mul(fc[0], B.headR[0] * 1.0), mul(fc[2], -B.headR[2] * 0.42)));
}
/** A pose of his: its body, his right hand on the trumpet (`hand` on the floor's axes from his place, `draw` up it), the way it runs (`az`, `el`: degrees; `el` past 90 goes on over the top), his left hand on it `two` from his right (or as the body says). */
interface Beat {
  readonly t: number;
  readonly body: P;
  readonly hand: V3;
  readonly az: number;
  readonly el: number;
  readonly draw: number;
  readonly ease?: 'io' | 'lin' | 'out' | 'in';
}
const BODY_FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'lk', 'rk', 'gale'] as const;
type BodyField = (typeof BODY_FIELDS)[number];
const EASE = {
  io: (u: number) => u * u * (3 - 2 * u),
  lin: (u: number) => u,
  out: (u: number) => 1 - (1 - u) ** 2.4,
  in: (u: number) => u ** 2,
} as const;
/** The trumpet's way as the bones take it (`wAz`, `wEl`), from an az and an el that may go on over the top; kept turning the way it was. */
function wayOf(az: number, el: number, was?: number): { wAz: number; wEl: number } {
  const w = heading(az, el);
  let a = Math.atan2(w[1], w[0]) / D;
  if (was !== undefined) a -= 360 * Math.round((a - was) / 360);
  return { wAz: a, wEl: Math.asin(Math.max(-1, Math.min(1, w[2]))) / D };
}
/**
 * A STRETCH OF A MOVE FROM BEATS: every number of the body, of his right hand and of the trumpet's way, from beat to beat by the
 * later beat's ease, made into a key at every frame the game shows (so that what is held is held, and a blow is a flash); what is
 * added over them (`more`: a tremble, a heave); his left hand on the trumpet (`two`, along it from his right) or as the body says
 * (`leftIn`); his elbows pointed out of him (`elbows`).
 */
function stretch(beats: ReadonlyArray<Beat>, more: Partial<Record<BodyField | 'hx' | 'hy' | 'hz' | 'az' | 'el', (t: number) => number>>, leftIn: 0 | 2 | 3, elbows: (t: number) => [V3 | null, V3 | null], extra: (t: number) => P = () => ({})): Key3[] {
  const keys: Key3[] = [];
  const at = (t: number): { body: Record<string, number>; hand: V3; az: number; el: number; draw: number } => {
    let i = 0;
    while (i < beats.length - 2 && t > beats[i + 1].t) i++;
    const a = beats[i];
    const b = beats[Math.min(beats.length - 1, i + 1)];
    const u = b === a ? 1 : EASE[b.ease ?? 'io'](clamp01((t - a.t) / Math.max(1e-9, b.t - a.t)));
    const lerp = (x: number, y: number): number => x + (y - x) * u;
    const body: Record<string, number> = {};
    for (const k of BODY_FIELDS) {
      const x = (a.body[k] ?? R[k]) as number;
      const y = (b.body[k] ?? R[k]) as number;
      body[k] = lerp(x, y) + (more[k]?.(t) ?? 0);
    }
    return { body, hand: [lerp(a.hand[0], b.hand[0]) + (more.hx?.(t) ?? 0), lerp(a.hand[1], b.hand[1]) + (more.hy?.(t) ?? 0), lerp(a.hand[2], b.hand[2]) + (more.hz?.(t) ?? 0)], az: lerp(a.az, b.az) + (more.az?.(t) ?? 0), el: lerp(a.el, b.el) + (more.el?.(t) ?? 0), draw: lerp(a.draw, b.draw) };
  };
  const t0 = beats[0].t;
  const t1 = beats[beats.length - 1].t;
  let was: number | undefined;
  for (let n = Math.round(t0 * 30); n <= Math.round(t1 * 30); n++) {
    const t = n / 30;
    const p = at(t);
    const w = wayOf(p.az, p.el, was);
    was = w.wAz;
    const pose: P = { ...(p.body as P), rhIn: 2, rhx: p.hand[0], rhy: p.hand[1], rhz: p.hand[2], ...w, draw: p.draw, ...(leftIn === 3 ? { lhIn: 3, lhy: 0, lhz: 0 } : { lhIn: leftIn }), ...extra(t) };
    const [wl, wr] = elbows(t);
    keys.push({ at: t, ease: 'lin', pose: elbowsTo(pose, wl, wr) });
  }
  return keys;
}
/** A move: from his stand into the first beat (by `inEase`), the stretch, and back into his stand from the last by `long`. */
function moveFrom(keys: Key3[], long: number, hit: number): Motion {
  // (from his stand into the first, easing in and out: nothing starts at its fastest)
  // (the trumpet's way kept turning the way it was from key to key, from his stand's on)
  let was = R.wAz;
  for (const k of keys) {
    const az = k.pose.wAz;
    if (az === undefined) continue;
    (k.pose as { wAz: number }).wAz = az - 360 * Math.round((az - was) / 360);
    was = (k.pose as { wAz: number }).wAz;
  }
  // (and back into his stand turned as he stands, the way it was turning: the same way, said as it has come round to)
  const end = R.wAz - 360 * Math.round((R.wAz - was) / 360);
  return { hit, keys: [{ at: 0, pose: {} }, { ...keys[0], ease: 'io' }, ...keys.slice(1), { at: long, pose: { wAz: end }, ease: 'io' }] };
}
/** His left fist on his hip (his stand's), in the floor's own axes where a pose would want it (`lhIn` 0 is the chest's). */
const FIST_ON_HIP: P = { lhIn: 0, lhx: -2 * K, lhy: 9 * K, lhz: -22 * K, le: -70 };
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

// =============================================================================================
// THE TRUMPET SWING, A COMBO: the swing, the backswing, the finisher (each held, then struck in two frames)

/** Its strikes (the last frame of each wind-up to the frame it lands on) and its blows. */
export const SWING_STRIKES = [[f(18), f(20)], [f(48), f(50)], [f(84), f(86)]] as const;
export const SWING_HITS = [f(20), f(50), f(86)] as const;
export const SWING_LONG = f(126);
/** Where his left hand holds the trumpet (his own lengths up it from his right). */
const TWO = 11;
/** The swing's poses: hauled back round to his right; swept round across before him to his left; carried on; hauled back over his left shoulder; the backswing across to his right; carried on; raised over his head; slammed. */
const S_IN: Beat = { t: f(8), body: { px: -1 * K, yaw: R.yaw - 14, twist: -10, bend: R.bend - 3, pitch: R.pitch - 3, faceTurn: 14, lk: 16, rk: -14, lhx: TWO }, hand: [38, -12, 78], az: -110, el: 35, draw: 0 };
const S_BACK1: Beat = { t: f(14), body: { px: -3 * K, pz: R.pz - 2, yaw: R.yaw - 36, twist: -24, bend: R.bend - 6, pitch: R.pitch - 5, side: 3, faceTurn: 34, faceUp: R.faceUp + 2, lk: 22, rk: -20, lhx: TWO }, hand: [-2, -30, 78], az: -152, el: 22, draw: 0 };
const S_SWEPT1: Beat = { t: f(20), body: { px: 6 * K, pz: R.pz - 4 * K, yaw: R.yaw + 30, twist: 18, bend: R.bend + 10, pitch: R.pitch + 8, side: -2, faceTurn: -12, faceUp: R.faceUp - 6, lk: 34, rk: -10, lhx: TWO, gale: 1 }, hand: [46, 10, 54], az: 58, el: -6, draw: 0, ease: 'lin' };
const S_ON1: Beat = { t: f(28), body: { px: 5 * K, pz: R.pz - 3.5 * K, yaw: R.yaw + 42, twist: 24, bend: R.bend + 8, pitch: R.pitch + 6, side: -3, faceTurn: -20, faceUp: R.faceUp - 3, lk: 32, rk: -10, lhx: TWO, gale: 0.6 }, hand: [36, 22, 62], az: 98, el: 4, draw: 0, ease: 'out' };
const S_BACK2: Beat = { t: f(40), body: { px: 1 * K, pz: R.pz - 2 * K, yaw: R.yaw + 52, twist: 30, bend: R.bend - 2, pitch: R.pitch - 3, side: -4, faceTurn: -34, faceUp: R.faceUp + 2, lk: 30, rk: -16, lhx: TWO, gale: 0.2 }, hand: [14, 22, 84], az: 150, el: 26, draw: 0 };
const S_SWEPT2: Beat = { t: f(50), body: { px: 9 * K, pz: R.pz - 4.5 * K, yaw: R.yaw - 26, twist: -16, bend: R.bend + 10, pitch: R.pitch + 8, side: 3, faceTurn: 14, faceUp: R.faceUp - 6, lk: 34, rk: -8, lhx: TWO, gale: 1 }, hand: [46, -34, 54], az: -48, el: -6, draw: 0, ease: 'lin' };
const S_ON2: Beat = { t: f(58), body: { px: 6 * K, pz: R.pz - 4 * K, yaw: R.yaw - 38, twist: -22, bend: R.bend + 8, pitch: R.pitch + 6, side: 4, faceTurn: 22, faceUp: R.faceUp - 3, lk: 32, rk: -10, lhx: TWO, gale: 0.6 }, hand: [36, -32, 62], az: -98, el: 6, draw: 0, ease: 'out' };
/** The finisher: raised straight up over his head and back, arched (held the longest); slammed down over the top, bell first. */
const S_UP: Beat = { t: f(72), body: { px: -2 * K, pz: R.pz - 1, yaw: R.yaw - 6, twist: -4, bend: R.bend - 12, pitch: R.pitch - 8, side: 0, faceTurn: 6, faceUp: R.faceUp + 14, lk: 26, rk: -18, lhx: TWO, gale: 0.1 }, hand: [6, -12, 116], az: -186, el: 62, draw: 0 };
const S_SLAM: Beat = { t: f(86), body: { px: 18 * K, pz: R.pz - 10 * K, yaw: R.yaw + 8, twist: 6, bend: R.bend + 26, pitch: R.pitch + 16, side: 0, faceTurn: -2, faceUp: R.faceUp - 16, lk: 46, rk: -8, lhx: TWO, gale: 1 }, hand: [60, -8, 50], az: -186, el: 222, draw: 0, ease: 'lin' };
const S_REST: Beat = { t: f(96), body: { px: 17 * K, pz: R.pz - 9 * K, yaw: R.yaw + 8, twist: 4, bend: R.bend + 20, pitch: R.pitch + 20, faceTurn: 0, faceUp: R.faceUp - 10, lk: 44, rk: -10, lhx: TWO, gale: 0.4 }, hand: [58, -8, 54], az: -186, el: 215, draw: 0, ease: 'out' };
const S_RISE: Beat = { t: f(104), body: { px: 10 * K, pz: R.pz - 6 * K, yaw: R.yaw + 6, twist: 3, bend: R.bend + 9, pitch: R.pitch + 9, faceUp: R.faceUp - 6, lk: 38, rk: -12, lhx: TWO, gale: 0.2 }, hand: [54, -20, 64], az: -190, el: 188, draw: 0 };
const S_HEAVE: Beat = { t: f(111), body: { px: 4 * K, pz: R.pz - 3 * K, yaw: R.yaw + 2, twist: 2, bend: R.bend + 4, pitch: R.pitch + 4, faceUp: R.faceUp - 2, lk: 26, rk: -14, lhx: TWO, gale: 0.1 }, hand: [30, -18, 84], az: -210, el: 116, draw: 0.3 };
/** His left hand let go of it, out before him clear of his belly, and down to his hip (the floor's axes from his place). */
const S_OUT: Beat = { ...S_HEAVE, t: f(116), body: { ...S_HEAVE.body, lhx: 36, lhy: 12, lhz: 76 }, az: -220, el: 108 };
const S_BYHIP: Beat = { ...S_HEAVE, t: f(120), body: { ...S_HEAVE.body, px: 1 * K, pz: R.pz - 0.5 * K, yaw: R.yaw, twist: 2, bend: R.bend + 1, pitch: R.pitch + 1, faceUp: R.faceUp, lk: 18, rk: -14, lhx: 12, lhy: 26, lhz: 50, gale: 0 }, hand: [12, -32, 60], az: -240, el: 100, draw: 0.8 };
function swingMotion(): Motion {
  const [[a0], [b0], [c0]] = SWING_STRIKES;
  const held = (t: number): number => heldIn(f(14), a0)(t) + heldIn(f(40), b0)(t) + heldIn(f(72), c0)(t);
  const hold = (b: Beat, t: number): Beat => ({ ...b, t, ease: 'lin' });
  const beats: Beat[] = [S_IN, S_BACK1, hold(S_BACK1, a0), S_SWEPT1, S_ON1, S_BACK2, hold(S_BACK2, b0), S_SWEPT2, S_ON2, S_UP, hold(S_UP, c0), S_SLAM, S_REST, S_RISE, S_HEAVE];
  // (his left hand lets go of it once it is up, and goes back to his hip round the front of him: a stretch of its own)
  const keys = stretch(beats, {
    pz: (t) => shiver(t, 0.35, 1) * held(t),
    hz: (t) => shiver(t, 0.6, 2) * held(t),
    hy: (t) => shiver(t, 0.4, 3) * held(t),
  }, 3, (t) => [t < f(30) ? [0.2, 0.8, -0.4] : t < f(60) ? [-0.2, 0.8, -0.3] : [0.1, 0.8, -0.4], t < f(30) ? [0, -0.8, -0.4] : t < f(60) ? [0.2, -0.8, -0.3] : [0.3, -0.7, 0.2]]);
  // (from where his left hand is on it as he heaves it up, the frame after)
  const was = keys[keys.length - 1];
  const hl = solve(B, { ...R, ...was.pose } as Posed).handL;
  const hr = solve(B, { ...R, ...was.pose } as Posed).handR;
  const LETGO: Beat = { ...S_HEAVE, t: f(112), hand: hr, body: { ...S_HEAVE.body, lhx: hl[0], lhy: hl[1], lhz: hl[2] } };
  const letGo = stretch([LETGO, S_OUT, S_BYHIP], {}, 2, () => [[0.2, 0.8, -0.4], [0.3, -0.7, 0.2]]);
  return moveFrom([...keys, ...letGo], SWING_LONG, SWING_HITS[0]);
}
/** His feet through the swing: his left strides in to the swing, the backswing turns on it, the finisher's long stride; back. */
function swingFeet(): (t: number) => P {
  const [h1, , h3] = SWING_HITS;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: h1 - f(5), t1: h1 - f(1), to: plantBy(L0, 18 * K, 4 * K, 14), lift: 6 * K }, { t0: f(64), t1: f(72), to: L0, lift: 6 * K }, { t0: h3 - f(6), t1: h3 - f(1), to: plantBy(L0, 36 * K, 2 * K, 6), lift: 8 * K }, { t0: f(98), t1: f(112), to: L0, lift: 7 * K }] },
    R: { start: R0, moves: [{ t0: h3 - f(4), t1: h3 + f(2), to: { ...R0, pitch: 30 } }, { t0: f(100), t1: f(114), to: R0 }] },
  });
}

/** Held, trembling: 1 from `a` to `b` (eased in and out over two frames), 0 else. */
function heldIn(a: number, b: number): (t: number) => number {
  return (t) => rampAt(t, a, a + 2 * FR) * (1 - rampAt(t, b - 2 * FR, b));
}

// =============================================================================================
// THE SHOUT OFF THE WALLS: a breath held long, the shout thrown in two frames

export const SHOUT_STRIKE = [f(50), f(52)] as const;
export const SHOUT_HIT = f(52);
/** When he stops blowing; the move's whole length. */
export const SHOUT_STOP = f(74);
export const SHOUT_LONG = f(100);
/** When the breath is drawn (the floor marked from here), and held to the strike. */
export const SHOUT_HOLD = [f(20), f(50)] as const;
/** The trumpet to his lips, running (az, el), his right hand `draw` up it. */
function toLips(body: P, az: number, el: number, draw = 0.24): Beat & { t: number } {
  const m = mouthOf(body);
  const w = heading(az, el);
  const hold = TRUMPET_HOLD(draw);
  return { t: 0, body, hand: add(m, mul(w, hold + 1.2)), az, el, draw };
}
const FLUNG_WIDE: P = { lhIn: 0, lhx: 4 * K, lhy: 26 * K, lhz: -6 * K };
/** Rearing back on his heels as he fills his chest: the trumpet to his lips, its bell up at the sky's edge; his left arm flung out. */
const SH_BREATH: P = { ...FLUNG_WIDE, lhz: 2 * K, px: -4 * K, pz: R.pz + 2, yaw: R.yaw + 8, pitch: R.pitch - 12, twist: 0, bend: R.bend - 14, faceTurn: 0, faceUp: 16, lk: 18, rk: -18, gale: 0.15 };
/** Thrown into it: lunged in, the bell levelled at the far wall, his coat thrown back. */
const SH_SHOUT: P = { ...FLUNG_WIDE, lhx: -6 * K, lhz: -12 * K, px: 7 * K, pz: R.pz - 3 * K, yaw: R.yaw + 10, pitch: R.pitch + 10, twist: 2, bend: R.bend + 8, faceTurn: -2, faceUp: -4, lk: 38, rk: -10, gale: 1 };
function shoutMotion(): Motion {
  const [a0, a1] = SHOUT_STRIKE;
  const LIFT: Beat = { t: f(6), body: { ...FLUNG_WIDE, lhx: -2 * K, lhy: 9 * K, lhz: -22 * K, faceUp: 4, lk: 15, rk: -13 }, hand: [30 * K, -20 * K, 58 * K], az: -20, el: 74, draw: 0.6 };
  const RAISE = { ...toLips({ ...FLUNG_WIDE, lhx: 0, lhy: 14 * K, lhz: -16 * K, px: -1 * K, yaw: R.yaw + 8, pitch: R.pitch - 4, bend: R.bend - 4, faceUp: 6, lk: 16, rk: -14, gale: 0 }, -6, 18), t: f(12) };
  const BREATH = { ...toLips(SH_BREATH, -6, 38), t: SHOUT_HOLD[0] };
  const SHOUT = { ...toLips(SH_SHOUT, -6, -4), t: a1, ease: 'lin' as const };
  const BLOW = { ...toLips({ ...SH_SHOUT, px: 6 * K, pitch: R.pitch + 8, bend: R.bend + 6, gale: 0.8 }, -6, -2), t: f(60), ease: 'out' as const };
  const STOP = { ...toLips({ ...SH_SHOUT, px: 5 * K, pitch: R.pitch + 6, bend: R.bend + 4, gale: 0.3 }, -6, 0), t: SHOUT_STOP };
  const DOWN = { ...toLips({ ...FLUNG_WIDE, lhx: 0, lhy: 14 * K, lhz: -16 * K, px: 1 * K, yaw: R.yaw + 8, pitch: R.pitch, bend: R.bend, faceUp: 4, lk: 18, rk: -14, gale: 0.1 }, -6, 30), t: f(84) };
  const LIFT2: Beat = { ...LIFT, t: f(92) };
  // (his chest heaving as he holds the breath: up and down twice and more a second, ever harder; the trumpet trembling)
  const heave = (t: number): number => (t > f(12) && t < a0 ? Math.sin((t - f(12)) * 15) * rampAt(t, f(12), f(24)) * (1 - rampAt(t, a0 - 2 * FR, a0)) : 0);
  const held = heldIn(SHOUT_HOLD[0], a0);
  const blowing = (t: number): number => rampAt(t, a1, a1 + 2 * FR) * (1 - rampAt(t, SHOUT_STOP - 4 * FR, SHOUT_STOP));
  const keys = stretch([LIFT, RAISE, BREATH, { ...BREATH, t: a0, ease: 'lin' }, SHOUT, BLOW, STOP, DOWN, LIFT2], {
    pz: (t) => 0.9 * heave(t) + shiver(t, 0.3, 11) * held(t),
    bend: (t) => -1.4 * heave(t) + 1.2 * Math.sin(t * 40) * blowing(t),
    hz: (t) => 0.9 * heave(t) + shiver(t, 0.4, 12) * held(t),
    px: (t) => 0.7 * Math.sin(t * 47) * blowing(t),
    el: (t) => 1.6 * Math.sin(t * 43) * blowing(t),
  }, 0, () => [null, [0.1, -0.8, -0.5]]);
  return moveFrom(keys, SHOUT_LONG, SHOUT_HIT);
}
function shoutFeet(): (t: number) => P {
  const [a0] = SHOUT_STRIKE;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: a0 - f(3), t1: a0 + f(1), to: plantBy(L0, 12 * K, 0, 0), lift: 4 * K }, { t0: f(78), t1: f(90), to: L0, lift: 4 * K }] },
    R: { start: R0, moves: [] },
  });
}

// =============================================================================================
// THE SCROLL DOWN A LANE: the decree drawn and held high; flung down in two frames

export const PROCLAIM_STRIKE = [f(40), f(42)] as const;
export const PROCLAIM_HIT = f(42);
export const PROCLAIM_LONG = f(84);
/** Held high (the lane marked from the first of these). */
export const PROCLAIM_HOLD = [f(18), f(40)] as const;
function proclaimMotion(): Motion {
  const [a0, a1] = PROCLAIM_STRIKE;
  const trumpetUp = (t: number, body: P, lh: V3, prop: number, ease?: Beat['ease']): Beat & { lh: V3; prop: number } => ({ t, body, hand: [30 * K, -22 * K, 60 * K], az: -22, el: 74, draw: 0.6, lh, prop, ease });
  const beats = [
    trumpetUp(f(6), { px: 0, yaw: R.yaw + 10, pitch: R.pitch + 2, twist: 10, bend: R.bend + 2, faceTurn: -8, faceUp: R.faceUp - 6, lk: 16, rk: -12 }, [1 * K, 21 * K, 42 * K], 0),
    trumpetUp(f(11), { px: 0, yaw: R.yaw + 10, pitch: R.pitch + 2, twist: 10, bend: R.bend + 2, faceTurn: -8, faceUp: R.faceUp - 4, lk: 16, rk: -12 }, [4 * K, 20 * K, 64 * K], 1),
    trumpetUp(PROCLAIM_HOLD[0], { px: -4 * K, pz: R.pz + 1.5, yaw: R.yaw + 2, pitch: R.pitch - 10, twist: 4, bend: R.bend - 13, faceTurn: 0, faceUp: 24, lk: 18, rk: -20 }, [-2, 15, 132], 1),
    trumpetUp(a0, { px: -4 * K, pz: R.pz + 1.5, yaw: R.yaw + 2, pitch: R.pitch - 10, twist: 4, bend: R.bend - 13, faceTurn: 0, faceUp: 24, lk: 18, rk: -20 }, [-2, 15, 132], 1, 'lin'),
    { ...trumpetUp(a1, { px: 9 * K, pz: R.pz - 6 * K, yaw: R.yaw + 6, pitch: R.pitch + 22, twist: -4, bend: R.bend + 16, faceTurn: 0, faceUp: -12, lk: 40, rk: -8, gale: 1 }, [36 * K, 8 * K, 40 * K], 1, 'lin'), hand: [30 * K, -24 * K, 56 * K] as V3, az: -10, el: 30, draw: 0.3 },
    { ...trumpetUp(f(52), { px: 8 * K, pz: R.pz - 5 * K, yaw: R.yaw + 6, pitch: R.pitch + 18, twist: -2, bend: R.bend + 14, faceTurn: 0, faceUp: -8, lk: 38, rk: -8, gale: 0.5 }, [34 * K, 10 * K, 34 * K], 0, 'out'), hand: [31 * K, -22 * K, 58 * K] as V3, az: -4, el: 16, draw: 0 },
    { ...trumpetUp(f(66), { px: 4 * K, pz: R.pz - 2 * K, yaw: R.yaw + 8, pitch: R.pitch + 6, twist: 4, bend: R.bend + 2, faceTurn: -4, faceUp: R.faceUp - 2, lk: 30, rk: -12, gale: 0.1 }, [16 * K, 14 * K, 30 * K], 0), hand: [31 * K, -22 * K, 60 * K] as V3, az: -4, el: 14, draw: 0 },
  ];
  const held = heldIn(PROCLAIM_HOLD[0], a0);
  const lhAt = (t: number): { lh: V3; prop: number } => {
    let i = 0;
    while (i < beats.length - 2 && t > beats[i + 1].t) i++;
    const a = beats[i];
    const b = beats[Math.min(beats.length - 1, i + 1)];
    const u = b === a ? 1 : EASE[b.ease ?? 'io'](clamp01((t - a.t) / Math.max(1e-9, b.t - a.t)));
    return { lh: lerp3(a.lh, b.lh, u), prop: t < a1 + 1e-6 && t >= f(9) ? 1 : 0 };
  };
  const keys = stretch(beats, {
    pz: (t) => shiver(t, 0.3, 21) * held(t),
    hz: (t) => shiver(t, 0.3, 22) * held(t),
  }, 2, () => [[-0.2, 0.9, -0.3], [0.2, -0.8, -0.4]], (t) => {
    const { lh, prop } = lhAt(t);
    const tr = held(t);
    return { lhx: lh[0] + shiver(t, 0.5, 23) * tr, lhy: lh[1], lhz: lh[2] + shiver(t, 0.6, 24) * tr, prop };
  });
  return moveFrom(keys, PROCLAIM_LONG, PROCLAIM_HIT);
}
function proclaimFeet(): (t: number) => P {
  const [a0] = PROCLAIM_STRIKE;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: a0 - f(3), t1: a0 + f(1), to: plantBy(L0, 18 * K, 1 * K, 4), lift: 6 * K }, { t0: f(62), t1: f(76), to: L0, lift: 6 * K }] },
    R: { start: R0, moves: [{ t0: a0 - f(2), t1: a0 + f(2), to: { ...R0, pitch: 22 } }, { t0: f(64), t1: f(76), to: R0 }] },
  });
}

// =============================================================================================
// HE CALLS THE CROWD: sunk down drawing the breath, held; flung up to the sky in two frames

export const CROWD_STRIKE = [f(46), f(48)] as const;
export const CROWD_HIT = f(48);
export const CROWD_STOP = f(76);
export const CROWD_LONG = f(100);
/** The summons held (the lanes' mouths welling from the first of these). */
export const CROWD_HOLD = [f(20), f(46)] as const;
const CW_SUNK: P = { ...FIST_ON_HIP, px: 2 * K, pz: R.pz - 6 * K, yaw: R.yaw + 6, pitch: R.pitch + 12, twist: 0, bend: R.bend + 18, faceTurn: 0, faceUp: -18, lk: 38, rk: -26, gale: 0.1 };
const CW_UP: P = { ...FIST_ON_HIP, ...FLUNG_WIDE, lhz: 6 * K, px: -3 * K, pz: R.pz + 1, yaw: R.yaw + 6, pitch: R.pitch - 10, twist: 0, bend: R.bend - 14, faceTurn: 0, faceUp: 44, lk: 18, rk: -16, gale: 1 };
function crowdMotion(): Motion {
  const [a0, a1] = CROWD_STRIKE;
  const LIFT0: Beat = { t: f(6), body: { ...FIST_ON_HIP, faceUp: 4, lk: 15, rk: -13 }, hand: [30 * K, -20 * K, 58 * K], az: -20, el: 74, draw: 0.6 };
  const LIFT = { ...toLips({ ...FIST_ON_HIP, px: 0, yaw: R.yaw + 6, pitch: R.pitch + 2, bend: R.bend + 2, faceUp: 0, lk: 18, rk: -14 }, -6, 20), t: f(12) };
  const SUNK = { ...toLips(CW_SUNK, -6, -28), t: CROWD_HOLD[0] };
  const UP = { ...toLips(CW_UP, -6, 78), t: a1, ease: 'lin' as const };
  const BLOW = { ...toLips({ ...CW_UP, px: -2 * K, bend: R.bend - 12, gale: 0.7 }, -6, 80), t: f(58), ease: 'out' as const };
  const STOP = { ...toLips({ ...CW_UP, px: -1 * K, bend: R.bend - 10, gale: 0.3 }, -6, 76), t: CROWD_STOP };
  const DOWN = { ...toLips({ ...FIST_ON_HIP, ...FLUNG_WIDE, lhx: 0, lhy: 14 * K, lhz: -16 * K, px: 0, yaw: R.yaw + 6, pitch: R.pitch - 2, bend: R.bend - 2, faceUp: 8, lk: 18, rk: -14, gale: 0.1 }, -6, 50), t: f(85) };
  const LIFT2: Beat = { ...LIFT0, body: { ...LIFT0.body, ...FLUNG_WIDE, lhx: 0, lhy: 14 * K, lhz: -16 * K }, t: f(93) };
  const heave = (t: number): number => (t > f(12) && t < a0 ? Math.sin((t - f(12)) * 13) * rampAt(t, f(12), f(24)) * (1 - rampAt(t, a0 - 2 * FR, a0)) : 0);
  const held = heldIn(CROWD_HOLD[0], a0);
  const blowing = (t: number): number => rampAt(t, a1, a1 + 2 * FR) * (1 - rampAt(t, CROWD_STOP - 4 * FR, CROWD_STOP));
  const keys = stretch([LIFT0, LIFT, SUNK, { ...SUNK, t: a0, ease: 'lin' }, UP, BLOW, STOP, DOWN, LIFT2], {
    pz: (t) => 0.9 * heave(t) + shiver(t, 0.3, 31) * held(t),
    bend: (t) => -1.4 * heave(t),
    hz: (t) => 0.9 * heave(t) + shiver(t, 0.4, 32) * held(t),
    roll: (t) => 1.4 * Math.sin(t * 37) * blowing(t),
    az: (t) => 2 * Math.sin(t * 41) * blowing(t),
  }, 0, (t) => [null, t < a0 ? [0.1, -0.8, -0.5] : [0.1, -0.8, -0.4]]);
  return moveFrom(keys, CROWD_LONG, CROWD_HIT);
}
function crowdFeet(): (t: number) => P {
  const [a0] = CROWD_STRIKE;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: f(4), t1: f(12), to: plantBy(L0, 6 * K, 2 * K, 6), lift: 4 * K }, { t0: f(80), t1: f(92), to: L0, lift: 4 * K }] },
    R: { start: R0, moves: [{ t0: a0 - f(2), t1: a0 + f(3), to: { ...R0, pitch: 18 } }, { t0: f(64), t1: f(76), to: R0 }] },
  });
}

// =============================================================================================
// THE STRIKES, AND THEIR SMEAR: after-images of the bell (or the scroll in his hand) along the way it came

export type ActMove = 'attack' | 'shout' | 'proclaim' | 'crowd';
export const CR_ACT_MOVES: ReadonlyArray<ActMove> = ['attack', 'shout', 'proclaim', 'crowd'];
export const CR_ACT_STRIKES: Readonly<Record<ActMove, ReadonlyArray<readonly [number, number]>>> = {
  attack: SWING_STRIKES,
  shout: [SHOUT_STRIKE],
  proclaim: [PROCLAIM_STRIKE],
  crowd: [CROWD_STRIKE],
};
/** Whether a frame of a move shows a strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function crSmeared(move: string, t: number): boolean {
  return (CR_ACT_STRIKES[move as ActMove] ?? []).some((s) => t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6);
}
/** What of him strikes: the trumpet's bell (round its rim, and its middle), or his left hand with the scroll. */
function struckPoints(move: string, s: Skeleton, q: Posed): V3[] {
  if (move === 'proclaim') return [s.handL, add(s.handL, mul(norm(sub(s.handL, s.elbowL)), 6))];
  const t = trumpetOf(s, q);
  const e1 = norm(sub(heading(q.wAz + 90, 0), mul(t.way, dot(heading(q.wAz + 90, 0), t.way))), [0, 1, 0]);
  return [add(t.rim, mul(e1, BELL)), t.rim, add(t.rim, mul(e1, -BELL)), lerp3(t.mouth, t.rim, 0.6)];
}
const BELL = 9.5 * K;
function smearRopes(of: () => Mob, move: string, t: number): Ropes {
  const out: Record<string, V3[]> = {};
  for (const s of CR_ACT_STRIKES[move as ActMove] ?? []) {
    if (!(t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6)) continue;
    const from = t > s[1] + 1e-6 ? s[1] - FR * 0.6 : s[0] - FR * 0.3;
    const to = Math.min(t, s[1]);
    const N = 16;
    const lines: V3[][] = [];
    for (let k = 0; k <= N; k++) {
      const tt = from + ((to - from) * k) / N;
      const q = posedOfMob(of(), move, tt);
      struckPoints(move, solve(B, q), q).forEach((p, j) => (lines[j] ??= []).push(p));
    }
    lines.forEach((l, j) => (out[`smear${j}`] = l));
  }
  return out;
}
/** The smear's after-images: the oldest the enemy's fire, dull; the newest near white; between them the Hush's pale. */
const SMEAR = [FLAME[1], HUSH[3], FLAME[2], FLAME[3], '#fff0e6'] as const;
function smearBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (!m.ropes) return bits;
  for (const [k, line] of Object.entries(m.ropes)) {
    if (!k.startsWith('smear') || line.length < 2) continue;
    const mid = k === 'smear3';
    for (let i = 1; i < line.length; i++) {
      const age = i / (line.length - 1);
      const n = Math.max(1, Math.ceil(len(sub(line[i], line[i - 1])) / 1.2));
      for (let j = 0; j < n; j++) {
        const p = lerp3(line[i - 1], line[i], j / n);
        const c = age > 0.88 ? SMEAR[4] : age > 0.66 ? SMEAR[3] : age > 0.42 ? SMEAR[2] : age > 0.2 ? SMEAR[1] : SMEAR[0];
        bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2])], c: mid && age < 0.6 ? HUSH[2] : c, size: age > 0.4 && !mid ? 2 : 1 } });
      }
    }
  }
  return bits;
}

// =============================================================================================
// WHAT HE DOES AT THE BELL (his own picture's): the air rippling round it as he holds the shout; the burst of silence out of it;
// the burst off the bell as the finisher slams; the call's rings going up out of it (the game's own, art/crier.ts)

function bellBits(m: Moment, move: string): Bit[] {
  const bits: Bit[] = [];
  const put = (p: V3, c: string, size = 2): void => void bits.push({ part: 'hush', piece: 'hush', shape: { k: 'mote', p, c, size } });
  const t = m.t;
  const tr = trumpetOf(m.s, m.q);
  const e1 = norm(sub([0, 0, 1], mul(tr.way, tr.way[2])), [1, 0, 0]);
  const e2 = norm([tr.way[1] * e1[2] - tr.way[2] * e1[1], tr.way[2] * e1[0] - tr.way[0] * e1[2], tr.way[0] * e1[1] - tr.way[1] * e1[0]]);
  const ring = (c: V3, r: number, color: string, gap: number, seed: number, size = 2): void => {
    const n = Math.max(10, Math.round(r * 1.6));
    for (let i = 0; i < n; i++) {
      if (hash(i, seed, 4121) < gap) continue;
      const a = (i / n) * Math.PI * 2;
      put(add(c, add(mul(e1, Math.cos(a) * r), mul(e2, Math.sin(a) * r))), color, size);
    }
  };
  if (move === 'shout') {
    // THE AIR ROUND THE BELL RIPPLING as he holds the breath: rings drawn IN to the bell, faster and faster
    if (t > SHOUT_HOLD[0] - 0.1 && t < SHOUT_HIT) {
      const k = rampAt(t, SHOUT_HOLD[0] - 0.1, SHOUT_HOLD[0] + 0.3);
      for (let j = 0; j < 3; j++) {
        const life = ((t * (1.6 + 1.4 * rampAt(t, SHOUT_HOLD[0], SHOUT_HIT)) + j / 3) % 1 + 1) % 1;
        const r = BELL * (2.6 - 1.7 * life);
        ring(add(tr.rim, mul(tr.way, 6 + 16 * (1 - life))), r, life > 0.7 ? FLAME[2] : life > 0.35 ? HUSH[4] : HUSH[3], 0.25 + 0.4 * (1 - k), j + 1);
      }
    }
    // THE SHOUT: a burst of silence out of the bell, rings thrown out from it, the dead air boiling
    const since = t - SHOUT_HIT;
    if (since >= -FR * 0.5 && since < SHOUT_STOP - SHOUT_HIT + 0.2) {
      for (let j = 0; j < 4; j++) {
        const age = since * 2.4 - j * 0.22;
        if (age < 0 || age > 1) continue;
        ring(add(tr.rim, mul(tr.way, 6 + age * 70)), BELL * (1.2 + age * 3.6), age < 0.25 ? FLAME[3] : age < 0.55 ? HUSH[4] : HUSH[3], 0.15 + age * 0.5, j + 7);
      }
      for (let i = 0; i < 30; i++) {
        const life = (since * 2.8 + hash(i, 1, 4123)) % 1;
        const a = hash(i, 2, 4123) * Math.PI * 2;
        const spread = BELL * (0.4 + life * 3.2);
        put(add(add(tr.rim, mul(tr.way, life * 60)), add(mul(e1, Math.cos(a) * spread), mul(e2, Math.sin(a) * spread))), life < 0.2 ? FLAME[3] : life < 0.6 ? HUSH[4] : HUSH[3], life < 0.5 ? 3 : 2);
      }
      if (since < 0.12) bits.push({ part: 'hush', piece: 'hush', shape: { k: 'glow', p: add(tr.rim, mul(tr.way, 8)), c: FLAME[3], r: 34, a: 0.6 } });
    }
  }
  return bits;
}

// =============================================================================================
// HIM, WITH THESE MOVES

/** His canvas for these: room for the trumpet swung round him at full reach in a long stride, and over his head. */
export const CR_ACT_CANVAS: MobCanvas = { w: 560, h: 500, ax: 280, ay: 360 };
let MOB: Mob | null = null;
const mobNow = (): Mob => (MOB ??= crierActionMob());
const withSmear = (mv: MobMove, move: string): MobMove => ({ ...mv, ropes: (t) => smearRopes(mobNow, move, t) });
/** The names these moves go by (none of the game's own, so that his painter draws none of the old moves' bursts on them). */
export const ACT_NAMES = {
  attack: 'The Crier swings his trumpet round, back, and slams it down',
  shout: 'The Crier shouts off the walls',
  proclaim: 'The Crier flings his decree down a lane',
  crowd: 'The Crier calls the crowd',
} as const;
const glintOf = (pts: ReadonlyArray<readonly [number, number, number]>) => (t: number): number => {
  // (his trumpet's throat: a glow, flaring as each blow is held, blazing as it goes, dying after)
  let g = 0.2;
  for (const [from, hit, after] of pts) {
    if (t < from || t > hit + after + 0.3) continue;
    g = Math.max(g, t < hit ? 0.2 + 0.8 * rampAt(t, from, hit - 0.05) : t < hit + after ? 1 : 1 - 0.8 * rampAt(t, hit + after, hit + after + 0.3));
  }
  return g;
};

/** THE CRIER WITH HIS MOVES DONE THE ACTION WAY: his stand, march, setting off and stopping, struck and death the game's own. */
export function crierActionMob(): Mob {
  if (MOB) return MOB;
  const G = CRIER_MOB;
  const more = G.more as Readonly<Record<string, MobMove>>;
  MOB = {
    ...G,
    attack: withSmear({ name: ACT_NAMES.attack, motion: swingMotion(), rest: R, feet: swingFeet(), glint: glintOf([[f(8), SWING_HITS[0], 0.1], [f(36), SWING_HITS[1], 0.1], [f(66), SWING_HITS[2], 0.3]]) }, 'attack'),
    hit: SWING_HITS[0],
    canvas: CR_ACT_CANVAS,
    aura: { ...G.aura, x: CR_ACT_CANVAS.ax - 2, y: CR_ACT_CANVAS.ay - 54 },
    bits: (st, m) => {
      // (the game's own painter: told, for the finisher, that this is a swing slamming down, so that the burst off the bell is the
      // game's own; for the call, that this is the Crowd, so that the rings going up out of the bell are the game's own)
      const name = m.move;
      let base = m;
      if (name === ACT_NAMES.attack) base = { ...m, move: SWING_NAME, since: m.t - SWING_HITS[2] };
      else if (name === ACT_NAMES.crowd) base = { ...m, move: CROWD_NAME, since: m.t - CROWD_HIT };
      const which = name === ACT_NAMES.shout ? 'shout' : '';
      return [...crierBits(st, base), ...smearBits(m), ...(which ? bellBits(m, which) : [])];
    },
    more: {
      ...more,
      shout: withSmear({ name: ACT_NAMES.shout, motion: shoutMotion(), rest: R, feet: shoutFeet(), glint: glintOf([[SHOUT_HOLD[0], SHOUT_HIT, SHOUT_STOP - SHOUT_HIT]]), jaw: (t) => (t < f(10) ? 0.35 : t < SHOUT_HIT ? 0.2 : t < SHOUT_STOP ? 1 : 0.4) }, 'shout'),
      proclaim: withSmear({ name: ACT_NAMES.proclaim, motion: proclaimMotion(), rest: R, feet: proclaimFeet(), glint: glintOf([[PROCLAIM_HOLD[0], PROCLAIM_HIT, 0.05]]) }, 'proclaim'),
      crowd: withSmear({ name: ACT_NAMES.crowd, motion: crowdMotion(), rest: R, feet: crowdFeet(), glint: glintOf([[CROWD_HOLD[0], CROWD_HIT, CROWD_STOP - CROWD_HIT]]), jaw: (t) => (t < CROWD_HIT ? 0.2 : t < CROWD_STOP ? 1 : 0.4) }, 'crowd'),
    },
  };
  return MOB;
}

/** HIM AS THE CHECKS SEE HIM, with these moves: as the game's (CR_SHAPE), each blow of the combo its own, the strikes and the smear. */
export const CR_ACT_SHAPE: BossShape = {
  ...CR_SHAPE,
  tip: (move, t, s, q) => (move === 'proclaim' ? s.handL : CR_SHAPE.tip!(move, t, s, q)),
  things: (move, t, s, q) => {
    const th: CheckThing[] = CR_SHAPE.things!(move, t, s, q);
    // (both his hands on it through the swing: his left hand's forearm may lie along it)
    return move === 'attack' ? th.map((x) => ({ ...x, may: [...(x.may ?? []), 'foreL', 'foreR'] })) : th;
  },
  blows: {
    attack: [
      { hit: SWING_HITS[0], strike: SWING_STRIKES[0], from: 0, until: f(30) },
      { hit: SWING_HITS[1], strike: SWING_STRIKES[1], from: f(30), until: f(62) },
      { hit: SWING_HITS[2], strike: SWING_STRIKES[2], from: f(62) },
    ],
  },
  strikes: { shout: SHOUT_STRIKE, proclaim: PROCLAIM_STRIKE, crowd: CROWD_STRIKE },
  smeared: crSmeared,
};

/** HIM AS THE GAME WOULD HOLD HIM WITH CRIER_ACTION ON. */
export function makeCrierActionArt(pace = CRIER_MOB.pace): ActorArt {
  const mob = crierActionMob();
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
/** Where the bell is (his own lengths), and its tiles before him and to his left, `t` seconds into one of these moves. */
export function bellAt(move: ActMove, t: number): V3 {
  const mob = crierActionMob();
  return trumpetOf(skeletonAt(mob, move, t), posedOfMob(mob, move, t)).rim;
}
export const tilesOf = (p: V3): [number, number] => [p[0] / TILE3, p[1] / TILE3];
void trumpetR;
