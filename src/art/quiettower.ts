// FLOOR 20, THE QUIET TOWER: ITS GROUND (art/terrain.ts paints it from the level's own tiles). ACT 2, PART TWO, THE HIGH
// CITY, its lair floor. A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (approved by him: “Yes, go (Recommended)”), level 20,
// THE QUIET TOWER: "The lair floor that ends Act 2: the highest tower of the High City, where the last chapter was taken.";
// its layout "a climb up the tower's spiralling floors (a scriptorium, a bell-less belfry, rooms the fog has filled) to the
// open top under the sky."; its boss the Moth, "Its floor is the Tower Top."; its story "the torn-out last chapter lies
// open on the tower's top. It does not tell how the story ends. It is a name, and the thing it names is the Hush itself.";
// its palette "Grey fog, bone white, no colour at all."
//
// WHAT IT IS: the tower's dressed stone, bone-grey, cold; no colour at all:
// - INSIDE (`quietTowerTerrain`), room by room (`QT_ZONE`): the stair's landings and the ways between, flags in courses;
//   the SCRIPTORIUM, flags spattered with the copyists' old ink gone dry, blank pages dropped about; the BELL-LESS
//   BELFRY, heavy boards of weathered grey oak; the ROOMS THE FOG HAS FILLED, flags drowned under lying fog. Over all of
//   it the Hush's grey dust, drifted thick at the walls' feet. ITS WALLS: ashlar of the same stone, bay by bay a tall
//   lancet window with the grey of the fog outside in it, an arrow slit, an empty niche, cracks hung with moth silk; the
//   scriptorium's pigeonholes of blank scrolls; the belfry's tall louvred openings, the grey sky between the slats; the
//   wall's top fading into the dark (in the fogged rooms, into the fog).
// - THE TOWER TOP (`towerTopTerrain`, the Moth's floor), open under the sky: a round platform of pale flags laid in rings
//   round its middle; round it, a PARAPET, crenellated (merlons and embrasures, the fog seen through each embrasure; the
//   near parapet cut down to its coping as the game cuts near walls); past it, the ground's DROP, and painted into it
//   (`paintQuietTower`) the FOG SEA far below, heaps of it lit from the upper left; under the
//   near parapet the tower's outer wall falling away, a corbel table under its lip, its stone lost in the fog.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own palette
// (Colour 1: the doc's grey fog and bone white, no colour); strong values and ink-dark joints so it reads at a phone's
// size, never mud (Colour 5); a step quieter than the figures and duller than any word (Places 2, Colour 4: every colour
// through art/act2_quiet.ts); NOTHING GLOWS (Colour 3: the windows' grey is daylight in an opening, never a glow; the
// candles are pieces'); no cyan, no pink; solid, not flat (Places 4); old and broken (Places 6); crisp.
//
// FOR THE MAIN CHAT: `quietTowerTerrain(floor, land)` for the tower's inside, `towerTopTerrain(floor, land)` for its top
// (two looks: the inside's walls stand 120 picture pixels, the top's parapet 44); `paintQuietTower(T, x0, y0, w, h)`
// paints a piece of either as `paintTerrain` does, the fog sea in the drop and through the embrasures (every pixel
// opaque; two pieces side by side are one picture). The game's hook is as floor 16's: this in place of `paintTerrain`.

import type { Floor } from '../game/types';
import { T_FLOOR } from '../game/types';
import { TK, fbm, paintTerrain, terrainOf, vnoise } from './terrain';
import type { RGB, Terrain, TerrainLook, TerrainPiece } from './terrain';
import { hash } from './kit';
import { quietRGB, quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr2 = (t: number): number => t - Math.floor(t);

/** Above a threshold, with a checkered pixel or two where it is near it (crisp, never a smear). */
function over(t: number, thr: number, px: number, py: number, band = 0.02): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > [[0.125, 0.625], [0.875, 0.375]][py & 1][px & 1];
}

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: grey fog, bone white, no colour at all (each a step under the figures)

