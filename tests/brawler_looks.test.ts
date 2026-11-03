// THE BRAWLER REWORKED, TWENTY ROUGH LOOKS (dev/sculpt_brawler_looks.ts, dev/preview_brawler_looks.ts; mock-ups). His word,
// 2 Nov 2026, by 21:06: “Just some rough ideas, don’t need some fully animated sprites or whatever”. So only: nothing of the
// game imports them; there are ten of each, numbered 1 to 10; each is painted, a hero about the knight's height.
//   run: tsx --test tests/brawler_looks.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import { paintMove3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { OLD_BOXERS, REAL_FIGHTERS, sculptLook } from '../src/dev/sculpt_brawler_looks';
import { HEIGHT } from './sculpt_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

test('nothing of the game imports the twenty looks or their sheet', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    assert.ok(!/from ['"][^'"]*(sculpt_brawler_looks|preview_brawler_looks)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
});

test('ten old-timey boxers and ten fighters, each numbered 1 to 10, each with its line', () => {
  for (const set of [OLD_BOXERS, REAL_FIGHTERS]) {
    assert.deepEqual(set.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const l of set) assert.ok(l.line.length > 20 && l.name.length > 3, `${l.name} has its line`);
  }
});

test('each is painted, a hero about the knight’s height', () => {
  const knight = HEIGHT(paintMove3(MOVES3.ktown, 0, 'front').px);
  for (const l of [...OLD_BOXERS, ...REAL_FIGHTERS]) {
    const h = HEIGHT(sculptLook(l, 'front').px);
    assert.ok(h > knight * 0.75 && h < knight * 1.3, `${l.kind} ${l.n}, ${l.name}: ${h} high, the knight ${knight}`);
  }
});
