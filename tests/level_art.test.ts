// THE TWENTY LEVELING UNIQUES' BAG PICTURES (art/items_unique.ts LEVEL_PAINTERS, behind LEVEL_ART, off until his yes). Held:
//   1. off, none is painted: each shows its base's orange look, as before;
//   2. on, each of the twenty: 32 by 32, crisp, a clear pixel round it, the uniques' orange rim round its ink, big enough, and its
//      own; one for each of game/uniques.ts LEVEL_DEFS.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { LEVEL_ART, LEVEL_ART_IDS, UNIQUE_ART_IDS, paintUnique } from '../src/art/items_unique';
import { RARITY_COLOR } from '../src/art/palette';
import type { Px } from '../src/engine/px';
import { LEVEL_DEFS } from '../src/game/uniques';

const N = 32;
const has = (p: Px, x: number, y: number): boolean => x >= 0 && y >= 0 && x < N && y < N && p.d[(y * N + x) * 4 + 3] > 0;
const same = (a: Px, b: Px): boolean => a.d.length === b.d.length && a.d.every((v, i) => v === b.d[i]);

test('1. off, none of the twenty is painted', () => {
  assert.equal(LEVEL_ART.on, false, 'off until his yes to the pictures');
  for (const id of LEVEL_ART_IDS) assert.equal(paintUnique(id), null, `${id}: its base's look`);
});

test('2. on, the twenty: sound, each its own, one for each leveling unique', () => {
  assert.deepEqual([...LEVEL_ART_IDS].sort(), LEVEL_DEFS.map((d) => d.id).sort(), 'one for each of the twenty');
  for (const id of LEVEL_ART_IDS) assert.ok(!UNIQUE_ART_IDS.includes(id), `${id}: not among the 62's`);
  LEVEL_ART.on = true;
  try {
    const rim = RARITY_COLOR[3];
    const pics = LEVEL_ART_IDS.map((id) => [id, paintUnique(id)!] as const);
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
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !has(p, x + dx, y + dy))) {
          rims++;
          assert.equal(p.get(x, y), rim, `${id}: its outermost pixel at ${x},${y} is the rim's orange`);
        }
      }
      assert.ok(n >= 150, `${id}: only ${n} pixels`);
      assert.ok(rims >= 50, `${id}: its rim has only ${rims} pixels`);
    }
    for (let i = 0; i < pics.length; i++) for (let j = i + 1; j < pics.length; j++) assert.ok(!same(pics[i][1], pics[j][1]), `${pics[i][0]} and ${pics[j][0]} are the same picture`);
  } finally {
    LEVEL_ART.on = false;
  }
});
