// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: YOUR REFLECTIONS: their rules (game/act1_rules/types.ts). Built by the main chat from
// the art chat's (art/reflections.ts, reflections_fx.ts; his picks there, “Glassy copy of you (Recommended)”, “Yes, that's them
// (Recommended)”, and what glows on you pink on them, “Pink, like enemies (Recommended)”; docs/mockups/reflections/README.md).
// His doc, level 18: "your own reflections, which step out of the mirrors and fight with your class's moves". Medium: two blows.
//
// WHAT THEY DO (the main chat's, where the art leaves it to the game):
// - A COPY OF YOUR CLASS (Monster.form, set as it comes into the world by the hero's class: FORM_OF): its pictures yours turned to
//   glass (art/act1_figs/reflection.ts), its two blows yours, the tap's and the hold's:
//     a blade (the knight; the Brawler, until the art has his): a cut before it (STYLE.blade), then a whirl round it;
//     a bow (the ranger; the Tinkerer, until hers): an arrow at you, then a volley of five;
//     magic (the mage; the Warlock, until his): a wave rolling at you, then an orb lobbed where you stood that bursts.
//   Each held first a moment, its warning in the enemy's pink on the floor (his rule for enemies, 28 Oct: “Start from now on,
//   but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to
//   evade”): your own moves are quicker than any enemy's warning should be, so its picture holds its first frame through it.
// - IT STEPS OUT OF A MIRROR: as it wakes, the nearest tall mirror not taken (within STEP.near) is its way in: it is put before
//   that glass and steps out of it (the art's clips.moves.stepOut), not to be struck until it is through.
// Where it is drawn and warned: render/act1_fx/reflection.ts.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { ClassId } from '../types';
import { MIRROR_FRAME, frameOf, mirrorsOf } from '../act2/gallery_rules';
import type { MirrorAt } from '../act2/gallery_rules';
import type { Act1Rules } from './types';

/** The hero's class as a reflection's form (its pictures, art/act1_figs/reflection.ts `looks`, and its blows). */
export const FORM_OF: Readonly<Record<ClassId, number>> = { warrior: 0, ranger: 1, mage: 2, warlock: 3, tinkerer: 4, brawler: 5 } as Readonly<Record<ClassId, number>>;
/** How each form fights: a blade, a bow, magic. */
export type Style = 'blade' | 'bow' | 'magic';
export const STYLE_OF: readonly Style[] = ['blade', 'bow', 'magic', 'magic', 'bow', 'blade'];
export const styleOf = (m: Monster): Style => STYLE_OF[m.form ?? 0] ?? 'blade';

/** The reflections' numbers (tiles; seconds). `warn`: held before each blow's own picture plays; `hit`: its blow into its picture (the art's clips' `hit`). */
export const REFLECT = {
  tap: { warn: 0.45, play: 0.97 },
  hold: { warn: 0.7, play: 0.7 },
  /** When each style's blow lands in its picture (seconds into the hero's own clip). */
  hit: { blade: { tap: 0.13, hold: 0.23 }, bow: { tap: 0.17, hold: 0.2 }, magic: { tap: 0.17, hold: 0.27 } },
  blade: { reach: 1.9, half: 1.2, whirl: 2.1 },
  bow: { far: 8, speed: 12, hit: 0.45, volley: 5, spread: 0.5 },
  magic: { far: 7, wave: { speed: 7, long: 0.9, half: 0.7 }, orb: { speed: 5, burst: 1.7, after: 0.35 } },
};
/** How far it comes from a mirror to step out of it, and how long that takes (the art's STEP_OUT: 1.6 s, out of the glass by 0.72 s). */
export const STEP = { near: 9, long: 1.6, through: 0.72, out: 0.85 };

