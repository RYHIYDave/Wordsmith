// Tests for src/art/morph.ts: one painting turning into another, shape by shape (the title
// screen of Version 11). Everything there is arithmetic on plain arrays, so it is all checked here.
//   run: tsx --test tests/morph.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { boxAround, comeAndGo, ditherAt, fadeInto, layerOf, morphInto, nearest, shapeOf, smooth, spreadField, spreadInto, sweepOrder, wobbleField } from '../src/art/morph';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const W = 48;
const H = 40;
const INK = [14, 12, 36];

/** A layer with a filled box of one colour, and a dark line round it (as the paintings' parts have). */
function box(x0: number, y0: number, x1: number, y1: number, c: readonly number[], lined = true): Uint8ClampedArray {
  const d = new Uint8ClampedArray(W * H * 4);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const edge = lined && (x === x0 || x === x1 || y === y0 || y === y1);
      const o = (y * W + x) * 4;
      const v = edge ? INK : c;
      d[o] = v[0];
      d[o + 1] = v[1];
      d[o + 2] = v[2];
      d[o + 3] = 255;
    }
  }
  return d;
}

function count(d: Uint8ClampedArray): number {
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
}

function rnd(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('nearest: every pixel is told the nearest marked pixel, or very nearly', () => {
  const r = rnd(7);
  let checked = 0;
  let exact = 0;
  for (let round = 0; round < 12; round++) {
    const is = new Uint8Array(W * H);
    const marks: [number, number][] = [];
    const n = 1 + Math.floor(r() * 9);
    for (let k = 0; k < n; k++) {
      const x = Math.floor(r() * W);
      const y = Math.floor(r() * H);
      is[y * W + x] = 1;
      marks.push([x, y]);
    }
    const near = nearest(is, W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let best = Infinity;
        for (const [mx, my] of marks) best = Math.min(best, Math.hypot(x - mx, y - my));
        const f = near[y * W + x];
        assert.ok(f >= 0 && is[f] === 1, 'it names a marked pixel');
        const got = Math.hypot(x - (f % W), y - Math.floor(f / W));
        assert.ok(got <= best + 0.75, `(${x}, ${y}): found one ${got.toFixed(2)} away, the nearest is ${best.toFixed(2)}`);
        checked++;
        if (got <= best + 1e-6) exact++;
      }
    }
  }
  assert.ok(exact / checked > 0.985, `nearly always exactly right (${((exact / checked) * 100).toFixed(2)}%)`);
  // nothing marked: nothing found
  assert.ok(nearest(new Uint8Array(W * H), W, H).every((v) => v === -1));
});

test('a shape knows its inside from its outside, its rim, and where each pixel takes its colour from', () => {
  const s = shapeOf(box(10, 8, 30, 25, [200, 60, 60]), W, H);
  assert.equal(s.empty, false);
  assert.deepEqual([s.x0, s.y0, s.x1, s.y1], [10, 8, 30, 25]);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const inside = x >= 10 && x <= 30 && y >= 8 && y <= 25;
      assert.equal(s.dist[i] < 0, inside, `(${x}, ${y})`);
      const rim = inside && (x === 10 || x === 30 || y === 8 || y === 25);
      assert.equal(s.rim[i] === 1, rim);
      const f = s.src[i];
      const fx = f % W;
      const fy = Math.floor(f / W);
      assert.ok(fx > 10 && fx < 30 && fy > 8 && fy < 25, 'the colour comes from inside the dark line');
      if (inside && !rim) assert.equal(f, i, 'a pixel properly inside is its own source');
    }
  }
  // distance: one pixel in from the edge is 1 deep, the middle is deepest, far away is far
  assert.ok(Math.abs(s.dist[8 * W + 10] + 1) < 1e-6);
  assert.ok(s.dist[16 * W + 20] < -8);
  assert.ok(Math.abs(s.dist[16 * W + 40] - 10) < 1e-6);
  const none = shapeOf(new Uint8ClampedArray(W * H * 4), W, H);
  assert.equal(none.empty, true);
});

