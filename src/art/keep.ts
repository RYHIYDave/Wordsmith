// FLOOR 19, THE KEEP: ITS GROUND (art/terrain.ts paints it from the level's own tiles). ACT 2, PART TWO, THE HIGH CITY.
// A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat; his "Yes, go
// (Recommended)"), level 19: "Level 19: The Keep. The old castle at the hill's crown, where the king lies dying."; its
// layout "walls and towers: battlements, a gatehouse, the barracks and the armoury, the throne hall, and the king's
// bedchamber at the top of the keep."; its hazards "murder holes that drop pitch, and portcullises that slam down to cut
// a hall in two."; its palette "Cold stone, royal blue, old gold."; its boss the King, "His floor is the Throne Hall."
// Its story from Andersen's "The Nightingale" (1843), drawn only from the book. Its first look, painted
// (src/dev/keep_paint.ts), is the art chat's to show him.
//
// WHAT IT IS, at night, the moon over the walls, torchlight within (the torches and braziers are pieces, art/floor19.ts):
// - THE FLOOR, room by room (`KP_ZONE`): the bailey's setts, puddles holding the moon, straw blown about; the wall walk's
//   flags, wet, lichen in their joints; the gate passage's setts, worn smooth; the halls' great flags of cold stone; the
//   throne hall's flags in a chequer of grey and slate, a border of slate along its walls; the barracks' flags strewn
//   with rushes; the armoury's flags stained with oil, iron filings and rivets about; the king's bedchamber's dark oak
//   boards.
// - THE WALLS: ashlar of the cold stone in courses, room by room. Indoors (halls, the gate passage, the armoury) a plinth
//   course along the foot and a string course above, soot, damp, a crack, an iron ring; in the throne hall a stone dado
//   with a gilt band, the plaster over it painted royal blue and powdered with old gold stars, flaking; in the barracks
//   rough rubble limewashed and grimed, a row of pegs, a soldier's tallies scratched in it; in the bedchamber an oak
//   wainscot and hangings of royal blue over it, an old gold border. Indoors the wall's top fades up into the dark.
// - OPEN TO THE SKY (the bailey and the wall walks): the bailey's walls are the curtain's inner face, arrow slits in it,
//   merlons along its top against the night sky; the wall walk's walls are its parapet, waist high, merlons on it, and
//   the night sky over them, stars in it. The tops past them are the sky; indoors, the dark.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own
// palette (Colour 1: the doc's cold stone, royal blue and old gold, after the gardens' dawn); a step quieter than the
// figures (Places 2) and duller than any word's colour (Colour 4: every colour through art/act2_quiet.ts); its dark cool
// and deep (Colour 2); NOTHING GLOWS (Colour 3: the fires are the pieces'; the old gold is gilt and thread, dull; the
// moon a light on things); no cyan (the royal blue held to a true blue, hue 220 and more), no pink; solid, not flat
// (Places 4); old and broken (Places 6); crisp pixels.
//
// FOR THE MAIN CHAT: `keepLook(land)` makes the look for a level from what only the level knows: its floor, and what
// each walkable tile is (KP_ZONE). `keepTerrain(floor, land)` makes its ground; `paintKeepGround(T, x0, y0, w, h)`
// paints a piece of it, as `paintTerrain` does (every pixel opaque: there is no drop). Two pieces side by side are one
// picture. Edges straight, as walls are.

