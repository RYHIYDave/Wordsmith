// THE RANGER'S FRAMES, HASHED, COUNTED AND TIMED (the art chat's helper, 6 Nov 2026; docs/mockups/ranger_up/README.md), as
// tools/warrior_up_measure.ts does the Warrior's.
//
// Every frame the game holds of the Ranger, in each place it shows him (a dungeon, town, his class card), both ways round: each
// frame's hash (its pixels, size, anchor, lights, pool of light, tails: tools/cheap_heroes.ts hashSprite), how many there are,
// how many different pictures, the memory they take decoded at the game's grain (4 bytes a picture pixel) and how long each
// took to paint. The game's Ranger as he is (the game does not reach art/ranger_up.ts).
//
//   npx tsx tools/ranger_up_measure.ts hash <out.json>     every frame's hash, and the counts, to a file
//   npx tsx tools/ranger_up_measure.ts count [up] [eight] [dungeon]   the counts, memory and times only (painting every frame):
//                                                          `up` with RANGER_UP on; `eight` from all eight sides; `dungeon` a dungeon alone

// @ts-ignore - node typings are not part of this project
import { writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import type { HeroPlace } from '../src/art/heroes';
import { RANGER_UP } from '../src/art/ranger_up';
import { hashSprite } from './cheap_heroes';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

declare const process: { argv: string[]; exit(code: number): never };

export interface RangerList {
  name: string;
  frames: Sprite[];
}

/** Every list of frames in a set, by where it is in it (as tools/cheap_heroes.ts walks them). */
function listsOfSet(set: unknown, prefix: string, out: RangerList[]): void {
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

/** Every list of the Ranger's, in every place the game shows him, both ways round (one HeroArt for all, as the game has); with
 * `five`, from each of the five sides (those of them his art has). */
export function rangerLists(eight = false, places: HeroPlace[] = PLACES): RangerList[] {
  const art = makeHeroArt3();
  const out: RangerList[] = [];
  for (const place of places) {
    const a = art.of('ranger', lookOfPlace(place)) as unknown as Record<string, unknown>;
    for (const side of eight ? ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side'] : ['front', 'back']) if (a[side]) listsOfSet(a[side], `ranger:${place}/${side}`, out);
  }
  return out;
}

function main(): void {
  const [mode, ...args] = process.argv.slice(2);
  if (args.includes('up')) RANGER_UP.on = true;
  const lists = rangerLists(args.includes('eight'), args.includes('dungeon') ? ['dungeon'] : PLACES);
  const hashes: Record<string, string[]> = {};
  const seen = new Set<Sprite>();
  const pictures = new Set<string>();
  let frames = 0;
  let bytes = 0;
  let packed = 0;
  let ms = 0;
  let painted = 0;
  const per: Record<string, { n: number; ms: number }> = {};
  for (const l of lists) {
    const hs: string[] = [];
    const t0 = performance.now();
    let mine = 0;
    for (let i = 0; i < l.frames.length; i++) {
      const before = performance.now();
      const s = l.frames[i];
      const took = performance.now() - before;
      frames++;
      if (!seen.has(s)) {
        seen.add(s);
        const p = paintingOf(s);
        bytes += p.w * p.h * 4;
        // (packed as a picture file would be: its pixels deflated, as a PNG's are; a guide to what baking him adds to the download)
        packed += deflateSync(p.d, { level: 9 }).length + 60;
        ms += took;
        painted++;
        mine++;
      }
      const h = hashSprite(s);
      pictures.add(h);
      hs.push(h);
    }
    hashes[l.name] = hs;
    per[l.name] = { n: mine, ms: performance.now() - t0 };
  }
  const report = {
    sides: [...new Set(lists.map((l) => l.name.split('/')[1].split('.')[0]))].length,
    lists: lists.length,
    frames,
    held: seen.size,
    pictures: pictures.size,
    memoryMB: +(bytes / 1024 / 1024).toFixed(2),
    packedMB: +(packed / 1024 / 1024).toFixed(2),
    paintMs: Math.round(ms),
    msPerFrame: +(ms / Math.max(1, painted)).toFixed(1),
  };
  console.log(JSON.stringify(report));
  for (const place of PLACES) {
    const mine = lists.filter((l) => l.name.startsWith(`ranger:${place}/`));
    console.log(`${place}: ${mine.length} lists, ${mine.reduce((a, l) => a + l.frames.length, 0)} frames`);
  }
  if (mode === 'hash') {
    writeFileSync(args[0], JSON.stringify({ report, lists: hashes }, null, 0));
    console.log(`written ${args[0]}`);
  } else if (mode === 'lists') {
    for (const l of lists) console.log(`${l.name} ${l.frames.length} (${per[l.name].n} painted, ${per[l.name].ms.toFixed(0)} ms)`);
  }
}

// (run as a tool only: the tests import rangerLists from here)
if ((process.argv[1] ?? '').replace(/\\/g, '/').endsWith('tools/ranger_up_measure.ts')) {
  paintWithoutCanvas();
  main();
}
