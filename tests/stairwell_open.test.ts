// THE STAIRWELL OPENS (src/art/stairwell_open.ts; a mock-up nothing of the game imports), on all four of
// the Crypt's floors and both ways down: its last frame is makeStairwell's picture to the pixel; the
// checks every floor's moments go through (tests/floor_checks.ts, the moments' part: floorChecks takes a
// floor's pieces too, so they are written out here as they are there); and what this moment must do,
// checked against his Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as
// possible.  I’d rather it be a notch too high than a notch too low.”; 07:53: “And I want all
// animations checked against this statement before I see them.”).
//   run: tsx --test tests/stairwell_open.test.ts

import { CRYPT_FLOORS } from '../src/art/crypt';
import { makeStairwell } from '../src/art/crypt_ways';
import type { Moment } from '../src/art/floorkit';
import { stairwellOpens } from '../src/art/stairwell_open';
import { assert, count, each, hsv, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();

const WAYS = ['x', 'y'] as const;
const all: { label: string; k: number; way: 'x' | 'y'; m: Moment; ms: number }[] = [];
for (let k = 1; k <= 4; k++) {
  for (const way of WAYS) {
    const t0 = performance.now();
    const m = stairwellOpens(CRYPT_FLOORS[k - 1], way);
    all.push({ label: `floor ${k}, way ${way}`, k, way, m, ms: performance.now() - t0 });
  }
}

/** The top of what is painted in a frame, from the anchor (picture pixels; up is less). */
const topOf = (s: Moment['frames'][number]): number => {
  let top = Infinity;
  each(s, (_r, _g, _b, _a, _x, y) => (top = Math.min(top, y)));
  return top - Math.round(s.ay * (s.density ?? 1));
};
const pieces = (m: Moment) => m.tracks.filter((t) => t.name.startsWith('a slab') || t.name.startsWith('a lump'));
const rowOf = (name: string): number => Number(/row (\d)/.exec(name)![1]);

test('the stairwell opens: how long all eight take to paint (each once, then kept)', () => {
  const total = all.reduce((t, a) => t + a.ms, 0);
  console.log(`  painted: ${all.map((a) => `${a.label} ${a.ms.toFixed(0)} ms`).join('; ')}; all eight ${(total / 1000).toFixed(1)} s`);
  assert.ok(total < 40000, `all eight took ${(total / 1000).toFixed(1)} s`);
});

for (const { label, k, way, m } of all) {
  test(`the stairwell opens, ${label}: nothing before it (the floor is the game's own), its first frame empty; its last frame is makeStairwell's picture, to the pixel`, () => {
    assert.ok(m.before === null, 'something before it');
    assert.ok(count(m.frames[0]) === 0, `its first frame has ${count(m.frames[0])} pixels`);
    const stair = makeStairwell(CRYPT_FLOORS[k - 1], way);
    assert.ok(unlike(m.frames[m.frames.length - 1], stair) === 0, `its last frame differs from the stairwell by ${unlike(m.frames[m.frames.length - 1], stair)} pixels`);
    assert.ok(m.after !== null && unlike(m.after[0], stair) === 0, 'what is left is not the stairwell');
    // (lined up by the anchor: the stairwell's anchor, the corner of the opening up the screen)
    const last = m.frames[m.frames.length - 1];
    assert.ok(count(last) === count(stair), `its last frame has ${count(last)} pixels, the stairwell ${count(stair)}`);
  });

  test(`the stairwell opens, ${label}: crisp, 30 a second, between 1.5 and 2.5 seconds, no glow of a friend's or an enemy's`, () => {
    assert.ok(m.fps === 30, `${m.fps} a second`);
    const s = m.frames.length / m.fps;
    assert.ok(s >= 1.5 && s <= 2.5, `${s.toFixed(2)} s`);
    let soft = 0;
    let cyan = 0;
    let pink = 0;
    for (const f of m.frames) {
      each(f, (r, g, b, a) => {
        if (a !== 255) soft++;
        const [h, sa, v] = hsv(r, g, b);
        if (h >= 168 && h <= 200 && sa > 0.45 && v > 0.5) cyan++;
        if (h >= 300 && h <= 352 && sa > 0.45 && v > 0.55) pink++;
      });
    }
    assert.ok(soft === 0 && cyan === 0 && pink === 0, `${soft} soft, ${cyan} cyan, ${pink} pink pixels`);
    for (const f of m.frames) assert.ok(f.density === 2, 'not two picture pixels to a game pixel');
  });

  // THE MOMENTS' CHECKS (as tests/floor_checks.ts has them for every floor's moments)
  test(`the stairwell opens, ${label}, the moments' checks: nothing jumps; nothing pops in or out but on a jolt; the painted pixels change at most 45% a frame but on a jolt; always moving; never more than 4 loose pixels in a frame`, () => {
    assert.ok(m.holds.length === 0, `held ${m.holds.length} frames`);
    for (const t of m.tracks) {
      let seen = false;
      for (let i = 0; i < t.at.length; i++) {
        const b = t.at[i];
        const now = b ? b.shown : 0;
        if (now > 0) seen = true;
        if (i === 0) continue;
        const a = t.at[i - 1];
        const was = a ? a.shown : 0;
        const jolt = m.jolts.includes(i);
        if (a && b) {
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          assert.ok(d <= (a.size + b.size) / 2 + 2, `${t.name}, frame ${i}: moved ${d.toFixed(1)}`);
        }
        if (now - was > 0.35) assert.ok(t.fromEdge || jolt || (b !== null && b.size <= 8), `${t.name}: popped in at frame ${i} (${(was * 100).toFixed(0)}% to ${(now * 100).toFixed(0)}%)`);
        if (was - now > 0.35) assert.ok(jolt, `${t.name}: frame ${i} lost ${((was - now) * 100).toFixed(0)}% of it at once`);
      }
      assert.ok(seen, `${t.name}: seen at all`);
    }
    for (let i = 1; i < m.frames.length; i++) {
      const d = unlike(m.frames[i - 1], m.frames[i]);
      assert.ok(d >= 4, `frame ${i} hardly changed (${d} pixels)`);
      if (m.jolts.includes(i)) continue;
      const a = count(m.frames[i - 1]);
      const b = count(m.frames[i]);
      assert.ok(Math.abs(b - a) <= 0.45 * Math.max(a, b, 120), `frame ${i}: ${a} to ${b} pixels`);
    }
    m.frames.forEach((s, i) => {
      const q = paintingOf(s);
      let loose = 0;
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
        if (!q.has(x, y)) continue;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
        if (n === 0) loose++;
      }
      assert.ok(loose <= 4, `frame ${i}: ${loose} loose pixels`);
    });
  });

  // WHAT IT MUST DO
  test(`the stairwell opens, ${label}: the kerb shoves up out of the floor on the heave, past its height and back`, () => {
    const kerb = m.tracks.find((t) => t.name === 'the kerb')!.at;
    const heave = m.jolts[1];
    assert.ok(kerb[heave - 1] === null && kerb[heave] !== null, 'the kerb is not there before the heave, and is on it');
    const ups = kerb.filter((a) => a !== null).map((a) => -a!.y);
    assert.ok(Math.max(...ups) >= 8 && ups[ups.length - 1] === 6, `the kerb rises to ${Math.max(...ups)} and ends at ${ups[ups.length - 1]}`);
  });

  test(`the stairwell opens, ${label}: the slabs go one after another down the line of the steps, each falling a long way into the dark and out of sight`, () => {
    const ps = pieces(m);
    assert.ok(ps.length >= 8, `${ps.length} pieces of the lid`);
    const heave = m.jolts[1];
    const starts: { row: number; f: number }[] = [];
    for (const t of ps) {
      // (where it lay, loose: thrown up on the heave, it drops back 6 pixels to sag there)
      const y0 = t.at[heave]!.y + 6;
      // (when it starts down: well below where it lay)
      const f = t.at.findIndex((a, i) => i > heave && a !== null && a.y > y0 + 4);
      assert.ok(f > 0, `${t.name} never falls`);
      starts.push({ row: rowOf(t.name), f });
      // a long way: its middle at least 40 picture pixels down the screen from where it lay, and gone (out of sight, and then not there) before the end
      const ys = t.at.filter((a) => a !== null).map((a) => a!.y);
      assert.ok(Math.max(...ys) - y0 >= 40, `${t.name} falls only ${(Math.max(...ys) - y0).toFixed(0)}`);
      const lastSeen = t.at.reduce((n, a, i) => (a && a.shown > 0.02 ? i : n), -1);
      assert.ok(lastSeen < m.frames.length - 20, `${t.name} is still in sight at frame ${lastSeen}`);
      assert.ok(t.at[t.at.length - 1] === null, `${t.name} is still there at the end`);
      // into the dark: it goes out of sight bit by bit, over three frames or more (from the last frame it shows half as much as it did thrown up on the heave to the first it is out of sight)
      const rest = t.at[heave]!.shown;
      const half = t.at.reduce((n, a, i) => (a && a.shown >= rest / 2 ? i : n), -1);
      const out = t.at.findIndex((a, i) => i > half && (a === null || a.shown <= 0.02));
      assert.ok(out - half >= 3, `${t.name} goes in ${out - half} frames`);
    }
    // (row by row, down the way the steps go)
    for (const a of starts) for (const b of starts) if (a.row < b.row) assert.ok(a.f < b.f, `row ${a.row} starts down at ${a.f}, row ${b.row} at ${b.f}`);
  });

  test(`the stairwell opens, ${label}: the slabs fall fast and slam: faster every frame as they drop, the deep ones' slams jolts`, () => {
    const ps = pieces(m);
    // (the jolts after the heave: on each, a slab that was dropping fast stops short)
    for (const j of m.jolts.slice(2)) {
      const slam = ps.some((t) => {
        const a = t.at[j - 2];
        const b = t.at[j - 1];
        const c = t.at[j];
        const d = t.at[j + 1];
        if (!a || !b || !c || !d) return false;
        const before = c.y - b.y;
        return before >= 5 && before > b.y - a.y && d.y - c.y < before * 0.75;
      });
      assert.ok(slam, `no slab slams at the jolt on frame ${j}`);
    }
    assert.ok(m.jolts.length >= 5 && m.jolts[0] === 1, `jolts ${m.jolts.join(' ')}`);
  });

  test(`the stairwell opens, ${label}: the dust blows up high out of the hole after the last slam and comes down fast, and it ends still: the stairwell as it lies`, () => {
    const great = m.jolts[m.jolts.length - 1];
    const tops = m.frames.map(topOf);
    const own = topOf(m.after![0]);
    const highest = Math.min(...tops);
    const at = tops.indexOf(highest);
    // (higher than three of the tallest hero, 58 picture pixels: up off the anchor at the opening's corner)
    assert.ok(highest <= -174, `the dust goes up only ${-highest} pixels`);
    assert.ok(at > great && at - great <= 12, `it is highest ${at - great} frames after the great burst`);
    // and down again: within a second of its height it is back under half of it
    const down = tops.findIndex((t, i) => i > at && t > highest / 2);
    assert.ok(down > 0 && down - at <= 30, `it comes down in ${down - at} frames`);
    // it ends still: the last six frames hardly change (grit and the last of the dust), and the last is the stairwell
    for (let i = m.frames.length - 6; i < m.frames.length; i++) {
      const d = unlike(m.frames[i - 1], m.frames[i]);
      assert.ok(d <= 300, `frame ${i}: ${d} pixels change`);
    }
    assert.ok(tops[tops.length - 1] === own, 'something is left over the stairwell');
  });
}
