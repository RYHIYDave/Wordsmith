// THE BARRIER GEAR'S HEAD AND FEET, DRAWN (src/art/items_a.ts cowl, slippers): the queue's “Draw gear icons for a cloth hood and
// cloth slippers (the Barrier pieces)”. The Godot game's three defences (his idea and his yes to their pictures, 22 Nov 2026) give
// cloth gear Barrier, but cloth had only a robe, gloves and a sash: no helmet and no boots. So two new pictures, in the style of the
// game's own gear pictures and in the robe's colours, for the Linen, Silk and Velvet Cowl and Slippers. Pictures first: no piece of
// the game has them until he has seen them and said yes, and the Godot game adds the bases. Here:
//   1. both are kinds the game knows, with their names, and stand-ins for the pictures' switch off;
//   2. both in the robe's colours: its violet cloth (the Unique's black), its band (cloth, blue, gold) and its sash (cord, blue, red);
//   3. neither looks like its neighbour: the cowl not the hood, the slippers not the boots (their silhouettes apart).
// (Size, crispness, the rim, each rarity finer, no enemy's colours and no two kinds alike: tests/items_a.test.ts, for every kind.)
//   run: tsx --test tests/cloth_gear_art.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { ITEM_A_KINDS, ITEM_A_NAME, paintItemA } from '../src/art/items_a';
import { ICON_KEYS } from '../src/game/types';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const RARS = [0, 1, 2, 3] as const;
const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const set = (cs: readonly string[]): Set<string> => new Set(cs.map(key));
// (the materials, art/items_a.ts M)
const VCLOTH = set(['#1a0c36', '#2e1660', '#4a2490', '#6e3cc0', '#a27ae8']);
const BLACK = set(['#0a0816', '#16122a', '#262040', '#3a3258', '#5a5078']);
const BLUE = set(['#0c1440', '#16286e', '#2446a8', '#4a74e0', '#9ab8ff']);
const GOLD = set(['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0']);
const STRING = set(['#5a5050', '#8a8078', '#c8beb0', '#ece4d4', '#ffffff']);
const RED = set(['#34081a', '#661024', '#a81e2e', '#dc4234', '#ff8a66']);
const count = (p: Px, s: Set<string>): number => {
  let n = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c && s.has(key(c))) n++; }
  return n;
};
const NEW = ['cowl', 'slippers'] as const;

test('the cowl and the slippers: kinds the game knows, by their names', () => {
  for (const k of NEW) {
    assert.ok((ITEM_A_KINDS as readonly string[]).includes(k), `${k}: a kind the pictures have`);
    assert.ok((ICON_KEYS as readonly string[]).includes(k), `${k}: a picture key the game knows`);
  }
  assert.equal(ITEM_A_NAME.cowl, 'Cowl');
  assert.equal(ITEM_A_NAME.slippers, 'Slippers');
});

test('in the robe’s colours: its violet cloth (the Unique’s black), its band, its sash', () => {
  for (const k of NEW) for (const r of RARS) {
    const p = paintItemA(k, r);
    const id = `${k} (rarity ${r})`;
    if (r < 3) assert.ok(count(p, VCLOTH) >= 90, `${id}: only ${count(p, VCLOTH)} pixels of the robe's violet cloth`);
    else assert.ok(count(p, BLACK) >= 90, `${id}: only ${count(p, BLACK)} pixels of the Unique robe's black`);
    // (the band: blue on the Magic, gold on the Rare and the Unique; the sash's cord: plain on the Normal, red on the Rare and the Unique)
    if (r === 1) assert.ok(count(p, BLUE) >= 12, `${id}: its band hardly blue (${count(p, BLUE)})`);
    if (r >= 2) assert.ok(count(p, GOLD) >= 12, `${id}: its band hardly gold (${count(p, GOLD)})`);
    if (r === 0) assert.ok(count(p, STRING) >= 3, `${id}: no plain cord (${count(p, STRING)})`);
    if (r >= 2) assert.ok(count(p, RED) >= 3, `${id}: no red cord (${count(p, RED)})`);
  }
});

test('neither looks like its neighbour: the cowl apart from the hood, the slippers from the boots', () => {
  const mask = (p: Px): boolean[] => Array.from({ length: p.w * p.h }, (_, i) => p.d[i * 4 + 3] > 0);
  const iou = (a: Px, b: Px): number => {
    const A = mask(a), B = mask(b);
    let both = 0, either = 0;
    for (let i = 0; i < A.length; i++) { if (A[i] && B[i]) both++; if (A[i] || B[i]) either++; }
    return both / either;
  };
  for (const r of RARS) {
    const ch = iou(paintItemA('cowl', r), paintItemA('hood', r));
    const sb = iou(paintItemA('slippers', r), paintItemA('boots', r));
    assert.ok(ch < 0.8, `rarity ${r}: the cowl and the hood overlap ${ch.toFixed(2)}`);
    assert.ok(sb < 0.6, `rarity ${r}: the slippers and the boots overlap ${sb.toFixed(2)}`);
  }
});
