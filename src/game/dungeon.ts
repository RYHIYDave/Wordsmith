// Dungeon level generator: one long level. A main path of rooms leads from the start to the boss
// hall; dead-end side branches hang off it, and each branch ends in a reward: a treasure vault or
// the lair of a guardian. Rooms are joined by 3-tile-wide corridors.
//
// How generateFloor builds a level:
//   1. plan     - grow the main path one room at a time: each new room is set down beside the last
//                 one (mostly carrying on the same way, sometimes turning) and joined to it by a
//                 straight or L-shaped corridor. The side branches are then grown the same way
//                 from rooms along the path. Rooms and corridors are checked against each other
//                 as rectangles BEFORE anything is drawn, so two floor areas never run side by
//                 side with only a thin wall between them, and corridors never meet. The level is
//                 therefore a tree: the only way to the boss is along the whole main path, and
//                 every branch is a dead end.
//   2. carve    - slide the plan into a square map, write rooms and corridors into the tile grid,
//                 clip a few room corners, grow walls.
//   3. roles    - start room (first on the path), boss hall (last), a treasure vault or a guardian's
//                 lair at the end of each branch, a few elite rooms along the path.
//   4. populate - monster packs sized to a per-depth budget, then props, then a check that props
//                 never wall off the boss or a pack.
// A plan that breaks a rule is thrown away and rolled again from the same seeded RNG (a few
// milliseconds in all), so the level is still decided entirely by (depth, seed).
//
// Things other code should know:
//   - Room rectangles are the floor area, but a room with clipped corners has a few wall tiles
//     inside its rectangle. Use tileAt (or the nav.ts grids) to ask whether a tile is walkable.
//   - Rooms on the main path come first in Floor.rooms, in walking order (Room.path = 0, 1, 2...);
//     branch rooms follow with Room.path = -1.
//   - The map is square, but its size depends on how the level happened to grow.
//   - Packs standing in corridors have roomId -1 (they belong to no room).
//   - Tuning lives in the "Tunables" block below and in rollSize; tests/dungeon.test.ts writes
//     the design rules out again and will fail if a change breaks one.

import { RNG } from '../engine/rng';
import { DOORS, layDoors } from './doors';
import { flowField, UNREACHABLE } from './nav';
import { laySunken, layTerraces } from './relief';
import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_NEAR, CUT_NEAR_LOW, CUT_RIGHT, SOLID_PROPS, T_FLOOR, T_VOID, T_WALL } from './types';
import type { Floor, PackSpot, PropKind, PropSpot, Room, RoomKind } from './types';

// ---------------------------------------------------------------------------------------------
// Tunables

const PATH_MIN = 11; // rooms on the main path at depth 1 ...
const PATH_MAX = 15; // ... +1 per two depths up to this
const SPAN_MAX = 160; // the finished map is never larger than this, either way
const EDGE = 2; // floor never comes within this many tiles of the map edge
const ROOM_GAP = 4; // rooms are at least this far apart (the hard rule is 3)
const CLEAR = 3; // a corridor keeps this far from every room and corridor it does not join
const GROW_TRIES = 60; // spots tried for each new room before the whole plan is rolled again
const MAX_ATTEMPTS = 500; // plan re-rolls before giving up; a level normally needs a handful

const LONG_CORRIDOR = 0.15; // share of corridors that are a long walk (9-13 tiles instead of 4-8)
const ELBOW_SHARE = 0.2; // share of rooms set off a corner of the last one, so the corridor bends
const TWO_ROOM_BRANCH = 0.5; // share of side branches with a room to cross before the reward
// TRIANGLES (only where the map-maker lays corridors straight across the screen: RELIEF.across)
const ACROSS_SHARE = 0.15; // share of rooms set off diagonally from the last one, joined to it corner to corner (one or two corridors of the kind in a dungeon)
const ACROSS_MIN = 5; // how far apart the two corners are, in tiles along the grid each way ...
const ACROSS_MAX = 8; // ... (five leaves the rooms ROOM_GAP apart)

/**
 * THE MIX INSIDE EACH DUNGEON. The owner, 7 Oct 2026, 17:51: "I want different room and hallway
 * configurations within each dungeon. So when you're populating a dungeon, it doesn't have to go
 * room, hallway. We can mix it up with the doors and the gates to make more different and
 * interesting layouts for the whole dungeon." Three pieces, each with a switch of its own:
 *   `pairs`   TWO ROOMS NEXT DOOR: now and then a room is set down three tiles from the last one,
 *             facing it, with only a door between them and no hallway to speak of;
 *   `levers`  A GATE ACROSS THE WAY, ITS LEVER NEARBY (14:01: "They can be closed with levers or
 *             switches nearby to open them."): the way in of one room of the main path is barred
 *             by a gate, and a small room at a dead end off the room before it, the NOOK, holds
 *             the lever;
 *   `locks`   A ROOM THAT LOCKS: one of the main path's elite rooms has a gate in every doorway,
 *             and they fall while the hero is inside with its pack.
 * `on`: OFF. NOTHING OF IT IS IN THE GAME until he has seen it in real dungeons and said yes
 * (told at 21:16 on the 7th: "you'll get pictures of those before any of it goes live"). OFF, A
 * DUNGEON IS WHAT IT WAS: the mix's dice are thrown only when it is on. ON, every dungeon is a new
 * dungeon, for a room set down next door moves every room after it.
 */
export const MIX = { on: false, pairs: true, levers: true, locks: true };
const PAIR_SHARE = 1 / 6; // share of joints that are two rooms next door
const PAIR_GAP = 3; // tiles of rock between two rooms next door: the least that lets the nearer room's back wall stand (render/walls.ts)
const MIX_FROM = 2; // the first dungeon with a lever's gate and a room that locks (Dungeon 1 is a new player's lesson)

const PACK_START_DIST = 10; // no pack centre this close to the hero's spawn point
const PACK_SPACING = 4; // packs in one room are at least this far apart where the room allows
const BOSS_CLEAR_RADIUS = 5; // solid props keep this far from the boss point inside the boss room
const CORRIDOR_PACK_MIN_LEN = 11; // corridors at least this long may hold a small pack
const CORRIDOR_PACKS_MAX = 4;

/** Rooms on the main path, start and boss hall included. */
export function pathRoomCount(depth: number): number {
  return Math.min(PATH_MAX, PATH_MIN + ((Math.max(1, depth) - 1) >> 1));
}

/** Side branches off the main path. Each ends in a treasure vault or a guardian's lair. */
export function branchCount(depth: number): number {
  return depth <= 2 ? 3 : depth <= 5 ? 4 : 5;
}

/** Total monsters a level of this depth aims for. */
export function monsterBudget(depth: number): number {
  return Math.min(230, 120 + 8 * (Math.max(1, depth) - 1));
}

/** Smallest and largest size of a 'normal' pack at this depth. */
export function packSizeRange(depth: number): { min: number; max: number } {
  const grow = Math.floor((Math.max(1, depth) - 1) / 3);
  return { min: Math.min(7, 3 + grow), max: Math.min(9, 6 + grow) };
}

const ELITE_PACK_MIN = 3;
const ELITE_PACK_MAX = 5;
// A guardian and its followers.
const CHAMPION_PACK_MIN = 3;
const CHAMPION_PACK_MAX = 5;

/** How many elite rooms a level of this depth has. */
export function eliteRoomCount(depth: number): number {
  return depth <= 2 ? 2 : depth <= 5 ? 3 : 4;
}

// ---------------------------------------------------------------------------------------------
// Small geometry helpers. All rectangles use inclusive tile bounds.

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** What a room is for, decided while the level is planned. */
type Role = 'start' | 'path' | 'boss' | 'side' | 'vault' | 'lair' | 'nook';

/** A room while the level is being planned. */
interface RoomPlan extends Rect {
  id: number;
  w: number;
  h: number;
  role: Role;
  /** Place along the main path (0 = start), or -1 on a side branch. */
  path: number;
}

/**
 * One straight piece of corridor, 3 tiles wide. A straight corridor is one leg; an L-shaped corridor
 * is two legs that overlap in the 3x3 block at the bend.
 */
interface Leg extends Rect {
  /** True if the leg runs along x (it is 3 rows tall); false if it runs along y (3 columns wide). */
  horiz: boolean;
  /** The centre row (horizontal leg) or centre column (vertical leg). */
  lane: number;
  /** Rooms this leg opens into (-1 = none). Only these rooms may touch the leg. */
  roomA: number;
  roomB: number;
}

interface Corridor {
  a: number;
  b: number;
  legs: Leg[];
  /** TRIANGLES: set on a corridor that runs straight across the screen (its `legs` are then only the squares it is kept clear by). */
  across?: Across;
  /** THE MIX: set on the way between two rooms next door (it is three tiles long). */
  pair?: boolean;
}

/**
 * TRIANGLES: A CORRIDOR STRAIGHT ACROSS THE SCREEN (the owner, 7 Oct 2026, of a still of one:
 * "Triangles look pretty good I like it"). Across the screen is along a line of x + y. The
 * corridor is the band of tiles whose x + y lies within 2 of `s`, from the right corner of one
 * room to the left corner of the other (both corners have x + y = s): `t0`..`t1` is how far along
 * it reaches, measured in x - y. Its middle three rows are whole floor; the row on its far side
 * is half floor and half wall, cut along a line across the screen (a flat wall that faces the
 * eye), and the row on its near side likewise, its wall cut down low (`cutBands`). Between the
 * two walls it is 2.8 tiles wide.
 */
interface Across {
  s: number;
  t0: number;
  t1: number;
}

/** True if rectangle a, grown by `pad` tiles on every side, overlaps b: fewer than `pad` tiles lie between them. */
function near(a: Rect, b: Rect, pad: number): boolean {
  return a.x0 - pad <= b.x1 && a.x1 + pad >= b.x0 && a.y0 - pad <= b.y1 && a.y1 + pad >= b.y0;
}

/** Number of tiles between two rectangles (0 = touching, negative = overlapping). */
function gapBetween(a: Rect, b: Rect): number {
  const gx = Math.max(b.x0 - a.x1, a.x0 - b.x1) - 1;
  const gy = Math.max(b.y0 - a.y1, a.y0 - b.y1) - 1;
  return Math.max(gx, gy);
}

function makeRoom(id: number, x: number, y: number, w: number, h: number, role: Role, path: number): RoomPlan {
  return { id, x0: x, y0: y, x1: x + w - 1, y1: y + h - 1, w, h, role, path };
}

/** Mix depth and seed into one 32-bit RNG seed so neighbouring seeds and depths give unrelated levels. */
function mixSeed(depth: number, seed: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(depth | 0, 0x85ebca6b)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return (h ^ (h >>> 15)) >>> 0;
}

// ---------------------------------------------------------------------------------------------
// Step 1a: room sizes

interface Size {
  w: number;
  h: number;
}

