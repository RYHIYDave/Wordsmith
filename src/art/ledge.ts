// FLOOR 7, THE LEDGE ROAD: its ground (art/terrain.ts paints it from the level's own tiles) and its sky.
//
// His Ledge Road, 13 Oct 2026, asked “Is this the Ledge Road's ground and sky?” of a first try in the planning
// mock-up's way (the mountain in front cut away, the sky past the road's far edge): “My vision was it looks
// like your on a cliff side trail with cliff on top and bottom.  When you make a northwest turn, the sky would
// open up, it’s like your going around the mountain.  If that makes sense.”; then “I’d like the road to kinda
// wrap around the mountain not just float off into space”; asked what should change, “Mountain looks like a
// mountain” (offered as: rocky slopes rising up to snowy heights above the wall, not a flat grassy top) and
// “The mountain side goes all the way to the ground you would never see the ground under the cliff.  Only off
// the side of cliff as you round the mountain.”; of the drawing made so, by 21:03: “You got it that’s
// perfect”; and asked which way the road goes, “Mostly one way, views at turns (Recommended)”, offered as: the
// trail runs mostly one way, cliff above and below as drawn; a few turns round the mountain open a view like
// this one; the boss's peak looks out over the city. So:
// - THE TRAIL runs along the mountain's face: grey-violet mountain rock, packed earth and gravel, flat slabs of
//   the rock breaking through, grass in its edges.
// - ABOVE IT the mountain's wall (the rock tiles' faces, `rise` tall), natural rock in uneven strata, ledges
//   and fissures; over the wall the mountainside climbing away (`mountainside`, with the painter's `climb`):
//   broken rock at the brow, rock ribs and gullies, a few firs low down (pieces), snow lying higher up.
// - BELOW IT the drop (`drop`): the cliff's face hangs under the trail all the way down (`HANG_TALL`, more than
//   a screen), so no ground shows under it; where the trail rounds the mountain, off the side of the cliff,
//   nothing is painted and the sky behind shows.
// - THE SKY (`paintSky`), a layer of its own sliding slower than the ground (the game's to scroll): open blue
//   sky with high clouds, the far snowy ranges, the land far below in haze, banks of clouds below the ledge.
//
// His rules it keeps: light from the upper left; a palette of its own, a step quieter than the figures and
// duller than any word's colour; nothing cyan or pink; crisp pixels.

import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

/** THE ROAD: its cracks, shade, body, lit stone, worn dust, brightest grit. */
export const L_ROAD = ['#4e4656', '#625a6a', '#766d7c', '#8a818e', '#a0979f', '#b8afb2'].map(hex);
/** THE MOUNTAIN'S ROCK, by how a face is turned to the light (lower left, at the eye, lower right): its lit layer tops, body, other body, cracks. */
export const L_ROCK = [
  ['#b9b2bc', '#9c94a2', '#8c8494', '#5c5468'],
  ['#948c9c', '#7c7486', '#6e6679', '#4a4358'],
  ['#6e6680', '#5a536c', '#4f4962', '#363048'],
].map((r) => r.map(hex));
/** THE MEADOW on the mountain's slope (shade to light), its flowers, and the stones in it. */
export const L_GRASS = ['#4a6a46', '#567a4e', '#648a56', '#78a062'].map(hex);
export const L_STONE = ['#6e6878', '#857e8c', '#9b94a0', '#b4adb4'].map(hex);
/** The road's lip over the drop, catching the sky's light. */
const LIP: RGB = hex('#cfc8cc');
/** The deep dark (his rulebook's dark base) and the haze the hanging faces are lost in. */
const DEEP: RGB = hex('#16101f');
const HAZE: RGB = hex('#a9b8cc');

