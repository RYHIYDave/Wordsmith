// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the
// floor, game/act2_dress.ts for its pieces). Behind HIGH_CITY (game/act1.ts), off until he has played it and said yes. Built by
// the main chat (docs/high_city_build.md, "Floor 20"), as floor 19's Keep is laid (game/act2/keep.ts).
//
// HIS DOC, level 20: "The lair floor that ends Act 2: the highest tower of the High City, where the last chapter was taken.";
// "a climb up the tower's spiralling floors (a scriptorium, a bell-less belfry, rooms the fog has filled) to the open top under
// the sky."; "the torn-out last chapter lies open on the tower's top."; its boss "The Moth (his pick). Its floor is the Tower
// Top." The art is the art chat's (docs/mockups/quiet_tower/README.md, his yes, “Yes, that's the Tower (Recommended)”): its two
// grounds art/quiettower.ts (QT_ZONE inside; the top's own), its 25 pieces art/floor20.ts, the High City's 25.
//
// WHAT IT LAYS (the main chat's picks, where his doc and the art leave it open):
//   THE CLIMB, the tower's floors one above another, climbing away from the eye: THE STAIR'S FOOT where he comes in; THE
//     SCRIPTORIUM; landings; A ROOM THE FOG HAS FILLED; THE BELL-LESS BELFRY; another fogged room; a second scriptorium; THE
//     STAIRHEAD last, the tower's stair winding on up from it into the dark.
//   OFF IT: A CELL the fog has filled (the lair: the floor's guardian), a store of blank books (the reward's chests).
//   THE TOP, A PLACE OF ITS OWN on the same map, far off to the side of the climb (as the strongholds' halls are, game/holds):
//     up the stair the screen darkens and he comes up through the trapdoor onto THE TOWER TOP, a round platform 16 tiles
//     across, the parapet the ring of tiles round it, the drop past it with the fog sea below; on its dais in the middle the
//     last chapter on its lectern (the quest). The way back down is the trapdoor, shut while the Moth lives
//     (game/act2/tower_rules.ts). Its ground is the art's top, painted where it lies (render/outdoor.ts groundPainter), the fog
//     sea fading into the dark far off, so the two grounds never meet in sight.
//   ITS PACKS: the floor's own (game/act2_mobs.ts ACT2_OWN[20]); none at the stair's foot, the stairhead or on the top.
//
// Everything is by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act2Pack } from '../act2_mobs';
import type { Act1Dress } from '../act1_dress';
import { walkReach } from './housequiet';
import type { AreaRole, Blob, Laid, Land, Lane } from '../act1_layout';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, HazardSpot, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor. */
export const BUILT = true;

/**
 * WHAT EACH WALKABLE TILE OF THE INSIDE IS: the art chat's QT_ZONE (art/quiettower.ts), its numbers here, for no file of the
 * game's rules imports the art (tests/act2_quiettower.test.ts holds the two the same). The top's tiles are the stair's.
 */
export const TOWER_ZONE = { Stair: 0, Scriptorium: 1, Belfry: 2, Fogged: 3 } as const;

// ---------------------------------------------------------------------------------------------------
// THE TOWER'S MEASURES (tiles)

/** A way between rooms: three tiles wide. */
const CW = 3;
/** Rooms stand at least this far apart: the walls between them this thick. */
const ROOM_GAP = 3;
/** A way between rooms keeps this far from every room and way it does not join. */
const CLEAR = 2;
/** Wall left round the climb, to the map's edge. */
const MARGIN = 8;
/** The way through wanders across the floor no more than this far either side of where it began. */
const BAND = 26;

/**
 * THE TOP: its floor's reach from its middle (16 tiles across, as the art laid it, src/dev/tower_level.ts TOP_R); and how far
 * from its middle its ground is its own (past that, toward the climb, the inside's): the fog sea below it fades into the dark
 * well before, so the two grounds are never seen together (a phone's screen reaches 15 tiles to its side).
 */
export const TOP = { r: 8.2, own: 26, dark: [15, 23] as const } as const;

/** What a room of the tower is. */
export type TowerRole = 'foot' | 'scriptorium' | 'landing' | 'fogged' | 'belfry' | 'stairhead' | 'cell' | 'store' | 'top';

