// ACT 2, THE HUSH: FLOOR 14, THE HOUSE OF QUIET: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the floor,
// game/act2_dress.ts for its dressing). Behind ACT2 (game/act1.ts), off until his yes; built at his word of 19 Oct 2026, 11:01
// Pacific, to the planning chat: "Get levels 11-15 into the game".
//
// HIS DOC FOR IT ("Wordsmith Act 2: The Hush", the planning chat's, with his yes as ideas): "The city infirmary, where the
// Hushed are taken to be cured."; its layout "indoors: wards of iron beds, apothecary rooms, and a surgical theatre with a
// gallery. Rooms and halls, like the Prison."; its hazards "spilled tonics that leave clouds of the Hush on the floor"; its
// enemies "Hushed patients who sit up in their beds as you pass, and the Physician's orderlies"; its story "the doctors
// aren't curing anyone. They draw out people's last words. The Physician's ledger shows where every page goes: up the hill to
// the High City."; its boss the Physician, in the Physician's Theatre, and his moves "the Draw, a lunge that steals one of your
// words", "Tonic, vials smashed on the floor that leave clouds of the Hush" and "Rounds, where the patients rise from their
// beds". Its Muffled Bell the chapel bell; its Bells the patients' call bells in the wards.
// The art (the art chat's, every piece of it): its ground art/housequiet.ts (houseOfQuietLook, HQ_ZONE), its 25 pieces
// art/floor14.ts and the Hush's 25 art/act2_set.ts, its moment art/floor14_moments.ts; the stretch it laid by hand,
// src/dev/preview_housequiet.ts (the model for how the rooms are dressed); docs/mockups/act2_housequiet/README.md.
//
// WHAT IT LAYS (the planning chat's picks, where his doc and the art leave it open):
//   THE HOUSE, as the Prison is laid (game/dungeon.ts): rooms joined by halls three tiles wide, every edge straight, every
//     room at least ROOM_GAP from the next (walls that thick), a tree: one main way from the door to the theatre, side rooms
//     off it. Its main way, as long as the descent's floors (his words to the main chat, 17 Oct 2026, 11:37: "The levels are
//     very short in 6-7 so far"; "8-10 need to be significantly longer as well"): the ENTRANCE HALL where he comes in (the
//     waypoint beside him); then LONG HALLS (grey flags) between WARDS of iron beds and an APOTHECARY; a VESTIBULE; THE
//     THEATRE at the far end, its operating table under its lamp in the middle and its gallery round its far corner; and
//     THE WAY ON in a small room beyond it, through it. Off the main way: THE CHAPEL (its bell, the Muffled Bell), more
//     wards, a second apothecary now and then, the orderlies' LAIR (a locked ward: its guardian pack), and a STORE or two
//     (the reward's chests). About 200 by 100 tiles, as the descent's stand-in was.
//   WHAT EACH TILE IS (Land.zones, the art's HQ_ZONE: Ward, Hall, Apothecary, Theatre, Chapel): every walkable tile said, the
//     halls between rooms Hall (zone 0 is the art's Ward, so nothing is left unsaid).
//   THE BELLS (docs/act2_build.md, THE BELLS' CONTRACT): the Muffled Bell, "the chapel bell (the Muffled Bell)", on the
//     chapel's floor under its tower, in its middle; the wards gathered round the chapel, off its walls and the hall it hangs
//     from; six patients' call bells on those wards' far walls, each in the row of beds in a bed's place, a bed beside it;
//     the Hush's circle round the chapel bell. A plan that cannot keep the contract is rolled again (about one in five).
//   ITS PACKS: the floor's own (game/act2_mobs.ts), a few to a room by its size; in the wards, packs of the patients, among
//     the beds (another helper builds the patients' rules: they sit up out of the beds; houseBeds below says where every bed
//     is and which way it lies); the lair's its guardian's; none in the chapel, the theatre or the room beyond it.
//   ITS DRESSING (`dress`): the art's pieces, room by room, as the art chat laid its stretch; the lamps of green glass on the
//     far walls (the floor's light, his doc's "pale green lamplight"); the spilled tonic, laid as the descent's traps are (the
//     spike floor's beat, game/traps.ts: its cloud hurts as the spikes do, for now); the Physician's ledger in the theatre.
//
// Everything is by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act2Pack, act2Ready } from '../act2_mobs';
import type { Act1Dress, Act1Tile } from '../act1_dress';
import type { AreaRole, Blob, Laid, Land, Lane } from '../act1_layout';
import type { BellsPlan } from '../act2_types';
import { PACK_BY_SIZE, sizeOf } from '../defs';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, HazardSpot, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor (it does: the descent's no longer stands in). */
export const BUILT = true;

/**
 * WHAT EACH WALKABLE TILE IS: the art chat's HQ_ZONE (art/housequiet.ts), its numbers here, for no file of the game imports the
 * art (tests/act2_housequiet.test.ts holds the two the same).
 */
export const HOUSE_ZONE = { Ward: 0, Hall: 1, Apothecary: 2, Theatre: 3, Chapel: 4 } as const;

// ---------------------------------------------------------------------------------------------------
// THE HOUSE'S MEASURES (tiles)

/** A hall between rooms: three tiles wide, as the Prison's corridors are (game/dungeon.ts). */
const CW = 3;
/** Rooms stand at least this far apart: the walls between them this thick (the Prison's hard rule). */
const ROOM_GAP = 3;
/** A hall between rooms keeps this far from every room and hall it does not join. */
const CLEAR = 2;
/** Wall left round the house, to the map's edge. */
const MARGIN = 8;
/** The main way wanders across the floor no more than this far either side of where it began. */
const BAND = 40;

/** What a room of the house is for. */
export type HouseRole = 'entrance' | 'hall' | 'ward' | 'apothecary' | 'vestibule' | 'theatre' | 'beyond' | 'chapel' | 'lair' | 'store';

/** Each kind of room's sides, its long one and its short one (each a range, tiles of floor). */
const SIZE: Readonly<Record<HouseRole, { long: [number, number]; short: [number, number] }>> = {
  entrance: { long: [11, 13], short: [9, 11] },
  hall: { long: [14, 22], short: [5, 6] },
  ward: { long: [16, 22], short: [9, 11] },
  apothecary: { long: [11, 13], short: [8, 10] },
  vestibule: { long: [9, 11], short: [8, 9] },
  // (his doc's "room round it for his moves": the Draw's lunge 1.9 tiles, the Tonic's clouds 1.8 out, the Rounds' rings 3.5)
  theatre: { long: [21, 23], short: [19, 20] },
  beyond: { long: [8, 9], short: [8, 8] },
  chapel: { long: [12, 14], short: [11, 12] },
  lair: { long: [12, 14], short: [10, 11] },
  store: { long: [8, 10], short: [7, 8] },
};
/** Each kind's floor (HQ_ZONE). */
const ZONE_OF: Readonly<Record<HouseRole, number>> = {
  entrance: HOUSE_ZONE.Hall,
  hall: HOUSE_ZONE.Hall,
  ward: HOUSE_ZONE.Ward,
  apothecary: HOUSE_ZONE.Apothecary,
  vestibule: HOUSE_ZONE.Hall,
  theatre: HOUSE_ZONE.Theatre,
  beyond: HOUSE_ZONE.Hall,
  chapel: HOUSE_ZONE.Chapel,
  lair: HOUSE_ZONE.Ward,
  store: HOUSE_ZONE.Hall,
};

/**
 * THE BELLS ON THIS FLOOR (docs/act2_build.md, THE BELLS' CONTRACT): six small bells (the contract's "14 six"), the names
 * the art gives them, and how far the contract keeps them: no two within 8 tiles, none within 10 of the start, the Muffled
 * Bell at least 12 from it; the Hush's circle holding every bell with 4 tiles to spare and 12 clear of the start. (Each a
 * half tile more here, so that no rounding brings one under.)
 */
export const HQ_BELLS = { count: 6, muffled: 'the chapel bell (the Muffled Bell)', small: "a patient's call bell", apart: 8.5, fromStart: 10.5, muffledFromStart: 12.5, spare: 4.5, startClear: 12.5 } as const;

// ---------------------------------------------------------------------------------------------------
// THE PLAN: rooms and the halls between them, as rectangles, checked against each other before anything is laid

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PlanRoom extends Rect {
  role: HouseRole;
  /** Its place along the main way (0 the entrance), or -1 off it. */
  path: number;
  /** The room it hangs from (-1 for the entrance). */
  parent: number;
}
/** A hall between two rooms: its rectangle, the rooms it joins, which way it runs. */
interface Join extends Rect {
  a: number;
  b: number;
  alongX: boolean;
}
interface Plan {
  rooms: PlanRoom[];
  joins: Join[];
}

/** Do two rectangles come within `gap` of each other? */
const near = (a: Rect, b: Rect, gap: number): boolean => a.x - gap < b.x + b.w && b.x - gap < a.x + a.w && a.y - gap < b.y + b.h && b.y - gap < a.y + a.h;
/** Which way a step goes: 0 toward +x, 1 toward -x, 2 toward +y, 3 toward -y. */
type Side = 0 | 1 | 2 | 3;
const alongXOf = (s: Side): boolean => s < 2;

/**
 * A NEW ROOM `w` by `h` set off `host` on its side `side`, a hall `len` long between them (straight, CW wide, a tile in from
 * each room's corners); `far`: the hall comes into the new room at least this far from its far corner (x0, y0) along the wall
 * it comes through (the theatre's gallery stands in that corner). Null where there is no room for it.
 */
function attach(rng: RNG, plan: Plan, host: number, side: Side, w: number, h: number, len: number, far = 0): { room: Rect; join: Rect } | null {
  const H = plan.rooms[host];
  const ax = alongXOf(side);
  // (the hall's place across its way, inside the host's side a tile in from its corners)
  const hostLo = ax ? H.y + 1 : H.x + 1;
  const hostHi = ax ? H.y + H.h - CW - 1 : H.x + H.w - CW - 1;
  if (hostHi < hostLo) return null;
  const c = rng.int(hostLo, hostHi);
  // (the new room's place across the way: the hall a tile in from its corners too, and `far` from its far corner when it comes in by a far wall)
  const span = ax ? h : w;
  const lo = c + CW + 1 - span;
  let hi = c - 1;
  const comesByFar = side === 0 || side === 2;
  if (comesByFar && far > 0) hi = Math.min(hi, c - far);
  if (hi < lo) return null;
  const off = rng.int(lo, hi);
  let room: Rect;
  let join: Rect;
  if (side === 0) {
    room = { x: H.x + H.w + len, y: off, w, h };
    join = { x: H.x + H.w, y: c, w: len, h: CW };
  } else if (side === 1) {
    room = { x: H.x - len - w, y: off, w, h };
    join = { x: H.x - len, y: c, w: len, h: CW };
  } else if (side === 2) {
    room = { x: off, y: H.y + H.h + len, w, h };
    join = { x: c, y: H.y + H.h, w: CW, h: len };
  } else {
    room = { x: off, y: H.y - len - h, w, h };
    join = { x: c, y: H.y - len, w: CW, h: len };
  }
  // (clear of every room but the two it joins, and of every hall)
  for (let j = 0; j < plan.rooms.length; j++) {
    if (near(room, plan.rooms[j], ROOM_GAP)) return null;
    if (j !== host && near(join, plan.rooms[j], CLEAR)) return null;
  }
  for (const J of plan.joins) {
    if (near(room, J, CLEAR) || near(join, J, CLEAR)) return null;
  }
  return { room, join };
}

/** A room's two sides for a step: its length along the way it is entered (`alongWay`) or across it. */
function sidesOf(rng: RNG, role: HouseRole, side: Side, alongWay: boolean): { w: number; h: number } {
  const s = SIZE[role];
  const a = rng.int(s.long[0], s.long[1]);
  const b = rng.int(s.short[0], s.short[1]);
  const longAlongX = alongXOf(side) === alongWay;
  return longAlongX ? { w: a, h: b } : { w: b, h: a };
}

/** THE MAIN WAY'S ROOMS, in order: the entrance; long halls between wards and an apothecary; a vestibule; the theatre; beyond it. */
function mainRoles(rng: RNG): HouseRole[] {
  const rooms: HouseRole[] = rng.shuffle(['ward', 'ward', 'apothecary', 'ward']);
  const out: HouseRole[] = ['entrance'];
  for (const r of rooms) out.push('hall', r);
  out.push('hall', 'vestibule', 'theatre', 'beyond');
  return out;
}

/** Lay the main way: each room off the last, mostly on along the floor's way (`A`), now and then turning across it. */
function planMain(rng: RNG, A: 'x' | 'y'): Plan | null {
  const on: Side = A === 'x' ? 0 : 2;
  const across: [Side, Side] = A === 'x' ? [2, 3] : [0, 1];
  const roles = mainRoles(rng);
  const plan: Plan = { rooms: [], joins: [] };
  const e = sidesOf(rng, 'entrance', on, rng.chance(0.5));
  plan.rooms.push({ x: 0, y: 0, w: e.w, h: e.h, role: 'entrance', path: 0, parent: -1 });
  const mid = (r: Rect): number => (A === 'x' ? r.y + r.h / 2 : r.x + r.w / 2);
  const mid0 = mid(plan.rooms[0]);
  let lastTurn: Side | null = null;
  for (let i = 1; i < roles.length; i++) {
    const role = roles[i];
    let done = false;
    for (let tries = 0; tries < 50 && !done; tries++) {
      const host = plan.rooms.length - 1;
      let side: Side = on;
      // (the theatre and the room beyond it straight on: their halls come in by a far wall, clear of the gallery's corner;
      // otherwise one step in three turns across the way, back toward the middle of the band when it has wandered far)
      if (role !== 'theatre' && role !== 'beyond' && role !== 'vestibule' && rng.chance(0.42)) {
        const off = mid(plan.rooms[host]) - mid0;
        side = off > BAND * 0.6 ? across[1] : off < -BAND * 0.6 ? across[0] : rng.pick(across);
        // (not straight back the way the last turn went)
        if (lastTurn !== null && side !== lastTurn && rng.chance(0.7)) side = lastTurn;
      }
      const sz = sidesOf(rng, role, side, role === 'hall' || (role === 'ward' && rng.chance(0.6)));
      const len = rng.chance(0.15) ? rng.int(8, 12) : rng.int(3, 7);
      const got = attach(rng, plan, host, side, sz.w, sz.h, len, role === 'theatre' ? 9 : 0);
      if (!got) continue;
      if (Math.abs(mid(got.room) - mid0) > BAND) continue;
      plan.rooms.push({ ...got.room, role, path: i, parent: host });
      plan.joins.push({ ...got.join, a: host, b: plan.rooms.length - 1, alongX: alongXOf(side) });
      lastTurn = side !== on ? side : lastTurn;
      done = true;
    }
    if (!done) return null;
  }
  return plan;
}

/** A side room of `role` off one of `hosts` (the first the likeliest), on any of its sides, its hall `len` long. Its index, or -1. */
function growSide(rng: RNG, plan: Plan, role: HouseRole, hosts: number[], tries = 80, len: [number, number] = [3, 8]): number {
  if (!hosts.length) return -1;
  for (let t = 0; t < tries; t++) {
    const host = hosts[Math.min(hosts.length - 1, Math.floor(Math.pow(rng.next(), 1.6) * hosts.length))];
    const side = rng.int(0, 3) as Side;
    const sz = sidesOf(rng, role, side, rng.chance(0.5));
    const got = attach(rng, plan, host, side, sz.w, sz.h, rng.int(len[0], len[1]));
    if (!got) continue;
    plan.rooms.push({ ...got.room, role, path: -1, parent: host });
    plan.joins.push({ ...got.join, a: host, b: plan.rooms.length - 1, alongX: alongXOf(side) });
    return plan.rooms.length - 1;
  }
  return -1;
}

// ---------------------------------------------------------------------------------------------------
// THE WARDS' BEDS AND THEIR CALL BELLS: where along a ward's far walls they stand (the map-maker puts the bells on these
// places, the dresser the beds on the rest: the same reckoning for both)

/**
 * A PLACE FOR A BED against a far wall of a room: the floor tile at the wall's foot (the bed's head there), and the face of the
 * wall behind it (0: the wall along x, its tiles at ty - 1, the bed's head toward -y; 1: the wall along y, its tiles at tx - 1,
 * the bed's head toward -x). A bed takes two tiles out from the wall. `k`: its place in the row, `last` the row's last.
 */
export interface BedSlot {
  tx: number;
  ty: number;
  face: 0 | 1;
  k: number;
  last: number;
  /** Whether a bed may stand there (no hall comes into the room near it). */
  ok: boolean;
}

/**
 * The bed places along a room's two far walls: along the wall along x every other tile from two in (x0 + 2, x0 + 4, ...) to
 * three from its far end; along the wall along y from three in (y0 + 3, y0 + 5, ...): so that the corner where the two rows
 * meet is left clear and the tile between two beds is free (a locker's). A call bell takes a bed's place (the map-maker
 * picks which): so the beds beside it are two tiles off, and the eight tiles round it clear, as the Bells' contract asks.
 * `hall(tx, ty)`: is that tile of a hall between rooms (a doorway near: no bed in the way of it).
 */
export function bedSlots(R: Rect, hall: (tx: number, ty: number) => boolean): BedSlot[] {
  const out: BedSlot[] = [];
  const box = (x0: number, y0: number, x1: number, y1: number): boolean => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (hall(x, y)) return false;
    return true;
  };
  const xs: number[] = [];
  for (let bx = R.x + 2; bx <= R.x + R.w - 3; bx += 2) xs.push(bx);
  xs.forEach((bx, k) => out.push({ tx: bx, ty: R.y, face: 0, k, last: xs.length - 1, ok: box(bx - 3, R.y - 1, bx + 3, R.y + 3) }));
  const ys: number[] = [];
  for (let by = R.y + 3; by <= R.y + R.h - 3; by += 2) ys.push(by);
  ys.forEach((by, k) => out.push({ tx: R.x, ty: by, face: 1, k, last: ys.length - 1, ok: box(R.x - 1, by - 3, R.x + 3, by + 3) }));
  return out;
}

