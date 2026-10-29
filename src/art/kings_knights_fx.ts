// FLOOR 19'S KING'S KNIGHTS: WHAT THEIR BLOWS LEAVE ON THE FLOOR (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE
// GAME, behind KNIGHTS_ON (art/kings_knights.ts, off). Their moves are art/kings_knights_moves.ts; each of these begins
// as his blow lands (its `hit`), drawn round his floor point, facing his way (the figure's own lengths: a tile is TILE3).
// His words for every new enemy, 28 Oct: “And bigger AOE to compensate for the extra time the player gets to evade”.
//
//   THE CRACK (his overhead chop): where the blade bites the floor before him, the floor splits; in two frames the crack
//     races on out before him in a jagged line (`CRACK`: from the bite out to `CRACK.reach` tiles from him), side cracks
//     branching off it; stone chips and dust are flung up all along it and roll out to either side; sparks of the
//     enemy's pink and gold where the blade bit; it holds open, the Hush's grey breath seeping up out of it, and fades.
//   THE KNOCKBACK (his shield rush): as his shield slams in, a flash at its face and a crescent of force bursting out
//     before him across the floor (`KNOCK.r` tiles), sparks of pink and gold flung forward; and behind him, the dust of
//     his burst along the floor the way he came (`KN_RUSH.carry` tiles), settling.
//
// Nothing here glows cyan; what glows is the enemy's pink burning to gold, and only in the flash of a blow.

import { HUSH } from './crier';
import type { Painted } from './kit';
import { hash } from './kit';
import { FLAME } from './mkit';
import { CHOP_AT, KN_RUSH, RUSH_SHIELD_AT } from './kings_knights_moves';
import { TILE3 } from './new_mobs3';
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
/** The broken floor's colours: the dark of the crack, its broken lip in shadow and in the light, chips, dust. */
const DARK = ['#08070c', '#120f18', '#1c1824'] as const;
const LIP = ['#3c3e4c', '#646878', '#8a8ea0'] as const;
const CHIP = ['#4a4c5a', '#6e7282', '#9a9eae'] as const;
const DUST = ['#4e4c56', '#6a6872', '#8a8892'] as const;

// =============================================================================================
// THE CRACK

/** Its picture: from his floor point out before him (either way round: before him is down the picture from in front, up it from behind). */
export const CRACK_CANVAS = { w: 300, h: 260, ax: 40, ay: 130 } as const;
/**
 * Its times (seconds from his blow landing) and its size: it races out in two frames (`open`); chips and dust thrown up
 * (`burst`); held open, seeping; faded by `long`. It runs from where the blade bites (`from`, his own lengths before
 * him) out to `reach` tiles from him, `wide` tiles across where it does harm (the game's to use).
 */