import type { Floor } from '../game/types';
import { T_FLOOR } from '../game/types';
import { fbm, paintTerrain, terrainOf, vnoise } from './terrain';
import type { RGB, Terrain, TerrainLook, TerrainPiece } from './terrain';
import { hash } from './kit';
import { quietRGB, quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const ck = (k: number): number => Math.max(0, Math.min(4, Math.round(k)));

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: cold stone, royal blue, old gold; the night

/** The deep, cool dark under everything. */
export const KP_DEEP: RGB = hex('#07080d');
/** THE COLD STONE, a grey with blue in it: the joint, shade, body, light, lit edge (the flags, the setts, the ashlar). */
export const KP_STONE = ['#181b25', '#2b3040', '#384052', '#454e62', '#5a6479'].map(hex);
/** Slate, the throne hall's dark flags. */
export const KP_SLATE = ['#12141d', '#1f2333', '#282d40', '#31374c', '#3f465d'].map(hex);
/** THE ASHLAR of the walls, by how a face is turned (lit, at the eye, in shade): its joint, its dark block, body, light block, its lit arris. */
export const KP_ASHLAR = [
  ['#1b1e2a', '#3a4255', '#444d61', '#4f586d', '#626c82'],
  ['#181b26', '#323a4c', '#3b4357', '#454e63', '#566076'],
  ['#14161f', '#262c3b', '#2e3546', '#363e51', '#454e63'],
].map((r) => r.map(hex));
/** ROYAL BLUE, the throne hall's painted walls, the bedchamber's hangings (never the friend's cyan: hue 220 and more): deep, shade, body, light. */
export const KP_ROYAL = ['#141a33', '#1e2647', '#28325a', '#33406e'].map(hex);
/** OLD GOLD, gilt and thread, dull: shade, body, light. */
export const KP_GOLD = ['#56462a', '#75603a', '#94794a'].map(hex);
/** Oak, the bedchamber's boards and wainscot: the gap, shade, body, body, lit. */
export const KP_OAK = ['#16110f', '#2a201b', '#372a22', '#43332a', '#55412f'].map(hex);
/** Rushes strewn on the barracks' floor, and straw in the bailey: shade, body, light. */
export const KP_RUSH = ['#4a4230', '#655a3e', '#82744e'].map(hex);
/** Limewash on rubble, the barracks', cold and grimy: by how the face is turned, its light, body, mottle. */
export const KP_WASH = [
  ['#6d717e', '#626674', '#565a68'],
  ['#5d6170', '#535766', '#494d5b'],
  ['#3d404c', '#363944', '#2f323c'],
].map((r) => r.map(hex));
/** Lichen in the wall walk's joints, a dull grey-green. */
export const KP_LICHEN = hex('#3e4638');
/** Oil, black, its sheen; iron filings and rivets. */
export const KP_OIL = ['#101117', '#22242e'].map(hex);
export const KP_IRON = ['#1c1e25', '#3a3e4a', '#5c6170'].map(hex);
/** A puddle holding the moon. */
export const KP_PUDDLE = ['#232a40', '#36405c', '#6b7390'].map(hex);
/** THE NIGHT SKY over the open walls: its dark, a cloud, its stars. */
export const KP_SKY = ['#08090e', '#0c0e16', '#11141f', '#171b2a'].map(hex);
export const KP_STAR = ['#5f6680', '#9aa0b6'].map(hex);

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile is (and so how its floor and the walls round it look). */
export const KP_ZONE = {
  /** The bailey, open to the sky: setts; the curtain's inner face round it, arrow slits, merlons against the sky. */
  Bailey: 0,
  /** A wall walk on the battlements, open to the sky: wet flags; its walls a parapet with merlons, the sky over it. */
  Walk: 1,
  /** The gate passage under the gatehouse: setts worn smooth; ashlar, an iron ring. */
  Gate: 2,
  /** A hall or a stair or a way between rooms: great flags; ashlar, a plinth and a string course. */
  Hall: 3,
  /** The throne hall (the King's floor): a chequer of grey and slate; a stone dado, royal blue plaster powdered with gold stars. */
  Throne: 4,
  /** The barracks: flags strewn with rushes; limewashed rubble, pegs, tallies. */
  Barracks: 5,
  /** The armoury: flags stained with oil, filings and rivets; ashlar, soot. */
  Armoury: 6,
  /** The king's bedchamber at the top of the keep: oak boards; an oak wainscot, hangings of royal blue. */
  Chamber: 7,
} as const;
/** The zones open to the sky. */
const OPEN = new Set<number>([KP_ZONE.Bailey, KP_ZONE.Walk]);

export interface KeepLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** What a walkable tile is (KP_ZONE); a hall where not said. */
  zone?: (tx: number, ty: number) => number;
}

/** How tall the walls stand over the floor (picture pixels); where indoors they begin to fade into the dark. */
export const KP_RISE = 96;
export const KP_FADE = 66;
/** The wall walk's parapet, and its merlons' tops; the bailey's merlons begin. */
export const KP_PARAPET = 30;
export const KP_MERLON = 46;
export const KP_CURTAIN = 78;

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
// THE FLOOR

