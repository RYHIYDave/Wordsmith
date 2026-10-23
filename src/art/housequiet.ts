// FLOOR 14, THE HOUSE OF QUIET: its ground (art/terrain.ts paints it from the level's own tiles). ACT 2, THE HUSH.
// A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the planning chat's, with his yes as ideas), level 14, THE HOUSE
// OF QUIET: "The city infirmary, where the Hushed are taken to be cured."; its layout "indoors: wards of iron beds,
// apothecary rooms, and a surgical theatre with a gallery. Rooms and halls, like the Prison."; its hazards "spilled
// tonics that leave clouds of the Hush on the floor"; its palette "Whitewash, pale green lamplight"; its story "the
// doctors aren't curing anyone. They draw out people's last words."; its boss the Physician, in the Physician's
// Theatre; its Muffled Bell "The chapel bell". To this chat, of floors 11 to 15, his word of 18 Oct, 21:24 Pacific:
// “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for
// 11-15”. So it is made, and sent him, without waiting.
//
// WHAT IT IS: the city's old infirmary at night, the Order's now, its lamps burning low behind green glass:
// - THE FLOOR, room by room (`HQ_ZONE`): the wards' scrubbed deal boards, pale and worn into paths between where the
//   beds stand; the halls' cool grey flags, worn hollow down their middles; the apothecary's small glazed tiles,
//   cream and a dull green in a checker, cracked, ringed where bottles stood and spilled; the theatre's dark oak boards
//   strewn with sawdust, thickest toward its middle; the chapel's great flags, ledger stones among them worn smooth.
//   What lies about: rolled bandages come loose, shards of the tonic vials' pale green glass, pills, the Order's black
//   ink dripped and smeared, a dropped page.
// - THE WALLS: limewash over plaster, cool, a little green in the lamplight; below it a dado, room by room: in the
//   wards and halls tongue-and-groove boarding painted the infirmary's green, chipped and scuffed, a dark skirting; in
//   the apothecary glazed tiles to the rail; in the theatre oak panelling; in the chapel a stone plinth and a
//   stencilled band. Tall windows, barred by the Order, the night dark in their panes; the house's rules painted on
//   the wall in black letters, the Order's ink struck across them; plaster fallen to the laths; damp stains; cracks.
//   The wall's top fades up into the dark.
// - THE TOPS: the walls' thickness from above, a lit edge of limewash, then the dark.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own
// palette (Colour 1: whitewash and the lamplight's pale green, after the fields' gold); a step quieter than the figures
// (Places 2) and duller than any word's colour (Colour 4: every colour through art/act2_quiet.ts); its dark cool and
// deep (Colour 2); NOTHING GLOWS (Colour 3: the lamps and their pale green light are the pieces'); the green kept a
// yellow-green, never near the hero's cyan; solid, not flat (Places 4); old and broken (Places 6); crisp pixels.
//
// FOR THE MAIN CHAT: `houseOfQuietLook(land)` makes the look for a level from what only the level knows: its floor,
// and what each walkable tile is (HQ_ZONE). Edges straight, as walls are.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';
import { quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: limewash, the infirmary's green, scrubbed boards, cool flags; a cool blue-black dark

/** The deep, cool dark under everything. */
export const HQ_DEEP: RGB = hex('#0b0d13');
/**
 * THE LIMEWASH, by how a face is turned to the light (to the lower left, lit; at the eye; to the lower right, in
 * shade): its light, its body, its other body, its mottle (a little green in the lamplight, never white).
 */
export const HQ_WASH = [
  ['#c2c6b4', '#b2b7a4', '#a7ac99', '#8f9583'],
  ['#a2a795', '#949a88', '#898f7e', '#767c6c'],
  ['#6c7266', '#62685d', '#585e55', '#474d46'],
].map((r) => r.map(hex));
/** THE DADO in the wards and halls, tongue-and-groove boarding painted the infirmary's green: its lit edge, body, the board's shaded side, the groove. */
export const HQ_DADO = [
  ['#7d8f6c', '#6b7d5c', '#5d6e50', '#30392a'],
  ['#64755a', '#57674d', '#4b5a43', '#262e22'],
  ['#45513c', '#3b4634', '#333d2d', '#1c231a'],
].map((r) => r.map(hex));
/** The skirting and the dado's rail, painted near black: body, dark, lit edge. */
export const HQ_SKIRT = ['#262a24', '#181b18', '#3e4539'].map(hex);
/** THE WARDS' BOARDS, scrubbed deal: the gap, shade, body, body, lit. */
export const HQ_DEAL = ['#2a2823', '#58544a', '#686456', '#77725f', '#8b8572'].map(hex);
/** THE HALLS' AND THE CHAPEL'S FLAGS, cool grey: the joint, shade, body, body, lit. */
export const HQ_FLAG = ['#2c2f33', '#53565a', '#606366', '#6c6f71', '#808385'].map(hex);
/** THE APOTHECARY'S TILES, glazed: cream (body, shade), the dull green (body, shade), the grout; a glint. */
export const HQ_TILE = ['#aeac96', '#969480', '#62785a', '#4e6248', '#3a3c37', '#c4c2ae'].map(hex);
/** OAK, the theatre's boards and panelling: the gap, shade, body, body, lit. */
export const HQ_OAK = ['#1c1611', '#33271d', '#42332a', '#4f3e31', '#635040'].map(hex);
/** SAWDUST strewn over the theatre's boards: shade, body, lit. */
export const HQ_SAWDUST = ['#6e6448', '#8e815e', '#a69872'].map(hex);
/** The chapel's stencilled band: a dull red, a dull green, ochre. */
export const HQ_STENCIL = ['#74483e', '#4c6046', '#86774c'].map(hex);
/** What lies about: linen (lit, shade), the vials' pale green glass (body, glint), a pill, the Order's ink (body, its sheen). */
export const HQ_LINEN = ['#c3c1b2', '#9b998b'].map(hex);
export const HQ_GLASS = ['#5a6950', '#929f84'].map(hex);
export const HQ_PILL = hex('#d0ccbc');
export const HQ_INK = ['#121016', '#26222c'].map(hex);
/** Behind fallen plaster: the laths (body, gap), the brick behind them. */
export const HQ_LATH = ['#4c3e30', '#271f19'].map(hex);
export const HQ_BRICK = ['#583c33', '#45302a'].map(hex);
/** A damp stain: its tide line, its body; mould in it. */
export const HQ_STAIN = ['#7c7656', '#8d886a', '#454c40'].map(hex);
/** Iron (the bars in the windows): dark, body, lit. */
export const HQ_IRON = ['#1c1e22', '#33363b', '#4f535a'].map(hex);
/** The night in a window's panes, and the lamplight caught in them. */
export const HQ_NIGHT = ['#151a24', '#1f2532', '#2d3443', '#5f6852'].map(hex);

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile is (and so how its floor and the walls round it look). */
export const HQ_ZONE = {
  /** A ward: scrubbed deal boards; the green dado on its walls. */
  Ward: 0,
  /** A hall or a way between rooms: grey flags; the green dado. */
  Hall: 1,
  /** An apothecary's room: glazed tiles in a checker; glazed tiles on its walls to the rail. */
  Apothecary: 2,
  /** The surgical theatre: oak boards strewn with sawdust; oak panelling on its walls. */
  Theatre: 3,
  /** The chapel: great flags and ledger stones; a stone plinth and a stencilled band on its walls. */
  Chapel: 4,
} as const;

export interface HouseLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** What a walkable tile is (HQ_ZONE); a hall where not said. */
  zone?: (tx: number, ty: number) => number;
}

