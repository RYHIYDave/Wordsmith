// FLOOR 18, THE GLASS GALLERY: ITS GROUND (art/terrain.ts paints it from the level's own tiles). ACT 2, PART TWO, THE
// HIGH CITY. A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat; his "Yes, go
// (Recommended)"), level 18: "The Glass Gallery. The queen's wing: long galleries of mirrors and a great glasshouse on the
// roof."; its layout "indoors and up: mirrored halls and dressing rooms, a chapel of stained glass, and the glasshouse of
// dead orchids under a roof of panes"; its hazards "mirrors that crack and burst into shards when anything strikes near
// them; skylights to fall through to the floor below"; its palette "Silver, cold blue glass, dark violet"; its boss the
// Queen, "Her floor is the Mirror Hall". Its story from the Brothers Grimm, "Snow White" (1812), drawn only from the book.
// Its first look, painted: src/dev/gallery_paint.ts.
//
// WHAT IT IS, room by room (`GG_ZONE`), by day, the dark coming in from the corners as in every dungeon:
// - THE GALLERIES (the long halls of mirrors): a floor of pale silver-grey marble in squares a tile across, a small square
//   of dark violet at each corner, a border of violet along the walls; where the level lays one, a violet runner down the
//   middle. Their walls: a dado of grey marble, violet silk above it woven in a damask, a cornice of grey marble at the
//   top; the silk torn here and there and hanging, or a paler ghost where a mirror once hung. THE MIRRORS ARE PIECES
//   (art/floor18.ts): they crack and burst (the hazard), so the ground has none of its own.
// - THE MIRROR HALL (the Queen's): the galleries' walls; its floor a bold chequer of silver and violet marble a tile
//   across, a fillet of old gilt between.
// - THE DRESSING ROOMS: a fitted carpet of deep violet, a small lozenge in it, a border; their walls panelled, violet silk
//   in frames of thin gilt moulding over a painted dado.
// - THE CHAPEL: great flags of a pale cool stone, a ledger stone here and there; its walls of the same stone in courses,
//   tall lancets of stained glass in them lit by the day (the book's first page: a queen sewing at a window framed in
//   ebony, the snow, three drops of blood: "red as blood, white as snow, black as ebony"). The day through the glass is
//   colour, never a glow (Colour 3).
// - THE GLASSHOUSE (on the roof): worn flags, iron grates over the heating along its walls, the dead orchids' leaves and
//   petals fallen on them; its walls are glass: a low wall of stone, then iron and panes, the sky's cold grey-blue in them,
//   a sheen across, some broken, dead stems pressed against the inside.
// - THE SKYLIGHTS (the hazard) where the floor is broken through: the ground's drop. The floor's lip catches the light
//   at its edge; under it the floor's thickness, marble, rubble and the ends of joists; and far down the hall below, its
//   own marble dim, the day through the hole lying on it in a square, the grid's shadow across it (`paintGlassGallery`).
//   A whole skylight, that cracks and gives way, is a piece (art/floor18.ts).
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own palette
// (Colour 1); a step quieter than the figures (Places 2) and duller than any word's colour (Colour 4: every colour through
// art/act2_quiet.ts); its dark cool and deep (Colour 2); NOTHING GLOWS (Colour 3: nothing cyan, the glass's blue a
// grey-blue well past the hero's; no pink; the only lights on this floor are its candles, the pieces'); solid, not flat
// (Places 4); old and broken (Places 6); crisp pixels.
//
// FOR THE MAIN CHAT: `glassGalleryTerrain(land)` makes the ground for a level from what only the level knows (`GlassLand`:
// its tiles; what each walkable tile is; where a runner lies; which tiles are a skylight broken through); `paintGlassGallery
// (T, x0, y0, w, h)` paints a piece of it as `paintTerrain` does, the hall below in the skylights' holes (every pixel
// opaque). Two pieces side by side are one picture. Edges straight, as walls are.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { RGB, Terrain, TerrainLook, TerrainPiece } from './terrain';
import { TK, fbm, paintTerrain, terrainOf, vnoise, worldOf } from './terrain';
import { hash } from './kit';
import { quietRGB, quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const fr = (t: number): number => t - Math.floor(t);
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const BAYER = [
  [0.125, 0.625],
  [0.875, 0.375],
];
/** Above a threshold, with a checkered pixel or two where it is near it (crisp, never a smear). */
function over(t: number, thr: number, px: number, py: number, band = 0.02): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > BAYER[py & 1][px & 1];
}

// ---------------------------------------------------------------------------------------------------
// THE PALETTE (as the first look): silver, cold blue glass, dark violet; old gilt; a cool blue-black dark

