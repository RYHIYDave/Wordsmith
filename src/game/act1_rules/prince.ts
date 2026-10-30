// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17, THE MASQUE: THE PRINCE, its boss, in the Black Room: his rules (game/act1_rules/
// types.ts). Built by the main chat from the art chat's (art/prince.ts, prince_moves.ts, prince_fx.ts; his picks there, his brief
// “Yes, this brief (Recommended)” and his pictures “Yes, that's the Prince (Recommended)”, his everyday step as fast as the knight's
// run and his darts twice that, “Keep it as it is”; docs/mockups/prince/README.md).
//
// His doc, level 17: "The Prince. His floor is the Black Room. A tall young man in a long velvet coat and a smiling gilt mask, with
// a rapier, dancing the whole fight." The brief he picked: "fast and never still. He dances the whole fight, darting, spinning,
// lunging across the room. ... Moves: a rapier thrust (basic); the Dance, a ring of masked partners closing round you as he
// waltzes past; Masks, smiling masks flung spinning across the room; Midnight, the great clock striking twelve, each chime a ring
// rolling out to dodge. Each phase the clock strikes faster. Death: his mask cracks; under it, only the Hush's grey fog, which
// drains away ... Sound: the clock, the music, his boots; no voice." His rule for every boss (gameplay rulebook, "Fights"): each
// phase harder than the last; the fight long by what he throws, not by more life.
//
// WHAT HE DOES (the main chat's, where the art leaves it to the game; first numbers, his to try and change):
// - NEVER STILL: between his blows he DARTS (the art's dart, 0.8 s: carried DART.carry, 4 tiles, while in the air, 0.17 to 0.6 s)
//   round the hero, across him and about him, keeping from PRINCE_TUNE.dart.keep[0] to [1] tiles off; every
//   PRINCE_TUNE.dart.every seconds he is not making a blow. His walk is the art's dance-step at PC_PACE, 4.5 tiles a second.
// - THE THRUST (his basic blow; PC_THRUST, 2.0 s): coiled and held (0.45 to 0.77 s), the lunge in two frames landing at 0.87 s:
//   the hero within the lunge's line (4.6 tiles before him, PRINCE_TUNE.thrust.half either side) is struck. The lunge is in his
//   own picture (he springs back to where he stood).
// - MASKS (every 6 s; PC_MASKS, 1.85 s): five smiling masks flung at 0.87 s in a fan 72 degrees wide, 15 tiles a second, 12 tiles
//   (the art's flungMask), each striking the hero where it passes him, once, 0.8 times his blow; each bursts at its flight's end.
// - THE DANCE (every 10 s; PC_DANCE, 1.5 s): his bow and the rapier whipped up at 0.87 s: eight masked partners rise round where
//   the hero stands then (the art's ring, 9 tiles across), waltz round him closing in, hold a beat at 5 across, and snap shut
//   at 1.73 s after (DANCE_FX.hit): the hero still within 2.5 tiles of the ring's middle is caught, 1.4 times his blow. Then he
//   waltzes away round the room (the art's waltz, 1.6 s, carried round at WALTZ.pace, 4 tiles a second).
// - MIDNIGHT (every 20 s, from 6 s in; PC_MIDNIGHT, 2.6 s): the rapier thrust at the ceiling at 0.97 s, and the great ebony clock
//   strikes twelve: a ring rolling out from the clock's place on the floor at each chime, out to 20 tiles, 0.75 deep (CHIME),
//   each with a gap 2.4 tiles across to slip through (wandering round from chime to chime); a ring rolling over the hero
//   outside its gap strikes him, 0.7 times his blow. Faster each phase (his brief): a chime every 1.0, 0.75, 0.5 s, rolling at
//   5, 6.5, 8 tiles a second. The clock's own picture rings as it strikes (game/act2/masque_rules.ts clockOf).
// - HIS PHASES at two thirds and a third of his life: his waits shorter each phase (PRINCE_TUNE.cd), his darts quicker.
// - HIS DEATH: the art's (the mask cracks; only the Hush's fog under it, draining away; his clothes fall empty). What of his was
//   still to come does not come; the chimes still rolling stop.

