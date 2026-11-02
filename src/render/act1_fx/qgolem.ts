// ACT 1: THE QUARRY GOLEM (FLOOR 6): what it sends across the floor, drawn (render/act1_fx/types.ts). Its hammer
// is all in its own pictures (the fists, the chips and dust off the floor). Its chunk, thrown (game/act1_rules/
// qgolem.ts, 'qgolem:chunk'): in flight the art chat's own picture of it, tumbling end over end
// (makeGolemChunkArt, CHUNK_FRAMES a turn, once and a half round on its way, as the art's film has it), its
// shadow on the floor under it growing as it comes down, as the Ossuary Golem's skull's does (art/mob_shots.ts
// drawSkullShadow: as wide, when it lands, as what it strikes); where it comes down, the art's chunkShatter (0 to
// 4, at twelve a second; 4 is what is left), lying a while, then fading.

import { CHUNK_FRAMES, chunkShatter, makeGolemChunkArt } from '../../art/floor6_mobs';
import { BOULDER, GOLEM_BOULDER, HAMMER, ROLL_HIT, ROLL_ROUND, SMASH_CANVAS, boulderHop, lanePainted, makeRollingArt, smashPainted } from '../../art/action_f6_golem';
import { toSprite } from '../../art/kit';
import { drawLights, drawSprite } from '../../engine/px';
import { BOULDER_PERIL, QUAKE_PERIL, boulderDown } from '../../game/act1_rules/qgolem';
import type { Peril } from '../../game/state';
import { liveFrom } from './live';
import type { Act1FxCtx } from './types';
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

// ITS BOULDER ROLL AND HAMMER (GOLEM_BOULDER: art/action_f6_golem.ts, his yes, 2 Nov 2026): the lane marked from its aim, broken
// up behind the boulder; the boulder rolling down it, hopping (makeRollingArt), turned as the figures are; where it smashes, and where
// the hammer's fists come down, the cracks and the ring of dust ('floor') and the rock flung ('air', by halves), a frame at a time.
const rolls: Partial<Record<GameView, Sprite[]>> = {};
/** The smash where it is, `t` seconds after it, its 'floor' or the 'air' about a figure there. */
function smash(c: Act1FxCtx, p: Peril, x: number, y: number, t: number, r: number, quake: boolean, layer: 'floor' | 'air'): void {
  const key = `qg:${p.a1}:${x.toFixed(3)}:${y.toFixed(3)}`;
  const f = `${Math.floor(t * 30)}`;
  const [sx, sy] = c.at(x, y);
  const C = SMASH_CANVAS;
  if (layer === 'floor') {
    const s = liveFrom(`${key}:floor`, f, C.ax, C.ay, () => smashPainted(t, 'floor', r, quake));
    if (s && c.g) {
      drawSprite(c.g, s, sx, sy);
      drawLights(c.g, s, Math.round(sx), Math.round(sy), 1, 1);
    }
    return;
  }
  const behind = liveFrom(`${key}:behind`, f, C.ax, C.ay, () => smashPainted(t, 'air', r, quake, 'behind'));
  const before = liveFrom(`${key}:before`, f, C.ax, C.ay, () => smashPainted(t, 'air', r, quake, 'before'));
  if (behind) c.stand(x + y - 0.02, behind, sx, sy);
  if (before) c.stand(x + y + 0.02, before, sx, sy);
}
const ROLL_FX: Act1Fx = {
  ground(c, m, p) {
    if (!p || !c.g) return;
    if (p.a1 === QUAKE_PERIL) {
      smash(c, p, p.x, p.y, p.t, HAMMER.r, true, 'floor');
      return;
    }
    if (p.a1 !== BOULDER_PERIL) return;
    const smashed = p.hit < 1e9;
    if (!smashed) {
      // (its lane, laid out from the golem as it is marked, broken up behind the boulder)
      const lead = ROLL_HIT - BOULDER.aim;
      const k = Math.min(1, (p.t + lead) / 0.3);
      const L = lanePainted(p.fx, p.fy, k, p.t > 0 ? boulderDown(p) : 0, p.d);
      const s = toSprite({ px: L.px, lights: [] }, null, L.ax, L.ay);
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, s, sx, sy);
      return;
    }
    smash(c, p, p.b, p.c, p.t - p.hit, BOULDER.r, false, 'floor');
  },
  standing(c, m, p) {
    if (!p) return;
    if (p.a1 === QUAKE_PERIL) {
      smash(c, p, p.x, p.y, p.t, HAMMER.r, true, 'air');
      return;
    }
    if (p.a1 !== BOULDER_PERIL || p.t < 0) return;
    if (p.hit < 1e9) {
      smash(c, p, p.b, p.c, p.t - p.hit, BOULDER.r, false, 'air');
      return;
    }
    // (rolling down its lane, hopping; seen from behind when it rolls up the screen, turned over when it rolls to the left)
    const down = boulderDown(p);
    const x = p.x + p.fx * down;
    const y = p.y + p.fy * down;
    const view: GameView = backView(p.fx, p.fy) ? 'back' : 'front';
    const clip = makeRolling(view);
    const sp = clip[Math.floor((p.t / ROLL_ROUND) * clip.length) % clip.length];
    const [sx, sy] = c.at(x, y);
    c.stand(x + y, flipped(p.fx, p.fy) ? flipSprite(sp) : sp, sx, sy - boulderHop(down - BOULDER.from));
  },
};
function makeRolling(view: GameView): Sprite[] {
  return (rolls[view] ??= makeRollingArt(view).frames as Sprite[]);
}

const CHUNK_FX: Act1Fx = {
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

export const FX: Act1Fx = {
  ground: (c, m, p) => (GOLEM_BOULDER.on ? ROLL_FX : CHUNK_FX).ground!(c, m, p),
  standing: (c, m, p) => (GOLEM_BOULDER.on ? ROLL_FX : CHUNK_FX).standing!(c, m, p),
};
