// WHAT THE MOTH'S MOVES LEAVE ON THE TOP (art/moth_moves.ts), AND THE LAST CHAPTER IT SETTLES ON. A MOCK-UP: NOT IN THE
// GAME, behind MOTH_ON (art/moth.ts, off). Each is painted on a canvas of its own, its anchor on the Moth's own floor
// point, seen from in front or from behind as the Moth is (the game lays it there, under or over what it must):
//   THE GUST (the buffet): wind and dust rolling out over a cone before it, 140 degrees wide and 9 tiles long.
//   THE CLOUD (Dust): its scales drifting down over the top before it, 7 tiles across; where they settle, a haze: there
//     your words go dark (the game's).
//   THE BEAMS (the Eyes): from each of its four eyes, down to the top and along the line it stares, the top's whole
//     length: pale bone white, the Hush's dull pink at their core. Never cyan.
//   THE SWARM: a stream of little grey moths, real moths each (four wings, a body), fluttering across the top.
//   THE BEAT'S WIND (on the book): a ring of wind and dust rolling out over the whole top.
//   THE WORDS (its death): every word it swallowed flying home out of it: the game's own glyphs in their own colours.
//   THE LAST CHAPTER: open on the stones, its pages stirring in the wind of its wings.
// Everything crisp: each grain a whole game pixel (two of the picture's); nothing soft but the game's own shadow.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { GLYPH, WORD_COLOR, WORD_GLOW } from './icons';
import { hash } from './kit';
import type { Painted } from './kit';
import { FLAME } from './mkit';
import { BONE, FUR, FUR_PALE, HUSH_DUST, SCLERA, eyeOf } from './moth';
import type { MothGeom } from './moth';
import { BEAT_RING, BOOK, BUFFET_CONE, DUST_CLOUD, EYE_BEAMS, MOTH_DIES, MOTH_WORDS, SWARM } from './moth_moves';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { PaintView, Stage } from './skin';
import { add, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

/** Each effect's canvas: room for the top's whole length out from the Moth both ways round. */
export const FX_CANVAS = { w: 2000, h: 1160, ax: 1000, ay: 580 } as const;

const D2R = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const easeOut = (v: number): number => 1 - (1 - clamp01(v)) ** 3;

/** A fresh effect: its canvas, and a stage that knows where a point of the top is on it. */
function fresh(view: PaintView): { px: Px; st: Stage } {
  const st = stage(view, FX_CANVAS.ax, FX_CANVAS.ay, FX_CANVAS);
  return { px: new Px(FX_CANVAS.w, FX_CANVAS.h), st };
}
/** A grain, `size` game pixels square, on whole game pixels. */
function lay(px: Px, st: Stage, p: V3, col: string, size = 1): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x / 2 - size / 2) * 2;
  const yi = Math.round(y / 2 - size / 2) * 2;
  const n = size * 2;
  for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) px.set(xi + dx, yi + dy, col);
}
/** A line of grains from `a` to `b`, `size` game pixels thick, every `gap`-th left out (0: none). */
function streak(px: Px, st: Stage, a: V3, b: V3, col: string, size = 1, gap = 0, seed = 0): void {
  const [x0, y0] = st.at(a);
  const [x1, y1] = st.at(b);
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
  for (let i = 0; i <= n; i++) {
    if (gap && hash(i, seed, 8801) < gap) continue;
    lay(px, st, lerp3(a, b, i / n), col, size);
  }
}

// =============================================================================================
// THE GUST (the buffet)

