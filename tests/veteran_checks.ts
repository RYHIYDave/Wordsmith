// THE VETERAN'S JOINT RULE, and (below) NOTHING OF HIM THROUGH WHAT HE WEARS. THE JOINT RULE (his 22:43, 2 Nov 2026:
// “Make sure his limbs all face the correct way, don’t make mistakes”; at 22:44: “It can be over the top, I just don’t want
// his foot facing backwards or something”): every joint of one pose of him inside what a body can do. Used by
// tests/veteran.test.ts and by the tools that look at his poses.

import type { VetFigure, VetPose } from '../src/dev/sculpt_veteran';
import { VET_BUILD, VET_FIST, VET_GREY, VET_SKIN } from '../src/dev/sculpt_veteran';
import type { Skeleton, V3 } from '../src/art/skeleton';
import { trunkOf } from '../src/art/skeleton';
import { primDist } from '../src/dev/sculpt';
import type { Drawn, Prim } from '../src/dev/sculpt';

export const sub3 = (a: readonly number[], b: readonly number[]): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot3 = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len3 = (a: readonly number[]): number => Math.hypot(a[0], a[1], a[2]);
export const unit = (a: readonly number[]): V3 => {
  const n = len3(a) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
export const cross3 = (a: readonly number[], b: readonly number[]): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const perp = (v: readonly number[], to: readonly number[]): V3 => {
  const u = unit(to);
  const k = dot3(v, u);
  return [v[0] - u[0] * k, v[1] - u[1] * k, v[2] - u[2] * k];
};
export const angleAt = (a: readonly number[], mid: readonly number[], b: readonly number[]): number => {
  const u = unit(sub3(a, mid));
  const v = unit(sub3(b, mid));
  return (Math.acos(Math.max(-1, Math.min(1, dot3(u, v)))) * 180) / Math.PI;
};
/** How far a joint sticks out from the line between its two ends (the way it bends), and how bent it is. */
export const poleOf = (a: readonly number[], mid: readonly number[], b: readonly number[]): V3 => {
  const ab = sub3(b, a);
  const t = dot3(sub3(mid, a), ab) / (dot3(ab, ab) || 1);
  return sub3(mid, [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]);
};

/** EVERY JOINT INSIDE WHAT A BODY CAN DO, in one pose of him. */
export function jointFindings(s: Skeleton, p: VetPose): string[] {
  const out: string[] = [];
  const b = { twist: 0, bend: 0, side: 0, ...p.bones } as { twist: number; bend: number; side: number; hunch?: number };
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ank = side === 'L' ? s.ankleL : s.ankleR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    // THE KNEE: folds no tighter than a knee does, never past straight, and only toward where the toes point
    const kA = angleAt(hip, knee, ank);
    if (kA < 25) out.push(`${side} knee folded to ${kA.toFixed(0)}°`);
    const foot = sub3(toe, heel);
    const aA0 = angleAt(knee, ank, toe);
    if (kA < 168 && aA0 < 125) {
      const pole = unit(poleOf(hip, knee, ank));
      const ff = unit(perp(foot, sub3(ank, knee)));
      if (dot3(pole, ff) < -0.1) out.push(`${side} knee bends against its foot (${dot3(pole, ff).toFixed(2)})`);
    }
    // THE ANKLE: the foot tipped no further than a foot goes, up toward the shin or down to a point
    const aA = angleAt(knee, ank, toe);
    if (aA < 55 || aA > 172) out.push(`${side} ankle at ${aA.toFixed(0)}°`);
    // THE FOOT never facing backwards from his hips
    const hf = s.hips[0];
    const fh = unit([foot[0], foot[1], 0]);
    const hh = unit([hf[0], hf[1], 0]);
    const fa = (Math.acos(Math.max(-1, Math.min(1, dot3(fh, hh)))) * 180) / Math.PI;
    if (fa > 110 && Math.min(toe[2], heel[2]) < 6) out.push(`${side} foot turned ${fa.toFixed(0)}° from his hips`);
  }
  const [cf, cl] = s.chest;
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    // THE ELBOW: folds no tighter than an arm does, never past straight; never bent backward (pointing forward as the
    // fist reaches forward), never pointing into his own body
    const eA = angleAt(sh, el, ha);
    if (eA < 20) out.push(`${side} elbow folded to ${eA.toFixed(0)}°`);
    if (eA < 165) {
      const pole = unit(poleOf(sh, el, ha));
      void cf;
      const inward = side === 'L' ? [-cl[0], -cl[1], -cl[2]] : cl;
      if (dot3(pole, inward) > 0.85) out.push(`${side} elbow points into his body`);
      // THE FIST: turned as a forearm turns (palm toward the biceps, in, or away; never turned out past that)
      const d = unit(sub3(ha, el));
      const ant = unit(perp(sub3(sh, el), d));
      const lat = side === 'R' ? cross3(d, ant) : cross3(ant, d);
      const palm = (side === 'L' ? p.palmL : p.palmR) as V3;
      if (palm && dot3(unit(perp(palm, d)), lat) > 0.55) out.push(`${side} fist turned past what a forearm turns (${dot3(unit(perp(palm, d)), lat).toFixed(2)})`);
    }
  }
  // THE SPINE AND NECK: never twisted, bent or tipped past what a back does; the head turned no further than a neck turns
  if (Math.abs(b.twist) > 62) out.push(`spine twisted ${b.twist.toFixed(0)}°`);
  if (b.bend < -36 || b.bend > 52) out.push(`spine bent ${b.bend.toFixed(0)}°`);
  if (Math.abs(b.side) > 32) out.push(`spine bent over sideways ${b.side.toFixed(0)}°`);
  if ((b.hunch ?? 0) > 30) out.push(`back hunched ${b.hunch}°`);
  const nf = unit([s.face[0][0], s.face[0][1], 0]);
  const uf = unit([s.upper[0][0], s.upper[0][1], 0]);
  const neck = (Math.acos(Math.max(-1, Math.min(1, dot3(nf, uf)))) * 180) / Math.PI;
  if (neck > 95) out.push(`head turned ${neck.toFixed(0)}° from his chest`);
  // LEFT IS LEFT: his left shoulder and hip on his left
  if (dot3(sub3(s.shoulderL, s.shoulderR), s.upper[1]) <= 0) out.push('shoulders swapped');
  if (dot3(sub3(s.hipL, s.hipR), s.hips[1]) <= 0) out.push('hips swapped');
  return out;
}


