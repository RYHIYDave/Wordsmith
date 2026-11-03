// FLOOR 16, THE SWAN GARDENS (the High City): THE PAINTING, A FIRST LOOK (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING
// OF THE GAME IMPORTS IT.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat, 28 Oct; his "Yes,
// go (Recommended)"), level 16, THE SWAN GARDENS: "Through the shut gates and up the hill through the palace's terraced
// gardens." Its layout "open, like the Millrace: terraces stepping up the hill joined by stairs, clipped hedges and a
// hedge maze, rose arbours, still fountains, and a long lake with a pavilion on an island"; its hazards "nettle beds that
// sting and slow whoever walks through them; the lake's deep water"; its palette "Dawn rose, swan white, deep hedge
// green". The court's swans are the princess's brothers (Andersen's "The Wild Swans", 1838: eleven swans with golden
// crowns on their heads). To the art chat, 28 Oct, asked where to start: “Level 16 in full”.
//
// WHAT IS PAINTED (one corner of the gardens, about a phone screen and a half): three terraces climbing the hill to the
// upper right, each a man's height over the last, faced in pale dressed stone, a balustrade along each top, a stair up the
// middle between piers with urns. ON THE TOP TERRACE the hedge maze, tall yew. ON THE MIDDLE ONE a parterre, four beds of
// roses edged in clipped box, the near right one gone over to nettles; the fountain in the middle, its water still (the
// Hush), a stone swan on its pedestal with its wings raised; rose arbours over the cross walk; yew cones against the wall.
// ON THE LOWEST the lake walk, a rose arbour over it, a bed of nettles; the long lake, still, holding the dawn; on its
// island the Swan Pavilion, a round temple of columns under a lead dome; ELEVEN SWANS on the water in a line. A tall yew
// hedge bounds the gardens on the left, and past it, and past the maze, the dark of the woods on the hill.
//
// His art rulebook kept: one camera, the game's (art/isokit.ts: a tile 64 x 32 picture pixels, heights up in picture
// pixels, two to a game pixel); light from the upper left (a face looking down to the left lit, to the right in shade), a
// low dawn light, long shadows; three tones or so a material; no black outlines, the seams a deep indigo; the place a step
// quieter than the figures, every colour under the dullest word's (Colour 4), nothing cyan, no pink, nothing glowing
// (Colour 3: the dawn rose here is a light on things, never a glow); real shapes; crisp pixels.
//
// HOW IT FITS THE GAME (for later, when it is made game-ready): the game walks on one level, and the terraces are painted
// truly here (each 32 picture pixels over the last); laid flat, a terrace's wall is the face of a one-tile row that is not
// floor (a face 32 high fills such a row exactly), the stairs walkable across it. The maze and the boundary hedges are
// the outdoor ground's walls (art/terrain.ts); the lake its drop.

import { Px } from '../engine/px';
import { Iso } from '../art/isokit';
import type { SideShader } from '../art/isokit';
import { hash } from '../art/kit';

type Col = string | null | undefined;
/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];

// =================================================================================================
// THE PALETTE: dawn rose, swan white, deep hedge green; all under the dullest word's colour

export const PAL = {
  lawn: ['#17211c', '#22302a', '#2e3e30', '#40503a', '#6b6a56'] as R5,
  lawnSh: ['#11171b', '#182224', '#1f2b28', '#26352e', '#2f3e36'] as R5,
  gravel: ['#37303d', '#584b56', '#77666c', '#968182', '#b9a098'] as R5,
  gravelSh: ['#1f1d31', '#2b293e', '#363449', '#423f53', '#4f4b5e'] as R5,
  stone: ['#2c2838', '#574e62', '#807385', '#ab9aa0', '#d8bdb3'] as R5,
  yew: ['#0c1614', '#13201b', '#1a2c22', '#26392b', '#474e3e'] as R5,
  box: ['#141f19', '#1e2e1e', '#2a3d25', '#384f2d', '#58654a'] as R5,
  earth: ['#18131d', '#251d27', '#332830', '#41343a', '#524448'] as R5,
  nettle: ['#0d1510', '#17241a', '#223322', '#30452b', '#4a5c3a'] as R5,
  /** The nettles' stinging hairs catching the light, and their stems. */
  hair: '#a3a697',
  stem: '#3a2b37',
  /** Roses: a dusty dawn rose, never the enemy's pink (each hue past 350 degrees, or barely coloured). */
  rose: ['#5e3436', '#7a4648', '#a3606a', '#c08682', '#d6a89e'] as R5,
  /** The still lake holding the dawn sky: deep, shade, body, light, its rose. */
  water: ['#25263c', '#3b3a55', '#4e4a67', '#655c78', '#8f7983'] as R5,
  glint: '#b49a9c',
  /** Mist lying on the lake at dawn. */
  mist: '#9c8a97',
  lead: ['#1d1e2f', '#303145', '#45465b', '#5e5d73', '#8a8194'] as R5,
  iron: ['#151320', '#221f2d', '#302c3b'] as const,
  woods: ['#090f0e', '#0e1715', '#141f1b', '#1a2922', '#22332a'] as R5,
  meadow: ['#0f1519', '#151e1f', '#1b2723', '#23312a', '#2e3b30'] as R5,
  beyond: '#07080d',
  /** The deep indigo of a seam, never black. */
  seam: '#14111f',
} as const;

/** The swans: swan white, their shade violet-grey; a whooper's beak, yellow and black; the golden crown of the book. */
export const SWAN = {
  white: '#ece6df',
  light: '#d5cfd1',
  shade: '#aca4b3',
  deep: '#7d7591',
  seam: '#4c4762',
  beak: '#d8ad48',
  tip: '#2a2430',
  eye: '#1b1724',
  crown: '#caa24c',
  crownSh: '#8a6c36',
} as const;
/** The stone swan of the fountain: the stone's own tones, lichen. */
const STATUE = { lit: '#d0c1ba', body: '#a99ca3', shade: '#7d7385', deep: '#564f62', lichen: '#6e7465' } as const;

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's); heights in picture pixels

export const W = 1200;
export const H = 840;
/** Where the floor's (0, 0, 0) is on the picture. */
export const OX = 626;
export const OY = 73;
/** Picture pixels of height to a tile (the game's camera: 30 degrees down, so a tile's 1.22 metres stand 39 pixels). */
export const KZ = 39.2;
/** The dawn: from the upper left, low. A spot is lit if the way back toward the sun is clear: rising SLOPE a tile. */
const SLOPE = 34;
const LIGHT: readonly [number, number, number] = [-0.534, 0.534, 0.656];

/** The three terraces: the lowest (the lake's) at 0; its wall at y = R1; the middle at Z2; its wall at y = R2; the top at Z3. */
export const Z1 = 0;
export const Z2 = 32;
export const Z3 = 64;
export const R1 = 11;
export const R2 = 3;
/** The tall yew hedge along the gardens' left side (x), and along the back of the top terrace (y). */
export const LEFT = -4;
export const BACK = -10;
/** The stairs, both flights, up the middle. */
export const STAIR: readonly [number, number] = [11, 13];
/** The long lake: from y0 to y1, its water this far under the lawn, its kerb this wide. */
export const LAKE = { y0: 15.2, y1: 22.6, z: -8, kerb: 0.3 };
/** The island, and the Swan Pavilion on it. */
export const ISLAND = { x: 21.5, y: 18.9, r: 2.9 };
/** The fountain in the middle of the parterre. */
export const FOUNTAIN = { x: 12, y: 7, r: 1.7 };
/** The parterre's four beds (x0, x1, y0, y1); the fourth gone over to nettles. */
const BEDS: readonly (readonly [number, number, number, number])[] = [
  [6.0, 10.3, 4.3, 6.0],
  [13.7, 18.0, 4.3, 6.0],
  [6.0, 10.3, 8.0, 10.2],
  [13.7, 18.0, 8.0, 10.2],
];
const NETTLE_BED = 3;
/** The parterre's gravel, round the beds. */
const PARTERRE = { x0: 5.3, x1: 18.7, y0: 3.75, y1: 10.55 };
/** The bed of nettles on the lake walk. */
const NETTLES_LOW = { x0: 0.6, x1: 4.9, y0: 13.55, y1: 14.75 };
/** The lake walk along the foot of the lowest wall. */
const WALK = { y0: 12.0, y1: 13.5 };
/** The cross walk on the middle terrace. */
const CROSS = { y0: 6.3, y1: 7.7 };
/** The maze: 11 cells across, 6 deep, each this wide; its front wall at y = MAZE.y1, the way in the middle cell's. */
export const MAZE = { x0: 3.2, y1: 1.6, n: 11, m: 6, cell: 1.6, thick: 0.46, h: 60 };
/** The near shore past the lake: its low box hedge, and past it the rough. */
const SHORE = 25.0;

/** Where the hero stands (the overview and the phone screen alike): on the lake walk at the foot of the stair. */
export const HERO_AT: readonly [number, number] = [12.2, 13.0];

/** How high the ground is at y (the terraces). */
export const zOf = (y: number): number => (y < R2 ? Z3 : y < R1 ? Z2 : Z1);

// =================================================================================================
// Helpers

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
/** A colour `k` of the way to another. */
export function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hex(a);
  const [r1, g1, b1] = hex(b);
  return toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
}
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const ck = (k: number): number => clamp(Math.round(k), 0, 4);
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
const BAYER = [
  [0.125, 0.625],
  [0.875, 0.375],
];
/** Over a threshold, with a checker of pixels where it is near it, so one tone gives way to the next softly, still crisp. */
function over(t: number, thr: number, px: number, py: number, band = 0.03): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > BAYER[py & 1][px & 1];
}

/** Where a point of the world is on the picture. */
export const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 32, OY + (x + y) * 16 - z];
/** Which point of the world, at height z, a picture pixel shows. */
export function worldAt(px: number, py: number, z: number): [number, number] {
  const a = (px + 0.5 - OX) / 32;
  const b = (py + 0.5 - OY + z) / 16;
  return [(a + b) / 2, (b - a) / 2];
}

/** A flat top from (x0, y0) to (x1, y1) at height z, each pixel as `f` says from where it is in the world and on the picture. */
export function topAt(p: Px, x0: number, y0: number, x1: number, y1: number, z: number, f: (x: number, y: number, px: number, py: number) => Col): void {
  const cs = [at(x0, y0, z), at(x1, y0, z), at(x1, y1, z), at(x0, y1, z)];
  const minX = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[0]))));
  const maxX = Math.min(p.w - 1, Math.ceil(Math.max(...cs.map((c) => c[0]))));
  const minY = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[1]))));
  const maxY = Math.min(p.h - 1, Math.ceil(Math.max(...cs.map((c) => c[1]))));
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const [x, y] = worldAt(px, py, z);
      if (x < x0 || x >= x1 || y < y0 || y >= y1) continue;
      const c = f(x, y, px, py);
      if (c) p.set(px, py, c);
    }
  }
}

// =================================================================================================
// SHADOWS: the way back toward the low sun, along (-1, +1), rising SLOPE a tile; blocked by what stands

