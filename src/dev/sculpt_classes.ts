// THE NEW CLASSES, SCULPTED (the art chat, 23 Oct 2026). MOCK-UPS; NOTHING OF THE GAME IMPORTS IT.
//
// His brief (docs/mockups/classes/BRIEF.md), and his word on the sketches, 23 Oct, by 22:21 Pacific: “Wrap the fists but
// keep the outfit.  And make sure the characters don’t just look like circles and squares slapped together”. So each is
// sculpted (dev/sculpt.ts): built on the heroes' bones (art/skeleton.ts) as the sketches were, so it moves as they do, but
// its body one piece of flesh, muscle melted into muscle, its clothes laid over it, each stuff inked off from the next.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { HEAD_B } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { add, buildOf, cross, lerp3, mul, norm, project, solve, standing, sub, trunkOf } from '../art/skeleton';
import type { Bones, Build, Posed, Shape, Skeleton, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Drawn, Ell, Hit } from './sculpt';

// ---------------------------------------------------------------------------------------------
// Colours (none of them glows)

/** Skin: a man's, warm under the dungeon's cool light (the style's lavender would read as a purple lump on a bare chest). */
export const SKIN_W: Ramp = ['#3a1c34', '#6e3a50', '#b06a6a', '#e09a84', '#ffd2b0'];
/** The brawler's red: the singlet and the trunks. */
export const RED: Ramp = ['#3a0618', '#6e1024', '#b8202e', '#ec4a3a', '#ff8a5a'];
/** Wraps: linen gone grey with use. */
export const WRAP: Ramp = ['#3a3450', '#5a5474', '#9a94b4', '#d4cee6', '#f4f0ff'];
/** Leather, boots and cuffs. */
export const HIDE: Ramp = ['#1e1018', '#3a2026', '#64382e', '#94583c', '#b8784e'];
/** A big yellow beard. */
const BEARD: Ramp = ['#5a3418', '#8a5a24', '#d09a34', '#f4cc58', '#fff09a'];

/** Brass: a buckle, gears, fittings. */
export const BRASS: Ramp = ['#3a2410', '#5e4018', '#94702a', '#d0a84a', '#f6e08a'];

export const shadeOf = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, k))];

/** How far below his left shoulder's top the singlet's neckline runs (it slants down across him to under his right arm). */
export const TUNE = { cutDrop: 7.0 };
/** How big his fists are (1.15: about two thirds of his head across, after his “His hands are tiny compared to his body”). */
export const FIST = { k: 1.15 };
const CUT_DROP_OF = (): number => TUNE.cutDrop;

// ---------------------------------------------------------------------------------------------
// The body

export interface Who {
  s: Skeleton;
  B: Build;
  view: GameView;
  /** How far the figure is truly turned (Sculpt.spin), for which side of it is the far one. */
  spin?: number;
}

/** How near the eye a point is in a view (bigger nearer). */
const nearIn = (view: GameView, p: V3): number => project(p, view)[2];

/** A part of the far side of the body from the eye: painted a step darker, as the heroes' far arm and leg are. */
export function farSide(w: Who, p: V3): boolean {
  const a = ((w.spin ?? 0) * Math.PI) / 180;
  const t = (q: V3): V3 => [q[0] * Math.cos(a) - q[1] * Math.sin(a), q[0] * Math.sin(a) + q[1] * Math.cos(a), q[2]];
  return nearIn(w.view, t(p)) < nearIn(w.view, t(w.s.pelvis)) - 1.6;
}

/** The three ways a limb's own frame lies: along it, out (away from the body's middle line), and the third. */
export function limbFrame(a: V3, b: V3, out: V3): readonly [V3, V3, V3] {
  const d = norm(sub(b, a));
  const o0 = sub(out, mul(d, out[0] * d[0] + out[1] * d[1] + out[2] * d[2]));
  const o = norm(o0, [0, 0, 1]);
  return [d, o, norm(cross(d, o))];
}

/** A man's body of flesh, sculpted on the bones. `bulk`: how heavily muscled (1 a strong man). */
export function manBody(sc: Sculpt, w: Who, skin: number, bulk = 1, noArm: 'L' | 'R' | null = null): void {
  const { s, B } = w;
  const [f, l, u] = s.chest;
  const trunk = trunkOf(B, s);
  const [ribs, belly] = trunk;
  const k = bulk;
  // THE TRUNK: the ribcage, broad at the top and drawn in to the waist (the V of a fighter), the belly under it
  sc.ell(skin, 'torso', ribs.c, [mul(ribs.r[0], ribs.h[0] * 0.92), mul(ribs.r[1], ribs.h[1] * 0.98), mul(ribs.r[2], ribs.h[2] * 1.02)], 2.2, { tag: 'ribs' });
  sc.ell(skin, 'torso', add(s.neck, add(mul(u, -3.2 * k), mul(f, -0.4))), [mul(f, ribs.h[0] * 0.8), mul(l, B.shoulderHalf * 0.86), mul(u, 2.8)], 2.4, { tag: 'yoke' });
  sc.ell(skin, 'torso', add(belly.c, mul(belly.r[0], 0.3)), [mul(belly.r[0], belly.h[0] * 1.0), mul(belly.r[1], belly.h[1] * 0.98), mul(belly.r[2], belly.h[2] * 1.05)], 2.4, { tag: 'belly' });
  // the breast muscles, one each side, and the lats under the arms
  for (const side of [1, -1]) {
    const pc = add(ribs.c, add(mul(f, ribs.h[0] * 0.55), add(mul(l, side * ribs.h[1] * 0.44), mul(u, ribs.h[2] * 0.36))));
    sc.ell(skin, 'torso', pc, [mul(f, 2.0 * k), mul(norm(add(mul(l, 1), mul(u, side * 0.0))), 3.1 * k), mul(u, 2.3 * k)], 1.6, { tag: 'pec' });
    const lat = add(ribs.c, add(mul(f, -ribs.h[0] * 0.2), add(mul(l, side * ribs.h[1] * 0.78), mul(u, ribs.h[2] * 0.05))));
    sc.ell(skin, 'torso', lat, [mul(f, 2.6), mul(l, 1.6 * k), mul(u, 3.6)], 2.0, { tag: 'lat' });
    // the trapezius, from the neck out to the shoulder
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    sc.cone(skin, 'torso', add(s.neck, add(mul(u, -0.2), mul(f, -0.8))), add(sh, add(mul(u, 0.5), mul(f, -0.5))), 1.8 * k, 1.4 * k, 1.8, { tag: 'trap' });
  }
  // THE NECK, thick
  sc.cone(skin, 'head', add(s.neck, mul(u, -1.5)), s.skull, 2.4 * k, 2.1 * k, 1.4, { tag: 'neck' });
  // THE ARMS
  for (const side of ['L', 'R'] as const) {
    if (side === noArm) continue;
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const sign = side === 'L' ? 1 : -1;
    const piece = `arm${side}`;
    const outward = mul(l, sign);
    // the shoulder's cap, melted into the yoke
    const [, o0] = limbFrame(sh, el, outward);
    sc.ell(skin, piece, add(sh, add(mul(u, -0.5), mul(o0, 0.8))), [mul(f, 2.8 * k), mul(o0, 2.5 * k), mul(u, 2.5 * k)], 1.9, { tag: 'delt' });
    // the upper arm, its biceps on the front of it
    const [ud, uo, uw] = limbFrame(sh, el, outward);
    sc.cone(skin, piece, sh, el, 2.55 * k, 2.0 * k, 1.4, { tag: 'upper' });
    const front = norm(add(mul(f, 1), mul(uo, -0.2)));
    sc.ell(skin, piece, add(lerp3(sh, el, 0.52), mul(front, 0.9)), [mul(ud, 3.0), mul(uo, 1.9 * k), mul(uw, 1.9 * k)], 1.4, { tag: 'bicep' });
    sc.ell(skin, piece, add(lerp3(sh, el, 0.45), mul(front, -1.0)), [mul(ud, 3.2), mul(uo, 1.8 * k), mul(uw, 1.7 * k)], 1.4, { tag: 'tricep' });
    // the forearm, thick by the elbow, drawn in to the wrist
    const wrist = lerp3(el, ha, 0.78);
    sc.cone(skin, piece, el, wrist, 2.2 * k, 1.45 * k, 1.3, { tag: 'fore' });
    const [fd, fo, fw] = limbFrame(el, ha, outward);
    sc.ell(skin, piece, add(lerp3(el, ha, 0.24), mul(fo, 0.5)), [mul(fd, 2.6), mul(fo, 1.9 * k), mul(fw, 1.8 * k)], 1.4, { tag: 'foreBulge' });
    void uw;
  }
  // THE LEGS
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const piece = `leg${side}`;
    const [lH, lK, lA] = B.legR;
    sc.cone(skin, piece, hip, knee, lH * 1.05, lK * 1.02, 1.6, { tag: 'thigh' });
    const [td, to] = limbFrame(hip, knee, f);
    sc.ell(skin, piece, add(lerp3(hip, knee, 0.45), mul(to, 0.9)), [mul(td, 4.2), mul(to, 2.4), mul(norm(cross(td, to)), 2.6)], 1.6, { tag: 'quad' });
    sc.cone(skin, piece, knee, ankle, lK * 0.98, lA * 0.95, 1.2, { tag: 'shin' });
    const [sd, so] = limbFrame(knee, ankle, f);
    sc.ell(skin, piece, add(lerp3(knee, ankle, 0.3), mul(so, -0.9)), [mul(sd, 3.2), mul(so, 1.9), mul(norm(cross(sd, so)), 2.0)], 1.4, { tag: 'calf' });
  }
}

