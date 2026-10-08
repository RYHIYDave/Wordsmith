// The Warden: the boss at the bottom of the dungeon, and the knight's dark mirror. A dead king's
// jailer: a towering skeleton in cracked iron with fire showing through the cracks, a horned helm
// open over the skull's face, a long tattered cape the colour of blood, and a two-handed maul
// whose head carries a burning rune.
//
// There was no painting of him in the chosen style (style 6): this is his design, made inside the
// style of the sheet and of the knight (hero_warrior.ts). What he was in the first builds
// (boss.ts, previews/boss.png) is all still here, so that a player who knows him knows him.
//
// He does not fit the kit's canvas, so he is painted on a bigger one of his own (WARDEN_CANVAS).
// Every frame faces screen-right: `front` toward the camera (down-right), `back` away from it
// (up-right).
//
// What the numbers of a Pose mean to him:
//   bob, lean   a big body moves in bigger steps than a hero's: one of `bob` sinks him two pixels
//               (his knees bend to take it up), one of `lean` carries his shoulders two pixels
//               across and his hips less, so that he bends at the waist.
//   hx, hy      the hand at the butt of the maul's shaft, from where it rests before his belt.
//   aim         the way the maul points, butt to head: 0 = screen-right (ahead of him), 90 =
//               straight up, -90 = straight down. Hoisted up and back over his head it tips away
//               from where he faces, so less of its length shows.
//   act         how HOT he is, 0..1: the cracks in his plate, the rune and the edges of the maul,
//               the fire in his eyes and in his throat, and the lights they all give off.
//   prop = 1    the volley: `off` (0..1) takes the other hand off the shaft and raises it, open,
//               and the maul stands on the floor, not moving with his body; `ohx`, `ohy` move that
//               hand from where it is raised (the sweep toward the hero); `pt` (0..1) is the fire
//               gathered in its palm.
//   wind, drag  the cape and the strip of cloth at his belt; the embers pulse with `wind`.

import { Px, rgba } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import type { Key, Timeline } from './clip';
import { fallen, quench } from './death';
import type { Piece } from './death';
import { BONE, INDIGO, INK, PLUM, REST, ball, bezAt, compose, dim, dir, limb, lit, mix, shear, slant, stamp, stroke } from './kit';
import type { Painted, Pose, Ramp, Reach, V } from './kit';
import { BLOOD, FLAME, IRON, SOCKET, monsterArt } from './mkit';
import type { Canvas, MonsterMoves } from './mkit';

/** His canvas: 162 pixels of height above the floor point, 80 to its left and 104 to its right. */
const W = 184;
const H = 176;
const AX = 80;
const AY = 162;
export const WARDEN_CANVAS: Canvas = { w: W, h: H, ax: AX, ay: AY };

// --- how he is built, in pixels ---------------------------------------------------------------
/** Floor to hip, to the top of the belt, to the line of the shoulders, to the top of the helm. */
const HIP = 50;
const BELT = 60;
const SHOULDER = 86;
const CROWN = 108;
/** From the middle of the chest to a shoulder joint. */
const SPAN = 19;
/** Bones of an arm: long ones. */
const UPPER = 21;
const FORE = 19;
/** A leg below the knee, foot and all, in rows. */
const SHIN = 26;

/** The maul's head: how long it is across the shaft and how thick along it. */
const HEAD_L = 28;
const HEAD_T = 18;
/** From the hand at the butt to the middle of the head, to the end of the shaft, and to the other hand. */
const REACH = 58;
const BUTT = 7;
const SPREAD = 21;
/** The maul at rest: across the body, its head low on the side he faces. */
const REST_AIM = -34;

// --- TURNED TO THE GRID (kit.ts): he is seen from a corner, as everything in the game is ---
/** The corner of his trunk that is nearest us is this far from his middle: toward the nearer shoulder. (The knight's 4 and 3, for a body twice as wide.) */
const CORNER_FRONT = -9;
const CORNER_BACK = 7;
/** ... and it is this many rows lower than his middle line: everything that runs across him is lowest there. */
const CORNER_DROP = 4;
/** His nearer shoulder is this much lower than it was drawn square-on, and his further this much higher. */
const NEAR_DROP = 3;
const FAR_RISE = 7;
/** What is on his middle line (the buckle, the strip of cloth, his spine, the ridge of his back) is this far toward the side he faces when we see his chest, and away from it when we see his back. */
const TURN_MID = 5;
/** His skull is this far toward the side he faces inside the helm. */
const TURN_FACE = 2;
/** His nearer foot is this much lower on the screen than it was, and his further this much higher. */
const FOOT_NEAR = 1;
const FOOT_FAR = 3;

/** Plate on the side away from the camera: the same iron, in shade. */
const SHADE: Ramp = [IRON[0], IRON[0], mix(IRON[0], IRON[2], 0.5), mix(IRON[2], IRON[3], 0.2), mix(IRON[2], IRON[3], 0.2)];
/** Iron worn bright: the bands of the maul. */
const WORN: Ramp = [IRON[0], IRON[0], mix(IRON[2], IRON[3], 0.5), mix(IRON[3], BONE[3], 0.35), mix(IRON[3], BONE[3], 0.35)];
/** Mail under the plate (on his thighs): darker than the plate, and darker again on the far leg. */
const MAIL_NEAR: Ramp = [IRON[0], IRON[0], mix(IRON[0], IRON[2], 0.6), mix(IRON[2], IRON[3], 0.35), mix(IRON[2], IRON[3], 0.35)];
const MAIL_FAR: Ramp = [IRON[0], IRON[0], mix(IRON[0], IRON[2], 0.25), mix(IRON[0], IRON[2], 0.8), mix(IRON[0], IRON[2], 0.8)];
/** The seam of the style as a material: a shape painted in it, a pixel bigger, under the same shape in its own colours, parts it from what is below. */
const SEAM: Ramp = [INK, INK, INK, INK, INK];
/** The inside of the cape, which is what shows when he faces us. */
const LINING: Ramp = [BLOOD[0], BLOOD[0], mix(BLOOD[0], BLOOD[2], 0.45), mix(BLOOD[2], BLOOD[3], 0.3), mix(BLOOD[2], BLOOD[3], 0.3)];

/** Bone on the side away from the camera. */
const BONE_FAR: Ramp = dim(BONE);

/**
 * The layers of a frame. They are kept and used again for the next frame (what a frame hands back
 * is the new picture `compose` makes of them, never one of these).
 */
const sheets: Px[] = [];
let taken = 0;
const px = (): Px => {
  let p = sheets[taken];
  if (p) p.d.fill(0);
  else p = sheets[taken] = new Px(W, H);
  taken++;
  return p;
};

// --- small things on a big canvas ---------------------------------------------------------------
// The kit's `lit` and `compose` look at every pixel of the canvas they are given, and his canvas
// is two and a half times a hero's. Only three things of his are big: the cape, the body and the
// maul. Everything else (a greave, a horn, an arm, the head) is painted on a small canvas of its
// own and laid on the big one, which costs what a small thing should.

/** The side of the small canvases. */
const TILE = 64;
/** Where a shape is shaded, and where a part is put together. */
const tile = new Px(TILE, TILE);
const bench = new Px(TILE, TILE);

/**
 * A canvas's pixels as whole numbers, one to a pixel (the quick way to look at a great many of
 * them), and the number a painted pixel of some colour is.
 */
const views = new WeakMap<Px, Uint32Array>();
function words(p: Px): Uint32Array {
  let v = views.get(p);
  if (!v) views.set(p, (v = new Uint32Array(p.d.buffer, p.d.byteOffset, p.d.length >> 2)));
  return v;
}
const pack = (r: number, g: number, b: number, a: number): number => new Uint32Array(new Uint8Array([r, g, b, a]).buffer)[0];
function word(c: string): number {
  const v = rgba(c);
  return pack(v[0], v[1], v[2], 255);
}
/** The part of a pixel's number that says it is painted. */
const SOLID = pack(0, 0, 0, 255);
const INK_WORD = word(INK);

/**
 * Lays a small canvas on a big one, its top left corner at (x0, y0). With `seam`, as `compose`
 * lays one layer on another: wherever it lies over something already painted there, it has the
 * style's dark seam round it.
 */
function put(src: Px, dst: Px, x0: number, y0: number, seam: boolean): void {
  const from = words(src);
  const to = words(dst);
  const left = Math.max(0, -x0);
  const right = Math.min(TILE, dst.w - x0);
  const bottom = Math.min(TILE, dst.h - y0);
  for (let y = Math.max(0, -y0); y < bottom; y++) {
    let i = y * TILE + left;
    let j = (y0 + y) * dst.w + x0 + left;
    for (let x = left; x < right; x++, i++, j++) {
      const c = from[i];
      if ((c & SOLID) !== 0) to[j] = c | SOLID;
      else if (
        seam &&
        (to[j] & SOLID) !== 0 &&
        ((x > 0 && (from[i - 1] & SOLID) !== 0) || (x < TILE - 1 && (from[i + 1] & SOLID) !== 0) || (y > 0 && (from[i - TILE] & SOLID) !== 0) || (y < TILE - 1 && (from[i + TILE] & SOLID) !== 0))
      ) {
        to[j] = INK_WORD;
      }
    }
  }
}

/**
 * The kit's `lit`, for a shape no bigger than a tile: it is painted and shaded on the tile, whose
 * top left corner lies at (x0, y0) of `dst`, and copied across. `paint` is given that corner, to
 * take off whatever it draws.
 */
function shade(dst: Px, x0: number, y0: number, ramp: Ramp, hi: Reach, lo: Reach, paint: (l: Px, x0: number, y0: number) => void): void {
  tile.d.fill(0);
  lit(tile, ramp, hi, lo, (l) => paint(l, x0, y0));
  put(tile, dst, x0, y0, false);
}

/**
 * One of his smaller parts (an arm, the head, a shoulder plate): where its middle is on his
 * canvas, and what paints it on the bench, given the corner of the bench to take off whatever it
 * draws.
 */
interface Part {
  x: number;
  y: number;
  paint: (b: Px, ox: number, oy: number) => void;
}

/** Paints a part and lays it on a layer, with the seam a layer of its own would have had. */
function lay(dst: Px, part: Part): void {
  const x0 = Math.round(part.x) - TILE / 2;
  const y0 = Math.round(part.y) - TILE / 2;
  bench.d.fill(0);
  part.paint(bench, x0, y0);
  put(bench, dst, x0, y0, true);
}

/**
 * Something painted that gives off light (an eye, a crack with the fire behind it, the rune): the
 * light, and what there is of it to see when nothing is in front of it: `full` pixels of fire
 * within `r` pixels of its middle.
 */
interface Glow {
  light: Light;
  r: number;
  full: number;
}