/**
 * How tall the walls stand over the floor (picture pixels: the game's own dungeon walls are 80, fading out over their
 * top 24); the dado's rail; where the wall begins to fade into the dark above.
 */
export const HQ_RISE = 92;
export const HQ_RAIL = 24;
export const HQ_FADE = 64;

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

/** What lies about: a bandage come loose, shards of a tonic vial, pills, the Order's ink dripped, a dropped page. Null where nothing. */
function litter(x: number, y: number, px: number, py: number, wall: number, k: number): RGB | null {
  // (in drifts where something was spilled or dropped, not all over)
  const drift = vnoise(x * 0.4 + 9, y * 0.4, 4140 + k) > 0.6 ? 1 : 0.2;
  // THE ORDER'S INK, dripped in a trail and smeared: dark spots, a sheen on the bigger ones
  const ink = fbm(x * 1.6 + 3, y * 1.6, 4131 + k);
  if (ink > 0.86 && drift > 0.5) return ink > 0.83 && mod(alongX(px, py), 13) < 2 ? HQ_INK[1] : HQ_INK[0];
  const dx0 = Math.floor(px / 7);
  const dy0 = Math.floor(py / 5);
  if (hash(dx0, dy0, 4132 + k) < 0.005 * drift) {
    const ax = dx0 * 7 + 2;
    const ay = dy0 * 5 + 1;
    const r = 1 + Math.floor(hash(dx0, dy0, 4133) * 2);
    const dx = px - ax;
    const dy = py - ay;
    if (dx * dx + 3 * dy * dy <= r * r + 1) return dx < 0 && dy < 0 ? HQ_INK[1] : HQ_INK[0];
  }
  // A BANDAGE come loose: a strip of linen in a loose curl, its rolled end
  const bx = Math.floor(px / 29);
  const by = Math.floor(py / 15);
  if (hash(bx, by, 4141 + k) < 0.05 * drift) {
    const ax = bx * 29 + 4 + Math.floor(hash(bx, by, 4142) * 10);
    const ay = by * 15 + 4 + Math.floor(hash(bx, by, 4143) * 5);
    const dx = px - ax;
    if (dx >= 0 && dx < 14) {
      const wave = Math.round(2 * Math.sin(dx * 0.55 + hash(bx, by, 4144) * 6));
      const dy = py - ay - wave;
      if (dx >= 11 && dx < 14 && dy >= -1 && dy < 2) return dy === -1 ? HQ_LINEN[0] : HQ_LINEN[1];
      if (dy === 0) return dx % 4 === 0 ? HQ_LINEN[1] : HQ_LINEN[0];
      if (dy === 1 && dx > 1) return mixc(HQ_LINEN[1], HQ_DEEP, 0.35);
    }
  }
  // SHARDS of a tonic vial: short slants of pale green glass, a glint at the end
  const gx = Math.floor(px / 9);
  const gy = Math.floor(py / 6);
  if (hash(gx, gy, 4151 + k) < 0.03 * drift) {
    const ax = gx * 9 + 2 + Math.floor(hash(gx, gy, 4152) * 4);
    const ay = gy * 6 + 2;
    const dx = px - ax;
    const flip = hash(gx, gy, 4153) < 0.5;
    if (dx >= 0 && dx < 3 && py - ay === (flip ? dx >> 1 : -(dx >> 1))) return dx === 2 ? HQ_GLASS[1] : HQ_GLASS[0];
  }
  // pills, spilled: little pale rounds, two pixels, a shade under
  const qx = Math.floor(px / 6);
  const qy = Math.floor(py / 4);
  if (hash(qx, qy, 4161 + k) < 0.02 * drift && vnoise(x * 1.2, y * 1.2, 4162 + k) > 0.55) {
    const ax = qx * 6 + 2;
    const ay = qy * 4 + 1;
    if (py === ay && (px === ax || px === ax + 1)) return HQ_PILL;
    if (py === ay + 1 && px === ax) return HQ_LINEN[1];
  }
  // A DROPPED PAGE, lying along the grid, a line or two of writing on it
  const sx = Math.floor(px / 23);
  const sy = Math.floor(py / 13);
  if (hash(sx, sy, 4171 + k) < 0.01 + (wall < 0.8 ? 0.006 : 0)) {
    const ax = sx * 23 + 3 + Math.floor(hash(sx, sy, 4172) * 8);
    const ay = sy * 13 + 3 + Math.floor(hash(sx, sy, 4173) * 4);
    const dx = px - ax;
    const dy = py - ay;
    const slope = Math.floor(dx / 2);
    const e = dy - slope;
    if (dx >= 0 && dx < 9 && e >= 0 && e < 4) {
      if (e === 3) return HQ_LINEN[1];
      if ((e === 1 || e === 2) && dx > 1 && dx < 8 && (dx + e) % 3 !== 0) return mixc(HQ_INK[0], HQ_LINEN[1], 0.45);
      return HQ_LINEN[0];
    }
  }
  return null;
}

