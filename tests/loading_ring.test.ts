// THE LOADING SCREEN'S PICTURE, THE WORDSMITH'S RING BURNING IN THE DARK (src/art/loading_ring.ts): a mock-up behind a switch
// that is off. The queue's item “Paint a nicer loading screen”; his word on the loading screen as it is, 7 Nov 2026, by 22:55:
// “Yes, but nicer later”. What the picture is at a moment is a plain list (loadingScene), so this runs here without a browser;
// the game draws the list with the ring's own pictures (makeLoadingRing), which its scenario photographs
// (tools/scenarios/loading_ring_look.mjs).
//   run: tsx --test tests/loading_ring.test.ts
//   1. the switch is off, and of the game only the loading screen (main.ts) uses the picture;
//   2. nothing in it is new art: the file paints nothing of its own, and brings in the ring's pictures as the town has them;
//   3. the ring is whole at every moment: the circle, six stones where the ring's stones stand, the slab and the column in its
//      middle, the letters swirling inside it; every stone burning, none of them dark;
//   4. it is drawn from the back to the front, the column after the slab it stands on;
//   5. it is at work: the circle turns, and each stone flares as the head of an arc comes by it, twice a turn, and dies back;
//      never all six at once;
//   6. the first frame, the one seen longest, is not an empty one: at time 0 two stones across the ring from each other flare;
//   7. it fits: what it shows stays inside the room the screen leaves for it.

// @ts-ignore - node typings are not part of this project
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { LOADING_RING, LOAD_DOWN, LOAD_TURN_FPS, LOAD_UP, loadingScene } from '../src/art/loading_ring';
import { COLUMN_FRAMES, FLOOR_FRAMES, STONE_AT, STONE_FRAMES } from '../src/art/ring3';
import { RUNES7 } from '../src/art/smith3';

const SRC = fs.readFileSync('src/art/loading_ring.ts', 'utf8');
/** A turn of the circle, in seconds. */
const TURN = FLOOR_FRAMES / LOAD_TURN_FPS;

test('1. the switch is off, and of the game only the loading screen (main.ts) uses the picture', () => {
  assert.equal(LOADING_RING.on, false);
  const files = fs.readdirSync('src', { recursive: true }).map(String).filter((f: string) => f.endsWith('.ts') && !f.split('\\').join('/').startsWith('dev/'));
  const users = files.filter((f: string) => !f.endsWith('loading_ring.ts') && /from '[./a-z_]*\/loading_ring'/.test(fs.readFileSync(`src/${f}`, 'utf8')));
  assert.deepEqual(users, ['main.ts']);
  const main = fs.readFileSync('src/main.ts', 'utf8');
  assert.ok(main.includes('if (LOADING_RING.on) {'), 'the loading screen is the ring only while the switch is on');
  assert.ok(main.includes("cg.fillStyle = THEME.ink;"), 'and with it off the loading screen is as it was');
});

test('2. nothing in it is new art: it paints nothing of its own, and its pictures are the ring\'s', () => {
  // (a painter is a Px, an Iso or a canvas's own picture data: none of them here)
  for (const painter of ['new Px(', 'new Iso(', 'createImageData', 'putImageData', 'compose(']) assert.ok(!SRC.includes(painter), `no ${painter} in it`);
  assert.ok(SRC.includes("from './ring3'") && SRC.includes('makeRing3(VAULT)'), 'the ring\'s pictures, in the vault\'s stone');
  assert.ok(SRC.includes('drawSprite') && SRC.includes('drawLights'), 'drawn as the game draws a picture and its light');
});

test('3. the ring is whole at every moment, and every stone burns', () => {
  for (let t = 0; t < TURN * 2; t += 0.037) {
    const { floor, parts } = loadingScene(t);
    assert.ok(Number.isInteger(floor) && floor >= 0 && floor < FLOOR_FRAMES);
    const stones = parts.filter((p) => p.what === 'stone');
    assert.equal(stones.length, STONE_AT.length);
    for (const s of stones) {
      const [x, y] = STONE_AT[s.v];
      assert.equal(s.x, (x - y) * 16);
      assert.equal(s.y, (x + y) * 8);
      assert.ok(s.blaze >= 1 && s.blaze <= 3, `stone ${s.v} burns at ${t.toFixed(2)} s`);
      assert.ok(Number.isInteger(s.frame) && s.frame >= 0 && s.frame < STONE_FRAMES);
    }
    assert.deepEqual(stones.map((s) => s.v).sort(), [0, 1, 2, 3, 4, 5]);
    const slab = parts.filter((p) => p.what === 'slab');
    const column = parts.filter((p) => p.what === 'column');
    assert.equal(slab.length, 1);
    assert.equal(column.length, 1);
    assert.deepEqual([slab[0].x, slab[0].y], [0, 0]);
    assert.ok(column[0].x === 0 && column[0].y < 0, 'the column stands on the slab\'s top');
    assert.ok(slab[0].frame >= 0 && slab[0].frame < 8 && column[0].frame >= 0 && column[0].frame < COLUMN_FRAMES);
    const letters = parts.filter((p) => p.what === 'letter');
    assert.equal(letters.length, 14);
    for (const l of letters) {
      assert.ok(l.frame >= 0 && l.frame <= 2 && l.v >= 0 && l.v < RUNES7.length);
      // (inside the ring: nearer its middle than its stones stand)
      assert.ok(Math.hypot(l.x / 53, (l.y + 30) / 60) < 1.2, `a letter keeps to the ring at ${t.toFixed(2)} s`);
    }
  }
});

