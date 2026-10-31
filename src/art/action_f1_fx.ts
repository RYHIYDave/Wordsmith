// FLOOR 1, THE WARDEN'S TOMB: WHAT THE BONE ARCHER'S ARROW RAIN AND THE WARDEN'S LOCKDOWN LEAVE ON THE FLOOR (the art chat's
// helper, 31 Oct 2026; docs/mockups/action_f1/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS IT. The moves themselves are in
// the live rigs behind switches that are off (art/monster_bones.ts ARCHER_RAIN, art/monster_warden.ts WARDEN_LOCKDOWN).
//
// The owner's review of every enemy for more action: “I want buried battles when you’re fighting enemies and then once you fight
// them enough, I want you to be able to recognize what’s going to happen and which enemies to be aware of and what they do”. His
// picks: for the bone archer, “Both shots” (its straight arrow, and now and then the rain); for the Warden, “Yes (Recommended)” to
// the Lockdown in place of the slam. His rulebook's Movement 9 (“Like the wind up and wind down are big but the actual punch is
// lightning quick”) and his word of 28 Oct for the enemies (“And bigger AOE to compensate for the extra time the player gets to
// evade”): each warns long and big on the floor, and strikes in one or two frames.
//
//   THE ARROW RAIN: what the archer looses flies on up into the dark (`rainRisePainted`, at the archer); where the hero stood, a
//     ring of the enemy's pink comes down on the floor, and fills with the shadows of falling arrows, more and darker as they come;
//     1.5 s after the loose they strike, all in two frames (a streak, then stuck), splinters and dust thrown up, the arrows left
//     standing in the stones a moment, then crumbling away (`rainPainted`, at the ring's middle; a floor layer and an air layer).
//   THE LOCKDOWN: as the Warden raises his keys, the shadows of iron bars lie across his arena in rows, the enemy's pink at their
//     edges, darker and sharper as the bars come (`lockShadowPainted`); as he wrenches the keys down the bars crash down in two
//     frames (a streak, then planted), sparks and dust off the stones; they stand a while as the walls of a cage, cells between
//     them to stand in; then they rise away (`lockBarsPainted`). A row is any number of tiles long, along either of the floor's
//     ways; drawn a tile at a time it sorts with the figures as any piece standing on the floor does.
//
// Everything here is a picture of a moment (seconds), on a canvas of its own with the floor point it stands on (its anchor), in
// picture pixels (two to a game pixel), as the figures are. Nothing glows cyan; the pink is the enemy's own; every pixel is whole.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { BONE, INK, PINK, PLUM, RIM_ALPHA, edge, hash } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME, IRON, SOCKET } from './mkit';
import type { Canvas } from './mkit';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const FR = 1 / 30;

/**
 * THE FLOOR, as the game lays it (engine/iso.ts): a tile is a diamond 32 by 16 game pixels; its x way runs down the screen to the
 * right, its y way down to the left. In picture pixels (two to a game pixel), a point `x`, `y` tiles from a floor point is this far
 * across and down from it.
 */
export function floorPx(x: number, y: number): [number, number] {
  return [32 * (x - y), 16 * (x + y)];
}
/** The floor point (tiles) under a picture pixel's offset from a floor point. */
export function floorOf(X: number, Y: number): [number, number] {
  return [(X / 32 + Y / 16) / 2, (Y / 16 - X / 32) / 2];
}
/** The ways the figures are seen: from in front (facing down the screen and right) and from behind (up it and right). */
export type View = 'front' | 'back';

// =============================================================================================
// THE ARROW RAIN

/**
 * ITS NUMBERS. Times are seconds from the archer's loose (art/monster_bones.ts RAIN_LOOSE, 0.9 s into its move).
 *   radius   the ring, in tiles (his rule: big; 1.8 to 2.2 reads well, 2.0 drawn): a hero whose middle is inside it when the arrows
 *            strike is hit.
 *   delay    from the loose to the strike: the ring is on the floor all that time, filling.
 *   strike   the strike's two frames: the arrows a streak in the air, then struck (the hit lands on the second, at `delay`).
 *   stuck    how long the arrows stand in the stones after; `gone`, how long they take to crumble away. Then nothing is left.
 *   arrows   how many come down in the ring.
 *   rise     how long what it loosed is seen flying up into the dark over the archer (from the frame after the loose).
 */
