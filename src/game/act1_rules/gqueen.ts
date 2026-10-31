// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: THE QUEEN: her rules (game/act1_rules/types.ts). Built by the main chat from the art
// chat's (art/queen.ts, queen_moves.ts, queen_fx.ts; his pick there, how she moves, “Cold and slow, then sudden (Recommended)”,
// and his yes, “Yes, that's the Queen (Recommended)”; docs/mockups/queen/README.md, every number). His doc, level 18: "The Queen.
// Her floor is the Mirror Hall. ... Her mirror hangs at the end of the hall and talks to her the whole fight." Her brief: her
// moves a stab of the poisoned comb, Looking Glass, Reflections and Shatter; each phase another mirror wakes; her death, her mirror
// cracking across and for the first time telling the truth. A boss: four blows (his rulebook), her fight long by what she throws.
//
// WHAT SHE DOES (the main chat's, where the art leaves it to the game):
// - SHE GLIDES at QN_PACE, 2 tiles a second, slower than he walks: cold and slow; what she does with glass is sudden.
// - THE COMB (her basic, QN_COMB, 1.5 s): held (0.36 to 0.7 s), the stab in two frames at 0.8 s, its teeth 2.54 tiles out from
//   where she stood; whoever is before her there is struck, and her poison is left where it struck, three tiles across, two
//   seconds (TUNE.cloud): who stands in it is hurt a little each half second. As it ends she has come on 1.6 tiles (the art's).
// - LOOKING GLASS (QN_IN then QN_OUT): into a glass beside her; out of one behind him (TUNE.glass.behind tiles, the way he does
//   not face), facing him, her comb up, and the stab as she comes out (whoever is before her).
// - REFLECTIONS (QN_REFLECT, 1.8 s): at her sweep, copies of him step out of the hall's awake pier glasses (one in her first
//   phase, two in her second, three in her third: HER MIRRORS WAKE, one each phase), as the floor's reflections do
//   (game/act1_rules/reflection.ts), no more than TUNE.reflect.most of them at once.
// - SHATTER (QN_SHATTER, 2.5 s): her arms flung up (the warning, 0.5 to 1.37 s: every pier glass trembles and the lane of floor
//   before it lights), at her blow they all burst at once and their glass flies straight across the hall in its lane: whoever is
//   in a lane is struck (1.6 times her blow); the gaps between the lanes are safe.
// - HER PHASES at two thirds and a third of her life: another glass awake, her waits shorter (TUNE.cd).
// - HER MIRROR at the hall's end speaks to her through the fight, only what she wants to hear (the Grimms' "Snow White", in Margaret
//   Hunt's translation of 1884, out of copyright); as she dies it cracks across and, for the first time, tells the truth (his doc).
// What she leaves and sends, and her hall's glasses, drawn: render/act1_fx/gqueen.ts.

import { TILE3 } from '../../art/new_mobs3';
import { HALL_AT, HALL_GLASS, HALL_MIRRORS } from '../../art/queen_fx';
import { QN_COMB, QN_GLIDE, QN_IN, QN_OUT, QN_PACE, QN_REFLECT, QN_SHATTER } from '../../art/queen_moves';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster, Peril } from '../state';
import { stepOutAt } from './reflection';
import type { Act1Rules } from './types';

/** Her numbers (tiles; seconds). */
export const QUEEN_TUNE = {
  /** The comb: struck within `reach` of where she stood, `half` radians either side of her forward; its poison left `at` tiles out. */
  comb: { reach: 2.9, half: 0.6, at: 2.54, lunge: QN_COMB.lunge / TILE3 },
  /** Her poison: `r` across its middle, how long it lies, how often it bites, how hard (of her blow). */
  cloud: { r: 1.5, long: 2.2, every: 0.5, bite: 0.22 },
  /** Looking Glass: out of a glass this far behind him; her stab as she comes out, within `reach`, `half` either side. */
  glass: { behind: 3.4, reach: 1.9, half: 0.8 },
  /** Reflections: at most this many of his copies about her at once. */
  reflect: { most: 4 },
  /** Shatter: each lane as wide as its glass (HALL_GLASS, her lengths), and a little for his body; when its glass has crossed. */
  shatter: { half: HALL_GLASS.half / TILE3 + 0.15, cross: 0.25 },
  /** Her waits (cooldowns) in each phase, as a share of her first. */
  cd: [1, 0.8, 0.65] as const,
  /** Her mirror's words: how often it speaks (seconds), how long a line stays, how high over its foot it is said; said toward it from him no further than `near` tiles off. */
  talk: { every: 13, first: 4, secs: 3.2, lift: 74, near: 5 },
};

