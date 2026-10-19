// ACT 2, THE HUSH: FLOOR 13'S BOSS, THE PALIMPSEST (the Millrace; its floor "The Pulping Floor"): its rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", level 13): "A giant of wet, layered pages, written and scraped and written over.
// Every hit peels pages off and shows older writing underneath." Its moves: "a pulp-fist slam (its basic attack); Paper
// Cuts, a whirl of slicing pages around it; Loose Leaves, pages that flap off as paper birds and dive at you; Rewrite,
// where it soaks fallen pages back up to heal unless they're burned. Fire words shine here." The art chat's pictures of
// every one (art/palimpsest.ts, palimpsest_moves.ts; what it throws and leaves, palimpsest_shots.ts; docs/mockups/
// act2_millrace/README.md), made on his word of 18 Oct, 21:24 Pacific ("Hey go without my say so.  If something is shit
// I’ll get it to it but you’re doing a great jobs. At least for 11-15"). The art leaves to the game how far its slam
// reaches, how many pages fall and where, what the birds do to the hero, how a page burns: this file, the planning
// chat's helper's.
//
// HOW IT FIGHTS. It lumbers after the hero (0.8 tiles a second, as its walk is painted) and makes its four:
// - THE PULP-FIST SLAM, its basic blow: both fists hauled up over its head and held trembling (its warning; a ring on the
//   floor where they will come down, in the game's way of warning of a blow that falls on a place), brought down into the
//   floor about 1.55 tiles before it: what is within the splash's reach of where they come down is struck and thrown.
// - PAPER CUTS, at one close in: its pages tear off and whirl round it, edge on, out to 2.55 tiles; what is in the whirl
//   is cut again and again while it goes round (a ring round it, as it spreads its arms, warns of it).
// - LOOSE LEAVES, at one who stands off: the seven leaves of its crest fly off as paper birds; one after another each
//   dives at where the hero is as it sets off (the first at him, the rest round him), a ring of the enemy's pink closing
//   on the spot through the last half second; it strikes there, and lies there after, a page on the floor.
// - REWRITE, its biggest, when pages of its lie about it: it crouches, and every page of its lying within its reach crawls
//   home to it across the floor; each that reaches it heals it. A PAGE BURNS where the hero's fire touches it (a fire
//   word's blow on the floor there, game.ts breakProps; or burning ground under it): it curls and is ash, and never goes
//   home; and a page alight sets those touching it alight. "Fire words shine here."
// EVERY HIT PEELS PAGES OFF: as it is struck (each blow, not what burns or poisons it), a page of it is torn off and falls
// to the floor about it on the side of the blow, no more than one in `pages.every` seconds and no more than `pages.most`
// lying (the oldest sinks into pulp). AND AS ITS LIFE RUNS DOWN IT IS MORE TORN: below two thirds of its life, and again
// below a third, it is shown as the art paints it more worn (art WEAR, its looks: art/act1_figs/palimpsest.ts; Monster.form
// 1 and 2), half its pages gone at the last, the old writing and the burning words showing all over; what it soaks back up
// is pulp written over, and does not mend how torn it looks.
// ITS LINE as the hero comes into its ground: it has no mouth (a page for a face, the Order's bar of ink across it): the
// rustle of its wet pages (game/defs.ts BOSS_LINES).
//
// Every number here that is a picture's is written down here; tests/act2_palimpsest.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE } from '../defs';
import { beside } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

// ---------------------------------------------------------------------------------------------
// ITS NUMBERS (the pictures' own where they are the pictures'; tiles before it and to its left)

