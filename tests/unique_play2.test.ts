// WHAT THE UNIQUE ITEMS SHOW IN PLAY, THE NEXT ONES (src/art/unique_play_art2.ts; laid in the game by src/render/unique_fx.ts,
// behind render/unique_play.ts UNIQUE_PLAY, off).
//   1. the Drowned Arm's switch is off;
//   2. THE DROWNED ARM: under the water before it comes up and after it is pulled under; up out of it in between, its root where
//      the water is; down across the floor as the blow lands (the rules' half a second: frame ARM.slam); every pixel whole;
//      its colours its flesh, its inside, its suckers, the black water and the ink: nothing cyan, pink or gold that glows;
//   3. its black water: there from the warning to the end, closing at the end; dark, never bright enough to read as a glow.
//   run: node tools/unit.mjs --only unique_play2

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { rgba } from '../src/engine/px';
import { INK } from '../src/art/kit';
import { ARM, ARM_FLESH, ARM_INSIDE, ARM_SUCKER, ARM_WATER, armLine, paintArm, paintArmPool } from '../src/art/unique_play_art2';
import { UNIQUE_PLAY } from '../src/render/unique_play';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

test("1. the Drowned Arm's switch is on", () => {
  assert.equal(UNIQUE_PLAY.arm, true);
});

test('2. THE DROWNED ARM: under, up, down across the floor as the blow lands, under again; its own colours only', () => {
  const own = new Set([...ARM_FLESH, ...ARM_INSIDE, ...ARM_SUCKER, ...ARM_WATER, INK, '#c6d09a'].map((c) => c.toLowerCase()));
  const top = (f: number): number => {
    const b = paintArm(f).bounds();
    return b ? ARM.ay - b.y : 0;
  };
  assert.equal(paintArm(0).bounds(), null, 'under the water at its warning');
  assert.equal(paintArm(ARM.frames - 1).bounds(), null, 'under the water at its end');
  assert.ok(top(10) > 80, `towering before it whips down (${top(10)} picture pixels up)`);
  assert.ok(top(ARM.slam) < 40, `down on the floor as the blow lands (${top(ARM.slam)} up)`);
  for (let f = 0; f < ARM.frames; f++) {
    const line = armLine(f);
    if (line) assert.ok(Math.hypot(line.pts[0][0] - ARM.ax, line.pts[0][1] - ARM.ay) < 1e-9, `frame ${f}: its root where it comes out of the water`);
    const p = paintArm(f);
    for (let i = 0; i < p.d.length; i += 4) {
      if (p.d[i + 3] === 0) continue;
      assert.equal(p.d[i + 3], 255, `frame ${f}: every pixel whole`);
      const c = `#${[p.d[i], p.d[i + 1], p.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
      assert.ok(own.has(c), `frame ${f}: ${c} is none of its own colours`);
    }
  }
});

test('3. its black water: from the warning to the end, closing; dark', () => {
  const size = (f: number): number => paintArmPool(f).px.bounds()?.w ?? 0;
  assert.ok(size(0) > 0 && size(0) < size(6), 'welling up from its warning');
  assert.ok(size(ARM.slam) >= size(6), 'all of it as the blow lands');
  assert.ok(size(ARM.frames - 1) < size(ARM.slam), 'closing at the end');
  for (const c of ARM_WATER) {
    const [r, g, b] = rgba(c);
    assert.ok(0.299 * r + 0.587 * g + 0.114 * b < 90, `${c}: dark water, never a glow`);
  }
});
