// FLOOR 17, THE MASQUE: ITS GROUND (art/terrain.ts paints it from the level's own tiles). ACT 2, PART TWO, THE HIGH CITY.
// A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat; his "Yes, go
// (Recommended)"), level 17, THE MASQUE: "Into the palace, where the prince's masked ball has gone on for weeks."; its
// layout "indoors: a winding suite of seven great rooms, each in its own colour (blue, purple, green, orange, white,
// violet, and a black one lit red through its windows), with galleries, card rooms and servants' passages between.";
// its hazard "the great ebony clock in the black room"; its palette "Seven rooms of seven colours, candlelight, black
// velvet"; its story "The court dances while the city goes quiet" (as in "The Masque of the Red Death"). Its story from
// Edgar Allan Poe, "The Masque of the Red Death" (1842), drawn only from the tale:
// - the seven chambers, each hung and furnished in its colour, "The seventh apartment was closely shrouded in black velvet
//   tapestries that hung all over the ceiling and down the walls, falling in heavy folds upon a carpet of the same
//   material and hue. But in this chamber only, the color of the windows failed to correspond with the decorations. The
//   panes here were scarlet—a deep blood color.";
// - "To the right and left, in the middle of each wall, a tall and narrow Gothic window looked out upon a closed corridor
//   which pursued the windings of the suite. These windows were of stained glass whose color varied in accordance with
//   the prevailing hue of the decorations of the chamber into which it opened.";
// - no lamp or candle in the seven: "in the corridors that followed the suite, there stood, opposite to each window, a
//   heavy tripod, bearing a brazier of fire, that projected its rays through the tinted glass and so glaringly illumined
//   the room." So THE SEVEN ROOMS ARE LIT THROUGH THEIR WINDOWS: each window's light lies on the floor before it in the
//   room's own colour (the black room's red). The doc's candlelight is the galleries' and the card rooms' (the pieces,
//   art/floor17.ts).
//
// WHAT IT IS:
// - THE SEVEN ROOMS (`MQ_ZONE` Blue to Violet): a floor of polished marble in a checker of the room's own two marbles,
//   veined, a border of the darker one round the walls inside a fillet of gilt; on the walls a dado of the room's colour
//   in gilt-framed panels, then silk damask of the room's colour to a gilt cornice, and in the middle of each wall a tall,
//   narrow Gothic window of stained glass in its colour, leaded in diamonds, the brazier's fire behind it; its light lying
//   on the floor before it.
// - THE BLACK ROOM (`MQ_ZONE.Black`): black velvet in heavy folds from the dark above down the walls, falling onto a black
//   velvet carpet; its windows scarlet, the fire behind them; their light red on the folds near them and on the carpet.
// - A GALLERY: chevron parquet of oak, polished; pale stone walls in courses, pilasters with gilt capitals, a tall
//   round-headed recess in each bay.
// - A CARD ROOM: walnut parquet under a carpet of the court's own (a field of dull wine, a lattice of gilt, a border of
//   indigo); the walls panelled in walnut to the cornice, the mouldings gilt.
// - A SERVANTS' PASSAGE (the corridor behind the windows): cool grey flags, limewash on plaster over a dark skirting,
//   soot where the braziers' smoke has risen; cinders on the floor.
// - What lies about in the rooms where the ball goes on: the "golden ornaments that lay scattered to and fro" (spangles of
//   gilt), a ribbon come loose, a feather off a mask, drops of wine.
// - THE TOPS: the walls' thickness from above, a lit edge, then the dark over the rooms.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own
// palette (Colour 1); a step quieter than the figures (Places 2) and every colour under the dullest word's (Colour 4,
// art/act2_quiet.ts), the rooms' own colours too; NOTHING GLOWS but honest fire (Colour 3): the braziers' fire seen
// through the scarlet panes, an honest fire through red glass, is left bright; the six other windows' glass is lit by it
// but quiet; nothing cyan (the blue room's blue is a deep blue, its hue well past the hero's cyan; the green a leaf green
// short of it), no pink (the purple a royal purple short of it, the scarlet a blood red past it); solid, not flat (Places
// 4); crisp pixels.
//
// FOR THE MAIN CHAT: `masqueLook(land)` makes the look for a level from what only the level knows: its floor, and what each
// walkable tile is (`MQ_ZONE`). Edges straight, as walls are. It paints as floor 14's does (render/outdoor.ts, `landLook`);
// `masqueWindows(land)` says where it put each window (in the middle of every straight run of a far wall of the seven
// rooms, one more for every 4.5 tiles of it), so the game may give each its light over the dark.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise } from './terrain';
import { hash } from './kit';
import { bright, quietTerrain } from './act2_quiet';
import { COAL, EMBER } from './props';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (c: RGB): string => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
/** A colour from its hue (degrees), its share of full colour and its brightness. */
function hsvRGB(h: number, s: number, v: number): RGB {
  const f = (n: number): number => {
    const k = (n + h / 60) % 6;
    return v * (1 - s * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}
const ramp = (h: number, s: readonly number[], v: readonly number[]): RGB[] => v.map((vv, i) => hsvRGB(h, s[i] ?? s[s.length - 1], vv));
/** Over a threshold, with a checker of pixels where it is near it (crisp, never a smear). */
function over(t: number, thr: number, px: number, py: number, band = 0.02): boolean {
  if (t > thr + band) return true;
  if (t < thr - band) return false;
  return (t - thr + band) / (2 * band) > [[0.125, 0.625], [0.875, 0.375]][py & 1][px & 1];
}

// ---------------------------------------------------------------------------------------------------
// WHAT EACH WALKABLE TILE IS

export const MQ_ZONE = {
  /** The seven, in the tale's order from the east: */
  Blue: 0,
  Purple: 1,
  Green: 2,
  Orange: 3,
  White: 4,
  Violet: 5,
  /** The seventh, the westernmost: black velvet, its windows scarlet; the ebony clock stands in it (a piece). */
  Black: 6,
  /** A gallery between: chevron parquet, stone walls. */
  Gallery: 7,
  /** A card room: walnut, a carpet. */
  Cards: 8,
  /** A servants' passage, the closed corridor behind the windows: flags, limewash. */
  Passage: 9,
} as const;
/** Is a zone one of the seven rooms (the black among them)? */
export const isRoom = (z: number): boolean => z >= MQ_ZONE.Blue && z <= MQ_ZONE.Black;

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: seven rooms of seven colours, candlelight (gilt, the parquet's warmth), black velvet; every colour under
// the dullest word's (the dullest of the nine, leech, at 0.50 of full colour; these at 0.46 and under)

/** The deep, cool dark under everything. */
export const MQ_DEEP: RGB = hex('#08070c');

/** A room of the seven: its silk (seam, shade, body, light, sheen), its two marbles (shade, body, lit), its glass lit from behind (lead, dim, body, bright), its light on the floor. */
export interface RoomColours {
  name: string;
  silk: RGB[];
  dark: RGB[];
  pale: RGB[];
  glass: RGB[];
  light: RGB;
}
const ROOM = (name: string, h: number, o: { silkV?: number[]; silkS?: number[]; darkV?: number[]; darkS?: number; paleV?: number[]; paleS?: number; glassS?: number[]; glassV?: number[]; lightS?: number; lightV?: number } = {}): RoomColours => ({
  name,
  silk: ramp(h, o.silkS ?? [0.46, 0.46, 0.45, 0.42, 0.34], o.silkV ?? [0.11, 0.2, 0.3, 0.42, 0.55]),
  dark: ramp(h, [o.darkS ?? 0.42], o.darkV ?? [0.19, 0.25, 0.32]),
  pale: ramp(h, [o.paleS ?? 0.16], o.paleV ?? [0.47, 0.55, 0.63]),
  glass: ramp(h, o.glassS ?? [0.3, 0.44, 0.42, 0.3], o.glassV ?? [0.17, 0.52, 0.72, 0.92]),
  light: hsvRGB(h, o.lightS ?? 0.4, o.lightV ?? 0.82),
});
/**
 * THE SEVEN, in the tale's order: blue (a deep blue, its hue 222, far from the hero's cyan), purple (a royal purple, 286,
 * short of the enemy's pink), green (a leaf green, 136), orange (24), white (an ivory, barely coloured), violet (a blue
 * violet, 260, between the blue and the purple); and the black (its velvet a blue-black; its glass scarlet: MQ_SCARLET).
 */
export const MQ_ROOMS: readonly RoomColours[] = [
  ROOM('blue', 222),
  ROOM('purple', 286, { silkV: [0.12, 0.21, 0.31, 0.43, 0.56] }),
  ROOM('green', 136, { silkV: [0.1, 0.18, 0.27, 0.38, 0.5], darkV: [0.17, 0.23, 0.3] }),
  ROOM('orange', 24, { silkV: [0.15, 0.27, 0.4, 0.54, 0.68], darkV: [0.24, 0.32, 0.41], paleS: 0.2, paleV: [0.52, 0.6, 0.69], lightV: 0.86 }),
  ROOM('white', 40, { silkS: [0.12, 0.1, 0.08, 0.07, 0.05], silkV: [0.3, 0.47, 0.6, 0.72, 0.82], darkS: 0.07, darkV: [0.5, 0.58, 0.66], paleS: 0.04, paleV: [0.66, 0.74, 0.82], glassS: [0.12, 0.08, 0.06, 0.04], glassV: [0.22, 0.66, 0.82, 0.95], lightS: 0.07, lightV: 0.9 }),
  ROOM('violet', 260),
  ROOM('black', 268, { silkS: [0.3, 0.26, 0.22, 0.2, 0.18], silkV: [0.025, 0.05, 0.085, 0.13, 0.19], darkS: 0.22, darkV: [0.04, 0.07, 0.1], paleS: 0.2, paleV: [0.07, 0.1, 0.13], glassS: [0.8], glassV: [0.3], lightS: 0.46, lightV: 0.5 }),
];
/**
 * THE SCARLET PANES of the black room, "a deep blood color", the braziers' fire behind them: an honest fire through red
 * glass (Colour 3), left bright, in the honest fire's own colours (art/props.ts COAL and EMBER: the lead, the glass dim, its
 * body a deep blood red, lit, the fire through it), so that nothing that shades a face can take them toward pink.
 */
export const MQ_SCARLET: readonly string[] = [COAL[0], COAL[2], EMBER[0], COAL[3], EMBER[1]];
/** The fire seen through every window, at the heart of each: an honest fire's own. */
export const MQ_FIRE_CORE = EMBER[3];
bright(MQ_SCARLET, [MQ_FIRE_CORE]);
const SCARLET = MQ_SCARLET.map(hex);
const FIRE_CORE = hex(MQ_FIRE_CORE);
/** The red the scarlet windows throw on the velvet and the carpet: a light on things, quiet (never a glow). */
export const MQ_RED_LIGHT: RGB = hsvRGB(0, 0.46, 0.42);

/** GILT, dull candle gold (the mouldings, the cornices, the fillets): dark, shade, body, light, lit. */
export const MQ_GILT = ['#2c2214', '#4c3b20', '#72592e', '#977c44', '#bba266'].map(hex);
/** Pale stone (the windows' surrounds, the gallery's ashlar): joint, shade, body, light, lit. */
export const MQ_STONE = ['#2e2a30', '#5e5856', '#7a736c', '#958c82', '#b2a898'].map(hex);
/** THE GALLERY'S PARQUET, oak: the gap, shade, body, body, lit. */
export const MQ_OAK = ['#1a120d', '#3b2a1c', '#4a3524', '#58412c', '#6c5338'].map(hex);
/** THE CARD ROOMS' WALNUT (parquet, panelling): the gap, shade, body, body, lit. */
export const MQ_WALNUT = ['#140e0b', '#2c1f17', '#38281d', '#443124', '#583f2e'].map(hex);
/** THE CARD ROOMS' CARPET: the field, a dull wine (shade, body); the lattice of gilt; the border, indigo (shade, body); its fringe. */
export const MQ_CARPET = ['#3c1d1e', '#4c2526', '#7c6638', '#1c1e30', '#262a42', '#8a7f68'].map(hex);
/** THE PASSAGES' FLAGS, cool grey: the joint, shade, body, body, lit. */
export const MQ_FLAG = ['#25272b', '#45484c', '#515458', '#5c5f63', '#6e7175'].map(hex);
/** Limewash on the passages' plaster (lit, body, other, mottle); the skirting; soot. */
export const MQ_WASH = ['#8f8e86', '#7c7b74', '#706f69', '#5f5e59'].map(hex);
export const MQ_SKIRT = ['#1e1d1f', '#2c2a2c', '#403c3a'].map(hex);
export const MQ_SOOT = ['#2a2828', '#3c3a39'].map(hex);
/** Cinders and ash from the braziers. */
export const MQ_ASH = ['#3a3534', '#58514c', '#151213'].map(hex);
/** What lies about: wine (body, its sheen); a ribbon's silk (lit, shade); a feather off a mask (lit, shade). */
export const MQ_WINE = ['#2c1018', '#4a2230'].map(hex);
export const MQ_RIBBON = ['#b4ab98', '#867e6e'].map(hex);
export const MQ_FEATHER = ['#c8c2b4', '#8e887c'].map(hex);

// ---------------------------------------------------------------------------------------------------
// THE MEASURES

/** How tall the walls stand over the floor (picture pixels): the palace's rooms, tall; the wall fading into the dark above MQ_FADE. */
export const MQ_RISE = 128;
export const MQ_FADE = 104;
/** The dado's rail (the seven rooms); the cornice. */
export const MQ_DADO = 22;
export const MQ_CORNICE = 100;
/** THE WINDOWS (picture pixels): the glass's half width, its sill, where its pointed head springs, its point; the arcs' radius. */
export const WIN = { hw: 9, sill: 24, spring: 80, apex: 97, r: 22, reveal: 3 } as const;
/** How far into a room a window's light lies on the floor (tiles). */
export const WIN_REACH = 2.5;

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

export interface MasqueLand {
  /** The level's tiles, as the game walks them. */
  floor: Floor;
  /** What a walkable tile is (MQ_ZONE); a passage where not said. */
  zone?: (tx: number, ty: number) => number;
  /** Whether the windows' light lies on the floor before them (where not said, it does; the checks paint it without, to see it). */
  windowLight?: boolean;
}

/** A WINDOW of the seven rooms: the middle of its foot on the wall's line (world), which face it is in (0: a wall along x, its face turned to the screen's left; 1: along y, to the right), its room, the middle of it across the picture. */
export interface MasqueWindow {
  x: number;
  y: number;
  face: 0 | 1;
  zone: number;
  /** Its middle across the world's picture (picture pixels). */
  px: number;
  /** The glass at its brightest, and its light (hex): the game's to draw over the dark if it will. */
  glass: string;
  light: string;
}

interface Built {
  inMap: (tx: number, ty: number) => boolean;
  isFloor: (tx: number, ty: number) => boolean;
  zoneAt: (tx: number, ty: number) => number;
  windows: MasqueWindow[];
  /** The windows on a wall's line: key face * 1e6 + line. */
  byLine: Map<number, MasqueWindow[]>;
  /** The windows whose light may reach a tile. */
  reach: Map<number, MasqueWindow[]>;
}
const lineKey = (face: number, line: number): number => face * 1e6 + (line + 5000);

function build(land: MasqueLand): Built {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const zoneAt = (tx: number, ty: number): number => (land.zone && isFloor(tx, ty) ? land.zone(tx, ty) : MQ_ZONE.Passage);
  const windows: MasqueWindow[] = [];
  const byLine = new Map<number, MasqueWindow[]>();
  const add = (w: MasqueWindow, line: number): void => {
    windows.push(w);
    const k = lineKey(w.face, line);
    const l = byLine.get(k);
    if (l) l.push(w);
    else byLine.set(k, [w]);
  };
  const colours = (z: number): { glass: string; light: string } => (z === MQ_ZONE.Black ? { glass: MQ_SCARLET[3], light: toHex(MQ_RED_LIGHT) } : { glass: toHex(MQ_ROOMS[z].glass[3]), light: toHex(MQ_ROOMS[z].light) });
  // IN THE MIDDLE OF EACH WALL: every straight run of a far wall of one of the seven rooms (a wall behind a row of the room's
  // floor), its window in its middle, and one more for every 4.5 tiles of it, spread evenly
  const place = (a: number, n: number, z: number, at: (u: number) => MasqueWindow, line: number): void => {
    if (n < 3) return;
    const m = Math.max(1, Math.round(n / 4.5));
    for (let i = 0; i < m; i++) {
      const w = at(a + (n * (i + 0.5)) / m);
      if (seen(w)) add(w, line);
    }
  };
  // only where the wall's face stands whole to the window's head: no floor behind it within its height (the game cuts a
  // wall away where it would stand over the floor, and with it what is on it)
  const seen = (w: MasqueWindow): boolean => {
    const up = (WIN.apex + WIN.reveal + 4) / 32;
    for (const s of [-0.4, 0, 0.4]) {
      for (let t = 0; t <= up; t += 0.08) {
        const x = w.face === 0 ? w.x + s - t : w.x - 0.02 - t;
        const y = w.face === 0 ? w.y - 0.02 - t : w.y + s - t;
        if (isFloor(Math.floor(x), Math.floor(y))) return false;
      }
    }
    return true;
  };
  // along x: a row ty of the room's floor with wall all along behind it (ty - 1)
  for (let ty = 1; ty < f.h; ty++) {
    let a = -1;
    let z0 = -1;
    for (let tx = 0; tx <= f.w; tx++) {
      const ok = tx < f.w && isFloor(tx, ty) && !isFloor(tx, ty - 1) && isRoom(zoneAt(tx, ty));
      const z = ok ? zoneAt(tx, ty) : -1;
      if (ok && a >= 0 && z === z0) continue;
      if (a >= 0) {
        const n = tx - a;
        const zz = z0;
        place(a, n, zz, (u) => ({ x: u, y: ty, face: 0, zone: zz, px: (u - ty) * 32, ...colours(zz) }), ty);
      }
      a = ok ? tx : -1;
      z0 = z;
    }
  }
  // along y: a column tx of the room's floor with wall all along behind it (tx - 1)
  for (let tx = 1; tx < f.w; tx++) {
    let a = -1;
    let z0 = -1;
    for (let ty = 0; ty <= f.h; ty++) {
      const ok = ty < f.h && isFloor(tx, ty) && !isFloor(tx - 1, ty) && isRoom(zoneAt(tx, ty));
      const z = ok ? zoneAt(tx, ty) : -1;
      if (ok && a >= 0 && z === z0) continue;
      if (a >= 0) {
        const n = ty - a;
        const zz = z0;
        place(a, n, zz, (u) => ({ x: tx, y: u, face: 1, zone: zz, px: (tx - u) * 32, ...colours(zz) }), tx);
      }
      a = ok ? ty : -1;
      z0 = z;
    }
  }
  // the tiles each window's light may reach
  const reach = new Map<number, MasqueWindow[]>();
  for (const w of windows) {
    const R = Math.ceil(WIN_REACH) + 1;
    for (let d = 0; d < R; d++) {
      for (let s = -2; s <= 2; s++) {
        const tx = w.face === 0 ? Math.floor(w.x) + s : Math.floor(w.x) + d;
        const ty = w.face === 0 ? Math.floor(w.y) + d : Math.floor(w.y) + s;
        if (!isFloor(tx, ty)) continue;
        const k = ty * f.w + tx;
        const l = reach.get(k);
        if (l) l.push(w);
        else reach.set(k, [w]);
      }
    }
  }
  return { inMap, isFloor, zoneAt, windows, byLine, reach };
}

/** WHERE THE GROUND PUTS ITS WINDOWS, for a level: in the middle of every straight run of a far wall of the seven rooms (more on a long one). */
export function masqueWindows(land: MasqueLand): MasqueWindow[] {
  return build(land).windows;
}

/** How far a place is from the nearest tile that is not `inside` (tiles), exactly within two tiles of it (past that, 2.5). */
function distanceOut(inside: (tx: number, ty: number) => boolean): (x: number, y: number) => number {
  return (x, y) => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    let d = 2.5;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const X = tx + dx;
        const Y = ty + dy;
        if (inside(X, Y)) continue;
        const ex = x < X ? X - x : x > X + 1 ? x - X - 1 : 0;
        const ey = y < Y ? Y - y : y > Y + 1 ? y - Y - 1 : 0;
        d = Math.min(d, Math.hypot(ex, ey));
      }
    }
    return d;
  };
}