export const PA = {
  /** Its looks by its life: shown more worn (Monster.form 1, then 2) once its life is below each of these shares of it, and never back; how worn each is painted (art WEAR.now). */
  wear: { below: [2 / 3, 1 / 3] as const, looks: [0, 0.5, 1] as const },
  /**
   * The slam: the blow at `hit` (PA_SLAM.hit, 27/30), the fists in the floor at `land` (PA_SLAM.land, 29/30), their middle
   * `at` (the art's slamAt); what is within `r` of it then (the splash's reach, SLAM_SPLASH_REACH) is struck and thrown
   * `knock`; the splash lies `splash` seconds (SLAM_SPLASH_FOR). Its ring of warning from `warnFrom` (PA_SLAM.up: the fists over its head).
   */
  slam: { hit: 27 / 30, land: 29 / 30, at: [1.546, -0.019] as const, r: 1.3, knock: 0.7, splash: 0.7, warnFrom: 0.42 },
  /**
   * Paper Cuts: its pages torn off at `tear` (PA_CUTS.hit), flung out by `out` into the whirl between `inner` and `outer`
   * tiles from its middle (PA_WHIRL), flying home from `home`, on it by `on`. What is within the whirl's reach is cut every
   * `tick` seconds while it goes round; its ring of warning from `warn[0]` to `tear`.
   */
  cuts: { warn: [0.22, 0.7] as const, tear: 0.75, out: 1.05, home: 2.2, on: 2.55, inner: 1.123, outer: 2.552, body: 0.9, tick: 0.3 },
  /**
   * Loose Leaves: the leaves torn off at `tear` (PA_LEAVES.hit), out of its picture at `launch` (PA_LEAVES.launch) as paper
   * birds, each where `birds` says (tiles before it and to its left, and how high in game pixels: the art's, measured);
   * they set off one every `apart` seconds, each at the hero (the first) or round him (`scatter` tiles), flying `speed`
   * tiles a second (BIRD_SPEED), never less than `mark` seconds (BIRD_MARK_FOR: its ring of warning closes over the last of
   * it); what is within `r` of where it strikes is struck.
   */
  leaves: {
    tear: 0.86, launch: 1.2, apart: 0.12, speed: 5, mark: 0.5, r: 0.55, scatter: [0.5, 1.3] as const,
    birds: [[0.579, -1.338, 61.1], [0.39, -0.917, 63.3], [0.311, -0.449, 65.7], [0.535, 0, 66.9], [0.449, 0.447, 65.7], [0.264, 0.917, 63.2], [0.41, 1.346, 63.9]] as ReadonlyArray<readonly [number, number, number]>,
  },
  /**
   * Rewrite: crouched by `down` (PA_REWRITE.down); from then its pages lying within `reach` tiles set off home to it one
   * every `apart` seconds, crawling `speed` tiles a second (PAGE_HOME_SPEED); each that reaches it heals it `heal` of its
   * life. Made only with `least` of them lying within reach, and its life below `below` of it. (How much: a hero who never
   * burns a page, at the pace the test bot kills the descent's bosses with their life tripled, about 300 s, a third of a
   * percent of its life a second, does about 6% to it between one Rewrite and the next (19 s); with 8 to 12 pages soaked
   * up it takes back 1.2 to 1.8% of it, a fifth to near a third of that: his fight about a quarter longer. One who burns
   * them, none of it.)
   */
  rewrite: { down: 0.5, apart: 0.05, speed: 2.2, reach: 4.2, heal: 0.0015, least: 3, below: 0.95 },
  /**
   * Its pages on the floor: one torn off it at a blow, no more than one in `every` seconds, lying from `land` seconds after
   * (the art's reel: "thrown down about it by 0.4"), `near` to `far` tiles from its middle on the side the blow came from
   * (within `spread` radians: out from under its figure and the hero's, where they are seen); no more than `most` lying. A
   * page burns `burn` seconds (PAGE_BURN_FOR) and is ash; burning `catchAfter` seconds, it sets alight those within `catch`
   * tiles. As it dies they sink into pulp over `fade` seconds. A page is about `size` tiles from its middle to its edge (art
   * drawFallenPage), where fire may touch it.
   */
  pages: { every: 0.35, land: 0.4, near: 1.2, far: 2.2, spread: 1.5, most: 12, burn: 0.8, catch: 0.45, catchAfter: 0.25, fade: 1.5, size: 0.25 },
};

/** Its lumber: 12 frames at 8 a second, painted for 0.8 tiles a second (PA_PACE); it stops at any frame of it, as the game's monsters on the bones always have. From behind it is painted as the camera truly sees it. */
export const PA_GAIT: GaitDef = { pace: 0.8, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.9, slack: 0.6, trueBack: true };

