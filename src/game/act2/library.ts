// ACT 2, THE HUSH: FLOOR 15, THE GREAT LIBRARY: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the floor,
// game/act2_dress.ts for its pieces; behind ACT2, game/act1.ts, off until his yes).
//
// HIS DOC FOR IT ("Wordsmith Act 2: The Hush", the project's claude/act2_hush.md): "The lair floor that ends the first half:
// the stolen words are being bound into one book here."; its layout "tall halls of shelves, galleries, rolling ladders, chained
// books and candle chandeliers."; its enemies "the Silent Order in force, and creatures of spilled ink."; "the kid may
// recognize this room. It's the dream's version of the library they fell asleep in."; "on the lectern at the heart of the
// library lies the book of stolen words, nearly full."; its boss the Censor, his floor "The Reading Room". And to the planning
// chat, 19 Oct 2026, 11:01 Pacific: "Get levels 11-15 into the game". As long a floor as the descent's (his words of 17 Oct,
// 11:37: "The levels are very short in 6-7 so far").
//
// THE ART IS THE ART CHAT'S (docs/mockups/act2_library/README.md; its ground art/library.ts, its 25 pieces art/floor15.ts and
// the Hush's 25 art/act2_set.ts, its moment art/floor15_moments.ts), all of it on his word of 18 Oct, 21:24 Pacific: "Hey go
// without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15". Its hand-laid
// stretch (src/dev/preview_library.ts) is the model of what the ground wants: rooms of straight walls; the stacks, rows of
// shelves a tile thick with aisles two tiles across between them; halls and the Reading Room with the gallery the painter
// draws along their walls; the scriptorium's stone; the ways between rooms the halls' marble. WHERE EACH THING IS, AND WHAT
// THE GAME DOES WITH IT, are the planning chat's (this file, its helper's, as the main chat's were for the descent).
//
// THE FLOOR, IN THE ORDER HE WALKS IT (a chain of rooms up the screen, as the Prison's are laid, game/dungeon.ts: each set
// down beside the last, mostly up the screen, now and then across it, joined to it by a way three tiles wide):
//   THE DOORS: the entrance hall where he comes in, the library's own doors standing open in its back wall behind him;
//   then GREAT HALLS (zone Hall: marble, galleries; chandeliers hung over their middles, rows of reading desks or chained books,
//   candelabra, globes, card catalogues, library steps, a spiral stair up to the gallery) and THE STACKS (zone Stacks: narrow
//   aisles between rows of shelves, a cross aisle three tiles wide at each end and one through the middle, rolling steps,
//   carts and stacks of books against the ends, the Order's gates swung open across an aisle's mouth, sconces on the shelves),
//   THE SCRIPTORIUM where the Order binds the book (zone Scriptorium: rows of copying desks, the book press, vats of its ink,
//   racks of the stolen voices' jars, its ink spilled: the trap), an antechamber hall, and at the far end THE READING ROOM (zone
//   Reading: the Censor's, the great carpet in its middle and the great lectern at its heart with the book of stolen words on
//   it), and past it, through its far wall, the way on.
//   OFF THE WAY: the room of the library's closing bell (the Muffled Bell), a reading closet (the reward: chests), the
//   bindery (a lair: the floor's guardian and its own), and now and then more stacks.
// THE BELLS by their contract (docs/act2_build.md, game/act2_types.ts BellsPlan), laid here: the closing bell in its own room
// off the main way, about the floor's middle; the hand bells, six or seven, in the halls and the scriptorium about it, as far
// apart as they will go; the Hush's circle round the closing bell, holding them all, clear of the doors and the Reading Room.

