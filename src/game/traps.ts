// THE TRAPS: what the dungeon itself lays for the hero. The spike floor, the dart wall, and the
// sealed word door.
//
// The owner, 4 Oct 2026, 20:23: "And let's add some puzzles and traps in the dungeons when the
// dungeons get overhauled". A list of six went to him with Version 14.1; he picked none, and was
// told that the first to be built would then be the spike floor, the dart wall and the word door.
// His gameplay rulebook (approved 8 Oct 2026, 10:33: `docs/gameplay/RULEBOOK.md`) has "Traps and
// puzzles: the spike floor, the dart wall, and the word door, which opens only to an attack
// carrying its word", next on the list; and his order of the same morning: the traps, then Normal
// mode. (In the code these are HAZARDS and the SEALED DOOR, since the ranger's own Trap has the
// name already; on the screen, "spikes", "darts", "a sealed door".)
//
// NOT IN ANY DUNGEON: pictures first. The hall laid by hand for them (`#hall=traps`,
// game/level.ts, `makeTrapHall`) shows every one; the map-maker lays none until `TRAPS.on`, which
// waits for his yes to the pictures.
//
//   THE SPIKE FLOOR. A patch of floor whose spikes come up on a beat: down, then a moment's
//   warning (the holes glint), then up. Up, they hurt whatever walks on the patch, the hero and
//   the monsters alike (a share of each one's life, so a pack can be led over them), once each
//   time they rise. Bats fly over them. The holes are always to be seen.
//   THE DART WALL. A plate in a corridor's floor and a slot in the wall at the corridor's end. The
//   hero steps on the plate (it clicks): three darts leave the slot one after another, all at the
//   place where the hero stood as it clicked, and hurt what they meet, hero or monster. So the
//   click is the warning: move, and they go by; a roll or a leap gets past them, as it gets past
//   an arrow. A monster on the plate does not set it off. It is ready again a few seconds later.
//   THE SEALED DOOR (a door kind, 'worddoor': game/doors.ts). In the way in of a small room, a
//   door with a rune of a word on it, in that word's own colour. It opens to nobody who comes near:
//   only to a hit from an attack that carries its word ("FLAME on the door: hit it with a flame
//   attack"); then it swings open as a door does, and stays open. Until then nothing passes it,
//   nor a shot, nor sight. The first time it is seen from near, a line says what it wants.

import type { Floor, HazardSpot } from './types';

/**
 * Whether the map-maker lays traps in a dungeon. OFF: pictures first (the hall laid by hand for
 * them shows them whatever this says). The tests that try the map-maker's traps set it, and put it
 * back.
 */
export const TRAPS = { on: false };

/**
 * THE SPIKE FLOOR'S BEAT, in seconds: down, the warning, up; how long the spikes take to come up
 * (they snap up) and to go down again at the end of `up`; and what one rise takes: this share of
 * the life of whatever is on the patch (the hero's before armour; a monster's own).
 */
export const SPIKE = { down: 1.6, warn: 0.3, up: 0.6, rise: 0.06, sink: 0.15, share: 1 / 6 };
/** One whole beat. */
export const SPIKE_BEAT = SPIKE.down + SPIKE.warn + SPIKE.up;

/**
 * THE DART WALL: how many darts leave the slot, the time between them (and before the first: the
 * plate's click), how fast they fly (an archer's arrow flies at 10), the share of life one takes
 * (as the spikes'), the seconds before the plate is ready again, how big a dart is, and how far it
 * flies.
 */
export const DART = { count: 3, gap: 0.2, first: 0.25, speed: 13, share: 0.12, rearm: 3, r: 0.14, reach: 18 };

export type SpikeAt = 'down' | 'warn' | 'up';

/** Where a spike floor is in its beat at time `t` (seconds since the level began), and how far through that part of it (0 to 1). */
export function spikeAt(s: HazardSpot, t: number): { at: SpikeAt; k: number } {
  let u = (t + (s.phase ?? 0)) % SPIKE_BEAT;
  if (u < 0) u += SPIKE_BEAT;
  if (u < SPIKE.down) return { at: 'down', k: u / SPIKE.down };
  u -= SPIKE.down;
  if (u < SPIKE.warn) return { at: 'warn', k: u / SPIKE.warn };
  u -= SPIKE.warn;
  return { at: 'up', k: u / SPIKE.up };
}

/** How far up a spike floor's spikes stand at time `t`: 0 down, 1 all the way up (for the picture: they snap up, and sink at the end). */
export function spikeHeight(s: HazardSpot, t: number): number {
  const { at, k } = spikeAt(s, t);
  if (at !== 'up') return 0;
  const u = k * SPIKE.up;
  if (u < SPIKE.rise) return u / SPIKE.rise;
  if (u > SPIKE.up - SPIKE.sink) return Math.max(0, (SPIKE.up - u) / SPIKE.sink);
  return 1;
}

/** Is this place on the hazard's tiles (a spike floor's patch; a dart wall's plate)? */
export function onHazard(s: HazardSpot, x: number, y: number): boolean {
  return x >= s.x && y >= s.y && x < s.x + s.w && y < s.y + s.h;
}

/** Where a dart wall's darts leave its slot: just out from the face of the slot's wall, in the middle of it. */
export function slotMouth(s: HazardSpot): { x: number; y: number } {
  const q = s.slot;
  if (!q) return { x: s.x + 0.5, y: s.y + 0.5 };
  return { x: q.x + 0.5 + q.dx * 0.62, y: q.y + 0.5 + q.dy * 0.62 };
}

/** A hazard as the game keeps it. */
export interface HazardInst {
  spot: HazardSpot;
  /** (spikes) Who has been hurt by this rise: monsters' ids, and -1 for the hero. */
  hit: number[];
  /** (spikes) Whether they were up in the last step. */
  wasUp: boolean;
  /** (darts) Seconds until the plate is ready again (0: ready). */
  ready: number;
  /** (darts) Darts still to leave the slot, and the seconds until the next does. */
  left: number;
  next: number;
  /** (darts) Seconds the plate still shows pressed down. */
  pressed: number;
  /** (darts) Where the hero stood as the plate clicked: where every dart of that click flies. */
  aimX: number;
  aimY: number;
}

/** The hazards of a level as a run begins: every plate ready. */
export function makeHazards(f: Floor): HazardInst[] {
  return (f.hazards ?? []).map((spot) => ({ spot, hit: [], wasUp: false, ready: 0, left: 0, next: 0, pressed: 0, aimX: 0, aimY: 0 }));
}