test('a morph begins as the first layer exactly, ends as the second exactly, and grows evenly between', () => {
  const small = box(20, 16, 27, 23, [200, 60, 60]);
  const big = box(6, 5, 41, 34, [60, 200, 90]);
  const a = shapeOf(small, W, H);
  const b = shapeOf(big, W, H);
  const at = (t: number): Uint8ClampedArray => {
    const out = new Uint8ClampedArray(W * H * 4);
    morphInto(out, a, b, t, INK);
    return out;
  };
  assert.deepEqual(Array.from(at(0)), Array.from(small));
  assert.deepEqual(Array.from(at(1)), Array.from(big));
  // the very first and last moments are still the paintings: nothing pops
  assert.deepEqual(Array.from(at(0.0001)), Array.from(small));
  assert.deepEqual(Array.from(at(0.9999)), Array.from(big));
  let last = count(small);
  for (let k = 1; k <= 20; k++) {
    const frame = at(k / 20);
    const n = count(frame);
    assert.ok(n >= last, `the shape only grows (${last} -> ${n} at ${k / 20})`);
    last = n;
    // no invented colours: each pixel is one of the two layers' colours, or the dark line
    for (let i = 0; i < frame.length; i += 4) {
      if (frame[i + 3] === 0) continue;
      const key = `${frame[i]},${frame[i + 1]},${frame[i + 2]}`;
      assert.ok(key === '200,60,60' || key === '60,200,90' || key === INK.join(','), `colour ${key}`);
    }
  }
  assert.equal(last, count(big));
  // half way: a box about half way between the two, with a dark line all round it
  const mid = at(0.5);
  const n = count(mid);
  assert.ok(n > count(small) * 2 && n < count(big) * 0.8, `half way it is in between (${n})`);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const o = (y * W + x) * 4;
      if (mid[o + 3] === 0) continue;
      const edge = mid[o - 4 + 3] === 0 || mid[o + 4 + 3] === 0 || mid[o - W * 4 + 3] === 0 || mid[o + W * 4 + 3] === 0;
      if (edge) assert.deepEqual([mid[o], mid[o + 1], mid[o + 2]], INK, `the edge at (${x}, ${y}) is the dark line`);
    }
  }
  // the colours change over the middle: early it is all the first layer's, late all the second's
  const tones = (frame: Uint8ClampedArray): [number, number] => {
    let red = 0;
    let green = 0;
    for (let i = 0; i < frame.length; i += 4) {
      if (frame[i + 3] === 0) continue;
      if (frame[i] === 200) red++;
      if (frame[i + 1] === 200) green++;
    }
    return [red, green];
  };
  assert.equal(tones(at(0.1))[1], 0);
  assert.equal(tones(at(0.9))[0], 0);
  const [red, green] = tones(mid);
  assert.ok(red > 0 && green > 0 && Math.abs(red - green) < (red + green) * 0.2, `half and half in the middle (${red} / ${green})`);
});

test('a layer with no partner fades in and out through the dither', () => {
  const only = box(12, 10, 35, 30, [90, 90, 220], false);
  const a = shapeOf(only, W, H);
  const none = shapeOf(new Uint8ClampedArray(W * H * 4), W, H);
  const at = (t: number, out = new Uint8ClampedArray(W * H * 4)): Uint8ClampedArray => {
    morphInto(out, a, none, t, INK);
    return out;
  };
  assert.equal(count(at(0)), count(only));
  assert.equal(count(at(1)), 0);
  let last = count(only);
  for (let k = 1; k <= 16; k++) {
    const n = count(at(k / 16));
    assert.ok(n <= last);
    last = n;
  }
  const half = count(at(0.5));
  assert.ok(Math.abs(half - count(only) / 2) < count(only) * 0.1, `about half of it half way (${half})`);
  // and the other way round it fades in
  const back = new Uint8ClampedArray(W * H * 4);
  morphInto(back, none, a, 0.75, INK);
  assert.ok(Math.abs(count(back) - count(only) * 0.75) < count(only) * 0.1);
  // what lies behind is left alone where the layer is not painted
  const behind = new Uint8ClampedArray(W * H * 4).fill(77);
  at(0.5, behind);
  assert.equal(behind[0], 77);
});