function road(x: number, y: number, px: number, py: number, inside: number): RGB {
  // the packed earth and gravel of the road, in soft patches of two tones
  const t = fbm(x * 0.7, y * 0.7, 901);
  let i = t > 0.6 ? 3 : t < 0.38 ? 1 : 2;
  // flat slabs of the mountain's rock breaking through, cracked, lit on their near lip
  const slab = fbm(x * 0.45 + 3, y * 0.45, 902);
  if (slab > 0.63) {
    i = slab > 0.7 ? 3 : 2;
    const k = mod(alongX(px, py) + Math.floor(vnoise(x * 2, y * 2, 903) * 50), 43);
    const k2 = mod(alongY(px, py) + Math.floor(vnoise(x * 2, y * 2, 904) * 50), 37);
    if ((k < 2 || k2 < 2) && slab > 0.65) i = 0;
    else if ((k < 4 || k2 < 4) && slab > 0.65) i = 4;
    if (slab < 0.645) i = 1; // its edge in the earth
  }
  let c = L_ROAD[i];
  // grass creeping in at the road's edges, in tufts
  if (inside < 0.35) {
    const g = vnoise(x * 3.2, y * 3.2, 905);
    if (g > 0.35 + inside * 1.4) c = L_GRASS[g > 0.7 ? 2 : 1];
  }
  // the grit: a mark of two pixels, the next tone down, here and there
  const gx = Math.floor(px / 4);
  const gy = Math.floor(py / 3);
  if (hash(gx, gy, 906) < 0.16) {
    const ax = gx * 4 + Math.floor(hash(gx, gy, 907) * 2);
    if (py === gy * 3 + 1 && (px === ax || px === ax + 1)) c = mixc(c, L_ROAD[0], 0.55);
  }
  // pebbles: two pixels in the sun, their shadow under them
  const cx = Math.floor(px / 6);
  const cy = Math.floor(py / 4);
  if (hash(cx, cy, 908) < 0.05 + 0.08 * (1 - inside)) {
    const ax = cx * 6 + 1 + Math.floor(hash(cx, cy, 909) * 3);
    const ay = cy * 4 + 1;
    if (py === ay && (px === ax || px === ax + 1)) c = L_ROAD[5];
    else if (py === ay + 1 && (px === ax || px === ax + 1)) c = L_ROAD[1];
  }
  return c;
}

/**
 * A face of the mountain's rock: its strata lying a little aslant and wavering, of uneven thickness, in broad
 * patches of tone; here and there a ledge, lit along its lip, its shadow under it; fissures wandering down.
 * Natural rock, not masonry: nothing on a grid.
 */
function rock(shade: number, v: number, px: number, py: number): RGB {
  void py;
  // (where the face turns from one light to the next, the change is broken up, two pixels at a time, so it never runs down the face as a line)
  const sh = shade + (hash(px >> 1, Math.floor(v) >> 1, 921) - 0.5) * 0.35;
  const row = sh > 0.35 ? 0 : sh < -0.35 ? 2 : 1;
  const r = L_ROCK[row];
  const lv = v + px * 0.1 + 5 * Math.sin(px / 53) + 8 * (vnoise(px / 45, v / 35, 914) - 0.5);
  const b = lv / 15 + 0.8 * vnoise(px / 70, lv / 60, 915);
  const layer = Math.floor(b);
  const f = b - layer;
  let i = fbm(px / 45, lv / 38, 916) > 0.52 ? 2 : 1;
  // a ledge on some layers, for a stretch: its lip lit, the shadow under it
  if (hash(layer, Math.floor((px + 37 * layer) / 70), 917) > 0.5) {
    if (f > 0.9) i = 0;
    else if (f < 0.07) i = 3;
  }
  // fissures, wandering down across the layers
  const c = vnoise(px / 6 + 2.5 * vnoise(v / 22, px / 70, 918), v / 50, 919);
  if (Math.abs(c - 0.5) < 0.03 && vnoise(px / 20, v / 30, 920) > 0.5) i = 3;
  let col = r[i];
  if (v < 3 && v >= 0) col = mixc(col, DEEP, 0.25);
  return col;
}

/** The mountain's near face, in shadow (his rule): the darkest rock toward the deep dark, its layers faint in it. */
function nearRock(v: number, px: number): RGB {
  const r = L_ROCK[2];
  const f = mod(v + px * 0.12, 15);
  let c = mixc(r[f >= 13 ? 1 : 2], DEEP, 0.45);
  if (v <= 2) c = mixc(r[3], DEEP, 0.6);
  if (v >= 39) c = mixc(L_STONE[2], [255, 250, 240], 0.1);
  return c;
}

