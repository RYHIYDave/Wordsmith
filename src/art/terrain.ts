// THE OUTDOOR GROUND OF ACT 1 (floors 6 to 10): a level's own tiles in, its ground out, painted his way.
//
// The owner, 12 Oct 2026, to the planning chat's mock-up of a cliff with today's tiles, quartered tiles
// and today's tiles with the edge painted round: 18:33, “Yeah I really like the rounded edges”; 18:34,
// “We’ll have to work on the sky but the rock and the curves look good”. So the game walks by today's
// tiles (32 by 16, with their halves) and THE EDGE IS PAINTED ROUND AND RAGGED OVER THEM.
//
// His rules for every outdoor level, each with his yes (the project's claude/act1_descent.md):
// - NEAR WALLS CUT AWAY as the game cuts them: nothing this paints stands over the walkable floor, so
//   the hero and every warning stay in sight. (So the whole of it can lie under every figure as one
//   layer.)
// - THE NEAR CLIFF'S FACE. 12 Oct, by 21:40: “When the ridge line runs back to the right any angle past
//   straight down, you would see the sheer face of the cliff in shadow.  So it’s not just a line on the
//   ridge, it’s cliff face running vertically”; his pick by 21:41: “Yes, that's it (Recommended)”,
//   offered as the rule for near cliffs on every level; and on 13 Oct, “Yes, keep the floor in sight
//   (Recommended)”, offered as: the face sits on the cliff's side of the edge. So no line at the floor's
//   edge, and where the cliff's ridge slants back past straight down, its face shows in shadow, rising
//   from the floor's edge on the cliff's side, never over the floor.
// - Light from the upper left (his art rulebook): faces looking to the lower left lit, to the lower
//   right in shade.
//
// HOW: the walkable tiles (a cut tile its floor half) are blurred into a smooth field, and the floor is
// where the field stands over a threshold that wanders with a slow noise: that is the round, ragged
// edge. Everything else is rock standing `rise` picture pixels over the floor, its top seen above, its
// faces seen where they look toward the eye. A picture pixel is painted by asking what the eye meets
// along it (as the planning chat's mock-up, src/dev/preview_act1.ts `paintLevel`, did for one screen),
// a column at a time so that each pixel costs the same whatever the rock's height.
//
// FOR THE MAIN CHAT: `paintTerrain` paints any piece of the world's picture (picture pixels, 2 to a game
// pixel, the world's origin at (0, 0)), and two pieces side by side meet without a seam, so the ground
// can be painted in pieces near the camera, in the painter's worker or not (it touches no canvas). The
// look of each level is a `TerrainLook` (art/quarry.ts the Quarry's).

import { cutAt, intoWall } from '../game/cut';
import type { Floor } from '../game/types';
import { T_FLOOR } from '../game/types';
import { hash } from './kit';

export type RGB = [number, number, number];

/** Picture pixels to a game pixel (his rulebook: two, for everything). */
export const GRAIN = 2;
/** Half a tile's diamond across and down, in picture pixels. */
export const HWP = 16 * GRAIN;
export const HHP = 8 * GRAIN;

/** What a picture pixel of the ground shows. */
export const TK = {
  /** The walkable floor. */
  Floor: 1,
  /** A far cliff's face, looking toward the eye. */
  Face: 2,
  /** The top of the rock. */
  Top: 3,
  /** The top of a near cliff cut away (it would have stood over the floor). */
  Cut: 4,
  /** A near cliff's face in shadow, rising from the floor's edge on the cliff's side (his rule). */
  Near: 5,
} as const;

/** Where a picture pixel's middle is in the world (tiles). */
export function worldOf(px: number, py: number): [number, number] {
  const a = (px + 0.5) / HWP;
  const b = (py + 0.5) / HHP;
  return [(a + b) / 2, (b - a) / 2];
}

/** Where a place in the world is in the picture (picture pixels, the world's origin at (0, 0)). */
export function pictureOf(x: number, y: number): [number, number] {
  return [(x - y) * HWP, (x + y) * HHP];
}

// ---------------------------------------------------------------------------------------------------
// Noise, steady from run to run

/** Smooth value noise in 0..1, one cell a unit. */
export function vnoise(x: number, y: number, k: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, k);
  const b = hash(xi + 1, yi, k);
  const c = hash(xi, yi + 1, k);
  const d = hash(xi + 1, yi + 1, k);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Three octaves of it, in 0..1. */
export function fbm(x: number, y: number, k: number): number {
  return 0.5 * vnoise(x, y, k) + 0.3 * vnoise(x * 2.1, y * 2.1, k + 1) + 0.2 * vnoise(x * 4.3, y * 4.3, k + 2);
}

