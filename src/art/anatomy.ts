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

// =============================================================================================
// A HUMAN BODY, at a man's true proportions (the owner, 24 Oct 2026, 17:22: "There are proportions that are all wrong
// everywhere.  These are all humans and they need to look human."): every figure of the opening is built on it and dressed
// over it, so that a head is an eighth of a man, his arms reach to the middle of his thighs, his hands are the size of his
// face, and his limbs bend only at his joints, their bones always their own length.
//
// A tenth of a metre to a unit; up is z; the body faces -y (its right side toward -x) before it is turned and placed.

/** How a body is built: its height, its breadth, its heft (a share of the usual for each). */
export interface Build {
  /** Height from the soles to the crown (17.6 a man of middle height). */
  tall: number;
  /** Broad in the shoulders (1 the usual). */
  broad: number;
  /** Heavy in the body and limbs (1 the usual; the armourer 1.35). */
  heavy: number;
}
export const MAN: Build = { tall: 17.6, broad: 1, heavy: 1 };

/** How a body stands: where it is and how its parts are turned, and where its hands and feet are put (its own frame). */
export interface Pose {
  /** The middle of the pelvis (its own frame, before the body is placed). Default: standing, [0, 0, 9.4] for a man. */
  pelvis?: V3;
  /** The spine bent forward (radians, + forward), to the side (+ to his left), twisted (+ his shoulders to his left). */
  lean?: number;
  side?: number;
  twist?: number;
  /** The head turned (+ to his left), nodded (+ down), tipped (+ to his left). */
  turn?: number;
  nod?: number;
  tip?: number;
  /** Where each hand is (right, left), and which way each elbow points (a hint; default out and back). */
  hands: readonly [V3, V3];
  elbows?: readonly [V3, V3];
  /** Where each ankle is (right, left), and which way each knee points (default forward). */
  feet?: readonly [V3, V3];
  knees?: readonly [V3, V3];
  /** Which way each hand's palm faces, and which way its fingers point (defaults: in toward the thigh, down). */
  palms?: readonly [V3, V3];
  fingers?: readonly [V3, V3];
}

/** A body posed: every joint, and the frames of its trunk and head. */
export interface Body {
  B: Build;
  /** Units to a man of middle height (the build's height over 17.6). */
  k: number;
  pelvis: V3;
  hips: readonly [V3, V3];
  waist: V3;
  chest: V3;
  /** The trunk's lines: up its spine, out of its chest (forward), and across it (to its left). */
  up: V3;
  fwd: V3;
  across: V3;
  neck: V3;
  head: V3;
  /** The head's lines: up, forward (out of its face), across (to its left). */
  hup: V3;
  hfwd: V3;
  hacross: V3;
  shoulders: readonly [V3, V3];
  elbows: readonly [V3, V3];
  wrists: readonly [V3, V3];
  knees: readonly [V3, V3];
  ankles: readonly [V3, V3];
  /** The hands' frames at the wrist (z along the hand, y its back), for `hand`. */
  handFrames: readonly [Frame, Frame];
}

