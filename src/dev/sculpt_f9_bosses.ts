// FLOOR 9'S TWO SIDE BOSSES, SCULPTED (docs/mockups/f9_side_bosses/README.md has every word of his). A DEV TOOL FOR MOCK-UPS; nothing of
// the game imports it. Shown them first as the old figures made bigger and touched up, his word, 13 Nov 2026: “No draw them correctly”.
// So each is drawn new, sculpted as the game's newest figures are (dev/sculpt.ts: solids melted into each other, each pixel's ray,
// lit and inked as the style asks), on no other figure's bones.
//
// THE TROLL CHIEFTAIN (his pick, “Huge, crowned in bones (Recommended)”: half again the prison trolls' size, war paint, a crown of
// antlers and skulls, a tree-trunk club bound with iron). A troll of the prison's kind grown old and huge: a great hunched barrel of a
// body, a belly hanging over his belt, boulder shoulders and long arms down past his knees, forearms thicker than his upper arms, fists
// like anvils; a small head thrust forward and low between his shoulders, a heavy brow, an underbite with two tusks, little ears; short
// thick legs, wide flat feet. His slate-blue hide, darker down his back and in mottled patches; white war paint streaked down from his
// eyes and in a jagged band across his chest, a red handprint over his heart. A HIDE KILT, ragged at its hem, on a wide leather belt with
// an iron boss; a NECKLACE of teeth and finger bones. HIS CROWN: a circlet of bone round his head, two great antlers branching up and out
// of it, three skulls set along its front. HIS CLUB: a TREE'S TRUNK, bark ridged along it, two branch stumps near its head, bound with
// two bands of iron, held by its narrow end in his right fist and trailing on the floor behind him (his trolls carry theirs so). His eyes
// the enemy's pink burning to gold. Nothing cyan.
//
// THE MIST WOLF (his pick, “Giant mist wolf (Recommended)”: twice the size of the floor's fog wolves, pale and see-through, trailing mist,
// pink eyes): a great wolf of pale mist, standing a head over the knight at the shoulder: a deep chest under a heavy ruff, a lean waist,
// long legs, a long head low and forward, its ears laid back, its jaws a little open, white fangs; its mist streaked along it like fur,
// thinning to nothing at its legs, its belly and the end of its tail, and streaming off it; its eyes the enemy's pink burning to gold.

import type { Ramp } from '../art/kit';
import { INK } from '../art/kit';
import { ENEMY_RIM } from '../art/mkit';
import type { GameView } from '../art/skin';
import { add, cross, mul, norm, sub } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { Sculpt, draw, onCone } from './sculpt';
import type { Cone, Drawn } from './sculpt';
import { shadeOf } from './sculpt_classes';

