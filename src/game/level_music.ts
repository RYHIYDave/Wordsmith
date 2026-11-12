// ACT 1'S LEVEL MUSIC: WHERE, AND WHEN A FIGHT IS ON (the sound chat's tenth batch, 12 Nov 2026: assets/sound/README.md, "Tenth
// batch"; his songs, “That’s all the tracks for the first five levels and the town”; try-out 15, “All good, hand over
// (Recommended)”). engine/audio.ts levelMusic plays it; this says which place's, and whether its fight is on.
//   THE PLACE: the town he starts in (the prison town: not the camp inside Vellum's gate, nor the Shaft's Rim), and floors 1 to 5
//   of the way down; nowhere else yet (no music has been made for it), nor on the endless levels.
//   A FIGHT: from the moment an enemy awake and near him is there (game.ts inFight: something that has woken, that is, seen or
//   heard him, within GUIDE.near, not shut in behind a door), until `calm` seconds after the last of them has died or lost him, so
//   that the music does not flip back and forth in a running fight (the sound chat's suggestion; the main chat's call). Never in
//   town.
import { isCamp } from './camp';
import type { Game } from './game';

/** THE SWITCH: off, no level music. */
export const LEVEL_MUSIC = { on: true };
/** A fight's music stays this many seconds after the last enemy near him has died or lost him. */
export const FIGHT_MUSIC = { calm: 4 };

/** Which place's music (engine/audio.ts MUSIC_PLACES: 'town', 'f1' to 'f5'), or null: none here. */
export function musicPlace(g: Game): string | null {
  if (!LEVEL_MUSIC.on) return null;
  const L = g.level;
  if (L.town) return !L.rim && !isCamp(L) ? 'town' : null;
  if (g.inEndless) return null;
  const d = L.floor.depth;
  return d >= 1 && d <= 5 ? `f${d}` : null;
}

/** What the fight's music remembers from frame to frame: the seconds since a fight was last on (Infinity: none since he came). */
export type FightWas = { calm: number; level: unknown };
export function fightWas(): FightWas {
  return { calm: Infinity, level: null };
}

/** Is a fight's music on, this frame (`dt` the frame's seconds; 0 while the game stands still)? */
export function fightMusic(was: FightWas, g: Game, dt: number): boolean {
  if (was.level !== g.level) {
    was.level = g.level;
    was.calm = Infinity;
  }
  if (g.level.town) {
    was.calm = Infinity;
    return false;
  }
  if (g.inFight()) was.calm = 0;
  else was.calm += dt;
  return was.calm < FIGHT_MUSIC.calm;
}
