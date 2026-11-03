// FLOOR 18, THE GLASS GALLERY (the High City): THE PAINTING, A FIRST LOOK. A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat; his "Yes, go
// (Recommended)"), level 18: "The Glass Gallery. The queen's wing: long galleries of mirrors and a great glasshouse on the
// roof." Its layout "indoors and up: mirrored halls and dressing rooms, a chapel of stained glass, and the glasshouse of
// dead orchids under a roof of panes"; its hazards "mirrors that crack and burst into shards when anything strikes near
// them; skylights to fall through to the floor below"; its palette "Silver, cold blue glass, dark violet"; its story beat
// "The only voice left is her mirror's." Its story from the Brothers Grimm, "Snow White" (1812), drawn only from the book.
//
// WHAT IS PAINTED (one corner of the queen's wing, about a phone screen and a half, by day, the candles lit):
// - THE LONG GALLERY OF MIRRORS: its back wall in the light, hung bay by bay with tall mirrors in carved gilt frames, each
//   crested with a crown of glass spikes (the Queen's), between pilasters of grey marble on a dado of the same, the wall
//   between them dark violet silk; each mirror gives back, faintly, the floor before it, the candles and whoever stands
//   near it (the knight, before one of them). One mirror CRACKED from a blow, its pieces each giving back the hall a little
//   askew; one BURST, its frame empty but for teeth of glass, its shards strewn on the floor under it (the hazard). Tall
//   silver candelabra between the mirrors, their candles burning (the only light that is light: Colour 3). A floor of pale
//   silver-grey marble set with small squares of dark violet at its corners, a violet runner down its middle.
// - A SKYLIGHT IN THE FLOOR (the hazard): an iron grid of panes let into the marble, lighting the hall below; frosted,
//   cracked; at its near corner its panes gone, and through the hole the floor of the hall below, far down.
// - THE CHAPEL, through a pointed doorway in the gallery's left wall: its stained glass lit by the day, leaded windows of
//   the book's first page (a queen sewing at a window framed in ebony, the snow, three drops of blood: "red as blood, white
//   as snow, black as ebony"), the colours they throw lying across its floor, its pews.
// - THE GLASSHOUSE ON THE ROOF, glimpsed up a stair through the gallery's back wall: a house of iron and glass on the
//   lead of the roof, its panes cold blue-grey with the sky in them, some broken; inside it, on its staging, the dead
//   orchids, brown and drooping, a last few withered blooms.
// - The knight on the runner before the mirrors, for scale.
//
// His art rulebook kept: one camera, the game's (a tile 64 x 32 picture pixels; things built in depth as floor 4's
// Scene builds them, 40 to a tile, heights in picture pixels); light from the upper left (a face looking down to the left
// lit, to the right in shade); three tones or so a material; no black outlines, the seams a deep indigo; a step quieter
// than the figures, every colour under the dullest word's (Colour 4, through art/act2_quiet.ts); nothing cyan (the cold
// blue of the glass a grey-blue, its hue well past the hero's), no pink; nothing glowing but the candles' honest flames
// (Colour 3: the day through the stained glass is colour on the floor, never a glow); real shapes; crisp pixels.

import { Px } from '../engine/px';
import { Scene, toneAt } from '../art/floor4';
import type { V3 } from '../art/floor4';
import { TOWARD } from '../art/floor2';
import { hash, limb, mix } from '../art/kit';
import type { Ramp } from '../art/kit';
import { cylinder } from '../art/act2_kit';
import { EMBER } from '../art/props';
import { quietHex } from '../art/act2_quiet';
import { fbm, vnoise } from '../art/terrain';

// =================================================================================================
// THE PALETTE: silver, cold blue glass, dark violet; old gilt; all under the dullest word's colour

/** Pale silver-grey marble (the floor's field, the pilasters, the dado): seam, shade, body, light, lit edge. */
export const SILVER: Ramp = ['#3a3a4c', '#5e5e72', '#7c7c90', '#9898aa', '#b6b6c6'];
/** The floor's marble: the same silver-grey, a step darker under foot. */
export const MARBLE: Ramp = ['#323242', '#525264', '#6a6a7e', '#828296', '#9e9eb0'];
/** Dark violet marble (the floor's squares, its border). */
export const VIOLET: Ramp = ['#17121f', '#231b30', '#312641', '#3f3253', '#544668'];
/** The runner: violet velvet, worn. */
export const VELVET: Ramp = ['#1a1224', '#291c38', '#372749', '#46345a', '#5c4a72'];
/** Violet silk on the walls, a damask woven in it. */
export const SILK: Ramp = ['#1c1626', '#271f35', '#322843', '#3d3250', '#4c405f'];
/** Old gilt, rubbed: the frames. Metal, never a glow. */
export const GILT: Ramp = ['#2a2117', '#45372a', '#665238', '#88704a', '#ab9363'];
/** The mirrors' glass: a cold grey-blue (its hue past 220: never the hero's cyan). */
export const MIRROR: Ramp = ['#22252f', '#343846', '#4a4f60', '#646a7c', '#868c9e'];
/** The glasshouse's panes: paler, the sky in them. */
export const PANE: Ramp = ['#4c5262', '#687083', '#8890a2', '#a6adbc', '#c4c9d4'];
/** Iron, painted long ago, near black, blue-grey at its edges. */
export const IRONS: Ramp = ['#14141c', '#1f2029', '#2e303b', '#444756', '#62667a'];
/** Lead, the roof. */
export const LEAD: Ramp = ['#191a24', '#24252f', '#30313d', '#3d3e4b', '#55566a'];
/** The chapel's stone, pale and cool. */
export const CSTONE: Ramp = ['#2e2c38', '#4a4754', '#5f5c69', '#77737f', '#928e9a'];
/** Oak, the pews. */
export const POAK: Ramp = ['#1c1416', '#2c2020', '#3e2e2a', '#524036', '#6a5444'];
/** Terracotta, the orchids' pots, dull. */
export const CLAYPOT: Ramp = ['#2e1e1e', '#46302a', '#5e4034', '#765442', '#8e6a54'];
/** The orchids, dead: dry stems and leaves, straw-brown; withered blooms, a faded mauve and an old ivory. */
export const DRY: Ramp = ['#221c18', '#342a20', '#4a3e2c', '#625438', '#7a6c4a'];
export const BLOOM: Ramp = ['#3a2e40', '#4e3e56', '#66546e', '#7e6c84', '#9a8a9e'];
export const IVORY: Ramp = ['#5a5446', '#787060', '#968e7a', '#b0a890', '#c8c0a8'];
/** Candle wax. */
export const WAX: Ramp = ['#6a6456', '#8a8472', '#a8a28c', '#c4bea6', '#dcd6be'];
/** The stained glass, lit by the day: lead, and the panes (each dull, old glass: Colour 4). */
export const LEADING = '#16131c';
export const GLASS_C: Record<string, readonly [string, string]> = {
  ruby: ['#6e2c30', '#8e4440'],
  blue: ['#2e3666', '#46508a'],
  gold: ['#7a6634', '#9e8a4e'],
  violet: ['#463064', '#5e4880'],
  snow: ['#a4a2ae', '#c4c2cc'],
  ebony: ['#1e1a22', '#2c2630'],
  green: ['#2e4430', '#425c40'],
  pale: ['#7c8090', '#9a9eac'],
};
/** The deep, cool dark past everything. */
export const DEEP = '#08070d';
/** The candles' flames: an honest fire (EMBER, Colour 3). */
const FLAME_LO = EMBER[3];
const FLAME_HI = EMBER[4];

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's); heights in picture pixels

export const W = 1200;
export const H = 840;
/** Units to a tile in the depth painter (floor 4's Scene). */
const U = 40;
/** Where the gallery's floor corner (0, 0, 0) is on the picture. */
export const OX = 436;
export const OY = 336;
/** The gallery: x from 0 to HX, y from 0 to HY; its walls this tall (the roof's lead at their top) and this thick. */
export const HX = 16;
export const HY = 8;
export const WH = 104;
const WT = 0.6;
/** The mirrors on the back wall: bays two tiles wide, the pilasters between at 0.6 + 2k; each mirror's glass. */
const BAY0 = 0.6;
const BAY = 2;
const GLASS_Z0 = 22;
const GLASS_Z1 = 92;
/** Which bay is which: 0..7 along x. */
const STAIR_BAY = 5;
const CRACKED_BAY = 4;
const BURST_BAY = 6;
/** The runner down the middle of the gallery. */
const RUN = { y0: 2.7, y1: 4.3 };
/** The skylight in the floor: its frame's outer edge; its panes; the broken corner. */
export const SKY = { x0: 6.3, x1: 8.8, y0: 4.9, y1: 7.4 };
/** The doorway into the chapel, in the gallery's left wall. */
const DOOR = { y0: 2.4, y1: 4.2, top: 92 };
/** The chapel: beyond the left wall. */
export const CHAPEL = { x0: -6.4, x1: -WT, y0: 0, y1: 6.2 };
/** The stair up through the back wall to the roof, and the roof's height (the walls' top). */
export const STAIR = { x0: 10.9, x1: 12.5, foot: 0.3, head: -2.6, steps: 8 };
/** The glasshouse on the roof. */
export const GH = { x0: 9.2, x1: 15.2, y0: -7.6, y1: -2.6, base: 12, eave: 84, ridge: 128 };
/** The roof's lead round the glasshouse (the walls' top): the rest of the palace's roofs lie in the dark. */
const ROOF = { x0: 8.4, x1: 16.6, y0: -8.8 };
/** Where the knight stands: before the fourth mirror, on the runner's edge. */
export const HERO_AT: readonly [number, number] = [6.45, 1.45];

const v = (x: number, y: number, z = 0): V3 => [x * U, y * U, z];
const tx = (w: readonly number[]): number => w[0] / U;
const ty = (w: readonly number[]): number => w[1] / U;
const clamp = (a: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, a));
const fr = (t: number): number => t - Math.floor(t);
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const BAYER = [
  [0.125, 0.625],
  [0.875, 0.375],
];
/** A finer ordered dither, for the dark's steps. */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((k) => (k + 0.5) / 16));
/** The candles' own colours, left as they burn. */
const BRIGHT_FLAME = new Set<string>([EMBER[2], EMBER[3], EMBER[4]]);
/** Soft shadows under what stands: (x, y, reach in tiles). */
const SHADOWS: [number, number, number][] = [];
/** Over a threshold, a checker of pixels where it is near it: one tone gives way to the next softly, still crisp. */
function over(t: number, thr: number, px: number, py: number, band = 0.03): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > BAYER[py & 1][px & 1];
}

// =================================================================================================
// THE DEPTH PAINTER'S OWN HELPERS: quads in tiles, a rod drawn on a small canvas of its own

