// ACT 1: THE FIREPOT THROWER (THE CULT, FLOORS 6 TO 10): what it sends across the floor, drawn
// (render/act1_fx/types.ts). Its pot, lobbed (game/act1_rules/firepot.ts, 'firepot:pot'): in flight the art chat's
// own picture of it, lit and tumbling (firepotFlying, FIREPOT_FRAMES a turn, once and a quarter round on its way,
// as the art's film has it), its shadow on the floor under it growing as it comes down (as the Ossuary Golem's
// skull's does); where it comes down, the art's firepotFire: its burst (0 to 3), then the cult's fire burning on
// the floor (4 to 7, round and round), both at ten a second as the art's film plays them, dying down at the end;
// and their own light (the pot's in flight goes with it among the figures).

import { FIREPOT_BURST_FRAMES, FIREPOT_FRAMES, firepotFire, firepotFlying } from '../../art/act1_cultists';
import { lazyFrames } from '../../art/kit';
import type { GameView } from '../../art/skin';
import { drawLights, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { FIREPOT, potAt } from '../../game/act1_rules/firepot';
import { backView, flipped } from '../../game/facing';
import { thrownShadow } from './thrown';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** How many times round the pot turns on its way (the art's film), and the fire's frames a second (its burst's and its burning's). */
const TURNS = 1.25;
const FIRE_FPS = 10;
/** How many frames the fire burning on the floor goes round. */
const BURNING = 4;

const pots: Partial<Record<GameView, Sprite[]>> = {};
let fires: Sprite[] | null = null;

export const FX: Act1Fx = {
  ground(c, m, p) {
    if (!p || p.a1 !== 'firepot:pot' || !c.g) return;
    const g = c.g;
    if (p.t < p.hit) {
      // (its shadow, under it as it flies; darker and as wide as its burst as it comes down)
      const w = potAt(p);
      const [sx, sy] = c.at(w.x, w.y);
      const k = clamp01(p.t / p.hit);
      const widest = FIREPOT.burst.r * 16 * Math.SQRT2;
      thrownShadow(g, sx, sy, 3 + (widest - 3) * k, 0.18 + 0.4 * k);
      return;
    }
    // (burst where it came down, and the floor burning on)
    const i = Math.floor((p.t - p.hit) * FIRE_FPS + 1e-6);
    const f = i < FIREPOT_BURST_FRAMES ? i : FIREPOT_BURST_FRAMES + ((i - FIREPOT_BURST_FRAMES) % BURNING);
    const sp = (fires ??= lazyFrames(FIREPOT_BURST_FRAMES + BURNING, (j) => firepotFire(j)))[f];
    const [sx, sy] = c.at(p.x, p.y);
    const k = clamp01((p.dur - p.t) / FIREPOT.fire.fade);
    const was = g.globalAlpha;
    g.globalAlpha = was * k;
    g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
    // (its own light, the cult's fire, on the floor round it)
    drawLights(g, sp, Math.round(sx), Math.round(sy), 1, k);
    g.globalAlpha = was;
    c.spot(sx, sy - 4, i < FIREPOT_BURST_FRAMES ? 40 : 28, (i < FIREPOT_BURST_FRAMES ? 0.8 : 0.55) * k);
  },
  standing(c, m, p) {
    if (!p || p.a1 !== 'firepot:pot' || p.t >= p.hit) return;
    // (in flight, lit and tumbling; seen from behind when it flies away up the screen, turned over when it flies to the left)
    const w = potAt(p);
    const view: GameView = backView(p.fx, p.fy) ? 'back' : 'front';
    const set = (pots[view] ??= lazyFrames(FIREPOT_FRAMES, (j) => firepotFlying(j / FIREPOT_FRAMES, view)));
    const sp = set[Math.floor(clamp01(p.t / p.hit) * TURNS * FIREPOT_FRAMES) % FIREPOT_FRAMES];
    const [sx, sy] = c.at(w.x, w.y);
    c.stand(w.x + w.y, flipped(p.fx, p.fy) ? flipSprite(sp) : sp, sx, sy - w.z);
    c.spot(sx, sy - w.z, 12, 0.5);
  },
};