/** The gust `t` seconds after the buffet lands: its front rolls out to the cone's edge in two thirds of a second, then thins and is gone. */
export const GUST_FX = { reach: 0.65, long: 1.25 } as const;
export function gustPainted(t: number, view: PaintView): Painted {
  const { px, st } = fresh(view);
  if (t < 0 || t > GUST_FX.long) return { px, lights: [] };
  const R = (1.2 + (BUFFET_CONE.tiles - 1.2) * easeOut(t / GUST_FX.reach)) * TILE3;
  const fade = 1 - sm((t - GUST_FX.reach) / (GUST_FX.long - GUST_FX.reach));
  const half = BUFFET_CONE.deg / 2;
  // the wind's front, and the fronts that trail it: broken arcs low over the stones
  for (let j = 0; j < 4; j++) {
    const r = R - j * 0.42 * TILE3;
    if (r < TILE3) continue;
    const col = j === 0 ? BONE[4] : j === 1 ? SCLERA[3] : j === 2 ? HUSH_DUST[3] : HUSH_DUST[2];
    const steps = Math.ceil((half * 2 * D2R * r) / 3);
    for (let k = 0; k <= steps; k++) {
      const a = (-half + (2 * half * k) / steps) * D2R;
      if (hash(Math.floor(k / 3), j, 8811) < 0.25 + 0.6 * (1 - fade) + 0.1 * j) continue;
      lay(px, st, [Math.cos(a) * r, Math.sin(a) * r, 3 + 7 * Math.abs(Math.sin(a * 5 + j)) * fade], col, j === 0 ? 2 : 1);
    }
  }
  // the wind's lines out from it, dashes running out
  for (let k = 0; k < 22; k++) {
    const a = (-half + (2 * half * (k + 0.5)) / 22 + (hash(k, 1, 8812) - 0.5) * 4) * D2R;
    for (let d = 0; d < 4; d++) {
      const s0 = ((t * 2.4 + d * 0.25 + hash(k, d, 8813) * 0.2) % 1) * R;
      const s1 = Math.min(R, s0 + 0.55 * TILE3);
      if (s0 < 0.8 * TILE3 || hash(k, d, 8814) > fade + 0.15) continue;
      streak(px, st, [Math.cos(a) * s0, Math.sin(a) * s0, 6], [Math.cos(a) * s1, Math.sin(a) * s1, 6], d % 2 ? SCLERA[2] : HUSH_DUST[3], 1, 0.15, k * 7 + d);
    }
  }
  // the dust it rolls before it, billowing up
  for (let i = 0; i < 420; i++) {
    const a = (-half + 2 * half * hash(i, 2, 8815)) * D2R;
    const r = R - hash(i, 3, 8815) * 1.6 * TILE3;
    if (r < TILE3 || hash(i, 4, 8815) > fade) continue;
    const z = hash(i, 5, 8815) * 46 * (0.4 + 0.6 * fade);
    lay(px, st, [Math.cos(a) * r, Math.sin(a) * r, z], HUSH_DUST[i % 4], hash(i, 6, 8815) < 0.3 ? 2 : 1);
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE CLOUD (Dust)

/** The cloud `t` seconds after the shake: its scales drift down for a second and more, settle into a haze, and the haze lingers (the game says how long: shown here four seconds) and thins away. */
export const CLOUD_FX = { fall: 1.4, hold: 4.0, fade: 1.2 } as const;
const cloudR = (DUST_CLOUD.tiles / 2) * TILE3;
const cloudC: V3 = [DUST_CLOUD.ahead * TILE3, 0, 0];
/** How far inside the cloud's ragged edge a point of the top is (its own lengths; less than nothing, outside). */
function inCloud(x: number, y: number): number {
  const dx = x - cloudC[0];
  const dy = y - cloudC[1];
  const a = Math.atan2(dy, dx);
  const rag = 0.08 * Math.sin(a * 5 + 1) + 0.05 * Math.sin(a * 11 + 2) + 0.03 * Math.sin(a * 23);
  return cloudR * (1 + rag) - Math.hypot(dx, dy);
}
export function cloudPainted(t: number, view: PaintView): Painted {
  const { px, st } = fresh(view);
  const end = CLOUD_FX.fall + CLOUD_FX.hold + CLOUD_FX.fade;
  if (t < 0 || t > end) return { px, lights: [] };
  const thin = sm((t - CLOUD_FX.fall - CLOUD_FX.hold) / CLOUD_FX.fade);
  // THE HAZE where it has settled: a dither of the Hush over the stones, thicker toward its middle; its edge paler
  const haze = sm((t - 0.35) / (CLOUD_FX.fall - 0.2)) * (1 - thin);
  if (haze > 0) {
    const x0 = cloudC[0] - cloudR * 1.2;
    const x1 = cloudC[0] + cloudR * 1.2;
    for (let gx = x0; gx <= x1; gx += 2.2) {
      for (let gy = -cloudR * 1.2; gy <= cloudR * 1.2; gy += 2.2) {
        const e = inCloud(gx, gy);
        if (e < 0) continue;
        const deep = clamp01(e / (cloudR * 0.5));
        const [sx, sy] = st.at([gx, gy, 0]);
        const cx = Math.round(sx / 2);
        const cy = Math.round(sy / 2);
        const dither = ((cx + cy) & 1) === 0;
        const n = hash(cx, cy, 8821);
        if (e < 5) {
          if (n < haze * 0.8) px.set(cx * 2, cy * 2, HUSH_DUST[2]).set(cx * 2 + 1, cy * 2, HUSH_DUST[2]).set(cx * 2, cy * 2 + 1, HUSH_DUST[2]).set(cx * 2 + 1, cy * 2 + 1, HUSH_DUST[2]);
          continue;
        }
        if (!dither || n > haze * (0.45 + 0.5 * deep)) continue;
        const col = n < 0.12 ? HUSH_DUST[2] : deep > 0.5 ? '#2a2636' : HUSH_DUST[0];
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) px.set(cx * 2 + dx, cy * 2 + dy, col);
      }
    }
  }
  // ITS SCALES drifting down, fluttering, and lying where they settle
  for (let i = 0; i < 520; i++) {
    const a = hash(i, 1, 8822) * Math.PI * 2;
    const r = Math.sqrt(hash(i, 2, 8822)) * cloudR * 0.98;
    const x = cloudC[0] + Math.cos(a) * r;
    const y = cloudC[1] + Math.sin(a) * r;
    if (inCloud(x, y) < 0) continue;
    const delay = 0.5 * hash(i, 3, 8822);
    const fall = 0.8 + 0.6 * hash(i, 4, 8822);
    const k = clamp01((t - delay) / fall);
    if (t < delay) continue;
    const z0 = 150 + 130 * hash(i, 5, 8822);
    const z = Math.max(1, z0 * (1 - k * (2 - k)));
    if (z <= 1 && hash(i, 6, 8822) < thin * 1.2) continue;
    const flutter = 7 * Math.sin(t * (5 + 3 * hash(i, 7, 8822)) + i) * (1 - k);
    lay(px, st, [x + flutter, y + flutter * 0.6, z], z <= 1 ? HUSH_DUST[i % 2] : HUSH_DUST[1 + (i % 3)], hash(i, 8, 8822) < 0.25 ? 2 : 1);
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE BEAMS (the Eyes)

/** The beams `t` seconds after the strike lands (the strike's first frame, at less than nothing, half out): held, flickering, then thinning to nothing. */
export const BEAM_FX = { hold: 0.45, fade: 0.3, down: 2 } as const;
/** Where each beam goes: from its eye, down to the top `down` tiles out along its line, and on along it the top's whole length. */
export function beamPaths(G: MothGeom): { eye: V3; touch: V3; far: V3; name: string }[] {
  return G.wings.map((w) => {
    const name = `${w.hind ? 'hind' : 'fore'}${w.side === 1 ? 'L' : 'R'}`;
    const deg = (EYE_BEAMS.fan as Record<string, number>)[name] * D2R;
    const way: V3 = [Math.cos(deg), Math.sin(deg), 0];
    return { eye: eyeOf(w), touch: mul(way, BEAM_FX.down * TILE3), far: mul(way, EYE_BEAMS.tiles * TILE3), name };
  });
}
export function beamsPainted(t: number, view: PaintView, G: MothGeom): Painted {
  const { px, st } = fresh(view);
  const lights: Light[] = [];
  const FR = 1 / 30;
  if (t < -FR - 1e-6 || t > BEAM_FX.hold + BEAM_FX.fade) return { px, lights };
  // (out in two frames: half way on the first, the whole length on the second)
  const out = t < -1e-6 ? 0.5 : 1;
  const thin = sm((t - BEAM_FX.hold) / BEAM_FX.fade);
  const flick = Math.floor(t * 30) % 2;
  const wide = (EYE_BEAMS.wide / 2) * TILE3;
  for (const b of beamPaths(G)) {
    const way = norm(sub(b.far, b.touch));
    const side: V3 = [-way[1], way[0], 0];
    const end = lerp3(b.touch, b.far, out);
    // DOWN FROM THE EYE to the top: a shaft of light, its core the dull pink, its sides bone white
    const air = (col: string, size: number, gap: number, off: number): void => streak(px, st, add(b.eye, mul(side, off)), add(b.touch, mul(side, off)), col, size, gap, b.name.length);
    if (thin < 0.95) {
      air(BONE[3], 1, thin, -5);
      air(BONE[3], 1, thin, 5);
      air(SCLERA[4], 2, thin, -2.5);
      air(SCLERA[4], 2, thin, 2.5);
      air(flick ? FLAME[1] : FLAME[2], 2, thin, 0);
    }
    // ALONG THE TOP, the line it stares: a band of light the beam's width, burning, its core the dull pink
    for (const [off, col, size] of [[-wide, BONE[2], 1], [wide, BONE[2], 1], [-wide * 0.55, SCLERA[3], 1], [wide * 0.55, SCLERA[3], 1], [-wide * 0.22, SCLERA[4], 2], [wide * 0.22, SCLERA[4], 2], [0, flick ? FLAME[1] : FLAME[2], 2]] as const) {
      streak(px, st, add(b.touch, mul(side, off)), add(end, mul(side, off)), col, size, Math.min(0.9, thin + (Math.abs(off) > wide * 0.9 ? 0.35 : 0)), Math.round(off));
    }
    // sparks off the stones along it
    for (let i = 0; i < 40; i++) {
      if (hash(i, flick, 8831) < thin) continue;
      const k = hash(i, 1 + flick, 8832);
      const p = lerp3(b.touch, end, k);
      lay(px, st, add(p, add(mul(side, (hash(i, 3, 8833) - 0.5) * wide * 2.2), [0, 0, 2 + 14 * hash(i, 4, 8833)])), i % 3 ? SCLERA[4] : FLAME[2], 1);
    }
    for (let k = 0; k <= 4; k++) {
      const [x, y] = st.at(lerp3(b.touch, end, k / 4));
      lights.push({ x, y, r: 60, color: FLAME[1], a: 0.16 * (1 - thin) });
    }
  }
  return { px, lights };
}

// =============================================================================================
// THE SWARM

/** The swarm `t` seconds after it bursts off the Moth from `from` (its thorax): each little moth along the stream, fluttering. */
export function swarmAt(t: number, from: V3): { p: V3; head: V3; flap: number; size: number; i: number }[] {
  const out: { p: V3; head: V3; flap: number; size: number; i: number }[] = [];
  const L = SWARM.tiles * TILE3;
  for (let i = 0; i < SWARM.n; i++) {
    const delay = 0.85 * hash(i, 1, 8841);
    const v = (5.4 + 2 * hash(i, 2, 8841)) * TILE3;
    const s = v * (t - delay);
    if (s < 0 || s > L) continue;
    // (the stream: out of it, down to the top, and away across it in a long winding river, widening)
    const k = s / L;
    const wide = (SWARM.wide / 2) * TILE3 * (0.25 + 0.75 * clamp01(s / (4 * TILE3)));
    const lat = (hash(i, 3, 8841) - 0.5) * 2 * wide + 10 * Math.sin(t * 3 + i);
    const wind = 1.8 * TILE3 * Math.sin(k * Math.PI * 2.2);
    const drop = clamp01(s / (3 * TILE3));
    const z = from[2] * (1 - sm(drop)) + (30 + 46 * hash(i, 4, 8841) + 12 * Math.sin(t * 7 + i * 1.3)) * sm(drop);
    const p: V3 = [from[0] + s, from[1] + wind + lat, z];
    const ahead: V3 = [1, 1.8 * Math.PI * 2.2 * Math.cos(k * Math.PI * 2.2) / SWARM.tiles, 0];
    out.push({ p, head: norm(ahead), flap: (t * (13 + 5 * hash(i, 5, 8841)) + hash(i, 6, 8841)) % 1, size: 0.85 + 0.4 * hash(i, 7, 8841), i });
  }
  return out;
}
/** One little moth, `size` times its own, flapping (`flap` round once a wingbeat): a body, four real wings, from above. */
function littleMoth(px: Px, st: Stage, p: V3, head: V3, flap: number, size: number, i: number): void {
  const [cx, cy] = st.at(p);
  const [hx, hy] = st.seen(head);
  const hl = Math.hypot(hx, hy) || 1;
  const ux = hx / hl;
  const uy = hy / hl;
  // (its wings spread: wide on the downstroke, a narrow V up over its back on the up)
  const open = 0.25 + 0.75 * Math.abs(Math.cos(flap * Math.PI * 2));
  const sc = 2 * size;
  const ink = '#0e0c24';
  const wingCol = i % 3 === 0 ? '#7f7b7f' : i % 3 === 1 ? '#5d5a5e' : '#6c686c';
  // (in its own lengths: `a` along its body, `b` across; a forewing out and forward, a hindwing out and back, each a real shape)
  const fore: [number, number][] = [[0.6, 0.4], [1.2, 3.6 * open], [0.2, 4.4 * open], [-0.6, 3.0 * open], [-0.4, 0.5]];
  const hind: [number, number][] = [[-0.3, 0.4], [-0.6, 2.8 * open], [-2.0, 2.6 * open], [-2.2, 0.8 * open], [-1.0, 0.3]];
  const inside = (poly: [number, number][], a: number, b: number): boolean => {
    let c = false;
    for (let j = 0, k = poly.length - 1; j < poly.length; k = j++) {
      const [ya, xa] = poly[j];
      const [yb, xb] = poly[k];
      if (xa > b !== xb > b && a < ((ya - yb) * (b - xb)) / (xa - xb) + yb) c = !c;
    }
    return c;
  };
  const r = Math.ceil(5 * sc) + 2;
  const x0 = Math.round(cx / 2) * 2;
  const y0 = Math.round(cy / 2) * 2;
  const shape = (gx: number, gy: number): number => {
    // (each game pixel: which part of it, if any: 1 wing, 2 body)
    const dx = (gx * 2 + 1 - (cx - x0)) / sc;
    const dy = (gy * 2 + 1 - (cy - y0)) / sc;
    const a = dx * ux + dy * uy;
    const b = -dx * uy + dy * ux;
    if (Math.abs(b) < 0.55 && a > -2.4 && a < 1.6) return 2;
    if (inside(fore, a, Math.abs(b)) || inside(hind, a, Math.abs(b))) return 1;
    return 0;
  };
  const R = Math.ceil(r / 2);
  for (let gy = -R; gy <= R; gy++) {
    for (let gx = -R; gx <= R; gx++) {
      const k = shape(gx, gy);
      let col: string | null = null;
      if (k === 2) col = FUR[1];
      else if (k === 1) col = (gx + gy) % 3 === 0 ? FUR_PALE[2] : wingCol;
      else if (shape(gx - 1, gy) || shape(gx + 1, gy) || shape(gx, gy - 1) || shape(gx, gy + 1)) col = ink;
      if (!col) continue;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) px.set(x0 + gx * 2 + dx, y0 + gy * 2 + dy, col);
    }
  }
}
export function swarmPainted(t: number, view: PaintView, from: V3): Painted {
  const { px, st } = fresh(view);
  if (t < 0) return { px, lights: [] };
  // (the far ones first)
  const all = swarmAt(t, from).sort((a, b) => st.near(a.p) - st.near(b.p));
  for (const m of all) littleMoth(px, st, m.p, m.head, m.flap, m.size, m.i);
  return { px, lights: [] };
}

// =============================================================================================
// THE BEAT'S WIND (on the book)

export const WAVE_FX = { reach: 0.75, long: 1.25 } as const;
export function wavePainted(t: number, view: PaintView, at: V3 = [0, 0, 0]): Painted {
  const { px, st } = fresh(view);
  if (t < 0 || t > WAVE_FX.long) return { px, lights: [] };
  const R = (1.6 + (BEAT_RING.tiles - 1.6) * easeOut(t / WAVE_FX.reach)) * TILE3;
  const fade = 1 - sm((t - WAVE_FX.reach) / (WAVE_FX.long - WAVE_FX.reach));
  for (let j = 0; j < 4; j++) {
    const r = R - j * 0.45 * TILE3;
    if (r < TILE3) continue;
    const col = j === 0 ? BONE[4] : j === 1 ? SCLERA[3] : j === 2 ? HUSH_DUST[3] : HUSH_DUST[2];
    const steps = Math.ceil((Math.PI * 2 * r) / 3);
    for (let k = 0; k < steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      if (hash(Math.floor(k / 3), j, 8851) < 0.22 + 0.6 * (1 - fade) + 0.1 * j) continue;
      lay(px, st, add(at, [Math.cos(a) * r, Math.sin(a) * r, 3 + 8 * Math.abs(Math.sin(a * 6 + j)) * fade]), col, j === 0 ? 2 : 1);
    }
  }
  for (let i = 0; i < 900; i++) {
    const a = hash(i, 2, 8852) * Math.PI * 2;
    const r = R - hash(i, 3, 8852) * 1.8 * TILE3;
    if (r < TILE3 || hash(i, 4, 8852) > fade) continue;
    lay(px, st, add(at, [Math.cos(a) * r, Math.sin(a) * r, hash(i, 5, 8852) * 52 * (0.4 + 0.6 * fade)]), HUSH_DUST[i % 4], hash(i, 6, 8852) < 0.3 ? 2 : 1);
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE WORDS (its death): every word it swallowed flying home

/** The words `t` seconds into its death (MOTH_DIES.words): out of it (`from`, a point of it at each word's birth), up and away over the top in every way, thinning out far off. */
export function wordsPainted(t: number, view: PaintView, from: (t: number) => V3): Painted {
  const { px, st } = fresh(view);
  const [w0, w1] = MOTH_DIES.words;
  const N = 110;
  for (let i = 0; i < N; i++) {
    const born = w0 + (w1 - w0) * hash(i, 1, 8861);
    const age = t - born;
    if (age < 0 || age > 2.2) continue;
    const word = MOTH_WORDS[i % MOTH_WORDS.length];
    const rows = GLYPH[word];
    if (!rows || !rows.length) continue;
    const o = from(born);
    const a = hash(i, 2, 8861) * Math.PI * 2;
    const far = (6 + 7 * hash(i, 3, 8861)) * TILE3;
    const k = easeOut(age / 2.2);
    // (up out of it, then out and away, home)
    const p: V3 = [o[0] + Math.cos(a) * far * k, o[1] + Math.sin(a) * far * k, o[2] + 110 * Math.sin(Math.PI * Math.min(1, age / 1.4)) + 40 * age];
    if (age > 1.8 && (i + Math.floor(age * 30)) % 2) continue;
    const [sx, sy] = st.at(p);
    const x0 = Math.round(sx / 2) * 2 - 6;
    const y0 = Math.round(sy / 2) * 2 - 6;
    for (let gy = 0; gy < rows.length; gy++) {
      for (let gx = 0; gx < rows[gy].length; gx++) {
        const ch = rows[gy].charAt(gx);
        if (ch === '.') continue;
        const col = ch === 'o' ? WORD_GLOW[word] : WORD_COLOR[word];
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) px.set(x0 + gx * 2 + dx, y0 + gy * 2 + dy, col);
      }
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE LAST CHAPTER: open on the stones, where the Moth comes down

/** Its colours: old paper, bone white; the ink faded; its binding. */
const PAPER: readonly [string, string, string, string, string] = ['#6a645a', '#948d80', '#b8b0a2', '#d6cfc1', '#ebe5d8'];
const BINDING: readonly [string, string, string, string, string] = ['#141216', '#221f24', '#332f36', '#48434b', '#5e5962'];
/**
 * THE LAST CHAPTER, torn out of its book and lying open on the stones, a few loose leaves beside it; its pages lifting in
 * the wind of the wings (`wind`, 0 still to 1 flung up). No word on it can be read: it is a name, and the thing it names is
 * the Hush itself. Painted as the figures are (art/new_mobs3.ts), with no edge of light: it is not a creature.
 */
export function chapterPainted(view: PaintView, wind = 0, t = 0): Painted {
  const can = { w: 320, h: 240, ax: 160, ay: 150 };
  const st = stage(view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const W = BOOK.w / 2;
  const Dp = BOOK.d / 2;
  const pageSkin = (lines: boolean) => (a: number, b: number, _front: boolean, tone: number): string | null => {
    // (faded lines of a hand no one can read, and a torn edge)
    const torn = Math.abs(a) > W * 0.98 - 3 * hash(Math.round(b), 1, 8871);
    if (torn) return null;
    const row = ((b + 40) % 4.2) < 0.9 && Math.abs(a) < W * 0.82 && Math.abs(a) > W * 0.1;
    if (lines && row && hash(Math.round(a / 2), Math.round(b), 8872) < 0.7) return PAPER[Math.max(0, tone - 2)];
    return PAPER[Math.max(0, Math.min(4, tone))];
  };
  // its two leaves open on the stones, sagging to the spine
  for (const s of [1, -1]) {
    const lift = 4 + 9 * wind * (0.5 + 0.5 * Math.sin(t * 13 + s));
    const c: V3 = [BOOK.at[0], BOOK.at[1] + s * W * 0.5, 3 + lift * 0.4];
    put('pages', `leaf${s}`, { k: 'panel', c, u: [0, s * W * 0.5, lift * 0.35], v: [Dp, 0, 0], skin: pageSkin(true) });
  }
  // a leaf lifting in the wind, turning over
  if (wind > 0.05) {
    const ang = (20 + 120 * wind * (0.5 + 0.5 * Math.sin(t * 9))) * D2R;
    const c: V3 = [BOOK.at[0], BOOK.at[1] + Math.cos(ang) * W * 0.25, 4 + Math.sin(ang) * W * 0.25];
    put('pages', 'flutter', { k: 'panel', c, u: [0, Math.cos(ang) * W * 0.25, Math.sin(ang) * W * 0.25], v: [Dp * 0.95, 0, 0], skin: pageSkin(true) });
  }
  // its spine, and the torn stubs of the binding
  put('binding', 'spine', { k: 'rod', a: [BOOK.at[0] - Dp, BOOK.at[1], 2.5], b: [BOOK.at[0] + Dp, BOOK.at[1], 2.5], ra: 2.6, rb: 2.6, ramp: BINDING });
  for (let k = 0; k < 4; k++) put('binding', 'thread', { k: 'rod', a: [BOOK.at[0] - Dp + k * Dp * 0.6, BOOK.at[1], 4], b: [BOOK.at[0] - Dp + k * Dp * 0.6 + 4, BOOK.at[1] + (k % 2 ? 5 : -5), 1.5], ra: 0.8, rb: 0.5, ramp: BONE });
  // loose leaves beside it on the stones
  for (const [dx, dy, turn] of [[-Dp * 2.1, W * 1.6, 25], [Dp * 1.9, -W * 1.5, -35], [-Dp * 1.2, -W * 2.0, 70]] as const) {
    const a = turn * D2R;
    const c: V3 = [BOOK.at[0] + dx, BOOK.at[1] + dy, 1.2];
    put('leaves', `loose${dx}`, { k: 'panel', c, u: [Math.cos(a) * W * 0.45, Math.sin(a) * W * 0.45, 0], v: [-Math.sin(a) * Dp * 0.85, Math.cos(a) * Dp * 0.85, 0.6], skin: pageSkin(false) });
  }
  const lights = paintBits(st, bits, [BOOK.at[0], BOOK.at[1], 5]);
  return { px: st.whole(null), lights };
}
/** The chapter's own canvas: its anchor is the Moth's floor point. */
export const CHAPTER_CANVAS = { w: 320, h: 240, ax: 160, ay: 150 } as const;