/** 'hall' is big enough for a boss fight (at least 13x12, either way round). 'nook' (THE MIX): the small room a lever stands in. */
type SizeClass = 'small' | 'medium' | 'lair' | 'hall' | 'nook';

function rollSize(rng: RNG, cls: SizeClass): Size {
  let long: number;
  let short: number;
  if (cls === 'hall') {
    long = rng.int(13, 14);
    short = 12;
  } else if (cls === 'nook') {
    long = rng.int(6, 7);
    short = rng.int(5, 6);
  } else if (cls === 'small') {
    long = rng.int(7, 9);
    short = rng.int(7, Math.min(8, long));
  } else if (cls === 'lair') {
    long = rng.int(10, 12);
    short = rng.int(9, Math.min(11, long));
  } else {
    long = rng.int(9, 12);
    short = rng.int(8, Math.min(11, long));
  }
  return rng.chance(0.5) ? { w: long, h: short } : { w: short, h: long };
}

/** Roll a size, re-rolling a few times if this exact size is already taken, so a level's rooms differ. */
function freshSize(rng: RNG, cls: SizeClass, used: Set<number>): Size {
  let size = rollSize(rng, cls);
  for (let tries = 0; tries < 4 && used.has(size.w * 100 + size.h); tries++) size = rollSize(rng, cls);
  used.add(size.w * 100 + size.h);
  return size;
}

/** The size class of each room along the main path: a middling start, a mix in between, the boss hall last. */
function pathSizeClasses(rng: RNG, count: number): SizeClass[] {
  const inner = count - 2;
  const halls = count >= 13 ? 3 : 2;
  const small = Math.round(inner * 0.3);
  const mix: SizeClass[] = [];
  for (let i = 0; i < inner; i++) mix.push(i < halls ? 'hall' : i < halls + small ? 'small' : 'medium');
  rng.shuffle(mix);
  return ['medium', ...mix, 'hall'];
}

// ---------------------------------------------------------------------------------------------
// Step 1b: corridors

/** A leg must keep CLEAR tiles away from every room it does not open into, and from every other corridor. */
function legAllowed(leg: Leg, rooms: readonly RoomPlan[], corridors: readonly Corridor[]): boolean {
  for (const r of rooms) {
    if (r.id === leg.roomA || r.id === leg.roomB) continue;
    if (near(leg, r, CLEAR)) return false;
  }
  for (const c of corridors) {
    for (const e of c.legs) if (near(leg, e, CLEAR)) return false;
  }
  return true;
}

/** Whole numbers lo..hi ordered so the ones nearest the middle tend to come first (with some randomness). */
function centredOrder(rng: RNG, lo: number, hi: number): number[] {
  const mid = (lo + hi) / 2;
  const keyed: { v: number; k: number }[] = [];
  for (let v = lo; v <= hi; v++) keyed.push({ v, k: Math.abs(v - mid) + rng.range(0, 2.5) });
  keyed.sort((p, q) => p.k - q.k);
  return keyed.map(p => p.v);
}

/** Every straight corridor between two rooms that face each other across a gap. */
function straightOptions(rng: RNG, a: RoomPlan, b: RoomPlan): Leg[][] {
  const options: Leg[][] = [];
  // Side by side: a horizontal corridor in a row both rooms share.
  if (a.x1 < b.x0 || b.x1 < a.x0) {
    const l = a.x1 < b.x0 ? a : b;
    const r = l === a ? b : a;
    const lo = Math.max(l.y0, r.y0) + 1;
    const hi = Math.min(l.y1, r.y1) - 1;
    for (const lane of centredOrder(rng, lo, hi)) {
      options.push([{ x0: l.x1 + 1, x1: r.x0 - 1, y0: lane - 1, y1: lane + 1, horiz: true, lane, roomA: l.id, roomB: r.id }]);
    }
  }
  // One above the other: a vertical corridor in a column both rooms share.
  if (a.y1 < b.y0 || b.y1 < a.y0) {
    const t = a.y1 < b.y0 ? a : b;
    const u = t === a ? b : a;
    const lo = Math.max(t.x0, u.x0) + 1;
    const hi = Math.min(t.x1, u.x1) - 1;
    for (const lane of centredOrder(rng, lo, hi)) {
      options.push([{ x0: lane - 1, x1: lane + 1, y0: t.y1 + 1, y1: u.y0 - 1, horiz: false, lane, roomA: t.id, roomB: u.id }]);
    }
  }
  return options;
}

/**
 * L-shaped corridors that leave room `hr` sideways along row `row`, bend, and enter room `vr` from
 * above or below along column `col`. Both legs include the 3x3 block at the bend. At most `limit`
 * are returned, the ones with the most central doors first.
 */
function elbowOptions(rng: RNG, hr: RoomPlan, vr: RoomPlan, limit: number): Leg[][] {
  const options: Leg[][] = [];
  // Rows the horizontal leg may use: inside hr's side, and clear of vr.
  let rowLo = hr.y0 + 1;
  let rowHi = hr.y1 - 1;
  let vrBelow: boolean;
  if (vr.y0 - CLEAR - 2 >= rowLo) {
    vrBelow = true;
    rowHi = Math.min(rowHi, vr.y0 - CLEAR - 2);
  } else if (vr.y1 + CLEAR + 2 <= rowHi) {
    vrBelow = false;
    rowLo = Math.max(rowLo, vr.y1 + CLEAR + 2);
  } else return options;
  // Columns the vertical leg may use: inside vr's top/bottom side, and clear of hr.
  let colLo = vr.x0 + 1;
  let colHi = vr.x1 - 1;
  let goEast: boolean;
  if (hr.x1 + CLEAR + 2 <= colHi) {
    goEast = true;
    colLo = Math.max(colLo, hr.x1 + CLEAR + 2);
  } else if (hr.x0 - CLEAR - 2 >= colLo) {
    goEast = false;
    colHi = Math.min(colHi, hr.x0 - CLEAR - 2);
  } else return options;

  const rows = centredOrder(rng, rowLo, rowHi);
  const cols = centredOrder(rng, colLo, colHi);
  // Try combinations starting with the most central doors on both rooms.
  for (let sum = 0; sum < rows.length + cols.length - 1 && options.length < limit; sum++) {
    for (let i = 0; i <= sum && options.length < limit; i++) {
      const j = sum - i;
      if (i >= rows.length || j >= cols.length) continue;
      const row = rows[i];
      const col = cols[j];
      const hLeg: Leg = goEast
        ? { x0: hr.x1 + 1, x1: col + 1, y0: row - 1, y1: row + 1, horiz: true, lane: row, roomA: hr.id, roomB: -1 }
        : { x0: col - 1, x1: hr.x0 - 1, y0: row - 1, y1: row + 1, horiz: true, lane: row, roomA: hr.id, roomB: -1 };
      const vLeg: Leg = vrBelow
        ? { x0: col - 1, x1: col + 1, y0: row - 1, y1: vr.y0 - 1, horiz: false, lane: col, roomA: vr.id, roomB: -1 }
        : { x0: col - 1, x1: col + 1, y0: vr.y1 + 1, y1: row + 1, horiz: false, lane: col, roomA: vr.id, roomB: -1 };
      options.push([hLeg, vLeg]);
    }
  }
  return options;
}

