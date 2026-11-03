// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE RIME SHADE: what its breath does, drawn (render/act1_fx/types.ts).
// Its stand, its drift, its breath, struck and its death are its own pictures (art/rime_shade_moves.ts); here, the art chat's
// (art/rime_shade_fx.ts):
// - THE MARK, the line it will send laid out on the floor in the enemy's pink, from RS_BREATH.mark until the rime has crept over it;
// - THE LINE OF RIME creeping down it (its crust on the floor, under everything that stands), and its crystals standing up out of
//   it, among the figures: those farther from the eye than the hero behind him, the nearer before him;
// - FROZEN IN PLACE: the frost closing over his legs (its far half under him, its near half over him), and shattering.
// Each line painted afresh as its clock runs (render/act1_fx/live.ts), its pictures let go as it melts away. Painted seen from in
// front or truly from behind, the way along it turned off the way the picture faces (`turn`), never turned over.

import { FROZEN, FROZEN_CANVAS, FX_CANVAS, LINE_GONE, RIME_LINE, frozenPainted, linePainted, markPainted } from '../../art/rime_shade_fx';
import { RS_BREATH } from '../../art/rime_shade_moves';
import { toSprite } from '../../art/kit';
import { drawLights, drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { ICE_PERIL, LINE_PERIL, onLine } from '../../game/act1_rules/rshade';
import { backView } from '../../game/facing';
import type { Peril } from '../../game/state';
import { liveDone, liveFrom } from './live';
import type { Act1Fx, Act1FxCtx } from './types';

const FPS = 30;
/** How often a line's pictures are painted afresh (each a canvas the size of the floor it may cover: painting them at the game's
 * thirty a second cost about a third of a frame for three lines on a two-processor machine; fifteen halves it). */
const PAINT_FPS = 15;
type View = 'front' | 'back';

/**
 * How a line running (fx, fy) over the floor is painted: seen from in front where its left lies toward the screen's right
 * (the picture facing +x, its left -y), truly from behind where it lies toward the left (facing -y, its left -x); and how far
 * it is turned to its left off that way (radians).
 */
export function lineView(fx: number, fy: number): { view: View; turn: number } {
  if (fx + fy >= 0) return { view: 'front', turn: Math.atan2(-fy, fx) };
  return { view: 'back', turn: Math.atan2(-fx, -fy) };
}

/** Each line's own name for its pictures. */
const names = new WeakMap<Peril, string>();
let made = 0;
function nameOf(p: Peril): string {
  let n = names.get(p);
  if (!n) names.set(p, (n = `rs${++made}`));
  return n;
}
/** Its pictures let go of (it has melted away). */
function letGo(p: Peril): void {
  const n = nameOf(p);
  for (const k of ['mark', 'floor', 'behind', 'before', 'all']) liveDone(`${n}:${k}`);
}

/** The frost over the hero, each frame of its life, made once (its two halves, from in front and from behind). */
const ICE = new Map<string, Sprite>();
function ice(k: number, view: View, half: 'far' | 'near'): Sprite {
  const key = `${k}:${view}:${half}`;
  let s = ICE.get(key);
  if (!s) {
    s = toSprite(frozenPainted(k / FPS, view, half), null, FROZEN_CANVAS.ax, FROZEN_CANVAS.ay);
    ICE.set(key, s);
  }
  return s;
}

function ground(c: Act1FxCtx, p: Peril): void {
  if (!c.g) return;
  if (p.t >= LINE_GONE) {
    letGo(p);
    return;
  }
  const { view, turn } = lineView(p.fx, p.fy);
  const n = nameOf(p);
  const C = FX_CANVAS;
  const [sx, sy] = c.at(p.x, p.y);
  const stamp = `${Math.floor(p.t * PAINT_FPS + 1e-6)}`;
  // (the mark: from RS_BREATH.mark until the rime has crept to its end)
  if (p.t < RIME_LINE.long / RIME_LINE.pace + 0.1) {
    const s = liveFrom(`${n}:mark`, stamp, C.ax, C.ay, () => ({ px: markPainted(p.t + RS_BREATH.hit, view, turn) }));
    if (s) drawSprite(c.g, s, sx, sy);
  } else liveDone(`${n}:mark`);
  if (p.t < 0) return;
  const s = liveFrom(`${n}:floor`, stamp, C.ax, C.ay, () => linePainted(p.t, view, 'floor', 'all', 0, turn));
  if (!s) return;
  drawSprite(c.g, s, sx, sy);
  drawLights(c.g, s, Math.round(sx), Math.round(sy), 1, 1);
}

function standing(c: Act1FxCtx, p: Peril): void {
  if (p.a1 === ICE_PERIL) {
    const k = Math.floor(p.t * FPS + 1e-6);
    if (k < 0 || p.t > FROZEN.hold + FROZEN.shatter) return;
    const h = c.game.hero;
    const view: View = backView(h.fx, h.fy) ? 'back' : 'front';
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y - 0.05, ice(k, view, 'far'), sx, sy);
    c.stand(p.x + p.y + 0.05, ice(k, view, 'near'), sx, sy);
    return;
  }
  if (p.t < 0 || p.t >= LINE_GONE) return;
  const { view, turn } = lineView(p.fx, p.fy);
  const n = nameOf(p);
  const C = FX_CANVAS;
  const [sx, sy] = c.at(p.x, p.y);
  const stamp = `${Math.floor(p.t * PAINT_FPS + 1e-6)}`;
  const h = c.game.hero;
  const r = onLine(p, h.x, h.y);
  const end = RIME_LINE.from + RIME_LINE.long;
  // (the hero near it: its crystals farther from the eye than him behind him, the nearer before him)
  if (Math.abs(r.side) <= 1.6 && r.fwd >= RIME_LINE.from - 1.6 && r.fwd <= end + 1.6) {
    const at = Math.max(RIME_LINE.from, Math.min(end, r.fwd));
    const ax = p.x + p.fx * at;
    const ay = p.y + p.fy * at;
    for (const side of ['behind', 'before'] as const) {
      const s = liveFrom(`${n}:${side}`, `${stamp}:${at.toFixed(2)}`, C.ax, C.ay, () => linePainted(p.t, view, 'air', side, at, turn));
      if (s) c.stand(ax + ay + (side === 'before' ? 0.02 : -0.02), s, sx, sy);
    }
    liveDone(`${n}:all`);
    return;
  }
  // (else all of them at once, at its middle's depth)
  const s = liveFrom(`${n}:all`, stamp, C.ax, C.ay, () => linePainted(p.t, view, 'air', 'all', 0, turn));
  const mid = RIME_LINE.from + RIME_LINE.long / 2;
  if (s) c.stand(p.x + p.fx * mid + p.y + p.fy * mid, s, sx, sy);
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!m && p && p.a1 === LINE_PERIL) ground(c, p);
  },
  standing(c, m, p) {
    if (!m && p && (p.a1 === LINE_PERIL || p.a1 === ICE_PERIL)) standing(c, p);
  },
};
