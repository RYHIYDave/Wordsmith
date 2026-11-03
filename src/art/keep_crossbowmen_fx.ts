// FLOOR 19'S CROSSBOWMEN: THEIR AIM LINE AND THEIR BOLT (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// CROSSBOW_ON (art/keep_crossbowmen.ts, off). Their moves are art/keep_crossbowmen_moves.ts; this is what their shot draws
// across the floor, from where they stand, `t` seconds into it (its times are the shot's own, CB_SHOT).
//
// His brief: “a long aimed shot: a red aim line, held, then the bolt in a flash, far and straight”; and his rule for the
// enemies, 28 Oct: “And bigger AOE to compensate for the extra time the player gets to evade”.
//
//   THE LANE: as the crossbow comes up over the pavise, a lane of deep warning red is drawn out across the floor from the
//     pavise, 12 tiles long and most of a tile wide (`CB_LANE`): where the bolt will go. Held through the warning, pulsing;
//     at its end, the last warning, it flares.
//   THE SIGHT: a thin bright red line from the bolt's head along the crossbow, level, to the lane's end; it trembles as the
//     crossbow trembles and steadies as he steadies.
//   THE BOLT (two frames, his Movement 9): half way down the line in the first, at its end in the second: a white-hot
//     streak the whole length, its after-images behind it; it strikes the end in a burst of grit; the streak thins and is
//     gone in a few frames, a wake of pale air (the hiss) left along it a moment.
//
// The red is a deep warning red, its hues 0 to 12 degrees: never the enemy's pink glow (300 to 350), never cyan.

import { CB_SHOT, CROSSBOWMAN, CB_LINE, bowAtMove } from './keep_crossbowmen_moves';
import { hash } from './kit';
import type { Painted } from './kit';
import { TILE3, posedOfMob, skeletonAt } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, mul } from './skeleton';
import type { V3 } from './skeleton';
import { PLANTED_AT } from './keep_crossbowmen';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The lane: from just before the pavise to `CB_LINE.tiles` from their feet, `wide` tiles across. */
export const CB_LANE = { from: PLANTED_AT.x + 3, tiles: CB_LINE.tiles, wide: 0.8 } as const;
/** The fx's picture: room for the whole line, from in front and from behind (their floor point at `ax`, `ay`). */
export const CB_FX_CANVAS = { w: 440, h: 540, ax: 34, ay: 270 } as const;
/** Its colours: the lane's deep red, the sight's bright red, the flare; the bolt's white-hot streak; the grit; the hiss. */
export const LINE_RED = ['#4e0806', '#86100c', '#c41c14', '#f0301e', '#ff7a5c'] as const;
export const BOLT_HOT = ['#fff4ea', '#ffd8c4', '#ff9a78'] as const;
const GRIT = ['#a8a49c', '#7c7870', '#56524c'];
const HISS = ['#c4c0c8', '#9a96a2'];
/** Its times (seconds into the shot). */
export const CB_FX = { grow: CB_SHOT.line, steady: CB_SHOT.steady, strike: CB_SHOT.strike, fade: [CB_SHOT.hit, CB_SHOT.hit + 0.22] as const } as const;

type Px = Painted['px'];
const lay = (px: Px, x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};
/** A point `along` the line and `off` across it (to its left), `z` up, the line turned `deg` from the way they face. */
const onLine = (along: number, off: number, z: number, deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a) * along - Math.sin(a) * off, Math.sin(a) * along + Math.cos(a) * off, z];
};
/** Where the bolt's head is (in the groove, levelled), at `t` into the shot. */
export function muzzleAt(t: number): V3 {
  const tt = Math.min(t, CB_SHOT.strike[0]);
  return bowAtMove('attack', tt, skeletonAt(CROSSBOWMAN, 'attack', tt), posedOfMob(CROSSBOWMAN, 'attack', tt)).head;
}
/** The sight's way at `t`: the crossbow's own, as it trembles. */
function sightWay(t: number): V3 {
  const tt = Math.min(t, CB_SHOT.strike[0]);
  return bowAtMove('attack', tt, skeletonAt(CROSSBOWMAN, 'attack', tt), posedOfMob(CROSSBOWMAN, 'attack', tt)).way;
}

/**
 * THE SHOT AS IT IS DRAWN ON THE FLOOR, `t` seconds into it, seen `view`: `under` (the lane, under the figures) and `over`
 * (the sight, the bolt, its grit and its hiss, over them); the line turned `deg` from the way they face (the game's aim)
 * and `tiles` long (where it is cut short by a wall).
 */
