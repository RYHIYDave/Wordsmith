// A LIST ASKED FOR A FRAME IT HAS NOT GOT, where the game is played (the Brawler memory chat, 11 Nov 2026).
//
// A heavy list (art/kit.ts HEAVY) shows a frame not painted yet as the nearest of its list that is, or as nothing, and leaves it
// to whoever makes its frames. For a hero whose moves are KEPT PACKED (render/baked.ts PACKS: the Brawler from all eight sides)
// that is the heroes' bake, which has the frame in a pack and unpacks it when it is told the list was asked: `told`, set by the
// bake as a packed hero is taken in. Nobody to tell (no bake on the page, a hero not packed): nothing is told, and the list is
// as any heavy list.
//
// (A file of its own, and not a line in art/kit.ts: the town's people's bake is marked by the code it is made of, kit.ts in
// it, and a line there would have made a new mark of the same pictures.)

import type { Sprite } from '../engine/px';
import { HEAVY, LEFT_TO_PAINTER } from './kit';

export const ASKED: { told: ((list: readonly Sprite[]) => void) | null } = { told: null };

/** Is a frame not painted yet being left for another to make (shown as the nearest, or as nothing)? */
export const leftToAnother = (): boolean => HEAVY.defer || LEFT_TO_PAINTER.on;

/**
 * A lazy list (art/kit.ts lazyFrames) that tells when a frame of it is asked for and not there: each place not painted yet
 * tells, and then is read as it was. A place painted or given since is a picture like any, and tells nothing.
 */
export function asking(list: Sprite[]): Sprite[] {
  for (let i = 0; i < list.length; i++) {
    const d = Object.getOwnPropertyDescriptor(list, i);
    if (!d || typeof d.get !== 'function') continue;
    const read = d.get;
    Object.defineProperty(list, i, {
      configurable: true,
      enumerable: true,
      get(): Sprite {
        if (leftToAnother()) ASKED.told?.(list);
        return read.call(list) as Sprite;
      },
    });
  }
  return list;
}