/** Which pixel of the picture a point of the world (units) falls on. */
const pixOf = (S: Scene, w: readonly number[]): [number, number] => {
  const [x, y] = S.at(w);
  return [Math.floor(x), Math.floor(y)];
};
/** A four-cornered piece of the world, its corners in tiles (z picture pixels): `shade(x, y, z, px, py, u, v)` its colour. */
function quadT(S: Scene, q: readonly (readonly [number, number, number])[], shade: (x: number, y: number, z: number, px: number, py: number, u: number, vv: number) => string | null, id: number): void {
  S.quad([v(q[0][0], q[0][1], q[0][2]), v(q[1][0], q[1][1], q[1][2]), v(q[2][0], q[2][1], q[2][2]), v(q[3][0], q[3][1], q[3][2])], (u, vv, w) => {
    const [px, py] = pixOf(S, w);
    return shade(tx(w), ty(w), w[2], px, py, u, vv);
  }, id);
}
/** THE ROOF'S LEAD: laid in long bays with rolls between, dull; into the dark at its far edges. */
function roofAt(x: number, y: number, px: number, py: number): string {
  const roll = fr(x / 1.4) < 0.05;
  let c = roll ? LEAD[3] : LEAD[hash(Math.floor(x / 1.4), Math.floor(y / 3), 1931) > 0.5 ? 2 : 1];
  if (fr(y / 3) < 0.02) c = LEAD[0];
  const far = Math.max(clamp((-y - 6.6) / 2.2, 0, 1), clamp((ROOF.x0 + 1.4 - x) / 1.4, 0, 1), clamp((x - ROOF.x1 + 1.2) / 1.2, 0, 1));
  const q = Math.floor(far * 4 + BAYER[py & 1][px & 1] * 0.999) / 4;
  return mix(c, DEEP, q * 0.95);
}
/** A rod (a candle's arm, a glazing bar), on a small canvas of its own and laid into the picture at its depth. */
function rod(S: Scene, a: V3, b: V3, r0: number, r1: number, ramp: Ramp, id: number): void {
  const [x0, y0] = S.at(a);
  const [x1, y1] = S.at(b);
  const R = Math.max(r0, r1) * 1.1 + 2;
  const bx = Math.floor(Math.min(x0, x1) - R);
  const by = Math.floor(Math.min(y0, y1) - R);
  const tw = Math.ceil(Math.abs(x1 - x0) + 2 * R) + 2;
  const th = Math.ceil(Math.abs(y1 - y0) + 2 * R) + 2;
  const tmp = new Px(tw, th);
  limb(tmp, x0 - bx, y0 - by, x1 - bx, y1 - by, r0 * 1.1, r1 * 1.1, ramp);
  const d0 = dot(a, TOWARD) + (r0 + r1) / 2;
  const d1 = dot(b, TOWARD) + (r0 + r1) / 2;
  const L2 = (x1 - x0) ** 2 + (y1 - y0) ** 2 || 1;
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const c = tmp.get(x, y);
      if (!c) continue;
      const X = x + bx;
      const Y = y + by;
      const t = clamp(((X + 0.5 - x0) * (x1 - x0) + (Y + 0.5 - y0) * (y1 - y0)) / L2, 0, 1);
      S.put(X, Y, d0 + (d1 - d0) * t, c, id, a[2] + (b[2] - a[2]) * t);
    }
  }
}
/** A box along the world's axes, in tiles (z picture pixels), one ramp, lit as it faces, a lit edge along its top. */
function block(S: Scene, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, r: Ramp, id: number, grain?: (f: number, u: number, vv: number) => number): void {
  S.box([((x0 + x1) / 2) * U, ((y0 + y1) / 2) * U, (z0 + z1) / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [((x1 - x0) / 2) * U, ((y1 - y0) / 2) * U, (z1 - z0) / 2], (f, u, vv, n) => {
    const g = grain ? grain(f, u, vv) : 0;
    if (f !== 4 && vv > 0.94) return toneAt(n, r, 0.45 + g);
    return toneAt(n, r, g);
  }, id);
}

// =================================================================================================
// THE FLOOR

/** THE GALLERY'S FLOOR: pale marble in squares a tile across, a small square of dark violet at each corner, a border of violet along the walls; veined, polished. */
export function galleryFloor(x: number, y: number, px: number, py: number): string {
  // the border of dark violet along the walls
  const border = x < 0.42 || y < 0.42;
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  // the violet squares at the corners (world-square: a small diamond on the picture)
  const cx = fx < 0.5 ? fx : 1 - fx;
  const cy = fy < 0.5 ? fy : 1 - fy;
  const corner = cx < 0.17 && cy < 0.17;
  const vein = fbm(x * 1.3 + i * 2.7, y * 1.3 + j * 1.9, 1801);
  const veinOn = Math.abs(vein - 0.5) < 0.012 || Math.abs(fbm(x * 2.2, y * 2.2, 1803) - 0.52) < 0.008;
  if (border || corner) {
    const R = VIOLET;
    if (border && (Math.abs(x - 0.42) < 0.03 || Math.abs(y - 0.42) < 0.03) && !(x < 0.39 && y > 0.45) && !(y < 0.39 && x > 0.45)) return MARBLE[1];
    if (!border && (Math.abs(cx - 0.17) < 0.022 || Math.abs(cy - 0.17) < 0.022)) return R[0];
    let k = 2;
    if (veinOn) k = 3;
    else if (over(vnoise(x * 3, y * 3, 1805), 0.7, px, py)) k = 1;
    return R[k];
  }
  // the seams between the squares, fine
  if (fx < 0.018 || fy < 0.018) return MARBLE[1];
  const R = MARBLE;
  let k = 2;
  if (veinOn) k = 1;
  // (each square its own stone, a shade lighter or darker; the polish catching the light in a fleck here and there)
  const own = hash(i, j, 1806);
  if (k === 2 && hash(px >> 1, py, 1811) > (own > 0.5 ? 0.97 : 0.99)) k = 3;
  const c = R[k];
  return own > 0.66 ? mix(c, R[3], 0.22) : own < 0.25 ? mix(c, R[1], 0.2) : c;
}

/** THE RUNNER: violet velvet worn thin down its middle, a border of silver lines, a chain of gilt lozenges between them. */
function runner(x: number, y: number, px: number, py: number): string {
  const d = Math.min(y - RUN.y0, RUN.y1 - y);
  if (d < 0.05) return VELVET[0];
  if (d < 0.1) return SILVER[1];
  if (d < 0.27) {
    // the border's chain of lozenges, gilt, along x
    const u = fr(x * 2.2);
    const m = (d - 0.1) / 0.17;
    const lz = Math.abs(u - 0.5) * 2 + Math.abs(m - 0.5) * 2;
    if (lz < 0.62) return lz < 0.3 ? GILT[3] : GILT[2];
    return VELVET[1];
  }
  if (d < 0.31) return SILVER[1];
  // the pile, a nap catching the light; worn paler down the middle where feet go
  const worn = d > 0.5 && vnoise(x * 0.8, y * 2, 1821) > 0.58;
  const g = hash(px >> 1, py, 1823);
  let k = g < 0.18 ? 1 : g > 0.9 ? 3 : 2;
  if (worn) k = g < 0.5 ? 3 : 2;
  return VELVET[k];
}

/** THE CHAPEL'S FLOOR: great flags of the pale stone; the day through the stained glass lying on it in its colours. */
function chapelFloor(x: number, y: number, px: number, py: number): string {
  const row = Math.floor(y / 0.8);
  const u = x / 1.1 + (row % 2) * 0.5;
  const ju = fr(u);
  const jv = fr(y / 0.8);
  let c: string;
  if (ju < 0.025 || jv < 0.03) c = CSTONE[0];
  else {
    const h0 = hash(Math.floor(u), row, 1831);
    let k = h0 < 0.3 ? 1 : h0 > 0.8 ? 3 : 2;
    if (over(fbm(x * 1.4, y * 1.4, 1833), 0.66, px, py)) k = Math.max(1, k - 1);
    c = CSTONE[k];
  }
  // the colours the windows throw: from each lancet in the left wall, the day falling in along (+x, -y, down)
  const lit = windowLight(x, y);
  if (lit) c = mix(mix(c, '#b8b4bc', 0.35), lit, 0.5);
  return c;
}

// =================================================================================================
// THE STAINED GLASS (the chapel): leaded panes in pointed lancets, the book's first page

/** The lancets in the chapel's left wall (y of their middles), and the great window in its back wall (x of its middle). */
const LANCETS = [1.3, 3.1, 4.9];
const LANCET = { half: 0.36, z0: 28, z1: 96 };
const GREAT = { x: -3.7, half: 0.85, z0: 22, z1: 98 };
/** The glass of a lancet at (a across from its middle, in tiles; z up): its pane's colour, or null outside it. */
function lancetGlass(a: number, z: number, half: number, z0: number, z1: number, k: number): string | null {
  // the pointed head: two arcs meeting at the top
  const spring = z1 - half * 40 * 1.25;
  if (z < z0 || Math.abs(a) > half) return null;
  if (z > spring) {
    const r = half * 2;
    const dz = (z - spring) / 40;
    const off = Math.abs(a) + half;
    if (Math.hypot(off, dz * 1.15) > r) return null;
  }
  // the lead: a border, and the panes in small quarries
  const edge = half - Math.abs(a) < 0.05 || z - z0 < 2;
  if (edge) return LEADING;
  const qa = a / 0.18;
  const qz = (z - z0) / 9;
  if (Math.abs(fr(qa + 0.5) - 0.5) < 0.09 || Math.abs(fr(qz) - 0.5) > 0.44) return LEADING;
  // THE BOOK'S FIRST PAGE (Grimm, "Snow White"): a queen sewing at a window framed in black ebony, the snow falling, three
  // drops of blood. The lancets: the snow (white quarries) round a band of ebony (the window frame), three red drops; a
  // gold border. The great window: the queen at her window, in violet and gold, the snow round her.
  const tone = hash(Math.floor(qa + 50), Math.floor(qz), 1841 + k) > 0.6 ? 1 : 0;
  const t = (z - z0) / (z1 - z0);
  if (half - Math.abs(a) < 0.11) return GLASS_C.gold[tone];
  if (k < 3) {
    // a lancet: the snow, a frame of ebony across it, the drops
    if (Math.abs(t - 0.42) < 0.05) return GLASS_C.ebony[tone];
    const drop = [0.18, 0.28, 0.36].findIndex((dz, i) => Math.hypot(a - (i - 1) * 0.1, (t - dz - 0.06) * 1.6) < 0.06);
    if (drop >= 0 && k === 1) return GLASS_C.ruby[1];
    if (t > 0.78) return GLASS_C.blue[tone];
    return t < 0.42 ? GLASS_C.snow[tone] : GLASS_C.pale[tone];
  }
  // the great window: a frame of ebony, in it the queen in violet, her crown gold; the snow round her; a red drop under
  const inFrame = Math.abs(a) < half * 0.62 && t > 0.2 && t < 0.78;
  const onFrame = inFrame && (half * 0.62 - Math.abs(a) < 0.1 || t < 0.25 || t > 0.73);
  if (onFrame) return GLASS_C.ebony[tone];
  if (inFrame) {
    // the queen: her head and her shoulders, her gown down to the sill, her crown
    const ha = a / (half * 0.62);
    const head = Math.hypot(ha * 1.2, (t - 0.6) * 4) < 0.24;
    const crown = Math.abs(ha) < 0.22 && t > 0.64 && t < 0.69;
    const gown = t < 0.56 && Math.abs(ha) < 0.25 + (0.56 - t) * 1.6;
    if (crown) return GLASS_C.gold[1];
    if (head) return GLASS_C.snow[1];
    if (gown) return GLASS_C.violet[tone];
    return GLASS_C.blue[tone];
  }
  if (t < 0.2 && Math.hypot(a, (t - 0.11) * 1.6) < 0.07) return GLASS_C.ruby[1];
  return t > 0.8 ? GLASS_C.blue[tone] : GLASS_C.snow[tone];
}
/** The day through a lancet, where it lies on the chapel's floor (the colour it gives there), or null. */
function windowLight(x: number, y: number): string | null {
  // the day comes in along (+x, -y, down): a point of the floor (x - xw) across from the wall saw the window at height z
  const d = x - CHAPEL.x0;
  if (d <= 0) return null;
  const z = d / 0.0215;
  const yw = y + d;
  for (let k = 0; k < LANCETS.length; k++) {
    const g = lancetGlass(yw - LANCETS[k], z, LANCET.half, LANCET.z0, LANCET.z1, k);
    if (g && g !== LEADING) return g;
  }
  return null;
}

// =================================================================================================
// THE WALLS

/** The bay a point along the back wall is in, and how far across it (0..BAY). */
const bayOf = (x: number): [number, number] => {
  const k = Math.floor((x - BAY0) / BAY);
  return [k, x - BAY0 - k * BAY];
};
/** The fade of a wall's top into the dark over the hall (the game's walls fade so), in steps. */
function fade(c: string, z: number, px: number, py: number): string {
  if (z < 70) return c;
  const t = clamp((z - 70) / (WH - 70), 0, 1) * 0.62;
  const q = Math.floor(t * 4 + BAYER[py & 1][px & 1] * 0.999) / 4;
  return mix(c, DEEP, q);
}
/**
 * A WALL OF THE GALLERY, `a` along it (tiles) and `z` up: a dado of grey marble, then violet silk woven in a damask, a
 * pilaster of grey marble at each bay's edge, its base and its capital; a cornice at its top. `shade`: the face turned
 * from the light (the left wall), a tone darker throughout.
 */
function galleryWall(a: number, z: number, px: number, py: number, shade: boolean, pil: (a: number) => number): string {
  const s = shade ? -1 : 0;
  const t = (k: number): number => clamp(k + s, 0, 4);
  // the cornice: mouldings stepped out at the top
  if (z > WH - 9) {
    const m = WH - z;
    return SILVER[t(m < 1.5 ? 4 : m < 3 ? 2 : m < 5 ? 3 : m < 7 ? 1 : 2)];
  }
  // the pilaster: fluted, a base and a capital
  const pd = pil(a);
  if (pd < 0.24) {
    if (z < 26) return SILVER[t(z > 23 ? 4 : z > 20 ? 2 : 3)];
    if (z > WH - 20) return SILVER[t(z > WH - 12 ? 1 : (z + Math.floor(pd * 40)) % 4 < 2 ? 3 : 2)];
    if (pd > 0.2) return SILVER[t(1)];
    const flute = fr(pd * 12) < 0.3;
    return SILVER[t(flute ? 2 : 3)];
  }
  // the dado: grey marble panels, a moulded rail along its top, a skirting
  if (z < 26) {
    if (z > 23) return SILVER[t(z > 24.5 ? 4 : 2)];
    if (z < 3) return VIOLET[t(1)];
    const pa = fr(a / 1.0 + 0.25);
    if (pa < 0.03 || z < 5 || z > 21) return SILVER[t(1)];
    const vein = Math.abs(fbm(a * 2.4, z / 14, 1851) - 0.5) < 0.02;
    return SILVER[t(vein ? 1 : 2)];
  }
  // the silk, a damask woven in it: an ogee of leaves, a bloom in each, repeating
  const ua = a / 0.5;
  const uz = (z - 26) / 24;
  const iu = Math.floor(ua);
  const iz = Math.floor(uz);
  const lu = fr(ua + (iz % 2) * 0.5) - 0.5;
  const lz = fr(uz) - 0.5;
  const ogee = Math.abs(Math.abs(lu) - 0.32 * Math.cos(lz * Math.PI)) < 0.05;
  const bloom = Math.hypot(lu * 1.6, lz) < 0.13 || (Math.abs(lu) < 0.05 && lz > 0 && lz < 0.32);
  void iu;
  let k = 2;
  if (ogee || bloom) k = 3;
  else if (hash(px >> 1, py, 1853) < 0.08) k = 1;
  // the sheen of silk: lighter in long folds across the face
  if (!shade && Math.abs(fr(a * 0.37 + z * 0.004) - 0.5) < 0.08 && k === 2) k = 3;
  return SILK[t(k)];
}
/** How far a point along the back wall is from the nearest pilaster's middle (tiles). */
const backPil = (a: number): number => {
  const k = Math.round((a - BAY0) / BAY);
  return Math.abs(a - (BAY0 + k * BAY));
};
/** How far a point along the left wall is from its pilasters' middles (at y 0.6, 2.0, 4.6, 7.0: either side of the doorway and the mirror). */
const leftPil = (a: number): number => Math.min(...[0.4, 2.1, 4.5, 7.4].map((p) => Math.abs(a - p)));

// =================================================================================================
// THE MIRRORS: their glass gives back what is before them, faintly

/** A mirror on the back wall (its glass's x from x0 to x1, z from z0 to z1), or on the left wall (along y). */
interface Mirror {
  /** 'back' (its glass along x at y = 0) or 'left' (along y at x = 0). */
  wall: 'back' | 'left';
  a0: number;
  a1: number;
  z0: number;
  z1: number;
  /** whole, cracked or burst */
  state: 'whole' | 'cracked' | 'burst';
  /** its picture id (the knight's likeness goes only where it is) */
  id: number;
}
export const MIRRORS: Mirror[] = [];
/** A candle's flame, as the mirrors see it. */
const FLAMES: V3[] = [];

/** What the glass of a mirror gives back at its point (a along the wall, z up): the floor before it, darker and in the glass's cold grey. */
function reflection(m: Mirror, a: number, z: number, px: number, py: number, da = 0, dz = 0): string {
  // the eye's way, turned back off the glass, meets the floor `z / 32` tiles out from the wall and as far along it the other way
  const zz = z + dz;
  const d = zz / 32;
  const fx = m.wall === 'back' ? a + da - d : d;
  const fy = m.wall === 'back' ? d : a + da - d;
  let c: string;
  if (fx < 0 || fx > HX || fy > HY) c = DEEP;
  else if (fy >= RUN.y0 && fy < RUN.y1 && m.wall === 'back') c = runner(fx, fy, px, py);
  else c = galleryFloor(fx, fy, px, py);
  // the far wall of the hall would be there, cut away as the game cuts it: past the floor, the dark
  let out = mix(mix(c, MIRROR[2], 0.42), MIRROR[3], 0.12);
  // the candles before it, given back
  for (const f of FLAMES) {
    const along = m.wall === 'back' ? f[0] / U + f[1] / U : f[1] / U + f[0] / U;
    const at = f[2] + 32 * (m.wall === 'back' ? f[1] / U : f[0] / U);
    const ea = (a + da - along) * 32;
    const ez = zz - at;
    if (Math.abs(ea) < 1.2 && ez > -1 && ez < 3) return ez < 1 ? FLAME_HI : FLAME_LO;
    if (Math.abs(ea) < 3 && Math.abs(ez - 1) < 5) out = mix(out, EMBER[2], 0.14);
  }
  // its silver: a long sheen across it, falling from the upper left; foxed and grey at its edges, with age
  const sheen = fr((a * 32 - z * 0.9) / 46 + m.id * 0.37);
  if (sheen < 0.05) out = mix(out, MIRROR[4], 0.62);
  else if (sheen < 0.09) out = mix(out, MIRROR[4], 0.3);
  else if (sheen > 0.55 && sheen < 0.58) out = mix(out, MIRROR[4], 0.3);
  const edge = Math.min(a - m.a0, m.a1 - a) * 32;
  const fox = vnoise(a * 9, z / 6, 1861 + m.id);
  if (edge < 6 && fox > 0.55) out = mix(out, MIRROR[2], 0.6);
  if ((z - m.z0 < 5 || m.z1 - z < 4) && fox > 0.62) out = mix(out, MIRROR[2], 0.5);
  if (hash(px, py, 1863) > 0.993) out = MIRROR[0];
  return out;
}

/** THE CRACKED MIRROR: a blow's mark, its cracks running out from it; each piece gives back the hall a little askew; near the blow, pieces gone. */
function cracked(m: Mirror, a: number, z: number, px: number, py: number): string | null {
  const ca = m.a0 + (m.a1 - m.a0) * 0.42;
  const cz = 58;
  const da = (a - ca) * 32;
  const dz = z - cz;
  const r = Math.hypot(da, dz * 1.1);
  const ang = Math.atan2(dz, da);
  // the cracks: rays out from the blow, and rings round it
  const rays = 11;
  const s = ((ang / (Math.PI * 2)) * rays + rays) % rays;
  const sector = Math.floor(s + 0.35 * Math.sin(r * 0.11 + Math.floor(s)));
  const sOff = s + 0.35 * Math.sin(r * 0.11 + Math.floor(s)) - sector;
  const ringR = [7, 15, 26, 40];
  const ring = ringR.findIndex((rr) => r < rr + 2 * Math.sin(ang * 3 + rr));
  const band = ring < 0 ? ringR.length : ring;
  const onRay = (sOff < 0.035 || sOff > 0.965) && r > 2 && r < 70 - 10 * hash(sector, 0, 1871);
  const onRing = ringR.some((rr, i) => i < 3 && Math.abs(r - (rr + 2 * Math.sin(ang * 3 + rr))) < 0.7 && hash(sector, i, 1873) > 0.3);
  // gone, near the blow: the backing boards behind, dark
  if (r < 6 || (band === 1 && hash(sector, 1, 1875) > 0.55) || (band === 0)) return r < 3 ? '#140f14' : (px + py) % 5 === 0 ? '#2a2024' : '#1e171c';
  if (onRay || onRing) return (px + py) % 2 ? MIRROR[4] : MIRROR[3];
  // each piece a little askew
  const h = hash(sector, band, 1877);
  return reflection(m, a, z, px, py, (h - 0.5) * 0.3, (hash(sector, band, 1879) - 0.5) * 10 + band * 2);
}

/** THE BURST MIRROR: its frame empty but for teeth of glass round its edge; the backing boards behind, old silvering on them. */
function burst(m: Mirror, a: number, z: number, px: number, py: number): string | null {
  const ea = Math.min(a - m.a0, m.a1 - a) * 32;
  const ez = Math.min(z - m.z0, m.z1 - z);
  // teeth of glass left in the frame
  const along = m.wall === 'back' ? a * 32 : z;
  const tooth = 3 + 9 * Math.abs(Math.sin(along * 0.37 + z * 0.21)) * hash(Math.floor(along / 7), Math.floor(z / 9), 1881);
  if (ea < tooth || ez < tooth * 0.8) {
    if (ea < 1.2 || ez < 1.2) return MIRROR[0];
    return reflection(m, a, z, px, py, 0.1, 4);
  }
  // the backing: boards, upright, dark; stains of the silver come off on them
  const board = fr(a * 32 / 7) < 0.12;
  if (board) return '#120e12';
  const stain = vnoise(a * 7, z / 8, 1883) > 0.62;
  return stain ? '#3a3a46' : hash(Math.floor(a * 32 / 7), 0, 1885) > 0.5 ? '#2a2026' : '#241c22';
}

/**
 * A FRAME of carved gilt round a mirror's glass (on the picture's own grain: across it `A` picture pixels, up it `Z`): an
 * inner bead, a carved flat, an outer bead; a leaf of acanthus curling out at each corner, a shell hung under its foot,
 * and its crest, a cartouche of scrolls with a crown of glass spikes on it (the Queen's: her doc's "a crown of glass
 * spikes"). Its tone: an index into GILT (or a glass spike's into MIRROR, as 10 + k), or null where there is nothing.
 */
export function frameAt(A: number, Z: number, A0: number, A1: number, Z0: number, Z1: number): number | null {
  const FW = 5;
  const inA = A >= A0 && A < A1;
  const inZ = Z >= Z0 && Z < Z1;
  if (inA && inZ) return null;
  const ox = Math.max(A0 - A, A - A1 + 1, 0);
  const oz = Math.max(Z0 - Z, Z - Z1 + 1, 0);
  const am = (A0 + A1) / 2;
  // THE CREST: a cartouche of two scrolls, and the crown of glass spikes on it
  const cz = Z1 + FW;
  {
    const x = A - am;
    const y = Z - cz;
    // the crown: a band of gilt, five spikes of glass on it, the middle one tallest
    if (y >= 8 && y < 10 && Math.abs(x) < 8) return y === 9 ? 4 : 2;
    for (let i = -2; i <= 2; i++) {
      const h = i === 0 ? 11 : Math.abs(i) === 1 ? 8 : 6;
      const xi = i * 3.4;
      const t = (y - 10) / h;
      if (t >= 0 && t < 1 && Math.abs(x - xi) < 1.7 * (1 - t) + 0.2) return 10 + (x - xi < -0.3 ? 4 : t > 0.6 ? 3 : 2);
    }
    // the cartouche: a shield of gilt, its edge rolled, between two scrolls curling out and down
    const sh = Math.abs(x) / 6 + Math.max(0, -y) / 4 + Math.max(0, y - 6) / 3;
    if (y > -3 && y < 8 && sh < 1) return sh > 0.75 ? (x < 0 || y > 4 ? 4 : 1) : Math.abs(x) < 2 && y > 1 && y < 5 ? 1 : 3;
    for (const s of [-1, 1]) {
      const dx = x - s * 8.5;
      const dy = y - 2;
      const r = Math.hypot(dx, dy * 1.2);
      const ang = Math.atan2(dy, dx * s);
      // a C-scroll: a ring open toward the shield, its end curled in
      if (r > 2.2 && r < 4.2 && !(ang > 2.2 || ang < -2.6)) return dy > 0 ? 4 : r > 3.4 ? 1 : 3;
      if (r <= 1.4 && dy > -1) return 2;
    }
  }
  // THE SHELL under its foot: a fan of ribs
  {
    const x = A - am;
    const y = Z0 - FW - Z;
    if (y >= -1 && y < 7) {
      const r = Math.hypot(x, y * 1.4);
      if (r < 8) {
        const rib = Math.abs(fr((Math.atan2(y, x) / Math.PI) * 5) - 0.5) < 0.16;
        return r > 6.6 ? 1 : rib ? 4 : 2;
      }
    }
  }
  // A LEAF OF ACANTHUS at each corner, curling out past the frame
  for (const [cxA, czA, sx, sz] of [[A0 - FW / 2, Z1 + FW / 2, -1, 1], [A1 + FW / 2, Z1 + FW / 2, 1, 1], [A0 - FW / 2, Z0 - FW / 2, -1, -1], [A1 + FW / 2, Z0 - FW / 2, 1, -1]] as const) {
    const x = (A - cxA) * sx;
    const y = (Z - czA) * sz;
    if (x < -2 || y < -2) continue;
    const r = Math.hypot(x, y);
    const th = Math.atan2(y, x);
    const lobe = 4.2 + 1.6 * Math.cos(th * 6);
    if (r < lobe && th > -0.3 && th < Math.PI / 2 + 0.3) {
      const vein = Math.abs(th - Math.PI / 4) < 0.12 && r > 1.5;
      const litSide = sx < 0 || sz > 0;
      return vein ? 1 : r > lobe - 1 ? (litSide ? 4 : 1) : 3;
    }
  }
  // THE FRAME ITSELF
  if (ox > FW || oz > FW) return null;
  const d = Math.max(ox, oz);
  // which side: the top and the left catch the light
  const top = oz >= ox && Z >= Z1;
  const left = ox > oz && A < A0;
  const lit = top || left;
  if (d < 1) return 0;
  if (d < 2) return lit ? 4 : 2;
  if (d < 4) {
    const along = oz >= ox ? A : Z;
    return (Math.floor(along / 2) + Math.floor(d)) % 3 === 0 ? 1 : lit ? 3 : 2;
  }
  return lit ? 3 : 1;
}
/** Lay a mirror's frame into the picture, a little proud of its glass. */
function mirrorFrame(S: Scene, m: Mirror, id: number): void {
  const off = 0.07;
  const A0 = Math.round(m.a0 * 32);
  const A1 = Math.round(m.a1 * 32);
  const ma = 14 / 32;
  const q: (readonly [number, number, number])[] = m.wall === 'back'
    ? [[m.a0 - ma, off, m.z0 - 16], [m.a1 + ma, off, m.z0 - 16], [m.a1 + ma, off, m.z1 + 30], [m.a0 - ma, off, m.z1 + 30]]
    : [[off, m.a0 - ma, m.z0 - 16], [off, m.a1 + ma, m.z0 - 16], [off, m.a1 + ma, m.z1 + 30], [off, m.a0 - ma, m.z1 + 30]];
  quadT(S, q, (x, y, z, px, py) => {
    const a = m.wall === 'back' ? x : y;
    const t = frameAt(Math.floor(a * 32), Math.floor(z), A0, A1, m.z0, m.z1);
    if (t === null) return null;
    let c = t >= 10 ? MIRROR[t - 10] : GILT[t];
    if (m.wall === 'left') c = mix(c, DEEP, 0.28);
    return fade(c, z, px, py);
  }, id);
}

// =================================================================================================
// WHAT STANDS: a candelabrum, a bench, the shards

/** A TALL STANDING CANDELABRUM of silver: three feet, a turned stem, five arms, five candles burning. */
function candelabrum(S: Scene, x: number, y: number, id: number): void {
  SHADOWS.push([x, y, 0.3]);
  const c = v(x, y, 0);
  const R = SILVER;
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + 0.5;
    rod(S, [c[0], c[1], 6], [c[0] + Math.cos(ang) * 9, c[1] + Math.sin(ang) * 9, 0.5], 1.3, 1, R, id);
  }
  rod(S, [c[0], c[1], 4], [c[0], c[1], 66], 1.6, 1.3, R, id);
  for (const z of [14, 30, 48]) S.egg([c[0], c[1], z], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 3, 2.4], (n) => toneAt(n, R, 0.1), id);
  // the arms: two each side curving up, one up the middle
  const tops: V3[] = [[c[0], c[1], 74]];
  for (const s of [-1, 1]) {
    for (const reach of [8, 15]) {
      const a0: V3 = [c[0], c[1], 58];
      const mid: V3 = [c[0] + s * reach * 0.6, c[1] - s * reach * 0.6, 56];
      const top: V3 = [c[0] + s * reach * 0.707, c[1] - s * reach * 0.707, reach > 10 ? 64 : 68];
      rod(S, a0, mid, 1, 1, R, id);
      rod(S, mid, top, 1, 1, R, id);
      tops.push(top);
    }
  }
  for (const t of tops) {
    cylinder(S, t[0], t[1], 2.6, t[2] - 1, t[2] + 1, (n) => toneAt(n, R, 0.2), id, () => R[4]);
    cylinder(S, t[0], t[1], 1.4, t[2] + 1, t[2] + 6, (n) => toneAt(n, WAX, 0.1), id + 1, () => WAX[3]);
    const [fx, fy] = pixOf(S, [t[0], t[1], t[2] + 7]);
    S.put(fx, fy, 1e5, EMBER[2], id + 2);
    S.put(fx, fy - 1, 1e5, FLAME_HI, id + 2);
    S.put(fx, fy - 2, 1e5, FLAME_HI, id + 2);
    S.put(fx + 1, fy - 1, 1e5, FLAME_LO, id + 2);
    S.put(fx, fy - 3, 1e5, FLAME_LO, id + 2);
    FLAMES.push([t[0], t[1], t[2] + 9]);
  }
}
/** A LONG BENCH of gilt and violet velvet along the wall, its seat buttoned, its legs turned. */
function bench(S: Scene, x0: number, x1: number, y: number, id: number): void {
  SHADOWS.push([(x0 + x1) / 2, y + 0.1, 0.55]);
  for (const x of [x0 + 0.1, x1 - 0.1]) for (const dy of [-0.15, 0.15]) rod(S, v(x, y + dy, 0), v(x, y + dy, 11), 1.1, 1.3, GILT, id);
  block(S, x0, y - 0.22, x1, y + 0.22, 10, 13, GILT, id);
  block(S, x0 + 0.03, y - 0.2, x1 - 0.03, y + 0.2, 13, 17, VELVET, id + 1, (f, u, vv) => (f === 4 && fr(u * 6) < 0.08 && Math.abs(vv - 0.5) < 0.1 ? -0.6 : 0));
}
/** SHARDS OF A MIRROR on the floor under it, strewn out in a fan, each a sliver of the glass catching the light. */
function shards(S: Scene, x: number, y: number, spread: number, n: number, id: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const a = (hash(i, 1, seed) - 0.5) * Math.PI * 0.9 + Math.PI / 4;
    const d = 0.08 + Math.pow(hash(i, 2, seed), 0.7) * spread;
    const sx = x + Math.cos(a) * d * 0.9;
    const sy = y + Math.sin(a) * d;
    const L = 3 + hash(i, 3, seed) * 7;
    const t = hash(i, 4, seed) * Math.PI;
    const p0 = v(sx, sy, 0.6);
    const p1: V3 = [p0[0] + Math.cos(t) * L, p0[1] + Math.sin(t) * L, 0.6];
    const p2: V3 = [p0[0] + Math.cos(t + 1.2) * L * 0.5, p0[1] + Math.sin(t + 1.2) * L * 0.5, 0.6];
    S.quad([p0, p1, p2, p2], (u) => (u > 0.6 ? MIRROR[4] : hash(i, 5, seed) > 0.5 ? MIRROR[3] : MIRROR[2]), id);
  }
}
/** A PEDESTAL of grey marble, fluted, its base and capital; on it a silver urn of orchids, dead, their stems bowed over its lip. */
function pedestal(S: Scene, x: number, y: number, id: number): void {
  SHADOWS.push([x, y, 0.3]);
  const c = v(x, y, 0);
  cylinder(S, c[0], c[1], 8, 0, 4, (n) => toneAt(n, SILVER, 0), id, () => SILVER[3]);
  cylinder(S, c[0], c[1], (z) => 5.6 - z * 0.012, 4, 40, (n, a) => toneAt(n, SILVER, Math.abs(Math.sin(a * 8)) < 0.3 ? -0.3 : 0.05), id);
  cylinder(S, c[0], c[1], (z) => 5 + (z - 40) * 0.9, 40, 44, (n) => toneAt(n, SILVER, 0.15), id, () => SILVER[3]);
  // the urn: a foot, a swelling belly, a flared lip
  cylinder(S, c[0], c[1], (z) => (z < 47 ? 3.4 : 3.4 + Math.sin(((z - 47) / 13) * Math.PI) * 3.4 + (z > 57 ? (z - 57) * 0.6 : 0)), 44, 61, (n) => toneAt(n, SILVER, 0.1), id + 1, () => '#16121a');
  deadOrchid(S, x, y, 54, 77, id + 2, true);
}
/** A CONSOLE TABLE of gilt under a mirror, its top of violet marble, a jewel box and a hand mirror left on it. */
function console(S: Scene, x: number, id: number): void {
  SHADOWS.push([x, 0.35, 0.5]);
  for (const dx of [-0.42, 0.42]) {
    const a = v(x + dx, 0.34, 0);
    // its legs: scrolled, gilt
    rod(S, [a[0], a[1], 0], [a[0], a[1] - 3, 14], 1.4, 1.1, GILT, id);
    rod(S, [a[0], a[1] - 3, 14], [a[0], a[1] - 6, 25], 1.1, 1.5, GILT, id);
  }
  block(S, x - 0.55, 0.06, x + 0.55, 0.42, 22, 26, GILT, id, (f, u) => (f === 2 && fr(u * 10) < 0.25 ? -0.5 : 0));
  block(S, x - 0.6, 0.04, x + 0.6, 0.46, 26, 28, VIOLET, id + 1);
  // the jewel box: dark wood bound in silver, its lid a little open
  block(S, x - 0.3, 0.16, x - 0.06, 0.32, 28, 33, POAK, id + 2, (f, u) => (f !== 4 && (u < 0.1 || u > 0.9) ? 0.6 : 0));
  // a hand mirror laid face up: its glass the sky's grey, its silver handle
  const h = v(x + 0.22, 0.26, 28.6);
  S.egg(h, [[0.707, -0.707, 0], [0.707, 0.707, 0], [0, 0, 1]], [3.4, 2.6, 0.6], (n) => (n[2] > 0.9 ? MIRROR[3] : SILVER[3]), id + 3);
  rod(S, [h[0] + 3, h[1] - 3, 28.6], [h[0] + 8, h[1] - 8, 28.6], 0.7, 0.6, SILVER, id + 3);
}

