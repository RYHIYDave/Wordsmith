// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE SILENT ORDER'S SCRIBES: what it sends across the floor, drawn
// (render/act1_fx/types.ts), all of it the art chat's own, drawn in the game's own pixels (art/scribe_shots.ts):
// - THE WARNING: from as the quill is dipped until the ink leaves it, a pink ring closing in on the spot it will land on
//   (drawInkMark; the spot as the rules hold it, game/act1_rules/scribe.ts: the hero followed until the warning is done,
//   then held); while the ink is in the air, the ring closed, on the spot;
// - THE INK IN FLIGHT ('scribe:ink'): the gob in its arc from the nib to the spot, droplets trailing (drawInkFlight, over
//   what stands);
// - WHERE IT LANDS: its splash, and the pool of wet black ink on the floor, shrinking and drying away (drawInkSplat).
// What glints on it is the enemy's pink; nothing cyan. It gives no light of its own (none is drawn for it).

import { drawInkFlight, drawInkMark, drawInkSplat } from '../../art/scribe_shots';
import { SCRIBE } from '../../game/act1_rules/scribe';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    const F = SCRIBE.flick;
    if (m) {
      // (the ring closing, through the flick until the ink leaves the nib: the ink's own after)
      const a = m.act;
      if (m.state !== 'act' || !a || a.id !== 'scribe:flick' || a.t <= F.mark || a.t >= F.hit) return;
      drawInkMark(c.g, c.at, a.x, a.y, (a.t - F.mark) / (F.hit - F.mark), c.t);
      return;
    }
    if (!p || p.a1 !== 'scribe:ink') return;
    if (p.t < p.hit) drawInkMark(c.g, c.at, p.x, p.y, 1, c.t);
    else drawInkSplat(c.g, c.at, p.x, p.y, p.t - p.hit);
  },
  air(c, m, p) {
    if (!p || p.a1 !== 'scribe:ink' || !c.g || p.t >= p.hit) return;
    // (in the air: from the nib, so high, to the spot)
    drawInkFlight(c.g, c.at, p.a, p.b, p.c, p.x, p.y, p.t);
  },
};
