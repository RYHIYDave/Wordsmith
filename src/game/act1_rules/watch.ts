// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE HUSHED WATCH: its rules (game/act1_rules/types.ts).
//
// His picks (to the art chat, 18 Oct 2026), of the watch: how they fight, "Halberd sweep (Recommended)" (offered as: they
// advance slowly, raise the long halberd high and shaking (the warning), then sweep it wide in front of them); what
// marks them, "The Order's black gags (Recommended)"; how big, "A head taller, menacing (Recommended)"; how they go down,
// "Gag falls, they kneel (Recommended)". Their pictures were made and filmed on his word of 21:24 Pacific that day ("Hey
// go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"),
// read by the planning chat as his yes to go in (docs/act2_build.md), anything he flags mended. The art chat's
// (art/hushed_watch.ts, art/hushed_watch_moves.ts): THE TRUDGE, painted for 0.8 tiles a second (WA_PACE), twelve frames
// at eight a second; THE HALBERD SWEEP (WA_SWEEP, 1.8 s): the halberd heaved up in both hands and raised high over the
// right shoulder, held there shaking, its blade glinting pink, from 0.32 to 0.62 s (THE WARNING); then, hips first, a
// step in and the whole halberd swept round low and wide before them from their right to their left, the blade crossing
// before them at 0.8 s (frame 24 of 30), carried on round to their left; heaved back up and stood. Struck, 0.4 s; their
// death, the gag falling, the Hush leaving them, the halberd dropping, and down on their knees (2.6 s), all in its
// pictures.
//
// THE BLOW ALONG THE SWEEP'S ARC: from `from` to `to` the halberd's blade comes round before them, low enough to strike a
// man (it comes down past their right shoulder from on high at `from`; it rises again after `to`). Its bearing (the
// blade's edge, radians to their left of the way they face) and how far the halberd reaches then (its top spike: the
// furthest of it) at each frame of that stretch are written down here, measured off its picture (halberdOf); the hero is
// struck once, as the blade passes where he stands, if he is within its reach then (about two tiles straight before
// them, the art chat's "about two tiles"; a little less to either side). A man swept by a halberd is knocked a little way
// on (`knock`: half a Heavy blow's step, as the quarry golem's hammer). The rest is the main chat's way with the
// Headsman's wide sweep (game/bosses.ts, HEADSMAN.sweep), which this is.
//
// MEDIUM: two attacks, his rule of 9 Oct: the sweep, their basic blow; and THE ROUND SWEEP, the art chat's second move for
// them (mockup/act2-seconds, docs/mockups/act2_seconds/README.md: WA_ROUND, art/watch_shots.ts), put in the game by the
// main chat on his word of 19 Oct 2026, 20:54 Pacific: "Second attacks are done". The halberd hauled back low, held shaking
// (the warning; a ring of pink all round them as far as it reaches), then they spin all the way round with it at full
// reach, so that behind them is no safer than before. The main chat's: the blade strikes him as it passes where he stands,
// if it reaches him there (`round.at`, its bearing and reach frame by frame, the art's roundBladeAt written down), once;
// a blow and a half, and thrown a little further than the sweep throws; every 7 seconds at most.
//
// THE WATCHMAN AND THE SERGEANT (the art's two, makeWatchArt3(mob)): a yellow pack's leader (an elite) is the sergeant
// (Monster.form 1: the figure 'watch:1', art/act1_figs/watch.ts `looks`, art/bestiary.ts figureOf), and is called so (a
// "Hushed Sergeant", where the others are "Hushed Watchman"); every other is a watchman.
//
// THE SERGEANT'S HOUNDS: a yellow pack of the watch comes with a brace of the mute watch hounds at its sergeant's heels
// (HOUND.heel.brace, game/act1_rules/hound.ts), laid round him as he is, of his pack (its minions, his words at half, as
// the rest of it): the art chat's "fast, in packs at the watch's heels" (art/hounds.ts).
//
// Every number here that is a picture's is written down here; tests/act2_watch.test.ts holds it to the art.

import { RNG } from '../../engine/rng';
import { MONSTERS, TUNE } from '../defs';
import { along } from '../bosses';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { beside, handOf } from '../facing';
import type { Monster } from '../state';
import { HOUND } from './hound';
import type { Act1Rules } from './types';
import { CHOP, CHOP_HIT, LOB, LOB_HIT, POOL, WATCH_LANTERN, biteAt, chopStrikes, inOil, lobArc, lobFly, lobFrom } from '../../art/action_f11_watch';
import type { Peril } from '../state';

