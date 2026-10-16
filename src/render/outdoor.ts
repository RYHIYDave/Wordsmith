// ACT 1, THE DESCENT, DRAWN: THE OUTDOOR GROUND. A floor of the descent has no floor tiles and walls to draw:
// its ground is painted from its own tiles by the art chat's painter (art/terrain.ts), each floor in its own
// look (art/quarry.ts, ledge.ts, canyon.ts, pinewood.ts, fen.ts), and laid under every figure and every piece as
// one layer (nothing it paints stands over the walkable floor: the art's own rule, tested). His rules it keeps:
// near cliffs cut away, the near cliff's face in shadow where its ridge slants back past straight down, light
// from the upper left (the project's claude/act1_descent.md).
//
// HOW: the world's picture is cut into PIECES of PIECE picture pixels square (two to a game pixel), painted the
// first time they are near the screen and kept while they stay near it. Painting is dear (a piece is about 10 to
// 30 thousandths of a second here, a phone slower), so a frame paints only what time it has (BUDGET), nearest
// the screen first, and the pieces round the screen are painted ahead; the first frame of a floor paints what
// the screen shows, at once. What is not painted yet is drawn as the floor's own deep colour.
//
// THE SKY (the Ledge Road's, art/ledge.ts paintSky): a picture of its own that comes round every SKY_WRAP across,
// laid behind the ground where the drop shows nothing, its horizon fixed on the screen, sliding across at half
// the ground's speed (the art chat's note: "lay the sky behind the ground and slide it slower").

import { CANYON_LOOK } from '../art/canyon';
import { fenLook } from '../art/fen';
import { SKY_WRAP, ledgeLook, paintSky } from '../art/ledge';
import { pinewoodLook } from '../art/pinewood';
import { QUARRY_LOOK } from '../art/quarry';
import { GRAIN, paintTerrain, terrainOf } from '../art/terrain';
import type { Terrain, TerrainLook } from '../art/terrain';
import { blobDist, laneDist, segDist } from '../game/act1_layout';
import type { Land } from '../game/act1_layout';
import type { Floor } from '../game/types';
import type { Cam } from './fx';

/** A piece's side, in picture pixels. */
export const PIECE = 128;
/** Thousandths of a second a frame may spend painting the ground ahead. */
const BUDGET = 5;
/** How many pieces past the screen's edge are painted ahead, and kept. */
const AHEAD = 2;
const KEEP = 5;
/** The sky's height, in picture pixels, and where its horizon sits down the screen (picture pixels: the art chat's page had it at 232). */
const SKY_H = 468;
const HORIZON = 232;

// ---------------------------------------------------------------------------------------------------
// THE LOOK OF A FLOOR OF THE DESCENT, from what only it knows

/** A field of the world held as a grid (`k` cells to a tile), cheap to ask of at every pixel (the art chat's note: "GIVE THEM CHEAP"). */
function gridField(w: number, h: number, k: number, fn: (x: number, y: number) => number): (x: number, y: number) => number {
  const W = w * k;
  const H = h * k;
  const v = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) v[j * W + i] = fn((i + 0.5) / k, (j + 0.5) / k);
  return (x, y) => {
    const gx = x * k - 0.5;
    const gy = y * k - 0.5;
    const i = Math.max(0, Math.min(W - 2, Math.floor(gx)));
    const j = Math.max(0, Math.min(H - 2, Math.floor(gy)));
    const u = Math.max(0, Math.min(1, gx - i));
    const t = Math.max(0, Math.min(1, gy - j));
    const a = v[j * W + i];
    const b = v[j * W + i + 1];
    const c = v[(j + 1) * W + i];
    const d = v[(j + 1) * W + i + 1];
    return a + (b - a) * u + (c - a) * t + (a - b - c + d) * u * t;
  };
}

