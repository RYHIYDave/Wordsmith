// Dev helper: A STAND-IN TOWER TOP for the Moth's pictures (art/moth.ts), and the laying of pictures on it. Not floor 20's
// ground (the Quiet Tower's own is the art chat's to make): a round top paved in rings of grey flags, a low parapet of bone
// white stone round it with its merlons, and the grey fog beyond; "Grey fog, bone white, no colour at all". The arena is
// a boss's, an ellipse 17 by 20 tiles. Pure numbers, no page: the dev page (dev/preview_moth.ts) and the film's maker
// (tools/moth_pictures.ts) both use it. Nothing of the game imports it.

import type { Px } from '../engine/px';
import { rgba } from '../engine/px';
import { hash } from '../art/kit';
import { RIM_ALPHA } from '../art/skin';
import { TILE3 } from '../art/new_mobs3';
import { GRID } from '../art/skeleton';
import type { V3 } from '../art/skeleton';

/** A picture being laid: its pixels (RGBA), picture pixels. */
export interface Frame {
  w: number;
  h: number;
  d: Uint8ClampedArray;
}
export function frameOf(w: number, h: number): Frame {
  return { w, h, d: new Uint8ClampedArray(w * h * 4) };
}
/** The arena: its half-lengths along the floor's two ways (tiles). */
export const ARENA = { a: 8.5, b: 10 } as const;
/** Where a point of the world (its own lengths: x, y along the floor, z up) is seen, from the top's middle at (ox, oy). */
export function seenAt(p: V3, ox: number, oy: number): [number, number] {
  return [ox + GRID * (p[0] + p[1]), oy + GRID * 0.5 * (p[0] - p[1]) - p[2]];
}

const hexRGB = (c: string): [number, number, number] => {
  const v = rgba(c);
  return [v[0], v[1], v[2]];
};
const FOG = ['#6e6d6b', '#7b7a77', '#888683', '#95938f', '#a2a09b'].map(hexRGB);
const FLAG = ['#474542', '#53514d', '#5e5b57', '#686561', '#737069', '#7f7b73'].map(hexRGB);
const INLAY = ['#7d786e', '#948e82', '#a7a194', '#b8b1a3'].map(hexRGB);
const JOINT = hexRGB('#2b2928');
const COPING = ['#7f7a71', '#958f84', '#aaa396', '#bdb6a8'].map(hexRGB);
const FACE = ['#383634', '#43403d', '#4e4b47', '#5a5651'].map(hexRGB);
/** An ordered dither (2 by 2, on game pixels): whether a share `k` of the way between two tones takes the next. */
const DITHER = [0.12, 0.62, 0.87, 0.37];
const dither = (gx: number, gy: number, k: number): boolean => k > DITHER[(gx & 1) + 2 * (gy & 1)];

/**
 * THE TOP, painted into `f` with its middle at (ox, oy), on whole game pixels: the fog below it beyond the parapet, in
 * soft bands; the parapet round it, its coping of bone white stone (its face toward you where the near side drops away),
 * its merlons standing on it; the flags in worn rows, a ring of them along the parapet, a ring of bone white stones
 * round the middle where the chapter lies; cracks, and dust drifted against the parapet.
 */