/**
 * HER MIRROR'S WORDS, only what she wants to hear: the Grimms' looking-glass, in Margaret Hunt's translation (1884; out of
 * copyright), and the main chat's in its voice. AS SHE DIES, the truth (his doc: "the king is dying, and something sits on his chest").
 */
export const MIRROR_SAYS = ['Thou, O Queen, art the fairest of all!', 'None in this land is fairer than thou.', 'Fairest of all. Fairest of all.', 'Thou art the fairest. Strike him down.'];
export const MIRROR_TRUTH = 'The king is dying. Something sits on his chest.';

/** Which of the hall's pier glasses wake, in order: the far side's (their glass toward the eye), one each phase (art/queen_fx.ts HALL_MIRRORS). */
export const AWAKE_ORDER = [4, 8, 0] as const;

/** Her phase: 0 above two thirds of her life, 1 above a third, 2 below. */
export function phaseOf(m: Monster): 0 | 1 | 2 {
  const f = m.life / Math.max(1, m.maxLife);
  return f > 2 / 3 ? 0 : f > 1 / 3 ? 1 : 2;
}

/** The hall's own frame (world): its middle, `u` along it, `v` across it as the art's y (away from the eye). */
export interface HallFrame {
  x: number;
  y: number;
  u: { x: number; y: number };
  v: { x: number; y: number };
  alongX: boolean;
}
/** The hall as the art lays it, from the floor's plan (game/act2/glassgallery.ts GalleryPlan.hall), or null off her floor. */
export function hallFrame(g: BossRules['g']): HallFrame | null {
  const H = g.level.land?.gallery?.hall;
  if (!H) return null;
  return H.alongX ? { x: H.x, y: H.y, u: { x: 1, y: 0 }, v: { x: 0, y: -1 }, alongX: true } : { x: H.x, y: H.y, u: { x: 0, y: 1 }, v: { x: -1, y: 0 }, alongX: false };
}
/** A point of the art's hall (her lengths: along, across) on the floor (world). */
export function hallAt(F: HallFrame, a: number, b: number): { x: number; y: number } {
  return { x: F.x + (F.u.x * a + F.v.x * b) / TILE3, y: F.y + (F.u.y * a + F.v.y * b) / TILE3 };
}
/** Pier glass `i` of the hall: its foot (world), the way its glass faces (into the hall). */
export function pierGlass(F: HallFrame, i: number): { x: number; y: number; fx: number; fy: number } {
  const m = HALL_MIRRORS[i];
  const p = hallAt(F, m.x, m.y);
  return { ...p, fx: -F.v.x * m.side, fy: -F.v.y * m.side };
}
/** Is (x, y) in one of Shatter's lanes (across the hall before each pier glass)? */
export function inLane(F: HallFrame, x: number, y: number): boolean {
  const along = (x - F.x) * F.u.x + (y - F.y) * F.u.y;
  return HALL_AT.some((a) => Math.abs(along - a) <= QUEEN_TUNE.shatter.half);
}

const GAIT: GaitDef = { pace: QN_PACE, cycle: QN_GLIDE.frames / QN_GLIDE.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.2, slack: 0.5, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'gqueen:comb', clip: 'attack', long: QN_COMB.long, hit: QN_COMB.hit, dmg: 1, cooldown: 0, first: 0, after: 0.4, near: 0, far: QUEEN_TUNE.comb.reach - 0.2 },
  { id: 'gqueen:glass', clip: 'glassIn', long: QN_IN.long, hit: QN_IN.hit, dmg: 1.3, cooldown: 8, first: 5, after: 0, near: 0, far: 14 },
  { id: 'gqueen:reflect', clip: 'reflect', long: QN_REFLECT.long, hit: QN_REFLECT.hit, dmg: 0, cooldown: 12, first: 7, after: 0.4, near: 0, far: 30 },
  { id: 'gqueen:shatter', clip: 'shatter', long: QN_SHATTER.long, hit: QN_SHATTER.hit, dmg: 1.6, cooldown: 15, first: 11, after: 0.6, near: 0, far: 30 },
  { id: 'gqueen:out', clip: 'glassOut', long: QN_OUT.long, hit: QN_OUT.hit, dmg: 1.3, cooldown: 0, first: 0, after: 0.4, near: 0, far: 999, forced: true },
];

type Keep = Record<string, number>;
const keep = (m: Monster): Keep => (m.a1 ??= {}) as Keep;
/** Her hall's peril (its glasses and her mirror, drawn by render/act1_fx/gqueen.ts): `a` awake, `b` Shatter's start (game time; -1 none), `c` her mirror's mode (0 still, 1 speaking, 2 truth), `d` since when. */
export function hallPeril(g: BossRules['g']): Peril | null {
  return g.perils.find((p) => p.a1 === 'gqueen:hall') ?? null;
}

