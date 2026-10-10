// THE WAYS THROUGH THE CRYPT: the gate in town, the stairwell down from every floor, and the
// waypoints, to town and back. A mock-up behind WAYS, OFF, until he has seen it and said yes.
//
// The owner's outline, 9 Oct 2026, 22:47: "The gate on the wall with be turned to a gate from the
// levels.  It will open automatically as you approach it and go through.  you will enter floor 1
// of the Crypt.  You find the dead wordsmith and the quest item to turn the altar on, kill the
// warden and find a stairwell leading down.  At the bottom of the stairs is Crypt floor 2.  There
// is a waypoint that will warp you to town and back at the beginning over every floor except the
// first as you could just walk back through the gate." Their pictures are the art chat's
// (art/crypt_ways.ts; art/gates.ts for the gates), with his yes by 07:29 on 10 Oct: "Yes, as shown
// (Recommended)". What they do is this file's and game.ts's:
//   THE GATE IN TOWN: one of the levels' gates (a 'waygate') in a doorway of three tiles in the
//     town's back wall, where the field of light was. It rises as the hero comes within
//     `GATE_RISE_AT` tiles of it and falls when he is further than `GATE_FALL_AT`; walking into
//     its doorway takes him to the first floor.
//   THE FIRST FLOOR'S GATE: the same, in a back wall of its first room, standing open: the way
//     back to town is to walk into its doorway.
//   THE STAIRWELL DOWN, in the boss's hall: it opens in the floor when the boss dies, by the
//     hall's middle, where the dark portal stood, or, where he fell there, in the next of a few
//     places in the hall, clear of his body (`stairSpots`, `stairFor`); stepping onto its top step
//     takes him down to the next floor (there is no way back up it).
//   THE WAYPOINT at the start of every floor but the first, beside where he comes in: asleep until
//     he first comes near, then awake; standing on it, the use button warps him to town.
//   THE WAYPOINT IN TOWN, beside the gate: awake once there is a floor to warp back to; standing
//     on it, the use button warps him back to the start of the deepest floor whose waypoint he has
//     reached (`Game.wayDepth`).
// OFF, THE GAME IS WHAT IT WAS: the field of light in town and the gate's station, and the dark
// portal home in the boss's hall.

import { SOLID_PROPS, T_FLOOR, T_VOID, T_WALL } from './types';
import type { DoorSpot, Floor } from './types';

/** THE SWITCH (off). */
export const WAYS = { on: false };

/** The town's gate rises when the hero is this near the middle of its doorway, in tiles; at his pace he is at its bars a little over a second after, as it is 95% up (the art chat's film: tools/scenarios/crypt_gate.mjs). */
export const GATE_RISE_AT = 6;
/** ... and falls again once he is further than this. */
export const GATE_FALL_AT = 8;
/** A waypoint wakes the first time the hero comes this near its middle, in tiles. */
export const WAY_WAKE = 4.5;
/** Standing this near a waypoint's middle, the use button warps him. */
export const WAY_USE = 1.0;
/** From the use button to the warp itself: the column of light's flare, which hides him (art/crypt_ways.ts: up by frame 3, flaring at 4 and 5, at 20 a second). */
export const WARP_SECS = 0.25;
/** Going down the stairwell, and through a gate: the screen darkens over this long, the next level is made, and it lightens over as long again. */
export const CURTAIN_SECS = 0.35;
/** The stairwell's opening, in tiles: along its way down, and across (art/crypt_ways.ts, STAIR_LONG and STAIR_WIDE: tests/ways.test.ts holds them the same). */
export const STAIR_LONG = 2.4;
export const STAIR_WIDE = 1.25;
/** The town's gate: the first of its doorway's three tiles in the back wall (level.ts, TOWN.gateWall: the art chat's film opened these three). */
export const TOWN_GATE = { a: 13, line: 5 };
/** The town's waypoint: its middle, to the left of the gate along the back wall. */
export const TOWN_WAY = { x: 9.5, y: 7.5 };