export function paintTop(f: Frame, ox: number, oy: number): void {
  const T = TILE3;
  const ell = (x: number, y: number): number => Math.hypot(x / (ARENA.a * T), y / (ARENA.b * T));
  const put = (x: number, y: number, c: readonly [number, number, number]): void => {
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const i = ((y + dy) * f.w + x + dx) * 4;
        if (x + dx < 0 || y + dy < 0 || x + dx >= f.w || y + dy >= f.h) continue;
        f.d[i] = c[0];
        f.d[i + 1] = c[1];
        f.d[i + 2] = c[2];
        f.d[i + 3] = 255;
      }
    }
  };
  // (the parapet's near face: how far down the picture it hangs under its coping, picture pixels)
  const WALL = 30;
  for (let y = 0; y < f.h; y += 2) {
    for (let x = 0; x < f.w; x += 2) {
      const gx = x >> 1;
      const gy = y >> 1;
      const a = (x + 1 - ox) / GRID;
      const b = (y + 1 - oy) / (GRID * 0.5);
      const X = (a + b) / 2;
      const Y = (a - b) / 2;
      const e = ell(X, Y);
      if (e > 1.04) {
        // the parapet's face, hanging under its coping where the near side drops away
        const up = (y + 1 - WALL - oy) / (GRID * 0.5);
        let face = -1;
        for (let k = 0; k <= WALL; k += 2) {
          const bu = (y + 1 - k - oy) / (GRID * 0.5);
          const eu = ell((a + bu) / 2, (a - bu) / 2);
          if (eu <= 1.04 && eu > 0.96) {
            face = k;
            break;
          }
        }
        void up;
        if (face >= 0) {
          const course = Math.floor(face / 10);
          const ang = Math.atan2((a - b) / 2, (a + b) / 2);
          const stone = Math.floor(ang * 18 + (course % 2) * 0.5);
          const joint = face % 10 < 2 || Math.abs(ang * 18 + (course % 2) * 0.5 - Math.round(ang * 18 + (course % 2) * 0.5)) < 0.05;
          put(x, y, joint ? JOINT : FACE[Math.min(3, 1 + Math.floor(hash(stone, course, 7701) * 3) - (face > 20 ? 1 : 0))]);
          continue;
        }
        // the fog below: soft bands, paler far off, dithered from one to the next
        const v = 1.7 + 0.9 * Math.sin(y * 0.018 + 0.7 * Math.sin(x * 0.006)) + 0.5 * Math.sin(y * 0.047 + x * 0.004 + 1.3) - (1 - y / f.h) * 0.6;
        const lo = Math.max(0, Math.min(3, Math.floor(v)));
        put(x, y, FOG[dither(gx, gy, v - Math.floor(v)) ? lo + 1 : lo]);
        continue;
      }
      if (e > 0.965) {
        // the parapet's coping: blocks of bone white stone
        const ang = Math.atan2(Y, X);
        const blk = Math.floor(ang * 30);
        const joint = Math.abs(ang * 30 - Math.round(ang * 30)) < 0.07 || Math.abs(e - 0.965) < 0.004;
        put(x, y, joint ? JOINT : COPING[1 + (hash(blk, 1, 7702) < 0.5 ? 1 : 0) - (e > 1.025 ? 1 : 0)]);
        continue;
      }
      const r = Math.hypot(X, Y);
      // the ring of bone white stones round the middle, where the chapter lies
      if (r > 1.6 * T && r < 2.15 * T) {
        const ang = Math.atan2(Y, X);
        const st = Math.floor(ang * 5);
        const joint = Math.abs(ang * 5 - Math.round(ang * 5)) < 0.04 || Math.abs(r - 1.6 * T) < 1.6 || Math.abs(r - 2.15 * T) < 1.6;
        put(x, y, joint ? JOINT : INLAY[1 + Math.floor(hash(st, 2, 7708) * 2.99) - (hash(Math.floor(X / 3), Math.floor(Y / 3), 7709) < 0.1 ? 1 : 0)]);
        continue;
      }
      // a ring of long stones along the parapet
      let stone: number;
      let joint: boolean;
      if (e > 0.9) {
        const ang = Math.atan2(Y, X);
        stone = 5000 + Math.floor(ang * 34);
        joint = Math.abs(ang * 34 - Math.round(ang * 34)) < 0.05 || Math.abs(e - 0.9) < 0.004;
      } else {
        // the flags in rows along the floor, each row's stones their own lengths, laid in a running bond
        const rowW = 0.62 * T;
        const row = Math.floor(Y / rowW);
        const inRow = Y / rowW - row;
        const off = hash(row, 3, 7710) * 2;
        const u = X / (0.82 * T) + off;
        const k0 = Math.floor(u);
        const long = hash(k0, row, 7711) < 0.3;
        const k = long ? Math.floor(u / 2) * 2 : k0;
        const uu = long ? (u - k) / 2 : u - k0;
        stone = row * 997 + k;
        joint = inRow < 0.06 || uu < 0.045;
      }
      if (joint) {
        put(x, y, JOINT);
        continue;
      }
      const base = hash(stone, 0, 7704);
      let kk = base < 0.15 ? 1 : base < 0.45 ? 2 : base < 0.8 ? 3 : 4;
      const pit = hash(Math.floor(X / 3), Math.floor(Y / 3), 7705);
      if (pit < 0.07) kk -= 1;
      else if (pit > 0.96) kk += 1;
      // (a crack across some)
      if (hash(stone, 1, 7706) < 0.2 && Math.abs(Math.sin(X * 0.09 + stone) * 6 + Math.sin(Y * 0.13) * 4 - (Y % 9)) < 0.7) kk = 0;
      // (dust drifted against the parapet)
      if (e > 0.86 && hash(Math.floor(X / 2), Math.floor(Y / 2), 7707) < (e - 0.86) * 6) kk = 5;
      put(x, y, FLAG[Math.max(0, Math.min(5, kk))]);
    }
  }
  // THE MERLONS standing on the coping: blocks, their tops bone white, their faces in shade; the far ones first
  const merlons: { a: number; near: number }[] = [];
  for (let k = 0; k < 26; k++) {
    const a = (k / 26) * Math.PI * 2;
    merlons.push({ a, near: Math.cos(a) * ARENA.a - Math.sin(a) * ARENA.b });
  }
  merlons.sort((p, q) => p.near - q.near);
  for (const m of merlons) {
    const H = 16;
    const half = 0.06;
    const corners: V3[] = [];
    for (const [da, rr] of [[-half, 0.968], [half, 0.968], [half, 1.035], [-half, 1.035]] as const) corners.push([Math.cos(m.a + da) * ARENA.a * T * rr, Math.sin(m.a + da) * ARENA.b * T * rr, 0]);
    const top = corners.map((p) => seenAt([p[0], p[1], H], ox, oy));
    const bot = corners.map((p) => seenAt(p, ox, oy));
    // (its faces toward the eye: each side whose bottom edge is lower on the picture than its top's)
    const faces: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];
    for (const [i, j] of faces) {
      const poly = [bot[i], bot[j], top[j], top[i]];
      const nx = (top[i][1] + top[j][1]) / 2;
      const midBot = (bot[i][1] + bot[j][1]) / 2;
      // (seen only if it faces down the picture: its outward normal toward the eye)
      const ex = bot[j][0] - bot[i][0];
      const ey = bot[j][1] - bot[i][1];
      if (ex * 1 - ey * 0 <= 0 && Math.abs(ex) > 0.5) continue;
      void nx;
      void midBot;
      fillPoly(f, poly, FACE[i % 2 ? 1 : 2]);
    }
    fillPoly(f, top, COPING[3]);
  }
}
/** A polygon filled on whole game pixels. */
function fillPoly(f: Frame, poly: [number, number][], c: readonly [number, number, number]): void {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys) / 2) * 2; y <= Math.max(...ys); y += 2) {
    for (let x = Math.floor(Math.min(...xs) / 2) * 2; x <= Math.max(...xs); x += 2) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if (yi > y + 1 !== yj > y + 1 && x + 1 < ((xj - xi) * (y + 1 - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (!inside) continue;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          if (x + dx < 0 || y + dy < 0 || x + dx >= f.w || y + dy >= f.h) continue;
          const i = ((y + dy) * f.w + x + dx) * 4;
          f.d[i] = c[0];
          f.d[i + 1] = c[1];
          f.d[i + 2] = c[2];
          f.d[i + 3] = 255;
        }
      }
    }
  }
}