/** The deep, cool dark under everything. */
export const QT_DEEP: RGB = hex('#07080c');
/** THE TOWER'S STONE on a face, by how it is turned (lit to the lower left, at the eye, in shade): its lit edge, body, other body, joint. */
export const QT_STONE = [
  ['#aaa69d', '#8f8c86', '#84817c', '#45454a'],
  ['#86837e', '#73716d', '#686764', '#36363c'],
  ['#5a5958', '#4b4a4c', '#434246', '#25252b'],
].map((r) => r.map(hex));
/** THE FLAGS of the floors: the joint, shade, body, light, lit edge (bone). */
export const QT_FLAG = ['#2a2b32', '#5f5f63', '#747477', '#8a8885', '#b2ac9f'].map(hex);
/** Bone white: the coping's lit top, the worn steps. */
export const QT_BONE = ['#bcb5a5', '#d4cdbd', '#e4ded0'].map(hex);
/** THE BELFRY'S BOARDS, weathered grey oak: the gap, shade, body, body, lit. */
export const QT_BOARD = ['#15151a', '#2e2d33', '#413f45', '#524f53', '#6a6668'].map(hex);
/** THE FOG: deep, shade, body, light, its palest. */
export const QT_FOG = ['#3f434b', '#5a5e66', '#787c83', '#979a9f', '#b8b9ba'].map(hex);
/** THE HUSH'S GREY DUST, drifted: its dark (where it lies thick), body, grains, the palest grains. */
export const QT_DUST = ['#2f2f35', '#45454b', '#5b5b60', '#76767a'].map(hex);
/** Paper, blank (the words gone from it): lit, shade, a line gone dark. */
export const QT_PAGE = ['#c6c0b2', '#9f9a8e', '#2c2a30'].map(hex);
/** The copyists' ink, dry: body, its sheen. */
export const QT_INK = ['#100e14', '#262329'].map(hex);
/** Iron: dark, body, lit. */
export const QT_IRON = ['#1b1c20', '#34363c', '#555961'].map(hex);

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile of the tower's inside is (and so how its floor and the walls round it look). */
export const QT_ZONE = {
  /** The stair's landings and the ways between rooms: flags in courses; walls with arrow slits and niches. */
  Stair: 0,
  /** The scriptorium: flags spattered with dry ink, blank pages about; walls with pigeonholes of blank scrolls and lancet windows. */
  Scriptorium: 1,
  /** The bell-less belfry: heavy boards of grey oak; walls with tall louvred openings. */
  Belfry: 2,
  /** A room the fog has filled: flags under lying fog; walls fading up into the fog, hung with moth silk. */
  Fogged: 3,
} as const;

export interface QuietLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** What a walkable tile is (QT_ZONE); the stair's where not said. */
  zone?: (tx: number, ty: number) => number;
  /** More fog lying on the floor at a place, 0 to 1, over what its room has (the fog seeping in at a door or a window). */
  fog?: (x: number, y: number) => number;
}

export interface TopLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** The middle of the tower's top (tiles): its flags are laid in rings round it. */
  centre: readonly [number, number];
  /** Which tiles that are not floor fall away (the drop); by default every one with no floor tile beside it, so the parapet is the ring of tiles round the floor. */
  drop?: (tx: number, ty: number) => boolean;
  /** Fog lying on the floor at a place, 0 to 1 (by default a little, more toward the parapet). */
  fog?: (x: number, y: number) => number;
}

/** How tall the inside's walls stand (picture pixels: the game's own dungeon walls are 80); where they begin to fade. */
export const QT_RISE = 120;
export const QT_FADE = 82;
/** How tall the top's parapet stands (a merlon's top), and an embrasure's sill (a man's waist: the knight is 58). */
export const PARAPET_H = 44;
export const SILL_H = 27;
/** The merlons and embrasures along the parapet (picture pixels across): one of each to a period. */
const CRENEL = 58;
const MERLON = 34;
/** How far down the tower's outer wall shows under the near parapet before the fog takes it (picture pixels). */
export const OUTER_H = 150;

// ---------------------------------------------------------------------------------------------------
// THE FLOOR

