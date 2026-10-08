// DRESSING A SKELETON (begun 6 Oct 2026; made solid that evening). The bones (skeleton.ts) say
// where every joint of a posed figure is; this is what a hero's painter needs to put flesh, mail
// and cloth on them, for either of the game's two views.
//
// EVERYTHING HERE IS A SOLID. The owner, 6 Oct 2026, of the first heroes painted over the bones:
// "The skeleton gives them shape, but not proportion. They lost all girth"; "do what you can to
// make sure the arms don't clip through the clothing"; and "use the same art principals outlined
// before to create a 3D look" (his rules for the dungeon: "a lighter Top face (catching light), a
// medium Left face, and a darker Right face (in shadow)"; "a soft, semi-transparent black oval";
// "a crisp 1-pixel border so they pop against the dark dungeon").
//
//   - A part is a ball, a rod or a length of cloth, and is painted BY THE WAY ITS SKIN FACES: what
//     faces up is the light tone of its material, what faces the left of the screen the middle
//     tone, what faces the right or the floor the dark one. That is one light, from the upper
//     left and a little toward the eye (the kit's own), on a real surface: a top, a left face and
//     a right face, on a pauldron as on a block of wall.
//   - EVERY PIXEL KNOWS HOW NEAR THE EYE IT IS. Parts are not stacked whole, one layer over
//     another, as they were that morning (an arm was then in front of the chest or behind it, all
//     of it): the nearer SKIN wins, pixel by pixel. An arm that comes across the chest is in
//     front of it where it crosses and behind the shoulder it hangs from, and nobody has to say
//     so. (The skeleton keeps arms out of the body itself: `solve`.)
//   - The style's dark seam is drawn where one part ends in front of another, and round the whole
//     figure; and outside that, if asked for, the crisp edge of light that lifts a figure off a
//     dark floor (`whole`).

import { Px, rgba } from '../engine/px';
import { INK, RIM_ALPHA, edge, hash } from './kit';
import type { Ramp, V } from './kit';
import { add, cross, dot, lerp3, mul, norm, project, sub } from './skeleton';
import type { Build, Skeleton, Solid, V3 } from './skeleton';

/** One of the game's two views of a figure (the other two are these in a mirror). */
export type GameView = 'front' | 'back';

/**
 * The canvas a hero on bones is painted on, and where on it the floor under them is. It is
 * bigger than the kit's own (112 square, the floor 10 from its bottom): a figure built like a
 * person, with a blade as long as its own legs and body together, reaches further than the old
 * figures did, and a blade that trails toward the eye is seen well below the feet.
 */
export const CANVAS3 = { w: 176, h: 176, ax: 84, ay: 132 };

/** A length of the figure that lies square to the eye is this many pixels of the picture (one that stands upright is one for one: the eye looks down on it). */
export const SEEN = 2 / Math.sqrt(3);

/** The light, as the eye sees it: from the left, from above, and a little from the eye's own side (the kit's). */
const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;
/** How much of the light a skin must take to be painted in its material's light tone, and how little to be in its dark one. */
const LIGHT_AT = 0.5;
const DARK_AT = 0.16;

/** Which of a ramp's five tones a skin gets for the share of the light it takes. */
export function toneOf(nl: number): number {
  return nl > 0.93 ? 4 : nl > LIGHT_AT ? 3 : nl > DARK_AT ? 2 : nl > -0.3 ? 1 : 0;
}

/**
 * A part of a figure: a painting in which every pixel also knows how near the eye it is. A pixel
 * that was painted without saying (a line drawn on with `set`) is as near as the sheet itself.
 */
export class Sheet extends Px {
  readonly z: Float32Array;
  /** How near the eye the sheet is, for whatever is painted on it without a nearness of its own. */
  near = 0;
  /** Of two parts equally near, the one asked for later is in front. */
  order = 0;
  constructor(w: number, h: number) {
    super(w, h);
    this.z = new Float32Array(w * h).fill(NaN);
  }
  /** One pixel, with how near it is; kept only if nothing nearer of this part is there already. */
  put(x: number, y: number, c: string, z: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const k = y * this.w + x;
    const was = this.z[k];
    if (this.d[k * 4 + 3] > 0 && !(z >= (Number.isNaN(was) ? this.near : was))) return;
    const v = rgba(c);
    const i = k * 4;
    this.d[i] = v[0];
    this.d[i + 1] = v[1];
    this.d[i + 2] = v[2];
    this.d[i + 3] = 255;
    this.z[k] = z;
  }
  /** A pixel drawn ON what is already painted there (a belt on a coat, an eye on a face): it is as near as that, and a little nearer. Nothing is drawn where the part is not. */
  mark(x: number, y: number, c: string): void {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.has(x, y)) return;
    const k = y * this.w + x;
    const z = this.z[k];
    this.set(x, y, c);
    this.z[k] = z;
  }
  /** How near the eye the part is at a pixel (-Infinity where it is not painted). */
  nearAt(x: number, y: number): number {
    if (!this.has(x, y)) return -Infinity;
    const z = this.z[y * this.w + x];
    return Number.isNaN(z) ? this.near : z;
  }
  wipe(): void {
    this.d.fill(0);
    this.z.fill(NaN);
  }
}

type M3 = readonly [V3, V3, V3];

/** Where the parts of one frame are painted, and how they are put together. */
export interface Stage {
  view: GameView;
  /** Two layers that get no dark seam round them: one under everything (a bowstring behind the archer), one over everything (a glowing crystal, sparks). */
  under: Px;
  over: Px;
  /**
   * The whole frame: `under`, every part with the nearer skin winning at each pixel and the
   * style's dark seam where one part ends in front of another and round the figure, then `over`.
   * `rim`: a colour for the crisp edge of light outside the seam (a hero's is cyan, an enemy's
   * pink), or nothing for none.
   */
  whole(rim?: string | null): Px;
  /** Where a point of the figure is on the canvas, in picture pixels (not rounded). */
  at(p: V3): V;
  /** How near the eye a point is (bigger = nearer), in the figure's own lengths. */
  near(p: V3): number;
  /** A direction of the figure as the eye sees it: across the picture, down it, and toward the eye (its length kept). */
  seen(v: V3): V3;
  /** A fresh part, as near the eye as `where` (a point of the figure, or a number) for whatever is drawn on it flat. */
  part(where?: V3 | number): Sheet;
  /** The way to the eye, in the figure's own space (a unit). */
  eye: V3;
  /** A step across the picture, down it and toward the eye, each as a step of the figure's own space. */
  back: M3;
}

