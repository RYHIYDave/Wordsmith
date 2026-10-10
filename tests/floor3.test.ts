// THE CHAINED ONE'S FLOOR (src/art/floor3.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees it, and to his notes on floor 1's first pictures, through the checks every
// Crypt floor goes through (tests/floor_checks.ts); then its own moments, each checked against his
// Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be
// a notch too high than a notch too low.”; 07:53: “And I want all animations checked against this
// statement before I see them.”).
//   run: tsx --test tests/floor3.test.ts

import { chainedMoments, chainedPieces } from '../src/art/floor3';
import type { Moment, Track } from '../src/art/floorkit';
import { FLAME } from '../src/art/mkit';
import { assert, count, each, floorChecks, hex, test } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

const pieces = chainedPieces();
const moments = chainedMoments();

floorChecks({
  label: 'floor 3',
  pieces,
  moments,
  onePlace: ['the torn-out ring', 'the chain port', 'the ball hatch'],
  fullHeight: ['the bowed wall', 'the wall winch', 'rings and chains'],
  fires: ['fire basket', "the jailers' lamp"],
  tileTraps: ['the trip chain', 'the mantrap'],
  shadowed: ['ball and chain', 'the torn-out ring'],
});

const named = (n: string): Moment => {
  const m = moments.find((q) => q.name === n);
  if (!m) throw new Error(`no moment named ${n}`);
  return m;
};
const track = (ts: readonly Track[], n: string): Track['at'] => {
  const t = ts.find((q) => q.name === n);
  if (!t) throw new Error(`no track named ${n}`);
  return t.at;
};
/** How far a track's point moves from one frame to the next. */
const step = (at: Track['at'], i: number): number => (at[i] && at[i - 1] ? Math.hypot(at[i]!.x - at[i - 1]!.x, at[i]!.y - at[i - 1]!.y) : 0);
/** His eyes in a frame: how many pixels of the enemy's fire, pink burning to gold. */
const FIRE = new Set(FLAME.map((c) => c.toLowerCase()));
const pink = (s: Moment['frames'][number]): number => {
  let n = 0;
  each(s, (r, g, b) => (n += FIRE.has(hex(r, g, b)) ? 1 : 0));
  return n;
};

test('floor 3, moments: three, each its own, as he asked (“Something shifts above you and dust comes down”), the two in a wall for both its faces', () => {
  assert.ok(moments.length === 3, `${moments.length} moments`);
  for (const m of moments) assert.ok(m.holds.length === 0, `${m.name}: held ${m.holds.length} frames (a freeze reads as a stall)`);
  assert.ok(named('the chains pull').right && named('the bars shake').right, 'the wall moments for the other face');
});

test('floor 3, moments: the chains creep, are hauled taut all at once and slam against the wall, strain, one rips its ring out and whips down onto the floor, bouncing; the others drop slack, swing and hang still', () => {
  const m = named('the chains pull');
  for (const film of [m, m.right!]) {
    const [taut, yank, rip, land] = m.jolts;
    assert.ok(m.jolts.length === 4 && taut < yank && yank < rip && rip < land, `jolts ${m.jolts.join(' ')}`);
    const chains = [1, 2, 3].map((i) => track(film.tracks, `chain ${i}`));
    // hauled: each chain's middle moves fast as it is snatched taut, and all three in the same few frames
    for (const c of chains) {
      const fastest = Math.max(...Array.from({ length: taut + 1 }, (_, i) => (i ? step(c, i) : 0)));
      assert.ok(fastest >= 5, `a chain moves only ${fastest.toFixed(1)} a frame as it is hauled`);
      // (lifted off the floor: its middle well up the wall when taut)
      assert.ok(c[0]!.y - c[taut]!.y >= 12, `a chain's middle rises only ${(c[0]!.y - c[taut]!.y).toFixed(0)}`);
    }
    // the ring rips out and whips down: it travels far, falling faster just before it strikes, and bounces
    const ring = track(film.tracks, 'the torn ring');
    assert.ok(Math.hypot(ring[land]!.x - ring[rip - 1]!.x, ring[land]!.y - ring[rip - 1]!.y) >= 25, 'the torn ring does not fly far');
    assert.ok(ring[land]!.y - ring[land - 1]!.y > ring[land - 2]!.y - ring[land - 3]!.y, 'the torn ring does not fall faster as it strikes');
    const after = ring.slice(land + 1, land + 8).map((a) => a!.y);
    assert.ok(Math.min(...after) <= ring[land]!.y - 1.5, `the ring does not bounce (${(ring[land]!.y - Math.min(...after)).toFixed(1)})`);
    // the two left drop slack and swing: their middles go down from taut and come back up at least once
    for (const c of chains.slice(1)) {
      const ys = c.slice(rip).map((a) => a!.y);
      const low = Math.max(...ys);
      assert.ok(low - c[rip]!.y >= 6, `a chain drops only ${(low - c[rip]!.y).toFixed(1)} when let go`);
      let turns = 0;
      for (let i = 2; i < ys.length; i++) if (Math.sign(ys[i] - ys[i - 1]) !== Math.sign(ys[i - 1] - ys[i - 2]) && Math.abs(ys[i] - ys[i - 1]) > 0.05) turns++;
      assert.ok(turns >= 2, `a chain does not swing (${turns} turns)`);
    }
    // chips of stone fly from where the ring tore out, and lie still at the end
    const chips = film.tracks.filter((t) => t.name.startsWith('chip'));
    assert.ok(chips.length >= 6, `${chips.length} chips`);
    for (const t of chips) {
      assert.ok(t.at[rip - 1] === null && t.at[rip] !== null, `${t.name} not born as it rips`);
      const n = t.at.length;
      assert.ok(t.at[n - 1]!.x === t.at[n - 2]!.x && t.at[n - 1]!.y === t.at[n - 2]!.y, `${t.name} still moving at the end`);
    }
    // what is left is not what was there (the ring torn out)
    assert.ok(unlike(film.after![0], film.before![0]) > 150, 'what is left is what was there');
    // the dust flies wide at the haul: the frames after it wider than before it
    const wide = (s: Moment['frames'][number]): number => {
      let x0 = Infinity;
      let x1 = -Infinity;
      each(s, (_r, _g, _b, _a, x) => {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
      });
      return x1 - x0;
    };
    assert.ok(Math.max(...film.frames.slice(rip, rip + 8).map(wide)) >= wide(film.frames[0]) + 6, 'nothing flies out as it rips');
  }
});