/** Find a corridor between two rooms: straight if they face each other, otherwise L-shaped. */
function planCorridor(rng: RNG, rooms: readonly RoomPlan[], corridors: readonly Corridor[], a: RoomPlan, b: RoomPlan): Leg[] | null {
  for (const legs of straightOptions(rng, a, b)) {
    if (legAllowed(legs[0], rooms, corridors)) return legs;
  }
  const elbows = rng.chance(0.5)
    ? elbowOptions(rng, a, b, 10).concat(elbowOptions(rng, b, a, 10))
    : elbowOptions(rng, b, a, 10).concat(elbowOptions(rng, a, b, 10));
  for (const legs of elbows) {
    if (legAllowed(legs[0], rooms, corridors) && legAllowed(legs[1], rooms, corridors)) return legs;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Step 1c: growing the level

/** The four ways a level can grow from a room: east, south, west, north. */
const SIDE_DX = [1, 0, -1, 0];
const SIDE_DY = [0, 1, 0, -1];

/**
 * Which side of a room the next one goes on. `heading` is the side the level last grew toward
 * (-1 = no preference): carrying straight on is likeliest, turning is common, doubling back never.
 */
function pickSide(rng: RNG, heading: number): number {
  if (heading < 0) return rng.int(0, 3);
  const roll = rng.next();
  return roll < 0.46 ? heading : roll < 0.73 ? (heading + 1) % 4 : (heading + 3) % 4;
}

/**
 * Set a new room down beside `from` and join the two with a corridor. Most rooms face the side of
 * the last one (a straight corridor); some sit off one of its corners (an L-shaped corridor).
 * Returns the side of `from` the level grew toward, or -1 if no spot was found.
 */
function grow(
  rng: RNG,
  rooms: RoomPlan[],
  corridors: Corridor[],
  from: RoomPlan,
  size: Size,
  role: Role,
  path: number,
  heading: number,
): number {
  // The level so far, so the new room can be refused if it would make the map too large.
  let bx0 = Infinity;
  let by0 = Infinity;
  let bx1 = -Infinity;
  let by1 = -Infinity;
  for (const r of rooms) {
    bx0 = Math.min(bx0, r.x0);
    by0 = Math.min(by0, r.y0);
    bx1 = Math.max(bx1, r.x1);
    by1 = Math.max(by1, r.y1);
  }
  const span = SPAN_MAX - 2 * EDGE;

  for (let tries = 0; tries < GROW_TRIES; tries++) {
    // TRIANGLES: now and then the new room is set off DIAGONALLY from the last one, to the right of
    // it on the screen (+x, -y) or to the left (-x, +y), its left corner on the line of x + y of the
    // other's right corner, and the two are joined corner to corner by a corridor straight across
    // the screen. (The dice for it are thrown only where the map-maker lays such corridors: a
    // dungeon without them is rolled exactly as it always was.)
    // (DOORS AND GATES, where the map-maker lays them: THE BOSS'S HALL IS NEVER COME INTO AT A CORNER.
    // The boss "always has a big gate that locks you in with him", and a gate stands in a doorway:
    // a corridor straight across the screen has none. Such a try is thrown and weighed as ever, and
    // refused only where it would have been taken: so every dungeon whose boss hall was not come
    // into at a corner is the dungeon it was, and one whose hall was is tried again from there.)
    if (RELIEF.cuts && RELIEF.across && rng.chance(ACROSS_SHARE)) {
      const right = rng.chance(0.5);
      const g = rng.int(ACROSS_MIN, ACROSS_MAX);
      const dir = right ? 1 : -1;
      const ax = right ? from.x1 : from.x0;
      const ay = right ? from.y0 : from.y1;
      const cand = makeRoom(rooms.length, right ? from.x1 + g : from.x0 - g - size.w + 1, right ? from.y0 - g - size.h + 1 : from.y1 + g, size.w, size.h, role, path);
      if (Math.max(bx1, cand.x1) - Math.min(bx0, cand.x0) + 1 > span) continue;
      if (Math.max(by1, cand.y1) - Math.min(by0, cand.y0) + 1 > span) continue;
      if (rooms.some(r => gapBetween(cand, r) < ROOM_GAP)) continue;
      if (corridors.some(c => c.legs.some(leg => near(leg, cand, CLEAR)))) continue;
      // (kept clear of every other room and corridor as a chain of squares, five tiles a side, along its middle line)
      const legs: Leg[] = [];
      for (let k = 0; k <= g; k++) {
        const cx = ax + k * dir;
        const cy = ay - k * dir;
        legs.push({ x0: cx - 2, x1: cx + 2, y0: cy - 2, y1: cy + 2, horiz: true, lane: cy, roomA: from.id, roomB: cand.id });
      }
      rooms.push(cand);
      if (!legs.every(leg => legAllowed(leg, rooms, corridors)) || (DOORS.on && role === 'boss')) {
        rooms.pop();
        continue;
      }
      const ta = ax - ay;
      const tb = ta + 2 * g * dir;
      corridors.push({ a: from.id, b: cand.id, legs, across: { s: ax + ay, t0: Math.min(ta, tb), t1: Math.max(ta, tb) } });
      // (the level has grown two ways at once, east and north or west and south: it carries on along one of them)
      return right ? (rng.chance(0.5) ? 0 : 3) : rng.chance(0.5) ? 2 : 1;
    }
    const side = pickSide(rng, heading);
    // THE MIX: now and then the new room is set down NEXT DOOR to the last one: three tiles of
    // rock between them, facing each other along most of the shorter one's side, a door and no
    // hallway to speak of. Never the boss's hall. (The dice for it are thrown only where the
    // map-maker mixes: a dungeon without the mix is rolled exactly as it always was.)
    const pair = MIX.on && MIX.pairs && role !== 'boss' && rng.chance(PAIR_SHARE);
    const gap = pair ? PAIR_GAP : rng.chance(LONG_CORRIDOR) ? rng.int(9, 13) : rng.int(ROOM_GAP, 8);
    const elbow = !pair && rng.chance(ELBOW_SHARE);
    let x: number;
    let y: number;
    if (SIDE_DX[side] !== 0) {
      x = side === 0 ? from.x1 + 1 + gap : from.x0 - gap - size.w;
      // (rows shared: three, room for a door; next door, all but two of the shorter side)
      const need = pair ? Math.max(3, Math.min(from.h, size.h) - 2) : 3;
      if (elbow) {
        const past = rng.int(-2, 5); // how far beyond the end of the wall (negative = a slight overlap)
        y = rng.chance(0.5) ? from.y1 + 1 + past : from.y0 - past - size.h;
      } else y = rng.int(from.y0 - size.h + need, from.y1 - need + 1);
    } else {
      y = side === 1 ? from.y1 + 1 + gap : from.y0 - gap - size.h;
      const need = pair ? Math.max(3, Math.min(from.w, size.w) - 2) : 3;
      if (elbow) {
        const past = rng.int(-2, 5);
        x = rng.chance(0.5) ? from.x1 + 1 + past : from.x0 - past - size.w;
      } else x = rng.int(from.x0 - size.w + need, from.x1 - need + 1);
    }
    const cand = makeRoom(rooms.length, x, y, size.w, size.h, role, path);
    if (Math.max(bx1, cand.x1) - Math.min(bx0, cand.x0) + 1 > span) continue;
    if (Math.max(by1, cand.y1) - Math.min(by0, cand.y0) + 1 > span) continue;
    if (rooms.some(r => gapBetween(cand, r) < (pair && r === from ? PAIR_GAP : ROOM_GAP))) continue;
    if (corridors.some(c => c.legs.some(leg => near(leg, cand, CLEAR)))) continue;
    rooms.push(cand);
    const legs = planCorridor(rng, rooms, corridors, from, cand);
    // (next door there is one way to join them, straight across the three tiles: no other will do)
    if (!legs || (pair && legs.length !== 1)) {
      rooms.pop();
      continue;
    }
    corridors.push(pair ? { a: from.id, b: cand.id, legs, pair: true } : { a: from.id, b: cand.id, legs });
    return side;
  }
  return -1;
}

/**
 * Grow one side branch from the first of `hosts` (rooms on the main path) that has space for it:
 * sometimes one room to cross first, then the reward room. Returns false if no host has space.
 */
function growBranch(rng: RNG, rooms: RoomPlan[], corridors: Corridor[], hosts: readonly number[], reward: Role, used: Set<number>): boolean {
  const twoRooms = rng.chance(TWO_ROOM_BRANCH);
  const crossSize = freshSize(rng, rng.chance(0.5) ? 'small' : 'medium', used);
  // A guardian needs room to fight in; a vault is a small room.
  const rewardSize = freshSize(rng, reward === 'lair' ? 'lair' : 'small', used);
  for (const host of hosts) {
    const roomMark = rooms.length;
    const corridorMark = corridors.length;
    let from = rooms[host];
    let heading = -1;
    if (twoRooms) {
      heading = grow(rng, rooms, corridors, from, crossSize, 'side', -1, -1);
      if (heading < 0) continue;
      from = rooms[rooms.length - 1];
    }
    if (grow(rng, rooms, corridors, from, rewardSize, reward, -1, heading) >= 0) return true;
    // No space for the reward room: take the first room back out and try the next host.
    rooms.length = roomMark;
    corridors.length = corridorMark;
  }
  return false;
}

interface Plan {
  rooms: RoomPlan[];
  corridors: Corridor[];
  /** Rooms 0..pathLen-1 are the main path, in walking order. */
  pathLen: number;
  /** THE MIX: the room of the main path whose way in a gate bars, and the nook its lever stands in (-1: the level has none). */
  gated: number;
  nook: number;
}

/** Steps 1a-1c: the whole level as rectangles, on a grid with no edges (coordinates may be negative). */
function planLevel(rng: RNG, depth: number): Plan | null {
  const pathLen = pathRoomCount(depth);
  const used = new Set<number>();
  const rooms: RoomPlan[] = [];
  const corridors: Corridor[] = [];

  // The main path.
  const classes = pathSizeClasses(rng, pathLen);
  const first = freshSize(rng, classes[0], used);
  rooms.push(makeRoom(0, 0, 0, first.w, first.h, 'start', 0));
  let heading = -1;
  for (let i = 1; i < pathLen; i++) {
    const size = freshSize(rng, classes[i], used);
    heading = grow(rng, rooms, corridors, rooms[i - 1], size, i === pathLen - 1 ? 'boss' : 'path', i, heading);
    if (heading < 0) return null;
  }

  // The side branches: one in each stretch of the path, never from the start room or the boss hall.
  // The first branch always ends in a vault, so the first side path a player tries pays off and a
  // guardian is never met in the opening rooms; of the rest, at least one ends in a guardian's lair.
  const want = branchCount(depth);
  const later: Role[] = ['lair'];
  while (later.length < want - 1) later.push(rng.chance(0.5) ? 'vault' : 'lair');
  const rewards: Role[] = ['vault', ...rng.shuffle(later)];
  const inner = pathLen - 2;
  for (let b = 0; b < want; b++) {
    const lo = 1 + Math.floor((b * inner) / want);
    const hi = Math.floor(((b + 1) * inner) / want);
    const hosts: number[] = [];
    for (let i = lo; i <= hi; i++) hosts.push(i);
    if (!growBranch(rng, rooms, corridors, rng.shuffle(hosts), rewards[b], used)) return null;
  }

  // THE MIX: A GATE ACROSS THE WAY, ITS LEVER NEARBY. One room k of the main path (never the first
  // after the start, never the boss's hall) has a gate in its way in; one more dead end is grown
  // from room k - 1, a short way to the NOOK, where the lever stands: so the lever is always
  // reached before the gate. The way from k - 1 to k must come into k by a doorway, for a gate
  // stands in one (a corridor straight across the screen has none), and not next door (the gate
  // would stand at the lever's elbow). Where no room has space for a nook, the dungeon has no
  // gate. (No dice for it in the first dungeons, nor where the map-maker does not mix.)
  let gated = -1;
  let nook = -1;
  if (MIX.on && MIX.levers && DOORS.on && depth >= MIX_FROM) {
    const ks: number[] = [];
    for (let k = 2; k <= pathLen - 2; k++) ks.push(k);
    const size = freshSize(rng, 'nook', used);
    for (const k of rng.shuffle(ks)) {
      const joint = corridors.find(c => (c.a === k - 1 && c.b === k) || (c.a === k && c.b === k - 1));
      if (!joint || joint.across || joint.pair) continue;
      if (grow(rng, rooms, corridors, rooms[k - 1], size, 'nook', -1, -1) < 0) continue;
      gated = k;
      nook = rooms.length - 1;
      break;
    }
  }
  return { rooms, corridors, pathLen, gated, nook };
}

// ---------------------------------------------------------------------------------------------
// Step 2: carve tiles

/** Write rooms and corridors as floor. `corr` is set to 1 on corridor floor tiles. */
function carve(size: number, rooms: readonly RoomPlan[], corridors: readonly Corridor[], tiles: Uint8Array, corr: Uint8Array): void {
  tiles.fill(T_VOID);
  corr.fill(0);
  for (const c of corridors) {
    if (c.across) {
      // (a corridor straight across the screen: the tiles of its band, which its squares cover)
      const { s, t0, t1 } = c.across;
      for (const leg of c.legs) {
        for (let y = leg.y0; y <= leg.y1; y++) {
          for (let x = leg.x0; x <= leg.x1; x++) {
            if (Math.abs(x + y - s) > 2 || x - y < t0 || x - y > t1) continue;
            tiles[y * size + x] = T_FLOOR;
            corr[y * size + x] = 1;
          }
        }
      }
      continue;
    }
    for (const leg of c.legs) {
      for (let y = leg.y0; y <= leg.y1; y++) {
        for (let x = leg.x0; x <= leg.x1; x++) {
          tiles[y * size + x] = T_FLOOR;
          corr[y * size + x] = 1;
        }
      }
    }
  }
  for (const r of rooms) {
    for (let y = r.y0; y <= r.y1; y++) {
      for (let x = r.x0; x <= r.x1; x++) {
        tiles[y * size + x] = T_FLOOR;
        corr[y * size + x] = 0;
      }
    }
  }
}

/**
 * Variety: cut the corners off some rooms (a diagonal step of 1-3 tiles). A corner with a doorway
 * close by is left square so the door stays a full 3 tiles wide.
 */
function clipCorners(rng: RNG, size: number, rooms: readonly RoomPlan[], tiles: Uint8Array, corr: Uint8Array): Clip[] {
  const clips: Clip[] = [];
  for (const r of rooms) {
    const shortSide = Math.min(r.w, r.h);
    if (shortSide < 8 || !rng.chance(0.4)) continue;
    const clip = rng.int(1, shortSide >= 10 ? 3 : 2);
    const corners = [
      { x: r.x0, y: r.y0, sx: 1, sy: 1 },
      { x: r.x1, y: r.y0, sx: -1, sy: 1 },
      { x: r.x0, y: r.y1, sx: 1, sy: -1 },
      { x: r.x1, y: r.y1, sx: -1, sy: -1 },
    ];
    for (const c of corners) {
      let doorNearby = false;
      const reach = clip + 1;
      for (let y = c.y - reach; y <= c.y + reach && !doorNearby; y++) {
        for (let x = c.x - reach; x <= c.x + reach; x++) {
          if (x >= 0 && y >= 0 && x < size && y < size && corr[y * size + x] === 1) {
            doorNearby = true;
            break;
          }
        }
      }
      if (doorNearby) continue;
      for (let dy = 0; dy < clip; dy++) {
        for (let dx = 0; dx + dy < clip; dx++) tiles[(c.y + dy * c.sy) * size + c.x + dx * c.sx] = T_VOID;
      }
      clips.push({ x: c.x, y: c.y, sx: c.sx, sy: c.sy, clip });
    }
  }
  return clips;
}

/** A corner of a room that `clipCorners` took off: the corner tile, the two ways into the room from it, and how many tiles. */
interface Clip {
  x: number;
  y: number;
  sx: number;
  sy: number;
  clip: number;
}

/** TRIANGLES: the share of the big rooms that become EIGHT-SIDED HALLS (every corner that no doorway is near is cut wide). */
export const EIGHT_SHARE = 0.3;
/** TRIANGLES: the share of the other big rooms that get a FLAT BACK WALL (the back corner cut wide: a wall that faces the eye). A treasure vault big enough always has one. */
export const BACK_SHARE = 0.3;
/** A room narrower or shallower than this is given neither (but a treasure vault, which is a small room, has its flat back wall from VAULT_MIN: three tiles wide). */
const SHAPE_MIN = 10;
const VAULT_MIN = 7;

/** TRIANGLES: a room's FLAT BACK WALL (its back corner cut wide): which room, and how many tiles the cut is. */
interface BackWall {
  room: number;
  clip: number;
}

/**
 * TRIANGLES (the owner, 7 Oct 2026: "Triangles look pretty good I like it", of stills of rooms
 * with their corners cut clean, an eight-sided hall, and a flat back wall that faces the eye).
 *
 * THE CORNERS THAT `clipCorners` TOOK OFF IN STEPS ARE CUT CLEAN. Along each such corner the first
 * floor tiles (the line of them that was the staircase's inner edge) become half floor and half
 * wall, cut corner to corner; the tiles behind them become the back of the same slanting wall
 * (half wall, half nothing), so that it is a whole tile thick; and what lay behind those is
 * nothing. Which half is wall goes by which corner of the room it is:
 *   the BACK corner (the top of the screen): the far half, a face seen head-on;
 *   the FRONT corner (toward the eye): the near half, cut down low;
 *   the LEFT and the RIGHT corner: the half to that side.
 *
 * AND SOME ROOMS ARE GIVEN A WIDER SHAPE, by dice of their own (`rng`: nothing else about the
 * dungeon hangs on them; never the room the hero arrives in, nor the boss's):
 *   AN EIGHT-SIDED HALL: every corner cut wide (3 to 5 tiles, by the room's size);
 *   A FLAT BACK WALL: the back corner alone cut wide (4 to 6 tiles; 3 in a treasure vault, which
 *   always has one if it is big enough and no doorway is near): a wall that faces the eye.
 * A corner with a doorway near it is left as it was (a door stays a full three tiles wide), and
 * two tiles of straight wall at the least are left between two cuts.
 *
 * Called after the walls are grown and the rooms have their kinds. Returns the cuts (types.ts,
 * Floor.cut), or undefined if no corner is cut; and adds to `backs` the rooms that were given a
 * flat back wall (`placeBackWalls` stands two fires against each).
 */
function cutClean(
  size: number,
  tiles: Uint8Array,
  corr: Uint8Array,
  rooms: readonly RoomPlan[],
  kinds: readonly RoomKind[],
  clips: readonly Clip[],
  rng: RNG,
  backs: BackWall[],
): Uint8Array | undefined {
  const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < size && y < size;
  /** Is there corridor floor within `reach` tiles (each way) of this tile? */
  const doorNear = (cx: number, cy: number, reach: number): boolean => {
    for (let y = cy - reach; y <= cy + reach; y++) {
      for (let x = cx - reach; x <= cx + reach; x++) if (inside(x, y) && corr[y * size + x] === 1) return true;
    }
    return false;
  };
  // Which corners are cut, and how wide.
  const all: Clip[] = [];
  for (const r of rooms) {
    // (the room's corners: back, right, left, front; each with what `clipCorners` took off it)
    const corners: Clip[] = [
      { x: r.x0, y: r.y0, sx: 1, sy: 1, clip: 0 },
      { x: r.x1, y: r.y0, sx: -1, sy: 1, clip: 0 },
      { x: r.x0, y: r.y1, sx: 1, sy: -1, clip: 0 },
      { x: r.x1, y: r.y1, sx: -1, sy: -1, clip: 0 },
    ];
    for (const c of corners) {
      const was = clips.find((q) => q.x === c.x && q.y === c.y);
      if (was) c.clip = was.clip;
    }
    // (the dice are thrown for every room, whatever it is: a room's shape hangs on nothing but its place in the list)
    const eight = rng.chance(EIGHT_SHARE);
    const flatBack = rng.chance(BACK_SHARE);
    const short = Math.min(r.w, r.h);
    const kind = kinds[r.id];
    // (a treasure vault is a small room: it has its flat back wall whatever its size, three tiles wide)
    const vault = kind === 'treasure';
    if (kind !== 'start' && kind !== 'boss') {
      if (eight && short >= SHAPE_MIN) {
        // (two tiles of straight wall are left between two corners' cuts: no wider than half of what the short side has beyond those and the two walls' ends)
        const wide = Math.max(3, Math.min(5, Math.floor(short / 3), Math.floor((short - 3) / 2)));
        for (const c of corners) if (c.clip < wide && !doorNear(c.x, c.y, wide + 1)) c.clip = wide;
      } else if ((flatBack && short >= SHAPE_MIN) || (vault && short >= VAULT_MIN)) {
        const c = corners[0];
        const least = vault ? 3 : 4;
        const room = Math.min(r.w - corners[1].clip, r.h - corners[2].clip) - 3;
        const wide = Math.min(6, Math.max(vault ? 3 : 0, Math.floor(short / 2) - 1), room);
        if (wide >= least && c.clip < wide && !doorNear(c.x, c.y, wide + 1)) c.clip = wide;
      }
      // (A FLAT BACK WALL is a back corner cut wide, and wider than the corners to its left and
      // its right, however it came by it: an eight-sided hall of which the side corners could not
      // be cut is one. What the corner toward the eye is makes no difference to it.)
      const back = corners[0].clip;
      if (back >= (vault ? 3 : 4) && back > Math.max(corners[1].clip, corners[2].clip)) backs.push({ room: r.id, clip: back });
    }
    for (const c of corners) if (c.clip > 0) all.push(c);
  }
  if (all.length === 0) return undefined;
  const cut = new Uint8Array(size * size);
  for (const c of all) {
    const back = c.sx === 1 && c.sy === 1;
    const front = c.sx === -1 && c.sy === -1;
    const left = c.sx === 1 && c.sy === -1;
    const floorCut = back ? CUT_FAR : front ? CUT_NEAR_LOW : left ? CUT_LEFT : CUT_RIGHT;
    const wallCut = back ? CUT_NEAR : front ? CUT_FAR_LOW : left ? CUT_RIGHT : CUT_LEFT;
    for (let dy = 0; dy <= c.clip; dy++) {
      for (let dx = 0; dx + dy <= c.clip; dx++) {
        const i = (c.y + dy * c.sy) * size + c.x + dx * c.sx;
        const d = dx + dy;
        if (d === c.clip) cut[i] = floorCut;
        else if (d === c.clip - 1) {
          tiles[i] = T_WALL;
          cut[i] = wallCut;
        } else tiles[i] = T_VOID;
      }
    }
  }
  // The ordinary walls round a cut corner stand only where they touch a WHOLE tile of floor (the
  // slanting wall is its own: a wall grown behind it, against the half tiles, would show over it).
  for (const c of all) {
    const reach = c.clip + 2;
    for (let y = c.y - reach; y <= c.y + reach; y++) {
      for (let x = c.x - reach; x <= c.x + reach; x++) {
        if (!inside(x, y)) continue;
        const i = y * size + x;
        if (tiles[i] !== T_WALL || cut[i] !== 0) continue;
        let touches = false;
        for (let dy = -1; dy <= 1 && !touches; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const j = (y + dy) * size + x + dx;
            if (inside(x + dx, y + dy) && tiles[j] === T_FLOOR && cut[j] === 0) {
              touches = true;
              break;
            }
          }
        }
        if (!touches) tiles[i] = T_VOID;
      }
    }
  }
  return cut;
}

/**
 * TRIANGLES: the walls of the corridors that run straight across the screen (`Across`). The row
 * of a band on its far side becomes half floor, its far half a wall seen head-on; the row on its
 * near side half floor, its near half a wall cut down low; behind each, the back of that wall
 * (half wall, half nothing), so that it is a whole tile thick. A wall tile that stands beside a
 * whole tile of floor is a room's own wall and stays whole: the slanting wall runs into it. Called
 * after `cutClean`; writes into `cut` and `tiles`.
 */
function cutBands(size: number, tiles: Uint8Array, corr: Uint8Array, cut: Uint8Array, corridors: readonly Corridor[]): void {
  const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < size && y < size;
  const whole = (x: number, y: number): boolean => inside(x, y) && tiles[y * size + x] === T_FLOOR && cut[y * size + x] === 0;
  const fars: number[] = [];
  const nears: number[] = [];
  for (const c of corridors) {
    if (!c.across) continue;
    const { s, t0, t1 } = c.across;
    for (const leg of c.legs) {
      for (let y = leg.y0; y <= leg.y1; y++) {
        for (let x = leg.x0; x <= leg.x1; x++) {
          if (!inside(x, y)) continue;
          const i = y * size + x;
          // (corridor floor only: where the band lies over its two rooms it is their floor)
          if (corr[i] !== 1 || cut[i] !== 0 || x - y < t0 || x - y > t1) continue;
          if (x + y === s - 2) {
            cut[i] = CUT_FAR;
            fars.push(i);
          } else if (x + y === s + 2) {
            cut[i] = CUT_NEAR_LOW;
            nears.push(i);
          }
        }
      }
    }
  }
  if (fars.length + nears.length === 0) return;
  /** The tile at (dx, dy) from tile `i` becomes the back of a slanting wall, unless it is a room's own wall. */
  const back = (i: number, dx: number, dy: number, kind: number): void => {
    const x = (i % size) + dx;
    const y = Math.floor(i / size) + dy;
    if (!inside(x, y)) return;
    const j = y * size + x;
    if (tiles[j] === T_FLOOR || cut[j] !== 0) return;
    if (whole(x + 1, y) || whole(x - 1, y) || whole(x, y + 1) || whole(x, y - 1)) return;
    tiles[j] = T_WALL;
    cut[j] = kind;
  };
  for (const i of fars) {
    back(i, -1, 0, CUT_NEAR);
    back(i, 0, -1, CUT_NEAR);
  }
  for (const i of nears) {
    back(i, 1, 0, CUT_FAR_LOW);
    back(i, 0, 1, CUT_FAR_LOW);
  }
  // The ordinary walls along a band stand only where they touch a WHOLE tile of floor (as round a cut corner).
  for (const c of corridors) {
    if (!c.across) continue;
    for (const leg of c.legs) {
      for (let y = leg.y0 - 2; y <= leg.y1 + 2; y++) {
        for (let x = leg.x0 - 2; x <= leg.x1 + 2; x++) {
          if (!inside(x, y)) continue;
          const i = y * size + x;
          if (tiles[i] !== T_WALL || cut[i] !== 0) continue;
          let touches = false;
          for (let dy = -1; dy <= 1 && !touches; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (whole(x + dx, y + dy)) {
                touches = true;
                break;
              }
            }
          }
          if (!touches) tiles[i] = T_VOID;
        }
      }
    }
  }
}

