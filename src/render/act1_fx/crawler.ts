// ACT 1: THE CLIFF CRAWLERS (FLOOR 7): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts), and
// its figure as it comes up over the lip of the ledge.
// - UNDER THE LIP, waiting: not seen (its picture is nothing). CLIMBING UP: its leap's own picture, let down under the
//   floor's edge (onto the cliff's face that falls away below the road) until it springs up over the lip
//   (game/act1_rules/crawler.ts, `lipDepth`).
// - ITS LEAP'S WARNING: from its crouch until it comes down, a ring on the floor where it will land, in the game's way
//   of warning of a blow that comes down on a place (art/boss_shots.ts drawSweepRing: the enemy's pink and gold).
// - THE DRAG: what it drags scrapes the floor behind him (art/boss_shots.ts drawScrape), from where it grabbed him.

import { drawScrape, drawSweepRing } from '../../art/boss_shots';
import { Px } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { CRAWLER, lipDepth } from '../../game/act1_rules/crawler';
import { beside } from '../../game/facing';
import type { Act1Fx } from './types';

/** A picture of nothing (one waiting under the lip). */
let none: Sprite | null = null;
const nothing = (): Sprite => (none ??= new Px(2, 2).sprite(1, 2, 2));

export const FX: Act1Fx | null = {
  sprite(m) {
    return m.a1 && m.a1.hid === 1 ? nothing() : null;
  },

  lift: (m) => -lipDepth(m),

  ground(c, m) {
    if (!m || !c.g || !m.act) return;
    const act = m.act;
    if (act.id === 'crawler:leap') {
      const L = CRAWLER.leap;
      if (act.t < L.hit) {
        const p = beside(m.x, m.y, m.fx, m.fy, act.hand, L.at, 0);
        drawSweepRing(c.g, c.at, p.x, p.y, L.r, act.t / L.hit, c.t);
      }
      if (m.a1 && m.a1.grab) {
        const h = c.game.hero;
        drawScrape(c.g, c.at, h.x, h.y, m.a1.ox, m.a1.oy, 1);
      }
    }
  },
};
