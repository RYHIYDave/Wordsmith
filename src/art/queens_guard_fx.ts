// FLOOR 18'S QUEEN'S GUARD: WHAT THEIR BLOWS LEAVE ON THE FLOOR (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind QGUARD_ON (art/queens_guard.ts, off). Their moves are art/queens_guard_moves.ts; each of these begins as its blow
// lands (its `hit`), drawn at their place on the floor, turned the way they face, where the game puts it.
//
// His Movement 9 for the enemies, 28 Oct: “And bigger AOE to compensate for the extra time the player gets to evade”. So:
//   THE HALBERD CHOP: where the axe bites, the gallery's floor splits; the split runs out along a line before them in two
//     frames, from a tile and more out to six and a half (`QG_CHOP.from`, `QG_CHOP.reach`), its width `QG_CHOP.wide` marked
//     by a flash of pale light along both its edges; glass leaps up out of it all along it and falls back ringing; then the
//     split dulls to a dark scar and is gone.
//   THE SHIELD CHARGE: the lane they burst along is scored with streaks of light; where the shield lands, a ring of silver-
//     white light snaps out over the floor before it (`QG_BASH.ring` tiles across), sparks of glass in it, and thins away.
// Nothing in them is cyan: silver-white, lavender, the floor's violet-grey.

import type { Painted } from './kit';
import { hash } from './kit';
import { TILE3 } from './new_mobs3';
import { QG_BASH, QG_CHOP } from './queens_guard_moves';
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
/** The colours: the split's bright lip and dark inside; the glass; the flash; the scar. */
const FX = { lip: '#f3f0fc', glow: '#cbc5e8', lav: '#9a92c2', deep: '#5a5280', split: '#120e1c', scar: '#2c2638', glass: ['#f6f4ff', '#c4c0e6', '#8c88b8'] } as const;

// =============================================================================================
// THE HALBERD CHOP

