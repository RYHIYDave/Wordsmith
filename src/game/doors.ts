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
//   A DOOR: ONE TILE WIDE, the middle one of the three; THE TILE ON EITHER SIDE OF IT IS WALL (its
//   two PIERS: the map-maker makes them so). Round the opening a frame of stone, and in it one
//   leaf of iron bars. It stops nothing and nobody: it swings open for whoever comes near (the
//   hero, or a monster that is awake), and stays open.
//   THE BOSS'S GATE, in the boss hall's: the whole doorway wide, a portcullis under an arch. It is
//   up until the hero is well inside the hall with the boss alive; then it falls, and nothing
//   passes it, nor a shot, until the boss is dead (game.ts).
// A room's other doorways, which lead on, are open as they always were.

import { T_FLOOR, T_WALL } from './types';
import type { DoorSpot, Floor, Room, Vec } from './types';

/** Whether the map-maker lays doors (and the boss's gate). ON since Version 18.5: see the head of this file. (Off, a dungeon is Version 18.4's to the letter: the tests hold that.) */
export const DOORS = { on: true };

/** A body this near the middle of a door's opening, in tiles, opens it. */
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
 * LAY THE DOORS OF A LEVEL (the map-maker's last step, if `DOORS.on`): in the way in of every room
 * but the first, a door; in the boss hall's, the boss's gate. A room's way in is the doorway that
 * lies toward the start: the one from which a step into the room is a step further from the start.
 * (A room come into at a corner has none.) In the order of the rooms. Takes no dice.
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
      if (far[mid] < 0 || far[within] <= far[mid]) continue; // (it leads on, or nowhere: open as it always was)
      if (r.kind === 'boss') d.kind = 'bossgate';
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

/** The tiles of it that are passed through: a door's one, the three of the boss's gate. */
export function doorWay(f: Floor, d: DoorSpot): number[] {
  const tiles = doorTiles(f, d);
  return d.kind === 'bossgate' ? tiles : [tiles[1]];
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
}

/** The doors of a level as a run begins: every door shut, the boss's gate up. */
export function makeDoors(f: Floor): DoorInst[] {
  return (f.doors ?? []).map((spot) => (spot.kind === 'door' ? { spot, open: 0, want: 0 } : { spot, open: 1, want: 1 }));
}

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
 * A step of time for the doors of a level. A shut door that has a body near the middle of its
 * opening begins to open; every door and gate moves on toward what it is on its way to. `bodies`:
 * the hero and the monsters that are awake. Returns the doors that began to open in this step.
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
