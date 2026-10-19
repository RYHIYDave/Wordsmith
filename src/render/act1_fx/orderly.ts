// ACT 2, THE HUSH: FLOOR 14: THE ORDERLIES: what they do to the floor, drawn (render/act1_fx/types.ts), from the art chat's
// (art/orderlies.ts, orderlies_moves.ts, orderly_shots.ts), where their rules (game/act1_rules/orderly.ts) have it: the
// mallet's blow is all in their own pictures (raised, brought down, the dust and splinters thrown up where it goes in); its
// MARK ON THE FLOOR where it went in (`orderly:slam`): the art's drawMalletSlam, a ring of dust rolling out, splinters, a
// star of cracks in the boards fading. On the floor, under what stands. Nothing in it glows.

import { drawMalletSlam } from '../../art/orderly_shots';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, _m, p) {
    if (!p || p.a1 !== 'orderly:slam' || !c.g) return;
    drawMalletSlam(c.g, c.at, p.x, p.y, p.t);
  },
};
