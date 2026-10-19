// FLOOR 15'S MEDIUM MOB, THE BOOKWARDENS: the Silent Order in force (the art chat for floors 11 to 15, 19 Oct 2026). A
// MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file; `BOOKWARDENS_ON`, the switch the main chat would put
// them in by, is off. Their moves are art/bookwardens_moves.ts; the mark their tome leaves, art/bookwarden_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 15, THE GREAT LIBRARY, its
// enemies: “the Silent Order in force, and creatures of spilled ink.”; its layout “tall halls of shelves, galleries,
// rolling ladders, chained books and candle chandeliers.” Made on his word to this chat of 18 Oct, 21:24 Pacific: “Hey
// go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”. So
// their brief is this chat's, the picks it would have marked recommended, sent him as they are made:
// - WHO THEY ARE: the Silent Order's men-at-arms, who keep the library for it now: big and broad, a head over the
//   knight, in a coat of black lacquered plates over a long black tabard edged in the Order's grey; the breastplate a
//   closed book's cover, brass at its corners and a strap and clasp down its middle; pauldrons like books' covers; an
//   iron cap over the Order's black hood and its blank white mask, the cult's pink in its eye slits.
// - THEIR WEAPON: a CHAINED TOME, a great iron-bound book on a chain from an iron haft, swung as a flail (his doc's
//   chained books, made a weapon); the brass on it glinting pink as they ready it.
// - THEIR BLOW, THE TOME SLAM: the haft heaved up over the head and the tome whirled round above it on its chain (the
//   warning); then brought over the top and down to crash flat on the floor before them.
// - THEIR DEATH: the chain snaps, the tome bursts open in the air and its pages fly up (the words in it going free,
//   pink going pale); they drop the haft, go down on their knees and fall forward onto their face.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// ON THE HEROES' BONES (art/skeleton.ts), as the orderlies are.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts them in by it, on the owner's yes. */
export const BOOKWARDENS_ON = { on: false };

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

// =============================================================================================
// THEIR COLOURS: black lacquer and brass; the Order's black and grey; its blank mask; iron

const LACQUER: Ramp = ['#0b0a0e', '#0b0a0e', '#2a2632', '#423c4a', '#686272'];
const TABARD: Ramp = ['#0c0b10', '#0c0b10', '#24222b', '#33303c', '#33303c'];
const TRIM: Ramp = ['#2e2c34', '#2e2c34', '#5e5a66', '#787480', '#787480'];
const BRASS: Ramp = ['#38280f', '#38280f', '#7a5c2a', '#a88640', '#c8a656'];
const IRON: Ramp = ['#17181d', '#17181d', '#444852', '#6a6f7a', '#8a8f9a'];
const MASK: Ramp = ['#5a5660', '#5a5660', '#bcb7c2', '#e4e0e8', '#e4e0e8'];
const HOOD: Ramp = ['#0a090d', '#0a090d', '#1f1d25', '#2e2b35', '#2e2b35'];
const BOOT: Ramp = ['#0b0a0a', '#0b0a0a', '#221e1c', '#35302c', '#35302c'];
const GRIP: Ramp = ['#140d0a', '#140d0a', '#33241a', '#4a3424', '#4a3424'];
/** The tome: its black leather, its pages' edges. */
const LEATHER: Ramp = ['#0d0a0c', '#0d0a0c', '#2c2226', '#423438', '#58484e'];
const PAGES: Ramp = ['#6a6250', '#6a6250', '#b4aa92', '#cec4aa', '#e2d8c0'];
/** The pages flying free as they die: the enemy's pink going pale. */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];

// =============================================================================================
// THE BODY

/** Big and broad, a head over the knight (58): 66 tall standing straight. */
export const WB_BODY: Build = buildOf(66, 1.1, { shoulders: 1.18, chest: 1.14, depth: 1.1, waist: 1.12, hips: 1.06, arms: 1.06, trunk: 1.0, limbs: 1.14 });
const B = WB_BODY;
/** Their picture: room for the tome whirled round over their heads and crashed down far before them. */
export const WB_CANVAS: MobCanvas = { w: 440, h: 360, ax: 200, ay: 262 };

// =============================================================================================
// THE CHAINED TOME

