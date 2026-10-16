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

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
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

/** Is it under the water (not yet risen, or rising and not yet up)? */
export function underWater(m: Monster): boolean {
  return !!m.a1 && (m.a1.under ?? 0) > 0;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
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
};
