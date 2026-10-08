// Tests for src/engine/tails.ts: the scarves and feathers that really move (Version 11). The
// chains and their painting are plain arithmetic; only putting the result on the screen needs a
// canvas, and that part is not tested here.
//
// The numbers a test compares against were measured from the code as it is (4 Oct 2026) and each
// threshold stands well clear of what was measured: the measured value is given beside it.
//   run: tsx --test tests/tails.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { TAIL_PATCH, Tails } from '../src/engine/tails';
import type { TailDef, TailRoot } from '../src/engine/tails';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const SCARF: TailDef = { n: 8, seg: 1.8, w0: 5, w1: 2.6, dark: '#7a1058', mid: '#e0287a', light: '#ff7aa8', gravity: 120, wind: 230, flutter: 260, rate: 1.6, drag: 5 };
const QUILL: TailDef = { n: 6, seg: 1.6, w0: 2, w1: 1.4, belly: 2, dark: '#0c6a80', mid: '#22d0e0', light: '#b8fff8', rest: [[0.4, -1], [-0.2, -1], [-0.8, -0.6], [-1, 0.1], [-1, 0.5], [-0.8, 0.8]], stiff: 1, gravity: 30, wind: 60, flutter: 80, rate: 2.2, drag: 8, glow: { color: '#b8fff8', r: 6, a: 0.4 } };
const DEFS = { scarf: SCARF, quill: QUILL };
const INK = '#0e0c24';
/** A frame 56 x 56 game pixels with its anchor at (26, 51), like the heroes'. */
const AX = 26;
const AY = 51;
const ROOTS: TailRoot[] = [{ id: 'scarf', x: 25, y: 30, over: false }];
const FEATHER: TailRoot[] = [{ id: 'quill', x: 27, y: 14, over: true }];
const BOTH: TailRoot[] = [...ROOTS, ...FEATHER];
const DT = 1 / 60;
/** The scarf laid out straight. */
const LENGTH = SCARF.n * SCARF.seg;
const still = (): [number, number] => [0, 0];

/** Move the tails on for `seconds`, `fps` steps to the second; `at` says where the figure's feet are at each moment. */
function run(t: Tails, seconds: number, roots: TailRoot[], facing: number, at: (time: number) => [number, number], each?: (time: number) => void, fps = 60): void {
  for (let k = 1; k <= Math.round(seconds * fps); k++) {
    const [ox, oy] = at(k / fps);
    t.step(1 / fps, roots, AX, AY, facing, ox, oy);
    if (each) each(k / fps);
  }
}

/** A chain's points, as x, y pairs in pixels from the figure's feet. */
function points(t: Tails, id = 'scarf'): number[] {
  const s = t.shapes().find((c) => c.id === id);
  if (!s) throw new Error(`no tail called ${id}`);
  return s.points;
}

function tip(t: Tails, id = 'scarf'): [number, number] {
  const p = points(t, id);
  return [p[p.length - 2], p[p.length - 1]];
}

/** How far the link that is furthest from its length is from it, as a share of that length; and the same for the chain as a whole. */
function strain(t: Tails, id: string, def: TailDef): { link: number; whole: number } {
  const p = points(t, id);
  let link = 0;
  let sum = 0;
  for (let i = 1; i <= def.n; i++) {
    const len = Math.hypot(p[i * 2] - p[i * 2 - 2], p[i * 2 + 1] - p[i * 2 - 1]);
    link = Math.max(link, Math.abs(len - def.seg) / def.seg);
    sum += len;
  }
  return { link, whole: Math.abs(sum - def.n * def.seg) / (def.n * def.seg) };
}

const mean = (a: number[]): number => a.reduce((x, y) => x + y, 0) / a.length;

/** Watch a standing scarf for a while: where its free end is (from the feet, wherever they stand), on average and at its extremes. */
function standing(t: Tails, seconds: number, at: () => [number, number] = still): { x: number; y: number; back: number; fore: number; low: number; high: number } {
  const xs: number[] = [];
  const ys: number[] = [];
  run(t, seconds, ROOTS, 1, at, () => {
    const q = tip(t);
    xs.push(q[0]);
    ys.push(q[1]);
  });
  return { x: mean(xs), y: mean(ys), back: Math.min(...xs), fore: Math.max(...xs), high: Math.min(...ys), low: Math.max(...ys) };
}