/** A man's head, sculpted: skull, jaw, brow and nose, ears; `bald`: the skull bare. */
export function manHead(sc: Sculpt, w: Who, skin: number, eyesAt?: (h: Hit) => string | null): void {
  const { s, B } = w;
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const at = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  // (a skull a little low and broad over the brow, as a fighter's; the jaw heavy; a brow that juts; a nose broken once or twice)
  sc.ell(skin, 'head', at(-0.1, 0, -0.04), [mul(hf, R[0] * 0.88), mul(hl, R[1] * 0.96), mul(hu, R[2] * 0.74)], 1.2, { tag: 'skull' });
  sc.ell(skin, 'head', at(0.3, 0, -0.38), [mul(hf, R[0] * 0.66), mul(hl, R[1] * 0.9), mul(hu, R[2] * 0.5)], 1.4, { tag: 'jaw' });
  sc.ell(skin, 'head', at(0.64, 0, 0.26), [mul(hf, R[0] * 0.34), mul(hl, R[1] * 0.82), mul(hu, R[2] * 0.2)], 0.8, { tag: 'brow' });
  sc.cone(skin, 'head', at(0.84, 0, 0.14), at(1.06, 0, -0.12), 0.65, 0.85, 0.6, { tag: 'nose' });
  for (const side of [1, -1]) sc.ell(skin, 'head', at(-0.12, side * 0.9, -0.02), [mul(hf, 0.7), mul(hl, 0.35), mul(hu, 1.0)], 0.4, { tag: 'ear' });
  void eyesAt;
}

/** Where on a head a point is: forward, to its left and up, each a share of the head's own half-lengths. */
export function onHead(w: Who, p: V3): V3 {
  const [hf, hl, hu] = w.s.face;
  const R = w.B.headR;
  const v = sub(p, w.s.head);
  return [(v[0] * hf[0] + v[1] * hf[1] + v[2] * hf[2]) / R[0], (v[0] * hl[0] + v[1] * hl[1] + v[2] * hl[2]) / R[1], (v[0] * hu[0] + v[1] * hu[1] + v[2] * hu[2]) / R[2]];
}

/**
 * A FACE, drawn plainly on a sculpted head, as the heroes' are (dev/options3.ts `features`): at this size a face is a few
 * pixels, so it is DRAWN, not left to the light: a dark line of brow across it, the eyes dark under it, the ear's hollow.
 * `eyes`: the eyes' colour (dark, or a light that glows); `narrow`: a hard squint.
 */
export function faceAt(w: Who, h: Hit, eyes = '#140a18', narrow = false): string | null {
  if (h.prim.tag === 'ear') {
    const [hf, , hu] = onHead(w, h.p);
    if (Math.abs(hu + 0.05) < 0.22 && Math.abs(hf + 0.08) < 0.12) return SKIN_W[1];
    return null;
  }
  const [hf, hl, hu] = onHead(w, h.p);
  if (hf < 0.42) return null;
  const al = Math.abs(hl);
  void eyes;
  void narrow;
  // the shadow under the nose and the cheekbone
  if (hu > -0.32 && hu < -0.2 && al < 0.14) return SKIN_W[Math.max(1, h.tone - 1)];
  return null;
}

/** THE FACE'S MARKS: the eyes and brows put on as pixels where they are seen (the heroes' faces are drawn so). */
export function faceMarks(sc: Sculpt, w: Who, o: { eyes?: string; brow?: string; socket?: string; wide?: number; up?: number; fwd?: number } = {}): void {
  const { s, B } = w;
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const at = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const wide = o.wide ?? 0.36;
  const up = o.up ?? 0.1;
  const fwd = o.fwd ?? 0.86;
  for (const side of [1, -1]) {
    if (o.socket) sc.mark(at(fwd, side * wide, up), o.socket, 2, 1, side > 0 ? 0 : -1);
    sc.mark(at(fwd, side * wide, up), o.eyes ?? '#140a18');
    if (o.brow) sc.mark(at(fwd + 0.06, side * wide, up + 0.22), o.brow, 2, 1, side > 0 ? 0 : -1);
  }
}

/** Dark cloth: breeches, trousers. */
export const CHAR: Ramp = ['#0e0a1a', '#1c162e', '#30294a', '#4a416a', '#665c8c'];
/** Faded blue twill. */
const TWILL: Ramp = ['#0c1024', '#18203e', '#28365e', '#40548a', '#6078ae'];
/** Dark leather, a vest, a harness. */
export const BLACKHIDE: Ramp = ['#0e080e', '#1e1218', '#36222a', '#56383c', '#7a5450'];

