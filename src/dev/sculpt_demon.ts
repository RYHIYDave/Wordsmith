// THE WARLOCK'S DEMON, SCULPTED (the art chat, 23 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words (Pacific): “Cmon man.  No that isn’t it.  Try more hulking.  It doesn’t have to fit on the same character wire.
// Make it menacing”; at 21:07, “Have the demon effuse black smoke.  I’d like the demon form to change based on the damage
// word type attached to it.  So the black smoke can turn to flames or frost, or crackling lightning, or green stink lines or
// whatever”; “More detail,Wings back,Let’s see him in different colors.  I think he’ll be better as a darker less saturated
// color but let’s see a few.  Especially the colors of the damage types, green for poison, blue for frost, etc”; by 21:55,
// “Yes, ash black (Recommended)”; his brief by 22:11: “Feral and fast” (drops to all fours, bounds and leaps), “Claw
// rakes”, “Mostly for show (Recommended)” (the wings folded as he goes, flung wide when he roars or rakes), “Collapses into
// smoke (Recommended)”.
//
// SO: the hulking brute he said yes to, its own figure (no hero's bones), sculpted (dev/sculpt.ts) so it is one beast of
// muscle and not lumps: crouched low and forward, one fist of claws down on the floor, the other arm drawn back to rake;
// its head low before its hump, jaws open, horns; goat legs on hooves; its wings folded high on its back; a tail. Ash black,
// black smoke pouring off it; with a damage word on it, that word's hide and what pours off it (demon_hulk.ts's auras). What
// glows on it is the friend's cyan: its eyes, the cracks of the pact in its hide, the fire at its throat.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import type { GameView } from '../art/skin';
import { add, cross, lerp3, mul, norm, sub } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { Sculpt, draw, onCone } from './sculpt';
import type { Cone, Drawn } from './sculpt';
import { AURAS, HULK_CANVAS, HULK_HIDES, drawAura } from './demon_hulk';
import type { Aura } from './demon_hulk';
import { IVORY, STEEL5, handFire } from './sculpt_warlock';

