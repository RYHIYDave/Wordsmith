// THE SKELETON THE OPENING'S PEOPLE STAND ON (art/opening.ts). His words, 26 Oct 2026, at 21:33: “At least for this big
// animation, you should have a full on skeleton frame.  Like very intricate skeleton.  Maybe not ribs but tons of points of
// articulation”.
//
// So, under each of them, a skeleton of many joints (no ribs): THE SPINE in pieces, the pelvis, the small of the back, the
// middle of the back, the chest, each bending forward, to the side and twisting a share of the whole, so that a bend runs
// through the back and not from one hinge; THE NECK in two, the head on it, the jaw; THE COLLARBONES from the notch at the top
// of the breastbone out to the shoulders, which shrug up and roll forward, the shoulder blades on the back; the upper arm,
// the elbow, the forearm turning, the wrist, and the hand on its own wire (art/opening_hand.ts); THE HIPS, which tip, turn and
// tilt; the thighs, the knees, the shins, the ankles, the foot from its heel to its ball, and the toes, which bend at the ball
// so that a heel can come up off the ground while the toes keep to it.
//
// It is art/anatomy.ts's body and more: `pose2` gives all that `pose` gives (so that every figure built on a Body is built on
// it the same), and the frames of each piece of the spine; `onTrunk` finds a point by the spine as art/anatomy.ts's `onChest`
// does by the chest alone, so that what is hung on the belly and the hips moves with them and not with the chest.
//
// A tenth of a metre a unit, up z, the front toward -y (art/cast.ts).

