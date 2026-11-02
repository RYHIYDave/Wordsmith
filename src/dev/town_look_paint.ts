// THE FIRST TOWN REDONE TO GO WITH FLOOR 1'S NEW LOOK, the painting (the art chat, 2 Nov 2026). A MOCK-UP; NOTHING OF THE
// GAME IMPORTS IT.
//
// His words, 2 Nov 2026, 15:37, after picking floor 1's look B (“B, roots break in”): “Unfortunately that means the first
// town is going to have to be redone as well.  In sort of the same style as the wardens.  Maybe more sun, and more plants.
// An owl in the rafters.  Hastily barricaded windows”. Read (told him so): the town's hall in floor 1's style (pale carved
// stone, roots, moss, green-gold light), but MORE SUN (above ground: broad warm daylight, the brightest place in the act),
// MORE PLANTS (ivy and vines on the stone, flowers, potted herbs, a tree's roots and branches coming in), AN OWL IN THE
// RAFTERS (the hall roofed with timber, an owl perched on a beam, alive), and HASTILY BARRICADED WINDOWS (tall windows
// boarded over in a hurry with odd planks nailed crooked, a cart wheel or a door wedged against one, sunlight knifing
// through the gaps in bright slats onto the floor: the town holding out against what comes up from the crypt).
//
// Everything the town has keeps its place (game/level.ts TOWN, game/ways.ts): the smithy, the bazaar, the wordsmith's ring,
// the Lexicon, the stash, the waypoint, the stairs down to floor 1, the shaft's head, the gate out to the Quarry, its
// people. THREE LOOKS within his words:
//   A, MORNING THROUGH THE BOARDS: the hall whole under its timber roof; a low morning sun through the boarded windows of
//      the left wall, long slats of gold across the floor, dust in them; ivy, potted herbs and flowers everywhere.
//   B, THE ROOF FALLEN IN: part of the roof fallen in at the back corner, an old tree leaning in through the hole, its roots
//      across the floor (the roots that break into floor 1's vaults below); the sun pouring through the hole, dappled by
//      its leaves; the rafters and the owl over the rest.
//   C, BARE RAFTERS AT NOON: the roof's boards gone, its rafters bare to the sky and grown over with vines; the noon sun
//      through them in a lattice of light and shade over the whole floor; grass and flowers in the joints.
//
// His art rulebook kept: crisp pixels, two to a game pixel; one camera; light from the upper left, a face turned to
// screen-left lit, one turned right in shade; the walls toward the eye cut low, as the game leaves them; daylight warm and
// honest; the town's own teal-to-cyan only where it is now (the Lexicon, the stash, the ring, the waypoint); nothing pink.
//
// Measures as the game's (art/isokit.ts): picture pixels; a tile 64 x 32 on the screen; heights up, in picture pixels.
// Painted with a DEPTH for every pixel (x + y of the world point seen there: the larger, the nearer the eye).

import { Iso, ISO_X } from '../art/isokit';
import { hash } from '../art/kit';
import { Deep, fbm, mixC, noise } from './floor1_look_paint';

export type Look = 'boards' | 'fallen' | 'rafters' | 'castle';
/** The three looks he picked from (his pick: A, “A's sun through boards (Recommended)”). */
export const LOOKS: Look[] = ['boards', 'fallen', 'rafters'];
/**
 * THE CASTLE HALL: look A carried into the castle, right inside its walls (his words, 2 Nov 2026: “Well it’s still supposed to
 * be in the castle.  Like right inside.  The barred door in the back leads out of the prison to the quarry”; his pick of the
 * three to carry in: “A's sun through boards (Recommended)”). The castle's own thick dressed stone, no timber framing and no
 * gable end; tall deep-set castle windows of two lights, hastily boarded; a great hall's timber roof (hipped, so no gable)
 * on hammer-beam trusses springing from stone corbels; the barred gate in the back wall the way out of the prison.
 */
export const CASTLE: Look = 'castle';
export const LETTER: Record<Look, string> = { boards: 'a', fallen: 'b', rafters: 'c', castle: 'castle' };
export const FILE: Record<Look, string> = { boards: 'a_morning_through_the_boards', fallen: 'b_the_roof_fallen_in', rafters: 'c_bare_rafters_at_noon', castle: 'castle_hall' };
export const CAPTION: Record<Look, string> = {
  boards: 'A. Morning through the boards: the hall under its timber roof, low sun in long gold slats through the barricaded windows.',
  fallen: 'B. The roof fallen in: an old tree leaning in through the hole, sun pouring down through its leaves, its roots across the floor.',
  rafters: 'C. Bare rafters at noon: the boards gone, vines over the rafters, the noon sun in a lattice over the whole floor.',
  castle: "The castle's hall, right inside its walls: thick dressed stone, the windows boarded in a hurry, the morning sun through the gaps.",
};

/** Five tones of a material: its seam, its shade, its body, its light, its lit edge. */
export type R5 = readonly [string, string, string, string, string];

export interface Pal {
  stone: R5;
  flags: R5;
  /** The roof's timber, the barricades' planks (odd boards, weathered), the iron of nails and the portcullis. */
  wood: R5;
  plank: R5;
  plank2: R5;
  iron: R5;
  moss: R5;
  leaf: R5;
  root: R5;
  pot: R5;
  /** The roof's boards seen from below, in their own shade. */
  boards: R5;
  seam: string;
  beyond: string;
  /** What is seen through a gap in the boards: the day outside, the sky over the roof. */
  outside: string;
  sky: string;
  /** The sun where it falls: its colour and how far a lit thing goes toward it; in the air: its colour, three steps. */
  sun: string;
  sunK: number;
  /** The day's light in the whole hall, sun or not: how far everything goes toward the sun's colour. */
  fill: number;
  air: string;
  airK: readonly [number, number, number];
  mote: string;
  /** Flowers: a few colours (none pink, none cyan). */
  flowers: readonly string[];
}

const COMMON = {
  wood: ['#22170e', '#3a2818', '#553c25', '#6e5032', '#866240'] as R5,
  iron: ['#121010', '#211d1b', '#332d29', '#463e38', '#5e544a'] as R5,
  root: ['#1c130c', '#2e2014', '#40301e', '#544028', '#6a5236'] as R5,
  pot: ['#3a1e12', '#5c2f1a', '#7e4328', '#9a5834', '#b26c44'] as R5,
  beyond: '#0b0a08',
};

export const PALS: Record<Look, Pal> = {
  // MORNING THROUGH THE BOARDS: a warm honey limestone, the sun a low gold
  boards: {
    ...COMMON,
    stone: ['#3e3528', '#605240', '#7e6e54', '#988666', '#ae9b78'],
    flags: ['#342c22', '#544a38', '#6e624a', '#84765a', '#98896a'],
    plank: ['#2a2018', '#46382a', '#615039', '#7a684c', '#92805e'],
    plank2: ['#2b1d14', '#4a3222', '#664630', '#805c40', '#987250'],
    moss: ['#1e2a12', '#2e4018', '#40561f', '#547028', '#688632'],
    leaf: ['#13240f', '#1f3a16', '#2e521d', '#3f6a26', '#548432'],
    boards: ['#120c08', '#1c140d', '#281c12', '#342518', '#43301f'],
    seam: '#211a12',
    outside: '#fff0c4',
    sky: '#2a2016',
    sun: '#ffe4a2',
    sunK: 0.6,
    fill: 0.12,
    air: '#ffe2a0',
    airK: [0.09, 0.17, 0.26],
    mote: '#fff6d8',
    flowers: ['#f2d24a', '#f6f0dc', '#e8742c', '#8c78d8', '#d8402c'],
  },
  // THE ROOF FALLEN IN: floor 1 B's greener stone, sunnier, mossed; the light green-gold through the leaves
  fallen: {
    ...COMMON,
    stone: ['#33352a', '#505442', '#6b7058', '#84896c', '#9a9f7e'],
    flags: ['#2c2e24', '#484c3a', '#62664e', '#787d62', '#8b9074'],
    plank: ['#262019', '#41382b', '#5b503d', '#746750', '#8b7d62'],
    plank2: ['#281e15', '#453424', '#5f4a33', '#786044', '#8e7454'],
    moss: ['#1a2a10', '#284216', '#38581d', '#4a7026', '#5e8830'],
    leaf: ['#12230d', '#1d3814', '#2b501b', '#3b6a24', '#4f862e'],
    boards: ['#100d09', '#1a150f', '#251e15', '#30271b', '#3d3222'],
    seam: '#1b1d15',
    outside: '#f6f4c8',
    sky: '#c4cfd2',
    sun: '#f4f0ae',
    sunK: 0.5,
    fill: 0.07,
    air: '#eef0b0',
    airK: [0.07, 0.13, 0.2],
    mote: '#f8fad8',
    flowers: ['#f2d24a', '#f4f2e0', '#e8742c', '#7c70d0'],
  },
  // BARE RAFTERS AT NOON: a pale, near-white stone, the noon sun white-gold, the sky pale over the rafters
  rafters: {
    ...COMMON,
    stone: ['#3d3c36', '#5f5d54', '#7d7a6e', '#979386', '#aeaa9a'],
    flags: ['#34332d', '#504e45', '#69665b', '#7f7c70', '#929083'],
    plank: ['#29231c', '#443a2e', '#5e5141', '#776954', '#8e7f67'],
    plank2: ['#2a1f16', '#473526', '#614a36', '#7a6046', '#907556'],
    moss: ['#1e2a12', '#2e4018', '#40561f', '#547028', '#688632'],
    leaf: ['#14260f', '#203c16', '#2f561d', '#416f27', '#568a33'],
    boards: ['#14100b', '#1f1810', '#2b2116', '#372b1d', '#463726'],
    seam: '#222019',
    outside: '#fff8e4',
    sky: '#bcc8cc',
    sun: '#fff4dc',
    sunK: 0.36,
    fill: 0,
    air: '#fff6e0',
    airK: [0.05, 0.09, 0.13],
    mote: '#ffffff',
    flowers: ['#f2d24a', '#f8f4e8', '#e8742c', '#9a7ee0', '#d8402c'],
  },
  // THE CASTLE HALL: A's morning carried in; the castle's own dressed stone, a warm grey (the prison's stone by day, the tomb's
  // pale stone under it), the sun a low gold through the boards
  castle: {
    ...COMMON,
    stone: ['#37332d', '#58524a', '#776f63', '#938a7c', '#aea595'],
    flags: ['#332e27', '#524b40', '#6c6455', '#837a69', '#978e7c'],
    plank: ['#2a2018', '#46382a', '#615039', '#7a684c', '#92805e'],
    plank2: ['#2b1d14', '#4a3222', '#664630', '#805c40', '#987250'],
    moss: ['#1e2a12', '#2e4018', '#40561f', '#547028', '#688632'],
    leaf: ['#13240f', '#1f3a16', '#2e521d', '#3f6a26', '#548432'],
    boards: ['#18110b', '#271c12', '#36271a', '#463322', '#57402b'],
    seam: '#25211b',
    outside: '#fff0c4',
    sky: '#2a2016',
    sun: '#ffe4a2',
    sunK: 0.6,
    fill: 0.12,
    air: '#ffe2a0',
    airK: [0.09, 0.17, 0.26],
    mote: '#fff6d8',
    flowers: ['#f2d24a', '#f6f0dc', '#e8742c', '#8c78d8', '#d8402c'],
  },
};

// =================================================================================================
// THE PLACE, in tiles (x down the screen to the right, y down to the left, as the game's): the town's hall as game/level.ts
// lays it, its floor x 6..21, y 6..19; its two back walls (the one at y 5, along x, lit; the one at x 5, along y, in shade)
// and the two toward the eye, cut low.

export const HALL = { x0: 6, y0: 6, x1: 22, y1: 20 };
export const WALL = 80;
/** The timber wall plate along the tops of the back walls (80 to 90), and the roof over it. */
export const PLATE = 90;
export const LOW = 16;
/** The roof: its ridge along x over the hall's middle, its pitch (picture pixels up a tile). */
export const RIDGE_Y = 13;
export const PITCH = 60;
export const roofZ = (y: number): number => PLATE + PITCH * Math.max(0, 7 - Math.abs(y - RIDGE_Y));

/** Where the town's own things stand (game/level.ts TOWN; game/ways.ts TOWN_STAIR, TOWN_SHAFT, TOWN_WAY, TOWN_GATE). */
export const TOWN_AT = {
  gateWall: { x: 12, n: 4 },
  gateWay: { x0: 13, x1: 16 },
  lexicon: [13, 12],
  stash: [12, 18],
  armourer: [19, 7],
  anvil: [19, 8],
  forge: [20, 6],
  rack: [17, 6],
  trough: [21, 6],
  tentBack: [19, 11],
  mystic: [19, 12],
  tentTable: [19, 13],
  wordsmith: [9, 14],
  runeSlab: [9, 15],
  runeStones: [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]],
  stranger: [6, 7],
  way: [9.5, 7.5],
  stair: { x: 14, y: 17, long: 3, wide: 2, kerb: 0.22, kerbH: 10 },
  shaft: [20, 18],
  braziers: [[11, 6], [16, 6], [6, 19]],
  pillars: [[10, 9], [7, 10]],
  barrels: [[21, 10], [21, 11], [6, 17]],
  urn: [20, 10],
} as const;

/** The whole picture of the town in picture pixels, where the floor's (0, 0) is on it, and where a point of the world is on it. */
export const PICTURE = { W: 1200, H: 840, OX: 568, OY: 110 };
export const atPx = (x: number, y: number, z = 0): [number, number] => [PICTURE.OX + (x - y) * 32, PICTURE.OY + (x + y) * 16 - z];
/** One phone screen (507 x 234 game pixels), the camera on the hero, a little up the screen of his feet. */
export const PHONE = { W: 1014, H: 468, lift: 28 };
/** Where the knight stands: among the vendors, between the Lexicon and the bazaar. */
export const HERO_AT: [number, number] = [15.7, 12.3];

