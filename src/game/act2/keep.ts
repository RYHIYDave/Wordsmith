// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the floor,
// game/act2_dress.ts for its pieces). Behind HIGH_CITY (game/act1.ts), off until he has played it and said yes. Built by the main
// chat (docs/high_city_build.md, "Floor 19"), as floor 18's Glass Gallery is laid (game/act2/glassgallery.ts).
//
// HIS DOC, level 19: "The old castle at the hill's crown, where the king lies dying."; "walls and towers: battlements, a
// gatehouse, the barracks and the armoury, the throne hall, and the king's bedchamber at the top of the keep."; its hazards
// "murder holes that drop pitch, and portcullises that slam down to cut a hall in two."; its boss "The King. His floor is the
// Throne Hall." The art is the art chat's (docs/mockups/keep/README.md, his yes, “Yes, that's the Keep (Recommended)”): its
// ground art/keep.ts (KP_ZONE), its 25 pieces art/floor19.ts, the High City's 25 art/high_city_set.ts.
//
// WHAT IT LAYS (the main chat's picks, where his doc and the art leave it open):
//   THE WAY THROUGH, climbing away from the eye: THE BAILEY where he comes in (the keep's great doors open in its far wall, the
//     well); THE GATE PASSAGE under the gatehouse (its murder holes); halls; THE WALL WALK along the battlements (the night sky past
//     them); the armoury; THE THRONE HALL last, the King's (his arena, 19 by 21, entered from the side toward the eye; the throne
//     on its dais in the middle of its far wall, under its cloth of estate, facing him as he comes in; a runner down from it); THE
//     WAY ON beyond it (the door to the Quiet Tower).
//   OFF IT: THE BARRACKS (the knights' lair), THE KING'S BEDCHAMBER (his great bed, the songbird's cushion, the broken songbird:
//     the floor's quest) off the hall before the throne, a store.
//   THE PORTCULLISES: one across a hall here and there (a row of tiles across it, its winch by it), slamming down at a beat to
//     cut it in two a while (game/act2/keep_rules.ts); THE MURDER HOLES in the gate passage (the floor's trap, game/traps.ts).
//   ITS PACKS: the floor's own (game/act2_mobs.ts ACT2_OWN[19]); none in the bailey, the gate passage, the throne hall or beyond.
//
// Everything is by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act2Pack } from '../act2_mobs';
import type { Act1Dress, Act1Tile } from '../act1_dress';
import { walkReach } from './housequiet';
import type { AreaRole, Blob, Laid, Land, Lane } from '../act1_layout';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, HazardSpot, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor. */
export const BUILT = true;

/**
 * WHAT EACH WALKABLE TILE IS: the art chat's KP_ZONE (art/keep.ts), its numbers here, for no file of the game's rules imports the
 * art (tests/act2_keep.test.ts holds the two the same).
 */
export const KEEP_ZONE = { Bailey: 0, Walk: 1, Gate: 2, Hall: 3, Throne: 4, Barracks: 5, Armoury: 6, Chamber: 7 } as const;

// ---------------------------------------------------------------------------------------------------
// THE KEEP'S MEASURES (tiles)

/** A way between rooms: three tiles wide. */
const CW = 3;
/** Rooms stand at least this far apart: the walls between them this thick. */
const ROOM_GAP = 3;
/** A way between rooms keeps this far from every room and way it does not join. */
const CLEAR = 2;
/** Wall left round the keep, to the map's edge. */
const MARGIN = 8;
/** The way through wanders across the floor no more than this far either side of where it began. */
const BAND = 34;

/** What a room of the keep is. */
export type KeepRole = 'bailey' | 'gate' | 'hall' | 'walk' | 'armoury' | 'throne' | 'beyond' | 'barracks' | 'chamber' | 'store';

/** Each kind of room's sides, its long one and its short one (each a range, tiles of floor). */
const SIZE: Readonly<Record<KeepRole, { long: [number, number]; short: [number, number] }>> = {
  bailey: { long: [13, 15], short: [11, 12] },
  // (the gate passage under the gatehouse: long and narrow, its murder holes down its middle)
  gate: { long: [11, 14], short: [5, 5] },
  hall: { long: [15, 21], short: [6, 7] },
  // (the wall walk: five across (a doorway of three needs a tile either side of it), its battlements along its far row, the night
  // sky past them)
  walk: { long: [18, 24], short: [5, 5] },
  armoury: { long: [12, 14], short: [10, 11] },
  // (the King's: a boss arena about 17 by 20, his blows across it)
  throne: { long: [21, 21], short: [19, 19] },
  beyond: { long: [8, 9], short: [7, 8] },
  barracks: { long: [12, 14], short: [10, 11] },
  chamber: { long: [11, 12], short: [9, 10] },
  store: { long: [8, 9], short: [7, 8] },
};
/** Each kind's floor (KP_ZONE). */
const ZONE_OF: Readonly<Record<KeepRole, number>> = {
  bailey: KEEP_ZONE.Bailey,
  gate: KEEP_ZONE.Gate,
  hall: KEEP_ZONE.Hall,
  walk: KEEP_ZONE.Walk,
  armoury: KEEP_ZONE.Armoury,
  throne: KEEP_ZONE.Throne,
  beyond: KEEP_ZONE.Hall,
  barracks: KEEP_ZONE.Barracks,
  chamber: KEEP_ZONE.Chamber,
  store: KEEP_ZONE.Armoury,
};
/** A doorway in the throne hall's far wall keeps its middle this far from the throne's (tiles: two clear between it and the dais). */
const THRONE_CLEAR = 5;
/** Roles that run straight on along the way, entered at their ends (the passage, the walk, beyond: the throne hall is entered from the side toward the eye, planMain). */
const STRAIGHT = new Set<KeepRole>(['gate', 'walk', 'beyond']);

