// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE PALACE GUARD: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/palace_guard.ts, palace_guard_moves.ts; his yes, 28 Oct 2026: “Yes, that's the guard (Recommended)”), as
// handed over: makeGuardArt3(mob), on the bones of the city watch, a head taller than the knight (mobSet, front and back), their
// march at its own pace: their stand at attention, the march (walk), the long thrust (attack), the wide sweep (its move
// `sweep`), struck (reel), and to one knee, then a crash (die). TWO LOOKS in one kind, each guard one of them (its rules give it
// its form: game/act1_rules/pguard.ts): the partisan guard (GUARD_PARTISAN, its own pictures) and the sword guard with his tall
// shield (GUARD_SWORD, its other look, the figure 'pguard:1'), its death its own too.

import { GUARD_ON } from '../palace_guard';
import { GUARD_PARTISAN, GUARD_SWORD, makeGuardArt3 } from '../palace_guard_moves';
import type { Act1Fig } from './types';

/** (measured off their stand as tests/act2_pguard.test.ts measures it: a head taller than the knight, the helmet's top at 34 and its plume rising to 40; the two are one body) */
const SIZE = { top: 36, half: 11 };

export const FIG: Act1Fig | null = {
  make: () => makeGuardArt3(GUARD_PARTISAN),
  size: SIZE,
  switches: [GUARD_ON],
  looks: [{ make: () => makeGuardArt3(GUARD_SWORD), size: SIZE, switches: [GUARD_ON] }],
};
