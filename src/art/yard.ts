// THE HEADSMAN'S YARD, OUTDOORS, AT NIGHT: ITS PIECES, READY FOR THE GAME (the art chat, 28 Oct 2026). Behind the switch
// YARD, off; nothing of the game imports it until the main chat puts it in.
//
// His words to the main chat, 28 Oct, passed to the art chat on the board: “And I think I want the headman’s yard to be
// outdoors.  Like you go out to a big open area like a prison yard but there’s the gallows and the chopping block where the
// headsman’s boss area is at.”; who draws it, “The art chat (Recommended)”. Shown three looks (dev/preview_yard.ts), his pick:
// “B, night (Recommended)” (moon and stars, torches and braziers); and of what next, “Make it game-ready (Recommended)”.
//
// WHAT IS HERE, each in the game's own measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32):
//   floor(tx, ty)   THE COBBLES, laid on the world (stones run on across the tiles), a tile's picture for each tile
//   tiles           floor tiles laid over them here and there: three puddles holding the moon, sawdust, beaten earth,
//                   the gutter at a wall's foot (along x, along y)
//   faceLeft/Right  THE PRISON WALL round the yard, a tile of it at a time, as the game's walls are (its face turned to
//                   screen-left, in the light, for a wall along x; to screen-right, in shade, for one along y): 150 high,
//                   its wall-walk on top and a merlon of its battlements on its far edge, against the sky
//   arch            THE ARCH the hero comes out of from the Crypt: two tiles of the wall along x, the passage dark in it,
//                   its portcullis drawn up
//   tower           THE TOWER in the yard's far corner, three tiles each way, battlemented
//   beyond          WHAT IS SEEN OVER THE WALL: the night sky (the moon, stars, clouds in bands), the prison's keep and its
//                   cell block, dark hills; a backdrop drawn behind the yard's far walls
//   pieces          THE SCAFFOLD draped in black, the floor's own block and basket on it; THE LONG GALLOWS, three nooses
//                   over three trapdoors; THE YARD'S TORCH, set high on the wall, burning (four frames, its light)
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game, the renderer lays its darkness and cuts holes in it
// where a light burns (render.ts): the torches' and the braziers' (the floor's own 'brazier of irons'). Under the open sky
// the yard's dark is the moon's, lighter than the Crypt's: the main chat's to set (the picture he picked is the guide).
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to
// screen-right in shade); three tones a material; seams a deep indigo, never black; a dark base, the place a step quieter
// than the figures; nothing glowing cyan or pink; fire an honest orange; real shapes, not circles and squares.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Iso, ISO_X } from './isokit';
import type { SideShader, TopShader } from './isokit';
import { GRAIN, hash } from './kit';
import { EMBER } from './props';
import type { Piece } from './floorkit';
import { headsmanPieces } from './floor2';

/** THE SWITCH: off until the main chat puts the yard in, on his yes. */
export const YARD = { on: false };

// =================================================================================================
// MEASURES

const TW = 32 * GRAIN;
const TH = 16 * GRAIN;
const HALF = TW / 2;
/** How high the prison wall stands (picture pixels), and a merlon of its battlements over that. */
export const YARD_WALL = 150;
export const MERLON = 24;
/** The tower: three tiles each way, how high. */
export const TOWER_TILES = 3;
export const TOWER_H = 250;
/** The arch: how high its opening (picture pixels), and where in its two tiles it runs (tiles from the first tile's start). */
const ARCH_H = 104;
const ARCH_X0 = 0.3;
const ARCH_X1 = 1.7;

// =================================================================================================
// THE NIGHT'S COLOURS (his pick, B): five tones a material, its seam to its lit edge

