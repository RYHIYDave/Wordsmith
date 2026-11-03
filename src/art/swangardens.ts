// FLOOR 16, THE SWAN GARDENS: ITS GROUND (art/terrain.ts paints it from the level's own tiles). ACT 2, PART TWO, THE
// HIGH CITY. A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat, 28 Oct 2026), level
// 16, THE SWAN GARDENS: "Through the shut gates and up the hill through the palace's terraced gardens."; its layout
// "open, like the Millrace: terraces stepping up the hill joined by stairs, clipped hedges and a hedge maze, rose
// arbours, still fountains, and a long lake with a pavilion on an island"; its hazards "nettle beds that sting and slow
// whoever walks through them; the lake's deep water"; its palette "Dawn rose, swan white, deep hedge green". Its first
// look, painted (src/dev/garden_paint.ts), to the art chat, 28 Oct: “Yes, go on (Recommended)”, offered as: next, make the
// ground and its pieces game-ready, then the swans as enemies.
//
// WHAT IT IS, at dawn, the light low from the upper left:
// - THE FLOOR: clipped lawn mown in broad stripes; gravel walks, raked, pale and rose in the dawn; flags where the level
//   paves (a terrace's coping, round a fountain); the bare earth of a bed; the NETTLES, a hazard, dark and toothed and
//   wine-stemmed, their stinging hairs catching the light; a kerb of dressed stone along the lake.
// - ITS WALLS ARE CLIPPED YEW (the maze's and the hedges round the gardens): every tile that is neither floor nor lake
//   is yew standing a man's height and more (HEDGE_H), its faces close and dark, lit to the lower left, its top flat and
//   clipped, its near edge catching the dawn; a tile and more back from the floor, past the hedge, the dark crowns of
//   the woods on the hill. Near hedges are cut away as the game cuts them (his rule for every outdoor floor), their
//   shadow left lying across the floor where the light throws it.
// - THE LAKE is the floor's drop (art/terrain.ts): the lawn ends at a kerb, its face standing out of the still water;
//   `paintSwanGardens` paints the water into the drop: the dawn's one colour in it (seen all from the one height),
//   faint stirs, long thin lines of light, the kerb's likeness under it, wisps of mist lying on it.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left; three tones or so a material; a step quieter than the
// figures, every colour under the dullest word's (Colour 4, through art/act2_quiet.ts); nothing cyan, no pink, nothing
// glowing (Colour 3: the dawn's rose is a light on things, never a glow); the dark cool and deep; crisp pixels.
//
// FOR THE MAIN CHAT: `swanGardensTerrain(floor, land)` makes the floor's ground from what only the level knows (`SwanLand`:
// where the lake is, the walks, the paving, the beds, the nettles; each optional), the hedges throwing their shadows;
// `paintSwanGardens(T, x0, y0, w, h)` paints a piece of it as `paintTerrain` does, the lake's water in it (every pixel
// opaque). Two pieces side by side are one picture. The terraces are not in the ground: the game walks on one level,
// and a terrace's wall is a piece (art/floor16.ts) laid along a row of tiles that are floor, its face filling the row.

