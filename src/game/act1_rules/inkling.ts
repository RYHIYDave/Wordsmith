// ACT 2, THE HUSH: FLOOR 15, THE GREAT LIBRARY: THE INKLINGS: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", level 15): "Enemies: the Silent Order in force, and creatures of spilled ink." The
// art chat's pictures (art/inklings.ts, inklings_moves.ts, inkling_shots.ts; docs/mockups/act2_library/README.md), made on
// his word of 18 Oct 2026, 21:24 Pacific ("Hey go without my say so.  If something is shit I’ll get it to it but you’re
// doing a great jobs. At least for 11-15"): the Order's ink, spilled across the library's floors, got up and walking. Small
// and hunched, no mouth (nothing of them makes a sound with a mouth). Their scuttle, painted for 1.3 tiles a second; THE
// INK LASH, reared up (the warning) and both claws raked down across before them, crossing, at 18/30 of a second, about
// 0.7 tiles before them, carried on to 0.8; THE MELT, sunk and run down into a pool of ink; THE RISE, pulled up out of the
// pool, crouched before you. Small: one attack, by his rule.
//
// WHAT THE ART LEFT TO THE GAME ("what the ink lash, the pool and the tome slam do to the hero"; "where the inklings melt,
// where their pools slide and how fast, and where they rise again"), the planning chat's helper's picks:
// - THE LASH harms whoever its claws close across (a strip before them as wide as the claws come in from), once.
//   Nothing more: it is their one blow.
// - THEY MELT when the hero is in sight between `pool.from` and `pool.to` tiles off (too far to scuttle in to quickly,
//   near enough to come for), and their last melt is `pool.again` seconds behind them (the first `pool.first` after they
//   wake). The melt is a move brought by the rules, not chosen: its picture played whole.
// - AS A POOL they slide along the floor toward the hero, the way the floor lets them, at `pool.speed` tiles a second
//   (quicker than their scuttle: it is how they close on you), and cannot be struck (it is ink on the floor): from
//   `melt.gone` into the melt, all through the pool, and until `rise.up` into the rise. A pool is not held up by others
//   (it slides under them), as one up in the air is not (game.ts, `away`).
// - THEY RISE before the hero: when the pool has come within `pool.near` of him (in reach of their lash), or has slid
//   `pool.most` seconds, or can go no nearer. The rise turns them to him first (BossRules.startAct), so they come up facing
//   him, crouched before him; their lash may follow at once.
// - THEIR DEATH: they burst and run down into a stain (their picture's last), which lies as any body does (game/defs.ts
//   BODIES: thirty seconds, then fades).
//
// Every number here that is a picture's is written down here; tests/act2_inkling.test.ts holds it to the art.

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE INKLINGS' NUMBERS (tiles, seconds of their pictures; the pool's the rules'). */
export const INKLING = {
  /**
   * Their lash (art IK_LASH, 1.3 s): the claws cross before them at `hit` (18/30), `reach` tiles out as they are carried
   * on (handAt: 0.69 at the blow, 0.8 by 0.7 s), coming in from 0.41 either side (at 0.5 s): `half` that and a little for
   * the hero's own width.
   */
  lash: { long: 1.3, hit: 18 / 30, reach: 0.8, half: 0.5 },
  /** Their melt (IK_MELT, 0.9 s, run down into the pool 0.12 to 0.8): out of reach from `gone` into it. */
  melt: { long: 0.9, gone: 0.45 },
  /** Their rise (IK_RISE, 1.1 s, pulled up out of the pool 0.08 to 0.82): in reach again from `up` into it. */
  rise: { long: 1.1, up: 0.45 },
  /** Their pool (the rules'): when they melt (the hero `from` to `to` tiles off, in sight; `again` seconds between melts, the first `first` after waking), how fast it slides, how near it comes before they rise, how long it may slide. */
  pool: { from: 2.6, to: 9, again: [6, 9] as const, first: [1.5, 3] as const, speed: 2.2, near: 0.9, most: 4.5 },
};

/** Their scuttle, painted for 1.3 tiles a second (IK_PACE; ten frames at twelve a second); stopped at any frame of it (the art's every frame of the walk handing back to the stand). */
const GAIT: GaitDef = { pace: 1.3, cycle: 1 / 12, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.7, slack: 0.2, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'inkling:lash', clip: 'attack', long: INKLING.lash.long, hit: INKLING.lash.hit, dmg: 1, cooldown: 0, first: 0, after: 0.55, near: 0, far: 0.95 },
  { id: 'inkling:melt', clip: 'melt', long: INKLING.melt.long, hit: INKLING.melt.gone, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'inkling:rise', clip: 'rise', long: INKLING.rise.long, hit: INKLING.rise.up, dmg: 0, cooldown: 0, first: 0, after: 0.15, near: 0, far: 99, forced: true },
];
const RISE = ACTS.findIndex((a) => a.id === 'inkling:rise');