import { TILE3 } from '../../art/new_mobs3';
import { CHIME, DANCE_FX, MASKS_FX, MASK_FLIGHT, flungMask } from '../../art/prince_fx';
import { DART, PC_DANCE, PC_MASKS, PC_MIDNIGHT, PC_PACE, PC_THRUST, PC_WALK, WALTZ } from '../../art/prince_moves';
import { clockOf } from '../act2/masque_rules';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** The Prince's numbers (tiles; seconds), his to try and change. */
export const PRINCE_TUNE = {
  thrust: { reach: 4.6, half: 0.75 },
  masks: { hit: 0.6, dmg: 0.8 },
  dance: { caught: DANCE_FX.r1 / TILE3, dmg: 1.4 },
  chime: { dmg: 0.7, hit: 0.35 },
  dart: { every: [1.3, 1.0, 0.75] as const, keep: [2.6, 6.5] as const },
  /** His waits, times their own, in each phase. */
  cd: [1, 0.8, 0.65] as const,
};

/** His phase: 0, 1 or 2, by his life (two thirds, a third). */
export function phaseOf(m: Monster): 0 | 1 | 2 {
  const k = m.life / m.maxLife;
  return k > 2 / 3 ? 0 : k > 1 / 3 ? 1 : 2;
}

const GAIT: GaitDef = { pace: PC_PACE, cycle: PC_WALK.frames / PC_WALK.fps / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 3.2, slack: 0.6, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'prince:thrust', clip: 'attack', long: PC_THRUST.long, hit: PC_THRUST.hit, dmg: 1, cooldown: 0, first: 0, after: 0.3, near: 0, far: PRINCE_TUNE.thrust.reach - 0.3 },
  { id: 'prince:masks', clip: 'masks', long: PC_MASKS.long, hit: PC_MASKS.hit, dmg: PRINCE_TUNE.masks.dmg, cooldown: 6, first: 2, after: 0.3, near: 2.5, far: MASKS_FX.reach - 1 },
  { id: 'prince:dance', clip: 'dance', long: PC_DANCE.long, hit: PC_DANCE.hit, dmg: PRINCE_TUNE.dance.dmg, cooldown: 10, first: 4, after: 0, near: 0, far: 9 },
  { id: 'prince:midnight', clip: 'midnight', long: PC_MIDNIGHT.long, hit: PC_MIDNIGHT.hit, dmg: PRINCE_TUNE.chime.dmg, cooldown: 20, first: 6, after: 0.3, near: 0, far: 30 },
  { id: 'prince:dart', clip: 'dart', long: DART.long, hit: DART.air[1], dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
  { id: 'prince:waltz', clip: 'waltz', long: WALTZ.long, hit: WALTZ.long, dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 999, forced: true },
];

/** What he keeps (Monster.a1): when he may next dart, a waltz wanted, the way he darts or waltzes, how far he has been carried. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { dartCd: 1, waltz: 0, wx: 0, wy: 0, carried: 0, cx: 0, cy: 0 });
}

/** Whether he may stand at (x, y). */
function open(R: BossRules, x: number, y: number): boolean {
  const L = R.g.level;
  return L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] === 1;
}

/** Carry him by (dx, dy) in small steps, so far as the floor lets him. */
function carry(R: BossRules, m: Monster, dx: number, dy: number): void {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 0.1));
  for (let i = 0; i < n; i++) {
    const x = m.x + dx / n;
    const y = m.y + dy / n;
    if (!open(R, x, y)) return;
    m.x = x;
    m.y = y;
  }
}

