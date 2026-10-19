// THE SILENT ORDER'S SCRIBES (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of
// the game imports this file; `SCRIBES_ON` is off. Their moves are art/scribes_moves.ts, what their ink does to the
// floor art/scribe_shots.ts.
//
// His picks for floor 11's monsters, 18 Oct: “Silent Order scribes”, with the Hushed townsfolk, the Hushed watch and
// the mute watch hounds. Then, at 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”. So their brief was settled here, the picks this chat would have
// marked recommended, and he was sent it with their pictures: the city's ranged mob; they flick ink from a great
// quill, the ink flying in an arc to splash where he stands; they glide, stooped over their ledgers; and as they
// die their masks split and fall away, the ledger bursts, and the stolen words fly out of it as loose pages, and
// they topple back. And his words of that afternoon on the act's enemies (“I’d like no not reuse any enemies from the
// previous act”; “So some of the new enemies can be used throughout the next 10 levels.”; “But let’s keep the acts
// separate”): the Order's own, and nothing of Act 1's cult in them (no violet, no bone, no burning skull).
//
// WHO THEY ARE: the Silent Order, the cult's inner circle that came in through the sewers and steals the city's
// words (the planning chat's story, his yes as an idea: "the Silent Order (blank masks, black ink)"). Its scribes
// write down every word it takes. Stooped, slight, the knight's height: a long hooded habit of the Order's black to
// the floor, its sleeves wide and ink-stained, a grey cord at the waist with an inkhorn hanging from it; a BLANK
// WHITE MASK, smooth, no mouth, two thin slits for the eyes and the cult's dull pink in them; ink-stained hands; a
// great black quill in the right hand, a ledger bound in black open on the left arm, chained to the belt, its pages
// written close in black. The enemy's pink edge round them while they live (the painter's). Nothing cyan.

import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const SCRIBES_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: the Order's black, paper, porcelain, ink

/** The Order's habit: black, a little grey where the light falls on it. */
const ROBE: Ramp = ['#0e0d13', '#0e0d13', '#2b2835', '#423e4e', '#423e4e'];
/** Its lining and the inside of the hood, darker still. */
const LINING: Ramp = ['#060509', '#060509', '#14121a', '#1e1b26', '#1e1b26'];
/** The blank mask: white porcelain. */
const MASK: Ramp = ['#5a5660', '#5a5660', '#bcb7c2', '#e4e0e8', '#e4e0e8'];
/** Their hands: pale, drained, the fingertips black with ink. */
const HAND: Ramp = ['#3a3236', '#3a3236', '#8a7c7a', '#b0a29c', '#b0a29c'];
const CORD: Ramp = ['#26242a', '#26242a', '#5c5862', '#7a7680', '#7a7680'];
const HORN: Ramp = ['#1e1610', '#1e1610', '#5a4632', '#7e6648', '#7e6648'];
/** Paper, a little yellowed, as the Crier's scroll. */
const PAPER: Ramp = ['#5a5040', '#5a5040', '#ab9f84', '#c8bc9c', '#d8cdae'];
const COVER: Ramp = ['#0a090c', '#0a090c', '#1e1a20', '#2c2830', '#2c2830'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#464b55', '#6e7480', '#6e7480'];
/** Wet ink: black, with a sheen. */
export const INK_BLACK = '#050408';
export const INK_SHEEN = '#3a3448';

// =============================================================================================
// THE BODY

/** Slight and stooped, the knight's height (58). */
export const SCRIBE_BODY: Build = buildOf(57, 1.26, { shoulders: 0.92, chest: 0.92, depth: 0.96, waist: 0.9, hips: 0.98, arms: 1.0, trunk: 1.0, limbs: 0.9 });
const SB = SCRIBE_BODY;
export const SCRIBE_CANVAS: MobCanvas = { w: 220, h: 210, ax: 110, ay: 160 };

/** The quill: from its nib to the tip of its feather, where the right hand holds it from the nib, and how long its vane is. */
export const QUILL = { long: 24, hold: 3.0, vane: [7, 23.5] } as const;
/** The quill as it is at a moment: its nib, the way it runs from the nib, its tip. */
export function quillOf(s: Skeleton): { nib: V3; way: V3; tip: V3; across: V3 } {
  const way = s.point;
  const nib = add(s.handR, mul(way, -QUILL.hold));
  return { nib, way, tip: add(nib, mul(way, QUILL.long)), across: norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]) };
}

