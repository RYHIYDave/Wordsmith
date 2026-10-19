// ACT 2, THE HUSH: FLOOR 12'S BOSS: THE RAT KING (the Undercity; his floor "The King's Cistern"): his rules
// (game/act1_rules/types.ts).
//
// His doc (with his yes as ideas): "A knot of rats tied at the tails, swollen on jars it broke into, squeaking in a hundred
// stolen voices." Its moves there: "a gnashing bite (its basic attack); Unknot, where it bursts into a swarm across the floor
// and knots back together somewhere else; the Roll, where it balls up and barrels down a tunnel; Stolen Words, bolts of fire,
// frost, lightning or poison that look like your own words." Its pictures are the art chat's (art/rat_king.ts, what it throws
// art/rat_king_shots.ts, behind RAT_KING_ON), made on his word of 18 Oct, 21:24 Pacific ("Hey go without my say so.  If
// something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"), its notes
// docs/mockups/act2_undercity/README.md: ten swollen sewer rats and their King, their tails knotted into one lump bound round
// with the Silent Order's black cord, a heap near three tiles across. Every moment, pace and reach here is theirs
// (tests/act2_ratking.test.ts holds them to the art); what each move hurts, how hard and how often is this file's.
//
//   THE BITE, his basic blow (RK_BITE): the front rats rear up, mouths wide, trembling (the warning), the heap surges under half
//     a tile and they SNAP DOWN at its moment: whoever is before the heap, as far as the front rats' jaws reach and as wide as
//     they are spread (measured off the picture), is bitten.
//   STOLEN WORDS (RK_WORDS): the King rears, every mouth opens, a word gathers before him (the warning: a thin line of the
//     enemy's pink along the floor the way it will fly, art/rat_king_shots.ts drawWordAim; it follows you until `lock`, then
//     holds); it flies at its moment, at the art's WORD_SPEED, and bursts on whoever it meets, or where it ends (a wall, or its
//     reach), harming within its burst there. Which word: one of the hero's own if he carries Flame, Frost, Lightning or
//     Poison (in any of his slots, melded too), else one of the four at random: it is the King's STOLEN word, and it does
//     that word's harm (Flame burns, Frost chills, Lightning shocks, Poison poisons), in the shape the art drew for it,
//     burning the enemy's pink.
//   THE ROLL (RK_ROLL, ROLL_PACE): he curls up tails-in into a ball of rats (the warning; its run marked on the floor as the
//     stag's charge is, the red troll's lane, art/charge_lane.ts), and barrels off along the floor toward you and on past you,
//     at the pace its ball is painted for, so that it does not slide: one whole turn of its ball, or two where the floor is clear
//     for two (its picture turns whole turns; it uncurls from where a turn ends). Whoever it rolls over is struck and thrown
//     aside. It stops at walls: it is only made with a clear run of one turn at least, and is never rolled into one; should
//     anything stop it on the way, it stops there.
//   UNKNOT (RK_UNKNOT): the knot comes loose and the rats burst outward and are gone into the cracks; THE SWARM runs across the
//     floor (art/rat_king_shots.ts drawSwarm, SWARM_FOR) to somewhere else in his cistern: past you, on your far side, where
//     there is room (so it runs across you), and there they pour back in and knot again. Gone, he is out of reach. As the swarm
//     passes over you it bites, a little, every `every` while you stand in it (the art left it to the game).
//   His death is the art's (RK_DIE: the glass crown knocked off, the cord snapping, the voices pouring up out of them and going
//     free, the rats scattering into the cracks; the cord, the crown and the corks left lying); a word of his still in the air
//     as he dies goes out.
//
// His line as you come into his ground (game/defs.ts BOSS_LINES): stolen voices, squeaking; the planning chat's helper's.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE } from '../defs';
import { beside, fromFigure } from '../facing';
import { withParts } from '../melds';
import type { Monster, Peril } from '../state';
import type { Element, WordId } from '../types';
import { blobDist } from '../act1_layout';
import type { Act1Rules } from './types';

