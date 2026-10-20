// FLOOR 13'S DOUBLE BOSS, THE SECOND OF THE TWO: THE QUILL (the art chat, 20 Oct 2026). A MOCK-UP: NOT IN THE GAME (PAIR_ON,
// art/scraper.ts, off). The other is the Scraper (art/scraper.ts); what they are made of, art/pair_skins.ts, with his words.
//
// THE QUILL: a great heron of clean white pages, twice the knight's height with its neck up, wading after the Scraper and
// writing over what it scrapes. Its plumage is page over page of white vellum, scraped and written fresh in a fine black hand;
// its long legs and its two crest plumes the Order's wet ink; its beak a long steel nib, slit to its point, dripping ink. Its
// eye burns the enemy's pink.
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the canyon scorpion is, in the same painter (art/new_mobs3.ts
// paintBits).
//
// THIS FIRST STEP: its look, standing, and its stand.

import type { Px, Sprite } from '../engine/px';
import { hash, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Skin, Stage } from './skin';
import type { V3 } from './skeleton';
import { INK, STEEL, WHITE, inkSkin, leafSkin } from './pair_skins';

/** Its flight feathers' tips: dipped in the Order's ink, as a heron's are dark. */
const INKWHITE: typeof WHITE = ['#121018', '#22202a', '#3a3744', '#5a5666', '#7c7888'];

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
void cl01;

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high). x forward, y to its left, z up; its own frame has its body's middle
// at the origin.