import type { Floor } from '../game/types';
import { T_FLOOR } from '../game/types';
import { HHP, HWP, TK, fbm, paintTerrain, terrainOf, vnoise, worldOf } from './terrain';
import type { RGB, Terrain, TerrainLook, TerrainPiece } from './terrain';
import { hash } from './kit';
import { quietRGB, quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cl = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const ck = (k: number): number => cl(Math.round(k), 0, 4);

// ---------------------------------------------------------------------------------------------------
// THE PALETTE (as the first look he said yes to): dawn rose, swan white, deep hedge green

/** Clipped lawn, in the light and in shade: seam, shade, body, light, lit edge. */
export const SG_LAWN = ['#17211c', '#22302a', '#2e3e30', '#40503a', '#6b6a56'].map(hex);
export const SG_LAWN_SH = ['#11171b', '#182224', '#1f2b28', '#26352e', '#2f3e36'].map(hex);
/** Raked gravel, pale and rose in the dawn; and in shade. */
export const SG_GRAVEL = ['#37303d', '#584b56', '#77666c', '#968182', '#b9a098'].map(hex);
export const SG_GRAVEL_SH = ['#1f1d31', '#2b293e', '#363449', '#423f53', '#4f4b5e'].map(hex);
/** Dressed limestone, its lit edge rose: the kerbs, the flags. */
export const SG_STONE = ['#2c2838', '#574e62', '#807385', '#ab9aa0', '#d8bdb3'].map(hex);
/** Yew, deep hedge green. */
export const SG_YEW = ['#0c1614', '#13201b', '#1a2c22', '#26392b', '#474e3e'].map(hex);
/** The bare earth of a bed. */
export const SG_EARTH = ['#18131d', '#251d27', '#332830', '#41343a', '#524448'].map(hex);
/** Nettles: dark, cold; their stems a dark wine; their stinging hairs pale. */
export const SG_NETTLE = ['#0d1510', '#17241a', '#223322', '#30452b', '#4a5c3a'].map(hex);
const STEM: RGB = hex('#3a2b37');
const HAIR: RGB = hex('#a3a697');
/** The still lake holding the dawn: deep, shade, body, light, its rose; a glint; the mist on it. */
export const SG_WATER = ['#25263c', '#3b3a55', '#4e4a67', '#655c78', '#8f7983'].map(hex);
const MIST: RGB = hex('#9c8a97');
/** The woods on the hill past the hedges. */
export const SG_WOODS = ['#090f0e', '#0e1715', '#141f1b', '#1a2922', '#22332a'].map(hex);
/** The deep dark past everything. */
const DEEP: RGB = hex('#07080d');

/** How tall the yew stands (picture pixels): over a man's head (the knight 58). */
export const HEDGE_H = 60;
/** How far under the lawn the lake's water lies (picture pixels): the kerb's face out of the water, its top 6 of it stone. */
export const LAKE_DOWN = 10;
const KERB_FACE = 6;
/** The kerb along the lake, in tiles. */
const KERB = 0.3;
/** The dawn: from the upper left, low; what stands throws its shadow this far for every picture pixel of its height (tiles). */
const SLOPE = 34;

/** Above a threshold, with a checkered pixel or two where it is near it (crisp, never a smear). */
function over(t: number, thr: number, px: number, py: number, band = 0.02): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > [[0.125, 0.625], [0.875, 0.375]][py & 1][px & 1];
}

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

export interface SwanLand {
  /** Whether a tile is the lake (its deep water: the ground falls away under the lawn's kerb). Asked of tiles that are not floor. */
  lake?: (tx: number, ty: number) => boolean;
  /** Whether a place is a gravel walk. */
  walk?: (x: number, y: number) => boolean;
  /** Whether a place is paved with flags (a terrace's coping, a fountain's apron, a stair's foot). */
  paved?: (x: number, y: number) => boolean;
  /** Whether a place is the bare earth of a bed (its roses stand in it, pieces). */
  bed?: (x: number, y: number) => boolean;
  /** How far into a bed of nettles a place is, in tiles (above 0, in it; the painter rags its edge). */
  nettles?: (x: number, y: number) => number;
}

// ---------------------------------------------------------------------------------------------------
// THE FLOOR

