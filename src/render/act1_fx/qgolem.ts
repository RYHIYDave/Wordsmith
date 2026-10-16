// ACT 1: THE QUARRY GOLEM (FLOOR 6): what it sends across the floor, drawn (render/act1_fx/types.ts). Its hammer
// is all in its own pictures (the fists, the chips and dust off the floor). Its chunk, thrown (game/act1_rules/
// qgolem.ts, 'qgolem:chunk'): in flight the art chat's own picture of it, tumbling end over end
// (makeGolemChunkArt, CHUNK_FRAMES a turn, once and a half round on its way, as the art's film has it), its
// shadow on the floor under it growing as it comes down, as the Ossuary Golem's skull's does (art/mob_shots.ts
// drawSkullShadow: as wide, when it lands, as what it strikes); where it comes down, the art's chunkShatter (0 to
// 4, at twelve a second; 4 is what is left), lying a while, then fading.

import { CHUNK_FRAMES, chunkShatter, makeGolemChunkArt } from '../../art/floor6_mobs';
import { lazyFrames } from '../../art/kit';
import type { GameView } from '../../art/skin';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { QGOLEM, chunkAt } from '../../game/act1_rules/qgolem';
import { backView, flipped } from '../../game/facing';
import { thrownShadow } from './thrown';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** How many times round the chunk turns on its way (the art's film), its shattering's frames a second, and its last frame (what is left). */
const TURNS = 1.5;
const SHATTER_FPS = 12;
const SHATTER_LEFT = 4;
/** Over how long the pieces left fade at the end (seconds). */
const FADE = 1;

const chunks: Partial<Record<GameView, Sprite[]>> = {};
let shatter: Sprite[] | null = null;

export const FX: Act1Fx = {
  ground(c, m, p) {
    if (!p || p.a1 !== 'qgolem:chunk' || !c.g) return;
    const g = c.g;
    if (p.t < p.hit) {
      // (its shadow, under it as it flies; darker and as wide as what it strikes as it comes down)
      const w = chunkAt(p);
      const [sx, sy] = c.at(w.x, w.y);
      const k = clamp01(p.t / p.hit);
      const widest = QGOLEM.chunk.r * 16 * Math.SQRT2;
      thrownShadow(g, sx, sy, 4 + (widest - 4) * k, 0.2 + 0.45 * k);
      return;
    }
    // (shattered where it came down: its pieces flung out, and lying)
    const f = Math.min(SHATTER_LEFT, Math.floor((p.t - p.hit) * SHATTER_FPS + 1e-6));
    const sp = (shatter ??= lazyFrames(SHATTER_LEFT + 1, (i) => chunkShatter(i)))[f];
    const [sx, sy] = c.at(p.x, p.y);
    const was = g.globalAlpha;
    g.globalAlpha = was * clamp01((p.dur - p.t) / FADE);
    g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
    g.globalAlpha = was;
  },
  standing(c, m, p) {
    if (!p || p.a1 !== 'qgolem:chunk' || p.t >= p.hit) return;
    // (in flight, tumbling end over end; seen from behind when it flies away up the screen, turned over when it flies to the left)
    const w = chunkAt(p);
    const view: GameView = backView(p.fx, p.fy) ? 'back' : 'front';
    const set = (chunks[view] ??= makeGolemChunkArt(view));
    const sp = set[Math.floor(clamp01(p.t / p.hit) * TURNS * CHUNK_FRAMES) % CHUNK_FRAMES];
    const [sx, sy] = c.at(w.x, w.y);
    c.stand(w.x + w.y, flipped(p.fx, p.fy) ? flipSprite(sp) : sp, sx, sy - w.z);
  },
};