// Layers for the frame being painted: a pool, used again for the next frame.
const pool: Sheet[] = [];
let taken = 0;
let zbuf = new Float32Array(0);
let idbuf = new Int16Array(0);

const VIEWS: Record<string, { rows: M3; back: M3; eye: V3 }> = {};
function viewOf(view: GameView): { rows: M3; back: M3; eye: V3 } {
  const have = VIEWS[view];
  if (have) return have;
  const ex = project([1, 0, 0], view);
  const ey = project([0, 1, 0], view);
  const ez = project([0, 0, 1], view);
  const rows: M3 = [[ex[0], ey[0], ez[0]], [ex[1], ey[1], ez[1]], [ex[2], ey[2], ez[2]]];
  const [a, b, c] = rows[0];
  const [d, e, f] = rows[1];
  const [g, h, i] = rows[2];
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  const back: M3 = [
    [(e * i - f * h) / det, (c * h - b * i) / det, (b * f - c * e) / det],
    [(f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det],
    [(d * h - e * g) / det, (b * g - a * h) / det, (a * e - b * d) / det],
  ];
  return (VIEWS[view] = { rows, back, eye: norm([back[0][2], back[1][2], back[2][2]]) });
}

export function stage(view: GameView, ax = CANVAS3.ax, ay = CANVAS3.ay): Stage {
  const parts: Sheet[] = [];
  taken = 0;
  const layer = (): Sheet => {
    let p = pool[taken];
    if (!p) p = pool[taken] = new Sheet(CANVAS3.w, CANVAS3.h);
    else p.wipe();
    taken++;
    return p;
  };
  const { rows, back, eye } = viewOf(view);
  const near = (p: V3): number => rows[2][0] * p[0] + rows[2][1] * p[1] + rows[2][2] * p[2];
  const under = layer();
  const over = layer();
  const W = CANVAS3.w;
  const H = CANVAS3.h;
  return {
    view,
    under,
    over,
    eye,
    back,
    at: (p) => [ax + rows[0][0] * p[0] + rows[0][1] * p[1] + rows[0][2] * p[2], ay + rows[1][0] * p[0] + rows[1][1] * p[1] + rows[1][2] * p[2]],
    near,
    seen: (v) => [rows[0][0] * v[0] + rows[0][1] * v[1] + rows[0][2] * v[2], rows[1][0] * v[0] + rows[1][1] * v[1] + rows[1][2] * v[2], near(v)],
    part: (where = 0) => {
      const s = layer();
      s.near = typeof where === 'number' ? where : near(where);
      s.order = parts.length;
      parts.push(s);
      return s;
    },
    whole: (rim = null) => {
      const out = new Px(W, H);
      const o = out.d;
      if (zbuf.length !== W * H) {
        zbuf = new Float32Array(W * H);
        idbuf = new Int16Array(W * H);
      }
      zbuf.fill(-Infinity);
      idbuf.fill(-1);
      // the nearer skin wins, pixel by pixel
      for (let n = 0; n < parts.length; n++) {
        const s = parts[n];
        const d = s.d;
        const z = s.z;
        for (let k = 0, i = 3; k < W * H; k++, i += 4) {
          if (d[i] === 0) continue;
          const zk = z[k];
          const here = zk !== zk ? s.near : zk;
          if (here < zbuf[k]) continue;
          zbuf[k] = here;
          idbuf[k] = n;
        }
      }
      // (for looking into a fault: which layer, in the order they were made, won each pixel)
      const seen = (globalThis as { __partsSeen?: (ids: Int16Array, w: number, h: number) => void }).__partsSeen;
      if (seen) seen(idbuf, W, H);
      const ink = rgba(INK);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x;
          const i = k * 4;
          const id = idbuf[k];
          // the seam: this pixel is dark if a different part, nearer the eye, ends beside it; or if it is empty and the figure ends beside it
          let seam = false;
          for (let side = 0; side < 4 && !seam; side++) {
            const xx = side === 0 ? x - 1 : side === 1 ? x + 1 : x;
            const yy = side === 2 ? y - 1 : side === 3 ? y + 1 : y;
            if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
            const j = yy * W + xx;
            const other = idbuf[j];
            if (other < 0 || other === id) continue;
            if (id < 0) seam = true;
            else {
              const dz = zbuf[j] - zbuf[k];
              seam = dz > 0.4 || (dz > -0.4 && other > id);
            }
          }
          if (seam) {
            o[i] = ink[0];
            o[i + 1] = ink[1];
            o[i + 2] = ink[2];
            o[i + 3] = 255;
          } else if (id >= 0) {
            const d = parts[id].d;
            o[i] = d[i];
            o[i + 1] = d[i + 1];
            o[i + 2] = d[i + 2];
            o[i + 3] = 255;
          }
        }
      }
      // what goes under everything shows only where nothing else is; what goes over everything, over everything
      const ud = under.d;
      const vd = over.d;
      for (let i = 0; i < W * H * 4; i += 4) {
        if (o[i + 3] === 0 && ud[i + 3] > 0) {
          o[i] = ud[i];
          o[i + 1] = ud[i + 1];
          o[i + 2] = ud[i + 2];
          o[i + 3] = 255;
        }
        if (vd[i + 3] > 0) {
          o[i] = vd[i];
          o[i + 1] = vd[i + 1];
          o[i + 2] = vd[i + 2];
          o[i + 3] = 255;
        }
      }
      if (rim) edge(out, rim);
      return out;
    },
  };
}

// (the crisp edge of light round a figure is the kit's: the monsters, which are painted with the kit's rigs, wear it too)
export { RIM_ALPHA, edge };

export const mid = (a: V3, b: V3, k = 0.5): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** A point given from another, along a part's own forward, left and up. */
export function off(c: V3, r: readonly [V3, V3, V3], fwd: number, left: number, up: number): V3 {
  return add(c, add(mul(r[0], fwd), add(mul(r[1], left), mul(r[2], up))));
}

/**
 * A colour for a part: its own, or (for whatever is on the far side of the body from the eye) a
 * step darker, as the kit paints the further arm and the further leg of every figure.
 */