/** The figure's lengths in a tile (art/new_mobs3.ts TILE3: the floor's tile as its pictures measure it). */
const T3 = 32 / Math.sqrt(2 / 3);

/** The four words he steals, in the art's order (art/rat_king_shots.ts StolenWord), as the hero's own words are named. */
export const STOLEN: readonly ('fire' | 'frost' | 'lightning' | 'poison')[] = ['fire', 'frost', 'lightning', 'poison'];

/** THE NUMBERS OF HIS FIGHT: his pictures' own (art/rat_king.ts, rat_king_shots.ts, in tiles and seconds), and what they hurt (the rules'). */
export const RK = {
  /**
   * The bite (RK_BITE): the front rats' jaws snap down at `hit`, the middle one 2.05 tiles before his floor point, the two
   * beside it 1.5 before and 1.2 to either side (measured: art/rat_king.ts ratKingPose, headOf(...).mouth); whoever's
   * middle is within `reach` of him and no more than `arc` (radians) off the way he faces is bitten.
   */
  bite: { hit: 0.66, jaws: [[2.053, 0.031], [1.504, 1.193], [1.478, -1.223]] as ReadonlyArray<readonly [number, number]>, reach: 2.5, arc: 0.94 },
  /**
   * Stolen words (RK_WORDS, WORD_SPEED, WORD_BURST_FOR): it flies at `hit` from where it gathered, `from` tiles before him and
   * `rise` game pixels up (its charge: art/rat_king.ts wordsPose), at `speed` tiles a second, as far as `reach`; it bursts on
   * a hero whose middle it passes within `r`, or where it ends, harming within `burst` of there; its burst is seen `burstFor`.
   * Its aim follows the hero until `lock` into the move, then holds. Its warning line from `warn`.
   */
  words: { warn: 0.22, hit: 0.86, lock: 0.6, from: 0.572, rise: 40.8, speed: 7, reach: 10, r: 0.5, burst: 1.0, burstFor: 0.5 },
  /**
   * The roll (RK_ROLL, ROLL_PACE): curled up from 0 to `curl` (its warning); rolling at `pace` tiles a second for `turn` seconds
   * a turn of its ball, one turn or two (`turns`); uncurled in `uncurl`. Whoever's middle comes within `r` of its middle
   * (its ball, 0.74 tiles to the backs of its rats, and the room the heap keeps round it) is struck and thrown aside `knock`.
   */
  roll: { curl: 0.7, turn: 0.8, turns: 2, uncurl: 0.6, pace: (2 * Math.PI * (14.5 * 2 + 1.6 * 2)) / (0.8 * T3), ball: (14.5 * 2) / T3, r: 1.3, knock: 1.4 },
  /**
   * Unknot (RK_UNKNOT, SWARM_FOR): coming loose and gone into the cracks in `out`; the swarm across the floor for `swarm`; knotted
   * again in `knot`. Out of reach from `gone` into it until `formed` into the knot. Where they knot again: `near` to `far` tiles
   * past the hero from where he was, at least `apart` from where he was, with room for the heap (`room`), the hero no more than
   * `across` off the swarm's way there. The swarm's stream along its way, τ seconds from when it bursts away (drawSwarm: each
   * of its rats away up to 0.25 s late, at 0.75 to 1 of its pace): its front at τ / `front` of the way, its back at
   * (τ − `back[0]`) / `back[1]`; `half` to either side of its line. It bites one in it no more than once in `every`.
   */
  unknot: { out: 0.9, swarm: 0.9, knot: 0.95, gone: 0.55, formed: 0.55, near: 2.5, far: 4.5, apart: 3.5, room: 1.0, across: 0.5, half: 1.0, every: 0.25, front: 0.4875, back: [0.25, 0.65] as const },
};

/** How far a turn of his ball carries him (tiles). */
export const ROLL_TURN = RK.roll.pace * RK.roll.turn;

