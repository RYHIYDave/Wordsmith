// FLOOR 20'S BOSS, THE MOTH (THE QUIET TOWER'S TOP), THE END OF ACT 2. A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file; `MOTH_ON` is off. Its moves are art/moth_moves.ts; what its moves leave on the top, art/moth_fx.ts.
//
// FLOOR 20, THE QUIET TOWER: the highest tower of the High City; its top, an open platform under the sky, is the Moth's.
// Its palette, "Grey fog, bone white, no colour at all". The story, from the plan he said yes to: "the torn-out last
// chapter lies open on the tower's top. It does not tell how the story ends. It is a name, and the thing it names is the
// Hush itself." The Moth was his pick for the horror that makes the Hush.
//
// HIS PICK for how it moves (offered as "Same brief, but slow, looming wingbeats."; the recommended one was another):
// “Slow, heavy wingbeats”. The rest is the brief as offered: a vast grey moth, its wings wider than the room is long, an
// eye on each wing that opens and follows you; the dust off its wings is the Hush itself (where it falls, words go dark
// and sound dies); the biggest thing in the game; its mark, the eyes on its wings; a buffet of its wings, Dust, the Eyes,
// the Swarm; faster and dustier each phase; in the last it settles on the last chapter and its wings beat the whole top;
// it dies screaming, the first sound it ever makes, and every word it swallowed pours out of it and flies home. Never
// gory, never a pretty butterfly, never cute. Its sound: silence, wing-beats, then the scream.
//
// HOW IT IS BUILT. On the heroes' bones (art/skeleton.ts), as the Carrion Queen is, so that every check the bosses have
// (art/boss_checks.ts) can be run on it: the bones' pelvis, spine, chest and neck are its body's line, from where its
// abdomen hangs to where its head sits; the rest of it is its own (its wings, its six legs, its abdomen, its head,
// antennae and mouthparts), put on that line by the numbers of each pose (`MothPose`, read from the bones' spare
// numbers: see `poseOf`). The bones' own arms and legs are never painted.
//
// A REAL MOTH'S BODY, sculpted, never a pair of ovals: a thorax furred thick, a shaggy collar round its neck, a furred
// cape over each wing's root; a head set low, with two great dark compound eyes, faceted, a dull pink shine deep in them;
// two feathered antennae, combed on both sides; furred palps; a coiled tongue; an abdomen of eight segments, each with a
// pale fringe and side tufts, a tuft at its tip; six legs, jointed (a furred femur, a spurred tibia, a tarsus of five
// joints and a claw). FOUR WINGS: each a sail of scales cut to its own outline (the forewing long, its apex hooked; the
// hindwing a broad fan, its margin scalloped and torn), cupped along a vein so that it is never a flat board edge on (its
// trailing part bent up, and further as it lags behind a stroke), its veins running out from its root, its cross-lines
// wavering across it in bone white, a fringe of chequered scales along its edge, the hair thick at its root. AN EYE ON
// EACH WING (four: a great one on each hindwing, a lesser on each forewing), set in an eyespot's rings: a REAL EYE,
// lidded, the lids furred; its white veined; its iris the Hush's dull pink; it opens, it shuts, and its pupil follows
// you as the wing moves. Grey, ash and bone white, furred and dusty. The enemy's pink edge round it while it lives.
// Nothing cyan.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { TILE3 } from './new_mobs3';
import type { Bit, MobCanvas, Moment, PanelSkin, Put } from './new_mobs3';
import type { Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const MOTH_ON = { on: false };

const D2R = Math.PI / 180;
/** A tone kept on a ramp's five. */
function T(k: number): number {
  return k < 0 ? 0 : k > 4 ? 4 : k;
}
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
/** `v` turned about the unit axis `k` by `deg`. */
const about = (v: V3, k: V3, deg: number): V3 => {
  const c = Math.cos(deg * D2R);
  const s = Math.sin(deg * D2R);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
};

// =============================================================================================
// ITS COLOURS: grey, ash and bone white (a figure's: a step bolder than the tower's own stones); the dull pink of the Hush
// in the irises of its wing-eyes and deep in its compound eyes; the Hush's own grey-violet in the dust off its wings

/** Its fur: ash. */
export const FUR: Ramp = ['#100e12', '#1f1c23', '#35313a', '#524d55', '#77717a'];
/** Its pale fur, tufts and fringes: bone grey. */
export const FUR_PALE: Ramp = ['#2e2a2a', '#4d4844', '#7a736b', '#a49c90', '#c9c1b3'];
/** Its forewings: ash, darker than its hindwings. */
export const WING_FORE: Ramp = ['#161517', '#262428', '#3a383c', '#545156', '#736f74'];
/** Its hindwings: smoky ash. */
export const WING_HIND: Ramp = ['#1a191b', '#2b292c', '#424043', '#5d5a5e', '#7f7b7f'];
/** Its wings' undersides: paler, the marks fainter. */
const WING_UNDER: Ramp = ['#201f20', '#333133', '#4a484a', '#686567', '#8c8889'];
/** Bone white: the cross-lines, the fringes, the rings round its eyes. */
export const BONE: Ramp = ['#45403a', '#6a6359', '#958c7e', '#c1b8a7', '#e3dccd'];
/** Its wing-eyes' whites. */
export const SCLERA: Ramp = ['#4e463e', '#7c7264', '#aaa08e', '#d0c7b4', '#eae3d4'];
/** The dull pink of the Hush, its irises: deep, dull, and (open wide, burning) hot. */
export const IRIS: readonly [string, string, string] = [FLAME[0], FLAME[1], FLAME[2]];
const PUPIL = '#07060a';
/** Its compound eyes: black glass, faceted. */
const COMPOUND: Ramp = ['#040306', '#0a090d', '#14121a', '#221f2a', '#3a3645'];
/** Its antennae: bone grey. */
const ANT: Ramp = ['#36322c', '#58534a', '#7f786c', '#a59d8f', '#c6beaf'];
/** Its legs' shins and feet: horn grey. */
const HORN: Ramp = ['#1a181a', '#2c292b', '#45403f', '#655e5a', '#8a8279'];
/** Inside its mouth as it screams: dark, and deep in it the Hush's dull pink. */
const MAW: Ramp = ['#050406', '#09070b', '#100c12', '#1a1219', '#24161f'];
/** The Hush: the dust off its wings (the game's own Hush: art/crier.ts HUSH, art/hushed.ts BREATH_PALE). */
export const HUSH_DUST: readonly string[] = ['#3e3852', '#625a7a', '#9890b4', '#b6b0cc'];
/** Where the Moth is struck too fast to see (his Movement 9): its after-images, the oldest a dull grey, the newest near white. */
export const MOTH_SMEAR: readonly string[] = ['#6f6a78', '#aea8b8', '#ece6ee'];

// =============================================================================================
// ITS SIZE (the figure's own lengths: one is a picture pixel of height; a tile is TILE3 along the floor)

/** Its forewing, root to apex: so that, spread, its wings are as wide as the top is long (a boss arena, about 17 by 20 tiles). */
export const LF = 372;
/** Its hindwing, root to the far edge of its fan. */
export const LH = 276;
/** Its bones: the line of its body (pelvis to neck, 81) and nothing else of them painted. */
export const MOTH_BODY: Build = buildOf(270, 1.6, {});
const B = MOTH_BODY;
/** Its picture: room for its wings spread their whole width, raised high over its back, and for it on the top. */
export const MOTH_CANVAS: MobCanvas = { w: 1040, h: 1000, ax: 520, ay: 770 };
/** Its thorax, half its length, width and depth. */
export const THORAX: V3 = [64, 60, 52];
/** Its head, half its depth, width and height. */
export const HEAD: V3 = [27, 31, 28];
/** Its abdomen: eight segments, each this long, each this thick (half), from the thorax back to its tip. */
export const AB_SEG = 26;
export const AB_R: readonly number[] = [41, 47, 48, 45, 38, 30, 22, 14];
/** Its legs (fore, mid, hind): femur, tibia, tarsus. */
export const LEG: readonly (readonly [number, number, number])[] = [[58, 64, 52], [66, 74, 56], [74, 86, 62]];

/** Its rest: hovering, its body tipped forward to 32 degrees above level, its wings at the top of a beat. */
export const MOTH_REST: Bones = {
  ...standing(B),
  pz: 67, pitch: 58, faceUp: 0,
  // (its own numbers: the beat, the sweep, the twist and the spread of its wings; its wing-eyes; its abdomen's curl; its scream; its legs' reach)
  wEl: 56, wAz: -2, wRoll: 14, pt: 1, draw: 0.35, pEl: 15, pAz: 0, gale: 0.1, out: 0,
} as Bones;

// =============================================================================================
// ITS POSE: what of a moment's bones is its own

export interface MothPose {
  /** The forewings' beat (degrees up from level, about its body's line), sweep (forward), twist (trailing edge up), and spread (0 folded back along it, 1 out). */
  beat: number;
  sweep: number;
  twist: number;
  spread: number;
  /** The hindwings' beat and sweep: a moment behind the forewings' (they follow). */
  hindBeat: number;
  hindSweep: number;
  /** Its wing-eyes: 0 shut, about a third half-lidded, 1 wide, more: wider than wide, burning (the Eyes). */
  eyes: number;
  /** Where its wing-eyes look (a point of the figure's space). */
  look: V3;
  /** Its abdomen's curl (degrees: under it if more than nothing) and its sway (a lag, the figure's own lengths). */
  curl: number;
  sway: V3;
  /** Its scream (0 shut, 1 its mouthparts wide). */
  scream: number;
  /** Its legs' reach in the air (0 tucked, 1 reaching down), and where each foot is put down on the top (null: in the air). */
  reach: number;
  feet: ReadonlyArray<V3 | null>;
  /** How far its feet are put down where `feet` says (0 in the air, 1 down), as it lands; its forefeet's own. */
  plant: number;
  plantFore: number;
  /** Its antennae swept back by its own way through the air (a lag). */
  antLag: V3;
  /** The light going out of it (dying), and how far it has crumbled to dust (0 whole, 1 gone). */
  out: number;
  crumble: number;
  /** Its wings trembling (degrees, already in its beat): how hard, for the dust they shake off. */
  shiver: number;
}
/**
 * WHAT OF ITS POSE IS NOT THE BONES' OWN, carried on each key of its moves beside the bones' numbers (art/moth_moves.ts
 * puts them there, worked out from the move itself): so that whoever has a moment's pose has all of it (the painter, and
 * the review, art/boss_checks.ts, which is given only the bones and their pose).
 */
export interface MothExtra {
  /** The hindwings' beat and sweep (a moment behind the forewings'). */
  m_hb: number;
  m_hs: number;
  /** The abdomen's sway and the antennae's lag (the figure's own lengths). */
  m_sx: number;
  m_sy: number;
  m_sz: number;
  m_ax: number;
  m_ay: number;
  m_az: number;
  /** Its feet put down round the book (0 in the air, 1 down); its forefeet's own. */
  m_plant: number;
  m_pf: number;
  /** Where its eyes look. */
  m_lx: number;
  m_ly: number;
  m_lz: number;
  /** How far it has crumbled; how hard its wings tremble. */
  m_cr: number;
  m_sh: number;
}
const EXTRA_KEYS: readonly (keyof MothExtra)[] = ['m_hb', 'm_hs', 'm_sx', 'm_sy', 'm_sz', 'm_ax', 'm_ay', 'm_az', 'm_plant', 'm_pf', 'm_lx', 'm_ly', 'm_lz', 'm_cr', 'm_sh'];
/** Where its six feet are put down round the book (left fore, mid, hind; right fore, mid, hind): the figure's floor, its own lengths (the middle of its last joint, as thick as it is over the stones). */
export const FEET_DOWN: readonly V3[] = [[136, 96, 1.8], [44, 140, 1.8], [-62, 122, 1.8], [136, -96, 1.8], [44, -140, 1.8], [-62, -122, 1.8]];
/** Its pose from a moment's bones and pose (what of it is its own is carried on the pose: MothExtra). */
export function poseOf(q: Posed): MothPose {
  // (between two keys, each of its own numbers from the one to the other, as the bones' are: art/skeleton.ts bonesAt)
  const raw = q as unknown as Partial<MothExtra> & { from?: Partial<MothExtra>; to?: Partial<MothExtra>; mixK?: number };
  const x: Partial<MothExtra> = {};
  for (const k of EXTRA_KEYS) {
    const a = raw.from?.[k];
    const b = raw.to?.[k];
    x[k] = a !== undefined && b !== undefined && raw.mixK !== undefined ? a + (b - a) * raw.mixK : raw[k];
  }
  const beat = q.wEl;
  const plant = x.m_plant ?? 0;
  const plantFore = x.m_pf ?? plant;
  return {
    beat,
    sweep: q.wAz,
    twist: q.wRoll,
    spread: q.pt,
    hindBeat: x.m_hb ?? beat - 3,
    hindSweep: x.m_hs ?? q.wAz,
    eyes: q.draw,
    look: x.m_lx !== undefined ? [x.m_lx, x.m_ly ?? 0, x.m_lz ?? 20] : [5 * TILE3, 0, 20],
    curl: q.pEl,
    sway: [x.m_sx ?? 0, x.m_sy ?? 0, x.m_sz ?? 0],
    scream: q.pAz,
    reach: q.gale,
    feet: plant > 0 || plantFore > 0 ? FEET_DOWN : [null, null, null, null, null, null],
    plant,
    plantFore,
    antLag: [x.m_ax ?? 0, x.m_ay ?? 0, x.m_az ?? 0],
    out: q.out,
    crumble: x.m_cr ?? 0,
    shiver: x.m_sh ?? 0,
  };
}

// =============================================================================================
// ITS PARTS, WHERE THEY ARE

/** One of its wings: its root (hinge), the way along its leading edge (`c`) and back across it (`d`), its upper face's normal (`n`), its length. */
export interface Wing {
  side: 1 | -1;
  hind: boolean;
  hinge: V3;
  c: V3;
  d: V3;
  n: V3;
  len: number;
  /**
   * ITS FOLD: a wing is not a flat board but cupped along a vein from its root (`th` degrees back from its leading edge),
   * its trailing part bent up off the leading part's plane by `phi` degrees, and more as it lags behind a stroke (loose
   * things follow): `F` along the fold, `Qf` across the trailing part, `nT` the trailing part's upper face.
   */
  th: number;
  phi: number;
  F: V3;
  Qf: V3;
  nT: V3;
}
export interface Leg {
  coxa: V3;
  knee: V3;
  ankle: V3;
  /** Its tarsus, joint by joint from the ankle to the claw's tip. */
  tarsus: V3[];
}
export interface MothGeom {
  /** Its body's line: ventral (V), left (L), along it toward its head (A), dorsal (Dd). */
  V: V3;
  L: V3;
  A: V3;
  Dd: V3;
  /** Its thorax's middle; its head's middle and its head's way forward, left and up. */
  TC: V3;
  HC: V3;
  hF: V3;
  hL: V3;
  hU: V3;
  /** Its abdomen: the middles of its eight segments, and the way each lies (from the thorax back to the tip); and its tip. */
  ab: V3[];
  abDir: V3[];
  abTip: V3;
  wings: Wing[];
  /** Its legs: left fore, mid, hind; right fore, mid, hind. */
  legs: Leg[];
  /** Its antennae: the points along each shaft, from its root on the head. */
  ant: V3[][];
}

const IK = (h: V3, t: V3, a: number, b: number, pole: V3): V3 => {
  const ax0 = sub(t, h);
  const d = Math.max(Math.abs(a - b) + 0.5, Math.min(a + b - 0.5, len(ax0)));
  const ax = norm(ax0, [0, 0, -1]);
  const along = (a * a - b * b + d * d) / (2 * d);
  const hgt = Math.sqrt(Math.max(0, a * a - along * along));
  const perp = norm(sub(pole, mul(ax, dot(pole, ax))), [0, 0, 1]);
  return add(h, add(mul(ax, along), mul(perp, hgt)));
};

/** One wing, where it is: its root on the thorax, then its beat about its body's line, its sweep and its twist. */
function wingOf(TC: V3, L: V3, A: V3, Dd: V3, side: 1 | -1, hind: boolean, beat: number, sweep: number, twist: number, spread: number, flex: number): Wing {
  const sL = mul(L, side);
  const hinge = add(TC, add(mul(A, (hind ? -0.3 : 0.32) * THORAX[0]), add(mul(sL, (hind ? 0.6 : 0.66) * THORAX[1]), mul(Dd, (hind ? 0.62 : 0.7) * THORAX[2]))));
  // (spread, the forewing's leading edge a little forward of square to its body, the hindwing's swept back; folded, both
  // swept right back along the abdomen)
  const s0 = hind ? -24 : 8;
  const sw = (s0 + sweep * (hind ? 0.8 : 1)) * spread + (hind ? -84 : -72) * (1 - spread);
  const lat = add(mul(sL, Math.cos(beat * D2R)), mul(Dd, Math.sin(beat * D2R)));
  const c = norm(add(mul(lat, Math.cos(sw * D2R)), mul(A, Math.sin(sw * D2R))));
  let d = norm(sub(mul(lat, Math.sin(sw * D2R)), mul(A, Math.cos(sw * D2R))));
  let n = mul(cross(c, d), side);
  d = norm(add(mul(d, Math.cos(twist * D2R)), mul(n, Math.sin(twist * D2R))));
  n = mul(cross(c, d), side);
  // ITS FOLD: cupped along a vein, its trailing part bent up, and bent further as it lags behind the stroke
  const th = hind ? 58 : 30;
  const phi = Math.max(-4, Math.min(40, (hind ? 13 : 17) + flex));
  const F = add(mul(c, Math.cos(th * D2R)), mul(d, Math.sin(th * D2R)));
  const Q = add(mul(c, -Math.sin(th * D2R)), mul(d, Math.cos(th * D2R)));
  const Qf = add(mul(Q, Math.cos(phi * D2R)), mul(n, Math.sin(phi * D2R)));
  const nT = add(mul(n, Math.cos(phi * D2R)), mul(Q, -Math.sin(phi * D2R)));
  return { side, hind, hinge, c, d, n, len: hind ? LH : LF, th, phi, F, Qf, nT };
}
/** Whether a point of a wing (its own lengths) is on its trailing part, past its fold. */
export const pastFold = (w: Wing, x: number, y: number): boolean => -x * Math.sin(w.th * D2R) + y * Math.cos(w.th * D2R) > 0;
/** A point of a wing, `x` along its leading edge and `y` back across it (its own lengths, not shares). */
export function onWing(w: Wing, x: number, y: number): V3 {
  const st = Math.sin(w.th * D2R);
  const ct = Math.cos(w.th * D2R);
  const q = -x * st + y * ct;
  if (q <= 0) return add(w.hinge, add(mul(w.c, x), mul(w.d, y)));
  return add(w.hinge, add(mul(w.F, x * ct + y * st), mul(w.Qf, q)));
}
/** A way along a wing laid on it as its trailing part lies (the images of its own `c` and `d` past the fold). */
function foldedAxes(w: Wing): [V3, V3] {
  const st = Math.sin(w.th * D2R);
  const ct = Math.cos(w.th * D2R);
  return [add(mul(w.F, ct), mul(w.Qf, -st)), add(mul(w.F, st), mul(w.Qf, ct))];
}

/** Where every part of it is at a moment. */
export function mothGeom(s: Skeleton, P: MothPose): MothGeom {
  const V = s.chest[0];
  const L = s.chest[1];
  const A = s.chest[2];
  const Dd = mul(V, -1);
  const TC = add(lerp3(s.pelvis, s.neck, 0.54), mul(Dd, 3));
  // ITS HEAD: low on the front of its thorax, its face forward and down (up, as it screams)
  const HC = add(TC, add(mul(A, THORAX[0] * 0.9 + HEAD[0] * 0.5 - 3 * P.scream), mul(V, 10 - 6 * P.scream)));
  const down = 24 - 34 * P.scream;
  const hF = norm(add(mul(A, Math.cos(down * D2R)), mul(V, Math.sin(down * D2R))));
  const hL = L;
  const hU = norm(cross(hF, hL));
  // ITS ABDOMEN: eight segments back from its thorax, curling under it (or arching), swaying behind its way
  const hips = s.hips;
  const ab: V3[] = [];
  const abDir: V3[] = [];
  let dir = norm(mul(hips[2], -1));
  const curlAxis = norm(cross(dir, hips[0]), L);
  let p = add(TC, add(mul(Dd, 5), mul(A, -THORAX[0] * 0.72)));
  for (let i = 0; i < AB_R.length; i++) {
    const k = i / (AB_R.length - 1);
    dir = norm(add(about(dir, curlAxis, P.curl / AB_R.length), mul(P.sway, 0.012 * k)));
    const half = AB_SEG * 0.5;
    const c = add(p, mul(dir, half + (i === 0 ? 2 : 0)));
    ab.push(c);
    abDir.push(dir);
    p = add(c, mul(dir, half));
  }
  const abTip = add(p, mul(abDir[abDir.length - 1], 6));
  // ITS WINGS
  const wings: Wing[] = [];
  for (const side of [1, -1] as const) {
    // (the trailing parts lag the stroke: on the way down they are bent up the more, on the way up flattened)
    const flex = 1.1 * (P.hindBeat + 3 - P.beat);
    wings.push(wingOf(TC, L, A, Dd, side, false, P.beat, P.sweep, P.twist, P.spread, flex));
    wings.push(wingOf(TC, L, A, Dd, side, true, P.hindBeat, P.hindSweep, P.twist * 0.7, P.spread, flex * 0.8));
  }
  // ITS LEGS: from under its thorax; in the air tucked under it (or reaching down), on the top each foot where it is put
  const legs: Leg[] = [];
  for (const side of [1, -1] as const) {
    const sL = mul(L, side);
    for (let pr = 0; pr < 3; pr++) {
      const [lf, lt, lta] = LEG[pr];
      const coxa = add(TC, add(mul(A, [0.5, 0.08, -0.32][pr] * THORAX[0]), add(mul(sL, [0.36, 0.48, 0.52][pr] * THORAX[1]), mul(V, [0.66, 0.78, 0.72][pr] * THORAX[2]))));
      const foot = P.feet[(side === 1 ? 0 : 3) + pr];
      const out = norm(add(mul(sL, 1), mul(A, [0.7, 0.05, -0.75][pr])));
      let knee: V3 = coxa;
      let ankle: V3 = coxa;
      let tarsus: V3[] = [];
      let down: Leg | null = null;
      const plant = pr === 0 ? P.plantFore : P.plant;
      if (foot && plant > 0) {
        // (put down: its tarsus along the top from the ankle out to the claw, the ankle lifted; the knee up and out, a spider's)
        const outF = norm([foot[0] - coxa[0], foot[1] - coxa[1], 0], [1, 0, 0]);
        const ankleD = add(foot, add(mul(outF, -lta * 0.74), [0, 0, 15]));
        const kneeD = IK(coxa, ankleD, lf, lt, add(mul(outF, 1), [0, 0, 1.3]));
        const tarsusD: V3[] = [];
        for (let j = 0; j <= 5; j++) {
          const u = j / 5;
          const q = lerp3(ankleD, foot, u);
          tarsusD.push([q[0], q[1], Math.max(foot[2], foot[2] + 15 * (1 - u) * (1 - u) * (1 - 0.3 * u))]);
        }
        down = { coxa, knee: kneeD, ankle: ankleD, tarsus: tarsusD };
      }
      if (down && plant >= 1) {
        knee = down.knee;
        ankle = down.ankle;
        tarsus = down.tarsus;
      } else {
        // (in the air: the femur out and forward (or back), the tibia folded under; reaching, both down and out)
        const r = P.reach;
        // (folded: the femur forward and out from under it, the tibia folded back along it, the tarsus laid back under
        // its belly, curling; reaching: the femur out and up, a spider's, the tibia down, the tarsus hanging)
        const tuckF = norm(add(mul(A, [0.75, 0.45, 0.1][pr]), add(mul(V, 0.55), mul(sL, 0.42))));
        const reachF = norm(add(mul(A, [0.5, 0.05, -0.45][pr]), add(mul(V, 0.2), add(mul(sL, 0.85), [0, 0, 0.15]))));
        const fdir = norm(lerp3(tuckF, reachF, r));
        knee = add(coxa, mul(fdir, lf));
        const tuckT = norm(add(mul(tuckF, -0.8), add(mul(V, 0.42), mul(A, -0.25))));
        const reachT = norm(add(mul(A, [0.25, 0, -0.25][pr]), add(mul(sL, 0.3), [0, 0, -1])));
        ankle = add(knee, mul(norm(lerp3(tuckT, reachT, r)), lt));
        // (its tarsus laid back under it, curling up at its claw, swinging behind as it goes; reaching, hanging)
        tarsus = [ankle];
        let td = norm(lerp3(norm(add(mul(A, -0.9), mul(V, 0.3))), [0, 0, -1], 0.85 * r));
        let tp = ankle;
        for (let j = 1; j <= 5; j++) {
          td = norm(add(td, add(mul(P.sway, 0.008 * j), mul(V, -0.1 * (1 - r)))));
          tp = add(tp, mul(td, lta / 5));
          // (never through the top: in the air its claws hang clear of it)
          if (tp[2] < 3) tp = [tp[0], tp[1], 3];
          tarsus.push(tp);
        }
        // (coming down: from where it hangs to where it is put down)
        if (down) {
          // (over its spot first, then down onto it: so that once its claw is on the stones it does not move)
          const dn = down;
          const w = sm(plant);
          const wxy = sm(Math.min(1, plant * 1.6));
          knee = lerp3(knee, dn.knee, w);
          ankle = lerp3(ankle, dn.ankle, w);
          tarsus = tarsus.map((p2, j) => {
            const q = dn.tarsus[j];
            return [p2[0] + (q[0] - p2[0]) * wxy, p2[1] + (q[1] - p2[1]) * wxy, p2[2] + (q[2] - p2[2]) * w] as V3;
          });
        }
      }
      legs.push({ coxa, knee, ankle, tarsus });
    }
  }
  // ITS ANTENNAE: from the top of its head, up and out, sweeping back; swept further back by its way through the air
  const ant: V3[][] = [];
  for (const side of [1, -1] as const) {
    const root = add(HC, add(mul(hU, HEAD[2] * 0.72), add(mul(hL, side * 8), mul(hF, HEAD[0] * 0.55))));
    let dir2 = norm(add(mul(hU, 1), add(mul(hL, side * 0.5), mul(hF, 0.55))));
    const pts: V3[] = [root];
    let at = root;
    const n = 20;
    for (let i = 1; i <= n; i++) {
      const k = i / n;
      // (curving back over it, and out)
      dir2 = norm(add(dir2, add(mul(hF, -0.08), add(mul(hL, side * 0.02), mul(P.antLag, 0.003 * k)))));
      at = add(at, mul(dir2, 156 / n));
      pts.push(at);
    }
    ant.push(pts);
  }
  return { V, L, A, Dd, TC, HC, hF, hL, hU, ab, abDir, abTip, wings, legs, ant };
}

// =============================================================================================
// ITS WINGS' OUTLINES (a share of the wing's length, `x` out along its leading edge, `y` back across it)

/** The forewing: its leading edge, gently bowed; its apex hooked back; its outer edge running down to the corner; its inner edge back to its root. */
const FORE_OUTLINE: readonly (readonly [number, number])[] = [
  [0.03, -0.03], [0.18, -0.062], [0.4, -0.078], [0.62, -0.072], [0.82, -0.048], [0.95, -0.012], [1.0, 0.03],
  [0.985, 0.075], [0.955, 0.112], [0.948, 0.16], [0.935, 0.22], [0.9, 0.3], [0.85, 0.38], [0.79, 0.45], [0.72, 0.5],
  [0.62, 0.508], [0.48, 0.47], [0.34, 0.4], [0.21, 0.29], [0.1, 0.17], [0.045, 0.075],
];
/** The hindwing: a broad fan, under the forewing at its leading edge, its far edge round, scalloped. */
const HIND_OUTLINE: readonly (readonly [number, number])[] = [
  [0.04, -0.02], [0.25, -0.05], [0.5, -0.05], [0.72, -0.01], [0.86, 0.07], [0.94, 0.18], [0.975, 0.32], [0.955, 0.47],
  [0.885, 0.61], [0.775, 0.73], [0.625, 0.82], [0.465, 0.87], [0.32, 0.86], [0.2, 0.78], [0.12, 0.63], [0.07, 0.43], [0.04, 0.2],
];
/** Each outline as a radius by angle round a point inside it (720 steps), its scallops and tears in it; and its box. */
interface Outline {
  o: readonly [number, number];
  r: Float32Array;
  box: readonly [number, number, number, number];
}
const BINS = 720;
function outlineOf(pts: readonly (readonly [number, number])[], o: readonly [number, number], scallop: number, tears: number, seed: number): Outline {
  // (the outline smoothed through its points)
  const n = pts.length;
  const fine: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let k = 0; k < 12; k++) {
      const u = k / 12;
      const f = (j: 0 | 1): number => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u * u * u);
      fine.push([f(0), f(1)]);
    }
  }
  const r = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    const a = (b / BINS) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let best = 0;
    for (let i = 0; i < fine.length; i++) {
      const [ax, ay] = fine[i];
      const [bx, by] = fine[(i + 1) % fine.length];
      // (the ray from o along (dx, dy) against the edge a-b)
      const ex = bx - ax;
      const ey = by - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const wx = ax - o[0];
      const wy = ay - o[1];
      const t = (wx * ey - wy * ex) / den;
      const u = (wx * dy - wy * dx) / den;
      if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
    }
    r[b] = best;
  }
  // (its scallops: the edge bitten between the veins' ends; and a few tears, deep, narrow notches)
  const out = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    const a = (b / BINS) * Math.PI * 2;
    let v = r[b];
    v -= scallop * Math.pow(Math.abs(Math.sin(a * 9 + seed)), 0.55);
    for (let k = 0; k < tears; k++) {
      const at = hash(k, 1, seed) * Math.PI * 2;
      const wide = (0.012 + 0.02 * hash(k, 2, seed)) * Math.PI;
      const deep = 0.03 + 0.06 * hash(k, 3, seed);
      let da = Math.abs(a - at);
      da = Math.min(da, Math.PI * 2 - da);
      if (da < wide) v -= deep * (1 - da / wide);
    }
    out[b] = Math.max(0.02, v);
  }
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (let b = 0; b < BINS; b++) {
    const a = (b / BINS) * Math.PI * 2;
    const x = o[0] + Math.cos(a) * out[b];
    const y = o[1] + Math.sin(a) * out[b];
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { o, r: out, box: [x0 - 0.01, y0 - 0.01, x1 + 0.01, y1 + 0.01] };
}
const FORE = outlineOf(FORE_OUTLINE, [0.44, 0.19], 0.006, 5, 11);
const HIND = outlineOf(HIND_OUTLINE, [0.42, 0.36], 0.018, 7, 23);
/** How far inside its outline a point of a wing is (shares of its length; less than nothing, outside). */
export function inWing(hind: boolean, x: number, y: number): number {
  const O = hind ? HIND : FORE;
  const dx = x - O.o[0];
  const dy = y - O.o[1];
  let a = Math.atan2(dy, dx);
  if (a < 0) a += Math.PI * 2;
  const f = (a / (Math.PI * 2)) * BINS;
  const i = Math.floor(f) % BINS;
  const R = O.r[i] + (O.r[(i + 1) % BINS] - O.r[i]) * (f - Math.floor(f));
  return R - Math.hypot(dx, dy);
}
/** Points round a wing's outline (shares), `n` of them, the root's own side left out (for the checks and the smear). */
export function wingRim(hind: boolean, n: number): [number, number][] {
  const O = hind ? HIND : FORE;
  const out: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    // (round the outline from its leading edge near the root, out to the tip, and back along its far edge)
    const a = (hind ? -150 : -160) * D2R + (k / (n - 1)) * (hind ? 250 : 230) * D2R;
    const aa = a < 0 ? a + Math.PI * 2 : a;
    const f = (aa / (Math.PI * 2)) * BINS;
    const R = O.r[Math.floor(f) % BINS];
    out.push([O.o[0] + Math.cos(a) * R, O.o[1] + Math.sin(a) * R]);
  }
  return out;
}

