// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19: THE KING: his rules (game/act1_rules/types.ts). Built by the main chat from the art
// chat's (art/king.ts, king_moves.ts, king_fx.ts; his pick there, how he moves, “Slow and heavy, huge reach (Recommended)”, and his
// yes, “Yes, that's the King (Recommended)”; docs/mockups/king/README.md, every number). His doc, level 19: "The King. His floor
// is the Throne Hall."; the plan: "the king is dying. The Hush sits on his chest wearing his crown, holding his sword, and the
// faces of everything he ever did look out at him from the bed curtains (as Death does in "The Nightingale"). His clockwork
// songbird lies broken on the floor." A boss: four blows (his rulebook).
//
// WHAT HE DOES (the main chat's, where the art leaves it to the game):
// - HE WALKS at KG_PACE, a tile a second, slow and heavy, his sword dragged; every blow of his reaches across the hall.
// - EVERY BLOW IS LAID SQUARE TO THE WAY HIS PICTURE FACES (squareOn): his pictures and what his blows leave are painted facing
//   one of the four ways the floor runs, so as each blow begins he is turned square to it (never more than an eighth of a turn
//   from him), and what it strikes is where it is drawn.
// - THE SWEEP (his basic, KG_SWEEP, 2.6 s; the blade round at 1.3 s): the blade itself strikes whoever is within KING_TUNE.sweep.
//   blade tiles of him in the wedge it sweeps (from behind his right, -165 degrees, round to 70 to his left); ITS WAVE rolls on over
//   the same wedge out to 10 tiles in half a second (SWEEP_FX), striking whoever it passes (a share of his blow). Behind his left
//   is the only place it does not reach.
// - THE DECREE (KG_DECREE, 2.8 s; the sword driven into the stones at 1.33 s): three lines of his knights rise behind him and
//   march across the hall before him at 2.4 tiles a second, a line every 3.2 tiles, a knight every 1.25 tiles across its whole
//   width, two gaps two knights wide in each line (DECREE_GAPS) to slip through; a knight who walks into him strikes him (once a
//   line). Laid to the hall: they rise at the wall behind him and fade at the wall before him; none where the floor is wall.
// - THE CROWN (KG_CROWN, 2.8 s): crouched (the warning), he springs; in the air (1.02 to 1.45 s) carried KG_CROWN.carry (5) tiles
//   at where the hero stood as it began, so far as the floor lets him; he lands at 1.5 s and slams the blade down: whoever is
//   within KING_TUNE.crown.slam is struck hard; and a RING rolls out from there across the whole hall to 10 tiles in 0.8 s
//   (CROWN_FX), striking whoever its front passes (a share of his blow). A roll or a leap through it as it passes is the way.
// - THE CURTAINS (KG_CURTAINS, 2.5 s; his hand flung at 1.1 s): the faces of his deeds stream out of three hangings behind him at
//   where the hero stood as his hand was flung (curtainFaces: one from each every 0.09 s for 1.5 s, 11 tiles a second); a face
//   that passes through him strikes him (a small share of his blow, no more often than KING_TUNE.faces.gap).
// - HIS LAST PHASE (the plan: "his last phase, the Hush climbs off him and fights at his side"): at a third of his life the Hush
//   climbs off him (KG_CLIMB, 2.6 s; nothing hurts him while it does); from then he is KING_ALONE (Monster.form 1), and the Hush
//   stands at his side (HUSH_BESIDE: a peril, 'gking:hush', that keeps there). ITS OWN MOVES ARE HIS TO DECIDE: until he says, it
//   stands. His waits are shorter each phase (KING_TUNE.cd).
// - HIS DEATH (KG_DIES): the Hush unwinds into nothing; the clockwork songbird lying broken before his throne winds itself up,
//   rights itself and sings (BIRD; a peril, 'gking:bird', in place of the floor's broken one); the way on opens (the game's ways).
// What his blows leave and send, and the Hush and the bird, drawn: render/act1_fx/gking.ts.