/** Their rest: stooped over the ledger open on the left arm, the quill in the right hand at its page, writing; the head bowed to it. */
export const SCRIBE_REST: Bones = {
  ...standing(SB),
  pz: -0.6, pitch: 8, bend: 14, roll: 0, side: 0, faceUp: -14, faceTilt: -6, faceTurn: 4,
  lfx: 0.4, lfy: 1.0, lft: 10, lk: 6, rfx: -0.4, rfy: -1.0, rft: -10, rk: -6,
  lhIn: 0, lhx: 9, lhy: 1.0, lhz: -15, le: -20,
  rhIn: 0, rhx: 10.5, rhy: -2.6, rhz: -13.5, re: 18,
  wAz: -150, wEl: 52, wRoll: 0,
  pt: 0, out: 0,
} as Bones;

// =============================================================================================
// THEM AS SOLIDS

/** How the figure's going drags what hangs off it. */
function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** A wide black sleeve from the shoulder, flaring past the elbow; a pale, ink-stained hand, its fingers closed (`curl` 1) round the quill or open under the book. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number, lag: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = SB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.3), skin: ROBE, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.3, rb: r1 * 1.4, ramp: ROBE, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.42), skin: ROBE, far: true });
  // (the sleeve flares wide from the elbow, its mouth hanging a little below the wrist)
  const wrist = add(hand, mul(fore, -1.2));
  const mouth = add(lerp3(el, wrist, 0.9), add([0, 0, -1.2], mul(lag, 0.4)));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: mouth, ra: r1 * 1.44, rb: r2 * 2.5, ramp: ROBE, far: true });
  // its lining, seen at its mouth
  put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: lerp3(el, mouth, 0.92), b: add(mouth, mul(fore, 0.3)), ra: r2 * 2.2, rb: r2 * 2.1, ramp: LINING, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.3)), ax: [mul(fore, 1.6), mul(e2, 1.35), mul(e1, 0.8)], skin: HAND, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.32;
    const base = add(hand, add(mul(fore, 1.3), mul(e2, spread * 0.8)));
    const mid = add(base, add(mul(fore, 1.5 * (1 - 0.4 * curl)), mul(e1, -1.0 * curl)));
    const tip = add(mid, add(mul(fore, 1.2 * (1 - 0.8 * curl)), mul(e1, -1.3 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.42, rb: 0.36, ramp: HAND, far: true });
    // (the fingertips black with ink)
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.36, rb: 0.28, ramp: [INK, INK, '#1c1820', '#2a2430', '#2a2430'], far: true });
  }
}

/** A plain black shoe, only its toe out from under the habit. */
function shoe(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.55), mul(up3, 1.3)), ax: [mul(fwd, 4.2), mul(side3, 1.7), mul(up3, 1.4)], skin: LINING, far: true });
  // the shin within the habit, to keep the robe off the foot when a leg is lifted
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.5), b: ankle, ra: SB.legR[2] * 1.1, rb: SB.legR[2] * 1.1, ramp: LINING, far: true });
}

/**
 * THE HABIT: from the cowl round the neck down over the chest and hips to the floor, round both legs, its hem
 * dragging behind as they go. Returns its hem (for the cord's ends and the chain).
 */
