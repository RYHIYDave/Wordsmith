// Tests for the two paintings behind the title (src/art/title.ts), the change from one to the other
// (src/art/title_morph.ts) and the small life drawn over them. The paintings are plain arrays until
// they are put on a canvas, so all of this runs here without a browser.
//   run: tsx --test tests/title.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { TITLE_GROUPS, TITLE_REST, TITLE_TURN, TitleLife, flatten, paintDream, paintReal, stackDream, stackReal, titleMorph, titleRound } from '../src/art/title';
import type { TitleStack } from '../src/art/title';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const W = 240;
const H = 160;

/**
 * The two paintings as they were on 4 Oct 2026, before they were taken apart into groups so that
 * one could turn into the other: a checksum of each picture's pixels. The change of Version 11
 * was not to alter a single pixel of either, and nothing since should by accident.
 *
 * If you change a painting ON PURPOSE, the first test fails and tells you the new sum to put here.
 */
const REAL_SUM = '48324480d360264e';
const DREAM_SUM = 'f848bb6ba6f30bcb';

/** Two different 32-bit sums of a buffer, as 16 hex digits. */
function checksum(d: Uint8ClampedArray): string {
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (let i = 0; i < d.length; i++) {
    a = Math.imul(a ^ d[i], 0x01000193);
    b = Math.imul((b << 5) | (b >>> 27), 0x85ebca6b) ^ (d[i] + i);
  }
  const hex = (v: number): string => (v >>> 0).toString(16).padStart(8, '0');
  return hex(a) + hex(b);
}

/** How many pixels of two pictures differ, and where the first of them is. */
function differ(a: Uint8ClampedArray, b: Uint8ClampedArray): { n: number; first: string } {
  let n = 0;
  let first = '';
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3]) continue;
    if (n === 0) first = `(${(i / 4) % W}, ${Math.floor(i / 4 / W)})`;
    n++;
  }
  return { n, first };
}

function same(a: Uint8ClampedArray, b: Uint8ClampedArray, what: string): void {
  const d = differ(a, b);
  assert.equal(d.n, 0, `${what}: ${d.n} pixels differ, the first at ${d.first}`);
}

// (painted once for all the tests: it takes a tenth of a second)
const real = stackReal();
const dream = stackDream();
const realPic = flatten(real).d;
const dreamPic = flatten(dream).d;

test('the two paintings are, pixel for pixel, what they were before they were taken apart', () => {
  assert.equal(paintReal().d.length, W * H * 4);
  assert.equal(checksum(paintReal().d), REAL_SUM, `the library has changed: its sum is now '${checksum(paintReal().d)}'`);
  assert.equal(checksum(paintDream().d), DREAM_SUM, `the dream has changed: its sum is now '${checksum(paintDream().d)}'`);
  // painting them again gives the same pictures (nothing is left over from one painting to the next)
  same(paintReal().d, realPic, 'the library, painted twice');
  same(paintDream().d, dreamPic, 'the dream, painted twice');
});

test('each painting is six groups that, laid over one another in order, are the painting', () => {
  assert.deepEqual([...TITLE_GROUPS], ['bg', 'big', 'objA', 'arms', 'objB', 'small']);
  for (const [name, stack, pic] of [['library', real, paintReal().d], ['dream', dream, paintDream().d]] as const) {
    assert.deepEqual(Object.keys(stack), [...TITLE_GROUPS], `the ${name}'s groups, back to front`);
    // laid over one another here, by the plainest rule there is: a pixel of a group in front hides what is behind it
    const out = new Uint8ClampedArray(W * H * 4);
    for (const g of TITLE_GROUPS) {
      const d = stack[g].d;
      assert.equal(d.length, W * H * 4);
      let painted = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        assert.equal(d[i + 3], 255, `${name}, ${g}: a pixel is either there or not (no half-clear pixels)`);
        painted++;
        out[i] = d[i];
        out[i + 1] = d[i + 1];
        out[i + 2] = d[i + 2];
        out[i + 3] = 255;
      }
      if (g === 'bg') assert.equal(painted, W * H, `${name}: what is behind fills the whole picture`);
      else assert.ok(painted > 100 && painted < W * H / 3, `${name}, ${g}: a group is a part of the picture (${painted} pixels)`);
    }
    same(out, pic, `the ${name}'s groups laid over one another`);
    same(flatten(stack).d, pic, `the ${name}, flattened`);
  }
});

test('the change begins as the library exactly and ends as the dream exactly, whichever way it is going', () => {
  const m = titleMorph(real, dream);
  const out = new Uint8ClampedArray(W * H * 4);
  for (const back of [false, true]) {
    const way = back ? 'on the way back' : 'on the way there';
    m.render(0, out, back);
    same(out, realPic, `at 0 ${way}`);
    m.render(1, out, back);
    same(out, dreamPic, `at 1 ${way}`);
    // outside 0..1 is the same as the nearer end
    m.render(-0.3, out, back);
    same(out, realPic, `before 0 ${way}`);
    m.render(1.7, out, back);
    same(out, dreamPic, `past 1 ${way}`);
    // and the first and last instants are still the paintings: nothing pops as a change begins or ends
    m.render(1e-6, out, back);
    same(out, realPic, `a moment from the library ${way}`);
    m.render(1 - 1e-6, out, back);
    same(out, dreamPic, `a moment from the dream ${way}`);
  }
});

