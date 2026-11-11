// ACT 1: THE CANYON SCORPIONS (FLOOR 8): what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
// Its tail strike's jet of venom and its splash are painted in its own picture (art/canyon_scorpions.ts); what is drawn
// here is the warning of it: from as its tail is drawn back until its venom comes down, a ring on the floor where it will
// burst, in the game's way of warning of a blow that comes down on a place (art/boss_shots.ts drawSweepRing: the enemy's
// pink and gold).

import { drawSweepRing } from '../../art/boss_shots';
import { SCORPION, venomAt, GLOB_PERIL, globNow } from '../../game/act1_rules/scorpion';
import { GLOB_CANVAS, POOL_CANVAS, globShadowPainted, makeGlobArt, poolPainted } from '../../art/action_f6_canyon';
import { toSprite } from '../../art/kit';
import { drawLights, drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { keptPictures } from './kept';
import { liveFrom } from './live';

// ITS ACID SPIT (SCORPION_SPIT: art/action_f6_canyon.ts, his yes, 2 Nov 2026; 'scorpion:glob'): the glob in flight, quivering, over its
// shadow; where it will come down, the splash's reach marked, filling; the splash and the pool of acid lying ('floor'), the splash and
// its fumes ('air', by halves), a frame at a time.
let GLOB: Sprite[] | null = null;
const SHADOW = keptPictures<number, Sprite>(true);
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  standing(c, m, p) {
    if (m || !p || p.a1 !== GLOB_PERIL) return;
    const [sx, sy] = c.at(p.x, p.y);
    if (p.t < p.hit) {
      const w = globNow(p);
      const frames = (GLOB ??= makeGlobArt().frames as Sprite[]);
      const [gx, gy] = c.at(w.x, w.y);
      c.stand(w.x + w.y, frames[Math.floor(p.t * 18) % frames.length], gx, gy - w.z);
      return;
    }
    const t = p.t - p.hit;
    const f = `${Math.floor(t * 30)}`;
    const key = `glob:${p.x.toFixed(3)}:${p.y.toFixed(3)}`;
    const behind = liveFrom(`${key}:behind`, f, POOL_CANVAS.ax, POOL_CANVAS.ay, () => poolPainted(t, 'air', 'behind'));
    const before = liveFrom(`${key}:before`, f, POOL_CANVAS.ax, POOL_CANVAS.ay, () => poolPainted(t, 'air', 'before'));
    if (behind) c.stand(p.x + p.y - 0.02, behind, sx, sy);
    if (before) c.stand(p.x + p.y + 0.02, before, sx, sy);
  },
  ground(c, m, p) {
    if (!m && p && p.a1 === GLOB_PERIL && c.g) {
      const [sx, sy] = c.at(p.x, p.y);
      const t = p.t - p.hit;
      const key = `glob:${p.x.toFixed(3)}:${p.y.toFixed(3)}`;
      const s = liveFrom(`${key}:floor`, `${Math.floor(t * 30)}`, POOL_CANVAS.ax, POOL_CANVAS.ay, () => poolPainted(t, 'floor'));
      if (s) {
        drawSprite(c.g, s, sx, sy);
        drawLights(c.g, s, Math.round(sx), Math.round(sy), 1, 1);
      }
      if (p.t < p.hit) {
        const k = Math.round(Math.min(1, p.t / p.hit) * 20);
        let sh = SHADOW.get(k);
        if (!sh) SHADOW.set(k, (sh = toSprite(globShadowPainted(k / 20), null, 25, 13)));
        const w = globNow(p);
        const [gx, gy] = c.at(w.x, w.y);
        drawSprite(c.g, sh, gx, gy);
      }
      return;
    }
    if (!m || !c.g || !m.act || m.act.id !== 'scorpion:sting') return;
    const S = SCORPION.sting;
    const t = m.act.t;
    if (t < S.warnFrom || t >= S.burst) return;
    const v = venomAt(m);
    drawSweepRing(c.g, c.at, v.x, v.y, S.r, (t - S.warnFrom) / (S.burst - S.warnFrom), c.t);
  },
};
