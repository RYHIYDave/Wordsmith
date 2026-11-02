// ACT 1: THE DROWNED (FLOOR 10, THE SUNKEN FEN): its rules (game/act1_rules/types.ts).
//
// His design doc: "The Drowned | Small | Corpses that rise from the water and grab you, slowing you down." The art
// chat's pictures, each with his yes (art/drowned.ts; 15 Oct, by 23:32, "Yes, as shown (Recommended)"): rising out of
// the water (1.9 s, up by 1.05 s); its shamble, painted for 0.7 tiles a second; its drowning grab, its hands clutching
// 0.667 s in, before it (about a tile: where its picture's hands are), dragging you down to 1.05 s. Small: one attack.
//
// WHAT IT DOES BEYOND ITS BLOW:
// - IT LIES UNDER THE WATER until it wakes (Monster.a1.under: 1). As it comes into the world it is laid by the water's
//   edge where the floor has water near (within `water.near` tiles: a tile of the fen's ground beside its water), and
//   lies there unseen (its picture is its rise's first, all under the water), not to be struck. As it wakes, its first
//   act is to RISE OUT OF THE WATER (`drowned:rise`, a forced act: its rise picture played whole); it may be struck
//   from when it is up (`rise.up`).
// - ITS GRAB SLOWS YOU, by the game's own chill on the hero (Hero.chill, Hero.chillT: as a blow of frost slows him),
//   `grab.slow` of his pace for `grab.secs`.
//
// Every number here that is a picture's is written down here; tests/act1_drowned.test.ts holds it to the art.

import { DROWNED_RETCH, FROST, GRAB9, GRAB_HIT, RETCH, RETCH_HIT, SLICK, inCone } from '../../art/action_f9_fen';
import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import { backView, flipped } from '../facing';
import type { Monster } from '../state';
import { T_FLOOR, T_PIT } from '../types';
import type { Act1Rules } from './types';

/** THE DROWNED'S NUMBERS (tiles, seconds of its pictures). */
export const DROWNED = {
  /** Rising out of the water: how long (DR_RISE.long), and when it is up (DR_RISE.up): it may be struck from then. */
  rise: { long: 1.9, up: 1.05 },
  /** Its grab: its hands clutch at `hit` (DR_GRAB.hit, frame 20 of 30), `reach` tiles before it (where its picture's hands are then), in a strip `half` to either side; the hero slowed by `slow` of his pace for `secs`. */
  grab: { hit: 20 / 30, reach: 1.06, half: 0.55, slow: 0.4, secs: 2.0 },
  /** How far it is laid from where it came into the world, to lie by the water's edge. */
  water: { near: 3.5 },
};

/** Its shamble, painted for 0.7 tiles a second; it stops at any frame of it, as the game's monsters on the bones always have. */
const GAIT: GaitDef = { pace: 0.7, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.9, slack: 0.2, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'drowned:grab', clip: 'attack', long: 1.6, hit: DROWNED.grab.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 1.15 },
  { id: 'drowned:rise', clip: 'rise', long: DROWNED.rise.long, hit: DROWNED.rise.up, dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 0, forced: true },
];

/**
 * ITS BOG RETCH AND ITS FROST GRAB (the art chat's art/action_f9_fen.ts behind DROWNED_RETCH, his yes there; his picks of 31 Oct: the
 * retch, “something that, like, takes away space”, and for frost, “The Drowned, 10”):
 *   grab   its hands clutch shut at GRAB_HIT on a strip GRAB9.fwd before it, GRAB9.half to either side: struck, and slowed as before;
 *          and a hero within FROST.r of where they close (FROST.at before it) is FROZEN IN PLACE for FROST.hold (Hero.iceT: he
 *          neither walks nor dodges), the rime racing out there ('drowned:rime': `d` 1 if he was frozen, `b`, `c` where he stood)
 *   retch  it rears up, the cone it will cover marked on the floor before it from RETCH.mark into it (0.53 s before it retches); at RETCH_HIT the gush
 *          is thrown out over the cone and comes down SLICK.lands after: a hero in the cone then is struck; it lies there as A SLICK
 *          for SLICK.stays (shrinking over its last SLICK.fade): whoever wades in it is slowed to SLICK.slow of his pace and stung,
 *          SLICK_STING.share of its blow every SLICK_STING.every ('drowned:slick', its clock from the retch; `b` when it may sting
 *          again). The cone is drawn from in front or behind as the Drowned is (one of the floor's four ways), so it retches straight
 *          along the way its picture faces, the way nearest him (`start`).
 */
