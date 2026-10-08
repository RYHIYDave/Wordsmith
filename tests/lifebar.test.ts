// Tests for src/render/lifebar.ts (Version 11.2): the hero's life as a bar over their head.
// The owner: "the health pool is hidden under my left thumb and is hard to see most of the time so
// I'll need a fix for that". The bar is there when it matters (a fight, a hurt hero, a moment after
// any change) and gone when it does not; the part just lost stays lit and then runs down.
//   run: tsx --test tests/lifebar.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { LIFE_BAR, LifeBar, barPixels } from '../src/render/lifebar';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const DT = 1 / 60;
/** Run the bar for some seconds with nothing changing. */
function run(b: LifeBar, seconds: number, frac: number, fight: boolean, gone = false): void {
  for (let t = 0; t < seconds - 1e-9; t += DT) b.update(frac, fight, gone, DT);
}
const near = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) <= eps;

test('at full life with nothing near there is no bar, however long it lasts', () => {
  const b = new LifeBar();
  run(b, 5, 1, false);
  assert.equal(b.alpha, 0);
  assert.equal(b.shown, 1);
  assert.equal(b.trail, 1);
});

test('the first frame of a character is not a change in life', () => {
  // (a character loaded at 60% life must not flash a trail from full)
  const b = new LifeBar();
  b.update(0.6, false, false, DT);
  assert.ok(near(b.shown, 0.6));
  assert.ok(near(b.trail, 0.6), 'no trail on the first frame');
});

test('a fight brings the bar in quickly, and it goes again when the fight is over', () => {
  const b = new LifeBar();
  run(b, 1, 1, false);
  run(b, LIFE_BAR.show + 0.02, 1, true);
  assert.equal(b.alpha, 1, `fully there after ${LIFE_BAR.show} s`);
  run(b, 3, 1, true);
  assert.equal(b.alpha, 1);
  run(b, LIFE_BAR.hide + 0.02, 1, false);
  assert.equal(b.alpha, 0, `gone ${LIFE_BAR.hide} s after the fight`);
});

test('a hurt hero keeps the bar, fight or no fight', () => {
  const b = new LifeBar();
  run(b, 1, 1, false);
  run(b, 20, 0.7, false);
  assert.equal(b.alpha, 1);
  assert.ok(near(b.shown, 0.7));
});

test('a blow leaves the lost life lit for a moment, then it runs down to what is left', () => {
  const b = new LifeBar();
  run(b, 1, 1, true);
  b.update(0.6, true, false, DT);
  assert.ok(near(b.shown, 0.6), 'the bar shows the life left at once');
  assert.ok(near(b.trail, 1), 'and what was there before as a trail');
  run(b, LIFE_BAR.trailWait - 2 * DT, 0.6, true);
  assert.ok(near(b.trail, 1), 'the trail waits before it moves');
  run(b, 0.1, 0.6, true);
  assert.ok(b.trail < 1 && b.trail > 0.6, `then runs down (${b.trail})`);
  run(b, 1, 0.6, true);
  assert.ok(near(b.trail, 0.6), 'to the life left, and no further');
});

test('a second blow while the trail is lit adds to it', () => {
  const b = new LifeBar();
  run(b, 1, 1, true);
  b.update(0.8, true, false, DT);
  run(b, 0.1, 0.8, true);
  b.update(0.5, true, false, DT);
  assert.ok(near(b.trail, 1), 'the trail still starts where the first blow began');
  assert.ok(near(b.shown, 0.5));
  // (and the wait begins again: the second blow is seen for as long as the first)
  run(b, LIFE_BAR.trailWait - 2 * DT, 0.5, true);
  assert.ok(near(b.trail, 1));
});

test('healing shows at once and leaves no trail', () => {
  const b = new LifeBar();
  run(b, 1, 0.4, false);
  b.update(0.9, false, false, DT);
  assert.ok(near(b.shown, 0.9));
  assert.ok(near(b.trail, 0.9));
});

test('healed to full out of a fight, the bar stays a moment and then goes', () => {
  const b = new LifeBar();
  run(b, 1, 0.5, false);
  assert.equal(b.alpha, 1);
  b.update(1, false, false, DT);
  run(b, LIFE_BAR.linger - 0.2, 1, false);
  assert.equal(b.alpha, 1, 'still there: the flask is seen to have worked');
  run(b, 0.2 + LIFE_BAR.hide + 0.05, 1, false);
  assert.equal(b.alpha, 0);
});

test('dead, or in town: no bar', () => {
  const b = new LifeBar();
  run(b, 1, 0.3, true);
  assert.equal(b.alpha, 1);
  run(b, LIFE_BAR.hide + 0.05, 0, true, true);
  assert.equal(b.alpha, 0);
});

test('nothing moves while the game is paused', () => {
  const b = new LifeBar();
  run(b, 1, 1, true);
  b.update(0.5, true, false, DT);
  const trail = b.trail;
  for (let i = 0; i < 600; i++) b.update(0.5, true, false, 0);
  assert.equal(b.trail, trail);
  assert.equal(b.alpha, 1);
});

test('low life is under three tenths, and the dead are not "low"', () => {
  const b = new LifeBar();
  run(b, 0.1, 0.31, true);
  assert.equal(b.low, false);
  b.update(0.29, true, false, DT);
  assert.equal(b.low, true);
  b.update(0, true, false, DT);
  assert.equal(b.low, false);
});

test('reset forgets everything (a new character)', () => {
  const b = new LifeBar();
  run(b, 1, 1, true);
  b.update(0.2, true, false, DT);
  b.reset();
  assert.equal(b.alpha, 0);
  b.update(1, false, false, DT);
  assert.equal(b.shown, 1);
  assert.equal(b.trail, 1, 'the old character\'s blow is not shown on the new one');
});

test('the bar never shows empty while there is life left, nor fuller than full', () => {
  assert.equal(barPixels(0, 24), 0);
  assert.equal(barPixels(-1, 24), 0);
  assert.equal(barPixels(0.001, 24), 1, 'a sliver of life is a pixel of bar');
  assert.equal(barPixels(0.5, 24), 12);
  assert.equal(barPixels(1, 24), 24);
  assert.equal(barPixels(1.7, 24), 24);
});

test('a share of life outside 0..1 is read as its nearest end', () => {
  const b = new LifeBar();
  b.update(1.4, false, false, DT);
  assert.equal(b.shown, 1);
  b.update(-0.2, true, false, DT);
  assert.equal(b.shown, 0);
});
