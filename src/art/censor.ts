// FLOOR 15'S BOSS, THE CENSOR (the art chat for floors 11 to 15, 19 Oct 2026): the lair boss of Act 2's first half. A
// MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file; `CENSOR_ON`, the switch the main chat would put him
// in by, is off. His moves are art/censor_moves.ts; what he lays on the floor, art/censor_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 15, THE GREAT LIBRARY:
// “Boss: The Censor. His floor is The Reading Room. The leader of the Silent Order, robed in black, with a great ink
// brush. Whatever he strikes through is gone.” His moves there: “a brush slash (his basic attack); Redaction, black bars
// slamming across the floor in a telegraphed pattern; Strike-Through, a line drawn straight through you, which you have
// to dodge; the Hush, silence across the whole room. At half life he blacks out parts of the floor for good, so the room
// shrinks.” And: “when he falls, the book bursts and the words fly home, and across the city people speak again.”
//
// Made on his word to this chat of 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it
// to it but you’re doing a great jobs. At least for 11-15”. So his brief is this chat's, the picks it would have marked
// recommended, sent him as he is made:
// - SIZE AND BEARING: the lair boss, the Order's leader: tall and broad, half a head again over the Physician (84 tall,
//   the knight 58), still and upright as a pillar, every stroke of his a calligrapher's: slow to rise, then all at once.
// - HIS LOOK: the Silent Order's black, a great robe to the floor with wide sleeves; behind his head a high stiff collar
//   of black pages fanned out like a ruff, their edges grey; the Order's blank white mask, larger than his scribes',
//   two eye slits burning pink and, where a mouth would be, a bar of black ink painted across it (the Order's own mark);
//   down his front the robe is a page of writing in grey, line after line, struck through with black bars; an iron chain
//   of office over his shoulders, a lock hanging from it, its keyhole burning pink; long grey fingers black with ink.
// - THE GREAT INK BRUSH, taller than he is, held like a staff: a shaft of black lacquer banded with brass, a brass
//   ferrule, a great head of black bristles heavy and dripping with the Order's ink, glinting pink as he readies it.
// - Nothing gory: he strikes words out, not men.
// And the owner's words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's (no cult robe, no bone, no violet).
//
// ON THE HEROES' BONES (art/skeleton.ts), as the Physician is: a monster of art/new_mobs3.ts's kind, on a canvas of his own.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts him in by it, on the owner's yes. */
export const CENSOR_ON = { on: false };

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

// =============================================================================================
// HIS COLOURS: the Order's black; its blank bone-white; grey writing struck out in black; iron; brass on the brush

const ROBE: Ramp = ['#0a090d', '#0a090d', '#24222b', '#36333f', '#36333f'];
const LINING: Ramp = ['#050407', '#050407', '#121017', '#1b1922', '#1b1922'];
const COLLAR: Ramp = ['#08070b', '#08070b', '#1c1a22', '#2c2a33', '#3a3742'];
/** The page edges of his collar, grey. */
const EDGE: Ramp = ['#3a3842', '#3a3842', '#706c78', '#8e8a96', '#8e8a96'];
const MASK: Ramp = ['#5e5a62', '#5e5a62', '#c4bfc8', '#e8e4ec', '#f2eff4'];
const HAND: Ramp = ['#2a282e', '#2a282e', '#5e5a62', '#78747c', '#78747c'];
/** The writing down his front: grey lines on the black, and the bars struck through them. */
const WRITING = '#6e6a74';
export const INK = '#050408';
const IRON: Ramp = ['#17181d', '#17181d', '#444852', '#6a6f7a', '#6a6f7a'];
/** The brush: its shaft of pale bone-white bamboo, banded in black lacquer; its brass ferrule; its bristles. */
const BAMBOO: Ramp = ['#5a564c', '#5a564c', '#aaa290', '#ccc4b0', '#e0d9c6'];
const LACQUER: Ramp = ['#08070a', '#08070a', '#1e1c22', '#34303a', '#4a4552'];
const BRASS: Ramp = ['#38280f', '#38280f', '#7a5c2a', '#a88640', '#c8a656'];
const BRISTLE: Ramp = ['#050408', '#050408', '#141218', '#262230', '#3c3648'];