export const RAIN = { radius: 2.0, delay: 1.5, strike: [1.5 - FR, 1.5] as const, stuck: 0.6, gone: 0.25, arrows: 26, rise: 0.15 } as const;
/** How long the rain's picture lasts (from the loose): after this it is empty. */
export const RAIN_LONG = RAIN.delay + RAIN.stuck + RAIN.gone;

/** The rain's canvas: the ring (up to 2.2 tiles) on the floor, and room above it for the arrows coming down. Its anchor is the ring's middle. */
export const RAIN_CANVAS: Canvas = { w: 240, h: 252, ax: 120, ay: 170 };
/** The rising arrow's canvas, its anchor the archer's floor point (what the archer looses leaves its bow about 100 picture pixels up). */
export const RISE_CANVAS: Canvas = { w: 124, h: 300, ax: 24, ay: 290 };

/** Where the arrowhead is in the frame of the loose, from the archer's floor point (picture pixels): measured off its frames (tests/action_f1.test.ts holds them to it). */
export const LOOSE_HEAD: Readonly<Record<View, readonly [number, number]>> = { front: [27, -98], back: [25, -98] };
/** The way the loosed arrow flies (degrees up from screen-right): its aim at the loose. */
export const LOOSE_AIM = 71;

const SHAFT = PLUM[3];
const DUST = ['#3c3848', '#55506a', '#767088'];
const SPLINTER = ['#8a7a68', '#c8b498', BONE[2]];
const WINE = '#4a1638';

/** Where the head of what it loosed is, `t` seconds after the loose (from the frame after it), from the archer's floor point (picture pixels): on up the way it was loosed, at about 1700 a second, slowing a little; out of sight 165 pixels past where it left the frame of the loose. */
export function riseHeadAt(t: number, view: View = 'front'): [number, number] {
  const [hx, hy] = LOOSE_HEAD[view];
  const a = (LOOSE_AIM * Math.PI) / 180;
  const k = clamp01(t / RAIN.rise);
  const gone = 55 + 110 * (1 - (1 - k) * (1 - k));
  return [hx + Math.cos(a) * gone, hy - Math.sin(a) * gone];
}

/** WHAT IT LOOSED, flying on up into the dark over the archer, `t` seconds after the loose: the arrow, its spark, a pink trail; gone by RAIN.rise. */
export function rainRisePainted(t: number, view: View = 'front'): Painted {
  const px = new Px(RISE_CANVAS.w, RISE_CANVAS.h);
  const lights: Light[] = [];
  if (t < FR - 1e-6 || t > RAIN.rise + 1e-6) return { px, lights };
  const a = (LOOSE_AIM * Math.PI) / 180;
  const fx = Math.cos(a);
  const fy = -Math.sin(a);
  const [ox, oy] = riseHeadAt(t, view);
  const k = clamp01(t / RAIN.rise);
  const head: [number, number] = [RISE_CANVAS.ax + ox, RISE_CANVAS.ay + oy];
  const fade = smooth(0.45, 1, k);
  // the trail behind it: the spark's pink, broken more the further back
  const trail = 46 * (1 - fade * 0.6);
  for (let d = 4; d < trail; d++) {
    const x = Math.round(head[0] - fx * (d + 20));
    const y = Math.round(head[1] - fy * (d + 20));
    if (hash(x, y, 9101) < d / trail - 0.1) continue;
    px.set(x, y, d < trail * 0.4 ? PINK[3] : PINK[2]);
  }
  // the arrow, shorter as it goes off into the dark (seen end on, at last only its spark)
  const len = Math.round(27 * (1 - fade));
  for (let d = 0; d <= len; d++) {
    const x = Math.round(head[0] - fx * d);
    const y = Math.round(head[1] - fy * d);
    px.set(x, y, d === 0 ? FLAME[4] : d === 1 ? FLAME[3] : d >= len - 3 ? PINK[3] : SHAFT);
  }
  // the spark at its head
  const r = fade > 0.8 ? 0 : 1;
  for (let oy = -r; oy <= r; oy++) for (let ox = -r; ox <= r; ox++) if (Math.abs(ox) + Math.abs(oy) <= r) px.set(Math.round(head[0]) + ox, Math.round(head[1]) + oy, ox === 0 && oy === 0 ? FLAME[4] : SOCKET);
  lights.push({ x: head[0], y: head[1], r: 10 - fade * 6, color: SOCKET, a: 0.55 * (1 - fade) + 0.15 });
  return { px, lights };
}

