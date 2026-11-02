// ACT 1: THE TWISTED DEER (FLOOR 9, THE PINEWOOD): its rules (game/act1_rules/types.ts).
//
// His design doc: "Twisted Deer | Medium | An antler gore; a rearing stomp." The art chat's pictures, each with his
// yes (art/twisted_deer.ts; 15 Oct, by 14:17, "Yes, as shown (Recommended)"): its hitching limp, painted for 1.8 tiles
// a second; its gore, its antlers hooking up through you 0.55 s in, 44 of its lengths (about 1.1 tiles) before it; its
// rearing stomp, reared up through its warning, its forefeet slammed down 0.7 s in, and a ring of nine thorny roots
// bursting up round it from 0.8 s, 0.6 to 1.2 tiles out. Medium: two attacks, by his rule of 9 Oct (the gore its
// basic blow, the stomp its big one, with a cooldown). How far the thorns hurt, how hard and how often are these rules'.
//
// Every number here that is a picture's is written down here; tests/act1_deer.test.ts holds it to the art.

import { CHARGE, CHARGE_CARRIED, CHARGE_HIT, CHARGE_STRIKE, DEER_BRAMBLE, GORE9, GORE_HIT, HEDGE, HEDGE_AT, HEDGE_GONE, chargeCarry, hedgeUp } from '../../art/action_f9_pinewood';
import { TUNE } from '../defs';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Game } from '../game';
import type { Peril } from '../state';
import type { Act1Rules } from './types';

/** THE TWISTED DEER'S NUMBERS (tiles, seconds of its pictures). */
export const DEER = {
  /** Its gore: its antlers hook up through you at `hit`, `reach` tiles before it (DEER_GORE.reach, 44 of its lengths), in a strip `half` to either side. */
  gore: { hit: 0.55, reach: 1.12, half: 0.65, knock: 0.5 },
  /** Its stomp: its forefeet slammed down at `hit`; the thorns burst up at `thorns` (its hit and its tenth's freeze), out to `reach` (the furthest of them, about 1.2 tiles); its warning on the floor from `warnFrom` (it gathers to rear). */
  stomp: { hit: 0.7, thorns: 0.8, reach: 1.25, warnFrom: 0.14, knock: 1 },
};

/** Its limp, painted for 1.8 tiles a second, a round of 0.5 s; it may stop at any frame of it (the art's: "its limp stops at any frame"). */
const GAIT: GaitDef = { pace: 1.8, cycle: 1 / 16, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.0, slack: 0.25, trueBack: false };

const ACTS: readonly ActDef[] = [
  { id: 'deer:gore', clip: 'attack', long: 1.1, hit: DEER.gore.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 1.25 },
  { id: 'deer:stomp', clip: 'stomp', long: 1.5, hit: DEER.stomp.hit, dmg: 1.3, cooldown: 7, first: 3, after: 0.6, near: 0, far: 1.35 },
];

/**
 * ITS BRAMBLE CHARGE AND ITS GORE BY MOVEMENT 9 (the art chat's art/action_f9_pinewood.ts behind DEER_BRAMBLE, his yes there; his fix
 * of 2 Nov, the living bramble and the gallop), in place of its stomp and its old gore:
 *   gore    its antlers hook up through a strip GORE9.reach before it, GORE9.half to either side, at GORE_HIT; knocked back GORE9.knock
 *   charge  at CHARGE.aim it takes the way to the hero: THE LANE marked from it through there ('deer:charge', its clock the charge's),
 *           CHARGE.lane long or to a wall; it bursts off at CHARGE_HIT and the game carries it down the lane by chargeCarry (to where
 *           the lane is cut by a wall); a hero within CHARGE.half of the lane's middle as it comes by is struck, once, and thrown
 *           aside; behind it all along its path A HEDGE OF BRAMBLE bursts up (each clump at HEDGE_AT as hedgeUp has it), a wall
 *           HEDGE.half to either side of the lane's middle that he cannot cross while it stands (to HEDGE_GONE), its thorns stinging
 *           (HEDGE_STING.share of its blow, every HEDGE_STING.every, while he is against it once it stands). The peril: `a` the deer, `d` how far it ran (the hedge
 *           stands to there), `c` the side of the hedge he is on (1, -1; 0 not yet), `b` when its thorns may sting him again.
 */