/** THE STAIRWELL DOWN: the corner of its opening up the screen, which way its steps go down ('x': to the lower right), and whether it is open (its boss dead). */
export interface StairWay {
  x: number;
  y: number;
  way: 'x' | 'y';
  open: boolean;
}

/** A WAYPOINT: its middle; awake once the hero has come near (in town, once there is a floor to go back to); when a warp began on it, in the level's own time (null: none). */
export interface WayPoint {
  x: number;
  y: number;
  awake: boolean;
  warpAt: number | null;
}

/** The ways of one level. */
export interface Ways {
  /** The stairwell down: where it will open (the first of `stairs`) until it opens, and then where it did. */
  stair: StairWay | null;
  /** The places in the boss's hall where it may open (`stairSpots`): the first, by the hall's middle, unless the boss falls on or by it. */
  stairs: StairWay[];
  way: WayPoint | null;
  /** The gate of the way (in town: to the first floor; on the first floor: back to town): its index in Level.doors, or -1. */
  gate: number;
}

/** Plain floor that a thing may be laid on: floor, not cut, no stair, at the floor's own height. */
function plain(f: Floor, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= f.w || y >= f.h) return false;
  const i = y * f.w + x;
  return f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) && !(f.stair && f.stair[i] !== 0) && !(f.height && f.height[i] !== 0);
}

/** How many places in a boss's hall the stairwell may open in, at most, and how far apart they are (between their middles, in tiles). */
export const STAIR_SPOTS = 5;
export const STAIR_APART = 4;

/**
 * WHERE A FLOOR'S STAIRWELL MAY OPEN: places in its boss's hall, the nearest the hall's middle
 * first (the first, where the hall has room for it, with its opening across the middle: its
 * corner a tile up and to the left of it), each at least STAIR_APART tiles from the others, at
 * most STAIR_SPOTS. Under each opening and a tile round it, plain floor with nothing standing on
 * it (`solid`: a tile something solid stands on). Its steps go down to the lower right of the
 * screen. The stairwell opens in the first unless the boss falls on or by it, and then in the
 * nearest that is clear of him (`stairFor`): his body lies where he fell, and would lie over it.
 * Empty where there is no boss's hall, or no room in it.
 */
export function stairSpots(f: Floor, solid: (i: number) => boolean): StairWay[] {
  const hall = f.rooms.find((r) => r.kind === 'boss');
  if (!hall) return [];
  const ok = (x: number, y: number): boolean => {
    for (let ty = y - 1; ty <= y + 2; ty++) for (let tx = x - 1; tx <= x + 3; tx++) if (!plain(f, tx, ty) || solid(ty * f.w + tx)) return false;
    return true;
  };
  const mx = f.boss.x;
  const my = f.boss.y;
  const all: { x: number; y: number; d: number }[] = [];
  for (let y = hall.y + 1; y + 2 < hall.y + hall.h; y++) {
    for (let x = hall.x + 1; x + 3 < hall.x + hall.w; x++) {
      if (!ok(x, y)) continue;
      // (from the hall's middle to the opening's; the place across the middle is nearest of all)
      all.push({ x, y, d: Math.hypot(x + 1 - mx, y + 1 - my) });
    }
  }
  all.sort((p, q) => p.d - q.d || p.y - q.y || p.x - q.x);
  const out: StairWay[] = [];
  for (const c of all) {
    if (out.length >= STAIR_SPOTS) break;
    if (out.some((o) => Math.hypot(o.x - c.x, o.y - c.y) < STAIR_APART)) continue;
    out.push({ x: c.x, y: c.y, way: 'x', open: false });
  }
  return out;
}

/** Is (x, y) on a stairwell's opening, or within `by` tiles of it? */
export function nearStair(s: StairWay, x: number, y: number, by: number): boolean {
  const along = s.way === 'x' ? x - s.x : y - s.y;
  const across = s.way === 'x' ? y - s.y : x - s.x;
  return along > -by && along < STAIR_LONG + by && across > -by && across < STAIR_WIDE + by;
}

