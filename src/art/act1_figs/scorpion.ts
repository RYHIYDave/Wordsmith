// ACT 1: THE CANYON SCORPIONS (FLOOR 8): its pictures as the game holds a monster (art/act1_figs/types.ts): the art
// chat's, through its own maker, makeScorpionArt() (art/canyon_scorpions.ts), each move with his yes, as shown: its stand
// (dead still but for its breath), its scuttle (painted for SC_PACE, 2 tiles a second), its pincer snap (`attack`), its
// tail strike (`clips.moves.sting`, its venom's jet and splash two tiles on painted in its own picture), its flinch
// (`reel`) and its death (`die`, thirty a second as it is painted).

import { SCORPION_ON, makeScorpionArt } from '../canyon_scorpions';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeScorpionArt,
  // (measured off its standing picture: its head-plate and back, under its raised tail; half its body)
  size: { top: 19, half: 14 },
  switches: [SCORPION_ON],
};
