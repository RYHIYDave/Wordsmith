// ACT 2, THE HUSH: FLOOR 12: THE KING'S RATS: what they draw beyond their figures (render/act1_fx/types.ts). Nothing on the
// floor: their bite is all in their own pictures. LOOKING ROUND, the art chat's own move for it (art/rats.ts clips.moves.look:
// "the game's to play now and then from its stand"): played where their rules have it (game/act1_rules/rat.ts `looking`), in
// place of their stand: now and then, each by its own clock, while their pack lies in the sewer not yet woken; and to its end
// by one woken in the middle of it.

import { looking } from '../../game/act1_rules/rat';
import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    const t = looking(m);
    const look = set.clips?.moves?.look;
    if (t < 0 || !look || !look.frames.length) return null;
    return clipFrame(look, t);
  },
};
