// FLOOR 7'S BOSS, THE CARRION QUEEN, MADE NEW (16 Oct). His words, 08:58: “I need the carrion queen completely
// redone.  Its whole look is awful.  It’s too fat, too slow, the wings are terrible.  It’s just bad”. Read as (told him
// so): started over from nothing, her look and every move: lean and gaunt, a long snaking neck and long legs, not a
// round fat body; fast and vicious, not slow and heavy; real wings, built as a bird's, huge and feathered, folding
// and opening as wings do, not flat slabs.
//
// His picks for her, one pop-up, by 09:02: her body, “Gaunt vulture, long bare neck (Recommended)”, offered as: lean
// and bony, a narrow keel of a chest, a long snaking raw neck, long legs and big hooked talons, still huge; her wings,
// “Huge, real vulture wings (Recommended)”, offered as: built like a real bird's, wider than the trail: rows of
// layered feathers, long fingered tips spread like hands, folding and opening properly; how she moves, “Fast and
// vicious (Recommended)”, offered as: darting, snapping, quick hops and lunges, wings flaring, never still, never
// slow; her colours, “Keep them (Recommended)”: black-violet feathers, raw red head, the bone crown burning pink and
// gold.
//
// Her brief stands where he has not changed it (13 Oct): huge, her wings wider than the trail; the one thing to know
// her by her bone crown and the cult's chains (the crown round the root of her neck, the cult's shackle and broken
// chain on her left leg, the cult's mark burning on her breast); her sound a shrieking screech and beating wings; never
// like a phoenix or an eagle: ugly, a carrion eater; her death, his pick, off the edge.
//
// Not on the heroes' bones: her own solids, frame by frame, her own skeleton of a bird. Her wings are built as a
// bird's: an arm, a forearm and a hand, each covered over; ten long primaries off her hand, the outer six fingered;
// fourteen secondaries off her forearm; her tertials; rows of coverts over them, greater, middle and lesser; her alula.
// Each feather its own shape, so that they fan, fold and part.
//
// Behind her switch, off: nothing of the game imports this file. The old Queen (art/carrion_queen.ts) stays as it
// was until he has said yes to this one.

import type { Sprite } from '../engine/px';
import { shriekAt } from './floor5';
import { hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, PanelSkin, Put, Shape } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, cross, dot, len, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const QUEEN2_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const sm = (v: number): number => {
  const k = cl01(v);
  return k * k * (3 - 2 * k);
};
const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
const D = Math.PI / 180;
const TAU = Math.PI * 2;
const UP: V3 = [0, 0, 1];
/** How far over the rock what lies on it is kept (her own lengths). */
const FLOOR_GAP = 0.6;
/** Whether there is rock under her as she is being built (none as she falls into the drop). */
let ROCK = true;

// ---------------------------------------------------------------------------------------------
// HER COLOURS (kept, his pick): black with a violet sheen, a raw red head and neck, her bone crown burning

/** Her plumage: black, a violet sheen where the light lies along it. */
export const PLUMAGE: Ramp = ['#08060c', '#08060c', '#171122', '#2a1d44', '#4a3384'];
/** Her flight feathers from above: black, worn, their edges catching the violet. */
export const QUILLS: Ramp = ['#060409', '#060409', '#110d1a', '#1f1733', '#34285c'];
/** Her wings' coverts from above: black, only a little violet where the light lies along them. */
const COVERTS: Ramp = ['#08060c', '#08060c', '#130e1e', '#201835', '#332858'];
/** Her wings' bones, under their small feathers: black, no sheen. */
const WINGBONE: Ramp = ['#060409', '#060409', '#0e0a16', '#181226', '#221a36'];
/** Her flight feathers from below: a dull silver-grey, as a vulture's are. */
export const UNDER: Ramp = ['#1a1720', '#1a1720', '#332d3e', '#4c4457', '#685f74'];
/** Her crown: bone-white spikes round the root of her neck. */
export const CROWN: Ramp = ['#5a4e48', '#5a4e48', '#b0a492', '#d8cdb9', '#ece4d4'];
/** Her bare head and neck: raw, wrinkled red skin (a deep crimson, never the cult's pink). */
export const BARE: Ramp = ['#3a0b12', '#3a0b12', '#8c1d2a', '#b9323c', '#dc5656'];
/** Her shanks and toes: dark grey, scaled. */
export const SCALES: Ramp = ['#1c1824', '#1c1824', '#4c4458', '#6c6278', '#8c8298'];
/** Her talons and the tip of her beak: near black, glossy. */
export const TALON: Ramp = ['#0e0c12', '#0e0c12', '#2a2632', '#48424e', '#6a6470'];
/** Her beak: pale yellowed horn. */
export const BEAK: Ramp = ['#3a3226', '#3a3226', '#8f8164', '#b8a882', '#d6c9a4'];
/** The cult's shackle and chain: old iron. */
const IRON: Ramp = ['#16141a', '#16141a', '#3a3640', '#5c5864', '#86828e'];

// ---------------------------------------------------------------------------------------------
// HER MEASURES, in the figure's own lengths (the knight is 58 tall)

/** Her canvas, and where her feet are on it (her floor point, between her feet). */
export const Q2_CANVAS = { w: 1000, h: 1200, ax: 500, ay: 720 } as const;
/** Her body: its half-lengths (forward, across, up); her breast's. Lean: a narrow keel. */
const TORSO: V3 = [40, 18, 22];
const BREAST: V3 = [24, 15, 20];
/** Her legs: the feathered shank (hip to her backward-bent joint), the bare scaled one (to her foot). */
const TIB = 50;
const TAR = 40;
/** Her wings' bones: arm, forearm, hand. */
const HUM = 58;
const FORE = 74;
const HAND = 48;
/** Her ten primaries, inner to outer: how long, how broad. */
const PRIM_L = [74, 80, 86, 92, 98, 104, 108, 106, 100, 90];
const PRIM_W = [13, 13, 12.5, 12, 11, 10, 9, 8.5, 8, 7.5];
/** Her neck's length (as it runs, snaking); her head's half-lengths (forward, across, up). */
const HEAD: V3 = [12, 7.6, 8.4];

// ---------------------------------------------------------------------------------------------
// HER POSE

/**
 * A wing's pose, as she holds it (level, whatever her body's pitch): the ways its three bones run (her arm, forearm and
 * hand), each [forward, out from her side, up]; the way the top of the wing looks along her arm and forearm, and along
 * her hand; how far its feathers are opened out from her arm and forearm (0 folded back along them, 1 spread), and from
 * her hand (0 folded, 1 fanned wide, her fingers parted).
 */
export interface WingPose {
  arm: V3;
  fore: V3;
  hand: V3;
  top: V3;
  tipTop: V3;
  open: number;
  fan: number;
}
/**
 * Her pose: the middle of her body, and how it is turned (degrees: pitched up, turned to her left, rolled); her head's
 * middle and the way it faces, her beak open; her two wings (left, right); her two feet where they are (the root of
 * her toes) and her talons clenched (0 open, 1 clenched); her tail fanned; how hot her crown and mark burn; whether
 * her fire is lit (1) or out (0); her feathers raised (her rouse).
 */
