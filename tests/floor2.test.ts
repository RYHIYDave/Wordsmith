// THE HEADSMAN'S FLOOR (src/art/floor2.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees it, and to his notes on floor 1's first pictures, through the checks every
// Crypt floor goes through (tests/floor_checks.ts); then its own moments, each checked against his
// Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be
// a notch too high than a notch too low.”; 07:53: “And I want all animations checked against this
// statement before I see them.”).
//   run: tsx --test tests/floor2.test.ts

import { headsmanMoments, headsmanPieces } from '../src/art/floor2';
import type { Moment } from '../src/art/floorkit';
import { assert, count, each, floorChecks, test } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

const pieces = headsmanPieces();
const moments = headsmanMoments();

floorChecks({
  label: 'floor 2',
  pieces,
  moments,
  onePlace: ['the chute', 'dart mask'],
  fullHeight: ['the long stain', 'chain from the dark'],
  fires: ['torch', 'black candles'],
  tileTraps: ['blade slots', 'crescent plate'],
  shadowed: ['kicked-over stool', 'dropped lantern', 'the chute'],
});

const named = (n: string): Moment => {
  const m = moments.find((q) => q.name === n);
  if (!m) throw new Error(`no moment named ${n}`);
  return m;
};
/** How wide what is painted is, across the frame, in picture pixels. */
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

test('floor 2, moments: three, each its own, as he asked (“you spook a pack of birds and they fly off”, “Something shifts above you and dust comes down”)', () => {
  assert.ok(moments.length === 3, `${moments.length} moments`);
  for (const m of moments) assert.ok(m.holds.length === 0, `${m.name}: held ${m.holds.length} frames (a freeze reads as a stall)`);
});

test('floor 2, moments: the ravens peck, start up together, burst off the floor one hard on another, scatter every way and climb high, out of the picture bit by bit; their feathers settle and stay', () => {
  const m = named('the ravens take flight');
  const birds = m.tracks.filter((t) => t.name.startsWith('raven'));
  assert.ok(birds.length >= 5, `${birds.length} ravens: a pack`);
  // they peck: the first frames move though nothing has left the floor
  assert.ok(m.before !== null && m.before.length >= 4 && unlike(m.before[0], m.before[2]) > 0, 'they peck before it plays');
  const leaps: number[] = [];
  for (const b of birds) {
    const y0 = b.at[0]!.y;
    // (up off the floor and away: further than a hop)
    const leap = b.at.findIndex((a) => a !== null && Math.hypot(a.x - b.at[0]!.x, a.y - y0) > 10);
    assert.ok(leap > 0, `${b.name} never leaves the floor`);
    leaps.push(leap);
    // high: well up the screen before it is gone (the wall's full height is 80)
    const seen = b.at.filter((a) => a !== null && a.shown > 0);
    const top = Math.min(...seen.map((a) => a!.y));
    assert.ok(top - y0 <= -110, `${b.name} climbs only ${(y0 - top).toFixed(0)} pixels`);
    // out of the picture bit by bit (never in a speckle: they fly out of it), and gone by the end
    const fading = b.at.filter((a) => a !== null && a.shown > 0 && a.shown < 1).length;
    assert.ok(fading >= 4, `${b.name} goes in ${fading} frames`);
    assert.ok(b.at[b.at.length - 1]!.shown === 0, `${b.name} is still there at the end`);
    // fast: three of the game's pixels a frame and more as it climbs
    const fastest = Math.max(...b.at.slice(1).map((a, i) => (a && b.at[i] ? Math.hypot(a.x - b.at[i]!.x, a.y - b.at[i]!.y) : 0)));
    assert.ok(fastest >= 6, `${b.name}: ${fastest.toFixed(1)} pixels a frame at its fastest`);
  }
  // one hard on another: all up within a quarter of a second
  assert.ok(Math.max(...leaps) - Math.min(...leaps) <= 9, `they leap over ${Math.max(...leaps) - Math.min(...leaps)} frames`);
  // every way: where they are last seen spread wide across the screen, and at least one each side of where they stood
  const last = birds.map((b) => {
    const seen = b.at.filter((a) => a !== null && a.shown > 0);
    return seen[seen.length - 1]!.x;
  });
  assert.ok(Math.max(...last) - Math.min(...last) >= 120, `they scatter only ${(Math.max(...last) - Math.min(...last)).toFixed(0)} pixels`);
  assert.ok(last.some((x) => x < -30) && last.some((x) => x > 30), `all one way: ${last.map((x) => x.toFixed(0)).join(' ')}`);
  // a bone flung over as one beats up off the floor, and lying where it fell
  const bone = m.tracks.find((t) => t.name === 'the flung bone')!.at;
  const moved = bone.some((a) => a!.y < bone[0]!.y - 4);
  assert.ok(moved && bone[bone.length - 1]!.x !== bone[0]!.x, 'the bone is not flung');
  // the feathers: each falls a good way and lies still at the end, and stays (what is left is not just the bones)
  const feathers = m.tracks.filter((t) => t.name.startsWith('feather'));
  assert.ok(feathers.length >= 6, `${feathers.length} feathers`);
  for (const t of feathers) {
    const seen = t.at.filter((a) => a !== null);
    const end = seen[seen.length - 1]!;
    const prev = seen[seen.length - 2]!;
    assert.ok(end.x === prev.x && end.y === prev.y, `${t.name} still falling at the end`);
    assert.ok(end.y - seen[0]!.y >= 8, `${t.name} falls only ${(end.y - seen[0]!.y).toFixed(0)}`);
  }
  assert.ok(count(m.after![0]) > count(m.frames[0]) * 0.2, 'nothing left');
});

