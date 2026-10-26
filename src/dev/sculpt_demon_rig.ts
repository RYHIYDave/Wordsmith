// THE WARLOCK'S DEMON ON A MOVING SKELETON (the art chat, 26 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words of the first change into the demon, 26 Oct: “Well let’s see.  I’d like a little bit of an actual transition
// from one to the other.  Not just a smoke cloud obscuring the change.  Also he’s facing one way and the demon is facing
// the other.  That might just be because that’s the only drawing of the demon you have”. So the demon he said yes to
// (dev/sculpt_demon.ts, a still, its every part placed by hand) is built here on the heroes' bones (art/skeleton.ts),
// on a build of its own, so that it can face as he faces, move, and be changed into.
//
// HOW ITS LOOK IS KEPT: its rest pose (DEMON_REST) puts its joints where the still has them; each part of the still is
// carried by the bone it belongs to (its belly by the belly, its chest by the chest, its hump, wings and spines by the top of
// its back, its head, horns and jaws by its head, its hips, rag and tail by its hips): where the part lies from that bone at
// rest, it lies from it in any pose. Its limbs are built on its limbs' joints, as the still builds them. At rest it is the
// still, turned as the still is turned.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import type { GameView, PaintView } from '../art/skin';
import { add, buildOf, cross, elbowFor, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, Rot, Skeleton, V3 } from '../art/skeleton';
import { Sculpt, draw, onCone } from './sculpt';
import type { Cone, Drawn } from './sculpt';
import { HULK_CANVAS, HULK_HIDES, drawAura } from './demon_hulk';
import type { Aura } from './demon_hulk';
import { IVORY, STEEL5, handFire } from './sculpt_warlock';
import { demonHand, five, lifted, tone5 } from './sculpt_demon';

/** ITS BUILD: a hulking brute on goat legs (its hock the rig's ankle, its hoof the rig's toe), long arms, a short thick neck. */
export const DEMON_B: Build = {
  ...buildOf(95, 1),
  ankle: 13, shank: 22.5, thigh: 20.5, hipHalf: 10, stance: 13.5,
  waist: 9, ribs: 9, chest: 20, shoulderHalf: 21, shoulderDrop: 3,
  neck: 7, headUp: -5, headFwd: 15, headR: [10.6, 11.2, 11.2],
  upperArm: 33, foreArm: 35, heel: 2, ball: 9,
  ribHalf: 16, ribDeep: 12.5, waistHalf: 11, waistDeep: 10.5, pelvisHalf: 11, pelvisDeep: 9.5,
  armR: [7.4, 6.6, 5.0], legR: [8, 5.8, 3.8], pad: 1.4,
};

/** Where the still has its joints, in its own measure (forward, its left, up from the floor under it). */
const STILL = { elbowL: [14, 36, 44] as V3, elbowR: [18, -40, 66] as V3 };

/** ITS REST: crouched low and forward as the still is, its right claw raised with the fire in it, its left planted on the floor. */
export const DEMON_REST: Bones = (() => {
  const q: Bones = {
    ...standing(DEMON_B),
    px: -2, pz: -13, pitch: 0, bend: 8, hunch: 46, shrug: 0, faceUp: -4,
    lhIn: 2, lhx: 22, lhy: 32, lhz: 10, le: 0,
    rhIn: 2, rhx: 38, rhy: -36, rhz: 84, re: 0,
    lfx: -6, lfy: 0, lfz: 0, rfx: -8, rfy: 0, rfz: 0, lk: 10, rk: -10,
  } as Bones;
  const s0 = solve(DEMON_B, q as Posed);
  q.le = elbowFor(DEMON_B, q as Posed, true, sub(STILL.elbowL, lerp3(s0.shoulderL, s0.handL, 0.5)));
  q.re = elbowFor(DEMON_B, q as Posed, false, sub(STILL.elbowR, lerp3(s0.shoulderR, s0.handR, 0.5)));
  return q;
})();
const REST = solve(DEMON_B, DEMON_REST as Posed);

