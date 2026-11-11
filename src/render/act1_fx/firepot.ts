// ACT 1: THE FIREPOT THROWER (THE CULT, FLOORS 6 TO 10): what it sends across the floor, drawn
// (render/act1_fx/types.ts). Its pot, lobbed (game/act1_rules/firepot.ts, 'firepot:pot'): in flight the art chat's
// own picture of it, lit and tumbling (firepotFlying, FIREPOT_FRAMES a turn, once and a quarter round on its way,
// as the art's film has it), its shadow on the floor under it growing as it comes down (as the Ossuary Golem's
// skull's does); where it comes down, the art's firepotFire: its burst (0 to 3), then the cult's fire burning on
// the floor (4 to 7, round and round), both at ten a second as the art's film plays them, dying down at the end;
// and their own light (the pot's in flight goes with it among the figures).

import { FIREPOT_BURST_FRAMES, FIREPOT_FRAMES, firepotFire, firepotFlying } from '../../art/act1_cultists';
import { BLAZE, FIRE_CANVAS, FIREPOT_BLAZE, blazePainted, makeFlyingPotArt, potShadowPainted } from '../../art/action_f6_cult';
import { markRing } from '../../art/action_f6_fx';
import { toSprite } from '../../art/kit';
import { drawSprite } from '../../engine/px';
import { keptPictures } from './kept';
import { livePicture, liveFrom } from './live';
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

// THE LOB MADE BIG (FIREPOT_BLAZE: art/action_f6_cult.ts, his yes, 2 Nov 2026): its shadow growing under it and the reach of its
// burst marked where it will come down, filling as it comes; the pot tumbling; the whoosh as it lands ('air', by halves, before and
// behind a figure there) and the floor burning ('floor'), painted afresh a frame at a time (render/act1_fx/live.ts).
const SHADOWS = keptPictures<number, Sprite>(true);
let BIG: Partial<Record<GameView, Sprite[]>> = {};
const BLAZE_FX: Act1Fx = {
  ground(c, m, p) {
    if (!p || p.a1 !== 'firepot:pot' || !c.g) return;
    const g = c.g;
    const key = `pot:${p.x.toFixed(3)}:${p.y.toFixed(3)}`;
    const [lx, ly] = c.at(p.x, p.y);
    if (p.t < p.hit) {
      // (the reach of its burst marked where it will come down, filling as it comes; its shadow under it)
      const k = clamp01(p.t / p.hit);
      const C = FIRE_CANVAS;
      const mark = livePicture(`${key}:mark`, C.w, C.h, C.ax, C.ay, `${Math.floor(k * 24)}`, (px) => markRing(px, C.ax, C.ay, BLAZE.r, k));
      if (mark) drawSprite(g, mark, lx, ly);
      const w = potAt(p);
      const [sx, sy] = c.at(w.x, w.y);
      const q = Math.round(k * 24);
      let sh = SHADOWS.get(q);
      if (!sh) SHADOWS.set(q, (sh = toSprite(potShadowPainted(q / 24), null, 30, 15)));
      drawSprite(g, sh, sx, sy);
      return;
    }
    const s = liveFrom(`${key}:floor`, `${Math.floor((p.t - p.hit) * 30)}`, FIRE_CANVAS.ax, FIRE_CANVAS.ay, () => blazePainted(p.t - p.hit, 'floor'));
    if (!s) return;
    drawSprite(g, s, lx, ly);
    drawLights(g, s, Math.round(lx), Math.round(ly), 1, 1);
    c.spot(lx, ly - 4, 40, 0.6);
  },
  standing(c, m, p) {
    if (!p || p.a1 !== 'firepot:pot') return;
    if (p.t < p.hit) {
      const w = potAt(p);
      const view: GameView = backView(p.fx, p.fy) ? 'back' : 'front';
      const clip = (BIG[view] ??= makeFlyingPotArt(view).frames as Sprite[]);
      const sp = clip[Math.floor(p.t * 8 * BLAZE.spin) % clip.length];
      const [sx, sy] = c.at(w.x, w.y);
      c.stand(w.x + w.y, flipped(p.fx, p.fy) ? flipSprite(sp) : sp, sx, sy - w.z);
      c.spot(sx, sy - w.z, 12, 0.5);
      return;
    }
    const t = p.t - p.hit;
    if (t > BLAZE.burstLong) return;
    const key = `pot:${p.x.toFixed(3)}:${p.y.toFixed(3)}`;
    const [sx, sy] = c.at(p.x, p.y);
    const f = `${Math.floor(t * 30)}`;
    const behind = liveFrom(`${key}:behind`, f, FIRE_CANVAS.ax, FIRE_CANVAS.ay, () => blazePainted(t, 'air', 'behind'));
    const before = liveFrom(`${key}:before`, f, FIRE_CANVAS.ax, FIRE_CANVAS.ay, () => blazePainted(t, 'air', 'before'));
    if (behind) c.stand(p.x + p.y - 0.02, behind, sx, sy);
    if (before) c.stand(p.x + p.y + 0.02, before, sx, sy);
    c.spot(sx, sy - 20, 70, 0.8 * (1 - t / BLAZE.burstLong));
  },
};

const OLD_FX: Act1Fx = {
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

export const FX: Act1Fx = {
  ground: (c, m, p) => (FIREPOT_BLAZE.on ? BLAZE_FX : OLD_FX).ground!(c, m, p),
  standing: (c, m, p) => (FIREPOT_BLAZE.on ? BLAZE_FX : OLD_FX).standing!(c, m, p),
};
void BIG;