/** THE WARDS' BOARDS: scrubbed deal laid along x, each board its own tone, butt joints, nail heads; worn paler where feet go. */
function boards(x: number, y: number, px: number, py: number, wall: number, R: readonly RGB[], seed: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const BW = 16;
  const j = Math.floor(V / BW);
  const v = mod(V, BW);
  const len = 90 + Math.floor(hash(j, 0, seed) * 4) * 30;
  const off = Math.floor(hash(j, 1, seed) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const h0 = hash(i, j, seed + 1);
  let t = h0 > 0.72 ? 3 : h0 < 0.22 ? 1 : 2;
  // worn paler down the middle of a room, where feet go
  if (wall > 1.4 && vnoise(x * 0.5, y * 0.5, seed + 2) > 0.45) t = Math.min(4, t + 1);
  let c = R[t];
  // the grain: a darker streak along a board now and then
  if (h0 > 0.5 && Math.abs(v - 7 - Math.floor(h0 * 5)) < 1 && mod(U + h0 * 90, 61) < 34) c = R[Math.max(1, t - 1)];
  // (a joint two units wide is one pixel wide on the picture, unbroken)
  if (v < 2) c = R[0];
  else if (v < 4 && t < 4) c = mixc(c, R[Math.min(4, t + 1)], 0.6);
  if (u < 2) c = R[0];
  // nail heads near each end of a board
  if ((Math.abs(u - 7) < 1 || Math.abs(u - len + 7) < 1) && (Math.abs(v - 5) < 1 || Math.abs(v - BW + 4) < 1)) c = R[0];
  // dark in toward the walls, where the scrubbing brush did not reach
  if (wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, seed + 3)) c = mixc(c, HQ_DEEP, 0.28);
  return c;
}

