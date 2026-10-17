// ACT 1: THE BOG LEECHES (FLOOR 10): what it does, drawn (render/act1_fx/types.ts). Nothing on the floor; but while it
// hangs on him (its picture's 0.633 to 1.25 s, and for as long as it holds on) it is DRAWN OVER THE HERO, as the art
// chat asks ("seen from in front he stands before it and would hide it"), and its picture is its clinging, drinking,
// by how long it has held on (game/act1_rules/leech.ts, latchClock).

import { LEECH, latchClock, latched } from '../../game/act1_rules/leech';
import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    const clip = set.clips?.attack;
    if (!clip || !latched(m) || !m.a1) return null;
    return clipFrame(clip, latchClock(m.a1.held));
  },
  over(m) {
    if (m.state !== 'act' || !m.act || m.act.id !== 'leech:latch') return 0;
    const L = LEECH.latch;
    return latched(m) || (m.act.t >= L.hit && m.act.t < L.letGo) ? 2 : 0;
  },
};