// =============================================================================================
// THE BODY

/** The Order's leader: 84 tall standing straight (the knight 58, the Physician 72), broad in the shoulder, long-armed. */
export const CE_BODY: Build = buildOf(84, 1.06, { shoulders: 1.1, chest: 1.06, depth: 1.04, waist: 1.0, hips: 1.04, legs: 1.0, arms: 1.06, trunk: 1.04, limbs: 0.96 });
const B = CE_BODY;
/** His picture: room for the brush held high over his head, swept wide, and thrust far out before him. */
export const CE_CANVAS: MobCanvas = { w: 640, h: 520, ax: 320, ay: 370 };

// =============================================================================================
// THE GREAT INK BRUSH

/** The brush in his right hand, held near its butt as a great sword is held: from the hand along the weapon's way, its butt just behind the hand, its brass ferrule, its bristles' root, their belly, their point. */
export const BRUSH = { butt: -10, ferrule: 42, root: 46, belly: 52, tip: 66 } as const;
export function brushOf(s: Skeleton): { butt: V3; ferrule: V3; root: V3; belly: V3; tip: V3; way: V3 } {
  const at = (k: number): V3 => add(s.handR, mul(s.point, k));
  return { butt: at(BRUSH.butt), ferrule: at(BRUSH.ferrule), root: at(BRUSH.root), belly: at(BRUSH.belly), tip: at(BRUSH.tip), way: s.point };
}

// =============================================================================================
// HIM AS SOLIDS

/** How his going drags what hangs off him. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** A wide black sleeve from the shoulder, flaring past the elbow; a long grey hand, its fingers black with ink, closed round the brush (`curl` 1) or open. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number, lag: V3, point = 0): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.4), skin: ROBE, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.36, rb: r1 * 1.42, ramp: ROBE, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.44), skin: ROBE, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  const m0 = add(lerp3(el, wrist, 0.9), add([0, 0, -1.0], mul(lag, 0.4)));
  // (the sleeve's mouth lies on the floor, not in it, where his arms are laid down)
  const mouth: V3 = [m0[0], m0[1], Math.max(m0[2], r2 * 2.5 + 0.3)];
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: mouth, ra: r1 * 1.46, rb: r2 * 2.5, ramp: ROBE, far: true });
  put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: lerp3(el, mouth, 0.92), b: add(mouth, mul(fore, 0.3)), ra: r2 * 2.2, rb: r2 * 2.1, ramp: LINING, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.3)), ax: [mul(fore, 1.9), mul(e2, 1.55), mul(e1, 1.0)], skin: HAND, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.36;
    const base = add(hand, add(mul(fore, 1.5), mul(e2, spread * 0.85)));
    // (one finger raised straight, as he hushes the room; the rest curled)
    const c = point > 0.5 && i === 0 ? 0 : point > 0.5 ? 1 : curl;
    const mid = add(base, add(mul(fore, 1.8 * (1 - 0.4 * c)), mul(e1, -1.2 * c)));
    const tip = add(mid, add(mul(fore, (point > 0.5 && i === 0 ? 2.2 : 1.5) * (1 - 0.8 * c)), mul(e1, -1.5 * c)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.5, rb: 0.44, ramp: HAND, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.44, rb: 0.34, ramp: [INK, INK, '#1c1820', '#2a2430', '#2a2430'], far: true });
  }
}

/** A plain black shoe, only its toe out from under the robe; the shin within the robe, to keep it off a lifted foot. */
function shoe(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.55), mul(up3, 1.5)), ax: [mul(fwd, 5.0), mul(side3, 2.0), mul(up3, 1.6)], skin: LINING, far: true });
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.5), b: ankle, ra: B.legR[2] * 1.15, rb: B.legR[2] * 1.15, ramp: LINING, far: true });
}

