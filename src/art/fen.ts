// FLOOR 10, THE SUNKEN FEN: its ground (art/terrain.ts paints it from the level's own tiles).
//
// The owner, 13 Oct 2026, to the planning chat: offered the Sunken Fen painted in the game's own frame, from the
// swamp's end of the lines of magic, where the Drowned Eye waits (06:48: “Yep”); shown it and asked “Is this the
// Sunken Fen?”, his pick: “More of the Eye”; shown it again (previews/fen_eye_in_game.png; src/dev/preview_act1.ts,
// hash `fen`, on mockup/act1-levels) and asked “Is this the Sunken Fen and the Drowned Eye now?”, by 07:40: “Yes,
// this is it (Recommended)”. And on 12 Oct, 18:56: “The forest and the swamp don’t really have walls”. That picture
// is the measure for this one; the art chat began it on his word of 15 Oct, by 15:06: “Yes, floor 10 go
// (Recommended)”.
//
// WHAT IT IS: the ancient swamp at the foot of the mountain, where the Drowned Eye feeds the cult's siege:
// - THE FLOOR is islands of sodden peat: black-brown mud in slow patches, sodden moss over it, puddles of dark
//   water lying in it, sedge and cattails in clumps, dead roots twisting through it; wetter and darker toward its
//   edge, where it slips into the water. The swamp's sickness is in all of it: dull violet veins, thickest here at
//   its heart.
// - THE RUIN (where the level has it): old paving, sunk and tilted, its flagstones cracked, moss and slime in the
//   joints, the sickness's veins running up through the cracks.
// - NO WALLS (his word): past the islands the ground is the fen's water, at the same height: murky and dark, a
//   brown murk in the shallows by the mud with reeds standing in it, near black further out; drifts of duckweed,
//   lily pads, slow lines of scum; the mist lying low over it in pale streaks. Where the level lays boardwalks
//   (walkable tiles over the water) the water runs on under them, painted under the planks. (The boardwalks, the
//   dead trees, the obelisks are pieces, laid as the game lays them.)
// - THE EYE'S POOL (where the level has it): deep water, darker than the fen, slow rings rippling out over it from
//   its middle. (The Eye itself is the boss, drawn as the game draws a figure.)
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material; a palette of its
// own (Colour 1: the fen's black-greens and peat browns, after the Pinewood's greens), a step quieter than the
// figures (Places 2) and duller than any word's colour (Colour 4); the shadows fall into a deep, cool dark (Colour 2);
// nothing glows, nothing cyan or pink (Colour 3: the water a murky green-black, its hue held clear of cyan; the
// sickness's violet dull; the cult's pink only on its pieces); crisp pixels, no smoothing.
//
// FOR THE MAIN CHAT: `fenLook(land)` makes the look for a level, from what only the level knows: where its
// boardwalks are laid over the water, where its ruin's paving is, where the Eye's pool lies, and how sick the ground
// is (each optional).

import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cl = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

