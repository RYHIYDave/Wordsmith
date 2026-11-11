// ENDLESS MODE'S SPLASH, PAINTED (art/endless_splash.ts, behind ENDLESS_SPLASH, off): the hall of gates, its waking and its letters'
// place. The painting is plain numbers until it is put on a canvas, so all of this runs here without a browser.
//   1. the switch is off, and the splash painted in code is drawn while it is;
//   2. the picture is the size it says, the same every time it is painted, and as it was when he was shown it (a checksum: if
//      you change the painting ON PURPOSE, this fails and tells you the new sum to put here);
//   3. the friend's cyan and the enemy's pink keep their places: the waypoint's brightest light only in the bay it lies in, the
//      far fire's pink only at the far end (the fire and the last gates it lights);
//   4. the waking: every gate has its part of the picture, each gate's sleep lies inside the one before it, the first covers
//      the whole picture; the gates wake in order, each sooner after the last, and all of it is over inside 2 s;
//   5. the letters: on every screen the game is laid out on, ENDLESS and the line under it are whole on the screen and on the
//      lintel, and the picture covers the screen.
//   6. THE STAIR WITH NO BOTTOM (art/endless_stair.ts), his pick of the ten: the picture the switch shows; its size, the same each
//      time, its checksum; cyan and pink in their places; every storey its part, each inside the last; the letters whole on
//      every screen and the picture covering it.
//   run: tsx --test tests/endless_splash.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ENDLESS_SPLASH, ES_GATES, ES_H, ES_MOMENT, ES_W, endlessAsleep, endlessAwake, endlessLettering, endlessWake, paintEndlessSplash } from '../src/art/endless_splash';
import { STAIR_SCENE, paintEndlessStair } from '../src/art/endless_stair';
import { ENDLESS_FANFARE } from '../src/ui/endless_fanfare';
import { textWidth } from '../src/engine/font';

/** The picture as he was shown it, 11 Nov 2026. */
const SUM = 4006885255;

const p = paintEndlessSplash();
function sumOf(c: Int32Array): number {
  let s = 0;
  for (let i = 0; i < c.length; i++) s = (Math.imul(s, 31) + c[i]) | 0;
  return s >>> 0;
}

test('1. the switch is off, and it is the fanfare\'s own', () => {
  assert.equal(ENDLESS_SPLASH.on, false);
  assert.equal(ENDLESS_FANFARE.painted, ENDLESS_SPLASH);
  assert.equal(ENDLESS_SPLASH.picture, 'stair');
});

test('2. the picture: its size, the same each time, as he was shown it', () => {
  assert.equal(p.w, ES_W * 2);
  assert.equal(p.h, ES_H * 2);
  assert.equal(p.c.length, p.w * p.h);
  const again = paintEndlessSplash();
  assert.equal(sumOf(again.c), sumOf(p.c));
  assert.equal(sumOf(p.c), SUM, `the painting has changed: if on purpose, SUM = ${sumOf(p.c)}`);
});

test('3. cyan is the friend\'s, pink the enemy\'s', () => {
  let cyanOff = 0;
  let pinkOff = 0;
  let cyan = 0;
  let pink = 0;
  for (let i = 0; i < p.c.length; i++) {
    if (p.c[i] === 0xb8fff8) {
      cyan++;
      if (p.stage[i] !== 1) cyanOff++;
    }
    if (p.c[i] === 0xff4f8a) {
      pink++;
      if (p.stage[i] < ES_GATES - 4) pinkOff++;
    }
  }
  assert.ok(cyan > 200, `the waypoint is alight (${cyan})`);
  assert.ok(pink > 100, `the far fire burns (${pink})`);
  assert.equal(cyanOff, 0);
  assert.equal(pinkOff, 0);
});

test('4. the waking: every gate its part, each inside the last, in order, faster and faster', () => {
  const seen = new Set<number>();
  for (let i = 0; i < p.stage.length; i++) seen.add(p.stage[i]);
  for (let j = 0; j <= ES_GATES; j++) assert.ok(seen.has(j), `gate ${j} has pixels`);
  const asleep = endlessAsleep(p);
  assert.equal(asleep.length, ES_GATES + 1);
  const area = (r: Int16Array): number => {
    let a = 0;
    for (let i = 0; i < r.length; i += 3) a += r[i + 2] - r[i + 1];
    return a;
  };
  assert.equal(area(asleep[0]), p.w * p.h);
  for (let j = 1; j <= ES_GATES; j++) assert.ok(area(asleep[j]) < area(asleep[j - 1]) && area(asleep[j]) > 0, `gate ${j}'s sleep inside gate ${j - 1}'s`);
  assert.equal(endlessWake(0), ES_MOMENT.wake);
  assert.ok(Math.abs(endlessWake(ES_GATES) - ES_MOMENT.far) < 1e-9);
  for (let j = 2; j <= ES_GATES; j++) {
    const gap = endlessWake(j) - endlessWake(j - 1);
    assert.ok(gap > 0 && gap < endlessWake(j - 1) - endlessWake(j - 2), `gate ${j} wakes sooner after ${j - 1}`);
  }
  assert.equal(endlessAwake(0), 0);
  assert.equal(endlessAwake(ES_MOMENT.far + 0.001), ES_GATES + 1);
  assert.ok(ES_MOMENT.far < ES_MOMENT.drop && ES_MOMENT.drop < ES_MOMENT.land && ES_MOMENT.land < ES_MOMENT.way && ES_MOMENT.way < ES_MOMENT.hard && ES_MOMENT.hard < ES_MOMENT.done);
  assert.ok(ES_MOMENT.done >= 1 && ES_MOMENT.done <= 2, 'one to two seconds of it moving');
  assert.ok(ES_MOMENT.done < ENDLESS_FANFARE.splash);
});

