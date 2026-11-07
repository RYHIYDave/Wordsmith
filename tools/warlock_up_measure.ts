// THE WARLOCK'S FRAMES, HASHED AND COUNTED (the art chat's helper, 7 Nov 2026; docs/mockups/warlock_up/README.md), as
// tools/mage_up_measure.ts does the Mage's.
//
// Every frame the game holds of the Warlock, in each place it shows him (a dungeon, town, his class card), a man (his arm
// blazing or not) and the demon, both ways round: each frame's hash (its pixels, size, anchor, lights, pool of light:
// tools/cheap_heroes.ts hashSprite). Made by the very call the game makes (art/heroes3.ts makeHeroArt3 → makeWarlockArt), one
// share for all, as the game has. The game's Warlock as he is (the game does not reach art/warlock_up.ts).
//
//   npx tsx tools/warlock_up_measure.ts hash <out.json>     every frame's hash, and the counts, to a file
//   npx tsx tools/warlock_up_measure.ts lists               the lists and their lengths only (painting nothing)

// @ts-ignore - node typings are not part of this project
import { writeFileSync } from 'node:fs';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import type { HeroPlace } from '../src/art/heroes';
import { hashSprite } from './cheap_heroes';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[]; exit(code: number): never };

export interface WarlockList {
  name: string;
  frames: Sprite[];
}

/** Every list of frames in a set, by where it is in it (as tools/mage_up_measure.ts walks them). */
function listsOfSet(set: unknown, prefix: string, out: WarlockList[]): void {
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

export const PLACES: HeroPlace[] = ['dungeon', 'town', 'card'];

/** Every list of the Warlock's the game holds: in every place, a man (his arm blazing or not) and, in a dungeon, the demon; both
 * ways round; from one HeroArt, as the game has. */
export function warlockLists(places: HeroPlace[] = PLACES): WarlockList[] {
  const art = makeHeroArt3();
  const out: WarlockList[] = [];
  for (const place of places) {
    const looks: [string, Record<string, unknown>][] = [
      ['man', {}],
      ['blaze', { blaze: true }],
    ];
    if (place === 'dungeon') looks.push(['demon', { demon: true }]);
    for (const [form, more] of looks) {
      const a = art.of('warlock', { ...lookOfPlace(place), ...more } as ReturnType<typeof lookOfPlace>) as unknown as Record<string, unknown>;
      for (const side of ['front', 'back']) if (a[side]) listsOfSet(a[side], `warlock:${place}:${form}/${side}`, out);
    }
  }
  return out;
}

function main(): void {
  const [mode, ...args] = process.argv.slice(2);
  const lists = warlockLists();
  if (mode === 'lists') {
    for (const l of lists) console.log(`${l.name} ${l.frames.length}`);
    console.log(`${lists.length} lists, ${lists.reduce((a, l) => a + l.frames.length, 0)} frames`);
    return;
  }
  const hashes: Record<string, string[]> = {};
  const done = new Map<Sprite, string>();
  let frames = 0;
  const t0 = performance.now();
  for (const l of lists) {
    const hs: string[] = [];
    for (let i = 0; i < l.frames.length; i++) {
      const s = l.frames[i];
      let h = done.get(s);
      if (!h) {
        h = hashSprite(s);
        done.set(s, h);
      }
      hs.push(h);
      frames++;
    }
    hashes[l.name] = hs;
    console.log(`${l.name} ${l.frames.length} (${((performance.now() - t0) / 1000).toFixed(0)} s)`);
  }
  const report = { lists: lists.length, frames, painted: done.size };
  console.log(JSON.stringify(report));
  if (mode === 'hash') {
    writeFileSync(args[0], JSON.stringify({ report, lists: hashes }, null, 0));
    console.log(`written ${args[0]}`);
  }
}

// (run as a tool only: the tests import warlockLists from here)
if ((process.argv[1] ?? '').replace(/\\/g, '/').endsWith('tools/warlock_up_measure.ts')) {
  paintWithoutCanvas();
  main();
}