/** A point of his canvas, as the bench has it. */
const shift = (v: V, ox: number, oy: number): V => [v[0] - ox, v[1] - oy];

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number): number => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------------------------
// Parts

/** The hem of the cape, torn into strips: where across it (0..1), and how far below the hem's line (+) or up into the cloth (-). */
const HEM: ReadonlyArray<readonly [number, number]> = [
  [0, 3], [0.07, -3], [0.16, 6], [0.25, -2], [0.34, 5], [0.44, -9], [0.53, 8], [0.63, 0], [0.72, 6], [0.82, -4], [0.91, 5], [1, 1],
];
/** Folds: where across the cape (0..1), how far down it they begin, how wide they are at the hem. */
const FOLDS: ReadonlyArray<readonly [number, number, number]> = [[0.25, 0.34, 3], [0.44, 0.2, 4], [0.63, 0.42, 3], [0.82, 0.28, 3]];

/**
 * The cape: from the shoulders to the heels, wider at the hem, the hem torn into strips. The
 * wind sends a wave down it and lifts the strips one after another; moving drags the hem out
 * behind him (to screen-left, and up the screen when he faces us).
 */
function cape(p: Px, back: boolean, Xs: number, hipX: number, top: number, Y: number, q: Pose, dl = 0, dr = 0): void {
  const ramp = back ? BLOOD : LINING;
  const drag = Math.max(0, q.drag);
  const ph = q.wind * Math.PI * 2;
  const amp = 1.5 + Math.min(2.5, drag) * 2.2;
  const hemY = Math.min(AY - 5, AY - 9 + Y) - drag * (back ? 2.5 : 6);
  const cx = (Xs + hipX) / 2 - drag * 9;
  const wide = 29 + drag * 2;
  const wave = (k: number): number => Math.sin(ph - k * 1.4) * amp * (k / 3);
  // (seen from a corner, the shoulder nearer us is lower and the further higher: `dl` and `dr` are
  // how far its two top corners have gone with them. Its hem hangs level, as a long garment's does.)
  const left: [V, V, V, V] = [
    [Xs - 20, top + dl],
    [Xs - 22 - drag * 2 + wave(1), top + 30 + dl * 0.5],
    [cx - wide + 5 + drag * 3 + wave(2), hemY - 30],
    [cx - wide + wave(3), hemY - drag * 3],
  ];
  const right: [V, V, V, V] = [
    [Xs + 20, top + dr],
    [Xs + 22 - drag * 3 + wave(1), top + 30 + dr * 0.5],
    [cx + wide - 6 - drag * 4 + wave(2), hemY - 30],
    [cx + wide - 2 + wave(3), hemY + 1],
  ];
  /** A point of the cloth: `f` of the way across it from its left edge, `t` of the way down it. (The kit's bezAt, for both edges at once.) */
  const at = (f: number, t: number): V => {
    const a = (1 - t) ** 3;
    const b = 3 * (1 - t) ** 2 * t;
    const c = 3 * (1 - t) * t ** 2;
    const d = t ** 3;
    const lx = a * left[0][0] + b * left[1][0] + c * left[2][0] + d * left[3][0];
    const ly = a * left[0][1] + b * left[1][1] + c * left[2][1] + d * left[3][1];
    const rx = a * right[0][0] + b * right[1][0] + c * right[2][0] + d * right[3][0];
    const ry = a * right[0][1] + b * right[1][1] + c * right[2][1] + d * right[3][1];
    return [lx + (rx - lx) * f, ly + (ry - ly) * f];
  };
  const flap = (f: number): number => Math.sin(ph + f * 10) * (1 + drag * 1.4);
  const pts: V[] = [];
  const N = 8;
  for (let i = 0; i < N; i++) pts.push(bezAt(left, i / N));
  for (const [f, d] of HEM) {
    const b = at(f, 1);
    pts.push([b[0] - drag * d * 0.4, b[1] + d + flap(f)]);
  }
  for (let i = N - 1; i >= 0; i--) pts.push(bezAt(right, i / N));
  if (back) {
    // it hangs from the two shoulders, and dips between them: the top of the back plate shows
    pts.push([Xs + 10, top + 5 + dl + (dr - dl) * 0.75], [Xs, top + 10 + (dl + dr) / 2], [Xs - 10, top + 5 + dl + (dr - dl) * 0.25]);
  }
  lit(p, ramp, [0, 3], [0, 4], (l) => l.poly(pts, INK));
  // the folds: each runs down into a tear of the hem, dark, with the light catching its far side
  for (const [f, t0, w] of FOLDS) {
    for (let k = 0; k <= 100; k++) {
      const t = t0 + (1 - t0) * (k / 100);
      const [fx, fy] = at(f + (0.5 - f) * 0.3 * (1 - t), t);
      const x = Math.round(fx);
      const y = Math.round(fy);
      const wd = Math.max(1, Math.round((w * (t - t0)) / (1 - t0)));
      for (let i = 0; i < wd; i++) if (p.has(x + i, y)) p.set(x + i, y, ramp[0]);
      if (t > t0 + 0.25 && p.has(x + wd, y) && p.has(x + wd + 1, y)) p.set(x + wd, y, ramp[3]);
    }
  }
  if (back) {
    // where it hangs between the shoulders it sags in swags
    for (const [drop, half] of [[17, 13], [25, 16]] as const) {
      for (let x = -half; x <= half; x++) {
        const y = Math.round(top + drop - (x * x * 7) / (half * half) + (dl + (dr - dl) * ((x + half) / (2 * half))) * 0.6);
        const xx = Math.round(Xs + x - drag * 1.5);
        if (p.has(xx, y) && p.has(xx, y + 2)) p.set(xx, y, ramp[0]);
        if (Math.abs(x) < half - 3 && p.has(xx, y + 1) && p.has(xx, y + 3)) p.set(xx, y + 1, ramp[3]);
      }
    }
  }
}

/** Where a foot is in its stride, for a leg twice as long as a hero's. */
interface Step {
  dx: number;
  dy: number;
  bend: number;
}
function stepOf(q: Pose, near: boolean, back: boolean): Step {
  const s = near ? q.near : q.far;
  const lift = near ? q.nearLift : q.farLift;
  // (a step forward goes down the screen when he faces us and up it when he faces away)
  // (and along the grid: two across for one down)
  return { dx: Math.round(s * 6.4) + 0, dy: Math.round(s * 3.2 * (back ? -1 : 1) - lift * 7) + 0, bend: lift * 3.6 };
}

/** The rows of a leg below the knee: how far it reaches behind its middle (the calf, the heel) and ahead of it (the shin, the toe). */
const SHIN_A = [5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6];
const SHIN_B = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 6, 8, 11, 13, 14];
const SHIN_B_BACK = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 5, 6, 7, 8, 8];

/** A knee cop: a plate with a point to it. L, M, D = light to dark. */
const COP = [
  '..LLLLLLLL..',
  '.LLLLMMMMMD.',
  'LLLMMMMMMMDD',
  'LLMMMMMMMMDD',
  'LMMMMMMMMDDD',
  '.MMMMMMMDDD.',
  '..MMMMMDDD..',
  '....MDDD....',
];

/**
 * One leg in plate, from the hip to a sabaton whose toe points to screen-right. (cx, top) is the
 * middle of its top row; (fx, sole) the middle of the ankle and the row the foot stands on. It is
 * a column of rows, each slid sideways (as the kit's legs are): the greave keeps its length, the
 * thigh takes up what is left, and the knee is pushed forward by `bend`. `inner` is the side the
 * other leg is on (+1 = screen-right).
 */
function plateLeg(p: Px, cx: number, top: number, fx: number, sole: number, bend: number, far: boolean, back: boolean, inner: number): void {
  const ramp = far ? SHADE : IRON;
  const mail = far ? MAIL_FAR : MAIL_NEAR;
  const lowTop = sole - SHIN + 1;
  const kneeX = (fx - cx) * 0.5 + bend;
  const slide = (y: number): number => {
    if (y <= lowTop) return Math.round((kneeX * (y - top)) / Math.max(1, lowTop - top));
    return Math.round(kneeX + ((fx - cx - kneeX) * (y - lowTop)) / Math.max(1, sole - lowTop));
  };
  const B = back ? SHIN_B_BACK : SHIN_B;
  // the thigh: mail (it narrows to the knee on its inner side)
  const thigh = (y: number): [number, number] => {
    const thin = y > top + 14 ? 2 : y > top + 7 ? 1 : 0;
    return [cx + slide(y) - 6 + (inner < 0 ? thin : 0), 12 - thin];
  };
  for (let y = top; y < lowTop; y++) {
    const [x0, w] = thigh(y);
    p.hline(x0, y, w, mail[2]).hline(x0, y, 2, mail[3]).hline(x0 + w - 3, y, 3, mail[1]);
    // (its links)
    if (((y - top) & 1) === 0) for (let x = x0 + 2 + (((y - top) >> 1) & 1); x < x0 + w - 3; x += 2) p.set(x, y, mail[1]);
  }
  // (his foot points along the grid: every two columns out from the ankle, the sabaton is a row
  // lower when he faces us, down the screen, and a row higher when he faces away)
  // (a gentler slope than the grid's own: a sabaton sunk five rows at the toe had its foot in the floor)
  const toe = (k: number): number => (k > 3 ? (back ? -1 : 1) * Math.floor((k - 1) / 3) : 0);
  // the greave and the sabaton: plate
  shade(p, cx + Math.round((kneeX + fx - cx) / 2) - TILE / 2, lowTop - 8, ramp, [0, 2], [1, 3], (l, x0, y0) => {
    for (let j = 0; j < SHIN; j++) {
      const xm = cx + slide(lowTop + j);
      if (j < SHIN - 6) l.rect(xm - SHIN_A[j] - x0, lowTop + j - y0, SHIN_A[j] + B[j], 1, INK);
      else for (let k = -SHIN_A[j]; k < B[j]; k++) l.set(xm + k - x0, lowTop + j + toe(k) - y0, INK);
    }
  });
  // the lip of the greave, the ankle, the sole
  const gx = cx + slide(lowTop + 3);
  p.hline(gx - 6, lowTop + 3, 11, ramp[0]);
  p.hline(gx - 5, lowTop + 4, 6, ramp[3]);
  const ax = cx + slide(sole - 6);
  p.hline(ax - 4, sole - 6, 8, ramp[0]);
  for (let k = -6; k < B[SHIN - 1]; k++) p.set(cx + slide(sole) + k, sole + toe(k), ramp[0]);
  // the plates of the sabaton
  if (!back) p.vline(cx + slide(sole - 2) + 6, sole - 3 + toe(6), 3, ramp[0]).vline(cx + slide(sole - 2) + 10, sole - 2 + toe(10), 2, ramp[0]);
  // the knee cop
  const kx = cx + slide(lowTop) + (back ? 0 : 1);
  ball(p, kx, lowTop + 0.5, 7.4, 5.4, SEAM);
  stamp(p, kx - 6, lowTop - 4, COP, { L: ramp[3], M: ramp[2], D: ramp[1] });
}

