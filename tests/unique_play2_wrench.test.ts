// THE STICKY WRENCH'S VIAL IN PLAY (src/art/unique_play_art2.ts paintStuckVial; behind UNIQUE_PLAY.wrench, off):
//   1. its switch is off;
//   2. a picture every frame of the rules' fuse; it blinks quicker and quicker (its flares closer together toward the end);
//      its colours its brew (the friend's cyan), its cap, its pitch and the ink: nothing pink or gold that glows.
//   run: node tools/unit.mjs --only unique_play2_wrench

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { INK } from '../src/art/kit';
import { STICKY, STICKY_BREW, STICKY_CAP, STICKY_GLUE, paintStuckVial } from '../src/art/unique_play_art2';
import { UNIQUE_PLAY } from '../src/render/unique_play';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

test("1. the Sticky Wrench's switch is off", () => {
  assert.equal(UNIQUE_PLAY.wrench, false);
});

test('2. every frame of its fuse; blinking quicker and quicker; its own colours only', () => {
  const gaps = STICKY.blinks.slice(1).map((b, i) => b - STICKY.blinks[i]);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] <= gaps[i - 1], 'its blinks closer together toward the end');
  const own = new Set([...STICKY_BREW, ...STICKY_CAP, ...STICKY_GLUE, INK].map((c) => c.toLowerCase()));
  for (let f = 0; f < STICKY.frames; f++) {
    const p = paintStuckVial(f);
    assert.ok(p.bounds() !== null, `frame ${f}: something there`);
    for (let i = 0; i < p.d.length; i += 4) {
      if (!p.d[i + 3]) continue;
      const c = `#${[p.d[i], p.d[i + 1], p.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
      assert.ok(own.has(c), `frame ${f}: ${c} is none of its colours`);
    }
  }
});