// ---------------------------------------------------------------------------------------------------
// THE PLAN: rooms and the ways between them, as rectangles, checked against each other before anything is laid

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PlanRoom extends Rect {
  role: KeepRole;
  /** Its place along the way through (0 the antechamber), or -1 off it. */
  path: number;
  /** The room it hangs from (-1 for the antechamber). */
  parent: number;
}
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

/** A NEW ROOM `w` by `h` set off `host` on its side `side`, a way `len` long between them (as floor 17's: masque.ts attach). */
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

/** A room's two sides for a step: its long side along the way it is entered (`alongWay`) or across it. */
function sidesOf(rng: RNG, role: KeepRole, side: Side, alongWay: boolean): { w: number; h: number } {
  const s = SIZE[role];
  const a = rng.int(s.long[0], s.long[1]);
  const b = rng.int(s.short[0], s.short[1]);
  const longAlongX = alongXOf(side) === alongWay;
  return longAlongX ? { w: a, h: b } : { w: b, h: a };
}

/** THE WAY THROUGH, in order: the bailey; the gate passage; halls, the wall walk and the armoury between; the throne hall; beyond. */
function mainRoles(rng: RNG): KeepRole[] {
  const out: KeepRole[] = ['bailey', 'gate', 'hall', 'walk', 'hall'];
  if (rng.chance(0.5)) out.push('armoury', 'hall');
  else out.push('hall');
  out.push('throne', 'beyond');
  return out;
}

/**
 * Lay the way through, climbing away from the eye (on toward -x or -y, the floor's way `A`): each room off the last, turning now
 * and then, kept within the band; the gate passage, the wall walk and beyond straight on (entered at their ends), and the step
 * after the passage and the walk too. THE THRONE HALL is always entered through its wall toward the eye (its greatest y), so the
 * throne on its dais in the middle of its far wall faces him as he comes in; the way on beyond it, if it leaves by that far wall,
 * clear of the throne.
 */