/** Every void tile that touches floor (8 neighbours) becomes wall. */
function growWalls(size: number, tiles: Uint8Array): void {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      if (tiles[i] !== T_VOID) continue;
      let touches = false;
      for (let dy = -1; dy <= 1 && !touches; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < size && ny < size && tiles[ny * size + nx] === T_FLOOR) {
            touches = true;
            break;
          }
        }
      }
      if (touches) tiles[i] = T_WALL;
    }
  }
}

/** True if some wall is only one tile thick with floor on both sides (a sliver between two floor areas). */
function hasThinWall(size: number, tiles: Uint8Array): boolean {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = y * size + x;
      if (tiles[i] === T_FLOOR) continue;
      if (tiles[i - 1] === T_FLOOR && tiles[i + 1] === T_FLOOR) return true;
      if (tiles[i - size] === T_FLOOR && tiles[i + size] === T_FLOOR) return true;
    }
  }
  return false;
}

/**
 * How many separate loops a player can walk round: the number of wall/void islands completely
 * surrounded by floor. A level grown as a tree has none.
 */
function countLoops(size: number, tiles: Uint8Array): number {
  const seen = new Uint8Array(size * size);
  const stack: number[] = [];
  let regions = 0;
  for (let s = 0; s < seen.length; s++) {
    if (seen[s] === 1 || tiles[s] === T_FLOOR) continue;
    regions++;
    seen[s] = 1;
    stack.push(s);
    while (stack.length > 0) {
      const i = stack.pop() as number;
      const x = i % size;
      const y = (i - x) / size;
      // Non-floor tiles join up diagonally too: a walker cannot slip between two walls that touch at a corner.
      for (let ny = Math.max(0, y - 1); ny <= Math.min(size - 1, y + 1); ny++) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(size - 1, x + 1); nx++) {
          const j = ny * size + nx;
          if (seen[j] === 0 && tiles[j] !== T_FLOOR) {
            seen[j] = 1;
            stack.push(j);
          }
        }
      }
    }
  }
  return regions - 1; // every region except the outside is an island
}