test('a ground changes from the middle outward, and is one picture or the other at the ends', () => {
  const a = new Uint8ClampedArray(W * H * 4).fill(40);
  const b = new Uint8ClampedArray(W * H * 4).fill(180);
  for (let i = 3; i < a.length; i += 4) a[i] = b[i] = 255;
  const field = spreadField(W, H, 24, 20);
  const out = new Uint8ClampedArray(W * H * 4);
  spreadInto(out, a, b, field, 0, [255, 255, 255]);
  assert.deepEqual(Array.from(out), Array.from(a));
  spreadInto(out, a, b, field, 1, [255, 255, 255]);
  assert.deepEqual(Array.from(out), Array.from(b));
  const changed = (t: number): number => {
    spreadInto(out, a, b, field, t, [255, 255, 255]);
    let n = 0;
    for (let i = 0; i < out.length; i += 4) if (out[i] !== 40) n++;
    return n;
  };
  let last = 0;
  for (let k = 1; k < 20; k++) {
    const n = changed(k / 20);
    assert.ok(n >= last, 'the change only spreads');
    last = n;
  }
  assert.equal(changed(0.999), W * H);
  // the middle goes first, the corners last
  spreadInto(out, a, b, field, 0.35, [255, 255, 255]);
  assert.ok(out[(20 * W + 24) * 4] !== 40, 'the middle has changed');
  assert.equal(out[0], 40, 'the corner has not');
  // the front is lit: some pixels are brighter than either picture
  let lit = 0;
  for (let i = 0; i < out.length; i += 4) if (out[i] > 180) lit++;
  assert.ok(lit > 10, `a line of light rides the front (${lit} pixels)`);
});

test('the dither and the easing are what the morph takes them to be', () => {
  const seen = new Set<number>();
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) seen.add(ditherAt(x, y));
  assert.equal(seen.size, 16);
  for (const v of seen) assert.ok(v > 0 && v < 1);
  assert.equal(ditherAt(5, 9), ditherAt(1, 1));
  assert.equal(smooth(-1), 0);
  assert.equal(smooth(0.5), 0.5);
  assert.equal(smooth(2), 1);
});

test('a layer knows the box that holds it, and two boxes the box that holds them both', () => {
  const l = layerOf(box(10, 8, 30, 25, [200, 60, 60]), W, H);
  assert.deepEqual([l.empty, l.x0, l.y0, l.x1, l.y1], [false, 10, 8, 30, 25]);
  const none = layerOf(new Uint8ClampedArray(W * H * 4), W, H);
  assert.equal(none.empty, true);
  assert.ok(none.x1 < none.x0, 'the box of an empty layer holds nothing');
  assert.deepEqual(boxAround(l, { x0: 2, y0: 20, x1: 12, y1: 33 }), { x0: 2, y0: 8, x1: 30, y1: 33 });
  // an empty layer adds nothing to a box
  assert.deepEqual(boxAround(l, none), { x0: 10, y0: 8, x1: 30, y1: 25 });
  assert.deepEqual(boxAround(none, l), { x0: 10, y0: 8, x1: 30, y1: 25 });
});