/** THE PEAT: black-brown sodden mud, shade to light. */
export const C_PEAT = ['#1c1712', '#272019', '#342a20', '#43372a', '#534634', '#655740'].map(hex);
/** Sodden moss over it. */
export const C_MOSS = ['#222b1b', '#2e3a22', '#3c4b2b', '#4c5e35'].map(hex);
/** Sedge and cattails: their blades (shade to lit) and their heads. */
export const C_SEDGE = ['#3a4228', '#4e5832', '#666e3e', '#7e8450'].map(hex);
export const C_CATTAIL = ['#3a2c22', '#4e3c2c', '#5e4a38'].map(hex);
/** Dead roots in the mud: grey wood. */
export const C_ROOT = ['#2a2420', '#3e3630', '#56504a'].map(hex);
/** THE FEN'S WATER: near black, murky green, the light on it. */
export const C_FEN = ['#101814', '#16211b', '#1c2a22', '#23332a', '#2b3d32', '#36493c', '#506252'].map(hex);
/** The brown murk of the shallows. */
export const C_MURK = ['#1c1a12', '#262318', '#302c1e'].map(hex);
/** Duckweed and lily pads: dull greens. */
export const C_WEED = ['#28331c', '#344224', '#42532c', '#53663a'].map(hex);
/** The mist lying low over the water: a pale grey-green. */
export const C_MIST = ['#3c4642', '#4a5450', '#5a6460'].map(hex);
/** THE RUIN'S PAVING: old grey stone with a cold violet in it, shade to lit. */
export const C_PAVE = ['#29272e', '#38353e', '#48444f', '#5a5661', '#6e6974', '#837e88'].map(hex);
/** Slime in its joints and over its stones. */
export const C_SLIME = ['#26301c', '#334024', '#42512c'].map(hex);
/** THE SWAMP'S SICKNESS: the dull violet of its veins (the Pinewood's), and the grey it drains things to. */
export const C_VEIN = ['#3e2c4a', '#5a4266', '#76608a'].map(hex);
const C_SICK = ['#2e2c2c', '#3c3a38', '#4c4a46'].map(hex);
/** The deep, cool dark under everything (his rulebook's dark base). */
const DEEP: RGB = hex('#0c1014');

/** Above a threshold, with a checkered pixel or two where it is near it, so that one tone gives way to the next softly, still crisp. */
function over(t: number, thr: number, px: number, py: number, band = 0.018): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  const k = (t - thr + band) / (2 * band);
  return k > BAYER[py & 1][px & 1];
}
const BAYER = [
  [0.125, 0.625],
  [0.875, 0.375],
];

/** What only the level knows of its fen (each optional). */
export interface FenLand {
  /** Where the floor is laid over the water: its boardwalks (the water runs on under their planks). */
  boards?: (x: number, y: number) => boolean;
  /** Where the floor is the ruin's old paving. */
  paved?: (x: number, y: number) => boolean;
  /** How far a place is from the middle of the Eye's pool, measured so that its rim is at 1 (Infinity where there is none). */
  pool?: (x: number, y: number) => number;
  /** How sick the ground is with the swamp's violet: 0 none, 1 the most (0.45 where the level does not say). */
  sick?: (x: number, y: number) => number;
}

// ---------------------------------------------------------------------------------------------------
// THE SWAMP'S SICKNESS: veins of dull violet through the ground, the edges of a scattered grid's cells (as in the Pinewood)

function veinAt(x: number, y: number, sick: number): boolean {
  if (sick < 0.25) return false;
  const S = 0.9;
  const gx = x / S;
  const gy = y / S;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let d1 = 9;
  let d2 = 9;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = ix + i + 0.15 + 0.7 * hash(ix + i, iy + j, 2021);
      const cy = iy + j + 0.15 + 0.7 * hash(ix + i, iy + j, 2022);
      const d = Math.hypot(gx - cx, gy - cy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) d2 = d;
    }
  }
  return d2 - d1 < 0.015 + 0.03 * sick && vnoise(x * 0.8, y * 0.8, 2023) < 0.1 + 0.55 * sick && vnoise(x * 2.6, y * 2.6, 2024) > 0.3;
}
function sicken(c: RGB, x: number, y: number, px: number, py: number, sick: number): RGB {
  if (sick <= 0) return c;
  if (veinAt(x, y, sick)) return C_VEIN[over(fbm(x * 3, y * 3, 2025), 0.55, px, py) ? 2 : 1];
  const lum = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const grey = lum < 35 ? C_SICK[0] : lum < 60 ? C_SICK[1] : C_SICK[2];
  return mixc(c, grey, 0.35 * sick);
}

// ---------------------------------------------------------------------------------------------------
// THE WATER