/** THE HALLS' FLAGS: slabs in rows along x, cool grey, worn hollow and paler down the middle of the way. */
function flags(x: number, y: number, px: number, py: number, wall: number, big: boolean): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SV = big ? 42 : 30;
  const j = Math.floor(V / SV);
  const len = (big ? 54 : 40) + Math.floor(hash(j, 0, 4201) * 3) * 8;
  const off = Math.floor(hash(j, 1, 4201) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const v = mod(V, SV);
  const h0 = hash(i, j, 4202 + (big ? 1 : 0));
  let t = h0 > 0.7 ? 3 : h0 < 0.25 ? 1 : 2;
  if (wall > 1.2 && vnoise(x * 0.45, y * 0.45, 4203) > 0.5) t = Math.min(4, t + 1);
  let c = HQ_FLAG[t];
  if (u < 2 || v < 2) c = HQ_FLAG[0];
  else if (u < 3 || v < 3) c = HQ_FLAG[Math.min(4, t + 1)];
  else if (u >= len - 2 || v >= SV - 2) c = HQ_FLAG[1];
  else if (h0 > 0.9 && mod(U + V + Math.floor(h0 * 70), 43) < 1) c = HQ_FLAG[0];
  // A LEDGER STONE in the chapel's floor: a darker slab, a border cut round it, its letters worn near smooth
  if (big && h0 > 0.84 && u >= 4 && v >= 4 && u < len - 4 && v < SV - 4) {
    const bu = u - 4;
    const bv = v - 4;
    const L = len - 8;
    const S = SV - 8;
    c = HQ_FLAG[1];
    if (bu === 2 || bv === 2 || bu === L - 3 || bv === S - 3) c = HQ_FLAG[0];
    else if (bu > 5 && bu < L - 6 && bv > 6 && bv < S - 6 && mod(bv - 7, 6) < 2 && hash(Math.floor(bu / 2), Math.floor(bv / 6), 4204) < 0.55) c = mixc(HQ_FLAG[0], HQ_FLAG[1], 0.5);
  }
  if (wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, 4205)) c = mixc(c, HQ_DEEP, 0.28);
  return c;
}

/** THE APOTHECARY'S TILES: small glazed squares, cream and green in a checker, a band of green round the walls; cracked, one missing, rings where bottles stood. */
function tiles(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 16;
  const i = Math.floor(U / S);
  const j = Math.floor(V / S);
  const u = mod(U, S);
  const v = mod(V, S);
  const band = wall < 0.6;
  const green = band || ((i + j) & 1) === 1;
  const h0 = hash(i, j, 4211);
  let c = green ? HQ_TILE[h0 < 0.3 ? 3 : 2] : HQ_TILE[h0 < 0.25 ? 1 : 0];
  if (u < 1.5 || v < 1.5) return wall < 0.3 ? mixc(HQ_TILE[4], HQ_DEEP, 0.3) : HQ_TILE[4];
  // the glaze catching the light along a tile's upper edge
  if (v < 2.5 && u > 3 && u < S - 3 && !green) c = HQ_TILE[5];
  // a tile gone: the bed of mortar under it
  if (h0 > 0.985) return v > 3 && u > 3 ? HQ_FLAG[1] : HQ_FLAG[0];
  // cracked across
  if (h0 > 0.93 && Math.abs(u - v * 0.7 - 2) < 0.8) c = HQ_TILE[4];
  // a ring where a bottle stood and spilled
  const rx = Math.floor(U / 40);
  const ry = Math.floor(V / 40);
  if (hash(rx, ry, 4212) < 0.16) {
    const cx = rx * 40 + 12 + hash(rx, ry, 4213) * 16;
    const cy = ry * 40 + 12 + hash(rx, ry, 4214) * 16;
    const d = Math.hypot(U - cx, (V - cy) * 1.0);
    if (d > 6 && d < 8.2) c = mixc(c, HQ_INK[0], 0.4);
  }
  if (wall < 0.3 + 0.1 * vnoise(x * 2.4, y * 2.4, 4215)) c = mixc(c, HQ_DEEP, 0.25);
  return c;
}

