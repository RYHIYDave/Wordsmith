// ACT 2, THE HUSH: FLOOR 13: THE SILENT ORDER'S CARTERS: what they do to the floor, drawn (render/act1_fx/types.ts). Their lash and
// its crack are their own pictures' (art/carters_moves.ts); beyond them only THE DRAG: one its lash has coiled round and drags
// in scrapes the floor behind him as he goes (art/boss_shots.ts drawScrape, as the cliff crawler's drag), from where it caught
// him (game/act1_rules/carter.ts).

import { drawScrape } from '../../art/boss_shots';
import { drawLashCrack, drawLashesWarn, lashSpots } from '../../art/carter_shots';
import { CARTER, crackSpot } from '../../game/act1_rules/carter';
import type { Act1Fx } from './types';

// (Version 23.2, THE DRIVER'S LASH, their second move: through its warning the art's three rings where the cracks will fall
// (drawLashesWarn), and at each crack (`carter:crack`) its sparks, dust and scuff (drawLashCrack))
export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (p) {
      if (p.a1 === 'carter:crack' && c.g) drawLashCrack(c.g, c.at, p.x, p.y, p.t);
      return;
    }
    if (m && c.g && m.act && m.act.id === 'carter:lashes') {
      const D = CARTER.lashes;
      const t = m.act.t;
      const last = D.cracks[D.cracks.length - 1] + D.floor;
      if (t >= D.warn[0] && t < last) {
        const o = lashesWarnFrom(m, m.act.hand);
        drawLashesWarn(c.g, c.at, o.x, o.y, m.fx, m.fy, Math.min(1, (t - D.warn[0]) / (D.cracks[0] - D.warn[0])));
      }
      return;
    }
    if (!m || !c.g || !m.act || m.act.id !== 'carter:lash' || !m.a1 || !m.a1.grab) return;
    const h = c.game.hero;
    drawScrape(c.g, c.at, h.x, h.y, m.a1.ox, m.a1.oy, 1);
  },
};

/**
 * Where the driver's lash's warning is drawn from, for one facing (fx, fy) drawn with `hand`, so that its rings lie where the
 * cracks will fall (game/act1_rules/carter.ts crackSpot): the art's rings (lashSpots) are under the whip hand of one drawn as
 * it was made; one drawn the other way round (`hand` -1) has the whip in the other hand, and its cracks fall to its left.
 */
export function lashesWarnFrom(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  const want = crackSpot(m, hand, 0);
  const [ax, ay] = lashSpots(m.x, m.y, m.fx, m.fy)[0];
  return { x: m.x + want.x - ax, y: m.y + want.y - ay };
}
