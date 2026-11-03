// THE NEW ITEM PICTURES IN THE GAME, FOR PICTURES ONLY (tools/items_a_build.mjs): the game built with art/icons.ts' makeIconArt
// standing in for itself, its item pictures the new ones (src/art/items_a.ts) at the rarity named after an '@' in an item's
// picture key ('sword@2'), or at Normal. The phone pictures' scenario (tools/scenarios/items_a_phone.mjs) gives each item such a
// key, so the bag, the gear and the floor show each at its own rarity, drawn by the game itself. Not the way the game will ask for
// them (docs/mockups/items_look/README.md says that): only a way to see them in the real game before it does.
export * from '../art/icons';
import { makeIconArt as makeIconArtToday } from '../art/icons';
import type { IconArt } from '../art/icons';
import { itemAKind, itemArt } from '../art/items_a';
import type { Rarity } from '../game/types';

export function makeIconArt(): IconArt {
  const art = makeIconArtToday();
  art.item = new Proxy(art.item, {
    get(today, k) {
      if (typeof k !== 'string') return Reflect.get(today, k);
      const m = /^(.+)@([0-3])$/.exec(k);
      const kind = m ? m[1] : k;
      return itemAKind(kind) ? itemArt(kind, (m ? Number(m[2]) : 0) as Rarity) : Reflect.get(today, k);
    },
  });
  return art;
}
