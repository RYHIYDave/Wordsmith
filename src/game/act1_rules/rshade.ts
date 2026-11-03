// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE RIME SHADE: its rules (game/act1_rules/types.ts).
//
// His pick to the art chat, 31 Oct 2026, asked where frost should go: “The Shade, 2–5 (Recommended),The Drowned, 10,The Quiet
// Tower, 20”; 3 Nov 2026, which frost creature for the Quiet Tower: “Rime Shade (Recommended)”, offered as: a hunched figure of
// frost and fog, icicles for fingers; its breath sends a creeping line of rime along the floor that freezes you in place if it
// reaches you. His yes to the art chat to hand it over: “Yes, and lying rime slows (Recommended)”; to the main chat, 3 Nov 2026,
// asked whether it should wait for the next version: “In 25.0 too”. The art chat's pictures and numbers: art/rime_shade.ts,
// rime_shade_moves.ts, rime_shade_fx.ts (docs/mockups/rime_shade/README.md), behind RIME_SHADE_ON.
//
// WHAT IT DOES (a small mob: one attack):
// - IT DRIFTS at RS_PACE, 1.8 tiles a second, low, its feet never on the floor; it comes no nearer than `gait.stopAt`.
// - THE RIME BREATH (RS_BREATH, 2.5 s): from a hero up to `far` tiles off, it straightens, draws in its breath and holds it; from
//   RS_BREATH.mark (0.25 s) THE LINE IT WILL SEND IS MARKED on the floor, straight from it at where he stood then, and kept so
//   ('rshade:line', its clock 0 as it breathes out; p.fx, p.fy the way it runs). In two frames it breathes out (RS_BREATH.hit), and
//   from there THE RIME CREEPS down the line at RIME_LINE.pace, 3.5 tiles a second (he runs 4.6: he can outrun it, or step out of
//   it). WHERE ITS FRONT REACHES HIM he is struck, and FROZEN IN PLACE for FROZEN.hold, 0.8 s (Hero.iceT: as the Drowned's grab;
//   'rshade:ice' at his feet, the frost closing over his legs and shattering). Dodging through it, he is neither. Once frozen,
//   no line freezes him again for `TUNE.grace` after he is let go (two lines can cross; never a lock).
// - THE RIME LIES where the front has passed, each stretch RIME_LINE.lies, melting from where it began; it SLOWS whoever stands in
//   it, `TUNE.slow` of his pace (his yes: “Yes, and lying rime slows (Recommended)”, the Shade's rime's 0.4).
// - Killed or stopped before it breathes out, its mark is gone with it.
// Drawn: render/act1_fx/rshade.ts.

import { FROZEN, LINE_GONE, RIME_LINE, lineFront, reachesAt, rimeLeft } from '../../art/rime_shade_fx';
import { RS_BREATH, RS_DRIFT, RS_PACE } from '../../art/rime_shade_moves';
import { TUNE as GAME_TUNE } from '../defs';
import type { ActDef } from '../bosses';
import type { Peril } from '../state';
import type { Act1Rules } from './types';

export const LINE_PERIL = 'rshade:line';
export const ICE_PERIL = 'rshade:ice';

/**
 * Its numbers: from how far off it breathes (`far`: its line reaches 6.45 tiles before it); how near it comes; the grace after
 * he is let go before another line may freeze him; how much the lying rime slows him; a pack's size (the art chat: “two or three
 * together so their lines cross”).
 */
export const RIME_TUNE = { far: 5.6, stopAt: 3.2, grace: 1.0, slow: 0.4, pack: [2, 3] as const } as const;

const ACTS: readonly ActDef[] = [
  { id: 'rshade:breath', clip: 'attack', long: RS_BREATH.long, hit: RS_BREATH.hit, dmg: 1, cooldown: 0, first: 0.6, after: 1.0, near: 0, far: RIME_TUNE.far },
];

/** The hero's place on a line: tiles along it from where it was breathed, and to its side. */
export function onLine(p: { x: number; y: number; fx: number; fy: number }, x: number, y: number): { fwd: number; side: number } {
  const dx = x - p.x;
  const dy = y - p.y;
  return { fwd: dx * p.fx + dy * p.fy, side: dx * p.fy - dy * p.fx };
}

