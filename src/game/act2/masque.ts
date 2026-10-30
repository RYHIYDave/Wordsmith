// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17, THE MASQUE: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the
// floor, game/act2_dress.ts for its pieces). Behind HIGH_CITY (game/act1.ts), off until he has played it and said yes. Built by
// the main chat (docs/high_city_build.md, "Floor 17"), as floor 14's House of Quiet is laid (game/act2/housequiet.ts: rooms
// joined by halls, every edge straight).
//
// HIS DOC, level 17: "Into the palace, where the prince's masked ball has gone on for weeks."; "indoors: a winding suite of seven
// great rooms, each in its own colour (blue, purple, green, orange, white, violet, and a black one lit red through its windows),
// with galleries, card rooms and servants' passages between."; its hazard "the great ebony clock in the black room. Every so
// often it chimes: every dancer stops dead and turns to look at you, then the music starts again and they all come at once.";
// its boss "The Prince. His floor is the Black Room." The art is the art chat's (docs/mockups/masque/README.md, his yes to each
// part): its ground art/masque.ts (masqueLook, MQ_ZONE), its 25 pieces art/floor17.ts, the High City's 25 art/high_city_set.ts.
// From Poe's tale, as the art takes it: the seven in their order, "a sharp turn at every twenty or thirty yards"; no lamp or
// candle in the seven, lit through their windows by braziers in the corridors behind; the ebony clock against the black room's
// western wall; the abbey's iron gates, their bolts welded.
//
// WHAT IT LAYS (the main chat's picks, where his doc and the art leave it open):
//   THE SUITE, the main way: THE IRON GATES' HALL where he comes in (a gallery; the gates shut behind him); a GALLERY; then the
//     SEVEN ROOMS in the tale's order, blue, purple, green, orange, white, violet, black, each entered from the last by a short
//     way through (a doorway) or a gallery between, and the suite turning at nearly every room; THE BLACK ROOM, the Prince's,
//     the biggest (his notes: "a boss arena is about 17 by 20"), the clock against its west wall (the wall along y at its least
//     x, a far wall: seen whole); THE WAY ON in a small room beyond it, through it.
//   OFF THE SUITE: CARD ROOMS (three or four; one of them the footmen's LAIR, its guardian pack; one or two STORES, the reward's
//     chests), and THE SERVANTS' PASSAGES (three or four), the closed corridors behind the windows, where the braziers stand.
//   WHAT EACH TILE IS (Land.zones, the art's MQ_ZONE): each room its colour; the galleries Gallery; the card rooms Cards; the
//     passages and the ways to the side rooms Passage; a short way through between two of the seven its room's own colour.
//   ITS PACKS: the floor's own (game/act2_mobs.ts ACT2_OWN[17]): a few to a room by its size, the dancers in the seven; the
//     lair's its guardian's; none in the gates' hall, the black room or beyond it.
//
// Everything is by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act2Pack } from '../act2_mobs';
import type { Act1Dress, Act1Tile } from '../act1_dress';
import { masqueWindows } from '../../art/masque';
import { walkReach } from './housequiet';
import type { AreaRole, Blob, Laid, Land, Lane } from '../act1_layout';
import type { Level, PropInst } from '../state';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor. */
export const BUILT = true;

/**
 * WHAT EACH WALKABLE TILE IS: the art chat's MQ_ZONE (art/masque.ts), its numbers here, for no file of the game's rules imports
 * the art (tests/act2_masque.test.ts holds the two the same).
 */
export const MASQUE_ZONE = { Blue: 0, Purple: 1, Green: 2, Orange: 3, White: 4, Violet: 5, Black: 6, Gallery: 7, Cards: 8, Passage: 9 } as const;

// ---------------------------------------------------------------------------------------------------
// THE PALACE'S MEASURES (tiles)

/** A way between rooms: three tiles wide (a doorway's span with its jambs: the art's doorways are two, the wall beside them a tile). */
const CW = 3;
/** Rooms stand at least this far apart: the walls between them this thick. */
const ROOM_GAP = 3;
/** A way between rooms keeps this far from every room and way it does not join. */
const CLEAR = 2;
/** Wall left round the palace, to the map's edge. */
const MARGIN = 8;
/** The suite wanders across the floor no more than this far either side of where it began. */
const BAND = 34;

/** What a room of the palace is. */
export type MasqueRole = 'gates' | 'gallery' | 'blue' | 'purple' | 'green' | 'orange' | 'white' | 'violet' | 'black' | 'beyond' | 'cards' | 'passage' | 'lair' | 'store';
/** The seven, in the tale's order. */
export const SEVEN: readonly MasqueRole[] = ['blue', 'purple', 'green', 'orange', 'white', 'violet', 'black'];