/** May a call bell go on this place: a bed's place itself, with a bed's place beside it in its row (by a ward's bed). */
function bellSlot(s: BedSlot, all: readonly BedSlot[]): boolean {
  if (!s.ok) return false;
  return all.some((o) => o.face === s.face && Math.abs(o.k - s.k) === 1 && o.ok);
}

// ---------------------------------------------------------------------------------------------------
// LAY FLOOR 14

/** Lay floor 14, or null (this throw of the dice cannot keep the Bells' contract: game/act2_layout.ts rolls again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x6a09e667) >>> 0);
  // (the floor's way on the screen: down to the right (along x) or down to the left (along y))
  const A: 'x' | 'y' = rng.chance(0.5) ? 'x' : 'y';
  const plan = planMain(rng, A);
  if (!plan) return null;
  const theatreI = plan.rooms.findIndex((r) => r.role === 'theatre');
  const mainCount = plan.rooms.length;

  // SIDE ROOMS. The chapel first, off a long hall in the middle of the main way, between two of its rooms (the Bells' Hush is
  // a circle round its bell: the wards close round it, the start and the theatre far off); then wards off the chapel itself
  // (a branch, chapel and ward) and off the hall it hangs from; then the lair, the stores, another apothecary.
  const midHosts = plan.rooms.map((_, i) => i).filter((i) => plan.rooms[i].role === 'hall' && i >= 3 && i <= mainCount - 5);
  const chapel = growSide(rng, plan, 'chapel', rng.shuffle(midHosts), 160);
  if (chapel < 0) return null;
  const ch = plan.rooms[chapel].parent;
  // (up to three wards off the chapel's other walls, on short halls; then one or two more off the hall it hangs from or the
  // rooms either side of that)
  let wards = 0;
  for (let n = 0; n < 3; n++) if (growSide(rng, plan, 'ward', [chapel], 40, [3, 5]) >= 0) wards++;
  for (let n = wards; n < 5 && (n < 4 || rng.chance(0.5)); n++) growSide(rng, plan, 'ward', [ch, ch - 1, ch + 1], 60, [3, 6]);
  const anyHost = plan.rooms.map((_, i) => i).filter((i) => i < mainCount && i > 0 && i < theatreI - 1);
  growSide(rng, plan, 'lair', rng.shuffle(anyHost.filter((i) => i >= 3)));
  const stores = rng.int(1, 2);
  for (let n = 0; n < stores; n++) growSide(rng, plan, 'store', rng.shuffle([0, ...anyHost]));
  if (rng.chance(0.5)) growSide(rng, plan, 'apothecary', rng.shuffle([...anyHost]));

  // THE BOUNDS: everything moved MARGIN in from the map's edge
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of [...plan.rooms, ...plan.joins]) {
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  const dx = MARGIN - x0;
  const dy = MARGIN - y0;
  for (const r of [...plan.rooms, ...plan.joins]) {
    r.x += dx;
    r.y += dy;
  }
  const W = x1 - x0 + 2 * MARGIN;
  const H = y1 - y0 + 2 * MARGIN;

  // THE TILES, AND WHAT EACH IS
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  const hallAt = new Uint8Array(W * H);
  for (const J of plan.joins) {
    for (let ty = J.y; ty < J.y + J.h; ty++) for (let tx = J.x; tx < J.x + J.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = HOUSE_ZONE.Hall;
      hallAt[ty * W + tx] = 1;
    }
  }
  for (const r of plan.rooms) {
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = ZONE_OF[r.role];
      hallAt[ty * W + tx] = 0;
    }
  }
  const isHall = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < W && ty < H && hallAt[ty * W + tx] === 1;

  // ROOMS (the main way first, in walking order, then the side rooms), AND THE LAND'S AREAS
  const order = plan.rooms.map((_, i) => i).sort((a, b) => {
    const pa = plan.rooms[a].path;
    const pb = plan.rooms[b].path;
    return (pa < 0 ? 1e3 + a : pa) - (pb < 0 ? 1e3 + b : pb);
  });
  const idOf: number[] = [];
  order.forEach((pi, id) => (idOf[pi] = id));
  const kindOf = (r: PlanRoom): RoomKind => (r.role === 'entrance' ? 'start' : r.role === 'theatre' ? 'boss' : r.role === 'lair' ? 'guardian' : r.role === 'store' ? 'treasure' : 'normal');
  const rooms: Room[] = order.map((pi, id) => {
    const r = plan.rooms[pi];
    return { id, x: r.x, y: r.y, w: r.w, h: r.h, kind: kindOf(r), path: r.path };
  });
  // (two rooms of the main way's middle hold a yellow pack: its wards and halls past the first two)
  const eliteable = rooms.filter((r) => r.kind === 'normal' && r.path >= 2 && r.path < plan.rooms[theatreI].path - 1);
  for (const r of rng.shuffle([...eliteable]).slice(0, 2)) r.kind = 'elite';
  const roleOf = (r: PlanRoom): AreaRole => (r.role === 'entrance' ? 'start' : r.role === 'theatre' ? 'boss' : r.role === 'lair' ? 'lair' : r.path < 0 ? 'side' : 'path');
  const areas = order.map((pi) => {
    const r = plan.rooms[pi];
    const blob: Blob = { x: r.x + r.w / 2, y: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, rot: 0, wob: 0, seed: 0 };
    return { blob, room: idOf[pi], role: roleOf(r) };
  });
  const lanes: Lane[] = plan.joins.map((J) => (J.alongX ? { pts: [[J.x, J.y + CW / 2], [J.x + J.w, J.y + CW / 2]] as [number, number][], w: CW } : { pts: [[J.x + CW / 2, J.y], [J.x + CW / 2, J.y + J.h]] as [number, number][], w: CW }));
  const way: [number, number][] = plan.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path).map((r) => [r.x + r.w / 2, r.y + r.h / 2]);

  // THE START, THE BOSS, THE WAY ON
  const ent = plan.rooms[0];
  const start = { x: ent.x + Math.floor(ent.w / 2) + 0.5, y: ent.y + Math.floor(ent.h / 2) + 0.5 };
  const T = plan.rooms[theatreI];
  const table = tableOf(T);
  // (he waits a few tiles past the table toward the way on, his back to it: the game sets him a tile and two on from here, game.ts spawnMonsters)
  const boss = A === 'x' ? { x: table.tx + 2.5, y: table.ty - 1.5 } : { x: table.tx - 0.5, y: table.ty + 1.5 };
  const beyond = plan.rooms[plan.rooms.findIndex((r) => r.role === 'beyond')];
  const exit = { x: beyond.x + Math.floor(beyond.w / 2) + 0.5, y: beyond.y + Math.floor(beyond.h / 2) + 0.5 };

  // THE BELLS (the contract): the Muffled Bell on the chapel's floor, in its middle; the call bells on the wards' far walls,
  // in the rows of beds, the nearest the chapel bell that keep the contract's distances (at most three a ward)
  const C = plan.rooms[chapel];
  const muffledTile = chapelBellTile(C, isHall);
  if (!muffledTile) return null;
  const muffled = { x: muffledTile.tx + 0.5, y: muffledTile.ty + 0.5 };
  if (Math.hypot(muffled.x - start.x, muffled.y - start.y) < HQ_BELLS.muffledFromStart) return null;
  const cands: { x: number; y: number; room: number }[] = [];
  plan.rooms.forEach((r, pi) => {
    if (r.role !== 'ward') return;
    const slots = bedSlots(r, isHall);
    for (const s of slots) if (bellSlot(s, slots)) cands.push({ x: s.tx + 0.5, y: s.ty + 0.5, room: pi });
  });
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);
  cands.sort((a, b) => dist(a, muffled) - dist(b, muffled));
  const bells: { x: number; y: number; room: number }[] = [];
  for (const c of cands) {
    if (bells.length >= HQ_BELLS.count) break;
    if (dist(c, start) < HQ_BELLS.fromStart) continue;
    if (bells.some((b) => dist(b, c) < HQ_BELLS.apart)) continue;
    if (bells.filter((b) => b.room === c.room).length >= 3) continue;
    bells.push(c);
  }
  if (bells.length < HQ_BELLS.count) return null;
  const r = Math.max(...bells.map((b) => dist(b, muffled))) + HQ_BELLS.spare;
  if (dist(start, muffled) - r < HQ_BELLS.startClear) return null;
  // (nor reaching the boss's ground: every tile of the theatre outside the circle)
  for (let ty = T.y; ty < T.y + T.h; ty++) for (let tx = T.x; tx < T.x + T.w; tx++) if (Math.hypot(tx + 0.5 - muffled.x, ty + 0.5 - muffled.y) <= r + 0.5) return null;
  const bellsPlan: BellsPlan = { muffled, bells: bells.map((b) => ({ x: b.x, y: b.y })), hush: { x: muffled.x, y: muffled.y, r } };

  // THE PACKS (dice of their own, so that whether a kind is built yet changes nothing of the house)
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
    packs: [],
    props: [],
  };
  const vr = new RNG((seed ^ 0x1b873593) >>> 0);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);
  floor.packs = packsOf(new RNG((seed ^ 0x3c6ef372) >>> 0), floor, plan, idOf, depth, bellsPlan);
  floor.props = storesOf(new RNG((seed ^ 0xa54ff53a) >>> 0), floor, plan);

  const land: Land = {
    kind: 'housequiet',
    depth,
    seed,
    way,
    areas,
    lanes,
    holds: [],
    exit,
    arrive: { ...start },
    zones,
    bells: bellsPlan,
  };
  return { floor, land };
}

/** THE OPERATING TABLE in the middle of the theatre: its length along x over the two tiles (tx - 1, ty) and (tx, ty), its middle at (tx, ty + 0.5). */
function tableOf(T: Rect): { tx: number; ty: number } {
  return { tx: T.x + Math.floor(T.w / 2), ty: T.y + Math.floor(T.h / 2) };
}