export function sided(st: Stage, s: Skeleton, ramp: Ramp, p: V3): Ramp {
  return st.near(p) < st.near(s.pelvis) - 1.6 ? [ramp[0], ramp[0], ramp[1], ramp[2], ramp[3]] : ramp;
}

// ---------------------------------------------------------------------------------------------
// The solids

/** What a solid is painted with: a material (lit by the way its skin faces), or a painter of its own. */
export type Skin = Ramp | ((u: V3, tone: number, x: number, y: number) => string | null);

/**
 * A BALL: `c` its middle, `axes` its three half-lengths, each along its own line (so it may be
 * an egg, or flat as a plate). For every pixel of it that is seen, the skin is asked what colour
 * it is there: told where on the ball that is (`u`: how far toward its first, second and third
 * axis, each from -1 to 1) and how the light falls there. A face painted so is a face from
 * whichever side it is looked at, and turns and tips with the head it is on. `shade` takes that
 * much of the light off all of it (something under a brim).
 */
export function ball(p: Sheet, st: Stage, c: V3, axes: readonly [V3, V3, V3], skin: Skin, shade = 0): void {
  const back = st.back;
  const [cx, cy] = st.at(c);
  const zc = st.near(c);
  const r = axes.map((v) => Math.hypot(v[0], v[1], v[2]) || 1);
  const hat = axes.map((v, k) => [v[0] / r[k], v[1] / r[k], v[2] / r[k]] as V3);
  // (a step across the screen, a step down it and a step toward the eye, each as the ball measures them)
  const inBall = (w: V3): V3 => [(w[0] * hat[0][0] + w[1] * hat[0][1] + w[2] * hat[0][2]) / r[0], (w[0] * hat[1][0] + w[1] * hat[1][1] + w[2] * hat[1][2]) / r[1], (w[0] * hat[2][0] + w[1] * hat[2][1] + w[2] * hat[2][2]) / r[2]];
  const col = (k: number): V3 => [back[0][k], back[1][k], back[2][k]];
  const X = inBall(col(0));
  const Y = inBall(col(1));
  const Z = inBall(col(2));
  const zz = Z[0] * Z[0] + Z[1] * Z[1] + Z[2] * Z[2];
  let far = 0;
  for (const v of axes) {
    const q = st.seen(v);
    far = Math.max(far, Math.hypot(q[0], q[1]));
  }
  const reach = Math.ceil(far * 1.75) + 1;
  const paint = typeof skin === 'function' ? skin : null;
  const ramp = typeof skin === 'function' ? null : skin;
  for (let y = Math.floor(cy - reach); y <= Math.ceil(cy + reach); y++) {
    for (let x = Math.floor(cx - reach); x <= Math.ceil(cx + reach); x++) {
      const sx = x + 0.5 - cx;
      const sy = y + 0.5 - cy;
      const U: V3 = [X[0] * sx + Y[0] * sy, X[1] * sx + Y[1] * sy, X[2] * sx + Y[2] * sy];
      const uz = U[0] * Z[0] + U[1] * Z[1] + U[2] * Z[2];
      const disc = uz * uz - zz * (U[0] * U[0] + U[1] * U[1] + U[2] * U[2] - 1);
      if (disc < 0) continue;
      const t = (-uz + Math.sqrt(disc)) / zz;
      const u: V3 = [U[0] + Z[0] * t, U[1] + Z[1] * t, U[2] + Z[2] * t];
      // the way the skin faces there (in the figure's space), then as the eye sees it, and how much of the light it takes
      const nx = (u[0] / r[0]) * hat[0][0] + (u[1] / r[1]) * hat[1][0] + (u[2] / r[2]) * hat[2][0];
      const ny = (u[0] / r[0]) * hat[0][1] + (u[1] / r[1]) * hat[1][1] + (u[2] / r[2]) * hat[2][1];
      const nz = (u[0] / r[0]) * hat[0][2] + (u[1] / r[1]) * hat[1][2] + (u[2] / r[2]) * hat[2][2];
      const n = st.seen([nx, ny, nz]);
      const nn = Math.hypot(n[0], n[1], n[2]) || 1;
      const tone = toneOf((n[0] * LX + n[1] * LY + n[2] * LZ) / nn - shade);
      const colour = paint ? paint(u, tone, x, y) : (ramp as Ramp)[tone];
      if (colour) p.put(x, y, colour, zc + t);
    }
  }
}

/** What a rod is, besides its material. */
export interface RodLook {
  /** Mail: the links show. */
  links?: boolean;
  /** Takes this much of the light off it (a leg under a skirt). */
  shade?: number;
}

/**
 * A ROD between two points of the figure: round, `ra` thick at the one end and `rb` at the other
 * (each a radius, in the figure's own lengths), its ends rounded. An arm, a shin, a staff. Lit
 * by the way its skin faces, and every pixel of it as near the eye as its skin is there.
 */
