// Turning one painting into another, shape by shape. (The title screen: the librarian really
// becomes the witch, the desk the cauldron, the child the knight. The owner: "Actually shift the
// pictures from one to the other, have the librarian really devolve into the evil witch and back
// again.")
//
// A "shape" is one layer of a painting: a figure, a piece of furniture. Two layers that stand for
// the same thing in the two paintings are morphed through their DISTANCE FIELDS. For every pixel
// we know how far it is from the edge of shape A (a negative number inside it) and from the edge of
// shape B. Part of the way from A to B, a pixel is inside the in-between shape if the blend of
// those two distances is negative. So the outline flows from one silhouette to the other: a bun
// shrinks away while a pointed hat grows, a desk draws in and rounds into a pot.
//
// The colour of an in-between pixel is A's colour there or B's, never a mix, so the picture stays
// pixel art all the way across. Where the in-between shape reaches past A (or past B), it takes
// the colour of the nearest pixel that is well inside. Every in-between shape gets a fresh dark
// line round it, like every part of the paintings.
//
// The change need not come over a whole shape at once. Given an ORDER (how late each pixel is to
// change), it SWEEPS through the shape: where the sweep has reached, the outline flows first and
// the new colours follow, along a ragged dithered edge. At any moment each part of the figure is
// then plainly one painting or the other, which is what makes it read as a thing changing. (With
// no order, the colours change everywhere at once through the dither, and it reads as two pictures
// laid over one another: a dissolve with a moving outline.)
//
// What lies behind the figures has no outline to flow, so it changes as a front spreading from a
// point: an uneven line, like the edge of a burn in paper, with light on it (`spreadInto`).
//
// Everything here works on plain arrays (no canvas), so it runs in the tests.

import { hash2 } from '../engine/rng';

/** A box of the picture: x0 <= x <= x1, y0 <= y <= y1. */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** One layer of a painting, and the box that holds what is painted on it. */
export interface Layer extends Box {
  w: number;
  h: number;
  /** The layer's pixels, RGBA. Not copied: do not paint on the layer afterwards. */
  d: Uint8ClampedArray;
  /** The layer has no pixels at all. (Its box is then empty too: x1 < x0.) */
  empty: boolean;
}

/** One layer, made ready for morphing. */
export interface Shape extends Layer {
  /** Distance to the shape's edge in pixels: negative inside, positive outside. */
  dist: Float32Array;
  /**
   * For every pixel, where its colour comes from: itself if it is inside the shape and not on its
   * rim, otherwise the nearest pixel that is well inside. (-1 everywhere if the layer is empty.)
   */
  src: Int32Array;
  /** 1 for the pixels of the shape that touch the empty picture round it (where a part's dark line is). */
  rim: Uint8Array;
}

/** No pixel is this far from another: the squared distance of "nothing found yet". */
const NOWHERE = 0x7fffffff;

/** A pixel this far in from the edge of a shape is "well inside" it. */
const DEEP = 3;

/**
 * For every pixel, the nearest pixel for which `is` is 1: its index in `to` (-1 if there is none),
 * and the distance to it, squared, in `d2`. Sweeps that pass the nearest one found so far from
 * neighbour to neighbour: not exact to the last decimal, but never more than a fraction of a pixel
 * out, which is plenty here.
 */