/** FLAGS IN COURSES (the inside): grey slabs laid along x, courses broken joint, each its own tone; worn, chipped, cracked. */
export function courseFlags(x: number, y: number, px: number, py: number): RGB {
  const R = QT_FLAG;
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SV = 32;
  const j = Math.floor(V / SV);
  const len = 44 + Math.floor(hash(j, 0, 6101) * 3) * 10;
  const off = Math.floor(hash(j, 1, 6101) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const v = mod(V, SV);
  const h0 = hash(i, j, 6102);
  let t = h0 > 0.72 ? 3 : h0 < 0.24 ? 1 : 2;
  if (vnoise(x * 0.55, y * 0.55, 6103) > 0.62) t = Math.min(3, t + 1);
  let c = R[t];
  if (u < 2 || v < 2) return R[0];
  if (u < 4 || v < 4) c = R[Math.min(4, t + 1)];
  else if (u >= len - 2 || v >= SV - 2) c = R[Math.max(1, t - 1)];
  // a crack across a flag now and then; a chip out of its corner
  if (h0 > 0.84 && Math.abs(u - v * 1.1 - 4 - h0 * 10) < 1) return R[0];
  if (hash(i, j, 6104) < 0.12 && u + v < 9) return R[1];
  return c;
}

/**
 * FLAGS IN RINGS (the tower's top): laid round its middle `(cx, cy)`, ring outside ring, each ring of flags its own
 * length, the joints broken ring to ring; a round stone at the middle. World (x, y) in tiles.
 */
export function ringFlags(x: number, y: number, cx: number, cy: number, px: number, py: number): RGB {
  const R = QT_FLAG;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy);
  const RW = 0.66;
  const J = 0.05;
  if (r < 0.95) {
    // the round middle stone, a ring cut in it
    if (r > 0.95 - J) return R[0];
    if (Math.abs(r - 0.62) < J * 0.6) return R[1];
    return r > 0.95 - 2.2 * J ? R[4] : hash(px >> 1, py, 6111) < 0.1 ? R[2] : R[3];
  }
  const k = Math.floor((r - 0.95) / RW);
  const rr = r - 0.95 - k * RW;
  if (rr < J) return R[0];
  const L = 2 * Math.PI * r;
  const n = Math.max(8, Math.round(L / (0.8 + 0.25 * hash(k, 0, 6112))));
  const a = Math.atan2(dy, dx) / (2 * Math.PI) + 0.5;
  const t = a * n + hash(k, 1, 6112) * n;
  const i = mod(Math.floor(t), n);
  const along = (t - Math.floor(t)) * (L / n);
  if (along < J) return R[1];
  const h0 = hash(i, k, 6113);
  let tone = h0 > 0.7 ? 3 : h0 < 0.22 ? 1 : 2;
  if (vnoise(x * 0.5, y * 0.5, 6114) > 0.64) tone = Math.min(3, tone + 1);
  // its edge toward the middle catching the light; its outer edge a step darker
  if (rr < 2.4 * J || along < 2.2 * J) return R[Math.min(4, tone + 1)];
  if (rr > RW - 1.4 * J) return R[Math.max(1, tone - 1)];
  // a crack across it now and then
  if (h0 > 0.86 && Math.abs(rr - along * 0.6 - 0.12) < 0.025) return R[0];
  return R[tone];
}

