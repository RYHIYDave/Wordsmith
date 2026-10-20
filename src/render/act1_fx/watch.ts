// ACT 2, THE HUSH: FLOOR 11: THE HUSHED WATCH: what they do to the floor, drawn (render/act1_fx/types.ts). Their sweep is all
// in their own pictures (art/hushed_watch_moves.ts). THE ROUND SWEEP (their second move, the art chat's, Version 23.2): through
// its warning the art's ring of pink all round them as far as the halberd reaches (art/watch_shots.ts drawRoundWarn), and as
// the blade comes round, the dust whipped up in its wake and its streak of pink (drawRoundWake), from where they stand, as
// they began facing (game/act1_rules/watch.ts: nothing turns or moves them in it). On the floor, under what stands.

import { ROUND_DUST_FOR, ROUND_WAKE, drawRoundWake, drawRoundWarn } from '../../art/watch_shots';
import { ROUND } from '../../game/act1_rules/watch';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'watch:round') return;
    const t = m.act.t;
    if (t >= ROUND.warn[0] && t < ROUND.hit) drawRoundWarn(c.g, c.at, m.x, m.y, Math.min(1, (t - ROUND.warn[0]) / (ROUND.hit - ROUND.warn[0])), c.t);
    if (t >= ROUND_WAKE[0] && t < ROUND_WAKE[1] + ROUND_DUST_FOR) drawRoundWake(c.g, mirrorFor(c.at, m, m.act.hand), m.x, m.y, m.fx, m.fy, t);
  },
};

/**
 * The floor as the art's wake is drawn on, for one drawn with `hand`: as it is for one drawn as the art made it; for one drawn
 * the other way round (-1), the halberd in the other hands and spinning the other way (game/act1_rules/watch.ts goes by the
 * figure's own left, R.rel), the floor turned over about the way they face, so that the wake follows the blade round.
 */
export function mirrorFor(
  at: (x: number, y: number) => readonly [number, number],
  m: { x: number; y: number; fx: number; fy: number },
  hand: number,
): (x: number, y: number) => readonly [number, number] {
  if (hand >= 0) return at;
  const l = Math.hypot(m.fx, m.fy) || 1;
  const ux = m.fx / l;
  const uy = m.fy / l;
  return (x, y) => {
    const dx = x - m.x;
    const dy = y - m.y;
    const d = dx * ux + dy * uy;
    return at(m.x + 2 * d * ux - dx, m.y + 2 * d * uy - dy);
  };
}