// =============================================================================================
// ITS EYES (a great one on each hindwing, a lesser on each forewing): where on the wing, how big, how they lie

export const EYE_AT: Readonly<Record<'fore' | 'hind', { x: number; y: number; r: number; tilt: number }>> = {
  fore: { x: 0.56, y: 0.2, r: 30, tilt: 8 },
  hind: { x: 0.5, y: 0.4, r: 44, tilt: -28 },
};
/** An eye's middle on its wing (the figure's space). */
export function eyeOf(w: Wing): V3 {
  const e = EYE_AT[w.hind ? 'hind' : 'fore'];
  return onWing(w, e.x * w.len, e.y * w.len);
}

/**
 * ONE OF ITS WING-EYES at a point (`ex`, `ey`: from its middle along it and across it, in its own radius): its rings, its
 * lids, its white, its iris and pupil; null, outside it. `open` (0 shut, 1 wide, more burning), `px`, `py` its pupil's way
 * (shares of the eye), `tone` the wing's light, `out` the light gone from it.
 */
function eyeColour(ex: number, ey: number, open: number, px: number, py: number, tone: number, out: number, dim: boolean): string | null {
  const rr = Math.hypot(ex, ey * 1.22);
  if (rr > 1.52) return null;
  // (the eyespot's rings round it: dark, bone, dark, and a smoky halo)
  if (rr > 1.0) {
    if (rr < 1.11) return WING_FORE[T(tone - 2)];
    if (rr < 1.25) return BONE[T(tone - 1 + (dim ? -1 : 0))];
    if (rr < 1.33) return WING_FORE[T(tone - 2)];
    if (rr < 1.52 && hash(Math.round(ex * 30), Math.round(ey * 30), 9101) < 0.55) return WING_HIND[T(tone - 1)];
    return null;
  }
  const o = Math.max(0, Math.min(1.25, open));
  // (the lids' opening: an almond, its half-height at `ex`)
  const ap = o * 0.6 * Math.pow(Math.max(0, 1 - ex * ex), 0.66);
  const edge = Math.abs(ey) - ap;
  if (edge > 0 || o < 0.04) {
    // THE LIDS: furred and heavy, folded over it, the lashes dark along the opening
    if (Math.abs(edge) < 0.075 || (o < 0.04 && Math.abs(ey) < 0.07)) return PUPIL;
    const upper = ey < 0;
    const lid = Math.abs(ey) - ap;
    // (its folds: two creases over the opening, one under it)
    const fold = upper ? Math.abs(lid - 0.2 * (1 - ex * ex)) < 0.03 || Math.abs(lid - 0.4 * (1 - ex * ex)) < 0.025 : Math.abs(lid - 0.18 * (1 - ex * ex)) < 0.025;
    if (fold) return FUR[T(tone - 2)];
    // (its fur combed round the eye, in streaks)
    const fur = vnoise2(Math.atan2(ey, ex) * 9, rr * 6, 7);
    return (upper && fur > 0.72 ? FUR_PALE : FUR)[T(tone - (upper ? 0 : 1) + (fur < 0.3 ? -1 : 0))];
  }
  // THE EYE ITSELF, wet, bulging under the lids
  const pr = 0.47 + 0.04 * Math.max(0, o - 1);
  const ix = ex - px;
  const iy = ey - py;
  const ir = Math.hypot(ix, iy);
  // (its pupil: wide half-lidded, a pinprick as it burns)
  const pup = o > 1 ? 0.07 : 0.23 - 0.08 * o;
  // (the shadow of the upper lid across it)
  const under = ey < -ap + 0.16;
  // (a catchlight: the sky in it)
  if (Math.hypot(ix + 0.13, iy + 0.15) < 0.075 && out < 0.5 && !under) return SCLERA[4];
  if (ir < pup) return PUPIL;
  if (ir < pr) {
    const lit = 1 - out;
    if (lit < 0.3) return '#2a1e26';
    // (the iris: the dull pink, streaked from the pupil out, darker at its rim; burning, hot about the pupil)
    const a = Math.atan2(iy, ix);
    const streak = Math.sin(a * 13 + Math.sin(a * 5) * 2) > 0.5;
    if (ir > pr * 0.85 || under) return IRIS[0];
    if (o > 1 && ir < pup + 0.09) return IRIS[2];
    return streak ? IRIS[0] : IRIS[1];
  }
  // the white, yellowed: in shadow under the upper lid and toward the corners; veined
  const shade = under ? -2 : ey < -ap * 0.3 || Math.abs(ex) > 0.74 ? -1 : 0;
  const v1 = Math.abs(Math.sin(ex * 9 + ey * 5) * 0.45 + ey * 0.8 - 0.1) < 0.03;
  const v2 = Math.abs(Math.sin(ex * 13 - ey * 7 + 1) * 0.3 - ey * 0.6 + 0.12) < 0.025;
  if ((v1 || v2) && Math.abs(ex) > 0.42 && out < 0.5) return '#6e3c46';
  return SCLERA[T(Math.max(1, tone + 1) + shade - (dim ? 1 : 0))];
}