const D = Math.PI / 180;
const tone5 = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, k))];
/** A hide of five steps, made from one of the demon's hides (theirs have the darkest twice). */
function five(r: Ramp): Ramp {
  return [r[0], mixHex(r[0], r[2], 0.5), r[2], r[3], r[4]];
}
function mixHex(a: string, b: string, k: number): string {
  const p = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
/** Its hide lifted a step, so that a figure so dark still shows its shape on the dungeon's dark (its top light, the rim). */
function lifted(r: Ramp): Ramp {
  return [r[0], mixHex(r[1], r[2], 0.5), mixHex(r[2], r[3], 0.6), mixHex(r[4], '#8a82a6', 0.22), mixHex(r[4], '#a8a0c4', 0.5)];
}

export interface DemonPose {
  name: string;
  /** Which way it is turned (degrees to its left of facing the eye's lower right). */
  yaw: number;
}

/** THE DEMON, sculpted, in one of the game's views; `aura`: what pours off it (smoke, or a damage word's); `hide`: its colour. */
export function sculptDemon(view: GameView, aura: Aura = 'smoke', hideAt = 0, yaw = -16): Drawn {
  const sc = new Sculpt();
  // (it is built facing as it stands, `yaw`; truly turned by turning that: it stands free, on no hero's bones)
  const F0 = norm([1, -1, 0]);
  const L0 = norm([1, 1, 0]);
  const a = yaw * D;
  const F = add(mul(F0, Math.cos(a)), mul(L0, Math.sin(a)));
  const L = add(mul(F0, -Math.sin(a)), mul(L0, Math.cos(a)));
  const U: V3 = [0, 0, 1];
  const P = (f: number, l: number, u: number): V3 => add(add(mul(F, f), mul(L, l)), mul(U, u));
  const X = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => [mul(F, rf), mul(L, rl), mul(U, ru)];
  const hide5 = lifted(five(HULK_HIDES[hideAt].hide));
  /** Is a point on its far side from the eye (a step darker, as the heroes' far limbs are). */
  const nearOf = (p: V3): number => (view === 'front' ? 0.612 * (p[0] - p[1]) + 0.5 * p[2] : 0.612 * (p[1] - p[0]) + 0.5 * p[2]);
  const farL = nearOf(P(0, 20, 50)) < nearOf(P(0, 0, 50));
  const farPiece = (piece: string): boolean => (piece.endsWith('L') ? farL : piece.endsWith('R') ? !farL : false);
  // ITS HIDE: black, every muscle in it; cracks of the pact's cyan light across its chest and down its arms
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
        const v = sub(h.p, P(18, 6, 62));
        const down = -v[2];
        const across = v[0] * L[0] + v[1] * L[1];
        if (down > -1 && down < 12 && Math.abs(across - Math.sin(down * 0.7) * 1.6 - down * 0.25) < 0.55) return h.tone >= 2 ? CYAN[3] : CYAN[2];
      }
      return farPiece(p.piece) ? tone5(hide5, h.tone - 1) : null;
    },
  });
  const horn = sc.mat({
    ramp: IVORY,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const { t } = onCone(h.prim as Cone, h.p, U);
      // ringed: darker bands round it, as a ram's
      return Math.floor(t * 3.4 + (h.prim.tag === 'ring' ? 0.5 : 0)) % 2 === 0 ? tone5(IVORY, h.tone - 1) : null;
    },
  });
  const bone = sc.mat({ ramp: IVORY });
  const steel = sc.mat({ ramp: STEEL5 });
  const mouth = sc.mat({ ramp: ['#120206', '#2a0610', '#3e0a16', '#5a1220', '#7a1c2a'] });
  const wingMat = sc.mat({
    ramp: lifted(five(['#040306', '#040306', '#0e0b12', '#1c1722', '#2c2534'])),
    paint: (h) => (h.prim.tag === 'membrane' && (h.x * 3 + h.y * 2) % 11 === 0 ? tone5(hide5, h.tone - 1) : null),
  });

  // (its shape is the hulking brute he said yes to (demon_hulk.ts), its lengths and girths kept, sculpted; made FERAL: its
  // chest thrown lower and forward, its right fist of claws down on the floor, its left drawn back high to rake, the pact's
  // fire in its claws; its great wings half open behind it)
  const plate = sc.mat({ ramp: ['#100c16', '#241e2c', '#3e3646', '#6e6478', '#9a90a6'] });
  const shagMat = (h: { x: number; y: number; tone: number }): string | null => ((h.x * 2 + (h.y >> 1)) % 5 === 0 ? tone5(hide5, h.tone - 2) : (h.x + h.y * 3) % 7 === 0 ? tone5(hide5, h.tone - 1) : null);
  // ---- THE TRUNK: belly, ribcage, two great slabs of chest, abs; over its back THE HUMP, a mountain of muscle out to both
  // shoulders; spines down its back
  // (slimmed from the hulk, his “The menacing level is good, but he’s too hulking”, 24 Oct: a waist drawn in under a deep
  // chest, lean ropes of muscle, not slabs; his height and his reach kept)
  sc.ell(hide, 'torso', P(5, 0, 50), X(10.5, 11, 10), 2.6, { tag: 'belly' });
  sc.ell(hide, 'torso', P(9, 0, 62), X(12.5, 16, 12), 3.0, { tag: 'chest' });
  for (const side of [1, -1]) sc.ell(hide, 'torso', P(17, side * 8.4, 64), X(5.4, 8.6, 7), 2.2, { tag: 'chest' });
  for (const up of [46, 53]) for (const side of [1, -1]) sc.ell(hide, 'torso', P(14.2, side * 4.6, up), X(3.4, 4.4, 3.4), 1.6, { tag: 'abs' });
  sc.ell(hide, 'torso', P(-3, 0, 75), X(8.5, 13, 7), 3.0, { tag: 'hump' });
  for (const side of [1, -1]) sc.ell(hide, 'torso', P(2, side * 12, 75), X(7, 7.5, 6.5), 2.6, { tag: 'trap' });
  sc.ell(hide, 'hips', P(-2, 0, 44), X(9.5, 11, 8), 2.6, { tag: 'pelvis' });
  for (let i = 0; i < 6; i++) {
    const at = P(-14 - i * 0.6, 0, 78 - i * 6.6);
    sc.cone(bone, 'spines', at, add(at, add(mul(F, -9 + i * 0.6), mul(U, 6 - i * 0.6))), 3.0 - i * 0.25, 0.2, 0.6, { tag: 'spine' });
  }
  // a rag of his coat round its loins, its red hem
  const rag = sc.mat({ ramp: ['#0a0816', '#161226', '#262040', '#3c345a', '#58507c'], paint: (h) => (h.p[2] < 33 ? ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'][Math.max(0, Math.min(4, h.tone))] : null) });
  sc.cone(rag, 'hips', P(-1, 0, 48), P(1, 0, 30), 13.5, 16.5, 1.6, { tag: 'rag', cuts: [{ n: [0, 0, -1], o: -30 }] });
  sc.ell(rag, 'hips', P(-1, 0, 46), X(12.5, 13.5, 4), 1.0, { tag: 'rag' });
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    const deep = 3 + ((i * 7) % 5);
    sc.ell(rag, 'hips', P(Math.cos(ang) * 15.5, Math.sin(ang) * 17.5, 30), X(2.2, 2.2, deep), 0.3, { carve: true });
  }

  // ---- THE HEAD: hung low and forward under the hump; a brow like a shelf; a jaw thrust out, open on fangs, the furnace of
  // the pact in its throat; burning eyes; ears swept back; horns forward
  const head = P(28, 0, 72);
  const HK = 1.18;
  sc.cone(hide, 'head', P(10, 0, 74), head, 8, 6.5, 2.6, { tag: 'neck' });
  sc.ell(hide, 'head', head, X(9 * HK, 9.5 * HK, 9.5 * HK), 2.0, { tag: 'skull' });
  sc.ell(hide, 'head', P(34, 0, 75.5), X(4.6, 10, 3), 0.8, { tag: 'brow' });
  sc.box(hide, 'head', P(35, 0, 67.5), X(6, 7.6, 4.0), 2.2, 1.0, { tag: 'snout' });
  sc.box(hide, 'jaw', P(35, 0, 59.5), X(7, 8.6, 3.0), 1.8, 1.0, { tag: 'jaw' });
  for (const side of [1, -1]) sc.ell(hide, 'head', P(31, side * 8.5, 70), X(4, 3, 4.5), 1.0, { tag: 'cheek' });
  sc.ell(mouth, 'jaw', P(37, 0, 63.8), X(5.2, 6.4, 2.4), 0.6, { tag: 'maw' });
  for (const [fx, fl, up] of [[41.5, 4, 1], [41.5, -4, 1], [39, 6, 1], [39, -6, 1], [42, 2, -1], [42, -2, -1], [40, 5, -1], [40, -5, -1]] as const) {
    const root = P(fx, fl, up > 0 ? 66 : 61.5);
    sc.cone(bone, 'jaw', root, add(root, mul(U, -up * 3.2)), 0.9, 0.05, 0.1, { tag: 'fang' });
  }
  for (const side of [1, -1]) sc.cone(hide, 'head', P(22, side * 8, 76), P(16, side * 15, 80), 2.2, 0.3, 0.8, { tag: 'ear' });
  for (const side of [1, -1]) {
    // eyes: slanted slits of the friend's cyan under the brow
    sc.mark(P(37, side * 4.6, 72.6), '#ffffff', 2, 1, side > 0 ? 0 : -1, 0, 3);
    sc.mark(P(37, side * 4.6, 72.6), CYAN[3], 2, 1, side > 0 ? 2 : -3, -1, 3);
  }
  for (const side of [1, -1]) {
    const pts = [P(27, side * 7, 80), P(27, side * 15, 84), P(33, side * 22, 88), P(43, side * 23, 88), P(51, side * 19, 84)];
    let r = 4.4;
    for (let i = 0; i < pts.length - 1; i++) {
      sc.cone(horn, 'horns', pts[i], pts[i + 1], r, Math.max(0.3, r - 1.05), 0.8, { tag: i % 2 ? 'ring' : 'h' });
      r = Math.max(0.3, r - 1.05);
    }
  }

  // ---- THE ARMS: a shoulder like a boulder under a crest of bone plates and a spike; forearms like trunks, spines and plates
  // down them; a broken shackle at each wrist; hands like shovels; long hooked claws
  const arm = (side: 1 | -1): void => {
    const piece = side > 0 ? 'armL' : 'armR';
    const raised = side < 0;
    const sh = P(6, side * 22, 74);
    const el = raised ? P(18, side * 40, 66) : P(14, side * 36, 44);
    const ha = raised ? P(38, side * 36, 84) : P(28, side * 32, 10);
    sc.ell(hide, piece, sh, X(8.2, 8.2, 7.8), 2.4, { tag: 'delt' });
    sc.cone(hide, piece, sh, lerp3(sh, el, 0.5), 6.8, 7.4, 1.8, { tag: 'upper' });
    sc.cone(hide, piece, lerp3(sh, el, 0.5), el, 7.4, 5.8, 1.8, { tag: 'upper' });
    sc.cone(hide, piece, el, lerp3(el, ha, 0.35), 6.2, 7.6, 1.8, { tag: 'fore' });
    sc.cone(hide, piece, lerp3(el, ha, 0.35), ha, 7.6, 5.0, 1.8, { tag: 'fore' });
    // the crest of bone plates over the shoulder, a spike off the biggest
    for (const [k, r] of [[0, 6.4], [1, 5.2], [2, 4.2]] as const) {
      const at = add(sh, add(mul(U, 9 - k * 3.2), add(mul(F, -2 + k * 2.6), mul(L, side * (3 - k * 1.2)))));
      sc.ell(plate, piece, at, X(r * 0.9, r, r * 0.55), 0.4, { tag: 'plate' });
    }
    const s0 = add(sh, add(mul(U, 13), mul(L, side * 3)));
    sc.cone(plate, piece, s0, add(s0, add(mul(U, 9), add(mul(L, side * 5), mul(F, -2)))), 3.0, 0.2, 0.4, { tag: 'spike' });
    // spines and plates down the forearm
    const back = norm(sub(mul(F, -1), mul(U, 0)));
    for (let i = 1; i <= 3; i++) {
      const at = lerp3(el, ha, 0.15 + i * 0.2);
      sc.cone(bone, piece, add(at, mul(back, 4.8)), add(at, add(mul(back, 11.5 - i * 2), mul(U, 2))), 2.0, 0.2, 0.5, { tag: 'spine' });
      sc.ell(plate, piece, add(lerp3(el, ha, 0.2 + i * 0.2), mul(L, side * 6.8)), X(3.8, 2.1, 3.2), 0.6, { tag: 'plate' });
    }
    // the broken shackle and its chain
    const cuff = lerp3(ha, el, 0.2);
    const fa = norm(sub(ha, el));
    sc.cone(steel, piece, add(cuff, mul(fa, -1.8)), add(cuff, mul(fa, 1.8)), 6.4, 6.4, 0.4, { tag: 'shackle' });
    for (let i = 0; i < 3; i++) {
      const at = add(cuff, add(mul(U, -(i * 4.6 + 3)), mul(F, 3 + i * 0.8)));
      sc.ell(steel, piece, at, X(1.6, i % 2 ? 0.9 : 2.2, 2.6), 0, { tag: 'link' });
    }
    // the hand, and its claws: four, long, hooked
    sc.ell(hide, piece, ha, X(7, 6.2, 6.2), 2.0, { tag: 'palm' });
    const dir = raised ? norm(add(mul(F, 1), mul(U, 0.6))) : norm(add(mul(F, 0.7), mul(U, -1)));
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const a0 = add(ha, add(mul(dir, 5.0), mul(L, k * 2.7)));
      const m = raised ? add(a0, add(mul(dir, 6.5), mul(F, -0.5))) : add(a0, add(mul(dir, 4.5), mul(F, 3.0)));
      const b = raised ? add(m, add(mul(dir, 3.0), mul(F, -4))) : [m[0] + F[0] * 6, m[1] + F[1] * 6, 0.6] as V3;
      sc.cone(hide, piece, a0, m, 1.9, 1.4, 1.0, { tag: 'finger' });
      sc.cone(bone, piece, m, b, 1.5, 0.2, 0.3, { tag: 'claw' });
    }
  };
  arm(1);
  arm(-1);

  // ---- THE LEGS: a goat's, short and thick, coarse hair from the thigh down, a cloven hoof, spurs of bone at the hock
  const shag = sc.mat({ ramp: hide5, paint: shagMat });
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'legL' : 'legR';
    const hip = P(0, side * 10, 42);
    const knee = P(12, side * 14, 26);
    const hock = P(-6, side * 13.5, 13);
    const hoof = P(side > 0 ? 4 : -2, side * 13, 3.4);
    sc.cone(hide, piece, hip, knee, 8, 5.8, 2.2, { tag: 'thigh' });
    sc.cone(shag, piece, knee, hock, 6.0, 3.8, 1.4, { tag: 'shank' });
    sc.cone(shag, piece, hock, hoof, 3.6, 2.8, 1.2, { tag: 'pastern' });
    sc.box(horn, piece, add(hoof, add(mul(F, 2.0), [0, 0, 0.3])), X(5.2, 3.8, 2.7), 1.4, 0.6, { tag: 'hoof' });
    sc.cone(bone, piece, add(hock, mul(F, -2)), add(hock, add(mul(F, -9), mul(U, 2))), 2.0, 0.2, 0.4, { tag: 'spur' });
  }
  // ---- THE TAIL: heavy, from the small of its back down to the floor and away, a hooked spike at its end
  {
    const pts = [P(-14, 0, 44), P(-26, -6, 30), P(-30, -18, 12), P(-22, -32, 6), P(-12, -40, 10)];
    for (let i = 0; i + 1 < pts.length; i++) sc.cone(hide, 'tail', pts[i], pts[i + 1], 4.6 - i * 0.9, 3.7 - i * 0.85, 1.4, { tag: 'tail' });
    sc.cone(horn, 'tail', pts[4], P(-4, -44, 18), 2.4, 0.2, 0.4, { tag: 'tailspike' });
  }
  // ---- THE WINGS: great and tattered, half open behind it (his “Wings back”), an arm of bone up from the shoulder blade to
  // the wrist, four fingers fanned from it, the leather between them torn at its trailing edge
  const leather = sc.mat({
    ramp: ['#0a0306', '#1c0810', '#2e0e18', '#4a1a24', '#6a2a30'],
    paint: (h) => ((h.x * 3 + h.y * 2) % 13 === 0 ? tone5(hide5, Math.max(0, h.tone - 2)) : null),
  });
  for (const side of [1, -1] as const) {
    const root = P(-12, side * 12, 82);
    const elbow = P(-22, side * 34, 104);
    const wrist = P(-26, side * 50, 128);
    const tips = [P(-28, side * 64, 124), P(-30, side * 78, 102), P(-28, side * 74, 72), P(-24, side * 60, 48)];
    const flank = P(-12, side * 22, 54);
    sc.cone(hide, 'wings', root, elbow, 3.6, 3.0, 1.2, { tag: 'wingarm' });
    sc.cone(hide, 'wings', elbow, wrist, 3.0, 2.2, 1.0, { tag: 'wingarm' });
    for (const t of tips) sc.cone(horn, 'wings', wrist, t, 1.8, 0.5, 0.4, { tag: 'finger' });
    sc.cone(bone, 'wings', wrist, P(-24, side * 52, 136), 2.0, 0.2, 0.3, { tag: 'thumbclaw' });
    // the leather: WHOLE, a sheet between each pair of fingers, from the last finger back along the arm to the elbow and
    // down to its flank, and from the arm to its back, so nothing of the wing is missing (his “And the wings just have a
    // huge triangle missing”, 24 Oct); its trailing edge only gently scalloped between the fingers, a small tear or two
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
      // (the scallop: a shallow curve in from the edge between two fingers, a tenth of the gap deep)
      sc.ell(leather, 'wings', add(mid, mul(inward, -span * 0.4)), [mul(inward, span * 0.5), mul(norm(cross(n, inward)), span * 0.34), mul(n, 3)], 0.3, { carve: true });
      // (and a small tear in one or two)
      if (i === 1) sc.ell(leather, 'wings', lerp3(a0, mid, 0.8), [mul(inward, 1.6), mul(norm(cross(n, inward)), 0.8), mul(n, 3)], 0.2, { carve: true });
    }
  }

  const d = draw(sc, view, HULK_CANVAS.ax, HULK_CANVAS.ay, HULK_CANVAS, (st) => handFire(st, P(46, -36, 92), 5.5, 2), FRIEND_RIM);
  const behind = nearOf(F) < 0;
  drawAura(d.st, d.px, aura, {
    from: [P(-6, 0, 88), P(0, 20, 86), P(0, -20, 86), P(-12, 12, 82), P(-12, -12, 82), P(20, -38, 72), P(20, 34, 30), P(-2, 0, 70)],
    horns: [P(51, 19, 84), P(51, -19, 84), P(43, 23, 88), P(43, -23, 88)],
    jaw: P(40, 0, 62),
    claws: [P(38, -36, 84), P(30, 32, 4)],
    feet: [P(4, 13, 2), P(-2, -13, 2), P(34, 32, 1)],
    behind,
  });
  // NO PIXEL ALONE (his rulebook's Pixels 1): a spark, a flake or a drop of what pours off it left alone on the dark is
  // drawn two pixels long, down the picture
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

/** Which of the demon's hides goes with each aura (his “Yes, ash black (Recommended)” for no word). */
export const DEMON_LOOKS: { name: string; aura: Aura; hide: number }[] = [
  { name: 'No word: ash black, smoke', aura: 'smoke', hide: 0 },
  { name: 'Fire: flames', aura: 'fire', hide: 2 },
  { name: 'Frost: frost', aura: 'frost', hide: 3 },
  { name: 'Lightning: sparks', aura: 'lightning', hide: 4 },
  { name: 'Poison: stink', aura: 'poison', hide: 5 },
];
void AURAS;