/** WHERE THE STAIRWELL OPENS, the boss fallen at (bx, by) and the hero at (hx, hy): the first of its places clear of the boss's body by `STAIR_CLEAR` tiles and of the hero by half a tile; else the first clear of the body; else the first. */
export function stairFor(spots: readonly StairWay[], bx: number, by: number, hx: number, hy: number): StairWay | null {
  return spots.find((s) => !nearStair(s, bx, by, STAIR_CLEAR) && !nearStair(s, hx, hy, 0.5)) ?? spots.find((s) => !nearStair(s, bx, by, STAIR_CLEAR)) ?? spots[0] ?? null;
}
/** How far the boss's body must lie from a stairwell's opening for it to open there, in tiles: a boss's body lies a tile and more across. */
export const STAIR_CLEAR = 1.3;

/** The tiles of an open stairwell that nobody walks on: its opening past the top step (the steps going down into the dark). */
export function stairTiles(f: Floor, s: StairWay): number[] {
  return s.way === 'x' ? [s.y * f.w + s.x + 1, s.y * f.w + s.x + 2] : [(s.y + 1) * f.w + s.x, (s.y + 2) * f.w + s.x];
}

/** Is a body at (x, y) on the stairwell's top step (where its opening meets the floor: the first tile of it)? */
export function onTopStep(s: StairWay, x: number, y: number): boolean {
  const along = s.way === 'x' ? x - s.x : y - s.y;
  const across = s.way === 'x' ? y - s.y : x - s.x;
  return along >= -0.1 && along < 0.95 && across >= 0.05 && across < STAIR_WIDE - 0.05;
}

/** The middle of the stairwell's top step: where whoever stood on its opening as it opened is put, and where a touch on it sends the hero. */
export function topStep(s: StairWay): { x: number; y: number } {
  return s.way === 'x' ? { x: s.x + 0.5, y: s.y + STAIR_WIDE / 2 } : { x: s.x + STAIR_WIDE / 2, y: s.y + 0.5 };
}

/** The middle of the stairwell's opening. */
export function stairMiddle(s: StairWay): { x: number; y: number } {
  return s.way === 'x' ? { x: s.x + STAIR_LONG / 2, y: s.y + STAIR_WIDE / 2 } : { x: s.x + STAIR_WIDE / 2, y: s.y + STAIR_LONG / 2 };
}

/**
 * WHERE A FLOOR'S WAYPOINT GOES: beside where the hero comes in, a tile and a half up and to the
 * left of it (behind him: he comes in looking down to the right), or, where that is not clear, the
 * first of a few other places round him that is. Its dais, a tile and a half across, lies on plain
 * floor that nothing stands on (`free`: a tile nothing solid is on). Null where none will do.
 */
export function placeWay(f: Floor, free: (i: number) => boolean): WayPoint | null {
  const sx = f.start.x;
  const sy = f.start.y;
  for (const [dx, dy] of [[-1.5, -1.5], [-2, 0], [0, -2], [1.5, -1.5], [-1.5, 1.5], [-3, 0], [0, -3]]) {
    const x = sx + dx;
    const y = sy + dy;
    let ok = true;
    for (let ty = Math.floor(y - 0.75); ty <= Math.floor(y + 0.75) && ok; ty++) {
      for (let tx = Math.floor(x - 0.75); tx <= Math.floor(x + 0.75) && ok; tx++) ok = plain(f, tx, ty) && free(ty * f.w + tx);
    }
    if (ok) return { x, y, awake: false, warpAt: null };
  }
  return null;
}

/**
 * WHERE THE FIRST FLOOR'S GATE GOES: three tiles of a back wall of the first room (the one at its
 * top right on the screen, or its top left), with a tile of wall standing on either side of them
 * for the gate's posts; beyond them no floor (nothing, or wall: nothing, the dark, is better);
 * before them two rows of the room's floor whole, with no chest nor lever on it. Of the places
 * that will do, the one with the dark beyond it and the fewest things standing before it, nearest
 * the middle of its wall, the top right wall's before the top left's. (A room with its corners
 * cut has little straight wall: a room 8 tiles across may have five, with a brazier against its
 * middle.) Returns the doorway, or null. (It changes nothing: `openGate` cuts it, and what stands
 * before it is taken away: level.ts, `makeDungeon`, by `beforeGate`.)
 */
