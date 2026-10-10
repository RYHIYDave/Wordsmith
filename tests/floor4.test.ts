// THE AMALGAMATION'S FLOOR (src/art/floor4.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees it, and to his notes on floor 1's first pictures, through the checks every
// Crypt floor goes through (tests/floor_checks.ts); then its own moments, each checked against his
// Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be
// a notch too high than a notch too low.”; 07:53: “And I want all animations checked against this
// statement before I see them.”).
//   run: tsx --test tests/floor4.test.ts

import { ossuaryMoments, ossuaryPieces } from '../src/art/floor4';
import type { Moment, Track } from '../src/art/floorkit';
import { assert, each, floorChecks, test } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

const pieces = ossuaryPieces();
const moments = ossuaryMoments();

floorChecks({
  label: 'floor 4',
  pieces,
  moments,
  onePlace: ['the skull wall', "the miners' breach", 'jaw slot'],
  fullHeight: ['the skull wall', "the miners' breach", 'shored rock', "the miners' ladder"],
  fires: ["miner's lantern", "the cult's candle"],
  tileTraps: ['bone spikes', 'rotten boards'],
  shadowed: ['empty boots', 'rib cage', 'arm from a heap', "the miners' breach"],
});

const named = (n: string): Moment => {
  const m = moments.find((q) => q.name === n);
  if (!m) throw new Error(`no moment named ${n}`);
  return m;
};
/** How wide what is painted is, across the frames, in picture pixels. */
const across = (frames: Moment['frames']): number => {
  let widest = 0;
  for (const s of frames) {
    let x0 = Infinity;
    let x1 = -Infinity;
    each(s, (_r, _g, _b, _a, x) => {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
    });
    widest = Math.max(widest, x1 - x0 + 1);
  }
  return widest;
};
type At = NonNullable<Track['at'][number]>;
const seen = (t: Track): At[] => t.at.filter((a): a is At => a !== null);
/** Still at the end: the last few places the same. */
const restsAtEnd = (t: Track, n = 4): boolean => {
  const s = seen(t);
  const last = s[s.length - 1];
  return s.slice(-n).every((a) => a.x === last.x && a.y === last.y);
};

test('floor 4, moments: three, each its own, as he asked (“Something shifts above you and dust comes down”), none held still', () => {
  assert.ok(moments.length === 3, `${moments.length} moments`);
  for (const m of moments) assert.ok(m.holds.length === 0, `${m.name}: held ${m.holds.length} frames (a freeze reads as a stall)`);
});

test('floor 4, moments: the skull wall bulges and shudders, bursts on a jolt, an avalanche of skulls and bones pours out wide across the floor, bouncing and rolling; the wall above slumps on a second jolt; all of it lies still at the end, a hole left', () => {
  for (const film of [named('the skull wall spills'), { ...named('the skull wall spills'), ...named('the skull wall spills').right! }]) {
    const m = named('the skull wall spills');
    const [burst, slump] = m.jolts;
    assert.ok(m.jolts.length === 2 && slump > burst, `jolts ${m.jolts}`);
    const skulls = film.tracks.filter((t) => t.name.startsWith('skull'));
    const bones = film.tracks.filter((t) => t.name.startsWith('bone'));
    // an avalanche: more skulls than bones, and plenty of both
    assert.ok(skulls.length >= 14 && bones.length >= 8, `${skulls.length} skulls and ${bones.length} bones`);
    const all = [...skulls, ...bones];
    // it bulges first: before the burst the middle of it has come out of the wall and shudders
    const bulged = all.filter((t) => Math.hypot(t.at[burst - 1]!.x - t.at[0]!.x, t.at[burst - 1]!.y - t.at[0]!.y) >= 3);
    assert.ok(bulged.length >= 6, `only ${bulged.length} bulge out before it bursts`);
    const shudder = all.some((t) => t.at.slice(burst - 8, burst).some((a, i, s) => i > 0 && Math.hypot(a!.x - s[i - 1]!.x, a!.y - s[i - 1]!.y) >= 1.5));
    assert.ok(shudder, 'it does not shudder before it bursts');
    // every one falls a long way and is thrown out from the wall, fast, and lies still at the end
    let bounced = 0;
    for (const t of all) {
      const s = t.at;
      const d = Math.hypot(s[s.length - 1]!.x - s[0]!.x, s[s.length - 1]!.y - s[0]!.y);
      assert.ok(d >= 14, `${t.name} goes only ${d.toFixed(0)}`);
      assert.ok(restsAtEnd(t), `${t.name} is still moving at the end`);
      const fastest = Math.max(...s.slice(1).map((a, i) => Math.hypot(a!.x - s[i]!.x, a!.y - s[i]!.y)));
      assert.ok(fastest >= 3.5, `${t.name}: ${fastest.toFixed(1)} a frame at its fastest`);
      // (it bounces: down, then up again a frame or more, then down)
      const ys = s.map((a) => a!.y);
      for (let i = 2; i < ys.length; i++) if (ys[i - 1] - ys[i - 2] > 1.5 && ys[i] - ys[i - 1] < -0.5) { bounced++; break; }
    }
    assert.ok(bounced >= all.length / 3, `only ${bounced} of ${all.length} bounce`);
    // spread wide across the floor
    const ends = all.map((t) => t.at[t.at.length - 1]!.x);
    assert.ok(Math.max(...ends) - Math.min(...ends) >= 60, `they spread only ${(Math.max(...ends) - Math.min(...ends)).toFixed(0)} across`);
    // released at the burst, and more at the slump
    const goes = all.map((t) => t.at.findIndex((a, i) => i > 0 && Math.hypot(a!.x - t.at[i - 1]!.x, a!.y - t.at[i - 1]!.y) >= 2.5));
    assert.ok(goes.filter((g) => g >= burst && g <= burst + 6).length >= 8, 'the burst does not throw them out');
    assert.ok(goes.filter((g) => g >= slump && g <= slump + 10).length >= 5, 'the slump does not pour them out');
    // dust flies wide as it bursts
    const own = across([film.before![0]]);
    assert.ok(across(film.frames.slice(burst, burst + 10)) >= own + 40, 'its dust does not fly wide');
    // what is left is not what was there
    assert.ok(unlike(film.after![0], film.before![0]) > 1500, 'nothing is left of it');
  }
});