test('part way, the picture is whole, is the same every time, and is neither painting', () => {
  const m = titleMorph(real, dream);
  const a = new Uint8ClampedArray(W * H * 4);
  const b = new Uint8ClampedArray(W * H * 4);
  for (const back of [false, true]) {
    for (const t of [0.2, 0.35, 0.5, 0.65, 0.8]) {
      m.render(t, a, back);
      for (let i = 3; i < a.length; i += 4) assert.equal(a[i], 255, `no holes at ${t}`);
      // (other pictures painted in between leave nothing behind)
      m.render(0.31, b, !back);
      m.render(t, b, back);
      same(a, b, `painted twice at ${t}`);
      assert.ok(differ(a, realPic).n > 50 && differ(a, dreamPic).n > 50, `at ${t} it is on its way`);
    }
    // it goes one way: more and more of it is the picture it is on its way to
    let last = -1;
    for (let k = 0; k <= 20; k++) {
      const t = back ? 1 - k / 20 : k / 20;
      m.render(t, a, back);
      const done = W * H - differ(a, back ? realPic : dreamPic).n;
      assert.ok(done >= last - 150, `it does not go back on itself (${last} -> ${done} at step ${k})`);
      last = done;
    }
    assert.equal(last, W * H);
  }
  // the way back is a change of its own (the library spreading from the lamp), not the way there run backwards
  m.render(0.5, a, false);
  m.render(0.5, b, true);
  assert.ok(differ(a, b).n > 2000, 'half way there and half way back are different pictures');
});

test('she changes first and the child last', () => {
  const m = titleMorph(real, dream);
  const out = new Uint8ClampedArray(W * H * 4);
  /** Of the pixels where `group` shows in `stack`'s picture (above row `above`), how many are that picture's in `out`? */
  const kept = (stack: TitleStack, pic: Uint8ClampedArray, group: 'big' | 'small', above = H): [number, number] => {
    const at = TITLE_GROUPS.indexOf(group);
    let all = 0;
    let ok = 0;
    for (let y = 0, i = 0; y < above; y++) {
      for (let x = 0; x < W; x++, i++) {
        let front = 0;
        TITLE_GROUPS.forEach((g, k) => {
          if (stack[g].d[i * 4 + 3] > 0) front = k;
        });
        if (front !== at) continue;
        all++;
        const o = i * 4;
        if (out[o] === pic[o] && out[o + 1] === pic[o + 1] && out[o + 2] === pic[o + 2]) ok++;
      }
    }
    return [ok, all];
  };
  // a quarter of the way there: the child has not begun to change, and she is well on her way
  m.render(0.25, out);
  let [ok, all] = kept(real, realPic, 'small');
  assert.equal(ok, all, 'the child is untouched a quarter of the way through');
  [ok, all] = kept(real, realPic, 'big', 60);
  assert.ok(ok < all * 0.9, `her head has begun to change by then (${ok} of ${all} pixels are still the librarian's)`);
  // four fifths of the way: she is the witch (her head and shoulders, clear of the brew), and the knight is not finished
  m.render(0.8, out);
  [ok, all] = kept(dream, dreamPic, 'big', 85);
  assert.equal(ok, all, 'she is wholly the witch four fifths of the way through');
  [ok, all] = kept(dream, dreamPic, 'small');
  assert.ok(ok < all, 'the knight is still arriving');
  // the far corners of the room are the last of all
  m.render(0.6, out);
  for (const i of [0, W - 1, (H - 1) * W, H * W - 1]) assert.equal(out[i * 4], realPic[i * 4], 'a corner is still the library at 60%');
});

test('getting ready comes in pieces, and makes no difference to the picture', () => {
  const pieces = titleMorph(real, dream);
  let n = 1;
  while (!pieces.warm()) n++;
  assert.ok(n >= 8 && n <= 20, `the work is spread over several pieces (${n})`);
  assert.equal(pieces.warm(), true, 'once ready, it stays ready');
  const a = new Uint8ClampedArray(W * H * 4);
  const b = new Uint8ClampedArray(W * H * 4);
  pieces.render(0.4, a);
  // asked for a picture before any of the getting ready has been done: it does it all then
  titleMorph(real, dream).render(0.4, b);
  same(a, b, 'made ready piece by piece, or all at once');
});

