// THE CHAINED ONE'S FLOOR, A PLACE OF ITS OWN: THE BLACK IRON PRISON, the painting (the art chat, 2 Nov 2026). A MOCK-UP;
// NOTHING OF THE GAME IMPORTS IT.
//
// His words, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and
// 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Read (told him
// so): floors 3, 4 and 5 each a place of their own (floor, walls, colours, light) built round its boss; the pieces he already
// said yes to come along. His pick for floor 3: “Black iron prison (Recommended)”, offered as: dark stone and black iron,
// grated floors with firelight glowing up from below, chains hung from the dark; rust, soot and ember orange. Later, of the
// bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”.
//
// So: floor 3 laid as the main chat lays it, LINEAR (game/dungeon.ts, CRYPT_KINDS): a corridor in, A CELL BLOCK (a long hall,
// its cells along its back wall), a corridor on, the boss's doorway with A GATE OF ITS OWN in black iron, and beyond it THE
// CHAINED ONE'S PIT, sunk below the floor, iron steps down into it, a great grate in its floor over the fire. Dark stone
// walls ribbed and footed with black iron; floors of dark flags with grates let in over the glow; a fire channel down the
// cell block, open in the middle with a grated bridge over it and railings along it; chains hung from the dark. THREE LOOKS:
//   A, THE FURNACE BELOW: every grate glowing ember, the light thrown up the walls from below, smoke rising.
//   B, TORCHLIT DARK: fire baskets on the walls, the grates glowing only here and there, deep shadow between.
//   C, COLD IRON: soot and rust and cold grey light; the ember only round the pit, where he is.
//
// His art rulebook kept: crisp pixels, two to a game pixel; one camera; light from the upper left, a face turned to
// screen-left lit, one turned right in shade; the walls toward the eye cut low, as the game leaves them; the tops of the walls
// fading into the dark, as the game's; seams a deep, never black; a dark base, the place a step quieter than the figures; fire
// an honest orange; nothing cyan (the friend's), nothing pink but the enemy's own (his mark on the gate, and him).
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels.

import { Px } from '../engine/px';
import { Iso, ISO_X } from '../art/isokit';
import type { SideShader, TopShader } from '../art/isokit';
import { hash } from '../art/kit';
import { EMBER } from '../art/props';

export type Look = 'furnace' | 'torch' | 'cold';
export const LOOKS: Look[] = ['furnace', 'torch', 'cold'];
/** The letter he picks by, and the picture's name. */
export const LETTER: Record<Look, string> = { furnace: 'a', torch: 'b', cold: 'c' };
export const FILE: Record<Look, string> = { furnace: 'a_furnace', torch: 'b_torchlit', cold: 'c_cold_iron' };
/** Each look in a line, for him. */
export const CAPTION: Record<Look, string> = {
  furnace: 'A. The furnace below: every grate glowing, the fire lighting the walls from underneath, smoke rising.',
  torch: 'B. Torchlit dark: fire baskets on the walls, the grates glowing only here and there, deep shadow between.',
  cold: 'C. Cold iron: soot, rust and cold grey light; the only fire is in the pit, where he is.',
};

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];

export interface Pal {
  /** The prison's dark stone (its walls). */
  stone: R5;
  /** Its floor's flags. */
  flags: R5;
  /** Black iron. */
  iron: R5;
  /** Rust: its dark, its body, its bright. */
  rust: readonly [string, string, string];
  /** Soot: what it darkens toward. */
  soot: string;
  /** Straw in a cell. */
  straw: readonly [string, string, string];
  /** The seam where one part ends before another. */
  seam: string;
  /** Whatever lies beyond everything, and what the walls' tops fade into. */
  beyond: string;
  /** The fire's light in three bands (outer to inner), and how far each band goes toward it. */
  warm: readonly [string, string, string];
  warmK: readonly [number, number, number];
  /** How much rust and soot there is (0..1). */
  rustK: number;
  sootK: number;
  /** Smoke rising (its colours), or none. */
  smoke: readonly [string, string] | null;
}

export const PALS: Record<Look, Pal> = {
  // THE FURNACE BELOW: a warm black-brown stone; black iron catching the ember on its edges; smoke
  furnace: {
    stone: ['#100a0c', '#1e1416', '#2a1c1c', '#3a2724', '#583a2e'],
    flags: ['#120b0d', '#22171a', '#2e2020', '#3c2a26', '#56392c'],
    iron: ['#0c090a', '#1c1517', '#2a2020', '#3e2e28', '#6a4630'],
    rust: ['#3a1a0e', '#5a2a12', '#7a3c18'],
    soot: '#0a0708',
    straw: ['#2c2016', '#45321e', '#5c4426'],
    seam: '#0b0709',
    beyond: '#060405',
    warm: ['#6a2810', '#a8441a', '#e8702c'],
    warmK: [0.16, 0.28, 0.4],
    rustK: 0.5,
    sootK: 0.6,
    smoke: ['#3e2a22', '#5c3e2e'],
  },
  // TORCHLIT DARK: a cool charcoal stone gone near black away from the fire; the fire's pools warm on it
  torch: {
    stone: ['#09090d', '#131319', '#1c1c24', '#282731', '#433f4c'],
    flags: ['#0b0b10', '#16151c', '#201f27', '#2c2a34', '#46414e'],
    iron: ['#09090c', '#16161b', '#222128', '#323039', '#55505e'],
    rust: ['#2e160e', '#4a2412', '#683417'],
    soot: '#060608',
    straw: ['#241c16', '#3a2c1e', '#4e3c26'],
    seam: '#08080c',
    beyond: '#040406',
    warm: ['#5e2610', '#a4441a', '#e8742e'],
    warmK: [0.18, 0.32, 0.46],
    rustK: 0.45,
    sootK: 0.5,
    smoke: null,
  },
  // COLD IRON: a cold slate-grey stone, soot black, iron gone to rust; a cold flat light, readable; the fire only in the pit
  cold: {
    stone: ['#0f1215', '#1d2226', '#293035', '#384046', '#58626a'],
    flags: ['#101316', '#1f2428', '#2b3237', '#3a4248', '#56616a'],
    iron: ['#0b0c0e', '#181a1d', '#24272b', '#33373c', '#535a61'],
    rust: ['#3c1c10', '#5e2e16', '#82441e'],
    soot: '#08090a',
    straw: ['#2a261e', '#3e382a', '#524a36'],
    seam: '#0b0d10',
    beyond: '#050607',
    warm: ['#5e2610', '#a4441a', '#e8742e'],
    warmK: [0.16, 0.3, 0.44],
    rustK: 1,
    sootK: 0.9,
    smoke: null,
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's): floor 3 laid LINEAR, as the main
// chat lays it, from the near end (the hero's way in) to the far (the pit)

/** The run's floor is at 0; the pit's, sunk below it. A ledge a tile wide at the run's floor runs round its far sides, under its walls. */
export const PIT = { x0: -2, y0: -9, x1: 8, y1: 0, z: -40, ledge: 1 };
/** The boss's doorway: three tiles of the pit's near wall (the row y 0..1), with ITS GATE in it. */
export const GATE = { x0: 2, x1: 5, y0: 0, y1: 1 };
/** The corridor from the cell block to the gate. */
export const C1 = { x0: 2, y0: 1, x1: 5, y1: 4 };
/** THE CELL BLOCK: a long hall, its cells along its back wall (the one away from the eye, along y on its -x side). */
export const HALL = { x0: -1, y0: 4, x1: 7, y1: 16 };
/** The corridor in from the near end (and on off the picture). */
export const C0 = { x0: 2, y0: 17, x1: 5, y1: 21 };
/** THE FIRE CHANNEL down the cell block: grated over at both ends, open between, a grated bridge over it. */
export const CHANNEL = { x0: 2.2, x1: 3.8, y0: 5.4, y1: 14.6, z: -56, open0: 7.6, open1: 12.4, bridge0: 9.6, bridge1: 10.6 };
/** The cells, along the back wall (y from, to): each a barred front. */
export const CELLS: readonly [number, number][] = [[4.6, 7.2], [8.4, 11.0], [12.2, 14.8]];
/** The great grate in the pit's floor, over the fire, where he stands. */
export const PIT_GRATE = { x0: 1.5, y0: -6.6, x1: 5.5, y1: -2.6 };
/** The iron steps down into the pit, from the doorway. */
export const STEPS = { x0: 2.15, x1: 4.85, y0: -2.5, y1: 0, n: 5 };
/** Walls: how high (the game's 80); the walls toward the eye cut to 16. */
export const WALL = 80;
export const LOW = 16;

/** The whole picture of the run in picture pixels, where the floor's (0, 0) is on it, and where a point of the world is on it. */
export const PICTURE = { W: 1200, H: 840, OX: 592, OY: 340 };
export const atPx = (x: number, y: number, z = 0): [number, number] => [PICTURE.OX + (x - y) * 32, PICTURE.OY + (x + y) * 16 - z];
/** One phone screen (507 x 234 game pixels), the camera on the hero, a little up the screen of his feet. */
export const PHONE = { W: 1014, H: 468, lift: 28 };
/** His mark on the gate's keystone: its middle over the floor, in the face at the middle of the way. */
export const MARK_AT: [number, number, number] = [3.5, 1, 64 + 58];

/** Where the hero stands: in the cell block (the whole run), in the corridor before the gate (one phone screen), at the gate. */
export const HERO_RUN: [number, number] = [5.2, 8.3];
export const HERO_PHONE: [number, number] = [3.6, 2.7];
export const HERO_GATE: [number, number] = [3.0, 1.75];
/** Where the Chained One stands, in his pit, on the great grate. */
export const BOSS_AT: [number, number] = [3.7, -4.6];

// =================================================================================================
// Helpers

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
/** A colour `k` of the way to another. */
export function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hex(a);
  const [r1, g1, b1] = hex(b);
  return toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
}
function noise(x: number, y: number, k = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k) + (hash(i + 1, j, k) - hash(i, j, k)) * sx;
  const b = hash(i, j + 1, k) + (hash(i + 1, j + 1, k) - hash(i, j + 1, k)) * sx;
  return a + (b - a) * sy;
}
export const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);
const inRect = (x: number, y: number, r: { x0: number; y0: number; x1: number; y1: number }): boolean => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1;