/** THE BELFRY'S BOARDS: heavy grey oak laid along y, butt joints, nail heads; worn paler down the middle of the room. */
export function boards(x: number, y: number, px: number, py: number): RGB {
  const R = QT_BOARD;
  const U = alongY(px, py);
  const V = alongX(px, py);
  const BW = 20;
  const j = Math.floor(V / BW);
  const v = mod(V, BW);
  const len = 100 + Math.floor(hash(j, 0, 6121) * 4) * 26;
  const off = Math.floor(hash(j, 1, 6121) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const h0 = hash(i, j, 6122);
  let t = h0 > 0.7 ? 3 : h0 < 0.22 ? 1 : 2;
  if (vnoise(x * 0.5, y * 0.5, 6123) > 0.6) t = Math.min(4, t + 1);
  let c = R[t];
  // the grain: a darker line along the board here and there
  if (h0 > 0.45 && Math.abs(v - 8 - Math.floor(h0 * 6)) < 1 && mod(U + h0 * 90, 71) < 40) c = R[Math.max(1, t - 1)];
  if (v < 2) return R[0];
  if (v < 4 && t < 4) c = R[t + 1];
  if (u < 2) return R[0];
  if ((Math.abs(u - 7) < 1 || Math.abs(u - len + 7) < 1) && (Math.abs(v - 6) < 1 || Math.abs(v - BW + 5) < 1)) return R[0];
  return c;
}

/** THE COPYISTS' OLD INK, gone dry on the scriptorium's flags: spatters, and here and there a spill from a dropped pot. Null where none. */
function dryInk(x: number, y: number, px: number, py: number): RGB | null {
  if (hash(px, py, 6131) < 0.008 + 0.05 * cl01(vnoise(x * 0.8, y * 0.8, 6132) - 0.6)) return QT_INK[0];
  const U = alongX(px, py);
  const V = alongY(px, py);
  const pi = Math.floor(U / 140);
  const pj = Math.floor(V / 140);
  if (hash(pi, pj, 6133) < 0.3) {
    const cx = pi * 140 + 30 + hash(pi, pj, 6134) * 60;
    const cy = pj * 140 + 30 + hash(pi, pj, 6135) * 60;
    const a = U - cx;
    const b = V - cy;
    const len = 18 + hash(pi, pj, 6136) * 14;
    const half = (5 + 3 * Math.cos((a / len) * Math.PI * 0.5)) * (a < 0 ? 1 : 1 - 0.4 * (a / len));
    const edge = half + 3 * (vnoise(U * 0.12, V * 0.12, 6137) - 0.5) - Math.abs(b);
    if (a > -len * 0.4 && a < len && edge > 0) return edge > 2.5 && mod(a - b, 11) < 1.5 ? QT_INK[1] : QT_INK[0];
  }
  return null;
}

/** A PAGE, torn out and dropped, lying at a slant: blank (the words gone), or a line or two of writing gone dark. Null where none. */
function page(px: number, py: number, much: number, seed: number): RGB | null {
  const sx = Math.floor(px / 23);
  const sy = Math.floor(py / 13);
  if (hash(sx, sy, seed) >= much) return null;
  const ax = sx * 23 + 3 + Math.floor(hash(sx, sy, seed + 1) * 8);
  const ay = sy * 13 + 3 + Math.floor(hash(sx, sy, seed + 2) * 4);
  const dx = px - ax;
  const dy = py - ay;
  const slope = Math.floor(dx / 2) * (hash(sx, sy, seed + 3) < 0.5 ? 1 : -1);
  const e = dy - slope;
  // (torn: one end ragged)
  const torn = hash(sx, sy, seed + 4) < 0.6 && dx > 7 && hash(dx, e, seed + 5) < 0.5;
  if (dx >= 0 && dx < 10 && e >= 0 && e < 5 && !torn) {
    if (e === 4) return QT_PAGE[1];
    if (hash(sx, sy, seed + 6) < 0.3 && e === 2 && dx > 1 && dx < 8) return QT_PAGE[2];
    return QT_PAGE[0];
  }
  return null;
}

/** THE HUSH'S GREY DUST: drifted, thickest at the walls' feet (`wall` how far from one, tiles); grains on the floor. Null where none. */
function dust(x: number, y: number, px: number, py: number, wall: number, much: number): RGB | null {
  const drift = fbm(x * 0.7 + 3, y * 0.7, 6141) + 0.35 * cl01(1 - wall / 1.1) * much;
  if (over(drift, 0.74, px, py, 0.015)) {
    // the thick of it: a dark grey lying flat, pale grains on it
    const g = hash(px >> 1, py, 6142);
    return g < 0.08 ? QT_DUST[3] : g < 0.3 ? QT_DUST[2] : drift > 0.8 ? QT_DUST[0] : QT_DUST[1];
  }
  const g = hash(px >> 1, py, 6143);
  if (g < 0.05 * much * cl01((drift - 0.45) * 3)) return g < 0.015 ? QT_DUST[3] : QT_DUST[1];
  return null;
}

/** FOG lying on the floor, `thick` 0 to 1: wisps drawn out along the picture, its body in two tones; the floor `c` under it. */
export function fogOver(c: RGB, x: number, y: number, px: number, py: number, thick: number): RGB {
  if (thick <= 0) return c;
  const w = fbm(x * 0.45 + y * 0.25, y * 0.9 - x * 0.2, 6151) + 0.18 * (vnoise(px / 30, py / 9, 6152) - 0.5);
  const t = 0.78 - 0.3 * thick;
  // (drawn out in wisps: a band of it lies along the floor, the floor seen between)
  const band = Math.abs(fr2((x + y) * 0.9 + 0.35 * fbm(x * 0.6, y * 0.6, 6153)) - 0.5) * 2;
  const ww = w - 0.1 * band;
  if (over(ww, t + 0.1, px, py, 0.02)) return QT_FOG[3];
  if (over(ww, t, px, py, 0.02)) return QT_FOG[2];
  if (over(ww, t - 0.06, px, py, 0.01)) return mixc(c, QT_FOG[2], 0.45);
  return c;
}

/** Darker in toward the walls, where the daylight from the windows does not reach. */
function toWall(c: RGB, x: number, y: number, wall: number, seed: number): RGB {
  return wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, seed) ? mixc(c, QT_DEEP, 0.3) : c;
}

// ---------------------------------------------------------------------------------------------------
// THE TOWER'S STONE: ashlar on a face

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
export const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);

/**
 * ASHLAR at height `v` (picture pixels over the foot) and `a` along the face (picture pixels), in row `row` of QT_STONE:
 * courses `course` high, blocks offset course by course, each block its own tone; a lit edge along each course's top.
 */
