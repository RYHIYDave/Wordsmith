// ACT 1: THE CHANTER (THE CULT, FLOORS 6 TO 10): its rules (game/act1_rules/types.ts).
//
// His doc's mob table (kept with his yes): "A bolt of cursed words. Nearby cultists take less damage while it
// lives, so kill it first." (small: one attack, by his rule). The pictures are the art chat's
// (art/act1_cultists.ts, CHANTER, with his yes of 13 Oct, by 19:26: "Yes, send them to main (Recommended)"): its
// walk, a slow procession painted for CH_PACE; THE BOLT OF CURSED WORDS, the book heaved up, its script blazing
// (the warning), thrust out at you, and the bolt leaving its pages at CH_BOLT.hit from chanterBookAt(); the bolt
// in flight (curseBolt); and ITS WARD on those it shields, his pick's "the cultists it shields glow faintly pink"
// (chantWard, a ring at their feet). "How far it shields and how much are yours" (the art chat): so these.
//
// THE WARD: while a chanter lives and is awake, each of the cult's other kinds within `ward.r` tiles of it takes
// `ward.share` less harm from everything (game.ts damageMonster asks act1Ward). Not another chanter, nor itself:
// it is the one to kill first, and nothing shields it.
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act1_chanter.test.ts holds it to the art.

import type { BossRules } from '../bosses';
import { beside } from '../facing';
import type { Monster, Peril } from '../state';
import type { MonsterKind } from '../types';
import type { Act1Rules } from './types';

export const CHANTER = {
  /**
   * THE BOLT: it leaves the book's pages `from` (tiles before it, to its left, and game pixels up: art
   * chanterBookAt), flies at where the hero is then at `speed` tiles a second, level, as far as `reach`; it
   * strikes a hero whose middle it comes within `r` of, and bursts there, at a wall or at its reach, the burst
   * seen for `burst` seconds.
   */
  bolt: { from: [0.55, 0, 17.0] as const, speed: 7, reach: 8.5, r: 0.4, burst: 0.25 },
  /** THE WARD: the cult's kinds it shields, within `r` tiles of it, each taking `share` less harm. */
  ward: { r: 4.5, share: 0.4, kinds: ['dagger', 'cultist', 'firepot', 'minifm', 'priest'] as readonly MonsterKind[] },
};

/** How much less harm one chanter's ward gives `m` now (0: none). */
export function wardOf(by: Monster, m: Monster): number {
  const W = CHANTER.ward;
  if (by.dead || by === m || by.state === 'sleep' || m.dead || !W.kinds.includes(m.kind)) return 0;
  return Math.hypot(m.x - by.x, m.y - by.y) <= W.r ? W.share : 0;
}

export const RULES: Act1Rules = {
  // (its procession: eight frames at eight a second, painted for a tile a second, looping from its stand; from
  // behind as the camera truly sees it. It stands off and casts)
  gait: { pace: 1.0, cycle: 1.0, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 5, slack: 1, trueBack: true },
  acts: [{ id: 'chanter:bolt', clip: 'attack', long: 1.2, hit: 19 / 30, dmg: 1, cooldown: 0, first: 0, after: 1.4, near: 0, far: 7 }],
  acting(R: BossRules, m: Monster, a, t0, t1): void {
    if (a.id !== 'chanter:bolt' || !(t0 < a.hit && t1 >= a.hit)) return;
    const g = R.g;
    const h = g.hero;
    const B = CHANTER.bolt;
    // (out of its pages, at the hero)
    const o = beside(m.x, m.y, m.fx, m.fy, m.act!.hand, B.from[0], B.from[1]);
    const dx = h.x - o.x;
    const dy = h.y - o.y;
    const d = Math.hypot(dx, dy);
    R.peril(m, 'act1', o.x, o.y, { a1: 'chanter:bolt', hit: 1e9, dur: 1e9, dmg: g.rollMonsterDmg(m) * a.dmg, fx: d > 0.01 ? dx / d : m.fx, fy: d > 0.01 ? dy / d : m.fy, c: B.from[2] });
    // (as the cult's bolts sound)
    g.sfx('fire', 0.45);
  },
  peril(R: BossRules, p: Peril, dt: number): void {
    if (p.a1 !== 'chanter:bolt' || p.done) return;
    const g = R.g;
    const h = g.hero;
    const B = CHANTER.bolt;
    const fly = Math.min(dt, p.t) * B.speed;
    const steps = Math.max(1, Math.ceil(fly / 0.2));
    let burst = false;
    for (let s = 0; s < steps && !burst; s++) {
      p.x += (p.fx * fly) / steps;
      p.y += (p.fy * fly) / steps;
      p.d += fly / steps;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= B.r && h.invuln <= 0 && !h.move && !g.over) {
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x - p.fx, p.y - p.fy, p.half);
        burst = true;
      } else if (p.d >= B.reach || !g.isOpen(p.x, p.y)) burst = true;
    }
    if (burst) {
      p.done = 1;
      p.hit = p.t;
      p.dur = p.t + B.burst;
    }
  },
  ward(R: BossRules, by: Monster, m: Monster): number {
    return wardOf(by, m);
  },
};