// =============================================================================================
// NOTHING OF HIM THROUGH WHAT HE WEARS. His words, 3 Nov 2026, 18:07: “Well first off the brawlers knees are clipping
// through his pants which is against the rules which I reminded you to follow multiple times”. His art rules: nothing
// passes through the body, and cloth follows the body it covers. So, in a picture of him: WHEREVER A GARMENT COVERS HIM,
// NO PIXEL OF HIM MAY SHOW, through the cloth or past its outline. Each pixel of his skin (and of his grey crop, under the
// headband) is put back where it is on him (the point the eye's ray met), and asked which part of him it is (the nearest of
// his solids of that stuff) and whether something he wears covers that part there:
// - THE TROUSERS: the whole thigh, from the hip, and the knee and the shin down to the ragged hem (hacked off 0.14 of the
//   way from the knee to the ankle); the lower belly under the belt (the seat).
// - THE BELT, round his waist below the vest's hem (it and the seat cover all of his trunk below it).
// - THE VEST: his trunk above its hem, all round but the open V down his front (as the vest is cut: either side of the
//   line 4.4 out from the neck's front, sloping 0.8 up to the side; the back panel behind the middle of his ribs).
// - THE SHIN WRAP: his right shin, from 0.3 of the way from the knee to the ankle, down to the ankle.
// - THE BRACERS: each forearm from 0.3 to 0.8 of the way from the elbow to the fist.
// - THE KNUCKLE STRAPS: the band round the hand at the knuckles (1.95 fist-sizes on from the hand's point, 0.42 either
//   side; the thumb lies over it) and the band round the wrist (-0.3 to 0.5).
// - THE HEADBAND: round his head between its two slanting lines (0.3 and 0.58 of the head's height up, tipped 0.16 back).
// (The numbers are the design's, as dev/sculpt_veteran.ts cuts each garment; each zone is kept MARGIN inside its edges.)