/** A strip of ragged red cloth hanging from the belt. */
const TORN = [5, 1, 0, 2, 6, 3, 0, 2];
function tabard(p: Px, x: number, top: number, len: number, drift: number, wind: number, blow: number): void {
  const snake = (t: number): number => Math.sin((wind - t * 0.6) * Math.PI * 2) * blow * t;
  const mid = (i: number): number => Math.round(x + drift * (i / len) ** 2 + snake(i / len));
  for (let i = 0; i <= len + 1; i++) for (let k = -5; k < 5; k++) if (i <= len + 1 - TORN[Math.max(0, Math.min(7, k + 4))]) p.set(mid(i) + k, top + i, INK);
  shade(p, x - TILE / 2, top - 4, BLOOD, [0, 2], [1, 3], (l, x0, y0) => {
    for (let i = 0; i <= len; i++) for (let k = -4; k < 4; k++) if (i <= len - TORN[k + 4]) l.set(mid(i) + k - x0, top + i - y0, INK);
  });
  for (let i = 3; i <= len - 3; i++) if (i % 7 !== 0) p.set(mid(i) + 1, top + i, BLOOD[0]);
}

/** Dots of a straight line between two points. */
function along(a: V, b: V, fn: (x: number, y: number) => void): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let i = 0; i <= n; i++) fn(Math.round(a[0] + ((b[0] - a[0]) * i) / n), Math.round(a[1] + ((b[1] - a[1]) * i) / n));
}

/**
 * A crack in the plate with the fire inside showing through: a line that smoulders, with a hotter
 * pixel where it turns. Hot, it burns gold to white and the iron round it glows. `at` puts a point
 * of the crack (in its own coordinates) on the canvas.
 */
function crack(p: Px, pts: ReadonlyArray<V>, at: (v: V) => V, heat: number, pulse: number, broad = false): void {
  const hot = heat > 0.3;
  if (broad && !hot) {
    // (a broad crack has depth: a darker lip along its lower side)
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = at(pts[i]);
      const b = at(pts[i + 1]);
      along([a[0], a[1] + 1], [b[0], b[1] + 1], (x, y) => {
        if (p.has(x, y)) p.set(x, y, FLAME[1]);
      });
    }
  }
  if (hot) {
    const halo = FLAME[heat > 0.7 ? 2 : 1];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = at(pts[i]);
      const b = at(pts[i + 1]);
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        along([a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], (x, y) => {
          if (p.has(x, y)) p.set(x, y, halo);
        });
      }
    }
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    along(at(pts[i]), at(pts[i + 1]), (x, y) => {
      if (p.has(x, y)) p.set(x, y, FLAME[heat > 0.7 ? 4 : hot ? 3 : 2]);
    });
  }
  for (let i = 1; i + 1 < pts.length; i += 2) {
    const [x, y] = at(pts[i]);
    if (p.has(x, y)) p.set(x, y, FLAME[hot ? 4 : pulse > 0.45 ? 3 : 2]);
  }
}

/** The great crack in the breastplate, shoulder to hip, and its forks. In pixels from the middle of the shoulder line. */
const CRACK_MAIN: ReadonlyArray<V> = [[-11, 3], [-7, 6], [-8, 9], [-2, 13], [-3, 15], [3, 18], [2, 20], [5, 21]];
const CRACK_FORK: ReadonlyArray<V> = [[-2, 13], [2, 11], [3, 8], [8, 5]];
const CRACK_TWIG: ReadonlyArray<V> = [[3, 18], [7, 17], [10, 18]];
/** Cracks over the shoulder blades, seen from behind. */
const CRACK_BACK_A: ReadonlyArray<V> = [[-9, 2], [-7, 4], [-8, 6], [-5, 8]];
const CRACK_BACK_B: ReadonlyArray<V> = [[8, 3], [6, 5], [7, 8], [4, 9]];

/** Half the width of the breastplate, row by row down from the shoulder line. */
const CHEST = [12, 15, 16, 17, 17, 17, 17, 17, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, 12, 11, 9];
/** Half the width of the plates over the hips, row by row down from under the belt. */
const FAULD = [12, 12, 13, 13, 14, 14, 14, 14, 13];

/** The gorget: the collar of plate the helm sits in. */
function gorget(p: Px, x: number, sy: number): void {
  p.rect(x - 9, sy - 3, 18, 5, IRON[2]);
  p.hline(x - 9, sy - 3, 16, IRON[3]).vline(x - 9, sy - 3, 4, IRON[3]);
  p.hline(x - 8, sy + 1, 17, IRON[1]).vline(x + 8, sy - 2, 4, IRON[1]);
}

/** What shows where the plate gapes at the waist: the spine and the ends of the lowest ribs. */
const RIBS = [
  'WWW...Ss...mmm',
  '.WWW..Ss..mmm.',
  '......dd......',
  'WWW...Ss...mmm',
  '.WWW..Ss..mmm.',
];

/** The same, seen from a corner: his spine is toward the side he faces, the ribs of his nearer side are long and those of his further short. */
const RIBS_TURNED = [
  'WWWW.....Ss.mm',
  '.WWWW....Ss.m.',
  '.........dd...',
  'WWWW.....Ss.mm',
  '.WWWW....Ss.m.',
];

/** The key at his belt, on its ring. W, M = bone, light and dark; K = the seam round it. */
const KEYS = [
  '..KMK...',
  '..KMK...',
  '.KKMKK..',
  'KKWWMKK.',
  'KWKKKMK.',
  'KWK.KMK.',
  'KWKKKMK.',
  'KKWMMKK.',
  '.KKWMK..',
  '..KWMKK.',
  '..KWMMK.',
  '..KWMKK.',
  '..KWMMK.',
  '..KKKKK.',
];

/**
 * The trunk, facing us: the hips in plate with a strip of red cloth between the tassets, a belt
 * with an ember in its buckle, the waist open on the spine, and the cracked breastplate.
 */
function trunkFront(p: Px, mid: (y: number) => number, sy: number, beltY: number, q: Pose, kneeL: number, kneeR: number, heat: number, pulse: number, face = 0): void {
  const m = mid(beltY + 6);
  // the tassets: a plate hanging over each thigh, swinging a little with its leg
  const tasset = (l: Px, grow: number, ox: number, oy: number): void => {
    for (const [side, k] of [[-1, kneeL], [1, kneeR]] as const) {
      // (seen from a corner the gap between them is not in the middle: the nearer plate is the broad one, the further the narrow)
      const more = face === 0 ? 0 : side < 0 ? 3 : -4;
      for (let r = -grow; r < 16 + grow; r++) {
        const rr = Math.max(0, Math.min(15, r));
        const w = (rr < 10 ? 11 : rr < 12 ? 10 : rr < 13 ? 8 : rr < 14 ? 6 : rr < 15 ? 4 : 2) + grow * 2 + more;
        if (w <= 0) continue;
        const x0 = (side < 0 ? m - 14 : m + 3) - grow;
        const sl = Math.round((k * rr) / 22);
        l.rect(x0 + sl + (side < 0 ? 0 : 11 + grow * 2 - w) - ox, beltY + 12 + r - oy, w, 1, INK);
      }
    }
  };
  tasset(p, 1, 0, 0);
  shade(p, m - TILE / 2, beltY, IRON, [0, 2], [0, 3], (l, x0, y0) => tasset(l, 0, x0, y0));
  // the plates over the hips
  for (let r = 0; r <= FAULD.length; r++) {
    const h = FAULD[Math.min(r, FAULD.length - 1)] + 1;
    p.rect(mid(beltY + 4 + r) - h, beltY + 4 + r, h * 2, 1, INK);
  }
  shade(p, m - TILE / 2, beltY, IRON, [0, 2], [0, 3], (l, x0, y0) => {
    for (let r = 0; r < FAULD.length; r++) l.rect(mid(beltY + 4 + r) - FAULD[r] - x0, beltY + 4 + r - y0, FAULD[r] * 2, 1, INK);
  });
  p.hline(m - 13, beltY + 8, 26, IRON[0]);
  p.hline(m - 13, beltY + 9, 11, IRON[3]);
  // the strip of cloth
  tabard(p, m + face, beltY + 4, 31, -q.swing * 2 - Math.min(2, q.drag) * 2.5, q.wind, 1 + Math.min(1.5, q.drag) * 1.2);
  // the jailer's key: it hangs on its ring from the belt, over the nearer hip, and swings as he goes
  const kx = m - 10 + Math.round(-q.swing * 1.5 + Math.sin(q.wind * Math.PI * 2) * 0.6);
  stamp(p, kx - 3, beltY + 4, KEYS, { K: INK, W: BONE[3], M: BONE[2] });
  // the belt, and the ember in its buckle
  const bx = mid(beltY);
  p.rect(bx - 11, beltY, 22, 4, PLUM[2]);
  p.hline(bx - 11, beltY, 22, PLUM[3]).hline(bx - 11, beltY + 3, 22, PLUM[1]);
  stamp(p, bx - 2 + face, beltY, ['GYy', 'YVz', 'yzZ', '.z.'], { G: FLAME[4], Y: FLAME[3], y: FLAME[2], z: FLAME[1], Z: FLAME[0], V: heat > 0.5 ? FLAME[4] : FLAME[3] });
  // the waist: nothing but the dark, the spine and four ribs
  const wx = mid(beltY - 3) + Math.round(face * 0.4);
  p.rect(wx - 8, beltY - 6, 16, 6, INK);
  stamp(p, wx - 7, beltY - 6, face === 0 ? RIBS : RIBS_TURNED, { W: BONE[3], m: BONE[2], S: BONE[3], s: BONE[2], d: BONE[1] });
  // the breastplate
  shade(p, mid(sy + 10) - TILE / 2, sy - 4, IRON, [0, 3], [0, 5], (l, x0, y0) => {
    for (let r = 0; r < CHEST.length; r++) l.rect(mid(sy + r) - CHEST[r] - x0, sy + r - y0, CHEST[r] * 2, 1, INK);
  });
  // (its broken lower edge)
  const ex = mid(sy + 20);
  p.set(ex - 7, sy + 20, INK).set(ex - 6, sy + 20, INK).set(ex + 5, sy + 20, INK).set(ex + 6, sy + 20, INK).set(ex + 6, sy + 19, INK);
  // a seam across it, and the lip of the plate below catching the light
  for (let x = -15; x <= 15; x++) {
    const y = sy + 12 + (Math.abs(x) > 9 ? -1 : 0);
    if (p.has(mid(y) + x, y)) p.set(mid(y) + x, y, IRON[0]);
    if (x < -2 && x > -13) p.set(mid(y) + x, y + 1, IRON[3]);
  }
  gorget(p, mid(sy) + Math.round(face * 0.4), sy);
  // the cracks
  const at = (v: V): V => [mid(sy + v[1]) + v[0] + Math.round(face * 0.4), sy + v[1]];
  crack(p, CRACK_TWIG, at, heat, pulse);
  crack(p, CRACK_FORK, at, heat, pulse);
  crack(p, CRACK_MAIN, at, heat, pulse, true);
}

