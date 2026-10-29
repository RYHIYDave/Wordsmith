// FLOOR 16'S BOSS, THE PRINCESS: WHAT HER CASTING LEAVES ON THE FLOOR (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE
// GAME, behind PRINCESS_ON (art/princess.ts, off). Her moves are art/princess_moves.ts; each of these begins as her blow
// lands (its `hit`), where the game puts it.
//
//   THE VINE SNARE (his pick, “Vine snare (Recommended)”, in place of his doc's Shirt): where you stand, the floor heaves
//     and a cage of the gardens' nettle vines bursts up out of it round you in a flash (two frames: his Movement 9), arching
//     in over you, thorns glinting pink; it holds, writhing; then it withers brown and sinks back into the floor.
//   THE VOW (his doc: “a ring of silence round her that darkens your words while you stand in it”): a ring of the Hush's
//     dark bursts out from her across the floor in a flash and holds there, its edge breathing grey; inside it the floor
//     is dimmed; then it thins away.
//   THE ELEVEN (his doc: “her swan brothers diving across the floor in lines you must step between”): each line first
//     marked on the floor with a trail of fallen white feathers (the warning), then a swan swoops along it, low and fast
//     (art/garden_swans.ts `dive`), smeared, and the feathers scatter after it.

import type { Painted } from './kit';
import { hash } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { nettleBits } from './princess';
import { paintBits } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';

const TAU = Math.PI * 2;
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

// =============================================================================================
// THE VINE SNARE

export const SNARE_CANVAS = { w: 280, h: 200, ax: 140, ay: 120 } as const;
/**
 * Its times (seconds from her blow landing): the floor heaving (the last warning), the burst (two frames), held, withering
 * and sinking; and how far across it is (the figure's own lengths: five tiles across, his “too narrow and too small”).
 */