test('floor 4, moments: the cart creaks, starts by itself and goes faster every frame, strikes the rails\' end hard on a jolt and goes over on a second, its load flung out and lying still; a wheel left turning', () => {
  const m = named('the cart runs');
  const [hit, land] = m.jolts;
  assert.ok(m.jolts.length === 2 && land > hit, `jolts ${m.jolts}`);
  const cart = m.tracks.find((t) => t.name === 'the cart')!.at;
  const xs = cart.map((a) => a!.x);
  // it shudders before it goes, then rolls faster and faster, and a long way (four tiles)
  const start = xs.findIndex((x, i) => i > 16 && x - xs[0] > 1);
  assert.ok(start > 0 && start < hit - 20, `it starts at ${start}`);
  for (let i = start + 4; i < hit - 1; i++) assert.ok(xs[i] - xs[i - 1] >= xs[i - 1] - xs[i - 2] - 0.6, `it slows at ${i}`);
  assert.ok(xs[hit - 1] - xs[hit - 2] >= 5, `it strikes going only ${(xs[hit - 1] - xs[hit - 2]).toFixed(1)} a frame`);
  assert.ok(xs[hit] - xs[0] >= 100, `it runs only ${(xs[hit] - xs[0]).toFixed(0)}`);
  // it stops dead as it strikes
  assert.ok(Math.abs(xs[hit + 1] - xs[hit]) < 3, 'it does not stop at the rails\' end');
  // its load: flung out far and every way, bouncing, lying still at the end
  const load = m.tracks.filter((t) => t.name !== 'the cart');
  assert.ok(load.length >= 12, `${load.length} things in its load`);
  for (const t of load) {
    const s = seen(t);
    assert.ok(Math.hypot(s[s.length - 1].x - s[hit].x, s[s.length - 1].y - s[hit].y) >= 10, `${t.name} is not thrown out`);
    assert.ok(restsAtEnd(t), `${t.name} is still moving at the end`);
  }
  // the frame jolts as it strikes: many pixels change at once
  assert.ok(unlike(m.frames[hit], m.frames[hit - 1]) >= 300, 'the strike does not show');
  // a wheel turning to the end: the last frames still move
  for (let i = m.frames.length - 6; i < m.frames.length; i++) assert.ok(unlike(m.frames[i], m.frames[i - 1]) > 0, `nothing turns at ${i}`);
});

test('floor 4, moments: the heap twitches and heaves, an arm bursts up out of it on a jolt and claws high in the air; the pink kindles in a skull; the arm crashes down on a second jolt and the burning skull is dragged under, seen going', () => {
  const m = named('the bones stir');
  const [burst, collapse] = m.jolts;
  assert.ok(m.jolts.length === 2 && collapse > burst + 20, `jolts ${m.jolts}`);
  const hand = m.tracks.find((t) => t.name === 'the hand')!;
  const hs = seen(hand);
  // up fast and high: well over the heap, faster than a game pixel a frame as it bursts out
  const top = Math.min(...hs.map((a) => a.y));
  assert.ok(hs[0].y - top >= 40, `the hand rises only ${(hs[0].y - top).toFixed(0)}`);
  const rise = Math.max(...hs.slice(1, 6).map((a, i) => hs[i].y - a.y));
  assert.ok(rise >= 8, `it bursts up only ${rise.toFixed(1)} a frame`);
  // it claws: its hand moves all the while it is up
  assert.ok(hs.length >= 30, `it is up only ${hs.length} frames`);
  // the eyes: dark, then kindled, then gone under bit by bit (never all at once)
  const eyes = m.tracks.find((t) => t.name === 'the burning eyes')!.at;
  assert.ok(eyes[0]!.shown === 0, 'the eyes burn from the start');
  const lit = eyes.findIndex((a) => a!.shown >= 0.8);
  assert.ok(lit > burst && lit < collapse, `the eyes kindle at ${lit}`);
  assert.ok(eyes[eyes.length - 1]!.shown === 0, 'the eyes still burn at the end');
  const going = eyes.slice(collapse).filter((a) => a!.shown > 0 && a!.shown < 0.8).length;
  assert.ok(going >= 6, `the eyes go under in ${going} frames`);
  // seen going down: lower as they go
  const lastSeen = eyes.map((a, i) => (a!.shown > 0 ? i : -1)).filter((i) => i >= 0).pop()!;
  assert.ok(eyes[lastSeen]!.y > eyes[lit]!.y + 4, 'the eyes do not go down into it');
  // the arm's pieces fall onto the heap and lie still; the bones flung off it lie still
  for (const t of m.tracks.filter((q) => /^(upper|fore|hand|bone|skull) /.test(q.name))) assert.ok(restsAtEnd(t), `${t.name} is still moving at the end`);
  // what is left is not what was there
  assert.ok(unlike(m.after![0], m.before![0]) > 400, 'the heap is as it was');
});