/** Its acts: its basic blow first, its biggest last (the biggest ready that the hero is in reach of is made). */
export const PA_ACTS: readonly ActDef[] = [
  { id: 'palimpsest:slam', clip: 'attack', long: 2.1, hit: PA.slam.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 2.6 },
  { id: 'palimpsest:cuts', clip: 'cuts', long: 2.8, hit: PA.cuts.tear, dmg: 0.3, cooldown: 9, first: 5, after: 0.6, near: 0, far: 2.4 },
  { id: 'palimpsest:leaves', clip: 'leaves', long: 2.2, hit: PA.leaves.tear, dmg: 0.45, cooldown: 11, first: 4, after: 0.5, near: 2.5, far: 9 },
  { id: 'palimpsest:rewrite', clip: 'rewrite', long: 3.0, hit: PA.rewrite.down, dmg: 0, cooldown: 16, first: 10, after: 0.6, near: 0, far: 99 },
];

// ---------------------------------------------------------------------------------------------
// ITS PAGES ON THE FLOOR, AND ITS BIRDS (perils 'palimpsest:page', 'palimpsest:bird')
//
// A page: `a` the way it is turned, `b` its seed (its writing); `done` 0 lying, 1 burning, 2 crawling home, 3 sinking into
// pulp; `c` when that began (its clock). Crawling: from `fx`, `fy` (where it set off) to where its Palimpsest crouches
// (`homeOf`), at the art's pace, setting off `d` seconds after it was called. A bird: from `a`, `b` (where it left its
// picture), `d` game pixels up, waiting its turn while its clock is below 0; `done` 1 as it dives (from its clock's `hit`)
// to strike at `fx`, `fy` at its clock's `c`, 2 struck, 3 gone with its Palimpsest.

/** A page's state. */
export const PAGE = { lying: 0, burning: 1, crawling: 2, sinking: 3 } as const;
const HOME = new WeakMap<Peril, { x: number; y: number }>();
/** Where a page crawling home goes: where its Palimpsest crouched as it called it. */
export function homeOf(p: Peril): { x: number; y: number } | null {
  return HOME.get(p) ?? null;
}
/** How long a page crawling from where it set off takes to reach home. */
export function crawlFor(p: Peril): number {
  const h = HOME.get(p);
  return h ? Math.hypot(h.x - p.fx, h.y - p.fy) / PA.rewrite.speed : 0;
}
const smooth = (v: number): number => {
  const c = v < 0 ? 0 : v > 1 ? 1 : v;
  return c * c * (3 - 2 * c);
};

/** Its pages on the floor (not yet fallen, lying, burning, crawling), of the Palimpsest named `from`. */
function pagesOf(R: BossRules, from: string): Peril[] {
  return R.g.perils.filter((p) => p.kind === 'act1' && p.a1 === 'palimpsest:page' && p.from === from && p.done !== PAGE.sinking);
}

/** A page of it comes to lie at (x, y), `delay` seconds from now (while it is in the air in its picture). */
function dropPage(R: BossRules, m: Monster, x: number, y: number, delay: number): void {
  const g = R.g;
  const P = PA.pages;
  // (no more than so many lie: the oldest lying sinks into pulp)
  const lying = pagesOf(R, m.name).filter((p) => p.done === PAGE.lying);
  if (lying.length >= P.most) {
    const old = lying.reduce((a, b) => (a.t > b.t ? a : b));
    old.done = PAGE.sinking;
    old.c = old.t;
    old.dur = old.t + P.fade;
  }
  R.peril(m, 'act1', x, y, { a1: 'palimpsest:page', t: -delay, hit: 0, dur: Infinity, a: g.rng.range(0, Math.PI * 2), b: g.rng.int(1, 9999), c: 0, d: 0, done: PAGE.lying, dmg: 0 });
}

/** Where a page torn off it by a blow from the hero's side comes down: on the floor, `near` to `far` from its middle, toward him. Null: nowhere to lie. */
function landingOf(R: BossRules, m: Monster): { x: number; y: number } | null {
  const g = R.g;
  const h = g.hero;
  const P = PA.pages;
  const toward = Math.atan2(h.y - m.y, h.x - m.x);
  for (let k = 0; k < 8; k++) {
    const a = toward + g.rng.range(-P.spread, P.spread);
    const d = g.rng.range(P.near, P.far);
    const x = m.x + Math.cos(a) * d;
    const y = m.y + Math.sin(a) * d;
    if (g.isOpen(x, y)) return { x, y };
  }
  return null;
}