/** The trunk from behind: the back plate with its ridge and two cracks, the waist, the hips. (The cape hides most of it.) */
function trunkBack(p: Px, mid: (y: number) => number, sy: number, beltY: number, heat: number, pulse: number, face = 0): void {
  shade(p, mid(beltY + 10) - TILE / 2, beltY, IRON, [0, 2], [0, 3], (l, x0, y0) => {
    for (let r = 0; r < FAULD.length + 6; r++) {
      const h = r < FAULD.length ? FAULD[r] : 14;
      l.rect(mid(beltY + 4 + r) - h - x0, beltY + 4 + r - y0, h * 2, 1, INK);
    }
  });
  const bx = mid(beltY);
  p.rect(bx - 10, beltY - 6, 20, 6, SHADE[2]);
  p.rect(bx - 11, beltY, 22, 4, PLUM[2]);
  p.hline(bx - 11, beltY, 22, PLUM[3]).hline(bx - 11, beltY + 3, 22, PLUM[1]);
  shade(p, mid(sy + 10) - TILE / 2, sy - 4, IRON, [0, 3], [0, 5], (l, x0, y0) => {
    for (let r = 0; r < CHEST.length; r++) l.rect(mid(sy + r) - CHEST[r] - x0, sy + r - y0, CHEST[r] * 2, 1, INK);
  });
  for (let r = 1; r < CHEST.length; r++) p.set(mid(sy + r) - 1 + face, sy + r, IRON[3]).set(mid(sy + r) + face, sy + r, IRON[0]);
  gorget(p, mid(sy) + Math.round(face * 0.4), sy);
  const at = (v: V): V => [mid(sy + v[1]) + v[0], sy + v[1]];
  crack(p, CRACK_BACK_A, at, heat, pulse);
  crack(p, CRACK_BACK_B, at, heat, pulse);
}

/**
 * A horn of the helm: a great horn of bone set in an iron socket at the temple, out and up.
 * `side` is the way it grows: +1 to screen-right. The one on the far side of the helm is in shade.
 */
function horn(p: Px, bx: number, by: number, side: number, far: boolean): void {
  const curve = (x0: number, y0: number): [V, V, V, V] => [[bx - x0, by - y0], [bx + side * 12 - x0, by + 3 - y0], [bx + side * 14 - x0, by - 11 - y0], [bx + side * 7 - x0, by - 19 - y0]];
  const pts = curve(0, 0);
  shade(p, bx - TILE / 2, by - 40, far ? BONE_FAR : BONE, [0, 1], [0, 2], (l, x0, y0) => stroke(l, curve(x0, y0), (t) => 4 - 3.4 * t, 44));
  // the socket
  const [sx, sy] = bezAt(pts, 0.13);
  limb(p, bx, by, sx, sy, 4.6, 4.4, far ? SHADE : IRON);
}

/** Half the width of the helm's dome, row by row down from its top. */
const DOME = [4, 7, 9, 10, 11, 11, 11, 11];

/** The skull in the helm. W, M, D = bone, light to dark; K = the dark; E, e = an eye and its hot heart; '.' = what is behind. */
const SKULL = [
  'WWWWWWWWMMMMMMMD',
  'WKKKKWWWMMMKKKMD',
  'WKKKKKWMMKKKKKMD',
  'WKKKeEWMMKKKeEMD',
  'WWKKEEWMMKKKEEDD',
  '.WWKKWWMMMKKKDD.',
  '.WWWWWKKMMMMMDD.',
  '.WWWWKKKMMMMMD..',
  '..WWWWWWMMMMDD..',
  '..WKWKWKWKMKMK..',
  '..KKKKKKKKKKKK..',
  '..WKWKWKMKMKMD..',
  '...WWWWMMMMDD...',
  '....WWMMMMDD....',
];
/** A row of the open mouth. z, y = the fire in it. */
const THROAT = '..KKzyyyyyzKK...';

/**
 * The head, facing us: a horned helm, open at the front over the skull. (hx, ty) is the middle of
 * the helm's top row. The face is turned a little to screen-right, as he is.
 */
function headFront(p: Px, hx: number, ty: number, heat: number, pulse: number): Glow[] {
  const glows: Glow[] = [];
  // (seen from a corner: the horn on his further side stands higher, the nearer a little lower)
  horn(p, hx + 9, ty + 6, 1, true);
  horn(p, hx - 10, ty + 9, -1, false);
  shade(p, hx - TILE / 2, ty - 8, IRON, [0, 2], [0, 3], (l, x0, y0) => {
    const x = hx - x0;
    const y = ty - y0;
    for (let r = 0; r < DOME.length; r++) l.rect(x - DOME[r], y + r, DOME[r] * 2, 1, INK);
    // the brow, and what is left of a nasal bar; the cheek plates, flaring to their points
    l.rect(x - 11, y + 8, 22, 3, INK);
    l.rect(x, y + 11, 2, 2, INK);
    l.rect(x - 11, y + 11, 4, 7, INK);
    l.rect(x - 12, y + 18, 5, 3, INK);
    l.rect(x - 11, y + 21, 3, 2, INK);
    l.rect(x + 9, y + 11, 2, 7, INK);
    l.rect(x + 9, y + 18, 3, 3, INK);
    l.rect(x + 9, y + 21, 2, 2, INK);
  });
  p.hline(hx - 11, ty + 8, 13, IRON[3]).hline(hx - 10, ty + 10, 20, IRON[0]);
  p.vline(hx - 1, ty, 8, IRON[3]).vline(hx, ty + 1, 7, IRON[0]);
  // the face: the jaw drops as he burns hotter, and there is fire in his throat
  const gape = heat > 0.75 ? 2 : heat > 0.4 ? 1 : 0;
  const key = { W: BONE[3], M: BONE[2], D: BONE[1], K: INK, E: heat > 0.6 ? FLAME[3] : SOCKET, e: heat > 0.6 ? FLAME[4] : SOCKET, z: FLAME[1], y: FLAME[heat > 0.9 ? 3 : 2] };
  // (his skull is turned with him, TURN_FACE toward the side he faces: the further socket is at the edge of the helm's opening, and cut by it)
  const cut = (rows: readonly string[]): string[] => rows.map((r) => r.slice(0, r.length - TURN_FACE));
  const fx = hx + TURN_FACE;
  p.rect(hx - 7, ty + 11, 16, 12 + gape, INK);
  stamp(p, fx - 7, ty + 11, cut(SKULL.slice(0, 11)), key);
  for (let g = 0; g < gape; g++) stamp(p, fx - 7, ty + 22 + g, cut([THROAT]), key);
  stamp(p, fx - 7, ty + 22 + gape, cut(SKULL.slice(11)), key);
  p.rect(fx - 1, ty + 11, 4, 3, INK).rect(fx, ty + 11, 2, 2, IRON[2]).vline(fx, ty + 11, 2, IRON[3]);
  for (const ex of [fx - 2, fx + 6]) glows.push({ light: { x: ex, y: ty + 15, r: 5 + heat * 3, color: SOCKET, a: 0.5 + heat * 0.2 }, r: 2, full: 4 });
  // a crack in the dome
  crack(p, [[4, 2], [6, 4], [5, 6], [8, 9]], (v) => [hx + v[0], ty + v[1]], heat, pulse, true);
  glows.push({ light: { x: hx + 6, y: ty + 5, r: 6 + heat * 5, color: FLAME[2], a: 0.3 + heat * 0.3 }, r: 3, full: 6 });
  return glows;
}

/** The head from behind: the dome, the ridge down it, the guard over the neck, and at the edge he faces a sliver of the skull. */
function headBack(p: Px, hx: number, ty: number, heat: number, pulse: number): Glow[] {
  const glows: Glow[] = [];
  horn(p, hx - 9, ty + 6, -1, true);
  horn(p, hx + 10, ty + 9, 1, false);
  shade(p, hx - TILE / 2, ty - 8, IRON, [0, 2], [0, 3], (l, x0, y0) => {
    const x = hx - x0;
    const y = ty - y0;
    for (let r = 0; r < DOME.length; r++) l.rect(x - DOME[r], y + r, DOME[r] * 2, 1, INK);
    l.rect(x - 11, y + 8, 22, 9, INK);
    // the guard over the neck: a plate of its own, flaring (the row left between is the seam)
    for (let r = 0; r < 5; r++) l.rect(x - 12 - (r > 1 ? 1 : 0), y + 18 + r, 24 + (r > 1 ? 2 : 0), 1, INK);
  });
  // (the ridge down the dome: away from the side he faces, as the ridge of his back is)
  p.vline(hx - 4, ty + 1, 16, IRON[3]).vline(hx - 3, ty + 2, 15, IRON[0]);
  p.hline(hx - 10, ty + 20, 12, IRON[2]).hline(hx - 10, ty + 21, 6, IRON[2]);
  // he looks away to screen-right: the edge of the cheek and the jaw, and the light of an eye
  p.rect(hx + 8, ty + 10, 3, 9, INK);
  p.vline(hx + 10, ty + 11, 2, BONE[3]).vline(hx + 10, ty + 15, 3, BONE[2]).vline(hx + 9, ty + 16, 3, BONE[2]).set(hx + 10, ty + 13, heat > 0.6 ? FLAME[3] : SOCKET);
  glows.push({ light: { x: hx + 11, y: ty + 13, r: 5 + heat * 3, color: SOCKET, a: 0.45 + heat * 0.2 }, r: 2, full: 1 });
  crack(p, [[-5, 3], [-3, 5], [-4, 8], [-2, 10]], (v) => [hx + v[0], ty + v[1]], heat, pulse, true);
  glows.push({ light: { x: hx - 4, y: ty + 6, r: 6 + heat * 5, color: FLAME[2], a: 0.3 + heat * 0.3 }, r: 3, full: 6 });
  return glows;
}