// =================================================================================================
// Helpers

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// =================================================================================================
// THE WINDOWS AND THEIR BARRICADES: tall round-headed windows in the bays of the back walls, BOARDED OVER IN A HURRY: odd
// planks of different woods nailed across crooked, overhanging onto the stone, gaps between them; against one a CART WHEEL
// wedged, against another A DOOR off its hinges. The day shows through the gaps, and through them the sun comes in.

interface Plank { u: number; v: number; ang: number; len: number; w: number; wood: 0 | 1; seed: number }
interface WheelAt { u: number; v: number; r: number }
interface DoorAt { u: number; v: number; w: number; h: number; ang: number }
/**
 * A window: its wall, its middle along it (tiles), its opening (half wide, sill, where its head springs), what is wedged
 * against it, its planks. THE CASTLE'S (`castle`): two lights side by side under round heads, a stone MULLION between them
 * (`mull`, half its width), set deep in the wall's thickness: the embrasure round them SPLAYED (`splay` wider each side, its
 * sill sloping down), the whole under one round arch.
 */
export interface Win {
  wall: 'L' | 'R'; c: number; half: number; sill: number; spring: number; brace: 'wheel' | 'door' | null; planks: Plank[];
  wheel: WheelAt; door: DoorAt; castle?: { mull: number; splay: number };
}

/** The cart wheel against its window: its middle (u from the window's middle, up) and its radius. */
const WHEEL: WheelAt = { u: 4, v: 30, r: 21 };
/** The door against its window: its middle, its size, how it leans. */
const DOOR: DoorAt = { u: -2, v: 34, w: 46, h: 62, ang: -0.16 };
function makeWin(wall: 'L' | 'R', c: number, brace: 'wheel' | 'door' | null, seed: number): Win {
  const half = 23;
  const sill = 12;
  const spring = 55;
  const planks: Plank[] = [];
  // (the planks: nailed across where they fell, from the sill up into the arch; some long, some short, all crooked)
  const top = spring + half - 4;
  const from = brace === 'door' ? 50 : brace === 'wheel' ? 34 : sill + 6;
  let v = from;
  let i = 0;
  while (v < top && i < 9) {
    const h = (k: number): number => hash(i, seed, k);
    const w = 7 + Math.floor(h(1) * 4);
    const ang = (h(2) - 0.5) * 0.62 * (h(3) < 0.25 ? 1.6 : 1);
    const len = 2 * half + 10 + h(4) * 22;
    planks.push({ u: (h(5) - 0.5) * 10, v: v + w / 2, ang, len, w, wood: h(6) < 0.55 ? 0 : 1, seed: seed * 31 + i });
    v += w + 5 + Math.floor(h(7) * 8);
    i++;
  }
  return { wall, c, half, sill, spring, brace, planks, wheel: WHEEL, door: DOOR };
}
/**
 * THE CASTLE'S WINDOWS: tall, of two lights under round heads with a mullion between, deep in the thick wall (a splayed
 * embrasure round them); boarded over in a hurry right across the embrasure, planks of two woods nailed crooked and
 * overhanging onto the stone, from low on the sill up into the heads, gaps between them; a cart wheel against one, a door
 * off its hinges against another, planks nailed over what they leave.
 */
export const CWIN = { half: 17, mull: 2.5, sill: 18, spring: 84, splay: 8 };
function makeCastleWin(wall: 'L' | 'R', c: number, brace: 'wheel' | 'door' | null, seed: number): Win {
  const { half, sill, spring, splay } = CWIN;
  const outer = half + splay;
  const planks: Plank[] = [];
  const wheel: WheelAt = { u: 3, v: 36, r: 23 };
  const door: DoorAt = { u: -3, v: 44, w: 50, h: 76, ang: -0.12 };
  // (boarded as high as they could reach in a hurry: up to where the heads spring, the two round heads left open)
  const top = spring - 4;
  const from = brace === 'door' ? door.v + door.h / 2 - 6 : brace === 'wheel' ? wheel.v + wheel.r - 4 : sill + 4;
  let v = from;
  let i = 0;
  while (v < top && i < 12) {
    const h = (k: number): number => hash(i, seed, k);
    const w = 7 + Math.floor(h(1) * 5);
    const ang = (h(2) - 0.5) * 0.5 * (h(3) < 0.25 ? 1.7 : 1);
    const len = 2 * outer + 8 + h(4) * 20;
    planks.push({ u: (h(5) - 0.5) * 12, v: v + w / 2, ang, len, w, wood: h(6) < 0.55 ? 0 : 1, seed: seed * 31 + i });
    v += w + 3 + Math.floor(h(7) * 7);
    i++;
  }
  // (and one or two nailed up and down or slantwise over the rest, in a hurry)
  if (hash(seed, 3, 9) > 0.35) planks.push({ u: (hash(seed, 4, 9) - 0.5) * 20, v: (sill + top) / 2 + 2, ang: Math.PI / 2 + (hash(seed, 5, 9) - 0.5) * 0.5, len: top - sill + 4, w: 8, wood: 1, seed: seed * 31 + 40 });
  return { wall, c, half, sill, spring, brace, planks, wheel, door, castle: { mull: CWIN.mull, splay } };
}
/** The windows: five in the left wall (the sun's side), three in the right. */
export const WINDOWS: Win[] = [
  makeWin('L', 9, null, 11),
  makeWin('L', 11, null, 37),
  makeWin('L', 13, 'wheel', 13),
  makeWin('L', 15, null, 41),
  makeWin('L', 17, 'door', 17),
  makeWin('R', 7, null, 19),
  makeWin('R', 9, 'door', 23),
  makeWin('R', 19, null, 29),
];

/** THE CASTLE'S WINDOWS: four in the left wall (the sun's side) between the trusses, two in the right. */
export const CASTLE_WINDOWS: Win[] = [
  makeCastleWin('L', 8.5, null, 11),
  makeCastleWin('L', 11.5, 'wheel', 13),
  makeCastleWin('L', 14.5, null, 41),
  makeCastleWin('L', 17.5, 'door', 17),
  makeCastleWin('R', 8.7, 'door', 23),
  makeCastleWin('R', 18.75, null, 29),
];
/** The left wall's trusses (between its windows), along y; the right wall's are TRUSSES, along x. */
export const L_TRUSSES = [10, 13, 16];

function inOpening(W: Win, u: number, v: number): boolean {
  if (Math.abs(u) >= W.half || v < W.sill) return false;
  if (W.castle) {
    // (two lights: the mullion between, each its own round head)
    const m = W.castle.mull;
    const au = Math.abs(u);
    if (au <= m) return false;
    if (v < W.spring) return true;
    const rl = (W.half - m) / 2;
    return Math.hypot(au - (W.half + m) / 2, v - W.spring) < rl;
  }
  if (v < W.spring) return true;
  return (u / W.half) ** 2 + ((v - W.spring) / W.half) ** 2 < 1;
}
/** THE CASTLE'S WINDOW: the embrasure round its lights (the wall's thickness, splayed), under one round arch. */
function inEmbrasure(W: Win, u: number, v: number): boolean {
  if (!W.castle) return false;
  const o = W.half + W.castle.splay;
  if (Math.abs(u) >= o || v < W.sill - 6) return false;
  if (v < W.spring) return true;
  return Math.hypot(u, v - W.spring) < o;
}

type Cover = { kind: 'plank'; p: Plank; a: number; b: number } | { kind: 'wheel'; part: 'rim' | 'spoke' | 'hub'; ang: number; r: number; R: number } | { kind: 'door'; a: number; b: number; w: number; h: number };
/** What of the barricade covers a point of the window's face (u across from its middle, v up), or null. */
function coverAt(W: Win, u: number, v: number): Cover | null {
  if (W.brace === 'wheel') {
    const WH = W.wheel;
    const du = u - WH.u;
    const dv = v - WH.v;
    const r = Math.hypot(du, dv);
    if (r < WH.r) {
      const ang = Math.atan2(dv, du);
      if (r > WH.r - 4) return { kind: 'wheel', part: 'rim', ang, r, R: WH.r };
      if (r < 5) return { kind: 'wheel', part: 'hub', ang, r, R: WH.r };
      const sp = mod(ang + 0.2, Math.PI / 4);
      if (Math.abs(sp - Math.PI / 8) * r < 1.6) return { kind: 'wheel', part: 'spoke', ang, r, R: WH.r };
    }
  }
  if (W.brace === 'door') {
    const DR = W.door;
    const du = u - DR.u;
    const dv = v - DR.v;
    const c = Math.cos(DR.ang);
    const s = Math.sin(DR.ang);
    const a = du * c + dv * s;
    const b = -du * s + dv * c;
    if (Math.abs(a) < DR.w / 2 && Math.abs(b) < DR.h / 2) return { kind: 'door', a: a + DR.w / 2, b: b + DR.h / 2, w: DR.w, h: DR.h };
  }
  // (the planks, the last nailed the nearest)
  for (let i = W.planks.length - 1; i >= 0; i--) {
    const p = W.planks[i];
    const du = u - p.u;
    const dv = v - p.v;
    const c = Math.cos(p.ang);
    const s = Math.sin(p.ang);
    const a = du * c + dv * s;
    const b = -du * s + dv * c;
    if (Math.abs(a) < p.len / 2 && Math.abs(b) < p.w / 2) return { kind: 'plank', p, a: a + p.len / 2, b: b + p.w / 2 };
  }
  return null;
}
/** Is a point of a window's face a gap the day comes through? */
export function gapAt(W: Win, u: number, v: number): boolean {
  return inOpening(W, u, v) && coverAt(W, u, v) === null;
}
function winOn(wall: 'L' | 'R', along: number, look: Look = 'boards'): Win | null {
  if (look === 'castle') {
    for (const W of CASTLE_WINDOWS) if (W.wall === wall && Math.abs((along - W.c) * 32) < W.half + W.castle!.splay + 14) return W;
    return null;
  }
  for (const W of WINDOWS) if (W.wall === wall && Math.abs((along - W.c) * 32) < W.half + 40) return W;
  return null;
}

/** The colour of a barricade's piece at a point: plank (its grain, its edges, its nails), wheel, door. */
function coverColour(P: Pal, cv: Cover, down: number): string {
  if (cv.kind === 'plank') {
    const R = cv.p.wood ? P.plank2 : P.plank;
    const { a, b, p } = cv;
    // (its edges: the top lit, the foot dark; its ends sawn; a split; nails at each end over the stone)
    if (b > p.w - 1.2) return R[clampK(4 - down)];
    if (b < 1.2) return R[0];
    if (a < 1 || a > p.len - 1) return R[1];
    const nail = [6, p.len - 6].some((na) => Math.abs(a - na) < 1.2 && (Math.abs(b - p.w * 0.3) < 1.2 || Math.abs(b - p.w * 0.72) < 1.2));
    if (nail) return Math.abs(b - p.w * 0.72) < 1.2 ? P.iron[3] : P.iron[1];
    const grain = Math.abs(mod(b * 1.0 + Math.sin(a * 0.11 + p.seed) * 1.6, 3.3) - 1.6);
    let k = 2;
    if (grain < 0.35) k = 1;
    if (hash(Math.floor(a / 9), p.seed, 3) > 0.8) k += 1;
    if (Math.abs(b - p.w * 0.5 - Math.sin(a * 0.07 + p.seed) * 1.5) < 0.5 && hash(p.seed, 0, 5) > 0.5 && a > p.len * 0.3 && a < p.len * 0.7) return R[0];
    return R[clampK(k - down)];
  }
  if (cv.kind === 'wheel') {
    const W = P.wood;
    if (cv.part === 'hub') return cv.r < 2 ? P.iron[2] : W[clampK(3 - down)];
    if (cv.part === 'rim') {
      // (an iron tyre round it, the felloes' joints)
      if (cv.r > cv.R - 1.4) return cv.ang < -0.4 && cv.ang > -2.6 ? P.iron[1] : P.iron[3];
      if (mod(cv.ang + 0.4, Math.PI / 3) < 0.06) return W[0];
      return W[clampK((cv.ang > 0.6 && cv.ang < 2.6 ? 3 : 2) - down)];
    }
    return W[clampK(2 - down)];
  }
  // the door: boards up and down it, two ledges across, its ring
  const R = P.plank2;
  const { a, b, w: DW, h: DH } = cv;
  const l1 = DH * 0.22;
  const l2 = DH * 0.77;
  if (a < 1.2 || b > DH - 1.2) return R[clampK(4 - down)];
  if (a > DW - 1.2 || b < 1.2) return R[0];
  if (Math.abs(b - l1) < 4 || Math.abs(b - l2) < 4) return Math.abs(b - l1) > 3 || Math.abs(b - l2) > 3 ? R[clampK(3 - down)] : R[clampK(2 - down)];
  if (mod(a, 11.5) < 1) return R[0];
  if (Math.hypot(a - DW * 0.78, b - DH / 2) < 3.2 && Math.hypot(a - DW * 0.78, b - DH / 2) > 1.8) return P.iron[3];
  return R[clampK((hash(Math.floor(a / 11.5), 3, 77) > 0.5 ? 2 : 1) + 1 - down)];
}

// =================================================================================================
// THE SUN: where it comes from (a direction: how far toward -x and -y a ray goes for each picture pixel up), and what it
// passes through: the window's gaps, the hole in the roof and the tree's leaves (B), the bare rafters and their vines (C).