const D = Math.PI / 180;
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const hash = (a: number, b: number, s: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Their canvases: room for the chieftain's antlers and his club behind him; for the wolf's length and its mist. */
export const CHIEF9_CANVAS = { w: 300, h: 300, ax: 150, ay: 250 } as const;
export const WOLF9_CANVAS = { w: 380, h: 280, ax: 190, ay: 236 } as const;

// THE TROLL'S COLOURS
const HIDE: Ramp = ['#1a2238', '#2c3a5e', '#465a8a', '#6a82b2', '#94acd6'];
const KILT: Ramp = ['#24140c', '#422818', '#664028', '#8a5c3a', '#ae7e56'];
const FUR9: Ramp = ['#22201e', '#3c3834', '#5e5852', '#867e74', '#aaa194'];
const LEATHER: Ramp = ['#1e120c', '#3a2416', '#5a3a22', '#7c5432', '#9c7046'];
const BONE9: Ramp = ['#4a4038', '#7a6c5c', '#b0a28a', '#d8ccb2', '#f2eadc'];
const BARK: Ramp = ['#1a120c', '#33241a', '#523a26', '#745236', '#946c46'];
const IRON9: Ramp = ['#14141c', '#2a2a36', '#46465a', '#6e6e86', '#a2a2b8'];
const PAINT_WHITE = '#e8e2d0';
const PAINT_RED = '#a42c26';
const EYE: Ramp = ['#7a1030', '#c0206a', '#ff3a78', '#ffb070', '#fff0c0'];

/** Every solid of a sculpted figure made `k` times as big, about the floor point under it (its painters must measure by `/ k`). */
function grow(sc: Sculpt, k: number): void {
  const m = (v: V3): V3 => mul(v, k);
  for (const pr of sc.prims as unknown as Record<string, unknown>[]) {
    for (const key of ['a', 'b', 'c'] as const) if (Array.isArray(pr[key]) && typeof (pr[key] as unknown[])[0] === 'number') pr[key] = m(pr[key] as unknown as V3);
    if (pr.axes) pr.axes = (pr.axes as V3[]).map(m);
    for (const key of ['ra', 'rb', 'blend', 'round', 'thick'] as const) if (typeof pr[key] === 'number') pr[key] = (pr[key] as number) * k;
    if (pr.cuts) pr.cuts = (pr.cuts as { n: V3; o: number }[]).map((q) => ({ n: q.n, o: q.o * k }));
  }
}

/** The troll chieftain's size: half again his prison trolls' (his pick, “Huge, crowned in bones”). */
const CK = 1.16;

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

/**
 * HOW THE TROLL CHIEFTAIN STANDS (dev/f9_bosses_moves.ts sets it a moment at a time for his moves). Lengths as his figure's own,
 * before he is grown (CK): `f` forward, `l` to his left, `u` up, from the floor under him.
 */
export interface ChiefPose {
  /** His chest's rise, 0 to 1. */
  breath: number;
  /** Where his pelvis has gone from where it stands (a crouch is down, a charge forward). */
  hip: V3;
  /** His body pitched forward from the hips, degrees (back, less than 0). */
  lean: number;
  /** His body turned to his left from the hips, degrees. */
  twist: number;
  /** His head thrown back, degrees. */
  headUp: number;
  /** His jaw open, 0 to 1. */
  jaw: number;
  /** His right fist (round the club's handle), and his left: where each is, as he stands (they go with his pelvis, `hip`). */
  fistR: V3;
  fistL: V3;
  /** Which way the club's head is from his fist: a point it points at, as he stands (it goes with `hip`; the club is as long as it is). */
  clubEnd: V3;
  /** His left fist on the handle too, under the right (both hands on it). */
  twoHand: boolean;
  /** Where his ankles are (`u` the foot off the floor). */
  footL: V3;
  footR: V3;
}

/** HIM STANDING: his club over his right shoulder, his left arm hanging. */
export const CHIEF_STAND: ChiefPose = {
  breath: 0,
  hip: [0, 0, 0],
  lean: 0,
  twist: 0,
  headUp: 0,
  jaw: 0,
  fistR: [20, -33, 82],
  fistL: [14, 34, 25],
  clubEnd: [-9, -60, 124],
  twoHand: false,
  footL: [1, 18, 5],
  footR: [1, -18, 5],
};

/** THE CLUB'S LENGTH, fist to head. */
export const CLUB_LONG = Math.hypot(CHIEF_STAND.clubEnd[0] - CHIEF_STAND.fistR[0], CHIEF_STAND.clubEnd[1] - CHIEF_STAND.fistR[1], CHIEF_STAND.clubEnd[2] - CHIEF_STAND.fistR[2]);

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

/** THE TROLL CHIEFTAIN as he stands at `pose` (standing, unless given), seen `view`, turned `yaw`; on a canvas of `size` (his). */
export function sculptChief9(view: GameView, pose: Partial<ChiefPose> = {}, yaw = -10, size: { w: number; h: number; ax: number; ay: number } = CHIEF9_CANVAS): Drawn {
  const Q: ChiefPose = { ...CHIEF_STAND, ...pose };
  const sc = new Sculpt();
  const { F, L, U, P, X } = frame(yaw);
  const b = Q.breath * 1.2;
  // (his body's turn: pitched forward `lean` about his pelvis, turned `twist`, moved `hip`; his head thrown back about his neck)
  const PIV: V3 = [0, 0, 38];
  const NECK: V3 = [10, 0, 84];
  const cl = Math.cos(Q.lean * D);
  const sl = Math.sin(Q.lean * D);
  const ct = Math.cos(Q.twist * D);
  const st = Math.sin(Q.twist * D);
  const ch = Math.cos(-Q.headUp * D);
  const sh = Math.sin(-Q.headUp * D);
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
  const headRot = (q: V3): V3 => [q[0] * ch + q[2] * sh, q[1], -q[0] * sh + q[2] * ch];
  const headUnrot = (q: V3): V3 => [q[0] * ch - q[2] * sh, q[1], q[0] * sh + q[2] * ch];
  const T = (q: V3): V3 => add(add(rot(sub(q, PIV)), PIV), Q.hip);
  const H = (q: V3): V3 => T(add(headRot(sub(q, NECK)), NECK));
  const W = (q: V3): V3 => P(q[0], q[1], q[2]);
  const TP = (f: number, l: number, u: number): V3 => W(T([f, l, u]));
  const HP = (f: number, l: number, u: number): V3 => W(H([f, l, u]));
  const PP = (f: number, l: number, u: number): V3 => W(add([f, l, u], Q.hip));
  const axes = (r: (q: V3) => V3, rf: number, rl: number, ru: number): readonly [V3, V3, V3] => {
    const [a, c, e] = [r([1, 0, 0]), r([0, 1, 0]), r([0, 0, 1])];
    return [mul(W(a), rf), mul(W(c), rl), mul(W(e), ru)];
  };
  const TX = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => axes(rot, rf, rl, ru);
  const HX = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => axes((q) => rot(headRot(q)), rf, rl, ru);
  // (a point of him as painted, back where it is on him as he stands: his paint stays where it is on him as he moves)
  const loc = (p: V3): V3 => [dot3(p, F) / CK, dot3(p, L) / CK, p[2] / CK];
  const onBody = (p: V3): V3 => add(unrot(sub(sub(loc(p), Q.hip), PIV)), PIV);
  const onHead = (p: V3): V3 => add(headUnrot(sub(onBody(p), NECK)), NECK);
  // (the hide's mottle by where it is on its own part, so it does not crawl as he moves)
  const anchor = (h: { p: V3; prim: { k: string } }): V3 => {
    const pr = h.prim as unknown as { c?: V3; a?: V3 };
    return sub(h.p, pr.c ?? pr.a ?? [0, 0, 0]);
  };
  // HIS HIDE: mottled; darker down his back; his war paint where it is on him
  const hide = sc.mat({
    ramp: HIDE,
    paint: (h) => {
      const tag = h.prim.tag;
      const [f, l, u] = tag === 'face' ? onHead(h.p) : onBody(h.p);
      const m = anchor(h);
      const n = hash(Math.floor(m[0] / 5) + h.prim.piece.length * 3, Math.floor(m[1] / 5) + Math.floor(m[2] / 5) * 7, 3);
      // (war paint, on his front only: a jagged white band across his chest, a red handprint over his heart)
      if (f > 8 && tag === 'chest') {
        const zig = 64 + b + 2.2 * Math.abs(((l + 40) % 8) - 4) - 4;
        if (Math.abs(u - zig) < 1.3) return PAINT_WHITE;
        const hx = l - 9;
        const hy = u - 56 - b;
        if (hx > -4 && hx < 4 && hy > -4 && hy < 3) {
          const finger = hy > 0 && Math.abs(((hx + 4) % 2) - 1) < 0.5;
          if (hy <= 0 || finger) return PAINT_RED;
        }
      }
      if (tag === 'face') {
        // (a band of red across his eyes, like a mask; two white streaks down from under each eye)
        if (u > 87.6 + b && u < 91.6 + b && f > 28 && Math.abs(l) > 1.6) return PAINT_RED;
        if (f > 28 && u > 82 + b && u < 87.6 + b && (Math.abs(l - 4.4) < 0.8 || Math.abs(l + 4.4) < 0.8)) return PAINT_WHITE;
      }
      // (three white slashes of war paint down his back)
      if (tag !== 'face' && h.prim.piece === 'body' && f < -10 && u > 58 && u < 84) for (const k of [-9, 0, 9]) if (Math.abs(l - k - (u - 70) * 0.35) < 1.2) return PAINT_WHITE;
      const back = h.prim.piece === 'body' && f < -4 ? 1 : 0;
      if (n < 0.18) return shadeOf(HIDE, h.tone - 1 - back);
      return back ? shadeOf(HIDE, h.tone - 1) : null;
    },
  });
  const kilt = sc.mat({
    ramp: KILT,
    paint: (h) => {
      // (its hide spotted; its fur ragged at the hem)
      const m = anchor(h);
      const n = hash(Math.floor(m[0] / 2.5), Math.floor(m[1] / 2.5) + Math.floor(m[2] / 2.5) * 13, 9);
      if (n < 0.16) return shadeOf(KILT, h.tone - 1);
      if (n > 0.92) return shadeOf(KILT, h.tone + 1);
      return null;
    },
  });
  const leather = sc.mat({ ramp: LEATHER });
  const fur = sc.mat({ ramp: FUR9, paint: (h) => {
    const m = anchor(h);
    return hash(Math.floor(m[0] / 1.5), Math.floor(m[2] / 1.2), 19) < 0.3 ? shadeOf(FUR9, h.tone - 1) : null;
  } });
  const bone = sc.mat({
    ramp: BONE9,
    paint: (h) => {
      // (a skull's sockets and its nose, dark)
      if (h.prim.tag === 'skull') {
        const [f, l, u] = onHead(h.p);
        const c = onHead((h.prim as { c: V3 }).c);
        const dl = l - c[1];
        const du = u - c[2];
        if (f > c[0] + 0.8 && Math.abs(Math.abs(dl) - 1.1) < 0.6 && du > -0.2 && du < 1.0) return INK;
        if (f > c[0] + 0.8 && Math.abs(dl) < 0.4 && du < -0.5 && du > -1.2) return BONE9[0];
      }
      return null;
    },
  });
  const bark = sc.mat({
    ramp: BARK,
    paint: (h) => {
      if (h.prim.k === 'cone' && h.prim.tag === 'handle') {
        // (its handle worn smooth and bound in a strip of leather, wound round it)
        const { t, around } = onCone(h.prim as Cone, h.p, U);
        return Math.floor((t * 8 + around / (Math.PI * 2)) * 2) % 2 === 0 ? shadeOf(LEATHER, h.tone) : shadeOf(BARK, h.tone + 1);
      }
      if (h.prim.k !== 'cone' || h.prim.tag !== 'trunk') return null;
      const { t, around } = onCone(h.prim as Cone, h.p, U);
      // (two bands of iron round it; its bark ridged along it)
      if (Math.abs(t - 0.6) < 0.045 || Math.abs(t - 0.9) < 0.045) return shadeOf(IRON9, h.tone + (Math.abs(t - 0.6) < 0.012 || Math.abs(t - 0.9) < 0.012 ? 1 : 0));
      if (Math.floor((around + 4) * 5) % 3 === 0) return shadeOf(BARK, h.tone - 1);
      return null;
    },
  });
  const iron = sc.mat({ ramp: IRON9 });
  const eye = sc.mat({ ramp: EYE, paint: (h) => (h.tone >= 2 ? EYE[4] : EYE[2]) });
  const maw = sc.mat({ ramp: ['#14060e', '#220a16', '#3a1226', '#541c36', '#6e2846'] });

  // HIS LEGS: short and thick, his knees bent under his weight (toward where he faces), his feet wide and flat
  for (const s of [1, -1]) {
    const piece = s > 0 ? 'legL' : 'legR';
    const hipJ: V3 = add([-2, s * 15, 36], Q.hip);
    const ankle = s > 0 ? Q.footL : Q.footR;
    const knee = bend(hipJ, ankle, 19, 13.4, [1, s * 0.15, 0]);
    sc.cone(hide, piece, W(hipJ), W(knee), 12, 10, 2.4);
    sc.cone(hide, piece, W(knee), W(ankle), 10, 8.5, 2.4);
    sc.ell(hide, piece, W(add(ankle, [5, s * 0.5, -1.4])), X(12, 8, 4), 1.6, { tag: 'foot' });
    // (his toes: three blunt lumps)
    for (const k of [-1, 0, 1]) sc.ell(hide, piece, W(add(ankle, [15, s * 0.5 + k * 3.6, -2.6])), X(3, 2, 2.2), 0.6);
  }
  // HIS HIPS AND BELLY: the belly hanging over his belt
  sc.ell(hide, 'body', PP(-2, 0, 40), X(16, 22, 13), 3.0);
  sc.ell(hide, 'body', TP(8, 0, 48 + b * 0.5), TX(17, 21, 15), 3.0, { tag: 'chest' });
  // HIS CHEST: a great barrel, hunched forward
  sc.ell(hide, 'body', TP(4, 0, 64 + b), TX(17, 27, 17), 3.4, { tag: 'chest' });
  sc.ell(hide, 'body', TP(-6, 0, 72 + b), TX(16, 25, 15), 3.4);
  // (his hump: the top of his back thrust up behind his head)
  sc.ell(hide, 'body', TP(-4, 0, 82 + b), TX(13, 18, 9), 3.0);
  // HIS SHOULDERS, boulders; his arms long, each to its fist (his elbows out and back)
  for (const s of [1, -1]) {
    const piece = s > 0 ? 'armL' : 'armR';
    const sh0: V3 = T([0, s * 29, 80 + b]);
    sc.ell(hide, piece, W(sh0), TX(13, 12, 12), 2.8);
    const top = T([1, s * 31, 78 + b]);
    const fist = add(s > 0 ? Q.fistL : Q.fistR, Q.hip);
    // (the wrist a little back from the fist, along the forearm)
    const wrist = add(fist, mul(norm(sub(top, fist)), 6));
    const elbow = bend(top, wrist, 24, 24, rot([-0.3, s * 0.8, -1]));
    sc.cone(hide, piece, W(top), W(elbow), 10, 8.5, 2.6);
    sc.cone(hide, piece, W(elbow), W(wrist), 10.5, 8, 2.6);
    // (his forearm thicker than his upper arm: the swell of it)
    sc.ell(hide, piece, W(add(mul(elbow, 0.55), mul(wrist, 0.45))), X(10, 10, 11), 2.0);
    // (an iron cuff round his wrist)
    const fa = norm(sub(wrist, elbow));
    sc.cone(iron, s > 0 ? 'cuffL' : 'cuffR', W(sub(wrist, mul(fa, 4.5))), W(add(wrist, mul(fa, -0.5))), 8.6, 8.5, 0.4);
  }
  // HIS LEFT FIST, if not on the club: half shut, its knuckles a ridge across it, its thumb along its side
  if (!Q.twoHand) {
    const c = add(Q.fistL, Q.hip);
    sc.ell(hide, 'fistL', W(c), X(6.5, 6, 7.5), 2.0, { tag: 'fist' });
    for (let k = 0; k < 4; k++) sc.ell(hide, 'fistL', W(add(c, [5.5, 3.5 - k * 2.4, -4 - k * 0.3])), X(2.4, 1.6, 2.6), 1.0);
    sc.cone(hide, 'fistL', W(add(c, [3, -4, 2])), W(add(c, [6.5, -2.5, -3])), 2.4, 1.8, 1.0);
  }
  // HIS HEAD: thrust forward and low between his shoulders; a heavy brow, an underbite, two tusks, little ears; his jaw drops open
  const HF = 6;
  const jd = Q.jaw;
  sc.cone(hide, 'body', TP(6, 0, 82 + b), HP(15 + HF, 0, 85 + b), 12, 10, 3.0);
  sc.ell(hide, 'head', HP(19 + HF, 0, 88 + b), HX(10.5, 10.5, 10), 2.4, { tag: 'face' });
  sc.ell(hide, 'head', HP(26 + HF, 0, 93 + b), HX(3.4, 9.5, 2.6), 1.6, { tag: 'face' });
  sc.ell(hide, 'jaw', HP(26.5 + HF - jd * 1.5, 0, 81 + b - jd * 6), HX(7, 9.5, 5), 1.8, { tag: 'face' });
  if (jd > 0.05) sc.ell(maw, 'maw', HP(27 + HF, 0, 84.5 + b - jd * 3), HX(4.5, 7, 1 + jd * 4), 0.4);
  // (his nose: broad and flat)
  sc.ell(hide, 'head', HP(29 + HF, 0, 87 + b), HX(2.6, 3.2, 2.8), 1.0, { tag: 'face' });
  for (const s of [1, -1]) sc.cone(hide, 'ear', HP(16 + HF, s * 9.5, 90 + b), HP(13 + HF, s * 15.5, 93 + b), 2.8, 0.8, 1.0);
  for (const s of [1, -1]) sc.ell(eye, 'eye', HP(29.2 + HF, s * 4.4, 89.6 + b), HX(1.6, 2.1, 1.5), 0.2);
  for (const s of [1, -1]) sc.cone(bone, 'tusk', HP(32 + HF - jd * 1.5, s * 6, 81.5 + b - jd * 6), HP(34 + HF - jd * 1.5, s * 7.6, 90 + b - jd * 6), 2.2, 0.5, 0.3);
  // HIS NECKLACE: teeth and finger bones on a thong, hanging over his chest
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 62 * D;
    const at: V3 = [19 * Math.cos(a) + 2, 23 * Math.sin(a), 74 + b - 6 * Math.cos(a)];
    sc.cone(bone, 'neck', W(T(at)), add(W(T(at)), P(1.2, 0, -4.4 - (i % 2) * 1.6)), 1.2, 0.4, 0.3);
  }
  // HIS BELT, wide leather, an iron boss on it; HIS KILT of hide in ragged flaps, the front and back ones longest
  sc.ell(leather, 'belt', PP(-0.5, 0, 37), X(21.5, 25.2, 4.2), 0.6, { tag: 'belt' });
  sc.ell(iron, 'boss', PP(21.2, 0, 37.4), X(2, 4.2, 4.2), 0.4);
  // (the flaps swing back as he goes forward)
  const swing = Math.max(-6, Math.min(6, Q.lean * 0.12));
  for (let i = 0; i < 18; i++) {
    const a = ((i + 0.5) / 18) * 360 * D;
    const rad = (k: number): V3 => [Math.cos(a) * (17 + k), Math.sin(a) * (21.5 + k), 0];
    const long = 9 + 5 * Math.abs(Math.cos(a)) + hash(i, 1, 41) * 4;
    const tip = add(rad(3.5), [-swing, 0, 36 - long * (i % 3 === 1 ? 0.75 : 1)]);
    sc.cone(i % 3 === 1 ? fur : kilt, `kilt${i % 2}`, W(add(add(rad(0), [0, 0, 36]), Q.hip)), W(add(tip, Q.hip)), 4.6, 1.2, 0.3);
  }
  // (his spine: a ridge of knobs down from his hump)
  for (let i = 0; i < 4; i++) sc.ell(hide, 'body', TP(-17.5 + i * 0.6, 0, 86 - i * 6.5 + b), TX(3.4, 4.2, 3.2), 1.4);
  // HIS CROWN: a circlet of bone round his head, two great antlers branching up and out of it, three skulls along its front
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 360 * D;
    sc.ell(bone, 'crown', HP(21 + 9.2 * Math.cos(a), 9.2 * Math.sin(a), 97.5 - 1.5 * Math.cos(a) + b), HX(2.4, 2.4, 1.7), 0.6);
  }
  for (const s of [1, -1]) {
    const pts: V3[] = [HP(18, s * 8, 98.5 + b), HP(16, s * 13, 105 + b), HP(14, s * 19, 113 + b), HP(12, s * 22, 123 + b), HP(9, s * 21, 132 + b)];
    for (let i = 1; i < pts.length; i++) sc.cone(bone, `antler${s > 0 ? 'L' : 'R'}`, pts[i - 1], pts[i], 2.6 - i * 0.35, 2.6 - (i + 1) * 0.35, 0.8);
    const lp = [[18, 8, 98.5], [16, 13, 105], [14, 19, 113], [12, 22, 123]];
    for (const [j, df, dl, du] of [[1, 3, 1, 7], [2, -4, 3, 6], [3, 3, -2, 7], [2, 5, 4, 3]] as const) sc.cone(bone, `antler${s > 0 ? 'L' : 'R'}`, pts[j], HP(lp[j][0] + df, s * (lp[j][1] + dl), lp[j][2] + du + b), 1.4, 0.4, 0.5);
  }
  for (const [l, u] of [[-6.4, 100.5], [0, 102], [6.4, 100.5]] as const) sc.ell(bone, 'crown', HP(25 + (l === 0 ? 1 : 0), l, u + b), HX(2.8, 2.6, 3), 0.4, { tag: 'skull' });
  // HIS CLUB: A TREE'S TRUNK, its handle in his right fist (and his left under it, with both hands); knots on it, two bands of iron
  // round its head, its end flaring to root stubs
  const grip = W(add(Q.fistR, Q.hip));
  const A = norm(sub(W(add(Q.clubEnd, Q.hip)), grip));
  const at = (d: number): V3 => add(grip, mul(A, d));
  const len = CLUB_LONG * 1;
  const end = at(len);
  sc.cone(bark, 'club', at(Q.twoHand ? -16 : -8), at(6), 2.9, 3.2, 0.6, { tag: 'handle' });
  sc.ell(bark, 'club', at(Q.twoHand ? -16.5 : -8.5), X(2.6, 2.6, 2.6), 0.6, { tag: 'handle' });
  sc.cone(bark, 'club', at(5), end, 3.3, 10, 1.0, { tag: 'trunk' });
  for (const [d, k, r] of [[0.38, 0, 2.2], [0.55, 1, 2.6], [0.74, 2, 2.4]] as const) {
    const ang = k * 2.1 + 0.6;
    const side = norm(cross(A, [Math.cos(ang), Math.sin(ang), 0.4]));
    sc.ell(bark, 'club', add(at(len * d), mul(side, 3.6 + d * 6.5)), X(r, r, r), 1.2, { tag: 'knot' });
  }
  // (its end flaring to root stubs)
  for (let k = 0; k < 5; k++) {
    const ang = (k / 5) * Math.PI * 2;
    const side = norm(cross(A, [Math.cos(ang), Math.sin(ang), 0.7]));
    sc.cone(bark, 'club', add(at(len - 4), mul(side, 7)), add(add(at(len + 1.5), mul(side, 11.5)), mul(A, 0.5)), 3.2, 1.2, 1.2, { tag: 'root' });
  }
  // HIS FISTS round the handle: the back of each hand outside it, the knuckles a ridge over it, the fingers wrapped round it in front,
  // the thumb across them
  const up: V3 = Math.abs(A[2]) > 0.95 ? norm(cross(A, F)) : [0, 0, 1];
  const out = norm(cross(A, up));
  const fwd = norm(cross(out, A));
  for (const [piece, d0] of Q.twoHand ? ([['fistR', 0], ['fistL', -9]] as const) : ([['fistR', 0]] as const)) {
    const g = at(d0);
    sc.ell(hide, piece, add(g, mul(out, -2.4)), [mul(A, 6), mul(out, 4.6), mul(fwd, 5.4)], 1.6, { tag: 'fist' });
    for (let k = 0; k < 4; k++) {
      const c = at(d0 - 4.2 + k * 2.7);
      sc.ell(hide, piece, add(add(c, mul(out, -3.6)), mul(fwd, 3.2)), X(1.9, 1.9, 1.9), 0.8);
      sc.cone(hide, piece, add(add(c, mul(out, -2.6)), mul(fwd, 4.2)), add(add(c, mul(out, 2.2)), mul(fwd, 3.6)), 1.5, 1.35, 0.6);
    }
    sc.cone(hide, piece, add(at(d0 - 5), mul(out, -1)), add(add(at(d0 + 0.5), mul(out, 2.4)), mul(fwd, 3.4)), 1.9, 1.5, 0.8);
  }
  grow(sc, CK);
  return draw(sc, view, size.ax, size.ay, size, undefined, ENEMY_RIM);
}

