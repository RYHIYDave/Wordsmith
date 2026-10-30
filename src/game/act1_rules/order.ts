// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17, THE MASQUE: THE SILENT ORDER, as cloaked guests at the ball: their rules (game/act1_rules/
// types.ts). Built by the main chat from the art chat's (art/silent_order.ts, silent_order_moves.ts, silent_order_fx.ts; his picks
// there, how they move “Still, then sudden (Recommended)”, and their pictures “Yes, that's the Order (Recommended)”;
// docs/mockups/silent_order/README.md). One design for floors 17, 19 and 20: here THE GUEST.
//
// His doc, level 17: "the Silent Order among the guests". The brief he picked: "the knight's size; utterly still, then a sudden
// rush close; ... two attacks, a hushing palm that darkens your words and a thrown curved knife; dying, the mask cracks in two
// and the cloak falls empty to the floor; ... no sound at all, only cloth." Two blows: a medium kind (his rulebook).
//
// WHAT THEY DO (the main chat's, where the art leaves it to the game):
// - THE RUN at ORDER_PACE, 5.5 tiles a second, the upper body as still as they stand.
// - THE RUSH ("still, then sudden"; RUSH, 0.9 s): from ORDER_TUNE.rush.near to .far tiles off him, every ORDER_TUNE.rush.every
//   seconds, still, a flick of a crouch, then flung 4.5 tiles at him in 0.2 s (rushCarry), landed; not a blow, how they close on
//   him (brought by the rules, not chosen: forced).
// - THE CURVED KNIFE (their basic blow; THROW, 2.0 s): drawn, raised and held (the warning, 0.46 to 0.87 s), thrown at 0.93 s
//   along their forward, 20 tiles a second, 8 tiles, then it falls and lies (knifeAt); the hero within ORDER_TUNE.knife.hit of it
//   in flight is struck, once.
// - THE HUSHING PALM (their second, every 8 s; PALM, 2.0 s): coiled and held (0.44 to 0.87 s), thrust out at 0.93 s, and the grey
//   wave bursts over a cone before them, 5.5 tiles out and 100 degrees across (PALM_WAVE, inWave): whoever is in it as it bursts
//   is struck, 1.2 times their blow, and his words are hushed (Game.hush) for ORDER_TUNE.palm.hush seconds.
// Their warnings in the enemy's pink, and the knife and the wave drawn: render/act1_fx/order.ts.

import { TILE3 } from '../../art/new_mobs3';
import { PALM_WAVE, knifeAt } from '../../art/silent_order_fx';
import { KNIFE_FLIGHT, ORDER_PACE, ORDER_RUN, PALM, RUSH, THROW, rushCarry } from '../../art/silent_order_moves';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** The Order's numbers (tiles; seconds). */
export const ORDER_TUNE = {
  rush: { near: 6, far: 13, every: 3.5 },
  knife: { hit: 0.6, lies: 0.7 },
  palm: { reach: PALM_WAVE.reach / TILE3, half: (PALM_WAVE.half * Math.PI) / 180 + 0.06, from: PALM_WAVE.from / TILE3, hush: 3 },
};

const GAIT: GaitDef = { pace: ORDER_PACE, cycle: ORDER_RUN.frames / ORDER_RUN.fps / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.2, slack: 0.4, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'order:knife', clip: 'knife', long: THROW.long, hit: THROW.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 1.8, far: KNIFE_FLIGHT.reach - 0.5 },
  { id: 'order:palm', clip: 'attack', long: PALM.long, hit: PALM.hit, dmg: 1.2, cooldown: 8, first: 2, after: 0.6, near: 0, far: ORDER_TUNE.palm.reach - 0.5 },
  { id: 'order:rush', clip: 'rush', long: RUSH.long, hit: RUSH.air[1], dmg: 0, cooldown: 0, first: 0, after: 0.1, near: 0, far: 999, forced: true },
];

/** Is the hero in the grey wave's cone? */
export function inPalm(R: BossRules, m: Monster): boolean {
  const r = R.rel(m);
  const d = Math.hypot(r.fwd, r.left);
  const P = ORDER_TUNE.palm;
  return d >= P.from - 0.3 && d <= P.reach + 0.3 && Math.abs(Math.atan2(r.left, r.fwd)) <= P.half;
}

/** Where a thrown knife is, `t` seconds after it left the hand, from where it was thrown along the way it was thrown. */
export function knifeWhere(p: { x: number; y: number; fx: number; fy: number }, t: number): { x: number; y: number; flying: boolean } {
  const k = knifeAt(t);
  return { x: p.x + p.fx * k.x, y: p.y + p.fy * k.x, flying: k.flying };
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  tick(_R, m, dt) {
    const k = (m.a1 ??= { rushCd: 1.5 });
    k.rushCd = (k.rushCd ?? 0) - dt;
    return false;
  },
  forced(R, m, acts) {
    // (still, then sudden: from far off, flung at him)
    const d = Math.hypot(R.g.hero.x - m.x, R.g.hero.y - m.y);
    const T = ORDER_TUNE.rush;
    if ((m.a1?.rushCd ?? 0) > 0 || d < T.near || d > T.far) return -1;
    return acts.findIndex((a) => a.id === 'order:rush');
  },
  start(_R, m, a) {
    if (a.id === 'order:rush') {
      (m.a1 ??= {}).rushCd = ORDER_TUNE.rush.every;
      m.a1.carried = 0;
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'order:rush') {
      // (carried along their forward as the art's rushCarry says, so far as the floor lets them)
      const want = rushCarry(t1) / TILE3;
      const k = m.a1!;
      const L = g.level;
      const n = Math.max(1, Math.ceil(Math.abs(want - (k.carried ?? 0)) / 0.1));
      const step = (want - (k.carried ?? 0)) / n;
      for (let i = 0; i < n; i++) {
        const x = m.x + m.fx * step;
        const y = m.y + m.fy * step;
        if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] !== 1) break;
        m.x = x;
        m.y = y;
      }
      k.carried = want;
      return;
    }
    if (a.id === 'order:knife' && at(a.hit)) {
      R.peril(m, 'act1', m.x + m.fx * 0.4, m.y + m.fy * 0.4, { a1: 'order:knife', hit: 0, dur: KNIFE_FLIGHT.reach / KNIFE_FLIGHT.speed + ORDER_TUNE.knife.lies, dmg: g.rollMonsterDmg(m) * a.dmg });
      return;
    }
    if (a.id === 'order:palm' && at(a.hit)) {
      if (inPalm(R, m)) {
        R.blow(m, a.dmg);
        g.hush(ORDER_TUNE.palm.hush);
      }
    }
  },
  peril(R, p, _dt) {
    if (p.a1 !== 'order:knife' || p.done) return;
    // (the knife in flight: where it passes him, it strikes, once)
    const k = knifeWhere(p, p.t);
    if (!k.flying) return;
    const h = R.g.hero;
    if (Math.hypot(h.x - k.x, h.y - k.y) <= ORDER_TUNE.knife.hit) {
      p.done = 1;
      R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, k.x, k.y, p.half);
    }
  },
};
