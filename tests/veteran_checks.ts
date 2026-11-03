// THE VETERAN'S JOINT RULE (his 22:43, 2 Nov 2026: “Make sure his limbs all face the correct way, don’t make mistakes”;
// at 22:44: “It can be over the top, I just don’t want his foot facing backwards or something”): every joint of one pose
// of him inside what a body can do. Used by tests/veteran.test.ts and by the tools that look at his poses.

import type { VetPose } from '../src/dev/sculpt_veteran';
import type { Skeleton, V3 } from '../src/art/skeleton';

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