interface BoxB { kind: 'box'; x0: number; y0: number; x1: number; y1: number; lo: number; hi: number }
interface RoundB { kind: 'round'; x: number; y: number; r: number; lo: number; hi: number; top?: number }
type Blocker = BoxB | RoundB;
const BLOCKERS: Blocker[] = [];
const box = (x0: number, y0: number, x1: number, y1: number, lo: number, hi: number): void => {
  BLOCKERS.push({ kind: 'box', x0, y0, x1, y1, lo, hi });
};
const round = (x: number, y: number, r: number, lo: number, hi: number, top?: number): void => {
  BLOCKERS.push({ kind: 'round', x, y, r, lo, hi, top });
};
/** Whether a spot at height z is in shadow. */
export function shadowed(x: number, y: number, z: number): boolean {
  for (const b of BLOCKERS) {
    if (b.kind === 'box') {
      const t0 = Math.max(0, x - b.x1, b.y0 - y);
      const t1 = Math.min(x - b.x0, b.y1 - y);
      if (t0 > t1) continue;
      if (z + t0 * SLOPE < b.hi && z + t1 * SLOPE > b.lo) return true;
    } else {
      // (x - t - bx)^2 + (y + t - by)^2 <= r^2: 2t^2 - 2t(dx - dy) + dx^2 + dy^2 - r^2 <= 0
      const dx = x - b.x;
      const dy = y - b.y;
      const B = -2 * (dx - dy);
      const C = dx * dx + dy * dy - b.r * b.r;
      const D = B * B - 8 * C;
      if (D < 0) continue;
      const sq = Math.sqrt(D);
      const t0 = Math.max(0, (-B - sq) / 4);
      const t1 = (-B + sq) / 4;
      if (t1 < t0) continue;
      // (a cone or a dome narrows as it rises: only within its radius at that height)
      if (b.top !== undefined) {
        const tm = (t0 + t1) / 2;
        const zz = z + tm * SLOPE;
        const off = Math.hypot(x - tm - b.x, y + tm - b.y);
        const k = (zz - b.lo) / (b.top - b.lo);
        if (zz > b.lo && zz < b.top && off <= b.r * (1 - k)) return true;
        continue;
      }
      if (z + t0 * SLOPE < b.hi && z + t1 * SLOPE > b.lo) return true;
    }
  }
  return false;
}

// =================================================================================================
// SOLIDS: what is round (an urn, a yew cone, the fountain, the pavilion) is drawn by finding, for each pixel, the first
// thing the eye meets along it, and lighting it by which way it faces

type Sdf = (x: number, y: number, z: number) => number;
interface Part { sdf: Sdf; paint: (x: number, y: number, z: number, n: readonly [number, number, number], lit: number, px: number, py: number, shade: boolean) => Col }
/** The way along the eye's line, a step of s (x + y) at a time: x and y each by half of it, z (tiles) by 16 / KZ of it. */
const RAY = Math.sqrt(0.5 + (16 / KZ) * (16 / KZ));
/**
 * Draw a solid made of parts (each a signed distance in tiles, heights in tiles) inside the picture's box (sx0..sx1,
 * sy0..sy1), whose world lies between s0 and s1 (x + y); `occluders` cast shadows on it toward the sun.
 */
export function solid(p: Px, bx: readonly [number, number, number, number], s0: number, s1: number, parts: readonly Part[], occluders?: Sdf): void {
  const sdf: Sdf = (x, y, z) => {
    let d = Infinity;
    for (const q of parts) d = Math.min(d, q.sdf(x, y, z));
    return d;
  };
  const x0 = Math.max(0, Math.floor(bx[0]));
  const x1 = Math.min(p.w - 1, Math.ceil(bx[2]));
  const y0 = Math.max(0, Math.floor(bx[1]));
  const y1 = Math.min(p.h - 1, Math.ceil(bx[3]));
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const u = (px + 0.5 - OX) / 32;
      const SY = py + 0.5 - OY;
      let s = s1;
      let hit = false;
      let x = 0;
      let y = 0;
      let z = 0;
      for (let i = 0; i < 400 && s >= s0; i++) {
        x = (s + u) / 2;
        y = (s - u) / 2;
        z = (16 * s - SY) / KZ;
        const d = sdf(x, y, z);
        if (d < 0.003) {
          hit = true;
          break;
        }
        s -= Math.max(0.004, d / RAY);
      }
      if (!hit) continue;
      // which part, the way it faces, the light on it
      let best = parts[0];
      let bd = Infinity;
      for (const q of parts) {
        const d = q.sdf(x, y, z);
        if (d < bd) {
          bd = d;
          best = q;
        }
      }
      const e = 0.004;
      const nx = best.sdf(x + e, y, z) - best.sdf(x - e, y, z);
      const ny = best.sdf(x, y + e, z) - best.sdf(x, y - e, z);
      const nz = best.sdf(x, y, z + e) - best.sdf(x, y, z - e);
      const nl = Math.hypot(nx, ny, nz) || 1;
      const n: [number, number, number] = [nx / nl, ny / nl, nz / nl];
      const lit = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      let shade = false;
      if (occluders && lit > 0) {
        // a step off the surface, then toward the sun
        let t = 0.03;
        for (let k = 0; k < 60 && t < 6; k++) {
          const qx = x + n[0] * 0.01 + LIGHT[0] * t;
          const qy = y + n[1] * 0.01 + LIGHT[1] * t;
          const qz = z + n[2] * 0.01 + LIGHT[2] * t;
          const d = occluders(qx, qy, qz);
          if (d < 0.002) {
            shade = true;
            break;
          }
          t += Math.max(0.01, d);
        }
      }
      const c = best.paint(x, y, z, n, shade ? -0.6 : lit, px, py, shade);
      if (c) p.set(px, py, c);
    }
  }
}
/** The box on the picture round a solid standing at (x, y) from height z0 to z1 (picture pixels), r tiles round. */
export function boundsOf(x: number, y: number, r: number, z0: number, z1: number): [number, number, number, number] {
  const [sx, sy] = at(x, y, 0);
  return [sx - r * 45.3 - 2, sy - z1 - r * 22.7 - 2, sx + r * 45.3 + 2, sy - z0 + r * 22.7 + 2];
}
/** A tone of a material by how the light falls (lit -1..1), softly stepped. */
function toneOf(lit: number, px: number, py: number, k = [0.78, 0.4, 0.02, -0.4]): number {
  if (over(lit, k[0], px, py, 0.015)) return 4;
  if (over(lit, k[1], px, py, 0.02)) return 3;
  if (over(lit, k[2], px, py, 0.025)) return 2;
  if (over(lit, k[3], px, py, 0.025)) return 1;
  return 0;
}

// signed distances (tiles)
const cyl = (cx: number, cy: number, r: number, z0: number, z1: number): Sdf => (x, y, z) => {
  const dr = Math.hypot(x - cx, y - cy) - r;
  const dz = Math.max(z0 - z, z - z1);
  return dr > 0 && dz > 0 ? Math.hypot(dr, dz) : Math.max(dr, dz);
};
const ring = (cx: number, cy: number, r0: number, r1: number, z0: number, z1: number): Sdf => (x, y, z) => {
  const r = Math.hypot(x - cx, y - cy);
  const dr = Math.max(r0 - r, r - r1);
  const dz = Math.max(z0 - z, z - z1);
  return dr > 0 && dz > 0 ? Math.hypot(dr, dz) : Math.max(dr, dz);
};
const ellipsoid = (cx: number, cy: number, cz: number, a: number, c: number): Sdf => (x, y, z) => {
  const k = Math.hypot((x - cx) / a, (y - cy) / a, (z - cz) / c);
  return (k - 1) * Math.min(a, c);
};
const cone = (cx: number, cy: number, z0: number, r: number, h: number): Sdf => (x, y, z) => {
  const q = Math.hypot(x - cx, y - cy);
  const hz = z - z0;
  const side = (q * h + r * hz - r * h) / Math.hypot(h, r);
  return Math.max(side, -hz);
};
const above = (s: Sdf, z0: number): Sdf => (x, y, z) => Math.max(s(x, y, z), z0 - z);
const T = (pxHeight: number): number => pxHeight / KZ;

// =================================================================================================
// TEXTURES of the ground

/** Clipped lawn: mown in broad stripes; a blade's tip here and there in the dawn; the shade cool. */
function lawnAt(x: number, y: number, px: number, py: number, sh: boolean): string {
  const R = sh ? PAL.lawnSh : PAL.lawn;
  const stripe = Math.floor((x + 0.3 * Math.floor(y / 6)) / 1.4) % 2 === 0;
  let k = stripe ? 2 : 3;
  const g = hash(px >> 1, py, 401);
  if (g < 0.12) k -= 1;
  else if (g > 0.93 && !sh && stripe === false) k = 4;
  if (over(fbm(x * 0.7, y * 0.7, 403), 0.68, px, py)) k -= 1;
  return R[ck(k)];
}
/** Raked gravel: pale, speckled in pairs. */
function gravelAt(x: number, y: number, px: number, py: number, sh: boolean): string {
  const R = sh ? PAL.gravelSh : PAL.gravel;
  const g = hash(px >> 1, py, 411);
  let k = g < 0.14 ? 2 : g > 0.9 ? 4 : 3;
  if (over(fbm(x * 1.3, y * 1.3, 413), 0.66, px, py)) k -= 1;
  return R[ck(k)];
}
/** Stone laid flat (a kerb, a coping): blocks this long, a seam between, lit. */
function flagAt(x: number, y: number, px: number, py: number, along: number, sh: boolean): string {
  const R = PAL.stone;
  const j = ((along % 0.7) + 0.7) % 0.7;
  if (j < 0.04) return R[0];
  const b = Math.floor(along / 0.7);
  let k = hash(b, 0, 421) < 0.3 ? 2 : 3;
  if (hash(px >> 1, py, 423) > 0.94) k = 4;
  if (sh) k -= 2;
  return R[ck(k)];
}
/**
 * NETTLES: a dense, dark, cold mass of toothed leaves in pairs, each leaf's tip catching the light and the stinging hairs
 * on them pale; the stems a dark wine; ragged at its edge where stalks stand out of it. `k`: how far into the bed (its
 * edge ragged: below 0, nothing).
 */
