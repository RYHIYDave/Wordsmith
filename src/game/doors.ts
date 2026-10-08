// DOORS AND GATES: where they stand, and what they do.
//
// The owner, 7 Oct 2026, 14:01: "After walls, let’s move decorations back and do doors and gates.
// They’ll be themed for the dungeon style, these I’m think wrought iron jail style bar doors that
// swing open, and that same bar style for gates going up and down with the spikes on the bottom.
// Classic castle style.  Implementing this should also affect level design and move away from only
// room-hallway-room-hallway-room repetition.  Dungeon Boss always has a big gate that locks you in
// with him once you pass through the opening.  They can be closed with levers or switches nearby
// to open them.  Doors are always unlocked and open as you get near them."
//
// And of the first pictures of them (two leaves of bars the whole hallway wide), at 16:57: "I’d
// like the gate to have an arch of stone above it.  And I’d like the boss gate to have some sort of
// emblem in the middle of the arch.  And the doors look too much like the gate.  Give them a stone
// outline to make the door smaller than the hallway width.  Have it open from one side, not from
// the middle on both sides".
//
// IN THE GAME SINCE VERSION 18.5, ON HIS WORD. Pictures of what is here went to him at 17:35 and
// 17:41 (previews/doors_and_gates_second_look.png, previews/boss_gate_carved_emblem.png). Of the
// second, at 17:43: "Better". He was asked "is the look in doors_and_gates_second_look.png right
// to build?" and had been told what a yes would bring ("I'll build the doors and the boss's gate
// like the pictures and put them out once they pass the full playtests"); he answered at 17:54,
// "Yes, the new doors and gates look very dim.", and at 18:02: "Yes, dim was a slip. It was
// supposed to say they look good." What is here is DOORS, and THE BOSS'S GATE. (Gates with levers,
// a hole knocked in a wall, and rooms joined in new ways come after: his words of 17:51 and 17:53.)
//
// A DOORWAY is three tiles of corridor floor in the row of wall along one side of a room (a
// corridor straight across the screen comes in at a corner, two tiles on each of two sides: it is
// no doorway). EVERY ROOM BUT THE FIRST HAS ONE WAY IN, the doorway that lies toward the start of
// the level, and that is where something stands:
//   (NOT EVERY ROOM HAS ONE, since Version 18.8: every treasure vault and guardian's lair, and
//   about one in five of the other rooms: `hasDoor`. The owner, 7 Oct 2026, 23:12: "It’s just a
//   cool little interactive thing that gets you immersed.  It’s not to force little contained
//   battles in each room".)
//   A DOOR: ONE TILE WIDE, the middle one of the three; THE TILE ON EITHER SIDE OF IT IS WALL (its
//   two PIERS: the map-maker makes them so). Round the opening a frame of stone, and in it one
//   leaf of iron bars. IT SWINGS OPEN FOR THE HERO when he comes near, and stays open. NO MONSTER
//   OPENS A DOOR (the owner, 7 Oct 2026, 20:16, of doors that opened for monsters too, as Version
//   18.5 had them: "I don’t want monsters to open doors"). SO A SHUT DOOR IS SHUT: it holds
//   monsters, walking or flying, and it stops sight and shots both ways, as a wall does, though
//   it is bars: were it not so, a hero with a bow could shoot a whole room dead through it while
//   the room waited behind it. Nothing in a room wakes or fights until its door is opened: and
//   WHAT IS SHUT IN A ROOM IS OUT OF THE HERO'S REACH ALTOGETHER (game.ts, `shutIn`), for a blast
//   goes by its radius and asks no wall's leave.
//   THE BOSS'S GATE, in the boss hall's: the whole doorway wide, a portcullis under an arch. It is
//   up until the hero is well inside the hall with the boss alive; then it falls, and nothing
//   passes it, nor a shot, until the boss is dead (game.ts).
// A room's other doorways, which lead on, are open as they always were.
//
// THE MIX (where the map-maker mixes: game/dungeon.ts, MIX). Two more things stand in doorways,
// both the gate of the pictures under its plain arch:
//   A GATE WITH A LEVER, in the way in of one room of the main path instead of its door: DOWN as
//   the run begins, and nothing passes it, nor a shot, nor sight. Its lever stands nearby, in a
//   small room at a dead end off the room before; the hero pulls it by walking up to it, and the
//   gate rises and stays up.
//   THE GATES OF A ROOM THAT LOCKS, one in EVERY doorway of it (its way in, which then has no
//   door, and each that leads on): up, until the hero is inside the room, clear of every doorway
//   of it, with its pack; then they fall, and rise when none of that pack is left alive in the
//   room.

