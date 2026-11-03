// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE RIME SHADE: its pictures as the game holds a monster
// (art/act1_figs/types.ts), the art chat's (art/rime_shade.ts, rime_shade_moves.ts; his pick “Rime Shade (Recommended)”, his yes
// to hand it over, “Yes, and lying rime slows (Recommended)”; docs/mockups/rime_shade/README.md): makeRimeShadeArt3(): its stand,
// its drift (walk), the Rime Breath (attack), struck, and its death, coming apart into fog. Hunched, about the knight's height.
import { RIME_SHADE_ON } from '../rime_shade';
import { makeRimeShadeArt3 } from '../rime_shade_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeRimeShadeArt3(),
  size: { top: 37, half: 11 },
  switches: [RIME_SHADE_ON],
};