/**
 * What their rules keep on one (Monster.a1): `sunk`, 0 up, 1 melting, 2 a pool going about, 3 rising; `mcd`, seconds
 * before it may melt again; `pt`, how long it has gone about as a pool; `vx`, `vy`, the pool's way and pace (tiles a
 * second, for its picture: art/inkling_shots.ts drawInkPool).
 */
function st(m: Monster): Record<string, number> {
  return (m.a1 ??= { sunk: 0, mcd: -1, pt: 0, vx: 0, vy: 0 });
}

/** Is it ink on the floor now, out of reach (melted far enough, a pool, or not yet risen far enough)? */
export function inkSunk(m: Monster): boolean {
  const s = m.a1;
  if (!s || !s.sunk) return false;
  if (s.sunk === 2) return true;
  const t = m.state === 'act' && m.act ? m.act.t : 0;
  return s.sunk === 1 ? t >= INKLING.melt.gone : t < INKLING.rise.up;
}
/** Is it going about as a pool (its figure not drawn: its pool is, render/act1_fx/inkling.ts)? */
export function inkPool(m: Monster): boolean {
  return !!m.a1 && m.a1.sunk === 2;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(_R, m) {
    st(m);
  },
  reachable(m) {
    return !inkSunk(m);
  },
  forced(R, m, acts) {
    const s = st(m);
    const g = R.g;
    const h = g.hero;
    if (s.mcd < 0) s.mcd = g.rng.range(INKLING.pool.first[0], INKLING.pool.first[1]);
    if (s.sunk || s.mcd > 0 || g.over) return -1;
    const d = Math.hypot(h.x - m.x, h.y - m.y);
    if (d < INKLING.pool.from || d > INKLING.pool.to || !g.sees(m.x, m.y, h.x, h.y)) return -1;
    return acts.findIndex((a) => a.id === 'inkling:melt');
  },
  start(_R, m, a) {
    const s = st(m);
    if (a.id === 'inkling:melt') s.sunk = 1;
    else if (a.id === 'inkling:rise') s.sunk = 3;
  },
  end(R, m, a) {
    const s = st(m);
    if (a.id === 'inkling:melt') {
      // (only the pool left: it goes about as one)
      s.sunk = 2;
      s.pt = 0;
      s.vx = 0;
      s.vy = 0;
    } else if (a.id === 'inkling:rise') {
      s.sunk = 0;
      s.mcd = R.g.rng.range(INKLING.pool.again[0], INKLING.pool.again[1]);
    }
  },
  tick(R, m, dt, dist) {
    const s = st(m);
    if (s.mcd > 0 && !s.sunk) s.mcd = Math.max(0, s.mcd - dt);
    if (s.sunk !== 2) return false;
    // A POOL OF INK, sliding along the floor toward the hero, the way the floor lets it
    const g = R.g;
    const P = INKLING.pool;
    s.pt += dt;
    m.state = 'chase';
    m.anim = 'idle';
    const v = g.wayTo(m, dist < 2.5 && g.sees(m.x, m.y, g.hero.x, g.hero.y));
    const sp = P.speed * (m.chillT > 0 ? 1 - m.chill : 1);
    const x0 = m.x;
    const y0 = m.y;
    if (dist > P.near && (v.x !== 0 || v.y !== 0)) {
      const step = Math.min(sp * dt, dist - P.near);
      g.slide(m, Math.min(m.r, 0.42), v.x * step, v.y * step, g.level.walk, true);
      m.fx = v.x;
      m.fy = v.y;
    }
    const moved = Math.hypot(m.x - x0, m.y - y0);
    s.vx = dt > 0 ? (m.x - x0) / dt : 0;
    s.vy = dt > 0 ? (m.y - y0) / dt : 0;
    // (before him, or slid its while, or held up: it rises)
    const nearNow = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
    if (nearNow <= P.near + 0.02 || s.pt >= P.most || (s.pt > 0.3 && moved < sp * dt * 0.2)) {
      s.vx = 0;
      s.vy = 0;
      R.startAct(m, ACTS, RISE);
    }
    return true;
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'inkling:lash' || !(t0 < a.hit && t1 >= a.hit)) return;
    // (both claws raked down across before them, crossing: whoever they close across is struck)
    const g = R.g;
    const L = INKLING.lash;
    const r = R.rel(m);
    if (r.fwd > -0.2 && r.fwd <= L.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= L.half) R.blow(m, a.dmg);
    g.sfx('swing', 0.35);
  },
};

/** (for the tests) Their acts. */
export const INKLING_ACTS = ACTS;
