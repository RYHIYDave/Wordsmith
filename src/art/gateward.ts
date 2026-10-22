// FLOOR 11, THE GATE WARD: its ground (art/terrain.ts paints it from the level's own tiles). ACT 2, THE HUSH.
//
// The owner, 17 Oct 2026, 18:02, to the planning chat: “I need the next five levels for Wordsmith.  The siege
// magic that was blocking the town is now open and we can enter the city.  I’d like an overall theme for the
// five levels, bosses for each level, but I only want it to tell half the story of the town, as 11-20 will all
// be centered here.  We can leave the city, hit the outskirts, go in the sewers, visit any building, whatever
// we wanna do.” His doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the planning chat's, with his yes as ideas):
// level 11, THE GATE WARD, lanes between tall timber-and-stone houses opening into squares, the market's
// stalls, cart barricades left from the siege; some houses and shops walked into with their near walls cut
// away as in the dungeons; its palette “Lantern-warm dusk on grey stone, pink dome shards”. To this chat,
// 18 Oct: “I’d like you to read the art chat and the art rulebook and begin design on levels 11-16”; his picks
// by pop-up: “11–15 now, 16 once planned (Recommended)” and, where to start, “Floor 11 whole first”.
//
// WHAT IT IS: the lower city's first streets inside the broken gate, at dusk, the evening the siege broke. The
// people are silent; the city is not wrecked, only scarred.
// - THE FLOOR is the streets' setts, grey stone with the dusk's warmth on their lit edges, in rows, worn smooth
//   and paler down the middle of a lane; a kerb of flat slabs along every house's foot, damp; the squares paved
//   in great flags round a ring of setts; inside a house, its boards. Over it all the siege's leavings: blank
//   leaflets (the Hush's proclamations have no words), straw, puddles holding the dusk, scorched patches.
// - THE FAR WALLS ARE THE HOUSE FRONTS, each house its own: a storey of grey ashlar (doors, a low window,
//   shutters), a jetty beam on its brackets, a storey of oak timbers and plaster (its own colour), casements,
//   a few lit by a candle; the eaves and the roof's edge above. Some all of stone. Soot over a burnt window.
//   Inside a house, its own wall: boards to the waist, plaster, a shelf, the floor above cut away, dark.
// - THE TOPS ARE THE ROOFS, plot by plot: clay tiles or slate, each slope lit as it faces the light, the
//   ridges, the gutters between plots.
// - A house's front wall, where it is walked into, is cut down as the dungeon cuts walls: its foot of stone
//   and a broken top.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4);
// a palette of its own (Colour 1: grey stone, oak, plaster and clay at dusk, after the Fen's greens), a step
// quieter than the figures (Places 2), duller than any word's colour (Colour 4); its shadows fall into a deep,
// cool dark (Colour 2); NOTHING GLOWS CYAN OR PINK (Colour 3: the dome's shards are pieces, the cult's magic, not
// the ground; a lit window is a candle's honest warmth); solid, not flat (Places 4); old, broken and burnt
// (Places 6); crisp pixels, no smoothing.
//
// FOR THE MAIN CHAT: `gateWardLook(land)` makes the look for a level from what only the level knows: its floor
// (the look measures how far each place is from a wall, for the kerbs and the wear) and what each walkable tile
// is (a street, a square, a room of a house, or a house's front wall cut down). The edges are straight, as
// houses are: the look rounds a corner by a few pixels only, and never rags.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';
import { quietRGB } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mul = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
const add = (a: RGB, d: number): RGB => [a[0] + d, a[1] + d, a[2] + d];
const mod = (a: number, m: number): number => ((a % m) + m) % m;

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: grey stone, oak, plaster and clay, at dusk

/** The deep, cool dark under everything (his rulebook's dark base). */
export const GW_DEEP: RGB = hex('#130e1b');
/** THE SETTS of the streets: the joints, the shade, the body (two), the lit edge (the dusk's warmth), the worn. */
export const GW_SETT = ['#2c2734', '#3f3946', '#504852', '#5d5459', '#776a68', '#8f7f76'].map(hex);
/** THE KERB'S SLABS and the squares' flags: joint, shade, body, body, lit, pale. */
export const GW_FLAG = ['#2f2936', '#433c48', '#554c55', '#62585e', '#7a6d6b', '#94867c'].map(hex);
/** THE BOARDS inside a house: the gaps, shade, body, lit. */
export const GW_BOARD = ['#22171a', '#3a2723', '#4f362b', '#634433', '#7a5640'].map(hex);
/** The leavings: a blank leaflet (lit, shade), straw (shade, lit), a puddle (deep, body, the dusk in it), scorch. */
export const GW_PAPER = ['#cbbfa8', '#988c7c'].map(hex);
export const GW_STRAW = ['#6e5a36', '#8e7646'].map(hex);
export const GW_PUDDLE = ['#221e2c', '#3a3442', '#4e4058', '#a07e6a'].map(hex);
export const GW_SOOT = ['#221a1e', '#3a2c28'].map(hex);

/**
 * THE HOUSES' STONE, by how a face is turned to the light (to the lower left, lit; at the eye; to the lower
 * right, in shade): its lit edge, its body, its other body, its joints.
 */
export const GW_STONE = [
  ['#ae9a88', '#958474', '#857567', '#52444c'],
  ['#8a7d76', '#776b66', '#695d5b', '#433a46'],
  ['#5a5366', '#4c4659', '#433e51', '#2a2637'],
].map((r) => r.map(hex));
/** THE OAK of the timbers, turned likewise: lit, body, its shadow. */
export const GW_OAK = [
  ['#5c3f33', '#47302a', '#32221f'],
  ['#4b342c', '#3a2823', '#2a1c1b'],
  ['#38282b', '#2c2025', '#1e161c'],
].map((r) => r.map(hex));
/** THE PLASTER between them, each house its own, as it is in the light: cream, ochre, clay, sage, slate. */
export const GW_PLASTER = ['#c4ad8c', '#bb9866', '#a8877a', '#9da083', '#8f95a0'].map(hex);
/** THE SHUTTERS, each house its own: oxblood, bottle green, slate blue, mustard. */
export const GW_SHUTTER = ['#5e3634', '#3e4e44', '#46506a', '#6a5a38'].map(hex);
/** A WINDOW's glass: dark, its lead, and a candle behind it (its flame's warmth, the room lit by it). */
export const GW_GLASS = ['#191520', '#2a2430', '#f0c070', '#c8803e', '#7a4a32'].map(hex);
/** THE ROOFS: clay tiles and slate, each from its darkest to its lightest. */
export const GW_CLAY = ['#371f26', '#53292b', '#6d3833', '#874a3c', '#9f5c47'].map(hex);
export const GW_SLATE = ['#25222f', '#353243', '#464257', '#585469', '#6c6779'].map(hex);
/**
 * THE SLATE OF 20 OCT (behind `fresh`, render/act2_walls.ts ACT2_WALLS): the owner, 20 Oct 2026, 07:41 Pacific, "the roof and
 * ground textures are hard to distinguish between": the slate was the setts' own purple grey. This is a cold blue-black, darker
 * than any street, so that a roof of it never reads as the street beside it.
 */