// ---------------------------------------------------------------------------------------------------
// THE FLOOR

/**
 * THE SEVEN ROOMS' MARBLE, polished, veined, half a tile to a slab: the blue, the green and the white rooms' a checker of
 * their two marbles; the purple, the orange and the violet rooms' pale octagons with a small square of the dark one where
 * four meet. Round the room's edge (`edge`: how far in from its walls and its doorways), a border of the dark marble in
 * long slabs inside a fillet of gilt.
 */
function marble(R: RoomColours, zone: number, x: number, y: number, px: number, py: number, edge: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 32;
  const i = Math.floor(U / S);
  const j = Math.floor(V / S);
  const u = mod(U, S);
  const v = mod(V, S);
  // the border: the dark marble, in long slabs; its fillet of gilt
  if (edge < 0.42) {
    const h0 = hash(Math.floor((U + V) / 90), 0, 1711);
    let c = R.dark[h0 < 0.3 ? 0 : 1];
    if (vnoise(x * 2.6, y * 2.6, 1713) > 0.78) c = R.dark[2];
    if (mod(U + V, 90) < 2) c = mixc(R.dark[0], MQ_DEEP, 0.3);
    return c;
  }
  if (edge < 0.5) return edge < 0.45 ? MQ_GILT[3] : MQ_GILT[1];
  const octagons = zone === MQ_ZONE.Purple || zone === MQ_ZONE.Orange || zone === MQ_ZONE.Violet;
  let dark: boolean;
  let joint: boolean;
  if (octagons) {
    // where four octagons meet: a small square of the dark marble (turned to the grid), a joint round it
    const du = Math.min(u, S - u);
    const dv = Math.min(v, S - v);
    const r = du + dv;
    dark = r < 9;
    joint = (r >= 9 && r < 10.5) || (!dark && (u < 2 || v < 2) && r > 10.5);
  } else {
    dark = ((i + j) & 1) === 1;
    joint = u < 2 || v < 2;
  }
  const h0 = hash(i, j, 1715);
  const M = dark ? R.dark : R.pale;
  let k = h0 < 0.25 ? 0 : h0 > 0.8 ? 2 : 1;
  // the veins, wandering across the slab
  const vein = vnoise(x * 2.2 + i * 1.7, y * 2.2 - j * 0.9, 1717 + (dark ? 1 : 0)) + 0.35 * vnoise(x * 6, y * 6, 1719);
  if (Math.abs(vein - 0.78) < 0.025) k = dark ? 2 : 0;
  let c = M[k];
  // polished: the joint a step darker; a slab's edge toward the light catching it
  if (joint) c = mixc(R.dark[0], MQ_DEEP, 0.2);
  else if (!dark && (v < 4 || u < 4) && hash(i, j, 1721) > 0.4) c = mixc(M[2], [255, 255, 255], 0.12);
  return c;
}
/** THE BLACK ROOM'S CARPET of black velvet: its nap brushed in long soft strokes, a sheen along them; darker where the hangings fall onto it. */
function velvetCarpet(x: number, y: number, px: number, py: number, wall: number): RGB {
  const V = MQ_ROOMS[MQ_ZONE.Black].silk;
  // the nap brushed in long soft strokes, a sheen along them; the pile's grain, fine
  const stroke = vnoise(x * 0.45, y * 3.4, 1733) + 0.25 * vnoise(x * 1.1, y * 7, 1734);
  let k = over(stroke, 0.78, px, py, 0.04) ? 3 : 2;
  if (hash(px >> 1, py, 1731) < 0.22) k -= 1;
  // where the hangings fall onto it from the walls, darker
  if (wall < 0.24) k = Math.max(0, k - 2);
  else if (wall < 0.45) k = Math.max(0, k - 1);
  return V[k];
}
/** THE GALLERY'S PARQUET: oak in chevrons, rows along x, each block its own tone; polished, worn paler down the middle. */
function chevron(x: number, y: number, px: number, py: number, wall: number, P: readonly RGB[], seed: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const B = 14;
  const L = 40;
  const j = Math.floor(V / B);
  const dv = V - j * B;
  const s = j & 1 ? 1 : -1;
  const a = U + s * dv * 1.4;
  const i = Math.floor(a / L);
  const u = mod(a, L);
  const h0 = hash(i, j, seed);
  let t = h0 > 0.7 ? 3 : h0 < 0.25 ? 1 : 2;
  if (wall > 1.2 && vnoise(x * 0.5, y * 0.5, seed + 1) > 0.5) t = Math.min(4, t + 1);
  let c = P[t];
  if (dv < 2 || u < 2) c = P[0];
  else if (dv < 3.5 && t < 4) c = mixc(c, P[Math.min(4, t + 1)], 0.5);
  if (wall < 0.3 + 0.12 * vnoise(x * 2.2, y * 2.2, seed + 2)) c = mixc(c, MQ_DEEP, 0.25);
  return c;
}
/** THE CARD ROOM'S CARPET, a tile and more in from its walls: a border of indigo with a running lozenge of gilt; a field of dull wine in a lattice of gilt; a fringe at its edge. Null off it. */
function carpet(x: number, y: number, px: number, py: number, wall: number): RGB | null {
  const IN = 1.05;
  if (wall < IN) return null;
  if (wall < IN + 0.07) return (px + py) & 1 ? MQ_CARPET[5] : null;
  const U = alongX(px, py);
  const V = alongY(px, py);
  if (wall < IN + 0.4) {
    // the border: indigo, a running lozenge of gilt along it
    const t = (wall - IN - 0.07) / 0.33;
    if (t < 0.1 || t > 0.9) return MQ_CARPET[2];
    const run = mod(U + V, 24) - 12;
    const lz = Math.abs(run) * 0.06 + Math.abs(t - 0.5);
    if (lz < 0.28 && lz > 0.18) return MQ_CARPET[2];
    return hash(px >> 1, py, 1741) < 0.2 ? MQ_CARPET[3] : MQ_CARPET[4];
  }
  // the field: a lattice of gilt along the floor's lines (lozenges, as the eye has them) on the wine, a flower of indigo where its lines cross
  const a = mod(U, 48) - 24;
  const b = mod(V, 48) - 24;
  const m = Math.max(Math.abs(a), Math.abs(b));
  if (m < 6) return m < 3 ? MQ_CARPET[2] : MQ_CARPET[4];
  if (Math.abs(Math.abs(a) - 24) < 1.6 || Math.abs(Math.abs(b) - 24) < 1.6) return MQ_CARPET[2];
  // worn where the players' chairs have dragged
  const worn = fbm(x * 1.4, y * 1.4, 1743);
  return worn > 0.7 && hash(px >> 1, py, 1745) < 0.5 ? MQ_CARPET[0] : MQ_CARPET[1];
}
/** THE PASSAGES' FLAGS: slabs in rows along x, cool grey, worn hollow down the middle; cinders and ash from the braziers. */
function flags(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SV = 30;
  const j = Math.floor(V / SV);
  const len = 40 + Math.floor(hash(j, 0, 1751) * 3) * 8;
  const off = Math.floor(hash(j, 1, 1751) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const v = mod(V, SV);
  const h0 = hash(i, j, 1752);
  let t = h0 > 0.7 ? 3 : h0 < 0.25 ? 1 : 2;
  if (wall > 0.9 && vnoise(x * 0.45, y * 0.45, 1753) > 0.5) t = Math.min(4, t + 1);
  let c = MQ_FLAG[t];
  if (u < 2 || v < 2) c = MQ_FLAG[0];
  else if (u < 3 || v < 3) c = MQ_FLAG[Math.min(4, t + 1)];
  // cinders and ash fallen from the braziers, along the walls
  const ash = fbm(x * 1.3 + 4, y * 1.3, 1755);
  if (wall < 0.9 && ash > 0.6) {
    const g = hash(px >> 1, py, 1757);
    if (g < (ash - 0.6) * 2.4) c = g < 0.04 ? MQ_ASH[2] : g < 0.2 ? MQ_ASH[1] : MQ_ASH[0];
  }
  if (wall < 0.3 + 0.15 * vnoise(x * 2.2, y * 2.2, 1759)) c = mixc(c, MQ_DEEP, 0.28);
  return c;
}

/** What lies about where the ball goes on: spangles of gilt (the tale's "golden ornaments that lay scattered to and fro"), a ribbon come loose, a feather off a mask, drops of wine. Null where nothing. */
function litter(x: number, y: number, px: number, py: number, zone: number): RGB | null {
  if (zone === MQ_ZONE.Black || zone === MQ_ZONE.Passage) return null;
  // (in drifts where the dancing was, not all over)
  const drift = vnoise(x * 0.35 + 3, y * 0.35, 1761 + zone) > 0.55 ? 1 : 0.25;
  // SPANGLES OF GILT, a pixel or two, lit
  const gx = Math.floor(px / 7);
  const gy = Math.floor(py / 5);
  if (hash(gx, gy, 1763) < 0.022 * drift) {
    const ax = gx * 7 + 2 + Math.floor(hash(gx, gy, 1764) * 3);
    const ay = gy * 5 + 2;
    if (py === ay && (px === ax || px === ax + 1)) return px === ax ? MQ_GILT[4] : MQ_GILT[2];
  }
  // A RIBBON come loose, in a loose curl
  const bx = Math.floor(px / 31);
  const by = Math.floor(py / 17);
  if (hash(bx, by, 1771 + zone) < 0.035 * drift) {
    const ax = bx * 31 + 4 + Math.floor(hash(bx, by, 1772) * 10);
    const ay = by * 17 + 5 + Math.floor(hash(bx, by, 1773) * 5);
    const dx = px - ax;
    if (dx >= 0 && dx < 15) {
      const wave = Math.round(2.2 * Math.sin(dx * 0.5 + hash(bx, by, 1774) * 6));
      const dy = py - ay - wave;
      if (dy === 0) return MQ_RIBBON[dx % 5 === 0 ? 1 : 0];
      if (dy === 1 && dx > 0 && dx < 14) return mixc(MQ_RIBBON[1], MQ_DEEP, 0.4);
    }
  }
  // A FEATHER off a mask: a quill, its vane either side
  const fx = Math.floor(px / 37);
  const fy = Math.floor(py / 21);
  if (hash(fx, fy, 1781 + zone) < 0.03 * drift) {
    const ax = fx * 37 + 6 + Math.floor(hash(fx, fy, 1782) * 14);
    const ay = fy * 21 + 6 + Math.floor(hash(fx, fy, 1783) * 6);
    const dx = px - ax;
    const dy = py - ay;
    if (dx >= 0 && dx < 11) {
      const mid = Math.round(dx * 0.35);
      if (dy === mid) return dx < 2 ? MQ_FEATHER[1] : MQ_FEATHER[0];
      if ((dy === mid - 1 && dx > 1 && dx < 10) || (dy === mid + 1 && dx > 2 && dx < 9)) return dy < mid ? MQ_FEATHER[0] : MQ_FEATHER[1];
    }
  }
  // DROPS OF WINE spilled
  const wx = Math.floor(px / 9);
  const wy = Math.floor(py / 6);
  if (hash(wx, wy, 1791 + zone) < 0.01 * drift) {
    const ax = wx * 9 + 3;
    const ay = wy * 6 + 2;
    const dx = px - ax;
    const dy = py - ay;
    if (dx * dx + 3 * dy * dy <= 3) return dx < 0 && dy < 0 ? MQ_WINE[1] : MQ_WINE[0];
  }
  return null;
}

/**
 * A WINDOW'S LIGHT on the floor before it: the window's own shape thrown long across the floor, out from the wall, wider
 * as it goes, its pointed head farthest out; brightest nearest the wall, fading as it goes. 0 none, up to 1.
 */
function windowLightAt(w: MasqueWindow, x: number, y: number): number {
  const d = w.face === 0 ? y - w.y : x - w.x;
  const D0 = 0.18;
  if (d < D0 || d > WIN_REACH) return 0;
  const along = (d - D0) / (WIN_REACH - D0);
  // the glass's height that throws its light this far out: its sill nearest the wall, its point farthest
  const v = WIN.sill + along * (WIN.apex - WIN.sill);
  const proj = w.face === 0 ? (x - w.y) * 32 : (w.x - y) * 32;
  const spread = 1 + 0.9 * along;
  const q = Math.abs(proj - w.px) / spread;
  const hw = glassHalf(v);
  if (hw < 0) return 0;
  const inside = (hw + 2 - q) / 4;
  if (inside <= 0) return 0;
  return Math.min(1, inside) * (1 - 0.65 * along);
}

// ---------------------------------------------------------------------------------------------------
// THE WALLS

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);
/** A tone of a ramp a face turned so: lit a step up, in shade a step down. */
const lit = (R: readonly RGB[], k: number, row: number): RGB => R[Math.max(0, Math.min(R.length - 1, k + (row === 0 ? 1 : row === 2 ? -1 : 0)))];