/** Flags in rows along x, each its own length and tone; worn paler down the middle of a way, dark in toward the walls. */
function flags(x: number, y: number, px: number, py: number, wall: number, R: readonly RGB[], seed: number, rowW = 40, len0 = 52): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const j = Math.floor(V / rowW);
  const len = len0 + Math.floor(hash(j, 0, seed) * 3) * 10;
  const off = Math.floor(hash(j, 1, seed) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const v = mod(V, rowW);
  const h0 = hash(i, j, seed + 1);
  let t = h0 > 0.72 ? 3 : h0 < 0.22 ? 1.6 : 2;
  if (wall > 1.3 && vnoise(x * 0.45, y * 0.45, seed + 2) > 0.55) t += 1;
  if (u < 2 || v < 2) return R[0];
  let c = R[ck(t)];
  // the arris toward the light lit, the far one dark
  if (u < 3.5 || v < 3.5) c = R[ck(t + 1)];
  else if (u >= len - 2 || v >= rowW - 2) c = R[1];
  // a crack across a flag; a flag broken, its pieces sunk
  if (h0 > 0.9 && Math.abs(u - v * 0.8 - 6 - h0 * 20) < 1) c = R[0];
  if (h0 < 0.03 && u + v > rowW) c = R[hash(px >> 1, py >> 1, seed + 3) < 0.5 ? 1 : 0];
  if (wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, seed + 4)) c = mixc(c, KP_DEEP, 0.3);
  return c;
}
/** Setts: small dressed blocks in rows broken joint, each a little domed (its upper left lit), worn smooth. */
function setts(x: number, y: number, px: number, py: number, wall: number, seed: number): RGB {
  const R = KP_STONE;
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 18;
  const j = Math.floor(V / S);
  const off = (j & 1) * 9;
  const i = Math.floor((U + off) / S);
  const u = mod(U + off, S);
  const v = mod(V, S);
  if (u < 1.6 || v < 1.6) return R[0];
  const h0 = hash(i, j, seed);
  let t = h0 > 0.75 ? 3 : h0 < 0.2 ? 1 : 2;
  if (u < 3.2 || v < 3.2) t += 1;
  else if (u > S - 2.5 || v > S - 2.5) t -= 0.6;
  if (wall > 1.5 && vnoise(x * 0.5, y * 0.5, seed + 1) > 0.6) t += 0.6;
  let c = R[ck(t)];
  if (wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, seed + 2)) c = mixc(c, KP_DEEP, 0.3);
  return c;
}
/** THE BAILEY: setts; puddles holding the moon; wisps of straw blown about. */
function bailey(x: number, y: number, px: number, py: number, wall: number): RGB {
  const p = fbm(x * 0.5, y * 0.5, 1951);
  if (p > 0.7 && wall > 0.6) {
    // a puddle: the night's dark in it, the moon's pale caught in a streak, a lip of wet setts round it
    if (p < 0.715) return KP_STONE[1];
    const streak = mod(alongX(px, py) * 0.5 - alongY(px, py) * 0.2 + 7 * vnoise(x * 3, y * 3, 1952), 23) < 2.2;
    return streak ? KP_PUDDLE[2] : p > 0.76 ? KP_PUDDLE[0] : KP_PUDDLE[1];
  }
  const st = straw(px, py, x, y, 1953, 0.004);
  if (st) return st;
  return setts(x, y, px, py, wall, 1955);
}
/** A wisp of straw or a rush: a short bent stroke, lit along its top. Null where none. */
function straw(px: number, py: number, x: number, y: number, seed: number, much: number): RGB | null {
  const drift = vnoise(x * 0.6, y * 0.6, seed) > 0.5 ? 1 : 0.25;
  const cx = Math.floor(px / 9);
  const cy = Math.floor(py / 5);
  for (let a = -1; a <= 0; a++) {
    for (let b = -1; b <= 0; b++) {
      const gx = cx + a;
      const gy = cy + b;
      if (hash(gx, gy, seed + 1) > much * drift * 60) continue;
      const ax = gx * 9 + Math.floor(hash(gx, gy, seed + 2) * 9);
      const ay = gy * 5 + Math.floor(hash(gx, gy, seed + 3) * 5);
      const len = 6 + Math.floor(hash(gx, gy, seed + 4) * 7);
      const dir = hash(gx, gy, seed + 5) < 0.5 ? 1 : -1;
      const dx = (px - ax) * dir;
      if (dx < 0 || dx >= len) continue;
      const yy = ay + Math.floor(dx / (2 + Math.floor(hash(gx, gy, seed + 6) * 3)));
      if (py === yy) return KP_RUSH[dx < 2 ? 2 : 1];
      if (py === yy + 1 && dx > 1) return KP_RUSH[0];
    }
  }
  return null;
}
/** THE WALL WALK: flags, wet, a sheen on them, grey-green lichen in their joints. */
function walk(x: number, y: number, px: number, py: number, wall: number): RGB {
  const c = flags(x, y, px, py, wall, KP_STONE, 1961, 32, 44);
  if (c === KP_STONE[0] && vnoise(x * 1.6, y * 1.6, 1962) > 0.5) return KP_LICHEN;
  // the wet: a pale streak here and there, where the moon catches it
  if (vnoise(x * 0.8, y * 0.8, 1963) > 0.66 && hash(px >> 1, py, 1964) < 0.06 && c !== KP_STONE[0]) return KP_STONE[4];
  return c;
}
/** THE THRONE HALL: square flags in a chequer of grey and slate, a border of slate along its walls, worn, cracked. */
function chequer(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 32;
  const i = Math.floor(U / S);
  const j = Math.floor(V / S);
  const u = mod(U, S);
  const v = mod(V, S);
  const border = wall < 0.55;
  const R = border || (i + j) & 1 ? KP_SLATE : KP_STONE;
  if (u < 1.6 || v < 1.6) return KP_STONE[0];
  const h0 = hash(i, j, 1971);
  let t = h0 > 0.8 ? 3 : h0 < 0.2 ? 1.6 : 2;
  if (u < 3.5 || v < 3.5) t += 1;
  else if (u > S - 2.5 || v > S - 2.5) t = 1;
  // worn paler where the court walked
  if (wall > 2 && vnoise(x * 0.4, y * 0.4, 1972) > 0.6) t += 0.6;
  let c = R[ck(t)];
  if (h0 > 0.92 && Math.abs(u - v * 0.7 - 4 - h0 * 9) < 0.9) c = KP_STONE[0];
  if (wall < 0.3 + 0.12 * vnoise(x * 2.2, y * 2.2, 1973)) c = mixc(c, KP_DEEP, 0.3);
  return c;
}
/** THE BARRACKS: flags strewn thick with rushes, trodden, a bare patch where the men stood. */
function barracks(x: number, y: number, px: number, py: number, wall: number): RGB {
  const st = straw(px, py, x, y, 1981, 0.03 + 0.03 * cl01(1.6 - wall));
  if (st) return st;
  const c = flags(x, y, px, py, wall, KP_STONE, 1983);
  // (the rushes' dust over the flags between)
  return vnoise(x * 1.2, y * 1.2, 1985) > 0.5 ? mixc(c, KP_RUSH[0], 0.18) : c;
}
/** THE ARMOURY: flags stained black with oil, iron filings and a rivet or two about. */
function armoury(x: number, y: number, px: number, py: number, wall: number): RGB {
  const o = fbm(x * 0.7, y * 0.7, 1991) + 0.3 * (vnoise(x * 3, y * 3, 1992) - 0.5);
  if (o > 0.74) {
    const under = flags(x, y, px, py, wall, KP_STONE, 1997);
    return o > 0.77 && mod(alongX(px, py) - alongY(px, py), 23) < 1.5 ? mixc(under, KP_OIL[1], 0.5) : mixc(under, KP_OIL[0], 0.62);
  }
  // filings: specks, a pixel each, lit or dark
  const g = hash(px, py, 1993);
  if (g > 0.985 && vnoise(x * 1.4, y * 1.4, 1994) > 0.5) return KP_IRON[g > 0.993 ? 2 : 1];
  // a rivet: a dark round, its top lit
  const rx = Math.floor(px / 13);
  const ry = Math.floor(py / 7);
  if (hash(rx, ry, 1995) < 0.012) {
    const ax = rx * 13 + 6;
    const ay = ry * 7 + 3;
    if (py === ay && (px === ax || px === ax + 1)) return KP_IRON[2];
    if (py === ay + 1 && (px === ax || px === ax + 1)) return KP_IRON[0];
  }
  return flags(x, y, px, py, wall, KP_STONE, 1997);
}
/** THE BEDCHAMBER: dark oak boards along x, polished once, a sheen along a board here and there, worn by the bed. */
function boards(x: number, y: number, px: number, py: number, wall: number): RGB {
  const R = KP_OAK;
  const U = alongX(px, py);
  const V = alongY(px, py);
  const BW = 16;
  const j = Math.floor(V / BW);
  const v = mod(V, BW);
  const len = 96 + Math.floor(hash(j, 0, 2001) * 4) * 32;
  const off = Math.floor(hash(j, 1, 2001) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const h0 = hash(i, j, 2002);
  let t = h0 > 0.72 ? 3 : h0 < 0.22 ? 1 : 2;
  if (v < 2 || u < 2) return R[0];
  if (v < 4) t += 1;
  // the polish: a long pale line along a board now and then
  if (h0 > 0.6 && Math.abs(v - 9) < 1 && mod(U + h0 * 90, 70) < 30) t = 4;
  let c = R[ck(t)];
  if (wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, 2003)) c = mixc(c, KP_DEEP, 0.3);
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE WALLS

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);