/** A shoulder plate: two lames, one under the other, and a spike that leans the way `out` points. */
function pauldron(p: Px, cx: number, cy: number, big: boolean, out: number, ramp: Ramp): void {
  const rx = big ? 10 : 8.6;
  const ry = big ? 7.4 : 6.6;
  const lame = (x: number, y: number, a: number, b: number): void => {
    ball(p, x, y, a + 1, b + 1, SEAM);
    ball(p, x, y, a, b, ramp);
    // its lip: a rolled edge along the bottom that catches the light on the side it comes from
    for (let k = 0; k <= 40; k++) {
      const t = Math.PI * (0.08 + (0.84 * k) / 40);
      const lx = Math.floor(x + Math.cos(t) * (a - 1.3));
      const ly = Math.floor(y + Math.sin(t) * (b - 1.3));
      if (p.has(lx, ly)) p.set(lx, ly, ramp[Math.cos(t) < 0.1 ? 3 : 2]);
    }
  };
  lame(cx + out * 1.2, cy + 5, rx - 1.6, ry - 1.4);
  // the spike
  limb(p, cx + out * 2.5, cy - ry + 3, cx + out * 8, cy - ry - 10, 4.2, 1.3, SEAM);
  limb(p, cx + out * 2.5, cy - ry + 3, cx + out * 8, cy - ry - 9, 3.2, 0.5, ramp);
  // (the light along its upper edge)
  p.line(cx + out * 2.5 - 2, cy - ry + 1, cx + out * 8 - 1, cy - ry - 8, ramp[3]);
  lame(cx, cy, rx, ry);
}

/**
 * Where the elbow is. `side` picks which way it bends: -1 to screen-left, +1 to screen-right.
 * While the hand is below the shoulder the elbow stands off the line from shoulder to hand by a
 * few pixels at most, however sharply the arm is bent (more than that, and it points at the
 * camera or away from it). A hand raised over the shoulder puts the elbow out to the side.
 */
function elbowOf(s: V, h: V, side: number): V {
  const dx = h[0] - s[0];
  const dy = h[1] - s[1];
  const d = Math.hypot(dx, dy) || 0.001;
  const reach = UPPER + FORE;
  if (d >= reach) return [s[0] + (dx * UPPER) / reach, s[1] + (dy * UPPER) / reach];
  const a = (UPPER * UPPER - FORE * FORE + d * d) / (2 * d);
  const up = smooth((s[1] - h[1] + 4) / 14);
  const off = Math.min(9 + up * 10, Math.sqrt(Math.max(0, UPPER * UPPER - a * a)));
  const k = Math.max(0.3, Math.min(0.7, a / d));
  // (the two places it could be: either side of the line)
  const ex = -dy / d;
  const ey = dx / d;
  const pick = ex * side >= 0 ? 1 : -1;
  return [s[0] + dx * k + ex * off * pick, s[1] + dy * k + ey * off * pick];
}

/** An arm above the elbow. */
function upperArm(p: Px, s: V, e: V, ramp: Ramp): void {
  limb(p, s[0], s[1], e[0], e[1], 5.6, 5, ramp);
}

/** An arm below the elbow: the elbow cop, the vambrace, and the bones of the wrist where the plate stops. */
function foreArm(p: Px, e: V, h: V, ramp: Ramp, bone: Ramp): void {
  const d = Math.hypot(h[0] - e[0], h[1] - e[1]) || 1;
  const k = Math.max(0, 1 - 5 / d);
  const wx = e[0] + (h[0] - e[0]) * k;
  const wy = e[1] + (h[1] - e[1]) * k;
  limb(p, wx, wy, h[0], h[1], 1.8, 1.8, bone);
  limb(p, e[0], e[1], wx, wy, 5.6, 4.2, ramp);
  // the cuff of the vambrace: a line across it below the elbow, and one above the wrist
  const ux = (h[0] - e[0]) / d;
  const uy = (h[1] - e[1]) / d;
  for (const [at, r, tone] of [[5, 5.2, ramp[0]], [d - 6.5, 3.8, ramp[3]]] as const) {
    if (at > d - 5.5 && tone === ramp[0]) continue;
    for (let k = -r; k <= r; k += 0.5) {
      const x = Math.floor(e[0] + ux * at - uy * k);
      const y = Math.floor(e[1] + uy * at + ux * k);
      if (p.has(x, y)) p.set(x, y, tone);
    }
  }
}

/** A fist of bare bone closed on the shaft: the fingers lie across it, side by side. (dx, dy) is the way the shaft runs. */
function fist(p: Px, hx: number, hy: number, dx: number, dy: number, r: Ramp): void {
  const x0 = Math.round(hx);
  const y0 = Math.round(hy);
  for (let oy = -3; oy <= 3; oy++) {
    for (let ox = -3; ox <= 3; ox++) {
      if (Math.abs(ox) + Math.abs(oy) > 5) continue;
      // the gaps between the fingers: two dark lines across the shaft
      const u = ox * dx + oy * dy;
      const gap = Math.abs(Math.abs(u) - 1.5) < 0.5;
      p.set(x0 + ox, y0 + oy, gap ? r[1] : ox + oy < -2 ? r[3] : ox + oy > 3 ? r[1] : r[2]);
    }
  }
}

/** An open hand of bone, its fingers spread round the way `deg` points. */
function openHand(p: Px, hx: number, hy: number, deg: number, r: Ramp): void {
  const x = Math.round(hx);
  const y = Math.round(hy);
  const [ux, uy] = dir(deg);
  // four fingers and a thumb: each two bones, the first the stouter, the second in shade
  for (const [da, len] of [[-40, 7], [-14, 9], [10, 9], [34, 7], [-88, 5]] as const) {
    const [fx, fy] = dir(deg + da);
    const k: V = [x + ux * 2 + fx * (2 + len * 0.55), y + uy * 2 + fy * (2 + len * 0.55)];
    limb(p, x + ux * 2 + fx * 2, y + uy * 2 + fy * 2, k[0], k[1], 1.2, 0.9, r);
    p.line(k[0], k[1], x + ux * 2 + fx * (2 + len), y + uy * 2 + fy * (2 + len), r[2]);
  }
  // the palm
  for (let oy = -3; oy <= 3; oy++) {
    for (let ox = -3; ox <= 3; ox++) {
      if (Math.abs(ox) + Math.abs(oy) > 5) continue;
      p.set(x + ox, y + oy, ox + oy < -2 ? r[3] : ox + oy > 3 ? r[1] : r[2]);
    }
  }
}

/** A flame: a teardrop with a bright heart, its tip leaning with `lean`. `base` is the row it stands on. */
function flame(p: Px, cx: number, base: number, h: number, lean: number): void {
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, h * 0.3 * Math.sin(Math.PI * (0.22 + t * 0.78)) ** 0.8 * (1 - t * 0.35));
    const m = cx + lean * t * t * 2.2;
    for (let x = Math.floor(m - hw); x < Math.ceil(m + hw); x++) {
      const d = Math.abs(x + 0.5 - m) / hw;
      if (d > 1) continue;
      p.set(x, base - i, d < 0.5 && t < 0.5 ? FLAME[4] : d < 0.8 && t < 0.78 ? FLAME[3] : FLAME[2]);
    }
  }
}

/** The rune cut in the maul's face: a lozenge round a point, an eye that does not shut. In the head's own terms: across the shaft, then along it. */
const RUNE: ReadonlyArray<V> = [[0, -6.5], [5.5, 0], [0, 6.5], [-5.5, 0], [0, -6.5]];

/** Which tone of the iron a pixel of the head was shaded (of two tones alike, the lighter). */
const IRON_TONE = new Map<number, number>(IRON.map((c, i) => [word(c), i]));

function distTo(a: number, b: number, pts: ReadonlyArray<V>): number {
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const ax = pts[i][0];
    const ay = pts[i][1];
    const dx = pts[i + 1][0] - ax;
    const dy = pts[i + 1][1] - ay;
    const t = clamp01(((a - ax) * dx + (b - ay) * dy) / (dx * dx + dy * dy));
    best = Math.min(best, Math.hypot(a - ax - t * dx, b - ay - t * dy));
  }
  return best;
}

/**
 * The maul: a long shaft of dark wood bound in iron, and a huge block of a head with a rune cut
 * in its face. `r` is the hand at the butt, (dx, dy) the way the shaft runs from there to the
 * head, `seen` how much of the shaft's length shows (hoisted up and back it points away from us,
 * or at us, and looks shorter), `spike` how much of the spike beyond the head. The rune smoulders;
 * hot, it and the edges of the head burn bright. Returns the middle of the head.
 */
function maul(p: Px, r: V, dx: number, dy: number, seen: number, spike: number, heat: number, pulse: number): V {
  const nx = -dy;
  const ny = dx;
  const c: V = [r[0] + dx * REACH * seen, r[1] + dy * REACH * seen];
  const butt: V = [r[0] - dx * BUTT * seen, r[1] - dy * BUTT * seen];
  const len = (REACH + BUTT) * seen + HEAD_T / 2;
  // which side of the shaft faces the light
  const side = nx * -0.52 + ny * -0.62 > 0 ? 1 : -1;
  const ex = butt[0] + dx * len;
  const ey = butt[1] + dy * len;
  for (let y = Math.floor(Math.min(butt[1], ey) - 4); y <= Math.ceil(Math.max(butt[1], ey) + 4); y++) {
    for (let x = Math.floor(Math.min(butt[0], ex) - 4); x <= Math.ceil(Math.max(butt[0], ex) + 4); x++) {
      const qx = x + 0.5 - butt[0];
      const qy = y + 0.5 - butt[1];
      const s = qx * dx + qy * dy;
      const v = (qx * nx + qy * ny) * side;
      if (s < -1.5 || s > len) continue;
      // the pommel, the bands, the cap past the head: iron; the rest wood
      const w = s / seen;
      const iron = s < 3 || (w > 19 && w < 22) || (w > 37 && w < 40) || s > len - HEAD_T - 7;
      const half = iron ? 3 : 2;
      if (Math.abs(v) > half) continue;
      const ramp = iron ? WORN : INDIGO;
      p.set(x, y, ramp[v > half - 1 ? 3 : v < 1 - half ? 1 : 2]);
    }
  }
  // the head: a block, a band at each end (the striking faces: iron worn bright), a spike beyond it
  const hl = HEAD_L / 2;
  const ht = HEAD_T / 2;
  if (spike > 1) limb(p, c[0] + dx * (ht - 1), c[1] + dy * (ht - 1), c[0] + dx * (ht + spike), c[1] + dy * (ht + spike), 3.4, 0.6, WORN);
  shade(p, Math.round(c[0]) - TILE / 2, Math.round(c[1]) - TILE / 2, IRON, [0, 2], [0, 4], (l, x0, y0) => {
    const corner = (a: number, b: number): V => [c[0] + nx * a + dx * b - x0, c[1] + ny * a + dy * b - y0];
    l.poly([corner(-hl + 4, -ht), corner(hl - 4, -ht), corner(hl - 4, ht), corner(-hl + 4, ht)], INK);
    for (const e of [-1, 1]) {
      l.poly([corner(e * hl, -ht), corner(e * (hl - 1), -ht - 1), corner(e * (hl - 5), -ht - 1), corner(e * (hl - 5), ht + 1), corner(e * (hl - 1), ht + 1), corner(e * hl, ht)], INK);
    }
  });
  const glow = FLAME[heat > 0.75 ? 4 : heat > 0.3 ? 3 : 2];
  const painted = words(p);
  for (let y = Math.floor(c[1] - 20); y <= Math.ceil(c[1] + 20); y++) {
    for (let x = Math.floor(c[0] - 20); x <= Math.ceil(c[0] + 20); x++) {
      const qx = x + 0.5 - c[0];
      const qy = y + 0.5 - c[1];
      const a = qx * nx + qy * ny;
      const b = qx * dx + qy * dy;
      if (Math.abs(a) > hl || Math.abs(b) > ht + 1 || !p.inside(x, y)) continue;
      const tone = IRON_TONE.get(painted[y * p.w + x]);
      if (tone === undefined) continue;
      const aa = Math.abs(a);
      if (aa >= hl - 5) {
        // a band: where it meets the block, its rivets
        p.set(x, y, aa < hl - 4 ? IRON[0] : aa >= hl - 3.4 && aa < hl - 2 && Math.abs(Math.abs(b) - 5) < 0.75 ? WORN[0] : WORN[tone]);
        // hot, the edges of the striking faces burn
        if (heat > 0.4 && aa > hl - 1.6) p.set(x, y, FLAME[heat > 0.8 ? 3 : 2]);
        else if (heat > 0.6 && aa > hl - 2.8) p.set(x, y, FLAME[1]);
        continue;
      }
      // the rune
      const d = Math.min(distTo(a, b, RUNE), Math.hypot(a, b) - 0.6);
      if (d < 0.95) p.set(x, y, Math.hypot(a, b) < 1.6 && heat < 0.3 && pulse > 0.5 ? FLAME[3] : glow);
      else if (d < 1.9 && heat > 0.2) p.set(x, y, FLAME[heat > 0.5 ? 2 : 1]);
      else if (d < 2.8 && heat > 0.7) p.set(x, y, FLAME[1]);
    }
  }
  return c;
}