import { T_FLOOR, T_WALL } from './types';
import type { DoorSpot, Floor, Room, Vec } from './types';

/**
 * Whether the map-maker lays doors (and the boss's gate). ON since Version 18.5: see the head of
 * this file. (Off, a dungeon is Version 18.4's to the letter: the tests hold that.)
 * `share`: NOT EVERY ROOM HAS A DOOR, since Version 18.8. The owner, 7 Oct 2026, 23:12, of doors
 * in every room's way in, as 18.5 to 18.7 had them: "Every room doesn’t have to have a door.
 * It’s just a cool little interactive thing that gets you immersed.  It’s not to force little
 * contained battles in each room". So a door stands in the way in of every treasure vault and
 * every guardian's lair, and of this share of the other rooms (`hasDoor`); the rest are open, as
 * they were before there were doors. (The tests and playtests of what a door does set it to 1 for
 * the dungeons they lay, and put it back.)
 */
export const DOORS = { on: true, share: 0.2 };

/**
 * Has this room a door in its way in (Version 18.8)? Every treasure vault and every guardian's
 * lair has; of the other rooms, about `DOORS.share`, by a lot of each room's own (the level's
 * seed and depth, and the room's number): NO DICE OF THE MAP-MAKER'S ARE THROWN FOR IT, so a
 * dungeon is the dungeon it was but for its doors. (The boss's hall has its gate whatever this
 * says; the first room has no way in. THE MIX: a room set down next door to the one before it
 * always has its door, and a gated room and a room that locks have their gates, whatever this
 * says.)
 */
export function hasDoor(f: Floor, r: Room): boolean {
  // (and THE MIX's two rooms next door: the door between them is what they are)
  if (r.kind === 'treasure' || r.kind === 'guardian' || r.nextDoor) return true;
  let h = (Math.imul(f.seed | 0, 0x9e3779b1) ^ Math.imul(f.depth | 0, 0x85ebca6b) ^ Math.imul((r.id + 1) | 0, 0xc2b2ae35)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296 < DOORS.share;
}

/** The hero this near the middle of a door's opening, in tiles, opens it. (No monster does: see the head of this file.) */
export const DOOR_NEAR = 2.6;
/** Seconds a door takes to swing open. */
export const DOOR_SWING = 0.32;
/** The boss's gate: seconds to fall, and to rise. */
export const GATE_FALL = 0.22;
export const GATE_RISE = 1.1;
/** How far inside the boss's hall the hero must be before its gate falls: tiles from where the hall's floor ends. */
export const GATE_INSIDE = 2.2;
/**
 * The stone on either side of a door holds a body off by no more than this much of a tile, however
 * big the body: a door is as wide for a brute (who is more than a tile across) as for anybody.
 */
export const PIER_HOLD = 0.4;
/**
 * A hero who walks at the stone beside a door is eased sideways into the door, from as far off as
 * this, in tiles: the whole width of a hallway (game.ts, `intoDoor`).
 */
export const DOOR_HELP = 1.05;

/** The doorways of one room: the runs of exactly three tiles of corridor floor in the row of wall along each of its four sides, with whole floor of the room behind them. */
export function doorways(f: Floor, r: Room, inRoom: Uint8Array): DoorSpot[] {
  const whole = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR && !(f.cut && f.cut[y * f.w + x] !== 0);
  const corridor = (x: number, y: number): boolean => whole(x, y) && inRoom[y * f.w + x] === 0;
  const out: DoorSpot[] = [];
  // (the four sides: the row or column of wall just outside the room, which way it runs, which way the room lies from it)
  const sides: { alongX: boolean; near: boolean; line: number; plane: number; from: number; len: number; out: 1 | -1 }[] = [
    { alongX: true, near: false, line: r.y - 1, plane: r.y, from: r.x, len: r.w, out: -1 },
    { alongX: true, near: true, line: r.y + r.h, plane: r.y + r.h, from: r.x, len: r.w, out: 1 },
    { alongX: false, near: false, line: r.x - 1, plane: r.x, from: r.y, len: r.h, out: -1 },
    { alongX: false, near: true, line: r.x + r.w, plane: r.x + r.w, from: r.y, len: r.h, out: 1 },
  ];
  for (const s of sides) {
    const inside = s.line - s.out; // (the room's own first row or column behind that wall)
    let run = 0;
    for (let k = 0; k <= s.len; k++) {
      const t = s.from + k;
      const open = k < s.len && (s.alongX ? corridor(t, s.line) && whole(t, inside) : corridor(s.line, t) && whole(inside, t));
      if (open) {
        run++;
        continue;
      }
      if (run === 3) out.push({ kind: 'door', room: r.id, alongX: s.alongX, near: s.near, a: t - 3, plane: s.plane, out: s.out });
      run = 0;
    }
  }
  return out;
}

/** How many steps of floor each tile is from the level's start (-1: not reached). */
function stepsFromStart(f: Floor): Int32Array {
  const far = new Int32Array(f.w * f.h).fill(-1);
  const sx = Math.floor(f.start.x);
  const sy = Math.floor(f.start.y);
  const queue: number[] = [sy * f.w + sx];
  far[queue[0]] = 0;
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    const x = i % f.w;
    const y = (i - x) / f.w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
      const j = ny * f.w + nx;
      if (far[j] >= 0 || f.tiles[j] !== T_FLOOR) continue;
      far[j] = far[i] + 1;
      queue.push(j);
    }
  }
  return far;
}