function habit(put: Put, s: Skeleton, lag: V3, ph: number, seated: number): { waistC: V3; f: V3; l: V3 } {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], SB.waist * 0.6));
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const spanF = Math.abs(dot(sub(s.ankleL, s.ankleR), f));
  const spanL = Math.abs(dot(sub(s.ankleL, s.ankleR), l));
  // (standing, the hem lies round the feet on the floor; sat or lying, it lies over the shins where they are)
  const hemZ = Math.min(1.8, Math.min(s.ankleL[2], s.ankleR[2]) + 1.0) + seated * 2;
  const hemC: V3 = [footMid[0] * (1 - 0.35 * seated) + kneeMid[0] * 0.35 * seated + lag[0] * 1.2, footMid[1] + lag[1] * 1.2, hemZ];
  const hemDeep = Math.max(SB.pelvisDeep + 3.6, spanF / 2 + 3.4);
  const hemWide = Math.max(SB.pelvisHalf + 3.8, spanL / 2 + 3.2);
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.max(0, Math.sin(ph * 2 + a * 3) * 0.3)], mul(lag, rear * 0.7))));
  }
  const rings: Ring[] = [
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, kneeMid[2]], u: mul(f, (SB.pelvisDeep + 2.8 + hemDeep) / 2), v: mul(l, (SB.pelvisHalf + 3.0 + hemWide) / 2) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.0], u: mul(f, SB.pelvisDeep + 2.6), v: mul(l, SB.pelvisHalf + 2.8) },
    { c: waistC, u: mul(be[0], SB.waistDeep + 1.8), v: mul(be[1], SB.waistHalf + 1.8) },
    { c: s.ribs, u: mul(cf, SB.ribDeep + 1.9), v: mul(cl, SB.ribHalf + 2.0) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, SB.ribDeep + 1.4), v: mul(cl, SB.shoulderHalf + 0.9) },
    // the cowl, loose round the neck
    { c: add(s.neck, mul(cu, 0.2)), u: mul(cf, 4.6), v: mul(cl, 5.0) },
  ];
  put('body', 'habit', { k: 'cloth', rings, ramp: ROBE, look: { folds: [20, -20, 55, -55, 90, -90, 130, -130, 165, -165], lift: 0.05 } });
  // the cord at the waist, its ends hanging at the left
  put('body', 'cord', { k: 'band', ring: { c: waistC, u: mul(be[0], SB.waistDeep + 2.2), v: mul(be[1], SB.waistHalf + 2.2) }, ramp: CORD, rows: 1 });
  const knot = add(waistC, add(mul(be[0], SB.waistDeep * 0.6), mul(be[1], SB.waistHalf + 2.0)));
  for (const k of [0, 1]) {
    // (hanging, or lying on the floor where they have sat down)
    const end = add(knot, add([0, 0, -9 - 2 * k], add(mul(f, 0.6 * k), mul(lag, 1.2))));
    put('body', 'cord', { k: 'rod', a: knot, b: [end[0], end[1], Math.max(1.0, end[2])], ra: 0.55, rb: 0.45, ramp: CORD });
  }
  // ink spattered down its front
  for (let i = 0; i < 5; i++) {
    const p = add(lerp3(s.ribs, waistC, 0.2 + 0.18 * i), add(mul(cf, SB.ribDeep + 2.1 - 0.15 * i), mul(cl, (hash(i, 7, 2401) - 0.5) * 6)));
    put('body', 'ink', { k: 'ball', c: p, ax: [mul(cf, 0.3), mul(cl, 0.7 + hash(i, 8, 2401)), mul(cu, 0.6 + 0.6 * hash(i, 9, 2401))], skin: () => INK_BLACK });
  }
  return { waistC, f, l };
}

