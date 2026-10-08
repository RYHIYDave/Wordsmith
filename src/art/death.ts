// How a monster comes apart: the tools its death is painted with (art/mkit.ts: MonsterMoves.die).
//
// The owner, 5 Oct 2026: "I think we want death animations and corpses for enemies." Each of the
// seven gets a death of its own and leaves a body (what he was told: the skeleton falls apart
// into bones, the archer too, its red hood on the heap; the cultist crumples and his fire goes
// out; the bat drops with its wings spread; the brute and the guardian topple; the Warden gets a
// big one. Bodies stay until the hero leaves that dungeon, drawn flat on the floor).
//
// A death is painted from the figure's OWN picture, so that what lies on the floor is plainly
// what was standing there. The rig paints the figure as it stood and hands over its layers (its
// skull, its rib cage, an arm, its sword); here each is a PIECE that lets go at its own moment,
// falls, turns as it falls, and comes to rest somewhere on the floor. Pieces turn by quarter
// turns only: a painting turned by a quarter is still that painting, pixel for pixel, where one
// turned a few degrees is mush.

import { Px } from '../engine/px';

/** A point on a figure's canvas. */
type V = readonly [number, number];

export interface Piece {
  /** A layer of the figure's canvas with this piece on it (and, unless `box` says which part, nothing else). */
  px: Px;
  /** The part of that layer that is the piece: left, top, and one past its right and bottom. All that is painted on the layer unless given. */
  box?: readonly [number, number, number, number];
  /** Where the MIDDLE OF ITS FOOT (the middle of its lowest row, once it lies) comes to rest. */
  to: V;
  /** Quarter turns it has made by the time it lies: + clockwise. */
  turns?: number;
  /** Mirrored left to right by the time it lies (a thing that has rolled over). */
  flip?: boolean;
  /** When it lets go and when it lies, 0..1 of the whole death. Before the first it is where it stood; after the second, where it lies. */
  from: number;
  until: number;
  /** How far it is thrown up before it falls, in pixels (a skull that bounces off a shoulder). */
  hop?: number;
  /** It bounces once as it lands, this high. */
  bounce?: number;
  /**
   * It TOPPLES (a whole figure going over, not a bone dropping): for the first part of its fall
   * it stays on its feet and turns about them, further and further the way it is going, as far
   * as LEAN_MOST degrees (its rows slid sideways by the sine of the angle, more the higher they
   * are, and the whole pressed down by its cosine: what a turn of that much does to its middle
   * line, with every pixel still a pixel of the painting); and then it is down, turned by its
   * quarter, where `to` says, and bounces. (A thing that topples makes one quarter turn: `turns`
   * says which way.) A big thing leaning would reach past the edge of its canvas: it is slid
   * back inside, as feet slide out from under whatever goes over.
   */
  topple?: boolean;
  /**
   * Cloth: it has no thickness, so lying it is this share of the height its painting has (a cape
   * that hung 70 pixels long lies 20 deep on a floor seen from over the shoulder). It flattens as
   * it comes down: rows of the painting are left out, evenly.
   */
  flat?: number;
}

/** How much of a toppling piece's fall is spent leaning before it is down, and how far it has turned by then, in degrees. */
const LEANING = 0.5;
const LEAN_MOST = 40;

/** A painting turned by quarter turns (+ clockwise). */
export function quarter(src: Px, turns: number): Px {
  const n = ((turns % 4) + 4) % 4;
  if (n === 0) return src;
  const w = n === 2 ? src.w : src.h;
  const h = n === 2 ? src.h : src.w;
  const out = new Px(w, h);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (src.d[i + 3] === 0) continue;
      // clockwise: what was the left edge is the top
      const tx = n === 1 ? src.h - 1 - y : n === 2 ? src.w - 1 - x : y;
      const ty = n === 1 ? x : n === 2 ? src.h - 1 - y : src.w - 1 - x;
      const o = (ty * w + tx) * 4;
      out.d[o] = src.d[i];
      out.d[o + 1] = src.d[i + 1];
      out.d[o + 2] = src.d[i + 2];
      out.d[o + 3] = src.d[i + 3];
    }
  }
  return out;
}

/**
 * A painting leaning over: every row slid sideways by `slope` pixels for each row it is above the
 * lowest (+ to the right, - to the left). The lowest row stays where it is. Returns the leaning
 * painting and how far its left edge is from the left edge of the one it was made from.
 */
export function tilted(src: Px, slope: number): { px: Px; left: number } {
  const most = Math.round(Math.abs(slope) * (src.h - 1));
  const out = new Px(src.w + most, src.h);
  for (let y = 0; y < src.h; y++) {
    const slid = Math.round(Math.abs(slope) * (src.h - 1 - y));
    const at = slope < 0 ? most - slid : slid;
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (src.d[i + 3] === 0) continue;
      const o = (y * out.w + x + at) * 4;
      out.d[o] = src.d[i];
      out.d[o + 1] = src.d[i + 1];
      out.d[o + 2] = src.d[i + 2];
      out.d[o + 3] = src.d[i + 3];
    }
  }
  return { px: out, left: slope < 0 ? -most : 0 };
}

/** A painting pressed down to `share` of its height: rows of it are left out, evenly (the lowest row is kept). */
export function pressed(src: Px, share: number): Px {
  const h = Math.max(1, Math.round(src.h * share));
  if (h >= src.h) return src;
  const out = new Px(src.w, h);
  for (let y = 0; y < h; y++) {
    // (row y of the new one is the row of the old that lies as far up from the foot)
    const from = src.h - 1 - Math.min(src.h - 1, Math.floor(((h - 1 - y) * src.h) / h));
    out.d.set(src.d.subarray(from * src.w * 4, (from + 1) * src.w * 4), y * src.w * 4);
  }
  return out;
}