export const SUN_DIR: Record<Look, readonly [number, number]> = {
  boards: [1 / 11, 1 / 40],
  fallen: [1 / 62, 1 / 260],
  rafters: [1 / 110, 1 / 300],
  castle: [1 / 12.5, 1 / 40],
};
/** THE CASTLE: how high its stone walls stand (the roof springs from their tops), and the roof's pitch. */
export const CASTLE_TOP = 140;
export const CASTLE_PITCH = 60;
/** B: the hole broken in the roof over the back corner (in tiles, where the ray crosses the roof). */
export const HOLE = { x0: 6, x1: 11.6, y0: 6.4, y1: 11.2 };
function inHole(x: number, y: number): boolean {
  if (x < HOLE.x0 || x > HOLE.x1 || y < HOLE.y0 || y > HOLE.y1) return false;
  // (its edge broken and ragged)
  const e = Math.min(x - HOLE.x0 + 1, HOLE.x1 - x, y - HOLE.y0, HOLE.y1 - y);
  return e > 0.35 * noise(x * 3, y * 3, 41);
}
/** C: a rafter (every half tile, along y), a purlin (along x, every 70 up the slope), the vines over them. */
function rafterAt(x: number, y: number, z: number): 'rafter' | 'purlin' | 'vine' | null {
  if (Math.abs(mod(x + 0.375, 0.75) - 0.375) < 0.05) return 'rafter';
  const up = z - PLATE;
  if (up > 0 && Math.abs(mod(up + 45, 90) - 45) < 6) return 'purlin';
  if (fbm(x * 2.2, y * 2.2 + z / 90, 61) > 0.6) return 'vine';
  return null;
}

/** Is a point in the hall in the sun? 1 in it, 0 in shade (B: 0.5 where the leaves thin it). */
export function sunAt(look: Look, x: number, y: number, z: number): number {
  const [a, b] = SUN_DIR[look];
  // the left wall's plane, the right wall's, the roof: whichever the ray meets first
  const dzL = x > HALL.x0 ? (x - HALL.x0) / a : 0;
  const dzR = y > HALL.y0 ? (y - HALL.y0) / b : 0;
  let dzT = roofZ(y) - z;
  for (let i = 0; i < 3; i++) dzT = Math.max(0, roofZ(y - b * dzT) - z);
  const first = Math.min(dzL, dzR, dzT);
  if (look === 'castle') {
    // (the castle: the sun only through the gaps in the left wall's boarded windows; its roof is higher than any ray that
    // reaches that wall below its top)
    if (dzR < dzL) return 0;
    const zz = z + dzL;
    if (zz >= CASTLE_TOP) return 0;
    const yy = y - b * dzL;
    const W = winOn('L', yy, look);
    return W && gapAt(W, (yy - W.c) * 32, zz) ? 1 : 0;
  }
  if (first === dzL) {
    const zz = z + dzL;
    if (zz >= WALL) return 0;
    const yy = y - b * dzL;
    const W = winOn('L', yy);
    return W && gapAt(W, (yy - W.c) * 32, zz) ? 1 : 0;
  }
  // (the right wall's windows look away from the sun: it comes in only through the left's)
  if (first === dzR) return 0;
  const xr = x - a * dzT;
  const yr = y - b * dzT;
  const zr = z + dzT;
  if (look === 'boards') return 0;
  if (look === 'fallen') {
    if (!inHole(xr, yr)) return 0;
    // (the tree's leaves over the hole: dappled)
    const n = fbm(xr * 2.6, yr * 2.6, 83);
    return n > 0.62 ? 0 : n > 0.55 ? 0.5 : 1;
  }
  return rafterAt(xr, yr, zr) ? 0 : 1;
}

// =================================================================================================
// THE FACES OF THE WALLS: dressed stone in courses on a moulded plinth, A PILASTER every two tiles (as floor 1's), between
// them bay by bay a boarded window or plain stone; IVY climbing from the foot and hanging from the top; the timber wall
// plate along the top (80 to 90), and the hammer beams' wall posts on it (painted as solids, below).

function ashlar(P: Pal, look: Look, lit0: boolean, s: number, up: number, seed: number): string {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  const CH = 16;
  const cv = up - 12;
  const row = Math.floor(cv / CH);
  const lv = mod(cv, CH);
  const off = Math.floor(hash(row, seed, 1) * 40);
  const L = 30 + Math.floor(hash(row, seed, 2) * 14);
  const uu = s + off + 400;
  const bk = Math.floor(uu / L);
  const lu = mod(uu, L);
  if (lv === CH - 1 || lu === 0) {
    if (fbm(s / 20, up / 14, seed + 5) > (look === 'fallen' ? 0.5 : 0.6)) return P.moss[clampK(1 + (lit0 ? 1 : 0))];
    return P.seam;
  }
  let kk = 2;
  const tone = hash(bk, row * 7 + seed, 3);
  if (tone < 0.18) kk -= 1;
  else if (tone > 0.9) kk += 1;
  if (lv === CH - 2) kk += 1;
  if (lit0 && lu === 1) kk += 1;
  if (lv === 0 || lu === L - 1) kk -= 1;
  if (hash(bk, row, seed + 9) > 0.8 && lv > CH - 5 && lu < 4) kk -= 1;
  let c = S[clampK(kk - down)];
  if (up < 26 && fbm(s / 18, up / 10, seed + 7) > (look === 'fallen' ? 0.54 : 0.6)) c = P.moss[clampK(kk - down)];
  else if (up < 20) c = mixC(c, S[0], 0.14);
  return c;
}

/** IVY on a wall: where it climbs (from the foot, in columns) and where it hangs (from the plate): a leaf's tone, or null. */
function ivyAt(P: Pal, look: Look, s: number, up: number, seed: number, down: number): string | null {
  const pitch = 96;
  const c0 = Math.floor(s / pitch);
  let hit = false;
  for (let c = c0 - 1; c <= c0 + 1 && !hit; c++) {
    if (hash(c, seed, 401) > (look === 'boards' ? 0.62 : 0.72)) continue;
    const x0 = c * pitch + hash(c, seed, 403) * pitch;
    const reach = 30 + hash(c, seed, 405) * 52;
    // (a climbing mass, widest low down, a stem wandering up it)
    const wob = Math.sin(up * 0.08 + c * 2.1) * 7;
    const wide = (18 + hash(c, seed, 407) * 16) * (1 - (up / (reach + 1)) ** 2) + 3;
    if (up < reach && Math.abs(s - x0 - wob) < wide && fbm(s / 6, up / 6, seed + c) > 0.38 + (up / reach) * 0.18) hit = true;
  }
  // (hanging from the plate, in tongues)
  if (!hit && up > 52) {
    const hc = Math.floor(s / 70);
    if (hash(hc, seed, 411) < (look === 'boards' ? 0.6 : 0.45)) {
      const hx = hc * 70 + hash(hc, seed, 413) * 50;
      const len = 8 + hash(hc, seed, 415) * 24 + Math.sin(s * 0.3) * 3;
      if (Math.abs(s - hx - 10) < 16 && up > WALL - len && fbm(s / 5, up / 5, seed + 9) > 0.42) hit = true;
    }
  }
  if (!hit) return null;
  // (leaves in two-pixel clusters, lit on their upper left; now and then a flower)
  const lf = hash(s >> 1, up >> 1, seed + 417);
  if (lf > 0.985) return P.flowers[Math.floor(hash(s >> 1, up >> 1, seed + 419) * P.flowers.length)];
  const k = lf > 0.72 ? 4 : lf > 0.45 ? 3 : lf > 0.18 ? 2 : 1;
  return P.leaf[clampK(k - down)];
}

/** The face at a point (s along it in picture pixels, up over its foot); null where it is open (a window's gap shows through: `gap`). */
function faceAt(P: Pal, look: Look, wall: 'L' | 'R', s: number, up: number, seed: number): string {
  const lit0 = wall === 'R';
  const down = lit0 ? 0 : 1;
  const S = P.stone;
  // THE WALL PLATE: a beam of the roof's timber along the top, its lit edge, pegs
  if (up >= WALL) {
    const W = P.wood;
    if (up === PLATE - 1) return W[clampK(4 - down)];
    if (up === WALL) return W[0];
    if (mod(s, 80) < 1) return W[0];
    return W[clampK((up > 86 ? 3 : 2) - down)];
  }
  const along = s / 32;
  const W = winOn(wall, along);
  if (W) {
    const u = (along - W.c) * 32;
    const cv = coverAt(W, u, up);
    if (cv) return coverColour(P, cv, down);
    if (inOpening(W, u, up)) {
      // (the reveal: the stone's thickness seen down its right side and along its sill; else the day)
      const rv = W.half - Math.abs(u);
      if ((u > 0 && rv < 4) || up < W.sill + 3) return S[clampK(1 - down)];
      return P.outside;
    }
    // the frame round it: a chamfered surround, lit on its upper left
    const ring = Math.abs(u) < W.half + 5 && up >= W.sill - 3 && (up < W.spring || (u / (W.half + 5)) ** 2 + ((up - W.spring) / (W.half + 5)) ** 2 < 1);
    if (ring) {
      if (up < W.sill) return S[clampK((up === W.sill - 1 ? 4 : 2) - down)];
      return S[clampK(((u < 0 || up > W.spring + 10) ? 4 : 1) - down)];
    }
    // (a plank's shadow on the stone under it, where it overhangs)
    if (coverAt(W, u - 1, up + 2)) return mixC(ashlar(P, look, lit0, s, up, seed), '#000000', 0.38);
  }
  const iv = ivyAt(P, look, s, up, seed, down);
  if (iv) return iv;
  // THE PILASTER every two tiles: square, fluted, on its base, its capital a carved band (as floor 1's)
  const sw = mod(s, 64);
  const d = sw < 32 ? sw : sw - 64;
  if (Math.abs(d + 0.5) <= 6) {
    if (up < 14) return up === 13 ? S[clampK(4 - down)] : up === 12 ? S[clampK(1 - down)] : up < 2 ? S[clampK(1 - down)] : S[clampK(3 - down)];
    if (up >= 64 && up < 74) {
      if (up === 73) return S[clampK(4 - down)];
      if (up === 64) return P.seam;
      return mod(d + up, 4) < 2 ? S[clampK(3 - down)] : S[clampK(2 - down)];
    }
    if (d === -6) return S[clampK(4 - down)];
    if (d === -5) return S[clampK(3 - down)];
    if (d >= 5) return S[clampK(1 - down)];
    if (d === -2 || d === 2) return S[clampK(1 - down)];
    if (d === -1 || d === 3) return S[clampK(3 - down)];
    return S[clampK(2 - down)];
  }
  if (up < 12) {
    if (fbm(s / 16, up / 6, seed + 3) > 0.58) return P.moss[clampK((up > 8 ? 3 : 2) - down)];
    if (up === 11) return S[clampK(4 - down)];
    if (up === 10) return S[clampK(2 - down)];
    if (up === 9) return P.seam;
    if (up < 2) return S[clampK(1 - down)];
    return S[clampK(2 - down)];
  }
  return ashlar(P, look, lit0, s, up, seed);
}

// =================================================================================================
// THE CASTLE'S WALLS (the castle hall): its own thick DRESSED STONE in deep courses of big blocks, each block's face dressed
// with a drafted margin (its upper and left edges catching the light, its lower and right in shade), some tooled, some a
// shade apart, a putlog hole here and there; a chamfered plinth at the foot, moss in it and in the joints low down; along the
// top A CORBEL TABLE (a row of little stone corbels under a projecting course) carrying the roof's wall plate; IVY climbing
// high from the foot and hanging from the corbels; the tall deep-set windows, boarded; the trusses' stone corbels (painted
// as solids, with the trusses).

function castleAshlar(P: Pal, lit0: boolean, s: number, up: number, seed: number): string {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  const CH = 18;
  const cv = up - 14;
  const row = Math.floor(cv / CH);
  const lv = mod(cv, CH);
  const off = Math.floor(hash(row, seed, 1) * 60);
  const L = 36 + Math.floor(hash(row, seed, 2) * 22);
  const uu = s + off + 600;
  const bk = Math.floor(uu / L);
  const lu = mod(uu, L);
  if (lv === CH - 1 || lu === 0) {
    if (up < 60 && fbm(s / 20, up / 14, seed + 5) > 0.58) return P.moss[clampK(1 + (lit0 ? 1 : 0))];
    return P.seam;
  }
  let kk = 2;
  const tone = hash(bk, row * 7 + seed, 3);
  if (tone < 0.16) kk -= 1;
  else if (tone > 0.86) kk += 1;
  // (the drafted margin: the block's top and its edge toward the light catch it, its foot and far edge in shade)
  if (lv === CH - 2) kk += 1;
  if (lu === 1) kk += lit0 ? 1 : 0;
  if (lv === 0) kk -= 1;
  if (lu === L - 1) kk -= 1;
  // (some blocks tooled in fine slanting strokes)
  if (hash(bk, row, seed + 11) > 0.62 && lv > 1 && lv < CH - 2 && lu > 1 && lu < L - 1 && mod(lu + lv * 0.6, 4) < 1) kk -= 1;
  // (a putlog hole: a square socket left by the builders' scaffold)
  if (hash(bk, row, seed + 13) > 0.965 && Math.abs(lu - L / 2) < 3 && Math.abs(lv - CH / 2) < 3) return Math.abs(lu - L / 2) < 2 && lv > CH / 2 - 3 ? '#14110d' : S[0];
  if (hash(bk, row, seed + 9) > 0.8 && lv > CH - 6 && lu < 5) kk -= 1;
  let c = S[clampK(kk - down)];
  if (up < 34 && fbm(s / 18, up / 10, seed + 7) > 0.6) c = P.moss[clampK(kk - down)];
  else if (up < 24) c = mixC(c, S[0], 0.14);
  return c;
}

