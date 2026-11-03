// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18, THE GLASS GALLERY: THE QUEEN'S GUARD: their rules (game/act1_rules/types.ts).
//
// His pick to the art chat, 30 Oct 2026 (asked how they should change so they are nothing like the king's knights): “Mirror
// duellists (Recommended)”, offered as: "tall and thin, elegant; mirrored plate like liquid silver ... a long glass blade in each
// hand. Move: they don't charge. They step into a mirror and step out of another beside you (the Queen's trick, smaller).
// Attacks: a fast double slash with the glass blades; a thrown fan of glass shards (ranged). Death: they shatter like a mirror";
// then “Yes, that's them (Recommended)” (docs/mockups/queens_guard/README.md, every number).
//
// WHAT THEY DO (the art's numbers, art/queens_guard_moves.ts):
// - THEY GLIDE at QG_GLIDE, slowly, never charging; farther off than QGUARD_TUNE.step from the hero, and seen, they step into
//   the glass (QG_STEP_IN: gone from the middle of it, nothing harming them) and out of it beside him (QG_STEP_OUT, at his
//   side, QGUARD_TUNE.beside tiles off, a quarter turn round from the way he faces), every QGUARD_TUNE.stepEvery at the most.
// - THE DOUBLE SLASH (their basic, QG_SLASH, 1.7 s): the X before them, from QG_SLASH.from to QG_SLASH.reach tiles out,
//   QG_SLASH.wide across: the first blade at QG_SLASH.hit, the second a moment after; each strikes whoever is in the X.
// - THE SHARD FAN (QG_FAN): five shards thrown in a fan 60 degrees wide, flying 16 tiles a second out to 8; each strikes the
//   first it meets.
// What they throw and leave, drawn: render/act1_fx/qguard.ts.

import { QG_FAN, QG_FAN_FLIGHT, QG_FAN_WAYS, QG_GLIDE, QG_SLASH, QG_STEP_IN, QG_STEP_OUT, QG_WALK, awayAt } from '../../art/queens_guard_moves';
import type { ActDef, BossRules } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** Their numbers: farther off than `step`, they step through the glass (no oftener than `stepEvery`) and out `beside` tiles from the hero; the X's blades each `slash` of their blow; a shard `shard` of it; how near a shard passes to strike. */
export const QGUARD_TUNE = { step: 4, stepEvery: 6, beside: 1.6, slash: 0.6, shard: 0.5, shardHit: 0.55 } as const;

