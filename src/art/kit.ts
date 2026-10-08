// The painter's kit for art at the finer grain, in the chosen art style (style 6, "bold and
// modern"): flat colour in three tones per material, no black outline (the seam between two parts
// is the deep indigo of the world), and accents that glow. The heroes are painted with it; the
// monsters, the floors and the rest are to follow.
//
// How a figure is built (the same idea as the art of the first builds, at twice the grain):
//   - A Pose is a handful of numbers (bob, where each foot is in its stride, where the weapon hand
//     is and where the weapon points, where the wind has got to ...).
//   - Each hero has one "rig": a function that paints one frame from a Pose, facing the camera or
//     facing away. Parts are painted on separate layers and stacked, each with a seam round it.
//   - An animation is a short list of Poses, so every frame of a hero stays consistent. Standing
//     and walking are loops; an attack is a timeline of key poses with the frames between them
//     worked out (clip.ts).
//   - What flies from a figure (a scarf, a feather) is NOT painted in the frame: the frame only
//     says where it is fixed, and it is moved and drawn every frame of the game (engine/tails.ts).
//   - Frames are painted the first time they are shown, not at start-up (see lazyFrames).
//
// Everything here is in PICTURE pixels: GRAIN of them make one game pixel.

import { Px, rgba } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { TailRoot } from '../engine/tails';
import type { AnimSet, Clip } from './actor_types';
import { clipPoses } from './clip';
import type { Timeline } from './clip';

/** Picture pixels per game pixel. */
export const GRAIN = 2;

/** The canvas every hero frame is painted on. */
export const KW = 112;
export const KH = 112;
/** The body's centre line (it runs between this pixel column and the one to its left). */
export const KX = 52;
/** Anchor: the floor point between the feet. The near foot's sole is the row above KAY. */
export const KAX = 52;
export const KAY = 102;

/** Tones of one material, dark to light. Style 6 uses three: [0] = [1] and [3] = [4]. */
export type Ramp = readonly [string, string, string, string, string];
export type V = readonly [number, number];
/** How deep light or shade reaches into a form: [rim, band] in pixels. */
export type Reach = readonly [number, number];

// ---------------------------------------------------------------------------------------------
// The palette of style 6

/** The seam between parts, and the dark inside a helm or a hood. */
export const INK = '#0e0c24';
export const STEEL: Ramp = ['#3a3478', '#3a3478', '#7a74c8', '#d6d0ff', '#d6d0ff'];
export const MAIL: Ramp = ['#28245a', '#28245a', '#4a4690', '#7e7ac0', '#7e7ac0'];
export const PINK: Ramp = ['#7a1058', '#7a1058', '#e0287a', '#ff7aa8', '#ff7aa8'];
export const TEAL: Ramp = ['#0c3a52', '#0c3a52', '#157a8c', '#3cc4c0', '#3cc4c0'];
export const PLUM: Ramp = ['#3a1c40', '#3a1c40', '#6e3a5c', '#a8607a', '#a8607a'];
export const CYAN: Ramp = ['#0c6a80', '#0c6a80', '#22d0e0', '#b8fff8', '#b8fff8'];
export const INDIGO: Ramp = ['#2a2466', '#2a2466', '#4640a0', '#6e68cc', '#6e68cc'];
/** A lit blade. Its two lightest tones are used for nothing else. */
export const BLADE: Ramp = ['#0c6a80', '#0c6a80', '#22d0e0', '#8af6f0', '#ffffff'];
export const BONE: Ramp = ['#5a4a8a', '#5a4a8a', '#b0a4e0', '#f0e8ff', '#f0e8ff'];
/** The ranger's green. */
export const LEAF: Ramp = ['#0e4a2c', '#0e4a2c', '#22b060', '#8af078', '#8af078'];
/** The mage's purple. */
export const ROBE: Ramp = ['#3a1a7a', '#3a1a7a', '#7a3ae0', '#b890ff', '#b890ff'];
/** A blue nearly as dark as the ink: the mage's cape and bodice. */
export const NIGHT: Ramp = ['#15123a', '#15123a', '#2a2664', '#48448e', '#48448e'];
/** Brown hair: the mage's (the owner, 6 Oct 2026, 23:48: "nope, dark eyes and brown hair"). The game's wood. */
export const BROWN: Ramp = ['#4a2c1a', '#4a2c1a', '#7e4f2c', '#b67e4a', '#b67e4a'];
/** Magic: a crystal, a spark. */
export const SPARK: Ramp = ['#0c6a80', '#0c6a80', '#22d0e0', '#b8fff8', '#ffffff'];
/** Skin, dark to light (four tones). */
export const SKIN4: readonly [string, string, string, string] = ['#5a4a8a', '#8a7ab0', '#b0a4e0', '#d8d0f8'];
/** Two points of light in a shadowed face. */
export const GLINT = '#7af8f0';
/** The style's usual depth of light and of shade. */
export const HI: Reach = [0, 2];
export const LO: Reach = [0, 3];

/** The same material in shade: every tone one step darker. For the arm and leg further from the camera. */
export function dim(r: Ramp): Ramp {
  return [r[0], r[0], r[1], r[2], r[3]];
}

function hex2(n: number): string {
  return (n < 16 ? '0' : '') + n.toString(16);
}
function mixc(a: string, b: string, t: number): string {
  const p = rgba(a);
  const q = rgba(b);
  const f = (i: number): string => hex2(Math.round(p[i] + (q[i] - p[i]) * t));
  return '#' + f(0) + f(1) + f(2);
}
/** One colour between two. */
export const mix = mixc;
/** A ramp between two ramps. */
export function blend(a: Ramp, b: Ramp, t: number): Ramp {
  return [mixc(a[0], b[0], t), mixc(a[1], b[1], t), mixc(a[2], b[2], t), mixc(a[3], b[3], t), mixc(a[4], b[4], t)];
}

// ---------------------------------------------------------------------------------------------
// Layers