test('a scarf in the wind hangs back from where it is tied and ripples, and its links keep their length', () => {
  const t = new Tails(DEFS);
  run(t, 3, ROOTS, 1, still);
  const kx = 25 - AX;
  const ky = 30 - AY;
  let link = 0;
  const xs: number[] = [];
  const ys: number[] = [];
  run(t, 4, ROOTS, 1, still, () => {
    const p = points(t);
    // its first point is where the frame fixes it, measured from the feet
    assert.ok(Math.abs(p[0] - kx) < 1e-4 && Math.abs(p[1] - ky) < 1e-4, 'the knot stays where it is tied');
    link = Math.max(link, strain(t, 'scarf', SCARF).link);
    const q = tip(t);
    xs.push(q[0] - kx);
    ys.push(q[1] - ky);
  });
  // (neighbours are pulled back to their distance from both sides, a few times over: that leaves
  // a link very nearly, not exactly, its length. Standing in the wind the worst is 2.2% out)
  assert.ok(link < 0.05, `no link is more than a twentieth out of its length (${(link * 100).toFixed(1)}%)`);
  // back: the free end never comes nearer than 9.0 pixels behind the knot, of 14.4
  assert.ok(Math.max(...xs) < -LENGTH * 0.5, `the free end is always well behind the knot (${Math.max(...xs).toFixed(1)} at its nearest)`);
  // down: between 1.8 and 9.6 pixels below the knot, 6.3 on average
  assert.ok(Math.min(...ys) > -2, 'and never above it');
  assert.ok(mean(ys) > 2, `it hangs (${mean(ys).toFixed(1)} below the knot on average)`);
  // it keeps moving: the wind ripples it (7.9 pixels from its highest to its lowest)
  assert.ok(Math.max(...ys) - Math.min(...ys) > 2, `the free end rides up and down (${(Math.max(...ys) - Math.min(...ys)).toFixed(2)} px)`);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 1, 'and in and out');
});

test('it faces the other way with the figure', () => {
  const right = new Tails(DEFS);
  const left = new Tails(DEFS);
  // (mirrored, the knot is on the other side of the picture: 52 - 25)
  const mirrored: TailRoot[] = [{ id: 'scarf', x: 27, y: 30, over: false }];
  run(right, 3, ROOTS, 1, still);
  run(left, 3, mirrored, -1, still);
  const kx = 27 - AX;
  for (let k = 0; k < 240; k++) {
    right.step(DT, ROOTS, AX, AY, 1, 0, 0);
    left.step(DT, mirrored, AX, AY, -1, 0, 0);
    assert.ok(tip(left)[0] > kx + LENGTH * 0.5, 'the free end is on the right of a figure facing left');
    // and it is the same scarf seen in a mirror: every point, at every moment
    const a = points(right);
    const b = points(left);
    for (let i = 0; i <= SCARF.n; i++) {
      assert.ok(Math.abs(b[i * 2] - kx + (a[i * 2] - (25 - AX))) < 1e-3 && Math.abs(b[i * 2 + 1] - a[i * 2 + 1]) < 1e-3, `point ${i} is the mirror image of its twin`);
    }
  }
});

