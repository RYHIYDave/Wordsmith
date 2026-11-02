// ACT 1: THE FOG WOLVES (FLOOR 9): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/fog_wolves.ts, his yes to each), as handed over: makeWolfArt(), its stand, its glide (walk), its bite (attack),
// struck (reel) and its death.

import { WOLF_ON, makeWolfArt } from '../fog_wolves';
import { WOLF_PACK, makePackWolfArt } from '../action_f9_pinewood';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  // (and its pack strike's lunge, behind WOLF_PACK: art/action_f9_pinewood.ts, his yes, 2 Nov 2026)
  make: () => (WOLF_PACK.on ? makePackWolfArt() : makeWolfArt()),
  // (measured off its stand as tests/act1_wolf.test.ts measures it)
  size: { top: 19, half: 13 },
  switches: [WOLF_ON],
};