export const GW_SLATE_FRESH = ['#141923', '#1e2634', '#293346', '#354158', '#47536b'].map(hex);

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile, so that every line laid along the
// world is a crisp two-to-one step on the screen.

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile is. */
export const GW_ZONE = {
  /** A street or lane: setts. */
  Street: 0,
  /** A square: the great flags round a ring of setts. */
  Square: 1,
  /** A room of a house, walked into: boards. */
  Room: 2,
} as const;

/**
 * A HOUSE THAT CAN BE WALKED INTO (his word, 18 Oct, to the first picture of the Gate Ward: “It looks great,
 * but I don’t like the big wood floors open.  Can we make it so the fronts of any building you can go into is
 * there, but once you enter, the wholefacade fades to transparent so you can see inside?”). From the street it
 * is a house like any other, its front and roof whole, its door open; inside, its whole front and roof fade
 * away (its SHELL, `houseShell`), and what is under them is painted on the ground: its room, its own walls, its
 * front wall cut down to its foot.
 */
export interface GWHouse {
  /** Its room, in tiles: x0, y0, x1, y1 (x1, y1 not in it). Walkable. */
  room: readonly [number, number, number, number];
  /**
   * Its front, toward the eye: a row along x at y = `at` (the room behind it at smaller y, the street at
   * at + 1), or a column along y at x = `at`. Not walkable, but for its doorway (`door`, the tiles along it,
   * from and not including the second), which is.
   */
  front: { along: 'x' | 'y'; at: number; door: readonly [number, number] };
}

export interface GateWardLand {
  /** The level's tiles, as the game walks them (a house's room and doorway floor, its front not). */
  floor: Floor;
  /** What a walkable tile is (GW_ZONE); a street where not said. (A house's room and doorway are rooms.) */
  zone?: (tx: number, ty: number) => number;
  /** Each square's middle (tiles), for its ring of setts. */
  squares?: readonly { x: number; y: number; r: number }[];
  /** The houses that can be walked into. */
  houses?: readonly GWHouse[];
  /**
   * THE LOOK OF 20 OCT (with render/act2_walls.ts ACT2_WALLS): the slate set apart from the street (GW_SLATE_FRESH). His words,
   * 20 Oct 2026, 07:41 Pacific: "the roof and ground textures are hard to distinguish between"; asked, with its pictures, whether
   * to put it in: "Put everything in but the doorways.  With the new walls I think it’ll look fine" (so the doorways are as they were).
   */
  fresh?: boolean;
  /**
   * (Act 2's town hub, art/hub2.ts, a mock-up behind HUB2, off: a place the city's people have swept: no scorch of the siege,
   * no leaflets; a few puddles in the deepest hollows and a little straw left. Not set, the ground is the Gate Ward's, as it was.)
   */
  swept?: boolean;
}

/** Is (tx, ty) in this house's room? */
const inRoom = (h: GWHouse, tx: number, ty: number): boolean => tx >= h.room[0] && tx < h.room[2] && ty >= h.room[1] && ty < h.room[3];
/** Where along this house's front (tx, ty) is (0 at its first tile), or -1 if not on it. */
function onFront(h: GWHouse, tx: number, ty: number): number {
  const F = h.front;
  if (F.along === 'x') return ty === F.at && tx >= h.room[0] && tx < h.room[2] ? tx - h.room[0] : -1;
  return tx === F.at && ty >= h.room[1] && ty < h.room[3] ? ty - h.room[1] : -1;
}
const inDoor = (h: GWHouse, tx: number, ty: number): boolean => {
  const k = onFront(h, tx, ty);
  if (k < 0) return false;
  const along = h.front.along === 'x' ? tx : ty;
  return along >= h.front.door[0] && along < h.front.door[1];
};
/** Which house (tx, ty) is part of (its room or its front), or -1. */
function houseOf(houses: readonly GWHouse[], tx: number, ty: number): number {
  for (let i = 0; i < houses.length; i++) if (inRoom(houses[i], tx, ty) || onFront(houses[i], tx, ty) >= 0) return i;
  return -1;
}

/**
 * THE FLOOR THE PAINTER IS GIVEN (terrainOf), for the ground (`open`: the houses as they are seen inside, their
 * fronts cut down and painted on the floor's own layer, as low as they are) or for the houses' shells
 * (`closed`: each house whole, its room and doorway under its roof).
 */
export function gateWardPaintFloor(land: GateWardLand, mode: 'open' | 'closed'): Floor {
  const f = land.floor;
  const houses = land.houses ?? [];
  const tiles = Uint8Array.from(f.tiles);
  for (let ty = 0; ty < f.h; ty++) {
    for (let tx = 0; tx < f.w; tx++) {
      const i = ty * f.w + tx;
      for (const h of houses) {
        if (mode === 'open' && onFront(h, tx, ty) >= 0) tiles[i] = T_FLOOR;
        if (mode === 'closed' && (inRoom(h, tx, ty) || inDoor(h, tx, ty))) tiles[i] = 0;
      }
    }
  }
  return { ...f, tiles } as Floor;
}

/** How far each place is from the nearest tile that is not floor, in tiles: held as a grid, 4 cells to a tile. */
function wallDistance(f: Floor): (x: number, y: number) => number {
  const K = 4;
  const W = f.w * K;
  const H = f.h * K;
  const d = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const tx = Math.floor(i / K);
      const ty = Math.floor(j / K);
      d[j * W + i] = f.tiles[ty * f.w + tx] === T_FLOOR ? 1e9 : 0;
    }
  }
  const D2 = Math.SQRT2;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const c = j * W + i;
      let v = d[c];
      if (i === 0 || j === 0) v = Math.min(v, 1);
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
      if (i === W - 1 || j === H - 1) v = Math.min(v, 1);
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

/** The siege's leavings over a street or a square: blank leaflets, straw, puddles, scorch. Null where none. */
function leavings(x: number, y: number, px: number, py: number, wall: number, swept = false): RGB | null {
  // a puddle in the hollows: dark water, the dusk's sky in its far half, a rim of wet stone
  const pf = fbm(x * 0.7 + 11, y * 0.7, 1131);
  // (swept: only the deepest hollows hold water)
  if (pf > (swept ? 0.775 : 0.715)) {
    if (pf < (swept ? 0.79 : 0.73)) return GW_PUDDLE[1];
    const sky = fbm(x * 1.4 + 5, y * 1.4, 1132);
    const glint = mod(alongX(px, py) + Math.floor(vnoise(x * 3, y * 3, 1133) * 30), 23) < 1;
    if (glint) return GW_PUDDLE[3];
    return sky > 0.5 ? GW_PUDDLE[2] : GW_PUDDLE[0];
  }
  // scorch where a firepot burst: a dark heart, a brown-black ring, its soot in flecks round it
  const sf = fbm(x * 0.5 - 7, y * 0.5 + 3, 1141);
  if (!swept && sf > 0.75) {
    if (sf > 0.8) return hash(px >> 1, py >> 1, 1143) < 0.3 ? GW_SOOT[1] : GW_SOOT[0];
    if (sf > 0.775) return GW_SOOT[1];
    if (hash(px, py, 1142) < 0.35) return GW_SOOT[1];
  }
  // a blank leaflet: a little sheet lying along the grid, lit, its far edge in shade; more by the walls
  const lx = Math.floor(px / 13);
  const ly = Math.floor(py / 9);
  if (!swept && hash(lx, ly, 1151) < 0.02 + (wall < 0.8 ? 0.035 : 0)) {
    const ax = lx * 13 + 2 + Math.floor(hash(lx, ly, 1152) * 6);
    const ay = ly * 9 + 2 + Math.floor(hash(lx, ly, 1153) * 3);
    const flip = hash(lx, ly, 1154) < 0.5;
    const dx = px - ax;
    const dy = py - ay;
    const slope = flip ? Math.floor(dx / 2) : -Math.floor(dx / 2);
    if (dx >= 0 && dx < 6 && dy - slope >= 0 && dy - slope < 3) return dy - slope === 2 ? GW_PAPER[1] : GW_PAPER[0];
  }
  // straw: a stalk of three pixels on the slant, in drifts by the walls
  const sx = Math.floor(px / 5);
  const sy = Math.floor(py / 4);
  const drift = vnoise(x * 1.6, y * 1.6, 1161);
  if (hash(sx, sy, 1162) < (drift > 0.66 ? 0.16 : 0.01) + (wall < 0.6 ? 0.08 : 0)) {
    const ax = sx * 5 + 1;
    const ay = sy * 4 + 1;
    const dx = px - ax;
    if (dx >= 0 && dx < 3 && py - ay === (hash(sx, sy, 1163) < 0.5 ? dx >> 1 : -(dx >> 1)) + 1) return GW_STRAW[dx === 0 ? 1 : 0];
  }
  return null;
}

