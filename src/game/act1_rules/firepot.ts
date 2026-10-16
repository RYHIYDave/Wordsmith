// ACT 1: THE FIREPOT THROWER (THE CULT, FLOORS 6 TO 10): its rules (game/act1_rules/types.ts).
//
// His doc's mob table (kept with his yes): "Lobs pots that leave burning ground: the siege's bombardier." (small:
// one attack, by his rule). The pictures are the art chat's (art/act1_cultists.ts, FIREPOT_THROWER, with his yes
// of 13 Oct, by 19:26: "Yes, send them to main (Recommended)"): its trudge, painted for POTS_PACE; THE LOB, the
// lit pot whirled round over its head, faster and faster, the fuse flaring (the warning), and let fly at
// POTS_LOB.hit from potsPotAt(); the pot in flight (firepotFlying); where it comes down, its burst
// (firepotFire 0 to 3) and the cult's fire burning on the floor after (firepotFire 4 to 7, "for as long as you
// keep it"). "How far, how long it burns and what it hurts are yours" (the art chat): so these. The pot is lobbed
// at where the hero stands as it is let go, as the Ossuary Golem's skull is thrown (game/defs.ts SKULL), its
// shadow on the floor showing where; it bursts there, and the floor burns on, burning whoever stands in it, as
// the Headsman's split floor does (game/bosses.ts, a peril that burns tick by tick).
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act1_firepot.test.ts holds it to the art.

import type { BossRules } from '../bosses';
import { TUNE } from '../defs';
import { beside } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

export const FIREPOT = {
  /**
   * THE POT: it leaves the sling `from` (tiles before it, to its left, and game pixels up: art potsPotAt) and
   * comes down where the hero stood then, `fly0` + `flyPer` seconds a tile later, over an arc rising `arc0` +
   * `arcPer` game pixels a tile above the straight way, coming to rest `rest` pixels up.
   */
  pot: { from: [0.447, -0.492, 22.17] as const, fly0: 0.45, flyPer: 0.08, arc0: 10, arcPer: 3, rest: 1.5 },
  /** ITS BURST where it comes down: whoever is within `r` is struck (the act's blow); it is seen `long` seconds (art: its four frames at ten a second). */
  burst: { r: 0.65, long: 0.4 },
  /** THE FLOOR BURNING after: for `burn` seconds, every `tick`, whoever is within `r` of its middle (and half his own width) is burned for `dmg` of its blow; it dies down over its last `fade`. */
  fire: { r: 0.42, burn: 4, tick: 0.5, dmg: 0.35, fade: 0.6 },
};

/** Where a pot is, `p.t` seconds after it was let go: over the floor (tiles) and how high (game pixels). */
export function potAt(p: Peril): { x: number; y: number; z: number } {
  const u = Math.max(0, Math.min(1, p.hit > 0 ? p.t / p.hit : 1));
  return { x: p.a + (p.x - p.a) * u, y: p.b + (p.y - p.b) * u, z: p.c * (1 - u) + FIREPOT.pot.rest * u + p.d * 4 * u * (1 - u) };
}

export const RULES: Act1Rules = {
  // (its trudge: eight frames at eight a second, painted for 1.1 tiles a second, looping from its stand; from
  // behind as the camera truly sees it. It stands off and lobs)
  gait: { pace: 1.1, cycle: 1.0, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 4.5, slack: 1, trueBack: true },
  acts: [{ id: 'firepot:lob', clip: 'attack', long: 1.7, hit: 27 / 30, dmg: 1, cooldown: 0, first: 0, after: 1.5, near: 0, far: 7.5 }],
  acting(R: BossRules, m: Monster, a, t0, t1): void {
    const g = R.g;
    const h = g.hero;
    // (the fuse catches as it whirls)
    if (a.id !== 'firepot:lob') return;
    if (t0 < 0.4 && t1 >= 0.4) g.sfx('fire', 0.25);
    if (!(t0 < a.hit && t1 >= a.hit)) return;
    const P = FIREPOT.pot;
    const o = beside(m.x, m.y, m.fx, m.fy, m.act!.hand, P.from[0], P.from[1]);
    const dx = h.x - o.x;
    const dy = h.y - o.y;
    const d = Math.hypot(dx, dy);
    const fly = P.fly0 + P.flyPer * d;
    const F = FIREPOT.fire;
    R.peril(m, 'act1', h.x, h.y, {
      a1: 'firepot:pot', hit: fly, dur: fly + FIREPOT.burst.long + F.burn, dmg: g.rollMonsterDmg(m) * a.dmg,
      fx: d > 0.01 ? dx / d : m.fx, fy: d > 0.01 ? dy / d : m.fy, a: o.x, b: o.y, c: P.from[2], d: P.arc0 + P.arcPer * d, el: 'fire',
    });
    g.sfx('swing', 0.5);
  },
  peril(R: BossRules, p: Peril): void {
    if (p.a1 !== 'firepot:pot' || p.t < p.hit) return;
    const g = R.g;
    const h = g.hero;
    const F = FIREPOT.fire;
    if (!p.done) {
      // (it comes down, and bursts in the cult's fire)
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= FIREPOT.burst.r) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      g.emit({ t: 'shake', amount: 1 });
      g.sfx('fire', 0.7);
      return;
    }
    // (and the floor burns: whoever stands in it is burned, tick by tick)
    const next = p.hit + FIREPOT.burst.long + F.tick * (p.done - 1);
    if (p.t >= next && p.t < p.dur - F.fade) {
      p.done++;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= F.r + TUNE.heroRadius * 0.5) g.hurtHero(p.dmg * F.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
    }
  },
};
