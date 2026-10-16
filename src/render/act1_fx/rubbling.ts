// ACT 1: THE RUBBLINGS (FLOOR 6): what they draw beyond their figures (render/act1_fx/types.ts). Nothing on the
// floor: their bite is all in their own pictures. Until one climbs up out of its pile of chips (game/act1_rules/
// rubbling.ts) it lies there as the pile, the first frame of its rise (the art chat's clips.moves.emerge).

import type { Act1Fx } from './types';

export const FX: Act1Fx = {
  sprite(m, art, set) {
    if (!m.a1 || !m.a1.pile || m.state === 'act') return null;
    const rise = set.clips?.moves?.emerge;
    return rise && rise.frames.length ? rise.frames[0] : null;
  },
};
