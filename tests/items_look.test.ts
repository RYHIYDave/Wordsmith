// THE NEW ITEM PICTURES, THREE STYLES (src/dev/items_look.ts; docs/mockups/items_look): pictures only, not in the game. The owner,
// 2 Nov 2026, 19:53: “I’d like new item sprites I think.  They’re pretty old art.  Then I guess get ready for unique items.” So:
//   1. nothing of the game imports them;
//   2. every item, in every style, at every rarity: 32 by 32 picture pixels (the 16 game pixels today's fill), every pixel crisp,
//      nothing cut off at the edge, big enough to read at a glance, no friend's glow and none of the enemy's colours (nothing glows);
//   3. each item's shape its own: no two items' silhouettes alike, in any style (the closest pair is printed);
//   4. the rarities read: B rings each in its rarity's colour; in A and C a rarer sword is a finer one.
//   run: tsx --test tests/items_look.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import { BLADE, CYAN, GLINT, PINK, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { ITEM_LOOK_KINDS, LOOK_N, LOOK_RARITY, LOOK_STYLES, paintItemLook } from '../src/dev/items_look';
import type { LookKind, LookStyle } from '../src/dev/items_look';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const INK = '#0e0c24';
const RARS = [0, 1, 2, 3] as const;
const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const GLOW = new Set([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map(key).filter((k) => k !== '255,255,255'));
const ENEMY = new Set([...PINK, ...FLAME, ENEMY_RIM, '#ff3a78'].map(key));
const pics = new Map<string, Px>();
const pic = (k: LookKind, st: LookStyle, r: 0 | 1 | 2 | 3): Px => {
  const id = `${k}:${st}:${r}`;
  let p = pics.get(id);
  if (!p) pics.set(id, (p = paintItemLook(k, st, r)));
  return p;
};
const mask = (p: Px): boolean[] => Array.from({ length: p.w * p.h }, (_, i) => p.d[i * 4 + 3] > 0);

test('nothing of the game imports the new item pictures', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    assert.ok(!/items_look/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
});

test('every item, every style, every rarity: its size, crisp, nothing cut off, big enough, nothing glowing', () => {
  for (const st of LOOK_STYLES) for (const k of ITEM_LOOK_KINDS) for (const r of RARS) {
    const p = pic(k, st, r);
    const id = `${k} (${st}, rarity ${r})`;
    assert.equal(p.w, LOOK_N, `${id}: width`);
    assert.equal(p.h, LOOK_N, `${id}: height`);
    let painted = 0;
    let x0 = 99, x1 = -1, y0 = 99, y1 = -1;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const a = p.d[(y * p.w + x) * 4 + 3];
      assert.ok(a === 0 || a === 255, `${id}: a pixel half see-through at ${x},${y}`);
      const c = p.get(x, y);
      if (!c) continue;
      painted++;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      const edge = x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1;
      // (at the very edge only its outline, or in B its rarity rim: the thing itself is never cut by the frame)
      if (edge) assert.ok(c === INK || (st === 'B' && c === LOOK_RARITY[r]), `${id}: cut off at the edge at ${x},${y}`);
      assert.ok(!GLOW.has(key(c)), `${id}: the friend's glow at ${x},${y}`);
      assert.ok(!ENEMY.has(key(c)), `${id}: the enemy's colour at ${x},${y}`);
    }
    assert.ok(painted >= 150, `${id}: only ${painted} pixels`);
    assert.ok(Math.max(x1 - x0, y1 - y0) + 1 >= 22, `${id}: only ${Math.max(x1 - x0, y1 - y0) + 1} across`);
  }
});

test('no two items look alike: no two silhouettes overlap by four fifths or more, in any style', () => {
  for (const st of LOOK_STYLES) {
    const ms = ITEM_LOOK_KINDS.map((k) => mask(pic(k, st, 0)));
    let worst = 0, pair = '';
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
      let both = 0, either = 0;
      for (let q = 0; q < ms[i].length; q++) { if (ms[i][q] && ms[j][q]) both++; if (ms[i][q] || ms[j][q]) either++; }
      const iou = both / either;
      if (iou > worst) { worst = iou; pair = `${ITEM_LOOK_KINDS[i]} and ${ITEM_LOOK_KINDS[j]}`; }
    }
    console.log(`  ${st}: the closest two, ${pair}, overlap ${worst.toFixed(2)}`);
    assert.ok(worst < 0.8, `${st}: ${pair} overlap ${worst.toFixed(2)}`);
  }
});

test('the rarities read: B ringed in its colour; in A and C each rarer sword is finer, and none the same', () => {
  for (const r of RARS) {
    const p = pic('sword', 'B', r);
    let rim = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.get(x, y) === LOOK_RARITY[r]) rim++;
    assert.ok(rim >= 40, `B, rarity ${r}: its rim has ${rim} pixels`);
  }
  for (const st of ['A', 'C'] as const) {
    const four = RARS.map((r) => pic('sword', st, r));
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      let diff = 0;
      for (let q = 0; q < four[a].d.length; q += 4) if (four[a].d[q] !== four[b].d[q] || four[a].d[q + 1] !== four[b].d[q + 1] || four[a].d[q + 2] !== four[b].d[q + 2]) diff++;
      assert.ok(diff >= 6, `${st}: the rarities ${a} and ${b} differ by only ${diff} pixels`);
    }
  }
});