/** Where the arrows come down in a ring of `radius` tiles (tiles from its middle), and when each one's shadow first shows (seconds from the loose). */
function rainSpots(radius: number): { x: number; y: number; at: number }[] {
  const out: { x: number; y: number; at: number }[] = [];
  const n = RAIN.arrows;
  for (let i = 0; i < n; i++) {
    // (spread evenly over the ring, a little jostled)
    const r = radius * 0.9 * Math.sqrt((i + 0.6) / n);
    const th = i * 2.39996 + (hash(i, 1, 9201) - 0.5) * 0.5;
    // (the shadows show one after another, more and more of them: the first a little after the ring, the last 0.3 s before the strike)
    const order = hash(i, 2, 9202);
    out.push({ x: r * Math.cos(th), y: r * Math.sin(th), at: 0.12 + Math.pow(order, 0.75) * (RAIN.delay - 0.42) });
  }
  return out;
}

/** The way the arrows come down, on the picture (a unit step): steeply, and a little along the way the archer shot (it faces down-right from in front, up-right from behind). */
function fallOf(view: View): [number, number] {
  const fl = view === 'front' ? [0.894, 0.447] : [0.894, -0.447];
  const v = [fl[0] * 0.24, fl[1] * 0.24 + 1];
  const l = Math.hypot(v[0], v[1]);
  return [v[0] / l, v[1] / l];
}

/**
 * THE RAIN where it comes down, `t` seconds after the loose, in a ring of `radius` tiles. `layer` 'floor' is what lies on the
 * floor (the ring, its fill, the shadows, the dust's foot: drawn under the figures); 'air' what stands up off it (the arrows coming
 * down and stuck, splinters, dust rising: sorted with the figures by the ring's middle, or drawn over them).
 */
