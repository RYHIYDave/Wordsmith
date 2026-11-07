// ENEMIES COMING IN UP OUT OF RIFTS, DRAWN (game/arrivals.ts ARRIVALS, off until he has seen it). His words, 7 Nov 2026, 00:05
// (Eastern): “make the enemies coming in a little more dramaitc than just spawning into thin air”.
// - THE RIFT: a dark tear opening in the floor where one is coming, its ragged edge and cracks the enemy's pink, flickering; it
//   holds while its one comes up, and closes behind it.
// - ITS ONE COMING UP: its own picture, rising up out of the floor (what is still below the floor not drawn), dark as it comes,
//   lit as it steps out.

import type { Sprite } from '../engine/px';
import { ARRIVALS } from '../game/arrivals';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/** The rift's colours: the floor torn open, nearly black; its inner glow; its edge and cracks, the enemy's pink. */
const VOID = '#0b0612';
const DEEP = '#2a0c2c';
const EDGE = ['#7a1058', '#e0287a', '#ff7aa8'] as const;
/** The smoke that boils up out of it. */
export const RIFT_SMOKE: readonly string[] = ['#1a0e22', '#2a1634', '#3a1c40', '#6e3a5c'];
export const RIFT_SPARK: readonly string[] = [EDGE[1], EDGE[2], EDGE[0]];

export interface Rift {
  x: number;
  y: number;
  /** Seconds since it began to open (below 0: not yet). */
  t: number;
  /** When its one is out (seconds from its opening), and all of it till it has closed. */
  out: number;
  dur: number;
  r: number;
  seed: number;
}

function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** How open a rift is, 0 to 1 (a little past 1 as it snaps open), at `t`. */
export function riftOpen(f: Rift): number {
  if (f.t < 0) return 0;
  const o = ARRIVALS.open;
  if (f.t < o) {
    const k = f.t / o;
    // (out fast and a little past, then back: 1 + 2.7(k-1)^3 + 1.7(k-1)^2)
    const c = k - 1;
    return Math.max(0, 1 + 2.7 * c * c * c + 1.7 * c * c);
  }
  if (f.t < f.out) return 1;
  return Math.max(0, 1 - (f.t - f.out) / Math.max(0.01, f.dur - f.out));
}

/** A rift on the floor (drawn with the floor, under every figure). */
export function drawRift(g: CanvasRenderingContext2D, c: Cam, f: Rift, clock: number): void {
  const k = riftOpen(f);
  if (k <= 0.02) return;
  const cx = wx(c, f.x, f.y);
  const cy = wy(c, f.x, f.y);
  const r = f.r * k;
  const flick = Math.floor(clock * 14);
  // (the floor round it darkened, then the tear itself, then its glowing inside)
  g.globalAlpha = 0.35 * Math.min(1, k);
  g.fillStyle = VOID;
  g.beginPath();
  g.ellipse(Math.round(cx), Math.round(cy), r * 26, r * 13, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  // the tear: ragged, its edge out and in by turns
  const n = 22;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rag = 0.72 + 0.38 * hash(f.seed + i, 3) + (i % 2 ? -0.12 : 0.1);
    pts.push([cx + Math.cos(a) * r * 18 * rag, cy + Math.sin(a) * r * 9 * rag]);
  }
  g.fillStyle = VOID;
  g.beginPath();
  g.moveTo(Math.round(pts[0][0]), Math.round(pts[0][1]));
  for (const [x, y] of pts) g.lineTo(Math.round(x), Math.round(y));
  g.closePath();
  g.fill();
  // its inside: a deep glow toward its back, as if it went down a long way
  g.globalAlpha = 0.85;
  g.fillStyle = DEEP;
  g.beginPath();
  g.ellipse(Math.round(cx), Math.round(cy - r * 2), r * 10, r * 4.5, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  // its edge, pixel by pixel, the pink flickering along it
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % n];
    const steps = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      const hot = hash(f.seed + i * 31 + s, flick);
      g.fillStyle = hot > 0.82 ? EDGE[2] : hot > 0.3 ? EDGE[1] : EDGE[0];
      g.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u), 1, 1);
    }
  }
  // cracks running out across the floor from it, the farther the more it is open
  const cracks = 5;
  for (let j = 0; j < cracks; j++) {
    const a = hash(f.seed, j + 40) * Math.PI * 2;
    const long = (0.5 + 0.7 * hash(f.seed, j + 60)) * r * Math.min(1, k * 1.2);
    let x = cx + Math.cos(a) * r * 17;
    let y = cy + Math.sin(a) * r * 8.5;
    const segs = 4;
    for (let s = 0; s < segs; s++) {
      const bend = (hash(f.seed + j, s) - 0.5) * 0.9;
      const nx = x + Math.cos(a + bend) * long * 6;
      const ny = y + Math.sin(a + bend) * long * 3;
      const steps = Math.max(2, Math.ceil(Math.hypot(nx - x, ny - y)));
      for (let q = 0; q < steps; q++) {
        const u = q / steps;
        g.globalAlpha = (1 - s / segs) * (hash(j * 7 + q, flick) > 0.2 ? 1 : 0.4);
        g.fillStyle = s === 0 ? EDGE[1] : EDGE[0];
        g.fillRect(Math.round(x + (nx - x) * u), Math.round(y + (ny - y) * u), 1, 1);
      }
      x = nx;
      y = ny;
    }
  }
  g.globalAlpha = 1;
}

/**
 * ITS ONE COMING UP: its picture with what is still below the floor cut away, at `u` of the way up (0: under the floor, 1: out).
 * Drawn where its feet are now: `down` game pixels below its floor point (the returned sprite is drawn at sy + down).
 */
export function risingSprite(sp: Sprite, u: number): { sp: Sprite; down: number } | null {
  const k = Math.max(0, Math.min(1, u));
  const above = Math.round(sp.ay * k);
  if (above <= 0) return null;
  const down = sp.ay - above;
  const img = sp.img;
  const scale = img.height / sp.h;
  const cut = Math.max(1, Math.round(above * scale));
  const cvs = document.createElement('canvas');
  cvs.width = img.width;
  cvs.height = img.height;
  const c = cvs.getContext('2d') as CanvasRenderingContext2D;
  c.drawImage(img, 0, 0, img.width, cut, 0, 0, img.width, cut);
  return { sp: { img: cvs, w: sp.w, h: sp.h, ax: sp.ax, ay: sp.ay, ...(sp.density ? { density: sp.density } : {}) }, down };
}

/** How far up its one is at `age` seconds of its coming (0 to 1): nothing while the rift opens, then up, fast then slowing. */
export function risenBy(age: number, rise: number): number {
  const o = ARRIVALS.open;
  if (age <= o) return 0;
  const k = Math.min(1, (age - o) / Math.max(0.01, rise - o));
  return 1 - (1 - k) * (1 - k);
}