/** A page catches fire where it lies (or as it crawls). */
function burn(p: Peril): void {
  if (p.done === PAGE.burning || p.done === PAGE.sinking || p.t < 0) return;
  p.done = PAGE.burning;
  p.c = p.t;
  p.dur = p.t + PA.pages.burn;
}

/** Where its pages crawl home to it, and when they set off: the Rewrite has begun crouching. */
function callPages(R: BossRules, m: Monster): void {
  const RW = PA.rewrite;
  const near = pagesOf(R, m.name)
    .filter((p) => p.done === PAGE.lying && p.t >= 0 && Math.hypot(p.x - m.x, p.y - m.y) <= RW.reach)
    .sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y));
  near.forEach((p, j) => {
    // (each sets off its while after the one before: until then it lies, and may still be burned where it lies)
    HOME.set(p, { x: m.x, y: m.y });
    p.fx = p.x;
    p.fy = p.y;
    p.d = j * RW.apart;
    p.done = PAGE.crawling;
    p.c = p.t;
  });
}

/** Its birds, out of its picture where they leave it: each waits its turn (its clock below 0), then sets off. */
function launchBirds(R: BossRules, m: Monster, a: ActDef): void {
  const g = R.g;
  const L = PA.leaves;
  const act = m.act!;
  L.birds.forEach(([fwd, left, high], i) => {
    const s = beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
    R.peril(m, 'act1', s.x, s.y, { a1: 'palimpsest:bird', t: -i * L.apart, hit: 0, dur: Infinity, a: s.x, b: s.y, c: i, d: high, done: 0, dmg: g.rollMonsterDmg(m) * a.dmg, fx: s.x, fy: s.y });
  });
}