/** Where a point of the chieftain's (his own lengths, before he is grown) is on his canvas, seen `view` at `yaw`. */
export function chiefAt(d: Drawn, yaw: number, q: V3): readonly number[] {
  const { P } = frame(yaw);
  return d.st.at(mul(P(q[0], q[1], q[2]), CK));
}

// THE WOLF'S COLOURS: a pale mist, a ghost's: near white at its brightest, a cold violet in its shadow
const MIST: Ramp = ['#4a4664', '#6c688a', '#9692b2', '#c6c2da', '#eeecf8'];
const FANG: Ramp = ['#6a6458', '#9a9284', '#c4baa8', '#e2dac8', '#f6f0e4'];
const MOUTH: Ramp = ['#1a0a18', '#2c1028', '#4a1a3a', '#6a2a50', '#8a3a66'];
/** Its size: twice a fog wolf's (his pick); its shoulder near the knight's head. */
const WK = 0.82;

/**
 * HOW THE MIST WOLF STANDS (dev/f9_bosses_moves.ts sets it a moment at a time for its moves): its own lengths, before it is made its
 * size (WK); `f` forward, `l` to its left, `u` up, from the floor under it.
 */
export interface WolfPose {
  /** Seconds into it (its mist drifts by it). */
  t: number;
  /** Where its body has gone from where it stands. */
  root: V3;
  /** Its body pitched nose down, degrees (up, less than 0). */
  pitch: number;
  /** Its head raised, degrees; turned to its left, degrees. */
  headUp: number;
  headTurn: number;
  /** Its jaws open, 0 to 1. */
  jaw: number;
  /** Where its paws are: front left and right, hind left and right. */
  pawFL: V3;
  pawFR: V3;
  pawHL: V3;
  pawHR: V3;
  /** Its tail raised, degrees. */
  tailUp: number;
  /** How far gone to mist it is, 0 to 1 (its lunge passes through you). */
  ghost: number;
}