/** How far down the cliff's face hangs under an edge over the drop, at most (picture pixels): further than a screen, so that under the trail it goes all the way down (his word: “you would never see the ground under the cliff”). */
export const HANG_TALL = 600;
/** The cliff's face below the trail, `v` picture pixels down from its edge: the mountain's own rock going on down, turned to the light as the edge is, a little hazier the further down. */
function hangRock(v: number, px: number, shade: number): RGB {
  const c = rock(shade, -v, px, 0);
  return mixc(c, HAZE, Math.min(0.42, Math.floor((v / 500) * 6) / 6 * 0.5));
}

/** Snow on the heights, in shade and lit. */
const SNOW: RGB[] = [hex('#a9adc0'), hex('#c9cbd8'), hex('#e8e8ee')];
/**
 * THE MOUNTAINSIDE above the wall, rising away from the trail (his word: the mountain looks like a mountain):
 * at the wall's brow, broken rock; above it, rock ribs and gullies streaking down, lit on their left sides;
 * a few patches of alpine grass low down; snow lying higher up, more and more of it, the ribs showing through.
 */
function mountainside(x: number, y: number, px: number, py: number, back: number, climb: number): RGB {
  if (back < 0.06 + 0.06 * vnoise(x * 1.3, y * 1.3, 920)) return L_STONE[back < 0.04 ? 2 : 1];
  // the ribs and gullies, streaking down the slope (down the picture), wandering
  const u = px / 15 + 1.6 * vnoise(px / 60, py / 50, 941) + py / 140;
  const rib = vnoise(u, py / 90, 942);
  const side = vnoise(u + 0.08, py / 90, 942) - rib; // the rib's left flank catches the light
  let row = rib > 0.62 ? 0 : rib < 0.32 ? 2 : 1;
  if (side < -0.02 && row === 1) row = 0;
  if (side > 0.03 && row === 0) row = 1;
  // outcrops: ledges of the rock, lit along their upper lip, shadowed under
  const ledge = vnoise(px / 40, py / 9, 943);
  const lip = Math.abs(ledge - 0.5) < 0.025 && vnoise(px / 25, py / 25, 944) > 0.5;
  let c = L_ROCK[row][lip ? (ledge > 0.5 ? 0 : 3) : hash(Math.floor(px / 5), Math.floor(py / 4), 944) > 0.75 ? 2 : 1];
  const strata = lip ? 0 : 1;
  // snow lying higher up, thickest in the hollows and on the gentler ground, the ribs showing through
  const deep = climb + 0.28 * (fbm(x * 0.7, y * 0.7, 945) - 0.5) + (rib < 0.4 ? 0.08 : rib > 0.66 ? -0.1 : 0);
  if (deep > 0.55) {
    c = SNOW[row === 2 ? 0 : row === 1 ? 1 : 2];
    if (strata === 0 && deep < 0.62) c = L_ROCK[row][1];
  } else if (climb < 0.22 && fbm(x * 0.9, y * 0.9, 946) > 0.58) {
    // alpine grass low down
    c = L_GRASS[hash(Math.floor(px / 3), Math.floor(py / 2), 947) > 0.6 ? 2 : 1];
  }
  return c;
}

/** THE LEDGE ROAD'S GROUND, for a level whose drop is where `drop` says. */
export function ledgeLook(drop: (x: number, y: number) => boolean): TerrainLook {
  return {
    rise: 110,
    climb: 4,
    turnOver: 0.6,
    near: 40,
    round: 0.5,
    rag: 0.3,
    fine: 0.06,
    seed: 71,
    floor: road,
    face: (shade, v, px, py) => rock(shade, v, px, py),
    top: mountainside,
    nearFace: (v, px) => nearRock(v, px),
    brow: (c) => mixc(c, [255, 250, 240], 0.3),
    foot: [0.34, 0.18],
    nearShadow: { reach: 1.2, dark: [0.32, 0.2] },
    drop,
    lip: (c) => mixc(c, LIP, 0.75),
    hang: { tall: HANG_TALL, at: (v, px, _py, shade) => hangRock(v, px, shade) },
  };
}