function nettleAt(x: number, y: number, px: number, py: number, sh: boolean): string | null {
  const R = PAL.nettle;
  // (leaves in cells of 5 x 4 picture pixels, staggered, each a toothed blade pointing up and out)
  const cy = Math.floor(py / 4);
  const off = (cy % 2) * 3;
  const cx = Math.floor((px + off) / 6);
  const lx = px + off - cx * 6;
  const ly = py - cy * 4;
  const h = hash(cx, cy, 431);
  const side = h < 0.5 ? 1 : -1;
  let k = 1;
  // the blade: wide in its middle row, a tooth on its edge every other pixel
  const half = ly === 0 ? 1 : ly === 1 ? 2.5 : ly === 2 ? 2 : 0.5;
  const mid = 2.5 + side * (ly - 1) * 0.5;
  const d = Math.abs(lx - mid);
  if (d <= half) {
    k = ly === 0 ? 3 : ly === 1 ? 2 : 2;
    if (d > half - 1 && (lx + ly) % 2 === 0) k += 1;
    if (Math.abs(lx - mid) < 0.6 && ly > 0) k = 1;
    if (ly === 0 && h > 0.7) k = 4;
  } else if (ly === 3 && hash(cx, cy, 433) < 0.35) return sh ? PAL.nettle[0] : PAL.stem;
  else k = 0;
  if (sh) k -= 1;
  // the stinging hairs: a pale pair here and there on the lit leaves
  if (!sh && k >= 2 && hash(px >> 1, py, 435) > 0.955) return PAL.hair;
  return R[ck(k)];
}

/** A NETTLE (game pixels): a stem of dark wine, three pairs of toothed leaves drooping off it, smaller toward its top;
 * the leaves on the left in the light, on the right in shade; a stinging hair catching the light. Its anchor its foot. */
function nettlePlant(v: number): { px: Px; ax: number; ay: number } {
  const N = PAL.nettle;
  const s = new Px(11, 14);
  const ax = 5;
  const ay = 13;
  const tall = 7 + (v % 4);
  for (let y = 0; y < tall; y++) s.set(ax, ay - y, y < 2 ? N[1] : PAL.stem);
  // (each leaf as drawn on the left; the right the same, in shade): L lit, B its body, D its drooping tip
  const LEAF: Record<number, string[]> = { 1: ['LL'], 2: ['.LL', 'LBB', '.D.'], 3: ['..LL', '.LBB', 'LBB.', '.D..'] };
  const tone = (ch: string, lit: boolean): string | null => (ch === 'L' ? (lit ? N[4] : N[2]) : ch === 'B' ? (lit ? N[3] : N[1]) : ch === 'D' ? (lit ? N[2] : N[0]) : null);
  const pairs: [number, number][] = [[tall, 1], [tall - 2, 2], [tall - 5, 3]];
  for (const [hgt, size] of pairs) {
    if (hgt < 3) continue;
    const rows = LEAF[size];
    rows.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) {
        const dx = row.length - i;
        for (const side of [-1, 1]) {
          const c = tone(row[i], side < 0);
          if (c) s.set(ax + side * dx, ay - hgt + r, c);
        }
      }
    });
  }
  s.set(ax, ay - tall, N[4]);
  if (v % 3 === 0) s.set(ax - 2, ay - tall + 2, PAL.hair);
  else if (v % 3 === 1) s.set(ax - 3, ay - tall + 5, PAL.hair);
  return { px: s, ax, ay };
}
const NETTLES = [0, 1, 2, 3, 4, 5, 6, 7].map(nettlePlant);
/** A bed of nettles standing on the ground at height z: plants close together wherever `inBed` says, far to near. */
function nettleBed(p: Px, x0: number, y0: number, x1: number, y1: number, z: number, inBed: (x: number, y: number) => boolean, list: { d: number; draw: () => void }[], seed: number): void {
  const P = 0.2;
  for (let j = Math.floor(y0 / P); j <= Math.ceil(y1 / P); j++) {
    for (let i = Math.floor(x0 / P); i <= Math.ceil(x1 / P); i++) {
      const x = (i + 0.2 + 0.6 * hash(i, j, seed)) * P;
      const y = (j + 0.2 + 0.6 * hash(i, j, seed + 1)) * P;
      if (!inBed(x, y)) continue;
      const pl = NETTLES[Math.floor(hash(i, j, seed + 2) * NETTLES.length)];
      list.push({
        d: x + y,
        draw: () => {
          const [sx, sy] = at(x, y, z);
          stamp(p, pl.px, Math.round(sx) - pl.ax * 2, Math.round(sy) - pl.ay * 2);
        },
      });
    }
  }
}
/** Is a spot in the nettles of the parterre's fourth bed (spilling out of it), or in the bed by the lake walk? */
function inNettlesHigh(x: number, y: number): boolean {
  const nb = BEDS[NETTLE_BED];
  const nIn = Math.min(x - nb[0], nb[1] - x, y - nb[2], nb[3] - y);
  return nIn + 0.55 * (fbm(x * 1.7, y * 1.7, 503) - 0.35) > 0.05;
}
function inNettlesLow(x: number, y: number): boolean {
  const N = NETTLES_LOW;
  const nIn = Math.min(x - N.x0, N.x1 - x, y - N.y0, N.y1 - y);
  return nIn + 0.5 * (fbm(x * 1.9, y * 1.9, 511) - 0.4) > 0.05;
}

// =================================================================================================
// THE WOODS past the gardens: round crowns of trees, dark, lit a little on their upper left, darker the further out

function woodsAt(x: number, y: number, px: number, py: number, far: number): string {
  const R = PAL.woods;
  const P = 1.7;
  const gi = Math.floor(x / P);
  const gj = Math.floor(y / P);
  let d1 = 9;
  let d2 = 9;
  let ex = 0;
  let ey = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    const i = gi + a;
    const j = gj + b;
    const cx = (i + 0.25 + 0.5 * hash(i, j, 441)) * P;
    const cy = (j + 0.25 + 0.5 * hash(i, j, 442)) * P;
    const d = Math.hypot(x - cx, y - cy);
    if (d < d1) {
      d2 = d1;
      d1 = d;
      ex = (x - cx) / P;
      ey = (y - cy) / P;
    } else if (d < d2) d2 = d;
  }
  if (d2 - d1 < 0.06) return R[0];
  const toLight = -ex + ey;
  let k = toLight > 0.25 ? 3 : toLight > -0.1 ? 2 : 1;
  if (over(fbm(x * 3, y * 3, 445), 0.62, px, py)) k -= 1;
  if (hash(px >> 1, py >> 1, 447) > 0.97 && k >= 2) k += 1;
  k -= Math.floor(far * 3);
  const c = R[ck(k)];
  return far > 0.5 ? mixC(c, PAL.beyond, Math.min(1, (far - 0.5) * 1.6)) : c;
}

// =================================================================================================
// FACES

/** Dressed stone in courses (a terrace's wall, a pier): lit (looking down to the left) or in shade; its coping lit along the top. */
function ashlar(lit: boolean, seed: number): SideShader {
  const R = PAL.stone;
  const CH = 8;
  return (u, v, _w, h) => {
    if (v === 0) return R[lit ? 4 : 2];
    if (v === 1 || v === 2) return R[lit ? 3 : 1];
    if (v === 3) return R[0];
    const vv = v - 4;
    const c = Math.floor(vv / CH);
    const lv = vv % CH;
    const off = Math.floor(hash(c, seed, 1) * 40);
    const Lb = 22 + Math.floor(hash(c, seed, 2) * 14);
    const b = Math.floor((u + off) / Lb);
    const lu = (u + off) % Lb;
    if (lv === CH - 1 || lu === 0) return R[0];
    let k = lit ? 2 : 1;
    const tone = hash(b, c * 7 + seed, 3);
    if (tone < 0.12) k -= 1;
    else if (tone > 0.92) k += 1;
    if (lv === 0) k += 1;
    if (lit && lu === 1) k += 1;
    // (rain has run down it from the coping, here and there; and the damp at its foot)
    if (hash(u >> 1, 0, seed + 9) < 0.06 && v < 10 + 18 * hash(u >> 1, 1, seed + 9)) k -= 1;
    if (h - 1 - v < 3) k -= 1;
    return R[ck(k)];
  };
}
/** A balustrade's run, along a face: its rail, its plinth, and vase-shaped balusters with the light between them. */
function balusters(lit: boolean): SideShader {
  const R = PAL.stone;
  return (u, v, _w, h) => {
    if (v === 0) return R[lit ? 4 : 2];
    if (v <= 2) return R[lit ? 3 : 1];
    if (v === 3) return R[lit ? 1 : 0];
    if (v >= h - 3) return R[v === h - 3 ? (lit ? 3 : 1) : lit ? 2 : 1];
    // a baluster every 8 pixels: narrow at its neck and foot, full in its belly
    const c = u % 8;
    const t = (v - 4) / (h - 7);
    const wdt = t < 0.15 ? 1.4 : t < 0.3 ? 1.0 : t < 0.75 ? 1.2 + 1.4 * Math.sin(((t - 0.3) / 0.45) * Math.PI) : t < 0.88 ? 1.0 : 1.6;
    const d = c - 3.5;
    if (Math.abs(d) > wdt + 0.25) return null;
    if (!lit) return R[d < -0.5 ? 2 : d > 0.8 ? 0 : 1];
    return R[d < -0.8 ? 4 : d < 0.4 ? 3 : 2];
  };
}
/** Clipped yew on a face: dense, its leaves in clumps, darkest at its foot; lit or in shade. */
function yewFace(lit: boolean, seed: number): SideShader {
  const R = PAL.yew;
  return (u, v, _w, h, px, py) => {
    const cl = hash(Math.floor((px + (Math.floor(py / 3) % 2) * 2) / 4), Math.floor(py / 3), seed);
    let k = lit ? 3 : 1;
    if (cl < 0.3) k -= 1;
    else if (cl > 0.85) k += 1;
    if ((px + py) % 4 === 0 && hash(px, py, seed + 1) < 0.3) k -= 1;
    if (v < 2) k = lit ? 4 : 2;
    const fromFoot = h - 1 - v;
    if (fromFoot < 6) k -= 1;
    if (fromFoot < 2) k -= 1;
    void u;
    return R[ck(k)];
  };
}
/** Clipped yew on a top: flat, close, its near edges catching the dawn. */
function yewTop(x: number, y: number, px: number, py: number, x1: number, y1: number, seed: number): string {
  const R = PAL.yew;
  let k = 3;
  const cl = hash(px >> 1, py, seed);
  if (cl < 0.2) k = 2;
  else if (cl > 0.92) k = 4;
  if (y1 - y < 0.07) k = 4;
  else if (x1 - x < 0.06) k = 2;
  return R[ck(k)];
}
/** A box from (x0, y0) to (x1, y1), z0 to z1, its top by `top`, its sides by `left` and `right`. */
function boxAt(p: Px, iso: Iso, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, top: (x: number, y: number, px: number, py: number) => Col, left: SideShader, right: SideShader): void {
  topAt(p, x0, y0, x1, y1, z1, top);
  iso.left(x0, x1, y1, z0, z1, left);
  iso.right(x1, y0, y1, z0, z1, right);
}
/** A run of yew hedge. */
function hedge(p: Px, iso: Iso, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, seed: number): void {
  boxAt(p, iso, x0, y0, x1, y1, z0, z1, (x, y, px, py) => yewTop(x, y, px, py, x1, y1, seed), yewFace(true, seed + 3), yewFace(false, seed + 5));
}

// =================================================================================================
// THE MAZE (the top terrace): a maze of tall yew, found the same every time

