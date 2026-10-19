// FLOOR 15'S SMALL MOB, THE INKLINGS: creatures of spilled ink (the art chat for floors 11 to 15, 19 Oct 2026). A
// MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file; `INKLINGS_ON`, the switch the main chat would put them
// in by, is off. Their moves are art/inklings_moves.ts; the puddle they go about as, art/inkling_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 15, THE GREAT LIBRARY, its
// enemies: “the Silent Order in force, and creatures of spilled ink.” Made on his word to this chat of 18 Oct, 21:24
// Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”. So their brief is this chat's, the picks it would have marked recommended, sent him as they are made:
// - WHAT THEY ARE: the Order's ink, spilled across the library's floors, that has got up and walks: small, hunched,
//   about the knight's chest, all of them glossy black ink, a cold sheen on it; long thin arms hanging to the floor,
//   each ending in three long claws that drip; short legs that run down at the feet into a puddle on the floor; a
//   lump of a head with no face but two pink eyes; ink forever running down them and dripping off.
// - HOW THEY GO: scuttling low and fast; or, sunk into a puddle of ink, sliding along the floor and rising up out of it
//   again before you.
// - THEIR BLOW, THE INK LASH: they rear up tall, arms flung wide, claws spread, the eyes flaring, quivering (the
//   warning); then lunge and rake both claws down across before them, ink flying.
// - THEIR DEATH: struck down, they burst: the ink splashes out, they slump and run down into a spreading pool, the
//   eyes go out, and the pool dries away to a stain.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// ON THE HEROES' BONES (art/skeleton.ts), as the Hushed are, built small and crouched, and painted as ink.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts them in by it, on the owner's yes. */
export const INKLINGS_ON = { on: false };

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const fr = (t: number): number => t - Math.floor(t);

// =============================================================================================
// THEIR COLOURS: the Order's ink, glossy, a cold sheen on it

/** Their body: ink, its darks, and the cold sheen where the light catches it. */
export const INKBODY: Ramp = ['#06050a', '#06050a', '#1a1622', '#302a3c', '#5e5874'];
/** The pool of ink under them, flat on the floor: a shade darker, its sheen a line. */
const POOL: Ramp = ['#040306', '#040306', '#0c0a11', '#18151f', '#3a3548'];
/** The sheen, as a spot: where the light catches the wet ink. */
export const SHEEN = '#5e5872';
/** A drop of ink flying or falling. */
export const DROP = '#08070c';

// =============================================================================================
// THE BODY

/** Small and hunched: 42 tall were they to stand straight (the knight 58), crouched to about his chest; their arms long. */
export const IK_BODY: Build = buildOf(42, 1.25, { shoulders: 0.92, chest: 0.94, depth: 0.96, waist: 0.78, hips: 0.84, legs: 0.86, arms: 1.34, trunk: 0.92, limbs: 1.12 });
const B = IK_BODY;
/** Their picture: room for them reared up tall with their arms flung wide, and for their pool spread out. */
export const IK_CANVAS: MobCanvas = { w: 230, h: 190, ax: 115, ay: 140 };

// =============================================================================================
// THEM AS SOLIDS