/** The bays along a wall: one every BAY picture pixels (the gallery's pilasters, the panelling). */
const BAY = 96;

/** THE WINDOW at picture pixel `px` of a face on its line, if there is one: its middle across, and its room. */
function windowOn(B: Built, face: number, line: number, px: number): MasqueWindow | null {
  const l = B.byLine.get(lineKey(face, line));
  if (!l) return null;
  for (const w of l) if (Math.abs(px - w.px) <= WIN.hw + WIN.reveal + 1) return w;
  return null;
}

/** Half the glass's width `v` up the wall (its pointed head two arcs meeting at the apex); -1 above it. */
function glassHalf(v: number): number {
  if (v < WIN.spring) return WIN.hw;
  const dv = v - WIN.spring;
  if (dv >= WIN.r) return -1;
  const x = -(WIN.r - WIN.hw) + Math.sqrt(WIN.r * WIN.r - dv * dv);
  return x;
}

/**
 * A TALL, NARROW GOTHIC WINDOW at `du` across from its middle and `v` up: its surround of stone (lit inside on the left,
 * in shade on the right, its sill lit), its glass leaded in diamonds, lit from behind by the brazier's fire, brightest
 * low in its middle where the fire is (an orange heart through the glass), dimmer up into its head. Null off it.
 */