/** The deep, cool dark under everything. */
export const GG_DEEP: RGB = hex('#09080e');
/** The floors' marble, silver-grey: seam, shade, body, light, lit edge. */
export const GG_MARBLE = ['#323242', '#525264', '#6a6a7e', '#828296', '#9e9eb0'].map(hex);
/** Grey marble on the walls (the dado, the cornice), a step lighter. */
export const GG_SILVER = ['#3a3a4c', '#5e5e72', '#7c7c90', '#9898aa', '#b6b6c6'].map(hex);
/** Dark violet marble (the floors' squares, their borders, the Mirror Hall's chequer). */
export const GG_VIOLET = ['#17121f', '#231b30', '#312641', '#3f3253', '#544668'].map(hex);
/** Violet velvet, the runners and the dressing rooms' carpet. */
export const GG_VELVET = ['#1a1224', '#291c38', '#372749', '#46345a', '#5c4a72'].map(hex);
/** Violet silk on the walls, a damask woven in it: by how the face is turned (lit, at the eye, in shade): dark, body, its pattern. */
export const GG_SILK = [
  ['#2a2139', '#3a2e4a', '#4a3d5d'],
  ['#231b31', '#322842', '#403453'],
  ['#1a1425', '#251e33', '#30273f'],
].map((r) => r.map(hex));
/** Old gilt, rubbed. Metal, never a glow. */
export const GG_GILT = ['#2a2117', '#45372a', '#665238', '#88704a', '#ab9363'].map(hex);
/** The chapel's stone, pale and cool. */
export const GG_STONE = ['#2e2c38', '#4a4754', '#5f5c69', '#77737f', '#928e9a'].map(hex);
/** The glasshouse's panes: the sky's cold grey-blue in them (its hue past 220: never the hero's cyan). */
export const GG_PANE = ['#4c5262', '#687083', '#8890a2', '#a6adbc', '#c4c9d4'].map(hex);
/** Iron, near black. */
export const GG_IRON = ['#14141c', '#1f2029', '#2e303b', '#444756'].map(hex);
/** The dead orchids' leaves and stems, fallen: dry straw-brown; their petals, a faded mauve. */
export const GG_DRY = ['#342a20', '#4a3e2c', '#625438'].map(hex);
export const GG_PETAL = ['#4e3e56', '#66546e'].map(hex);
/** A mirror's glass, fallen in shards: a glint. */
export const GG_SHARD = ['#646a7c', '#a0a6b6'].map(hex);
/** Plaster behind torn silk; the lath. */
const PLASTER = ['#4a4652', '#5e5a66', '#2a2630'].map(hex);
/** The stained glass, lit by the day: lead, and the panes (each dull, old glass: Colour 4). */
const LEADING: RGB = hex('#16131c');
const GLASS_C: Record<string, readonly [RGB, RGB]> = {
  ruby: [hex('#6e2c30'), hex('#8e4440')],
  blue: [hex('#2e3666'), hex('#46508a')],
  gold: [hex('#7a6634'), hex('#9e8a4e')],
  violet: [hex('#463064'), hex('#5e4880')],
  snow: [hex('#a4a2ae'), hex('#c4c2cc')],
  ebony: [hex('#1e1a22'), hex('#2c2630')],
  pale: [hex('#7c8090'), hex('#9a9eac')],
};

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile is (and so how its floor and the walls round it look). */
export const GG_ZONE = {
  /** A gallery, a long hall of mirrors: marble, violet at its corners; silk on its walls. */
  Gallery: 0,
  /** The Mirror Hall, the Queen's: a bold chequer; silk on its walls. */
  MirrorHall: 1,
  /** A dressing room: a violet carpet; panelled silk on its walls. */
  Dressing: 2,
  /** The chapel: pale flags; stone walls, lancets of stained glass. */
  Chapel: 3,
  /** The glasshouse on the roof: worn flags, grates, fallen leaves; its walls glass. */
  Glasshouse: 4,
} as const;

export interface GlassLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** What a walkable tile is (GG_ZONE); a gallery where not said. */
  zone?: (tx: number, ty: number) => number;
  /** How far in from its nearer edge a place is on a runner (a gallery's, the Mirror Hall's), in tiles: above 0 on it. */
  runner?: (x: number, y: number) => number;
  /** Whether a tile is a skylight broken through (the hazard; the ground's drop). Asked of tiles that are not floor. */
  skylight?: (tx: number, ty: number) => boolean;
}

/**
 * How tall the walls stand over the floor (picture pixels: as the House of Quiet's, a palace's a little taller); where
 * they begin to fade into the dark above; the dado's rail.
 */
export const GG_RISE = 100;
export const GG_FADE = 70;
export const GG_RAIL = 24;
/** How far under the floor the hall below lies, through a skylight broken through (picture pixels); the floor's thickness. */
export const GG_BELOW = 112;
const THICK = 16;