export const SNARE_FX = { long: 1.9, heave: [0, 0.1] as const, burst: [0.1, 0.1667] as const, sink: [1.3, 1.9] as const, r: 2.5 * (32 / Math.sqrt(2 / 3)), high: 40 } as const;
const SOIL = ['#1e1a16', '#2e2620', '#3e342a'];
/** The thicket's vines: a ring of tall ones round its edge arching in, and a tangle of lower ones all through it; risen `up` of the way out of the floor (0 under it, 1 all out), writhing at `t`. */
function snareVines(t: number, up: number): { pts: V3[]; ra: number; seed: number }[] {
  const out: { pts: V3[]; ra: number; seed: number }[] = [];
  const R = SNARE_FX.r;
  const grow = (base: V3, lean: V3, h: number, curl: number, i: number, ra: number): void => {
    const pts: V3[] = [];
    for (let j = 0; j <= 10; j++) {
      const k = j / 10;
      const wr = Math.sin(t * 4 + i * 1.7 + k * 3) * 1.2 * k;
      const c = Math.sin(k * Math.PI * curl);
      pts.push([base[0] + lean[0] * k * k + wr * 0.6, base[1] + lean[1] * k * k + wr * 0.4 + c * 2, h * Math.sin(k * Math.PI * 0.55) - (1 - up) * (h + 6)]);
    }
    // (only what is out of the floor is seen: cut where it comes up through it)
    const seen: V3[] = [];
    for (let j = 0; j < pts.length; j++) {
      const p = pts[j];
      if (p[2] < 0) continue;
      if (j > 0 && pts[j - 1][2] < 0) {
        const q = pts[j - 1];
        const u = -q[2] / (p[2] - q[2]);
        seen.push([q[0] + (p[0] - q[0]) * u, q[1] + (p[1] - q[1]) * u, 0]);
      }
      seen.push(p);
    }
    if (seen.length > 1) out.push({ pts: seen, ra, seed: 200 + i * 13 });
  };
  // its edge: tall vines arching in over it
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + 0.2 * hash(i, 0, 7541);
    const r = R * (0.92 + 0.12 * hash(i, 1, 7541));
    const h = SNARE_FX.high * (0.75 + 0.35 * hash(i, 2, 7541));
    grow([Math.cos(a) * r, Math.sin(a) * r, 0], [-Math.cos(a + 0.3) * r * 0.55, -Math.sin(a + 0.3) * r * 0.55, 0], h, 1.2, i, 1.9);
  }
  // all through it: a tangle of lower ones, each curling
  const m = 26;
  for (let i = 0; i < m; i++) {
    const a = hash(i, 3, 7541) * TAU;
    const r = R * Math.sqrt(hash(i, 4, 7541)) * 0.82;
    const h = 12 + 16 * hash(i, 5, 7541);
    const l = 6 + 8 * hash(i, 6, 7541);
    const b = hash(i, 7, 7541) * TAU;
    grow([Math.cos(a) * r, Math.sin(a) * r, 0], [Math.cos(b) * l, Math.sin(b) * l, 0], h, 2, n + i, 1.4);
  }
  return out;
}
/** THE SNARE `t` seconds after her blow lands, seen from in front or from behind. */
export function snarePainted(t: number, view: GameView = 'front'): Painted {
  const can = SNARE_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const up = t < SNARE_FX.burst[0] ? 0 : t <= SNARE_FX.burst[1] ? (t - SNARE_FX.burst[0]) / (SNARE_FX.burst[1] - SNARE_FX.burst[0]) : 1 - smooth(SNARE_FX.sink[0] + 0.15, SNARE_FX.sink[1], t);
  const wither = smooth(SNARE_FX.sink[0], SNARE_FX.sink[0] + 0.3, t);
  const { bits, fallen } = nettleBits(snareVines(t, up), t, wither);
  const lights = paintBits(st, bits, [0, 0, 0]);
  const px = st.whole(ENEMY_RIM);
  const R = SNARE_FX.r;
  // the floor heaved and broken all over it: dark soil kicked up, clods
  const heave = t < SNARE_FX.burst[0] ? smooth(0, SNARE_FX.heave[1], t) : 1 - smooth(SNARE_FX.sink[0], SNARE_FX.long, t);
  for (let i = 0; i < 160; i++) {
    const a = hash(i, 8, 7542) * TAU;
    const r = R * Math.sqrt(hash(i, 3, 7542)) * 1.05;
    if (hash(i, 4, 7542) > heave) continue;
    const [x, y] = st.at([Math.cos(a) * r, Math.sin(a) * r, 0]);
    lay(px, x, y, SOIL[i % 3], i % 4 === 0 ? 2 : 1);
  }
  // the burst: clods flung up as they come out of the floor
  if (t >= SNARE_FX.burst[0] && t < SNARE_FX.burst[1] + 0.25) {
    const k = (t - SNARE_FX.burst[0]) / 0.33;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU + hash(i, 5, 7542);
      const r = R * Math.sqrt(hash(i, 9, 7542)) * (1 + 0.2 * k);
      const z = 16 * Math.sin(Math.PI * Math.min(1, k)) * (0.5 + hash(i, 6, 7542));
      const [x, y] = st.at([Math.cos(a) * r, Math.sin(a) * r, z]);
      lay(px, x, y, SOIL[(i + 1) % 3], 2);
    }
  }
  // its thorns glinting pink while it holds
  if (up > 0.95 && wither < 0.2) {
    const tick = Math.floor(t * 15);
    snareVines(t, 1).forEach((v, i) => v.pts.forEach((p, j) => {
      if ((i + j + tick) % 6 === 0) {
        const [x, y] = st.at(p);
        lay(px, x, y - 1, (i + j) % 2 ? FLAME[3] : FLAME[4]);
      }
    }));
  }
  for (const [p, c, size] of fallen) {
    const [x, y] = st.at([p[0], p[1], Math.max(0.3, p[2])]);
    lay(px, x, y, c, size);
  }
  return { px, lights };
}

// =============================================================================================
// THE VOW: the ring of silence