/**
 * THE CHAPEL BELL'S TILE: under the chapel's tower, in its middle (a tile toward its far corner, so that the pews have the
 * more room before it), with no doorway within three tiles of it. Null: none (the plan is rolled again). In the middle, the
 * wards round the chapel are all about as near it: the Hush's circle round it the smaller.
 */
function chapelBellTile(C: Rect, hall: (tx: number, ty: number) => boolean): { tx: number; ty: number } | null {
  const clearOf = (tx: number, ty: number): boolean => {
    for (let y = ty - 3; y <= ty + 3; y++) for (let x = tx - 3; x <= tx + 3; x++) if (hall(x, y)) return false;
    return true;
  };
  const mx = C.x + Math.floor(C.w / 2) - 1;
  const my = C.y + Math.floor(C.h / 2) - 1;
  for (const [a, b] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1]]) if (clearOf(mx + a, my + b)) return { tx: mx + a, ty: my + b };
  return null;
}

/** A pack's kind and size: the floor's own (game/act2_mobs.ts); in a ward, the patients, once they are built. */
function packOf(rng: RNG, depth: number, tier: 'normal' | 'elite' | 'champion', ward: boolean): { kind: MonsterKind; size: number } {
  const p = act2Pack(depth, rng, tier);
  if (ward && tier !== 'champion' && act2Ready('patient')) {
    const [lo, hi] = PACK_BY_SIZE[sizeOf('patient')];
    return { kind: 'patient', size: rng.int(lo, hi) };
  }
  return p;
}