export function rainPainted(t: number, view: View = 'front', layer: 'floor' | 'air' = 'floor', radius: number = RAIN.radius): Painted {
  const C = RAIN_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > RAIN_LONG) return { px, lights };
  const spots = rainSpots(radius);
  const [vx, vy] = fallOf(view);
  const struck = t >= RAIN.delay - 1e-6;
  const since = t - RAIN.delay;
  const at = (x: number, y: number): [number, number] => {
    const [X, Y] = floorPx(x, y);
    return [C.ax + X, C.ay + Y];
  };
  if (layer === 'floor') {
    if (!struck || since < 2 * FR) {
      // THE RING: it comes down out of nothing in the first frames (a little wide, settling), then pulses, faster as the strike nears; on the strike it flashes and is gone
      const R = radius * (1 + 0.12 * (1 - smooth(0, 0.16, t)));
      const near = clamp01(t / RAIN.delay);
      const beat = Math.floor(t * (4 + near * 10)) % 2 === 0;
      const flash = struck;
      for (let Y = 0; Y < C.h; Y++) {
        for (let X = 0; X < C.w; X++) {
          const [u, v] = floorOf(X + 0.5 - C.ax, Y + 0.5 - C.ay);
          const d = Math.hypot(u, v) / R;
          if (d > 1.04) continue;
          // (its edge: two lines of pink, the outer the brighter)
          const ed = (1 - d) * R * 45;
          if (ed < 0) {
            if (d < 1.04 && (beat || flash)) px.set(X, Y, flash ? FLAME[4] : PINK[2]);
            continue;
          }
          if (ed < 1.6) {
            px.set(X, Y, flash ? FLAME[4] : beat ? ENEMY_RIM : PINK[3]);
            continue;
          }
          if (ed < 2.6) {
            px.set(X, Y, flash ? FLAME[3] : PINK[2]);
            continue;
          }
          // (inside: a wash of the enemy's wine, thicker as the arrows come)
          const fill = flash ? 0.45 : 0.06 + 0.2 * near * near;
          if (bayer(X, Y) < fill) px.set(X, Y, flash ? PINK[2] : WINE);
        }
      }
      lights.push({ x: C.ax, y: C.ay, r: radius * 40, color: SOCKET, a: flash ? 0.45 : 0.08 + near * 0.14 });
    }
    // THE SHADOWS of the arrows coming down: each from when it shows, a faint fleck growing to a hard dark dash along their way
    if (!struck) {
      for (const s of spots) {
        if (t < s.at) continue;
        const g = smooth(s.at, RAIN.delay, t);
        const [cx, cy] = at(s.x, s.y);
        const long = 2 + Math.round(g * 6);
        const dark = g < 0.3 ? DUST[0] : g < 0.65 ? '#1e1a2a' : INK;
        // (a dash along the floor the way they fly: down-right from in front, up-right from behind)
        const [wx, wy] = view === 'front' ? [0.894, 0.447] : [0.894, -0.447];
        for (let k = -long; k <= 1; k++) {
          const x = Math.round(cx + wx * k);
          const y = Math.round(cy + wy * k);
          px.set(x, y, dark);
          if (g > 0.45) px.set(x, y + 1, dark);
        }
        // (in the last moments a point of pink where each will strike)
        if (t > RAIN.delay - 0.3 && Math.floor(t * 20) % 2 === 0) px.set(Math.round(cx), Math.round(cy), ENEMY_RIM);
      }
    } else if (since < RAIN.stuck + RAIN.gone) {
      // struck: a crater of dark broken stone round each arrow's foot, and the dust's skirt on the floor, fading
      for (const s of spots) {
        const [cx, cy] = at(s.x, s.y);
        const ix = Math.round(cx);
        const iy = Math.round(cy);
        px.set(ix - 1, iy, INK).set(ix + 1, iy, INK).set(ix, iy + 1, INK).set(ix - 2, iy + 1, DUST[0]).set(ix + 2, iy, DUST[0]);
        const k = clamp01(since / 0.4);
        if (k < 1) for (let n = 0; n < 6; n++) {
          const a = n * 1.047 + hash(ix, iy, 9301);
          const r = 2 + k * 7;
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r * 0.5);
          if (hash(x, y, 9302) > k * 0.9) px.set(x, y, DUST[1]);
        }
      }
    }
    return { px, lights };
  }
  // --- the air ---
  if (!struck && t < RAIN.strike[0] - 1e-6) return { px, lights };
  if (!struck) {
    // THE FIRST FRAME OF THE STRIKE: every arrow a streak coming down at its spot, its head a little over the floor, the way it came drawn out behind it in after-images
    for (const s of spots) {
      const [cx, cy] = at(s.x, s.y);
      const up = 12 + hash(Math.round(cx), Math.round(cy), 9401) * 14;
      const hx = cx - vx * up;
      const hy = cy - vy * up;
      for (let d = 0; d <= 70; d++) {
        const x = Math.round(hx - vx * d);
        const y = Math.round(hy - vy * d);
        if (y < 1) break;
        if (d <= 20) px.set(x, y, d === 0 ? FLAME[4] : d < 3 ? FLAME[3] : d > 16 ? PINK[3] : SHAFT);
        else if (hash(x, y, 9402) > (d - 20) / 55) px.set(x, y, d < 40 ? PINK[2] : PLUM[2]);
      }
    }
    edge(px, ENEMY_RIM, RIM_ALPHA);
    return { px, lights };
  }
  // STRUCK: the arrows stand in the stones, leaning back the way they came; splinters and dust thrown up; then they crumble away
  const crumble = clamp01((since - RAIN.stuck) / RAIN.gone);
  for (const s of spots) {
    const [cx, cy] = at(s.x, s.y);
    const seed = Math.round(cx * 7 + cy * 13);
    const len = 14 + Math.round(hash(seed, 3, 9501) * 4);
    // (it shudders as it bites, a pixel for two frames)
    const shake = since < 2 * FR ? (hash(seed, 4, 9502) < 0.5 ? 1 : -1) : 0;
    for (let d = 0; d <= len; d++) {
      // (crumbling, it goes from the top down, a few pixels at a time)
      if (crumble > 0 && d > len * (1 - crumble) - hash(seed, d, 9503) * 3) continue;
      const lean = d / len;
      const x = Math.round(cx - vx * d + (d > len - 5 ? shake * lean : 0));
      const y = Math.round(cy - vy * d);
      px.set(x, y, d >= len - 3 ? (d === len - 2 ? PINK[3] : PINK[2]) : SHAFT);
      if (d >= len - 3 && d <= len - 1) px.set(x - 1, y, PINK[2]);
    }
    // splinters: two or three bits of shaft and stone, out and down in arcs
    const k = since / 0.28;
    if (k < 1) {
      for (let n = 0; n < 3; n++) {
        const a = -Math.PI / 2 + (hash(seed, n, 9504) - 0.5) * 2.6;
        const sp = 14 + hash(seed, n + 5, 9505) * 12;
        const x = Math.round(cx + Math.cos(a) * sp * k * 1.3);
        const y = Math.round(cy - 4 + Math.sin(a) * sp * k + 30 * k * k);
        if (y <= cy + 2) px.set(x, y, SPLINTER[n % 3]);
      }
    }
    // dust rising off the stone, spreading and thinning
    const kd = since / 0.45;
    if (kd < 1) {
      for (let n = 0; n < 7; n++) {
        const a = n * 0.9 + hash(seed, n, 9506);
        const r = 2 + kd * 8;
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy - 2 - kd * 7 + Math.sin(a) * r * 0.45);
        if (hash(x, y, 9507) > kd * 0.85) px.set(x, y, DUST[n % 2 === 0 ? 2 : 1]);
      }
    }
    if (since < 2 * FR) lights.push({ x: cx, y: cy - 4, r: 9, color: FLAME[3], a: 0.35 });
  }
  if (crumble < 1) edge(px, ENEMY_RIM, RIM_ALPHA);
  return { px, lights };
}