function windowAt(zone: number, du: number, v: number, row: number): RGB | null {
  const black = zone === MQ_ZONE.Black;
  const hwv = glassHalf(v);
  const top = WIN.apex;
  if (v < WIN.sill - 3 || v > top + WIN.reveal) return null;
  // the surround of stone (and, under the glass, the sill)
  const inGlass = v >= WIN.sill && hwv >= 0 && Math.abs(du) < hwv;
  if (!inGlass) {
    const outer = v < WIN.sill ? WIN.hw + WIN.reveal : glassHalf(Math.min(v, top)) + WIN.reveal;
    const within = v < WIN.sill ? Math.abs(du) <= outer + 1 : (glassHalf(v - WIN.reveal) >= 0 && Math.abs(du) <= glassHalf(v - WIN.reveal) + WIN.reveal) || (v <= WIN.spring && Math.abs(du) <= outer);
    if (!within) return null;
    if (v < WIN.sill) return v === WIN.sill - 1 ? lit(MQ_STONE, 3, row) : v === WIN.sill - 3 ? MQ_STONE[0] : lit(MQ_STONE, 2, row);
    // the reveal: the stone's depth, the left side lit, the right in shade; a moulding of gilt at its outer edge
    const edge = Math.abs(du) - (v <= WIN.spring ? WIN.hw : glassHalf(Math.min(v, top - 1)));
    if (edge > WIN.reveal - 1) return lit(MQ_GILT, 2, row);
    return du < 0 ? lit(MQ_STONE, 3, row) : lit(MQ_STONE, 1, row);
  }
  // the glass, leaded in diamonds
  const dv = v - WIN.sill;
  const G = black ? SCARLET : MQ_ROOMS[zone].glass;
  if (mod(du + dv + 40, 6) === 0 || mod(du - dv + 40, 6) === 0) return black ? SCARLET[0] : G[0];
  // the fire behind it: brightest low in its middle
  const fy = (dv - 18) / 14;
  const fx = du / 5.5;
  const heat = 1 - Math.hypot(fx, fy);
  if (heat > 0.6) return FIRE_CORE;
  if (black) return heat > 0.15 ? SCARLET[4] : heat > -0.5 ? SCARLET[3] : v > WIN.spring + 4 ? SCARLET[1] : SCARLET[2];
  if (heat > 0.15) return G[3];
  return v > WIN.spring + 6 ? G[1] : G[2];
}