export const CRACK = { open: [0, 2 / 30] as const, burst: 0.45, hold: 1.5, long: 2.1, from: CHOP_AT, reach: 6.0, wide: 1.2 } as const;
const REACH = CRACK.reach * TILE3;
/** The crack's line: points along it from the bite out, each with how wide it is there (jagged, tapering). */
const LINE: ReadonlyArray<readonly [number, number, number]> = (() => {
  const out: [number, number, number][] = [];
  const n = 26;
  let y = -1.0;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    y += (hash(i, 1, 7801) - 0.5) * 3.2 - y * 0.18;
    out.push([CRACK.from - 2 + (REACH - CRACK.from + 2) * k, y, 2.8 * (1 - k) + 0.7]);
  }
  return out;
})();
/** Side cracks branching off it: from a point along it, out at an angle, so long. */
const BRANCHES: ReadonlyArray<{ at: number; deg: number; long: number }> = Array.from({ length: 9 }, (_, i) => ({
  at: 0.06 + 0.1 * i + 0.04 * hash(i, 2, 7801),
  deg: (i % 2 ? 1 : -1) * (35 + 30 * hash(i, 3, 7801)),
  long: (5 + 12 * hash(i, 4, 7801)) * (1 - 0.06 * i),
}));
/** THE CRACK `t` seconds after his blow lands, seen from in front or from behind. */
export function crackPainted(t: number, view: GameView = 'front'): Painted {
  const can = CRACK_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > CRACK.long) return { px, lights: [] };
  // (how far out it has run: all of it in two frames)
  const run = t >= CRACK.open[1] ? 1 : Math.max(0.15, t / CRACK.open[1]);
  const fade = 1 - smooth(CRACK.hold, CRACK.long, t);
  const at = (p: V3): readonly [number, number] => st.at(p);
  const keep = (x: number, y: number, k: number): boolean => hash(Math.round(x), Math.round(y), 7802) < k;
  // the line and its branches, as (point, width) samples along them
  const samples: [number, number, number][] = [];
  const last = Math.max(1, Math.round((LINE.length - 1) * run));
  for (let i = 0; i < last; i++) {
    const [x0, y0, w0] = LINE[i];
    const [x1, y1, w1] = LINE[i + 1];
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.45);
    for (let j = 0; j < steps; j++) {
      const u = j / steps;
      samples.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, w0 + (w1 - w0) * u]);
    }
  }
  for (const b of BRANCHES) {
    if (b.at > run) continue;
    const i = Math.min(LINE.length - 2, Math.floor(b.at * (LINE.length - 1)));
    const [x0, y0] = LINE[i];
    const a = (b.deg * Math.PI) / 180;
    const steps = Math.ceil(b.long / 0.45);
    for (let j = 0; j <= steps; j++) {
      const u = j / steps;
      const wig = (hash(j, i, 7803) - 0.5) * 0.8;
      samples.push([x0 + Math.cos(a) * b.long * u - Math.sin(a) * wig, y0 + Math.sin(a) * b.long * u + Math.cos(a) * wig, 1.1 * (1 - u) + 0.4]);
    }
  }
  // its broken lip first (lit on the side toward the light), then the dark of it over
  for (const [x, y, w] of samples) {
    for (const [dy, c] of [[w * 0.5 + 0.7, LIP[2]], [-(w * 0.5 + 0.7), LIP[0]], [w * 0.5 + 1.3, LIP[1]]] as const) {
      const [sx, sy] = at([x, y + dy, 0]);
      if (keep(sx, sy, fade * (dy > 0 ? 0.9 : 0.7))) lay(px, sx, sy, c);
    }
  }
  for (const [x, y, w] of samples) {
    for (let o = -w * 0.5; o <= w * 0.5; o += 0.45) {
      const [sx, sy] = at([x, y + o, 0]);
      if (keep(sx + 7, sy + 3, fade)) lay(px, sx, sy, Math.abs(o) < w * 0.22 ? DARK[0] : DARK[1]);
    }
  }
  // the burst: chips of stone flung up all along it and falling back; dust rolling out to either side
  if (t < CRACK.burst) {
    const k = t / CRACK.burst;
    for (let i = 0; i < 90; i++) {
      const along = hash(i, 5, 7804) * run;
      const j = Math.min(LINE.length - 1, Math.floor(along * (LINE.length - 1)));
      const [x, y] = LINE[j];
      const side = hash(i, 6, 7804) > 0.5 ? 1 : -1;
      const v = 14 + 22 * hash(i, 7, 7804);
      const z = Math.max(0.4, v * t * 1.6 - 140 * t * t);
      if (z <= 0.41 && t > 0.1) continue;
      const out = side * (2 + 14 * k * hash(i, 8, 7804));
      const [sx, sy] = at([x + (hash(i, 9, 7804) - 0.5) * 6, y + out, z]);
      lay(px, sx, sy, CHIP[i % 3], i % 4 === 0 ? 3 : 2);
    }
    for (let i = 0; i < 120; i++) {
      const along = hash(i, 10, 7804) * run;
      const j = Math.min(LINE.length - 1, Math.floor(along * (LINE.length - 1)));
      const [x, y] = LINE[j];
      const side = hash(i, 11, 7804) > 0.5 ? 1 : -1;
      const out = side * (2 + 26 * Math.sqrt(k) * (0.4 + 0.6 * hash(i, 12, 7804)));
      if (hash(i, 13, 7804) < k * 0.9) continue;
      const [sx, sy] = at([x + (hash(i, 14, 7804) - 0.5) * 5, y + out, 1 + 6 * k * hash(i, 15, 7804)]);
      lay(px, sx, sy, DUST[(i + Math.floor(t * 20)) % 3], k < 0.4 ? 3 : 2);
    }
  }
  // where the blade bit: sparks of pink and gold, out in a ring, gone in a third of a second
  if (t < 0.32) {
    const k = t / 0.32;
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * TAU + hash(i, 16, 7805);
      const r = 2 + 26 * k * (0.5 + 0.7 * hash(i, 17, 7805));
      const z = Math.max(0.5, (6 + 14 * hash(i, 18, 7805)) * Math.sin(Math.PI * Math.min(1, k * 1.3)));
      if (hash(i, 19, 7805) < k * 0.85) continue;
      const [sx, sy] = at([CRACK.from + Math.cos(a) * r * 0.7, Math.sin(a) * r, z]);
      lay(px, sx, sy, i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? FLAME[4] : FLAME[3], k < 0.3 ? 2 : 1);
    }
  }
  // the Hush seeping up out of it while it holds: grey wisps rising and thinning
  for (let i = 0; i < 40; i++) {
    const life = (t * 0.7 + hash(i, 20, 7806)) % 1;
    if (t < 0.15 || hash(i, 21, 7806) > fade * run) continue;
    const along = hash(i, 22, 7806);
    const j = Math.min(LINE.length - 1, Math.floor(along * (LINE.length - 1)));
    const [x, y] = LINE[j];
    const [sx, sy] = at([x + (hash(i, 23, 7806) - 0.5) * 4, y + Math.sin(life * 5 + i) * 1.5, 1 + life * 14]);
    if (life > 0.8) continue;
    lay(px, sx, sy, life < 0.3 ? HUSH[4] : life < 0.6 ? HUSH[3] : HUSH[2], life < 0.4 ? 2 : 1);
  }
  const [bx, by] = at([CRACK.from, 0, 2]);
  return { px, lights: t < 0.2 ? [{ x: bx, y: by, r: 44, color: FLAME[2], a: 0.35 * (1 - t / 0.2) }] : [] };
}