import type { Figure } from './sdf';
import type { V3 } from './comic';
import { frameAt } from './anatomy';
import type { Body, Build, Frame, Pose } from './anatomy';

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
const lerp = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
function turn(v: V3, k: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

/** A piece of the trunk: where it is, and its lines (up its spine, out of its front, across to its left). */
export interface Piece {
  o: V3;
  up: V3;
  fwd: V3;
  across: V3;
}

/** How a skeleton is posed: all a Pose says, and more. */
export interface Pose2 extends Pose {
  /** The spine's bend shared out by piece (the small of the back, the middle of the back, the chest): override its shares. */
  spine?: { lean?: readonly [number, number, number]; side?: readonly [number, number, number]; twist?: readonly [number, number, number] };
  /** The pelvis tipped forward (+) or back, and turned (+ to his left), as well as tipped side to side (hipTilt). */
  pelvisLean?: number;
  hipTurn?: number;
  /** Each shoulder shrugged up (+), rolled forward (+) by its collarbone. */
  shrug?: readonly [number, number];
  reach?: readonly [number, number];
  /** The jaw open (radians). */
  jaw?: number;
}

/** A skeleton posed: a Body, and its spine's pieces, its neck, its collarbones, its feet and toes, its jaw. */
export interface Skeleton extends Body {
  /** The pelvis, the small of the back (the waist), the middle of the back, the chest. */
  pieces: readonly [Piece, Piece, Piece, Piece];
  /** The top of the breastbone, where the collarbones meet; the top of the neck, under the skull. */
  notch: V3;
  neckTop: V3;
  /** Each foot: its heel, its ball, the tip of its toes. */
  heels: readonly [V3, V3];
  balls: readonly [V3, V3];
  toes: readonly [V3, V3];
  /** The point of the chin, the jaw hinged under each ear. */
  chin: V3;
  jaws: readonly [V3, V3];
}

/** How the spine's bend is shared out by default: the small of the back, the middle of the back, the chest. */
const SHARE = { lean: [0.36, 0.34, 0.3], side: [0.4, 0.35, 0.25], twist: [0.22, 0.36, 0.42] } as const;
/** The spine's pieces' lengths, up from the pelvis (a man's units). */
const SEG = [1.3, 1.15, 1.1] as const;

/** A SKELETON built `B` and posed `P`. */
export function pose2(B: Build, P: Pose2): Skeleton {
  const k = B.tall / 17.6;
  const pelvis = P.pelvis ?? [0, 0, 9.4 * k];
  // THE PELVIS: tipped side to side (its weight on one leg), forward or back, turned
  let pUp: V3 = [0, 0, 1];
  let pFwd: V3 = [0, -1, 0];
  pFwd = turn(pFwd, [0, 0, 1], P.hipTurn ?? (P.twist ?? 0) * 0.3);
  let pAc = unit(cross(pUp, pFwd));
  pUp = turn(pUp, pAc, P.pelvisLean ?? 0);
  pFwd = turn(pFwd, pAc, P.pelvisLean ?? 0);
  pUp = turn(pUp, pFwd, -(P.hipTilt ?? 0));
  pAc = unit(cross(pUp, pFwd));
  // THE SPINE: each piece turned from the one under it by its share of the bend; the chest's lines the last
  const pieces: Piece[] = [{ o: pelvis, up: pUp, fwd: pFwd, across: pAc }];
  let up = pUp;
  let fwd = pFwd;
  let at = pelvis;
  const lean = P.spine?.lean ?? SHARE.lean.map((s) => s * (P.lean ?? 0));
  const side = P.spine?.side ?? SHARE.side.map((s) => s * (P.side ?? 0));
  const tw = P.spine?.twist ?? SHARE.twist.map((s) => s * ((P.twist ?? 0) - (P.hipTurn ?? (P.twist ?? 0) * 0.3)));
  for (let i = 0; i < 3; i++) {
    const ac = unit(cross(up, fwd));
    up = turn(up, ac, lean[i]);
    fwd = turn(fwd, ac, lean[i]);
    up = turn(up, fwd, -side[i]);
    fwd = turn(fwd, up, tw[i]);
    at = add(at, mul(up, SEG[i] * k));
    pieces.push({ o: at, up, fwd, across: unit(cross(up, fwd)) });
  }
  const chestP = pieces[3];
  // (the chest's own point is where art/anatomy.ts's chest is: SEG adds up to its 3.55)
  const across = chestP.across;
  // THE COLLARBONES: from the notch out to the shoulders, shrugged up and rolled forward
  const notch = add(add(chestP.o, mul(chestP.up, 1.3 * k)), mul(chestP.fwd, 0.55 * k));
  const shoulders: V3[] = [];
  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    const sh0 = add(add(chestP.o, mul(chestP.up, 1.25 * k)), mul(across, s * 1.95 * k * B.broad));
    let c = sub(sh0, notch);
    c = turn(c, chestP.fwd, s * (P.shrug?.[j] ?? 0) * 0.6);
    c = turn(c, chestP.up, -s * (P.reach?.[j] ?? 0) * 0.55);
    shoulders.push(add(notch, c));
  }
  // THE NECK in two and THE HEAD on it: a third of its turn at the neck's root, the rest at the skull
  const neck = add(chestP.o, mul(chestP.up, 1.55 * k));
  let hup = chestP.up;
  let hfwd = chestP.fwd;
  const turnH = (u: number): void => {
    hfwd = turn(hfwd, hup, (P.turn ?? 0) * u);
    const hac = unit(cross(hup, hfwd));
    hup = turn(hup, hac, (P.nod ?? 0) * u);
    hfwd = turn(hfwd, hac, (P.nod ?? 0) * u);
    hup = turn(hup, hfwd, -(P.tip ?? 0) * u);
  };
  turnH(0.35);
  const neckTop = add(neck, mul(hup, 0.8 * k));
  turnH(0.65);
  const hacross = unit(cross(hup, hfwd));
  const head = add(add(neckTop, mul(hup, 0.75 * k)), mul(hfwd, 0.1 * k));
  // THE ARMS from these shoulders, THE LEGS from these hips: art/anatomy.ts's own two-bone reach
  const hipsAcross = pAc;
  const hips: [V3, V3] = [add(pelvis, add(mul(hipsAcross, -0.95 * k * B.heavy ** 0.3), mul(pUp, -0.35 * k))), add(pelvis, add(mul(hipsAcross, 0.95 * k * B.heavy ** 0.3), mul(pUp, -0.35 * k)))];
  const arms = reachLimbs(shoulders as [V3, V3], hips, P, k, across, chestP.fwd, chestP.up, B);
  // THE FEET: the heel under the ankle and back, the ball forward on the ground; the toes on from the ball, flat on the
  // ground even when the heel is up
  const heels: V3[] = [];
  const balls: V3[] = [];
  const toes: V3[] = [];
  for (const j of [0, 1] as const) {
    const an = arms.ankles[j];
    const dir = unit([pFwd[0] + chestP.fwd[0] * 0.2, pFwd[1] + chestP.fwd[1] * 0.2, 0]);
    const ground = Math.max(0, an[2] - 0.75 * k);
    const lift = Math.max(0, an[2] - 0.75 * k - ground);
    const reachF = Math.sqrt(Math.max(0.2, (1.45 * k) ** 2 - lift * lift));
    const ball: V3 = add([an[0], an[1], ground + 0.2 * k], mul(dir, reachF));
    balls.push(ball);
    heels.push(add([an[0], an[1], Math.max(ground + 0.25 * k, an[2] - 0.55 * k)], mul(dir, -0.45 * k)));
    toes.push(add(ball, mul(dir, 0.62 * k)));
  }
  // THE JAW: hinged under each ear, the chin out before the throat, dropped as it opens
  const hj = (a: number, f: number, c: number): V3 => add(add(add(head, mul(hacross, a * k)), mul(hfwd, f * k)), mul(hup, c * k));
  const jaws: [V3, V3] = [hj(-0.62, 0.02, -0.28), hj(0.62, 0.02, -0.28)];
  const chin0 = sub(hj(0, 0.78, -1.02), hj(0, 0.02, -0.28));
  const chin = add(hj(0, 0.02, -0.28), turn(chin0, hacross, (P.jaw ?? 0) * 0.8));
  return {
    B, k, pelvis, hips, waist: pieces[1].o, chest: chestP.o, up: chestP.up, fwd: chestP.fwd, across, neck, head, hup, hfwd, hacross,
    shoulders: shoulders as unknown as [V3, V3], elbows: arms.elbows, wrists: arms.wrists, knees: arms.knees, ankles: arms.ankles, handFrames: arms.handFrames,
    pieces: pieces as unknown as [Piece, Piece, Piece, Piece], notch, neckTop, heels: heels as unknown as [V3, V3], balls: balls as unknown as [V3, V3], toes: toes as unknown as [V3, V3], chin, jaws,
  };
}