/** Its body's middle over the floor, at rest: its back at the knight's head. */
export const QL_BODY_Z = 56;
/** Its body: half-lengths (long, wide, deep); held tilted, its breast up. */
const BODY_R: V3 = [19, 9.5, 10.5];
const BODY_TILT = -20;
/** Its neck at rest (its own frame), from the root at its breast to its head: the heron's S, folded back on itself. */
const NECK_REST: V3[] = [
  [13, 0, 7],
  [19, 0, 15],
  [17, 0, 23],
  [12, 0, 30],
  [14, 0, 38],
  [20, 0, 44],
];
const NECK_R = [4.4, 3.9, 3.5, 3.3, 3.1, 3.0];
/** Its head's half-lengths; its beak's length (a steel nib). */
const HEAD_R: V3 = [7, 4.4, 4.8];
const BEAK = 27;
/** Its legs: each hip (under its body), and its foot at rest on the floor (the floor's own grid, from its floor point). */
const HIP: V3 = [-1, 5, -10];
export const QL_FEET: [V3, V3] = [[2, 9, 0], [-3, -9, 0]];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: ten frames a second, a loop of 3.0 s: still as a heron is, its neck drawn up, its head turning; ink dripping off its nib. */
export const QL_STAND = { frames: 30, fps: 10, period: 3.0 } as const;
/** The canvas it is painted on, and its floor point on it: room for its neck and wings and its moves. */
export const QL_CANVAS = { w: 620, h: 620, ax: 310, ay: 470 };
const QL_AURA = { x: QL_CANVAS.ax, y: QL_CANVAS.ay - 60, r: 60, color: '#ff3a78', a: 0.06 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

export interface QlPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Its neck's joints (its own frame), root first, head last; its head's pitch (degrees, beak down) and turn (to its left). */
  neck: V3[];
  headPitch: number;
  headYaw: number;
  /** Its beak open (0 shut, 1 wide), and its nib's glint (0 to 1). */
  gape: number;
  glint: number;
  /** Its wings: how far spread (0 folded along its body, 1 wide), and how far raised (degrees). */
  spread: number;
  lift: number;
  /** Its feet on the floor's own grid, and how far each ankle bends back. */
  feet: [V3, V3];
  ankle: [number, number];
  eye: number;
  alive: boolean;
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

/** Its stand: still as a heron is; it breathes, its neck rising and settling a little; its head turns slowly, looking; a drop of ink gathers on its nib and falls. */
function standPose(t: number): QlPose {
  const a = (Math.PI * 2 * t) / QL_STAND.period;
  const rise = Math.sin(a);
  const neck = NECK_REST.map((p, i): V3 => [p[0] + 0.6 * rise * (i / 5), p[1], p[2] + 1.2 * rise * (i / 5)]);
  const chips: [V3, string, number][] = [];
  // (the drop of ink: gathers at the nib's point, falls to the floor)
  const ph = (t / QL_STAND.period) % 1;
  if (ph > 0.55) {
    const k = (ph - 0.55) / 0.45;
    chips.push([[34, 0, 98 - 98 * k * k], INK[1], 2]);
  }
  return {
    x: 0,
    y: 0,
    z: QL_BODY_Z + 0.6 * rise,
    yaw: 0,
    pitch: 0,
    roll: 0,
    neck,
    headPitch: 8 + 3 * Math.sin(a * 0.5),
    headYaw: 22 * Math.sin(a * 0.5 + 0.6),
    gape: 0,
    glint: 0,
    spread: 0,
    lift: 0,
    feet: [QL_FEET[0], QL_FEET[1]],
    ankle: [1, 1],
    eye: 1,
    alive: true,
    chips,
    flares: [],
  };
}

function poseOf(which: string, t: number): QlPose {
  void which;
  return standPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

function worldOf(P: QlPose, p: V3): V3 {
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const cp = Math.cos(P.pitch * D), sp = Math.sin(P.pitch * D);
  const cr = Math.cos(P.roll * D), sr = Math.sin(P.roll * D);
  const r1: V3 = [p[0], p[1] * cr - p[2] * sr, p[1] * sr + p[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  const r3: V3 = [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
  return [P.x + r3[0], P.y + r3[1], P.z + r3[2]];
}
function turned(P: QlPose, v: V3): V3 {
  return sub(worldOf(P, v), worldOf(P, [0, 0, 0]));
}
/** Turned by `deg` about its left-right axis (nose down), in its own frame. */
function tilt(v: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

/** White vellum round a solid, written over in a fine black hand: rows round it, a feather's edge now and then. */
function vellumSkin(seed: number): Skin {
  return (u, tone0) => {
    const tone = [1, 2, 3, 3, 4][Math.max(0, Math.min(4, tone0))];
    const z = u[2] * 9;
    const around = Math.atan2(u[1], u[0]) * 8;
    const row = Math.floor(z / 2.2);
    if (z - row * 2.2 < 0.6 && ((around + 40 + hash(row, seed, 8411) * 4) / 3.4) % 1 < 0.6 && hash(Math.floor((around + 40) / 3.4), row + seed, 8412) < 0.55) return WHITE[Math.max(0, tone - 2)];
    return WHITE[tone];
  };
}

/** THE QUILL AS SOLIDS: its body and its plumage, its wings and tail, its neck and head, its nib, its legs and feet, its eye. */
function quillBits(P: QlPose, put: Put): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const T = (v: V3): V3 => turned(P, v);
  const fx = tilt([1, 0, 0], BODY_TILT);
  const fz = tilt([0, 0, 1], BODY_TILT);
  const fy: V3 = [0, 1, 0];
  // ITS BODY: a white egg tilted breast up, page feathers over it in rows, shingled back
  put('body', 'body', { k: 'ball', c: W([0, 0, 0]), ax: [T(mul(fx, BODY_R[0])), T(mul(fy, BODY_R[1])), T(mul(fz, BODY_R[2]))], skin: vellumSkin(3) });
  let seed = 31;
  const rows: [number, number, number, number, number, number][] = [
    [0.62, -60, 60, 4, 4.4, 5.2],
    [0.3, -70, 70, 5, 4.8, 6.0],
    [0.68, 130, 230, 3, 4.2, 5.4],
  ];
  for (const [s, a0, a1, n, w, h] of rows) {
    for (let i = 0; i < n; i++) {
      const ang = a0 + ((i + 0.5) / n) * (a1 - a0) + (hash(seed, 1, 8401) - 0.5) * 8;
      const q = Math.sqrt(1 - s * s);
      const lp: V3 = [BODY_R[0] * s, BODY_R[1] * q * Math.sin(ang * D), BODY_R[2] * q * Math.cos(ang * D)];
      const ln: V3 = norm([lp[0] / (BODY_R[0] * BODY_R[0]), lp[1] / (BODY_R[1] * BODY_R[1]), lp[2] / (BODY_R[2] * BODY_R[2])]);
      const p = add(add(mul(fx, lp[0]), mul(fy, lp[1])), mul(fz, lp[2]));
      const n0 = norm(add(add(mul(fx, ln[0]), mul(fy, ln[1])), mul(fz, ln[2])));
      const back = mul(fx, -1);
      const along = norm(sub(back, mul(n0, back[0] * n0[0] + back[1] * n0[1] + back[2] * n0[2])), [-1, 0, 0]);
      const v = norm(add(along, mul(n0, 0.25)));
      const u = cross(v, n0);
      const c = add(add(p, mul(n0, 0.8)), mul(v, h * 0.35));
      put('body', 'feather', { k: 'panel', c: W(c), u: T(mul(u, w)), v: T(mul(v, h)), skin: leafSkin(seed, w, h, WHITE, true, 0, 0.08) });
      seed++;
    }
  }
  // ITS WINGS: folded, each lies along its side like a cloak, row on row of page feathers: the coverts short and high, the
  // flight feathers long beneath them, their tips crossing past its tail. Spread, they swing out from the shoulder and open.
  for (const side of [1, -1]) {
    const sh: V3 = add(mul(fx, 9), add(mul(fy, side * 8.5), mul(fz, 4)));
    // (the wing's own frame: `along` from shoulder to tip, `up` across it, `out` the way its upper face looks)
    const foldAlong = norm(add(mul(fx, -1), mul(fz, -0.22)));
    const spreadAlong = norm(add(mul(fy, side), add(mul(fx, -0.25), [0, 0, Math.sin(P.lift * D)])));
    const along = norm(lerpV(foldAlong, spreadAlong, P.spread));
    const foldOut = mul(fy, side);
    const spreadOut: V3 = [0, 0, 1];
    const out0 = norm(lerpV(foldOut, spreadOut, P.spread));
    const up = norm(cross(out0, along));
    const upS = side > 0 ? mul(up, -1) : up;
    const layers: [number, number, number, number, number][] = [
      // from the shoulder along it, how far across from its leading edge, half-width, half-length, how far out
      [10, 1.5, 7.5, 9, 0.9],
      [16, -2.5, 6.5, 13, 0.5],
      [22, -5.5, 4.0, 16, 0.2],
      [25, -8.0, 3.2, 17, 0.0],
    ];
    layers.forEach(([at, across, w, h, outK], i) => {
      const c = add(add(add(sh, mul(along, at * (1 + 0.6 * P.spread))), mul(upS, across * (1 + 0.4 * P.spread))), mul(out0, 1.4 + outK));
      put(`wing${side}`, 'feathers', { k: 'panel', c: W(c), u: T(mul(upS, w)), v: T(mul(along, h * (1 + 0.3 * P.spread))), skin: leafSkin(700 + i + (side > 0 ? 0 : 20), w, h * (1 + 0.3 * P.spread), WHITE, true, 0, 0.05) });
    });
    // (its flight feathers' tips: a few long quills fanned from the wing's end, longer when spread)
    for (let k = 0; k < 4; k++) {
      const root = add(add(sh, mul(along, 30 * (1 + 0.6 * P.spread))), mul(upS, -3 - k * 2.6));
      const dir = norm(add(along, mul(upS, -0.03 * k - 0.12 * P.spread * k)));
      const L = 7 + 1.2 * k + 7 * P.spread;
      put(`wing${side}`, 'tips', { k: 'panel', c: W(add(add(root, mul(dir, L)), mul(out0, -0.3 * k))), u: T(mul(upS, 2)), v: T(mul(dir, L)), skin: leafSkin(740 + k + (side > 0 ? 0 : 20), 2, L, INKWHITE, true, 0, 0.0) });
    }
  }
  // ITS TAIL: short pages fanned behind and under the wings' tips
  for (let k = -1; k <= 1; k++) {
    const dir = norm(add(mul(fx, -1), add(mul(fy, k * 0.25), mul(fz, -0.45))));
    const c = add(mul(fx, -BODY_R[0] * 0.92), mul(dir, 6));
    put('tail', 'tail', { k: 'panel', c: W(c), u: T(mul(norm(cross(dir, fz)), 3.4)), v: T(mul(dir, 7)), skin: leafSkin(760 + k, 3.4, 7, WHITE, true) });
  }
  // ITS NECK: the S of it, white, a stripe of ink running down its front; a few long plumes hanging from its foot over its breast
  for (let i = 0; i + 1 < P.neck.length; i++) {
    put('neck', 'neck', { k: 'rod', a: W(P.neck[i]), b: W(P.neck[i + 1]), ra: NECK_R[i], rb: NECK_R[i + 1], ramp: WHITE });
  }
  for (let i = 1; i < P.neck.length - 1; i++) {
    const a = P.neck[i];
    const b = P.neck[i + 1];
    const along = norm(sub(b, a));
    const front = norm(cross(fy, along));
    const fr2 = front[0] < 0 ? mul(front, -1) : front;
    for (let j = 0; j < 3; j++) put('neck', 'stripe', { k: 'mote', p: W(add(lerpV(a, b, j / 3), mul(fr2, NECK_R[i] * 0.95))), c: INK[1], size: 2 });
  }
  for (let k = -1; k <= 1; k++) {
    const root = add(P.neck[1], [2, k * 2, -1]);
    const dir = norm([0.25, k * 0.1, -1]);
    put('neck', 'plume', { k: 'panel', c: W(add(root, mul(dir, 7))), u: T([0, 2.2, 0]), v: T(mul(dir, 8)), skin: leafSkin(780 + k, 2.2, 8, WHITE, true) });
  }
  // ITS HEAD, at the top of its neck, turned and tipped; its crest, two long plumes of ink trailing back from it
  const head = P.neck[P.neck.length - 1];
  const hp = P.headPitch * D;
  const hy = P.headYaw * D;
  const hf: V3 = [Math.cos(hp) * Math.cos(hy), Math.cos(hp) * Math.sin(hy), -Math.sin(hp)];
  const hl = norm(cross([0, 0, 1], hf), [0, 1, 0]);
  const hu = norm(cross(hf, hl));
  const hc = add(head, mul(hf, 3));
  put('head', 'head', { k: 'ball', c: W(hc), ax: [T(mul(hf, HEAD_R[0])), T(mul(hl, HEAD_R[1])), T(mul(hu, HEAD_R[2]))], skin: vellumSkin(9) });
  // (a cap of ink over its crown, as a heron's black brow)
  put('head', 'cap', { k: 'ball', c: W(add(hc, add(mul(hu, 2.6), mul(hf, -0.5)))), ax: [T(mul(hf, HEAD_R[0] * 0.8)), T(mul(hl, HEAD_R[1] * 0.9)), T(mul(hu, 2.4))], skin: inkSkin() });
  for (const k of [0, 1]) {
    const root = add(hc, add(mul(hf, -HEAD_R[0] * 0.7), mul(hu, 2.5)));
    const tip = add(root, add(mul(hf, -16 - 4 * k), add(mul(hu, -3 - 3 * k), mul(hl, (k ? -1 : 1) * 1.5))));
    put('head', 'crest', { k: 'rod', a: W(root), b: W(tip), ra: 1.2, rb: 0.3, ramp: INK });
  }
  // ITS NIB: a long steel pen point, broad at its base and slit to its point, the two halves parting as it gapes
  const base = add(hc, mul(hf, HEAD_R[0] * 0.8));
  const tipU = add(base, add(mul(hf, BEAK), mul(hu, P.gape * 3)));
  const tipL = add(base, add(mul(hf, BEAK * 0.97), mul(hu, -P.gape * 3)));
  const steel = P.glint > 0.6 ? FLAME.slice(1).concat([FLAME[4]]) as unknown as typeof STEEL : STEEL;
  put('head', 'nibU', { k: 'rod', a: W(add(base, mul(hu, 1.2))), b: W(tipU), ra: 2.6, rb: 0.35, ramp: steel });
  put('head', 'nibL', { k: 'rod', a: W(add(base, mul(hu, -1.2))), b: W(tipL), ra: 2.4, rb: 0.35, ramp: steel });
  // (the nib's breather hole, and the ink in its slit)
  put('head', 'breather', { k: 'dot', p: W(add(add(base, mul(hf, 5)), mul(hu, 2.4))), c: INK[0], facing: T(hu) });
  for (let j = 1; j <= 5; j++) put('head', 'slit', { k: 'mote', p: W(add(lerpV(base, lerpV(tipU, tipL, 0.5), 0.3 + j * 0.12), mul(hu, 0.1))), c: INK[0], size: 1 });
  // ITS EYE, the enemy's pink, either side of its head
  if (P.eye > 0.2) {
    for (const s of [1, -1]) put('head', `eye${s}`, { k: 'dot', p: W(add(add(hc, mul(hf, 2.4)), add(mul(hl, s * HEAD_R[1] * 0.92), mul(hu, 1.2)))), c: FLAME[2], facing: T(mul(hl, s)), c2: FLAME[3] });
    put('glow', 'eye', { k: 'glow', p: W(add(hc, mul(hf, 2))), c: FLAME[2], r: 7, a: 0.2 * P.eye });
  }
  // ITS LEGS: long and thin, the Order's ink; the joint that bends back halfway down; three long toes forward and one back
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const hip = W(add(add(mul(fx, HIP[0]), mul(fy, side * HIP[1])), mul(fz, HIP[2])));
    const foot = P.feet[k];
    const mid = lerpV(hip, foot, 0.48);
    const back = norm([-(foot[1] - hip[1]) * 0, 0, 0], [-1, 0, 0]);
    const ankle = add(mid, mul(turned(P, back), 4.5 * P.ankle[k]));
    put(`leg${k}`, 'shank', { k: 'rod', a: hip, b: ankle, ra: 2.4, rb: 1.5, ramp: INK });
    put(`leg${k}`, 'shin', { k: 'rod', a: ankle, b: [foot[0], foot[1], foot[2] + 1], ra: 1.5, rb: 1.3, ramp: INK });
    put(`leg${k}`, 'ankle', { k: 'ball', c: ankle, ax: [[1.9, 0, 0], [0, 1.9, 0], [0, 0, 1.9]], skin: INK });
    const fwd = norm(turned(P, [1, 0, 0]));
    const left = norm(cross([0, 0, 1], fwd));
    for (const [a, L] of [[-28, 10], [0, 12], [28, 10], [180, 6]] as const) {
      const d = norm(add(mul(fwd, Math.cos(a * D)), mul(left, Math.sin(a * D))));
      put(`leg${k}`, 'toe', { k: 'rod', a: [foot[0], foot[1], foot[2] + 0.9], b: add(foot, add(mul(d, L), [0, 0, 0.6])), ra: 1.1, rb: 0.4, ramp: INK });
    }
  }
}

/** One frame of the Quill: `which` (stand, for now), `t` seconds in, from in front or behind. */
export function quillPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, QL_CANVAS.ax, QL_CANVAS.ay, QL_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  quillBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [P.x, P.y, P.z]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
export function quillFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(quillPainted(which, t, view), which === 'dying' ? null : QL_AURA, QL_CANVAS.ax, QL_CANVAS.ay);
}
export function quillSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  quillBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}