export function rod(p: Sheet, st: Stage, a: V3, b: V3, ra: number, rb: number, ramp: Ramp, look: RodLook = {}): void {
  const [x0, y0] = st.at(a);
  const [x1, y1] = st.at(b);
  const za = st.near(a);
  const zb = st.near(b);
  const R0 = ra * SEEN;
  const R1 = rb * SEEN;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const rMax = Math.max(R0, R1) + 1;
  const shade = look.shade ?? 0;
  // The skin of a rod faces straight out from its own line, all round it. As the eye sees it:
  // `across` is the way that lies in the picture, square to the rod; `out` the way square to both
  // the rod and that, on the eye's side. (A rod that stands upright is looked down on: the middle
  // of it faces the eye and a little down, which is why an upright arm has no light on it except
  // along its left edge, and a level one is light all along its top.)
  const A = st.seen(sub(b, a));
  const flat = Math.hypot(A[0], A[1]);
  const al = Math.hypot(A[0], A[1], A[2]) || 1;
  const ax = flat > 1e-3 ? -A[1] / flat : 1;
  const ay = flat > 1e-3 ? A[0] / flat : 0;
  // (out = the rod's line crossed with `across`, turned to the eye's side)
  let ox3 = (A[1] * 0 - A[2] * ay) / al;
  let oy3 = (A[2] * ax - A[0] * 0) / al;
  let oz3 = (A[0] * ay - A[1] * ax) / al;
  if (oz3 < 0) {
    ox3 = -ox3;
    oy3 = -oy3;
    oz3 = -oz3;
  }
  const acrossL = ax * LX + ay * LY;
  const outL = ox3 * LX + oy3 * LY + oz3 * LZ;
  for (let y = Math.floor(Math.min(y0, y1) - rMax); y <= Math.ceil(Math.max(y0, y1) + rMax); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - rMax); x <= Math.ceil(Math.max(x0, x1) + rMax); x++) {
      const tt = ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2;
      const t = Math.max(0, Math.min(1, tt));
      const R = R0 + (R1 - R0) * t;
      const ox = x + 0.5 - (x0 + dx * t);
      const oy = y + 0.5 - (y0 + dy * t);
      const d2 = ox * ox + oy * oy;
      if (d2 > R * R) continue;
      const nz = Math.sqrt(1 - d2 / (R * R));
      let nl: number;
      let rise: number;
      if (tt <= 0 || tt >= 1 || flat < 0.2) {
        // (its rounded end: the skin of a ball)
        nl = (ox / R) * LX + (oy / R) * LY + nz * LZ;
        rise = nz;
      } else {
        const c = (ox * ax + oy * ay) / R;
        const k = Math.sqrt(Math.max(0, 1 - c * c));
        nl = c * acrossL + k * outL;
        rise = k * oz3;
      }
      let tone = toneOf(nl - shade);
      if (look.links && x % 2 === 0 && y % 2 === 0) tone = Math.max(0, tone - 1);
      p.put(x, y, ramp[tone], za + (zb - za) * t + (R / SEEN) * rise);
    }
  }
}

/** A ring of something that hangs or stands round a body: its middle, and its two half-lengths, each along its own line. */
export interface Ring {
  c: V3;
  u: V3;
  v: V3;
  /** Its edge as it really lies (blown about, left behind): these points of it are what is drawn, if given. */
  pts?: ReadonlyArray<V3>;
}
/** A ring's edge: `n` points round it. */
export function round(r: Ring, n = 16): V3[] {
  if (r.pts) return [...r.pts];
  const out: V3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push(add(r.c, add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a)))));
  }
  return out;
}

