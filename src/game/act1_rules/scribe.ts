// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE SILENT ORDER'S SCRIBES: its rules (game/act1_rules/types.ts).
//
// His picks for floor 11's monsters (to the art chat, 18 Oct 2026): "... Silent Order scribes,Mute watch hounds". Their
// brief was the art chat's, made on his word of 21:24 Pacific that day ("Hey go without my say so.  If something is shit
// I’ll get it to it but you’re doing a great jobs. At least for 11-15"), read by the planning chat as his yes to go in
// (docs/act2_build.md). The pictures (art/scribes.ts, art/scribes_moves.ts, art/scribe_shots.ts): THE GLIDE, painted for
// a tile a second (SC_PACE), ten frames at ten a second; THE INK FLICK, from afar (SC_FLICK, 1.36 s): the quill dipped
// into the inkhorn at the hip (0.14 s), drawn back up high over the right shoulder, the nib glowing pink and spitting,
// held shaking from 0.32 to 0.5 s (THE WARNING), while on the floor a pink ring closes in on the spot the ink will land on
// (drawInkMark, from as the quill is dipped); then the arm whipped over and the quill flicked at the hero: the ink leaves
// the nib at 19/30 s (frame 19 of 30) and flies in its arc (drawInkFlight, INK_FLIGHT 0.36 s) to the spot; it bursts
// there, a splash of droplets and a pool of wet black ink that shrinks and dries away (drawInkSplat, over INK_POOL_FOR
// 2.4 s, INK_POOL 0.62 tiles across its half). Struck, 0.35 s; their death, the mask splitting and the pages flying (2.4
// s), in its pictures. Small: one attack. "How far they throw and what the ink does to the hero are yours" (the art
// chat's README): so these, the planning chat's helper's:
//
// - THE SPOT: where the hero stands, followed until `lock` (the end of the warning, 0.5 s in), then held: step out of
//   the ring (the bone marksman's line, game/defs.ts AIM, is held so). No further than `most` tiles before it.
// - THE SPLASH, as it lands: whoever is within `r` of the spot is struck (the act's blow).
// - THE POOL, after: it SLOWS whoever stands in it (sticky ink), `slow` of his pace while he is in it and for `linger`
//   after, by the game's own chill on the hero (Hero.chill, as the Drowned's grab slows him); no harm, and not the Hush.
//   It is as wide as its picture is, moment by moment: spread at once (`spread`), shrinking from `dries` of its while to
//   `least` of its size at the last, as drawInkSplat draws it.
// - THEY KEEP THEIR DISTANCE, as the chanter does: they come no nearer than `stopAt`, and stand off and flick. And a hero
//   who comes in on one (within `keep.near`) is backed away from, a glide back until he is that far off or for `keep.most`
//   at the most (not if the floor holds it), then it stands and fights for `keep.rest` before it backs away again.
//
// Every number here that is a picture's is written down here; tests/act2_scribe.test.ts holds it to the art.

import type { BossRules } from '../bosses';
import type { ActDef, GaitDef } from '../bosses';
import { TUNE } from '../defs';
import { beside } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** THE SCRIBES' NUMBERS (tiles, seconds of their pictures; game pixels up). */
export const SCRIBE = {
  /**
   * THE FLICK: the ring shows from `mark` (the quill dipped) and closes until the ink leaves the nib at `hit`; the spot
   * follows the hero until `lock`, no further than `most` before it. The ink leaves the nib `from` (tiles before it, to
   * its left, game pixels up: quillOf(), its picture at the flick) and is `flight` seconds in the air, rising `arc` game
   * pixels over the straight way at its middle (INK_FLIGHT, INK_ARC).
   */
  flick: { mark: 0.16, hit: 19 / 30, lock: 0.5, most: 6.5, from: [0.622, -0.275, 19.08] as const, flight: 0.36, arc: 26 },
  /** THE SPLASH: whoever is within `r` of where it lands is struck (the pool's own half-width, and half the hero's). */
  splash: { r: 0.62 + TUNE.heroRadius * 0.5 },
  /** THE POOL: its half-width `r` (INK_POOL), its while `last` (INK_POOL_FOR); spread in `spread`, drying from `dries` of its while down to `least` of its size; it slows by `slow` while he stands in it, and for `linger` after. */
  pool: { r: 0.62, last: 2.4, spread: 0.12, dries: 0.55, least: 0.55, slow: 0.35, linger: 0.3 },
  /** KEEPING THEIR DISTANCE: a hero within `near` is backed away from, for `most` at the most; then it stands its ground for `rest`. */
  keep: { near: 2.2, most: 1.2, rest: 2.5 },
};