function lawn(x: number, y: number, px: number, py: number, sh: boolean): RGB {
  const R = sh ? SG_LAWN_SH : SG_LAWN;
  // (mown in broad stripes; a blade's tip here and there in the dawn)
  const stripe = (((Math.floor((x + 0.3 * Math.floor(y / 6)) / 1.4) % 2) + 2) % 2) === 0;
  let k = stripe ? 2 : 3;
  const g = hash(px >> 1, py, 1601);
  if (g < 0.12) k -= 1;
  else if (g > 0.93 && !sh && !stripe) k = 4;
  if (over(fbm(x * 0.7, y * 0.7, 1603), 0.68, px, py)) k -= 1;
  return R[ck(k)];
}
function gravel(x: number, y: number, px: number, py: number, sh: boolean): RGB {
  const R = sh ? SG_GRAVEL_SH : SG_GRAVEL;
  const g = hash(px >> 1, py, 1611);
  let k = g < 0.14 ? 2 : g > 0.9 ? 4 : 3;
  if (over(fbm(x * 1.3, y * 1.3, 1613), 0.66, px, py)) k -= 1;
  return R[ck(k)];
}
/** Flags of stone in courses along x, each 0.7 long and 0.5 wide, the courses broken joint; a seam between, a flag's tone its own. */
function flags(x: number, y: number, px: number, py: number, sh: boolean): RGB {
  const row = Math.floor(y / 0.5);
  const u = x / 0.7 + (row % 2) * 0.5;
  const ju = u - Math.floor(u);
  const jv = y / 0.5 - row;
  if (ju < 0.05 || jv < 0.08) return SG_STONE[sh ? 0 : 1];
  let k = hash(Math.floor(u), row, 1621) < 0.3 ? 2 : 3;
  if (hash(px >> 1, py, 1623) > 0.94) k = 4;
  if (sh) k -= 2;
  return SG_STONE[ck(k)];
}
function earth(px: number, py: number, sh: boolean): RGB {
  const e = hash(px >> 1, py, 1625);
  return SG_EARTH[sh ? 1 : e < 0.2 ? 1 : e > 0.9 ? 3 : 2];
}
/**
 * NETTLES, as the ground under them shows them (the standing plants are drawn with them, art/floor16.ts): a close mass of
 * toothed leaves in pairs, each leaf's tip lit, the stinging hairs pale on them, the stems a dark wine between.
 */
function nettle(px: number, py: number, sh: boolean): RGB {
  const R = SG_NETTLE;
  const cy = Math.floor(py / 4);
  const off = (cy % 2) * 3;
  const cx = Math.floor((px + off) / 6);
  const lx = px + off - cx * 6;
  const ly = py - cy * 4;
  const h = hash(cx, cy, 1631);
  const side = h < 0.5 ? 1 : -1;
  let k: number;
  const half = ly === 0 ? 1 : ly === 1 ? 2.5 : ly === 2 ? 2 : 0.5;
  const mid = 2.5 + side * (ly - 1) * 0.5;
  const d = Math.abs(lx - mid);
  if (d <= half) {
    k = ly === 0 ? 3 : 2;
    if (d > half - 1 && (lx + ly) % 2 === 0) k += 1;
    if (d < 0.6 && ly > 0) k = 1;
    if (ly === 0 && h > 0.7) k = 4;
  } else if (ly === 3 && hash(cx, cy, 1633) < 0.35) return sh ? R[0] : STEM;
  else k = 0;
  if (sh) k -= 1;
  if (!sh && k >= 2 && hash(px >> 1, py, 1635) > 0.955) return HAIR;
  return R[ck(k)];
}

// ---------------------------------------------------------------------------------------------------
// THE YEW, AND THE WOODS PAST IT

