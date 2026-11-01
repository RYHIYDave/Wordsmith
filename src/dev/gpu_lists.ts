// EVERY LIST OF FRAMES OF THE NEW CLASSES, AS THE GAME HOLDS THEM (for the graphics chip's checks and its test page, in a
// browser; the same walk as tools/cheap_heroes.ts `listsOf`, which runs in node). A DEV TOOL; NOTHING OF THE GAME IMPORTS IT.

import type { Sprite } from '../engine/px';
import type { ActorArt, AnimSet } from '../art/actor_types';
import { makeHeroArt3 } from '../art/heroes3';
import { lookOfPlace } from '../art/heroes';
import type { HeroPlace } from '../art/heroes';
import type { ClassId } from '../game/types';
import { golemCharge, makeContraptionArt, makeGolemArt } from '../art/tinkerer_art';

/** One list of frames: what it is, and its frames (painted when first read). */
export interface FrameList {
  name: string;
  frames: Sprite[];
}

function listsOfSet(set: AnimSet, prefix: string, out: FrameList[]): void {
  const walk = (v: unknown, name: string): void => {
    if (Array.isArray(v)) {
      if (v.length && typeof Object.getOwnPropertyDescriptor(v, 0)?.get === 'function') {
        out.push({ name, frames: v as Sprite[] });
        return;
      }
      if (v.length && v.every((x) => x && typeof x === 'object' && 'img' in (x as object))) {
        out.push({ name, frames: v as Sprite[] });
        return;
      }
      v.forEach((x, i) => walk(x, `${name}.${i}`));
      return;
    }
    if (v && typeof v === 'object') {
      if ('img' in (v as object)) return;
      for (const k of Object.keys(v as object)) walk((v as Record<string, unknown>)[k], name ? `${name}.${k}` : k);
    }
  };
  walk(set, prefix);
}
function listsOfArt(art: ActorArt | { front: unknown; back: unknown }, prefix: string): FrameList[] {
  const out: FrameList[] = [];
  listsOfSet(art.front as AnimSet, `${prefix}/front`, out);
  listsOfSet(art.back as AnimSet, `${prefix}/back`, out);
  return out;
}

/** Who: the Warrior (for his cost beside theirs), the Warlock in a run (a man, blazing, the demon), the Tinkerer, her Golem and Contraption, the Brawler. */
export type Who = 'warrior' | 'warlock' | 'tinkerer' | 'tinkerer-kit' | 'brawler';

/** Every list of frames of one of them, in a dungeon (one HeroArt for all, as the game has). */
export function listsOf(who: Who): FrameList[] {
  const art = makeHeroArt3();
  const of = (cls: ClassId, place: HeroPlace): FrameList[] => listsOfArt(art.of(cls, lookOfPlace(place)), `${cls}:${place}`);
  if (who === 'warrior') return of('warrior', 'dungeon');
  if (who === 'warlock') return [...of('warlock', 'dungeon'), ...of('warlock', 'blaze'), ...of('warlock', 'demon')];
  if (who === 'tinkerer') return of('tinkerer', 'dungeon');
  if (who === 'brawler') return of('brawler', 'dungeon');
  const out: FrameList[] = [];
  for (const gun of ['cannon', 'tesla', 'pincer'] as const) out.push(...listsOfArt(makeGolemArt(gun), `golem:${gun}`));
  for (const gun of ['cannon', 'tesla'] as const) for (const v of ['front', 'back'] as const) out.push({ name: `golem:${gun}/${v}/charge`, frames: golemCharge(v, gun) });
  for (const ammo of ['vials', 'bombs', 'energy'] as const) out.push(...listsOfArt(makeContraptionArt(ammo), `contraption:${ammo}`));
  return out;
}
