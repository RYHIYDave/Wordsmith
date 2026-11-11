// WHAT THE KINDS' EFFECTS KEEP IS LET GO ONCE THEIR FLOORS ARE BEHIND (11 Nov 2026; his words: “lag and freezing issues after
// playing a few levels”). Each kind's file here keeps the pictures of what it throws and leaves (a sigil's frames, a ring's, a
// shadow's) the first time each is shown, in a list of its own, and kept them for good: measured on 25.3.1, floors 1 to 6 in
// one sitting, some 40 MB of them were still held on floor 6 that a game begun on floor 6 never makes, and more with every floor.
//
// Now each such list is made with `keptPictures`, and as a new place is come into (main.ts placeFrame) every list that the
// place just left did not touch is emptied (`forgetUnusedPictures`): so a kind met on one floor and the next keeps its pictures,
// and one not met for a whole floor gives them up, made again if it is met again. A list whose pictures are its own to give
// back (`owned`: every one made here, by toSprite or as the mirror image of one of its own) has them given back by hand a
// moment later (engine/px.ts retireSprite: a phone's browser is slow to notice a picture nobody holds); the others are only
// forgotten, as before.

import { retireSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';

class Kept<K, V> extends Map<K, V> {
  /** Asked of or added to since the last place was come into. */
  used = false;
  constructor(readonly owned: boolean) {
    super();
  }
  override get(k: K): V | undefined {
    this.used = true;
    return super.get(k);
  }
  override set(k: K, v: V): this {
    this.used = true;
    return super.set(k, v);
  }
}

const ALL: Kept<unknown, unknown>[] = [];
const HOOKS: (() => void)[] = [];

/** A list of pictures kept by a kind's effects. `owned`: every picture in it is its own to give back (see above). */
export function keptPictures<K, V>(owned = false): Map<K, V> {
  const m = new Kept<K, V>(owned);
  ALL.push(m as unknown as Kept<unknown, unknown>);
  return m;
}

/** Something else to let go of as a new place is come into (a file's pictures kept another way). */
export function onNewPlace(f: () => void): void {
  HOOKS.push(f);
}

const isSprite = (v: unknown): v is Sprite => !!v && typeof v === 'object' && 'img' in (v as object) && 'ax' in (v as object) && 'ay' in (v as object);

/** A new place is come into: every list the last one did not touch is emptied. How many lists, and how many pictures. */
export function forgetUnusedPictures(): { lists: number; pictures: number } {
  let lists = 0;
  let pictures = 0;
  for (const m of ALL) {
    if (!m.used && m.size > 0) {
      lists++;
      pictures += m.size;
      if (m.owned) for (const v of m.values()) if (isSprite(v)) retireSprite(v);
      m.clear();
    }
    m.used = false;
  }
  for (const f of HOOKS) f();
  return { lists, pictures };
}