export const VOW_CANVAS = { w: 500, h: 280, ax: 250, ay: 140 } as const;
/** Its times (seconds from her blow landing): bursting out (two frames), held, thinning away; and how far out it holds (the figure's own lengths: five tiles, ten across; the game's own size for it is drawn to). */
export const VOW_FX = { burst: [0, 0.0667] as const, hold: 3.0, fade: 0.6, r: 5 * (32 / Math.sqrt(2 / 3)) } as const;
const HUSH_DARK = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4', '#b6b0cc'];
/** THE RING `t` seconds after her blow lands (`r`: how far out it holds), round the floor point under her. */
export function vowPainted(t: number, view: GameView = 'front', r: number = VOW_FX.r): Painted {
  const can = VOW_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  const long = VOW_FX.hold + VOW_FX.fade;
  if (t < 0 || t > long) return { px, lights: [] };
  // (out in a flash; then still; then thinning)
  const out = t <= VOW_FX.burst[1] ? Math.max(0.12, t / VOW_FX.burst[1]) : 1;
  const left = 1 - smooth(VOW_FX.hold, long, t);
  const R = r * out;
  // inside, the floor dimmed: a dark dither, every other pixel
  const n = Math.ceil(R * 2.2);
  for (let iy = -n; iy <= n; iy++) {
    for (let ix = -n; ix <= n; ix++) {
      const fx = (ix / n) * R;
      const fy = (iy / n) * R;
      const d = Math.hypot(fx, fy);
      if (d > R) continue;
      const [x, y] = st.at([fx, fy, 0]);
      const xi = Math.round(x);
      const yi = Math.round(y);
      if ((xi + yi) % 2 !== 0 || (xi * 3 + yi) % 4 === 0) continue;
      if (hash(xi, yi, 7551) > 0.62 * left) continue;
      lay(px, xi, yi, d > R - 3 ? HUSH_DARK[1] : HUSH_DARK[0]);
    }
  }
  // its edge: a band of the Hush's violet, breathing, and grey breath rising off it
  const edge = Math.ceil(R * 3.2);
  for (let i = 0; i < edge; i++) {
    const a = (i / edge) * TAU;
    for (const [dr, c] of [[0, HUSH_DARK[3]], [-1.2, HUSH_DARK[2]], [1.1, HUSH_DARK[2]]] as const) {
      if (hash(i, Math.round(dr * 10), 7552) > left * (dr === 0 ? 1 : 0.7)) continue;
      const rr = R + dr + 0.5 * Math.sin(a * 5 + t * 3);
      const [x, y] = st.at([Math.cos(a) * rr, Math.sin(a) * rr, 0]);
      lay(px, x, y, c);
    }
    if (i % 3 === 0 && hash(i, 9, 7553) < left) {
      const life = (t * 0.8 + hash(i, 7, 7553)) % 1;
      const [x, y] = st.at([Math.cos(a) * R, Math.sin(a) * R, 1 + life * 9]);
      lay(px, x, y, life < 0.35 ? HUSH_DARK[5] : life < 0.7 ? HUSH_DARK[4] : HUSH_DARK[3]);
    }
  }
  // the burst's own flash: a pale ring snapping out
  if (t <= VOW_FX.burst[1] + 0.034) {
    for (let i = 0; i < edge; i++) {
      const a = (i / edge) * TAU;
      const [x, y] = st.at([Math.cos(a) * (R + 2), Math.sin(a) * (R + 2), 0.5]);
      lay(px, x, y, i % 2 ? '#e8e2f0' : HUSH_DARK[5]);
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE ELEVEN: a line of fallen feathers on the floor (the warning), scattered as its swan swoops along it

/** A line's feathers `t` seconds into its warning (`warn` long), from `a` to `b` on the floor (the figure's own lengths); after the warning, scattered as its swan goes by (`swept`: how far along it the swan has come, 0 to 1). As grains: [where, colour, size]. */
export function featherLine(a: readonly [number, number], b: readonly [number, number], t: number, warn: number, swept: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.round(L / 3.2);
  const ux = (b[0] - a[0]) / L;
  const uy = (b[1] - a[1]) / L;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    // (they fall onto the line one after another along it through the warning)
    if (k > t / (warn * 0.7)) continue;
    const off = (hash(i, 1, 7561) - 0.5) * 3;
    let p: V3 = [a[0] + (b[0] - a[0]) * k - uy * off, a[1] + (b[1] - a[1]) * k + ux * off, 0.4];
    if (swept > k) {
      // (scattered up and out of the swan's way)
      const g = Math.min(1, (swept - k) * 3);
      const side = hash(i, 2, 7561) > 0.5 ? 1 : -1;
      p = [p[0] + ux * 4 * g - uy * side * 6 * g, p[1] + uy * 4 * g + ux * side * 6 * g, 0.4 + 6 * Math.sin(Math.PI * Math.min(1, g)) * (1 - g * 0.5)];
      if (g >= 1 && hash(i, 3, 7561) < 0.6) continue;
    }
    out.push([p, i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#e6e4ee' : '#c6c4d2', i % 4 === 0 ? 2 : 1]);
  }
  return out;
}
