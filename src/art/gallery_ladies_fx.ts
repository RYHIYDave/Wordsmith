// FLOOR 18'S LADIES-IN-WAITING: THE LIGHT THEIR MIRRORS THROW (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind LADIES_ON (art/gallery_ladies.ts, off). Their moves are art/gallery_ladies_moves.ts.
//
// The brief as offered: “a flash from the hand mirror, a short bright beam of cold light (silver, never cyan)”; his rule
// for the enemies, 28 Oct: “And bigger AOE to compensate for the extra time the player gets to evade”; and his pick of
// 30 Oct (“Yes, these (Recommended)”): they keep their distance, “circling to flash at you from range”. So the beam is
// thrown SIX AND A HALF TILES, spreading to THREE TILES wide at its end: a long wedge of light on the floor before her.
//
//   THE BEAM IN THE AIR (`flashBeam`, laid after her edge in her own picture): from her glass the instant her strike lands,
//     a burst of light at the glass and a fan of rays down to the floor's far edge, a white core, lavender rays; held a
//     moment, then breaking up into glitter and gone.
//   THE LIGHT ON THE FLOOR (`flashPainted`, laid on the floor under every figure where the game puts it: at her feet,
//     turned the way she faces): through her wind-up, a spot of reflected light skitters over the floor before her where
//     the beam will fall (a warning you can read on the floor); as the strike lands, the whole wedge is lit at once, its
//     edges bright, the floor inside it washed with cold light; held as long as the beam; then it breaks up and is gone.
//   Silver-white and lavender all through (hue about 250 to 265): never cyan, never the enemy's pink.

import type { Painted } from './kit';
import { hash } from './kit';
import { TILE3 } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, lerp3, mul } from './skeleton';
import type { V3 } from './skeleton';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/**
 * THE BEAM: how far it is thrown (her own lengths: four and a half tiles), how wide at its end (two and a half tiles), where
 * on the floor it begins before her; how long it holds at full and how long it takes to break up (seconds from the blow);
 * and how long before the blow the spot of light skitters on the floor (the warning).
 */
export const FLASH_FX = { reach: 6.5 * TILE3, wide: 3 * TILE3, near: 0.45 * TILE3, hold: 0.14, fade: 0.3, warn: 0.6 } as const;
/** Its colours: the white of the core, silver-white, lavender, a dull lavender, the darkest of its wash. */
export const LIGHT = ['#fbf9ff', '#e6e0f6', '#c9c0e6', '#a69cc8', '#8279a8'] as const;

/** How far across the wedge reaches, `along` of the way out from her (her own lengths). */
export const wedgeHalf = (along: number): number => {
  const k = clamp01((along - FLASH_FX.near) / (FLASH_FX.reach - FLASH_FX.near));
  return 4 + (FLASH_FX.wide / 2 - 4) * k;
};

/**
 * THE BEAM IN THE AIR, `age` seconds after the blow, thrown from `from` (her glass's face, in her own space): grains to lay
 * after her edge. `rnd(i)`: a number from 0 to 1 for each grain, changing frame to frame (its flicker).
 */
export function flashBeam(from: V3, age: number, rnd: (i: number) => number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const long = FLASH_FX.hold + FLASH_FX.fade;
  if (age < -1e-6 || age > long) return out;
  const k = age <= FLASH_FX.hold ? 1 : 1 - smooth(FLASH_FX.hold, long, age);
  const R = FLASH_FX.reach;
  let i = 0;
  // THE BURST at the glass: spikes of white flung out, shrinking
  if (age < 0.12) {
    const b = 1 - age / 0.12;
    for (let j = 0; j < 12; j++) {
      const a = (j / 12) * Math.PI * 2 + 0.2;
      const len = (j % 2 ? 6 : 13) * b + 2;
      for (let e = 0.6; e <= len; e += 0.5) {
        const p = add(from, [Math.cos(a) * e * 0.6, Math.sin(a) * e * 0.6, Math.sin(a + 0.8) * e * 0.8]);
        out.push([p, e < len * 0.4 ? LIGHT[0] : e < len * 0.75 ? LIGHT[1] : LIGHT[2], e < 3 ? 2 : 1]);
      }
    }
  }
  // THE CONE: rays from the glass down to the whole edge of the wedge it lights on the floor (its near edge, both sides
  // and its far edge), the outermost brightest; so the light in the air and the light on the floor are one cone
  const N = FLASH_FX.near;
  const edge: { p: V3; rim: boolean }[] = [];
  for (let k = 0; k <= 2; k++) edge.push({ p: [N, (k - 1) * wedgeHalf(N), 0], rim: k !== 1 });
  for (let k = 1; k <= 6; k++) {
    const a = N + ((R - N) * k) / 7;
    for (const sd of [-1, 1]) edge.push({ p: [a, sd * wedgeHalf(a), 0], rim: true });
  }
  for (let k = 0; k <= 8; k++) edge.push({ p: [R, ((k / 8) * 2 - 1) * wedgeHalf(R), 0], rim: k === 0 || k === 8 });
  edge.push({ p: [R * 0.92, 0, 0], rim: false });
  edge.forEach((e, j) => {
    const len = Math.hypot(e.p[0] - from[0], e.p[1] - from[1], e.p[2] - from[2]);
    const steps = Math.ceil(len * 1.3);
    const core = j === edge.length - 1;
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      i++;
      if (age > FLASH_FX.hold && rnd(i) > k * 0.8) continue;
      if (!core && !e.rim && (s + j) % 3 === 0) continue;
      out.push([lerp3(from, e.p, u), core ? (u < 0.85 ? LIGHT[0] : LIGHT[1]) : e.rim ? LIGHT[1] : LIGHT[2], core && age < FLASH_FX.hold ? 2 : 1]);
    }
  });
  // A SHEET OF LIGHT filling the cone, thicker near the glass; glitter in it as it breaks up
  for (let j = 0; j < 1500; j++) {
    const a = N + (R - N) * Math.sqrt(hash(j, 1, 7841));
    const b = (hash(j, 2, 7841) * 2 - 1) * wedgeHalf(a);
    const u = Math.pow(hash(j, 5, 7841), 0.7);
    const p = lerp3(from, [a, b, 0], u);
    i++;
    if (rnd(i) > k * (age > FLASH_FX.hold ? 0.5 : 0.75)) continue;
    out.push([age > FLASH_FX.hold ? add(p, [0, 0, -14 * (age - FLASH_FX.hold)]) : p, hash(j, 3, 7841) < 0.35 ? LIGHT[1] : u < 0.4 ? LIGHT[2] : LIGHT[3], 1]);
  }
  return out;
}

