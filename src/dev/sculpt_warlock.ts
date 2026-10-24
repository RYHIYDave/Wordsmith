// THE WARLOCK, SCULPTED (the art chat, 23 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His look, picked 23 Oct by 18:43 Pacific: “A with the spiked pauldron” (the horned hood and the long coat; his left arm
// already the demon's); his brief, by 22:10: “Pact-bound scholar (Recommended)”, “Hunched and pained”, “Heavy cyan hellfire
// (Recommended)”. So: a big man in a long dark coat, stooped and fighting the thing in him, his demon arm hanging heavy with
// cyan fire in its claws, his right hand clamped on it; the hood, the horns through it, two points of cyan for eyes; the
// spiked pauldron; the red book chained at his hip. What glows on him is cyan, the friend's.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { HEAD_B } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView, Stage } from '../art/skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Drawn, Ell } from './sculpt';
import { BRASS, HIDE, SKIN_W, farSide, limbFrame, manBody, manHead, onHead, shadeOf, tailorFor } from './sculpt_classes';
import type { Who } from './sculpt_classes';

/** His coat: black wool gone grey at its folds. */
export const COAT: Ramp = ['#0e0b1c', '#1e1832', '#322a50', '#4c4270', '#6c6094'];
/** The demon's hide on his arm: dark blood red. */
export const DEMON_RED: Ramp = ['#1a040a', '#3a0816', '#661424', '#9a2c32', '#cc5644'];
/** Horn and claw. */
export const IVORY: Ramp = ['#241c30', '#463a56', '#857894', '#cfc4dc', '#f2eefa'];
/** Steel: the pauldron, the chain. */
export const STEEL5: Ramp = ['#1c1a40', '#33306a', '#605aa8', '#a29ce2', '#e2deff'];
/** The book's red leather. */
const BOOKRED: Ramp = ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'];

/** THE WARLOCK'S BODY: the knight's height, broad: a big man for one who reads. */
export const WARLOCK_SCULPT_BODY: Build = buildOf(58, HEAD_B * 1.12, { shoulders: 1.16, chest: 1.1, waist: 1.0, hips: 1.0, depth: 1.05, limbs: 1.08, pad: 1.1 });

/** HUNCHED AND PAINED: stooped, his shoulders up, his weight back on his right foot; the demon arm thrust out before him,
 * its claws open on the fire; his right hand clamped round its forearm, holding it back. */
export function warlockStance(B: Build): Bones {
  const t = B.tall / 58;
  return {
    ...standing(B),
    pz: -1.2 * t, yaw: -18, bend: 16, side: -6, twist: 10, faceTurn: 2, faceUp: 4, faceTilt: -6,
    lfx: 2.4 * t, lfy: 1.6 * t, lft: 14, lk: 12,
    rfx: -2.0 * t, rfy: -2.2 * t, rft: -18, rk: -12, rfp: 6,
    lhIn: 0, lhx: 9.0 * t, lhy: 7.5 * t, lhz: -3.0 * t, le: 40,
    rhIn: 0, rhx: 6.5 * t, rhy: 9.5 * t, rhz: -7.0 * t, re: 18,
  };
}

/** CYAN FIRE in a hand: tongues of it, licking up, drawn over everything (it is light). */
export function handFire(st: Stage, at: V3, size: number, seed = 0): void {
  const [cx, cy] = st.at(at);
  const H = Math.round(size * 2.6);
  for (let y = -H; y <= 2; y++) {
    for (let x = -Math.ceil(size * 1.4); x <= Math.ceil(size * 1.4); x++) {
      const up = -y / H;
      // three tongues, waving, narrowing as they rise
      let inFlame = false;
      let core = false;
      for (const [k, off] of [[0, 0], [1, -0.9], [2, 0.9]] as const) {
        const tall = k === 0 ? 1 : 0.7;
        if (up > tall) continue;
        const sway = Math.sin(up * 5 + seed + k * 2) * size * 0.25 * up;
        const half = size * (k === 0 ? 1.0 : 0.65) * (1 - up / tall) ** 0.8;
        const dx = x - off * size * 0.6 - sway;
        if (Math.abs(dx) <= half) {
          inFlame = true;
          if (Math.abs(dx) <= half * 0.45 && up < tall * 0.6) core = true;
        }
      }
      if (!inFlame) continue;
      const c = core ? (up < 0.25 ? '#ffffff' : CYAN[3]) : up > 0.7 ? CYAN[1] : CYAN[2];
      st.over.set(Math.round(cx + x), Math.round(cy + y), c);
    }
  }
}

