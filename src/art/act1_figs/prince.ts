// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE PRINCE: his pictures as the game holds a monster (art/act1_figs/types.ts), the art
// chat's (art/prince.ts, prince_moves.ts; his yes, “Yes, that's the Prince (Recommended)”), as handed over: makePrinceArt3(PRINCE):
// his stand (never still), the dance-step (walk), the thrust (attack), struck, his death (the mask cracking, the fog, his clothes
// falling empty), and his other moves (clips.moves: setOff, halt, dart, dance, waltz, masks, midnight). A head taller than the
// knight. Heavy: made for his floor.
import { PRINCE_ON } from '../prince';
import { PRINCE, makePrinceArt3 } from '../prince_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makePrinceArt3(PRINCE),
  size: { top: 42, half: 12 },
  heavy: true,
  switches: [PRINCE_ON],
};
