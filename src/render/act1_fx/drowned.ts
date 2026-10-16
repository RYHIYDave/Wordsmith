// ACT 1: THE DROWNED (FLOOR 10): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Nothing beyond its figure but this: while it lies under the water, not yet risen, nothing of it is seen: not its
// shadow, a pack's ring, its bar or its name (`hidden`); and its picture is its rise's first (all of it under the
// water), not its stand. As it wakes it rises, and is seen as its rise brings it up.

import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  hidden(m) {
    return !!m.a1 && m.a1.under === 1;
  },
  sprite(m, _art, set) {
    const rise = set.clips?.moves?.rise;
    if (!rise || !m.a1 || m.a1.under !== 1) return null;
    return clipFrame(rise, 0);
  },
};
