// Tests for the parts of src/art/kit.ts that are arithmetic rather than painting (Version 10):
// the walk, the idle loop, two-bone limbs, cloth in the wind, frames painted on demand, and the
// painter itself as far as it can be checked without a browser (a Px is plain numbers; only
// turning one into a Sprite needs a canvas).
//
// Version 11 added to the kit: a longer standing loop (twelve frames, ten to the second), frames
// cut down to what is painted on them, and animations as timelines (`Moves`, `animSet`). For those
// a plain painting stands in for the canvas (tests/helpers.ts), so the frames a figure is given
// can be read here as the game would show them.
//   run: tsx --test tests/kit.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { clipPoses, frameCount } from '../src/art/clip';
import type { Timeline } from '../src/art/clip';
import {
  CLIP_FPS, GESTURE_FPS, GRAIN, IDLE_FPS, IDLE_FRAMES, IDLE_SECONDS, INK, KAX, KAY, KH, KW, KX, REST, STAND, STEEL, TURN, WALK_FPS, WALK_FRAMES,
  along, animSet, compose, flutter, footOf, idlePoses, joint, layer, lazyFrames, leg, lightsOut, lit, shear, shearBy, slant, toSprite, walkPoses,
} from '../src/art/kit';
import type { LegStyle, Moves, Pose, Rig, V } from '../src/art/kit';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const near = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) <= eps;
const full = (o: Partial<Pose>): Pose => ({ ...REST, ...o });

test('the walk: one full stride of both feet, half a cycle apart, and it closes', () => {
  const w = walkPoses().map(full);
  assert.equal(w.length, WALK_FRAMES);
  for (const q of w) {
    // the feet are always opposite each other, and never both in the air
    assert.ok(near(q.near, -q.far), 'the two feet mirror each other');
    assert.ok(!(q.nearLift > 0.01 && q.farLift > 0.01), 'both feet off the floor at once');
    assert.ok(q.nearLift >= 0 && q.farLift >= 0 && q.nearLift <= 1 && q.farLift <= 1);
    assert.equal(q.drag, 1);
  }
  // a foot is lifted only while it travels forward
  for (let i = 0; i < w.length; i++) {
    const next = w[(i + 1) % w.length];
    if (w[i].nearLift > 0.5) assert.ok(next.near > w[i].near - 1e-9, 'a lifted foot goes forward');
    if (w[i].farLift > 0.5) assert.ok(next.far > w[i].far - 1e-9, 'a lifted foot goes forward');
  }
  // the second half of the cycle is the first with the feet swapped
  const half = WALK_FRAMES / 2;
  for (let i = 0; i < half; i++) {
    assert.ok(near(w[i].near, w[i + half].far) && near(w[i].nearLift, w[i + half].farLift));
    assert.equal(w[i].bob, w[i + half].bob);
    assert.ok(near(w[i].lean, -w[i + half].lean), 'the sway is even to both sides');
  }
  // both feet make a full step forward and back
  assert.ok(Math.max(...w.map((q) => q.near)) > 0.99 && Math.min(...w.map((q) => q.near)) < -0.99);
});

test('the walk and the idle loop: the wind goes round a whole number of times', () => {
  for (const poses of [walkPoses().map(full), idlePoses().map(full)]) {
    for (const q of poses) assert.ok(q.wind >= 0 && q.wind < 1, `wind ${q.wind} is inside its loop`);
    const step = (poses[1].wind - poses[0].wind + 1) % 1;
    for (let i = 0; i < poses.length; i++) {
      const d = (poses[(i + 1) % poses.length].wind - poses[i].wind + 1) % 1;
      assert.ok(near(d, step), 'the wind moves on by the same amount every frame, and from the last frame to the first');
    }
  }
  assert.equal(idlePoses().length, IDLE_FRAMES);
  const bobs = idlePoses().map((q) => q.bob ?? 0);
  assert.equal(bobs.filter((b) => b === 1).length, IDLE_FRAMES / 2);
});

test('a step goes down the screen facing the camera and up it facing away; a lifted foot comes off the floor', () => {
  const forward = full({ near: 1, far: -1 });
  const f = footOf(forward, true, false);
  const b = footOf(forward, true, true);
  assert.ok(f.dy > 0 && b.dy < 0);
  assert.equal(f.dx, b.dx);
  assert.ok(Math.abs(f.dx) < Math.abs(f.dy), 'a step is more up-and-down than sideways (or the legs cross and read as one)');
  const lifted = footOf(full({ nearLift: 1 }), true, false);
  assert.ok(lifted.dy < 0 && lifted.bend > 0);
  assert.deepEqual(footOf(REST, true, false), { dx: 0, dy: 0, bend: 0 });
  assert.deepEqual(footOf(REST, false, true), { dx: 0, dy: 0, bend: 0 });
});

