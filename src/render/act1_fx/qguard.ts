// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18, THE GLASS GALLERY: THE QUEEN'S GUARD: what their blows leave and throw, drawn
// (render/act1_fx/types.ts), where their rules (game/act1_rules/qguard.ts) have it. Their moves themselves, the mirror's ripple
// and their shattering are their own pictures' (art/act1_figs/qguard.ts). After the art chat's (art/queens_guard_fx.ts xPainted
// and fanPainted), in the game's own pixels:
//   THROUGH THE SLASH'S WARNING, the X before them marked in the enemy's pink; THE X, two bright cuts crossing before them,
//     out and gone in a moment;
//   THROUGH THE FAN'S WARNING, its five ways marked; THE SHARDS, slivers of mirror glass flying out along them, glinting.
// Nothing cyan: the enemy's pink, glass and silver.

import { QG_FAN, QG_SLASH } from '../../art/queens_guard_moves';
import { hash } from '../../art/kit';
import { QGUARD_TUNE, shardAt } from '../../game/act1_rules/qguard';
import { beside } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

const D = Math.PI / 180;
const GLASS = ['#6a7086', '#b8c0d8', '#eef2ff', '#ffffff'];
const PINK = ['#7a1a4a', '#d0407a', '#ff9ac6'];

function dot(g: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1): void {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** THE X: two cuts crossing before them, `t` seconds after the first blade. */
function cross(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const fade = 1 - Math.min(1, p.t / 0.6);
  if (fade <= 0) return;
  const was = g.globalAlpha;
  g.globalAlpha = was * fade;
  const half = QG_SLASH.wide / 2;
  for (const s of [-1, 1]) {
    // (one cut from near-left to far-right, the other across it; the second a moment later)
    if (s > 0 && p.t < QG_SLASH.second[1] - QG_SLASH.hit) continue;
    for (let u = 0; u <= 1; u += 0.02) {
      const fwd = QG_SLASH.from + (QG_SLASH.reach - QG_SLASH.from) * u;
      const left = s * half * (1 - 2 * u);
      const q = beside(p.x, p.y, p.fx, p.fy, p.hand, fwd, left);
      const [sx, sy] = c.at(q.x, q.y);
      const lift = 10 + 8 * Math.sin(u * Math.PI);
      dot(g, sx, sy - lift, u > 0.15 && u < 0.85 ? GLASS[3] : GLASS[2], 2, 1);
      if (hash(Math.round(u * 50), s + 2, 9401) < 0.3) dot(g, sx, sy - lift + 1, PINK[2]);
    }
  }
  g.globalAlpha = was;
}

/** THE SHARDS of the fan, each where it flies (till it has struck or met a wall). */
function shards(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  for (let i = 0; i < QG_FAN.count; i++) {
    if (p.a & (1 << i)) continue;
    const s = shardAt(p.x, p.y, p.fx, p.fy, i, p.t);
    if (!s) continue;
    const [sx, sy] = c.at(s.x, s.y);
    const [tx, ty] = c.at(s.x - p.fx * 0.35, s.y - p.fy * 0.35);
    const lift = 18;
    // (a sliver of mirror, pointing the way it flies, a glint running along it)
    const n = 6;
    for (let k = 0; k <= n; k++) {
      const u = k / n;
      dot(g, tx + (sx - tx) * u, ty - lift + (sy - ty) * u, k === n ? GLASS[3] : Math.floor(c.t * 20 + i) % n === k ? GLASS[3] : GLASS[1]);
    }
  }
}

function warnings(c: Act1FxCtx, m: Monster): void {
  const act = m.act!;
  const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
  if (act.id === 'qguard:slash') {
    const k = warnK(act.t, QG_SLASH.warn[0] - 0.15, QG_SLASH.hit);
    if (k >= 0) drawStripWarn(c.g!, c.at, w, QG_SLASH.from, QG_SLASH.reach, -QG_SLASH.wide / 2, QG_SLASH.wide / 2, k, c.t);
  } else if (act.id === 'qguard:fan') {
    const k = warnK(act.t, QG_FAN.warn[0] - 0.15, QG_FAN.hit);
    if (k >= 0) drawFanWarn(c.g!, c.at, w, (-QG_FAN.spread / 2) * D - 0.05, (QG_FAN.spread / 2) * D + 0.05, Math.min(QG_FAN.range, 5), k, c.t);
  }
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) warnings(c, m);
    void QGUARD_TUNE;
  },
  air(c, m, p) {
    void m;
    if (!c.g || !p) return;
    if (p.a1 === 'qguard:x') cross(c, p);
    else if (p.a1 === 'qguard:fan') shards(c, p);
  },
};