import { CROWN_FX, CURTAINS_FX, DECREE_FX, KG_REACH, SWEEP_FX, curtainFaces, decreeKnights } from '../../art/king_fx';
import { HUSH_BESIDE, KG_CLIMB, KG_CROWN, KG_CURTAINS, KG_DECREE, KG_PACE, KG_SWEEP, KG_WALK } from '../../art/king_moves';
import { TILE3 } from '../../art/new_mobs3';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { backView, beside, flipped, fromFigure, handOf } from '../facing';
import type { Level, Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** His numbers (tiles; seconds; shares of his blow). */
export const KING_TUNE = {
  /** The sweep: the blade's own reach (it is 2.1 to 2.4 out, and his arms), the wedge (degrees to his left of his front), the wave's reach and how long it takes to get there, its share of his blow. */
  sweep: { blade: 2.9, from: SWEEP_FX.from, to: SWEEP_FX.to, reach: KG_REACH.sweep, out: SWEEP_FX.out, wave: 0.7 },
  /** The Decree: how near a knight's line (tiles before or behind it) and how near a knight across it he must be to be struck; a knight's share of his blow. */
  decree: { fwd: 0.55, side: 0.85, dmg: 0.8 },
  /** The Crown: how far he is carried; the slam's reach where he lands; the ring's reach, how long to get there, how thick its front is, its share of his blow. */
  crown: { carry: KG_CROWN.carry, slam: 2.6, ring: KG_REACH.crown, out: CROWN_FX.out, band: 0.85, wave: 0.8 },
  /** The faces: how near one must pass him to strike him, its share of his blow, no more often than `gap`, and no more than `most` of them a cast. */
  faces: { hit: 0.6, dmg: 0.3, gap: 0.3, most: 4 },
  /** His last phase comes at this share of his life. */
  climbAt: 1 / 3,
  /** His waits (cooldowns) in each phase (above two thirds of his life, above a third, below), as a share of his first. */
  cd: [1, 0.85, 0.7] as const,
  /** The Hush at his side (HUSH_BESIDE: the art's lengths, behind and to his left). */
  hush: { fwd: HUSH_BESIDE[0] / TILE3, left: HUSH_BESIDE[1] / TILE3 },
};

/** His phase: 0 above two thirds of his life, 1 above a third, 2 below. */
export function phaseOf(m: Monster): 0 | 1 | 2 {
  const f = m.life / Math.max(1, m.maxLife);
  return f > 2 / 3 ? 0 : f > 1 / 3 ? 1 : 2;
}

/** The way the floor runs that his picture faces now (one of the four), as (fx, fy). */
export function squareOf(fx: number, fy: number): { fx: number; fy: number } {
  const back = backView(fx, fy);
  const flip = flipped(fx, fy);
  return back ? (flip ? { fx: -1, fy: 0 } : { fx: 0, fy: -1 }) : flip ? { fx: 0, fy: 1 } : { fx: 1, fy: 0 };
}
/** Turned square to the way his picture faces (squareOf). */
function squareOn(m: Monster): void {
  const s = squareOf(m.fx, m.fy);
  m.fx = s.fx;
  m.fy = s.fy;
}

/** Whether (x, y) is in the wedge his sweep covers, from a blow laid at `p` (its x, y, fx, fy, hand): its bearing in degrees to his left. */
export function inWedge(p: { x: number; y: number; fx: number; fy: number; hand: number }, x: number, y: number): boolean {
  const r = fromFigure(p.x, p.y, p.fx, p.fy, p.hand, x, y);
  const b = (Math.atan2(r.left, r.fwd) * 180) / Math.PI;
  return b >= KING_TUNE.sweep.from && b <= KING_TUNE.sweep.to;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
/** How far out the sweep's wave is, `t` seconds after the blow (tiles: from the blade's reach to its own, as the art's sweepPainted). */
export function sweepFront(t: number): number {
  const k = smooth(0, SWEEP_FX.out, t) * 0.85 + 0.15 * clamp01(t / SWEEP_FX.out);
  return 2.4 + (KING_TUNE.sweep.reach - 2.4) * k;
}
/** How far out the Crown's ring is, `t` seconds after he lands (tiles, as the art's crownPainted). */
export function ringFront(t: number): number {
  const k = smooth(0, CROWN_FX.out, t) * 0.8 + 0.2 * clamp01(t / CROWN_FX.out);
  return 0.8 + (KING_TUNE.crown.ring - 0.8) * k;
}

/** How far the floor runs from (x, y) along (fx, fy) before a wall (tiles), at most `most`. */
function openFor(g: BossRules['g'], x: number, y: number, fx: number, fy: number, most: number): number {
  let d = 0.5;
  for (; d < most; d += 0.25) if (!g.isOpen(x + fx * d, y + fy * d)) break;
  return Math.min(most, d);
}

/** The Decree's lines laid to the hall from a peril (its x, y, fx, fy; `a` where they rise, `b` where they fade: tiles before him). */
export function decreeOf(p: Peril): { from: number; to: number; half: number } {
  return { from: p.a, to: p.b, half: KG_REACH.decreeHalf };
}
/** Its knights now, on the floor (world), each with how risen and how whole; none where the floor is wall. */
export function decreeNow(g: BossRules['g'], p: Peril): { x: number; y: number; up: number; whole: number; step: number }[] {
  return decreeKnights(p.t, decreeOf(p))
    .map((k) => ({ ...k, ...beside(p.x, p.y, p.fx, p.fy, p.hand, k.x, k.y) }))
    .filter((k) => g.isOpen(k.x, k.y));
}
/** How long the Decree's lines last (seconds from his blow). */
export function decreeLong(p: Peril): number {
  return (DECREE_FX.lines - 1) * (DECREE_FX.apart / DECREE_FX.pace) + (p.b - p.a) / DECREE_FX.pace + DECREE_FX.fade + 0.2;
}

/** The faces of the Curtains now, on the floor (world), each with its height (the art's lengths) and how far through its flight. */
export function facesNow(p: Peril): { x: number; y: number; z: number; kind: number; k: number }[] {
  const at: [number, number] = [p.a, p.b];
  return curtainFaces(p.t, at).map((f) => ({ ...beside(p.x, p.y, p.fx, p.fy, p.hand, f.p[0] / TILE3, f.p[1] / TILE3), z: f.p[2], kind: f.kind, k: f.k }));
}
/** How long the faces fly (seconds from his hand being flung). */
export const FACES_LONG = CURTAINS_FX.long + (KG_REACH.curtains * 1.6) / CURTAINS_FX.pace + 0.3;

/** Where the Hush stands at his side (world). */
export function hushSpot(m: Monster): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, handOf(true, m.fx, m.fy), KING_TUNE.hush.fwd, KING_TUNE.hush.left);
}