// =================================================================================================
// THE LIGHT: what burns (a fire basket, the kettle) and what glows up from under the floor (a grate over the fire, the open
// channel, the pit's great grate); each throws its light in three bands, their edges broken so no circle reads (no soft
// gradient: his Pixels 1). A glow from under the floor reaches up the walls near it: the light from below.

export interface Lamp { x: number; y: number; z: number; r: number; k: number }
export interface Glow { x0: number; y0: number; x1: number; y1: number; z: number; r: number; k: number }
export interface Lights { lamps: Lamp[]; glows: Glow[] }

/** The grates let into the run's floor: in the corridors, and at the cell block's ends (the channel's own are its). */
export const GRATES: readonly { x0: number; y0: number; x1: number; y1: number }[] = [
  { x0: 3.0, y0: 18.0, x1: 4.0, y1: 19.0 },
  { x0: 3.0, y0: 1.6, x1: 4.0, y1: 2.6 },
  { x0: 0.0, y0: 9.2, x1: 1.0, y1: 10.2 },
  { x0: 5.2, y0: 12.6, x1: 6.2, y1: 13.6 },
  { x0: 5.4, y0: 5.0, x1: 6.4, y1: 6.0 },
];
/** Which of them glow in a look (the channel's grates too: `channel`; the open channel: `open`). */
export function glowing(look: Look): { grates: boolean[]; channelEnds: [boolean, boolean]; open: boolean; hot: number; cells: boolean } {
  if (look === 'furnace') return { grates: GRATES.map(() => true), channelEnds: [true, true], open: true, hot: 1, cells: true };
  if (look === 'torch') return { grates: [false, true, false, true, false], channelEnds: [false, true], open: true, hot: 0.3, cells: false };
  return { grates: GRATES.map(() => false), channelEnds: [false, false], open: false, hot: 0, cells: false };
}
/** THE FIRE BASKETS on the walls (look B): where (the foot of the face under them, tiles), which face, how high their fire burns. */
export const BASKETS: readonly { x: number; y: number; alongX: boolean; z: number }[] = [
  { x: 0.5, y: 4, alongX: true, z: 0 },
  { x: 2, y: 2.4, alongX: false, z: 0 },
  { x: -1, y: 7.8, alongX: false, z: 0 },
  { x: -1, y: 11.6, alongX: false, z: 0 },
  { x: 0.4, y: -9, alongX: true, z: -40 + 30 },
  { x: 6.2, y: -9, alongX: true, z: -40 + 30 },
];

export function lightsOf(look: Look): Lights {
  const G = glowing(look);
  const glows: Glow[] = [];
  const lamps: Lamp[] = [];
  const strong = look === 'furnace' ? 1.25 : 1;
  GRATES.forEach((g, i) => {
    if (G.grates[i]) glows.push({ ...g, z: 0, r: 1.25 * strong, k: 3 });
  });
  const C = CHANNEL;
  if (G.channelEnds[0]) glows.push({ x0: C.x0, y0: C.y0, x1: C.x1, y1: C.open0, z: 0, r: 1.4 * strong, k: 3 });
  if (G.channelEnds[1]) glows.push({ x0: C.x0, y0: C.open1, x1: C.x1, y1: C.y1, z: 0, r: 1.4 * strong, k: 3 });
  if (G.open) glows.push({ x0: C.x0, y0: C.open0, x1: C.x1, y1: C.open1, z: 0, r: (look === 'furnace' ? 1.9 : 0.9) * strong, k: look === 'furnace' ? 3 : 2 });
  // (the pit's great grate burns in every look: the fire is his)
  const P = PIT_GRATE;
  glows.push({ ...P, z: PIT.z, r: look === 'cold' ? 2.6 : 2.4 * strong, k: 3 });
  if (look === 'torch') {
    for (const b of BASKETS) {
      const [x, y] = b.alongX ? [b.x, b.y + 0.25] : [b.x + 0.25, b.y];
      lamps.push({ x, y, z: b.z + 44, r: 2.1, k: 3 });
    }
    // (the jailers' kettle's fire, in the cell block)
    lamps.push({ x: 6.1, y: 9.4, z: 12, r: 1.7, k: 3 });
  }
  if (look === 'furnace') lamps.push({ x: 6.1, y: 9.4, z: 12, r: 1.4, k: 3 });
  return { lamps, glows };
}

/** How lit a point is by the fire: 0 none, 1, 2, 3 the inner band. */
export function heat(x: number, y: number, z: number, L: Lights): number {
  let best = 0;
  // (where two bands meet, a checker of two-pixel squares on the screen takes the one or the other: crisp, no ring drawn)
  const sx = Math.floor((x - y) * 16);
  const sy = Math.floor(((x + y) * 16 - z) / 2);
  const jit = (sx + sy) & 1 ? 0.045 : -0.045;
  for (const l of L.lamps) {
    const d = Math.hypot(x - l.x, y - l.y, (z - l.z) / 44) / l.r + jit;
    const b = d < 0.34 ? 3 : d < 0.62 ? 2 : d < 1 ? 1 : 0;
    best = Math.max(best, Math.min(b, l.k));
  }
  for (const g of L.glows) {
    const dx = Math.max(g.x0 - x, 0, x - g.x1);
    const dy = Math.max(g.y0 - y, 0, y - g.y1);
    // (the light from below climbs a wall: what is above the glow is reached by it, less the higher)
    const dz = Math.max(0, z - g.z) / 52;
    const d = Math.hypot(dx, dy, dz) / g.r + jit;
    const b = d < 0.3 ? 3 : d < 0.6 ? 2 : d < 1 ? 1 : 0;
    best = Math.max(best, Math.min(b, g.k));
    if (best === 3) return 3;
  }
  return best;
}
/** A colour warmed by the fire's light, `k` bands of it. */
export function warmBy(P: Pal, c: string, k: number): string {
  return k <= 0 ? c : mixC(c, P.warm[k - 1], P.warmK[k - 1]);
}

// =================================================================================================
// THE FIRE seen through iron: an ember bed, its hot spots yellow, its edges red; drifting in tongues