/** THE SETTS: rows along x, each sett its own stone, worn paler down the middle of a lane. */
function setts(x: number, y: number, px: number, py: number, wall: number, alongXRows = true): RGB {
  const U = alongXRows ? alongX(px, py) : alongY(px, py);
  const V = alongXRows ? alongY(px, py) : alongX(px, py);
  const ROW = 14;
  const j = Math.floor(V / ROW);
  const v = mod(V, ROW);
  const len = 18 + Math.floor(hash(j, 0, 1201) * 3) * 3;
  const off = Math.floor(hash(j, 1, 1201) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const h0 = hash(i, j, 1202);
  let t = h0 > 0.7 ? 3 : h0 < 0.22 ? 1 : 2;
  // worn smooth and paler where feet and wheels go, away from the walls
  const worn = wall > 1.1 && fbm(x * 0.35, y * 0.35, 1203) > 0.42;
  if (worn && h0 > 0.4) t = Math.min(4, t + 1);
  let c = GW_SETT[t];
  // the joints: one or two pixels of the deep tone, the sett's lit edge on its upper left, its shade on its lower right
  if (v < 2 || u < 2) c = GW_SETT[0];
  else if (v < 3 || u < 3) c = GW_SETT[Math.min(5, t + (worn ? 2 : 1))];
  else if (v >= ROW - 2 || u >= len - 2) c = GW_SETT[1];
  // a sett missing here and there: its bed of earth showing
  if (h0 > 0.985 && v >= 2 && u >= 2) c = v < 4 ? GW_SETT[0] : mixc(GW_SETT[1], GW_BOARD[2], 0.4);
  return c;
}

/** THE KERB: flat slabs along a house's foot, damp toward the wall. */
function kerb(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SZ = 40;
  const i = Math.floor((U + Math.floor(V / SZ) * 17) / SZ);
  const j = Math.floor(V / SZ);
  const u = mod(U + Math.floor(V / SZ) * 17, SZ);
  const v = mod(V, SZ);
  const h0 = hash(i, j, 1301);
  let c = GW_FLAG[h0 > 0.66 ? 3 : 2];
  if (u < 2 || v < 2) c = GW_FLAG[0];
  else if (u < 3 || v < 3) c = GW_FLAG[4];
  // damp toward the wall, in the wet's slow shape
  const damp = wall < 0.25 + 0.2 * vnoise(x * 2, y * 2, 1302);
  if (damp) c = mixc(c, GW_DEEP, 0.28);
  // a crack across a slab
  if (h0 > 0.86 && mod(U - V + Math.floor(h0 * 50), 41) < 1) c = GW_FLAG[0];
  return c;
}

/** THE SQUARE: great flags laid along the grid, a ring of setts round its middle, a round stone at its heart. */
function square(x: number, y: number, px: number, py: number, wall: number, sq: { x: number; y: number; r: number } | null): RGB {
  if (sq) {
    // distance from its middle, on the ground (a round ring on the ground is an ellipse on the screen)
    const d = Math.hypot(x - sq.x, y - sq.y);
    if (d < 0.55) {
      // the heart: a round stone, its lit half to the upper left, a groove round it
      if (d > 0.5) return GW_FLAG[0];
      return (x - sq.x) + (y - sq.y) < -0.1 ? GW_FLAG[5] : GW_FLAG[4];
    }
    const r0 = sq.r;
    if (d > r0 - 0.42 && d < r0 + 0.42) {
      // the ring of setts, laid round
      const a = Math.atan2(y - sq.y, x - sq.x);
      const k = Math.floor(((a + Math.PI) * r0 * 4) / (2 * Math.PI) + (d > r0 ? 0.5 : 0));
      const band = d > r0 ? 1 : 0;
      const along = mod((a + Math.PI) * r0 * 4 / (2 * Math.PI) + (band ? 0.5 : 0), 1);
      const h0 = hash(k, band, 1401);
      let c = GW_SETT[h0 > 0.6 ? 3 : 2];
      if (along < 0.12 || Math.abs(d - r0) < 0.035 || Math.abs(d - r0) > 0.39) c = GW_SETT[0];
      else if (along < 0.22) c = GW_SETT[4];
      return c;
    }
  }
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SZ = 64;
  const j = Math.floor(V / SZ);
  const off = (j & 1) * 32;
  const i = Math.floor((U + off) / SZ);
  const u = mod(U + off, SZ);
  const v = mod(V, SZ);
  const h0 = hash(i, j, 1411);
  let t = h0 > 0.75 ? 3 : h0 < 0.2 ? 1 : 2;
  if (wall > 1.4 && fbm(x * 0.3, y * 0.3, 1412) > 0.5 && h0 > 0.35) t = Math.min(4, t + 1);
  let c = GW_FLAG[t];
  if (u < 2 || v < 2) c = GW_FLAG[0];
  else if (u < 3 || v < 3) c = GW_FLAG[Math.min(5, t + 1)];
  else if (u >= SZ - 2 || v >= SZ - 2) c = GW_FLAG[1];
  // a flag cracked by something heavy that fell
  if (h0 > 0.9) {
    const k = mod(U * 0.5 + V + Math.floor(h0 * 90), 47);
    if (k < 1) c = GW_FLAG[0];
  }
  return c;
}

/** THE BOARDS inside a house: along x, the gaps between them dark, a knot here and there, dust by the walls. */
function boards(x: number, y: number, px: number, py: number, wall: number): RGB {
  const V = alongY(px, py);
  const U = alongX(px, py);
  const W = 12;
  const j = Math.floor(V / W);
  const v = mod(V, W);
  const len = 96 + Math.floor(hash(j, 0, 1501) * 4) * 24;
  const off = Math.floor(hash(j, 1, 1501) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const h0 = hash(i, j, 1502);
  let c = GW_BOARD[h0 > 0.66 ? 3 : 2];
  if (v < 1 || u < 1) c = GW_BOARD[0];
  else if (v < 2) c = GW_BOARD[4];
  else if (v >= W - 1) c = GW_BOARD[1];
  // the grain: a darker line along the board now and then
  if (v > 2 && v < W - 1 && mod(u + Math.floor(h0 * 31), 37) < 9 && v === 5 + (j & 1)) c = GW_BOARD[1];
  // a knot
  if (hash(Math.floor(u / 20), i * 31 + j, 1503) < 0.04 && mod(u, 20) < 3 && v > 3 && v < 7) c = GW_BOARD[1];
  // dust drifted by the walls
  if (wall < 0.4 + 0.25 * vnoise(x * 3, y * 3, 1504)) c = mixc(c, GW_FLAG[3], 0.35);
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE HOUSE FRONTS

/** How tall a house front stands, in picture pixels (75 game pixels: about two and a half heroes). */
export const GW_RISE = 150;

/** One house along a front: its strip of the picture, its colours, where its door and windows are. */
interface House {
  key: number;
  /** Where along it (0 at its left edge) and how wide. */
  u: number;
  w: number;
  /** 0 timber over stone, 1 all stone. */
  kind: number;
  plaster: RGB;
  shutter: RGB;
  /** How far in its door is, from its left; 0 for none. */
  door: number;
  /** How far apart its windows are above. */
  bay: number;
  burnt: boolean;
  boarded: boolean;
}

function houseAt(px: number): House {
  // houses along the picture, 46 to 86 picture pixels wide, set by a chain of widths (steady from run to run)
  const SPAN = 64;
  const k0 = Math.floor(px / SPAN);
  // each span of 64 is cut once, where its house ends and the next begins
  const cut = (k: number): number => k * SPAN + 18 + Math.floor(hash(k, 0, 1601) * 28);
  let k = k0;
  if (px < cut(k0)) k = k0 - 1;
  const a = cut(k);
  const b = cut(k + 1);
  const h = (n: number): number => hash(k, n, 1602);
  const w = b - a;
  return {
    key: k,
    u: px - a,
    w,
    kind: h(1) < 0.2 ? 1 : 0,
    plaster: GW_PLASTER[Math.floor(h(2) * GW_PLASTER.length)],
    shutter: GW_SHUTTER[Math.floor(h(3) * GW_SHUTTER.length)],
    door: h(4) < 0.78 ? 6 + Math.floor(h(5) * Math.max(1, w - 30)) : 0,
    bay: 22 + Math.floor(h(6) * 3) * 4,
    burnt: h(7) < 0.14,
    boarded: h(8) < 0.18,
  };
}

/** A house walked into, as one house along its whole front: `u` from its front's left end, `w` its width (picture pixels). */
function walkInHouse(index: number, u: number, w: number): House {
  const k = 5000 + index;
  const h = (n: number): number => hash(k, n, 1602);
  return {
    key: k,
    u,
    w,
    kind: 0,
    plaster: GW_PLASTER[Math.floor(h(2) * GW_PLASTER.length)],
    shutter: GW_SHUTTER[Math.floor(h(3) * GW_SHUTTER.length)],
    door: 0,
    bay: 22 + Math.floor(h(6) * 3) * 4,
    burnt: false,
    boarded: false,
  };
}

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number, wobble: number): number => (shade + wobble > 0.35 ? 0 : shade + wobble < -0.35 ? 2 : 1);

/** The plaster of a house as its face is turned. */
function plasterOf(base: RGB, row: number): RGB {
  if (row === 0) return base;
  if (row === 1) return mixc(mul(base, 0.84), [92, 84, 100], 0.12);
  return mixc(mul(base, 0.56), [62, 58, 82], 0.3);
}

/** A window: casement, its lead, maybe a candle; shutters open beside it. (u, v) in the window's own frame, 0 at its lower left. */
function windowPx(u: number, v: number, w: number, h: number, H: House, row: number, lit: boolean): RGB | null {
  const SH = 4;
  // the shutters, open flat against the wall either side
  if ((u >= -SH && u < 0) || (u >= w && u < w + SH)) {
    if (v < 0 || v >= h) return null;
    const s = row === 0 ? H.shutter : row === 1 ? mul(H.shutter, 0.82) : mixc(mul(H.shutter, 0.6), GW_DEEP, 0.3);
    const plank = mod(u, 2) === 0 ? mul(s, 0.86) : s;
    if (v === h - 1) return add(plank, 14);
    return plank;
  }
  if (u < 0 || u >= w || v < 0 || v >= h) return null;
  // the frame: oak, its sill catching the light
  if (v === 0) return GW_STONE[row][0];
  if (u === 0 || u === w - 1 || v === h - 1) return GW_OAK[row][1];
  // the glass and its lead: a cross of lead, diamond panes in it
  const cu = u === Math.floor(w / 2);
  const cv = v === Math.floor(h / 2);
  if (H.boarded) {
    // boarded up against the siege: two planks across
    const p = mod(v - Math.floor(u / 2), 5);
    return p < 3 ? (p === 0 ? GW_OAK[row][0] : GW_OAK[row][1]) : GW_GLASS[0];
  }
  if (lit) {
    if (cu || cv) return GW_GLASS[4];
    const near = Math.abs(u - w / 2) + Math.abs(v - h / 2 + 1);
    return near < 2.5 ? GW_GLASS[2] : near < 5 ? GW_GLASS[3] : GW_GLASS[4];
  }
  if (cu || cv) return GW_GLASS[1];
  return (u + v) % 4 === 0 ? GW_GLASS[1] : GW_GLASS[0];
}

/** A house front: `v` picture pixels over its foot, turned to the light by `shade`. */
function front(shade: number, v: number, px: number, py: number, given?: House, slate: readonly RGB[] = GW_SLATE): RGB {
  const H = given ?? houseAt(px);
  const u = H.u;
  const row = rowOf(shade, (hash(H.key, 9, 1603) - 0.5) * 0.1);
  const S = GW_STONE[row];
  const O = GW_OAK[row];
  // the party wall between two houses: a dark seam, a lit quoin edge on the right-hand house
  const seam = u === 0;
  const STONE_TOP = H.kind === 1 ? 118 : 56;
  // --- the roof's edge and the eaves (122 up): the front edge of the roof, its underside in shadow
  if (v >= 132) {
    // tiles seen edge-on, in courses, the lowest course catching the light
    const clay = hash(H.key, 11, 1604) < 0.62;
    const R = clay ? GW_CLAY : slate;
    const course = mod(v - 132, 5);
    const lift = row === 0 ? 1 : row === 2 ? -1 : 0;
    let c = R[Math.max(0, Math.min(4, 2 + lift))];
    if (course === 0) c = R[Math.max(0, 1 + lift)];
    else if (course === 4 && mod(px + Math.floor((v - 132) / 5) * 3, 6) === 0) c = R[Math.max(0, lift + 1)];
    if (v < 134) c = R[Math.min(4, 3 + lift)];
    if (seam) c = R[0];
    return c;
  }
  if (v >= 122) {
    // under the eaves: deep shade, the rafters' ends in a row
    const raft = mod(px + H.key * 3, 7) < 2 && v >= 125 && v < 129;
    if (raft) return O[0];
    return mixc(O[2], GW_DEEP, 0.4);
  }
  // --- a stone house all the way up, or the ground storey of stone
  if (v < STONE_TOP) {
    // the plinth: bigger stones, darker
    const plinth = v < 7;
    const CH = plinth ? 7 : 9;
    const course = plinth ? -1 : Math.floor((v - 7) / CH);
    const cv = plinth ? v : mod(v - 7, CH);
    const blen = plinth ? 26 : 15 + Math.floor(hash(H.key, course, 1605) * 8);
    const boff = Math.floor(hash(H.key, course + 50, 1605) * blen);
    const bu = mod(px + boff, blen);
    const bi = Math.floor((px + boff) / blen);
    const b0 = hash(bi, course + 100 * H.key, 1606);
    let c = S[b0 > 0.6 ? 2 : 1];
    if (plinth) c = mixc(S[2], S[3], 0.35);
    if (cv === CH - 1 || bu === 0) c = S[3];
    else if (cv === CH - 2 || bu === 1) c = S[0];
    // the foot, darker where it meets the street
    if (v < 3) c = mixc(c, GW_DEEP, 0.35);
    // a string course on an all-stone house, between its storeys
    if (H.kind === 1 && v >= 56 && v < 61) c = v === 60 ? S[0] : v === 56 ? S[3] : S[1];
    // the door: oak planks, iron studs, a stone lintel over it; a step at its foot
    if (H.door && u >= H.door && u < H.door + 16 && v < 42) {
      const du = u - H.door;
      if (v >= 38) return v === 41 ? S[0] : S[2]; // the lintel
      if (du < 2 || du >= 14) return du === 0 || du === 15 ? S[3] : S[0]; // the jambs
      if (v < 2) return S[0]; // the step
      const plank = mod(du, 4) === 1;
      let d = plank ? O[2] : O[1];
      if ((v === 10 || v === 28) && du > 2 && du < 13) d = mixc(O[2], [30, 30, 36], 0.5); // the iron straps
      if ((v === 10 || v === 28) && (du === 4 || du === 11)) d = [110, 104, 100]; // a stud
      if (du === 11 && v === 19) d = [120, 112, 104]; // the ring
      return d;
    }
    // a low window of the ground storey, beside the door
    if (v >= 18 && v < 38) {
      const wu = H.door ? (H.door > H.w / 2 ? H.door - 18 : H.door + 24) : Math.floor(H.w / 2) - 6;
      const lit = hash(H.key, 21, 1607) < 0.18;
      const w = windowPx(u - wu, v - 18, 12, 18, H, row, lit);
      if (w) return w;
    }
    // an upper window in an all-stone house: tall, arched, in pairs
    if (H.kind === 1 && v >= 72 && v < 104) {
      const k = Math.floor((u - 8) / H.bay);
      const wu = 8 + k * H.bay;
      if (k >= 0 && wu + 12 < H.w - 4) {
        const top = v - 72;
        const du = u - wu;
        if (du >= 0 && du < 12 && top < 32) {
          const arch = top >= 28 && (du < 2 || du > 9);
          if (!arch) {
            const lit = hash(H.key * 7 + k, 22, 1607) < 0.15;
            const w = windowPx(du, top, 12, 28, H, row, lit);
            if (w) return w;
          }
        }
      }
    }
    // soot above a burnt window
    if (H.burnt && v > 20 && v < 120) {
      const du = Math.abs(u - H.w / 2);
      if (du < 12 - (v - 20) * 0.06 + 3 * vnoise(px * 0.3, v * 0.1, 1608)) c = mixc(c, GW_SOOT[0], 0.55);
    }
    if (seam) c = S[3];
    else if (u === 1) c = S[0];
    return c;
  }
  // --- the jetty: the upper storey's beam on its brackets, its shadow on the stone below
  if (v < 62) return v === 56 ? O[2] : v === 61 ? O[0] : O[1];
  // --- the upper storey: oak timbers, plaster between, casements
  const pl = plasterOf(H.plaster, row);
  const rel = v - 62;
  // the posts: at the house's edges, either side of each window, and between
  const bay = H.bay;
  const k = Math.floor((u - 4) / bay);
  const bu = mod(u - 4, bay);
  const post = u < 3 || u >= H.w - 2 || bu < 3;
  const rail = rel < 3 || (rel >= 30 && rel < 33) || rel >= 57;
  if (post || rail) {
    let c = O[1];
    if ((post && (bu === 0 || u === 0)) || (rail && (rel === 0 || rel === 30))) c = O[0];
    if ((post && (bu === 2 || u === H.w - 1)) || (rail && (rel === 2 || rel === 32 || rel === 59))) c = O[2];
    if (seam) c = O[2];
    return c;
  }
  // a casement in every other panel, between the lower rails: or a brace across the panel
  const hasWin = mod(k + H.key, 2) === 0 && bu >= 7 && k >= 0;
  if (hasWin && rel >= 7 && rel < 27) {
    const lit = hash(H.key * 13 + k, 23, 1609) < 0.22;
    const w = windowPx(bu - 8, rel - 7, Math.max(6, bay - 14), 20, H, row, lit);
    if (w) return w;
  }
  if (!hasWin && rel < 30) {
    // a brace from corner to corner of the panel
    const t = (bu - 3) / Math.max(1, bay - 3);
    const line = Math.round(3 + t * 27);
    if (Math.abs(rel - line) <= 1) return Math.abs(rel - line) === 0 ? O[1] : O[2];
  }
  // the plaster: its own colour, a patch fallen off here and there showing the wattle, the dusk's dirt
  let c = pl;
  const f = vnoise(px * 0.12, v * 0.14, 1610 + H.key);
  if (f > 0.74) c = mixc(pl, O[1], 0.45);
  else if (f > 0.66) c = mul(pl, 0.9);
  if (H.burnt && Math.abs(u - H.w / 2) < 14 + 6 * vnoise(px * 0.2, v * 0.2, 1611) && rel < 50) c = mixc(c, GW_SOOT[0], 0.6);
  return c;
}

/**
 * A WALKED-INTO HOUSE'S DOORWAY, in its front: an arch of stone the doorway wide, its two oak leaves swung back
 * inside it, the room's lamplight warm on the threshold and dark above. `du` 0..1 across it, `wp` its width.
 */
function doorway(du: number, v: number, px: number, shade: number, wp: number): RGB | null {
  const row = rowOf(shade, 0);
  const S = GW_STONE[row];
  const O = GW_OAK[row];
  const u = du * wp;
  const mid = Math.abs(du - 0.5) * 2; // 0 at its middle, 1 at its edges
  const top = 44 + Math.round(8 * Math.sqrt(Math.max(0, 1 - mid * mid))); // a segmental arch
  if (v > top + 5) return null;
  // the jambs and the arch's ring of stones
  if (u < 4 || u >= wp - 4 || v > top) {
    if (v > top && v <= top + 5) {
      const vs = mod(Math.floor(u / 6), 2) === 0;
      if (v === top + 5) return S[0];
      return vs ? S[1] : S[2];
    }
    if (u < 4 || u >= wp - 4) return mod(v, 9) === 8 ? S[3] : u === 0 || u === wp - 1 ? S[3] : u < 2 || u >= wp - 2 ? S[0] : S[1];
  }
  // the leaves, swung back inside
  const lu = u - 4;
  const ru = wp - 4 - u;
  if ((lu >= 0 && lu < 5) || (ru > 0 && ru <= 5)) {
    const e = lu >= 0 && lu < 5 ? lu : 5 - ru;
    if (v > top - 3) return S[3];
    return e === 0 ? O[0] : mod(v, 7) === 0 ? O[2] : O[1];
  }
  // the threshold, lit; the room's lamplight warm low down, dark above
  if (v < 2) return S[0];
  if (v < 8) return mixc(GW_GLASS[4], GW_BOARD[3], 0.5);
  if (v < 20) return mixc(GW_GLASS[4], GW_DEEP, (v - 8) / 16);
  return mixc(GW_BOARD[0], GW_DEEP, 0.6);
}

/** A room's own wall, inside a house walked into: boards to the waist, plaster, a shelf, the floor above cut away, dark. */
function inner(shade: number, v: number, px: number): RGB {
  const row = rowOf(shade, 0);
  const O = GW_OAK[row];
  const pl = plasterOf(hex('#a89478'), row);
  const k = Math.floor(px / 44);
  if (v < 3) return mixc(O[2], GW_DEEP, 0.4);
  if (v < 22) return v === 21 ? O[0] : mod(px, 6) === 0 ? O[2] : O[1];
  if (v < 62) {
    // a shelf with its jars and books in some bays
    const shelf = hash(k, 1, 1701) < 0.55;
    const su = mod(px, 44);
    if (shelf && su > 6 && su < 36) {
      if (v === 40 || v === 41) return v === 41 ? O[0] : O[2];
      if (v > 41 && v < 52) {
        const item = Math.floor((su - 7) / 4);
        const h = 4 + Math.floor(hash(k * 17 + item, 2, 1701) * 7);
        if (v - 42 < h && mod(su - 7, 4) < 3) {
          const tone = hash(k * 17 + item, 3, 1701);
          const base = tone < 0.3 ? GW_SHUTTER[0] : tone < 0.6 ? GW_PAPER[1] : tone < 0.8 ? GW_SHUTTER[2] : GW_OAK[0][0];
          return mod(su - 7, 4) === 0 ? mul(base, 1.1) : mul(base, row === 2 ? 0.6 : 0.85);
        }
      }
    }
    let c = pl;
    if (vnoise(px * 0.1, v * 0.12, 1702) > 0.72) c = mul(pl, 0.88);
    return c;
  }
  // the joists of the floor above, cut, their ends lit
  if (v < 70) return mod(px, 14) < 4 ? (v === 69 ? O[0] : O[1]) : mixc(O[2], GW_DEEP, 0.5);
  // the room above, cut open as the one below: its boards' edge, its own plaster wall (dimmer: no lamp
  // up there), a small window, posts; then the roof's rafters over it
  const up = mixc(pl, GW_DEEP, 0.32);
  if (v < 73) return v === 72 ? O[0] : O[1];
  if (v >= 128) {
    // under the roof: the rafters, dark between
    return mod(px + Math.floor((v - 128) / 2), 9) < 3 ? mixc(O[1], GW_DEEP, 0.3) : mixc(O[2], GW_DEEP, 0.55);
  }
  if (v >= 124) return v === 124 ? O[0] : O[1]; // the wall plate
  const pu = mod(px, 44);
  if (pu < 3) return pu === 0 ? O[0] : O[1]; // a post
  if (hash(k, 5, 1701) < 0.5 && pu > 16 && pu < 28 && v > 88 && v < 108) {
    // a small window, dark, its frame
    if (pu === 17 || pu === 27 || v === 89 || v === 107) return O[1];
    return pu === 22 || v === 98 ? GW_GLASS[1] : GW_GLASS[0];
  }
  let c = up;
  if (vnoise(px * 0.1, v * 0.12, 1703) > 0.7) c = mul(up, 0.88);
  return c;
}

/**
 * A HOUSE'S FRONT WALL CUT DOWN, painted on the floor's own layer (it is low, so it stands over nothing): its
 * face `d` picture pixels over its foot toward the street, and above that its broken top seen from above.
 * `lit`: the face looks to the lower left (its wall runs along x), else to the lower right.
 */
function cutStub(d: number, px: number, py: number, lit: boolean): RGB {
  const hw = 11 + Math.floor(vnoise(alongX(px, py) * 0.06, alongY(px, py) * 0.06, 1803) * 7);
  const S = GW_STONE[lit ? 0 : 2];
  if (d < hw) {
    if (d >= hw - 1) return S[0]; // its broken top edge, catching the light
    const course = Math.floor(d / 6);
    const bu = mod(px + course * 7, 15);
    if (bu === 0 || mod(d, 6) === 5) return S[3];
    return d < 2 ? mixc(S[2], GW_DEEP, 0.35) : S[1];
  }
  // its top: the rubble of its stone, a fallen block here and there, the light on it
  const T0 = GW_STONE[1];
  const r = hash(Math.floor(px / 3), Math.floor(py / 2), 1802);
  const blk = hash(Math.floor(px / 7), Math.floor(py / 4), 1804) < 0.18;
  if (blk) return mod(py, 4) === 0 ? T0[0] : T0[2];
  return r < 0.25 ? T0[3] : r < 0.7 ? T0[2] : r < 0.92 ? T0[1] : T0[0];
}

// ---------------------------------------------------------------------------------------------------
// THE ROOFS

/**
 * WHERE A ROOF'S RIDGE RUNS over (x, y) (tiles), as the roofs are painted (`roof`, below): along x, at y = `at`,
 * from x = `from` to `to` (the plot's ends); or along y, at x = `at`, from y = `from` to `to`. For what is laid on
 * a ridge (art/floor11_moments.ts: the pigeons).
 */
export function gateWardRidge(x: number, y: number): { along: 'x' | 'y'; at: number; from: number; to: number } {
  const RY = 2.5;
  const RG = 0.42;
  const j = Math.floor(y / RY);
  const len = 2 + Math.floor(hash(j, 0, 1901) * 3);
  const off = hash(j, 1, 1901) * len;
  const i = Math.floor((x + off) / len);
  const h0 = hash(i, j, 1902);
  const ridgeY = h0 > 0.78 || (h0 > 0.4 && h0 < 0.48);
  return ridgeY ? { along: 'y', at: (i + RG) * len - off, from: j * RY, to: (j + 1) * RY } : { along: 'x', at: (j + RG) * RY, from: i * len - off, to: (i + 1) * len - off };
}

/** A roof's plot: rows 2.5 tiles deep along y, plots 2 to 4 tiles long along x; a ridge along x or along y; clay pantiles or slate. */
function roof(x: number, y: number, px: number, py: number, back: number, slate: readonly RGB[] = GW_SLATE): RGB {
  const RY = 2.5;
  const j = Math.floor(y / RY);
  const len = 2 + Math.floor(hash(j, 0, 1901) * 3);
  const off = hash(j, 1, 1901) * len;
  const i = Math.floor((x + off) / len);
  const lx = (x + off) / len - i; // 0..1 across the plot along x
  const ly = y / RY - j; // 0..1 across it along y
  const h0 = hash(i, j, 1902);
  const clay = h0 < 0.64;
  const R = clay ? GW_CLAY : slate;
  const ridgeY = h0 > 0.78 || (h0 > 0.4 && h0 < 0.48);
  // the slope: which way it faces (to the light, the upper left, lightest; to the lower right darkest), and
  // which way is down it on the picture's own grid
  let lit: number;
  let t: number; // 0 at the eave, 1 at the ridge
  let downLow: boolean;
  // (the ridge set back from the middle, so the slope toward the eye shows the wider, as it would)
  const RG = 0.42;
  if (ridgeY) {
    lit = lx < RG ? 3 : 1;
    t = lx < RG ? lx / RG : (1 - lx) / (1 - RG);
    downLow = lx < RG;
  } else {
    lit = ly < RG ? 1 : 3;
    t = ly < RG ? ly / RG : (1 - ly) / (1 - RG);
    downLow = ly < RG;
  }
  // the courses, parallel to the ridge; along each, its tiles, every other course set over by half a tile
  const U = ridgeY ? alongY(px, py) : alongX(px, py);
  const V = ridgeY ? alongX(px, py) : alongY(px, py);
  const CR = 8;
  const course = Math.floor(V / CR);
  const cv = mod(V, CR);
  const TW = clay ? 10 : 13;
  const su = U + (course & 1) * (TW >> 1);
  const tu = mod(su, TW);
  let k = lit;
  const tv = hash(Math.floor(su / TW), course, 1905 + i * 7 + j * 131);
  if (tv < 0.14) k -= 1;
  else if (tv > 0.92) k += 1;
  if (clay) {
    // a pantile is a curve: its crown in the light, its trough in shade
    if (tu < 3) k += 1;
    else if (tu >= TW - 3) k -= 1;
  } else {
    // a slate: flat, its edge a crisp line; a slate a shade lighter or darker than the next now and then
    if (tu === 0) k = lit - 1;
    else if (tv > 0.5 && tv < 0.62) k = lit + 1;
    else k = lit;
  }
  // each course's lower edge lies over the next: a lit lip, the shadow under it
  const lip = downLow ? cv === 1 : cv === CR - 2;
  const under = downLow ? cv === 0 : cv === CR - 1;
  if (under) k = lit - 2;
  else if (lip) k = Math.max(k, lit + 1);
  let c = R[Math.max(0, Math.min(4, k))];
  // the ridge's capping, lit; the eaves and the gutters between plots, dark, a lit edge on their uphill side
  if (t > 0.94) c = R[4];
  else if (t > 0.9 && lit < 3) c = R[0];
  const edgeX = Math.min(lx, 1 - lx) * len;
  const edgeY = Math.min(ly, 1 - ly) * RY;
  if (edgeX < 0.05 || edgeY < 0.05) c = R[0];
  else if (edgeX < 0.09 || edgeY < 0.09) c = R[Math.min(4, lit + 1)];
  // moss and the dusk's soot in slow patches; a tile slipped here and there
  const m = fbm(x * 0.8 + 3, y * 0.8, 1903);
  if (m > 0.68) c = mixc(c, [60, 66, 48], 0.32);
  if (hash(Math.floor(su / TW), course, 1904 + i) < 0.008) c = GW_DEEP;
  // the dark of the city beyond: the tops far from any street fall a little toward the deep dark
  if (back > 0.7) c = mixc(c, GW_DEEP, (0.14 * (back - 0.7)) / 0.3);
  return c;
}

/** A near house's wall, in shadow, cut down (his rule for near cliffs, the city's way): faint courses of stone, the eave's line at its top. */
function nearHouse(v: number, px: number): RGB {
  const S = GW_STONE[2];
  const course = Math.floor(v / 9);
  const bu = mod(px + course * 9, 19);
  let c = mixc(mod(v, 9) === 8 || bu === 0 ? S[3] : S[2], GW_DEEP, 0.55);
  if (v <= 2) c = mixc(S[3], GW_DEEP, 0.65);
  if (v >= 38) c = mixc(GW_CLAY[1], GW_DEEP, 0.25); // the eave's line along its top
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

export function gateWardLook(land: GateWardLand, mode: 'open' | 'closed' = 'open'): TerrainLook {
  const f = gateWardPaintFloor(land, mode);
  const houses = land.houses ?? [];
  const dist = wallDistance(land.floor);
  const zoneOf = (x: number, y: number): number => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return -1;
    if (f.tiles[ty * f.w + tx] !== T_FLOOR) return -1;
    const hi = houseOf(houses, tx, ty);
    if (hi >= 0) return inRoom(houses[hi], tx, ty) || inDoor(houses[hi], tx, ty) ? GW_ZONE.Room : -2; // -2: its front, cut down
    return land.zone ? land.zone(tx, ty) : GW_ZONE.Street;
  };
  const squareAt = (x: number, y: number): { x: number; y: number; r: number } | null => {
    let best: { x: number; y: number; r: number } | null = null;
    let bd = Infinity;
    for (const s of land.squares ?? []) {
      const d = Math.hypot(x - s.x, y - s.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  };
  // (THE LOOK OF 20 OCT, behind `fresh`: the slate set apart from the street)
  const slate = land.fresh ? GW_SLATE_FRESH : GW_SLATE;
  return quietLook({
    rise: GW_RISE,
    near: 40,
    // the edges straight, as houses are: a corner rounded by a few pixels, never ragged
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 111,
    floor: (x, y, px, py) => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const z = zoneOf(x, y);
      if (z === -2) {
        // a house's front cut down (seen from inside): its street toward the eye
        const hi = houseOf(houses, tx, ty);
        const alongXWall = houses[hi].front.along === 'x';
        const d = alongXWall ? 32 * (ty + 1 - y) : 32 * (tx + 1 - x);
        return cutStub(d, px, py, alongXWall);
      }
      const wall = dist(x, y);
      if (z === GW_ZONE.Room) return boards(x, y, px, py, wall);
      const left = leavings(x, y, px, py, wall, land.swept);
      if (left) return left;
      if (z === GW_ZONE.Square) return wall < 0.5 ? kerb(x, y, px, py, wall) : square(x, y, px, py, wall, squareAt(x, y));
      return wall < 0.42 ? kerb(x, y, px, py, wall) : setts(x, y, px, py, wall);
    },
    face: (shade, v, px, py, x, y) => {
      // a house walked into, whole (its shell): one house along its front, its doorway open
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const hi = mode === 'closed' ? houseOf(houses, tx, ty) : -1;
      if (hi >= 0) {
        const h = houses[hi];
        // its footprint's near edges: along x at y = ymax (its faces looking to the lower left), along y at x = xmax
        const ymax = h.front.along === 'x' ? h.front.at + 1 : h.room[3];
        const xmax = h.front.along === 'y' ? h.front.at + 1 : h.room[2];
        const lit = shade >= 0;
        const left = lit ? (h.room[0] - ymax) * 32 : (xmax - ymax) * 32;
        const wp = lit ? (xmax - h.room[0]) * 32 : (ymax - h.room[1]) * 32;
        const H = walkInHouse(hi, px - left, wp);
        if (inDoor(h, tx, ty)) {
          const d0 = h.front.door[0];
          const d1 = h.front.door[1];
          const along = h.front.along === 'x' ? x : y;
          const dw = (d1 - d0) * 32;
          const du = h.front.along === 'x' ? (along - d0) / (d1 - d0) : (d1 - along) / (d1 - d0);
          const c = doorway(du, v, px, shade, dw);
          if (c) return c;
        }
        return front(shade, v, px, py, H, slate);
      }
      // whose front: the tile the face looks onto (a lit face looks along +y, a shaded one along +x)
      const fx = shade < 0 ? x + 0.3 : x;
      const fy = shade < 0 ? y : y + 0.3;
      const z = zoneOf(fx, fy);
      if (z === GW_ZONE.Room) return inner(shade, v, px);
      return front(shade, v, px, py, undefined, slate);
    },
    top: (x, y, px, py, back) => roof(x, y, px, py, back, slate),
    nearFace: (v, px) => nearHouse(v, px),
    brow: (c) => mixc(c, [255, 226, 190], 0.28),
    foot: [0.4, 0.22],
    turnOver: 0.2,
    nearShadow: { reach: 1.1, dark: [0.3, 0.18] },
  });
}

/**
 * COLOUR 4, A STEP QUIETER THAN ANY WORD: every colour the ground puts down quietened to under the dullest word's
 * (art/act2_quiet.ts), its hue and brightness kept; a lit window's candlelight, an honest light, left as it is.
 */
function quietLook(L: TerrainLook): TerrainLook {
  const lit = new Set(GW_GLASS.slice(2).map((c) => c.join(',')));
  const q = (c: RGB): RGB => (lit.has(c.map(Math.round).join(',')) ? c : quietRGB(c));
  return {
    ...L,
    floor: (x, y, px, py, inside) => q(L.floor(x, y, px, py, inside)),
    face: (shade, v, px, py, x, y) => q(L.face(shade, v, px, py, x, y)),
    top: (x, y, px, py, back, climb) => q(L.top(x, y, px, py, back, climb)),
    nearFace: (v, px, py, x, y) => q(L.nearFace(v, px, py, x, y)),
    brow: (c, px, py) => q(L.brow(c, px, py)),
    ...(L.lip ? { lip: (c: RGB) => q(L.lip!(c)) } : {}),
    ...(L.hang ? { hang: { ...L.hang, at: (v: number, px: number, py: number, shade: number) => q(L.hang!.at(v, px, py, shade)) } } : {}),
  };
}

// ---------------------------------------------------------------------------------------------------
// A HOUSE'S SHELL

export interface HouseShell {
  /** Its top left corner in the world's picture, and its size, in picture pixels. */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** Its pixels, RGBA: clear wherever the house whole and the house seen inside look the same. */
  rgba: Uint8ClampedArray<ArrayBuffer>;
}

/**
 * A HOUSE'S SHELL, to lay over the ground: what the house whole (`closed`, its look `gateWardLook(land,
 * 'closed')` on `gateWardPaintFloor(land, 'closed')`) shows that the ground (`open`) does not: its front, its
 * door, its roof. FOR THE MAIN CHAT: lay it over the ground and over whatever stands inside the house, under
 * whatever stands outside it; fade it to clear while the hero is in its room or its doorway (his word), and
 * back as he leaves. It lies only over the house's own tiles and the roof over them, so it hides nothing of the
 * street.
 */
export function houseShell(open: import('./terrain').Terrain, closed: import('./terrain').Terrain, h: GWHouse, paint: typeof import('./terrain').paintTerrain): HouseShell {
  const [rx0, ry0, rx1, ry1] = h.room;
  const x1 = h.front.along === 'y' ? Math.max(rx1, h.front.at + 1) : rx1;
  const y1 = h.front.along === 'x' ? Math.max(ry1, h.front.at + 1) : ry1;
  const R = GW_RISE;
  const px0 = Math.floor((rx0 - y1) * 32) - 2;
  const px1 = Math.ceil((x1 - ry0) * 32) + 2;
  const py0 = Math.floor((rx0 + ry0) * 16) - R - 4;
  const py1 = Math.ceil((x1 + y1) * 16) + 10;
  const w = px1 - px0;
  const hh = py1 - py0;
  const a = paint(open, px0, py0, w, hh);
  const b = paint(closed, px0, py0, w, hh);
  const rgba = new Uint8ClampedArray(w * hh * 4);
  // the house as it stands whole: every picture pixel over its tiles (room and front), up to its roof. What is
  // there shuts in whatever stands in the room, even where the house whole and the room open happen to paint
  // alike (a roof beside it, the same slate).
  const inHouse = (x: number, y: number): boolean => x >= rx0 && x < x1 && y >= ry0 && y < y1;
  const over = (px: number, py: number): boolean => {
    for (let t = 0; t <= R; t += 2) {
      const a2 = px / 32;
      const b2 = (py + t) / 16;
      if (inHouse((a2 + b2) / 2, (b2 - a2) / 2)) return true;
    }
    return false;
  };
  for (let i = 0; i < w * hh; i++) {
    const o = i * 4;
    const same = a.rgba[o] === b.rgba[o] && a.rgba[o + 1] === b.rgba[o + 1] && a.rgba[o + 2] === b.rgba[o + 2];
    if (same && !(b.rgba[o + 3] > 0 && over(px0 + (i % w) + 0.5, py0 + Math.floor(i / w) + 0.5))) continue;
    rgba[o] = b.rgba[o];
    rgba[o + 1] = b.rgba[o + 1];
    rgba[o + 2] = b.rgba[o + 2];
    rgba[o + 3] = 255;
  }
  return { x0: px0, y0: py0, w, h: hh, rgba };
}

/**
 * A HOUSE'S SHELL WHEN THE WALLS STAND WHOLE (render/act2_walls.ts ACT2_WALLS, on at his word): every picture pixel over its
 * tiles up to its roof, as the house whole paints it, and nothing else: so its roof stands over the street behind it too, as
 * every house's does, and it is seen through round whoever is behind it. Only the house whole is painted (the ground need not
 * be: what differs from it is all over the house's tiles), about half the time `houseShell` takes.
 */
export function houseShellWhole(closed: import('./terrain').Terrain, h: GWHouse, paint: typeof import('./terrain').paintTerrain): HouseShell {
  const [rx0, ry0, rx1, ry1] = h.room;
  const x1 = h.front.along === 'y' ? Math.max(rx1, h.front.at + 1) : rx1;
  const y1 = h.front.along === 'x' ? Math.max(ry1, h.front.at + 1) : ry1;
  const R = GW_RISE;
  const px0 = Math.floor((rx0 - y1) * 32) - 2;
  const px1 = Math.ceil((x1 - ry0) * 32) + 2;
  const py0 = Math.floor((rx0 + ry0) * 16) - R - 4;
  const py1 = Math.ceil((x1 + y1) * 16) + 10;
  const w = px1 - px0;
  const hh = py1 - py0;
  const b = paint(closed, px0, py0, w, hh);
  const rgba = new Uint8ClampedArray(w * hh * 4);
  for (let c = 0; c < w; c++) {
    // (down this column, where the house's tiles lie: its footprint is x in [rx0, x1), y in [ry0, y1); a pixel is over it if
    // the house, standing R up, comes between it and the eye)
    const a = (px0 + c + 0.5) / 32;
    const bLo = Math.max(2 * rx0 - a, 2 * ry0 + a);
    const bHi = Math.min(2 * x1 - a, 2 * y1 + a);
    if (bLo >= bHi) continue;
    const top = 16 * bLo - R;
    const foot = 16 * bHi;
    for (let r = 0; r < hh; r++) {
      const py = py0 + r + 0.5;
      if (py < top || py >= foot) continue;
      const o = (r * w + c) * 4;
      rgba[o] = b.rgba[o];
      rgba[o + 1] = b.rgba[o + 1];
      rgba[o + 2] = b.rgba[o + 2];
      rgba[o + 3] = 255;
    }
  }
  return { x0: px0, y0: py0, w, h: hh, rgba };
}