/**
 * Lays a piece on what is already down, as the style lays one layer on another: wherever it lies
 * over something painted, it has the dark seam round it (so that iron on iron is still two things).
 */
function laid(out: Px, img: Px, x0: number, y0: number, seam: string | null): void {
  if (seam) {
    const has = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < img.w && y < img.h && img.d[(y * img.w + x) * 4 + 3] !== 0;
    for (let y = -1; y <= img.h; y++) {
      for (let x = -1; x <= img.w; x++) {
        if (has(x, y)) continue;
        if (!(has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1))) continue;
        const tx = x0 + x;
        const ty = y0 + y;
        if (tx < 0 || ty < 0 || tx >= out.w || ty >= out.h) continue;
        if (out.d[(ty * out.w + tx) * 4 + 3] !== 0) out.set(tx, ty, seam);
      }
    }
  }
  out.blit(img, x0, y0);
}

/** The box that holds what is painted of a layer inside `box` (or of all of it), or null if nothing is. */
function held(px: Px, box?: readonly [number, number, number, number]): { x: number; y: number; w: number; h: number } | null {
  const x0 = box ? Math.max(0, box[0]) : 0;
  const y0 = box ? Math.max(0, box[1]) : 0;
  const x1 = box ? Math.min(px.w, box[2]) : px.w;
  const y1 = box ? Math.min(px.h, box[3]) : px.h;
  let ax = x1;
  let ay = y1;
  let bx = -1;
  let by = -1;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (px.d[(y * px.w + x) * 4 + 3] === 0) continue;
      if (x < ax) ax = x;
      if (x > bx) bx = x;
      if (y < ay) ay = y;
      if (y > by) by = y;
    }
  }
  return bx < 0 ? null : { x: ax, y: ay, w: bx - ax + 1, h: by - ay + 1 };
}

/**
 * The figure `k` of the way through its death (0 = as it stood, 1 = lying), on a canvas `w` x
 * `h`: every piece where it has got to. They are painted in the order given, the later over the
 * earlier; with `seam` (a colour), each has the style's dark seam round it where it lies on another.
 */
export function fallen(pieces: ReadonlyArray<Piece>, k: number, w: number, h: number, seam: string | null = null): Px {
  const out = new Px(w, h);
  for (const p of pieces) {
    const b = held(p.px, p.box);
    if (!b) continue;
    const cut = p.px.crop(b.x, b.y, b.w, b.h);
    // how far through its own fall this piece is
    const u = k <= p.from ? 0 : k >= p.until ? 1 : (k - p.from) / (p.until - p.from);
    const turns = p.turns ?? 0;
    if (p.topple) {
      const way = turns < 0 ? -1 : 1;
      let img = cut;
      let x = b.x;
      let y = b.y;
      if (u > 0 && u < LEANING) {
        // leaning: slowly, then fast
        const v = u / LEANING;
        const ang = (v * v * LEAN_MOST * Math.PI) / 180;
        const lower = pressed(cut, Math.cos(ang));
        const lean = tilted(lower, way * Math.tan(ang));
        img = lean.px;
        x = b.x + lean.left;
        y = b.y + cut.h - lower.h;
      } else if (u >= LEANING) {
        // down: where it lies, with one bounce
        const v = (u - LEANING) / (1 - LEANING);
        const up = p.bounce && v < 0.7 ? p.bounce * Math.sin((v / 0.7) * Math.PI) * (1 - v) : 0;
        img = quarter(cut, way);
        x = Math.round(p.to[0] - img.w / 2);
        y = Math.round(p.to[1] - up - img.h);
      }
      // (inside the canvas, and clear of its edge by one pixel of the game, which is two of the painting's: nothing of it is cut off)
      laid(out, img, Math.max(2, Math.min(w - 2 - img.w, x)), Math.max(2, Math.min(h - 2 - img.h, y)), seam);
      continue;
    }
    // (it turns in steps as it falls: all of its quarters are made by three quarters of the way down)
    const made = turns === 0 ? 0 : Math.sign(turns) * Math.min(Math.abs(turns), Math.floor((u / 0.75) * Math.abs(turns) + (u > 0 ? 0.5 : 0)));
    let img = quarter(cut, made);
    if (p.flip && u > 0.5) img = img.flipX();
    // (cloth: it is pressed flat as it comes down, most of it at the last)
    if (p.flat !== undefined && u > 0) img = pressed(img, 1 - (1 - p.flat) * u * u);
    // where the middle of its foot is: as it stood, and as it lies
    const fromX = b.x + b.w / 2;
    const fromY = b.y + b.h;
    // across: steadily. Down: as a thing falls (slowly, then fast), thrown up first if it is, and with one bounce at the end if it has one.
    const across = fromX + (p.to[0] - fromX) * u;
    const hop = p.hop ?? 0;
    const drop = fromY + (p.to[1] - fromY) * u * u - hop * 4 * u * (1 - u);
    const bounce = p.bounce && u > 0.72 && u < 1 ? p.bounce * Math.sin(((u - 0.72) / 0.28) * Math.PI) : 0;
    laid(out, img, Math.round(across - img.w / 2), Math.round(drop - bounce - img.h), seam);
  }
  return out;
}

/** Every pixel of one of these colours becomes `to` (the light goes out of an eye). */
export function quench(px: Px, colors: ReadonlyArray<string>, to: string): Px {
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      const c = px.get(x, y);
      if (c !== null && colors.includes(c)) px.set(x, y, to);
    }
  }
  return px;
}