/** The fire under a grate, at a point of the floor; `edge` 0..1, how near the grate's rim (cooler there). */
function fireAt(x: number, y: number, edge: number, k: number): string {
  const n = fbm(x * 3.1, y * 3.1, 401 + k) + (1 - edge) * 0.2;
  if (n > 0.9) return EMBER[4];
  if (n > 0.78) return EMBER[3];
  if (n > 0.62) return EMBER[2];
  if (n > 0.46) return EMBER[1];
  return n > 0.36 ? EMBER[0] : '#3a120c';
}
/** A BED OF COALS: dark coal in lumps, the fire showing in the cracks between them and in the lumps' hearts; `k` how hot. */
function coalsAt(x: number, y: number, k: number): string {
  const n = fbm(x * 5.2, y * 5.2, 421);
  const crack = Math.abs(fbm(x * 2.6, y * 2.6, 423) - 0.5);
  const hot = fbm(x * 0.9, y * 0.9, 425) * k;
  if (k < 0.5) {
    // (a bed burnt low: dark coal, the fire only in a crack here and there)
    if (crack < 0.02 && hot > 0.14) return hot > 0.2 ? EMBER[2] : EMBER[1];
    if (n > 0.72) return EMBER[0];
    return n > 0.5 ? '#3a120c' : '#24100c';
  }
  if (crack < 0.035 + hot * 0.03) return hot > 0.45 ? EMBER[3] : EMBER[2];
  if (n > 0.66 - hot * 0.12) return n > 0.76 ? EMBER[2] : EMBER[1];
  if (n > 0.5) return EMBER[0];
  return n > 0.36 ? '#3a120c' : '#24100c';
}
/** Embers dying (a grate glowing only in places, look B, and the cold channel's last): mostly dark, a coal here and there. */
function dimFireAt(P: Pal, x: number, y: number): string {
  const n = fbm(x * 4, y * 4, 409);
  if (n > 0.74) return EMBER[1];
  if (n > 0.64) return EMBER[0];
  if (n > 0.5) return '#2a0f0c';
  return P.beyond;
}
/** Cold ash and the dark under a grate (look C). */
function coldUnderAt(P: Pal, x: number, y: number): string {
  const n = fbm(x * 5, y * 5, 413);
  return n > 0.7 ? P.iron[1] : n > 0.55 ? P.flags[0] : P.beyond;
}

// =================================================================================================
// A GRATE OF BLACK IRON let into the floor: a heavy rim, riveted at its corners and along it; bars along x close together,
// a cross bar every half tile; between them what is under it (fire, or the dark); its bars lit from below by the fire.

type Under = 'fire' | 'dim' | 'cold';
function grateAt(P: Pal, x: number, y: number, g: { x0: number; y0: number; x1: number; y1: number }, under: Under, rim = 0.09, k = 0): string {
  const I = P.iron;
  const fx = x - g.x0;
  const fy = y - g.y0;
  const W = g.x1 - g.x0;
  const H = g.y1 - g.y0;
  const toEdge = Math.min(fx, fy, W - fx, H - fy);
  if (toEdge < rim) {
    // the rim: its top lit on the side toward the light, a rivet now and then
    if (toEdge < 0.022) return P.seam;
    const along = fx < rim || W - fx < rim ? fy : fx;
    if (Math.abs(((along * 4) % 1) - 0.5) < 0.07 && Math.abs(toEdge - rim / 2) < 0.03) return I[4];
    const towardLight = fx < rim || H - fy < rim;
    return I[towardLight ? 3 : 2];
  }
  // bars along y every 1/7 tile, cross bars along x every half
  const bu = (fx * 7) % 1;
  const bv = (fy * 2) % 1;
  const onBar = bu < 0.34;
  const onCross = bv < 0.12;
  const hot = under === 'fire';
  if (onBar || onCross) {
    // (a bar lit on the side toward the light, its other edge catching the fire under it)
    if (onCross && !onBar) return bv < 0.04 ? I[3] : hot ? I[2] : I[1];
    if (bu < 0.1) return I[3];
    if (bu > 0.26) return hot ? P.rust[1] : I[1];
    return I[2];
  }
  const e = Math.min(1, toEdge / 0.5);
  if (under === 'fire') return fireAt(x, y, 1 - e, k);
  if (under === 'dim') return dimFireAt(P, x, y);
  return coldUnderAt(P, x, y);
}

// =================================================================================================
// THE FLOOR: big flags of the dark stone, close-set, each worn on its edge toward the light; soot and grime in drifts; rust
// bled out round the iron let into it; straw at the cells' fronts

function flagAt(P: Pal, x: number, y: number, seed: number): number {
  const row = Math.floor(y * 2);
  const off = hash(row, seed, 1) * 0.5;
  const L = hash(row, seed, 2) > 0.45 ? 0.5 : 0.75;
  const xx = x + off;
  const i = Math.floor(xx / L);
  const fu = xx / L - i;
  const fv = y * 2 - row;
  const su = 0.05 / L;
  if (fu < su || fv < 0.07) return -1;
  let k = 2;
  const tone = hash(i, row, seed + 3);
  if (tone < 0.22) k = 1;
  else if (tone > 0.86) k = 3;
  if (fu < su + 0.07 || fv > 0.88) k += 1;
  if (fu > 0.93 || fv < 0.15) k -= 1;
  // (a crack across one now and then)
  if (hash(i, row, seed + 5) > 0.84) {
    const c = Math.abs(fv - 0.5 - (fu - 0.5) * (hash(i, row, seed + 6) - 0.5) * 1.6 - Math.sin(fu * 9) * 0.06);
    if (c < 0.035) return -1;
  }
  return clampK(k);
}

export interface FloorOpts {
  seed: number;
  /** Rust bled round iron (a grate's rim) */
  nearIron?: (x: number, y: number) => number;
}

/** A floor point's colour, before the light. */
function floorBase(P: Pal, x: number, y: number, seed: number, look: Look): string {
  const k = flagAt(P, x, y, seed);
  if (k < 0) return P.flags[0];
  let c = P.flags[k];
  // grime and soot in drifts
  const g = fbm(x * 0.9, y * 0.9, seed + 7);
  if (g > 0.62) c = mixC(c, P.soot, P.sootK * 0.5);
  else if (g < 0.3 && look === 'cold') c = mixC(c, P.flags[k + 1 > 4 ? 4 : k + 1], 0.25);
  return c;
}

// =================================================================================================
// THE WALLS: the prison's dark stone in courses, ribbed with black iron every two tiles (riveted straps from foot to top),
// footed with a plate of riveted iron; rust bled down from the rivets, soot over the fire; the top fading into the dark as
// the game's walls do (art/floorkit.ts: their solid stone, then four steps into the dark)

export interface FaceSpot {
  /** Along the wall (tiles), and the height (picture pixels above the run's floor). */
  along: number;
  z: number;
}

/** What may be cut in a face: a cell's barred front. Returns a colour, or undefined for the stone. */
type Opening = (along: number, up: number) => string | undefined;

function stoneFace(P: Pal, lit: boolean, along: number, z: number, foot: number, top: number, u: number, v: number, seed: number): string {
  const S = P.stone;
  const I = P.iron;
  const up = z - foot;
  const fromTop = top - z;
  // THE IRON RIBS, every two tiles: a strap 7 wide, riveted every 10
  const ra = ((along % 2) + 2) % 2;
  const ribU = (ra - 1) * ISO_X; // picture pixels from the rib's middle
  let c: string;
  if (Math.abs(ribU) < 3.5) {
    const rivet = Math.abs(ribU) < 1.5 && ((up + 400) % 10 === 4 || (up + 400) % 10 === 5);
    c = rivet ? (ribU < 0 ? I[4] : I[1]) : ribU < -2.5 ? I[lit ? 3 : 2] : ribU > 2.5 ? I[0] : I[lit ? 2 : 1];
  } else if (up < 9) {
    // THE FOOT PLATE: riveted iron, its top edge lit
    if (up === 8) c = I[lit ? 4 : 3];
    else if (up === 7) c = I[lit ? 3 : 2];
    else if (up === 4 && (Math.round(along * ISO_X) % 16 === 0 || Math.round(along * ISO_X) % 16 === 1)) c = I[4];
    else c = I[lit ? 2 : 1];
  } else {
    // THE STONE, in courses 12 high, blocks 22 to 36 long
    const CH = 12;
    const cv = up - 9;
    const row = Math.floor(cv / CH);
    const lv = cv % CH;
    const off = Math.floor(hash(row, seed, 1) * 40);
    const L = 22 + Math.floor(hash(row, seed, 2) * 14);
    const uu = u + off;
    const b = Math.floor(uu / L);
    const lu = uu % L;
    if (lv === CH - 1 || lu === 0) c = P.seam;
    else {
      let k = lit ? 2 : 1;
      const tone = hash(b, row * 7 + seed, 3);
      if (tone < 0.14) k -= 1;
      else if (tone > 0.92) k += 1;
      if (lv === CH - 2) k += 1; // (a block's top edge, lit)
      if (lit && lu === 1) k += 1;
      if (lv === 0 || lu === L - 1) k -= 1;
      if (hash(u >> 1, v >> 1, seed + 5) < 0.03) k -= 1;
      c = S[clampK(k)];
    }
  }
  // RUST bled down from the ribs' rivets and the foot plate (more of it in the cold)
  if (Math.abs(ribU) >= 3.5) {
    const col = Math.floor(u / 2);
    const nearRib = Math.abs(ribU) < 9;
    if (nearRib && hash(col, 3, seed + 21) < 0.5 * P.rustK) {
      const len = 10 + 34 * hash(col, 4, seed + 21) * P.rustK;
      const from = 14 + Math.floor(hash(col, 5, seed + 21) * 3) * 10;
      if (up < from && up > from - len && hash(col, Math.floor(up / 4), seed + 22) > 0.2) c = mixC(c, P.rust[up > from - 8 ? 1 : 0], 0.5 + 0.2 * P.rustK);
    }
    if (up >= 9 && up < 9 + 10 * P.rustK && hash(col, 6, seed + 23) < 0.35 * P.rustK) c = mixC(c, P.rust[0], 0.55);
  }
  // SOOT: darker toward the top, in streaks
  const sootK = P.sootK * Math.max(0, 1 - fromTop / 40) * (0.6 + 0.4 * fbm(u / 9, z / 30, seed + 25));
  if (sootK > 0.25) c = mixC(c, P.soot, Math.min(0.75, sootK));
  return c;
}
/** The top of a wall fading into the dark: the game's four steps. */
function faded(P: Pal, c: string, z: number, top: number): string {
  const FADE = 24;
  const fromTop = top - 1 - z;
  if (fromTop < FADE) return mixC(c, P.beyond, [0.9, 0.66, 0.42, 0.2][Math.max(0, Math.floor((fromTop * 4) / FADE))]);
  return c;
}

