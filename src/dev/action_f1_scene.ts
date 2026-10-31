// Pictures of FLOOR 1'S ENEMIES' NEW MOVES, put together for the owner (the sheet, the film's frames): the bone archer's arrow
// rain and the Warden's Lockdown (art/action_f1_fx.ts; their moves behind ARCHER_RAIN and WARDEN_LOCKDOWN), on a stand-in for the
// Warden's Tomb (old stone flags of the crypt, his arena about 17 by 20 tiles, the dark beyond it), with the knight for size, each
// figure at its floor point and sorted by it, as the game sorts them. Plain pixels (Px): made outside a browser
// (tools/action_f1_film.ts). Nothing of the game imports it. THE FLOOR IS A STAND-IN: floor 1's own ground is the game's.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { hash } from '../art/kit';
import type { Painted } from '../art/kit';
import { ARCHER_RAIN, makeArcherArt } from '../art/monster_bones';
import { WARDEN_LOCKDOWN, WARDEN_MOVES, makeWardenArt } from '../art/monster_warden';
import { LOCKDOWN, RAIN, RISE_CANVAS, RAIN_CANVAS, lockBarsPainted, lockCanvas, lockRows, lockShadowPainted, rainPainted, rainRisePainted } from '../art/action_f1_fx';
import type { View, Way } from '../art/action_f1_fx';
import { knight, lay, shadow, spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

/** The Warden's arena: an ellipse this many tiles across along the floor's x way and its y way. */
export const ARENA = { rx: 8.5, ry: 10 } as const;
/** Where a floor point (tiles from the arena's middle) is on a scene whose middle is at (cx, cy), `k` scene pixels to a picture pixel. */
export const onFloor = (x: number, y: number, cx: number, cy: number, k = 1): [number, number] => [cx + 32 * (x - y) * k, cy + 16 * (x + y) * k];
const arenaOut = (x: number, y: number): number => Math.hypot(x / ARENA.rx, y / ARENA.ry);

const STONE = ['#18161f', '#1e1c27', '#25222f', '#2c2837', '#332f40', '#3b3649'];
const SEAM = '#0b0a11';
const DARK = '#06050a';
/**
 * THE TOMB'S FLOOR (a stand-in): old flags of the crypt's stone, a tile wide and two long, laid in courses along the floor's x
 * way, their seams dark, worn, cracked and chipped here and there, lit from the upper left; darker toward the arena's edge, black
 * beyond it. `k` scene pixels to a picture pixel.
 */
export function tombFloor(w: number, h: number, cx: number, cy: number, k = 1): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / (32 * k);
      const b = (Y + 0.5 - cy) / (16 * k);
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      const out = arenaOut(x, y);
      if (out > 1.16) {
        px.set(X, Y, DARK);
        continue;
      }
      const row = Math.floor(y);
      const shift = (((row % 2) + 2) % 2) * 1;
      const col = Math.floor((x + shift) / 2);
      const fx = (x + shift) / 2 - col;
      const fy = y - row;
      const seam = fx < 0.02 || fx > 0.98 || fy < 0.04 || fy > 0.96;
      const own = hash(col, row, 7701);
      let tone = 2 + Math.floor(own * 2.4);
      if (x + y < -9) tone++;
      if (hash(Math.floor(fx * 8), Math.floor(fy * 4) + col * 31, 7702 + row) < 0.06) tone = Math.max(0, tone - 1);
      const crack = own > 0.86 && fx > 0.15 + 0.3 * own && fx < 0.8 && Math.abs(fy - 0.25 - 0.45 * fx - 0.07 * Math.sin(fx * 29 + own * 17)) < 0.03;
      tone = Math.max(0, Math.min(5, tone - Math.floor(Math.max(0, out - 0.7) * 9)));
      if (out > 1.0) tone = Math.max(0, tone - 2);
      px.set(X, Y, seam || crack ? SEAM : STONE[tone]);
    }
  }
  return px;
}

/** A picture to lay, with its floor point. */
export const laid = (p: Painted | Px, ax: number, ay: number): Laid => ({ px: 'px' in p ? p.px : p, ax, ay });

