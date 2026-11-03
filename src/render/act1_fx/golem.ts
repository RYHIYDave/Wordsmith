// FLOOR 4, MORE ACTION (game/defs.ts ACTION_F4): THE OSSUARY GOLEM'S SKELETON HURL, drawn (render/act1_fx/types.ts), from the art
// chat's pictures (art/action_f4_fx.ts, his yes to them, 1 Nov 2026). Its haul, hold and throw are in its own pictures
// (makeHurlGolemArt, GOLEM_HURL: clips.moves.throw); here, the peril it throws (game/action_f4.ts HURL_PERIL):
// - THE MARK, the reach of its burst round where it will land, from its aim (burstPainted 'floor' before it lands), under the figures;
// - ITS SHADOW on the floor under it as it flies, growing as it comes down (hurlShadowPainted), under the figures;
// - THE SKELETON in flight, cartwheeling (the golem's `hurled` frames, HURL.spin times round a second), over everything it flies over;
// - THE BURST where it lands: the dust and the bones on the floor (burstPainted 'floor'), the flash, the flung bones and the dust
//   cloud (burstPainted 'air'), behind and before a figure at its middle; gone by BURST_LONG.
import { BURST_CANVAS, BURST_LONG, HURL, SHADOW_CANVAS, burstPainted, hurlFly, hurlShadowPainted } from '../../art/action_f4_fx';
import { GRAIN, toSprite } from '../../art/kit';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { HURL_PERIL, hurlFlight } from '../../game/action_f4';
import type { Peril } from '../../game/state';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
type Layer = 'floor' | 'behind' | 'before';
/** Seen from behind: the golem faced up the screen as it let go (or took its aim). */
const backOf = (p: Peril): boolean => p.fx + p.fy < -0.2;
/** How long its mark is down before it lands (seconds, to a frame): from its aim, as the golem holds it, through its flight. */
const markedOf = (p: Peril): number => Math.round((HURL.hit - HURL.aim + hurlFly(p.d)) * FPS) / FPS;
/** One frame of the mark and the burst, `k` frames from its landing (below 0: the mark), made the first time it is asked for. */
function burst(what: Layer, k: number, back: boolean, marked: number): Sprite {
  const key = `${what}:${k}:${back ? 1 : 0}:${k < 0 ? marked : ''}`;
  let s = MADE.get(key);
  if (s) return s;
  const t = k / FPS;
  s = toSprite(burstPainted(t, what === 'floor' ? 'floor' : 'air', HURL.r, what === 'floor' ? 'all' : what, back ? 'back' : 'front', marked), null, BURST_CANVAS.ax, BURST_CANVAS.ay);
  MADE.set(key, s);
  return s;
}
/** Its shadow, `u` (0 to 1) of the way through its flight, to a twenty-fourth. */
function shadow(u: number): Sprite {
  const k = Math.round(Math.max(0, Math.min(1, u)) * 24);
  const key = `shadow:${k}`;
  let s = MADE.get(key);
  if (!s) MADE.set(key, (s = toSprite(hurlShadowPainted(k / 24), null, SHADOW_CANVAS.ax, SHADOW_CANVAS.ay)));
  return s;
}
/** The mark's or the burst's frame now (from its landing), or null: not aimed, or over. */
function kOf(p: Peril): number | null {
  if (p.a1 !== HURL_PERIL || p.t > BURST_LONG) return null;
  return Math.floor(p.t * FPS);
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || !c.g) return;
    const k = kOf(p);
    if (k === null) return;
    const [sx, sy] = c.at(p.x, p.y);
    drawSprite(c.g, burst('floor', k, backOf(p), markedOf(p)), sx, sy);
    const f = hurlFlight(p);
    if (f) {
      const [fx, fy] = c.at(f.x, f.y);
      drawSprite(c.g, shadow(f.u), fx, fy);
    }
  },
  standing(c, m, p) {
    if (m || !p || p.a1 !== HURL_PERIL || p.done < 2 || p.t < 0 || p.t > BURST_LONG) return;
    const k = Math.floor(p.t * FPS);
    const back = backOf(p);
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y - 0.02, burst('behind', k, back, 0), sx, sy);
    c.stand(p.x + p.y + 0.02, burst('before', k, back, 0), sx, sy);
  },
  air(c, m, p) {
    if (m || !p || !c.g) return;
    const f = hurlFlight(p);
    if (!f) return;
    // (the skeleton, cartwheeling over everything it flies over: seen as the golem was, turned as it is)
    const set = backOf(p) ? c.bestiary.of('golem').back : c.bestiary.of('golem').front;
    const frames = set.clips?.moves?.hurled?.frames;
    if (!frames || frames.length === 0) return;
    const since = p.t + hurlFly(p.d);
    let sp = frames[Math.floor(since * frames.length * HURL.spin + 1e-6) % frames.length];
    if (p.fx - p.fy < 0) sp = flipSprite(sp);
    const [sx, sy] = c.at(f.x, f.y);
    drawSprite(c.g, sp, sx, Math.round(sy - f.z / GRAIN));
  },
};