test('a two-bone limb keeps its bones the length they are', () => {
  const a: V = [10, 10];
  for (const b of [[14, 20], [3, 15], [10, 2], [22, 12]] as V[]) {
    for (const side of [1, -1] as const) {
      const j = joint(a, b, 8, 7, side);
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d < 15) {
        assert.ok(near(Math.hypot(j[0] - a[0], j[1] - a[1]), 8, 1e-6));
        assert.ok(near(Math.hypot(b[0] - j[0], b[1] - j[1]), 7, 1e-6));
      }
    }
    // the two ways of bending are mirror images across the line from a to b
    const p = joint(a, b, 8, 7, 1);
    const q = joint(a, b, 8, 7, -1);
    const mid: V = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const cross = (mid[0] - a[0]) * (b[1] - a[1]) - (mid[1] - a[1]) * (b[0] - a[0]);
    assert.ok(Math.abs(cross) < 1e-6);
  }
  // out of reach: the limb is simply straight
  const far = joint([0, 0], [30, 0], 8, 7, 1);
  assert.ok(near(far[1], 0) && far[0] > 0 && far[0] < 30);
});

test('cloth in the wind: the fixed end stays put, the free end moves most, and the wave loops', () => {
  const base: [V, V, V, V] = [[50, 50], [40, 46], [32, 52], [22, 48]];
  const a = flutter(base, 0.3, 3);
  assert.deepEqual(a[0], base[0]);
  const moved = (i: number): number => Math.hypot(a[i][0] - base[i][0], a[i][1] - base[i][1]);
  let most = 0;
  for (let k = 0; k < 16; k++) {
    const f = flutter(base, k / 16, 3);
    most = Math.max(most, Math.hypot(f[3][0] - base[3][0], f[3][1] - base[3][1]));
    assert.ok(Math.hypot(f[1][0] - base[1][0], f[1][1] - base[1][1]) <= 3 / 3 + 1e-9, 'the wave is small near the fixed end');
  }
  assert.ok(most > 2.5 && most <= 3.2, 'the free end swings by about the amplitude');
  assert.ok(moved(1) <= 1.01);
  const again = flutter(base, 1.3, 3);
  for (let i = 0; i < 4; i++) assert.ok(near(a[i][0], again[i][0]) && near(a[i][1], again[i][1]));
});

test('frames are painted the first time they are asked for, and once', () => {
  const calls: number[] = [];
  const fake = (i: number): Sprite => {
    calls.push(i);
    return { img: null as unknown as HTMLCanvasElement, w: i, h: 1, ax: 0, ay: 0 };
  };
  const frames = lazyFrames(5, fake);
  assert.equal(frames.length, 5);
  assert.deepEqual(calls, []);
  const third = frames[2];
  assert.equal(third.w, 2);
  assert.deepEqual(calls, [2]);
  assert.ok(frames[2] === third, 'the same picture the second time');
  assert.deepEqual(calls, [2]);
  // walking the list paints the rest, each once, and the list behaves like any other after that
  assert.deepEqual(frames.map((s) => s.w), [0, 1, 2, 3, 4]);
  assert.deepEqual(calls, [2, 0, 1, 3, 4]);
  assert.deepEqual(Array.from(frames).map((s) => s.w), [0, 1, 2, 3, 4]);
  assert.deepEqual(calls, [2, 0, 1, 3, 4]);
});

test('lit shades a shape with the three tones of its material and nothing else', () => {
  const p = layer();
  lit(p, STEEL, [0, 2], [0, 3], (l) => l.rect(20, 20, 16, 16, INK));
  const seen = new Set<string>();
  let n = 0;
  for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) {
    const c = p.get(x, y);
    if (c === null) continue;
    n++;
    seen.add(c);
    assert.ok(x >= 20 && x < 36 && y >= 20 && y < 36, 'nothing is painted outside the shape');
  }
  assert.equal(n, 256);
  assert.deepEqual([...seen].sort(), [STEEL[1], STEEL[2], STEEL[3]].sort());
  // light on the upper-left edge, shade on the lower-right
  assert.equal(p.get(20, 20), STEEL[3]);
  assert.equal(p.get(35, 35), STEEL[1]);
  assert.equal(p.get(27, 27), STEEL[2]);
});

test('compose puts a seam round every layer, over what lies beneath it', () => {
  const under = layer();
  under.rect(10, 10, 20, 20, STEEL[2]);
  const over = layer();
  over.rect(18, 18, 4, 4, STEEL[3]);
  const out = compose(null, [under, over]);
  assert.equal(out.get(19, 19), STEEL[3]);
  // the seam of the upper layer is drawn on the lower one
  assert.equal(out.get(17, 19), INK);
  assert.equal(out.get(19, 22), INK);
  assert.equal(out.get(12, 12), STEEL[2]);
  // and the lower layer has one of its own against the empty canvas
  assert.equal(out.get(9, 15), INK);
  assert.equal(out.get(5, 5), null);
});