// =================================================================================================
// THE CHAPEL'S PEWS AND ITS CANDLES

function pew(S: Scene, x0: number, x1: number, y: number, id: number): void {
  for (let x = x0 + 0.3; x < x1; x += 0.6) SHADOWS.push([x, y + 0.1, 0.32]);
  block(S, x0, y - 0.18, x1, y + 0.18, 10, 12, POAK, id);
  block(S, x0, y - 0.24, x1, y - 0.18, 12, 26, POAK, id, (f, u) => (f === 2 && fr(u * 5) < 0.06 ? -0.5 : 0));
  for (const x of [x0, x1]) block(S, x - 0.04, y - 0.26, x + 0.04, y + 0.2, 0, 28, POAK, id + 1);
}

// =================================================================================================
// THE GLASSHOUSE: built opaque (its iron, its staging, the orchids), then its glass laid over

interface GlassQuad { q: readonly (readonly [number, number, number])[]; roof: boolean; broken: (u: number, vv: number) => boolean }
const GLASS: GlassQuad[] = [];

/**
 * AN ORCHID, DEAD, in its pot: broad leathery leaves gone yellow-brown and flopped over the rim, a few dry grey roots
 * curling out, and its flower spike, arched up and bowed over, the last blooms on it shrivelled small and brown-mauve.
 */