test('5. the letters fit on the lintel on every screen, and the picture covers the screen', () => {
  const wordW = textWidth('ENDLESS');
  const subW = textWidth('THE WAY GOES ON') + 10 + textWidth('HARDCORE');
  // (a phone held sideways; a desktop; a very wide screen; a tablet; the smallest the game is laid out on; a tall window)
  for (const [w, h] of [[507, 234], [480, 270], [688, 288], [574, 264], [394, 274], [320, 200], [270, 200], [640, 360]]) {
    const L = endlessLettering(w, h, wordW, subW);
    const edge = Math.ceil(L.scale / 2);
    assert.ok(L.scale >= 2 && L.scale <= 6, `${w}x${h}: scale ${L.scale}`);
    assert.ok(wordW * L.scale + edge * 2 <= w, `${w}x${h}: the word is not wider than the screen`);
    assert.ok(L.wordY - edge >= 0, `${w}x${h}: the word's top is on the screen (${L.wordY})`);
    assert.ok(L.subY >= L.wordY + 7 * L.scale + edge, `${w}x${h}: the line is under the word`);
    assert.ok(L.subY + (L.oneLine ? 7 : 16) <= L.lintel, `${w}x${h}: the line is on the lintel (${L.subY} over ${L.lintel})`);
    assert.ok(L.oy <= 0 && L.oy + ES_H >= h, `${w}x${h}: the picture covers the screen from top to bottom`);
    if (w <= ES_W) assert.ok(L.ox <= 0 && L.ox + ES_W >= w, `${w}x${h}: and from side to side`);
  }
});

/** The stair as he was shown it, 11 Nov 2026. */
const STAIR_SUM = 1388281078;

test('6. the stair with no bottom: the picture, its colours, its waking, its letters', () => {
  const q = paintEndlessStair();
  assert.equal(q.w, ES_W * 2);
  assert.equal(q.h, ES_H * 2);
  assert.equal(sumOf(paintEndlessStair().c), sumOf(q.c));
  assert.equal(sumOf(q.c), STAIR_SUM, `the painting has changed: if on purpose, STAIR_SUM = ${sumOf(q.c)}`);
  let cyan = 0;
  let pink = 0;
  const seen = new Set<number>();
  for (let i = 0; i < q.c.length; i++) {
    seen.add(q.stage[i]);
    if (q.c[i] === 0xb8fff8) {
      cyan++;
      assert.equal(q.stage[i], 0, 'the waypoint is at the head of the stair');
    }
    if (q.c[i] === 0xff4f8a) {
      pink++;
      assert.ok(q.stage[i] >= STAIR_SCENE.gates - 4, 'the fire is at the bottom');
    }
  }
  assert.ok(cyan > 200 && pink > 100, `the waypoint is alight (${cyan}) and the fire burns (${pink})`);
  assert.equal(STAIR_SCENE.gates, ES_GATES);
  for (let j = 0; j <= ES_GATES; j++) assert.ok(seen.has(j), `storey ${j} has pixels`);
  const asleep = endlessAsleep(q);
  const area = (r: Int16Array): number => {
    let a = 0;
    for (let i = 0; i < r.length; i += 3) a += r[i + 2] - r[i + 1];
    return a;
  };
  for (let j = 1; j <= ES_GATES; j++) assert.ok(area(asleep[j]) < area(asleep[j - 1]) && area(asleep[j]) > 0, `storey ${j}'s sleep inside storey ${j - 1}'s`);
  assert.equal(STAIR_SCENE.torches.length, ES_GATES);
  for (const [x, y, stage] of STAIR_SCENE.torches) assert.ok(x >= 0 && x < q.w && y >= 0 && y < q.h && q.stage[Math.floor(y) * q.w + Math.floor(x)] <= stage + 1, 'a torch is in the picture, on its storey');
  const wordW = textWidth('ENDLESS');
  const subW = textWidth('THE WAY GOES ON') + 10 + textWidth('HARDCORE');
  for (const [w, h] of [[507, 234], [480, 270], [688, 288], [574, 264], [394, 274], [320, 200], [270, 200], [640, 360]]) {
    const L = STAIR_SCENE.lettering(w, h, wordW, subW);
    const edge = Math.ceil(L.scale / 2);
    assert.ok(L.scale >= 2 && L.scale <= 6 && wordW * L.scale + edge * 2 <= w, `${w}x${h}: the word fits across`);
    assert.ok(L.wordY - edge >= 0 && L.subY >= L.wordY + 7 * L.scale + edge && L.subY + (L.oneLine ? 7 : 16) < h * 0.5, `${w}x${h}: the letters are in the top half`);
    assert.ok(L.oy <= 0 && L.oy + ES_H >= h, `${w}x${h}: the picture covers the screen from top to bottom`);
    if (w <= ES_W) assert.ok(L.ox <= 0 && L.ox + ES_W >= w, `${w}x${h}: and from side to side`);
  }
});
