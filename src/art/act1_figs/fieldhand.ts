// ACT 2, THE HUSH: FLOOR 13: THE HUSHED WORKING THE FIELDS: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/fieldhands.ts, fieldhands_moves.ts; made on his word of 18 Oct, 21:24 Pacific, for floors 11 to 15),
// as handed over: makeFieldArt3(mob), on the heroes' bones as new_mobs3.ts builds its mobs (mobSet, front and back), its
// shuffle at its own pace: their stand (reaping at nothing), their shuffle (walk), the sickle slash (attack), struck (reel)
// and the Hush leaving them (die). TWO LOOKS, each fieldhand one of them (its rules give it its form: game/act1_rules/
// fieldhand.ts): the reaper (FIELD_REAPER, its own pictures) and the gleaner (FIELD_GLEANER, its other look, figure
// 'fieldhand:1'). Light: painted beside the game as the descent's small kinds are.

import { FIELDHANDS_ON } from '../fieldhands';
import { FIELD_GLEANER, FIELD_REAPER, makeFieldArt3 } from '../fieldhands_moves';
import type { Act1Fig } from './types';

// (measured off their stand as tests/act2_fieldhand.test.ts measures it: the reaper's straw hat and the gleaner's bonnet
// stand a little over the knight's head, stooped as they are; half their width at the body)
const SIZE = { top: 29, half: 9 };

export const FIG: Act1Fig | null = {
  make: () => makeFieldArt3(FIELD_REAPER),
  size: SIZE,
  switches: [FIELDHANDS_ON],
  looks: [{ make: () => makeFieldArt3(FIELD_GLEANER), size: SIZE, switches: [FIELDHANDS_ON] }],
};
