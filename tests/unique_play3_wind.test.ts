// THE WINDCUTTER'S BLADE OF WIND IN PLAY (src/render/unique_fx.ts drawBlade; behind UNIQUE_PLAY.wind, off):
//   1. its switch is off; with it off, the Wave the build tells with the blade is not taken for its own;
//   2. drawn by its own code through a stand-in for the canvas, every way it flies and at every moment of its flight: only the air's
//      white and greys, his cyan on its edge, and its shadow's black (no pink, no gold); something there from the first moment;
//      spread wider in flight than as it leaves his sword; frayed thinner at the end.
//   run: node tools/unit.mjs --only unique_play3_wind

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { BLADE, UniqueFx } from '../src/render/unique_fx';
import { UNIQUE_PLAY } from '../src/render/unique_play';
import { AIR } from '../src/render/wild';
import type { Projectile } from '../src/game/state';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** The blade drawn once: every colour it laid, how many pixels, and how far across the screen it spreads. */
function draw(fx: number, fy: number, age: number, dist: number): { colours: Set<string>; n: number; wide: number } {
  const colours = new Set<string>();
  let n = 0;
  let lo = Infinity;
  let hi = -Infinity;
  const g = {
    globalAlpha: 1,
    fillStyle: '#000000',
    fillRect(x: number, _y: number, w: number): void {
      if (this.globalAlpha <= 0) return;
      colours.add(String(this.fillStyle).toLowerCase());
      n++;
      lo = Math.min(lo, x);
      hi = Math.max(hi, x + w);
    },
  };
  const p = { x: 0, y: 0, vx: fx * 15, vy: fy * 15, r: 0.8, age, dist } as unknown as Projectile;
  new UniqueFx().drawBlade(g as unknown as CanvasRenderingContext2D, { ox: 0, oy: 0 } as never, p, age);
  return { colours, n, wide: hi - lo };
}

test("1. the Windcutter's switch is on; with it off the build's Wave is its own", () => {
  assert.equal(UNIQUE_PLAY.wind, true, 'on: his yes, 12 Nov 2026');
  UNIQUE_PLAY.wind = false;
  try {
    const u = new UniqueFx();
    assert.equal(u.owns({ t: 'wave', x: 1, y: 1, dx: 1, dy: 0, w: 0.8, el: 'phys', words: [], echo: false } as never), false);
  } finally {
    UNIQUE_PLAY.wind = true;
  }
});

test('2. every way it flies, every moment: the air, his cyan, its shadow; there at once, wider in flight, frayed at the end', () => {
  const own = new Set([...AIR, BLADE.edge, '#000000'].map((c) => c.toLowerCase()));
  for (const [fx, fy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [0.6, -0.8], [-0.707, 0.707]]) {
    const first = draw(fx, fy, 0.005, 7);
    const mid = draw(fx, fy, 0.2, 4);
    const end = draw(fx, fy, 0.45, 0.4);
    for (const d of [first, mid, end]) for (const c of d.colours) assert.ok(own.has(c), `${fx},${fy}: ${c} is none of its colours`);
    assert.ok(first.n > 20, `${fx},${fy}: something there as it leaves his sword`);
    assert.ok(mid.n > first.n, `${fx},${fy}: more of it in flight than as it leaves`);
    assert.ok(end.n < mid.n, `${fx},${fy}: frayed thinner at the end`);
  }
});