export interface QueenPose {
  body: V3;
  pitch: number;
  yaw: number;
  roll: number;
  head: V3;
  look: V3;
  gape: number;
  wings: [WingPose, WingPose];
  feet: [V3, V3];
  grasp: [number, number];
  tail: number;
  heat: number;
  lit: number;
  ruffle: number;
  /** How far the frame her wings are held in is pitched nose down (less than 0) or up, as in her stoop (degrees; none: level). */
  wingPitch?: number;
  /** Over the drop, with no rock under her (her fall off the edge): nothing of her is laid along the rock. */
  drop?: boolean;
}

/** Her body's frame: forward, her left, up. */
function frameOf(P: QueenPose): [V3, V3, V3] {
  const p = P.pitch * D;
  const y = P.yaw * D;
  const r = P.roll * D;
  const f: V3 = [Math.cos(p) * Math.cos(y), Math.cos(p) * Math.sin(y), Math.sin(p)];
  const l0: V3 = [-Math.sin(y), Math.cos(y), 0];
  const u0 = cross(f, l0);
  const l = add(mul(l0, Math.cos(r)), mul(u0, Math.sin(r)));
  return [f, l, cross(f, l)];
}

/** Where a point of her body's frame is (forward, left, up from the middle of her body). */
function at(P: QueenPose, fr3: [V3, V3, V3], a: number, b: number, c: number): V3 {
  return add(P.body, add(mul(fr3[0], a), add(mul(fr3[1], b), mul(fr3[2], c))));
}

/** A bird's leg: from her hip down to its backward-bent joint, then down to her foot. Where that joint is. */
function jointOf(hip: V3, foot: V3, fwd: V3): V3 {
  const d = sub(foot, hip);
  const L = Math.min(len(d), TIB + TAR - 0.5);
  const dir = norm(d, [0, 0, -1]);
  const along = (TIB * TIB - TAR * TAR + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, TIB * TIB - along * along));
  const backRaw = mul(fwd, -1);
  const back = norm(sub(backRaw, mul(dir, dot(backRaw, dir))), [-1, 0, 0]);
  return add(add(hip, mul(dir, along)), mul(back, h));
}

/** A Bezier curve's points. */
function bez(a: V3, b: V3, c: V3, d: V3, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const m = 1 - s;
    out.push(add(add(mul(a, m * m * m), mul(b, 3 * m * m * s)), add(mul(c, 3 * m * s * s), mul(d, s * s * s))));
  }
  return out;
}