/** An ordered dither, 0..1, for a pixel (a fill made of whole pixels, never a wash of see-through ones). */
function bayer(x: number, y: number): number {
  const M = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  return (M[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
}

// =============================================================================================
// THE LOCKDOWN

/**
 * ITS NUMBERS. Times are seconds from the crash (art/monster_warden.ts LOCKDOWN_HIT, 1.2 s into his move: the frame he wrenches
 * the keys down).
 *   cell     the rows are this many tiles apart along both of the floor's ways: the cells between them are this square.
 *   band     a hero whose middle is this close to a row's line (tiles) when the bars crash is struck; the rest of a cell is safe
 *            (2.75 - 2 × 0.42: a square of about 1.9 tiles in each cell).
 *   warn     how long the shadows lie on the floor before the crash (they come as his keys go up).
 *   strike   the crash's two frames: the bars a streak in the air, then planted (the hit lands on the second, at 0).
 *   stand    how long they stand after the crash: the cage (walls while they stand).
 *   rise     how long they take to rise away. Then nothing is left.
 *   tall     the bars' height, picture pixels (the knight is 58, the Warden 122): head-high and more on the knight.
 *   pitch    bars to a tile along a row.
 */
export const LOCKDOWN = { cell: 2.75, band: 0.42, warn: 1.0, strike: [-FR, 0] as const, stand: 1.5, rise: 0.4, tall: 74, pitch: 4 } as const;
/** How long its picture lasts after the crash: after this it is empty. */
export const LOCKDOWN_LONG = LOCKDOWN.stand + LOCKDOWN.rise;
/** A row runs along the floor's x way (down the screen to the right) or its y way (down to the left). */
export type Way = 'x' | 'y';

/** The canvas of a row `tiles` long: room for the row along the floor, the bars' height and their rising away. Its anchor is the row's middle, on the floor. */
export function lockCanvas(tiles: number): Canvas {
  const half = Math.ceil(16 * tiles) + 28;
  const w = 2 * half;
  const up = LOCKDOWN.tall + 126;
  const down = Math.ceil(8 * tiles) + 18;
  return { w, h: Math.ceil(8 * tiles) + up + down, ax: half, ay: Math.ceil(8 * tiles) + up };
}

/** A point along a row (`s` tiles from its middle) and across it (`c` tiles), on its canvas. */
function rowAt(C: Canvas, way: Way, s: number, c: number): [number, number] {
  const [X, Y] = way === 'x' ? floorPx(s, c) : floorPx(c, s);
  return [C.ax + X, C.ay + Y];
}

/**
 * THE BARS' SHADOW on the floor, `t` seconds from the crash (from -LOCKDOWN.warn), along a row `tiles` long: a band across the
 * floor where they will come down, wide and faint at first and darker and sharper as they come (as the shadow of a thing falling
 * from high above), the enemy's pink at its two edges, pulsing faster; in its last moments the points where each bar will bite.
 * Once they are down, their dark foot along the floor; as they rise, a shadow widening and fading. Under the figures.
 */
export function lockShadowPainted(way: Way, t: number, tiles: number): Painted {
  const C = lockCanvas(tiles);
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -LOCKDOWN.warn || t > LOCKDOWN_LONG) return { px, lights };
  const halfL = tiles / 2;
  const before = t < 0;
  const k = before ? smooth(-LOCKDOWN.warn, 0, t) : 0;
  const rising = clamp01((t - LOCKDOWN.stand) / LOCKDOWN.rise);
  // (how wide the band is, tiles either side of the row's line)
  const half = before ? 0.62 - 0.4 * k : t < LOCKDOWN.stand ? 0.12 : 0.12 + 0.4 * rising;
  const beat = Math.floor(t * (3 + k * 12)) % 2 === 0;
  for (let Y = 0; Y < C.h; Y++) {
    for (let X = 0; X < C.w; X++) {
      const [u, v] = floorOf(X + 0.5 - C.ax, Y + 0.5 - C.ay);
      const s = way === 'x' ? u : v;
      const c = way === 'x' ? v : u;
      if (Math.abs(s) > halfL || Math.abs(c) > half) continue;
      const fromEdge = (half - Math.abs(c)) * 22;
      if (before) {
        if (fromEdge < 1.1) {
          px.set(X, Y, beat ? ENEMY_RIM : PINK[2]);
          continue;
        }
        // (the dark of it: thin at first, nearly whole at the last)
        if (bayer(X, Y) < 0.25 + 0.6 * k) px.set(X, Y, k > 0.6 ? INK : '#16121e');
      } else if (rising > 0) {
        if (bayer(X, Y) < 0.75 * (1 - rising)) px.set(X, Y, '#16121e');
      } else px.set(X, Y, INK);
    }
  }
  if (before && k > 0.55) {
    // where each bar will bite: a hard dark point with the pink in it
    const n = Math.round(tiles * LOCKDOWN.pitch);
    for (let i = 0; i < n; i++) {
      const [x, y] = rowAt(C, way, -halfL + (i + 0.5) / LOCKDOWN.pitch, 0);
      const ix = Math.round(x);
      const iy = Math.round(y);
      px.set(ix - 1, iy, INK).set(ix, iy, beat ? ENEMY_RIM : PINK[3]).set(ix + 1, iy, INK).set(ix, iy - 1, INK).set(ix, iy + 1, INK);
    }
  }
  if (before) lights.push({ x: C.ax, y: C.ay, r: 16 + tiles * 14, color: SOCKET, a: 0.06 + 0.12 * k });
  return { px, lights };
}

/**
 * THE BARS of a row `tiles` long, `t` seconds from the crash: heavy prison bars of the jailer's iron, a rail across their feet,
 * one across their middle and one along their tops, each bar ending in a point over the top rail and a spike in the stone, lit on
 * the upper left, the enemy's pink rim round them. In the crash's first frame they are a streak coming down; on the second, planted,
 * the spikes driven in, sparks and stone thrown off every foot and dust rising; they stand (the first frames shuddering); then they
 * rise away, ever faster, and are gone. `seed` varies the wear of one row (or one tile of a row) from the next.
 */
export function lockBarsPainted(way: Way, t: number, tiles: number, seed = 0): Painted {
  const C = lockCanvas(tiles);
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < LOCKDOWN.strike[0] - 1e-6 || t > LOCKDOWN_LONG) return { px, lights };
  const T = LOCKDOWN.tall;
  const halfL = tiles / 2;
  const falling = t < -1e-6;
  const rising = clamp01((t - LOCKDOWN.stand) / LOCKDOWN.rise);
  // (how high off the floor the bars are now: half their height in the crash's first frame; rising, ever faster)
  const lift = falling ? Math.round(T * 0.55) : Math.round((T + 40) * rising * rising);
  // (the first frames after the crash they shudder: a pixel down and back)
  const shudder = !falling && t < 3 * FR ? (Math.round(t / FR) % 2 === 0 ? 1 : 0) : 0;
  const n = Math.round(tiles * LOCKDOWN.pitch);
  const feet: [number, number][] = [];
  for (let i = 0; i < n; i++) feet.push(rowAt(C, way, -halfL + (i + 0.5) / LOCKDOWN.pitch, 0));
  // (the rows' ends: where the rails stop)
  const ea = rowAt(C, way, -halfL + 0.06, 0);
  const eb = rowAt(C, way, halfL - 0.06, 0);
  const [e0, e1] = ea[0] <= eb[0] ? [ea, eb] : [eb, ea];
  const dy = (e1[1] - e0[1]) / Math.max(1, e1[0] - e0[0]);
  const fade = rising > 0.3 ? (rising - 0.3) / 0.7 : 0;
  const gone = (x: number, y: number): boolean => fade > 0 && hash(x, y, 9601 + seed) < fade;
  const put = (x: number, y: number, c: string): void => {
    const Y = y - lift + shudder;
    if (Y < 1 || gone(x, Y)) return;
    px.set(x, Y, c);
  };
  // THE STREAK of the crash's first frame: each bar drawn out up the way it came
  if (falling) {
    for (const [fx, fy] of feet) {
      const x = Math.round(fx);
      for (let y = Math.round(fy) - lift - T; y > Math.round(fy) - lift - T - 34; y--) {
        if (y < 1) break;
        const u = (Math.round(fy) - lift - T - y) / 34;
        if (hash(x, y, 9602) < u) continue;
        px.set(x - 1, y, u < 0.4 ? IRON[3] : IRON[2]).set(x, y, u < 0.5 ? PINK[3] : PINK[2]);
      }
    }
  }
  // the bars, each from its spike in the floor to its point over the top rail
  feet.forEach(([fx, fy], i) => {
    const x = Math.round(fx) - 1;
    const foot = Math.round(fy);
    const worn = hash(i, seed, 9603);
    for (let y = foot - T - 4; y <= foot + 1; y++) {
      const top = foot - T - 4;
      // the point: narrower to its tip
      const w = y < top + 2 ? 1 : y < top + 4 ? 2 : 3;
      // the spike at its foot, driven into the stone
      const ww = y > foot - 3 ? Math.max(1, 3 - (y - (foot - 3))) : w;
      for (let ox = 0; ox < ww; ox++) {
        const xx = x + ox + (ww < 3 ? 1 : 0) - (ww === 1 ? 0 : 0);
        const c = ox === 0 ? IRON[3] : ox === ww - 1 && ww > 1 ? IRON[0] : IRON[2];
        // (worn bright here and there, a little rust)
        put(xx, y, worn > 0.8 && ox === 1 && (y + i) % 9 === 0 ? PINK[1] : c);
      }
    }
    // the hot spike: just driven in, it glows with his fire and cools
    if (!falling && t < 0.5 && rising === 0) {
      const h = 1 - t / 0.5;
      put(x + 1, foot, h > 0.6 ? FLAME[4] : h > 0.3 ? FLAME[3] : FLAME[2]);
      put(x + 1, foot - 1, h > 0.5 ? FLAME[3] : FLAME[2]);
    }
  });
  // the rails across them, along the row: a flat band of iron, lit along its top, riveted at every bar
  for (const [hy, thick] of [[T - 6, 4], [Math.round(T * 0.52), 3], [10, 3]] as const) {
    for (let X = Math.round(e0[0]); X <= Math.round(e1[0]); X++) {
      const fy = e0[1] + (X - e0[0]) * dy;
      const y0 = Math.round(fy) - hy;
      for (let r = 0; r < thick; r++) put(X, y0 + r, r === 0 ? IRON[3] : r === thick - 1 ? IRON[0] : IRON[2]);
    }
    for (const [fx, fy] of feet) put(Math.round(fx), Math.round(fy) - hy + 1, BONE[2]);
  }
  // (the rim while they are whole: not round the last crumbs as they go)
  if (fade < 0.35) edge(px, ENEMY_RIM, RIM_ALPHA);
  if (!falling && t < 0.5 && rising === 0) {
    // THE CRASH: sparks off every foot, stone thrown up, dust rising and spreading
    feet.forEach(([fx, fy], i) => {
      const k = t / 0.16;
      if (k < 1) {
        for (let m = 0; m < 3; m++) {
          const a = Math.PI + (hash(i, m, 9604) - 0.15) * Math.PI * 1.3;
          const sp = 8 + hash(i, m + 3, 9605) * 10;
          const x = Math.round(fx + Math.cos(a) * sp * (0.4 + k));
          const y = Math.round(fy - 1 + Math.sin(a) * sp * (0.3 + k) * 0.7 + 12 * k * k);
          if (y <= fy) px.set(x, y, k < 0.5 ? FLAME[4] : FLAME[3]);
        }
      }
      const kd = t / 0.5;
      for (let m = 0; m < 5; m++) {
        const a = m * 1.26 + hash(i, m, 9606);
        const r = 2 + kd * 9;
        const x = Math.round(fx + Math.cos(a) * r);
        const y = Math.round(fy - 1 - kd * 8 + Math.sin(a) * r * 0.4);
        if (hash(x, y, 9607) > kd * 0.9) px.set(x, y, DUST[m % 3]);
      }
      if (t < 0.12) lights.push({ x: fx, y: fy - 3, r: 10, color: FLAME[3], a: 0.4 * (1 - t / 0.12) });
    });
  }
  return { px, lights };
}

/** Where the rows lie (tiles from the arena's middle), so that the cell at `cell` (tiles: the Warden's own) has him in its middle: every row's line, both ways, within `reach` tiles. */
export function lockRows(cell: readonly [number, number], reach: number): { x: number[]; y: number[] } {
  const S = LOCKDOWN.cell;
  const lines = (c: number): number[] => {
    const out: number[] = [];
    for (let k = -Math.ceil(reach / S) - 1; k <= Math.ceil(reach / S) + 1; k++) {
      const at = c + S / 2 + k * S;
      if (Math.abs(at) <= reach) out.push(at);
    }
    return out;
  };
  // (a row along x lies at a fixed y, and one along y at a fixed x)
  return { x: lines(cell[1]), y: lines(cell[0]) };
}

/** Whether a hero standing at (x, y) (tiles) is struck when the bars of these rows crash (inside a row's band). */
export function lockStrikes(rows: { x: number[]; y: number[] }, x: number, y: number): boolean {
  return rows.x.some((ry) => Math.abs(y - ry) <= LOCKDOWN.band) || rows.y.some((rx) => Math.abs(x - rx) <= LOCKDOWN.band);
}