/** How far each place is from the nearest tile that `is` (tiles), held as a grid, 4 cells to a tile. */
function distanceTo(w: number, h: number, is: (tx: number, ty: number) => boolean): (x: number, y: number) => number {
  const K = 4;
  const W = w * K;
  const H = h * K;
  const d = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) d[j * W + i] = is(Math.floor(i / K), Math.floor(j / K)) ? 0 : 1e9;
  const D2 = Math.SQRT2;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const c = j * W + i;
      let v = d[c];
      if (i > 0) v = Math.min(v, d[c - 1] + 1);
      if (j > 0) {
        v = Math.min(v, d[c - W] + 1);
        if (i > 0) v = Math.min(v, d[c - W - 1] + D2);
        if (i + 1 < W) v = Math.min(v, d[c - W + 1] + D2);
      }
      d[c] = v;
    }
  }
  for (let j = H - 1; j >= 0; j--) {
    for (let i = W - 1; i >= 0; i--) {
      const c = j * W + i;
      let v = d[c];
      if (i + 1 < W) v = Math.min(v, d[c + 1] + 1);
      if (j + 1 < H) {
        v = Math.min(v, d[c + W] + 1);
        if (i + 1 < W) v = Math.min(v, d[c + W + 1] + D2);
        if (i > 0) v = Math.min(v, d[c + W - 1] + D2);
      }
      d[c] = v;
    }
  }
  return (x, y) => {
    const i = Math.max(0, Math.min(W - 1, Math.floor(x * K)));
    const j = Math.max(0, Math.min(H - 1, Math.floor(y * K)));
    return (d[j * W + i] - 0.5) / K;
  };
}

// ---------------------------------------------------------------------------------------------------
// THE FLOORS

/** THE GALLERIES' FLOOR: pale marble in squares a tile across, a small square of dark violet at each corner, a border of violet along the walls; veined, polished. */
export function galleryMarble(x: number, y: number, px: number, py: number, wall: number): RGB {
  const border = wall < 0.42;
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const cx = fx < 0.5 ? fx : 1 - fx;
  const cy = fy < 0.5 ? fy : 1 - fy;
  const corner = cx < 0.17 && cy < 0.17;
  const vein = fbm(x * 1.3 + i * 2.7, y * 1.3 + j * 1.9, 1801);
  const veinOn = Math.abs(vein - 0.5) < 0.012 || Math.abs(fbm(x * 2.2, y * 2.2, 1803) - 0.52) < 0.008;
  if (border || corner) {
    const R = GG_VIOLET;
    if (border && Math.abs(wall - 0.42) < 0.03) return GG_MARBLE[1];
    if (!border && (Math.abs(cx - 0.17) < 0.022 || Math.abs(cy - 0.17) < 0.022)) return R[0];
    let k = 2;
    if (veinOn) k = 3;
    else if (over(vnoise(x * 3, y * 3, 1805), 0.7, px, py)) k = 1;
    return R[k];
  }
  if (fx < 0.018 || fy < 0.018) return GG_MARBLE[1];
  const R = GG_MARBLE;
  let k = 2;
  if (veinOn) k = 1;
  const own = hash(i, j, 1806);
  if (k === 2 && hash(px >> 1, py, 1811) > (own > 0.5 ? 0.97 : 0.99)) k = 3;
  const c = R[k];
  return own > 0.66 ? mixc(c, R[3], 0.22) : own < 0.25 ? mixc(c, R[1], 0.2) : c;
}

/** THE MIRROR HALL'S FLOOR: a bold chequer of silver and violet marble, a tile across, a fillet of old gilt between. */
function hallChequer(x: number, y: number, px: number, py: number, wall: number): RGB {
  if (wall < 0.42) return galleryMarble(x, y, px, py, wall);
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  if (fx < 0.03 || fy < 0.03) return GG_GILT[fx < 0.015 || fy < 0.015 ? 2 : 1];
  const pale = ((i + j) & 1) === 0;
  const R = pale ? GG_MARBLE : GG_VIOLET;
  const vein = Math.abs(fbm(x * 1.6 + i * 3, y * 1.6 + j * 2, 1815) - 0.5) < 0.014;
  let k = vein ? (pale ? 1 : 3) : 2;
  if (k === 2 && hash(px >> 1, py, 1817) > 0.985) k = 3;
  return R[k];
}

/** A RUNNER: violet velvet worn thin down its middle, a border of silver lines, a chain of gilt lozenges between them. `d` how far in from its nearer edge, `along` along it. */
function runnerAt(d: number, along: number, px: number, py: number): RGB {
  if (d < 0.05) return GG_VELVET[0];
  if (d < 0.1) return GG_SILVER[1];
  if (d < 0.27) {
    const u = fr(along * 2.2);
    const m = (d - 0.1) / 0.17;
    const lz = Math.abs(u - 0.5) * 2 + Math.abs(m - 0.5) * 2;
    if (lz < 0.62) return lz < 0.3 ? GG_GILT[3] : GG_GILT[2];
    return GG_VELVET[1];
  }
  if (d < 0.31) return GG_SILVER[1];
  const worn = d > 0.5 && vnoise(along * 0.8, d * 2, 1821) > 0.58;
  const g = hash(px >> 1, py, 1823);
  let k = g < 0.18 ? 1 : g > 0.9 ? 3 : 2;
  if (worn) k = g < 0.5 ? 3 : 2;
  return GG_VELVET[k];
}

