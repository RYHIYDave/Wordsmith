// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: YOUR REFLECTIONS: what they do, drawn (render/act1_fx/types.ts). Their pictures are the
// hero's own turned to glass (art/act1_figs/reflection.ts); here:
// - ITS PICTURE THROUGH A BLOW: its first frame held through the warning, then the hero's own clip played (its blows are his,
//   quicker than any enemy's warning should be: game/act1_rules/reflection.ts REFLECT);
// - ITS WARNINGS through each hold, in the enemy's pink (garden_warn.ts): a blade's cut and its whirl, a bow's line and its volley's
//   fan, magic's wave's strip and where its orb will burst;
// - WHAT IT SENDS: its arrows, its wave, its orb, in the enemy's pink, as the art says what the hero sends must be when a
//   reflection makes it (docs/mockups/reflections/README.md: “What the game draws for an attack besides the figure ... must take
//   the enemy's colours”). The hero's own are the friend's cyan; these are drawn plainly here, the pink of the enemy, not his.
import type { Clip } from '../../art/actor_types';
import { REFLECT, hitOf, styleOf } from '../../game/act1_rules/reflection';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

/** The enemy's pinks: its edge, its glow, the white at its heart. */
const PINK = ['#7a1640', '#ff3a78', '#ff9cc4', '#fff0f6'] as const;

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    if (!m.act || (m.act.id !== 'reflection:tap' && m.act.id !== 'reflection:hold')) return null;
    const hold = m.act.id === 'reflection:hold';
    const clip = (hold ? set.clips?.heavy : set.clips?.attack) as Clip | undefined;
    if (!clip || !clip.frames.length) return null;
    const warn = hold ? REFLECT.hold.warn : REFLECT.tap.warn;
    const i = m.act.t < warn ? 0 : Math.min(clip.frames.length - 1, Math.floor((m.act.t - warn) * clip.fps));
    return clip.frames[i] ?? null;
  },
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act && (m.act.id === 'reflection:tap' || m.act.id === 'reflection:hold')) {
      const hold = m.act.id === 'reflection:hold';
      const k = warnK(m.act.t, 0, hitOf(m, m.act));
      if (k < 0) return;
      const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
      const s = styleOf(m);
      if (s === 'blade') {
        if (hold) drawFanWarn(c.g, c.at, w, -Math.PI, Math.PI, REFLECT.blade.whirl, k, c.t);
        else drawFanWarn(c.g, c.at, w, -REFLECT.blade.half, REFLECT.blade.half, REFLECT.blade.reach, k, c.t);
      } else if (s === 'bow') {
        if (hold) drawFanWarn(c.g, c.at, w, -REFLECT.bow.spread - 0.08, REFLECT.bow.spread + 0.08, REFLECT.bow.far * 0.75, k, c.t);
        else drawStripWarn(c.g, c.at, w, 0.4, REFLECT.bow.far * 0.75, -0.25, 0.25, k, c.t);
      } else if (!hold) {
        const W = REFLECT.magic.wave;
        drawStripWarn(c.g, c.at, w, 0.4, W.speed * W.long, -W.half, W.half, k, c.t);
      } else {
        const tx = m.a1?.tx ?? m.x;
        const ty = m.a1?.ty ?? m.y;
        drawFanWarn(c.g, c.at, { x: tx, y: ty, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, REFLECT.magic.orb.burst, k, c.t);
      }
      return;
    }
    // (an orb on its way: where it will burst, warned the whole way)
    if (p && p.a1 === 'reflection:orb' && !p.done) {
      const k = Math.min(1, p.t / Math.max(0.1, p.c + REFLECT.magic.orb.after));
      drawFanWarn(c.g, c.at, { x: p.a, y: p.b, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, REFLECT.magic.orb.burst, k, c.t);
    }
  },
  air(c, _m, p) {
    if (!c.g || !p || p.done) return;
    const g = c.g;
    if (p.a1 === 'reflection:arrow') {
      const d = REFLECT.bow.speed * p.t;
      const [x0, y0] = c.at(p.x + p.fx * Math.max(0, d - 0.7), p.y + p.fy * Math.max(0, d - 0.7));
      const [x1, y1] = c.at(p.x + p.fx * d, p.y + p.fy * d);
      g.strokeStyle = PINK[1];
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, y0 - 14);
      g.lineTo(x1, y1 - 14);
      g.stroke();
      g.fillStyle = PINK[3];
      g.fillRect(Math.round(x1) - 1, Math.round(y1) - 15, 3, 3);
      c.spot(x1, y1 - 14, 14, 0.25);
      return;
    }
    if (p.a1 === 'reflection:wave') {
      const W = REFLECT.magic.wave;
      const along = W.speed * p.t;
      const half = W.half + along * 0.25;
      const fade = Math.max(0, 1 - p.t / W.long);
      g.globalAlpha = 0.35 + 0.5 * fade;
      for (let i = -6; i <= 6; i++) {
        const s = (i / 6) * half;
        const bow = 0.25 * (1 - (i / 6) ** 2);
        const [x, y] = c.at(p.x + p.fx * (along + bow) - p.fy * s, p.y + p.fy * (along + bow) + p.fx * s);
        g.fillStyle = Math.abs(i) < 3 ? PINK[2] : PINK[1];
        g.fillRect(Math.round(x) - 2, Math.round(y) - 6, 4, 4);
      }
      g.globalAlpha = 1;
      const [cx, cy] = c.at(p.x + p.fx * along, p.y + p.fy * along);
      c.spot(cx, cy - 4, 26, 0.3 * fade);
      return;
    }
    if (p.a1 === 'reflection:orb') {
      const k = Math.min(1, p.t / Math.max(0.05, p.c));
      const x = p.x + (p.a - p.x) * k;
      const y = p.y + (p.b - p.y) * k;
      // (lobbed: up and down over its way)
      const lift = 10 + 26 * Math.sin(Math.PI * k);
      const [sx, sy] = c.at(x, y);
      const r = 4 + (Math.floor(c.t * 10) & 1);
      g.fillStyle = PINK[1];
      g.beginPath();
      g.arc(Math.round(sx), Math.round(sy - lift), r + 1, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = PINK[3];
      g.fillRect(Math.round(sx) - 1, Math.round(sy - lift) - 1, 3, 3);
      c.spot(sx, sy - lift, 22, 0.35);
    }
  },
};