test('a shape worked out only in the room of its morph is the same shape there', () => {
  const r = rnd(11);
  for (let round = 0; round < 6; round++) {
    // a few overlapping boxes: a shape with corners, notches and perhaps a hole
    const d = new Uint8ClampedArray(W * H * 4);
    for (let k = 0; k < 4; k++) {
      const x0 = 8 + Math.floor(r() * 18);
      const y0 = 8 + Math.floor(r() * 12);
      const one = box(x0, y0, x0 + 3 + Math.floor(r() * 12), y0 + 3 + Math.floor(r() * 10), [60 + k * 40, 200, 90]);
      for (let i = 0; i < one.length; i += 4) if (one[i + 3] > 0) d.set(one.subarray(i, i + 4), i);
    }
    const whole = shapeOf(d, W, H);
    const room = boxAround(whole, { x0: 4, y0: 3, x1: 40, y1: 30 });
    const part = shapeOf(d, W, H, room);
    assert.deepEqual([part.x0, part.y0, part.x1, part.y1], [whole.x0, whole.y0, whole.x1, whole.y1]);
    for (let y = room.y0; y <= room.y1; y++) {
      for (let x = room.x0; x <= room.x1; x++) {
        const i = y * W + x;
        assert.equal(part.dist[i] < 0, whole.dist[i] < 0, `inside or outside at (${x}, ${y})`);
        assert.ok(Math.abs(part.dist[i] - whole.dist[i]) < 0.75, `the same distance at (${x}, ${y}): ${part.dist[i]} / ${whole.dist[i]}`);
        assert.equal(part.rim[i], whole.rim[i]);
        // the colour comes from a pixel of the shape, and from itself if it is properly inside
        const f = part.src[i];
        assert.ok(f >= 0 && d[f * 4 + 3] > 0, 'its colour comes from a painted pixel');
        if (part.dist[i] < 0 && !part.rim[i]) assert.equal(f, i);
      }
    }
    // outside the room it is simply far away
    assert.ok(part.dist[0] > 1000);
    assert.equal(part.src[0], -1);
  }
});

test('where a shape grows past itself, it takes its colour from well inside, not from a detail on its edge', () => {
  // a red box with one bright pixel just inside its dark line, like an earring at the edge of a face
  const d = box(10, 8, 30, 25, [200, 60, 60]);
  const spot = (16 * W + 11) * 4;
  d.set([250, 250, 250, 255], spot);
  const s = shapeOf(d, W, H);
  for (let y = 12; y <= 20; y++) {
    for (let x = 2; x <= 9; x++) {
      const f = s.src[y * W + x] * 4;
      assert.deepEqual([d[f], d[f + 1], d[f + 2]], [200, 60, 60], `left of the box at (${x}, ${y}) the colour is the box's, not the spot's`);
    }
  }
  // the dark line itself takes the body's colour too, once it is no longer the edge
  const f = s.src[16 * W + 10] * 4;
  assert.deepEqual([d[f], d[f + 1], d[f + 2]], [200, 60, 60]);
  // (a shape too thin to have a body falls back on whatever it has)
  const thin = shapeOf(box(10, 8, 12, 25, [200, 60, 60]), W, H);
  assert.ok(thin.src[16 * W + 20] >= 0);
});