/**
 * The haft from the hand along the weapon's way: its butt, its end (the chain's ring); the chain's length; the tome's
 * half-length, half-width and half-thickness; how many links.
 */
export const TOME = { butt: -3, haft: 12, chain: 16, long: 7, wide: 5.5, thick: 2.6, links: 10 } as const;
/** How the chain and the book lie at a moment (the move says): the way the chain runs from the haft's end; the way the book's spine faces; whether the book is whole (not burst). */
export interface TomeWay {
  cd: V3;
  bs: V3;
  whole: boolean;
}
/** The chained tome where it is: the haft's ends; the chain's links; the book's near end (the tie), its middle and its frame (along it, its spine's way, its cover's way). */
export interface TomeAt {
  butt: V3;
  end: V3;
  links: V3[];
  tie: V3;
  mid: V3;
  frame: [V3, V3, V3];
}
/** How high the chain's tie may come down (the book lying on its cover on the floor), and the book's lowest corner. */
const TIE_LOW = TOME.thick + 0.5;
const BOOK_LOW = 0.4;
const Z: V3 = [0, 0, 1];
/** A way along the floor square to `d` on the side of `hint`. */
function flatSide(d: V3, hint: V3): V3 {
  const h = norm([d[0], d[1], 0], [1, 0, 0]);
  const s: V3 = [-h[1], h[0], 0];
  return dot(s, hint) >= 0 ? s : mul(s, -1);
}
export function tomeAt(s: Skeleton, w: TomeWay): TomeAt {
  const butt = add(s.handR, mul(s.point, TOME.butt));
  const end = add(s.handR, mul(s.point, TOME.haft));
  // THE CHAIN, down to the floor at most: what of it would go into the floor lies along it
  let cd = norm(w.cd, [0, 0, -1]);
  const L = w.whole ? TOME.chain : TOME.chain * 0.34;
  if (w.whole && end[2] + cd[2] * L < TIE_LOW) {
    const dz = Math.max(0, end[2] - TIE_LOW);
    const h = norm([cd[0], cd[1], 0], [1, 0, 0]);
    const across = Math.sqrt(Math.max(0, L * L - dz * dz));
    cd = norm(add(mul(h, across), [0, 0, -dz]));
  }
  const tie = add(end, mul(cd, L));
  const n = w.whole ? TOME.links : 3;
  const links: V3[] = [];
  for (let i = 1; i <= n; i++) links.push(lerp3(end, tie, i / n));
  // THE BOOK, hanging on along the chain; if that would put a corner of it in the floor, turned down flat on the floor
  let bd = cd;
  let bs = norm(sub(w.bs, mul(bd, dot(w.bs, bd))), [0, 1, 0]);
  let bu = cross(bd, bs);
  const lowOf = (d: V3, u: V3, sd: V3): number => tie[2] + Math.min(0, 2 * TOME.long * d[2]) - Math.abs(u[2]) * TOME.thick - Math.abs(sd[2]) * TOME.wide;
  if (lowOf(bd, bu, bs) < BOOK_LOW) {
    const h = norm([bd[0], bd[1], 0], [1, 0, 0]);
    const side = flatSide(bd, bs);
    const at = (e: number): [V3, V3] => {
      const d = add(mul(h, Math.cos(e)), mul(Z, Math.sin(e)));
      return [d, cross(d, side)];
    };
    let lo = Math.min(0, Math.asin(Math.max(-1, Math.min(1, bd[2]))));
    let hi = 0;
    for (let i = 0; i < 24; i++) {
      const m = (lo + hi) / 2;
      const [d, u] = at(m);
      if (lowOf(d, u, side) < BOOK_LOW) lo = m;
      else hi = m;
    }
    [bd, bu] = at(hi);
    bs = side;
  }
  const mid = add(tie, mul(bd, TOME.long));
  return { butt, end, links, tie, mid, frame: [bd, bs, bu] };
}
/** The book's eight corners. */
export function bookCorners(t: TomeAt): V3[] {
  const [d, sd, u] = t.frame;
  const out: V3[] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) out.push(add(t.mid, add(mul(d, a * TOME.long), add(mul(sd, b * TOME.wide), mul(u, c * TOME.thick)))));
  return out;
}

// =============================================================================================
// THEM AS SOLIDS