/**
 * A blank layer of the kit's canvas.
 *
 * While a frame is being painted for the game (see `framed`) the layers come from a pool and are
 * used again for the next frame. A frame takes about a dozen of them, fifty thousand bytes each,
 * and with the monsters painted like the heroes (Version 14) a new dungeon paints some hundreds
 * of frames in its first seconds: made afresh each time, that was half a megabyte to throw away
 * for every frame, and the browser stopped now and then for three or four frames together to
 * clear it up (the busy-fight playtests saw 50 and 67 ms where the longest had been 33).
 * Anywhere else (a test or a dev page that paints two frames and holds them side by side) each
 * layer is a new one, as before.
 */
export function layer(): Px {
  if (taken < 0) return new Px(KW, KH);
  let p = pool[taken];
  if (!p) p = pool[taken] = new Px(KW, KH);
  else p.d.fill(0);
  taken++;
  return p;
}
const pool: Px[] = [];
/** How many of the pool's layers the frame being painted has taken; -1 when none is being painted. */
let taken = -1;

/**
 * Paint one frame with layers from the pool. Whatever `paint` returns must not hold on to a
 * layer: toSprite, which every frame of the game goes through, keeps a copy cut down to the figure.
 */
function framed<T>(paint: () => T): T {
  // (a frame painted from inside another goes on taking from the same pool: nothing is handed out twice)
  if (taken >= 0) return paint();
  taken = 0;
  try {
    return paint();
  } finally {
    taken = -1;
  }
}

/**
 * Scratch layers for lit(): reused, so a frame does not allocate one per shape. One stack of them
 * for each size of canvas (a figure too big for the kit's canvas is painted on a bigger one of
 * its own: see RigOpts.anchor).
 */
const scratches = new Map<number, Px[]>();
let depth = 0;

/**
 * Paint a shape, then shade it by how near each pixel is to the shape's lit (upper-left) edge and
 * to its shaded (lower-right) edge. `paint` draws the shape on the layer it is given, in any colour.
 */
export function lit(dst: Px, ramp: Ramp, hi: Reach, lo: Reach, paint: (l: Px) => void): void {
  const size = dst.w * 8192 + dst.h;
  let scratch = scratches.get(size);
  if (!scratch) scratches.set(size, (scratch = []));
  let l = scratch[depth];
  if (!l) l = scratch[depth] = new Px(dst.w, dst.h);
  else l.d.fill(0);
  depth++;
  try {
    paint(l);
  } finally {
    depth--;
  }
  const w = l.w;
  const h = l.h;
  const d = l.d;
  const has = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const reach = (x: number, y: number, step: number, max: number): number => {
    for (let k = 1; k <= max; k++) {
      if (!has(x + step * k, y + step * k)) return k;
      if (!has(x + step * k, y + step * (k - 1)) && !has(x + step * (k - 1), y + step * k)) return k;
    }
    return max + 1;
  };
  const tones = [rgba(ramp[0]), rgba(ramp[1]), rgba(ramp[2]), rgba(ramp[3]), rgba(ramp[4])];
  const out = dst.d;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] === 0) continue;
      const a = reach(x, y, -1, hi[1]);
      const b = reach(x, y, 1, lo[1]);
      const t = a <= hi[0] && b > lo[0] ? 4 : b <= lo[0] ? 0 : a <= hi[1] && b > lo[1] ? 3 : b <= lo[1] && a > hi[1] ? 1 : 2;
      const c = tones[t];
      out[i] = c[0];
      out[i + 1] = c[1];
      out[i + 2] = c[2];
      out[i + 3] = 255;
    }
  }
}

/**
 * Stack layers bottom to top, each with the style's dark seam round it so that a sword or a
 * shield held in front of the body stays readable. `under` and `over` get no seam (a bowstring, a
 * glowing crystal).
 */
export function compose(under: Px | null, layers: ReadonlyArray<Px>, over: Px | null = null): Px {
  // (as big as what it is given: the kit's own canvas, or a bigger figure's)
  const like = under ?? layers[0] ?? over;
  const out = like && (like.w !== KW || like.h !== KH) ? new Px(like.w, like.h) : layer();
  const w = out.w;
  const h = out.h;
  const o = out.d;
  const ink = rgba(INK);
  if (under) out.blit(under, 0, 0);
  for (const l of layers) {
    const d = l.d;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] > 0) {
          o[i] = d[i];
          o[i + 1] = d[i + 1];
          o[i + 2] = d[i + 2];
          o[i + 3] = 255;
        } else if ((x > 0 && d[i - 1] > 0) || (x < w - 1 && d[i + 7] > 0) || (y > 0 && d[i - w * 4 + 3] > 0) || (y < h - 1 && d[i + w * 4 + 3] > 0)) {
          o[i] = ink[0];
          o[i + 1] = ink[1];
          o[i + 2] = ink[2];
          o[i + 3] = 255;
        }
      }
    }
  }
  if (over) out.blit(over, 0, 0);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Turned to the grid (Version 14.5)
//
// The owner, 5 Oct 2026: "the game doesn't run on normal north-east-south-west directions. It's
// always at an angle ... So any sprite or doodad or whatever should always be seen at an angle",
// and of the figures: "I'd like the character models to move and turn in those four cardinal
// directions as well."
//
// The game always did pick one of four pictures of a figure, by which diagonal it faces: `front`
// (down the screen and to the right), `back` (up and to the right), and each of them mirrored. What
// was wrong was the pictures: a figure was painted square-on, facing straight out of the screen or
// straight into it, and only its weapon pointed along the grid. A figure that faces a diagonal is
// seen from a corner:
//   - whatever runs ACROSS it (the line of the shoulders, a belt, the hem of a coat, a shield's
//     top edge) runs along the grid, one pixel up or down for every two across, like the top of a
//     wall: `shear` does that to a part that was painted level;
//   - whatever is on its middle line (a face, a buckle, the seam down a back) is not in the middle
//     of the picture but toward the side it faces (TURN pixels of a body sixteen wide);
//   - of each pair (shoulders, hands, feet) the nearer one is lower on the screen and the further
//     one higher, and the feet point along the grid, and a step goes along it.