function deadOrchid(S: Scene, x: number, y: number, z: number, seed: number, id: number, noPot = false): void {
  const c = v(x, y, z);
  if (!noPot) cylinder(S, c[0], c[1], (zz) => 3.8 + (zz - z) * 0.2, z, z + 8, (n) => toneAt(n, CLAYPOT, 0), id, () => '#1a1210');
  const top = z + 7.5;
  // its leaves: each a long, broad blade, its tip drooped down over the pot's lip
  const nl = 3 + Math.floor(hash(seed, 1, 1890) * 2);
  for (let i = 0; i < nl; i++) {
    const a = (i / nl) * Math.PI * 2 + hash(i, seed, 1891) * 0.8;
    const d: V3 = [Math.cos(a), Math.sin(a), 0];
    const mid: V3 = [c[0] + d[0] * 5, c[1] + d[1] * 5, top + 1.5];
    const A: V3 = [d[0] * 0.8, d[1] * 0.8, -0.6];
    const n = Math.hypot(A[0], A[1], A[2]);
    const A0: V3 = [A[0] / n, A[1] / n, A[2] / n];
    const A1: V3 = [-d[1], d[0], 0];
    const A2: V3 = [A0[1] * A1[2] - A0[2] * A1[1], A0[2] * A1[0] - A0[0] * A1[2], A0[0] * A1[1] - A0[1] * A1[0]];
    S.egg(mid, [A0, A1, A2], [6, 2.3, 0.7], (nn) => toneAt(nn, DRY, 0.15), id + 1);
  }
  // dry roots, grey, curling out over the rim
  for (let r = 0; r < 2; r++) {
    const a = hash(r, seed, 1892) * Math.PI * 2;
    rod(S, [c[0] + Math.cos(a) * 3, c[1] + Math.sin(a) * 3, top], [c[0] + Math.cos(a) * 7, c[1] + Math.sin(a) * 7, top - 4], 0.5, 0.4, IVORY, id + 1);
  }
  // the flower spike: up, then bowed over; its withered blooms along its outer half
  const b = hash(seed, 2, 1893) * Math.PI * 2;
  const pts: V3[] = [];
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    const out = t * 12;
    const up = Math.sin(t * Math.PI * 0.85) * 22;
    pts.push([c[0] + Math.cos(b) * out, c[1] + Math.sin(b) * out, top + up - t * 6]);
  }
  for (let k = 0; k < pts.length - 1; k++) rod(S, pts[k], pts[k + 1], 0.55, 0.5, DRY, id + 2);
  for (let k = 3; k < pts.length; k++) {
    const p = pts[k];
    const R = hash(seed, k, 1894) > 0.4 ? BLOOM : DRY;
    S.egg([p[0], p[1], p[2] - 1.6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.7, 1.7, 1.4], (n) => toneAt(n, R, -0.1), id + 3);
  }
}
/** THE STAGING: slatted benches of iron and wood along the glasshouse, two tiers. */
function staging(S: Scene, x0: number, x1: number, y: number, z: number, id: number): void {
  for (let x = x0 + 0.1; x <= x1; x += 1.2) for (const dy of [-0.3, 0.3]) rod(S, v(x, y + dy, z), v(x, y + dy, z + 20), 1, 1, IRONS, id);
  block(S, x0, y - 0.38, x1, y + 0.38, z + 18, z + 20, POAK, id + 1, (f, u, vv) => (f === 4 && fr(vv * 5) < 0.18 ? -0.7 : 0));
}