/** Each kind of room's sides, its long one and its short one (each a range, tiles of floor). */
const SIZE: Readonly<Record<Exclude<TowerRole, 'top'>, { long: [number, number]; short: [number, number] }>> = {
  foot: { long: [9, 10], short: [8, 9] },
  scriptorium: { long: [13, 15], short: [10, 12] },
  // (a landing of the stair: small, the way on round it)
  landing: { long: [7, 8], short: [6, 7] },
  fogged: { long: [12, 14], short: [10, 11] },
  belfry: { long: [12, 13], short: [11, 12] },
  stairhead: { long: [9, 10], short: [8, 9] },
  cell: { long: [11, 12], short: [9, 10] },
  store: { long: [8, 9], short: [7, 8] },
};
/** Each kind's floor (QT_ZONE). */
const ZONE_OF: Readonly<Record<TowerRole, number>> = {
  foot: TOWER_ZONE.Stair,
  scriptorium: TOWER_ZONE.Scriptorium,
  landing: TOWER_ZONE.Stair,
  fogged: TOWER_ZONE.Fogged,
  belfry: TOWER_ZONE.Belfry,
  stairhead: TOWER_ZONE.Stair,
  cell: TOWER_ZONE.Fogged,
  store: TOWER_ZONE.Scriptorium,
  top: TOWER_ZONE.Stair,
};

