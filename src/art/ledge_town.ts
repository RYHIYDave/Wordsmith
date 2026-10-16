// THE TOWN FAR BELOW THE LEDGE ROAD, UNDER THE CULT'S DOME (the art chat's, from its mock-up of the Queen's eyrie,
// src/dev/preview_eyrie.ts, with his yes of 14 Oct: "Yes, this is it (Recommended)"; the reveal he said yes to,
// "Yes, the dome (Recommended)"): painted crisp into the land of the sky, one game pixel two by two picture
// pixels: the swamp far off to the left under its dark violet haze, three thin lines of magic from it to the dome,
// the siege camps ringing the town, its roofs, wall and keep, smoke, and the dome of the cult's pink magic over it,
// see-through, its rim lit from the upper left and cracked with its power. The low clouds below the ledge pass in
// front of it (`hidden`). Moved here from the mock-up unchanged, so that the game's sky can have it
// (render/outdoor.ts); the mock-up paints it from here.

import { FLAME } from './mkit';

type RGB = [number, number, number];
const rgbOf = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The town's middle, in game pixels of the panel the mock-up painted; the swamp's, far off to the left of it. */
export const TOWN_AT: [number, number] = [192, 100];
export const SWAMP_AT: [number, number] = [70, 92];
const PINK = FLAME.map(rgbOf);

