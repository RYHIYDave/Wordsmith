// ACT 2, THE HUSH: FLOOR 15: THE BOOKWARDENS: what they do to the floor, drawn (render/act1_fx/types.ts), where their rules
// (game/act1_rules/bookwarden.ts) have it. Their tome's whirl and slam are in their own pictures (art/act1_figs/
// bookwarden.ts); where it comes down flat on the floor ('bookwarden:mark'), the art chat's mark of it (art/
// bookwarden_shots.ts drawTomeSlam): the ring of dust shoved out from under it, the cracks run out from its edges, the loose
// pages knocked out of it and fluttering down round it, gone by TOME_MARK_FOR.

import { STORM_POUR, STORM_TAIL, drawPageStorm, drawStormWarn, drawTomeSlam } from '../../art/bookwarden_shots';
import { BOOKWARDEN } from '../../game/act1_rules/bookwarden';
import type { Act1Fx } from './types';

// (Version 23.2, THE PAGE STORM, their second move: through its warning the art's fan of pink before them (drawStormWarn);
// from the book's opening, the pages flung out across it (drawPageStorm), from where they stand, the way they face)
export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m && c.g && m.act && m.act.id === 'bookwarden:storm') {
      const W = BOOKWARDEN.storm;
      const t = m.act.t;
      if (t >= W.warn[0] && t < W.open) drawStormWarn(c.g, c.at, m.x, m.y, m.fx, m.fy, Math.min(1, (t - W.warn[0]) / (W.open - W.warn[0])), c.t);
      if (t >= W.open && t < W.open + STORM_POUR + STORM_TAIL) drawPageStorm(c.g, c.at, m.x, m.y, m.fx, m.fy, t - W.open);
      return;
    }
    if (!p || p.a1 !== 'bookwarden:mark' || !c.g) return;
    drawTomeSlam(c.g, c.at, p.x, p.y, p.fx, p.fy, p.t);
  },
};