/** A WALL ALONG X: its face turned to screen-left (+y), in the light; from x0 to x1, its face at y; from z0 to z1. */
export function wallAlongX(iso: Iso, look: Look, L: Lights, x0: number, x1: number, y: number, z0: number, z1: number, seed: number, opening?: Opening): void {
  const P = PALS[look];
  iso.box(x0, y - 1, x1, y, z0, z1, {
    top: () => P.beyond,
    left: (u, v, _w, h) => {
      const along = x0 + (u + 0.5) / ISO_X;
      const z = z1 - v;
      const o = opening ? opening(along, z - z0) : undefined;
      let c = o ?? stoneFace(P, true, along, z, z0, z1, u, v, seed);
      if (o === undefined || !SHINE.has(o)) c = warmBy(P, c, heat(along, y + 0.05, z, L));
      void h;
      return o !== undefined && SHINE.has(o) ? o : faded(P, c, z, z1);
    },
    right: (u, v) => faded(P, P.stone[0], z1 - v, z1),
  });
}
/** A WALL ALONG Y: its face turned to screen-right (+x), in shade; from y0 to y1, its face at x. */
export function wallAlongY(iso: Iso, look: Look, L: Lights, x: number, y0: number, y1: number, z0: number, z1: number, seed: number, opening?: Opening): void {
  const P = PALS[look];
  iso.box(x - 1, y0, x, y1, z0, z1, {
    top: () => P.beyond,
    left: (u, v) => faded(P, P.stone[1], z1 - v, z1),
    right: (u, v) => {
      const along = y1 - (u + 0.5) / ISO_X;
      const z = z1 - v;
      const o = opening ? opening(along, z - z0) : undefined;
      if (o !== undefined && SHINE.has(o)) return o;
      const c = o ?? stoneFace(P, false, along, z, z0, z1, u, v, seed);
      return faded(P, warmBy(P, c, heat(x + 0.05, along, z, L)), z, z1);
    },
  });
}
/** What shines of itself (fire): never warmed, never faded into the dark. */
const SHINE = new Set<string>([...EMBER, '#3a120c', '#24100c', '#2a0f0c']);

/** A WALL TOWARD THE EYE, cut low as the game leaves it: its cut top lit, its faces. */
export function lowWall(iso: Iso, look: Look, L: Lights, x0: number, y0: number, x1: number, y1: number, seed: number): void {
  const P = PALS[look];
  const S = P.stone;
  const top: TopShader = (u, v) => {
    const x = x0 + u * (x1 - x0);
    const y = y0 + v * (y1 - y0);
    // (the cut top: a coping of blocks, a joint every half tile, worn on the edge toward the light)
    const long = x1 - x0 > y1 - y0;
    const a = long ? x : y;
    const across = long ? (y - y0) / (y1 - y0) : (x - x0) / (x1 - x0);
    const fa = (((a * 2 + hash(seed, 0, 3)) % 1) + 1) % 1;
    let c = fa < 0.06 || across < 0.08 ? P.seam : hash(Math.floor(a * 2), seed, 5) > 0.7 ? S[2] : S[3];
    if (c !== P.seam && (fa < 0.14 || (long ? across > 0.86 : across < 0.2))) c = S[4];
    return warmBy(P, c, heat(x, y, LOW, L));
  };
  const left: SideShader = (u, v) => {
    const x = x0 + (u + 0.5) / ISO_X;
    return warmBy(P, v < 1 ? S[4] : v > LOW - 4 ? P.iron[2] : S[v % 6 === 5 ? 0 : 2], heat(x, y1, LOW - v, L));
  };
  const right: SideShader = (u, v) => {
    const y = y1 - (u + 0.5) / ISO_X;
    return warmBy(P, v < 1 ? S[3] : v > LOW - 4 ? P.iron[1] : S[v % 6 === 5 ? 0 : 1], heat(x1, y, LOW - v, L));
  };
  iso.box(x0, y0, x1, y1, 0, LOW, { top, left, right });
}

// =================================================================================================
// A CELL'S BARRED FRONT, in the cell block's back wall: an iron frame and lintel, bars of black iron every eight, two flat
// cross bars, a door in the middle with its hinges and lock; through the bars the cell: its floor of straw going back, its
// back wall in the dark with a chain on it; in the furnace below, a grate glowing in its floor

export function cellFront(look: Look, L: Lights, wallX: number): Opening {
  const P = PALS[look];
  const I = P.iron;
  const lit = glowing(look).cells;
  return (along, up) => {
    for (const [a0, a1] of CELLS) {
      if (along < a0 - 0.12 || along > a1 + 0.12 || up > 66) continue;
      const u = Math.round((a1 - along) * ISO_X); // picture pixels from the cell's left end on the screen
      const w = Math.round((a1 - a0) * ISO_X);
      // the frame: iron posts at either side, the lintel over
      if (u < -2 || u > w + 2) continue;
      if (up >= 58) return up >= 64 ? I[3] : up === 58 ? I[1] : I[2];
      if (u < 2 || u > w - 2) return u < 0 || u === w - 1 ? I[1] : u > w ? I[1] : I[3];
      // the door: the middle three bays, its hinges at 12 and 44, its lock at 28
      const dm = Math.round(w / 2);
      const inDoor = Math.abs(u - dm) <= 12;
      if (inDoor && (Math.abs(u - dm) === 12 || Math.abs(u - dm) === 11) && up < 56) return Math.abs(u - dm) === 12 ? I[1] : I[3];
      if (inDoor && u - dm >= 4 && u - dm <= 9 && up >= 24 && up <= 32) return up === 32 || u - dm === 4 ? I[3] : up === 28 && u - dm === 6 ? P.beyond : I[2];
      // the cross bars
      if ((up >= 16 && up <= 18) || (up >= 40 && up <= 42)) return up === 18 || up === 42 ? I[3] : I[2];
      // the bars: three wide, every eight, lit on the side toward the light (the left)
      const b = (u + 400) % 8;
      if (b < 3) return b === 0 ? I[3] : b === 1 ? I[2] : I[1];
      // THROUGH THE BARS, the cell: its floor going back (the lower part), its back wall above, a chain on it
      const back = 34;
      const k = Math.floor(along * 9);
      if (up < 8) {
        const s = hash(u >> 1, up >> 1, 77);
        const c = s > 0.7 ? P.straw[2] : s > 0.35 ? P.straw[1] : P.straw[0];
        return lit && up < 4 && fbm(along * 6, up / 3, 79) > 0.55 ? fireAt(along, up, 0.5, 3) : c;
      }
      if (up < back) {
        // (the floor seen going back into the cell, darker as it goes)
        const d = (up - 8) / (back - 8);
        const c = d < 0.4 ? P.flags[1] : P.flags[0];
        if (lit && Math.abs(along - (a0 + a1) / 2 - 0.3) < 0.4 && up > 12 && up < 20) return fireAt(along * 2, up / 4, 0.6, 5);
        return d > 0.75 ? P.beyond : warmBy(P, c, lit ? 1 : 0);
      }
      // the back wall of the cell, in the dark; a chain hung on it, its shackle
      const ch = Math.abs(u - Math.round(w * 0.3));
      if (ch <= 1 && up < 54 && up > back + 2) return (up + k) % 4 < 2 ? I[3] : I[1];
      return up > 48 ? P.beyond : P.stone[0];
    }
    return undefined;
  };
}