export function ashlar(v: number, a: number, row: number, course = 12): RGB {
  const S = QT_STONE[row];
  const k = Math.floor(v / course);
  const cv = mod(v, course);
  const blk = 26 + Math.floor(hash(k, 0, 6161) * 3) * 6;
  const off = Math.floor(hash(k, 1, 6161) * blk);
  const b = Math.floor((a + off) / blk);
  const bu = mod(a + off, blk);
  if (cv < 1.5 || bu < 1.5) return S[3];
  if (cv >= course - 2) return S[0];
  const h0 = hash(b, k, 6162);
  let c = h0 > 0.66 ? S[1] : S[2];
  // weathered: a darker streak run down from a joint; a chip
  if (h0 < 0.12 && bu > blk - 6) c = S[3];
  if (hash(Math.floor(a / 2), k, 6163) < 0.04) c = S[2];
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE INSIDE'S WALLS

/** A bay of the walls, one to every 72 picture pixels, steady from run to run. */
interface Bay {
  key: number;
  u: number;
  /** 0 plain; 1 a lancet window; 2 an arrow slit; 3 an empty niche; 4 a crack, moth silk hung in it; 5 the room's own (pigeonholes in the scriptorium, a louvred opening in the belfry). */
  kind: number;
}
const BAY = 72;
function bayAt(px: number, zone: number): Bay {
  const k = Math.floor(px / BAY);
  const h = hash(k, 0, 6201);
  let kind = h < 0.2 ? 1 : h < 0.34 ? 2 : h < 0.46 ? 3 : h < 0.58 ? 4 : 0;
  if ((zone === QT_ZONE.Scriptorium || zone === QT_ZONE.Belfry) && hash(k, 1, 6201) < 0.4) kind = 5;
  if (zone === QT_ZONE.Belfry && kind === 1) kind = 5;
  return { key: k, u: px - k * BAY, kind };
}

/** The grey of the day outside, seen through an opening (a window, between louvres): `t` 0 at its foot to 1 at its head. */
function outside(t: number, px: number, py: number): RGB {
  const f = fbm(px / 9, py / 14, 6211) + 0.3 * t;
  return QT_FOG[f > 0.72 ? 4 : f > 0.5 ? 3 : 2];
}

/** A LANCET WINDOW (`w` across, sill at `sill`, its arch's spring at `spring`): the deep reveal, its splayed sides, the day in it; null outside it. */
function lancet(du: number, v: number, w: number, sill: number, spring: number, row: number, px: number, py: number): RGB | null {
  const S = QT_STONE[row];
  const half = w / 2;
  // (pointed: two arcs, each centred on the far side's spring line)
  const apex = spring + half * 1.7;
  const archAt = (d: number, r: number): number => spring + Math.sqrt(Math.max(0, r * r - (Math.abs(d) + r - half) ** 2)) * (1.7 / Math.sqrt(2 * r * half - half * half)) * half;
  const R0 = half * 1.6;
  if (v < sill - 3 || v > apex + 4 || Math.abs(du) > half + 4) return null;
  const head = (d: number, h: number): number => (v < spring ? Infinity : archAt(d, R0 + h));
  // the dressed surround: a lit rim on the left, dark on the right, a sill
  const outer = Math.abs(du) < half + 4 && v >= sill - 3 && v < head(du, 4) + 0;
  const opening = Math.abs(du) < half && v >= sill && v < head(du, 0);
  if (!outer) return null;
  if (!opening) {
    if (v < sill) return v === sill - 1 ? QT_BONE[0] : S[3];
    return du < 0 ? S[0] : S[3];
  }
  // the reveal, splayed: its left side catching the light, its right in shade, the day between
  const inner = half * 0.55;
  if (du < -inner) return S[1];
  if (du > inner) return S[3];
  return outside((v - sill) / Math.max(1, apex - sill), px, py);
}

/** THE INSIDE'S FAR WALLS: ashlar, a plinth at its foot, each bay with what is in it, fading into the dark above (into the fog in a fogged room). */
function wallFace(zone: number, shade: number, v: number, px: number, py: number): RGB {
  const row = rowOf(shade + (hash(Math.floor(px / BAY), 9, 6202) - 0.5) * 0.1);
  const S = QT_STONE[row];
  const bay = bayAt(px, zone);
  const into = zone === QT_ZONE.Fogged ? mixc(QT_FOG[1], QT_DEEP, 0.35) : QT_DEEP;
  const fade = (c: RGB): RGB => (v > QT_FADE ? mixc(c, into, 0.25 + 0.72 * cl01((v - QT_FADE) / (QT_RISE - QT_FADE))) : c);
  // the plinth: a course of bigger blocks standing out a little, its top lit
  if (v < 9) return v >= 7 ? S[0] : v < 2 ? S[3] : ashlar(v + 40, px, Math.min(2, row + 1), 9);
  let c = ashlar(v - 9, px, row);
  const du = bay.u - BAY / 2;
  if (bay.kind === 1) {
    const w = lancet(du, v, 18, 30, 62, row, px, py);
    if (w) c = w;
  } else if (bay.kind === 2) {
    // an arrow slit: a narrow opening, splayed, the day a thread in it
    if (Math.abs(du) < 6 && v > 34 && v < 70) c = Math.abs(du) < 1.5 ? outside((v - 34) / 36, px, py) : du < 0 ? S[1] : S[3];
    else if (Math.abs(du) < 8 && v > 32 && v < 72) c = du < 0 ? S[0] : S[3];
  } else if (bay.kind === 3) {
    // an empty niche: a round-headed hollow, its back in shade, a ledge; what stood in it gone
    const top = 64 + Math.sqrt(Math.max(0, 100 - du * du)) * 0.9;
    if (Math.abs(du) < 10 && v > 30 && v < top) c = v < 33 ? QT_BONE[0] : v > top - 2 || du > 7 ? S[3] : QT_STONE[2][2];
    else if (Math.abs(du) < 12 && v > 28 && v < top + 2) c = du < 0 ? S[0] : S[3];
  } else if (bay.kind === 4) {
    // a crack down the wall, moth silk strung across it in sheets
    const cx = 6 * Math.sin(v * 0.11 + bay.key) + 3 * Math.sin(v * 0.37);
    if (Math.abs(du - cx) < 1.2 && v > 16 && v < 100) c = S[3];
    const silk = Math.abs(du - cx) < 14 - Math.abs(v - 60) * 0.25 && v > 30 && v < 92;
    if (silk && (mod(du * 0.7 + v, 7) < 1 || mod(du * 0.7 - v * 0.5, 9) < 1)) c = mixc(c, QT_FOG[4], 0.7);
  } else if (bay.kind === 5 && zone === QT_ZONE.Scriptorium) {
    // pigeonholes in a frame of stone: a scroll's rolled end in most, blank; some pulled out and gone
    if (v > 24 && v < 24 + 5 * 9 && Math.abs(du) < 27) {
      const cu = mod(du + 27, 9);
      const cv = mod(v - 24, 9);
      if (cu < 2 || cv < 2) return fade(cu === 0 || cv === 0 ? S[0] : S[3]);
      const has = hash(Math.floor((du + 27) / 9), Math.floor((v - 24) / 9) + bay.key * 9, 6203) < 0.7;
      const ddu = cu - 5;
      const ddv = cv - 5;
      if (has && ddu * ddu + ddv * ddv <= 7) return fade(ddu * ddu + ddv * ddv <= 1 ? QT_PAGE[1] : ddu + ddv < 0 ? QT_PAGE[0] : QT_PAGE[1]);
      return fade(QT_DEEP);
    }
  } else if (bay.kind === 5 && zone === QT_ZONE.Belfry) {
    // a tall louvred opening: slanted boards with the day between them, a pointed head
    const w = lancet(du, v, 26, 26, 72, row, px, py);
    if (w) {
      const inOpen = Math.abs(du) < 13 * 0.55 && v >= 26 && w !== S[0] && w !== S[3] && w !== QT_BONE[0];
      if (inOpen) {
        const sl = mod(v - 26 + du * 0.25, 8);
        c = sl < 3 ? QT_BOARD[sl < 1 ? 4 : 2] : sl < 4 ? QT_BOARD[0] : w;
      } else c = w;
    }
  }
  return fade(c);
}

/** THE WALLS' TOP, seen from above: a lit edge of the stone, then the dark (the fog's dark in a fogged room). */
function wallTop(px: number, py: number, back: number, fogged: boolean): RGB {
  if (back < 0.05) return QT_STONE[0][1];
  if (back < 0.09) return QT_STONE[1][3];
  const deep = fogged ? mixc(QT_FOG[0], QT_DEEP, 0.55) : QT_DEEP;
  const r = hash(px >> 1, py, 6221);
  return r < 0.9 ? deep : mixc(deep, QT_STONE[2][2], 0.12);
}

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

/** THE TOWER'S INSIDE: its look, for a level's own rooms. */
export function quietTowerLook(land: QuietLand): TerrainLook {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const zoneAt = (tx: number, ty: number): number => (land.zone && isFloor(tx, ty) ? land.zone(tx, ty) : QT_ZONE.Stair);
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty));
  const roomOf = (shade: number, x: number, y: number): number => {
    const fx = shade < 0 ? x + 0.3 : x;
    const fy = shade < 0 ? y : y + 0.3;
    return zoneAt(Math.floor(fx), Math.floor(fy));
  };
  const nearRoom = (x: number, y: number): number => {
    for (const [dx, dy] of [[-0.3, -0.3], [-0.3, 0], [0, -0.3]] as const) if (isFloor(Math.floor(x + dx), Math.floor(y + dy))) return zoneAt(Math.floor(x + dx), Math.floor(y + dy));
    return QT_ZONE.Stair;
  };
  return quietTerrain({
    rise: QT_RISE,
    near: 40,
    // the edges straight, as walls are
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 201,
    floor: (x, y, px, py) => {
      const z = zoneAt(Math.floor(x), Math.floor(y));
      const wd = wall(x, y);
      let c: RGB;
      if (z === QT_ZONE.Belfry) c = boards(x, y, px, py);
      else {
        c = courseFlags(x, y, px, py);
        if (z === QT_ZONE.Scriptorium) c = dryInk(x, y, px, py) ?? c;
      }
      c = page(px, py, z === QT_ZONE.Scriptorium ? 0.06 : 0.015, 6171) ?? c;
      c = dust(x, y, px, py, wd, z === QT_ZONE.Fogged ? 0.6 : 1) ?? c;
      c = toWall(c, x, y, wd, 6172);
      const fog = (z === QT_ZONE.Fogged ? 0.75 : 0.08 * cl01(1 - wd / 0.8)) + (land.fog ? land.fog(x, y) : 0);
      return fogOver(c, x, y, px, py, Math.min(1, fog));
    },
    face: (shade, v, px, py, x, y) => wallFace(roomOf(shade, x, y), shade, v, px, py),
    top: (x, y, px, py, back) => wallTop(px, py, back, zoneAt(Math.floor(x), Math.floor(y)) === QT_ZONE.Fogged),
    nearFace: (v, px, py, x, y) => mixc(wallFace(nearRoom(x, y), -1, v, px, py), QT_DEEP, 0.45),
    brow: (c) => mixc(c, QT_STONE[0][0], 0.3),
    foot: [0.45, 0.25],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.32, 0.2] },
  });
}