// =============================================================================================
// ITS WINGS' SCALES: the pattern of a wing, at a point of it

/** Smooth value noise in 0..1 (blobs a few cells across, never squares). */
function vnoise2(x: number, y: number, k: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, 9900 + k);
  const b = hash(xi + 1, yi, 9900 + k);
  const c = hash(xi, yi + 1, 9900 + k);
  const d = hash(xi + 1, yi + 1, 9900 + k);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
/** A wavering of a line across a wing: never a clean wave, as scales lie. */
const wob = (v: number, k: number): number => 0.011 * Math.sin(v * 23 + k) + 0.007 * Math.sin(v * 61 + 2 * k) + 0.004 * Math.sin(v * 137 + k);
/** The forewing, its upper face: a dark ash root, hairy; two cross-lines wavering across it, each dark with a pale edge
 * outside it and broken where its scales are worn; the band between them darker, its eye in it; a broken pale line inside
 * its edge, dark wedges between its veins' ends; a pale dash in from its hooked apex; its chequered fringe; dust all over. */
function foreScale(x: number, y: number, e: number, tone: number, under: boolean): string {
  const W = under ? WING_UNDER : WING_FORE;
  // (scales: a speckle that moves with the wing, and a coarser mottle)
  const speck = hash(Math.floor((x * LF) / 3), Math.floor((y * LF) / 3), 9201);
  const mottle = vnoise2((x * LF) / 14, (y * LF) / 11, 3);
  const th = Math.atan2(y - 0.19, x - 0.44);
  // its fringe, chequered bone and dark between its veins' ends; a dark line inside it
  if (e < 0.016) return Math.floor(th * 26) % 2 === 0 ? BONE[T(tone - 1)] : W[T(tone - 2)];
  if (e < 0.022) return W[T(tone - 2)];
  if (!under && e < 0.052 && Math.floor(th * 13 + 0.5) % 2 === 0 && e > 0.03) return W[T(tone - 2)];
  // its root: hair, combed out from the body
  if (x < 0.13 + 0.02 * Math.sin(y * 40)) return (Math.sin(y * 90 + x * 30) > 0.3 ? FUR : W)[T(tone - 1 + (speck < 0.2 ? -1 : 0))];
  // its veins, out from the root, plain where the scales are thin
  const tv = Math.atan2(y, x) / D2R;
  const r = Math.hypot(x, y);
  if (r > 0.42) for (const v of [2, 7, 12, 18, 25, 33, 41]) if (Math.abs(tv - v) * D2R * r < 0.0042) return W[T(tone - 1)];
  // the cross-lines: dark, a pale edge outside each, broken
  const am = 0.29 + 0.06 * y + wob(y, 0);
  const pm = 0.6 + 0.2 * y + 0.018 * Math.pow(Math.abs(Math.sin(y * 28)), 0.7) + 0.5 * wob(y, 3);
  const worn = speck < 0.22;
  if (!under) {
    if (Math.abs(x - am) < 0.007) return W[T(tone - 2)];
    if (x - am >= 0.007 && x - am < 0.017 && !worn) return BONE[T(tone - 1)];
  }
  if (Math.abs(x - pm) < 0.007) return W[T(tone - 2 + (under ? 1 : 0))];
  if (x - pm >= 0.007 && x - pm < 0.018 && !worn) return BONE[T(tone - (under ? 2 : 1))];
  // a pale dash in from its hooked apex
  const ax = x - 1.0;
  const ay = y - 0.03;
  const along = ax * -0.82 + ay * 0.57;
  const across = ax * 0.57 + ay * 0.82;
  if (!under && along > 0.03 && along < 0.2 && Math.abs(across + 0.025 + along * 0.12) < 0.009 && !worn) return BONE[T(tone)];
  // a broken pale line inside its edge
  if (!under && Math.abs(e - 0.074 - 0.012 * Math.sin(th * 9)) < 0.0055 && speck > 0.3) return BONE[T(tone - 1)];
  // the band between the lines, darker; dust all over it
  let k = tone;
  if (x > am && x < pm) k -= 1;
  if (mottle < 0.3) k -= 1;
  if (speck < 0.14) k -= 1;
  else if (speck > 0.92) k += 1;
  return W[T(k)];
}
/** The hindwing, its upper face: smoky, its root thick with hair; its veins; a pale line round it beyond its eye, dark
 * inside it; a dark band outside it, darker wedges at its veins' ends; a pale scalloped edge, its fringe; dust. */