/** His scuttle (RK_PACE, RK_WALK: six frames at twenty-four a second, a round of a quarter second, from his stand). From behind he is painted as the camera truly sees him (art/skin.ts stage). */
export const RK_GAIT: GaitDef = { pace: 1.2, cycle: 0.25, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.9, slack: 0.5, trueBack: true };

/** His four, his basic blow first and his biggest last (his rulebook: the bigger the hit, the longer the cooldown). */
export const RK_ACTS: readonly ActDef[] = [
  { id: 'ratking:bite', clip: 'attack', long: 1.36, hit: RK.bite.hit, dmg: 1, cooldown: 0, first: 0, after: 0.4, near: 0, far: 2.5 },
  { id: 'ratking:words', clip: 'words', long: 1.6, hit: RK.words.hit, dmg: 0.9, cooldown: 6, first: 3, after: 0.5, near: 2.2, far: 11 },
  { id: 'ratking:roll', clip: 'roll', long: RK.roll.curl + RK.roll.turns * RK.roll.turn + RK.roll.uncurl, hit: RK.roll.curl, dmg: 1.4, cooldown: 9, first: 5, after: 0.6, near: 2.5, far: 8 },
  { id: 'ratking:unknot', clip: 'unknot', long: RK.unknot.out + RK.unknot.swarm + RK.unknot.knot, hit: RK.unknot.out, dmg: 0.35, cooldown: 13, first: 7, after: 0.5, near: 0, far: 9 },
];

/** Where in the roll its ball's run ends (seconds into the roll), for one of `turns` turns. */
export function rollEnd(turns: number): number {
  return RK.roll.curl + turns * RK.roll.turn;
}

/** The way the swarm's stream has come along its way, `tau` seconds from when it burst away: its back and its front, 0 to 1. */
export function swarmSpan(tau: number): [number, number] {
  const U = RK.unknot;
  const c = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
  return [c((tau - U.back[0]) / U.back[1]), c(tau / U.front)];
}

/** What he keeps (Monster.a1): his word (STOLEN's index); his roll's turns, and whether it was stopped; where his swarm ran from (`sx`, `sy`), and when it last bit. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { word: 0, turns: 0, stuck: 0, sx: 0, sy: 0, bit: -1 });
}

/** How far the floor is clear from (x, y) along (fx, fy) for something of radius `r`, up to `most` tiles. */
function clearFor(R: BossRules, x: number, y: number, fx: number, fy: number, r: number, most: number): number {
  const g = R.g;
  let d = 0;
  for (let s = 0.3; s <= most + 1e-6; s += 0.3) {
    if (!g.free(g.level.walk, x + fx * s, y + fy * s, r)) break;
    d = s;
  }
  return d;
}

/** How far a word flies from (x, y) along (fx, fy): to the first of what stops a shot, or its reach. */
function flightOf(R: BossRules, x: number, y: number, fx: number, fy: number): number {
  const g = R.g;
  const W = RK.words;
  let d = 0;
  for (let s = 0.2; s <= W.reach + 1e-6; s += 0.2) {
    if (!g.isOpen(x + fx * s, y + fy * s)) break;
    d = s;
  }
  return d;
}

/** Where his word flies from now, and its way: toward his aim (act.x, act.y). */
export function wordFrom(m: Monster): { x: number; y: number; fx: number; fy: number } {
  const act = m.act!;
  const o = beside(m.x, m.y, m.fx, m.fy, act.hand, RK.words.from, 0);
  const dx = act.x - o.x;
  const dy = act.y - o.y;
  const d = Math.hypot(dx, dy);
  return d > 0.05 ? { x: o.x, y: o.y, fx: dx / d, fy: dy / d } : { x: o.x, y: o.y, fx: m.fx, fy: m.fy };
}

/** HIS STOLEN WORD: one of the hero's own, if he carries any of the four; else any of them. */
function stealWord(R: BossRules): number {
  const g = R.g;
  const own: number[] = [];
  for (const s of g.hero.skills) {
    for (const w of [...withParts(s.front), ...withParts(s.behind)]) {
      const i = STOLEN.indexOf(w as (typeof STOLEN)[number]);
      if (i >= 0 && !own.includes(i)) own.push(i);
    }
  }
  return own.length ? own[g.rng.int(0, own.length - 1)] : g.rng.int(0, STOLEN.length - 1);
}

