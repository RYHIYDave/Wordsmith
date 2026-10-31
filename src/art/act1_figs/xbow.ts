// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19: THE CROSSBOWMEN: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/keep_crossbowmen.ts, keep_crossbowmen_moves.ts; his yes: “Yes, that's them (Recommended)”), as handed over:
// makeCrossbowArt3(), front and back: standing behind the pavise planted (their stand), the jog with it on their backs (walk), the
// aimed shot (attack), the plant and the reload (their moves by name), struck (reel) and the Hush leaving them (die). Their death
// to be swapped for the art chat's new one when it posts it (board, 30 Oct 18:26). Light: painted beside the game as the small
// kinds are.

import { CROSSBOW_ON } from '../keep_crossbowmen';
import { makeCrossbowArt3 } from '../keep_crossbowmen_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeCrossbowArt3(),
  // (the knight's height, the kettle helm's crown; the pavise before them)
  size: { top: 30, half: 11 },
  switches: [CROSSBOW_ON],
};