test('4. it is drawn from the back to the front, the column after the slab', () => {
  for (const t of [0, 0.31, 1.07, 2.6]) {
    const { parts } = loadingScene(t);
    for (let i = 1; i < parts.length; i++) assert.ok(parts[i].near >= parts[i - 1].near, `part ${i} is no farther than the one before it at ${t} s`);
    assert.ok(parts.findIndex((p) => p.what === 'column') > parts.findIndex((p) => p.what === 'slab'));
  }
});

test('5. it is at work: the circle turns, and each stone flares as an arc comes by, twice a turn, and dies back', () => {
  // (the circle goes through all its frames in a turn, in order)
  const frames: number[] = [];
  for (let k = 0; k < FLOOR_FRAMES; k++) frames.push(loadingScene((k + 0.5) / LOAD_TURN_FPS).floor);
  assert.deepEqual([...frames].sort((a, b) => a - b), Array.from({ length: FLOOR_FRAMES }, (_, i) => i));
  for (let k = 1; k < FLOOR_FRAMES; k++) assert.equal(frames[k], (frames[k - 1] + 1) % FLOOR_FRAMES);
  // (each stone, over a turn, a frame of the circle at a time: flaring, then a pulse, then burning, twice)
  for (let v = 0; v < STONE_AT.length; v++) {
    const ways: number[] = [];
    for (let k = 0; k < FLOOR_FRAMES; k++) ways.push(loadingScene((k + 0.5) / LOAD_TURN_FPS).parts.find((p) => p.what === 'stone' && p.v === v)!.blaze);
    let flares = 0;
    for (let k = 0; k < FLOOR_FRAMES; k++) {
      const was = ways[(k + FLOOR_FRAMES - 1) % FLOOR_FRAMES];
      if (ways[k] === 3 && was !== 3) {
        flares++;
        assert.equal(was, 1, `stone ${v} flares out of its burning`);
      }
      if (ways[k] === 1 && was !== 1) assert.equal(was, 2, `stone ${v} dies back through a pulse`);
    }
    assert.equal(flares, 2, `stone ${v} flares twice a turn`);
    assert.ok(ways.filter((w) => w === 1).length >= FLOOR_FRAMES / 2, `stone ${v} burns low at least half the time`);
  }
  // (and not all at once: the four at the sides as the arcs cross them, then the two at the back; at every moment some flare or
  // pulse, and some burn low)
  for (let t = 0; t < TURN; t += 0.05) {
    const stones = loadingScene(t).parts.filter((p) => p.what === 'stone');
    assert.ok(stones.filter((p) => p.blaze === 3).length <= 4, `not all flare at ${t.toFixed(2)} s`);
    assert.ok(stones.some((p) => p.blaze > 1) && stones.some((p) => p.blaze === 1), `some up and some low at ${t.toFixed(2)} s`);
  }
});

test('6. the first frame is not an empty one: at time 0 two stones across the ring from each other flare', () => {
  for (const t of [0, 0.016, 0.05, 0.09]) {
    const flaring = loadingScene(t).parts.filter((p) => p.what === 'stone' && p.blaze === 3);
    assert.equal(flaring.length, 2, `two flare at ${t} s`);
    assert.ok(flaring[0].x * flaring[1].x < 0, 'one on each side of the ring');
  }
});

test('7. it fits: what it shows stays inside the room the screen leaves for it', () => {
  // (a stone's picture is 24 game pixels across and stands 44 over its foot; the column 75 over the slab's top; the circle 53 by 26.5 from its middle)
  for (let t = 0; t < TURN * 2; t += 0.05) {
    for (const p of loadingScene(t).parts) {
      const tall = p.what === 'stone' ? 50 : p.what === 'column' ? 75 : p.what === 'slab' ? 29 : 16;
      assert.ok(p.y - tall >= -LOAD_UP, `${p.what} keeps under the picture's head at ${t.toFixed(2)} s (${p.y - tall})`);
      assert.ok(p.y + 9 <= LOAD_DOWN, `${p.what} keeps over the picture's foot`);
      assert.ok(Math.abs(p.x) <= 64, `${p.what} keeps to the ring's width`);
    }
  }
  assert.ok(LOAD_DOWN >= 27, 'the front of the circle is inside it');
});