/** DRESSING THE BRAWLER in one of his outfits. */
/** A TAILOR for a sculpted body: cloth over its trunk, its legs, boots, a band round the waist, a strap over the chest. */
export function tailorFor(sc: Sculpt, w: Who, bulk: number) {
  const { s, B } = w;
  const [f, l, u] = s.chest;
  const trunk = trunkOf(B, s);
  const [ribs, belly, pel] = trunk;
  const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  /** Cloth over the trunk (the chest, the belly), `pad` off the skin, kept under the cuts. */
  const overTrunk = (mat: number, pad: number, cuts: { n: V3; o: number }[], tag = 'cloth', shoulders = false): void => {
    if (shoulders) {
      // (over the yoke of the shoulders and the trapezius too: a vest, a coat)
      sc.ell(mat, 'torso', add(s.neck, add(mul(u, -3.2 * bulk), mul(f, -0.4))), [mul(f, ribs.h[0] * 0.8 + pad), mul(l, B.shoulderHalf * 0.86 + pad), mul(u, 2.8 + pad)], 2.4, { cuts, tag });
      for (const side of [1, -1]) {
        const sh = side > 0 ? s.shoulderL : s.shoulderR;
        sc.cone(mat, 'torso', add(s.neck, add(mul(u, -0.2), mul(f, -0.8))), add(sh, add(mul(u, 0.5), mul(f, -0.5))), 1.8 * bulk + pad, 1.4 * bulk + pad, 1.8, { cuts, tag });
      }
    }
    sc.ell(mat, 'torso', ribs.c, [mul(ribs.r[0], ribs.h[0] * 0.92 + pad), mul(ribs.r[1], ribs.h[1] * 0.98 + pad), mul(ribs.r[2], ribs.h[2] * 1.02 + pad)], 2.2, { cuts, tag });
    sc.ell(mat, 'torso', add(belly.c, mul(belly.r[0], 0.3)), [mul(belly.r[0], belly.h[0] + pad), mul(belly.r[1], belly.h[1] * 0.98 + pad), mul(belly.r[2], belly.h[2] * 1.05 + pad)], 2.4, { cuts, tag });
    for (const side of [1, -1]) {
      const pc = add(ribs.c, add(mul(f, ribs.h[0] * 0.55), add(mul(l, side * ribs.h[1] * 0.44), mul(u, ribs.h[2] * 0.36))));
      sc.ell(mat, 'torso', pc, [mul(f, 2.0 * bulk + pad), mul(l, 3.1 * bulk + pad), mul(u, 2.3 * bulk + pad)], 1.6, { cuts, tag });
      const lat = add(ribs.c, add(mul(f, -ribs.h[0] * 0.2), add(mul(l, side * ribs.h[1] * 0.78), mul(u, ribs.h[2] * 0.05))));
      sc.ell(mat, 'torso', lat, [mul(f, 2.6 + pad), mul(l, 1.6 * bulk + pad), mul(u, 3.6 + pad)], 2.0, { cuts, tag });
    }
  };
  /** Legs in cloth: the seat, and each leg from the hip to `to` (1 the knee, 2 the ankle), `loose` how far off the leg. */
  const legsIn = (mat: number, to: number, loose: number, high = 0): void => {
    sc.ell(mat, 'hips', pel.c, [mul(pel.r[0], pel.h[0] + 0.7), mul(pel.r[1], pel.h[1] + 0.6), mul(pel.r[2], pel.h[2] + 0.4)], 1.6, { tag: 'seat' });
    if (high > 0) sc.ell(mat, 'hips', add(belly.c, mul(belly.r[2], -belly.h[2] * 0.3)), [mul(belly.r[0], belly.h[0] + 0.75), mul(belly.r[1], belly.h[1] + 0.7), mul(belly.r[2], belly.h[2] * high)], 1.4, { tag: 'seat' });
    for (const side of ['L', 'R'] as const) {
      const hip = side === 'L' ? s.hipL : s.hipR;
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const ankle = side === 'L' ? s.ankleL : s.ankleR;
      const [lH, lK, lA] = B.legR;
      const top = add(hip, mul(s.hips[2], 0.8));
      if (to <= 1) {
        sc.cone(mat, `leg${side}`, top, lerp3(hip, knee, to), lH * 1.05 + loose, lH + (lK - lH) * to + loose * 1.2, 1.4, { tag: 'leg' });
      } else {
        sc.cone(mat, `leg${side}`, top, knee, lH * 1.05 + loose, lK + loose, 1.4, { tag: 'leg' });
        sc.cone(mat, `leg${side}`, knee, lerp3(knee, ankle, to - 1), lK + loose, lK + (lA - lK) * (to - 1) + loose * 1.1, 1.2, { tag: 'shin' });
      }
    }
  };
  /** Boots: to the middle of the shin (`high`), or to the ankle. */
  const boots = (mat: number, high: boolean, laces: Ramp | null): void => {
    for (const side of ['L', 'R'] as const) {
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const ankle = side === 'L' ? s.ankleL : s.ankleR;
      const heel = side === 'L' ? s.heelL : s.heelR;
      const toe = side === 'L' ? s.toeL : s.toeR;
      const [, lK, lA] = B.legR;
      sc.cone(mat, `leg${side}`, lerp3(knee, ankle, high ? 0.42 : 0.82), ankle, high ? lK * 0.98 + 0.35 : lA + 0.7, lA * 0.95 + 0.6, 1.0, { tag: laces ? 'laced' : 'top' });
      const fd = norm(sub(toe, heel));
      const fs = norm(cross([0, 0, 1], fd));
      const half = Math.hypot(...sub(toe, heel)) * 0.5;
      // (the foot turned as the foot is, its sole under it; then set ON the floor, its lowest corner at the floor and no
      // lower: a foot up on its toes stands on them)
      const fup = norm(cross(fd, fs));
      const up3: V3 = fup[2] < 0 ? mul(fup, -1) : fup;
      let fc = add(lerp3(heel, toe, 0.5), mul(up3, 0.9));
      const sc0 = add(fc, mul(up3, -0.85));
      const lowSole = sc0[2] - Math.abs(fd[2]) * (half + 0.8) - Math.abs(fs[2]) * 1.7 - Math.abs(up3[2]) * 0.35;
      const lift = Math.max(0, -lowSole);
      fc = add(fc, [0, 0, lift]);
      sc.box(mat, `leg${side}`, fc, [mul(fd, half + 0.6), mul(fs, 1.55), mul(up3, 1.15)], 0.9, 1.2, { tag: 'foot' });
      sc.box(mat, `leg${side}`, add(fc, mul(up3, -0.85)), [mul(fd, half + 0.8), mul(fs, 1.7), mul(up3, 0.35)], 0.3, 0.3, { tag: 'sole' });
    }
  };
  const bootMat = (ramp: Ramp, laces: Ramp | null): number => sc.mat({
    ramp,
    paint: (h) => {
      if (h.prim.tag === 'laced' && laces) {
        const { t, around } = onCone(h.prim as Cone, h.p, f);
        if (Math.abs(around) < 0.5 && Math.floor(t * 9) % 2 === 0) return shadeOf(laces, h.tone);
      }
      if (h.prim.tag === 'sole') return shadeOf(ramp, h.tone - 2);
      return null;
    },
  });
  /** A band round the waist (a belt, a sash), `tall` high, `out` off the belly. */
  const waistBand = (mat: number, tall: number, out: number, down = 0.55): V3 => {
    const bc = add(belly.c, mul(belly.r[2], -belly.h[2] * down));
    sc.ell(mat, 'hips', bc, [mul(belly.r[0], belly.h[0] + out), mul(belly.r[1], belly.h[1] + out - 0.1), mul(belly.r[2], tall)], 0.4, { tag: 'band' });
    return bc;
  };
  /** A strap laid over the trunk from `a` to `b` (each a point of the body's surface, lifted `lift` off it), through `n` bends. */
  const strapOver = (mat: number, a: V3, b: V3, r: number, lift: number, tag = 'strap'): void => {
    const pts: V3[] = [];
    for (let i = 0; i <= 4; i++) {
      const p = lerp3(a, b, i / 4);
      // (pushed out from the spine to lie on the chest's curve)
      const fromSpine = sub(p, lerp3(s.waist, s.neck, 0.5));
      const along = dot3(fromSpine, f);
      const side = dot3(fromSpine, l);
      const out = norm(add(mul(f, along), mul(l, side)));
      const reach = Math.hypot(along, side);
      const want = Math.max(reach, i === 0 || i === 4 ? reach : ribs.h[0] * 0.92 + 1.6 + lift);
      pts.push(add(p, mul(out, want - reach + lift)));
    }
    for (let i = 0; i < 4; i++) sc.cone(mat, 'torso', pts[i], pts[i + 1], r, r, 0.3, { tag });
  };
  const front = (side: number, up: number, out: number): V3 => add(ribs.c, add(mul(f, ribs.h[0] * 0.9 + out), add(mul(l, side * ribs.h[1] * 0.5), mul(u, up))));
  const shoulderTop = (side: number, fwd: number): V3 => add(side > 0 ? s.shoulderL : s.shoulderR, add(mul(u, 2.4), add(mul(l, -side * 1.6), mul(f, fwd))));
  const hipFront = (side: number): V3 => add(belly.c, add(mul(f, belly.h[0] + 0.9), add(mul(l, side * belly.h[1] * 0.6), mul(u, -belly.h[2] * 0.4))));
  return { overTrunk, legsIn, boots, bootMat, waistBand, strapOver, front, shoulderTop, hipFront, dot3, ribs, belly, pel, f, l, u };
}