/** Each kind of room's sides, its long one and its short one (each a range, tiles of floor). */
const SIZE: Readonly<Record<MasqueRole, { long: [number, number]; short: [number, number] }>> = {
  gates: { long: [11, 13], short: [8, 10] },
  gallery: { long: [16, 24], short: [5, 7] },
  // (the six great rooms: a ball's rooms, wide; the dancers waltz in pairs across them)
  blue: { long: [15, 18], short: [12, 14] },
  purple: { long: [15, 18], short: [12, 14] },
  green: { long: [15, 18], short: [12, 14] },
  orange: { long: [15, 18], short: [12, 14] },
  white: { long: [15, 18], short: [12, 14] },
  violet: { long: [15, 18], short: [12, 14] },
  // (the Prince's: his notes, a boss arena about 17 by 20; his darts 9.3 tiles a second, his waltz round an arc)
  black: { long: [20, 21], short: [17, 18] },
  beyond: { long: [8, 9], short: [7, 8] },
  cards: { long: [10, 12], short: [8, 10] },
  // (a servants' passage: the closed corridor, long and narrow)
  passage: { long: [14, 22], short: [3, 4] },
  lair: { long: [12, 14], short: [10, 11] },
  store: { long: [8, 10], short: [7, 8] },
};
/** Each kind's floor (MQ_ZONE). */
const ZONE_OF: Readonly<Record<MasqueRole, number>> = {
  gates: MASQUE_ZONE.Gallery,
  gallery: MASQUE_ZONE.Gallery,
  blue: MASQUE_ZONE.Blue,
  purple: MASQUE_ZONE.Purple,
  green: MASQUE_ZONE.Green,
  orange: MASQUE_ZONE.Orange,
  white: MASQUE_ZONE.White,
  violet: MASQUE_ZONE.Violet,
  black: MASQUE_ZONE.Black,
  beyond: MASQUE_ZONE.Passage,
  cards: MASQUE_ZONE.Cards,
  passage: MASQUE_ZONE.Passage,
  lair: MASQUE_ZONE.Cards,
  store: MASQUE_ZONE.Cards,
};
/** Is a role one of the seven. */
export const isSeven = (r: MasqueRole): boolean => SEVEN.includes(r);

// ---------------------------------------------------------------------------------------------------
// THE PLAN: rooms and the ways between them, as rectangles, checked against each other before anything is laid

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PlanRoom extends Rect {
  role: MasqueRole;
  /** Its place along the suite (0 the gates' hall), or -1 off it. */
  path: number;
  /** The room it hangs from (-1 for the gates' hall). */
  parent: number;
}
/** A way between two rooms: its rectangle, the rooms it joins, which way it runs. */
interface Join extends Rect {
  a: number;
  b: number;
  alongX: boolean;
}
interface Plan {
  rooms: PlanRoom[];
  joins: Join[];
}

const near = (a: Rect, b: Rect, gap: number): boolean => a.x - gap < b.x + b.w && b.x - gap < a.x + a.w && a.y - gap < b.y + b.h && b.y - gap < a.y + a.h;
/** Which way a step goes: 0 toward +x, 1 toward -x, 2 toward +y, 3 toward -y. */
type Side = 0 | 1 | 2 | 3;
const alongXOf = (s: Side): boolean => s < 2;

/**
 * A NEW ROOM `w` by `h` set off `host` on its side `side`, a way `len` long between them (straight, CW wide, a tile in from
 * each room's corners). Null where there is no room for it. (As floor 14's: game/act2/housequiet.ts attach.)
 */
function attach(rng: RNG, plan: Plan, host: number, side: Side, w: number, h: number, len: number): { room: Rect; join: Rect } | null {
  const H = plan.rooms[host];
  const ax = alongXOf(side);
  const hostLo = ax ? H.y + 1 : H.x + 1;
  const hostHi = ax ? H.y + H.h - CW - 1 : H.x + H.w - CW - 1;
  if (hostHi < hostLo) return null;
  const c = rng.int(hostLo, hostHi);
  const span = ax ? h : w;
  const lo = c + CW + 1 - span;
  const hi = c - 1;
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
  for (let j = 0; j < plan.rooms.length; j++) {
    if (near(room, plan.rooms[j], ROOM_GAP)) return null;
    if (j !== host && near(join, plan.rooms[j], CLEAR)) return null;
  }
  for (const J of plan.joins) if (near(room, J, CLEAR) || near(join, J, CLEAR)) return null;
  return { room, join };
}

/** A room's two sides for a step: its length along the way it is entered (`alongWay`) or across it. */
function sidesOf(rng: RNG, role: MasqueRole, side: Side, alongWay: boolean): { w: number; h: number } {
  const s = SIZE[role];
  const a = rng.int(s.long[0], s.long[1]);
  const b = rng.int(s.short[0], s.short[1]);
  const longAlongX = alongXOf(side) === alongWay;
  return longAlongX ? { w: a, h: b } : { w: b, h: a };
}

/**
 * THE SUITE'S ROOMS, in order: the gates' hall; a gallery; the seven, a gallery between some of them (two or three in all, never
 * before the black room: the violet opens straight into it, as in the tale); beyond the black room, the way on.
 */
function mainRoles(rng: RNG): MasqueRole[] {
  const out: MasqueRole[] = ['gates', 'gallery'];
  const between = new Set(rng.shuffle([1, 2, 3, 4, 5]).slice(0, rng.int(3, 4)));
  SEVEN.forEach((r, i) => {
    if (i > 0 && between.has(i)) out.push('gallery');
    out.push(r);
  });
  out.push('beyond');
  return out;
}