function centreX(r: RoomPlan): number {
  return r.x0 + (r.w >> 1);
}

function centreY(r: RoomPlan): number {
  return r.y0 + (r.h >> 1);
}

// ---------------------------------------------------------------------------------------------
// One layout attempt = steps 1-2

interface Layout {
  size: number;
  rooms: RoomPlan[];
  corridors: Corridor[];
  pathLen: number;
  tiles: Uint8Array;
  /** 1 on corridor floor tiles (floor that is not part of a room). */
  corr: Uint8Array;
  /** The corners of rooms that were taken off (in steps; cut clean where the map-maker lays triangles). */
  clips: Clip[];
  /** THE MIX: the gated room and the lever's nook (the plan's), and the room that locks (`assignKinds` picks it); -1: none. */
  gated: number;
  nook: number;
  locks: number;
}

/** Slide the plan so it sits in the middle of the smallest square map that holds it. Returns the map's side. */
function settle(plan: Plan): number {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  // Corridors never reach outside the box around the rooms they join, so the rooms are enough.
  for (const r of plan.rooms) {
    x0 = Math.min(x0, r.x0);
    y0 = Math.min(y0, r.y0);
    x1 = Math.max(x1, r.x1);
    y1 = Math.max(y1, r.y1);
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const size = Math.max(w, h) + 2 * EDGE;
  const dx = ((size - w) >> 1) - x0;
  const dy = ((size - h) >> 1) - y0;
  const move = (r: Rect): void => {
    r.x0 += dx;
    r.x1 += dx;
    r.y0 += dy;
    r.y1 += dy;
  };
  plan.rooms.forEach(move);
  for (const c of plan.corridors) {
    for (const leg of c.legs) {
      move(leg);
      leg.lane += leg.horiz ? dy : dx;
    }
    if (c.across) {
      c.across.s += dx + dy;
      c.across.t0 += dx - dy;
      c.across.t1 += dx - dy;
    }
  }
  return size;
}

function tryLayout(rng: RNG, depth: number): Layout | null {
  const plan = planLevel(rng, depth);
  if (!plan) return null;
  const size = settle(plan);
  const { rooms, corridors, pathLen, gated, nook } = plan;
  const tiles = new Uint8Array(size * size);
  const corr = new Uint8Array(size * size);
  carve(size, rooms, corridors, tiles, corr);
  const clips = clipCorners(rng, size, rooms, tiles, corr);
  growWalls(size, tiles);
  // The plan's own checks should make these impossible; they are here as a net.
  if (hasThinWall(size, tiles) || countLoops(size, tiles) !== 0) return null;
  const open = new Uint8Array(size * size);
  for (let i = 0; i < open.length; i++) open[i] = tiles[i] === T_FLOOR ? 1 : 0;
  const field = flowField(open, size, size, centreX(rooms[0]), centreY(rooms[0]));
  for (const r of rooms) if (field[centreY(r) * size + centreX(r)] === UNREACHABLE) return null;
  return { size, rooms, corridors, pathLen, tiles, corr, clips, gated, nook, locks: -1 };
}

// ---------------------------------------------------------------------------------------------
// Step 3: room kinds

function assignKinds(rng: RNG, depth: number, lay: Layout): RoomKind[] {
  const kinds: RoomKind[] = lay.rooms.map(r =>
    r.role === 'start' ? 'start' : r.role === 'boss' ? 'boss' : r.role === 'vault' ? 'treasure' : r.role === 'lair' ? 'guardian' : 'normal',
  );
  // Elite rooms: on the main path so nobody misses them, never the room right after the start,
  // roomy ones first so the elite pack has space to fight in, and not next door to each other
  // if that can be helped.
  const free = lay.rooms.filter(r => r.role === 'path' && r.path >= 2);
  rng.shuffle(free);
  free.sort((p, q) => (p.w * p.h >= 72 ? 0 : 1) - (q.w * q.h >= 72 ? 0 : 1));
  const want = Math.min(eliteRoomCount(depth), Math.max(0, free.length - 1));
  const chosen: RoomPlan[] = [];
  for (const apart of [2, 1]) {
    for (const r of free) {
      if (chosen.length >= want) break;
      if (chosen.includes(r) || chosen.some(c => Math.abs(c.path - r.path) < apart)) continue;
      chosen.push(r);
    }
  }
  for (const r of chosen) kinds[r.id] = 'elite';
  // THE MIX: ONE OF THE ELITE ROOMS LOCKS. Not the gated room nor the room before it (a gate that
  // falls and a gate with a lever would stand at the two ends of one hallway); not a room that is
  // come into or left at a corner (a gate stands in a doorway, and that way has none: the room
  // would not hold), nor one with a room next door. Where no elite room will do, none locks.
  // (No dice for it in the first dungeons, nor where the map-maker does not mix.)
  if (MIX.on && MIX.locks && DOORS.on && depth >= MIX_FROM) {
    const before = lay.gated >= 0 ? lay.rooms[lay.gated].path - 1 : -9;
    const fit = chosen.filter(r => r.id !== lay.gated && r.path !== before && !lay.corridors.some(c => (c.a === r.id || c.b === r.id) && (c.across !== undefined || c.pair === true)));
    if (fit.length > 0) lay.locks = rng.pick(fit).id;
  }
  return kinds;
}

// ---------------------------------------------------------------------------------------------
// Step 4: packs and props

/** For every floor tile, how many steps (8-way) to the nearest non-floor tile; 0 on non-floor. */
function wallClearance(size: number, tiles: Uint8Array): Uint8Array {
  const c = new Uint8Array(size * size);
  const at = (x: number, y: number): number => (x < 0 || y < 0 || x >= size || y >= size ? 0 : c[y * size + x]);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (tiles[y * size + x] !== T_FLOOR) continue;
      c[y * size + x] = Math.min(250, 1 + Math.min(at(x - 1, y), at(x - 1, y - 1), at(x, y - 1), at(x + 1, y - 1)));
    }
  }
  for (let y = size - 1; y >= 0; y--) {
    for (let x = size - 1; x >= 0; x--) {
      const i = y * size + x;
      if (c[i] === 0) continue;
      c[i] = Math.min(c[i], 1 + Math.min(at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1)));
    }
  }
  return c;
}

/** Mark every tile within `radius` steps (8-way) of a tile where `src` is 1. */
function spread(size: number, src: Uint8Array, radius: number): Uint8Array {
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (src[y * size + x] !== 1) continue;
      for (let ny = Math.max(0, y - radius); ny <= Math.min(size - 1, y + radius); ny++) {
        for (let nx = Math.max(0, x - radius); nx <= Math.min(size - 1, x + radius); nx++) out[ny * size + nx] = 1;
      }
    }
  }
  return out;
}

interface PackDraft {
  tile: number;
  roomId: number;
  tier: PackSpot['tier'];
  min: number;
  max: number;
  size: number;
}

/** Everything the populate step shares between its helpers. */
interface Stage {
  rng: RNG;
  depth: number;
  size: number;
  tiles: Uint8Array;
  rooms: RoomPlan[];
  kinds: RoomKind[];
  startTile: number;
  bossTile: number;
  clear: Uint8Array;
  /** 1 where any prop already stands. */
  taken: Uint8Array;
  /** 1 where a solid prop may never stand: corridors and the tiles touching them, and around start, boss and packs. */
  noSolid: Uint8Array;
  /** 1 on tiles within 2 steps of a corridor: bulky props stay off the doorstep. */
  doorstep: Uint8Array;
  /** 1 on tiles within 2 steps of the start or boss tile: no props at all. */
  keepOut: Uint8Array;
  props: PropSpot[];
  /** TRIANGLES: the rooms with a flat back wall (none where the map-maker cuts no corner). */
  backs: BackWall[];
  /** TRIANGLES: true where the map-maker has cut corners clean (some things are then put down by other rules). */
  cuts: boolean;
}

