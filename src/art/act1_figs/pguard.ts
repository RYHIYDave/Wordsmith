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
import { GUARD_DRILL, JAV_PARTISAN, JAV_PARTISAN_SWORD, JAV_SWORD, JAV_SWORD_AFTER, makeJavelinGuardArt } from '../action_f16_guard';

/** (measured off their stand as tests/act2_pguard.test.ts measures it: a head taller than the knight, the helmet's top at 34 and its plume rising to 40; the two are one body) */
const SIZE = { top: 36, half: 11 };

// (THE JAVELIN, behind GUARD_DRILL: art/action_f16_guard.ts, his pick of 2 Nov 2026: the partisan guard with a sword at his hip (form 0), the
// sword guard with a javelin on his back (1), the partisan guard with his sword drawn while his partisan is stuck in the turf (2), the
// sword guard with his back bare (3): game/act1_rules/pguard.ts)
const OLD_LOOKS: readonly Act1Fig[] = [{ make: () => makeGuardArt3(GUARD_SWORD), size: SIZE, switches: [GUARD_ON] }];
const JAV_LOOKS: readonly Act1Fig[] = [
  { make: () => makeJavelinGuardArt(JAV_SWORD), size: SIZE, switches: [GUARD_ON] },
  { make: () => makeJavelinGuardArt(JAV_PARTISAN_SWORD), size: SIZE, switches: [GUARD_ON] },
  { make: () => makeJavelinGuardArt(JAV_SWORD_AFTER), size: SIZE, switches: [GUARD_ON] },
];
export const FIG: Act1Fig | null = {
  make: () => (GUARD_DRILL.on ? makeJavelinGuardArt(JAV_PARTISAN) : makeGuardArt3(GUARD_PARTISAN)),
  size: SIZE,
  switches: [GUARD_ON],
  get looks() {
    return GUARD_DRILL.on ? JAV_LOOKS : OLD_LOOKS;
  },
};