/** THE THEATRE'S FLOOR: dark oak boards, sawdust strewn over them, thickest toward the middle of the room. */
function theatre(x: number, y: number, px: number, py: number, wall: number): RGB {
  let c = boards(x, y, px, py, wall, HQ_OAK, 4221);
  // the sawdust strewn over the middle of the room (where the table stands, a piece): where it is thick the boards
  // are lost under it; round its ragged edge it thins to scattered grains, two pixels to a grain
  const much = cl01((wall - 1.2) / 3.5);
  const n = much + 0.3 * (fbm(x * 0.9 + 13, y * 0.9, 4222) - 0.5) + 0.25;
  if (n > 0.8) {
    const g = hash(px >> 1, py, 4225);
    return g < 0.1 ? HQ_SAWDUST[2] : g < 0.24 ? HQ_SAWDUST[0] : HQ_SAWDUST[1];
  }
  if (n > 0.5) {
    const g = hash(px >> 1, py, 4223);
    if (g < (n - 0.5) * 1.9) c = g < 0.1 ? HQ_SAWDUST[2] : g < 0.3 ? HQ_SAWDUST[0] : HQ_SAWDUST[1];
  }
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE WALLS

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);

/** What is on a stretch of wall, one to every 112 picture pixels or so, steady from run to run. */
interface Bay {
  key: number;
  /** Where along it (0 at its left edge) and how wide. */
  u: number;
  w: number;
  /** 0 bare, 1 a tall barred window, 2 the house's rules painted, struck out, 3 plaster fallen to the laths, 4 a damp stain, 5 a crack. */
  kind: number;
}
function bayAt(px: number): Bay {
  const SPAN = 112;
  const k = Math.floor(px / SPAN);
  const h = hash(k, 0, 4401);
  const kind = h < 0.24 ? 1 : h < 0.38 ? 2 : h < 0.52 ? 3 : h < 0.66 ? 4 : h < 0.78 ? 5 : 0;
  return { key: k, u: px - k * SPAN, w: SPAN, kind };
}

/** LIMEWASH on plaster, `v` over the floor: brushed on in mottled patches, a little uneven. */
function wash(v: number, px: number, row: number): RGB {
  const W = HQ_WASH[row];
  const m = vnoise(px * 0.09, v * 0.13, 4411) + 0.35 * vnoise(px * 0.4, v * 0.5, 4412);
  let c = m > 0.95 ? W[0] : m > 0.62 ? W[1] : m > 0.35 ? W[2] : W[3];
  // the brush's strokes, faint, slanting
  if (mod(px + v * 0.6 + Math.floor(vnoise(px * 0.05, v * 0.05, 4413) * 30), 23) < 1 && m > 0.5) c = W[2];
  return c;
}