test('running pulls it out behind; stopping lets it swing on past where it hangs', () => {
  const t = new Tails(DEFS);
  run(t, 2, ROOTS, 1, still);
  const rest = standing(t, 4);
  // run to screen-right at 90 pixels a second (a hero runs at about 100), and watch the second
  // half of it, once the scarf has been pulled out
  const xs: number[] = [];
  const ys: number[] = [];
  let steady = 0;
  let jerk = 0;
  run(t, 1.5, ROOTS, 1, (time) => [time * 90, 0], (time) => {
    const s = strain(t, 'scarf', SCARF);
    jerk = Math.max(jerk, s.link);
    if (time <= 0.75) return;
    const q = tip(t);
    xs.push(q[0]);
    ys.push(q[1]);
    steady = Math.max(steady, s.link);
  });
  // (measured: 2.6 pixels further back and 4.2 higher than where it hangs)
  assert.ok(mean(xs) < rest.x - 1, `running into the wind it trails further back (${(mean(xs) - rest.x).toFixed(1)} px)`);
  assert.ok(mean(ys) < rest.y - 1.5, `and is lifted, not dropped (${(mean(ys) - rest.y).toFixed(1)} px)`);
  // the run does not pull it out long: 3.5% on the worst link once it is trailing. The jerk of
  // the start (from standing to full speed between one step and the next) does stretch the link
  // at the knot for a moment, by 14%: it must not come to more than a quarter.
  assert.ok(steady < 0.08, `trailing behind a run, no link is more than a twelfth out (${(steady * 100).toFixed(1)}%)`);
  assert.ok(jerk < 0.25, `not even at the start (${(jerk * 100).toFixed(1)}%)`);
  // stop dead: it carries on forward, further than the wind alone ever lets it come
  // (5.8 pixels forward of where it hangs; standing, it never comes more than 2.6 forward)
  let most = -Infinity;
  run(t, 0.6, ROOTS, 1, () => [135, 0], () => (most = Math.max(most, tip(t)[0])));
  assert.ok(most > rest.fore + 1, `after a stop the free end swings forward of where it hangs (${(most - rest.x).toFixed(1)} px; the wind alone brings it ${(rest.fore - rest.x).toFixed(1)})`);
  // and then it settles where it was. (Watched for as long as before: the wind comes in gusts
  // nearly four seconds apart, and over four seconds the average place of the free end does not
  // wander by more than a quarter of a pixel.)
  run(t, 1.5, ROOTS, 1, () => [135, 0]);
  const after = standing(t, 4, () => [135, 0]);
  assert.ok(Math.abs(after.x - rest.x) < 1 && Math.abs(after.y - rest.y) < 1, `and comes back (${(after.x - rest.x).toFixed(2)}, ${(after.y - rest.y).toFixed(2)})`);
  // running down the screen lifts it up behind (19 pixels above where it hangs)
  const down: number[] = [];
  run(t, 1, ROOTS, 1, (time) => [135, time * 80], (time) => {
    if (time > 0.5) down.push(tip(t)[1]);
  });
  assert.ok(mean(down) < rest.y - 5, `running down the screen leaves it trailing above (${(mean(down) - rest.y).toFixed(1)} px)`);
});

test('how often the game draws does not change what the scarf does: its tied end is carried smoothly between steps', () => {
  // (a tail jerked along once a frame is thrown about by every jerk, and more at 25 frames a
  // second than at 60: so the tied end is carried from where it was to where it is in small steps)
  const story = (fps: number): number[][] => {
    const t = new Tails(DEFS);
    const seen: number[][] = [];
    const part = (seconds: number, at: (time: number) => [number, number]): void => {
      run(t, seconds, ROOTS, 1, at, undefined, fps);
      seen.push(points(t).slice());
    };
    part(3, still);
    part(1.5, (time) => [time * 90, 0]);
    part(0.6, () => [135, 0]);
    part(2, () => [135, 0]);
    return seen;
  };
  const at60 = story(60);
  // (measured: 30 a second is the same to the last decimal; 25 and 144 are within 0.6 of a pixel)
  for (const fps of [30, 25, 144]) {
    const other = story(fps);
    at60.forEach((p, stage) => {
      let worst = 0;
      for (let i = 0; i < p.length; i++) worst = Math.max(worst, Math.abs(p[i] - other[stage][i]));
      assert.ok(worst < 1.5, `at ${fps} frames a second the scarf is where it is at 60, after ${['standing', 'a run', 'a stop', 'settling'][stage]} (${worst.toFixed(2)} px off)`);
    });
  }
});