/**
 * THE PACKS, by room: in the main way's rooms and the side wards, one for every 70 tiles of a room or so (the descent's
 * measure), at most three; in a ward out in the aisle before its beds (the patients' rules lay them in the beds: houseBeds);
 * the lair's its guardian's, in its middle; a store's one; none in the entrance, the chapel, the theatre, beyond it. None
 * within 10 tiles of the start, none within 5 of another.
 */
function packsOf(rng: RNG, f: Floor, plan: Plan, idOf: readonly number[], depth: number, bells: BellsPlan): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const free = (x: number, y: number): boolean => {
    for (let ty = y - 1; ty <= y + 1; ty++) for (let tx = x - 1; tx <= x + 1; tx++) if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || f.tiles[ty * W + tx] !== T_FLOOR) return false;
    return true;
  };
  const used: { x: number; y: number }[] = [];
  const put = (x: number, y: number, room: number, tier: PackSpot['tier'], p: { kind: MonsterKind; size: number }): void => {
    out.push({ x: x + 0.5, y: y + 0.5, roomId: room, size: p.size, tier, kind: p.kind });
    used.push({ x: x + 0.5, y: y + 0.5 });
  };
  plan.rooms.forEach((r, pi) => {
    if (r.role === 'entrance' || r.role === 'chapel' || r.role === 'theatre' || r.role === 'beyond') return;
    const id = idOf[pi];
    const room = f.rooms[id];
    if (r.role === 'lair') {
      const cx = r.x + Math.floor(r.w / 2);
      const cy = r.y + Math.floor(r.h / 2);
      put(cx, cy, id, 'champion', packOf(rng, depth, 'champion', false));
      return;
    }
    const ward = r.role === 'ward';
    const n = r.role === 'store' ? 1 : Math.max(1, Math.min(3, Math.round((r.w * r.h) / 70)));
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 40; tries++) {
        // (a ward's packs out in its aisle, three tiles and more off its far walls, before the beds)
        const x = ward ? rng.int(r.x + 3, r.x + r.w - 3) : rng.int(r.x + 1, r.x + r.w - 2);
        const y = ward ? rng.int(r.y + 3, r.y + r.h - 3) : rng.int(r.y + 1, r.y + r.h - 2);
        if (!free(x, y)) continue;
        if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 10) continue;
        if (used.some((u) => Math.hypot(u.x - x - 0.5, u.y - y - 0.5) < 5)) continue;
        // (nor on a bell's tile: they are kept clear)
        if ([bells.muffled, ...bells.bells].some((b) => Math.hypot(b.x - x - 0.5, b.y - y - 0.5) < 1.5)) continue;
        const tier: PackSpot['tier'] = room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        put(x, y, id, tier, packOf(rng, depth, tier, ward));
        break;
      }
    }
  });
  // (now and then a small pack of orderlies in a long hall between rooms: the halls' middles, where long enough)
  for (const J of plan.joins) {
    const len = Math.max(J.w, J.h);
    if (len < 8 || rng.chance(0.5)) continue;
    const x = J.x + Math.floor(J.w / 2);
    const y = J.y + Math.floor(J.h / 2);
    if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 10 || used.some((u) => Math.hypot(u.x - x - 0.5, u.y - y - 0.5) < 6)) continue;
    const p = packOf(rng, depth, 'normal', false);
    put(x, y, -1, 'normal', { kind: p.kind, size: Math.max(2, Math.ceil(p.size * 0.6)) });
  }
  return out;
}

