// A HAND ON A WIRE, for the opening's people (art/opening.ts). His words, 26 Oct 2026, of the stranger's hands, which had come
// out wrong: “You can also make a wire hand that goes in the model so it’s easier to articulate the fingers”, and “Cause you’re
// going to have to animate him flipping a coin and I don’t have a ton of faith that it’s going to come out right the first
// time”.
//
// So a hand is first a wire, as a body is (art/anatomy.ts): the wrist; the palm, its four knuckles in a gentle arc; each
// finger three bones, each joint bending only the way a finger bends (toward the palm), the fingers able to spread; the thumb
// on its own pivot low at the side of the palm, swinging out from the hand or across under the fingers, its two joints
// bending toward the palm. A pose is how far each joint is bent. The hand is sculpted over the wire: the palm and its heel,
// the thumb's mound, each finger thick at its knuckle and narrowing to its tip, the knuckles standing up when it closes, the
// nails on a bare hand; so it can only ever take a shape a hand takes.
//
// Its frame is art/anatomy.ts's for a hand: at the wrist, z along the hand toward the knuckles, y the back of the hand, x
// across with the thumb at -x (a right hand's frame mirrored by the body, so that its thumb is on its own side). Sizes in
// units of `s` (a man's hand, 1.1 of his units).

import type { Figure } from './sdf';
import type { V3 } from './comic';
import type { Frame } from './anatomy';

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** `v` turned about the unit line `k` by `a`. */
function turn(v: V3, k: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

/**
 * How a hand is held: for each finger (forefinger to little finger) how far each of its three joints is bent, 0 straight to 1
 * as far as it goes; how far the fingers are spread; the thumb: how far it is swung across under the fingers (0 out at the
 * side, 1 across the palm), how far it is lifted out of the palm toward the front (0 in the palm's own plane), how far its two
 * joints are bent.
 */
export interface HandPose {
  fingers: readonly (readonly [number, number, number])[];
  spread?: number;
  thumb: { across: number; lift?: number; bend: readonly [number, number] };
}

/** A finger's three joints bent alike, `c` of the way. */
const curled = (c: number, tip = c): readonly [number, number, number] => [c, c, tip];

/** The hand's own poses. */
export const HANDS: Record<string, HandPose> = {
  /** Open and easy, hanging or held out: the fingers a little bent, the thumb a little out. */
  open: { fingers: [curled(0.12), curled(0.16), curled(0.2), curled(0.26)], spread: 0.35, thumb: { across: 0.38, lift: 0.4, bend: [0.2, 0.25] } },
  /** Relaxed at the side: each finger curling a little more than the one before. */
  relaxed: { fingers: [curled(0.24), curled(0.32), curled(0.38), curled(0.44)], spread: 0.12, thumb: { across: 0.5, lift: 0.45, bend: [0.25, 0.3] } },
  /** Flat on a door, a wall: straight, together. */
  flat: { fingers: [curled(0.02), curled(0.02), curled(0.02), curled(0.03)], spread: 0.15, thumb: { across: 0.05, lift: 0.05, bend: [0.05, 0.05] } },
  /** Spread wide. */
  splay: { fingers: [curled(0.05), curled(0.05), curled(0.06), curled(0.08)], spread: 1, thumb: { across: 0, lift: 0.1, bend: [0, 0.05] } },
  /** A fist: the fingers closed into the palm, the thumb across them. */
  fist: { fingers: [[0.95, 1, 0.85], [0.95, 1, 0.85], [0.95, 1, 0.85], [0.95, 1, 0.85]], spread: 0, thumb: { across: 0.85, lift: 0.55, bend: [0.4, 0.5] } },
  /** Round a haft (a hilt, a rein, a staff): closed round it, a little open. */
  grip: { fingers: [[0.78, 0.82, 0.6], [0.78, 0.82, 0.6], [0.78, 0.82, 0.6], [0.78, 0.82, 0.6]], spread: 0, thumb: { across: 0.75, lift: 0.6, bend: [0.3, 0.4] } },
  /** Palm up, the fingers easy (a rune burning over it; a coin come down into it). */
  cup: { fingers: [curled(0.18), curled(0.22), curled(0.26), curled(0.3)], spread: 0.25, thumb: { across: 0.4, lift: 0.45, bend: [0.2, 0.25] } },
  /** Pointing: the forefinger straight, the others closed, the thumb along them. */
  point: { fingers: [curled(0.03), [0.95, 1, 0.85], [0.95, 1, 0.85], [0.95, 1, 0.85]], spread: 0.1, thumb: { across: 0.7, lift: 0.5, bend: [0.3, 0.4] } },
  /**
   * A COIN READY TO BE FLICKED: the fingers in a loose fist, the forefinger curled a little less, its side up, the coin lying on
   * it; the thumb tucked under the forefinger's tip, held there.
   */
  coinReady: { fingers: [[0.62, 0.95, 0.6], [0.85, 0.95, 0.8], [0.9, 0.95, 0.8], [0.92, 0.95, 0.8]], spread: 0, thumb: { across: 0.62, lift: 0.75, bend: [0.55, 0.6] } },
  /** THE FLICK: the thumb snapped out straight from under the forefinger, up; the forefinger as it was. */
  coinFlick: { fingers: [[0.62, 0.95, 0.6], [0.85, 0.95, 0.8], [0.9, 0.95, 0.8], [0.92, 0.95, 0.8]], spread: 0, thumb: { across: 0.42, lift: 1.0, bend: [0, 0] } },
};

/** Two hand poses mixed, `u` of the second. */
export function mixHands(a: HandPose, b: HandPose, u: number): HandPose {
  const m = (x: number, y: number): number => x + (y - x) * u;
  return {
    fingers: a.fingers.map((f, i) => [m(f[0], b.fingers[i][0]), m(f[1], b.fingers[i][1]), m(f[2], b.fingers[i][2])] as const),
    spread: m(a.spread ?? 0, b.spread ?? 0),
    thumb: { across: m(a.thumb.across, b.thumb.across), lift: m(a.thumb.lift ?? 0, b.thumb.lift ?? 0), bend: [m(a.thumb.bend[0], b.thumb.bend[0]), m(a.thumb.bend[1], b.thumb.bend[1])] },
  };
}

/** Each finger: where its knuckle is on the palm (across, back, along), its three bones' lengths, how thick it is. */
const FINGERS: readonly { at: readonly [number, number, number]; bones: readonly [number, number, number]; r: number }[] = [
  { at: [-0.27, 0.02, 0.8], bones: [0.4, 0.24, 0.2], r: 0.088 },
  { at: [-0.09, 0.03, 0.83], bones: [0.44, 0.27, 0.21], r: 0.09 },
  { at: [0.09, 0.02, 0.8], bones: [0.41, 0.26, 0.2], r: 0.085 },
  { at: [0.26, 0.0, 0.74], bones: [0.32, 0.2, 0.17], r: 0.075 },
];
/** How far each joint of a finger bends at the most (radians): the knuckle, the middle, the last. */
const BEND = [1.5, 1.75, 1.2] as const;

/** Where the wire of a hand is: its knuckles, each finger's joints to its tip, the thumb's joints to its tip. */
export interface HandWire {
  wrist: V3;
  fingers: V3[][];
  thumb: V3[];
  /** The forefinger's middle bone, its side: where a coin lies on it. */
  coinRest: V3;
  /** The palm's middle, and the line out of it (the side away from the back of the hand). */
  palm: V3;
  palmOut: V3;
}

/** THE WIRE of a hand in frame `F`, `s` its size, posed `hp`. */
export function handWire(F: Frame, s: number, hp: HandPose): HandWire {
  const at = (a: number, b: number, c: number): V3 => add(F.o, add(add(mul(F.x, a * s), mul(F.y, b * s)), mul(F.z, c * s)));
  const fingers: V3[][] = [];
  for (let i = 0; i < 4; i++) {
    const fd = FINGERS[i];
    const pose = hp.fingers[i];
    // (each finger along the hand, spread out from the middle; its joints bending toward the palm, about the line across it)
    const sa = (i - 1.5) * (0.12 * (hp.spread ?? 0) + 0.03);
    let dir = unit(add(mul(F.z, Math.cos(sa)), mul(F.x, Math.sin(sa))));
    const acr = unit(cross(F.y, dir));
    const pts: V3[] = [at(fd.at[0], fd.at[1], fd.at[2])];
    for (let j = 0; j < 3; j++) {
      dir = turn(dir, acr, pose[j] * BEND[j]);
      pts.push(add(pts[j], mul(dir, fd.bones[j] * s)));
    }
    fingers.push(pts);
  }
  // THE THUMB: its pivot low at the side of the palm; swung from out at the side to across under the fingers, lifted out of
  // the palm toward its front; its joints bending toward the palm
  const base = at(-0.3, -0.06, 0.18);
  const out: V3 = unit(add(add(mul(F.x, -0.6), mul(F.z, 0.8)), mul(F.y, -0.12)));
  const across: V3 = unit(add(add(mul(F.x, 0.5), mul(F.z, 0.62)), mul(F.y, -0.6)));
  let tdir = unit(add(mul(out, 1 - hp.thumb.across), mul(across, hp.thumb.across)));
  tdir = unit(add(tdir, mul(F.y, -0.45 * (hp.thumb.lift ?? 0))));
  // (it bends about the line square to it and to the palm's own line out of it)
  const tbend = unit(cross(tdir, mul(F.y, -1)));
  const thumb: V3[] = [base];
  const tb = [0.36, 0.3, 0.24];
  let d = tdir;
  for (let j = 0; j < 3; j++) {
    if (j > 0) d = turn(d, tbend, (hp.thumb.bend[j - 1] ?? 0) * 1.1);
    thumb.push(add(thumb[j], mul(d, tb[j] * s)));
  }
  const fi = fingers[0];
  const coinRest = add(mul(add(fi[1], fi[2]), 0.5), mul(F.x, -0.1 * s));
  return { wrist: F.o, fingers, thumb, coinRest, palm: at(0, -0.12, 0.45), palmOut: mul(F.y, -1) };
}

/**
 * A HAND sculpted over its wire into `f`, of `stuff` (a glove or skin): frame `F`, size `s`, pose `hp`. `nails`: a bare hand's
 * nails, of `nailStuff`. `wire`: only the wire, drawn thin (to look at). Returns the wire.
 */
export function wireHand(f: Figure, stuff: number, F: Frame, s: number, hp: HandPose, o: { nails?: number; wire?: boolean; joint?: number } = {}): HandWire {
  const w = handWire(F, s, hp);
  const ax: readonly [V3, V3, V3] = [F.x, F.y, F.z];
  const at = (a: number, b: number, c: number): V3 => add(F.o, add(add(mul(F.x, a * s), mul(F.y, b * s)), mul(F.z, c * s)));
  if (o.wire) {
    const j = o.joint ?? stuff;
    const r = 0.035 * s;
    for (const k of [0, 1, 2, 3]) f.rod(stuff, w.wrist, w.fingers[k][0], r, r, 0);
    f.rod(stuff, w.wrist, w.thumb[0], r, r, 0);
    for (const ch of [...w.fingers, w.thumb]) {
      for (let i = 0; i < ch.length; i++) {
        f.egg(j, ch[i], [r * 2, r * 2, r * 2], ax, 0);
        if (i > 0) f.rod(stuff, ch[i - 1], ch[i], r, r, 0);
      }
    }
    f.egg(j, w.wrist, [r * 2.6, r * 2.6, r * 2.6], ax, 0);
    return w;
  }
  // THE PALM: thick at its heel, wider at the knuckles, a little hollowed; the thumb's mound; the heel under the little finger
  f.block(stuff, at(0, -0.02, 0.44), [0.34 * s, 0.13 * s, 0.36 * s], 0.11 * s, ax, 0.12);
  f.egg(stuff, at(0.02, -0.02, 0.74), [0.39 * s, 0.15 * s, 0.13 * s], ax, 0.1);
  f.egg(stuff, at(-0.22, -0.12, 0.28), [0.16 * s, 0.13 * s, 0.24 * s], ax, 0.12);
  f.egg(stuff, at(0.22, -0.1, 0.3), [0.12 * s, 0.1 * s, 0.22 * s], ax, 0.1);
  f.rod(stuff, at(0, 0, -0.05), at(0, -0.02, 0.18), 0.27 * s, 0.32 * s, 0.12);
  // THE FINGERS: each bone a little narrower than the one before, a knuckle at each joint; closed, the big knuckles stand up
  for (let i = 0; i < 4; i++) {
    const ch = w.fingers[i];
    const r = FINGERS[i].r * s;
    const bent = hp.fingers[i][0];
    f.egg(stuff, add(ch[0], mul(F.y, 0.03 * s * (1 + bent))), [r * 1.15, r * (1.05 + bent * 0.25), r * 1.1], ax, 0.06);
    f.rod(stuff, ch[0], ch[1], r * 1.02, r * 0.94, 0.05);
    f.egg(stuff, ch[1], [r * 0.98, r * 0.98, r * 0.98], ax, 0.03);
    f.rod(stuff, ch[1], ch[2], r * 0.94, r * 0.86, 0.04);
    f.rod(stuff, ch[2], ch[3], r * 0.86, r * 0.72, 0.03);
    if (o.nails !== undefined) {
      const d = unit(sub(ch[3], ch[2]));
      const back = unit(sub(F.y, mul(d, dot(F.y, d))));
      const n = unit(cross(d, back));
      f.egg(o.nails, add(sub(ch[3], mul(d, 0.05 * s)), mul(back, r * 0.62)), [r * 0.62, r * 0.18, r * 0.75], [n, back, d], 0.01);
    }
    // (the creases across the back of each middle joint)
    f.line([add(ch[1], add(mul(F.x, -r * 0.6), mul(F.y, r))), add(ch[1], add(mul(F.x, r * 0.6), mul(F.y, r)))]);
  }
  // THE THUMB: thick at its root in the mound, its two joints, its tip
  {
    const ch = w.thumb;
    const r = 0.125 * s;
    f.rod(stuff, ch[0], ch[1], r * 1.3, r * 1.05, 0.12);
    f.egg(stuff, ch[1], [r * 1.02, r * 1.02, r * 1.02], ax, 0.04);
    f.rod(stuff, ch[1], ch[2], r * 1.0, r * 0.92, 0.04);
    f.rod(stuff, ch[2], ch[3], r * 0.92, r * 0.76, 0.03);
    if (o.nails !== undefined) {
      const d = unit(sub(ch[3], ch[2]));
      const back = unit(cross(d, unit(cross(F.y, d))));
      f.egg(o.nails, add(sub(ch[3], mul(d, 0.05 * s)), mul(back, -r * 0.6)), [r * 0.6, r * 0.18, r * 0.72], [unit(cross(d, back)), back, d], 0.01);
    }
  }
  return w;
}