/**
 * Lay the suite: each room off the last, the suite turning at nearly every room (the tale's "a sharp turn at every twenty or
 * thirty yards"), mostly on along the floor's way (`A`), now across it, never straight back; kept within the band.
 */
function planMain(rng: RNG, A: 'x' | 'y'): Plan | null {
  const on: Side = A === 'x' ? 0 : 2;
  const across: [Side, Side] = A === 'x' ? [2, 3] : [0, 1];
  const roles = mainRoles(rng);
  const plan: Plan = { rooms: [], joins: [] };
  const e = sidesOf(rng, 'gates', on, rng.chance(0.5));
  plan.rooms.push({ x: 0, y: 0, w: e.w, h: e.h, role: 'gates', path: 0, parent: -1 });
  const mid = (r: Rect): number => (A === 'x' ? r.y + r.h / 2 : r.x + r.w / 2);
  const mid0 = mid(plan.rooms[0]);
  let last: Side = on;
  for (let i = 1; i < roles.length; i++) {
    const role = roles[i];
    let done = false;
    for (let tries = 0; tries < 60 && !done; tries++) {
      const host = plan.rooms.length - 1;
      // (the turn: across the way when the last step went on, on when it went across; the black room and beyond straight on)
      let side: Side = on;
      if (role !== 'black' && role !== 'beyond' && (last === on ? rng.chance(0.75) : rng.chance(0.25))) {
        const off = mid(plan.rooms[host]) - mid0;
        side = off > BAND * 0.55 ? across[1] : off < -BAND * 0.55 ? across[0] : last !== on ? last : rng.pick(across);
      }
      const sz = sidesOf(rng, role, side, role === 'gallery' || rng.chance(0.5));
      // (between two of the seven a doorway's depth (the wall between); a gallery's ways longer)
      const len = role === 'gallery' || roles[i - 1] === 'gallery' ? rng.int(3, 5) : ROOM_GAP;
      const got = attach(rng, plan, host, side, sz.w, sz.h, len);
      if (!got) continue;
      if (Math.abs(mid(got.room) - mid0) > BAND) continue;
      plan.rooms.push({ ...got.room, role, path: i, parent: host });
      plan.joins.push({ ...got.join, a: host, b: plan.rooms.length - 1, alongX: alongXOf(side) });
      last = side;
      done = true;
    }
    if (!done) return null;
  }
  return plan;
}

/** A side room of `role` off one of `hosts` (the first the likeliest), on any of its sides, its way `len` long. Its index, or -1. */
function growSide(rng: RNG, plan: Plan, role: MasqueRole, hosts: number[], tries = 80, len: [number, number] = [3, 7]): number {
  if (!hosts.length) return -1;
  for (let t = 0; t < tries; t++) {
    const host = hosts[Math.min(hosts.length - 1, Math.floor(Math.pow(rng.next(), 1.6) * hosts.length))];
    const side = rng.int(0, 3) as Side;
    const sz = sidesOf(rng, role, side, role === 'passage' ? rng.chance(0.8) : rng.chance(0.5));
    const got = attach(rng, plan, host, side, sz.w, sz.h, rng.int(len[0], len[1]));
    if (!got) continue;
    plan.rooms.push({ ...got.room, role, path: -1, parent: host });
    plan.joins.push({ ...got.join, a: host, b: plan.rooms.length - 1, alongX: alongXOf(side) });
    return plan.rooms.length - 1;
  }
  return -1;
}

// ---------------------------------------------------------------------------------------------------
// LAY FLOOR 17

/** What only floor 17 knows of itself (Land.masque), for its dresser and its rules (the clock's chime: game/act2/masque_rules.ts). */
export interface MasquePlan {
  /** Each room: its rectangle (x0, y0, x1, y1; x1, y1 not in it), what it is, its place along the suite (-1 off it), its room id. */
  rooms: { r: [number, number, number, number]; role: MasqueRole; path: number; room: number }[];
  /** THE GREAT EBONY CLOCK: the middle of its foot (world), against the black room's west wall, its front along +x. */
  clock: { x: number; y: number };
  /** The ways between rooms (x0, y0, x1, y1), and whether each runs along x. */
  ways: { r: [number, number, number, number]; alongX: boolean }[];
}