const GAIT: GaitDef = { pace: KG_PACE, cycle: KG_WALK.frames / KG_WALK.fps / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.6, slack: 0.6, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'gking:sweep', clip: 'attack', long: KG_SWEEP.long, hit: KG_SWEEP.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 7 },
  { id: 'gking:decree', clip: 'decree', long: KG_DECREE.long, hit: KG_DECREE.hit, dmg: KING_TUNE.decree.dmg, cooldown: 15, first: 8, after: 0.5, near: 0, far: 30 },
  { id: 'gking:crown', clip: 'crown', long: KG_CROWN.long, hit: KG_CROWN.hit, dmg: 1.4, cooldown: 11, first: 4, after: 0.6, near: 3.2, far: 12 },
  { id: 'gking:curtains', clip: 'curtains', long: KG_CURTAINS.long, hit: KG_CURTAINS.hit, dmg: KING_TUNE.faces.dmg, cooldown: 13, first: 11, after: 0.5, near: 3, far: 16 },
  { id: 'gking:climb', clip: 'climbOff', long: KG_CLIMB.long, hit: KG_CLIMB.down[1], dmg: 0, cooldown: 0, first: 0, after: 0.4, near: 0, far: 999, forced: true },
];

type Keep = Record<string, number>;
const keep = (m: Monster): Keep => (m.a1 ??= {}) as Keep;