/**
 * THE ROBE: from his collar down over his chest and hips to the floor, round both legs, its hem lying on the floor
 * about his feet and dragging behind as he goes. Down its front, A PAGE OF WRITING: grey lines, struck through in black.
 */
function robe(put: Put, s: Skeleton, lag: V3, ph: number, low: number): V3 {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const spanF = Math.abs(dot(sub(s.ankleL, s.ankleR), f));
  const spanL = Math.abs(dot(sub(s.ankleL, s.ankleR), l));
  // (standing, the hem lies round the feet on the floor; kneeling or lying, it lies about his shins where they are)
  const hemZ = Math.min(1.8, Math.min(s.ankleL[2], s.ankleR[2]) + 1.0) + low * 2;
  const hemC: V3 = [footMid[0] * (1 - 0.35 * low) + kneeMid[0] * 0.35 * low + lag[0] * 1.3, footMid[1] + lag[1] * 1.3, hemZ];
  const hemDeep = Math.max(B.pelvisDeep + 4.6, spanF / 2 + 3.8);
  const hemWide = Math.max(B.pelvisHalf + 4.8, spanL / 2 + 3.6);
  const hemPts: V3[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep * (1 + 0.15 * rear)), mul(l, Math.sin(a) * hemWide)));
    const q = add(p, add([0, 0, Math.max(0, Math.sin(ph * 2 + a * 3) * 0.3)], mul(lag, rear * 0.8)));
    hemPts.push([q[0], q[1], Math.max(0.8, q[2])]);
  }
  const rings: Ring[] = [
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, Math.max(2.4, kneeMid[2])], u: mul(f, (B.pelvisDeep + 3.2 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 3.4 + hemWide) / 2) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, B.pelvisDeep + 2.8), v: mul(l, B.pelvisHalf + 3.0) },
    { c: waistC, u: mul(be[0], B.waistDeep + 2.0), v: mul(be[1], B.waistHalf + 2.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.ribHalf + 2.2) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 1.5), v: mul(cl, B.shoulderHalf + 1.2) },
    { c: add(s.neck, mul(cu, 0.2)), u: mul(cf, 4.8), v: mul(cl, 5.4) },
  ];
  put('body', 'robe', { k: 'cloth', rings, ramp: ROBE, look: { folds: [20, -20, 55, -55, 90, -90, 130, -130, 165, -165], lift: 0.05 } });
  // THE PAGE DOWN HIS FRONT: lines of grey writing, most of them struck through with a bar of black
  for (let row = 0; row < 7; row++) {
    const k = row / 6;
    const c0 = row < 4 ? lerp3(lerp3(s.ribs, s.neck, 0.55), s.ribs, row / 3) : lerp3(s.ribs, waistC, (row - 3) / 3);
    const depth = row < 4 ? B.ribDeep + 2.15 - 0.2 * k : B.waistDeep + 2.15 + 0.4 * (row - 4) / 2;
    const fr0 = row < 4 ? cf : be[0];
    const lr0 = row < 4 ? cl : be[1];
    const half = row < 4 ? 3.6 : 3.2;
    const struck = hash(row, 1, 8401) < 0.7;
    for (let i = 0; i < 6; i++) {
      const y0 = -half + (2 * half * i) / 6;
      if (hash(i, row, 8402) < 0.2) continue;
      const p = add(c0, add(mul(fr0, depth), mul(lr0, y0 + 0.5)));
      put('body', 'writing', { k: 'ball', c: p, ax: [mul(fr0, 0.2), mul(lr0, 0.42), mul(cu, 0.28)], skin: () => WRITING });
    }
    if (struck) {
      const a = add(c0, add(mul(fr0, depth + 0.15), mul(lr0, -half - 0.2)));
      const b = add(c0, add(mul(fr0, depth + 0.15), mul(lr0, half * (0.4 + 0.6 * hash(row, 2, 8401)))));
      put('body', 'writing', { k: 'rod', a, b, ra: 0.5, rb: 0.45, ramp: [INK, INK, INK, '#1a1820', '#1a1820'] });
    }
  }
  return waistC;
}