function solidAllowed(st: Stage, i: number, bulky: boolean): boolean {
  if (st.tiles[i] !== T_FLOOR || st.taken[i] === 1 || st.noSolid[i] === 1 || st.keepOut[i] === 1) return false;
  return !(bulky && st.doorstep[i] === 1);
}

function addProp(st: Stage, kind: PropKind, i: number): void {
  st.taken[i] = 1;
  st.props.push({ kind, x: i % st.size, y: Math.floor(i / st.size) });
}

/** Squared straight-line distance between two tiles. */
function tileDist2(size: number, a: number, b: number): number {
  const dx = (a % size) - (b % size);
  const dy = Math.floor(a / size) - Math.floor(b / size);
  return dx * dx + dy * dy;
}

/** Pillars: big rooms get a symmetric set of 2 or 4, standing 2-3 tiles in from the walls. */
function placePillars(st: Stage): void {
  const { rng, size } = st;
  for (const r of st.rooms) {
    if (!((r.w >= 11 && r.h >= 10) || (r.w >= 10 && r.h >= 11))) continue;
    const boss = st.kinds[r.id] === 'boss';
    const insetsX = boss ? [2] : rng.shuffle(r.w >= 12 ? [3, 3, 2] : [2, 3]);
    const insetsY = boss ? [2] : rng.shuffle(r.h >= 12 ? [3, 3, 2] : [2, 3]);
    const pair = !boss && rng.chance(0.4);
    // Try each inset in turn until a whole set fits (a set is never placed with a pillar missing).
    const insets: [number, number][] = [];
    for (const qx of insetsX) for (const qy of insetsY) insets.push([qx, qy]);
    // (TRIANGLES: where a corner is cut wide the pillars stand further in, clear of the slanting walls: see `fits`)
    if (st.cuts && !boss && r.w >= 12 && r.h >= 12) insets.push([4, 4]);
    for (const [qx, qy] of insets) {
      let spots: number[];
      if (pair && r.w >= r.h && r.h % 2 === 1) {
        // A pair stands on the room's long centre line, which only exists when the short side is odd.
        spots = [centreY(r) * size + r.x0 + qx, centreY(r) * size + r.x1 - qx];
      } else if (pair && r.h > r.w && r.w % 2 === 1) {
        spots = [(r.y0 + qy) * size + centreX(r), (r.y1 - qy) * size + centreX(r)];
      } else {
        spots = [
          (r.y0 + qy) * size + r.x0 + qx,
          (r.y0 + qy) * size + r.x1 - qx,
          (r.y1 - qy) * size + r.x0 + qx,
          (r.y1 - qy) * size + r.x1 - qx,
        ];
      }
      // (TRIANGLES: a pillar keeps a tile clear between itself and a slanting wall, as the
      // rooms the owner was shown had them; without cut corners nothing changes)
      const fits = spots.every(
        i =>
          solidAllowed(st, i, true) &&
          (!st.cuts || st.clear[i] >= 2) &&
          (!boss || tileDist2(size, i, st.bossTile) >= BOSS_CLEAR_RADIUS * BOSS_CLEAR_RADIUS),
      );
      if (!fits) continue;
      for (const i of spots) addProp(st, 'pillar', i);
      break;
    }
  }
}

/**
 * TRIANGLES: what stands against a room's FLAT BACK WALL: a fire toward each end of it, and in a
 * treasure vault the two chests between them (the still the owner saw, 7 Oct 2026: "A flat back
 * wall that faces you. A chest between two fires."). They stand on the first whole tiles in
 * front of the wall, which lie in a line across the screen. Never one of a pair alone.
 */
function placeBackWalls(st: Stage): void {
  const { size } = st;
  for (const b of st.backs) {
    const r = st.rooms.find(q => q.id === b.room);
    if (!r) continue;
    const c = b.clip;
    // (the tiles of that line, counted from its left end on the screen: dx + dy = clip + 1 from the room's back corner)
    const at = (k: number): number => (r.y0 + c + 1 - k) * size + r.x0 + k;
    // (at the wall's two ends; one tile in from them where the wall is long, or where an end is
    // taken or too near a doorway)
    for (const inset of c >= 6 ? [1, 0] : [0, 1]) {
      const fires = [at(inset), at(c + 1 - inset)];
      if (!fires.every(i => solidAllowed(st, i, false))) continue;
      for (const i of fires) addProp(st, 'brazier', i);
      break;
    }
    if (st.kinds[r.id] !== 'treasure') continue;
    const chests = c % 2 === 0 ? [at(c / 2), at(c / 2 + 1)] : [at((c + 1) / 2 - 1), at((c + 1) / 2 + 1)];
    if (chests.every(i => solidAllowed(st, i, true))) for (const i of chests) addProp(st, 'chest', i);
  }
}

/** Chests in every treasure vault: two, either side of the centre tile (or against its flat back wall, where it has one: `placeBackWalls`). */
function placeTreasureChests(st: Stage): void {
  for (const r of st.rooms) {
    if (st.kinds[r.id] !== 'treasure') continue;
    if (st.props.some(p => p.kind === 'chest' && p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1)) continue;
    const c = centreY(r) * st.size + centreX(r);
    const along = r.w >= r.h ? 1 : st.size;
    let placed = 0;
    for (const i of [c - along, c + along]) {
      if (!solidAllowed(st, i, true)) continue;
      addProp(st, 'chest', i);
      placed++;
    }
    if (placed === 0 && solidAllowed(st, c, false)) addProp(st, 'chest', c);
  }
}

/**
 * THE MIX: THE LEVER, in its nook: on the floor tile of the nook, against a wall, that is furthest
 * from where the nook's way comes in (the first such, in the order the tiles are gone through).
 * No dice. Returns its tile, or -1 if the nook has no tile for it.
 */
function placeLever(st: Stage, lay: Layout): number {
  const r = st.rooms[lay.nook];
  let best = -1;
  let far = -1;
  for (let y = r.y0; y <= r.y1; y++) {
    for (let x = r.x0; x <= r.x1; x++) {
      const i = y * st.size + x;
      if (!solidAllowed(st, i, false) || !againstWall(st.size, st.tiles, i)) continue;
      let d = Infinity;
      for (let cy = Math.max(0, r.y0 - 2); cy <= Math.min(st.size - 1, r.y1 + 2); cy++) {
        for (let cx = Math.max(0, r.x0 - 2); cx <= Math.min(st.size - 1, r.x1 + 2); cx++) {
          if (lay.corr[cy * st.size + cx] === 1) d = Math.min(d, (cx - x) * (cx - x) + (cy - y) * (cy - y));
        }
      }
      if (d !== Infinity && d > far) {
        far = d;
        best = i;
      }
    }
  }
  if (best >= 0) addProp(st, 'lever', best);
  return best;
}

/**
 * Pick up to `count` of the candidate tiles greedily: start at the first, then always the one
 * farthest from those already picked. Stops early if the next pick would be closer than minSep.
 */
function spreadPick(size: number, cands: readonly number[], count: number, minSep: number): number[] {
  if (cands.length === 0 || count <= 0) return [];
  const picked = [cands[0]];
  while (picked.length < count) {
    let best = -1;
    let bestD = -1;
    for (const c of cands) {
      let d = Infinity;
      for (const p of picked) d = Math.min(d, tileDist2(size, c, p));
      if (d > bestD) {
        bestD = d;
        best = c;
      }
    }
    if (best < 0 || bestD < minSep * minSep) break;
    picked.push(best);
  }
  return picked;
}

/** Choose `count` pack tiles in a room at random, keeping them PACK_SPACING apart whenever that can be done. */
function pickPackTiles(st: Stage, cands: readonly number[], count: number, cornerFirst: readonly number[]): number[] {
  const { rng, size } = st;
  if (count <= 1) return [rng.pick(cands)];
  for (let tries = 0; tries < 24; tries++) {
    const picked = [rng.pick(cands)];
    let ok = true;
    while (picked.length < count && ok) {
      // Prefer a roomy spread (5+ tiles apart), fall back to the minimum spacing.
      let pool: number[] = [];
      for (const sep of [PACK_SPACING + 1, PACK_SPACING]) {
        pool = cands.filter(c => picked.every(p => tileDist2(size, c, p) >= sep * sep));
        if (pool.length > 0) break;
      }
      if (pool.length === 0) ok = false;
      else picked.push(rng.pick(pool));
    }
    if (ok) return picked;
  }
  // Random tries failed: use the greedy spread, which is known to fit (that is how `count` was capped).
  return spreadPick(size, cornerFirst, count, 0);
}