function sweep(is: Uint8Array, w: number, h: number): { to: Int32Array; d2: Int32Array } {
  const n = w * h;
  const to = new Int32Array(n).fill(-1);
  const d2 = new Int32Array(n).fill(NOWHERE);
  // (where the nearest one found so far is, kept as a column and a row, so that the sums below,
  // which are done hundreds of thousands of times, need not take an index to pieces each time)
  const fx = new Int16Array(n);
  const fy = new Int16Array(n);
  for (let y = 0, i = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i++) {
      if (!is[i]) continue;
      to[i] = i;
      d2[i] = 0;
      fx[i] = x;
      fy[i] = y;
    }
  }
  /** Is what the neighbour `j` has found nearer to pixel `i` at (x, y) than what `i` has? */
  const tryFrom = (x: number, y: number, i: number, j: number): void => {
    if (to[j] < 0) return;
    const dx = x - fx[j];
    const dy = y - fy[j];
    const v = dx * dx + dy * dy;
    if (v < d2[i]) {
      d2[i] = v;
      to[i] = to[j];
      fx[i] = fx[j];
      fy[i] = fy[j];
    }
  };
  for (let y = 0, i = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i++) {
      if (d2[i] === 0) continue;
      if (x > 0) tryFrom(x, y, i, i - 1);
      if (y > 0) {
        tryFrom(x, y, i, i - w);
        if (x > 0) tryFrom(x, y, i, i - w - 1);
        if (x < w - 1) tryFrom(x, y, i, i - w + 1);
      }
    }
  }
  for (let y = h - 1, i = n - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--, i--) {
      if (d2[i] === 0) continue;
      if (x < w - 1) tryFrom(x, y, i, i + 1);
      if (y < h - 1) {
        tryFrom(x, y, i, i + w);
        if (x < w - 1) tryFrom(x, y, i, i + w + 1);
        if (x > 0) tryFrom(x, y, i, i + w - 1);
      }
    }
  }
  // (a second forward sweep mends the few pixels the first could not reach in one go)
  for (let y = 0, i = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i++) {
      if (d2[i] === 0) continue;
      if (x > 0) tryFrom(x, y, i, i - 1);
      if (y > 0) tryFrom(x, y, i, i - w);
      if (x < w - 1) tryFrom(x, y, i, i + 1);
      if (y < h - 1) tryFrom(x, y, i, i + w);
    }
  }
  return { to, d2 };
}

/** For every pixel, the index of the nearest pixel for which `is` is 1 (or -1 if there is none). */
export function nearest(is: Uint8Array, w: number, h: number): Int32Array {
  return sweep(is, w, h).to;
}

/** A layer and the box that holds what is painted on it. `d` is its RGBA pixels, w * h * 4 of them. */
export function layerOf(d: Uint8ClampedArray, w: number, h: number): Layer {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0, i = 3; y < h; y++) {
    for (let x = 0; x < w; x++, i += 4) {
      if (d[i] === 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      y1 = y;
    }
  }
  if (x1 < 0) return { w, h, d, empty: true, x0: 0, y0: 0, x1: -1, y1: -1 };
  return { w, h, d, empty: false, x0, y0, x1, y1 };
}

/** The smallest box that holds both. (An empty layer's box holds nothing, and adds nothing.) */
export function boxAround(a: Box, b: Box): Box {
  if (a.x1 < a.x0) return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
  if (b.x1 < b.x0) return { x0: a.x0, y0: a.y0, x1: a.x1, y1: a.y1 };
  return { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) };
}

/**
 * Make a layer ready for morphing. `d` is its RGBA pixels, w * h * 4 of them.
 *
 * `room` is the part of the picture the morph will happen in: the box round BOTH shapes
 * (`boxAround`). Given it, only that part is worked out, which is several times less work for a
 * figure that fills a corner of the picture; outside it the shape is simply "far away". Leave it
 * out and the whole picture is worked out.
 */
