// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE SHADOWS OF THE FOUR ROYALS: what they do, drawn (render/act1_fx/
// types.ts). Their blows are in their own pictures (art/act1_figs/rshadow.ts); here, from the art chat's (art/royal_shadows_fx.ts):
// - THE PRINCESS'S SNARE, its vines bursting up round where he stood and holding, sinking (snareFx), its round marked before;
// - THE PRINCE'S MASKS, three flung in a fan and bursting into fog (masksFx), drawn along the way his picture faces;
// - THE KING'S CHARGE, its line of sparks where it ran (sparksFx), under the figures, from its setting off;
// - THE KING'S CROWN'S WEIGHT, the shadow crown flown out over him, following, held, dropped, lying, home (weightFx: its 'floor',
//   the warning ring and the slam, under the figures; its 'crown' over them), at the floor point the rules move under it;
// - THEIR WARNINGS through each wind-up, in the enemy's pink: the lash's quarter turn, the thrust's line, the comb's stab, the
//   charge's way, the masks' three lines. (The Queen's blink warns in her own picture: her mirror's glass flashing; the crown's in
//   its own ring.)
import { toSprite } from '../../art/kit';
import { KG_CHARGE, KG_WEIGHT } from '../../art/king_moves';
import { PC_MASKS, PC_THRUST } from '../../art/prince_moves';
import { PR_LASH, PR_SNARE } from '../../art/princess_moves';
import { QN_COMB } from '../../art/queen_moves';
import type { Frame } from '../../art/royal_shadows';
import { masksFx, snareFx, sparksFx, weightFx, SHADOW_CHARGE, SHADOW_SNARE } from '../../art/royal_shadows_fx';
import { WEIGHT_FX } from '../../art/king_fx';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { SHADOW_TUNE, chargeLine, crownPoint } from '../../game/act1_rules/rshadow';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
function made(key: string, flip: boolean, make: () => Frame): Sprite {
  const k = `${key}:${flip ? 1 : 0}`;
  let s = MADE.get(k);
  if (!s) {
    if (flip) s = flipSprite(made(key, false, make));
    else {
      const f = make();
      s = toSprite({ px: f.px, lights: [] }, null, f.ax, f.ay);
    }
    MADE.set(k, s);
  }
  return s;
}
const D = Math.PI / 180;

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) {
      const a = m.act;
      const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: a.hand };
      const T = SHADOW_TUNE;
      let k: number;
      switch (a.id) {
        case 'rshadow:lash':
          if ((k = warnK(a.t, PR_LASH.warn[0] - 0.15, PR_LASH.hit)) >= 0) drawFanWarn(c.g, c.at, w, -T.lash.half, T.lash.half, T.lash.reach, k, c.t);
          break;
        case 'rshadow:thrust':
          if ((k = warnK(a.t, PC_THRUST.warn[0] - 0.15, PC_THRUST.hit)) >= 0) drawStripWarn(c.g, c.at, w, 0.2, T.thrust.reach, -T.thrust.half, T.thrust.half, k, c.t);
          break;
        case 'rshadow:comb':
          if ((k = warnK(a.t, QN_COMB.warn[0] - 0.15, QN_COMB.hit)) >= 0) drawFanWarn(c.g, c.at, w, -T.comb.half, T.comb.half, T.comb.reach, k, c.t);
          break;
        case 'rshadow:charge': {
          // (the way it will run, through its bracing; then its line of sparks where it ran, bursting)
          if ((k = warnK(a.t, KG_CHARGE.warn[0], KG_CHARGE.run[0])) >= 0) drawStripWarn(c.g, c.at, w, 0, SHADOW_CHARGE.most, -0.45, 0.45, k, c.t);
          const L = chargeLine(m);
          if (L && a.t >= KG_CHARGE.run[0] && a.t < T.charge.lies) {
            const f = Math.floor((a.t - KG_CHARGE.run[0]) * FPS);
            const back = L.fx + L.fy < -0.2;
            const flip = L.fx - L.fy < 0;
            const lane = Math.round(L.lane * 4) / 4;
            const sp = made(`sparks:${f}:${back ? 1 : 0}:${lane}`, flip, () => sparksFx(f / FPS, back ? 'back' : 'front', lane));
            const [sx, sy] = c.at(L.x, L.y);
            c.g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
          }
          break;
        }
        case 'rshadow:weight': {
          // (what the shadow crown lays on the floor under it: its shadow, the warning ring round where it will fall, the slam)
          const P = crownPoint(m);
          const tc = a.t - KG_WEIGHT.send;
          if (P && tc >= 0 && tc < WEIGHT_FX.long) {
            const f = Math.floor(tc * FPS);
            const back = m.fx + m.fy < -0.2;
            const flip = m.fx - m.fy < 0;
            const sp = made(`wfloor:${f}:${back ? 1 : 0}`, flip, () => weightFx(f / FPS, back ? 'back' : 'front', 'floor'));
            const [sx, sy] = c.at(P.x, P.y);
            c.g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
          }
          break;
        }
        case 'rshadow:masks':
          if ((k = warnK(a.t, PC_MASKS.warn[0] - 0.15, PC_MASKS.hit)) >= 0) {
            for (const deg of T.masks.ways) {
              const r = deg * D;
              drawStripWarn(c.g, c.at, { ...w, fx: m.fx * Math.cos(r) - m.fy * Math.sin(r), fy: m.fx * Math.sin(r) + m.fy * Math.cos(r) }, 0.3, T.masks.reach, -0.35, 0.35, k, c.t);
            }
          }
          break;
      }
    }
    // (the snare's round, from the warning's end to its burst)
    if (p && p.a1 === 'rshadow:snare' && p.t < 0) {
      const k = Math.min(1, 1 + p.t / (PR_SNARE.hit - PR_SNARE.warn[1]));
      drawFanWarn(c.g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, SHADOW_TUNE.snare.r - 0.3, k, c.t);
    }
  },
  standing(c, m, p) {
    // (THE SHADOW CROWN in the air, over the figures, at the floor point under it)
    if (m && m.act && m.act.id === 'rshadow:weight' && !p) {
      const P = crownPoint(m);
      const tc = m.act.t - KG_WEIGHT.send;
      if (P && tc >= 0 && tc < WEIGHT_FX.long) {
        const f = Math.floor(tc * FPS);
        const back = m.fx + m.fy < -0.2;
        const flip = m.fx - m.fy < 0;
        const [sx, sy] = c.at(P.x, P.y);
        c.stand(P.x + P.y + 1.5, made(`wcrown:${f}:${back ? 1 : 0}`, flip, () => weightFx(f / FPS, back ? 'back' : 'front', 'crown')), sx, sy);
      }
    }
    if (!p) return;
    const [sx, sy] = c.at(p.x, p.y);
    if (p.a1 === 'rshadow:snare' && p.t >= 0 && p.t <= SHADOW_SNARE.long) {
      const k = Math.floor(p.t * FPS);
      c.stand(p.x + p.y + 0.02, made(`snare:${k}`, false, () => snareFx(k / FPS, 'front')), sx, sy);
    } else if (p.a1 === 'rshadow:masks') {
      const k = Math.floor(p.t * FPS);
      const back = p.fx + p.fy < -0.2;
      const flip = p.fx - p.fy < 0;
      c.stand(p.x + p.y + 0.3, made(`masks:${k}:${back ? 1 : 0}`, flip, () => masksFx(k / FPS, back ? 'back' : 'front')), sx, sy);
    }
  },
};