function hindScale(x: number, y: number, e: number, tone: number, under: boolean): string {
  const W = under ? WING_UNDER : WING_HIND;
  const speck = hash(Math.floor((x * LH) / 3), Math.floor((y * LH) / 3), 9202);
  const mottle = vnoise2((x * LH) / 13, (y * LH) / 13, 4);
  const th = Math.atan2(y, x) / D2R;
  if (e < 0.014) return Math.floor(th / 3.2) % 2 === 0 ? BONE[T(tone - 1)] : W[T(tone - 2)];
  if (e < 0.024) return BONE[T(tone - (under ? 2 : 1))];
  if (e < 0.032) return W[T(tone - 2)];
  const r = Math.hypot(x, y);
  // its root: long hair, combed out from the body
  if (r < 0.2 + 0.025 * Math.sin(th * 0.3)) return (Math.sin(th * 1.9 + r * 60) > 0.2 ? FUR : W)[T(tone - 1 + (speck < 0.25 ? -1 : 0))];
  if (r > 0.3) for (const v of [6, 18, 31, 44, 57, 70]) if (Math.abs(th - v) * D2R * r < 0.0048) return W[T(tone - 1)];
  // a wavering pale line round it, out past its eye, dark on its inner side; the band outside it dark, wedged darker
  const pm = 0.77 + 0.6 * wob(th / 40, 5);
  const worn = speck < 0.2;
  if (Math.abs(r - pm) < 0.006) return W[T(tone - 2)];
  if (r - pm >= 0.006 && r - pm < 0.02 && !worn) return BONE[T(tone - (under ? 2 : 1))];
  let k = tone;
  if (r > pm + 0.02 && !under) k -= 1;
  if (!under && r > pm + 0.02 && Math.floor(th / 6.5 + 0.5) % 2 === 0 && e < 0.075) k -= 1;
  if (mottle < 0.28) k -= 1;
  if (speck < 0.12) k -= 1;
  else if (speck > 0.94) k += 1;
  return W[T(k)];
}