/** THE DRESSING ROOMS' CARPET: deep violet, a small lozenge in a faded silver-mauve on a grid, a border near the walls. */
function carpet(x: number, y: number, px: number, py: number, wall: number): RGB {
  if (wall < 0.22) return GG_VELVET[1];
  if (wall < 0.3) return GG_SILVER[1];
  if (wall < 0.5) {
    // the border: a running scroll
    const u = fr((x + y) * 2);
    return Math.abs(u - 0.5) < 0.12 && Math.abs(wall - 0.4) < 0.06 ? GG_GILT[2] : GG_VELVET[1];
  }
  const u = fr(x * 2) - 0.5;
  const v = fr(y * 2) - 0.5;
  const lz = Math.abs(u) + Math.abs(v);
  if (lz < 0.16) return lz < 0.08 ? GG_VELVET[4] : GG_VELVET[3];
  if (Math.abs(lz - 0.42) < 0.03) return GG_VELVET[1];
  const g = hash(px >> 1, py, 1831);
  return GG_VELVET[g < 0.15 ? 1 : 2];
}

/** THE CHAPEL'S FLOOR: great flags of the pale stone in courses, a ledger stone here and there, its letters worn smooth. */
function chapelFlags(x: number, y: number, px: number, py: number): RGB {
  const row = Math.floor(y / 0.8);
  const u = x / 1.1 + (row % 2) * 0.5;
  const ju = fr(u);
  const jv = fr(y / 0.8);
  if (ju < 0.025 || jv < 0.03) return GG_STONE[0];
  const h0 = hash(Math.floor(u), row, 1841);
  if (h0 > 0.95 && ju > 0.12 && ju < 0.88 && jv > 0.15 && jv < 0.85) {
    // a ledger stone: darker, a border cut round it, its lines worn near smooth
    if (ju < 0.16 || ju > 0.84 || jv < 0.19 || jv > 0.81) return GG_STONE[0];
    if (jv > 0.35 && jv < 0.65 && fr(jv * 8) < 0.3 && hash(Math.floor(ju * 14), Math.floor(jv * 8), 1843) < 0.6) return GG_STONE[0];
    return GG_STONE[1];
  }
  let k = h0 < 0.3 ? 1 : h0 > 0.75 ? 3 : 2;
  if (over(fbm(x * 1.4, y * 1.4, 1845), 0.66, px, py)) k = Math.max(1, k - 1);
  return GG_STONE[k];
}

/**
 * THE GLASSHOUSE'S FLOOR: small square tiles, worn, grey and a cooler grey, mildew in their joints; iron grates over the
 * heating along its far walls; the dead orchids' leaves and petals fallen thick on it. `far`: how near a far wall (tiles).
 */
function glasshouseFloor(x: number, y: number, px: number, py: number, far: number): RGB {
  // the grates along the far walls: iron, slotted
  if (far < 0.5) {
    if (far < 0.06 || far > 0.44) return GG_IRON[1];
    return fr((x + y) * 5) < 0.45 ? GG_IRON[0] : GG_IRON[2];
  }
  // fallen leaves: long dry blades lying at all angles; petals, small and mauve
  const cx = Math.floor(x * 3);
  const cy = Math.floor(y * 3);
  const h = hash(cx, cy, 1851);
  if (h < 0.3) {
    const a = hash(cx, cy, 1853) * Math.PI;
    const lx = fr(x * 3) - 0.5;
    const ly = fr(y * 3) - 0.5;
    const along = lx * Math.cos(a) + ly * Math.sin(a);
    const across = -lx * Math.sin(a) + ly * Math.cos(a);
    const half = 0.4;
    if (Math.abs(along) < half && Math.abs(across) < 0.08 * (1 - (along / half) ** 2)) return GG_DRY[across < 0 ? 2 : 1];
  } else if (h > 0.9) {
    const lx = fr(x * 3) - 0.5;
    const ly = fr(y * 3) - 0.5;
    if (lx * lx + ly * ly * 1.5 < 0.014) return GG_PETAL[lx < 0 ? 1 : 0];
  }
  // the tiles, half a tile across
  const i = Math.floor(x * 2);
  const j = Math.floor(y * 2);
  const fx = fr(x * 2);
  const fy = fr(y * 2);
  if (fx < 0.05 || fy < 0.05) return over(vnoise(x * 2, y * 2, 1859), 0.55, px, py) ? MILDEW : GG_STONE[0];
  const h0 = hash(i, j, 1855);
  let k = (i + j) & 1 ? 1 : 2;
  if (h0 > 0.85) k = 1;
  if (over(fbm(x * 2, y * 2, 1857), 0.66, px, py)) k = Math.max(1, k - 1);
  return k === 1 ? mixc(GG_STONE[1], GG_PANE[1], 0.25) : GG_STONE[2];
}
/** Mildew in the glasshouse's joints, a dull grey-green. */
const MILDEW: RGB = hex('#3a4238');

// ---------------------------------------------------------------------------------------------------
// THE WALLS

/** A face's row by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);
/** A tone of a five-step ramp moved toward shade by a face's row. */
const toned = (R: readonly RGB[], k: number, row: number): RGB => R[Math.max(0, Math.min(R.length - 1, k - (row === 2 ? 1 : 0)))];