test('a leg stands on its sole row, reaches where its foot goes, and never leaves the canvas', () => {
  const style: LegStyle = { w: 4, upper: STEEL, lower: STEEL, share: 0.5, cuff: true, knee: null, band: null };
  const rows = (foot: typeof STAND): { top: number; bottom: number; left: number; right: number } => {
    const p = layer();
    leg(p, KX - 6, KAY - 24, KAY - 1, false, style, foot);
    let top = KH;
    let bottom = -1;
    let left = KW;
    let right = -1;
    for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) {
      if (!p.has(x, y)) continue;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
    return { top, bottom, left, right };
  };
  const still = rows(STAND);
  assert.equal(still.top, KAY - 24);
  assert.equal(still.bottom, KAY - 1);
  const stepped = rows({ dx: 2, dy: 3, bend: 0 });
  assert.equal(stepped.bottom, KAY + 2);
  assert.equal(stepped.top, KAY - 24);
  assert.ok(stepped.right >= still.right + 2);
  const lifted = rows({ dx: 0, dy: -3, bend: 2 });
  assert.equal(lifted.bottom, KAY - 4);
});

// ---------------------------------------------------------------------------------------------
// Version 14.5: TURNED TO THE GRID. The owner, 5 Oct 2026: "the game doesn't run on normal
// north-east-south-west directions. It's always at an angle ... So any sprite or doodad or whatever
// should always be seen at an angle", and "I'd like the character models to move and turn in those
// four cardinal directions as well." These are the kit's tools for painting a figure that way.

test('seen from a corner, what runs across a body runs along the grid: one row for every two columns, lowest at the nearest corner', () => {
  const by = slant(50, 2);
  assert.equal(by(50), 2);
  assert.equal(by(51), 2);
  // toward the side faced it rises one row for every two columns ...
  for (let x = 50; x < 62; x += 2) assert.equal(by(x) - by(x + 2), 1, `between columns ${x} and ${x + 2}`);
  for (let x = 50; x < 62; x++) assert.ok(by(x) - by(x + 1) === 0 || by(x) - by(x + 1) === 1, 'never more than a row at a time');
  // ... and it rises the other way too: the corner is the lowest of it
  for (let x = 40; x < 62; x++) assert.ok(by(x) <= 2);
  assert.ok(by(46) < by(50) && by(44) < by(46));
  // a line along the grid, down to the right or up to the right
  const down = along(20, 1);
  const up = along(20, -1);
  assert.equal(down(20), 0);
  assert.equal(down(30), 5);
  assert.equal(up(30), -5);
  assert.equal(down(10), -5);
  for (let x = 0; x < 40; x++) assert.equal(down(x) + up(x), 0);
  assert.equal(TURN, 3, 'the middle line of a body sixteen wide is three pixels toward the side it faces');
});

test('sliding the columns of a layer keeps every pixel of it, and what was level comes out along the grid', () => {
  const flat = new Px(40, 40);
  flat.rect(10, 20, 20, 3, INK);
  const out = shear(flat, along(20, -1), new Px(40, 40));
  let n = 0;
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) if (out.has(x, y)) n++;
  assert.equal(n, 60, 'every pixel is still there');
  const topOf = (p: Px, x: number): number => {
    for (let y = 0; y < p.h; y++) if (p.has(x, y)) return y;
    return -1;
  };
  assert.equal(topOf(out, 20), 20);
  assert.equal(topOf(out, 28), 16, 'up to the right, a row for every two columns');
  assert.equal(topOf(out, 12), 24);
  for (let x = 10; x < 30; x++) {
    let rows = 0;
    for (let y = 0; y < 40; y++) if (out.has(x, y)) rows++;
    assert.equal(rows, 3, `column ${x} is as thick as it was`);
  }
  // onto a layer that has something on it: only where there is something to lay down
  const under = new Px(40, 40);
  under.rect(0, 0, 40, 40, '#ffffff');
  shear(flat, along(20, 1), under);
  assert.equal(under.get(0, 0), '#ffffff');
  assert.equal(under.get(28, 24), INK);
  // a slide that changes down the layer (a coat whose belt leans and whose hem does not) leaves no gap in a column
  const tall = new Px(40, 40);
  tall.rect(10, 5, 20, 30, INK);
  const coat = shearBy(tall, (x, y) => along(20, -1)(x) * Math.max(0, 1 - (y - 5) / 30), new Px(40, 40));
  for (let x = 10; x < 30; x++) {
    let first = -1;
    let last = -1;
    let rows = 0;
    for (let y = 0; y < 40; y++) if (coat.has(x, y)) {
      if (first < 0) first = y;
      last = y;
      rows++;
    }
    assert.equal(rows, last - first + 1, `column ${x} has no gap in it`);
    assert.equal(last, 34, `column ${x}: the hem is where it was`);
  }
  assert.ok(topOf(coat, 28) < topOf(coat, 12), 'and the shoulders lean');
});

