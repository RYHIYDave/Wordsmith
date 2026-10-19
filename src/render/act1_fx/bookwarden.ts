// ACT 2, THE HUSH: FLOOR 15: THE BOOKWARDENS: what they do to the floor, drawn (render/act1_fx/types.ts), where their rules
// (game/act1_rules/bookwarden.ts) have it. Their tome's whirl and slam are in their own pictures (art/act1_figs/
// bookwarden.ts); where it comes down flat on the floor ('bookwarden:mark'), the art chat's mark of it (art/
// bookwarden_shots.ts drawTomeSlam): the ring of dust shoved out from under it, the cracks run out from its edges, the loose
// pages knocked out of it and fluttering down round it, gone by TOME_MARK_FOR.

import { drawTomeSlam } from '../../art/bookwarden_shots';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, _m, p) {
    if (!p || p.a1 !== 'bookwarden:mark' || !c.g) return;
    drawTomeSlam(c.g, c.at, p.x, p.y, p.fx, p.fy, p.t);
  },
};