function planMain(rng: RNG, A: 'x' | 'y'): Plan | null {
  const on: Side = A === 'x' ? 1 : 3;
  const across: [Side, Side] = A === 'x' ? [2, 3] : [0, 1];
  const roles = mainRoles(rng);
  const plan: Plan = { rooms: [], joins: [] };
  const e = sidesOf(rng, 'bailey', on, rng.chance(0.5));
  plan.rooms.push({ x: 0, y: 0, w: e.w, h: e.h, role: 'bailey', path: 0, parent: -1 });
  const mid = (r: Rect): number => (A === 'x' ? r.y + r.h / 2 : r.x + r.w / 2);
  const mid0 = mid(plan.rooms[0]);
  let last: Side = on;
  for (let i = 1; i < roles.length; i++) {
    const role = roles[i];
    let done = false;
    for (let tries = 0; tries < 60 && !done; tries++) {
      const host = plan.rooms.length - 1;
      let side: Side = role === 'throne' ? 3 : on;
      const prev = roles[i - 1];
      const straight = role === 'throne' || STRAIGHT.has(role) || prev === 'throne';
      if (!straight && (last === on ? rng.chance(0.6) : rng.chance(0.3))) {
        const off = mid(plan.rooms[host]) - mid0;
        side = off > BAND * 0.55 ? across[1] : off < -BAND * 0.55 ? across[0] : last !== on ? last : rng.pick(across);
      }
      // (off the wall walk only by its end or by its side toward the eye: its battlements along its far side, unbroken)
      if (prev === 'walk' && side !== on && side !== (A === 'x' ? 2 : 0)) side = on;
      // (the room before the throne hall not off toward the eye: the hall is entered from that side)
      if (roles[i + 1] === 'throne' && side === 2) side = on;
      const sz = sidesOf(rng, role, side, role === 'hall' || role === 'throne' || STRAIGHT.has(role) || rng.chance(0.5));
      const len = role === 'hall' || roles[i - 1] === 'hall' ? rng.int(3, 5) : ROOM_GAP;
      const got = attach(rng, plan, host, side, sz.w, sz.h, len);
      if (!got) continue;
      // (the throne in the middle of the throne hall's far wall: the way on, if it leaves by that wall, clear of it)
      if (roles[i - 1] === 'throne' && side === 3) {
        const T = plan.rooms[host];
        if (Math.abs(got.join.x + CW / 2 - (T.x + Math.floor(T.w / 2) + 0.5)) < THRONE_CLEAR) continue;
      }
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
function growSide(rng: RNG, plan: Plan, role: KeepRole, hosts: number[], tries = 80, len: [number, number] = [3, 6]): number {
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
// LAY FLOOR 19

/** A portcullis: a row of tiles across a hall (x, y its first; along x or y; `n` long), its winch's tile beside it. */
export interface PortcullisAt {
  x: number;
  y: number;
  alongX: boolean;
  n: number;
  winch: { x: number; y: number };
}

/** What only floor 19 knows of itself (Land.keep), for its dresser and its rules. */
export interface KeepPlan {
  /** Each room: its rectangle (x0, y0, x1, y1; x1, y1 not in it), what it is, its place along the way (-1 off it), its room id. */
  rooms: { r: [number, number, number, number]; role: KeepRole; path: number; room: number }[];
  /** The ways between rooms (x0, y0, x1, y1), whether each runs along x, and the two rooms it joins (indices in `rooms`). */
  ways: { r: [number, number, number, number]; alongX: boolean; a: number; b: number }[];
  /** The throne: the middle of its dais (world), against the throne hall's far wall (its least y), facing +y. */
  throne: { x: number; y: number };
  /** The portcullises across the halls (game/act2/keep_rules.ts). */
  portcullises: PortcullisAt[];
}

/** Lay floor 19, or null (this throw of the dice could not lay the keep: game/act2_layout.ts rolls again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x9b05688c) >>> 0);
  const A: 'x' | 'y' = rng.chance(0.5) ? 'x' : 'y';
  const plan = planMain(rng, A);
  if (!plan) return null;
  const throneI = plan.rooms.findIndex((r) => r.role === 'throne');

  // SIDE ROOMS: the barracks (the knights' lair) off a hall, the bedchamber off the hall before the throne, a store
  const halls = plan.rooms.map((_, i) => i).filter((i) => plan.rooms[i].role === 'hall' && i < throneI);
  const lastHall = halls[halls.length - 1];
  if (growSide(rng, plan, 'chamber', [lastHall], 120) < 0) return null;
  if (growSide(rng, plan, 'barracks', rng.shuffle(halls.filter((i) => i !== lastHall))) < 0) return null;
  const anyHost = plan.rooms.map((_, i) => i).filter((i) => i > 0 && i < throneI && plan.rooms[i].role !== 'gate' && plan.rooms[i].role !== 'walk');
  growSide(rng, plan, 'store', rng.shuffle([...anyHost]));

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

  // THE TILES, AND WHAT EACH IS: a way the floor of a hall (the gate passage's where it opens off it; the walk's its own)
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  for (const J of plan.joins) {
    const a = plan.rooms[J.a].role;
    const b = plan.rooms[J.b].role;
    const z = a === 'gate' || b === 'gate' ? KEEP_ZONE.Gate : a === 'walk' || b === 'walk' ? KEEP_ZONE.Walk : KEEP_ZONE.Hall;
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
  const isWay = (tx: number, ty: number, pad = 0): boolean => plan.joins.some((J) => tx >= J.x - pad && tx < J.x + J.w + pad && ty >= J.y - pad && ty < J.y + J.h + pad);

  // THE PORTCULLISES: across a hall (each, more often than not), a row of tiles across it, three or more from either end and clear
  // of every doorway; its winch on the hall's far wall beside it
  const portcullises: PortcullisAt[] = [];
  const pr = new RNG((seed ^ 0x3c6ef372) >>> 0);
  for (const r of plan.rooms) {
    if (r.role !== 'hall' || !pr.chance(0.75)) continue;
    const alongX = r.w >= r.h;
    const len = alongX ? r.w : r.h;
    for (let tries = 0; tries < 20; tries++) {
      const a = pr.int(4, len - 5);
      const cells: [number, number][] = [];
      for (let k = 0; k < (alongX ? r.h : r.w); k++) cells.push(alongX ? [r.x + a, r.y + k] : [r.x + k, r.y + a]);
      if (cells.some(([tx, ty]) => isWay(tx, ty, 2) || isWay(tx - 1, ty, 0) || isWay(tx + 1, ty, 0) || isWay(tx, ty - 1, 0) || isWay(tx, ty + 1, 0))) continue;
      // (the row runs across the hall: along y for a hall along x; its winch against the hall's far wall two tiles past it)
      const winch = alongX ? { x: r.x + a + 2, y: r.y } : { x: r.x, y: r.y + a + 2 };
      portcullises.push({ x: cells[0][0], y: cells[0][1], alongX: !alongX, n: cells.length, winch });
      break;
    }
  }

  // ROOMS (the way through first, in walking order, then the side rooms), AND THE LAND'S AREAS
  const order = plan.rooms.map((_, i) => i).sort((a, b) => {
    const pa = plan.rooms[a].path;
    const pb = plan.rooms[b].path;
    return (pa < 0 ? 1e3 + a : pa) - (pb < 0 ? 1e3 + b : pb);
  });
  const idOf: number[] = [];
  order.forEach((pi, id) => (idOf[pi] = id));
  const kindOf = (r: PlanRoom): RoomKind => (r.role === 'bailey' ? 'start' : r.role === 'throne' ? 'boss' : r.role === 'barracks' ? 'guardian' : r.role === 'store' ? 'treasure' : 'normal');
  const rooms: Room[] = order.map((pi, id) => {
    const r = plan.rooms[pi];
    return { id, x: r.x, y: r.y, w: r.w, h: r.h, kind: kindOf(r), path: r.path };
  });
  // (two of the halls, the walk and the armoury hold a yellow pack)
  const eliteable = rooms.filter((r, id) => r.kind === 'normal' && ['hall', 'walk', 'armoury'].includes(plan.rooms[order[id]].role) && plan.rooms[order[id]].path > 2);
  for (const r of rng.shuffle([...eliteable]).slice(0, 2)) r.kind = 'elite';
  const roleOf = (r: PlanRoom): AreaRole => (r.role === 'bailey' ? 'start' : r.role === 'throne' ? 'boss' : r.role === 'barracks' ? 'lair' : r.path < 0 ? 'side' : 'path');
  const areas = order.map((pi) => {
    const r = plan.rooms[pi];
    const blob: Blob = { x: r.x + r.w / 2, y: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, rot: 0, wob: 0, seed: 0 };
    return { blob, room: idOf[pi], role: roleOf(r) };
  });
  const lanes: Lane[] = plan.joins.map((J) => (J.alongX ? { pts: [[J.x, J.y + CW / 2], [J.x + J.w, J.y + CW / 2]] as [number, number][], w: CW } : { pts: [[J.x + CW / 2, J.y], [J.x + CW / 2, J.y + J.h]] as [number, number][], w: CW }));
  const way: [number, number][] = plan.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path).map((r) => [r.x + r.w / 2, r.y + r.h / 2]);

  // THE START, THE THRONE, THE WAY ON
  const ent = plan.rooms[0];
  const start = { x: ent.x + Math.floor(ent.w / 2) + 0.5, y: ent.y + Math.floor(ent.h / 2) + 1.5 };
  const T = plan.rooms[throneI];
  // (the throne on its dais in the middle of the hall's far wall, its least y, facing +y: three tiles across, two deep, its middle
  // 1.4 out from the wall, as the art chat stood it in its corner, src/dev/keep_level.ts K_THRONE)
  const throne = { x: T.x + Math.floor(T.w / 2) + 0.5, y: T.y + 1.4 };
  // (the King waits a little before his throne)
  const boss = { x: throne.x, y: T.y + Math.floor(T.h / 2) + 0.5 };
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
  const vr = new RNG((seed ^ 0x510e527f) >>> 0);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);
  floor.packs = packsOf(new RNG((seed ^ 0x1f83d9ab) >>> 0), floor, plan, idOf, depth);
  floor.props = storesOf(new RNG((seed ^ 0x5be0cd19) >>> 0), floor, plan);

  const keep: KeepPlan = {
    rooms: plan.rooms.map((r, pi) => ({ r: [r.x, r.y, r.x + r.w, r.y + r.h], role: r.role, path: r.path, room: idOf[pi] })),
    ways: plan.joins.map((J) => ({ r: [J.x, J.y, J.x + J.w, J.y + J.h], alongX: J.alongX, a: J.a, b: J.b })),
    throne,
    portcullises,
  };
  const land: Land = {
    kind: 'keep',
    depth,
    seed,
    way,
    areas,
    lanes,
    holds: [],
    exit,
    arrive: { ...start },
    zones,
    keep,
  };
  return { floor, land };
}

/**
 * THE PACKS, by room: one for every 70 tiles of a room or so, at most three; the lair's its guardian's, in its middle; a
 * store's one; none in the bailey, the throne hall or beyond it. None within 10 tiles of the start, none within 5 of another.
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
    // (none where he comes in, in the gate passage (its murder holes are its danger), in the throne hall or beyond it)
    if (r.role === 'bailey' || r.role === 'gate' || r.role === 'throne' || r.role === 'beyond') return;
    const id = idOf[pi];
    const room = f.rooms[id];
    if (r.role === 'barracks') {
      put(r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2), id, 'champion', act2Pack(depth, rng, 'champion'));
      return;
    }
    const n = r.role === 'store' ? 1 : Math.max(1, Math.min(3, Math.round((r.w * r.h) / 70)));
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 40; tries++) {
        const x = rng.int(r.x + 1, r.x + r.w - 2);
        const y = rng.int(r.y + 1, r.y + r.h - 2);
        if (!free(x, y)) continue;
        if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 10) continue;
        if (used.some((u) => Math.hypot(u.x - x - 0.5, u.y - y - 0.5) < 5)) continue;
        const tier: PackSpot['tier'] = room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        put(x, y, id, tier, act2Pack(depth, rng, tier));
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

/** The art's names of floor 19's pieces (art/floor19.ts keepPieces; tests/act2_keep.test.ts holds them to the art's list). */
export const KP_PIECE = {
  throne: 'the throne on its dais',
  cloth: 'the cloth of estate',
  runner: 'the royal runner',
  banner: 'a royal banner',
  torch: 'a torch in its sconce',
  brazier: 'a brazier',
  slit: 'an arrow slit',
  battlements: 'battlements',
  portcullis: 'a portcullis',
  winch: "the portcullis's winch",
  murderHole: 'a murder hole',
  cauldron: 'a cauldron of pitch',
  armour: 'a suit of armour on its stand',
  weaponRack: 'a weapon rack',
  crossbowRack: 'a crossbow rack',
  anvil: "an armourer's anvil",
  bunks: 'barracks bunks',
  barrels: 'barrels',
  table: 'a long table',
  warTable: 'the war table, its map',
  well: 'the castle well',
  bed: "the king's great bed",
  cushion: "the songbird's silk cushion",
  songbird: 'the clockwork songbird, broken',
  doors: "the keep's great doors",
} as const;

/** A portcullis tile's frames (art/floor19.ts): five along x, then five along y: up, the warning, falling, slammed, down. */
export const PORTCULLIS_FRAME = { up: 0, warn: 1, falling: 2, slammed: 3, down: 4, perWay: 5 } as const;

/** The murder holes in the gate passage: how many, how far apart, how far from where he comes in (tiles). */
const HOLES = { most: 3, apart: 2.5, fromStart: 6 };

/**
 * DRESS FLOOR 19, room by room, as the art chat laid its corner (src/dev/keep_lay.ts): THE BAILEY the great doors on its far wall,
 * the well, a crossbow rack, braziers; THE GATE PASSAGE its murder holes down its middle (the trap), torches; THE HALLS banners and
 * torches down the walls, suits of armour, the runner down the middle, a portcullis across one and its winch; THE WALL WALK its
 * battlements along its far row (the sky past them), a cauldron of pitch; THE ARMOURY racks of weapons and crossbows, the anvil,
 * armour; THE BARRACKS bunks, a long table, barrels; THE BEDCHAMBER the great bed, the songbird's cushion and the broken
 * songbird (the quest); THE THRONE HALL the throne on its dais under its cloth of estate, braziers either side of it, banners and
 * torches, the runner down from it, empty armour in its far corners, its floor kept clear for him.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  const K = land?.keep;
  if (!land || land.kind !== 'keep' || !K) return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x6a09e667) >>> 0);
  const out: Act1Dress = { floor: depth, tiles: [] };
  const inMap = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const floorAt = (x: number, y: number): boolean => inMap(x, y) && f.tiles[y * W + x] === T_FLOOR;
  const wallAt = (x: number, y: number): boolean => !floorAt(x, y);
  const inRect = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
  const isWay = (x: number, y: number): boolean => K.ways.some((w) => inRect(w.r, x, y));
  const inPortcullis = (x: number, y: number, pad = 0): boolean =>
    K.portcullises.some((p) => (p.alongX ? y >= p.y - pad && y <= p.y + pad && x >= p.x && x < p.x + p.n : x >= p.x - pad && x <= p.x + pad && y >= p.y && y < p.y + p.n));

  // WHAT IS KEPT CLEAR (of anything solid): where he comes in, the waypoint, the way on, every pack's middle, every doorway (a
  // way's tiles and two round them), every portcullis's row and a tile either side of it, the throne hall's floor but its edge
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) if (inMap(tx, ty) && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3.2);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (const w of K.ways) for (let y = w.r[1] - 2; y < w.r[3] + 2; y++) for (let x = w.r[0] - 2; x < w.r[2] + 2; x++) if (inMap(x, y)) keep[y * W + x] = 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inPortcullis(x, y, 1)) keep[y * W + x] = 1;

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
  /** One of the game's breakables (a 'barrel' is the floor's barrels, an 'urn' its suit of armour on its stand: ACT1_SETS[19]). */
  const breakable = (kind: 'barrel' | 'urn', x: number, y: number): void => {
    const p: PropInst = { kind, tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: true, state: 0, variant: 0 };
    props.push(p);
    taken[y * W + x] = 1;
    L.walk[y * W + x] = 0;
    foot.set(p, [y * W + x]);
  };
  const wallTaken = new Set<number>();
  /** A piece on a far wall over floor tile (x, y): face 0 the wall along x behind it (at y - 1), face 1 along y (at x - 1). */
  const onWall = (name: string, x: number, y: number, face: 0 | 1, frame = 0, wide = 1): PropInst | null => {
    const back = face === 0 ? [x, y - 1] : [x - 1, y];
    if (!floorAt(x, y) || !wallAt(back[0], back[1])) return null;
    for (let k = -wide; k <= wide; k++) if (face === 0 ? !wallAt(x + k, y - 1) || !floorAt(x + k, y) : !wallAt(x - 1, y + k) || !floorAt(x, y + k)) return null;
    for (let k = -wide; k <= wide; k++) if (wallTaken.has(((face === 0 ? y : y + k) * W + (face === 0 ? x + k : x)) * 2 + face)) return null;
    wallTaken.add((y * W + x) * 2 + face);
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: face === 0 ? x + 0.5 : x, y: face === 0 ? y : y + 0.5, solid: false, state: 0, variant: face | (frame << 1) };
    props.push(p);
    return p;
  };
  /** A room's far-wall tiles in order along it (its row along x at its least y, face 0; its column along y at its least x, face 1). */
  const farWall = (r: readonly number[]): [number, number, 0 | 1][] => [
    ...Array.from({ length: r[2] - r[0] - 2 }, (_, k) => [r[0] + 1 + k, r[1], 0] as [number, number, 0 | 1]),
    ...Array.from({ length: r[3] - r[1] - 2 }, (_, k) => [r[0], r[1] + 1 + k, 1] as [number, number, 0 | 1]),
  ];
  const hang = (name: string, r: readonly number[], n: number, frames = 1): void => {
    let laid = 0;
    for (const [x, y, face] of rng.shuffle(farWall(r))) {
      if (laid >= n) break;
      if (onWall(name, x, y, face, rng.int(0, frames - 1))) laid++;
    }
  };
  const tilesIn = (r: readonly number[], inset = 1): [number, number][] => {
    const list: [number, number][] = [];
    for (let ty = r[1] + inset; ty < r[3] - inset; ty++) for (let tx = r[0] + inset; tx < r[2] - inset; tx++) list.push([tx, ty]);
    return rng.shuffle(list);
  };
  const scatter = (name: string, r: readonly number[], n: number, solid: boolean, ring: boolean, variant: () => number = () => 0, inset = 1): void => {
    let laid = 0;
    for (const [x, y] of tilesIn(r, inset)) {
      if (laid >= n) break;
      if (!free(x, y, ring)) continue;
      put(name, x, y, solid, variant());
      laid++;
    }
  };
  /** A room's edge tiles, shuffled, each with whether its wall runs along x. */
  const edgeOf = (r: readonly number[]): [number, number, boolean][] => {
    const edge: [number, number, boolean][] = [];
    for (let x = r[0] + 1; x < r[2] - 1; x++) edge.push([x, r[1], true], [x, r[3] - 1, true]);
    for (let y = r[1] + 1; y < r[3] - 1; y++) edge.push([r[0], y, false], [r[2] - 1, y, false]);
    return rng.shuffle(edge);
  };
  /** Lay `name` against the room's walls (on its edge tiles), `n` of it; `alongOf`: its variant for the wall it stands along. */
  const byWall = (name: string, r: readonly number[], n: number, solid: boolean, alongOf: (alongX: boolean) => number = () => 0): void => {
    let laid = 0;
    for (const [x, y, ax] of edgeOf(r)) {
      if (laid >= n) break;
      if (!free(x, y, false) || isWay(x, y)) continue;
      put(name, x, y, solid, alongOf(ax));
      laid++;
    }
  };
  /** The game's breakables against the room's walls, `n` of them. */
  const breakByWall = (kind: 'barrel' | 'urn', r: readonly number[], n: number): void => {
    let laid = 0;
    for (const [x, y] of edgeOf(r)) {
      if (laid >= n) break;
      if (!free(x, y, false) || isWay(x, y)) continue;
      breakable(kind, x, y);
      laid++;
    }
  };
  const roomsOf = (role: KeepRole): KeepPlan['rooms'] => K.rooms.filter((q) => q.role === role);
  /** The runner down a room's middle along its length, a tile at a time (whole, or torn here and there). */
  const runnerDown = (r: readonly number[], from = 0): void => {
    const alongX = r[2] - r[0] >= r[3] - r[1];
    const cx = Math.floor((r[0] + r[2]) / 2);
    const cy = Math.floor((r[1] + r[3]) / 2);
    const len = alongX ? r[2] - r[0] : r[3] - r[1];
    for (let k = from; k < len; k++) {
      const [x, y] = alongX ? [r[0] + k, cy] : [cx, r[1] + k];
      if (!floorAt(x, y) || taken[y * W + x] || inPortcullis(x, y)) continue;
      put(KP_PIECE.runner, x, y, false, (alongX ? 0 : 2) + (rng.chance(0.12) ? 1 : 0));
    }
  };

  // THE THRONE HALL: the throne on its dais in the middle of its far wall under its cloth of estate, braziers either side, banners
  // and torches down the walls, the runner down from the dais, empty armour in its far corners; its floor kept clear for him
  const hall = roomsOf('throne')[0];
  if (hall) {
    const r = hall.r;
    const tx = Math.floor(K.throne.x);
    // (the dais: three tiles by two, its foot's middle at the throne's place; its tiles solid)
    const dais = put(KP_PIECE.throne, tx, r[1] + 1, true, 0, { x: K.throne.x, y: K.throne.y });
    for (const [a, b] of [[tx - 1, r[1]], [tx, r[1]], [tx + 1, r[1]], [tx - 1, r[1] + 1], [tx + 1, r[1] + 1]] as [number, number][]) {
      if (!floorAt(a, b)) continue;
      L.walk[b * W + a] = 0;
      taken[b * W + a] = 1;
      foot.get(dais)!.push(b * W + a);
    }
    onWall(KP_PIECE.cloth, tx, r[1], 0, 0, 0);
    for (const s of [-2, 2]) if (free(tx + s, r[1] + 1)) put(KP_PIECE.brazier, tx + s, r[1] + 1, true, rng.int(0, 2));
    for (let x = r[0] + 2; x < r[2] - 2; x += 4) if (Math.abs(x - tx) > 3) onWall(rng.chance(0.6) ? KP_PIECE.banner : KP_PIECE.torch, x, r[1], 0, rng.int(0, 2));
    for (let y = r[1] + 3; y < r[3] - 2; y += 4) onWall(rng.chance(0.5) ? KP_PIECE.banner : KP_PIECE.torch, r[0], y, 1, rng.int(0, 2));
    for (let y = r[1] + 2; y < r[3]; y++) {
      if (!floorAt(tx, y) || taken[y * W + tx]) continue;
      put(KP_PIECE.runner, tx, y, false, 2 + (rng.chance(0.12) ? 1 : 0));
    }
    for (const [x, y] of [[r[0] + 1, r[1] + 1], [r[2] - 2, r[1] + 1]] as [number, number][]) if (free(x, y)) breakable('urn', x, y);
    for (let ty = r[1] + 2; ty < r[3] - 2; ty++) for (let tx2 = r[0] + 2; tx2 < r[2] - 2; tx2++) keep[ty * W + tx2] = 1;
  }

  // THE BAILEY: the keep's great doors in its far wall where the way in is (to the gate passage), swung open on the dark, as the
  // art chat hung them in its corner; the well, a crossbow rack, braziers, barrels, arrow slits
  for (const q of roomsOf('bailey')) {
    const r = q.r;
    const bi = K.rooms.indexOf(q);
    const out = K.ways.find((w) => w.a === bi);
    if (out) {
      // (the way leaves by the far wall: along x at the bailey's least y (face 0), or along y at its least x (face 1))
      const face: 0 | 1 = out.r[3] <= r[1] ? 0 : 1;
      const x = face === 0 ? out.r[0] + Math.floor((out.r[2] - out.r[0]) / 2) : r[0];
      const y = face === 0 ? r[1] : out.r[1] + Math.floor((out.r[3] - out.r[1]) / 2);
      props.push({ kind: 'piece', name: KP_PIECE.doors, tx: x, ty: y, x: face === 0 ? x + 0.5 : x, y: face === 0 ? y : y + 0.5, solid: false, state: 0, variant: face | (1 << 1) });
      for (let k = -3; k <= 3; k++) wallTaken.add(((face === 0 ? y : y + k) * W + (face === 0 ? x + k : x)) * 2 + face);
    }
    hang(KP_PIECE.slit, r, 3);
    scatter(KP_PIECE.well, r, 1, true, true, () => 0, 2);
    byWall(KP_PIECE.crossbowRack, r, 1, true, (ax) => (ax ? 0 : 1));
    byWall(KP_PIECE.brazier, r, 2, true, () => rng.int(0, 2));
    if (rng.chance(0.6)) breakByWall('barrel', r, 1);
  }

  // THE GATE PASSAGE: its murder holes down its middle (the floor's trap: game/traps.ts, the spike floor's beat; the art's 'a murder
  // hole': still, the warning, pouring, its pool); torches
  const traps: HazardSpot[] = [];
  for (const q of roomsOf('gate')) {
    const r = q.r;
    const alongX = r[2] - r[0] >= r[3] - r[1];
    const cx = Math.floor((r[0] + r[2]) / 2);
    const cy = Math.floor((r[1] + r[3]) / 2);
    const len = alongX ? r[2] - r[0] : r[3] - r[1];
    let laid = 0;
    for (let k = 2; k < len - 2 && laid < HOLES.most; k += 3) {
      const [x, y] = alongX ? [r[0] + k, cy] : [cx, r[1] + k];
      if (!free(x, y) || Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < HOLES.fromStart) continue;
      if (traps.some((t) => Math.hypot(t.x - x, t.y - y) < HOLES.apart)) continue;
      traps.push({ kind: 'spikes', x, y, w: 1, h: 1, phase: rng.range(0, 2.5) });
      taken[y * W + x] = 1;
      laid++;
    }
    hang(KP_PIECE.torch, r, 2, 3);
  }

  // THE PORTCULLISES, before the halls are dressed: each a row of tiles across its hall, up to begin with (its frame 0, along x or
  // y; game/act2/keep_rules.ts drops it), its winch against the wall beside it
  for (const p of K.portcullises) {
    for (let k = 0; k < p.n; k++) {
      const x = p.alongX ? p.x + k : p.x;
      const y = p.alongX ? p.y : p.y + k;
      put(KP_PIECE.portcullis, x, y, false, (p.alongX ? 0 : PORTCULLIS_FRAME.perWay) + PORTCULLIS_FRAME.up);
    }
    if (free(p.winch.x, p.winch.y)) put(KP_PIECE.winch, p.winch.x, p.winch.y, true);
  }

  // THE HALLS: banners and torches down the walls, suits of armour, the runner
  for (const q of roomsOf('hall')) {
    const r = q.r;
    hang(KP_PIECE.banner, r, 2);
    hang(KP_PIECE.torch, r, 2, 3);
    if (rng.chance(0.5)) hang(KP_PIECE.slit, r, 1);
    runnerDown(r);
    breakByWall('urn', r, rng.int(1, 2));
    if (rng.chance(0.4)) byWall(KP_PIECE.brazier, r, 1, true, () => rng.int(0, 2));
  }

  // THE WALL WALK: its battlements along its far row (the parapet on the tiles' far edge, the night sky past it), a cauldron of
  // pitch, the crossbowmen's rack
  for (const q of roomsOf('walk')) {
    const r = q.r;
    const alongX = r[2] - r[0] >= r[3] - r[1];
    const len = alongX ? r[2] - r[0] : r[3] - r[1];
    for (let k = 0; k < len; k++) {
      const [x, y] = alongX ? [r[0] + k, r[1]] : [r[0], r[1] + k];
      if (!floorAt(x, y) || isWay(x, y) || taken[y * W + x]) continue;
      put(KP_PIECE.battlements, x, y, true, alongX ? 0 : 1);
    }
    const mid = Math.floor(len / 2) + rng.int(-3, 3);
    const [cx, cy] = alongX ? [r[0] + mid, r[1] + 1] : [r[0] + 1, r[1] + mid];
    if (free(cx, cy)) put(KP_PIECE.cauldron, cx, cy, true, rng.int(0, 2));
  }

  // THE ARMOURY AND THE STORE: racks of weapons and crossbows along the walls, the anvil, armour, the war table
  for (const q of [...roomsOf('armoury'), ...roomsOf('store')]) {
    const r = q.r;
    hang(KP_PIECE.torch, r, 2, 3);
    byWall(KP_PIECE.weaponRack, r, 2, true, (ax) => (ax ? 0 : 1));
    byWall(KP_PIECE.crossbowRack, r, 1, true, (ax) => (ax ? 0 : 1));
    scatter(KP_PIECE.anvil, r, 1, true, true, () => 0, 2);
    breakByWall('urn', r, rng.int(1, 2));
    if (q.role === 'armoury') scatter(KP_PIECE.warTable, r, 1, true, true, () => 0, 2);
  }

  // THE BARRACKS: bunks along the walls, a long table, barrels
  for (const q of roomsOf('barracks')) {
    const r = q.r;
    hang(KP_PIECE.torch, r, 2, 3);
    byWall(KP_PIECE.bunks, r, rng.int(2, 3), true, (ax) => (ax ? 0 : 1));
    scatter(KP_PIECE.table, r, 1, true, true, () => rng.int(0, 1), 2);
    breakByWall('barrel', r, rng.int(1, 2));
  }

  // THE BEDCHAMBER: his great bed against its far wall, the songbird's cushion by it, the broken songbird on the boards (the quest)
  for (const q of roomsOf('chamber')) {
    const r = q.r;
    hang(KP_PIECE.banner, r, 1);
    hang(KP_PIECE.torch, r, 1, 3);
    // (the bed against the far wall, toward its middle, where it and the cushion beside it are free; the songbird on the boards
    // before them)
    const cx = Math.floor((r[0] + r[2]) / 2);
    const by = r[1] + 1;
    let bed: [number, number] | null = null;
    for (const [d, e] of Array.from({ length: r[2] - r[0] }, (_, k) => (k % 2 ? -1 : 1) * Math.ceil(k / 2)).flatMap((d) => [[d, 0], [d, 1]] as [number, number][]).sort((a, b) => a[1] - b[1])) {
      if (!free(cx + d, by + e) || !free(cx + d + 2, by + e)) continue;
      bed = [cx + d, by + e];
      break;
    }
    if (bed) {
      put(KP_PIECE.bed, bed[0], bed[1], true);
      put(KP_PIECE.cushion, bed[0] + 2, bed[1], true);
    }
    const [sx, sy] = bed ?? [cx, by];
    for (const [x, y] of [[sx + 2, sy + 2], [sx + 1, sy + 3], [sx - 2, sy + 2], [sx, sy + 4], [sx + 3, sy + 3]] as [number, number][]) {
      if (!free(x, y, true)) continue;
      put(KP_PIECE.songbird, x, y, true);
      break;
    }
  }

  L.props.push(...props);
  // THE MURDER HOLES' BEAT, as the descent's traps (game/traps.ts: a spike floor's)
  if (traps.length) {
    f.hazards = [...(f.hazards ?? []), ...traps];
    L.hazards = makeHazards(f);
  }

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
