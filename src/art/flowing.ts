// THE RIVERS FLOWING, IN THE MILL RACE'S LOOK (the art chat, 23 Oct 2026; a mock-up behind FLOW, off: nothing of the game
// imports it).
//
// The owner to the main chat, 23 Oct 2026, 11:42 Pacific, with a picture from his phone of floor 13: “The water wheel and the
// river are pretty boring.  I’d like the rivers to look a little better and flow, and have the same look and design as the
// waterwheel stream.” Asked which rivers, “Every river (Recommended)”, offered as: floor 13's and the rivers on floors 8 and 9
// too. (Floor 8, Echo Canyon, is a dry riverbed: no water flows there; floor 9's Pinewood river and floor 13's river and race.)
//
// WHAT IT IS: the water of a river or a race painted as the mill race is (its depth deep blue to light, foam streaks drawn out
// long along it, standing waves across it in chevrons pointing downstream, white water piled against its banks), and MOVING:
// FLOW_FRAMES frames that go round at FLOW_FPS, the foam and the ripples carried along the water's own line at its speed. Every
// frame of a river is the same water a little further on; the last runs back into the first. The river's bed (its deep and
// shallow) stands still under it, as a riverbed does.
//
// FOR THE MAIN CHAT: the ground is painted once (render/outdoor.ts): `paintFlow(layer, x0, y0, w, h, frame)` paints a piece's
// water alone at a frame (clear elsewhere; on floors whose ground is all at one height, the Pinewood's and the Millrace's), to
// lay over the ground's own piece and under everything that stands or lies on it (a footbridge, a piece in the water), each
// frame in turn. The ground's own water is frame 0. Each floor's look gives its `FlowLayer` (art/millrace.ts millraceFlow,
// art/pinewood.ts pinewoodFlow).

import { hash } from './kit';
import type { RGB } from './terrain';
import { fbm, worldOf } from './terrain';

/** THE SWITCH: off, the rivers are painted as before, still. */
export const FLOW = { on: false };

/** How many frames go round, and how many a second: a round of 1.5 s. */
export const FLOW_FRAMES = 18;
export const FLOW_FPS = 12;

const mod = (a: number, m: number): number => ((a % m) + m) % m;

/** Value noise in 0..1, one cell a unit, going round every `period` cells along u (so that what is carried along it comes back to itself). */
export function pnoise(u: number, v: number, period: number, k: number): number {
  const ui = Math.floor(u);
  const vi = Math.floor(v);
  const fu = u - ui;
  const fv = v - vi;
  const a0 = mod(ui, period);
  const a1 = mod(ui + 1, period);
  const s = fu * fu * (3 - 2 * fu);
  const t = fv * fv * (3 - 2 * fv);
  const a = hash(a0, vi, k);
  const b = hash(a1, vi, k);
  const c = hash(a0, vi + 1, k);
  const d = hash(a1, vi + 1, k);
  return a + (b - a) * s + (c - a) * t + (a - b - c + d) * s * t;
}

/** How a water is painted. */
export interface WaterStyle {
  /** Its water, deep to the light on it (six tones, as art/millrace.ts MR_WATER). */
  water: readonly RGB[];
  /** Its foam: grey, white, whitest. */
  foam: readonly RGB[];
  /** Its water this far either side of its middle (tiles). */
  half: number;
  /** How fast it runs (tiles a second). */
  speed: number;
  /** Its standing waves, this far apart along it (tiles; a whole number of them to a round's run). */
  chevron: number;
  /** How much of it is foam: the race 1, a river less. */
  foamy: number;
  /** Its own noise. */
  seed: number;
}

/** Picture pixels across a tile of water (for `across`, from a place's side of its line: `acrossOf`). */
export const ACROSS_PX = 30;

/** How far along a line (tiles from its first point, the way it runs) the nearest point of it to (x, y) is: for the game to sample over a floor, as its Land's `riverAlong`. */
export function lineAlong(pts: readonly (readonly [number, number])[]): (x: number, y: number) => number {
  const lens: number[] = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return (x, y) => nearest(pts, x, y, (i, t) => lens[i] + t * (lens[i + 1] - lens[i]));
}
/** How far to the left of a line (+, looking the way it runs) or its right (−) a place is (tiles): as its Land's `riverSide`. */
export function lineSide(pts: readonly (readonly [number, number])[]): (x: number, y: number) => number {
  return (x, y) =>
    nearest(pts, x, y, (i, t, d) => {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      return (bx - ax) * (y - ay) - (by - ay) * (x - ax) >= 0 ? d : -d;
    });
}
function nearest(pts: readonly (readonly [number, number])[], x: number, y: number, then: (i: number, t: number, d: number) => number): number {
  let best = Infinity;
  let bi = 0;
  let bt = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
    const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (d < best) {
      best = d;
      bi = i;
      bt = t;
    }
  }
  return pts.length < 2 ? 0 : then(bi, bt, best);
}
/**
 * Picture pixels across a water at a place: from its side of the line (`side`, tiles: lineSide) when the game gives it, so that
 * what is drawn along the water follows it round its bends; else reckoned on the picture square to its flow there (fx, fy).
 */
export function acrossOf(side: ((x: number, y: number) => number) | undefined, x: number, y: number, fx: number, fy: number, px: number, py: number): number {
  return side ? Math.round(side(x, y) * ACROSS_PX) : Math.round(-fy * px + fx * py);
}

/** How far a water runs in a round (tiles): the length of everything carried along it. */
export function runOf(st: WaterStyle): number {
  return (st.speed * FLOW_FRAMES) / FLOW_FPS;
}