// ---------------------------------------------------------------------------------------------------
// THE SKY: the view past the drop, a picture of its own that wraps round every SKY_WRAP picture pixels
// across, its y measured from its horizon (above it less than 0). The game lays it behind the ground and
// slides it slower than the ground, so it feels far away.

/** How far across the sky's picture goes before it comes round again (picture pixels). */
export const SKY_WRAP = 2048;
/** The sky, high to low (bands, each a step paler toward the horizon). */
export const SKY = ['#5470a2', '#5b78a8', '#6682b0', '#748eb8', '#849bc2', '#96aacb', '#a9b9d4'].map(hex);
/** The clouds, shade to light. */
export const CLOUD = ['#8995b0', '#a3aec5', '#bfc7d8', '#d9dee8', '#eef0f4'].map(hex);
/** The far ranges and the nearer: in shade, lit (from the upper left), their snow in shade and lit. */
const RANGE_FAR = ['#97a2bf', '#adb7d0', '#c7cedf', '#e7eaf1'].map(hex);
const RANGE_NEAR = ['#76839f', '#8b97b3', '#b4bccf', '#dde1ea'].map(hex);
/** The land far below: fields, woods, the river; and the haze it lies in. */
const FIELDS = ['#7d8c62', '#8b9868', '#9a9a70', '#a3946f', '#887b5f'].map(hex);
const WOODS: RGB = hex('#53664b');
const RIVER: RGB = hex('#c3ccd6');
const SKY_HAZE: RGB = hex('#b2bdd0');

/** A slow noise across the sky's picture that comes round again at the wrap: `n` cells across it. */
function wrapNoise(px: number, n: number, k: number): number {
  const u = (mod(px, SKY_WRAP) / SKY_WRAP) * n;
  const i = Math.floor(u);
  const f = u - i;
  const t = f * f * (3 - 2 * f);
  return hash(i % n, 0, k) * (1 - t) + hash((i + 1) % n, 0, k) * t;
}
/** A ripple across that comes round at the wrap: `n` times across it. */
const wave = (px: number, n: number, k: number): number => Math.sin((px / SKY_WRAP) * n * Math.PI * 2 + k);
/** The ordered dither (4 by 4), 0..1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (px: number, py: number): number => (BAYER[(mod(py, 4) << 2) + mod(px, 4)] + 0.5) / 16;

interface Peak { x: number; h: number; wl: number; wr: number }
/** A range of peaks along the sky, `n` across it (each its height, and how far its flanks run left and right). */
function peaksOf(n: number, low: number, high: number, wide: number, k: number): Peak[] {
  const out: Peak[] = [];
  for (let i = 0; i < n; i++) {
    const tall = hash(i, k, 980);
    out.push({
      x: (i + 0.15 + 0.7 * hash(i, k, 981)) * (SKY_WRAP / n),
      h: low + (high - low) * tall * tall,
      wl: wide * (0.6 + 0.8 * hash(i, k, 982)),
      wr: wide * (0.6 + 0.8 * hash(i, k, 983)),
    });
  }
  return out;
}
const FAR_PEAKS = peaksOf(13, 26, 70, 130, 1);
const NEAR_PEAKS = peaksOf(9, 10, 34, 170, 2);
/**
 * A range's ridge over the horizon at `px` (picture pixels), and where on it the light falls: the peak the
 * ridge is on there, its summit's x. A flank is lit left of the line that runs down from its summit and a
 * little to the right (the light from the upper left), in shade right of it.
 */