/** How their going drags what hangs off them. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}
/** A long thin arm of ink and its hand of three long claws, spread (`open` 1) or hanging slack; all of it scaled by `f` as they melt. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', open: number, cu: V3, f: number): void {
  const [r0, r1, r2] = B.armR;
  // (an elbow or a hand down on the floor rests on it, its ink spread there, not sunk into it)
  const lift = (p: V3, r: number): V3 => [p[0], p[1], Math.max(p[2], r + 0.1)];
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = lift(side === 'L' ? s.elbowL : s.elbowR, r1 * 0.98 * f);
  const hand = lift(side === 'L' ? s.handL : s.handR, 1.6 * f);
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.15 * f), skin: INKBODY, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.05 * f, rb: r1 * 0.95 * f, ramp: INKBODY, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 0.98 * f), skin: INKBODY, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: hand, ra: r1 * 0.9 * f, rb: r2 * 0.95 * f, ramp: INKBODY, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.6 * f), mul(e2, 1.4 * f), mul(e1, 0.8 * f)], skin: INKBODY, far: true });
  // three long claws: spread and hooked, or hanging together
  for (let i = 0; i < 3; i++) {
    const spread = (i - 1) * (0.25 + 0.75 * open);
    const base = add(hand, add(mul(fore, 1.2), mul(e2, spread * 0.9)));
    const curl = 1 - open;
    const mid = add(base, add(mul(fore, 2.6 * f), add(mul(e1, -0.6 * curl), mul(e2, spread * 0.9 * f))));
    const tip = add(mid, add(mul(fore, 2.2 * f), add(mul(e1, -1.6 + 0.8 * open), mul(e2, spread * 0.4 * f))));
    // (claws that reach the floor drag along it, not into it)
    const up = (p: V3, r: number): V3 => [p[0], p[1], Math.max(p[2], r + 0.05)];
    put(`hand${side}`, `claw${side}`, { k: 'rod', a: up(base, 0.6 * f), b: up(mid, 0.45 * f), ra: 0.6 * f, rb: 0.45 * f, ramp: INKBODY, far: true });
    put(`hand${side}`, `claw${side}`, { k: 'rod', a: up(mid, 0.45 * f), b: up(tip, 0.2 * f), ra: 0.45 * f, rb: 0.2 * f, ramp: INKBODY, far: true });
  }
}
/** A short leg of ink, thick at the thigh, running down at the foot into a splash on the floor. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', f: number): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.05 * f, rb: rK * 1.0 * f, ramp: INKBODY, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.02 * f), skin: INKBODY, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 0.95 * f, rb: rA * 1.2 * f, ramp: INKBODY, far: true });
  // the foot: a splayed lump of ink, its edge spread thin on the floor
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  const mid = add(lerp3(heel, toe, 0.5), mul(up3, 1.1 * f));
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: mid, ax: [mul(fwd, 4.4 * f), mul(side3, 2.6 * f), mul(up3, 1.1 * f)], skin: INKBODY, far: true });
}
/** The trunk: a hunched lump of ink, as rings from the neck down to the hips, its back humped. */
function trunk(s: Skeleton, f: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const g = (v: number): number => v * f;
  return [
    { c: add(s.pelvis, mul(s.hips[2], -0.4)), u: mul(s.hips[0], g(B.pelvisDeep + 1.2)), v: mul(s.hips[1], g(B.pelvisHalf + 1.2)) },
    { c: waistC, u: mul(be[0], g(B.waistDeep + 1.2)), v: mul(be[1], g(B.waistHalf + 1.2)) },
    { c: add(s.ribs, mul(cf, -0.6)), u: mul(cf, g(B.ribDeep + 1.9)), v: mul(cl, g(B.ribHalf + 1.4)) },
    { c: add(lerp3(s.ribs, s.neck, 0.7), mul(cf, -0.8)), u: mul(cf, g(B.ribDeep + 1.2)), v: mul(cl, g(B.shoulderHalf + 0.6)) },
    { c: add(s.neck, mul(cu, 0.4)), u: mul(cf, g(2.6)), v: mul(cl, g(2.8)) },
  ];
}
/** The head: a lump of ink with no face, two pink eyes in it; a drip hanging from where a chin would be. */
function head(put: Put, st: Stage, s: Skeleton, lit: number, f: number, flare: number): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0] * 1.05 * f, B.headR[1] * 1.1 * f, B.headR[2] * 0.95 * f];
  const hc = add(s.head, mul(fu, -0.4));
  put('head', 'head', {
    k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])],
    skin: (u, tone) => (u[0] < -0.2 && u[2] > 0.5 && fr((u[1] + 1) * 3) < 0.15 ? INKBODY[4] : INKBODY[tone]),
  });
  // the drip from its chin
  put('head', 'drip', { k: 'rod', a: add(hc, add(mul(ff, hr[0] * 0.6), mul(fu, -hr[2] * 0.7))), b: add(hc, add(mul(ff, hr[0] * 0.7), mul(fu, -hr[2] * 1.5))), ra: 0.7 * f, rb: 0.4 * f, ramp: INKBODY });
  if (f < 0.25) return;
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.4), mul(fu, hr[2] * 0.12))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[flare > 0.5 ? 0 : 1] : '#18141e', facing: ff, c2: lit > 0.4 ? FLAME[1] : undefined });
    if (lit > 0.4) put('head', 'glow', { k: 'glow', p: e, c: FLAME[1], r: 3 + 4 * flare, a: 0.2 + 0.3 * flare });
  }
}

