// THE MAGE BROUGHT UP: HER MOVES (the art chat's helper, 7 Nov 2026; finished by the Mage chat, 11 Nov 2026;
// docs/mockups/mage_up/README.md). Behind art/mage_up.ts MAGE_UP, off.
//
// HER MOVES ARE THE GAME'S OWN, EVERY ONE (art/moves3.ts: her guard, her run, the Wave, the Orb, the Beam begun, held and let
// go, struck from in front and from behind, her fall, the mage light and the power getting away from her, her town stance and
// run, and making ready on her card): the same keys, the same lengths, the same moments her spells go. NOTHING IS RE-POSED.
//   The rule of 7 Nov 2026 (the owner, of the Ranger's stance re-posed for a leg measure: “Cmon.  He’s not a gunfighter why is
//   he so bow legged.  Just please do it right, I don’t want to have to correct every single one of these because we made a
//   minuscule change to the leg length”; and of the Warrior's re-posed run: “all that time and you screwed up his run.  why is
//   he high stepping with his knees up?”): only the look, the legs (by the length of the bones) and the eight true sides
//   change; how a hero stands, runs, holds the weapon and carries it in town stays the game's.
//   So stage 1's guard (her feet set further apart, her staff carried out at her side: 7 Nov, made before he said that) is
//   TAKEN OUT. Her staff is held as the game holds it.
//
// WHAT CHANGES IS IN HER BONES (MU_BODY below), as the Ranger's (art/ranger_up_moves.ts RU_BODY): her knee joint raised a
// little, the shin longer and the thigh shorter by as much, her hips and her feet where they were in every pose. The owner, of
// the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs and
// short legs below the knee”; and of mending every hero: “Yes, every hero (Recommended)”.

import { MAGE_BODY, MOVES3 } from './moves3';
import type { Move3 } from './moves3';
import type { Build } from './skeleton';

// ---------------------------------------------------------------------------------------------
// HER BONES: THE KNEE JOINT RAISED A LITTLE
//
// The game's Mage (moves3.ts MAGE_BODY) stands with her knee to the floor (the shin, and the ankle under it) 1.16 times her
// hip to her knee (the thigh), as the game's Ranger does. Her knee joint is raised as his was, to 1.3: the thigh shorter and
// the shin longer by the same amount (0.79 of a unit of her 54.5: four tenths of a game pixel). The whole leg is as long as it
// was, so her hips and her feet are where they were in every pose; only where the knee bends moves.
export const MU_SHIN_RATIO = 1.3;
/** How far her knee joint is raised (units). */
export const MU_KNEE_UP = MAGE_BODY.thigh - (MAGE_BODY.ankle + MAGE_BODY.shank + MAGE_BODY.thigh) / (1 + MU_SHIN_RATIO);
/** Her body, brought up: the game's Mage's, her knee joint raised by MU_KNEE_UP. */
export const MU_BODY: Build = { ...MAGE_BODY, thigh: MAGE_BODY.thigh - MU_KNEE_UP, shank: MAGE_BODY.shank + MU_KNEE_UP };

/** The game's Mage, as she is (moves3.ts, with MAGE_STANCES and WILD on, as the game has them). */
export const MU_GAME = MOVES3;

/** The game's short names of her moves (art/heroes3.ts MAGE and MAGE_TOWN, and the Beam's beginning). */
export const MU_KEYS = ['mstand', 'mrun', 'wave', 'orb', 'beam', 'beamstart', 'beamend', 'mreel', 'mlurch', 'mfall', 'mlight', 'reading', 'mtown', 'mtownrun', 'tmlight', 'treading', 'mready'] as const;
export type MuKey = (typeof MU_KEYS)[number];

/**
 * HER MOVES, BROUGHT UP: each the game's own move on her new bones, nothing else of it touched. (Read after art/moves3.ts has
 * put the game's stances and its big and wild moves in place, as it does when it is loaded.)
 */
export const MU_MOVES: Record<MuKey, Move3> = Object.fromEntries(MU_KEYS.map((k) => [k, { ...MOVES3[k], build: MU_BODY }])) as Record<MuKey, Move3>;