function rangeAt(peaks: Peak[], px: number, base: number, crag: number): [number, number, number] {
  let best = base;
  let top = px;
  let tall = base;
  for (const p of peaks) {
    for (const off of [0, -SKY_WRAP, SKY_WRAP]) {
      const dx = px - (p.x + off);
      const w = dx < 0 ? p.wl : p.wr;
      if (Math.abs(dx) >= w) continue;
      const h = p.h * (1 - Math.abs(dx) / w) ** 1.6;
      if (h > best) {
        best = h;
        top = p.x + off;
        tall = p.h;
      }
    }
  }
  return [best + crag * (wrapNoise(px, 256, 957) - 0.5) + crag * 0.5 * (wrapNoise(px, 512, 958) - 0.5), top, tall];
}
/** Is the mountain at (px, y) lit, on a peak with its summit at `top`, `tall` over the horizon? */
function litAt(px: number, y: number, top: number, tall: number): boolean {
  const down = Math.max(0, y + tall);
  return px - top < down * 0.45 + 6 * (wrapNoise(px + y * 2, 300, 961) - 0.5);
}
/** The far range's ridge, picture pixels over the horizon, at `px` across the sky. */
export function farRidge(px: number): number {
  return rangeAt(FAR_PEAKS, px, 10, 4)[0];
}
/** The nearer range's ridge, likewise. */
export function nearRidge(px: number): number {
  return rangeAt(NEAR_PEAKS, px, -2, 4)[0];
}

interface Puff { x: number; y: number; r: number }
interface Heap { x0: number; x1: number; y0: number; y1: number; base: number; puffs: Puff[] }
/** Heaps of round puffs along the sky (a heap every `every` across, some missing), between `top` and `bottom` (sky y). */
function heapsOf(every: number, top: number, bottom: number, size: number, keep: number, k: number): Heap[] {
  const n = Math.round(SKY_WRAP / every);
  const out: Heap[] = [];
  for (let c = 0; c < n; c++) {
    if (hash(c, k, 960) > keep) continue;
    const cx = (c + 0.2 + 0.6 * hash(c, k, 961)) * (SKY_WRAP / n);
    const cy = top + (bottom - top) * hash(c, k, 962);
    const sz = size * (0.6 + 0.6 * hash(c, k, 963));
    const m = 9 + Math.floor(hash(c, k, 964) * 7);
    const puffs: Puff[] = [];
    for (let i = 0; i < m; i++) {
      const t = i / m;
      const spread = 1 - 0.55 * t;
      puffs.push({
        x: cx + (hash(i, c + k, 965) - 0.5) * sz * 2.4 * spread,
        y: cy + (hash(i, c + k, 966) - 0.5) * sz * 0.6 * spread - t * sz * 0.35,
        r: sz * (0.42 + 0.3 * hash(i, c + k, 967)) * (1 - 0.45 * t),
      });
    }
    puffs.sort((a, b) => a.y + a.r * 0.3 - (b.y + b.r * 0.3));
    const x0 = Math.min(...puffs.map((p) => p.x - p.r)) - 2;
    const x1 = Math.max(...puffs.map((p) => p.x + p.r)) + 2;
    const y0 = Math.min(...puffs.map((p) => p.y - p.r)) - 2;
    const y1 = Math.max(...puffs.map((p) => p.y + p.r)) + 2;
    out.push({ x0, x1, y0, y1, base: cy + sz * 0.22, puffs });
  }
  return out.sort((a, b) => a.base - b.base);
}
/** The high clouds (flat underneath), and the bank of clouds below the ledge, seen from above. */
const HIGH = heapsOf(340, -128, -72, 40, 0.7, 1);
const BANK = heapsOf(150, 26, 70, 40, 0.8, 2);
const LOW = heapsOf(230, 110, 200, 44, 0.8, 3);
const UNDER = heapsOf(200, 220, 340, 50, 0.75, 4);

