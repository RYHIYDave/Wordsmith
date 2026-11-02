// ACT 1: THE QUARRY GOLEM (FLOOR 6): its rules (game/act1_rules/types.ts).
//
// His doc's mob table (the planning chat's, kept with his yes): "A rock slam; a chunk torn off its body and
// thrown" (medium: two attacks, by his rule). The pictures are the art chat's (art/floor6_mobs.ts, QUARRY_GOLEM,
// with his yes of 13 Oct, by 17:31: "Yes, send them to main (Recommended)"): THE HAMMER, both fists raised over
// its head, held (the mark on its chest flaring: the warning), and brought down together on the floor before it
// at QG_HIT; THE THROW, a chunk wrenched off its right shoulder at QG_TEAR, wound back, the mark flaring, and
// hurled overhand out of its left fist at QG_THROW_HIT. Its walk is painted for QG_PACE, with a setting off and
// a stopping of its own. "The flight, its reach and what it hurts are yours" (the art chat): so these, the main
// chat's. The chunk is thrown as the Ossuary Golem's skull is (game/defs.ts SKULL): at where the hero stands as
// it leaves the fist, coming down there a moment later, its shadow on the floor showing where.
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act1_qgolem.test.ts holds it to the art.

import { BOULDER, GOLEM_BOULDER, HAMMER, HAMMER_HIT, ROLL_HIT, boulderGone, boulderStrikes, smashStrikes } from '../../art/action_f6_golem';
import type { ActDef, BossRules } from '../bosses';
import { beside } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

export const QGOLEM = {
  /** THE HAMMER: its two fists strike the floor `at` tiles before it, on its middle line (art: where they are at QG_HIT); whoever is within `r` of there is struck, and knocked back a little (`knock` of a Heavy blow's step). */
  hammer: { at: 1.215, r: 0.8, knock: 0.5 },
  /**
   * THE THROW: it tears the chunk off at `tear`; the chunk leaves its left fist at the blow from `from` (tiles
   * before it, to its left, and game pixels up: art chunkIn at QG_THROW_HIT) and comes down where the hero stood
   * then, `fly0` + `flyPer` seconds a tile later, over an arc rising `arc0` + `arcPer` game pixels a tile above
   * the straight way; it comes to rest `rest` pixels up (its own half height). Whoever is within `r` of where it
   * comes down is struck. Its pieces lie there for `lie` seconds after (the last of them fading).
   */
  chunk: { tear: 0.45, from: [0.795, -0.064, 35.48] as const, fly0: 0.3, flyPer: 0.08, arc0: 14, arcPer: 4, rest: 2.2, r: 0.85, lie: 3.5 },
};

/** Where the chunk is, `p.t` seconds after it left the fist: over the floor (tiles) and how high (game pixels). */
export function chunkAt(p: Peril): { x: number; y: number; z: number } {
  const u = Math.max(0, Math.min(1, p.hit > 0 ? p.t / p.hit : 1));
  const C = QGOLEM.chunk;
  return { x: p.a + (p.x - p.a) * u, y: p.b + (p.y - p.b) * u, z: p.c * (1 - u) + C.rest * u + p.d * 4 * u * (1 - u) };
}

/**
 * ITS BOULDER ROLL AND ITS HAMMER BY MOVEMENT 9 (the art chat's art/action_f6_golem.ts behind GOLEM_BOULDER, his yes there, 2 Nov
 * 2026), in place of its chunk thrown and its old hammer:
 *   hammer   both fists held up over its head, its reach marked (the game's warning, HAMMER.r round HAMMER.at before it), brought
 *            down in two frames (HAMMER_HIT): a hero within HAMMER.r is struck and knocked back (HAMMER.knock); the floor cracks
 *            ('qgolem:quake', drawn only)
 *   boulder  it tears a boulder up out of the floor and holds it up; at BOULDER.aim it takes where the hero stands and the lane is
 *            marked from it through there, BOULDER.long tiles or to a wall ('qgolem:boulder', its 0 the bowling, ROLL_HIT); bowled,
 *            the boulder rolls down it from BOULDER.from at BOULDER.pace; a hero in the lane as it comes by is struck and it
 *            SMASHES on him; else at the lane's end; a hero within BOULDER.r of where it smashes is struck, once, and knocked back.
 *            `fx`, `fy` the lane's way; `a` the golem (till it is bowled); `d` the lane's length; once it has smashed, `b`, `c`
 *            where, and `hit` when; `done` 1 once it has struck him.
 */