export const CHARGE_PERIL = 'deer:charge';
/** Its thorns: how much of its charge's blow they sting with, and how often while he is against them. */
export const HEDGE_STING = { share: 0.25, every: 0.5 };
const BRAMBLE_ACTS: readonly ActDef[] = [
  { id: 'deer:gore', clip: 'attack', long: GORE9.long, hit: GORE_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: GORE9.reach },
  { id: 'deer:charge', clip: 'charge', long: CHARGE.long, hit: CHARGE_HIT, dmg: 1.3, cooldown: 7, first: 3, after: 0.6, near: CHARGE.near, far: CHARGE.far },
];
/** How far it can run from (x, y) along (ux, uy) before a wall, to `most` tiles. */
function runFrom(g: Game, x: number, y: number, ux: number, uy: number, r: number, most: number): number {
  let d = 0;
  while (d < most && g.free(g.level.walk, x + ux * (d + 0.1), y + uy * (d + 0.1), r)) d += 0.1;
  return Math.min(d, most);
}
/** Where the hedge's clumps stand along its path, as far as it ran (tiles from where it set off). */
export const hedgeTo = (run: number): number[] => HEDGE_AT.filter((d) => d <= run - 0.3 + 1e-6);
/** Whether a clump `d` along stands at `t` (seconds into the charge): up, and not yet withered. */
const standing = (d: number, t: number): boolean => t >= hedgeUp(d) + HEDGE.rise * 0.5 && t < HEDGE_GONE - 0.1;