function dressBrawler(sc: Sculpt, w: Who, bulk: number, outfit: Outfit, trunksTo: number): void {
  if (dressAnew(sc, w, bulk, outfit)) return;
  const { s, B } = w;
  const { overTrunk, legsIn, boots, bootMat, waistBand, strapOver, front, shoulderTop, hipFront, dot3, ribs, belly, f, l, u } = tailorFor(sc, w, bulk);
  void B;
  const brass = sc.mat({ ramp: BRASS });

  if (outfit === 'singlet') {
    // THE WRESTLER'S SINGLET, red, over his left shoulder; red trunks; a wide belt; laced high boots (his first pick)
    const cut = { n: norm(add(u, mul(l, 0.55))), o: 0 };
    const strapTop = add(s.shoulderL, add(mul(u, 1.6), mul(l, -1.2)));
    cut.o = dot3(cut.n, strapTop) - CUT_DROP_OF();
    const red = sc.mat({ ramp: RED });
    overTrunk(red, 0.55, [cut]);
    const sf = add(s.shoulderL, add(mul(f, 2.6), add(mul(u, -1.6), mul(l, -1.6))));
    const sb = add(s.shoulderL, add(mul(f, -2.6), add(mul(u, -1.4), mul(l, -1.6))));
    const st0 = add(s.shoulderL, add(mul(u, 2.1), mul(l, -1.4)));
    sc.cone(red, 'torso', sf, st0, 1.0, 1.0, 0.8, { tag: 'strap' });
    sc.cone(red, 'torso', st0, sb, 1.0, 1.0, 0.8, { tag: 'strap' });
    legsIn(sc.mat({ ramp: RED }), trunksTo, 0.75);
    const belt = sc.mat({ ramp: HIDE, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.8 && Math.abs(onBall(h.prim as Ell, h.p)[1]) < 0.22 ? shadeOf(BRASS, h.tone) : null) });
    waistBand(belt, 1.25, 1.25);
    boots(bootMat(HIDE, WRAP), true, WRAP);
  } else if (outfit === 'prize') {
    // THE OLD-TIME PRIZEFIGHTER: bare to the waist; dark breeches, high-waisted, buttoned at the knee; a red sash knotted at
    // his left hip, its ends hanging; low boots
    const breeches = sc.mat({
      ramp: CHAR,
      paint: (h) => {
        if (h.prim.tag === 'leg') {
          // the band at the knee and its buttons
          const { t } = onCone(h.prim as Cone, h.p, f);
          if (t > 0.86) return shadeOf(CHAR, h.tone - 1);
        }
        return null;
      },
    });
    legsIn(breeches, 1.04, 0.95, 0.9);
    const sash = sc.mat({ ramp: RED, paint: (h) => ((h.x + h.y) % 4 === 0 ? shadeOf(RED, h.tone - 1) : null) });
    const bc = waistBand(sash, 1.9, 1.45, 0.3);
    const knot = add(bc, add(mul(f, belly.h[0] * 0.7 + 0.8), mul(l, -(belly.h[1] * 0.75 + 0.6))));
    sc.ell(sash, 'hips', knot, [mul(f, 1.2), mul(l, 1.0), mul(u, 1.2)], 0.4, { tag: 'knot' });
    for (const [k, len] of [[0.9, 7.6], [-0.2, 6.0]] as const) sc.cone(sash, 'hips', knot, add(knot, add(mul(f, k), add(mul(l, -0.7), mul(u, -len)))), 1.05, 0.8, 0.4, { tag: 'tail' });
    boots(bootMat(BLACKHIDE, null), false, null);
  } else if (outfit === 'pit') {
    // THE PIT FIGHTER: a harness of dark leather straps crossed over his bare chest, a brass ring where they cross;
    // loose trousers to the ankle, bound at the shins with linen; wraps to the elbows; low boots
    const harness = sc.mat({ ramp: HIDE });
    const mid = front(0, ribs.h[2] * 0.05, 1.2);
    for (const side of [1, -1]) {
      strapOver(harness, shoulderTop(side, 0.8), mid, 0.95, 0.35);
      strapOver(harness, mid, hipFront(-side), 0.95, 0.35);
      // (and over the shoulder and down his back)
      sc.cone(harness, 'torso', shoulderTop(side, 0.8), shoulderTop(side, -2.4), 0.75, 0.75, 0.3, { tag: 'strap' });
      sc.cone(harness, 'torso', shoulderTop(side, -2.4), add(belly.c, add(mul(f, -belly.h[0] - 0.9), mul(l, -side * belly.h[1] * 0.4))), 0.75, 0.75, 0.3, { tag: 'strap' });
    }
    sc.ell(brass, 'torso', add(mid, mul(f, 0.3)), [mul(f, 0.6), mul(l, 1.3), mul(u, 1.3)], 0.2, { tag: 'ring' });
    const trousers = sc.mat({ ramp: PELT_T, paint: (h) => ((Math.floor(h.y / 2) + h.x) % 5 === 0 ? shadeOf(PELT_T, h.tone - 1) : null) });
    legsIn(trousers, 1.62, 1.2);
    const binding = sc.mat({ ramp: WRAP, paint: (h) => (Math.floor(onCone(h.prim as Cone, h.p, u).t * 6 + onCone(h.prim as Cone, h.p, u).around / 1.6) % 2 === 0 ? shadeOf(WRAP, h.tone - 1) : null) });
    for (const side of ['L', 'R'] as const) {
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const ankle = side === 'L' ? s.ankleL : s.ankleR;
      const [, lK, lA] = B.legR;
      sc.cone(binding, `leg${side}`, lerp3(knee, ankle, 0.5), lerp3(knee, ankle, 0.92), lK * 0.9 + 0.55, lA + 0.55, 0.6, { tag: 'binding' });
    }
    const belt = sc.mat({ ramp: BLACKHIDE });
    waistBand(belt, 0.9, 1.5);
    boots(bootMat(BLACKHIDE, null), false, null);
  } else if (outfit === 'street') {
    // THE STREET BRAWLER: an open vest of dark leather over his bare chest, red braces down his front under it; faded blue
    // trousers rolled up at the shin; low boots
    const vest = sc.mat({ ramp: HIDE, paint: (h) => (h.prim.tag === 'collar' ? shadeOf(HIDE, h.tone - 1) : null) });
    // (open down the front: a slot carved out of it down his chest, the collar turned back either side of it)
    overTrunk(vest, 0.75, [{ n: mul(u, -1) as V3, o: dot3(mul(u, -1), add(belly.c, mul(u, -belly.h[2] * 0.4))) }], 'vest', true);
    sc.box(vest, 'torso', add(lerp3(belly.c, ribs.c, 0.5), mul(f, ribs.h[0] + 2.0)), [mul(f, ribs.h[0] * 0.9 + 1.6), mul(l, ribs.h[1] * 0.36), mul(u, ribs.h[2] * 2.4)], 0.3, 0.6, { carve: true });
    for (const side of [1, -1]) {
      sc.cone(vest, 'torso', add(s.neck, add(mul(l, side * 2.4), mul(f, 0.4))), front(side * 0.62, ribs.h[2] * 0.2, 1.1), 0.9, 0.75, 0.4, { tag: 'collar' });
    }
    const braces = sc.mat({ ramp: RED });
    for (const side of [1, -1]) strapOver(braces, add(side > 0 ? s.shoulderL : s.shoulderR, add(mul(u, 1.8), add(mul(l, -side * 2.2), mul(f, 1.2)))), hipFront(side * 0.45), 0.55, 0.05, 'brace');
    const trousers = sc.mat({
      ramp: TWILL,
      paint: (h) => (h.prim.tag === 'cuff' ? shadeOf(TWILL, h.tone + 1) : null),
    });
    legsIn(trousers, 1.56, 1.05, 0.5);
    for (const side of ['L', 'R'] as const) {
      const knee = side === 'L' ? s.kneeL : s.kneeR;
      const ankle = side === 'L' ? s.ankleL : s.ankleR;
      const [, lK, lA] = B.legR;
      const at = lerp3(knee, ankle, 0.56);
      sc.cone(trousers, `leg${side}`, add(at, mul(norm(sub(knee, ankle)), 0.6)), add(at, mul(norm(sub(knee, ankle)), -0.6)), lK + (lA - lK) * 0.56 + 1.6, lK + (lA - lK) * 0.56 + 1.6, 0.2, { tag: 'cuff' });
    }
    const belt = sc.mat({ ramp: BLACKHIDE, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.82 && Math.abs(onBall(h.prim as Ell, h.p)[1]) < 0.16 ? shadeOf(GREY_M, h.tone) : null) });
    waistBand(belt, 0.85, 1.45, 0.45);
    boots(bootMat(HIDE, null), false, null);
  } else {
    // THE CHAMPION: bare to the waist; short red trunks with a white stripe; the champion's belt, wide, a great brass plate
    // at its front; laced high boots
    const trunks = sc.mat({
      ramp: RED,
      paint: (h) => {
        if (h.prim.tag === 'leg') {
          const { around } = onCone(h.prim as Cone, h.p, l);
          if (Math.abs(Math.abs(around) - Math.PI / 2) < 0.28) return shadeOf(WRAP, h.tone);
        }
        return null;
      },
    });
    legsIn(trunks, 0.42, 0.85);
    const belt = sc.mat({ ramp: BLACKHIDE });
    const bc = waistBand(belt, 1.7, 1.45, 0.62);
    sc.box(brass, 'hips', add(bc, mul(f, belly.h[0] + 1.6)), [mul(f, 0.6), mul(l, 2.6), mul(u, 2.2)], 0.7, 0.3, { tag: 'plate' });
    for (const side of [1, -1]) sc.ell(brass, 'hips', add(bc, add(mul(f, belly.h[0] * 0.6 + 1.2), mul(l, side * (belly.h[1] + 0.6)))), [mul(f, 0.6), mul(l, 1.0), mul(u, 1.3)], 0.2, { tag: 'stud' });
    boots(bootMat(RED_DARK, WRAP), true, WRAP);
  }
}
/** Bronze: a gladiator's greaves. */
const BRONZE: Ramp = ['#2a1608', '#4a2a10', '#7a4a1e', '#b0763a', '#dca868'];
/** A wolf's grey-brown fur. */
const FUR: Ramp = ['#1a1416', '#36292a', '#5a4842', '#86705e', '#b09a82'];
/** Bone and teeth. */
const BONE: Ramp = ['#3a3024', '#6a5a44', '#a8957a', '#d8c8a8', '#f6ecd4'];
/** Deep indigo cloth: the monk's top. */
const INDIGO: Ramp = ['#0a0c22', '#161c40', '#24306a', '#3a4c94', '#5a70bc'];
/** Undyed cloth: a sash, a lapel's trim, shin wraps. */
const CREAM: Ramp = ['#4a3a34', '#7a6658', '#b8a48c', '#e4d4b4', '#fff4dc'];
/** Dark wood: prayer beads. */
const WOOD: Ramp = ['#1a0c08', '#341a10', '#5a3018', '#84502a', '#aa7440'];