/** A vector turned `deg` degrees about an axis. */
function turn(v: V3, axis: V3, deg: number): V3 {
  const k = norm(axis);
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

// ---------------------------------------------------------------------------------------------
// HER WINGS

/** A wing's bones, side `sd` (1 her left, -1 her right): her shoulder, elbow, wrist and the tip of her hand; each bone's way; the way its feathers trail; its upper face. */
export interface WingBones {
  sh: V3;
  el: V3;
  wr: V3;
  tip: V3;
  hum: V3;
  fore: V3;
  hand: V3;
  trail: [V3, V3, V3];
  face: [V3, V3, V3];
}
export function wingBones(P: QueenPose, sd: 1 | -1): WingBones {
  const W = P.wings[sd === 1 ? 0 : 1];
  const F3 = frameOf(P);
  // (her wings are held as she holds them, whatever her body's pitch: in the frame of the way she faces, level)
  const f0 = norm([F3[0][0], F3[0][1], 0], [1, 0, 0]);
  const ls: V3 = [-f0[1] * sd, f0[0] * sd, 0];
  const wp = (P.wingPitch ?? 0) * D;
  const f = add(mul(f0, Math.cos(wp)), mul(UP, Math.sin(wp)));
  const uw = sub(mul(UP, Math.cos(wp)), mul(f0, Math.sin(wp)));
  const g = (v: V3): V3 => norm(add(add(mul(f, v[0]), mul(ls, v[1])), mul(uw, v[2])));
  const sh = at(P, F3, 14, 12 * sd, 12);
  const hum = g(W.arm);
  const el = add(sh, mul(hum, HUM));
  let fore = g(W.fore);
  // (her wrist and the tip of her hand never under the rock: a bone that would go there is turned up along it)
  const keep = (from: V3, d: V3, L: number, low: number): V3 => {
    if (P.drop || from[2] + d[2] * L >= low || from[2] <= low) return d;
    const z = (low - from[2]) / L;
    const hz = Math.hypot(d[0], d[1]) || 1;
    const k = Math.sqrt(Math.max(0, 1 - z * z)) / hz;
    return [d[0] * k, d[1] * k, z];
  };
  fore = keep(el, fore, FORE, 7);
  const wr = add(el, mul(fore, FORE));
  const hand = keep(wr, g(W.hand), HAND, 5);
  const tip = add(wr, mul(hand, HAND));
  // (each bone's upper face, square to it; the way its feathers trail, square to both)
  const faceOf = (b: V3, t: V3): V3 => norm(sub(t, mul(b, dot(t, b))), UP);
  const face: [V3, V3, V3] = [faceOf(hum, g(W.top)), faceOf(fore, g(W.top)), faceOf(hand, g(W.tipTop))];
  const bones = [hum, fore, hand];
  const trail = face.map((n, i) => norm(mul(cross(n, bones[i]), sd))) as [V3, V3, V3];
  return { sh, el, wr, tip, hum, fore, hand, trail, face };
}

/** The shape of a feather (half its breadth, `s` from its root 0 to its tip 1): a primary fingered toward its tip, a secondary broad and square-tipped, a covert short and rounded. */
type Kind = 'primary' | 'finger' | 'secondary' | 'covert' | 'tail' | 'hackle';
function halfBreadth(kind: Kind, s: number, w: number): number {
  const round = (from: number): number => (s > from ? Math.sqrt(Math.max(0, (1 - s) / (1 - from))) : 1);
  switch (kind) {
    case 'finger':
      return (w / 2) * (s < 0.4 ? 1 : 1 - 0.5 * ((s - 0.4) / 0.6)) * round(0.86);
    case 'primary':
      return (w / 2) * round(0.82);
    case 'secondary':
      return (w / 2) * round(0.9);
    case 'tail':
      return (w / 2) * round(0.85);
    case 'hackle':
      return (w / 2) * (1 - s * 0.9);
    default:
      return (w / 2) * round(0.55);
  }
}
/** One feather, a flat blade: its root, the way it lies, its upper face; how long and broad; its kind; whether it is a flight feather (silver under). */
function feather(put: Put, part: string, name: string, root0: V3, along: V3, face: V3, L: number, W: number, kind: Kind, seed: number, flight: boolean): void {
  let root = root0;
  let a = norm(along);
  let across = norm(cross(face, a), [0, 1, 0]);
  // (a feather that would reach under the rock lies along it instead, its tip dragged on the rock; its root kept over it)
  const rootLow = FLOOR_GAP + (Math.abs(across[2]) * W) / 2;
  if (ROCK && root[2] > 0 && root[2] < rootLow) root = [root[0], root[1], rootLow];
  const need = (FLOOR_GAP - root[2] + (Math.abs(across[2]) * W) / 2) / L;
  if (ROCK && root[2] > FLOOR_GAP && a[2] < need) {
    const z = Math.min(0.95, need);
    const hz = Math.hypot(a[0], a[1]) || 1;
    const k = Math.sqrt(1 - z * z) / hz;
    a = [a[0] * k, a[1] * k, z];
    across = norm(cross(face, a), [0, 1, 0]);
  }
  const top = flight ? QUILLS : kind === 'covert' ? COVERTS : PLUMAGE;
  const jit = hash(seed, 3, 7103) > 0.72 ? 1 : hash(seed, 3, 7103) < 0.22 ? -1 : 0;
  const skin: PanelSkin = (x, y, front, tone) => {
    const s = (x + L / 2) / L;
    const hw = halfBreadth(kind, s, W);
    if (Math.abs(y) > hw) return null;
    // (ragged: a carrion eater's worn feathers, notched at their tips)
    if (s > 0.8 && hash(seed, Math.floor(y * 1.3 + 9), 7101) > 0.78) return null;
    const ramp = front ? top : flight ? UNDER : PLUMAGE;
    // (each feather a little lighter or darker than the next, so that they read one by one)
    tone = Math.max(1, Math.min(4, tone + jit));
    // its edges: dark where it lies over the next (so the feathers part), its leading edge catching the light
    if (hw - Math.abs(y) < 0.9) {
      // (a small feather's rounded tip catches the light along its edge on top, so its row reads as a row of scallops)
      if (front && kind === 'covert' && s > 0.6) return ramp[Math.min(4, tone + 1)];
      return y > 0 && front ? ramp[Math.min(4, tone + 1)] : ramp[Math.max(0, tone - 2)];
    }
    // its shaft, faint, on a flight feather
    if (flight && Math.abs(y + 0.15 * hw) < 0.45 && s < 0.9) return ramp[Math.max(0, tone - 1)];
    return ramp[tone];
  };
  // (and whatever is still under it, lifted clear)
  const low = Math.min(root[2], root[2] + a[2] * L) - (Math.abs(across[2]) * W) / 2;
  if (ROCK && root0[2] > 0 && low < FLOOR_GAP) root = [root[0], root[1], root[2] + FLOOR_GAP - low];
  put(part, name, { k: 'panel', c: add(root, mul(a, L / 2)), u: mul(a, L / 2), v: mul(across, W / 2), skin });
}

/** A whole wing as solids: its bones, covered; its primaries, secondaries and tertials; its coverts in rows over them; its alula. */
function wingBits(P: QueenPose, sd: 1 | -1, put: Put): void {
  const W = P.wings[sd === 1 ? 0 : 1];
  const B = wingBones(P, sd);
  const part = sd === 1 ? 'wingL' : 'wingR';
  const s = cl01(W.open);
  const sHand = cl01(W.fan);
  // its bones, covered in small feathers: a thick leading edge
  put(part, 'hum', { k: 'rod', a: B.sh, b: B.el, ra: 7.5, rb: 5.5, ramp: WINGBONE });
  put(part, 'fore', { k: 'rod', a: B.el, b: B.wr, ra: 5.5, rb: 4.2, ramp: WINGBONE });
  put(part, 'hand', { k: 'rod', a: B.wr, b: B.tip, ra: 4.2, rb: 2.2, ramp: WINGBONE });
  const [nH, nF, nP] = B.face;
  const [tH, tF, tP] = B.trail;
  // HER PRIMARIES off her hand: fanned when spread, the outer six fingered and parted, lying back along her hand when folded
  for (let k = 0; k < 10; k++) {
    const q = 0.06 + 0.94 * (k / 9);
    const root = add(lerp3(B.wr, B.tip, q), mul(nP, 0.18 * k));
    const aOpen = -2 + 83 * Math.pow(k / 9, 1.15);
    const ang = mix(87, aOpen, sHand) * D;
    let dir = add(mul(tP, Math.cos(ang)), mul(B.hand, Math.sin(ang)));
    // (her fingers curl up at their ends as she spreads them)
    if (k >= 4) dir = add(dir, mul(nP, 0.1 * (k - 3) * sHand));
    feather(put, part, `p${k}`, root, dir, nP, PRIM_L[k], PRIM_W[k], k >= 4 ? 'finger' : 'primary', k * 7 + (sd === 1 ? 0 : 50), true);
  }
  // HER SECONDARIES off her forearm, broad, square-tipped, a little splayed
  for (let j = 0; j < 14; j++) {
    const q = 0.03 + 0.95 * (j / 13);
    const root = add(lerp3(B.wr, B.el, q), mul(nF, -0.12 * j - 0.4));
    const ang = mix(-86, -3 - 12 * (j / 13), s) * D;
    const dir = add(mul(tF, Math.cos(ang)), mul(B.fore, Math.sin(ang)));
    feather(put, part, `s${j}`, root, dir, nF, (70 + 8 * Math.sin((Math.PI * j) / 13)) * (0.93 + 0.12 * hash(j, sd, 7105)), 15, 'secondary', 100 + j * 5 + (sd === 1 ? 0 : 50), true);
  }
  // her tertials off the end of her arm
  for (let q = 0; q < 4; q++) {
    const root = add(lerp3(B.el, B.sh, 0.08 + 0.22 * q), mul(nH, -0.2 * q - 2));
    const ang = mix(78, -22 - 8 * q, s) * D;
    const dir = add(mul(tH, Math.cos(ang)), mul(B.hum, Math.sin(ang)));
    feather(put, part, `t${q}`, root, dir, nH, 60 - 6 * q, 15, 'secondary', 200 + q * 3 + (sd === 1 ? 0 : 50), true);
  }
  // HER COVERTS, row over row: the greater over her flight feathers' roots, then the middle, then the small ones along her leading edge
  for (let j = 0; j < 14; j++) {
    const q = 0.04 + 0.92 * (j / 13);
    const base = lerp3(B.wr, B.el, q);
    const ang = mix(-80, -6 - 10 * (j / 13), s) * D;
    const dir = add(mul(tF, Math.cos(ang)), mul(B.fore, Math.sin(ang)));
    const bow = Math.sin(Math.PI * q);
    feather(put, part, `gc${j}`, add(add(base, mul(tF, -2.5)), mul(nF, 2.4)), dir, nF, 28 + 9 * bow, 14, 'covert', 300 + j + (sd === 1 ? 0 : 50), false);
    feather(put, part, `mc${j}`, add(add(base, mul(tF, -5.5)), mul(nF, 3.8)), dir, nF, 15 + 6 * bow, 12, 'covert', 330 + j + (sd === 1 ? 0 : 50), false);
    if (j % 2 === 0) feather(put, part, `lc${j}`, add(add(base, mul(tF, -7.5)), mul(nF, 5.0)), dir, nF, 10 + 4 * bow, 11, 'covert', 360 + j + (sd === 1 ? 0 : 50), false);
  }
  for (let k = 0; k < 10; k++) {
    const q = 0.06 + 0.9 * (k / 9);
    const base = lerp3(B.wr, B.tip, q);
    const aOpen = 6 + 60 * Math.pow(k / 9, 1.15);
    const ang = mix(85, aOpen, sHand) * D;
    const dir = add(mul(tP, Math.cos(ang)), mul(B.hand, Math.sin(ang)));
    feather(put, part, `pc${k}`, add(add(base, mul(tP, -2)), mul(nP, 2.6)), dir, nP, 34 - 1.2 * k, 12, 'covert', 400 + k, false);
  }
  for (let q = 0; q < 6; q++) {
    const base = lerp3(B.el, B.sh, 0.1 + 0.15 * q);
    const ang = mix(70, -20, s) * D;
    const dir = add(mul(tH, Math.cos(ang)), mul(B.hum, Math.sin(ang)));
    feather(put, part, `hc${q}`, add(add(base, mul(tH, -3)), mul(nH, 3.5)), dir, nH, 24, 14, 'covert', 450 + q, false);
  }
  // her alula, at her wrist, pointing out along her leading edge
  for (let a = 0; a < 3; a++) {
    const dir = norm(add(mul(B.hand, 0.85), mul(tP, -0.25 + 0.12 * a)));
    feather(put, part, `al${a}`, add(B.wr, mul(nP, 4.2 + 0.3 * a)), dir, nP, 18 - 3 * a, 7, 'covert', 480 + a, false);
  }
  // HER UNDERWING: rows of small black feathers lining it beneath, along her forearm and arm (black against the grey of her flight feathers below)
  const under = (v: V3): V3 => mul(v, -1);
  for (let j = 0; j < 12; j++) {
    const q = 0.04 + 0.92 * (j / 11);
    const base = lerp3(B.wr, B.el, q);
    const ang = mix(-80, -8 - 8 * (j / 11), s) * D;
    const dir = add(mul(tF, Math.cos(ang)), mul(B.fore, Math.sin(ang)));
    feather(put, part, `uc${j}`, add(add(base, mul(tF, -3)), mul(nF, -2.6)), dir, under(nF), 32, 14, 'covert', 500 + j + (sd === 1 ? 0 : 50), false);
    feather(put, part, `um${j}`, add(add(base, mul(tF, -5.5)), mul(nF, -3.6)), dir, under(nF), 19, 12, 'covert', 530 + j + (sd === 1 ? 0 : 50), false);
  }
  for (let q = 0; q < 5; q++) {
    const base = lerp3(B.el, B.sh, 0.1 + 0.18 * q);
    const ang = mix(70, -20, s) * D;
    const dir = add(mul(tH, Math.cos(ang)), mul(B.hum, Math.sin(ang)));
    feather(put, part, `uh${q}`, add(add(base, mul(tH, -3)), mul(nH, -3)), dir, under(nH), 28, 15, 'covert', 560 + q + (sd === 1 ? 0 : 50), false);
  }
  for (let k = 0; k < 8; k++) {
    const q = 0.06 + 0.9 * (k / 7);
    const base = lerp3(B.wr, B.tip, q);
    const ang = mix(85, 6 + 60 * Math.pow(k / 7, 1.15), sHand) * D;
    const dir = add(mul(tP, Math.cos(ang)), mul(B.hand, Math.sin(ang)));
    feather(put, part, `up${k}`, add(add(base, mul(tP, -2)), mul(nP, -2.4)), dir, under(nP), 26 - 1.2 * k, 11, 'covert', 580 + k + (sd === 1 ? 0 : 50), false);
  }
}

// ---------------------------------------------------------------------------------------------
// HER BODY, NECK, HEAD, LEGS, TAIL

/** Her body's feathers: small, shaggy, in rows of points, their tips paler where the light catches them. */
function bodySkin(seed: number, ruffle: number): (u: V3, tone: number, x: number, y: number) => string | null {
  return (u, tone, x, y) => {
    const row = Math.floor((u[0] + 1.2) * 7);
    const off = (row % 2) * 0.5;
    const col = (Math.atan2(u[2], u[1]) / TAU) * 22 + off;
    const inCell = fr(col);
    const v = fr((u[0] + 1.2) * 7);
    // (the tip of each feather: a rounded point, its edge dark)
    const tipEdge = Math.abs(inCell - 0.5) * 2 > 0.82 - v * 0.6;
    if (tipEdge) return PLUMAGE[Math.max(0, tone - 2)];
    if (v > 0.75 + 0.15 * ruffle && tone >= 3) return PLUMAGE[Math.min(4, tone)];
    return hash(Math.floor(x / 2), Math.floor(y / 2), seed) > 0.9 ? PLUMAGE[Math.min(4, tone + 1)] : PLUMAGE[Math.max(1, tone - 1)];
  };
}
/** Her bare skin: raw, wrinkled, warty. */
function bareSkin(seed: number, rings: number): (u: V3, tone: number, x: number, y: number) => string | null {
  return (u, tone, x, y) => {
    if (rings > 0 && fr(u[0] * rings + 0.3 * Math.sin(u[1] * 5 + seed)) < 0.14) return BARE[Math.max(1, tone - 1)];
    const blot = hash(Math.floor(x / 3), Math.floor(y / 3), 77);
    if (blot < 0.16) return BARE[Math.max(1, tone - 1)];
    if (hash(Math.floor(x / 2), Math.floor(y / 2), seed) > 0.88) return BARE[Math.min(4, tone + 1)];
    return BARE[tone];
  };
}

/** THE CARRION QUEEN AS SOLIDS. */
function queenBits(P: QueenPose, t: number, put: Put): void {
  ROCK = !P.drop;
  const F = frameOf(P);
  const [f, l, u] = F;
  const lit = cl01(P.lit);
  const heat = cl01(P.heat);
  // --- HER LEGS: her feathered shanks, bent back at her joint; her bare scaled feet; her talons ---
  for (const sd of [1, -1] as const) {
    const i = sd === 1 ? 0 : 1;
    const hip = at(P, F, -6, 11 * sd, -12);
    const foot = P.feet[i];
    const fwd = norm([f[0], f[1], 0], [1, 0, 0]);
    const joint = jointOf(hip, add(foot, [0, 0, 4]), fwd);
    const part = `leg${i}`;
    put(part, 'thigh', { k: 'rod', a: hip, b: lerp3(hip, joint, 0.82), ra: 11, rb: 6, ramp: PLUMAGE });
    // (shaggy feathers hanging off her thigh: her trousers)
    for (let k = 0; k < 6; k++) {
      const p = lerp3(hip, joint, 0.25 + 0.11 * k);
      const out = norm(add(mul(fwd, Math.cos(k * 1.7) * 0.8), mul(l, sd * (0.6 + 0.3 * Math.sin(k)))));
      feather(put, part, `tr${k}`, add(p, mul(out, 5)), add([0, 0, -1], mul(out, 0.35)), norm(cross(out, UP), l), 20, 10, 'hackle', 500 + k + i * 10, false);
    }
    put(part, 'tarsus', { k: 'rod', a: joint, b: add(foot, [0, 0, 4]), ra: 4.8, rb: 4.0, ramp: SCALES });
    put(part, 'heel', { k: 'ball', c: joint, ax: [[5.2, 0, 0], [0, 5.2, 0], [0, 0, 5.2]], skin: SCALES });
    // her toes: three forward, spread, one back; each with a great hooked talon, clenched as she grips
    const g = cl01(P.grasp[i]);
    const toes: [number, number][] = [[0, 26], [30, 21], [-30, 21], [180, 14]];
    toes.forEach(([deg, L], k) => {
      const d0 = turn(fwd, UP, deg + (k === 1 ? 4 * sd : k === 2 ? -4 * sd : 0));
      const base = add(foot, [0, 0, 3]);
      const end = add(base, add(mul(d0, L * (1 - 0.25 * g)), [0, 0, -0.6 + 1.5 * g]));
      put(part, `toe${k}`, { k: 'rod', a: base, b: end, ra: 2.8, rb: 2.2, ramp: SCALES });
      const curl = 0.3 + 0.7 * g;
      const t1 = add(end, add(mul(d0, 7 * (1 - 0.4 * curl)), [0, 0, 1.2 - 6 * curl]));
      put(part, `tal${k}`, { k: 'rod', a: end, b: [t1[0], t1[1], Math.max(0.6, t1[2])], ra: 2.0, rb: 0.5, ramp: TALON });
    });
    // THE CULT'S SHACKLE on her left leg, its chain broken and dragging
    if (sd === 1) {
      const sh0 = lerp3(joint, add(foot, [0, 0, 4]), 0.62);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU;
        const r = add(mul(norm(cross(sub(joint, foot), UP), [0, 1, 0]), Math.cos(a) * 5.2), [0, 0, Math.sin(a) * 1.6]);
        const rr = add(r, mul(fwd, Math.sin(a) * 5.2));
        put(part, `shk${k}`, { k: 'ball', c: add(sh0, rr), ax: [[1.9, 0, 0], [0, 1.9, 0], [0, 0, 1.9]], skin: IRON });
      }
      // (the chain: hanging from it, link by link, as far as the rock, then lying back along it; in the air, hanging)
      const pts: V3[] = [];
      let cur: V3 = sh0;
      for (let k = 0; k < 11; k++) {
        const sway = Math.sin(k * 0.9 + t * 7) * 0.9;
        if (!ROCK || cur[2] > 1.2 + 4.6) cur = add(cur, [-0.9 + sway * 0.4, 0.6 + sway * 0.3, -4.6]);
        else cur = [cur[0] - 4.8 + Math.sin(k + t * 2) * 0.5, cur[1] + 1.4 + Math.sin(k * 1.3) * 1.2, 1.2];
        pts.push(cur);
      }
      pts.forEach((p, k) => {
        const prev = k ? pts[k - 1] : sh0;
        const d = norm(sub(p, prev), [1, 0, 0]);
        const w = k % 2 ? norm(cross(d, UP), [0, 1, 0]) : UP;
        const ax: [V3, V3, V3] = [mul(d, 3.0), mul(w, 1.9), mul(norm(cross(d, w)), 0.9)];
        // (lying on the rock where it reaches it, never in it)
        const zr = Math.hypot(ax[0][2], ax[1][2], ax[2][2]);
        put(part, `ch${k}`, { k: 'ball', c: [p[0], p[1], Math.max(zr + 0.1, p[2])], ax, skin: IRON });
      });
    }
  }
  // --- HER TAIL: a short fan of black feathers ---
  const tailRoot = at(P, F, -36, 0, 2);
  for (let k = 0; k < 12; k++) {
    // (the middle ones on top; each a little apart from the next, ragged)
    const x = (k % 2 ? 1 : -1) * (Math.floor(k / 2) / 5);
    const dir = norm(turn(turn(mul(f, -1), u, x * (16 + 24 * cl01(P.tail))), l, -8));
    feather(put, 'tail', `tl${k}`, add(add(tailRoot, mul(l, x * 10)), mul(u, 1.5 - Math.abs(x) * 2)), dir, u, (58 - 10 * Math.abs(x)) * (0.92 + 0.12 * hash(k, 5, 7107)), 10, 'tail', 600 + k, true);
  }
  // --- HER BODY: lean, a narrow keel of a breast; shaggy ---
  put('body', 'torso', { k: 'ball', c: P.body, ax: [mul(f, TORSO[0]), mul(l, TORSO[1]), mul(u, TORSO[2])], skin: bodySkin(701, P.ruffle) });
  const breastC = at(P, F, 22, 0, -3);
  put('body', 'breast', { k: 'ball', c: breastC, ax: [mul(f, BREAST[0]), mul(l, BREAST[1]), mul(u, BREAST[2])], skin: bodySkin(702, P.ruffle) });
  // (ragged feathers hanging off her flanks and belly, lifting as she rouses)
  for (let k = 0; k < 14; k++) {
    const sd = k % 2 ? 1 : -1;
    const a = -26 + 6 * Math.floor(k / 2);
    const root = at(P, F, a, sd * (TORSO[1] - 2), -6 - 4 * Math.sin(k));
    const dir = norm(add(add(mul(u, -1), mul(f, -0.5)), mul(l, sd * (0.25 + 0.5 * P.ruffle))));
    feather(put, 'body', `hk${k}`, root, dir, mul(l, sd), 26 + 6 * Math.sin(k * 2.1), 11, 'hackle', 650 + k, false);
  }
  // THE CULT'S MARK on her breast, burning
  const mn = norm(add(f, mul(u, 0.05)));
  const sc = 1 / Math.hypot(dot(mn, f) / BREAST[0], dot(mn, l) / BREAST[1], dot(mn, u) / BREAST[2]);
  const mc = add(breastC, mul(mn, sc + 2.2));
  // (her crop: a bare patch of raw skin on her breast, the mark branded into it)
  put('body', 'crop', { k: 'ball', c: add(breastC, mul(mn, sc - 3.2)), ax: [mul(mn, 5), mul(l, 12), mul(norm(cross(mn, l)), 13)], skin: bareSkin(705, 0) });
  const mr = mul(l, -1);
  const mup = norm(cross(l, mn));
  const MW = 9;
  const MH = 10;
  put('mark', 'mark', {
    k: 'panel',
    c: mc,
    u: mul(mr, MW),
    v: mul(mup, MH),
    skin: (a, b, front) => {
      if (!front) return null;
      const mk = shriekAt(a / MW, b / MH);
      if (mk === 'dark') return PLUMAGE[0];
      if (mk !== 'bone') return null;
      // (gone out: a dark scar)
      if (lit < 0.3) return '#2a1018';
      const edge = shriekAt((a + 0.7) / MW, b / MH) !== 'bone' || shriekAt((a - 0.7) / MW, b / MH) !== 'bone';
      if (edge) return FLAME[2];
      return fr(b * 0.3 - t * 3 + hash(Math.floor(a), 1, 703) * 0.5) < 0.3 ? FLAME[4] : FLAME[3];
    },
  });
  if (lit > 0.05) put('glow', 'mark', { k: 'glow', p: add(mc, mul(mn, 8)), c: FLAME[2], r: 60 * (1 + 0.8 * heat), a: Math.min(0.75, (0.42 + 0.3 * heat) * lit) });
  // --- HER NECK: long, bare, raw, snaking up out of her crown to her head ---
  const N0 = at(P, F, 34, 0, 9);
  const L = norm(P.look, f);
  const neckPts = bez(N0, add(N0, mul(norm(add(mul(f, 0.4), u)), 32)), add(P.head, add(mul(L, -30), [0, 0, 12])), add(P.head, mul(L, -8)), 13);
  // (her neck as loose raw skin, thick at its root, thin under her head: a run of swellings along the curve, mottled and warty)
  const neckAt = (s: number): V3 => {
    const x = s * (neckPts.length - 1);
    const i = Math.min(neckPts.length - 2, Math.floor(x));
    return lerp3(neckPts[i], neckPts[i + 1], x - i);
  };
  const NS = 30;
  for (let k = 0; k <= NS; k++) {
    const s = k / NS;
    const c = neckAt(s);
    const d = norm(sub(neckAt(Math.min(1, s + 0.02)), neckAt(Math.max(0, s - 0.02))), UP);
    const side = norm(cross(UP, d), l);
    const up2 = norm(cross(d, side));
    const r = mix(7.2, 3.9, Math.pow(s, 0.8)) * (1 + 0.08 * Math.sin(k * 2.3));
    put('neck', `n${k}`, { k: 'ball', c, ax: [mul(d, r * 0.9), mul(side, r), mul(up2, r)], skin: bareSkin(750 + k, 0) });
  }
  // (warts on it, here and there)
  for (let k = 2; k < 26; k += 2) {
    const s = k / NS;
    const c = neckAt(s);
    const d = norm(sub(neckAt(s + 0.02), neckAt(s - 0.02)), UP);
    const side = norm(cross(UP, d), l);
    const up2 = norm(cross(d, side));
    const r = mix(7.2, 3.9, Math.pow(s, 0.8));
    const ang = hash(k, 1, 761) * TAU;
    const out = add(mul(side, Math.cos(ang)), mul(up2, Math.sin(ang)));
    const wr = 1.2 + 0.8 * hash(k, 2, 762);
    put('neck', `wart${k}`, { k: 'ball', c: add(c, mul(out, r - 0.3)), ax: [[wr, 0, 0], [0, wr, 0], [0, 0, wr]], skin: hash(k, 3, 764) > 0.5 ? BARE : [BARE[0], BARE[0], BARE[1], BARE[2], BARE[3]] });
  }
  // (her wattles, loose skin hanging under her throat)
  const throat = neckPts[neckPts.length - 3];
  const hs0 = norm(cross(UP, L), l);
  for (const sd of [1, -1]) put('neck', `wat${sd}`, { k: 'ball', c: add(throat, add(mul(hs0, sd * 2.5), [0, 0, -6])), ax: [[2.6, 0, 0], [0, 2.6, 0], [0, 0, 4.4]], skin: BARE });
  // --- HER CROWN: bone-white spikes round the root of her neck, each tip burning; a ruff of black feathers under it ---
  const nd = norm(sub(neckPts[2], neckPts[0]), UP);
  const r1 = norm(cross(nd, f), l);
  const r2 = norm(cross(nd, r1));
  const ringC = lerp3(neckPts[0], neckPts[1], 0.6);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU;
    const out = norm(add(mul(r1, Math.cos(a)), mul(r2, Math.sin(a))));
    const front = Math.max(0, dot(out, f));
    feather(put, 'ruff', `rf${k}`, add(ringC, mul(out, 8)), add(mul(out, 0.8), mul(nd, -0.75)), norm(cross(out, nd), l), 24 - 12 * front, 11, 'hackle', 720 + k, false);
  }
  for (let k = 0; k < 11; k++) {
    // (round the back and sides of her neck, not before it, longest behind)
    const a = (-150 + k * 30) * D;
    const radial = norm(add(mul(r1, Math.cos(a)), mul(r2, Math.sin(a))));
    const behind = Math.max(0, -dot(radial, f));
    const dir = norm(add(add(mul(radial, 0.55), mul(nd, 0.9)), mul(f, -0.25)));
    const Lc = 17 + 13 * behind + 5 * hash(k, 1, 731);
    const base = add(ringC, mul(radial, 8));
    // (each spike curving outward as it rises, a hooked bone)
    const mid = add(base, mul(dir, Lc * 0.55));
    const dir2 = norm(add(dir, mul(radial, 0.7)));
    const tip = add(mid, mul(dir2, Lc * 0.45));
    put('crown', `cr${k}`, { k: 'rod', a: base, b: mid, ra: 3.8, rb: 2.4, ramp: CROWN });
    put('crown', `cs${k}`, { k: 'rod', a: mid, b: tip, ra: 2.4, rb: 0.7, ramp: CROWN });
    if (lit > 0.3) {
      const flick = 0.6 + 0.4 * hash(k, Math.floor(t * 14), 733) + heat * 0.6;
      put('crown', `fire${k}`, { k: 'rod', a: tip, b: add(tip, add(mul(dir2, 2 + 4 * flick), [0, 0, 3 * flick])), ra: 1.7, rb: 0.5, ramp: [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[4]] });
      if (k % 3 === 1) put('glow', `cg${k}`, { k: 'glow', p: tip, c: FLAME[2], r: 10 + 8 * heat, a: 0.25 + 0.2 * heat });
    }
  }
  // --- HER HEAD: bald, raw, warty; a heavy brow; her eyes burning; her great hooked beak ---
  const H = P.head;
  const hs = norm(cross(UP, L), l);
  const hu = norm(cross(L, hs), UP);
  put('head', 'skull', { k: 'ball', c: H, ax: [mul(L, HEAD[0]), mul(hs, HEAD[1]), mul(hu, HEAD[2])], skin: bareSkin(740, 0) });
  // (her lappets: folds of raw skin hanging off the sides of her head, ugly)
  for (const sd of [1, -1]) {
    put('head', `lap${sd}`, { k: 'ball', c: add(H, add(add(mul(L, -3), mul(hs, sd * 6.4)), mul(hu, -5.5))), ax: [mul(L, 5.5), mul(hs, 2.2), mul(hu, 7.5)], skin: bareSkin(745 + sd, 3) });
  }
  for (const sd of [1, -1]) {
    // (her brows, heavy, drawn down toward her beak: a scowl)
    put('head', `brow${sd}`, { k: 'rod', a: add(H, add(add(mul(L, -1), mul(hs, sd * 6.8)), mul(hu, 6.4))), b: add(H, add(add(mul(L, 8.5), mul(hs, sd * 5.2)), mul(hu, 3.8))), ra: 2.9, rb: 2.4, ramp: BARE });
    const eye = add(H, add(add(mul(L, 4.5), mul(hs, sd * 6.2)), mul(hu, 2.2)));
    put('head', `eye${sd}`, { k: 'ball', c: eye, ax: [[1.9, 0, 0], [0, 1.9, 0], [0, 0, 1.9]], skin: (_u, tone) => (lit > 0.3 ? (tone >= 3 ? FLAME[4] : FLAME[3]) : '#1a1016') });
    if (lit > 0.3) put('glow', `eg${sd}`, { k: 'glow', p: eye, c: FLAME[3], r: 14, a: 0.55 * lit });
  }
  // HER BEAK: deep at its root, a great hook at its end, the hook dark
  const gape = cl01(P.gape);
  const hk = (a2: number, b2: number): V3 => add(H, add(mul(L, a2), mul(hu, b2)));
  put('head', 'cere', { k: 'rod', a: hk(8, 2.2), b: hk(12.5, 2.4), ra: 5.8, rb: 5.6, ramp: BARE });
  put('head', 'beak', { k: 'rod', a: hk(12, 2.2), b: hk(20, 2.0), ra: 5.6, rb: 4.8, ramp: BEAK });
  put('head', 'hook0', { k: 'rod', a: hk(20, 2.0), b: hk(25, -0.6), ra: 4.8, rb: 3.6, ramp: BEAK });
  put('head', 'hook1', { k: 'rod', a: hk(25, -0.6), b: hk(26.5, -7.5), ra: 3.6, rb: 0.9, ramp: TALON });
  const jawDir = norm(add(mul(L, Math.cos(gape * 40 * D)), mul(hu, -Math.sin(gape * 40 * D))));
  const j0 = hk(10, -3.2);
  put('head', 'jaw', { k: 'rod', a: j0, b: add(j0, mul(jawDir, 14)), ra: 3.4, rb: 1.6, ramp: BEAK });
  if (gape > 0.15) put('head', 'maw', { k: 'ball', c: add(H, add(mul(L, 14), mul(hu, -2.5 - 3 * gape))), ax: [mul(L, 8), mul(hs, 3), mul(hu, 2 + 2.5 * gape)], skin: (_u, tone) => (tone >= 3 ? BARE[2] : '#200810') });
  // --- HER WINGS ---
  wingBits(P, 1, put);
  wingBits(P, -1, put);
}