export const RIME_PERIL = 'drowned:rime';
export const SLICK_PERIL = 'drowned:slick';
export const SLICK_STING = { share: 0.3, every: 0.5 };
const RETCH_ACTS: readonly ActDef[] = [
  { id: 'drowned:grab', clip: 'attack', long: GRAB9.long, hit: GRAB_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: GRAB9.fwd[1] },
  { id: 'drowned:retch', clip: 'retch', long: RETCH.long, hit: RETCH_HIT, dmg: 1, cooldown: 7, first: 2, after: 0.6, near: SLICK.near, far: SLICK.far },
  ACTS[1],
];
/** The way its picture faces (one of the floor's four, as backView and flipped choose it): the way the cone is drawn. */
export function axisOf(fx: number, fy: number): [number, number] {
  const back = backView(fx, fy);
  const flip = flipped(fx, fy);
  return back ? (flip ? [-1, 0] : [0, -1]) : flip ? [0, 1] : [1, 0];
}
/** How far the slick reaches now (tiles), `s` seconds after the gush came down: spread out, lying, shrinking. */
export function slickReach(s: number): number {
  if (s < 0) return 0;
  const grow = 1 - (1 - Math.min(1, s / SLICK.spread)) ** 2;
  const k = Math.max(0, Math.min(1, (s - (SLICK.stays - SLICK.fade)) / SLICK.fade));
  const shrink = 1 - k * k * (3 - 2 * k);
  return SLICK.long * grow * (0.2 + 0.8 * shrink);
}