// =================================================================================================
// THE PIT: its floor sunk 40 below the run's; its far walls standing 120 from its floor; the great grate in the middle over
// the fire; grooves worn round it by his ball; rings let into the floor at the grate's corners for the chains hung from the
// dark; iron steps down from the doorway

/** The rings in the pit's floor, round the grate, that the great chains from the dark come down to (kept off his line on the screen). */
export const PIT_RINGS: readonly [number, number][] = [[0.4, -6.0], [7.0, -7.4], [7.4, -4.4]];

export function paintPit(iso: Iso, look: Look, L: Lights): void {
  const P = PALS[look];
  const Z = PIT.z;
  // its far walls (the one along x first: it is the farther at the corner)
  wallAlongX(iso, look, L, PIT.x0 - 1, PIT.x1 + 1, PIT.y0, 0, WALL, 301, pitWallDress(look));
  wallAlongY(iso, look, L, PIT.x0, PIT.y0, PIT.y1 + 1, 0, WALL, 303, pitWallDress(look));
  // THE LEDGE round its far sides, at the run's floor: its flags, its edge of iron, its face dropping to the pit's floor
  const E = PIT.ledge;
  const ledge = (x0: number, y0: number, x1: number, y1: number, seed: number): void => {
    iso.top(x0, y0, x1, y1, 0, (u, v) => {
      const x = x0 + u * (x1 - x0);
      const y = y0 + v * (y1 - y0);
      const toEdge = Math.min(x1 - x, y1 - y);
      if (toEdge < 0.1) return warmBy(P, toEdge < 0.03 ? P.iron[4] : P.iron[2], heat(x, y, 0, L));
      return warmBy(P, floorBase(P, x, y, seed, look), heat(x, y, 0, L));
    });
  };
  ledge(PIT.x0, PIT.y0, PIT.x1, PIT.y0 + E, 305);
  ledge(PIT.x0, PIT.y0 + E, PIT.x0 + E, PIT.y1, 307);
  const drop = (along: number, z: number, lit: boolean, u: number): string => {
    // rough-dressed stone in courses, iron-shod at its lip, soot from the fire below
    const up = z - Z;
    let c: string;
    if (up > -Z - 5) c = up === -Z - 5 ? P.iron[1] : P.iron[lit ? 3 : 2];
    else {
      const row = Math.floor(up / 9);
      const off = Math.floor(hash(row, 309, 1) * 30);
      const lu = (u + off) % 26;
      c = up % 9 === 8 || lu === 0 ? P.seam : P.stone[lit ? (lu === 1 ? 3 : 2) : 1];
    }
    void along;
    return c;
  };
  iso.left(PIT.x0 + E, PIT.x1, PIT.y0 + E, Z, 0, (u, v) => {
    const x = PIT.x0 + E + (u + 0.5) / ISO_X;
    const z = -v;
    return warmBy(P, drop(x, z, true, u), heat(x, PIT.y0 + E, z, L));
  });
  iso.right(PIT.x0 + E, PIT.y0 + E, PIT.y1, Z, 0, (u, v) => {
    const y = PIT.y1 - (u + 0.5) / ISO_X;
    const z = -v;
    return warmBy(P, drop(y, z, false, u), heat(PIT.x0 + E, y, z, L));
  });
  const G = PIT_GRATE;
  const gx = (G.x0 + G.x1) / 2;
  const gy = (G.y0 + G.y1) / 2;
  const F = { x0: PIT.x0 + E, y0: PIT.y0 + E, x1: PIT.x1, y1: PIT.y1 };
  iso.top(F.x0, F.y0, F.x1, F.y1, Z, (u, v) => {
    const x = F.x0 + u * (F.x1 - F.x0);
    const y = F.y0 + v * (F.y1 - F.y0);
    if (inRect(x, y, G)) return grateAt(P, x, y, G, 'fire', 0.14, 7);
    let c = floorBase(P, x, y, 311, look);
    // the grooves his ball has worn round the grate: rings scored in the flags
    const r = Math.hypot((x - gx) / 1.0, (y - gy) / 1.0);
    for (const rr of [3.0, 3.35, 3.9]) if (Math.abs(r - rr) < 0.035 && fbm(x * 2, y * 2, 313) > 0.3) c = P.flags[0];
    for (const rr of [3.0, 3.35, 3.9]) if (Math.abs(r - rr - 0.05) < 0.02 && fbm(x * 2, y * 2, 313) > 0.3) c = P.flags[3];
    // the rings let into the floor
    for (const [rx, ry] of PIT_RINGS) {
      const d = Math.hypot(x - rx, y - ry);
      if (d < 0.22) c = d < 0.1 ? P.iron[0] : d < 0.16 ? (x < rx ? P.iron[4] : P.iron[2]) : P.iron[1];
    }
    // soot round the grate's rim, and the floor at the walls' foot in their shade
    const toGrate = Math.max(G.x0 - x, x - G.x1, G.y0 - y, y - G.y1);
    if (toGrate < 0.35 && toGrate > 0) c = mixC(c, P.soot, 0.35);
    if (x - F.x0 < 0.4 || y - F.y0 < 0.4) c = mixC(c, P.beyond, 0.35);
    return warmBy(P, c, heat(x, y, Z, L));
  });
  paintSteps(iso, look, L);
}

/** The pit's walls: great rings bolted to them with chains hung slack between (painted with the chains), and iron ribs. */
function pitWallDress(look: Look): Opening {
  const P = PALS[look];
  return (along, up) => {
    // A GREAT RING on a plate every four tiles, 62 up the wall
    const a = ((along + 0.5) % 4 + 4) % 4 - 2;
    const du = a * ISO_X;
    const dv = up - 52;
    if (Math.abs(du) <= 7 && Math.abs(dv) <= 7) return Math.abs(du) >= 6 || Math.abs(dv) >= 6 ? P.iron[0] : (du + dv) % 5 === 0 ? P.iron[4] : P.iron[2];
    const r = Math.hypot(du, (dv + 12) * 1.0);
    if (r > 6.5 && r < 9.5 && dv < -3) return du < 0 ? P.iron[3] : P.iron[1];
    return undefined;
  };
}

/** THE IRON STEPS down from the doorway into the pit: grated treads on riveted iron cheeks. */
function paintSteps(iso: Iso, look: Look, L: Lights): void {
  const P = PALS[look];
  const S = STEPS;
  const n = S.n;
  const run = (S.y1 - S.y0) / n;
  for (let i = n - 1; i >= 0; i--) {
    // (from the bottom up: the farthest, lowest, first)
    const y0 = S.y1 - run * (i + 1);
    const y1 = S.y1 - run * i;
    const z = -((i + 1) * -PIT.z) / (n + 1);
    iso.box(S.x0, y0, S.x1, y1, PIT.z, z, {
      top: (u, v) => {
        const x = S.x0 + u * (S.x1 - S.x0);
        const y = y0 + v * (y1 - y0);
        const c = grateAt(P, x, y, { x0: S.x0, y0, x1: S.x1, y1 }, look === 'cold' ? 'cold' : 'dim', 0.07);
        return SHINE.has(c) ? c : warmBy(P, c, heat(x, y, z, L));
      },
      left: (u, v) => warmBy(P, v < 2 ? P.iron[3] : P.iron[1], heat(S.x0 + u / ISO_X, y1, z - v, L)),
      right: (u, v, _w, h) => {
        // the cheek: riveted plate, its top edge lit
        const c = v < 2 ? P.iron[2] : (u % 12 === 3 && v % 10 === 4) ? P.iron[3] : P.iron[1];
        void h;
        return warmBy(P, c, heat(S.x1, y1 - u / ISO_X, z - v, L));
      },
    });
  }
}

// =================================================================================================
// THE RUN: the corridors and the cell block, their floors, their far walls (standing whole), the fire channel

