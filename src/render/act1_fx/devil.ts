// ACT 1: THE DUST DEVIL (FLOOR 8): what it draws beyond its figure (render/act1_fx/types.ts). Its lash is all in its own pictures.
// ITS TWISTER (DEVIL_TWISTER: art/action_f6_canyon.ts, his yes, 2 Nov 2026; game/act1_rules/devil.ts 'devil:twister'): under it, the
// sand swirling in over the floor as far as it drags (swirlPainted, its reach a faint ring of the enemy's pink) and where each bolt
// will strike, crackling first; the bolts thrown out of it onto the floor (layTwisterBolts), a frame at a time.

import { DEVIL_TWISTER, SWIRL_CANVAS, layTwisterBolts, swirlPainted } from '../../art/action_f6_canyon';
import { drawLights, drawSprite } from '../../engine/px';
import { livePicture } from './live';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !DEVIL_TWISTER.on || !m.act || m.act.id !== 'devil:twister') return;
    const t = m.act.t;
    const C = SWIRL_CANVAS;
    const s = livePicture(`devil:${m.id}`, C.w, C.h, C.ax, C.ay, `${Math.floor(t * 30)}`, (px) => {
      px.d.set(swirlPainted(t).px.d);
      layTwisterBolts(px, C.ax, C.ay, t);
    });
    if (!s) return;
    const [sx, sy] = c.at(m.x, m.y);
    drawSprite(c.g, s, sx, sy);
    drawLights(c.g, s, Math.round(sx), Math.round(sy), 1, 1);
  },
};