/** The bones its parts are carried by: where each is, and how it is turned. */
type Region = 'hips' | 'belly' | 'chest' | 'upper' | 'head';
const regionOf = (s: Skeleton, r: Region): { at: V3; rot: Rot } =>
  r === 'hips' ? { at: s.pelvis, rot: s.hips } : r === 'belly' ? { at: s.waist, rot: s.belly } : r === 'chest' ? { at: s.ribs, rot: s.chest } : r === 'upper' ? { at: s.back, rot: s.upper } : { at: s.head, rot: s.face };
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** A point of the still (its own measure), carried by a bone into a pose: where it lies from the bone at rest, it lies from it now. */
function carrier(s: Skeleton) {
  const at = (r: Region, p: V3): V3 => {
    const a = regionOf(REST, r);
    const b = regionOf(s, r);
    const d = sub(p, a.at);
    const o: V3 = [dot(d, a.rot[0]), dot(d, a.rot[1]), dot(d, a.rot[2])];
    return add(b.at, add(add(mul(b.rot[0], o[0]), mul(b.rot[1], o[1])), mul(b.rot[2], o[2])));
  };
  const way = (r: Region, v: V3): V3 => {
    const a = regionOf(REST, r).rot;
    const b = regionOf(s, r).rot;
    const o: V3 = [dot(v, a[0]), dot(v, a[1]), dot(v, a[2])];
    return add(add(mul(b[0], o[0]), mul(b[1], o[1])), mul(b[2], o[2]));
  };
  return { at, way };
}

export interface DemonLook {
  aura?: Aura;
  hide?: number;
}

