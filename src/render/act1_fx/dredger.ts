// ACT 2, THE HUSH: FLOOR 12: THE ORDER'S DREDGERS: what they draw beyond their figures (render/act1_fx/types.ts). Their hook's
// glint, its warning, is in their own pictures (art/dredgers_moves.ts haulGlint). Only THE HAUL is drawn here: one caught on the
// hook and hauled in toward them (game/act1_rules/dredger.ts) scrapes the floor behind him from where he was caught, as the
// cliff crawler's drag does (art/boss_shots.ts drawScrape: a pale scratch, a little dust kicked up).

import { drawScrape } from '../../art/boss_shots';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'dredger:hook' || !m.a1 || !m.a1.hooked) return;
    const h = c.game.hero;
    drawScrape(c.g, c.at, h.x, h.y, m.a1.ox, m.a1.oy, 1);
  },
};
