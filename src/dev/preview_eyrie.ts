// Dev page: FLOOR 7'S BOSS AREA, THE QUEEN'S EYRIE: her peak, looking out over the city (a mock-up for the
// owner's yes; nothing of the game imports it).
//
// His words, 13 Oct, 20:59: “Or we can just have the trail sort of work out one direction primarily, then have
// the boss area be on some peak where we can see the city.  I’ll wait for the new drawing and we can figure it
// out”; asked which way the Ledge Road goes, his pick: “Mostly one way, views at turns (Recommended)”, offered
// as: the trail runs mostly one way, cliff above and below as drawn; a few turns round the mountain open a view
// like this one; the boss's peak looks out over the city.
//
// Read as: the trail's end comes along a narrow ridge onto the mountain's top, a bare floor of rock jutting out
// over the drop, nothing over it; past its far edge, nothing but sky, and far below in the haze the town under
// the cult's dome, as the reveal he said yes to has it (“Yes, the dome (Recommended)”: the dome of the cult's
// pink magic, its rim bright and cracked with power, the siege camps ringing the town, lines of magic running
// to it from the swamp). The Queen stands on her eyrie at the far edge, her nest and the great egg beside her,
// bones about; the knight comes up onto the top from below.
//
// Made of what he has said yes to: the Ledge Road's ground and sky (art/ledge.ts, painted by art/terrain.ts
// from the tiles laid here), floor 7's pieces (art/floor7.ts), the Queen as she stands (art/carrion_queen.ts).
// New here: the shape of the top, and the town painted crisp, two picture pixels to a game pixel, in the land
// far below.
//
//   node tools/preview.mjs src/dev/preview_eyrie.ts shots/eyrie_world.png 1014 468 shot
//     one phone screen (507 x 234 game pixels at 2 picture pixels each)
//   node tools/preview.mjs src/dev/preview_eyrie.ts shots/eyrie_city.png 1014 468 city
//     the town far below, at four times, to check its pixels
//   node tools/preview.mjs src/dev/preview_eyrie.ts shots/eyrie_dive.png 1014 468 dive:0.66
//     the same screen with the Queen at a moment of one of her moves (here her dive's hang, high over the top)

import { ledgePieces } from '../art/floor7';
import { queenFrame, queenStanding } from '../art/carrion_queen';
import { spriteOf3 } from '../art/heroes3';
import { FLAME } from '../art/mkit';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { cloudBelow, ledgeLook, paintSky } from '../art/ledge';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = 1014;
const PH = 468;

// ---------------------------------------------------------------------------------------------------
// The panel and the world, as the Ledge Road's page has them (world (12, 12) at the panel's middle, moved D tiles).

const D = 10;
const OX = PW / 2;
const OY = PH / 2 - 24 * HHP;
const at = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWP;
  const b = (py - OY) / HHP;
  return [(a + b) / 2 + D, (b - a) / 2 + D];
};
const toPanel = (x: number, y: number): [number, number] => [OX + (x - D - (y - D)) * HWP, OY + (x - D + (y - D)) * HHP];
type Shape = (x: number, y: number) => boolean;

/** The top of the peak: a broad, ragged oval of bare rock jutting out over the drop. */
const CX = 500;
const CY = 322;
const RX = 330;
const RY = 72;
const ragged = (a: number): number => 1 + 0.06 * Math.sin(3 * a + 0.7) + 0.045 * Math.sin(7 * a + 2.1) + 0.02 * Math.sin(13 * a);
const onTop = (sx: number, sy: number): boolean => {
  const dx = (sx - CX) / RX;
  const dy = (sy - CY) / RY;
  return Math.hypot(dx, dy) < ragged(Math.atan2(dy, dx));
};
/** The trail's end, coming in from the right along a narrow ridge, the drop on both sides of it. */
const trailEnd = (sx: number, sy: number): boolean => sx > 720 && Math.abs(sy - (304 + (sx - 720) * 0.06)) < 30 + 4 * Math.sin(sx / 31);
const TOP: Shape = (x, y) => {
  const [sx, sy] = toPanel(x, y);
  return onTop(sx, sy) || trailEnd(sx, sy);
};
/** The peak is the mountain's top: nothing rises over it, and everywhere off it is the drop. */
const BEYOND = (): boolean => true;

