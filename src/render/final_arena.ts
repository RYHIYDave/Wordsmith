// THE BOTTOM OF THE SHAFT, THE FINAL BOSS'S ARENA, AS THE RENDERER ASKS IT (render/looks.ts): its ground one picture painted once
// (art/final_arena.ts), behind everything; no tiles, no walls of the game's own; past the picture the same dark rock going on; its
// light: the portal's cyan falling where he came down, his seal's faint pink in the middle. Behind ENDLESS_KEY (game/endless_key.ts),
// off: its level is only ever made with it on.

import { FINAL_ARRIVE, FINAL_GROUND, FINAL_PLACE, finalGroundAt, paintFinalGround } from '../art/final_arena';
import type { Sprite } from '../engine/px';
import type { Level } from '../game/state';
import type { LookLight, LookStand, LookView } from './looks';

const NIGHT = '#07060f';

/** A picture painted on a canvas at the fine grain (two picture pixels to a game pixel), as a Sprite: its anchor in game pixels. */
function fine(cv: HTMLCanvasElement, ax: number, ay: number): Sprite {
  return { img: cv, w: cv.width / 2, h: cv.height / 2, ax, ay, density: 2 };
}
let emptyTile: Sprite | null = null;
/** A floor tile that draws nothing (the ground is one picture, behind everything). */
function nothing(): Sprite {
  if (!emptyTile) {
    const cv = document.createElement('canvas');
    cv.width = 2;
    cv.height = 2;
    emptyTile = { img: cv, w: 0, h: 0, ax: 0, ay: 0 };
  }
  return emptyTile;
}

/** THE PORTAL'S LIGHT where he came down (the friend's cyan, from above); HIS SEAL's pink, faint. */
const GLOW = {
  portal: { up: 30, r: 90, color: '#22d0e0', a: 0.3 },
  seal: { up: 2, r: 60, color: '#e0287a', a: 0.16 },
} as const;

export class FinalArenaView implements LookView {
  readonly dark = 0.55;
  readonly tint = [7, 6, 15] as const;
  readonly vignette = 0.3;
  private ground: Sprite | null = null;
  private rock: HTMLCanvasElement | null = null;
  private beam: Sprite | null = null;
  private lit: { of: Level; list: LookLight[] } | null = null;
  /** How long its ground took to paint, ms. */
  readonly cost = { ground: 0 };

  on(L: Level): boolean {
    return !!L.final;
  }
  forget(): void {
    if (this.ground) {
      (this.ground.img as HTMLCanvasElement).width = 0;
      (this.ground.img as HTMLCanvasElement).height = 0;
    }
    this.ground = null;
    this.beam = null;
    this.lit = null;
  }
  warm(): void {
    void this.G();
  }
  private G(): Sprite {
    if (this.ground) return this.ground;
    const G = paintFinalGround();
    this.cost.ground = G.ms;
    return (this.ground = fine(G.canvas, -G.gx, -G.gy));
  }
  laid(): Sprite | null {
    return null;
  }
  flags(): Sprite {
    return nothing();
  }
  face(): Sprite {
    return nothing();
  }
  unfaced(_L: Level, _i: number, which: number): number {
    return which;
  }
  graded(s: Sprite): Sprite {
    return s;
  }
  /** Past the picture's edges, the same dark rock going on, and the night over the wall's top (as the Rim's: render/rim.ts). */
  behind(g: CanvasRenderingContext2D, ox: number, oy: number, W: number, H: number): void {
    const S = this.G();
    if (!this.rock) {
      const cv = document.createElement('canvas');
      cv.width = 4;
      cv.height = 4;
      const c = cv.getContext('2d') as CanvasRenderingContext2D;
      const h = FINAL_GROUND.h * 2;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          c.fillStyle = '#' + finalGroundAt(i, h - 4 + j).toString(16).padStart(6, '0');
          c.fillRect(i, j, 1, 1);
        }
      }
      this.rock = cv;
    }
    const pat = g.createPattern(this.rock, 'repeat');
    if (!pat || typeof DOMMatrix === 'undefined') return;
    const x0 = ox - S.ax;
    const y0 = oy - S.ay;
    pat.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, x0, y0]));
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
    if (y0 > 0) {
      const half = Math.round(FINAL_PLACE.wall * Math.SQRT2 * 16);
      g.fillStyle = NIGHT;
      g.fillRect(ox - half, 0, half * 2, y0);
    }
  }
  back(): readonly LookStand[] {
    return [{ x: 0, y: 0, s: this.G() }];
  }
  /** THE PORTAL'S LIGHT falling where he came down: a column of the friend's cyan, faint, from above. */
  flats(L: Level, t: number): readonly LookStand[] {
    const A = L.final?.arrive ?? FINAL_ARRIVE;
    if (!this.beam) {
      const cv = document.createElement('canvas');
      cv.width = 120;
      cv.height = 360;
      const g = cv.getContext('2d') as CanvasRenderingContext2D;
      const grad = g.createLinearGradient(0, 0, 0, 360);
      grad.addColorStop(0, 'rgba(34,208,224,0)');
      grad.addColorStop(0.6, 'rgba(34,208,224,0.18)');
      grad.addColorStop(1, 'rgba(127,232,255,0.42)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(34, 0);
      g.lineTo(86, 0);
      g.lineTo(104, 340);
      g.ellipse(60, 340, 44, 20, 0, 0, Math.PI);
      g.lineTo(16, 340);
      g.closePath();
      g.fill();
      this.beam = fine(cv, 30, 175);
    }
    // (the warped wordsmith dead: the way back up, the light brighter, beating)
    if (L.final?.won) return [{ x: A.x, y: A.y, s: this.beam, add: true, alpha: 1 }, { x: A.x, y: A.y, s: this.beam, add: true, alpha: 0.35 + 0.35 * Math.sin(t * 4) }];
    return [{ x: A.x, y: A.y, s: this.beam, add: true, alpha: 0.75 + 0.2 * Math.sin(t * 1.7) }];
  }
  stands(): readonly LookStand[] {
    return [];
  }
  lights(L: Level): readonly LookLight[] {
    if (this.lit && this.lit.of === L) return this.lit.list;
    const A = L.final?.arrive ?? FINAL_ARRIVE;
    const list: LookLight[] = [
      { x: A.x, y: A.y, up: GLOW.portal.up, r: 130, strength: 0.9, glow: { r: GLOW.portal.r, color: GLOW.portal.color, a: GLOW.portal.a }, still: true },
      { x: FINAL_PLACE.cx, y: FINAL_PLACE.cy, up: GLOW.seal.up, r: 150, strength: 0.55, glow: { r: GLOW.seal.r, color: GLOW.seal.color, a: GLOW.seal.a } },
    ];
    this.lit = { of: L, list };
    return list;
  }
}
