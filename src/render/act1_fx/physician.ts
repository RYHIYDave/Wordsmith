// ACT 2, THE HUSH: FLOOR 14'S BOSS: THE PHYSICIAN: what he does to the floor, takes and sends across it, drawn (render/act1_fx/types.ts),
// from the art chat's (art/physician.ts, physician_moves.ts, physician_shots.ts), where his rules (game/act1_rules/physician.ts)
// have it. Only what his own pictures do not paint (they paint his cane, his syringe filling pink, his phials in his hand
// until they are flung, the words of the city rising out of him as he dies):
//   ON THE FLOOR: through the Draw's warning, the line of the enemy's pink along the floor the way his lunge will go
//     (drawDrawAim); where his cane's ferrule strikes the boards in his rap (drawCaneRap); the ring of the Hush rolling out
//     from each rap of his Rounds (drawRoundsRing).
//   OVER WHAT STANDS: his phials in flight, tumbling over their arc (drawPhialFlight), and where each lands, its smash and
//     the cloud of the Hush welling up and lying there, dithered so that whoever stands in it shows through
//     (drawHushCloud); THE WORD HE HOLDS of the hero's, hanging over his head from as he pushes the plunger home, its own
//     rune burning the enemy's pink, so that the hero sees which (drawHeldWord), a light of it in the dark; and the word
//     beaten back out of him, flying home to the hero, taking its own colour again as it comes (drawWordFreed).
// Every colour is the art's: the enemy's pink and gold, the Hush's greys, the tonic's pale green. Never cyan: a word of the
// hero's takes its own colour only as it comes home to him.

import { drawCaneRap, drawDrawAim, drawHeldWord, drawHushCloud, drawPhialFlight, drawRoundsRing, drawWordFreed } from '../../art/physician_shots';
import { PHYSICIAN, heldWord, quillSpot } from '../../game/act1_rules/physician';
import { HELD_WORD_IDS } from '../../game/types';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/**
 * How high the word he holds hangs while he carries words to leave at his death (game pixels over his floor point): clear
 * of their rune stones (render.ts: a boss's hang from the top of his head (art/act1_figs/physician.ts, 35) six and thirteen
 * up, fourteen tall, bobbing a pixel and a half), its pink ring (eight either way) a pixel or two over them.
 */
const STONES = 35 + 6 + 13 + 1 + 1.5 + 8 + 2;

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // THE DRAW'S WARNING: the line his lunge will go, from his feet to where the quill will reach
      const act = m.act;
      const D = PHYSICIAN.draw;
      if (!act || act.id !== 'physician:draw' || act.t < D.warn[0] || act.t >= D.hit) return;
      const k = clamp01((act.t - D.warn[0]) / (D.warn[1] - D.warn[0]));
      const q = quillSpot(m, act.hand);
      drawDrawAim(g, c.at, m.x, m.y, q.x, q.y, k, c.t);
      return;
    }
    if (!p) return;
    if (p.a1 === 'physician:rap') drawCaneRap(g, c.at, p.x, p.y, p.t);
    else if (p.a1 === 'physician:ring') drawRoundsRing(g, c.at, p.x, p.y, p.t);
  },

  air(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // THE WORD HE HOLDS, over his head, from as it came up out of his quill
      const w = heldWord(m);
      const upT = m.a1?.upT ?? -1;
      if (!w || upT < 0) return;
      const [sx, sy] = c.at(m.x, m.y);
      // (HELD_WORD_UP over his floor point; above the rune stones of the words his death will leave, where he carries any,
      // so that neither hides the other: render.ts hangs those just over the top of his head)
      const up = c.game.wordsCarried(m).length ? Math.max(PHYSICIAN.draw.up, STONES) : PHYSICIAN.draw.up;
      const y = sy - up;
      drawHeldWord(g, sx, y, w, c.game.time - upT);
      c.spot(sx, y, 22, 0.7);
      return;
    }
    if (!p) return;
    if (p.a1 === 'physician:phial') {
      if (p.t < p.hit) {
        drawPhialFlight(g, c.at, p.a, p.b, p.x, p.y, p.t, p.c);
        return;
      }
      // (its maker dead, it thins away from then: its last 1.2 s, `d` the moment he died)
      let u = p.t - p.hit;
      if (p.d > 0) u = Math.max(u, PHYSICIAN.tonic.cloud.long - 1.2 + (p.t - p.d));
      drawHushCloud(g, c.at, p.x, p.y, u, p.c);
    } else if (p.a1 === 'physician:freed') {
      // (beaten out of him: from over his head home to the hero)
      const w = HELD_WORD_IDS[p.a];
      if (!w) return;
      const [x0, y0] = c.at(p.x, p.y);
      const h = c.game.hero;
      const [x1, y1] = c.at(h.x, h.y);
      drawWordFreed(g, x0, y0 - (p.b ? Math.max(PHYSICIAN.draw.up, STONES) : PHYSICIAN.draw.up), x1, y1 - 18, w, p.t);
    }
  },
};