let ARCHER: ActorArt | null = null;
let WARDEN: ActorArt | null = null;
/** The archer and the Warden as the game would hold them with the new moves' switches on (and the Warden's other moves, as the game has them). */
export function figures(): { archer: ActorArt; warden: ActorArt } {
  if (!ARCHER || !WARDEN) {
    const a = ARCHER_RAIN.on;
    const w = WARDEN_LOCKDOWN.on;
    const m = WARDEN_MOVES.on;
    ARCHER_RAIN.on = true;
    WARDEN_LOCKDOWN.on = true;
    WARDEN_MOVES.on = true;
    try {
      ARCHER = makeArcherArt();
      WARDEN = makeWardenArt();
    } finally {
      ARCHER_RAIN.on = a;
      WARDEN_LOCKDOWN.on = w;
      WARDEN_MOVES.on = m;
    }
  }
  return { archer: ARCHER, warden: WARDEN };
}
/** A frame of a figure: standing (its loop at its own frames a second) or a move (at 30 a second), `t` seconds in. */
export function frameAt(art: ActorArt, view: View, move: 'stand' | string, t: number): Laid {
  const set = view === 'front' ? art.front : art.back;
  let sp: Sprite;
  if (move === 'stand') sp = set.idle[Math.floor(t * (set.idleFps ?? 10)) % set.idle.length];
  else {
    const c = set.clips?.moves?.[move] as Clip;
    sp = c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
  }
  return spriteLaid(sp);
}