export function shapeOf(d: Uint8ClampedArray, w: number, h: number, room?: Box): Shape {
  const l = layerOf(d, w, h);
  const n = w * h;
  const dist = new Float32Array(n).fill(1e6);
  const src = new Int32Array(n).fill(-1);
  const rim = new Uint8Array(n);
  if (l.empty) return { ...l, dist, src, rim };
  // The part to work on: the room, widened to hold the shape itself and one pixel more all round
  // (so that the nearest empty pixel to any pixel of the shape is always in it).
  const r = room ? boxAround(room, l) : { x0: 0, y0: 0, x1: w - 1, y1: h - 1 };
  const rx = Math.max(0, r.x0 - 1);
  const ry = Math.max(0, r.y0 - 1);
  const rw = Math.min(w - 1, r.x1 + 1) - rx + 1;
  const rh = Math.min(h - 1, r.y1 + 1) - ry + 1;
  const m = rw * rh;
  const inside = new Uint8Array(m);
  const outside = new Uint8Array(m);
  for (let v = 0, k = 0; v < rh; v++) {
    for (let u = 0, i = ((ry + v) * w + rx) * 4 + 3; u < rw; u++, k++, i += 4) {
      if (d[i] > 0) inside[k] = 1;
      else outside[k] = 1;
    }
  }
  // the rim: pixels of the shape that touch the empty picture (the dark line round a part lives there)
  const core = new Uint8Array(m);
  let anyCore = false;
  for (let v = 0, k = 0; v < rh; v++) {
    for (let u = 0; u < rw; u++, k++) {
      if (!inside[k]) continue;
      if ((u > 0 && !inside[k - 1]) || (u < rw - 1 && !inside[k + 1]) || (v > 0 && !inside[k - rw]) || (v < rh - 1 && !inside[k + rw])) rim[(ry + v) * w + rx + u] = 1;
      else {
        core[k] = 1;
        anyCore = true;
      }
    }
  }
  const toIn = sweep(inside, rw, rh);
  const toOut = sweep(outside, rw, rh);
  // Where the pixels that are NOT properly inside take their colour from: the nearest pixel that
  // is well inside (DEEP pixels from the edge), if the shape has any body to speak of. Taken from
  // the very nearest instead, a thing as small as an earring or the end of a pencil is smeared
  // out into a blob as the shape grows past it.
  const body = new Uint8Array(m);
  let anyBody = false;
  for (let k = 0; k < m; k++) {
    if (inside[k] && toOut.d2[k] >= DEEP * DEEP) {
      body[k] = 1;
      anyBody = true;
    }
  }
  const toBody = anyBody ? sweep(body, rw, rh).to : anyCore ? sweep(core, rw, rh).to : toIn.to;
  for (let v = 0, k = 0; v < rh; v++) {
    for (let u = 0, i = (ry + v) * w + rx; u < rw; u++, k++, i++) {
      // (a layer that fills its whole room has no outside: it is simply "deep inside" everywhere)
      if (inside[k]) dist[i] = toOut.d2[k] === NOWHERE ? -1e6 : -Math.sqrt(toOut.d2[k]);
      else dist[i] = Math.sqrt(toIn.d2[k]);
      if (core[k]) src[i] = i;
      else {
        // (the nearest pixel is named by its place in the room: here it is turned back into its place in the picture)
        const c = toBody[k];
        const cu = c % rw;
        src[i] = (ry + (c - cu) / rw) * w + rx + cu;
      }
    }
  }
  return { ...l, dist, src, rim };
}

/** The ordered dither: a threshold in 0..1 for a pixel, the same every time. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function ditherAt(x: number, y: number): number {
  return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
}

/** Slow at both ends. */
export function smooth(k: number): number {
  const v = k < 0 ? 0 : k > 1 ? 1 : k;
  return v * v * (3 - 2 * v);
}

/**
 * Smooth noise over a whole picture, about -1..1 at each pixel and the same every time: it gives
 * the edge of a spreading change its uneven line (a perfect circle would look like a machine's
 * wipe, not like something alive). Two layers of it: broad swells 14 pixels across, and smaller
 * ones 5 across on top.
 */
export function wobbleField(w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  swells(out, w, h, 14, 3, 0.7);
  swells(out, w, h, 5, 7, 0.3);
  return out;
}

/** Add one layer of noise: a random height at each corner of a grid of squares `size` across, and smooth slopes between. */
function swells(out: Float32Array, w: number, h: number, size: number, seed: number, weight: number): void {
  const gw = Math.floor((w - 1) / size) + 2;
  const gh = Math.floor((h - 1) / size) + 2;
  const grid = new Float32Array(gw * gh);
  for (let j = 0, k = 0; j < gh; j++) for (let i = 0; i < gw; i++, k++) grid[k] = (hash2(i, j, seed) * 2 - 1) * weight;
  // for each column: which square it is in, and how far across it (eased, so the slopes meet without a crease)
  const square = new Int32Array(w);
  const across = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    square[x] = Math.floor(x / size);
    across[x] = smooth(x / size - square[x]);
  }
  for (let y = 0, i = 0; y < h; y++) {
    const j = Math.floor(y / size);
    const down = smooth(y / size - j);
    for (let x = 0; x < w; x++, i++) {
      const k = j * gw + square[x];
      const top = grid[k] + (grid[k + 1] - grid[k]) * across[x];
      const bottom = grid[k + gw] + (grid[k + gw + 1] - grid[k + gw]) * across[x];
      out[i] += top + (bottom - top) * down;
    }
  }
}