/** THE HUSHED WATCH'S NUMBERS (tiles, seconds of their pictures). */
export const WATCH = {
  /**
   * THE SWEEP: the blade strikes from `from` to `to` (frames 21 to 30 of 30 a second); at each of those frames
   * (`at`: the moment, the blade's bearing to their left of the way they face, the halberd's reach then), as its
   * picture has it. Knocked `knock` of a Heavy blow's step.
   */
  sweep: {
    from: 21 / 30,
    to: 30 / 30,
    knock: 0.5,
    at: [
      [21 / 30, -1.562, 2.264], [22 / 30, -0.911, 2.444], [23 / 30, -0.4, 2.578], [24 / 30, 0.081, 2.646], [25 / 30, 0.409, 2.6],
      [26 / 30, 0.794, 2.496], [27 / 30, 1.184, 2.395], [28 / 30, 1.502, 2.315], [29 / 30, 1.745, 2.263], [30 / 30, 1.911, 2.228],
    ] as ReadonlyArray<readonly [number, number, number]>,
  },
  /** Which of their looks: the sergeant (Monster.form 1), and how many looks there are. */
  sergeant: 1,
  looks: 2,
};
const BEARING = WATCH.sweep.at.map(([t, b]) => [t, b] as const);
/**
 * THE ROUND SWEEP (WA_ROUND, 2.6 s): the warning `warn` (0.4 to 0.88); the blade comes round from `from` to `to` (frames 27
 * to 50 of 30 a second), straight before them at `hit` (33/30); `at` each frame: the moment, the blade's bearing to their
 * left of the way they began facing (radians, unwound: about 550 degrees in all) and how far the halberd reaches then
 * (art/hushed_watch_moves.ts roundBladeAt, measured). Thrown `knock` of a Heavy blow's step.
 */
export const ROUND = {
  long: 2.6,
  warn: [0.4, 0.88] as const,
  hit: 33 / 30,
  from: 27 / 30,
  to: 50 / 30,
  knock: 0.8,
  at: [
    [27 / 30, -2.22, 2.355], [28 / 30, -2.196, 2.355], [29 / 30, -2.079, 2.356], [30 / 30, -1.884, 2.357], [31 / 30, -1.582, 2.359],
    [32 / 30, -1.069, 2.376], [33 / 30, -0.189, 2.434], [34 / 30, 0.9, 2.507], [35 / 30, 1.965, 2.565], [36 / 30, 2.753, 2.565],
    [37 / 30, 3.261, 2.565], [38 / 30, 3.73, 2.565], [39 / 30, 4.2, 2.565], [40 / 30, 4.67, 2.565], [41 / 30, 5.14, 2.565],
    [42 / 30, 5.609, 2.565], [43 / 30, 6.051, 2.551], [44 / 30, 6.437, 2.536], [45 / 30, 6.768, 2.525], [46 / 30, 7.042, 2.519],
    [47 / 30, 7.254, 2.525], [48 / 30, 7.386, 2.543], [49 / 30, 7.431, 2.565], [50 / 30, 7.395, 2.579],
  ] as ReadonlyArray<readonly [number, number, number]>,
};
const ROUND_BEARING = ROUND.at.map(([t, b]) => [t, b] as const);
const ROUND_REACH = ROUND.at.map(([t, , r]) => [t, r] as const);

/** The round sweep's blade `t` seconds in: its bearing (radians to their left of the way they began facing, unwound), and how far the halberd reaches then. */
export function roundAt(t: number): { bearing: number; reach: number } {
  return { bearing: along(ROUND_BEARING, t), reach: along(ROUND_REACH, t) };
}
const REACH = WATCH.sweep.at.map(([t, , r]) => [t, r] as const);

/** The blade's bearing `t` seconds into the sweep (radians to their left of the way they face), and how far the halberd reaches then. */
export function sweepAt(t: number): { bearing: number; reach: number } {
  return { bearing: along(BEARING, t), reach: along(REACH, t) };
}

/**
 * Their trudge, painted for 0.8 tiles a second, twelve frames round; they stop only where both boots are down (each half
 * of it: frames 0 and 6), 0.6 tiles at a time. So they stop between `stopAt` and 0.6 nearer, inside the sweep's reach.
 */
const GAIT: GaitDef = { pace: 0.8, cycle: 6 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.9, slack: 0.4, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'watch:sweep', clip: 'attack', long: 1.8, hit: 24 / 30, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 2.3 },
  { id: 'watch:round', clip: 'round', long: ROUND.long, hit: ROUND.hit, dmg: 1.5, cooldown: 7, first: 2.5, after: 0.8, near: 0, far: 2.4 },
];

/** Is this one of the watch a pack's leader, or an elite: the sergeant? */
export function sergeantOf(m: Monster): boolean {
  return m.rarity === 'leader' || (m.elite && !m.champion);
}

