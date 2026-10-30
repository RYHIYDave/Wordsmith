// FLOOR 18'S QUEEN'S GUARD, THE MIRROR DUELLISTS: WHAT THEIR BLOWS LEAVE (the art chat, 30 Oct 2026). A MOCK-UP: NOT IN
// THE GAME, behind QGUARD_ON (art/queens_guard.ts, off). Their moves are art/queens_guard_moves.ts; each of these begins as
// its blow lands (its `hit`), drawn at their place on the floor, turned the way they face, where the game puts it.
//
// His Movement 9 for the enemies, 28 Oct: “And bigger AOE to compensate for the extra time the player gets to evade”. So:
//   THE DOUBLE SLASH: an X of glass light laid over the floor before them, out to two tiles (`QG_SLASH.from` to
//     `QG_SLASH.reach`, `QG_SLASH.wide` across): its first stroke as the first slash lands, its second as the second
//     does, each out in two frames, flashing, glass glinting along them, thinning away.
//   THE SHARD FAN: five shards of glass flying out in a fan sixty degrees wide (`QG_FAN`), each eight tiles, fast, smeared
//     (a streak behind each), their shadows on the floor under them; at the end of its flight each bursts into glints.
// Nothing in them is cyan: silver-white, lavender, cold blue glass.

import type { Painted } from './kit';
import { hash } from './kit';
import { TILE3 } from './new_mobs3';
import { GLASS } from './queens_guard';
import { QG_FAN, QG_FAN_FLIGHT, QG_FAN_WAYS, QG_SLASH, fanShardAt } from './queens_guard_moves';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lay = (px: Painted['px'], x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};
/** The colours: the light's bright core, its glow, its lavender edge, the floor's dark under it. */
const FX = { core: '#f6f4ff', glow: '#cbc5e8', lav: '#9a92c2', deep: '#5a5280', shadow: '#0e0c16' } as const;

// =============================================================================================
// THE X OF GLASS LIGHT (the double slash)

/** Its picture: room for the X before them, either way they face. */
export const X_CANVAS = { w: 200, h: 150, ax: 40, ay: 75 } as const;
/** Its times (seconds from the first slash landing): the first stroke (run out in the slash's own two frames: whole as it lands), the second run out in the second slash's two frames, the flash, the fading. */
export const X_FX = { long: 1.0, one: [-2 / 30, 0] as const, two: [QG_SLASH.second[1] - QG_SLASH.hit - 2 / 30, QG_SLASH.second[1] - QG_SLASH.hit] as const, fade: [0.25, 1.0] as const };
/** Its two strokes over the floor (their own lengths: before them, to their left): from near right to far left, and from near left to far right. */
function strokes(): [[number, number], [number, number]][] {
  const a = QG_SLASH.from * TILE3;
  const b = QG_SLASH.reach * TILE3;
  const w = (QG_SLASH.wide / 2) * TILE3;
  return [[[a, -w], [b, w]], [[a, w], [b, -w]]];
}
/** THE X `t` seconds after the first slash lands, seen from in front or from behind. */
export function xPainted(t: number, view: GameView = 'front'): Painted {
  const can = X_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > X_FX.long) return { px, lights: [] };
  const left = 1 - smooth(X_FX.fade[0], X_FX.fade[1], t);
  const S = strokes();
  [X_FX.one, X_FX.two].forEach((w, j) => {
    if (t < w[0]) return;
    // (out in two frames from its near end, flashing white as it lands, then lavender, thinning away)
    const run = t >= w[1] ? 1 : Math.max(0.35, (t - w[0]) / (w[1] - w[0]));
    const age = t - w[1];
    const [p0, p1] = S[j];
    const n = 140;
    for (let i = 0; i <= n * run; i++) {
      const k = i / n;
      const x = p0[0] + (p1[0] - p0[0]) * k;
      const y = p0[1] + (p1[1] - p0[1]) * k;
      // (a band of light, widest at its middle, tapering to both ends)
      const half = 3.2 * Math.sin(Math.PI * k) + 0.8;
      for (let d = -half; d <= half; d += 0.9) {
        const edge = Math.abs(d) > half - 1;
        if (hash(i, Math.round(d * 4) + 20 * j, 9101) > left * (edge ? 0.7 : 1)) continue;
        const nx = -(p1[1] - p0[1]);
        const ny = p1[0] - p0[0];
        const nl = Math.hypot(nx, ny) || 1;
        const [sx, sy] = st.at([x + (nx / nl) * d, y + (ny / nl) * d, 0]);
        lay(px, sx, sy, age < 0.12 && !edge ? FX.core : edge ? FX.lav : Math.abs(d) < half * 0.4 ? FX.core : FX.glow);
      }
    }
    // glass glinting along it, leaping and falling
    for (let i = 0; i < 18; i++) {
      const k = hash(i, j, 9102) * run;
      const a0 = Math.max(0, age);
      const z = Math.max(0, (30 + 40 * hash(i, 1, 9102)) * a0 - 200 * a0 * a0);
      if (hash(i, 2, 9102) > left) continue;
      const [sx, sy] = st.at([p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, z]);
      lay(px, sx, sy, (i + Math.floor(t * 15)) % 3 ? GLASS[3] : GLASS[4], a0 < 0.15 ? 2 : 1);
    }
  });
  const [lx, ly] = st.at([((QG_SLASH.from + QG_SLASH.reach) / 2) * TILE3, 0, 4]);
  return { px, lights: left > 0.05 ? [{ x: lx, y: ly, r: 60, color: '#ded8f6', a: 0.35 * left }] : [] };
}