/**
 * LAY THE DOORS OF A LEVEL (the map-maker's last step, if `DOORS.on`): in the way in of a room
 * that has one (`hasDoor`: every vault and lair, and about one in five of the rest, since Version
 * 18.8; until then every room but the first), a door; in the boss hall's, the boss's gate. A
 * room's way in is the doorway that lies toward the start: the one from which a step into the room
 * is a step further from the start. (A room come into at a corner has none.) In the order of the
 * rooms. Takes no dice.
 *
 * IT CHANGES THE LEVEL: the tile on either side of a door becomes WALL, and what lay on those two
 * tiles (rubble, bones) is taken away.
 */
export function layDoors(f: Floor): DoorSpot[] {
  const inRoom = new Uint8Array(f.w * f.h);
  for (const r of f.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) inRoom[y * f.w + x] = 1;
  const far = stepsFromStart(f);
  const out: DoorSpot[] = [];
  for (const r of f.rooms) {
    for (const d of doorways(f, r, inRoom)) {
      const line = doorLine(d);
      const mid = d.alongX ? line * f.w + d.a + 1 : (d.a + 1) * f.w + line;
      const within = d.alongX ? (line - d.out) * f.w + d.a + 1 : (d.a + 1) * f.w + (line - d.out);
      // (THE MIX: a room that locks has a gate in every doorway of it, those that lead on too)
      if (r.locks && far[mid] >= 0) {
        d.kind = 'trapgate';
        out.push(d);
        continue;
      }
      if (far[mid] < 0 || far[within] <= far[mid]) continue; // (it leads on, or nowhere: open as it always was)
      if (r.kind === 'boss') d.kind = 'bossgate';
      else if (r.gated) d.kind = 'gate'; // (THE MIX: a gate, down until its lever is pulled, where the door would stand)
      else if (!hasDoor(f, r)) continue; // (a room with no door: its way in is open, as before there were doors)
      out.push(d);
    }
  }
  const piers = new Set<number>();
  for (const d of out) for (const i of doorPiers(f, d)) piers.add(i);
  for (const i of piers) f.tiles[i] = T_WALL;
  if (piers.size > 0) f.props = f.props.filter((p) => !piers.has(p.y * f.w + p.x));
  return out;
}

/** The row (or column) of wall a doorway is in. */
export function doorLine(d: DoorSpot): number {
  return d.out > 0 ? d.plane : d.plane - 1;
}

/**
 * The plane of that wall's face which is turned to the eye, where everything of a door or gate
 * stands: y = this if `alongX`, else x = this. In a back wall it is where the room's floor ends;
 * on a side toward the eye it is a tile further out, where the corridor begins.
 */
export function doorFace(d: DoorSpot): number {
  return doorLine(d) + 1;
}

/** The three tiles of a doorway (indices into the level's grids), from its first to its last. */
export function doorTiles(f: Floor, d: DoorSpot): number[] {
  const line = doorLine(d);
  const out: number[] = [];
  for (let k = 0; k < 3; k++) out.push(d.alongX ? line * f.w + d.a + k : (d.a + k) * f.w + line);
  return out;
}

/** The tiles of it that are passed through: a door's one, the three of a gate (the boss's, a lever's, a locking room's). */
export function doorWay(f: Floor, d: DoorSpot): number[] {
  const tiles = doorTiles(f, d);
  return d.kind === 'door' ? [tiles[1]] : tiles;
}