/** THE DADO, room by room: green-painted boarding (wards, halls), glazed tiles (apothecary), oak panelling (theatre), a stone plinth (chapel). */
function dado(zone: number, v: number, px: number, row: number, key: number): RGB | null {
  if (zone === HQ_ZONE.Chapel) {
    // a plinth of dressed stone, its top chamfered and catching the light
    if (v >= 16) return null;
    if (v >= 14) return row < 2 ? HQ_FLAG[4] : HQ_FLAG[2];
    const blk = Math.floor(px / 34);
    if (mod(px, 34) === 0 || v === 7) return HQ_FLAG[0];
    const t = hash(blk, v < 7 ? 0 : 1, 4421) > 0.5 ? 2 : 3;
    return HQ_FLAG[row === 2 ? t - 1 : row === 0 ? t + 1 : t];
  }
  if (zone === HQ_ZONE.Theatre) {
    // oak panelling to half the wall's height: rails and stiles framing sunk panels
    const TOP = 50;
    if (v >= TOP) return null;
    if (v >= TOP - 3) return v === TOP - 1 ? HQ_OAK[4] : HQ_OAK[row === 2 ? 1 : 3];
    if (v < 4) return v === 3 ? HQ_OAK[3] : HQ_OAK[1];
    const pu = mod(px, 30);
    const rail = (v >= 4 && v < 7) || (v >= 24 && v < 27);
    if (pu < 4 || rail) return pu === 0 || v === 26 ? HQ_OAK[row === 2 ? 1 : 4] : HQ_OAK[row === 2 ? 1 : 3];
    // the sunk panel: its moulding lit along the top and left, dark along the bottom and right
    if (pu === 4 || v === 7 || v === 27) return HQ_OAK[1];
    if (pu === 29 || v === 23 || v === TOP - 4) return HQ_OAK[row === 0 ? 4 : 3];
    return HQ_OAK[row === 2 ? 1 : row === 1 ? 2 : 3];
  }
  if (v >= HQ_RAIL + 3) return null;
  // the rail along its top: a moulding, its top catching the light
  if (v >= HQ_RAIL) return v === HQ_RAIL + 2 ? HQ_SKIRT[2] : v === HQ_RAIL ? HQ_SKIRT[1] : HQ_SKIRT[0];
  // the skirting
  if (v < 4) return v === 3 ? HQ_SKIRT[2] : HQ_SKIRT[v === 0 ? 1 : 0];
  if (zone === HQ_ZONE.Apothecary) {
    // glazed tiles to the rail: cream with a band of green two tiles high near the top
    const S = 8;
    const tu = mod(px + (Math.floor((v - 4) / S) & 1) * 4, S);
    const tv = mod(v - 4, S);
    if (tu === 0 || tv === S - 1) return HQ_TILE[4];
    const greenBand = v >= HQ_RAIL - 2 * S - 1;
    const T0 = greenBand ? HQ_TILE[row === 2 ? 3 : 2] : HQ_TILE[row === 2 ? 1 : 0];
    if (tv === S - 2 && tu < 4 && row < 2) return greenBand ? HQ_TILE[2] : HQ_TILE[5];
    if (hash(Math.floor(px / S), Math.floor((v - 4) / S), 4431 + key) > 0.97) return HQ_TILE[4];
    return T0;
  }
  // the infirmary's green boarding: boards upright, a groove between each, the paint chipped to the wood here and there
  const D = HQ_DADO[row];
  const bu = mod(px, 7);
  if (bu === 0) return D[3];
  if (bu === 1 && row < 2) return D[0];
  let c = bu === 6 ? D[2] : D[1];
  const chip = vnoise(px * 0.35, v * 0.35, 4441 + key);
  if (chip > 0.8 && v < HQ_RAIL - 6) c = chip > 0.86 ? HQ_DEAL[2] : HQ_DEAL[1];
  // scuffed dark low down, where beds and boots knocked it
  if (v < 12 && hash(px >> 1, v, 4442) < 0.15 * (1 - v / 12)) c = D[3];
  return c;
}

