// FLOOR 6, THE QUARRY: its ground (art/terrain.ts paints it from the level's own tiles).
//
// The owner, 12 Oct 2026, 18:56: “I’d like the quarry and forest to be mostly open with minimal narrow
// paths between open areas”; to the planning chat's first Quarry, “More open”; to the second (one great
// pit floor, the next opening broadly off it, the rock pushed to the edges, the far walls stepped with
// the benches the stone came off in), by 08:48 on 13 Oct: “Yes, this is it (Recommended)”. That picture
// (previews/quarry2_in_game.png; src/dev/preview_act1.ts, hash `quarry`) is the measure for this one.
//
// WHAT IT IS: a working quarry high on the mountain under the Prison, where the cult's captives cut the
// giant obelisks. Pale limestone, cut and not broken:
// - THE FLOOR is the quarry's bed: the rock worked flat, in great slabs where the stone was lifted off
//   in blocks, the cuts between them sharp; here a slab lifted out and its bed left a step lower; pick
//   scars across a few; grey dust over it all, drifted against the walls, and chippings in it.
// - THE FAR WALLS are sheer and stepped: a bench for each lift of stone, its tread catching the sun; the
//   joints where the blocks were split; the rows of half-drill marks along a bench's top where the next
//   lift was wedged off; water stains run down from the treads.
// - THE TOPS are the mountain: thin alpine grass and grey rock, and along every cliff's edge a rim of the
//   pale caprock, cracked.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones a material; a palette of
// its own (Colour 1), a step quieter than the figures (Places 2) and duller than any word's colour
// (Colour 4); nothing glows, nothing cyan or pink (Colour 3: the cult's mark on the obelisk is a piece,
// not the ground); crisp pixels, no smoothing, no lone pixels in the ground's marks.

import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** THE BED: its deep cuts, its shade, its body, its lit stone, its dust, its brightest chips. */
export const Q_BED = ['#7a7280', '#9a9298', '#b0a8a6', '#c1b9b1', '#d3cabe', '#e3dbce'].map(hex);
const FRESH: RGB = [8, 6, 2];
const STAINED: RGB = [-12, -12, -6];
/**
 * THE WALLS' STONE, by how a face is turned to the light (to the lower left, at the eye, to the lower
 * right): a bench's tread in the sun, the face's body, its other body, its joints and deepest shade.
 */
export const Q_WALL = [
  ['#ede3d5', '#d9ccbc', '#cabcab', '#958780'],
  ['#c9bdb0', '#b1a497', '#a29587', '#76696a'],
  ['#958b9d', '#7e7489', '#70677b', '#4d465c'],
].map((r) => r.map(hex));
/** THE TOPS: thin alpine grass (shade to light), grey mountain rock, and the pale caprock of the rim with its cracks. */
export const Q_GRASS = ['#526b40', '#5f7c48', '#6e8d50', '#829f5e'].map(hex);
export const Q_ROCK = ['#7f7883', '#958d96', '#aaa1a6', '#bdb5b4'].map(hex);
export const Q_CAP = ['#b0a69d', '#c8bdb1', '#dbd2c6', '#8a8089'].map(hex);
/** The deep dark under everything (his rulebook's dark base). */
const DEEP: RGB = hex('#16101f');

// ---------------------------------------------------------------------------------------------------
// The picture's own grid: along the world's x and y, 64 to a tile, so that every line the bed is cut
// along is a crisp two-to-one step on the screen, one picture pixel thick.

/** Along x (constant on a line across which y changes): 64 to a tile. */
const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
/** Along y: 64 to a tile. */
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;
const mod = (a: number, m: number): number => ((a % m) + m) % m;

/** THE SLABS OF THE BED: rows 1.5 tiles deep along y, each row's slabs 1.75 to 3 tiles long along x, staggered. */
const ROW = 96;
function slabOf(U: number, V: number): { i: number; j: number; u: number; v: number; len: number } {
  const j = Math.floor(V / ROW);
  const len = 112 + Math.floor(hash(j, 0, 601) * 4) * 20;
  const off = Math.floor(hash(j, 1, 601) * len);
  const i = Math.floor((U + off) / len);
  return { i, j, u: mod(U + off, len), v: mod(V, ROW), len };
}