/** DAMASK: a tone-on-tone ogee lattice with a flower in each, woven in the silk (1 where the figure is). */
function damask(px: number, v: number): number {
  const CW = 16;
  const CH = 24;
  const row = Math.floor(v / CH);
  const lx = mod(px + (row & 1) * (CW / 2), CW) - CW / 2;
  const ly = mod(v, CH) - CH / 2;
  const curve = 6.6 * Math.abs(Math.sin((Math.PI * (ly + CH / 2)) / CH));
  if (Math.abs(Math.abs(lx) - curve) < 0.75) return 1;
  // the flower: a little upright bud
  if (Math.abs(lx) + Math.abs(ly) * 0.55 < 2.2) return 1;
  return 0;
}

/**
 * THE WALLS OF THE SEVEN ROOMS: the skirting, the dado in the room's colour in gilt-framed panels, its rail, the silk
 * damask in panels between gilt fillets, the gilt cornice, then the dark above; the windows. The BLACK ROOM's: black
 * velvet in heavy folds from the dark above to the floor, the red of its windows on the folds near them.
 */
function roomFace(B: Built, zone: number, shade: number, v: number, px: number, x: number, y: number): RGB {
  const row = rowOf(shade);
  const R = MQ_ROOMS[zone];
  // which wall: along x (lit) or along y (in shade); its window
  const face = shade > 0.3 ? 0 : shade < -0.3 ? 1 : -1;
  const w = face < 0 ? null : windowOn(B, face, Math.round(face === 0 ? y : x), px);
  if (w) {
    const c = windowAt(zone, px - Math.round(w.px), v, row);
    if (c) return c;
  }
  if (zone === MQ_ZONE.Black) {
    // HEAVY FOLDS of velvet, from the dark above down to the floor, where they fall in a little onto the carpet: deep
    // hollows, narrow ridges catching what light there is, each fold its own width
    const V = R.silk;
    const wob = 1.4 * Math.sin(v * 0.04 + Math.floor(px / 40) * 1.7);
    const f = (px + wob) / 12 + 0.45 * vnoise(px / 21, 0.5, 1841);
    const s = Math.cos(f * Math.PI * 2);
    let k = s > 0.8 ? 3 : s > 0.35 ? 2 : s > -0.35 ? 1 : 0;
    if (s > 0.95 && row < 2) k = 4;
    if (row === 2) k = Math.max(0, k - 1);
    if (v < 4 && s < 0) k = 0;
    let c = V[k];
    // the red of a window near it caught on the folds' ridges
    if (w || face >= 0) {
      const near = face >= 0 ? (B.byLine.get(lineKey(face, Math.round(face === 0 ? y : x))) ?? []) : [];
      for (const ww of near) {
        const d = Math.abs(px - ww.px);
        if (d < 34 && s > 0.35 && v > 12 && v < WIN.apex + 10) {
          const t = d < 18 ? 0.55 : 0.32;
          c = mixc(c, MQ_RED_LIGHT, t * (s > 0.75 ? 1 : 0.6));
        }
      }
    }
    return c;
  }
  const S = R.silk;
  const G = MQ_GILT;
  // the skirting
  if (v < 3) return v === 2 ? lit(G, 2, row) : G[0];
  // the dado: panels of the room's colour framed in gilt
  if (v < MQ_DADO) {
    const pu = mod(px, 24);
    if (pu === 0 || v === 3) return S[0];
    if (pu === 2 || v === 5 || pu === 22 || v === MQ_DADO - 3) return pu === 22 || v === 5 ? lit(G, 1, row) : lit(G, 2, row);
    return lit(S, 1, row);
  }
  // its rail
  if (v < MQ_DADO + 3) return v === MQ_DADO + 2 ? lit(G, 3, row) : v === MQ_DADO ? G[1] : lit(G, 2, row);
  // the cornice: a stack of mouldings, gilt
  if (v >= MQ_CORNICE && v < MQ_CORNICE + 8) {
    const m = v - MQ_CORNICE;
    if (m === 0) return G[0];
    if (m === 3 && mod(px, 4) < 2) return lit(G, 3, row);
    if (m === 7) return lit(G, 4, row);
    return lit(G, m < 3 ? 1 : 2, row);
  }
  if (v >= MQ_CORNICE + 8) return mixc(lit(S, 0, row), MQ_DEEP, 0.3);
  // THE SILK: damask in the room's colour, in panels between fillets of gilt
  const pu = mod(px, BAY);
  if (pu < 2) return pu === 0 ? lit(G, 3, row) : G[1];
  const fig = damask(px, v);
  let c = fig ? lit(S, 3, row) : lit(S, 2, row);
  // the silk's sheen, in long soft folds down it
  const sheen = Math.cos(((px + 0.6 * Math.sin(v * 0.03)) / 37) * Math.PI * 2);
  if (sheen < -0.75) c = lit(S, fig ? 2 : 1, row);
  // darker just under the cornice and over the rail
  if (v > MQ_CORNICE - 3 || v < MQ_DADO + 5) c = mixc(c, MQ_DEEP, 0.25);
  return c;
}