test('floor 2, moments: the bell swings by itself, wider and wider, heeling far over; it strikes at the top of its swings, each a jolt, the frame jumping and dust flying wide; it swings on and hangs still again', () => {
  const m = named('the bell tolls');
  const bell = m.tracks.find((t) => t.name === 'the bell')!.at;
  const clap = m.tracks.find((t) => t.name === 'its clapper')!.at;
  // it tolls: three strokes or more, each a jolt
  assert.ok(m.jolts.length >= 3, `${m.jolts.length} strokes`);
  // wide: its lip swings far each way, and far up (heeled over toward the hero and away)
  const xs = bell.map((a) => a!.x);
  const ys = bell.map((a) => a!.y);
  assert.ok(Math.min(...xs) <= -20 && Math.max(...xs) >= 20, `its lip swings from ${Math.min(...xs).toFixed(0)} to ${Math.max(...xs).toFixed(0)}`);
  assert.ok(Math.min(...ys) - ys[0] <= -24, `its lip rises only ${(ys[0] - Math.min(...ys)).toFixed(0)}`);
  // each stroke at the top of a swing, the strokes by turns on each side
  let side = 0;
  for (const j of m.jolts) {
    // (the frame jumps on the stroke: near enough, against the swing either side of it)
    const d = Math.abs(xs[j] - xs[0]);
    const near = Math.max(...[-3, -2, -1, 1, 2, 3].map((k) => Math.abs(xs[j + k] - xs[0])));
    assert.ok(d >= 0.75 * near, `stroke ${j} is not at the top of its swing (${d.toFixed(1)}, ${near.toFixed(1)} by it)`);
    const s = Math.sign(xs[j] - xs[0]);
    assert.ok(s !== side, `two strokes on one side at ${j}`);
    side = s;
  }
  // the clapper swings across inside it to strike: at every stroke it is out at the lip, well away
  // from where it hangs at rest in the bell's middle, and between strokes it swings back through the middle
  const out = (k: number): number => Math.hypot(clap[k]!.x - bell[k]!.x - (clap[0]!.x - bell[0]!.x), clap[k]!.y - bell[k]!.y - (clap[0]!.y - bell[0]!.y));
  for (const j of m.jolts) assert.ok(out(j) >= 6, `at stroke ${j} the clapper is only ${out(j).toFixed(1)} out from the bell's middle`);
  for (let i = 1; i < m.jolts.length; i++) {
    const between = Array.from({ length: m.jolts[i] - m.jolts[i - 1] }, (_, k) => out(m.jolts[i - 1] + k));
    assert.ok(Math.min(...between) <= 3, `the clapper does not swing back through the middle between strokes ${m.jolts[i - 1]} and ${m.jolts[i]}`);
  }
  // dust flies wide at every stroke: the frames after it wider than its own frame
  const own = across([m.before![0]]);
  for (const j of m.jolts) {
    const w = across(m.frames.slice(j, j + 12));
    assert.ok(w >= own + 30, `at stroke ${j}: ${w} across against its own ${own}`);
  }
  // the frame jumps on its feet at the stroke: its pixels move at the jolt
  for (const j of m.jolts) assert.ok(unlike(m.frames[j], m.frames[j - 1]) >= 400, `stroke ${j}: only ${unlike(m.frames[j], m.frames[j - 1])} pixels change`);
  // and it hangs still again as it was
  assert.ok(unlike(m.frames[m.frames.length - 1], m.before![0]) === 0, 'it does not hang as it was');
});

