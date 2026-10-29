// Where the Quiet Tower's pieces (art/floor20.ts) stand on the two stretches laid by hand (dev/tower_level.ts), for the dev
// pages, laid as the game may lay them: standing on the floor (far to near), lying on it (drawn first), or hung on a far
// wall's face ('left' on a wall along x, its face turned to the screen's left; 'right' on a wall along y). Nothing of the
// game imports it.
import type { Sprite } from '../engine/px';
import { quietTowerPieces } from '../art/floor20';
import type { Piece } from '../art/floorkit';

export interface Laid { name: string; frame: number; x: number; y: number; on?: 'left' | 'right'; flat?: boolean }

const P = (): Map<string, Piece> => new Map(quietTowerPieces().map((p) => [p.name, p]));

/** THE TOWER TOP: the last chapter on its lectern in the middle; the trapdoor the stair comes up by, open; the cold beacon; a merlon fallen inward; torn pages; a mask; the Moth's dust and a wing it shed. */
export function layTop(): Laid[] {
  return [
    { name: 'a shed wing', frame: 0, x: 19.4, y: 14.6, flat: true },
    { name: 'grey dust, drifted', frame: 0, x: 10.6, y: 18.9, flat: true },
    { name: 'a fallen mask of the Order', frame: 0, x: 13.6, y: 16.9, flat: true },
    { name: "the Hush's dust", frame: 0, x: 19.8, y: 11.8 },
    { name: 'the trapdoor to the top', frame: 1, x: 18.6, y: 19.6 },
    { name: 'the last chapter on its lectern', frame: 0, x: 15.0, y: 15.0 },
    { name: 'the cold beacon', frame: 0, x: 10.4, y: 12.6 },
    { name: 'a fallen merlon', frame: 0, x: 17.4, y: 8.4 },
    { name: 'a heap of torn pages', frame: 0, x: 12.2, y: 18.0 },
    { name: 'a heap of torn pages', frame: 1, x: 14.4, y: 20.2 },
  ];
}

/** THE INSIDE: the scriptorium, the bell-less belfry, the room the fog has filled, the stair's landing, each dressed with its own. */
export function layInside(): Laid[] {
  return [
    // THE SCRIPTORIUM (4..16, 4..14)
    { name: 'a broken window', frame: 0, x: 6.5, y: 4, on: 'left' },
    { name: 'a moth-eaten tapestry', frame: 0, x: 10.0, y: 4, on: 'left' },
    { name: 'a broken window', frame: 0, x: 13.5, y: 4, on: 'left' },
    { name: "the Order's banner, gone grey", frame: 0, x: 4, y: 7.0, on: 'right' },
    { name: 'a press of blank books', frame: 1, x: 4.75, y: 11.0 },
    { name: "a copyist's desk", frame: 0, x: 7.4, y: 6.6 },
    { name: "a copyist's desk", frame: 0, x: 11.0, y: 6.6 },
    { name: "a copyist's desk", frame: 0, x: 8.0, y: 9.8 },
    { name: "a copyist's stool", frame: 0, x: 7.4, y: 7.6 },
    { name: "a copyist's stool", frame: 0, x: 11.2, y: 7.7 },
    { name: "a copyist's stool", frame: 1, x: 8.6, y: 11.2 },
    { name: 'guttering candles', frame: 0, x: 13.6, y: 6.2 },
    { name: 'a chest of blank quires', frame: 0, x: 14.9, y: 4.9 },
    { name: 'a heap of torn pages', frame: 0, x: 5.8, y: 12.9 },
    { name: 'a fallen mask of the Order', frame: 0, x: 10.4, y: 12.4, flat: true },
    // THE BELL-LESS BELFRY (20..31, 4..14)
    { name: 'a door of the tower', frame: 0, x: 21.6, y: 4, on: 'left' },
    { name: 'a broken window', frame: 0, x: 29.4, y: 4, on: 'left' },
    { name: 'the empty bell frame', frame: 0, x: 26.2, y: 8.6 },
    { name: 'a bell rope, hanging', frame: 0, x: 25.1, y: 9.7 },
    { name: "the bell's clapper, fallen", frame: 0, x: 28.2, y: 12.2, flat: true },
    { name: 'the boards broken through', frame: 0, x: 22, y: 11, flat: true },
    { name: 'grey dust, drifted', frame: 0, x: 21.6, y: 6.0, flat: true },
    // THE ROOM THE FOG HAS FILLED (4..16, 18..29)
    { name: 'a cocoon on the wall', frame: 0, x: 12.4, y: 18, on: 'left' },
    { name: 'a cocoon on the wall', frame: 0, x: 4, y: 24.5, on: 'right' },
    { name: 'a moth-eaten tapestry', frame: 0, x: 4, y: 20.6, on: 'right' },
    { name: 'moth silk, strung from a fallen beam', frame: 0, x: 7.4, y: 21.4 },
    { name: 'moth silk, strung from a fallen beam', frame: 1, x: 14.2, y: 26.4 },
    { name: "the Hush's dust", frame: 0, x: 10.4, y: 25.0 },
    { name: "the Hush's dust", frame: 1, x: 13.2, y: 21.6 },
    { name: 'a shed wing', frame: 0, x: 8.6, y: 27.0, flat: true },
    { name: 'grey dust, drifted', frame: 0, x: 5.6, y: 27.6, flat: true },
    // THE STAIR'S LANDING (20..31, 18..29)
    { name: 'a door of the tower', frame: 0, x: 22.6, y: 18, on: 'left' },
    { name: 'a broken window', frame: 0, x: 29.6, y: 18, on: 'left' },
    { name: "the Order's banner, gone grey", frame: 0, x: 20, y: 26.6, on: 'right' },
    { name: "the tower's stair", frame: 0, x: 28.4, y: 21.2 },
    { name: 'guttering candles', frame: 1, x: 21.5, y: 27.6 },
    { name: 'a heap of torn pages', frame: 1, x: 24.6, y: 26.0 },
    { name: 'a fallen mask of the Order', frame: 0, x: 27.4, y: 26.8, flat: true },
  ];
}

/** A laid piece's picture. */
export function spriteOf(l: Laid): Sprite | null {
  const p = P().get(l.name);
  if (!p) throw new Error(`no piece named ${l.name}`);
  if (l.on === 'left') return p.left ? p.left[l.frame] : null;
  if (l.on === 'right') return p.right ? p.right[l.frame] : null;
  return p.frames ? p.frames[l.frame] : null;
}
/** A laid piece's own soft shadow (tiles), if it stands. */
export function shadowOf(l: Laid): number {
  if (l.on || l.flat) return 0;
  return P().get(l.name)!.shadow ?? 0;
}