/** When the hero was last let go of a freeze (the game's clock), per game: no line freezes him again within the grace. */
const freed = new WeakMap<object, number>();

export const RULES: Act1Rules | null = {
  gait: { pace: RS_PACE, cycle: RS_DRIFT.frames / RS_DRIFT.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: RIME_TUNE.stopAt, slack: 0.8, trueBack: true },
  acts: ACTS,
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id !== 'rshade:breath') return;
    // (the line marked straight at where he stands now, and kept: its clock 0 as it breathes out)
    if (at(RS_BREATH.mark)) {
      const dx = h.x - m.x;
      const dy = h.y - m.y;
      const d = Math.hypot(dx, dy);
      const fx = d > 1e-6 ? dx / d : m.fx;
      const fy = d > 1e-6 ? dy / d : m.fy;
      R.peril(m, 'act1', m.x, m.y, { a1: LINE_PERIL, fx, fy, t: -(RS_BREATH.hit - RS_BREATH.mark), dur: LINE_GONE + 0.1, dmg: g.rollMonsterDmg(m) * a.dmg, a: m.id, b: RIME_LINE.from - 0.2 });
      g.sfx('frost', 0.25);
    }
    if (at(RS_BREATH.hit)) g.sfx('frost', 0.5);
  },
  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 === ICE_PERIL) {
      // (the ice round his feet goes with him while he is held)
      if (p.t < FROZEN.hold && (h.iceT ?? 0) > 0) {
        p.x = h.x;
        p.y = h.y;
      }
      if (p.done === 0 && p.t >= FROZEN.hold) {
        p.done = 1;
        freed.set(g, g.time);
      }
      return;
    }
    if (p.a1 !== LINE_PERIL) return;
    if (p.t < 0) {
      // (marked, not yet breathed out: gone if it is stopped first)
      const m = g.monsters.find((o) => o.id === p.a);
      if (!m || m.dead || m.state !== 'act' || m.act?.id !== 'rshade:breath') p.dur = p.t;
      return;
    }
    const front = lineFront(p.t) ?? RIME_LINE.from;
    const was = p.b;
    p.b = front;
    const { fwd, side } = onLine(p, h.x, h.y);
    const r = GAME_TUNE.heroRadius * 0.5;
    const across = Math.abs(side) <= RIME_LINE.half + r;
    if (!across || g.over) return;
    // (its front reaches him: struck, and frozen in place; dodging through it, neither)
    const free = !h.move && h.invuln <= 0;
    if (p.done === 0 && free && fwd >= RIME_LINE.from - r && fwd > was - r && fwd <= front + r) {
      p.done = 1;
      g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      const last = freed.get(g);
      const since = last === undefined ? Infinity : g.time - last;
      const icy = g.perils.some((q) => q.a1 === ICE_PERIL && q.t < FROZEN.hold);
      if (!icy && (h.iceT ?? 0) <= 0 && !(since >= 0 && since < RIME_TUNE.grace)) {
        h.iceT = FROZEN.hold;
        g.emit({ t: 'text', x: h.x, y: h.y, text: 'Frozen', color: '#ff8a80' });
        R.g.perils.push(icePeril(p, h.x, h.y));
        g.sfx('frost', 0.6);
      }
      return;
    }
    // (the rime lying where its front has passed: it slows him)
    if (fwd < RIME_LINE.from || fwd > front) return;
    const t = reachesAt(Math.max(RIME_LINE.from, Math.min(RIME_LINE.from + RIME_LINE.long, fwd)));
    if (t === null || rimeLeft(p.t - t) < 0.3) return;
    const slowed = (h.slowT ?? 0) > 0 ? h.slowBy ?? 0 : 0;
    h.slowT = Math.max(h.slowT ?? 0, 0.12);
    h.slowBy = Math.max(slowed, RIME_TUNE.slow);
    void dt;
  },
};

/** The frost closing over his legs where the line's front reached him (its clock from then). */
function icePeril(p: Peril, x: number, y: number): Peril {
  return { ...p, a1: ICE_PERIL, x, y, t: 0, hit: 0, dur: FROZEN.hold + FROZEN.shatter + 0.05, done: 0, b: 0, c: 0, d: 0 };
}
