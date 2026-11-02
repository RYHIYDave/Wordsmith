// ACT 1: THE HOLLOW STAG, FLOOR 9'S BOSS: what it does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where its rules (game/act1_rules/stag.ts) have it. Only what its own pictures do not paint:
//   ON THE FLOOR: its charge's lane as it paws, and fading behind it as it runs (the red troll's, art/charge_lane.ts:
//     the bosses' warning in the red circle's own reds, his yes to it on 9 Oct);
//   AMONG THE FIGURES: its roots worming through the ground toward you, the art chat's own painter of them
//     (art/hollow_stag.ts rootSnakePainted: stretches of ROOT_STRETCH laid end to end along each line, from
//     ROOT_SNAKE.from to STAG_ROOTS.reach, each `t` from when its root's head passes the stretch's middle; its crack
//     glowing before it is its own warning). One line keeps one seed, so its stretches make one root; each stretch's
//     moment is painted the first time it is wanted and kept while its line lasts.

import { drawChargeLane } from '../../art/charge_lane';
import { CHARGE9, CHARGE9_CARRIED, CLOSE, GORE9, GORE9_HIT, STAG_ACTION, charge9Carry } from '../../art/stag_action';
import { CLEARING, WALL, paintEdgeMark, paintGoreMark, wallAt, wallUp } from '../../art/stag_action_fx';
import { lanePainted } from '../../art/action_f6_golem';
import { CLUMP9, clump9Frame, clump9Sprite } from '../../art/act1_figs/stag';
import type { ThingsFilm } from '../../art/films';
import { drawSprite } from '../../engine/px';
import { LANE9_PERIL, WALL_PERIL, WALL_SINK_AFTER } from '../../game/act1_rules/stag';
import { livePicture, picAt } from './live';
import type { Act1FxCtx } from './types';
import { ROOT_CANVAS, ROOT_SNAKE, ROOT_STRETCH, STAG_ROOTS, rootSnakePainted } from '../../art/hollow_stag';
import { toSprite } from '../../art/kit';
import type { Sprite } from '../../engine/px';
import { STAG, rootHeadAt } from '../../game/act1_rules/stag';
import type { Monster, Peril } from '../../game/state';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Its roots' stretches' moments, painted at this many a second (its films' thirty). */
const ROOT_FPS = 30;
/** How long before and after its head passes a stretch's middle the stretch shows anything (its crack coming; its body and furrow after). */
const ROOT_BEFORE = (ROOT_STRETCH / 2 + ROOT_SNAKE.crack) / ROOT_SNAKE.speed + 0.05;
const ROOT_AFTER = (ROOT_STRETCH / 2 + ROOT_SNAKE.body) / ROOT_SNAKE.speed + 0.55;

/** The way a line of the floor runs, in degrees round from the painter's forward (art/skin.ts, seen in front: its x along the floor's x, its left along the floor's -y). */
export function alongOf(fx: number, fy: number): number {
  return (Math.atan2(-fy, fx) * 180) / Math.PI;
}

/** Each line's stretches' moments, kept while it lasts (by the peril, by the moment). */
const LINES = new WeakMap<Peril, Map<number, Sprite>>();

function stretch(p: Peril, k: number): Sprite {
  let made = LINES.get(p);
  if (!made) LINES.set(p, (made = new Map()));
  let s = made.get(k);
  if (!s) {
    s = toSprite(rootSnakePainted(k / ROOT_FPS, 'front', alongOf(p.fx, p.fy), 13 * (p.c + 1)), null, ROOT_CANVAS.ax, ROOT_CANVAS.ay);
    made.set(k, s);
  }
  return s;
}

const OLD: Act1Fx = {
  ground(c, m) {
    const g = c.g;
    if (!g || !m || m.state !== 'act' || !m.act || m.act.id !== 'stag:charge') return;
    const C = STAG.charge;
    const T = m.act.t;
    if (T < C.warn || T >= C.crash) return;
    const run = C.pace * (C.crash - C.run);
    // (from where it set off to where its antlers will crash, as wide as what it runs down)
    const x0 = m.act.x;
    const y0 = m.act.y;
    const end = run + C.ahead[1];
    const lane = { x0, y0, x1: x0 + m.fx * end, y1: y0 + m.fy * end, half: C.half, k: clamp01((T - C.warn) / (C.run - C.warn)) };
    drawChargeLane(g, T < C.run ? lane : { ...lane, k: 1, gone: clamp01((T - C.run) / (C.crash - C.run)) }, c.at);
  },

  standing(c, m, p) {
    if (m || !p || p.a1 !== 'stag:root') return;
    // (its stretches end to end along the line, each where its root is now)
    for (let d = ROOT_SNAKE.from + ROOT_STRETCH / 2; d <= STAG_ROOTS.reach + 1e-9; d += ROOT_STRETCH) {
      const tau = p.t - rootHeadAt(d);
      if (tau < -ROOT_BEFORE || tau > ROOT_AFTER) continue;
      const s = stretch(p, Math.round(tau * ROOT_FPS));
      const x = p.x + p.fx * d;
      const y = p.y + p.fy * d;
      const [sx, sy] = c.at(x, y);
      c.stand(x + y, s, sx, sy);
    }
  },

  // (struck as it stots, it bounds on: its flinch is a standing one, its hoofs on their spots)
  sprite(m: Monster, _art, set) {
    if (m.state === 'act' || !m.gait || m.gait.mode !== 'walk' || m.struckT === undefined) return null;
    const reel = set.clips?.reel;
    if (!reel || m.struckT >= reel.frames.length / reel.fps) return null;
    return set.walk[Math.floor(Math.max(0, m.gait.t) * (set.walkFps ?? 16) + 1e-6) % set.walk.length];
  },
};

// HIS FIGHT DONE THE ACTION WAY (STAG_ACTION: art/stag_action.ts, his yes, 2 Nov 2026): ON THE FLOOR his charge's lane (the golem's,
// art/action_f6_golem.ts lanePainted, at his charge's length and width), laid out from its aim and broken up behind him; his gore's
// sweep marked while it is held, and its gouges torn along it (art/stag_action_fx.ts paintGoreMark); the new edge marked as the wood
// closes in (paintEdgeMark), round from the side the hero is on; the torn earth at the foot of each clump of his wall. AMONG THE
// FIGURES his wall's clumps (wallAt round the clearing's middle), bursting up rippling round, standing, the one inside sinking away,
// splintered where his charge struck it and growing back; their moments painted ahead (art/films.ts things:stag), or here as each is
// first wanted and kept, until they are.
const THINGS = 'things:stag';
const mine = new Map<string, Sprite>();
function clump9(c: Act1FxCtx, kind: number, i: number, layer: 'air' | 'floor'): Sprite {
  const key = `${layer}:${kind}`;
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  const s = made?.[key]?.[layer === 'floor' ? 0 : i];
  if (s) return s;
  const k = `${key}:${layer === 'floor' ? 0 : i}`;
  let o = mine.get(k);
  if (!o) mine.set(k, (o = clump9Sprite(kind, i, layer)));
  return o;
}
const walls = new Map<number, ReturnType<typeof wallAt>>();
const wallOfK = (k: number): ReturnType<typeof wallAt> => {
  let w = walls.get(k);
  if (!w) walls.set(k, (w = wallAt(k)));
  return w;
};
/** Each clump of his wall seen now: where, which kind, which frame. */
function clumpsOf(p: Peril): { x: number; y: number; kind: number; i: number }[] {
  const out: { x: number; y: number; kind: number; i: number }[] = [];
  const since = p.t - p.hit;
  // (the wall now: bursting up rippling round, standing, splintered where his antlers struck it)
  if (p.c > 0 && p.c < 1) {
    const sx = p.fy >= 0 ? Math.cos(p.fx) * CLEARING.rx * p.c : 0;
    const sy = p.fy >= 0 ? Math.sin(p.fx) * CLEARING.ry * p.c : 0;
    for (const q of wallOfK(p.c)) {
      const s = since - wallUp(q.a, p.d);
      const broken = p.fy >= 0 && Math.hypot(q.x - sx, q.y - sy) <= 1.3 ? p.t - p.fy : -1;
      const i = clump9Frame(s, -1, broken);
      if (i >= 0) out.push({ x: p.x + q.x, y: p.y + q.y, kind: q.kind, i });
    }
  }
  // (the one inside it sinking away, once the new one is up)
  if (p.b > 0 && p.b < 1) {
    const gone = since - (WALL.rise + WALL.ripple + WALL_SINK_AFTER);
    for (const q of wallOfK(p.b)) {
      const i = clump9Frame(2, Math.max(0, gone));
      if (i >= 0) out.push({ x: p.x + q.x, y: p.y + q.y, kind: q.kind, i });
    }
  }
  return out;
}
/** A floor picture over the clearing (`key`), as big as `rx` by `ry` tiles round its anchor point, painted by `paint` with its `at`. */
function floorPicture(c: Act1FxCtx, key: string, stamp: string, x: number, y: number, rx: number, ry: number, paint: (px: import('../../engine/px').Px, at: (x: number, y: number, z?: number) => [number, number]) => void): void {
  if (!c.g) return;
  const span = Math.hypot(rx, ry) + 1.2;
  const w = Math.ceil(64 * span) + 8;
  const h = Math.ceil(32 * span) + 8;
  const P = picAt(w / 2, h / 2);
  const s = livePicture(key, w, h, w / 2, h / 2, stamp, (px) => paint(px, (u, v, z = 0) => [...P(u, v, z)] as [number, number]));
  if (!s) return;
  const [sx, sy] = c.at(x, y);
  drawSprite(c.g, s, sx, sy);
}

const ACTION: Act1Fx = {
  films: [THINGS],
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m && m.state === 'act' && m.act) {
      const T = m.act.t;
      if (m.act.id === 'stag:close' && m.a1 && T <= CLOSE.hit + 0.05) {
        // (the new edge marked, round from the side the hero is on)
        const s = m.a1.stage ?? 0;
        const k = CLOSE.stages[Math.min(CLOSE.stages.length - 1, s + 1)];
        const cx = m.a1.cx ?? m.x;
        const cy = m.a1.cy ?? m.y;
        const h = c.game.hero;
        const from = Math.atan2(Math.sin(Math.atan2(h.y - cy, h.x - cx)) / CLEARING.ry, Math.cos(Math.atan2(h.y - cy, h.x - cx)) / CLEARING.rx);
        floorPicture(c, 'stag:edge', `${Math.floor(T * 15)}:${k}:${from.toFixed(2)}`, cx, cy, CLEARING.rx * k + 1, CLEARING.ry * k + 1, (px, at) => paintEdgeMark(px, at, k, T, from));
      } else if (m.act.id === 'stag:gore' && T < GORE9_HIT + 1.2) {
        // (his sweep marked while it is held; its gouges torn along it)
        const aim = Math.atan2(m.fy, m.fx);
        floorPicture(c, 'stag:gore', `${Math.floor(T * 30)}:${aim.toFixed(3)}`, m.x, m.y, GORE9.reach + 0.5, GORE9.reach + 0.5, (px, at) => paintGoreMark(px, at, T, [0, 0], aim));
      }
      return;
    }
    if (!p) return;
    if (p.a1 === LANE9_PERIL) {
      if (p.t < CHARGE9.aim || p.t >= CHARGE9.crash) return;
      const k = Math.min(1, (p.t - CHARGE9.aim) / 0.3);
      const long = p.d >= CHARGE9_CARRIED - 0.05 ? CHARGE9.lane : p.d + 1.5;
      const L = lanePainted(p.fx, p.fy, k, Math.min(charge9Carry(p.t), p.d), long, CHARGE9.half);
      const s = toSprite({ px: L.px, lights: [] }, null, L.ax, L.ay);
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(g, s, sx, sy);
      return;
    }
    if (p.a1 === WALL_PERIL) {
      for (const q of clumpsOf(p)) {
        const [sx, sy] = c.at(q.x, q.y);
        drawSprite(g, clump9(c, q.kind, 0, 'floor'), sx, sy);
      }
    }
  },
  standing(c, m, p) {
    if (m || !p || p.a1 !== WALL_PERIL) return;
    for (const q of clumpsOf(p)) {
      const [sx, sy] = c.at(q.x, q.y);
      c.stand(q.x + q.y, clump9(c, q.kind, q.i, 'air'), sx, sy);
    }
  },
};
void CLUMP9;

export const FX: Act1Fx | null = {
  get films() {
    return STAG_ACTION.on ? ACTION.films : undefined;
  },
  ground: (c, m, p) => (STAG_ACTION.on ? ACTION : OLD).ground!(c, m, p),
  standing: (c, m, p) => (STAG_ACTION.on ? ACTION : OLD).standing!(c, m, p),
  sprite: (m, art, set) => OLD.sprite!(m, art, set),
};
