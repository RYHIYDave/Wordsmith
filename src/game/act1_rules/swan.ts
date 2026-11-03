// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: THE SWANS: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2, Part Two: The High City (Levels 16–20)", level 16): "Enemies: the Hushed gardeners and grooms, the
// palace guard, and the swans." His answers to the art chat (28 Oct 2026; docs/mockups/swan_gardens/README.md): what they are,
// “Plain swans gone wild”; their size, “Knee-high, in flocks”; how they move, “Waddle and charge”; their attack, “Hissing lunge,
// a bite”; their death, “Bursts into feathers (Recommended)”; and to their pictures, “Yes, they're the swans (Recommended)”. The
// art chat's pictures (art/garden_swans.ts, on its own solids as the fog wolves are): THE WADDLE, painted for SWAN_PACE (1.4)
// tiles a second, its feet carried back under it at that pace; THE BITE (SWAN_BITE, 1.05 s): a crouch and a hiss, the bill
// open, the neck drawn back (its warning, from 0.2 s), the neck thrown out at 0.36 and the bill shut on you at 0.5 (THE BLOW),
// its bill's nail then a little over a tile before its middle; back on its stand by 1.05. Struck, 0.45 s; its death, knocked
// over onto its side in a burst of white feathers drifting down (1.6 s), all in its pictures. Small: one attack.
//
// WHAT THEY DO, by those (the main chat's helper's, as the art leaves it to the game):
// - THE BITE, their one blow: at its moment, whoever is in the strip before it, from its breast out past where its bill shuts
//   (`bite.at`, measured off the picture) by `bite.more`, and `bite.half` to either side of its neck's line, is struck. His rule
//   of 28 Oct (“And bigger AOE to compensate for the extra time the player gets to evade”): bigger than the Hush's like kind's
//   (the mute hound's pounce, half a tile round where its paws come down, about 1.27 tiles before it and a tile across): this
//   one reaches 1.6 tiles before it and 1.4 across. Through its wind-up the strip is marked on the floor in the enemy's pink
//   (render/act1_fx/swan.ts), so that one who sees it can step out.
// - THE CHARGE, his “Waddle and charge”: a swan waddles on at its painted pace; one that sees the hero within `charge.from`
//   tiles (and is not yet in its bite's reach) charges, its waddle quickened to `charge.pace` tiles a second (its pictures
//   played as much faster: the game steps its walk by the ground it covers, so its feet still grip), until it bites, loses
//   sight of him, or `charge.most` seconds have gone; then it waddles `charge.rest` seconds before it may charge again. So a
//   flock comes on slowly from afar and rushes the last few tiles, hissing.
// - IN FLOCKS (his “Knee-high, in flocks”): a pack of them is a flock, `flock` strong (before a floor's growth: Game.fillPack),
//   bigger than another small kind's pack (game/defs.ts PACK_BY_SIZE.small, 4 to 7): game/act2_mobs.ts act2Pack.
//
// Every number here that is a picture's is written down here; tests/act2_swan.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE SWANS' NUMBERS (tiles before them and to their left; seconds of their pictures). */
export const SWAN = {
  /** Its waddle's pace (SWAN_PACE, tiles a second), and how long its round of both feet is (SWAN_WALK.period). */
  pace: 1.4,
  round: 0.4,
  /**
   * THE BITE (SWAN_BITE): its length, its warning's start (the crouch and hiss); its bill shuts at `hit`, its nail `at` tiles
   * before its middle then (the picture's, measured: swanSolids 'nail'); struck, whoever is from `from` before it out to `at`
   * and `more` beyond, within `half` of its line.
   */
  bite: { long: 1.05, warn: 0.2, hit: 0.5, at: 1.099, from: -0.2, more: 0.5, half: 0.7 },
  /** THE CHARGE: from how near (tiles), how fast (tiles a second), for how long at most (seconds), and its rest after. */
  charge: { from: 4.5, pace: 2.6, most: 1.8, rest: 2.5 },
  /** A FLOCK: how many to a pack (before the floor's growth), where another small kind's is 4 to 7. */
  flock: [6, 9] as readonly [number, number],
};

/** How far before it the bite strikes (the hero's middle): its bill's reach and a little more. */
export const BITE_REACH = SWAN.bite.at + SWAN.bite.more;

/**
 * Its waddle, painted for SWAN_PACE tiles a second, both feet round in SWAN_WALK.period; it stops only where both feet are on the
 * floor (each half of the round), and so a little nearer than it means to.
 */
const GAIT: GaitDef = { pace: SWAN.pace, cycle: SWAN.round / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.0, slack: 0.3, trueBack: true };

const ACTS: readonly ActDef[] = [
  // (made from no further than its bite reaches with a waddle's half round to spare: wherever it stops, its bite reaches him)
  { id: 'swan:bite', clip: 'attack', long: SWAN.bite.long, hit: SWAN.bite.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 1.4 },
];

/** What it keeps (Monster.a1): its own pace (`v`, as it came into the world), the charge's time left (`ch`, 0: waddling) and its rest (`cd`). */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { v: m.speed, ch: 0, cd: 0 });
}

/** Is it charging now? */
export function charging(m: Monster): boolean {
  return !!m.a1 && m.a1.ch > 0;
}

/** The charge ends: back to its waddle, and a rest before the next. */
function settle(m: Monster, k: Record<string, number>): void {
  k.ch = 0;
  k.cd = SWAN.charge.rest;
  m.speed = k.v;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(_R, m) {
    keep(m);
  },
  start(_R, m) {
    // (it bites: its charge is done)
    const k = keep(m);
    if (k.ch > 0) settle(m, k);
  },
  tick(R: BossRules, m, dt, dist) {
    const g = R.g;
    const k = keep(m);
    const C = SWAN.charge;
    k.cd = Math.max(0, k.cd - dt);
    // (biting, or nothing to charge at: it waddles)
    if (m.state === 'act' || g.over) {
      if (k.ch > 0) settle(m, k);
      return false;
    }
    const h = g.hero;
    if (k.ch > 0) {
      k.ch -= dt;
      if (k.ch <= 0 || dist > C.from + 1 || !g.sees(m.x, m.y, h.x, h.y)) settle(m, k);
    } else if (k.cd <= 0 && dist <= C.from && dist > ACTS[0].far && g.sees(m.x, m.y, h.x, h.y)) {
      // THE CHARGE: its waddle quickened, its neck out low, hissing
      k.ch = C.most;
      m.speed = k.v * (C.pace / SWAN.pace);
      g.sfx('gust', 0.2);
    }
    return false;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    // (the hiss as it crouches: a breath of air, no voice of its own in the game's sounds)
    if (at(SWAN.bite.warn)) g.sfx('gust', 0.25);
    if (a.id !== 'swan:bite' || !at(a.hit)) return;
    // (its bill shuts before it: whoever is in the strip it lunges along is bitten)
    const B = SWAN.bite;
    const r = R.rel(m);
    if (r.fwd >= B.from && r.fwd <= BITE_REACH && Math.abs(r.left) <= B.half) R.blow(m, a.dmg);
    g.sfx('swing', 0.3);
  },
};