/**
 * A change can sweep through a shape instead of coming over all of it at once: `order` says, for
 * every pixel, how late the change reaches it, from 0 (first) to 1 (last). Where the sweep has
 * reached, two things happen one after the other:
 *   - the outline flows from the one shape to the other, over the next SOFT of the sweep's run;
 *   - LATE into that, the colours change, along an edge EDGE wide that is ragged with the dither.
 * So a part of the figure first swells or sharpens toward its new shape in its old colours, and
 * then the new colours come over it. (The other way round, the new colours show first inside the
 * old outline, which looks like one picture being wiped away to show another.)
 */
const SOFT = 0.4;
const LATE = 0.25;
const EDGE = 0.1;
/** How much further than its own run a sweep has to go for its last pixel to finish changing. */
const TAIL = Math.max(SOFT, LATE + EDGE);

/**
 * The order in which a change sweeps through a pair of layers. `late(x, y)` is any measure of how
 * late a pixel should change (its distance from where the change begins, say): it is stretched so
 * that the pixels the two layers cover run from 0 to 1.
 *
 * With `together`, a part that only one of the two has (the brim of a hat, a bun) changes with the
 * nearest part that both have (her brow): its pixels take that part's lateness. So it grows out of
 * that part, or sinks back into it, as that part changes, and no piece of it is left hanging in
 * the air because the sweep reached one end of it before the other. Without, each pixel changes
 * by where it is itself, which is right for things that are not parts of one body.
 */
export function sweepOrder(a: Layer, b: Layer, late: (x: number, y: number) => number, together = true): Float32Array {
  const w = a.w;
  const order = new Float32Array(w * a.h);
  const box = boxAround(a, b);
  const bw = box.x1 - box.x0 + 1;
  const bh = box.y1 - box.y0 + 1;
  // for each pixel of the box, the pixel whose lateness it takes: itself, or the nearest that both layers have
  let from: Int32Array | null = null;
  if (together && bw > 0 && bh > 0) {
    const both = new Uint8Array(bw * bh);
    let any = false;
    for (let v = 0, k = 0; v < bh; v++) {
      for (let u = 0, i = ((box.y0 + v) * w + box.x0) * 4 + 3; u < bw; u++, k++, i += 4) {
        if (a.d[i] > 0 && b.d[i] > 0) {
          both[k] = 1;
          any = true;
        }
      }
    }
    if (any) from = sweep(both, bw, bh).to;
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (let v = 0, k = 0; v < bh; v++) {
    for (let u = 0; u < bw; u++, k++) {
      const i = (box.y0 + v) * w + box.x0 + u;
      const f = from ? from[k] : k;
      const fu = f % bw;
      const value = late(box.x0 + fu, box.y0 + (f - fu) / bw);
      order[i] = value;
      if (a.d[i * 4 + 3] === 0 && b.d[i * 4 + 3] === 0) continue;
      if (value < lo) lo = value;
      if (value > hi) hi = value;
    }
  }
  const span = hi > lo ? hi - lo : 1;
  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      const i = y * w + x;
      const v = (order[i] - lo) / span;
      order[i] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
  }
  return order;
}

/**
 * Paint a layer onto `out` (an RGBA buffer of the same size, holding whatever lies behind it)
 * through the dither: `through` is how much of it shows, from 0 (none of it) to 1 (all of it).
 */
export function fadeInto(out: Uint8ClampedArray, l: Layer, through: number): void {
  if (through <= 0) return;
  const d = l.d;
  for (let y = l.y0; y <= l.y1; y++) {
    for (let x = l.x0; x <= l.x1; x++) {
      const i = (y * l.w + x) * 4;
      if (d[i + 3] === 0) continue;
      if (through < 1 && through <= ditherAt(x, y)) continue;
      out[i] = d[i];
      out[i + 1] = d[i + 1];
      out[i + 2] = d[i + 2];
      out[i + 3] = 255;
    }
  }
}