/** THE TOWER'S INSIDE: its ground for a floor. */
export function quietTowerTerrain(floor: Floor, land: Omit<QuietLand, 'floor'> = {}): Terrain {
  return terrainOf(floor, quietTowerLook({ ...land, floor }));
}

// ---------------------------------------------------------------------------------------------------
// THE TOWER TOP

/** Is picture column `px` an embrasure (a gap between merlons) of the parapet? */
export function embrasure(px: number): boolean {
  return mod(px, CRENEL) >= MERLON;
}

/** What the parapet's face gives where the fog is seen through an embrasure: `paintQuietTower` paints the fog sea there (a colour of its own, nowhere else in the ground). */
const SEE_THROUGH: RGB = [3, 3, 3];
/** THE PARAPET'S INNER FACE: small courses of the stone; in an embrasure, the sill's lit top over its face, and the fog seen through it. */
function parapetFace(shade: number, v: number, px: number): RGB {
  const row = rowOf(shade);
  const S = QT_STONE[row];
  if (v < 2) return S[3];
  if (embrasure(px)) {
    // (the sill's top, seen from above a parapet's thickness deep; past it, through the gap, the fog: `paintQuietTower` paints it)
    if (v >= SILL_H + 9) return SEE_THROUGH;
    if (v >= SILL_H) return v < SILL_H + 2 ? QT_BONE[2] : QT_BONE[mod(px, CRENEL) === MERLON ? 2 : 1];
    if (v >= SILL_H - 2) return S[0];
  } else {
    const m = mod(px, CRENEL);
    // the merlon's own lit left edge, its right in shade
    if (m < 2) return v > SILL_H - 2 ? S[0] : ashlar(v, px, row, 9);
    if (m >= MERLON - 2 && v > SILL_H - 2) return S[3];
    if (v >= PARAPET_H - 2) return S[0];
  }
  return ashlar(v, px, row, 9);
}