test('a quill keeps the shape it grew in, and carries its light', () => {
  const t = new Tails(DEFS);
  run(t, 2, FEATHER, 1, still);
  // where the shape alone puts each point
  const grown: number[] = [27 - AX, 14 - AY];
  for (const r of QUILL.rest ?? []) {
    const len = Math.hypot(r[0], r[1]);
    grown.push(grown[grown.length - 2] + (r[0] / len) * QUILL.seg, grown[grown.length - 1] + (r[1] / len) * QUILL.seg);
  }
  const off = (): number[] => {
    const p = points(t, 'quill');
    const out: number[] = [];
    for (let i = 0; i <= QUILL.n; i++) out.push(Math.hypot(p[i * 2] - grown[i * 2], p[i * 2 + 1] - grown[i * 2 + 1]));
    return out;
  };
  // standing, the wind only trembles it: every point within a tenth of a pixel of its place
  let stand = 0;
  run(t, 2, FEATHER, 1, still, () => (stand = Math.max(stand, ...off())));
  assert.ok(stand < 0.5, `standing, the quill is in its shape (${stand.toFixed(2)} px off at most)`);
  assert.ok(strain(t, 'quill', QUILL).link < 0.02, 'and its links are their length');
  // running bends it back (its free end 1.9 pixels out of place) but it stays a feather: laid
  // flat along the wind its free end would be 4.9 out
  let worst = 0;
  run(t, 1.5, FEATHER, 1, (time) => [time * 90, 0], () => (worst = Math.max(worst, off()[QUILL.n])));
  assert.ok(worst > 0.5, `running bends it (${worst.toFixed(2)} px)`);
  assert.ok(worst < 3.5, `but does not flatten it (${worst.toFixed(2)} px)`);
  // its light: one, as the tail says it is, and on the feather (three fifths of the way along
  // unless the tail says otherwise: between the fourth point and the fifth of this one)
  const lights = t.lights();
  assert.equal(lights.length, 1);
  assert.deepEqual([lights[0].color, lights[0].r, lights[0].a], ['#b8fff8', 6, 0.4]);
  const p = points(t, 'quill');
  const [ax, ay, bx, by] = [p[6], p[7], p[8], p[9]];
  const u = ((lights[0].x - ax) * (bx - ax) + (lights[0].y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2);
  assert.ok(u > 0.5 && u < 0.7, `the light is six tenths of the way from the fourth point to the fifth (${u.toFixed(2)})`);
  assert.ok(Math.hypot(lights[0].x - (ax + (bx - ax) * u), lights[0].y - (ay + (by - ay) * u)) < 0.01, 'the light sits on the feather');
  // a tail that does not glow gives no light, and no tails give none
  const plain = new Tails(DEFS);
  run(plain, 0.5, ROOTS, 1, still);
  assert.equal(plain.lights().length, 0);
  assert.equal(new Tails(DEFS).lights().length, 0);
});

test('a figure moved a long way at once takes its tails along; a tail that leaves the figure is forgotten', () => {
  const t = new Tails(DEFS);
  const twin = new Tails(DEFS);
  run(t, 2, BOTH, 1, still);
  run(twin, 2, BOTH, 1, still);
  const before = t.shapes().map((s) => s.points.slice());
  // a warp across the level for one, an ordinary moment standing still for its twin
  t.step(DT, BOTH, AX, AY, 1, 900, -400);
  twin.step(DT, BOTH, AX, AY, 1, 0, 0);
  const after = t.shapes().map((s) => s.points);
  const same = twin.shapes().map((s) => s.points);
  assert.equal(after.length, 2);
  for (let c = 0; c < after.length; c++) {
    for (let i = 0; i < after[c].length; i++) {
      // (to a thousandth of a pixel: the sums are done 900 pixels from the origin, in single precision)
      assert.ok(Math.abs(after[c][i] - same[c][i]) < 0.01, 'the tails are as they would be had the figure not moved at all');
      assert.ok(Math.abs(after[c][i] - before[c][i]) < 1.5, 'the shape is as it was, not stretched across the level');
    }
  }
  assert.ok(strain(t, 'scarf', SCARF).whole < 0.05, 'and as long as it was');
  // it goes on from there as from anywhere
  run(t, 1, BOTH, 1, () => [900, -400]);
  assert.ok(tip(t)[0] < 25 - AX - LENGTH * 0.5, 'still hanging back from the knot');
  // a tail the frame no longer names is dropped
  t.step(DT, ROOTS, AX, AY, 1, 900, -400);
  assert.deepEqual(t.shapes().map((s) => s.id), ['scarf']);
  t.step(DT, undefined, AX, AY, 1, 900, -400);
  assert.equal(t.shapes().length, 0);
  // an unknown tail is ignored
  t.step(DT, [{ id: 'nothing', x: 0, y: 0, over: true }], AX, AY, 1, 900, -400);
  assert.equal(t.shapes().length, 0);
  // one that comes back starts afresh where the figure is now, in its still-air shape: back and down from the knot
  t.step(DT, ROOTS, AX, AY, 1, 900, -400);
  const p = points(t);
  assert.ok(Math.abs(p[0] - (25 - AX)) < 1e-3 && Math.abs(p[1] - (30 - AY)) < 1e-3, 'tied where the frame says');
  assert.ok(strain(t, 'scarf', SCARF).whole < 0.05, 'its own length, not pulled out from where it last was');
  assert.ok(tip(t)[0] < p[0] - LENGTH * 0.5 && tip(t)[1] > p[1], 'hanging back and down');
  // and a new figure starts with none
  t.reset();
  assert.equal(t.shapes().length, 0);
  assert.equal(t.lights().length, 0);
});

/** The colours painted inside a box, and how many pixels of each. */
function tones(buf: Uint8ClampedArray, box: { x0: number; y0: number; x1: number; y1: number }): Map<string, number> {
  const out = new Map<string, number>();
  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      const c = colour(buf, x, y);
      if (c !== null) out.set(c, (out.get(c) ?? 0) + 1);
    }
  }
  return out;
}