/** The stone on either side of a door: the first and the last of its doorway's three tiles. (The boss's gate has none: its pillars stand outside the doorway.) */
export function doorPiers(f: Floor, d: DoorSpot): number[] {
  if (d.kind !== 'door') return [];
  const tiles = doorTiles(f, d);
  return [tiles[0], tiles[2]];
}

/** The middle of a doorway: of the tile in the middle of its three. */
export function doorMiddle(d: DoorSpot): Vec {
  const line = doorLine(d);
  return d.alongX ? { x: d.a + 1.5, y: line + 0.5 } : { x: line + 0.5, y: d.a + 1.5 };
}

/** How far inside the room a place is, past the line where the room's floor ends: tiles (negative: on the corridor's side of it). */
export function insideBy(d: DoorSpot, x: number, y: number): number {
  return ((d.alongX ? y : x) - d.plane) * -d.out;
}

/** A door or gate as the game keeps it. */
export interface DoorInst {
  spot: DoorSpot;
  /** How far open it is: 0 shut, 1 open. A door swings; the gate rises. */
  open: number;
  /** What it is on its way to: 0 or 1. */
  want: 0 | 1;
  /** (THE MIX) A lever's gate: the hero has been told of it (a line on the screen, the first time it is seen from near). */
  told?: boolean;
}

/** The doors of a level as a run begins: every door shut, the boss's gate up; (THE MIX) a lever's gate down, the gates of a room that locks up. */
export function makeDoors(f: Floor): DoorInst[] {
  return (f.doors ?? []).map((spot) => (spot.kind === 'bossgate' || spot.kind === 'trapgate' ? { spot, open: 1, want: 1 } : { spot, open: 0, want: 0 }));
}

/**
 * (THE MIX) The hero this near a lever, in tiles, pulls it: as near as a chest opens from. (So
 * standing on any tile beside it is near enough; at 1.3, as near as the fallen wordsmith is
 * searched from, a hero who came up to it and stopped a step short, on the tile before it, did not
 * pull it: the playtests' own player did just that.)
 */
export const LEVER_NEAR = 1.5;
/** (THE MIX) A room that locks: its gates fall once the hero is inside it and this far, in tiles, from the middle of every one of its doorways (game.ts, `updateLocks`). */
export const LOCK_CLEAR = 2.7;

/** The piers of a level's doors, as a grid: 1 where the stone on either side of a door stands (null: the level has none). For the rule of `PIER_HOLD`. */
export function pierGrid(f: Floor): Uint8Array | null {
  let out: Uint8Array | null = null;
  for (const d of f.doors ?? []) {
    for (const i of doorPiers(f, d)) {
      if (!out) out = new Uint8Array(f.w * f.h);
      out[i] = 1;
    }
  }
  return out;
}

/**
 * WHERE A DOOR IS SHUT: 1 on the tile of every door that is shut (null: the level has no door).
 * The game clears a door's tile as the door begins to open. A shut door holds monsters (game.ts,
 * `free` and `slide`: the hero is never held, a door is open before he reaches it), and its tile
 * is shut in the level's `open` grid, by which sight and shots go (game/level.ts, `finish`).
 */
export function shutGrid(f: Floor): Uint8Array | null {
  let out: Uint8Array | null = null;
  for (const d of f.doors ?? []) {
    if (d.kind !== 'door') continue;
    for (const i of doorWay(f, d)) {
      if (!out) out = new Uint8Array(f.w * f.h);
      out[i] = 1;
    }
  }
  return out;
}

/**
 * A step of time for the doors of a level. A shut door that has a body near the middle of its
 * opening begins to open; every door and gate moves on toward what it is on its way to. `bodies`:
 * whoever doors open for: in the game THE HERO ALONE, since Version 18.7 (the owner: "I don’t want
 * monsters to open doors"). Returns the doors that began to open in this step.
 */
export function stepDoors(doors: DoorInst[], bodies: ReadonlyArray<Vec>, dt: number): DoorInst[] {
  const began: DoorInst[] = [];
  for (const d of doors) {
    if (d.spot.kind === 'door' && d.want === 0) {
      const m = doorMiddle(d.spot);
      for (const b of bodies) {
        if ((b.x - m.x) * (b.x - m.x) + (b.y - m.y) * (b.y - m.y) >= DOOR_NEAR * DOOR_NEAR) continue;
        d.want = 1;
        began.push(d);
        break;
      }
    }
    if (d.open === d.want) continue;
    const time = d.spot.kind === 'door' ? DOOR_SWING : d.want === 1 ? GATE_RISE : GATE_FALL;
    d.open = d.want === 1 ? Math.min(1, d.open + dt / time) : Math.max(0, d.open - dt / time);
  }
  return began;
}
