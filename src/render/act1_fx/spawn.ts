// ACT 1: THE EYESPAWN (FLOOR 10): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Its gaze's warning, its beam and the line it burns are painted with it, in its own canvas (art/eyespawn.ts); the
// game draws nothing more. Only this: one that is to hatch (Monster.a1.hatch 1) and has not yet begun is its
// hatching's first picture, curled in the burst egg, not its stand.

import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    const hatch = set.clips?.moves?.hatch;
    if (!hatch || !m.a1 || m.a1.hatch !== 1) return null;
    return clipFrame(hatch, 0);
  },
};