/** The castle's corbel table along the wall's top: little corbels every 16 under a projecting course, their shadows. */
function corbelTable(P: Pal, lit0: boolean, s: number, up: number): string | null {
  const S = P.stone;
  const down = lit0 ? 0 : 1;
  const top = CASTLE_TOP;
  if (up >= top - 7) {
    // the projecting course: its lit top edge, its face, its shadowed underside
    if (up === top - 1) return S[clampK(4 - down)];
    if (up === top - 7) return S[0];
    if (mod(s, 44) < 1) return P.seam;
    return S[clampK(3 - down)];
  }
  if (up >= top - 19) {
    // the corbels: each a block stepped in toward its foot; the wall in their shadow between them
    const cs = mod(s, 16);
    const vv = top - 8 - up;
    const w = vv < 4 ? 8 : vv < 8 ? 6 : 4;
    if (cs >= 8 - w / 2 && cs < 8 + w / 2) {
      if (cs < 8 - w / 2 + 1) return S[clampK((lit0 ? 4 : 3) - down)];
      if (cs >= 8 + w / 2 - 1) return S[clampK(1 - down)];
      if (vv === 3 || vv === 7) return S[clampK(1 - down)];
      return S[clampK(2 - down)];
    }
    return mixC(S[clampK(1 - down)], '#000000', vv < 3 ? 0.35 : 0.15);
  }
  return null;
}

/** The castle's wall at a point (s along it in picture pixels, up over its foot). */
function castleFace(P: Pal, wall: 'L' | 'R', s: number, up: number, seed: number): string {
  const lit0 = wall === 'R';
  const down = lit0 ? 0 : 1;
  const S = P.stone;
  const ct = corbelTable(P, lit0, s, up);
  if (ct) {
    const iv = up < CASTLE_TOP - 7 ? castleIvy(P, s, up, seed, down) : null;
    return iv ?? ct;
  }
  const along = s / 32;
  const W = winOn(wall, along, 'castle');
  if (W && W.castle) {
    const u = (along - W.c) * 32;
    const cv = coverAt(W, u, up);
    const emb = inEmbrasure(W, u, up);
    const o = W.half + W.castle.splay;
    // (a plank overhangs the embrasure onto the stone only so far)
    if (cv && (emb || Math.abs(u) < o + 12)) return coverColour(P, cv, down);
    if (inOpening(W, u, up)) return P.outside;
    if (emb) {
      const au = Math.abs(u);
      // the mullion: a slim shaft of the stone, chamfered, lit on its edge toward the light
      if (au <= W.castle.mull && up < W.spring + 9) return u < 0 === (wall === 'L') ? S[clampK(3 - down)] : S[clampK(2 - down)];
      // the splayed sill: it slopes down toward the room, facing up: lit
      if (up < W.sill) return S[clampK((up > W.sill - 2 ? 4 : 3) - down)];
      // the tympanum over the two heads: the wall's stone set back, in shade, a little round opening boarded
      if (up >= W.spring && au < W.half) {
        const oc = Math.hypot(u, up - W.spring - 13);
        if (oc < 4) return oc < 2.5 ? P.plank[1] : S[0];
        return mod(up, 9) < 1 ? P.seam : S[clampK(1 - down)];
      }
      // the splayed jambs and the arch's soffit: the one turned to screen-left lit, the one turned right in shade, the soffit dark
      if (up >= W.spring && Math.hypot(u, up - W.spring) > o - W.castle.splay) {
        const ang = Math.atan2(up - W.spring, u);
        return ang > 0.55 && ang < Math.PI - 0.55 ? S[0] : (u > 0) === (wall === 'L') ? S[clampK(1 - down)] : S[clampK(3 - down)];
      }
      const toLight = (u > 0) !== (wall === 'L');
      const deep = (au - W.half) / W.castle.splay;
      if (deep < 0.2) return S[0];
      return toLight ? S[clampK((deep > 0.75 ? 4 : 3) - down)] : S[clampK(1 - down)];
    }
    // the arris round the embrasure: a chamfer, lit where it turns to the light
    const ring = Math.abs(u) < o + 3 && up >= W.sill - 9 && (up < W.spring || Math.hypot(u, up - W.spring) < o + 3);
    if (ring) {
      if (up < W.sill - 6) return S[clampK((up === W.sill - 7 ? 4 : 2) - down)];
      return S[clampK((((u > 0) === (wall === 'L')) || up > W.spring + 14 ? 4 : 1) - down)];
    }
    // (a plank's shadow on the stone under it, where it overhangs)
    if (coverAt(W, u - 1, up + 2) && Math.abs(u) < o + 13) return mixC(castleAshlar(P, lit0, s, up, seed), '#000000', 0.4);
  }
  const iv = castleIvy(P, s, up, seed, down);
  if (iv) return iv;
  if (up < 14) {
    // the plinth: a chamfered course, lit along its slope, moss on it
    if (fbm(s / 16, up / 6, seed + 3) > 0.56) return P.moss[clampK((up > 9 ? 3 : 2) - down)];
    if (up === 13 || up === 12) return S[clampK(4 - down)];
    if (up === 11) return S[clampK(3 - down)];
    if (up === 10) return P.seam;
    if (mod(s + 17, 52) < 1) return P.seam;
    if (up < 2) return S[clampK(1 - down)];
    return S[clampK(2 - down)];
  }
  return castleAshlar(P, lit0, s, up, seed);
}

/** IVY on the castle's walls: climbing high from the foot in masses, hanging in tongues from the corbel table. */
function castleIvy(P: Pal, s: number, up: number, seed: number, down: number): string | null {
  const pitch = 84;
  const c0 = Math.floor(s / pitch);
  let hit = false;
  for (let c = c0 - 1; c <= c0 + 1 && !hit; c++) {
    if (hash(c, seed, 401) > 0.6) continue;
    const x0 = c * pitch + hash(c, seed, 403) * pitch;
    const reach = 40 + hash(c, seed, 405) * 80;
    const wob = Math.sin(up * 0.07 + c * 2.1) * 9;
    const wide = (16 + hash(c, seed, 407) * 16) * (1 - (up / (reach + 1)) ** 2) + 3;
    if (up < reach && Math.abs(s - x0 - wob) < wide && fbm(s / 6, up / 6, seed + c) > 0.38 + (up / reach) * 0.18) hit = true;
    // (a stem going on up from the mass, leaves along it)
    if (!hit && up < reach * 1.5 && up > reach * 0.6 && Math.abs(s - x0 - Math.sin(up * 0.11 + c) * 6) < 2.5 && hash(c, seed, 409) > 0.4) hit = fbm(s / 4, up / 4, seed + c * 3) > 0.32;
  }
  if (!hit && up > CASTLE_TOP - 60) {
    const hc = Math.floor(s / 64);
    if (hash(hc, seed, 411) < 0.55) {
      const hx = hc * 64 + hash(hc, seed, 413) * 44;
      const len = 14 + hash(hc, seed, 415) * 36 + Math.sin(s * 0.3) * 3;
      if (Math.abs(s - hx - 10) < 14 - (CASTLE_TOP - up) * 0.12 && up > CASTLE_TOP - 7 - len && fbm(s / 5, up / 5, seed + 9) > 0.4) hit = true;
    }
  }
  if (!hit) return null;
  const lf = hash(s >> 1, up >> 1, seed + 417);
  if (lf > 0.982) return P.flowers[Math.floor(hash(s >> 1, up >> 1, seed + 419) * P.flowers.length)];
  const k = lf > 0.72 ? 4 : lf > 0.45 ? 3 : lf > 0.18 ? 2 : 1;
  return P.leaf[clampK(k - down)];
}

// =================================================================================================
// THE GATE OUT TO THE QUARRY, in the right wall where the game has it (its doorway x 13 to 16): a round-headed way under a
// ring of voussoirs, standing whole over the wall plate; its portcullis down, the bright day outside through its bars.

export const GWAY = { half: 48, spring: 46, rise: 40, ring: 12, top: 108 };
const GATE_MID = (TOWN_AT.gateWay.x0 + TOWN_AT.gateWay.x1) / 2;
function inRound(du: number, up: number, half: number, spring: number, rise: number): boolean {
  if (Math.abs(du) >= half) return false;
  if (up < spring) return true;
  return (du / half) ** 2 + ((up - spring) / rise) ** 2 < 1;
}
/** The gate's face at a point: the stone round the way, or null (the way, or the air over it). */
function gateFace(P: Pal, du: number, up: number): string | null | 'way' {
  const S = P.stone;
  const outer = GWAY.half + GWAY.ring + 10;
  if (Math.abs(du) >= outer) return null;
  if (inRound(du, up, GWAY.half, GWAY.spring, GWAY.rise)) return 'way';
  if (up >= GWAY.top) return null;
  // the cornice over it, lit along its top
  if (up >= GWAY.top - 6) return up === GWAY.top - 1 ? S[4] : up === GWAY.top - 6 ? P.seam : S[3];
  if (!inRound(du, up, GWAY.half + GWAY.ring, GWAY.spring, GWAY.rise + GWAY.ring)) {
    // the squared stone round the ring
    if (Math.abs(du) > outer - 1.5) return du < 0 ? S[4] : S[1];
    if (mod(up, 14) === 13) return P.seam;
    return S[2];
  }
  // the voussoirs, the keystone
  const ang = Math.atan2(Math.max(0, up - GWAY.spring), du * (GWAY.rise / GWAY.half));
  const n = 11;
  const idx = Math.floor((ang / Math.PI) * n + 0.5);
  const into = (ang / Math.PI) * n + 0.5 - idx;
  if (up >= GWAY.spring && into < 0.08) return P.seam;
  if (!inRound(du, up + 1.2, GWAY.half + GWAY.ring - 1.2, GWAY.spring, GWAY.rise + GWAY.ring - 1.2)) return P.seam;
  if (!inRound(du, up - 1.5, GWAY.half + 1.5, GWAY.spring, GWAY.rise + 1.5) && (du < 0 || up > GWAY.spring + 24)) return S[4];
  if (up < GWAY.spring) return mod(up, 16) === 15 ? P.seam : du < 0 ? S[3] : S[2];
  return S[idx % 2 ? 3 : 2];
}


/**
 * THE CASTLE'S GATE OUT (the castle hall): the town's gate in the right wall where the game has it, the way out of the
 * prison to the Quarry. The castle's stone round it: big QUOINS up its jambs, long and short in turn; a ring of VOUSSOIRS
 * with a keystone; a hood mould over them. In the way, its PORTCULLIS down, as the game draws it (art/gates.ts
 * `makePortcullis`: an upright every quarter of a tile ending in a spike, a cross bar every 14), in grey steel; through its
 * bars the passage through the thick wall and the bright day beyond: the road out, its ruts, grass, quarried blocks by it.
 */
export const CGATE = { half: 48, spring: 58, rise: 40, ring: 14, hood: 3, bars: 5.66, outer: 4.75 };
function castleGateFace(P: Pal, du: number, up: number): string | null | 'way' {
  const S = P.stone;
  const G = CGATE;
  const au = Math.abs(du);
  if (au >= G.half + 24) return null;
  if (inRound(du, up, G.half, G.spring, G.rise)) return 'way';
  const lightSide = du < 0;
  // the hood mould over the ring: a projecting label, its top lit, its foot in shadow; it stops on a carved stop each side
  if (up >= G.spring - 6 && inRound(du, up, G.half + G.ring + G.hood, G.spring, G.rise + G.ring + G.hood) && !inRound(du, up, G.half + G.ring, G.spring, G.rise + G.ring)) {
    if (up < G.spring) return au > G.half + G.ring - 1 ? S[lightSide ? 3 : 2] : null;
    if (!inRound(du, up - 1, G.half + G.ring + G.hood, G.spring, G.rise + G.ring + G.hood)) return S[4];
    if (!inRound(du, up + 1, G.half + G.ring, G.spring, G.rise + G.ring)) return S[0];
    return S[3];
  }
  if (up >= G.spring && inRound(du, up, G.half + G.ring, G.spring, G.rise + G.ring)) {
    // the voussoirs, the keystone
    const ang = Math.atan2(Math.max(0, up - G.spring), du * (G.rise / G.half));
    const n = 13;
    const idx = Math.floor((ang / Math.PI) * n);
    const into = (ang / Math.PI) * n - idx;
    if (into < 0.07) return P.seam;
    const key = idx === Math.floor(n / 2);
    if (!inRound(du, up - 1.5, G.half + 1.5, G.spring, G.rise + 1.5)) return lightSide || up > G.spring + 26 ? S[4] : S[2];
    if (!inRound(du, up + 1.2, G.half + G.ring - 1.2, G.spring, G.rise + G.ring - 1.2)) return key ? S[3] : S[1];
    if (key) return into < 0.25 ? S[4] : S[3];
    return S[idx % 2 ? 3 : 2];
  }
  if (up < G.spring) {
    // the jambs: quoins, long and short in turn, their faces dressed; the arris of the way lit on the side toward the light
    const course = Math.floor(up / 14);
    const lv = mod(up, 14);
    const w = course % 2 ? 22 : 14;
    if (au < G.half + w) {
      if (lv === 13) return P.seam;
      if (au < G.half + 1.6) return lightSide ? S[4] : S[1];
      if (au > G.half + w - 1.2) return P.seam;
      if (lv === 12) return S[lightSide ? 4 : 3];
      return S[lightSide ? 3 : 2];
    }
  }
  return null;
}
/** Through the castle's gate: the portcullis, the passage through the wall, the day beyond. */
function castleThroughGate(P: Pal, q: number, sy: number, tFace: number): [string, number] | null {
  const G = CGATE;
  // the portcullis down, in the plane of its grooves near the wall's inner face
  {
    const t = 2 * G.bars + q;
    const x = G.bars + q;
    const z = 16 * t - sy;
    const du = (x - GATE_MID) * 32;
    if (z >= 0 && inRound(du, z, G.half, G.spring, G.rise)) {
      const u = Math.floor(du + G.half);
      const up = Math.floor(z);
      const SPIKE = 7;
      const STEEL = ['#1b1b1e', '#2e2f33', '#4f5156', '#7e8186', '#b4b6ba'];
      // (the grooves it runs in, either side)
      if (u < 3 || u > 2 * G.half - 4) return [u < 3 ? STEEL[1] : STEEL[0], t];
      // the cross bars
      for (let b = SPIKE + 5; b <= G.spring + G.rise + 8; b += 14) {
        if (up === b + 1) return [STEEL[4], t];
        if (up === b) return [STEEL[3], t];
        if (up === b - 1) return [STEEL[2], t];
        if (up === b - 2) return [STEEL[1], t];
      }
      // the uprights, each to a spike
      const k = mod(u - 3, 8);
      if (up < SPIKE) {
        if (k === 1) return [STEEL[4], t];
        if (k === 0 && up >= 2) return [STEEL[3], t];
        if (k === 2 && up >= SPIKE / 2) return [STEEL[2], t];
      } else if (k < 4) return [[STEEL[4], STEEL[3], STEEL[2], STEEL[1]][k], t];
    }
  }
  // the passage's jambs and soffit (the wall's thickness), in shade, coursed
  const tO = 2 * G.outer + q;
  const xO = G.outer + q;
  const zO = 16 * tO - sy;
  const duO = (xO - GATE_MID) * 32;
  if (!inRound(duO, zO, G.half, G.spring, G.rise)) {
    // (lit from the day at its outer end)
    const c = mod(zO, 14) < 1 ? P.seam : zO > G.spring ? P.stone[1] : P.stone[2];
    return [c, tFace - 0.2];
  }
  // the ground: in the passage its worn flags in shade, the day spilling in from beyond; out past it the day
  const tg = sy / 16;
  const gx = (tg + q) / 2;
  const gy = (tg - q) / 2;
  if (gy >= G.outer) {
    const f = flagT(gx, gy, 917);
    const c = f < 0 ? P.seam : P.flags[clampK(f - 1)];
    return [mixC(c, P.outside, Math.max(0.15, Math.min(0.7, (6.1 - gy) * 0.5))), tg];
  }
  // OUTSIDE, in the sun: the road out to the Quarry, pale dust with a cart's ruts, grass either side, a quarried block or two
  const n = fbm(gx * 3, gy * 3, 71);
  const roadD = Math.abs(gx - GATE_MID - (G.outer - gy) * 0.25);
  let c: string;
  if (roadD < 1.15) {
    c = n > 0.6 ? '#e2d0a6' : '#d4c094';
    if (Math.abs(roadD - 0.55) < 0.07) c = '#b8a47a';
  } else c = n > 0.55 ? '#9cb256' : '#86a04a';
  const bx = gx - GATE_MID - 1.7;
  if (Math.abs(bx) < 0.32 && Math.abs(gy - 3.4) < 0.22) c = gy < 3.3 ? '#efe6d2' : '#cfc4ac';
  return [mixC(c, P.outside, Math.min(0.6, 0.22 + (G.outer - gy) * 0.12)), tg];
}