function bed(x: number, y: number, px: number, py: number, inside: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const s = slabOf(U, V);
  const h0 = hash(s.i, s.j, 602);
  const lifted = h0 < 0.08;
  // each slab one stone: most the bed's own, some fresh-cut and lighter, some stained
  let tone = h0 > 0.82 ? 3 : h0 > 0.73 ? 1 : 2;
  if (lifted) tone = 1;
  let c = Q_BED[tone];
  if (h0 > 0.9) c = [c[0] + FRESH[0], c[1] + FRESH[1], c[2] + FRESH[2]];
  else if (h0 > 0.62 && h0 <= 0.7) c = [c[0] + STAINED[0], c[1] + STAINED[1], c[2] + STAINED[2]];
  // the dust: soft drifts, and against the walls, in two steps
  const drift = fbm(x * 0.55, y * 0.55, 611) + (1 - inside) * 0.22 + (lifted ? -0.1 : 0);
  const dust = drift > 0.72 ? 2 : drift > 0.62 ? 1 : 0;
  // the cuts between the slabs: one pixel, the shade's tone, not every one cut deep; the lit lip on
  // their near side; a lifted slab's step where its far side drops, in shade
  const cutV = s.v < 2;
  const cutU = s.u < 2 && hash(s.i, s.j, 603) > 0.18; // some slabs never split from the next
  const deep = hash(s.i + (cutV ? 0 : 7), s.j, 604) > 0.6;
  if (dust < 2) {
    if (cutV || cutU) c = dust ? Q_BED[Math.max(1, tone - 1)] : deep ? Q_BED[0] : Q_BED[1];
    else if (lifted && (s.v < 6 || s.u < 6)) c = Q_BED[0];
    else if (!dust && deep && (s.v < 4 || (s.u < 4 && cutU))) c = Q_BED[Math.min(4, tone + 1)];
  }
  // pick scars across a few slabs: short strokes in rows, all one way
  if (dust < 2 && h0 > 0.5 && h0 < 0.6 && s.v > 10 && s.v < ROW - 10 && s.u > 10 && s.u < s.len - 10) {
    const row = mod(s.v, 14);
    const col = mod(U + Math.floor(s.v / 14) * 7, 18);
    if (row < 2 && col < 7) c = Q_BED[Math.max(0, tone - 1)];
  }
  if (dust === 1) c = mixc(c, Q_BED[4], 0.5);
  else if (dust === 2) c = Q_BED[4];
  // the grit: little marks of the next tone down, two pixels across, here and there
  const gx = Math.floor(px / 4);
  const gy = Math.floor(py / 3);
  if (hash(gx, gy, 625) < 0.08) {
    const ax = gx * 4 + Math.floor(hash(gx, gy, 626) * 2);
    if (py === gy * 3 + 1 && (px === ax || px === ax + 1)) c = mixc(c, Q_BED[1], 0.6);
  }
  // the chippings: a chip two pixels across in the sun with its shadow under it, in little scatters,
  // thicker in the dust and by the walls
  const cx = Math.floor(px / 6);
  const cy = Math.floor(py / 4);
  const scatter = vnoise(x * 2.2, y * 2.2, 627);
  const want = (scatter > 0.62 ? 0.16 : 0.025) + 0.06 * dust + 0.06 * (1 - inside);
  if (hash(cx, cy, 621) < want) {
    const ax = cx * 6 + 1 + Math.floor(hash(cx, cy, 622) * 3);
    const ay = cy * 4 + 1;
    if (py === ay && (px === ax || px === ax + 1)) c = Q_BED[5];
    else if (py === ay + 1 && (px === ax || px === ax + 1)) c = Q_BED[1];
  }
  return c;
}

/** A quarried face: benches, joints, drill marks, stains. `v` picture pixels over its foot. */
function quarried(shade: number, v: number, px: number, py: number, x: number, y: number): RGB {
  const BENCH = 27;
  const jj = Math.floor((v + 4) / BENCH);
  // where the light turns, it turns bench by bench, as blocks do, not down one line
  const sj = shade + (hash(jj, Math.floor(px / 23), 700) - 0.5) * 0.16;
  const row = sj > 0.35 ? 0 : sj < -0.35 ? 2 : 1;
  const r = Q_WALL[row];
  const b0 = jj * BENCH - 4;
  const f = v - b0; // 0 at the bench's foot, up to BENCH at its tread
  let i = 1;
  // the bench's own stone (a strata tint), and its body in two tones in long patches
  const span = 34 + Math.floor(hash(jj, 3, 701) * 40);
  const key = Math.floor((px + hash(jj, 4, 701) * span) / span);
  if (hash(jj, key, 702) > 0.55) i = 2;
  if (f >= BENCH - 3) i = 0; // the tread, in the sun
  else if (f >= BENCH - 4) i = 3; // the shadow under its lip
  else if (f < 2) i = 3; // where the face meets the tread below
  // the joints where the blocks were split: a dark line, lit on its right
  const jx = Math.floor((px + hash(jj, 5, 703) * 60) / span);
  const jpos = mod(px + hash(jj, 5, 703) * 60, span);
  const joint = hash(jj, jx, 704) > 0.35;
  if (joint && f >= 2 && f < BENCH - 4) {
    if (jpos < 1) i = 3;
    else if (jpos < 2 && row < 2) i = 0;
  }
  // the half-drill marks along a bench's top, where the next lift was wedged off
  const drills = hash(jj, key, 705) > 0.45;
  if (drills && f >= BENCH - 12 && f < BENCH - 4) {
    const d = mod(px + Math.floor(hash(jj, key, 706) * 7), 7);
    if (d === 0) i = 3;
    else if (d === 1 && row < 2) i = Math.max(0, i - 1);
  }
  let c = r[i];
  // a strata tint, bench by bench
  const tint = (hash(jj, 9, 707) - 0.5) * 14;
  c = [c[0] + tint, c[1] + tint * 0.9, c[2] + tint * 0.7];
  // water stains running down from a few treads: a narrow band, darker, its foot ragged
  const sx = Math.floor(px / 9);
  const hs = hash(sx, jj, 708);
  if (hs > 0.86 && i !== 0) {
    const len = 8 + Math.floor(hash(sx, jj, 709) * 16);
    const inBand = mod(px, 9) >= 3 && mod(px, 9) < 3 + 2 + Math.floor(hash(sx, jj, 710) * 3);
    if (inBand && f < BENCH - 4 && f > BENCH - 4 - len) c = mixc(c, DEEP, 0.18);
  }
  // the foot of the whole wall, darker where it meets the floor
  if (v < 3) c = mixc(c, DEEP, 0.25);
  return c;
}