test('a change can sweep through a shape: the outline flows where the sweep has reached, and the colours follow', () => {
  const tall = box(18, 4, 29, 35, [200, 60, 60]);
  const wide = box(4, 14, 43, 25, [60, 200, 90]);
  const a = shapeOf(tall, W, H);
  const b = shapeOf(wide, W, H);
  // the change sweeps from the left edge of the picture to the right
  const order = sweepOrder(a, b, (x) => x);
  for (let y = 4; y <= 35; y++) {
    for (let x = 4; x <= 43; x++) assert.ok(order[y * W + x] >= 0 && order[y * W + x] <= 1);
  }
  assert.equal(order[20 * W + 4], 0);
  assert.equal(order[20 * W + 43], 1);
  assert.ok(order[20 * W + 20] > order[20 * W + 10], 'further right is later');
  const at = (t: number): Uint8ClampedArray => {
    const out = new Uint8ClampedArray(W * H * 4);
    morphInto(out, a, b, t, INK, order);
    return out;
  };
  // exact at both ends, and at the instants next to them
  assert.deepEqual(Array.from(at(0)), Array.from(tall));
  assert.deepEqual(Array.from(at(1)), Array.from(wide));
  assert.deepEqual(Array.from(at(0.0001)), Array.from(tall));
  assert.deepEqual(Array.from(at(0.9999)), Array.from(wide));
  const col = (frame: Uint8ClampedArray, x: number, y: number): string => {
    const o = (y * W + x) * 4;
    return frame[o + 3] === 0 ? 'none' : frame[o] === 200 ? 'red' : frame[o + 1] === 200 ? 'green' : 'ink';
  };
  for (let k = 1; k < 20; k++) {
    const frame = at(k / 20);
    for (let i = 0; i < frame.length; i += 4) {
      if (frame[i + 3] === 0) continue;
      const key = `${frame[i]},${frame[i + 1]},${frame[i + 2]}`;
      assert.ok(key === '200,60,60' || key === '60,200,90' || key === INK.join(','), `no invented colours (${key})`);
    }
  }
  // Half way through, the left of the picture has changed and the right has not begun:
  const mid = at(0.5);
  // on the left the wide box has arrived, in its own colour, where the tall one never was
  assert.equal(col(mid, 8, 20), 'green', 'the left end of the wide box is there');
  // on the right the tall box still stands in its own colour, well above and below where the wide one will be
  assert.equal(col(mid, 28, 12), 'red', 'the tall box, to the right, is still there above');
  assert.equal(col(mid, 28, 27), 'red', 'and below');
  // though it is already drawing in toward the wide one (its top was at row 4)
  assert.equal(col(mid, 24, 5), 'none', 'the top of the tall box has begun to sink');
  // and the right end of the wide box has not arrived
  assert.equal(col(mid, 40, 20), 'none');
  // the new colour has come only as far as the sweep has, and the old is gone where it has long passed
  let greens = 0;
  let reds = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = col(mid, x, y);
      if (c === 'green') {
        greens++;
        assert.ok(x < 30, `the new colour has only come as far as the sweep (${x})`);
      } else if (c === 'red') {
        reds++;
        assert.ok(x > 12, `the old colour is gone where the sweep has long passed (${x})`);
      }
    }
  }
  assert.ok(greens > 40 && reds > 40, `both are there half way (${greens} new, ${reds} old)`);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const o = (y * W + x) * 4;
      if (mid[o + 3] === 0) continue;
      const edge = mid[o - 4 + 3] === 0 || mid[o + 4 + 3] === 0 || mid[o - W * 4 + 3] === 0 || mid[o + W * 4 + 3] === 0;
      if (edge) assert.equal(col(mid, x, y), 'ink', `the edge at (${x}, ${y}) is the dark line`);
    }
  }
});

test('a thing with no partner comes and goes with the sweep', () => {
  const only = layerOf(box(6, 10, 41, 30, [90, 90, 220], false), W, H);
  const none = layerOf(new Uint8ClampedArray(W * H * 4), W, H);
  const order = sweepOrder(only, none, (x) => x);
  const at = (t: number, coming: boolean, o?: Float32Array): Uint8ClampedArray => {
    const out = new Uint8ClampedArray(W * H * 4);
    comeAndGo(out, only, t, coming, o);
    return out;
  };
  // going: all there at 0, gone at 1; coming: the other way round
  assert.equal(count(at(0, false, order)), count(only.d));
  assert.equal(count(at(1, false, order)), 0);
  assert.equal(count(at(0, true, order)), 0);
  assert.equal(count(at(1, true, order)), count(only.d));
  // half way through a sweep from the left: the left of it has gone (or has come), the right has not
  const going = at(0.5, false, order);
  const coming = at(0.5, true, order);
  assert.equal(going[(20 * W + 8) * 4 + 3], 0, 'going: the left has gone');
  assert.equal(going[(20 * W + 39) * 4 + 3], 255, 'going: the right is still there');
  assert.equal(coming[(20 * W + 8) * 4 + 3], 255, 'coming: the left has come');
  assert.equal(coming[(20 * W + 39) * 4 + 3], 0, 'coming: the right has not');
  // what has gone and what has come are the same pixels: together they are the whole thing
  assert.equal(count(going) + count(coming), count(only.d));
  // it only ever goes one way
  let last = count(only.d);
  for (let k = 1; k <= 20; k++) {
    const n = count(at(k / 20, false, order));
    assert.ok(n <= last);
    last = n;
  }
  // with no order it is the plain fade through the dither
  const plain = new Uint8ClampedArray(W * H * 4);
  fadeInto(plain, only, 0.25);
  assert.deepEqual(Array.from(at(0.75, false)), Array.from(plain));
  assert.deepEqual(Array.from(at(0.25, true)), Array.from(plain));
});

