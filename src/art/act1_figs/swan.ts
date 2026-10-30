// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16: THE SWANS: their pictures as the game holds a monster (art/act1_figs/types.ts), the
// art chat's (art/garden_swans.ts; his yes to them, 28 Oct 2026: “Yes, they're the swans (Recommended)”), as handed over:
// makeSwanArt(), painted from their own solids as the fog wolves are (front and back): their stand (its wings arched over its
// back in threat, breathing, glancing, now and then a hiss), the waddle (walk: their charge too, played faster: game/act1_rules/
// swan.ts), the hissing lunge and bite (attack), struck (reel), and knocked over in a burst of feathers (die). Light: painted
// beside the game as the small kinds are.

import { SWAN_ON, makeSwanArt } from '../garden_swans';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeSwanArt,
  // (measured off its stand as tests/act2_swan.test.ts measures it: knee-high to the knight, its head at his hip, its neck up,
  // its raised wings 14.5 up)
  size: { top: 16, half: 9 },
  switches: [SWAN_ON],
};
