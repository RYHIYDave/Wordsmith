// THE WAYS THROUGH THE CRYPT: the gate in town, the stairwell down from every floor, and the
// waypoints, to town and back. Behind WAYS, on since Version 20.2.
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

/**
 * THE FIRST FIVE FLOORS, the switch of what is the floors' own beyond their bosses (game/bosses.ts) and
 * the cult (game/defs.ts CULT): floor 5's mine shaft in place of a stairwell, and the ride up to town
 * (here); every floor laid with its own pieces (game/first5.ts). Off, a floor is as Version 20.2 had it.
 */
export const FIRST5 = { on: true };

/** THE SWITCH. ON SINCE VERSION 20.2: the owner, 10 Oct 2026, 11:15, of films of them in the game: "Good". */
export const WAYS = { on: true };

/**
 * THE WAYS BETWEEN THE FLOORS, behind EXITS (off: the game is as Version 23.9 had it). The owner, 22 Oct 2026,
 * 11:21 (Pacific): “I’d like to fix the level exits in 4-15.  Level four should end with a wall crumbling down
 * after the boss is killed and a cave entrance is exposed.  Then you enter the fleshmancer’s lair.  Let’s put the
 * empty elevator cage in the bottom corner of the prison town so you come up to town from beating the
 * fleshmancer.  Then you head out the big gate at the top of the town to enter the quarry and head back down the
 * mountain to the town.  So the gate needs to be blocked or barred up until that point.  You’ll start a new game in
 * town and the wordsmith will give you a quest to find the key to turn on the altar or whatever it is I can’t
 * remember.  I guess have some stairs in town also and you go down the stairs to enter level 1.  Then have exits
 * that lead to the next zone in a natural way as opposed to just a waypoint being plopped down.” Their looks are the
 * art chat's (his pick, “The art chat (Recommended)”); what they do is this file's and game.ts's:
 *   A NEW GAME BEGINS IN TOWN, a new player's lessons too; the wordsmith, used, gives the quest for the master
 *     rune-stone (game.ts, `giveQuest`).
 *   THE TOWN'S STAIRS DOWN (`TOWN_STAIR`): a stairwell open in the hall's floor; its top step takes him to floor 1,
 *     where he comes in at the first floor's doorway (the stairs up: walked into, back up to town, by the stairs).
 *   THE TOWN'S GATE, in its back wall: barred until the Fleshmancer is beaten (`Game.wayDepth` < 6); then it
 *     rises as he comes, as it always has, and leads out to the Quarry, floor 6.
 *   THE SHAFT'S HEAD in the hall's near corner (`TOWN_SHAFT`), the cage standing in it: the ride up from floor 5
 *     ends there.
 *   FLOOR 4'S CAVE (`placeCave`): three tiles of a back wall of the boss's hall, cut through as a gate's doorway is,
 *     the wall standing over it until the boss dies; then it crumbles (`CAVE_OPENING`) and walking into the mouth
 *     takes him down to floor 5, where he comes out of the cave's other end (`Ways.mouth`).
 */
export const EXITS = { on: false };
/**
 * The town's stairs down: the corner of the opening and the way its steps go, on the hall's floor (level.ts TOWN), and how
 * big it is: the art chat's (art/town_ways.ts TOWN_STAIRS, 3 tiles long by 2 wide; his yes there by 14:01, 22 Oct 2026, “Yes, on
 * to floors 6–15 (Recommended)”, to “The stairs down (3 tiles by 2, by the stash)”).
 */
export const TOWN_STAIR = { x: 14, y: 17, way: 'x' as const, long: 3, wide: 2 };
/** The shaft's head in the town: the tile its middle stands on, in the hall's near corner (the bottom of the screen); its three tiles by three are its own. */
export const TOWN_SHAFT = { x: 20, y: 18 };
/** Floor 4's wall, crumbling to the cave's mouth: how long from the boss's death until the mouth is open to walk into, in seconds: the art chat's film of it (art/cave4.ts CAVE_OPEN_SECS, 126 frames at 30). */
export const CAVE_OPENING = 126 / 30;
/** THE TOWN'S GATE UNBARRED: how near its middle he must come, in tiles, for it to be in sight, the first time after the Fleshmancer is beaten (its film plays then: the art chat's ask); and how long the film is (art/town_ways.ts UNBAR, 78 frames at 30), the gate staying shut while it plays. */
export const UNBAR_SEEN = 6;
export const UNBAR_SECS = 78 / 30;

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
  /** THE FIRST FIVE FLOORS: how long since it began to break open, in seconds (none: long since). Its top step takes nobody down until STAIR_OPENING. */
  t?: number;
  /** (EXITS: the town's stairs) How long and how wide its opening is, in tiles; none: a floor's stairwell, STAIR_LONG by STAIR_WIDE. */
  long?: number;
  wide?: number;
}
/** How long the stairwell takes to break open, in seconds: the art chat's film of it is 3 to 3.5 s (art/stairwell_open.ts; tests/first5_floors.test.ts). */
export const STAIR_OPENING = 3.5;