/** THE SERGEANT'S HOUNDS: a brace of the mute watch hounds laid at his heels, of his pack, as he comes into the world. */
function brace(R: BossRules, m: Monster): void {
  const g = R.g;
  const H = HOUND.heel;
  if (H.brace <= 0 || m.rarity !== 'leader' || m.packId < 0) return;
  // (its own draw, from its own seed: the floor as it is laid is the same each time, and the game's own dice are not touched)
  const rng = new RNG(Math.floor(m.seed * 0x7fffffff) ^ 0x6a09e667);
  const hand = handOf(true, m.fx, m.fy);
  for (let k = 0; k < H.brace; k++) {
    const side = k % 2 === 0 ? 1 : -1;
    // (at his heels, behind him and to one side; if the floor is not free there, nearer him, then at his side)
    const tries: [number, number][] = [[-H.at, side * H.side], [-H.at * 0.6, side * H.side * 0.8], [0, side * H.side * 1.2], [-H.at, 0]];
    let spot = { x: m.x, y: m.y };
    for (const [fwd, left] of tries) {
      const p = beside(m.x, m.y, m.fx, m.fy, hand, fwd, left);
      if (g.free(g.level.walk, p.x, p.y, 0.3)) {
        spot = p;
        break;
      }
    }
    const d = g.spawn('hound', spot.x, spot.y, m.packId, 0, false, rng, null, { rarity: 'minion', words: m.words });
    d.fx = m.fx;
    d.fy = m.fy;
  }
}

/**
 * THE HALBERD CHOP AND THE LANTERN THROW (the art chat's art/action_f11_watch.ts behind WATCH_LANTERN, his yes there), in place of the
 * sweep and the round sweep:
 *   chop     heaved back over his head and held, the bite's reach marked (the game's warning, CHOP.r round biteAt); in two frames its
 *            head bites the floor (CHOP_HIT) and the floor splits on from it: a hero within CHOP.r of the bite, or on the split (from
 *            CHOP.from to CHOP.split before him, CHOP.half to either side: chopStrikes), struck and knocked back CHOP.knock; the split
 *            drawn ('watch:bite', CHOP.seen)
 *   lantern  swung back high and held, flaring; lobbed at where the hero stands as it leaves his hand ('watch:lantern': `a`, `b` where
 *            from, `c` how high (game pixels), `d` how high its arc rises; its blow `hit` after: lobFly), where it will land marked;
 *            it smashes: a hero within POOL.burst struck; the oil burns POOL.burn seconds (inOil, to POOL.r), burning a hero in it
 *            OIL_BURN.share of its blow every OIL_BURN.tick
 */