/** Ashlar in courses `ch` high, blocks of their own lengths broken joint, `px` along the face and `v` up it: its colour in a face's row. */
function ashlar(px: number, v: number, row: number, seed: number, ch = 14): RGB {
  const A = KP_ASHLAR[row];
  const course = Math.floor(v / ch);
  const len = 40 + Math.floor(hash(course, 1, seed) * 3) * 12;
  const off = Math.floor(hash(course, 0, seed) * len);
  const u = mod(px + off, len);
  const jv = v - course * ch;
  if (jv < 1 || u < 1) return A[0];
  const b = Math.floor((px + off) / len);
  const h = hash(b, course, seed + 2);
  let k = h < 0.18 ? 1 : h > 0.84 ? 3 : 2;
  // its top arris catches the light; a pit or two in its face
  if (jv >= ch - 1) k = 4;
  if (hash(px >> 1, v >> 1, seed + 3) < 0.04) k = Math.max(1, k - 1);
  return A[k];
}

/** What is on a stretch of wall, one to every 128 picture pixels or so, steady from run to run. */
interface Bay {
  key: number;
  u: number;
  /** 0 bare, 1 an opening (a window indoors, an arrow slit in the open), 2 a crack, 3 a damp stain, 4 an iron ring, 5 soot. */
  kind: number;
}
function bayAt(px: number): Bay {
  const SPAN = 128;
  const k = Math.floor(px / SPAN);
  const h = hash(k, 0, 2011);
  const kind = h < 0.22 ? 1 : h < 0.36 ? 2 : h < 0.5 ? 3 : h < 0.6 ? 4 : h < 0.72 ? 5 : 0;
  return { key: k, u: px - k * SPAN, kind };
}
/** THE NIGHT SKY at a picture pixel (over the open walls): dark, long faint clouds, a star here and there. */
function sky(px: number, py: number): RGB {
  const c = vnoise(px / 260, py / 22, 2021) + 0.2 * vnoise(px / 60, py / 7, 2022);
  let s = c > 1.02 ? KP_SKY[3] : c > 0.9 ? KP_SKY[2] : KP_SKY[1];
  const st = hash(px, py, 2023);
  if (st > 0.9985 && c < 0.9) s = st > 0.9996 ? KP_STAR[1] : KP_STAR[0];
  return s;
}
/** An arrow slit in a face: a tall narrow slit, its splayed reveal lit on one side; `cu` its middle along the bay. */
function slit(u: number, v: number, cu: number, low: number, high: number, row: number, open: boolean, px: number, py: number): RGB | null {
  const du = u - cu;
  if (v < low - 3 || v > high + 3 || Math.abs(du) > 6) return null;
  const A = KP_ASHLAR[row];
  // the splay, wide at the face and narrowing in
  const inS = Math.abs(du) <= 5 && v >= low && v <= high;
  if (!inS) return v < low ? A[4] : A[1];
  if (Math.abs(du) <= 1) return open ? sky(px, py) : KP_DEEP;
  return du < 0 ? A[3] : A[0];
}