/** The corners of the smallest shape that holds all of some points of the picture, in order round it. */
export function hull(pts: ReadonlyArray<V>): V[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (o: V, a: V, b: V): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: V[] = [];
  for (const q of p) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: V[] = [];
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** How a length of cloth is finished. */
export interface ClothLook {
  /** Its hem is cut into points. */
  ragged?: boolean;
  /** A line of this colour along its hem (the mage's coat: it glows). */
  hem?: Ramp;
  /**
   * Folds: darker lines that follow it down from ring to ring, each at this many degrees round
   * the rings from their first line (0 is the front of a skirt, 90 its left side). They are on the
   * cloth, so they turn with it, and only those on the side toward the eye are seen.
   */
  folds?: ReadonlyArray<number>;
  /** How much its skin faces up (a skirt that flares: more) or down (less), over and above what its shape says. */
  lift?: number;
  /** Takes this much of the light off it. */
  shade?: number;
  /** It is a sheet, not a tube: as near the eye as its rings' middles and no nearer. */
  flat?: boolean;
  /**
   * Which half of the tube it is: the one toward the eye (if not given), or the one away from it,
   * seen from inside (a cloak down the back of someone who faces the eye: what shows of it either
   * side of them is its lining, and it is behind everything it goes round).
   */
  side?: 'near' | 'far';
  /**
   * It is only PART of a tube: from this many degrees round its rings to this many (0 is the
   * rings' first line, 90 their second: of a cape whose rings begin at the wearer's front, 100 to
   * 260 is what hangs down the back from shoulder to shoulder). Where the eye is outside it, its
   * outside is seen; where the eye looks into it, its lining; and where there is none of it,
   * nothing. So a cape is behind the arms of whoever wears it whichever way they are turned.
   */
  arc?: readonly [number, number];
  /** How much of the light is off its lining (0.3 if not given). */
  lining?: number;
}

// (scratch for cloth: which pixels a length of it covers)
let mask = new Uint8Array(0);

/**
 * CLOTH, or anything else that goes from ring to ring down a body: a skirt from the waist to its
 * hem, a coat from waist to hips to hem, a helm from brow to point. Each length of it is the
 * smallest shape round its two rings, lit as a round thing is (its left in the light, its right
 * in the dark, and the more it flares the more its skin faces up), and as near the eye as a
 * round thing's nearer side.
 */
export function cloth(p: Sheet, st: Stage, rings: ReadonlyArray<Ring>, ramp: Ramp, look: ClothLook = {}): void {
  const W = p.w;
  const H = p.h;
  if (mask.length !== W * H) mask = new Uint8Array(W * H);
  const shade = look.shade ?? 0;
  const way = look.side === 'far' ? -1 : 1;
  const arc = look.side === undefined && !look.flat ? look.arc : undefined;
  const lining = look.lining ?? 0.3;
  /** Is this place round a ring (radians) part of the cloth? */
  const has = (t: number): boolean => {
    if (!arc) return true;
    const deg = (((t * 180) / Math.PI - arc[0]) % 360 + 360) % 360;
    return deg <= arc[1] - arc[0];
  };
  /** A ring's two half-lengths as the eye sees them: across the picture, and toward the eye. */
  const lie = (r: Ring): readonly [number, number, number, number] => {
    const su = st.seen(r.u);
    const sv = st.seen(r.v);
    return [su[0], sv[0], su[2], sv[2]];
  };
  let x0 = W;
  let x1 = -1;
  let yLow = -1;
  for (let k = 0; k + 1 < rings.length; k++) {
    const A = rings[k];
    const B = rings[k + 1];
    const outline = hull([...round(A), ...round(B)].map((q) => st.at(q)));
    if (outline.length < 3) continue;
    const [, ay] = st.at(A.c);
    const [, by] = st.at(B.c);
    const za = st.near(A.c);
    const zb = st.near(B.c);
    const la = lie(A);
    const lb = lie(B);
    // (the way its skin faces at its middle line, and at its left edge: as a rod's does, round the line from ring to ring)
    const ln = st.seen(sub(B.c, A.c));
    const ll = Math.hypot(ln[0], ln[1], ln[2]) || 1;
    const lf = Math.hypot(ln[0], ln[1]);
    const cax = lf > 1e-3 ? -ln[1] / lf : 1;
    const cay = lf > 1e-3 ? ln[0] / lf : 0;
    let qx = (ln[1] * 0 - ln[2] * cay) / ll;
    let qy = (ln[2] * cax - ln[0] * 0) / ll;
    let qz = (ln[0] * cay - ln[1] * cax) / ll;
    if (qz < 0) {
      qx = -qx;
      qy = -qy;
      qz = -qz;
    }
    // (`across` runs to the right of the picture, so that -1 is the left edge of the cloth)
    const flip = cax < 0 ? -1 : 1;
    const acrossL = flip * (cax * LX + cay * LY);
    const outL = qx * LX + qy * LY + qz * LZ;
    // (the more a skirt flares, the more its skin faces up: what is up, as the eye sees it, takes this much of the light)
    const upL = -0.894 * LY + 0.447 * LZ;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const q of outline) {
      minY = Math.min(minY, q[1]);
      maxY = Math.max(maxY, q[1]);
    }
    // (how its skin faces up or down: by how its width changes down it)
    for (let y = Math.max(0, Math.floor(minY)); y < Math.min(H, Math.ceil(maxY)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < outline.length; i++) {
        const a = outline[i];
        const b = outline[(i + 1) % outline.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      if (xs.length < 2) continue;
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      const half = Math.max(0.5, (right - left) / 2);
      const middle = (left + right) / 2;
      const v = Math.abs(by - ay) < 0.5 ? 0.5 : Math.max(0, Math.min(1, (yc - ay) / (by - ay)));
      const zc = za + (zb - za) * v;
      // (the ring at this height: where round it each pixel of this row is, and so how near the
      // eye. A ring is an oval that lies askew to the eye, so its nearest point is not its middle.)
      const xu = la[0] + (lb[0] - la[0]) * v;
      const xv = la[1] + (lb[1] - la[1]) * v;
      const zu = la[2] + (lb[2] - la[2]) * v;
      const zv = la[3] + (lb[3] - la[3]) * v;
      const turn = Math.atan2(xv, xu);
      for (let x = Math.max(0, Math.round(left)); x < Math.min(W, Math.round(right)); x++) {
        const w = Math.max(-1, Math.min(1, (x + 0.5 - middle) / half));
        const nz = Math.sqrt(1 - w * w);
        const up = look.lift ?? 0.12;
        const nn = Math.hypot(1, up);
        const open = Math.acos(w);
        const z1 = zu * Math.cos(turn + open) + zv * Math.sin(turn + open);
        const z2 = zu * Math.cos(turn - open) + zv * Math.sin(turn - open);
        // (of a part of a tube: the nearer wall, seen from outside, if it is there; or else the further one, seen from inside)
        let side = way;
        let z = way > 0 ? Math.max(z1, z2) : Math.min(z1, z2);
        if (arc) {
          const nearFirst = z1 >= z2;
          const in1 = has(turn + open);
          const in2 = has(turn - open);
          if (nearFirst ? in1 : in2) side = 1;
          else if (nearFirst ? in2 : in1) side = -1;
          else continue;
          z = side > 0 ? Math.max(z1, z2) : Math.min(z1, z2);
        }
        const tone = toneOf((side * w * acrossL + nz * outL + up * upL) / nn - shade - (arc && side < 0 ? lining : 0));
        p.put(x, y, ramp[tone], zc + (look.flat ? 0 : side > 0 ? z + 0.5 : z - 0.5));
        mask[y * W + x] = arc && side < 0 ? 2 : 1;
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        yLow = Math.max(yLow, y);
      }
    }
  }
  if (look.folds && look.side !== 'far') {
    for (const deg of look.folds) {
      const a = (deg * Math.PI) / 180;
      for (let k = 0; k + 1 < rings.length; k++) {
        const A = rings[k];
        const B = rings[k + 1];
        const oa = add(mul(A.u, Math.cos(a)), mul(A.v, Math.sin(a)));
        const ob = add(mul(B.u, Math.cos(a)), mul(B.v, Math.sin(a)));
        if (st.near(ob) < 0.12 * Math.hypot(ob[0], ob[1], ob[2])) continue;
        // (a fold begins a little way down the cloth, not at the belt)
        const from = add(A.c, oa);
        const to = add(B.c, ob);
        const [fx, fy] = st.at(k === 0 ? lerp3(from, to, 0.35) : from);
        const [tx, ty] = st.at(to);
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(tx - fx), Math.abs(ty - fy))));
        for (let i = 0; i <= steps; i++) {
          const x = Math.round(fx + ((tx - fx) * i) / steps - 0.5);
          const y = Math.round(fy + ((ty - fy) * i) / steps - 0.5);
          if (x < 0 || y < 0 || x >= W || y >= H || mask[y * W + x] !== 1) continue;
          const now = p.get(x, y);
          const tone = now === null ? -1 : ramp.lastIndexOf(now);
          if (tone >= 2) p.mark(x, y, ramp[tone === 2 ? 1 : 2]);
        }
      }
    }
  }
  if (x1 >= 0 && (look.ragged || look.hem)) {
    for (let x = x0; x <= x1; x++) {
      for (let y = Math.min(H - 1, yLow); y > 0; y--) {
        if (!mask[y * W + x]) continue;
        if (look.ragged && (x & 3) < 2) {
          // (a point of the hem is cut away: two pixels of it on every fourth column, one on the next)
          p.erase(x, y);
          p.z[y * W + x] = NaN;
          if ((x & 3) === 0 && mask[(y - 1) * W + x]) {
            p.erase(x, y - 1);
            p.z[(y - 1) * W + x] = NaN;
          }
        } else if (look.hem && mask[(y - 1) * W + x]) p.mark(x, y - 1, look.hem[x < (x0 + x1) / 2 ? 3 : 2]);
        break;
      }
    }
  }
  if (x1 >= 0) for (let y = 0; y <= Math.min(H - 1, yLow); y++) for (let x = x0; x <= x1; x++) mask[y * W + x] = 0;
}

/**
 * A band round a ring (a belt, the band of a hat): the half of it that is toward the eye, drawn
 * on whatever part it is given, `rows` pixels deep, lit by the way it faces.
 */
