// THE FIRST TOWN AS THE CASTLE'S HALL: WHAT STANDS OF ITS OWN (the art chat's art/castle_hall.ts, behind CASTLE_HALL: his words of 2
// Nov 2026, 15:37, “Unfortunately that means the first town is going to have to be redone as well.  In sort of the same style as
// the wardens.  Maybe more sun, and more plants.  An owl in the rafters.  Hastily barricaded windows”; “A's sun through boards
// (Recommended)”; “Brighter, castle stone (Recommended)”; “Yes, hand them over (Recommended)”; off until his yes to it in play).
// As the art chat's README asks (docs/mockups/town_look/README.md, "How to bring it in", step 9): the pots where its picture has
// them (src/dev/preview_castle_hall_game.ts POTS), each blocking its tile, none where anyone has to stand or pass: not on a
// station's tile nor the four beside it, not on the stairs', the shaft's or a stall's tiles, and none that would leave a tile cut off. The trusses, the
// owl, the ivy, the sun and the roof are only drawn (render/castle.ts): nothing of them stands in anyone's way.

import { CASTLE_HALL } from '../art/castle_hall';
import type { Level, PropInst } from './state';
import { T_FLOOR } from './types';

/** The pots: which, and where each stands (its floor point; its tile is the one under it). */
export const CASTLE_POTS: readonly (readonly [string, number, number])[] = [
  ['potted herbs', 7.55, 6.42], ['potted flowers', 12.45, 6.45], ['potted herbs', 12.35, 11.4], ['potted flowers', 14.1, 11.35], ['a fern in a pot', 17.35, 10.35],
  ['potted flowers', 17.4, 14.5], ['potted herbs', 11.25, 18.55], ['a bay tree in a pot', 21.55, 8.5], ['potted flowers', 11.4, 15.6], ['a fern in a pot', 13.2, 19.45],
  ['a bay tree in a pot', 6.42, 10.0], ['potted flowers', 6.42, 13.0], ['potted herbs', 6.42, 16.0], ['potted flowers', 8.7, 6.42],
];
/** The names of the pots. */
export const POT_NAMES = new Set(CASTLE_POTS.map((p) => p[0]));

/** Is this town the castle's hall (the first town, CASTLE_HALL on)? */
export function castleHere(L: Level): boolean {
  return CASTLE_HALL.on && L.town && !L.act1;
}

/** THE POTS, set last (after the town's own things): each where it is free to stand, blocking its tile. */
export function layCastle(L: Level): void {
  const f = L.floor;
  const W = f.w;
  const taken = new Set<number>();
  for (const p of L.props) taken.add(p.ty * W + p.tx);
  // (a station's own tile and the four beside it are left free: one is walked up to from any side)
  const near = (x: number, y: number): boolean => {
    for (const s of L.stations ?? []) if (Math.abs(x - Math.floor(s.x)) + Math.abs(y - Math.floor(s.y)) <= 1) return true;
    return false;
  };
  // (how many tiles can be walked to from where a new arrival stands: a pot that would leave any of them cut off is not set)
  const reach = (): number => {
    const seen = new Uint8Array(W * f.h);
    const s = Math.floor(f.start.y) * W + Math.floor(f.start.x);
    const q = [s];
    seen[s] = 1;
    let n = 0;
    while (q.length) {
      const i = q.pop()!;
      n++;
      for (const d of [1, -1, W, -W]) {
        const j = i + d;
        if (j >= 0 && j < seen.length && !seen[j] && L.walk[j]) {
          seen[j] = 1;
          q.push(j);
        }
      }
    }
    return n;
  };
  let open = reach();
  for (const [name, x, y] of CASTLE_POTS) {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const i = ty * W + tx;
    if (f.tiles[i] !== T_FLOOR || L.walk[i] !== 1 || taken.has(i) || near(tx, ty)) continue;
    L.walk[i] = 0;
    const now = reach();
    if (now < open - 1) {
      L.walk[i] = 1;
      continue;
    }
    open = now;
    const p: PropInst = { kind: 'piece', name, tx, ty, x, y, solid: true, state: 0, variant: 0 };
    L.props.push(p);
    taken.add(i);
  }
}
