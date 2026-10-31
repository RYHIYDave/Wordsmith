// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: THE QUEEN: her pictures as the game holds a monster (art/act1_figs/types.ts), the
// art chat's (art/queen.ts, queen_moves.ts; his yes, “Yes, that's the Queen (Recommended)”), as handed over: makeQueenArt3(QUEEN):
// her stand, the glide (walk), the comb (attack), struck, her death (her crown's spikes snapping, on her knees), and her other
// moves (clips.moves: glassIn, glassOut, reflect, shatter). A head and a half taller than the knight, her crown of glass higher
// still. Heavy: made for her floor.
import { QUEEN_ON } from '../queen';
import { QUEEN, makeQueenArt3 } from '../queen_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeQueenArt3(QUEEN),
  size: { top: 44, half: 13 },
  heavy: true,
  switches: [QUEEN_ON],
};