/** IT STANDING. */
export const WOLF_STAND: WolfPose = {
  t: 0,
  root: [0, 0, 0],
  pitch: 0,
  headUp: 0,
  headTurn: 0,
  jaw: 0.25,
  pawFL: [25, 8.5, 3],
  pawFR: [30, -8.5, 3],
  pawHL: [-16.5, 8.5, 3],
  pawHR: [-21.5, -8.5, 3],
  tailUp: 0,
  ghost: 0,
};

/** THE MIST WOLF as it stands at `pose` (standing, unless given), seen `view`, turned `yaw`; on a canvas of `size` (its own). */
export function sculptWolf9(view: GameView, pose: Partial<WolfPose> = {}, yaw = 42, size: { w: number; h: number; ax: number; ay: number } = WOLF9_CANVAS): Drawn {
  const Q: WolfPose = { ...WOLF_STAND, ...pose };
  const sc = new Sculpt();
  const fr = frame(yaw);
  const P = (f: number, l: number, u: number): V3 => fr.P(f * WK, l * WK, u * WK);
  const X = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => fr.X(rf * WK, rl * WK, ru * WK);
  const cone = (m: number, pc: string, a: V3, b2: V3, ra: number, rb: number, bl: number): void => {
    sc.cone(m, pc, a, b2, ra * WK, rb * WK, bl * WK);
  };
  const ell = (m: number, pc: string, c: V3, ax: readonly [V3, V3, V3], bl: number): void => {
    sc.ell(m, pc, c, ax, bl * WK);
  };
  // (its body pitched about its middle and moved; its head raised and turned about the base of its neck)
  const MID: V3 = [0, 0, 62];
  const NECK: V3 = [36, 0, 72];
  const cp = Math.cos(Q.pitch * D);
  const sp = Math.sin(Q.pitch * D);
  const cu = Math.cos(-Q.headUp * D);
  const su = Math.sin(-Q.headUp * D);
  const cn = Math.cos(Q.headTurn * D);
  const sn = Math.sin(Q.headTurn * D);
  const rotB = (q: V3): V3 => [q[0] * cp + q[2] * sp, q[1], -q[0] * sp + q[2] * cp];
  const rotH = (q: V3): V3 => {
    const f1 = q[0] * cu + q[2] * su;
    const u1 = -q[0] * su + q[2] * cu;
    return [f1 * cn - q[1] * sn, f1 * sn + q[1] * cn, u1];
  };
  const B = (q: V3): V3 => add(add(rotB(sub(q, MID)), MID), Q.root);
  const Hd = (q: V3): V3 => B(add(rotH(sub(q, NECK)), NECK));
  const W = (q: V3): V3 => P(q[0], q[1], q[2]);
  const BP = (f: number, l: number, u: number): V3 => W(B([f, l, u]));
  const HP = (f: number, l: number, u: number): V3 => W(Hd([f, l, u]));
  const axes = (r: (q: V3) => V3, rf: number, rl: number, ru: number): readonly [V3, V3, V3] => {
    const [a1, c1, e1] = [r([1, 0, 0]), r([0, 1, 0]), r([0, 0, 1])];
    return [mul(W(a1), rf), mul(W(c1), rl), mul(W(e1), ru)];
  };
  const BX = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => axes(rotB, rf, rl, ru);
  const HX = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => axes((q) => rotB(rotH(q)), rf, rl, ru);
  void X;
  // ITS MIST: streaked along it like fur, back from its head (long thin streaks); darker under. The streaks go with it as it moves.
  const mist = sc.mat({
    ramp: MIST,
    paint: (h) => {
      const pr = h.prim as unknown as { c?: V3; a?: V3 };
      const o = pr.c ?? pr.a ?? [0, 0, 0];
      const q: V3 = [dot3(sub(h.p, o), fr.F) / WK, dot3(sub(h.p, o), fr.L) / WK, (h.p[2] - o[2]) / WK];
      const lowU = h.p[2] / WK - Q.root[2];
      const row = Math.floor((q[2] + 200) / 1.1) + Math.floor((q[1] + 200) / 2.5) * 37 + h.prim.piece.length * 11;
      const streak = hash(row, Math.floor((q[0] + 200 + hash(row, 0, 2) * 6) / 6), 5);
      if (lowU < 46 && streak < 0.45) return shadeOf(MIST, h.tone - 1);
      if (streak < 0.14) return shadeOf(MIST, h.tone - 1);
      if (streak > 0.86) return shadeOf(MIST, h.tone + 1);
      return null;
    },
  });
  const fang = sc.mat({ ramp: FANG });
  const mouth = sc.mat({ ramp: MOUTH });
  const eye = sc.mat({ ramp: EYE, paint: (h) => (h.tone >= 3 ? EYE[4] : EYE[2]) });
  // ITS BODY: a deep chest under a heavy ruff, a lean waist tucked up, its haunch
  ell(mist, 'body', BP(23, 0, 59), BX(16, 13, 20), 4.6);
  ell(mist, 'body', BP(2, 0, 65), BX(17, 9.5, 10), 3.6);
  ell(mist, 'body', BP(-20, 0, 63), BX(14, 12, 13.5), 3.2);
  // (its ruff: the mist piled up round its neck and shoulders, in tufts, melted into it)
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 80 * D;
    ell(mist, 'body', BP(30 + 2 * Math.cos(a), 12 * Math.sin(a), 71 + 5 * Math.cos(a)), BX(7, 5.5, 8), 4.4);
  }
  // ITS NECK AND HEAD: long, low and forward; a broad skull, a long snout
  cone(mist, 'body', BP(34, 0, 70), HP(45, 0, 77), 10.5, 8.5, 3.0);
  ell(mist, 'head', HP(50, 0, 79), HX(10, 9.5, 9), 2.6);
  // (its cheeks: tufts of mist swept back)
  for (const s of [1, -1]) ell(mist, 'head', HP(46, s * 7.5, 74), HX(6.5, 3.6, 5.5), 1.6);
  // (its snout, long; its nose; its jaws open as far as `jaw`, white fangs)
  const jw = Q.jaw;
  cone(mist, 'head', HP(55, 0, 79), HP(72, 0, 74.5), 6.6, 3.8, 2.4);
  ell(mouth, 'nose', HP(73.2, 0, 75.8), HX(2.4, 2.6, 2.0), 0.6);
  const jt: V3 = [53 + 16 * Math.cos((5 + jw * 30) * D), 0, 72 - 16 * Math.sin((5 + jw * 30) * D) - 2];
  cone(mist, 'jaw', HP(53, 0, 72), HP(jt[0], 0, jt[2]), 4.6, 2.4, 1.6);
  cone(mouth, 'mouth', HP(56, 0, 73.4), HP((70 + jt[0]) / 2 + 1, 0, (71.4 + jt[2] + 2) / 2), 3.0 + jw * 2, 1.4 + jw, 0.6);
  for (const s of [1, -1]) {
    cone(fang, 'fang', HP(69, s * 2.3, 73.8), HP(69.8, s * 2.3, 70.2), 1.1, 0.3, 0.2);
    const lf: V3 = [jt[0] - 2.5, s * 2.0, jt[2] + 0.8];
    cone(fang, 'fang', HP(lf[0], lf[1], lf[2]), HP(lf[0] + 0.5, lf[1], lf[2] + 3.2), 1.0, 0.3, 0.2);
  }
  // (its ears laid back, flat to its skull)
  for (const s of [1, -1]) cone(mist, 'ear', HP(47, s * 5.5, 86), HP(37, s * 9, 90), 4.4, 0.6, 1.0);
  // (its brow, heavy; its eyes burning under it)
  ell(mist, 'head', HP(55, 0, 83), HX(4, 7.5, 2.4), 1.4);
  for (const s of [1, -1]) ell(eye, 'eye', HP(57.4, s * 4.8, 81.4), HX(1.9, 1.7, 1.4), 0.2);
  // ITS LEGS: long and lean, each to its paw; its elbows back, its knees forward, its hocks back
  for (const s of [1, -1]) {
    const k = s > 0 ? -5 : 0;
    const pf = s > 0 ? 'legFL' : 'legFR';
    const paw = s > 0 ? Q.pawFL : Q.pawFR;
    const sh0 = B([26 + k, s * 8, 52]);
    const wrist = add(paw, [-5, 0, 6]);
    const elbow = bend(sh0, wrist, 21.4, 22.2, [-1, 0, 0]);
    cone(mist, pf, W(sh0), W(elbow), 7, 4.2, 2.4);
    cone(mist, pf, W(elbow), W(wrist), 4.0, 2.8, 1.6);
    cone(mist, pf, W(wrist), W(add(paw, [-2, 0, 1])), 2.8, 2.8, 1.2);
    ell(mist, pf, W(paw), X(4.8, 3.2, 2.8), 1.2);
    const ph = s > 0 ? 'legHL' : 'legHR';
    const hp = s > 0 ? Q.pawHL : Q.pawHR;
    const hip = B([-21 - k, s * 8.5, 58]);
    const hock = add(hp, [-6.5, 0, 14]);
    const knee = bend(hip, hock, 24.4, 25, [1, 0, 0]);
    cone(mist, ph, W(hip), W(knee), 9, 5, 2.6);
    cone(mist, ph, W(knee), W(hock), 4.8, 3.2, 1.8);
    cone(mist, ph, W(hock), W(add(hp, [-3.5, 0, 2])), 3.0, 2.8, 1.2);
    ell(mist, ph, W(hp), X(4.8, 3.2, 2.8), 1.2);
  }
  // (its mist hanging from under its chest and belly in a ragged fringe, thinning to nothing)
  for (let i = 0; i < 9; i++) {
    const f = 30 - i * 5.5;
    const u = i < 3 ? 42 + i * 3 : 54;
    for (const s of [1, -1]) cone(mist, 'body', BP(f, s * 5, u + 2), W(add(B([f, s * 6, u - 4]), [-4, 0, -6 - (i % 3) * 3])), 3.4, 0.7, 1.6);
  }
  // ITS TAIL: long and heavy, hanging in a curve, bushy, its end fraying into mist; raised as far as `tailUp`
  const TB: V3 = [-31, 0, 68];
  const ct = Math.cos(Q.tailUp * D);
  const stt = Math.sin(Q.tailUp * D);
  const tailL: V3[] = [[-31, 0, 68], [-43, 0, 64], [-53, 0, 56], [-59, 0, 46], [-61, 0, 36]].map((q) => {
    const d = sub(q as unknown as V3, TB);
    return B(add(TB, [d[0] * ct - d[2] * stt, d[1], d[0] * stt + d[2] * ct]));
  });
  const tail = tailL.map(W);
  const tr = [4.5, 6.5, 7.5, 6.5, 3.5];
  for (let i = 1; i < tail.length; i++) cone(mist, 'tail', tail[i - 1], tail[i], tr[i - 1], tr[i], 2.4);
  const drawn = draw(sc, view, size.ax, size.ay, size, undefined, ENEMY_RIM);
  const tailEnd = drawn.st.at(tail[tail.length - 1]);
  const back = drawn.st.at(BP(-30, 0, 72));
  const head = drawn.st.at(BP(40, 0, 80));
  const floor = drawn.st.at(W([Q.root[0], Q.root[1], 0]));
  seeThrough(drawn, Q.t, tailEnd, back, head, floor[1], Q.ghost);
  return drawn;
}

