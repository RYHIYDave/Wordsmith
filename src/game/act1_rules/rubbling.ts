// ACT 1: THE RUBBLINGS (FLOOR 6): their rules (game/act1_rules/types.ts).
//
// His doc's mob table (kept with his yes): "A bite. Fist-sized stone mites that swarm out of rock piles" (tiny:
// one attack, by his rule; six to ten in a pack). The pictures are the art chat's (art/floor6_mobs.ts,
// makeRubblingArt, with his yes of 13 Oct, by 17:31): its scuttle, painted for RB_PACE; THE BITE, the top of its
// heap hinged open on its blazing spark (the warning), and its spring forward, snapping shut on you at RB_HIT;
// and ITS RISE OUT OF A ROCK PILE (clips.moves.emerge, RB_EMERGE): "play it where rubblings come out of a rock
// pile, if your rules have them so". So they do: a pack of them lies on the floor as low piles of chips (the
// first frame of its rise) until it is woken, and then each climbs up out of its pile, one a moment after
// another, and they swarm.
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act1_rubbling.test.ts holds it to the art.

import type { BossRules } from '../bosses';
import { fromFigure } from '../facing';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

export const RUBBLING = {
  /** THE BITE: as it snaps shut its heap is `ahead` tiles before where it stood (art: 16 of its lengths at RB_HIT); it bites a hero whose middle is within `r` of there. */
  bite: { ahead: 0.408, r: 0.6 },
  /** OUT OF ITS PILE: once its pack is woken, each waits up to `most` seconds (a moment of its own) before it climbs out. */
  rise: { most: 0.6 },
};

export const RULES: Act1Rules = {
  // (its scuttle: eight frames at twenty-four a second, painted for two tiles a second, looping from its stand)
  gait: { pace: 2.0, cycle: 1 / 3, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.6, slack: 0.3, trueBack: false },
  acts: [
    { id: 'rubbling:bite', clip: 'attack', long: 0.8, hit: 0.42, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 0.85 },
    { id: 'rubbling:emerge', clip: 'emerge', long: 0.7, hit: 0.7, dmg: 0, cooldown: 0, first: 0, after: 0.1, near: 0, far: 0, forced: true },
  ],
  spawned(R: BossRules, m: Monster): void {
    // (it lies as a pile of chips until it is woken; its moment, its own: no draw of the game's dice)
    m.a1 = { pile: 1, wait: m.seed * RUBBLING.rise.most };
  },
  tick(R: BossRules, m: Monster, dt: number): boolean {
    // (woken, it waits its moment, still a pile)
    const s = m.a1;
    if (!s || !s.pile || s.wait <= 0) return false;
    s.wait -= dt;
    m.anim = 'idle';
    return true;
  },
  forced(R: BossRules, m: Monster, acts): number {
    return m.a1 && m.a1.pile ? acts.findIndex((a) => a.id === 'rubbling:emerge') : -1;
  },
  start(R: BossRules, m: Monster, a): void {
    if (a.id === 'rubbling:emerge' && m.a1) m.a1.pile = 0;
  },
  acting(R: BossRules, m: Monster, a, t0, t1): void {
    if (a.id !== 'rubbling:bite' || !(t0 < a.hit && t1 >= a.hit)) return;
    const g = R.g;
    const h = g.hero;
    // (it springs and snaps shut where it has sprung to)
    const r = fromFigure(m.x, m.y, m.fx, m.fy, 1, h.x, h.y);
    if (Math.hypot(r.fwd - RUBBLING.bite.ahead, r.left) <= RUBBLING.bite.r) R.blow(m, a.dmg);
    g.sfx('hit', 0.25);
  },
};