/** The hedge's wall, each step: he is kept on his side of it; against it, its thorns sting. */
function hedgeWall(R: BossRules, p: Peril, dt: number): void {
  const g = R.g;
  const h = g.hero;
  const r = TUNE.heroRadius;
  const along = (h.x - p.x) * p.fx + (h.y - p.y) * p.fy;
  const aside = -(h.x - p.x) * p.fy + (h.y - p.y) * p.fx;
  const up = hedgeTo(p.d).filter((d) => standing(d, p.t));
  if (!up.length) {
    p.c = Math.abs(aside) > 1e-3 ? Math.sign(aside) : p.c;
    return;
  }
  const lo = Math.min(...up) - HEDGE.step / 2 - r;
  const hi = Math.max(...up) + HEDGE.step / 2 + r;
  const band = HEDGE.half + r;
  const inWall = Math.abs(aside) < band && along > lo && along < hi;
  if (!inWall) {
    if (Math.abs(aside) >= band) p.c = Math.sign(aside);
    return;
  }
  // (in it: put out the shortest way that does not cross it, onto open floor)
  const at = (al: number, as: number): { x: number; y: number } => ({ x: p.x + p.fx * al - p.fy * as, y: p.y + p.fy * al + p.fx * as });
  const ways: { x: number; y: number; n: number }[] = [];
  const sides = p.c !== 0 ? [p.c] : [aside >= 0 ? 1 : -1, aside >= 0 ? -1 : 1];
  for (const s of sides) ways.push({ ...at(along, s * (band + 0.01)), n: Math.abs(s * (band + 0.01) - aside) });
  const end = along - lo < hi - along ? lo - 0.01 : hi + 0.01;
  ways.push({ ...at(end, aside), n: Math.abs(end - along) });
  ways.sort((u, v) => u.n - v.n);
  const out = ways.find((w) => g.free(g.level.walk, w.x, w.y, r * 0.9)) ?? ways[0];
  h.x = out.x;
  h.y = out.y;
  // (its thorns, against it: not as it bursts up round him, thrown aside by the deer)
  const near = up.reduce((u, v) => (Math.abs(v - along) < Math.abs(u - along) ? v : u));
  if (p.t - hedgeUp(near) > 0.3 && p.t >= p.b && !h.move && h.invuln <= 0 && !g.over) {
    p.b = p.t + HEDGE_STING.every;
    g.hurtHero(p.dmg * HEDGE_STING.share, p.el, p.words, null, p.from, h.x, h.y, p.half);
  }
  void dt;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  get acts() {
    return DEER_BRAMBLE.on ? BRAMBLE_ACTS : ACTS;
  },
  can(R, m, a) {
    // (its charge only with a clear run before it, toward him)
    if (a.id !== 'deer:charge') return true;
    const g = R.g;
    const dx = g.hero.x - m.x;
    const dy = g.hero.y - m.y;
    const d = Math.hypot(dx, dy) || 1;
    return runFrom(g, m.x, m.y, dx / d, dy / d, Math.min(m.r, 0.42), 2.5) >= 2.4;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const dist = Math.hypot(h.x - m.x, h.y - m.y);
    const free = !h.move && h.invuln <= 0 && !g.over;
    if (DEER_BRAMBLE.on && a.id === 'deer:gore') {
      if (!at(a.hit)) return;
      const G = GORE9;
      const r = R.rel(m);
      if (free && r.fwd > -0.2 && r.fwd <= G.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= G.half) {
        R.blow(m, a.dmg);
        g.knockHero(m.x, m.y, G.knock);
      }
      g.emit({ t: 'shake', amount: 2 });
      g.sfx('swing', 0.7);
      return;
    }
    if (a.id === 'deer:charge') {
      const act = m.act!;
      const k = (m.a1 ??= {});
      for (const T of CHARGE.stamps) if (at(T)) g.sfx('slam', 0.3);
      if (at(CHARGE.aim)) {
        // (the way to him now: the lane marked from it, to its length or a wall)
        const dx = h.x - m.x;
        const dy = h.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        const ux = dx / d;
        const uy = dy / d;
        m.fx = ux;
        m.fy = uy;
        act.x = m.x;
        act.y = m.y;
        k.run = runFrom(g, m.x, m.y, ux, uy, Math.min(m.r, 0.42), CHARGE_CARRIED);
        k.struck = 0;
        R.peril(m, 'act1', m.x, m.y, { a1: CHARGE_PERIL, t: CHARGE.aim, hit: CHARGE_HIT, dur: HEDGE_GONE, dmg: g.rollMonsterDmg(m) * a.dmg, fx: ux, fy: uy, a: m.id, d: k.run });
      }
      if (at(CHARGE_HIT)) {
        g.sfx('swing', 0.8);
        g.emit({ t: 'shake', amount: 2 });
      }
      if (t1 <= CHARGE_STRIKE[0] || k.run === undefined) return;
      // (the game carries it down its lane)
      const c0 = Math.min(chargeCarry(t0), k.run);
      const c1 = Math.min(chargeCarry(t1), k.run);
      m.x = act.x + m.fx * c1;
      m.y = act.y + m.fy * c1;
      // (a hero in its lane as it comes by: struck, once, and thrown aside)
      if (!k.struck && free && c1 > c0) {
        const along = (h.x - act.x) * m.fx + (h.y - act.y) * m.fy;
        const aside = -(h.x - act.x) * m.fy + (h.y - act.y) * m.fx;
        if (Math.abs(aside) <= CHARGE.half + TUNE.heroRadius * 0.5 && along >= c0 - 0.6 && along <= c1 + 0.6) {
          k.struck = 1;
          R.blow(m, a.dmg);
          const s = aside >= 0 ? 1 : -1;
          g.knockHero(act.x + m.fx * along + m.fy * s * 0.05, act.y + m.fy * along - m.fx * s * 0.05, 1);
          g.emit({ t: 'shake', amount: 3 });
        }
      }
      return;
    }
    if (a.id === 'deer:gore') {
      if (!at(a.hit)) return;
      // (its antlers hook up through what is before it, as far as they reach)
      const G = DEER.gore;
      const r = R.rel(m);
      if (free && r.fwd > -0.2 && dist <= G.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= G.half) {
        R.blow(m, a.dmg);
        g.knockHero(m.x, m.y, G.knock);
      }
      g.emit({ t: 'shake', amount: 2 });
      g.sfx('swing', 0.7);
    } else if (a.id === 'deer:stomp') {
      const S = DEER.stomp;
      if (at(a.hit)) {
        // (its forefeet come down: the earth bursts from under them)
        g.emit({ t: 'shake', amount: 4 });
        g.sfx('slam', 0.8);
      }
      if (at(S.thorns)) {
        // (the thorny roots burst up in a ring round it: whoever is within it is struck and thrown)
        if (free && dist <= S.reach + TUNE.heroRadius * 0.5) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, S.knock);
        }
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('explode', 0.35);
      }
    }
  },
  peril(R, p, dt) {
    if (p.a1 !== CHARGE_PERIL) return;
    const g = R.g;
    // (stopped before it ran its lane: no further; stopped before it burst off, none of it)
    const m = g.monsters.find((o) => o.id === p.a);
    const going = !!m && !m.dead && m.state === 'act' && m.act?.id === 'deer:charge';
    if (!going && p.t < CHARGE.until) {
      if (p.t < CHARGE_HIT) {
        p.dur = p.t;
        return;
      }
      p.d = Math.min(p.d, chargeCarry(p.t));
    }
    hedgeWall(R, p, dt);
  },
};

/** Its switch, for game/enemy_moves.ts (the new enemy moves of floors 5 to 19 switched on together). */
export { DEER_BRAMBLE };
