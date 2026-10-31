// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19: THE KING: his pictures as the game holds a monster (art/act1_figs/types.ts), the art
// chat's (art/king.ts, king_moves.ts; his yes, “Yes, that's the King (Recommended)”), as handed over: makeKingArt3(KING): his stand
// (bowed under the Hush, heaving for breath), his walk (slow and heavy, the sword dragged), the sweep (attack), struck, his death,
// and his other moves (clips.moves: decree, crown, curtains, climbOff). With the Hush on his back, twice the knight's height.
// Heavy: made for his floor. His last phase, the Hush climbed off him, is his other look (KING_ALONE: Monster.form 1).
import { KING_ON } from '../king';
import { KING, KING_ALONE, makeHushArt3, makeKingArt3 } from '../king_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeKingArt3(KING),
  size: { top: 58, half: 16 },
  heavy: true,
  switches: [KING_ON],
  looks: [
    { make: () => makeKingArt3(KING_ALONE), size: { top: 52, half: 16 }, heavy: true, switches: [KING_ON] },
    // (THE HUSH ON ITS OWN, at his side in his last phase: not a monster of its own, but his pictures hold it, 'gking:2', for
    // render/act1_fx/gking.ts to draw where game/act1_rules/gking.ts has it stand: its stand, and its end, unwinding into nothing)
    { make: () => makeHushArt3(), size: { top: 52, half: 12 }, heavy: true, switches: [KING_ON] },
  ],
};
