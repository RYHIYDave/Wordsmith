// The picture behind the wordsmith's start screen (src/art/title_smith2.ts: the old skald leaning
// over us, seen from the floor) and the life drawn over it. The picture is a plain array until it
// is put on a canvas, so this runs here without a browser.
//   run: tsx --test tests/titlesmith2.test.ts
//
// What the owner asked of it (5 Oct 2026): "just the wordsmith ... At his forge table, same angle
// from below looking up. Same sort of living style ... the full screen"; of the sketch it is
// painted from, "6 is fantastic", and then "give me more of the 12 lean with braziers and no
// braziers" and "maybe some other luminescent options". Then, at 20:26: "I like 22. And get the
// runes to light up in succession so it looks like power is running up and down and along the
// table. Have them run left to right, right to left, then meet in the middle and back out to the
// end of the table. The walls just go up and down. And the whole top pulses and illuminates the
// smith's face"; and at 20:29: "we want to see him breathing with shoulders kinda raising up
// every breath". And a rule of the game's look that the picture must keep: what glows of a friend
// is the word's cyan; the only warm light is an honest fire.

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import {
  SMITH2_BEAT, SMITH2_BREATH, SMITH2_CHOSEN, SMITH2_CYCLE, SMITH2_EYES, SMITH2_FIRES, SMITH2_H, SMITH2_HEAD_TOP, SMITH2_LIP, SMITH2_PLAIN, SMITH2_RUN, SMITH2_STONE, SMITH2_W,
  SMITH2_WORD, paintSmith2, smith2Breath, smith2Life, smith2Power, smith2Pulse,
} from '../src/art/title_smith2';
import type { Smith2Look } from '../src/art/title_smith2';
import { rgba } from '../src/engine/px';

const W = SMITH2_W;
const H = SMITH2_H;
const GLOWS: (keyof Smith2Look)[] = ['braziers', 'runes', 'lanterns', 'rising', 'moon', 'veins'];
const plain = paintSmith2();

const at = (d: Uint8ClampedArray, x: number, y: number): [number, number, number, number] => {
  const i = (y * W + x) * 4;
  return [d[i], d[i + 1], d[i + 2], d[i + 3]];
};
/** Is this colour the word's (cyan, or the white of its heart): more blue and green in it than red? */
const cold = (c: readonly number[]): boolean => c[1] >= c[0] && c[2] >= c[0];
/** Is it a warm light: a good deal more red than blue? */
const warm = (c: readonly number[]): boolean => c[0] > 150 && c[0] > c[2] + 60;

test('the picture is whole: every pixel painted, and it sinks into the dark at its top, its sides and its foot', () => {
  const d = plain.px.d;
  assert.equal(d.length, W * H * 4);
  for (let i = 3; i < d.length; i += 4) assert.equal(d[i], 255, `pixel ${(i - 3) / 4} is painted`);
  const night = rgba('#05040f');
  for (let x = 0; x < W; x += 7) {
    assert.deepEqual(at(d, x, 0).slice(0, 3), [night[0], night[1], night[2]], `the top row at ${x} is the dark`);
    assert.deepEqual(at(d, x, H - 1).slice(0, 3), [night[0], night[1], night[2]], `the bottom row at ${x} is the dark`);
  }
  for (let y = 0; y < H; y += 7) {
    assert.deepEqual(at(d, 0, y).slice(0, 3), [night[0], night[1], night[2]], `the left edge at ${y} is the dark`);
    assert.deepEqual(at(d, W - 1, y).slice(0, 3), [night[0], night[1], night[2]], `the right edge at ${y} is the dark`);
  }
});

