// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE FOOTMEN: their pictures as the game holds a monster (art/act1_figs/types.ts), the
// art chat's (art/masque_footmen.ts, masque_footmen_moves.ts; his yes, “Yes, that's them (Recommended)”), as handed over:
// makeFootmanArt3(): his stand, the march (walk), the tray flung (attack), the candelabrum (clips.moves.candelabrum), struck and
// his death (the tray and the candelabrum falling from him). A little taller than the knight: 63 to his 58.
import { FOOTMEN_ON } from '../masque_footmen';
import { makeFootmanArt3 } from '../masque_footmen_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeFootmanArt3(),
  size: { top: 32, half: 10 },
  switches: [FOOTMEN_ON],
};
