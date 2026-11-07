// THE STOKER'S ARENA, OFF FLOOR 3 (the quest line, game/quests15.ts; his rules, game/act1_rules/stoker.ts). His words, 6 Nov 2026,
// 16:29 (Eastern): “The stoker and his area is done.  I’d like a little hallway leading to his arena tho.  Not a door into it like a
// stronghold.” So, while the furnace burns, floor 3 is laid with a room of its own for him: an ARENA, square and clear, reached by a
// short HALLWAY out of one of the floor's rooms, open at both ends (no door, no gate: it is cut after the doors are laid). The
// furnace stands in a back wall of it (a wall the eye sees), the forge crank on the floor beside it; he stands in its middle.
//
// The arena is laid only where the floor has nothing (void) for it and its hallway, a tile of nothing round both; out of a room of
// the floor's own (not its first, not the boss's hall, not a cell block, a cell, a court or a gated room), through a wall of it with
// floor at its own height behind, and no doorway near. The rooms farthest from the way in and from the boss's hall are tried first.
// Where none will take it (none has been found on any floor yet: tests/furnace_arena.test.ts), the quest's room is one of the
// floor's own, as before.

import { doorTiles } from './doors';
import type { DoorSpot, Floor, Room } from './types';
import { T_FLOOR, T_VOID, T_WALL } from './types';

/** The arena's floor (tiles a side), the hallway's length (tiles of it between the room's wall and the arena's) and width. */
export const ARENA = { side: 11, hall: 4, wide: 3 } as const;
/** The furnace: how many tiles of its wall it stands in (art/stoker_room.ts FURNACE, 128 along: four). */
export const FURNACE_TILES = 4;
/** The crank before the wall, beside the furnace's end (tiles along the wall past its end, and out from the wall: the art's film, CRANK_AT). */
export const CRANK_BY = { along: 1.3, out: 0.9 } as const;

export interface Arena {
  /** Its floor, as a room is: its tiles x .. x + w - 1, y .. y + h - 1. */
  room: { x: number; y: number; w: number; h: number };
  /** The hallway's floor (the opened wall of the room it comes out of, the hallway, the opened wall of the arena). */
  hall: { x: number; y: number; w: number; h: number };
  /** The room it comes out of (Room.id). */
  from: number;
  /** The way the hallway runs from that room (a step along x or y). */
  dx: number;
  dy: number;
  /** The furnace in its wall, as a doorway is placed (game/doors.ts: alongX, a, plane, out): drawn as a gate's strips are. */
  furnace: DoorSpot;
  /** Where the crank stands, and where he stands (tiles). */
  crank: { x: number; y: number };
  keeper: { x: number; y: number };
}

const wanted = (r: Room): boolean => r.kind !== 'start' && r.kind !== 'boss' && !r.block && !r.cell && !r.court && !r.gated && !r.locks && !r.nook;

/** Lay the arena and its hallway into the floor; null where there is no room for them (the floor is left as it was). */
export function carveArena(f: Floor): Arena | null {
  const boss = f.rooms.find((r) => r.kind === 'boss');
  const start = f.rooms.find((r) => r.kind === 'start');
  const mid = (r: Room): [number, number] => [r.x + r.w / 2, r.y + r.h / 2];
  const far = (r: Room): number => {
    const [x, y] = mid(r);
    const d = (o: Room | undefined): number => (o ? Math.hypot(x - mid(o)[0], y - mid(o)[1]) : 99);
    return Math.min(d(start), d(boss));
  };
  const rooms = f.rooms.filter(wanted).sort((a, b) => far(b) - far(a));
  for (const r of rooms) {
    // (out through a back wall first: the arena then lies farther from the eye, its far wall, where the furnace stands, seen)
    for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0], [0, 1]] as const) {
      const a = tryArena(f, r, dx, dy);
      if (a) return a;
    }
  }
  return null;
}