/** The colour of one pixel of the patch, or null where nothing is painted. */
function colour(buf: Uint8ClampedArray, x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= TAIL_PATCH.w || y >= TAIL_PATCH.h) return null;
  const o = (y * TAIL_PATCH.w + x) * 4;
  if (buf[o + 3] === 0) return null;
  return '#' + [buf[o], buf[o + 1], buf[o + 2]].map((v) => (v < 16 ? '0' : '') + v.toString(16)).join('');
}

test('painted: three tones of its colour with a dark seam round it, where the chain is, on the right side of the figure', () => {
  const t = new Tails(DEFS);
  run(t, 2, BOTH, 1, still);
  const buf = new Uint8ClampedArray(TAIL_PATCH.w * TAIL_PATCH.h * 4);
  const behind = t.paint(buf, false);
  assert.ok(behind !== null);
  if (!behind) return;
  // (measured: 53 pixels of the light tone, 19 of the middle one, 51 of the dark, 63 of seam)
  const seen = tones(buf, behind);
  assert.deepEqual([...seen.keys()].sort(), [INK, SCARF.dark, SCARF.mid, SCARF.light].sort(), 'the scarf, behind the figure: its three tones and the seam, and no feather');
  for (const c of [SCARF.dark, SCARF.mid, SCARF.light]) assert.ok((seen.get(c) ?? 0) >= 8, `a visible amount of ${c} (${seen.get(c)} pixels)`);
  const cloth = (seen.get(SCARF.dark) ?? 0) + (seen.get(SCARF.mid) ?? 0) + (seen.get(SCARF.light) ?? 0);
  assert.ok(cloth > 60, `a visible amount of cloth (${cloth} pixels)`);
  // the seam goes all the way round: no pixel of cloth has nothing beside it, and no pixel of
  // seam is away from the cloth. And the cloth is lit from the upper left, like everything the
  // kit paints: its light tone lies up and left of its dark one.
  let lightAt = 0;
  let darkAt = 0;
  let painted = 0;
  for (let y = 0; y < TAIL_PATCH.h; y++) {
    for (let x = 0; x < TAIL_PATCH.w; x++) {
      const c = colour(buf, x, y);
      if (c === null) continue;
      painted++;
      assert.ok(x >= behind.x0 && x <= behind.x1 && y >= behind.y0 && y <= behind.y1, 'nothing is painted outside the box that is handed back');
      const round = [colour(buf, x - 1, y), colour(buf, x + 1, y), colour(buf, x, y - 1), colour(buf, x, y + 1)];
      if (c === INK) assert.ok(round.some((n) => n !== null && n !== INK), 'every pixel of seam lies against the cloth');
      else assert.ok(round.every((n) => n !== null), 'every pixel of cloth has cloth or seam on all four sides');
      if (c === SCARF.light) lightAt += x + y;
      if (c === SCARF.dark) darkAt += x + y;
    }
  }
  assert.ok(painted === cloth + (seen.get(INK) ?? 0));
  assert.ok(lightAt / (seen.get(SCARF.light) ?? 1) < darkAt / (seen.get(SCARF.dark) ?? 1) - 1, 'light along its upper-left edge, shade along its lower-right');
  // it is painted where the chain is: every point of the chain lies on cloth
  const p = points(t);
  for (let i = 0; i <= SCARF.n; i++) {
    const c = colour(buf, Math.floor(p[i * 2] * 2 + TAIL_PATCH.hw), Math.floor(p[i * 2 + 1] * 2 + TAIL_PATCH.up));
    assert.ok(c !== null && c !== INK, `point ${i} of the chain is on the cloth`);
  }
  // in front of the figure: only the feather, in its own three tones
  const front = t.paint(buf, true);
  assert.ok(front !== null);
  if (!front) return;
  const feather = tones(buf, front);
  assert.deepEqual([...feather.keys()].sort(), [INK, QUILL.dark, QUILL.mid, QUILL.light].sort(), 'the feather, in front of the figure, and no scarf');
  assert.ok((feather.get(QUILL.dark) ?? 0) + (feather.get(QUILL.mid) ?? 0) + (feather.get(QUILL.light) ?? 0) > 30, 'a visible feather');
  const q = points(t, 'quill');
  for (let i = 0; i <= QUILL.n; i++) {
    const x = q[i * 2] * 2 + TAIL_PATCH.hw;
    const y = q[i * 2 + 1] * 2 + TAIL_PATCH.up;
    assert.ok(x >= front.x0 && x <= front.x1 && y >= front.y0 && y <= front.y1, `point ${i} of the quill is inside the painted box`);
  }
  // nothing to paint: nothing painted
  assert.equal(new Tails(DEFS).paint(buf, true), null);
  const plain = new Tails(DEFS);
  run(plain, 0.5, ROOTS, 1, still);
  assert.equal(plain.paint(buf, true), null, 'a scarf behind the figure is not painted in front of it');
});