// =================================================================================================
// THE STAIRS DOWN TO FLOOR 1, where the game opens them (TOWN_STAIR: three tiles along x by two, by the stash): a broad
// flight going down under the hall's floor toward +x, a low parapet of the hall's stone round three sides of it, open at
// the top of its steps; down it the hall's stone turns to floor 1's (mossed, damp, a root through its side), and at its
// foot floor 1's green-gold light.

const ST = TOWN_AT.stair;
const WELL = { x0: ST.x, x1: ST.x + ST.long, y0: ST.y, y1: ST.y + ST.wide };
const STEP = { run: 0.27, rise: 11 };
const stepTop = (x: number): number => {
  const d = x - WELL.x0;
  if (d < 0) return 0;
  return -(Math.floor(d / STEP.run) + 1) * STEP.rise;
};
function inWellOpening(x: number, y: number): boolean {
  return x > WELL.x0 && x < WELL.x1 - ST.kerb && y > WELL.y0 + ST.kerb && y < WELL.y1 - ST.kerb;
}
/** What is seen down the stairwell along a line of sight entering its opening at t0: a colour and its depth. */
function downTheWell(P: Pal, q: number, sy: number, t0: number): [string, number] {
  const S = P.stone;
  for (let t = t0; t > t0 - 14; t -= 0.012) {
    const x = (t + q) / 2;
    const y = (t - q) / 2;
    const z = 16 * t - sy;
    const yIn = y - (WELL.y0 + ST.kerb);
    const yOut = WELL.y1 - ST.kerb - y;
    const deep = Math.min(1, -z / 130);
    // (the colour turning to floor 1's on the way down: greener, mossed, darker, then floor 1's light at the foot)
    const tone = (c: string): string => {
      let o = mixC(c, '#0c120a', deep * 0.62);
      if (deep > 0.55) o = mixC(o, '#a0aa5e', (deep - 0.55) * 0.35);
      return o;
    };
    if (yIn < 0 || yOut < 0) {
      // a side wall of the way: coursed, moss in its joints lower down, a root coming through
      const course = Math.floor(-z / 12);
      const ru = Math.abs(x - 15.6 - Math.sin(z * 0.05) * 0.15);
      if (yIn < 0 && ru < 0.07 && z < -10) return [tone(P.root[ru < 0.03 ? 3 : 2]), t];
      const joint = mod(-z, 12) < 1 || mod(x * 32 + (course % 2) * 14, 28) < 1;
      let c = joint ? (deep > 0.3 && hash(Math.floor(x * 8), course, 7) > 0.4 ? P.moss[2] : P.seam) : yIn < 0 ? S[1] : S[2];
      if (!joint && deep > 0.35 && fbm(x * 6, z / 10, 9) > 0.55) c = P.moss[yIn < 0 ? 1 : 2];
      return [tone(c), t];
    }
    if (x >= WELL.x1 - ST.kerb) return [tone(S[1]), t];
    const st = stepTop(x);
    if (z <= st) {
      const into = mod(x - WELL.x0, STEP.run) / STEP.run;
      const onTread = z > st - 1.2;
      let c: string;
      if (onTread) {
        c = into < 0.2 ? S[4] : into > 0.8 ? S[2] : S[3];
        if (Math.abs(mod((y - WELL.y0) * 32, 22) - 11) > 10.2) c = P.seam;
        if (deep > 0.3 && fbm(x * 9, y * 9, 13) > 0.6) c = P.moss[3];
      } else c = z > st - 3 ? S[2] : S[1];
      return [tone(c), t];
    }
  }
  return ['#0c120a', t0 - 14];
}

// =================================================================================================
// THE FLOOR: pale flags a tile each with a carved border (as floor 1's), worn; moss in the joints, grass and little flowers
// coming up in them (C most), leaves blown in; THE TREE'S ROOTS through the left wall's foot (B: thick across the floor).

function flagT(x: number, y: number, seed: number): number {
  const fu = x - Math.floor(x);
  const fv = y - Math.floor(y);
  const e = Math.min(fu, fv, 1 - fu, 1 - fv);
  if (e < 0.025) return -1;
  if (e < 0.06) return fu < 0.06 || 1 - fv < 0.06 ? 4 : 1;
  const tone = hash(Math.floor(x), Math.floor(y), seed);
  let k = tone < 0.22 ? 1 : tone > 0.88 ? 3 : 2;
  const n = fbm(x * 5, y * 5, seed + 2);
  if (n > 0.66) k += 1;
  if (n < 0.3) k -= 1;
  if (hash(Math.floor(x), Math.floor(y), seed + 4) > 0.78 && Math.abs(fv - 0.5 - (fu - 0.5) * 0.7 + Math.sin(fu * 13) * 0.04) < 0.014) return -1;
  return clampK(k);
}

/** The tree's roots across the floor: polylines from the walls' feet. B's thick, from the back corner; A's and C's few. */
export const FLOOR_ROOTS: Record<Look, readonly (readonly [number, number])[][]> = {
  boards: [[[6, 11.4], [6.7, 11.8], [7.2, 11.5], [7.7, 12.0]], [[6, 18.3], [6.6, 18.7], [7.1, 18.5]]],
  fallen: [
    [[6, 6.6], [6.9, 6.3], [7.8, 6.8], [8.6, 6.5], [9.0, 6.0]], [[6.2, 6], [6.6, 6.9], [6.4, 8.2], [7.2, 9.0], [7.6, 8.8]],
    [[6, 8.8], [6.8, 9.3], [7.1, 10.3]], [[6, 11.6], [6.8, 11.9], [7.4, 11.4]], [[10.5, 6], [11.0, 7.0], [10.6, 7.8]],
  ],
  rafters: [[[6, 11.4], [6.7, 11.8], [7.2, 11.5], [7.7, 12.0]], [[6, 7.4], [6.8, 7.0], [7.4, 6.6]]],
  castle: [],
};
function rootDist(look: Look, x: number, y: number): { d: number; w: number } {
  let best = { d: 9, w: 0 };
  const thick = look === 'fallen' ? 0.24 : 0.14;
  FLOOR_ROOTS[look].forEach((pl, i) => {
    for (let k = 0; k + 1 < pl.length; k++) {
      const [ax, ay] = pl[k];
      const [bx, by] = pl[k + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const L2 = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2));
      const d = Math.hypot(x - ax - dx * t, y - ay - dy * t) + Math.sin((k + t) * 9 + i) * 0.02;
      const w = thick - ((k + t) / pl.length) * thick * 0.55;
      if (d - w < best.d - best.w) best = { d, w };
    }
  });
  return best;
}

// =================================================================================================
// THE PICTURE OF THE PLACE: for every pixel its line of sight is followed into the hall (x = (t + q) / 2, y = (t - q) / 2,
// z = 16 t - sy, q = sx / 32; t = x + y, the larger the nearer) and the nearest of the floor, the stairwell, the two back
// walls and their windows, the gate, the gable over the left wall and the roof's underside over the right is painted.

/** A colour in the sun, or not. */
export function sunlit(P: Pal, c: string, s: number): string {
  if (P.fill > 0) c = mixC(c, P.sun, P.fill);
  return s > 0 ? mixC(c, P.sun, P.sunK * (s >= 1 ? 1 : 0.55)) : c;
}

export function paintPlace(D: Deep, look: Look): void {
  const P = PALS[look];
  const { OX, OY } = PICTURE;
  for (let py = 0; py < D.h; py++) {
    const sy = py + 0.5 - OY;
    for (let px = 0; px < D.w; px++) {
      const q = (px + 0.5 - OX) / 32;
      let best = -1e9;
      let col: string | null = null;
      // THE FLOOR (and down the stairwell)
      {
        const t = sy / 16;
        const x = (t + q) / 2;
        const y = (t - q) / 2;
        if (x >= HALL.x0 && x < HALL.x1 && y >= HALL.y0 && y < HALL.y1) {
          if (inWellOpening(x, y)) {
            const [c, tt] = downTheWell(P, q, sy, t);
            best = tt;
            col = c;
          } else {
            best = t;
            col = floorAt(P, look, x, y);
          }
        }
      }
      // THE LEFT WALL'S FACE (x = 6), and over it the gable to the roof's line
      {
        const t = 2 * HALL.x0 - q;
        const y = HALL.x0 - q;
        const z = 16 * t - sy;
        if (look === 'castle') {
          if (t > best && y >= HALL.y0 && y < HALL.y1 + 1 && z >= 0 && z < CASTLE_TOP) {
            best = t;
            col = castleFace(P, 'L', y * 32, Math.floor(z), 17);
            if (col !== P.outside) col = sunlit(P, col, 0);
          }
        } else if (t > best && y >= HALL.y0 && y < HALL.y1 + 1 && z >= 0) {
          const top = look === 'fallen' && y > 6.4 && y < 12.2 ? Math.min(roofZ(y), 128 + 30 * noise(y * 2.2, 1, 5) + (y - 6) * 6) : roofZ(y);
          if (z < top) {
            best = t;
            col = z < PLATE ? faceAt(P, look, 'L', y * 32, Math.floor(z), 17) : gableAt(P, look, y, z, top);
            if (col !== P.outside) col = sunlit(P, col, 0);
          } else if (z < roofZ(y)) {
            // (B: over the gable's broken top, the sky)
            best = t;
            col = P.sky;
          }
        }
      }
      // THE RIGHT WALL'S FACE (y = 6), the gate in it
      {
        const t = 2 * HALL.y0 + q;
        const x = HALL.y0 + q;
        const z = 16 * t - sy;
        if (look === 'castle') {
          if (t > best && x >= HALL.x0 && x < HALL.x1 + 1 && z >= 0 && z < CASTLE_TOP) {
            const g = castleGateFace(P, (x - GATE_MID) * 32, Math.floor(z));
            if (g === 'way') {
              const out = castleThroughGate(P, q, sy, t);
              if (out) {
                best = out[1];
                col = out[0];
              }
            } else {
              best = t;
              col = g ?? castleFace(P, 'R', x * 32, Math.floor(z), 19);
              if (col !== P.outside) col = sunlit(P, col, 0);
            }
          }
        } else if (t > best && x >= HALL.x0 && x < HALL.x1 + 1 && z >= 0) {
          const du = (x - GATE_MID) * 32;
          const g = gateFace(P, du, Math.floor(z));
          if (g === 'way') {
            // through the way: the portcullis, the day outside
            const out = throughGate(P, look, q, sy, t);
            if (out) {
              best = out[1];
              col = out[0];
            }
          } else if (g) {
            best = t;
            col = sunlit(P, g, sunAt(look, x, HALL.y0 + 0.02, z));
          } else if (z < PLATE) {
            best = t;
            col = sunlit(P, faceAt(P, look, 'R', x * 32, Math.floor(z), 19), z < WALL ? sunAt(look, x, HALL.y0 + 0.02, z) : 0);
          }
        }
      }
      // THE CASTLE HALL'S ROOF: hipped, its two slopes rising from the tops of both back walls
      if (look === 'castle') {
        const TOP = CASTLE_TOP;
        const PI = CASTLE_PITCH;
        const cands: [number, 'X' | 'Y'][] = [
          [(TOP - 6 * PI - (PI * q) / 2 + sy) / (16 - PI / 2), 'Y'],
          [(TOP - 6 * PI + (PI * q) / 2 + sy) / (16 - PI / 2), 'X'],
        ];
        for (const [tr, plane] of cands) {
          const x = (tr + q) / 2;
          const y = (tr - q) / 2;
          const z = 16 * tr - sy;
          const dx = x - HALL.x0;
          const dy = y - HALL.y0;
          const ok = plane === 'Y' ? dy >= 0 && dy <= dx : dx >= 0 && dx <= dy;
          if (tr > best && ok && x < HALL.x1 + 1 && y < HALL.y1 + 1 && Math.min(dx, dy) <= 7 && z >= TOP) {
            best = tr;
            col = castleRoofAt(P, x, y, z, plane);
          }
        }
      }
      // THE ROOF'S UNDERSIDE over the right wall (the back slope, up to the ridge): boards on rafters (A, B), bare rafters (C)
      else {
        // z = 16 t - sy and z = PLATE + PITCH (y - 6), y = (t - q) / 2:  t (16 - PITCH / 2) = PLATE - 6 PITCH - PITCH q / 2 + sy
        const tr = (PLATE - 6 * PITCH - (PITCH * q) / 2 + sy) / (16 - PITCH / 2);
        const x = (tr + q) / 2;
        const y = (tr - q) / 2;
        const z = 16 * tr - sy;
        if (tr > best && x >= HALL.x0 && x < HALL.x1 && y >= HALL.y0 && y <= RIDGE_Y && z >= PLATE) {
          const c = roofAt(P, look, x, y, z);
          if (c) {
            best = tr;
            col = c;
          }
        }
      }
      if (col !== null) {
        D.depth = best;
        D.set(px, py, col);
      }
    }
  }
}