/** INDOORS: ashlar, a plinth course, a string course; what is on the bay; fading into the dark above. */
function indoorFace(zone: number, shade: number, v: number, px: number, py: number): RGB {
  const row = rowOf(shade + (hash(Math.floor(px / 128), 9, 2031) - 0.5) * 0.1);
  const A = KP_ASHLAR[row];
  const bay = bayAt(px);
  const u = bay.u;
  const fade = (c: RGB): RGB => (v > KP_FADE ? mixc(c, KP_DEEP, 0.2 + 0.75 * cl01((v - KP_FADE) / (KP_RISE - KP_FADE))) : c);
  let c: RGB;
  if (zone === KP_ZONE.Throne) c = throneWall(v, px, row, bay);
  else if (zone === KP_ZONE.Barracks) c = barracksWall(v, px, row, bay);
  else if (zone === KP_ZONE.Chamber) c = chamberWall(v, px, row);
  else {
    c = ashlar(px, v, row, zone === KP_ZONE.Armoury ? 2033 : 2035);
    // the plinth along the foot, its weathered top lit; a string course along it higher up
    if (v < 9) c = v >= 7 ? A[4] : v < 1 ? A[0] : A[1];
    else if (v >= 48 && v < 52) c = v === 51 ? A[4] : v === 48 ? A[0] : A[2];
    // the gate passage: an iron ring set in the wall, to tether a horse; the hall and the armoury: a tall window
    if (bay.kind === 1 && zone !== KP_ZONE.Gate) {
      const cu = 40 + Math.floor(hash(bay.key, 1, 2037) * 48);
      const w = slit(u, v, cu, 20, 46, row, true, px, py);
      if (w) c = w;
    }
    if (bay.kind === 4) {
      const cu = 30 + Math.floor(hash(bay.key, 2, 2037) * 60);
      const d = Math.hypot(u - cu, (v - 30) * 1.2);
      if (d > 3 && d < 5.2) c = v > 30 || u < cu ? KP_IRON[2] : KP_IRON[0];
      else if (Math.abs(u - cu) < 1.5 && v > 33 && v < 37) c = KP_IRON[1];
    }
  }
  // a crack running down, forking; a damp stain spreading up from the foot; soot from an old torch
  if (bay.kind === 2) {
    const x0 = 30 + hash(bay.key, 3, 2037) * 60;
    const cu = x0 + 7 * Math.sin(v * 0.12 + bay.key) + 3 * vnoise(v * 0.4, bay.key, 2038);
    if (v > 14 && v < 62 && Math.abs(u - cu) < 0.7) c = A[0];
  } else if (bay.kind === 3) {
    const cx = 40 + hash(bay.key, 4, 2037) * 48;
    const w = 20 + 8 * vnoise(px * 0.1, v * 0.1, 2039) - v * 0.3;
    if (Math.abs(u - cx) < w && v < 30) c = mixc(c, KP_DEEP, Math.abs(u - cx) > w - 1.5 ? 0.35 : 0.2);
  } else if (bay.kind === 5) {
    const cx = 40 + hash(bay.key, 5, 2037) * 48;
    const w = 6 + (v - 40) * 0.25 + 3 * vnoise(px * 0.2, v * 0.1, 2040);
    if (v > 40 && Math.abs(u - cx) < w && hash(px >> 1, v >> 1, 2041) < 0.75) c = mixc(c, KP_DEEP, 0.45);
  }
  return fade(c);
}
/** THE THRONE HALL'S WALLS: a dado of dressed stone to 30, a gilt band; over it plaster painted royal blue, a powdering of old gold stars, a painted border of gold lozenges; flaking to the stone. */
function throneWall(v: number, px: number, row: number, bay: Bay): RGB {
  const A = KP_ASHLAR[row];
  if (v < 30) {
    if (v < 9) return v >= 7 ? A[4] : v < 1 ? A[0] : A[1];
    return ashlar(px, v, row, 2051, 10.5);
  }
  if (v < 33) return KP_GOLD[v === 32 ? (row === 2 ? 1 : 2) : row === 2 ? 0 : 1];
  if (v === 33) return KP_ROYAL[0];
  // flaking: the plaster gone to the stone in ragged patches
  const flake = vnoise(px * 0.08, v * 0.1, 2052) + 0.35 * vnoise(px * 0.3, v * 0.3, 2053);
  if (flake > 1.02) return ashlar(px, v, row, 2055);
  if (flake > 0.99) return A[1];
  const R = KP_ROYAL;
  const base = row === 0 ? 2 : row === 1 ? 1.6 : 1;
  // the painted border high up: gold lozenges on the blue between gold lines
  if (v >= 58 && v < 66) {
    if (v === 58 || v === 65) return KP_GOLD[row === 2 ? 0 : 1];
    const lu = mod(px, 16);
    if (Math.abs(lu - 8) + Math.abs(v - 61.5) * 1.6 < 5) return KP_GOLD[row === 0 ? 2 : row === 1 ? 1 : 0];
    return R[ck(base - 0.6)];
  }
  // the powdering of stars: small, five-pointed at this size a cross with a dot, in a lattice
  const su = mod(px + (Math.floor(v / 12) & 1) * 10, 20);
  const sv = mod(v, 12);
  if ((Math.abs(su - 10) < 0.6 && Math.abs(sv - 6) < 2.4) || (Math.abs(sv - 6) < 0.6 && Math.abs(su - 10) < 2.4)) return KP_GOLD[row === 0 ? 1 : 0];
  void bay;
  return R[ck(base + (vnoise(px * 0.06, v * 0.08, 2056) > 0.65 ? 0.6 : 0))];
}
/** THE BARRACKS' WALLS: rubble limewashed, cold, grimed low; a row of pegs; a soldier's tallies scratched by his bunk. */
function barracksWall(v: number, px: number, row: number, bay: Bay): RGB {
  const W = KP_WASH[row];
  // rubble under the wash: its stones' shapes faint in it
  const cj = Math.floor(v / 9);
  const g = 14 + Math.floor(hash(cj, 0, 2061) * 3) * 4;
  const off = hash(cj, 1, 2061) * g;
  const joint = mod(px + off, g) < 1.2 || mod(v, 9) < 1;
  const m = vnoise(px * 0.1, v * 0.12, 2062);
  let c = joint ? W[2] : m > 0.6 ? W[0] : W[1];
  // the pegs along it at shoulder height: oak, their tops lit
  if (v >= 44 && v < 48 && mod(px, 24) < 3) return v === 47 ? KP_OAK[4] : KP_OAK[2];
  if (v === 43 && mod(px, 24) < 3) return KP_OAK[0];
  // tallies scratched, in fives
  if (bay.kind === 2 && v > 24 && v < 34) {
    const tu = bay.u - 40;
    if (tu >= 0 && tu < 40) {
      const grp = Math.floor(tu / 8);
      const k = mod(tu, 8);
      if (grp < 3 + (bay.key % 2) && ((k % 2 === 0 && k < 8) || Math.abs(v - 29 - (k - 4) * 0.8) < 0.7)) return KP_WASH[2][2];
    }
  }
  // grimed low, where the men leaned and the bunks knocked
  if (v < 22) c = mixc(c, KP_DEEP, 0.3 * (1 - v / 22));
  if (v < 3) c = KP_ASHLAR[row][1];
  return c;
}
/** THE BEDCHAMBER'S WALLS: an oak wainscot of sunk panels to 34; over it hangings of royal blue in folds, an old gold fringe at their foot and a border at their head. */
function chamberWall(v: number, px: number, row: number): RGB {
  const O = KP_OAK;
  const TOP = 34;
  if (v < TOP) {
    if (v >= TOP - 3) return v === TOP - 1 ? O[4] : O[row === 2 ? 1 : 3];
    if (v < 4) return v === 3 ? O[3] : O[1];
    const pu = mod(px, 28);
    if (pu < 3) return pu === 0 ? O[row === 2 ? 1 : 4] : O[row === 2 ? 1 : 3];
    if (pu === 3 || v === 4) return O[1];
    if (pu === 27 || v === TOP - 4) return O[row === 0 ? 4 : 3];
    return O[row === 2 ? 1 : row === 1 ? 2 : 3];
  }
  // the fringe at the hangings' foot, gold
  if (v < 37) return mod(px, 3) === 0 ? KP_ROYAL[0] : KP_GOLD[row === 2 ? 0 : 1];
  // the border at their head
  if (v >= 60 && v < 64) return v === 60 || v === 63 ? KP_GOLD[row === 2 ? 0 : 1] : KP_ROYAL[0];
  // the folds: long, upright, lit on their left
  const f = mod(px, 18);
  const k = f < 3 ? 3 : f < 9 ? 2 : f < 15 ? 1.4 : 0.6;
  const base = row === 0 ? 0.2 : row === 1 ? -0.2 : -0.8;
  return KP_ROYAL[ck(k + base)];
}