/** THE FAR WALLS: limewash over plaster, the dado below, what is on the wall bay by bay, fading into the dark above. */
function wallFace(zone: number, shade: number, v: number, px: number): RGB {
  const row = rowOf(shade + (hash(Math.floor(px / 112), 9, 4402) - 0.5) * 0.1);
  const bay = bayAt(px);
  const u = bay.u;
  const fade = (c: RGB): RGB => (v > HQ_FADE ? mixc(c, HQ_DEEP, 0.25 + 0.7 * cl01((v - HQ_FADE) / (HQ_RISE - HQ_FADE))) : c);
  // --- A TALL WINDOW, round-headed, high in the wall: barred by the Order, the night dark in its small panes (none in
  // the theatre, whose walls the gallery hides)
  if (bay.kind === 1 && zone !== HQ_ZONE.Theatre) {
    const cx = 34 + Math.floor(hash(bay.key, 1, 4403) * 44);
    const half = 12;
    const sill = HQ_RAIL + 10;
    const springs = 62;
    const du = u - cx;
    const head = springs + Math.sqrt(Math.max(0, half * half - du * du)) * 0.9;
    // the reveal round it, plastered, deep: lit on its left, in shade on its right
    if (Math.abs(du) <= half + 3 && v >= sill - 3 && v < head + 3) {
      const inside = Math.abs(du) < half && v >= sill && v < head;
      if (!inside) {
        if (v < sill) return fade(v === sill - 3 ? HQ_WASH[Math.min(2, row + 1)][3] : HQ_WASH[row][0]);
        return fade(du < 0 ? HQ_WASH[row][1] : HQ_WASH[Math.min(2, row + 1)][2]);
      }
      // the bars, the Order's: three upright, iron, rust at their feet
      if (mod(du + half, 8) === 3) return fade(v < sill + 2 ? HQ_LATH[0] : du < 0 ? HQ_IRON[2] : HQ_IRON[1]);
      // the glazing bars, leading the small panes
      if (mod(du + half, 8) === 7 || mod(v - sill, 9) === 8) return fade(HQ_IRON[0]);
      // the night in the panes, the lamplight caught in a pane or two
      const pane = hash(Math.floor((du + half) / 8), Math.floor((v - sill) / 9), 4404 + bay.key);
      const lit = pane > 0.8 && mod(du + half, 8) < 3 && mod(v - sill, 9) > 4;
      return fade(lit ? HQ_NIGHT[3] : v > head - 6 ? HQ_NIGHT[0] : pane > 0.5 ? HQ_NIGHT[2] : HQ_NIGHT[1]);
    }
  }
  const low = dado(zone, v, px, row, bay.key);
  if (low) return low;
  let c = wash(v, px, row);
  // the chapel's stencilled band: a running pattern of a dull red and green between ochre lines
  if (zone === HQ_ZONE.Chapel && v >= 42 && v < 52) {
    if (v === 42 || v === 51) c = HQ_STENCIL[2];
    else {
      const su = mod(px, 16);
      const sv = v - 46;
      const leaf = Math.abs(su - 8) + Math.abs(sv) * 1.6 < 5;
      c = leaf ? HQ_STENCIL[1] : Math.abs(su - 8) > 6 && Math.abs(sv) < 2 ? HQ_STENCIL[0] : c;
    }
    if (row === 2) c = mixc(c, HQ_DEEP, 0.3);
  }
  // a painted line along the wall above the dado, the infirmary's
  if (zone !== HQ_ZONE.Chapel && zone !== HQ_ZONE.Theatre && (v === 40 || v === 41)) c = HQ_DADO[row][v === 41 ? 2 : 1];
  if (bay.kind === 2 && zone !== HQ_ZONE.Chapel && zone !== HQ_ZONE.Theatre) {
    // THE HOUSE'S RULES, painted on the wall in black letters, rows of them; the Order's ink struck across
    const x0 = 22 + Math.floor(hash(bay.key, 2, 4403) * 20);
    const lu = u - x0;
    const top = 64;
    if (lu >= 0 && lu < 58 && v >= 44 && v < top) {
      const line = Math.floor((top - v) / 6);
      const lv = mod(top - v, 6);
      // (the heading wider, its letters bigger)
      const big = line === 0;
      const ink = big ? lv >= 1 && lv < 5 && mod(lu, 5) < 3 && hash(Math.floor(lu / 5), 0, 4405) < 0.85 : lv >= 2 && lv < 5 && mod(lu, 4) < 2 + (hash(lu, line, 4406) < 0.3 ? 1 : 0) && hash(Math.floor(lu / 4), line, 4407) < 0.75 && lu < 58 - hash(line, 1, 4408) * 16;
      if (ink) c = mixc(HQ_INK[0], c, 0.25);
      // the Order's ink struck across them, thick, run in drips
      const stroke = Math.abs(v - (48 + lu * 0.2 + 2 * Math.sin(lu * 0.2))) < 2.6;
      if (stroke) c = lu % 9 === 0 ? HQ_INK[1] : HQ_INK[0];
    }
    if (lu >= 4 && lu < 56 && v < 50 && v > 30 && mod(lu, 11) === 3 && v > 50 - 4 - 12 * hash(Math.floor(lu / 11), 3, 4409)) c = HQ_INK[0];
  } else if (bay.kind === 3) {
    // PLASTER FALLEN: the laths behind it, the brick behind them, the plaster's broken edge thick and lit
    const hx = 30 + Math.floor(hash(bay.key, 4, 4403) * 50);
    const hy = 40 + Math.floor(hash(bay.key, 5, 4403) * 12);
    const d = Math.hypot((u - hx) / 1.5, v - hy) + 5 * (vnoise(px * 0.2, v * 0.2, 4414) - 0.5);
    if (d < 9) {
      if (mod(v, 4) < 2) return fade(mod(px, 9) === 0 ? HQ_LATH[1] : HQ_LATH[0]);
      return fade(mod(px + (Math.floor(v / 4) & 1) * 6, 12) === 0 ? HQ_BRICK[1] : mixc(HQ_BRICK[0], HQ_DEEP, 0.4));
    }
    if (d < 11) c = v - hy > 0 ? HQ_WASH[row][0] : mixc(HQ_WASH[Math.min(2, row + 1)][3], HQ_DEEP, 0.2);
    // bits of it fallen on the dado's rail are the floor's
  } else if (bay.kind === 4) {
    // A DAMP STAIN spreading down from above: its tide lines, mould spotted in it
    const cx = 40 + hash(bay.key, 6, 4403) * 40;
    const reach = 30 + hash(bay.key, 7, 4403) * 26;
    const w = 18 + (HQ_RISE - v) * 0.12 + 6 * vnoise(px * 0.1, v * 0.1, 4415);
    const inStain = Math.abs(u - cx) < w && v > HQ_RISE - reach - 8 * vnoise(px * 0.15, 1, 4416);
    if (inStain) {
      const edge = w - Math.abs(u - cx);
      c = edge < 1.5 ? mixc(c, HQ_STAIN[0], 0.7) : mixc(c, HQ_STAIN[1], 0.35);
      if (hash(px >> 1, v >> 1, 4417) < 0.06 && edge > 4) c = HQ_STAIN[2];
    }
  } else if (bay.kind === 5) {
    // A CRACK running down through the plaster, forking
    const x0 = 30 + hash(bay.key, 8, 4403) * 50;
    const cu = x0 + 8 * Math.sin(v * 0.11 + bay.key) + 3 * vnoise(v * 0.4, bay.key, 4418);
    if (v > 28 && Math.abs(u - cu) < 0.7) c = mixc(HQ_WASH[2][3], HQ_DEEP, 0.4);
    else if (v > 28 && Math.abs(u - cu) < 1.6 && u < cu) c = HQ_WASH[row][0];
    const fork = x0 + 8 * Math.sin(54 * 0.11 + bay.key) + (54 - v) * 0.7;
    if (v > 40 && v < 54 && Math.abs(u - fork) < 0.7) c = mixc(HQ_WASH[2][3], HQ_DEEP, 0.4);
  }
  // grime low on the plaster just over the dado, and up under the dark
  if (zone !== HQ_ZONE.Theatre && v < HQ_RAIL + 8) c = mixc(c, HQ_DEEP, 0.08 * (1 - (v - HQ_RAIL) / 8));
  return fade(c);
}

