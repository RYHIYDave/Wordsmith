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
import { SKY_WRAP, cloudBelow, ledgeLook, paintSky } from '../art/ledge';
import { paintTown } from '../art/ledge_town';
import { pinewoodLook } from '../art/pinewood';
import { QUARRY_LOOK } from '../art/quarry';
import { GRAIN, paintTerrain, terrainOf } from '../art/terrain';
import type { Terrain, TerrainLook } from '../art/terrain';
// ACT 2, THE HUSH: the art chat's five grounds (each its own look, painted by the same painter)
import { GW_DEEP, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import type { GateWardLand } from '../art/gateward';
import { UC_DEEP, undercityLook } from '../art/undercity';
import { millraceLook } from '../art/millrace';
import { HQ_DEEP, houseOfQuietLook } from '../art/housequiet';
import { LB_DEEP, greatLibraryLook } from '../art/library';
import { blobDist, laneDist, segDist } from '../game/act1_layout';
import type { Land } from '../game/act1_layout';
import type { Floor } from '../game/types';
import type { Cam } from './fx';
import type { Painter } from './painter';

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

/** ACT 2: a tile's zone (Land.zones), 0 where not said or off the floor. */
function zoneOf(land: Land, W: number, H: number): (tx: number, ty: number) => number {
  const z = land.zones;
  return (tx, ty) => {
    if (!z) return 0;
    const x = Math.floor(tx);
    const y = Math.floor(ty);
    return x >= 0 && y >= 0 && x < W && y < H ? z[y * W + x] : 0;
  };
}
/** ACT 2, THE GATE WARD: the land as its look asks it (and its houses' shells: render/act2_houses.ts, made from the very same). */
export function gateWardLand(land: Land, floor: Floor): GateWardLand {
  return { floor, zone: zoneOf(land, floor.w, floor.h), squares: land.squares, houses: land.houses };
}
/** ACT 2, THE MILLRACE: which way a line runs at the point of it nearest (x, y), from its first point toward its last (a unit vector, world). */
function flowOf(pts: readonly [number, number][]): (x: number, y: number) => [number, number] {
  return (x, y) => {
    let best = Infinity;
    let dir: [number, number] = [1, 0];
    for (let i = 0; i + 1 < pts.length; i++) {
      const d = segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      if (d < best) {
        best = d;
        const dx = pts[i + 1][0] - pts[i][0];
        const dy = pts[i + 1][1] - pts[i][1];
        const l = Math.hypot(dx, dy) || 1;
        dir = [dx / l, dy / l];
      }
    }
    return dir;
  };
}

/**
 * The ground's terrain for a floor: its look over its tiles. (ACT 2, THE GATE WARD: the painter is given the floor with its
 * houses as they are seen inside, their fronts cut down: art/gateward.ts gateWardPaintFloor, 'open'; the shells laid over
 * them, faded as he goes in, are render's.)
 */
export function landTerrain(land: Land, floor: Floor): Terrain {
  if (land.kind === 'gateward') {
    const gl = gateWardLand(land, floor);
    return terrainOf(gateWardPaintFloor(gl, 'open'), gateWardLook(gl, 'open'));
  }
  return terrainOf(floor, landLook(land, floor));
}

export function landLook(land: Land, floor: Floor): TerrainLook {
  const W = floor.w;
  const H = floor.h;
  switch (land.kind) {
    // ACT 2, THE HUSH (game/act1.ts ACT2): the art chat's looks, each given what its floor's map-maker laid (game/act2_types.ts)
    case 'gateward':
      return gateWardLook(gateWardLand(land, floor), 'open');
    case 'undercity': {
      const water = land.water;
      return undercityLook({
        floor,
        zone: zoneOf(land, W, H),
        water: (tx, ty) => {
          const x = Math.floor(tx);
          const y = Math.floor(ty);
          return !!water && x >= 0 && y >= 0 && x < W && y < H && water[y * W + x] === 1;
        },
      });
    }
    case 'millrace': {
      const river = land.river;
      const race = land.race;
      const tracks = land.tracks ?? [];
      const yards = land.yards ?? [];
      return millraceLook({
        river: river ? gridField(W, H, 4, (x, y) => laneDist({ pts: river, w: 0 }, x, y)) : undefined,
        race: race ? gridField(W, H, 4, (x, y) => laneDist({ pts: race, w: 0 }, x, y)) : undefined,
        raceFlow: race ? flowOf(race) : undefined,
        track: tracks.length ? gridField(W, H, 4, (x, y) => tracks.reduce((d, t) => Math.min(d, laneDist({ pts: t, w: 0 }, x, y)), Infinity)) : undefined,
        yard: yards.length ? (x, y) => yards.some(([x0, y0, x1, y1]) => x >= x0 && y >= y0 && x < x1 && y < y1) : undefined,
      });
    }
    case 'housequiet':
      return houseOfQuietLook({ floor, zone: zoneOf(land, W, H) });
    case 'library':
      return greatLibraryLook({ floor, zone: zoneOf(land, W, H) });
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
  /** Its picture: painted here, or by the ground's worker (render/painter.ts). */
  cvs: HTMLCanvasElement | ImageBitmap;
  /** The frame it was last near the screen. */
  seen: number;
}

/**
 * (ACT 1: what the ground being drawn is, for what of the descent's own kinds must be drawn as the ground has it: the
 * Carrion Queen going over her eyrie's edge, the rock laid over what of her has gone below it, render/act1_fx/queen.ts.
 * The terrain of the floor drawn last; null when none.)
 */
export const SHOWN: { terrain: Terrain | null } = { terrain: null };

export class OutdoorGround {
  private land: Land | null = null;
  private T: Terrain | null = null;
  private pieces = new Map<number, Piece>();
  private frame = 0;
  private sky: HTMLCanvasElement | null = null;
  private skyDone = 0;
  /** THE LEDGE ROAD: the town far below under the cult's dome (art/ledge_town.ts), in the sky's land once, not round and round as the sky is: its picture, where its left edge is in the sky (picture pixels, not wrapped), and its top. */
  private town: { cvs: HTMLCanvasElement; x: number; y: number } | null = null;
  /** Where the camera was last frame. */
  private camWas: { ox: number; oy: number } | null = null;
  /** For the tests and measuring: pieces painted, and the time it took. */
  readonly stats = { pieces: 0, ms: 0, worker: 0 };
  /** The floor's deep colour, for what is not painted yet. */
  private deep = '#16101f';
  /**
   * THE GROUND'S WORKER (render/painter.ts): where there is a painter, a piece not painted yet is asked of it and
   * painted beside the game, and the game goes on without waiting (a piece is ten to thirty thousandths of a second
   * here, a frame's whole time and more). Only the floor's first frame (or a jump of the camera) paints the screen
   * here, at once. `painterOf` is the renderer's; `gid` the floor's number with the worker (0: no worker: the game
   * paints the ground itself, a little each frame, as before); `asked` the pieces asked of it and not yet come.
   */
  painterOf: (() => Painter | null) | null = null;
  private gid = 0;
  private asked = new Set<number>();
  /** The floor being drawn (for the ground's worker). */
  private floor: Floor | null = null;
  /** Let go of a piece's picture, whoever painted it. */
  private drop(p: Piece): void {
    if ('close' in p.cvs) p.cvs.close();
    else p.cvs.width = 0;
  }
  /** The painter, if it is there and on. */
  private worker(): Painter | null {
    const p = this.painterOf ? this.painterOf() : null;
    return p && p.state === 'on' ? p : null;
  }
  /** The ground's terrain (for what is laid on it: render/act1_tops.ts). */
  terrain(): Terrain | null {
    return this.T;
  }

  /** This frame's floor: worked out anew when it is another floor than last time's. Returns true on a new one. */
  begin(land: Land, floor: Floor): boolean {
    if (land === this.land) return false;
    this.land = land;
    this.T = landTerrain(land, floor);
    SHOWN.terrain = this.T;
    for (const p of this.pieces.values()) this.drop(p);
    this.pieces.clear();
    this.asked.clear();
    this.floor = floor;
    this.startWorker();
    this.sky = null;
    this.skyDone = 0;
    this.town = null;
    const hex = (c: readonly number[]): string => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
    // (ACT 2: each ground's own deep colour, the art chat's)
    this.deep = land.kind === 'gateward' ? hex(GW_DEEP) : land.kind === 'undercity' ? hex(UC_DEEP) : land.kind === 'housequiet' ? hex(HQ_DEEP) : land.kind === 'library' ? hex(LB_DEEP) : land.kind === 'millrace' ? '#2c2a1c' : land.kind === 'pine' ? '#1d2716' : land.kind === 'fen' ? '#141c17' : land.kind === 'canyon' ? '#5e3a2c' : land.kind === 'ledge' ? '#5a6a90' : '#5f7c48';
    return true;
  }

  /** (the ground's worker is sent the floor, and from here on paints its pieces; asked again if the painter was started anew meanwhile) */
  private startWorker(): void {
    this.asked.clear();
    const w = this.worker();
    const floor = this.floor;
    const land = this.land;
    this.gid = w && floor && land ? w.groundBegin(floor, land) : 0;
    if (w && this.gid) {
      w.toGround = (id, i, j, bmp, ms) => {
        const key = this.key(i, j);
        this.asked.delete(key);
        if (id !== this.gid || this.pieces.has(key)) {
          bmp.close();
          return;
        }
        this.stats.pieces++;
        this.stats.ms += ms;
        this.stats.worker++;
        this.pieces.set(key, { cvs: bmp, seen: this.frame });
      };
    }
  }

  /** Let go of everything (the floor has been left). */
  clear(): void {
    for (const p of this.pieces.values()) this.drop(p);
    this.pieces.clear();
    this.asked.clear();
    this.gid = 0;
    this.floor = null;
    this.land = null;
    this.T = null;
    this.sky = null;
    this.town = null;
    SHOWN.terrain = null;
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

  /** A piece asked of the ground's worker (once, until it comes). */
  private ask(w: Painter, i: number, j: number, pri: number): void {
    const key = this.key(i, j);
    if (this.asked.has(key)) return;
    if (w.groundPiece(this.gid, i, j, pri)) {
      this.asked.add(key);
      return;
    }
    // (the painter was started anew since (a new place: render/painter.ts restart): the floor is sent again; failing
    // that, the game paints the ground itself from here on)
    this.startWorker();
    if (this.gid && w.groundPiece(this.gid, i, j, pri)) this.asked.add(key);
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
    // (with the ground's worker: what the screen wants and has not got is asked of it, and drawn in the deep colour meanwhile)
    const up = this.gid ? this.worker() : null;
    if (this.gid && !up) this.gid = 0;
    // (until the worker is up, the game paints as before)
    const w = up && up.groundReady() ? up : null;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        let p = this.pieces.get(this.key(i, j));
        if (!p && (first || (!w && performance.now() - t0 < BUDGET * 3))) p = this.paint(i, j);
        else if (!p && w) this.ask(w, i, j, 0);
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
    if (w) for (const [i, j, d] of want) this.ask(w, i, j, 1 + Math.round(d));
    else {
      for (const [i, j] of want) {
        if (performance.now() - t0 > BUDGET) break;
        this.paint(i, j);
      }
    }
    // KEEP only what is near: the rest is let go of
    if (this.frame % 30 === 0) {
      const [k0, l0, k1, l1] = this.span(cam, W, H, KEEP);
      for (const [key, p] of this.pieces) {
        const i = Math.floor(key / 8192) - 4096;
        const j = (key % 8192) - 4096;
        if (i < k0 || i > k1 || j < l0 || j > l1) {
          this.drop(p);
          this.pieces.delete(key);
        }
      }
    }
  }

  /**
   * THE TOWN FAR BELOW (art/ledge_town.ts, the eyrie mock-up's, with his yes): painted once for the floor into the
   * land of the sky, where it shows past the Queen's eyrie: with the camera on the eyrie, it lies out over the
   * drop on the eyrie's open side, as far below the horizon as the mock-up has it. Only what of it differs from the
   * sky behind is kept (the haze it is mixed with is the sky's own), so it lies over the sky's picture.
   */
  private paintTownLayer(W: number): { cvs: HTMLCanvasElement; x: number; y: number } | null {
    const land = this.land;
    if (!land || !land.drop) return null;
    const area = land.areas.find((a) => a.role === 'boss');
    if (!area) return null;
    const bx = area.blob.x;
    const by = area.blob.y;
    // (the eyrie's edge nearest its middle, and which way the drop lies past it on the screen: the camera on that
    // edge, as the hero stands looking out from it, the town lies a little way out over the drop)
    const fw = this.T?.floor.w ?? 0;
    const fh = this.T?.floor.h ?? 0;
    let ex = bx;
    let ey = by;
    let best = Infinity;
    for (let ty = Math.floor(by - 14); ty <= by + 14; ty++) {
      for (let tx = Math.floor(bx - 14); tx <= bx + 14; tx++) {
        if (tx < 0 || ty < 0 || tx >= fw || ty >= fh || land.drop[ty * fw + tx] !== 1) continue;
        const d = Math.hypot(tx + 0.5 - bx, ty + 0.5 - by);
        if (d < best) {
          best = d;
          ex = tx + 0.5;
          ey = ty + 0.5;
        }
      }
    }
    const side = Math.sign(ex - ey - (bx - by)) || 1;
    const off = side * Math.min(W * GRAIN * 0.22, 420);
    const camOx = W / 2 - (ex - ey) * 16;
    const unwrapped = (-camOx * GRAIN) / 2;
    // (the picture: 600 by 280 of the sky's land; the town's middle at game pixel (190, 100) of it, the swamp off to its left as the mock-up has it)
    const PW = 600;
    const PH = 280;
    const TOWN: [number, number] = [190, 100];
    const SWAMP: [number, number] = [68, 92];
    const x0 = Math.round(unwrapped + W * GRAIN * 0.5 + off - TOWN[0] * 2);
    // (as far below the horizon as in the mock-up: its middle 100 picture pixels down)
    const y0 = 100 - TOWN[1] * 2;
    const sky = paintSky(x0, y0, PW, PH);
    const buf = sky.slice();
    paintTown(buf, PW, PH, (px, py) => cloudBelow(x0 + px, y0 + py), TOWN, SWAMP);
    const out = new Uint8ClampedArray(PW * PH * 4);
    for (let i = 0; i < PW * PH * 4; i += 4) {
      if (buf[i] === sky[i] && buf[i + 1] === sky[i + 1] && buf[i + 2] === sky[i + 2]) continue;
      out[i] = buf[i];
      out[i + 1] = buf[i + 1];
      out[i + 2] = buf[i + 2];
      out[i + 3] = 255;
    }
    const cvs = document.createElement('canvas');
    cvs.width = PW;
    cvs.height = PH;
    (cvs.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(out, PW, PH), 0, 0);
    return { cvs, x: x0, y: y0 };
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
    // THE LEDGE ROAD: the town far below under the cult's dome, where it shows past the eyrie's edge
    if (this.land?.kind === 'ledge') {
      if (!this.town) this.town = this.paintTownLayer(W);
      if (this.town) {
        const unwrapped = (-cam.ox * GRAIN) / 2;
        g.drawImage(this.town.cvs, (this.town.x - unwrapped) / GRAIN, top + (this.town.y + HORIZON) / GRAIN, this.town.cvs.width / GRAIN, this.town.cvs.height / GRAIN);
      }
    }
    // (below the sky's picture, its haze goes on)
    if (top + SKY_H / GRAIN < H) {
      g.fillStyle = '#8a98b4';
      g.fillRect(0, top + SKY_H / GRAIN, W, H - top - SKY_H / GRAIN);
    }
  }
}