/** THE PARAPET'S COPING, seen from above (and the near parapet, cut down to it): the merlons' tops bone white, the embrasures' sills a step down. */
function coping(px: number, py: number, back: number): RGB {
  const m = mod(px, CRENEL);
  const merlon = m < MERLON;
  void back;
  if (merlon) {
    if (m < 2) return QT_BONE[2];
    if (m >= MERLON - 2) return QT_STONE[1][3];
    return hash(px >> 1, py, 6231) < 0.12 ? QT_BONE[0] : QT_BONE[1];
  }
  if (m === MERLON || m === MERLON + 1) return QT_STONE[2][3];
  return hash(px >> 1, py, 6232) < 0.15 ? QT_STONE[0][1] : QT_STONE[0][0];
}

/**
 * THE TOWER'S OUTER WALL, hanging under the near parapet over the drop, `v` picture pixels down from its lip: the coping's
 * outer edge; a corbel table (stone brackets carrying the parapet out, the dark between them); the wall in courses, a
 * string course; its stone lost in the fog as it goes down.
 */
function outerWall(v: number, px: number, py: number, shade: number): RGB {
  const row = rowOf(shade);
  const S = QT_STONE[row];
  let c: RGB;
  if (v < 3) c = v === 0 ? QT_BONE[1] : S[3];
  else if (v < 15) {
    // the corbels: each a bracket three courses deep, narrowing down, the dark of the drop's shadow between them
    const m = mod(px, 20);
    const k = v - 3;
    const half = 6 - Math.floor(k / 4) * 1.5;
    const d = Math.abs(m - 10);
    c = d < half ? (d < 1 || k % 4 === 0 ? S[0] : m < 10 ? S[1] : S[2]) : QT_STONE[2][3];
  } else if (v < 18) c = v === 15 ? S[3] : S[0];
  else c = ashlar(v - 18, px, row, 14);
  // (lost in the fog as it goes down: the fog's own colour taking it, in bands, crisp; sooner where the wall is seen edge on)
  const t = cl01((v - 50) / (OUTER_H - 50) + Math.max(0, Math.abs(shade) - 0.6) * 2.5 * cl01((v - 18) / 20));
  if (t > 0) {
    const f = fogSea(px, py);
    const k = t + 0.18 * (vnoise(px / 14, py / 6, 6241) - 0.5);
    if (over(k, 0.72, px, py, 0.03)) return f;
    if (over(k, 0.38, px, py, 0.03)) return mixc(c, f, 0.55);
    return mixc(c, f, 0.2 * t);
  }
  return c;
}