function rotAbout(v: V3, axis: V3, a: number): V3 {
  const k = unit(axis);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

/** Two bones from `a` to the joint to `b` (lengths `l1`, `l2`), the joint bent toward `pole`: the joint's place. `b` is drawn in if it is out of reach. */
function reach(a: V3, b: V3, l1: number, l2: number, pole: V3): { joint: V3; end: V3 } {
  let d = sub(b, a);
  let L = Math.hypot(d[0], d[1], d[2]);
  const most = (l1 + l2) * 0.999;
  let end = b;
  if (L > most) {
    end = add(a, mul(d, most / L));
    d = sub(end, a);
    L = most;
  }
  const u = unit(d);
  const along = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const pp = sub(pole, mul(u, dot(pole, u)));
  const w = Math.hypot(pp[0], pp[1], pp[2]) > 1e-6 ? unit(pp) : unit(cross(u, [0, 0, 1]));
  return { joint: add(add(a, mul(u, along)), mul(w, h)), end };
}

/** A body built `B` and posed `P`. */
export function pose(B: Build, P: Pose): Body {
  const k = B.tall / 17.6;
  const pelvis = P.pelvis ?? [0, 0, 9.4 * k];
  // the trunk: up from the pelvis, bent and twisted
  let up: V3 = [0, 0, 1];
  let fwd: V3 = [0, -1, 0];
  up = rotAbout(up, [1, 0, 0], P.lean ?? 0);
  fwd = rotAbout(fwd, [1, 0, 0], P.lean ?? 0);
  up = rotAbout(up, fwd, -(P.side ?? 0));
  fwd = rotAbout(fwd, up, P.twist ?? 0);
  const across = unit(cross(up, fwd));
  const hipsAcross: V3 = unit(cross([0, 0, 1], rotAbout([0, -1, 0], [0, 0, 1], (P.twist ?? 0) * 0.3)));
  const waist = add(pelvis, mul(up, 1.3 * k));
  const chest = add(pelvis, mul(up, 3.55 * k));
  const neck = add(pelvis, mul(up, 5.1 * k));
  const hips: [V3, V3] = [add(pelvis, add(mul(hipsAcross, -0.95 * k * B.heavy ** 0.3), [0, 0, -0.35 * k])), add(pelvis, add(mul(hipsAcross, 0.95 * k * B.heavy ** 0.3), [0, 0, -0.35 * k]))];
  const shoulders: [V3, V3] = [add(add(pelvis, mul(up, 4.8 * k)), mul(across, -1.95 * k * B.broad)), add(add(pelvis, mul(up, 4.8 * k)), mul(across, 1.95 * k * B.broad))];
  // the head: on the neck, turned, nodded, tipped
  let hup = up;
  let hfwd = fwd;
  hfwd = rotAbout(hfwd, hup, P.turn ?? 0);
  const hac0 = unit(cross(hup, hfwd));
  hup = rotAbout(hup, hac0, P.nod ?? 0);
  hfwd = rotAbout(hfwd, hac0, P.nod ?? 0);
  hup = rotAbout(hup, hfwd, -(P.tip ?? 0));
  const hacross = unit(cross(hup, hfwd));
  const head = add(add(neck, mul(hup, 1.55 * k)), mul(hfwd, 0.1 * k));
  // the limbs, each two bones of its own length, bent toward their hints
  const arm1 = 3.1 * k;
  const arm2 = 2.65 * k;
  const elbows: V3[] = [];
  const wrists: V3[] = [];
  for (const j of [0, 1] as const) {
    const side = j ? 1 : -1;
    const pole = P.elbows?.[j] ?? add(mul(across, side * 0.5), mul(fwd, -1));
    const r = reach(shoulders[j], P.hands[j], arm1, arm2, pole);
    elbows.push(r.joint);
    wrists.push(r.end);
  }
  const leg1 = 4.3 * k;
  const leg2 = 4.1 * k;
  const feet: readonly [V3, V3] = P.feet ?? [[-0.9 * k, 0, 0.75 * k], [0.9 * k, 0, 0.75 * k]];
  const knees: V3[] = [];
  const ankles: V3[] = [];
  for (const j of [0, 1] as const) {
    const pole = P.knees?.[j] ?? [0, -1, 0];
    const r = reach(hips[j], feet[j], leg1, leg2, pole);
    knees.push(r.joint);
    ankles.push(r.end);
  }
  const handFrames = [0, 1].map((j) => {
    const zf = P.fingers?.[j] ?? unit(sub(wrists[j], elbows[j]));
    const back = P.palms?.[j] ? mul(P.palms[j], -1) : mul(across, j ? 1 : -1);
    return frameAt(wrists[j], zf, back);
  }) as unknown as [Frame, Frame];
  return { B, k, pelvis, hips, waist, chest, up, fwd, across, neck, head, hup, hfwd, hacross, shoulders, elbows: elbows as unknown as [V3, V3], wrists: wrists as unknown as [V3, V3], knees: knees as unknown as [V3, V3], ankles: ankles as unknown as [V3, V3], handFrames };
}

/** A point by the head's lines: `a` to its left, `b` out of its face, `c` up; in units of a man's head. */
export function onHead(b: Body, a: number, f: number, c: number): V3 {
  return add(add(add(b.head, mul(b.hacross, a * b.k)), mul(b.hfwd, f * b.k)), mul(b.hup, c * b.k));
}
/** A point by the trunk's lines from the chest: `a` to its left, `b` forward, `c` up. */
export function onChest(b: Body, a: number, f: number, c: number): V3 {
  return add(add(add(b.chest, mul(b.across, a * b.k)), mul(b.fwd, f * b.k)), mul(b.up, c * b.k));
}
function axesOfHead(b: Body): readonly [V3, V3, V3] {
  return [b.hacross, mul(b.hfwd, -1), b.hup];
}
function axesOfTrunk(b: Body): readonly [V3, V3, V3] {
  return [b.across, mul(b.fwd, -1), b.up];
}

/** Which parts of a body to sculpt (what clothes hide need not be). */
export interface BodyParts {
  face?: boolean;
  skull?: boolean;
  neck?: boolean;
  trunk?: boolean;
  arms?: boolean;
  forearms?: boolean;
  hands?: false | 'fist' | 'grip' | 'flat' | 'claw' | 'open' | readonly ['fist' | 'grip' | 'flat' | 'claw' | 'open', 'fist' | 'grip' | 'flat' | 'claw' | 'open'];
  legs?: boolean;
  feet?: boolean;
  /** The nose's kind. */
  nose?: 'ram' | 'long' | 'small';
  /** The eyes' light (the friend's two cyan points; the stranger's gold; none). */
  eyes?: readonly string[] | null;
  /** What a part is made of when it is not skin (mail on the arms, a sleeve, a boot), and how much thicker it is for it. */
  as?: Partial<Record<'neck' | 'trunk' | 'arms' | 'forearms' | 'hands' | 'legs' | 'shins' | 'feet', { stuff: number; grow?: number }>>;
}

/**
 * THE BODY SCULPTED: its skin (`skin`), the parts asked for. The face: a skull, a brow standing over the eyes, deep sockets,
 * cheekbones, a jaw and chin, the nose, the mouth's line, ears; the eyes' light. The neck and the trapezius into the
 * shoulders; the ribcage, the chest's muscles, the belly, the pelvis; the deltoids, the upper arms and their muscle, the
 * forearms, the hands; the thighs, knees, calves, feet.
 */
export function sculptBody(f: Figure, skin: number, b: Body, parts: BodyParts): void {
  const k = b.k;
  const h = b.B.heavy;
  const HA = axesOfHead(b);
  const TA = axesOfTrunk(b);
  const S = (part: 'neck' | 'trunk' | 'arms' | 'forearms' | 'hands' | 'legs' | 'shins' | 'feet'): [number, number] => {
    const o = parts.as?.[part];
    return o ? [o.stuff, o.grow ?? 1] : [skin, 1];
  };
  if (parts.skull !== false || parts.face !== false) {
    f.egg(skin, onHead(b, 0, -0.12, 0.22), [0.82 * k, 1.0 * k, 1.05 * k], HA, 0.4);
  }
  if (parts.face !== false) {
    f.egg(skin, onHead(b, 0, 0.42, -0.62), [0.58 * k * h ** 0.3, 0.55 * k, 0.55 * k], HA, 0.45);
    f.egg(skin, onHead(b, 0, 0.62, -1.02), [0.28 * k, 0.24 * k, 0.22 * k], HA, 0.3);
    f.egg(skin, onHead(b, 0, 0.8, 0.26), [0.6 * k, 0.17 * k, 0.13 * k], HA, 0.22);
    for (const s of [-1, 1]) {
      f.egg(skin, onHead(b, s * 0.5, 0.62, -0.12), [0.22 * k, 0.18 * k, 0.17 * k], HA, 0.2);
      f.egg(skin, onHead(b, s * 0.31, 0.84, 0.06), [0.19 * k, 0.1 * k, 0.11 * k], HA, 0.06, true);
      ear(f, skin, frameAt(onHead(b, s * 0.8, -0.02, -0.04), b.hup, mul(b.hacross, s)), 1.25 * k);
      if (parts.eyes) f.mark(onHead(b, s * 0.31, 0.9, 0.04), parts.eyes, 2);
    }
    nose(f, skin, frameAt(onHead(b, 0, 0.88, 0.18), sub(mul(b.hfwd, 0.25), b.hup), b.hfwd), 1.15 * k, parts.nose ?? 'long');
    f.line([onHead(b, -0.24, 0.84, -0.66), onHead(b, 0, 0.88, -0.62), onHead(b, 0.24, 0.84, -0.66)]);
  }
  if (parts.neck !== false) {
    const [st, g] = S('neck');
    f.rod(st, onHead(b, 0, -0.25, -0.8), b.neck, 0.52 * k * h ** 0.5 * g, 0.6 * k * h ** 0.5 * g, 0.35);
    for (const s of [-1, 1]) f.egg(st, onChest(b, s * 0.85, -0.15, 1.6), [0.95 * k * g, 0.55 * k * g, 0.32 * k * g], TA, 0.4);
  }
  if (parts.trunk !== false) {
    const [st, g] = S('trunk');
    f.egg(st, onChest(b, 0, 0.05, -0.1), [1.5 * k * h ** 0.6 * g, 1.18 * k * h ** 0.6 * g, 1.55 * k * g], TA, 0.6);
    f.egg(st, onChest(b, 0, -0.45, 0.55), [1.35 * k * h ** 0.6 * g, 0.72 * k * g, 1.05 * k * g], TA, 0.6);
    f.egg(st, onChest(b, 0, 0.35, -1.55), [1.1 * k * h ** 0.8 * g, 0.9 * k * h ** 0.9 * g, 0.9 * k * g], TA, 0.6);
    for (const s of [-1, 1]) f.egg(st, onChest(b, s * 0.68, 0.55, 0.3), [0.78 * k * g, 0.4 * k * g, 0.55 * k * g], TA, 0.35);
    f.rod(st, onChest(b, 0, 0.05, -1.0), b.waist, 1.2 * k * h ** 0.7 * g, 1.12 * k * h ** 0.8 * g, 0.5);
    f.egg(st, b.pelvis, [1.5 * k * h ** 0.5 * g, 1.05 * k * h ** 0.6 * g, 0.95 * k * g], TA, 0.5);
  }
  for (const j of [0, 1] as const) {
    const sh = b.shoulders[j];
    if (parts.arms !== false) {
      const [st, g] = S('arms');
      f.egg(st, sh, [0.6 * k * h ** 0.6 * g, 0.62 * k * h ** 0.6 * g, 0.66 * k * g], TA, 0.6);
      f.rod(st, sh, b.elbows[j], 0.52 * k * h ** 0.6 * g, 0.4 * k * h ** 0.6 * g, 0.35);
      const ua = sub(b.elbows[j], sh);
      f.egg(st, add(sh, mul(ua, 0.45)), [0.5 * k * h ** 0.6 * g, 0.5 * k * h ** 0.6 * g, 0.95 * k], frameToAxes(frameAt(sh, ua, b.fwd)), 0.35);
    }
    if (parts.forearms !== false) {
      const [st, g] = S('forearms');
      forearm(f, st, b.elbows[j], b.wrists[j], 0.5 * k * h ** 0.6 * g, mul(b.across, j ? 1 : -1));
    }
    const hp = parts.hands === undefined ? 'open' : parts.hands;
    if (hp) {
      const kind = typeof hp === 'string' ? hp : hp[j];
      const [st, g] = S('hands');
      hand(f, st, b.handFrames[j], 1.12 * k * h ** 0.3 * g, kind);
    }
    if (parts.legs !== false) {
      const [st, g] = S('legs');
      f.rod(st, b.hips[j], b.knees[j], 0.82 * k * h ** 0.6 * g, 0.55 * k * h ** 0.6 * g, 0.4);
      f.egg(st, b.knees[j], [0.48 * k * g, 0.48 * k * g, 0.5 * k * g], TA, 0.25);
      const [st2, g2] = S('shins');
      const shin = sub(b.ankles[j], b.knees[j]);
      f.rod(st2, b.knees[j], b.ankles[j], 0.48 * k * h ** 0.6 * g2, 0.3 * k * h ** 0.5 * g2, 0.3);
      f.egg(st2, add(add(b.knees[j], mul(shin, 0.32)), mul(b.fwd, -0.22 * k)), [0.48 * k * h ** 0.6 * g2, 0.48 * k * h ** 0.6 * g2, 1.1 * k], frameToAxes(frameAt(b.knees[j], shin, b.fwd)), 0.35);
    }
    if (parts.feet !== false) {
      const [st, g] = S('feet');
      sculptFoot(f, st, b, j, undefined, g);
    }
  }
}

/** A foot under the ankle: the heel, the arch, the ball, the toes; on the ground, pointing the body's way (or `toward`). */
export function sculptFoot(f: Figure, stuff: number, b: Body, j: 0 | 1, toward?: V3, grow = 1): void {
  const k = b.k;
  const a = b.ankles[j];
  const dir0 = toward ?? b.fwd;
  const dir = unit([dir0[0], dir0[1], 0]);
  const ground = Math.max(0, a[2] - 0.75 * k);
  const heel: V3 = add([a[0], a[1], ground + 0.32 * k], mul(dir, -0.45 * k));
  const ball: V3 = add([a[0], a[1], ground + 0.28 * k], mul(dir, 1.45 * k));
  f.rod(stuff, a, heel, 0.36 * k * grow, 0.32 * k * grow, 0.25);
  f.rod(stuff, heel, ball, 0.34 * k * grow, 0.3 * k * grow, 0.3);
  f.egg(stuff, add(ball, mul(dir, 0.35 * k)), [0.42 * k * grow, 0.5 * k * grow, 0.24 * k * grow], frameToAxes(frameAt(ball, [0, 0, 1], dir)), 0.25);
}

function frameToAxes(F: Frame): readonly [V3, V3, V3] {
  return [F.x, F.y, F.z];
}