/** What is on a stretch of the galleries' wall, one to every 96 picture pixels or so, steady from run to run. */
interface Bay {
  key: number;
  u: number;
  /** 0 the silk, 1 the silk torn and hanging, 2 a paler ghost where a mirror hung, 3 a crack through the plaster under it. */
  kind: number;
}
function bayAt(px: number): Bay {
  const SPAN = 96;
  const k = Math.floor(px / SPAN);
  const h = hash(k, 0, 1861);
  return { key: k, u: px - k * SPAN, kind: h < 0.16 ? 1 : h < 0.32 ? 2 : h < 0.42 ? 3 : 0 };
}

/** The silk's damask: an ogee of leaves with a bloom in each, repeating; `row` the face's turn. */
function damask(u: number, v: number, px: number, py: number, row: number): RGB {
  const S = GG_SILK[row];
  const ua = u / 16;
  const uz = (v - GG_RAIL) / 24;
  const iz = Math.floor(uz);
  const lu = fr(ua + (iz % 2) * 0.5) - 0.5;
  const lz = fr(uz) - 0.5;
  const ogee = Math.abs(Math.abs(lu) - 0.32 * Math.cos(lz * Math.PI)) < 0.05;
  const bloom = Math.hypot(lu * 1.6, lz) < 0.13 || (Math.abs(lu) < 0.05 && lz > 0 && lz < 0.32);
  if (ogee || bloom) return S[2];
  if (hash(px >> 1, py, 1863) < 0.07) return S[0];
  // the sheen of silk in long folds
  if (row === 0 && Math.abs(fr(u * 0.012 + v * 0.004) - 0.5) < 0.08) return mixc(S[1], S[2], 0.5);
  return S[1];
}

/** THE DADO of grey marble with a moulded rail and a skirting; a cornice at the wall's top. */
function dadoAt(v: number, u: number, row: number): RGB | null {
  const R = GG_SILVER;
  if (v >= GG_RAIL + 2) return null;
  if (v >= GG_RAIL) return toned(R, v === GG_RAIL + 1 ? 4 : 2, row);
  if (v < 3) return toned(GG_VIOLET, 1, row);
  const pa = mod(u, 32);
  if (pa < 1 || v < 5 || v > GG_RAIL - 3) return toned(R, 1, row);
  const vein = Math.abs(fbm(u * 0.08, v / 14, 1865) - 0.5) < 0.02;
  return toned(R, vein ? 1 : 2, row);
}
function corniceAt(v: number, row: number): RGB | null {
  const top = GG_FADE - 2;
  if (v < top - 8 || v > top) return null;
  const m = top - v;
  return toned(GG_SILVER, m < 1.5 ? 4 : m < 3 ? 2 : m < 5 ? 3 : m < 7 ? 1 : 2, row);
}

/** THE GALLERIES' WALLS (and the Mirror Hall's): the dado, the silk, the cornice; what is on the silk bay by bay. */
function galleryWall(shade: number, v: number, px: number, py: number): RGB {
  const row = rowOf(shade);
  const bay = bayAt(px);
  const low = dadoAt(v, px, row);
  if (low) return low;
  const top = corniceAt(v, row);
  if (top) return top;
  let c = damask(px, v, px, py, row);
  const u = bay.u;
  if (bay.kind === 1) {
    // THE SILK TORN: ripped down from the cornice, hanging in strips, the plaster bare behind
    const x0 = 24 + Math.floor(hash(bay.key, 1, 1867) * 40);
    const lu = u - x0;
    const reach = GG_FADE - 10 - 28 * hash(Math.floor((lu + 40) / 5), bay.key, 1869);
    if (lu >= 0 && lu < 26 && v > reach - 10) {
      const strip = mod(lu, 5);
      if (v > reach) return strip < 1 ? PLASTER[2] : PLASTER[strip < 3 ? 1 : 0];
      // the strips hanging down over it, curled at their ends
      if (strip >= 1 && strip < 4 && v > reach - 10 + (lu % 3) * 2) return GG_SILK[row][strip === 1 ? 2 : 0];
    }
  } else if (bay.kind === 2) {
    // A GHOST WHERE A MIRROR HUNG: the silk unfaded in a tall frame's shape, a nail at its top
    const x0 = 30 + Math.floor(hash(bay.key, 2, 1867) * 26);
    const lu = u - x0;
    if (lu >= 0 && lu < 30 && v > GG_RAIL + 6 && v < GG_FADE - 12) {
      const edge = lu < 1 || lu > 28 || v < GG_RAIL + 7 || v > GG_FADE - 13;
      c = edge ? GG_SILK[row][0] : mixc(GG_SILK[row][1], GG_SILK[row][2], 0.4);
      if (Math.abs(lu - 15) < 1 && v > GG_FADE - 15) c = GG_IRON[3];
    }
  } else if (bay.kind === 3) {
    // A CRACK through the plaster, splitting the silk over it
    const x0 = 30 + hash(bay.key, 3, 1867) * 40;
    const cu = x0 + 7 * Math.sin(v * 0.12 + bay.key) + 3 * vnoise(v * 0.4, bay.key, 1871);
    if (v > GG_RAIL + 2 && Math.abs(u - cu) < 0.8) c = PLASTER[2];
    else if (v > GG_RAIL + 2 && Math.abs(u - cu) < 1.8 && u > cu) c = PLASTER[1];
  }
  return c;
}

