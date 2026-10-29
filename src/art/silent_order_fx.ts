// THE SILENT ORDER: WHAT THEIR BLOWS LEAVE IN THE WORLD (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// ORDER_ON (art/silent_order.ts, off). Their moves are art/silent_order_moves.ts; each of these begins as the blow lands
// (its `hit`), where the game puts it, turned the way they face.
//
//   THE HUSHING PALM'S GREY WAVE (the brief as offered: “a hushing palm that darkens your words”): out of the palm in a
//     flash, a wall of grey murk races across a wide cone before them (`PALM_WAVE`: 5.5 tiles out, 100 degrees across:
//     his “bigger AOE”), the floor under it dimmed; it hangs there a while, breathing, grey rising off its front, and
//     thins away. Words caught in it are darkened (the game's). Grey: never cyan.
//   THE CURVED KNIFE IN FLIGHT: spinning end over end, smeared (its after-images round its spin, and a streak behind it
//     along the way it came), `KNIFE_FLIGHT.reach` tiles at `KNIFE_FLIGHT.speed` tiles a second (art/silent_order_moves.ts);
//     then down, lying on the floor.

import { hash } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { FOG, KNIFE, SMEAR, knifeBits, knifeOf } from './silent_order';
import { KNIFE_FLIGHT } from './silent_order_moves';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';

const TAU = Math.PI * 2;
const D = Math.PI / 180;
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
// THE HUSHING PALM'S GREY WAVE

/** Where the wave is painted: round the floor point under them (it reaches out before them, turned their way). */
export const WAVE_CANVAS = { w: 640, h: 380, ax: 150, ay: 190 } as const;
/**
 * Its times (seconds from the blow), and its size (the figure's own lengths): its front races out (`burst`, four frames),
 * hangs there breathing (`hold`), thins away (to `long`); `reach` out from them (5.5 tiles), `half` degrees either side
 * of the way they face (a hundred degrees across in all).
 */