/** Her whole figure made this much bigger than the lengths she is built in (about her floor point). */
export const Q2_SCALE = 1.12;
/** A solid of hers made `k` times bigger about her floor point (a panel's skin read in its own lengths, as built). */
function scaled(sh: Shape, k: number): Shape {
  const p = (v: V3): V3 => mul(v, k);
  switch (sh.k) {
    case 'rod':
      return { ...sh, a: p(sh.a), b: p(sh.b), ra: sh.ra * k, rb: sh.rb * k };
    case 'ball':
      return { ...sh, c: p(sh.c), ax: [p(sh.ax[0]), p(sh.ax[1]), p(sh.ax[2])] };
    case 'panel': {
      const skin = sh.skin;
      const sk: PanelSkin = (a, b, front, tone) => skin(a / k, b / k, front, tone);
      return { ...sh, c: p(sh.c), u: p(sh.u), v: p(sh.v), skin: sk };
    }
    case 'glow':
      return { ...sh, p: p(sh.p), r: sh.r * k };
    case 'mote':
      return { ...sh, p: p(sh.p) };
    default:
      return sh;
  }
}

/** A grain laid on her picture after its edge (grit, feathers' flecks, embers): where (in her own lengths, as her solids), its colour, its size in picture pixels; `under`: only where nothing of her is painted (it is behind her). */
export type Grain = [V3, string, number, boolean?];
/** One frame of her from a pose, living (her pink edge) or not. */
export function paintQueen(view: GameView, P: QueenPose, t: number, grains: Grain[], living: boolean): Painted {
  const st = stage(view, Q2_CANVAS.ax, Q2_CANVAS.ay, Q2_CANVAS);
  const bits = queen2Bits(P, t);
  const lights = paintBits(st, bits, mul(P.body, Q2_SCALE));
  const px = st.whole(living ? ENEMY_RIM : null);
  for (const [pt, col, size, under] of grains) {
    const [x, y] = st.at(mul(pt, Q2_SCALE));
    // (on whole game pixels: two of the picture's to one)
    const xi = 2 * Math.round((x - 1) / 2);
    const yi = 2 * Math.round((y - 1) / 2);
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const X = xi + dx;
        const Y = yi + dy;
        if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
        if (under && px.d[(Y * px.w + X) * 4 + 3] > 0) continue;
        px.set(X, Y, col);
      }
    }
  }
  return { px, lights };
}