/** THE DRESSING ROOMS' WALLS: a painted dado, then violet silk in frames of thin gilt moulding, panel by panel. */
function dressingWall(shade: number, v: number, px: number, py: number): RGB {
  const row = rowOf(shade);
  const top = corniceAt(v, row);
  if (top) return top;
  if (v < GG_RAIL + 2) {
    if (v >= GG_RAIL) return toned(GG_GILT, v === GG_RAIL + 1 ? 3 : 1, row);
    if (v < 3) return toned(GG_VIOLET, 1, row);
    // the dado's panels, painted a grey-violet, their mouldings
    const pu = mod(px, 24);
    if (pu < 1 || v === 5 || v === GG_RAIL - 3) return toned(GG_VIOLET, 2, row);
    if (pu === 1 || v === 6) return toned(GG_VIOLET, 4, row);
    return toned(GG_VIOLET, 3, row);
  }
  // the silk panels: each in a frame of gilt moulding, its corners stepped in
  const PW = 32;
  const pu = mod(px, PW);
  const pv = v - (GG_RAIL + 6);
  const H = GG_FADE - 16 - GG_RAIL;
  const inPanel = pu >= 4 && pu < PW - 4 && pv >= 0 && pv < H;
  if (inPanel) {
    const e = Math.min(pu - 4, PW - 5 - pu, pv, H - 1 - pv);
    // a rosette of gilt at each corner of the moulding
    const corner = Math.min(pu - 4, PW - 5 - pu) < 2 && Math.min(pv, H - 1 - pv) < 2;
    if (corner) return toned(GG_GILT, pu - 4 < 1 || pv > H - 2 ? 4 : 2, row);
    if (e === 0) return toned(GG_GILT, pu - 4 === 0 || pv === H - 1 ? 3 : 1, row);
    return damask(px, v, px, py, row);
  }
  return GG_SILK[row][1];
}

/** A LANCET of stained glass in the chapel's wall (u across from its middle, picture pixels; v up): its colour, or null outside it. */
function lancet(u: number, v: number, key: number): RGB | null {
  const half = 10;
  const z0 = 22;
  const z1 = 84;
  if (v < z0 || Math.abs(u) > half) return null;
  const spring = z1 - half * 1.25;
  if (v > spring) {
    if (Math.hypot(Math.abs(u) + half, (v - spring) * 1.15) > 2 * half) return null;
  }
  if (half - Math.abs(u) < 1.5 || v - z0 < 2) return LEADING;
  const qa = u / 5;
  const qz = (v - z0) / 8;
  if (Math.abs(fr(qa + 0.5) - 0.5) < 0.1 || Math.abs(fr(qz) - 0.5) > 0.44) return LEADING;
  const tone = hash(Math.floor(qa + 50), Math.floor(qz), 1881 + key) > 0.6 ? 1 : 0;
  const t = (v - z0) / (z1 - z0);
  if (half - Math.abs(u) < 3.2) return GLASS_C.gold[tone];
  // THE BOOK'S FIRST PAGE: the snow, a frame of ebony across it, three drops of blood; the sky over
  if (Math.abs(t - 0.42) < 0.05) return GLASS_C.ebony[tone];
  if (key % 2 === 0 && [0.2, 0.29, 0.37].some((dz, i) => Math.hypot(u - (i - 1) * 3, (t - dz) * 40) < 2)) return GLASS_C.ruby[1];
  if (key % 3 === 1 && t > 0.5 && t < 0.72 && Math.abs(u) < 4) return t > 0.66 ? GLASS_C.gold[1] : GLASS_C.violet[tone];
  if (t > 0.78) return GLASS_C.blue[tone];
  return t < 0.42 ? GLASS_C.snow[tone] : GLASS_C.pale[tone];
}

/** THE CHAPEL'S WALLS: the pale stone in courses, a lancet of stained glass in every other bay. */
function chapelWall(shade: number, v: number, px: number, py: number): RGB {
  const row = rowOf(shade);
  const SPAN = 64;
  const k = Math.floor(px / SPAN);
  const u = px - k * SPAN - SPAN / 2;
  if (hash(k, 0, 1883) < 0.7) {
    const g = lancet(u, v, k);
    if (g) return g;
    // its splayed reveal, lit on its left
    const r2 = lancet(u + (u < 0 ? 2 : -2), v, k);
    if (r2 && v < 86) return toned(GG_STONE, u < 0 ? 3 : 1, row);
  }
  if (v < 8) return toned(GG_STONE, v > 6 ? 3 : 1, row);
  const course = Math.floor((v - 8) / 12);
  const off = hash(course, 0, 1885) * 30;
  const ju = fr((px + off) / 26);
  const jz = fr((v - 8) / 12);
  if (ju < 0.05 || jz < 0.09) return toned(GG_STONE, 1, row);
  const b = hash(Math.floor((px + off) / 26), course, 1887);
  if (hash(px >> 1, py, 1889) < 0.05) return toned(GG_STONE, 1, row);
  return toned(GG_STONE, b > 0.6 ? 3 : 2, row);
}

