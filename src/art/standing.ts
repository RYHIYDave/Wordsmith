// THE WALLS STANDING WHOLE ON FLOORS 11 TO 15 (the art chat, 20 Oct 2026; the game's side behind ACT2_WALLS, off until his yes).
//
// The owner, 20 Oct 2026, 07:41 Pacific: "All the 11-15 levels have weird slanting walls that I hate.  I know it’s so they don’t
// hide the character when he goes behind them but I just want that wall piece to go transparent when you walk behind it."
//
// WHAT HE SAW: the ground of Act 2 is painted by the descent's painter (art/terrain.ts), whose rule is that nothing it paints
// stands over the walkable floor. So a wall toward the eye was cut down to the floor's own level: its top (a roof, on floor 11)
// lay flush against the floor's edge, and what showed of it beyond was its far side, falling away like the side of a pit. That
// is the slant he hates, and the roofs that look like the street.
//
// WHAT THIS PAINTS: the rest of those walls, standing whole: everything the walls toward the eye would show, standing their
// full height, that the ground does not (`paintStanding`). It is laid over the ground and over whatever stands behind those
// walls, under whatever stands in front of them (render/act2_walls.ts), in BITS, one for each line of tiles across the screen
// (world x + y) its pixels belong to, so that each sorts with the figures as a wall tile does; and where the hero (or a
// monster in sight) is behind a bit, the bit is seen through round him.
//
// WHICH ROCK STANDS (`standingOf`): on floor 11 every house, roofs and all (they are houses, a block deep); on the floors of
// rooms and halls (12, 14 and 15), a wall a tile thick round the floor, its far side its face seen from beyond: the rock
// past that is the dark beyond the walls, as it is now. Floor 13, the Millrace, has no walls (its rise is 0).

import { T_FLOOR } from '../game/types';
import type { RGB, Terrain } from './terrain';
import { worldOf } from './terrain';

/** Rock that stands whole: within this many tiles of the walkable floor (Infinity: all of it). */
export function standingOf(T: Terrain, thick: number): (x: number, y: number) => boolean {
  const rock = (x: number, y: number): boolean => !T.ground(x, y) && !T.drop(x, y);
  if (!Number.isFinite(thick)) return rock;
  // (how far each place is from the nearest floor tile: a grid of K cells a tile, a margin round the floor)
  const f = T.floor;
  const K = 4;
  const M = Math.ceil(thick) + 2;
  const W = (f.w + 2 * M) * K;
  const H = (f.h + 2 * M) * K;
  const d = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    const ty = Math.floor(j / K) - M;
    for (let i = 0; i < W; i++) {
      const tx = Math.floor(i / K) - M;
      const on = tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR;
      d[j * W + i] = on ? 0 : 1e9;
    }
  }
  const D2 = Math.SQRT2;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const c = j * W + i;
      let v = d[c];
      if (i > 0) v = Math.min(v, d[c - 1] + 1);
      if (j > 0) {
        v = Math.min(v, d[c - W] + 1);
        if (i > 0) v = Math.min(v, d[c - W - 1] + D2);
        if (i + 1 < W) v = Math.min(v, d[c - W + 1] + D2);
      }
      d[c] = v;
    }
  }
  for (let j = H - 1; j >= 0; j--) {
    for (let i = W - 1; i >= 0; i--) {
      const c = j * W + i;
      let v = d[c];
      if (i + 1 < W) v = Math.min(v, d[c + 1] + 1);
      if (j + 1 < H) {
        v = Math.min(v, d[c + W] + 1);
        if (i + 1 < W) v = Math.min(v, d[c + W + 1] + D2);
        if (i > 0) v = Math.min(v, d[c + W - 1] + D2);
      }
      d[c] = v;
    }
  }
  const far = (x: number, y: number): number => {
    const i = Math.floor((x + M) * K);
    const j = Math.floor((y + M) * K);
    if (i < 0 || j < 0 || i >= W || j >= H) return Infinity;
    return Math.max(0, d[j * W + i] - 0.5) / K;
  };
  return (x, y) => rock(x, y) && far(x, y) < thick;
}