test('he is where the start screen is told he is: his eyes, the stone on his brow, the top of his head over the table', () => {
  const d = plain.px.d;
  for (const [ex, ey] of SMITH2_EYES) {
    const c = at(d, ex, ey);
    assert.ok(cold(c) && c[2] > 180, `an eye at (${ex}, ${ey}) is alight with the word's colour (${c})`);
  }
  assert.ok(Math.abs(SMITH2_EYES[0][0] + SMITH2_EYES[1][0] - (W - 1)) <= 1, 'his eyes are either side of the middle of the picture');
  const stone = at(d, SMITH2_STONE[0], SMITH2_STONE[1]);
  assert.ok(cold(stone) && stone[2] > 180, `the stone on his brow is alight (${stone})`);
  assert.ok(SMITH2_HEAD_TOP < SMITH2_EYES[0][1] && SMITH2_EYES[0][1] < SMITH2_LIP, 'his eyes are between the top of his head and the table');
  assert.ok(SMITH2_LIP - SMITH2_HEAD_TOP <= 132, `he and the name of the game over him fit a phone held sideways (${SMITH2_LIP - SMITH2_HEAD_TOP} rows of him)`);
  assert.ok(SMITH2_WORD[1] < SMITH2_LIP && SMITH2_WORD[1] > SMITH2_EYES[0][1], 'the word stands on the table, under his face');
});

test('with nothing else alight, nothing in the picture is a warm light: what glows of his is the word\'s colour', () => {
  const d = plain.px.d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (warm([d[i], d[i + 1], d[i + 2]])) n++;
  assert.equal(n, 0, 'warm pixels');
});

test('each of the other lights paints, changes the picture, and only the braziers bring a warm one', () => {
  for (const g of GLOWS) {
    const lit = paintSmith2({ ...SMITH2_PLAIN, [g]: true });
    let differ = 0;
    let warmth = 0;
    for (let i = 0; i < lit.px.d.length; i += 4) {
      if (lit.px.d[i] !== plain.px.d[i] || lit.px.d[i + 1] !== plain.px.d[i + 1] || lit.px.d[i + 2] !== plain.px.d[i + 2]) differ++;
      if (warm([lit.px.d[i], lit.px.d[i + 1], lit.px.d[i + 2]])) warmth++;
      assert.equal(lit.px.d[i + 3], 255);
    }
    // (runes rising are only in the life: the still is the plain one)
    if (g === 'rising') assert.equal(differ, 0, 'rising: the still picture is the plain one');
    else assert.ok(differ > 200, `${g}: the picture is changed by it (${differ} pixels)`);
    if (g === 'braziers') assert.ok(warmth > 20, `the braziers are a warm light (${warmth} pixels)`);
    else assert.equal(warmth, 0, `${g}: no warm light`);
    // his eyes keep their own light whatever else is lit
    for (const [ex, ey] of SMITH2_EYES) assert.ok(cold(at(lit.px.d, ex, ey)), `${g}: his eyes are still the word's colour`);
  }
});

test('the life: it draws inside the picture, something of it changes from moment to moment, and it never puts a dot on his face but his eyes and the stone', () => {
  for (const g of [null, ...GLOWS]) {
    const scene = paintSmith2(g ? { ...SMITH2_PLAIN, [g]: true } : SMITH2_PLAIN).scene;
    const seen = new Set<string>();
    for (let step = 0; step < 150; step++) {
      const t = step / 7.5; // twenty seconds
      let dots = 0;
      let sum = 0;
      smith2Life(t, scene, (x, y, color, a, w = 1, h = 1) => {
        assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isInteger(x) && Number.isInteger(y), `${g}: a dot at whole pixels (${x}, ${y})`);
        assert.ok(a >= -0.001 && a <= 1.6, `${g}: a strength of ${a}`);
        assert.equal(rgba(color).length, 4);
        // (the widest thing the life draws is the light along the table's edge, the whole of it when the top pulses)
        assert.ok(w >= 1 && h >= 1 && w <= 340 && h <= 40, `${g}: a block of ${w} x ${h}`);
        dots++;
        sum += x * 31 + y * 17 + Math.round(a * 100);
        // his face: from under the band on his brow to his moustache, between his temples
        const faceTop = SMITH2_STONE[1] + 5;
        const faceBottom = SMITH2_EYES[0][1] + 14;
        const onFace = a > 0.05 && x + w > SMITH2_EYES[0][0] - 4 && x < SMITH2_EYES[1][0] + 5 && y + h > faceTop && y < faceBottom;
        const onEyes = y >= SMITH2_EYES[0][1] - 1 && y + h <= SMITH2_EYES[0][1] + 3;
        if (onFace && !onEyes && g !== 'moon' && g !== 'rising') assert.ok(false, `${g}: a dot on his face at (${x}, ${y}) ${w} x ${h}, t = ${t.toFixed(2)}`);
      });
      assert.ok(dots > 20, `${g}: there is life at t = ${t.toFixed(2)} (${dots} dots)`);
      seen.add(String(sum));
    }
    assert.ok(seen.size > 100, `${g}: it changes from moment to moment (${seen.size} different moments of 150)`);
  }
});