test('floor 3, moments: the ball creaks, rolls off the heap and falls faster every frame, smashes into the flags on a jolt (cracks, chips, dust), bounces, rolls on toward the hero dragging its chain, and stops', () => {
  const m = named('the ball falls');
  const ball = track(m.tracks, 'the ball');
  const [impact] = m.jolts;
  assert.ok(m.jolts.length >= 1 && impact > 10, `jolts ${m.jolts.join(' ')}`);
  // it falls: a long way down, faster every frame just before it strikes
  const top = Math.min(...ball.slice(0, impact).map((a) => a!.y));
  assert.ok(ball[impact]!.y - top >= 22, `it falls only ${(ball[impact]!.y - top).toFixed(0)}`);
  for (let i = impact - 3; i < impact; i++) assert.ok(ball[i]!.y - ball[i - 1]!.y > ball[i - 1]!.y - ball[i - 2]!.y - 0.01, `it does not fall faster at ${i}`);
  assert.ok(ball[impact]!.y - ball[impact - 1]!.y >= 4, `it strikes at only ${(ball[impact]!.y - ball[impact - 1]!.y).toFixed(1)} a frame`);
  // it bounces: up off the floor between the blow and where it comes down again (the second jolt), well above the line between them
  assert.ok(m.jolts.length >= 2, 'it does not come down again');
  const second = m.jolts[1];
  let lift = 0;
  for (let i = impact + 1; i < second; i++) {
    const t = (i - impact) / (second - impact);
    lift = Math.max(lift, ball[impact]!.y + (ball[second]!.y - ball[impact]!.y) * t - ball[i]!.y);
  }
  assert.ok(lift >= 3, `it bounces only ${lift.toFixed(1)}`);
  // it rolls on toward the hero (down the screen), a good way, and comes to rest
  const end = ball[ball.length - 1]!;
  assert.ok(end.y - ball[impact]!.y >= 10, `it rolls on only ${(end.y - ball[impact]!.y).toFixed(0)} toward the hero`);
  const n = ball.length;
  assert.ok(Math.hypot(end.x - ball[n - 4]!.x, end.y - ball[n - 4]!.y) < 1, 'it is still rolling at the end');
  // its chain is dragged after it: the chain's end moves a long way
  const chainEnd = track(m.tracks, "its chain's end");
  assert.ok(Math.hypot(chainEnd[n - 1]!.x - chainEnd[0]!.x, chainEnd[n - 1]!.y - chainEnd[0]!.y) >= 12, 'its chain is not dragged');
  // the blow: chips born on it, flung out, lying still; the flags cracked (what is left differs where it struck)
  const chips = m.tracks.filter((t) => t.name.startsWith('chip'));
  assert.ok(chips.length >= 8, `${chips.length} chips`);
  for (const t of chips) {
    assert.ok(t.at[impact - 1] === null && t.at[impact] !== null, `${t.name} not born on the blow`);
    const far = Math.max(...t.at.filter((a) => a !== null).map((a) => Math.hypot(a!.x - t.at[impact]!.x, a!.y - t.at[impact]!.y)));
    assert.ok(far >= 5, `${t.name} flies only ${far.toFixed(1)}`);
  }
  assert.ok(unlike(m.frames[impact], m.frames[impact - 1]) >= 300, `the blow changes only ${unlike(m.frames[impact], m.frames[impact - 1])} pixels`);
  // the pebble that goes first
  const pebble = track(m.tracks, 'the pebble');
  assert.ok(pebble.findIndex((a) => a !== null) < impact - 8, 'no pebble goes first');
});