test('seen from a corner a foot points along the grid, and a step goes along it', () => {
  const style: LegStyle = { w: 4, upper: STEEL, lower: STEEL, share: 0.5, cuff: false, knee: null, band: null };
  const foot = (turn: 0 | 1 | -1): { lowest: number; lowestX: number[]; right: number } => {
    const p = layer();
    leg(p, KX - 6, KAY - 24, KAY - 1, false, style, STAND, 3, turn);
    let lowest = -1;
    let right = -1;
    for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) if (p.has(x, y)) {
      lowest = Math.max(lowest, y);
      right = Math.max(right, x);
    }
    const lowestX: number[] = [];
    for (let x = 0; x < KW; x++) if (p.has(x, lowest)) lowestX.push(x);
    return { lowest, lowestX, right };
  };
  const square = foot(0);
  const toward = foot(1);
  const away = foot(-1);
  assert.equal(square.lowest, KAY - 1);
  // facing down the screen and to the right: the toe is a row lower than the heel, and it is the right-hand end of the foot
  assert.equal(toward.lowest, KAY, 'the toe comes a row below where the heel stands');
  assert.ok(Math.min(...toward.lowestX) > KX - 6, 'and that row is the toe: the heel is not in it');
  assert.ok(toward.right >= square.right);
  // facing up the screen and to the right: nothing below the heel
  assert.equal(away.lowest, KAY - 1);
  assert.ok(Math.max(...away.lowestX) <= KX - 6 + style.w, 'the lowest row is the heel');
  // the step
  const forward = full({ near: 1, far: -1 });
  const f = footOf(forward, true, false, true);
  const b = footOf(forward, true, true, true);
  assert.ok(f.dx > 0 && f.dy > 0 && b.dx > 0 && b.dy < 0, 'forward is to the right, and down the screen facing us, up it facing away');
  assert.ok(Math.abs(f.dx) > Math.abs(f.dy), 'a step is more across than up-and-down: it goes along the grid');
  assert.ok(Math.abs(f.dx / f.dy - 2) <= 1, `about two across for each one down (${f.dx} and ${f.dy})`);
  assert.deepEqual(footOf(REST, true, false, true), { dx: 0, dy: 0, bend: 0 });
  // (a figure not yet turned to the grid steps as it did)
  assert.ok(Math.abs(footOf(forward, true, false).dx) < Math.abs(footOf(forward, true, false).dy));
});

// ---------------------------------------------------------------------------------------------
// Version 11