export function paintRun(iso: Iso, look: Look, L: Lights): void {
  const P = PALS[look];
  const G = glowing(look);
  // FAR WALLS, standing whole: the corridor to the gate's (along y), the cell block's far end (along x, either side of the
  // way to the gate), its back wall with the cells (along y), the corner beyond the way, and the corridor in's
  wallAlongY(iso, look, L, C1.x0, C1.y0, C1.y1, 0, WALL, 321);
  wallAlongX(iso, look, L, HALL.x0 - 1, C1.x0, HALL.y0, 0, WALL, 323);
  wallAlongX(iso, look, L, C1.x1 + 1, HALL.x1 + 1, HALL.y0, 0, WALL, 325);
  wallAlongY(iso, look, L, HALL.x0, HALL.y0, HALL.y1 + 1, 0, WALL, 327, cellFront(look, L, HALL.x0));
  wallAlongY(iso, look, L, C0.x0, C0.y0, C0.y1 + 1, 0, WALL, 329);
  // THE FLOORS
  const floorOf = (r: { x0: number; y0: number; x1: number; y1: number }, seed: number): void => {
    iso.top(r.x0, r.y0, r.x1, r.y1, 0, (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      if (inRect(x, y, CHANNEL)) return null;
      for (let i = 0; i < GRATES.length; i++) {
        const g = GRATES[i];
        if (inRect(x, y, g)) {
          const c = grateAt(P, x, y, g, G.grates[i] ? 'fire' : look === 'cold' ? 'cold' : 'dim', 0.1, i);
          return SHINE.has(c) ? c : warmBy(P, c, heat(x, y, 0, L));
        }
      }
      let c = floorBase(P, x, y, seed, look);
      // rust bled out round each grate's rim
      for (const g of GRATES) {
        const d = Math.max(g.x0 - x, x - g.x1, g.y0 - y, y - g.y1);
        if (d > 0 && d < 0.22 && fbm(x * 6, y * 6, 331) < 0.55) c = mixC(c, P.rust[0], 0.45 * P.rustK + 0.15);
      }
      // straw kicked out in front of the cells
      if (x < HALL.x0 + 0.8 && y > HALL.y0 && y < HALL.y1) {
        for (const [a0, a1] of CELLS) {
          if (y > a0 - 0.2 && y < a1 + 0.2 && fbm(x * 5, y * 5, 333) > 0.62 - (HALL.x0 + 0.8 - x) * 0.25) c = hash(Math.floor(x * 30), Math.floor(y * 30), 335) > 0.5 ? P.straw[1] : P.straw[0];
        }
      }
      // the floor at a far wall's foot, in its shade
      if (x - r.x0 < 0.18 && r !== C1) c = mixC(c, P.beyond, 0.35);
      return warmBy(P, c, heat(x, y, 0, L));
    });
  };
  floorOf({ x0: GATE.x0, y0: GATE.y0, x1: GATE.x1, y1: GATE.y1 }, 337);
  floorOf(C1, 339);
  floorOf({ x0: C1.x0, y0: HALL.y0 - 1, x1: C1.x1, y1: HALL.y0 }, 341);
  floorOf(HALL, 343);
  floorOf({ x0: C0.x0, y0: HALL.y1, x1: C0.x1, y1: C0.y0 }, 345);
  floorOf(C0, 347);
  paintChannel(iso, look, L);
}

/** THE FIRE CHANNEL down the middle of the cell block: its far sides going down into it, its bed of fire (or cold ash), the grates over its ends, the bridge, the railings. */
function paintChannel(iso: Iso, look: Look, L: Lights): void {
  const P = PALS[look];
  const C = CHANNEL;
  const G = glowing(look);
  // (gone cold: grey ash heaped in drifts, a burnt-out clinker here and there)
  const ash = (x: number, y: number): string => {
    const n = fbm(x * 2.2, y * 2.2, 427);
    const f = hash(Math.floor(x * 24), Math.floor(y * 24), 429);
    if (f > 0.94) return P.iron[0];
    return n > 0.62 ? P.flags[2] : n > 0.45 ? P.flags[1] : P.flags[0];
  };
  const bed = (x: number, y: number): string => (G.open ? coalsAt(x, y, G.hot) : ash(x, y));
  // its bed
  iso.top(C.x0, C.y0, C.x1, C.y1, C.z, (u, v) => bed(C.x0 + u * (C.x1 - C.x0), C.y0 + v * (C.y1 - C.y0)));
  // its far sides: rough stone going down, lit from the fire below
  const side = (along: number, z: number, lit: boolean): string => {
    const k = (Math.floor((z + 200) / 8) + Math.floor(along * 5)) % 3 === 0 ? 0 : lit ? 2 : 1;
    const c = P.stone[k];
    if (!G.open) return mixC(c, P.beyond, 0.4 + (-z / -C.z) * 0.4);
    const d = (z - C.z) / -C.z; // 0 at the bed, 1 at the floor
    if (G.hot < 0.5) return warmBy(P, mixC(c, P.beyond, 0.35 + d * 0.2), d < 0.3 ? 2 : d < 0.6 ? 1 : 0);
    return warmBy(P, mixC(c, P.beyond, d * 0.2), d < 0.35 ? 3 : d < 0.7 ? 2 : 1);
  };
  iso.left(C.x0, C.x1, C.y0, C.z, 0, (u, v) => side(C.x0 + u / ISO_X, -v, true));
  iso.right(C.x0, C.y0, C.y1, C.z, 0, (u, v) => side(C.y1 - u / ISO_X, -v, false));
  // the grates over its ends, and the bridge (a grate on two cheeks)
  const over = (y0: number, y1: number, glow: boolean, i: number): void => {
    iso.top(C.x0 - 0.12, y0, C.x1 + 0.12, y1, 0, (u, v) => {
      const x = C.x0 - 0.12 + u * (C.x1 - C.x0 + 0.24);
      const y = y0 + v * (y1 - y0);
      const c = grateAt(P, x, y, { x0: C.x0 - 0.12, y0, x1: C.x1 + 0.12, y1 }, glow ? 'fire' : look === 'cold' ? 'cold' : 'dim', 0.1, i);
      return SHINE.has(c) ? c : warmBy(P, c, heat(x, y, 0, L));
    });
  };
  over(C.y0, C.open0, G.channelEnds[0], 21);
  over(C.open1, C.y1, G.channelEnds[1], 22);
  // (the bridge: its deck a grate, the fire seen through it, its near cheek a riveted plate)
  iso.top(C.x0 - 0.12, C.bridge0, C.x1 + 0.12, C.bridge1, 0, (u, v) => {
    const x = C.x0 - 0.12 + u * (C.x1 - C.x0 + 0.24);
    const y = C.bridge0 + v * (C.bridge1 - C.bridge0);
    const c = grateAt(P, x, y, { x0: C.x0 - 0.12, y0: C.bridge0, x1: C.x1 + 0.12, y1: C.bridge1 }, G.open ? 'fire' : 'cold', 0.12, 23);
    return SHINE.has(c) ? c : warmBy(P, c, heat(x, y, 0, L));
  });
  iso.left(C.x0, C.x1, C.bridge1, -10, 0, (u, v) => warmBy(P, v < 1 ? P.iron[3] : u % 10 === 4 && v === 5 ? P.iron[4] : P.iron[1], G.open ? 2 : 0));
}

/** THE RAILINGS along the open channel, both sides, a gap at the bridge: iron posts with a knob, two rails. Drawn over the floor. */
export function paintRailings(p: Px, iso: Iso, look: Look, L: Lights, side: 'far' | 'near'): void {
  const P = PALS[look];
  const C = CHANNEL;
  const x = side === 'far' ? C.x0 - 0.04 : C.x1 + 0.04;
  const runs: [number, number][] = [[C.open0, C.bridge0], [C.bridge1, C.open1]];
  for (const [y0, y1] of runs) {
    // rails at 20 and 32
    for (const z of [20, 32]) {
      const [ax, ay] = iso.at(x, y0, z);
      const [bx, by] = iso.at(x, y1, z);
      const n = Math.ceil(Math.abs(bx - ax));
      for (let i = 0; i <= n; i++) {
        const X = Math.round(ax + ((bx - ax) * i) / n);
        const Y = Math.round(ay + ((by - ay) * i) / n);
        const y = y0 + ((y1 - y0) * i) / n;
        const k = heat(x, y, z, L);
        p.set(X, Y, warmBy(P, P.iron[3], k)).set(X, Y + 1, warmBy(P, P.iron[1], k));
      }
    }
    // posts every 1.2 tiles and at each end
    const posts: number[] = [];
    for (let y = y0; y < y1 - 0.3; y += 1.2) posts.push(y);
    posts.push(y1);
    for (const y of posts) {
      const [px, py] = iso.at(x, y, 0);
      const X = Math.round(px);
      const Y = Math.round(py);
      for (let v = 0; v < 36; v++) {
        const k = heat(x, y, v, L);
        p.set(X - 1, Y - v, warmBy(P, P.iron[3], k)).set(X, Y - v, warmBy(P, P.iron[2], k)).set(X + 1, Y - v, warmBy(P, P.iron[0], k));
      }
      p.set(X - 1, Y - 37, P.iron[4]).set(X, Y - 37, P.iron[3]).set(X + 1, Y - 37, P.iron[1]);
      p.set(X - 1, Y - 38, P.iron[3]).set(X, Y - 38, P.iron[2]);
    }
  }
}

// =================================================================================================
// CHAINS HUNG FROM THE DARK: links of black iron, by turns seen flat (a ring) and edge on (a bar), each lit on its left; from
// out of the dark above, where they fade, down to a hook, a shackle, a cage; and chains slung slack between two points

