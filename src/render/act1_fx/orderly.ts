// ACT 2, THE HUSH: FLOOR 14: THE ORDERLIES: what they do to the floor, drawn (render/act1_fx/types.ts), from the art chat's
// (art/orderlies.ts, orderlies_moves.ts, orderly_shots.ts), where their rules (game/act1_rules/orderly.ts) have it: the
// mallet's blow is all in their own pictures (raised, brought down, the dust and splinters thrown up where it goes in); its
// MARK ON THE FLOOR where it went in (`orderly:slam`): the art's drawMalletSlam, a ring of dust rolling out, splinters, a
// star of cracks in the boards fading. THE QUAKE (their second move, Version 23.2): through its warning the art's ring of
// pink where the mallet will come down (drawQuakeWarn); where it went in (`orderly:quake`), the floor shaken out round it
// and its cracks (drawQuake). On the floor, under what stands. Nothing in it glows.

import { drawMalletSlam, drawQuake, drawQuakeWarn } from '../../art/orderly_shots';
import { ORDERLY, quakeSpot } from '../../game/act1_rules/orderly';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act && m.act.id === 'orderly:quake') {
      const Q = ORDERLY.quake;
      const t = m.act.t;
      if (t < Q.warn[0] || t >= Q.floor) return;
      const s = quakeSpot(m, m.act.hand);
      drawQuakeWarn(c.g, c.at, s.x, s.y, Math.min(1, (t - Q.warn[0]) / (Q.floor - Q.warn[0])));
      return;
    }
    if (!p) return;
    if (p.a1 === 'orderly:slam') drawMalletSlam(c.g, c.at, p.x, p.y, p.t);
    else if (p.a1 === 'orderly:quake') drawQuake(c.g, c.at, p.x, p.y, p.t);
  },
};