function floorAt(P: Pal, look: Look, x: number, y: number): string {
  const F = P.flags;
  const f = flagT(x, y, 911);
  let c = f < 0 ? P.seam : F[f];
  // worn smooth and lighter where they walk (the middle, the ways to each place)
  if (f >= 0 && fbm(x * 1.1, y * 1.1, 913) > 0.6) c = F[clampK(f + 1)];
  // the joints: moss, and grass coming up (C most), little flowers
  if (f < 0) {
    const g = fbm(x * 4, y * 4, 915);
    if (g > (look === 'rafters' ? 0.44 : look === 'fallen' ? 0.46 : 0.56)) c = P.moss[g > 0.62 ? 3 : 2];
  }
  // damp at the walls' feet, moss creeping out
  const nf = Math.min(x - HALL.x0, y - HALL.y0);
  if (nf < 0.5 && fbm(x * 6, y * 6, 917) > 0.5 + nf * 0.3) c = P.moss[2];
  // THE ROOTS
  const rd = rootDist(look, x, y);
  if (rd.d < rd.w) {
    const a = rd.d / rd.w;
    c = P.root[a < 0.3 ? 4 : a < 0.6 ? 3 : a < 0.85 ? 2 : 1];
    if (look === 'fallen' && a < 0.5 && fbm(x * 9, y * 9, 919) > 0.62) c = P.moss[3];
  } else if (rd.d < rd.w + 0.045) c = P.seam;
  else if (rd.d < rd.w + 0.16 && f >= 0 && hash(Math.floor(x * 12), Math.floor(y * 12), 921) > 0.55) c = F[clampK(f - 1)];
  // in the shade at the far walls' feet
  if (nf < 0.12) c = mixC(c, P.beyond, 0.3);
  return sunlit(P, c, sunAt(look, x, y, 0));
}

/** The gable over the left wall, up to the roof's line: the wall's stone going on up, in shade; the roof's edge along its top. */
function gableAt(P: Pal, look: Look, y: number, z: number, top: number): string {
  const S = P.stone;
  const s = y * 32;
  const up = Math.floor(z);
  if (top - z < 6) {
    // B: its broken top, ragged, mossed; else the roof's verge, a board along its edge
    if (look === 'fallen' && top < roofZ(y) - 1) return top - z < 3 ? P.moss[2] : S[2];
    return top - z < 2 ? P.wood[2] : P.wood[1];
  }
  // a round window high in it, boarded (A, B); open to the sky (C)
  const ow = Math.hypot((y - 13) * 32, z - 230);
  if (ow < 30) {
    if (ow > 25) return S[ow > 28 ? 1 : 3];
    if (look === 'rafters') return P.sky;
    const across = mod(z - 230 + (y - 13) * 32 * 0.2 + 40, 13);
    return across < 9 ? P.plank[across < 1.5 ? 0 : across > 7.5 ? 3 : 2] : P.outside;
  }
  const iv = ivyAt(P, look, s, Math.floor(z - PLATE) + 40, 23, 1);
  if (iv && z < PLATE + 60) return iv;
  // HALF-TIMBERED: posts every one and a half tiles, rails every 64 up, a brace across each panel; lime plaster between,
  // fallen away in patches to the wattle under it
  const W = P.wood;
  const ps = mod(s, 48);
  const pz = mod(z - PLATE, 64);
  if (ps < 6) return ps < 1 ? W[0] : ps < 2 ? W[2] : W[1];
  if (pz < 6) return pz < 1 ? W[0] : pz > 4 ? W[2] : W[1];
  const pi = Math.floor(s / 48) + Math.floor((z - PLATE) / 64);
  const diag = (pi & 1 ? ps : 48 - ps) * (58 / 42) - (pz - 6);
  if (Math.abs(diag) < 4) return Math.abs(diag) < 1 ? W[0] : W[1];
  const L = PLASTER[look];
  if (fbm(s / 14, z / 14, 31) > 0.74) {
    // the wattle where the plaster has gone
    return mod(z + (Math.floor(s / 5) & 1 ? 2 : 0), 4) < 2 ? W[1] : W[0];
  }
  const n = fbm(s / 9, z / 9, 33);
  return L[n > 0.62 ? 3 : n > 0.36 ? 2 : 1];
}
/** The gable's lime plaster, in shade (it faces away from the sun), stained low down. */
const PLASTER: Record<Look, R5> = {
  boards: ['#4a4234', '#7c7058', '#91846a', '#a49678', '#b8aa8a'],
  fallen: ['#40432f', '#6e7258', '#828769', '#959a7a', '#a8ad8c'],
  rafters: ['#474640', '#7a776a', '#8e8b7d', '#a29e8e', '#b6b2a0'],
  castle: ['#474640', '#7a776a', '#8e8b7d', '#a29e8e', '#b6b2a0'],
};

/** The roof's underside at a point of the back slope: its principal rafters over the hammer beams, its common rafters, its purlins, its boards; A and B boarded, B broken through at the back corner, C bare to the sky. */
function roofAt(P: Pal, look: Look, x: number, y: number, z: number): string | null {
  const W = P.wood;
  // the principal rafters over the trusses
  for (const xt of TRUSSES) if (Math.abs(x - xt) < 0.13) return Math.abs(x - xt) > 0.09 ? W[x < xt ? 3 : 1] : W[2];
  const up = z - PLATE;
  const purl = look === 'rafters' ? Math.abs(mod(up + 45, 90) - 45) - 2 : Math.abs(mod(up + 35, 70) - 35);
  const raft = look === 'rafters' ? Math.abs(mod(x + 0.375, 0.75) - 0.375) - 0.01 : Math.abs(mod(x + 0.25, 0.5) - 0.25);
  if (look === 'fallen' && inHole(x, y)) {
    // the broken ends of rafters sticking out over the hole, else the tree and the sky through it (painted after)
    const e = Math.min(x - HOLE.x0 + 1, HOLE.x1 - x, y - HOLE.y0, HOLE.y1 - y);
    if (raft < 0.04 && e < 0.9 && hash(Math.floor((x + 0.25) * 2), 0, 51) > 0.3) return W[1];
    return P.sky;
  }
  if (purl < 4) return purl < 1 ? W[3] : W[purl < 3 ? 2 : 1];
  if (raft < 0.04) return raft < 0.015 ? W[2] : W[1];
  if (look === 'rafters') {
    const v = rafterAt(x, y, z);
    if (v === 'vine') {
      const lf = hash(Math.floor(x * 64), Math.floor(z / 2), 63);
      if (lf > 0.97) return P.flowers[Math.floor(hash(Math.floor(x * 64), Math.floor(z / 2), 65) * P.flowers.length)];
      return P.leaf[lf > 0.6 ? 3 : lf > 0.3 ? 2 : 1];
    }
    return P.sky;
  }
  // the boards, laid across the rafters, a gap of daylight here and there between them
  const B = P.boards;
  const bd = mod(up, 9);
  if (bd < 1) {
    if (hash(Math.floor(up / 9), Math.floor(x * 3), 67) > 0.93) return P.outside;
    return B[0];
  }
  return B[hash(Math.floor(up / 9), Math.floor(x * 1.5), 69) > 0.7 ? 3 : 2];
}
/** The trusses' places along x (none over the gate's way). */
export const TRUSSES = [7.5, 10.5, 17.5, 20.5];

/**
 * THE CASTLE HALL'S ROOF, seen from under it: a great hall's timber roof, HIPPED (it slopes up from the tops of both back
 * walls, so there is no gable end), on its trusses. Its wall plate on the corbel table; its principal rafters over the
 * trusses; the HIP RAFTER over the back corner where the two slopes meet; purlins along the slopes; common rafters between,
 * stopping on the hip; the boards over them, a chink of day here and there. The slope over the right wall (turned to
 * screen-left) a shade lighter than the one over the left.
 */
function castleRoofAt(P: Pal, x: number, y: number, z: number, plane: 'X' | 'Y'): string {
  const W = P.wood;
  const B = P.boards;
  const along = plane === 'Y' ? x : y;
  const up = z - CASTLE_TOP;
  const d = plane === 'Y' ? 0 : 1;
  // the wall plate: a beam along the wall's top, lit along its foot by the hall's light, pegged
  if (up < 10) {
    if (up < 1) return W[0];
    if (up < 3) return W[clampK(4 - d)];
    if (mod(along * 32, 40) < 1.2 && up > 4 && up < 7) return W[0];
    return W[clampK(3 - d)];
  }
  // the hip rafter over the corner: big, its face toward each slope
  const hip = x - y;
  if (Math.abs(hip) < 0.17) return Math.abs(hip) < 0.03 ? W[0] : hip > 0 ? W[3] : W[2];
  if (Math.abs(hip) < 0.21) return W[0];
  // the principal rafters over the trusses
  for (const a of plane === 'Y' ? TRUSSES : L_TRUSSES) {
    const da = along - a;
    if (Math.abs(da) < 0.14) return Math.abs(da) > 0.1 ? (da < 0 ? W[clampK(4 - d)] : W[0]) : W[clampK(3 - d)];
  }
  // the purlins, along the slope
  const purl = Math.abs(mod(up + 35, 70) - 35);
  if (purl < 5) return purl < 1 ? W[clampK(4 - d)] : purl > 3.6 ? W[0] : W[clampK(2 - d)];
  // the common rafters (on the hip, the jacks stop at it)
  const raft = Math.abs(mod(along + 0.25, 0.5) - 0.25);
  if (raft < 0.045) return raft < 0.015 ? W[clampK(3 - d)] : W[clampK(1 - d)];
  // the boards over them, across the rafters, a chink of day between two here and there
  const bd = mod(up, 9);
  if (bd < 1) {
    if (hash(Math.floor(up / 9), Math.floor(along * 1.5), 67 + d) > 0.985) return P.outside;
    return B[0];
  }
  return B[clampK((hash(Math.floor(up / 9), Math.floor(along * 1.5), 69 + d) > 0.7 ? 4 : 3) - d)];
}


/** Through the gate's way: the portcullis down (square bars every twelve, straps across), and past it the day: the road out, the grass, the haze. */
function throughGate(P: Pal, look: Look, q: number, sy: number, tFace: number): [string, number] | null {
  // the bars, in the plane half way through the wall (y = 5.5)
  {
    const t = 2 * 5.5 + q;
    const x = 5.5 + q;
    const z = 16 * t - sy;
    const du = (x - GATE_MID) * 32;
    if (inRound(du, z, GWAY.half, GWAY.spring, GWAY.rise)) {
      const b = mod(du + GWAY.half, 12);
      const strap = mod(z, 24);
      if (Math.abs(b - 6) < 1.8) return [b < 6 ? P.iron[3] : P.iron[1], t];
      if (strap < 3 && z > 6) return [strap < 1 ? P.iron[3] : P.iron[1], t];
      if (z < 5 && Math.abs(b - 6) < 3) return [P.iron[2], t];
    }
  }
  // the way's soffit and jambs (the wall's thickness, y 5 to 6), in shade
  const t5 = 2 * 5 + q;
  const xx = 5 + q;
  const zz = 16 * t5 - sy;
  const du5 = (xx - GATE_MID) * 32;
  if (!inRound(du5, zz, GWAY.half, GWAY.spring, GWAY.rise)) return [P.stone[1], tFace - 0.2];
  // the ground outside, in the sun: a road of pale dust, grass either side; else the hazy day
  const tg = sy / 16;
  const gx = (tg + q) / 2;
  const gy = (tg - q) / 2;
  if (gy < 5) {
    const road = Math.abs(gx - GATE_MID - (5 - gy) * 0.3) < 0.9;
    const n = fbm(gx * 3, gy * 3, 71);
    const c = road ? (n > 0.6 ? '#d8c49a' : '#cbb68a') : n > 0.55 ? '#8ea24e' : '#7a9044';
    return [mixC(c, P.outside, Math.min(0.6, (5 - gy) * 0.08)), tg];
  }
  void look;
  return [P.stone[2], tg];
}

// =================================================================================================
// SOLIDS, MARCHED: for each pixel the line of sight is followed from the eye's side of the thing's box inward, and the first
// point inside it is what is seen (as floor 1's).

