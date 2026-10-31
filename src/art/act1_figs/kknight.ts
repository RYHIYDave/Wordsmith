// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: THE KING'S KNIGHTS: their pictures as the game holds a monster
// (art/act1_figs/types.ts), the art chat's (art/kings_knights.ts, kings_knights_moves.ts; his “Really big”, and “Yes, that's
// them (Recommended)”; docs/mockups/kings_knights/README.md): makeKnightArt3(): his stand (the greatsword planted), his walk
// (slow and heavy), setting off and stopping, the sweep (attack), the cleave (clips.moves), struck, his death. Twice the
// knight's height. Heavy: made for his floor.
import { KNIGHTS_ON } from '../kings_knights';
import { makeKnightArt3 } from '../kings_knights_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeKnightArt3(),
  size: { top: 62, half: 14 },
  heavy: true,
  switches: [KNIGHTS_ON],
};