/** The pupil of a wing-eye: the way to `look` laid on the wing, as a share of the eye (it follows you as the wing moves). */
function pupilOf(w: Wing, look: V3, tiltDeg: number): [number, number] {
  const E = eyeOf(w);
  const g = norm(sub(look, E));
  // (its way along the wing and across it; then turned as the eye lies)
  const gx = dot(g, w.c);
  const gy = dot(g, w.d);
  const t = tiltDeg * D2R;
  const ex = gx * Math.cos(t) + gy * Math.sin(t);
  const ey = -gx * Math.sin(t) + gy * Math.cos(t);
  const k = 0.42 / Math.max(0.42, Math.hypot(ex, ey));
  return [ex * k * 0.85, ey * k * 0.85];
}

/**
 * A WING'S SKIN, as a panel paints it: `a` along its leading edge and `b` back across it, from the panel's middle (`mx`,
 * `my`: where that is on the wing, its own lengths). Its outline, its scales, its eye; crumbling from its edge as it dies.
 */
function wingSkin(w: Wing, P: MothPose, mx: number, my: number, upperSeen: boolean, dimmed: boolean, trailing: boolean): PanelSkin {
  const Lw = w.len;
  const e0 = EYE_AT[w.hind ? 'hind' : 'fore'];
  const [px, py] = pupilOf(w, P.look, e0.tilt);
  const ct = Math.cos(e0.tilt * D2R);
  const stt = Math.sin(e0.tilt * D2R);
  const crumble = P.crumble;
  return (a, b, _front, tone0) => {
    const x = (mx + a) / Lw;
    const y = (my + b) / Lw;
    if (pastFold(w, x, y) !== trailing) return null;
    const e = inWing(w.hind, x, y);
    if (e < 0) return null;
    // (crumbling: eaten from its edge inward, in flakes)
    if (crumble > 0) {
      const flake = hash(Math.floor(x * Lw / 5), Math.floor(y * Lw / 5), 9301);
      if (e < crumble * 0.55 + flake * 0.18 * crumble - 0.02) return null;
      if (crumble > 0.55 && flake < (crumble - 0.55) * 2.4) return null;
    }
    // (a wing's scales take the light softly: never quite black, so its marks always read)
    const tone = Math.max(1, Math.min(4, [1, 2, 2, 3, 4][tone0] - (dimmed ? 1 : 0)));
    // its eye
    const dx = x * Lw - e0.x * Lw;
    const dy = y * Lw - e0.y * Lw;
    const ex = (dx * ct + dy * stt) / e0.r;
    const ey = (-dx * stt + dy * ct) / e0.r;
    if (ex * ex + ey * ey < 2.4) {
      const c = eyeColour(ex, ey, P.eyes, px, py, tone, P.out, !upperSeen);
      if (c) return c;
    }
    return w.hind ? hindScale(x, y, e, tone, !upperSeen) : foreScale(x, y, e, tone, !upperSeen);
  };
}