/** The Hush at his side (a peril that keeps there), or null. */
export function hushPeril(g: BossRules['g']): Peril | null {
  return g.perils.find((p) => p.a1 === 'gking:hush') ?? null;
}
/** The songbird winding and singing (a peril, his death's), or null. */
export function birdPeril(g: BossRules['g']): Peril | null {
  return g.perils.find((p) => p.a1 === 'gking:bird') ?? null;
}
/** The broken songbird lying before his throne (the floor's piece), or undefined. */
export function brokenBird(L: Level): Level['props'][number] | undefined {
  return L.props.find((p) => p.kind === 'piece' && p.name === 'the clockwork songbird, broken');
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  bossAt(L) {
    // (he waits before his throne, facing down the hall at the way in)
    const b = L.floor.boss;
    return { x: b.x, y: b.y, fx: 0, fy: 1 };
  },
  invulnerable(m) {
    return !!m.act && m.act.id === 'gking:climb';
  },
  forced(_R, m, acts) {
    // (his last phase: the Hush climbs off him)
    if ((m.form ?? 0) === 0 && m.life <= m.maxLife * KING_TUNE.climbAt) return acts.findIndex((a) => a.id === 'gking:climb');
    return -1;
  },
  tick(R, m) {
    // (the Hush at his side keeps there)
    const p = hushPeril(R.g);
    if (p && !p.c) {
      const s = hushSpot(m);
      p.x = s.x;
      p.y = s.y;
      p.fx = m.fx;
      p.fy = m.fy;
    }
    return false;
  },
  start(R, m, a) {
    const g = R.g;
    if (a.id !== 'gking:climb') squareOn(m);
    if (!m.act) return;
    if (a.id === 'gking:crown') {
      // (where he leaps at: where the hero stood as he crouched)
      m.act.x = g.hero.x;
      m.act.y = g.hero.y;
      keep(m).carried = 0;
    }
    if (a.id === 'gking:sweep' || a.id === 'gking:decree') g.sfx('slam', 0.25);
  },
  end(R, m, a) {
    const k = keep(m);
    if (a.id === 'gking:climb') {
      // (his last phase: the King alone, the Hush standing at his side)
      m.form = 1;
      const s = hushSpot(m);
      R.peril(m, 'act1', s.x, s.y, { a1: 'gking:hush', dur: 1e9, hit: 0 });
      return;
    }
    // (his waits shorter each phase)
    const i = ACTS.findIndex((q) => q.id === a.id);
    if (a.cooldown > 0 && m.moveCd && i >= 0) m.moveCd[i] *= KING_TUNE.cd[phaseOf(m)];
    void k;
  },
  died(R, m) {
    const g = R.g;
    // (the Hush unwinds into nothing)
    const h = hushPeril(g);
    if (h) {
      h.c = 1;
      h.t = 0;
      h.dur = 3.2;
    }
    // (the clockwork songbird before his throne winds itself up and sings)
    const L = g.level;
    const piece = brokenBird(L);
    if (piece) {
      L.props.splice(L.props.indexOf(piece), 1);
      R.peril(m, 'act1', piece.x, piece.y, { a1: 'gking:bird', dur: 1e9, hit: 0, fx: 1, fy: 0 });
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const act = m.act;
    if (!act) return;
    if (a.id === 'gking:sweep') {
      if (!at(a.hit)) return;
      g.sfx('swing', 0.9);
      const d = Math.hypot(h.x - m.x, h.y - m.y);
      const here = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
      // (the blade itself)
      const struck = d <= KING_TUNE.sweep.blade && inWedge(here, h.x, h.y);
      if (struck) R.blow(m, a.dmg);
      // (its wave, on over the wedge: `a` set once it has struck him)
      R.peril(m, 'act1', m.x, m.y, { a1: 'gking:wave', dur: SWEEP_FX.long, hit: 0, a: struck ? 1 : 0, dmg: g.rollMonsterDmg(m) * KING_TUNE.sweep.wave });
      return;
    }
    if (a.id === 'gking:decree') {
      if (!at(a.hit)) return;
      g.sfx('slam', 0.9);
      g.emit({ t: 'shake', amount: 4 });
      // (laid to the hall: they rise at the wall behind him and fade at the wall before him)
      const from = -Math.max(2, openFor(g, m.x, m.y, -m.fx, -m.fy, -DECREE_FX.from) - 0.5);
      const to = Math.max(3, openFor(g, m.x, m.y, m.fx, m.fy, DECREE_FX.to) - 0.5);
      const p = R.peril(m, 'act1', m.x, m.y, { a1: 'gking:decree', hit: 0, a: from, b: to, dmg: g.rollMonsterDmg(m) * a.dmg });
      p.dur = decreeLong(p);
      return;
    }
    if (a.id === 'gking:crown') {
      // (in the air: carried at where the hero stood, so far as the floor lets him)
      const [a0, a1] = KG_CROWN.air;
      if (t1 > a0 && t0 < a1) {
        const k = keep(m);
        const want = KING_TUNE.crown.carry * clamp01((Math.min(t1, a1) - a0) / (a1 - a0));
        const dx = act.x - m.x;
        const dy = act.y - m.y;
        const left = Math.hypot(dx, dy);
        const step = Math.min(want - (k.carried ?? 0), Math.max(0, left - 0.6));
        if (step > 0 && left > 0.01) {
          const n = Math.max(1, Math.ceil(step / 0.1));
          for (let i = 0; i < n; i++) {
            const x = m.x + (dx / left) * (step / n);
            const y = m.y + (dy / left) * (step / n);
            const L = g.level;
            if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] !== 1) break;
            m.x = x;
            m.y = y;
          }
        }
        k.carried = want;
      }
      if (!at(a.hit)) return;
      g.sfx('explode', 0.8);
      g.emit({ t: 'shake', amount: 7 });
      if (Math.hypot(h.x - m.x, h.y - m.y) <= KING_TUNE.crown.slam) R.blow(m, a.dmg);
      R.peril(m, 'act1', m.x, m.y, { a1: 'gking:ring', dur: CROWN_FX.long, hit: 0, a: 0, dmg: g.rollMonsterDmg(m) * KING_TUNE.crown.wave });
      return;
    }
    if (a.id === 'gking:curtains') {
      if (!at(a.hit)) return;
      g.sfx('echo', 0.7);
      // (at where the hero stands as the hand is flung: in his own lengths, before him and to his left)
      const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
      R.peril(m, 'act1', m.x, m.y, { a1: 'gking:faces', dur: FACES_LONG, hit: 0, a: r.fwd, b: r.left, c: -9, d: 0, dmg: g.rollMonsterDmg(m) * a.dmg });
      return;
    }
    if (a.id === 'gking:climb' && at(KG_CLIMB.rise[0])) g.sfx('echo', 0.5);
  },
  peril(R, p, _dt) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 === 'gking:wave') {
      // (the wave passes over him: struck once, if he is in the wedge it sweeps)
      if (p.a) return;
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (d <= sweepFront(p.t) && d > KING_TUNE.sweep.blade - 0.2 && inWedge(p, h.x, h.y)) {
        p.a = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      }
      return;
    }
    if (p.a1 === 'gking:ring') {
      // (the ring's front passes him: struck once, unless he is past it already or it has not come)
      if (p.a) return;
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      const r = ringFront(p.t);
      if (p.t <= CROWN_FX.out + 0.05 && Math.abs(d - r) <= KING_TUNE.crown.band && d > KING_TUNE.crown.slam) {
        p.a = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      }
      return;
    }
    if (p.a1 === 'gking:decree') {
      // (a knight walks into him: struck, once a line)
      if (g.time - (p.c || -9) < 1.0) return;
      const r = fromFigure(p.x, p.y, p.fx, p.fy, p.hand, h.x, h.y);
      const T = KING_TUNE.decree;
      for (const k of decreeKnights(p.t, decreeOf(p))) {
        if (k.up < 0.6 || k.whole < 0.4) continue;
        if (Math.abs(r.fwd - k.x) > T.fwd || Math.abs(r.left - k.y) > T.side) continue;
        p.c = g.time;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
        return;
      }
      return;
    }
    if (p.a1 === 'gking:faces') {
      // (a face passes through him: struck, no more often than the gap, no more than `most` a cast)
      const F = KING_TUNE.faces;
      if (p.d >= F.most || g.time - p.c < F.gap) return;
      for (const f of facesNow(p)) {
        if (f.k > 0.95) continue;
        if (Math.hypot(f.x - h.x, f.y - h.y) > F.hit) continue;
        p.c = g.time;
        p.d++;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, f.x, f.y, p.half);
        return;
      }
    }
  },
};