/** A WAYPOINT: its middle; awake once the hero has come near (in town, once there is a floor to go back to); when a warp began on it, in the level's own time (null: none). */
export interface WayPoint {
  x: number;
  y: number;
  awake: boolean;
  warpAt: number | null;
}

/**
 * THE MINE SHAFT, the fifth floor's way out, in place of a stairwell (the owner, in the art chat, 11 Oct
 * 2026: "Instead of stairs at the end I’d like a mine shaft you ride up"; asked where to: "Up, out to
 * town"): the tile its middle stands on, at the back of the boss's hall; and how its cage is: up out of
 * sight while the boss lives ('empty'); coming down as he dies ('coming', `t` seconds since: the film of
 * it is SHAFT.down long, art/shaft.ts); down at the landing with its gate open ('down': walking into it
 * takes him up); and going up with him in it ('going': Game.leaving).
 */
export interface ShaftWay {
  x: number;
  y: number;
  state: 'empty' | 'coming' | 'down' | 'going' | 'still' | 'arriving';
  t: number;
}
/** EXITS: THE SHAFT'S HEAD IN TOWN: the cage standing there ('still'), or coming up with him in it from floor 5 ('arriving', `t` seconds since: TOWN_ARRIVE long). Walking into it in town takes him nowhere. How long the cage takes to come up into town and open its gate, in seconds, until the art chat's film says (the ride up's own, art/shaft.ts cageUp). */
export const TOWN_ARRIVE = 101 / 30;
/**
 * The shaft's times, in seconds, each the art chat's film's own (art/shaft.ts: cageDown, 129 frames at
 * 30 a second, its cage striking the catches at frames 50 and 60; cageUp, 101 frames, its gate slamming
 * at 10 and the cable snapping taut at 30; held equal in tests/first5_floors.test.ts).
 */
export const SHAFT = { down: 129 / 30, downJolts: [50 / 30, 60 / 30], up: 101 / 30, upJolts: [10 / 30, 30 / 30] };

/** The tiles of a shaft that nobody walks on: its two sides and its back (its timbers and its guides). Its middle, too, until the cage is down: then that is the way in, from before it (+y). */
export function shaftTiles(f: Floor, s: { x: number; y: number }): number[] {
  return [s.y * f.w + s.x - 1, s.y * f.w + s.x + 1, (s.y - 1) * f.w + s.x];
}

/**
 * WHERE THE FIFTH FLOOR'S SHAFT STANDS: in its boss's hall, as near the hall's far corner (the top of
 * the screen) as there is room, a tile off its back walls: the three tiles by three round its middle
 * plain floor (what stands or lies there is taken away: level.ts), none of them before a door or a
 * gate, its middle three tiles or more from where the boss stands. Null where the hall has no room.
 */
export function placeShaft(f: Floor): { x: number; y: number } | null {
  const hall = f.rooms.find((r) => r.kind === 'boss');
  if (!hall) return null;
  const doors = f.doors ?? [];
  const ok = (x: number, y: number): boolean => {
    for (let ty = y - 1; ty <= y + 1; ty++) {
      for (let tx = x - 1; tx <= x + 1; tx++) {
        if (!plain(f, tx, ty) || doors.some((d) => beforeGate(d, tx, ty))) return false;
      }
    }
    return Math.hypot(x + 0.5 - f.boss.x, y + 0.5 - f.boss.y) >= 3;
  };
  let best: { x: number; y: number } | null = null;
  let bestD = Infinity;
  for (let y = hall.y + 1; y + 1 < hall.y + hall.h; y++) {
    for (let x = hall.x + 1; x + 1 < hall.x + hall.w; x++) {
      const d = x - hall.x + (y - hall.y) + 0.01 * Math.abs(x - hall.x - (y - hall.y));
      if (d < bestD && ok(x, y)) {
        best = { x, y };
        bestD = d;
      }
    }
  }
  return best;
}