/** THE GALLERY'S WALLS: pale stone in courses, a pilaster at each bay with its gilt capital, a tall round-headed recess between; a plinth. */
function galleryFace(v: number, px: number, shade: number): RGB {
  const row = rowOf(shade);
  const S = MQ_STONE;
  const pu = mod(px, BAY);
  // the plinth
  if (v < 8) return v === 7 ? lit(S, 3, row) : v < 2 ? S[0] : lit(S, 1, row);
  // the cornice
  if (v >= MQ_CORNICE && v < MQ_CORNICE + 6) return v === MQ_CORNICE + 5 ? lit(MQ_GILT, 3, row) : v === MQ_CORNICE ? S[0] : lit(S, 2, row);
  if (v >= MQ_CORNICE + 6) return mixc(lit(S, 1, row), MQ_DEEP, 0.4);
  // the pilaster: standing out of the wall, its left edge lit, its right in shade; its capital of gilt
  if (pu < 10) {
    if (v >= MQ_CORNICE - 9) return v === MQ_CORNICE - 1 ? lit(MQ_GILT, 4, row) : mod(px + v, 3) === 0 ? lit(MQ_GILT, 1, row) : lit(MQ_GILT, 2, row);
    if (pu === 0) return lit(S, 3, row);
    if (pu === 9) return S[0];
    // fluted
    return pu % 3 === 1 ? lit(S, 1, row) : lit(S, 2, row);
  }
  // the recess: round-headed, its inside in shadow
  const cu = pu - 10 - (BAY - 10) / 2;
  const hw = 15;
  const spring = 70;
  const inArch = v >= 10 && (v < spring ? Math.abs(cu) < hw : Math.hypot(cu, (v - spring) * 1.0) < hw);
  if (inArch) {
    const edge = v < spring ? hw - Math.abs(cu) : hw - Math.hypot(cu, v - spring);
    if (edge < 1.5) return cu < 0 ? lit(S, 3, row) : S[0];
    return cu < -hw + 4 ? lit(S, 0, row) : mixc(lit(S, 1, row), MQ_DEEP, 0.35);
  }
  // ashlar in courses, broken joint
  const course = Math.floor(v / 10);
  const ju = mod(px + (course & 1) * 13, 26);
  if (mod(v, 10) === 0 || ju === 0) return lit(S, 0, row);
  return lit(S, hash(Math.floor((px + (course & 1) * 13) / 26), course, 1801) < 0.3 ? 1 : 2, row);
}