test('a fringe: the last of the free end is in another colour, and only the last of it', () => {
  // (the mage's scarf has one)
  const fringe = '#22d0e0';
  const t = new Tails({ scarf: { ...SCARF, tip: fringe } });
  run(t, 2, ROOTS, 1, still);
  const buf = new Uint8ClampedArray(TAIL_PATCH.w * TAIL_PATCH.h * 4);
  const box = t.paint(buf, false);
  assert.ok(box !== null);
  if (!box) return;
  const seen = tones(buf, box);
  assert.deepEqual([...seen.keys()].sort(), [INK, SCARF.dark, SCARF.mid, SCARF.light, fringe].sort());
  // (measured: 7 pixels of it, the nearest of them 12.4 pixels from the knot along a scarf of 14.4)
  assert.ok((seen.get(fringe) ?? 0) >= 3, `the fringe shows (${seen.get(fringe)} pixels)`);
  const p = points(t);
  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      if (colour(buf, x, y) !== fringe) continue;
      const fromKnot = Math.hypot((x + 0.5 - TAIL_PATCH.hw) / 2 - p[0], (y + 0.5 - TAIL_PATCH.up) / 2 - p[1]);
      const fromEnd = Math.hypot((x + 0.5 - TAIL_PATCH.hw) / 2 - p[SCARF.n * 2], (y + 0.5 - TAIL_PATCH.up) / 2 - p[SCARF.n * 2 + 1]);
      assert.ok(fromEnd < 3 && fromKnot > LENGTH * 0.7, 'the fringe is at the free end');
    }
  }
});