/** Lay a painting (a Px, picture pixels) with its anchor (`ax`, `ay`) at (x, y): its whole pixels, and its edge of light laid over. */
export function layPx(f: Frame, p: Px, ax: number, ay: number, x: number, y: number): void {
  const x0 = Math.round(x - ax);
  const y0 = Math.round(y - ay);
  for (let j = 0; j < p.h; j++) {
    const fy = y0 + j;
    if (fy < 0 || fy >= f.h) continue;
    for (let i = 0; i < p.w; i++) {
      const fx = x0 + i;
      if (fx < 0 || fx >= f.w) continue;
      const s = (j * p.w + i) * 4;
      const a = p.d[s + 3];
      if (!a) continue;
      const o = (fy * f.w + fx) * 4;
      if (a === 255) {
        f.d[o] = p.d[s];
        f.d[o + 1] = p.d[s + 1];
        f.d[o + 2] = p.d[s + 2];
        f.d[o + 3] = 255;
      } else {
        const k = a / 255;
        f.d[o] = f.d[o] * (1 - k) + p.d[s] * k;
        f.d[o + 1] = f.d[o + 1] * (1 - k) + p.d[s + 1] * k;
        f.d[o + 2] = f.d[o + 2] * (1 - k) + p.d[s + 2] * k;
      }
    }
  }
}
/** The game's soft shadow under a figure: an oval, half-width `rx` picture pixels, darkest in its middle. */
export function layShadow(f: Frame, x: number, y: number, rx: number, strong = 0.55): void {
  const ry = rx * 0.5;
  for (let j = Math.floor(y - ry); j <= Math.ceil(y + ry); j++) {
    for (let i = Math.floor(x - rx); i <= Math.ceil(x + rx); i++) {
      if (i < 0 || j < 0 || i >= f.w || j >= f.h) continue;
      const d = Math.hypot((i - x) / rx, (j - y) / ry);
      if (d >= 1) continue;
      const k = strong * (1 - d * d);
      const o = (j * f.w + i) * 4;
      f.d[o] *= 1 - k;
      f.d[o + 1] *= 1 - k;
      f.d[o + 2] *= 1 - k;
    }
  }
}
/** The game's pool of light, laid over (a light the figure gives off: the enemy's own colour, soft). */
export function layLight(f: Frame, x: number, y: number, r: number, color: string, a: number): void {
  const [cr, cg, cb] = hexRGB(color);
  for (let j = Math.floor(y - r); j <= Math.ceil(y + r); j++) {
    for (let i = Math.floor(x - r); i <= Math.ceil(x + r); i++) {
      if (i < 0 || j < 0 || i >= f.w || j >= f.h) continue;
      const d = Math.hypot(i - x, j - y) / r;
      if (d >= 1) continue;
      const k = a * (1 - d) * (1 - d);
      const o = (j * f.w + i) * 4;
      f.d[o] = Math.min(255, f.d[o] + cr * k);
      f.d[o + 1] = Math.min(255, f.d[o + 1] + cg * k);
      f.d[o + 2] = Math.min(255, f.d[o + 2] + cb * k);
    }
  }
}
void RIM_ALPHA;