interface Wall { x0: number; y0: number; x1: number; y1: number }
export function mazeWalls(): Wall[] {
  const { n, m, cell, x0, y1, thick } = MAZE;
  const t = thick / 2;
  // cells (i across, j back from the front), walls between them knocked through by a walk that never crosses itself
  const seen = new Uint8Array(n * m);
  const openE = new Uint8Array(n * m);
  const openS = new Uint8Array(n * m);
  const stack: number[] = [5];
  seen[5] = 1;
  let r = 0;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const i = c % n;
    const j = Math.floor(c / n);
    const nb: [number, number][] = [];
    if (i > 0 && !seen[c - 1]) nb.push([c - 1, 0]);
    if (i < n - 1 && !seen[c + 1]) nb.push([c + 1, 1]);
    if (j > 0 && !seen[c - n]) nb.push([c - n, 2]);
    if (j < m - 1 && !seen[c + n]) nb.push([c + n, 3]);
    if (!nb.length) {
      stack.pop();
      continue;
    }
    const [to, dir] = nb[Math.floor(hash(r++, c, 451) * nb.length)];
    if (dir === 0) openE[to] = 1;
    else if (dir === 1) openE[c] = 1;
    else if (dir === 2) openS[to] = 1;
    else openS[c] = 1;
    seen[to] = 1;
    stack.push(to);
  }
  // (j = 0 is the front row; its cells run back to j = m - 1)
  const out: Wall[] = [];
  const xAt = (i: number): number => x0 + i * cell;
  const yAt = (j: number): number => y1 - j * cell;
  for (let j = 0; j <= m; j++) {
    for (let i = 0; i < n; i++) {
      // the wall along x at the front of row j (between row j - 1 and j)
      const front = j === 0 ? i !== 5 : j === m ? true : !openS[(j - 1) * n + i];
      if (front) out.push({ x0: xAt(i) - t, y0: yAt(j) - t, x1: xAt(i + 1) + t, y1: yAt(j) + t });
    }
  }
  for (let j = 0; j < m; j++) {
    for (let i = 0; i <= n; i++) {
      const side = i === 0 || i === n ? true : !openE[j * n + i - 1];
      if (side) out.push({ x0: xAt(i) - t, y0: yAt(j + 1) - t, x1: xAt(i) + t, y1: yAt(j) + t });
    }
  }
  // (fix what was found: the walls between rows were set by openS of the row in front of them)
  return out;
}

// =================================================================================================
// THE PAINTING

export interface Garden {
  /** The whole picture, but the swans and the hero. */
  p: Px;
  /** What of it is the lake's water (for what is reflected in it). */
  water: Uint8Array;
}

export function paintGarden(): Garden {
  const p = new Px(W, H);
  const iso = new Iso(p, OX, OY);
  p.rect(0, 0, W, H, PAL.beyond);
  BLOCKERS.length = 0;
  const maze = mazeWalls();

  // ---- WHAT THROWS A SHADOW
  for (const w of maze) box(w.x0, w.y0, w.x1, w.y1, Z3, Z3 + MAZE.h);
  box(LEFT - 0.8, -30, LEFT, 40, 0, Z3 + 96);
  box(-30, BACK - 0.8, 40, BACK, Z3, Z3 + 96);
  const CONES_T2: [number, number][] = [[5.6, 3.55], [8.4, 3.55], [15.6, 3.55], [18.4, 3.55], [1.0, 3.55], [23.0, 3.55]];
  const CONES_T1: [number, number][] = [[4.0, 11.5], [8.6, 11.5], [15.4, 11.5], [20.0, 11.5], [24.6, 11.5], [-0.6, 11.5]];
  for (const [x, y] of CONES_T2) round(x, y, 0.42, Z2, Z2 + 64, Z2 + 64);
  for (const [x, y] of CONES_T1) round(x, y, 0.42, Z1, Z1 + 64, Z1 + 64);
  round(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.r, Z2, Z2 + 16);
  round(FOUNTAIN.x, FOUNTAIN.y, 0.25, Z2, Z2 + 72);
  round(ISLAND.x, ISLAND.y, 1.95, Z1, Z1 + 150);
  round(ISLAND.x, ISLAND.y, 1.85, Z1 + 150, Z1 + 196, Z1 + 196);
  for (const b of BEDS) {
    box(b[0], b[2], b[1], b[2] + 0.2, Z2, Z2 + 12);
    box(b[0], b[3] - 0.2, b[1], b[3], Z2, Z2 + 12);
    box(b[0], b[2], b[0] + 0.2, b[3], Z2, Z2 + 12);
    box(b[1] - 0.2, b[2], b[1], b[3], Z2, Z2 + 12);
  }
  // (the balustrades, low)
  box(LEFT, R2 - 0.22, 40, R2, Z3, Z3 + 26);
  box(LEFT, R1 - 0.22, 40, R1, Z2, Z2 + 26);
  // (the arbours, roughly)
  box(3.0, CROSS.y0 - 0.1, 5.2, CROSS.y1 + 0.1, Z2 + 40, Z2 + 84);
  box(18.8, CROSS.y0 - 0.1, 21.0, CROSS.y1 + 0.1, Z2 + 40, Z2 + 84);
  box(5.4, WALK.y0 - 0.1, 8.6, WALK.y1 + 0.1, Z1 + 40, Z1 + 84);

  // ---- THE WOODS on the hill past the gardens, then the tall yew that bounds them
  topAt(p, -40, -40, LEFT - 0.8, 60, Z3 + 110, (x, y, px, py) => woodsAt(x, y, px, py, clamp((LEFT - 0.8 - x) / 9, 0, 1)));
  topAt(p, LEFT - 0.8, -40, 60, BACK - 0.8, Z3 + 110, (x, y, px, py) => woodsAt(x, y, px, py, clamp((BACK - 0.8 - y) / 9, 0, 1)));
  hedge(p, iso, LEFT - 0.8, BACK - 0.8, 40, BACK, Z3, Z3 + 96, 461);
  hedge(p, iso, LEFT - 0.8, BACK, LEFT, R2, 0, Z3 + 96, 463);
  hedge(p, iso, LEFT - 0.8, R2, LEFT, R1, 0, Z2 + 96, 465);
  hedge(p, iso, LEFT - 0.8, R1, LEFT, 60, 0, Z1 + 96, 467);

  // ---- THE TOP TERRACE: its gravel and its lawn; the maze; its balustrade
  topAt(p, LEFT, BACK, 40, R2, Z3, (x, y, px, py) => {
    const sh = shadowed(x, y, Z3);
    const inMaze = x > MAZE.x0 - 0.3 && x < MAZE.x0 + MAZE.n * MAZE.cell + 0.3 && y > MAZE.y1 - MAZE.m * MAZE.cell - 0.3 && y < MAZE.y1 + 0.3;
    if (inMaze || (y > MAZE.y1 + 0.3 && y < R2 - 0.2)) return gravelAt(x, y, px, py, sh);
    if (y >= R2 - 0.2) return flagAt(x, y, px, py, x, sh);
    return lawnAt(x, y, px, py, sh);
  });
  const sortedMaze = [...maze].sort((a, b) => a.x1 + a.y1 - (b.x1 + b.y1));
  for (const w of sortedMaze) hedge(p, iso, w.x0, w.y0, w.x1, w.y1, Z3, Z3 + MAZE.h, 471 + Math.floor(w.x0 * 7 + w.y0 * 3));
  balustrade(p, iso, R2, Z3);

  // ---- THE MIDDLE TERRACE'S WALL, its ground, the stair up to the top
  iso.left(LEFT, 40, R2, Z2, Z3, ashlar(true, 481));
  topAt(p, LEFT, R2, 40, R1, Z2, (x, y, px, py) => middleGround(x, y, px, py));
  stair(p, iso, R2, Z2);
  piersAt(p, iso, R2 - 0.0, Z3, true);

  // ---- WHAT STANDS ON THE MIDDLE TERRACE, far to near
  const t2: { d: number; draw: () => void }[] = [];
  for (const [x, y] of CONES_T2) t2.push({ d: x + y, draw: () => yewCone(p, x, y, Z2) });
  t2.push({ d: FOUNTAIN.x + FOUNTAIN.y, draw: () => fountain(p) });
  BEDS.forEach((b, k) => {
    // the near and far edges of each bed: box hedges; and in the three of roses, the bushes
    if (k !== NETTLE_BED) roseBushes(b, t2, p);
    const t = 0.2;
    const boxH = (x0: number, y0: number, x1: number, y1: number): (() => void) => () => boxAt(p, iso, x0, y0, x1, y1, Z2, Z2 + 12, (x, y, px, py) => boxTop(x, y, px, py, x1, y1), boxFace(true), boxFace(false));
    t2.push({ d: b[0] + b[2] + 0.01, draw: boxH(b[0], b[2], b[1], b[2] + t) });
    t2.push({ d: b[0] + b[2] + 0.02, draw: boxH(b[0], b[2], b[0] + t, b[3]) });
    t2.push({ d: b[1] + b[3] + 0.01, draw: boxH(b[1] - t, b[2], b[1], b[3]) });
    t2.push({ d: b[1] + b[3] + 0.02, draw: boxH(b[0], b[3] - t, b[1], b[3]) });
  });
  nettleBed(p, 13, 7.4, 19.2, 10.8, Z2, inNettlesHigh, t2, 621);
  t2.push({ d: 4.1 + CROSS.y1, draw: () => arbour(p, 'x', 3.2, 5.0, CROSS.y0, CROSS.y1, Z2, 811) });
  t2.push({ d: 19.9 + CROSS.y1, draw: () => arbour(p, 'x', 19.0, 20.8, CROSS.y0, CROSS.y1, Z2, 821) });
  t2.sort((a, b) => a.d - b.d);
  for (const it of t2) it.draw();
  balustrade(p, iso, R1, Z2);

  // ---- THE LOWEST TERRACE: its wall; the lake's water first (it lies under the lawn), its far kerb's face; the ground
  iso.left(LEFT, 40, R1, Z1, Z2, ashlar(true, 491));
  const water = new Uint8Array(W * H);
  topAt(p, LEFT, LAKE.y0, 60, LAKE.y1 + 1, LAKE.z, (x, y, px, py) => {
    const c = lakeAt(x, y, px, py);
    if (c) water[py * W + px] = 1;
    return c;
  });
  iso.left(LEFT, 60, LAKE.y0, LAKE.z, Z1, (u, v, _w, h, px, py) => {
    water[py * W + px] = 0;
    return v === 0 ? PAL.stone[4] : v === h - 1 ? PAL.water[0] : v === h - 2 ? PAL.stone[1] : PAL.stone[hash(u >> 3, 0, 497) < 0.3 ? 2 : 3];
  });
  topAt(p, LEFT, R1, 60, 60, Z1, (x, y, px, py) => {
    const c = lowGround(x, y, px, py);
    if (c) water[py * W + px] = 0;
    return c;
  });
  stair(p, iso, R1, Z1);
  piersAt(p, iso, R1, Z2, true);
  piersAt(p, iso, R1 + 1.0, Z1, false);

  // ---- WHAT STANDS ON THE LOWEST TERRACE, far to near
  const t1: { d: number; draw: () => void }[] = [];
  for (const [x, y] of CONES_T1) t1.push({ d: x + y, draw: () => yewCone(p, x, y, Z1) });
  nettleBed(p, 0, 13.2, 5.6, 15.0, Z1, inNettlesLow, t1, 631);
  t1.push({ d: 7.0 + WALK.y1, draw: () => arbour(p, 'x', 5.6, 8.4, WALK.y0, WALK.y1, Z1, 831) });
  t1.sort((a, b) => a.d - b.d);
  for (const it of t1) it.draw();

  // ---- THE ISLAND and THE SWAN PAVILION, and their likeness in the still water
  island(p, water);
  const pav = new Px(W, H);
  pavilion(pav);
  reflect(p, pav, water, at(ISLAND.x, ISLAND.y, LAKE.z)[1]);
  blit(p, pav);
  mist(p, water);

  // ---- THE NEAR SHORE: its low box hedge
  boxAt(p, iso, LEFT, SHORE, 60, SHORE + 0.35, Z1, Z1 + 14, (x, y, px, py) => boxTop(x, y, px, py, 60, SHORE + 0.35), boxFace(true), boxFace(false));
  return { p, water };
}

