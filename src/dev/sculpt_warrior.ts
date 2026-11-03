// THE WARRIOR, A NEW RENDERING UNDER THE NEW RULES (the art chat, 26 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 26 Oct, 23:10: “While I’m checking out the demons, I’d like to see what the warrior might look like with the
// new rules applied”. Shown the game's knight with his pieces sculpted: “Can you not just refine the old look but rebuild
// it uniquely with the new rules in mind.  I want the same style, but a new rendering”; then “And the beak helmet”, and
// asked whether to keep it, “Keep the beak helm”. The new rules: his rulebook's How art is made and approved, rule 9,
// “Real shapes, not circles and squares” (one carved body, its parts grown into each other, a real outline; a thing shaped
// as the thing it is), its Never, “plastic 3D (a smooth, shiny computer-render look)”, and of the warrior, “The warrior
// swings his sword with practiced lethal intent”.
//
// SO, A NEW RENDERING, not the old one refined: the same warrior at heart (his great sword with its cyan blade, his red and
// his steel, the scarf he was picked for, his beaked helm) designed anew, sculpted (dev/sculpt.ts) as the new classes are,
// with their clean planes of light and shade and bright colours, little grain:
//   - HIS STANCE, with lethal intent: the great sword held low at his right side in both fists, its point forward and
//     down at his foe, ready to rise in a cut; his arms below his chest, so his tabard is seen; his lead foot forward and bent, his rear leg braced back, leaning in, his beak and his
//     point both toward his foe;
//   - HIS OUTLINE, known in the dark: broad plate shoulders over a narrow waist; the beaked helm drawn up to a point; the
//     scarf's two long ends streaming back; the long red tabard falling before and behind his legs; the blade over all;
//   - HIS ARMOUR, designed anew: a steel breastplate with a keel, a gorget; the red tabard over it, his old chevron on it
//     in steel; pauldrons of broad plates edged in brass; couters with fans, vambraces, gauntlets with flared cuffs; a fauld
//     of lames; cuisses, poleyns with fans, greaves with a ridge, sabatons; mail where the plate parts; a belt and buckle.

import type { Ramp } from '../art/kit';
import { BLADE, INK } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { GREAT_BLADE, HEAD_B, MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Drawn, Ell } from './sculpt';
import { BRASS, farSide, limbFrame, manBody, shadeOf, tailorFor } from './sculpt_classes';
import type { Who } from './sculpt_classes';

// ---------------------------------------------------------------------------------------------
// HIS COLOURS: the game's steel, mail, red, wine and leather (art/kit.ts, art/hero_warrior.ts) in five steps, bright; brass
// for the edges of his plate

export const STEEL_W: Ramp = ['#2c2864', '#3a3478', '#7a74c8', '#a8a2ec', '#d6d0ff'];
export const MAIL_W: Ramp = ['#1c1946', '#28245a', '#4a4690', '#625eaa', '#7e7ac0'];
export const TABARD_W: Ramp = ['#4a0a18', '#6a1020', '#d02a30', '#ec4a3c', '#ff7058'];
export const SCARF_W: Ramp = ['#2a0510', '#3c0818', '#8e1428', '#ac2234', '#c83040'];
export const PLUM_W: Ramp = ['#2a1430', '#3a1c40', '#6e3a5c', '#8c4c6a', '#a8607a'];

/** HIS BUILD: the game's knight (moves3.ts KNIGHT_BODY), his shoulders broader and his waist drawn in, the V of a fighter in plate. */
export const WARRIOR_BODY: Build = buildOf(58, HEAD_B, { shoulders: 1.36, chest: 1.3, waist: 1.08, hips: 1.08, depth: 1.16, arms: 1.05, limbs: 1.28, pad: 1.6 });

/** HIS STANCE: the great sword held low at his right side in both fists, its point forward and down at his foe, his weight forward on his bent lead leg. */
export function warriorGuard(B: Build = WARRIOR_BODY): Bones {
  return {
    ...standing(B),
    yaw: -30, pz: -3.2, bend: 9, pitch: 3, twist: -20, faceUp: 4, faceTurn: 8,
    lfx: 8.4, lfy: 1.6, lft: 6, lk: 15,
    rfx: -7.4, rfy: -2.2, rft: -40, rk: -14,
    // (his right fist on the grip by his right hip, his left before it nearer the guard: both arms below his chest, so his
    // tabard is seen)
    rhIn: 0, rhx: 2.5, rhy: -3.5, rhz: -13,
    lhIn: 3, lhx: 4.6, lhy: 0, lhz: 0,
    wAz: 25, wEl: -18, wRoll: 0, le: 30, re: 22,
  };
}