function glasshouse(S: Scene): void {
  const g = GH;
  const Z = WH;
  // its base: a low wall of the pale stone round it
  block(S, g.x0, g.y0, g.x1, g.y1, Z, Z + g.base, CSTONE, 900, (f, u, vv) => (f !== 4 && fr((f === 2 ? u : vv) * 18) < 0.06 ? -0.6 : 0));
  // its floor within: tiles, dull
  quadT(S, [[g.x0 + 0.1, g.y0 + 0.1, Z + g.base + 0.5], [g.x1 - 0.1, g.y0 + 0.1, Z + g.base + 0.5], [g.x1 - 0.1, g.y1 - 0.1, Z + g.base + 0.5], [g.x0 + 0.1, g.y1 - 0.1, Z + g.base + 0.5]], (x, y, _z, px, py) => {
    const c = ((Math.floor(x * 3) + Math.floor(y * 3)) & 1) === 0;
    return hash(px >> 1, py, 1895) < 0.1 ? CSTONE[1] : c ? CSTONE[2] : CSTONE[1];
  }, 901);
  const zb = Z + g.base;
  // the staging, two benches along its length; and down the middle a third; the dead orchids on them
  staging(S, g.x0 + 0.4, g.x1 - 0.4, g.y0 + 0.6, zb, 910);
  staging(S, g.x0 + 0.4, g.x1 - 0.4, (g.y0 + g.y1) / 2, zb, 920);
  let seed = 0;
  for (const yy of [g.y0 + 0.6, (g.y0 + g.y1) / 2]) {
    for (let x = g.x0 + 0.6; x < g.x1 - 0.4; x += 0.7) {
      for (const dy of [-0.2, 0.2]) {
        if (hash(seed, 7, 1897) < 0.15) {
          seed++;
          continue;
        }
        deadOrchid(S, x + (hash(seed, 8, 1897) - 0.5) * 0.15, yy + dy, zb + 20, seed++, 930);
      }
    }
  }
  // THE IRON: its uprights, its sills and eaves, its ridge, the rafters of its roof
  const ex = [g.x0, g.x1];
  const ey = [g.y0, g.y1];
  const top = zb + g.eave;
  const ridge = zb + g.ridge;
  const ym = (g.y0 + g.y1) / 2;
  for (let x = g.x0; x <= g.x1 + 1e-6; x += 0.5) {
    for (const y of ey) rod(S, v(x, y, zb), v(x, y, top), 0.9, 0.9, IRONS, 950);
    // a rafter up the roof's two slopes
    rod(S, v(x, g.y1, top), v(x, ym, ridge), 0.8, 0.8, IRONS, 951);
    rod(S, v(x, g.y0, top), v(x, ym, ridge), 0.8, 0.8, IRONS, 951);
  }
  for (let y = g.y0 + 0.5; y < g.y1; y += 0.5) for (const x of ex) rod(S, v(x, y, zb), v(x, y, top), 0.9, 0.9, IRONS, 950);
  for (const z of [zb + 1, zb + g.eave * 0.45, top]) {
    for (const y of ey) rod(S, v(g.x0, y, z), v(g.x1, y, z), 1, 1, IRONS, 952);
    for (const x of ex) rod(S, v(x, g.y0, z), v(x, g.y1, z), 1, 1, IRONS, 952);
  }
  rod(S, v(g.x0, ym, ridge), v(g.x1, ym, ridge), 1.3, 1.3, IRONS, 953);
  // BASKETS hung from the ridge on chains, dead orchids in them, their dry roots trailing down
  for (const [bx, k] of [[10.4, 0], [12.6, 1], [14.2, 2]] as const) {
    const c = v(bx, ym, zb + 64);
    rod(S, [c[0], c[1], c[2] + 8], [c[0], c[1], ridge - 2], 0.4, 0.4, IRONS, 955);
    cylinder(S, c[0], c[1], (z) => 4 + (z - c[2]) * 0.5, c[2], c[2] + 7, (n, a) => toneAt(n, POAK, Math.abs(Math.sin(a * 5)) < 0.35 ? -0.6 : 0.1), 956, () => '#1a1210');
    for (let r = 0; r < 7; r++) {
      const a = (r / 7) * Math.PI * 2 + k;
      const L = 14 + hash(r, k, 1899) * 18;
      rod(S, [c[0] + Math.cos(a) * 4, c[1] + Math.sin(a) * 4, c[2] + 1], [c[0] + Math.cos(a) * 6, c[1] + Math.sin(a) * 6, c[2] - L], 0.6, 0.3, DRY, 957);
    }
    deadOrchid(S, bx, ym, c[2] + 5, 40 + k, 958, true);
  }
  // a finial at each end of the ridge, a spike of iron
  for (const x of ex) rod(S, v(x, ym, ridge), v(x, ym, ridge + 12), 1, 0.3, IRONS, 953);
  // the door at the stair's head: a pair of glazed leaves, one stood open
  const dx0 = STAIR.x0 + 0.15;
  const dx1 = STAIR.x1 - 0.15;
  rod(S, v(dx0, g.y1 + 0.02, zb), v(dx0, g.y1 + 0.02, zb + 60), 1.1, 1.1, IRONS, 954);
  rod(S, v(dx1, g.y1 + 0.02, zb), v(dx1, g.y1 + 0.02, zb + 60), 1.1, 1.1, IRONS, 954);
  rod(S, v(dx0, g.y1 + 0.02, zb + 60), v(dx1, g.y1 + 0.02, zb + 60), 1.1, 1.1, IRONS, 954);
  // the glass: the walls' panes, the roof's, and the gable at its near end; some panes broken
  const brokenAt = (k: number) => (u: number, vv: number): boolean => {
    const cu = Math.floor(u * 12);
    const cv = Math.floor(vv * 3);
    return hash(cu, cv, 1901 + k) > 0.9;
  };
  GLASS.push({ q: [[g.x0, g.y1, zb], [g.x1, g.y1, zb], [g.x1, g.y1, top], [g.x0, g.y1, top]], roof: false, broken: brokenAt(0) });
  GLASS.push({ q: [[g.x1, g.y1, zb], [g.x1, g.y0, zb], [g.x1, g.y0, top], [g.x1, g.y1, top]], roof: false, broken: brokenAt(1) });
  GLASS.push({ q: [[g.x0, g.y1, top], [g.x1, g.y1, top], [g.x1, ym, ridge], [g.x0, ym, ridge]], roof: true, broken: brokenAt(2) });
  GLASS.push({ q: [[g.x0, ym, ridge], [g.x1, ym, ridge], [g.x1, g.y0, top], [g.x0, g.y0, top]], roof: true, broken: brokenAt(3) });
  GLASS.push({ q: [[g.x1, g.y1, top], [g.x1, ym, ridge], [g.x1, ym, ridge], [g.x1, g.y0, top]], roof: false, broken: brokenAt(4) });
}