/** The tops: grass and rock, the caprock's rim along the edge. */
function tops(x: number, y: number, px: number, py: number, back: number): RGB {
  // the rim of pale caprock along the cliff's edge, wider and narrower as it goes, cracked across
  const rimW = 0.1 + 0.12 * vnoise(x * 1.3, y * 1.3, 801);
  if (back < rimW) {
    const crack = mod(alongX(px, py) + Math.floor(vnoise(x * 3, y * 3, 802) * 40), 37) < 2 || mod(alongY(px, py) + Math.floor(vnoise(x * 3, y * 3, 803) * 40), 43) < 2;
    if (crack && back > 0.02) return Q_CAP[3];
    return back < rimW * 0.45 ? Q_CAP[2] : Q_CAP[1];
  }
  // rock where the mountain's bones show through, grass elsewhere
  const rf = fbm(x * 0.42, y * 0.42, 811);
  if (rf > 0.6) {
    const t = vnoise(x * 2.4, y * 2.4, 812);
    let c = Q_ROCK[t > 0.62 ? 2 : 1];
    if (rf < 0.615) c = Q_ROCK[0]; // its edge, where the grass meets it
    // a crack here and there, lit on its near lip
    const k = mod(alongX(px, py) + Math.floor(vnoise(x * 2, y * 2, 813) * 60), 71);
    if (k < 2 && vnoise(x * 3, y * 3, 814) > 0.55) c = Q_ROCK[0];
    else if (k < 4 && k >= 2 && vnoise(x * 3, y * 3, 814) > 0.55) c = Q_ROCK[3];
    return c;
  }
  const t = fbm(x * 1.8, y * 1.8, 821);
  let i = t > 0.62 ? 2 : t < 0.36 ? 0 : 1;
  // tufts: a blade of two pixels lit at its tip, in clumps
  const cx = Math.floor(px / 5);
  const cy = Math.floor(py / 4);
  if (hash(cx, cy, 822) < 0.2) {
    const ax = cx * 5 + 1 + Math.floor(hash(cx, cy, 823) * 3);
    const ay = cy * 4 + 1;
    if (px === ax && py === ay) i = 3;
    else if (px === ax && py === ay + 1) i = Math.min(3, i + 1);
    else if ((px === ax - 1 || px === ax + 1) && py === ay + 2) i = 0;
  }
  // stones lying in the grass: three pixels lit over two in shade, a few to a patch
  const sx = Math.floor(px / 9);
  const sy = Math.floor(py / 6);
  if (hash(sx, sy, 825) < (rf > 0.5 ? 0.3 : 0.07)) {
    const ax = sx * 9 + 2 + Math.floor(hash(sx, sy, 826) * 4);
    const ay = sy * 6 + 2;
    if (py === ay && px >= ax && px < ax + 3) return Q_ROCK[3];
    if (py === ay + 1 && px >= ax - 1 && px < ax + 3) return Q_ROCK[px === ax - 1 ? 2 : 1];
    if (py === ay + 2 && px >= ax && px < ax + 3) return Q_GRASS[0];
  }
  return Q_GRASS[i];
}

/** The near cliff's face, in shadow (his rule): the darkest of the walls' stone toward the deep dark, its benches faint in it. */
function nearFace(v: number, px: number, py: number, x: number, y: number): RGB {
  const r = Q_WALL[2];
  const f = mod(v, 27);
  let c = mixc(r[f >= 24 ? 1 : 2], DEEP, 0.5);
  if (v <= 2) c = mixc(r[3], DEEP, 0.6); // its foot, at the floor's edge
  if (v >= 39) c = mixc(Q_CAP[1], [255, 250, 240], 0.15); // its lit top edge
  return c;
}

/** THE QUARRY'S GROUND. */
export const QUARRY_LOOK: TerrainLook = {
  // the planning chat's 110 (55 game pixels: about two heroes high), as he said yes to
  rise: 110,
  near: 40,
  round: 0.5,
  rag: 0.32,
  fine: 0.06,
  seed: 61,
  floor: bed,
  face: quarried,
  top: tops,
  nearFace,
  brow: (c) => mixc(c, [255, 250, 240], 0.35),
  foot: [0.36, 0.2],
  nearShadow: { reach: 1.3, dark: [0.36, 0.22] },
};