/**
 * Embers: sparks that leave a crack, rise and go out. Each lives through one round of `wind`,
 * the next starting a part of a round after it. `n` of them leave (x, y); they rise `rise` pixels.
 */
function embers(p: Px, x: number, y: number, n: number, rise: number, wind: number, seed: number): void {
  for (let k = 0; k < n; k++) {
    const t = (((wind + k / n + seed * 0.37) % 1) + 1) % 1;
    if (t > 0.72) continue;
    const ex = Math.round(x + Math.sin((t * 1.7 + k * 0.9 + seed) * Math.PI) * 2.2 + t * 3 + ((k * 5 + seed * 3) % 5) - 2);
    const ey = Math.round(y - 2 - t * rise);
    const c = FLAME[t < 0.22 ? 4 : t < 0.5 ? 3 : 2];
    p.set(ex, ey, c);
    if (t < 0.5) p.set(ex, ey + 1, FLAME[t < 0.22 ? 3 : 2]);
  }
}

/** The colours of what gives off light, as pixels' numbers. */
const FIRE = new Set<number>([SOCKET, ...FLAME].map((c) => word(c)));

/**
 * How much of a glow shows in a finished frame (0..1): how many pixels of fire there are round
 * its middle, against how many there should be. (An arm or the cape may be in front of it.)
 */
function shows(p: Px, g: Glow): number {
  const painted = words(p);
  const { x, y } = g.light;
  let n = 0;
  for (let j = Math.round(y - g.r); j <= Math.round(y + g.r); j++) {
    for (let i = Math.round(x - g.r); i <= Math.round(x + g.r); i++) {
      if (p.inside(i, j) && FIRE.has(painted[j * p.w + i])) n++;
    }
  }
  return Math.min(1, n / g.full);
}

// ---------------------------------------------------------------------------------------------
// The rig

/**
 * How far the body has sunk, in pixels. A hero's chest sinks one pixel for half of the standing
 * loop; his sinks two, with a frame at one on the way down and on the way up, so that so big a
 * thing breathes slowly and not in a jerk.
 */
function sink(q: Pose): number {
  if (q.drag === 0 && q.near === 0 && q.far === 0) {
    const w = q.wind - Math.floor(q.wind);
    if ((q.bob === 0 && w > 0.4 && w < 0.5) || (q.bob === 1 && w > 0.9)) return 1;
  }
  return Math.round(q.bob * 2);
}

/**
 * His parts, each on a sheet of its own (new ones, not the frame's layers): what `jailer` hands
 * over when it is asked to, for his death (art/death.ts), in which he comes apart.
 */
interface WardenParts {
  cape: Px;
  maul: Px;
  /** Both legs; the column between them is `hipX`. */
  legs: Px;
  /** The breastplate and the plates over the hips; the row between them is `beltY`. */
  trunk: Px;
  /** The helm, its horns, and the skull in it. */
  head: Px;
  /** The arm on the screen's left and the one on its right, shoulder to fist; and the plates of those shoulders. */
  armL: Px;
  armR: Px;
  plateL: Px;
  plateR: Px;
  hipX: number;
  beltY: number;
}