export function chainLink(p: Px, X: number, Y: number, flat: boolean, upright: boolean, c: readonly [string, string, string, string], dark?: (y: number) => number): void {
  const set = (x: number, y: number, k: number): void => {
    const f = dark ? dark(y) : 0;
    p.set(x, y, f > 0 ? mixC(c[k], '#050405', f) : c[k]);
  };
  if (upright) {
    if (flat) {
      // a ring seen flat: 6 wide, 8 tall, a hole 2 by 4
      for (let dy = 0; dy < 8; dy++) for (let dx = 0; dx < 6; dx++) {
        const corner = (dx === 0 || dx === 5) && (dy === 0 || dy === 7);
        if (corner) continue;
        const hole = dx >= 2 && dx <= 3 && dy >= 2 && dy <= 5;
        if (hole) continue;
        set(X - 3 + dx, Y + dy, dx <= 1 ? 3 : dx >= 4 ? 1 : dy <= 1 ? 3 : 2);
      }
    } else {
      for (let dy = 1; dy < 9; dy++) {
        set(X - 1, Y + dy, 2);
        set(X, Y + dy, 1);
      }
      set(X - 1, Y + 1, 3);
    }
  } else if (flat) {
    for (let dy = 0; dy < 6; dy++) for (let dx = 0; dx < 8; dx++) {
      const corner = (dx === 0 || dx === 7) && (dy === 0 || dy === 5);
      if (corner) continue;
      if (dx >= 2 && dx <= 5 && dy >= 2 && dy <= 3) continue;
      set(X - 4 + dx, Y - 3 + dy, dy <= 1 ? 3 : dy >= 4 ? 0 : dx <= 1 ? 3 : 2);
    }
  } else {
    for (let dx = 0; dx < 8; dx++) {
      set(X - 4 + dx, Y - 1, 3);
      set(X - 4 + dx, Y, 1);
    }
  }
}

/** A chain hanging straight down from out of the dark (y0, above the picture's top if need be) to y1. */
export function hangingChain(p: Px, X: number, y0: number, y1: number, c: readonly [string, string, string, string], fadeTo: number): void {
  const dark = (y: number): number => (y < fadeTo ? Math.min(1, (fadeTo - y) / 72) : 0);
  const darkStep = (y: number): number => [0, 0.2, 0.42, 0.66, 0.86][Math.min(4, Math.ceil(dark(y) * 4))];
  let i = 0;
  for (let y = y1 - 6 * Math.floor((y1 - y0) / 6); y < y1; y += 6) {
    if (dark(y) >= 1) {
      i++;
      continue;
    }
    chainLink(p, X, y, i++ % 2 === 0, true, c, darkStep);
  }
}

/** A chain slung slack between two points of the picture, sagging `sag` below the line between them. */
export function slungChain(p: Px, a: [number, number], b: [number, number], sag: number, c: readonly [string, string, string, string]): void {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) + sag;
  const n = Math.max(2, Math.round(len / 6));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const X = a[0] + (b[0] - a[0]) * t;
    const Y = a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t);
    const t2 = Math.min(1, t + 0.02);
    const dx = b[0] - a[0];
    const dy = (b[1] - a[1]) + sag * 4 * (1 - 2 * t2);
    const upright = Math.abs(dy) > Math.abs(dx) * 1.1;
    chainLink(p, Math.round(X), Math.round(Y) - (upright ? 4 : 0), i % 2 === 0, upright, c);
  }
}

/** A hook at a chain's end: a J of iron, its point turned up. */
export function hookAt(p: Px, X: number, Y: number, c: readonly [string, string, string, string]): void {
  for (let dy = 0; dy < 10; dy++) p.set(X - 1, Y + dy, c[3]).set(X, Y + dy, c[1]);
  const curve: [number, number][] = [[0, 10], [1, 11], [2, 12], [3, 12], [4, 12], [5, 11], [6, 10], [6, 9], [6, 8], [6, 7]];
  for (const [dx, dy] of curve) p.set(X - 1 + dx, Y + dy, dy >= 12 ? c[1] : c[2]).set(X + dx, Y + dy, c[1]);
  p.set(X + 5, Y + 6, c[3]).set(X + 6, Y + 6, c[2]);
}
/** A shackle at a chain's end: an open cuff, hinged. */
export function shackleAt(p: Px, X: number, Y: number, c: readonly [string, string, string, string]): void {
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 1.7 + Math.PI * 0.65;
    const x = Math.round(X + Math.cos(t) * 5);
    const y = Math.round(Y + 6 + Math.sin(t) * 5);
    p.set(x, y, Math.cos(t) < 0 ? c[3] : c[1]).set(x, y + 1, c[0]);
  }
}
/** A hanging cage (a gibbet's), on its chain: a ring at the top, bars down round it, a floor; seen as a drum, lit on its left. */
export function hangingCage(p: Px, X: number, Y: number, c: readonly [string, string, string, string], inside: string): void {
  const W = 9;
  const H = 30;
  // (the dark inside it first)
  for (let dy = 4; dy < H; dy++) for (let dx = -W + 1; dx < W; dx++) p.set(X + dx, Y + dy, inside);
  // its dome: rings drawn in to the hanger
  for (let dy = 0; dy < 5; dy++) {
    const w = Math.round(W * Math.sqrt(1 - ((4 - dy) / 5) ** 2));
    for (let dx = -w; dx <= w; dx++) if (Math.abs(dx) === w || dy === 4) p.set(X + dx, Y + dy, dx < 0 ? c[3] : c[1]);
  }
  // its bars: seven seen, the outer ones nearer the edge
  for (const k of [-1, -0.72, -0.38, 0, 0.38, 0.72, 1]) {
    const dx = Math.round(k * W);
    for (let dy = 4; dy <= H; dy++) p.set(X + dx, Y + dy, k < -0.1 ? c[3] : k > 0.5 ? c[0] : c[2]);
  }
  // its hoops: top, middle, floor
  for (const dy of [4, 16, H]) for (let dx = -W; dx <= W; dx++) {
    const yy = Y + dy + Math.round(Math.sqrt(Math.max(0, 1 - (dx / W) ** 2)) * 2);
    p.set(X + dx, yy, dx < 0 ? c[3] : c[1]);
  }
  p.set(X, Y - 1, c[2]).set(X, Y - 2, c[3]);
}

// =================================================================================================
// SMOKE rising (the furnace below): drifts of it over every other pair of pixels, so it reads as a haze and stays crisp

export function smokeOver(p: Px, look: Look, from: [number, number][], keepClear: [number, number, number][]): void {
  const S = PALS[look].smoke;
  if (!S) return;
  // (each source sends up three thin strands that lean and drift as they rise and break up: wisps, never a column with a shape)
  for (let py = 0; py < p.h; py += 2) for (let px = 0; px < p.w; px += 2) {
    if (((px >> 1) + (py >> 1)) % 2) continue;
    if (keepClear.some(([cx, cy, r]) => Math.hypot(px - cx, (py - cy) * 1.4) < r)) continue;
    let best = 0;
    from.forEach(([sx, sy], i) => {
      const up = sy - py;
      if (up < 6 || up > 300) return;
      const lean = i % 2 ? 1 : -1;
      for (let k = 0; k < 3; k++) {
        const cx = sx + (k - 1) * (5 + up * 0.05) + lean * up * 0.16 + Math.sin(up / 38 + k * 2.1 + i) * (3 + up * 0.04);
        const w = 2.5 + up * 0.035;
        const d = Math.abs(px + 1 - cx) / w;
        if (d >= 1) continue;
        const broken = fbm(px / 9, (py + up) / 7, 501 + k + i * 3);
        const s = (1 - up / 300) * (broken > 0.42 ? 1 : 0) * (1 - d * 0.5);
        best = Math.max(best, s);
      }
    });
    if (best < 0.25) continue;
    const c = best > 0.6 ? S[1] : S[0];
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const o = p.get(px + dx, py + dy);
      if (!o || SHINE.has(o)) continue;
      p.set(px + dx, py + dy, mixC(o, c, best > 0.6 ? 0.55 : 0.38));
    }
  }
}

// =================================================================================================
// THE GATE OF HIS OWN, in black iron, in the boss's doorway: square pillars clad in riveted plate, an arch of iron voussoirs
// on them, the face over it plated up to a cornice with a row of spikes along it; HIS MARK on the keystone, his iron face-cage
// cast in the plate, the enemy's embers behind its bars; THE PORTCULLIS at the back of the arch, drawn up, its spikes hanging
// under the crown; two great rings on the face's upper corners with a chain slung between them over the arch. An original
// design. Built as the game's boss gates are: the three tiles of the way between two pillars (art/gates.ts: SPAN 96, PILLAR
// 12), the arch springing over them; painted here slice by slice through the wall's thickness, so its inner side reads.