/** OPEN TO THE SKY: the bailey's curtain wall (arrow slits, merlons along its top against the sky), or the wall walk's parapet (merlons on it, the sky over it). */
function openFace(zone: number, shade: number, v: number, px: number, py: number): RGB {
  if (zone === KP_ZONE.Walk) return sky(px, py);
  const row = rowOf(shade);
  const A = KP_ASHLAR[row];
  const walkWall = zone === KP_ZONE.Walk;
  const top = walkWall ? KP_PARAPET : KP_CURTAIN;
  const merlonTop = walkWall ? KP_MERLON : KP_RISE - 2;
  const pitch = walkWall ? 34 : 40;
  const mu = mod(px + 9, pitch);
  const merlon = mu < (walkWall ? 20 : 24);
  if (v >= top) {
    if (!merlon || v >= merlonTop) return sky(px, py);
    // a merlon: its face, its top's arris lit, its sides' edges
    if (v >= merlonTop - 1) return A[4];
    if (mu < 1.5) return A[3];
    if (mu > (walkWall ? 18.5 : 22.5)) return A[1];
    return ashlar(px, v, row, 2071, 12);
  }
  // the coping under the crenels, its top lit
  if (v >= top - 3) return v === top - 1 ? A[4] : A[2];
  let c = ashlar(px, v, row, walkWall ? 2073 : 2075, walkWall ? 12 : 16);
  if (!walkWall) {
    const bay = bayAt(px);
    if (bay.kind === 1 || bay.kind === 4) {
      const s = slit(bay.u, v, 64, 28, 58, row, false, px, py);
      if (s) c = s;
    }
    // damp low down, where the rain runs off the setts
    if (v < 10 && vnoise(px * 0.08, 3, 2077) > 0.5) c = mixc(c, KP_DEEP, 0.25);
  }
  return c;
}

