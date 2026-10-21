// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS: THE SCRAPER: what it does to the floor, drawn (render/act1_fx/types.ts), where its
// rules put it (game/act1_rules/scraper.ts), in the art chat's own pictures of them (art/pair_shots.ts, in the game's own
// pixels), which are its hit areas (his word: “make the hit boxes on the attacks, and the attacks themselves big”):
//   ITS WARNINGS, through each move's warning to its blow: the ring where its claw will snap, the fan it will scour, the lane
//     behind it it will rush down, the strip it will scrape.
//   WHAT IT LEAVES: the snap's splash and cracks, the fan scraped raw, the rush's wake ploughed up; THE STRIP lying bare, the
//     Quill's writing laid along it as it swoops, and its burst, a wall of ink running along it from its far end.
//   WRITTEN OVER (over it, in the air): while the Quill writes over its wounds, the Order's fresh writing crawling over its
//     back in the enemy's pink (drawOverwriting).

import { drawOverwriting, drawRushWake, drawRushWarn, drawScour, drawScourWarn, drawSnap, drawSnapWarn, drawStrip, drawStripBurst, drawStripWarn, STRIP_BURST_RUN } from '../../art/pair_shots';
import { RUSH_TILES, SR_RUSH, SR_SCOUR, SR_SNAP, SR_STRIP } from '../../art/scraper';
import { partnerOf } from '../../game/act1_rules/pair';
import { keptOf } from '../../game/act1_rules/scraper';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
/** How far through a warning from its start `from` to its blow `to`, `t` seconds in (0 before it, 1 at the blow). */
const through = (t: number, from: number, to: number): number => clamp01((t - from) / Math.max(1e-6, to - from));

/** How high its back is over its floor point on the screen (game pixels), where the Quill's writing is drawn. */
const BACK = 18;

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      const act = m.act;
      if (!act || m.state !== 'act') return;
      const t = act.t;
      if (act.id === 'scraper:snap' && t < SR_SNAP.hit) drawSnapWarn(g, c.at, m.x, m.y, m.fx, m.fy, Math.max(0.02, through(t, 0.04, SR_SNAP.hit)));
      else if (act.id === 'scraper:scour' && t < SR_SCOUR.slam) drawScourWarn(g, c.at, m.x, m.y, m.fx, m.fy, Math.max(0.02, through(t, 0.1, SR_SCOUR.slam)));
      else if (act.id === 'scraper:rush' && t < SR_RUSH.go) drawRushWarn(g, c.at, act.x, act.y, m.fx, m.fy, Math.max(0.02, through(t, 0.05, SR_RUSH.go)));
      else if (act.id === 'scraper:strip' && t < SR_STRIP.slam) drawStripWarn(g, c.at, m.x, m.y, m.fx, m.fy, Math.max(0.02, through(t, 0.1, SR_STRIP.slam)));
      return;
    }
    if (!p) return;
    if (p.a1 === 'scraper:snap') drawSnap(g, c.at, p.x, p.y, p.fx, p.fy, p.t);
    else if (p.a1 === 'scraper:scour') drawScour(g, c.at, p.x, p.y, p.fx, p.fy, p.t);
    else if (p.a1 === 'scraper:rush') {
      const run = SR_RUSH.stop - SR_RUSH.go;
      drawRushWake(g, c.at, p.x, p.y, p.fx, p.fy, p.t, RUSH_TILES * sm(Math.min(p.t, run) / run));
    } else if (p.a1 === 'scraper:strip') {
      // (bare, then written as the Quill swoops down it; bursting; or, never written, fading)
      if (p.done === 1) {
        const since = p.t - p.c;
        if (since < STRIP_BURST_RUN) drawStrip(g, c.at, p.x, p.y, p.fx, p.fy, p.t, 1);
        drawStripBurst(g, c.at, p.x, p.y, p.fx, p.fy, since);
      } else if (p.done === 2) {
        const was = g.globalAlpha;
        g.globalAlpha = was * clamp01(1 - (p.t - p.c) / 1.2);
        drawStrip(g, c.at, p.x, p.y, p.fx, p.fy, p.t, p.b);
        g.globalAlpha = was;
      } else drawStrip(g, c.at, p.x, p.y, p.fx, p.fy, p.t, p.b);
    }
  },

  air(c, m) {
    const g = c.g;
    if (!g || !m || m.kind !== 'scraper' || m.dead) return;
    // WRITTEN OVER: the Quill's fresh writing crawling over its back
    if (!keptOf(m).written) return;
    const q = partnerOf(c.game, m);
    const t = q && q.act && q.act.id === 'quill:write' ? q.act.t : 0;
    const [sx, sy] = c.at(m.x, m.y);
    drawOverwriting(g, sx, sy - BACK, t);
  },
};