/** The arms from the shoulders and the legs from the hips, each two bones bent toward its hint (art/anatomy.ts's way). */
function reachLimbs(shoulders: readonly [V3, V3], hips: readonly [V3, V3], P: Pose, k: number, across: V3, fwd: V3, up: V3, B: Build): Pick<Body, 'elbows' | 'wrists' | 'knees' | 'ankles' | 'handFrames'> {
  const two = (a: V3, b: V3, l1: number, l2: number, pole: V3): { joint: V3; end: V3 } => {
    let d = sub(b, a);
    let L = len(d);
    const most = (l1 + l2) * 0.999;
    let end = b;
    if (L > most) {
      end = add(a, mul(d, most / L));
      d = sub(end, a);
      L = most;
    }
    const u = unit(d);
    const al = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
    const h = Math.sqrt(Math.max(0, l1 * l1 - al * al));
    const pp = sub(pole, mul(u, dot(pole, u)));
    const w = len(pp) > 1e-6 ? unit(pp) : unit(cross(u, [0, 0, 1]));
    return { joint: add(add(a, mul(u, al)), mul(w, h)), end };
  };
  const elbows: V3[] = [];
  const wrists: V3[] = [];
  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    const pole = P.elbows?.[j] ?? add(add(mul(across, s * 0.45), mul(fwd, -0.5)), mul(up, -0.75));
    const r = two(shoulders[j], P.hands[j], 3.1 * k, 2.65 * k, pole);
    elbows.push(r.joint);
    wrists.push(r.end);
  }
  const feet: readonly [V3, V3] = P.feet ?? [[-0.9 * k, 0, 0.75 * k], [0.9 * k, 0, 0.75 * k]];
  const knees: V3[] = [];
  const ankles: V3[] = [];
  for (const j of [0, 1] as const) {
    const r = two(hips[j], feet[j], 4.3 * k, 4.1 * k, P.knees?.[j] ?? [0, -1, 0]);
    knees.push(r.joint);
    ankles.push(r.end);
  }
  const handFrames = [0, 1].map((j) => {
    const zf = P.fingers?.[j] ?? unit(sub(wrists[j], elbows[j]));
    const back = P.palms?.[j] ? mul(P.palms[j], -1) : mul(across, j ? 1 : -1);
    const F = frameAt(wrists[j], zf, back);
    return j === 0 ? { ...F, x: mul(F.x, -1) } : F;
  }) as unknown as [Frame, Frame];
  void B;
  return { elbows: elbows as unknown as [V3, V3], wrists: wrists as unknown as [V3, V3], knees: knees as unknown as [V3, V3], ankles: ankles as unknown as [V3, V3], handFrames };
}