/** The ways of one level. */
export interface Ways {
  /** THE FIRST FIVE FLOORS: the fifth floor's mine shaft (then it has no stairwell); null on every other level. */
  shaft?: ShaftWay | null;
  /** The stairwell down: where it will open (the first of `stairs`) until it opens, and then where it did. */
  stair: StairWay | null;
  /** The places in the boss's hall where it may open (`stairSpots`): the first, by the hall's middle, unless the boss falls on or by it. */
  stairs: StairWay[];
  way: WayPoint | null;
  /** The gate of the way (in town: to the first floor; on the first floor: back to town): its index in Level.doors, or -1. */
  gate: number;
  /**
   * ACT 1, THE DESCENT (game/act1_layout.ts): THE WAY ON, in place of a stairwell. At the far end of the boss's
   * ground a column of light (the waypoint's own picture) that wakes as the boss dies: walking into it takes
   * him on, down the mountain to the next floor (from the tenth, the Fen, to town: the siege broken).
   */
  onward?: WayPoint | null;
  /**
   * EXITS, FLOOR 4: the cave's mouth in a back wall of the boss's hall (its doorway, cut as a gate's is), and how its
   * wall is: standing over it while the boss lives ('wall'); crumbling as he dies ('falling', `t` seconds since); gone
   * ('open': walking into the mouth takes him down to floor 5).
   */
  cave?: { spot: DoorSpot; state: 'wall' | 'falling' | 'open'; t: number } | null;
  /** EXITS, FLOOR 5: the cave's other end, in a back wall of the first room, where he comes in from floor 4 (nobody goes back into it). */
  mouth?: DoorSpot | null;
  /** EXITS, IN TOWN: the gate barred (the Fleshmancer not yet beaten): it does not rise. */
  barred?: boolean;
  /** (EXITS, the town's gate) Its unbarring: -1, waiting for him to come in sight of it (UNBAR_SEEN); 0 and on, how long since it began (the gate barred until UNBAR_SECS); none: nothing to play. */
  unbar?: number | null;
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
/** How far the boss's body must lie from a stairwell's opening for it to open there, in tiles: a boss's body lies a tile and more across, and his hoard falls round it. */
export const STAIR_CLEAR = 2;

/** The tiles of an open stairwell that nobody walks on: its opening past the top step (the steps going down into the dark). */
export function stairTiles(f: Floor, s: StairWay): number[] {
  // (a floor's stairwell: the two tiles past its top step; the town's stairs, as long and as wide as they are)
  const along = s.long ? Math.ceil(s.long) - 1 : 2;
  const across = s.wide ? Math.ceil(s.wide) : 1;
  const out: number[] = [];
  for (let j = 0; j < across; j++) for (let k = 1; k <= along; k++) out.push(s.way === 'x' ? (s.y + j) * f.w + s.x + k : (s.y + k) * f.w + s.x + j);
  return out;
}

/** Is a body at (x, y) on the stairwell's top step (where its opening meets the floor: the first tile of it)? */
export function onTopStep(s: StairWay, x: number, y: number): boolean {
  const along = s.way === 'x' ? x - s.x : y - s.y;
  const across = s.way === 'x' ? y - s.y : x - s.x;
  return along >= -0.1 && along < 0.95 && across >= 0.05 && across < (s.wide ?? STAIR_WIDE) - 0.05;
}

/** The middle of the stairwell's top step: where whoever stood on its opening as it opened is put, and where a touch on it sends the hero. */
export function topStep(s: StairWay): { x: number; y: number } {
  const wide = s.wide ?? STAIR_WIDE;
  return s.way === 'x' ? { x: s.x + 0.5, y: s.y + wide / 2 } : { x: s.x + wide / 2, y: s.y + 0.5 };
}

/** The middle of the stairwell's opening. */
export function stairMiddle(s: StairWay): { x: number; y: number } {
  const long = s.long ?? STAIR_LONG;
  const wide = s.wide ?? STAIR_WIDE;
  return s.way === 'x' ? { x: s.x + long / 2, y: s.y + wide / 2 } : { x: s.x + wide / 2, y: s.y + long / 2 };
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
  return placeInBackWall(f, f.rooms[0]);
}

/**
 * EXITS: WHERE FLOOR 4'S CAVE GOES: three tiles of a back wall of the boss's hall, chosen as the first floor's gate's
 * are (`placeInBackWall`: the dark beyond, nothing standing before it, the middle of its wall). Null where the hall
 * has none.
 */
export function placeCave(f: Floor): DoorSpot | null {
  return placeInBackWall(f, f.rooms.find((r) => r.kind === 'boss'));
}

/** Three tiles of a back wall of room `r` for a doorway into the dark, as `placeFirstGate` says; null where none will do. */
function placeInBackWall(f: Floor, r: Floor['rooms'][number] | undefined): DoorSpot | null {
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