export const BOULDER_PERIL = 'qgolem:boulder';
export const QUAKE_PERIL = 'qgolem:quake';
const ROLL_ACTS: ActDef[] = [
  { id: 'qgolem:hammer', clip: 'attack', long: HAMMER.long, hit: HAMMER_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: HAMMER.at + 1.0 },
  { id: 'qgolem:boulder', clip: 'throw', long: 2.7, hit: ROLL_HIT, dmg: 1.4, cooldown: 7, first: 1.2, after: 0.6, near: BOULDER.near, far: BOULDER.far },
];
const CHUNK_ACTS: ActDef[] = [
  { id: 'qgolem:hammer', clip: 'attack', long: 1.8, hit: 0.95, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 2.0 },
  { id: 'qgolem:throw', clip: 'throw', long: 2.0, hit: 1.12, dmg: 1.4, cooldown: 7, first: 1.2, after: 0.6, near: 2.6, far: 8 },
];
/** Where the boulder is down its lane, `p.t` seconds after it was bowled (tiles from the golem), until it smashes. */
export const boulderDown = (p: Peril): number => BOULDER.from + boulderGone(p.t);

export const RULES: Act1Rules = {
  // (its plod: twelve frames at eight a second, painted for a tile a second; setting off and stopping 0.6 s each;
  // from behind it is painted as the heroes are, turned over. It stops only as its walk comes round, a tile and a
  // half at a time: so wherever it stops, between `stopAt` and a tile and a half nearer, its hammer reaches him;
  // and no further off than its hammer's reach does it wait for him)
  gait: { pace: 1.0, cycle: 1.5, setOff: 0.6, halt: 0.6, raise: 0, lower: 0, stopAt: 1.8, slack: 0.2, trueBack: false },
  get acts() {
    return GOLEM_BOULDER.on ? ROLL_ACTS : CHUNK_ACTS;
  },
  acting(R: BossRules, m: Monster, a, t0, t1): void {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (GOLEM_BOULDER.on && a.id === 'qgolem:hammer') {
      const s = beside(m.x, m.y, m.fx, m.fy, act.hand, HAMMER.at, 0);
      // (its reach marked as it holds its fists up)
      if (at(0.45)) g.addWarn(s.x, s.y, HAMMER.r, HAMMER_HIT - 0.45, 0, g.monsterElement(m), m.words, m.name, m.id, g.halfOf(m), true);
      if (!at(a.hit)) return;
      if (smashStrikes(h.x - s.x, h.y - s.y, HAMMER.r)) {
        R.blow(m, a.dmg);
        if (!h.move && h.invuln <= 0) g.knockHero(m.x, m.y, HAMMER.knock);
      }
      R.peril(m, 'act1', s.x, s.y, { a1: QUAKE_PERIL, dur: BOULDER.rubble });
      g.emit({ t: 'shake', amount: 4 });
      g.sfx('slam', 0.8);
      return;
    }
    if (a.id === 'qgolem:boulder') {
      if (at(0.42)) g.sfx('slam', 0.35);
      if (!at(BOULDER.aim)) return;
      // (where the hero stands now: the lane through there, to its length or a wall)
      const dx = h.x - m.x;
      const dy = h.y - m.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      let long = BOULDER.from;
      while (long < BOULDER.long && g.isOpen(m.x + ux * (long + 0.3), m.y + uy * (long + 0.3))) long += 0.25;
      R.peril(m, 'act1', m.x, m.y, { a1: BOULDER_PERIL, t: -(ROLL_HIT - BOULDER.aim), hit: 1e9, dur: 1e9, dmg: g.rollMonsterDmg(m) * a.dmg, fx: ux, fy: uy, a: m.id, d: long });
      return;
    }
    if (a.id === 'qgolem:hammer') {
      if (!at(a.hit)) return;
      // (both fists down on the floor before it, with all its weight)
      const H = QGOLEM.hammer;
      const s = beside(m.x, m.y, m.fx, m.fy, act.hand, H.at, 0);
      if (Math.hypot(h.x - s.x, h.y - s.y) <= H.r) {
        R.blow(m, a.dmg);
        if (!h.move && h.invuln <= 0) g.knockHero(m.x, m.y, H.knock);
      }
      g.emit({ t: 'shake', amount: 4 });
      g.sfx('slam', 0.8);
    } else if (a.id === 'qgolem:throw') {
      const C = QGOLEM.chunk;
      // (the chunk wrenched off its shoulder)
      if (at(C.tear)) g.sfx('slam', 0.35);
      if (!at(a.hit)) return;
      // (hurled at where the hero stands now: it comes down there)
      const o = beside(m.x, m.y, m.fx, m.fy, act.hand, C.from[0], C.from[1]);
      const dx = h.x - o.x;
      const dy = h.y - o.y;
      const d = Math.hypot(dx, dy);
      const fly = C.fly0 + C.flyPer * d;
      R.peril(m, 'act1', h.x, h.y, {
        a1: 'qgolem:chunk', hit: fly, dur: fly + C.lie, dmg: g.rollMonsterDmg(m) * a.dmg,
        fx: d > 0.01 ? dx / d : m.fx, fy: d > 0.01 ? dy / d : m.fy, a: o.x, b: o.y, c: C.from[2], d: C.arc0 + C.arcPer * d,
      });
      g.sfx('swing', 0.8);
    }
  },
  peril(R: BossRules, p: Peril): void {
    if (p.a1 === BOULDER_PERIL) {
      const g = R.g;
      const h = g.hero;
      if (p.t < 0) {
        // (held up, not yet bowled: gone if the golem falls or is stopped first)
        const m = g.monsters.find((o) => o.id === p.a);
        if (!m || m.dead || m.state !== 'act') p.dur = p.t;
        return;
      }
      if (p.hit < 1e9) return;
      const along = (h.x - p.x) * p.fx + (h.y - p.y) * p.fy;
      const across = -(h.x - p.x) * p.fy + (h.y - p.y) * p.fx;
      const down = boulderDown(p);
      const meets = !h.move && boulderStrikes(down, along, across);
      if (!meets && down < p.d) return;
      // (it smashes: on him, or at its lane's end)
      const at = Math.min(down, p.d);
      p.b = p.x + p.fx * at;
      p.c = p.y + p.fy * at;
      p.hit = p.t;
      p.dur = p.t + BOULDER.rubble;
      if (meets || smashStrikes(h.x - p.b, h.y - p.c)) {
        p.done = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.b, p.c, p.half);
        if (!h.move && h.invuln <= 0) g.knockHero(p.b, p.c, 0.8);
      }
      g.emit({ t: 'shake', amount: 5 });
      g.sfx('slam', 0.9);
      return;
    }
    if (p.a1 !== 'qgolem:chunk' || p.done || p.t < p.hit) return;
    // (it comes down, and shatters)
    const g = R.g;
    const h = g.hero;
    p.done = 1;
    if (Math.hypot(h.x - p.x, h.y - p.y) <= QGOLEM.chunk.r) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
    g.emit({ t: 'shake', amount: 3 });
    g.sfx('slam', 0.7);
  },
};