function placePacks(st: Stage, lay: Layout): PackSpot[] {
  const { rng, size, rooms, kinds, depth } = st;
  const startTile = st.startTile;
  const farFromStart = (i: number): boolean => tileDist2(size, i, startTile) >= PACK_START_DIST * PACK_START_DIST;

  // Tiles touching a pillar or chest: a pack centre avoids them when it can.
  const nearSolid = spread(size, st.taken, 1);

  // Candidate tiles per room: floor, far from the start, with 2 clear tiles to every wall where the room allows.
  const cands: number[][] = [];
  const cornerFirst: number[][] = []; // the same tiles, the one farthest from the room centre first
  const capacity: number[] = []; // how many packs fit PACK_SPACING apart (at most 3)
  const tilesWith = (r: RoomPlan, clearance: number, blocked: Uint8Array): number[] => {
    const list: number[] = [];
    for (let y = r.y0; y <= r.y1; y++) {
      for (let x = r.x0; x <= r.x1; x++) {
        const i = y * size + x;
        if (st.clear[i] >= clearance && blocked[i] === 0 && farFromStart(i)) list.push(i);
      }
    }
    return list;
  };
  for (const r of rooms) {
    // Wall clearance matters most; standing next to a pillar or chest is the first thing given up.
    let list: number[] = [];
    for (const clearance of [3, 2, 1]) {
      list = tilesWith(r, clearance, nearSolid);
      if (list.length === 0) list = tilesWith(r, clearance, st.taken);
      if (list.length > 0) break;
    }
    const centre = centreY(r) * size + centreX(r);
    const sorted = list.slice().sort((p, q) => tileDist2(size, q, centre) - tileDist2(size, p, centre) || p - q);
    cands.push(list);
    cornerFirst.push(sorted);
    capacity.push(spreadPick(size, sorted, 3, PACK_SPACING).length);
  }

  // Spots for small corridor packs: the middle stretch of long corridor legs.
  const corridorSpots: number[] = [];
  for (const c of lay.corridors) {
    // (no pack stands in a corridor across the screen: it is short, and its legs are only the squares it is kept clear by)
    if (c.across) continue;
    for (const leg of c.legs) {
      const len = leg.horiz ? leg.x1 - leg.x0 + 1 : leg.y1 - leg.y0 + 1;
      if (len < CORRIDOR_PACK_MIN_LEN) continue;
      const off = rng.int(5, len - 6);
      const i = leg.horiz ? leg.lane * size + leg.x0 + off : (leg.y0 + off) * size + leg.lane;
      if (st.clear[i] >= 2 && farFromStart(i)) corridorSpots.push(i);
    }
  }
  rng.shuffle(corridorSpots);

  // --- how many packs go where ---
  const range = packSizeRange(depth);
  const goal = Math.round(monsterBudget(depth) * rng.range(0.93, 1.07));
  const normalIn = rooms.map(() => 0); // 'normal' packs per room
  let eliteRooms = 0;
  let lairs = 0;
  for (const r of rooms) {
    if (capacity[r.id] === 0) continue; // no legal tile at all (cannot happen with real room sizes)
    const kind = kinds[r.id];
    if (kind === 'normal') {
      const area = r.w * r.h;
      normalIn[r.id] = Math.min(capacity[r.id], area < 72 ? 1 : area < 121 ? 2 : 3);
    } else if (kind === 'treasure') normalIn[r.id] = 1; // the vault's guards
    else if (kind === 'elite') {
      eliteRooms++;
      if (capacity[r.id] >= 2 && rng.chance(0.5)) normalIn[r.id] = 1;
    } else if (kind === 'guardian') lairs++; // the guardian and its followers, nothing else
  }
  const maxCorridorPacks = Math.min(CORRIDOR_PACKS_MAX, corridorSpots.length);
  let corridorPacks = rng.int(0, maxCorridorPacks);

  // Nudge the pack count until the budget can be met with pack sizes away from their limits.
  const fixedShare = eliteRooms * ((ELITE_PACK_MIN + ELITE_PACK_MAX) / 2) + lairs * ((CHAMPION_PACK_MIN + CHAMPION_PACK_MAX) / 2);
  const normalPacks = (): number => normalIn.reduce((a, b) => a + b, 0) + corridorPacks;
  const averageSize = (): number => (goal - fixedShare) / Math.max(1, normalPacks());
  for (let guard = 0; guard < 60 && averageSize() > range.max - 0.75; guard++) {
    // Too few packs: add one where the rules still allow it.
    const options: number[] = []; // room id, or -1 for a corridor pack
    for (const r of rooms) {
      const kind = kinds[r.id];
      if (kind === 'normal' && normalIn[r.id] < capacity[r.id]) options.push(r.id);
      if (kind === 'elite' && normalIn[r.id] === 0 && capacity[r.id] >= 2) options.push(r.id);
    }
    if (corridorPacks < maxCorridorPacks) options.push(-1);
    if (options.length === 0) break;
    const pick = rng.pick(options);
    if (pick < 0) corridorPacks++;
    else normalIn[pick]++;
  }
  for (let guard = 0; guard < 60 && averageSize() < range.min + 0.75; guard++) {
    // Too many packs: drop an optional one.
    const options: number[] = [];
    for (const r of rooms) {
      const kind = kinds[r.id];
      if (kind === 'normal' && normalIn[r.id] > 1) options.push(r.id);
      if (kind === 'elite' && normalIn[r.id] > 0) options.push(r.id);
    }
    if (corridorPacks > 0) options.push(-1);
    if (options.length === 0) break;
    const pick = rng.pick(options);
    if (pick < 0) corridorPacks--;
    else normalIn[pick]--;
  }

  // --- where each pack stands ---
  const drafts: PackDraft[] = [];
  for (const r of rooms) {
    const kind = kinds[r.id];
    const list = cands[r.id];
    if (list.length === 0) continue;
    if (kind === 'elite' || kind === 'guardian') {
      // The elite pack (or the guardian) takes the spot nearest the middle of the room; an extra normal pack keeps its distance.
      const centre = centreY(r) * size + centreX(r);
      const nearestCentreFirst = (p: number, q: number): number => tileDist2(size, p, centre) - tileDist2(size, q, centre) || p - q;
      const spots = normalIn[r.id] > 0 ? pickPackTiles(st, list, 2, cornerFirst[r.id]) : list.slice();
      spots.sort(nearestCentreFirst);
      if (kind === 'elite') drafts.push({ tile: spots[0], roomId: r.id, tier: 'elite', min: ELITE_PACK_MIN, max: ELITE_PACK_MAX, size: ELITE_PACK_MIN });
      else drafts.push({ tile: spots[0], roomId: r.id, tier: 'champion', min: CHAMPION_PACK_MIN, max: CHAMPION_PACK_MAX, size: CHAMPION_PACK_MIN });
      if (normalIn[r.id] > 0 && spots.length > 1) {
        drafts.push({ tile: spots[1], roomId: r.id, tier: 'normal', min: range.min, max: range.max, size: range.min });
      }
    } else if (normalIn[r.id] > 0) {
      for (const tile of pickPackTiles(st, list, normalIn[r.id], cornerFirst[r.id])) {
        drafts.push({ tile, roomId: r.id, tier: 'normal', min: range.min, max: range.max, size: range.min });
      }
    }
  }
  for (const tile of corridorSpots) {
    if (corridorPacks <= 0) break;
    // Keep corridor packs well apart from every other pack.
    if (drafts.some(d => tileDist2(size, d.tile, tile) < 36)) continue;
    drafts.push({ tile, roomId: -1, tier: 'normal', min: range.min, max: range.min + 1, size: range.min });
    corridorPacks--;
  }

  // --- pack sizes: everyone starts at the minimum, then the rest of the budget is dealt out one monster at a time ---
  let left = goal - drafts.reduce((a, d) => a + d.size, 0);
  while (left > 0) {
    const open = drafts.filter(d => d.size < d.max);
    if (open.length === 0) break;
    rng.pick(open).size++;
    left--;
  }

  return drafts.map(d => ({
    x: (d.tile % size) + 0.5,
    y: Math.floor(d.tile / size) + 0.5,
    roomId: d.roomId,
    size: d.size,
    tier: d.tier,
  }));
}

/** Number of non-floor tiles among the 8 neighbours (5 in a square corner, 3 along a straight wall). */
function wallsAround(size: number, tiles: Uint8Array, i: number): number {
  const x = i % size;
  const y = Math.floor(i / size);
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size || tiles[ny * size + nx] !== T_FLOOR) n++;
    }
  }
  return n;
}

/** True if a wall is directly beside the tile (left, right, up or down). */
function againstWall(size: number, tiles: Uint8Array, i: number): boolean {
  return tiles[i - 1] !== T_FLOOR || tiles[i + 1] !== T_FLOOR || tiles[i - size] !== T_FLOOR || tiles[i + size] !== T_FLOOR;
}

/** Floor tiles of a room that stand against a wall. */
function wallTiles(st: Stage, r: RoomPlan): number[] {
  const list: number[] = [];
  for (let y = r.y0; y <= r.y1; y++) {
    for (let x = r.x0; x <= r.x1; x++) {
      const i = y * st.size + x;
      if (st.tiles[i] === T_FLOOR && againstWall(st.size, st.tiles, i)) list.push(i);
    }
  }
  return list;
}

/** Braziers: 2-4 per room against the walls, corners first; the boss room gets 4-6. */
function placeBraziers(st: Stage): void {
  const { rng, size } = st;
  for (const r of st.rooms) {
    const boss = st.kinds[r.id] === 'boss';
    const want = boss ? rng.int(4, 6) : rng.int(2, 4);
    // (the fires that already stand against a flat back wall count, and the others keep their distance from them)
    const placed: number[] = [];
    for (const p of st.props) if (p.kind === 'brazier' && p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1) placed.push(p.y * size + p.x);
    const midX = centreX(r);
    const midY = centreY(r);
    const scored = wallTiles(st, r)
      .filter(i => solidAllowed(st, i, false) && (!boss || tileDist2(size, i, st.bossTile) >= BOSS_CLEAR_RADIUS * BOSS_CLEAR_RADIUS))
      .map(i => {
        // Corners score highest, then the middle of a wall, then anywhere along a wall.
        const mid = i % size === midX || Math.floor(i / size) === midY ? 0.5 : 0;
        return { i, score: wallsAround(size, st.tiles, i) + mid + rng.next() * 0.4 };
      })
      .sort((p, q) => q.score - p.score || p.i - q.i);
    for (const sep of [4, 2]) {
      for (const c of scored) {
        if (placed.length >= want) break;
        if (st.taken[c.i] === 1) continue;
        if (placed.some(p => tileDist2(size, p, c.i) < sep * sep)) continue;
        placed.push(c.i);
        addProp(st, 'brazier', c.i);
      }
    }
  }
}

/** Barrels and urns: a cluster of 2-4 against a wall in about half the rooms. */
function placeClusters(st: Stage): void {
  const { rng, size } = st;
  for (const r of st.rooms) {
    if (!rng.chance(0.5)) continue;
    const clusters = r.w * r.h >= 120 && rng.chance(0.4) ? 2 : 1;
    const boss = st.kinds[r.id] === 'boss';
    const allowed = (i: number): boolean =>
      solidAllowed(st, i, true) && (!boss || tileDist2(size, i, st.bossTile) >= BOSS_CLEAR_RADIUS * BOSS_CLEAR_RADIUS);
    for (let k = 0; k < clusters; k++) {
      const anchors = wallTiles(st, r).filter(allowed);
      if (anchors.length === 0) break;
      const want = rng.int(2, 4);
      const cluster = [rng.pick(anchors)];
      while (cluster.length < want) {
        // Grow along the wall, now and then one tile out from it.
        const options: number[] = [];
        for (const c of cluster) {
          for (const n of [c - 1, c + 1, c - size, c + size]) {
            if (cluster.includes(n) || !allowed(n)) continue;
            const x = n % size;
            const y = Math.floor(n / size);
            if (x < r.x0 || x > r.x1 || y < r.y0 || y > r.y1 || st.clear[n] > 2) continue;
            options.push(n);
            if (st.clear[n] === 1) options.push(n, n); // three times as likely to hug the wall
          }
        }
        if (options.length === 0) break;
        cluster.push(rng.pick(options));
      }
      if (cluster.length < 2) continue; // a lone barrel is not a cluster
      const mostly: PropKind = rng.chance(0.5) ? 'barrel' : 'urn';
      const other: PropKind = mostly === 'barrel' ? 'urn' : 'barrel';
      for (const i of cluster) addProp(st, rng.chance(0.75) ? mostly : other, i);
    }
  }
}