/** THE DEMON on its bones, in a pose, from in front or behind (behind as the camera truly sees it, as the warlock), turned `turn` on the spot. */
export function sculptDemonRig(view: GameView, pose: Bones = DEMON_REST, turn = 0, look: DemonLook = {}): Drawn {
  const pv: PaintView = view === 'back' ? 'rear' : view;
  const s = solve(DEMON_B, pose as Posed);
  const C = carrier(s);
  const sc = new Sculpt();
  sc.spin = turn;
  const F0: V3 = [1, 0, 0];
  const L0: V3 = [0, 1, 0];
  const U: V3 = [0, 0, 1];
  const P = (f: number, l: number, u: number): V3 => [f, l, u];
  /** a part's axes, carried by its bone */
  const X = (r: Region, rf: number, rl: number, ru: number): readonly [V3, V3, V3] => [mul(C.way(r, F0), rf), mul(C.way(r, L0), rl), mul(C.way(r, U), ru)];
  const at = C.at;
  const hide5 = lifted(five(HULK_HIDES[look.hide ?? 0].hide));
  /** Is a point on its far side from the eye (a step darker, as the heroes' far limbs are). */
  const a = ((turn ?? 0) * Math.PI) / 180;
  const spun = (p: V3): V3 => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const nearOf = (p: V3): number => {
    const q = spun(p);
    return pv === 'front' ? 0.612 * (q[0] - q[1]) + 0.5 * q[2] : pv === 'rear' ? 0.612 * (-q[0] - q[1]) + 0.5 * q[2] : 0.612 * (q[1] - q[0]) + 0.5 * q[2];
  };
  const farL = nearOf(add(s.pelvis, [0, 20, 6])) < nearOf(s.pelvis);
  const farPiece = (piece: string): boolean => (piece.endsWith('L') ? farL : piece.endsWith('R') ? !farL : false);
  const chestRef = at('chest', P(18, 6, 62));
  const hide = sc.mat({
    ramp: hide5,
    crease: 0.7,
    paint: (h) => {
      const p = h.prim;
      if (p.k === 'cone' && (p.tag === 'fore' || p.tag === 'upper')) {
        const { t, around } = onCone(p, h.p, U);
        const zig = Math.sin(t * 20 + around * 1.3) * 0.32;
        if (Math.abs(around - 0.5 - zig) < 0.14) return h.tone >= 2 ? CYAN[3] : CYAN[2];
      }
      if (p.tag === 'chest') {
        // a crack branching down over its heart
        const v = sub(h.p, chestRef);
        const cu = C.way('chest', U);
        const cl = C.way('chest', L0);
        const down = -dot(v, cu);
        const across = dot(v, cl);
        if (down > -1 && down < 12 && Math.abs(across - Math.sin(down * 0.7) * 1.6 - down * 0.25) < 0.55) return h.tone >= 2 ? CYAN[3] : CYAN[2];
      }
      return farPiece(p.piece) ? tone5(hide5, h.tone - 1) : null;
    },
  });
  const headU = C.way('head', U);
  const horn = sc.mat({
    ramp: IVORY,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const { t } = onCone(h.prim as Cone, h.p, headU);
      return Math.floor(t * 3.4 + (h.prim.tag === 'ring' ? 0.5 : 0)) % 2 === 0 ? tone5(IVORY, h.tone - 1) : null;
    },
  });
  const bone = sc.mat({ ramp: IVORY });
  const steel = sc.mat({ ramp: STEEL5 });
  const mouth = sc.mat({ ramp: ['#120206', '#2a0610', '#3e0a16', '#5a1220', '#7a1c2a'] });
  const plate = sc.mat({ ramp: ['#100c16', '#241e2c', '#3e3646', '#6e6478', '#9a90a6'] });
  const shagMat = (h: { x: number; y: number; tone: number }): string | null => ((h.x * 2 + (h.y >> 1)) % 5 === 0 ? tone5(hide5, h.tone - 2) : (h.x + h.y * 3) % 7 === 0 ? tone5(hide5, h.tone - 1) : null);

  // ---- THE TRUNK (carried by its belly, chest, the top of its back and its hips)
  sc.ell(hide, 'torso', at('belly', P(5, 0, 50)), X('belly', 10.5, 11, 10), 2.6, { tag: 'belly' });
  sc.ell(hide, 'torso', at('chest', P(9, 0, 62)), X('chest', 12.5, 16, 12), 3.0, { tag: 'chest' });
  for (const side of [1, -1]) sc.ell(hide, 'torso', at('chest', P(17, side * 8.4, 64)), X('chest', 5.4, 8.6, 7), 2.2, { tag: 'chest' });
  for (const up of [46, 53]) for (const side of [1, -1]) sc.ell(hide, 'torso', at('belly', P(14.2, side * 4.6, up)), X('belly', 3.4, 4.4, 3.4), 1.6, { tag: 'abs' });
  sc.ell(hide, 'torso', at('upper', P(-3, 0, 75)), X('upper', 8.5, 13, 7), 3.0, { tag: 'hump' });
  for (const side of [1, -1]) sc.ell(hide, 'torso', at('upper', P(2, side * 12, 75)), X('upper', 7, 7.5, 6.5), 2.6, { tag: 'trap' });
  sc.ell(hide, 'hips', at('hips', P(-2, 0, 44)), X('hips', 9.5, 11, 8), 2.6, { tag: 'pelvis' });
  for (let i = 0; i < 6; i++) {
    const r: Region = i < 3 ? 'upper' : 'chest';
    const p0 = P(-14 - i * 0.6, 0, 78 - i * 6.6);
    const tip = add(p0, add(mul(F0, -9 + i * 0.6), mul(U, 6 - i * 0.6)));
    sc.cone(bone, 'spines', at(r, p0), at(r, tip), 3.0 - i * 0.25, 0.2, 0.6, { tag: 'spine' });
  }
  // a rag of his coat round its loins, its red hem
  const rag = sc.mat({ ramp: ['#0a0816', '#161226', '#262040', '#3c345a', '#58507c'], paint: (h) => (dot(sub(h.p, s.pelvis), C.way('hips', U)) < -11 ? ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'][Math.max(0, Math.min(4, h.tone))] : null) });
  const hipU = C.way('hips', U);
  sc.cone(rag, 'hips', at('hips', P(-1, 0, 48)), at('hips', P(1, 0, 30)), 13.5, 16.5, 1.6, { tag: 'rag', cuts: [{ n: mul(hipU, -1) as V3, o: -dot(hipU, at('hips', P(1, 0, 30))) }] });
  sc.ell(rag, 'hips', at('hips', P(-1, 0, 46)), X('hips', 12.5, 13.5, 4), 1.0, { tag: 'rag' });
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    const deep = 3 + ((i * 7) % 5);
    sc.ell(rag, 'hips', at('hips', P(Math.cos(ang) * 15.5, Math.sin(ang) * 17.5, 30)), X('hips', 2.2, 2.2, deep), 0.3, { carve: true });
  }

  // ---- THE HEAD (carried by its head): hung low and forward under the hump
  const HK = 1.18;
  sc.cone(hide, 'head', at('upper', P(10, 0, 74)), at('head', P(28, 0, 72)), 8, 6.5, 2.6, { tag: 'neck' });
  sc.ell(hide, 'head', at('head', P(28, 0, 72)), X('head', 9 * HK, 9.5 * HK, 9.5 * HK), 2.0, { tag: 'skull' });
  sc.ell(hide, 'head', at('head', P(34, 0, 75.5)), X('head', 4.6, 10, 3), 0.8, { tag: 'brow' });
  sc.box(hide, 'head', at('head', P(35, 0, 67.5)), X('head', 6, 7.6, 4.0), 2.2, 1.0, { tag: 'snout' });
  sc.box(hide, 'jaw', at('head', P(35, 0, 59.5)), X('head', 7, 8.6, 3.0), 1.8, 1.0, { tag: 'jaw' });
  for (const side of [1, -1]) sc.ell(hide, 'head', at('head', P(31, side * 8.5, 70)), X('head', 4, 3, 4.5), 1.0, { tag: 'cheek' });
  sc.ell(mouth, 'jaw', at('head', P(37, 0, 63.8)), X('head', 5.2, 6.4, 2.4), 0.6, { tag: 'maw' });
  for (const [fx, fl, up] of [[41.5, 4, 1], [41.5, -4, 1], [39, 6, 1], [39, -6, 1], [42, 2, -1], [42, -2, -1], [40, 5, -1], [40, -5, -1]] as const) {
    const root = P(fx, fl, up > 0 ? 66 : 61.5);
    sc.cone(bone, 'jaw', at('head', root), at('head', add(root, mul(U, -up * 3.2))), 0.9, 0.05, 0.1, { tag: 'fang' });
  }
  for (const side of [1, -1]) sc.cone(hide, 'head', at('head', P(22, side * 8, 76)), at('head', P(16, side * 15, 80)), 2.2, 0.3, 0.8, { tag: 'ear' });
  for (const side of [1, -1]) {
    sc.mark(at('head', P(37, side * 4.6, 72.6)), '#ffffff', 2, 1, side > 0 ? 0 : -1, 0, 3);
    sc.mark(at('head', P(37, side * 4.6, 72.6)), CYAN[3], 2, 1, side > 0 ? 2 : -3, -1, 3);
  }
  for (const side of [1, -1]) {
    const pts = [P(27, side * 7, 80), P(27, side * 15, 84), P(33, side * 22, 88), P(43, side * 23, 88), P(51, side * 19, 84)].map((p) => at('head', p));
    let r = 4.4;
    for (let i = 0; i < pts.length - 1; i++) {
      sc.cone(horn, 'horns', pts[i], pts[i + 1], r, Math.max(0.3, r - 1.05), 0.8, { tag: i % 2 ? 'ring' : 'h' });
      r = Math.max(0.3, r - 1.05);
    }
  }

  // ---- THE ARMS, on its arms' joints: a shoulder like a boulder under a crest of bone plates and a spike; forearms like
  // trunks, spines and plates down them; a broken shackle at each wrist; hands like shovels; long hooked claws
  let fireAt: V3 | null = null;
  const back = C.way('upper', mul(F0, -1) as V3);
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'armL' : 'armR';
    const raised = side < 0;
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const el = side > 0 ? s.elbowL : s.elbowR;
    const ha = side > 0 ? s.handL : s.handR;
    sc.ell(hide, piece, sh, X('upper', 8.2, 8.2, 7.8), 2.4, { tag: 'delt' });
    sc.cone(hide, piece, sh, lerp3(sh, el, 0.5), 6.8, 7.4, 1.8, { tag: 'upper' });
    sc.cone(hide, piece, lerp3(sh, el, 0.5), el, 7.4, 5.8, 1.8, { tag: 'upper' });
    sc.cone(hide, piece, el, lerp3(el, ha, 0.35), 6.2, 7.6, 1.8, { tag: 'fore' });
    sc.cone(hide, piece, lerp3(el, ha, 0.35), ha, 7.6, 5.0, 1.8, { tag: 'fore' });
    // the crest of bone plates over the shoulder, a spike off the biggest (carried as the top of its back carries it)
    const shRest = side > 0 ? REST.shoulderL : REST.shoulderR;
    const over = (p: V3): V3 => add(sh, C.way('upper', sub(p, shRest)));
    for (const [k, r] of [[0, 6.4], [1, 5.2], [2, 4.2]] as const) {
      const p = add(shRest, add(mul(U, 9 - k * 3.2), add(mul(F0, -2 + k * 2.6), mul(L0, side * (3 - k * 1.2)))));
      sc.ell(plate, piece, over(p), X('upper', r * 0.9, r, r * 0.55), 0.4, { tag: 'plate' });
    }
    const s0 = add(shRest, add(mul(U, 13), mul(L0, side * 3)));
    sc.cone(plate, piece, over(s0), over(add(s0, add(mul(U, 9), add(mul(L0, side * 5), mul(F0, -2))))), 3.0, 0.2, 0.4, { tag: 'spike' });
    // spines and plates down the forearm
    const out = C.way('upper', mul(L0, side) as V3);
    for (let i = 1; i <= 3; i++) {
      const p = lerp3(el, ha, 0.15 + i * 0.2);
      sc.cone(bone, piece, add(p, mul(back, 4.8)), add(p, add(mul(back, 11.5 - i * 2), mul(U, 2))), 2.0, 0.2, 0.5, { tag: 'spine' });
      sc.ell(plate, piece, add(lerp3(el, ha, 0.2 + i * 0.2), mul(out, 6.8)), X('upper', 3.8, 2.1, 3.2), 0.6, { tag: 'plate' });
    }
    // the broken shackle and its chain
    const cuff = lerp3(ha, el, 0.2);
    const fa = norm(sub(ha, el));
    sc.cone(steel, piece, add(cuff, mul(fa, -1.8)), add(cuff, mul(fa, 1.8)), 6.4, 6.4, 0.4, { tag: 'shackle' });
    const fwd = C.way('upper', F0);
    for (let i = 0; i < 3; i++) {
      const p = add(cuff, add(mul(U, -(i * 4.6 + 3)), mul(fwd, 3 + i * 0.8)));
      sc.ell(steel, piece, p, X('upper', 1.6, i % 2 ? 0.9 : 2.2, 2.6), 0, { tag: 'link' });
    }
    // THE HAND, BUILT AS A HAND (dev/sculpt_demon.ts demonHand)
    const fire = demonHand(sc, hide, bone, piece, ha, el, raised);
    if (fire) fireAt = fire;
  }

  // ---- THE LEGS, on its legs' joints: a goat's, short and thick, coarse hair from the thigh down, a cloven hoof, spurs of
  // bone at the hock
  const shag = sc.mat({ ramp: hide5, paint: shagMat });
  const feet: V3[] = [];
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'legL' : 'legR';
    const hip = side > 0 ? s.hipL : s.hipR;
    const knee = side > 0 ? s.kneeL : s.kneeR;
    const hock = side > 0 ? s.ankleL : s.ankleR;
    const toe = side > 0 ? s.toeL : s.toeR;
    const heel = side > 0 ? s.heelL : s.heelR;
    const hoof: V3 = [toe[0], toe[1], toe[2] + 3.4];
    const ff = norm([toe[0] - heel[0], toe[1] - heel[1], 0], F0);
    sc.cone(hide, piece, hip, knee, 8, 5.8, 2.2, { tag: 'thigh' });
    sc.cone(shag, piece, knee, hock, 6.0, 3.8, 1.4, { tag: 'shank' });
    sc.cone(shag, piece, hock, hoof, 3.6, 2.8, 1.2, { tag: 'pastern' });
    sc.box(horn, piece, add(hoof, add(mul(ff, 2.0), [0, 0, 0.3])), [mul(ff, 5.2), mul(norm(cross(U, ff)), 3.8), mul(U, 2.7)], 1.4, 0.6, { tag: 'hoof' });
    sc.cone(bone, piece, add(hock, mul(ff, -2)), add(hock, add(mul(ff, -9), mul(U, 2))), 2.0, 0.2, 0.4, { tag: 'spur' });
    feet.push(hoof);
  }
  // ---- THE TAIL (carried by its hips): heavy, from the small of its back down to the floor and away, a hooked spike at its end
  {
    const pts = [P(-14, 0, 44), P(-26, -6, 30), P(-30, -18, 12), P(-22, -32, 6), P(-12, -40, 10)].map((p) => at('hips', p));
    for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 4.6 - i * 0.9, 3.7 - i * 0.85, 1.4, { tag: 'tail' });
    sc.cone(horn, 'tail', pts[4], at('hips', P(-4, -44, 18)), 2.4, 0.2, 0.4, { tag: 'tailspike' });
  }
  // ---- THE WINGS (carried by the top of its back): great and tattered, half open behind it
  const leather = sc.mat({
    ramp: ['#0a0306', '#1c0810', '#2e0e18', '#4a1a24', '#6a2a30'] as Ramp,
    paint: (h) => ((h.x * 3 + h.y * 2) % 13 === 0 ? tone5(hide5, Math.max(0, h.tone - 2)) : null),
  });
  for (const side of [1, -1] as const) {
    const W = (f: number, l: number, u: number): V3 => at('upper', P(f, side * l, u));
    const root = W(-12, 12, 82);
    const elbow = W(-22, 34, 104);
    const wrist = W(-26, 50, 128);
    const tips = [W(-28, 64, 124), W(-30, 78, 102), W(-28, 74, 72), W(-24, 60, 48)];
    const flank = W(-12, 22, 54);
    sc.cone(hide, 'wings', root, elbow, 3.6, 3.0, 1.2, { tag: 'wingarm' });
    sc.cone(hide, 'wings', elbow, wrist, 3.0, 2.2, 1.0, { tag: 'wingarm' });
    for (const t of tips) sc.cone(horn, 'wings', wrist, t, 1.8, 0.5, 0.4, { tag: 'finger' });
    sc.cone(bone, 'wings', wrist, W(-24, 52, 136), 2.0, 0.2, 0.3, { tag: 'thumbclaw' });
    const edges = [...tips, flank];
    const sheet = (p: V3, q: V3, r: V3): void => {
      sc.tri(leather, 'wings', p, q, r, 0.7, 0.8, { tag: 'membrane' });
    };
    for (let i = 0; i + 2 < edges.length; i++) sheet(wrist, edges[i], edges[i + 1]);
    sheet(wrist, tips[tips.length - 1], elbow);
    sheet(elbow, tips[tips.length - 1], flank);
    sheet(root, elbow, flank);
    for (let i = 0; i + 1 < edges.length; i++) {
      const a0 = i === edges.length - 2 ? elbow : wrist;
      const mid = lerp3(edges[i], edges[i + 1], 0.5);
      const inward = norm(sub(a0, mid));
      const span = Math.hypot(...sub(edges[i], edges[i + 1]));
      const n = norm(cross(sub(edges[i], a0), sub(edges[i + 1], a0)));
      sc.ell(leather, 'wings', add(mid, mul(inward, -span * 0.4)), [mul(inward, span * 0.5), mul(norm(cross(n, inward)), span * 0.34), mul(n, 3)], 0.3, { carve: true });
      if (i === 1) sc.ell(leather, 'wings', lerp3(a0, mid, 0.8), [mul(inward, 1.6), mul(norm(cross(n, inward)), 0.8), mul(n, 3)], 0.2, { carve: true });
    }
  }

  const seat = fireAt ?? s.handR;
  const d = draw(sc, pv, HULK_CANVAS.ax, HULK_CANVAS.ay, HULK_CANVAS, (st) => handFire(st, sc.at(seat), 4.0, 2), FRIEND_RIM);
  const behind = nearOf(C.way('hips', F0)) < nearOf([0, 0, 0]);
  const ups = (p: V3): V3 => sc.at(p);
  drawAura(d.st, d.px, look.aura ?? 'smoke', {
    from: [at('upper', P(-6, 0, 88)), at('upper', P(0, 20, 86)), at('upper', P(0, -20, 86)), at('upper', P(-12, 12, 82)), at('upper', P(-12, -12, 82)), lerp3(s.elbowR, s.handR, 0.4), lerp3(s.elbowL, s.handL, 0.6), at('upper', P(-2, 0, 70))].map(ups),
    horns: [P(51, 19, 84), P(51, -19, 84), P(43, 23, 88), P(43, -23, 88)].map((p) => ups(at('head', p))),
    jaw: ups(at('head', P(40, 0, 62))),
    claws: [ups(seat), ups(s.handL)],
    feet: feet.map(ups),
    behind,
  });
  // NO PIXEL ALONE (his rulebook's Pixels 1): as the still (dev/sculpt_demon.ts)
  const { w, h, d: px } = d.px;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] === 255;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y) || solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) continue;
      const i = (y * w + x) * 4;
      const j = ((y + 1) * w + x) * 4;
      if (px[j + 3] === 0) {
        px[j] = px[i];
        px[j + 1] = px[i + 1];
        px[j + 2] = px[i + 2];
        px[j + 3] = 255;
      } else px[i + 3] = 0;
    }
  }
  return d;
}