/** How far the middle line of a body moves toward the side the figure faces. */
export const TURN = 3;

/**
 * How many rows a column of a body is slid down (+) or up (-), seen from a corner. `c` is the
 * column of the body's nearest corner (where two of its sides meet, and its lines are lowest);
 * from there they rise one row for every two columns, both ways. `drop` is how far the corner
 * itself is lowered.
 */
export function slant(c: number, drop: number): (x: number) => number {
  return (x) => (x >= c ? drop - Math.floor((x - c) / 2) : drop - Math.floor((c - x + 1) / 2));
}

/** A line that runs along the grid through column `c`: down to the right (+1) or up to the right (-1), one row for every two columns. */
export function along(c: number, way: 1 | -1): (x: number) => number {
  return (x) => way * Math.floor((x - c) / 2);
}

/**
 * Slide every column of a layer down (+) or up (-) by `by(x)` rows, onto `dst` (over whatever is
 * there). What was painted level comes out running along the grid.
 */
export function shear(src: Px, by: (x: number) => number, dst: Px): Px {
  const w = src.w;
  const h = src.h;
  const s = src.d;
  const o = dst.d;
  for (let x = 0; x < w; x++) {
    const k = Math.round(by(x));
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      if (s[i + 3] === 0) continue;
      const ty = y + k;
      if (ty < 0 || ty >= h) continue;
      const j = (ty * w + x) * 4;
      o[j] = s[i];
      o[j + 1] = s[i + 1];
      o[j + 2] = s[i + 2];
      o[j + 3] = s[i + 3];
    }
  }
  return dst;
}

/**
 * The same, where how far a column is slid changes down it (a long coat: its shoulders and belt
 * lean along the grid, and its round hem, which looks the same from every side, does not).
 * `by(x, y)` is how many rows the pixel that ends up at (x, y) has been slid down.
 */
export function shearBy(src: Px, by: (x: number, y: number) => number, dst: Px): Px {
  const w = src.w;
  const h = src.h;
  const s = src.d;
  const o = dst.d;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const sy = y - Math.round(by(x, y));
      if (sy < 0 || sy >= h) continue;
      const i = (sy * w + x) * 4;
      if (s[i + 3] === 0) continue;
      const j = (y * w + x) * 4;
      o[j] = s[i];
      o[j + 1] = s[i + 1];
      o[j + 2] = s[i + 2];
      o[j + 3] = s[i + 3];
    }
  }
  return dst;
}

// ---------------------------------------------------------------------------------------------
// Forms

const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;

/** A ball: lit from the upper left. */
export function ball(p: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp, shade = 0): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const i = nx * LX + ny * LY + Math.sqrt(1 - d2) * LZ - shade;
      p.set(x, y, ramp[i > 0.9 ? 4 : i > 0.62 ? 3 : i > 0.22 ? 2 : i > -0.2 ? 1 : 0]);
    }
  }
}

/** A limb: a thick line that tapers from radius r0 to r1, shaded across its width. `links` = mail. */
export function limb(p: Px, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, ramp: Ramp, links = false): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const rMax = Math.max(r0, r1) + 1;
  for (let y = Math.floor(Math.min(y0, y1) - rMax); y <= Math.ceil(Math.max(y0, y1) + rMax); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - rMax); x <= Math.ceil(Math.max(x0, x1) + rMax); x++) {
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2));
      const r = r0 + (r1 - r0) * t;
      const ox = x + 0.5 - (x0 + dx * t);
      const oy = y + 0.5 - (y0 + dy * t);
      if (ox * ox + oy * oy > r * r) continue;
      const s = (ox * LX + oy * LY) / (r * 0.81);
      let tone = s > 0.5 ? 3 : s < -0.45 ? 1 : 2;
      if (links && x % 2 === 0 && y % 2 === 0) tone = Math.max(0, tone - 1);
      p.set(x, y, ramp[tone]);
    }
  }
}

/**
 * Where the elbow (or knee) is, given the two ends of a limb of two bones. `side` picks which way
 * it bends: +1 = to the right of the line from `a` to `b`, as seen on screen. If the ends are
 * further apart than the bones are long, the limb is simply straight.
 */
export function joint(a: V, b: V, la: number, lb: number, side: 1 | -1): V {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.hypot(dx, dy) || 0.001;
  if (d >= la + lb) return [a[0] + (dx * la) / (la + lb), a[1] + (dy * la) / (la + lb)];
  const along = Math.max(-la, Math.min(la, (la * la - lb * lb + d * d) / (2 * d)));
  const off = Math.sqrt(Math.max(0, la * la - along * along));
  const ux = dx / d;
  const uy = dy / d;
  return [a[0] + ux * along - uy * off * side, a[1] + uy * along + ux * off * side];
}

/** An arm of two bones: shoulder, elbow, hand. */
export function arm(p: Px, s: V, e: V, hnd: V, r: number, upper: Ramp, lower: Ramp, links = false): void {
  limb(p, s[0], s[1], e[0], e[1], r, r - 0.3, upper, links);
  limb(p, e[0], e[1], hnd[0], hnd[1], r - 0.3, r - 0.6, lower);
}

/** A gloved fist, four pixels square, centred on (hx, hy). */
export function fist(p: Px, hx: number, hy: number, ramp: Ramp = PLUM): void {
  const x = Math.round(hx) - 2;
  const y = Math.round(hy) - 2;
  p.rect(x, y, 4, 4, ramp[2]);
  p.hline(x, y, 3, ramp[4]).vline(x, y, 3, ramp[3]);
  p.hline(x + 1, y + 3, 3, ramp[1]).vline(x + 3, y + 1, 3, ramp[1]);
}

/** Paint a small hand-drawn pixel map with its top-left corner at (x, y). Letters not in the key leave a pixel alone. */
export function stamp(p: Px, x: number, y: number, rows: ReadonlyArray<string>, key: Readonly<Record<string, string | null>>): void {
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c = key[row.charAt(i)];
      if (c) p.set(x + i, y + j, c);
    }
  }
}