/**
 * THE HEAD: in the hood, the BLANK WHITE MASK over the face, smooth, no mouth, two slits for the eyes with the cult's
 * dull pink in them. As they die the mask cracks down the middle (`crack`) and falls away in two halves (the painter
 * leaves them to Mob.fall), and under it a drained face, the eyes shut.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number, crack: number, lag: V3): void {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [SB.headR[0] * 1.0, SB.headR[1] * 1.06, SB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  // the face under the mask (seen only once it has fallen): drained, the eyes shut
  put('head', 'head', {
    k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])],
    skin: (u, tone) => {
      if (u[0] > 0.8 && Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.46 && u[2] > 0.04 && u[2] < 0.12) return HAND[0];
      if (u[0] > 0.9 && Math.abs(u[1]) < 0.12 && u[2] > -0.24 && u[2] < 0.08) return HAND[Math.min(4, tone + 1)];
      if (u[0] > 0.78 && Math.abs(u[1]) < 0.2 && u[2] < -0.42 && u[2] > -0.48) return HAND[0];
      return HAND[tone];
    },
  });
  // THE HOOD: round the head, open at the face, its peak falling back
  put('hood', 'hood', {
    k: 'ball', c: add(hc, add(mul(ff, -0.7), mul(fu, 0.6))), ax: [mul(ff, hr[0] * 1.3), mul(fl, hr[1] * 1.34), mul(fu, hr[2] * 1.22)],
    skin: (u, tone) => (u[0] > 0.28 && Math.abs(u[1]) < 0.8 && u[2] < 0.62 ? null : u[0] > 0.16 && Math.abs(u[1]) < 0.9 && u[2] < 0.72 ? ROBE[Math.min(4, tone + 1)] : ROBE[tone]),
  });
  const peak = add(hc, add(mul(ff, -hr[0] * 1.5), mul(fu, hr[2] * 0.2)));
  put('hood', 'hood', { k: 'rod', a: add(hc, add(mul(ff, -hr[0] * 0.8), mul(fu, hr[2] * 0.5))), b: add(add(peak, [0, 0, -4.5]), mul(lag, 1.0)), ra: hr[1] * 0.8, rb: 0.6, ramp: ROBE });
  // THE MASK, in two halves (left and right of the crack), over the face
  const mc = add(hc, mul(ff, hr[0] * 0.42));
  const ax = [mul(ff, hr[0] * 0.86), mul(fl, hr[1] * 0.98), mul(fu, hr[2] * 1.04)] as [V3, V3, V3];
  for (const half of [1, -1]) {
    const skin: Skin = (u, tone) => {
      if (u[0] < 0.05) return null;
      if (u[1] * half < -0.01) return null;
      // (the crack, a black line down its middle once it has cracked, wider as it goes)
      if (crack > 0 && Math.abs(u[1]) < 0.02 + 0.06 * crack + 0.04 * Math.sin(u[2] * 9) * crack) return INK;
      // the eye slits
      if (Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.52 && u[2] > 0.02 && u[2] < 0.22) return '#18141e';
      // a faint line where a mouth would be, sewn shut
      if (Math.abs(u[1]) < 0.22 && u[2] < -0.42 && u[2] > -0.46 && u[0] > 0.6) return MASK[1];
      return MASK[Math.min(4, tone + 1)];
    };
    put(half > 0 ? 'maskL' : 'maskR', half > 0 ? 'maskL' : 'maskR', { k: 'ball', c: mc, ax, skin });
  }
  // the eyes behind the slits: the cult's dull pink (gone out as they die; none once the mask has split)
  for (const k of crack >= 1 ? [] : [-1, 1]) {
    const e = add(mc, add(mul(ff, hr[0] * 0.86 * 0.92), add(mul(fl, k * hr[1] * 0.98 * 0.34), mul(fu, hr[2] * 1.04 * 0.12))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#18141e', facing: ff });
  }
}

/** THE QUILL: a long black feather, its vane narrow, its nib black with ink; the nib glowing pink as they draw it back to flick (`heat`). */
function quill(put: Put, s: Skeleton, heat: number, lag: V3): void {
  const q = quillOf(s);
  put('shaft', 'quill', { k: 'rod', a: q.nib, b: q.tip, ra: 0.5, rb: 0.3, ramp: ['#5a5662', '#5a5662', '#a8a4b0', '#cfcbd6', '#cfcbd6'] });
  put('nib', 'quill', { k: 'rod', a: add(q.nib, mul(q.way, -0.6)), b: add(q.nib, mul(q.way, 1.6)), ra: 0.25, rb: 0.5, ramp: [INK, INK, '#2a2430', '#3a3444', '#3a3444'] });
  // the vane: two narrow sheets of feather either side of the shaft, curving, swept back by the air
  const [v0, v1] = QUILL.vane;
  const side = norm(cross(q.way, q.across), [0, 0, 1]);
  for (const k of [1, -1]) {
    const mid = add(q.nib, mul(q.way, (v0 + v1) / 2));
    const w = k > 0 ? 1.9 : 1.2;
    put('vane', 'quill', {
      k: 'panel', c: add(add(mid, mul(q.across, k * w)), mul(lag, 0.15)), u: mul(q.across, w), v: mul(q.way, (v1 - v0) / 2),
      skin: (a0, b0, _front, tone) => {
        const a = (a0 / w) * k;
        const b = b0 / ((v1 - v0) / 2);
        // (narrow at the quill's end, widest past its middle, to a point at its tip)
        const width = b < -0.7 ? (b + 1) / 0.3 : b > 0.75 ? (1 - b) / 0.25 : 1;
        if (a > -1 + 2 * width * (0.9 + 0.1 * Math.sin(b * 7))) return null;
        // (barbs: lines across it)
        if (Math.round((b + 1) * 9 + a * 2) % 3 === 0) return '#7a7682';
        return ['#4e4a56', '#4e4a56', '#9a96a2', '#c6c2cc', '#d6d2dc'][tone];
      },
    });
  }
  put('shaft', 'quill', { k: 'rod', a: add(q.nib, mul(q.way, QUILL.vane[0])), b: q.tip, ra: 0.3, rb: 0.15, ramp: ['#6a6672', '#6a6672', '#c8c4ce', '#e6e2ea', '#e6e2ea'] });
  if (heat > 0.05) put('nib', 'glint', { k: 'glow', p: q.nib, c: FLAME[2], r: 3 + 5 * heat, a: 0.65 * heat });
  if (heat > 0.3) put('nib', 'quill', { k: 'mote', p: add(q.nib, mul(q.way, -0.4)), c: FLAME[1 + (heat > 0.7 ? 1 : 0)], size: 2 });
}