/** Its picture: room for the whole line before them, either way they face. */
export const CHOP_CANVAS = { w: 560, h: 330, ax: 70, ay: 165 } as const;
/** Its times (seconds from the blow landing): the split running out (two frames), the light along its edges, the glass up and down, the scar fading. */
export const CHOP_FX = { long: 1.5, run: [0, 2 / 30] as const, edge: [0, 0.3] as const, scar: [0.5, 1.5] as const };
/** The line of the split (figure lengths, before them and to their left): jagged, a little to either side of straight. */
function splitLine(): [number, number][] {
  const from = QG_CHOP.from * TILE3;
  const to = QG_CHOP.reach * TILE3;
  const n = 46;
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    const y = (hash(i, 1, 8201) - 0.5) * 5 + Math.sin(i * 0.7) * 2.4;
    out.push([x, y]);
  }
  return out;
}
const SPLIT = splitLine();
/** Its branches: short jagged forks off the split, out toward the line's edges. */
const FORKS: [number, number][][] = (() => {
  const out: [number, number][][] = [];
  const half = (QG_CHOP.wide / 2) * TILE3;
  for (let i = 2; i < SPLIT.length - 2; i += 3) {
    const [x, y] = SPLIT[i];
    const side = hash(i, 2, 8202) < 0.5 ? -1 : 1;
    const long = half * (0.45 + 0.55 * hash(i, 3, 8202));
    const pts: [number, number][] = [[x, y]];
    for (let j = 1; j <= 4; j++) pts.push([x + (j / 4) * long * (0.6 * (hash(i, j + 4, 8203) - 0.3)), y + side * (j / 4) * long]);
    out.push(pts);
  }
  return out;
})();
/** How far the split has run out at `t` (its front, figure lengths before them), from the bite both ways. */
function front(t: number): [number, number] {
  const k = clamp01((t - CHOP_FX.run[0]) / (CHOP_FX.run[1] - CHOP_FX.run[0]));
  const bite = QG_CHOP.bite * TILE3;
  return [bite + (QG_CHOP.from * TILE3 - bite) * k, bite + (QG_CHOP.reach * TILE3 - bite) * k];
}
/** THE CHOP'S LINE `t` seconds after the axe bites, seen from in front or from behind. */
export function chopPainted(t: number, view: GameView = 'front'): Painted {
  const can = CHOP_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > CHOP_FX.long) return { px, lights: [] };
  const at = (p: V3): [number, number] => {
    const [x, y] = st.at(p);
    return [x, y];
  };
  const [b0, b1] = front(t);
  const scar = smooth(CHOP_FX.scar[0], CHOP_FX.scar[1], t);
  const edgeK = 1 - smooth(CHOP_FX.edge[0] + 0.1, CHOP_FX.edge[1], t);
  const half = (QG_CHOP.wide / 2) * TILE3;
  // ITS WIDTH: a flash of pale light along both edges of the line, and a thin wash between, as it lands
  if (edgeK > 0.02) {
    for (let x = QG_CHOP.from * TILE3; x <= QG_CHOP.reach * TILE3; x += 1.2) {
      if (x < b0 || x > b1) continue;
      for (const side of [-1, 1]) {
        if (hash(Math.round(x * 3), side + 5, 8211) > edgeK) continue;
        const [sx, sy] = at([x, side * half, 0]);
        lay(px, sx, sy, edgeK > 0.6 ? FX.glow : FX.lav);
      }
      for (let k = 0; k < 3; k++) {
        const y = (hash(Math.round(x * 5), k, 8212) * 2 - 1) * half;
        if (hash(Math.round(x * 7), k + 3, 8213) > edgeK * 0.5) continue;
        const [sx, sy] = at([x, y, 0]);
        lay(px, sx, sy, FX.deep);
      }
    }
    // (its ends, squared off)
    for (const x of [QG_CHOP.from * TILE3, QG_CHOP.reach * TILE3]) {
      if (x < b0 - 0.5 || x > b1 + 0.5) continue;
      for (let y = -half; y <= half; y += 1.2) {
        if (hash(Math.round(y * 3), Math.round(x), 8214) > edgeK) continue;
        const [sx, sy] = at([x, y, 0]);
        lay(px, sx, sy, FX.lav);
      }
    }
  }
  // THE SPLIT and its forks: a dark crack with a bright lip, dulling to a scar
  const lip = scar < 0.5 ? FX.lip : FX.lav;
  const inside = FX.split;
  const drawLine = (pts: ReadonlyArray<[number, number]>, wide: boolean): void => {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      if (Math.max(x0, x1) < b0 || Math.min(x0, x1) > b1) continue;
      const [a0, a1] = at([x0, y0, 0]);
      const [c0, c1] = at([x1, y1, 0]);
      const n = Math.max(1, Math.ceil(Math.hypot(c0 - a0, c1 - a1)));
      for (let e = 0; e <= n; e++) {
        const sx = a0 + ((c0 - a0) * e) / n;
        const sy = a1 + ((c1 - a1) * e) / n;
        if (scar > 0.97 && hash(Math.round(sx), Math.round(sy), 8215) < scar) continue;
        lay(px, sx, sy - 1, scar > 0.8 ? FX.scar : lip);
        lay(px, sx, sy, inside);
        if (wide) lay(px, sx + 1, sy, scar > 0.6 ? FX.scar : inside);
      }
    }
  };
  drawLine(SPLIT, true);
  for (const f of FORKS) drawLine(f, false);
  // THE GLASS leaping up out of it all along the line as the split runs past, falling back, and lying, glinting
  const N = 60;
  for (let i = 0; i < N; i++) {
    const x = QG_CHOP.from * TILE3 + (QG_CHOP.reach - QG_CHOP.from) * TILE3 * hash(i, 1, 8221);
    if (x < b0 || x > b1) continue;
    const bite = QG_CHOP.bite * TILE3;
    const born = (Math.abs(x - bite) / Math.max(1, (QG_CHOP.reach - QG_CHOP.bite) * TILE3)) * (CHOP_FX.run[1] - CHOP_FX.run[0]);
    const age = t - born;
    if (age < 0) continue;
    const y0 = (hash(i, 2, 8221) * 2 - 1) * half * 0.7;
    const vz = 70 + 90 * hash(i, 3, 8221);
    const vy = (hash(i, 4, 8221) * 2 - 1) * 40;
    const vx = (hash(i, 5, 8221) * 2 - 1) * 20 + 10;
    const land = (2 * vz) / 400;
    const tt = Math.min(age, land);
    const z = Math.max(0, vz * tt - 200 * tt * tt);
    const p: V3 = [x + vx * tt, y0 + vy * tt, z];
    if (age > land + 0.4 + 0.5 * hash(i, 6, 8221)) continue;
    const [sx, sy] = at(p);
    const c = (Math.floor(t * 15) + i) % 5 === 0 ? FX.glass[0] : FX.glass[1 + (i % 2)];
    lay(px, sx, sy, c, age < land && hash(i, 7, 8221) < 0.4 ? 2 : 1);
  }
  // chips of the floor kicked up at the bite itself
  if (t < 0.5) {
    const k = t / 0.5;
    for (let i = 0; i < 26; i++) {
      const a = hash(i, 1, 8231) * Math.PI * 2;
      const r = (4 + 26 * Math.sqrt(k)) * (0.5 + 0.5 * hash(i, 2, 8231));
      const z = (6 + 14 * hash(i, 3, 8231)) * Math.sin(Math.PI * k);
      if (hash(i, 4, 8231) < k * 0.8) continue;
      const [sx, sy] = at([QG_CHOP.bite * TILE3 + Math.cos(a) * r, Math.sin(a) * r * 0.8, z]);
      lay(px, sx, sy, i % 3 ? FX.lav : FX.glow, k < 0.4 ? 2 : 1);
    }
  }
  const lights = edgeK > 0.05 ? [{ ...((): { x: number; y: number } => { const [x, y] = at([QG_CHOP.bite * TILE3, 0, 4]); return { x, y }; })(), r: 60, color: '#d8d2f0', a: 0.3 * edgeK }] : [];
  return { px, lights };
}