/** A 30% chance of one extra chest against the wall of a random normal room (on the path or off it). */
function placeBonusChest(st: Stage): void {
  const { rng, size } = st;
  if (!rng.chance(0.3)) return;
  const normals = st.rooms.filter(r => st.kinds[r.id] === 'normal');
  if (normals.length === 0) return;
  const r = rng.pick(normals);
  const spots = wallTiles(st, r).filter(i => solidAllowed(st, i, true));
  if (spots.length === 0) return;
  // Prefer a flat stretch of wall over a corner.
  const flat = spots.filter(i => wallsAround(size, st.tiles, i) === 3);
  addProp(st, 'chest', rng.pick(flat.length > 0 ? flat : spots));
}

/** Bones and rubble: flat decoration, about one per 40 floor tiles, anywhere on the floor. */
function placeLitter(st: Stage): void {
  const { rng } = st;
  const floor: number[] = [];
  for (let i = 0; i < st.tiles.length; i++) if (st.tiles[i] === T_FLOOR) floor.push(i);
  let want = Math.round(floor.length / 40);
  for (let tries = want * 6; tries > 0 && want > 0; tries--) {
    const i = rng.pick(floor);
    if (st.taken[i] === 1 || st.keepOut[i] === 1) continue;
    addProp(st, rng.chance(0.5) ? 'bones' : 'rubble', i);
    want--;
  }
}

/**
 * Safety net: walk the floor from the start, treating solid props as blocked. If the boss point or
 * a pack cannot be reached, remove the fewest props that stand in the way and try again.
 */
function unblockProps(st: Stage, packs: readonly PackSpot[]): void {
  const { size, tiles } = st;
  const n = size * size;
  const targets = [st.bossTile, ...packs.map(p => Math.floor(p.y) * size + Math.floor(p.x))];
  const solidAt = new Int32Array(n).fill(-1); // index into st.props, or -1
  const walk = new Uint8Array(n);
  const seen = new Uint8Array(n);
  for (let round = 0; round < 50; round++) {
    solidAt.fill(-1);
    st.props.forEach((p, k) => {
      if (SOLID_PROPS.includes(p.kind)) solidAt[p.y * size + p.x] = k;
    });
    for (let i = 0; i < n; i++) walk[i] = tiles[i] === T_FLOOR && solidAt[i] < 0 ? 1 : 0;
    // Flood from the start (side steps only: a diagonal squeeze between two props does not count).
    seen.fill(0);
    const queue = [st.startTile];
    seen[st.startTile] = 1;
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head];
      for (const j of [i - 1, i + 1, i - size, i + size]) {
        if (walk[j] === 1 && seen[j] === 0) {
          seen[j] = 1;
          queue.push(j);
        }
      }
    }
    const lost = targets.find(t => seen[t] === 0);
    if (lost === undefined) return;

    // Cheapest way from the lost target back to reachable floor, where each prop in the way costs 1.
    const cost = new Int32Array(n).fill(-1);
    const from = new Int32Array(n).fill(-1);
    const deque: number[] = [lost];
    cost[lost] = solidAt[lost] >= 0 ? 1 : 0;
    let goal = -1;
    while (deque.length > 0) {
      const i = deque.shift() as number;
      if (seen[i] === 1) {
        goal = i;
        break;
      }
      for (const j of [i - 1, i + 1, i - size, i + size]) {
        if (tiles[j] !== T_FLOOR) continue;
        const step = solidAt[j] >= 0 ? 1 : 0;
        if (cost[j] >= 0 && cost[j] <= cost[i] + step) continue;
        cost[j] = cost[i] + step;
        from[j] = i;
        if (step === 0) deque.unshift(j);
        else deque.push(j);
      }
    }
    if (goal < 0) return; // not a prop problem
    const remove = new Set<number>();
    for (let i = goal; i >= 0; i = from[i]) if (solidAt[i] >= 0) remove.add(solidAt[i]);
    if (remove.size === 0) return;
    st.props = st.props.filter((_, k) => !remove.has(k));
  }
}

// ---------------------------------------------------------------------------------------------
// Public API

/** Build dungeon number `depth` (1 = first). The same (depth, seed) must always give the identical Floor. */
export function generateFloor(depth: number, seed: number): Floor {
  const d = Math.max(1, Math.floor(depth) || 1);
  const rng = new RNG(mixSeed(d, seed));

  // Steps 1-2: roll layouts until one passes every rule.
  let lay: Layout | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && !lay; attempt++) lay = tryLayout(rng, d);
  if (!lay) throw new Error(`generateFloor: no layout found for depth ${depth}, seed ${seed}`);

  const size = lay.size;
  const start = lay.rooms[0];
  const boss = lay.rooms[lay.pathLen - 1];
  const startTile = centreY(start) * size + centreX(start);
  const bossTile = centreY(boss) * size + centreX(boss);

  // Steps 3-4: kinds, packs, props.
  const kinds = assignKinds(rng, d, lay);
  const special = new Uint8Array(size * size);
  special[startTile] = 1;
  special[bossTile] = 1;
  // TRIANGLES: the corners that were taken off in steps are cut clean (`RELIEF.cuts`, on). To
  // everything that is put down in a room a cut tile is wall: nothing stands or lies on half a
  // tile, no pack is centred on one, and a fire may stand against the slanting wall as against any.
  // (the shapes of rooms by dice of their own: the dungeon's own dice roll what they rolled)
  const backs: BackWall[] = [];
  let cut = RELIEF.cuts ? cutClean(size, lay.tiles, lay.corr, lay.rooms, kinds, lay.clips, new RNG((mixSeed(d, seed) ^ 0x3c0c7a11) >>> 0), backs) : undefined;
  // (and the walls of the corridors that run straight across the screen, where the layout has any)
  if (RELIEF.cuts && lay.corridors.some(c => c.across)) {
    cut ??= new Uint8Array(size * size);
    cutBands(size, lay.tiles, lay.corr, cut, lay.corridors);
  }
  const cuts = cut;
  const solidTiles = cuts ? lay.tiles.map((t, i) => (cuts[i] !== 0 ? T_WALL : t)) : lay.tiles;
  const st: Stage = {
    rng,
    depth: d,
    size,
    tiles: solidTiles,
    rooms: lay.rooms,
    kinds,
    startTile,
    bossTile,
    clear: wallClearance(size, solidTiles),
    taken: new Uint8Array(size * size),
    noSolid: spread(size, lay.corr, 1),
    doorstep: spread(size, lay.corr, 2),
    keepOut: spread(size, special, 2),
    props: [],
    backs,
    cuts: cut !== undefined,
  };
  // Pillars and the treasure chests go in before the packs so packs can stand clear of them.
  placeBackWalls(st);
  placePillars(st);
  placeTreasureChests(st);
  // (THE MIX: the lever in its nook, before the packs, which stand clear of it. A nook with no tile for one is a dead end like any other, and nothing is gated.)
  const leverTile = lay.nook >= 0 ? placeLever(st, lay) : -1;
  if (leverTile < 0) lay.gated = -1;
  const packs = placePacks(st, lay);
  // Other solid props keep off the pack centres and the tiles around them.
  const packTiles = new Uint8Array(size * size);
  for (const p of packs) packTiles[Math.floor(p.y) * size + Math.floor(p.x)] = 1;
  const nearPack = spread(size, packTiles, 1);
  for (let i = 0; i < nearPack.length; i++) if (nearPack[i] === 1) st.noSolid[i] = 1;
  placeBraziers(st);
  placeClusters(st);
  placeBonusChest(st);
  placeLitter(st);
  unblockProps(st, packs);

  const variant = new Uint8Array(size * size);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);

  const rooms: Room[] = lay.rooms.map(r => ({ id: r.id, x: r.x0, y: r.y0, w: r.w, h: r.h, kind: kinds[r.id], path: r.path }));
  // (THE MIX: the rooms it marks. Nothing is written on a room where the map-maker does not mix.)
  if (lay.gated >= 0) rooms[lay.gated].gated = true;
  if (lay.gated >= 0 && lay.nook >= 0) rooms[lay.nook].nook = true;
  if (lay.locks >= 0) rooms[lay.locks].locks = true;
  const floor: Floor = {
    depth: d,
    seed,
    w: size,
    h: size,
    tiles: lay.tiles,
    variant,
    rooms,
    start: { x: centreX(start) + 0.5, y: centreY(start) + 0.5 },
    boss: { x: centreX(boss) + 0.5, y: centreY(boss) + 0.5 },
    packs,
    props: st.props,
  };
  if (cut) floor.cut = cut;
  if (lay.gated >= 0 && leverTile >= 0) floor.levers = [{ x: leverTile % size, y: Math.floor(leverTile / size), room: lay.gated }];
  // Step 5: TERRACES AND STAIRS (relief.ts), laid last and by dice of their own: the rooms, the
  // corridors, the packs and the props are what they were before there was any height.
  if (RELIEF.on) layTerraces(floor, lay.corr, new RNG((mixSeed(d, seed) ^ 0x7e44ace5) >>> 0));
  // (sunken floor, with dice of its own, after the terraces: a dungeon's terraces are the ones it had before there was any)
  if (RELIEF.on && RELIEF.sunken) laySunken(floor, lay.corr, new RNG((mixSeed(d, seed) ^ 0x051d0e11) >>> 0));
  // Step 6: DOORS AND GATES (doors.ts), if the map-maker lays them (`DOORS.on`: off). They take no
  // dice: a door stands in every doorway the level has, and the boss's gate in the boss hall's.
  if (DOORS.on) floor.doors = layDoors(floor);
  return floor;
}

/**
 * Whether dungeons are laid with terraces and stairs (`on`: a switch for the tests and the tools
 * that ask what a dungeon was before there was any height; the game leaves it on), and whether
 * with SUNKEN FLOOR as well (`sunken`), and whether the corners of rooms are CUT CLEAN with
 * triangles where they were taken off in steps (`cuts`). SUNKEN FLOOR IS ON SINCE VERSION 18.1:
 * the owner saw its picture and said (7 Oct 2026, 09:38) "Yes sounds good". THE CUTS ARE ON SINCE
 * VERSION 18.2: he was sent three real rooms, each as it was and as it would be (11:11, with
 * "Good to put out once it passes the full playtests?"), and said (11:28) "That’s good."
 * `across` (with `cuts`): some rooms are joined by CORRIDORS STRAIGHT ACROSS THE SCREEN. It has a
 * switch of its own because he was told it comes after the room shapes, with pictures of its own;
 * and with it the rooms of a dungeon are other rooms (the planner sets them down differently),
 * which the room shapes alone never do. ON SINCE VERSION 18.3: he was sent its picture at 12:00
 * (three stills of one real dungeon, with "Want it in? It would follow 18.2 as a small update of
 * its own, then the walls.") and said (12:39) "Let’s try it out".
 */
export const RELIEF = { on: true, sunken: true, cuts: true, across: true };

/** Tile id at integer tile coordinates; T_VOID outside the map. */
export function tileAt(f: Floor, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return T_VOID;
  return f.tiles[ty * f.w + tx];
}