import { RNG } from '../../engine/rng';
// (the art chat's stacks a block high, behind its switch: nothing is hung on a low row)
import { LOW_STACKS } from '../../art/low_stacks';
import { act2Pack } from '../act2_mobs';
import type { Act1Dress } from '../act1_dress';
import type { AreaRole, Land, Laid, Lane } from '../act1_layout';
import type { BellsPlan } from '../act2_types';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, HazardSpot, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor (true: it does; false: the descent's stands in). */
export const BUILT = true;

/**
 * THE STACKS' AISLES CLEAR (off until his yes to pictures of it, with the art chat's low shelves). The owner, 23 Oct 2026, 11:40
 * (Pacific): “The library is really hard to navigate.  The rows of shelves room needs the rows to maybe only be one block high,
 * and there shouldn’t be any little doodad in the isles”. On: no gate of the Order across an aisle's mouth (stacksOf); the
 * steps, the catalogue and the heaps of books stay at the shelves' ends, on the rows' own lines. (The dice are thrown as before,
 * so that nothing else of the floor moves.)
 */
export const AISLES_CLEAR = { on: true };

/**
 * WHAT EACH WALKABLE TILE IS (Land.zones), as the art's look reads it (art/library.ts LB_ZONE: these are its numbers, held to
 * them by tests/act2_library.test.ts; the game's code does not import the art's ground).
 */
export const LB = { Stacks: 0, Hall: 1, Reading: 2, Scriptorium: 3 } as const;

/** The names of what is laid (the art's own, art/floor15.ts and the Hush's set, art/act2_set.ts). */
export const LB_PIECES = {
  muffled: "the library's closing bell (the Muffled Bell)",
  bell: 'a hand bell',
  book: 'the book of stolen words',
  doors: "the library's doors",
  desk: 'a reading desk',
  chair: 'a reading chair',
  lectern: 'a lectern',
  steps: 'library steps',
  chandelier: 'a candle chandelier',
  candelabrum: 'a candelabrum',
  catalogue: 'a card catalogue',
  globe: 'a globe',
  chained: 'chained books',
  gate: 'a gate of the Order',
  portrait: 'a portrait, blacked out',
  sconce: 'a wall sconce',
  ink: 'spilled ink',
  press: 'a book press',
  copying: 'a copying desk',
  vat: "a vat of the Order's ink",
  basket: 'a basket of struck-out pages',
  stair: 'a spiral stair',
  // (the Hush's set: the Order's own, as on every floor of the act)
  banner: "the Silent Order's banner",
  spill: 'an ink spill',
  bars: "the Order's ink bars",
  rack: "the Order's rack of jars",
  lantern: "the Order's hooded lantern",
  paper: 'bundles of blank paper',
} as const;

// ---------------------------------------------------------------------------------------------------
// THE PLAN'S NUMBERS (the planning chat's picks, where the art and his doc leave them to the game)

/** Rooms on the main way: the entrance hall, then this many (the last before the Reading Room an antechamber hall), then the Reading Room. */
const ON_THE_WAY = 9;
/** Rock between rooms (tiles; the Prison's rule is 3), and between a way and any room or way it does not join. */
const ROOM_GAP = 3;
const WAY_GAP = 2;
/** A way between rooms: three tiles wide, its length this (a long one now and then). */
const WAY_W = 3;
const WAY_LONG: readonly [number, number] = [3, 8];
/** Rock round the whole floor (tiles), for the painter's walls going up into the dark at its edges. */
const MARGIN = 8;
/**
 * THE READING ROOM, the Censor's ground (his doc's "Redaction, black bars slamming across the floor in a telegraphed pattern";
 * "Strike-Through, a line drawn straight through you"; "the Hush, silence across the whole room"; "At half life he blacks out
 * parts of the floor for good, so the room shrinks"): this many tiles each way, so that with a third of it blacked out there is
 * still a good fight left (26 by 24 is 624 tiles; two thirds of it is 416, more than the whole of the descent's biggest arena).
 */
export const READING = { long: [26, 28] as const, short: [24, 25] as const };
/** Nothing solid within this many tiles of the Reading Room's middle but the great lectern and its two candelabra: the fight's. */
const READING_OPEN = 3;
/** THE HUSH (the Bells' contract): the most its circle reaches, and the least it may be laid with. */
const HUSH_MOST = 30;
const HUSH_LEAST = 18;
/** Packs: one for this many of a room's walkable tiles, at least one, at most `PACKS_MOST`. */
const PACK_EVERY = 110;
const PACKS_MOST = 4;

// ---------------------------------------------------------------------------------------------------
// THE PLAN: rooms and the ways between them, as rectangles, before any tile is laid

type Kind = 'entrance' | 'hall' | 'ante' | 'stacks' | 'scriptorium' | 'reading' | 'beyond' | 'bell' | 'closet' | 'lair' | 'sidestacks';
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PRoom {
  box: Box;
  kind: Kind;
  /** Its place on the main way (0 the entrance), or -1 off it. */
  path: number;
  parent: number;
  /** The stacks: their shelves run along x (rows at a fixed y) or along y. */
  rowsX?: boolean;
}
interface PWay {
  box: Box;
  a: number;
  b: number;
  /** The way runs along x (from room to room), else along y. */
  alongX: boolean;
}

/** The four ways a room may be set beside another: +x (down the screen to the right), +y (down to the left), -x (up to the left), -y (up to the right). */
const DIRS: readonly (readonly [number, number])[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const opposite = (d: number): number => (d + 2) % 4;

const touch = (a: Box, b: Box, pad: number): boolean => a.x - pad < b.x + b.w && b.x - pad < a.x + a.w && a.y - pad < b.y + b.h && b.y - pad < a.y + a.h;
const zoneOfKind = (k: Kind): number => (k === 'stacks' || k === 'sidestacks' ? LB.Stacks : k === 'scriptorium' || k === 'lair' ? LB.Scriptorium : k === 'reading' ? LB.Reading : LB.Hall);
const midOf = (b: Box): { x: number; y: number } => ({ x: b.x + Math.floor(b.w / 2) + 0.5, y: b.y + Math.floor(b.h / 2) + 0.5 });

/** How big a room of each kind is (tiles, its floor), and (the stacks) which way its shelves run. */
function sizeOf(rng: RNG, kind: Kind): { w: number; h: number; rowsX?: boolean } {
  const two = (a: number, b: number): { w: number; h: number } => (rng.chance(0.5) ? { w: a, h: b } : { w: b, h: a });
  switch (kind) {
    case 'entrance':
      return { w: rng.int(13, 14), h: rng.int(12, 13) };
    case 'hall':
      // (a great hall: long, its galleries along both its long walls)
      return two(rng.int(21, 26), rng.int(14, 16));
    case 'ante':
      return two(rng.int(15, 17), rng.int(13, 15));
    case 'stacks':
    case 'sidestacks': {
      // (the shelves a tile thick with two tiles of aisle between, two of aisle along the room's walls at either side: so the
      // room is 3k + 2 tiles across them, and the rows long enough for a cross aisle through their middle)
      const rowsX = rng.chance(0.5);
      const across = kind === 'stacks' ? rng.pick([20, 23]) : 17;
      const along = kind === 'stacks' ? rng.int(21, 26) : rng.int(16, 18);
      return rowsX ? { w: along, h: across, rowsX } : { w: across, h: along, rowsX };
    }
    case 'scriptorium':
      return { w: rng.int(15, 18), h: rng.int(13, 16) };
    case 'reading':
      return two(rng.int(READING.long[0], READING.long[1]), rng.int(READING.short[0], READING.short[1]));
    case 'beyond':
      return { w: 7, h: 7 };
    case 'bell':
      return { w: rng.int(10, 11), h: rng.int(10, 11) };
    case 'closet':
      return { w: rng.int(8, 9), h: rng.int(8, 9) };
    case 'lair':
      return two(rng.int(13, 14), rng.int(11, 12));
  }
}

/** Set a room of `size` down beside room `parent`, `gap` tiles of rock off its side `d`, and the way between them; or null. */
function besides(rng: RNG, P: Box, d: number, size: { w: number; h: number }, gap: number): { box: Box; way: PWay } | null {
  const [dx, dy] = DIRS[d];
  // (the two overlap across the way by at least six tiles, so that a way three wide comes into each with a tile to spare)
  if (dx !== 0) {
    const lo = P.y - size.h + 6;
    const hi = P.y + P.h - 6;
    if (hi < lo) return null;
    const by = rng.int(lo, hi);
    const bx = dx > 0 ? P.x + P.w + gap : P.x - gap - size.w;
    const o0 = Math.max(P.y, by);
    const o1 = Math.min(P.y + P.h, by + size.h);
    const c = rng.int(o0 + 1, o1 - 1 - WAY_W);
    return { box: { x: bx, y: by, w: size.w, h: size.h }, way: { box: { x: dx > 0 ? P.x + P.w : bx + size.w, y: c, w: gap, h: WAY_W }, a: -1, b: -1, alongX: true } };
  }
  const lo = P.x - size.w + 6;
  const hi = P.x + P.w - 6;
  if (hi < lo) return null;
  const bx = rng.int(lo, hi);
  const by = dy > 0 ? P.y + P.h + gap : P.y - gap - size.h;
  const o0 = Math.max(P.x, bx);
  const o1 = Math.min(P.x + P.w, bx + size.w);
  const c = rng.int(o0 + 1, o1 - 1 - WAY_W);
  return { box: { x: bx, y: by, w: size.w, h: size.h }, way: { box: { x: c, y: dy > 0 ? P.y + P.h : by + size.h, w: WAY_W, h: gap }, a: -1, b: -1, alongX: false } };
}

/** Is a new room and its way clear of every room and way already laid (but the room it hangs off)? */
function fits(rooms: readonly PRoom[], ways: readonly PWay[], box: Box, way: Box, parent: number): boolean {
  for (let i = 0; i < rooms.length; i++) {
    if (touch(box, rooms[i].box, ROOM_GAP) && i !== parent) return false;
    if (i !== parent && touch(way, rooms[i].box, WAY_GAP)) return false;
  }
  for (const w of ways) if (touch(box, w.box, WAY_GAP) || touch(way, w.box, WAY_GAP)) return false;
  return true;
}

/** The main way's rooms between the entrance and the antechamber: halls, the stacks (never two together), the scriptorium (not first). */
function wayKinds(rng: RNG): Kind[] {
  for (let t = 0; t < 40; t++) {
    const k = rng.shuffle<Kind>(['hall', 'hall', 'hall', 'hall', 'stacks', 'stacks', 'stacks', 'scriptorium']);
    if (k[0] === 'scriptorium') continue;
    if (k.some((v, i) => i > 0 && v === 'stacks' && k[i - 1] === 'stacks')) continue;
    return [...k, 'ante'];
  }
  return ['hall', 'stacks', 'hall', 'scriptorium', 'stacks', 'hall', 'stacks', 'hall', 'ante'];
}

/** A step of the main way: up the screen mostly (-x or -y, so that what lies ahead is seen past its far walls), across it now and then, never back. */
function stepWay(rng: RNG, prev: number, upOnly: boolean): number {
  const opts = [0, 1, 2, 3].filter((d) => d !== opposite(prev) && (!upOnly || d >= 2));
  return rng.weighted(opts, (d) => (d >= 2 ? 1 : 0.2));
}

interface Plan {
  rooms: PRoom[];
  ways: PWay[];
  /** Which wall of the entrance hall the doors stand in: 2 its wall at lesser x, 3 at lesser y. */
  doorsSide: number;
  /** Which way the Reading Room was come into (the way on lies on past it that way). */
  inTo: number;
  reading: number;
  beyond: number;
  bell: number;
}

function plan(rng: RNG): Plan | null {
  const rooms: PRoom[] = [];
  const ways: PWay[] = [];
  const s0 = sizeOf(rng, 'entrance');
  rooms.push({ box: { x: 0, y: 0, w: s0.w, h: s0.h }, kind: 'entrance', path: 0, parent: -1 });
  // (out of the entrance hall up the screen by one of its far walls; the doors in the other)
  const first = rng.pick([2, 3]);
  const doorsSide = first === 2 ? 3 : 2;
  const kinds: Kind[] = [...wayKinds(rng), 'reading'];
  let prev = first;
  for (let i = 1; i <= kinds.length; i++) {
    const kind = kinds[i - 1];
    let laid = false;
    for (let t = 0; t < 60 && !laid; t++) {
      const d = i === 1 ? first : stepWay(rng, prev, kind === 'reading');
      const size = sizeOf(rng, kind);
      const gap = kind === 'reading' ? rng.int(4, 6) : rng.chance(0.2) ? rng.int(9, 12) : rng.int(WAY_LONG[0], WAY_LONG[1]);
      const got = besides(rng, rooms[i - 1].box, d, size, gap);
      if (!got || !fits(rooms, ways, got.box, got.way.box, i - 1)) continue;
      rooms.push({ box: got.box, kind, path: i, parent: i - 1, rowsX: size.rowsX });
      ways.push({ ...got.way, a: i - 1, b: i });
      prev = d;
      laid = true;
    }
    if (!laid) return null;
  }
  const reading = rooms.length - 1;
  const inTo = prev;
  // THE WAY ON: past the Reading Room, on through its far wall (the way he came into it, or the other way up the screen)
  let beyond = -1;
  for (let t = 0; t < 40 && beyond < 0; t++) {
    const d = t < 20 ? inTo : inTo === 2 ? 3 : 2;
    if (d === opposite(inTo)) continue;
    const got = besides(rng, rooms[reading].box, d, sizeOf(rng, 'beyond'), rng.int(3, 5));
    if (!got || !fits(rooms, ways, got.box, got.way.box, reading)) continue;
    rooms.push({ box: got.box, kind: 'beyond', path: -1, parent: reading });
    ways.push({ ...got.way, a: reading, b: rooms.length - 1 });
    beyond = rooms.length - 1;
  }
  if (beyond < 0) return null;
  // OFF THE WAY: the room of the closing bell, about the floor's middle, as far from the doors and the Reading Room as it can
  // be (the Hush's circle round it must hold every bell and reach neither: game/bells.ts's contract)
  const start = startOf(rooms[0].box, doorsSide);
  const R = rooms[reading].box;
  let best: { box: Box; way: PWay; host: number; score: number } | null = null;
  for (let t = 0; t < 120; t++) {
    const host = rng.int(3, reading - 3);
    const got = besides(rng, rooms[host].box, rng.int(0, 3), sizeOf(rng, 'bell'), rng.int(3, 6));
    if (!got || !fits(rooms, ways, got.box, got.way.box, host)) continue;
    const c = midOf(got.box);
    const score = Math.min(Math.hypot(c.x - start.x, c.y - start.y) - 12, boxDist(R, c.x, c.y) - 3) + rng.next() * 2;
    if (!best || score > best.score) best = { ...got, host, score };
  }
  if (!best || best.score < HUSH_LEAST + 2) return null;
  rooms.push({ box: best.box, kind: 'bell', path: -1, parent: best.host });
  ways.push({ ...best.way, a: best.host, b: rooms.length - 1 });
  const bell = rooms.length - 1;
  // the reading closet (the reward), the bindery (the lair), now and then more stacks
  const sides: [Kind, number, number][] = [['closet', 1, reading - 2], ['lair', 2, reading - 1]];
  if (rng.chance(0.6)) sides.push(['sidestacks', 1, reading - 2]);
  for (const [kind, lo, hi] of sides) {
    let laid = false;
    for (let t = 0; t < 80 && !laid; t++) {
      const host = rng.int(lo, hi);
      const size = sizeOf(rng, kind);
      const got = besides(rng, rooms[host].box, rng.int(0, 3), size, rng.int(3, 7));
      if (!got || !fits(rooms, ways, got.box, got.way.box, host)) continue;
      rooms.push({ box: got.box, kind, path: -1, parent: host, rowsX: size.rowsX });
      ways.push({ ...got.way, a: host, b: rooms.length - 1 });
      laid = true;
    }
    if (!laid && kind !== 'sidestacks') return null;
  }
  return { rooms, ways, doorsSide, inTo, reading, beyond, bell };
}

/** Where he comes in: three tiles in from the doors, before the middle of the wall they stand in. */
function startOf(b: Box, doorsSide: number): { x: number; y: number } {
  return doorsSide === 3 ? { x: b.x + Math.floor(b.w / 2) + 0.5, y: b.y + 3.5 } : { x: b.x + 3.5, y: b.y + Math.floor(b.h / 2) + 0.5 };
}
/** How far a point is from a room's floor (0 inside it). */
function boxDist(b: Box, x: number, y: number): number {
  const dx = Math.max(b.x - x, 0, x - (b.x + b.w));
  const dy = Math.max(b.y - y, 0, y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

// ---------------------------------------------------------------------------------------------------
// LAY FLOOR 15

/** Lay floor 15, or null (not laid this time: the dice are rolled again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x6c1b7a15) >>> 0);
  const P = plan(rng);
  if (!P) return null;
  // THE BOUNDS: everything moved so the floor starts MARGIN tiles in
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const b of [...P.rooms.map((r) => r.box), ...P.ways.map((w) => w.box)]) {
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  }
  for (const b of [...P.rooms.map((r) => r.box), ...P.ways.map((w) => w.box)]) {
    b.x += MARGIN - x0;
    b.y += MARGIN - y0;
  }
  const W = x1 - x0 + 2 * MARGIN;
  const H = y1 - y0 + 2 * MARGIN;

  // THE TILES: every room's floor, every way's; the stacks' shelves (walls a tile thick) in their rooms
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  const roomAt = new Int16Array(W * H).fill(-1);
  P.rooms.forEach((r, id) => {
    const b = r.box;
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = zoneOfKind(r.kind);
      roomAt[ty * W + tx] = id;
    }
  });
  for (const w of P.ways) {
    const b = w.box;
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = LB.Hall;
    }
  }
  // (the stacks' rows, each tile of them marked: the art chat's low rows, art/low_stacks.ts, are painted on them)
  const shelves = new Uint8Array(W * H);
  for (const r of P.rooms) if (r.kind === 'stacks' || r.kind === 'sidestacks') shelve(rng, tiles, W, r.box, !!r.rowsX, shelves);

  // THE START, THE BOSS, THE WAY ON
  const E = P.rooms[0].box;
  const start = startOf(E, P.doorsSide);
  const R = P.rooms[P.reading].box;
  const heart = midOf(R);
  // (the Censor waits beyond the great lectern, four tiles on from it the way he came in: the lectern between them)
  const [ix, iy] = DIRS[P.inTo];
  const boss = { x: heart.x + ix * 4, y: heart.y + iy * 4 };
  const exit = midOf(P.rooms[P.beyond].box);

  // ROOMS (the main way first, in walking order; then those off it)
  const roleOf = (k: Kind): AreaRole => (k === 'entrance' ? 'start' : k === 'reading' ? 'boss' : k === 'lair' ? 'lair' : k === 'closet' || k === 'bell' || k === 'sidestacks' || k === 'beyond' ? 'side' : 'path');
  const kindOf = (k: Kind): RoomKind => (k === 'entrance' ? 'start' : k === 'reading' ? 'boss' : k === 'lair' ? 'guardian' : k === 'closet' ? 'treasure' : 'normal');
  const rooms: Room[] = P.rooms.map((r, id) => ({ id, x: r.box.x, y: r.box.y, w: r.box.w, h: r.box.h, kind: kindOf(r.kind), path: r.path }));
  // (two rooms of the main way the elite's: a yellow pack in each)
  const elite = rng.shuffle(rooms.filter((r) => r.kind === 'normal' && r.path > 0 && P.rooms[r.id].kind !== 'ante'));
  for (const r of elite.slice(0, 2)) r.kind = 'elite';

  // THE BELLS (their contract: docs/act2_build.md)
  const bells = layBells(rng, P, tiles, zones, roomAt, W, H, start);
  if (!bells) return null;

  // THE PACKS, by room (the floor's own kinds: game/act2_mobs.ts), none in the entrance, the Reading Room or past it
  const packs: PackSpot[] = [];
  const walkable = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && tiles[y * W + x] === T_FLOOR;
  const nearBell = (x: number, y: number): boolean => [bells.muffled, ...bells.bells].some((b) => Math.hypot(b.x - x, b.y - y) < 2.2);
  P.rooms.forEach((r, id) => {
    if (r.kind === 'entrance' || r.kind === 'reading' || r.kind === 'beyond') return;
    const b = r.box;
    const cells: [number, number][] = [];
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) if (walkable(tx, ty)) cells.push([tx, ty]);
    const lair = r.kind === 'lair';
    const n = lair ? 1 : Math.max(1, Math.min(PACKS_MOST, Math.round(cells.length / PACK_EVERY)));
    rng.shuffle(cells);
    let got = 0;
    for (const [tx, ty] of cells) {
      if (got >= n) break;
      const x = tx + 0.5;
      const y = ty + 0.5;
      let open = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (walkable(tx + dx, ty + dy)) open++;
      if (open < (lair ? 9 : 6)) continue;
      if (Math.hypot(x - start.x, y - start.y) < 14 || nearBell(x, y)) continue;
      if (packs.some((p) => Math.hypot(p.x - x, p.y - y) < 6)) continue;
      const tier: PackSpot['tier'] = lair ? 'champion' : rooms[id].kind === 'elite' && got === 0 ? 'elite' : 'normal';
      const p = act2Pack(depth, rng, tier);
      packs.push({ x, y, roomId: id, size: p.size, tier, kind: p.kind });
      got++;
    }
  });

  // THE GAME'S OWN THINGS: the reading closet's chests (two or three, near its middle)
  const props: PropSpot[] = [];
  const closet = P.rooms.findIndex((r) => r.kind === 'closet');
  if (closet >= 0) {
    const c = midOf(P.rooms[closet].box);
    const want = rng.int(2, 3);
    for (let t = 0; t < 40 && props.length < want; t++) {
      const tx = Math.floor(c.x + rng.range(-2, 2));
      const ty = Math.floor(c.y + rng.range(-2, 2));
      if (props.some((q) => Math.abs(q.x - tx) <= 1 && Math.abs(q.y - ty) <= 1) || nearBell(tx + 0.5, ty + 0.5)) continue;
      let ok = true;
      for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) ok = roomAt[(ty + dy) * W + tx + dx] === closet && tiles[(ty + dy) * W + tx + dx] === T_FLOOR;
      if (ok) props.push({ kind: 'chest', x: tx, y: ty });
    }
  }

  const floor: Floor = {
    depth,
    seed,
    w: W,
    h: H,
    tiles,
    cut: new Uint8Array(W * H),
    variant: new Uint8Array(W * H),
    rooms,
    start,
    boss,
    packs,
    props,
  };
  const vr = new RNG(seed ^ 0x1b873593);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);

  // THE LAND: the main way's middle line, each room as an area, each way between rooms as a lane, the zones, the Bells
  const way: [number, number][] = [];
  const main = P.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path);
  for (const r of main) {
    const m = midOf(r.box);
    way.push([m.x, m.y]);
  }
  const lanes: Lane[] = P.ways.map((w) => {
    const b = w.box;
    const pts: [number, number][] = w.alongX ? [[b.x, b.y + b.h / 2], [b.x + b.w, b.y + b.h / 2]] : [[b.x + b.w / 2, b.y], [b.x + b.w / 2, b.y + b.h]];
    return { pts, w: WAY_W };
  });
  const land: Land = {
    kind: 'library',
    depth,
    seed,
    way,
    areas: P.rooms.map((r, id) => ({ blob: { x: r.box.x + r.box.w / 2, y: r.box.y + r.box.h / 2, rx: r.box.w / 2, ry: r.box.h / 2, rot: 0, wob: 0, seed: id }, room: id, role: roleOf(r.kind) })),
    lanes,
    holds: [],
    exit,
    arrive: { ...start },
    zones,
    bells,
    shelves,
  };
  return { floor, land };
}

/**
 * THE STACKS' SHELVES (the art's preview: free-standing rows a tile thick, the aisles between them two tiles across): a row
 * every third tile across the room, two tiles of aisle along its walls on either side; each row stopping three tiles short of
 * the room's ends (a cross aisle three wide there), broken by a cross aisle two wide through the middle of a long room, and
 * now and then once more.
 */
function shelve(rng: RNG, tiles: Uint8Array, W: number, b: Box, rowsX: boolean, mask: Uint8Array): void {
  const across = rowsX ? b.h : b.w;
  const along = rowsX ? b.w : b.h;
  const a0 = rowsX ? b.x : b.y;
  const c0 = rowsX ? b.y : b.x;
  const mid = a0 + Math.floor(along / 2) - 1;
  const middle = along - 6 > 12;
  for (let k = 2; k <= across - 3; k += 3) {
    let extra = -99;
    if (rng.chance(0.3)) {
      const e = rng.int(a0 + 5, a0 + along - 7);
      if (!middle || Math.abs(e - mid) >= 4) extra = e;
    }
    for (let a = a0 + 3; a <= a0 + along - 4; a++) {
      if (middle && (a === mid || a === mid + 1)) continue;
      if (a === extra || a === extra + 1) continue;
      const tx = rowsX ? a : c0 + k;
      const ty = rowsX ? c0 + k : a;
      tiles[ty * W + tx] = T_WALL;
      mask[ty * W + tx] = 1;
    }
  }
}

/**
 * THE BELLS, BY THEIR CONTRACT (docs/act2_build.md): the closing bell (the Muffled Bell) in the middle of its room off the main
 * way; the Hush's circle round it as wide as it may be (`HUSH_MOST` at most), 12 tiles short of where he comes in and short of
 * the Reading Room; then the hand bells ("on the reading desks and in the halls": in the halls and the scriptorium, on whole
 * floor with the eight tiles round each floor too, never in a way between rooms nor by a doorway, nor in the stacks' narrow
 * aisles), each at least 4 tiles inside the circle and 10 from the start, as far apart as they will go (the next always the
 * one furthest from those already laid; never two within 8 tiles): seven if there is room, six at least, or the floor is laid again.
 */
function layBells(rng: RNG, P: Plan, tiles: Uint8Array, zones: Uint8Array, roomAt: Int16Array, W: number, H: number, start: { x: number; y: number }): BellsPlan | null {
  const muffled = midOf(P.rooms[P.bell].box);
  const R = P.rooms[P.reading].box;
  const B = P.rooms[P.beyond].box;
  const r = Math.min(HUSH_MOST, Math.hypot(muffled.x - start.x, muffled.y - start.y) - 12, boxDist(R, muffled.x, muffled.y) - 3, boxDist(B, muffled.x, muffled.y) - 3);
  if (r < HUSH_LEAST) return null;
  // (a doorway's tiles: a room's floor beside a way's)
  const door = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (roomAt[i] < 0 || tiles[i] !== T_FLOOR) continue;
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of DIRS) {
      const j = (y + dy) * W + x + dx;
      if (tiles[j] === T_FLOOR && roomAt[j] < 0) door[i] = 1;
    }
  }
  const cands: { x: number; y: number; hall: boolean }[] = [];
  for (let ty = 1; ty < H - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
    const i = ty * W + tx;
    const id = roomAt[i];
    if (id < 0 || tiles[i] !== T_FLOOR) continue;
    const k = P.rooms[id].kind;
    // (not in the Reading Room nor past it; not in the stacks' narrow aisles; not among the reading closet's chests)
    if (k === 'reading' || k === 'beyond' || k === 'stacks' || k === 'sidestacks' || k === 'closet') continue;
    const x = tx + 0.5;
    const y = ty + 0.5;
    if (Math.hypot(x - muffled.x, y - muffled.y) > r - 4.5 || Math.hypot(x - start.x, y - start.y) < 11) continue;
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1 && ok; dx++) ok = roomAt[i + dy * W + dx] === id && tiles[i + dy * W + dx] === T_FLOOR;
    if (!ok) continue;
    // (two tiles clear of a doorway: the ways in stay clear)
    for (let dy = -2; dy <= 2 && ok; dy++) for (let dx = -2; dx <= 2 && ok; dx++) ok = !door[i + dy * W + dx] || Math.abs(dx) + Math.abs(dy) > 3;
    if (!ok) continue;
    cands.push({ x, y, hall: zones[i] === LB.Hall });
  }
  const want = rng.chance(0.5) ? 7 : 6;
  const laid: { x: number; y: number }[] = [];
  const apart = (c: { x: number; y: number }): number => Math.min(Math.hypot(c.x - muffled.x, c.y - muffled.y), ...laid.map((b) => Math.hypot(c.x - b.x, c.y - b.y)));
  const jig = cands.map(() => rng.next());
  while (laid.length < want) {
    let best = -1;
    let bs = -Infinity;
    cands.forEach((c, k) => {
      const d = apart(c);
      if (d < 8.5) return;
      const s = d + (c.hall ? 1.5 : 0) + jig[k];
      if (s > bs) {
        bs = s;
        best = k;
      }
    });
    if (best < 0) break;
    laid.push({ x: cands[best].x, y: cands[best].y });
  }
  if (laid.length < 6) return null;
  return { muffled, bells: laid, hush: { x: muffled.x, y: muffled.y, r } };
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSING

/** What floor 15 is dressed with (game/act1_dress.ts Act1Dress), and where its moment may be played. */
export interface LibraryDress extends Act1Dress {
  /**
   * WHERE THE CHANDELIER MAY FALL (art/floor15_moments.ts, the art chat's moment: "LAY IT on open floor (a hall's marble or the
   * Reading Room's carpet), away from walls ... leave about 2.2 tiles clear round the anchor. Where it hangs, no chandelier
   * piece"): the floor under it in a great hall, kept so; null where no hall had room. NOT PLAYED YET: the moments of floors 1
   * to 5 are played from the painter's films (render/pieces.ts, art/films.ts momentKeys), which floors past the fifth have none of.
   */
  moment: { x: number; y: number } | null;
}

/** How far round the moment's anchor is kept clear of anything standing (tiles), and no chandelier hung. */
const MOMENT_CLEAR = 2.6;

/**
 * DRESS FLOOR 15 with its own pieces (the art's), by dice of its own: the Bells' pieces where the map-maker put them; each room
 * by what it is; its trap, the spilled ink, as the descent's traps are laid (a spike floor's beat, game/traps.ts); the lights the
 * art gives them (the chandeliers, candelabra and sconces an honest orange, the book of stolen words its pink). Nothing standing is
 * put where it would cut a way off: each tile it takes leaves the tiles round it joined (so every place reached before is reached
 * after); and nothing in the ways between rooms, the doorways, the stacks' aisles, round a bell, where he comes in or where the
 * way on opens. Null on any other floor.
 */
export function dress(L: Level, depth: number, seed: number): LibraryDress | null {
  const land = L.land;
  if (!land || land.kind !== 'library') return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x2545f491) >>> 0);
  const zones = land.zones ?? new Uint8Array(W * H);
  const role = new Map<number, AreaRole>(land.areas.map((a) => [a.room, a.role]));
  const roomAt = new Int16Array(W * H).fill(-1);
  for (const r of f.rooms) for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) roomAt[ty * W + tx] = r.id;
  const floorAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_FLOOR;
  const wallAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_WALL;

  // WHAT IS KEPT CLEAR of anything standing
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
    }
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3);
  clearRound(f.boss.x, f.boss.y, 2.5);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  // (the ways between rooms, and two tiles and a half round every doorway)
  for (let i = 0; i < W * H; i++) {
    if (f.tiles[i] !== T_FLOOR) continue;
    const x = i % W;
    const y = (i - x) / W;
    if (roomAt[i] < 0) {
      keep[i] = 1;
      continue;
    }
    for (const [dx, dy] of DIRS) if (floorAt(x + dx, y + dy) && roomAt[(y + dy) * W + x + dx] < 0) clearRound(x + 0.5, y + 0.5, 2.5);
  }
  const bells = land.bells;
  // (the eight tiles round each bell: the Bells' contract)
  if (bells) for (const b of [bells.muffled, ...bells.bells]) clearRound(b.x, b.y, 1.5);

  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const props: PropInst[] = [];
  const put = (name: string, tx: number, ty: number, solid: boolean, variant = 0, at?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx, ty, x: at ? at.x : tx + 0.5, y: at ? at.y : ty + 0.5, solid, state: 0, variant };
    props.push(p);
    if (solid) {
      taken[ty * W + tx] = 1;
      L.walk[ty * W + tx] = 0;
    }
    return p;
  };
  /**
   * May something stand on tile (x, y)? Whole floor, walked on, nothing there, not kept clear, and (`joined`) the tiles round it
   * that can be walked on still one another's by the tiles round it, so that taking it cuts nothing off.
   */
  const RING: readonly (readonly [number, number])[] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  const joined = (x: number, y: number): boolean => {
    const on = RING.map(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < W && y + dy < H && L.walk[(y + dy) * W + x + dx] === 1);
    // (runs of walkable tiles round the ring; its four sides must all be in one run)
    const run = new Array<number>(8).fill(-1);
    let n = 0;
    const s = on.findIndex((v, k) => !v && on[(k + 1) % 8]);
    if (s < 0) return true;
    for (let k = 1; k <= 8; k++) {
      const j = (s + k) % 8;
      if (!on[j]) continue;
      if (!on[(j + 7) % 8]) n++;
      run[j] = n;
    }
    const sides = [0, 2, 4, 6].filter((k) => on[k]).map((k) => run[k]);
    return sides.every((v) => v === sides[0]);
  };
  const free = (x: number, y: number): boolean => floorAt(x, y) && !keep[y * W + x] && !taken[y * W + x] && L.walk[y * W + x] === 1;
  const stand = (name: string, x: number, y: number, variant = 0, at?: { x: number; y: number }): boolean => {
    if (!free(x, y) || !joined(x, y)) return false;
    put(name, x, y, true, variant, at);
    return true;
  };
  /** Something two tiles long (a reading desk, chained books): along x over (x, y) and (x + 1, y), or along y over (x, y) and (x, y + 1). */
  const standLong = (name: string, x: number, y: number, alongX: boolean): boolean => {
    const x2 = alongX ? x + 1 : x;
    const y2 = alongX ? y : y + 1;
    if (!free(x, y) || !free(x2, y2) || !joined(x, y)) return false;
    L.walk[y * W + x] = 0;
    if (!joined(x2, y2)) {
      L.walk[y * W + x] = 1;
      return false;
    }
    put(name, x, y, true, alongX ? 0 : 1, alongX ? { x: x + 1, y: y + 0.5 } : { x: x + 0.5, y: y + 1 });
    taken[y2 * W + x2] = 1;
    L.walk[y2 * W + x2] = 0;
    return true;
  };
  /** A breakable of the game's (its barrel and urn, drawn as the floor's: 'a stack of books' and 'a book cart', game/act1_dress.ts ACT1_SETS). */
  const breakable = (kind: 'barrel' | 'urn', x: number, y: number): boolean => {
    if (!free(x, y) || !joined(x, y)) return false;
    props.push({ kind, tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: true, state: 0, variant: 0 });
    taken[y * W + x] = 1;
    L.walk[y * W + x] = 0;
    return true;
  };
  const lie = (name: string, x: number, y: number, variant = 0): boolean => {
    if (!free(x, y)) return false;
    put(name, x, y, false, variant);
    taken[y * W + x] = 1;
    return true;
  };
  const hang = (x: number, y: number, lit: boolean): void => {
    put(LB_PIECES.chandelier, Math.floor(x), Math.floor(y), false, lit ? 0 : 1, { x, y });
  };

  // ---- THE BELLS: the closing bell (gagged) and the hand bells (quiet), as the Bells' event will find them (state 0)
  if (bells) {
    put(LB_PIECES.muffled, Math.floor(bells.muffled.x), Math.floor(bells.muffled.y), true);
    for (const b of bells.bells) put(LB_PIECES.bell, Math.floor(b.x), Math.floor(b.y), true);
  }

  // ---- WALL PIECES (the art's 'on the wall': a sconce, a portrait, the Order's banner, the doors) on a far wall's foot, where
  // its face is seen: on a wall along x (the floor at greater y) the face turned to the screen's left (variant bit 0), on a wall
  // along y the one turned to its right (bit 1); its frame variant >> 1 (render/act1_pieces.ts)
  const hung: { x: number; y: number }[] = [];
  /** The far walls' feet in a room's box: each a floor tile with a straight run of wall behind it. */
  const feet = (r: Room): { tx: number; ty: number; face: 0 | 1 }[] => {
    const out: { tx: number; ty: number; face: 0 | 1 }[] = [];
    // (LOW_STACKS, art/low_stacks.ts: the stacks' rows a block high: nothing hung on a row, where it would hang in the air over a low case)
    const shelf = (x: number, y: number): boolean => LOW_STACKS.on && !!land.shelves && x >= 0 && y >= 0 && x < W && y < f.h && land.shelves[y * W + x] === 1;
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      if (!floorAt(tx, ty) || f.tiles[ty * W + tx] !== T_FLOOR) continue;
      if (shelf(tx, ty - 1) || shelf(tx - 1, ty)) continue;
      if (wallAt(tx, ty - 1) && wallAt(tx - 1, ty - 1) && wallAt(tx + 1, ty - 1) && floorAt(tx - 1, ty) && floorAt(tx + 1, ty)) out.push({ tx, ty, face: 0 });
      if (wallAt(tx - 1, ty) && wallAt(tx - 1, ty - 1) && wallAt(tx - 1, ty + 1) && floorAt(tx, ty - 1) && floorAt(tx, ty + 1)) out.push({ tx, ty, face: 1 });
    }
    return out;
  };
  const onWall = (name: string, at: { tx: number; ty: number; face: 0 | 1 }, frame = 0, apart = 3.5): boolean => {
    const x = at.face === 0 ? at.tx + 0.5 : at.tx;
    const y = at.face === 0 ? at.ty : at.ty + 0.5;
    if (hung.some((h) => Math.hypot(h.x - x, h.y - y) < apart)) return false;
    hung.push({ x, y });
    put(name, at.tx, at.ty, false, at.face | (frame << 1), { x, y });
    return true;
  };
  const dressWalls = (r: Room, every: number, extra: string[]): void => {
    const list = rng.shuffle(feet(r));
    const want = Math.max(1, Math.round(list.length / every));
    let n = 0;
    for (const at of list) {
      if (n >= want) break;
      const name = n < extra.length ? extra[n] : LB_PIECES.sconce;
      if (onWall(name, at, name === LB_PIECES.sconce && rng.chance(0.15) ? 1 : 0)) n++;
    }
  };

  // ---- THE ENTRANCE: the library's doors standing open in its back wall, where he came in; sconces either side, candelabra
  const entrance = f.rooms.find((r) => r.kind === 'start');
  if (entrance) {
    const sx = Math.floor(f.start.x);
    const sy = Math.floor(f.start.y);
    const yWall = wallAt(sx, sy - 4) && floorAt(sx, sy - 3);
    const at = yWall ? { tx: sx, ty: sy - 3, face: 0 as const } : { tx: sx - 3, ty: sy, face: 1 as const };
    onWall(LB_PIECES.doors, at, 1, 1.5);
    for (const k of [-2, 2]) onWall(LB_PIECES.sconce, yWall ? { tx: sx + k, ty: sy - 3, face: 0 } : { tx: sx - 3, ty: sy + k, face: 1 }, 0, 1.5);
    for (const k of [-3, 3]) stand(LB_PIECES.candelabrum, yWall ? sx + k : sx - 2, yWall ? sy - 2 : sy + k);
    const m = { x: entrance.x + entrance.w / 2, y: entrance.y + entrance.h / 2 };
    hang(m.x, m.y, true);
    alongWalls(entrance, [LB_PIECES.catalogue, LB_PIECES.globe, LB_PIECES.steps], 2);
    dressWalls(entrance, 7, [LB_PIECES.portrait]);
  }

  // ---- WHERE THE CHANDELIER MAY FALL: open marble in a great hall, about the middle of the way
  let moment: { x: number; y: number } | null = null;
  const halls = f.rooms.filter((r) => zones[(r.y + 1) * W + r.x + 1] === LB.Hall && role.get(r.id) === 'path' && r.w >= 13 && r.h >= 13);
  const mid = f.rooms.reduce((n, r) => Math.max(n, r.path), 0) / 2;
  for (const r of [...halls].sort((a, b) => Math.abs(a.path - mid) - Math.abs(b.path - mid))) {
    const m = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [2, 0], [0, 2]]) {
      const x = Math.floor(m.x) + dx + 0.5;
      const y = Math.floor(m.y) + dy + 0.5;
      let ok = true;
      for (let ty = Math.floor(y - 3); ty <= Math.floor(y + 3) && ok; ty++) for (let tx = Math.floor(x - 3); tx <= Math.floor(x + 3) && ok; tx++) {
        if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) > MOMENT_CLEAR + 0.5) continue;
        ok = floorAt(tx, ty) && !taken[ty * W + tx] && L.walk[ty * W + tx] === 1;
      }
      if (ok) {
        moment = { x, y };
        break;
      }
    }
    if (moment) break;
  }
  if (moment) clearRound(moment.x, moment.y, MOMENT_CLEAR);

  // ---- EACH ROOM BY WHAT IT IS
  const bellRoom = bells ? roomAt[Math.floor(bells.muffled.y) * W + Math.floor(bells.muffled.x)] : -1;
  const beyondRoom = roomAt[Math.floor(land.exit.y) * W + Math.floor(land.exit.x)];
  for (const r of f.rooms) {
    const z = zones[(r.y + Math.floor(r.h / 2)) * W + r.x + Math.floor(r.w / 2)];
    if (r.kind === 'start') continue;
    if (r.kind === 'boss') readingRoom(r);
    else if (r.id === beyondRoom) dressWalls(r, 4, []);
    else if (r.id === bellRoom) bellChamber(r);
    else if (r.kind === 'treasure') closetOf(r);
    else if (z === LB.Stacks) stacksOf(r);
    else if (z === LB.Scriptorium) scriptoriumOf(r, r.kind === 'guardian');
    else hallOf(r);
  }

  // ---- THE TRAP: the Order's ink spilled across the floor (his doc's "creatures of spilled ink" are the floor's own), laid as
  // the descent's traps are: a spike floor's beat (game/traps.ts), its pictures the art's frames (lying, the warning, sprung);
  // two in each scriptorium, one in a hall or two, never where a pack stands or before the start
  const hazards: HazardSpot[] = [];
  const trapIn = (r: Room, n: number): void => {
    const cells: [number, number][] = [];
    for (let ty = r.y + 1; ty < r.y + r.h - 1; ty++) for (let tx = r.x + 1; tx < r.x + r.w - 1; tx++) cells.push([tx, ty]);
    rng.shuffle(cells);
    let got = 0;
    for (const [tx, ty] of cells) {
      if (got >= n) break;
      if (!free(tx, ty)) continue;
      let ring = true;
      for (const [dx, dy] of RING) ring = ring && floorAt(tx + dx, ty + dy) && L.walk[(ty + dy) * W + tx + dx] === 1;
      if (!ring || hazards.some((h) => Math.hypot(h.x - tx, h.y - ty) < 6)) continue;
      hazards.push({ kind: 'spikes', x: tx, y: ty, w: 1, h: 1, phase: rng.range(0, 2.5) });
      taken[ty * W + tx] = 1;
      got++;
    }
  };
  for (const r of f.rooms) if (zones[(r.y + 1) * W + r.x + 1] === LB.Scriptorium && r.kind !== 'boss') trapIn(r, 2);
  for (const r of rng.shuffle(f.rooms.filter((q) => q.kind === 'normal' || q.kind === 'elite').filter((q) => zones[(q.y + 1) * W + q.x + 1] === LB.Hall && q.path > 0)).slice(0, 2)) trapIn(r, 1);

  L.props.push(...props);
  if (hazards.length) {
    f.hazards = [...(f.hazards ?? []), ...hazards];
    L.hazards = makeHazards(f);
  }
  return { floor: depth, tiles: [], moment };

  // ---------------------------------------------------------------------------------------------------
  // THE ROOMS

  /** Things that stand against a room's walls (each on a tile with the room's wall beside it), `n` of them about. */
  function alongWalls(r: Room, names: readonly string[], n: number, breakables = 0): void {
    const cells: [number, number][] = [];
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      if (tx !== r.x && ty !== r.y && tx !== r.x + r.w - 1 && ty !== r.y + r.h - 1) continue;
      cells.push([tx, ty]);
    }
    rng.shuffle(cells);
    const laid: [number, number][] = [];
    let k = 0;
    let b = 0;
    for (const [tx, ty] of cells) {
      if (k >= n && b >= breakables) break;
      if (laid.some(([x, y]) => Math.abs(x - tx) + Math.abs(y - ty) < 3)) continue;
      // (not in a corner: the tiles along the wall either side are floor)
      const alongX = ty === r.y || ty === r.y + r.h - 1;
      if (alongX ? !floorAt(tx - 1, ty) || !floorAt(tx + 1, ty) : !floorAt(tx, ty - 1) || !floorAt(tx, ty + 1)) continue;
      if (k < n) {
        if (stand(names[k % names.length], tx, ty, rng.chance(0.15) ? 1 : 0)) {
          laid.push([tx, ty]);
          k++;
        }
      } else if (breakable(rng.chance(0.5) ? 'barrel' : 'urn', tx, ty)) {
        laid.push([tx, ty]);
        b++;
      }
    }
  }

  /** Chandeliers hung down a room's middle, one every `every` tiles along it, none where the chandelier may fall. */
  function chandeliers(r: Room, every: number): void {
    const alongX = r.w >= r.h;
    const len = alongX ? r.w : r.h;
    const n = Math.max(1, Math.floor((len - 4) / every) + 1);
    const span = (n - 1) * every;
    for (let k = 0; k < n; k++) {
      const a = (len - span) / 2 + k * every;
      const x = alongX ? r.x + a : r.x + r.w / 2;
      const y = alongX ? r.y + r.h / 2 : r.y + a;
      if (moment && Math.hypot(moment.x - x, moment.y - y) < 3.5) continue;
      hang(Math.floor(x) + 0.5, Math.floor(y) + 0.5, rng.chance(0.88));
    }
  }

  /**
   * A GREAT HALL ("tall halls of shelves, galleries"): its gallery is the painter's; chandeliers down its middle; two rows of
   * reading desks (their chairs on the wall side) or of chained books down its length either side of a walkway, a candelabrum now
   * and then between them; against its walls card catalogues, globes, library steps, a spiral stair up to the gallery in one
   * corner, carts and stacks of books (the breakables); sconces and a portrait blacked out on its far walls; the Order's ink spilled.
   */
  function hallOf(r: Room): void {
    chandeliers(r, 7);
    const alongX = r.w >= r.h;
    const L0 = alongX ? r.x : r.y;
    const len = alongX ? r.w : r.h;
    const S0 = alongX ? r.y : r.x;
    const wide = alongX ? r.h : r.w;
    const style = rng.pick(['desks', 'desks', 'chained', 'mixed']);
    const rows = [S0 + 3, S0 + wide - 4];
    rows.forEach((s, k) => {
      const name = style === 'desks' || (style === 'mixed' && k === 0) ? LB_PIECES.desk : LB_PIECES.chained;
      for (let a = L0 + 3; a + 1 <= L0 + len - 4; a += 5) {
        const x = alongX ? a : s;
        const y = alongX ? s : a;
        if (!standLong(name, x, y, alongX)) continue;
        // (its chair on the wall side; now and then knocked over on its back)
        if (name === LB_PIECES.desk && rng.chance(0.75)) {
          const out = k === 0 ? -1 : 1;
          const cx = alongX ? a + rng.int(0, 1) : s + out;
          const cy = alongX ? s + out : a + rng.int(0, 1);
          stand(LB_PIECES.chair, cx, cy, rng.chance(0.15) ? 1 : 0);
        }
        if (rng.chance(0.3)) stand(LB_PIECES.candelabrum, alongX ? a + 3 : s, alongX ? s : a + 3);
      }
    });
    // (a spiral stair up to the gallery, in one of its far corners, now and then)
    if (rng.chance(0.5)) {
      const corners: [number, number][] = [[r.x + 1, r.y + 1], [r.x + r.w - 2, r.y + 1], [r.x + 1, r.y + r.h - 2]];
      for (const [tx, ty] of rng.shuffle(corners)) if (stand(LB_PIECES.stair, tx, ty)) break;
    }
    alongWalls(r, rng.shuffle([LB_PIECES.catalogue, LB_PIECES.globe, LB_PIECES.steps, LB_PIECES.catalogue]), rng.int(2, 4), rng.int(2, 3));
    dressWalls(r, 7, rng.chance(0.6) ? [LB_PIECES.portrait, LB_PIECES.banner] : [LB_PIECES.portrait]);
    litter(r, rng.int(1, 2));
  }

  /** The Order's ink lying about: a spill or its bars across the floor (the Hush's set: walked over). */
  function litter(r: Room, n: number): void {
    for (let t = 0, k = 0; t < 30 && k < n; t++) {
      const tx = rng.int(r.x + 1, r.x + r.w - 2);
      const ty = rng.int(r.y + 1, r.y + r.h - 2);
      if (lie(rng.chance(0.7) ? LB_PIECES.spill : LB_PIECES.bars, tx, ty, rng.int(0, 2))) k++;
    }
  }

  /**
   * THE STACKS ("the stacks' narrow aisles"): nothing in the aisles; at the shelves' ends, against the room's walls in its cross
   * aisles three wide, rolling steps, carts and stacks of books (the breakables), a card catalogue; across the mouths of an aisle
   * or two, a gate of the Order swung open; sconces on the shelves' fronts and the walls, a few out.
   */
  function stacksOf(r: Room): void {
    // (which way the shelves run: a row of them at the room's third tile across)
    const rowsX = wallAt(r.x + 4, r.y + 2) || wallAt(r.x + r.w - 5, r.y + 2);
    const along = rowsX ? r.w : r.h;
    const across = rowsX ? r.h : r.w;
    const a0 = rowsX ? r.x : r.y;
    const c0 = rowsX ? r.y : r.x;
    const at = (a: number, c: number): [number, number] => (rowsX ? [a, c] : [c, a]);
    // at the shelves' ends, against the walls (on a shelf's own line: the aisles stay whole)
    const ends: [number, number][] = [];
    for (let k = 2; k <= across - 3; k += 3) for (const a of [a0, a0 + along - 1]) ends.push(at(a, c0 + k));
    rng.shuffle(ends);
    const names = [LB_PIECES.steps, LB_PIECES.catalogue, LB_PIECES.steps];
    let things = 0;
    let books = 0;
    for (const [tx, ty] of ends) {
      if (things < 2 && stand(names[things], tx, ty)) things++;
      else if (books < 3 && breakable(rng.chance(0.55) ? 'barrel' : 'urn', tx, ty)) books++;
    }
    // the Order's gates, swung open across an aisle's mouth, where its shelves begin (the art's frames: shut and open spanning
    // along x, "looking along +y"; shut and open spanning along y, "looking along +x"): across an aisle that runs along x, the
    // open one spanning y (3), and the other way about (1); standing in the middle of the aisle's two tiles, open, walked through
    const aisles: number[] = [];
    for (let k = 0; k + 1 <= across - 1; k += 3) aisles.push(c0 + k);
    for (const c of rng.shuffle(aisles).slice(0, rng.int(0, 2))) {
      const a = rng.chance(0.5) ? a0 + 3 : a0 + along - 4;
      const [tx, ty] = at(a, c);
      if (taken[ty * W + tx] || !floorAt(tx, ty) || AISLES_CLEAR.on) continue;
      put(LB_PIECES.gate, tx, ty, false, rowsX ? 3 : 1, rowsX ? { x: tx + 0.5, y: ty + 1 } : { x: tx + 1, y: ty + 0.5 });
    }
    dressWalls(r, 8, []);
  }

  /**
   * THE SCRIPTORIUM ("the stolen words are being bound into one book here"): rows of copying desks all facing one way, a walkway
   * through their middle; the book press, vats of the Order's ink, baskets of struck-out pages, a rack of the stolen voices' jars,
   * the Order's hooded lantern, bundles of blank paper, against its walls; candelabra; the trap (its spilled ink) laid after.
   * THE BINDERY (the lair) the same, fewer desks, the press always.
   */
  function scriptoriumOf(r: Room, lair: boolean): void {
    const faceY = rng.chance(0.5);
    const midA = faceY ? r.x + Math.floor(r.w / 2) : r.y + Math.floor(r.h / 2);
    for (let ty = r.y + 2; ty <= r.y + r.h - 3; ty += 3) {
      for (let tx = r.x + 2; tx <= r.x + r.w - 3; tx += 3) {
        const a = faceY ? tx : ty;
        if (Math.abs(a - midA) <= 1) continue;
        if (lair && rng.chance(0.5)) continue;
        stand(LB_PIECES.copying, tx, ty, faceY ? 0 : 1);
      }
    }
    const things = lair ? [LB_PIECES.press, LB_PIECES.vat, LB_PIECES.rack, LB_PIECES.lantern] : rng.shuffle([LB_PIECES.press, LB_PIECES.vat, LB_PIECES.vat, LB_PIECES.basket, LB_PIECES.basket, LB_PIECES.rack, LB_PIECES.lantern, LB_PIECES.paper]);
    alongWalls(r, things, things.length);
    for (let t = 0, k = 0; t < 20 && k < 2; t++) if (stand(LB_PIECES.candelabrum, rng.int(r.x + 1, r.x + r.w - 2), rng.int(r.y + 1, r.y + r.h - 2))) k++;
    dressWalls(r, 6, [LB_PIECES.banner]);
    litter(r, rng.int(1, 3));
  }

  /**
   * THE READING ROOM (the Censor's): at its heart the great lectern with the book of stolen words on it ("on the lectern at the
   * heart of the library lies the book of stolen words, nearly full."), a great chandelier hung over it and a candelabrum either
   * side; the great carpet the painter's; reading desks in rows along its side walls, their chairs; a globe and the card catalogue
   * by its far wall; sconces and portraits blacked out on its far walls; chandeliers over its quarters. Its middle is the fight's:
   * nothing else stands within `READING_OPEN` tiles of the carpet's inside (the room less three tiles at its walls).
   */
  function readingRoom(r: Room): void {
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    put(LB_PIECES.book, cx, cy, true);
    hang(cx + 0.5, cy + 0.5, true);
    // (which way he came in: the boss waits on past the lectern that way, so the candelabra stand across it)
    const alongX = Math.abs(f.boss.x - (cx + 0.5)) > Math.abs(f.boss.y - (cy + 0.5));
    for (const k of [-2, 2]) stand(LB_PIECES.candelabrum, alongX ? cx : cx + k, alongX ? cy + k : cy);
    for (const [qx, qy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) hang(r.x + Math.floor(r.w * qx) + 0.5, r.y + Math.floor(r.h * qy) + 0.5, true);
    // the desks along the two walls that run the way he came in, two tiles in from them, each its chair against the wall
    const inside = (x: number, y: number): boolean => x >= r.x + READING_OPEN && y >= r.y + READING_OPEN && x < r.x + r.w - READING_OPEN && y < r.y + r.h - READING_OPEN;
    const len = alongX ? r.w : r.h;
    const L0 = alongX ? r.x : r.y;
    const S0 = alongX ? r.y : r.x;
    const wide = alongX ? r.h : r.w;
    for (const [s, out] of [[S0 + 2, -1], [S0 + wide - 3, 1]] as const) {
      for (let a = L0 + 4; a + 1 <= L0 + len - 5; a += 5) {
        const x = alongX ? a : s;
        const y = alongX ? s : a;
        if (inside(x, y)) continue;
        if (!standLong(LB_PIECES.desk, x, y, alongX)) continue;
        if (rng.chance(0.7)) stand(LB_PIECES.chair, alongX ? a + rng.int(0, 1) : s + out, alongX ? s + out : a + rng.int(0, 1), rng.chance(0.2) ? 1 : 0);
      }
    }
    // by its far wall (the one past the lectern), a globe and the catalogue
    const fx = f.boss.x > cx + 1 ? r.x + r.w - 2 : f.boss.x < cx - 1 ? r.x + 1 : -1;
    const fy = f.boss.y > cy + 1 ? r.y + r.h - 2 : f.boss.y < cy - 1 ? r.y + 1 : -1;
    const by = (k: number): [number, number] => (fx >= 0 ? [fx, r.y + Math.floor(r.h * k)] : [r.x + Math.floor(r.w * k), fy]);
    stand(LB_PIECES.globe, ...by(0.2));
    stand(LB_PIECES.catalogue, ...by(0.8));
    dressWalls(r, 5, [LB_PIECES.portrait, LB_PIECES.portrait, LB_PIECES.portrait]);
  }

  /** THE ROOM OF THE CLOSING BELL: the bell in its middle (laid with the Bells), candelabra in its corners, sconces, a portrait. */
  function bellChamber(r: Room): void {
    for (const [tx, ty] of [[r.x + 1, r.y + 1], [r.x + r.w - 2, r.y + 1], [r.x + 1, r.y + r.h - 2], [r.x + r.w - 2, r.y + r.h - 2]]) if (rng.chance(0.6)) stand(LB_PIECES.candelabrum, tx, ty);
    dressWalls(r, 5, [LB_PIECES.portrait]);
  }

  /** THE READING CLOSET (the reward: its chests the game's): a lectern, a globe, a candelabrum; a sconce. */
  function closetOf(r: Room): void {
    alongWalls(r, [LB_PIECES.lectern, LB_PIECES.globe, LB_PIECES.candelabrum], 3);
    dressWalls(r, 5, []);
  }
}