/**
 * THE FOG SEA, far below the tower's top, at a picture pixel: heaps of fog drawn out along the picture, lit on their
 * slopes to the upper left, in shade on the others, here and there a darker trough.
 */
export function fogSea(px: number, py: number): RGB {
  const R = QT_FOG;
  // (the fog's height: rolling heaps, drawn out along the picture)
  const hAt = (x: number, y: number): number => fbm(x / 170 + 40, y / 52, 6251) + 0.2 * (vnoise(x / 46, y / 16, 6252) - 0.5);
  const h = hAt(px, py);
  const lit = (hAt(px + 1.5, py) - hAt(px - 1.5, py)) * 0.8 + (hAt(px, py + 1.5) - hAt(px, py - 1.5)) * 1.4;
  const v = (h - 0.32) * 2.6 + lit * 22;
  let c: RGB;
  if (h < 0.24) c = R[0];
  else c = R[over(v, 1.6, px, py, 0.12) ? 4 : over(v, 0.75, px, py, 0.12) ? 3 : over(v, -0.1, px, py, 0.12) ? 2 : 1];
  return c;
}

/** THE TOWER TOP'S LOOK: its flags in rings round `centre`, the parapet, the drop (the fog sea, painted by `paintQuietTower`). */
export function towerTopLook(land: TopLand): TerrainLook {
  const f = land.floor;
  const [cx, cy] = land.centre;
  const isFloor = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR;
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty));
  const drop = land.drop ?? ((tx: number, ty: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (isFloor(tx + dx, ty + dy)) return false;
    return true;
  });
  return quietTerrain({
    rise: PARAPET_H,
    near: 30,
    round: 0.22,
    rag: 0.03,
    fine: 0.01,
    seed: 202,
    floor: (x, y, px, py) => {
      const wd = wall(x, y);
      let c = ringFlags(x, y, cx, cy, px, py);
      c = page(px, py, 0.012, 6181) ?? c;
      c = dust(x, y, px, py, wd, 1) ?? c;
      const fog = land.fog ? land.fog(x, y) : 0.12 + 0.5 * cl01(1 - wd / 1.4);
      return fogOver(c, x, y, px, py, fog);
    },
    face: (shade, v, px) => parapetFace(shade, v, px),
    top: (_x, _y, px, py, back) => coping(px, py, back),
    nearFace: (v, px) => mixc(parapetFace(-1, v, px), QT_DEEP, 0.4),
    brow: (c) => mixc(c, QT_BONE[2], 0.4),
    foot: [0.4, 0.22],
    turnOver: 0.25,
    nearShadow: { reach: 0.6, dark: [0.26, 0.14] },
    drop,
    lip: () => QT_BONE[1],
    hang: { tall: OUTER_H, at: (v, px, py, shade) => outerWall(v, px, py, shade) },
  });
}

/** THE TOWER TOP: its ground for a floor. */
export function towerTopTerrain(floor: Floor, land: Omit<TopLand, 'floor'>): Terrain {
  return terrainOf(floor, towerTopLook({ ...land, floor }));
}

// ---------------------------------------------------------------------------------------------------
// PAINTING IT

/**
 * PAINT A PIECE OF THE QUIET TOWER'S GROUND (the inside's or the top's) as `paintTerrain` does (picture pixels from (x0, y0),
 * w by h): on the top, the fog sea painted into the drop and seen through the parapet's embrasures. Every pixel opaque. Two
 * pieces side by side are one picture.
 */
export function paintQuietTower(T: Terrain, x0: number, y0: number, w: number, h: number): TerrainPiece {
  const p = paintTerrain(T, x0, y0, w, h);
  const top = T.look.rise === PARAPET_H;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      const k = p.kind[i];
      const px = x0 + c;
      const py = y0 + r;
      let col: RGB | null = null;
      if (k === TK.Drop) col = fogSea(px, py);
      else if (top && ((k === TK.Top && embrasure(px)) || (k === TK.Face && p.rgba[i * 4] === SEE_THROUGH[0] && p.rgba[i * 4 + 1] === SEE_THROUGH[1] && p.rgba[i * 4 + 2] === SEE_THROUGH[2]))) {
        // (through an embrasure, past its sill: the fog sea)
        col = fogSea(px, py);
      }
      if (!col) continue;
      const q = quietRGB(col);
      p.rgba[i * 4] = q[0];
      p.rgba[i * 4 + 1] = q[1];
      p.rgba[i * 4 + 2] = q[2];
      p.rgba[i * 4 + 3] = 255;
    }
  }
  return p;
}