// ---------------------------------------------------------------------------------------------------
// The look of a level

export interface TerrainLook {
  /** How tall the rock stands over the floor, in picture pixels. */
  rise: number;
  /** How tall a near cliff's face shows at most where it does (his rule), in picture pixels. */
  near: number;
  /** How far the walkable tiles are blurred to round their edge, in tiles. */
  round: number;
  /** How far the edge wanders: the slow noise and the fine one (in the field's own measure). */
  rag: number;
  fine: number;
  /** The level's own noise. */
  seed: number;
  /** The floor at world (x, y), picture pixel (px, py); `inside` 0 at its edge, 1 well in. */
  floor(x: number, y: number, px: number, py: number, inside: number): RGB;
  /** A far cliff's face, `v` picture pixels over its foot, turned to the light by `shade` (1 to the lower left, lit; -1 to the lower right, dark); (x, y) its foot. */
  face(shade: number, v: number, px: number, py: number, x: number, y: number): RGB;
  /** The top of the rock at world (x, y); `back` 0 at the cliff's edge, 1 well back from it. */
  top(x: number, y: number, px: number, py: number, back: number): RGB;
  /** A near cliff's face in shadow, `v` picture pixels over the floor's edge, (x, y) the edge. */
  nearFace(v: number, px: number, py: number, x: number, y: number): RGB;
  /** The light along a far face's top edge (its caprock catching the sun), as the top's own colour lifted. */
  brow(c: RGB, px: number, py: number): RGB;
  /** The shade at the foot of a far face, over the floor: how dark within 3 picture pixels, and within 7. */
  foot: readonly [number, number];
  /**
   * THE NEAR CLIFF'S SHADOW across the floor, so that a cliff is felt on that side though none is drawn
   * (the planning chat's mock-ups, with his yes): how deep it reaches at most, in tiles (it wanders from
   * three quarters of this to all of it), and how dark, inside it and along its last quarter tile.
   */
  nearShadow?: { reach: number; dark: readonly [number, number] };
}

// ---------------------------------------------------------------------------------------------------
// The ground of a floor

/** Cells of the field to a tile. */
const G = 8;
/** Tiles of rock round the floor in the field. */
const MARGIN = 3;

export interface Terrain {
  readonly floor: Floor;
  readonly look: TerrainLook;
  /** The smooth field at world (x, y): 1 deep in the walkable floor, 0 far from it. */
  field(x: number, y: number): number;
  /** The threshold the field must stand over at world (x, y) to be floor: wanders, for the ragged edge. */
  edge(x: number, y: number): number;
  /** Is world (x, y) painted as floor? */
  ground(x: number, y: number): boolean;
}

/** Is this place in the world walkable floor by the tiles (a cut tile's floor half)? */
function onTile(f: Floor, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return false;
  if (f.tiles[ty * f.w + tx] !== T_FLOOR) return false;
  const c = cutAt(f, tx, ty);
  return c === 0 || intoWall(c, x - tx, y - ty) <= 0;
}