/**
 * A thing that has no partner in the other painting (a lamp is not a bubble) comes or goes as the
 * change passes: `t` is how far the change has got, 0..1. With `coming`, the layer is not there at
 * 0 and all there at 1; without, the other way round. With an `order` the change sweeps through it
 * (see `sweepOrder`); with none it comes or goes all over at once, through the dither.
 */
export function comeAndGo(out: Uint8ClampedArray, l: Layer, t: number, coming: boolean, order?: Float32Array): void {
  if (!order || t <= 0 || t >= 1) {
    fadeInto(out, l, coming ? t : 1 - t);
    return;
  }
  const d = l.d;
  const front = t * (1 + TAIL) - LATE;
  for (let y = l.y0; y <= l.y1; y++) {
    for (let x = l.x0; x <= l.x1; x++) {
      const k = y * l.w + x;
      const i = k * 4;
      if (d[i + 3] === 0) continue;
      if (front > order[k] + EDGE * ditherAt(x, y) !== coming) continue;
      out[i] = d[i];
      out[i + 1] = d[i + 1];
      out[i + 2] = d[i + 2];
      out[i + 3] = 255;
    }
  }
}

const scratch = new Map<number, Uint8Array>();

/**
 * Paint the shape that is `t` of the way from `a` to `b` (0 = a, 1 = b) onto `out`, an RGBA
 * buffer of the same size that already holds whatever lies behind it. `ink` is the colour of the
 * line round it, as [r, g, b]. At 0 and at 1 the result is exactly the layer itself.
 *
 * Without an `order`, the colours change all over the shape at once, through the dither, over the
 * middle of the morph. With one (see `sweepOrder`), `b`'s colours sweep through the shape in that
 * order while the outline flows: at any moment each part of it is plainly one painting or the
 * other, with a ragged edge between, which reads as a thing changing rather than as two pictures
 * laid over one another.
 */
export function morphInto(out: Uint8ClampedArray, a: Shape, b: Shape, t: number, ink: readonly number[], order?: Float32Array): void {
  const w = a.w;
  const h = a.h;
  if (t <= 0 || t >= 1) {
    fadeInto(out, t <= 0 ? a : b, 1);
    return;
  }
  if (a.empty || b.empty) {
    // nothing to morph with: the one that is there comes or goes
    comeAndGo(out, a.empty ? b : a, t, a.empty, order);
    return;
  }
  // with no order: the shape moves at an even pace, and the colours change over the middle of the morph
  const s = t;
  const c = smooth((t - 0.12) / 0.76);
  // with one: how far the sweep has got (it runs on past the last pixel until that has finished changing)
  const front = t * (1 + TAIL);
  // nothing in between can reach further than the two shapes do
  const x0 = Math.max(0, Math.min(a.x0, b.x0));
  const y0 = Math.max(0, Math.min(a.y0, b.y0));
  const x1 = Math.min(w - 1, Math.max(a.x1, b.x1));
  const y1 = Math.min(h - 1, Math.max(a.y1, b.y1));
  let mask = scratch.get(w * h);
  if (!mask) {
    mask = new Uint8Array(w * h);
    scratch.set(w * h, mask);
  }
  const da = a.dist;
  const db = b.dist;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      let k = s;
      if (order) {
        // how far this pixel's own change has got
        const since = front - order[i];
        k = since <= 0 ? 0 : since >= SOFT ? 1 : since / SOFT;
      }
      mask[i] = da[i] * (1 - k) + db[i] * k < 0 ? 1 : 0;
    }
  }
  // which pixels of the in-between shape are on its edge (1), and which are properly inside it (2)
  // (the picture's own edge does not count as an edge of the shape)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const edge = (x > 0 && (x === x0 || !mask[i - 1])) || (x < w - 1 && (x === x1 || !mask[i + 1])) || (y > 0 && (y === y0 || !mask[i - w])) || (y < h - 1 && (y === y1 || !mask[i + w]));
      if (!edge) mask[i] = 2;
    }
  }
  const ad = a.d;
  const bd = b.d;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const o = i * 4;
      const fromB = order ? front - order[i] > LATE + EDGE * ditherAt(x, y) : c > ditherAt(x, y);
      const of = fromB ? b : a;
      const from = fromB ? bd : ad;
      let j: number;
      if (mask[i] === 1) {
        if (!of.rim[i]) {
          // An edge the layer never had: the dark line. But only round something: a sliver of
          // shape too thin to have an inside (the last of a hat's brim as it draws in) would be
          // all line, a black scratch on the picture, and is left out.
          let round = false;
          for (let v = Math.max(y0, y - 1); v <= Math.min(y1, y + 1) && !round; v++) {
            for (let u = Math.max(x0, x - 1); u <= Math.min(x1, x + 1); u++) {
              if (mask[v * w + u] === 2) {
                round = true;
                break;
              }
            }
          }
          if (!round) continue;
          out[o] = ink[0];
          out[o + 1] = ink[1];
          out[o + 2] = ink[2];
          out[o + 3] = 255;
          continue;
        }
        // the layer's own edge, as it was painted (so the two ends of the morph are the paintings exactly)
        j = o;
      } else j = of.src[i] * 4;
      out[o] = from[j];
      out[o + 1] = from[j + 1];
      out[o + 2] = from[j + 2];
      out[o + 3] = 255;
    }
  }
}