// =============================================================================================
// THE SHIELD CHARGE

/** Its picture: the lane behind them and the ring before them, either way they face. */
export const BASH_CANVAS = { w: 520, h: 300, ax: 330, ay: 150 } as const;
/** Its times (seconds from the shield landing): the ring snapping out (two frames) and thinning; the lane's streaks fading. */
export const BASH_FX = { long: 0.9, out: [0, 2 / 30] as const, fade: [0.15, 0.9] as const, at: 34 } as const;
/**
 * THE SHIELD CHARGE'S MARK `t` seconds after the shield lands, drawn at their place on the floor as they land (the ring
 * before the shield, `BASH_FX.at` before them; the lane back the way the game carried them).
 */
export function bashPainted(t: number, view: GameView = 'front'): Painted {
  const can = BASH_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > BASH_FX.long) return { px, lights: [] };
  const at = (p: V3): [number, number] => {
    const [x, y] = st.at(p);
    return [x, y];
  };
  const out = t <= BASH_FX.out[1] ? Math.max(0.2, t / BASH_FX.out[1]) : 1;
  const left = 1 - smooth(BASH_FX.fade[0], BASH_FX.fade[1], t);
  const R = (QG_BASH.ring / 2) * TILE3 * (out < 1 ? out : 1 + 0.12 * smooth(BASH_FX.out[1], BASH_FX.fade[1], t));
  const cx = BASH_FX.at;
  // THE RING: a band of silver-white light round the place the shield struck, a second fainter inside it
  const n = Math.ceil(R * 3.4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    for (const [dr, c, k] of [[0, FX.lip, 1], [-1.4, FX.glow, 0.85], [1.3, FX.lav, 0.7], [-R * 0.45, FX.lav, 0.4]] as const) {
      if (hash(i, Math.round(dr * 10), 8241) > left * k * Math.min(1, out * 1.6)) continue;
      const rr = R + dr;
      const [sx, sy] = at([cx + Math.cos(a) * rr, Math.sin(a) * rr, 0]);
      lay(px, sx, sy, c);
    }
  }
  // sparks of glass thrown out from it
  for (let i = 0; i < 30; i++) {
    const a = hash(i, 1, 8242) * Math.PI * 2;
    const r = R * (0.3 + 0.9 * hash(i, 2, 8242)) * out;
    const z = (3 + 16 * hash(i, 3, 8242)) * Math.sin(Math.PI * clamp01(t / 0.6));
    if (hash(i, 4, 8242) > left) continue;
    const [sx, sy] = at([cx + Math.cos(a) * r, Math.sin(a) * r, z]);
    lay(px, sx, sy, i % 3 === 0 ? FX.glass[0] : FX.glass[1], t < 0.2 ? 2 : 1);
  }
  // THE LANE: streaks of light along the floor back the way they came, as wide as the lane they hit along
  const back = QG_BASH.carry * TILE3 + QG_BASH.end * 0;
  const half = (QG_BASH.wide / 2) * TILE3;
  for (let j = 0; j < 9; j++) {
    const y = (j / 8 - 0.5) * 2 * half * (0.9 + 0.1 * hash(j, 1, 8243));
    const x0 = -back * (0.6 + 0.4 * hash(j, 2, 8243));
    for (let x = x0; x <= 6; x += 1.1) {
      const k = (x - x0) / (6 - x0);
      if (hash(Math.round(x * 2), j, 8244) > left * Math.min(1, out * 1.1) * (0.35 + 0.65 * k)) continue;
      const [sx, sy] = at([x, y, 0]);
      lay(px, sx, sy, k > 0.7 ? FX.glow : FX.lav);
    }
  }
  const [lx, ly] = at([cx, 0, 6]);
  return { px, lights: left > 0.05 ? [{ x: lx, y: ly, r: 70, color: '#e8e4fa', a: 0.4 * left }] : [] };
}