/** Is it under the water (not yet risen, or rising and not yet up)? */
export function underWater(m: Monster): boolean {
  return !!m.a1 && (m.a1.under ?? 0) > 0;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  get acts() {
    return DROWNED_RETCH.on ? RETCH_ACTS : ACTS;
  },
  spawned(R, m) {
    m.a1 = { under: 1 };
    // (by the water's edge where the floor has water near: the nearest tile of ground beside the water, not taken by another of them)
    const g = R.g;
    const f = g.level.floor;
    const W = f.w;
    const N = DROWNED.water.near;
    const pit = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_PIT;
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (let ty = Math.floor(m.y - N); ty <= Math.floor(m.y + N); ty++) {
      for (let tx = Math.floor(m.x - N); tx <= Math.floor(m.x + N); tx++) {
        if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || f.tiles[ty * W + tx] !== T_FLOOR) continue;
        if (!pit(tx + 1, ty) && !pit(tx - 1, ty) && !pit(tx, ty + 1) && !pit(tx, ty - 1)) continue;
        const x = tx + 0.5;
        const y = ty + 0.5;
        const d = Math.hypot(x - m.x, y - m.y);
        if (d > N || d >= bestD || !g.free(g.level.walk, x, y, m.r)) continue;
        if (g.monsters.some((o) => o !== m && !o.dead && o.kind === 'drowned' && Math.hypot(o.x - x, o.y - y) < 0.9)) continue;
        best = { x, y };
        bestD = d;
      }
    }
    if (best) {
      m.x = best.x;
      m.y = best.y;
    }
  },
  forced(_R, m, acts) {
    return m.a1 && m.a1.under === 1 ? acts.findIndex((a) => a.id === 'drowned:rise') : -1;
  },
  start(_R, m, a) {
    if (a.id === 'drowned:rise' && m.a1) m.a1.under = 2;
    // (its retch straight along the way its picture faces)
    if (a.id === 'drowned:retch') [m.fx, m.fy] = axisOf(m.fx, m.fy);
  },
  end(_R, m, a) {
    if (a.id === 'drowned:rise' && m.a1) m.a1.under = 0;
  },
  reachable(m) {
    return !underWater(m);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'drowned:rise') {
      // (up out of the water: from now it may be struck)
      if (at(DROWNED.rise.up) && m.a1) m.a1.under = 0;
      return;
    }
    if (a.id === 'drowned:retch') {
      // (the cone marked before it, the gush, the slick: 'drowned:slick', its clock from the retch)
      if (at(RETCH.mark)) R.peril(m, 'act1', m.x, m.y, { a1: SLICK_PERIL, t: -(RETCH_HIT - RETCH.mark), hit: SLICK.lands, dur: SLICK.lands + SLICK.stays, dmg: g.rollMonsterDmg(m) * a.dmg, a: m.id });
      if (at(a.hit)) g.sfx('wave', 0.5);
      return;
    }
    if (DROWNED_RETCH.on && a.id === 'drowned:grab') {
      if (!at(a.hit)) return;
      // (its hands clutch shut: whoever they close on is struck and slowed; whoever is in the rime as it races out, frozen in place)
      const r = R.rel(m);
      const free = !h.move && h.invuln <= 0 && !g.over;
      if (free && r.fwd >= GRAB9.fwd[0] - TUNE.heroRadius * 0.5 && r.fwd <= GRAB9.fwd[1] + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= GRAB9.half) {
        R.blow(m, a.dmg);
        h.chill = Math.max(h.chillT > 0 ? h.chill : 0, DROWNED.grab.slow);
        h.chillT = Math.max(h.chillT, DROWNED.grab.secs);
      }
      const px = m.x + m.fx * FROST.at;
      const py = m.y + m.fy * FROST.at;
      const frozen = free && Math.hypot(h.x - px, h.y - py) <= FROST.r + TUNE.heroRadius * 0.5;
      if (frozen) {
        h.iceT = FROST.hold;
        g.emit({ t: 'text', x: h.x, y: h.y, text: 'Frozen', color: '#ff8a80' });
      }
      R.peril(m, 'act1', px, py, { a1: RIME_PERIL, dur: FROST.seen, d: frozen ? 1 : 0, b: h.x, c: h.y });
      g.sfx('frost', 0.5);
      return;
    }
    if (a.id !== 'drowned:grab' || !at(a.hit)) return;
    // (its hands clutch shut before it: whoever they close on is grabbed, and dragged, slowed)
    const G = DROWNED.grab;
    const r = R.rel(m);
    if (r.fwd > -0.2 && r.fwd <= G.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= G.half && !h.move && h.invuln <= 0 && !g.over) {
      R.blow(m, a.dmg);
      h.chill = Math.max(h.chillT > 0 ? h.chill : 0, G.slow);
      h.chillT = Math.max(h.chillT, G.secs);
      g.emit({ t: 'text', x: h.x, y: h.y, text: 'Grabbed', color: '#ff8a80' });
    }
    g.sfx('swing', 0.35);
  },
  peril(R, p, dt) {
    if (p.a1 !== SLICK_PERIL) return;
    const g = R.g;
    const h = g.hero;
    if (p.t < 0) {
      // (marked, not yet retched: gone if it is stopped first)
      const m = g.monsters.find((o) => o.id === p.a);
      if (!m || m.dead || m.state !== 'act' || m.act?.id !== 'drowned:retch') p.dur = p.t;
      return;
    }
    const dx = h.x - p.x;
    const dy = h.y - p.y;
    const along = dx * p.fx + dy * p.fy;
    const aside = -dx * p.fy + dy * p.fx;
    const free = !h.move && h.invuln <= 0 && !g.over;
    // (the gush comes down over the cone: whoever is in it is struck)
    if (p.done === 0 && p.t >= SLICK.lands) {
      p.done = 1;
      p.b = p.t + SLICK_STING.every;
      if (free && inCone(along, aside, SLICK.long + TUNE.heroRadius * 0.5)) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      return;
    }
    if (p.done === 0) return;
    // (the slick: whoever wades in it is slowed, and stung)
    const reach = slickReach(p.t - SLICK.lands);
    if (reach <= SLICK.from || !inCone(along, aside, reach)) return;
    h.slowT = Math.max(h.slowT ?? 0, 0.12);
    h.slowBy = Math.max((h.slowT ?? 0) > 0.12 ? h.slowBy ?? 0 : 0, 1 - SLICK.slow);
    if (p.t >= p.b && free) {
      p.b = p.t + SLICK_STING.every;
      g.hurtHero(p.dmg * SLICK_STING.share, p.el, p.words, null, p.from, p.x, p.y, p.half);
    }
    void dt;
  },
};

/** Its switch, for game/enemy_moves.ts (the new enemy moves of floors 5 to 19 switched on together). */
export { DROWNED_RETCH };
