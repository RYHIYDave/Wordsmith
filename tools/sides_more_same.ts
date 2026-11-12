// THE TWO SIDES THE GAME HAS OF THE TINKERER AND THE BRAWLER, EVERY FRAME, AS ONE NUMBER EACH LIST (the Tinkerer chat, 11 Nov
// 2026): to hold this branch against `main`. Run on both (it reads nothing that `main` has not: copy this one file there), the
// two files it writes must be the same: not one pixel of either hero's two sides, nor of the Brawler's action lines from them,
// is changed by their six more sides (docs/mockups/eight_sides/README.md, "Nothing repainted").
//   npx tsx tools/sides_more_same.ts <out.json> [on]      `on`: with art/sides_more.ts EIGHT_MORE on (this branch only)
//   npx tsx tools/sides_more_same.ts <out.json> pin       every frame's own hash of the Brawler's two sides in a dungeon, for
//                                                         tests/sides_more.hashes.json (the Tinkerer's are pinned already:
//                                                         tests/cheap_heroes.hashes.json)
// @ts-ignore - node typings are not part of this project
import { createHash } from 'node:crypto';
// @ts-ignore
import { writeFileSync } from 'node:fs';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

declare const process: { argv: string[] };

function listsOfSet(set: unknown, prefix: string, out: { name: string; frames: Sprite[] }[]): void {
  const walk = (v: unknown, name: string): void => {
    if (Array.isArray(v)) {
      if (v.length && (typeof Object.getOwnPropertyDescriptor(v, 0)?.get === 'function' || v.every((x) => x && typeof x === 'object' && 'img' in (x as object)))) {
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

/** A frame's hash: its pixels and everything the game reads of it (as tools/cheap_heroes.ts hashSprite). */
export function frameHash(s: Sprite): string {
  const p = paintingOf(s);
  const h = createHash('sha256');
  const { img: _img, ...rest } = s;
  h.update(JSON.stringify({ ...rest, pw: p.w, ph: p.h }));
  h.update(p.d);
  return h.digest('hex').slice(0, 16);
}

async function main(): Promise<void> {
  const [out, on] = process.argv.slice(2);
  if (on === 'on') {
    const m = (await import('../src/art/sides_more')) as { EIGHT_MORE: { tinkerer: boolean; brawler: boolean } };
    m.EIGHT_MORE.tinkerer = true;
    m.EIGHT_MORE.brawler = true;
  }
  paintWithoutCanvas();
  const art = makeHeroArt3();
  const report: Record<string, { frames: number; hash: string }> = {};
  if (on === 'pin') {
    const lists: { name: string; frames: Sprite[] }[] = [];
    const a = art.of('brawler', lookOfPlace('dungeon')) as unknown as Record<string, unknown>;
    for (const side of ['front', 'back']) listsOfSet(a[side], `brawler:dungeon/${side}`, lists);
    const pinned: Record<string, string[]> = {};
    for (const l of lists) pinned[l.name] = l.frames.map((s) => frameHash(s));
    writeFileSync(out, JSON.stringify({ made: 'the Brawler (the Veteran) from in front and from behind, every frame and every action line, as on main at 9d3501b (25.3.3), by tools/sides_more_same.ts pin', lists: pinned }));
    console.log(`${lists.length} lists, ${lists.reduce((n, l) => n + l.frames.length, 0)} frames pinned`);
    return;
  }
  for (const cls of ['tinkerer', 'brawler'] as const) {
    for (const place of ['dungeon', 'card'] as const) {
      const a = art.of(cls, lookOfPlace(place)) as unknown as Record<string, unknown>;
      for (const side of ['front', 'back']) {
        const lists: { name: string; frames: Sprite[] }[] = [];
        listsOfSet(a[side], `${cls}:${place}/${side}`, lists);
        for (const l of lists) {
          const h = createHash('sha256');
          for (let i = 0; i < l.frames.length; i++) {
            const s = l.frames[i];
            if (!s || !s.img) {
              h.update('none');
              continue;
            }
            const p = paintingOf(s);
            const { img: _img, ...rest } = s;
            h.update(JSON.stringify({ ...rest, pw: p.w, ph: p.h }));
            h.update(p.d);
          }
          report[l.name] = { frames: l.frames.length, hash: h.digest('hex').slice(0, 20) };
        }
      }
    }
    console.log(cls, Object.keys(report).length);
  }
  writeFileSync(out, JSON.stringify(report, null, 1));
}
// (run as a tool only: the test imports frameHash from here)
if ((process.argv[1] ?? '').replace(/\\/g, '/').endsWith('tools/sides_more_same.ts')) void main();
