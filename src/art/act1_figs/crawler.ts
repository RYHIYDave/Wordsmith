// ACT 1: THE CLIFF CRAWLERS (FLOOR 7): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's,
// through its own maker, makeCrawlerArt() (art/ledge_crawlers.ts): its stand, its walk (painted for CR_PACE, 1.4 tiles a
// second), its claw swipe (`attack`), its leap (`clips.moves.leap`), its flinch (`reel`) and its death (`die`, thirty a
// second as it is painted). Its moves have his yes, as shown; its look was asked of him and he made no choice ("[No
// preference]", 14 Oct): see the main chat's report.

import { CRAWLER_ON, makeCrawlerArt } from '../ledge_crawlers';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: makeCrawlerArt,
  // (measured off its standing picture: its back, not its spines' tips; half its body, its legs splayed further)
  size: { top: 18, half: 16 },
  switches: [CRAWLER_ON],
};
