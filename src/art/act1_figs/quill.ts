// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS, THE QUILL: its pictures as the game holds a monster (art/act1_figs/types.ts).
// The art chat's (art/quill.ts, mockup/act2-palimpsest at ca004ef), with his yes to them: “Looks good (Recommended)” (by
// 21:30 Pacific, 20 Oct 2026): makeQuillArt(), its own solids, from in front and behind: its stand, its wade (walk), its nib
// stab (attack), ink lines, taking off, flying (a loop), landing, writing (a loop) and its half of the Palimpsest (its moves
// `lines`, `takeoff`, `fly`, `land`, `write`, `swoop`), struck (reel) and its death (die). Its rules: game/act1_rules/quill.ts.

import { PAIR_ON } from '../scraper';
import { makeQuillArt } from '../quill';
import type { Act1Fig } from './types';

// (measured off its stand as tests/pair_rules.test.ts measures it: over its floor point the top of its head, 52 game pixels;
// its picture reaching 24 to either side, its body about 14)
const SIZE = { top: 52, half: 14 };

export const FIG: Act1Fig | null = { make: makeQuillArt, size: SIZE, heavy: true, switches: [PAIR_ON] };
