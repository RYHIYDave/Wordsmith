// ACT 1: THE VULTURES (FLOOR 7): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts), and its
// figure up in the air.
// - UP IN THE AIR: its picture lifted as high as its rules have it (game/act1_rules/vulture.ts, `liftOf`); its shadow
//   stays on the floor under it, as every monster's does (render.ts).
// - ITS DIVE'S LINE: from its warning to its strike, the line it will stoop along, laid on the floor from where it began
//   to where the hero stood, in the game's way of showing a line a blow will come down (the marksman's line of aim,
//   art/mob_shots.ts drawAimLine: the enemy's pink, its dots running the way it will come, gold as it nears).
// - Frozen in the air (it can be frozen only low, where it can be struck), it is held in its flight's first pose, not
//   its perch's.

import { drawAimLine } from '../../art/mob_shots';
import { VULTURE, liftOf } from '../../game/act1_rules/vulture';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const FX: Act1Fx | null = {
  lift: (m) => liftOf(m),

  sprite(m, _art, set) {
    if (m.frozenT > 0 && m.state !== 'sleep' && set.walk.length) return set.walk[0];
    return null;
  },

  ground(c, m) {
    if (!m || !c.g || m.state !== 'act' || !m.act || m.act.id !== 'vulture:dive' || !m.a1) return;
    const t = m.act.t;
    // (from as it climbs to the strike: brighter through its warning's hold, gold as it stoops)
    if (t >= VULTURE.dive.hit) return;
    const k = clamp01((t - 0.05) / (VULTURE.dive.stoop - 0.05));
    drawAimLine(c.g, c.at, m.a1.sx, m.a1.sy, m.act.x, m.act.y, k, c.t);
  },
};