/** HIS CHAIN OF OFFICE: iron links over his shoulders and down his front, a great lock hanging from it, its keyhole burning pink while he lives. */
function chain(put: Put, s: Skeleton, lit: number): void {
  const [cf, cl, cu] = s.chest;
  const top = add(s.neck, mul(cu, -0.6));
  const low = add(lerp3(s.ribs, s.neck, 0.35), mul(cf, B.ribDeep + 2.6));
  for (const side of [-1, 1]) {
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const out = Math.sin(t * Math.PI) * (B.shoulderHalf * 0.7);
      const p = add(lerp3(add(top, add(mul(cl, side * 5.4), mul(cf, 1.0))), low, t), add(mul(cl, side * out * 0.5), mul(cf, 2.0 * Math.sin(t * Math.PI) + 0.2)));
      put('body', 'chain', { k: 'ball', c: p, ax: sphere(0.62), skin: IRON });
    }
  }
  // the lock: a heavy iron padlock, its shackle through the chain, its keyhole
  const lc = add(low, mul(cu, -3.4));
  put('body', 'lock', { k: 'ball', c: lc, ax: [mul(cf, 1.3), mul(cl, 2.4), mul(cu, 2.4)], skin: IRON });
  put('body', 'lock', { k: 'rod', a: add(lc, add(mul(cl, -1.4), mul(cu, 1.8))), b: add(lc, add(mul(cl, 1.4), mul(cu, 1.8))), ra: 0.55, rb: 0.55, ramp: IRON });
  put('body', 'keyhole', { k: 'dot', p: add(lc, mul(cf, 1.3)), c: lit > 0.4 ? FLAME[1] : '#18141e', facing: cf });
}

