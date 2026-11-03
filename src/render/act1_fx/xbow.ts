// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19: THE CROSSBOWMEN: what they do, drawn (render/act1_fx/types.ts). The crank, the
// raise, the kick and the smear are all in their own pictures (art/keep_crossbowmen_moves.ts). Here, the art chat's aim line and
// bolt (art/keep_crossbowmen_fx.ts: its colours LINE_RED and BOLT_HOT, its times CB_FX, its lane CB_LANE), laid along the way
// the game aims (game/act1_rules/xbow.ts: from where he stands, held from as the line is drawn out, cut short at a wall), in the
// game's own pixels:
// - THE LANE on the floor (ground), 0.8 of a tile across: drawn out from before the pavise to its end (CB_FX.grow), held, its
//   dither of deep warning red pulsing, its edges solid; flaring at its end for the last moment (CB_FX.steady); gone as the bolt
//   flies. A deep warning red (hues 0 to 12), never the enemy's pink, never cyan.
// - THE BOLT (air), at the crossbow's height: a white-hot streak half way down the lane in the first frame of the strike and at
//   its end in the second, after-images behind it; a burst of grit where it strikes; the streak thinning and gone in 0.22 s, a
//   wake of pale air along it.

import { hash } from '../../art/kit';
import { BOLT_HOT, CB_FX, LINE_RED } from '../../art/keep_crossbowmen_fx';
import { XBOW_TUNE } from '../../game/act1_rules/xbow';
import type { Monster } from '../../game/state';
import type { Act1Fx, Act1FxCtx } from './types';

/** How high the bolt flies over the floor (game pixels: the crossbow at the shoulder, the knight's height 58 at half scale). */
const BOLT_UP = 23;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A point `fwd` along the aim and `side` across it, from where he stands. */
const along = (m: Monster, fwd: number, side: number): readonly [number, number] => [m.x + m.fx * fwd - m.fy * side, m.y + m.fy * fwd + m.fx * side];

function lane(c: Act1FxCtx, m: Monster, T: number, len: number): void {
  const g = c.g!;
  const [g0, g1] = CB_FX.grow;
  if (T < g0 || T >= CB_FX.strike[0]) return;
  const L = XBOW_TUNE.lane;
  const reach = L.from + (len - L.from) * clamp01((T - g0) / (g1 - g0));
  const half = L.wide / 2;
  const flare = T >= CB_FX.steady[0];
  const pulse = 0.5 + 0.5 * Math.sin(c.t * 10);
  const was = g.globalAlpha;
  // (the dither inside: a deep red, thicker as it is held, pulsing)
  const n = Math.round((reach - L.from) * L.wide * 70);
  for (let i = 0; i < n; i++) {
    if (hash(i, 1, 9301) > 0.45 + 0.2 * pulse) continue;
    const [x, y] = along(m, L.from + (reach - L.from) * hash(i, 2, 9302), -half + L.wide * hash(i, 3, 9303));
    const [sx, sy] = c.at(x, y);
    g.globalAlpha = was * (0.55 + 0.25 * pulse);
    g.fillStyle = flare ? LINE_RED[2] : LINE_RED[1];
    g.fillRect(Math.round(sx), Math.round(sy), 2, 1);
  }
  // (its edges solid, and its end)
  g.globalAlpha = was * 0.9;
  const step = 0.06;
  for (let d = L.from; d <= reach; d += step) {
    for (const s of [-half, half]) {
      const [x, y] = along(m, d, s);
      const [sx, sy] = c.at(x, y);
      g.fillStyle = flare ? LINE_RED[4] : LINE_RED[3];
      g.fillRect(Math.round(sx), Math.round(sy), 2, 1);
    }
  }
  for (let s = -half; s <= half; s += step) {
    const [x, y] = along(m, reach, s);
    const [sx, sy] = c.at(x, y);
    g.fillStyle = flare ? LINE_RED[4] : LINE_RED[3];
    g.fillRect(Math.round(sx), Math.round(sy), 2, 1);
  }
  g.globalAlpha = was;
}

function bolt(c: Act1FxCtx, m: Monster, T: number, len: number): void {
  const g = c.g!;
  const [s0, s1] = CB_FX.strike;
  const [f0, f1] = CB_FX.fade;
  if (T < s0 || T >= f1) return;
  const L = XBOW_TUNE.lane;
  // (half way in the strike's first frame, at its end in the second)
  const head = T < s1 ? L.from + (len - L.from) * 0.5 : len;
  const fade = T < f0 ? 1 : 1 - clamp01((T - f0) / (f1 - f0));
  const was = g.globalAlpha;
  const step = 0.05;
  for (let d = L.from - 0.3; d <= head; d += step) {
    const [x, y] = along(m, d, 0);
    const [sx, sy] = c.at(x, y);
    // (white-hot at the head, cooling behind it; thinning as it goes)
    const k = (head - d) / Math.max(0.5, head - L.from);
    g.globalAlpha = was * fade * (0.95 - 0.5 * k);
    g.fillStyle = k < 0.08 ? BOLT_HOT[0] : k < 0.4 ? BOLT_HOT[1] : BOLT_HOT[2];
    g.fillRect(Math.round(sx), Math.round(sy) - BOLT_UP, fade > 0.5 ? 2 : 1, fade > 0.6 ? 2 : 1);
  }
  // (the grit where it strikes at the end)
  if (T >= s1) {
    const [ex, ey] = along(m, len, 0);
    const [sx, sy] = c.at(ex, ey);
    for (let i = 0; i < 14; i++) {
      const a = hash(i, 4, 9304) * Math.PI * 2;
      const r = (2 + 7 * hash(i, 5, 9305)) * (0.4 + (T - s1) * 4);
      g.globalAlpha = was * fade;
      g.fillStyle = i % 3 === 0 ? '#a8a49c' : '#7c7870';
      g.fillRect(Math.round(sx + Math.cos(a) * r), Math.round(sy - BOLT_UP * 0.5 + Math.sin(a) * r * 0.6), 1, 1);
    }
  }
  g.globalAlpha = was;
}

export const FX: Act1Fx | null = {
  ground(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'xbow:shot') return;
    lane(c, m, m.act.t, m.act.a || XBOW_TUNE.lane.tiles);
  },
  air(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'xbow:shot') return;
    bolt(c, m, m.act.t, m.act.a || XBOW_TUNE.lane.tiles);
  },
};