/** Where a point of the wolf's (its own lengths) is on its canvas, seen at `yaw`. */
export function wolfAt(d: Drawn, yaw: number, q: V3): readonly number[] {
  const { P } = frame(yaw);
  return d.st.at(P(q[0] * WK, q[1] * WK, q[2] * WK));
}

/**
 * ITS MIST, SEE-THROUGH AND STREAMING: its edges, its lower legs and its tail's end thinned to a mist (in drifting patches, every
 * other pixel and then none) so the floor shows through; wisps streaming off its back and tail, away from its head; its mist lying
 * on the floor round its feet.
 */
function seeThrough(d: Drawn, t: number, tailEnd: readonly number[], back: readonly number[], head: readonly number[], floorY: number, ghost: number): void {
  const px = d.px;
  const W = px.w;
  const H = px.h;
  const a = (x: number, y: number): number => (x >= 0 && y >= 0 && x < W && y < H ? px.d[(y * W + x) * 4 + 3] : 0);
  // (how near each pixel is to the figure's edge)
  const edge = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!a(x, y)) continue;
      let e = 0;
      for (let r = 1; r <= 3 && !e; r++) if (!a(x - r, y) || !a(x + r, y) || !a(x, y - r) || !a(x, y + r)) e = 4 - r;
      edge[y * W + x] = e;
    }
  }
  const keep = new Set<string>([...EYE, ...FANG, ...MOUTH]);
  const pale = MIST[4];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (px.d[i + 3] === 0) continue;
      const c = '#' + [px.d[i], px.d[i + 1], px.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (keep.has(c)) continue;
      // (thinner the lower it is: its lower legs; thinner toward its tail's end; and in patches that drift back along it)
      const low = Math.max(0, Math.min(1, (y - (floorY - 44)) / 44));
      const dt = Math.hypot(x - tailEnd[0], y - tailEnd[1]);
      const tip = Math.max(0, Math.min(1, 1 - dt / 26));
      const n = hash(Math.floor((x - (head[0] < back[0] ? -1 : 1) * t * 10) / 4), Math.floor(y / 3), 11) * 0.65 + hash(x, y, 13) * 0.35;
      const thin = Math.min(0.97, 0.34 * low * low + 0.45 * tip + 0.1 * edge[y * W + x] / 3 + ghost * 0.85);
      if (n < thin * 0.7) px.d[i + 3] = 0;
      else if (n < thin && (x + y) % 2 === 1) px.d[i + 3] = 0;
      else if (n < thin * 1.4) px.set(x, y, (x + y) % 2 ? pale : MIST[3]);
    }
  }
  const set = (x: number, y: number, c: string): void => {
    if (x >= 0 && y >= 0 && x < W && y < H && !a(x, y)) px.set(x, y, c);
  };
  // (its mist on the floor round its feet: a pale haze, thinning out)
  const fx = (back[0] + head[0]) / 2;
  for (let y = Math.round(floorY) - 10; y <= floorY + 12; y++) {
    for (let x = Math.round(fx - 90); x <= fx + 90; x++) {
      const r = Math.hypot((x - fx) / 80, (y - floorY) / 11);
      if (r > 1) continue;
      const n = hash(Math.floor((x + t * 6) / 3), Math.floor(y / 2), 17);
      if (n > 1 - r * 0.9 || (x + y) % 2) continue;
      set(x, y, r < 0.5 ? MIST[2] : MIST[1]);
    }
  }
  // (wisps streaming off its back and tail, away from its head, rising and spreading: little puffs of mist, thinning as they go)
  const away = head[0] < back[0] ? 1 : -1;
  for (let j = 0; j < 22; j++) {
    const age = (t * 0.5 + hash(j, 1, 21)) % 1;
    const from = hash(j, 2, 21);
    const sx = back[0] + (tailEnd[0] - back[0]) * from + (hash(j, 3, 21) - 0.5) * 14;
    const sy = back[1] + (tailEnd[1] - back[1]) * from - 3 + (hash(j, 4, 21) - 0.5) * 10;
    const cx = sx + away * age * 34;
    const cy = sy - age * 18 - Math.sin(age * 5 + j) * 2;
    const r = 1.4 + age * 3.2;
    const col = age < 0.3 ? MIST[4] : age < 0.65 ? MIST[3] : MIST[2];
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r * 1.4); x <= cx + r * 1.4; x++) {
        const q = Math.hypot((x - cx) / 1.4, y - cy) / r;
        if (q > 1) continue;
        if (age > 0.3 && (x + y) % 2) continue;
        if (q > 0.6 && hash(x, y, 29 + j) < 0.5 + age * 0.4) continue;
        set(x, y, col);
      }
    }
  }
}