/** How wide (its half-width, tiles) a pool of ink is `t` seconds after it landed, as its picture is (drawInkSplat): 0 before. */
export function poolAt(t: number): number {
  const P = SCRIBE.pool;
  if (t < 0 || t >= P.last) return 0;
  const grow = Math.min(1, t / P.spread);
  const dry = t < P.last * P.dries ? 1 : 1 - (t - P.last * P.dries) / (P.last * (1 - P.dries));
  return P.r * grow * (P.least + (1 - P.least) * dry);
}

/** The spot the ink is aimed at now: where the hero is, no further than it throws. */
function aimed(R: BossRules, m: Monster): { x: number; y: number } {
  const h = R.g.hero;
  const dx = h.x - m.x;
  const dy = h.y - m.y;
  const d = Math.hypot(dx, dy);
  const k = d > SCRIBE.flick.most ? SCRIBE.flick.most / d : 1;
  return { x: m.x + dx * k, y: m.y + dy * k };
}

/** Its glide, painted for a tile a second; short quick steps hidden under the habit: it may stop at any frame. It stands off and flicks. */
const GAIT: GaitDef = { pace: 1.0, cycle: 1 / 10, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 4.5, slack: 1, trueBack: true };

const ACTS: readonly ActDef[] = [{ id: 'scribe:flick', clip: 'attack', long: 1.36, hit: SCRIBE.flick.hit, dmg: 1, cooldown: 0, first: 0, after: 1.3, near: 0, far: 6.5 }];

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  tick(R, m, dt, dist) {
    if (m.state === 'act') return false;
    const K = SCRIBE.keep;
    const a1 = (m.a1 ??= { back: 0, rest: 0 });
    a1.rest = Math.max(0, (a1.rest ?? 0) - dt);
    const g = R.g;
    const h = g.hero;
    // (backed off far enough, or for long enough: it stands its ground a while, at once, as its glide may stop at any frame)
    const done = (): false => {
      if (a1.back > 0) {
        a1.rest = K.rest;
        if (m.gait && m.gait.mode === 'walk') m.gait = { mode: 'stand', t: 0 };
      }
      a1.back = 0;
      return false;
    };
    if (g.over || a1.rest > 0 || dist >= K.near || dist < 0.01 || !g.sees(m.x, m.y, h.x, h.y)) return done();
    a1.back += dt;
    if (a1.back > K.most) return done();
    // BACK AWAY FROM HIM, gliding
    const vx = (m.x - h.x) / dist;
    const vy = (m.y - h.y) / dist;
    const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
    const x0 = m.x;
    const y0 = m.y;
    g.slide(m, Math.min(m.r, 0.42), vx * sp * dt, vy * sp * dt, g.level.walk, true);
    const moved = Math.hypot(m.x - x0, m.y - y0);
    // (the floor holds it: it stands its ground)
    if (moved < sp * dt * 0.3) {
      a1.back = Math.max(a1.back, dt);
      return done();
    }
    m.fx = vx;
    m.fy = vy;
    m.state = 'chase';
    m.anim = 'walk';
    if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
    m.gait.t += moved / GAIT.pace;
    return true;
  },
  start(R, m, a) {
    if (a.id !== 'scribe:flick' || !m.act) return;
    const s = aimed(R, m);
    m.act.x = s.x;
    m.act.y = s.y;
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'scribe:flick') return;
    const g = R.g;
    const act = m.act!;
    const F = SCRIBE.flick;
    // (the spot follows him through the warning, and is held after it)
    if (t0 < F.lock) {
      const s = aimed(R, m);
      act.x = s.x;
      act.y = s.y;
    }
    if (!(t0 < a.hit && t1 >= a.hit)) return;
    // (flicked: the ink leaves the nib for the spot)
    const o = beside(m.x, m.y, m.fx, m.fy, act.hand, F.from[0], F.from[1]);
    R.peril(m, 'act1', act.x, act.y, { a1: 'scribe:ink', hit: F.flight, dur: F.flight + SCRIBE.pool.last, dmg: g.rollMonsterDmg(m) * a.dmg, a: o.x, b: o.y, c: F.from[2] });
    g.sfx('swing', 0.3);
  },
  peril(R: BossRules, p: Peril): void {
    if (p.a1 !== 'scribe:ink' || p.t < p.hit) return;
    const g = R.g;
    const h = g.hero;
    if (!p.done) {
      // (it lands and bursts: whoever it lands on is struck)
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= SCRIBE.splash.r) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      return;
    }
    // (the pool: whoever stands in it is slowed, while he does and a moment after)
    const P = SCRIBE.pool;
    if (g.over || h.move || Math.hypot(h.x - p.x, h.y - p.y) > poolAt(p.t - p.hit)) return;
    h.chill = Math.max(h.chillT > 0 ? h.chill : 0, P.slow);
    h.chillT = Math.max(h.chillT, P.linger);
  },
};