type R5 = readonly [string, string, string, string, string];
const STONE: R5 = ['#0e0c24', '#1b1c36', '#262850', '#343867', '#566090'];
const COBBLE: R5 = ['#0e0c22', '#1a1b32', '#242642', '#303355', '#4c5482'];
const EARTH: R5 = ['#0e0c1c', '#1b1526', '#261d32', '#32273e', '#433552'];
const SAW: R5 = ['#24191f', '#3f3134', '#574545', '#6f5954', '#877160'];
const TIMBER: R5 = ['#120d1a', '#20182a', '#2f2338', '#3f3046', '#53435a'];
const CLOTH: R5 = ['#0e0c22', '#100f1c', '#171626', '#201e34', '#2c2a44'];
const IRON: R5 = ['#0e0c24', '#1a1c32', '#282b46', '#393d5e', '#5c628a'];
const SLATE: R5 = ['#0d0e20', '#16182e', '#1f223e', '#2a2e50', '#404672'];
const MOSS = ['#131b22', '#1c272b', '#273436'] as const;
/** (the moon's streak in a puddle kept under the darkest word: a place's light, Colour 4) */
const PUDDLE = ['#141a36', '#26305e', '#46558c'] as const;
const SEAM = '#0e0c24';
const BEYOND = '#04040a';
const SKY = ['#05060f', '#070917', '#0a0d1f', '#0d1128', '#111632', '#151b3b', '#1a2144', '#1f284e', '#253058', '#2b3762'];
const CLOUD = ['#0f1328', '#1a2140', '#3a4570'] as const;
const HAZE = '#151b38';
/** Fire: the props' own embers, so the renderer and the checks know it for fire. */
const FIRE = EMBER;
/** Light in a window far off: an honest orange, dim. */
const WINDOW = ['#a8502a', '#e07a36'] as const;

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hex(a);
  const [r1, g1, b1] = hex(b);
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r0 + (r1 - r0) * k)}${f(g0 + (g1 - g0) * k)}${f(b0 + (b1 - b0) * k)}`;
}
const fade = (r: R5, k: number): R5 => r.map((c) => mixC(c, HAZE, k)) as unknown as R5;
function noise(x: number, y: number, k = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k) + (hash(i + 1, j, k) - hash(i, j, k)) * sx;
  const b = hash(i, j + 1, k) + (hash(i + 1, j + 1, k) - hash(i, j + 1, k)) * sx;
  return a + (b - a) * sy;
}
const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);

/** The diamond's half width at a row, and where in its tile a pixel is (u to screen right-down, v to screen left-down), as art/ground.ts has them. */
const halfWidth = (y: number): number => (y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1);
function onTile(x: number, y: number): [number, number] {
  const px = x + 0.5 - HALF;
  const py = y + 0.5;
  return [(px / HALF + py / (TH / 2)) / 2, (py / (TH / 2) - px / HALF) / 2];
}

/** A sprite's pixels, whether it was painted under the game's canvas or the tests' (to set the floor's own block on the scaffold). */
function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const c = s.img;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const d = q.getImageData(0, 0, c.width, c.height).data;
  const p = new Px(c.width, c.height);
  p.d.set(d);
  return p;
}

// =================================================================================================
// STONE AND TIMBER, AS THEY ARE PAINTED

/** A face of the prison's dressed stone, in courses; `opening` cuts a hole (returns its colour, or undefined where there is none). */
function ashlar(r: R5, lit: boolean, seed: number, along = 0, opening?: (u: number, v: number, w: number, h: number) => string | null | undefined, moss = false): SideShader {
  const CH = 12;
  return (u0, v, w, h) => {
    if (opening) {
      const o = opening(u0, v, w, h);
      if (o !== undefined) return o;
    }
    const u = u0 + along;
    const c = Math.floor(v / CH);
    const lv = v % CH;
    const off = Math.floor(hash(c, seed, 1) * 40);
    const L = 24 + Math.floor(hash(c, seed, 2) * 14);
    const b = Math.floor((u + off) / L);
    const lu = (u + off) % L;
    if (lv === CH - 1 || lu === 0) return r[0];
    let k = lit ? 2 : 1;
    const tone = hash(b, c * 7 + seed, 3);
    if (tone < 0.1) k -= 1;
    else if (tone > 0.93) k += 1;
    if (lv === 0) k += 1;
    if (lit && lu === 1) k += 1;
    if (lv === CH - 2 || lu === L - 1) k -= 1;
    if (hash(u >> 1, v >> 1, seed + 5) < 0.025) k -= 1;
    const col = u >> 1;
    if (hash(col, 0, seed + 9) < 0.07 && v < 24 + 70 * hash(col, 1, seed + 9) && hash(col, v >> 3, seed + 10) > 0.25) k -= 1;
    const fromFoot = h - 1 - v;
    if (fromFoot < 10) k -= 1;
    if (moss && fromFoot < 8 && hash(u >> 1, fromFoot >> 1, seed + 13) < 0.5 - fromFoot * 0.05) return MOSS[fromFoot < 3 ? 0 : fromFoot < 6 ? 1 : 2];
    return r[clampK(k)];
  };
}
/** The walk on top of the wall: its flags, worn. */
function flags(r: R5, seed: number): TopShader {
  return (u, v) => {
    const a = Math.floor(u * 3 + hash(Math.floor(v * 2), seed, 1));
    const b = Math.floor(v * 2);
    const fu = u * 3 + hash(b, seed, 1) - a;
    const fv = v * 2 - b;
    if (fu < 0.06 || fv < 0.08) return r[0];
    return r[hash(a, b, seed) > 0.75 ? 3 : 2];
  };
}
/** Planks running along x: seams, nails, an old stain (a dull wine, never gore). */
function planksX(r: R5, seed: number, stains: boolean, x0: number, y0: number, x1: number, y1: number): TopShader {
  return (u, v) => {
    const x = x0 + u * (x1 - x0);
    const y = y0 + v * (y1 - y0);
    const board = Math.floor(y / 0.22);
    const along = x + hash(board, 0, seed) * 3;
    const cut = Math.floor(along / 1.6);
    const fv = y / 0.22 - board;
    const fu = along / 1.6 - cut;
    if (fv < 0.12 || fu < 0.03) return r[0];
    if ((fu < 0.07 || fu > 0.95) && fv > 0.4 && fv < 0.62) return r[4];
    if (stains && fbm(x * 2.2, y * 2.2, seed + 3) > 0.66) return fv > 0.85 ? '#24121c' : '#331722';
    const grain = hash(Math.floor(along * 18), board, seed + 1) > 0.88;
    return r[grain ? 1 : fv < 0.3 ? 3 : 2];
  };
}
/** Upright boards. */
function boardsUp(r: R5, lit: boolean, seed: number): SideShader {
  return (u, v, _w, h) => {
    const b = Math.floor(u / 7);
    const lu = u % 7;
    if (lu === 0 || v === h - 1) return r[0];
    let k = lit ? 2 : 1;
    if (v === 0) k += 1;
    if (lit && lu === 1) k += 1;
    if (hash(b, Math.floor(v / 3), seed) > 0.9) k -= 1;
    return r[clampK(k)];
  };
}

// =================================================================================================
// THE COBBLES, laid on the world: each stone a little off its place on a grid of quarter tiles, round, lit on its upper left
// (the light comes from (-1, +1)), a joint of dirt between, a blade of grass in a joint here and there. The grid repeats
// every four tiles, so sixteen pictures pave any yard.

const CS = 0.25;
const CELLS = 4 / CS;
const wrap = (i: number): number => ((i % CELLS) + CELLS) % CELLS;
function cobbleAt(x: number, y: number, r: R5 = COBBLE): string {
  const gi = Math.floor(x / CS);
  const gj = Math.floor(y / CS);
  let d1 = 9;
  let d2 = 9;
  let ci = 0;
  let cj = 0;
  let cx = 0;
  let cy = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    const i = gi + a;
    const j = gj + b;
    const fx = (i + 0.2 + 0.6 * hash(wrap(i), wrap(j), 61)) * CS;
    const fy = (j + 0.2 + 0.6 * hash(wrap(i), wrap(j), 62)) * CS;
    const d = Math.hypot(x - fx, y - fy);
    if (d < d1) {
      d2 = d1;
      d1 = d;
      ci = wrap(i);
      cj = wrap(j);
      cx = fx;
      cy = fy;
    } else if (d < d2) d2 = d;
  }
  if (d2 - d1 < 0.032) return hash(ci * 3 + cj, Math.floor((x + y) * 20) & 63, 69) > 0.93 ? MOSS[1] : r[0];
  const ex = (x - cx) / Math.max(0.05, d1);
  const ey = (y - cy) / Math.max(0.05, d1);
  const toLight = (-ex + ey) * Math.SQRT1_2;
  const edge = d1 / d2 > 0.62;
  let k = 2;
  const tone = hash(ci, cj, 71);
  if (tone < 0.18) k = 1;
  else if (tone > 0.9) k = 3;
  if (edge && toLight > 0.35) k += 1;
  if (edge && toLight < -0.35) k -= 1;
  return r[clampK(k)];
}
/** A floor tile's picture from a painter of the world (x, y in tiles). */
function tileOf(paint: (x: number, y: number) => string | null, tx: number, ty: number): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      const c = paint(tx + u, ty + v);
      if (c) p.set(x, y, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// =================================================================================================
// THE PRISON WALL, a tile at a time: its face, the walk on its top, a merlon on its far edge

/** A tile of the wall along x (its face turned to screen-left, lit) or along y (to screen-right, in shade): `k` its variety; `arch` one of the arch's two tiles. */
function wallTile(k: number, alongX: boolean, arch = -1): Sprite {
  const H = YARD_WALL;
  const top = MERLON + 2;
  const p = new Px(TW, TH + H + top);
  const iso = new Iso(p, HALF, H + top);
  const seed = 300 + k * 17 + (alongX ? 0 : 7);
  const opening = arch >= 0 ? archOpening(arch) : undefined;
  if (alongX) {
    iso.top(0, 0, 1, 1, H, flags(STONE, seed));
    iso.left(0, 1, 1, 0, H, ashlar(STONE, true, seed, 0, opening, true));
    iso.box(0.25, 0, 0.75, 0.3, H, H + MERLON, { top: () => STONE[3], left: ashlar(STONE, true, seed + 1), right: ashlar(STONE, false, seed + 2) });
  } else {
    iso.top(0, 0, 1, 1, H, flags(STONE, seed));
    iso.right(1, 0, 1, 0, H, ashlar(STONE, false, seed, 0, undefined, true));
    iso.box(0, 0.25, 0.3, 0.75, H, H + MERLON, { top: () => STONE[3], left: ashlar(STONE, true, seed + 1), right: ashlar(STONE, false, seed + 2) });
  }
  return p.sprite(HALF, H + top, GRAIN);
}
/** THE ARCH'S OPENING, in its tile `t` (0 or 1) of the wall along x: round-headed; its ring of wedge stones; the passage dark; the portcullis up. */
function archOpening(t: number): (u: number, v: number, w: number, h: number) => string | null | undefined {
  const a0 = ARCH_X0 * ISO_X;
  const a1 = ARCH_X1 * ISO_X;
  const half = (a1 - a0) / 2;
  const cx = (a0 + a1) / 2;
  const springs = ARCH_H - half;
  return (u0, v, _w, h) => {
    const u = u0 + t * ISO_X;
    const up = h - 1 - v;
    const du = u - cx;
    if (Math.abs(du) > half + 10 || up > ARCH_H + 10) return undefined;
    const r = up > springs ? Math.hypot(du, up - springs) : Math.abs(du);
    const inside = up <= springs ? Math.abs(du) < half : r < half;
    if (inside) {
      const bar = (((u - Math.round(a0)) % 10) + 10) % 10;
      const head = up > springs ? springs + Math.sqrt(Math.max(0, half * half - du * du)) : ARCH_H;
      if (head - up < 14 && bar <= 1) return head - up > 11 && bar === 1 ? IRON[1] : IRON[bar === 0 ? 3 : 2];
      if (head - up < 3) return IRON[1];
      if (up < 8) return up < 3 ? STONE[1] : SEAM;
      return BEYOND;
    }
    if (r < half + 10 && up > 0) {
      const ang = up > springs ? Math.atan2(up - springs, du) : du < 0 ? Math.PI : 0;
      const seg = Math.floor(ang / (Math.PI / 9));
      const edge = Math.abs(ang / (Math.PI / 9) - Math.round(ang / (Math.PI / 9))) < 0.06 || r > half + 8.5;
      if (up <= springs) {
        const course = Math.floor(up / 14);
        if (up % 14 === 0) return STONE[0];
        return r < half + 1.5 ? STONE[du < 0 ? 3 : 1] : STONE[course % 2 ? 2 : 3];
      }
      if (edge) return STONE[0];
      return r < half + 1.5 ? STONE[3] : STONE[seg % 2 ? 3 : 2];
    }
    return undefined;
  };
}

/** THE TOWER: three tiles each way, battlemented on all four edges, arrow slits; anchored at the floor point of its footprint's near corner. */
function tower(): Sprite {
  const N3 = TOWER_TILES;
  const H = TOWER_H;
  const top = MERLON + 2;
  const p = new Px(TW * N3, TH * N3 + H + top);
  const ox = HALF * N3;
  const iso = new Iso(p, ox, H + top);
  const slits = (lit: boolean): ((u: number, v: number, w: number, h: number) => string | undefined) => (u, v, w, h) => {
    const upp = h - 1 - v;
    const mid = Math.round(w * (lit ? 0.55 : 0.45));
    for (const at of lit ? [120, 190] : [160]) if (Math.abs(u - mid) <= 1 && upp > at && upp < at + 26) return u === mid - 1 ? STONE[1] : BEYOND;
    return undefined;
  };
  iso.box(0, 0, N3, N3, 0, H, { top: flags(STONE, 401), left: ashlar(STONE, true, 402, 0, slits(true), true), right: ashlar(STONE, false, 403, 0, slits(false), true) });
  const m = (x0: number, y0: number, x1: number, y1: number, s: number): void => {
    iso.box(x0, y0, x1, y1, H, H + MERLON, { top: () => STONE[3], left: ashlar(STONE, true, s), right: ashlar(STONE, false, s + 1) });
  };
  // (the far edges' merlons first, then the near edges')
  for (let x = 0; x < N3 - 0.1; x += 0.82) m(x, 0, Math.min(N3, x + 0.5), 0.3, 410 + Math.round(x * 10));
  for (let y = 0.3; y < N3 - 0.1; y += 0.82) m(0, y, 0.3, Math.min(N3, y + 0.5), 430 + Math.round(y * 10));
  for (let y = 0.3; y < N3 - 0.1; y += 0.82) m(N3 - 0.3, y, N3, Math.min(N3, y + 0.5), 450 + Math.round(y * 10));
  for (let x = 0.3; x < N3 - 0.4; x += 0.82) m(x, N3 - 0.3, Math.min(N3 - 0.3, x + 0.5), N3, 470 + Math.round(x * 10));
  return p.sprite(ox, H + top + TH * N3, GRAIN);
}

// =================================================================================================
// WHAT IS SEEN OVER THE WALL: the sky, the keep and the cell block, the hills; a backdrop anchored at the yard's far corner

export const BEYOND_W = 1600;
export const BEYOND_H = 700;
/** Where the yard's far corner (its floor point) is on the backdrop. */
const BX = 800;
const BY = 560;
function beyondPicture(): Sprite {
  const p = new Px(BEYOND_W, BEYOND_H);
  const horizon = BY - 40;
  const n = SKY.length;
  const band = horizon / n;
  const hills = (x: number): number => Math.round(horizon - 6 - 26 * fbm(x / 140, 0.5, 19) - 10 * fbm(x / 40, 2.5, 21)) & ~1;
  const land = [mixC(BEYOND, HAZE, 0.3), mixC(BEYOND, HAZE, 0.16)];
  for (let x = 0; x < p.w; x++) {
    const top = hills(x & ~1);
    for (let y = 0; y < p.h; y++) {
      if (y >= top) {
        p.set(x, y, y < top + 2 ? land[0] : y < horizon + 30 ? land[1] : BEYOND);
        continue;
      }
      const f = y / band;
      const i = Math.min(n - 1, Math.floor(f));
      const into = f - i;
      p.set(x, y, SKY[into > 0.72 && i < n - 1 && ((x >> 1) + (y >> 1)) % 2 === 0 ? i + 1 : i]);
    }
  }
  // CLOUDS in long banks, whole pairs of pixels, lit on their undersides by the moon
  for (let y = 0; y < horizon; y += 2) for (let x = 0; x < p.w; x += 2) {
    if (y >= hills(x) - 2) continue;
    const u = x / 240;
    const v = y / 34;
    const d = fbm(u + v * 0.15, v, 7);
    const thick = 0.6 - (y / horizon) * 0.04;
    if (d < thick) continue;
    const below = fbm(u + (v + 0.1) * 0.15, v + 0.1, 7);
    const above = fbm(u + (v - 0.1) * 0.15, v - 0.1, 7);
    const c = below < thick ? CLOUD[2] : above < thick ? CLOUD[0] : CLOUD[1];
    p.set(x, y, c).set(x + 1, y, c).set(x, y + 1, c).set(x + 1, y + 1, c);
  }
  // THE MOON, up to the upper left (whence the light), and stars
  // (up over the cell block's roof, where the picture he picked has it: 270 down the backdrop, the wall's top far below it)
  const mx = Math.round(BX - 170);
  const my = BY - 290;
  const R = 22;
  for (let y = -R - 10; y <= R + 10; y++) for (let x = -R - 10; x <= R + 10; x++) {
    const d = Math.hypot(x, y);
    const X = mx + x;
    const Y = my + y;
    if (d <= R) {
      const sea = fbm((x + 40) / 9, (y + 40) / 9, 3) > 0.58;
      p.set(X, Y, x + y > R * 0.9 ? '#9aa6c8' : sea ? '#b8c2dc' : '#dfe4f0');
    } else if (d <= R + 8 && ((X >> 1) + (Y >> 1)) % 2 === 0 && d <= R + 4 + 4 * hash(X >> 1, Y >> 1, 5)) {
      p.set(X, Y, '#2e3a68');
    }
  }
  for (let i = 0; i < 220; i++) {
    const x = Math.floor(hash(i, 1, 91) * p.w) & ~1;
    const y = Math.floor(hash(i, 2, 91) * horizon * 0.9) & ~1;
    if (Math.hypot(x - mx, y - my) < R + 12) continue;
    const c = hash(i, 3, 91) > 0.8 ? '#c8d0ec' : '#6a76a8';
    p.set(x, y, c).set(x + 1, y, c).set(x, y + 1, c).set(x + 1, y + 1, c);
  }
  // THE KEEP over the wall along x, and THE CELL BLOCK over the wall along y, faded toward the sky
  const iso = new Iso(p, BX, BY);
  const stone = fade(STONE, 0.3);
  const slate = fade(SLATE, 0.3);
  const K = { x0: 3.4, y0: -7.6, x1: 10.2, y1: -3.2, h: 236, ridge: 318 };
  const winK = (u: number, v: number, _w: number, h: number): string | null | undefined => {
    const col = Math.floor(u / 44);
    const uu = (u % 44) - 22;
    const upp = h - 1 - v;
    if (Math.abs(uu) <= 7 && upp > 148 && upp < 200) {
      if (upp > 192 && Math.hypot(uu, upp - 192) > 7) return undefined;
      if (Math.abs(uu) === 7 || upp === 149) return stone[0];
      if (uu === 0 || uu === -1) return stone[2];
      if (hash(col, 1, 41) <= 0.5) return SEAM;
      return upp < 156 || Math.abs(uu) > 4 ? WINDOW[0] : WINDOW[1];
    }
    if (Math.abs(uu) <= 9 && upp >= 145 && upp <= 148) return upp === 148 ? stone[3] : stone[1];
    return undefined;
  };
  iso.box(K.x0, K.y0, K.x1, K.y1, 0, K.h, { top: () => slate[1], left: ashlar(stone, true, 461, 0, winK), right: ashlar(stone, false, 462) });
  const ridgeY = (K.y0 + K.y1) / 2;
  iso.slopeLeft(K.x0 - 0.1, K.x1 + 0.1, K.y1 + 0.15, K.h - 4, K.x0 - 0.1, K.x1 + 0.1, ridgeY, K.ridge, (t, s) => {
    const row = Math.floor(t * 14);
    if (t * 14 - row < 0.12) return slate[0];
    const cell = Math.floor(s * 46 + (row % 2) * 0.5);
    return hash(cell, row, 43) > 0.85 ? slate[3] : t > 0.92 ? slate[4] : slate[2];
  });
  iso.right(K.x1, K.y0, K.y1, K.h, K.ridge, (u, v, w, h) => {
    const upp = h - 1 - v;
    if (upp > (1 - Math.abs(u - w / 2) / (w / 2)) * (K.ridge - K.h)) return null;
    return ashlar(stone, false, 463)(u, v, w, h, 0, 0);
  });
  const bx = 8.4;
  iso.box(bx - 0.45, ridgeY - 0.45, bx + 0.45, ridgeY + 0.45, K.ridge - 30, K.ridge + 40, {
    top: () => slate[2],
    left: (u, v, w, h) => (u > 6 && u < w - 6 && v > 10 && v < h - 18 ? (v < 14 ? stone[1] : BEYOND) : ashlar(stone, true, 464)(u, v, w, h, 0, 0)),
    right: ashlar(stone, false, 465),
  });
  iso.slopeLeft(bx - 0.5, bx + 0.5, ridgeY + 0.5, K.ridge + 40, bx, bx, ridgeY, K.ridge + 96, (t) => (t > 0.9 ? slate[4] : slate[2]));
  iso.slopeRight(bx + 0.5, ridgeY - 0.5, ridgeY + 0.5, K.ridge + 40, bx, ridgeY, ridgeY, K.ridge + 96, () => slate[1]);
  const C = { x0: -8.2, y0: 1.6, x1: -2.8, y1: 12.4, h: 196, ridge: 262 };
  const winC = (u: number, v: number, _w: number, h: number): string | null | undefined => {
    const col = Math.floor(u / 22);
    const uu = u % 22;
    const upp = h - 1 - v;
    for (const row of [128, 164]) {
      if (uu >= 7 && uu < 15 && upp > row && upp < row + 14) {
        if (uu === 7 || upp === row + 13) return stone[0];
        if (uu === 10 || uu === 12) return stone[3];
        return hash(col, row, 47) > 0.86 ? WINDOW[0] : SEAM;
      }
    }
    return undefined;
  };
  iso.box(C.x0, C.y0, C.x1, C.y1, 0, C.h, { top: () => slate[1], left: ashlar(stone, true, 466), right: ashlar(stone, false, 467, 0, winC) });
  const ridgeX = (C.x0 + C.x1) / 2;
  iso.slopeRight(C.x1 + 0.15, C.y0 - 0.1, C.y1 + 0.1, C.h - 4, ridgeX, C.y0 - 0.1, C.y1 + 0.1, C.ridge, (t, s) => {
    const row = Math.floor(t * 12);
    if (t * 12 - row < 0.12) return slate[0];
    const cell = Math.floor(s * 60 + (row % 2) * 0.5);
    return hash(cell, row, 45) > 0.85 ? slate[2] : t > 0.92 ? slate[3] : slate[1];
  });
  iso.left(C.x0, C.x1, C.y1, C.h, C.ridge, (u, v, w, h) => {
    const upp = h - 1 - v;
    if (upp > (1 - Math.abs(u - w / 2) / (w / 2)) * (C.ridge - C.h)) return null;
    return ashlar(stone, true, 468)(u, v, w, h, 0, 0);
  });
  for (const cy of [3.6, 7.0, 10.4]) iso.box(ridgeX - 0.3, cy - 0.3, ridgeX + 0.3, cy + 0.3, C.ridge - 20, C.ridge + 34, { top: () => stone[0], left: ashlar(stone, true, 469), right: ashlar(stone, false, 470) });
  return p.sprite(BX, BY, GRAIN);
}

// =================================================================================================
// THE FLOOR TILES LAID OVER THE COBBLES

interface Pool { x: number; y: number; rx: number; ry: number }
/** A tile with a puddle in it: the moon in it, a dark wet rim, a streak of its light. */
function puddleTile(pools: Pool[], seed: number): Sprite {
  return tileOf((x, y) => {
    let best = 9;
    for (const q of pools) best = Math.min(best, Math.hypot((x - q.x) / q.rx, (y - q.y) / q.ry) + (fbm(x * 6, y * 6, seed) - 0.5) * 0.4);
    if (best < 1) {
      if (best > 0.84) return EARTH[0];
      if (best > 0.68 && hash(Math.floor(x * 30), Math.floor(y * 30), seed + 1) > 0.3) return PUDDLE[x - y > 0 ? 2 : 0];
      return Math.abs(((x - y) * 2.2) % 1) < 0.08 ? PUDDLE[2] : PUDDLE[1];
    }
    if (best < 1.12) return EARTH[1];
    return cobbleAt(x + seed * 4, y);
  }, 0, 0);
}
/** A WIDE PUDDLE, lying on the floor over two or three tiles (laid as what lies on the floor is): the moon in it, a dark wet rim, ragged. Anchored at the floor point under its middle. */
function widePuddle(rx: number, ry: number, seed: number): Sprite {
  const W = Math.ceil((rx + ry) * 32) * 2 + 16;
  const H = Math.ceil((rx + ry) * 16) * 2 + 16;
  const p = new Px(W, H);
  const iso = new Iso(p, W / 2, H / 2);
  iso.top(-rx - 0.3, -ry - 0.3, rx + 0.3, ry + 0.3, 0, (u, v) => {
    const x = (u - 0.5) * 2 * (rx + 0.3);
    const y = (v - 0.5) * 2 * (ry + 0.3);
    const d = Math.hypot(x / rx, y / ry) + (fbm(x * 4 + seed, y * 4, seed) - 0.5) * 0.45;
    if (d >= 1.12) return null;
    if (d >= 1) return EARTH[1];
    if (d > 0.86) return EARTH[0];
    if (d > 0.7 && hash(Math.floor(x * 30) & 255, Math.floor(y * 30) & 255, seed + 1) > 0.3) return PUDDLE[x - y > 0 ? 2 : 0];
    return Math.abs((((x - y) * 2.2) % 1) + 1) % 1 < 0.08 ? PUDDLE[2] : PUDDLE[1];
  });
  return p.sprite(W / 2, H / 2, GRAIN);
}
function sawdustTile(seed: number): Sprite {
  return tileOf((x, y) => {
    const d = Math.hypot((x - 0.5) / 0.48, (y - 0.5) / 0.44) + (fbm(x * 5, y * 5, seed) - 0.5) * 0.5;
    if (d > 1) return cobbleAt(x + seed, y + seed);
    const fleck = hash(Math.floor(x * 32), Math.floor(y * 32), seed + 1);
    return fleck > 0.55 ? SAW[3] : fleck > 0.2 ? SAW[2] : EARTH[2];
  }, 0, 0);
}
function earthTile(seed: number): Sprite {
  return tileOf((x, y) => {
    const fleck = hash(Math.floor(x * 24), Math.floor(y * 24), seed);
    const rut = fbm(x * 2.5 + seed, y * 2.5, 67);
    // (here and there a cobble half sunk in it)
    const stone = fbm(x * 4 + seed, y * 4, 68) > 0.7;
    if (stone) return cobbleAt(x + seed, y);
    return EARTH[fleck > 0.93 ? 3 : fleck < 0.05 ? 0 : rut > 0.62 ? 1 : 2];
  }, 0, 0);
}
/** The gutter at a wall's foot: a channel of stone along the tile's far edge (along x: at v near 0; along y: at u near 0), dark water in it. */
function gutterTile(alongX: boolean): Sprite {
  return tileOf((x, y) => {
    const across = alongX ? y : x;
    const along = alongX ? x : y;
    if (across < 0.34) {
      if (across < 0.06 || across > 0.3) return STONE[0];
      if (across < 0.12) return STONE[1];
      return (Math.floor(along * 8) + Math.floor(across * 20)) % 7 === 0 ? PUDDLE[1] : PUDDLE[0];
    }
    return cobbleAt(x, y);
  }, 0, 0);
}

// =================================================================================================
// THE SCAFFOLD AND THE GALLOWS

/** The black drape over the scaffold's edge: hanging in folds, its foot cut in swags. */
function drape(lit: boolean, depth: number): SideShader {
  return (u, v) => {
    const ph = ((u % 40) / 40) * Math.PI * 2;
    const foot = depth - Math.round(Math.abs(Math.sin(ph / 2)) * 7);
    if (v > foot) return null;
    const f = (u + Math.round(v * 0.2)) % 12;
    let k = lit ? 2 : 1;
    if (f < 2) k += 1;
    else if (f > 8) k -= 1;
    if (v === 0) k = lit ? 4 : 3;
    if (v >= foot - 1) k -= 1;
    return CLOTH[clampK(k)];
  };
}
/** THE SCAFFOLD, its footprint 3.4 by 3.2 tiles and its steps down on its near side; the floor's own block and basket on it. Anchored at the floor point under its footprint's middle. */
const SCAF = { w: 3.4, d: 3.2, h: 40, stepX0: 0.9, stepX1: 2.3, stepOut: 1.15 };
function scaffold(): Sprite {
  const S = SCAF;
  const W = 280;
  const H = 230;
  const p = new Px(W, H);
  const cx = S.w / 2;
  const cy = S.d / 2;
  // (the floor point under its middle at (140, 150))
  const ox = 140 - (cx - cy) * 32;
  const oy = 150 - (cx + cy) * 16;
  const iso = new Iso(p, ox, oy);
  const under = (lit: boolean): SideShader => (u, v, w, h) => {
    const posts = Math.round(w / 3);
    const lu = u % posts;
    if (lu < 4 || u > w - 4) return TIMBER[lit && lu < 2 ? 3 : 2];
    const t = lu / posts;
    if (Math.abs(v / h - t) < 0.06 || Math.abs(v / h - (1 - t)) < 0.06) return TIMBER[lit ? 2 : 1];
    return SEAM;
  };
  iso.box(0, 0, S.w, S.d, 0, S.h, { top: planksX(TIMBER, 81, true, 0, 0, S.w, S.d), left: under(true), right: under(false) });
  iso.left(0, S.w, S.d, S.h - 26, S.h, drape(true, 26));
  iso.right(S.w, 0, S.d, S.h - 26, S.h, drape(false, 26));
  const rise = S.h / 4;
  const run = S.stepOut / 3;
  for (let i = 0; i < 3; i++) {
    iso.box(S.stepX0, S.d + run * i, S.stepX1, S.d + run * (i + 1), 0, S.h - rise * (i + 1), {
      top: planksX(TIMBER, 85 + i, false, S.stepX0, 0, S.stepX1, 1),
      left: boardsUp(TIMBER, true, 86 + i),
      right: boardsUp(TIMBER, false, 87 + i),
    });
  }
  // THE FLOOR'S OWN BLOCK, and its basket, stood on it (each as it is, at the platform's height)
  const own = headsmanPieces();
  const put = (name: string, frame: number, x: number, y: number): void => {
    const piece = own.find((q) => q.name === name);
    if (!piece?.frames) return;
    const s = piece.frames[frame];
    const src = pixelsOf(s);
    const [sx, sy] = iso.at(x, y, S.h);
    const d = s.density ?? 1;
    p.blit(src, Math.round(sx - s.ax * d), Math.round(sy - s.ay * d));
  };
  put('the block', 0, 1.2, 1.7);
  put('basket', 1, 1.75, 2.25);
  return p.sprite(140, 150, GRAIN);
}
/** A rope or a brace: a line two or three pixels wide between two points of the world. */
function bar(iso: Iso, a: [number, number, number], b: [number, number, number], c: string, c2: string, wide = 2): void {
  const [x0, y0] = iso.at(a[0], a[1], a[2]);
  const [x1, y1] = iso.at(b[0], b[1], b[2]);
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const X = Math.round(x0 + ((x1 - x0) * i) / n);
    const Y = Math.round(y0 + ((y1 - y0) * i) / n);
    for (let k = 0; k < wide; k++) iso.p.set(X + k, Y, k === 0 ? c : c2);
  }
}
/** THE LONG GALLOWS: its platform 3.8 by 1.6 tiles, two posts and a beam, three nooses over three trapdoors, its steps on its near side. Anchored at the floor point under its platform's middle. */
const GAL = { w: 3.8, d: 1.6, h: 34, top: 186, posts: [0.35, 3.45], postY: 0.8, nooses: [1.25, 1.95, 2.65], stepX0: 1.4, stepX1: 2.3 };
function gallows(): Sprite {
  const G = GAL;
  const W = 300;
  const H = 330;
  const p = new Px(W, H);
  const ox = 150 - (G.w / 2 - G.d / 2) * 32;
  const oy = 270 - (G.w / 2 + G.d / 2) * 16;
  const iso = new Iso(p, ox, oy);
  const top = planksX(TIMBER, 91, false, 0, 0, G.w, G.d);
  iso.box(0, 0, G.w, G.d, 0, G.h, {
    top: (u, v) => {
      const x = u * G.w;
      const y = v * G.d;
      for (const nx of G.nooses) {
        const dx = Math.abs(x - nx);
        const dy = Math.abs(y - (G.postY + 0.1));
        if (dx < 0.3 && dy < 0.3) {
          if (dx > 0.26 || dy > 0.26) return SEAM;
          if (dx < 0.05 && dy > 0.2) return IRON[3];
        }
      }
      return top(u, v);
    },
    left: boardsUp(TIMBER, true, 92),
    right: boardsUp(TIMBER, false, 93),
  });
  for (const px of G.posts) iso.box(px - 0.12, G.postY - 0.12, px + 0.12, G.postY + 0.12, G.h, G.top, { top: () => TIMBER[3], left: boardsUp(TIMBER, true, 94), right: boardsUp(TIMBER, false, 95) });
  iso.box(G.posts[0] - 0.35, G.postY - 0.11, G.posts[1] + 0.35, G.postY + 0.11, G.top - 14, G.top, { top: () => TIMBER[3], left: boardsUp(TIMBER, true, 96), right: boardsUp(TIMBER, false, 97) });
  bar(iso, [G.posts[0] + 0.12, G.postY + 0.12, G.top - 54], [G.posts[0] + 0.85, G.postY + 0.12, G.top - 14], TIMBER[3], TIMBER[1], 3);
  bar(iso, [G.posts[1] - 0.12, G.postY + 0.12, G.top - 54], [G.posts[1] - 0.85, G.postY + 0.12, G.top - 14], TIMBER[3], TIMBER[1], 3);
  const rope = [SAW[1], SAW[2], SAW[3]];
  for (const nx of G.nooses) {
    const ny = G.postY + 0.1;
    const zKnot = G.top - 62;
    bar(iso, [nx, ny, G.top - 14], [nx, ny, zKnot], rope[2], rope[1], 2);
    const [kx, ky] = iso.at(nx, ny, zKnot);
    for (let c = 0; c < 4; c++) for (let k = -1; k <= 2; k++) p.set(Math.round(kx) + k, Math.round(ky) + c * 2, c % 2 ? rope[0] : rope[2]);
    const lx = Math.round(kx) + 1;
    const ly = Math.round(ky) + 18;
    for (let a = 0; a < 64; a++) {
      const t = (a / 64) * Math.PI * 2;
      const X = Math.round(lx + Math.cos(t) * 6);
      const Y = Math.round(ly + Math.sin(t) * 9);
      p.set(X, Y, Math.cos(t) < -0.2 ? rope[2] : rope[1]);
      p.set(X + 1, Y, rope[0]);
    }
  }
  for (let i = 0; i < 3; i++) {
    iso.box(G.stepX0, G.d + 0.28 * i, G.stepX1, G.d + 0.28 * (i + 1), 0, G.h - (G.h / 4) * (i + 1), {
      top: planksX(TIMBER, 98 + i, false, G.stepX0, 0, G.stepX1, 1),
      left: boardsUp(TIMBER, true, 99),
      right: boardsUp(TIMBER, false, 100),
    });
  }
  return p.sprite(150, 270, GRAIN);
}

// =================================================================================================
// THE YARD'S TORCH, set high on the wall (92 up its 150): an iron bracket, the torch, its fire, four frames; its light

const TORCH_UP = 92;
/** A flat picture laid on a wall's face (turned to screen-left, `alongX`, or to screen-right, in shade), each column a pixel lower for every two across; anchored at the face's foot under its middle. Nothing faded: the yard's wall stands whole. */
function onYardFace(picture: Px, alongX: boolean, cx: number, foot: number): Px {
  const out = new Px(picture.w, picture.h + picture.w / 2 + 2);
  for (let x = 0; x < picture.w; x++) {
    const k = alongX ? Math.floor((x - cx) / 2) : Math.floor((cx - x) / 2);
    for (let y = 0; y < picture.h; y++) {
      let c = picture.get(x, y);
      if (!c) continue;
      if (!alongX && !FIRE.includes(c)) c = mixC(c, SEAM, 0.3);
      const Y = y + k + Math.ceil(picture.w / 4);
      out.set(x, Y, c);
    }
  }
  void foot;
  return out;
}
function torchFrame(f: number, alongX: boolean): Sprite {
  const W = 32;
  const H = 140;
  const cx = 16;
  const foot = 128;
  const p = new Px(W, H);
  const y0 = foot - TORCH_UP;
  // the bracket: an iron arm out of the wall, a ring round the torch
  for (let k = 0; k < 6; k++) p.set(cx - 1, y0 + 10 + k, IRON[1]).set(cx, y0 + 10 + k, IRON[3]);
  for (let x = -3; x <= 3; x++) p.set(cx + x, y0 + 8, IRON[x < 0 ? 3 : 1]).set(cx + x, y0 + 9, IRON[0]);
  // the torch: a stave of wood, its head wrapped
  for (let k = 0; k < 14; k++) p.set(cx - 1, y0 + k, TIMBER[1]).set(cx, y0 + k, TIMBER[3]).set(cx + 1, y0 + k, TIMBER[2]);
  for (let k = -2; k < 3; k++) for (let x = -2; x <= 2; x++) p.set(cx + x, y0 + k, x < 0 ? SAW[2] : SAW[1]);
  // its fire, an honest orange, flickering (four frames)
  for (let dy = -16; dy <= -2; dy++) for (let dx = -5; dx <= 5; dx++) {
    const up = -dy;
    const wdt = 4.6 - up * 0.26 + Math.sin(up * 0.9 + f * 1.7) * 0.9;
    if (Math.abs(dx - 0.5 + Math.sin(f * 2 + up * 0.4) * 0.6) > wdt) continue;
    const core = Math.abs(dx - 0.5) < wdt * 0.45 && up < 10;
    p.set(cx + dx, y0 + dy, core ? (up < 6 ? FIRE[4] : FIRE[3]) : up > 11 ? FIRE[1] : FIRE[2]);
  }
  const face = onYardFace(p, alongX, cx, foot);
  const s = face.sprite(cx, foot + Math.ceil(W / 4), GRAIN);
  s.lights = [{ x: cx / GRAIN, y: (y0 - 6 + Math.ceil(W / 4)) / GRAIN, r: 22 + (f % 2), color: FIRE[2], a: 0.5 } as Light];
  return s;
}

// =================================================================================================
// ALL OF IT

export interface YardArt {
  /** The cobbles of tile (tx, ty). */
  floor(tx: number, ty: number): Sprite;
  /** Floor tiles laid over the cobbles here and there. */
  tiles: Piece[];
  /** A tile of the prison wall: along x (turned to screen-left, lit) and along y (to screen-right, in shade); four of each. Anchored as the game's walls are: at the floor point of the tile's top corner. */
  faceLeft: Sprite[];
  faceRight: Sprite[];
  /** The arch out of the Crypt: two tiles of the wall along x, in place of two of its tiles (the first the farther). */
  arch: [Sprite, Sprite];
  /** The tower in the far corner (anchored at the floor point of its footprint's near corner). */
  tower: Sprite;
  /** The backdrop over the far walls (anchored at the floor point of the yard's far corner). */
  beyond: Sprite;
  /** Two wide puddles (lying on the floor), the scaffold, the gallows, the yard's torch. */
  pieces: Piece[];
}

let made: YardArt | null = null;
/** The yard's pictures, made the first time they are asked for and kept. */
export function makeYardArt(): YardArt {
  if (made) return made;
  const floors = new Map<string, Sprite>();
  const torch = { left: [0, 1, 2, 3].map((f) => torchFrame(f, true)), right: [0, 1, 2, 3].map((f) => torchFrame(f, false)) };
  made = {
    floor(tx, ty) {
      const key = `${((tx % 4) + 4) % 4},${((ty % 4) + 4) % 4}`;
      let s = floors.get(key);
      if (!s) {
        const [a, b] = key.split(',').map(Number);
        floors.set(key, (s = tileOf((x, y) => cobbleAt(x, y), a, b)));
      }
      return s;
    },
    tiles: [
      { name: 'a puddle', kind: 'floor tile', frames: [puddleTile([{ x: 0.5, y: 0.5, rx: 0.44, ry: 0.4 }], 501)] },
      { name: 'a long puddle', kind: 'floor tile', frames: [puddleTile([{ x: 0.5, y: 0.52, rx: 0.46, ry: 0.3 }, { x: 0.62, y: 0.32, rx: 0.3, ry: 0.24 }], 502)] },
      { name: 'a little puddle', kind: 'floor tile', frames: [puddleTile([{ x: 0.52, y: 0.48, rx: 0.32, ry: 0.28 }], 503)] },
      { name: 'yard sawdust', kind: 'floor tile', frames: [sawdustTile(504)] },
      { name: 'beaten earth', kind: 'floor tile', frames: [earthTile(505)] },
      { name: 'gutter along x', kind: 'floor tile', frames: [gutterTile(true)] },
      { name: 'gutter along y', kind: 'floor tile', frames: [gutterTile(false)] },
    ],
    faceLeft: [0, 1, 2, 3].map((k) => wallTile(k, true)),
    faceRight: [0, 1, 2, 3].map((k) => wallTile(k, false)),
    arch: [wallTile(9, true, 0), wallTile(10, true, 1)],
    tower: tower(),
    beyond: beyondPicture(),
    pieces: [
      { name: 'a wide puddle', kind: 'on the floor', frames: [widePuddle(1.1, 0.7, 511)] },
      { name: 'a great puddle', kind: 'on the floor', frames: [widePuddle(1.5, 0.9, 512)] },
      { name: 'the scaffold, draped', kind: 'obstacle', frames: [scaffold()], shadow: 1.6 },
      { name: 'the long gallows', kind: 'obstacle', frames: [gallows()], shadow: 1.4 },
      { name: "the yard's torch", kind: 'on the wall', left: torch.left, right: torch.right, spots: [{ du: 0, dv: 0, left: torch.left, right: torch.right }] },
    ],
  };
  return made;
}
/** Let the yard's pictures go (they are made again if they are wanted). */
export function forgetYard(): void {
  made = null;
}
/** The scaffold's and the gallows' footprints (tiles), for whoever lays them. */
export const YARD_FOOTPRINTS = { scaffold: { w: SCAF.w, d: SCAF.d + SCAF.stepOut }, gallows: { w: GAL.w, d: GAL.d + 0.84 } };