export function shotPainted(t: number, view: GameView = 'front', deg = 0, tiles: number = CB_LANE.tiles): { under: Painted; over: Painted } {
  const pv = view === 'back' ? 'rear' : 'front';
  const C = CB_FX_CANVAS;
  const st: Stage = stage(pv, C.ax, C.ay, C);
  const under = st.whole(null);
  const over = (() => {
    const s2 = stage(pv, C.ax, C.ay, C);
    return s2.whole(null);
  })();
  const L = tiles * TILE3;
  const half = (CB_LANE.wide * TILE3) / 2;
  const [g0, g1] = CB_FX.grow;
  const [s0, s1] = CB_FX.strike;
  const at = (p: V3): [number, number] => st.at(p) as unknown as [number, number];
  // --- THE LANE, drawn out from the pavise to its end, held, pulsing, flaring at the last ---
  if (t >= g0 && t < s1 + 1 / 30) {
    const grown = CB_LANE.from + (L - CB_LANE.from) * smooth(g0, g1, t);
    const flare = smooth(CB_FX.steady[0], CB_FX.steady[1], t);
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
    const gone = t > s0 + 1e-6;
    // (the floor of it, a dither of the deep red, thicker as it flares; its edges solid)
    const step = 1.2;
    for (let a = CB_LANE.from; a <= grown; a += step) {
      for (let o = -half; o <= half; o += step) {
        const edge = Math.abs(o) > half - step * 1.2;
        const [x, y] = at(onLine(a, o, 0, deg));
        const xi = Math.round(x);
        const yi = Math.round(y);
        if (edge) {
          lay(under, x, y, flare > 0.5 || gone ? LINE_RED[3] : LINE_RED[2]);
          continue;
        }
        const dense = 0.28 + 0.12 * pulse + 0.45 * flare;
        if (hash(xi, yi, 9501) < dense) lay(under, x, y, (xi + yi) % 3 === 0 ? LINE_RED[1] : LINE_RED[0]);
      }
    }
    // (its far end: a bar across it, and a mark where the bolt will land)
    for (let o = -half - 3; o <= half + 3; o += 0.8) {
      const [x, y] = at(onLine(grown, o, 0, deg));
      lay(under, x, y, LINE_RED[3], 2);
    }
    // --- THE SIGHT, from the bolt's head along the crossbow, level, to the lane's end ---
    if (!gone) {
      const from = muzzleAt(t);
      const way = sightWay(t);
      const a = (deg * Math.PI) / 180;
      const turned: V3 = [Math.cos(a) * way[0] - Math.sin(a) * way[1], Math.sin(a) * way[0] + Math.cos(a) * way[1], way[2]];
      const fromT: V3 = [Math.cos(a) * from[0] - Math.sin(a) * from[1], Math.sin(a) * from[0] + Math.cos(a) * from[1], from[2]];
      const long = Math.max(0, grown - from[0]);
      for (let d = 0; d <= long; d += 0.5) {
        const p = add(fromT, mul(turned, d));
        const [x, y] = at(p);
        lay(over, x, y + 1, LINE_RED[1]);
        lay(over, x, y, flare > 0.6 && Math.floor(t * 30) % 2 === 0 ? LINE_RED[4] : LINE_RED[3]);
      }
    }
  }
  // --- THE BOLT: two frames down the whole line; its after-images; the grit where it strikes; the streak thinning; the hiss ---
  if (t > s0 + 1e-6 && t <= CB_FX.fade[1]) {
    const from = muzzleAt(s0);
    const fromT = onLine(from[0], from[1], from[2], deg);
    const endA = L;
    const k = clamp01((t - s0) / (s1 - s0));
    const headAt = from[0] + (endA - from[0]) * k;
    const after = t > s1 + 1e-6;
    const fade = after ? smooth(s1, CB_FX.fade[1], t) : 0;
    const along = (d: number, z: number, off = 0): V3 => onLine(d, from[1] + off, z, deg);
    void fromT;
    if (fade < 0.75) {
      for (let d = from[0]; d <= headAt; d += 0.5) {
        const back = (headAt - d) / Math.max(1, headAt - from[0]);
        if (after && hash(Math.round(d * 2), Math.floor(t * 60), 9503) < fade * 1.4) continue;
        const [x, y] = at(along(d, from[2]));
        // (white-hot at its middle, red at its edges; the oldest of it dimmer)
        lay(over, x, y - 1, back > 0.6 ? BOLT_HOT[2] : BOLT_HOT[1]);
        lay(over, x, y + 1, back > 0.6 ? LINE_RED[2] : BOLT_HOT[2]);
        lay(over, x, y, after ? BOLT_HOT[1] : BOLT_HOT[0]);
      }
      // (its after-images: the bolt drawn again every so often behind its head, dimmer the further back)
      if (!after) {
        for (let i = 0; i < 7; i++) {
          const d = headAt - i * 34;
          if (d < from[0] + 10) break;
          for (let e = -12; e <= 0; e += 0.6) {
            const [x, y] = at(along(d + e, from[2] + 1.6));
            lay(over, x, y, i === 0 ? BOLT_HOT[0] : i < 3 ? BOLT_HOT[1] : BOLT_HOT[2]);
          }
        }
      }
    }
    // the grit and the dust where it strikes, at the line's end
    if (t >= s1 - 1e-6) {
      const kk = clamp01((t - s1) / 0.3);
      const end = along(endA, from[2]);
      for (let i = 0; i < 28; i++) {
        const own = hash(i, 1, 9505);
        if (own < kk * 0.85) continue;
        const a = (i / 28) * Math.PI * 2;
        const r = (2 + 26 * Math.sqrt(kk)) * (0.5 + 0.6 * hash(i, 2, 9505));
        const p: V3 = [end[0] + Math.cos(a) * r * 0.6, end[1] + Math.sin(a) * r, Math.max(0.5, end[2] + Math.sin(a * 2 + i) * r * 0.4 - 30 * kk * kk)];
        const [x, y] = at(p);
        lay(over, x, y, i % 3 === 0 ? GRIT[0] : i % 3 === 1 ? GRIT[1] : GRIT[2], own > 0.6 && kk < 0.5 ? 2 : 1);
      }
      if (kk < 0.25) {
        const [x, y] = at(end);
        lay(over, x, y, BOLT_HOT[0], 3);
      }
    }
    // the hiss: pale air left along the line, thinning
    if (after) {
      for (let d = from[0] + 6; d <= endA; d += 9) {
        if (hash(Math.round(d), 4, 9507) < fade) continue;
        const wob = Math.sin(d * 0.2 + t * 20) * 2.2 * fade;
        const [x, y] = at(along(d, from[2] + wob, Math.cos(d * 0.3) * 2 * fade));
        lay(over, x, y, d % 2 ? HISS[0] : HISS[1]);
      }
    }
  }
  return { under: { px: under, lights: [] }, over: { px: over, lights: [] } };
}
