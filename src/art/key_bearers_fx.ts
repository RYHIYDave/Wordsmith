// FLOOR 5, THE TEMPLE DOOR'S KEY-BEARERS: WHAT THEY THROW AND WHAT THEY DROP (art/key_bearers.ts the figures; game/act1_rules/
// keybearers.ts their rules; render/act1_fx/keybearers.ts draws these where the rules have them). Behind art/temple_door.ts
// TEMPLE_DOOR, off.
//   THE KEY, brass, as it tumbles from a bearer's hip and lies ringing on the floor (his pick: “Key rings to the floor (Recommended)”).
//   THE KNIFE the Keybearer of the Knife throws, turning over and over as it flies, the light on its edge the enemy's pink.
//   A BALL OF FIRE of the Keybearer of the Flame's fan; and A TONGUE OF FIRE of his ring, at a height.
// Each painted finer than a game pixel (GRAIN), on a canvas of its own, its anchor its middle or its foot.

import { GRAIN } from './kit';
import { FLAME } from './mkit';
import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';

/** The key's brass, dark to light; the line round it, so that it stands off the floor. */
const BRASS = ['#2e1a0c', '#6a4420', '#a8742e', '#dcaa52', '#f6dc96'] as const;
const LINE = '#120a06';
const KNIFE = ['#4a4048', '#6e5e58', '#ab9a80', '#dccfb6', '#f6eedc'] as const;
const GRIP = '#3a2418';

/** A picture laid on a canvas of its own as a sprite, its line drawn round it, its anchor (picture pixels). */
function outlined(p: Px, ax: number, ay: number, line: string | null, lights?: Light[]): Sprite {
  let q = p;
  if (line) {
    q = new Px(p.w, p.h);
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        if (p.get(x, y)) continue;
        if (p.get(x + 1, y) || p.get(x - 1, y) || p.get(x, y + 1) || p.get(x, y - 1)) q.set(x, y, line);
      }
    }
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c) q.set(x, y, c);
    }
  }
  const s = q.sprite(ax, ay, GRAIN);
  if (lights) (s as { lights?: Light[] }).lights = lights;
  return s;
}

/** The key as it lies, its bow to the left: which of its brass each point of it is (0 none), on a 26 by 14 grid. */
function keyAt(x: number, y: number): number {
  // the bow: a ring of brass round a dark hole
  const bx = x - 6;
  const by = y - 7;
  const r = Math.hypot(bx, by);
  if (r <= 1.7) return -1;
  if (r <= 5.0) return by < -2 ? 5 : by < 1 ? 4 : r > 4.0 ? 2 : 3;
  // the shaft
  if (x >= 10 && x <= 23 && y >= 6 && y <= 8) return y === 6 ? 5 : y === 7 ? 4 : 2;
  // its bit: two teeth down
  if (y >= 9 && y <= 11 && ((x >= 18 && x <= 19) || (x >= 21 && x <= 23 && y <= 10))) return y === 9 ? 3 : 2;
  return 0;
}
const KEYS: Sprite[] = [];
/**
 * THE KEY, `turn` quarter turns over (0 to 3) as it tumbles; lying, turn 0. A dark hole in its bow, a mote of the enemy's pink in it;
 * a little light of its own. Its anchor its middle.
 */
export function keySprite(turn: number): Sprite {
  const k = ((turn % 4) + 4) % 4;
  if (KEYS[k]) return KEYS[k];
  const W = 30;
  const p = new Px(W, W);
  const a = (k * Math.PI) / 2 + (k % 2 ? 0.35 : 0);
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      // (each pixel, turned back onto the key as it lies)
      const dx = x - W / 2 + 0.5;
      const dy = y - W / 2 + 0.5;
      const u = ca * dx + sa * dy + 13;
      const v = -sa * dx + ca * dy + 7;
      const b = keyAt(Math.round(u), Math.round(v));
      if (b > 0) p.set(x, y, BRASS[b - 1]);
      else if (b < 0) p.set(x, y, Math.hypot(u - 6, v - 7) < 0.8 ? FLAME[2] : '#140a08');
    }
  }
  KEYS[k] = outlined(p, W / 2, W / 2, LINE, [{ x: W / 2 / GRAIN, y: W / 2 / GRAIN, r: 10, color: BRASS[3], a: 0.35 }]);
  return KEYS[k];
}