export function placeFirstGate(f: Floor): DoorSpot | null {
  const r = f.rooms[0];
  if (!r) return null;
  const tile = (x: number, y: number): number => (x < 0 || y < 0 || x >= f.w || y >= f.h ? -1 : f.tiles[y * f.w + x]);
  // (what stands on the floor: what may be taken away for the gate, a brazier, a barrel, an urn, a pillar, counts against a place; a chest or a lever rules it out)
  const standing = new Map<number, boolean>();
  for (const p of f.props) if (SOLID_PROPS.includes(p.kind)) standing.set(p.y * f.w + p.x, p.kind === 'chest' || p.kind === 'lever');
  const walls: { alongX: boolean; line: number; from: number; len: number }[] = [
    { alongX: true, line: r.y - 1, from: r.x, len: r.w },
    { alongX: false, line: r.x - 1, from: r.y, len: r.h },
  ];
  let best: DoorSpot | null = null;
  let bestScore = Infinity;
  for (let wi = 0; wi < walls.length; wi++) {
    const w = walls[wi];
    const at = (k: number, d = 0): number => (w.alongX ? tile(w.from + k, w.line - d) : tile(w.line - d, w.from + k));
    const here = (k: number, d: number): number => (w.alongX ? (w.line + d) * f.w + w.from + k : (w.from + k) * f.w + w.line + d);
    const room = (k: number, d: number): boolean => {
      const i = here(k, d);
      return plain(f, i % f.w, Math.floor(i / f.w)) && standing.get(i) !== true;
    };
    const mid = (w.len - 3) / 2;
    for (let k = 0; k + 2 < w.len; k++) {
      let ok = true;
      for (let j = k - 1; j <= k + 3 && ok; j++) ok = at(j) === T_WALL;
      for (let j = k; j <= k + 2 && ok; j++) ok = at(j, 1) !== T_FLOOR && room(j, 1) && room(j, 2);
      if (!ok) continue;
      const dark = [k, k + 1, k + 2].every((j) => at(j, 1) === T_VOID);
      let things = 0;
      for (let j = k; j <= k + 2; j++) for (const d of [1, 2]) if (standing.has(here(j, d))) things++;
      const score = (dark ? 0 : 1000) + things * 100 + wi * 10 + Math.abs(k - mid);
      if (score >= bestScore) continue;
      bestScore = score;
      best = { kind: 'waygate', room: r.id, alongX: w.alongX, near: false, a: w.from + k, plane: w.line + 1, out: -1 };
    }
  }
  return best;
}

/** Is tile (x, y) before a gate: on the two rows of floor inside its doorway, where the hero comes in and goes out (nothing is left standing or lying there)? */
export function beforeGate(d: DoorSpot, x: number, y: number): boolean {
  const along = d.alongX ? x : y;
  const inside = ((d.alongX ? y : x) - d.plane) * -d.out;
  return along >= d.a && along <= d.a + 2 && inside >= 0 && inside < 2;
}

/** Cut a gate's doorway in its wall: its three tiles floor, beyond them the dark. */
export function openGate(f: Floor, d: DoorSpot): void {
  const line = d.plane - 1;
  for (let k = 0; k < 3; k++) f.tiles[d.alongX ? line * f.w + d.a + k : (d.a + k) * f.w + line] = T_FLOOR;
}

/** The town's gate: its doorway in the back wall, where the field of light was. */
export function townGate(): DoorSpot {
  return { kind: 'waygate', room: 0, alongX: true, near: false, a: TOWN_GATE.a, plane: TOWN_GATE.line + 1, out: -1 };
}