// =================================================================================================
// THE STAIR UP TO THE ROOF

function stair(S: Scene): void {
  const s = STAIR;
  const n = s.steps;
  const rise = WH / n;
  const run = (s.foot - s.head) / n;
  const mid = (s.x0 + s.x1) / 2;
  for (let i = 0; i < n; i++) {
    const y1 = s.foot - i * run;
    const y0 = y1 - run;
    const z1 = rise * (i + 1);
    const z0 = z1 - rise;
    // the tread: grey marble, the violet runner up its middle held by a gilt rod, its nose worn and lit
    quadT(S, [[s.x0, y0, z1], [s.x1, y0, z1], [s.x1, y1, z1], [s.x0, y1, z1]], (x, y, _z, px, py) => {
      const nose = y > y1 - 0.05;
      const onRun = Math.abs(x - mid) < 0.5;
      if (onRun) {
        if (y > y1 - 0.08 && y < y1 - 0.04) return GILT[3];
        return nose ? VELVET[3] : VELVET[hash(px >> 1, py, 1913) > 0.85 ? 1 : 2];
      }
      if (nose) return SILVER[3];
      return SILVER[hash(Math.floor(x * 3), i, 1915) > 0.6 ? 2 : 1];
    }, 960 + (i % 2));
    // the riser, looking toward the hall: in its own shade
    quadT(S, [[s.x0, y1, z0], [s.x1, y1, z0], [s.x1, y1, z1], [s.x0, y1, z1]], (x, _y, z) => {
      if (Math.abs(x - mid) < 0.5) return z > z1 - 2 ? VELVET[2] : VELVET[1];
      return z > z1 - 1.5 ? SILVER[2] : SILVER[1];
    }, 962 + (i % 2));
    // (the first step stands out into the hall: its side)
    if (i === 0) quadT(S, [[s.x1, y1, z0], [s.x1, y0, z0], [s.x1, y0, z1], [s.x1, y1, z1]], () => SILVER[0], 964);
  }
  // the well's left side: the wall's own stone cut through to the roof, in shade
  quadT(S, [[s.x0, 0, 0], [s.x0, s.head, 0], [s.x0, s.head, WH], [s.x0, 0, WH]], (_x, y, z, px, py) => {
    const course = Math.floor(z / 10);
    const joint = fr(z / 10) < 0.1 || fr((y * 32 + course * 13) / 22) < 0.06;
    return fade(joint ? CSTONE[0] : CSTONE[hash(Math.floor((y * 32 + course * 13) / 22), course, 1911) > 0.5 ? 1 : 2], z + 10, px, py);
  }, 965);
}
/** The arch over the stair's way through the back wall: how high its opening is at x. */
const stairArch = (x: number): number => {
  const mid = (STAIR.x0 + STAIR.x1) / 2;
  const half = (STAIR.x1 - STAIR.x0) / 2;
  const u = (x - mid) / half;
  return 70 + 24 * Math.sqrt(Math.max(0, 1 - u * u));
};

// =================================================================================================
// THE SKYLIGHT IN THE FLOOR

/** The hall below, far down through the skylight's broken corner: its own floor, dim, a long way under. */
const BELOW = 112;
/** The floor's thickness under the skylight's frame. */
const THICK = 18;
function skylight(S: Scene): void {
  const k = SKY;
  // the drop's own walls, seen down the hole: the floor's thickness, joists, then the dark; and the floor below, dim
  quadT(S, [[k.x0 + 0.1, k.y0 + 0.1, -BELOW], [k.x1 - 0.1, k.y0 + 0.1, -BELOW], [k.x1 - 0.1, k.y1 - 0.1, -BELOW], [k.x0 + 0.1, k.y1 - 0.1, -BELOW]], () => null, 970);
  // the frame: a kerb of iron round it standing a little proud of the marble, and the glazing bars across it
  const R = IRONS;
  block(S, k.x0, k.y0, k.x1, k.y0 + 0.1, 0, 2.4, R, 971);
  block(S, k.x0, k.y1 - 0.1, k.x1, k.y1, 0, 2.4, R, 971);
  block(S, k.x0, k.y0, k.x0 + 0.1, k.y1, 0, 2.4, R, 971);
  block(S, k.x1 - 0.1, k.y0, k.x1, k.y1, 0, 2.4, R, 971);
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const x = k.x0 + (k.x1 - k.x0) * t;
    const y = k.y0 + (k.y1 - k.y0) * t;
    const keep = (q: number): boolean => !paneGone(x, q) || !paneGone(x, q + 0.01);
    // (a bar runs on where it still has a pane beside it; over the hole it is bent down and broken off)
    let y0 = k.y0;
    for (let q = k.y0; q <= k.y1 + 0.001; q += 0.05) {
      if (!keep(q) || q > k.y1 - 0.01) {
        if (q - y0 > 0.06) block(S, x - 0.03, y0, x + 0.03, Math.min(q, k.y1), 0, 1.6, R, 972);
        y0 = q + 0.05;
      }
    }
    let x0 = k.x0;
    for (let q = k.x0; q <= k.x1 + 0.001; q += 0.05) {
      if (!(!paneGone(q, y) || !paneGone(q + 0.01, y)) || q > k.x1 - 0.01) {
        if (q - x0 > 0.06) block(S, x0, y - 0.03, Math.min(q, k.x1), y + 0.03, 0, 1.6, R, 972);
        x0 = q + 0.05;
      }
    }
  }
  // the panes: thick frosted glass, the hall below a blur of light through it; cracked; at the near corner, gone
  quadT(S, [[k.x0 + 0.1, k.y0 + 0.1, 0.8], [k.x1 - 0.1, k.y0 + 0.1, 0.8], [k.x1 - 0.1, k.y1 - 0.1, 0.8], [k.x0 + 0.1, k.y1 - 0.1, 0.8]], (x, y, _z, px, py) => {
    const gone = paneGone(x, y);
    if (gone) return null;
    // the glass's broken edge round the hole, catching the light
    if (paneGone(x + 0.035, y + 0.035) || paneGone(x + 0.05, y) || paneGone(x, y + 0.05)) return (px + py) % 3 ? PANE[4] : PANE[3];
    // a crack across a pane
    const cu = (x - k.x0) / (k.x1 - k.x0);
    const cv = (y - k.y0) / (k.y1 - k.y0);
    const crack = Math.abs(cu - cv * 0.6 - 0.62) < 0.012 && cu > 0.55 || Math.abs(cv + cu * 0.4 - 0.9) < 0.01 && cv > 0.5;
    if (crack) return PANE[4];
    const g = fbm(x * 4, y * 4, 1921);
    let c = over(g, 0.55, px, py) ? PANE[2] : PANE[1];
    // thick glass: its lit edge along each pane's far sides, a glint here and there; the hall below a dim blur through it
    const ex = fr((x - k.x0) / (k.x1 - k.x0) * 5);
    const ey = fr((y - k.y0) / (k.y1 - k.y0) * 5);
    if (ex < 0.1 || ey < 0.1) c = PANE[3];
    else if (hash(px >> 1, py, 1923) > 0.97) c = PANE[3];
    else c = mix(c, belowFloor(x - BELOW / 32, y - BELOW / 32, px, py), 0.35);
    return mix(c, MIRROR[1], 0.2);
  }, 973);
}
/** Which of the skylight's panes are gone: a ragged hole at its near corner, the glass's teeth round it. */
function paneGone(x: number, y: number): boolean {
  const k = SKY;
  const cu = (x - k.x0) / (k.x1 - k.x0);
  const cv = (y - k.y0) / (k.y1 - k.y0);
  const r = Math.hypot(cu - 0.86, (cv - 0.9) * 1.1);
  const ang = Math.atan2(cv - 0.9, cu - 0.86);
  return r < 0.42 + 0.07 * Math.sin(ang * 7 + 1) + 0.04 * Math.sin(ang * 19);
}
/** The hall below's floor, dim and far; the day through the skylight lying on it in a square, the grid's shadow across it. */
function belowFloor(x: number, y: number, px: number, py: number): string {
  const c = galleryFloor(x + 3, y + 3, px, py);
  const k = SKY;
  if (x > k.x0 && x < k.x1 && y > k.y0 && y < k.y1) {
    const ex = fr((x - k.x0) / (k.x1 - k.x0) * 5);
    const ey = fr((y - k.y0) / (k.y1 - k.y0) * 5);
    if (ex < 0.07 || ey < 0.07) return mix(c, DEEP, 0.5);
    return mix(mix(c, MARBLE[4], 0.25), DEEP, 0.2);
  }
  return mix(c, DEEP, 0.66);
}
/** What is seen down the skylight's hole: the hole's far sides (the floor's thickness), then the hall below, far down. */
export function belowAt(px: number, py: number): string | null {
  // the world point at the hall below's height under this pixel, and at the floor's
  const a = (px + 0.5 - OX) / 32;
  const b = (py + 0.5 - OY) / 16;
  const fx = (a + b) / 2;
  const fy = (b - a) / 2;
  if (!(fx > SKY.x0 + 0.1 && fx < SKY.x1 - 0.1 && fy > SKY.y0 + 0.1 && fy < SKY.y1 - 0.1)) return null;
  if (!paneGone(fx, fy)) return null;
  // down the eye's way from the floor's level: back along (-1, -1), 32 picture pixels down a tile
  for (let d = 0; d <= BELOW; d += 1) {
    const x = fx - d / 32;
    const y = fy - d / 32;
    const inside = x > SKY.x0 + 0.1 && y > SKY.y0 + 0.1;
    if (!inside && d < THICK) {
      // the hole's side: the floor's thickness, marble, then rubble and the ends of joists
      if (d < 3) return MARBLE[3];
      if (d < 5) return MARBLE[1];
      const joist = fr((x + y) * 3) < 0.4;
      return d > THICK - 3 ? '#110d14' : joist ? '#33282c' : '#1e171c';
    }
    if (d === BELOW) return belowFloor(x, y, px, py);
  }
  return DEEP;
}