/**
 * THE LEDGER, open on the left forearm: its black cover, its two pages of close black writing; chained to the belt.
 * `burst` (as they die): it falls open and its pages tear loose and fly.
 */
function ledger(put: Put, s: Skeleton, waistC: V3, lag: V3): { c: V3; up: V3 } {
  const [cf, cl, cu] = s.chest;
  const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
  // (the book lies along the forearm, its spine along it, tipped up toward the face)
  const spine = norm(add(fore, mul(cu, 0.15)));
  const across = norm(sub(cl, mul(spine, dot(cl, spine))), [0, 1, 0]);
  const up = norm(cross(spine, across), [0, 0, 1]);
  const c = add(add(s.handL, mul(spine, -2.6)), add(mul(up, 1.6), mul(across, -1.4)));
  put('ledger', 'ledger', { k: 'panel', c: add(c, mul(up, -0.5)), u: mul(across, 7.0), v: mul(spine, 5.0), skin: (_a, _b, _f, tone) => COVER[tone] });
  for (const k of [1, -1]) {
    put('ledger', 'ledger', {
      k: 'panel', c: add(add(c, mul(across, k * 3.3)), mul(up, 0.15 + 0.25 * Math.abs(k))), u: mul(across, 3.2), v: mul(spine, 4.6),
      skin: (a, b, _front, tone) => {
        // (written close: lines of black, broken into words)
        const row = Math.floor((b + 4.6) / 1.1);
        const inLine = ((b + 4.6) % 1.1) < 0.45;
        if (Math.abs(a) < 2.6 && Math.abs(b) < 4.0 && inLine && hash(row, Math.floor((a + 3.2) * 1.4), k > 0 ? 2411 : 2412) > 0.3) return '#2a2420';
        return PAPER[Math.max(2, tone)];
      },
    });
  }
  // the chain from its spine down to the belt
  const from = add(c, add(mul(spine, -5.0), mul(up, -0.4)));
  const to = add(waistC, add(mul(cf, SB.waistDeep * 0.8), mul(cl, SB.waistHalf * 0.6)));
  const sag = add(lerp3(from, to, 0.5), add([0, 0, -3], mul(lag, 0.6)));
  for (let i = 0; i < 6; i++) {
    const u0 = i / 6;
    const u1 = (i + 1) / 6;
    const pt = (u: number): V3 => add(mul(lerp3(from, sag, u), 1 - u), mul(lerp3(sag, to, u), u));
    put('chain', 'chain', { k: 'rod', a: pt(u0), b: pt(u1), ra: 0.35, rb: 0.35, ramp: IRON });
  }
  return { c, up };
}