const KNIVES: Sprite[] = [];
/** THE THROWN KNIFE, `turn` eighths of a turn over (0 to 7), its point leading at 0; the light on its edge pink. Its anchor its middle. */
export function knifeSprite(turn: number): Sprite {
  const k = ((turn % 8) + 8) % 8;
  if (KNIVES[k]) return KNIVES[k];
  const W = 26;
  const p = new Px(W, W);
  const a = (k * Math.PI) / 4;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - W / 2 + 0.5;
      const dy = y - W / 2 + 0.5;
      // (along the knife, from its pommel at -10 to its point at +10; across it)
      const u = ca * dx + sa * dy;
      const v = -sa * dx + ca * dy;
      if (u >= -10 && u < -3 && Math.abs(v) <= 1.1) p.set(x, y, Math.abs(v) < 0.5 ? '#5a3a26' : GRIP);
      else if (u >= -3 && u < -2 && Math.abs(v) <= 2.4) p.set(x, y, '#2a2028');
      else if (u >= -2 && u <= 10) {
        const half = 1.8 * (1 - Math.max(0, (u - 3) / 7.5));
        if (Math.abs(v) <= half) p.set(x, y, v < -0.5 ? KNIFE[4] : v < 0.3 ? KNIFE[3] : KNIFE[1]);
      }
    }
  }
  // the light running along its edge
  const tx = Math.round(W / 2 + ca * 8);
  const ty = Math.round(W / 2 + sa * 8);
  p.set(tx, ty, '#fff4ec');
  KNIVES[k] = outlined(p, W / 2, W / 2, '#1a0c10', [{ x: tx / GRAIN, y: ty / GRAIN, r: 6, color: FLAME[2], a: 0.45 }]);
  return KNIVES[k];
}

const BALLS: Sprite[] = [];
/** A BALL OF HIS FIRE in flight (`frame` 0 to 3, flickering): white at its heart, the enemy's pink at its edge, its light. Its anchor its middle. */
export function fireBallSprite(frame: number): Sprite {
  const k = ((frame % 4) + 4) % 4;
  if (BALLS[k]) return BALLS[k];
  const W = 30;
  const p = new Px(W, W);
  const c = W / 2;
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      const ang = Math.atan2(dy, dx);
      const wob = 1 + 0.16 * Math.sin(ang * 5 + k * 1.7) + 0.08 * Math.sin(ang * 9 - k * 2.3);
      // (licking up: its top drawn out)
      const d = Math.hypot(dx, dy * (dy < 0 ? 0.75 : 1.1)) / (8.5 * wob);
      if (d > 1) continue;
      p.set(x, y, d < 0.3 ? '#fff4c8' : d < 0.55 ? FLAME[3] : d < 0.8 ? FLAME[2] : FLAME[1]);
    }
  }
  BALLS[k] = outlined(p, c, c, null, [{ x: c / GRAIN, y: c / GRAIN, r: 16, color: FLAME[3], a: 0.7 }]);
  return BALLS[k];
}

const TONGUES = new Map<string, Sprite>();
/**
 * A TONGUE OF HIS RING'S FIRE, `tall` game pixels high (1 to 16), `frame` 0 to 3 of its flicker: gold at its foot, pink to its tip.
 * Its anchor its foot.
 */
export function ringTongue(tall: number, frame: number): Sprite {
  const h = Math.max(1, Math.min(16, Math.round(tall)));
  const k = ((frame % 4) + 4) % 4;
  const key = `${h}:${k}`;
  const kept = TONGUES.get(key);
  if (kept) return kept;
  const H = h * GRAIN;
  const W = 12;
  const p = new Px(W, H + 2);
  for (let y = 0; y < H; y++) {
    const u = y / Math.max(1, H - 1);
    const half = Math.max(0.6, 4.2 * (u < 0.25 ? 0.7 + u * 1.2 : (1 - u) ** 0.8 * 1.25));
    const mid = W / 2 + Math.sin(u * 3.2 + k * 1.6) * 1.4 * u;
    for (let x = 0; x < W; x++) {
      const d = Math.abs(x + 0.5 - mid) / half;
      if (d > 1) continue;
      const row = H - 1 - y;
      p.set(x, row, u < 0.2 && d < 0.6 ? '#fff0a0' : u < 0.45 && d < 0.75 ? FLAME[3] : u < 0.78 ? FLAME[2] : FLAME[1]);
    }
  }
  const s = outlined(p, W / 2, H, null, [{ x: W / 2 / GRAIN, y: (H * 0.6) / GRAIN, r: 6 + h, color: FLAME[3], a: 0.35 }]);
  TONGUES.set(key, s);
  return s;
}