/** What a moment of a move says over and above the bones. */
export interface InklingSay {
  /** How much of it stands up out of its pool (1 all of it; 0 sunk into the pool, only the pool left). */
  form: (m: Moment) => number;
  /** How far its pool is spread on the floor under it (tiles of radius, about), and how far it has dried away (0 wet, 1 gone). */
  pool: (m: Moment) => number;
  dried: (m: Moment) => number;
  /** How far its claws are spread (0 slack, 1 spread), and its eyes flaring (0 to 1). */
  open: (m: Moment) => number;
  flare: (m: Moment) => number;
  /** Ink thrown off it at the moment (as it lashes, as it bursts). */
  grains?: (m: Moment, out: [V3, string, number][]) => void;
}
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function inklingBits(st: Stage, m: Moment, say: InklingSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [, , cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const f = clamp01(say.form(m));
  const open = clamp01(say.open(m));
  // THE POOL under it: flat on the floor, round its feet, wet and glossy; drying to a dull stain
  const pr = say.pool(m);
  const dry = clamp01(say.dried(m));
  if (pr > 0.05 && dry < 0.98) {
    const mid = lerp3(lerp3(s.ankleL, s.ankleR, 0.5), s.pelvis, 0.25);
    const c: V3 = [mid[0], mid[1], 0.35];
    const R = pr * 39;
    put('pool', 'pool', {
      k: 'ball', c, ax: [[R, 0, 0], [0, R * 0.9, 0], [0, 0, 0.3]],
      skin: (u, tone) => {
        const rag = Math.hypot(u[0], u[1]) + 0.12 * Math.sin(Math.atan2(u[1], u[0]) * 5 + 1.3) + 0.06 * Math.sin(Math.atan2(u[1], u[0]) * 11);
        if (rag > 0.95) return null;
        if (dry > 0 && hash(Math.floor((u[0] + 1) * 30), Math.floor((u[1] + 1) * 30), 8601) < dry) return null;
        if (Math.abs(u[0] * 0.6 + u[1] * 0.8 - 0.3) < 0.05 && Math.hypot(u[0], u[1]) < 0.55 && dry < 0.4) return POOL[3];
        return dry > 0.5 ? '#16141a' : POOL[Math.min(3, tone)];
      },
    });
  }
  if (f > 0.04) {
    for (const side of ['L', 'R'] as const) leg(put, s, side, f);
    put('body', 'body', { k: 'cloth', rings: trunk(s, f), ramp: INKBODY, look: { folds: [], lift: 0.02 } });
    // the sheen running down its back, and the drips standing out on it
    for (let i = 0; i < 4; i++) {
      const p = add(lerp3(s.neck, s.ribs, 0.3 + 0.2 * i), add(mul(s.chest[0], -(B.ribDeep + 1.9) * f * 0.9), mul(s.chest[1], (i % 2 ? 1 : -1) * 1.4 * f)));
      put('body', 'sheen', { k: 'ball', c: p, ax: sphere(0.5 * f), skin: () => SHEEN });
    }
    arm(put, s, 'L', open, cu, f);
    arm(put, s, 'R', open, cu, f);
    put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.0)), b: lerp3(s.neck, s.head, 0.5), ra: 2.4 * f, rb: 2.1 * f, ramp: INKBODY });
    head(put, st, s, lit, f, clamp01(say.flare(m)));
  }
  // INK DRIPPING off it all the while: drops falling from its hands and its chin, as long as it stands
  if (f > 0.3) {
    for (let i = 0; i < 4; i++) {
      const from = i % 2 ? s.handL : s.handR;
      const life = fr(m.t * 1.6 + i * 0.27);
      const p: V3 = [from[0] + 0.6 * (i - 1.5), from[1], from[2] - 1.5 - life * Math.max(0, from[2] - 2)];
      if (p[2] > 0.5) grains.push([p, DROP, 1]);
    }
  }
  say.grains?.(m, grains);
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their rest: crouched low and hunched, their long arms hanging to the floor before them, the head thrust forward. */
const REST0: Bones = {
  ...standing(B),
  pz: -6.2, pitch: 24, bend: 22, roll: 0, side: 0, faceUp: 18, faceTilt: 0, faceTurn: 0,
  lfx: 1.0, lfy: 2.4, lft: 14, lk: 10, rfx: -1.4, rfy: -2.4, rft: -14, rk: -10,
  lhIn: 1, lhx: 6, lhy: 2.5, lhz: -19, rhIn: 1, rhx: 5, rhy: -2.5, rhz: -19.5,
} as Bones;
export const IK_REST: Bones = {
  ...REST0,
  le: elbowFor(B, REST0 as Posed, true, norm([-0.3, 0.8, -0.3])),
  re: elbowFor(B, REST0 as Posed, false, norm([-0.3, -0.8, -0.3])),
};

/** Their stand: 2.8 s round. Swaying on their haunches, the ink running down them; the head twitching round; once a round a shudder through them. */
export const IK_STAND_LONG = 2.8;
export function inklingStand(): Motion {
  const R = IK_REST;
  const T = IK_STAND_LONG;
  const keys: Key3[] = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    // (a shudder through it once a round)
    const shud = Math.exp(-(((t - 1.9) / 0.12) ** 2)) * Math.sin(t * 60);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.6 * breath,
        py: 0.9 * Math.sin(a),
        roll: R.roll + 3 * Math.sin(a) + 3 * shud,
        bend: R.bend - 2.4 * breath,
        faceUp: R.faceUp + 3 * Math.sin(a * 2 + 0.4),
        faceTurn: R.faceTurn + 18 * Math.tanh(3 * Math.sin(a + 0.3)),
        faceTilt: R.faceTilt + 10 * Math.sin(a * 3 + 1) + 8 * shud,
        lhz: (R.lhz as number) + 0.6 * breath,
        rhz: (R.rhz as number) + 0.6 * Math.sin(a * 2 + 1),
        lhx: (R.lhx as number) + 0.8 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** THEM AS THE PAINTER TAKES THEM. */
export function inklingPainter(say: InklingSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => inklingBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
