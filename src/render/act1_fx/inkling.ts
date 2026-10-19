// ACT 2, THE HUSH: FLOOR 15: THE INKLINGS: what they do to the floor, drawn (render/act1_fx/types.ts), where their rules
// (game/act1_rules/inkling.ts) have it. Their lash, their melt, their rise and their death are all in their own pictures
// (art/act1_figs/inkling.ts). Going about as a pool of ink (melted, sliding toward the hero) nothing of the figure is drawn,
// not its shadow, a pack's ring, its bar or its name (`hidden`): only its pool, the art chat's (art/inkling_shots.ts
// drawInkPool: a ragged pool of the Order's ink, lengthened the way it goes, rippling, two pink eyes surfacing in it now and
// then, a trail of wet ink drying behind it), where it is, on the floor.

import { drawInkPool } from '../../art/inkling_shots';
import { inkPool } from '../../game/act1_rules/inkling';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  hidden(m) {
    return inkPool(m);
  },
  ground(c, m) {
    if (!m || !c.g || !inkPool(m)) return;
    const s = m.a1!;
    drawInkPool(c.g, c.at, m.x, m.y, s.vx ?? 0, s.vy ?? 0, s.pt ?? 0);
  },
};
