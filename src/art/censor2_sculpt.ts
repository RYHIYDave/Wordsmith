// FLOOR 15'S BOSS, THE CENSOR, MADE AGAIN (docs/mockups/censor_redo/README.md has every word of his). His words, 14 Nov 2026, asked
// whether floors 5, 15 and 20's bosses were up to the Drowned Eye: “Do you think the other main bosses (5, 15, and 20) are up to par?”;
// told the Censor was furthest behind (a black robe barely taller than the hero, lost in the dark library, his moves shapes on the
// floor), asked which first, his pick: “The Censor first (Recommended)”. Behind CENSOR2 (game/act1_rules/censor.ts), off until his yes.
//
// HIS STORY, as his doc has it (“Wordsmith Act 2: The Hush”, level 15): “The leader of the Silent Order, robed in black, with a great ink
// brush. Whatever he strikes through is gone.” His moves stay his: the brush slash, Strike-Through, Redaction, the Hush, the floor
// blacked out at half his life; “when he falls, the book bursts and the words fly home”.
//
// HIS NEW LOOK, sculpted as the game's newest figures are (dev/sculpt.ts: solids melted into each other, lit and inked as the style
// asks): TALL, about twice the knight's height (not gargantuan: the fight is what matters, his word below); gaunt
// and upright as a pillar; he GLIDES, his robe to the floor and dragging (no feet: nothing to slide). HIS ROBE the Order's black with a
// cold sheen, flaring wide to its hem, folded, down its front a page of grey writing struck through with black bars; a sash; HIS CHAIN
// OF OFFICE across his chest, its lock hanging, its keyhole burning the enemy's pink. HIS HEAD: a tall peaked hood drooping back; the
// Order's blank mask, bone-white, its eye slits burning pink, a bar of black ink painted across where a mouth would be; behind it A
// GREAT RUFF OF PAGES fanned out like a peacock's tail, black, their edges grey and written on (it spreads as he readies a move). Long
// bell sleeves; long grey fingers black with ink to the second joint. THE GREAT INK BRUSH, as long as he is tall: a shaft of pale bamboo
// banded in black lacquer, a brass ferrule, a fat head of black bristles, its wet point burning pink to gold. What is his alone, at a
// glance: the white mask and its ink bar against the ruff of pages; the brush; the struck-out words that circle him (art/censor2_art.ts).
// Nothing cyan; no violet (Act 2's own, his word of 18 Oct).