export interface StandingPiece {
  /** Its top left corner in the world's picture, and its size, in picture pixels (as a ground piece's). */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** Its pixels, RGBA: clear wherever the walls standing whole show what the ground shows. */
  rgba: Uint8ClampedArray<ArrayBuffer>;
  /** For each pixel, the line of tiles across the screen of the rock it shows (a tile's x + y, plus 1: its middle's), or -1. */
  depth: Int32Array;
}

/** Which way a wall's face standing whole is turned, as the ground's faces are (1 looking to the lower left, lit; -1 to the lower right; 0 a corner): by which way it is open. */
function faceTurn(stands: (x: number, y: number) => boolean, x: number, y: number): number {
  const e = 0.3;
  const openY = !stands(x, y + e);
  const openX = !stands(x + e, y);
  return (openY ? 1 : 0) - (openX ? 1 : 0);
}

/**
 * PAINT WHAT STANDS WHOLE over a piece of the ground: the world's picture from (x0, y0), w by h picture pixels, as the ground's
 * pieces are cut (render/outdoor.ts). Where the rock that stands (`stands`) rises in front of what the ground shows (the floor
 * behind a wall, or, past a wall a tile thick, the dark beyond), its top or its face as the look paints them; clear elsewhere.
 */
export function paintStanding(T: Terrain, stands: (x: number, y: number) => boolean, x0: number, y0: number, w: number, h: number): StandingPiece {
  const L = T.look;
  const H = L.rise;
  const rgba = new Uint8ClampedArray(w * h * 4);
  const depth = new Int32Array(w * h).fill(-1);
  const out = { x0, y0, w, h, rgba, depth };
  if (H <= 0) return out;
  // (the ground's own reckoning of the drop, as art/terrain.ts paintTerrain has it: only a look that hangs a face under it)
  const hasDrop = !!L.drop && !!L.hang;
  // rows from this piece's top to H past its foot (what stands in front of its last row), and one more
  const wA = y0;
  const wn = h + H + 2;
  const G = new Uint8Array(wn);
  const Dr = new Uint8Array(wn);
  const lastRock = new Int32Array(wn);
  const lastStand = new Int32Array(wn);
  const nextFloor = new Int32Array(wn);
  const V = new Int32Array(h + 1);
  // (what of the rock that stands the eye meets at each row from the one above the piece, shown by the ground or not: for the tops' far edge)
  const K = new Int32Array(h + 2);
  for (let c = 0; c < w; c++) {
    const px = x0 + c;
    let lr = -1;
    let ls = -1;
    for (let j = 0; j < wn; j++) {
      const [x, y] = worldOf(px, wA + j);
      const g = T.ground(x, y);
      const d = !g && hasDrop && T.drop(x, y);
      G[j] = g ? 1 : 0;
      Dr[j] = d ? 1 : 0;
      if (!g && !d) {
        lr = j;
        if (stands(x, y)) ls = j;
      }
      lastRock[j] = lr;
      lastStand[j] = ls;
    }
    let nf = wn + 4 * H;
    for (let j = wn - 1; j >= 0; j--) {
      if (G[j]) nf = j;
      nextFloor[j] = nf;
    }
    // the row above the piece, as far as it can be told (the rock that stands in front of it, from the piece's own rows)
    {
      const sr = lastStand[H - 1];
      K[0] = sr >= 0 ? sr + 1 : -1;
    }
    // how far up the rock that stands the eye meets it at each row (-1: nothing standing there that the ground does not show)
    for (let r = 0; r <= h; r++) {
      const sr = lastStand[r + H];
      K[r + 1] = sr < r ? -1 : sr - r;
      if (sr < r) {
        V[r] = -1;
        continue;
      }
      let same = false;
      if (!G[r]) {
        const ahead = Dr[r] ? lastRock[Math.min(r + H, nextFloor[r] - 1)] : lastRock[r + H];
        // (the drop showing, no rock in front of it this side of the floor: the ground shows no rock there)
        if (!(Dr[r] && ahead < r)) same = ahead === sr;
      }
      V[r] = same ? -1 : sr - r;
    }
    for (let r = 0; r < h; r++) {
      const v = V[r];
      if (v < 0) continue;
      const py = y0 + r;
      let col: RGB;
      let tx: number;
      let ty: number;
      if (v >= H) {
        const [x, y] = worldOf(px, py + H);
        const back = Math.max(0, Math.min(1, (T.edge(x, y) - T.field(x, y)) / 0.5));
        col = L.top(x, y, px, py, back, T.climbAt ? T.climbAt(x, y) : 0);
        if (V[r + 1] >= 0 && V[r + 1] < H) col = L.brow(col, px, py);
        // (its far edge, against what lies beyond it, a line of shadow: a roof's eaves over the street behind the house)
        else if (K[r] !== H) col = [col[0] * 0.42, col[1] * 0.42, col[2] * 0.45];
        else if (r > 0 && K[r - 1] !== H) col = [col[0] * 0.72, col[1] * 0.72, col[2] * 0.74];
        tx = Math.floor(x);
        ty = Math.floor(y);
      } else {
        const [x, y] = worldOf(px, py + v);
        // (the rock just behind the face's foot: whose tile it is, and which way the face is turned)
        const [rx, ry] = worldOf(px, py + v - 1);
        col = L.face(faceTurn(stands, rx, ry), v, px, py, x, y);
        tx = Math.floor(rx);
        ty = Math.floor(ry);
      }
      const i = r * w + c;
      const o = i * 4;
      rgba[o] = col[0];
      rgba[o + 1] = col[1];
      rgba[o + 2] = col[2];
      rgba[o + 3] = 255;
      depth[i] = tx + ty + 1;
    }
  }
  return out;
}

