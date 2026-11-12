// THE MOTH'S WING'S DARK WORD ON THE HUD (src/ui/hud.ts MOTH, mothNow; behind UNIQUE_PLAY.moth, off):
//   1. its switch is off, and with it off no word is ever shown dark, whatever the rules have darkened;
//   2. with it on: the word the rules have darkened is the one shown dark; moved to another, the first is shown coming back (its
//      flash) for MOTH.flashes seconds and then is plain again; come back, the same.
//   run: node tools/unit.mjs --only unique_play3_moth

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { MOTH, mothNow } from '../src/ui/hud';
import { UNIQUE_PLAY } from '../src/render/unique_play';
import type { Game } from '../src/game/game';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const game = (dark: { skill: number; side: 'front' | 'behind'; idx: number } | null): Game => ({ uq: { dark } }) as unknown as Game;

test("1. the Moth's Wing's switch is on; with it off no word is shown dark", () => {
  assert.equal(UNIQUE_PLAY.moth, true, 'on: his yes, 12 Nov 2026');
  UNIQUE_PLAY.moth = false;
  try {
    mothNow(game({ skill: 0, side: 'front', idx: 0 }), 1);
    assert.equal(MOTH.dark, null);
  } finally {
    UNIQUE_PLAY.moth = true;
  }
});

test('2. on: the dark word shown dark; moved, the first comes back with a flash, then is plain', () => {
  UNIQUE_PLAY.moth = true;
  try {
    mothNow(game({ skill: 0, side: 'behind', idx: 0 }), 10);
    assert.deepEqual(MOTH.dark, { skill: 0, side: 'behind', idx: 0 });
    assert.equal(MOTH.back, null);
    mothNow(game({ skill: 1, side: 'front', idx: 0 }), 11);
    assert.deepEqual(MOTH.dark, { skill: 1, side: 'front', idx: 0 });
    assert.deepEqual(MOTH.back, { skill: 0, side: 'behind', idx: 0 }, 'the first comes back');
    mothNow(game({ skill: 1, side: 'front', idx: 0 }), 11 + MOTH.flashes + 0.01);
    assert.equal(MOTH.back, null, 'its flash over');
    mothNow(game(null), 15);
    assert.equal(MOTH.dark, null);
    assert.deepEqual(MOTH.back, { skill: 1, side: 'front', idx: 0 }, 'come back at the end of its time, it flashes too');
  } finally {
    UNIQUE_PLAY.moth = true;
  }
});