test('the braziers and the lanterns stand either side of him, clear of his head and of the name over it', () => {
  const [l, r] = SMITH2_FIRES;
  assert.ok(l[0] < SMITH2_EYES[0][0] - 60 && r[0] > SMITH2_EYES[1][0] + 60, 'well to either side of his face');
  assert.equal(l[1], r[1], 'level with one another');
  assert.ok(Math.abs(l[0] + r[0] - (W - 1)) <= 2, 'and as far from the middle as one another');
  // (a phone held sideways shows 507 columns of the picture: they must be on it)
  assert.ok(l[0] - 24 > (W - 507) / 2 && r[0] + 24 < W - (W - 507) / 2, 'both are on a phone\'s screen');
});

// ---------------------------------------------------------------------------------------------
// THE POWER, THE PULSE OF THE TOP, HIS BREATH (the owner, 20:26 and 20:29)

/** The moment, in run number `run` of the round, at which the power is brightest in a rune `at` along its run. */
function passes(table: boolean, at: number, run: number): number {
  let best = -1;
  let when = -1;
  // (a rune above the top of a stone's run is passed a little before or after its beat)
  for (let i = -12; i < SMITH2_BEAT * 60 + 12; i++) {
    const t = run * SMITH2_BEAT + i / 60;
    const v = smith2Power(table, at, t);
    if (v > best) {
      best = v;
      when = t;
    }
  }
  assert.equal(best, 1, `it blazes as it is passed (run ${run}, at ${at})`);
  return when;
}

test('the power runs along the table: left to right, right to left, in from both ends to meet in the middle, and back out to the ends', () => {
  const scene = paintSmith2({ ...SMITH2_PLAIN, ...SMITH2_CHOSEN }).scene;
  const along = scene.runes.filter((r) => r.table === true).sort((a, b) => a.x - b.x);
  assert.equal(along.length, 15, 'fifteen runes along the table');
  along.forEach((r, i) => assert.ok(Math.abs(r.at - i / 14) < 1e-9, `rune ${i} is ${i} fourteenths of the way along (${r.at})`));
  const order = (run: number): number[] => along.map((r) => passes(true, r.at, run));
  const one = order(0);
  const two = order(1);
  const three = order(2);
  const four = order(3);
  for (let i = 1; i < 15; i++) {
    assert.ok(one[i] > one[i - 1], `run 1 goes from our left to our right (rune ${i})`);
    assert.ok(two[i] < two[i - 1], `run 2 comes back from our right to our left (rune ${i})`);
  }
  for (let i = 1; i <= 7; i++) {
    assert.ok(three[i] > three[i - 1] && three[14 - i] > three[15 - i], `run 3 comes in from both ends (rune ${i})`);
    assert.ok(four[i] < four[i - 1] && four[14 - i] < four[15 - i], `run 4 goes back out to both ends (rune ${i})`);
    assert.ok(Math.abs(three[i] - three[14 - i]) < 1e-9 && Math.abs(four[i] - four[14 - i]) < 1e-9, 'the two sides keep step');
  }
  // the runs follow one another, a beat apart, and the round comes round
  assert.ok(one[14] < two[14] && two[0] < three[0] && three[7] < four[7] && four[0] < SMITH2_CYCLE);
  assert.ok(Math.abs(three[7] - (2 * SMITH2_BEAT + SMITH2_RUN)) < 0.02, `they meet in the middle as run 3 arrives (${three[7]})`);
  for (const t of [0.3, 3.1, 5.9, 7.7]) assert.equal(smith2Power(true, 0.4, t), smith2Power(true, 0.4, t + SMITH2_CYCLE));
  // every one of them can be seen, or at least what of it his fingers do not hang over
  const shown = along.filter((r) => r.dots.length > 0).length;
  assert.ok(shown >= 13, `${shown} of the table's runes show`);
});

