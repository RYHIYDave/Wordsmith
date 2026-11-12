// THE UNIQUE ITEMS' OWN PICTURES (src/art/items_unique.ts), behind UNIQUE_ART, off. His pick, 11 Nov 2026, asked how far the
// bag pictures of the 62 uniques should go: “A picture of its own each (Recommended)”.
//   1. the switch is off, and off the game shows every unique exactly as before: its base's picture (art/icons.ts itemPic);
//   2. on, a unique drawn here shows its own picture, sized and anchored as the game's item pictures are, and one not drawn
//      yet, or a piece that is no unique, still shows its base's;
//   3. every picture drawn: 32 by 32, crisp, a clear pixel round it, the orange rim, big enough, and its own (no two alike, none
//      its base's orange look);
//   4. every id drawn is a unique of game/uniques.ts, and the file paints with the item pictures' kit and asks the game nothing.
//
//   run: tsx --test tests/items_unique.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
import { RNG } from '../src/engine/rng';
import type { Px } from '../src/engine/px';
import { itemPic, makeIconArt } from '../src/art/icons';
import type { IconArt } from '../src/art/icons';
import { ITEMS_A, ITEM_A_N, itemAKind, itemArt, paintItemA } from '../src/art/items_a';
import { UNIQUE_ART, UNIQUE_ART_IDS, paintUnique, uniqueArt } from '../src/art/items_unique';
import { RARITY_COLOR } from '../src/art/palette';
import { UNIQUES, UNIQUE_DEFS, makeUnique, uniqueDef } from '../src/game/uniques';
import type { Item } from '../src/game/types';
import { paintWithoutCanvas, paintingOf } from './helpers';

paintWithoutCanvas();

const fs = nodeFs as { readFileSync(p: string, e: string): string };
const art: IconArt = makeIconArt();
const N = ITEM_A_N;

function withSwitches<T>(uniques: boolean, own: boolean, run: () => T): T {
  const was = [UNIQUES.on, UNIQUE_ART.on];
  UNIQUES.on = uniques;
  UNIQUE_ART.on = own;
  try {
    return run();
  } finally {
    [UNIQUES.on, UNIQUE_ART.on] = was;
  }
}
/** Every unique of the build, made as the game makes one. */
function everyUnique(): Item[] {
  const rng = new RNG(11);
  return UNIQUE_DEFS.map((d) => {
    const it = makeUnique(d.id, 12, rng);
    assert.ok(it, `${d.id} is made`);
    return it!;
  });
}
const has = (p: Px, x: number, y: number): boolean => x >= 0 && y >= 0 && x < p.w && y < p.h && p.d[(y * p.w + x) * 4 + 3] > 0;
const same = (a: Px, b: Px): boolean => a.w === b.w && a.h === b.h && a.d.every((v, i) => v === b.d[i]);

test('the switch is off; off, every unique shows its base\'s picture, the very same one as before', () => {
  assert.equal(UNIQUE_ART.on, false, 'UNIQUE_ART is off until his yes');
  assert.equal(ITEMS_A.on, true);
  withSwitches(true, false, () => {
    for (const it of everyUnique()) {
      assert.equal(uniqueArt(it.unique), null, `${it.unique}: nothing of its own with the switch off`);
      assert.ok(itemPic(art, it.icon, it.rarity, it.unique) === itemArt(it.icon, it.rarity), `${it.unique} shows its base's orange look`);
      assert.ok(itemPic(art, it.icon, it.rarity, it.unique) === itemPic(art, it.icon, it.rarity), `${it.unique}: as with no fourth argument`);
    }
  });
});

test('on: a unique drawn here shows its own picture, sized and anchored as the game\'s item pictures; the rest show their base\'s', () => {
  withSwitches(true, true, () => {
    let own = 0;
    for (const it of everyUnique()) {
      const s = itemPic(art, it.icon, it.rarity, it.unique);
      const base = itemArt(it.icon, it.rarity);
      if (UNIQUE_ART_IDS.includes(it.unique!)) {
        own++;
        assert.ok(s === uniqueArt(it.unique), `${it.unique} shows its own`);
        assert.ok(s !== base, `${it.unique}: not its base's`);
        assert.deepEqual([s.w, s.h, s.ax, s.ay, s.density], [base.w, base.h, base.ax, base.ay, base.density], `${it.unique}: 16 by 16 game pixels, anchor the middle, two picture pixels to a game pixel`);
        assert.ok(same(paintingOf(s), paintUnique(it.unique!)!), `${it.unique}: the picture painted`);
        assert.ok(itemPic(art, it.icon, it.rarity, it.unique) === s, `${it.unique}: made once and kept`);
      } else {
        assert.ok(s === base, `${it.unique}, not drawn yet, shows its base's`);
      }
    }
    assert.equal(own, UNIQUE_ART_IDS.length, 'every picture drawn belongs to a unique the game makes');
    // a piece that is no unique, and a unique the build does not know
    assert.ok(itemPic(art, 'boots', 2, undefined) === itemArt('boots', 2), 'a rare pair of boots: its own picture, as ever');
    assert.ok(itemPic(art, 'boots', 3, 'nosuchunique') === itemArt('boots', 3), 'an id with no picture: the base\'s');
  });
});

