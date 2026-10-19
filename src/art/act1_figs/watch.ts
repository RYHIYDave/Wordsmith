// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE HUSHED WATCH: its pictures as the game holds a monster
// (art/act1_figs/types.ts): the art chat's (art/hushed_watch.ts, art/hushed_watch_moves.ts, made and filmed on his word of
// 18 Oct, 21:24 Pacific), as handed over: makeWatchArt3(mob), on the bones as art/new_mobs3.ts builds its mobs (mobSet,
// front and back), their trudge at the pace it is painted for: their stand at their post, their trudge (walk), the
// halberd sweep (attack), struck (reel) and the gag falling as they kneel (die). THE WATCHMAN its own look, THE SERGEANT
// its other (`looks`: the figure 'watch:1'), a yellow pack's leader's (game/act1_rules/watch.ts: Monster.form).

import { WATCH_ON } from '../hushed_watch';
import { WATCHMAN, WATCH_SERGEANT, makeWatchArt3 } from '../hushed_watch_moves';
import type { Act1Fig } from './types';

/** (measured off their stand as tests/act2_watch.test.ts measures it: a head taller than the knight; the two are one body) */
const SIZE = { top: 34, half: 10 };

export const FIG: Act1Fig | null = {
  make: () => makeWatchArt3(WATCHMAN),
  size: SIZE,
  switches: [WATCH_ON],
  looks: [{ make: () => makeWatchArt3(WATCH_SERGEANT), size: SIZE, switches: [WATCH_ON] }],
};