/** THE TOP: indoors the wall's thickness seen from above, its edge catching the light, then the dark; open to the sky, the sky. */
function topAt(open: boolean, px: number, py: number, back: number): RGB {
  if (open) return sky(px, py);
  if (back < 0.05) return KP_ASHLAR[0][3];
  if (back < 0.09) return KP_ASHLAR[1][1];
  return mixc(KP_DEEP, KP_ASHLAR[2][1], hash(px >> 1, py, 2081) < 0.12 ? 0.1 : 0);
}

/** A near wall's face, in shadow, cut down (his rule for near cliffs): indoors its foot of ashlar, dark; open to the sky, the parapet and the sky over it. */
function nearFace(zone: number, v: number, px: number, py: number): RGB {
  if (OPEN.has(zone)) return mixc(ashlar(px, v, 2, 2075, 16), KP_DEEP, 0.4);
  return mixc(indoorFace(zone, -1, v, px, py), KP_DEEP, 0.45);
}
const SKYKEYS = new Set([...KP_SKY, ...KP_STAR].flatMap((c) => [c.join(','), quietRGB(c).join(',')]));
const isSky = (c: RGB): boolean => SKYKEYS.has(c.join(','));

// ---------------------------------------------------------------------------------------------------
// THE LOOK

export function keepLook(land: KeepLand): TerrainLook {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const zoneAt = (tx: number, ty: number): number => (land.zone && isFloor(tx, ty) ? land.zone(tx, ty) : KP_ZONE.Hall);
  // how far each place is from a wall
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty));
  // which room each tile that is not floor stands by (the nearest floor's), and whether its top is the sky: near a wall
  // walk (past its battlements and the wall it runs along, all open), or behind a bailey's far wall (the floor in front of
  // it); the rest, the dark
  const near = new Uint8Array(f.w * f.h).fill(255);
  const from = new Int32Array(f.w * f.h).fill(-1);
  {
    const q: number[] = [];
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) if (isFloor(tx, ty)) {
      near[ty * f.w + tx] = zoneAt(tx, ty);
      from[ty * f.w + tx] = ty * f.w + tx;
      q.push(ty * f.w + tx);
    }
    for (let h = 0; h < q.length; h++) {
      const i = q[h];
      const tx = i % f.w;
      const ty = Math.floor(i / f.w);
      for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        const nx = tx + dx;
        const ny = ty + dy;
        if (!inMap(nx, ny) || near[ny * f.w + nx] !== 255) continue;
        near[ny * f.w + nx] = near[i];
        from[ny * f.w + nx] = from[i];
        q.push(ny * f.w + nx);
      }
    }
  }
  const skyTop = new Uint8Array(f.w * f.h);
  for (let ty = 0; ty < f.h; ty++) {
    for (let tx = 0; tx < f.w; tx++) {
      const i = ty * f.w + tx;
      if (isFloor(tx, ty) || from[i] < 0) continue;
      const fx = from[i] % f.w;
      const fy = Math.floor(from[i] / f.w);
      const dist = Math.max(Math.abs(fx - tx), Math.abs(fy - ty));
      if (near[i] === KP_ZONE.Walk) skyTop[i] = dist <= 5 || fx + fy > tx + ty ? 1 : 0;
      else if (near[i] === KP_ZONE.Bailey) skyTop[i] = fx + fy > tx + ty ? 1 : 0;
    }
  }
  const nearAt = (x: number, y: number): number => {
    const tx = Math.max(0, Math.min(f.w - 1, Math.floor(x)));
    const ty = Math.max(0, Math.min(f.h - 1, Math.floor(y)));
    const z = near[ty * f.w + tx];
    return z === 255 ? KP_ZONE.Hall : z;
  };
  const skyAt = (x: number, y: number): boolean => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    // (outside the level's tiles: as the edge of it nearest)
    return skyTop[Math.max(0, Math.min(f.h - 1, ty)) * f.w + Math.max(0, Math.min(f.w - 1, tx))] === 1;
  };
  /** The room a wall's face looks into: the floor tile at its foot (out from it toward the eye). */
  const roomOf = (shade: number, x: number, y: number): number => {
    const fx = shade < 0 ? x + 0.3 : x;
    const fy = shade < 0 ? y : y + 0.3;
    return isFloor(Math.floor(fx), Math.floor(fy)) ? zoneAt(Math.floor(fx), Math.floor(fy)) : nearAt(fx, fy);
  };
  /** The room nearest a near wall's edge (just in from it, away from the eye). */
  const nearRoom = (x: number, y: number): number => {
    for (const [dx, dy] of [[-0.3, -0.3], [-0.3, 0], [0, -0.3]] as const) if (isFloor(Math.floor(x + dx), Math.floor(y + dy))) return zoneAt(Math.floor(x + dx), Math.floor(y + dy));
    return nearAt(x, y);
  };
  return quietTerrain({
    rise: KP_RISE,
    near: 40,
    // the edges straight, as walls are
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 191,
    floor: (x, y, px, py) => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const z = zoneAt(tx, ty);
      const wd = wall(x, y);
      if (z === KP_ZONE.Bailey) return bailey(x, y, px, py, wd);
      if (z === KP_ZONE.Walk) return walk(x, y, px, py, wd);
      if (z === KP_ZONE.Gate) return setts(x, y, px, py, wd, 1957);
      if (z === KP_ZONE.Throne) return chequer(x, y, px, py, wd);
      if (z === KP_ZONE.Barracks) return barracks(x, y, px, py, wd);
      if (z === KP_ZONE.Armoury) return armoury(x, y, px, py, wd);
      if (z === KP_ZONE.Chamber) return boards(x, y, px, py, wd);
      return flags(x, y, px, py, wd, KP_STONE, 1941);
    },
    face: (shade, v, px, py, x, y) => {
      const z = roomOf(shade, x, y);
      return OPEN.has(z) ? openFace(z, shade, v, px, py) : indoorFace(z, shade, v, px, py);
    },
    top: (x, y, px, py, back) => topAt(skyAt(x, y), px, py, back),
    nearFace: (v, px, py, x, y) => nearFace(nearRoom(x, y), v, px, py),
    // (the top's edge over a far face: lit indoors; the sky over an open wall has none)
    brow: (c) => (isSky(c) ? c : mixc(c, KP_ASHLAR[0][4], 0.3)),
    foot: [0.4, 0.22],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.3, 0.18] },
  });
}

/** THE KEEP'S GROUND for a floor. */
export function keepTerrain(floor: Floor, land: Omit<KeepLand, 'floor'> = {}): Terrain {
  return terrainOf(floor, keepLook({ ...land, floor }));
}

/** PAINT A PIECE OF THE KEEP'S GROUND as `paintTerrain` does (picture pixels from (x0, y0), w by h): every pixel opaque. Two pieces side by side are one picture. */
export function paintKeepGround(T: Terrain, x0: number, y0: number, w: number, h: number): TerrainPiece {
  return paintTerrain(T, x0, y0, w, h);
}

export { indoorFace as keepWallFace, openFace as keepOpenFace, sky as keepSky };