/** THE GLASSHOUSE'S WALLS: a low wall of stone, then iron and panes, the sky's cold grey-blue in them, a sheen across; some broken; dead stems against the inside. */
function glassWall(shade: number, v: number, px: number, py: number): RGB {
  const row = rowOf(shade);
  if (v < 12) return toned(GG_STONE, v > 10 ? 3 : v < 2 ? 1 : 2, row);
  // the iron: a sill, mullions every 16, transoms
  const mu = mod(px, 16);
  if (v < 14 || mu < 2 || v === 46 || v === 47 || v === 76 || v === 77) return GG_IRON[mu === 1 || v === 13 || v === 47 || v === 77 ? 3 : 1];
  const pane = Math.floor(px / 16) * 7 + (v < 46 ? 0 : v < 76 ? 1 : 2);
  const h = hash(pane, 0, 1891);
  // a pane broken out: the dark beyond, its glass's teeth at the edges
  if (h > 0.9) {
    const tooth = 2 + 4 * Math.abs(Math.sin(px * 0.9 + v * 0.7));
    if (mu - 2 < tooth || 15 - mu < tooth * 0.5) return GG_PANE[3];
    return mixc(GG_DEEP, GG_IRON[1], 0.4);
  }
  // the sky in it, the sheen across it
  const sheen = fr((px - v * 1.1) / 60);
  let c = GG_PANE[row === 2 ? 1 : 2];
  if (sheen < 0.06) c = GG_PANE[4];
  else if (sheen < 0.1) c = GG_PANE[3];
  else if (hash(px >> 1, py >> 1, 1893) > 0.94) c = GG_PANE[row === 2 ? 0 : 1];
  // dead stems leaning against the inside of the glass, low down
  const stem = mod(px + Math.floor(v * 0.35 * (h > 0.5 ? 1 : -1)), 23);
  if (v < 44 && stem < 1 && h < 0.5) c = mixc(c, GG_DRY[0], 0.7);
  return c;
}