/** Paint the town into `buf` (w by h picture pixels of the sky's land), its middle at game pixel `town` of it and the swamp's at `swamp`. */
export function paintTown(buf: Uint8ClampedArray, w: number, h: number, hidden: (px: number, py: number) => boolean, town: readonly [number, number] = TOWN_AT, swamp: readonly [number, number] = SWAMP_AT): void {
  const gw = Math.floor(w / 2);
  const gh = Math.floor(h / 2);
  const get = (gx: number, gy: number): RGB => {
    const o = (gy * 2 * w + gx * 2) * 4;
    return [buf[o], buf[o + 1], buf[o + 2]];
  };
  /** Lay one game pixel, `haze` of the way to what is behind it (all of it is far off, in the air's blue); a cloud below the ledge hides it. */
  const put = (x: number, y: number, c: RGB, haze = 0.3): void => {
    const gx = Math.round(x);
    const gy = Math.round(y);
    if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) return;
    const m = mixc(c, get(gx, gy), haze);
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        if (hidden(gx * 2 + dx, gy * 2 + dy)) continue;
        const o = ((gy * 2 + dy) * w + gx * 2 + dx) * 4;
        buf[o] = m[0];
        buf[o + 1] = m[1];
        buf[o + 2] = m[2];
      }
    }
  };
  const [tx, ty] = town;
  const [sx, sy] = swamp;
  // the swamp, far off to the left: dark pools, and the dark violet of its glow hanging over it, every other pixel
  for (let gy = -10; gy <= 10; gy++) {
    for (let gx = -34; gx <= 34; gx++) {
      const d = Math.hypot(gx / 34, gy / 10);
      if (d < 1 && (gx + gy) % 2 === 0) put(sx + gx, sy + gy, [74, 42, 99], 0.55 + 0.35 * d);
    }
  }
  for (let i = 0; i < 16; i++) {
    const cx = sx - 26 + i * 3.4 + (hashOf(i, 0, 11) - 0.5) * 3;
    const cy = sy + (hashOf(i, 1, 11) - 0.5) * 6;
    const rw = 2 + Math.round(hashOf(i, 2, 11) * 3);
    for (let k = -rw; k <= rw; k++) put(cx + k, cy, [43, 58, 54], 0.25);
  }
  // the lines of magic from the swamp to the dome: three thin lines, each arcing to its own place on the dome
  const ends: [number, number][] = [[tx - 53, ty], [tx - 42, ty - 25], [tx - 18, ty - 38]];
  ends.forEach(([x1, y1], i) => {
    const x0 = sx + 8 - i * 9;
    const y0 = sy - 1 + i * 2;
    const bx = (x0 + x1) / 2 - i * 4;
    const by = Math.min(y0, y1) - 8 - i * 7;
    for (let t = 0; t <= 1; t += 0.003) {
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * bx + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * by + t * t * y1;
      put(x, y, PINK[2], 0.12);
    }
  });
  // the siege camps ringing the town: the cult's violet tents, lit on the left, and their cooking fires (orange)
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + (hashOf(i, 0, 13) - 0.5) * 0.18;
    const r = 1 + 0.14 * (hashOf(i, 1, 13) - 0.5);
    const x = Math.round(tx + Math.cos(a) * 60 * r);
    const y = Math.round(ty + Math.sin(a) * 16 * r);
    put(x, y - 1, [122, 80, 160]);
    put(x - 1, y, [122, 80, 160]);
    put(x, y, [92, 56, 124]);
    put(x + 1, y, [64, 36, 90]);
    if (hashOf(i, 2, 13) > 0.45) put(x + 2, y, [255, 170, 70], 0.1);
  }
  // the town: roofs packed inside its wall, the wall round it, its keep, and the smoke of what burns inside
  const ROOF: RGB[] = ['#9c4f3a', '#7e4636', '#b8835a', '#8a5a44'].map(rgbOf);
  for (let i = 0; i < 100; i++) {
    const a = hashOf(i, 0, 17) * Math.PI * 2;
    const r = Math.sqrt(hashOf(i, 1, 17)) * 0.92;
    const x = Math.round(tx + Math.cos(a) * 35 * r);
    const y = Math.round(ty + Math.sin(a) * 9 * r);
    const c = ROOF[Math.floor(hashOf(i, 2, 17) * 4)];
    const len = 2 + Math.floor(hashOf(i, 3, 17) * 2);
    for (let k = 0; k < len; k++) {
      put(x + k, y, k === 0 ? mixc(c, [255, 240, 220], 0.15) : c);
      put(x + k, y + 1, mixc(c, [40, 26, 30], 0.45));
    }
  }
  for (let k = 0; k < 220; k++) {
    const a = (k / 220) * Math.PI * 2;
    const x = tx + Math.cos(a) * 38;
    const y = ty + Math.sin(a) * 10.5;
    put(x, y, Math.sin(a) < 0 ? [214, 206, 194] : [158, 150, 140]);
  }
  for (let y = -9; y <= 0; y++) {
    put(tx - 1, ty + y, [214, 206, 194]);
    put(tx, ty + y, [184, 176, 166]);
    put(tx + 1, ty + y, [150, 142, 134]);
  }
  for (let k = 0; k < 3; k++) for (let x = -1 + Math.ceil(k / 2); x <= 1 - Math.floor(k / 2); x++) put(tx + x, ty - 10 - k, [110, 74, 58]);
  for (let i = 0; i < 3; i++) {
    const x0 = tx - 20 + i * 18;
    for (let k = 0; k < 7; k++) {
      const rr = 1 + k * 0.5;
      for (let gy = -rr; gy <= rr; gy++) for (let gx = -rr; gx <= rr; gx++) if (Math.hypot(gx, gy) <= rr && (gx + gy + k) % 2 === 0) put(x0 + k * 1.5 + gx, ty - 3 - k * 3.5 + gy, [96, 90, 104], 0.35 + k * 0.07);
    }
  }
  // the dome: the cult's pink magic over the town, see-through (every other pixel), its rim bright and lit from
  // the upper left, cracks of its power burning to gold across it
  const RXD = 54;
  const RYD = 42;
  for (let gy = -RYD; gy <= 0; gy++) {
    for (let gx = -RXD; gx <= RXD; gx++) {
      const d = Math.hypot(gx / RXD, gy / RYD);
      if (d > 1) continue;
      const x = tx + gx;
      const y = ty + 2 + gy;
      if (d > 1 - 1.6 / RYD) put(x, y, gx < -RXD * 0.25 && gy < -RYD * 0.4 ? PINK[3] : PINK[2], 0.05);
      else if ((gx + gy) % 2 === 0) put(x, y, PINK[1], 0.62 - 0.2 * d);
    }
  }
  for (let gx = -RXD; gx <= RXD; gx++) {
    const y = ty + 2 + Math.sqrt(Math.max(0, 1 - (gx / RXD) ** 2)) * 13;
    if (gx % 2 === 0) put(tx + gx, y, PINK[2], 0.15);
  }
  // (each crack a jagged line, joined pixel to pixel, gold where it starts and pink-gold as it runs on)
  for (let c = 0; c < 4; c++) {
    let x = tx - 30 + c * 19 + (hashOf(c, 0, 19) - 0.5) * 6;
    let y = ty - 32 + Math.abs(c - 1.5) * 5;
    for (let s = 0; s < 7; s++) {
      const nx = x + Math.round((hashOf(c, s, 23) - 0.5) * 6);
      const ny = y + 2 + Math.round(hashOf(c, s, 29) * 2);
      if (Math.hypot((nx - tx) / RXD, (ny - ty - 2) / RYD) > 0.95) break;
      const n = Math.max(Math.abs(nx - x), Math.abs(ny - y));
      for (let k = 0; k <= n; k++) put(x + ((nx - x) * k) / n, y + ((ny - y) * k) / n, s < 2 ? PINK[4] : PINK[3], 0.1);
      x = nx;
      y = ny;
    }
  }
}