/**
 * THE HEAD: in a deep hood, the BLANK WHITE MASK, larger than his scribes', smooth; two slits for the eyes burning pink;
 * where a mouth would be, a bar of the Order's black ink painted across it. Behind it, his HIGH COLLAR of black pages
 * fanned out like a ruff, their edges grey. As he dies the mask cracks down its middle (`crack`) and falls in two halves
 * (the painter leaves them to Mob.fall), and under it a drained grey face, the eyes shut.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number, crack: number, hush: number): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0] * 1.02, B.headR[1] * 1.08, B.headR[2] * 1.02];
  const hc = add(s.head, mul(fu, -0.3));
  put('head', 'head', {
    k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])],
    skin: (u, tone) => {
      if (u[0] > 0.8 && Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.46 && u[2] > 0.04 && u[2] < 0.12) return HAND[0];
      return HAND[tone];
    },
  });
  // THE HIGH COLLAR: a fan of black pages standing up behind his head, open in front, their grey edges
  put('collar', 'collar', {
    k: 'ball', c: add(hc, add(mul(ff, -hr[0] * 0.7), mul(fu, -hr[2] * 0.55))), ax: [mul(ff, hr[0] * 1.2), mul(fl, hr[1] * 2.5), mul(fu, hr[2] * 2.3)],
    skin: (u, tone) => {
      if (u[0] > -0.05 || u[2] < -0.1) return null;
      // the pages' edges, radiating from his neck
      const ang = Math.atan2(u[2] + 0.15, u[1]);
      const rim = Math.hypot(u[1], u[2] + 0.15);
      if (rim > 0.9) return EDGE[Math.min(4, tone + 1)];
      if (Math.abs(((ang / Math.PI) * 14) % 1) < 0.14) return EDGE[Math.max(1, tone - 1)];
      return COLLAR[tone];
    },
  });
  // THE HOOD, deep, round the head, open at the face
  put('hood', 'hood', {
    k: 'ball', c: add(hc, add(mul(ff, -0.7), mul(fu, 0.7))), ax: [mul(ff, hr[0] * 1.3), mul(fl, hr[1] * 1.3), mul(fu, hr[2] * 1.24)],
    skin: (u, tone) => (u[0] > 0.3 && Math.abs(u[1]) < 0.8 && u[2] < 0.62 ? null : u[0] > 0.18 && Math.abs(u[1]) < 0.9 && u[2] < 0.72 ? ROBE[Math.min(4, tone + 1)] : ROBE[tone]),
  });
  // THE MASK, in two halves (left and right of the crack), over the face
  const mc = add(hc, mul(ff, hr[0] * 0.42));
  const ax = [mul(ff, hr[0] * 0.9), mul(fl, hr[1] * 1.0), mul(fu, hr[2] * 1.08)] as [V3, V3, V3];
  for (const half of [1, -1]) {
    const skin: Skin = (u, tone) => {
      if (u[0] < 0.05) return null;
      if (u[1] * half < -0.01) return null;
      if (crack > 0 && Math.abs(u[1]) < 0.02 + 0.06 * crack + 0.04 * Math.sin(u[2] * 9) * crack) return INK;
      // the eye slits
      if (Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.54 && u[2] > 0.04 && u[2] < 0.22) return '#18141e';
      // THE BAR OF INK where a mouth would be, its ends ragged; burning pink as he hushes the room
      if (Math.abs(u[1]) < 0.5 - 0.06 * Math.sin(u[2] * 40) && u[2] < -0.3 && u[2] > -0.52 && u[0] > 0.5) return hush > 0.5 ? FLAME[2] : INK;
      return MASK[Math.min(4, tone + 1)];
    };
    put(half > 0 ? 'maskL' : 'maskR', half > 0 ? 'maskL' : 'maskR', { k: 'ball', c: mc, ax, skin });
  }
  for (const k of crack >= 1 ? [] : [-1, 1]) {
    const e = add(mc, add(mul(ff, hr[0] * 0.9 * 0.92), add(mul(fl, k * hr[1] * 0.35), mul(fu, hr[2] * 1.08 * 0.13))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#18141e', facing: ff });
  }
}

/** THE BRUSH: its lacquered shaft banded with brass, the ferrule, the great head of black bristles dripping the Order's ink; their point glinting pink as he readies a stroke. */
function brush(put: Put, s: Skeleton, glint: number, wet: number): void {
  const b = brushOf(s);
  put('shaft', 'brush', { k: 'rod', a: b.butt, b: b.ferrule, ra: 1.05, rb: 1.2, ramp: BAMBOO });
  put('shaft', 'brush', { k: 'ball', c: b.butt, ax: sphere(1.5), skin: LACQUER });
  // the bamboo's knots, and bands of black lacquer
  for (const k of [-8, 4, 16, 28, 38]) put('shaft', 'brush', { k: 'rod', a: add(s.handR, mul(b.way, k)), b: add(s.handR, mul(b.way, k + 1.4)), ra: 1.32, rb: 1.32, ramp: LACQUER });
  put('shaft', 'brush', { k: 'rod', a: b.ferrule, b: b.root, ra: 1.9, rb: 2.4, ramp: BRASS });
  // the bristles: swelling from the ferrule to their belly, drawn to a point
  put('bristles', 'brush', { k: 'rod', a: b.root, b: b.belly, ra: 2.8, rb: 4.4, ramp: BRISTLE });
  put('bristles', 'brush', { k: 'rod', a: b.belly, b: b.tip, ra: 4.4, rb: 0.6, ramp: BRISTLE });
  // ink gleaming wet down them
  if (wet > 0) {
    const side = norm(cross(b.way, [0, 0, 1]), [0, 1, 0]);
    put('bristles', 'brush', { k: 'rod', a: add(lerp3(b.root, b.belly, 0.5), mul(side, 2.2)), b: add(lerp3(b.belly, b.tip, 0.6), mul(side, 1.4)), ra: 0.35, rb: 0.25, ramp: ['#2c2834', '#2c2834', '#4a4456', '#5e586c', '#5e586c'] });
  }
  if (glint > 0.05) put('bristles', 'glint', { k: 'glow', p: b.tip, c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}

/** What a moment of a move says over and above the bones. */
export interface CensorSay {
  /** Whether the brush is in his hands (painted always: as he dies it falls as a piece of its own). */
  brush: (m: Moment) => boolean;
  /** How his left hand is: on the brush's shaft, or open (raised to his mask in the Hush, or hanging). */
  leftOn: (m: Moment) => boolean;
  /** How far his mask has cracked (0 whole, 1 split), as he dies. */
  crack: (m: Moment) => number;
  /** How far his kneeling or lying lifts his robe's hem off his feet (0 standing, 1 down). */
  low: (m: Moment) => number;
  /** The bar on his mask burning pink, as he hushes the room (0 to 1); and his left forefinger raised to it. */
  hush: (m: Moment) => number;
  finger: (m: Moment) => number;
  /** Grains of the moment: the ink flying off the brush, the words going free as he dies. */
  grains?: (m: Moment, out: [V3, string, number][]) => void;
}
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
function censorBits(st: Stage, m: Moment, say: CensorSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [, , cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.4, 3.2);
  for (const side of ['L', 'R'] as const) shoe(put, s, side);
  robe(put, s, lag, m.t * 3, clamp01(say.low(m)));
  chain(put, s, lit);
  const held = say.brush(m);
  arm(put, s, 'L', cu, say.leftOn(m) && held ? 1 : 0.35, lag, say.finger(m));
  arm(put, s, 'R', cu, held ? 1 : 0.4, lag);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.4)), b: lerp3(s.neck, s.head, 0.5), ra: 2.9, rb: 2.7, ramp: ROBE });
  head(put, st, s, lit, clamp01(say.crack(m)), clamp01(say.hush(m)));
  // (the brush is painted even once it is gone from him: as he dies it falls as a piece of its own, Mob.fall)
  brush(put, s, clamp01(m.glint), 1);
  say.grains?.(m, grains);
  return bits;
}