export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = Math.hypot(raw[0], raw[1], raw[2]);
  return l > most ? mul(raw, most / l) : raw;
}
/** A BOX of six panels, turned as `A` (right-handed), its half-sizes `h`; its skin given which face (0, 1 or 2 along A, and its sign) and where on it (each of A's three, -1 to 1). */
function box(put: Put, part: string, piece: string, c: V3, A: readonly [V3, V3, V3], h: V3, skin: (k: number, n: V3, tone: number) => string | null): void {
  for (let k = 0; k < 3; k++) {
    const k1 = (k + 1) % 3;
    const k2 = (k + 2) % 3;
    for (const sgn of [1, -1] as const) {
      const iu = sgn > 0 ? k1 : k2;
      const iv = sgn > 0 ? k2 : k1;
      put(part, piece, {
        k: 'panel',
        c: add(c, mul(A[k], sgn * h[k])),
        u: mul(A[iu], h[iu]),
        v: mul(A[iv], h[iv]),
        skin: (a, b, front, tone) => {
          if (!front) return null;
          const n = [0, 0, 0];
          n[k] = sgn;
          n[iu] = a / h[iu];
          n[iv] = b / h[iv];
          return skin(k, n as unknown as V3, tone);
        },
      });
    }
  }
}
/** An arm in black plate: a pauldron like a book's cover, the vambrace, an iron gauntlet closed round the haft or open. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const [cf, cl, cu] = s.chest;
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 1.12, ramp: LACQUER, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.2), skin: LACQUER, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: add(hand, mul(fore, -1)), ra: r1 * 1.2, rb: r2 * 1.55, ramp: LACQUER, far: true });
  // the pauldron: a book's cover laid over the shoulder, its edge bound in brass
  const out = side === 'L' ? cl : mul(cl, -1);
  put(`arm${side}`, 'pauldron', {
    k: 'ball', c: add(sh, add(mul(cu, 1.4), mul(out, 1.0))), ax: [mul(cf, r0 * 1.85), mul(out, r0 * 1.7), mul(cu, r0 * 1.15)],
    skin: (u, tone) => (u[2] < -0.3 ? null : Math.max(Math.abs(u[0]), Math.abs(u[1])) > 0.82 ? BRASS[Math.min(4, tone)] : LACQUER[tone]),
  });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 2.1), mul(e2, 1.9), mul(e1, 1.4)], skin: IRON, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.44;
    const base = add(hand, add(mul(fore, 1.6), mul(e2, spread)));
    const mid = add(base, add(mul(fore, 1.6 * (1 - 0.4 * curl)), mul(e1, -1.2 * curl)));
    const tip = add(mid, add(mul(fore, 1.2 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.7, rb: 0.62, ramp: IRON, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.62, rb: 0.52, ramp: IRON, far: true });
  }
}
/** A leg in a black greave and a heavy boot. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.05, rb: rK * 1.1, ramp: TABARD, far: true });
  put(`leg${side}`, `knee${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.22), skin: LACQUER, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.18, rb: rA * 1.3, ramp: LACQUER, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.52), mul(up3, 1.9)), ax: [mul(fwd, 5.4), mul(side3, 2.4), mul(up3, 2.0)], skin: BOOT, far: true });
}
/** The trunk in its coat of plates, as rings. */
function trunkRings(s: Skeleton, pad: number): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  return [
    { c: add(s.pelvis, mul(s.hips[2], -0.6)), u: mul(s.hips[0], B.pelvisDeep + 1.8 + pad), v: mul(s.hips[1], B.pelvisHalf + 1.8 + pad) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.6 + pad), v: mul(be[1], B.waistHalf + 1.6 + pad) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.9 + pad), v: mul(cl, B.ribHalf + 1.9 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 1.3 + pad), v: mul(cl, B.shoulderHalf + 0.8 + pad) },
    { c: add(s.neck, mul(cu, 0.3)), u: mul(cf, 3.6 + pad * 0.5), v: mul(cl, 4.0 + pad * 0.5) },
  ];
}
/** The tabard from the waist to the knees, hanging back as they go; its hem edged in the Order's grey. */
function tabard(put: Put, s: Skeleton, lag: V3, ph: number): void {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const spanF = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
  const spanL = Math.abs(dot(sub(s.kneeL, s.kneeR), l));
  const hemC: V3 = [kneeMid[0] + lag[0], kneeMid[1] + lag[1], Math.max(2.0, kneeMid[2] - 1.5)];
  const hemDeep = Math.max(B.pelvisDeep + 2.4, spanF / 2 + 3.0);
  const hemWide = Math.max(B.pelvisHalf + 2.6, spanL / 2 + 3.0);
  const pts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    const q = add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.3], mul(lag, rear * 0.6)));
    pts.push([q[0], q[1], Math.max(0.8, q[2])]);
  }
  const rings: Ring[] = [
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 2.0), v: mul(s.belly[1], B.waistHalf + 2.0) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, B.pelvisDeep + 2.2), v: mul(l, B.pelvisHalf + 2.2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts },
  ];
  put('body', 'tabard', { k: 'cloth', rings, ramp: TABARD, look: { folds: [0, 35, -35, 90, -90, 150, -150], lift: 0.06 } });
  put('body', 'trim', { k: 'band', ring: { c: hemC, u: mul(f, hemDeep + 0.1), v: mul(l, hemWide + 0.1), pts }, ramp: TRIM, rows: 1 });
}
/** THE HEAD: the Order's black hood, the blank white mask in it, the cult's pink in its slits; an iron cap over the hood. */
function head(put: Put, st: Stage, s: Skeleton, lit: number): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0], B.headR[1] * 1.05, B.headR[2]];
  const hc = add(s.head, mul(fu, -0.3));
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: HOOD });
  put('hood', 'hood', {
    k: 'ball', c: add(hc, add(mul(ff, -0.7), mul(fu, 0.2))), ax: [mul(ff, hr[0] * 1.28), mul(fl, hr[1] * 1.34), mul(fu, hr[2] * 1.2)],
    skin: (u, tone) => (u[0] > 0.3 && Math.abs(u[1]) < 0.8 && u[2] < 0.55 ? null : HOOD[tone]),
  });
  const mc = add(hc, mul(ff, hr[0] * 0.42));
  const skin: Skin = (u, tone) => {
    if (u[0] < 0.05) return null;
    if (Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.52 && u[2] > 0.02 && u[2] < 0.2) return '#18141e';
    return MASK[Math.min(4, tone + 1)];
  };
  put('mask', 'mask', { k: 'ball', c: mc, ax: [mul(ff, hr[0] * 0.86), mul(fl, hr[1] * 0.98), mul(fu, hr[2] * 1.02)], skin });
  for (const k of [-1, 1]) {
    const e = add(mc, add(mul(ff, hr[0] * 0.86 * 0.92), add(mul(fl, k * hr[1] * 0.98 * 0.34), mul(fu, hr[2] * 1.02 * 0.11))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#18141e', facing: ff });
  }
  // the iron cap over the hood: a low round crown, a rim round it
  const top = add(hc, mul(fu, hr[2] * 0.6));
  put('cap', 'cap', { k: 'ball', c: add(top, mul(ff, -0.5)), ax: [mul(ff, hr[0] * 1.34), mul(fl, hr[1] * 1.4), mul(fu, hr[2] * 0.74)], skin: (u, tone) => (u[2] < -0.12 ? null : u[2] < 0.02 ? IRON[Math.min(4, tone + 1)] : IRON[tone]) });
}
/** THE BREASTPLATE: a closed book's cover over the chest, black lacquer, brass at its corners, a strap and clasp down its middle. */
function breastplate(put: Put, s: Skeleton): void {
  const [cf, cl, cu] = s.chest;
  const c = add(lerp3(s.ribs, s.neck, 0.32), mul(cf, 0.7));
  put('body', 'plate', {
    k: 'ball', c, ax: [mul(cf, B.ribDeep + 2.3), mul(cl, B.ribHalf + 2.1), mul(cu, (B.ribs + B.chest) * 0.55)],
    skin: (u, tone) => {
      if (u[0] < 0.12) return null;
      const ax = Math.abs(u[1]);
      const az = Math.abs(u[2]);
      if (ax > 0.6 && az > 0.55) return BRASS[Math.min(4, tone)];
      if (ax < 0.1) return u[2] > -0.08 && u[2] < 0.14 ? BRASS[Math.min(4, tone + 1)] : LEATHER[Math.max(1, tone - 1)];
      if (ax > 0.8 || az > 0.82) return LACQUER[Math.max(1, tone - 1)];
      return LACQUER[tone];
    },
  });
}
/** THE CHAINED TOME: the iron haft, its grip bound in leather; the chain; the great iron-bound book on it, its brass glinting pink as they ready it. */
function tome(put: Put, s: Skeleton, w: TomeWay, glint: number): void {
  const t = tomeAt(s, w);
  const grip = add(s.handR, mul(s.point, 2.6));
  put('haft', 'flail', { k: 'rod', a: t.butt, b: grip, ra: 1.05, rb: 1.05, ramp: GRIP });
  put('haft', 'flail', { k: 'rod', a: grip, b: t.end, ra: 1.0, rb: 0.85, ramp: IRON });
  put('haft', 'flail', { k: 'ball', c: t.butt, ax: sphere(1.35), skin: IRON });
  put('haft', 'flail', { k: 'ball', c: t.end, ax: sphere(1.15), skin: IRON });
  t.links.forEach((p, i) => put('chain', 'flail', { k: 'ball', c: p, ax: sphere(i % 2 ? 0.7 : 0.85), skin: IRON }));
  if (!w.whole) return;
  const pink = glint > 0.3;
  box(put, 'book', 'tome', t.mid, t.frame, [TOME.long, TOME.wide, TOME.thick], (k, n, tone) => {
    const [x, y, z] = n;
    // (its covers: black leather, a tooled border, brass at its corners, a brass boss in the middle, two clasps over the fore-edge)
    if (k === 2) {
      if (Math.abs(x) > 0.76 && Math.abs(y) > 0.7) return BRASS[Math.min(4, tone)];
      if (Math.hypot(x * 0.8, y) < 0.22) return pink ? FLAME[Math.hypot(x * 0.8, y) < 0.12 ? 0 : 1] : BRASS[Math.min(4, tone + 1)];
      if (y < -0.7 && (Math.abs(x - 0.45) < 0.1 || Math.abs(x + 0.45) < 0.1)) return pink ? FLAME[2] : BRASS[Math.max(1, tone)];
      if (Math.abs(Math.abs(x) - 0.86) < 0.035 || Math.abs(Math.abs(y) - 0.82) < 0.05) return LEATHER[Math.max(1, tone - 1)];
      return LEATHER[tone];
    }
    // (the boards' edges)
    if (Math.abs(z) > 0.7) return LEATHER[Math.max(1, tone - 1)];
    // (its spine, with raised bands)
    if (k === 1 && y > 0) return [-0.6, -0.2, 0.2, 0.6].some((b) => Math.abs(x - b) < 0.07) ? LEATHER[Math.min(4, tone + 1)] : LEATHER[tone];
    // (the clasps crossing the fore-edge)
    if (k === 1 && (Math.abs(x - 0.45) < 0.1 || Math.abs(x + 0.45) < 0.1)) return pink ? FLAME[2] : BRASS[Math.max(1, tone)];
    // (the pages' edges, ruled)
    if (k === 0 && y > 0.86) return LEATHER[tone];
    return hash(Math.floor((z + 1) * 5), 0, 9041) > 0.6 ? PAGES[Math.max(1, tone - 1)] : PAGES[tone];
  });
  // (the iron hasp the chain is made fast to)
  put('book', 'tome', { k: 'ball', c: t.tie, ax: sphere(1.1), skin: IRON });
  if (glint > 0.05) put('book', 'glint', { k: 'glow', p: t.mid, c: FLAME[1], r: 6 + 6 * glint, a: 0.45 * glint });
}

/** What a moment of a move says over and above the bones. */
export interface WardenSay {
  /** How the chain and the book lie (and whether the book is whole). */
  tome: (m: Moment) => TomeWay;
  /** The flash as the tome bursts: where, and how bright (1 to 0). */
  flash?: (m: Moment) => { p: V3; a: number } | null;
  /** Grains: the pages flying free as they die. */
  grains?: (m: Moment, out: [V3, string, number][]) => void;
}
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function wardenBits(st: Stage, m: Moment, say: WardenSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [, , cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.3, 2.8);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  put('body', 'coat', { k: 'cloth', rings: trunkRings(s, 0.4), ramp: LACQUER, look: { folds: [0, 60, -60, 120, -120], lift: 0.04 } });
  tabard(put, s, lag, m.t * 3);
  breastplate(put, s);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 2.3), v: mul(s.belly[1], B.waistHalf + 2.3) }, ramp: LEATHER, rows: 2 });
  put('body', 'buckle', { k: 'ball', c: add(waistC, mul(s.belly[0], B.waistDeep + 2.6)), ax: [mul(s.belly[0], 0.5), mul(s.belly[1], 1.4), mul(s.belly[2], 1.2)], skin: BRASS });
  arm(put, s, 'L', 0.55);
  arm(put, s, 'R', 1);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.4)), b: lerp3(s.neck, s.head, 0.5), ra: 3.0, rb: 2.8, ramp: HOOD });
  head(put, st, s, lit);
  // (the flail is painted even once it is gone from them: as they die it falls as a piece of its own, Mob.fall)
  tome(put, s, say.tome(m), clamp01(m.glint));
  const fl = say.flash?.(m);
  if (fl) put('burst', 'burst', { k: 'glow', p: fl.p, c: FLAME[1], r: 10 + 10 * (1 - fl.a), a: 0.6 * fl.a });
  say.grains?.(m, grains);
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their rest: planted wide, the flail's haft held out before them in the right hand, the tome hanging from it by the knee; the left hand loose. */
const REST0: Bones = {
  ...standing(B),
  pz: -0.5, pitch: 4, bend: 6, roll: 0, side: 0, faceUp: -2, faceTilt: 0, faceTurn: 0,
  lfx: 1.4, lfy: 3.2, lft: 14, lk: 8, rfx: -1, rfy: -3.2, rft: -14, rk: -8,
  lhIn: 1, lhx: 3, lhy: 4, lhz: -27,
  rhIn: 1, rhx: 8, rhy: -5, rhz: -20, wAz: 4, wEl: 24, wRoll: 0,
  pt: 0, out: 0,
} as Bones;
export const WB_REST: Bones = {
  ...REST0,
  le: elbowFor(B, REST0 as Posed, true, norm([-0.2, 0.6, -0.8])),
  re: elbowFor(B, REST0 as Posed, false, norm([-0.4, -0.7, -0.5])),
};