/** The ground of a floor in a look: the field is worked out once (about 1.5 MB for a floor 80 tiles square). */
export function terrainOf(floor: Floor, look: TerrainLook): Terrain {
  const NW = (floor.w + 2 * MARGIN) * G;
  const NH = (floor.h + 2 * MARGIN) * G;
  const raw = new Float32Array(NW * NH);
  for (let j = 0; j < NH; j++) {
    const y = (j + 0.5) / G - MARGIN;
    for (let i = 0; i < NW; i++) raw[j * NW + i] = onTile(floor, (i + 0.5) / G - MARGIN, y) ? 1 : 0;
  }
  // a box blur, across then down: the edge falls from 1 to 0 over `round` either side of the tiles' edge
  const r = Math.max(1, Math.round(look.round * G));
  const n = 2 * r + 1;
  const tmp = new Float32Array(NW * NH);
  const out = new Float32Array(NW * NH);
  for (let j = 0; j < NH; j++) {
    let acc = 0;
    const row = j * NW;
    for (let i = -r; i < NW + r; i++) {
      if (i + r < NW) acc += raw[row + i + r];
      if (i - r - 1 >= 0) acc -= raw[row + i - r - 1];
      if (i >= 0 && i < NW) tmp[row + i] = acc / n;
    }
  }
  for (let i = 0; i < NW; i++) {
    let acc = 0;
    for (let j = -r; j < NH + r; j++) {
      if (j + r < NH) acc += tmp[(j + r) * NW + i];
      if (j - r - 1 >= 0) acc -= tmp[(j - r - 1) * NW + i];
      if (j >= 0 && j < NH) out[j * NW + i] = acc / n;
    }
  }
  const cell = (i: number, j: number): number => (i < 0 || j < 0 || i >= NW || j >= NH ? 0 : out[j * NW + i]);
  const field = (x: number, y: number): number => {
    const gx = (x + MARGIN) * G - 0.5;
    const gy = (y + MARGIN) * G - 0.5;
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const u = gx - i;
    const v = gy - j;
    const a = cell(i, j);
    const b = cell(i + 1, j);
    const c = cell(i, j + 1);
    const d = cell(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const k = look.seed;
  const edge = (x: number, y: number): number => {
    const e = 0.5 + look.rag * (vnoise(x * 1.05, y * 1.05, k) - 0.5) + look.fine * (vnoise(x * 6, y * 6, k + 2) - 0.5);
    // never so far as to lose a tile's middle, or to grow one where there is none
    return Math.max(0.34, Math.min(0.66, e));
  };
  return { floor, look, field, edge, ground: (x, y) => field(x, y) > edge(x, y) };
}

/** Which way the floor's edge at world (x, y) looks, out of the floor, in degrees on the picture from the right, round through down (so 180 is straight left, -90 straight up). */
export function edgeAngle(T: Terrain, x: number, y: number): number {
  // over about a third of a tile, and the edge's slow wander only (its fine one would turn it pixel by pixel)
  const e = 0.16;
  const L = T.look;
  const s = (xx: number, yy: number): number => T.field(xx, yy) - (0.5 + L.rag * (vnoise(xx * 1.05, yy * 1.05, L.seed) - 0.5));
  const gx = (s(x + e, y) - s(x - e, y)) / (2 * e);
  const gy = (s(x, y + e) - s(x, y - e)) / (2 * e);
  // the same on the picture (a picture pixel right moves the world +1/(2 HWP) in x, -1/(2 HWP) in y; one down +1/(2 HHP) in each)
  const ox = -(gx - gy) / (2 * HWP);
  const oy = -(gx + gy) / (2 * HHP);
  if (Math.abs(ox) < 1e-9 && Math.abs(oy) < 1e-9) return NaN;
  return (Math.atan2(oy, ox) * 180) / Math.PI;
}

/** Does a near cliff's face show where the floor's edge looks this way out of the floor (his rule: its ridge slanting back past straight down)? */
export function nearShows(angle: number): boolean {
  return angle < -90 || angle > 172;
}

/** How a far face at world (x, y) is turned to the light: 1 looking to the lower left (lit), -1 to the lower right (in shade), 0 at the eye. */
export function shadeAt(T: Terrain, x: number, y: number): number {
  const e = 0.12;
  const gx = T.field(x + e, y) - T.field(x - e, y);
  const gy = T.field(x, y + e) - T.field(x, y - e);
  const len = Math.hypot(gx, gy);
  if (len < 1e-6) return 0;
  return Math.max(-1, Math.min(1, (gy - gx) / len / Math.SQRT2 / 0.7));
}

export interface TerrainPiece {
  /** Its top left corner in the world's picture, and its size, in picture pixels. */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** Its pixels, RGBA, row by row (as an ImageData's). */
  rgba: Uint8ClampedArray<ArrayBuffer>;
  /** What each pixel shows (TK). */
  kind: Uint8Array;
}

/**
 * PAINT A PIECE OF THE GROUND: the world's picture from (x0, y0), w by h picture pixels. Every pixel is
 * painted, opaque. Two pieces side by side are one picture.
 */
export function paintTerrain(T: Terrain, x0: number, y0: number, w: number, h: number): TerrainPiece {
  const L = T.look;
  const H = L.rise;
  const N = L.near;
  // the kinds are worked out from 8 above (the shade at a face's foot looks 7 up) to N below (a near face looks N down)
  const kA = y0 - 8;
  const kB = y0 + h - 1 + N + 1;
  const kn = kB - kA + 1;
  // and what is floor from H over that to H under it
  const wA = kA - H - 1;
  const wB = kB + H;
  const wn = wB - wA + 1;
  const W = new Uint8Array(wn);
  const lastRock = new Int32Array(wn);
  const lastFloor = new Int32Array(wn);
  const nextRock = new Int32Array(wn);
  const kind = new Uint8Array(kn);
  const hit = new Int32Array(kn);
  const lastFace = new Int32Array(kn);
  const nextOff = new Int32Array(kn);
  const rgba = new Uint8ClampedArray(w * h * 4);
  const outKind = new Uint8Array(w * h);
  for (let c = 0; c < w; c++) {
    const px = x0 + c;
    // what is floor down this column
    let lr = -1;
    let lf = -1;
    for (let j = 0; j < wn; j++) {
      const [x, y] = worldOf(px, wA + j);
      const g = T.ground(x, y);
      W[j] = g ? 1 : 0;
      if (g) lf = j;
      else lr = j;
      lastRock[j] = lr;
      lastFloor[j] = lf;
    }
    let nr = wn + 4 * H;
    for (let j = wn - 1; j >= 0; j--) {
      if (!W[j]) nr = j;
      nextRock[j] = nr;
    }
    // what the eye meets at each picture pixel down it
    let lface = -1;
    for (let j = 0; j < kn; j++) {
      const py = kA + j;
      const wi = py - wA;
      let k: number;
      let v = 0;
      if (W[wi]) k = TK.Floor;
      else {
        const rr = lastRock[wi + H];
        v = rr - wi;
        if (v >= H) {
          // the top of the rock: of a near cliff cut away if there is floor over it within H
          const f = lastFloor[wi - 1];
          k = f >= 0 && wi - f <= H ? TK.Cut : TK.Top;
          v = H;
        } else k = TK.Face;
      }
      kind[j] = k;
      hit[j] = v;
      if (k === TK.Face) lface = j;
      lastFace[j] = lface;
    }
    // how far down to the first pixel that is not a top (for the near faces)
    let off = kn;
    for (let j = kn - 1; j >= 0; j--) {
      if (kind[j] !== TK.Top && kind[j] !== TK.Cut) off = j;
      nextOff[j] = off;
    }
    // the colours
    for (let r = 0; r < h; r++) {
      const py = y0 + r;
      const j = py - kA;
      const k = kind[j];
      let col: RGB;
      let ok = k;
      if (k === TK.Floor) {
        const [x, y] = worldOf(px, py);
        const inside = Math.max(0, Math.min(1, (T.field(x, y) - T.edge(x, y)) * 2.5));
        col = L.floor(x, y, px, py, inside);
        let t = 0;
        const lf2 = lastFace[j - 1] ?? -1;
        if (lf2 >= 0 && j - lf2 <= 7) t = j - lf2 < 4 ? L.foot[0] : L.foot[1];
        const ns = L.nearShadow;
        if (ns) {
          // the near cliff, straight down the picture (along the world's x + y): within its shadow's reach?
          const reach = ns.reach * (0.75 + 0.5 * vnoise(x * 0.9 - y * 0.9, 0, L.seed + 40)) * 2 * HHP;
          const d = nextRock[py - wA] - (py - wA);
          if (d <= reach) t = Math.max(t, d > reach - 0.25 * 2 * HHP ? ns.dark[1] : ns.dark[0]);
        }
        if (t > 0) col = [col[0] * (1 - t), col[1] * (1 - t), col[2] * (1 - t)];
      } else if (k === TK.Face) {
        const [x, y] = worldOf(px, py + hit[j]);
        col = L.face(shadeAt(T, x, y), hit[j], px, py, x, y);
      } else {
        const [x, y] = worldOf(px, py + H);
        const back = Math.max(0, Math.min(1, (T.edge(x, y) - T.field(x, y)) / 0.5));
        col = L.top(x, y, px, py, back);
        if (j + 1 < kn && kind[j + 1] === TK.Face) col = L.brow(col, px, py);
        else {
          // his near cliff's face: floor below, through tops only, within N
          const d = nextOff[j] - j;
          if (d <= N && nextOff[j] < kn && kind[nextOff[j]] === TK.Floor) {
            const [ex, ey] = worldOf(px, py + d);
            if (nearShows(edgeAngle(T, ex, ey))) {
              col = L.nearFace(d, px, py, ex, ey);
              ok = TK.Near;
            }
          }
        }
      }
      const o = (r * w + c) * 4;
      rgba[o] = col[0];
      rgba[o + 1] = col[1];
      rgba[o + 2] = col[2];
      rgba[o + 3] = 255;
      outKind[r * w + c] = ok;
    }
  }
  return { x0, y0, w, h, rgba, kind: outKind };
}

/**
 * Is a thing `hw` picture pixels either side of its foot and `tall` high, standing on a top at picture
 * (px, py) (its foot drawn there, raised `rise`), clear of the walkable floor? (His rule: nothing on a
 * top stands over the floor.) Asks the ground, not a painted piece.
 */
export function clearOfFloor(T: Terrain, px: number, py: number, hw: number, tall: number): boolean {
  for (let yy = py + 4; yy >= py - tall; yy -= 3) {
    for (let xx = px - hw; xx <= px + hw; xx += 3) {
      const [x, y] = worldOf(xx, yy);
      if (T.ground(x, y)) return false;
    }
  }
  // and its foot on a top: the rock at its own height there
  const [fx, fy] = worldOf(px, py + T.look.rise);
  return !T.ground(fx, fy);
}