// =============================================================================================
// THE SHARD FAN

/** Its picture: room for the whole fan, eight tiles out and sixty degrees wide, either way they face. */
export const FAN_CANVAS = { w: 470, h: 470, ax: 46, ay: 240 } as const;
/** Its times (seconds from the throw landing): each shard's flight, and its burst at the end. */
export const FAN_FX = { long: QG_FAN_FLIGHT + 0.3, flight: QG_FAN_FLIGHT, burst: 0.3 } as const;
/** THE SHARD FAN `t` seconds after it is thrown: each shard flying out along its way, a streak behind it and its shadow under it; at the end of its flight, a burst of glints. */
export function fanPainted(t: number, view: GameView = 'front'): Painted {
  const can = FAN_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > FAN_FX.long) return { px, lights: [] };
  const lights: Painted['lights'] = [];
  for (let i = 0; i < QG_FAN_WAYS.length; i++) {
    const a = (QG_FAN_WAYS[i] * Math.PI) / 180;
    const way: V3 = [Math.cos(a), Math.sin(a), 0];
    const side: V3 = [-Math.sin(a), Math.cos(a), 0];
    if (t <= FAN_FX.flight) {
      const c = fanShardAt(i, t);
      // the streak behind it: the way it has come in the last frame and a half, thinning
      const back = Math.min(QG_FAN.speed * TILE3 * 0.05, QG_FAN.speed * TILE3 * t + 6);
      for (let k = 0; k <= back; k += 0.8) {
        const f = k / back;
        if (f > 0.5 && (Math.round(k / 0.8) % 2)) continue;
        const [sx, sy] = st.at([c[0] - way[0] * k, c[1] - way[1] * k, c[2]]);
        lay(px, sx, sy, f < 0.3 ? '#f4f4ff' : f < 0.65 ? '#c2c2e4' : '#6e6c9a');
      }
      // the shard: a sliver of glass, pointed, its edge bright
      for (let k = -3.4; k <= 3.4; k += 0.5) {
        const w = 1.1 * (1 - Math.abs(k) / 3.4) * (k > 0 ? 1 : 0.7);
        for (let d = -w; d <= w; d += 0.5) {
          const [sx, sy] = st.at([c[0] + way[0] * k + side[0] * d, c[1] + way[1] * k + side[1] * d, c[2] + d * 0.4]);
          lay(px, sx, sy, Math.abs(d) > w - 0.5 || k > 2.4 ? GLASS[4] : d > 0 ? GLASS[3] : GLASS[2]);
        }
      }
      // its shadow on the floor
      for (let k = -2.6; k <= 2.6; k += 0.8) {
        const [sx, sy] = st.at([c[0] + way[0] * k, c[1] + way[1] * k, 0]);
        lay(px, sx, sy, FX.shadow);
      }
      const [lx, ly] = st.at(c);
      lights.push({ x: lx, y: ly, r: 16, color: '#c8c4f0', a: 0.3 });
    } else {
      // the burst at the end of its flight: glints flung out, falling, fading
      const tau = t - FAN_FX.flight;
      const end = fanShardAt(i, FAN_FX.flight);
      const k = tau / FAN_FX.burst;
      for (let j = 0; j < 12; j++) {
        if (hash(i, j, 9201) < k * 0.9) continue;
        const b = hash(i, j + 20, 9201) * Math.PI * 2;
        const r = (4 + 14 * hash(i, j + 40, 9201)) * Math.sqrt(k);
        const z = Math.max(0, end[2] + 20 * tau - 200 * tau * tau - 10 * k);
        const [sx, sy] = st.at([end[0] + way[0] * r * 0.6 + Math.cos(b) * r, end[1] + way[1] * r * 0.6 + Math.sin(b) * r, z]);
        lay(px, sx, sy, j % 3 ? GLASS[3] : GLASS[4], k < 0.3 ? 2 : 1);
      }
    }
  }
  return { px, lights };
}