/** The inkhorn hanging at the right hip on a cord. */
function inkhorn(put: Put, s: Skeleton, waistC: V3, lag: V3): void {
  const [cf, cl] = s.chest;
  const top = add(waistC, add(mul(cf, SB.waistDeep * 0.5), mul(cl, -(SB.waistHalf + 2.0))));
  const hang = add(top, add([0, 0, -4.2], mul(lag, 0.8)));
  put('inkhorn', 'inkhorn', { k: 'rod', a: top, b: hang, ra: 0.3, rb: 0.3, ramp: CORD });
  put('inkhorn', 'inkhorn', { k: 'rod', a: add(hang, [0, 0, 0.6]), b: add(hang, add([0, 0, -3.6], mul(cf, 1.0))), ra: 1.5, rb: 0.6, ramp: HORN });
  put('inkhorn', 'inkhorn', { k: 'ball', c: add(hang, [0, 0, 0.6]), ax: [[1.5, 0, 0], [0, 1.5, 0], [0, 0, 0.5]], skin: () => INK_BLACK });
}

/** What a moment says of them as they die: how far the mask has cracked (0 whole, 1 split). */
export interface ScribeSay {
  crack: (t: number) => number;
}
/** When the ledger bursts and its pages tear loose and fly, as they die (seconds). */
export const SCRIBE_BURST = 0.3;
/** As they die: the pages torn loose from the ledger, each flying up and away, tumbling and fluttering. */
export const SCRIBE_PAGES = 14;
function loosePages(put: Put, from: V3, t: number, seed: number): void {
  for (let i = 0; i < SCRIBE_PAGES; i++) {
    const born = 0.18 * hash(i, seed, 2421);
    const age = t - born;
    if (age <= 0 || age > 1.6) continue;
    const a = hash(i, seed + 1, 2421) * Math.PI * 2;
    const out = (8 + 22 * hash(i, seed + 2, 2421)) * (1 - Math.exp(-age * 2.4));
    const rise = 10 + 30 * hash(i, seed + 3, 2421);
    // (up fast, slowing, then drifting down, fluttering side to side)
    const z = rise * (1 - Math.exp(-age * 3)) - 6 * age * age + 2 * Math.sin(age * 9 + i);
    const p0 = add(from, [Math.cos(a) * out + 1.6 * Math.sin(age * 7 + i), Math.sin(a) * out, z]);
    const onFloor = p0[2] < 3.2;
    const p: V3 = onFloor ? [p0[0], p0[1], 1.4] : p0;
    const spin = age * (5 + 6 * hash(i, seed + 4, 2421)) + i;
    let u: V3 = [Math.cos(spin) * 1.9, Math.sin(spin) * 1.9, Math.sin(spin * 0.7) * 0.9];
    let v: V3 = norm(cross(u, [Math.sin(spin * 1.3), Math.cos(spin * 1.1), 0.6]), [0, 0, 1]);
    // (one that has come down to the floor lies flat on it)
    if (onFloor) {
      u = [Math.cos(i * 2.1) * 1.9, Math.sin(i * 2.1) * 1.9, 0];
      v = [-Math.sin(i * 2.1), Math.cos(i * 2.1), 0];
    }
    const fade = age > 1.2 ? 1 - (age - 1.2) / 0.4 : 1;
    if (hash(i, Math.floor(t * 30), 2423) > fade) continue;
    put('pages', 'pages', { k: 'panel', c: p, u, v: mul(v, 2.4), skin: (aa, bb, _f, tone) => (Math.abs(bb) < 2.0 && Math.abs(aa) < 1.5 && ((bb + 2.4) % 0.9) < 0.35 ? '#3a3228' : PAPER[Math.max(2, tone)]) });
  }
}