/** Lay floor 17, or null (this throw of the dice could not lay the suite: game/act2_layout.ts rolls again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x6a09e667) >>> 0);
  const A: 'x' | 'y' = rng.chance(0.5) ? 'x' : 'y';
  const plan = planMain(rng, A);
  if (!plan) return null;
  const blackI = plan.rooms.findIndex((r) => r.role === 'black');

  // SIDE ROOMS: card rooms off the seven (one the footmen's lair, a store or two), the servants' passages off the seven and the galleries
  const sevenHosts = plan.rooms.map((_, i) => i).filter((i) => isSeven(plan.rooms[i].role) && i < blackI);
  const anyHost = plan.rooms.map((_, i) => i).filter((i) => i > 0 && i < blackI);
  if (growSide(rng, plan, 'lair', rng.shuffle([...sevenHosts]).filter((i) => plan.rooms[i].path >= 4)) < 0) return null;
  const cards = rng.int(3, 4);
  for (let n = 0; n < cards; n++) growSide(rng, plan, 'cards', rng.shuffle([...sevenHosts]));
  const stores = rng.int(1, 2);
  for (let n = 0; n < stores; n++) growSide(rng, plan, 'store', rng.shuffle([...anyHost]));
  const passages = rng.int(3, 4);
  let laid = 0;
  for (let n = 0; n < passages; n++) if (growSide(rng, plan, 'passage', rng.shuffle([...anyHost]), 120, [3, 5]) >= 0) laid++;
  if (laid < 2) return null;

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

  // THE TILES, AND WHAT EACH IS: a way between two of the seven (a doorway) the colour of the room it opens into; a way to a
  // gallery a gallery's; a way to a side room the passage's flags
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  for (const J of plan.joins) {
    const a = plan.rooms[J.a].role;
    const b = plan.rooms[J.b].role;
    const z = plan.rooms[J.b].path < 0 ? MASQUE_ZONE.Passage : isSeven(b) && isSeven(a) ? ZONE_OF[b] : b === 'gallery' || a === 'gallery' || a === 'gates' ? MASQUE_ZONE.Gallery : ZONE_OF[b];
    for (let ty = J.y; ty < J.y + J.h; ty++) for (let tx = J.x; tx < J.x + J.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = z;
    }
  }
  for (const r of plan.rooms) {
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = ZONE_OF[r.role];
    }
  }

  // ROOMS (the suite first, in walking order, then the side rooms), AND THE LAND'S AREAS
  const order = plan.rooms.map((_, i) => i).sort((a, b) => {
    const pa = plan.rooms[a].path;
    const pb = plan.rooms[b].path;
    return (pa < 0 ? 1e3 + a : pa) - (pb < 0 ? 1e3 + b : pb);
  });
  const idOf: number[] = [];
  order.forEach((pi, id) => (idOf[pi] = id));
  const kindOf = (r: PlanRoom): RoomKind => (r.role === 'gates' ? 'start' : r.role === 'black' ? 'boss' : r.role === 'lair' ? 'guardian' : r.role === 'store' ? 'treasure' : 'normal');
  const rooms: Room[] = order.map((pi, id) => {
    const r = plan.rooms[pi];
    return { id, x: r.x, y: r.y, w: r.w, h: r.h, kind: kindOf(r), path: r.path };
  });
  // (two of the seven before the black room hold a yellow pack)
  const eliteable = rooms.filter((r, id) => r.kind === 'normal' && isSeven(plan.rooms[order[id]].role));
  for (const r of rng.shuffle([...eliteable]).slice(0, 2)) r.kind = 'elite';
  const roleOf = (r: PlanRoom): AreaRole => (r.role === 'gates' ? 'start' : r.role === 'black' ? 'boss' : r.role === 'lair' ? 'lair' : r.path < 0 ? 'side' : 'path');
  const areas = order.map((pi) => {
    const r = plan.rooms[pi];
    const blob: Blob = { x: r.x + r.w / 2, y: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, rot: 0, wob: 0, seed: 0 };
    return { blob, room: idOf[pi], role: roleOf(r) };
  });
  const lanes: Lane[] = plan.joins.map((J) => (J.alongX ? { pts: [[J.x, J.y + CW / 2], [J.x + J.w, J.y + CW / 2]] as [number, number][], w: CW } : { pts: [[J.x + CW / 2, J.y], [J.x + CW / 2, J.y + J.h]] as [number, number][], w: CW }));
  const way: [number, number][] = plan.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path).map((r) => [r.x + r.w / 2, r.y + r.h / 2]);

  // THE START, THE BOSS, THE CLOCK, THE WAY ON
  const ent = plan.rooms[0];
  const start = { x: ent.x + Math.floor(ent.w / 2) + 0.5, y: ent.y + Math.floor(ent.h / 2) + 0.5 };
  const B = plan.rooms[blackI];
  // (the clock against the black room's west wall, the wall along y at its least x, in the middle of it, clear of a doorway)
  const isWay = (tx: number, ty: number): boolean => plan.joins.some((J) => tx >= J.x && tx < J.x + J.w && ty >= J.y && ty < J.y + J.h);
  const midY = B.y + Math.floor(B.h / 2);
  let cy = midY;
  for (let k = 0; k <= B.h; k++) {
    const y = midY + (k % 2 ? -1 : 1) * Math.ceil(k / 2);
    if (y < B.y + 2 || y > B.y + B.h - 3) continue;
    if (!isWay(B.x - 1, y - 1) && !isWay(B.x - 1, y) && !isWay(B.x - 1, y + 1)) {
      cy = y;
      break;
    }
  }
  const clock = { x: B.x + 0.5, y: cy + 0.5 };
  // (the Prince waits in the middle of his floor; the game sets him a tile and two on from here: game.ts spawnMonsters)
  const boss = { x: B.x + Math.floor(B.w / 2) + 0.5, y: B.y + Math.floor(B.h / 2) + 0.5 };
  const beyond = plan.rooms[plan.rooms.findIndex((r) => r.role === 'beyond')];
  const exit = { x: beyond.x + Math.floor(beyond.w / 2) + 0.5, y: beyond.y + Math.floor(beyond.h / 2) + 0.5 };

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
  floor.packs = packsOf(new RNG((seed ^ 0x3c6ef372) >>> 0), floor, plan, idOf, depth);
  floor.props = storesOf(new RNG((seed ^ 0xa54ff53a) >>> 0), floor, plan);

  const masque: MasquePlan = {
    rooms: plan.rooms.map((r, pi) => ({ r: [r.x, r.y, r.x + r.w, r.y + r.h], role: r.role, path: r.path, room: idOf[pi] })),
    clock,
    ways: plan.joins.map((J) => ({ r: [J.x, J.y, J.x + J.w, J.y + J.h], alongX: J.alongX })),
  };
  const land: Land = {
    kind: 'masque',
    depth,
    seed,
    way,
    areas,
    lanes,
    holds: [],
    exit,
    arrive: { ...start },
    zones,
    masque,
  };
  return { floor, land };
}

/**
 * THE PACKS, by room: in the suite's rooms and the side rooms, one for every 70 tiles of a room or so, at most three; the
 * lair's its guardian's, in its middle; a store's one; a passage's one, small; none in the gates' hall, the black room or
 * beyond it. None within 10 tiles of the start, none within 5 of another.
 */