/**
 * THE FOUR NEW OUTFITS (his word, 24 Oct, by 06:57 Pacific: “His hands are tiny compared to his body.  And I still don’t
 * like his outfit.”): four that are not like each other, nor like the five he has seen: each a different shape round him
 * (a great pauldron and a skirt of strips; a fur mantle; a wrap top, baggy trousers and beads; a long coat). Returns
 * whether it dressed him.
 */
function dressAnew(sc: Sculpt, w: Who, bulk: number, outfit: Outfit): boolean {
  if (outfit !== 'gladiator' && outfit !== 'barbarian' && outfit !== 'monk' && outfit !== 'brigand') return false;
  const { s, B } = w;
  const t = tailorFor(sc, w, bulk);
  const { overTrunk, legsIn, boots, bootMat, waistBand, strapOver, front, shoulderTop, hipFront, dot3, ribs, belly, pel, f, l, u } = t;
  const brass = sc.mat({ ramp: BRASS });
  const down: V3 = [0, 0, -1];
  /**
   * A SKIRT OF PANELS hung from his belt (strips, flaps, a coat's tails): `n` panels round an oval as wide as his hips,
   * each `len` long and flared `flare` out at its foot, `wide` across; `gap`: none hung within this angle of his front
   * (a coat open there). Panels side by side melt together by `melt` (0: each a strip of its own).
   */
  const panels = (mat: number, n: number, len: number, flare: number, wide: number, melt: number, gap = 0, from = 0.6): void => {
    const fw0 = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    const sd0 = norm([s.hips[1][0], s.hips[1][1], 0], [0, 1, 0]);
    const beltC = add(belly.c, mul(belly.r[2], -belly.h[2] * from));
    const rx = B.pelvisDeep + 1.0;
    const ry = B.pelvisHalf + 0.9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const near = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
      if (near < gap) continue;
      const dir = norm(add(mul(fw0, Math.cos(a) * rx), mul(sd0, Math.sin(a) * ry)));
      const top = add(beltC, add(mul(fw0, Math.cos(a) * rx), mul(sd0, Math.sin(a) * ry)));
      const foot = add(top, add(mul(down, len), mul(dir, flare)));
      const along = norm(sub(foot, top));
      const tg = norm(cross([0, 0, 1], dir));
      const nn = norm(cross(along, tg));
      sc.box(mat, i % 2 ? 'skirt' : 'skirt2', lerp3(top, foot, 0.5), [mul(along, len * 0.5), mul(tg, wide * 0.5), mul(nn, 0.45)], 0.3, melt, { tag: 'panel' });
    }
  };
  const sh3 = (side: 'L' | 'R') => ({
    sh: side === 'L' ? s.shoulderL : s.shoulderR,
    el: side === 'L' ? s.elbowL : s.elbowR,
    knee: side === 'L' ? s.kneeL : s.kneeR,
    ankle: side === 'L' ? s.ankleL : s.ankleR,
    out: mul(l, side === 'L' ? 1 : -1),
  });

  if (outfit === 'gladiator') {
    // THE ARENA GLADIATOR: a great pauldron of layered leather on his lead shoulder, strapped across his chest; a broad
    // studded belt and a skirt of leather strips; bronze greaves; low boots
    const leather = sc.mat({
      ramp: HIDE,
      paint: (h) => {
        if (h.prim.tag === 'plate') {
          const b = onBall(h.prim as Ell, h.p);
          // each plate's lower edge trimmed in brass, its rivets darker on it; its top a step lighter, the plates stepped
          if (b[1] < -0.5) return Math.abs(((b[0] + 2) * 3) % 1 - 0.5) < 0.16 ? shadeOf(BRASS, h.tone - 1) : shadeOf(BRASS, h.tone + 1);
          if (b[1] > 0.3) return shadeOf(HIDE, h.tone + 1);
        }
        if (h.prim.tag === 'panel') {
          const b = onBall(h.prim as Ell, h.p);
          // a brass stud at each strip's foot; its edges darker
          if (b[0] > 0.55 && b[0] < 0.85 && Math.abs(b[1]) < 0.4) return shadeOf(BRASS, h.tone);
          if (Math.abs(b[1]) > 0.72) return shadeOf(HIDE, h.tone - 1);
        }
        return null;
      },
    });
    // (on his right shoulder: the near one, seen from in front)
    const L = sh3('R');
    const [, o0] = limbFrame(L.sh, L.el, L.out);
    const delt = add(L.sh, add(mul(u, -0.5), mul(o0, 0.8)));
    for (let i = 0; i < 3; i++) {
      const a = 0.25 + 0.5 * i;
      const n = norm(add(mul(u, Math.cos(a)), mul(o0, Math.sin(a))));
      const tg = norm(cross(n, f));
      sc.ell(leather, `pauldron${i}`, add(delt, mul(n, 2.7 * bulk + 0.6 + i * 0.35)), [mul(f, 4.0 + i * 0.35), mul(tg, 2.7 + i * 0.1), mul(n, 0.9)], 0.2, { tag: 'plate' });
    }
    // the strap that holds it: from under it across his chest to under his right arm, and round his back
    const under = add(ribs.c, add(mul(l, ribs.h[1] * 0.92), mul(u, ribs.h[2] * 0.05)));
    strapOver(leather, shoulderTop(-1, 1.4), add(under, mul(f, 1.0)), 0.8, 0.3);
    sc.cone(leather, 'torso', shoulderTop(-1, -2.2), add(under, mul(f, -2.2)), 0.7, 0.7, 0.3, { tag: 'strap' });
    // red under-trunks; the belt; the skirt of strips over them
    legsIn(sc.mat({ ramp: RED }), 0.36, 0.7);
    panels(leather, 13, 7.6, 2.4, 2.3, 0);
    const belt = sc.mat({
      ramp: BLACKHIDE,
      paint: (h) => {
        const b = onBall(h.prim as Ell, h.p);
        return Math.abs(b[2]) < 0.4 && Math.floor((Math.atan2(b[1], b[0]) + Math.PI) * 4.5) % 2 === 0 ? shadeOf(BRASS, h.tone) : null;
      },
    });
    waistBand(belt, 1.55, 1.75, 0.5);
    // bronze greaves, a ridge down each, a cap over the knee
    const bronze = sc.mat({ ramp: BRONZE, paint: (h) => (h.prim.tag === 'greave' && Math.abs(onCone(h.prim as Cone, h.p, f).around) < 0.3 ? shadeOf(BRONZE, h.tone + 1) : null) });
    for (const side of ['L', 'R'] as const) {
      const { knee, ankle } = sh3(side);
      const [, lK, lA] = B.legR;
      sc.cone(bronze, `leg${side}`, lerp3(knee, ankle, 0.1), lerp3(knee, ankle, 0.8), lK * 0.98 + 0.75, lA + 0.7, 0.3, { tag: 'greave' });
      const [kd, ko] = limbFrame(knee, ankle, f);
      sc.ell(bronze, `leg${side}`, add(knee, mul(ko, lK * 0.8)), [mul(kd, 1.6), mul(ko, 1.0), mul(norm(cross(kd, ko)), 1.7)], 0.4, { tag: 'kneecap' });
    }
    boots(bootMat(HIDE, null), false, null);
  } else if (outfit === 'barbarian') {
    // THE BARBARIAN: a wolf-fur mantle over his shoulders and down his back; a necklace of teeth; a kilt of dark hide;
    // fur boots strapped to the knee; a band round his arm
    const fur = sc.mat({
      ramp: FUR,
      crease: 0.5,
      paint: (h) => {
        // its tufts: darker strands running down it, broken
        const strand = (h.x * 2 + Math.floor(h.y / 2)) % 5 === 0;
        return strand ? shadeOf(FUR, h.tone - 1) : null;
      },
    });
    // (the mantle: over the back of him, the yoke and his shoulders, its front edge sloping from the neck to the armpit)
    const nb = norm(add(f, mul(u, -0.9)));
    overTrunk(fur, 1.7, [{ n: nb, o: dot3(nb, s.neck) + 0.6 }, { n: down, o: -(s.waist[2] + 3.2) }], 'mantle', true);
    for (const side of [1, -1]) {
      const { sh, el, out } = sh3(side > 0 ? 'L' : 'R');
      const [, o0] = limbFrame(sh, el, out);
      sc.ell(fur, 'torso', add(sh, add(mul(u, 1.2), mul(o0, 0.6))), [mul(f, 3.7 * bulk), mul(o0, 3.1 * bulk), mul(u, 2.3)], 1.8, { tag: 'mantle' });
    }
    // the ruff round his neck
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (Math.cos(a) > 0.6) continue;
      const dir = add(mul(f, Math.cos(a)), mul(l, Math.sin(a)));
      sc.ell(fur, 'torso', add(s.neck, add(mul(u, -0.6), mul(dir, B.shoulderHalf * 0.42))), [mul(dir, 2.0), mul(cross(u, dir), 2.6), mul(u, 2.0)], 1.6, { tag: 'mantle' });
    }
    // its ragged hem down his back
    for (let i = -2; i <= 2; i++) sc.box(fur, 'torso', add(s.waist, add(mul(f, -(ribs.h[0] + 1)), add(mul(l, i * 2.6), [0, 0, 3.2]))), [mul(f, 3), mul(norm(add(l, mul(u, 1))), 0.9), mul(norm(sub(u, l)), 0.9)], 0.1, 0.3, { carve: true });
    // a necklace of teeth on a cord over his chest
    const cord = sc.mat({ ramp: BLACKHIDE });
    const bone = sc.mat({ ramp: BONE });
    let prev: V3 | null = null;
    for (let i = -4; i <= 4; i++) {
      const k = i / 4;
      const p = front(k * 0.92, ribs.h[2] * 0.72 - (1 - k * k) * 3.0, 1.5);
      if (prev) sc.cone(cord, 'torso', prev, p, 0.28, 0.28, 0.1, { tag: 'cord' });
      if (i % 2 === 0 || Math.abs(i) === 1) sc.cone(bone, 'torso', p, add(p, add(mul(down, 1.7), mul(f, 0.3))), 0.6, 0.18, 0.1, { tag: 'tooth' });
      prev = p;
    }
    // the kilt of dark hide, notched; a belt with an iron ring
    const hide = sc.mat({ ramp: BLACKHIDE, paint: (h) => (h.prim.tag === 'panel' && Math.abs(onBall(h.prim as Ell, h.p)[1]) > 0.7 ? shadeOf(BLACKHIDE, h.tone - 1) : null) });
    legsIn(hide, 0.3, 0.6);
    panels(hide, 7, 7.4, 2.0, 4.6, 0);
    const belt = sc.mat({ ramp: HIDE });
    const bc = waistBand(belt, 1.35, 1.7, 0.5);
    sc.cone(sc.mat({ ramp: GREY_M }), 'hips', add(bc, mul(f, belly.h[0] + 1.6)), add(bc, mul(f, belly.h[0] + 2.2)), 1.5, 1.5, 0.2, { tag: 'ring' });
    // fur boots strapped to the knee, a cuff of fur at their top
    boots(bootMat(FUR, HIDE), true, HIDE);
    for (const side of ['L', 'R'] as const) {
      const { knee, ankle } = sh3(side);
      const [, lK] = B.legR;
      const at = lerp3(knee, ankle, 0.4);
      sc.ell(fur, `leg${side}`, at, [mul(norm(sub(knee, ankle)), 1.3), mul(f, lK + 1.4), mul(l, lK + 1.4)], 0.6, { tag: 'cuff' });
    }
    // the band round his right arm
    const R = sh3('R');
    sc.cone(belt, 'armR', lerp3(R.sh, R.el, 0.5), lerp3(R.sh, R.el, 0.62), 2.45 * bulk + 0.45, 2.4 * bulk + 0.45, 0.2, { tag: 'armband' });
  } else if (outfit === 'monk') {
    // THE WANDERING MONK: a sleeveless wrap top of deep indigo crossed over his chest, its lapel trimmed in undyed cloth; a
    // long sash, knotted, its ends to his knees; baggy trousers gathered at the shins in wraps; prayer beads; sandals
    const top = sc.mat({ ramp: INDIGO, paint: (h) => (Math.floor((h.x + h.y * 2) / 2) % 7 === 0 ? shadeOf(INDIGO, h.tone - 1) : null) });
    overTrunk(top, 0.65, [{ n: down, o: -(belly.c[2] - belly.h[2] * 0.6) }], 'top', true);
    // (the V of it open over his breastbone)
    const vAt = front(0, ribs.h[2] * 0.05, 0);
    const dg = 3.6;
    sc.box(top, 'torso', add(vAt, add(mul(u, dg * Math.SQRT2), mul(f, 1.5))), [mul(f, 4.2), mul(norm(add(u, l)), dg), mul(norm(sub(u, l)), dg)], 0.2, 0.4, { carve: true });
    const cream = sc.mat({ ramp: CREAM });
    const neckL = add(s.neck, add(mul(l, 2.6), mul(f, 1.6)));
    const neckR = add(s.neck, add(mul(l, -2.6), mul(f, 1.6)));
    strapOver(cream, neckL, vAt, 0.6, 0.05, 'lapel');
    strapOver(cream, neckR, vAt, 0.6, 0.05, 'lapel');
    strapOver(cream, vAt, hipFront(-0.95), 0.6, 0.05, 'lapel');
    // the sash: wide, knotted at his front, its two ends to his knees
    const sash = sc.mat({ ramp: CREAM, paint: (h) => ((h.x + h.y) % 5 === 0 ? shadeOf(CREAM, h.tone - 1) : null) });
    const bc = waistBand(sash, 1.8, 1.55, 0.45);
    const knot = add(bc, add(mul(f, belly.h[0] + 1.8), mul(l, -1.2)));
    sc.ell(sash, 'hips', knot, [mul(f, 1.2), mul(l, 1.3), mul(u, 1.3)], 0.4, { tag: 'knot' });
    for (const [k, len] of [[1.4, 10.0], [-0.5, 8.2]] as const) sc.cone(sash, 'hips', knot, add(knot, add(mul(f, 0.8), add(mul(l, k), [0, 0, -len]))), 1.15, 0.9, 0.4, { tag: 'tail' });
    // baggy trousers, gathered at the shin in wraps
    const trousers = sc.mat({ ramp: CHAR, paint: (h) => (h.prim.tag === 'leg' && Math.floor((onCone(h.prim as Cone, h.p, f).around + Math.PI) * 2.5) % 3 === 0 ? shadeOf(CHAR, h.tone - 1) : null) });
    legsIn(trousers, 1.7, 1.25, 0.6);
    const binding = sc.mat({ ramp: CREAM, paint: (h) => (Math.floor(onCone(h.prim as Cone, h.p, u).t * 6 + onCone(h.prim as Cone, h.p, u).around / 1.6) % 2 === 0 ? shadeOf(CREAM, h.tone - 1) : null) });
    for (const side of ['L', 'R'] as const) {
      const { knee, ankle } = sh3(side);
      const [, lK, lA] = B.legR;
      sc.cone(binding, `leg${side}`, lerp3(knee, ankle, 0.6), lerp3(knee, ankle, 0.95), lK * 0.9 + 0.7, lA + 0.55, 0.6, { tag: 'binding' });
    }
    boots(bootMat(BLACKHIDE, null), false, null);
    // prayer beads, big and dark, round his neck and down over his chest
    const wood = sc.mat({ ramp: WOOD });
    for (let i = -5; i <= 5; i++) {
      const k = i / 5;
      const p = front(k * 0.82, ribs.h[2] * 0.95 - (1 - k * k) * 4.2, 1.7);
      sc.ell(wood, 'torso', p, [mul(f, 0.75), mul(l, 0.8), mul(u, 0.8)], 0.05, { tag: 'bead' });
    }
    for (const side of [1, -1]) for (const fw of [0.2, -1.4]) sc.ell(wood, 'torso', add(shoulderTop(side, fw), mul(u, 0.9)), [mul(f, 0.8), mul(l, 0.8), mul(u, 0.8)], 0.05, { tag: 'bead' });
  } else {
    // THE BRIGAND: a long sleeveless coat of oxblood leather, buttoned up his chest, a high collar, its tails split to his
    // knees; a black belt over it; dark trousers; tall boots with turned-down cuffs
    const coat = sc.mat({
      ramp: RED_DARK,
      paint: (h) => {
        if (h.prim.tag === 'panel') {
          const b = onBall(h.prim as Ell, h.p);
          if (b[0] > 0.86) return shadeOf(RED_DARK, h.tone - 1);
        }
        return null;
      },
    });
    overTrunk(coat, 0.85, [], 'coat', true);
    // the collar, standing up round his neck, open at the front
    sc.cone(coat, 'torso', add(s.neck, mul(u, -1.2)), add(s.neck, add(mul(u, 1.6), mul(f, -0.6))), 3.5, 3.9, 0.6, { tag: 'collar', cuts: [{ n: f, o: dot3(f, s.neck) + 1.2 }] });
    // two rows of brass buttons up his front
    for (const side of [1, -1]) for (let i = 0; i < 4; i++) {
      sc.ell(brass, 'torso', front(side * 0.36, ribs.h[2] * (0.55 - i * 0.42) - 1.0, 0.9 + (i > 1 ? 0.3 : 0)), [mul(f, 0.5), mul(l, 0.6), mul(u, 0.6)], 0.05, { tag: 'button' });
    }
    // its tails: to his knees, split at the front and at the back
    panels(coat, 10, 14, 3.0, 4.2, 0.8, 0.5, 0.5);
    const belt = sc.mat({ ramp: BLACKHIDE, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.84 && Math.abs(onBall(h.prim as Ell, h.p)[1]) < 0.18 ? shadeOf(BRASS, h.tone) : null) });
    waistBand(belt, 1.0, 1.85, 0.45);
    legsIn(sc.mat({ ramp: CHAR }), 1.6, 0.9);
    const boot = bootMat(BLACKHIDE, null);
    boots(boot, true, null);
    for (const side of ['L', 'R'] as const) {
      const { knee, ankle } = sh3(side);
      const [, lK] = B.legR;
      const at = lerp3(knee, ankle, 0.36);
      sc.cone(boot, `leg${side}`, add(at, mul(norm(sub(knee, ankle)), 0.7)), add(at, mul(norm(sub(knee, ankle)), -0.7)), lK + 1.25, lK + 1.15, 0.2, { tag: 'cuff' });
    }
  }
  void bulk;
  return true;
}

