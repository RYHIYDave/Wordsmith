// FLOOR 8, ECHO CANYON: its ground (art/terrain.ts paints it from the level's own tiles).
//
// The owner, 12 Oct 2026, to the planning chat's Echo Canyon in the game's own frame (previews/
// canyon_in_game.png; src/dev/preview_act1.ts, hash `shot`), asked “Is this how Echo Canyon should look?”,
// by 20:35: “Yes, this is it (Recommended)”, offered as: the canyon runs up the screen mostly, with the near
// wall's shadow and see-through pillars where it turns. And, 20:35: “If we really decorate the tops of the
// cliffs it will look really good”; to the tops dressed, by 20:42: “Yes, like this (Recommended)”. His design
// doc (“Wordsmith Act 1: The Descent”): “After the open cliff, the walls close in. The canyon is the cult's
// supply road down the mountain”; red-rock switchbacks along a dry riverbed; its palette “Red rock”. That
// picture is the measure for this one; the art chat began it on his word of 14 Oct, 21:21: “Okay floor 8 go”.
//
// WHAT IT IS: a dry river's bed between walls of red sandstone, high in the mountain's foothills:
// - THE FLOOR is the riverbed: fine sand the colour of the walls it came off, drifted pale against their
//   feet; the wind's ripples across it in long broken lines; bars of river-worn stones where the water ran
//   last, grey and cream among the red; flats of dried mud split into plates; grit and pebbles over all.
// - THE WALLS are sheer sandstone in bands, each bed of it its own tone: soft red beds, hard ledges that
//   stand out (lit along their tops, a shadow under them), pale cream beds, beds swept with the fine slanting
//   lines of old dunes; joints splitting down through several beds; the dark desert varnish streaked down
//   from the rim; the shadow under the caprock's lip at the top.
// - THE TOPS are the mesa: rust-red earth, olive scrub in clumps, cracks, pebbles; a rim of the pale
//   caprock along every cliff's edge, and slabs of it out across the top. (What stands on the tops, the
//   junipers, yucca, sage, the hoodoos, the cult's lookout, are pieces, laid as the game lays them.)
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material; a palette
// of its own (Colour 1: red rock, after the Ledge Road's open blue), a step quieter than the figures (Places
// 2) and duller than any word's colour (Colour 4: every colour here under the dullest word's saturation);
// the shadows fall into a deep, cool dark (Colour 2); nothing glows, nothing cyan or pink (Colour 3); crisp
// pixels, no smoothing.

import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;

/** THE RIVERBED'S SAND: its deepest marks, its shade, its body, its lit sand, its drift, its brightest grains. */
export const C_SAND = ['#7a5444', '#9c6c52', '#b88462', '#cc9a74', '#dcb08a', '#ecc8a6'].map(hex);
/** RIVER STONES: their shade, body and lit top (grey and cream among the red). */
export const C_STONE = ['#7c6e6c', '#a29290', '#c8bab0'].map(hex);
/**
 * THE WALLS' SANDSTONE, by how a face is turned to the light (to the lower left, at the eye, to the lower
 * right): a ledge's lit top, the bed's body, its other body, the deep of a joint or the shadow under a ledge.
 */
export const C_WALL = [
  ['#eeac80', '#d69870', '#be8262', '#8c5a48'],
  ['#d49c78', '#b67c5e', '#a46c54', '#6c463a'],
  ['#9c6656', '#82504a', '#6e4446', '#3e3236'],
].map((r) => r.map(hex));
/** The pale cream beds, by the same turn to the light. */
export const C_CREAM = ['#e6b694', '#cc9e80', '#9c766c'].map(hex);
/** THE TOPS: the mesa's rust earth (shade to light), its olive scrub, the pale caprock of the rim with its cracks. */
export const C_EARTH = ['#8c604a', '#a6745a', '#bc8664', '#cc9a76'].map(hex);
export const C_SCRUB = ['#5c5c38', '#747044', '#8e8a54'].map(hex);
export const C_CAP = ['#d2ae90', '#e0c0a2', '#eed4ba', '#8a5c4c'].map(hex);
/** The deep, cool dark under everything (his rulebook's dark base). */
const DEEP: RGB = hex('#16101f');
/** The walls' own deepest dark, warm enough that the red rock never turns pink as it falls into it (Colour 3). */
const WALL_DEEP: RGB = hex('#2a2026');
/** The desert varnish streaked down the walls: a dark film, its own dull brown-black. */
const VARNISH: RGB = hex('#40302c');

