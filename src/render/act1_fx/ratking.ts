// ACT 2, THE HUSH: FLOOR 12'S BOSS: THE RAT KING: what he does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where his rules (game/act1_rules/ratking.ts) have it, and his figure where his moves are more than one of his pictures:
//   HIS FIGURE: THE ROLL is three of the art's (art/rat_king.ts): curling up (`curl`), his ball going round as it rolls (`roll`,
//     a loop, one turn of it in RK_ROLL's 0.8 s), uncurling (`uncurl`), each in its turn by the roll's clock. UNKNOT is two:
//     coming loose and gone into the cracks (`unknot`), and, where they knot again, pouring back in (`knot`); between them
//     nothing of him is seen (`hidden`: not his shadow, his ring, his bar or his name): only his swarm.
//   ON THE FLOOR: the roll's run as he curls, and fading behind him as he rolls (the red troll's lane, art/charge_lane.ts, as
//     the Hollow Stag's charge has it: the bosses' warning in the red circle's own reds, his yes to it on 9 Oct); STOLEN WORDS'
//     warning, a thin line of the enemy's pink along the floor the way the word will fly (art/rat_king_shots.ts drawWordAim);
//     THE SWARM running across the floor from where he came apart to where he knots again (drawSwarm).
//   OVER WHAT STANDS: his stolen word in flight, in the shape of one of the hero's own words, burning the enemy's pink to gold
//     (drawStolenWord), and its burst where it lands (drawWordBurst), each a light of the enemy's in the dark of the sewers.

import { drawChargeLane } from '../../art/charge_lane';
import { drawStolenWord, drawSwarm, drawWordAim, drawWordBurst } from '../../art/rat_king_shots';
import type { StolenWord } from '../../art/rat_king_shots';
import { Px } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { RK, ROLL_TURN, STOLEN, rollEnd, swarming, wordFrom } from '../../game/act1_rules/ratking';
import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A picture of nothing (him, gone into the cracks while his swarm runs). */
let none: Sprite | null = null;
const nothing = (): Sprite => (none ??= new Px(2, 2).sprite(1, 2, 2));

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    if (m.state !== 'act' || !m.act) return null;
    const moves = set.clips?.moves;
    if (!moves) return null;
    const t = m.act.t;
    if (m.act.id === 'ratking:roll') {
      const C = RK.roll;
      const long = C.curl + C.turns * C.turn + C.uncurl;
      if (t < C.curl) return moves.curl ? clipFrame(moves.curl, t) : null;
      if (t < long - C.uncurl) return moves.roll ? clipFrame(moves.roll, t - C.curl) : null;
      return moves.uncurl ? clipFrame(moves.uncurl, t - (long - C.uncurl)) : null;
    }
    if (m.act.id === 'ratking:unknot') {
      const U = RK.unknot;
      if (t < U.out) return moves.unknot ? clipFrame(moves.unknot, t) : null;
      if (t < U.out + U.swarm) return nothing();
      return moves.knot ? clipFrame(moves.knot, t - U.out - U.swarm) : null;
    }
    return null;
  },

  hidden: (m) => swarming(m),

  ground(c, m) {
    const g = c.g;
    if (!g || !m || m.state !== 'act' || !m.act) return;
    const act = m.act;
    const t = act.t;
    if (act.id === 'ratking:roll') {
      const C = RK.roll;
      const turns = m.a1?.turns || 1;
      const end = rollEnd(turns);
      if (t >= end) return;
      const far = turns * ROLL_TURN + C.ball;
      const lane = { x0: act.x, y0: act.y, x1: act.x + m.fx * far, y1: act.y + m.fy * far, half: C.ball, k: clamp01(t / C.curl) };
      drawChargeLane(g, t < C.curl ? lane : { ...lane, k: 1, gone: clamp01((t - C.curl) / (end - C.curl)) }, c.at);
    } else if (act.id === 'ratking:words') {
      const W = RK.words;
      if (t < W.warn || t >= W.hit) return;
      const o = wordFrom(m);
      drawWordAim(g, c.at, o.x, o.y, o.x + o.fx * act.a, o.y + o.fy * act.a, (t - W.warn) / (W.hit - W.warn), c.t);
    } else if (act.id === 'ratking:unknot' && swarming(m) && m.a1) {
      drawSwarm(g, c.at, m.a1.sx, m.a1.sy, m.x, m.y, t - RK.unknot.out);
    }
  },

  air(c, m, p) {
    const g = c.g;
    if (m || !p || !g || p.a1 !== 'ratking:word') return;
    const W = RK.words;
    const kind = (STOLEN[p.b] ?? 'fire') as StolenWord;
    if (!p.done) {
      const x1 = p.x + p.fx * p.a;
      const y1 = p.y + p.fy * p.a;
      if (!drawStolenWord(g, c.at, kind, p.x, p.y, W.rise, x1, y1, p.t)) return;
      // (its light in the dark, where it is: down from where it gathered to the floor as it flies, as it is drawn)
      const u = clamp01((p.t * W.speed) / Math.max(0.01, p.a));
      const [sx, sy] = c.at(p.x + (x1 - p.x) * u, p.y + (y1 - p.y) * u);
      c.spot(sx, sy - W.rise * (1 - u) - 6 * u, 18, 0.5);
      return;
    }
    const x = p.x + p.fx * p.c;
    const y = p.y + p.fy * p.c;
    const q = p.t - p.hit;
    drawWordBurst(g, c.at, kind, x, y, q);
    const [sx, sy] = c.at(x, y);
    c.spot(sx, sy - 3, 26, 0.6 * (1 - clamp01(q / W.burstFor)));
  },
};