/** Rough brown cloth: the pit fighter's trousers. */
const PELT_T: Ramp = ['#1a0e0e', '#2e1a16', '#4c2c22', '#6c4430', '#8e6040'];
/** A grey metal: a buckle. */
const GREY_M: Ramp = ['#24223a', '#3c3a5a', '#6a6890', '#a8a6c8', '#dcdaf0'];
/** Dark red leather: the champion's boots. */
const RED_DARK: Ramp = ['#1e040c', '#3a0814', '#601420', '#8c2a2a', '#b4483a'];

/** A BEARD of one of four kinds, on a head (`hat`: a point of the head by its own shares). */
function beardOf(sc: Sculpt, mat: number, hat: (fw: number, lf: number, up: number) => V3, hf: V3, hl: V3, hu: V3, R: V3, kind: BrawlerLook['beard'], chestF: V3): void {
  // (always: the moustache over his mouth; the beard along each side of his jaw from the ear, thickening to the chin; and
  // the chin's mass under his mouth. Its top follows the jaw: his cheeks are clear, and a beard is not a mask.)
  sc.ell(mat, 'head', hat(0.9, 0, -0.38), [mul(hf, 0.55), mul(hl, R[1] * 0.58), mul(hu, 0.55)], 0.5, { tag: 'tash' });
  for (const side of [1, -1]) sc.cone(mat, 'head', hat(-0.02, side * 0.86, -0.18), hat(0.56, side * 0.56, -0.8), 0.8, 1.3, 0.9, { tag: 'chop' });
  const wide = kind === 'wild' ? 1.0 : kind === 'full' ? 0.92 : 0.84;
  sc.ell(mat, 'head', hat(0.42, 0, -0.9), [mul(hf, R[0] * 0.58), mul(hl, R[1] * wide), mul(hu, R[2] * 0.4)], 1.0, { tag: 'chin' });
  if (kind === 'full') {
    sc.ell(mat, 'head', hat(0.42, 0, -1.25), [mul(hf, R[0] * 0.56), mul(hl, R[1] * 0.86), mul(hu, R[2] * 0.52)], 1.3, { tag: 'fall' });
  } else if (kind === 'wild') {
    sc.ell(mat, 'head', hat(0.38, 0, -1.35), [mul(hf, R[0] * 0.66), mul(hl, R[1] * 1.04), mul(hu, R[2] * 0.62)], 1.4, { tag: 'fall' });
    for (const side of [1, -1]) sc.ell(mat, 'head', hat(0.3, side * 0.86, -1.05), [mul(hf, R[0] * 0.4), mul(hl, R[1] * 0.34), mul(hu, R[2] * 0.5)], 1.0, { tag: 'fall' });
  } else if (kind === 'spade') {
    // long and squared off at its foot, lying down his chest
    sc.ell(mat, 'head', hat(0.44, 0, -1.2), [mul(hf, R[0] * 0.5), mul(hl, R[1] * 0.76), mul(hu, R[2] * 0.5)], 1.2, { tag: 'fall' });
    sc.box(mat, 'head', add(hat(0.5, 0, -1.7), mul(chestF, 0.3)), [mul(hf, R[0] * 0.36), mul(hl, R[1] * 0.8), mul(hu, R[2] * 0.36)], 0.9, 1.2, { tag: 'fall' });
  } else {
    // a braid off the point of his chin, a brass ring at its end
    sc.ell(mat, 'head', hat(0.44, 0, -1.15), [mul(hf, R[0] * 0.5), mul(hl, R[1] * 0.7), mul(hu, R[2] * 0.44)], 1.2, { tag: 'fall' });
    let a = hat(0.5, 0, -1.45);
    for (let i = 0; i < 4; i++) {
      const b = add(add(a, mul(hu, -1.3)), mul(chestF, 0.25));
      sc.ell(mat, 'head', lerp3(a, b, 0.5), [mul(hf, 0.95), mul(hl, 0.95), mul(norm(sub(b, a)), 0.85)], 0.3, { tag: 'braid' });
      a = b;
    }
    sc.ell(BRASS_MAT, 'head', a, [mul(hf, 0.8), mul(hl, 0.8), mul(hu, 0.6)], 0.2, { tag: 'ring' });
  }
}
/** (the brass ring of a braid: given its material by the figure that has one) */
let BRASS_MAT = 0;

