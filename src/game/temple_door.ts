// FLOOR 5, THE TEMPLE'S DOOR, ITS RULES (his idea, 13 Nov 2026: “I want The the moment when you enter the temple from the line in
// level five to be an event when there’s a gate, the gate is locked. There’s two many bosses with keys you kill both of them you
// collect the two keys and then you unlock two chains across the door that then open the way into the temple”; the door, his pick,
// “Great black stone doors (Recommended)”; its pictures: art/temple_door.ts). Behind art/temple_door.ts TEMPLE_DOOR, off.
//
//   THE DOOR stands in the threshold where the mine meets the temple (game/lair_way.ts: the one way in), its three tiles wall to
//     whatever walks, flies, is shot or looks until it is opened. The first time he comes near it, a line says what it wants.
//   THE KEYS: two, one carried by each of the two key-bearers in the mine's side rooms (game/key_bearers.ts); each dropped where its
//     bearer falls, ringing on the floor, and picked up as he walks over it. The bar shows how many he holds.
//   THE UNLOCKING: he comes to the door with both: the first key turns in its lock, its chain falls; then the second's; then the
//     leaves swing open into the temple, the floor shaking (TEMPLE_TIMES). From then on the way is open.

import { doorMiddle, doorTiles } from './doors';
import type { DoorInst } from './doors';
import type { DoorSpot } from './types';
import type { Level } from './state';
import type { Threshold } from './lair_way';

/** How the door keeps: its index among the level's doors; the keys he holds; each chain's unlocking (0 to 1); when the unlocking began. */
export interface TempleDoorState {
  door: number;
  /** Keys held (0 to 2), and how many it wants. */
  keys: number;
  need: number;
  /** Each chain's unlocking, 0 locked to 1 lying in its heap. */
  chain: [number, number];
  /** The game's time the unlocking began (-1: not yet). */
  began: number;
  /** A line has been said of it (the first time he comes near). */
  told: boolean;
  /** Where its threshold is (the way's three tiles), for its pictures. */
  at: Threshold;
}

/** The unlocking's beats, in seconds from its beginning: each chain's (its key turning, then falling), the leaves' swing. */
export const TEMPLE_TIMES = {
  /** The first chain from 0, the second from `second`; each takes `chain`. */
  chain: 1.5,
  second: 1.1,
  /** The leaves begin to swing at `swingAt`, and take `swing`. */
  swingAt: 2.9,
  swing: 1.6,
  /** He this near the door's middle, in tiles, with both keys, begins it; without, he is told. */
  near: 2.6,
};

/** The door's spot, from its threshold: a doorway of three tiles on the mine's row, the temple the room it opens into. */
export function templeSpot(t: Threshold, room: number): DoorSpot {
  return { kind: 'templedoor', room, alongX: t.alongX, near: false, a: t.a, plane: t.temple > 0 ? t.line + 1 : t.line, out: (t.temple > 0 ? -1 : 1) as 1 | -1 };
}

/**
 * THE DOOR SET IN ITS THRESHOLD (after the level's lair is planned: game/level.ts): the first threshold's way barred, its tiles wall
 * to everything until it is opened. False if floor 5 has no threshold to set it in (it is laid again until it has: level.ts).
 */
export function placeTempleDoor(L: Level): boolean {
  const t = L.lair?.thresholds[0];
  if (!t) return false;
  const f = L.floor;
  const hall = f.rooms.find((r) => r.kind === 'boss');
  const spot = templeSpot(t, hall ? hall.id : -1);
  L.doors.push({ spot, open: 0, want: 0 });
  for (const i of doorTiles(f, spot)) {
    L.walk[i] = 0;
    L.open[i] = 0;
  }
  L.temple = { door: L.doors.length - 1, keys: 0, need: 2, chain: [0, 0], began: -1, told: false, at: t };
  return true;
}

/** The door's own instance. */
export function templeDoorOf(L: Level): DoorInst | null {
  return L.temple ? L.doors[L.temple.door] ?? null : null;
}