// =============================================================================================
// HIS STAND

/** His rest: tall and upright as a pillar, the great brush held upright in his right hand at his side like a standard, its bristles high over his head; his left hand at his breast; his masked head level, watching. */
const REST0: Bones = {
  ...standing(B),
  pz: -0.3, pitch: 2, bend: 3, roll: 0, side: 0, faceUp: 2, faceTilt: 0, faceTurn: 0,
  lfx: 1.2, lfy: 2.6, lft: 10, lk: 5, rfx: -0.6, rfy: -2.6, rft: -10, rk: -5,
  lhIn: 1, lhx: 10, lhy: -5, lhz: -21,
  rhIn: 1, rhx: 6.5, rhy: -8.5, rhz: -29, wAz: 2, wEl: 87, wRoll: 0,
  pt: 0, out: 0,
} as Bones;
export const CE_REST: Bones = {
  ...REST0,
  le: elbowFor(B, REST0 as Posed, true, norm([-0.3, 0.7, -0.6])),
  re: elbowFor(B, REST0 as Posed, false, norm([-0.3, -0.75, -0.55])),
};

/** His stand: 3.2 s round. Still as a pillar; his masked head turning slowly from one side of the room to the other; once a round the brush dips and rises in his hand. */
export const CE_STAND_LONG = 3.2;
export function censorStand(): Motion {
  const R = CE_REST;
  const T = CE_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    // (the brush lifted a little off the floor and set down, once a round)
    const lift = Math.max(0, Math.sin(a - 0.9)) ** 3;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.7 * breath,
        py: 0.8 * Math.sin(a),
        roll: R.roll + 1.4 * Math.sin(a),
        bend: R.bend - 1.6 * breath,
        faceUp: R.faceUp + 2 * Math.sin(a * 2 + 0.4),
        faceTurn: R.faceTurn + 26 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 4 * Math.sin(a * 2 + 1),
        rhz: R.rhz + 3.0 * lift,
        wEl: R.wEl - 2 * lift,
        lhz: R.lhz + 0.4 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

/** HIM AS THE PAINTER TAKES HIM. */
export function censorPainter(say: CensorSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => censorBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
