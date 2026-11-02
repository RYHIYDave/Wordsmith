// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE HUSHED WATCH: its pictures as the game holds a monster
// (art/act1_figs/types.ts): the art chat's (art/hushed_watch.ts, art/hushed_watch_moves.ts, made and filmed on his word of
// 18 Oct, 21:24 Pacific), as handed over: makeWatchArt3(mob), on the bones as art/new_mobs3.ts builds its mobs (mobSet,
// front and back), their trudge at the pace it is painted for: their stand at their post, their trudge (walk), the
// halberd sweep (attack), struck (reel) and the gag falling as they kneel (die). THE WATCHMAN its own look, THE SERGEANT
// its other (`looks`: the figure 'watch:1'), a yellow pack's leader's (game/act1_rules/watch.ts: Monster.form).

import { WATCH_ON } from '../hushed_watch';
import { WATCHMAN, WATCH_SERGEANT, makeWatchArt3 } from '../hushed_watch_moves';
import { LANTERN_SERGEANT, LANTERN_WATCHMAN, OIL_CANVAS, POOL, WATCH_LANTERN, makeLanternWatchArt, oilPainted } from '../action_f11_watch';
import { toSprite } from '../kit';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

/** (measured off their stand as tests/act2_watch.test.ts measures it: a head taller than the knight; the two are one body) */
const SIZE = { top: 34, half: 10 };

export const FIG: Act1Fig | null = {
  // (and the chop and the lantern throw, behind WATCH_LANTERN: art/action_f11_watch.ts, his yes, 2 Nov 2026)
  make: () => (WATCH_LANTERN.on ? makeLanternWatchArt(LANTERN_WATCHMAN) : makeWatchArt3(WATCHMAN)),
  size: SIZE,
  switches: [WATCH_ON],
  looks: [{ make: () => (WATCH_LANTERN.on ? makeLanternWatchArt(LANTERN_SERGEANT) : makeWatchArt3(WATCH_SERGEANT)), size: SIZE, switches: [WATCH_ON] }],
};

// THE BURNING OIL (WATCH_LANTERN), as the game draws it: every pool the same at the same moment of it, so its frames are painted ahead
// (art/films.ts things:watch), OIL_FPS a second from its smash to its end, or, until they are, as each is first wanted.
export const OIL_FPS = 10;
export const OIL_N = Math.ceil(POOL.burn * OIL_FPS) + 1;
export const oilFrame = (t: number): number => (t < 0 || t > POOL.burn ? -1 : Math.min(OIL_N - 1, Math.floor(t * OIL_FPS)));
export const oilSprite = (i: number): Sprite => toSprite(oilPainted(i / OIL_FPS, 'floor'), null, OIL_CANVAS.ax, OIL_CANVAS.ay);
/** ITS OIL, painted ahead: `oil` its frames. */
export function watchThings(): Record<string, Sprite[]> {
  return { oil: Array.from({ length: OIL_N }, (_, i) => oilSprite(i)) };
}