test('floor 2, moments: the gibbet: the chain slips and catches, the cage is flung swinging wide, bursts at the top of its swing throwing out a bar, the bones pour out wide and strike the floor, the skull bounces and rolls; the cage swings on empty', () => {
  const m = named('the gibbet swings');
  const cage = m.tracks.find((t) => t.name === 'the cage')!.at;
  assert.ok(m.jolts.length >= 3, `${m.jolts.length} jolts`);
  const [slip, burst, strike] = m.jolts;
  // the chain slips: the cage drops at once
  assert.ok(cage[slip]!.y - cage[0]!.y >= 4, `the cage drops only ${(cage[slip]!.y - cage[0]!.y).toFixed(1)}`);
  // wide: its foot swings far each way
  const xs = cage.map((a) => a!.x);
  assert.ok(Math.max(...xs) - Math.min(...xs) >= 44, `its foot swings ${(Math.max(...xs) - Math.min(...xs)).toFixed(0)} across`);
  // it bursts at the top of its swing (its foot as far out as it goes, near enough)
  const out = Math.abs(xs[burst] - xs[0]);
  assert.ok(out >= 0.85 * Math.max(...xs.slice(slip, burst + 3).map((x) => Math.abs(x - xs[0]))), `it bursts at ${burst}, not at the top of its swing`);
  // the bones: every one falls out and a long way, lies still at the end, and the skull strikes on a jolt
  const bones = m.tracks.filter((t) => ['the skull', 'the ribs', 'the leg', 'the other leg'].includes(t.name));
  // a snapped bar flung out of it as it bursts, born on the jolt, thrown well out, lying still at the end
  const bar = m.tracks.find((t) => t.name === 'a snapped bar')!.at;
  assert.ok(bar[burst - 1] === null && bar[burst] !== null, 'no bar snaps as it bursts');
  const barEnd = bar[bar.length - 1]!;
  assert.ok(Math.hypot(barEnd.x - bar[burst]!.x, barEnd.y - bar[burst]!.y) >= 30 && barEnd.x === bar[bar.length - 4]!.x && barEnd.y === bar[bar.length - 4]!.y, 'the bar is not flung out, or never comes to rest');
  assert.ok(bones.length >= 4, `${bones.length} bones`);
  for (const b of bones) {
    const ys = b.at.map((a) => a!.y);
    assert.ok(ys[ys.length - 1] - ys[0] >= 60, `${b.name} falls only ${(ys[ys.length - 1] - ys[0]).toFixed(0)}`);
    const n = ys.length;
    assert.ok(b.at[n - 1]!.x === b.at[n - 6]!.x && b.at[n - 1]!.y === b.at[n - 6]!.y, `${b.name} is still moving at the end`);
  }
  const skull = m.tracks.find((t) => t.name === 'the skull')!.at;
  const sy = skull.map((a) => a!.y);
  // faster every frame as it falls, just before it strikes
  for (let i = strike - 3; i < strike; i++) assert.ok(sy[i] - sy[i - 1] > sy[i - 1] - sy[i - 2], `the skull does not fall faster at ${i}`);
  // it bounces: up again after it strikes, high enough to see
  const after = sy.slice(strike, strike + 16);
  assert.ok(Math.min(...after) <= sy[strike] - 8, `the skull bounces only ${(sy[strike] - Math.min(...after)).toFixed(1)}`);
  // and rolls on: where it comes to rest is well away from where it struck
  const end = skull[skull.length - 1]!;
  assert.ok(Math.hypot(end.x - skull[strike]!.x, end.y - skull[strike]!.y) >= 8, 'the skull does not roll');
  // the cage swings on empty: still moving at the end, and what is left is not what was there
  assert.ok(Math.abs(xs[xs.length - 2] - xs[xs.length - 1]) > 0, 'the cage is still at the end');
  assert.ok(unlike(m.after![0], m.before![0]) > 200, 'what is left is what was there');
});
