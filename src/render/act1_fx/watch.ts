// ACT 2, THE HUSH: FLOOR 11: THE HUSHED WATCH: what they do to the floor, drawn (render/act1_fx/types.ts). Their sweep is all
// in their own pictures (art/hushed_watch_moves.ts). THE ROUND SWEEP (their second move, the art chat's, Version 23.2): through
// its warning the art's ring of pink all round them as far as the halberd reaches (art/watch_shots.ts drawRoundWarn), and as
// the blade comes round, the dust whipped up in its wake and its streak of pink (drawRoundWake), from where they stand, as
// they began facing (game/act1_rules/watch.ts: nothing turns or moves them in it). On the floor, under what stands.

import { ROUND_DUST_FOR, ROUND_WAKE, drawRoundWake, drawRoundWarn } from '../../art/watch_shots';
import { ROUND } from '../../game/act1_rules/watch';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'watch:round') return;
    const t = m.act.t;
    if (t >= ROUND.warn[0] && t < ROUND.hit) drawRoundWarn(c.g, c.at, m.x, m.y, Math.min(1, (t - ROUND.warn[0]) / (ROUND.hit - ROUND.warn[0])), c.t);
    if (t >= ROUND_WAKE[0] && t < ROUND_WAKE[1] + ROUND_DUST_FOR) drawRoundWake(c.g, c.at, m.x, m.y, m.fx, m.fy, t);
  },
};