/** A lily pad here: a flat round of dull green, notched, lit along its upper left, its shadow under; or nothing. */
function padAt(px: number, py: number, many: number): RGB | null {
  const cy = Math.floor(py / 6);
  const cx = Math.floor((px + (cy % 2) * 5) / 11);
  if (hash(cx, cy, 2031) >= many) return null;
  const ax = cx * 11 - (cy % 2) * 5 + 2 + Math.floor(hash(cx, cy, 2032) * 5);
  const ay = cy * 6 + 1 + Math.floor(hash(cx, cy, 2033) * 2);
  const w = 2 + Math.floor(hash(cx, cy, 2034) * 2);
  const dx = px - ax;
  const dy = py - ay;
  if (Math.abs(dx) > w || dy < -1 || dy > 1) return null;
  if (dy !== 0 && Math.abs(dx) === w) return null;
  // its notch, a dark wedge
  if (dy === 0 && dx === (hash(cx, cy, 2035) < 0.5 ? w - 1 : 1 - w)) return C_FEN[1];
  if (dy === -1) return C_WEED[3];
  if (dy === 1) return C_WEED[0];
  return C_WEED[2];
}
/** Duckweed drifting in rafts: specks of dull green, thick in a raft, thin at its edge; or nothing. */
function weedAt(x: number, y: number, px: number, py: number): RGB | null {
  const raft = fbm(x * 0.55 + 3, y * 0.55, 2041);
  if (raft < 0.6) return null;
  const want = raft > 0.72 ? 0.55 : raft > 0.66 ? 0.25 : 0.06;
  if (hash(px, py, 2042) >= want) return null;
  return C_WEED[hash(px >> 1, py, 2043) < 0.35 ? 2 : hash(px, py >> 1, 2044) < 0.5 ? 1 : 0];
}
/** The mist lying low over the water: thin pale streaks along the picture's rows, every other pixel at their edges; or nothing. */
function mistAt(x: number, y: number, px: number, py: number): RGB | null {
  const bank = fbm(x * 0.25 + 11, y * 0.25, 2051);
  if (bank < 0.58) return null;
  const streak = vnoise(px / 34, py / 2.5, 2052) + 0.8 * (bank - 0.58);
  if (streak < 0.76) return null;
  if ((px + py) % 2 === 1 && streak < 0.84) return null;
  return C_MIST[streak > 0.9 ? 2 : streak > 0.82 ? 1 : 0];
}
/** Cattails standing in the shallows: stalks three to five pixels tall, a brown head, a lit tip; or nothing. */
function reedsAt(px: number, py: number, much: number): RGB | null {
  const cx = Math.floor(px / 3);
  const cy = Math.floor(py / 6);
  if (hash(cx, cy, 2061) >= much) return null;
  const ax = cx * 3 + Math.floor(hash(cx, cy, 2062) * 2);
  const ay = cy * 6 + Math.floor(hash(cx, cy, 2063) * 2);
  if (px !== ax) return null;
  const tall = 3 + Math.floor(hash(cx, cy, 2064) * 3);
  const head = hash(cx, cy, 2065) < 0.4;
  const dy = py - ay;
  if (dy < 0 || dy > tall) return null;
  if (head && dy <= 1) return C_CATTAIL[dy === 0 ? 2 : 1];
  if (dy === 0) return C_SEDGE[3];
  if (dy === tall) return C_FEN[2];
  return C_SEDGE[dy < tall / 2 ? 2 : 1];
}
/**
 * THE FEN'S WATER at (x, y): `back` 0 at the mud's edge, 1 well out. A brown murk and reeds in the shallows by the
 * mud; darker further out; its tone in slow patches, slow lines of scum on it, duckweed, lily pads, the mist low over it.
 */