// ---------------------------------------------------------------------------------------------
// THE BRAWLER: a bare-knuckle boxer, light and bouncy, cocky (his brief); the wrestler's outfit kept, the fists wrapped.

export const BOXER_BODY: Build = buildOf(57, HEAD_B * 1.1, { shoulders: 1.18, chest: 1.14, waist: 0.94, hips: 0.92, depth: 1.08, arms: 1.0, limbs: 1.08, pad: 1.0 });

/** HIS STANCE: up on the balls of his feet, side-on a little, the lead fist out, the rear by his jaw, chin tucked. */
export function boxerStance(B: Build): Bones {
  const t = B.tall / 57;
  return {
    ...standing(B),
    pz: -1.4 * t, yaw: -22, twist: 10, bend: 8, faceTurn: 16, faceUp: -6,
    lfx: 3.6 * t, lfy: 1.6 * t, lft: 22, lk: 18, lfp: 14,
    rfx: -3.0 * t, rfy: -2.0 * t, rft: -18, rk: -12, rfp: 26, rfz: 0.6 * t,
    lhIn: 0, lhx: 10.5 * t, lhy: 0.6 * t, lhz: 1.0 * t, le: 46,
    rhIn: 0, rhx: 6.4 * t, rhy: -2.6 * t, rhz: 1.6 * t, re: 40,
  };
}