/** What a step of time does to the door; returns what happened in it, for the game to say and sound ('told', 'began', 'chain', 'open'). */
export function stepTempleDoor(L: Level, hero: { x: number; y: number }, time: number): ('told' | 'began' | 'chain1' | 'chain2' | 'swing' | 'open')[] {
  const T = L.temple;
  const d = templeDoorOf(L);
  if (!T || !d) return [];
  const out: ('told' | 'began' | 'chain1' | 'chain2' | 'swing' | 'open')[] = [];
  const m = doorMiddle(d.spot);
  const near = Math.hypot(hero.x - m.x, hero.y - m.y) <= TEMPLE_TIMES.near;
  if (T.began < 0) {
    if (near && T.keys >= T.need) {
      T.began = time;
      out.push('began');
    } else if (near && !T.told) {
      T.told = true;
      out.push('told');
    }
    return out;
  }
  const s = time - T.began;
  const was = [...T.chain];
  T.chain[0] = Math.max(0, Math.min(1, s / TEMPLE_TIMES.chain));
  T.chain[1] = Math.max(0, Math.min(1, (s - TEMPLE_TIMES.second) / TEMPLE_TIMES.chain));
  if (was[0] < 0.2 && T.chain[0] >= 0.2) out.push('chain1');
  if (was[1] < 0.2 && T.chain[1] >= 0.2) out.push('chain2');
  if (s >= TEMPLE_TIMES.swingAt && d.want === 0) {
    d.want = 1;
    out.push('swing');
  }
  if (d.want === 1 && d.open < 1) {
    d.open = Math.min(1, (s - TEMPLE_TIMES.swingAt) / TEMPLE_TIMES.swing);
    if (d.open >= 1) {
      for (const i of doorTiles(L.floor, d.spot)) {
        L.walk[i] = 1;
        L.open[i] = 1;
      }
      out.push('open');
    }
  }
  return out;
}

/** The two kinds that carry the door's keys. */
export const KEY_BEARERS = ['keyblade', 'keyflame'] as const;

/**
 * WHERE THE KEY-BEARERS WAIT: two rooms of the mine (never the start, never the temple), as far from where he comes in as can be had
 * and far from each other, a side branch's or a guardian's or an elite's before any other; the middle of each, on the floor. Fewer
 * than two if the mine has not the rooms (a floor so poor is laid again: level.ts).
 */
export function keyBearerSpots(L: Level): { x: number; y: number; room: number }[] {
  const f = L.floor;
  const part = L.lair?.part;
  const start = f.rooms.find((r) => r.kind === 'start') ?? f.rooms[0];
  const sx = start.x + start.w / 2;
  const sy = start.y + start.h / 2;
  const mid = (r: { x: number; y: number; w: number; h: number }): { x: number; y: number } => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const cands = f.rooms.filter((r) => {
    if (r.kind === 'start' || r.kind === 'boss' || r.cell || r.w * r.h < 20) return false;
    const c = mid(r);
    return !part || part[Math.floor(c.y) * f.w + Math.floor(c.x)] === 1;
  });
  const score = (r: (typeof cands)[number]): number => {
    const c = mid(r);
    const far = Math.hypot(c.x - sx, c.y - sy);
    return far + (r.path < 0 ? 12 : 0) + (r.kind === 'guardian' ? 10 : r.kind === 'elite' ? 6 : 0);
  };
  cands.sort((a, b) => score(b) - score(a) || a.id - b.id);
  const out: { x: number; y: number; room: number }[] = [];
  const spotIn = (r: (typeof cands)[number]): { x: number; y: number } | null => {
    const c = mid(r);
    let best: { x: number; y: number } | null = null;
    let bd = Infinity;
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (L.walk[y * f.w + x] !== 1) continue;
        const d = Math.hypot(x + 0.5 - c.x, y + 0.5 - c.y);
        if (d < bd) {
          bd = d;
          best = { x: x + 0.5, y: y + 0.5 };
        }
      }
    }
    return best;
  };
  for (const r of cands) {
    if (out.length >= 2) break;
    const s = spotIn(r);
    if (!s) continue;
    if (out.some((o) => Math.hypot(o.x - s.x, o.y - s.y) < 12)) continue;
    out.push({ ...s, room: r.id });
  }
  // (rooms too near each other only: the best two of them anyway)
  for (const r of cands) {
    if (out.length >= 2) break;
    const s = spotIn(r);
    if (s && !out.some((o) => o.room === r.id)) out.push({ ...s, room: r.id });
  }
  return out;
}
