// THE FROZEN MERE, ONE OF THE TOWNS TO UNLOCK OR BUY: ITS GROUND, ITS SKY, ITS SNOW (the queue's draw-eight-other-towns; his
// pick of which next, 14 Nov 2026: “10 The Frozen Mere (Recommended)”). The sketch he kept (docs/mockups/endless_town, 10):
// “Stalls and tents out on a frozen lake in falling snow round one fire; the way down is a hole cut in the ice.” Drawn straight
// to the game's standard (his word on the isle's mock-up: “Actually redraw it, don’t just leave these mock up drawings”), the
// stations where the sketch had them. Nothing of the game imports this file: how the towns are won and laid is the main chat's.
//
// Painted as the Shaft's Rim's ground and the isle's are: every picture pixel a line of sight, what it meets first found by its
// numbers (here the ground has height: the banks of snow round the camp stand up, the hole in the ice goes down); flat tones,
// light in bands, a dither only where two bands meet; two picture pixels to a game pixel.
//   - THE GROUND, one picture: the night sky and its stars; far off over the ice, the far shore, low white hills black with pines;
//     the mere, dark ice to the horizon, long pale cracks in it, snow blown across it in streaks; THE CAMP in the middle, its snow
//     trodden flat, paths worn through it to the ice, the snow melted round the fire to wet black ice; a BANK of snow round it all,
//     drifted; THE HOLE cut in the ice for the way down, black water in it, its rim of broken ice; the portal's round, swept to
//     the clear ice, ringed with blocks of ice.
//   - THE SNOW FALLING: flakes, each its own size, drift and sway (`snowAt(t)`: where each is at time t).

import { bay, hx, mixc, rnd } from './endless_splash';
import type { C } from './endless_splash';

// ---------------------------------------------------------------------------------------------------------------------------
// THE PLACE, in tiles (a tile 32 x 16 game pixels, as the game's).

/** The camp's middle (the fire), and where the bank of snow round it rises. */
export const MERE = { cx: 12, cy: 12, bank: 9.0 } as const;
const D2R = Math.PI / 180;
const TAU = Math.PI * 2;
const polar = (a: number, r: number): [number, number] => [MERE.cx + Math.cos(a * D2R) * r, MERE.cy + Math.sin(a * D2R) * r];

/** THE LAYOUT (the sketch's, at the game's scale): each station's anchor tile. */
export const MERE_LAYOUT = {
  fire: [12, 12] as [number, number],
  gate: [8, 4] as [number, number],
  record: [12, 5] as [number, number],
  trophies: [14, 5] as [number, number],
  portal: polar(-135, 6.8),
  way: [11, 17] as [number, number],
  waypoint: [13.6, 17.6] as [number, number],
  forge: [17, 9] as [number, number],
  tentBack: [4, 9] as [number, number],
  wordsmith: [8, 13] as [number, number],
  lexicon: [14, 14] as [number, number],
  stash: [6, 17] as [number, number],
  stranger: [18, 14] as [number, number],
  torches: [[10.2, 7.6], [18.2, 7.0], [5.6, 15.0], [19.0, 12.4], [9.0, 19.0], [16.8, 17.0]] as [number, number][],
};
/** Where the paths run from the fire (degrees: 0 down the screen to the right, -90 up it to the right, 90 down it to the left). */
const PATHS = [101, -110, -135, -27, -166, 18, 166];
/** The portal's round: its middle, its radius (tiles). */
export const MERE_PORTAL = { at: MERE_LAYOUT.portal, r: 1.15 } as const;
/** The hole cut in the ice: its middle and radius (tiles). */
export const MERE_HOLE = { at: [MERE_LAYOUT.way[0] + 0.5, MERE_LAYOUT.way[1] + 0.5] as [number, number], r: 0.62 } as const;