// ---------------------------------------------------------------------------------------------------
// THE PLAN: rooms and the ways between them, as rectangles, checked against each other before anything is laid

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PlanRoom extends Rect {
  role: TowerRole;
  /** Its place along the way through (0 the stair's foot), or -1 off it. */
  path: number;
  /** The room it hangs from (-1 for the stair's foot). */
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

/** A NEW ROOM `w` by `h` set off `host` on its side `side`, a way `len` long between them (as floor 19's: keep.ts attach). */
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
function sidesOf(rng: RNG, role: Exclude<TowerRole, 'top'>, side: Side, alongWay: boolean): { w: number; h: number } {
  const s = SIZE[role];
  const a = rng.int(s.long[0], s.long[1]);
  const b = rng.int(s.short[0], s.short[1]);
  const longAlongX = alongXOf(side) === alongWay;
  return longAlongX ? { w: a, h: b } : { w: b, h: a };
}

/** THE CLIMB, in order: the stair's foot; the scriptorium; the tower's floors, a landing between some; the stairhead. */
function mainRoles(rng: RNG): Exclude<TowerRole, 'top'>[] {
  const out: Exclude<TowerRole, 'top'>[] = ['foot', 'scriptorium', 'landing', 'fogged'];
  if (rng.chance(0.5)) out.push('landing', 'belfry', 'fogged');
  else out.push('belfry', 'landing', 'fogged');
  out.push(rng.chance(0.5) ? 'scriptorium' : 'belfry', 'landing', 'stairhead');
  return out;
}

/**
 * Lay the climb, away from the eye (on toward -x or -y, the floor's way `A`): each room off the last, turning now and then (a
 * stair turning round the tower), kept within the band.
 */
function planMain(rng: RNG, A: 'x' | 'y'): Plan | null {
  const on: Side = A === 'x' ? 1 : 3;
  const across: [Side, Side] = A === 'x' ? [2, 3] : [0, 1];
  const roles = mainRoles(rng);
  const plan: Plan = { rooms: [], joins: [] };
  const e = sidesOf(rng, 'foot', on, rng.chance(0.5));
  plan.rooms.push({ x: 0, y: 0, w: e.w, h: e.h, role: 'foot', path: 0, parent: -1 });
  const mid = (r: Rect): number => (A === 'x' ? r.y + r.h / 2 : r.x + r.w / 2);
  const mid0 = mid(plan.rooms[0]);
  let last: Side = on;
  for (let i = 1; i < roles.length; i++) {
    const role = roles[i];
    let done = false;
    for (let tries = 0; tries < 60 && !done; tries++) {
      const host = plan.rooms.length - 1;
      let side: Side = on;
      if (last === on ? rng.chance(0.6) : rng.chance(0.3)) {
        const off = mid(plan.rooms[host]) - mid0;
        side = off > BAND * 0.55 ? across[1] : off < -BAND * 0.55 ? across[0] : last !== on ? last : rng.pick(across);
      }
      const sz = sidesOf(rng, role, side, rng.chance(0.5));
      const len = role === 'landing' || roles[i - 1] === 'landing' ? rng.int(3, 4) : rng.int(3, 5);
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
function growSide(rng: RNG, plan: Plan, role: Exclude<TowerRole, 'top'>, hosts: number[], tries = 80, len: [number, number] = [3, 5]): number {
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
// LAY FLOOR 20

/** What only floor 20 knows of itself (Land.tower), for its look, its dresser and its rules. */
export interface TowerPlan {
  /** Each room: its rectangle (x0, y0, x1, y1; x1, y1 not in it), what it is, its place along the way (-1 off it), its room id. The top's is its square. */
  rooms: { r: [number, number, number, number]; role: TowerRole; path: number; room: number }[];
  /** The ways between rooms (x0, y0, x1, y1), whether each runs along x, and the two rooms it joins (indices in `rooms`). */
  ways: { r: [number, number, number, number]; alongX: boolean; a: number; b: number }[];
  /** THE TOWER'S STAIR at the stairhead: the middle of its two tiles by two (world), and where he stands as he comes back down. */
  stair: { x: number; y: number; back: { x: number; y: number } };
  /** THE TOP: its middle (world, a tile's middle), its floor's reach; the trapdoor (its tile), and where he stands as he comes up. */
  top: { cx: number; cy: number; r: number; trap: { x: number; y: number }; arrive: { x: number; y: number } };
  /** Where the two grounds part: west of this (world x) the inside's, east of it the top's (render/outdoor.ts groundPainter). */
  split: number;
}

/** Whether world (x, y) is on the tower's top (its own place, past the split). */
export function onTop(T: TowerPlan, x: number, _y: number): boolean {
  return x >= T.split;
}

/** Lay floor 20, or null (this throw of the dice could not lay the tower: game/act2_layout.ts rolls again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x2545f491) >>> 0);
  const A: 'x' | 'y' = rng.chance(0.5) ? 'x' : 'y';
  const plan = planMain(rng, A);
  if (!plan) return null;
  const headI = plan.rooms.findIndex((r) => r.role === 'stairhead');

  // SIDE ROOMS: the cell (the lair) off a fogged room or a landing, a store off any room of the climb but its foot and its head
  const mids = plan.rooms.map((_, i) => i).filter((i) => i > 0 && i < headI);
  if (growSide(rng, plan, 'cell', rng.shuffle(mids.filter((i) => plan.rooms[i].role === 'fogged' || plan.rooms[i].role === 'landing')), 120) < 0) return null;
  growSide(rng, plan, 'store', rng.shuffle([...mids]));

  // THE BOUNDS OF THE CLIMB: everything moved MARGIN in from the map's edge
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
  const dy0 = Math.max(MARGIN, TOP.own - Math.floor((y1 - y0) / 2)) - y0;
  const dx = MARGIN - x0;
  for (const r of [...plan.rooms, ...plan.joins]) {
    r.x += dx;
    r.y += dy0;
  }
  const inX1 = x1 + dx;
  const inMidY = Math.floor((y0 + y1) / 2) + dy0;

  // THE TOP: its middle TOP.own tiles past the split, the split a tile past the climb's walls; the map round it TOP.own
  // tiles each way, so the dark is painted past the screen's edge wherever he stands on it
  const split = inX1 + 2;
  const tcx = split + TOP.own;
  const tcy = Math.max(inMidY, TOP.own);
  const W = tcx + TOP.own;
  const H = Math.max(y1 + dy0 + MARGIN, tcy + TOP.own);
  const cx = tcx + 0.5;
  const cy = tcy + 0.5;

  // THE TILES, AND WHAT EACH IS
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  for (const J of plan.joins) {
    for (let ty = J.y; ty < J.y + J.h; ty++) for (let tx = J.x; tx < J.x + J.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = TOWER_ZONE.Stair;
    }
  }
  for (const r of plan.rooms) {
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = ZONE_OF[r.role];
    }
  }
  const R = Math.ceil(TOP.r);
  for (let ty = tcy - R; ty <= tcy + R; ty++) for (let tx = tcx - R; tx <= tcx + R; tx++) if (Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy) < TOP.r) tiles[ty * W + tx] = T_FLOOR;
  // (the top as a room of the plan, its square round its floor)
  plan.rooms.push({ x: tcx - R, y: tcy - R, w: 2 * R + 1, h: 2 * R + 1, role: 'top', path: plan.rooms.length, parent: headI });

  // THE TOWER'S STAIR at the stairhead: two tiles by two in its far corner from where the way comes in, a tile off its walls
  const head = plan.rooms[headI];
  const inJ = plan.joins.find((J) => J.b === headI)!;
  const inMid = { x: inJ.x + inJ.w / 2, y: inJ.y + inJ.h / 2 };
  const corners: [number, number][] = [
    [head.x + 1, head.y + 1],
    [head.x + head.w - 3, head.y + 1],
    [head.x + 1, head.y + head.h - 3],
    [head.x + head.w - 3, head.y + head.h - 3],
  ];
  // (the farthest corner from the way in, and of two as far the one further from the eye)
  corners.sort((p, q) => Math.hypot(q[0] + 1 - inMid.x, q[1] + 1 - inMid.y) - Math.hypot(p[0] + 1 - inMid.x, p[1] + 1 - inMid.y) || p[0] + p[1] - q[0] - q[1]);
  const [sx, sy] = corners[0];
  const stairMid = { x: sx + 1, y: sy + 1 };
  // (he comes back down to stand before it, toward the stairhead's middle)
  const hm = { x: head.x + head.w / 2, y: head.y + head.h / 2 };
  const toMid = Math.hypot(hm.x - stairMid.x, hm.y - stairMid.y) || 1;
  const back = { x: stairMid.x + ((hm.x - stairMid.x) / toMid) * 2.6, y: stairMid.y + ((hm.y - stairMid.y) / toMid) * 2.6 };

  // THE TRAPDOOR on the top: toward the eye from its middle (he comes up into sight of the lectern, as the art's knight stands)
  const trap = { x: tcx + 3, y: tcy + 5 };
  const arrive = { x: trap.x - 0.4, y: trap.y - 1.2 };

  // ROOMS (the way through first, in walking order, then the side rooms), AND THE LAND'S AREAS
  const order = plan.rooms.map((_, i) => i).sort((a, b) => {
    const pa = plan.rooms[a].path;
    const pb = plan.rooms[b].path;
    return (pa < 0 ? 1e3 + a : pa) - (pb < 0 ? 1e3 + b : pb);
  });
  const idOf: number[] = [];
  order.forEach((pi, id) => (idOf[pi] = id));
  const kindOf = (r: PlanRoom): RoomKind => (r.role === 'foot' ? 'start' : r.role === 'top' ? 'boss' : r.role === 'cell' ? 'guardian' : r.role === 'store' ? 'treasure' : 'normal');
  const rooms: Room[] = order.map((pi, id) => {
    const r = plan.rooms[pi];
    return { id, x: r.x, y: r.y, w: r.w, h: r.h, kind: kindOf(r), path: r.path };
  });
  // (two of the tower's floors hold a yellow pack)
  const eliteable = rooms.filter((r, id) => r.kind === 'normal' && ['scriptorium', 'fogged', 'belfry'].includes(plan.rooms[order[id]].role) && plan.rooms[order[id]].path > 1);
  for (const r of rng.shuffle([...eliteable]).slice(0, 2)) r.kind = 'elite';
  const roleOf = (r: PlanRoom): AreaRole => (r.role === 'foot' ? 'start' : r.role === 'top' ? 'boss' : r.role === 'cell' ? 'lair' : r.path < 0 ? 'side' : 'path');
  const areas = order.map((pi) => {
    const r = plan.rooms[pi];
    const blob: Blob = r.role === 'top' ? { x: cx, y: cy, rx: TOP.r, ry: TOP.r, rot: 0, wob: 0, seed: 0 } : { x: r.x + r.w / 2, y: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, rot: 0, wob: 0, seed: 0 };
    return { blob, room: idOf[pi], role: roleOf(r) };
  });
  const lanes: Lane[] = plan.joins.map((J) => (J.alongX ? { pts: [[J.x, J.y + CW / 2], [J.x + J.w, J.y + CW / 2]] as [number, number][], w: CW } : { pts: [[J.x + CW / 2, J.y], [J.x + CW / 2, J.y + J.h]] as [number, number][], w: CW }));
  const way: [number, number][] = plan.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path).map((r) => (r.role === 'top' ? [cx, cy] : [r.x + r.w / 2, r.y + r.h / 2]));

  // THE START (the stair's foot), THE MOTH (over the top's middle), THE WAY HOME (once it is dead: before the dais, opposite the trapdoor)
  const ent = plan.rooms[0];
  const start = { x: ent.x + Math.floor(ent.w / 2) + 0.5, y: ent.y + Math.floor(ent.h / 2) + 0.5 };
  const boss = { x: cx, y: cy - 2 };
  const exit = { x: cx - 3, y: cy + 3 };

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

  const tower: TowerPlan = {
    rooms: plan.rooms.map((r, pi) => ({ r: [r.x, r.y, r.x + r.w, r.y + r.h], role: r.role, path: r.path, room: idOf[pi] })),
    ways: plan.joins.map((J) => ({ r: [J.x, J.y, J.x + J.w, J.y + J.h], alongX: J.alongX, a: J.a, b: J.b })),
    stair: { ...stairMid, back },
    top: { cx, cy, r: TOP.r, trap, arrive },
    split,
  };
  const land: Land = {
    kind: 'quiettower',
    depth,
    seed,
    way,
    areas,
    lanes,
    holds: [],
    exit,
    arrive: { ...start },
    zones,
    tower,
  };
  return { floor, land };
}

/**
 * THE PACKS, by room: one for every 70 tiles of a room or so, at most three; the lair's its guardian's, in its middle; a
 * store's one; none at the stair's foot, at the stairhead or on the top. None within 10 tiles of the start, none within 5 of another.
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
    if (r.role === 'foot' || r.role === 'stairhead' || r.role === 'top') return;
    const id = idOf[pi];
    const room = f.rooms[id];
    if (r.role === 'cell') {
      put(r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2), id, 'champion', act2Pack(depth, rng, 'champion'));
      return;
    }
    const n = r.role === 'store' || r.role === 'landing' ? 1 : Math.max(1, Math.min(3, Math.round((r.w * r.h) / 70)));
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

/** The art's names of floor 20's pieces (art/floor20.ts quietTowerPieces; tests/act2_quiettower.test.ts holds them to the art's list). */
export const QT_PIECE = {
  chapter: 'the last chapter on its lectern',
  desk: "a copyist's desk",
  stool: "a copyist's stool",
  press: 'a press of blank books',
  quires: 'a chest of blank quires',
  pages: 'a heap of torn pages',
  bellFrame: 'the empty bell frame',
  bellRope: 'a bell rope, hanging',
  clapper: "the bell's clapper, fallen",
  broken: 'the boards broken through',
  stair: "the tower's stair",
  door: 'a door of the tower',
  trapdoor: 'the trapdoor to the top',
  candles: 'guttering candles',
  cocoon: 'a cocoon on the wall',
  tapestry: 'a moth-eaten tapestry',
  banner: "the Order's banner, gone grey",
  window: 'a broken window',
  wing: 'a shed wing',
  silk: 'moth silk, strung from a fallen beam',
  dust: 'grey dust, drifted',
  hushDust: "the Hush's dust",
  mask: 'a fallen mask of the Order',
  merlon: 'a fallen merlon',
  beacon: 'the cold beacon',
} as const;

/** The Hush's dust (the floor's trap) in the fogged rooms: how many in each, how far apart, how far from where he comes in. */
const DUSTS = { most: 2, apart: 3, fromStart: 8 };

/**
 * DRESS FLOOR 20, room by room, as the art chat laid its corner (src/dev/tower_lay.ts): THE SCRIPTORIUM its windows and
 * tapestry and banner on its far walls, presses of blank books against its walls, the copyists' desks in rows and their stools,
 * guttering candles, a chest of blank quires, torn pages, a fallen mask; THE BELFRY the empty bell frame in its middle, its rope
 * hanging by it, its clapper fallen, the boards broken through, a door, windows; A FOGGED ROOM cocoons and a tapestry on its
 * walls, moth silk strung, the Hush's dust (the trap), a shed wing, grey dust; THE LANDINGS AND THE STAIR'S FOOT a door, a
 * window, the Order's banner, candles, torn pages; THE STAIRHEAD the tower's stair going on up; THE TOP the last chapter on its
 * lectern in its middle, the trapdoor (open), the cold beacon, a merlon fallen inward, torn pages, a mask, a shed wing, dust.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  const T = land?.tower;
  if (!land || land.kind !== 'quiettower' || !T) return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x6a09e667) >>> 0);
  const out: Act1Dress = { floor: depth, tiles: [] };
  const inMap = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const floorAt = (x: number, y: number): boolean => inMap(x, y) && f.tiles[y * W + x] === T_FLOOR;
  const wallAt = (x: number, y: number): boolean => !floorAt(x, y);
  const inRect = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
  const isWay = (x: number, y: number): boolean => T.ways.some((w) => inRect(w.r, x, y));

  // WHAT IS KEPT CLEAR (of anything solid): where he comes in, the waypoint, every pack's middle, every doorway (a way's tiles
  // and two round them), before the tower's stair and where he comes up on the top, the top's floor but by its parapet
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) if (inMap(tx, ty) && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 1.6);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (const w of T.ways) for (let y = w.r[1] - 2; y < w.r[3] + 2; y++) for (let x = w.r[0] - 2; x < w.r[2] + 2; x++) if (inMap(x, y)) keep[y * W + x] = 1;
  clearRound(T.stair.back.x, T.stair.back.y, 1.8);
  clearRound(T.top.arrive.x, T.top.arrive.y, 2.2);
  const { cx, cy } = T.top;
  for (let y = Math.floor(cy - T.top.r); y <= cy + T.top.r; y++) for (let x = Math.floor(cx - T.top.r); x <= cx + T.top.r; x++) if (inMap(x, y) && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < T.top.r - 1.6) keep[y * W + x] = 1;

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
  /** Make more tiles of a piece's foot solid (and taken). */
  const alsoUnder = (p: PropInst, list: [number, number][]): void => {
    for (const [a, b] of list) {
      if (!floorAt(a, b)) continue;
      L.walk[b * W + a] = 0;
      taken[b * W + a] = 1;
      if (!foot.has(p)) foot.set(p, []);
      foot.get(p)!.push(b * W + a);
    }
  };
  /** One of the game's breakables (a 'barrel' is the floor's chest of blank quires, an 'urn' its copyist's stool: ACT1_SETS[20]). */
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
    const backT = face === 0 ? [x, y - 1] : [x - 1, y];
    if (!floorAt(x, y) || !wallAt(backT[0], backT[1])) return null;
    for (let k = -wide; k <= wide; k++) if (face === 0 ? !wallAt(x + k, y - 1) || !floorAt(x + k, y) : !wallAt(x - 1, y + k) || !floorAt(x, y + k)) return null;
    for (let k = -wide; k <= wide; k++) if (wallTaken.has(((face === 0 ? y : y + k) * W + (face === 0 ? x + k : x)) * 2 + face)) return null;
    for (let k = -wide; k <= wide; k++) wallTaken.add(((face === 0 ? y : y + k) * W + (face === 0 ? x + k : x)) * 2 + face);
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
  /** Lying on the floor (not solid; never on a doorway): `n` of it. */
  const strew = (name: string, r: readonly number[], n: number, variant: () => number = () => 0): void => {
    let laid = 0;
    for (const [x, y] of tilesIn(r, 1)) {
      if (laid >= n) break;
      if (!whole(x, y) || taken[y * W + x] || isWay(x, y)) continue;
      put(name, x, y, false, variant());
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
  const roomsOf = (...roles: TowerRole[]): TowerPlan['rooms'] => T.rooms.filter((q) => roles.includes(q.role));

  // THE STAIRHEAD: the tower's stair winding on up from its far corner (two tiles by two, solid), the Order's banner, candles
  for (const q of roomsOf('stairhead')) {
    const r = q.r;
    const sx = Math.round(T.stair.x);
    const sy = Math.round(T.stair.y);
    const st = put(QT_PIECE.stair, sx - 1, sy - 1, true, 0, { x: T.stair.x, y: T.stair.y });
    alsoUnder(st, [[sx, sy - 1], [sx - 1, sy], [sx, sy]]);
    hang(QT_PIECE.banner, r, 1);
    hang(QT_PIECE.window, r, 1);
    byWall(QT_PIECE.candles, r, 1, true, () => rng.int(0, 1));
    strew(QT_PIECE.pages, r, 1, () => 1);
  }

  // THE STAIR'S FOOT AND THE LANDINGS: a door of the tower on a far wall (the floors' other rooms, shut), a window, the
  // Order's banner, guttering candles, torn pages, a fallen mask
  for (const q of roomsOf('foot', 'landing')) {
    const r = q.r;
    hang(QT_PIECE.door, r, 1);
    hang(QT_PIECE.window, r, 1);
    if (rng.chance(0.6)) hang(QT_PIECE.banner, r, 1);
    byWall(QT_PIECE.candles, r, 1, true, () => rng.int(0, 1));
    strew(QT_PIECE.pages, r, 1, () => 1);
    if (rng.chance(0.5)) strew(QT_PIECE.mask, r, 1);
  }

  // THE SCRIPTORIUMS (and the store, its books): windows, a tapestry and the banner on the far walls; presses of blank books against
  // the walls; the copyists' desks in rows (along x), a stool before each; candles; a chest of blank quires; torn pages; a mask
  for (const q of roomsOf('scriptorium', 'store')) {
    const r = q.r;
    hang(QT_PIECE.window, r, q.role === 'store' ? 1 : 2);
    hang(QT_PIECE.tapestry, r, 1);
    if (q.role === 'scriptorium') hang(QT_PIECE.banner, r, 1);
    byWall(QT_PIECE.press, r, q.role === 'store' ? 3 : 2, true, (ax) => (ax ? 0 : 1));
    if (q.role === 'scriptorium') {
      // (the desks in rows across the room: every third row, every third tile along it, a stool on the tile before each)
      let n = 0;
      for (let y = r[1] + 2; y < r[3] - 2; y += 3) {
        for (let x = r[0] + 2; x < r[2] - 2; x += 3) {
          if (n >= 6 || !free(x, y, true) || !free(x, y + 1) || isWay(x, y) || isWay(x, y + 1)) continue;
          put(QT_PIECE.desk, x, y, true, 0);
          if (rng.chance(0.8)) breakable('urn', x, y + 1);
          n++;
        }
      }
    }
    byWall(QT_PIECE.candles, r, rng.int(1, 2), true, () => rng.int(0, 1));
    breakByWall('barrel', r, rng.int(1, 2));
    strew(QT_PIECE.pages, r, rng.int(1, 2), () => rng.int(0, 1));
    if (rng.chance(0.5)) strew(QT_PIECE.mask, r, 1);
  }

  // THE BELFRIES: the empty bell frame in the middle (two tiles along x, solid), its rope hanging beside it, its clapper fallen,
  // the boards broken through (not walked on), a door, windows, grey dust
  for (const q of roomsOf('belfry')) {
    const r = q.r;
    const mx = Math.floor((r[0] + r[2]) / 2);
    const my = Math.floor((r[1] + r[3]) / 2);
    let framed = false;
    for (const [x, y] of [[mx, my], [mx - 1, my], [mx, my - 1], [mx + 1, my + 1]] as [number, number][]) {
      if (framed || !free(x - 1, y, true) || !free(x, y, true)) continue;
      const bf = put(QT_PIECE.bellFrame, x - 1, y, true, 0, { x, y: y + 0.5 });
      alsoUnder(bf, [[x, y]]);
      if (free(x - 1, y + 2)) put(QT_PIECE.bellRope, x - 1, y + 2, true);
      framed = true;
    }
    hang(QT_PIECE.door, r, 1);
    hang(QT_PIECE.window, r, 2);
    strew(QT_PIECE.clapper, r, 1);
    strew(QT_PIECE.dust, r, 1);
    for (const [x, y] of tilesIn(r, 2)) {
      if (!free(x, y, true) || isWay(x, y)) continue;
      put(QT_PIECE.broken, x, y, true);
      break;
    }
    breakByWall('barrel', r, 1);
  }

  // THE FOGGED ROOMS AND THE CELL: cocoons and a tapestry on the walls, moth silk strung, the Hush's dust (the floor's trap: its
  // beat as the spike floor's, its cloud darkening words: game.ts), a shed wing, grey dust
  const traps: HazardSpot[] = [];
  for (const q of roomsOf('fogged', 'cell')) {
    const r = q.r;
    hang(QT_PIECE.cocoon, r, 2);
    hang(QT_PIECE.tapestry, r, 1);
    scatter(QT_PIECE.silk, r, rng.int(1, 2), true, true, () => 0, 1);
    strew(QT_PIECE.wing, r, 1);
    strew(QT_PIECE.dust, r, 2);
    if (q.role === 'fogged') {
      let laid = 0;
      for (const [x, y] of tilesIn(r, 2)) {
        if (laid >= DUSTS.most) break;
        if (!free(x, y) || isWay(x, y) || Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < DUSTS.fromStart) continue;
        if (traps.some((t) => Math.hypot(t.x - x, t.y - y) < DUSTS.apart)) continue;
        traps.push({ kind: 'spikes', x, y, w: 1, h: 1, phase: rng.range(0, 2.5) });
        taken[y * W + x] = 1;
        laid++;
      }
    }
    breakByWall('urn', r, 1);
  }

  // THE TOP: the last chapter on its lectern in its middle (the quest: solid), the trapdoor where he comes up (open: its frame 1),
  // the cold beacon and a merlon fallen inward by the parapet, torn pages, a mask, a shed wing, the Moth's dust drifted
  const top = roomsOf('top')[0];
  if (top) {
    const lx = Math.floor(cx);
    const ly = Math.floor(cy);
    put(QT_PIECE.chapter, lx, ly, true);
    put(QT_PIECE.trapdoor, T.top.trap.x, T.top.trap.y, false, 1);
    // (by the parapet: a ring of tiles a step in from the floor's edge, the beacon toward the far side, the merlon toward another)
    const ring: [number, number][] = [];
    for (let y = Math.floor(cy - T.top.r); y <= cy + T.top.r; y++) for (let x = Math.floor(cx - T.top.r); x <= cx + T.top.r; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > T.top.r - 2.2 && d < T.top.r - 1.0 && floorAt(x, y)) ring.push([x, y]);
    }
    const far = (pt: [number, number]): number => pt[0] + pt[1] - cx - cy;
    const farRing = rng.shuffle(ring.filter((p) => far(p) < -4));
    for (const [x, y] of farRing) {
      if (!free(x, y, true)) continue;
      put(QT_PIECE.beacon, x, y, true);
      break;
    }
    for (const [x, y] of rng.shuffle(ring.filter((p) => far(p) < 2))) {
      if (!free(x, y, true) || props.some((p) => p.name === QT_PIECE.beacon && Math.hypot(p.x - x, p.y - y) < 6)) continue;
      put(QT_PIECE.merlon, x, y, true);
      break;
    }
    // (lying about: by the edge, never on the trapdoor or before it)
    const lie = (name: string, n: number, variant: () => number = () => 0): void => {
      let laid = 0;
      for (const [x, y] of rng.shuffle(ring.slice())) {
        if (laid >= n) break;
        if (taken[y * W + x] || Math.hypot(x - T.top.trap.x, y - T.top.trap.y) < 2.5) continue;
        put(name, x, y, false, variant());
        laid++;
      }
    };
    lie(QT_PIECE.pages, 2, () => rng.int(0, 1));
    lie(QT_PIECE.mask, 1);
    lie(QT_PIECE.wing, 1);
    lie(QT_PIECE.dust, 2);
  }

  L.props.push(...props);
  // THE HUSH'S DUST'S BEAT, as the descent's traps (game/traps.ts: a spike floor's)
  if (traps.length) {
    f.hazards = [...(f.hazards ?? []), ...traps];
    L.hazards = makeHazards(f);
  }

  // NOTHING WALLED OFF: every tile that could be walked before it was dressed, and is not under a piece, still reached from
  // where he comes in (the climb) or from where he comes up (the top); where one is not, the piece nearest it is taken away again
  for (let guard = 0; guard < 40; guard++) {
    const seen = walkReach(L.walk, W, H, Math.floor(f.start.y) * W + Math.floor(f.start.x));
    const seenTop = walkReach(L.walk, W, H, Math.floor(T.top.arrive.y) * W + Math.floor(T.top.arrive.x));
    let lost = -1;
    for (let i = 0; i < W * H && lost < 0; i++) if (before[i] === 1 && L.walk[i] === 1 && !seen[i] && !seenTop[i]) lost = i;
    if (lost < 0) break;
    const lx = lost % W;
    const ly = Math.floor(lost / W);
    let best: PropInst | null = null;
    let bd = Infinity;
    for (const [p, list] of foot) {
      if (p.name === QT_PIECE.stair || p.name === QT_PIECE.chapter) continue;
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