/** On the picture, which way across the water runs at (px, py) for a water running `dir` (a unit along the world's x and y): picture pixels across it. */
export function acrossOn(dir: readonly [number, number], px: number, py: number): number {
  // (the flow on the picture: (x - y, (x + y) / 2); across it, square to that)
  const sx = dir[0] - dir[1];
  const sy = (dir[0] + dir[1]) / 2;
  const l = Math.hypot(sx, sy) || 1;
  return Math.round((-sy * px + sx * py) / l);
}

/**
 * THE WATER at frame `frame`: `s` how far along its line (tiles, the way it runs), `d` how far from its middle (tiles), `across`
 * picture pixels across it (acrossOn), (x, y) the world (its bed), (px, py) the picture.
 */
export function waterAt(st: WaterStyle, s: number, d: number, across: number, x: number, y: number, px: number, py: number, frame: number): RGB {
  const W = st.water;
  const F = st.foam;
  const run = runOf(st);
  // what is carried along it, at this frame: how far along it, going round every `run`
  const u = mod(s - (st.speed * frame) / FLOW_FPS, run);
  const deep = 1 - d / st.half;
  // white water piled against its banks, always
  if (d > st.half - 0.05) return F[hash(px >> 1, py + frame, st.seed + 1) < 0.5 ? 1 : 0];
  // ITS BED, still: deepest along its middle, in slow patches
  const bed = fbm(x * 1.3, y * 1.3, st.seed + 2) * 0.55 + deep * 0.55;
  let tone = bed > 0.66 ? 1 : bed > 0.44 ? 2 : 3;
  if (d > st.half - 0.12) tone = Math.max(3, tone);
  let c = W[tone];
  // RIPPLES carried along it: short streaks along the flow, a lit pixel over one of shade
  const cells = Math.max(1, Math.round(run * 4));
  const k = cells / run;
  const row = mod(across + Math.round(2 * pnoise(u * k * 0.25, across / 7, Math.max(1, Math.round(cells * 0.25)), st.seed + 3)), 5);
  const seg = pnoise(u * k, Math.floor(across / 5), cells, st.seed + 4);
  if (seg > 0.56) {
    if (row === 0) c = W[Math.min(4, tone + 2)];
    else if (row === 1) c = W[Math.max(0, tone - 1)];
  }
  // FOAM STREAKS drawn out long along it
  const fk = Math.max(1, Math.round(run * 2.4));
  const streak = pnoise(u * (fk / run), across / 2.2, fk, st.seed + 5);
  const fs = 0.86 - 0.16 * st.foamy;
  if (streak > fs) c = F[streak > fs + 0.08 ? 1 : 0];
  else if (streak < 0.2 && st.foamy > 0.5) c = W[1];
  // STANDING WAVES across it, chevrons pointing downstream (their edges back, their middle on ahead), broken
  const n = Math.max(1, Math.round(run / st.chevron));
  const gap = run / n;
  const back = (d / st.half) * (d / st.half) * 0.42;
  const at = mod(u + back, run);
  const which = Math.floor(at / gap);
  const wv = at - which * gap - hash(which, 1, st.seed + 6) * gap * 0.3;
  const strong = 0.35 + 0.65 * hash(which, 0, st.seed + 6);
  const width = (0.06 + 0.06 * st.foamy) * strong;
  if (wv >= 0 && wv < width && pnoise(u * (fk / run) * 2, across / 2.5, fk * 2, st.seed + 7) > 0.46) c = F[wv < width * 0.5 ? 2 : 1];
  else if (wv >= width && wv < width + 0.05 && strong > 0.55) c = W[Math.min(5, tone + 2)];
  // glints of the sky, winking
  if (hash(px >> 1, py, st.seed + 8 + frame) < 0.003) c = W[5];
  return c;
}

/** A floor's flowing water: whether a place in the world is its water, and its colour there at a frame. */
export interface FlowLayer {
  at(x: number, y: number): boolean;
  paint(x: number, y: number, px: number, py: number, frame: number): RGB;
}

/** A piece's water at a frame: its pixels (RGBA, clear where no water) and the box of it that has any (picture pixels from the piece's corner; null when none). */
export interface FlowPiece {
  rgba: Uint8ClampedArray<ArrayBuffer>;
  box: { x: number; y: number; w: number; h: number } | null;
}

/**
 * PAINT A PIECE'S WATER at `frame`: the world's picture from (x0, y0), w by h picture pixels, as the ground's pieces are cut
 * (render/outdoor.ts). For a ground all at one height (rise 0): a pixel shows the world where it is.
 */
export function paintFlow(layer: FlowLayer, x0: number, y0: number, w: number, h: number, frame: number): FlowPiece {
  const rgba = new Uint8ClampedArray(w * h * 4);
  let bx0 = w;
  let by0 = h;
  let bx1 = -1;
  let by1 = -1;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const px = x0 + c;
      const py = y0 + r;
      const [x, y] = worldOf(px, py);
      if (!layer.at(x, y)) continue;
      const col = layer.paint(x, y, px, py, frame);
      const o = (r * w + c) * 4;
      rgba[o] = col[0];
      rgba[o + 1] = col[1];
      rgba[o + 2] = col[2];
      rgba[o + 3] = 255;
      if (c < bx0) bx0 = c;
      if (c > bx1) bx1 = c;
      if (r < by0) by0 = r;
      if (r > by1) by1 = r;
    }
  }
  return { rgba, box: bx1 < 0 ? null : { x: bx0, y: by0, w: bx1 - bx0 + 1, h: by1 - by0 + 1 } };
}