/** THE CARD ROOM'S WALLS: walnut panelling to the cornice, its mouldings gilt; tall panels over short ones. */
function cardsFace(v: number, px: number, shade: number): RGB {
  const row = rowOf(shade);
  const W = MQ_WALNUT;
  const G = MQ_GILT;
  if (v < 3) return v === 2 ? lit(G, 2, row) : W[0];
  if (v >= MQ_CORNICE && v < MQ_CORNICE + 8) {
    const m = v - MQ_CORNICE;
    return m === 7 ? lit(G, 4, row) : m === 3 && mod(px, 4) < 2 ? lit(G, 3, row) : m === 0 ? W[0] : lit(W, 2, row);
  }
  if (v >= MQ_CORNICE + 8) return mixc(lit(W, 1, row), MQ_DEEP, 0.3);
  const pu = mod(px, 32);
  // the rails: low, at the dado, over the tall panels
  const rail = (v >= 3 && v < 6) || (v >= MQ_DADO && v < MQ_DADO + 4) || (v >= MQ_CORNICE - 6);
  if (rail || pu < 4) return v === MQ_DADO + 3 ? lit(G, 3, row) : pu === 0 ? W[0] : lit(W, 3, row);
  // the sunk panel, its moulding gilt along the top and left, dark along the bottom and right
  const top = v < MQ_DADO ? MQ_DADO - 1 : MQ_CORNICE - 7;
  const bot = v < MQ_DADO ? 6 : MQ_DADO + 4;
  if (pu === 4 || v === top) return lit(G, 2, row);
  if (pu === 31 || v === bot) return W[0];
  // the grain, running up the panel
  const grain = mod(px * 7 + Math.floor(v / 9), 11) === 0;
  return lit(W, grain ? 1 : 2, row);
}

