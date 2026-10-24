// PARTS OF A BODY, sculpted (art/sdf.ts), for the opening's figures (art/opening.ts): hands with fingers and knuckles,
// forearms that swell and narrow to the wrist, noses with a bridge, a tip and wings, ears with their hollow. So that a
// figure close up is a body and not balls and rods (his art rulebook, rule 9: real shapes, not circles and squares).
//
// Each part is placed by a FRAME: a point and three unit lines (x across, y its face, z along it); its sizes are in the
// figure's own units times `s`.

import type { Figure } from './sdf';
import type { V3 } from './comic';

export interface Frame {
  o: V3;
  x: V3;
  y: V3;
  z: V3;
}

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));

/** A frame at `o`, its z along `z`, its y as near `yHint` as can be at right angles to z. */
export function frameAt(o: V3, z: V3, yHint: V3): Frame {
  const zz = unit(z);
  const y = unit(sub(yHint, mul(zz, dot(yHint, zz))));
  return { o, x: cross(y, zz), y, z: zz };
}

/** A point in a frame: `a` across, `b` along its face, `c` along it. */
export function at(F: Frame, a: number, b: number, c: number): V3 {
  return add(F.o, add(add(mul(F.x, a), mul(F.y, b)), mul(F.z, c)));
}
function axesOf(F: Frame): readonly [V3, V3, V3] {
  return [F.x, F.y, F.z];
}

/**
 * A FOREARM from the elbow to the wrist: the muscle's swell high on it toward its outer side, narrowing to a wrist with its
 * bone at the side. `r` its girth at the swell; `out` the side the swell leans to.
 */
export function forearm(f: Figure, stuff: number, elbow: V3, wrist: V3, r: number, out: V3): void {
  const z = sub(wrist, elbow);
  const F = frameAt(elbow, z, out);
  const L = Math.hypot(z[0], z[1], z[2]);
  f.rod(stuff, elbow, wrist, r * 0.8, r * 0.5, 0.3);
  f.egg(stuff, at(F, 0, r * 0.25, L * 0.3), [r * 0.95, r * 1.05, L * 0.32], axesOf(F), 0.35);
  f.egg(stuff, at(F, 0, r * 0.35, L * 0.9), [r * 0.22, r * 0.2, r * 0.25], axesOf(F), 0.12);
}

/**
 * A HAND at the end of a forearm, its frame at the wrist: z along the hand (toward the knuckles), y the back of the hand, x
 * across (the thumb's side is -x). `pose`: a fist; a grip round a haft along x; open and flat (on a door, a bar); clawing.
 * Its knuckles' creases are inked.
 */
export function hand(f: Figure, stuff: number, F: Frame, s: number, pose: 'fist' | 'grip' | 'flat' | 'claw' | 'open'): void {
  const ax = axesOf(F);
  // the palm: a thick plate, wider at the knuckles
  f.block(stuff, at(F, 0, 0, 0.42 * s), [0.36 * s, 0.15 * s, 0.38 * s], 0.12 * s, ax, 0.15);
  f.egg(stuff, at(F, 0.06 * s, -0.04 * s, 0.7 * s), [0.4 * s, 0.17 * s, 0.14 * s], ax, 0.12);
  // the thumb's mound
  f.egg(stuff, at(F, -0.3 * s, -0.08 * s, 0.35 * s), [0.16 * s, 0.16 * s, 0.26 * s], ax, 0.12);
  const knuckles: V3[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (-0.27 + i * 0.18) * s;
    const len = [0.9, 1.0, 0.95, 0.75][i] * s;
    const r = (i === 3 ? 0.075 : 0.088) * s;
    const k0 = at(F, a, 0.02 * s, 0.8 * s);
    knuckles.push(at(F, a, 0.13 * s, 0.82 * s));
    let p1: V3;
    let p2: V3;
    let p3: V3;
    if (pose === 'fist' || pose === 'grip') {
      // (curled: down from the knuckle, back under it, the tips into the palm; round a haft, a little open)
      const o = pose === 'grip' ? 0.08 * s : 0;
      p1 = at(F, a, -0.2 * s, 1.02 * s);
      p2 = at(F, a, -0.38 * s - o, 0.9 * s);
      p3 = at(F, a, -0.34 * s - o, 0.68 * s + o);
    } else if (pose === 'claw') {
      p1 = at(F, a * 1.25, 0.08 * s, 0.8 * s + len * 0.4);
      p2 = at(F, a * 1.45, -0.08 * s, 0.8 * s + len * 0.65);
      p3 = at(F, a * 1.55, -0.3 * s, 0.8 * s + len * 0.72);
    } else if (pose === 'open') {
      p1 = at(F, a * 1.2, 0.02 * s, 0.8 * s + len * 0.42);
      p2 = at(F, a * 1.35, -0.04 * s, 0.8 * s + len * 0.72);
      p3 = at(F, a * 1.45, -0.1 * s, 0.8 * s + len * 0.95);
    } else {
      p1 = at(F, a, 0, 0.8 * s + len * 0.42);
      p2 = at(F, a, 0, 0.8 * s + len * 0.72);
      p3 = at(F, a, -0.02 * s, 0.8 * s + len * 0.95);
    }
    f.rod(stuff, k0, p1, r * 1.05, r, 0.06);
    f.rod(stuff, p1, p2, r, r * 0.92, 0.05);
    f.rod(stuff, p2, p3, r * 0.92, r * 0.8, 0.04);
    if (pose === 'claw') f.rod(stuff, p3, add(p3, mul(F.y, -0.1 * s)), r * 0.6, r * 0.2, 0.02);
    if (pose === 'fist' || pose === 'grip') f.line([at(F, a, 0.05 * s, 1.0 * s), at(F, a, -0.12 * s, 1.07 * s)]);
  }
  // the knuckles' row standing up over the back of the fist
  if (pose === 'fist' || pose === 'grip') for (const k of knuckles) f.egg(stuff, k, [0.08 * s, 0.07 * s, 0.08 * s], ax, 0.05);
  // the thumb
  const t0 = at(F, -0.32 * s, -0.08 * s, 0.4 * s);
  if (pose === 'fist' || pose === 'grip') {
    const t1 = at(F, -0.36 * s, -0.3 * s, 0.68 * s);
    const t2 = at(F, -0.1 * s, -0.42 * s, 0.86 * s);
    f.rod(stuff, t0, t1, 0.12 * s, 0.1 * s, 0.06);
    f.rod(stuff, t1, t2, 0.1 * s, 0.085 * s, 0.05);
  } else {
    const t1 = at(F, -0.55 * s, -0.12 * s, 0.62 * s);
    const t2 = at(F, -0.66 * s, -0.16 * s, 0.86 * s);
    f.rod(stuff, t0, t1, 0.12 * s, 0.1 * s, 0.06);
    f.rod(stuff, t1, t2, 0.1 * s, 0.08 * s, 0.05);
  }
}