/** THE TOP: the wall's thickness seen from above, its edge catching the light, then the dark over the rooms. */
function topAt(px: number, py: number, back: number): RGB {
  if (back < 0.05) return GG_SILVER[3];
  if (back < 0.09) return GG_SILVER[1];
  const r = hash(px >> 1, py, 1895);
  const c = r < 0.88 ? GG_DEEP : mixc(GG_DEEP, GG_VIOLET[2], 0.25);
  return mixc(c, GG_DEEP, cl01(back));
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

/** The wall's face, by the room it looks into (`zone`), with its fade into the dark above. */
function faceOf(zone: number, shade: number, v: number, px: number, py: number): RGB {
  let c: RGB;
  if (zone === GG_ZONE.Chapel) c = chapelWall(shade, v, px, py);
  else if (zone === GG_ZONE.Glasshouse) c = glassWall(shade, v, px, py);
  else if (zone === GG_ZONE.Dressing) c = dressingWall(shade, v, px, py);
  else c = galleryWall(shade, v, px, py);
  if (v > GG_FADE) {
    // into the dark above, in steps (crisp)
    const t = cl01((v - GG_FADE) / (GG_RISE - GG_FADE));
    const q = Math.floor(t * 4 + BAYER[py & 1][px & 1] * 0.999) / 4;
    c = mixc(c, GG_DEEP, 0.3 + 0.65 * q);
  }
  return c;
}

/** THE GLASS GALLERY'S LOOK, for a level's own tiles, rooms, runners and skylights. */
export function glassGalleryLook(land: GlassLand): TerrainLook {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const zoneAt = (tx: number, ty: number): number => (land.zone && isFloor(tx, ty) ? land.zone(tx, ty) : GG_ZONE.Gallery);
  const sky = land.skylight;
  // how far each place is from a wall (a skylight's hole is not a wall)
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty) && !(sky && sky(tx, ty)));
  /** The room a wall's face looks into: the floor tile at its foot (out from it toward the eye). */
  const roomOf = (shade: number, x: number, y: number): number => {
    const fx = shade < 0 ? x + 0.3 : x;
    const fy = shade < 0 ? y : y + 0.3;
    return zoneAt(Math.floor(fx), Math.floor(fy));
  };
  /** How far a place is from a wall toward the back (-x or -y): the far walls, where the glasshouse's grates run. */
  const farWall = (x: number, y: number): number => {
    let d = 9;
    for (let s = 0; s < 0.6; s += 0.05) {
      if (!isFloor(Math.floor(x - s), Math.floor(y))) d = Math.min(d, s);
      if (!isFloor(Math.floor(x), Math.floor(y - s))) d = Math.min(d, s);
    }
    return d;
  };
  const nearRoom = (x: number, y: number): number => {
    for (const [dx, dy] of [[-0.3, -0.3], [-0.3, 0], [0, -0.3]] as const) if (isFloor(Math.floor(x + dx), Math.floor(y + dy))) return zoneAt(Math.floor(x + dx), Math.floor(y + dy));
    return GG_ZONE.Gallery;
  };
  return quietTerrain({
    rise: GG_RISE,
    near: 40,
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 181,
    floor: (x, y, px, py) => {
      const z = zoneAt(Math.floor(x), Math.floor(y));
      const wd = wall(x, y);
      let c: RGB;
      if (z === GG_ZONE.Chapel) c = chapelFlags(x, y, px, py);
      else if (z === GG_ZONE.Glasshouse) c = glasshouseFloor(x, y, px, py, farWall(x, y));
      else if (z === GG_ZONE.Dressing) c = carpet(x, y, px, py, wd);
      else {
        const run = land.runner ? land.runner(x, y) : 0;
        if (run > 0) c = runnerAt(run, x + y, px, py);
        else if (z === GG_ZONE.MirrorHall) c = hallChequer(x, y, px, py, wd);
        else c = galleryMarble(x, y, px, py, wd);
        // a mirror's shards fallen along the foot of the walls, glinting
        if (wd < 0.8 && wd > 0.05 && hash(px >> 1, py, 1897) > 0.993) c = GG_SHARD[hash(px, py, 1899) > 0.5 ? 1 : 0];
      }
      // dark in toward the walls
      if (wd < 0.2) c = mixc(c, GG_DEEP, 0.25);
      return c;
    },
    face: (shade, v, px, py, x, y) => faceOf(roomOf(shade, x, y), shade, v, px, py),
    top: (_x, _y, px, py, back) => topAt(px, py, back),
    nearFace: (v, px, py, x, y) => mixc(faceOf(nearRoom(x, y), -1, v, px, py), GG_DEEP, 0.5),
    brow: (c) => mixc(c, GG_SILVER[3], 0.3),
    foot: [0.4, 0.22],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.3, 0.18] },
    drop: sky ? (tx, ty) => sky(tx, ty) : undefined,
    // the marble's lip over the hole, lit
    lip: () => GG_MARBLE[4],
    // under the lip, the floor's thickness: the marble's edge, then rubble and the ends of joists
    hang: {
      tall: THICK,
      at: (v, px) => {
        if (v < 2) return GG_MARBLE[3];
        if (v < 4) return GG_MARBLE[1];
        if (v > THICK - 3) return mixc(GG_DEEP, GG_IRON[1], 0.3);
        return mod(px, 9) < 4 ? hex('#33282c') : hex('#1e171c');
      },
    },
  });
}

/** THE GLASS GALLERY'S GROUND for a level. */
export function glassGalleryTerrain(land: GlassLand): Terrain {
  return terrainOf(land.floor, glassGalleryLook(land));
}

// ---------------------------------------------------------------------------------------------------
// THE HALL BELOW, through a skylight broken through

/**
 * WHAT IS SEEN DOWN A SKYLIGHT'S HOLE at a picture pixel: the hall below, GG_BELOW under the floor, its own marble dim;
 * the day through the hole lying on it in a square, the grid's shadow across it (`sky`: the holes' tiles).
 */
export function hallBelow(px: number, py: number, sky?: (tx: number, ty: number) => boolean): RGB {
  const [x, y] = worldOf(px, py - GG_BELOW);
  const c = galleryMarble(x + 3, y + 3, px, py, 9);
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (sky && sky(tx, ty)) {
    const ex = fr(x * 4);
    const ey = fr(y * 4);
    if (ex < 0.08 || ey < 0.08) return mixc(c, GG_DEEP, 0.5);
    return mixc(mixc(c, GG_MARBLE[4], 0.25), GG_DEEP, 0.2);
  }
  return mixc(c, GG_DEEP, 0.66);
}

/**
 * PAINT A PIECE OF THE GLASS GALLERY'S GROUND as `paintTerrain` does (picture pixels from (x0, y0), w by h), the hall below
 * in the skylights' holes: every pixel opaque. Two pieces side by side are one picture.
 */
export function paintGlassGallery(T: Terrain, x0: number, y0: number, w: number, h: number, sky?: (tx: number, ty: number) => boolean): TerrainPiece {
  const p = paintTerrain(T, x0, y0, w, h);
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      if (p.kind[i] !== TK.Drop) continue;
      const col = quietRGB(hallBelow(x0 + c, y0 + r, sky));
      p.rgba[i * 4] = col[0];
      p.rgba[i * 4 + 1] = col[1];
      p.rgba[i * 4 + 2] = col[2];
      p.rgba[i * 4 + 3] = 255;
    }
  }
  return p;
}

// (for the pieces: the galleries' marble and runner, the silk, as the ground paints them)
export { runnerAt as galleryRunner, damask as galleryDamask };
