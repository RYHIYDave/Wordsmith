// ACT 2, THE HUSH: FLOOR 13'S BOSS: THE PALIMPSEST: what it does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where its rules put it (game/act1_rules/palimpsest.ts), in the art chat's own pictures of them (art/palimpsest_shots.ts,
// drawn in the game's own pixels):
//   ON THE FLOOR: the slam's ring of warning where its fists will come down, and Paper Cuts' round it as it spreads its arms
//     (the game's way of warning of a blow that falls on a place: art/boss_shots.ts drawSweepRing, the enemy's pink and
//     gold); the slam's splash (drawSlamSplash); ITS PAGES lying where they fell (drawFallenPage), burning where the hero's
//     fire touched them (drawBurningPage: an honest fire's orange, lighting the dark about it), crawling home to it in its
//     Rewrite (drawPageHome), sinking into pulp as it dies; and where each paper bird will strike, its ring of the enemy's
//     pink closing through the last of its dive (drawBirdMark).
//   IN THE AIR: its paper birds (drawLeafBird), waiting their turn where they left its picture, then diving.
// Its whirl of pages, its birds flapping up off it and the pages it soaks up climbing onto it are its own pictures'.

import { drawSweepRing } from '../../art/boss_shots';
import { drawBirdMark, drawBurningPage, drawFallenPage, drawLeafBird, drawPageHome, drawSlamSplash } from '../../art/palimpsest_shots';
import { PA, PAGE, crawlFor, homeOf } from '../../game/act1_rules/palimpsest';
import { beside } from '../../game/facing';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      const act = m.act;
      if (!act || m.state !== 'act') return;
      if (act.id === 'palimpsest:slam' && act.t < PA.slam.land) {
        // THE SLAM'S WARNING: where its fists will come down, as far as the splash strikes, brightening as it holds them up
        const S = PA.slam;
        const o = beside(m.x, m.y, m.fx, m.fy, act.hand, S.at[0], S.at[1]);
        drawSweepRing(g, c.at, o.x, o.y, S.r, clamp01((act.t - S.warnFrom) / (S.land - S.warnFrom - 0.05)), c.t);
      } else if (act.id === 'palimpsest:cuts' && act.t < PA.cuts.tear) {
        // PAPER CUTS' WARNING: round it, as far as the whirl will go, as its pages lift and glint
        const C = PA.cuts;
        drawSweepRing(g, c.at, m.x, m.y, C.outer, clamp01((act.t - C.warn[0]) / (C.tear - C.warn[0] - 0.03)), c.t);
      }
      return;
    }
    if (!p) return;
    if (p.a1 === 'palimpsest:splash') {
      drawSlamSplash(g, c.at, p.x, p.y, p.t);
    } else if (p.a1 === 'palimpsest:page') {
      if (p.t < 0) return;
      const turn = p.a;
      const seed = p.b;
      if (p.done === PAGE.burning) {
        drawBurningPage(g, c.at, p.x, p.y, turn, seed, p.t - p.c);
        // (its flames light the dark about it, an honest fire's orange)
        const [sx, sy] = c.at(p.x, p.y);
        c.spot(sx, sy - 4, 16, 0.5 * (1 - clamp01((p.t - p.c) / PA.pages.burn)));
      } else if (p.done === PAGE.crawling) {
        const home = homeOf(p);
        const since = p.t - p.c - p.d;
        if (!home || since <= 0 || since >= crawlFor(p)) drawFallenPage(g, c.at, p.x, p.y, turn, seed);
        else drawPageHome(g, c.at, p.fx, p.fy, home.x, home.y, turn, seed, since);
      } else if (p.done === PAGE.sinking) {
        const was = g.globalAlpha;
        g.globalAlpha = was * clamp01(1 - (p.t - p.c) / PA.pages.fade);
        drawFallenPage(g, c.at, p.x, p.y, turn, seed);
        g.globalAlpha = was;
      } else drawFallenPage(g, c.at, p.x, p.y, turn, seed);
    } else if (p.a1 === 'palimpsest:bird') {
      // WHERE IT WILL STRIKE: its ring closing over the last of its dive
      if (p.done !== 1) return;
      const left = p.c - p.t;
      if (left <= PA.leaves.mark) drawBirdMark(g, c.at, p.fx, p.fy, 1 - left / PA.leaves.mark);
    }
  },

  air(c, m, p) {
    const g = c.g;
    if (!g || m || !p || p.a1 !== 'palimpsest:bird' || p.done >= 2) return;
    const h = c.game.hero;
    if (p.done === 0) {
      // (waiting its turn where it left its picture, flapping, turned toward the hero)
      drawLeafBird(g, c.at, p.a, p.b, p.d, Math.atan2(h.y - p.b, h.x - p.a), c.t, p.c);
      return;
    }
    // DIVING at where it will strike: down from as high as it left its picture, steeper at the last
    const k = clamp01((p.t - p.hit) / Math.max(1e-6, p.c - p.hit));
    const rise = p.d * (1 - k * k) + 2;
    drawLeafBird(g, c.at, p.x, p.y, rise, Math.atan2(p.fy - p.b, p.fx - p.a), c.t, Math.round(p.a * 7 + p.b * 3));
  },
};
