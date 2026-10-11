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

const moved = (a: At, b: At): number => Math.hypot(b.x - a.x, b.y - a.y);

test('floor 4, moments: the skull wall bows out and shudders, skulls pop loose; it bursts at its foot, its top drops as a block and breaks, its sides give; an avalanche of skulls and bones arcs out, bouncing and rolling toward the hero and resting within about four tiles of the wall; all of it at rest at the end, a cavity left (both faces)', () => {
  const m = named('the skull wall spills');
  for (const [film, out] of [[m, [-0.894, 0.447]], [{ ...m, ...m.right! }, [0.894, 0.447]]] as const) {
    const [burst, ...rest] = m.jolts;
    assert.ok(m.jolts.length === 4 && rest.every((j, i) => j > (i ? rest[i - 1] : burst)), `jolts ${m.jolts}`);
    const skulls = film.tracks.filter((t) => t.name.startsWith('skull'));
    const bones = film.tracks.filter((t) => t.name.startsWith('bone'));
    assert.ok(skulls.length >= 10 && bones.length >= 20 && skulls.length + bones.length >= 34, `${skulls.length} skulls and ${bones.length} bones`);
    const all = [...skulls, ...bones];
    // it bows out before it bursts, plain to see, and some pop loose and fall
    const bowed = all.filter((t) => moved(t.at[0]!, t.at[burst - 1]!) >= 3);
    assert.ok(bowed.length >= 8, `only ${bowed.length} bow out before it bursts`);
    const popped = all.filter((t) => moved(t.at[0]!, t.at[burst - 1]!) >= 12);
    assert.ok(popped.length >= 2, `only ${popped.length} pop loose before it bursts`);
    // every one falls, is thrown, and lies still at the end; a third and more bounce
    let bounced = 0;
    for (const t of all) {
      const s = t.at;
      assert.ok(moved(s[0]!, s[s.length - 1]!) >= 14, `${t.name} goes only ${moved(s[0]!, s[s.length - 1]!).toFixed(0)}`);
      assert.ok(restsAtEnd(t), `${t.name} is still moving at the end`);
      const ys = s.map((a) => a!.y);
      for (let i = 2; i < ys.length; i++) if (ys[i - 1] - ys[i - 2] > 1.5 && ys[i] - ys[i - 1] < -0.5) { bounced++; break; }
    }
    assert.ok(bounced >= all.length / 3, `only ${bounced} of ${all.length} bounce`);
    // out a long way toward the hero: four tiles and more
    const far = all.map((t) => (t.at[t.at.length - 1]!.x - t.at[0]!.x) * out[0] + (t.at[t.at.length - 1]!.y - t.at[0]!.y) * out[1]);
    assert.ok(Math.max(...far) >= 130 && far.filter((d) => d >= 90).length >= 5, `out only ${Math.max(...far).toFixed(0)}, ${far.filter((d) => d >= 90).length} past 90`);
    // but kept on the floor near the wall: none at rest more than about four tiles and a half from it
    const tiles = all.map((t) => {
      const e = t.at[t.at.length - 1]!;
      return Math.max(e.x / 0.8 + e.y / 0.4, e.y / 0.4 - e.x / 0.8) / 2 / 40;
    });
    assert.ok(Math.max(...tiles) <= 4.6, `one rests ${Math.max(...tiles).toFixed(2)} tiles out`);
    // its top comes down: what was high on it ends on the floor
    const fell = all.filter((t) => t.at[0]!.y < -45 && t.at[t.at.length - 1]!.y > -12);
    assert.ok(fell.length >= 8, `only ${fell.length} come down from its top`);
    assert.ok(unlike(film.after![0], film.before![0]) > 3000, 'nothing is left of it');
  }
});

test('floor 4, moments: the cart shivers, starts by itself and goes faster every frame six tiles, spilling some of its load, strikes the buffer hard on a jolt and flies over it, lands on its back on a second; its load sprays on far, skulls among it; a wheel breaks off and rolls away; all at rest but a wheel turning at the end', () => {
  const m = named('the cart runs');
  const [hit, land] = m.jolts;
  assert.ok(m.jolts.length === 2 && land > hit, `jolts ${m.jolts}`);
  const cart = m.tracks.find((t) => t.name === 'the cart')!.at.map((a) => a!);
  const xs = cart.map((a) => a.x);
  // it shivers before it goes, plain to see
  for (let i = 2; i < 20; i++) assert.ok(unlike(m.frames[i], m.frames[i - 1]) >= 20, `it hardly shivers at ${i}`);
  // then rolls by itself, faster and faster, a long way
  const start = xs.findIndex((x, i) => i > 20 && x - xs[0] > 1);
  assert.ok(start > 0 && start < hit - 30, `it starts at ${start}`);
  for (let i = start + 4; i < hit - 1; i++) assert.ok(xs[i] - xs[i - 1] >= xs[i - 1] - xs[i - 2] - 0.8, `it slows at ${i}`);
  assert.ok(xs[hit - 1] - xs[hit - 2] >= 6, `it strikes going only ${(xs[hit - 1] - xs[hit - 2]).toFixed(1)} a frame`);
  assert.ok(xs[hit - 1] - xs[0] >= 160, `it runs only ${(xs[hit - 1] - xs[0]).toFixed(0)}`);
  // over the buffer: up through the air, and down
  const top = Math.min(...cart.slice(hit, land + 1).map((a) => a.y));
  assert.ok(cart[hit].y - top >= 12, `it rises only ${(cart[hit].y - top).toFixed(0)} as it goes over`);
  // its load: some spilled on the way, the rest flung on far ahead, skulls among it; all at rest at the end
  const load = m.tracks.filter((t) => /^(ore|skull|bone) /.test(t.name));
  assert.ok(load.length >= 14, `${load.length} things in its load`);
  const spilled = load.filter((t) => moved(t.at[hit - 1]!, cart[hit - 1]) >= 25);
  assert.ok(spilled.length >= 2, `only ${spilled.length} spilled on the way`);
  const flung = load.filter((t) => t.at[t.at.length - 1]!.x - cart[hit].x >= 70);
  assert.ok(flung.length >= 6 && flung.some((t) => t.name.startsWith('skull')), `only ${flung.length} flung on far (${flung.map((t) => t.name).join(', ')})`);
  for (const t of load) assert.ok(restsAtEnd(t), `${t.name} is still moving at the end`);
  // the buffer splinters
  const splinters = m.tracks.filter((t) => t.name.startsWith('splinter'));
  assert.ok(splinters.length >= 6 && splinters.every((t) => moved(t.at[hit]!, t.at[t.at.length - 1]!) >= 8 && restsAtEnd(t)), 'the buffer does not splinter');
  // a wheel broken off: rolling away, and lying still at the end
  const w = m.tracks.find((t) => t.name === 'the wheel')!;
  assert.ok(moved(w.at[land]!, w.at[w.at.length - 1]!) >= 50 && restsAtEnd(w), `the wheel rolls only ${moved(w.at[land]!, w.at[w.at.length - 1]!).toFixed(0)}`);
  assert.ok(unlike(m.frames[hit], m.frames[hit - 1]) >= 300, 'the strike does not show');
  for (let i = m.frames.length - 6; i < m.frames.length; i++) assert.ok(unlike(m.frames[i], m.frames[i - 1]) > 0, `nothing turns at ${i}`);
});