// ---------------------------------------------------------------------------------------------------
// The picture's own grid: along the world's x and y, 64 to a tile, so that a line along either is a crisp
// two-to-one step on the screen, one picture pixel thick.

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// THE FLOOR: the dry riverbed

/** What a patch of the bed is: its stone bars, its mud flats, its drifts (0..1 each, by slow noise). */
function zones(x: number, y: number, inside: number): { stones: number; mud: number; drift: number } {
  const stones = vnoise(x * 0.42 + 3.1, y * 0.42 - 1.7, 811);
  const mud = fbm(x * 0.33, y * 0.33, 812);
  // drifted against the walls' feet, and in long soft tongues out over the bed
  const drift = Math.max(1 - inside * 1.25, 0) * 0.9 + fbm(x * 0.5, y * 0.5, 813) * 0.55;
  return { stones, mud, drift };
}

/** The plates of dried mud: the edges between cells (about 0.4 tiles across) of a scattered grid. */
function mudCrack(x: number, y: number): { crack: boolean; lip: boolean } {
  const S = 0.42;
  const gx = x / S;
  const gy = y / S;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let d1 = 9;
  let d2 = 9;
  let n1x = 0;
  let n1y = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = ix + i + 0.15 + 0.7 * hash(ix + i, iy + j, 821);
      const cy = iy + j + 0.15 + 0.7 * hash(ix + i, iy + j, 822);
      const d = Math.hypot(gx - cx, (gy - cy) * 1.0);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        n1x = cx;
        n1y = cy;
      } else if (d < d2) d2 = d;
    }
  }
  const gap = d2 - d1;
  // a crack a picture pixel or so across; the plate's lip just inside it lit where the plate rises toward the light
  const crack = gap < 0.035;
  const lip = !crack && gap < 0.07 && gx - n1x + (gy - n1y) > 0.25;
  return { crack, lip };
}

/** Above a threshold, with a checkered pixel or two where it is near it, so that one tone gives way to the next softly, still crisp. */
function over(t: number, thr: number, px: number, py: number, band = 0.018): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  // an ordered dither across the band, two pixels by two
  const k = (t - thr + band) / (2 * band);
  return k > BAYER[py & 1][px & 1];
}
const BAYER = [
  [0.125, 0.625],
  [0.875, 0.375],
];

/** A RIVER STONE in its little cell of the bed, if there is one: its colour at (px, py), its shadow, or nothing. */
function stoneAt(px: number, py: number, thick: number): RGB | 'shadow' | null {
  const CW = 9;
  const CH = 6;
  for (const [di, dj] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) {
    const cx = Math.floor(px / CW) + di;
    const cy = Math.floor(py / CH) + dj;
    if (hash(cx, cy, 841) > thick) continue;
    const W = 3 + Math.floor(hash(cx, cy, 842) * 4); // 3 to 6 across
    const H = W > 4 && hash(cx, cy, 843) > 0.4 ? 3 : 2; // 2 or 3 down
    const sx = cx * CW + 1 + Math.floor(hash(cx, cy, 844) * (CW - W - 1));
    const sy = cy * CH + 1 + Math.floor(hash(cx, cy, 846) * (CH - H - 1));
    const kind = hash(cx, cy, 845);
    const ramp: RGB[] = kind < 0.45 ? C_STONE : kind < 0.75 ? [C_SAND[1], C_SAND[3], C_SAND[5]] : [C_CAP[3], C_CAP[0], C_CAP[2]];
    const r = py - sy;
    const inRow = (row: number, x: number): boolean => {
      if (row < 0 || row >= H) return false;
      const inset = (row === 0 || row === H - 1) && W > 3 ? 1 : 0;
      return x >= sx + inset && x < sx + W - inset;
    };
    if (inRow(r, px)) {
      if (r === 0) return px < sx + W - 2 ? ramp[2] : ramp[1]; // its top, lit toward the upper left
      if (r === H - 1) return ramp[0]; // its underside
      return px === sx + W - 1 ? ramp[0] : ramp[1];
    }
    // its shadow on the sand, a pixel under it and to its right
    if (inRow(r - 1, px - 1) && !inRow(r, px)) return 'shadow';
  }
  return null;
}