// =============================================================================================
// ITS FUR AND ITS SOLIDS

/** A furred skin: tufts in their own tones, a streak along the hair. */
function furSkin(ramp: Ramp, seed: number, crumble = 0, pale: Ramp | null = null, paleAt: ((u: V3) => boolean) | null = null): (u: V3, tone: number) => string | null {
  return (u, tone) => {
    if (crumble > 0) {
      const h = hash(Math.round(u[0] * 9), Math.round(u[1] * 9) * 7 + Math.round(u[2] * 9), seed + 77);
      if (h < crumble * 1.15 - 0.1) return null;
    }
    // (hair: streaks running along it, round it, each its own tone; never squares)
    const ang = Math.atan2(u[2], u[1]);
    const h = vnoise2(ang * 7 + seed, u[0] * 2.2, seed);
    const fine = vnoise2(ang * 19 + seed * 3, u[0] * 5, seed + 1);
    const k = tone + (h < 0.3 ? -1 : h > 0.78 ? 1 : 0) + (fine < 0.18 ? -1 : 0);
    const R = pale && paleAt && paleAt(u) ? pale : ramp;
    return R[Math.max(0, Math.min(4, k))];
  };
}
/** Glossy black glass, faceted; the light on it; and deep in it, toward whoever looks, the Hush's dull pink shining back. */
function compoundSkin(eyeU: V3, lit: number, crumble: number): (u: V3, tone: number) => string | null {
  return (u, tone) => {
    if (crumble > 0 && hash(Math.round(u[0] * 8), Math.round(u[1] * 8) + 31 * Math.round(u[2] * 8), 9401) < crumble * 1.2 - 0.1) return null;
    const facet = (Math.round(u[0] * 16) + Math.round(u[1] * 16) + Math.round(u[2] * 16)) % 2 === 0;
    const toward = u[0] * eyeU[0] + u[1] * eyeU[1] + u[2] * eyeU[2];
    // (deep in it, toward whoever looks, the Hush's dull pink shining back off a scatter of its facets: no pupil, not a lamp)
    const fh = hash(Math.round(u[0] * 16), Math.round(u[1] * 16) * 31 + Math.round(u[2] * 16), 9402);
    if (lit > 0.3 && toward > 0.72 && fh < 0.16 * (toward - 0.72) / 0.28) return fh < 0.05 ? FLAME[1] : FLAME[0];
    if (tone >= 4) return facet ? COMPOUND[4] : COMPOUND[3];
    return COMPOUND[Math.max(0, Math.min(3, tone - 2 + (facet ? 1 : 0)))];
  };
}

/** What a move says of the Moth over and above its bones (art/moth_moves.ts). */
export interface MothSay {
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes (lines of points, the oldest first). */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of its own move laid after its edge (the dust off its wings, the swarm on them, the words pouring out of it). */
  more?: (m: Moment) => [V3, string, number][];
  /** Little moths crawling on its wings (the Swarm's warning): where on which wing (index, x, y shares), how big. */
  crawlers?: (m: Moment) => [number, number, number, number][];
}