export const BITE_PERIL = 'watch:bite';
export const LANTERN_PERIL = 'watch:lantern';
export const OIL_BURN = { share: 0.3, tick: 0.5 };
const LANTERN_ACTS: readonly ActDef[] = [
  { id: 'watch:chop', clip: 'attack', long: CHOP.long, hit: CHOP_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 2.6 },
  { id: 'watch:lantern', clip: 'lantern', long: LOB.long, hit: LOB_HIT, dmg: 1.2, cooldown: 7, first: 2.5, after: 0.8, near: LOB.near, far: LOB.far },
];
/** Where the lantern is, `p.t` seconds after it left his hand: over the floor (tiles) and how high (game pixels). */
export function lanternAt(p: Peril): { x: number; y: number; z: number } {
  const u = Math.max(0, Math.min(1, p.hit > 0 ? p.t / p.hit : 1));
  return { x: p.a + (p.x - p.a) * u, y: p.b + (p.y - p.b) * u, z: p.c * (1 - u) + p.d * 4 * u * (1 - u) };
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  get acts() {
    return WATCH_LANTERN.on ? LANTERN_ACTS : ACTS;
  },
  spawned(R, m) {
    m.form = sergeantOf(m) ? WATCH.sergeant : 0;
    // (and called so: "Hushed Sergeant", his words before it as a leader's are)
    if (m.form === WATCH.sergeant) m.name = m.name.replace(MONSTERS.watch.name.replace('Hushed ', ''), 'Sergeant');
    brace(R, m);
  },
  acting(R, m, a, t0, t1) {
    if (a.id === 'watch:chop' || a.id === 'watch:lantern') {
      const g = R.g;
      const h = g.hero;
      const act = m.act!;
      const at = (T: number): boolean => t0 < T && t1 >= T;
      if (a.id === 'watch:chop') {
        const [bx, by] = biteAt();
        const b = beside(m.x, m.y, m.fx, m.fy, act.hand, bx, by);
        // (its reach marked as he heaves it back over his head)
        if (at(CHOP.up)) g.addWarn(b.x, b.y, CHOP.r, CHOP_HIT - CHOP.up, 0, g.monsterElement(m), m.words, m.name, m.id, g.halfOf(m), true);
        if (at(CHOP.up)) g.sfx('swing', 0.4);
        if (!at(a.hit)) return;
        const r = R.rel(m);
        if (!h.move && h.invuln <= 0 && !g.over && chopStrikes(r.fwd, r.left)) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, CHOP.knock);
        }
        R.peril(m, 'act1', b.x, b.y, { a1: BITE_PERIL, dur: CHOP.seen });
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.7);
        return;
      }
      if (at(LOB.back)) g.sfx('fire', 0.3);
      if (!at(a.hit)) return;
      // (lobbed at where the hero stands now: it comes down there)
      const F = lobFrom();
      const o = beside(m.x, m.y, m.fx, m.fy, act.hand, F.x, F.y);
      const dx = h.x - o.x;
      const dy = h.y - o.y;
      const d = Math.hypot(dx, dy);
      const fly = lobFly(d);
      R.peril(m, 'act1', h.x, h.y, {
        a1: LANTERN_PERIL, hit: fly, dur: fly + POOL.burn, dmg: g.rollMonsterDmg(m) * a.dmg, el: 'fire',
        fx: d > 0.01 ? dx / d : m.fx, fy: d > 0.01 ? dy / d : m.fy, a: o.x, b: o.y, c: F.z / 2, d: lobArc(d) / 2,
      });
      g.sfx('swing', 0.5);
      return;
    }
    if (a.id === 'watch:round') {
      // THE ROUND SWEEP: the blade comes all the way round; it strikes him as it passes where he stands, if it reaches him there
      const g = R.g;
      const h = g.hero;
      const act = m.act!;
      if (t0 < ROUND.warn[0] && t1 >= ROUND.warn[0]) g.sfx('swing', 0.4);
      if (t0 < ROUND.from + 0.04 && t1 >= ROUND.from + 0.04) g.sfx('swing', 1);
      if (t1 <= ROUND.from || t0 >= ROUND.to || act.b) return;
      const r = R.rel(m);
      const bearing = Math.atan2(r.left, r.fwd);
      const b0 = roundAt(Math.max(ROUND.from, t0));
      const b1 = roundAt(Math.min(ROUND.to, t1));
      if (!R.passes(b0.bearing, b1.bearing, bearing)) return;
      if (Math.hypot(r.fwd, r.left) > Math.max(b0.reach, b1.reach) + TUNE.heroRadius * 0.5) return;
      act.b = 1;
      R.blow(m, a.dmg);
      if (!h.move && h.invuln <= 0 && !g.over) g.knockHero(m.x, m.y, ROUND.knock);
      return;
    }
    if (a.id !== 'watch:sweep') return;
    const g = R.g;
    const h = g.hero;
    const S = WATCH.sweep;
    const act = m.act!;
    // (the halberd's rush through the air, as it comes round)
    if (t0 < S.from && t1 >= S.from) g.sfx('swing', 0.9);
    if (t1 <= S.from || t0 >= S.to || act.b) return;
    // (the blade comes round low before them: it strikes him as it passes where he stands, if it reaches him there)
    const r = R.rel(m);
    const bearing = Math.atan2(r.left, r.fwd);
    const b0 = sweepAt(Math.max(S.from, t0));
    const b1 = sweepAt(Math.min(S.to, t1));
    if (!R.passes(b0.bearing, b1.bearing, bearing)) return;
    if (Math.hypot(r.fwd, r.left) > Math.max(b0.reach, b1.reach) + TUNE.heroRadius * 0.5) return;
    act.b = 1;
    R.blow(m, a.dmg);
    if (!h.move && h.invuln <= 0 && !g.over) g.knockHero(m.x, m.y, S.knock);
  },
  peril(R, p) {
    if (p.a1 !== LANTERN_PERIL || p.t < p.hit) return;
    const g = R.g;
    const h = g.hero;
    if (!p.done) {
      // (it smashes: whoever is near is struck)
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= POOL.burst + TUNE.heroRadius * 0.5 && !h.move) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      g.emit({ t: 'shake', amount: 1 });
      g.sfx('fire', 0.7);
      return;
    }
    // (the oil burns: whoever is in it is burned, tick by tick)
    const s = p.t - p.hit;
    const next = POOL.smash + OIL_BURN.tick * (p.done - 1);
    if (s >= next && s < POOL.burn - POOL.fade * 0.5) {
      p.done++;
      if (!h.move && inOil(h.x - p.x, h.y - p.y, s)) g.hurtHero(p.dmg * OIL_BURN.share, p.el, p.words, null, p.from, p.x, p.y, p.half);
    }
  },
};

/** Its switch, for game/enemy_moves.ts (the new enemy moves of floors 5 to 19 switched on together). */
export { WATCH_LANTERN };