function jailer(q: Pose, back: boolean, take?: (parts: WardenParts) => void): Painted {
  taken = 0;
  const lights: Light[] = [];
  const glows: Glow[] = [];
  const Y = sink(q);
  // (moving, he leans into it a little)
  const lean = q.lean + Math.min(1, Math.max(0, q.drag)) * 0.8;
  const hipX = AX + Math.round(lean * 0.7);
  const Xs = AX + Math.round(lean * 2);
  const sy = AY - SHOULDER + Y;
  const hipY = AY - HIP + Y;
  const beltY = AY - BELT + Y;
  /** The middle of the trunk at a row: a lean shears it from the hips to the shoulders. */
  const mid = (y: number): number => Math.round(Xs + (hipX - Xs) * clamp01((y - sy) / (hipY - sy)));
  const heat = clamp01(q.act);
  const pulse = (1 - Math.cos(q.wind * Math.PI * 2)) / 2;
  /** Hot, his fires gutter: a quick flicker in the lights they give off. */
  const gutter = Math.sin(q.wind * 75) * heat;
  const sway = q.swing;
  /** The side nearer the camera: screen-left facing us, screen-right facing away. */
  const near = back ? 1 : -1;

  // --- the maul and the two hands ---
  // planted (the volley), it stands on the floor and does not move with the body
  const loose = q.prop === 1 ? clamp01(q.off) : 0;
  const carry = Math.round((Xs + hipX) / 2) - AX;
  const rear: V = [
    Math.round(AX - 8 + carry * (1 - loose) + q.hx + sway * 1.2),
    Math.round(AY - 60 + (Y + Math.round(Math.abs(sway))) * (1 - loose) + q.hy),
  ];
  const [dx, dy] = dir(q.aim);
  // (hoisted up and back, the maul tips away from where he faces: less of its length shows, and
  // the hand that guides it slides down the shaft to the one at the butt)
  const turn = ((((q.aim + 180) % 360) + 360) % 360) - 180;
  const tip = smooth((turn - 20) / 65);
  const seen = 1 - 0.42 * tip;
  const spread = SPREAD - 12 * tip;
  const onShaft: V = [rear[0] + dx * spread, rear[1] + dy * spread];
  const raised: V = [Xs + 27 + q.ohx, sy - 24 + q.ohy];
  // (the hand that leaves the shaft goes out to the side on its way up, clear of his face)
  const lead: V = [onShaft[0] + (raised[0] - onShaft[0]) * loose + Math.sin(loose * Math.PI) * 16, onShaft[1] + (raised[1] - onShaft[1]) * loose];

  // --- the arms: the hand at the butt is the screen-left arm's in both views, the other the screen-right's ---
  // (leaning, the shoulder he leans toward dips and the other rises; a stride rocks them)
  const tilt = Math.max(-3, Math.min(3, lean * 0.55)) + sway * 1.2;
  // SEEN FROM A CORNER (kit.ts, "Turned to the grid"): the corner of his trunk nearest us is where
  // everything that runs across him is lowest; his nearer shoulder is lower and his further higher.
  const grid = slant(Math.round((Xs + hipX) / 2) + (back ? CORNER_BACK : CORNER_FRONT), CORNER_DROP);
  const dL = near < 0 ? NEAR_DROP : -FAR_RISE;
  const dR = near > 0 ? NEAR_DROP : -FAR_RISE;
  const sL: V = [Xs - SPAN, sy + 4 - (back ? 1 : 0) - tilt + dL];
  const sR: V = [Xs + SPAN, sy + 4 - (back ? 0 : 1) + tilt + dR];
  const eL = elbowOf(sL, rear, -1);
  const eR = elbowOf(sR, lead, 1);
  const rampL = back ? SHADE : IRON;
  const rampR = back ? IRON : SHADE;
  const boneL = back ? BONE_FAR : BONE;
  const boneR = back ? BONE : BONE_FAR;
  /** An arm is raised when its elbow is above its shoulder: it lifts its shoulder plate, and facing us (the arm of the volley) it is in front of the helm and its horns. */
  const upL = eL[1] < sL[1] - 5;
  const upR = eR[1] < sR[1] - 5;

  // --- the head ---
  const hx = Xs + Math.round(lean * 0.6) + (back ? 0 : 1);
  const ty = AY - CROWN + Y + (lean > 2 ? Math.round((lean - 2) * 1.2) : 0);

  // --- paint ---
  const capeL = px();
  cape(capeL, back, Xs, hipX, sy + 2, Y, q, dL, dR);

  const maulL = px();
  // (planted, the spike on its head is in the floor)
  const head = maul(maulL, rear, dx, dy, seen, 7 * (1 - loose), heat, pulse);

  const body = px();
  const crouch = Y * 0.45;
  const stepN = stepOf(q, true, back);
  const stepF = stepOf(q, false, back);
  const topN = hipX + near * 8;
  const topF = hipX - near * 8;
  const footN = AX + near * 12 + stepN.dx;
  const footF = AX - near * 11 + stepF.dx;
  // (his nearer foot is lower on the screen and his further higher; his hips a little with them)
  plateLeg(body, topF, hipY - 1, footF, AY - 3 - FOOT_FAR + stepF.dy, stepF.bend + crouch, true, back, near);
  plateLeg(body, topN, hipY + 1, footN, AY - 1 + FOOT_NEAR + stepN.dy, stepN.bend + crouch, false, back, -near);
  const kneeN = (footN - topN) * 0.5 + stepN.bend + crouch;
  const kneeF = (footF - topF) * 0.5 + stepF.bend + crouch;
  // (for his death: the legs before the trunk is laid on them)
  const legsOnly = take ? new Px(W, H).blit(body, 0, 0) : null;
  // (the trunk is painted square-on, on a sheet of its own, and then every column of it is slid
  // down or up so that what ran level across it runs along the grid)
  const trunk = px();
  if (back) trunkBack(trunk, mid, sy, beltY, heat, pulse, -TURN_MID);
  else trunkFront(trunk, mid, sy, beltY, q, kneeN, kneeF, heat, pulse, TURN_MID);
  shear(trunk, grid, body);

  // his smaller parts: each is painted when its turn in the stack comes
  const armL: Part = { x: (sL[0] + eL[0]) / 2, y: (sL[1] + eL[1]) / 2, paint: (b, ox, oy) => upperArm(b, shift(sL, ox, oy), shift(eL, ox, oy), rampL) };
  const armR: Part = { x: (sR[0] + eR[0]) / 2, y: (sR[1] + eR[1]) / 2, paint: (b, ox, oy) => upperArm(b, shift(sR, ox, oy), shift(eR, ox, oy), rampR) };
  const foreL: Part = {
    x: (eL[0] + rear[0]) / 2,
    y: (eL[1] + rear[1]) / 2,
    paint: (b, ox, oy) => {
      foreArm(b, shift(eL, ox, oy), shift(rear, ox, oy), rampL, boneL);
      fist(b, rear[0] - ox, rear[1] - oy, dx, dy, boneL);
    },
  };
  // (the hand off the shaft is open; swept out at the hero, it points the way the bolts go)
  const sweep = Math.hypot(q.ohx, q.ohy) > 6;
  const cast = back ? 30 : -12;
  const foreR: Part = {
    x: (eR[0] + lead[0]) / 2,
    y: (eR[1] + lead[1]) / 2,
    paint: (b, ox, oy) => {
      foreArm(b, shift(eR, ox, oy), shift(lead, ox, oy), rampR, boneR);
      if (loose > 0.25) openHand(b, lead[0] - ox, lead[1] - oy, sweep ? cast : 90, boneR);
      else fist(b, lead[0] - ox, lead[1] - oy, dx, dy, boneR);
    },
  };
  const headP: Part = {
    x: hx,
    y: ty + 12,
    paint: (b, ox, oy) => {
      for (const g of (back ? headBack : headFront)(b, hx - ox, ty - oy, heat, pulse)) glows.push({ ...g, light: { ...g.light, x: g.light.x + ox, y: g.light.y + oy } });
    },
  };
  // (an arm raised over the shoulder lifts its plate; the plate on the far shoulder is the smaller, and in shade)
  const plate = (s: V, up: boolean, out: number, far: boolean): Part => {
    const cx = s[0] + out * 2;
    const cy = s[1] - 2 - (up ? 2 : 0);
    return { x: cx, y: cy - 3, paint: (b, ox, oy) => pauldron(b, cx - ox, cy - oy, !far, out, far ? SHADE : IRON) };
  };
  const plateL = plate(sL, upL, -1, back);
  const plateR = plate(sR, upR, 1, !back);
  const plateFar = back ? plateL : plateR;
  const plateNear = back ? plateR : plateL;
  if (take && legsOnly) {
    const own = (...parts: Part[]): Px => {
      const l = new Px(W, H);
      for (const part of parts) lay(l, part);
      return l;
    };
    const trunkOnly = new Px(W, H);
    shear(trunk, grid, trunkOnly);
    take({
      cape: new Px(W, H).blit(capeL, 0, 0),
      maul: new Px(W, H).blit(maulL, 0, 0),
      legs: legsOnly,
      trunk: trunkOnly,
      head: own(headP),
      armL: own(armL, foreL),
      armR: own(armR, foreR),
      plateL: own(plateL),
      plateR: own(plateR),
      hipX,
      beltY,
    });
  }

  // --- stack it, bottom to top ---
  const stack: (Px | Part)[] = [];
  if (back) {
    // facing away, what he holds before him is beyond him: the maul and his arms. Hoisted over his
    // head and back, the maul tips toward us, and his arms are on our side of the helm.
    const crowned = rear[1] < ty + 1 && lead[1] < ty + 1 && loose < 0.5;
    stack.push(maulL);
    if (!crowned) stack.push(foreL, armL, foreR, armR);
    stack.push(body, capeL, headP);
    if (crowned) stack.push(armL, armR, foreL, foreR);
    stack.push(plateFar, plateNear);
  } else if (loose < 0.5 && rear[1] < sy + 7) {
    // facing us, the maul hoisted (the hand at its butt as high as his throat, or higher): it goes
    // up and back over his head, so it and his hands are behind the helm and its horns, and his
    // own fists do not hide his face
    stack.push(capeL, armR, body, armL, plateFar, plateNear, maulL, foreR, foreL, headP);
  } else {
    stack.push(capeL);
    if (!upR) stack.push(armR);
    stack.push(body);
    if (!upL) stack.push(armL);
    stack.push(headP);
    if (upR) stack.push(armR);
    if (upL) stack.push(armL);
    stack.push(plateFar, plateNear, maulL, foreR, foreL);
  }
  // (the big things are layers; a part is laid on the layer under it)
  const layers: Px[] = [];
  for (const it of stack) {
    if (it instanceof Px) layers.push(it);
    else lay(layers[layers.length - 1], it);
  }
  const out = compose(null, layers);

  // --- what burns in the air: over everything, with no seam round it ---
  if (loose > 0.25) {
    const fire = clamp01(q.pt);
    if (fire > 0.04 && loose > 0.6) {
      // the fire gathering over the open palm
      const tall = 5 + fire * 21 + Math.sin(q.wind * Math.PI * 14) * 1.5;
      flame(out, lead[0] + 0.5, lead[1] - 6, Math.round(tall), -1 - Math.min(2, q.drag) + Math.sin(q.wind * Math.PI * 10) * 0.6);
      lights.push({ x: lead[0], y: lead[1] - 6 - tall * 0.4, r: 12 + fire * 34, color: FLAME[3], a: 0.3 + fire * 0.42 });
    } else if (sweep && heat > 0.8) {
      // loosed: the hand is empty, the last of the fire leaving its fingers the way the bolts have gone
      const k = (1 - heat) / 0.2;
      const [ux, uy] = dir(cast);
      for (const [da, far] of [[-30, 0.8], [-10, 1.1], [8, 0.95], [28, 0.75]] as const) {
        const [fx, fy] = dir(cast + da);
        const d = 13 + k * 12 * far;
        const x = Math.min(W - 6, Math.round(lead[0] + ux * 2 + fx * d));
        const y = Math.round(lead[1] + uy * 2 + fy * d);
        out.set(x, y, FLAME[k < 0.4 ? 4 : 3]).set(x - Math.round(fx), y - Math.round(fy), FLAME[k < 0.4 ? 3 : 2]);
      }
      lights.push({ x: lead[0] + ux * 6, y: lead[1] + uy * 6, r: 26 - k * 8, color: FLAME[3], a: 0.55 * (1 - k) });
    }
  }
  // the blow of the slam: a burst of fire off the floor where the head lands, and a flash
  if (q.prop === 0 && heat > 0.52 && head[1] > AY - 24 && q.aim < -40) {
    const k = 1 - heat;
    const cx = head[0] + dx * 4;
    const cy = Math.min(AY + 6, head[1] + 9);
    const fire: Ramp = k < 0.2 ? [FLAME[3], FLAME[3], FLAME[4], FLAME[4], FLAME[4]] : k < 0.36 ? [FLAME[2], FLAME[2], FLAME[3], FLAME[4], FLAME[4]] : [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[3]];
    // (shards of it, flung out low along the floor and up: each flies further and thins as it goes)
    for (const [deg, len] of [[176, 15], [157, 11], [128, 9], [98, 7], [66, 10], [34, 12], [12, 16], [-6, 10]] as const) {
      const [sx, sy2] = dir(deg);
      const r0 = 14 + k * 44;
      const r1 = r0 + len * (1 - k * 1.3);
      limb(out, Math.min(W - 6, cx + sx * r0 * 1.2), cy + sy2 * r0 * 0.75, Math.min(W - 6, cx + sx * r1 * 1.2), cy + sy2 * r1 * 0.75, 2.1 - k * 2.4, 0.4, fire);
    }
    lights.push({ x: cx, y: cy - 4, r: 30 + heat * 26, color: FLAME[3], a: (heat - 0.5) * 1.6 });
  }
  // embers off the crack in his helm, into the air over it: two standing, a swarm when he burns hot
  embers(out, back ? hx - 4 : hx + 6, ty, 2 + Math.round(heat * 4), 13 + heat * 12, q.wind, back ? 1 : 2);

  // --- the fire in him and in the maul gives off light, as far as it shows ---
  // (his eyes and the crack in his helm are in the list already: the head put them there)
  const chestY = sy + 12;
  const burn = mix(FLAME[2], FLAME[3], heat);
  glows.push({ light: { x: mid(chestY) - 1, y: chestY, r: (back ? 8 : 12) + heat * 13 + pulse * 1.5 + gutter * 1.5, color: burn, a: 0.3 + heat * 0.35 + pulse * 0.07 }, r: 10, full: back ? 12 : 40 });
  glows.push({ light: { x: head[0], y: head[1], r: 11 + heat * 30 + pulse * 1.5 + gutter * 3, color: burn, a: 0.32 + heat * 0.43 + pulse * 0.06 }, r: 8, full: 30 });
  for (const g of glows) {
    const share = shows(out, g);
    if (share > 0) lights.push({ ...g.light, a: (g.light.a ?? 0.5) * share });
  }
  return { px: out, lights };
}

// ---------------------------------------------------------------------------------------------
// Animations

// Standing, he holds the maul across him, its head low, and breathes. He walks with a slow heavy
// tread. The slam: the maul is hoisted up and back over the helm in both hands and he coils under
// it, burning hotter (that is held: the player's warning); it comes down on the floor in front of
// his feet with all of him behind it; he leans on it while the heat dies. The volley: he swings
// the maul down beside him and plants it, one hand on it, and raises the other, open, with fire
// gathering in the palm; the hand is swept out at the hero, empty; it falls, and he takes the maul
// up again.

// Both attacks are timed as mkit's `strike` times one, and keep its rules: from rest to a wound-up
// pose that is held (the player's warning), the blow at `hit`, the follow-through, and back at rest
// 0.3 seconds after the blow. They are built here and not by `strike` because he does not hold
// still while he is wound up: he goes on burning hotter, to white heat just before the blow.

/** The moment the slam lands and the moment the volley is loosed, in seconds: how long the game waits (game/defs.ts and Game.bossThink). */
const SLAM_HIT = 0.95;
const VOLLEY_HIT = 0.7;

