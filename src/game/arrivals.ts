// ENEMIES COMING IN, NOT OUT OF THIN AIR. His words, 7 Nov 2026, 00:05 (Eastern): “make the enemies coming in a little more
// dramaitc than just spawning into thin air”. So, `on`: one that comes into a fight already begun (the Hush's risings and the
// tough one a bell calls, floors 11 to 15; a stronghold's waves, floors 6 to 10) comes up out of a RIFT: a dark tear opens in
// the floor under it, its edge the enemy's pink, and it rises up out of it and steps out; only then is it one of the monsters
// (game.ts `arriveFrom`, as the Warden's dead crawl out: Riser, way 'rift'). Drawn: render/arrivals.ts. Off until he has seen it
// (PICTURES FIRST).

export const ARRIVALS = {
  on: true,
  /** Seconds from the rift opening to its one being out and in the fight. */
  rise: 1.0,
  /** Of those, how long the rift takes to open before anything comes up out of it. */
  open: 0.3,
  /** Seconds between one and the next of the same coming. */
  apart: 0.12,
  /** Seconds the rift takes to close behind it. */
  close: 0.4,
  /** The rift's size (tiles across, as a radius) for a small, medium and large one (and a boss's). */
  size: { small: 0.45, medium: 0.6, large: 0.85, boss: 1.1 } as Record<string, number>,
};

/** The size of the rift one of `size` comes up out of. */
export function riftSize(size: string | undefined): number {
  return ARRIVALS.size[size ?? 'small'] ?? ARRIVALS.size.small;
}