/** A stolen word's harm: its element, and the words its blow carries (Poison, a word of the hero's own, poisons). */
export function harmOf(word: number, words: readonly WordId[]): { el: Element; words: WordId[] } {
  const w = STOLEN[word] ?? 'fire';
  if (w === 'poison') return { el: 'phys', words: [...words.filter((x) => x !== 'poison'), 'poison'] };
  return { el: w, words: [...words] };
}

/**
 * WHERE THEY KNOT AGAIN: past the hero, on his far side from where the King was (so that the swarm runs across him), `near`
 * to `far` tiles beyond him, with room for the heap, in his ground where the floor has one, in a clear line from where he was
 * (the swarm runs along the floor) and in the hero's sight; failing that, anywhere about that is far enough and clear; and
 * failing that, where he was.
 */
function knotSpot(R: BossRules, m: Monster): { x: number; y: number } {
  const g = R.g;
  const h = g.hero;
  const U = RK.unknot;
  const L = g.level;
  const area = L.land?.areas.find((a) => a.role === 'boss') ?? null;
  const ok = (x: number, y: number, mine: boolean): boolean =>
    g.free(L.walk, x, y, U.room) && Math.hypot(x - m.x, y - m.y) >= U.apart && g.sees(m.x, m.y, x, y) && g.sees(h.x, h.y, x, y) && (!mine || !area || blobDist(area.blob, x, y) < 0.95);
  // (the hero well inside the swarm's stream on its way there: no more than `across` off its line)
  const across = (x: number, y: number): boolean => {
    const lx = x - m.x;
    const ly = y - m.y;
    const len = Math.hypot(lx, ly) || 1;
    return Math.abs((h.x - m.x) * ly - (h.y - m.y) * lx) / len <= U.across;
  };
  const base = Math.atan2(h.y - m.y, h.x - m.x);
  for (const mine of [true, false]) {
    for (let tries = 0; tries < 60; tries++) {
      const a = base + g.rng.range(-0.7, 0.7);
      const d = g.rng.range(U.near, U.far);
      const x = h.x + Math.cos(a) * d;
      const y = h.y + Math.sin(a) * d;
      if (ok(x, y, mine) && across(x, y)) return { x, y };
    }
  }
  for (const s of g.spotsRound(m.x, m.y, 60)) if (ok(s.x, s.y, false)) return s;
  return { x: m.x, y: m.y };
}

/** Is he gone into the cracks now (between unknotting and knotting again: out of reach)? */
export function unknotted(m: { act?: { id: string; t: number } }): boolean {
  const U = RK.unknot;
  return !!m.act && m.act.id === 'ratking:unknot' && m.act.t >= U.gone && m.act.t < U.out + U.swarm + U.formed;
}
/** Is he nowhere to be seen now (his swarm running: nothing of him but it)? */
export function swarming(m: { act?: { id: string; t: number } }): boolean {
  const U = RK.unknot;
  return !!m.act && m.act.id === 'ratking:unknot' && m.act.t >= U.out && m.act.t < U.out + U.swarm;
}