test('the walls just go up and down: the power climbs each stone, and comes down it', () => {
  const scene = paintSmith2({ ...SMITH2_PLAIN, ...SMITH2_CHOSEN }).scene;
  const stones = scene.runes.filter((r) => r.table !== true);
  assert.ok(stones.length >= 20, `${stones.length} runes in the stones`);
  // (the higher a rune is in the picture, the further along its stone's run)
  for (const r of stones) assert.ok(Math.abs(r.at - (SMITH2_H - (r.y + 3 * r.s)) / (SMITH2_H - 64)) < 1e-9, 'counted from the floor up');
  const heights = [0.05, 0.3, 0.55, 0.8, 1];
  for (const run of [0, 1, 2, 3]) {
    const when = heights.map((at) => passes(false, at, run));
    for (let i = 1; i < heights.length; i++) {
      if (run % 2 === 0) assert.ok(when[i] > when[i - 1], `run ${run + 1}: up`);
      else assert.ok(when[i] < when[i - 1], `run ${run + 1}: down`);
    }
  }
  // what of each can be seen is on the picture, and none of its light is on the table or under it
  for (const r of scene.runes) {
    for (const list of [r.dots, r.edge, r.halo]) for (const at of list) assert.ok(at >= 0 && at < W * H);
    if (r.table !== true) for (const at of r.dots) assert.ok(Math.floor(at / W) < SMITH2_LIP - 8 || Math.abs((at % W) - W / 2) > 150, 'a stone\'s rune is not drawn on the table');
  }
});

test('the whole top pulses as each run arrives, and its great pulse is where the two meet in the middle', () => {
  const arrivals = [0, 1, 2, 3].map((run) => run * SMITH2_BEAT + SMITH2_RUN);
  const peaks = arrivals.map((t) => smith2Pulse(t + 0.05));
  assert.equal(peaks[2], 1, 'the meeting: all of it');
  for (const run of [0, 1, 3]) assert.ok(peaks[run] > 0.3 && peaks[run] < 0.6, `run ${run + 1}: a lesser pulse (${peaks[run]})`);
  // between them it is dark, and it never goes outside 0..1
  for (const run of [0, 1, 2, 3]) assert.equal(smith2Pulse(run * SMITH2_BEAT + 1), 0, `dark while run ${run + 1} is on its way`);
  for (let i = 0; i < SMITH2_CYCLE * 60; i++) {
    const v = smith2Pulse(i / 60);
    assert.ok(v >= 0 && v <= 1);
  }
  assert.equal(smith2Pulse(5.7), smith2Pulse(5.7 + SMITH2_CYCLE));
});

test('he breathes: his shoulders rise a row at a time, are highest as runs 1 and 3 arrive, and are down again as 2 and 4 do', () => {
  const seen = new Set<number>();
  let last = smith2Breath(0);
  for (let i = 1; i <= SMITH2_CYCLE * 60; i++) {
    const r = smith2Breath(i / 60);
    assert.ok(Number.isInteger(r) && r >= 0 && r <= SMITH2_BREATH, `a rise of ${r}`);
    assert.ok(Math.abs(r - last) <= 1, 'never more than a row at a time');
    seen.add(r);
    last = r;
  }
  assert.equal(seen.size, SMITH2_BREATH + 1, 'every height between');
  assert.equal(smith2Breath(SMITH2_RUN), SMITH2_BREATH);
  assert.equal(smith2Breath(2 * SMITH2_BEAT + SMITH2_RUN), SMITH2_BREATH);
  assert.equal(smith2Breath(SMITH2_BEAT + SMITH2_RUN), 0);
  assert.equal(smith2Breath(3 * SMITH2_BEAT + SMITH2_RUN), 0);
});