/** One of the brawler's looks: his proportions and his beard (his “Face and beard,Proportions”). */
export interface BrawlerLook {
  name: string;
  /** His height, his head (a share of the heroes' own big head) and the shape of him. */
  tall: number;
  head: number;
  shape: Shape;
  /** How heavily muscled. */
  bulk: number;
  /** How far down his thigh the trunks come (0 the hip, 1 the knee). */
  trunksTo: number;
  beard: 'full' | 'spade' | 'braid' | 'wild';
}
export const BRAWLER_LOOKS: BrawlerLook[] = [
  { name: 'A big head, a full beard', tall: 57, head: 1.24, shape: { shoulders: 1.2, chest: 1.18, waist: 0.92, hips: 0.92, depth: 1.08, limbs: 1.08, pad: 1.0 }, bulk: 1.12, trunksTo: 0.62, beard: 'full' },
  { name: 'Long legs, a broad V, a spade beard', tall: 58, head: 1.12, shape: { shoulders: 1.28, chest: 1.22, waist: 0.86, hips: 0.88, legs: 1.08, depth: 1.08, limbs: 1.06, pad: 1.0 }, bulk: 1.14, trunksTo: 0.55, beard: 'spade' },
  { name: 'A stocky bruiser, a wild beard', tall: 55, head: 1.22, shape: { shoulders: 1.24, chest: 1.28, waist: 1.04, hips: 0.98, legs: 0.92, depth: 1.14, limbs: 1.16, arms: 1.02, pad: 1.0 }, bulk: 1.22, trunksTo: 0.72, beard: 'wild' },
  { name: 'Lean and long, a braided beard', tall: 58, head: 1.16, shape: { shoulders: 1.16, chest: 1.08, waist: 0.86, hips: 0.88, legs: 1.06, depth: 1.02, limbs: 1.0, pad: 1.0 }, bulk: 1.04, trunksTo: 0.6, beard: 'braid' },
];

export interface Look {
  name: string;
}

/** HIS PICK of the four builds, by 23:06 Pacific, 23 Oct: “B” (long legs, a broad V, a spade beard). */
export const BRAWLER_BUILD = 1;

/** What he wears: the wrestler's singlet and trunks (his first pick; then, by 23:06, “I don’t like his outfit”), or one of four new. */
export type Outfit = 'singlet' | 'prize' | 'pit' | 'street' | 'champ' | 'gladiator' | 'barbarian' | 'monk' | 'brigand';
/** HIS PICK, at 23:11 Pacific, 23 Oct, to the four offered: “1” (the old-time prizefighter). */
export const BRAWLER_OUTFIT: Outfit = 'prize';
/** The four new, after his “I still don’t like his outfit” (24 Oct, by 06:57 Pacific): each its own shape. */
export const OUTFITS_2: { id: Outfit; name: string }[] = [
  { id: 'gladiator', name: 'Arena gladiator' },
  { id: 'barbarian', name: 'Barbarian' },
  { id: 'monk', name: 'Wandering monk' },
  { id: 'brigand', name: 'Brigand' },
];
export const OUTFITS: { id: Outfit; name: string }[] = [
  { id: 'prize', name: 'Old-time prizefighter' },
  { id: 'pit', name: 'Pit fighter' },
  { id: 'street', name: 'Street brawler' },
  { id: 'champ', name: 'Champion' },
];

/** The brawler sculpted, standing as he stands, in one of the game's views (`k`: which of his looks). */
export function sculptBrawler(view: GameView, pose?: Bones, k = BRAWLER_BUILD, outfit: Outfit = BRAWLER_OUTFIT, turn = 0): Drawn {
  const look = k >= 0 ? BRAWLER_LOOKS[k] : null;
  const B = look ? buildOf(look.tall, HEAD_B * look.head, look.shape) : BOXER_BODY;
  const bulk = look ? look.bulk : 1.12;
  const q = (pose ?? boxerStance(B)) as Posed;
  const s = solve(B, q);
  const w: Who = { s, B, view, spin: turn };
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.chest;
  const farArm = (piece: string): boolean => piece.endsWith('L') ? farSide(w, s.elbowL) : piece.endsWith('R') ? farSide(w, s.elbowR) : false;
  const skin = sc.mat({
    ramp: SKIN_W,
    paint: (h) => {
      const far = farArm(h.prim.piece) ? 1 : 0;
      if (h.prim.piece === 'head') {
        const c = faceAt(w, h);
        if (c) return c;
        // (a face is painted a step lighter than the light gives it, as the heroes' are: it must read; the crown and the
        // back of the head as the light has them, so the skull keeps its shape)
        if (h.prim.tag !== 'neck' && onHead(w, h.p)[0] > 0.25) return shadeOf(SKIN_W, h.tone + 1);
      }
      return far ? shadeOf(SKIN_W, h.tone - 1) : null;
    },
  });
  manBody(sc, w, skin, bulk);
  manHead(sc, w, skin);
  faceMarks(sc, w, { brow: '#3a1a1a', socket: SKIN_W[2] });
  dressBrawler(sc, w, bulk, outfit, look ? look.trunksTo : 0.8);
  // THE WRAPS: his fists and wrists bound in linen
  const wraps = sc.mat({
    ramp: WRAP,
    paint: (h) => {
      const c = h.prim;
      const far = farArm(c.piece) ? 1 : 0;
      if (c.k === 'cone') {
        const { t, around } = onCone(c, h.p, u);
        // the turns of the binding, slanting round the wrist
        if (Math.floor(t * 7 + around / 1.6) % 2 === 0) return shadeOf(WRAP, h.tone - 1 - far);
      }
      if (c.k === 'box') {
        const b = onBall(c, h.p);
        // the knuckles: the front of the fist, ridged across the fingers
        if (b[0] > 0.55 && Math.floor((b[1] + 1) * 2.5) % 2 === 0) return shadeOf(WRAP, h.tone - 1 - far);
      }
      return far ? shadeOf(WRAP, h.tone - 1) : null;
    },
  });
  for (const side of ['L', 'R'] as const) {
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    const d = norm(sub(ha, el));
    const across = norm(cross(d, side === 'L' ? l : mul(l, -1)));
    const side3 = norm(cross(across, d));
    // (his fists BIG, as a boxer's read at this size: about two thirds of his head's width, the wraps thick up the wrist;
    // his “His hands are tiny compared to his body”, 24 Oct)
    const F = FIST.k;
    sc.cone(wraps, piece, lerp3(el, ha, outfit === 'pit' ? 0.12 : 0.55), lerp3(el, ha, 0.92), outfit === 'pit' ? 2.35 : 1.85, 1.95 * F, 0.8, { tag: 'wrist' });
    sc.box(wraps, piece, add(ha, mul(d, 1.25 * F)), [mul(d, 2.4 * F), mul(side3, 2.3 * F), mul(across, 2.15 * F)], 1.3 * F, 1.0, { tag: 'fist' });
    // the thumb, folded over the fingers on the inside of the fist
    sc.ell(wraps, piece, add(ha, add(mul(d, 1.6 * F), add(mul(across, -1.6 * F), mul(side3, -1.2 * F)))), [mul(d, 1.2 * F), mul(side3, 0.9 * F), mul(across, 0.8 * F)], 0.5, { tag: 'thumb' });
  }
  // THE BEARD: big and yellow, from under his jaw down onto his chest
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const hat = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const beard = sc.mat({
    ramp: BEARD,
    paint: (h) => {
      const [, , hu2] = onHead(w, h.p);
      // its strands: hair falls down the picture, so darker runs down it every few pixels, broken now and then; the
      // moustache and the top of it lit, its foot in its own shadow
      const strand = (h.x + Math.floor(h.y / 3)) % 3 === 0;
      const lift = hu2 > -0.5 ? 1 : hu2 < -1.25 ? -1 : 0;
      return shadeOf(BEARD, h.tone + lift - (strand ? 1 : 0));
    },
  });
  BRASS_MAT = sc.mat({ ramp: BRASS });
  beardOf(sc, beard, hat, hf, hl, hu, R, look ? look.beard : 'full', f);
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

void CYAN;
void onBall;
export type { Ell };