/** THE MOTH, AS SOLIDS. */
function mothBits(st: Stage, m: Moment, say: MothSay): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const P = poseOf(m.q);
  const G = mothGeom(m.s, P);
  const { V, L, A, Dd, TC, HC, hF, hL, hU } = G;
  const cr = P.crumble;
  const lit = 1 - clamp01(P.out);
  const nearSide: 1 | -1 = st.near(add(TC, L)) > st.near(add(TC, mul(L, -1))) ? 1 : -1;
  const toBall = (axes: [V3, V3, V3], v: V3): V3 => axes.map((x) => dot(x, v) / (len(x) || 1)) as unknown as V3;
  // (a crumbling rod: gone once it has crumbled past its own share)
  const gone = (seed: number): boolean => cr > 0 && hash(seed, 3, 9501) < cr * 1.3 - 0.15;

  // ---- ITS WINGS: four sails of scales, each a panel cut to its outline; the leading edge's vein along it ----
  G.wings.forEach((w, i) => {
    const part = `wing${w.side === nearSide ? 'Near' : 'Far'}${w.hind ? 'Hind' : 'Fore'}`;
    const Ow = w.hind ? HIND : FORE;
    const [x0, y0, x1, y1] = Ow.box;
    const mx = ((x0 + x1) / 2) * w.len;
    const my = ((y0 + y1) / 2) * w.len;
    const hw = ((x1 - x0) / 2) * w.len;
    const hh = ((y1 - y0) / 2) * w.len;
    // (its leading part, in the plane of its root; and its trailing part past its fold, bent up off it)
    const upperSeen = dot(w.n, st.eye) > 0;
    const dimmed = w.side !== nearSide && st.near(w.hinge) < st.near(TC) - 1.6 && !upperSeen;
    put(part, part, { k: 'panel', c: add(w.hinge, add(mul(w.c, mx), mul(w.d, my))), u: mul(w.c, hw), v: mul(w.d, hh), skin: wingSkin(w, P, mx, my, upperSeen, dimmed, false) });
    const [Mc, Md] = foldedAxes(w);
    const upperT = dot(w.nT, st.eye) > 0;
    const dimmedT = w.side !== nearSide && st.near(w.hinge) < st.near(TC) - 1.6 && !upperT;
    put(part, part, { k: 'panel', c: add(w.hinge, add(mul(Mc, mx), mul(Md, my))), u: mul(Mc, hw), v: mul(Md, hh), skin: wingSkin(w, P, mx, my, upperT, dimmedT, true) });
    // (the leading edge's vein, thick at the root)
    if (!w.hind && !gone(70 + i)) {
      const a = onWing(w, 0.05 * w.len, -0.03 * w.len);
      const mid = onWing(w, 0.5 * w.len, -0.072 * w.len);
      const tip = onWing(w, 0.94 * w.len, -0.014 * w.len);
      put(part, `${part}costa`, { k: 'rod', a, b: mid, ra: 2.2, rb: 1.4, ramp: WING_FORE });
      put(part, `${part}costa`, { k: 'rod', a: mid, b: tip, ra: 1.4, rb: 0.8, ramp: WING_FORE });
    }
    // (the hair at its root, long on the hindwing: soft, lying along the wing)
    const hairs = w.hind ? 14 : 8;
    for (let k = 0; k < hairs; k++) {
      if (gone(100 + i * 20 + k)) continue;
      const yy = (0.02 + (k / hairs) * (w.hind ? 0.55 : 0.32)) * w.len;
      const a = onWing(w, 0.02 * w.len, yy * 0.35);
      const b = add(onWing(w, (w.hind ? 0.14 : 0.09) * w.len, yy), mul(w.n, 1.5));
      put(part, `${part}hair`, { k: 'rod', a, b, ra: 1.8, rb: 0.5, ramp: k % 3 === 0 ? FUR_PALE : FUR });
    }
  });
  // ---- little moths crawling on its wings (the Swarm's warning) ----
  for (const [wi, x, y, size] of say.crawlers?.(m) ?? []) {
    const w = G.wings[wi];
    const at = add(onWing(w, x * w.len, y * w.len), mul(w.n, dot(w.n, st.eye) > 0 ? 2.5 : -2.5));
    const out = dot(w.n, st.eye) > 0 ? w.n : mul(w.n, -1);
    const part = `wing${w.side === nearSide ? 'Near' : 'Far'}${w.hind ? 'Hind' : 'Fore'}`;
    put(part, 'crawler', { k: 'ball', c: at, ax: [mul(w.c, size * 1.6), mul(w.d, size * 1.1), mul(out, size * 0.6)], skin: FUR_PALE });
    put(part, 'crawler', { k: 'rod', a: add(at, mul(w.c, -size * 1.3)), b: add(at, add(mul(w.c, size * 0.6), mul(w.d, size * 2))), ra: size * 0.6, rb: size * 0.3, ramp: BONE });
  }

  // ---- ITS THORAX: furred thick, its collar a shaggy mane round its neck, a furred cape over each wing's root ----
  const thAx: [V3, V3, V3] = [mul(A, THORAX[0]), mul(L, THORAX[1]), mul(Dd, THORAX[2])];
  put('thorax', 'thorax', { k: 'ball', c: TC, ax: thAx, skin: furSkin(FUR, 11, cr, FUR_PALE, (u) => u[0] > 0.6 || (u[2] > 0.5 && Math.abs(u[1]) < 0.14 && u[0] < 0.35 && u[0] > -0.45)) });
  // (its back humped behind the collar)
  put('thorax', 'scutum', { k: 'ball', c: add(TC, add(mul(A, -6), mul(Dd, THORAX[2] * 0.42))), ax: [mul(A, THORAX[0] * 0.7), mul(L, THORAX[1] * 0.74), mul(Dd, THORAX[2] * 0.62)], skin: furSkin(FUR, 13, cr) });
  // the mane: tufts all round its neck, standing out and forward, grey and bone
  for (let k = 0; k < 44; k++) {
    if (gone(200 + k)) continue;
    const a = (k / 44) * Math.PI * 2 + 0.09 * Math.sin(k * 2.3);
    const ring = add(add(TC, mul(A, THORAX[0] * 0.62)), add(mul(L, Math.cos(a) * THORAX[1] * 0.84), mul(Dd, Math.sin(a) * THORAX[2] * 0.84)));
    const out = norm(add(add(mul(L, Math.cos(a)), mul(Dd, Math.sin(a) * 0.9)), mul(A, 0.55 + 0.25 * hash(k, 2, 9601))));
    const long = 10 + 7 * hash(k, 1, 9601);
    const ramp = hash(k, 3, 9601) < 0.25 ? FUR_PALE : FUR;
    const mid = add(ring, mul(out, long * 0.55));
    put('thorax', 'mane', { k: 'rod', a: ring, b: mid, ra: 4.6, rb: 3.0, ramp });
    put('thorax', 'mane', { k: 'rod', a: mid, b: add(mid, mul(norm(add(out, mul(A, 0.3))), long * 0.5)), ra: 3.0, rb: 1.0, ramp });
  }
  // a crest of tufts along its back, combed back
  for (let k = 0; k < 6; k++) {
    if (gone(240 + k)) continue;
    const at = add(add(TC, add(mul(A, THORAX[0] * (0.42 - k * 0.2)), mul(L, (k % 2 ? 1 : -1) * 4))), mul(Dd, THORAX[2] * 1.02));
    put('thorax', 'crest', { k: 'rod', a: at, b: add(at, add(mul(A, -9), mul(Dd, 2.5))), ra: 3.6, rb: 1.2, ramp: FUR });
  }
  // shag under it, hanging back
  for (let k = 0; k < 12; k++) {
    if (gone(250 + k)) continue;
    const sd = k % 2 ? 1 : -1;
    const at = add(TC, add(mul(A, THORAX[0] * (0.5 - (k >> 1) * 0.17)), add(mul(L, sd * THORAX[1] * 0.62), mul(V, THORAX[2] * 0.7))));
    put('thorax', 'shag', { k: 'rod', a: at, b: add(at, add(mul(V, 9), add(mul(A, -9), mul(L, sd * 4)))), ra: 3.2, rb: 0.7, ramp: FUR });
  }
  // the capes over each forewing's root: long, furred, their front edge pale
  for (const side of [1, -1] as const) {
    if (gone(262 + side)) continue;
    const w = G.wings.find((x) => x.side === side && !x.hind) as Wing;
    const c = add(w.hinge, add(mul(A, -14), mul(Dd, 3)));
    put('thorax', 'cape', { k: 'ball', c, ax: [mul(A, 34), mul(mul(L, side), 13), mul(norm(add(Dd, mul(L, side * 0.4))), 9)], skin: furSkin(FUR, 12 + side, cr, FUR_PALE, (u) => u[0] > 0.55) });
  }

  // ---- ITS ABDOMEN: eight segments, each ringed by its fringe; grey tufts along its sides; a tuft at its tip ----
  G.ab.forEach((c, i) => {
    const dir = G.abDir[i];
    const r = AB_R[i];
    const side = norm(cross(dir, Dd), L);
    const up = norm(cross(side, dir), Dd);
    const ax: [V3, V3, V3] = [mul(dir, AB_SEG * 0.86), mul(side, r), mul(up, r * 0.9)];
    put('abdomen', `seg${i}`, {
      k: 'ball', c, ax, skin: (u, tone) => {
        if (cr > 0 && hash(Math.round(u[0] * 6) + i * 13, Math.round(u[1] * 6) + 31 * Math.round(u[2] * 6), 9701) < cr * 1.2 - 0.12) return null;
        // (its back darker, its belly paler; its rear edge's fringe pale grey, the joint before it dark)
              const fleck = hash(Math.round(u[1] * 10) + i * 7, Math.round(u[2] * 10) + Math.round(u[0] * 4) * 11, 9702);
        if (u[0] > 0.6 && u[0] < 0.78 && fleck > 0.3) return FUR_PALE[T(tone - 1)];
        if (u[0] > 0.78) return FUR[T(tone - 2)];
        return (u[2] < -0.45 ? FUR_PALE : FUR)[T(tone + (fleck < 0.2 ? -1 : 0))];
      },
    });
    // side tufts, out and back, grey
    for (const sd of [1, -1]) {
      if (i > 6 || gone(300 + i * 4 + (sd > 0 ? 1 : 0))) continue;
      const at = add(c, add(mul(side, sd * r * 0.88), mul(dir, AB_SEG * 0.35)));
      put('abdomen', 'abtuft', { k: 'rod', a: at, b: add(at, add(mul(side, sd * 4), add(mul(dir, 9), mul(up, -2)))), ra: 2.4, rb: 0.6, ramp: FUR });
    }
  });
  for (let k = 0; k < 9; k++) {
    if (gone(340 + k)) continue;
    const a = (k / 9) * Math.PI * 2;
    const last = G.ab[G.ab.length - 1];
    const dir = G.abDir[G.abDir.length - 1];
    const side = norm(cross(dir, Dd), L);
    const up = norm(cross(side, dir), Dd);
    const at = add(last, mul(dir, AB_SEG * 0.35));
    const b = add(at, add(mul(dir, 20 + 5 * hash(k, 1, 9603)), add(mul(side, Math.cos(a) * 8), mul(up, Math.sin(a) * 7))));
    put('abdomen', 'tip', { k: 'rod', a: at, b, ra: 3.0, rb: 0.6, ramp: k % 2 ? FUR : FUR_PALE });
  }

  // ---- ITS HEAD: set low, furred; two great compound eyes of black glass; shaggy palps; its coiled tongue; and as it
  // screams, its mouth ----
  const hAx: [V3, V3, V3] = [mul(hF, HEAD[0]), mul(hL, HEAD[1]), mul(hU, HEAD[2])];
  put('head', 'head', { k: 'ball', c: HC, ax: hAx, skin: furSkin(FUR, 21, cr, FUR_PALE, (u) => u[0] > 0.72 && u[2] > -0.1) });
  // (the tuft of its brow, between its eyes)
  for (let k = 0; k < 7; k++) {
    if (gone(380 + k)) continue;
    const at = add(HC, add(mul(hF, HEAD[0] * 0.8), add(mul(hU, HEAD[2] * (0.1 + 0.08 * k)), mul(hL, (k - 3) * 2.5))));
    put('head', 'brow', { k: 'rod', a: at, b: add(at, add(mul(hF, 7), add(mul(hU, 4), mul(hL, (k - 3) * 1.6)))), ra: 3.2, rb: 1.2, ramp: k === 3 ? FUR_PALE : FUR });
  }
  for (const side of [1, -1] as const) {
    const c = add(HC, add(mul(hL, side * 19), add(mul(hF, 5), mul(hU, 3))));
    const ax: [V3, V3, V3] = [mul(hF, 14.5), mul(mul(hL, side), 12.5), mul(hU, 15.5)];
    put('head', `compound${side}`, { k: 'ball', c, ax, skin: compoundSkin(norm(toBall(ax, st.eye)), lit, cr) });
  }
  // palps: shaggy, forward and down; spread wide as it screams
  for (const side of [1, -1] as const) {
    if (gone(400 + side)) continue;
    const root = add(HC, add(mul(hF, HEAD[0] * 0.72), add(mul(hU, -HEAD[2] * 0.42), mul(hL, side * 8))));
    const dir = norm(add(mul(hF, 0.85 - 0.3 * P.scream), add(mul(hU, -0.5 + 0.8 * P.scream), mul(hL, side * (0.14 + 1.2 * P.scream)))));
    const mid = add(root, mul(dir, 13));
    const end = add(mid, mul(norm(add(dir, mul(hU, 0.35))), 12));
    put('head', 'palp', { k: 'rod', a: root, b: mid, ra: 6.5, rb: 5.6, ramp: FUR });
    put('head', 'palp', { k: 'rod', a: mid, b: end, ra: 5.6, rb: 3.4, ramp: FUR });
    for (let k = 0; k < 4; k++) {
      const at = lerp3(root, end, 0.2 + 0.22 * k);
      put('head', 'palp', { k: 'rod', a: at, b: add(at, add(mul(dir, 4), mul(hU, -5 + 2 * k))), ra: 2.6, rb: 1.0, ramp: FUR });
    }
  }
  // its tongue: coiled under its head; as it screams, uncoiled and lashing
  if (!gone(410)) {
    const coilC = add(HC, add(mul(hF, 15), mul(hU, -17)));
    const pts: V3[] = [];
    for (let k = 0; k <= 22; k++) {
      const u = k / 22;
      const ang = u * Math.PI * 2 * 1.8;
      const r = 9 * (1 - 0.75 * u);
      const coiled = add(coilC, add(mul(hF, Math.cos(ang) * r), mul(hU, -Math.sin(ang) * r)));
      const lash = add(add(HC, add(mul(hF, 18), mul(hU, -10))), add(mul(hF, 58 * u), add(mul(hU, -22 * u * u + 6 * Math.sin(u * 7 + m.t * 9) * u), mul(hL, 7 * Math.sin(u * 5 + m.t * 7) * u))));
      pts.push(lerp3(coiled, lash, sm(P.scream * 1.4 - 0.2)));
    }
    for (let k = 1; k < pts.length; k++) put('head', 'tongue', { k: 'rod', a: pts[k - 1], b: pts[k], ra: 1.9 - 0.04 * k, rb: 1.9 - 0.04 * (k + 1), ramp: HORN });
  }
  // its mouth, as it screams: its face split between the palps, dark, the Hush's dull pink deep in it
  if (P.scream > 0.08) {
    const c = add(HC, add(mul(hF, HEAD[0] * 0.84), mul(hU, -7)));
    const ax: [V3, V3, V3] = [mul(hF, 6 + 3 * P.scream), mul(hL, 3 + 12 * P.scream), mul(hU, 2 + 15 * P.scream)];
    put('head', 'mouth', {
      k: 'ball', c, ax, skin: (u, tone) => {
        const r = Math.hypot(u[1], u[2]);
        if (lit > 0.3 && r < 0.3 && P.scream > 0.5) return FLAME[0];
        return MAW[Math.max(0, Math.min(4, tone - 1))];
      },
    });
  }
  // its antennae: great feathers, combed on both sides, each tooth combed again
  G.ant.forEach((pts, ai) => {
    const side = ai === 0 ? 1 : -1;
    for (let k = 1; k < pts.length; k++) {
      if (gone(500 + ai * 30 + k) || (cr > 0 && k > pts.length * (1 - cr))) continue;
      put('head', 'shaft', { k: 'rod', a: pts[k - 1], b: pts[k], ra: 2.6 - 0.1 * k, rb: 2.6 - 0.1 * (k + 1), ramp: ANT });
      if (k < 2 || k > pts.length - 1) continue;
      const dir = norm(sub(pts[k], pts[k - 1]));
      const flat = norm(cross(dir, hF), mul(hL, side));
      const long = 28 * Math.sin(Math.PI * Math.pow((k - 1) / (pts.length - 1), 0.7));
      for (const sd of [1, -1]) {
        for (const half of [0.25, 0.75]) {
          const at = lerp3(pts[k - 1], pts[k], half);
          const b = add(at, add(mul(flat, sd * long * 0.8), add(mul(dir, long * 0.5), mul(hU, -long * 0.08))));
          put('head', 'comb', { k: 'rod', a: at, b, ra: 1.0, rb: 0.5, ramp: ANT });
        }
      }
    }
  });

  // ---- ITS LEGS: a furred femur, a spurred tibia, a tarsus of five joints, a hooked claw ----
  G.legs.forEach((lg, i) => {
    const side = i < 3 ? 1 : -1;
    const part = `legs${side === 1 ? 'L' : 'R'}`;
    if (gone(600 + i)) return;
    put(part, 'femur', { k: 'rod', a: lg.coxa, b: lg.knee, ra: 7.5, rb: 5.2, ramp: FUR, far: true });
    put(part, 'knee', { k: 'ball', c: lg.knee, ax: [[5.2, 0, 0], [0, 5.2, 0], [0, 0, 5.2]], skin: FUR, far: true });
    // (the femur's fringe of long hair, below it)
    const fd = norm(sub(lg.knee, lg.coxa));
    const hang = norm(sub([0, 0, -1], mul(fd, -fd[2])), V);
    for (let k = 1; k <= 4; k++) {
      const at = lerp3(lg.coxa, lg.knee, k / 5);
      put(part, 'fringe', { k: 'rod', a: at, b: add(at, add(mul(hang, 11), mul(fd, -4))), ra: 2.6, rb: 0.7, ramp: FUR_PALE, far: true });
    }
    put(part, 'tibia', { k: 'rod', a: lg.knee, b: lg.ankle, ra: 4.6, rb: 3.2, ramp: HORN, far: true });
    // (the spurs at the tibia's foot)
    const td = norm(sub(lg.ankle, lg.knee));
    const spur = norm(cross(td, L), V);
    put(part, 'spur', { k: 'rod', a: lerp3(lg.knee, lg.ankle, 0.82), b: add(lerp3(lg.knee, lg.ankle, 0.82), add(mul(spur, 9), mul(td, 7))), ra: 1.6, rb: 0.5, ramp: HORN, far: true });
    put(part, 'spur', { k: 'rod', a: lerp3(lg.knee, lg.ankle, 0.82), b: add(lerp3(lg.knee, lg.ankle, 0.82), add(mul(spur, -8), mul(td, 7))), ra: 1.6, rb: 0.5, ramp: HORN, far: true });
    for (let k = 1; k < lg.tarsus.length; k++) {
      const a = lg.tarsus[k - 1];
      const b = lg.tarsus[k];
      put(part, 'tarsus', { k: 'rod', a, b, ra: 3.0 - 0.32 * k, rb: 2.7 - 0.32 * k, ramp: HORN, far: true });
    }
    // its claw: two hooks
    const tip = lg.tarsus[lg.tarsus.length - 1];
    const last = norm(sub(tip, lg.tarsus[lg.tarsus.length - 2]));
    const cs = norm(cross(last, [0, 0, 1]), L);
    // (down on the stones, they lie along them gripping; in the air, hooked down)
    const down = tip[2] < 3 ? 0 : -2;
    for (const sd of [1, -1]) {
      const b = add(tip, add(mul(last, 4), add(mul(cs, sd * 2.5), [0, 0, down])));
      // (never into the stones)
      put(part, 'claw', { k: 'rod', a: tip, b: [b[0], b[1], Math.max(1, b[2])], ra: 1.2, rb: 0.4, ramp: HORN, far: true });
    }
  });

  // THE SMEAR of a lightning strike: its after-images, pale, the oldest thinned to every other point
  const smr = say.smear?.(m);
  if (smr) {
    smr.forEach((line, j) => {
      const k = j / Math.max(1, smr.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.5));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? MOTH_SMEAR[2] : k > 0.35 ? MOTH_SMEAR[1] : MOTH_SMEAR[0], size: k > 0.7 ? 2 : 1 });
        }
      }
    });
  }
  // (and while the eyes burn, their light: the enemy's own)
  if (P.eyes > 1 && lit > 0.5) for (const w of G.wings) put('glow', 'glow', { k: 'glow', p: eyeOf(w), c: FLAME[2], r: w.hind ? 70 : 50, a: 0.12 * Math.min(1, (P.eyes - 1) * 4) });
  return bits;
}

/** ITS GRAINS (laid after its edge): what its move says (its dust, its swarm, its words). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
/** THE MOTH AS THE PAINTER TAKES IT. */
export function mothPainter(say: MothSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return {
    bits: (st, m) => {
      GRAINS.set(m, say.more?.(m) ?? []);
      return mothBits(st, m, say);
    },
    grains: (_st, m) => GRAINS.get(m) ?? [],
  };
}

// =============================================================================================
// ITS WINGS' SPAN, AS THE TESTS MEASURE IT

/** Its span from tip to tip across the top (tiles), its wings as they are. */
export function spanOf(G: MothGeom): number {
  let best = 0;
  for (const a of G.wings) for (const b of G.wings) {
    if (a.side === b.side) continue;
    for (const [x, y] of wingRim(a.hind, 24)) for (const [x2, y2] of wingRim(b.hind, 24)) {
      const p = onWing(a, x * a.len, y * a.len);
      const q = onWing(b, x2 * b.len, y2 * b.len);
      best = Math.max(best, Math.hypot(p[0] - q[0], p[1] - q[1]));
    }
  }
  return best / TILE3;
}