export const RULES: Act1Rules | null = {
  gait: RK_GAIT,
  acts: RK_ACTS,

  spawned(_R, m) {
    keep(m);
  },

  reachable: (m) => !unknotted(m),

  can(R, m, a, dist) {
    if (a.id !== 'ratking:roll') return true;
    // (a clear run of a turn of his ball at least, toward the hero and on past him)
    const g = R.g;
    const h = g.hero;
    const fx = (h.x - m.x) / Math.max(0.01, dist);
    const fy = (h.y - m.y) / Math.max(0.01, dist);
    return clearFor(R, m.x, m.y, fx, fy, 0.6, ROLL_TURN + 0.6) >= ROLL_TURN + 0.3;
  },

  start(R, m, a) {
    const k = keep(m);
    const act = m.act!;
    if (a.id === 'ratking:words') {
      k.word = stealWord(R);
      const o = wordFrom(m);
      act.a = flightOf(R, o.x, o.y, o.fx, o.fy);
      R.g.sfx('bossRoar', 0.35);
    } else if (a.id === 'ratking:roll') {
      // (two turns where the floor is clear for two, one where it is not; where it set off from, for its lane)
      const C = RK.roll;
      k.turns = clearFor(R, m.x, m.y, m.fx, m.fy, 0.6, C.turns * ROLL_TURN + 0.6) >= C.turns * ROLL_TURN + 0.3 ? C.turns : 1;
      k.stuck = 0;
      act.x = m.x;
      act.y = m.y;
    } else if (a.id === 'ratking:unknot') {
      k.sx = m.x;
      k.sy = m.y;
      k.bit = -1;
    }
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const k = keep(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'ratking:bite': {
        if (at(0.16)) g.sfx('bossRoar', 0.3);
        if (!at(a.hit)) break;
        // THE SNAP: whoever is before the heap, as far as the front rats' jaws, as wide as they are spread
        const B = RK.bite;
        const r = R.rel(m);
        if (Math.hypot(r.fwd, r.left) <= B.reach && Math.abs(Math.atan2(r.left, r.fwd)) <= B.arc) R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('hit', 0.6);
        break;
      }
      case 'ratking:words': {
        const W = RK.words;
        // (its aim follows the hero until it holds)
        if (t0 < W.lock) {
          act.x = h.x;
          act.y = h.y;
        }
        const o = wordFrom(m);
        if (t1 < a.hit) act.a = flightOf(R, o.x, o.y, o.fx, o.fy);
        if (!at(a.hit)) break;
        // IT FLIES: the King's stolen word, in its shape, with its harm
        const harm = harmOf(k.word, m.words);
        R.peril(m, 'act1', o.x, o.y, { a1: 'ratking:word', fx: o.fx, fy: o.fy, a: act.a, b: k.word, c: 0, hit: 1e9, dur: 1e9, dmg: g.rollMonsterDmg(m) * a.dmg, el: harm.el, words: harm.words });
        g.sfx('fire', 0.7);
        g.emit({ t: 'shake', amount: 1 });
        break;
      }
      case 'ratking:roll': {
        const C = RK.roll;
        if (at(0.1)) g.sfx('bossRoar', 0.5);
        const end = rollEnd(k.turns || 1);
        // (THE RUN: carried at the pace its ball is painted for, by its picture's clock: as far along its way as its ball has
        // turned, whatever jostled it; stopped by what stands in its way)
        const ran = Math.max(0, Math.min(t1, end) - Math.max(t0, C.curl));
        if (ran > 0 && !k.stuck) {
          const come = (m.x - act.x) * m.fx + (m.y - act.y) * m.fy;
          const want = C.pace * (Math.min(t1, end) - C.curl);
          const step = Math.max(0, Math.min(want - come, C.pace * ran * 3));
          if (!g.free(g.level.walk, m.x + m.fx * (step + 0.45), m.y + m.fy * (step + 0.45), 0.6)) k.stuck = 1;
          else g.slide(m, Math.min(m.r, 0.42), m.fx * step, m.fy * step, g.level.walk, true);
          if (Math.floor(t1 * 4) !== Math.floor(t0 * 4)) g.emit({ t: 'shake', amount: 1 });
        }
        if (t1 > C.curl && t0 < end && !(act.b & 1) && Math.hypot(h.x - m.x, h.y - m.y) <= C.r && h.invuln <= 0 && !h.move && !g.over) {
          // RUN OVER: struck, and thrown aside out of its way (to the side of its line he stands on)
          act.b |= 1;
          const was = h.life;
          R.blow(m, a.dmg);
          if (h.life < was) {
            const side = (h.x - m.x) * m.fy - (h.y - m.y) * m.fx;
            const s = side < -0.02 ? -1 : 1;
            g.knockHero(h.x - m.fy * s, h.y + m.fx * s, C.knock);
          }
        }
        // (one turn only: its second is not rolled; it uncurls from where its first ends)
        if (at(end) && end < a.long - C.uncurl) act.t = a.long - C.uncurl + (t1 - end);
        if (at(end)) g.sfx('slam', 0.6);
        break;
      }
      case 'ratking:unknot': {
        const U = RK.unknot;
        if (at(0.12)) g.sfx('bossRoar', 0.45);
        if (at(U.out)) {
          // GONE INTO THE CRACKS: the swarm runs to where they will knot again
          k.sx = m.x;
          k.sy = m.y;
          const s = knotSpot(R, m);
          m.x = s.x;
          m.y = s.y;
          const dx = h.x - m.x;
          const dy = h.y - m.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.01) {
            m.fx = dx / d;
            m.fy = dy / d;
          }
          g.msg(`${m.name} comes apart into a swarm`, MSG.foe);
        }
        // THE SWARM, as it runs over the hero: it bites, a little, now and then
        if (t1 > U.out && t0 < U.out + U.swarm && !g.over && h.invuln <= 0 && !h.move) {
          const [back, front] = swarmSpan(t1 - U.out);
          const lx = m.x - k.sx;
          const ly = m.y - k.sy;
          const len = Math.hypot(lx, ly);
          if (len > 0.05) {
            const r = fromFigure(k.sx, k.sy, lx / len, ly / len, 1, h.x, h.y);
            const q = r.fwd / len;
            if (q >= back - 0.05 && q <= front + 0.05 && Math.abs(r.left) <= U.half + TUNE.heroRadius * 0.5 && (k.bit < 0 || t1 - k.bit >= U.every)) {
              k.bit = t1;
              R.blow(m, a.dmg);
            }
          }
        }
        if (at(U.out + U.swarm)) g.sfx('bossRoar', 0.3);
        break;
      }
      default:
        break;
    }
  },

  died(R, m) {
    // (a word of his still in the air goes out with him)
    const g = R.g;
    for (let i = g.perils.length - 1; i >= 0; i--) {
      const p = g.perils[i];
      if (p.kind === 'act1' && p.a1 === 'ratking:word' && p.from === m.name && !p.done) g.perils.splice(i, 1);
    }
  },

  peril(R, p, dt) {
    if (p.a1 !== 'ratking:word' || p.done) return;
    const g = R.g;
    const h = g.hero;
    const W = RK.words;
    const hurt = (x: number, y: number): void => g.hurtHero(p.dmg, p.el, p.words, null, p.from, x, y, p.half);
    // (its flight this step, in short steps: it bursts on the hero it meets, or where it ends)
    const d0 = Math.min(p.a, (p.t - dt) * W.speed);
    const d1 = Math.min(p.a, p.t * W.speed);
    const steps = Math.max(1, Math.ceil((d1 - d0) / 0.2));
    for (let s = 1; s <= steps; s++) {
      const d = d0 + ((d1 - d0) * s) / steps;
      const x = p.x + p.fx * d;
      const y = p.y + p.fy * d;
      if (Math.hypot(h.x - x, h.y - y) <= W.r && h.invuln <= 0 && !h.move && !g.over) {
        hurt(x, y);
        burst(p, d);
        return;
      }
    }
    if (d1 >= p.a) {
      const x = p.x + p.fx * p.a;
      const y = p.y + p.fy * p.a;
      if (Math.hypot(h.x - x, h.y - y) <= W.burst && h.invuln <= 0 && !h.move && !g.over) hurt(x, y);
      burst(p, p.a);
    }
  },
};

/** A word bursts `d` tiles along its way: it is seen bursting there for its while, and is gone. */
function burst(p: Peril, d: number): void {
  p.done = 1;
  p.c = d;
  p.hit = p.t;
  p.dur = p.t + RK.words.burstFor;
}