/** The hero's run: his pace, his stride's round. */
const GAIT: GaitDef = { pace: 4.0, cycle: 0.45, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.6, slack: 0.5, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'reflection:tap', clip: 'attack', long: REFLECT.tap.warn + REFLECT.tap.play, hit: REFLECT.tap.warn + 0.15, dmg: 1, cooldown: 0, first: 0.3, after: 0.4, near: 0, far: REFLECT.bow.far },
  { id: 'reflection:hold', clip: 'heavy', long: REFLECT.hold.warn + REFLECT.hold.play, hit: REFLECT.hold.warn + 0.25, dmg: 1.4, cooldown: 6, first: 2.5, after: 0.5, near: 0, far: REFLECT.bow.far },
  { id: 'reflection:out', clip: 'stepOut', long: STEP.long, hit: STEP.through, dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 99, forced: true },
];

/** When a blow lands in act `a` for this one (seconds into the act). */
export function hitOf(m: Monster, a: { id: string }): number {
  const s = styleOf(m);
  return a.id === 'reflection:hold' ? REFLECT.hold.warn + REFLECT.hit[s].hold : REFLECT.tap.warn + REFLECT.hit[s].tap;
}

/** The mirrors taken already, each by one reflection stepping out of it. */
const taken = new WeakSet<MirrorAt>();

/** Have `m` step out of a glass at (x, y) on a wall facing (fx, fy) (the Queen's Reflections out of her hall's pier glasses). */
export function stepOutAt(m: Monster, x: number, y: number, fx: number, fy: number): void {
  const k = (m.a1 ??= {});
  k.outDone = 1;
  k.out = 1;
  k.ox = x;
  k.oy = y;
  k.ofx = fx;
  k.ofy = fy;
}

