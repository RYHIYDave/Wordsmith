// ENDLESS MODE: past the last floor built, the floors already built again, chosen at random, each harder than the last, for as
// long as the hero lives. Behind ENDLESS (off until he has seen pictures of it from the game and said yes: his rule, pictures
// first).
//
// His words to the main chat, 20 Oct 2026, 14:18 Pacific: “I’d like once you beat whatever the last level we have built, it
// picks a random leveled scaled up so you can go in an endless mode of harder and harder levels until you want to stop.  Or
// until you die?  We’ll call it endless mode and if you die it’s over.” Asked as one pop-up, his picks:
// - leaving a run by the waypoint to town: “Pick up where you left off (Recommended)” (the waypoint takes him back to the
//   endless level he reached; only dying ends the run);
// - dying in it: “The hero too” (offered as: dying in endless loses the hero even in Normal mode; told that his rulebook says a
//   Normal death never loses the hero, so this changes that rule there);
// - how much harder: “10% more each level (Recommended)” (monsters' life and damage 10% on the last level's, adding up);
// - which floors: “All 15 floors” (offered as: floor 1 too, with its boss but without the lesson).
// Read as (told him so): the last floor beaten, he goes home as now, and from then the town's waypoint takes him into endless
// mode; each level a floor from 1 to the last built, at random, never the same twice running; the first a floor tougher than
// the last built (its depth's strength, game/defs.ts scaleLife and scaleDmg), each after it 10% more life and damage than the
// one before; what drops grows on as the floors' depth would; the waypoint to town and back to the level reached; a death
// there the hero's end, as a Hardcore death is (the Lexicon and the stash kept). A warning as each endless level begins.
//
// HOW THE GAME HOLDS IT (game/game.ts): `Game.endless`, the endless level the hero has reached (0: not yet open to him);
// `Game.endlessFloor`, the floor it is (1 to the last built); `Game.inEndless`, whether the floor he is on is it. On it,
// `Game.depth` is that floor (so all that is the floor's own is as it is there: its ground, its pieces, its monsters, its boss,
// its event), and `Game.power` the depth its strength and its finds are of (`endlessPower`); `Game.tough` the more on its
// monsters' life and damage (`endlessTough`).

import { RNG } from '../engine/rng';
import { lastFloor } from './act1';

/** THE SWITCH (off: the last floor beaten is the end of the way, as up to Version 23.2). `grow`: each endless level's monsters this much more life and damage than the last's (his pick, 10%). */
export const ENDLESS = { on: false, grow: 0.1 };

/** The depth an endless level's strength and finds are of: the first one floor past the last built, each after it one more. */
export function endlessPower(level: number): number {
  return lastFloor() + Math.max(1, Math.floor(level));
}

/** How much more life and damage an endless level's monsters have than its depth gives (`endlessPower`): 1 on the first, 10% more on each after, adding up. */
export function endlessTough(level: number): number {
  return Math.pow(1 + ENDLESS.grow, Math.max(1, Math.floor(level)) - 1);
}

/** Which floor an endless level is: one of 1 to the last built, at random (the same for the same hero and level), never `prev` (the one before it). */
export function endlessFloorFor(seed: number, level: number, prev: number): number {
  const last = lastFloor();
  const rng = new RNG((Math.imul(seed | 0, 0x2c1b3c6d) ^ Math.imul(Math.max(1, Math.floor(level)), 0x297a2d39) ^ 0x5eed) >>> 0);
  const from: number[] = [];
  for (let d = 1; d <= last; d++) if (d !== prev) from.push(d);
  return from.length ? rng.pick(from) : 1;
}

/** What an endless level is called on the screen. */
export function endlessName(level: number): string {
  return `Endless ${Math.max(1, Math.floor(level))}`;
}

/** The warning as each endless level begins (his pick: a death here is the hero's end). */
export const ENDLESS_WARN = 'Fall here and your hero is lost';

/** How much longer an endless level's card is up than a floor's (FLOOR_NAMES.secs), its warning to be read, in seconds. */
export const ENDLESS_CARD_MORE = 1.5;

/** Said in town as the endless levels open to him, the last floor built beaten. */
export const ENDLESS_OPENS = 'Endless mode is open: the waypoint leads on, each level harder. Fall there and your hero is lost.';