export type Face = 'x' | 'y' | 'z' | 'in';
export interface Solid {
  box: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number };
  inside: (x: number, y: number, z: number) => boolean;
  shade: (x: number, y: number, z: number, face: Face) => string | null;
}
export function march(D: Deep, s: Solid, step = 0.02): void {
  const { OX, OY } = PICTURE;
  const b = s.box;
  const corners: [number, number][] = [];
  for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) corners.push(atPx(x, y, z));
  const minX = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0]))));
  const maxX = Math.min(D.w - 1, Math.ceil(Math.max(...corners.map((c) => c[0]))));
  const minY = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1]))));
  const maxY = Math.min(D.h - 1, Math.ceil(Math.max(...corners.map((c) => c[1]))));
  for (let py = minY; py <= maxY; py++) {
    const sy = py + 0.5 - OY;
    for (let px = minX; px <= maxX; px++) {
      const q = (px + 0.5 - OX) / 32;
      let lo = Math.max(2 * b.x0 - q, 2 * b.y0 + q, (b.z0 + sy) / 16);
      const hi = Math.min(2 * b.x1 - q, 2 * b.y1 + q, (b.z1 + sy) / 16);
      if (hi <= lo) continue;
      if (hi < D.depthAt(px, py)) continue;
      lo -= step;
      let prev: [number, number, number] | null = null;
      for (let t = hi; t >= lo; t -= step) {
        const x = (t + q) / 2;
        const y = (t - q) / 2;
        const z = 16 * t - sy;
        if (s.inside(x, y, z)) {
          let face: Face = 'in';
          if (prev) {
            if (!s.inside(prev[0], y, z)) face = 'x';
            else if (!s.inside(x, prev[1], z)) face = 'y';
            else if (!s.inside(x, y, prev[2])) face = 'z';
          } else face = t >= hi - 1e-6 ? (hi === 2 * b.x1 - q ? 'x' : hi === 2 * b.y1 + q ? 'y' : 'z') : 'in';
          const c = s.shade(x, y, z, face);
          if (c) {
            D.depth = t;
            D.set(px, py, c);
          }
          break;
        }
        prev = [x, y, z];
      }
    }
  }
}

/** A face's tone by which way it looks: up and screen-left lit, screen-right in shade. */
const faceK = (face: Face): number => (face === 'z' ? 3 : face === 'y' ? 3 : face === 'x' ? 1 : 2);

// =================================================================================================
// THE HAMMER-BEAM TRUSSES over the right wall: a wall post down the face on a carved stone corbel, a hammer beam jutting
// out from the plate, a curved brace under it, a hammer post standing up from its end. THE OWL sits on one (painted after).

export const HAMMER = { out: 1.35, z0: 92, z1: 102, post: 150, wallFoot: 50 };
export function paintTrusses(D: Deep, look: Look): void {
  const P = PALS[look];
  const W = P.wood;
  for (const xt of TRUSSES) {
    const hw = 0.11;
    const inside = (x: number, y: number, z: number): 'beam' | 'post' | 'brace' | 'hpost' | 'corbel' | null => {
      if (Math.abs(x - xt) > hw) return null;
      const out = y - HALL.y0;
      if (out < 0) return null;
      if (z >= HAMMER.z0 && z < HAMMER.z1 && out < HAMMER.out) return 'beam';
      if (out < 0.22 && z >= HAMMER.wallFoot && z < HAMMER.z0) return 'post';
      if (out < 0.3 && z >= HAMMER.wallFoot - 8 && z < HAMMER.wallFoot) return out < 0.3 - (HAMMER.wallFoot - z) * 0.02 ? 'corbel' : null;
      if (out > HAMMER.out - 0.2 && out < HAMMER.out && z >= HAMMER.z1 && z < HAMMER.post) return 'hpost';
      // the brace: straight, from the post low down to under the beam, a hand's breadth thick
      const bz = 60 + (out - 0.22) * (HAMMER.z0 - 60) / 0.7;
      if (out > 0.2 && out < 0.95 && z < HAMMER.z0 && Math.abs(z - bz) < 4.5) return 'brace';
      return null;
    };
    march(D, {
      box: { x0: xt - hw - 0.02, y0: HALL.y0, z0: HAMMER.wallFoot - 9, x1: xt + hw + 0.02, y1: HALL.y0 + HAMMER.out + 0.02, z1: HAMMER.post + 1 },
      inside: (x, y, z) => inside(x, y, z) !== null,
      shade: (x, y, z, face) => {
        const m = inside(x, y, z)!;
        const k = faceK(face);
        if (m === 'corbel') return P.stone[clampK(k)];
        // (the timber's grain, its lit edges, pegs)
        let c = W[clampK(k)];
        if (face !== 'z' && hash(Math.floor(z / 3), Math.floor(y * 20), 91) > 0.86) c = W[clampK(k - 1)];
        if (m === 'beam' && face === 'y' && Math.abs(z - (HAMMER.z0 + HAMMER.z1) / 2) < 1.2 && hash(Math.floor(y * 6), 0, 93) > 0.6) c = W[0];
        return c;
      },
    }, 0.01);
  }
}


/**
 * THE CASTLE HALL'S TRUSSES, on both back walls, each springing from A CARVED STONE CORBEL set into the wall (three steps,
 * the deepest at its top): its wall post stands on the corbel up the wall to the wall plate, and an ARCH BRACE curves out and
 * up from the post. On the right wall (along x) a HAMMER BEAM juts out from the post at the arch brace's head, a hammer post
 * standing on it up to the roof's principal rafter: THE OWL sits on one, on the beam's end over the smithy. On the left wall
 * (along y, between the windows) the posts and their braces carry the hip's rafters (no hammer beams there, to keep the
 * windows clear).
 */
export const CTRUSS = { hw: 0.13, corbel: [40, 56] as const, beamOut: 1.1, hpost: [0.62, 0.84] as const, braceFoot: 64, lBrace: 0.5 };
/** Where the owl sits in the castle hall: on the end of the hammer beam over the rack and the forge, before its hammer post. */
export const CASTLE_OWL_AT: [number, number, number] = [17.5, 6 + 0.98, 102];
export function paintCastleTrusses(D: Deep): void {
  const P = PALS.castle;
  const W = P.wood;
  const S = P.stone;
  const T = CTRUSS;
  const roofAt = (out: number): number => CASTLE_TOP + CASTLE_PITCH * out;
  const runs: { wall: 'L' | 'R'; at: number }[] = [...TRUSSES.map((at) => ({ wall: 'R' as const, at })), ...L_TRUSSES.map((at) => ({ wall: 'L' as const, at }))];
  for (const r of runs) {
    const hammer = r.wall === 'R';
    const [c0, c1] = T.corbel;
    // the arch brace: a quarter of an ellipse from the post (vertical there) to the head (level there)
    const bOut = hammer ? T.hpost[1] : T.lBrace;
    const bTop = hammer ? HAMMER.z0 : CASTLE_TOP - 6;
    const part = (al: number, out: number, z: number): 'beam' | 'post' | 'brace' | 'hpost' | 'corbel' | null => {
      const a = Math.abs(al - r.at);
      if (out < 0) return null;
      if (z >= c0 && z < c1) {
        const step = z < c0 + 5 ? 0.12 : z < c0 + 10 ? 0.22 : 0.32;
        return out < step && a < T.hw + 0.05 ? 'corbel' : null;
      }
      if (a > T.hw) return null;
      if (out < 0.22 && z >= c1 && z < CASTLE_TOP) return 'post';
      if (hammer && z >= HAMMER.z0 && z < HAMMER.z1 && out < T.beamOut) return 'beam';
      if (hammer && out > T.hpost[0] && out < T.hpost[1] && z >= HAMMER.z1 && z < roofAt(out) + 2) return 'hpost';
      if (out >= 0.18 && out < bOut && z >= T.braceFoot && z < bTop) {
        const e = Math.hypot((out - bOut) / (bOut - 0.2), (z - T.braceFoot) / (bTop - T.braceFoot));
        if (e > 0.78 && e < 1) return 'brace';
      }
      return null;
    };
    const toLocal = (x: number, y: number): [number, number] => (r.wall === 'R' ? [x, y - HALL.y0] : [y, x - HALL.x0]);
    const reach = hammer ? T.beamOut : T.lBrace;
    const box = r.wall === 'R'
      ? { x0: r.at - T.hw - 0.06, y0: HALL.y0, x1: r.at + T.hw + 0.06, y1: HALL.y0 + reach + 0.02 }
      : { x0: HALL.x0, y0: r.at - T.hw - 0.06, x1: HALL.x0 + reach + 0.02, y1: r.at + T.hw + 0.06 };
    march(D, {
      box: { ...box, z0: c0 - 1, z1: (hammer ? roofAt(T.hpost[1]) : CASTLE_TOP) + 3 },
      inside: (x, y, z) => {
        const [al, out] = toLocal(x, y);
        return part(al, out, z) !== null;
      },
      shade: (x, y, z, face) => {
        const [al, out] = toLocal(x, y);
        const m = part(al, out, z)!;
        const k = faceK(face);
        if (m === 'corbel') {
          // (carved: each step's lip a roll, catching the light; its underside in shade)
          if (face === 'z') return S[4];
          const lip = mod(z - c0, 5);
          return S[clampK(lip > 3.6 ? k + 1 : lip < 1 ? k - 1 : k)];
        }
        let c = W[clampK(k)];
        // (the timber's grain along it, a darker split here and there; a moulding along the beam's face; pegs at its joints)
        const along = m === 'post' || m === 'hpost' ? z : out * 32;
        if (face !== 'z' && hash(Math.floor(along / 4), Math.floor(al * 40), 91) > 0.86) c = W[clampK(k - 1)];
        if (m === 'beam' && face !== 'z' && Math.abs(z - (HAMMER.z0 + HAMMER.z1) / 2) < 0.8) c = W[clampK(k - 1)];
        if ((m === 'post' && Math.abs(z - HAMMER.z0 - 4) < 1.2) || (m === 'hpost' && Math.abs(z - HAMMER.z1 - 6) < 1.2)) c = W[0];
        return c;
      },
    }, 0.01);
  }
}

// =================================================================================================
// THE PILLARS (game/level.ts: two in the hall's back half): round columns of the pale stone on a square base, a carved
// capital, IVY winding up them.

export function paintPillars(D: Deep, look: Look): void {
  const P = PALS[look];
  const S = P.stone;
  for (const [tx, ty] of TOWN_AT.pillars) {
    const cx = tx + 0.5;
    const cy = ty + 0.5;
    const H = 84;
    const rAt = (z: number): number => (z < 8 ? 0.34 : z < 12 ? 0.29 : z > H - 6 ? 0.36 : z > H - 14 ? 0.3 - (H - 14 - z) * -0.008 : 0.24);
    const inside = (x: number, y: number, z: number): boolean => {
      if (z < 0 || z > H) return false;
      const r = rAt(z);
      if (z < 8 || z > H - 6) return Math.abs(x - cx) < r && Math.abs(y - cy) < r;
      return Math.hypot(x - cx, y - cy) < r;
    };
    march(D, {
      box: { x0: cx - 0.4, y0: cy - 0.4, z0: 0, x1: cx + 0.4, y1: cy + 0.4, z1: H + 1 },
      inside,
      shade: (x, y, z, face) => {
        // round: lit on its upper-left (toward -x, +y), shade to the right
        const a = Math.atan2(y - cy, x - cx);
        const l = Math.cos(a - 2.4);
        let k = face === 'z' ? 4 : l > 0.55 ? 4 : l > 0.1 ? 3 : l > -0.45 ? 2 : 1;
        if (z < 8 || z > H - 6) k = face === 'z' ? 4 : face === 'y' ? 3 : 1;
        if (z > H - 14 && z <= H - 6 && mod(a * 6 + z, 4) < 2) k -= 1;
        // ivy winding up it
        const wind = mod(a / (Math.PI * 2) + z / 70, 1);
        if (z > 6 && z < H - 4 && (wind < 0.22 || fbm(a * 3, z / 8, 97) > 0.68) && fbm(a * 5, z / 5, 99) > 0.36) {
          const lf = hash(Math.floor(a * 20), Math.floor(z / 2), 101);
          return sunlit(P, P.leaf[clampK((lf > 0.6 ? 3 : 2) + (l > 0.2 ? 1 : l < -0.3 ? -1 : 0))], sunAt(look, x, y, z));
        }
        let c = S[clampK(k)];
        if (z < 24 && fbm(a * 4, z / 6, 103) > 0.56) c = P.moss[clampK(k)];
        return sunlit(P, c, sunAt(look, x, y, z));
      },
    }, 0.01);
  }
}

// =================================================================================================
// THE STAIRWELL'S PARAPET: a low wall of the hall's stone round three sides of the opening, open at the top of its steps.

export function paintParapet(D: Deep, look: Look): void {
  const P = PALS[look];
  const S = P.stone;
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const k = ST.kerb;
  const parts: [number, number, number, number][] = [
    [WELL.x0, WELL.y0, WELL.x1, WELL.y0 + k],
    [WELL.x0, WELL.y1 - k, WELL.x1, WELL.y1],
    [WELL.x1 - k, WELL.y0 + k, WELL.x1, WELL.y1 - k],
  ];
  for (const [x0, y0, x1, y1] of parts) {
    const H = ST.kerbH + 4;
    iso.box(x0, y0, x1, y1, 0, H, {
      top: (u, v) => {
        const x = x0 + u * (x1 - x0);
        const y = y0 + v * (y1 - y0);
        D.depth = x + y + 0.02;
        let c = mod((x1 - x0 > y1 - y0 ? x : y) * 2, 1) < 0.04 ? P.seam : S[4];
        if (fbm(x * 6, y * 6, 105) > 0.6) c = P.moss[3];
        return sunlit(P, c, sunAt(look, x, y, H));
      },
      left: (u, v) => {
        const x = x0 + (u + 0.5) / ISO_X;
        D.depth = x + y1;
        const c = v < 1 ? S[4] : v === H - 1 ? S[1] : mod(x * 64, 28) < 1 ? P.seam : S[3];
        return sunlit(P, c, sunAt(look, x, y1, H - v));
      },
      right: (u, v) => {
        const y = y1 - (u + 0.5) / ISO_X;
        D.depth = x1 + y;
        const c = v < 1 ? S[3] : mod(y * 64, 28) < 1 ? P.seam : S[1];
        return sunlit(P, c, sunAt(look, x1, y, H - v));
      },
    });
  }
}

