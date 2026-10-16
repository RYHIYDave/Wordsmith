// ACT 1: THE CHANTER (THE CULT, FLOORS 6 TO 10): what it draws beyond its figure (render/act1_fx/types.ts).
// ITS WARD (game/act1_rules/chanter.ts): under each of the cult it shields, the art chat's chantWard (a faint ring
// of the cult's pink marks turning at its feet, eight a second: his pick's "the cultists it shields glow faintly
// pink"), drawn once under each however many chanters shield it. ITS BOLT ('chanter:bolt'): the art's curseBolt in
// flight (a quarter turn a frame, twenty a second, as the art's film turns it), its light, a faint shadow under
// it; where it bursts, the same knot of light going out.

import { BOLT_FRAMES, chantWard, curseBolt } from '../../art/act1_cultists';
import { lazyFrames } from '../../art/kit';
import { drawLights } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { CHANTER, wardOf } from '../../game/act1_rules/chanter';
import type { Monster, Peril } from '../../game/state';
import { thrownShadow } from './thrown';
import type { Act1Fx, Act1FxCtx } from './types';

/** The ward's frames, and how many a second; the bolt's, and how many a second. */
const WARD_FRAMES = 4;
const WARD_FPS = 8;
const BOLT_FPS = 20;

let wards: Sprite[] | null = null;
let bolts: Sprite[] | null = null;

/** The bolt's frame now. */
function boltFrame(p: Peril): Sprite {
  return (bolts ??= lazyFrames(BOLT_FRAMES, (i) => curseBolt(i)))[Math.floor(p.t * BOLT_FPS + 1e-6) % BOLT_FRAMES];
}

/** Whether `m` is the first in the game's list of those whose ward is on `o` (so that its ring is drawn once). */
function firstWard(c: Act1FxCtx, m: Monster, o: Monster): boolean {
  for (const q of c.game.monsters) {
    if (q.kind !== 'chanter' || wardOf(q, o) <= 0) continue;
    return q === m;
  }
  return false;
}

export const FX: Act1Fx = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m) {
      // (its ward, at the feet of each it shields)
      const sp = (wards ??= lazyFrames(WARD_FRAMES, (i) => chantWard(i)))[Math.floor(c.t * WARD_FPS + 1e-6) % WARD_FRAMES];
      for (const o of c.game.monsters) {
        if (!o.seen || wardOf(m, o) <= 0 || !firstWard(c, m, o)) continue;
        const [sx, sy] = c.at(o.x, o.y);
        c.g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
      }
      return;
    }
    if (p && p.a1 === 'chanter:bolt' && !p.done) {
      const [sx, sy] = c.at(p.x, p.y);
      thrownShadow(c.g, sx, sy, 3, 0.22);
    }
  },
  standing(c, m, p) {
    if (!p || p.a1 !== 'chanter:bolt' || p.done) return;
    const sp = boltFrame(p);
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y, sp, sx, sy - p.c);
    c.spot(sx, sy - p.c, 18, 0.5);
  },
  air(c, m, p) {
    if (!p || p.a1 !== 'chanter:bolt' || !p.done || !c.g) return;
    // (burst: the knot of light goes out where it struck)
    const k = 1 - Math.min(1, (p.t - p.hit) / CHANTER.bolt.burst);
    if (k <= 0) return;
    const sp = boltFrame(p);
    const [sx, sy] = c.at(p.x, p.y);
    const was = c.g.globalAlpha;
    c.g.globalAlpha = was * k;
    c.g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy - p.c) - sp.ay, sp.w, sp.h);
    drawLights(c.g, sp, Math.round(sx), Math.round(sy - p.c), 1, k);
    c.g.globalAlpha = was;
    c.spot(sx, sy - p.c, 24, 0.6 * k);
  },
};
