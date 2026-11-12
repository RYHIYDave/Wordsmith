// THE QUEEN'S TALONS' BIRD IN PLAY (src/art/unique_play_art2.ts paintTalonsBird, talonsAt; behind UNIQUE_PLAY.talons, off):
//   1. its switch is off;
//   2. her bird is her flock's vulture in her colours: no brown feather left, nothing of the enemy's fire, the friend's cyan edge
//      round it, every pixel whole or its edge;
//   3. its way: over him at first, on the enemy as the rules' blow lands (its floor point down), away after it, then gone.
//   run: node tools/unit.mjs --only unique_play2_talons

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RIM_ALPHA } from '../src/art/kit';
import { hueOf } from '../src/art/reflections';
import { BIRD_RIM, TALONS, paintTalonsBird, talonsAt } from '../src/art/unique_play_art2';
import { UNIQUE_PLAY } from '../src/render/unique_play';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

test("1. the Queen's Talons' switch is off", () => {
  assert.equal(UNIQUE_PLAY.talons, false);
});

test('2. her colours: no brown feather, nothing of the enemy\'s fire, the friend\'s edge round it', () => {
  const rim = [parseInt(BIRD_RIM.slice(1, 3), 16), parseInt(BIRD_RIM.slice(3, 5), 16), parseInt(BIRD_RIM.slice(5, 7), 16)];
  for (const [move, t, view] of [['dive', 0.3, 'front'], ['dive', 0.75, 'front'], ['dive', 1.0, 'back'], ['fly', 0.2, 'front']] as const) {
    const p = paintTalonsBird(move, t, view);
    let edge = 0;
    for (let i = 0; i < p.d.length; i += 4) {
      const a = p.d[i + 3];
      if (!a) continue;
      const [r, g, b] = [p.d[i], p.d[i + 1], p.d[i + 2]];
      if (a !== 255) {
        assert.ok(r === rim[0] && g === rim[1] && b === rim[2] && a === RIM_ALPHA, `${move} ${t} ${view}: a pixel neither whole nor its edge`);
        edge++;
        continue;
      }
      const { h, s } = hueOf(r, g, b);
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      assert.ok(!(r > 200 && s > 0.4 && (h > 300 || h < 60)), `${move} ${t} ${view}: the enemy's fire left at ${r},${g},${b}`);
      assert.ok(!(h >= 10 && h <= 50 && s > 0.16 && y < 120), `${move} ${t} ${view}: a brown feather left at ${r},${g},${b}`);
    }
    assert.ok(edge > 20, `${move} ${t} ${view}: the friend's edge round it`);
  }
});

test('3. its way: over him, on the enemy as the blow lands, away, gone', () => {
  const secs = 0.35;
  const a = talonsAt(0, secs);
  assert.ok(a && a.along === 0 && a.high === TALONS.high && a.move === 'dive', 'over him as it is called');
  const b = talonsAt(secs, secs);
  assert.ok(b && b.along === 1 && b.high === 0 && Math.abs(b.at - TALONS.hit) < 1e-9, 'on the enemy, its own blow, as the rules\' blow lands');
  const c = talonsAt(secs + (TALONS.end - TALONS.hit) + TALONS.away * 0.5, secs);
  assert.ok(c && c.along > 1 && c.high > 0 && c.move === 'fly' && c.alpha < 1, 'beating away, fading');
  assert.equal(talonsAt(secs + (TALONS.end - TALONS.hit) + TALONS.away + 0.01, secs), null, 'gone');
});