function water(x: number, y: number, px: number, py: number, back: number, edge: boolean): RGB {
  const t = fbm(x * 0.7, y * 0.7, 2071) - 0.35 * back;
  let c = C_FEN[over(t, 0.56, px, py) ? 4 : over(t, 0.38, px, py) ? 3 : over(t, 0.18, px, py) ? 2 : 1];
  // the shallows by the mud: a brown murk, reeds standing in it
  if (back < 0.18) {
    const m = 1 - back / 0.18;
    if (over(m + 0.3 * fbm(x * 2, y * 2, 2072), 0.75, px, py, 0.1)) c = C_MURK[over(fbm(x * 3, y * 3, 2073), 0.5, px, py) ? 2 : 1];
    const reed = reedsAt(px, py, 0.5 * m);
    if (reed) return reed;
    // where the water meets the mud, a line of light on it
    if (edge) return C_FEN[6];
  }
  // slow lines of scum and ripple, along the rows, broken
  const row = Math.floor(py / 5);
  const wav = vnoise(px / 30, row, 2074);
  if (py % 5 === 0 && wav > 0.7 && vnoise(px / 9, row, 2075) > 0.55) c = C_FEN[Math.min(6, (C_FEN.indexOf(c) < 0 ? 3 : C_FEN.indexOf(c)) + 2)];
  const weed = weedAt(x, y, px, py);
  if (weed) c = weed;
  const pad = padAt(px, py, fbm(x * 0.5, y * 0.5 + 7, 2076) > 0.55 ? 0.12 : 0.015);
  if (pad) c = pad;
  // glints of the murky sky
  if (hash(px >> 1, py, 2077) < 0.002) c = C_FEN[6];
  const mist = mistAt(x, y, px, py);
  if (mist) c = mist;
  return c;
}
/** THE EYE'S POOL at (x, y), `d` from its middle (its rim at 1): deep and near black, slow rings rippling out over it, a lip of old stone at its rim. */
function pool(x: number, y: number, px: number, py: number, d: number): RGB {
  let c = d > 0.86 ? C_FEN[1] : C_FEN[0];
  // the rings, broken
  const ring = (d * 7 + 0.35 * fbm(x * 0.8, y * 0.8, 2081)) % 1;
  if (ring < 0.07 && vnoise(px / 14, py / 7, 2082) > 0.35) c = C_FEN[3];
  else if (ring > 0.93 && vnoise(px / 14, py / 7, 2083) > 0.45) c = C_FEN[2];
  // its rim of old stone, sunk, moss on it
  if (d > 0.94) return C_PAVE[over(fbm(x * 3, y * 3, 2084), 0.5, px, py) ? 2 : 1];
  if (d > 0.9) return C_SLIME[1];
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE FLOOR: islands of peat; the ruin's paving

/** A clump of sedge here: blades two to four pixels tall fanning out, lit at their tips, a dark foot; or nothing. */
function sedgeAt(px: number, py: number, much: number): RGB | null {
  const ty = Math.floor(py / 7);
  const sx = px + (ty % 2) * 5;
  const tx = Math.floor(sx / 10);
  if (hash(tx, ty, 2091) >= much) return null;
  const ax = tx * 10 + Math.floor(hash(tx, ty, 2092) * 5) - (ty % 2) * 5;
  const ay = ty * 7 + Math.floor(hash(tx, ty, 2093) * 2);
  const n = 3 + Math.floor(hash(tx, ty, 2094) * 3);
  const dx = px - ax;
  const dy = py - ay;
  if (dx < 0 || dx >= 2 * n - 1 || dy < 0 || dy > 4) return null;
  // its blades uneven: some short, some tall, the outer ones leaning out at their tips
  const blade = dx % 2 === 0 && hash(tx * 7 + dx, ty, 2096) < 0.85;
  const lean = dx === 0 ? -1 : dx === 2 * n - 2 ? 1 : 0;
  const b2 = (dx - lean) % 2 === 0 && hash(tx * 7 + dx - lean, ty, 2096) < 0.85;
  if (dy === 4) return blade || b2 ? C_PEAT[0] : null;
  const h = 1 + Math.floor(hash(tx * 7 + dx, ty, 2095) * 3.5);
  const top = 4 - h;
  if (lean && b2 && dy === top && dy < 2) return C_SEDGE[3];
  if (!blade) return null;
  if (dy === top && !(lean && dy < 2)) return C_SEDGE[3];
  if (dy > top && dy < 4) return C_SEDGE[dy - top < 2 ? 2 : 1];
  return null;
}
/** A puddle lying in the mud: dark water, the murky sky's light along its far edge, its near lip of wet mud; or nothing. */
function puddleAt(x: number, y: number, px: number, py: number): RGB | null {
  const p = fbm(x * 1.3 + 5, y * 1.3, 2101);
  if (p < 0.7) return null;
  if (p < 0.72) return C_PEAT[0];
  // the light on it along its upper edge (it lies lower than the mud round it)
  const above = fbm((x * 1.3 + 5) - 0.03, y * 1.3 - 0.03, 2101);
  if (above < 0.72) return C_FEN[5];
  return C_FEN[over(fbm(x * 4, y * 4, 2102), 0.6, px, py) ? 3 : 2];
}
/** A dead root twisting through the mud: a grey line a pixel thick, lit along its top, a shade under it; or nothing. */
function rootAt(px: number, py: number): RGB | null {
  const cx = Math.floor(px / 24);
  const cy = Math.floor(py / 12);
  if (hash(cx, cy, 2111) >= 0.18) return null;
  const ax = cx * 24 + 2 + Math.floor(hash(cx, cy, 2112) * 8);
  const ay = cy * 12 + 3 + Math.floor(hash(cx, cy, 2113) * 4);
  const run = px - ax;
  const long = 8 + Math.floor(hash(cx, cy, 2114) * 10);
  if (run < 0 || run >= long) return null;
  const wob = Math.round(1.6 * Math.sin(run / 3 + hash(cx, cy, 2115) * 6) + (hash(cx, cy, 2116) - 0.5) * run * 0.3);
  if (py === ay + wob) return C_ROOT[run % 5 === 0 ? 1 : 2];
  if (py === ay + wob + 1) return C_ROOT[0];
  return null;
}
function peatOf(land: FenLand) {
  return (x: number, y: number, px: number, py: number, inside: number): RGB => {
    const sick = land.sick ? cl(land.sick(x, y), 0, 1) : 0.45;
    // its tone in slow patches, darker and wetter toward its edge
    const wet = 1 - cl(inside * 2.2, 0, 1);
    const t = fbm(x * 0.8, y * 0.8, 2121) - 0.35 * wet;
    let c = C_PEAT[over(t, 0.6, px, py) ? 4 : over(t, 0.44, px, py) ? 3 : over(t, 0.28, px, py) ? 2 : 1];
    // its own grain: clods lit at their upper left over a pixel of shade
    const g = hash(px >> 1, py, 2122);
    if (g < 0.1) c = C_PEAT[Math.min(5, C_PEAT.indexOf(c) + 1)];
    else if (g < 0.18) c = C_PEAT[Math.max(0, C_PEAT.indexOf(c) - 1)];
    // sodden moss over it in patches
    const moss = fbm(x * 0.9 + 9, y * 0.9, 2123) - 0.2 * wet;
    if (over(moss, 0.55, px, py)) {
      c = C_MOSS[over(fbm(x * 3, y * 3, 2124), 0.6, px, py) ? 3 : over(fbm(x * 3, y * 3, 2124), 0.42, px, py) ? 2 : 1];
      if (hash(px, py >> 1, 2125) < 0.08) c = C_MOSS[0];
    }
    const pud = puddleAt(x, y, px, py);
    if (pud) c = pud;
    const root = rootAt(px, py);
    if (root && !pud) c = root;
    const sedge = sedgeAt(px, py, 0.08 + 0.4 * wet + 0.15 * fbm(x * 1.2, y * 1.2, 2126));
    if (sedge) c = sedge;
    // toward its edge, the mud's own wet sheen, and darker
    if (wet > 0.6 && hash(px, py, 2127) < 0.03 * wet) c = C_PEAT[5];
    c = mixc(c, DEEP, 0.18 * wet);
    return sicken(c, x, y, px, py, sick);
  };
}
/** THE RUIN'S PAVING: flagstones along the world's lines, sunk and tilted, each its own tone, lit along its upper left edge and shaded along its lower right; cracked; moss and slime in the joints; the sickness up through the cracks. */
function paving(x: number, y: number, px: number, py: number, sick: number): RGB {
  const S = 0.62;
  const u = x / S;
  const v = y / S;
  const iu = Math.floor(u);
  const iv = Math.floor(v);
  const fu = u - iu;
  const fv = v - iv;
  const tone = 2 + Math.floor(hash(iu, iv, 2131) * 3);
  // the joints: dark, moss or slime growing in them
  if (fu < 0.07 || fv < 0.07) return sicken(fbm(x * 3, y * 3, 2132) > 0.5 ? C_SLIME[over(fbm(x * 5, y * 5, 2133), 0.5, px, py) ? 2 : 1] : C_PAVE[0], x, y, px, py, sick);
  // each stone tilted a little: lit along the edge toward the light (upper left), shaded along the other
  const tilt = hash(iu, iv, 2134) < 0.4;
  let c = C_PAVE[tone];
  if (fu < 0.16 || fv < 0.16) c = C_PAVE[Math.min(5, tone + (tilt ? 2 : 1))];
  else if (fu > 0.88 || fv > 0.88) c = C_PAVE[Math.max(1, tone - 1)];
  // wear and stain over it
  const st = fbm(x * 1.6, y * 1.6, 2135);
  if (over(st, 0.64, px, py)) c = C_SLIME[over(fbm(x * 4, y * 4, 2136), 0.55, px, py) ? 2 : 1];
  else if (hash(px >> 1, py, 2137) < 0.08) c = C_PAVE[Math.max(1, tone - 1)];
  // cracks: a dark line wandering across a stone, a lit pixel beside it
  if (hash(iu, iv, 2138) < 0.35) {
    const a = hash(iu, iv, 2139) * Math.PI;
    const k = (fu - 0.5) * Math.sin(a) - (fv - 0.5) * Math.cos(a) + 0.08 * Math.sin(fu * 9 + fv * 7);
    if (Math.abs(k) < 0.035) return sicken(C_PAVE[0], x, y, px, py, sick);
  }
  return sicken(c, x, y, px, py, sick);
}

function floorOf(land: FenLand) {
  const peat = peatOf(land);
  return (x: number, y: number, px: number, py: number, inside: number): RGB => {
    const sick = land.sick ? cl(land.sick(x, y), 0, 1) : 0.45;
    // a boardwalk over the water: the water runs on under its planks
    if (land.boards && land.boards(x, y)) return water(x, y, px, py, 0.5, false);
    if (land.paved && land.paved(x, y)) return paving(x, y, px, py, sick);
    return peat(x, y, px, py, inside);
  };
}

/** THE SUNKEN FEN'S GROUND, for a level's own boardwalks, ruin, pool and sickness. */
export function fenLook(land: FenLand = {}): TerrainLook {
  const fen = (x: number, y: number, px: number, py: number, back: number): RGB => {
    if (land.pool) {
      const d = land.pool(x, y);
      if (d < 1) return pool(x, y, px, py, d);
    }
    return water(x, y, px, py, back, back < 0.02);
  };
  return {
    // his word: no walls. The fen's water lies at the islands' height; its trees, boardwalks and obelisks are pieces.
    rise: 0,
    near: 0,
    round: 0.5,
    rag: 0.4,
    fine: 0.09,
    seed: 101,
    floor: floorOf(land),
    // (no faces at the islands' height: these are never asked for, but a look has them)
    face: (_s, _v, px, py, x, y) => fen(x, y, px, py, 0),
    top: (x, y, px, py, back) => fen(x, y, px, py, back),
    nearFace: (_v, px, py, x, y) => fen(x, y, px, py, 0),
    brow: (c) => c,
    foot: [0, 0],
  };
}