/** Is the hero in a blade's cut before it? */
function inCut(R: BossRules, m: Monster): boolean {
  const r = R.rel(m);
  const d = Math.hypot(r.fwd, r.left);
  return d <= REFLECT.blade.reach && Math.abs(Math.atan2(r.left, r.fwd)) <= REFLECT.blade.half;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(R, m) {
    m.form = FORM_OF[R.g.hero.cls] ?? 0;
  },
  tick(R, m) {
    // (as it wakes: the nearest mirror not taken, its way in)
    const k = (m.a1 ??= {});
    if (k.outDone) return false;
    k.outDone = 1;
    const L = R.g.level;
    if (!L.land?.gallery) return false;
    let best: MirrorAt | null = null;
    let bd = STEP.near;
    for (const q of mirrorsOf(L)) {
      if (taken.has(q) || frameOf(q) === MIRROR_FRAME.burst) continue;
      const d = Math.hypot(q.x - m.x, q.y - m.y);
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
    if (best) {
      taken.add(best);
      stepOutAt(m, best.x, best.y, best.fx, best.fy);
    }
    return false;
  },
  forced(_R, m, acts) {
    return m.a1?.out === 1 ? acts.findIndex((a) => a.id === 'reflection:out') : -1;
  },
  can(_R, m, a, dist) {
    const s = styleOf(m);
    if (a.id === 'reflection:tap') return s === 'blade' ? dist <= REFLECT.blade.reach + 0.2 : dist <= (s === 'bow' ? REFLECT.bow.far : REFLECT.magic.far);
    if (a.id === 'reflection:hold') return s === 'blade' ? dist <= REFLECT.blade.whirl : dist >= 2 && dist <= (s === 'bow' ? REFLECT.bow.far : REFLECT.magic.far);
    return true;
  },
  start(R, m, a) {
    const k = (m.a1 ??= {});
    if (a.id === 'reflection:out') {
      // (put before the glass, facing out of it, where the art's step-out ends)
      k.out = 2;
      m.x = (k.ox ?? m.x) + (k.ofx ?? 0) * STEP.out;
      m.y = (k.oy ?? m.y) + (k.ofy ?? 1) * STEP.out;
      m.fx = k.ofx ?? 0;
      m.fy = k.ofy ?? 1;
      return;
    }
    // (where it aims: the hero as the blow is begun)
    k.tx = R.g.hero.x;
    k.ty = R.g.hero.y;
  },
  end(_R, m, a) {
    if (a.id === 'reflection:out' && m.a1) m.a1.out = 0;
  },
  reachable(m) {
    return !(m.act && m.act.id === 'reflection:out' && m.act.t < STEP.through);
  },
  acting(R, m, a, t0, t1) {
    if (a.id === 'reflection:out') return;
    const g = R.g;
    const T = hitOf(m, a);
    if (!(t0 < T && t1 >= T)) return;
    const s = styleOf(m);
    const hold = a.id === 'reflection:hold';
    if (s === 'blade') {
      g.sfx(hold ? 'whirl' : 'swing', 0.5);
      if (hold ? Math.hypot(g.hero.x - m.x, g.hero.y - m.y) <= REFLECT.blade.whirl : inCut(R, m)) R.blow(m, a.dmg);
      return;
    }
    const dmg = g.rollMonsterDmg(m);
    if (s === 'bow') {
      g.sfx(hold ? 'volley' : 'shot', 0.5);
      const n = hold ? REFLECT.bow.volley : 1;
      for (let i = 0; i < n; i++) {
        const turn = n === 1 ? 0 : -REFLECT.bow.spread + (2 * REFLECT.bow.spread * i) / (n - 1);
        const c = Math.cos(turn);
        const sn = Math.sin(turn);
        const p = R.peril(m, 'act1', m.x + m.fx * 0.5, m.y + m.fy * 0.5, { a1: 'reflection:arrow', dur: REFLECT.bow.far / REFLECT.bow.speed, dmg: dmg * (hold ? 0.8 : 1) });
        p.fx = m.fx * c - m.fy * sn;
        p.fy = m.fy * c + m.fx * sn;
      }
      return;
    }
    if (!hold) {
      g.sfx('wave', 0.5);
      R.peril(m, 'act1', m.x + m.fx * 0.5, m.y + m.fy * 0.5, { a1: 'reflection:wave', dur: REFLECT.magic.wave.long, dmg });
      return;
    }
    g.sfx('orb', 0.5);
    const k = m.a1 ?? {};
    const tx = k.tx ?? g.hero.x;
    const ty = k.ty ?? g.hero.y;
    const d = Math.max(0.5, Math.hypot(tx - m.x, ty - m.y));
    const p = R.peril(m, 'act1', m.x, m.y, { a1: 'reflection:orb', dur: d / REFLECT.magic.orb.speed + REFLECT.magic.orb.after + 0.3, dmg: dmg * 1.5 });
    p.a = tx;
    p.b = ty;
    p.c = d / REFLECT.magic.orb.speed;
  },
  peril(R, p) {
    if (p.done) return;
    const h = R.g.hero;
    if (p.a1 === 'reflection:arrow') {
      const x = p.x + p.fx * REFLECT.bow.speed * p.t;
      const y = p.y + p.fy * REFLECT.bow.speed * p.t;
      const L = R.g.level;
      if (L.open[Math.floor(y) * L.floor.w + Math.floor(x)] !== 1) {
        p.done = 1;
        return;
      }
      if (Math.hypot(h.x - x, h.y - y) <= REFLECT.bow.hit) {
        p.done = 1;
        R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, x, y, p.half);
      }
      return;
    }
    if (p.a1 === 'reflection:wave') {
      const W = REFLECT.magic.wave;
      const along = W.speed * p.t;
      const ax = h.x - p.x;
      const ay = h.y - p.y;
      const f = ax * p.fx + ay * p.fy;
      const side = Math.abs(ax * p.fy - ay * p.fx);
      if (Math.abs(f - along) <= 0.5 && side <= W.half + along * 0.25) {
        p.done = 1;
        R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x + p.fx * along, p.y + p.fy * along, p.half);
      }
      return;
    }
    if (p.a1 === 'reflection:orb' && p.t >= p.c + REFLECT.magic.orb.after) {
      p.done = 1;
      R.g.sfx('explode', 0.5);
      R.g.emit({ t: 'burst', x: p.a, y: p.b, r: REFLECT.magic.orb.burst, el: 'phys', style: 'blast' });
      if (Math.hypot(h.x - p.a, h.y - p.b) <= REFLECT.magic.orb.burst) R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.a, p.b, p.half);
    }
  },
};