/** A step of one of its pages, or of one of its birds. */
function stepPeril(R: BossRules, p: Peril, dt: number): void {
  const g = R.g;
  const h = g.hero;
  if (p.a1 === 'palimpsest:bird') {
    const L = PA.leaves;
    if (p.t < 0 || p.done === 3) return;
    if (!p.done) {
      // IT SETS OFF: at where the hero is now (the first of them), or round him; its ring of warning closes there as it comes
      // (`c` its place in the flock till it sets off)
      const first = p.c === 0;
      let tx = h.x;
      let ty = h.y;
      if (!first) {
        for (let k = 0; k < 6; k++) {
          const a = g.rng.range(0, Math.PI * 2);
          const d = g.rng.range(L.scatter[0], L.scatter[1]);
          if (g.isOpen(h.x + Math.cos(a) * d, h.y + Math.sin(a) * d)) {
            tx = h.x + Math.cos(a) * d;
            ty = h.y + Math.sin(a) * d;
            break;
          }
        }
      }
      p.done = 1;
      p.fx = tx;
      p.fy = ty;
      p.c = p.t + Math.max(L.mark, Math.hypot(tx - p.a, ty - p.b) / L.speed);
      p.hit = p.t;
    }
    if (p.done === 1) {
      // diving: where it is over the floor (its height is its pictures': render/act1_fx/palimpsest.ts)
      const k = Math.min(1, (p.t - p.hit) / Math.max(1e-6, p.c - p.hit));
      p.x = p.a + (p.fx - p.a) * k;
      p.y = p.b + (p.fy - p.b) * k;
      if (p.t >= p.c) {
        // IT STRIKES, and lies there after: a page of it on the floor
        p.done = 2;
        // (as the cult's skulls and shards: one rolling out from under it as it comes is not struck)
        if (Math.hypot(h.x - p.fx, h.y - p.fy) <= L.r + TUNE.heroRadius * 0.5 && h.invuln <= 0 && !h.move && !g.over) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.fx, p.fy, p.half);
        g.sfx('hit', 0.35);
        const m = g.monsters.find((o) => !o.dead && o.kind === 'palimpsest' && o.name === p.from);
        if (m && g.isOpen(p.fx, p.fy)) dropPage(R, m, p.fx, p.fy, 0);
        p.dur = p.t + 0.25;
      }
    }
    return;
  }
  if (p.a1 !== 'palimpsest:page' || p.t < 0) return;
  const P = PA.pages;
  if (p.done === PAGE.lying || p.done === PAGE.crawling) {
    // BURNING GROUND under it (the hero's: a fire word's, Kindling's, a melded fire's pool): it catches
    for (const z of g.zones) {
      if (z.hostile || z.element !== 'fire' || z.t < 0) continue;
      if (Math.hypot(z.x - p.x, z.y - p.y) <= z.r) {
        burn(p);
        return;
      }
    }
  }
  if (p.done === PAGE.burning) {
    // (alight a while, it sets alight what touches it)
    if (p.t - p.c >= P.catchAfter) for (const q of pagesOf(R, p.from)) if (q !== p && (q.done === PAGE.lying || q.done === PAGE.crawling) && q.t >= 0 && Math.hypot(q.x - p.x, q.y - p.y) <= P.catch) burn(q);
    return;
  }
  if (p.done === PAGE.crawling) {
    const home = HOME.get(p);
    const m = g.monsters.find((o) => !o.dead && o.kind === 'palimpsest' && o.name === p.from);
    if (!home || !m) {
      p.done = PAGE.sinking;
      p.c = p.t;
      p.dur = p.t + P.fade;
      return;
    }
    // (waiting its turn, it lies where it is)
    const since = p.t - p.c - p.d;
    if (since <= 0) return;
    const long = crawlFor(p);
    const k = smooth(since / Math.max(1e-6, long));
    p.x = p.fx + (home.x - p.fx) * k;
    p.y = p.fy + (home.y - p.fy) * k;
    if (since >= long) {
      // HOME: soaked back up into it, and it is healed by it
      m.life = Math.min(m.maxLife, m.life + m.maxLife * PA.rewrite.heal);
      if (!m.a1?.healed) g.emit({ t: 'text', x: m.x, y: m.y, text: 'heals', color: '#ff8a80' });
      if (m.a1) m.a1.healed = 1;
      p.dur = p.t;
    }
  }
  void dt;
}

// ---------------------------------------------------------------------------------------------
// WHAT IT KEEPS (Monster.a1): how long since a page was torn off it; its reel's clock as last seen (a blow resets it);
// whether it has said it heals this Rewrite

function keptOf(m: Monster): Record<string, number> {
  return (m.a1 ??= { lastPage: -99, struck: -1, healed: 0 });
}

/** Its look by its life: 0, 1, 2 (never back). */
export function wearOf(m: Monster): number {
  const f = m.life / m.maxLife;
  const W = PA.wear.below;
  const now = f < W[1] ? 2 : f < W[0] ? 1 : 0;
  return Math.max(m.form ?? 0, now);
}

/** How far out its whirl of pages reaches, `t` seconds into its Paper Cuts (0: not out). */
export function whirlReach(t: number): number {
  const C = PA.cuts;
  if (t < C.tear || t >= C.on) return 0;
  if (t < C.out) return C.body + (C.outer - C.body) * smooth((t - C.tear) / (C.out - C.tear));
  if (t < C.home) return C.outer;
  return C.outer - (C.outer - C.body) * smooth((t - C.home) / (C.on - C.home));
}

