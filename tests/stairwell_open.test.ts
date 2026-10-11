// THE STAIRWELL OPENS (src/art/stairwell_open.ts; a mock-up nothing of the game imports), on all four of
// the Crypt's floors and both ways down, and where the floor's joints cut its flagstones small: its last
// frame is makeStairwell's picture to the pixel; before anything moves, the floor over the opening is the
// game's own floor at its tile, to the pixel; the checks every floor's moments go through (tests/
// floor_checks.ts, the moments' part: floorChecks takes a floor's pieces too, so they are written out here
// as they are there); and what this moment must do, checked against his Animations 1 (10 Oct, 07:47: “as
// big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too
// low.”; 07:53: “And I want all animations checked against this statement before I see them.”) and the
// fresh look's ten points on its first cut (docs/mockups/stairwell_open/README.md).
//   run: tsx --test tests/stairwell_open.test.ts

import { CRYPT_FLOORS, cryptGround } from '../src/art/crypt';
import { makeStairwell } from '../src/art/crypt_ways';
import type { Moment } from '../src/art/floorkit';
import { stairwellKicks, stairwellNotes, stairwellOpens } from '../src/art/stairwell_open';
import { assert, count, each, hsv, rgb, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();

// (floor 4 where the floor under the opening is mostly earth, as the dev page has it; floor 1 once more where its joints cut fifteen flagstones, some of them slivers)
const RUNS: [number, 'x' | 'y', [number, number]][] = [
  [1, 'x', [0, 0]],
  [1, 'y', [0, 0]],
  [2, 'x', [0, 0]],
  [2, 'y', [0, 0]],
  [3, 'x', [0, 0]],
  [3, 'y', [0, 0]],
  [4, 'x', [5, 5]],
  [4, 'y', [0, 5]],
  [1, 'x', [1, 4]],
];
const all: { label: string; k: number; way: 'x' | 'y'; at: [number, number]; m: Moment; ms: number }[] = [];
for (const [k, way, at] of RUNS) {
  const t0 = performance.now();
  const m = stairwellOpens(CRYPT_FLOORS[k - 1], way, at);
  all.push({ label: `floor ${k}, way ${way}, at ${at.join(',')}`, k, way, at, m, ms: performance.now() - t0 });
}

/** A frame's painted box from the anchor (picture pixels; up is less): left, right, top, bottom. */
const boxOf = (s: Moment['frames'][number]): [number, number, number, number] => {
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
  each(s, (_r, _g, _b, _a, x, y) => {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  });
  const ax = Math.round(s.ax * (s.density ?? 1));
  const ay = Math.round(s.ay * (s.density ?? 1));
  return [x0 - ax, x1 - ax, y0 - ay, y1 - ay];
};
const flagstones = (m: Moment) => m.tracks.filter((t) => t.name.startsWith('a flagstone') || t.name.startsWith('a slab of earth'));
const stones = (m: Moment) => m.tracks.filter((t) => t.name.startsWith('a stone thrown'));
const orderOf = (name: string): number => Number(/going (\d+)/.exec(name)![1]);

test('the stairwell opens: how long the nine take to paint (each once, then kept)', () => {
  const total = all.reduce((t, a) => t + a.ms, 0);
  console.log(`  painted: ${all.map((a) => `${a.label} ${a.ms.toFixed(0)} ms`).join('; ')}; all nine ${(total / 1000).toFixed(1)} s`);
  assert.ok(total < 150000, `all nine took ${(total / 1000).toFixed(1)} s`);
  // (kept: asked again, the same moment at once; and the floor's pattern repeats every ten tiles, so the moment does)
  const again = performance.now();
  assert.ok(stairwellOpens(CRYPT_FLOORS[0], 'x', [10, -10]) === all[0].m, 'not kept');
  assert.ok(performance.now() - again < 50, 'kept, but slow to find');
});

for (const { label, k, way, at, m } of all) {
  const notes = stairwellNotes(m);
  const N = m.frames.length;

  test(`the stairwell opens, ${label}: nothing before it (the floor is the game's own), its first frame empty; its last frame is makeStairwell's picture, to the pixel`, () => {
    assert.ok(m.before === null, 'something before it');
    assert.ok(count(m.frames[0]) === 0, `its first frame has ${count(m.frames[0])} pixels`);
    const stair = makeStairwell(CRYPT_FLOORS[k - 1], way);
    assert.ok(unlike(m.frames[N - 1], stair) === 0, `its last frame differs from the stairwell by ${unlike(m.frames[N - 1], stair)} pixels`);
    assert.ok(m.after !== null && unlike(m.after[0], stair) === 0, 'what is left is not the stairwell');
    assert.ok(count(m.frames[N - 1]) === count(stair), `its last frame has ${count(m.frames[N - 1])} pixels, the stairwell ${count(stair)}`);
  });

  test(`the stairwell opens, ${label}: before anything moves, the floor over the opening is the game's own floor at its tile, to the pixel (only the fissure and its first dust differ)`, () => {
    // the game's floor round the anchor, laid out as the game lays it
    const ground = cryptGround(k);
    const floorAt = new Map<string, string>();
    for (let ty = -2; ty <= 4; ty++) {
      for (let tx = -2; tx <= 4; tx++) {
        const s = ground.floor(at[0] + tx, at[1] + ty);
        const p = paintingOf(s);
        const d = s.density ?? 1;
        const ox = (tx - ty) * 32 - Math.round(s.ax * d);
        const oy = (tx + ty) * 16 - Math.round(s.ay * d);
        for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) floorAt.set(`${x + ox},${y + oy}`, p.get(x, y)!);
      }
    }
    const f1 = m.frames[1];
    const q = paintingOf(f1);
    const ax = Math.round(f1.ax * 2);
    const ay = Math.round(f1.ay * 2);
    let same = 0;
    let n = 0;
    for (let y = 0; y < q.h; y++) {
      for (let x = 0; x < q.w; x++) {
        if (!q.has(x, y)) continue;
        n++;
        if (floorAt.get(`${x - ax},${y - ay}`) === q.get(x, y)) same++;
      }
    }
    assert.ok(n > 2000, `only ${n} pixels painted over the opening`);
    assert.ok(same / n >= 0.85, `${((100 * same) / n).toFixed(1)}% of it is the floor`);
  });

  test(`the stairwell opens, ${label}: crisp, 30 a second, between 3 and 3.5 seconds, no glow of a friend's or an enemy's`, () => {
    assert.ok(m.fps === 30, `${m.fps} a second`);
    const s = N / m.fps;
    assert.ok(s >= 3 && s <= 3.5, `${s.toFixed(2)} s`);
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
    for (let i = 1; i < N; i++) {
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
  test(`the stairwell opens, ${label}: the jolts and their kicks: the shock, the heave, each flagstone striking the bottom, the great burst the biggest, when the last strikes, and the aftershock half a second after it`, () => {
    const kicks = stairwellKicks(m);
    assert.ok(kicks.length === m.jolts.length, `${kicks.length} kicks for ${m.jolts.length} jolts`);
    assert.ok(m.jolts[0] === 1 && kicks[0] === 4, `the shock: frame ${m.jolts[0]}, kick ${kicks[0]}`);
    assert.ok(kicks[1] === 6, `the heave's kick ${kicks[1]}`);
    const gi = m.jolts.indexOf(notes.great);
    assert.ok(gi > 1 && kicks[gi] === 10, `the great burst: frame ${notes.great}, kick ${kicks[gi]}`);
    assert.ok(gi === m.jolts.length - 2 && m.jolts[gi + 1] === notes.great + 15 && kicks[gi + 1] === 4, `the aftershock: frame ${m.jolts[gi + 1]}, kick ${kicks[gi + 1]}`);
    assert.ok(kicks.filter((kk) => kk >= 10).length === 1, 'another kick as big as the great burst');
    for (const kk of kicks.slice(2, gi)) assert.ok(kk >= 3 && kk <= 6, `a flagstone's kick ${kk}`);
    assert.ok(notes.great === Math.max(...notes.impacts), 'the great burst is not when the last flagstone strikes');
    for (const f of notes.impacts) assert.ok(m.jolts.includes(f), `a flagstone strikes at ${f} without a jolt`);
  });

  test(`the stairwell opens, ${label}: no lull: the flagstones go down the line of the steps in a ripple, one striking the bottom every one to three frames, the first soon after the heave`, () => {
    const im = notes.impacts;
    assert.ok(im.length >= 8, `${im.length} flagstones`);
    // (where they go every frame or so, one may strike a frame before the one before it)
    for (let i = 1; i < im.length; i++) assert.ok(im[i] >= im[i - 1] - 1 && im[i] - im[i - 1] <= 4, `the ${i + 1}th strikes ${im[i] - im[i - 1]} frames after the one before`);
    const mean = (im[im.length - 1] - im[0]) / (im.length - 1);
    assert.ok(mean >= 1 && mean <= 3, `one every ${mean.toFixed(1)} frames`);
    assert.ok(im[0] <= 24, `the first strikes at frame ${im[0]}`);
    // (and one of them is already on its way within eight frames of the heave)
    const heave = m.jolts[1];
    const moving = flagstones(m).some((t) => {
      const rest = t.at[heave + 3];
      const later = t.at[heave + 8];
      return rest !== null && later !== null && later.y - rest.y >= 2;
    });
    assert.ok(moving, 'nothing is on its way down eight frames after the heave');
  });

  test(`the stairwell opens, ${label}: each flagstone tips on its uphill edge, seen, over three frames or more, then drops into the hole, out of sight when it strikes`, () => {
    for (const t of flagstones(m)) {
      const at = t.at;
      const gone = at.findIndex((a, i) => i > m.jolts[1] && (a === null || a.shown === 0));
      assert.ok(gone > 0 && notes.impacts.includes(gone), `${t.name} goes from sight at ${gone}, not when it strikes`);
      // (from the frame it starts to tip)
      const tip = notes.tips[orderOf(t.name) - 1];
      assert.ok(gone - tip >= 3, `${t.name}: tips at ${tip}, gone at ${gone}`);
      assert.ok(at[tip]!.shown >= 0.35, `${t.name}: hardly seen as it starts (${at[tip]!.shown.toFixed(2)})`);
      // (never back up the screen as it goes; a sliver of one, its middle hardly moving as it tips, goes from sight soonest)
      assert.ok(at[gone - 1]!.y >= at[tip]!.y - 1, `${t.name} comes back up`);
    }
    // (in their order, down the line of the steps: where they go every frame or so, one a frame before the one before it at most)
    const order = flagstones(m).map((t) => ({ o: orderOf(t.name), gone: t.at.findIndex((a, i) => i > m.jolts[1] && (a === null || a.shown === 0)) }));
    for (const a of order) for (const b of order) if (a.o < b.o) assert.ok(a.gone <= b.gone + 1, `the ${a.o}th goes at ${a.gone}, the ${b.o}th at ${b.gone}`);
  });

  test(`the stairwell opens, ${label}: the great burst: dust blows up out of the hole high and wide, a skirt of it rushing out over the floor two or three tiles past where one stands beside it`, () => {
    const boxes = m.frames.map((f) => (count(f) ? boxOf(f) : null));
    const tops = boxes.map((b) => (b ? b[2] : 0));
    const highest = Math.min(...tops);
    const at = tops.indexOf(highest);
    // (higher than three heroes, 58 picture pixels each, above the opening's far corner)
    assert.ok(highest <= -150, `the dust goes up only ${-highest} pixels`);
    assert.ok(at > notes.great && at - notes.great <= 20, `it is highest ${at - notes.great} frames after the great burst`);
    // (the skirt: within fifteen frames of the burst, out past where one stands beside the opening, two tiles and more: 150 picture pixels from the anchor to the left and the right)
    const soon = boxes.slice(notes.great, notes.great + 16).filter((b) => b !== null) as [number, number, number, number][];
    const left = Math.min(...soon.map((b) => b[0]));
    const right = Math.max(...soon.map((b) => b[1]));
    assert.ok(left <= -150 && right >= 150, `the skirt reaches ${left} and ${right}`);
    // (and it comes out fast: half way out within five frames)
    const early = boxes.slice(notes.great, notes.great + 6).filter((b) => b !== null) as [number, number, number, number][];
    assert.ok(Math.min(...early.map((b) => b[0])) <= left / 2 && Math.max(...early.map((b) => b[1])) >= right / 2, 'the skirt is slow to come out');
  });

  test(`the stairwell opens, ${label}: the dust hangs, then settles, never coming down faster than it went up, and the stairwell comes out of it: it ends still, the stairwell as it lies`, () => {
    // (the top of its body: the row above which lie 6% of its pixels, not a torn scrap thinning away above it)
    const tops = m.frames.map((f) => {
      const ys: number[] = [];
      each(f, (_r, _g, _b, _a, _x, y) => ys.push(y));
      if (!ys.length) return 0;
      ys.sort((a, b) => a - b);
      return ys[Math.floor(ys.length * 0.06)] - Math.round(f.ay * (f.density ?? 1));
    });
    const highest = Math.min(...tops);
    const at = tops.indexOf(highest);
    // it hangs: three frames or more within a tenth of its height
    const hang = tops.filter((t, i) => i >= at && i < at + 12 && t <= highest * 0.9).length;
    assert.ok(hang >= 3, `it hangs ${hang} frames`);
    // never down faster than up (the top of it, a frame to the next, after the great burst)
    let up = 0;
    let down = 0;
    for (let i = notes.great + 1; i <= at + 30 && i < N; i++) {
      const d = tops[i] - tops[i - 1];
      if (d < 0) up = Math.max(up, -d);
      else down = Math.max(down, d);
    }
    assert.ok(down < up, `it comes down ${down} pixels in a frame, went up ${up}`);
    // it settles within about a second and a half of its height: under half its height
    const half = tops.findIndex((t, i) => i > at && t > highest / 2);
    assert.ok(half > 0 && half - at <= 40, `it comes down in ${half - at} frames`);
    // the stairwell comes out of it: over the last second the dust beyond the stairwell's own pixels thins away
    const own = count(m.after![0]);
    const dust = (i: number): number => Math.max(0, count(m.frames[i]) - own);
    assert.ok(dust(N - 30) > dust(N - 15) && dust(N - 15) > dust(N - 5), `the dust over the last second: ${dust(N - 30)}, ${dust(N - 15)}, ${dust(N - 5)}`);
    // it ends still: the last six frames hardly change, and the last is the stairwell
    for (let i = N - 6; i < N; i++) {
      const d = unlike(m.frames[i - 1], m.frames[i]);
      assert.ok(d <= 3200, `frame ${i}: ${d} pixels change`);
    }
  });

  test(`the stairwell opens, ${label}: the fissure goes and the pit becomes the stairwell, each under the dust; the floor's broken edges never seen to vanish`, () => {
    assert.ok(notes.hidden, 'not hidden');
    assert.ok(notes.heal > notes.great && notes.heal < N - 1, `the last of the fissure goes at ${notes.heal}, the great burst ${notes.great}`);
    assert.ok(notes.swap >= notes.great + 18, `the stairwell starts to come ${notes.swap - notes.great} frames after the burst`);
  });

  test(`the stairwell opens, ${label}: stones thrown up out of the hole, a dozen of mixed sizes (5 to 9 game pixels), up in arcs, some high, some skipping off the floor, and back into the hole, seen to go`, () => {
    const st = stones(m);
    assert.ok(st.length === 12 && notes.stones === 12, `${st.length} stones`);
    const ups: number[] = [];
    for (const t of st) {
      const live = t.at.map((a, i) => (a ? { ...a, i } : null)).filter((a) => a !== null) as { x: number; y: number; shown: number; size: number; i: number }[];
      const size = live[0].size - 2;
      assert.ok(size >= 10 && size <= 18, `${t.name}: ${size} picture pixels`);
      assert.ok(live[0].i >= notes.great && live[0].i <= notes.great + 4, `${t.name} is thrown at ${live[0].i}`);
      // (up out of the hole: not all of it seen at first)
      assert.ok(live[0].shown < 1, `${t.name} is there whole at once`);
      // up out of the hole
      const y0 = live[0].y;
      const top = Math.min(...live.map((a) => a.y));
      ups.push(y0 - top);
      // into the hole, bit by bit: three frames or more from all of it showing to none
      const last = live.length - 1;
      assert.ok(live[last].shown <= 0.3, `${t.name} still shows ${live[last].shown.toFixed(2)} at the last`);
      const full = live.reduce((n, a, i) => (a.shown >= 0.85 ? i : n), -1);
      assert.ok(last - full >= 3, `${t.name} goes into the hole in ${last - full} frames`);
      assert.ok(live[last].i < N - 1, `${t.name} is still there at the end`);
    }
    // (some flung over a hero's head, 48 picture pixels: up 50 or more from where they came up)
    assert.ok(ups.filter((u) => u >= 50).length >= 2, `the highest go up ${ups.sort((a, b) => b - a).slice(0, 3).map((u) => u.toFixed(0)).join(', ')}`);
  });

  if (k === 4) {
    test(`the stairwell opens, ${label}: the earth breaks: in clods, its fissure crumbling; earth among the stones thrown; its dust plum-mauve (91, 77, 103), browner, never toward pink`, () => {
      assert.ok(notes.earthPieces >= 8 && notes.earthPieces % 4 === 0, `${notes.earthPieces} clods of earth`);
      assert.ok(notes.earthStones >= 2, `${notes.earthStones} clods and rocks among the stones`);
      const plum = rgb('#5b4d67');
      let body = 0;
      let pinkish = 0;
      for (const f of m.frames.slice(notes.great, notes.great + 30)) {
        each(f, (r, g, b) => {
          if (r === plum[0] && g === plum[1] && b === plum[2]) body++;
          const [h, sa] = hsv(r, g, b);
          if (h >= 300 && h <= 352 && sa > 0.3) pinkish++;
        });
      }
      assert.ok(plum[0] === 91 && plum[1] === 77 && plum[2] === 103, 'not his plum');
      assert.ok(body > 20000, `only ${body} pixels of the dust's body`);
      assert.ok(pinkish === 0, `${pinkish} pinkish pixels`);
    });
  }
}
