// ACT 2, THE HUSH: FLOOR 13: THE SILENT ORDER'S CARTERS: what they do to the floor, drawn (render/act1_fx/types.ts). Their lash and
// its crack are their own pictures' (art/carters_moves.ts); beyond them only THE DRAG: one its lash has coiled round and drags
// in scrapes the floor behind him as he goes (art/boss_shots.ts drawScrape, as the cliff crawler's drag), from where it caught
// him (game/act1_rules/carter.ts).

import { drawScrape } from '../../art/boss_shots';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'carter:lash' || !m.a1 || !m.a1.grab) return;
    const h = c.game.hero;
    drawScrape(c.g, c.at, h.x, h.y, m.a1.ox, m.a1.oy, 1);
  },
};