import type { Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import type { PaintView } from './skin';
import { add, cross, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';
import { Sculpt, draw, onCone } from '../dev/sculpt';
import type { Cone, Drawn, Hit, Mat } from '../dev/sculpt';

const D = Math.PI / 180;
const shadeOf = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, k))];
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const hash = (a: number, b: number, s: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

/** His canvas: room for the brush raised high over his head, and swept out to either side. */
export const CENSOR2_CANVAS = { w: 440, h: 470, ax: 220, ay: 380 } as const;
/**
 * His size: his own lengths made this many times as big: about twice the knight. (First drawn three times the knight; his word,
 * 14 Nov 2026: “so the bosses dont need to be gargantuan, i just want the fights to be up to par as a lynchpin of the 5 levels”.)
 */
export const CS = 1.0;

// HIS COLOURS: the Order's black, a cold sheen on it; grey writing struck out in black; bone-white; bamboo; brass; iron
const ROBE: Ramp = ['#08080c', '#14141c', '#252532', '#3c3c50', '#5c5c76'];
/** His stoles: two long strips of parchment hung from his neck to his hem, written on and struck through. */
const STOLE: Ramp = ['#4a4436', '#7a7058', '#a89c7e', '#cfc3a2', '#ece2c4'];
const LINING: Ramp = ['#050508', '#0b0b10', '#15151c', '#20202a', '#2c2c38'];
const PAGE: Ramp = ['#0e0e14', '#1e1e28', '#32323e', '#4a4a58', '#686876'];
const EDGE: Ramp = ['#3a3842', '#55525e', '#7a7682', '#a29eaa', '#c8c4ce'];
const MASK: Ramp = ['#4e4a52', '#8a8590', '#c4bfc8', '#e8e4ec', '#faf8fc'];
const HAND: Ramp = ['#26242a', '#3c3a42', '#5e5a62', '#7a767e', '#96929a'];
const BAMBOO: Ramp = ['#4a4232', '#746a4e', '#a29470', '#c6b890', '#e2d6b0'];
const BRASS: Ramp = ['#3a2a10', '#6a4e1c', '#9c7a30', '#c8a24a', '#ecd078'];
const IRON: Ramp = ['#121218', '#24242e', '#3c3c4a', '#5e5e70', '#8a8aa0'];
const BRISTLE: Ramp = ['#030305', '#08080c', '#121218', '#1e1e28', '#2e2e3a'];
const EYE: Ramp = ['#7a1030', '#c0206a', '#ff3a78', '#ffb070', '#fff0c0'];
export const INK2 = '#040406';
const WRITING = '#6a6874';

/** A frame for the figure: forward, to its left, up, built facing the eye's lower right turned by `yaw` degrees. */
function frame(yaw: number): { F: V3; L: V3; U: V3; P: (f: number, l: number, u: number) => V3; X: (rf: number, rl: number, ru: number) => readonly [V3, V3, V3] } {
  const F0 = norm([1, -1, 0]);
  const L0 = norm([1, 1, 0]);
  const a = yaw * D;
  const F = add(mul(F0, Math.cos(a)), mul(L0, Math.sin(a)));
  const L = add(mul(F0, -Math.sin(a)), mul(L0, Math.cos(a)));
  const U: V3 = [0, 0, 1];
  const P = (f: number, l: number, u: number): V3 => add(add(mul(F, f), mul(L, l)), mul(U, u));
  const X = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => [mul(F, rf), mul(L, rl), mul(U, ru)];
  return { F, L, U, P, X };
}

/** Every solid made `k` times as big, about the floor point under him. */
function grow(sc: Sculpt, k: number): void {
  const m = (v: V3): V3 => mul(v, k);
  for (const pr of sc.prims as unknown as Record<string, unknown>[]) {
    for (const key of ['a', 'b', 'c'] as const) if (Array.isArray(pr[key]) && typeof (pr[key] as unknown[])[0] === 'number') pr[key] = m(pr[key] as unknown as V3);
    if (pr.axes) pr.axes = (pr.axes as V3[]).map(m);
    for (const key of ['ra', 'rb', 'blend', 'round', 'thick'] as const) if (typeof pr[key] === 'number') pr[key] = (pr[key] as number) * k;
    if (pr.cuts) pr.cuts = (pr.cuts as { n: V3; o: number }[]).map((q) => ({ n: q.n, o: q.o * k }));
  }
}

/**
 * HOW HE STANDS (art/censor2_moves.ts sets it a moment at a time). Lengths his own, before he is grown (CS): `f` forward, `l` to his
 * left, `u` up, from the floor under him.
 */
export interface CensorPose {
  /** His chest's rise, 0 to 1. */
  breath: number;
  /** Where his body has gone from where it stands (risen off the floor is up: his hem lifts with him). */
  hip: V3;
  /** His body pitched forward from the waist, degrees (back, less than 0). */
  lean: number;
  /** His body turned to his left from the waist, degrees. */
  twist: number;
  /** His head thrown back, degrees; turned to his left, degrees. */
  headUp: number;
  headTurn: number;
  /** His right hand (round the brush), and his left: where each is, as he stands (they go with `hip`). */
  handR: V3;
  handL: V3;
  /** Which way the brush's head is from his hand: a point it points at (it goes with `hip`). */
  brushAt: V3;
  /** Where along the brush his right hand holds it, from its butt (0 to 1). */
  grip: number;
  /** His left hand on the brush too, `twoHand` along from the right toward the head (0: not on it). */
  twoHand: number;
  /** His left forefinger raised (to the ink bar of his mouth: the Hush), 0 to 1. */
  finger: number;
  /** How far his hem and sleeves have been left behind by his going (LOOSE THINGS FOLLOW), his own lengths. */
  swing: V3;
  /** His hem flared out (risen, or spun), 0 to 1. */
  flare: number;
  /** His ruff of pages spread wide, 0 (folded) to 1. */
  ruff: number;
  /** All of him turned about the floor point under him, degrees to his left. */
  turn?: number;
  /** (his death) His mask cracked, 0 to 1; his robe gone slack and down, empty, 0 to 1. */
  crack?: number;
  slump?: number;
  /** No edge of light (a dying thing has none). */
  rimless?: boolean;
  /** (his death) The brush let go of and fallen to the floor, 0 (in his hand) to 1 (lying there). */
  dropped?: number;
}

/** HIM STANDING: the brush in his right hand resting low, its point by his feet, dripping (Monsters 5: weapons rest low); his left hand at his side, half open. */
export const CENSOR_STAND: CensorPose = {
  breath: 0,
  hip: [0, 0, 0],
  lean: 0,
  twist: 0,
  headUp: 0,
  headTurn: 0,
  handR: [13, -27, 56],
  handL: [6, 21, 42],
  brushAt: [30, -33, -6],
  grip: 0.36,
  twoHand: 0,
  finger: 0,
  swing: [0, 0, 0],
  flare: 0,
  ruff: 0.35,
};

/** THE BRUSH'S LENGTH, butt to the point of its bristles (as long as he is tall). */
export const BRUSH_LONG = 118;
/** Its bristles' length, from the ferrule to their point. */
export const BRISTLES = 26;

/** A joint between two ends `a` and `b` of limbs `la` and `lb` long, bent toward `hint`. */
function bend(a: V3, b: V3, la: number, lb: number, hint: V3): V3 {
  const ab = sub(b, a);
  let d = Math.hypot(...ab);
  const dir = mul(ab, 1 / (d || 1));
  d = Math.min(d, la + lb - 0.5);
  const x = (la * la - lb * lb + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, la * la - x * x));
  const along = dot3(hint, dir);
  const perp = norm(sub(hint, mul(dir, along)));
  return add(add(a, mul(dir, x)), mul(perp, h));
}