export function band(p: Sheet, st: Stage, r: Ring, ramp: Ramp, rows = 2, lift = 0.35): void {
  const n = 96;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const out = add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a)));
    const s = st.seen(out);
    if (s[2] < -0.02 * Math.hypot(s[0], s[1], s[2])) continue;
    const nn = Math.hypot(s[0], s[1], s[2]) || 1;
    const tone = toneOf((s[0] * LX + s[1] * LY + s[2] * LZ) / nn);
    const at = add(r.c, out);
    const [x, y] = st.at(at);
    const z = st.near(at) + lift;
    for (let k = 0; k < rows; k++) p.put(Math.round(x - 0.5), Math.round(y - 0.5) + k, ramp[k === 0 ? Math.max(2, tone) : Math.min(tone, 2)], z);
  }
}

/** A line between two points of the figure, one pixel thick, as near the eye along it as the points are. */
export function thread(p: Sheet, st: Stage, a: V3, b: V3, color: string, lift = 0.3): void {
  const [x0, y0] = st.at(a);
  const [x1, y1] = st.at(b);
  const za = st.near(a) + lift;
  const zb = st.near(b) + lift;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    p.put(Math.round(x0 + (x1 - x0) * k - 0.5), Math.round(y0 + (y1 - y0) * k - 0.5), color, za + (zb - za) * k);
  }
}

/**
 * Gives every pixel of a part that was painted flat (with the kit's own brushes: a blade) the
 * nearness of the line from `a` to `b` where it is nearest that pixel: a sword is as near the
 * eye at its point as its point is, not as its hilt is.
 */
export function laidAlong(p: Sheet, st: Stage, a: V3, b: V3, lift = 0): void {
  const [x0, y0] = st.at(a);
  const [x1, y1] = st.at(b);
  const za = st.near(a) + lift;
  const zb = st.near(b) + lift;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const k = y * p.w + x;
      if (p.d[k * 4 + 3] === 0 || !Number.isNaN(p.z[k])) continue;
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2));
      p.z[k] = za + (zb - za) * t;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The parts every figure has

/** The trunk's three solids, each made `more` bigger all round (what is worn over them), as balls to paint. */
export function trunkBalls(trunk: readonly [Solid, Solid, Solid], more: number): { c: V3; axes: readonly [V3, V3, V3] }[] {
  return trunk.map((o) => ({ c: o.c, axes: [mul(o.r[0], o.h[0] + more), mul(o.r[1], o.h[1] + more), mul(o.r[2], o.h[2] + more * 0.5)] as const }));
}

/** A ring round the body at a height on a solid of the trunk: `up` from -1 (its foot) to 1 (its top), `more` bigger all round than the solid. */
export function girdle(o: Solid, up: number, more: number): Ring {
  const k = Math.sqrt(Math.max(0.05, 1 - up * up));
  return { c: add(o.c, mul(o.r[2], o.h[2] * up)), u: mul(o.r[0], (o.h[0] + more) * k), v: mul(o.r[1], (o.h[1] + more) * k) };
}

/**
 * A HEM: the ring that cloth hanging from the hips comes down to, `drop` below the pelvis (never
 * lower than the floor). It hangs plumb whatever the hips are doing; it is wide enough to hold
 * both legs wherever they have gone (so a lunge spreads it and a crouch pools it), never narrower
 * than `wide` across and `deep` front to back; the wind stirs it, it is left behind by however
 * far the figure has just moved (`lag`), and a blast in the figure's face (`gale`) streams the
 * back of it out behind.
 */
export function hemOf(s: Skeleton, o: { drop: number; wide: number; deep: number; lag?: V3; wind?: number; gale?: number; reach?: number; n?: number }): Ring {
  // (plumb: the hips' forward and left, laid flat)
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l = norm([s.hips[1][0], s.hips[1][1], 0], [0, 1, 0]);
  const z = Math.max(0.9, s.pelvis[2] - o.drop);
  // (what of each leg is inside the cloth: the knee if the hem is above it, the ankle if it is below)
  const inside = (hip: V3, knee: V3, ankle: V3): V3 => {
    if (z >= knee[2]) return lerp3(hip, knee, Math.max(0, Math.min(1, (hip[2] - z) / Math.max(0.5, hip[2] - knee[2]))));
    return lerp3(knee, ankle, Math.max(0, Math.min(1, (knee[2] - z) / Math.max(0.5, knee[2] - ankle[2]))));
  };
  const a = inside(s.hipL, s.kneeL, s.ankleL);
  const b = inside(s.hipR, s.kneeR, s.ankleR);
  const between = mid(a, b);
  const share = o.reach ?? 0.85;
  const c: V3 = [s.pelvis[0] + (between[0] - s.pelvis[0]) * share, s.pelvis[1] + (between[1] - s.pelvis[1]) * share, z];
  const d = sub(a, b);
  const wide = Math.max(o.wide, Math.abs(dot(d, l)) / 2 + o.wide * 0.55);
  const deep = Math.max(o.deep, Math.abs(dot(d, f)) / 2 + o.deep * 0.6);
  const n = o.n ?? 16;
  const wind = (o.wind ?? 0) * Math.PI * 2;
  const gale = Math.max(0, o.gale ?? 0);
  const lag = o.lag ?? [0, 0, 0];
  const pts: V3[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const cf = Math.cos(ang);
    const sl = Math.sin(ang);
    // (how far round to the back this bit of hem is: the back of it is what flies)
    const rear = Math.max(0, -cf);
    const at = add(c, add(mul(f, cf * deep * (1 + Math.sin(wind + ang) * 0.05)), mul(l, sl * wide)));
    pts.push(add(at, add(mul(lag, 0.5 + rear * 0.6), add(mul(f, -gale * 13 * rear * rear - gale * 3 * Math.abs(sl)), [0, 0, Math.sin(wind + ang * 2) * 0.5 + gale * 4.5 * rear]))));
  }
  return { c, u: mul(f, deep), v: mul(l, wide), pts };
}

/**
 * WHAT IS INSIDE A LONG COAT IS NOT SEEN THROUGH IT: wherever `cover` has paint, each of `inner`
 * loses its own. Legs inside a coat that reaches the floor are behind its near wall by
 * construction (`skirtOf` makes it go round them); left to how near the eye each seemed, a knee
 * that pressed the cloth won a few pixels of it, because a cloth's nearness is worked out ring
 * by ring and is only nearly right. (Not for a short skirt: a shin that hangs from a raised knee
 * in front of a kilt is nearer than the kilt, and is seen.)
 */