const ROUND = [0, -SKY_WRAP, SKY_WRAP] as const;
/** A heap's tone at (x, y) of the sky, worked out (0 to 4, or -1): lit from the upper left; `flat` gives it a grey underside. */
function heapTone(h: Heap, x: number, y: number, flat: boolean): number {
  if (flat && y > h.base) return -1;
  const wob = 0.14 * (hash(Math.floor(x / 4), Math.floor(y / 3), 968) - 0.5);
  let tone = -1;
  for (const p of h.puffs) {
    const dx = (x - p.x) / p.r;
    const dy = (y - p.y) / (p.r * 0.66);
    if (dx * dx + dy * dy + wob > 1) continue;
    const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, dx * dx + dy * dy)));
    const lam = -0.5 * dx - 0.42 * dy + 0.76 * nz;
    let i = Math.floor((lam * 0.8 + 0.4 + (bayer(x, y) - 0.5) * 0.16) * 5);
    i = Math.max(0, Math.min(4, i));
    if (flat && y > h.base - 3) i = Math.min(i, 1);
    tone = i;
  }
  return tone;
}
/** Each heap's tones, worked out once, the first time the sky is painted. */
const TONES = new Map<Heap, Int8Array>();
function tonesOf(h: Heap, flat: boolean): Int8Array {
  let t = TONES.get(h);
  if (!t) {
    const x0 = Math.floor(h.x0);
    const y0 = Math.floor(h.y0);
    const w = Math.floor(h.x1) - x0 + 1;
    const hh = Math.floor(h.y1) - y0 + 1;
    t = new Int8Array(w * hh);
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) t[y * w + x] = heapTone(h, x0 + x, y0 + y, flat);
    TONES.set(h, t);
  }
  return t;
}
/** The tone of the clouds at (px, y) of the sky (0 to 4), or -1. */
function cloudTone(heaps: Heap[], px: number, y: number, flat: boolean): number {
  let tone = -1;
  for (const h of heaps) {
    if (y < h.y0 || y > h.y1) continue;
    // the heap, or the heap once round (the wrap)
    for (const off of ROUND) {
      const x = px - off;
      if (x < h.x0 || x > h.x1) continue;
      const t = tonesOf(h, flat);
      const x0 = Math.floor(h.x0);
      const w = Math.floor(h.x1) - x0 + 1;
      const v = t[(Math.floor(y) - Math.floor(h.y0)) * w + (Math.floor(x) - x0)];
      if (v >= 0) tone = v;
    }
  }
  return tone;
}

/** The land far below, row by row (its y under the horizon): how its plots lie in that row. */
interface LandRow { row: number; n: number; ax: number; m: number; bx: number; half: number; rx: number; rw: number; haze: number }
function landRow(y: number): LandRow {
  // (the land is all far below: its plots crowd together toward the horizon, and are never large)
  const depth = Math.max(0.04, Math.min(0.75, y / 160));
  const v = 1 / depth;
  const row = y < 120 ? Math.floor(v * 1.6) : 1000 + Math.floor((y - 120) / 13);
  const n = Math.max(8, Math.round(SKY_WRAP / (18 + 34 * depth)));
  return {
    row,
    n,
    // (each row's plots start at a place of their own, so that no line runs down them all where the sky comes round)
    ax: hash(row, 0, 973) * SKY_WRAP,
    m: Math.max(4, Math.round(n / 4)),
    bx: hash(Math.floor(row / 2), 0, 974) * SKY_WRAP,
    half: Math.floor(row / 2),
    rx: 420 + 140 * Math.sin((160 / Math.max(6, y)) * 0.9) + 36 * Math.sin((160 / Math.max(6, y)) * 2.3) + Math.max(0, y - 120) * 0.4,
    rw: 1 + 3 * depth,
    // (hazier toward the horizon, and again far under the ledge, where the clouds drift)
    haze: Math.max(0.42, 0.72 - (y - 4) / 300) + Math.max(0, Math.min(0.2, (y - 110) / 400)),
  };
}
/** Which of the land's colours at `px` in a row: a field's (0 to 4), the woods (5), the river (6). Fields crowd together toward the horizon; woods in clumps of plots. */
function landAt(L: LandRow, px: number): number {
  const ci = Math.floor((mod(px + L.ax, SKY_WRAP) / SKY_WRAP) * L.n);
  const clump = hash(Math.floor((mod(px + L.bx, SKY_WRAP) / SKY_WRAP) * L.m) % L.m, L.half, 971);
  let c = Math.floor(hash(ci, L.row, 970) * FIELDS.length);
  if (hash(ci, L.row, 972) < (clump > 0.6 ? 0.75 : 0.08)) c = 5;
  const d = Math.abs(mod(px - L.rx + SKY_WRAP / 2, SKY_WRAP) - SKY_WRAP / 2);
  if (d < L.rw) c = 6;
  return c;
}
/** The land's colours in the haze, by how hazy (eighths). */
const LAND_HAZED: RGB[][] = [...FIELDS, WOODS, RIVER].map((c) => Array.from({ length: 9 }, (_, q) => mixc(c, SKY_HAZE, q / 8)));
const HIGH_COLOUR: RGB[] = CLOUD.map((c) => mixc(c, SKY[5], 0.25));
const LOW_COLOUR: RGB[] = CLOUD.map((_, i) => mixc(CLOUD[Math.max(0, i - 1)], SKY_HAZE, 0.2));