/** The warlock sculpted, standing as he stands, in one of the game's views. */
export function sculptWarlock(view: GameView, pose?: Bones, turn = 0): Drawn {
  const B = WARLOCK_SCULPT_BODY;
  const q = (pose ?? warlockStance(B)) as Posed;
  const s = solve(B, q);
  const w: Who = { s, B, view, spin: turn };
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.chest;
  const farArm = (piece: string): boolean => piece.endsWith('L') ? farSide(w, s.elbowL) : piece.endsWith('R') ? farSide(w, s.elbowR) : false;
  // HIS SKIN (seen only at his throat and right hand): the face is in the hood's dark
  const skin = sc.mat({ ramp: SKIN_W, shade: 0.5, paint: (h) => (farArm(h.prim.piece) ? shadeOf(SKIN_W, h.tone - 1) : null) });
  // (his body under the coat: the man's, so the coat lies on a body; his left arm is the demon's, built below)
  manBody(sc, w, skin, 1.0, 'L');
  manHead(sc, w, skin);
  const t = tailorFor(sc, w, 1.0);
  // THE COAT: over his trunk and shoulders, a high collar, its skirts to his ankles, open down the front below the belt
  const coat = sc.mat({
    ramp: COAT,
    paint: (h) => {
      const far = farArm(h.prim.piece) ? 1 : 0;
      if (h.prim.tag === 'hem') return shadeOf(BOOKRED, h.tone - 1);
      // its folds: darker runs down the skirt
      if (h.prim.tag === 'skirt') {
        const { around } = onCone(h.prim as Cone, h.p, f);
        // its front edges, piped in red where it opens
        if (Math.abs(Math.abs(around) - 0.42) < 0.12) return shadeOf(BOOKRED, h.tone);
        if (Math.floor((around + Math.PI) * 2.6) % 3 === 0) return shadeOf(COAT, h.tone - 1);
        // the red lining of its hem
        if (h.p[2] < 3.2) return shadeOf(BOOKRED, h.tone - 1);
      }
      return far ? shadeOf(COAT, h.tone - 1) : null;
    },
  });
  t.overTrunk(coat, 0.8, [], 'coat', true);
  // the skirts: from his hips flaring to his ankles, open at the front between his legs
  const mid = lerp3(s.ankleL, s.ankleR, 0.5);
  const top = add(t.pel.c, mul(s.hips[2], 1.2));
  const foot: V3 = [mid[0] - s.hips[0][0] * 0.6, mid[1] - s.hips[0][1] * 0.6, 2.0];
  sc.cone(coat, 'skirt', top, foot, B.pelvisHalf + 1.2, B.stance + 4.6, 1.4, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -1.6 }] });
  sc.box(coat, 'skirt', add(lerp3(top, foot, 0.62), mul(s.hips[0], B.stance + 4)), [mul(s.hips[0], B.stance + 2.6), mul(s.hips[1], 1.0), [0, 0, 12]], 0.4, 0.8, { carve: true });
  // the collar, standing up round his neck
  sc.cone(coat, 'torso', add(s.neck, mul(u, -1.4)), add(s.neck, add(mul(u, 1.6), mul(f, -0.6))), 3.6, 4.0, 0.6, { tag: 'collar', cuts: [{ n: f, o: f[0] * s.neck[0] + f[1] * s.neck[1] + f[2] * s.neck[2] + 1.6 }] });
  // his right arm in its sleeve, a turned-back cuff
  {
    const sh = s.shoulderR;
    const el = s.elbowR;
    const ha = s.handR;
    sc.ell(coat, 'armR', add(sh, mul(u, -0.4)), [mul(f, 3.0), mul(l, 2.8), mul(u, 2.8)], 1.8);
    sc.cone(coat, 'armR', sh, el, 2.9, 2.5, 1.4);
    sc.cone(coat, 'armR', el, lerp3(el, ha, 0.72), 2.5, 2.3, 1.2);
    sc.cone(coat, 'armR', lerp3(el, ha, 0.62), lerp3(el, ha, 0.76), 2.75, 2.75, 0.4, { tag: 'hem' });
    // his hand, clamped round the demon's arm
    const [d, o] = limbFrame(el, ha, mul(l, -1));
    sc.box(skin, 'armR', add(ha, mul(d, 0.6)), [mul(d, 1.5), mul(o, 1.1), mul(norm(cross(d, o)), 1.4)], 0.8, 0.9, { tag: 'hand' });
  }
  // trousers and boots under it
  const trousers = sc.mat({ ramp: COAT });
  t.legsIn(trousers, 1.7, 0.6);
  t.boots(t.bootMat(HIDE, null), true, null);
  // A BELT, and the red book chained at his right hip
  const belt = sc.mat({ ramp: HIDE, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.82 && Math.abs(onBall(h.prim as Ell, h.p)[1]) < 0.2 ? shadeOf(STEEL5, h.tone) : null) });
  t.waistBand(belt, 1.0, 1.5, 0.5);
  const book = sc.mat({
    ramp: BOOKRED,
    paint: (h) => {
      const b = onBall(h.prim as Ell, h.p);
      // the pages' edge, and a clasp of steel
      if (Math.abs(b[0]) > 0.7 && Math.abs(b[2]) < 0.75) return shadeOf(IVORY, h.tone - 1);
      if (Math.abs(b[2]) < 0.18 && b[0] > 0.3) return shadeOf(STEEL5, h.tone);
      return null;
    },
  });
  const hipR = add(t.belly.c, add(mul(l, -(t.belly.h[1] + 2.4)), add(mul(f, 0.6), mul(u, -t.belly.h[2] * 1.4))));
  sc.box(book, 'book', hipR, [mul(f, 2.4), mul(l, 1.1), mul(u, 3.0)], 0.5, 0.2, { tag: 'book' });
  const steel = sc.mat({ ramp: STEEL5 });
  const ring = add(t.belly.c, add(mul(l, -(t.belly.h[1] + 1.2)), add(mul(f, 1.4), mul(u, -t.belly.h[2] * 0.5))));
  for (let i = 0; i < 4; i++) {
    const p = lerp3(ring, add(hipR, mul(u, 3.0)), (i + 0.5) / 4);
    sc.ell(steel, 'book', add(p, mul(f, (i % 2) * 0.3)), [mul(f, 0.55), mul(l, 0.55), mul(u, 0.7)], 0, { tag: 'link' });
  }
  // THE DEMON'S ARM, his left: red hide from the shoulder, ridged with muscle, spines down the forearm, claws, cracks of cyan
  // light; the coat's sleeve torn off at the shoulder
  {
    const sh = s.shoulderL;
    const el = s.elbowL;
    const ha = s.handL;
    const out = l;
    const hide = sc.mat({
      ramp: DEMON_RED,
      paint: (h) => {
        const p = h.prim;
        if (p.tag === 'claw' || p.tag === 'spine') return null;
        if (p.k === 'cone') {
          const { t: along, around } = onCone(p, h.p, u);
          // cracks of cyan light running down it, branching
          const zig = Math.sin(along * 22 + around * 1.5) * 0.35;
          if (Math.abs(around - 0.6 - zig) < 0.16 || (along > 0.4 && Math.abs(around + 1.4 + zig * 0.6) < 0.12)) return h.tone >= 2 ? CYAN[3] : CYAN[2];
        }
        return farSide(w, el) ? shadeOf(DEMON_RED, h.tone - 1) : null;
      },
    });
    const [ud, uo, uw] = limbFrame(sh, el, out);
    sc.ell(hide, 'armL', add(sh, add(mul(u, -0.3), mul(uo, 0.7))), [mul(f, 3.6), mul(uo, 3.3), mul(u, 3.3)], 1.8, { tag: 'delt' });
    sc.cone(hide, 'armL', sh, el, 3.3, 2.7, 1.5, { tag: 'upper' });
    sc.ell(hide, 'armL', add(lerp3(sh, el, 0.5), mul(norm(add(f, mul(uo, -0.2))), 1.0)), [mul(ud, 3.6), mul(uo, 2.6), mul(uw, 2.6)], 1.4, { tag: 'bicep' });
    const wrist = lerp3(el, ha, 0.8);
    sc.cone(hide, 'armL', el, wrist, 3.1, 2.2, 1.3, { tag: 'fore' });
    const [fd, fo, fw] = limbFrame(el, ha, out);
    sc.ell(hide, 'armL', add(lerp3(el, ha, 0.28), mul(fo, 0.6)), [mul(fd, 3.2), mul(fo, 2.7), mul(fw, 2.6)], 1.4, { tag: 'foreBulge' });
    // the hand, big, its fingers spread and hooked, each ending in a claw of ivory
    const palm = add(ha, mul(fd, 0.4));
    sc.box(hide, 'armL', palm, [mul(fd, 1.9), mul(fo, 1.5), mul(fw, 2.3)], 0.9, 1.0, { tag: 'palm' });
    const claw = sc.mat({ ramp: IVORY });
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) / 1.5;
      const k0 = add(palm, add(mul(fd, 1.4), mul(fw, spread * 1.5)));
      const k1 = add(k0, add(mul(fd, 1.8), add(mul(fo, 0.5), mul(fw, spread * 0.9))));
      sc.cone(hide, 'armL', k0, k1, 0.62, 0.5, 0.5, { tag: 'finger' });
      const k2 = add(k1, add(mul(fd, 0.6), add(mul(fo, -1.8), mul(fw, spread * 0.3))));
      sc.cone(claw, 'armL', k1, k2, 0.5, 0.08, 0.2, { tag: 'claw' });
    }
    const th0 = add(palm, add(mul(fw, -2.0), mul(fd, 0.2)));
    sc.cone(hide, 'armL', th0, add(th0, add(mul(fd, 1.4), mul(fw, -1.0))), 0.65, 0.5, 0.5, { tag: 'finger' });
    // spines down the back of the forearm
    for (let i = 0; i < 3; i++) {
      const a = add(lerp3(el, wrist, 0.14 + i * 0.28), mul(fo, 2.0));
      sc.cone(claw, 'armL', a, add(a, add(mul(fo, 3.2 - i * 0.5), mul(fd, -1.6))), 0.9, 0.05, 0.3, { tag: 'spine' });
    }
    // the coat's sleeve, torn off ragged at the top of his arm
    sc.cone(coat, 'torso', add(sh, add(mul(u, 0.4), mul(out, -0.6))), add(sh, add(mul(ud, 2.2), mul(out, 0.3))), 3.3, 3.2, 0.6, { tag: 'torn' });
    // THE SPIKED PAULDRON: a plate of steel over the shoulder, three spikes standing off it
    sc.ell(steel, 'pauldron', add(sh, add(mul(u, 1.4), mul(out, 0.6))), [mul(f, 3.9), mul(out, 3.4), mul(u, 2.4)], 0.6, { tag: 'plate', cuts: [{ n: mul(u, -1) as V3, o: -(u[0] * sh[0] + u[1] * sh[1] + u[2] * sh[2]) + 0.2 }] });
    for (const [k, len] of [[-1.8, 5.4], [0.2, 7.4], [2.1, 5.2]] as const) {
      const base = add(sh, add(mul(u, 3.0), add(mul(out, 1.0), mul(f, k))));
      sc.cone(steel, 'pauldron', base, add(base, add(mul(u, len * 0.85), add(mul(out, len * 0.5), mul(f, k * 0.25)))), 1.3, 0.05, 0.3, { tag: 'spike' });
    }
  }
  // THE HOOD: deep, over his head, its opening a dark hollow with two points of cyan in it; the horns swept back through it
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const hat = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const hood = sc.mat({
    ramp: COAT,
    paint: (h) => {
      const [a, , c] = onHead(w, h.p);
      // inside the opening: the dark
      if (a > 0.55 && c < 0.55) return COAT[0];
      return null;
    },
  });
  sc.ell(hood, 'head', hat(-0.15, 0, 0.12), [mul(hf, R[0] * 1.32), mul(hl, R[1] * 1.3), mul(hu, R[2] * 1.22)], 1.0, { tag: 'hood' });
  sc.cone(hood, 'head', hat(-0.4, 0, -0.4), add(s.neck, add(mul(f, -1.8), mul(u, -1.2))), 3.2, 3.6, 1.6, { tag: 'hood' });
  // (the opening: the hood carved hollow before his face)
  sc.ell(hood, 'head', hat(1.15, 0, -0.18), [mul(hf, R[0] * 0.7), mul(hl, R[1] * 0.78), mul(hu, R[2] * 0.82)], 0.5, { carve: true });
  // the dark of his face in it, and his eyes
  // (seen under the hood's brim: drawn on the dark of the hood's opening, from up to its depth in front of them)
  for (const side of [1, -1]) sc.mark(hat(0.84, side * 0.34, 0.02), CYAN[3], 1, 1, 0, 0, 4.5);
  // THE HORNS: from his temples through the hood, swept back and curling up at their tips
  const horn = sc.mat({
    ramp: IVORY,
    paint: (h) => {
      const { t: along } = onCone(h.prim as Cone, h.p, hu);
      // ridged, ringed round
      return Math.floor(along * 4 + (h.prim.tag === 'h1' ? 0 : 0.5)) % 2 === 0 ? shadeOf(IVORY, h.tone - 1) : null;
    },
  });
  for (const side of [1, -1]) {
    let a = hat(0.25, side * 0.62, 0.72);
    let r = 1.8;
    const dirs: V3[] = [
      norm(add(mul(hu, 1.0), add(mul(hl, side * 0.5), mul(hf, -0.2)))),
      norm(add(mul(hu, 0.5), add(mul(hl, side * 0.35), mul(hf, -1.0)))),
      norm(add(mul(hu, -0.1), add(mul(hl, side * 0.15), mul(hf, -1.0)))),
      norm(add(mul(hu, 0.6), add(mul(hl, side * 0.1), mul(hf, -0.6)))),
    ];
    dirs.forEach((d, i) => {
      const b = add(a, mul(d, 3.2));
      sc.cone(horn, 'horns', a, b, r, r * 0.74, 0.6, { tag: `h${i % 2}` });
      a = b;
      r *= 0.74;
    });
  }
  void cross;
  void sub;
  void BRASS;
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, (st) => handFire(st, sc.at(add(s.handL, mul(limbFrame(s.elbowL, s.handL, l)[0], 2.4))), 3.8, 1), FRIEND_RIM);
}