/** Something standing on the floor, to be sorted with the rest by its floor point's place down the scene. */
export interface Stood {
  at: [number, number];
  l: Laid;
  flip?: boolean;
  shadow?: number;
}
/** Lay out a scene: what lies on the floor first, then what stands on it from the top of the scene down; `k` scene pixels to a picture pixel. */
export function compose(base: Px, floor: { at: [number, number]; l: Laid }[], stood: Stood[], k = 1): Px {
  const px = new Px(base.w, base.h);
  px.d.set(base.d);
  for (const f of floor) lay(px, f.l, f.at[0], f.at[1], k);
  for (const s of stood) if (s.shadow) shadow(px, s.at[0], s.at[1], s.shadow, k);
  for (const s of [...stood].sort((a, b) => a.at[1] - b.at[1])) lay(px, s.l, s.at[0], s.at[1], k, undefined, s.flip);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE ARROW RAIN, as the film shows it: the archer on the left, the knight in the ring where he stood.

/** The archer's pass: where it stands and where the knight stands (tiles from the scene's middle), and how the knight is seen. */
export interface RainPass {
  view: View;
  archer: [number, number];
  knight: [number, number];
  knightView: View;
}
export const RAIN_FRONT: RainPass = { view: 'front', archer: [-2.5, 0], knight: [1.5, 0], knightView: 'back' };
export const RAIN_BACK: RainPass = { view: 'back', archer: [0, 2.5], knight: [0, -1.5], knightView: 'front' };
/** How long the archer stands before it begins (seconds), and the moment it looses, from the start of its move. */
export const RAIN_LEAD = 0.4;
export const RAIN_AT_LOOSE = 0.9;

/** The archer's scene at `t` seconds of its pass (it begins its rain at RAIN_LEAD), its middle at (cx, cy), `k` scene pixels to a picture pixel. */
export function rainScene(p: RainPass, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { archer } = figures();
  const m = t - RAIN_LEAD;
  const moveLong = (archer.front.clips?.moves?.rain as Clip).frames.length / 30;
  const a = m >= 0 && m < moveLong ? frameAt(archer, p.view, 'rain', m) : frameAt(archer, p.view, 'stand', Math.max(0, m < 0 ? t : m - moveLong));
  const since = m - RAIN_AT_LOOSE;
  const A = onFloor(p.archer[0], p.archer[1], cx, cy, k);
  const K = onFloor(p.knight[0], p.knight[1], cx, cy, k);
  const floor = [{ at: K, l: laid(rainPainted(since, p.view, 'floor'), RAIN_CANVAS.ax, RAIN_CANVAS.ay) }];
  const stood: Stood[] = [
    { at: A, l: a, shadow: 9 },
    { at: K, l: knight(p.knightView, Math.floor(t * 6)), flip: true, shadow: 9 },
    // (the arrows behind the knight before him, those in front of him after)
    { at: [K[0], K[1] - 0.5], l: laid(rainPainted(since, p.view, 'air', RAIN.radius, 'behind'), RAIN_CANVAS.ax, RAIN_CANVAS.ay) },
    { at: [K[0], K[1] + 0.5], l: laid(rainPainted(since, p.view, 'air', RAIN.radius, 'before'), RAIN_CANVAS.ax, RAIN_CANVAS.ay) },
    { at: [A[0], A[1] + 0.25], l: laid(rainRisePainted(since, p.view), RISE_CANVAS.ax, RISE_CANVAS.ay) },
  ];
  return compose(base, floor, stood, k);
}

// ---------------------------------------------------------------------------------------------
// THE LOCKDOWN, as the film shows it: the Warden in the middle of a cell, the knight in the next.

export interface LockPass {
  view: View;
  warden: [number, number];
  knight: [number, number];
  knightView: View;
}
export const LOCK_FRONT: LockPass = { view: 'front', warden: [-1.5, -1.5], knight: [-1.5 + LOCKDOWN.cell, -1.5], knightView: 'back' };
export const LOCK_BACK: LockPass = { view: 'back', warden: [-1.5, -1.5], knight: [-1.5, -1.5 - LOCKDOWN.cell], knightView: 'front' };
export const LOCK_LEAD = 0.4;
export const LOCK_AT_HIT = 1.2;

/** The rows across the arena for a pass: a tile at a time, each tile's middle inside the arena. */
export function lockSegments(p: LockPass): { way: Way; at: [number, number]; seed: number }[] {
  const rows = lockRows(p.warden, 10);
  const out: { way: Way; at: [number, number]; seed: number }[] = [];
  rows.x.forEach((ry, r) => {
    for (let x = -12.5; x <= 12.5; x += 1) if (arenaOut(x, ry) < 0.96) out.push({ way: 'x', at: [x, ry], seed: r * 31 + Math.round(x * 3) });
  });
  rows.y.forEach((rx, r) => {
    for (let y = -12.5; y <= 12.5; y += 1) if (arenaOut(rx, y) < 0.96) out.push({ way: 'y', at: [rx, y], seed: r * 37 + Math.round(y * 5) + 500 });
  });
  return out;
}

/** The Warden's scene at `t` seconds of his pass (he begins his Lockdown at LOCK_LEAD), the arena's middle at (cx, cy), `k` scene pixels to a picture pixel. */
export function lockScene(p: LockPass, t: number, base: Px, cx: number, cy: number, k = 1, segs = lockSegments(p)): Px {
  const { warden } = figures();
  const m = t - LOCK_LEAD;
  const moveLong = (warden.front.clips?.moves?.lockdown as Clip).frames.length / 30;
  const w = m >= 0 && m < moveLong ? frameAt(warden, p.view, 'lockdown', m) : frameAt(warden, p.view, 'stand', Math.max(0, m < 0 ? t : m - moveLong));
  const since = m - LOCK_AT_HIT;
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: onFloor(p.warden[0], p.warden[1], cx, cy, k), l: w, shadow: 20 },
    { at: onFloor(p.knight[0], p.knight[1], cx, cy, k), l: knight(p.knightView, Math.floor(t * 6)), flip: true, shadow: 9 },
  ];
  const C = lockCanvas(1);
  const cache = new Map<string, Painted>();
  for (const s of segs) {
    const at = onFloor(s.at[0], s.at[1], cx, cy, k);
    const sh = `${s.way}`;
    let shp = cache.get(sh);
    if (!shp) cache.set(sh, (shp = lockShadowPainted(s.way, since, 1)));
    floor.push({ at, l: laid(shp, C.ax, C.ay) });
    const key = `${s.way}:${s.seed % 5}`;
    let bp = cache.get(key);
    if (!bp) cache.set(key, (bp = lockBarsPainted(s.way, since, 1, s.seed % 5)));
    stood.push({ at, l: laid(bp, C.ax, C.ay) });
  }
  return compose(base, floor, stood, k);
}
