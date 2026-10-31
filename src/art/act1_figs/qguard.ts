// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18, THE GLASS GALLERY: THE QUEEN'S GUARD: their pictures as the game holds a monster
// (art/act1_figs/types.ts), the art chat's (art/queens_guard.ts, queens_guard_moves.ts; his “Mirror duellists (Recommended)”,
// then “Yes, that's them (Recommended)”; docs/mockups/queens_guard/README.md): makeQGuardArt3(): their stand, the glide, the
// double slash (attack), struck, their death (shattering), and their other moves (clips.moves: stepIn, stepOut, fan).
import { QGUARD_ON } from '../queens_guard';
import { makeQGuardArt3 } from '../queens_guard_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeQGuardArt3(),
  size: { top: 36, half: 10 },
  switches: [QGUARD_ON],
};