// ---------------------------------------------------------------------------------------------
// HER STAND: never still. Crouched in her mantle, her neck snaking, her head snapping from one place to the next as a
// bird's does, jabbing low with a hiss; her wings held half open and raised about her like a cloak, twitching; once a
// round she rouses, every feather shaken up and out, her fingers spread, her tail fanned, her crown flaring. (Her
// great flare, her wings thrown up and wide, is her call's and her gust's: in her stand it would leap when the game
// breaks into a move from it, Movement 5.)

/** Her stand: a 2.0 s round. */
export const Q2_STAND = 2.0;
/** In her stand: when she jabs and hisses; when she rouses. */
export const Q2_HABITS = { jab: [0.62, 0.86], rouse: [1.22, 1.72] } as const;
/** How long her head takes to snap from one place to the next (seconds): two frames of her stand. */
const SNAP = 0.14;
/** Her wings folded on her back. */
export const FOLDED: WingPose = { arm: [-0.85, 0.3, -0.35], fore: [0.95, 0.25, 0.1], hand: [-0.97, 0.18, 0.1], top: [0, 1, 0.25], tipTop: [0, 1, 0.25], open: 0, fan: 0 };
/** Her mantle, as she stands: half open about her, her wrists high over her shoulders, her hands hanging, their fingers down. */
export const MANTLE: WingPose = { arm: [-0.15, 0.6, 0.78], fore: [0.2, 0.92, 0.25], hand: [0.2, 0.4, -0.9], top: [-0.85, 0, 0.5], tipTop: [-0.9, 0.2, 0.1], open: 0.9, fan: 0.75 };
/** Her wings flared: thrown up and open wide, every feather spread. */
export const FLARE: WingPose = { arm: [-0.1, 0.62, 0.78], fore: [0.05, 0.85, 0.52], hand: [0.1, 0.92, 0.38], top: [-0.9, 0, 0.4], tipTop: [-0.85, 0.1, 0.5], open: 1, fan: 1 };
/** Two of her wing's poses blended: each bone turned evenly from one way to the other (so that a wing sweeps at an even pace, never flicking through the middle). */
export function mixWing(a: WingPose, b: WingPose, k: number): WingPose {
  return { arm: slerp(a.arm, b.arm, k), fore: slerp(a.fore, b.fore, k), hand: slerp(a.hand, b.hand, k), top: slerp(a.top, b.top, k), tipTop: slerp(a.tipTop, b.tipTop, k), open: mix(a.open, b.open, k), fan: mix(a.fan, b.fan, k) };
}
/** A way turned evenly toward another, `k` of the way. */
function slerp(a0: V3, b0: V3, k: number): V3 {
  const a = norm(a0);
  const b = norm(b0);
  const c = Math.max(-1, Math.min(1, dot(a, b)));
  const th = Math.acos(c);
  if (th < 1e-4) return lerp3(a, b, k);
  if (th > Math.PI - 1e-3) return norm(lerp3(a, b, k), UP);
  const s = Math.sin(th);
  return add(mul(a, Math.sin((1 - k) * th) / s), mul(b, Math.sin(k * th) / s));
}
/** Where her head goes as she stands: snapping from one place to the next and holding there (where, the way it looks). */
const HEADS: [number, V3, V3][] = [
  [0, [88, 0, 128], [1, 0, -0.35]],
  [0.3, [92, 13, 125], [0.85, 0.45, -0.4]],
  [0.62, [104, -3, 110], [1, -0.05, -0.75]],
  [0.86, [85, -13, 131], [0.85, -0.5, -0.25]],
  [1.22, [84, 0, 134], [1, 0, -0.05]],
  [1.72, [90, 7, 126], [0.9, 0.3, -0.35]],
]
/** A wing's pose with a little life in it: raised a few degrees (its arm and forearm turned up about her body's line). */
export function lifted(W: WingPose, deg: number): WingPose {
  const up = (v: V3): V3 => {
    const c = Math.cos(deg * D);
    const sn = Math.sin(deg * D);
    return [v[0], v[1] * c - v[2] * sn, v[1] * sn + v[2] * c];
  };
  return { ...W, arm: up(W.arm), fore: up(W.fore), hand: up(W.hand), top: up(W.top), tipTop: up(W.tipTop) };
}
export function standPose(t: number): QueenPose {
  const k = fr(t / Q2_STAND);
  const T = k * Q2_STAND;
  const a = k * TAU;
  // (her head: snapping, a quick move then held, as a bird's)
  let head: V3 = HEADS[0][1];
  let look: V3 = HEADS[0][2];
  for (let i = 0; i < HEADS.length; i++) {
    const [t0, h1, l1] = HEADS[i];
    if (T >= t0) {
      const prev = HEADS[i === 0 ? HEADS.length - 1 : i - 1];
      const s = sm((T - t0) / SNAP);
      head = lerp3(prev[1], h1, s);
      look = lerp3(prev[2], l1, s);
    }
  }
  if (T < HEADS[1][0]) {
    const prev = HEADS[HEADS.length - 1];
    const s = sm(T / SNAP);
    head = lerp3(prev[1], HEADS[0][1], s);
    look = lerp3(prev[2], HEADS[0][2], s);
  }
  // (a tremor through her head and neck, never still)
  head = add(head, [0.8 * Math.sin(a * 13), 0.8 * Math.sin(a * 12 + 1), 0.6 * Math.sin(a * 15)]);
  const jab = T > Q2_HABITS.jab[0] && T < Q2_HABITS.jab[1] ? Math.sin((Math.PI * (T - Q2_HABITS.jab[0])) / (Q2_HABITS.jab[1] - Q2_HABITS.jab[0])) : 0;
  const rouse = T > Q2_HABITS.rouse[0] && T < Q2_HABITS.rouse[1] ? sm(Math.min((T - Q2_HABITS.rouse[0]) / 0.12, (Q2_HABITS.rouse[1] - T) / 0.2)) : 0;
  // (as she rouses, a shudder through her)
  const shudder = rouse * Math.sin(a * 22) * 1.5;
  // (her wings twitching in their mantle, never quite still; hitched up a little as she rouses)
  const twitch = Math.max(0, Math.sin(a * 5)) ** 6 * (1 - rouse);
  const w = { ...MANTLE, open: mix(MANTLE.open, 1, rouse), fan: mix(MANTLE.fan, 1, rouse) };
  const w0 = lifted(w, 3.5 * twitch + 1.5 * Math.sin(a * 2) + 2 * jab + 1.5 * rouse + shudder * 0.6);
  const w1 = lifted(w, 3.5 * twitch + 1.5 * Math.sin(a * 2 + 1) + 2 * jab + 1.5 * rouse - shudder * 0.6);
  return {
    body: [-2 + 1.5 * jab, 0, 80 + 2.4 * Math.sin(2 * a) - 2 * jab + 1 * rouse],
    pitch: 26 + 3 * Math.sin(2 * a + 0.5) - 4 * jab + 1.5 * rouse,
    yaw: 3 * Math.sin(a),
    roll: 2 * Math.sin(a + 1) + shudder,
    head,
    look,
    gape: Math.max(jab, 0.45 * rouse),
    wings: [w0, w1],
    feet: [[4, 20, 0], [-3, -20, 0]],
    grasp: [0.25 + 0.6 * jab, 0.25 + 0.6 * jab],
    tail: 0.35 + 0.65 * rouse,
    heat: 0.35 + 0.6 * rouse + 0.3 * jab,
    lit: 1,
    ruffle: 0.2 + 0.8 * rouse,
  };
}

/** Her solids in a pose, as painted (for the tests: what of her is where). */
export function queen2Bits(P: QueenPose, t = 0): Bit[] {
  const bits: Bit[] = [];
  queenBits(P, t, (part, piece, shape) => bits.push({ part, piece, shape: scaled(shape, Q2_SCALE) }));
  return bits;
}
/** A pose of hers painted as it is (for the dev pages). */
export function queen2PosePainted(P: QueenPose, view: GameView = 'front', t = 0): Painted {
  return paintQueen(view, P, t, [], true);
}
/** One frame of her: `which` (stand), `t` seconds in, from in front or behind. */
export function queen2Painted(which: string, t: number, view: GameView = 'front'): Painted {
  void which;
  return paintQueen(view, standPose(t), t, [], true);
}
/** One frame, as the game holds a figure. */
export function queen2Frame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(queen2Painted(which, t, view), null, Q2_CANVAS.ax, Q2_CANVAS.ay);
}
/** Her stand's frames: 30 at fifteen a second. (Her pictures as the game holds them: art/carrion_queen2_moves.ts, `makeQueen2Art`.) */
export const Q2_IDLE = { frames: 30, fps: 15 } as const;