/** Where each garment of his is cut (dev/sculpt_veteran.ts). */
export const COVERS = {
  hem: 0.14,
  vest: { gap: 4.4, slope: 0.8, hem: 0.35, back: 0.1 },
  wrap: [0.3, 0.95],
  bracer: [0.3, 0.8],
  knuckles: [1.95 - 0.42, 1.95 + 0.42],
  wrist: [-0.3, 0.5],
  band: { lo: 0.3, hi: 0.58, tilt: 0.16 },
};
/** How far inside a zone's edge a point must be to be judged (the cloth's own edge is drawn there). */
export const MARGIN = 0.45;
const lerp = (a: readonly number[], b: readonly number[], t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** What he wears that covers a point of him (`p`, as he was built) that is a part of `q`, or null where he is bare. */
function coverOf(fig: VetFigure, q: Prim, p: V3, ctx: ReturnType<typeof contextOf>): string | null {
  const s = fig.s;
  const tag = q.tag ?? '';
  const M = MARGIN;
  if (q.piece === 'legL' || q.piece === 'legR') {
    const L = q.piece === 'legL' ? ctx.legs.L : ctx.legs.R;
    if (tag === 'thigh' || tag === 'quad') return 'the trousers';
    if (tag === 'shin' || tag === 'calf') {
      const below = dot3(sub3(p, L.knee), L.d);
      if (below < L.hem - M) return 'the trousers';
      const t = below / L.long;
      if (q.piece === 'legR' && t > COVERS.wrap[0] + M / L.long && t < COVERS.wrap[1]) return 'the shin wrap';
    }
    // (round each ankle, a band of linen as high as the ankle wrap is; round each arch, the foot wrap's band)
    if (tag === 'shin' || tag === 'calf' || tag === 'instep' || tag === 'foot') {
      const v = sub3(p, L.ankle);
      if (v[2] > -0.2 + M && v[2] < 1.0 - M && Math.hypot(v[0], v[1]) < VET_BUILD.legR[2] + 0.4 - M) return 'the ankle wrap';
    }
    if ((tag === 'foot' || tag === 'instep' || tag === 'toes') && L.wrap) {
      const W = L.wrap;
      const a = W.axes[0];
      const n = len3(a);
      if (Math.abs(dot3(sub3(p, W.c), a)) / n < n - M) return 'the foot wrap';
    }
    return null;
  }
  if (q.piece === 'torso') {
    const v = ctx.vest;
    const up = dot3(p, v.r2);
    if (up < v.hemUp - M) return 'the belt and the seat';
    if (up < v.hemUp + M) return null;
    const a = dot3(sub3(p, v.T), v.mL);
    const b = dot3(sub3(p, v.T), v.mR);
    if (a >= v.gap + M || b >= v.gap + M || dot3(p, v.rf) <= v.backAt - M) return 'the vest';
    return null;
  }
  if (q.piece === 'armL' || q.piece === 'armR') {
    const A = q.piece === 'armL' ? ctx.arms.L : ctx.arms.R;
    if (tag === 'fore' || tag === 'foreBulge') {
      const t = dot3(sub3(p, A.el), A.d) / A.long;
      if (t > COVERS.bracer[0] + M / A.long && t < COVERS.bracer[1] - M / A.long) return 'the bracer';
      return null;
    }
    // (the straps are round his hand: the fist's block, its curled fingers and knuckles, the wrist into it; the thumb lies over them)
    if (!['fist', 'fingers', 'knuckle', 'wrist'].includes(tag)) return null;
    const k = dot3(sub3(p, A.ha), A.d) / VET_FIST.k;
    const m = M / VET_FIST.k;
    if (k > COVERS.knuckles[0] + m && k < COVERS.knuckles[1] - m) return 'the knuckle strap';
    if (k > COVERS.wrist[0] + m && k < COVERS.wrist[1] - m) return 'the wrist strap';
    return null;
  }
  if (q.piece === 'head') {
    if (tag === 'neck') return null;
    const h = dot3(sub3(p, s.head), ctx.band.m) / VET_BUILD.headR[2];
    const m = M / VET_BUILD.headR[2];
    if (h > COVERS.band.lo + m && h < COVERS.band.hi - m) return 'the headband';
    return null;
  }
  return null;
}

/** What the zones are worked out from, once a figure. */
function contextOf(fig: VetFigure) {
  const s = fig.s;
  const B = VET_BUILD;
  const leg = (side: 'L' | 'R') => {
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const long = len3(sub3(ankle, knee));
    // (the foot wrap's own band along the foot, as it is laid on)
    const wrap = fig.sc.prims.find((q) => q.tag === 'footwrap' && q.piece === `leg${side}`) as (Prim & { k: 'box' }) | undefined;
    return { knee, ankle, d: unit(sub3(ankle, knee)), long, hem: long * COVERS.hem, wrap };
  };
  const arm = (side: 'L' | 'R') => {
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    return { el, ha, d: unit(sub3(ha, el)), long: len3(sub3(ha, el)) };
  };
  const [ribs, belly] = trunkOf(B, s);
  const [rf, rl, ru] = ribs.r;
  const T = [s.neck[0] + rf[0] * ribs.h[0] * 0.55 - ru[0] * 0.8, s.neck[1] + rf[1] * ribs.h[0] * 0.55 - ru[1] * 0.8, s.neck[2] + rf[2] * ribs.h[0] * 0.55 - ru[2] * 0.8] as V3;
  const mOf = (side: number): V3 => {
    const m: V3 = [rl[0] * side + ru[0] * COVERS.vest.slope, rl[1] * side + ru[1] * COVERS.vest.slope, rl[2] * side + ru[2] * COVERS.vest.slope];
    const n = len3(m);
    return [m[0] / n, m[1] / n, m[2] / n];
  };
  const r2 = belly.r[2];
  const hemAt = lerp(belly.c, [belly.c[0] - r2[0], belly.c[1] - r2[1], belly.c[2] - r2[2]], belly.h[2] * COVERS.vest.hem);
  const backAt = dot3(ribs.c, rf) + ribs.h[0] * COVERS.vest.back;
  const n = len3([rl[0] + ru[0] * COVERS.vest.slope, rl[1] + ru[1] * COVERS.vest.slope, rl[2] + ru[2] * COVERS.vest.slope]);
  const [hf, , hu] = s.face;
  const bm = unit([hu[0] - hf[0] * COVERS.band.tilt, hu[1] - hf[1] * COVERS.band.tilt, hu[2] - hf[2] * COVERS.band.tilt]);
  return {
    legs: { L: leg('L'), R: leg('R') },
    arms: { L: arm('L'), R: arm('R') },
    vest: { T, mL: mOf(1), mR: mOf(-1), gap: COVERS.vest.gap / n, r2, hemUp: dot3(hemAt, r2), rf, backAt },
    band: { m: bm },
  };
}

/** The point of him a pixel shows (as he was built, before he was turned), from where it is on the canvas and how near. */
function pointAt(d: Drawn, k: number, w: number, ax: number, ay: number, turn: number): V3 {
  const x = k % w;
  const y = (k - x) / w;
  const sx = x + 0.5 - ax;
  const sy = y + 0.5 - ay;
  const t = d.z[k];
  const bk = d.st.back;
  const q: V3 = [bk[0][0] * sx + bk[0][1] * sy + bk[0][2] * t, bk[1][0] * sx + bk[1][1] * sy + bk[1][2] * t, bk[2][0] * sx + bk[2][1] * sy + bk[2][2] * t];
  const a = (-turn * Math.PI) / 180;
  return [q[0] * Math.cos(a) - q[1] * Math.sin(a), q[0] * Math.sin(a) + q[1] * Math.cos(a), q[2]];
}

/**
 * NOTHING OF HIM THROUGH WHAT HE WEARS, in one picture of him (`paintVeteran(p, turn)`, its floor point at `ax`, `ay`):
 * for each garment, how many pixels of him show where it covers him (and which part of him the first is), or nothing.
 */
export function coverFindings(d: Drawn & { fig: VetFigure }, turn: number, ax: number, ay: number): string[] {
  const sc = d.fig.sc;
  const w = d.px.w;
  const ctx = contextOf(d.fig);
  // (his skin, his fists' skin, and his grey crop: what may not show through)
  const shown = new Set<number>();
  sc.mats.forEach((m, i) => {
    if (m.ramp === VET_SKIN || m.ramp === VET_GREY) shown.add(i);
  });
  const byMat = new Map<number, Prim[]>();
  for (const q of sc.prims) {
    if (q.carve || !shown.has(q.mat)) continue;
    if (!byMat.has(q.mat)) byMat.set(q.mat, []);
    (byMat.get(q.mat) as Prim[]).push(q);
  }
  const found = new Map<string, { n: number; first: string }>();
  for (let k = 0; k < d.stuff.length; k++) {
    const m = d.stuff[k];
    if (m < 0 || !shown.has(m) || d.px.d[k * 4 + 3] === 0) continue;
    const p = pointAt(d, k, w, ax, ay, turn);
    let best: Prim | null = null;
    let bd = Infinity;
    for (const q of byMat.get(m) ?? []) {
      const dd = primDist(q, p);
      if (dd < bd) {
        bd = dd;
        best = q;
      }
    }
    if (!best) continue;
    const by = coverOf(d.fig, best, p, ctx);
    if (!by) continue;
    const f = found.get(by);
    if (f) f.n++;
    else found.set(by, { n: 1, first: `${best.piece}/${best.tag ?? best.k} at ${k % w},${Math.floor(k / w)}` });
  }
  return [...found].map(([by, f]) => `${f.n} pixels of him through ${by} (${f.first})`);
}