test('floor 3, moments: the bars shake: hands come out of the dark and grip, two pink eyes open, three heaves each a jolt, the bars wrenched, a bar bent out and its rivet flung bouncing; the hands and eyes go back into the dark', () => {
  const m = named('the bars shake');
  for (const film of [m, m.right!]) {
    assert.ok(m.jolts.length === 3, `${m.jolts.length} heaves`);
    const bars = track(film.tracks, 'the bars');
    // wrenched hard: at each heave the bars jump three pixels and more, and back
    for (const j of m.jolts) {
      const most = Math.max(...[0, 1, 2, 3].map((k) => step(bars, j + k)));
      assert.ok(most >= 3, `the bars move only ${most.toFixed(1)} at heave ${j}`);
    }
    let turns = 0;
    for (let i = 2; i < bars.length; i++) if (Math.sign(bars[i]!.x - bars[i - 1]!.x) * Math.sign(bars[i - 1]!.x - bars[i - 2]!.x) < 0) turns++;
    assert.ok(turns >= 12, `the bars shake to and fro only ${turns} times`);
    // the hands come out of the dark bit by bit and go back into it bit by bit
    for (const n of ['his hand 1', 'his hand 2']) {
      const h = track(film.tracks, n);
      assert.ok(h[0]!.shown === 0 && h[h.length - 1]!.shown === 0, `${n} there at the start or the end`);
      assert.ok(Math.max(...h.map((a) => a!.shown)) === 1, `${n} never comes`);
      assert.ok(h.filter((a) => a!.shown > 0 && a!.shown < 1).length >= 6, `${n} comes and goes too fast`);
    }
    // his eyes: none at the start, pink while he shakes, none at the end; gone back into the dark over several frames, nearer each other
    assert.ok(pink(film.frames[0]) === 0 && pink(film.frames[film.frames.length - 1]) === 0, 'pink at the start or the end');
    for (const j of m.jolts) assert.ok(pink(film.frames[j]) >= 6, `his eyes do not burn at heave ${j} (${pink(film.frames[j])})`);
    const eyes = track(film.tracks, 'his eyes');
    const going = eyes.filter((a, i) => i > m.jolts[2] && a!.shown > 0 && a!.shown < 1).length;
    assert.ok(going >= 3, `his eyes go back into the dark in ${going} frames`);
    // the bent bar: out into the room at the last heave, and stays out
    const bent = track(film.tracks, 'the bent bar');
    const j3 = m.jolts[2];
    assert.ok(Math.hypot(bent[bent.length - 1]!.x - bent[0]!.x, bent[bent.length - 1]!.y - bent[0]!.y) >= 4, 'the bar is not bent out');
    // the rivet: born on the last heave, flung well out, bouncing, lying still at the end
    const rivet = track(film.tracks, 'the rivet');
    assert.ok(rivet[j3 - 1] === null && rivet[j3] !== null, 'no rivet pops at the last heave');
    const r = rivet.filter((a) => a !== null).map((a) => a!);
    assert.ok(Math.hypot(r[r.length - 1].x - r[0].x, r[r.length - 1].y - r[0].y) >= 25, 'the rivet is not flung far');
    let ups = 0;
    for (let i = 2; i < r.length; i++) if (r[i].y < r[i - 1].y && r[i - 1].y >= r[i - 2].y && i > 3) ups++;
    assert.ok(ups >= 1, 'the rivet does not bounce');
    assert.ok(r[r.length - 1].x === r[r.length - 2].x && r[r.length - 1].y === r[r.length - 2].y, 'the rivet still moving at the end');
    assert.ok(count(film.after![0]) > 0 && unlike(film.after![0], film.before![0]) > 40, 'what is left is what was there');
  }
});
