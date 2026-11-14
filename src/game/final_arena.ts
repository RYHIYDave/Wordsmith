// THE BOTTOM OF THE SHAFT: THE WARPED WORDSMITH'S ARENA, as the game lays it (endless mode's final boss; the queue's
// build-endless-tablet-and-final-boss, stage 2; behind ENDLESS_KEY, game/endless_key.ts, off). Its look: art/final_arena.ts,
// render/final_arena.ts.
//
// THE PLACE: round, as the shaft is: a floor 16 tiles across (FINAL_PLACE.floor round its middle), walkable to its edge, the
// body held off the rubble by its round (`fence`); nothing else in it. He comes down in the portal's light at its near side
// (FINAL_ARRIVE); the boss waits at its far side, facing him (FINAL_BOSS_AT). The way back up is his death's (stage 4): until then
// there is none, and he fights.
//
// AS A LEVEL: an endless level as far as the rest of the game goes (its monsters at the endless level he has reached, its death
// the hero's end: his pick for endless mode), but no floor of the game's: its depth FINAL_DEPTH, past the last built, so that no
// floor's own rules wake in it.

import { FINAL_ARRIVE, FINAL_BOSS_AT, FINAL_PLACE } from '../art/final_arena';
import { RNG } from '../engine/rng';
import { finish } from './level';
import type { Level } from './state';
import { T_FLOOR, T_VOID, T_WALL } from './types';
import type { Floor } from './types';

export { FINAL_ARRIVE, FINAL_BOSS_AT, FINAL_PLACE };

/** The arena's depth as the game counts floors: past the last built (it is no floor of theirs). */
export const FINAL_DEPTH = 99;
/** How long after he has come down the boss wakes, if the hero has not come near him first (seconds). */
export const FINAL_WAKE = 2.5;
/** Its name, as the floors' names come up across the screen. */
export const FINAL_NAME = { place: 'The Shaft', level: 'The Bottom of the Shaft' } as const;

/** Is this level the arena? */
export function isFinal(L: Level | null | undefined): boolean {
  return !!L && !!L.final;
}

/** Whether a body of radius `r` may stand at (x, y): on the floor, held off its edge by its round. */
export function onArena(x: number, y: number, r: number): boolean {
  return Math.hypot(x - FINAL_PLACE.cx, y - FINAL_PLACE.cy) <= FINAL_PLACE.floor - r;
}

/** How far (tiles) from (x, y) along (dx, dy) the floor goes before its edge, for a body of radius `r` (0 if it is off it). */
export function toEdge(x: number, y: number, dx: number, dy: number, r: number): number {
  const ox = x - FINAL_PLACE.cx;
  const oy = y - FINAL_PLACE.cy;
  const R = FINAL_PLACE.floor - r;
  const b = ox * dx + oy * dy;
  const c = ox * ox + oy * oy - R * R;
  const disc = b * b - c;
  if (disc < 0) return 0;
  return Math.max(0, -b + Math.sqrt(disc));
}

/** THE ARENA, laid. */
export function makeFinalArena(seed: number): Level {
  const P = FINAL_PLACE;
  const W = P.w;
  const H = P.h;
  const tiles = new Uint8Array(W * H).fill(T_VOID);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = Math.hypot(x + 0.5 - P.cx, y + 0.5 - P.cy);
      // (every tile a body at the floor's edge lies over is floor: its round holds him, not these tiles)
      if (r <= P.floor + 0.75) tiles[y * W + x] = T_FLOOR;
      else if (r <= P.wall + 1) tiles[y * W + x] = T_WALL;
    }
  }
  const rng = new RNG((seed ^ 0x6f1a2b3c) >>> 0);
  const variant = new Uint8Array(W * H);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  const floor: Floor = {
    depth: FINAL_DEPTH,
    seed,
    w: W,
    h: H,
    tiles,
    variant,
    rooms: [{ id: 0, x: 2, y: 2, w: W - 4, h: H - 4, kind: 'boss', path: 0 }],
    start: { x: FINAL_ARRIVE.x, y: FINAL_ARRIVE.y },
    boss: { x: FINAL_BOSS_AT.x, y: FINAL_BOSS_AT.y },
    packs: [],
    props: [],
  };
  const level = finish(floor, false, null);
  level.fence = (x, y, r) => onArena(x, y, r);
  level.final = { arrive: { x: FINAL_ARRIVE.x, y: FINAL_ARRIVE.y } };
  // (all of it seen from the first: a round floor and nothing in it to hide behind)
  level.explored.fill(1);
  return level;
}