export function hidden(inner: ReadonlyArray<Sheet>, cover: Sheet): void {
  const c = cover.d;
  for (const s of inner) {
    const d = s.d;
    for (let i = 3, k = 0; i < d.length; i += 4, k++) {
      if (c[i] === 0 || d[i] === 0) continue;
      d[i] = 0;
      s.z[k] = NaN;
    }
  }
}

/**
 * The place ON THE OUTSIDE OF A HANGING CLOTH that is level with `toward` and lies the same way
 * from the cloth's middle, and `out` further out than that: where something worn outside a coat
 * sits (a satchel on a hip), however the legs under the coat have pushed it out.
 */
export function onCloth(rings: ReadonlyArray<Ring>, toward: V3, out = 0): V3 {
  let k = 0;
  while (k + 2 < rings.length && rings[k + 1].c[2] > toward[2]) k++;
  const A = rings[k];
  const B = rings[k + 1];
  const t = Math.max(0, Math.min(1, (A.c[2] - toward[2]) / Math.max(1e-6, A.c[2] - B.c[2])));
  const c = lerp3(A.c, B.c, t);
  const u = lerp3(A.u, B.u, t);
  const v = lerp3(A.v, B.v, t);
  const d = sub(toward, c);
  const a = dot(d, u) / Math.max(1e-6, dot(u, u));
  const b = dot(d, v) / Math.max(1e-6, dot(v, v));
  const n = Math.hypot(a, b);
  if (n < 1e-6) return toward;
  const on = add(c, add(mul(u, a / n), mul(v, b / n)));
  const away = norm([on[0] - c[0], on[1] - c[1], 0], [1, 0, 0]);
  return [on[0] + away[0] * out, on[1] + away[1] * out, toward[2]];
}

/**
 * A SKIRT: cloth that hangs from a ring at the waist (`top`) down to a hem `drop` below the
 * pelvis, as rings to hand to `cloth`, one every few pixels of its fall. IT GOES ROUND THE LEGS
 * WHEREVER THEY ARE: each ring is big enough to hold whatever of either leg is at its height or
 * above it (cloth hangs from a raised knee), with the leg's own thickness and a little more, so
 * that no leg comes through it in any pose. Left to itself it widens evenly from the waist to
 * `wide` across and `deep` front to back at the hem; it hangs plumb whatever the hips are doing,
 * pools on the floor in a crouch, and its hem is stirred, left behind and blown as `hemOf` says.
 *
 * A SHORT SKIRT RIDES UP. Cloth that ends above the knee cannot reach a knee that is raised: it
 * lies along the thigh for its own length and no further. So a skirt shorter than a thigh is
 * shortened by as much as the thighs are raised from hanging, and goes round only as much of each
 * leg as it is long. (An archer down on one knee was sitting in a green dish the size of his
 * stride until it did.) A long coat does not: it spreads over a knee, and lies on the floor.
 */
export function skirtOf(s: Skeleton, B: Build, o: { top: Ring; drop: number; wide: number; deep: number; lag?: V3; wind?: number; gale?: number; pad?: number }): Ring[] {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l = norm([s.hips[1][0], s.hips[1][1], 0], [0, 1, 0]);
  const zTop = o.top.c[2];
  const short = o.drop < B.thigh * 1.15;
  // (how nearly each thigh hangs: 1 straight down, 0 level or raised)
  const hangs = Math.min(...[[s.hipL, s.kneeL], [s.hipR, s.kneeR]].map(([hip, knee]) => Math.max(0, Math.min(1, (hip[2] - knee[2]) / B.thigh))));
  const drop = short ? o.drop * (0.45 + 0.55 * hangs) : o.drop;
  const zHem = Math.min(zTop - 2, Math.max(0.9, s.pelvis[2] - drop));
  const n = Math.max(1, Math.ceil((zTop - zHem) / 5));
  const pad = o.pad ?? 0.9;
  const [rH, rK, rA] = B.legR;
  // (points down each leg, each with how thick the leg is there: as much of the leg as the cloth is long)
  const legs: [V3, number][] = [];
  const far = short ? drop * 1.1 : Infinity;
  for (const [hip, knee, ankle, heel, toe] of [[s.hipL, s.kneeL, s.ankleL, s.heelL, s.toeL], [s.hipR, s.kneeR, s.ankleR, s.heelR, s.toeR]] as [V3, V3, V3, V3, V3][]) {
    for (let i = 0; i <= 4; i++) if ((i / 4) * B.thigh <= far) legs.push([lerp3(hip, knee, i / 4), rH + (rK - rH) * (i / 4)]);
    for (let i = 1; i <= 4; i++) if (B.thigh + (i / 4) * B.shank <= far) legs.push([lerp3(knee, ankle, i / 4), rK + (rA - rK) * (i / 4) + 0.4]);
    // (and the foot, of a coat long enough to reach it: a heel kicked up behind in a run lifts the coat, it does not come through it)
    if (!short) {
      legs.push([add(heel, [0, 0, 1.2]), 1.9]);
      legs.push([add(lerp3(heel, toe, 0.5), [0, 0, 1.2]), 1.8]);
      legs.push([add(toe, [0, 0, 1.2]), 1.6]);
    }
  }
  const topWide = Math.hypot(dot(o.top.u, l), dot(o.top.v, l));
  const topDeep = Math.hypot(dot(o.top.u, f), dot(o.top.v, f));
  const out: Ring[] = [o.top];
  const lag = o.lag ?? [0, 0, 0];
  // THE CLOTH HANGS IN ONE LINE, from the waist to over the middle of what the legs take up: every
  // ring's middle is on that line (plumb under the waist at first, carried toward the legs lower
  // down). And IT NEVER NARROWS ON THE WAY DOWN: cloth pushed out by a knee hangs straight from
  // there, it does not tuck back in under it. (Each ring fitted to the legs by itself made a coat
  // in a stride a string of lumps.)
  let overF = 0;
  let overL = 0;
  if (legs.length) {
    let lo = Infinity;
    let hi = -Infinity;
    let le = Infinity;
    let ri = -Infinity;
    for (const [p, r] of legs) {
      const pf = (p[0] - o.top.c[0]) * f[0] + (p[1] - o.top.c[1]) * f[1];
      const pl = (p[0] - o.top.c[0]) * l[0] + (p[1] - o.top.c[1]) * l[1];
      lo = Math.min(lo, pf - r);
      hi = Math.max(hi, pf + r);
      le = Math.min(le, pl - r);
      ri = Math.max(ri, pl + r);
    }
    overF = (lo + hi) / 2;
    overL = (le + ri) / 2;
  }
  let wide = topWide;
  let deep = topDeep;
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    const z = zTop + (zHem - zTop) * t;
    // what of the legs this ring must go round: all that is above it, AND all down to the next
    // ring below (the cloth between two rings is no wider than the upper of them: a knee that
    // was between two rings came through it)
    const inside = legs.filter(([p]) => p[2] >= z - (zTop - zHem) / n - 1.5 && p[2] <= zTop + 1);
    const carried = t * Math.min(1, t * 1.2);
    const cx = o.top.c[0] + (f[0] * overF + l[0] * overL) * carried;
    const cy = o.top.c[1] + (f[1] * overF + l[1] * overL) * carried;
    wide = Math.max(wide, topWide + (o.wide - topWide) * t);
    deep = Math.max(deep, topDeep + (o.deep - topDeep) * t);
    // (the ring is an oval: where a leg is off to one side of it, it is narrower there front to back, and so on)
    for (let pass = 0; pass < 2; pass++) {
      for (const [p, r] of inside) {
        const pf = (p[0] - cx) * f[0] + (p[1] - cy) * f[1];
        const pl = (p[0] - cx) * l[0] + (p[1] - cy) * l[1];
        wide = Math.max(wide, (Math.abs(pl) + r + pad) / Math.sqrt(Math.max(0.25, 1 - (pf / deep) ** 2)));
        deep = Math.max(deep, (Math.abs(pf) + r + pad) / Math.sqrt(Math.max(0.25, 1 - (pl / wide) ** 2)));
      }
    }
    const c: V3 = [cx + lag[0] * t * 0.5, cy + lag[1] * t * 0.5, z];
    const ring: Ring = { c, u: mul(f, deep), v: mul(l, wide) };
    if (k === n) {
      const wind = (o.wind ?? 0) * Math.PI * 2;
      const gale = Math.max(0, o.gale ?? 0);
      const pts: V3[] = [];
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const cf = Math.cos(ang);
        const sl = Math.sin(ang);
        const rear = Math.max(0, -cf);
        const at = add(c, add(mul(f, cf * deep * (1 + Math.sin(wind + ang) * 0.05)), mul(l, sl * wide)));
        pts.push(add(at, add(mul(lag, rear * 0.6), add(mul(f, -gale * 13 * rear * rear - gale * 3 * Math.abs(sl)), [0, 0, Math.sin(wind + ang * 2) * 0.5 + gale * 4.5 * rear]))));
      }
      ring.pts = pts;
    }
    out.push(ring);
  }
  return out;
}