/** How uneven the edge of a spreading ground is, in pixels: the swells of `wobble`, and a fringe of dither. */
const RAG = 6;
const FRINGE = 3;

/**
 * How late each pixel of a ground changes when a change spreads outward from (cx, cy): 0 at the
 * middle, 1 at the furthest corner. The front is an uneven line with a thin dithered fringe, like
 * the edge of a burn spreading through paper. Work it out once. (`wobble` is the noise that makes
 * the line uneven: pass the picture's `wobbleField` if it has been worked out already.)
 */
export function spreadField(w: number, h: number, cx: number, cy: number, wobble: Float32Array = wobbleField(w, h)): Float32Array {
  const far = Math.max(Math.hypot(cx * 0.85, cy), Math.hypot((w - cx) * 0.85, cy), Math.hypot(cx * 0.85, h - cy), Math.hypot((w - cx) * 0.85, h - cy));
  const f = new Float32Array(w * h);
  const most = far + RAG + FRINGE;
  for (let y = 0, i = 0; y < h; y++) {
    const dy = y + 0.5 - cy;
    for (let x = 0; x < w; x++, i++) {
      const dx = (x + 0.5 - cx) * 0.85;
      const v = (Math.sqrt(dx * dx + dy * dy) + RAG * wobble[i] + FRINGE * ditherAt(x, y)) / most;
      f[i] = v < 0 ? 0 : v;
    }
  }
  return f;
}

/** How far behind a spreading front its light reaches, as a part of the front's whole run. */
const LIT = 0.045;

/**
 * A whole ground changing from picture `a` to picture `b` (both RGBA and as big as `field`, both
 * filled): the change spreads outward as an uneven front, with a line of light `glow` ([r, g, b])
 * riding on it. `t` is 0..1; at 0 the result is `a`, at 1 it is `b`.
 */
export function spreadInto(out: Uint8ClampedArray, a: Uint8ClampedArray, b: Uint8ClampedArray, field: Float32Array, t: number, glow: readonly number[]): void {
  if (t <= 0 || t >= 1) {
    out.set(t <= 0 ? a : b);
    return;
  }
  // the front runs from just before the middle to just past the furthest corner, so both ends are clean
  const front = -0.02 + t * (1.04 + LIT);
  for (let k = 0, i = 0; k < field.length; k++, i += 4) {
    const past = front - field[k];
    const from = past > 0 ? b : a;
    out[i] = from[i];
    out[i + 1] = from[i + 1];
    out[i + 2] = from[i + 2];
    out[i + 3] = 255;
    if (past > 0 && past < LIT) {
      // just behind the front: lit, in three flat steps (bright on the front itself, fainter behind)
      const g = past < LIT * 0.3 ? 0.85 : past < LIT * 0.6 ? 0.5 : 0.22;
      out[i] += (glow[0] - out[i]) * g;
      out[i + 1] += (glow[1] - out[i + 1]) * g;
      out[i + 2] += (glow[2] - out[i + 2]) * g;
    }
  }
}