// =================================================================================================
// THE GROUNDS of each terrace

function middleGround(x: number, y: number, px: number, py: number): Col {
  const sh = shadowed(x, y, Z2);
  // the coping along the terrace's edge
  if (y >= R1 - 0.22) return flagAt(x, y, px, py, x, sh);
  // the fountain's apron of flags, and the walks
  const fd = Math.hypot(x - FOUNTAIN.x, y - FOUNTAIN.y);
  if (fd < FOUNTAIN.r + 0.45) return flagAt(x, y, px, py, Math.atan2(y - FOUNTAIN.y, x - FOUNTAIN.x) * FOUNTAIN.r * 1.6 + 20, sh);
  const P = PARTERRE;
  const inP = x > P.x0 && x < P.x1 && y > P.y0 && y < P.y1;
  const central = x >= STAIR[0] && x < STAIR[1];
  const cross = y >= CROSS.y0 && y < CROSS.y1;
  // the nettles: their bed, and spreading out of it onto the gravel round it
  const nb = BEDS[NETTLE_BED];
  const nIn = Math.min(x - nb[0], nb[1] - x, y - nb[2], nb[3] - y);
  const ragged = nIn + 0.55 * (fbm(x * 1.7, y * 1.7, 503) - 0.35);
  if (ragged > 0) {
    const c = nettleAt(x, y, px, py, sh);
    if (c) return c;
  }
  for (let k = 0; k < BEDS.length; k++) {
    const b = BEDS[k];
    if (x > b[0] && x < b[1] && y > b[2] && y < b[3]) {
      if (k === NETTLE_BED) return nettleAt(x, y, px, py, sh) ?? PAL.earth[1];
      // (the earth of a rose bed, and its inner ring of box drawn as it stands)
      const e = hash(px >> 1, py, 505);
      return (sh ? PAL.earth : PAL.earth)[sh ? 1 : e < 0.2 ? 1 : e > 0.9 ? 3 : 2];
    }
  }
  if (inP || central || cross) return gravelAt(x, y, px, py, sh);
  return lawnAt(x, y, px, py, sh);
}

function lowGround(x: number, y: number, px: number, py: number): Col {
  const sh = shadowed(x, y, Z1);
  // the lake: its kerbs of stone; the water itself lies under
  if (y >= LAKE.y0 && y < LAKE.y1) {
    if (Math.hypot(x - ISLAND.x, y - ISLAND.y) < ISLAND.r) return null;
    return null;
  }
  if ((y >= LAKE.y0 - LAKE.kerb && y < LAKE.y0) || (y >= LAKE.y1 && y < LAKE.y1 + LAKE.kerb)) return flagAt(x, y, px, py, x, sh);
  // the lake walk; the nettles by it; the lawn; past the lake, the shore and the rough
  if (y >= WALK.y0 && y < WALK.y1) return gravelAt(x, y, px, py, sh);
  if (x >= STAIR[0] - 0.4 && x < STAIR[1] + 0.4 && y < WALK.y0) return gravelAt(x, y, px, py, sh);
  const N = NETTLES_LOW;
  const nIn = Math.min(x - N.x0, N.x1 - x, y - N.y0, N.y1 - y);
  if (nIn + 0.5 * (fbm(x * 1.9, y * 1.9, 511) - 0.4) > 0) {
    const c = nettleAt(x, y, px, py, sh);
    if (c) return c;
  }
  if (y > SHORE + 0.35) {
    const far = clamp((y - SHORE - 0.35) / 8, 0, 1);
    const R = PAL.meadow;
    let k = over(fbm(x * 0.9, y * 0.9, 513), 0.5, px, py) ? 3 : 2;
    if (hash(px >> 1, py, 515) > 0.9) k += 1;
    k -= Math.floor(far * 3);
    return mixC(R[ck(k)], PAL.beyond, far * 0.85);
  }
  return lawnAt(x, y, px, py, sh);
}

/** THE LAKE, still, holding the dawn sky: one colour of sky in it everywhere (it is seen all from the one height), the
 * faintest stir in broad patches, long thin lines of light lying across it; under its far kerb the kerb's likeness. */
function lakeAt(x: number, y: number, px: number, py: number): Col {
  if (Math.hypot(x - ISLAND.x, y - ISLAND.y) < ISLAND.r - 0.02) return PAL.water[2];
  const R = PAL.water;
  // under the far kerb, its face upside down: 8 picture pixels of it, darker
  const below = (y - LAKE.y0) * 32;
  if (below < 8) {
    const v = 7 - Math.floor(below);
    return v === 0 ? mixC(PAL.stone[3], R[2], 0.5) : mixC(PAL.stone[v < 3 ? 1 : 2], R[1], 0.45);
  }
  if (below < 10) return R[1];
  let k = 2;
  const stir = fbm(x * 0.35, y * 1.1, 521);
  if (over(stir, 0.62, px, py, 0.02)) k = 1;
  else if (over(stir, 0.36, px, py, 0.02) === false) k = 3;
  // (long lines of light across it, a pixel high)
  const run = Math.floor((px + 37 * (py % 7)) / 26);
  if (hash(run, py, 523) > 0.94 && (py & 1) === 0) k = hash(run, py, 525) > 0.5 ? 4 : 3;
  if (shadowed(x, y, LAKE.z)) k -= 1;
  return R[ck(k)];
}

// =================================================================================================
// THE STAIRS, THE PIERS AND URNS, THE BALUSTRADES

/** A flight of four steps up a terrace's wall at y = wall, from the terrace below (z0) to the one above (z0 + 32). */
function stair(p: Px, iso: Iso, wall: number, z0: number): void {
  const [x0, x1] = STAIR;
  for (let k = 3; k >= 0; k--) {
    const ya = wall + 1 - 0.25 * (k + 1);
    const yb = wall + 1 - 0.25 * k;
    const z1 = z0 + 8 * (k + 1);
    boxAt(p, iso, x0, ya, x1, yb, z0, z1, (x, y, px, py) => {
      // the tread: its front edge worn and lit
      if (yb - y < 0.05) return PAL.stone[4];
      const g = hash(px >> 1, py, 531 + k);
      return PAL.stone[g < 0.15 ? 2 : 3];
    }, (u, v, _w, h) => (v === 0 ? PAL.stone[3] : v >= h - 1 ? PAL.stone[0] : PAL.stone[hash(u >> 2, k, 533) < 0.2 ? 1 : 2]), (_u, v) => (v === 0 ? PAL.stone[2] : PAL.stone[1]));
  }
}
/** The piers either side of a stair, at the top of a wall (or its foot), each with an urn on it. */
function piersAt(p: Px, iso: Iso, wall: number, z0: number, top: boolean): void {
  const S = 0.42;
  const y1 = top ? wall : wall + 0.02;
  const y0 = y1 - S;
  for (const xc of [STAIR[0] - S / 2 - 0.02, STAIR[1] + S / 2 + 0.02]) {
    const x0 = xc - S / 2;
    const x1 = xc + S / 2;
    const zt = z0 + (top ? 30 : 36);
    boxAt(p, iso, x0, y0, x1, y1, z0, zt - 4, (x, y, px, py) => flagAt(x, y, px, py, x + y, false), ashlar(true, 541), ashlar(false, 543));
    boxAt(p, iso, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, zt - 4, zt, () => PAL.stone[3], (_u, v) => (v === 0 ? PAL.stone[4] : PAL.stone[2]), (_u, v) => (v === 0 ? PAL.stone[2] : PAL.stone[1]));
    urn(p, xc, (y0 + y1) / 2, zt);
  }
}
/** A stone urn: a foot, a full belly, a neck, a lip; a clipped box ball in it. */
function urn(p: Px, x: number, y: number, z0: number): void {
  const b = T(z0);
  const R = PAL.stone;
  const stone: Part['paint'] = (_x, _y, _z, _n, lit, px, py) => R[Math.max(1, toneOf(lit, px, py))];
  const parts: Part[] = [
    { sdf: cyl(x, y, 0.09, b, b + T(4)), paint: stone },
    { sdf: cyl(x, y, 0.05, b + T(4), b + T(7)), paint: stone },
    { sdf: ellipsoid(x, y, b + T(13), 0.19, T(8)), paint: stone },
    { sdf: cyl(x, y, 0.15, b + T(18), b + T(21)), paint: stone },
    { sdf: ellipsoid(x, y, b + T(24), 0.13, T(7)), paint: (_x, _y, _z, _n, lit, px, py) => PAL.box[Math.max(1, toneOf(lit, px, py))] },
  ];
  solid(p, boundsOf(x, y, 0.22, z0, z0 + 32), x + y - 0.5, x + y + 0.5, parts);
}
/** A balustrade along a terrace's top edge (at y = wall, on the terrace at z0), broken for the stair. */
function balustrade(p: Px, iso: Iso, wall: number, z0: number): void {
  const H2 = 26;
  const y0 = wall - 0.2;
  for (const [x0, x1] of [[LEFT, STAIR[0] - 0.44], [STAIR[1] + 0.44, 40]] as const) {
    topAt(p, x0, y0, x1, wall, z0 + H2, (_x, y, px, py) => (wall - y < 0.06 ? PAL.stone[4] : PAL.stone[hash(px >> 1, py, 551) < 0.2 ? 2 : 3]));
    iso.left(x0, x1, wall, z0, z0 + H2, balusters(true));
    if (x1 < 39) iso.right(x1, y0, wall, z0, z0 + H2, balusters(false));
  }
}

// =================================================================================================
// THE PARTERRE: box edging; rose bushes; the fountain

