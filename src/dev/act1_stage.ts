// Dev helper: ONE PHONE SCREEN OF AN ACT 1 LEVEL, for the art chat's pictures (nothing of the game imports
// it). A level's tiles laid by hand from shapes drawn on the screen (as the planning chat's mock-ups were,
// src/dev/preview_act1.ts), its ground painted by the game-ready painter (art/terrain.ts), its pieces and
// figures stood on it in the game's order, the tops dressed by the planning chat's rule (nothing stands
// over the floor), a tall piece seen through at the game's SEEN_THROUGH (0.38) while a figure is behind it.

import { P } from '../art/palette';
import { HHP, HWP, clearOfFloor, fbm, paintTerrain, pictureOf, terrainOf, worldOf } from '../art/terrain';
import type { Terrain, TerrainLook } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

/** The screen: the game's 507 x 234 game pixels on a phone held sideways, at 2 picture pixels each. */
export const PW = 1014;
export const PH = 468;
/** Tiles the mock-ups' world is moved so that the tiles start at 0. */
const D = 10;
const OX = PW / 2;
const OY = PH / 2 - 24 * HHP;

export type Shape = (x: number, y: number) => boolean;
/** The world place under a pixel of the screen, as the mock-ups lay their shapes (world (12, 12) at the screen's middle), moved D tiles. */
export const at = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWP;
  const b = (py - OY) / HHP;
  return [(a + b) / 2 + D, (b - a) / 2 + D];
};
export const ellipse = (cx: number, cy: number, rx: number, ry: number, rot = 0): Shape => {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return (x, y) => {
    const u = ((x - cx) * c + (y - cy) * s) / rx;
    const v = (-(x - cx) * s + (y - cy) * c) / ry;
    return u * u + v * v < 1;
  };
};
export const area = (px: number, py: number, rx: number, ry: number, rot = 0): Shape => {
  const [x, y] = at(px, py);
  return ellipse(x, y, rx, ry, rot);
};
const segDist = (x: number, y: number, ax: number, ay: number, bx: number, by: number): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
export const path = (pts: number[][], w: number): Shape => {
  const P2 = pts.map(([px, py]) => at(px, py));
  return (x, y) => {
    let d = Infinity;
    for (let i = 0; i + 1 < P2.length; i++) d = Math.min(d, segDist(x, y, P2[i][0], P2[i][1], P2[i + 1][0], P2[i + 1][1]));
    return d < w / 2;
  };
};
export const union = (...s: Shape[]): Shape => (x, y) => s.some((f) => f(x, y));
export const rect = (x0: number, y0: number, x1: number, y1: number): Shape => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;

/** Lay the tiles of a shape: each whole, one of the four halves, or rock, whichever is least wrong; `whole` tiles always whole. */
export function layTiles(shape: Shape, w: number, h: number, whole: Shape = () => false): Floor {
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
      if (whole(tx + 0.5, ty + 0.5)) {
        tiles[ty * w + tx] = T_FLOOR;
        continue;
      }
      let best = 0;
      let least = Infinity;
      options.forEach(([, inside], k) => {
        let wrong = 0;
        for (let a = 0; a < N; a++) {
          for (let b = 0; b < N; b++) {
            const u = (a + 0.5) / N;
            const v = (b + 0.5) / N;
            if (inside(u, v) !== shape(tx + u, ty + v)) wrong++;
          }
        }
        if (wrong < least - 0.5) {
          least = wrong;
          best = k;
        }
      });
      const c = options[best][0];
      if (c >= 0) {
        tiles[ty * w + tx] = T_FLOOR;
        cut[ty * w + tx] = c;
      }
    }
  }
  return { depth: 6, seed: 6, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

/** A thing stood in the scene: a piece or a figure, at a world place. */
export interface Stand {
  x: number;
  y: number;
  sp: Sprite;
  /** Drawn this many picture pixels up (it stands on a top). */
  lift?: number;
  figure?: boolean;
  /** Seen through while a figure is behind it. */
  tall?: boolean;
  /** Its soft shadow's reach, in tiles. */
  shadow?: number;
}

/** A sprite with its anchor at picture pixel (sx, sy), at the screen's grain. */
export function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number, alpha = 1): void {
  g.globalAlpha = alpha;
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
  g.globalAlpha = 1;
}