test('every picture drawn: its size, crisp, a clear pixel round it, the orange rim round its ink, big enough, and its own', () => {
  const rim = RARITY_COLOR[3];
  const pics = UNIQUE_ART_IDS.map((id) => [id, paintUnique(id)!] as const);
  for (const [id, p] of pics) {
    assert.ok(p, `${id} is painted`);
    assert.deepEqual([p.w, p.h], [N, N], `${id}: 32 by 32`);
    let n = 0, rims = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const a = p.d[(y * N + x) * 4 + 3];
      assert.ok(a === 0 || a === 255, `${id}: a soft pixel at ${x},${y}`);
      if (!a) continue;
      n++;
      assert.ok(x > 0 && y > 0 && x < N - 1 && y < N - 1, `${id}: touches its frame at ${x},${y}`);
      const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !has(p, x + dx, y + dy));
      if (open) {
        rims++;
        assert.equal(p.get(x, y), rim, `${id}: its outermost pixel at ${x},${y} is the rim's orange`);
      }
    }
    // (the game's own measure of an item picture big enough to read: tests/items_a.test.ts)
    assert.ok(n >= 150, `${id}: only ${n} pixels`);
    assert.ok(rims >= 50, `${id}: its rim has only ${rims} pixels`);
  }
  for (let i = 0; i < pics.length; i++) for (let j = i + 1; j < pics.length; j++) {
    assert.ok(!same(pics[i][1], pics[j][1]), `${pics[i][0]} and ${pics[j][0]} are the same picture`);
  }
  withSwitches(true, false, () => {
    for (const it of everyUnique()) {
      if (!UNIQUE_ART_IDS.includes(it.unique!)) continue;
      const p = paintUnique(it.unique!)!;
      const base = paintItemA(itemAKind(it.icon)!, 3);
      let differ = 0, either = 0;
      for (let k = 0; k < p.d.length; k += 4) {
        if (p.d[k + 3] || base.d[k + 3]) either++;
        if (p.d[k] !== base.d[k] || p.d[k + 1] !== base.d[k + 1] || p.d[k + 2] !== base.d[k + 2] || p.d[k + 3] !== base.d[k + 3]) differ++;
      }
      // (two in five of the pixels either picture fills: a thin bow has few pixels to differ in, so a share, not a count)
      assert.ok(differ >= either * 0.4, `${it.unique}: told from its base's orange look at a glance (${differ} of ${either} pixels differ)`);
    }
  });
});

test('every id drawn is a unique of the build; the file paints with the item pictures\' kit and asks the game nothing', () => {
  for (const id of UNIQUE_ART_IDS) assert.ok(uniqueDef(id), `${id} is in UNIQUE_DEFS`);
  assert.equal(new Set(UNIQUE_ART_IDS).size, UNIQUE_ART_IDS.length);
  assert.equal(paintUnique('nosuchunique'), null);
  assert.equal(paintUnique('toString'), null, 'not fooled by a name every object has');
  const src = fs.readFileSync('src/art/items_unique.ts', 'utf8');
  const froms = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual([...new Set(froms)], ['../engine/px', './items_a'], 'it imports the picture type and the kit, nothing of the game\'s rules');
  const icons = fs.readFileSync('src/art/icons.ts', 'utf8');
  assert.ok(/import \{ uniqueArt \} from '\.\/items_unique';/.test(icons), 'art/icons.ts asks for them (itemPic)');
  for (const f of ['src/ui/inventory.ts', 'src/ui/town.ts', 'src/render/render.ts', 'src/ui/trades.ts']) {
    assert.ok(!/items_unique['"]/.test(fs.readFileSync(f, 'utf8')), `${f} asks itemPic, not the pictures themselves`);
  }
});