/**
 * A point by the spine, as art/anatomy.ts's onChest is by the chest: `a` across (to his left), `f` forward, `c` up from the
 * chest (a man's units); below the chest, by the piece of the spine at that height, so that it moves with the belly and the
 * hips. Without a spine (a Body of art/anatomy.ts), as onChest.
 */
export function onTrunk(b: Body, a: number, f: number, c: number): V3 {
  const P = trunkAt(b, c);
  return add(add(P.o, mul(P.across, a * b.k)), mul(P.fwd, f * b.k));
}
/** The trunk's piece at height `c` from the chest: where its middle is at that height, and its lines. */
export function trunkAt(b: Body, c: number): Piece {
  const sk = b as Partial<Skeleton>;
  const k = b.k;
  if (!sk.pieces || c >= 0) {
    const pc = sk.pieces ? sk.pieces[3] : { o: b.chest, up: b.up, fwd: b.fwd, across: b.across };
    return { o: add(pc.o, mul(pc.up, c * k)), up: pc.up, fwd: pc.fwd, across: pc.across };
  }
  // (height from the pelvis up the spine; within which piece, how far)
  const h = 3.55 + c;
  const ends = [0, SEG[0], SEG[0] + SEG[1], SEG[0] + SEG[1] + SEG[2]];
  let i = 0;
  while (i < 2 && h > ends[i + 1]) i++;
  const u = Math.max(0, Math.min(1, (h - ends[i]) / SEG[i]));
  const A = sk.pieces[i];
  const Bp = sk.pieces[i + 1];
  const o = h < 0 ? add(A.o, mul(A.up, h * k)) : lerp(A.o, Bp.o, u);
  const upv = unit(lerp(A.up, Bp.up, u));
  const fw = unit(sub(lerp(A.fwd, Bp.fwd, u), mul(upv, dot(lerp(A.fwd, Bp.fwd, u), upv))));
  return { o, up: upv, fwd: fw, across: unit(cross(upv, fw)) };
}
/** The trunk's axes at height `c` (across, back, up), for a part laid on it there. */
export function trunkAxes(b: Body, c: number): readonly [V3, V3, V3] {
  const P = trunkAt(b, c);
  return [P.across, mul(P.fwd, -1), P.up];
}

/**
 * THE BARE SKELETON drawn into `f` (to look at): its bones of `bone`, its joints of `joint`. The skull, its eyes and its
 * jaw; the spine's bones one by one; the pelvis; the collarbones and the shoulder blades; the long bones; the feet and toes.
 * (The hands are drawn on their own wires, art/opening_hand.ts.)
 */