function boxTop(x: number, y: number, px: number, py: number, x1: number, y1: number): string {
  const R = PAL.box;
  let k = hash(px >> 1, py, 561) < 0.25 ? 2 : 3;
  if (y1 - y < 0.05) k = 4;
  else if (x1 - x < 0.04) k = 2;
  return R[k];
}
function boxFace(lit: boolean): SideShader {
  const R = PAL.box;
  return (_u, v, _w, h, px, py) => {
    let k = lit ? 3 : 1;
    if (hash(px >> 1, py >> 1, 563) < 0.3) k -= 1;
    if (v === 0) k = lit ? 4 : 2;
    if (h - 1 - v < 2) k -= 1;
    return R[ck(k)];
  };
}
/** The rose bushes of a bed, each a low round mound of leaves with its roses out on its lit side. */
function roseBushes(b: readonly [number, number, number, number], list: { d: number; draw: () => void }[], p: Px): void {
  const P = 0.62;
  const nx = Math.max(1, Math.round((b[1] - b[0] - 0.3) / P));
  const ny = Math.max(1, Math.round((b[3] - b[2] - 0.3) / P));
  const cx0 = (b[0] + b[1]) / 2;
  const cy0 = (b[2] + b[3]) / 2;
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const x = b[0] + 0.15 + (i + 0.5) * ((b[1] - b[0] - 0.3) / nx) + (hash(i, j, 571) - 0.5) * 0.08;
      const y = b[2] + 0.15 + (j + 0.5) * ((b[3] - b[2] - 0.3) / ny) + (hash(i, j, 572) - 0.5) * 0.08;
      void cx0;
      void cy0;
      const r = 0.22 + hash(i, j, 573) * 0.05;
      const hgt = T(10 + hash(i, j, 574) * 4);
      const z = T(Z2);
      const seed = i * 31 + j * 7 + Math.floor(b[0] * 13);
      list.push({
        d: x + y,
        draw: () => solid(p, boundsOf(x, y, r + 0.05, Z2, Z2 + 18), x + y - 0.6, x + y + 0.6, [{
          sdf: above(ellipsoid(x, y, z, r, hgt), z),
          paint: (wx, wy, wz, _n, lit, px, py) => {
            // (roses on the bush's upper, lit side, in pairs of pixels; leaves elsewhere)
            const bloom = hash((px >> 1) + seed, py >> 1, 575);
            if (lit > 0.1 && bloom > 0.72) return PAL.rose[bloom > 0.9 ? 4 : lit > 0.5 ? 3 : 2];
            if (lit <= 0.1 && bloom > 0.86) return PAL.rose[1];
            void wx;
            void wy;
            void wz;
            return PAL.box[Math.max(1, Math.min(3, toneOf(lit, px, py)))];
          },
        }]),
      });
    }
  }
}
/** A clipped yew cone, standing on the ground at height z0. */
function yewCone(p: Px, x: number, y: number, z0: number): void {
  const R = PAL.yew;
  const b = T(z0);
  const h = T(64);
  solid(p, boundsOf(x, y, 0.46, z0, z0 + 66), x + y - 0.7, x + y + 0.7, [{
    sdf: cone(x, y, b, 0.42, h),
    paint: (_x, _y, z, _n, lit, px, py) => {
      let k = toneOf(lit, px, py, [0.7, 0.35, -0.05, -0.45]);
      // (clipped close: clumps a step lighter or darker)
      const cl = hash(Math.floor((px + (Math.floor(py / 3) % 2) * 2) / 4), Math.floor(py / 3), 581);
      if (cl < 0.22) k -= 1;
      else if (cl > 0.9) k += 1;
      if (z - b < T(4)) k -= 1;
      return R[ck(Math.min(k, 4))];
    },
  }]);
}

/** THE FOUNTAIN: a round basin of stone, its water still (the Hush), a pedestal, the stone swan on it with its wings raised. */
function fountain(p: Px): void {
  const { x, y, r } = FOUNTAIN;
  const b = T(Z2);
  const R = PAL.stone;
  const stone: Part['paint'] = (_x, _y, _z, _n, lit, px, py) => R[Math.max(1, toneOf(lit, px, py))];
  const parts: Part[] = [
    // the basin's wall, its lip lit
    { sdf: ring(x, y, r - 0.2, r, b, b + T(16)), paint: (_x, _y, z, n, lit, px, py) => (n[2] > 0.7 ? R[z > b + T(15) && lit > 0.5 ? 4 : 3] : stone(_x, _y, z, n, lit, px, py, false)) },
    // its water, still: the sky's one colour, a darker ring by the wall, the pedestal's likeness
    {
      sdf: cyl(x, y, r - 0.2, b, b + T(12)),
      paint: (wx, wy, _z, _n, _lit, px, py) => {
        const d = Math.hypot(wx - x, wy - y);
        if (d > r - 0.3) return PAL.water[1];
        // (the pedestal's likeness, below it: the column upside down, and the sky)
        const [sx] = at(x, y, 0);
        if (Math.abs(px + 0.5 - sx) < 9 && wx + wy > x + y) return mixC(R[1], PAL.water[1], 0.45);
        const run = Math.floor((px + 13 * (py % 5)) / 14);
        if (hash(run, py, 591) > 0.9 && (py & 1) === 0) return PAL.water[3];
        return PAL.water[2];
      },
    },
    // the pedestal: a foot, a column, a cap
    { sdf: cyl(x, y, 0.32, b, b + T(18)), paint: stone },
    { sdf: cyl(x, y, 0.2, b + T(18), b + T(52)), paint: stone },
    { sdf: cyl(x, y, 0.3, b + T(52), b + T(58)), paint: stone },
  ];
  const [, sy0] = at(x, y, Z2);
  solid(p, [at(x, y)[0] - r * 45.3 - 2, sy0 - 62, at(x, y)[0] + r * 45.3 + 2, sy0 + r * 22.7 + 4], x + y - r * 1.42 - 0.1, x + y + r * 1.42 + 0.1, parts);
  // the stone swan, in game pixels (two picture pixels each)
  const s = statueSwan();
  const [sx, sy] = at(x, y, Z2 + 58);
  for (let j = 0; j < s.px.h; j++) for (let i = 0; i < s.px.w; i++) {
    const c = s.px.get(i, j);
    if (c) p.set(Math.round(sx) - s.ax + i, Math.round(sy) - s.ay + j + 2, c);
  }
}

// =================================================================================================
// THE ROSE ARBOURS: iron hoops over a walk, a tunnel of them, grown over with roses

/**
 * An arbour over a walk: three iron hoops across it, 0.8 tiles apart from a0 along `along` (the walk's way), spanning b0
 * to b1 across it, each a post either side and an arch over; climbing roses twined thin up the posts and thick over the
 * arches and the top between them, so the arches and the way under them show; roses out on its lit side.
 */
function arbour(p: Px, along: 'x' | 'y', a0: number, _a1: number, b0: number, b1: number, z0: number, seed: number): void {
  interface Clump { x: number; y: number; z: number; r: number }
  const clumps: Clump[] = [];
  const hoops = [a0, a0 + 0.8, a0 + 1.6];
  const half = (b1 - b0) / 2;
  const mid = (b0 + b1) / 2;
  const post = 46;
  const arch = half * KZ;
  const pt = (a: number, b: number, z: number): Clump => {
    const q = along === 'x' ? [a, b, z] : [b, a, z];
    return { x: q[0], y: q[1], z: q[2], r: 0 };
  };
  /** A point of a hoop: up its first post (t 0 to 1), over the arch (1 to 2), down the other post (2 to 3). */
  const hoopAt = (t: number): [number, number] => {
    if (t < 1) return [b0, z0 + t * post];
    if (t > 2) return [b1, z0 + (3 - t) * post];
    const ang = Math.PI - (t - 1) * Math.PI;
    return [mid + Math.cos(ang) * half, z0 + post + Math.sin(ang) * arch];
  };
  hoops.forEach((a, i) => {
    // (up the posts, a little clump every few pixels, twining, thinning toward the foot)
    for (const side of [0, 2]) {
      for (let k = 0; k < 7; k++) {
        const t = side === 0 ? 0.12 + k * 0.13 : 2.0 + k * 0.13;
        if (hash(i * 9 + side, k, seed) < (t < 0.4 || t > 2.6 ? 0.55 : 0.25)) continue;
        const [b, z] = hoopAt(t);
        clumps.push({ ...pt(a + (hash(i, k, seed + 3) - 0.5) * 0.12, b + (k % 2 ? 0.05 : -0.05), z), r: 0.075 + 0.03 * hash(i, k, seed + 1) });
      }
    }
    // (over the arch, close)
    for (let k = 0; k <= 12; k++) {
      const [b, z] = hoopAt(1 + k / 12);
      clumps.push({ ...pt(a, b, z), r: 0.1 + 0.035 * hash(i, k, seed + 2) });
    }
  });
  // (and over the top between the hoops: the roof of the arbour)
  for (let i = 0; i < hoops.length - 1; i++) {
    for (let j = 1; j <= 2; j++) {
      const a = hoops[i] + (j / 3) * 0.8;
      for (let k = 2; k <= 10; k++) {
        if (hash(i * 3 + j, k, seed + 4) < 0.2) continue;
        const [b, z] = hoopAt(1 + k / 12);
        clumps.push({ ...pt(a, b, z + 2), r: 0.095 + 0.03 * hash(i * 3 + j, k, seed + 5) });
      }
    }
  }
  // the iron, where it shows, then the leaves far to near
  for (const a of hoops) {
    for (let k = 0; k <= 300; k++) {
      const [b, z] = hoopAt((k / 300) * 3);
      const q = pt(a, b, z);
      const [sx, sy] = at(q.x, q.y, q.z);
      p.set(Math.round(sx), Math.round(sy), PAL.iron[1]).set(Math.round(sx) + 1, Math.round(sy), PAL.iron[0]);
    }
  }
  clumps.sort((c1, c2) => c1.x + c1.y + c1.z / 400 - (c2.x + c2.y + c2.z / 400));
  for (const c of clumps) leafClump(p, c.x, c.y, c.z, c.r, seed);
}
/** A round mass of rose leaves on the picture, lit on its upper left, roses out on it. */
function leafClump(p: Px, x: number, y: number, z: number, r: number, seed: number): void {
  const [cx, cy] = at(x, y, z);
  const rx = r * 45;
  const ry = r * 45;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const px = Math.round(cx) + dx;
      const py = Math.round(cy) + dy;
      const ex = (dx + 0.5) / rx;
      const ey = (dy + 0.5) / ry;
      // (its edge broken into leaves)
      const e = ex * ex + ey * ey + (hash(px >> 1, py >> 1, seed + 5) - 0.5) * 0.35;
      if (e > 1) continue;
      const nz = Math.sqrt(Math.max(0, 1 - ex * ex - ey * ey));
      const lit = -ex * 0.62 - ey * 0.55 + nz * 0.5;
      let k = lit > 0.55 ? 3 : lit > 0.1 ? 2 : 1;
      if (e > 0.82 && lit < 0.2) k = 0;
      const bloom = hash((px >> 1) + seed, py >> 1, 601);
      if (lit > 0.15 && bloom > 0.8) {
        p.set(px, py, PAL.rose[bloom > 0.93 ? 4 : lit > 0.5 ? 3 : 2]);
        continue;
      }
      if (lit <= 0.15 && bloom > 0.9) {
        p.set(px, py, PAL.rose[1]);
        continue;
      }
      if (hash(px, py, 603) < 0.18) k = Math.max(0, k - 1);
      p.set(px, py, PAL.box[k]);
    }
  }
}