/** True where a point on the skin of the head, `turn` degrees round from the nose, is on the side toward the eye. */
export function faces(st: Stage, s: Skeleton, turn: number): boolean {
  const a = (turn * Math.PI) / 180;
  return st.near(add(mul(s.face[0], Math.cos(a)), mul(s.face[1], Math.sin(a)))) > 0.08;
}

/**
 * WHERE A FACE'S TWO EYES ARE DRAWN, in degrees round the head from the nose. NOT EVENLY EITHER
 * SIDE OF IT. The game looks at a figure from half way round to one side: an eye 30 degrees the
 * other side of the nose is on the very edge of the head as it is seen, and a DARK eye there is
 * lost in the line round the head. So both are drawn two thirds of the way toward whoever is
 * looking, as a face turned three quarters is drawn (and whatever else is in the middle of a
 * face, a visor's point, goes with them: `[0] + [1]` over 2); and not at all from behind, where
 * they are where eyes are and the head hides them. (The owner, 6 Oct 2026, 23:41, of a sketch
 * with one eye lost: "move the hair so i see both eyes".)
 */
export function eyesToward(st: Stage, s: Skeleton): readonly [number, number] {
  const cam = (Math.atan2(dot(st.eye, s.face[1]), dot(st.eye, s.face[0])) * 180) / Math.PI;
  const front = Math.max(0, Math.min(1, (110 - Math.abs(cam)) / 40));
  const mid = Math.max(-40, Math.min(40, cam * 0.67)) * front;
  return [mid - 24 - 6 * (1 - front), mid + 24 + 6 * (1 - front)];
}

/** How far a build's figure is from the eye's side, for a painter that wants to know which of two things is nearer. */
export function nearer(st: Stage, a: V3, b: V3): boolean {
  return st.near(a) > st.near(b);
}

/** A direction turned away from the eye by `deg` (a brim that is seen flatter than it lies: see the mage's hat). */
export function tippedFrom(st: Stage, up: V3, deg: number): V3 {
  const e = st.eye;
  const side = sub(e, mul(up, dot(e, up)));
  const n = norm(side, [1, 0, 0]);
  const a = (deg * Math.PI) / 180;
  return norm(add(mul(up, Math.cos(a)), mul(n, -Math.sin(a))));
}

/** The cross of two directions, as a unit (for a painter that needs the third line of a thing). */
export function third(a: V3, b: V3): V3 {
  return norm(cross(a, b), [0, 0, 1]);
}

/**
 * HEADGEAR IS TIPPED FROM THE EYE. The game looks down on its figures: a helm's rim, a cap or a
 * brim that sat level on a head would lie across the face of anyone looking straight ahead (the
 * heads here are small: about a third bigger than life, not twice). So whatever is worn on a
 * head is painted tipped back from wherever the eye is by this many degrees, as the paintings of
 * the first heroes cheated a brim flat: from in front it is pushed back off the brow, from behind
 * it is pulled down over it. It still turns and nods with the head it is on.
 */
export const TIPPED = 20;
/** The three lines of something worn on a head: its own forward, left and up, tipped from the eye (`deg`: TIPPED if not given). */
export function wornOn(st: Stage, s: Skeleton, deg = TIPPED): readonly [V3, V3, V3] {
  const up = tippedFrom(st, s.face[2], deg);
  const fwd = norm(sub(s.face[0], mul(up, dot(s.face[0], up))), s.face[0]);
  return [fwd, cross(up, fwd), up];
}

/** For a build: a share of its height. */
export function share(B: Build, k: number): number {
  return B.tall * k;
}