/** A WALL TOWARD THE EYE, cut low as the game leaves it: a coping of the hall's stone, ivy and moss over it. */
export function lowWall(D: Deep, look: Look, r: { x0: number; y0: number; x1: number; y1: number }, seed: number): void {
  const P = PALS[look];
  const S = P.stone;
  const iso = new Iso(D, PICTURE.OX, PICTURE.OY);
  const long = r.x1 - r.x0 > r.y1 - r.y0;
  iso.box(r.x0, r.y0, r.x1, r.y1, 0, LOW, {
    top: (u, v) => {
      const x = r.x0 + u * (r.x1 - r.x0);
      const y = r.y0 + v * (r.y1 - r.y0);
      D.depth = x + y + 0.5;
      const a = long ? x : y;
      const across = long ? (y - r.y0) / (r.y1 - r.y0) : (x - r.x0) / (r.x1 - r.x0);
      const fa = mod(a * 2 + hash(seed, 0, 3), 1);
      let c = fa < 0.05 || across < 0.08 ? P.seam : hash(Math.floor(a * 2), seed, 5) > 0.7 ? S[2] : S[3];
      if (c !== P.seam && (fa < 0.12 || (long ? across > 0.86 : across < 0.2))) c = S[4];
      const iv = fbm(x * 3, y * 3, seed);
      if (iv > 0.62) c = P.leaf[iv > 0.7 ? 4 : 3];
      else if (iv > 0.59) c = P.moss[3];
      return sunlit(P, c, sunAt(look, x, y, LOW));
    },
    left: (u, v) => {
      const x = r.x0 + (u + 0.5) / ISO_X;
      D.depth = x + r.y1 + 0.5;
      const c = v < 1 ? S[4] : v > LOW - 4 ? S[1] : S[v % 8 === 7 ? 0 : 2];
      return c;
    },
    right: (u, v) => {
      const y = r.y1 - (u + 0.5) / ISO_X;
      D.depth = r.x1 + y + 0.5;
      const c = v < 1 ? S[3] : v > LOW - 4 ? S[0] : S[v % 8 === 7 ? 0 : 1];
      return c;
    },
  });
}
export const LOWS = [
  { x0: HALL.x1, y0: HALL.y0 - 1, x1: HALL.x1 + 1, y1: HALL.y1 + 1 },
  { x0: HALL.x0 - 1, y0: HALL.y1, x1: HALL.x1, y1: HALL.y1 + 1 },
];

// =================================================================================================
// POTTED HERBS AND FLOWERS: terracotta pots, round-bellied or plain, a rim; in them herbs (bushy), flowers on stems, or a
// little bay tree; along the walls' feet, under the windows, and by each vendor's place.

export type PotKind = 'herb' | 'flower' | 'bay' | 'fern';
export interface Pot { x: number; y: number; r: number; h: number; kind: PotKind; seed: number }
const POTS_COMMON: Pot[] = [
  { x: 6.42, y: 8.05, r: 0.2, h: 16, kind: 'flower', seed: 1 },
  { x: 6.42, y: 10.05, r: 0.22, h: 19, kind: 'bay', seed: 2 },
  { x: 6.42, y: 16.05, r: 0.2, h: 15, kind: 'herb', seed: 3 },
  { x: 7.55, y: 6.42, r: 0.2, h: 15, kind: 'herb', seed: 4 },
  { x: 12.45, y: 6.45, r: 0.19, h: 15, kind: 'flower', seed: 5 },
  { x: 12.35, y: 11.4, r: 0.18, h: 14, kind: 'herb', seed: 6 },
  { x: 14.1, y: 11.35, r: 0.18, h: 14, kind: 'flower', seed: 7 },
  { x: 17.35, y: 10.35, r: 0.22, h: 17, kind: 'fern', seed: 8 },
  { x: 17.4, y: 14.5, r: 0.2, h: 16, kind: 'flower', seed: 9 },
  { x: 11.25, y: 18.55, r: 0.2, h: 15, kind: 'herb', seed: 10 },
  { x: 21.55, y: 8.5, r: 0.21, h: 17, kind: 'bay', seed: 11 },
  { x: 11.4, y: 15.6, r: 0.18, h: 14, kind: 'flower', seed: 12 },
  { x: 13.2, y: 19.45, r: 0.2, h: 15, kind: 'fern', seed: 13 },
];
export const POTS: Record<Look, Pot[]> = {
  boards: [...POTS_COMMON, { x: 6.42, y: 12.05, r: 0.17, h: 13, kind: 'flower', seed: 14 }, { x: 8.7, y: 6.42, r: 0.18, h: 14, kind: 'flower', seed: 15 }],
  fallen: POTS_COMMON.filter((p) => p.seed !== 1 && p.seed !== 4),
  rafters: [...POTS_COMMON, { x: 6.42, y: 12.05, r: 0.17, h: 13, kind: 'herb', seed: 14 }, { x: 8.7, y: 6.42, r: 0.18, h: 14, kind: 'flower', seed: 15 }],
  // (the castle hall: along the left wall on the piers between its windows, under the trusses; the rest as A's)
  castle: [
    ...POTS_COMMON.filter((p) => p.seed !== 1 && p.seed !== 2 && p.seed !== 3),
    { x: 6.42, y: 10.0, r: 0.22, h: 19, kind: 'bay', seed: 2 },
    { x: 6.42, y: 13.0, r: 0.2, h: 16, kind: 'flower', seed: 1 },
    { x: 6.42, y: 16.0, r: 0.2, h: 15, kind: 'herb', seed: 3 },
    { x: 8.7, y: 6.42, r: 0.18, h: 14, kind: 'flower', seed: 15 },
  ],
};

export function paintPot(D: Deep, look: Look, p: Pot): void {
  const P = PALS[look];
  const T = P.pot;
  const potR = (z: number): number => {
    const u = z / p.h;
    if (u > 0.86) return p.r * 1.04;
    return p.r * (0.72 + 0.3 * Math.sin(Math.PI * (0.25 + u * 0.75)));
  };
  // the foliage: a mass of leaf over the pot, by kind
  const fol = (x: number, y: number, z: number): boolean => {
    const dx = x - p.x;
    const dy = y - p.y;
    const top = p.h;
    if (p.kind === 'bay') {
      // a clipped ball on a stem
      if (z > top && z < top + 16 && Math.hypot(dx, dy) < 0.035) return true;
      const r = Math.hypot(dx / 0.32, dy / 0.32, (z - top - 24) / 15);
      return r < 1 - 0.25 * noise(x * 30, z / 3, p.seed);
    }
    if (p.kind === 'fern') {
      const r = Math.hypot(dx / 0.42, dy / 0.42, (z - top - 4) / 12);
      return z > top - 2 && r < 1 && fbm(Math.atan2(dy, dx) * 2.5, r * 3, p.seed) > 0.4;
    }
    const r = Math.hypot(dx / (p.r * 1.4), dy / (p.r * 1.4), (z - top - 3) / (p.kind === 'flower' ? 12 : 9));
    return z > top - 2 && r < 1 - 0.3 * noise(x * 40, z / 2, p.seed);
  };
  const reach = p.kind === 'fern' ? 0.45 : p.kind === 'bay' ? 0.36 : p.r * 1.5;
  march(D, {
    box: { x0: p.x - reach, y0: p.y - reach, z0: 0, x1: p.x + reach, y1: p.y + reach, z1: p.h + 42 },
    inside: (x, y, z) => (z >= 0 && z < p.h && Math.hypot(x - p.x, y - p.y) < potR(z)) || fol(x, y, z),
    shade: (x, y, z) => {
      const sun = sunAt(look, x, y, z);
      if (z < p.h && Math.hypot(x - p.x, y - p.y) < potR(z) + 0.001 && !fol(x, y, z)) {
        const a = Math.atan2(y - p.y, x - p.x);
        const l = Math.cos(a - 2.4);
        let k = l > 0.5 ? 4 : l > 0 ? 3 : l > -0.5 ? 2 : 1;
        if (z > p.h - 3) k = Math.min(4, k + 1);
        if (Math.abs(z - p.h + 3.5) < 0.6) k = 1;
        if (z < 5 && fbm(a * 3, z, p.seed) > 0.55) return sunlit(P, P.moss[clampK(k)], sun);
        return sunlit(P, T[clampK(k)], sun);
      }
      const lf = hash(Math.floor(x * 64), Math.floor(z / 2) + Math.floor(y * 64) * 7, p.seed);
      const up = (z - p.h) / 20;
      if (p.kind === 'flower' && lf > 0.8 && up > 0.15) return P.flowers[(p.seed + Math.floor(lf * 7)) % P.flowers.length];
      if (p.kind === 'herb' && lf > 0.93) return P.flowers[(p.seed * 3) % P.flowers.length];
      const k = lf > 0.66 ? 4 : lf > 0.33 ? 3 : 2;
      return sunlit(P, P.leaf[clampK(k + (x - p.x < 0 && y - p.y > 0 ? 0 : -1))], sun);
    },
  }, 0.008);
}

/** Grass and little flowers in the floor's joints, as tufts that stand a few pixels: over the floor, under what stands. */
export function paintTufts(D: Deep, look: Look): void {
  const P = PALS[look];
  const n = look === 'rafters' ? 260 : look === 'fallen' ? 160 : 90;
  for (let i = 0; i < n; i++) {
    // (on a joint: a tile's edge)
    const tx = HALL.x0 + Math.floor(hash(i, 1, 131) * (HALL.x1 - HALL.x0));
    const ty = HALL.y0 + Math.floor(hash(i, 2, 131) * (HALL.y1 - HALL.y0));
    const along = hash(i, 3, 131);
    const [x, y] = hash(i, 4, 131) < 0.5 ? [tx + along, ty] : [tx, ty + along];
    if (inWellOpening(x, y) || (x > WELL.x0 - 0.3 && x < WELL.x1 + 0.3 && y > WELL.y0 - 0.3 && y < WELL.y1 + 0.3)) continue;
    const [X0, Y0] = atPx(x, y);
    const X = Math.round(X0 / 2) * 2;
    const Y = Math.round(Y0 / 2) * 2;
    if (D.depthAt(X, Y) > x + y + 0.2) continue;
    const sun = sunAt(look, x, y, 2);
    D.depth = x + y + 0.01;
    const blades = 2 + Math.floor(hash(i, 5, 131) * 3);
    for (let b = 0; b < blades; b++) {
      const bx = X + (b - blades / 2) * 2 + 1;
      const h = 2 + Math.floor(hash(i, b, 133) * 3);
      for (let j = 0; j < h; j++) {
        const c = sunlit(P, P.leaf[j === h - 1 ? 4 : j > 0 ? 3 : 2], sun);
        D.set(bx, Y - j * 2, c).set(bx + 1, Y - j * 2, c).set(bx, Y - j * 2 - 1, c).set(bx + 1, Y - j * 2 - 1, c);
      }
    }
    if (hash(i, 6, 131) > 0.72) {
      const c = P.flowers[Math.floor(hash(i, 7, 131) * P.flowers.length)];
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) D.set(X + dx, Y - 8 + dy, c);
    }
  }
}

// =================================================================================================
// THE SUN IN THE AIR: the light through each gap seen as the air in it lit, streaked, motes of dust in it; laid over what
// is behind it, never over a figure stood in it. Followed along each pixel's line of sight through the hall's air.

export function paintAir(D: Deep, look: Look): void {
  const P = PALS[look];
  const { OX, OY } = PICTURE;
  const zTop = look === 'boards' ? WALL : look === 'castle' ? 96 : look === 'fallen' ? 330 : 0;
  if (zTop === 0) return;
  for (let py = 0; py < D.h; py++) {
    const sy = py + 0.5 - OY;
    for (let px = 0; px < D.w; px++) {
      const k = py * D.w + px;
      const dep = D.dep[k];
      if (dep < -1e8) continue;
      const q = (px + 0.5 - OX) / 32;
      // (from the surface toward the eye, while in the hall's air)
      const tMax = Math.min((zTop + sy) / 16, 2 * HALL.x1 - q, 2 * HALL.y1 + q);
      let t = Math.max(dep, 2 * HALL.x0 - q, 2 * HALL.y0 + q, sy / 16) + 0.03;
      if (t >= tMax) continue;
      // B: only near the column of light under the hole
      let lit = 0;
      let n = 0;
      for (; t < tMax; t += 0.09) {
        const x = (t + q) / 2;
        const y = (t - q) / 2;
        const z = 16 * t - sy;
        if (look === 'fallen' && (x > 16.5 || y > 12.5)) continue;
        n++;
        if (sunAt(look, x, y, z) >= 1) lit++;
      }
      if (lit === 0 || D.fig[k]) continue;
      const c = D.get(px, py);
      if (!c) continue;
      const chk = ((px >> 1) + (py >> 1)) & 1;
      const amt = lit * 0.09 + (chk ? 0.04 : 0);
      const step = amt > 0.9 ? 3 : amt > 0.45 ? 2 : amt > 0.14 ? 1 : 0;
      if (step === 0) continue;
      let col = mixC(c, P.air, P.airK[step - 1]);
      if (step >= 2 && hash(px >> 1, py >> 1, 137) > 0.986) col = mixC(c, P.mote, 0.62);
      D.over(px, py, col);
      void n;
    }
  }
}