/** A steady pseudo-random number in 0..1 for a pixel (so a picture is the same every time). */
export function hash(x: number, y: number, k = 0): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Every pixel inside an ellipse. */
export function inEllipse(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) out.push([x, y]);
    }
  }
  return out;
}

/** A point on the curve through four control points. */
export function bezAt(pts: readonly [V, V, V, V], t: number): V {
  const a = (1 - t) ** 3;
  const b = 3 * (1 - t) ** 2 * t;
  const c = 3 * (1 - t) * t ** 2;
  const d = t ** 3;
  return [a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0], a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1]];
}

/**
 * A stroke along a curve whose thickness changes on the way (a scarf, a feather, a tail of hair).
 * It only lays down the shape: use it inside lit().
 */
export function stroke(l: Px, pts: readonly [V, V, V, V], rad: (t: number) => number, steps = 60): void {
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const [x, y] = bezAt(pts, t);
    const r = rad(t);
    l.ellipse(x, y, r, r, INK);
  }
}

/**
 * A ribbon of cloth in the wind: the curve through `pts`, with a wave travelling down it. The
 * wave is nothing at the fixed end and `amp` pixels at the free end; `wind` (0..1) says where the
 * wave has got to, and loops.
 */
export function flutter(pts: readonly [V, V, V, V], wind: number, amp: number, waves = 1): [V, V, V, V] {
  const at = (i: number): V => {
    const t = i / 3;
    const a = amp * t;
    const ph = (wind - t * waves * 0.75) * Math.PI * 2;
    return [pts[i][0] + Math.cos(ph) * a * 0.25, pts[i][1] + Math.sin(ph) * a];
  };
  return [pts[0], at(1), at(2), at(3)];
}

/** Unit step for an angle in degrees: 0 = screen-right, 90 = up. */
export function dir(deg: number): V {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), -Math.sin(r)];
}

// ---------------------------------------------------------------------------------------------
// Legs

export interface LegStyle {
  /** Width in pixels. */
  w: number;
  /** Thigh (mail, hose) and what is below it (a greave, a boot). */
  upper: Ramp;
  lower: Ramp;
  /** How much of a standing leg is the lower part. */
  share: number;
  /** The top of the lower part is a pixel wider each side (a boot top, the lip of a greave). */
  cuff: boolean;
  /** A knee cop of this material, or none. */
  knee: Ramp | null;
  /** A band of this material round the top of the boot, or none. */
  band: Ramp | null;
}

/** Where one foot is in a step. */
export interface Foot {
  /** How far the sole has gone to screen-right (+) or left (-) of where it stands. */
  dx: number;
  /** ... and down (+) or up (-) the screen: a step toward the camera goes down. */
  dy: number;
  /** How far the knee is pushed forward of a straight leg (a lifted leg bends). */
  bend: number;
}

export const STAND: Foot = { dx: 0, dy: 0, bend: 0 };

/**
 * One leg, from the hip to a foot whose toe points to screen-right. (hipX, top) is its top left
 * corner and `sole` the row its foot stands on at rest; `foot` moves the foot from there. The leg
 * is a column of rows, each slid sideways, so a leg that reaches forward leans and one that is
 * lifted bends at the knee. `toe` = how far the toe reaches past the leg (0 for a foot seen from
 * behind). `turn`: the figure is seen from a corner (see "Turned to the grid"), and its foot
 * points along the grid: +1 down the screen and to the right, -1 up and to the right.
 */
export function leg(p: Px, hipX: number, top: number, sole: number, far: boolean, s: LegStyle, foot: Foot = STAND, toe = 3, turn: 0 | 1 | -1 = 0): void {
  const lowLen = Math.round((sole - top) * s.share);
  const end = sole + Math.round(foot.dy);
  const lowTop = end - lowLen;
  const kneeX = foot.dx * 0.5 + foot.bend;
  const slide = (y: number): number => {
    if (y <= lowTop) return Math.round((kneeX * (y - top)) / Math.max(1, lowTop - top));
    return Math.round(kneeX + ((foot.dx - kneeX) * (y - lowTop)) / Math.max(1, end - lowTop));
  };
  const up = far ? dim(s.upper) : s.upper;
  const lo = far ? dim(s.lower) : s.lower;
  lit(p, up, [0, 2], [1, 2], (l) => {
    for (let y = top; y <= lowTop; y++) l.rect(hipX + slide(y), y, s.w, 1, INK);
  });
  const fx = hipX + slide(end);
  lit(p, lo, [0, 2], [1, 2], (l) => {
    for (let y = lowTop; y <= end; y++) {
      const cuff = s.cuff && y <= lowTop + 1;
      if (turn === 0) l.rect(hipX + slide(y) - (cuff ? 1 : 0), y, cuff ? s.w + 2 : y >= end - 1 ? s.w + toe : s.w, 1, INK);
      else l.rect(hipX + slide(y) - (cuff ? 1 : 0), y, cuff ? s.w + 2 : s.w, 1, INK);
    }
    if (turn > 0) {
      // the foot points down the screen and to the right: the heel under the leg, the toe a row lower
      l.rect(fx, end - 1, s.w + 2, 1, INK);
      l.rect(fx, end, s.w + toe, 1, INK);
      l.rect(fx + 2, end + 1, s.w + toe - 1, 1, INK);
    } else if (turn < 0) {
      // ... or up the screen and to the right: seen from behind, the heel, and the toe beyond it a row higher
      l.rect(fx + 1, end - 2, s.w + toe, 1, INK);
      l.rect(fx, end - 1, s.w + toe, 1, INK);
    }
  });
  if (turn === 0) p.hline(fx, end, s.w + toe, lo[0]);
  else if (turn > 0) p.hline(fx, end, 2, lo[0]).hline(fx + 2, end + 1, s.w + toe - 1, lo[0]);
  else p.hline(fx, end, s.w, lo[0]).set(fx + s.w, end - 1, lo[0]);
  if (s.knee) {
    const k = far ? dim(s.knee) : s.knee;
    const kx = hipX + slide(lowTop);
    p.rect(kx - 1, lowTop, s.w + 2, 2, k[2]);
    p.hline(kx - 1, lowTop, s.w + 1, k[4]);
  }
  if (s.band) {
    const b = s.band;
    const bx = hipX + slide(lowTop);
    p.hline(bx - 1, lowTop, s.w + 2, b[far ? 2 : 3]).hline(bx - 1, lowTop + 1, s.w + 2, b[far ? 1 : 2]);
  }
}