// =================================================================================================
// THE ISLAND AND THE SWAN PAVILION

/** The island: a round lawn in a ring of stone, its kerb standing up out of the water. */
function island(p: Px, water: Uint8Array): void {
  const { x, y, r } = ISLAND;
  topAt(p, x - r, y - r, x + r, y + r, Z1, (wx, wy, px, py) => {
    const d = Math.hypot(wx - x, wy - y);
    if (d >= r) return null;
    water[py * W + px] = 0;
    const sh = shadowed(wx, wy, Z1);
    if (d > r - 0.28) return flagAt(wx, wy, px, py, Math.atan2(wy - y, wx - x) * r + 10, sh);
    if (d > 2.25 && d < 2.6) return gravelAt(wx, wy, px, py, sh);
    return lawnAt(wx, wy, px, py, sh);
  });
  // its kerb's face out of the water, on the side toward the eye: lit to the left, in shade to the right
  const [cx, cy] = at(x, y, Z1);
  const A = r * 32 * Math.SQRT2;
  const B = r * 16 * Math.SQRT2;
  for (let px = Math.ceil(cx - A); px <= Math.floor(cx + A); px++) {
    const t = (px + 0.5 - cx) / A;
    if (Math.abs(t) >= 1) continue;
    const yb = Math.round(cy + B * Math.sqrt(1 - t * t));
    const lit = -t;
    for (let v = 0; v < -LAKE.z; v++) {
      const py = yb + v;
      if (py < 0 || py >= H || px < 0 || px >= W) continue;
      water[py * W + px] = 0;
      const k = v === 0 ? (lit > 0 ? 4 : 2) : v === -LAKE.z - 1 ? 0 : lit > 0.35 ? 3 : lit > -0.3 ? 2 : 1;
      p.set(px, py, PAL.stone[k]);
    }
  }
}

/** THE SWAN PAVILION: a round temple on a stepped plinth, eight columns, a ring of stone over them, a dome of lead, a lantern. */
function pavilion(p: Px): void {
  const { x, y } = ISLAND;
  const R = PAL.stone;
  const stone: Part['paint'] = (_x, _y, _z, _n, lit, px, py, sh) => R[Math.max(sh ? 1 : 1, Math.min(sh ? 2 : 4, toneOf(lit, px, py)))];
  const COLS = 8;
  const CR = 1.72;
  const z = (h: number): number => T(h);
  const columns: Sdf = (wx, wy, wz) => {
    let d = Infinity;
    for (let k = 0; k < COLS; k++) {
      const a = (k / COLS) * Math.PI * 2 + Math.PI / 8;
      const cx = x + Math.cos(a) * CR;
      const cy = y + Math.sin(a) * CR;
      d = Math.min(d, cyl(cx, cy, 0.12, z(12), z(104))(wx, wy, wz), cyl(cx, cy, 0.17, z(12), z(16))(wx, wy, wz), cyl(cx, cy, 0.17, z(99), z(104))(wx, wy, wz));
    }
    return d;
  };
  const roof: Sdf = (wx, wy, wz) => Math.min(ring(x, y, 1.5, 1.98, z(104), z(122))(wx, wy, wz), above(ellipsoid(x, y, z(122), 1.86, z(52)), z(121))(wx, wy, wz));
  const parts: Part[] = [
    { sdf: cyl(x, y, 2.25, 0, z(6)), paint: stone },
    {
      sdf: cyl(x, y, 2.05, z(6), z(12)),
      paint: (wx, wy, wz, n, lit, px, py, sh) => {
        // its floor, under the dome in the dome's shade; a ring of darker flags
        if (n[2] > 0.7 && Math.hypot(wx - x, wy - y) < 1.95) {
          const d = Math.hypot(wx - x, wy - y);
          if (sh) return R[Math.abs(d - 1.1) < 0.05 ? 0 : 1];
          return R[Math.abs(d - 1.1) < 0.05 ? 1 : 3];
        }
        return stone(wx, wy, wz, n, lit, px, py, sh);
      },
    },
    { sdf: columns, paint: (wx, wy, wz, n, lit, px, py, sh) => {
      // (fluted: a darker line down each column's lit face)
      const k = toneOf(lit, px, py, [0.6, 0.25, -0.15, -0.5]);
      return R[Math.max(1, Math.min(sh ? 2 : 4, k))];
    } },
    { sdf: ring(x, y, 1.5, 1.98, z(104), z(122)), paint: (wx, wy, wz, n, lit, px, py, sh) => {
      // the ring over the columns: a cornice lit along its top, a frieze, a band of shade under
      const v = (z(122) - wz) * KZ;
      if (n[2] > 0.7) return R[4];
      if (v < 3) return R[lit > 0 ? 4 : 2];
      if (v > 15) return R[lit > 0 ? 2 : 1];
      return stone(wx, wy, wz, n, lit, px, py, sh);
    } },
    { sdf: above(ellipsoid(x, y, z(122), 1.86, z(52)), z(121)), paint: (wx, wy, wz, n, lit, px, py) => {
      // the lead dome: its ribs, eight of them, running up to the lantern; lit on its upper left
      const a = Math.atan2(wy - y, wx - x);
      const rib = Math.abs(((a / (Math.PI * 2)) * 16 + 0.5) % 2 - 1) < 0.08;
      let k = toneOf(lit, px, py, [0.72, 0.38, 0.0, -0.4]);
      if (rib) k = Math.min(4, k + 1);
      if (wz < z(126)) k = Math.max(0, k - 1);
      return PAL.lead[k];
    } },
    { sdf: cyl(x, y, 0.32, z(170), z(184)), paint: stone },
    { sdf: above(ellipsoid(x, y, z(184), 0.38, z(9)), z(183)), paint: (_x, _y, _z, _n, lit, px, py) => PAL.lead[toneOf(lit, px, py)] },
    { sdf: ellipsoid(x, y, z(196), 0.1, z(4)), paint: (_x, _y, _z, _n, lit, px, py) => R[Math.max(2, toneOf(lit, px, py))] },
  ];
  solid(p, boundsOf(x, y, 2.3, 0, 202), x + y - 3.4, x + y + 3.4, parts, (wx, wy, wz) => Math.min(roof(wx, wy, wz), columns(wx, wy, wz)));
}

/** THE DAWN'S MIST lying on the lake in long wisps, along it: pale, rose; a core and a thinner edge, crisp. */
const MISTS: readonly (readonly [number, number, number, number])[] = [
  [1.5, 18.6, 5.0, 0.55], [10.5, 19.9, 6.0, 0.5], [7.5, 16.1, 3.4, 0.32], [16.2, 16.3, 3.2, 0.3], [28.0, 20.4, 6.5, 0.55], [31.5, 16.6, 4.0, 0.35],
];
function mist(p: Px, water: Uint8Array): void {
  const z = LAKE.z + 2;
  for (const [cx, cy, a, b] of MISTS) {
    const cs = [at(cx - a, cy - b, z), at(cx + a, cy - b, z), at(cx + a, cy + b, z), at(cx - a, cy + b, z)];
    const x0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[0]))));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(...cs.map((c) => c[0]))));
    const y0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[1]))));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(...cs.map((c) => c[1]))));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        if (!water[py * W + px]) continue;
        const [x, y] = worldAt(px, py, z);
        const e = ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 + (fbm(x * 0.9, y * 2.6, 641) - 0.5) * 0.7;
        if (e >= 1) continue;
        const c = p.get(px, py);
        if (c) p.set(px, py, mixC(c, PAL.mist, e < 0.45 ? 0.34 : 0.17));
      }
    }
  }
}

/** What stands in the still water is there again in it, upside down about its waterline (`line`), darker, and only on the water. */
function reflect(p: Px, layer: Px, water: Uint8Array, line: number): void {
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      if (!layer.has(px, py)) continue;
      const ty = Math.round(2 * line - py);
      if (ty < 0 || ty >= H || !water[ty * W + px]) continue;
      // (now and then a row a pixel aside: the water is not quite glass)
      const shift = (ty - line) > 10 && hash(Math.floor(ty / 2), 0, 611) > 0.8 ? 1 : 0;
      const c = layer.get(px, py)!;
      if (px + shift < W && water[ty * W + px + shift]) p.set(px + shift, ty, mixC(mixC(c, PAL.water[2], 0.42), PAL.water[0], 0.18));
    }
  }
}
function blit(p: Px, layer: Px): void {
  for (let i = 0; i < W * H; i++) {
    if (layer.d[i * 4 + 3] === 0) continue;
    p.d[i * 4] = layer.d[i * 4];
    p.d[i * 4 + 1] = layer.d[i * 4 + 1];
    p.d[i * 4 + 2] = layer.d[i * 4 + 2];
    p.d[i * 4 + 3] = 255;
  }
}
/** A picture in game pixels laid onto the painting at two picture pixels each, its top left at (x, y). */
export function stamp(p: Px, s: Px, x: number, y: number, only?: (px: number, py: number) => boolean, tint?: (c: string) => string, flip = false): void {
  for (let j = 0; j < s.h; j++) {
    for (let i = 0; i < s.w; i++) {
      const c = s.get(i, flip ? s.h - 1 - j : j);
      if (!c) continue;
      const cc = tint ? tint(c) : c;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
        const px = x + i * 2 + a;
        const py = y + j * 2 + b;
        if (only && !only(px, py)) continue;
        p.set(px, py, cc);
      }
    }
  }
}

// =================================================================================================
// THE SWANS (game pixels): on the water, and the stone one of the fountain

function poly(s: Px, pts: readonly (readonly [number, number])[], f: (x: number, y: number) => Col): void {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const q of pts) {
    minY = Math.min(minY, q[1]);
    maxY = Math.max(maxY, q[1]);
  }
  for (let y = Math.floor(minY); y < Math.ceil(maxY); y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) {
        const c = f(x, y);
        if (c) s.set(x, y, c);
      }
    }
  }
}

/**
 * A SWAN ON THE WATER, its neck in an S, its wings arched over its back, a golden crown on its head (the book's); facing
 * left or right (the light from the left either way). Game pixels; its anchor the middle of its waterline.
 */