/** Their stand: 3.2 s round. Heavy, breathing; the masked head turning slowly. */
export const WB_STAND_LONG = 3.2;
export function wardenStand(): Motion {
  const R = WB_REST;
  const T = WB_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.7 * breath,
        py: 0.8 * Math.sin(a),
        roll: R.roll + 1.6 * Math.sin(a),
        bend: R.bend - 1.6 * breath,
        faceUp: R.faceUp + 2 * Math.sin(a * 2 + 0.4),
        faceTurn: R.faceTurn + 22 * Math.sin(a + 0.6),
        wEl: R.wEl + 3 * Math.sin(a * 2),
        rhz: R.rhz + 0.5 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

/** THEM AS THE PAINTER TAKES THEM. */
export function wardenPainter(say: WardenSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => wardenBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}

/** THE PAGES FLYING FREE out of the tome as it bursts: pink going pale, fluttering up and away from `from`, from `t0` to `t1`. */
export function pagesFree(out: [V3, string, number][], from: V3, t: number, t0: number, t1: number): void {
  if (t < t0 || t > t1) return;
  const k = (t - t0) / (t1 - t0);
  for (let i = 0; i < 46; i++) {
    const born = (i / 46) * 0.35;
    if (k < born) continue;
    const life = (k - born) / (1 - born);
    if (life > 0.97) continue;
    const a = i * 2.39996;
    const r = (3 + 13 * hash(i, 1, 8801)) * Math.sqrt(life) * (1 + 0.6 * (1 - life));
    const up = 52 * life - 10 * life * life + 4 * Math.sin(life * 7 + i);
    const p: V3 = [from[0] + Math.cos(a + life * 2.4) * r, from[1] + Math.sin(a + life * 2.4) * r, from[2] + up];
    // (each a page turning over as it flutters: now its face, now its edge)
    const flap = Math.sin(life * 18 + i * 1.7) > 0;
    const pale = life > 0.35 + 0.25 * hash(i, 2, 8801);
    out.push([p, pale ? FREED[life > 0.75 ? 4 : 3] : life < 0.12 ? FLAME[0] : FLAME[2], flap && life < 0.8 ? 2 : 1]);
  }
}