// ---------------------------------------------------------------------------------------------
// Pose

export interface Pose {
  /** Upper body pushed down this many pixels (breathing, footfalls). The feet stay put. */
  bob: number;
  /** Upper body pushed the way it faces (+) or back from it (-). */
  lean: number;
  /** Where each foot is in its stride: +1 a full step forward, -1 a full step back. */
  near: number;
  far: number;
  /** How high each foot is off the floor, 0..1 of a full lift. */
  nearLift: number;
  farLift: number;
  /** Arm swing of a walk: +1 weapon arm forward, -1 back. */
  swing: number;
  /** Weapon hand, as an offset from where it rests. */
  hx: number;
  hy: number;
  /** The way the weapon points, in degrees: 0 = forward (screen-right), 90 = straight up. */
  aim: number;
  /** The other arm. What the numbers mean is the rig's own business (a shield raised, a hand on the string). */
  off: number;
  /**
   * For a rig whose `off` names a few places the free hand can be: between two keys of a timeline,
   * the place it is going to and how far along it is (0..1). Elsewhere `off2` = `off` and `offK` = 0.
   */
  off2: number;
  offK: number;
  /** The free hand moved from wherever `off` puts it, in pixels (a gesture: a thumb along a blade). */
  ohx: number;
  ohy: number;
  /** Something extra in the picture, by the rig's own numbering (a book in the hand, a light, a squirrel): 0 = nothing. */
  prop: number;
  /** How far along that extra thing is in whatever it does, 0..1. */
  pt: number;
  /** Class-specific (how far a bow is drawn, how bright a crystal burns). */
  act: number;
  /** Where the wind has got to, 0..1 round its loop: scarves, feathers and capes ride it. */
  wind: number;
  /** How hard cloth is pulled back by the hero's own movement: 0 standing, 1 walking. */
  drag: number;
  /** Front view only: the weapon passes behind the body (a sword raised behind the head). */
  behind: boolean;
  /**
   * The streak a weapon leaves in the air: how many degrees of arc it has just come through to
   * get where it points now (`aim`), positive when it came round clockwise as the screen shows it
   * (over the top and down to the right). 0 = none. A rig that swings something paints the streak;
   * the others take no notice.
   */
  sweep: number;
  /**
   * The whole figure, feet and all, carried the way it faces by this many picture pixels along
   * the grid: a lunge, a recoil (negative). The stride numbers still say where each foot is under
   * the body that has moved, so a foot that stays planted is that far behind it.
   */
  step: number;
  /**
   * A blast of air in the figure's face (its own beam, held): 0 none, 1 the whole of it. Cloth
   * streams back from it. A rig that wears a coat or a cloak paints that; the others take no notice.
   */
  gale: number;
  /**
   * The light going out of the figure: 0 as it is, 1 quite out. What glows on a hero is cyan (the
   * lit blade, the crystal, the eyes, a glowing hem); as this rises it cools, tone by tone, to
   * plain dull steel, and the lights the figure gives off fade with it. No rig need know of it:
   * it is done to the painting (lightsOut). A hero's death ends with it.
   */
  out: number;
}

export const REST: Pose = { bob: 0, lean: 0, near: 0, far: 0, nearLift: 0, farLift: 0, swing: 0, hx: 0, hy: 0, aim: 90, off: 0, off2: 0, offK: 0, ohx: 0, ohy: 0, prop: 0, pt: 0, act: 0, wind: 0, drag: 0, behind: false, sweep: 0, step: 0, gale: 0, out: 0 };

/**
 * How far a foot travels in a full step, across and up or down the screen, and how high it is
 * lifted, in pixels. The figures are drawn almost square-on, so a step is mostly up and down the
 * screen: sideways travel is kept small, or the two legs would cross and read as one.
 */
export const STRIDE_X = 1.6;
export const STRIDE_Y = 2.6;
export const LIFT = 3;
/**
 * The same for a figure that is seen from a corner (see "Turned to the grid"): its step goes
 * along the grid, two pixels across for each one up or down the screen, and its legs pass each
 * other as a walker's do seen from the side.
 */
export const TURN_STRIDE_X = 3.4;
export const TURN_STRIDE_Y = 1.7;

/**
 * A foot of a Pose as the leg painter wants it. Facing the camera a step forward goes down the
 * screen; facing away it goes up. A lifted leg bends: its knee comes forward.
 */
export function footOf(q: Pose, near: boolean, back: boolean, turned = false): Foot {
  const s = near ? q.near : q.far;
  const lift = near ? q.nearLift : q.farLift;
  const sx = turned ? TURN_STRIDE_X : STRIDE_X;
  const sy = turned ? TURN_STRIDE_Y : STRIDE_Y;
  // (the + 0 turns a negative zero, which rounding can leave behind, into a plain one)
  return { dx: Math.round(s * sx) + 0, dy: Math.round(s * sy * (back ? -1 : 1) - lift * LIFT) + 0, bend: lift * 1.4 };
}

/** Frames of the idle loop and of the walk, and how fast they play. */
export const IDLE_FRAMES = 12;
export const IDLE_FPS = 10;
export const WALK_FRAMES = 8;
export const WALK_FPS = 16;
/** How long the idle loop takes to go round, in seconds. */
export const IDLE_SECONDS = IDLE_FRAMES / IDLE_FPS;
/** Frames a second of an attack, and of the things a hero does when left standing. */
export const CLIP_FPS = 30;
export const GESTURE_FPS = 20;