/** Where the bank begins at angle a (radians): a round, drifted ragged. */
export function bankAt(a: number): number {
  return MERE.bank + 0.4 * Math.sin(3 * a + 0.7) + 0.25 * Math.sin(5 * a + 2.1) + 0.12 * Math.sin(11 * a);
}
/** Whether a body may stand at tile (x, y): in the camp, held off the bank, not in the hole, not in the fire. */
export function inCamp(x: number, y: number, r = 0.3): boolean {
  const a = Math.atan2(y - MERE.cy, x - MERE.cx);
  if (Math.hypot(x - MERE.cx, y - MERE.cy) > bankAt(a) - 0.3 - r) return false;
  if (Math.hypot(x - MERE_HOLE.at[0], y - MERE_HOLE.at[1]) < MERE_HOLE.r + r) return false;
  return Math.hypot(x - (MERE.cx + 0.5), y - (MERE.cy + 0.5)) > 0.9 + r;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE COLOURS: a moonless night; snow, blue in its shade; ice, dark; the far shore's pines.

const NIGHT = hx('#05060e');
const SKY = ['#020309', '#05060f', '#080a18', '#0c1020', '#121828'].map(hx);
/** Snow at night: from its deepest shade to where the light falls full on it. */
const SNOW = ['#141a2c', '#1e2840', '#2c3a58', '#405274', '#5a6e92', '#7a8eb0', '#a2b4d0'].map(hx);
/** Trodden snow: greyer, flatter. */
const TROD = ['#2a3044', '#343c54', '#3e4862', '#4c5874', '#5c6a88'].map(hx);
/** Ice: dark, a cold grey-blue (never the friend's cyan); its cracks pale. */
const ICE = ['#070b12', '#0c121c', '#121c2a', '#1a283a', '#24364c', '#30465e'].map(hx);
const CRACK = hx('#6c84a4');
const PINE = ['#04060a', '#080c12', '#0e141c'].map(hx);
const STAR = [hx('#8a90b0'), hx('#c8cce0')];

/** Value noise, smooth, 0 ... 1. */
function vn(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const s = (t: number): number => t * t * (3 - 2 * t);
  const a = rnd(xi, yi, seed);
  const b = rnd(xi + 1, yi, seed);
  const c = rnd(xi, yi + 1, seed);
  const d = rnd(xi + 1, yi + 1, seed);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}
/** A tone of a ramp by bands, the dither only where two bands meet. */
function band(r: readonly C[], k: number, px: number, py: number, dither = 0.22): C {
  const v = Math.max(0, Math.min(1, k)) * (r.length - 1);
  const i = Math.floor(v);
  const th = 0.5 + (bay(px, py) - 0.5) * dither;
  return r[Math.min(r.length - 1, i + (v - i > th ? 1 : 0))];
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE GROUND'S PICTURE: (MERE_GROUND.w x MERE_GROUND.h) game pixels, tile (0, 0) at game pixel (0, 0).

export const MERE_GROUND = { gx: -420, gy: -120, w: 840, h: 500 } as const;
const MID_Y = (MERE.cx + MERE.cy) * 8;
/** The horizon (game pixels): the ice runs back to it; the far shore stands on it. */
export const MERE_HORIZON = 40;

const tileAt = (gx: number, gy: number): [number, number] => {
  const U = gx / 16;
  const S0 = (gy - MID_Y) / 8;
  return [MERE.cx + (S0 + U) / 2, MERE.cy + (S0 - U) / 2];
};

/** The bank of snow at tile (x, y): how high (game pixels): rising from where it begins to its crest and down again, drifted. */
function bankHeight(x: number, y: number): number {
  const a = Math.atan2(y - MERE.cy, x - MERE.cx);
  const d = Math.hypot(x - MERE.cx, y - MERE.cy) - bankAt(a);
  if (d < -0.1 || d > 2.2) return 0;
  const crest = 0.6 + 0.35 * vn(a * 4, 3, 93);
  // (drifted: high in some places, low in others, all but gone in a few)
  const tall = (2 + 9 * vn(a * 2.4, 0, 91) ** 1.3) * (0.55 + 0.45 * vn(a * 8, 1, 92)) + 1.5 * vn(a * 21 + d * 3, 2, 94);
  const u = d < crest ? Math.max(0, d + 0.1) / (crest + 0.1) : 1 - (d - crest) / (2.2 - crest);
  return tall * Math.sin((Math.max(0, Math.min(1, u)) * Math.PI) / 2) ** 1.4;
}
/** The height of the ground at tile (x, y) (game pixels): 0 the ice; the bank; the hole (down to the water, -3.5). */
function heightAt(x: number, y: number): number {
  const dh = Math.hypot(x - MERE_HOLE.at[0], y - MERE_HOLE.at[1]);
  const rim = MERE_HOLE.r + 0.06 * Math.sin(Math.atan2(y - MERE_HOLE.at[1], x - MERE_HOLE.at[0]) * 7);
  if (dh < rim) return -3.5;
  // (a lip of snow thrown up round the hole as it was cut, low)
  const lip = dh < rim + 0.3 ? 1.4 * Math.sin(((dh - rim) / 0.3) * Math.PI) : 0;
  return Math.max(lip, bankHeight(x, y));
}

/** The camp's floor at tile (x, y), seen from above: trodden snow, the paths worn to the ice, the melt round the fire, the round. */
function campTop(x: number, y: number, px: number, py: number, k: number): C {
  const r = Math.hypot(x - MERE.cx, y - MERE.cy);
  const a = Math.atan2(y - MERE.cy, x - MERE.cx);
  // THE MELT ROUND THE FIRE: wet black ice, its edge slush
  const df = Math.hypot(x - (MERE.cx + 0.5), y - (MERE.cy + 0.5));
  const melt = 1.5 + 0.15 * Math.sin(a * 5);
  if (df < melt) return band(ICE, 0.3 + 0.25 * (df / melt) + (rnd(px >> 1, py, 101) > 0.92 ? 0.25 : 0), px, py);
  if (df < melt + 0.25) return band(TROD, 0.35 + 0.3 * vn(x * 6, y * 6, 102), px, py);
  // THE PORTAL'S ROUND: swept to the clear ice, smooth and dark; frost feathering in from its edge
  const [lx, ly] = MERE_PORTAL.at;
  const dp = Math.hypot(x - lx, y - ly);
  if (dp < MERE_PORTAL.r) {
    const frost = dp > MERE_PORTAL.r - 0.3 && vn(x * 9, y * 9, 103) > 0.45;
    if (frost) return band(SNOW, 0.45, px, py);
    // (a long pale streak across it, the ice's sheen)
    const sheen = Math.abs((x - lx) - (y - ly) * 0.3 - 0.2) < 0.06;
    return band(ICE, sheen ? 0.9 : 0.55 + 0.1 * vn(x * 3, y * 3, 104), px, py);
  }
  // THE PATHS, trodden through to the ice: from the fire out to the hole, the gate, the portal, the stalls
  const toward = (b: number, w: number): number => Math.abs(Math.atan2(Math.sin(a - b * D2R), Math.cos(a - b * D2R))) * r - w;
  const wob = (vn(x * 2, y * 2, 105) - 0.5) * 0.25;
  const onPath = r > 1.6 && Math.min(...PATHS.map((b) => toward(b, 0.3 + 0.06 * vn(r * 2, b, 113)))) + wob < 0;
  if (onPath) {
    // (trodden grey, scuffed: the ice showing through it here and there)
    if (vn(x * 4, y * 4, 106) > 0.9) return band(ICE, 0.85, px, py);
    return band(TROD, 0.8 + 0.12 * vn(x * 5, y * 5, 108) + (rnd(px >> 1, py, 109) > 0.95 ? 0.1 : 0), px, py);
  }
  // THE CAMP'S SNOW, trodden flat: footprints in it, a few
  const step = vn(x * 6, y * 6, 110);
  const print = rnd(Math.floor(x * 6), Math.floor(y * 6), 111) > 0.95 && step > 0.55;
  const kk = 0.6 + 0.1 * vn(x * 1.6, y * 1.6, 112) - 0.1 * (r / MERE.bank) ** 2 + k * 0.1 - (print ? 0.14 : 0);
  return band(SNOW, kk, px, py);
}
/** The open ice at tile (x, y): dark, long pale cracks in it, snow blown across it in streaks. */
function iceTop(x: number, y: number, gx: number, gy: number, px: number, py: number): C {
  const back = Math.max(0, 1 - (gy - MERE_HORIZON) / 300);
  // (snow streaks: long along the wind, which blows across the screen, thinner and paler far off)
  const streak = vn(gx / 60, gy / 3.2, 121) + 0.35 * vn(gx / 13, gy / 1.6, 122);
  if (streak > 1.0 - 0.1 * back) return band(SNOW, 0.35 + 0.35 * (streak - 1.0) + 0.2 * back, px, py);
  // (the cracks: thin crooked lines, a crack where the noise crosses its middle)
  const c1 = Math.abs(vn(x * 0.9, y * 0.9, 123) - 0.5);
  const c2 = Math.abs(vn(x * 1.7 + 4, y * 1.7, 124) - 0.5);
  if (c1 < 0.007 || (c2 < 0.005 && vn(x, y, 125) > 0.55)) return mixc(CRACK, ICE[2], 0.35 + back * 0.4);
  const tone = 0.3 + 0.35 * back + 0.12 * vn(x * 0.6, y * 0.6, 126);
  return band(ICE, tone, px, py);
}
/** The sky over the far shore: night, deepening upward; stars; a low haze of cold light at the horizon. */
function skyAt(gx: number, gy: number, px: number, py: number): C {
  const up = Math.max(0, Math.min(1, (MERE_HORIZON - gy) / 140));
  const t = Math.floor((1 - up) * 4 + (bay(px, py) - 0.5) * 0.95);
  let c = SKY[Math.max(0, Math.min(4, t))];
  const s = rnd(Math.floor(gx), Math.floor(gy), 131);
  if (s > 0.9955 && MERE_HORIZON - gy > 26) c = STAR[s > 0.9985 ? 1 : 0];
  return c;
}
/** THE FAR SHORE: low hills on the horizon, white with snow, black with pines along their tops. Null: not there. */
function shoreAt(gx: number, gy: number, px: number, py: number): C | null {
  const hill = 9 + 7 * vn(gx / 70, 0, 141) + 4 * vn(gx / 23, 1, 142);
  const top = MERE_HORIZON - hill;
  // (pines: each a narrow spike of its own height, standing close along the hills' tops)
  const col = Math.floor(gx / 3);
  const pine = rnd(col, 0, 143) > 0.35 ? 3 + rnd(col, 1, 144) * 8 * vn(gx / 40, 2, 145) : 0;
  const pineTop = top - pine;
  const half = Math.abs((gx / 3 - col) - 0.5);
  if (pine > 0 && gy >= pineTop + half * pine * 1.2 && gy < top + 2) return PINE[rnd(col, 2, 146) > 0.5 ? 1 : 0];
  if (gy < top) return null;
  // (the snow of the hills: pale where it faces the eye, a band of dark wood along them)
  const wood = gy < top + 2.5 + 2 * vn(gx / 9, 3, 147);
  if (wood) return PINE[2];
  return band(SNOW, 0.32 - (gy - top) / (hill * 3), px, py);
}

/** What the eye meets first at picture pixel (px, py) of the ground's picture. Numbers only. */
export function mereGroundAt(px: number, py: number): C {
  const gx = MERE_GROUND.gx + (px + 0.5) / 2;
  const gy = MERE_GROUND.gy + (py + 0.5) / 2;
  if (gy < MERE_HORIZON) return shoreAt(gx, gy, px, py) ?? skyAt(gx, gy, px, py);
  // (THE LINE OF SIGHT: from what stands highest, nearest the eye, down to the water in the hole)
  const [mx, my] = tileAt(gx, gy);
  const near = Math.hypot(mx - MERE.cx, my - MERE.cy);
  const tall = near > MERE.bank - 2 && near < MERE.bank + 4.5;
  const hole = Math.hypot(mx - MERE_HOLE.at[0], my - MERE_HOLE.at[1]) < MERE_HOLE.r + 0.9;
  const zTop = tall ? 13 : hole ? 2 : 0;
  const zLow = hole ? -4 : 0;
  for (let z0 = zTop; z0 >= zLow; z0 -= 0.5) {
    let [x, y] = tileAt(gx, gy + z0);
    let h = heightAt(x, y);
    if (h < z0) continue;
    // (found between this step and the last: close in on where the line of sight meets the snow, so that a steep slope is not
    // cut into steps)
    let z = z0;
    if (z0 < zTop && h >= 0) {
      let lo = z0;
      let hi = z0 + 0.5;
      for (let i = 0; i < 6; i++) {
        const mid = (lo + hi) / 2;
        const [mx2, my2] = tileAt(gx, gy + mid);
        if (heightAt(mx2, my2) >= mid) lo = mid;
        else hi = mid;
      }
      z = lo;
      [x, y] = tileAt(gx, gy + z);
      h = Math.max(z, heightAt(x, y));
    }
    if (h < -1) {
      // THE HOLE: black water at its foot, the side of the ice down to it
      if (h - z > -0.3 && z <= -3.4) {
        const ripple = (Math.floor(py / 2) + Math.floor(gx / 5)) % 7 === 0;
        return ripple ? ICE[2] : hx('#03050a');
      }
      return band(ICE, 0.35 + z * 0.06, px, py);
    }
    if (h - z > 0.6) {
      // (a side of something seen square: the ice's edge into the hole)
      return band(ICE, 0.5, px, py);
    }
    // (on the snow: lit by how it faces, the light from the upper left, as everywhere)
    const e = 0.06;
    const hx0 = heightAt(x + e, y) - heightAt(x - e, y);
    const hy0 = heightAt(x, y + e) - heightAt(x, y - e);
    const k = Math.max(-1, Math.min(1, (hx0 * 0.5 - hy0 * 1.1) / (2 * e) / 22));
    if (h > 0.3) {
      // THE BANK (and the lip round the hole): snow, drifted, its crest catching the light
      const crestLit = rnd(px >> 1, py >> 1, 151) > 0.94 ? 0.1 : 0;
      return band(SNOW, 0.42 + 0.48 * k + 0.08 * (h / 10) + crestLit + 0.05 * (vn(x * 7, y * 7, 152) - 0.5), px, py, 0);
    }
    const r = Math.hypot(x - MERE.cx, y - MERE.cy);
    if (r < bankAt(Math.atan2(y - MERE.cy, x - MERE.cx)) + 0.15) return campTop(x, y, px, py, k);
    return iceTop(x, y, gx, gy, px, py);
  }
  const [x, y] = tileAt(gx, gy);
  return iceTop(x, y, gx, gy, px, py);
}

export interface MereGround {
  canvas: HTMLCanvasElement;
  gx: number;
  gy: number;
  ms: number;
}
/** Paint the ground once. */
export function paintMereGround(): MereGround {
  const t0 = performance.now();
  const W = MERE_GROUND.w * 2;
  const H = MERE_GROUND.h * 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(W, H);
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++) {
      const c = mereGroundAt(px, py);
      const o = (py * W + px) * 4;
      im.data[o] = (c >> 16) & 255;
      im.data[o + 1] = (c >> 8) & 255;
      im.data[o + 2] = c & 255;
      im.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return { canvas, gx: MERE_GROUND.gx, gy: MERE_GROUND.gy, ms: performance.now() - t0 };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SNOW FALLING: flakes over the whole screen, each its own size and fall, swaying as it goes.

export interface Flake {
  x: number;
  y: number;
  big: boolean;
  near: boolean;
}
/** Where the flakes are at time t (seconds), over a screen w x h game pixels: `n` of them, wrapping round. */
export function snowAt(t: number, w: number, h: number, n = 160): Flake[] {
  const out: Flake[] = [];
  for (let i = 0; i < n; i++) {
    const near = rnd(i, 0, 161) > 0.75;
    const fall = (near ? 26 : 12) + rnd(i, 1, 162) * 10;
    const x0 = rnd(i, 2, 163) * w;
    const y0 = rnd(i, 3, 164) * h;
    const sway = (near ? 7 : 3) * Math.sin(t * (0.8 + rnd(i, 4, 165)) + i);
    out.push({ x: (x0 + sway + t * 6 + w) % w, y: (y0 + t * fall) % h, big: near && rnd(i, 5, 166) > 0.5, near });
  }
  return out;
}
/** A flake's colours: the near ones bright, the far ones dim. */
export const FLAKE = { near: '#dfe8f6', far: '#7c8ca8' } as const;
void TAU;
