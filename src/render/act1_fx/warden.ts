// FLOOR 1, MORE ACTION (game/defs.ts ACTION_F1): THE WARDEN'S LOCKDOWN, drawn (render/act1_fx/types.ts), from the art chat's
// pictures (art/action_f1_fx.ts, his yes to them, 31 Oct 2026). His keys going up and wrenched down are in his own pictures
// (art/monster_warden.ts clips.moves.lockdown); here, the bars of the peril he casts (game/action_f1.ts BARS_PERIL), each row
// laid a tile at a time along the floor of his room (barRows): THEIR SHADOWS on the floor from LOCKDOWN.warn before the crash,
// darker and pink-edged as they come, under the figures (lockShadowPainted); THE BARS crashing down, standing as a cage, and
// rising away, each tile's stood among the figures by its floor point (lockBarsPainted). Nothing if he fell before the crash.
import { LOCKDOWN, LOCKDOWN_LONG, lockBarsPainted, lockCanvas, lockShadowPainted } from '../../art/action_f1_fx';
import type { Way } from '../../art/action_f1_fx';
import { toSprite } from '../../art/kit';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { BARS_PERIL, barRows } from '../../game/action_f1';
import type { Game } from '../../game/game';
import type { Peril } from '../../game/state';
import { T_FLOOR } from '../../game/types';
import { keptPictures } from './kept';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = keptPictures<string, Sprite>(true);
/** One tile of a row, k frames from the shadows' first (`-LOCKDOWN.warn`), its shadow or its bars (`wear`: which of four), made the first time asked for. */
function frame(what: 'shadow' | 'bars', way: Way, k: number, wear: number): Sprite {
  const key = `${what}:${way}:${k}:${wear}`;
  let s = MADE.get(key);
  if (s) return s;
  const t = k / FPS - LOCKDOWN.warn;
  const C = lockCanvas(1);
  s = toSprite(what === 'shadow' ? lockShadowPainted(way, t, 1) : lockBarsPainted(way, t, 1, wear), null, C.ax, C.ay);
  MADE.set(key, s);
  return s;
}

/** The tiles of the peril's rows that are floor: each its middle (world), the way its row runs, and its wear. */
function tilesOf(g: Game, p: Peril): { x: number; y: number; way: Way; wear: number }[] {
  const R = barRows(g, p);
  if (!R) return [];
  const f = g.level.floor;
  const out: { x: number; y: number; way: Way; wear: number }[] = [];
  const floor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[Math.floor(y) * f.w + Math.floor(x)] === T_FLOOR;
  const r = R.room;
  for (const y of R.x) for (let x = r.x; x < r.x + r.w; x++) if (floor(x + 0.5, y)) out.push({ x: x + 0.5, y, way: 'x', wear: (x * 7 + Math.round(y) * 3) & 3 });
  for (const x of R.y) for (let y = r.y; y < r.y + r.h; y++) if (floor(x, y + 0.5)) out.push({ x, y: y + 0.5, way: 'y', wear: (y * 5 + Math.round(x) * 11) & 3 });
  return out;
}

/** The frame now (from the shadows' first), or -1: not yet, or over. */
function kOf(p: Peril): number {
  return p.t >= -LOCKDOWN.warn && p.t <= LOCKDOWN_LONG ? Math.floor((p.t + LOCKDOWN.warn) * FPS) : -1;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || p.a1 !== BARS_PERIL || !c.g) return;
    const k = kOf(p);
    if (k < 0) return;
    for (const q of tilesOf(c.game, p)) {
      const [sx, sy] = c.at(q.x, q.y);
      drawSprite(c.g, frame('shadow', q.way, k, 0), sx, sy);
    }
  },
  standing(c, m, p) {
    if (m || !p || p.a1 !== BARS_PERIL || p.t < LOCKDOWN.strike[0] - 1e-6) return;
    const k = kOf(p);
    if (k < 0) return;
    for (const q of tilesOf(c.game, p)) {
      const [sx, sy] = c.at(q.x, q.y);
      c.stand(q.x + q.y, frame('bars', q.way, k, q.wear), sx, sy);
    }
  },
};
