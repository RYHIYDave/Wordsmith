// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE HUSHED TOWNSFOLK: its pictures as the game holds a monster
// (art/act1_figs/types.ts): the art chat's (art/hushed.ts, art/hushed_moves.ts, his yes to their look and their four
// films), as handed over: makeHushedArt3(mob), on the bones as art/new_mobs3.ts builds its mobs (mobSet, front and back),
// their shuffle at the pace it is painted for: their stand, their shuffle (walk), the lunge and grab (attack), struck
// (reel) and the Hush leaving them (die). A CROWD OF THREE: the porter its own look, the goodwife and the baker its others
// (`looks`: the figures 'hushed1' and 'hushed2'), each one's look given by its rules as it comes into the world
// (game/act1_rules/hushed.ts: Monster.form). One figure's frames are painted for each of the three that is on the floor.

import { HUSHED_ON } from '../hushed';
import { HUSHED_BAKER, HUSHED_GOODWIFE, HUSHED_PORTER, makeHushedArt3 } from '../hushed_moves';
import type { Act1Fig } from './types';

/** (measured off their stand as tests/act2_hushed.test.ts measures it: the three are one body) */
const SIZE = { top: 28, half: 9 };

export const FIG: Act1Fig | null = {
  make: () => makeHushedArt3(HUSHED_PORTER),
  size: SIZE,
  switches: [HUSHED_ON],
  looks: [
    { make: () => makeHushedArt3(HUSHED_GOODWIFE), size: SIZE, switches: [HUSHED_ON] },
    { make: () => makeHushedArt3(HUSHED_BAKER), size: SIZE, switches: [HUSHED_ON] },
  ],
};