/** THE TOP: the wall's thickness seen from above, its limewashed edge catching the light, then the dark over the rooms. */
function topAt(x: number, y: number, px: number, py: number, back: number): RGB {
  if (back < 0.05) return HQ_WASH[0][1];
  if (back < 0.09) return HQ_WASH[1][3];
  const r = hash(px >> 1, py, 4431);
  const c = r < 0.85 ? HQ_DEEP : mixc(HQ_DEEP, HQ_WASH[2][3], 0.12);
  void x;
  void y;
  return mixc(c, HQ_DEEP, cl01(back));
}

/** A near wall's face, in shadow, cut down (his rule for near cliffs): the dado and the limewash over it, dark. */
function nearFace(zone: number, v: number, px: number): RGB {
  const low = dado(zone, v, px, 2, 0);
  const c = low ?? wash(v, px, 2);
  return mixc(c, HQ_DEEP, v >= HQ_RAIL ? 0.45 : 0.5);
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

export function houseOfQuietLook(land: HouseLand): TerrainLook {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const zoneAt = (tx: number, ty: number): number => (land.zone && isFloor(tx, ty) ? land.zone(tx, ty) : HQ_ZONE.Hall);
  // how far each place is from a wall
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty));
  /** The room a wall's face looks into: the floor tile at its foot (out from it toward the eye). */
  const roomOf = (shade: number, x: number, y: number): number => {
    const fx = shade < 0 ? x + 0.3 : x;
    const fy = shade < 0 ? y : y + 0.3;
    return zoneAt(Math.floor(fx), Math.floor(fy));
  };
  /** The room nearest a near wall's edge (just in from it, away from the eye). */
  const nearRoom = (x: number, y: number): number => {
    for (const [dx, dy] of [[-0.3, -0.3], [-0.3, 0], [0, -0.3]] as const) if (isFloor(Math.floor(x + dx), Math.floor(y + dy))) return zoneAt(Math.floor(x + dx), Math.floor(y + dy));
    return HQ_ZONE.Hall;
  };
  return quietTerrain({
    rise: HQ_RISE,
    near: 40,
    // the edges straight, as walls are
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 141,
    floor: (x, y, px, py) => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const z = zoneAt(tx, ty);
      const wd = wall(x, y);
      const left = litter(x, y, px, py, wd, z);
      if (left) return left;
      if (z === HQ_ZONE.Ward) return boards(x, y, px, py, wd, HQ_DEAL, 4101);
      if (z === HQ_ZONE.Apothecary) return tiles(x, y, px, py, wd);
      if (z === HQ_ZONE.Theatre) return theatre(x, y, px, py, wd);
      return flags(x, y, px, py, wd, z === HQ_ZONE.Chapel);
    },
    face: (shade, v, px, _py, x, y) => wallFace(roomOf(shade, x, y), shade, v, px),
    top: (x, y, px, py, back) => topAt(x, y, px, py, back),
    nearFace: (v, px, _py, x, y) => nearFace(nearRoom(x, y), v, px),
    brow: (c) => mixc(c, HQ_WASH[0][0], 0.25),
    foot: [0.4, 0.22],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.3, 0.18] },
  });
}

// (the art chat's ways on, art/act2_ways.ts, paint a stretch of these walls round a way through them: exported for it, nothing changed)
export { wallFace as houseWallFace, topAt as houseTopAt };
