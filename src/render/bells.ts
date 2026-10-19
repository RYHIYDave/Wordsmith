// ACT 2, THE BELLS, DRAWN (the rules: game/bells.ts and Game's "ACT 2: THE BELLS"; behind ACT2, off).
//
// THE HUSH OVER ITS GROUND (his doc: "the Hush pours out of it like smoke, a grey fog over a fixed area round the bell, its edge
// a wall of mist"): the tiles it still lies on (BellsState.mask) laid as one soft picture, a grey veil thickening into a wall of
// mist at its edge, over what stands and under the dark, drawn in the world's own slant (one picture a frame, made again only
// as a bell chips it back). It breathes a little; as the last bell rings it shatters away in a moment; as the clock runs out it
// lifts, slowly.
// THE BELLS STILL TO RING, MARKED AT THE SCREEN'S EDGE (his doc: "each marked on the minimap with an arrow at the edge of the
// screen"): for each one off the screen, an arrow at the edge pointing to it, in the friend's cyan (what glows on a friend is
// cyan: they are his to ring). The minimap's veil and marks and the clock are the HUD's (ui/hud.ts).

import type { BellsState } from '../game/bells';
import type { Level } from '../game/state';
import type { Cam } from './fx';
import { wx, wyFlat } from './fx';

/** Picture pixels a tile, for the Hush's picture (its edge's softness is the smoothing between them). */
const SC = 2;
/** The fog's colour, its strength over its ground and at its wall of mist. */
const FOG = { r: 176, g: 172, b: 190, body: 0.42, wall: 1.0, alpha: 0.36 };
/** The arrows' cyan (art/kit.ts CYAN), their ink, and how far in from the edge they stand (game pixels). */
const ARROW = { fill: '#22d0e0', hi: '#b8fff8', ink: '#0c1018', inset: 14 };

export class BellsLook {
  private cvs: HTMLCanvasElement | null = null;
  private level: Level | null = null;
  private version = -1;

  /** The Hush's picture for the level as it stands now (made again when a bell has chipped it). */
  private picture(L: Level, B: BellsState): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;
    if (this.cvs && this.level === L && this.version === B.version) return this.cvs;
    const f = L.floor;
    const w = f.w * SC;
    const h = f.h * SC;
    // (the mask at SC to a tile, blurred twice over three of its pixels: about a tile and a half of soft edge)
    let a: Float32Array = new Float32Array(w * h);
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
      if (!B.mask[ty * f.w + tx]) continue;
      for (let j = 0; j < SC; j++) for (let i = 0; i < SC; i++) a[(ty * SC + j) * w + tx * SC + i] = 1;
    }
    const blur = (src: Float32Array, r: number): Float32Array => {
      const tmp = new Float32Array(w * h);
      const out = new Float32Array(w * h);
      for (let y = 0; y < h; y++) {
        let s = 0;
        for (let x = -r; x <= r; x++) s += src[y * w + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
          tmp[y * w + x] = s / (2 * r + 1);
          s += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
        }
      }
      for (let x = 0; x < w; x++) {
        let s = 0;
        for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
          out[y * w + x] = s / (2 * r + 1);
          s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
        }
      }
      return out;
    };
    a = blur(blur(a, 2), 2);
    const cvs = this.cvs && this.cvs.width === w && this.cvs.height === h ? this.cvs : document.createElement('canvas');
    cvs.width = w;
    cvs.height = h;
    const c = cvs.getContext('2d') as CanvasRenderingContext2D;
    const img = c.createImageData(w, h);
    for (let k = 0; k < w * h; k++) {
      const v = a[k];
      if (v <= 0.003) continue;
      // (its body, and a wall of mist where the fog meets the clear air: brightest half way)
      const al = Math.min(1, FOG.body * v + FOG.wall * 4 * v * (1 - v) * 0.6);
      img.data[k * 4] = FOG.r;
      img.data[k * 4 + 1] = FOG.g;
      img.data[k * 4 + 2] = FOG.b;
      img.data[k * 4 + 3] = Math.round(al * 255);
    }
    c.putImageData(img, 0, 0);
    this.cvs = cvs;
    this.level = L;
    this.version = B.version;
    return cvs;
  }

  /** THE HUSH over its ground: call after what stands, before the dark. */
  fog(g: CanvasRenderingContext2D, cam: Cam, L: Level, t: number): void {
    const B = L.bells;
    if (!B) return;
    let k = 0;
    if (B.phase === 'on') k = Math.min(1, B.t / 0.8);
    else if (B.phase === 'won') k = Math.max(0, 1 - B.since / 0.6);
    else if (B.phase === 'lost') k = Math.max(0, 1 - B.since / 2.5);
    if (k <= 0) return;
    const cvs = this.picture(L, B);
    if (!cvs) return;
    const ox = wx(cam, 0, 0);
    const oy = wyFlat(cam, 0, 0);
    g.save();
    g.imageSmoothingEnabled = true;
    g.globalAlpha = k * (FOG.alpha + 0.05 * Math.sin(t * 1.3));
    // (a tile of the picture is SC pixels: the world's x runs 16 across and 8 down a tile, its y 16 back and 8 down)
    g.transform(16 / SC, 8 / SC, -16 / SC, 8 / SC, ox, oy);
    g.drawImage(cvs, 0, 0);
    g.restore();
  }

  /** THE BELLS STILL TO RING, off the screen: an arrow at its edge pointing to each (call over the dark, under the HUD). */
  arrows(g: CanvasRenderingContext2D, cam: Cam, L: Level, W: number, H: number, t: number): void {
    const B = L.bells;
    if (!B || B.phase !== 'on') return;
    // (the frame the arrows keep inside: clear of the clock and the boss's bar at the top, and of the attacks at the foot)
    const x0 = ARROW.inset;
    const x1 = W - ARROW.inset;
    const y0 = 36;
    const y1 = H - 48;
    const cx = W / 2;
    const cy = (y0 + y1) / 2;
    const bob = Math.sin(t * 6) * 1.5;
    B.plan.bells.forEach((b, i) => {
      if (B.rung[i]) return;
      const sx = wx(cam, b.x, b.y);
      const sy = wyFlat(cam, b.x, b.y) - 14;
      if (sx >= x0 && sx <= x1 && sy >= y0 - 20 && sy <= H - 8) return;
      // (where the line from the middle of the frame to it leaves the frame)
      const dx = sx - cx;
      const dy = sy - cy;
      const kx = dx > 0 ? (x1 - cx) / dx : dx < 0 ? (x0 - cx) / dx : Infinity;
      const ky = dy > 0 ? (y1 - cy) / dy : dy < 0 ? (y0 - cy) / dy : Infinity;
      const s = Math.min(kx, ky);
      const ax = cx + dx * s;
      const ay = cy + dy * s;
      const ang = Math.atan2(dy, dx);
      g.save();
      g.translate(Math.round(ax + Math.cos(ang) * bob), Math.round(ay + Math.sin(ang) * bob));
      g.rotate(ang);
      const tri = (r: number): void => {
        g.beginPath();
        g.moveTo(r, 0);
        g.lineTo(-r * 0.75, -r * 0.7);
        g.lineTo(-r * 0.4, 0);
        g.lineTo(-r * 0.75, r * 0.7);
        g.closePath();
      };
      g.fillStyle = ARROW.ink;
      tri(8);
      g.fill();
      g.fillStyle = Math.floor(t * 3) % 2 === 0 ? ARROW.fill : ARROW.hi;
      tri(6);
      g.fill();
      g.restore();
    });
  }
}