test('the noise that makes a spreading edge uneven is smooth, modest, and the same every time', () => {
  const a = wobbleField(W, H);
  const b = wobbleField(W, H);
  assert.deepEqual(Array.from(a), Array.from(b));
  let lo = Infinity;
  let hi = -Infinity;
  let step = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = a[y * W + x];
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
      if (x > 0) step = Math.max(step, Math.abs(v - a[y * W + x - 1]));
      if (y > 0) step = Math.max(step, Math.abs(v - a[(y - 1) * W + x]));
    }
  }
  assert.ok(lo >= -1 && hi <= 1, `it stays within -1..1 (${lo.toFixed(2)} .. ${hi.toFixed(2)})`);
  assert.ok(hi - lo > 0.8, 'it is not flat');
  assert.ok(step < 0.3, `it has no jumps from one pixel to the next (${step.toFixed(2)})`);
  // a ground's lateness made with it runs from 0 at the middle to 1 at the furthest corner, whatever the noise
  const f = spreadField(W, H, 24, 20, a);
  for (const v of f) assert.ok(v >= 0 && v <= 1);
  assert.ok(f[20 * W + 24] < 0.3 && f[W * H - 1] > 0.8);
});

test('a part only one shape has changes with the nearest part both have', () => {
  // a head, and the same head with a brim sticking out to the right
  const head = layerOf(box(10, 10, 24, 30, [200, 60, 60]), W, H);
  const hat = new Uint8ClampedArray(box(10, 10, 24, 30, [60, 200, 90]));
  const brim = box(25, 18, 42, 22, [60, 200, 90]);
  for (let i = 0; i < brim.length; i += 4) if (brim[i + 3] > 0) hat.set(brim.subarray(i, i + 4), i);
  const hatted = layerOf(hat, W, H);
  // the change sweeps from left to right
  const together = sweepOrder(head, hatted, (x) => x);
  const apart = sweepOrder(head, hatted, (x) => x, false);
  // inside the head, which both have, a pixel changes by where it is, either way
  for (let x = 10; x <= 24; x++) {
    assert.ok(Math.abs(together[20 * W + x] - (x - 10) / 14) < 1e-6);
    assert.ok(Math.abs(apart[20 * W + x] - (x - 10) / 32) < 1e-6);
  }
  // the whole brim takes the lateness of the edge of the head it grows from, so it goes as one with it...
  for (let x = 25; x <= 42; x++) assert.equal(together[20 * W + x], together[20 * W + 24], `the brim at ${x}`);
  // ...where, left to itself, its tip would be the last thing of all to change
  assert.equal(apart[20 * W + 42], 1);
  assert.ok(apart[20 * W + 42] > apart[20 * W + 26]);
  // (and the head, having nothing later than its own edge, now runs all the way to 1)
  assert.equal(together[20 * W + 24], 1);
  // two layers with nothing in common fall back on where each pixel is
  const far = layerOf(box(30, 4, 40, 9, [60, 200, 90]), W, H);
  const lone = sweepOrder(head, far, (x) => x);
  assert.equal(lone[20 * W + 10], 0);
  assert.equal(lone[6 * W + 40], 1);
});