// =================================================================================================
// THE PAINTING

export interface Gallery {
  p: Px;
  /** For each picture pixel, which mirror's glass it is (its index + 1), or 0. */
  glassOf: Uint8Array;
}

export function paintGallery(): Gallery {
  MIRRORS.length = 0;
  FLAMES.length = 0;
  GLASS.length = 0;
  SHADOWS.length = 0;
  const S = new Scene(new Px(W, H), OX, OY);
  // ---- THE FLOORS
  quadT(S, [[0, 0, 0], [HX, 0, 0], [HX, HY, 0], [0, HY, 0]], (x, y, _z, px, py) => {
    if (x > SKY.x0 && x < SKY.x1 && y > SKY.y0 && y < SKY.y1) return null;
    let c = y >= RUN.y0 && y < RUN.y1 && x > 0.6 ? runner(x, y, px, py) : galleryFloor(x, y, px, py);
    // the floor dark in toward the walls, and toward the near edge where the near walls are cut away
    if (x < 0.2 || y < 0.2) c = mix(c, DEEP, 0.3);
    if (y > HY - 0.25 || x > HX - 0.25) c = mix(c, DEEP, 0.2);
    return c;
  }, 1);
  quadT(S, [[CHAPEL.x0, CHAPEL.y0, 0], [CHAPEL.x1, CHAPEL.y0, 0], [CHAPEL.x1, CHAPEL.y1, 0], [CHAPEL.x0, CHAPEL.y1, 0]], (x, y, _z, px, py) => {
    let c = chapelFloor(x, y, px, py);
    if (x < CHAPEL.x0 + 0.2 || y < 0.2) c = mix(c, DEEP, 0.3);
    return c;
  }, 2);
  // the floor through the doorway, between the two
  quadT(S, [[CHAPEL.x1 - 0.01, DOOR.y0, 0], [0.01, DOOR.y0, 0], [0.01, DOOR.y1, 0], [CHAPEL.x1 - 0.01, DOOR.y1, 0]], (x, y, _z, px, py) => mix(chapelFloor(x, y, px, py), DEEP, 0.15), 3);
  // ---- THE ROOF: lead in long bays, the glasshouse on it, the dark past it
  quadT(S, [[ROOF.x0, ROOF.y0, WH], [ROOF.x1, ROOF.y0, WH], [ROOF.x1, -WT, WH], [ROOF.x0, -WT, WH]], (x, y, _z, px, py) => (x > STAIR.x0 && x < STAIR.x1 && y > STAIR.head ? null : roofAt(x, y, px, py)), 5);
  // ---- THE WALLS: the gallery's back wall (along x, in the light), its left (along y, in shade); the chapel's
  const wallsZ = WH;
  // the back wall's face, the stair's way through it left open, the chapel's stretch with its great window
  quadT(S, [[CHAPEL.x0 - WT, 0, 0], [HX, 0, 0], [HX, 0, wallsZ], [CHAPEL.x0 - WT, 0, wallsZ]], (x, _y, z, px, py) => {
    if (x > STAIR.x0 && x < STAIR.x1 && z < stairArch(x)) return null;
    {
      // the arch's moulded surround, grey marble, its keystone
      const mid = (STAIR.x0 + STAIR.x1) / 2;
      const half = (STAIR.x1 - STAIR.x0) / 2;
      const u = (x - mid) / (half + 0.16);
      const ring = z >= 70 ? Math.hypot(u, (z - 70) / (24 + 6)) : Math.abs(u);
      if (ring < 1 && !(x > STAIR.x0 && x < STAIR.x1 && z < stairArch(x))) {
        if (Math.abs(x - mid) < 0.12 && z > 88) return fade(SILVER[z > 99 ? 4 : 3], z, px, py);
        return fade(SILVER[ring > 0.93 ? 1 : x < mid ? 3 : 2], z, px, py);
      }
    }
    if (x < -WT) {
      // the chapel's: its pale stone, the great window in it
      const g = lancetGlass(x - GREAT.x, z, GREAT.half, GREAT.z0, GREAT.z1, 3);
      if (g) return g;
      return fade(chapelWall(x, z, px, py, false), z, px, py);
    }
    if (x < 0) return fade(SILVER[1], z, px, py);
    return fade(galleryWall(x, z, px, py, false, backPil), z, px, py);
  }, 10);
  // the left wall's face, the doorway left open; and the chapel's left wall, its lancets
  quadT(S, [[0, 0, 0], [0, HY, 0], [0, HY, wallsZ], [0, 0, wallsZ]], (_x, y, z, px, py) => {
    const mid = (DOOR.y0 + DOOR.y1) / 2;
    const half = (DOOR.y1 - DOOR.y0) / 2;
    if (Math.abs(y - mid) < half) {
      // a pointed arch
      const spring = DOOR.top - 26;
      if (z < spring) return null;
      const off = Math.abs(y - mid) + half;
      if (Math.hypot(off, (z - spring) / 32 * 1.1) < half * 2) return null;
    }
    // the doorway's moulded surround, a step proud
    if (Math.abs(y - mid) < half + 0.16 && z < DOOR.top + 6) {
      const spring = DOOR.top - 26;
      const off = Math.abs(y - mid) + half;
      const inArch = z < spring ? Math.abs(y - mid) < half + 0.16 : Math.hypot(off, (z - spring) / 32 * 1.1) < half * 2 + 0.16;
      if (inArch) return fade(SILVER[Math.abs(y - mid) > half + 0.1 || z > DOOR.top ? 1 : 2], z, px, py);
    }
    return fade(galleryWall(y, z, px, py, true, leftPil), z, px, py);
  }, 11);
  // the doorway's reveal: the wall's thickness, its jamb toward the eye (lit), its soffit
  quadT(S, [[-WT, DOOR.y0, 0], [0, DOOR.y0, 0], [0, DOOR.y0, DOOR.top - 26], [-WT, DOOR.y0, DOOR.top - 26]], (_x, _y, z, px, py) => fade(SILVER[z < 26 ? 1 : 2], z, px, py), 12);
  quadT(S, [[CHAPEL.x0, 0, 0], [CHAPEL.x0, CHAPEL.y1, 0], [CHAPEL.x0, CHAPEL.y1, wallsZ], [CHAPEL.x0, 0, wallsZ]], (_x, y, z, px, py) => {
    for (let k = 0; k < LANCETS.length; k++) {
      const g = lancetGlass(y - LANCETS[k], z, LANCET.half, LANCET.z0, LANCET.z1, k);
      if (g) return g;
    }
    return fade(chapelWall(y, z, px, py, true), z, px, py);
  }, 13);
  // the walls' tops: their thickness from above, a lit edge, then the dark (where no roof runs behind)
  quadT(S, [[-WT, 0, wallsZ], [0, 0, wallsZ], [0, HY, wallsZ], [-WT, HY, wallsZ]], (x) => (x > -0.05 ? SILVER[3] : mix(SILVER[0], DEEP, 0.6)), 14);
  quadT(S, [[CHAPEL.x0 - WT, 0, wallsZ], [CHAPEL.x0, 0, wallsZ], [CHAPEL.x0, CHAPEL.y1, wallsZ], [CHAPEL.x0 - WT, CHAPEL.y1, wallsZ]], (x) => (x > CHAPEL.x0 - 0.06 ? CSTONE[3] : mix(CSTONE[1], DEEP, 0.55)), 15);
  quadT(S, [[CHAPEL.x0 - WT, -WT, wallsZ], [HX, -WT, wallsZ], [HX, 0, wallsZ], [CHAPEL.x0 - WT, 0, wallsZ]], (x, y, _z, px, py) => {
    if (x > STAIR.x0 && x < STAIR.x1) return null;
    if (y > -0.06) return x < -WT ? CSTONE[3] : SILVER[3];
    // where the roof runs on behind, its lead; elsewhere the wall's top, dark
    if (x > ROOF.x0) return roofAt(x, y, px, py);
    return mix(SILVER[0], DEEP, 0.6);
  }, 16);
  // the near walls, cut away as the game cuts them: their stubs' tops, dark, at the floor's near edges
  quadT(S, [[0, HY, 4], [HX + WT, HY, 4], [HX + WT, HY + WT, 4], [0, HY + WT, 4]], (_x, y) => (y < HY + 0.05 ? SILVER[2] : mix(SILVER[0], DEEP, 0.4)), 17);
  quadT(S, [[HX, 0, 4], [HX + WT, 0, 4], [HX + WT, HY, 4], [HX, HY, 4]], (x) => (x < HX + 0.05 ? SILVER[2] : mix(SILVER[0], DEEP, 0.4)), 17);
  quadT(S, [[CHAPEL.x0, CHAPEL.y1, 4], [CHAPEL.x1, CHAPEL.y1, 4], [CHAPEL.x1, CHAPEL.y1 + WT, 4], [CHAPEL.x0, CHAPEL.y1 + WT, 4]], (_x, y) => (y < CHAPEL.y1 + 0.05 ? CSTONE[2] : mix(CSTONE[0], DEEP, 0.4)), 18);
  quadT(S, [[-WT, DOOR.y1, 0], [-WT, HY, 0], [-WT, HY, 4], [-WT, DOOR.y1, 4]], () => CSTONE[1], 19);
  // ---- THE MIRRORS ON THE BACK WALL, bay by bay; and two on the left wall
  for (let k = 0; k < 8; k++) {
    if (k === STAIR_BAY) continue;
    const a0 = BAY0 + k * BAY + 0.42;
    const a1 = BAY0 + (k + 1) * BAY - 0.42;
    if (a1 > HX - 0.2) continue;
    const m: Mirror = { wall: 'back', a0, a1, z0: GLASS_Z0, z1: GLASS_Z1, state: k === CRACKED_BAY ? 'cracked' : k === BURST_BAY ? 'burst' : 'whole', id: MIRRORS.length };
    MIRRORS.push(m);
  }
  for (const [a0, a1] of [[0.75, 1.75], [5.0, 6.9]] as const) MIRRORS.push({ wall: 'left', a0, a1, z0: GLASS_Z0, z1: GLASS_Z1, state: 'whole', id: MIRRORS.length });
  // ---- WHAT STANDS: candelabra between the mirrors, a bench, a bust; the shards under the broken mirrors
  for (const x of [2.6, 4.6, 8.6, 14.6]) candelabrum(S, x, 0.62, 100 + x * 10);
  candelabrum(S, 0.6, 4.75, 190);
  bench(S, 0.95, 2.25, 0.5, 200);
  pedestal(S, 0.6, 7.4, 210);
  console(S, 3.6, 230);
  shards(S, 9.6, 0.35, 1.1, 26, 220, 1941);
  shards(S, 13.6, 0.35, 1.7, 44, 221, 1943);
  // ---- THE MIRRORS' GLASS AND FRAMES (after the candles, so the glass knows the flames before it)
  for (const m of MIRRORS) {
    const off = 0.05;
    const q: (readonly [number, number, number])[] = m.wall === 'back' ? [[m.a0, off, m.z0], [m.a1, off, m.z0], [m.a1, off, m.z1], [m.a0, off, m.z1]] : [[off, m.a0, m.z0], [off, m.a1, m.z0], [off, m.a1, m.z1], [off, m.a0, m.z1]];
    quadT(S, q, (x, y, z, px, py) => {
      const a = m.wall === 'back' ? x : y;
      let c: string | null;
      if (m.state === 'cracked') c = cracked(m, a, z, px, py);
      else if (m.state === 'burst') c = burst(m, a, z, px, py);
      else c = reflection(m, a, z, px, py);
      if (c && m.wall === 'left') c = mix(c, DEEP, 0.3);
      return c;
    }, 300 + m.id * 4);
    mirrorFrame(S, m, 301 + m.id * 4);
  }
  // ---- THE CHAPEL'S PEWS, its candles before the great window
  for (const y of [2.2, 3.3, 4.4, 5.5]) pew(S, CHAPEL.x0 + 1.9, -2.3, y, 400 + y * 10);
  candelabrum(S, GREAT.x - 1.2, 0.55, 460);
  candelabrum(S, GREAT.x + 1.2, 0.55, 470);
  // ---- THE STAIR, THE GLASSHOUSE, THE SKYLIGHT
  stair(S);
  glasshouse(S);
  skylight(S);
  // ---- the seams between things (his rulebook, Pixels 5)
  S.seams();
  // ---- THE GLASSHOUSE'S GLASS, laid over what is behind it
  glassOver(S);
  // ---- down the skylight's broken corner
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      if (S.id[py * W + px] >= 0 && S.id[py * W + px] !== 1 && S.id[py * W + px] !== 970) continue;
      const c = belowAt(px, py);
      if (c) {
        S.p.set(px, py, c);
        S.id[py * W + px] = 974;
      }
    }
  }
  // ---- THE SOFT SHADOWS under what stands (as the game draws them: a soft oval, darkest under it), stepped, crisp
  const floorIds = new Set([1, 2, 3, 901, 960, 961, 962, 963]);
  for (const [x, y, r] of SHADOWS) {
    const [cx, cy] = at(x, y);
    const rx = r * 68;
    const ry = r * 34;
    for (let py = Math.floor(cy - ry); py <= cy + ry; py++) {
      for (let px = Math.floor(cx - rx); px <= cx + rx; px++) {
        if (px < 0 || py < 0 || px >= W || py >= H || !floorIds.has(S.id[py * W + px])) continue;
        const d = Math.hypot((px + 0.5 - cx) / rx, (py + 0.5 - cy) / ry);
        if (d >= 1) continue;
        const t = (1 - d * d) * 0.5;
        const q = Math.floor(t * 4 + BAYER4[py & 3][px & 3]) / 4;
        if (q > 0) S.p.set(px, py, mix(S.p.get(px, py)!, DEEP, q * 0.8));
      }
    }
  }
  // ---- THE DARK, as the game lays it: the hero's pool of light, the dark coming in past it; the candles' own pools, warm
  // (an honest light, Colour 3); the chapel and the glasshouse lit by the day through their glass, the dark lighter there
  const [hx, hy] = at(HERO_AT[0], HERO_AT[1], 30);
  const flames = FLAMES.map((f) => S.at(f));
  const dayIds = (id: number, px: number): boolean => (id >= 900 && id < 1000) || id === 5 || id === 2 || id === 13 || id === 15 || id === 18 || (id >= 400 && id < 480) || (id === 10 && px < OX - 20);
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = py * W + px;
      const c = S.p.get(px, py);
      if (!c || BRIGHT_FLAME.has(c)) continue;
      let t = clamp((Math.hypot(px - hx, (py - hy) * 1.5) - 170) / 380, 0, 1) * 0.8;
      let warm = 0;
      for (const [fx, fy] of flames) {
        const d = Math.hypot(px - fx, (py - fy) * 1.3);
        if (d < 90) t -= 0.35 * (1 - d / 90);
        if (d < 30) warm = Math.max(warm, 1 - d / 30);
      }
      if (dayIds(S.id[i], px)) t *= 0.35;
      if (S.id[i] === 974) t *= 0.4;
      t = clamp(t, 0, 0.78);
      const q = Math.floor(t * 6 + BAYER4[py & 3][px & 3]) / 6;
      let out = q > 0 ? mix(c, DEEP, q) : c;
      if (warm > 0) {
        const wq = Math.floor(warm * 3 + BAYER4[py & 3][px & 3]) / 3;
        if (wq > 0) out = mix(out, '#b08458', 0.1 * wq);
      }
      S.p.set(px, py, out);
    }
  }
  // ---- the dark past everything; a step quieter than any word (art/act2_quiet.ts), the candles left as they burn
  const p = new Px(W, H);
  const glassOf = new Uint8Array(W * H);
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const c = S.p.get(px, py);
      p.set(px, py, c ? quietHex(c) : DEEP);
      const id = S.id[py * W + px];
      if (id >= 300 && id < 400 && (id - 300) % 4 === 0) glassOf[py * W + px] = (id - 300) / 4 + 1;
    }
  }
  return { p, glassOf };
}