/** A way to dart: across the hero and round him, keeping his distance; one whose four tiles are all floor. Null: none. */
function dartWay(R: BossRules, m: Monster): { x: number; y: number } | null {
  const h = R.g.hero;
  const dx = h.x - m.x;
  const dy = h.y - m.y;
  const d = Math.hypot(dx, dy) || 1;
  const [lo, hi] = PRINCE_TUNE.dart.keep;
  const ways: { x: number; y: number }[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const wx = Math.cos(a);
    const wy = Math.sin(a);
    // (across him, not straight at or away: never more than 0.75 of it toward or from him)
    if (Math.abs((wx * dx + wy * dy) / d) > 0.75) continue;
    const ex = m.x + wx * DART.carry;
    const ey = m.y + wy * DART.carry;
    const de = Math.hypot(h.x - ex, h.y - ey);
    if (de < lo || de > hi) continue;
    let ok = true;
    for (let s = 1; s <= 8 && ok; s++) ok = open(R, m.x + (wx * DART.carry * s) / 8, m.y + (wy * DART.carry * s) / 8);
    if (ok) ways.push({ x: wx, y: wy });
  }
  return ways.length ? ways[R.g.rng.int(0, ways.length - 1)] : null;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  tick(_R, m, dt) {
    const k = keep(m);
    k.dartCd -= dt;
    // (his waits shorter each phase: the time to his next blows runs the faster)
    const ph = phaseOf(m);
    if (ph > 0 && m.moveCd) for (let i = 1; i < m.moveCd.length; i++) m.moveCd[i] -= dt * (1 / PRINCE_TUNE.cd[ph] - 1);
    return false;
  },
  forced(R, m, acts) {
    const k = keep(m);
    if (k.waltz) return acts.findIndex((a) => a.id === 'prince:waltz');
    if (k.dartCd > 0) return -1;
    const h = R.g.hero;
    if (Math.hypot(h.x - m.x, h.y - m.y) > 10) return -1;
    const w = dartWay(R, m);
    if (!w) {
      k.dartCd = 0.3;
      return -1;
    }
    k.wx = w.x;
    k.wy = w.y;
    return acts.findIndex((a) => a.id === 'prince:dart');
  },
  start(R, m, a) {
    const k = keep(m);
    k.carried = 0;
    if (a.id === 'prince:dart') k.dartCd = PRINCE_TUNE.dart.every[phaseOf(m)] * R.g.rng.range(0.85, 1.25);
    if (a.id === 'prince:waltz') {
      k.waltz = 0;
      // (away round the room: round the ring's middle, the way he faces turned a quarter)
      const s = R.g.rng.chance(0.5) ? 1 : -1;
      k.wx = -m.fy * s;
      k.wy = m.fx * s;
      k.cx = s;
    }
  },
  end(_R, m, a) {
    if (a.id === 'prince:dance') keep(m).waltz = 1;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const k = keep(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'prince:dart') {
      // (carried while in the air: DART.carry tiles from 0.17 to 0.6 s)
      const [a0, a1] = DART.air;
      const u = (t: number): number => Math.max(0, Math.min(1, (t - a0) / (a1 - a0)));
      const d = DART.carry * (u(t1) - u(t0));
      if (d > 0) carry(R, m, k.wx * d, k.wy * d);
      if (at(a0)) g.sfx('dodge', 0.35);
      return;
    }
    if (a.id === 'prince:waltz') {
      // (round an arc at WALTZ.pace, the way turning as he goes: two whole turns of him, a quarter of a circle of the room)
      const turn = k.cx * (Math.PI / 2) * ((t1 - t0) / WALTZ.long);
      const c = Math.cos(turn);
      const s = Math.sin(turn);
      const wx = k.wx * c - k.wy * s;
      const wy = k.wx * s + k.wy * c;
      k.wx = wx;
      k.wy = wy;
      carry(R, m, wx * WALTZ.pace * (t1 - t0), wy * WALTZ.pace * (t1 - t0));
      return;
    }
    if (a.id === 'prince:thrust') {
      if (at(PC_THRUST.hit - 0.05)) g.sfx('swing', 0.5);
      if (at(a.hit)) {
        const r = R.rel(m);
        if (r.fwd >= -0.3 && r.fwd <= PRINCE_TUNE.thrust.reach && Math.abs(r.left) <= PRINCE_TUNE.thrust.half) R.blow(m, a.dmg);
      }
      return;
    }
    if (a.id === 'prince:masks' && at(a.hit)) {
      g.sfx('whirl', 0.5);
      const dmg = g.rollMonsterDmg(m) * a.dmg;
      for (let i = 0; i < MASKS_FX.n; i++) R.peril(m, 'act1', m.x, m.y, { a1: 'prince:mask', a: i, dur: MASK_FLIGHT + MASKS_FX.burst, hit: 0, dmg });
      return;
    }
    if (a.id === 'prince:dance' && at(a.hit)) {
      const h = g.hero;
      R.peril(m, 'act1', h.x, h.y, { a1: 'prince:dance', dur: DANCE_FX.long, hit: DANCE_FX.hit, dmg: g.rollMonsterDmg(m) * a.dmg });
      return;
    }
    if (a.id === 'prince:midnight' && at(a.hit)) {
      // (the great ebony clock strikes twelve: a ring from its place at each chime, faster each phase, each with its gap)
      const L = g.level;
      const cp = L.land?.masque?.clock ?? { x: m.x, y: m.y };
      const ph = phaseOf(m);
      const dmg = g.rollMonsterDmg(m) * a.dmg;
      const gap0 = g.rng.range(0, Math.PI * 2);
      for (let i = 0; i < CHIME.rings; i++) {
        const delay = i * CHIME.every[ph];
        R.peril(m, 'act1', cp.x, cp.y, { a1: 'prince:chime', a: i, b: ph, c: gap0 + i * g.rng.range(0.5, 1.1) * (i % 2 ? 1 : -1), d: delay, t: 0, dur: delay + CHIME.reach / CHIME.speed[ph] + 0.2, dmg, hit: delay });
      }
      const clock = clockOf(L);
      if (clock) clock.state = 1;
      g.sfx('echo', 1);
    }
  },
  peril(R, p) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 === 'prince:mask') {
      if (p.done || p.t > MASK_FLIGHT) return;
      const w = maskWhere(p, p.t);
      if (Math.hypot(h.x - w.x, h.y - w.y) <= PRINCE_TUNE.masks.hit) {
        p.done = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, w.x, w.y, p.half);
      }
      return;
    }
    if (p.a1 === 'prince:dance') {
      if (p.done || p.t < DANCE_FX.hit) return;
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= PRINCE_TUNE.dance.caught) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      return;
    }
    if (p.a1 === 'prince:chime') {
      const t = p.t - p.d;
      if (t < 0) return;
      // (each chime the clock's bell sounds as its ring sets off)
      if (t - 1 / 60 < 0 && p.a > 0) g.sfx('echo', 0.6);
      if (p.done) return;
      const r = CHIME.speed[p.b as 0 | 1 | 2] * t;
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (Math.abs(d - r) > CHIME.band / 2 + PRINCE_TUNE.chime.hit) return;
      if (chimeGap(p, h.x, h.y, r)) return;
      p.done = 1;
      g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
    }
  },
  died(R, m) {
    // (what of his was still to come does not come; the chimes still rolling stop)
    for (const p of R.g.perils) {
      if (p.kind !== 'act1' || !p.a1 || !p.a1.startsWith('prince:') || p.from !== m.name) continue;
      p.done = 1;
      if (p.a1 === 'prince:chime') p.dur = Math.min(p.dur, p.t + 0.3);
    }
    const clock = clockOf(R.g.level);
    if (clock) clock.state = 0;
  },
};

/** Where mask `p.a` of a fan is, `t` seconds after it left his hand (world), from where it left along the way he faced. */
export function maskWhere(p: { x: number; y: number; fx: number; fy: number; a: number }, t: number): { x: number; y: number } {
  const f = flungMask(p.a, t).at;
  const fwd = f[0] / TILE3;
  const left = f[1] / TILE3;
  return { x: p.x + p.fx * fwd + p.fy * left, y: p.y + p.fy * fwd - p.fx * left };
}

/** Whether (x, y) is in a chime's ring's gap, its front `r` tiles out (the gap 2.4 tiles across, facing `p.c` radians). */
export function chimeGap(p: Peril, x: number, y: number, r: number): boolean {
  if (r < 0.5) return false;
  const a = Math.atan2(y - p.y, x - p.x);
  const half = CHIME.gap / 2 / r;
  const d = Math.abs((((a - p.c + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
  return d < half;
}