test('the round: it rests on each painting for 2 seconds and takes 2.2 over each change', () => {
  assert.equal(TITLE_REST, 2.0);
  assert.equal(TITLE_TURN, 2.2);
  const round = 2 * (TITLE_REST + TITLE_TURN);
  assert.ok(Math.abs(round - 8.4) < 1e-9);
  // at rest on the library, then on the dream
  for (const t of [0, 0.5, 1.99]) assert.deepEqual([titleRound(t).k, titleRound(t).back], [0, false]);
  for (const t of [4.21, 5, 6.19]) assert.deepEqual([titleRound(t).k, titleRound(t).back], [1, true]);
  // the change there rises all the way without a jump, and the change back falls
  let last = 0;
  for (let t = 2; t <= 4.2; t += 0.01) {
    const at = titleRound(t);
    assert.equal(at.back, false);
    assert.ok(at.k >= last && at.k - last < 0.02, `it rises evenly (${last} -> ${at.k} at ${t.toFixed(2)})`);
    last = at.k;
  }
  assert.ok(last > 0.99);
  last = 1;
  for (let t = 6.2; t < 8.4; t += 0.01) {
    const at = titleRound(t);
    assert.equal(at.back, true);
    assert.ok(at.k <= last && last - at.k < 0.02);
    last = at.k;
  }
  assert.ok(last < 0.01);
  // it comes round again
  for (const t of [0.3, 2.7, 3.9, 5.5, 7.1]) {
    assert.ok(Math.abs(titleRound(t + round).k - titleRound(t).k) < 1e-9);
    assert.ok(Math.abs(titleRound(t + 5 * round).k - titleRound(t).k) < 1e-9);
  }
  // `lead` counts down to the next change, and is 0 or less once it has begun
  assert.ok(Math.abs(titleRound(1.5).lead - 0.5) < 1e-9);
  assert.ok(Math.abs(titleRound(2.25).lead + 0.25) < 1e-9);
  assert.ok(Math.abs(titleRound(6.0).lead - 0.2) < 1e-9);
});

test('the life: worked out from the time alone, inside the picture, small, and never over the small figure', () => {
  const life = new TitleLife(real, dream);
  type Dot = [number, number, string, number, number, number];
  const dots = (t: number, k: number): Dot[] => {
    const out: Dot[] = [];
    life.draw(t, k, (x, y, color, a, w = 1, h = 1) => out.push([x, y, color, a, w, h]));
    return out;
  };
  let moved = 0;
  for (const [k, stack, name] of [[0, real, 'library'], [1, dream, 'dream']] as const) {
    let before = '';
    for (let step = 0; step < 60; step++) {
      const t = 0.3 + step * 0.173;
      const now = dots(t, k);
      // asked again, or after other moments have been asked for: the same dots
      dots(t + 3.1, 1 - k);
      assert.deepEqual(dots(t, k), now, `the ${name}'s life at ${t.toFixed(2)} s is the same whenever it is asked for`);
      assert.ok(now.length > 5, `there is life in the ${name} (${now.length} dots)`);
      assert.ok(now.length < 900, `but not a blizzard of it (${now.length} dots)`);
      for (const [x, y, color, a, w, h] of now) {
        assert.ok(Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(w) && Number.isInteger(h), 'whole pixels');
        assert.ok(x >= 0 && y >= 0 && w >= 1 && h >= 1 && x + w <= W && y + h <= H, `inside the picture (${x}, ${y}, ${w} x ${h})`);
        assert.ok(a > 0 && a <= 1 && /^#[0-9a-f]{6}$/.test(color));
        for (let yy = y; yy < y + h; yy++) {
          for (let xx = x; xx < x + w; xx++) assert.equal(stack.small.has(xx, yy), false, `nothing is drawn over the small figure (${xx}, ${yy})`);
        }
      }
      const key = JSON.stringify(now);
      if (key !== before) moved++;
      before = key;
    }
  }
  assert.ok(moved > 110, `it moves (${moved} of 120 moments differ from the one before)`);
  // each picture's life comes and goes with the picture: none in the middle of a change, and fainter near it
  assert.equal(dots(1, 0.5).length, 0);
  assert.equal(dots(1, 0.25).length, 0);
  const full = dots(1, 0);
  const half = dots(1, 0.1);
  assert.equal(half.length, full.length);
  full.forEach((d, i) => assert.ok(Math.abs(half[i][3] - d[3] / 2) < 1e-9, 'half as strong when the picture is a tenth of the way gone'));
  // on a see-through sheet: clear where there is no life, and left alone when there is none at all
  const sheet = new Uint8ClampedArray(W * H * 4);
  assert.equal(life.paint(1, 1, sheet), true);
  let lit = 0;
  for (let i = 3; i < sheet.length; i += 4) if (sheet[i] > 0) lit++;
  assert.ok(lit > 50 && lit < 3000, `the sheet holds the life and nothing else (${lit} pixels)`);
  sheet.fill(7);
  assert.equal(life.paint(1, 0.5, sheet), false);
  assert.equal(sheet[0], 7);
});