/** One line of tiles' part of a piece of what stands whole: its depth (a tile's x + y, plus 1), where it is in the world's picture and its pixels. */
export interface StandingBit {
  d: number;
  x0: number;
  y0: number;
  w: number;
  h: number;
  rgba: Uint8ClampedArray<ArrayBuffer>;
}

/** A piece of what stands whole cut into its bits, one for each line of tiles it shows (each as small as its pixels allow, its corner on an even pixel of the piece: the piece's own corner must be on an even pixel of the world's picture). */
export function standingBits(p: StandingPiece): StandingBit[] {
  const box = new Map<number, [number, number, number, number]>();
  for (let r = 0; r < p.h; r++) {
    for (let c = 0; c < p.w; c++) {
      const d = p.depth[r * p.w + c];
      if (d < 0) continue;
      const b = box.get(d);
      if (!b) box.set(d, [c, r, c, r]);
      else {
        if (c < b[0]) b[0] = c;
        if (c > b[2]) b[2] = c;
        if (r > b[3]) b[3] = r;
      }
    }
  }
  const bits: StandingBit[] = [];
  for (const [d, [cA, rA, c1, r1]] of box) {
    // (its corner on an even picture pixel, so that it lies on a whole game pixel as its piece does)
    const c0 = cA - (cA & 1);
    const r0 = rA - (rA & 1);
    const w = c1 - c0 + 1;
    const h = r1 - r0 + 1;
    const rgba = new Uint8ClampedArray(w * h * 4);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const i = r * p.w + c;
        if (p.depth[i] !== d) continue;
        const o = ((r - r0) * w + (c - c0)) * 4;
        rgba[o] = p.rgba[i * 4];
        rgba[o + 1] = p.rgba[i * 4 + 1];
        rgba[o + 2] = p.rgba[i * 4 + 2];
        rgba[o + 3] = p.rgba[i * 4 + 3];
      }
    }
    bits.push({ d, x0: p.x0 + c0, y0: p.y0 + r0, w, h, rgba });
  }
  bits.sort((a, b) => a.d - b.d);
  return bits;
}