/** THE PASSAGES' WALLS: limewash on plaster, mottled; a dark skirting; soot gone up the wall where the braziers stand. */
function passageFace(v: number, px: number, shade: number): RGB {
  const row = rowOf(shade);
  if (v < 5) return v === 4 ? MQ_SKIRT[2] : v === 0 ? MQ_SKIRT[1] : MQ_SKIRT[0];
  const m = vnoise(px * 0.09, v * 0.13, 1811) + 0.35 * vnoise(px * 0.4, v * 0.5, 1812);
  const W = MQ_WASH;
  let c = m > 0.95 ? W[0] : m > 0.62 ? W[1] : m > 0.35 ? W[2] : W[3];
  if (row === 0) c = mixc(c, W[0], 0.25);
  else if (row === 2) c = mixc(c, MQ_DEEP, 0.35);
  // soot gone up the wall in plumes
  const k = Math.floor(px / 70);
  if (hash(k, 0, 1813) < 0.5) {
    const cx = k * 70 + 20 + hash(k, 1, 1813) * 30;
    const wdt = 6 + v * 0.12;
    if (Math.abs(px - cx) < wdt && v > 30) c = mixc(c, MQ_SOOT[Math.abs(px - cx) < wdt * 0.5 ? 0 : 1], 0.55);
  }
  if (v >= MQ_CORNICE) c = mixc(c, MQ_DEEP, 0.3);
  return c;
}

/** THE TOP: the wall's thickness seen from above, its edge catching the light, then the dark over the rooms. */
function topAt(px: number, py: number, back: number): RGB {
  if (back < 0.05) return MQ_GILT[2];
  if (back < 0.09) return MQ_GILT[0];
  const r = hash(px >> 1, py, 1821);
  const c = r < 0.88 ? MQ_DEEP : mixc(MQ_DEEP, MQ_GILT[0], 0.3);
  return mixc(c, MQ_DEEP, cl01(back));
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

/** THE MASQUE'S LOOK, for a level's own tiles and what each walkable tile is. */
export function masqueLook(land: MasqueLand): TerrainLook {
  const B = build(land);
  /** How far from a wall; and how far in from the edge of the room itself (its walls and its doorways, where its floor gives way to another's). */
  const wall = distanceOut(B.isFloor);
  const edges = new Map<number, (x: number, y: number) => number>();
  const edgeOf = (z: number): ((x: number, y: number) => number) => {
    let e = edges.get(z);
    if (!e) edges.set(z, (e = distanceOut((tx, ty) => B.isFloor(tx, ty) && B.zoneAt(tx, ty) === z)));
    return e;
  };
  const W = land.floor.w;
  /** The room a wall's face looks into: the floor tile at its foot. */
  const roomOf = (shade: number, x: number, y: number): number => {
    const fx = shade < 0 ? x + 0.3 : x;
    const fy = shade < 0 ? y : y + 0.3;
    return B.zoneAt(Math.floor(fx), Math.floor(fy));
  };
  /** The room nearest a near wall's edge (just in from it, away from the eye). */
  const nearRoom = (x: number, y: number): number => {
    for (const [dx, dy] of [[-0.3, -0.3], [-0.3, 0], [0, -0.3]] as const) if (B.isFloor(Math.floor(x + dx), Math.floor(y + dy))) return B.zoneAt(Math.floor(x + dx), Math.floor(y + dy));
    return MQ_ZONE.Passage;
  };
  const faceOf = (zone: number, shade: number, v: number, px: number, x: number, y: number): RGB => {
    let c: RGB;
    if (isRoom(zone)) c = roomFace(B, zone, shade, v, px, x, y);
    else if (zone === MQ_ZONE.Gallery) c = galleryFace(v, px, shade);
    else if (zone === MQ_ZONE.Cards) c = cardsFace(v, px, shade);
    else c = passageFace(v, px, shade);
    // up into the dark
    if (v > MQ_FADE && !BRIGHTS.has(c)) c = mixc(c, MQ_DEEP, 0.3 + 0.65 * cl01((v - MQ_FADE) / (MQ_RISE - MQ_FADE)));
    return c;
  };
  return quietTerrain({
    rise: MQ_RISE,
    near: 34,
    // the edges straight, as walls are
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 171,
    floor: (x, y, px, py) => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const z = B.zoneAt(tx, ty);
      const wd = wall(x, y);
      let c = litter(x, y, px, py, z);
      if (!c) {
        if (z === MQ_ZONE.Black) c = velvetCarpet(x, y, px, py, wd);
        else if (isRoom(z)) c = marble(MQ_ROOMS[z], z, x, y, px, py, edgeOf(z)(x, y));
        else if (z === MQ_ZONE.Gallery) c = chevron(x, y, px, py, wd, MQ_OAK, 1831);
        else if (z === MQ_ZONE.Cards) c = carpet(x, y, px, py, edgeOf(z)(x, y)) ?? chevron(x, y, px, py, wd, MQ_WALNUT, 1833);
        else c = flags(x, y, px, py, wd);
      }
      // THE WINDOWS' LIGHT lying on the floor before them, in the room's colour (the black room's red), in steps
      const ws = land.windowLight === false ? undefined : B.reach.get(ty * W + tx);
      if (ws) {
        let L = 0;
        let col: RGB = MQ_ROOMS[0].light;
        for (const w of ws) {
          const a = windowLightAt(w, x, y);
          if (a > L) {
            L = a;
            col = w.zone === MQ_ZONE.Black ? MQ_RED_LIGHT : MQ_ROOMS[w.zone].light;
          }
        }
        if (L > 0) {
          // in steps, a checker where one gives onto the next
          const black = z === MQ_ZONE.Black;
          const k = over(L, 0.55, px, py, 0.06) ? 3 : over(L, 0.3, px, py, 0.06) ? 2 : over(L, 0.08, px, py, 0.05) ? 1 : 0;
          if (k) c = mixc(c, col, k * (black ? 0.1 : 0.09));
        }
      }
      return c;
    },
    face: (shade, v, px, _py, x, y) => faceOf(roomOf(shade, x, y), shade, v, px, x, y),
    top: (_x, _y, px, py, back) => topAt(px, py, back),
    nearFace: (v, px, _py, x, y) => {
      const z = nearRoom(x, y);
      const c = faceOf(z, -1, v, px, x, y);
      return BRIGHTS.has(c) ? mixc(c, MQ_DEEP, 0.55) : mixc(c, MQ_DEEP, 0.5);
    },
    brow: (c) => mixc(c, MQ_GILT[3], 0.3),
    foot: [0.4, 0.22],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.3, 0.18] },
  }, (c) => BRIGHTS.has(c));
}

/** The colours the ground leaves bright (an honest fire through the windows), as arrays are kept: by identity. */
const BRIGHTS = new Set<RGB>([...SCARLET, FIRE_CORE]);