export const PALM_WAVE = { burst: [0, 4 / 30] as const, hold: 0.95, long: 1.4, reach: 5.5 * TILE3, half: 50, from: 6 } as const;
/** How far out its front is at `t` (the figure's own lengths). */
export function waveFront(t: number, reach: number = PALM_WAVE.reach): number {
  if (t <= 0) return PALM_WAVE.from;
  if (t < PALM_WAVE.burst[1]) {
    const u = t / PALM_WAVE.burst[1];
    return PALM_WAVE.from + (reach - PALM_WAVE.from) * (1 - (1 - u) * (1 - u));
  }
  return reach + 1.5 * Math.sin((t - PALM_WAVE.burst[1]) * 5);
}
/** Inside the wave's cone (on the floor, the figure's own lengths from the floor point under them, x the way they face)? */
export function inWave(x: number, y: number, t: number, reach: number = PALM_WAVE.reach): boolean {
  const r = Math.hypot(x, y);
  return r >= PALM_WAVE.from && r <= waveFront(t, reach) && Math.abs(Math.atan2(y, x)) <= PALM_WAVE.half * D;
}
const DARK = ['#121116', '#1a1920', '#24222b'] as const;
/** THE WAVE `t` seconds after the blow, seen from in front or from behind, its front out to `reach`. */
export function wavePainted(t: number, view: GameView = 'front', reach: number = PALM_WAVE.reach): Painted {
  const can = WAVE_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > PALM_WAVE.long) return { px, lights: [] };
  const left = 1 - smooth(PALM_WAVE.hold, PALM_WAVE.long, t);
  const R = waveFront(t, reach);
  const H = PALM_WAVE.half * D;
  // the floor under it dimmed: a dark dither, thinning as it goes
  for (let r = PALM_WAVE.from; r <= R; r += 0.7) {
    const da = 0.7 / r;
    for (let a = -H; a <= H; a += da) {
      const [x, y] = st.at([Math.cos(a) * r, Math.sin(a) * r, 0]);
      const xi = Math.round(x);
      const yi = Math.round(y);
      if ((xi + yi) % 2 !== 0) continue;
      if (hash(xi, yi, 9101) > 0.85 * left) continue;
      lay(px, xi, yi, r > R - 10 ? DARK[2] : (xi * 3 + yi) % 4 === 0 ? DARK[1] : DARK[0]);
    }
  }
  // its sides: a broken line of grey, so you can see where it ends
  for (const side of [-1, 1]) {
    for (let r = PALM_WAVE.from + 2; r <= R; r += 1.1) {
      if (hash(Math.round(r), side, 9102) > 0.75 * left) continue;
      const [x, y] = st.at([Math.cos(side * H) * r, Math.sin(side * H) * r, 0]);
      lay(px, x, y, FOG[2]);
    }
  }
  // streaks of it, swept out from them across the floor
  for (let i = 0; i < 26; i++) {
    const a = (hash(i, 1, 9103) * 2 - 1) * H * 0.95;
    const r0 = PALM_WAVE.from + (R - PALM_WAVE.from) * hash(i, 2, 9103) * 0.6;
    const r1 = Math.min(R - 2, r0 + 20 + 40 * hash(i, 3, 9103));
    for (let r = r0; r < r1; r += 1.0) {
      if (hash(i, Math.round(r), 9104) > 0.6 * left) continue;
      const [x, y] = st.at([Math.cos(a) * r, Math.sin(a) * r, 0.3]);
      lay(px, x, y, t < 0.25 ? FOG[3] : FOG[1]);
    }
  }
  // ITS FRONT: a wall of grey murk, pale where it is newest, rolling over itself, grey rising off it
  const arc = Math.ceil(R * 2 * H * 1.4);
  for (let i = 0; i <= arc; i++) {
    const a = -H + (2 * H * i) / arc;
    for (let k = 0; k < 4; k++) {
      if (hash(i, k, 9105) > (k === 0 ? 0.95 : 0.6) * left) continue;
      const rr = R - k * 2.2 - 1.2 * Math.sin(a * 9 + t * 6 + k);
      const z = 1 + k * 2.4 + 2.2 * Math.abs(Math.sin(a * 13 + t * 4 + k * 1.7)) * (t < PALM_WAVE.burst[1] ? 1.6 : 1);
      const [x, y] = st.at([Math.cos(a) * rr, Math.sin(a) * rr, z]);
      const c = t < PALM_WAVE.burst[1] + 0.05 ? (k < 2 ? FOG[6] : FOG[5]) : t < 0.3 ? (k === 0 ? FOG[5] : FOG[3]) : k === 0 ? FOG[3] : k === 1 ? FOG[2] : FOG[1];
      lay(px, x, y, c, k === 0 && i % 2 === 0 ? 2 : 1);
    }
    if (i % 3 === 0 && hash(i, 9, 9106) < left) {
      const life = (t * 0.9 + hash(i, 7, 9106)) % 1;
      const [x, y] = st.at([Math.cos(a) * (R - 2), Math.sin(a) * (R - 2), 4 + life * 14]);
      lay(px, x, y, life < 0.35 ? FOG[4] : life < 0.7 ? FOG[2] : FOG[1]);
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// THE CURVED KNIFE IN FLIGHT

/** Where the knife in flight is painted: its floor point under it at (ax, ay); it flies at its height over it, the way they face. */
export const KNIFE_CANVAS = { w: 170, h: 130, ax: 105, ay: 100 } as const;
/** How high the knife flies (the figure's own lengths: about where it left the hand, a little lower by the end), how far along it has gone (tiles), and how far round it has spun (turns), `t` seconds after it left the hand. */
export function knifeAt(t: number, z0 = 40): { x: number; z: number; turn: number; flying: boolean } {
  const T = KNIFE_FLIGHT.reach / KNIFE_FLIGHT.speed;
  const tt = Math.min(t, T);
  const flying = t < T;
  // (in flight: dropping a little; then down onto the floor in a few frames and lying there)
  const z = flying ? z0 - 9 * tt : Math.max(1.2, z0 - 9 * T - 900 * (t - T) * (t - T));
  return { x: KNIFE_FLIGHT.speed * tt + (flying ? 0 : 1.2 * Math.min(1, (t - T) * 6)), z, turn: KNIFE_FLIGHT.spin * Math.min(t, T + 0.08), flying };
}
/** The knife spun `turn` turns round, its middle at `c`: its grip, the way it points and the way its edge bows. */
function spun(c: V3, turn: number): { hand: V3; point: V3; across: V3 } {
  const a = turn * TAU;
  const point: V3 = [Math.cos(a), 0, Math.sin(a)];
  const across: V3 = [-Math.sin(a), 0, Math.cos(a)];
  const mid = (KNIFE.blade + 1.2 - KNIFE.handle) / 2;
  return { hand: [c[0] - point[0] * mid, 0, c[2] - point[2] * mid], point, across };
}
/** THE KNIFE `t` seconds after it left the hand (`z0`: how high it left it): spinning and smeared in flight, then lying on the floor. Its floor point is the canvas's anchor; the game moves it along by `knifeAt(t).x` tiles. */
export function knifePainted(t: number, view: GameView = 'front', z0 = 40): Painted {
  const can = KNIFE_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const k = knifeAt(t, z0);
  if (k.flying || k.z > 1.3) {
    const s = spun([0, 0, k.z], k.turn);
    knifeBits(put, 'knife', 'knife', s.hand, s.point, s.across, 0);
  } else {
    // (lying on its side on the floor, its edge up)
    knifeBits(put, 'knife', 'knife', [-4.5, 0, 1.1], [1, 0.15, 0], [0, 0, 1], 0);
  }
  const lights = paintBits(st, bits, [0, 0, k.z]);
  const px = st.whole(ENEMY_RIM);
  if (k.flying) {
    // THE SMEAR: its blade's edge where it was a third and two thirds of a frame ago, round its spin; and the streak of it
    // behind along the way it came (the last frame's flight)
    const per = KNIFE_FLIGHT.speed * TILE3 / 30;
    for (let j = 1; j <= 3; j++) {
      const back = (per * j) / 3;
      const s = spun([-back, 0, k.z + (9 / 30) * (j / 3)], k.turn - (KNIFE_FLIGHT.spin / 30) * (j / 3));
      const kk = knifeOf(s.hand, s.point, s.across);
      for (const p of [...kk.edge, kk.pommel]) {
        const [x, y] = st.at(p);
        lay(px, x, y, j === 1 ? SMEAR[2] : j === 2 ? SMEAR[1] : SMEAR[0]);
      }
    }
    for (let i = 0; i < 40; i++) {
      const u = i / 40;
      const z = k.z + Math.sin(i * 1.7 + k.turn * 9) * 3;
      const [x, y] = st.at([-per * 1.2 * u, 0, z]);
      if (hash(i, Math.floor(t * 30), 9111) > 1 - u * 0.7) continue;
      lay(px, x, y, u < 0.3 ? SMEAR[1] : SMEAR[0]);
    }
  }
  return { px, lights };
}