/** How far along the main way (0 at the start, 1 at the boss) the nearest point of it to world (x, y) is. */
function progressOf(way: readonly [number, number][]): (x: number, y: number) => number {
  const lens: number[] = [0];
  for (let i = 1; i < way.length; i++) lens.push(lens[i - 1] + Math.hypot(way[i][0] - way[i - 1][0], way[i][1] - way[i - 1][1]));
  const total = lens[lens.length - 1] || 1;
  return (x, y) => {
    let best = Infinity;
    let at = 0;
    for (let i = 0; i + 1 < way.length; i++) {
      const [ax, ay] = way[i];
      const [bx, by] = way[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
      const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
      if (d < best) {
        best = d;
        at = (lens[i] + t * (lens[i + 1] - lens[i])) / total;
      }
    }
    return at;
  };
}

export function landLook(land: Land, floor: Floor): TerrainLook {
  const W = floor.w;
  const H = floor.h;
  switch (land.kind) {
    case 'quarry':
      return QUARRY_LOOK;
    case 'canyon':
      return CANYON_LOOK;
    case 'ledge': {
      const drop = land.drop;
      return ledgeLook((tx, ty) => {
        if (!drop) return false;
        const x = Math.max(0, Math.min(W - 1, tx));
        const y = Math.max(0, Math.min(H - 1, ty));
        return drop[y * W + x] === 1;
      });
    }
    case 'pine': {
      const river = land.river;
      const riverD = river ? gridField(W, H, 4, (x, y) => laneDist({ pts: river, w: 0 }, x, y)) : undefined;
      const trails = land.trails ?? [];
      const trailD = gridField(W, H, 4, (x, y) => {
        let d = Infinity;
        for (const t of trails) d = Math.min(d, laneDist({ pts: t, w: 0 }, x, y));
        for (const l of land.lanes) d = Math.min(d, laneDist(l, x, y));
        return d;
      });
      const prog = progressOf(land.way);
      const from = land.sickFrom ?? 0.62;
      const sick = gridField(W, H, 2, (x, y) => Math.max(0, Math.min(1, (prog(x, y) - from) / (1 - from))));
      return pinewoodLook({ river: riverD, trail: trailD, sick });
    }
    case 'fen': {
      const boards = new Uint8Array(W * H);
      for (const i of land.boards ?? []) boards[i] = 1;
      const ring = land.ring;
      const pool = land.pool;
      const ell = (e: { x: number; y: number; rx: number; ry: number }) => (x: number, y: number): number => {
        const u = (x - e.x - (y - e.y)) / Math.SQRT2;
        const v = (x - e.x + (y - e.y)) / Math.SQRT2;
        return Math.hypot(u / e.rx, v / e.ry);
      };
      const ringD = ring ? ell(ring) : null;
      const prog = progressOf(land.way);
      return fenLook({
        boards: (x, y) => {
          const tx = Math.floor(x);
          const ty = Math.floor(y);
          return tx >= 0 && ty >= 0 && tx < W && ty < H && boards[ty * W + tx] === 1;
        },
        paved: ringD ? (x, y) => ringD(x, y) < 1 : undefined,
        pool: pool ? ell(pool) : undefined,
        sick: (x, y) => 0.3 + 0.6 * prog(x, y),
      });
    }
  }
}

// keep the imports the shapes need, for the fields above
void blobDist;
void segDist;

// ---------------------------------------------------------------------------------------------------
// THE GROUND, IN PIECES

interface Piece {
  cvs: HTMLCanvasElement;
  /** The frame it was last near the screen. */
  seen: number;
}

export class OutdoorGround {
  private land: Land | null = null;
  private T: Terrain | null = null;
  private pieces = new Map<number, Piece>();
  private frame = 0;
  private sky: HTMLCanvasElement | null = null;
  private skyDone = 0;
  /** Where the camera was last frame. */
  private camWas: { ox: number; oy: number } | null = null;
  /** For the tests and measuring: pieces painted, and the time it took. */
  readonly stats = { pieces: 0, ms: 0 };
  /** The floor's deep colour, for what is not painted yet. */
  private deep = '#16101f';
  /** The ground's terrain (for what is laid on it: render/act1_tops.ts). */
  terrain(): Terrain | null {
    return this.T;
  }

  /** This frame's floor: worked out anew when it is another floor than last time's. Returns true on a new one. */
  begin(land: Land, floor: Floor): boolean {
    if (land === this.land) return false;
    this.land = land;
    this.T = terrainOf(floor, landLook(land, floor));
    for (const p of this.pieces.values()) p.cvs.width = 0;
    this.pieces.clear();
    this.sky = null;
    this.skyDone = 0;
    this.deep = land.kind === 'pine' ? '#1d2716' : land.kind === 'fen' ? '#141c17' : land.kind === 'canyon' ? '#5e3a2c' : land.kind === 'ledge' ? '#5a6a90' : '#5f7c48';
    return true;
  }

  /** Let go of everything (the floor has been left). */
  clear(): void {
    for (const p of this.pieces.values()) p.cvs.width = 0;
    this.pieces.clear();
    this.land = null;
    this.T = null;
    this.sky = null;
  }

  private key(i: number, j: number): number {
    return (i + 4096) * 8192 + (j + 4096);
  }

  private paint(i: number, j: number): Piece {
    const T = this.T!;
    const t0 = performance.now();
    const p = paintTerrain(T, i * PIECE, j * PIECE, PIECE, PIECE);
    this.stats.pieces++;
    this.stats.ms += performance.now() - t0;
    const cvs = document.createElement('canvas');
    cvs.width = PIECE;
    cvs.height = PIECE;
    const c = cvs.getContext('2d') as CanvasRenderingContext2D;
    c.putImageData(new ImageData(p.rgba, PIECE, PIECE), 0, 0);
    const piece = { cvs, seen: this.frame };
    this.pieces.set(this.key(i, j), piece);
    return piece;
  }

  /** The pieces the screen shows (game pixels W by H, by the camera), and those `ring` pieces round it. */
  private span(cam: Cam, W: number, H: number, ring: number): [number, number, number, number] {
    const x0 = -cam.ox * GRAIN;
    const y0 = -cam.oy * GRAIN;
    return [Math.floor(x0 / PIECE) - ring, Math.floor(y0 / PIECE) - ring, Math.floor((x0 + W * GRAIN) / PIECE) + ring, Math.floor((y0 + H * GRAIN) / PIECE) + ring];
  }

  /**
   * DRAW THE GROUND under everything (and the sky behind it): the screen's pieces, painted at once where
   * they are not yet (`now`: the floor's first frame) or else left as the floor's deep colour this frame;
   * then, with the time left, the pieces round the screen.
   */
  draw(g: CanvasRenderingContext2D, cam: Cam, W: number, H: number, fresh: boolean): void {
    if (!this.T || !this.land) return;
    this.frame++;
    // (the floor's first frame, or a jump of the camera half a screen or more, as by a waypoint: the screen painted at once)
    const was = this.camWas;
    const first = fresh || !was || Math.abs(cam.ox - was.ox) > W / 2 || Math.abs(cam.oy - was.oy) > H / 2;
    this.camWas = { ox: cam.ox, oy: cam.oy };
    const t0 = performance.now();
    // THE SKY, behind (the Ledge Road)
    if (this.land.sky) this.drawSky(g, cam, W, H, first);
    const [i0, j0, i1, j1] = this.span(cam, W, H, 0);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        let p = this.pieces.get(this.key(i, j));
        if (!p && (first || performance.now() - t0 < BUDGET * 3)) p = this.paint(i, j);
        const sx = cam.ox + (i * PIECE) / GRAIN;
        const sy = cam.oy + (j * PIECE) / GRAIN;
        if (p) {
          p.seen = this.frame;
          g.drawImage(p.cvs, sx, sy, PIECE / GRAIN, PIECE / GRAIN);
        } else if (!this.land.sky) {
          g.fillStyle = this.deep;
          g.fillRect(sx, sy, PIECE / GRAIN, PIECE / GRAIN);
        }
      }
    }
    // AHEAD: the pieces round the screen, nearest first, while there is time
    const [a0, b0, a1, b1] = this.span(cam, W, H, AHEAD);
    const ci = (i0 + i1) / 2;
    const cj = (j0 + j1) / 2;
    const want: [number, number, number][] = [];
    for (let j = b0; j <= b1; j++) for (let i = a0; i <= a1; i++) if (!this.pieces.has(this.key(i, j))) want.push([i, j, Math.hypot(i - ci, j - cj)]);
    want.sort((a, b) => a[2] - b[2]);
    for (const [i, j] of want) {
      if (performance.now() - t0 > BUDGET) break;
      this.paint(i, j);
    }
    // KEEP only what is near: the rest is let go of
    if (this.frame % 30 === 0) {
      const [k0, l0, k1, l1] = this.span(cam, W, H, KEEP);
      for (const [key, p] of this.pieces) {
        const i = Math.floor(key / 8192) - 4096;
        const j = (key % 8192) - 4096;
        if (i < k0 || i > k1 || j < l0 || j > l1) {
          p.cvs.width = 0;
          this.pieces.delete(key);
        }
      }
    }
  }

  /** The sky: painted once for the floor, a strip at a time; laid across the screen at half the ground's slide. */
  private drawSky(g: CanvasRenderingContext2D, cam: Cam, W: number, H: number, first: boolean): void {
    if (!this.sky) {
      this.sky = document.createElement('canvas');
      this.sky.width = SKY_WRAP;
      this.sky.height = SKY_H;
      this.skyDone = 0;
    }
    const c = this.sky.getContext('2d') as CanvasRenderingContext2D;
    const t0 = performance.now();
    const STRIP = 128;
    while (this.skyDone < SKY_WRAP && (first || performance.now() - t0 < BUDGET)) {
      const rgba = paintSky(this.skyDone, -HORIZON, STRIP, SKY_H);
      c.putImageData(new ImageData(rgba, STRIP, SKY_H), this.skyDone, 0);
      this.skyDone += STRIP;
    }
    g.fillStyle = '#7a90bc';
    g.fillRect(0, 0, W, H);
    // (the sky's picture is in picture pixels: half the ground's slide across, its horizon fixed)
    const slide = (((-cam.ox * GRAIN) / 2) % SKY_WRAP + SKY_WRAP) % SKY_WRAP;
    const top = Math.round(H / 2 - (HORIZON / GRAIN) * 1);
    for (let x = -slide; x < W * GRAIN; x += SKY_WRAP) g.drawImage(this.sky, 0, 0, SKY_WRAP, SKY_H, x / GRAIN, top, SKY_WRAP / GRAIN, SKY_H / GRAIN);
    // (below the sky's picture, its haze goes on)
    if (top + SKY_H / GRAIN < H) {
      g.fillStyle = '#8a98b4';
      g.fillRect(0, top + SKY_H / GRAIN, W, H - top - SKY_H / GRAIN);
    }
  }
}