export function drawSkeleton(f: Figure, sk: Skeleton, bone: number, joint: number): void {
  const k = sk.k;
  const ball = (q: V3, r: number): void => void f.egg(joint, q, [r * k, r * k, r * k], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 0.02);
  const rod = (a: V3, b: V3, r0: number, r1 = r0): void => void f.rod(bone, a, b, r0 * k, r1 * k, 0.04);
  const HA: readonly [V3, V3, V3] = [sk.hacross, mul(sk.hfwd, -1), sk.hup];
  const hj = (a: number, fw: number, c: number): V3 => add(add(add(sk.head, mul(sk.hacross, a * k)), mul(sk.hfwd, fw * k)), mul(sk.hup, c * k));
  // (the skull: its dome, its face, its sockets; the jaw down to the chin)
  f.egg(bone, hj(0, -0.1, 0.25), [0.8 * k, 0.98 * k, 0.92 * k], HA, 0.3);
  f.egg(bone, hj(0, 0.5, -0.35), [0.55 * k, 0.4 * k, 0.45 * k], HA, 0.3);
  for (const s of [-1, 1]) {
    f.egg(bone, hj(s * 0.3, 0.84, 0.04), [0.2 * k, 0.2 * k, 0.17 * k], HA, 0.05, true);
    f.egg(bone, hj(s * 0.48, 0.62, -0.22), [0.16 * k, 0.16 * k, 0.12 * k], HA, 0.1);
  }
  f.egg(bone, hj(0, 0.92, -0.3), [0.09 * k, 0.12 * k, 0.12 * k], HA, 0.03, true);
  f.line([hj(-0.3, 0.86, -0.62), hj(0, 0.94, -0.6), hj(0.3, 0.86, -0.62)], '#3a3426', 1);
  for (let i = -3; i <= 3; i++) f.line([hj(i * 0.08, 0.92 - Math.abs(i) * 0.02, -0.55), hj(i * 0.08, 0.92 - Math.abs(i) * 0.02, -0.68)], '#3a3426', 1);
  for (const s of [0, 1] as const) rod(sk.jaws[s], sk.chin, 0.12, 0.1);
  ball(sk.chin, 0.13);
  // (the spine: its bones from the tail to the skull, each a little block, the joint between)
  const spinePts: V3[] = [];
  for (let i = 0; i < 3; i++) for (let u = 0; u < 1; u += 0.25) spinePts.push(lerp(sk.pieces[i].o, sk.pieces[i + 1].o, u));
  spinePts.push(sk.pieces[3].o);
  for (let u = 0.25; u <= 1.001; u += 0.25) spinePts.push(lerp(sk.pieces[3].o, sk.neck, u));
  for (let u = 0.33; u <= 1.001; u += 0.33) spinePts.push(lerp(sk.neck, sk.neckTop, u));
  for (let i = 0; i < spinePts.length; i++) {
    const back = i < 13 ? sk.pieces[Math.min(3, Math.floor(i / 4))].fwd : sk.hfwd;
    const q = add(spinePts[i], mul(back, -0.5 * k));
    f.egg(bone, q, [0.24 * k, 0.2 * k, 0.11 * k], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 0.02);
    if (i > 0) rod(add(spinePts[i - 1], mul(back, -0.5 * k)), q, 0.08);
  }
  // (the pelvis: its two wings and the sacrum between, the hip joints)
  const pv = sk.pieces[0];
  const PA: readonly [V3, V3, V3] = [pv.across, mul(pv.fwd, -1), pv.up];
  for (const s of [-1, 1]) f.egg(bone, add(add(pv.o, mul(pv.across, s * 0.85 * k)), mul(pv.up, 0.15 * k)), [0.55 * k, 0.32 * k, 0.6 * k], PA, 0.2);
  f.egg(bone, add(pv.o, mul(pv.fwd, -0.45 * k)), [0.32 * k, 0.2 * k, 0.5 * k], PA, 0.2);
  for (const j of [0, 1] as const) ball(sk.hips[j], 0.24);
  // (the collarbones from the notch; the shoulder blades on the back)
  ball(sk.notch, 0.12);
  const ch = sk.pieces[3];
  for (const j of [0, 1] as const) {
    rod(sk.notch, sk.shoulders[j], 0.1, 0.12);
    const s = j ? 1 : -1;
    f.egg(bone, add(add(ch.o, mul(ch.across, s * 1.15 * k)), add(mul(ch.fwd, -0.95 * k), mul(ch.up, 0.55 * k))), [0.55 * k, 0.12 * k, 0.75 * k], [ch.across, mul(ch.fwd, -1), ch.up], 0.1);
    rod(sk.shoulders[j], add(add(ch.o, mul(ch.across, s * 1.15 * k)), add(mul(ch.fwd, -0.95 * k), mul(ch.up, 1.1 * k))), 0.08);
    // (the arm: upper arm, elbow, forearm's two bones)
    ball(sk.shoulders[j], 0.22);
    rod(sk.shoulders[j], sk.elbows[j], 0.17, 0.13);
    ball(sk.elbows[j], 0.17);
    const off = mul(unit(cross(sub(sk.wrists[j], sk.elbows[j]), sk.handFrames[j].y)), 0.09 * k);
    rod(add(sk.elbows[j], off), add(sk.wrists[j], off), 0.08, 0.1);
    rod(sub(sk.elbows[j], off), sub(sk.wrists[j], off), 0.09, 0.07);
    ball(sk.wrists[j], 0.13);
    // (the leg: thigh, knee and its cap, shin, ankle; the foot to its ball, the toes)
    rod(sk.hips[j], sk.knees[j], 0.2, 0.15);
    ball(sk.knees[j], 0.2);
    rod(sk.knees[j], sk.ankles[j], 0.15, 0.1);
    ball(sk.ankles[j], 0.15);
    rod(sk.ankles[j], sk.heels[j], 0.13, 0.12);
    rod(sk.heels[j], sk.balls[j], 0.12, 0.1);
    rod(sk.ankles[j], sk.balls[j], 0.1, 0.09);
    ball(sk.balls[j], 0.12);
    rod(sk.balls[j], sk.toes[j], 0.08, 0.06);
  }
  ball(sk.neck, 0.13);
  ball(sk.neckTop, 0.12);
  for (const P of sk.pieces) ball(add(P.o, mul(P.fwd, -0.5 * k)), 0.15);
}
