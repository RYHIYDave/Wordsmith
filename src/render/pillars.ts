// THE PILLARS (game/quests610.ts PILLARS, OFF): the cult's three obelisks round the Drowned Eye's ring, as they burn in his last
// phase and as they go out. Not the art chat's: a stand-in drawn on the floor at each one's foot until it draws them (posted to
// it, 7 Nov, 00:48): BURNING, a ring of the siege's pink (the enemy's) pulsing round the foot, its glow over the stones; PUT OUT
// WITH A PIECE, the friend's cyan, soft and still, where the piece was set; BROKEN BY BLOWS, a dark scorch.

import type { Pillar } from '../game/quests610';
import type { Cam } from './fx';
import { wx, wy } from './fx';

const PINK = '#ff4fa0';
const PINK_HOT = '#ffc1e0';
const CYAN = '#7fe8ff';
const SCORCH = '#120c10';

/** The pillars on the floor: drawn with the effects that lie flat (render.ts, after fx.drawGround). */
export function drawPillars(g: CanvasRenderingContext2D, c: Cam, ps: readonly Pillar[], clock: number): void {
  for (const p of ps) {
    const cx = Math.round(wx(c, p.x, p.y));
    const cy = Math.round(wy(c, p.x, p.y));
    if (p.lit) {
      const beat = 0.5 + 0.5 * Math.sin(clock * 5 + p.x);
      // its glow over the stones
      const grd = g.createRadialGradient(cx, cy, 2, cx, cy, 46);
      grd.addColorStop(0, PINK_HOT);
      grd.addColorStop(0.35, PINK);
      grd.addColorStop(1, 'rgba(255,79,160,0)');
      g.globalAlpha = 0.28 + 0.14 * beat;
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(cx, cy, 46, 23, 0, 0, Math.PI * 2);
      g.fill();
      g.globalCompositeOperation = 'source-over';
      // its ring, pulsing
      g.globalAlpha = 0.6 + 0.3 * beat;
      g.strokeStyle = PINK;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(cx, cy, 26 + beat * 4, 13 + beat * 2, 0, 0, Math.PI * 2);
      g.stroke();
      // the blows it has taken: cracks of light round the ring
      for (let k = 0; k < p.hits; k++) {
        const a = (k / 12) * Math.PI * 2 + 0.4;
        g.globalAlpha = 0.9;
        g.fillStyle = PINK_HOT;
        g.fillRect(Math.round(cx + Math.cos(a) * 22) - 1, Math.round(cy + Math.sin(a) * 11) - 1, 2, 2);
      }
    } else if (p.by === 'piece') {
      const grd = g.createRadialGradient(cx, cy, 1, cx, cy, 30);
      grd.addColorStop(0, '#e8fbff');
      grd.addColorStop(0.4, CYAN);
      grd.addColorStop(1, 'rgba(127,232,255,0)');
      g.globalAlpha = 0.45;
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(cx, cy, 30, 15, 0, 0, Math.PI * 2);
      g.fill();
      g.globalCompositeOperation = 'source-over';
    } else {
      g.globalAlpha = 0.5;
      g.fillStyle = SCORCH;
      g.beginPath();
      g.ellipse(cx, cy, 24, 12, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.globalAlpha = 1;
}