function riverbed(x: number, y: number, px: number, py: number, inside: number): RGB {
  const z = zones(x, y, inside);
  // the sand's own tone, in slow patches giving way softly
  const t = fbm(x * 0.7, y * 0.7, 801);
  let tone = over(t, 0.6, px, py) ? 3 : over(t, 0.38, px, py) ? 2 : 1;
  const drift = over(z.drift, 0.84, px, py) ? 2 : over(z.drift, 0.68, px, py) ? 1 : 0;
  if (drift) tone = Math.max(tone, 2 + drift);
  let c = C_SAND[tone];
  const muddy = drift === 0 && z.mud > 0.72;
  const stony = drift < 2 && !muddy && z.stones > 0.64;
  if (muddy) {
    // flats of dried mud split into plates: each plate the bed's body, a crack its deep, the lip lit
    const m = mudCrack(x, y);
    c = C_SAND[2];
    if (m.crack) c = C_SAND[0];
    else if (m.lip) c = C_SAND[3];
    return c;
  }
  // the wind's ripples: long broken lines across the bed, a lit crest over a line of shade, one pixel each;
  // in the open sand, not in the stone bars
  if (!stony) {
    const off = Math.round(3 * Math.sin(px / 23 + 6 * vnoise(px / 140, py / 90, 831)) + 2 * Math.sin(px / 9.5 + py / 31));
    const row = mod(py + off, 7);
    const seg = vnoise(px / 26, Math.floor((py + off) / 7), 832);
    if (seg > 0.46) {
      if (row === 0) c = C_SAND[Math.min(5, tone + 1)];
      else if (row === 1 && seg > 0.54) c = C_SAND[Math.max(0, tone - 1)];
    }
  } else {
    // the stone bars: river-worn stones, grey and cream among the red, each lit at its upper left
    const st = stoneAt(px, py, z.stones > 0.72 ? 0.7 : 0.4);
    if (st === 'shadow') c = C_SAND[Math.max(0, tone - 2)];
    else if (st) return st;
  }
  // grit: a mark of the shade's tone two pixels across, here and there
  const gx = Math.floor(px / 6);
  const gy = Math.floor(py / 4);
  if (hash(gx, gy, 851) < 0.035) {
    const ax = gx * 6 + Math.floor(hash(gx, gy, 852) * 4);
    if (py === gy * 4 + 2 && (px === ax || px === ax + 1)) c = C_SAND[Math.max(0, tone - 1)];
  }
  // pebbles: a grain two pixels across in the sun with its shadow under it, in little scatters
  const cx = Math.floor(px / 7);
  const cy = Math.floor(py / 5);
  const want = vnoise(x * 2.2, y * 2.2, 853) > 0.68 ? 0.09 : 0.012;
  if (hash(cx, cy, 854) < want) {
    const ax = cx * 7 + 1 + Math.floor(hash(cx, cy, 855) * 4);
    const ay = cy * 5 + 1;
    if (py === ay && (px === ax || px === ax + 1)) c = C_SAND[5];
    else if (py === ay + 1 && (px === ax || px === ax + 1)) c = C_SAND[Math.max(0, tone - 2)];
  }
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE WALLS: banded sandstone

/**
 * The beds of the sandstone, from the wall's foot up: where each begins (picture pixels over the foot) and what
 * it is. Low down the red beds, soft and deep red, with hard ledges between; higher up the pale beds of old
 * dunes, cream and swept with slanting lines, as the great walls of the red-rock country stand.
 */
type Bed = { at: number; tall: number; kind: 'soft' | 'red' | 'ledge' | 'cream' | 'dune' };
const BEDS: Bed[] = (() => {
  const out: Bed[] = [];
  let at = -20;
  let j = 0;
  while (at < 240) {
    const h = hash(j, 0, 861);
    const high = at > 84;
    const kind: Bed['kind'] = high ? (h < 0.18 ? 'ledge' : h < 0.52 ? 'cream' : 'dune') : h < 0.26 ? 'ledge' : h < 0.5 ? 'red' : 'soft';
    const tall = kind === 'ledge' ? 4 + Math.floor(hash(j, 1, 861) * 3) : kind === 'dune' ? 16 + Math.floor(hash(j, 1, 861) * 14) : 8 + Math.floor(hash(j, 1, 861) * 12);
    out.push({ at, tall, kind });
    at += tall;
    j++;
  }
  return out;
})();
function bedAt(w: number): { i: number; f: number } {
  let i = 0;
  while (i + 1 < BEDS.length && BEDS[i + 1].at <= w) i++;
  return { i, f: w - BEDS[i].at };
}

function sandstone(shade: number, v: number, px: number, _py: number, _x: number, _y: number): RGB {
  // the beds wander a little up and down along the wall, as rock laid down by water and wind does
  const w = v + 6 * (vnoise(px / 70, 0.5, 871) - 0.5) + 2 * (vnoise(px / 17, 1.5, 872) - 0.5);
  const wf = Math.floor(w);
  const { i: bi, f } = bedAt(wf);
  const bed = BEDS[bi];
  // where the light turns, it turns block by block, not down one line
  const sj = shade + (hash(bi, Math.floor(px / 29), 873) - 0.5) * 0.18;
  const row = sj > 0.35 ? 0 : sj < -0.35 ? 2 : 1;
  const r = C_WALL[row];
  let c: RGB;
  // each bed its own tone, so the wall reads in bands
  const own = hash(bi, 2, 874) > 0.5 ? 2 : 1;
  if (bed.kind === 'cream') c = C_CREAM[row];
  else if (bed.kind === 'red') c = mixc(r[2], r[3], 0.35);
  else if (bed.kind === 'dune') c = mixc(C_CREAM[row], r[1], 0.45);
  else c = r[own];
  // THE BLOCKS: some beds split into blocks by short cracks down them
  const bw = 26 + Math.floor(hash(bi, 6, 880) * 50);
  const bo = Math.floor(hash(bi, 7, 880) * bw);
  const blk = Math.floor((px + bo) / bw);
  if (bed.kind !== 'ledge') {
    // its top row catches the light, its bottom row is in the shade of the bed's overhang
    if (f === bed.tall - 1) c = mixc(c, r[0], 0.35);
    else if (f === 0) c = mixc(c, r[3], 0.3);
    // the crack between this block and the next, not through every bed
    // (only some beds split so, and not at every block: sandstone parts where it will)
    const splits = hash(bi, 8, 880) > 0.45 && hash(bi, blk, 884) > 0.55;
    const lean = Math.round((f / bed.tall - 0.5) * 2 * (hash(bi, blk, 885) - 0.5) * 2);
    const at0 = mod(px + bo + lean, bw);
    if (splits && f > 0 && f < bed.tall - 1) {
      if (at0 === 0) c = r[3];
      else if (at0 === 1 && row < 2) c = mixc(c, r[0], 0.45);
    }
  }
  // a hard ledge stands out of the wall: its top lit, two pixels; its foot dark; and the bed under it in its shadow
  if (bed.kind === 'ledge') {
    if (f >= bed.tall - 2) c = r[0];
    else if (f === 0) c = r[3];
    else c = mixc(r[1], r[0], 0.3);
  }
  const above = bi + 1 < BEDS.length ? BEDS[bi + 1] : null;
  if (above && above.kind === 'ledge' && bed.kind !== 'ledge') {
    if (f >= bed.tall - 1) c = r[3];
    else if (f >= bed.tall - 3) c = mixc(c, r[3], 0.5);
  }
  // an old dune's fine slanting lines across its bed, a step darker, in sets that change their slant
  if (bed.kind === 'dune' && f > 1 && f < bed.tall - 2) {
    const set = Math.floor((px + hash(bi, 5, 876) * 200) / 48);
    if (hash(bi, set, 879) > 0.35) {
      const dir = hash(bi, set, 877) > 0.5 ? 1 : -1;
      if (mod(px * dir + 2 * f + Math.floor(hash(bi, set, 878) * 13), 13) < 2) c = mixc(c, r[3], 0.4);
    }
  }
  // pits weathered into the soft beds: a dark hollow, lit along its lower lip
  if (bed.kind === 'soft' && f > 1 && f < bed.tall - 2) {
    const qx = Math.floor(px / 8);
    const qy = Math.floor(wf / 5);
    if (hash(qx, qy, 885) < 0.12) {
      const ax = qx * 8 + 2 + Math.floor(hash(qx, qy, 886) * 4);
      const ay = qy * 5 + 2;
      const wide = hash(qx, qy, 887) > 0.5 ? 3 : 2;
      if (wf === ay && px >= ax && px < ax + wide) c = r[3];
      else if (wf === ay - 1 && px >= ax && px < ax + wide && row < 2) c = mixc(c, r[0], 0.6);
    }
  }
  // the joints splitting down through several beds: a dark line, lit on its right where the light reaches; few
  const JS = 61;
  const jc = Math.floor(px / JS);
  const jx = jc * JS + 4 + Math.floor(hash(jc, 0, 881) * (JS - 10)) + Math.round(4 * (vnoise(w / 26, jc, 882) - 0.5));
  if (hash(jc, 1, 881) > 0.5) {
    const lo = 6 + hash(jc, 2, 881) * 70;
    const hi = lo + 20 + hash(jc, 3, 881) * 60;
    if (w > lo && w < hi) {
      if (px === jx) c = r[3];
      else if (px === jx + 1 && row < 2) c = mixc(c, r[0], 0.6);
    }
  }
  // THE DESERT VARNISH streaked down from the rim: a dark film, broad at the top and narrowing as it runs, its
  // edges ragged
  const VS = 23;
  const vc = Math.floor(px / VS);
  if (hash(vc, 0, 891) > 0.55) {
    const len = 30 + hash(vc, 1, 891) * 100;
    const top = 150 - 4;
    const down = top - v; // how far down from the rim
    if (down >= 0 && down < len) {
      const k = 1 - down / len;
      const mid = vc * VS + 4 + Math.floor(hash(vc, 3, 891) * (VS - 8)) + Math.round(2 * (vnoise(v / 20, vc, 893) - 0.5));
      const half = (1 + 4 * hash(vc, 2, 891)) * (0.35 + 0.65 * k) + 1.2 * (vnoise(v / 3, vc + 0.5, 892) - 0.5);
      const d = Math.abs(px + 0.5 - mid);
      if (d < half) c = mixc(c, VARNISH, d < half - 1.2 ? 0.4 : 0.22);
    }
  }
  // the shadow under the caprock's lip at the top, and the wall's foot, darker where it meets the sand
  if (v > 150 - 5) c = mixc(c, WALL_DEEP, 0.35);
  if (v < 3) c = mixc(c, WALL_DEEP, 0.25);
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE TOPS: the mesa

/** A slab of the caprock out across the top at world (x, y)? */
const slabAt = (x: number, y: number): boolean => fbm(x * 0.55, y * 0.55, 902) > 0.75;
/** World (x, y) moved (dx, dy) picture pixels. */
const nudge = (x: number, y: number, dx: number, dy: number): [number, number] => [x + dx / 64 + dy / 32, y - dx / 64 + dy / 32];

function mesa(x: number, y: number, px: number, py: number, back: number): RGB {
  // THE RIM of pale caprock along the cliff's edge, wider and narrower as it goes, cracked across
  const rimW = 0.12 + 0.14 * vnoise(x * 1.3, y * 1.3, 901);
  const crackAt = (): boolean =>
    mod(alongX(px, py) + Math.floor(vnoise(x * 3, y * 3, 903) * 40), 41) < 2 || mod(alongY(px, py) + Math.floor(vnoise(x * 3, y * 3, 904) * 40), 47) < 2;
  if (back < rimW) {
    if (crackAt() && back > 0.02) return C_CAP[3];
    return back < rimW * 0.4 ? C_CAP[2] : C_CAP[1];
  }
  // THE SLABS of it out across the top, standing a little proud of the earth: lit along their upper left, in
  // shade along their lower right, a shadow on the earth beyond
  if (slabAt(x, y)) {
    if (!slabAt(...nudge(x, y, 0, -1)) || !slabAt(...nudge(x, y, -1, 0))) return C_CAP[1];
    if (!slabAt(...nudge(x, y, 0, 1)) || !slabAt(...nudge(x, y, 1, 0))) return C_EARTH[1];
    if (crackAt()) return C_CAP[3];
    return over(fbm(x * 2, y * 2, 905), 0.55, px, py) ? C_CAP[0] : mixc(C_CAP[0], C_EARTH[2], 0.5);
  }
  if (slabAt(...nudge(x, y, -1, -1)) || slabAt(...nudge(x, y, 0, -1)) || slabAt(...nudge(x, y, -2, -1))) return C_EARTH[0];
  // THE EARTH, in slow patches giving way softly: the body, a deeper red where it is damp or shaded, paler where baked
  const t = fbm(x * 0.8, y * 0.8, 911);
  const tone = over(t, 0.64, px, py) ? 3 : over(t, 0.36, px, py) ? 2 : 1;
  let c = tone === 1 ? mixc(C_EARTH[1], C_EARTH[2], 0.35) : C_EARTH[tone];
  // cracks across the mesa, lit on their near lip
  const k = mod(alongX(px, py) + Math.floor(vnoise(x * 2, y * 2, 912) * 60), 67);
  const on = vnoise(x * 3, y * 3, 913) > 0.62;
  if (on && k < 2) return C_EARTH[0];
  if (on && k >= 2 && k < 3) c = C_EARTH[3];
  // OLIVE SCRUB in clumps where it grows (a few blades lit at their tips, a shadow under), and seldom elsewhere
  const sc = fbm(x * 1.6, y * 1.6, 921);
  const cx = Math.floor(px / 7);
  const cy = Math.floor(py / 5);
  if (hash(cx, cy, 922) < (sc > 0.64 ? 0.32 : 0.008)) {
    const ax = cx * 7 + 2 + Math.floor(hash(cx, cy, 923) * 3);
    const ay = cy * 5 + 1;
    const big = hash(cx, cy, 924) > 0.5;
    if (py === ay && (px === ax || (big && px === ax + 2))) return C_SCRUB[2];
    if (py === ay + 1 && px >= ax - 1 && px <= ax + (big ? 3 : 1)) return C_SCRUB[px === ax - 1 ? 0 : 1];
    if (py === ay + 2 && px >= ax && px <= ax + (big ? 3 : 1)) return C_EARTH[0];
  }
  // pebbles: two pixels lit over two in shade
  const sx = Math.floor(px / 10);
  const sy = Math.floor(py / 6);
  if (hash(sx, sy, 925) < 0.035) {
    const ax = sx * 10 + 2 + Math.floor(hash(sx, sy, 926) * 5);
    const ay = sy * 6 + 2;
    if (py === ay && px >= ax && px < ax + 2) return C_CAP[2];
    if (py === ay + 1 && px >= ax && px < ax + 2) return C_EARTH[0];
  }
  return c;
}

/** The near cliff's face, in shadow (his rule): the shaded sandstone toward the deep dark, its beds faint in it. */
function nearFace(v: number, px: number, _py: number, _x: number, _y: number): RGB {
  const r = C_WALL[2];
  const w = v + 6 * (vnoise(px / 70, 0.5, 871) - 0.5);
  const { i: bi, f } = bedAt(Math.floor(w) + 40);
  const bed = BEDS[bi];
  let c = mixc(bed.kind === 'cream' ? C_CREAM[2] : r[bed.kind === 'ledge' && f >= bed.tall - 1 ? 0 : 1], DEEP, 0.45);
  if (v <= 2) c = mixc(r[3], DEEP, 0.55); // its foot, at the floor's edge
  if (v >= 39) c = mixc(C_CAP[1], [255, 248, 236], 0.1); // its lit top edge, the caprock
  return c;
}

/** ECHO CANYON'S GROUND. */
export const CANYON_LOOK: TerrainLook = {
  // the planning chat's 150 (75 game pixels: nearly three heroes high), as he said yes to: the walls close in
  rise: 150,
  near: 40,
  round: 0.5,
  rag: 0.32,
  fine: 0.06,
  seed: 81,
  floor: riverbed,
  face: sandstone,
  top: mesa,
  nearFace,
  brow: (c) => mixc(c, [255, 246, 232], 0.3),
  foot: [0.36, 0.2],
  // the near wall felt where the canyon turns across the screen (the mock-up's 1.6 tiles)
  nearShadow: { reach: 1.6, dark: [0.38, 0.24] },
};