/** Is (x, y) open floor for her (in the level, walkable)? */
function open(R: BossRules, x: number, y: number): boolean {
  const L = R.g.level;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return tx >= 0 && ty >= 0 && tx < L.floor.w && ty < L.floor.h && L.walk[ty * L.floor.w + tx] === 1;
}

/**
 * Where her mirror's words are said: over her mirror, or, where it is further off him than the screen holds, toward it from him, so
 * that he reads them (her mirror speaks on, its face moving, at the hall's end).
 */
function sayAt(R: BossRules): { x: number; y: number; lift: number } | null {
  const H = R.g.level.land?.gallery?.hall;
  if (!H) return null;
  const h = R.g.hero;
  const dx = H.mirror.x - h.x;
  const dy = H.mirror.y - h.y;
  const d = Math.hypot(dx, dy);
  const far = QUEEN_TUNE.talk.near;
  return d <= far ? { x: H.mirror.x, y: H.mirror.y, lift: QUEEN_TUNE.talk.lift } : { x: h.x + (dx / d) * far, y: h.y + (dy / d) * far, lift: 40 };
}
/** Her mirror says a line. */
function say(R: BossRules, text: string, secs = QUEEN_TUNE.talk.secs): void {
  const P = hallPeril(R.g);
  if (P && P.c !== 2) {
    P.c = 1;
    P.d = R.g.time;
  }
  const at = sayAt(R);
  if (at) R.g.emit({ t: 'bossSay', text, x: at.x, y: at.y, secs, lift: at.lift });
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(R, m) {
    // (her hall: its pier glasses and her mirror, there before the fight and after it)
    const H = R.g.level.land?.gallery?.hall;
    if (!H || hallPeril(R.g)) return;
    const p = R.peril(m, 'act1', H.x, H.y, { a1: 'gqueen:hall', dur: 1e9, dmg: 0 });
    p.a = 0;
    p.b = -1;
    p.c = 0;
    p.d = 0;
  },
  tick(R, m, dt) {
    const k = keep(m);
    const ph = phaseOf(m);
    // (her waits shorter each phase)
    if (ph > 0 && m.moveCd) for (let i = 1; i < m.moveCd.length; i++) m.moveCd[i] -= dt * (1 / QUEEN_TUNE.cd[ph] - 1);
    // (another glass wakes each phase; her mirror speaks as it does, and now and then between)
    const P = hallPeril(R.g);
    if (P) {
      if (P.a !== ph + 1) {
        P.a = ph + 1;
        if (ph > 0) say(R, MIRROR_SAYS[ph % MIRROR_SAYS.length]);
      }
      k.talk = (k.talk ?? QUEEN_TUNE.talk.first) - dt;
      if (k.talk <= 0) {
        k.talk = QUEEN_TUNE.talk.every;
        k.said = ((k.said ?? -1) + 1) % MIRROR_SAYS.length;
        say(R, MIRROR_SAYS[k.said]);
      }
      if (P.c === 1 && R.g.time - P.d > QUEEN_TUNE.talk.secs + 0.6) P.c = 0;
    }
    return false;
  },
  forced(_R, m, acts) {
    return keep(m).out === 1 ? acts.findIndex((a) => a.id === 'gqueen:out') : -1;
  },
  start(R, m, a) {
    const k = keep(m);
    k.struck = 0;
    if (a.id === 'gqueen:out') k.out = 2;
    if (a.id === 'gqueen:shatter') {
      const P = hallPeril(R.g);
      if (P) P.b = R.g.time;
    }
  },
  end(R, m, a) {
    const k = keep(m);
    if (a.id === 'gqueen:comb') {
      // (the stab carries her on: put her where the art's move ends, so far as the floor lets her)
      const L = QUEEN_TUNE.comb.lunge;
      const n = Math.ceil(L / 0.1);
      for (let i = 0; i < n; i++) {
        const x = m.x + (m.fx * L) / n;
        const y = m.y + (m.fy * L) / n;
        if (!open(R, x, y)) break;
        m.x = x;
        m.y = y;
      }
    }
    if (a.id === 'gqueen:glass') {
      // (out of a glass behind him, the way he does not face, facing him; else beside him; in her hall, on open floor)
      const h = R.g.hero;
      const B = QUEEN_TUNE.glass.behind;
      const hf = Math.hypot(h.fx, h.fy) || 1;
      const tries: [number, number][] = [[-h.fx / hf, -h.fy / hf], [-h.fy / hf, h.fx / hf], [h.fy / hf, -h.fx / hf], [(m.x - h.x) / (Math.hypot(m.x - h.x, m.y - h.y) || 1), (m.y - h.y) / (Math.hypot(m.x - h.x, m.y - h.y) || 1)]];
      for (const [wx, wy] of tries) {
        const x = h.x + wx * B;
        const y = h.y + wy * B;
        if (!open(R, x, y)) continue;
        m.x = x;
        m.y = y;
        const d = Math.hypot(h.x - x, h.y - y) || 1;
        m.fx = (h.x - x) / d;
        m.fy = (h.y - y) / d;
        break;
      }
      k.out = 1;
    }
    if (a.id === 'gqueen:out') k.out = 0;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const k = keep(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const r = R.rel(m);
    const d = Math.hypot(r.fwd, r.left);
    if (a.id === 'gqueen:comb') {
      if (at(QN_COMB.strike[0])) g.sfx('swing', 0.6);
      if (at(a.hit)) {
        g.sfx('shatter', 0.35);
        const C = QUEEN_TUNE.comb;
        if (d <= C.reach && Math.abs(Math.atan2(r.left, r.fwd)) <= C.half) R.blow(m, a.dmg);
        // (her poison where its teeth struck)
        const p = R.peril(m, 'act1', m.x + m.fx * C.at, m.y + m.fy * C.at, { a1: 'gqueen:cloud', dur: QUEEN_TUNE.cloud.long, dmg: g.rollMonsterDmg(m) * QUEEN_TUNE.cloud.bite });
        p.a = 0;
      }
      return;
    }
    if (a.id === 'gqueen:glass') {
      if (at(QN_IN.hit)) g.sfx('shatter', 0.4);
      return;
    }
    if (a.id === 'gqueen:out') {
      if (at(QN_OUT.strike[0])) g.sfx('shatter', 0.5);
      if (at(a.hit) && !k.struck) {
        k.struck = 1;
        const G = QUEEN_TUNE.glass;
        if (d <= G.reach && Math.abs(Math.atan2(r.left, r.fwd)) <= G.half) R.blow(m, a.dmg);
      }
      return;
    }
    if (a.id === 'gqueen:reflect') {
      if (!at(a.hit)) return;
      g.sfx('shatter', 0.5);
      const F = hallFrame(g);
      if (!F) return;
      const live = g.monsters.filter((q) => !q.dead && q.kind === 'reflection').length;
      const n = Math.min(phaseOf(m) + 1, QUEEN_TUNE.reflect.most - live);
      for (let i = 0; i < n; i++) {
        const glass = pierGlass(F, AWAKE_ORDER[i]);
        const c = g.spawn('reflection', glass.x + glass.fx * 0.85, glass.y + glass.fy * 0.85, m.packId, 0, false, g.rng);
        stepOutAt(c, glass.x, glass.y, glass.fx, glass.fy);
        c.state = 'chase';
        c.xp = 0;
      }
      return;
    }
    if (a.id === 'gqueen:shatter') {
      if (at(QN_SHATTER.warn[0])) g.sfx('trapSet', 0.6);
      if (at(a.hit)) g.sfx('shatter', 1);
      // (its glass across the hall in its lane: whoever is in one as it crosses)
      if (at(a.hit + QUEEN_TUNE.shatter.cross)) {
        const F = hallFrame(g);
        if (F && inLane(F, g.hero.x, g.hero.y)) R.blow(m, a.dmg);
      }
    }
  },
  peril(R, p) {
    if (p.a1 !== 'gqueen:cloud') return;
    // (her poison: who stands in it, a little each half second)
    const h = R.g.hero;
    const C = QUEEN_TUNE.cloud;
    if (p.t >= p.a && Math.hypot(h.x - p.x, h.y - p.y) <= C.r) {
      p.a = p.t + C.every;
      R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
    }
  },
  died(R) {
    // (her poison gone; her mirror cracks across and tells the truth)
    for (const p of R.g.perils) if (p.a1 === 'gqueen:cloud') p.done = 1;
    R.g.perils = R.g.perils.filter((p) => p.a1 !== 'gqueen:cloud');
    const P = hallPeril(R.g);
    if (P) {
      P.c = 2;
      P.d = R.g.time;
      P.a = 0;
    }
    const at = sayAt(R);
    if (at) R.g.emit({ t: 'bossSay', text: MIRROR_TRUTH, x: at.x, y: at.y, secs: 5, lift: at.lift });
  },
};
