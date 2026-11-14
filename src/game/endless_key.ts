// ENDLESS MODE'S KEY: THE TABLET IN QUARTERS, AND THE WAY TO THE FINAL BOSS. The rules (the art is the art chat's, each piece with
// his yes: art/endless_tablet.ts, art/endless_portal.ts, art/endless_boss.ts; docs/mockups/endless_tablet/README.md).
//
// HIS IDEA, 7 Nov 2026 (the queue's build-endless-tablet-and-final-boss): in endless mode the bosses of floors 5, 10, 15 and 20
// each drop a quarter of a round stone tablet; the four, set into the wordsmith's bench, open a portal to a final boss, “Like
// something that will kick your ass if you don’t have an optimized build.” His picks then: a quarter drops “Always, if you lack it
// (Recommended)”; the tablet is “Used up, collect again (Recommended)”; a fallen hero's quarters are “Kept in the shared stash”.
// The art chat's notes for the main chat: the quarters “as items (a kind of their own, never rolled; they show `paintQuarter(k)`
// as their picture)”; “the socket's picture laid over the slab's at the same anchor whenever he holds a quarter set”; when the four
// are set, the socket's burning frames, then the portal opening on the landing.
//
// READ AS (this file): a quarter is the account's, not the hero's (kept with the stash, so a hero lost in endless loses none:
// Meta.quarters); it drops from the boss of an endless level whose floor is 5, 10, 15 or 20, once that boss falls, if the account
// lacks it and none is lying there; it lies on the floor as its item picture and is taken by walking up to it (as the quests'
// pieces are). The quarters held show in the bench's socket and on the trophies wall at the Shaft's Rim. With all four held, the
// wordsmith used at his bench sets them: they burn, and the landing opens (the portal); the four are used up (collect again). The
// portal stays open for that hero until he goes through it. Going through it, the fight is the next stage's (FINAL_BOSS).
//
// NOTHING OF THE GAME USES THIS WHILE `ENDLESS_KEY.on` IS OFF (his rule: pictures first).

/** The switch (off until he has seen it in the game and said yes). */
export const ENDLESS_KEY = { on: false };

/** The floors whose bosses each carry a quarter, in the quarters' order (art/endless_tablet.ts: k 0 to 3). */
export const QUARTER_FLOORS = [5, 10, 15, 20] as const;

/** Which quarter the boss of an endless level on this floor carries (null: none). */
export function quarterOf(floor: number): number | null {
  const k = QUARTER_FLOORS.indexOf(floor as (typeof QUARTER_FLOORS)[number]);
  return k < 0 ? null : k;
}

/** The bosses whose quarters they are (art/endless_tablet.ts: the Fleshmancer, the Swamp Colossus, the Censor, the Moth). */
export const QUARTER_BOSS = ['the Fleshmancer', 'the Swamp Colossus', 'the Censor', 'the Moth'] as const;

/** A set of quarters (bits 0 to 3) as the four held or not. */
export function quartersOf(bits: number | undefined): boolean[] {
  const b = bits ?? 0;
  return [0, 1, 2, 3].map((k) => (b & (1 << k)) !== 0);
}
/** How many of the four. */
export const quarterCount = (bits: number | undefined): number => quartersOf(bits).filter(Boolean).length;
/** All four held. */
export const tabletWhole = (bits: number | undefined): boolean => ((bits ?? 0) & 15) === 15;

/**
 * THE KEY'S MOMENTS at the bench (seconds from the moment the four are set), the art's frames at 30 a second: the four burn
 * (art/endless_tablet.ts SOCKET_LIT_FRAMES: kindling, the flare, then burning on), and as the flare's light goes up the shaft the
 * landing opens (art/endless_portal.ts PORTAL_OPEN_FRAMES), then stands open (PORTAL_IDLE, round).
 */
export const KEY_TIMES = {
  /** When the landing begins to open: as the burning's flare is done (SOCKET_LIT.kindle + SOCKET_LIT.flare, 54 frames). */
  portal: 54 / 30,
} as const;

/** How near the landing's middle he must come, the portal open, to go through (tiles). */
export const PORTAL_NEAR = 0.7;

/** What is said. */
export const KEY_TEXT = {
  // (HIS PICK, 14 Nov 2026, asked for a name “not so on the nose” than the boss's: “Tablet Shard”, the same for all four)
  label: (_k: number): string => 'Tablet Shard',
  got: (_k: number, n: number): string => `A Tablet Shard. ${n} of 4 (kept with the stash).`,
  float: (n: number): string => `SHARD ${n} / 4`,
  set: 'The four shards are set in the bench. The landing opens.',
  open: 'The landing at the shaft stands open.',
  through: 'Down into the light.',
  /** (until the next stage builds the fight below) */
  notYet: 'Below the landing, something waits. (The fight is still being built.)',
  prompt: 'Wordsmith: set the four shards in the bench',
} as const;