/** The idle loop: the wind goes once round, and the chest sinks for half of it. */
export function idlePoses(): Partial<Pose>[] {
  const out: Partial<Pose>[] = [];
  for (let i = 0; i < IDLE_FRAMES; i++) out.push({ wind: i / IDLE_FRAMES, bob: i >= IDLE_FRAMES / 2 ? 1 : 0 });
  return out;
}

/**
 * A walk: each foot goes forward through the air and back along the floor, half a cycle apart.
 * The body dips as the weight comes down on a foot and rises as the other leg passes, it sways
 * toward the foot that carries it, the weapon arm swings against the near leg, and whatever flies
 * in the wind flies harder.
 */
export function walkPoses(): Partial<Pose>[] {
  const out: Partial<Pose>[] = [];
  const half = WALK_FRAMES / 2;
  for (let i = 0; i < WALK_FRAMES; i++) {
    const a = (i / WALK_FRAMES) * Math.PI * 2;
    out.push({
      near: -Math.cos(a),
      nearLift: Math.max(0, Math.sin(a)),
      far: Math.cos(a),
      farLift: Math.max(0, -Math.sin(a)),
      bob: i % half < half / 2 ? 1 : 0,
      lean: Math.round(Math.sin(a) * 0.8),
      swing: Math.cos(a),
      wind: ((i / WALK_FRAMES) * 2) % 1,
      drag: 1,
    });
  }
  return out;
}

/**
 * A RUN of a figure's own, in place of the kit's walk (from Version 15.1; the owner, 6 Oct 2026:
 * heroes are to be "very stylized and cool. Proud and daring or a roguish charm", and "I want
 * things to have weight"). The same eight frames and two steps, with what gives a runner a
 * character: how far forward they lean into it (`lean`), how hard each footfall comes down
 * (`dip`: the body drops that far as a foot lands, half as far the frame after, and rides up
 * between), how long the stride is (`stride`, 1 = the kit's), and how far their cloth is thrown
 * back (`drag`, 1 = the kit's). `each` adds anything else a frame of it should have.
 */
export function runPoses(o: { lean: number; dip: number; stride: number; drag: number; each?: (i: number, a: number) => Partial<Pose> }): Partial<Pose>[] {
  const out: Partial<Pose>[] = [];
  const half = WALK_FRAMES / 2;
  for (let i = 0; i < WALK_FRAMES; i++) {
    const a = (i / WALK_FRAMES) * Math.PI * 2;
    out.push({
      near: -Math.cos(a) * o.stride,
      nearLift: Math.max(0, Math.sin(a)),
      far: Math.cos(a) * o.stride,
      farLift: Math.max(0, -Math.sin(a)),
      // (a foot has just come down in the first frame of each half of the cycle)
      bob: i % half === 0 ? o.dip : i % half === 1 ? Math.ceil(o.dip / 2) : 0,
      lean: o.lean + Math.round(Math.sin(a) * 0.8),
      swing: Math.cos(a),
      wind: ((i / WALK_FRAMES) * 2) % 1,
      drag: o.drag,
      ...(o.each ? o.each(i, a) : {}),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// From paintings to the game's art

/** One painted frame: the picture, the lights it gives off and where its tails are fixed (all in picture pixels). */
export interface Painted {
  px: Px;
  lights: Light[];
  tails?: TailRoot[];
}

/** Paints one frame of a hero. */
export type Rig = (q: Pose, back: boolean) => Painted;

// What glows on a hero, brightest first, and what each tone cools to as the light goes out of it
// (Pose.out): a step down the same blue, and at the last the plain steel of a thing that is not lit.
const GLOW_STEPS: ReadonlyArray<readonly [string, string, string, string]> = [
  ['#ffffff', '#8af6f0', '#22d0e0', STEEL[2]],
  ['#b8fff8', '#22d0e0', '#0c6a80', STEEL[2]],
  ['#8af6f0', '#22d0e0', '#0c6a80', STEEL[2]],
  ['#7af8f0', '#22d0e0', '#0c6a80', STEEL[2]],
  ['#22d0e0', '#0c6a80', '#0c6a80', STEEL[1]],
  ['#0c6a80', '#0c6a80', MAIL[1], MAIL[1]],
];
const packed = (c: string): number => {
  const [r, g, b] = rgba(c);
  return (r << 16) | (g << 8) | b;
};
const GLOW_TO: ReadonlyArray<Map<number, readonly [number, number, number, number]>> = [1, 2, 3].map((n) => new Map(GLOW_STEPS.map((row) => [packed(row[0]), rgba(row[n])])));

/**
 * The light goes out of a painting (Pose.out, 0..1): every pixel of a glowing tone is cooled by
 * one step, two, or all the way to dull steel, and the lights it gives off are dimmed by as much.
 * The painting is changed where it is, and handed back.
 */
export function lightsOut(f: Painted, out: number): Painted {
  const k = Math.max(0, Math.min(1, out));
  const stage = k >= 0.85 ? 3 : k >= 0.55 ? 2 : k >= 0.25 ? 1 : 0;
  if (stage > 0) {
    const to = GLOW_TO[stage - 1];
    const d = f.px.d;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const c = to.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      if (!c) continue;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
    }
  }
  f.lights = k >= 0.98 ? [] : f.lights.map((l) => ({ ...l, a: (l.a ?? 1) * (1 - k) }));
  return f;
}

/**
 * The pool of light behind a hero (as on the style's own sheets): it lifts the figure off a dark
 * floor, whatever that floor is painted like. In picture pixels, from the canvas's top left corner.
 */
const AURA: Light = { x: KAX - 4, y: KAY - 30, r: 46, color: '#28dcf0', a: 0.2 };

/** How strong the crisp edge of light round a figure is (of 255). */
export const RIM_ALPHA = 110;

/**
 * THE CRISP EDGE (the owner, 6 Oct 2026: "Give the entities a subtle neon glow or a loop crisp
 * 1-pixel border so they pop against the dark dungeon"): every empty pixel beside the figure
 * takes the colour, part seen through. One picture pixel wide, outside the figure. Cyan on a
 * hero (art/skin.ts paints it as it puts a figure together), hot pink on an enemy (art/mkit.ts,
 * `RigOpts.rim`): what glows on a friend is cyan, what glows on an enemy is pink.
 */
export function edge(p: Px, color: string, alpha = RIM_ALPHA): void {
  const w = p.w;
  const h = p.h;
  const d = p.d;
  const c = rgba(color);
  const at: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] > 0) continue;
      if ((x > 0 && d[i - 1] > 0) || (x < w - 1 && d[i + 7] > 0) || (y > 0 && d[i - w * 4 + 3] > 0) || (y < h - 1 && d[i + w * 4 + 3] > 0)) at.push(i);
    }
  }
  for (const i of at) {
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = alpha;
  }
}