test('the standing loop: twelve frames, ten to the second; one breath, one turn of the wind, and it begins at rest', () => {
  // (the things a hero does when left standing are written to this length: 1.2 s, and each lasts
  // a whole number of them. Change it, and they must be written again: see tests/heroes.test.ts)
  assert.deepEqual([IDLE_FRAMES, IDLE_FPS], [12, 10]);
  assert.ok(near(IDLE_SECONDS, IDLE_FRAMES / IDLE_FPS) && near(IDLE_SECONDS, 1.2));
  const loop = idlePoses().map(full);
  assert.deepEqual(loop[0], REST, 'its first frame is the figure at rest: where every attack and every gesture begins and ends');
  // one breath: the chest up for the first half, down for the second
  assert.deepEqual(loop.map((q) => q.bob), [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
  // the wind goes exactly once round, at an even pace, and nothing else moves
  loop.forEach((q, i) => {
    assert.ok(near(q.wind, i / IDLE_FRAMES), `frame ${i}: the wind is ${i} twelfths of the way round`);
    assert.deepEqual({ ...q, wind: 0, bob: 0 }, REST);
  });
  // a loop is a whole number of the frames a gesture is shown in (24), so a gesture that lasts
  // whole loops ends exactly on a frame; and the walk is two steps a second
  assert.ok(near(IDLE_SECONDS * GESTURE_FPS, 24));
  assert.deepEqual([WALK_FRAMES, WALK_FPS], [8, 16]);
  assert.equal(CLIP_FPS, 30);
});

test('a painting knows the box that holds what is painted on it, and can be cut down to it', () => {
  const p = new Px(40, 30);
  assert.equal(p.bounds(), null, 'nothing painted: no box');
  assert.equal(p.bounds(2), null);
  p.set(7, 5, INK);
  assert.deepEqual(p.bounds(), { x: 7, y: 5, w: 1, h: 1 });
  // (columns 11 to 16, rows 9 to 12)
  p.rect(11, 9, 6, 4, STEEL[2]);
  assert.deepEqual(p.bounds(), { x: 7, y: 5, w: 10, h: 8 }, 'the box that holds everything');
  // for art at the finer grain the box is widened to whole game pixels: blocks of `grain`
  assert.deepEqual(p.bounds(2), { x: 6, y: 4, w: 12, h: 10 });
  assert.deepEqual(p.bounds(4), { x: 4, y: 4, w: 16, h: 12 });
  for (const grain of [1, 2, 3, 4, 5]) {
    const b = p.bounds(grain);
    assert.ok(b !== null);
    if (!b) return;
    assert.ok(b.x % grain === 0 && b.y % grain === 0 && b.w % grain === 0 && b.h % grain === 0, `grain ${grain}: whole blocks`);
    assert.ok(b.x <= 7 && b.y <= 5 && b.x + b.w >= 17 && b.y + b.h >= 13, `grain ${grain}: and nothing painted is left out`);
    assert.ok(b.w < 10 + 2 * grain && b.h < 8 + 2 * grain, `grain ${grain}: and no wider than it need be`);
  }
  // a box that already sits on whole blocks is left as it is
  const q = new Px(40, 30);
  q.rect(8, 6, 4, 2, STEEL[3]);
  assert.deepEqual(q.bounds(2), { x: 8, y: 6, w: 4, h: 2 });
  // what has been rubbed out is not painted
  p.erase(7, 5);
  assert.deepEqual(p.bounds(), { x: 11, y: 9, w: 6, h: 4 });
  // the box never goes past the painting's own edge
  const edge = new Px(6, 6);
  edge.set(5, 5, INK);
  assert.deepEqual(edge.bounds(4), { x: 4, y: 4, w: 2, h: 2 });
  // cut down: a copy of the box, pixel for pixel, and the painting it came from is untouched
  p.set(12, 10, INK).set(16, 12, STEEL[4]);
  const cut = p.crop(10, 8, 9, 6);
  assert.deepEqual([cut.w, cut.h], [9, 6]);
  for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) assert.equal(cut.get(x, y), p.get(10 + x, 8 + y), `pixel ${x}, ${y} of the cut`);
  assert.deepEqual(cut.bounds(), { x: 1, y: 1, w: 6, h: 4 });
  cut.set(0, 0, INK);
  assert.equal(p.get(10, 8), null, 'painting on the copy leaves the original alone');
});

test('a frame is cut down to what is painted, on whole game pixels, and nothing moves from the feet', () => {
  const px = layer();
  // a body (columns 41 to 49, rows 23 to 52) and a toe far from it (column 60, row 99)
  px.rect(41, 23, 9, 30, STEEL[2]);
  px.set(60, 99, INK);
  const lights = [{ x: 45, y: 30, r: 9, color: '#22d0e0', a: 0.4 }];
  const tails = [{ id: 'scarf', x: 43, y: 25.5, over: true }];
  const s = toSprite({ px, lights, tails });
  // the box on whole game pixels: columns 40 to 61, rows 22 to 99
  const cut = paintingOf(s);
  assert.deepEqual([cut.w, cut.h], [22, 78]);
  assert.deepEqual([s.w, s.h, s.density], [11, 39, GRAIN], 'its size in game pixels, and two picture pixels to each');
  let painted = 0;
  for (let y = 0; y < KH; y++) {
    for (let x = 0; x < KW; x++) {
      assert.equal(cut.get(x - 40, y - 22), px.get(x, y), 'every pixel of the painting is in the frame, and no other');
      if (px.has(x, y)) painted++;
    }
  }
  assert.equal(painted, 271);
  // the anchor is still the floor between the figure's feet, wherever the box begins
  assert.deepEqual([s.ax, s.ay], [(KAX - 40) / GRAIN, (KAY - 22) / GRAIN]);
  assert.ok(Number.isInteger(s.ax) && Number.isInteger(s.ay), 'on a whole game pixel');
  // and its light, its pool of light and the knot of its scarf are where they were, measured from the feet
  const light = (s.lights ?? [])[0];
  assert.deepEqual([light.x - s.ax, light.y - s.ay, light.r, light.color, light.a], [(45 - KAX) / GRAIN, (30 - KAY) / GRAIN, 4.5, '#22d0e0', 0.4]);
  const knot = (s.tails ?? [])[0];
  assert.deepEqual([knot.x - s.ax, knot.y - s.ay, knot.id, knot.over], [(43 - KAX) / GRAIN, (25.5 - KAY) / GRAIN, 'scarf', true]);
  assert.ok(s.aura && near(s.aura.x - s.ax, -2) && near(s.aura.y - s.ay, -15) && s.aura.r === 23, 'the pool of light behind every hero');
  assert.deepEqual(lights[0], { x: 45, y: 30, r: 9, color: '#22d0e0', a: 0.4 }, 'what the rig handed over is not changed');
  assert.deepEqual(tails[0], { id: 'scarf', x: 43, y: 25.5, over: true });
  // so two frames of one figure line up when their anchors do, however differently they were cut:
  // the same figure with an arm flung out differs by the arm and nothing else
  const flung = layer();
  flung.blit(px, 0, 0);
  flung.rect(10, 40, 12, 2, STEEL[3]);
  const other = toSprite({ px: flung, lights: [] });
  assert.ok(other.w > s.w && other.ax > s.ax, 'a wider frame, with its feet further in');
  assert.equal(unlike(s, other), 24);
  assert.equal(unlike(s, toSprite({ px, lights: [] })), 0);
  // a frame with no lights and nothing flying from it carries neither
  assert.equal(other.lights, undefined);
  assert.equal(other.tails, undefined);
  // and a frame with nothing painted on it at all is still a frame: one game pixel of nothing
  const none = toSprite({ px: layer(), lights: [] });
  assert.deepEqual([none.w, none.h], [1, 1]);
  assert.equal(paintingOf(none).bounds(), null);
});

/** A figure for the tests below: a body, a hand where the pose puts it, and a scarf tied to its neck. Every pose it is asked for is kept. */
function puppet(): { rig: Rig; asked: { q: Pose; back: boolean }[] } {
  const asked: { q: Pose; back: boolean }[] = [];
  const rig: Rig = (q, back) => {
    asked.push({ q, back });
    const px = layer();
    px.rect(KX - 4, KAY - 40 + Math.round(q.bob), 8, 40 - Math.round(q.bob), STEEL[2]);
    px.rect(KX + 10 + Math.round(q.hx), KAY - 20 + Math.round(q.hy), 2, 2, INK);
    return { px, lights: [], tails: [{ id: 'scarf', x: KX, y: KAY - 38, over: back }] };
  };
  return { rig, asked };
}

test("every animation of one facing: the loops, and the figure's moves as timelines", () => {
  const attack: Timeline = { hit: 0.1, keys: [{ at: 0, pose: {} }, { at: 0.1, pose: { hx: 6 }, ease: 'lin' }, { at: 0.5, pose: {}, ease: 'lin' }] };
  const heavy: Timeline = { hit: 0.2, keys: [{ at: 0, pose: {} }, { at: 0.2, pose: { hy: -6 }, ease: 'lin' }, { at: 0.6, pose: {}, ease: 'lin' }] };
  const leap: Timeline = { keys: [{ at: 0, pose: { bob: 2 } }, { at: 1, pose: { bob: -2 }, ease: 'lin' }] };
  // (a gesture two standing loops long)
  const gesture: Timeline = { keys: [{ at: 0, pose: {} }, { at: 1.2, pose: { hx: 3 }, ease: 'lin' }, { at: 2.4, pose: {}, ease: 'lin' }] };
  const moves: Moves = { attack, heavy, leap, idleA: gesture, idleB: gesture };
  const rest: Partial<Pose> = { aim: 33 };
  const base: Pose = { ...REST, ...rest };
  const { rig, asked } = puppet();
  const set = animSet(rig, false, rest, moves);
  assert.equal(asked.length, 0, 'nothing is painted until it is shown');

  // the two loops, and how fast they play
  assert.deepEqual([set.idle.length, set.walk.length, set.idleFps, set.walkFps], [IDLE_FRAMES, WALK_FRAMES, IDLE_FPS, WALK_FPS]);
  // the moves: a frame for every thirtieth of a second of an attack, and its moment of impact with it
  const clips = set.clips;
  assert.ok(clips && clips.attack && clips.heavy && clips.leap && clips.idleA && clips.idleB);
  if (!clips || !clips.attack || !clips.heavy || !clips.leap || !clips.idleA || !clips.idleB) return;
  assert.deepEqual([clips.attack.frames.length, clips.attack.fps, clips.attack.hit], [frameCount(attack.keys, CLIP_FPS), CLIP_FPS, 0.1]);
  assert.equal(clips.attack.frames.length, 16);
  assert.deepEqual([clips.heavy.frames.length, clips.heavy.fps, clips.heavy.hit], [19, CLIP_FPS, 0.2]);
  // a leap is laid out from 0 to 1 and shown in twelve steps: it has no moment of impact
  assert.deepEqual([clips.leap.frames.length, clips.leap.fps, clips.leap.hit], [13, 12, undefined]);
  // the things done when left standing play slower, and have none either
  assert.deepEqual([clips.idleA.frames.length, clips.idleA.fps, clips.idleA.hit], [49, GESTURE_FPS, undefined]);
  assert.equal(asked.length, 0, 'still nothing painted');

  // each frame is the rig's picture of that moment's pose, every pose starting from the figure's rest pose
  const third = clips.attack.frames[3];
  assert.equal(asked.length, 1, 'one frame asked for, one painted');
  assert.deepEqual(asked[0], { q: clipPoses(attack.keys, base, CLIP_FPS)[3], back: false });
  assert.ok(near(asked[0].q.hx, 6) && asked[0].q.aim === 33);
  assert.ok(clips.attack.frames[3] === third && asked.length === 1, 'and painted once');
  asked.length = 0;
  const still = set.idle[7];
  const step = set.walk[2];
  assert.deepEqual(asked.map((a) => a.q), [{ ...base, ...idlePoses()[7] }, { ...base, ...walkPoses()[2] }]);
  assert.ok(still.tails && still.tails[0].id === 'scarf' && step.tails, 'a frame says where the scarf is tied');
  // an attack begins and ends as the standing loop's first frame, to the pixel
  assert.equal(unlike(clips.attack.frames[0], set.idle[0]), 0);
  assert.equal(unlike(clips.attack.frames[15], set.idle[0]), 0);
  assert.ok(unlike(clips.attack.frames[3], set.idle[0]) > 0);

  // the three stills older code asks an attack for are frames of the timeline: wound up (before
  // the blow), the blow (at it, or a moment after), and after it (on the way back to rest)
  for (const [stills, clip] of [[set.attack, clips.attack], [set.heavy, clips.heavy]] as const) {
    assert.ok(stills && stills.length === 3);
    if (!stills) return;
    const at = stills.map((f) => clip.frames.indexOf(f) / clip.fps);
    const hit = clip.hit ?? 0;
    const end = (clip.frames.length - 1) / clip.fps;
    assert.ok(at.every((t) => t >= 0), 'each is one of the timeline\'s own frames');
    assert.ok(at[0] > 0 && at[0] < hit, `wound up: ${at[0].toFixed(3)} s in, before the blow at ${hit}`);
    assert.ok(at[1] >= hit && at[1] <= hit + 0.07, `the blow: ${at[1].toFixed(3)} s in`);
    assert.ok(at[2] > at[1] + 0.05 && at[2] < end, `after it: ${at[2].toFixed(3)} s in, of ${end.toFixed(3)}`);
  }
  // and the three of a leap: pushing off, in the air, coming down
  assert.ok(set.leap && set.leap.length === 3);
  if (!set.leap) return;
  const leapAt = set.leap.map((f) => clips.leap ? clips.leap.frames.indexOf(f) / 12 : -1);
  assert.ok(leapAt[0] >= 0 && leapAt[0] < 0.18 && leapAt[1] > 0.3 && leapAt[1] < 0.7 && leapAt[2] > 0.8 && leapAt[2] <= 1, `at ${leapAt.join(', ')} of the way`);

  // through a gesture the wind keeps blowing at the standing loop's own pace, whatever its keys say
  asked.length = 0;
  const frames = clips.idleA.frames;
  const mid = frames[30];
  const last = frames[48];
  const timed = clipPoses(gesture.keys, base, GESTURE_FPS);
  assert.ok(near(asked[0].q.wind, 0.25), 'a second and a half in: a loop and a quarter');
  assert.deepEqual({ ...asked[0].q, wind: 0 }, { ...timed[30], wind: 0 }, 'the rest of the pose is the timeline\'s');
  assert.ok(Math.min(asked[1].q.wind, 1 - asked[1].q.wind) < 1e-9, 'and at its end the wind is back where the loop begins');
  assert.equal(unlike(last, set.idle[0]), 0, 'so a gesture of whole loops ends as the loop\'s first frame');
  assert.ok(unlike(mid, set.idle[0]) > 0);

  // facing away: the same loops and attacks, painted from behind, and no gestures
  const behind = puppet();
  const back = animSet(behind.rig, true, rest, moves);
  assert.ok(back.clips && back.clips.attack && back.clips.heavy && back.clips.leap);
  assert.ok(back.clips && back.clips.idleA === undefined && back.clips.idleB === undefined, 'what a hero does when left standing is painted facing the camera only');
  const seen = back.idle[0];
  assert.deepEqual(behind.asked, [{ q: base, back: true }]);
  assert.ok(seen.tails && seen.tails[0].over === true);

  // a figure with an attack and nothing else has nothing else
  const plain = animSet(puppet().rig, false, {}, { attack });
  assert.deepEqual([plain.heavy, plain.leap], [undefined, undefined]);
  assert.ok(plain.clips && plain.clips.attack && !plain.clips.heavy && !plain.clips.leap && !plain.clips.idleA && !plain.clips.idleB);
  assert.equal(plain.attack.length, 3);

  // a rig whose free hand goes from one named place to the next is told where from, where to, and how far along
  const reach: Timeline = { keys: [{ at: 0, pose: {} }, { at: 0.2, pose: { off: 2 }, ease: 'lin' }, { at: 0.4, pose: {}, ease: 'lin' }] };
  const hand = puppet();
  const stepped = animSet(hand.rig, false, {}, { attack: reach }, { stepped: true });
  const smooth = puppet();
  const plainHand = animSet(smooth.rig, false, {}, { attack: reach });
  assert.ok(stepped.clips && stepped.clips.attack && plainHand.clips && plainHand.clips.attack);
  if (!stepped.clips || !stepped.clips.attack || !plainHand.clips || !plainHand.clips.attack) return;
  assert.ok(stepped.clips.attack.frames[3] && plainHand.clips.attack.frames[3]);
  assert.deepEqual([hand.asked[0].q.off, hand.asked[0].q.off2], [0, 2]);
  assert.ok(near(hand.asked[0].q.offK, 0.5));
  assert.ok(near(smooth.asked[0].q.off, 1) && near(smooth.asked[0].q.off2, 1) && smooth.asked[0].q.offK === 0);
});

// From Version 15.1 (Pose.out): a hero's fall ends with the light going out of them.
test('the light goes out of a painting by degrees: what glows cools tone by tone to dull steel, its lights fade, and nothing else is touched', () => {
  const GLOW = ['#ffffff', '#b8fff8', '#8af6f0', '#7af8f0', '#22d0e0', '#0c6a80'];
  const OTHER = ['#d02a30', STEEL[3], INK, '#22b060'];
  const make = (): { px: Px; lights: { x: number; y: number; r: number; color: string; a: number }[] } => {
    const px = new Px(GLOW.length + OTHER.length, 2);
    [...GLOW, ...OTHER].forEach((c, i) => px.set(i, 0, c));
    return { px, lights: [{ x: 1, y: 1, r: 8, color: '#b8fff8', a: 0.5 }] };
  };
  const row = (p: Px): (string | null)[] => Array.from({ length: p.w }, (_, i) => p.get(i, 0));
  // hardly begun: the picture is as it was, and its light a little less
  const a = lightsOut(make(), 0.1);
  assert.deepEqual(row(a.px), [...GLOW, ...OTHER]);
  assert.ok(near(a.lights[0].a ?? 1, 0.45), 'a tenth gone: the light is a tenth dimmer');
  // a step down, and two: each glowing tone is the next one darker; nothing gets brighter
  const b = row(lightsOut(make(), 0.4).px);
  assert.deepEqual(b.slice(0, GLOW.length), ['#8af6f0', '#22d0e0', '#22d0e0', '#22d0e0', '#0c6a80', '#0c6a80']);
  const c = row(lightsOut(make(), 0.7).px);
  assert.deepEqual(c.slice(0, 5), ['#22d0e0', '#0c6a80', '#0c6a80', '#0c6a80', '#0c6a80']);
  // out: no glowing tone is left, the lights are gone, and it is the same shape
  const d = lightsOut(make(), 1);
  for (const col of row(d.px).slice(0, GLOW.length)) assert.ok(col !== null && !GLOW.includes(col), `${col} still glows`);
  assert.equal(d.lights.length, 0);
  // what does not glow is never touched; an empty pixel stays empty
  for (const k of [0.1, 0.4, 0.7, 1]) {
    const f = lightsOut(make(), k);
    assert.deepEqual(row(f.px).slice(GLOW.length), OTHER, `${k}: something that does not glow was changed`);
    assert.equal(f.px.get(0, 1), null);
  }
});

test('a fall is a clip like any other, and as the light goes out of a frame its pool of light goes with it', () => {
  const rig: Rig = (q) => {
    const px = layer();
    px.rect(KX - 2, KAY - 20 + Math.round(q.bob), 4, 20 - Math.round(q.bob), '#ffffff');
    return { px, lights: [{ x: KX, y: KAY - 10, r: 10, color: '#b8fff8', a: 0.6 }] };
  };
  const moves: Moves = { attack: { hit: 0.1, keys: [{ at: 0, pose: {} }, { at: 0.2, pose: {} }] }, fall: { keys: [{ at: 0, pose: {} }, { at: 0.5, pose: { bob: 6, out: 0.5 } }, { at: 1, pose: { bob: 10, out: 1 } }] } };
  const set = animSet(rig, false, {}, moves);
  const fall = set.clips?.fall;
  assert.ok(fall && fall.fps === CLIP_FPS && fall.frames.length === 31, 'thirty-one frames for a second of it');
  if (!fall) return;
  const first = fall.frames[0];
  const half = fall.frames[15];
  const last = fall.frames[30];
  assert.ok(first.aura && (first.lights ?? []).length === 1 && paintingOf(first).get(0, 0) === '#ffffff', 'standing: lit, with its pool of light');
  assert.ok(half.aura && first.aura && near(half.aura.a ?? 1, (first.aura.a ?? 1) * 0.5), 'half out: the pool of light is half as bright');
  assert.ok(near((half.lights ?? [])[0].a ?? 1, 0.3), 'and so is its own light');
  assert.ok(!last.aura && (last.lights ?? []).length === 0, 'out: no pool of light, no light');
  assert.equal(paintingOf(last).get(0, 0), STEEL[2], 'and what was white is plain steel');
  // a figure with no fall has no such clip
  assert.equal(animSet(rig, false, {}, { attack: moves.attack }).clips?.fall, undefined);
});

