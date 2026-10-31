// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE MOTH: its pictures as the game holds a monster (art/act1_figs/
// types.ts), the art chat's (art/moth.ts, moth_moves.ts; his pick “Slow, heavy wingbeats”, and his yes, “Yes, that's the Moth
// (Recommended)”; docs/mockups/moth/README.md): makeMothArt3(): its hovering (stand, one slow beat), its drift (walk, the same beat
// frame for frame), the buffet (attack), Dust, the Eyes, the Swarm, coming down on the book, on the book, the beat, struck (in the
// air and on the book), its death (it screams, the words pour out, it falls and crumbles to dust). Vast: the biggest thing in the
// game. Heavy: made for its floor.
import { MOTH_ON } from '../moth';
import { makeMothArt3 } from '../moth_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeMothArt3(),
  size: { top: 160, half: 40 },
  heavy: true,
  switches: [MOTH_ON],
};