export function toSprite(f: Painted, aura: Light | null = AURA, ax = KAX, ay = KAY): Sprite {
  // The figure fills a fraction of its canvas, and there are a couple of hundred frames of each
  // hero: keep only the box that holds it (on whole game pixels, so it is laid down as before).
  // (`ax`, `ay`: the floor point under the figure, where it is not the kit's own.)
  const box = f.px.bounds(GRAIN) ?? { x: 0, y: 0, w: GRAIN, h: GRAIN };
  const s = f.px.crop(box.x, box.y, box.w, box.h).sprite(ax - box.x, ay - box.y, GRAIN);
  const game = (l: Light): Light => ({ ...l, x: (l.x - box.x) / GRAIN, y: (l.y - box.y) / GRAIN, r: l.r / GRAIN });
  if (f.lights.length) s.lights = f.lights.map(game);
  // (the heroes' pool of light unless told otherwise: a monster has a dimmer, redder one of its own, or none)
  if (aura) s.aura = game(aura);
  if (f.tails && f.tails.length) s.tails = f.tails.map((r) => ({ ...r, x: (r.x - box.x) / GRAIN, y: (r.y - box.y) / GRAIN }));
  return s;
}

/**
 * For measuring: how many frames have been painted since the page was opened, and how long the
 * painting of them took in all, in thousandths of a second. (A playtest that looks for a long
 * frame can ask whether it was painting that made it long: window.__dbg.painting.)
 */
export const PAINTING = { frames: 0, ms: 0 };

/**
 * A list of frames, each painted the first time it is asked for. (Painting a frame takes a few
 * thousandths of a second; painting every frame of every hero at start-up would be a pause you
 * could feel on a phone.)
 */
export function lazyFrames(n: number, make: (i: number) => Sprite): Sprite[] {
  const out: Sprite[] = new Array<Sprite>(n);
  for (let i = 0; i < n; i++) {
    Object.defineProperty(out, i, {
      configurable: true,
      enumerable: true,
      get(): Sprite {
        const t0 = performance.now();
        const s = make(i);
        PAINTING.frames++;
        PAINTING.ms += performance.now() - t0;
        Object.defineProperty(out, i, { value: s, writable: true, configurable: true, enumerable: true });
        return s;
      },
    });
  }
  return out;
}

/**
 * The standing loop of a figure that only ever stands and faces the camera (the town's people):
 * the kit's idle poses over `rest`, each frame painted the first time it is shown. Play it at
 * IDLE_FPS.
 */
export function standing(rig: (q: Pose) => Painted, rest: Partial<Pose> = {}, opts: RigOpts = {}): Sprite[] {
  return posed(rig, idlePoses(), rest, opts);
}

/**
 * Any run of poses of a figure that only ever faces the camera (a loop of a townsperson's own
 * length, or what they do now and then), each frame painted the first time it is shown.
 */
export function posed(rig: (q: Pose) => Painted, poses: ReadonlyArray<Partial<Pose>>, rest: Partial<Pose> = {}, opts: RigOpts = {}): Sprite[] {
  const base: Pose = { ...REST, ...rest };
  const [ax, ay] = opts.anchor ?? [KAX, KAY];
  return lazyFrames(poses.length, (i) => framed(() => toSprite(rig({ ...base, ...poses[i] }), opts.aura === undefined ? AURA : opts.aura, ax, ay)));
}

/**
 * A run of frames that no Pose describes (a monster's death: it comes apart, it crumples, it
 * lies): frame i of `n` is whatever `paint(k)` paints for k = i / (n - 1), 0 to 1, each painted
 * the first time it is shown.
 */
export function paintedFrames(n: number, paint: (k: number) => Painted, opts: RigOpts = {}): Sprite[] {
  const [ax, ay] = opts.anchor ?? [KAX, KAY];
  return lazyFrames(n, (i) => framed(() => toSprite(paint(n > 1 ? i / (n - 1) : 1), opts.aura === undefined ? AURA : opts.aura, ax, ay)));
}

/** What a hero does besides standing and walking, as timelines (clip.ts). */
export interface Moves {
  /** The quick attack: wind-up, the blow or the release, follow-through, back to rest. */
  attack: Timeline;
  /** The slow attack, likewise. */
  heavy?: Timeline;
  /** A leap: pushing off, in the air, coming down. Its keys run from 0 (leaving the floor) to 1 (landing). */
  leap?: Timeline;
  /** Two things the hero does when left standing. Painted for the view that faces the camera only. */
  idleA?: Timeline;
  idleB?: Timeline;
  /**
   * What the hero does for as long as an attack is held. From its `loop` moment on it goes round
   * and round (its last key is the first of the loop again); what comes before is played once.
   */
  hold?: Timeline;
  /** ... and what they do when it is let go, in place of the rest of the attack. */
  release?: Timeline;
  /** The same two for a whirlwind: the spin (a loop), and coming out of it. */
  whirl?: Timeline;
  whirlEnd?: Timeline;
  /** A walk of the figure's own, in place of the kit's (see runPoses): WALK_FRAMES poses, played at WALK_FPS. */
  walk?: ReadonlyArray<Partial<Pose>>;
  /** A roll: its keys run from 0 (going down into it) to 1 (up out of it), as a leap's do. */
  roll?: Timeline;
  /** What the hero does once a leap has landed, if left standing: it begins as the leap's last frame and ends standing. */
  land?: Timeline;
  /**
   * How the hero FALLS when their life runs out: from standing to how they are left, which is its
   * last frame, held for as long as the game shows them. (The owner, 6 Oct 2026: heroes are to be
   * "very stylized and cool. Proud and daring", and "I want things to have weight". Until then a
   * hero whose life ran out simply stood there behind the words YOU DIED.)
   */
  fall?: Timeline;
  /**
   * What a heavy blow does to the hero: rocked back on their heels and straight up again, in a
   * quarter of a second. It begins and ends as the figure stands. Shown only while they stand or
   * walk (an attack that is under way goes on).
   */
  reel?: Timeline;
  /** The same for a blow that comes from behind them: thrown forward a step, and upright again. */
  lurch?: Timeline;
}