/**
 * The slam, with one more pose on the way up than `strike` has: the maul is first heaved up in
 * front of him (`lift`), then goes over his head (`wound`: held, he sinks a little further into
 * the coil and the maul burns up to its hottest), comes down (`blow`) and is leant on (`after`).
 */
function slam(lift: Partial<Pose>, wound: Partial<Pose>, blow: Partial<Pose>, after: Partial<Pose>): Timeline {
  const hit = SLAM_HIT;
  const held: Partial<Pose> = { ...wound, bob: (wound.bob ?? 0) + 0.5, lean: (wound.lean ?? 0) - 0.5, aim: (wound.aim ?? 0) + 4, act: 1, wind: (wound.wind ?? 0) + 0.2 };
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: hit * 0.2, pose: lift, ease: 'in' },
    { at: hit * 0.5, pose: wound, ease: 'out' },
    { at: hit * 0.86, pose: held, ease: 'lin' },
    { at: hit, pose: blow, ease: 'in' },
    { at: hit + 0.1, pose: after, ease: 'out' },
    { at: hit + 0.3, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit };
}

/**
 * The volley: the maul is planted (`plant` says where its hand goes and how he stands) and the
 * other hand raised with fire in its palm; while that is held the fire goes on gathering, and he
 * draws back from it a little; `loose` is the sweep of the hand at the hero, and `after` its fall.
 */
function volley(plant: Partial<Pose>, loose: Partial<Pose>, after: Partial<Pose>): Timeline {
  const hit = VOLLEY_HIT;
  const stood: Partial<Pose> = { prop: 1, aim: -90, hx: plant.hx ?? 0, hy: plant.hy ?? 0 };
  const raised: Partial<Pose> = { ...stood, ...plant, off: 1, pt: 0.55, act: 0.55, wind: 0.15, drag: 0.3 };
  const held: Partial<Pose> = { ...raised, lean: (plant.lean ?? 0) - 0.8, ohy: -3, pt: 1, act: 0.85, wind: 0.35 };
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: hit * 0.5, pose: raised, ease: 'out' },
    { at: hit * 0.86, pose: held, ease: 'lin' },
    { at: hit, pose: { ...stood, ...loose, off: 1, act: 1, wind: 0.5, drag: 1.8 }, ease: 'in' },
    { at: hit + 0.1, pose: { ...stood, ...after, off: 0.7, act: 0.4, wind: 0.75, drag: 0.6 }, ease: 'out' },
    { at: hit + 0.3, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit };
}

/**
 * How long he takes to die, in seconds. (The owner, 5 Oct 2026: "I think we want death animations
 * and corpses for enemies"; he was told the Warden "gets a big one".)
 */
const WARDEN_DIES = 2.2;
/**
 * His death. The fire in him is what held him up. Struck down, it flares to white heat through
 * every crack (to STRUCK); his knees give and he brings the maul down on its head before him and
 * hangs on its shaft, the last of the fire bursting from its rune as it meets the floor (to
 * KNEELING; the burst is the slam's own, which the rig paints whenever a hot maul's head is down);
 * the fire goes out (to COLD); and with nothing left to hold them the iron and the bones come
 * apart: the legs fold, the plates drop, the cape settles (behind the heap when he faced us, over
 * it when he faced away), the maul goes over and lies across the front, and last the horned helm
 * drops, bounces and comes to rest upright on the side nearer us. What lies there is his body.
 */
const STRUCK = 0.14;
const KNEELING = 0.36;
const COLD = 0.46;
/** Where the hand at the maul's butt goes when the maul stands on its head before him (Pose.hx, hy): the head's lower edge is then on the floor. */
const PLANT_X = 14;
const PLANT_Y = -17;
function wardenDeath(k: number, back: boolean): Painted {
  let q: Partial<Pose>;
  if (k < STRUCK) {
    const u = k / STRUCK;
    q = { lean: -3 * u, bob: -0.5 * u, act: u, wind: 0.1 + u * 0.1 };
  } else if (k < KNEELING) {
    const u = (k - STRUCK) / (KNEELING - STRUCK);
    const e = u * u;
    q = { lean: -3 + 5 * e, bob: -0.5 + 5.5 * e, act: 1, aim: REST_AIM + (-90 - REST_AIM) * e, hx: PLANT_X * e, hy: PLANT_Y * e, wind: 0.2 + u * 0.5 };
  } else {
    const u = Math.min(1, (k - KNEELING) / (COLD - KNEELING));
    q = { lean: 2, bob: 5, act: 1 - u, aim: -90, hx: PLANT_X, hy: PLANT_Y, wind: 0.7 + u * 0.2 };
  }
  let got: WardenParts | null = null;
  const f = jailer({ ...REST, aim: REST_AIM, ...q }, back, k >= COLD ? (parts) => (got = parts) : undefined);
  const p = got as WardenParts | null;
  if (!p) return f;
  // (the side nearer us, where the helm rolls to: screen-left when he faces us, screen-right when he faces away)
  const s = back ? 1 : -1;
  const F = AY;
  /**
   * The cape: cloth, and it lies flat. Facing us it was behind him: it swings round as it comes
   * down and lies spread across the floor under what is left of him, red to either side of the
   * heap. Facing away it was on our side of him, and settles over the heap.
   */
  const cape: Piece = back ? { px: p.cape, to: [AX, F + 1], from: 0.12, until: 0.86, flat: 0.38 } : { px: p.cape, to: [AX, F - 12], turns: 1, from: 0.12, until: 0.82, flat: 0.3 };
  const pieces: Piece[] = [
    ...(back ? [] : [cape]),
    // the legs fold where they stood, one each way
    { px: p.legs, box: s < 0 ? [p.hipX, 0, W, H] : [0, 0, p.hipX, H], to: [AX - s * 12, F - 5], turns: -s, from: 0, until: 0.4 },
    { px: p.legs, box: s < 0 ? [0, 0, p.hipX, H] : [p.hipX, 0, W, H], to: [AX + s * 13, F - 1], turns: s, from: 0.02, until: 0.42 },
    // the arm on the far side falls away behind
    { px: s < 0 ? p.armR : p.armL, to: [AX - s * 28, F - 8], turns: -s, from: 0.06, until: 0.5 },
    // the plates over the hips drop where they were; the breastplate comes down on them
    { px: p.trunk, box: [0, p.beltY, W, H], to: [AX, F - 2], from: 0.03, until: 0.4 },
    { px: p.trunk, box: [0, 0, W, p.beltY], to: [AX - s * 2, F - 9], from: 0.08, until: 0.56, bounce: 2 },
    // the plates of his shoulders: off to either side
    { px: s < 0 ? p.plateR : p.plateL, to: [AX - s * 33, F - 3], turns: -s, from: 0.1, until: 0.6, hop: 4, bounce: 3 },
    { px: s < 0 ? p.plateL : p.plateR, to: [AX + s * 30, F + 1], turns: s, from: 0.14, until: 0.64, hop: 3, bounce: 2 },
    // the nearer arm
    { px: s < 0 ? p.armL : p.armR, to: [AX + s * 22, F + 3], turns: s, from: 0.06, until: 0.54 },
    ...(back ? [cape] : []),
    // the maul stood on its head: it stands a moment longer, goes over, and lies across the front of what is left of him
    // (it goes over away from the side the helm comes down on: its head lies at the further end)
    { px: p.maul, to: [AX - s * 8, F + 10], turns: s, from: 0.3, until: 0.84, bounce: 2, topple: true },
    // the helm: last. It drops, bounces, and stands on the floor
    { px: p.head, to: [AX + s * 40, F + 9], from: 0.28, until: 0.96, hop: 5, bounce: 4 },
  ];
  const px = fallen(pieces, (k - COLD) / (1 - COLD), W, H, INK);
  // (the fire is out: in his eyes, in the cracks, in the rune)
  quench(px, [SOCKET, ...FLAME], INK);
  return { px, lights: [] };
}

export function makeWardenArt(): ActorArt {
  const front: MonsterMoves = {
    attack: slam(
      { bob: 0.5, lean: 0.5, hx: 10, hy: -20, aim: 24, act: 0.3, wind: 0.08, drag: 0.5 },
      { bob: 3, lean: -4.5, hx: -1, hy: -53, aim: 112, act: 0.7, near: -0.6, far: 0.5, wind: 0.2, drag: 1.5 },
      { bob: 5, lean: 5, hx: 21, hy: -8, aim: -56, act: 1, near: -0.5, far: 1.5, wind: 0.55, drag: 2.4 },
      { bob: 4, lean: 5.5, hx: 30, hy: -12, aim: -68, act: 0.5, near: -0.4, far: 1.3, wind: 0.75, drag: 0.8 },
    ),
    heavy: volley(
      { hx: -22, hy: -5, lean: -1, bob: 0.5 },
      { ohx: 30, ohy: 30, lean: 3, bob: 1.5, near: 0.5, far: -0.3 },
      { ohx: 22, ohy: 40, lean: 1.5, bob: 1, near: 0.3, far: -0.2 },
    ),
    die: (k) => wardenDeath(k, false),
  };
  const backMoves: MonsterMoves = {
    attack: slam(
      { bob: 0.5, lean: 0.5, hx: 10, hy: -20, aim: 24, act: 0.3, wind: 0.08, drag: 0.5 },
      { bob: 3, lean: -4.5, hx: 8, hy: -52, aim: 100, act: 0.7, near: 0.5, far: -0.6, wind: 0.2, drag: 1.5 },
      { bob: 5, lean: 5, hx: 10, hy: -12, aim: -50, act: 1, near: 1.5, far: -0.5, wind: 0.55, drag: 2.4 },
      { bob: 4, lean: 5.5, hx: 17, hy: -15, aim: -60, act: 0.5, near: 1.3, far: -0.4, wind: 0.75, drag: 0.8 },
    ),
    heavy: volley(
      { hx: -33, hy: -9, lean: -1, bob: 0.5 },
      { ohx: 22, ohy: 14, lean: 3, bob: 1.5, near: 0.5, far: -0.3 },
      { ohx: 18, ohy: 36, lean: 1.5, bob: 1, near: 0.3, far: -0.2 },
    ),
    die: (k) => wardenDeath(k, true),
  };
  return monsterArt(jailer, front, backMoves, {
    canvas: WARDEN_CANVAS,
    rest: { aim: REST_AIM },
    // a pool of light behind his chest: bigger than a common monster's, and hotter
    aura: { x: AX - 2, y: AY - 68, r: 70, color: '#ff4a5c', a: 0.18 },
    idleFps: 8,
    walkFps: 10,
    dieTime: WARDEN_DIES,
  });
}

/** For the art sheets: one frame, as a painting. */
export function paintWarden(q: Pose, back: boolean): Painted {
  return jailer(q, back);
}
