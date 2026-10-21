// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS, THE SCRAPER: its pictures as the game holds a monster (art/act1_figs/types.ts).
// The art chat's (art/scraper.ts, mockup/act2-palimpsest at ca004ef), with his yes to them: “Looks good (Recommended)”
// (by 21:30 Pacific, 20 Oct 2026): makeScraperArt(), its own solids (not the heroes' bones), from in front and behind: its
// stand, its scuttle (walk), its claw snap (attack), the scour, the backward rush and its half of the Palimpsest (its moves
// `scour`, `rush`, `strip`), struck (reel) and its death (die). Its rules: game/act1_rules/scraper.ts.

import { PAIR_ON, makeScraperArt } from '../scraper';
import type { Act1Fig } from './types';

// (measured off its stand as tests/pair_rules.test.ts measures it: over its floor point the top of its back, 22 game pixels;
// its picture reaching 57 to either side with its claws and tail, its body about 40)
const SIZE = { top: 22, half: 40 };

export const FIG: Act1Fig | null = { make: makeScraperArt, size: SIZE, heavy: true, switches: [PAIR_ON] };