export class Stage {
  readonly T: Terrain;
  /** Where the screen lies in the world's picture. */
  readonly VX = -OX;
  readonly VY = -OY + 2 * D * HHP;
  readonly stands: Stand[] = [];
  readonly cvs: HTMLCanvasElement;
  readonly g: CanvasRenderingContext2D;
  constructor(readonly floor: Floor, readonly look: TerrainLook) {
    this.T = terrainOf(floor, look);
    this.cvs = document.createElement('canvas');
    this.cvs.width = PW;
    this.cvs.height = PH;
    this.cvs.style.display = 'block';
    this.g = this.cvs.getContext('2d') as CanvasRenderingContext2D;
    this.g.imageSmoothingEnabled = false;
  }
  /** Where a world place is on the screen. */
  screen(x: number, y: number): [number, number] {
    const [sx, sy] = pictureOf(x, y);
    return [sx - this.VX, sy - this.VY];
  }
  /** Is this tile whole floor? */
  whole(tx: number, ty: number): boolean {
    const f = this.floor;
    return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR && !(f.cut && f.cut[ty * f.w + tx]);
  }
  /** The ground, in pieces of 256. */
  ground(): void {
    for (let py = 0; py < PH; py += 256) {
      for (let px = 0; px < PW; px += 256) {
        const pw = Math.min(256, PW - px);
        const ph = Math.min(256, PH - py);
        const p = paintTerrain(this.T, this.VX + px, this.VY + py, pw, ph);
        this.g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
      }
    }
  }
  /** A floor tile's picture laid on tile (tx, ty). */
  tile(sp: Sprite, tx: number, ty: number): void {
    const [sx, sy] = this.screen(tx, ty);
    drawAt(this.g, sp, sx, sy);
  }
  /** Stand a thing at a world place. */
  put(s: Stand): void {
    this.stands.push(s);
  }
  /**
   * DRESS THE TOPS by the planning chat's rule: on a grid over the screen, each spot one of `choose`'s
   * picks for it, kept only where it stands clear of the floor (and not where `keepOut` says).
   */
  dressTops(choose: (roll: number, grove: number, k: number) => { sp: Sprite; hw: number; h: number } | null, keepOut: Shape = () => false): void {
    const RISE = this.look.rise;
    for (let gy = 4; gy < PH + 30; gy += 18) {
      for (let gx = 4; gx < PW; gx += 24) {
        const px = Math.round(gx + (hashOf(gx, gy, 1) - 0.5) * 18);
        const py = Math.round(gy + (hashOf(gx, gy, 2) - 0.5) * 12);
        const [wx, wy] = worldOf(this.VX + px, this.VY + py + RISE);
        if (keepOut(wx, wy)) continue;
        const pick = choose(hashOf(gx, gy, 3), fbm(wx * 0.35, wy * 0.35, 814), hashOf(gx, gy, 4));
        if (!pick || !clearOfFloor(this.T, this.VX + px, this.VY + py, pick.hw, pick.h)) continue;
        this.stands.push({ x: wx, y: wy, sp: pick.sp, lift: RISE });
      }
    }
  }
  /** Everything stood, in the game's order, each with its soft shadow; the tall ones seen through while a figure is behind them. */
  standAll(): void {
    const g = this.g;
    const stands = [...this.stands].sort((a, b) => a.x + a.y - (b.x + b.y));
    const figures = stands.filter((s) => s.figure);
    for (const s of stands) {
      const [sx, sy0] = this.screen(s.x, s.y);
      const sy = sy0 - (s.lift ?? 0);
      if (s.shadow) {
        g.fillStyle = 'rgba(25, 18, 40, 0.32)';
        g.beginPath();
        g.ellipse(sx, sy, s.shadow * HWP * 1.1, s.shadow * HHP * 1.1, 0, 0, Math.PI * 2);
        g.fill();
      }
      let alpha = 1;
      if (s.tall) {
        for (const f of figures) {
          if (f.x + f.y >= s.x + s.y) continue;
          const [ox, oy] = this.screen(f.x, f.y);
          if (ox > sx - s.sp.ax * 2 && ox < sx - s.sp.ax * 2 + s.sp.w * 2 && oy < sy && oy > sy - s.sp.ay * 2) alpha = 0.38;
        }
      }
      drawAt(g, s.sp, sx, sy, alpha);
    }
  }
  /** The lights the pieces give, added over the picture (as the game adds them after the dark). */
  lights(): void {
    const g = this.g;
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const s of this.stands) {
      for (const L of s.sp.lights ?? []) {
        const [sx, sy0] = this.screen(s.x, s.y);
        const sy = sy0 - (s.lift ?? 0);
        const x = sx + (L.x - s.sp.ax) * 2;
        const y = sy + (L.y - s.sp.ay) * 2;
        const r = L.r * 2;
        const gr = g.createRadialGradient(x, y, 1, x, y, r);
        gr.addColorStop(0, hexA(L.color, (L.a ?? 0.5) * 0.55));
        gr.addColorStop(1, hexA(L.color, 0));
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
    }
    g.restore();
  }
  /** The place's name, and the map in its corner, as the game shows them. */
  nameAndMap(name: string, hero: [number, number]): void {
    const g = this.g;
    g.save();
    g.scale(2, 2);
    drawText(g, name, 4, 3, THEME.text, { shadow: P.ink });
    g.restore();
    const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
    g.fillStyle = '#100e22';
    g.fillRect(mx, my, mw, mh);
    const k = 0.11;
    const f = this.floor;
    for (let yy = 0; yy < mh; yy += 2) {
      for (let xx = 0; xx < mw; xx += 2) {
        const a = (xx - mw / 2) / (HWP * k);
        const b = (yy - mh / 2) / (HHP * k);
        const tx = Math.floor(hero[0] + (a + b) / 2);
        const ty = Math.floor(hero[1] + (b - a) / 2);
        if (tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR) {
          g.fillStyle = '#5b55c7';
          g.fillRect(mx + xx, my + yy, 2, 2);
        }
      }
    }
    g.fillStyle = '#28dcf0';
    g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
  }
  show(): void {
    document.body.style.margin = '0';
    document.body.style.background = '#0d1030';
    document.body.appendChild(this.cvs);
    (window as unknown as { __ready: boolean }).__ready = true;
  }
}

function hexA(c: string, a: number): string {
  const n = parseInt(c.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