/** The game's own things on the floor: a store's chests (two or three, the reward), near its middle, none on a pack's. */
function storesOf(rng: RNG, f: Floor, plan: Plan): PropSpot[] {
  const out: PropSpot[] = [];
  for (const r of plan.rooms) {
    if (r.role !== 'store') continue;
    const n = rng.int(2, 3);
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    const spots: [number, number][] = rng.shuffle([[cx - 1, cy - 1], [cx + 1, cy - 1], [cx, cy + 1], [cx - 2, cy + 1], [cx + 2, cy + 1], [cx - 2, cy - 2], [cx + 2, cy - 2]]);
    let laid = 0;
    for (const [x, y] of spots) {
      if (laid >= n || f.tiles[y * f.w + x] !== T_FLOOR || f.packs.some((p) => Math.abs(p.x - 0.5 - x) <= 1 && Math.abs(p.y - 0.5 - y) <= 1)) continue;
      out.push({ kind: 'chest', x, y });
      laid++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSING

/** What floor 14's dresser lays beyond the descent's (game/act1_dress.ts Act1Dress): where its moment, the falling screen, is set. */
export interface HouseDress extends Act1Dress {
  /**
   * THE SCREEN FALLS (art/floor14_moments.ts): where it stands in a ward, the middle of its foot (world), its length along x;
   * it falls toward +y, the tiles it comes down on kept clear. NOT PLAYED YET (the descent's floors have no moments: the
   * first floors' are played by render/pieces.ts from game/first5.ts's dressing); laid here for whoever wires it.
   */
  moment?: { x: number; y: number };
}

/** The pieces' names, the art's (art/floor14.ts, art/act2_set.ts). */
const P = {
  bed: 'an iron ward bed',
  screen: 'a ward screen',
  bell: HQ_BELLS.small,
  washstand: 'a washstand',
  stove: 'a coal stove',
  chair: 'a bath chair',
  stretcher: 'a stretcher, left',
  doors: "the ward's doors",
  lamp: 'a lamp of green glass',
  candles: 'a stand of candles',
  shelves: "the apothecary's shelves",
  counter: "the apothecary's counter",
  vials: 'a rack of tonic vials',
  table: 'the operating table',
  gallery: "the theatre's gallery",
  tray: "a tray of the Physician's instruments",
  cabinet: 'a cabinet of last words',
  drain: "a drain in the theatre's floor",
  chapelBell: HQ_BELLS.muffled,
  pews: 'chapel pews',
  ledger: "the Physician's ledger",
  banner: "the Silent Order's banner",
  ink: 'an ink spill',
} as const;

/**
 * A WARD BED as the dresser laid it: its prop (kind 'piece', `name` 'an iron ward bed', solid; its world point the bed's
 * middle), the room it is in, which way it lies (its head against the far wall: 'y', its length along y and its head toward
 * -y, frames 2 made and 3 risen from; 'x', along x, its head toward -x, frames 0 and 1: its `variant` is the frame), and the
 * two tiles it takes (head, foot). For the patients' rules: a pack of patients in a ward (Floor.packs, roomId the ward's) lies
 * in the beds nearest it (the art: "a patient in bed or rising is drawn over a ward bed in its risen-from frame").
 */
export interface HouseBed {
  prop: PropInst;
  room: number;
  along: 'x' | 'y';
  tiles: [number, number];
}
/** Floor 14's beds (in its wards, its lair and about the theatre's edge), from what its dresser laid. */
export function houseBeds(L: Level): HouseBed[] {
  const f = L.floor;
  const out: HouseBed[] = [];
  for (const p of L.props) {
    if (p.kind !== 'piece' || p.name !== P.bed) continue;
    const along: 'x' | 'y' = p.variant >= 2 ? 'y' : 'x';
    const room = f.rooms.find((r) => p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h);
    const head = p.ty * f.w + p.tx;
    out.push({ prop: p, room: room ? room.id : -1, along, tiles: [head, along === 'y' ? head + f.w : head + 1] });
  }
  return out;
}

/** How many lamps of green glass on a far wall: one every this many tiles of it. */
const LAMP_EVERY = 6;
/** The share of the lamps gone out. */
const LAMPS_OUT = 0.15;
/** The share of the ward beds already risen from (the rest made, their patients in them or gone). */
const BEDS_RISEN = 0.25;
/** The spilled tonic: how many tiles apart at least, and how far from where he comes in. */
const TONIC = { apart: 6, fromStart: 12, fromPack: 3 };

/**
 * DRESS FLOOR 14. The pieces stand where the art chat's own stretch has them (src/dev/preview_housequiet.ts): in the wards the
 * iron beds in rows along the far walls, their heads to the wall, lockers between, a stove, a screen, a washstand, a bath
 * chair; in the halls what was left along their walls; in the apothecary its shelves on the far walls and its counter; in the
 * chapel its bell gagged in its frame, the pews before it, its candles; in the theatre the operating table under its lamp in
 * the middle, the gallery round its far corner, the cabinets of last words, the tray of instruments, the drain, the ledger,
 * and beds about its edge (his doc's Rounds); the lamps of green glass on every room's far walls. Fewer things than room for
 * them, toward the walls (his words of 17 Oct 2026, 11:37: "I’d like the doodads placed in the level to be a little thinner in
 * density and spread towards the edges.  Except for camps, maybe a few tents or whatever in a circle."). Kept clear: where he
 * comes in, the waypoint, the way on, the packs' middles, every doorway, and the eight tiles round each bell.
 */
export function dress(L: Level, depth: number, seed: number): HouseDress | null {
  const land = L.land;
  if (!land || land.kind !== 'housequiet') return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x9b05688c) >>> 0);
  const out: HouseDress = { floor: depth, tiles: [] };
  const inMap = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const floorAt = (x: number, y: number): boolean => inMap(x, y) && f.tiles[y * W + x] === T_FLOOR;
  const zones = land.zones;
  // (the halls between rooms: floor that is in no room)
  const inRoom = new Int16Array(W * H).fill(-1);
  for (const r of f.rooms) for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) inRoom[ty * W + tx] = r.id;
  const isHall = (x: number, y: number): boolean => floorAt(x, y) && inRoom[y * W + x] < 0;

  // WHAT IS KEPT CLEAR (of anything solid): where he comes in, the waypoint, the way on, every pack's middle, every doorway (a
  // hall's tiles and two tiles into the room round where it comes in), the eight tiles round each bell
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) if (inMap(tx, ty) && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3.2);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    if (!isHall(tx, ty)) continue;
    for (let y = ty - 2; y <= ty + 2; y++) for (let x = tx - 2; x <= tx + 2; x++) if (inMap(x, y)) keep[y * W + x] = 1;
  }
  const bellsPlan = land.bells;
  const bellAt = new Set<number>();
  if (bellsPlan) {
    for (const b of [bellsPlan.muffled, ...bellsPlan.bells]) {
      const bx = Math.floor(b.x);
      const by = Math.floor(b.y);
      bellAt.add(by * W + bx);
      for (let y = by - 1; y <= by + 1; y++) for (let x = bx - 1; x <= bx + 1; x++) if (inMap(x, y)) keep[y * W + x] = 1;
    }
  }

  const before = L.walk.slice();
  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const props: PropInst[] = [];
  /** The tiles each solid piece takes (for setting free again what would wall something off). */
  const foot = new Map<PropInst, number[]>();
  const whole = (x: number, y: number): boolean => floorAt(x, y) && L.walk[y * W + x] === 1;
  /** A free tile: floor, walkable, nothing there, not kept clear; `ring`: its eight neighbours that are floor walkable too. */
  const free = (x: number, y: number, ring = false): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i]) return false;
    if (!ring) return true;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if ((a || b) && floorAt(x + a, y + b) && L.walk[(y + b) * W + x + a] !== 1) return false;
    return true;
  };
  /** Lay a piece that stands on tile (x, y) (its world point `at`, the tile's middle where not said); `more`: the other tiles it takes. */
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, at?: { x: number; y: number }, more: [number, number][] = []): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: at ? at.x : x + 0.5, y: at ? at.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    const list = [[x, y], ...more].map(([a, b]) => b * W + a);
    for (const i of list) {
      taken[i] = 1;
      if (solid) L.walk[i] = 0;
    }
    if (solid) foot.set(p, list);
    return p;
  };
  /** One of the game's breakables (a 'barrel' is the floor's bedside locker, an 'urn' its hamper of soiled linen: ACT1_SETS[14]). */
  const breakable = (kind: 'barrel' | 'urn', x: number, y: number): void => {
    const p: PropInst = { kind, tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: true, state: 0, variant: 0 };
    props.push(p);
    taken[y * W + x] = 1;
    L.walk[y * W + x] = 0;
    foot.set(p, [y * W + x]);
  };
  const wallTaken = new Set<number>();
  /**
   * A piece on a far wall (the art's 'on the wall': render/act1_pieces.ts draws it on its face): over floor tile (x, y), on the
   * wall along x behind it (`face` 0, the wall's tiles at y - 1: its point (x + 0.5, y)) or the wall along y (`face` 1, at
   * x - 1: its point (x, y + 0.5)); its `variant` the face and its frame (face | frame << 1). Not solid: the floor before it is walked.
   */
  const onWall = (name: string, x: number, y: number, face: 0 | 1, frame = 0): PropInst | null => {
    const back = face === 0 ? [x, y - 1] : [x - 1, y];
    if (!floorAt(x, y) || floorAt(back[0], back[1])) return null;
    const k = (y * W + x) * 2 + face;
    if (wallTaken.has(k)) return null;
    wallTaken.add(k);
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: face === 0 ? x + 0.5 : x, y: face === 0 ? y : y + 0.5, solid: false, state: 0, variant: face | (frame << 1) };
    props.push(p);
    return p;
  };
  /** Is something on either far wall over tile `i` already? */
  const onWallAt = (i: number): boolean => wallTaken.has(i * 2) || wallTaken.has(i * 2 + 1);
  /** Is the stretch of far wall behind (x, y) whole for `r` tiles either way (no doorway in it)? */
  const wallWhole = (x: number, y: number, face: 0 | 1, r: number): boolean => {
    for (let k = -r; k <= r; k++) {
      const bx = face === 0 ? x + k : x - 1;
      const by = face === 0 ? y - 1 : y + k;
      if (floorAt(bx, by)) return false;
    }
    return true;
  };
  const nearBell = (x: number, y: number, r: number): boolean => [...bellAt].some((i) => Math.hypot((i % W) - x, Math.floor(i / W) - y) <= r);

  /** THE LAMPS OF GREEN GLASS along a room's far walls, one every LAMP_EVERY tiles, a few gone out (none by a bell, none at a doorway). */
  const lamps = (R: Room, skip: (x: number, y: number, face: 0 | 1) => boolean = () => false): void => {
    const lay = (x: number, y: number, face: 0 | 1): void => {
      if (skip(x, y, face) || nearBell(x, y, 1.5) || !wallWhole(x, y, face, 1)) return;
      onWall(P.lamp, x, y, face, rng.chance(LAMPS_OUT) ? 1 : 0);
    };
    const offX = rng.int(2, 3);
    for (let x = R.x + offX; x <= R.x + R.w - 2; x += LAMP_EVERY) lay(x, R.y, 0);
    const offY = rng.int(3, 4);
    for (let y = R.y + offY; y <= R.y + R.h - 2; y += LAMP_EVERY) lay(R.x, y, 1);
  };

  // ROOM BY ROOM (the land's areas: each its room and its part on the floor)
  const zoneOf = (R: Room): number => (zones ? zones[(R.y + (R.h >> 1)) * W + R.x + (R.w >> 1)] : HOUSE_ZONE.Hall);
  const exitRoom = f.rooms.find((R) => land.exit.x >= R.x && land.exit.y >= R.y && land.exit.x < R.x + R.w && land.exit.y < R.y + R.h);
  /** A room's free tiles, shuffled; `inner`: not against its walls. */
  const spots = (R: Room, inner: boolean): [number, number][] => {
    const list: [number, number][] = [];
    for (let ty = R.y + (inner ? 2 : 0); ty < R.y + R.h - (inner ? 2 : 0); ty++) for (let tx = R.x + (inner ? 2 : 0); tx < R.x + R.w - (inner ? 2 : 0); tx++) list.push([tx, ty]);
    return rng.shuffle(list);
  };
  /** Up to `n` of `names` on free tiles of the room by its walls (the first row or column in from any wall), each with its ring clear. */
  const byWalls = (R: Room, names: readonly string[], n: number): void => {
    const edge = spots(R, false).filter(([x, y]) => x === R.x || y === R.y || x === R.x + R.w - 1 || y === R.y + R.h - 1);
    let laid = 0;
    for (const [x, y] of edge) {
      if (laid >= n) break;
      if (!free(x, y, true)) continue;
      // (their first frame: the others are their states, a screen's seen through, a rack's smashed)
      put(rng.pick(names), x, y, true, 0);
      keepRing(x, y);
      laid++;
    }
  };
  /** Keep the tiles beside a thing just laid free of the next (so that nothing stands shoulder to shoulder and walls a way off). */
  const keepRing = (x: number, y: number): void => {
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (inMap(x + a, y + b)) keep[(y + b) * W + x + a] = 1;
  };
  const beds = (R: Room, risen: number, layBells: boolean): void => {
    const slots = bedSlots(R, isHall);
    const laid = new Set<number>();
    for (const s of slots) {
      if (!s.ok) continue;
      const i = s.ty * W + s.tx;
      if (layBells && bellAt.has(i)) {
        // A PATIENT'S CALL BELL on the wall, in the row of beds (the Bells: its frame the event's, game/bells.ts; not solid, as
        // every piece on a wall is: the planning chat's word, 19 Oct)
        onWall(P.bell, s.tx, s.ty, s.face, 0);
        continue;
      }
      const foot2: [number, number] = s.face === 0 ? [s.tx, s.ty + 1] : [s.tx + 1, s.ty];
      if (keep[i] || taken[i] || keep[foot2[1] * W + foot2[0]] || taken[foot2[1] * W + foot2[0]] || !whole(s.tx, s.ty) || !whole(foot2[0], foot2[1])) continue;
      const frame = (s.face === 0 ? 2 : 0) + (rng.chance(risen) ? 1 : 0);
      const at = s.face === 0 ? { x: s.tx + 0.5, y: s.ty + 0.85 } : { x: s.tx + 0.85, y: s.ty + 0.5 };
      put(P.bed, s.tx, s.ty, true, frame, at, [foot2]);
      laid.add(i);
    }
    // a bedside locker between two beds now and then (the game's breakable: the floor's own picture), never by a bell
    for (const s of slots) {
      if (!laid.has(s.ty * W + s.tx)) continue;
      const lx = s.face === 0 ? s.tx + 1 : s.tx;
      const ly = s.face === 0 ? s.ty : s.ty + 1;
      const nx = s.face === 0 ? s.tx + 2 : s.tx;
      const ny = s.face === 0 ? s.ty : s.ty + 2;
      if (!laid.has(ny * W + nx) || !rng.chance(0.45) || !free(lx, ly) || nearBell(lx, ly, 1.5)) continue;
      breakable('barrel', lx, ly);
    }
  };

  let momentAt: { x: number; y: number } | null = null;
  const traps: HazardSpot[] = [];
  /** Spilled tonic (his doc's hazard) on a free tile of the room's floor away from its walls: the spike floor's beat (game/traps.ts). */
  const tonic = (R: Room, n: number): void => {
    let laid = 0;
    for (const [x, y] of spots(R, true)) {
      if (laid >= n) break;
      if (!free(x, y, true)) continue;
      if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < TONIC.fromStart) continue;
      if (f.packs.some((p) => Math.hypot(p.x - x - 0.5, p.y - y - 0.5) < TONIC.fromPack)) continue;
      if (traps.some((h) => Math.hypot(h.x - x, h.y - y) < TONIC.apart)) continue;
      if (momentAt && Math.abs(momentAt.x - x) < 3 && y >= momentAt.y - 1 && y <= momentAt.y + 3) continue;
      traps.push({ kind: 'spikes', x, y, w: 1, h: 1, phase: rng.range(0, 2.5) });
      taken[y * W + x] = 1;
      laid++;
    }
  };

  const areaOf = new Map<number, AreaRole>(land.areas.map((a) => [a.room, a.role]));
  for (const R of rng.shuffle([...f.rooms])) {
    const role = areaOf.get(R.id) ?? 'path';
    const zone = zoneOf(R);
    const cx = R.x + Math.floor(R.w / 2);
    const cy = R.y + Math.floor(R.h / 2);
    if (role === 'boss') {
      dressTheatre(R);
      continue;
    }
    if (zone === HOUSE_ZONE.Chapel) {
      dressChapel(R);
      continue;
    }
    if (zone === HOUSE_ZONE.Ward) {
      // ---- A WARD (and the orderlies' lair, a ward locked away): its beds, the call bells between them, a stove in its
      // middle, a screen, a washstand in its far corner, a bath chair, a hamper; a spilled tonic
      const lair = role === 'lair';
      beds(R, lair ? 0.6 : BEDS_RISEN, !lair);
      lamps(R);
      if (free(R.x, R.y, false) && rng.chance(0.6)) put(P.washstand, R.x, R.y, true);
      // (the moment's screen: in the first ward far enough on, out in its aisle with the floor it falls on clear)
      if (!momentAt && !lair && Math.hypot(cx - f.start.x, cy - f.start.y) > 14) {
        for (const [x, y] of spots(R, true)) {
          let ok = y + 2 < R.y + R.h - 1 && x - 2 >= R.x + 2;
          for (let b = y - 1; b <= y + 3 && ok; b++) for (let a = x - 2; a <= x + 1 && ok; a++) ok = free(a, b, false);
          if (!ok) continue;
          momentAt = { x, y: y + 0.5 };
          for (let b = y; b <= y + 2; b++) for (let a = x - 1; a <= x; a++) keep[b * W + a] = 1;
          break;
        }
      }
      if (R.w >= 12 && R.h >= 9 && free(cx, cy, true)) {
        put(P.stove, cx, cy, true);
        keepRing(cx, cy);
      }
      // a screen standing out from the beds (its three panels along x over two tiles: its foot's middle on their line)
      for (const [x, y] of spots(R, true)) {
        if (y > R.y + 4 || !free(x, y, true) || !free(x - 1, y, true)) continue;
        put(P.screen, x, y, true, 0, { x, y: y + 0.5 }, [[x - 1, y]]);
        keepRing(x, y);
        keepRing(x - 1, y);
        break;
      }
      byWalls(R, lair ? [P.stretcher, P.chair] : [P.chair, P.stretcher], lair ? 2 : rng.int(0, 1));
      // (a hamper of soiled linen by a near wall, now and then)
      if (rng.chance(0.5)) {
        for (const [x, y] of spots(R, false)) {
          if ((x === R.x + R.w - 1 || y === R.y + R.h - 1) && free(x, y, true)) {
            breakable('urn', x, y);
            break;
          }
        }
      }
      if (!lair && rng.chance(0.6)) tonic(R, 1);
      continue;
    }
    if (zone === HOUSE_ZONE.Apothecary) {
      // ---- AN APOTHECARY: its shelves along the far walls, its counter in the middle, racks of tonic vials, tonic spilled
      for (let x = R.x + 1; x <= R.x + R.w - 2; x += 2) if (free(x, R.y, false) && wallWhole(x, R.y, 0, 1) && !nearBell(x, R.y, 1.5)) put(P.shelves, x, R.y, true, 0);
      for (let y = R.y + 2; y <= R.y + R.h - 2; y += 2) if (free(R.x, y, false) && wallWhole(R.x, y, 1, 1)) put(P.shelves, R.x, y, true, 1);
      if (R.w >= R.h) {
        if (free(cx - 1, cy, true) && free(cx, cy, true)) put(P.counter, cx, cy, true, 0, { x: cx, y: cy + 0.5 }, [[cx - 1, cy]]);
      } else if (free(cx, cy - 1, true) && free(cx, cy, true)) put(P.counter, cx, cy, true, 1, { x: cx + 0.5, y: cy }, [[cx, cy - 1]]);
      keepRing(cx, cy);
      keepRing(cx - 1, cy);
      keepRing(cx, cy - 1);
      byWalls(R, [P.vials], rng.int(1, 2));
      lamps(R, (x, y, face) => (face === 0 ? x % 2 === (R.x + 1) % 2 : y % 2 === R.y % 2));
      tonic(R, rng.int(1, 2));
      continue;
    }
    // ---- A HALL (the entrance, the long halls, the vestibule, the room beyond the theatre, a store): its lamps; the ward's
    // doors shut in its far walls along it; the Order's banner once; along its walls what was left (a stretcher where the
    // Hushed were carried in, a bath chair, a hamper, a screen); the Order's ink spilled
    const long = Math.max(R.w, R.h) >= 14;
    lamps(R);
    if (R !== exitRoom) {
      const alongX = R.w >= R.h;
      const wallLen = alongX ? R.w : R.h;
      const face: 0 | 1 = alongX ? 0 : 1;
      const step = alongX ? 1 : W;
      for (let k = rng.int(3, 5); k < wallLen - 2; k += rng.int(7, 10)) {
        const x = alongX ? R.x + k : R.x;
        const y = alongX ? R.y : R.y + k;
        const i = y * W + x;
        if (!wallWhole(x, y, face, 2) || [i - step, i, i + step].some((j) => onWallAt(j))) continue;
        onWall(P.doors, x, y, face, rng.chance(0.2) ? 1 : 0);
      }
      if (long && rng.chance(0.6)) {
        const x = alongX ? R.x + Math.floor(R.w / 2) : R.x;
        const y = alongX ? R.y : R.y + Math.floor(R.h / 2);
        const i = y * W + x;
        if (wallWhole(x, y, face, 1) && ![i - step, i, i + step].some((j) => onWallAt(j))) onWall(P.banner, x, y, face, 0);
      }
      const things = role === 'start' ? [P.stretcher, P.stretcher, P.chair] : [P.stretcher, P.chair, P.screen];
      byWalls(R, things, role === 'start' ? 3 : long ? rng.int(1, 3) : rng.int(0, 2));
      if (rng.chance(0.5)) {
        for (const [x, y] of spots(R, false)) {
          if ((x === R.x || y === R.y || x === R.x + R.w - 1 || y === R.y + R.h - 1) && free(x, y, true)) {
            breakable('urn', x, y);
            break;
          }
        }
      }
      if (rng.chance(0.4)) for (const [x, y] of spots(R, true)) if (free(x, y, false)) {
        put(P.ink, x, y, false);
        break;
      }
      if (long && role === 'path' && rng.chance(0.4)) tonic(R, 1);
    }
  }

  // ---- THE CHAPEL: its bell (the Muffled Bell) gagged in its heavy frame on the floor; a stand of candles either side of it;
  // the pews in rows before it, an aisle down their middle; the Order's banner on a far wall
  function dressChapel(R: Room): void {
    if (bellsPlan) {
      const m = bellsPlan.muffled;
      const bx = Math.floor(m.x);
      const by = Math.floor(m.y);
      // (the contract: kind 'piece', solid, state 0, variant 0, on the bell's tile)
      put(P.chapelBell, bx, by, true, 0);
      // (the pews in rows on its nearer side, toward the eye, along x where the chapel is deep enough for three rows, else along y)
      const alongX = R.y + R.h - 2 - by >= 7 || R.x + R.w - 2 - bx < 7;
      for (const s of [-3, 3]) {
        const x = alongX ? bx + s : bx;
        const y = alongX ? by : by + s;
        if (free(x, y, false)) put(P.candles, x, y, true);
      }
      // (the pews in rows before it, their length across the way to it: two blocks either side of an aisle three tiles wide
      // down to the bell, a pew every other tile along the row and a row every other tile on, a walk left along the walls)
      const rows = alongX ? R.y + R.h - 2 - by : R.x + R.w - 2 - bx;
      for (let d = 3; d <= rows; d += 2) {
        for (const s of [-2, -4, 2, 4]) {
          const x = alongX ? bx + s : bx + d;
          const y = alongX ? by + d : by + s;
          if (alongX ? x <= R.x || x >= R.x + R.w - 1 : y <= R.y || y >= R.y + R.h - 1) continue;
          if (free(x, y, false)) put(P.pews, x, y, true, alongX ? 0 : 1);
        }
      }
    }
    lamps(R);
    const face: 0 | 1 = rng.chance(0.5) ? 0 : 1;
    const x = face === 0 ? R.x + R.w - 3 : R.x;
    const y = face === 0 ? R.y : R.y + R.h - 3;
    if (wallWhole(x, y, face, 1) && !nearBell(x, y, 2)) onWall(P.banner, x, y, face, 0);
  }

  // ---- THE THEATRE (the boss's ground): the operating table under its lamp in its middle; the gallery's tiers round its far
  // corner; the cabinets of last words along its far walls past the gallery; the tray of his instruments by the table; the
  // drain in the floor before it; the Physician's ledger on its desk at the far wall's end (his doc's quest); beds about its
  // edge (his Rounds, "where the patients rise from their beds"); its lamps
  function dressTheatre(R: Room): void {
    const t = tableOf(R);
    put(P.table, t.tx, t.ty, true, 0, { x: t.tx, y: t.ty + 0.5 }, [[t.tx - 1, t.ty]]);
    if (free(t.tx + 2, t.ty - 1, true)) put(P.tray, t.tx + 2, t.ty - 1, true);
    // (the floor round the table kept clear: room for his moves)
    for (let y = t.ty - 2; y <= t.ty + 2; y++) for (let x = t.tx - 3; x <= t.tx + 2; x++) if (inMap(x, y) && !taken[y * W + x]) keep[y * W + x] = 1;
    // the gallery: its tiers round a point 3.1 tiles in from the corner, 1.95 to 3.5 tiles out from it (art/floor14.ts gallery,
    // built half as big again): every tile of the corner behind its front tier taken
    const gx = R.x + 3.1;
    const gy = R.y + 3.1;
    const more: [number, number][] = [];
    for (let ty = R.y; ty < R.y + 3; ty++) for (let tx = R.x; tx < R.x + 3; tx++) {
      if (tx === R.x + 1 && ty === R.y + 1) continue;
      if (Math.hypot(tx + 0.5 - gx, ty + 0.5 - gy) > 1.6) more.push([tx, ty]);
    }
    put(P.gallery, R.x + 1, R.y + 1, true, 0, { x: R.x + 1.6, y: R.y + 1.6 }, more);
    for (const k of [5, 7]) {
      if (free(R.x + k, R.y, false) && wallWhole(R.x + k, R.y, 0, 1)) put(P.cabinet, R.x + k, R.y, true, 0);
      if (free(R.x, R.y + k, false) && wallWhole(R.x, R.y + k, 1, 1)) put(P.cabinet, R.x, R.y + k, true, 1);
    }
    // (the drain: a floor tile, laid centred on the corner of four tiles a tile and a half before the table: the game draws a
    // floor tile at its tile's top corner, render/act1_pieces.ts floorTiles, and the drain's picture is anchored at its middle)
    const drain: Act1Tile = { i: (t.ty + 2) * W + t.tx, name: P.drain, frame: 0 };
    out.tiles.push(drain);
    // (the ledger on its desk a tile out from the far wall, toward its far end from the gallery: along the wall along x, or
    // along the wall along y, wherever a doorway does not come)
    const ledgerAt: [number, number][] = [];
    for (let k = 0; k < 8; k++) ledgerAt.push([R.x + R.w - 3 - k, R.y + 1], [R.x + 1, R.y + R.h - 3 - k]);
    for (const [x, y] of ledgerAt) {
      if (!free(x, y, true)) continue;
      put(P.ledger, x, y, true);
      keepRing(x, y);
      break;
    }
    // beds about its edge, along its far walls past the gallery and the cabinets
    const slots = bedSlots(R, isHall).filter((s) => s.ok && (s.face === 0 ? s.tx >= R.x + 9 && s.tx <= R.x + R.w - 6 : s.ty >= R.y + 9));
    for (const s of slots) {
      const foot2: [number, number] = s.face === 0 ? [s.tx, s.ty + 1] : [s.tx + 1, s.ty];
      if (!free(s.tx, s.ty) || !free(foot2[0], foot2[1])) continue;
      const at = s.face === 0 ? { x: s.tx + 0.5, y: s.ty + 0.85 } : { x: s.tx + 0.85, y: s.ty + 0.5 };
      put(P.bed, s.tx, s.ty, true, (s.face === 0 ? 2 : 0) + (rng.chance(BEDS_RISEN) ? 1 : 0), at, [foot2]);
    }
    // (none over the gallery or the tall cabinets)
    lamps(R, (x, y, face) => (face === 0 ? x < R.x + 9 : y < R.y + 9));
    if (free(R.x, R.y + R.h - 2, false)) put(P.vials, R.x, R.y + R.h - 2, true);
  }

  // THE SPILLED TONIC'S BEAT, as the descent's traps (game/traps.ts: a spike floor's)
  L.props.push(...props);
  if (traps.length) {
    f.hazards = [...(f.hazards ?? []), ...traps];
    L.hazards = makeHazards(f);
  }
  if (momentAt) out.moment = momentAt;

  // NOTHING WALLED OFF: every tile that could be walked before it was dressed, and is not under a piece, still reached from
  // where he comes in; where one is not, the piece nearest it is taken away again (rarely: a guard, not the rule)
  for (let guard = 0; guard < 40; guard++) {
    const seen = walkReach(L.walk, W, H, Math.floor(f.start.y) * W + Math.floor(f.start.x));
    let lost = -1;
    for (let i = 0; i < W * H && lost < 0; i++) if (before[i] === 1 && L.walk[i] === 1 && !seen[i]) lost = i;
    if (lost < 0) break;
    const lx = lost % W;
    const ly = Math.floor(lost / W);
    let best: PropInst | null = null;
    let bd = Infinity;
    for (const [p, list] of foot) {
      for (const i of list) {
        const d = Math.hypot((i % W) - lx, Math.floor(i / W) - ly);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
    }
    if (!best) break;
    for (const i of foot.get(best)!) L.walk[i] = before[i];
    foot.delete(best);
    L.props.splice(L.props.indexOf(best), 1);
  }
  return out;
}

/** The tiles reached by side steps over the walk grid from tile `from`. */
export function walkReach(walk: Uint8Array, W: number, H: number, from: number): Uint8Array {
  const seen = new Uint8Array(W * H);
  if (walk[from] !== 1) return seen;
  const q = [from];
  seen[from] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    if (x + 1 < W && !seen[i + 1] && walk[i + 1] === 1) (seen[i + 1] = 1), q.push(i + 1);
    if (x > 0 && !seen[i - 1] && walk[i - 1] === 1) (seen[i - 1] = 1), q.push(i - 1);
    if (y + 1 < H && !seen[i + W] && walk[i + W] === 1) (seen[i + W] = 1), q.push(i + W);
    if (y > 0 && !seen[i - W] && walk[i - W] === 1) (seen[i - W] = 1), q.push(i - W);
  }
  return seen;
}