export function swanSprite(face: 1 | -1, crown = true): { px: Px; ax: number; ay: number } {
  const Wd = 28;
  const Hd = 24;
  const ax = 14;
  const ay = 21;
  const s = new Px(Wd, Hd);
  const C = SWAN;
  const F = (dx: number): number => ax + dx * face;
  // the body: a boat, the chest round at the front, the wings arched up over the back, the tail tipped up
  const body: [number, number][] = [[-8, 0], [-9.2, -1.2], [-9.4, -3], [-8.2, -4.4], [-6, -5.2], [-3, -6.4], [0, -8.6], [3, -9.6], [6, -9.4], [8.2, -8.2], [10.4, -7.4], [9.6, -5.6], [8.4, -3.2], [7.2, -1], [6, 0]].map(([x, y]) => [F(x) + (face < 0 ? 1 : 0), ay + y] as [number, number]);
  const topAt = (x: number): number => {
    // the body's top edge at a column (for its shading: lit near the top)
    for (let y = 0; y < Hd; y++) if (s.has(x, y)) return y;
    return ay;
  };
  poly(s, body, () => C.light);
  for (let x = 0; x < Wd; x++) {
    const t0 = topAt(x);
    for (let y = t0; y < ay; y++) {
      if (!s.has(x, y)) continue;
      const fr = (y - t0) / Math.max(1, ay - t0);
      const back = (x - ax) * face; // + toward the tail
      // (the light from the left: the left of it brighter; its top white; under, violet-grey)
      const leftSide = x < ax - 2;
      let c: string = fr < 0.3 ? C.white : fr < 0.65 ? C.light : fr < 0.9 ? C.shade : C.deep;
      if (!leftSide && fr >= 0.3 && fr < 0.65 && x > ax + 3) c = C.shade;
      if (leftSide && fr < 0.5) c = C.white;
      void back;
      s.set(x, y, c);
    }
  }
  // the wing's edge: a curve from the shoulder back to the tail, a line of shade under it; two feather lines
  const wingLine = (dx: number): number => -4.6 - 0.38 * (dx + 3) + 0.035 * (dx + 3) * (dx + 3);
  for (let dx = -3; dx <= 8; dx++) {
    const x = F(dx);
    const y = Math.round(ay + wingLine(dx));
    if (s.has(x, y)) s.set(x, y, C.shade);
  }
  for (const [dx, dy] of [[3, -7], [4, -7], [6, -6], [7, -6]]) if (s.has(F(dx), ay + dy)) s.set(F(dx), ay + dy, C.light);
  // its waterline: the seam, a deep indigo
  for (let dx = -8; dx <= 6; dx++) s.set(F(dx), ay - 1, dx > 2 ? C.seam : C.deep);
  // the neck: up from the chest in an S, two pixels thick, three at its foot
  const neck: [number, number][] = [[-7, -4], [-7.6, -6], [-8.2, -8], [-8.4, -10], [-8, -12], [-7.2, -13.6], [-6.6, -15]];
  for (let i = 0; i + 1 < neck.length; i++) {
    for (let t = 0; t <= 1; t += 0.2) {
      const nx = neck[i][0] + (neck[i + 1][0] - neck[i][0]) * t;
      const ny = neck[i][1] + (neck[i + 1][1] - neck[i][1]) * t;
      const X = Math.round(F(nx) - (face < 0 ? 0 : 0));
      const Y = Math.round(ay + ny);
      const thick = i < 2 ? 3 : 2;
      for (let k = 0; k < thick; k++) {
        const xx = face > 0 ? X + k : X - k;
        // (lit on its left, the light's side)
        const leftmost = face > 0 ? k === 0 : k === thick - 1;
        s.set(xx, Y, leftmost ? C.white : k === (face > 0 ? thick - 1 : 0) ? C.shade : C.light);
      }
    }
  }
  // the head, the beak forward and a little down, the eye; the crown
  const hx = F(-7.2);
  const hy = ay - 16;
  for (const [dx, dy, c] of [[-1, 0, 'w'], [0, 0, 'w'], [1, 0, 'l'], [2, 0, 's'], [-1, -1, 'w'], [0, -1, 'w'], [1, -1, 'l'], [-1, 1, 'l'], [0, 1, 'l'], [1, 1, 's']] as const) {
    const X = face > 0 ? hx + dx : hx - dx;
    s.set(X, hy + dy, c === 'w' ? (face > 0 ? C.white : dx > 0 ? C.white : C.light) : c === 'l' ? C.light : C.shade);
  }
  const fwd = (k: number): number => (face > 0 ? hx - k : hx + k);
  s.set(fwd(2), hy, C.beak).set(fwd(2), hy + 1, C.beak).set(fwd(3), hy + 1, C.beak).set(fwd(4), hy + 1, C.tip).set(fwd(3), hy + 2, C.tip);
  s.set(fwd(1), hy - 0, C.eye);
  if (crown) {
    for (let k = -1; k <= 2; k++) s.set(face > 0 ? hx + k - 1 : hx - k + 1, hy - 2, k >= 1 ? C.crownSh : C.crown);
    for (const k of [-1, 0.5, 2]) s.set(face > 0 ? hx + Math.round(k) - 1 : hx - Math.round(k) + 1, hy - 3, C.crown);
  }
  return { px: s, ax, ay };
}

/**
 * THE STONE SWAN of the fountain (picture pixels, finer than a figure: it is part of the place): rearing on its rock, its
 * near wing raised high in a fan, the far one behind it, its neck up in an S and its head turned to the left; weathered,
 * lichen in its hollows. Its anchor the middle of its foot.
 */
export function statueSwan(): { px: Px; ax: number; ay: number } {
  const s = new Px(44, 48);
  const ax = 20;
  const ay = 46;
  const S = STATUE;
  const P = (pts: number[][]): [number, number][] => pts.map(([x, y]) => [ax + x, ay + y] as [number, number]);
  // its rock
  poly(s, P([[-8, 0], [-9, -2], [-6, -4], [3, -4], [9, -3], [10, 0]]), (x, y) => (y < ay - 2 ? (x < ax ? S.body : S.shade) : S.deep));
  // the far wing, behind: in shade, its feathers' ends notched
  poly(s, P([[7, -14], [11, -23], [15, -31], [19, -37], [22, -39], [22, -35], [24, -33], [22, -30], [24, -27], [22, -24], [24, -21], [21, -18], [22, -14], [16, -11]]), (x, y) => {
    const lx = x - ax;
    const ly = y - ay;
    if ((ly + 38) % 5 === 0 && lx > 14) return S.deep;
    return lx > 20 ? S.deep : S.shade;
  });
  // the body: breast forward, tail tipped up behind
  poly(s, P([[-10, -9], [-9, -6], [-6, -4], [0, -3], [8, -4], [13, -6], [17, -10], [16, -12], [11, -12], [3, -14], [-4, -14], [-8, -12]]), (x, y) => {
    const lx = x - ax;
    const ly = y - ay;
    if (ly < -11) return S.lit;
    if (ly < -7) return lx < 4 ? S.body : S.shade;
    return lx < -4 ? S.shade : S.deep;
  });
  // the near wing, raised in a fan: its leading edge lit, rows of coverts, the long feathers' tips notched against the sky
  poly(s, P([[-5, -13], [-4, -19], [-2, -26], [1, -33], [5, -39], [9, -43], [12, -42], [11, -39], [14, -37], [13, -34], [16, -32], [15, -29], [18, -27], [16, -24], [18, -21], [15, -18], [16, -15], [8, -12]]), (x, y) => {
    const lx = x - ax;
    const ly = y - ay;
    // (how far in from the leading edge, the line from (-5, -13) to (9, -43))
    const lead = lx + 5 - (-(ly + 13) * 14) / 30;
    if (lead < 2.2) return S.lit;
    // (the long feathers' ends, toward its trailing edge, each its own tip in shade)
    if (lead > 11) return (ly + 44) % 3 === 0 ? S.deep : S.shade;
    if ((ly + 44) % 4 === 0 && lead > 3.5) return S.shade;
    return lead > 7.5 ? S.shade : lead < 4 ? S.lit : S.body;
  });
  // the neck: up from the breast in an S, three pixels thick, lit on its left
  const neck: [number, number][] = [[-9, -12], [-11, -17], [-12, -22], [-11, -27], [-9, -31], [-9, -34]];
  for (let i = 0; i + 1 < neck.length; i++) {
    for (let t = 0; t <= 1; t += 0.1) {
      const X = Math.round(ax + neck[i][0] + (neck[i + 1][0] - neck[i][0]) * t);
      const Y = Math.round(ay + neck[i][1] + (neck[i + 1][1] - neck[i][1]) * t);
      s.set(X - 1, Y, S.lit).set(X, Y, S.body).set(X + 1, Y, S.shade);
      if (i === 0) s.set(X + 2, Y, S.shade);
    }
  }
  // the head, turned to the left, the beak out; the eye a hollow
  for (let dy = -3; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if ((dx / 3.4) ** 2 + (dy / 2.6) ** 2 > 1) continue;
      s.set(ax - 10 + dx, ay - 36 + dy, dx + dy < -1 ? S.lit : dx + dy < 2 ? S.body : S.shade);
    }
  }
  poly(s, P([[-13, -38], [-18, -35.5], [-17, -34.5], [-13, -34.5]]), (_x, y) => (y < ay - 36 ? S.body : S.shade));
  s.set(ax - 11, ay - 37, S.deep);
  // (lichen, a little, in the hollows)
  for (let k = 0; k < 14; k++) {
    const x = Math.floor(hash(k, 1, 651) * 44);
    const y = Math.floor(hash(k, 2, 651) * 48);
    const c = s.get(x, y);
    if (c && (c === S.shade || c === S.body)) s.set(x, y, S.lichen).set(x + 1, y, s.has(x + 1, y) ? S.lichen : null);
  }
  return { px: s, ax, ay };
}

/** Where the eleven swans are on the lake, and which way each faces: in a long loose line, like a white ribbon. */
export const SWANS: readonly (readonly [number, number, 1 | -1])[] = [
  [4.2, 16.9, 1], [6.3, 17.2, 1], [8.4, 17.0, 1], [10.6, 17.5, 1], [12.9, 17.7, 1], [15.0, 17.4, 1],
  [26.0, 17.0, -1], [28.1, 17.4, -1], [30.4, 17.2, -1], [13.4, 20.6, -1], [9.0, 21.0, 1],
];

/** The swans on the lake, each with its likeness under it in the still water. */
export function paintSwans(g: Garden): void {
  const order = [...SWANS].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [x, y, f] of order) {
    const sw = swanSprite(f);
    const [sx, sy] = at(x, y, LAKE.z);
    const X = Math.round(sx) - sw.ax * 2;
    const Y = Math.round(sy) - sw.ay * 2;
    // its likeness: upside down about its waterline, darker, on the water only
    const line = Math.round(sy);
    stamp(g.p, sw.px, X, line - (sw.px.h - sw.ay) * 2 + 0, (px, py) => py >= line && g.water[py * W + px] === 1, (c) => mixC(mixC(c, PAL.water[2], 0.5), PAL.water[0], 0.15), true);
    stamp(g.p, sw.px, X, Y);
    // (a faint wake of light behind it)
    for (let k = 0; k < 6; k++) {
      const wx = Math.round(sx) - f * (16 + k * 4);
      const wy = Math.round(sy) + 2 + (k % 2);
      if (wy < H && wx >= 0 && wx < W && g.water[wy * W + wx]) g.p.set(wx, wy, PAL.water[3]).set(wx + 1, wy, PAL.water[3]);
    }
  }
}