function packsOf(rng: RNG, f: Floor, plan: Plan, idOf: readonly number[], depth: number): PackSpot[] {
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
    if (r.role === 'gates' || r.role === 'black' || r.role === 'beyond') return;
    const id = idOf[pi];
    const room = f.rooms[id];
    if (r.role === 'lair') {
      put(r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2), id, 'champion', act2Pack(depth, rng, 'champion'));
      return;
    }
    const n = r.role === 'store' || r.role === 'passage' ? 1 : Math.max(1, Math.min(3, Math.round((r.w * r.h) / 70)));
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 40; tries++) {
        const x = rng.int(r.x + 1, r.x + r.w - 2);
        const y = rng.int(r.y + 1, r.y + r.h - 2);
        if (!free(x, y)) continue;
        if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 10) continue;
        if (used.some((u) => Math.hypot(u.x - x - 0.5, u.y - y - 0.5) < 5)) continue;
        const tier: PackSpot['tier'] = room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        const p = act2Pack(depth, rng, tier);
        put(x, y, id, tier, r.role === 'passage' ? { kind: p.kind, size: Math.max(2, Math.ceil(p.size * 0.6)) } : p);
        break;
      }
    }
  });
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

/** The art's names of floor 17's pieces (art/floor17.ts masquePieces; tests/act2_masque.test.ts holds them to the art's list). */
export const MQ_PIECE = {
  clock: 'the great ebony clock',
  brazier: 'a brazier on its tripod',
  candelabrum: 'a gilt candelabrum',
  chandelier: 'a crystal chandelier',
  sconce: 'a gilt sconce',
  velvet: 'black velvet at a window lit red',
  tapestry: 'a tapestry of the masque',
  pierGlass: 'a pier glass, its glass gone',
  ornaments: 'gilt ornaments hanging from the roof',
  couch: 'a fainting couch',
  cardTable: 'a card table with royal cards',
  cards: 'royal cards, scattered',
  buffet: 'a buffet of a feast gone cold',
  harpsichord: 'a harpsichord',
  viol: 'a viol and its stand',
  screen: 'a folding screen of arabesques',
  tray: "a footman's tray",
  masks: 'masks dropped on the floor',
  wine: 'wine spilled',
  scattered: 'gilt ornaments, scattered',
  crest: 'the royal crest in the floor',
  bargain: "the prince's bargain with the Order",
  // (the High City's own, art/high_city_set.ts)
  banner: "a royal's banner",
  portrait: 'a court portrait, faces painted out',
  notice: 'a court notice, gone blank',
  orderMask: "the Order's mask over the crest",
  standing: 'a standing candelabrum',
  statue: 'a marble statue of a royal',
  vase: 'a grand vase',
  hatStand: 'a hat stand, cloaks left on it',
  invitations: 'a heap of invitations',
  fan: 'a dropped fan and a rose',
  carpet: 'a royal carpet',
} as const;

/** The clock's frames (art/floor17.ts CLOCK_FRAMES): six for each way it stands; against a west wall its front along +x, the second six. */
export const CLOCK_FACING_X = 6;

