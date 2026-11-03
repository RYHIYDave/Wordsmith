// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE PRINCE: what he does, drawn (render/act1_fx/types.ts). His thrust, dance, masks and
// midnight and their smears are in his own pictures (art/prince_moves.ts); here, from his rules (game/act1_rules/prince.ts):
// - THE RING OF PARTNERS round where the hero stood (the art's dancePainted), rising, waltzing in, snapping shut, bursting;
// - THE MASKS in flight (the art's maskPainted, spun), each at its place along its way, and gone as it bursts;
// - MIDNIGHT'S RINGS rolling out from the clock: a dark crimson band (the black room's red, never pink) with a crest of gilt
//   light, its gap left open, drawn on the floor;
// - HIS WARNINGS in the enemy's pink: the thrust's line, the masks' five ways, the ring's circle closing.
import { toSprite } from '../../art/kit';
import { TILE3 } from '../../art/new_mobs3';
import { CHIME, DANCE_CANVAS, DANCE_FX, MASKS_FX, MASK_CANVAS, MASK_FLIGHT, dancePainted, flungMask, maskPainted } from '../../art/prince_fx';
import { PC_DANCE, PC_MASKS, PC_THRUST } from '../../art/prince_moves';
import type { Sprite } from '../../engine/px';
import { PRINCE_TUNE, chimeGap, maskWhere } from '../../game/act1_rules/prince';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const MADE = new Map<string, Sprite>();
const DANCE_FPS = 15;
const MASK_SPINS = 12;
function dance(k: number): Sprite {
  const key = `dance:${k}`;
  let s = MADE.get(key);
  if (!s) MADE.set(key, (s = toSprite(dancePainted(k / DANCE_FPS, 'front'), null, DANCE_CANVAS.ax, DANCE_CANVAS.ay)));
  return s;
}
function mask(k: number): Sprite {
  const key = `mask:${k}`;
  let s = MADE.get(key);
  if (!s) MADE.set(key, (s = toSprite(maskPainted((k / MASK_SPINS) * Math.PI * 2, 'front'), null, MASK_CANVAS.ax, MASK_CANVAS.ay)));
  return s;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m && m.act) {
      const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
      if (m.act.id === 'prince:thrust') {
        const k = warnK(m.act.t, PC_THRUST.warn[0] - 0.2, PC_THRUST.hit);
        if (k >= 0) drawStripWarn(g, c.at, w, 0, PRINCE_TUNE.thrust.reach, -PRINCE_TUNE.thrust.half, PRINCE_TUNE.thrust.half, k, c.t);
      } else if (m.act.id === 'prince:masks') {
        const k = warnK(m.act.t, PC_MASKS.warn[0] - 0.2, PC_MASKS.hit);
        if (k >= 0) {
          for (let i = 0; i < MASKS_FX.n; i++) {
            const way = flungMask(i, 0).way;
            const fx = m.fx * way[0] + m.fy * way[1];
            const fy = m.fy * way[0] - m.fx * way[1];
            drawStripWarn(g, c.at, { ...w, fx, fy }, 0.5, MASKS_FX.reach * 0.6, -0.3, 0.3, k, c.t);
          }
        }
      } else if (m.act.id === 'prince:dance') {
        const k = warnK(m.act.t, PC_DANCE.warn[0] - 0.2, PC_DANCE.hit);
        if (k >= 0) drawFanWarn(g, c.at, { x: c.game.hero.x, y: c.game.hero.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, DANCE_FX.r0 / TILE3, k * 0.6, c.t);
      }
    }
    if (!p) return;
    if (p.a1 === 'prince:dance' && p.t < DANCE_FX.hit) {
      const k = warnK(p.t, DANCE_FX.close[0], DANCE_FX.hit);
      if (k >= 0) drawFanWarn(g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, PRINCE_TUNE.dance.caught, k, c.t);
    }
    if (p.a1 === 'prince:chime') {
      const t = p.t - p.d;
      if (t < 0) return;
      const r = CHIME.speed[p.b as 0 | 1 | 2] * t;
      if (r > CHIME.reach) return;
      const thin = r > CHIME.reach * 0.85 ? 1 - (r - CHIME.reach * 0.85) / (CHIME.reach * 0.15) : 1;
      const was = g.globalAlpha;
      const steps = Math.max(24, Math.ceil(r * 6));
      // (the band, in runs between the gap: the black room's red, its crest gilt)
      const runs: [number, number][][] = [];
      let run: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const x = p.x + Math.cos(a) * r;
        const y = p.y + Math.sin(a) * r;
        if (chimeGap(p, x, y, r)) {
          if (run.length > 1) runs.push(run);
          run = [];
          continue;
        }
        run.push([Math.cos(a), Math.sin(a)]);
      }
      if (run.length > 1) runs.push(run);
      for (const q of runs) {
        g.globalAlpha = 0.5 * thin * (p.done ? 0.6 : 1);
        g.fillStyle = '#5a0e12';
        g.beginPath();
        q.forEach(([cx, cy], i) => {
          const [sx, sy] = c.at(p.x + cx * (r + CHIME.band / 2), p.y + cy * (r + CHIME.band / 2));
          if (i === 0) g.moveTo(sx, sy);
          else g.lineTo(sx, sy);
        });
        for (let i = q.length - 1; i >= 0; i--) {
          const [cx, cy] = q[i];
          const [sx, sy] = c.at(p.x + cx * Math.max(0, r - CHIME.band / 2), p.y + cy * Math.max(0, r - CHIME.band / 2));
          g.lineTo(sx, sy);
        }
        g.closePath();
        g.fill();
        g.globalAlpha = 0.85 * thin;
        g.strokeStyle = '#e0b860';
        g.lineWidth = 1;
        g.beginPath();
        q.forEach(([cx, cy], i) => {
          const [sx, sy] = c.at(p.x + cx * (r + CHIME.band / 2), p.y + cy * (r + CHIME.band / 2));
          if (i === 0) g.moveTo(sx, sy);
          else g.lineTo(sx, sy);
        });
        g.stroke();
      }
      g.globalAlpha = was;
    }
  },
  standing(c, _m, p) {
    if (!p) return;
    if (p.a1 === 'prince:dance') {
      const k = Math.floor(p.t * DANCE_FPS);
      if (k / DANCE_FPS >= DANCE_FX.long) return;
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y, dance(k), sx, sy);
    } else if (p.a1 === 'prince:mask' && p.t < MASK_FLIGHT) {
      const w = maskWhere(p, p.t);
      const f = flungMask(p.a, p.t);
      const [sx, sy] = c.at(w.x, w.y);
      c.stand(w.x + w.y, mask(Math.floor((((f.spin / (Math.PI * 2)) % 1) + 1) % 1 * MASK_SPINS) % MASK_SPINS), sx, sy - Math.round(f.at[2] / 2));
    }
  },
};
