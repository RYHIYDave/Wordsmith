// THE ROYAL CARDS (game/royal_cards.ts): A ROYAL'S CREST OVER A TOUCHED ENEMY (his doc's event: "on these levels some enemies are
// touched by one of the four royals ... and show it (that royal's crest over them)"). The art chat's README of the High City's set
// (docs/mockups/high_city_set/README.md): "The crest the game draws over a touched enemy can be the same swan, in that royal's
// colours (the main chat's)". So: a small heater shield in the royal's field, edged in its trim, the royal swan (the art chat's
// own drawing of it, `markTone`) white on it, a dark line round all of it so it reads over anything; the Princess's hedge green
// and dusty rose, the Prince's black velvet and gold, the Queen's violet and silver, the King's royal blue and gold. No glow.

import type { Sprite } from '../engine/px';
import { Px } from '../engine/px';
import { ROYAL_LOOK, markTone } from './high_city_set';
import type { Royal } from './high_city_set';

/** Its size: 15 across, 17 down; anchored at its foot's middle. */
const W = 15;
const H = 17;
const INK = '#120e18';

/** Whether (x, y), a pixel of the 15 x 17 picture, is inside the shield (a flat top, straight sides, curving in to a point). */
function inShield(x: number, y: number): boolean {
  const cx = (W - 1) / 2;
  const dx = Math.abs(x - cx);
  if (y < 1 || y > H - 2) return false;
  if (y <= 8) return dx <= 6;
  // (below its middle the sides curve in to the point at the foot)
  const u = (y - 8) / (H - 2 - 8);
  return dx <= 6 * Math.sqrt(Math.max(0, 1 - u * u)) + 0.35;
}

/** A royal's crest, as drawn over a touched enemy. */
export function royalCrest(r: Royal): Sprite {
  const L = ROYAL_LOOK[r];
  const p = new Px(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inShield(x, y)) continue;
      // (its edge: the trim, lit to the upper left)
      const edge = !inShield(x - 1, y) || !inShield(x + 1, y) || !inShield(x, y - 1) || !inShield(x, y + 1);
      if (edge) {
        p.set(x, y, L.trim[x + y < W ? 4 : 2]);
        continue;
      }
      // (the royal swan, the art chat's, white on the field)
      const t = markTone(r, (x + 0.5 - W / 2) / 5.2, -(y + 0.5 - 7.6) / 5.2, 0.2);
      if (t >= 0) {
        p.set(x, y, L.mark[Math.max(2, t)]);
        continue;
      }
      p.set(x, y, L.field[y < 5 ? 3 : 2]);
    }
  }
  // (a dark line round it, so it reads over anything)
  const q = new Px(W + 2, H + 2);
  for (let y = 0; y < H + 2; y++) {
    for (let x = 0; x < W + 2; x++) {
      const c = p.inside(x - 1, y - 1) ? p.get(x - 1, y - 1) : null;
      if (c) {
        q.set(x, y, c);
        continue;
      }
      const near = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([a, b]) => p.inside(x - 1 + a, y - 1 + b) && p.get(x - 1 + a, y - 1 + b));
      if (near) q.set(x, y, INK);
    }
  }
  return { img: q.toCanvas(), w: q.w, h: q.h, ax: Math.floor(q.w / 2), ay: q.h - 1 };
}

let CRESTS: Record<Royal, Sprite> | null = null;
/** The four crests (made the first time they are asked for). */
export function royalCrests(): Record<Royal, Sprite> {
  if (!CRESTS) CRESTS = { princess: royalCrest('princess'), prince: royalCrest('prince'), queen: royalCrest('queen'), king: royalCrest('king') };
  return CRESTS;
}