/**
 * DRESS FLOOR 17, room by room, as the art chat laid its corner (src/dev/masque_lay.ts), the tale's way: THE SEVEN lit only
 * through their windows (no candle in them, his pick “As drawn, true to the book (Recommended)”), open for the dance: masks
 * dropped, gilt ornaments scattered and hanging from the roof, wine spilled (none in the black room), a fainting couch or a
 * screen by a wall, a tapestry or a pier glass on a far wall between the windows; THE WHITE ROOM the feast gone cold and the
 * musicians' harpsichord and viol; THE BLACK ROOM the clock against its west wall, black velvet at a window or two, masks
 * where the dancers fled it, nothing else (the Prince's floor kept clear); THE GALLERIES candelabra down their walls,
 * chandeliers down their middles, sconces, the court's portraits and banners, the royal crest in the floor; THE CARD ROOMS
 * their tables and chairs, cards flung, a chandelier; the footmen's lair a card room with their trays; THE PASSAGES the
 * braziers that light the windows; the prince's bargain with the Order (the quest) by the violet room's doorway into the black.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  const M = land?.masque;
  if (!land || land.kind !== 'masque' || !M) return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x5be0cd19) >>> 0);
  const out: Act1Dress = { floor: depth, tiles: [] };
  const inMap = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const floorAt = (x: number, y: number): boolean => inMap(x, y) && f.tiles[y * W + x] === T_FLOOR;
  const inRect = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
  const isWay = (x: number, y: number): boolean => M.ways.some((w) => inRect(w.r, x, y));

  // WHAT IS KEPT CLEAR (of anything solid): where he comes in, the waypoint, the way on, every pack's middle, every doorway (a
  // way's tiles and two tiles round them), the black room's floor but its edge
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) if (inMap(tx, ty) && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3.2);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (const w of M.ways) for (let y = w.r[1] - 2; y < w.r[3] + 2; y++) for (let x = w.r[0] - 2; x < w.r[2] + 2; x++) if (inMap(x, y)) keep[y * W + x] = 1;

  const before = L.walk.slice();
  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const props: PropInst[] = [];
  const foot = new Map<PropInst, number[]>();
  const whole = (x: number, y: number): boolean => floorAt(x, y) && L.walk[y * W + x] === 1;
  const free = (x: number, y: number, ring = false): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i]) return false;
    if (!ring) return true;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if ((a || b) && floorAt(x + a, y + b) && L.walk[(y + b) * W + x + a] !== 1) return false;
    return true;
  };
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, at?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: at ? at.x : x + 0.5, y: at ? at.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    const i = y * W + x;
    taken[i] = 1;
    if (solid) {
      L.walk[i] = 0;
      foot.set(p, [i]);
    }
    return p;
  };
  /** One of the game's breakables (a 'barrel' is the floor's gilt chair, an 'urn' its footman's tray: ACT1_SETS[17]). */
  const breakable = (kind: 'barrel' | 'urn', x: number, y: number): void => {
    const p: PropInst = { kind, tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: true, state: 0, variant: 0 };
    props.push(p);
    taken[y * W + x] = 1;
    L.walk[y * W + x] = 0;
    foot.set(p, [y * W + x]);
  };
  // (the windows the ground paints, art/masque.ts: nothing hung over one)
  const windows = masqueWindows({ floor: f, zone: (tx, ty) => (inMap(tx, ty) && land.zones ? land.zones[ty * W + tx] : MASQUE_ZONE.Passage) });
  const byWindow = (x: number, y: number, face: 0 | 1): boolean => windows.some((w) => w.face === face && (face === 0 ? Math.abs(w.y - y) < 0.01 && Math.abs(w.x - (x + 0.5)) < 2 : Math.abs(w.x - x) < 0.01 && Math.abs(w.y - (y + 0.5)) < 2));
  const wallTaken = new Set<number>();
  /** A piece on a far wall over floor tile (x, y): face 0 the wall along x behind it (at y - 1), face 1 along y (at x - 1). */
  const onWall = (name: string, x: number, y: number, face: 0 | 1, frame = 0): PropInst | null => {
    const back = face === 0 ? [x, y - 1] : [x - 1, y];
    if (!floorAt(x, y) || floorAt(back[0], back[1]) || byWindow(x, y, face)) return null;
    for (let k = -1; k <= 1; k++) if (face === 0 ? floorAt(x + k, y - 1) : floorAt(x - 1, y + k)) return null;
    const key = (y * W + x) * 2 + face;
    for (let k = -1; k <= 1; k++) if (wallTaken.has(((face === 0 ? y : y + k) * W + (face === 0 ? x + k : x)) * 2 + face)) return null;
    wallTaken.add(key);
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: face === 0 ? x + 0.5 : x, y: face === 0 ? y : y + 0.5, solid: false, state: 0, variant: face | (frame << 1) };
    props.push(p);
    return p;
  };
  /** Each of a room's far-wall tiles (its row along x at its least y, face 0; its column along y at its least x, face 1), shuffled. */
  const farWall = (r: readonly number[]): [number, number, 0 | 1][] =>
    rng.shuffle([
      ...Array.from({ length: r[2] - r[0] - 2 }, (_, k) => [r[0] + 1 + k, r[1], 0] as [number, number, 0 | 1]),
      ...Array.from({ length: r[3] - r[1] - 2 }, (_, k) => [r[0], r[1] + 1 + k, 1] as [number, number, 0 | 1]),
    ]);
  const hang = (name: string, r: readonly number[], n: number, frames = 1): void => {
    let laid = 0;
    for (const [x, y, face] of farWall(r)) {
      if (laid >= n) break;
      if (onWall(name, x, y, face, rng.int(0, frames - 1))) laid++;
    }
  };
  const tilesIn = (r: readonly number[], inset = 1): [number, number][] => {
    const list: [number, number][] = [];
    for (let ty = r[1] + inset; ty < r[3] - inset; ty++) for (let tx = r[0] + inset; tx < r[2] - inset; tx++) list.push([tx, ty]);
    return rng.shuffle(list);
  };
  /** Lay `name` on `n` free tiles of the room (solid or not), each with its ring free when `ring`. */
  const scatter = (name: string, r: readonly number[], n: number, solid: boolean, ring: boolean, variant: () => number = () => 0, inset = 1): void => {
    let laid = 0;
    for (const [x, y] of tilesIn(r, inset)) {
      if (laid >= n) break;
      if (!free(x, y, ring)) continue;
      put(name, x, y, solid, variant());
      laid++;
    }
  };
  /** Lay `name` against the room's walls (a tile in from one), `n` of it; `alongOf`: its variant for the wall it stands along. */
  const byWall = (name: string, r: readonly number[], n: number, solid: boolean, alongOf: (alongX: boolean) => number = () => 0): void => {
    const edge: [number, number, boolean][] = [];
    for (let x = r[0] + 1; x < r[2] - 1; x++) edge.push([x, r[1], true], [x, r[3] - 1, true]);
    for (let y = r[1] + 1; y < r[3] - 1; y++) edge.push([r[0], y, false], [r[2] - 1, y, false]);
    let laid = 0;
    for (const [x, y, ax] of rng.shuffle(edge)) {
      if (laid >= n) break;
      if (!free(x, y, false) || isWay(x, y)) continue;
      put(name, x, y, solid, alongOf(ax));
      laid++;
    }
  };
  const hanging = (name: string, r: readonly number[], every: number): void => {
    // (what hangs from the roof: down the room's middle, every `every` tiles; not solid, no shadow, walked under)
    const alongX = r[2] - r[0] >= r[3] - r[1];
    const cx = Math.floor((r[0] + r[2]) / 2);
    const cy = Math.floor((r[1] + r[3]) / 2);
    const len = alongX ? r[2] - r[0] : r[3] - r[1];
    const n = Math.max(1, Math.floor(len / every));
    for (let k = 0; k < n; k++) {
      const off = Math.round((k + 0.5) * (len / n) - len / 2);
      const [x, y] = alongX ? [cx + off, cy] : [cx, cy + off];
      if (floorAt(x, y) && !taken[y * W + x]) put(name, x, y, false, rng.int(0, 1));
    }
  };

  const roomOf = (role: MasqueRole): (typeof M.rooms)[number][] => M.rooms.filter((q) => q.role === role);
  const black = roomOf('black')[0];
  // THE BLACK ROOM: the clock against its west wall, its front along +x; black velvet at a window or two; masks dropped; its
  // floor kept clear for the Prince's dance
  put(MQ_PIECE.clock, Math.floor(M.clock.x), Math.floor(M.clock.y), true, CLOCK_FACING_X, { x: M.clock.x, y: M.clock.y });
  if (black) {
    hang(MQ_PIECE.velvet, black.r, 2);
    for (let ty = black.r[1] + 2; ty < black.r[3] - 2; ty++) for (let tx = black.r[0] + 2; tx < black.r[2] - 2; tx++) keep[ty * W + tx] = 1;
    scatter(MQ_PIECE.masks, black.r, 3, false, false, () => 0, 1);
  }
  // THE SEVEN (the black aside)
  for (const q of M.rooms) {
    if (!isSeven(q.role) || q.role === 'black') continue;
    const r = q.r;
    hang(rng.chance(0.6) ? MQ_PIECE.tapestry : MQ_PIECE.pierGlass, r, 1, 2);
    if (rng.chance(0.5)) hang(MQ_PIECE.pierGlass, r, 1);
    hanging(MQ_PIECE.ornaments, r, 6);
    scatter(MQ_PIECE.masks, r, rng.int(1, 3), false, false);
    scatter(MQ_PIECE.scattered, r, rng.int(1, 2), false, false);
    scatter(MQ_PIECE.wine, r, rng.int(0, 2), false, false);
    if (rng.chance(0.3)) scatter(MQ_PIECE.fan, r, 1, false, false);
    if (q.role === 'white') {
      // (the feast gone cold along a wall; the musicians' harpsichord and viol)
      byWall(MQ_PIECE.buffet, r, 1, true, (ax) => (ax ? 0 : 1));
      byWall(MQ_PIECE.harpsichord, r, 1, true, (ax) => (ax ? 0 : 1));
      scatter(MQ_PIECE.viol, r, 1, true, true);
    } else {
      byWall(MQ_PIECE.couch, r, rng.int(0, 2), true, (ax) => (ax ? 0 : 1));
      if (rng.chance(0.5)) scatter(MQ_PIECE.screen, r, 1, true, true);
    }
    for (let k = rng.int(0, 2); k > 0; k--) {
      const [x, y] = tilesIn(r, 2).find(([a, b]) => free(a, b, true)) ?? [-1, -1];
      if (x >= 0) breakable('barrel', x, y);
    }
  }
  // THE GALLERIES (and the gates' hall): candelabra down the walls, chandeliers down the middle, sconces and the court's
  // pictures on the far walls, the royal crest in the floor at the middle
  for (const q of M.rooms) {
    if (q.role !== 'gallery' && q.role !== 'gates') continue;
    const r = q.r;
    hanging(MQ_PIECE.chandelier, r, 6);
    byWall(MQ_PIECE.candelabrum, r, Math.max(2, Math.floor((r[2] - r[0] + r[3] - r[1]) / 8)), true);
    hang(MQ_PIECE.sconce, r, 2, 2);
    hang(rng.pick([MQ_PIECE.portrait, MQ_PIECE.banner, MQ_PIECE.notice]), r, 2);
    if (rng.chance(0.4)) hang(MQ_PIECE.orderMask, r, 1);
    if (rng.chance(0.5)) byWall(rng.pick([MQ_PIECE.statue, MQ_PIECE.vase, MQ_PIECE.hatStand]), r, 1, true);
    scatter(rng.pick([MQ_PIECE.invitations, MQ_PIECE.fan]), r, 1, false, false);
    const cx = Math.floor((r[0] + r[2]) / 2);
    const cy = Math.floor((r[1] + r[3]) / 2);
    if (floorAt(cx, cy)) out.tiles.push({ i: cy * W + cx, name: MQ_PIECE.crest, frame: 0, mid: 1 } satisfies Act1Tile);
  }
  // THE CARD ROOMS, THE LAIR, THE STORES: tables and chairs, cards flung, a chandelier, a candelabrum, a sconce
  for (const q of M.rooms) {
    if (q.role !== 'cards' && q.role !== 'lair' && q.role !== 'store') continue;
    const r = q.r;
    hanging(MQ_PIECE.chandelier, r, 8);
    hang(MQ_PIECE.sconce, r, 2, 2);
    if (q.role !== 'store') {
      for (let k = q.role === 'lair' ? 2 : rng.int(1, 2); k > 0; k--) {
        const [x, y] = tilesIn(r, 2).find(([a, b]) => free(a, b, true)) ?? [-1, -1];
        if (x < 0) continue;
        put(MQ_PIECE.cardTable, x, y, true, 0);
        for (const [a, b] of rng.shuffle([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as [number, number][]).slice(0, 2)) if (free(a, b)) breakable('barrel', a, b);
      }
    }
    scatter(MQ_PIECE.cards, r, rng.int(1, 2), false, false);
    byWall(MQ_PIECE.candelabrum, r, 1, true);
    if (q.role === 'lair') for (let k = 2; k > 0; k--) byWallBreakable(r);
  }
  function byWallBreakable(r: readonly number[]): void {
    for (const [x, y] of tilesIn(r, 1)) {
      if (x !== r[0] + 1 && x !== r[2] - 2 && y !== r[1] + 1 && y !== r[3] - 2) continue;
      if (!free(x, y)) continue;
      breakable('urn', x, y);
      return;
    }
  }
  // THE PASSAGES: the braziers that light the windows, down their length, every five tiles or so
  for (const q of M.rooms) {
    if (q.role !== 'passage' && q.role !== 'beyond') continue;
    const r = q.r;
    const alongX = r[2] - r[0] >= r[3] - r[1];
    const len = alongX ? r[2] - r[0] : r[3] - r[1];
    for (let k = 2; k < len - 1; k += 5) {
      const x = alongX ? r[0] + k : r[0];
      const y = alongX ? r[1] : r[1] + k;
      if (free(x, y)) put(MQ_PIECE.brazier, x, y, true, rng.int(0, 3));
    }
    if (q.role === 'passage' && rng.chance(0.5)) byWallBreakable(r);
  }
  // THE QUEST: the prince's bargain with the Order, on its little gilt table, in the violet room by its doorway into the black
  const violet = roomOf('violet')[0];
  if (violet && black) {
    const bc = { x: (black.r[0] + black.r[2]) / 2, y: (black.r[1] + black.r[3]) / 2 };
    const spots = tilesIn(violet.r, 1).sort((a, b) => Math.hypot(a[0] - bc.x, a[1] - bc.y) - Math.hypot(b[0] - bc.x, b[1] - bc.y));
    for (const [x, y] of spots) {
      if (!whole(x, y) || taken[y * W + x] || isWay(x, y)) continue;
      // (not on a doorway's way, but beside it: two tiles off the way's tiles)
      let byDoor = false;
      for (let b = -3; b <= 3 && !byDoor; b++) for (let a = -3; a <= 3; a++) if (isWay(x + a, y + b)) byDoor = true;
      if (!byDoor) continue;
      let onDoor = false;
      for (let b = -1; b <= 1 && !onDoor; b++) for (let a = -1; a <= 1; a++) if (isWay(x + a, y + b)) onDoor = true;
      if (onDoor) continue;
      put(MQ_PIECE.bargain, x, y, true);
      break;
    }
  }

  L.props.push(...props);

  // NOTHING WALLED OFF: every tile that could be walked before it was dressed, and is not under a piece, still reached from
  // where he comes in; where one is not, the piece nearest it is taken away again
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
