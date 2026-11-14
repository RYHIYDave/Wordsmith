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
import { add, mul, norm } from '../art/skeleton';
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

/** THE TROLL CHIEFTAIN, standing (for now), seen `view`; `breath` 0 to 1 his chest's rise. */
export function sculptChief9(view: GameView, breath = 0, yaw = -10): Drawn {
  const sc = new Sculpt();
  const { F, L, U, P, X } = frame(yaw);
  const loc = (p: V3): [number, number, number] => [dot3(p, F) / CK, dot3(p, L) / CK, p[2] / CK];
  const b = breath * 1.2;
  // HIS HIDE: mottled; darker down his back; his war paint where it is on him
  const hide = sc.mat({
    ramp: HIDE,
    paint: (h) => {
      const [f, l, u] = loc(h.p);
      const n = hash(Math.floor(h.p[0] / 5), Math.floor(h.p[1] / 5) + Math.floor(h.p[2] / 5) * 7, 3);
      // (war paint, on his front only: a jagged white band across his chest, a red handprint over his heart)
      if (f > 8 && h.prim.tag === 'chest') {
        const zig = 64 + b + 2.2 * Math.abs(((l + 40) % 8) - 4) - 4;
        if (Math.abs(u - zig) < 1.3) return PAINT_WHITE;
        const hx = l - 9;
        const hy = u - 56 - b;
        if (hx > -4 && hx < 4 && hy > -4 && hy < 3) {
          const finger = hy > 0 && Math.abs(((hx + 4) % 2) - 1) < 0.5;
          if (hy <= 0 || finger) return PAINT_RED;
        }
      }
      if (h.prim.tag === 'face') {
        // (a band of red over his brow; two white streaks down from under each eye)
        // (a band of red across his eyes, like a mask; two white streaks down from under each eye)
        if (u > 87.6 + b && u < 91.6 + b && f > 28 && Math.abs(l) > 1.6) return PAINT_RED;
        if (f > 28 && u > 82 + b && u < 87.6 + b && (Math.abs(l - 4.4) < 0.8 || Math.abs(l + 4.4) < 0.8)) return PAINT_WHITE;
      }
      // (three white slashes of war paint down his back)
      if (f < -10 && u > 58 && u < 84) for (const k of [-9, 0, 9]) if (Math.abs(l - k - (u - 70) * 0.35) < 1.2) return PAINT_WHITE;
      const back = f < -4 ? 1 : 0;
      if (n < 0.18) return shadeOf(HIDE, h.tone - 1 - back);
      return back ? shadeOf(HIDE, h.tone - 1) : null;
    },
  });
  const kilt = sc.mat({
    ramp: KILT,
    paint: (h) => {
      // (its hide spotted; its fur ragged at the hem)
      const n = hash(Math.floor(h.p[0] / 2.5), Math.floor(h.p[1] / 2.5) + Math.floor(h.p[2] / 2.5) * 13, 9);
      if (n < 0.16) return shadeOf(KILT, h.tone - 1);
      if (n > 0.92) return shadeOf(KILT, h.tone + 1);
      return null;
    },
  });
  const leather = sc.mat({ ramp: LEATHER });
  const fur = sc.mat({ ramp: FUR9, paint: (h) => (hash(Math.floor(h.p[0] / 1.5), Math.floor(h.p[2] / 1.2), 19) < 0.3 ? shadeOf(FUR9, h.tone - 1) : null) });
  const bone = sc.mat({
    ramp: BONE9,
    paint: (h) => {
      // (a skull's sockets and its nose, dark)
      if (h.prim.tag === 'skull') {
        const [f, l, u] = loc(h.p);
        const c = loc((h.prim as { c: V3 }).c);
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

  // HIS LEGS: short and thick, his knees bent under his weight, his feet wide and flat
  for (const s of [1, -1]) {
    const piece = s > 0 ? 'legL' : 'legR';
    sc.cone(hide, piece, P(-2, s * 15, 36), P(4, s * 17, 18), 12, 10, 2.4);
    sc.cone(hide, piece, P(4, s * 17, 18), P(1, s * 18, 5), 10, 8.5, 2.4);
    sc.ell(hide, piece, P(6, s * 18.5, 3.6), X(12, 8, 4), 1.6, { tag: 'foot' });
    // (his toes: three blunt lumps)
    for (const k of [-1, 0, 1]) sc.ell(hide, piece, P(16, s * 18.5 + k * 3.6, 2.4), X(3, 2, 2.2), 0.6);
  }
  // HIS HIPS AND BELLY: the belly hanging over his belt
  sc.ell(hide, 'body', P(-2, 0, 40), X(16, 22, 13), 3.0);
  sc.ell(hide, 'body', P(8, 0, 48 + b * 0.5), X(17, 21, 15), 3.0, { tag: 'chest' });
  // HIS CHEST: a great barrel, hunched forward
  sc.ell(hide, 'body', P(4, 0, 64 + b), X(17, 27, 17), 3.4, { tag: 'chest' });
  sc.ell(hide, 'body', P(-6, 0, 72 + b), X(16, 25, 15), 3.4);
  // (his hump: the top of his back thrust up behind his head)
  sc.ell(hide, 'body', P(-4, 0, 82 + b), X(13, 18, 9), 3.0);
  // HIS SHOULDERS, boulders; his arms long, down past his knees
  for (const s of [1, -1]) {
    const piece = s > 0 ? 'armL' : 'armR';
    sc.ell(hide, piece, P(0, s * 29, 80 + b), X(13, 12, 12), 2.8);
    const elbow = P(4, s * 37, 56 + b);
    sc.cone(hide, piece, P(1, s * 31, 78 + b), elbow, 10, 8.5, 2.6);
    const wrist = P(12, s * 35, 32);
    sc.cone(hide, piece, elbow, wrist, 10.5, 8, 2.6);
    // (his forearm thicker than his upper arm: the swell of it)
    sc.ell(hide, piece, add(mul(elbow, 0.55), mul(wrist, 0.45)), X(10, 10, 11), 2.0);
  }
  // HIS FISTS: like anvils; his right round the club's handle, his left hanging, half shut; IRON CUFFS round his wrists
  sc.box(hide, 'fistL', P(14, 34, 24), X(8, 7, 8), 4.2, 1.6, { tag: 'fist' });
  sc.box(hide, 'fistR', P(14, -34, 24), X(8.5, 7, 8.5), 4.2, 1.6, { tag: 'fist' });
  for (const s of [1, -1]) sc.cone(iron, s > 0 ? 'cuffL' : 'cuffR', P(11.6, s * 35, 36.5), P(12.6, s * 34.8, 33), 8.6, 8.5, 0.4);
  // HIS HEAD: thrust forward and low between his shoulders; a heavy brow, an underbite, two tusks, little ears
  const HF = 6;
  sc.cone(hide, 'body', P(6, 0, 82 + b), P(15 + HF, 0, 85 + b), 12, 10, 3.0);
  sc.ell(hide, 'head', P(19 + HF, 0, 88 + b), X(10.5, 10.5, 10), 2.4, { tag: 'face' });
  sc.ell(hide, 'head', P(26 + HF, 0, 93 + b), X(3.4, 9.5, 2.6), 1.6, { tag: 'face' });
  sc.ell(hide, 'head', P(26.5 + HF, 0, 81 + b), X(7, 9.5, 5), 1.8, { tag: 'face' });
  // (his nose: broad and flat)
  sc.ell(hide, 'head', P(29 + HF, 0, 87 + b), X(2.6, 3.2, 2.8), 1.0, { tag: 'face' });
  for (const s of [1, -1]) sc.cone(hide, 'ear', P(16 + HF, s * 9.5, 90 + b), P(13 + HF, s * 15.5, 93 + b), 2.8, 0.8, 1.0);
  for (const s of [1, -1]) sc.ell(eye, 'eye', P(29.2 + HF, s * 4.4, 89.6 + b), X(1.6, 2.1, 1.5), 0.2);
  for (const s of [1, -1]) sc.cone(bone, 'tusk', P(32 + HF, s * 6, 81.5 + b), P(34 + HF, s * 7.6, 90 + b), 2.2, 0.5, 0.3);
  // HIS NECKLACE: teeth and finger bones on a thong, hanging over his chest
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 62 * D;
    const at = P(19 * Math.cos(a) + 2, 23 * Math.sin(a), 74 + b - 6 * Math.cos(a));
    sc.cone(bone, 'neck', at, add(at, P(1.2, 0, -4.4 - (i % 2) * 1.6)), 1.2, 0.4, 0.3);
  }
  // HIS BELT, wide leather, an iron boss on it; HIS KILT of hide in ragged flaps, the front and back ones longest
  sc.ell(leather, 'belt', P(-0.5, 0, 37), X(21.5, 25.2, 4.2), 0.6, { tag: 'belt' });
  sc.ell(iron, 'boss', P(21.2, 0, 37.4), X(2, 4.2, 4.2), 0.4);
  for (let i = 0; i < 18; i++) {
    const a = ((i + 0.5) / 18) * 360 * D;
    const rad = (k: number): V3 => add(mul(F, Math.cos(a) * (17 + k)), mul(L, Math.sin(a) * (21.5 + k)));
    const long = 9 + 5 * Math.abs(Math.cos(a)) + hash(i, 1, 41) * 4;
    sc.cone(i % 3 === 1 ? fur : kilt, `kilt${i % 2}`, add(rad(0), [0, 0, 36]), add(rad(3.5), [0, 0, 36 - long * (i % 3 === 1 ? 0.75 : 1)]), 4.6, 1.2, 0.3);
  }
  // (his spine: a ridge of knobs down from his hump)
  for (let i = 0; i < 4; i++) sc.ell(hide, 'body', P(-17.5 + i * 0.6, 0, 86 - i * 6.5 + b), X(3.4, 4.2, 3.2), 1.4);
  // HIS CROWN: a circlet of bone round his head, two great antlers branching up and out of it, three skulls along its front
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 360 * D;
    sc.ell(bone, 'crown', P(21 + 9.2 * Math.cos(a), 9.2 * Math.sin(a), 97.5 - 1.5 * Math.cos(a) + b), X(2.4, 2.4, 1.7), 0.6);
  }
  for (const s of [1, -1]) {
    const pts: V3[] = [P(18, s * 8, 98.5 + b), P(16, s * 13, 105 + b), P(14, s * 19, 113 + b), P(12, s * 22, 123 + b), P(9, s * 21, 132 + b)];
    for (let i = 1; i < pts.length; i++) sc.cone(bone, `antler${s > 0 ? 'L' : 'R'}`, pts[i - 1], pts[i], 2.6 - i * 0.35, 2.6 - (i + 1) * 0.35, 0.8);
    for (const [j, df, dl, du] of [[1, 3, 1, 7], [2, -4, 3, 6], [3, 3, -2, 7], [2, 5, 4, 3]] as const) sc.cone(bone, `antler${s > 0 ? 'L' : 'R'}`, pts[j], add(pts[j], P(df, s * dl, du)), 1.4, 0.4, 0.5);
  }
  for (const [l, u] of [[-6.4, 100.5], [0, 102], [6.4, 100.5]] as const) sc.ell(bone, 'crown', P(25 + (l === 0 ? 1 : 0), l, u + b), X(2.8, 2.6, 3), 0.4, { tag: 'skull' });
  // HIS CLUB: a tree's trunk, its handle in his right fist, its great head leant on the floor before him
  const top = P(6, -31, 42);
  const end = P(40, -47, 9);
  sc.cone(bark, 'club', top, end, 3.6, 9.5, 0.8, { tag: 'trunk' });
  const along = (k: number): V3 => add(mul(top, 1 - k), mul(end, k));
  sc.cone(bark, 'club', along(0.66), add(along(0.66), P(2, -6, 7)), 2.6, 1.6, 0.8);
  sc.cone(bark, 'club', along(0.84), add(along(0.84), P(-4, 6, 6)), 2.8, 1.8, 0.8);
  grow(sc, CK);
  return draw(sc, view, CHIEF9_CANVAS.ax, CHIEF9_CANVAS.ay, CHIEF9_CANVAS, undefined, ENEMY_RIM);
}

// THE WOLF'S COLOURS: a pale mist, a ghost's: near white at its brightest, a cold violet in its shadow
const MIST: Ramp = ['#4a4664', '#6c688a', '#9692b2', '#c6c2da', '#eeecf8'];
const FANG: Ramp = ['#6a6458', '#9a9284', '#c4baa8', '#e2dac8', '#f6f0e4'];
const MOUTH: Ramp = ['#1a0a18', '#2c1028', '#4a1a3a', '#6a2a50', '#8a3a66'];
/** Its size: twice a fog wolf's (his pick); its shoulder near the knight's head. */
const WK = 0.82;

/** THE MIST WOLF, standing (for now), seen `view`; `t` seconds into its stand (its mist streams). Seen from its side and a little ahead. */
export function sculptWolf9(view: GameView, t = 0, yaw = 42): Drawn {
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
  const loc = (p: V3): [number, number, number] => [dot3(p, fr.F) / WK, dot3(p, fr.L) / WK, p[2] / WK];
  // ITS MIST: streaked along it like fur, back from its head (long thin streaks); darker under
  const mist = sc.mat({
    ramp: MIST,
    paint: (h) => {
      const [f, l, u] = loc(h.p);
      const row = Math.floor((u + 200) / 1.1) + Math.floor((l + 200) / 2.5) * 37;
      const streak = hash(row, Math.floor((f + 200 + hash(row, 0, 2) * 6) / 6), 5);
      if (u < 46 && streak < 0.45) return shadeOf(MIST, h.tone - 1);
      if (streak < 0.14) return shadeOf(MIST, h.tone - 1);
      if (streak > 0.86) return shadeOf(MIST, h.tone + 1);
      return null;
    },
  });
  const fang = sc.mat({ ramp: FANG });
  const mouth = sc.mat({ ramp: MOUTH });
  const eye = sc.mat({ ramp: EYE, paint: (h) => (h.tone >= 3 ? EYE[4] : EYE[2]) });
  // ITS BODY: a deep chest under a heavy ruff, a lean waist tucked up, its haunch
  ell(mist, 'body', P(23, 0, 59), X(16, 13, 20), 4.6);
  ell(mist, 'body', P(2, 0, 65), X(17, 9.5, 10), 3.6);
  ell(mist, 'body', P(-20, 0, 63), X(14, 12, 13.5), 3.2);
  // (its ruff: the mist piled up round its neck and shoulders, in tufts, melted into it)
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 80 * D;
    ell(mist, 'body', P(30 + 2 * Math.cos(a), 12 * Math.sin(a), 71 + 5 * Math.cos(a)), X(7, 5.5, 8), 4.4);
  }
  // ITS NECK AND HEAD: long, low and forward; a broad skull, a long snout
  cone(mist, 'body', P(34, 0, 70), P(45, 0, 77), 10.5, 8.5, 3.0);
  ell(mist, 'head', P(50, 0, 79), X(10, 9.5, 9), 2.6);
  // (its cheeks: tufts of mist swept back)
  for (const s of [1, -1]) ell(mist, 'head', P(46, s * 7.5, 74), X(6.5, 3.6, 5.5), 1.6);
  // (its snout, long; its nose; its jaws a little open, white fangs)
  cone(mist, 'head', P(55, 0, 79), P(72, 0, 74.5), 6.6, 3.8, 2.4);
  ell(mouth, 'nose', P(73.2, 0, 75.8), X(2.4, 2.6, 2.0), 0.6);
  cone(mist, 'jaw', P(53, 0, 72), P(69, 0, 68.6), 4.6, 2.4, 1.6);
  cone(mouth, 'mouth', P(56, 0, 73.4), P(70, 0, 71.4), 3.0, 1.4, 0.6);
  for (const s of [1, -1]) {
    cone(fang, 'fang', P(69, s * 2.3, 73.8), P(69.8, s * 2.3, 70.2), 1.1, 0.3, 0.2);
    cone(fang, 'fang', P(66.5, s * 2.0, 69.4), P(67, s * 1.9, 72.6), 1.0, 0.3, 0.2);
  }
  // (its ears laid back, flat to its skull)
  for (const s of [1, -1]) cone(mist, 'ear', P(47, s * 5.5, 86), P(37, s * 9, 90), 4.4, 0.6, 1.0);
  // (its brow, heavy; its eyes burning under it)
  ell(mist, 'head', P(55, 0, 83), X(4, 7.5, 2.4), 1.4);
  for (const s of [1, -1]) ell(eye, 'eye', P(57.4, s * 4.8, 81.4), X(1.9, 1.7, 1.4), 0.2);
  // ITS LEGS: long and lean; its front legs planted under its chest, its hind legs bent at the hock; its far legs a step apart
  for (const s of [1, -1]) {
    const k = s > 0 ? -5 : 0;
    const pf = s > 0 ? 'legFL' : 'legFR';
    cone(mist, pf, P(26 + k, s * 8, 52), P(22 + k, s * 8.5, 31), 7, 4.2, 2.4);
    cone(mist, pf, P(22 + k, s * 8.5, 31), P(25 + k, s * 8.5, 9), 4.0, 2.8, 1.6);
    cone(mist, pf, P(25 + k, s * 8.5, 9), P(28 + k, s * 8.5, 4), 2.8, 2.8, 1.2);
    ell(mist, pf, P(30 + k, s * 8.5, 3.0), X(4.8, 3.2, 2.8), 1.2);
    const ph = s > 0 ? 'legHL' : 'legHR';
    cone(mist, ph, P(-21 - k, s * 8.5, 58), P(-12 - k, s * 9.5, 36), 9, 5, 2.6);
    cone(mist, ph, P(-12 - k, s * 9.5, 36), P(-28 - k, s * 8.5, 17), 4.8, 3.2, 1.8);
    cone(mist, ph, P(-28 - k, s * 8.5, 17), P(-25 - k, s * 8.5, 5), 3.0, 2.8, 1.2);
    ell(mist, ph, P(-21.5 - k, s * 8.5, 3.0), X(4.8, 3.2, 2.8), 1.2);
  }
  // (its mist hanging from under its chest and belly in a ragged fringe, thinning to nothing)
  for (let i = 0; i < 9; i++) {
    const f = 30 - i * 5.5;
    const u = i < 3 ? 42 + i * 3 : 54;
    for (const s of [1, -1]) cone(mist, 'body', P(f, s * 5, u + 2), P(f - 4, s * 6, u - 10 - (i % 3) * 3), 3.4, 0.7, 1.6);
  }
  // ITS TAIL: long and heavy, hanging in a curve, bushy, its end fraying into mist
  const tail: V3[] = [P(-31, 0, 68), P(-43, 0, 64), P(-53, 0, 56), P(-59, 0, 46), P(-61, 0, 36)];
  const tr = [4.5, 6.5, 7.5, 6.5, 3.5];
  for (let i = 1; i < tail.length; i++) cone(mist, 'tail', tail[i - 1], tail[i], tr[i - 1], tr[i], 2.4);
  const drawn = draw(sc, view, WOLF9_CANVAS.ax, WOLF9_CANVAS.ay, WOLF9_CANVAS, undefined, ENEMY_RIM);
  const tailEnd = drawn.st.at(tail[tail.length - 1]);
  const back = drawn.st.at(P(-30, 0, 72));
  const head = drawn.st.at(P(40, 0, 80));
  seeThrough(drawn, t, tailEnd, back, head);
  return drawn;
}

/**
 * ITS MIST, SEE-THROUGH AND STREAMING: its edges, its lower legs and its tail's end thinned to a mist (in drifting patches, every
 * other pixel and then none) so the floor shows through; wisps streaming off its back and tail, away from its head; its mist lying
 * on the floor round its feet.
 */
function seeThrough(d: Drawn, t: number, tailEnd: readonly number[], back: readonly number[], head: readonly number[]): void {
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
      const low = Math.max(0, Math.min(1, (y - (WOLF9_CANVAS.ay - 44)) / 44));
      const dt = Math.hypot(x - tailEnd[0], y - tailEnd[1]);
      const tip = Math.max(0, Math.min(1, 1 - dt / 26));
      const n = hash(Math.floor((x - (head[0] < back[0] ? -1 : 1) * t * 10) / 4), Math.floor(y / 3), 11) * 0.65 + hash(x, y, 13) * 0.35;
      const thin = 0.34 * low * low + 0.45 * tip + 0.1 * edge[y * W + x] / 3;
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
  for (let y = WOLF9_CANVAS.ay - 10; y <= WOLF9_CANVAS.ay + 12; y++) {
    for (let x = Math.round(fx - 90); x <= fx + 90; x++) {
      const r = Math.hypot((x - fx) / 80, (y - WOLF9_CANVAS.ay) / 11);
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