function tryArena(f: Floor, r: Room, dx: number, dy: number): Arena | null {
  const { side: A, hall: L, wide: W } = ARENA;
  const alongY = dx !== 0;
  // (u: tiles out from the room's wall, which is u = 0; v: across the way out, the floor's own x or y)
  const base = dx < 0 ? r.x - 1 : dx > 0 ? r.x + r.w : dy < 0 ? r.y - 1 : r.y + r.h;
  const step = dx !== 0 ? dx : dy;
  const at = (u: number, v: number): [number, number] => (alongY ? [base + step * u, v] : [v, base + step * u]);
  const tile = (u: number, v: number): number => {
    const [x, y] = at(u, v);
    return x < 0 || y < 0 || x >= f.w || y >= f.h ? -1 : f.tiles[y * f.w + x];
  };
  const idx = (u: number, v: number): number => {
    const [x, y] = at(u, v);
    return y * f.w + x;
  };
  const lo = alongY ? r.y : r.x;
  const span = alongY ? r.h : r.w;
  const doors = (f.doors ?? []).flatMap((d) => doorTiles(f, d));
  const near = (i: number): boolean => doors.some((j) => Math.abs((j % f.w) - (i % f.w)) <= 2 && Math.abs(Math.floor(j / f.w) - Math.floor(i / f.w)) <= 2);
  const level = (i: number): boolean => (f.height?.[i] ?? 0) === 0 && (f.stair?.[i] ?? 0) === 0 && (f.cut?.[i] ?? 0) === 0;
  const half = Math.floor(A / 2);
  for (let v0 = lo + 1; v0 + W <= lo + span - 1; v0++) {
    const vc = v0 + 1;
    let ok = true;
    // (the room's own floor behind the opening, at its own height, and its wall there whole and with no doorway near)
    for (let v = v0; v < v0 + W && ok; v++) {
      const inner = idx(-1, v);
      if (tile(-1, v) !== T_FLOOR || !level(inner)) ok = false;
      if (tile(0, v) !== T_WALL || (f.cut?.[idx(0, v)] ?? 0) !== 0 || near(idx(0, v))) ok = false;
    }
    if (!ok) continue;
    // (nothing where the hallway goes, its walls, nor where the arena goes, its walls and a tile round them)
    for (let u = 1; u <= L && ok; u++) for (let v = v0 - 1; v <= v0 + W && ok; v++) if (tile(u, v) !== T_VOID) ok = false;
    for (let u = L + 1; u <= L + A + 3 && ok; u++) for (let v = vc - half - 2; v <= vc - half + A + 1 && ok; v++) if (tile(u, v) !== T_VOID) ok = false;
    if (!ok) continue;
    // LAY IT: the hallway (the room's wall opened, its walls), the arena's walls, its floor, its near wall opened
    const set = (u: number, v: number, t: number): void => {
      const i = idx(u, v);
      f.tiles[i] = t;
      if (f.height) f.height[i] = 0;
      if (f.stair) f.stair[i] = 0;
      if (f.cut) f.cut[i] = 0;
    };
    for (let u = L + 1; u <= L + A + 2; u++) for (let v = vc - half - 1; v <= vc - half + A; v++) set(u, v, T_WALL);
    for (let u = L + 2; u <= L + A + 1; u++) for (let v = vc - half; v < vc - half + A; v++) set(u, v, T_FLOOR);
    for (let u = 1; u <= L; u++) {
      set(u, v0 - 1, T_WALL);
      set(u, v0 + W, T_WALL);
    }
    for (let u = 0; u <= L + 1; u++) for (let v = v0; v < v0 + W; v++) set(u, v, T_FLOOR);
    // (what stood or lay in the opening or just inside it, taken away)
    const opened = new Set<number>();
    for (let u = -1; u <= 0; u++) for (let v = v0 - 1; v <= v0 + W; v++) opened.add(idx(u, v));
    f.props = f.props.filter((p) => !opened.has(Math.floor(p.y) * f.w + Math.floor(p.x)));
    if (f.hazards) f.hazards = f.hazards.filter((h) => !hazardOn(h, opened, f.w));
    // (its floor and its hallway's, in the floor's own x and y)
    const box = (u0: number, u1: number, v1: number, v2: number): { x: number; y: number; w: number; h: number } => {
      const [ax, ay] = at(u0, v1);
      const [bx, by] = at(u1, v2);
      return { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax) + 1, h: Math.abs(by - ay) + 1 };
    };
    const room = box(L + 2, L + A + 1, vc - half, vc - half + A - 1);
    const hall = box(0, L + 1, v0, v0 + W - 1);
    // THE FURNACE: in the far wall where that is a back wall (out along -x or -y), else in the side wall that is
    const fa = Math.floor((A - FURNACE_TILES) / 2);
    let furnace: DoorSpot;
    if (dx < 0) furnace = { kind: 'door', room: -1, alongX: false, near: false, a: room.y + fa, plane: room.x, out: -1 };
    else if (dy < 0) furnace = { kind: 'door', room: -1, alongX: true, near: false, a: room.x + fa, plane: room.y, out: -1 };
    else if (dx > 0) furnace = { kind: 'door', room: -1, alongX: true, near: false, a: room.x + fa, plane: room.y, out: -1 };
    else furnace = { kind: 'door', room: -1, alongX: false, near: false, a: room.y + fa, plane: room.x, out: -1 };
    const along = furnace.a + FURNACE_TILES + CRANK_BY.along;
    const crank = furnace.alongX ? { x: along, y: furnace.plane + CRANK_BY.out } : { x: furnace.plane + CRANK_BY.out, y: along };
    const keeper = { x: room.x + room.w / 2, y: room.y + room.h / 2 };
    return { room, hall, from: r.id, dx, dy, furnace, crank, keeper };
  }
  return null;
}

function hazardOn(h: unknown, opened: Set<number>, w: number): boolean {
  const o = h as { x?: number; y?: number; w?: number; h?: number };
  if (o.x === undefined || o.y === undefined) return false;
  for (let y = o.y; y < o.y + (o.h ?? 1); y++) for (let x = o.x; x < o.x + (o.w ?? 1); x++) if (opened.has(Math.floor(y) * w + Math.floor(x))) return true;
  return false;
}
