// ACT 2, THE HUSH: FLOOR 12: THE ORDER'S DREDGERS: what they draw beyond their figures (render/act1_fx/types.ts). Their hook's
// glint, its warning, is in their own pictures (art/dredgers_moves.ts haulGlint). Only THE HAUL is drawn here: one caught on the
// hook and hauled in toward them (game/act1_rules/dredger.ts) scrapes the floor behind him from where he was caught, as the
// cliff crawler's drag does (art/boss_shots.ts drawScrape: a pale scratch, a little dust kicked up).

import { drawScrape } from '../../art/boss_shots';
import { drawNetFlying, drawNetLying, drawNetWarn } from '../../art/dredger_shots';
import { DREDGER, netFalls } from '../../game/act1_rules/dredger';
import type { Act1Fx } from './types';

// (Version 23.2, THE CAST NET, their second move: through its warning, and while it flies, the art's ring of pink where it
// will fall (drawNetWarn); the net in the air (drawNetFlying, in the air over what stands); lying where it fell
// (drawNetLying). The peril `dredger:net` is the net from its letting go: `a`, `b`, `c` where it left the hand)
const N = DREDGER.net;
const warnK = (t: number): number => Math.max(0, Math.min(1, (t - N.warn[0]) / (N.hit + N.flies - N.warn[0])));

export const FX: Act1Fx | null = {
  air(c, _m, p) {
    if (!p || p.a1 !== 'dredger:net' || !c.g || p.t >= N.flies) return;
    drawNetFlying(c.g, c.at, [p.a, p.b, p.c], p.x, p.y, p.t);
  },
  ground(c, m, p) {
    if (p) {
      if (p.a1 !== 'dredger:net' || !c.g) return;
      if (p.t < N.flies) drawNetWarn(c.g, c.at, p.x, p.y, warnK(N.hit + p.t), c.t);
      else drawNetLying(c.g, c.at, p.x, p.y, p.t - N.flies);
      return;
    }
    if (m && c.g && m.act && m.act.id === 'dredger:net') {
      const t = m.act.t;
      if (t >= N.warn[0] && t < N.hit) {
        const at = netFalls(m);
        drawNetWarn(c.g, c.at, at.x, at.y, warnK(t), c.t);
      }
      return;
    }
    if (!m || !c.g || !m.act || m.act.id !== 'dredger:hook' || !m.a1 || !m.a1.hooked) return;
    const h = c.game.hero;
    drawScrape(c.g, c.at, h.x, h.y, m.a1.ox, m.a1.oy, 1);
  },
};