const ACTS: readonly ActDef[] = [
  { id: 'qguard:slash', clip: 'attack', long: QG_SLASH.long, hit: QG_SLASH.hit, dmg: QGUARD_TUNE.slash, cooldown: 0, first: 0.4, after: 0.5, near: 0, far: QG_SLASH.reach + 0.2 },
  { id: 'qguard:fan', clip: 'fan', long: QG_FAN.long, hit: QG_FAN.hit, dmg: QGUARD_TUNE.shard, cooldown: 5, first: 2, after: 0.5, near: 3, far: QG_FAN.range - 1 },
  { id: 'qguard:stepIn', clip: 'stepIn', long: QG_STEP_IN.long, hit: QG_STEP_IN.strike[0], dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
  { id: 'qguard:stepOut', clip: 'stepOut', long: QG_STEP_OUT.long, hit: QG_STEP_OUT.strike[1], dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 999, forced: true },
];
const STEP_IN = 2;
const STEP_OUT = 3;

const a1Of = (m: Monster): Record<string, number> => m.a1 ?? (m.a1 = {});

/** Whether (x, y) is in the X a slash lays from (sx, sy) facing (fx, fy). */
export function inX(sx: number, sy: number, fx: number, fy: number, x: number, y: number): boolean {
  const dx = x - sx;
  const dy = y - sy;
  const fwd = dx * fx + dy * fy;
  const side = Math.abs(-dx * fy + dy * fx);
  return fwd >= QG_SLASH.from - 0.3 && fwd <= QG_SLASH.reach + 0.3 && side <= QG_SLASH.wide / 2 + 0.2;
}
/** Where shard `i` of a fan thrown from (sx, sy) facing (fx, fy) is `t` seconds after it is thrown (tiles), or null once it has flown its range. */
export function shardAt(sx: number, sy: number, fx: number, fy: number, i: number, t: number): { x: number; y: number } | null {
  if (t > QG_FAN_FLIGHT) return null;
  const a = Math.atan2(fy, fx) + (QG_FAN_WAYS[i] * Math.PI) / 180;
  const d = QG_FAN.from + QG_FAN.speed * Math.max(0, t);
  return { x: sx + Math.cos(a) * d, y: sy + Math.sin(a) * d };
}
/** Where one steps out beside the hero: a quarter turn round from the way he faces, either side, on open floor (null: nowhere). */
function besideHero(R: BossRules, m: Monster): { x: number; y: number } | null {
  const h = R.g.hero;
  const base = Math.atan2(h.fy || 0.0001, h.fx || 0.0001);
  const side = m.id % 2 ? 1 : -1;
  for (const turn of [side * 90, -side * 90, side * 135, -side * 135, 180, side * 45]) {
    const a = base + (turn * Math.PI) / 180;
    const x = h.x + Math.cos(a) * QGUARD_TUNE.beside;
    const y = h.y + Math.sin(a) * QGUARD_TUNE.beside;
    if (R.g.isOpen(x, y)) return { x, y };
  }
  return null;
}

export const RULES: Act1Rules | null = {
  gait: { pace: QG_GLIDE, cycle: QG_WALK.frames / QG_WALK.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.6, slack: 0.5, trueBack: true },
  acts: ACTS,
  forced(R, m, _acts) {
    // (out of the glass, at once, once they have gone into it)
    const k = a1Of(m);
    if (k.out) return STEP_OUT;
    // (farther off than they like, and seen: into the glass, no oftener than stepEvery)
    const h = R.g.hero;
    const d = Math.hypot(h.x - m.x, h.y - m.y);
    if (d > QGUARD_TUNE.step && d < 14 && R.g.time >= (k.nextStep ?? 0) && R.g.sees(m.x, m.y, h.x, h.y) && besideHero(R, m)) return STEP_IN;
    return -1;
  },
  reachable(m) {
    // (through the glass: not here)
    if (!m.act) return true;
    const move = m.act.id === 'qguard:stepIn' ? 'stepIn' : m.act.id === 'qguard:stepOut' ? 'stepOut' : '';
    return !move || !awayAt(move, m.act.t);
  },
  end(R, m, a) {
    const k = a1Of(m);
    if (a.id === 'qguard:stepIn') {
      // (out of another glass beside him, facing him)
      const p = besideHero(R, m);
      if (p) {
        m.x = p.x;
        m.y = p.y;
      }
      const h = R.g.hero;
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      m.fx = (h.x - m.x) / d;
      m.fy = (h.y - m.y) / d;
      k.out = 1;
      R.g.sfx('shatter', 0.25);
      return;
    }
    if (a.id === 'qguard:stepOut') {
      k.out = 0;
      k.nextStep = R.g.time + QGUARD_TUNE.stepEvery;
    }
  },
  start(R, m, a) {
    if (a.id === 'qguard:stepIn') R.g.sfx('shatter', 0.2);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'qguard:slash') {
      // (the two blades, one after the other, each striking whoever is in the X)
      for (const T of [QG_SLASH.hit, QG_SLASH.second[1]]) {
        if (!at(T)) continue;
        g.sfx('swing', 0.6);
        if (inX(m.x, m.y, m.fx, m.fy, h.x, h.y)) R.blow(m, a.dmg);
        if (T === QG_SLASH.hit) R.peril(m, 'act1', m.x, m.y, { a1: 'qguard:x', dur: 0.6, hit: 0 });
      }
      return;
    }
    if (a.id === 'qguard:fan' && at(a.hit)) {
      g.sfx('shatter', 0.5);
      R.peril(m, 'act1', m.x, m.y, { a1: 'qguard:fan', dur: QG_FAN_FLIGHT + 0.1, hit: 0, a: 0, dmg: g.rollMonsterDmg(m) * a.dmg });
    }
  },
  peril(R, p) {
    if (p.a1 !== 'qguard:fan') return;
    // (each shard strikes the first it meets: the hero, once a shard; `a` the shards that have struck, as bits)
    const g = R.g;
    const h = g.hero;
    for (let i = 0; i < QG_FAN.count; i++) {
      if (p.a & (1 << i)) continue;
      const s = shardAt(p.x, p.y, p.fx, p.fy, i, p.t);
      if (!s) continue;
      if (!g.isOpen(s.x, s.y)) {
        p.a |= 1 << i;
        continue;
      }
      if (Math.hypot(s.x - h.x, s.y - h.y) <= QGUARD_TUNE.shardHit && !h.move) {
        p.a |= 1 << i;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, s.x, s.y, p.half);
      }
    }
  },
};
