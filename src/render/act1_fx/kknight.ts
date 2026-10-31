// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: THE KING'S KNIGHTS: what their blows leave on the floor, drawn
// (render/act1_fx/types.ts), where their rules (game/act1_rules/kknight.ts) have it. Their moves themselves are their own
// pictures' (art/act1_figs/kknight.ts). After the art chat's (art/kings_knights_fx.ts sweepPainted and crackPainted, too big
// to hold frame by frame across a hall), in the game's own pixels:
//   THROUGH THE SWEEP'S WARNING, the half circle before him it will cross marked in the enemy's pink; THE SWEEP, the crescent
//     torn across the floor before him, out in two frames, its edge white, scored streaks behind it, dust settling;
//   THROUGH THE CLEAVE'S WARNING, the line it will crack marked so; THE CRACK, the floor split on out before him in a jagged line
//     to eight tiles, side cracks off it, stone thrown up along it, held a moment and closing to dust.
// Nothing cyan: the enemy's pink, steel, stone.

import { CRACK, SWEEP } from '../../art/kings_knights_fx';
import { KN_CLEAVE, KN_SWEEP } from '../../art/kings_knights_moves';
import { hash } from '../../art/kit';
import { KNIGHT_TUNE } from '../../game/act1_rules/kknight';
import { beside } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

const D = Math.PI / 180;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const STEEL = ['#525a6c', '#7e879a', '#adb5c5', '#eceef8'];
const STONE = ['#262a3e', '#3a4058', '#565e7a'];
const DUST = ['#3d3a46', '#5a5664'];
const CRACK_INK = '#0c0a12';

function dot(g: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1): void {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** THE SWEEP's crescent, `t` seconds after it lands. */
function sweep(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const t = p.t;
  const open = clamp01(t / SWEEP.open[1]);
  const gone = clamp01((t - SWEEP.long * 0.5) / (SWEEP.dust - SWEEP.long * 0.5));
  if (gone >= 1) return;
  const was = g.globalAlpha;
  const arc = SWEEP.arc * D;
  const r = SWEEP.r;
  const n = Math.ceil((2 * arc * r) / 0.06);
  for (let i = 0; i <= n; i++) {
    const a = -arc + (2 * arc * i) / n;
    if (Math.abs(a) > arc * open) continue;
    for (let rr = SWEEP.inner; rr <= r; rr += 0.1) {
      const u = (r - rr) / (r - SWEEP.inner);
      const h = hash(i, Math.round(rr * 10), 8101);
      let col: string | null = null;
      let up = 0;
      if (t < SWEEP.long) {
        if (u < 0.05) col = STEEL[3];
        else if (u < 0.12) col = h < 0.8 ? STEEL[2] : null;
        else if (u < 0.5 && Math.floor(i / 4) % 3 === 0) col = h < 0.5 * (1 - u) ? STEEL[1] : null;
      }
      if (!col && h < 0.12 * (1 - u) * (1 - gone)) {
        col = DUST[i % 2];
        up = 4 * hash(i, 3, 8102) * clamp01(t / SWEEP.dust);
      }
      if (!col) continue;
      const q = beside(p.x, p.y, p.fx, p.fy, p.hand, Math.cos(a) * rr, Math.sin(a) * rr);
      const [sx, sy] = c.at(q.x, q.y);
      g.globalAlpha = was * (1 - gone);
      dot(g, sx, sy - up, col);
    }
  }
  g.globalAlpha = was;
}

/** THE CRACK, `t` seconds after the blade bites: out in two frames, held, closing to dust. */
function crack(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const t = p.t;
  if (t > CRACK.long) return;
  const C = KNIGHT_TUNE.crack;
  const out = C.from + (C.reach - C.from) * clamp01(t / CRACK.open[1]);
  const fade = 1 - clamp01((t - CRACK.hold) / (CRACK.long - CRACK.hold));
  const was = g.globalAlpha;
  g.globalAlpha = was * fade;
  // (the main split, jagged, wider near him; nine side cracks off it)
  let left = 0;
  for (let f = C.from; f <= out; f += 0.05) {
    left += (hash(Math.round(f * 20), 1, 8111) - 0.5) * 0.12;
    left = Math.max(-0.35, Math.min(0.35, left));
    const q = beside(p.x, p.y, p.fx, p.fy, p.hand, f, left);
    const [sx, sy] = c.at(q.x, q.y);
    const w = f < C.from + 2 ? 3 : 2;
    dot(g, sx - 1, sy, CRACK_INK, w);
    if (t < CRACK.burst && hash(Math.round(f * 20), 2, 8112) < 0.35) dot(g, sx, sy - 2 - 8 * hash(Math.round(f * 20), 3, 8113) * (t / CRACK.burst), STONE[Math.round(f * 7) % 3], 2, 2);
  }
  for (let j = 0; j < 9; j++) {
    const f0 = C.from + ((C.reach - C.from) * (j + 0.5)) / 9;
    if (f0 > out) break;
    const side = j % 2 ? 1 : -1;
    let a = side * (40 + 40 * hash(j, 4, 8114)) * D;
    let fx = f0;
    let lx = 0;
    const long = 0.5 + 0.9 * hash(j, 5, 8115);
    for (let s = 0; s < long; s += 0.05) {
      fx += Math.cos(a) * 0.05;
      lx += Math.sin(a) * 0.05;
      a += (hash(j, Math.round(s * 20), 8116) - 0.5) * 0.3;
      const q = beside(p.x, p.y, p.fx, p.fy, p.hand, fx, lx);
      const [sx, sy] = c.at(q.x, q.y);
      dot(g, sx, sy, CRACK_INK);
    }
  }
  g.globalAlpha = was;
}

function warnings(c: Act1FxCtx, m: Monster): void {
  const act = m.act!;
  const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
  if (act.id === 'kknight:sweep') {
    const k = warnK(act.t, KN_SWEEP.warn[0] - 0.2, KN_SWEEP.hit);
    if (k >= 0) drawFanWarn(c.g!, c.at, w, -KNIGHT_TUNE.sweep.arc * D, KNIGHT_TUNE.sweep.arc * D, KNIGHT_TUNE.sweep.r, k, c.t);
  } else if (act.id === 'kknight:cleave') {
    const C = KNIGHT_TUNE.crack;
    const k = warnK(act.t, KN_CLEAVE.warn[0] - 0.2, KN_CLEAVE.hit);
    if (k >= 0) drawStripWarn(c.g!, c.at, w, C.from, C.reach, -C.wide / 2, C.wide / 2, k, c.t);
  }
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) warnings(c, m);
    if (p && p.a1 === 'kknight:sweep') sweep(c, p);
    else if (p && p.a1 === 'kknight:crack') crack(c, p);
  },
};