// =============================================================================================
// THE KNOCKBACK

export const KNOCK_CANVAS = { w: 340, h: 240, ax: 180, ay: 120 } as const;
/**
 * Its times (seconds from his blow landing): the flash at the shield's face (two frames), the crescent of force bursting
 * out over the floor before him to `r` tiles and gone by `long`; the dust of his burst behind him, settling by `dust`.
 * `at`: where his shield's face is as it lands (his own lengths: before him, to his left, up), from his moves.
 */
export const KNOCK = { flash: 2 / 30, long: 0.42, r: 1.8, arc: 70, dust: 0.75, at: RUSH_SHIELD_AT } as const;
/** THE KNOCKBACK `t` seconds after his shield slams in, seen from in front or from behind. */
export function knockPainted(t: number, view: GameView = 'front', at: V3 = KNOCK.at): Painted {
  const can = KNOCK_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  if (t < 0 || t > Math.max(KNOCK.long, KNOCK.dust)) return { px, lights: [] };
  const R = KNOCK.r * TILE3;
  // the dust of his burst behind him along the way he came, rolling and settling
  if (t < KNOCK.dust) {
    const k = t / KNOCK.dust;
    const back = KN_RUSH.carry * TILE3;
    for (let i = 0; i < 110; i++) {
      const u = hash(i, 1, 7811);
      if (hash(i, 2, 7811) < k * (0.6 + 0.6 * (1 - u))) continue;
      const side = (hash(i, 3, 7811) - 0.5) * (10 + 18 * k);
      const z = 0.6 + (2 + 7 * hash(i, 4, 7811)) * (1 - k) * Math.sin(Math.PI * Math.min(1, 0.3 + k));
      const [sx, sy] = st.at([-back * u, side, z]);
      lay(px, sx, sy, DUST[i % 3], k < 0.5 && i % 3 === 0 ? 3 : 2);
    }
  }
  if (t <= KNOCK.long) {
    const k = t / KNOCK.long;
    const r = 6 + (R - 6) * Math.sqrt(k);
    // the crescent of force over the floor before him: a band, its leading edge bright, breaking up as it goes
    const n = Math.ceil(r * 1.6);
    for (let i = 0; i <= n; i++) {
      const a = ((-KNOCK.arc + (2 * KNOCK.arc * i) / n) * Math.PI) / 180;
      for (const [dr, c, keep] of [[0, k < 0.4 ? '#ffffff' : FLAME[4], 1 - k * 0.7], [-1.4, FLAME[3], 1 - k], [-3.0, FLAME[2], 0.8 - k], [-5.0, DUST[2], 0.9 - k]] as const) {
        if (hash(i, Math.round(dr * 10) + 40, 7812) > keep) continue;
        const [sx, sy] = st.at([at[0] + Math.cos(a) * (r + dr), at[1] + Math.sin(a) * (r + dr), 0.5]);
        lay(px, sx, sy, c, dr === 0 ? 2 : 1);
      }
    }
    // dust thrown up off the floor by it
    for (let i = 0; i < 50; i++) {
      const a = ((hash(i, 5, 7813) * 2 - 1) * KNOCK.arc * Math.PI) / 180;
      const rr = r * (0.55 + 0.45 * hash(i, 6, 7813));
      if (hash(i, 7, 7813) < k * 0.8) continue;
      const [sx, sy] = st.at([at[0] + Math.cos(a) * rr, at[1] + Math.sin(a) * rr, 1 + 6 * k * hash(i, 8, 7813)]);
      lay(px, sx, sy, DUST[i % 3], 2);
    }
    // sparks flung forward off the shield's face
    for (let i = 0; i < 40; i++) {
      const a = ((hash(i, 9, 7814) * 2 - 1) * 60 * Math.PI) / 180;
      const e = (hash(i, 10, 7814) * 2 - 1) * 0.6;
      const d = 3 + 34 * k * (0.5 + 0.7 * hash(i, 11, 7814));
      if (hash(i, 12, 7814) < k * 0.9) continue;
      const [sx, sy] = st.at([at[0] + Math.cos(a) * d, at[1] + Math.sin(a) * d, Math.max(0.6, at[2] + Math.sin(e) * d - 30 * k * k)]);
      lay(px, sx, sy, i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? FLAME[4] : FLAME[3], k < 0.3 ? 2 : 1);
    }
  }
  // the flash at the shield's face: a burst of white and pink, out in two frames
  if (t <= KNOCK.flash + 1e-6) {
    const k = t / KNOCK.flash;
    const rr = 5 + 9 * k;
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * TAU;
      for (const [f, c] of [[1, FLAME[3]], [0.7, FLAME[4]], [0.4, '#ffffff']] as const) {
        const [sx, sy] = st.at([at[0] + 1, at[1] + Math.cos(a) * rr * f, at[2] + Math.sin(a) * rr * f]);
        lay(px, sx, sy, c, 2);
      }
    }
  }
  const [lx, ly] = st.at(at);
  return { px, lights: t < 0.15 ? [{ x: lx, y: ly, r: 52, color: FLAME[2], a: 0.4 * (1 - t / 0.15) }] : [] };
}
void clamp01;