/** Lay the tiles of a shape (as the Ledge Road's page does): each whole, one of the four halves, or not floor; not floor, the drop where `beyond` says. */
function layTiles(shape: Shape, beyond: (x: number, y: number) => boolean, w: number, h: number): Floor {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  const options: [number, (u: number, v: number) => boolean][] = [
    [-1, () => false],
    [0, () => true],
    [CUT_RIGHT, (u, v) => v > u],
    [CUT_LEFT, (u, v) => u > v],
    [CUT_NEAR, (u, v) => u + v < 1],
    [CUT_FAR, (u, v) => u + v > 1],
  ];
  const N = 8;
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const there: boolean[] = [];
      for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) there.push(shape(tx + (a + 0.5) / N, ty + (b + 0.5) / N));
      if (there.every((v) => !v)) {
        if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * w + tx] = T_PIT;
        continue;
      }
      let best = 0;
      let least = Infinity;
      options.forEach(([, inside], k) => {
        let wrong = 0;
        for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) if (inside((a + 0.5) / N, (b + 0.5) / N) !== there[a * N + b]) wrong++;
        if (wrong < least - 0.5) {
          least = wrong;
          best = k;
        }
      });
      const c = options[best][0];
      if (c >= 0) {
        tiles[ty * w + tx] = T_FLOOR;
        cut[ty * w + tx] = c;
      } else if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * w + tx] = T_PIT;
    }
  }
  return { depth: 7, seed: 7, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

const FLOOR = layTiles(TOP, BEYOND, 48, 48);
const OUTSIDE = new Map<number, boolean>();
const dropTile = (tx: number, ty: number): boolean => {
  if (tx >= 0 && ty >= 0 && tx < FLOOR.w && ty < FLOOR.h) return FLOOR.tiles[ty * FLOOR.w + tx] === T_PIT;
  const key = (ty + 1000) * 4000 + tx + 1000;
  let d = OUTSIDE.get(key);
  if (d === undefined) {
    d = BEYOND();
    OUTSIDE.set(key, d);
  }
  return d;
};
const T: Terrain = terrainOf(FLOOR, ledgeLook(dropTile));
const VX = -OX;
const VY = -OY + 2 * D * HHP;
/** Where the sky's horizon sits on the panel: high, so that the land far below fills the view past the far edge. */
const HORIZON = 100;

// ---------------------------------------------------------------------------------------------------
// THE TOWN FAR BELOW, painted crisp into the sky's land: one game pixel is two by two picture pixels.

type RGB = [number, number, number];
const rgbOf = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The town's middle, in game pixels of the panel; the swamp's, far off to the left. */
const TOWN: [number, number] = [192, 100];
const SWAMP: [number, number] = [70, 92];
const PINK = FLAME.map(rgbOf);

function paintTown(buf: Uint8ClampedArray, w: number, h: number, hidden: (px: number, py: number) => boolean): void {
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
  const [tx, ty] = TOWN;
  const [sx, sy] = SWAMP;
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

/**
 * Where the sky starts on the panel: of its own places (the game scrolls it, so each is a true view), the one
 * whose clouds below the ledge leave the town and its dome clearest.
 */
function skyStart(): number {
  const base = Math.round(VX * 0.5);
  let best = base;
  let least = Infinity;
  for (let k = 0; k < 64; k++) {
    const x0 = base + k * 32;
    // (a cloud over the town itself counts three times one over the rest of the dome)
    let n = 0;
    for (let py = 104; py < 246; py += 4) {
      for (let px = 262; px < 506; px += 4) {
        if (cloudBelow(x0 + px, -HORIZON + py)) n += px > 300 && px < 470 && py > 150 ? 3 : 1;
      }
    }
    if (n < least) {
      least = n;
      best = x0;
    }
  }
  return best;
}

/** Paint the panel: the sky (with the town far below in its land), and the ground over it. */
function paintPanel(g: CanvasRenderingContext2D): void {
  const w = PW;
  const h = PH;
  const x0 = skyStart();
  const sky = paintSky(x0, -HORIZON, w, h);
  paintTown(sky, w, h, (px, py) => cloudBelow(x0 + px, -HORIZON + py));
  const out = new Uint8ClampedArray(w * h * 4);
  const piece = 256;
  for (let py = 0; py < h; py += piece) {
    for (let px = 0; px < w; px += piece) {
      const pw = Math.min(piece, w - px);
      const ph = Math.min(piece, h - py);
      const p = paintTerrain(T, VX + px, VY + py, pw, ph);
      for (let r = 0; r < ph; r++) {
        for (let c = 0; c < pw; c++) {
          const s = (r * pw + c) * 4;
          const o = ((py + r) * w + px + c) * 4;
          const clear = p.rgba[s + 3] === 0;
          for (let k = 0; k < 4; k++) out[o + k] = clear ? sky[o + k] : p.rgba[s + k];
        }
      }
    }
  }
  g.putImageData(new ImageData(out, w, h), 0, 0);
}

// ---------------------------------------------------------------------------------------------------
// What stands on the top: the Queen at the far edge, her nest and egg, the flock's leavings, the knight.

/** A sprite with its anchor at picture pixel (sx, sy) of the panel, two picture pixels to a game pixel. */
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number): void {
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
interface Stand { x: number; y: number; sp: Sprite; shadow?: number }
function drawStands(g: CanvasRenderingContext2D, stands: Stand[]): void {
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const s of stands) {
    const [sx0, sy0] = pictureOf(s.x, s.y);
    const sx = sx0 - VX;
    const sy = sy0 - VY;
    if (s.shadow) {
      g.fillStyle = 'rgba(25, 18, 40, 0.32)';
      g.beginPath();
      g.ellipse(sx, sy, s.shadow * HWP * 1.1, s.shadow * HHP * 1.1, 0, 0, Math.PI * 2);
      g.fill();
    }
    drawAt(g, s.sp, sx, sy);
  }
}
const pc = (name: string, frame = 0): Sprite => {
  const q = ledgePieces().find((x) => x.name === name);
  if (!q || !q.frames) throw new Error(`no piece ${name}`);
  return q.frames[frame];
};
const shadowOf = (name: string): number | undefined => ledgePieces().find((x) => x.name === name)?.shadow;

/** The flock, circling out over the drop: small dark wings, flat and high. */
function flock(g: CanvasRenderingContext2D): void {
  const birds: [number, number, number][] = [[760, 70, 7], [850, 110, 5], [690, 140, 4], [930, 60, 4]];
  g.fillStyle = '#2b2630';
  for (const [x, y, s] of birds) {
    for (let k = -s; k <= s; k++) {
      const lift = Math.round(Math.abs(k) * 0.55);
      g.fillRect(x + k * 2, y - lift * 2 + (Math.abs(k) < 2 ? 2 : 0), 2, 2);
    }
  }
}

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, "The Queen's Eyrie", 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const tx = Math.floor(hero[0] + (a + b) / 2);
      const ty = Math.floor(hero[1] + (b - a) / 2);
      if (tx >= 0 && ty >= 0 && tx < FLOOR.w && ty < FLOOR.h && FLOOR.tiles[ty * FLOOR.w + tx] === T_FLOOR) {
        g.fillStyle = '#5b55c7';
        g.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  g.fillStyle = '#28dcf0';
  g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
}

function show(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
paintPanel(g);

if (HASH === 'city') {
  // the town at four times, from the panel just painted
  const src = g.getImageData(256, 112, 253, 117);
  const tmp = document.createElement('canvas');
  tmp.width = 253;
  tmp.height = 117;
  (tmp.getContext('2d') as CanvasRenderingContext2D).putImageData(src, 0, 0);
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.drawImage(tmp, 0, 0, 253, 117, 0, 0, 1012, 468);
  show(cvs);
} else {
  flock(g);
  const stands: Stand[] = [];
  const onTopAt = (px: number, py: number, sp: Sprite, shadow?: number): void => {
    const [x, y] = at(px, py);
    if (!T.ground(x, y)) console.warn('off the top:', px, py);
    stands.push({ x, y, sp, shadow });
  };
  const piece = (px: number, py: number, name: string, frame = 0): void => onTopAt(px, py, pc(name, frame), shadowOf(name));
  // floor tiles first: the edge crumbling where she stands, cracks across the top
  const tileAt = (px: number, py: number, name: string, frame: number): void => {
    const [x, y] = at(px, py);
    const [sx, sy] = pictureOf(Math.floor(x), Math.floor(y));
    drawAt(g, pc(name, frame), sx - VX, sy - VY);
  };
  tileAt(560, 270, 'the crumbling ledge', 1);
  tileAt(470, 330, 'cracks across the trail', 1);
  // her eyrie: her nest and the great egg at the far edge, the flock's leavings about the top, the cult's perch
  piece(560, 266, "a vulture's nest");
  piece(546, 272, 'the great egg');
  piece(420, 300, 'bones and feathers', 0);
  piece(760, 312, 'bones and feathers', 1);
  piece(330, 330, 'a dead vulture');
  piece(820, 296, "the cult's perch");
  piece(880, 306, "the cult's feather standard");
  piece(240, 316, 'a perching rock');
  // the Queen, standing on her eyrie at the far edge; the knight coming up onto the top from below
  // (or, `#move:seconds`, her at that moment of a move, as this screen would show it: `#dive:0.66`, her dive's hang)
  const [mv, sec] = HASH.split(':');
  onTopAt(660, 276, mv && mv !== 'shot' && sec !== undefined ? queenFrame(mv, Number(sec), 'front') : queenStanding(0, 'front'), 1.6);
  const hero = at(430, 372);
  onTopAt(430, 372, spriteOf3(MOVES3.rear, 0, 'front'), 0.5);
  drawStands(g, stands);
  nameAndMap(g, hero);
  show(cvs);
}
