// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE SILENT ORDER'S SCRIBES: its pictures as the game holds a monster
// (art/act1_figs/types.ts): the art chat's (art/scribes.ts, art/scribes_moves.ts, made on his word of 18 Oct, 21:24
// Pacific), as handed over: makeScribeArt3(), on the bones as art/new_mobs3.ts builds its mobs (mobSet, front and back),
// their glide at the pace it is painted for: writing in the ledger (stand), the glide (walk), the ink flick (attack),
// struck (reel), and the mask splitting, the pages flying (die). What the ink does on the floor is render/act1_fx/scribe.ts.

import { SCRIBES_ON } from '../scribes';
import { makeScribeArt3 } from '../scribes_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeScribeArt3(),
  // (measured off its stand as tests/act2_scribe.test.ts measures it)
  size: { top: 28, half: 9 },
  switches: [SCRIBES_ON],
};