export const GATE_SPRING = 64;
export const GATE_FACE = 150;
const PILLAR = 12;
const R_IN = 48;
const R_OUT = 66;
/** Where the portcullis's spikes hang when it is drawn up (picture pixels over the floor). */
export const GATE_LIFT = 90;

/** The gate's face at a point: `u` across from the outer edge of the left pillar, `up` over the floor. Null: the way through. */
function gateFace(P: Pal, u: number, up: number, front: boolean, look: Look): string | null {
  const I = P.iron;
  const W = 96 + PILLAR * 2;
  const mid = W / 2;
  const du = u + 0.5 - mid;
  const dz = up + 0.5 - GATE_SPRING;
  const r = Math.hypot(du, Math.max(0, dz));
  const inWay = Math.abs(du) < 48 && (dz <= 0 || r < R_IN);
  if (inWay) return null;
  if (!front) {
    if (up > GATE_FACE + 6) return null;
    return up >= GATE_FACE + 5 ? I[3] : up % 20 === 19 ? P.seam : up % 20 === 18 ? I[2] : I[1];
  }
  // THE SPIKES along the top, over the cornice
  if (up >= GATE_FACE + 8) {
    const s = (u + 400) % 12;
    const tall = 8 + (Math.abs(du) < 8 ? 10 : 4);
    const h = up - GATE_FACE - 8;
    const half = 2.5 * (1 - h / tall);
    if (h < tall && Math.abs(s - 6) <= half) return s < 6 ? I[3] : I[1];
    return null;
  }
  // THE CORNICE, projecting: a lit top edge, a dark underside
  if (up >= GATE_FACE) return up >= GATE_FACE + 6 ? I[4] : up >= GATE_FACE + 3 ? I[3] : up === GATE_FACE ? I[0] : I[1];
  // THE PILLARS, up to the spring: riveted plate, a plinth, a capital
  const inPillar = u < PILLAR || u >= W - PILLAR;
  if (inPillar && up < GATE_SPRING + 6) {
    const pu = u < PILLAR ? u : u - (W - PILLAR);
    if (up < 8) return up === 7 ? I[4] : pu === 0 ? I[3] : I[2];
    if (up >= GATE_SPRING - 2) return up >= GATE_SPRING + 4 ? I[4] : up >= GATE_SPRING + 2 ? I[3] : I[0];
    if (pu === 0 || pu === PILLAR - 1) return pu === 0 ? I[4] : I[0];
    if ((pu === 3 || pu === 8) && up % 12 === 6) return I[4];
    if (up % 24 === 0) return I[0];
    if (up % 24 === 1) return I[3];
    return pu < 3 ? I[2] : I[1];
  }
  // THE ARCH: iron voussoirs between R_IN and R_OUT, a seam between each, a rivet in each; the keystone tall
  const ang = Math.atan2(Math.max(0, dz), du); // 0 at the right, PI at the left
  if (dz > -1 && r < R_OUT) {
    const seg = Math.floor((ang / Math.PI) * 9);
    const into = (ang / Math.PI) * 9 - seg;
    if (seg === 4) return keystone(P, du, dz, look);
    if (into < 0.06 || r < R_IN + 1.2) return r < R_IN + 1.2 ? I[4] : I[0];
    if (Math.abs(into - 0.5) < 0.09 && Math.abs(r - (R_IN + R_OUT) / 2) < 1.2) return I[4];
    if (into < 0.14) return I[3];
    return r > R_OUT - 2 ? I[0] : r > R_OUT - 4 ? I[3] : seg % 2 ? I[1] : I[2];
  }
  if (Math.abs(du) < 10 && dz > 0 && dz < GATE_FACE - GATE_SPRING) return keystone(P, du, dz, look);
  // THE FACE over and about the arch: plates of iron in courses, riveted along their seams, lit toward the left
  const row = Math.floor(up / 20);
  const lv = up % 20;
  const off = row % 2 ? 0 : 15;
  const lu = (u + off + 400) % 30;
  if (lv === 19 || lu === 0) return P.seam;
  if ((lv === 2 || lv === 16) && lu % 6 === 3) return I[4];
  if (lv === 18 || lu === 1) return I[3];
  if (lv === 17) return I[2];
  return (Math.floor((u + off + 400) / 30) + row) % 3 === 0 ? I[2] : I[1];
}

/** HIS MARK on the keystone: the iron face-cage he wore, cast in the plate, its bars over a face of dark; the enemy's embers in the eyes. */
function keystone(P: Pal, du: number, dz: number, look: Look): string {
  const I = P.iron;
  // (the keystone: a tall plate from the ring to the cornice, its edges lit and dark)
  if (Math.abs(du) >= 9) return du < 0 ? I[4] : I[0];
  // the face-cage: an oval 14 wide, 22 tall, its middle 58 over the spring
  const cx = 0;
  const cz = 58;
  const ex = (du - cx) / 7;
  const ez = (dz - cz) / 11;
  const e = Math.hypot(ex, ez);
  if (e < 1) {
    // its rim
    if (e > 0.8) return ex < 0 ? I[4] : I[1];
    // the eyes: two slits, the enemy's embers behind them (dull, the gate not yet fallen)
    if (Math.abs(dz - (cz + 3)) <= 1 && Math.abs(Math.abs(du) - 3) <= 1.5) return look === 'cold' ? '#7a1058' : '#a01a62';
    // the bars of the cage over it: three uprights and one across the mouth
    if (Math.abs(du) % 4 < 1.2 || Math.abs(dz - (cz - 4)) < 1) return Math.abs(du) % 4 < 0.6 ? I[3] : I[2];
    return P.beyond;
  }
  // a rivet at each corner of the plate
  if ((Math.abs(dz - 22) <= 1 || Math.abs(dz - 82) <= 1) && Math.abs(Math.abs(du) - 5) <= 1) return I[4];
  return du < -6 ? I[3] : I[2];
}

/** THE GATE, painted on its own picture (so the pit and the boss behind it are drawn first): pillars, arch, face, portcullis drawn up. */
export function paintGate(iso: Iso, look: Look, L: Lights): void {
  const P = PALS[look];
  const W = 96 + PILLAR * 2;
  const x0 = GATE.x0 - PILLAR / ISO_X;
  const x1 = GATE.x1 + PILLAR / ISO_X;
  const yBack = 0.4;
  const yFront = 1.0;
  const ySlot = 0.52;
  const top = GATE_FACE + 26;
  // slices from the back to the front: the inner ones its sides and its top; the portcullis between them in its slot
  for (let s = 0; ; s++) {
    const y = yBack + s / ISO_X;
    if (y > yFront) break;
    const front = y + 1 / ISO_X > yFront;
    if (Math.abs(y - ySlot) < 0.5 / ISO_X) paintPortcullis(iso, P, x0, x1, y, L);
    iso.left(x0, x1, y, 0, top, (u, v) => {
      const up = top - 1 - v;
      if (u >= W) return null;
      const c = gateFace(P, u, up, front, look);
      if (!c) return null;
      if (c === '#a01a62' || c === '#7a1058') return c;
      if (!front) return warmBy(P, c, Math.max(0, heat(x0 + u / ISO_X, y, up, L) - 1));
      return warmBy(P, c, heat(x0 + u / ISO_X, y + 0.1, up, L));
    });
  }
}
/** The portcullis drawn up into its slot: bars five wide every twelve, each ending in a spike, a heavy rail over the spikes. */
function paintPortcullis(iso: Iso, P: Pal, x0: number, x1: number, y: number, L: Lights): void {
  const I = P.iron;
  const W = 96 + PILLAR * 2;
  iso.left(x0, x1, y, 0, GATE_FACE, (u, v) => {
    const up = GATE_FACE - 1 - v;
    if (u < PILLAR || u >= W - PILLAR) return null;
    if (up < GATE_LIFT) return null;
    const b = (u - PILLAR + 400) % 12;
    const h = up - GATE_LIFT;
    // the bottom rail
    if (h >= 14 && h < 20) return h === 19 ? I[3] : h === 14 ? I[0] : I[1];
    if (h >= 34 && h < 37) return h === 36 ? I[3] : I[1];
    // the bars, their spikes below the rail
    const half = h < 14 ? 2.5 * (h / 14) : 2.5;
    if (Math.abs(b - 6) <= half) {
      const c = b < 6 ? I[3] : b > 7 ? I[0] : I[2];
      return warmBy(P, c, Math.max(0, heat(x0 + u / ISO_X, y, up, L) - 1));
    }
    return null;
  });
}