/** The brush, as he holds it at `Q`: its butt, its axis, where the ferrule and the bristles begin, its point (his own lengths). */
export function brushOf(Q: CensorPose): { butt: V3; axis: V3; ferrule: V3; base: V3; tip: V3 } {
  const hand = add(Q.handR, Q.hip);
  let axis = norm(sub(add(Q.brushAt, Q.hip), hand));
  let butt = sub(hand, mul(axis, BRUSH_LONG * Q.grip));
  const k = Math.min(1, Math.max(0, Q.dropped ?? 0));
  if (k > 0) {
    // (falling from his hand, tumbling flat onto the floor before him)
    const g = k * k;
    const tip0 = add(butt, mul(axis, BRUSH_LONG));
    const lieB: V3 = [26, -58, 2.4];
    const lieT: V3 = [26 + BRUSH_LONG * 0.94, -58 + BRUSH_LONG * 0.34, 2.4];
    butt = add(mul(butt, 1 - g), mul(lieB, g));
    const tip = add(mul(tip0, 1 - g), mul(lieT, g));
    axis = norm(sub(tip, butt));
  }
  const at = (d: number): V3 => add(butt, mul(axis, d));
  return { butt, axis, ferrule: at(BRUSH_LONG - BRISTLES - 8), base: at(BRUSH_LONG - BRISTLES), tip: at(BRUSH_LONG) };
}

