// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE MASKED DANCERS: what they do, drawn (render/act1_fx/types.ts). Their whirl, their
// spin and its smear, their chime and the mask dropping are all in their own pictures (art/masque_dancers_moves.ts). Here:
// - THE WALTZ while they sleep: a pair at its one spot, both playing the art's waltz from the same moment (the art: "A LADY AND A
//   GENTLEMAN PLAYED TOGETHER AT ONE SPOT ARE THE PAIR"), each pair at its own point in the dance;
// - THE SPIN'S WARNING: through its wind-up, the circle round where it will land (game/act1_rules/dancer.ts: SPIN.lunge before
//   them, SPIN.area round) marked on the floor in the enemy's pink (render/act1_fx/garden_warn.ts).
import { DN_SPIN, SPIN } from '../../art/masque_dancers_moves';
import { drawFanWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'dancer:spin') return;
    const k = warnK(m.act.t, DN_SPIN.warn[0] - 0.2, DN_SPIN.hit);
    if (k < 0) return;
    drawFanWarn(c.g, c.at, { x: m.x + m.fx * SPIN.lunge, y: m.y + m.fy * SPIN.lunge, fx: m.fx, fy: m.fy, hand: m.act.hand }, -Math.PI, Math.PI, SPIN.area, k, c.t);
  },
  sprite(m, _art, set) {
    if (m.state !== 'sleep' || !m.a1 || m.a1.partner < 0) return null;
    const waltz = set.clips?.moves?.waltz;
    if (!waltz || !waltz.frames.length) return null;
    // (the pair's own moment in the dance: the lady's number)
    const lady = (m.form ?? 0) % 2 === 1 ? m.a1.partner : m.id;
    const t = performance.now() / 1000 + lady * 0.37;
    return waltz.frames[Math.floor(t * waltz.fps) % waltz.frames.length] ?? null;
  },
};