/** How a rig reads its poses. */
export interface RigOpts {
  /** The rig's `off` names a few places the free hand can be (see Pose.off2). */
  stepped?: boolean;
  /** The pool of light behind the figure, in picture pixels: the heroes' own if not given, none if null. */
  aura?: Light | null;
  /**
   * The floor point under the figure on the rig's canvas, where that is not the kit's (KAX, KAY):
   * a figure too big for the kit's canvas paints on a bigger one of its own (its layers made with
   * `new Px(w, h)`; lit and compose take any size) and says here where it stands on it.
   */
  anchor?: V;
  /**
   * THE CRISP EDGE of light round the figure (see `edge`): its colour, or none. On every frame of
   * the figure alive; not on one whose light has gone out of it (Pose.out), and not on a death,
   * which is painted without these options.
   */
  rim?: string;
}

/** Every animation of one facing. Every pose starts from `rest`. */
export function animSet(rig: Rig, back: boolean, rest: Partial<Pose>, moves: Moves, opts: RigOpts = {}): AnimSet {
  const base: Pose = { ...REST, ...rest };
  const [ax, ay] = opts.anchor ?? [KAX, KAY];
  // (a figure whose light has gone out has no pool of light behind it either)
  // (as the light goes out of a figure, Pose.out, the pool of light behind it goes with it)
  const pool = opts.aura === undefined ? AURA : opts.aura;
  /** The figure in a pose, with its crisp edge if it has one. */
  const edged = (q: Pose): Painted => {
    const f = rig(q, back);
    if (opts.rim) edge(f.px, opts.rim);
    return f;
  };
  const frame = (q: Pose): Sprite =>
    framed(() => (q.out > 0.01 ? toSprite(lightsOut(rig(q, back), q.out), pool && q.out < 0.98 ? { ...pool, a: (pool.a ?? 1) * (1 - q.out) } : null, ax, ay) : toSprite(edged(q), pool, ax, ay)));
  const list = (poses: ReadonlyArray<Partial<Pose>>): Sprite[] => lazyFrames(poses.length, (i) => frame({ ...base, ...poses[i] }));
  const clip = (t: Timeline, fps: number): Clip => {
    const poses = clipPoses(t.keys, base, fps, opts.stepped === true);
    const c: Clip = { frames: lazyFrames(poses.length, (i) => frame(poses[i])), fps };
    if (t.hit !== undefined) c.hit = t.hit;
    if (t.loop !== undefined) c.loop = t.loop;
    return c;
  };
  /** The three frames older code asks an attack for (wound up, the blow, after it), taken from its timeline. */
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const at = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [at(hit * 0.7), at(hit + 0.035), at(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(moves.attack, CLIP_FPS);
  const set: AnimSet = { idle: list(idlePoses()), walk: list(moves.walk ?? walkPoses()), attack: three(attack), idleFps: IDLE_FPS, walkFps: WALK_FPS, clips: { attack } };
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  if (moves.heavy) {
    clips.heavy = clip(moves.heavy, CLIP_FPS);
    set.heavy = three(clips.heavy);
  }
  if (moves.hold) clips.hold = clip(moves.hold, CLIP_FPS);
  if (moves.release) clips.release = clip(moves.release, CLIP_FPS);
  if (moves.whirl) clips.whirl = clip(moves.whirl, CLIP_FPS);
  if (moves.whirlEnd) clips.whirlEnd = clip(moves.whirlEnd, CLIP_FPS);
  if (moves.land) clips.land = clip(moves.land, CLIP_FPS);
  if (moves.fall) clips.fall = clip(moves.fall, CLIP_FPS);
  if (moves.reel) clips.reel = clip(moves.reel, CLIP_FPS);
  if (moves.lurch) clips.lurch = clip(moves.lurch, CLIP_FPS);
  // (a roll's timeline runs from 0 to 1, like a leap's: shown by how far through the roll the hero is)
  if (moves.roll) clips.roll = clip(moves.roll, 12);
  if (moves.leap) {
    // (a leap's timeline runs from 0 to 1: twelve frames of it, shown by how far through the leap the hero is)
    clips.leap = clip(moves.leap, 12);
    const n = clips.leap.frames.length;
    const leap = clips.leap;
    set.leap = lazyFrames(3, (i) => leap.frames[Math.min(n - 1, Math.round([0.05, 0.45, 0.9][i] * (n - 1)))]);
  }
  // What a hero does when left standing begins and ends in the standing loop's first frame, and
  // the wind keeps blowing through it at the loop's own pace: so it must last a whole number of
  // loops (checked in the tests), and its cloth then joins the loop's without a jump.
  const gesture = (t: Timeline): Clip => {
    const poses = clipPoses(t.keys, base, GESTURE_FPS, opts.stepped === true);
    poses.forEach((q, i) => {
      q.wind = (i / GESTURE_FPS / IDLE_SECONDS) % 1;
    });
    return { frames: lazyFrames(poses.length, (i) => frame(poses[i])), fps: GESTURE_FPS };
  };
  if (!back && moves.idleA) clips.idleA = gesture(moves.idleA);
  if (!back && moves.idleB) clips.idleB = gesture(moves.idleB);
  return set;
}