const U: V3 = [0, 0, 1];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** THE WARRIOR, A NEW RENDERING, in one of the game's views (from behind as the game paints its heroes). */
export function sculptWarrior(view: GameView, pose?: Bones): Drawn {
  const B = WARRIOR_BODY;
  const q = (pose ?? warriorGuard(B)) as Posed;
  const s = solve(B, q);
  const w: Who = { s, B, view, spin: 0 };
  const sc = new Sculpt();
  const [f, l, u] = s.upper;
  const farOf = (piece: string): boolean =>
    piece.endsWith('L') ? farSide(w, piece.startsWith('leg') ? s.kneeL : s.elbowL) : piece.endsWith('R') ? farSide(w, piece.startsWith('leg') ? s.kneeR : s.elbowR) : false;

  // ---- HIS STUFFS: clean, a step darker on his far side, the light on the crest of each plate; little grain
  const steel = sc.mat({
    ramp: STEEL_W,
    crease: 0.7,
    paint: (h) => {
      const k = (h.tone === 3 && h.nl > 0.86 ? 1 : 0) - (farOf(h.prim.piece) ? 1 : 0);
      return k ? shadeOf(STEEL_W, h.tone + k) : null;
    },
  });
  const mail = sc.mat({
    ramp: MAIL_W,
    crease: 0.7,
    paint: (h) => {
      const k = ((h.x + (h.y >> 1) * 2) % 4 === 0 && h.tone >= 2 ? -1 : 0) - (farOf(h.prim.piece) ? 1 : 0);
      return k ? shadeOf(MAIL_W, h.tone + k) : null;
    },
  });
  const brass = sc.mat({ ramp: BRASS });
  const leather = sc.mat({
    ramp: PLUM_W,
    paint: (h) => {
      const p = h.prim;
      if (p.tag === 'grip' && p.k === 'cone') {
        const { t, around } = onCone(p as Cone, h.p, u);
        if (Math.floor(t * 10 + around / 1.4) % 2 === 0) return shadeOf(PLUM_W, h.tone - 1);
      }
      return farOf(p.piece) ? shadeOf(PLUM_W, h.tone - 1) : null;
    },
  });
  // (THE TABARD: red; his old chevron on its breast in steel; its long panels hanging in a few broad folds)
  const ribs0 = solve(B, q);
  void ribs0;
  const tabard = sc.mat({
    ramp: TABARD_W,
    crease: 0.7,
    paint: (h) => {
      const p = h.prim;
      if (p.tag === 'panel' && p.k === 'box') {
        const b = onBall(p, h.p);
        if (b[2] > 0.86) return shadeOf(TABARD_W, h.tone - 1);
        const fold = Math.sin(b[1] * 4.2 + 0.6);
        if (fold < -0.6) return shadeOf(TABARD_W, h.tone - 1);
        return null;
      }
      if (p.tag === 'tabard' && p.k === 'ell') {
        // the chevron: a broad V of steel across the breast, its point down
        const b = onBall(p as Ell, h.p);
        if (b[0] > 0.45) {
          const v = b[2] + 0.1 - Math.abs(b[1]) * 0.85;
          if (v < 0.16 && v > -0.1) return shadeOf(STEEL_W, Math.max(2, h.tone));
        }
      }
      return null;
    },
  });
  const scarf = sc.mat({ ramp: SCARF_W });
  // (THE BLADE: the friend's cyan, white along its edges, its fuller a step darker; steel at its root, the ricasso)
  const P = s.point;
  const A = s.across;
  const N = norm(cross(P, A));
  // (whichever of his fists is nearer the blade, the guard is just beyond it; the pommel just beyond the other)
  const tL = dot(sub(s.handL, s.handR), P);
  const guard = add(s.handR, mul(P, Math.max(0, tL) + 1.5));
  const pommel = add(s.handR, mul(P, Math.min(0, tL) - 2.9));
  const tip = add(guard, mul(P, GREAT_BLADE * 1.02));
  const L0 = GREAT_BLADE * 1.02;
  const RIC = 3.2;
  const halfAt = (along: number): number => (along < L0 - 7 ? 2.15 - (along / (L0 - 7)) * 0.55 : 1.6 * Math.max(0, (L0 - along) / 7));
  const blade = sc.mat({
    ramp: BLADE,
    crease: 0.2,
    paint: (h) => {
      const v = sub(h.p, guard);
      const along = dot(v, P);
      const acr = Math.abs(dot(v, A));
      if (along < RIC) return shadeOf(STEEL_W, Math.max(2, h.tone));
      if (acr > halfAt(along) - 0.62) return BLADE[4];
      if (acr < 0.45 && along < L0 - 8) return BLADE[2];
      return BLADE[3];
    },
  });

  // ---- UNDER IT ALL: a strong man's body in mail
  manBody(sc, w, mail, 1.0);
  const T = tailorFor(sc, w, 1.0);
  const { ribs, belly } = T;
  const [rf, rl, ru] = ribs.r;

  // ---- THE BREASTPLATE, steel, with a keel down its middle (two planes of light and shade); THE GORGET round his neck
  for (const side of [1, -1]) {
    const c = add(ribs.c, add(mul(rf, ribs.h[0] * 0.42), add(mul(rl, side * ribs.h[1] * 0.42), mul(ru, ribs.h[2] * 0.12))));
    const face = norm(add(mul(rf, 1), mul(rl, side * 0.55)));
    sc.box(steel, 'torso', c, [mul(face, ribs.h[0] * 0.62 + 0.9), mul(norm(cross(ru, face)), ribs.h[1] * 0.62), mul(ru, ribs.h[2] * 0.95)], 2.0, 1.2, { tag: 'chest' });
  }
  sc.ell(steel, 'torso', add(s.neck, mul(u, -0.6)), [mul(f, 3.6), mul(l, 4.6), mul(u, 1.7)], 0.6, { tag: 'gorget' });
  // ---- THE TABARD over the breastplate: before and behind, open at the sides; the chevron on it
  for (const side of [1, -1]) {
    const c = add(ribs.c, add(mul(rf, side * (ribs.h[0] * 0.95 + 0.9)), mul(ru, -ribs.h[2] * 0.05)));
    sc.ell(tabard, 'torso', c, [mul(rf, side * 1.6), mul(rl, ribs.h[1] * 0.86), mul(ru, ribs.h[2] * 1.2)], 1.2, { tag: 'tabard' });
  }
  // ---- THE BELT and its brass buckle; THE FAULD, three lames of steel round his hips under it
  const bc = T.waistBand(leather, 1.0, 1.25, 0.5);
  const fwd = belly.r[0];
  sc.box(brass, 'hips', add(bc, mul(fwd, belly.h[0] + 1.25)), [mul(fwd, 0.4), mul(belly.r[1], 1.3), mul(belly.r[2], 1.15)], 0.3, 0.2, { tag: 'buckle' });
  for (let i = 0; i < 3; i++) {
    const c = add(bc, mul(belly.r[2], -1.4 - i * 1.6));
    sc.ell(steel, 'hips', c, [mul(belly.r[0], belly.h[0] + 1.0 + i * 0.45), mul(belly.r[1], belly.h[1] + 1.2 + i * 0.5), mul(belly.r[2], 0.95)], 0.2, { tag: 'fauld' });
  }
  // ---- THE TABARD'S PANELS: long, before and behind, hanging from the belt to below his knees, a little out from him
  const hipF = norm([s.hips[0][0], s.hips[0][1], 0]);
  const drop = B.thigh * 1.0;
  for (const side of [1, -1]) {
    const out = mul(hipF, side) as V3;
    const flare = norm(add(mul(U, -1), mul(out, 0.14)));
    const acrossP = norm(cross(U, out));
    const top = add(bc, mul(out, (side > 0 ? belly.h[0] : belly.h[0] * 0.9) + 1.6));
    sc.box(tabard, 'hips', add(top, mul(flare, drop * 0.5)), [mul(norm(cross(acrossP, flare)), 0.5), mul(acrossP, B.pelvisHalf * 0.72), mul(flare, drop * 0.5)], 0.35, 0.4, { tag: 'panel' });
    // its foot cut in a shallow point
    const foot = add(top, mul(flare, drop));
    for (const x of [-1, 1]) sc.box(tabard, 'hips', add(foot, mul(acrossP, x * B.pelvisHalf * 0.72)), [mul(out, 1.2), mul(acrossP, B.pelvisHalf * 0.5), mul(flare, 1.6)], 0.1, 0.1, { carve: true });
  }

  // ---- THE ARMS: broad pauldrons edged in brass; couters with fans; vambraces; gauntlets, cuffs flared, round the grip
  const [aS, aE, aW] = B.armR;
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'armL' : 'armR';
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const el = side > 0 ? s.elbowL : s.elbowR;
    const ha = side > 0 ? s.handL : s.handR;
    const out = mul(l, side) as V3;
    // (the pauldron: three broad plates, each lapping the one under it, the top one high and wide over the point of the
    // shoulder, its edge rolled in brass)
    for (let i = 0; i < 2; i++) {
      const n = norm(add(mul(u, 1), mul(out, 0.25 + i * 0.85)));
      const t2 = norm(cross(n, f));
      const c = add(sh, add(mul(u, 2.3 - i * 1.5), mul(out, 0.7 + i * 0.9)));
      const wide = aS + 1.5 - i * 0.35;
      sc.box(steel, piece, c, [mul(f, wide), mul(t2, aS + 0.9 - i * 0.25), mul(n, 0.65)], 0.6, 0.2, { tag: 'pauldron' });
      const lip = add(c, mul(t2, -(aS + 0.85 - i * 0.25)));
      sc.cone(i === 0 ? brass : steel, piece, add(lip, mul(f, wide - 0.4)), add(lip, mul(f, -(wide - 0.4))), 0.45, 0.45, 0.1, { tag: 'roll' });
    }
    const [ud, uo] = limbFrame(sh, el, out);
    const [fd, fo] = limbFrame(el, ha, out);
    sc.cone(steel, piece, lerp3(sh, el, 0.4), lerp3(sh, el, 0.95), aS + 0.25, aE + 0.3, 0.5, { tag: 'rerebrace' });
    // the couter: a cup on the point of the elbow, its fan on the outside
    const backOf = norm(sub(ud, fd));
    sc.ell(steel, piece, add(el, mul(backOf, aE * 0.5)), [mul(backOf, 1.4), mul(fo, aE + 0.8), mul(norm(cross(backOf, fo)), aE + 0.9)], 0.4, { tag: 'couter' });
    sc.box(steel, piece, add(el, mul(uo, aE + 1.0)), [mul(uo, 0.45), mul(ud, 2.4), mul(norm(cross(uo, ud)), 2.1)], 0.6, 0.2, { tag: 'fan' });
    // the vambrace, and the gauntlet: its cuff flared, the fist round the grip, a plate over the knuckles
    sc.cone(steel, piece, lerp3(el, ha, 0.14), lerp3(el, ha, 0.78), aE + 0.35, aW + 0.35, 0.5, { tag: 'vambrace' });
    sc.cone(steel, piece, lerp3(el, ha, 0.7), lerp3(el, ha, 0.96), aW + 0.5, aW + 1.25, 0.3, { tag: 'cuff' });
    const gr = P;
    const across = norm(cross(gr, fd));
    const back = norm(cross(across, gr));
    sc.box(leather, piece, add(ha, mul(back, 0.2)), [mul(gr, 1.6), mul(back, 1.55), mul(across, 1.5)], 0.9, 0.6, { tag: 'fist' });
    sc.box(steel, piece, add(ha, mul(back, 1.55)), [mul(gr, 1.45), mul(back, 0.42), mul(across, 1.35)], 0.35, 0.2, { tag: 'knuckles' });
    void fo;
  }

  // ---- THE LEGS: cuisses over the thighs, poleyns with fans, greaves with a ridge, sabatons
  const [lH, lK, lA] = B.legR;
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'legL' : 'legR';
    const hip = side > 0 ? s.hipL : s.hipR;
    const knee = side > 0 ? s.kneeL : s.kneeR;
    const ankle = side > 0 ? s.ankleL : s.ankleR;
    const heel = side > 0 ? s.heelL : s.heelR;
    const toe = side > 0 ? s.toeL : s.toeR;
    const [td, tf] = limbFrame(hip, knee, s.hips[0]);
    const [sd, sf] = limbFrame(knee, ankle, s.hips[0]);
    // (the cuisse: a plate over the front of the thigh)
    sc.box(steel, piece, add(lerp3(hip, knee, 0.55), mul(tf, lH * 0.45)), [mul(td, Math.hypot(...sub(knee, hip)) * 0.38), mul(norm(cross(td, tf)), lH + 0.4), mul(tf, lH * 0.7)], 1.6, 0.6, { tag: 'cuisse' });
    // (the poleyn: a cup over the front of the knee, its fan on the outer side)
    const kf = norm(add(tf, sf));
    sc.ell(steel, piece, add(knee, mul(kf, lK * 0.55)), [mul(kf, 1.3), mul(norm(cross(kf, sd)), lK + 1.0), mul(norm(add(td, sd)), lK + 1.1)], 0.4, { tag: 'poleyn' });
    const outward = mul(s.hips[1], side) as V3;
    sc.box(steel, piece, add(knee, mul(outward, lK + 0.6)), [mul(outward, 0.45), mul(kf, 2.3), mul(norm(add(td, sd)), 2.0)], 0.6, 0.2, { tag: 'fan' });
    // (the greave, a ridge down the front of the shin)
    sc.cone(steel, piece, lerp3(knee, ankle, 0.12), lerp3(knee, ankle, 0.9), lK + 0.65, lA + 0.6, 0.5, { tag: 'greave' });
    sc.cone(steel, piece, add(lerp3(knee, ankle, 0.18), mul(sf, lK + 0.55)), add(lerp3(knee, ankle, 0.84), mul(sf, lA + 0.45)), 0.55, 0.45, 0.3, { tag: 'ridge' });
    // (the sabaton, on the floor: lames across it, its sole)
    const fdir = norm(sub(toe, heel));
    const fs = norm(cross(U, fdir));
    const half = Math.hypot(...sub(toe, heel)) * 0.5;
    const fc: V3 = add(lerp3(heel, toe, 0.52), [0, 0, 1.6]);
    sc.box(steel, piece, fc, [mul(fdir, half + 0.8), mul(fs, 1.8), mul(U, 1.45)], 1.1, 1.0, { tag: 'foot' });
    for (let i = 0; i < 3; i++) sc.ell(steel, piece, add(fc, add(mul(fdir, half * (0.0 + i * 0.34)), mul(U, 1.3))), [mul(fdir, 0.6), mul(fs, 1.9), mul(U, 0.55)], 0.2, { tag: 'lame' });
    sc.box(leather, piece, add(fc, mul(U, -1.25)), [mul(fdir, half + 0.95), mul(fs, 1.9), mul(U, 0.32)], 0.3, 0.3, { tag: 'sole' });
  }

  // ---- HIS BEAKED HELM (kept, his pick): a bascinet drawn up to a point; out over his face the beak of its visor, broad
  // and sharp, a keel along its top; the slot he sees through across it, burning the friend's cyan; the holes he breathes
  // through; the hinge of the visor at each side
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const H = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  // (as big as a hero's head in a helm, no bigger: the skull close round his head, its point short)
  sc.ell(steel, 'head', H(-0.08, 0, 0.04), [mul(hf, R[0] * 0.98), mul(hl, R[1] * 1.02), mul(hu, R[2] * 0.9)], 0.5, { tag: 'helm' });
  sc.cone(steel, 'head', H(-0.15, 0, 0.45), H(-0.4, 0, 1.28), R[1] * 0.6, 0.2, 0.9, { tag: 'helm' });
  sc.cone(mail, 'head', H(-0.2, 0, -0.5), add(s.neck, mul(u, -0.4)), R[1] * 0.9, B.shoulderHalf * 0.36, 0.7, { tag: 'aventail' });
  // (the beak: a clean point, narrow, out from his face and a little down; a thin keel along its top)
  const vRoot = H(0.55, 0, -0.1);
  const vPoint = H(2.05, 0, -0.5);
  sc.cone(steel, 'visor', vRoot, vPoint, R[1] * 0.66, 0.2, 0.5, { tag: 'visor' });
  sc.cone(steel, 'visor', H(0.85, 0, 0.18), H(1.95, 0, -0.42), 0.32, 0.2, 0.3, { tag: 'keel' });
  for (const sd2 of [1, -1]) sc.ell(brass, 'visor', H(0.05, sd2 * 0.98, -0.08), [mul(hf, 0.6), mul(hl, 0.3), mul(hu, 0.6)], 0.2, { tag: 'hinge' });
  // (the slot: cut across over the beak's root, its light the friend's cyan)
  const slot = sc.mat({ ramp: [BLADE[0], BLADE[1], BLADE[2], BLADE[3], BLADE[3]] });
  sc.box(slot, 'head', H(0.84, 0, 0.32), [mul(hf, 0.45), mul(hl, R[1] * 0.7), mul(hu, 0.38)], 0.1, 0.1, { tag: 'slot' });
  for (const lf of [0.22, -0.22]) sc.mark(H(1.3, lf, -0.26), INK, 1, 1, 0, 0, 1.0);

  // ---- HIS SCARF: wound round the gorget, knotted at the back, its two long ends streaming back behind him
  const N0 = (fw: number, up: number): V3 => add(s.neck, add(mul(f, fw), mul(u, up)));
  sc.ell(scarf, 'scarf', N0(0.4, 0.7), [mul(f, 4.4), mul(l, 5.6), mul(u, 1.7)], 0.5, { tag: 'wrap' });
  const knot = N0(-4.2, 0.6);
  sc.ell(scarf, 'scarf', knot, [mul(f, 1.4), mul(l, 1.7), mul(u, 1.5)], 0.4, { tag: 'knot' });
  for (const [sw, k] of [[1, 1.0], [-1, 0.8]] as const) {
    const back = norm([-f[0], -f[1], 0]);
    // (both blown out to his left, away from the blade, so they are seen against the dark from in front and behind)
    const a1 = add(knot, add(mul(back, 2.6 * k), add(mul(l, 3.4 + sw * 0.8), mul(U, -1.0 + sw * 0.6))));
    const a2 = add(a1, add(mul(back, 2.4 * k), add(mul(l, 4.6 * k), mul(U, -1.2 + sw * 1.2))));
    const a3 = add(a2, add(mul(back, 1.8 * k), add(mul(l, 4.2 * k), mul(U, 0.4 + sw * 0.6))));
    sc.cone(scarf, 'scarf', knot, a1, 1.25, 1.15, 0.4, { tag: 'tail' });
    sc.cone(scarf, 'scarf', a1, a2, 1.15, 1.05, 0.35, { tag: 'tail' });
    sc.cone(scarf, 'scarf', a2, a3, 1.05, 0.9, 0.35, { tag: 'tail' });
    sc.box(scarf, 'scarf', a3, [mul(back, 1.2), mul(l, 1.3), mul(U, 1.3)], 0.1, 0.1, { carve: true });
  }

  // ---- THE GREAT SWORD: its long grip in his two fists; a pommel cut in facets; a straight crossguard, its ends flared;
  // the ricasso; the blade, broad, its edges, its fuller, drawn to a point
  sc.cone(leather, 'sword', add(guard, mul(P, -0.3)), add(pommel, mul(P, 0.9)), 0.9, 0.85, 0.2, { tag: 'grip' });
  sc.box(brass, 'sword', pommel, [mul(norm(add(P, A)), 1.2), mul(norm(sub(A, P)), 1.2), mul(N, 0.85)], 0.3, 0.2, { tag: 'pommel' });
  sc.box(steel, 'sword', guard, [mul(P, 0.65), mul(A, 4.6), mul(N, 0.8)], 0.3, 0.2, { tag: 'guard' });
  for (const sd2 of [1, -1]) sc.box(brass, 'sword', add(guard, mul(A, sd2 * 4.9)), [mul(P, 1.0), mul(A, 0.6), mul(N, 1.0)], 0.3, 0.2, { tag: 'guard' });
  const g0 = add(guard, mul(P, 0.5));
  const m0 = add(guard, mul(P, L0 - 7));
  sc.tri(blade, 'sword', add(g0, mul(A, 2.15)), add(g0, mul(A, -2.15)), add(m0, mul(A, 1.6)), 0.5, 0.2, { tag: 'blade' });
  sc.tri(blade, 'sword', add(g0, mul(A, -2.15)), add(m0, mul(A, -1.6)), add(m0, mul(A, 1.6)), 0.5, 0.2, { tag: 'blade' });
  sc.tri(blade, 'sword', add(m0, mul(A, 1.6)), add(m0, mul(A, -1.6)), tip, 0.5, 0.2, { tag: 'blade' });

  void MOVES3;
  void brass;
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}
