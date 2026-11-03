// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: THE LADIES-IN-WAITING: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/gallery_ladies.ts, gallery_ladies_moves.ts; mockup/gallery-ladies, handed over 31 Oct 18:00 with his yes;
// brought in by the main chat at his word of 2 Nov 2026, “All of it in this one”): makeLadyArt3(), front and back: her stand, her
// glide forward (walk), the flash from range (attack), struck (reel), the swoon (die), and her glides back and round you
// (clips.moves).
import { LADIES_ON } from '../gallery_ladies';
import { makeLadyArt3 } from '../gallery_ladies_moves';
import type { Act1Fig } from './types';

// (a little shorter than the knight, her lace collar and piled hair; her gown wide at the hem)
export const FIG: Act1Fig | null = { make: () => makeLadyArt3(), size: { top: 32, half: 10 }, switches: [LADIES_ON] };