/** THE SCRIBE AS SOLIDS: the habit, the hood and the blank mask, the wide sleeves and the ink-stained hands; the quill, the ledger and its chain, the inkhorn; as they die, the cracked mask and the pages flying. */
function scribeBits(st: Stage, m: Moment, say: ScribeSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const cu = s.chest[2];
  const lit = 1 - clamp01(q.out);
  const ph = m.wind * Math.PI * 2;
  const lag = lagOf(m, 1.6, 3.2);
  const seated = clamp01((22 - s.pelvis[2]) / 14);
  for (const side of ['L', 'R'] as const) shoe(put, s, side);
  const { waistC } = habit(put, s, lag, ph, seated);
  inkhorn(put, s, waistC, lag);
  const book = ledger(put, s, waistC, lag);
  arm(put, s, 'L', cu, 0.35, lag);
  arm(put, s, 'R', cu, m.bare ? 0.4 : 0.85, lag);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.2)), b: lerp3(s.neck, s.head, 0.5), ra: 2.0, rb: 1.8, ramp: HAND });
  head(put, st, s, lit, m.dying ? clamp01(say.crack(m.t)) : 0, lag);
  if (!m.bare) quill(put, s, clamp01(m.glint), lag);
  if (m.dying && m.t > SCRIBE_BURST) loosePages(put, add(book.c, mul(book.up, 1.5)), m.t - SCRIBE_BURST, 3);
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their stand: 3.0 s round. Stooped over the ledger, writing: the quill scratching across the page in short runs, the head following it; a pause, the head lifting and cocking as if listening; writing again. */
export const SCRIBE_STAND_LONG = 3.0;
export function scribeStand(): Motion {
  const R = SCRIBE_REST;
  const T = SCRIBE_STAND_LONG;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const u = t / T;
    const a = u * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    // (writing for the first two thirds of the round, a line at a time; listening for the last third)
    const writing = u < 0.66;
    const line = writing ? fr(u * 4.5) : 0;
    const scratch = writing ? Math.sin(t * 38) * 0.35 : 0;
    const listen = writing ? 0 : Math.sin(((u - 0.66) / 0.34) * Math.PI);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.8 * breath,
        py: 0.9 * Math.sin(a),
        roll: R.roll + 1.6 * Math.sin(a),
        bend: R.bend - 2.2 * breath - 5 * listen,
        pitch: R.pitch - 2 * listen,
        faceUp: R.faceUp + 20 * listen + (writing ? -2 * line : 0),
        faceTilt: R.faceTilt + 16 * listen,
        faceTurn: R.faceTurn + (writing ? 8 * (line - 0.5) : -14 * listen),
        rhx: R.rhx + (writing ? 1.4 * (line - 0.5) : -1.2 * listen),
        rhy: R.rhy + (writing ? 3.0 * (line - 0.5) : 0) + scratch,
        rhz: R.rhz + (writing ? 0.3 * Math.sin(t * 25) : 1.6 * listen),
        lhz: R.lhz + 0.4 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

/** THE SCRIBES AS THE PAINTER TAKES THEM. */
export function scribePainter(say: ScribeSay): { bits: (st: Stage, m: Moment) => Bit[] } {
  return { bits: (st, m) => scribeBits(st, m, say) };
}