export const RULES: Act1Rules | null = {
  gait: PA_GAIT,
  acts: PA_ACTS,

  spawned(_R, m) {
    m.form = 0;
    keptOf(m);
  },

  tick(R, m) {
    const g = R.g;
    const k = keptOf(m);
    // MORE TORN AS ITS LIFE RUNS DOWN (its looks, never back)
    const w = wearOf(m);
    if (w !== (m.form ?? 0)) m.form = w;
    // EVERY HIT PEELS PAGES OFF: a blow resets its reel's clock (game.ts damageMonster), and a page is torn off and falls
    const st = m.struckT;
    if (st !== undefined && (k.struck < 0 || st < k.struck)) {
      if (g.time - k.lastPage >= PA.pages.every) {
        const at = landingOf(R, m);
        if (at) {
          dropPage(R, m, at.x, at.y, PA.pages.land);
          k.lastPage = g.time;
        }
      }
    }
    k.struck = st ?? -1;
    return false;
  },

  can(R, m, a) {
    if (a.id !== 'palimpsest:rewrite') return true;
    // (only with pages of its lying near enough to soak up, and something to heal)
    if (m.life >= m.maxLife * PA.rewrite.below) return false;
    const near = pagesOf(R, m.name).filter((p) => p.done === PAGE.lying && p.t >= 0 && Math.hypot(p.x - m.x, p.y - m.y) <= PA.rewrite.reach);
    return near.length >= PA.rewrite.least;
  },

  start(R, m, a) {
    const g = R.g;
    if (m.act) m.act.a = 0;
    // (it has no mouth to roar with: its pages rustle up off it, a gust of paper; its sounds are the sound chat's, later)
    if (a.id === 'palimpsest:leaves' || a.id === 'palimpsest:cuts') g.sfx('gust', 0.4);
    else if (a.id === 'palimpsest:rewrite') {
      keptOf(m).healed = 0;
      g.msg(`${m.name} soaks up its pages`, MSG.foe);
    }
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const here = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
    switch (a.id) {
      case 'palimpsest:slam': {
        const S = PA.slam;
        if (at(S.hit)) g.sfx('swing', 0.9);
        if (!at(S.land)) break;
        // (its fists come down into the floor: what is within the splash's reach is struck, and thrown back)
        const c = here(S.at[0], S.at[1]);
        if (Math.hypot(h.x - c.x, h.y - c.y) <= S.r + TUNE.heroRadius * 0.5) {
          R.blow(m, a.dmg);
          g.knockHero(c.x, c.y, S.knock);
        }
        R.peril(m, 'act1', c.x, c.y, { a1: 'palimpsest:splash', dur: S.splash });
        g.emit({ t: 'shake', amount: 5 });
        g.sfx('slam', 1);
        break;
      }
      case 'palimpsest:cuts': {
        const C = PA.cuts;
        if (at(C.tear)) g.sfx('swing', 1);
        const reach = whirlReach(t1);
        if (reach <= 0) break;
        // (round and round: what is in the whirl is cut, no more than once in `tick`)
        if (act.a > 0 && t1 - act.a < C.tick) break;
        if (Math.hypot(h.x - m.x, h.y - m.y) > reach + TUNE.heroRadius * 0.5) break;
        act.a = t1;
        R.blow(m, a.dmg);
        g.sfx('hit', 0.4);
        break;
      }
      case 'palimpsest:leaves': {
        const L = PA.leaves;
        if (at(L.tear)) g.sfx('swing', 0.8);
        if (at(L.launch)) launchBirds(R, m, a);
        break;
      }
      case 'palimpsest:rewrite': {
        if (at(PA.rewrite.down)) callPages(R, m);
        break;
      }
      default:
        break;
    }
  },

  peril(R, p, dt) {
    stepPeril(R, p, dt);
  },

  floorBlow(_R, p, x, y, rad, el) {
    // A PAGE BURNS WHERE THE HERO'S FIRE TOUCHES IT ("Fire words shine here")
    if (el !== 'fire' || p.a1 !== 'palimpsest:page' || p.t < 0) return;
    if (Math.hypot(p.x - x, p.y - y) <= rad + PA.pages.size) burn(p);
  },

  died(R, m) {
    // (its pages sink into pulp where they are; what of it was on the wing falls)
    for (const p of R.g.perils) {
      if (p.kind !== 'act1' || p.from !== m.name) continue;
      if (p.a1 === 'palimpsest:page' && p.done !== PAGE.burning && p.done !== PAGE.sinking) {
        p.done = PAGE.sinking;
        p.c = Math.max(0, p.t);
        p.t = Math.max(0, p.t);
        p.dur = p.t + PA.pages.fade;
      } else if (p.a1 === 'palimpsest:bird') {
        p.done = 3;
        p.t = Math.max(0, p.t);
        p.dur = p.t;
      }
    }
  },
};