/**
 * PAINT A PIECE OF THE SKY: from (x0, y0) of the sky's own picture (its y from its horizon: above it less
 * than 0), w by h picture pixels; RGBA, every pixel opaque. Open sky in bands with high clouds; the far
 * snowy ranges and a nearer one on the horizon; the land far below in the haze; a bank of clouds below the
 * ledge, seen from above, and lower ones. Comes round across every SKY_WRAP.
 */
export function paintSky(x0: number, y0: number, w: number, h: number): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(w * h * 4);
  // down each column: the ranges' ridges, which peak each is on, the snow lines (ragged, streaking down the gullies)
  const FR = new Float64Array(w);
  const FT = new Float64Array(w);
  const FH = new Float64Array(w);
  const NR = new Float64Array(w);
  const NT = new Float64Array(w);
  const NH = new Float64Array(w);
  const FS = new Float64Array(w);
  const NS = new Float64Array(w);
  for (let c = 0; c < w; c++) {
    const px = mod(x0 + c, SKY_WRAP);
    const f = rangeAt(FAR_PEAKS, px, 10, 4);
    const n = rangeAt(NEAR_PEAKS, px, -2, 4);
    FR[c] = -f[0];
    FT[c] = f[1];
    FH[c] = f[2];
    NR[c] = -n[0];
    NT[c] = n[1];
    NH[c] = n[2];
    FS[c] = 40 + 6 * (wrapNoise(px, 128, 959) - 0.5) + 7 * (hash(Math.floor(px / 3), 1, 976) - 0.5);
    NS[c] = 20 + 4 * (wrapNoise(px, 128, 960) - 0.5) + 5 * (hash(Math.floor(px / 3), 2, 976) - 0.5);
  }
  for (let r = 0; r < h; r++) {
    const y = y0 + r;
    const L = y > 4 ? landRow(y) : null;
    const t = Math.max(0, Math.min(0.999, 1 + y / 300));
    for (let c = 0; c < w; c++) {
      const px = mod(x0 + c, SKY_WRAP);
      let col: RGB;
      if (L && y > NR[c] + 6) {
        // the land far below, in the haze, clearer as it comes nearer
        col = LAND_HAZED[landAt(L, px)][Math.max(0, Math.min(8, Math.floor((L.haze + (bayer(px, y) - 0.5) * 0.12) * 8)))];
      } else if (y > NR[c]) {
        // the nearer range, snow on its heads
        const lit = litAt(px, y, NT[c], NH[c]);
        col = -y > NS[c] ? RANGE_NEAR[lit ? 3 : 2] : RANGE_NEAR[lit ? 1 : 0];
      } else if (y > FR[c]) {
        // the far ranges
        const lit = litAt(px, y, FT[c], FH[c]);
        col = -y > FS[c] ? RANGE_FAR[lit ? 3 : 2] : RANGE_FAR[lit ? 1 : 0];
      } else {
        // the sky, in bands, its high clouds
        col = SKY[Math.min(SKY.length - 1, Math.floor(t * SKY.length + (bayer(px, y) - 0.5) * 0.5))];
        const hi = cloudTone(HIGH, px, y, true);
        if (hi >= 0) col = HIGH_COLOUR[hi];
      }
      // the clouds below the ledge, seen from above
      const bank = cloudTone(BANK, px, y, false);
      if (bank >= 0) col = CLOUD[bank];
      else {
        let low = cloudTone(LOW, px, y, false);
        if (low < 0) low = cloudTone(UNDER, px, y, false);
        if (low >= 0) col = LOW_COLOUR[low];
      }
      const o = (r * w + c) * 4;
      out[o] = col[0];
      out[o + 1] = col[1];
      out[o + 2] = col[2];
      out[o + 3] = 255;
    }
  }
  return out;
}