test('floor 4, moments: the heap breathes, skulls rolling off it, fingers poking out; bones fountain up as a great arm bursts out on a jolt and rakes wide; the pink kindles in a skull, steady; the arm comes apart a piece at a time, crashing down on a second jolt; the skull is buried under sliding bones, its eyes seen going under', () => {
  const m = named('the bones stir');
  const burst = m.jolts[0];
  const collapse = m.jolts[m.jolts.length - 1];
  assert.ok(m.jolts.length >= 3 && collapse > burst + 30, `jolts ${m.jolts}`);
  // it breathes, deep: up and down twice and more before it bursts
  const heap = m.tracks.find((t) => t.name === 'the heap')!.at.slice(0, burst).map((a) => a!.y);
  let turns = 0;
  for (let i = 2; i < heap.length; i++) if ((heap[i] - heap[i - 1]) * (heap[i - 1] - heap[i - 2]) < 0) turns++;
  assert.ok(Math.max(...heap) - Math.min(...heap) >= 4 && turns >= 4, `it breathes ${(Math.max(...heap) - Math.min(...heap)).toFixed(1)} high, ${turns} turns`);
  // skulls roll off it as it breathes
  const rolled = m.tracks.filter((t) => t.name.startsWith('skull') && t.at[0] && t.at[burst - 1] && moved(t.at[0]!, t.at[burst - 1]!) >= 12);
  assert.ok(rolled.length >= 3, `only ${rolled.length} skulls roll off it`);
  // the fountain: thrown high as the arm bursts out
  const high = m.tracks.filter((t) => /^(bone|skull) /.test(t.name) && t.at[burst] && Math.min(...seen(t).slice(burst).map((a) => a.y)) <= t.at[burst]!.y - 25);
  assert.ok(high.length >= 6, `only ${high.length} thrown high`);
  // the arm: up fast and high, raking wide, up a long while
  const hand = seen(m.tracks.find((t) => t.name === 'the hand')!);
  assert.ok(hand[0].y - Math.min(...hand.map((a) => a.y)) >= 40, 'the hand does not rise high');
  const xsH = hand.slice(0, 50).map((a) => a.x);
  assert.ok(Math.max(...xsH) - Math.min(...xsH) >= 60, `it rakes only ${(Math.max(...xsH) - Math.min(...xsH)).toFixed(0)} across`);
  // the eyes: dark, then kindled and steady, then going under bit by bit, lower as they go, and gone
  const eyes = m.tracks.find((t) => t.name === 'the burning eyes')!.at.map((a) => a!);
  assert.ok(eyes[0].shown === 0, 'the eyes burn from the start');
  const lit = eyes.findIndex((a) => a.shown >= 0.8);
  assert.ok(lit > burst, `the eyes kindle at ${lit}`);
  assert.ok(eyes.slice(lit, lit + 20).every((a) => a.shown >= 0.6), 'the eyes flicker');
  assert.ok(eyes[eyes.length - 1].shown === 0, 'the eyes still burn at the end');
  const peakAt = eyes.reduce((b, a, i) => (a.shown > eyes[b].shown ? i : b), 0);
  assert.ok(eyes.slice(peakAt).filter((a) => a.shown > 0 && a.shown < 0.8).length >= 8, 'the eyes go out at once');
  const lastSeen = eyes.map((a, i) => (a.shown > 0 ? i : -1)).filter((i) => i >= 0).pop()!;
  assert.ok(eyes[lastSeen].y > eyes[lit].y + 4, 'the eyes do not go down into it');
  // the arm's pieces, and all flung or poured, lie still at the end
  for (const t of m.tracks.filter((q) => /^(finger|palm|fore|upper|bone|skull) /.test(q.name))) assert.ok(restsAtEnd(t), `${t.name} is still moving at the end`);
  assert.ok(m.tracks.filter((q) => /^(finger|palm|fore|upper) /.test(q.name)).length >= 8, 'the arm does not come apart in pieces');
  assert.ok(unlike(m.after![0], m.before![0]) > 600, 'the heap is as it was');
});
