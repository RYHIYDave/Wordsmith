// THE MUFFLED BELL MADE EASIER TO SEE (behind BELL_MARK: on, at his word having seen its pictures). The owner, 21 Nov 2026
// (to the Godot cloud chat): “Make sure it's easier to see the starting bell.  Have a label above it”.
//
// So, while it is gagged (the Bells not yet begun, game/bells.ts: the Muffled Bell struck starts them), on floors 11 to 15:
//   ITS NAME over it, as the town's services' names and the exits' stand over theirs (render.ts, the labels): MUFFLED BELL, and
//     under it what it is for, STRIKE TO BEGIN (`hint`);
//   A RING OF THE FRIEND'S CYAN going out over the floor round it, again and again, and a steady one at its foot (`ring`): what
//     glows on a friend is cyan, and it is his to strike;
//   ITS OWN LIGHT in the dark (`light`).
// Once it is struck, all of it is gone: the Hush pours out, and the bells to ring have their own arrows (render/bells.ts).

import type { Level } from '../game/state';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/**
 * THE SWITCH, and its parts. ON: shown its pictures (the Muffled Bell now and marked, near and from further off), his word again,
 * 21 Nov 2026: “Make sure it's easier to see the starting bell.  Have a label above it”.
 */
export const BELL_MARK = { on: true, ring: true, hint: true, light: true };

/** The friend's cyan (art/kit.ts CYAN), and its light. */
const CYAN = '#22d0e0';
const CYAN_HI = '#b8fff8';
/** The rings: how long one takes to go out (seconds), how many are out at once, from how far and to how far (tiles). */
const RING = { secs: 1.8, n: 2, r0: 0.55, r1: 1.9, foot: 0.75 };

/** The Muffled Bell while it is gagged: its prop (Level.props index) and where it stands; null once struck, or none. */
export function gaggedBell(L: Level): { i: number; x: number; y: number } | null {
  const B = L.bells;
  if (!B || B.phase !== 'asleep' || B.muffled < 0) return null;
  const p = L.props[B.muffled];
  if (!p) return null;
  return { i: B.muffled, x: B.plan.muffled.x, y: B.plan.muffled.y };
}

/** An ellipse of the floor `r` tiles round (x, y), drawn as the floor lies (twice as wide as deep). */
function floorRing(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number, width: number): void {
  if (alpha <= 0.01) return;
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  g.ellipse(cx, cy, Math.max(1, r * 22.6), Math.max(1, r * 11.3), 0, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
}

/** WHAT LIES ON THE FLOOR ROUND IT (with the floor's effects): the steady ring at its foot, and the rings going out from it. */
export function drawBellRings(g: CanvasRenderingContext2D, cam: Cam, L: Level, t: number): void {
  if (!BELL_MARK.on || !BELL_MARK.ring) return;
  const b = gaggedBell(L);
  if (!b) return;
  const f = L.floor;
  if (!L.explored[Math.floor(b.y) * f.w + Math.floor(b.x)]) return;
  const cx = Math.round(wx(cam, b.x, b.y));
  const cy = Math.round(wy(cam, b.x, b.y));
  floorRing(g, cx, cy, RING.foot, CYAN, 0.55 + 0.15 * Math.sin(t * 3), 2);
  for (let k = 0; k < RING.n; k++) {
    const u = ((t / RING.secs + k / RING.n) % 1 + 1) % 1;
    const r = RING.r0 + (RING.r1 - RING.r0) * (1 - (1 - u) * (1 - u));
    floorRing(g, cx, cy, r, u < 0.25 ? CYAN_HI : CYAN, 0.85 * (1 - u), 2);
  }
}

/** ITS NAME, and what it is for: labels for render.ts to lay (`lift`: how high its picture stands, game pixels). */
export function bellLabels(L: Level, cam: Cam, lift: number, near: boolean): { x: number; y: number; text: string; color: string }[] {
  if (!BELL_MARK.on) return [];
  const b = gaggedBell(L);
  if (!b) return [];
  const f = L.floor;
  if (!L.explored[Math.floor(b.y) * f.w + Math.floor(b.x)]) return [];
  const x = wx(cam, b.x, b.y);
  const y = wy(cam, b.x, b.y) - lift - 6;
  const out = [{ x, y: y - 8, text: 'MUFFLED BELL', color: near ? '#ffffff' : CYAN }];
  if (BELL_MARK.hint) out.push({ x, y, text: 'STRIKE TO BEGIN', color: near ? CYAN_HI : '#c8c4d8' });
  return out;
}

/** ITS OWN LIGHT in the dark: where, how far, how strong (screen game pixels), or null. */
export function bellLight(L: Level, cam: Cam, t: number): { x: number; y: number; r: number; a: number } | null {
  if (!BELL_MARK.on || !BELL_MARK.light) return null;
  const b = gaggedBell(L);
  if (!b) return null;
  const f = L.floor;
  if (!L.explored[Math.floor(b.y) * f.w + Math.floor(b.x)]) return null;
  return { x: wx(cam, b.x, b.y), y: wy(cam, b.x, b.y) - 14, r: 58 + Math.sin(t * 3) * 4, a: 0.85 };
}