// =============================================================================================
// THE LIGHT ON THE FLOOR

export const FLASH_CANVAS = { w: 286, h: 272, ax: 18, ay: 136 } as const;
const lay = (px: Painted['px'], x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};
/**
 * THE LIGHT ON THE FLOOR at `t` seconds from her blow (less than nothing: her wind-up), as it lies before her (her floor
 * point at the canvas's anchor, facing her way), from in front or from behind.
 */
export function flashPainted(t: number, view: GameView = 'front'): Painted {
  const can = FLASH_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const px = st.whole(null);
  const long = FLASH_FX.hold + FLASH_FX.fade;
  if (t < -FLASH_FX.warn || t > long) return { px, lights: [] };
  const F = FLASH_FX;
  if (t < 0) {
    // THE WARNING: a spot of reflected light skittering over the floor along where the beam will fall, brighter and
    // further as the blow comes
    const k = smooth(-F.warn, 0, t);
    const along = F.near + (F.reach - F.near) * (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 19))) * (0.6 + 0.4 * k);
    const across = wedgeHalf(along) * 0.35 * Math.sin(t * 31);
    const r = 3 + 3 * k;
    for (let dy = -r; dy <= r; dy += 0.5) {
      for (let dx = -r * 1.4; dx <= r * 1.4; dx += 0.5) {
        const d = Math.hypot(dx / 1.4, dy) / r;
        if (d > 1) continue;
        const [x, y] = st.at([along + dx, across + dy, 0]);
        lay(px, x, y, d < 0.45 ? LIGHT[0] : d < 0.8 ? LIGHT[2] : LIGHT[4]);
      }
    }
    return { px, lights: [] };
  }
  const k = t <= F.hold ? 1 : 1 - smooth(F.hold, long, t);
  const tick = Math.round(t * 30);
  // THE WASH: the floor inside the wedge lit, a dither of cold light, brighter toward its middle line and its far end
  for (let a = F.near; a <= F.reach; a += 0.45) {
    const half = wedgeHalf(a);
    for (let b = -half; b <= half; b += 0.45) {
      const [x, y] = st.at([a, b, 0]);
      const xi = Math.round(x);
      const yi = Math.round(y);
      const mid = 1 - Math.abs(b) / half;
      const out = (a - F.near) / (F.reach - F.near);
      if ((xi + yi) % 2 !== 0 && mid < 0.7) continue;
      if (hash(xi, yi + tick * 3, 7851) > k * (0.55 + 0.45 * mid)) continue;
      lay(px, xi, yi, mid > 0.85 ? LIGHT[1] : mid > 0.45 || out > 0.85 ? LIGHT[2] : LIGHT[3]);
    }
  }
  // ITS EDGES: bright lines down both sides and a ragged far edge
  for (let a = F.near; a <= F.reach; a += 0.35) {
    for (const s of [-1, 1]) {
      const [x, y] = st.at([a, s * wedgeHalf(a), 0]);
      if (hash(Math.round(a * 3), s, 7852 + tick) > k) continue;
      lay(px, x, y, LIGHT[1]);
    }
  }
  const halfEnd = wedgeHalf(F.reach);
  for (let b = -halfEnd; b <= halfEnd; b += 0.35) {
    const ragged = 1.6 * Math.abs(Math.sin(b * 0.9 + 1));
    const [x, y] = st.at([F.reach + ragged, b, 0]);
    if (hash(Math.round(b * 3), 3, 7853 + tick) > k) continue;
    lay(px, x, y, LIGHT[1]);
  }
  // GLITTER over it, winking
  for (let j = 0; j < 110; j++) {
    const a = F.near + (F.reach - F.near) * Math.sqrt(hash(j, 1, 7854));
    const b = (hash(j, 2, 7854) * 2 - 1) * wedgeHalf(a);
    if (hash(j, tick, 7855) > k * 0.6) continue;
    const [x, y] = st.at([a, b, 0.5]);
    lay(px, x, y, LIGHT[0], hash(j, 4, 7854) < 0.3 ? 2 : 1);
  }
  return { px, lights: k > 0.05 ? [{ x: st.at([F.reach * 0.55, 0, 0])[0], y: st.at([F.reach * 0.55, 0, 0])[1], r: 70, color: '#d6ceee', a: 0.22 * k }] : [] };
}
void mul;