/** Clipped yew on a face: dense, in clumps, lit to the lower left (`shade` 1) and dark to the lower right (-1), darkest at its foot. */
function yewFace(shade: number, v: number, px: number, py: number): RGB {
  const R = SG_YEW;
  const cl2 = hash(Math.floor((px + (Math.floor(py / 3) % 2) * 2) / 4), Math.floor(py / 3), 1641);
  let k = shade > 0.35 ? 3 : shade > -0.35 ? 2 : 1;
  if (cl2 < 0.3) k -= 1;
  else if (cl2 > 0.85) k += 1;
  if ((px + py) % 4 === 0 && hash(px, py, 1642) < 0.3) k -= 1;
  const fromFoot = v;
  if (fromFoot < 6) k -= 1;
  if (fromFoot < 2) k -= 1;
  return R[ck(k)];
}
/** The woods' crowns, round and dark, lit a little on their upper left, darker further back. */
function woods(x: number, y: number, px: number, py: number, far: number): RGB {
  const R = SG_WOODS;
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
    const cx = (i + 0.25 + 0.5 * hash(i, j, 1651)) * P;
    const cy = (j + 0.25 + 0.5 * hash(i, j, 1652)) * P;
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
  if (over(fbm(x * 3, y * 3, 1655), 0.62, px, py)) k -= 1;
  k -= Math.floor(far * 3);
  const c = R[ck(k)];
  return far > 0.5 ? mixc(c, DEEP, Math.min(1, (far - 0.5) * 1.6)) : c;
}
/** The top of the yew, clipped flat, close; and a tile and more back, the woods. */
function top(x: number, y: number, px: number, py: number, climb: number): RGB {
  if (climb > 0.34) return woods(x, y, px, py, cl((climb - 0.34) / 0.66, 0, 1));
  const R = SG_YEW;
  const g = hash(px >> 1, py, 1661);
  const k = g < 0.2 ? 2 : g > 0.92 ? 4 : 3;
  return R[k];
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

/** The ground's own reckoning of where the hedges throw their shadow (filled in once the ground is made). */
interface Ref {
  T: Terrain | null;
}
function lookOf(land: SwanLand, ref: Ref): TerrainLook {
  const lake = land.lake;
  const nearLake = (x: number, y: number): boolean => {
    if (!lake) return false;
    for (const [dx, dy] of [[KERB, 0], [-KERB, 0], [0, KERB], [0, -KERB], [KERB * 0.7, KERB * 0.7], [-KERB * 0.7, KERB * 0.7], [KERB * 0.7, -KERB * 0.7], [-KERB * 0.7, -KERB * 0.7]]) {
      const tx = Math.floor(x + dx);
      const ty = Math.floor(y + dy);
      const T = ref.T;
      if (T) {
        const f = T.floor;
        if (tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR) continue;
      }
      if (lake(tx, ty)) return true;
    }
    return false;
  };
  /** In the shadow of the yew: the way back toward the low sun, along (-1, +1), passes into a hedge under its height. */
  const shaded = (x: number, y: number): boolean => {
    const T = ref.T;
    if (!T) return false;
    for (let t = 0.12; t * SLOPE < HEDGE_H; t += 0.12) {
      const qx = x - t;
      const qy = y + t;
      if (!T.ground(qx, qy) && !T.drop(qx, qy)) return true;
    }
    return false;
  };
  return quietTerrain({
    rise: HEDGE_H,
    near: 30,
    // (clipped: its edges straight and its corners barely rounded)
    round: 0.18,
    rag: 0.05,
    fine: 0.02,
    seed: 161,
    climb: 3,
    turnOver: 0.3,
    floor: (x, y, px, py) => {
      const sh = shaded(x, y);
      if (nearLake(x, y)) return flags(x, y, px, py, sh);
      if (land.nettles) {
        const n = land.nettles(x, y);
        if (n + 0.5 * (fbm(x * 1.8, y * 1.8, 1671) - 0.4) > 0) return nettle(px, py, sh);
      }
      if (land.paved && land.paved(x, y)) return flags(x, y, px, py, sh);
      if (land.bed && land.bed(x, y)) return earth(px, py, sh);
      if (land.walk && land.walk(x, y)) return gravel(x, y, px, py, sh);
      return lawn(x, y, px, py, sh);
    },
    face: (shade, v, px, py) => yewFace(shade, v, px, py),
    top: (x, y, px, py, _back, climb) => top(x, y, px, py, climb),
    nearFace: (v, px, py) => yewFace(-1, HEDGE_H - v, px, py),
    // (the yew's top edge over a far face, catching the dawn)
    brow: () => SG_YEW[4],
    foot: [0.3, 0.16],
    nearShadow: { reach: 0.7, dark: [0.26, 0.16] },
    drop: lake ? (tx, ty) => lake(tx, ty) : undefined,
    // (the kerb's top edge over the water, lit)
    lip: () => SG_STONE[4],
    // the kerb's face out of the water: dressed stone, its foot wet and dark; under it, its likeness in the water
    hang: {
      tall: LAKE_DOWN,
      at: (v, px, _py, shade) => {
        if (v < KERB_FACE) {
          if (v === 0) return SG_STONE[shade > -0.3 ? 4 : 2];
          if (v === KERB_FACE - 1) return SG_STONE[0];
          const joint = (((px + 3) % 22) + 22) % 22 === 0;
          return SG_STONE[joint ? 1 : shade > 0.3 ? 3 : shade > -0.3 ? 2 : 1];
        }
        // (its likeness, upside down, darker, in the water's colour)
        const m = 2 * KERB_FACE - 1 - v;
        const st = m <= 0 ? SG_STONE[1] : m >= KERB_FACE - 1 ? SG_STONE[3] : SG_STONE[2];
        return mixc(mixc(st, SG_WATER[2], 0.45), SG_WATER[0], 0.15);
      },
    },
  });
}

/** THE SWAN GARDENS' LOOK, for a level's own lake, walks, paving, beds and nettles (without the hedges' shadows: see `swanGardensTerrain`). */
export function swanGardensLook(land: SwanLand = {}): TerrainLook {
  return lookOf(land, { T: null });
}
/** THE SWAN GARDENS' GROUND for a floor: its look, the hedges throwing their shadows across it. */
export function swanGardensTerrain(floor: Floor, land: SwanLand = {}): Terrain {
  const ref: Ref = { T: null };
  const T = terrainOf(floor, lookOf(land, ref));
  ref.T = T;
  return T;
}

// ---------------------------------------------------------------------------------------------------
// THE LAKE'S WATER, painted into the drop

/** THE STILL WATER at a picture pixel (its world point LAKE_DOWN under the lawn's height): the dawn's one colour, faint stirs, lines of light, mist. */
export function lakeWater(px: number, py: number): RGB {
  const R = SG_WATER;
  const [x, y] = worldOf(px, py - LAKE_DOWN);
  let k = 2;
  const stir = fbm(x * 0.35, y * 1.1, 1681);
  if (over(stir, 0.62, px, py)) k = 1;
  else if (!over(stir, 0.36, px, py)) k = 3;
  // (long lines of light across it, a pixel high)
  const run = Math.floor((px + 37 * (((py % 7) + 7) % 7)) / 26);
  if (hash(run, py, 1683) > 0.94 && (py & 1) === 0) k = hash(run, py, 1685) > 0.5 ? 4 : 3;
  let c = R[ck(k)];
  // (the dawn's mist lying on it in long wisps)
  const m = fbm(px / 170, py / 13, 1687) + 0.25 * (vnoise(px / 40, py / 6, 1689) - 0.5);
  if (m > 0.7) c = mixc(c, MIST, 0.34);
  else if (m > 0.62) c = mixc(c, MIST, 0.17);
  return c;
}

/**
 * PAINT A PIECE OF THE SWAN GARDENS' GROUND as `paintTerrain` does (picture pixels from (x0, y0), w by h), the lake's water
 * in it where the ground falls away: every pixel opaque. Two pieces side by side are one picture.
 */
export function paintSwanGardens(T: Terrain, x0: number, y0: number, w: number, h: number): TerrainPiece {
  const p = paintTerrain(T, x0, y0, w, h);
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      if (p.kind[i] !== TK.Drop) continue;
      const col = quietRGB(lakeWater(x0 + c, y0 + r));
      p.rgba[i * 4] = col[0];
      p.rgba[i * 4 + 1] = col[1];
      p.rgba[i * 4 + 2] = col[2];
      p.rgba[i * 4 + 3] = 255;
    }
  }
  return p;
}

/** Picture pixels across and down half a tile (for whoever lays the ground). */
export const SG_HALF: readonly [number, number] = [HWP, HHP];