/** THE CENSOR as he stands at `pose`, seen `view`, turned `yaw`; on a canvas of `size`. */
export function sculptCensor2(view: PaintView, pose: Partial<CensorPose> = {}, yaw = 45, size: { w: number; h: number; ax: number; ay: number } = CENSOR2_CANVAS): Drawn {
  const Q: CensorPose = { ...CENSOR_STAND, ...pose };
  const sc = new Sculpt();
  const { F, L, U, P, X } = frame(yaw + (Q.turn ?? 0));
  const b = Q.breath * 1.0;
  const slump = Q.slump ?? 0;
  const crack = Q.crack ?? 0;
  // (his body's turn about his waist; his head's about his neck)
  const PIV: V3 = [0, 0, 50];
  const NECK: V3 = [1, 0, 92];
  const cl = Math.cos(Q.lean * D);
  const sl = Math.sin(Q.lean * D);
  const ct = Math.cos(Q.twist * D);
  const st = Math.sin(Q.twist * D);
  const ch = Math.cos(-Q.headUp * D);
  const sh = Math.sin(-Q.headUp * D);
  const cy = Math.cos(Q.headTurn * D);
  const sy = Math.sin(Q.headTurn * D);
  const rot = (q: V3): V3 => {
    const f1 = q[0] * cl + q[2] * sl;
    const u1 = -q[0] * sl + q[2] * cl;
    return [f1 * ct - q[1] * st, f1 * st + q[1] * ct, u1];
  };
  const unrot = (q: V3): V3 => {
    const f1 = q[0] * ct + q[1] * st;
    const l1 = -q[0] * st + q[1] * ct;
    return [f1 * cl - q[2] * sl, l1, f1 * sl + q[2] * cl];
  };
  const headRot = (q: V3): V3 => {
    const p: V3 = [q[0] * ch + q[2] * sh, q[1], -q[0] * sh + q[2] * ch];
    return [p[0] * cy - p[1] * sy, p[0] * sy + p[1] * cy, p[2]];
  };
  const headUnrot = (q: V3): V3 => {
    const p: V3 = [q[0] * cy + q[1] * sy, -q[0] * sy + q[1] * cy, q[2]];
    return [p[0] * ch - p[2] * sh, p[1], p[0] * sh + p[2] * ch];
  };
  // (as he slumps in death his body sinks into his robe, which settles empty on the floor)
  const sink: V3 = [0, 0, -slump * 62];
  const T = (q: V3): V3 => add(add(add(rot(sub(q, PIV)), PIV), Q.hip), sink);
  const H = (q: V3): V3 => T(add(headRot(sub(q, NECK)), NECK));
  const W = (q: V3): V3 => P(q[0], q[1], q[2]);
  const TP = (f: number, l: number, u: number): V3 => W(T([f, l, u]));
  const HP = (f: number, l: number, u: number): V3 => W(H([f, l, u]));
  const axes = (r: (q: V3) => V3, rf: number, rl: number, ru: number): readonly [V3, V3, V3] => {
    const [a, c, e] = [r([1, 0, 0]), r([0, 1, 0]), r([0, 0, 1])];
    return [mul(W(a), rf), mul(W(c), rl), mul(W(e), ru)];
  };
  const TX = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => axes(rot, rf, rl, ru);
  const HX = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => axes((q) => rot(headRot(q)), rf, rl, ru);
  const loc = (p: V3): V3 => [dot3(p, F) / CS, dot3(p, L) / CS, p[2] / CS];
  const onBody = (p: V3): V3 => add(unrot(sub(sub(sub(loc(p), Q.hip), sink), PIV)), PIV);
  const onHead = (p: V3): V3 => add(headUnrot(sub(onBody(p), NECK)), NECK);
  const mat = (m: Mat): number => sc.mat(m);

  // HIS ROBE: the Order's black with a cold sheen; down its front a page of grey writing, every few lines struck through with a bar
  const writing = (f: number, l: number, u: number, front: number): string | null => {
    if (f < front) return null;
    const row = Math.floor(u / 3.2);
    const y = u - row * 3.2;
    if (y > 0.9) return null;
    const x = l + 30;
    // (a word: a run of grey; a struck line: one black bar over a long run)
    const struck = hash(row, Math.floor(x / 14), 7) < 0.34;
    if (struck) return INK2;
    return hash(row, Math.floor(x / 2.2), 9) < 0.62 && Math.floor(x / 9) % 4 !== 3 ? WRITING : null;
  };
  const robe = mat({
    ramp: ROBE,
    paint: (h) => {
      const [f, l, u] = onBody(h.p);
      if (h.prim.tag === 'skirt' && Math.abs(l) < 13 - u * 0.04 && u > 6 && u < 46) return writing(f, l, u, 8);
      if (h.prim.tag === 'chest' && Math.abs(l) < 8 && u > 60 && u < 78) return writing(f, l, u, 6);
      // (its folds' sheen: a cold light down each ridge)
      if (h.prim.tag === 'fold' && h.tone >= 3) return shadeOf(ROBE, 4);
      return null;
    },
  });
  const lining = mat({ ramp: LINING });
  const stole = mat({
    ramp: STOLE,
    paint: (h) => {
      const [, l, u] = onBody(h.p);
      // (writing across it in grey-brown; every other line struck out in a black bar)
      const row = Math.floor(u / 1.7);
      if (u - row * 1.7 > 0.55) return null;
      if (hash(row, l > 0 ? 1 : 2, 17) < 0.3) return INK2;
      return hash(row, Math.floor((l + 20) * 2.2), 19) < 0.55 ? shadeOf(STOLE, 1) : null;
    },
  });
  const page = mat({
    ramp: PAGE,
    paint: (h) => {
      // (the pages of his ruff: black, their edges grey; grey writing across them)
      const t = (h.prim as { tag?: string }).tag;
      if (t !== 'page') return null;
      const [, , u] = onHead(h.p);
      const [, , u0] = [0, 0, 90];
      const d = Math.hypot(...sub(onHead(h.p), [-6, 0, u0])) / (36 + 12 * Q.ruff);
      void u;
      if (d > 0.82) return shadeOf(EDGE, h.tone);
      if (d > 0.3 && Math.floor(d * 14) % 2 === 0 && hash(Math.floor(h.x / 2), Math.floor(h.y / 3), 11) < 0.55) return WRITING;
      return null;
    },
  });
  const mask = mat({
    ramp: MASK,
    paint: (h) => {
      const [f, l, u] = onHead(h.p);
      // (his eye slits, burning pink; the ink bar across where a mouth would be; the cracks of his death)
      if (f > 6 && u > 101.4 && u < 103.6 && Math.abs(Math.abs(l) - 3.6) < 2.3 - (u - 101.4) * 0.3) return u > 102.4 ? EYE[4] : EYE[2];
      if (f > 6 && u > 93.4 && u < 96.8 && Math.abs(l) < 6.2 + (hash(Math.floor(u * 3), 0, 13) - 0.5) * 1.4) return INK2;
      if (crack > 0) {
        for (let k = 0; k < 4; k++) {
          const a0 = k * 1.7 + 0.4;
          const along = (u - 98) * Math.cos(a0) + l * Math.sin(a0);
          const across = -(u - 98) * Math.sin(a0) + l * Math.cos(a0);
          const wob = Math.sin(along * 1.9 + k) * 0.6;
          if (along > 0 && along < crack * 12 && Math.abs(across - wob) < 0.35) return crack > 0.7 ? EYE[3] : INK2;
        }
      }
      return null;
    },
  });
  const hand = mat({
    ramp: HAND,
    paint: (h) => (h.prim.tag === 'inked' ? shadeOf(BRISTLE, h.tone + 1) : null),
  });
  const bamboo = mat({
    ramp: BAMBOO,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const { t } = onCone(h.prim as Cone, h.p, U);
      // (black lacquer bands, and the bamboo's nodes)
      for (const c of [0.06, 0.32, 0.58, 0.84]) if (Math.abs(t - c) < 0.035) return shadeOf(BRISTLE, h.tone + 1);
      for (const c of [0.19, 0.45, 0.71]) if (Math.abs(t - c) < 0.008) return shadeOf(BAMBOO, h.tone - 1);
      return null;
    },
  });
  const brass = mat({ ramp: BRASS });
  const iron = mat({ ramp: IRON });
  const bristle = mat({
    ramp: BRISTLE,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const { t, around } = onCone(h.prim as Cone, h.p, U);
      // (its wet point burning the enemy's pink to gold; streaks of wet ink down the bristles)
      if (t > 0.78) return t > 0.92 ? EYE[4] : t > 0.86 ? EYE[3] : EYE[2];
      if (t > 0.62 && Math.floor(around * 5) % 2 === 0) return EYE[1];
      return Math.floor(around * 7) % 3 === 0 ? shadeOf(BRISTLE, h.tone + 1) : null;
    },
  });
  const glow = mat({ ramp: EYE, paint: (h) => (h.tone >= 2 ? EYE[4] : EYE[2]) });

  // HIS ROBE'S SKIRT, down to the floor and dragging, flaring wide to its hem; left behind as he glides (`swing`)
  const fl = 1 + 0.45 * Q.flare;
  const rise = Math.max(0, Q.hip[2]);
  const ring = (u: number, rf: number, rl: number, ru: number, k: number): void => {
    const lag = mul(Q.swing, k);
    sc.ell(robe, 'robe', W(add(add([Q.hip[0] * (1 - k * 0.15), Q.hip[1], u + rise * (0.6 + 0.4 * (u / 50)) - slump * 6 * (1 - u / 50)], lag), mul(sink, u / 52))), X(rf, rl, ru), 4.0, { tag: 'skirt' });
  };
  ring(5, 24 * fl * (1 + slump * 0.3), 28 * fl * (1 + slump * 0.3), 6, 1);
  ring(16, 20.5 * (1 + (fl - 1) * 0.7), 24 * (1 + (fl - 1) * 0.7), 10, 0.75);
  ring(30, 16, 19.5, 12, 0.45);
  ring(44, 12.5, 15.5, 10, 0.15);
  // (its folds: ridges down from the waist to the hem, spread as it flares)
  for (let i = 0; i < 16; i++) {
    const a = ((i + 0.5) / 16) * 360 * D;
    const top: V3 = [Math.cos(a) * 12, Math.sin(a) * 15, 46];
    const bot: V3 = [Math.cos(a) * 24.5 * fl, Math.sin(a) * 28.5 * fl, 2 + hash(i, 1, 21) * 2];
    const lagT: V3 = add(add(top, [Q.hip[0], Q.hip[1], rise]), mul(Q.swing, 0.15));
    const lagB: V3 = add(add(bot, [Q.hip[0] * 0.85, Q.hip[1], rise * 0.6 - slump * 3]), Q.swing);
    sc.cone(robe, 'robe', W(add(lagT, mul(sink, 0.9))), W(add(lagB, mul(sink, 0.05))), 1.6, 3.4, 2.2, { tag: 'fold' });
  }
  // (the hem's lining, dark, where it turns under)
  sc.ell(lining, 'hem', W(add(add([Q.hip[0], Q.hip[1], 1.2 + rise * 0.6 - slump * 4], Q.swing), mul(sink, 0.05))), X(24.4 * fl, 28.4 * fl, 1.6), 1.0);
  // HIS BODY: gaunt and upright; a sash at his waist; his chest; his shoulders broad and bony under the robe
  sc.ell(robe, 'body', TP(0, 0, 52), TX(11, 14, 6), 3.0, { tag: 'skirt' });
  sc.ell(lining, 'sash', TP(0.4, 0, 54), TX(11.6, 14.6, 2.2), 0.6);
  sc.ell(robe, 'body', TP(1, 0, 68 + b * 0.6), TX(10.5, 15, 14), 3.4, { tag: 'chest' });
  sc.ell(robe, 'body', TP(-1, 0, 82 + b), TX(9.5, 20, 7), 3.4);
  for (const s of [1, -1]) sc.ell(robe, 'body', TP(-0.5, s * 20, 84 + b), TX(7.5, 7, 6.5), 2.6);
  // HIS CHAIN OF OFFICE: iron links over his shoulders and across his chest, its lock hanging, its keyhole burning
  for (let i = 0; i < 13; i++) {
    const a = ((i - 6) / 6) * 70 * D;
    const at: V3 = [10.8 * Math.cos(a) + 0.4, 18 * Math.sin(a), 84 + b - 12 * Math.cos(a) * Math.cos(a)];
    sc.ell(iron, 'chain', TP(...at), TX(1.3, 1.6, 1.3), 0.3);
  }
  // HIS STOLES: two long strips of parchment hung from his neck down his front to his hem, written on and struck through; they lag
  // behind as he goes
  for (const s of [1, -1]) {
    const pts: V3[] = [];
    for (let k = 0; k <= 9; k++) {
      const u = 86 - k * 9.2;
      const k01 = k / 9;
      // (down his chest, then out over the swell of the skirt to its hem)
      const f = u > 50 ? 9.6 + (86 - u) * 0.06 : 11.6 + (50 - u) * 0.27 * fl;
      const body = u > 50 ? T([f, s * 4.6, u + b * (u > 60 ? 1 : 0)]) : add([f, s * (4.6 + (50 - u) * 0.12), u + rise * 0.7], add([Q.hip[0], Q.hip[1], 0], mul(Q.swing, k01)));
      pts.push(body);
    }
    for (let k = 1; k < pts.length; k++) {
      // (a flat strip: as wide as a hand, as thin as paper, lying on him)
      const a0 = W(pts[k - 1]);
      const a1 = W(pts[k]);
      const along = sub(a1, a0);
      const half = Math.hypot(...along) / 2 + 0.6;
      const dirS = norm(along);
      const sideS = norm(W(rot([0, 1, 0])));
      const nrm = norm(cross(dirS, sideS));
      sc.box(stole, `stole${s > 0 ? 'L' : 'R'}`, mul(add(a0, a1), 0.5), [mul(dirS, half), mul(norm(cross(nrm, dirS)), 3.0 + k * 0.1), mul(nrm, 0.55)], 0.3, 0.6, { tag: 'stole' });
    }
  }
  const lockAt: V3 = [12.4 + Math.max(0, Q.swing[0]) * 0.1, 0, 68 + b];
  sc.box(iron, 'lock', TP(...lockAt), TX(1.6, 3.6, 3.4), 0.8, 0.3);
  sc.cone(iron, 'lock', TP(lockAt[0] - 0.2, -2.4, lockAt[2] + 3), TP(lockAt[0] - 0.2, 2.4, lockAt[2] + 3), 0.7, 0.7, 0.2);
  sc.ell(glow, 'keyhole', TP(lockAt[0] + 1.6, 0, lockAt[2] - 0.2), TX(0.5, 0.8, 1.4), 0.1);
  // HIS ARMS: long bell sleeves, to long grey hands black with ink to the second joint
  const shoulder = (s: number): V3 => T([-0.5, s * 21.5, 85 + b]);
  const armTo = (s: number, wrist: V3, hint: V3): { elbow: V3; wrist: V3 } => {
    const top = shoulder(s);
    const elbow = bend(top, wrist, 21, 20, hint);
    const piece = s > 0 ? 'armL' : 'armR';
    sc.cone(robe, piece, W(top), W(elbow), 4.8, 4.4, 1.2);
    // (the bell of the sleeve, wide at the wrist and hanging below it in a drape; left behind by his going)
    const fa = norm(sub(wrist, elbow));
    const mouth = add(sub(wrist, mul(fa, 1.5)), [Q.swing[0] * 0.3, Q.swing[1] * 0.3, -1.5]);
    sc.cone(robe, piece, W(elbow), W(mouth), 4.4, 7.6, 1.2);
    const drop = add(add(mouth, [Q.swing[0] * 0.5, Q.swing[1] * 0.5, -9]), mul(fa, -2));
    sc.cone(robe, piece, W(add(mouth, [0, 0, -2])), W(drop), 6.4, 2.4, 2.6, { tag: 'fold' });
    sc.ell(lining, piece, W(add(mouth, mul(fa, 0.6))), X(5.6, 5.6, 5.6), 0.8);
    return { elbow, wrist };
  };
  /** A hand: its palm, four long fingers, a thumb; curled round `around` if given (the brush), else open, or its forefinger up. */
  const handAt = (piece: string, wrist: V3, dir: V3, side: V3, curl: number, fingerUp: number): void => {
    const palm = add(wrist, mul(dir, 4.2));
    sc.ell(hand, piece, W(palm), X(3.4, 3.4, 3.4), 1.2);
    const up = norm(cross(dir, side));
    for (let k = 0; k < 4; k++) {
      const off = mul(side, (k - 1.5) * 1.5);
      const k0 = add(add(palm, mul(dir, 3)), off);
      const raised = k === 0 && fingerUp > 0;
      const dirK = raised ? norm(add(mul(dir, 1 - fingerUp), mul([0, 0, 1], fingerUp * 1.4))) : norm(add(mul(dir, 1 - curl * 0.8), mul(up, -curl * 1.2)));
      const k1 = add(k0, mul(dirK, 4.6));
      const dirK2 = raised ? dirK : norm(add(mul(dirK, 1 - curl), mul(up, -curl * 1.4)));
      const k2 = add(k1, mul(dirK2, 4.2 - k * 0.3));
      sc.cone(hand, piece, W(k0), W(k1), 1.0, 0.9, 0.5);
      sc.cone(hand, piece, W(k1), W(k2), 0.9, 0.65, 0.4, { tag: 'inked' });
    }
    sc.cone(hand, piece, W(add(palm, mul(side, -2.6))), W(add(add(palm, mul(side, -4.4)), mul(dir, 3.4))), 1.1, 0.8, 0.6);
  };
  const B = brushOf(Q);
  const handR = add(Q.handR, Q.hip);
  // (his right arm to the brush; his hand round it; or, the brush let go of, his hand open and empty)
  if ((Q.dropped ?? 0) > 0) {
    const wrist = sub(handR, [0, 0, 3]);
    armTo(-1, wrist, rot([-0.7, -0.15, -1]));
    const dir = norm(add(sub(handR, shoulder(-1)), [0, 0, -4]));
    handAt('handR', wrist, dir, norm(cross([0, 0, 1], dir)), 0.2, 0);
  } else {
    const wrist = sub(handR, mul(norm(sub(handR, shoulder(-1))), 3.5));
    armTo(-1, wrist, rot([-0.7, -0.15, -1]));
    const side = norm(cross(B.axis, [0, 0, 1]));
    sc.ell(hand, 'handR', W(handR), [mul(W(B.axis), 3.6), mul(W(side), 3.2), mul(W(norm(cross(side, B.axis))), 3.4)], 1.2);
    for (let k = 0; k < 4; k++) {
      const c = add(handR, mul(B.axis, (k - 1.5) * 1.6));
      sc.cone(hand, 'handR', W(add(c, mul(side, -2.8))), W(add(c, mul(side, 2.6))), 1.0, 0.9, 0.5, { tag: k > 1 ? 'inked' : undefined });
    }
  }
  // (his left arm: on the brush, or to his mouth, or at his side)
  {
    const onBrush = Q.twoHand > 0;
    const target = onBrush ? add(handR, mul(B.axis, Q.twoHand * 30)) : add(Q.handL, Q.hip);
    const wrist = onBrush ? target : sub(target, [0, 0, 3]);
    armTo(1, wrist, rot([-0.7, 0.15, -1]));
    if (onBrush) {
      const side = norm(cross(B.axis, [0, 0, 1]));
      sc.ell(hand, 'handL', W(target), [mul(W(B.axis), 3.6), mul(W(side), 3.2), mul(W(norm(cross(side, B.axis))), 3.4)], 1.2);
      for (let k = 0; k < 4; k++) {
        const c = add(target, mul(B.axis, (k - 1.5) * 1.6));
        sc.cone(hand, 'handL', W(add(c, mul(side, 2.8))), W(add(c, mul(side, -2.6))), 1.0, 0.9, 0.5, { tag: k > 1 ? 'inked' : undefined });
      }
    } else {
      const dir = norm(add(sub(target, shoulder(1)), [0, 0, -4]));
      handAt('handL', wrist, dir, norm(cross(dir, [0, 0, 1])), 0.5 * (1 - Q.finger), Q.finger);
    }
  }
  // HIS HEAD: the neck under the hood; THE MASK; the hood, peaked and drooping back
  sc.cone(robe, 'body', TP(0, 0, 86 + b), HP(1, 0, 94 + b), 5.2, 4.6, 2.0);
  sc.ell(robe, 'hood', HP(-1.5, 0, 101 + b), HX(9.5, 9.2, 11), 2.6);
  sc.cone(robe, 'hood', HP(-4, 0, 108 + b), HP(-12, 0, 121 + b), 6.4, 0.8, 2.2);
  // (the hood's opening, dark, round the mask)
  sc.ell(lining, 'hoodin', HP(4.6, 0, 100 + b), HX(4.4, 9.2, 11), 1.2);
  sc.ell(mask, 'mask', HP(7.2, 0, 99.6 + b), HX(4, 7.8, 10), 1.0, { tag: 'mask' });
  // (its brow, a ridge; its nose, a ridge down it)
  sc.cone(mask, 'mask', HP(10.4, 0, 104.5 + b), HP(11, 0, 98.6 + b), 1.1, 1.3, 1.0);
  // HIS RUFF: a great fan of pages behind his head, spread as he readies himself (`ruff`)
  const n = 17;
  const spread = 78 + 30 * Q.ruff;
  const reach = 36 + 12 * Q.ruff;
  for (let i = 0; i < n; i++) {
    const a = (-spread + (i / (n - 1)) * spread * 2) * D;
    const dir: V3 = [-0.12, Math.sin(a), Math.cos(a)];
    const c0: V3 = [-6, 0, 90 + b];
    const base = add(c0, mul(dir, 6));
    const tip = add(c0, mul(dir, reach * (0.84 + 0.16 * hash(i, 1, 31))));
    const side: V3 = norm([0, Math.cos(a), -Math.sin(a)]);
    // (a page: narrow where it is bound, wide at its end, its corner curled a little forward)
    const w0 = 2.2;
    const w1 = 8.4;
    const curl: V3 = [1.6 * (i % 2 ? 1 : 0.4), 0, 0];
    // (stiff, it stands upright behind his neck however he leans: it turns with his shoulders only, and rides where his neck goes)
    const neckAt = T(NECK);
    const R = (q: V3): V3 => {
      const d = sub(q, NECK);
      const tw = (Q.twist + Q.headTurn * 0.3) * D;
      return add(neckAt, [d[0] * Math.cos(tw) - d[1] * Math.sin(tw), d[0] * Math.sin(tw) + d[1] * Math.cos(tw), d[2]]);
    };
    const bl = W(R(add(base, mul(side, -w0 * 0.5))));
    const br = W(R(add(base, mul(side, w0 * 0.5))));
    const tl = W(R(add(add(tip, mul(side, -w1 * 0.5)), curl)));
    const tr = W(R(add(tip, mul(side, w1 * 0.5))));
    sc.tri(page, 'ruff', bl, tl, tr, 0.45, 0.3, { tag: 'page' });
    sc.tri(page, 'ruff', bl, tr, br, 0.45, 0.3, { tag: 'page' });
  }
  // THE GREAT INK BRUSH: bamboo banded in lacquer; the brass ferrule; the fat head of bristles, its wet point burning
  sc.cone(bamboo, 'brush', W(B.butt), W(B.ferrule), 2.0, 2.3, 0.4);
  sc.ell(brass, 'brush', W(B.butt), X(2.4, 2.4, 2.4), 0.4);
  sc.cone(brass, 'brush', W(B.ferrule), W(B.base), 3.0, 3.6, 0.6);
  sc.cone(bristle, 'brush', W(sub(B.base, mul(B.axis, 1))), W(B.tip), 5.6, 0.6, 1.2);
  sc.ell(bristle, 'brush', W(add(B.base, mul(B.axis, 6))), [mul(W(B.axis), 8), mul(W(norm(cross(B.axis, [0, 0, 1]))), 6.2), mul(W(norm(cross(norm(cross(B.axis, [0, 0, 1])), B.axis))), 6.2)], 1.2);
  void F;
  void L;
  grow(sc, CS);
  return draw(sc, view, size.ax, size.ay, size, undefined, Q.rimless ? null : ENEMY_RIM);
}

/** Where a point of the Censor's (his own lengths, before he is grown) is on his canvas, seen `view` at `yaw`. */
export function censorAt(d: Drawn, yaw: number, q: V3): readonly number[] {
  const { P } = frame(yaw);
  return d.st.at(mul(P(q[0], q[1], q[2]), CS));
}

/** (for the painters) the ramps his effects are painted in: his ink, his glow. */
export const CENSOR_INK = { ink: INK2, glow: EYE, flame: FLAME, robe: ROBE, page: PAGE, edge: EDGE } as const;
export type { Hit };
