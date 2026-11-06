// FLOOR 3'S SIDE BOSS, THE STOKER: his pictures as the game holds a monster (art/act1_figs/types.ts), the art chat's (art/stoker.ts,
// stoker_moves.ts; docs/mockups/stoker/README.md; his “Yes, hand it over (Recommended)”, 6 Nov 2026): makeStokerArt(): his stand,
// his walk, the shovel of coals (attack), the fire rake and the furnace's burst (moves), struck, and his death, the furnace
// exploding. Twice the knight's height; heavy to paint (each frame on the heroes' bones): painted beside the game for his floor.
import { STOKER_ON } from '../stoker';
import { makeStokerArt } from '../stoker_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeStokerArt(),
  size: { top: 58, half: 18 },
  heavy: true,
  switches: [STOKER_ON],
};