test('a frame of his breath: his shoulders are higher, his head and his hands and the table are where they were', () => {
  const painted = paintSmith2({ ...SMITH2_PLAIN, ...SMITH2_CHOSEN });
  const base = painted.px.d;
  const arris = SMITH2_LIP - 8;
  /** The highest row in a column at which the picture is not as it is with his breath out. */
  let before = 0;
  for (let rise = 1; rise <= SMITH2_BREATH; rise++) {
    const d = painted.frame(rise).px.d;
    let differ = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i] === base[i] && d[i + 1] === base[i + 1] && d[i + 2] === base[i + 2]) continue;
        differ++;
        assert.ok(y < SMITH2_LIP + 2, `rise ${rise}: nothing of the table's front moves (${x}, ${y})`);
        // his face (from the band on his brow down to his moustache, between his temples) stays where it is
        const onFace = Math.abs(x + 0.5 - W / 2) < 16 && y >= SMITH2_HEAD_TOP + 14 && y < SMITH2_HEAD_TOP + 44;
        assert.ok(!onFace, `rise ${rise}: his face does not move (${x}, ${y})`);
      }
    }
    assert.ok(differ > before, `rise ${rise}: more of him has moved than at the rise before (${differ} pixels)`);
    before = differ;
    // his hands: the same, pixel for pixel, where his fists are on the edge
    for (const fx of [W / 2 - 92, W / 2 + 92]) {
      for (let y = arris - 4; y < arris + 24; y++) for (let x = fx - 18; x < fx + 18; x++) assert.deepEqual(at(d, x, y), at(base, x, y), `rise ${rise}: his hand is where it was (${x}, ${y})`);
    }
    for (const [ex, ey] of SMITH2_EYES) assert.deepEqual(at(d, ex, ey), at(base, ex, ey));
  }
  assert.ok(before > 2500, `breathed in, a good deal of him is elsewhere (${before} pixels)`);
});

test('the top alight: it lights his face from below, changes nothing under the table\'s edge, and brings no warm light', () => {
  const painted = paintSmith2({ ...SMITH2_PLAIN, ...SMITH2_CHOSEN });
  const arris = SMITH2_LIP - 8;
  for (const rise of [0, SMITH2_BREATH]) {
    const f = rise === 0 ? painted : painted.frame(rise);
    const a = f.px.d;
    const b = f.lit.d;
    let plainFace = 0;
    let litFace = 0;
    let glare = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const same = a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2];
        if (y >= arris) assert.ok(same, `nothing at or under the edge is changed (${x}, ${y})`);
        assert.ok(!warm([b[i], b[i + 1], b[i + 2]]), `no warm light (${x}, ${y})`);
        if (Math.abs(x + 0.5 - W / 2) < 20 && y >= SMITH2_HEAD_TOP + 18 && y < SMITH2_HEAD_TOP + 44) {
          plainFace += a[i] + a[i + 1] + a[i + 2];
          litFace += b[i] + b[i + 1] + b[i + 2];
        }
        if (!same && y >= arris - 3 && Math.abs(x - W / 2) < 30) glare++;
      }
    }
    assert.ok(litFace > plainFace * 1.12, `his face is a good deal brighter (${litFace} against ${plainFace})`);
    assert.ok(glare > 20, 'the edge itself glares');
    for (const [ex, ey] of SMITH2_EYES) assert.ok(cold(at(b, ex, ey)), 'his eyes are still the word\'s colour');
  }
});