/**
 * A NOSE on a face, its frame at the top of its bridge between the eyes: z down the nose, y out of the face, x across.
 * `kind`: a ram's (heavy, its bridge humped, its tip big), a long one (thin, the tip pointed), a small one.
 */
export function nose(f: Figure, stuff: number, F: Frame, s: number, kind: 'ram' | 'long' | 'small'): void {
  const ax = axesOf(F);
  const L = (kind === 'long' ? 0.62 : kind === 'ram' ? 0.58 : 0.4) * s;
  const out = (kind === 'ram' ? 0.32 : kind === 'long' ? 0.28 : 0.18) * s;
  // the bridge: a ridge, narrow at its top, out to the tip
  f.block(stuff, at(F, 0, out * 0.45, L * 0.45), [0.07 * s, out * 0.5, L * 0.5], 0.06 * s, frameAxes(F, -0.5), 0.1);
  if (kind === 'ram') f.egg(stuff, at(F, 0, out * 0.72, L * 0.38), [0.09 * s, 0.08 * s, 0.13 * s], ax, 0.08);
  // the tip, and the wings either side of it, the nostrils under them
  const tip = at(F, 0, out, L * (kind === 'long' ? 0.98 : 0.9));
  f.egg(stuff, tip, [(kind === 'ram' ? 0.14 : 0.09) * s, (kind === 'ram' ? 0.12 : 0.08) * s, (kind === 'ram' ? 0.13 : 0.1) * s], ax, 0.08);
  for (const side of [-1, 1]) {
    f.egg(stuff, at(F, side * (kind === 'ram' ? 0.16 : 0.11) * s, out * 0.55, L * 0.92), [0.08 * s, 0.08 * s, 0.07 * s], ax, 0.06);
    f.egg(stuff, at(F, side * 0.07 * s, out * 0.6, L * 1.02), [0.045 * s, 0.05 * s, 0.03 * s], ax, 0.02, true);
  }
}
/** A frame's lines tipped about its x by `a` (for a part leaning out of it). */
function frameAxes(F: Frame, a: number): readonly [V3, V3, V3] {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return [F.x, add(mul(F.y, c), mul(F.z, sn)), add(mul(F.z, c), mul(F.y, -sn))];
}

/** An EAR on the side of a head, its frame at the ear's middle: y out of the head, z up. Its rim, its hollow, its lobe. */
export function ear(f: Figure, stuff: number, F: Frame, s: number): void {
  const ax = axesOf(F);
  f.egg(stuff, F.o, [0.14 * s, 0.09 * s, 0.24 * s], ax, 0.1);
  f.egg(stuff, at(F, 0, 0.08 * s, 0.02 * s), [0.08 * s, 0.06 * s, 0.14 * s], ax, 0.04, true);
  f.egg(stuff, at(F, 0.02 * s, 0, -0.2 * s), [0.07 * s, 0.06 * s, 0.07 * s], ax, 0.06);
}