/** The chapel's walls: pale ashlar, a stone bench along their foot. */
function chapelWall(a: number, z: number, px: number, py: number, shade: boolean): string {
  const s = shade ? -1 : 0;
  if (z < 10) return CSTONE[clamp((z > 8 ? 3 : 1) + s, 0, 4)];
  const course = Math.floor((z - 10) / 12);
  const off = hash(course, 0, 1951) * 30;
  const ju = fr((a * 32 + off) / 26);
  const jz = fr((z - 10) / 12);
  if (ju < 0.05 || jz < 0.09) return CSTONE[clamp(0 + s + 1, 0, 4)];
  const b = hash(Math.floor((a * 32 + off) / 26), course, 1953);
  if (hash(px >> 1, py, 1955) < 0.05) return CSTONE[clamp(1 + s, 0, 4)];
  return CSTONE[clamp((b > 0.6 ? 3 : 2) + s, 0, 4)];
}

/** THE GLASSHOUSE'S PANES over what is behind them: cold grey-blue with the sky in them, a sheen across, some broken out. */
function glassOver(S: Scene): void {
  const G = new Scene(new Px(W, H), OX, OY);
  const info = new Map<number, { roof: boolean; broken: (u: number, vv: number) => boolean }>();
  GLASS.forEach((g, i) => {
    info.set(i, g);
    G.quad([v(g.q[0][0], g.q[0][1], g.q[0][2]), v(g.q[1][0], g.q[1][1], g.q[1][2]), v(g.q[2][0], g.q[2][1], g.q[2][2]), v(g.q[3][0], g.q[3][1], g.q[3][2])], (u, vv) => encodeUV(u, vv), i);
  });
  for (let i = 0; i < W * H; i++) {
    const gi = G.id[i];
    if (gi < 0) continue;
    if (G.z[i] < S.z[i]) continue;
    const g = info.get(gi)!;
    const [u, vv] = decodeUV(G.p.get(i % W, Math.floor(i / W))!);
    if (g.broken(u, vv)) continue;
    const px = i % W;
    const py = Math.floor(i / W);
    const under = S.id[i] >= 0 ? S.p.get(px, py)! : LEAD[1];
    // the sky in it, a sheen falling across it; more of the sky on the roof's panes
    const sheen = fr((px * 0.9 - py) / 70);
    const sky = g.roof ? PANE[3] : PANE[2];
    let k = g.roof ? 0.44 : 0.26;
    if (sheen < 0.08) k += 0.2;
    if (hash(px >> 2, py >> 1, 1961) > 0.9) k += 0.08;
    let c = mix(under, sky, clamp(k, 0, 0.9));
    if (sheen < 0.03) c = PANE[4];
    S.p.set(px, py, c);
  }
}
// (the glass layer carries each pixel's place on its pane in its colour)
function encodeUV(u: number, vv: number): string {
  const a = clamp(Math.round(u * 255), 0, 255);
  const b = clamp(Math.round(vv * 255), 0, 255);
  return '#' + a.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0') + '00';
}
function decodeUV(c: string): [number, number] {
  return [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255];
}

/** Where a point of the world is on the picture (for the dev page: the knight). */
export const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 32, OY + (x + y) * 16 - z];
