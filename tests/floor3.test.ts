// THE CHAINED ONE'S FLOOR (src/art/floor3.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees it, and to his notes on floor 1's first pictures, through the checks every
// Crypt floor goes through (tests/floor_checks.ts); then its own moments, each checked against his
// Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be
// a notch too high than a notch too low.”; 07:53: “And I want all animations checked against this
// statement before I see them.”).
//   run: tsx --test tests/floor3.test.ts

import { chainedMoments, chainedPieces, dustCloudAt } from '../src/art/floor3';
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
  fullHeight: ['the bowed wall', 'the wall winch', 'rings and chains', 'the cell grate'],
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

/** The frames of a film after a frame, a few on. */
const last = <T>(xs: readonly T[]): T => xs[xs.length - 1];
/** How many direction changes a series of numbers makes (ignoring standing still). */
const turnsOf = (ys: readonly number[]): number => {
  let n = 0;
  let was = 0;
  for (let i = 1; i < ys.length; i++) {
    const d = Math.sign(Math.round((ys[i] - ys[i - 1]) * 10));
    if (d !== 0 && was !== 0 && d !== was) n++;
    if (d !== 0) was = d;
  }
  return n;
};

test('floor 3, moments: the dust (as the first fresh look asked): grows out of where it is struck over three frames, blows out fast and slows, hangs and spreads, sinks onto the floor and flattens, and shrinks away as one', () => {
  const c = { f0: 0, o: [0, 0, 40] as [number, number, number], v: [0, 2, 0] as [number, number, number], r: 10, hang: 4, seed: 1 };
  const at = (k: number) => dustCloudAt(c, k);
  // born small and growing over three frames: never whole at once
  assert.ok(at(0)!.r <= 3.5 && at(1)!.r < at(2)!.r && at(2)!.r < at(3)!.r && at(3)!.r >= 9.5, `grows ${[0, 1, 2, 3].map((k) => at(k)!.r.toFixed(1)).join(' ')}`);
  // thrown out fast, then slowing
  const go = (k: number): number => at(k)!.q[1];
  assert.ok(go(1) - go(0) > 1.2 && go(6) - go(5) < (go(1) - go(0)) / 2, 'it does not blow out fast and slow');
  // spreading as it hangs
  assert.ok(at(6)!.r > at(3)!.r, 'it does not spread');
  // settling: down onto the floor, and flat there
  let k = 7;
  while (at(k) && at(k)!.q[2] > 1.5) k++;
  assert.ok(at(k) !== null && at(k)!.sy <= 0.4 && at(k)!.sx >= 1.3, `it does not settle flat on the floor (${k})`);
  // and shrinks away as one: smaller every frame to the last
  let n = k;
  while (at(n + 1)) {
    assert.ok(at(n + 1)!.r < at(n)!.r + 1e-9 && Math.abs(at(n + 1)!.q[2] - at(n)!.q[2]) < 0.5, `frame ${n + 1}: not shrinking where it lies`);
    n++;
  }
  assert.ok(n - k >= 4, 'it is gone too fast');
});

test('floor 3, moments: the chains pull: it starts at once (rings shuddering, his eyes in the port), two hauls each a jolt snatch the chains up and taut, the third rips a plate out (a jolt), its chain whips out across the floor toward the hero and slaps down (a jolt), bouncing; chunks of the wall fly and bounce; the others drop slack and swing', () => {
  const m = named('the chains pull');
  const [y1, y2, rip, slap] = m.jolts;
  assert.ok(m.jolts.length === 4 && y1 < y2 && y2 < rip && rip < slap, `jolts ${m.jolts.join(' ')}`);
  assert.ok(y1 <= 10, `nothing hauls until frame ${y1}`);
  for (const film of [m, m.right!]) {
    // his eyes glint in the port before the first haul, and are gone at the end, going over frames
    const eyes = track(film.tracks, 'his eyes');
    assert.ok(eyes.slice(1, y1).some((a) => a!.shown > 0), 'no eyes in the port before the haul');
    assert.ok(last(eyes)!.shown === 0 && eyes.filter((a, i) => i > rip && a!.shown > 0 && a!.shown < 1).length >= 2, 'his eyes do not go back into the dark bit by bit');
    // hauled: each chain's middle snatched fast at the first haul, and up off the floor
    for (const i of [1, 2, 3]) {
      const c = track(film.tracks, `chain ${i}`);
      const fastest = Math.max(...[0, 1, 2, 3].map((k) => step(c, y1 + k)));
      assert.ok(fastest >= 4, `chain ${i} moves only ${fastest.toFixed(1)} a frame as it is hauled`);
      assert.ok(c[0]!.y - Math.min(...c.slice(y1, y2 + 4).map((a) => a!.y)) >= 8, `chain ${i}'s middle rises only ${(c[0]!.y - Math.min(...c.slice(y1, y2 + 4).map((a) => a!.y))).toFixed(0)}`);
    }
    // the torn ring: thrown a long way out into the room, striking hard, bouncing
    const ring = track(film.tracks, 'the torn ring');
    assert.ok(Math.hypot(last(ring)!.x - ring[rip - 1]!.x, last(ring)!.y - ring[rip - 1]!.y) >= 50, 'the torn ring is not thrown far');
    assert.ok(last(ring)!.y - ring[rip - 1]!.y >= 40, 'the torn ring does not come out toward the hero');
    assert.ok(step(ring, slap) >= 5, `the torn ring strikes at only ${step(ring, slap).toFixed(1)} a frame`);
    // (up off the floor after it strikes: above the line from where it strikes to where it lies a few frames on)
    let lift = 0;
    for (let i = slap + 1; i < slap + 7; i++) lift = Math.max(lift, ring[slap]!.y + ((ring[slap + 7]!.y - ring[slap]!.y) * (i - slap)) / 7 - ring[i]!.y);
    assert.ok(lift >= 2, `the ring does not bounce (${lift.toFixed(1)})`);
    // the two left drop slack and swing
    for (const i of [2, 3]) {
      const ys = track(film.tracks, `chain ${i}`).slice(rip).map((a) => a!.y);
      assert.ok(Math.max(...ys) - ys[0] >= 6, `chain ${i} drops only ${(Math.max(...ys) - ys[0]).toFixed(1)} when let go`);
      assert.ok(turnsOf(ys) >= 2, `chain ${i} does not swing`);
    }
    // chunks of the wall: born as it rips, flung out, bouncing, lying still at the end
    const chunks = film.tracks.filter((t) => t.name.startsWith('chunk'));
    assert.ok(chunks.length >= 5, `${chunks.length} chunks`);
    for (const t of chunks) {
      assert.ok(t.at[rip - 1] === null && t.at[rip] !== null, `${t.name} not born as it rips`);
      const a = t.at[rip]!;
      const z = last(t.at)!;
      assert.ok(Math.hypot(z.x - a.x, z.y - a.y) >= 15, `${t.name} flies only ${Math.hypot(z.x - a.x, z.y - a.y).toFixed(1)}`);
      assert.ok(Math.hypot(z.x - t.at[t.at.length - 2]!.x, z.y - t.at[t.at.length - 2]!.y) < 1, `${t.name} still moving at the end`);
    }
    assert.ok(unlike(film.after![0], film.before![0]) > 300, 'what is left is what was there');
  }
});

test('floor 3, moments: the ball falls: it rocks on the heap, tips and drops the height of the heap faster every frame, strikes on a jolt (the flags jump, chips, dust), bounces high clear of the dust and again, rolls a long way toward the hero, snatches its block on its chain and drags it, rocks back, and lies whole on the floor', () => {
  const m = named('the ball falls');
  const ball = track(m.tracks, 'the ball');
  const [impact, second] = m.jolts;
  assert.ok(m.jolts.length === 2 && impact > 14, `jolts ${m.jolts.join(' ')}`);
  // it rocks before it goes: back and forth, several pixels
  const rock = ball.slice(0, 14).map((a) => a!.x);
  assert.ok(turnsOf(rock) >= 2 && Math.max(...rock) - Math.min(...rock) >= 3, `it rocks ${turnsOf(rock)} times over ${(Math.max(...rock) - Math.min(...rock)).toFixed(1)}`);
  // it falls a long way, faster every frame, and strikes hard
  const top = Math.min(...ball.slice(0, impact).map((a) => a!.y));
  assert.ok(ball[impact]!.y - top >= 40, `it falls only ${(ball[impact]!.y - top).toFixed(0)}`);
  for (let i = impact - 3; i < impact; i++) assert.ok(ball[i]!.y - ball[i - 1]!.y > ball[i - 1]!.y - ball[i - 2]!.y - 0.01, `it does not fall faster at ${i}`);
  assert.ok(step(ball, impact - 1) >= 6, `it strikes at only ${step(ball, impact - 1).toFixed(1)} a frame`);
  // it bounces high, well above the line between its two blows
  let lift = 0;
  for (let i = impact + 1; i < second; i++) {
    const t = (i - impact) / (second - impact);
    lift = Math.max(lift, ball[impact]!.y + (ball[second]!.y - ball[impact]!.y) * t - ball[i]!.y);
  }
  assert.ok(lift >= 8, `it bounces only ${lift.toFixed(1)}`);
  // it rolls a long way toward the hero (down the screen and to its left), and lies still
  const end = last(ball)!;
  assert.ok(end.y - ball[second]!.y >= 15 && end.x < ball[second]!.x - 15, `it rolls on only (${(end.x - ball[second]!.x).toFixed(0)}, ${(end.y - ball[second]!.y).toFixed(0)})`);
  const n = ball.length;
  assert.ok(Math.hypot(end.x - ball[n - 6]!.x, end.y - ball[n - 6]!.y) < 0.5, 'it is still rolling at the end');
  // the chain snatches the block and drags it; the ball rocks back
  const block = track(m.tracks, 'the block');
  assert.ok(Math.hypot(last(block)!.x - block[0]!.x, last(block)!.y - block[0]!.y) >= 6, 'the block is not dragged');
  const fartherst = ball.reduce((b, a, i) => (a!.y > ball[b]!.y ? i : b), 0);
  assert.ok(ball[fartherst]!.y - end.y >= 0.8, `it does not rock back (${(ball[fartherst]!.y - end.y).toFixed(1)})`);
  // the ball lies whole on the floor at the end (the first look found it sinking into the solid floor)
  let iron = 0;
  const BALL = new Set(['#3e3a70', '#6c68a8', '#8a86c0', '#1c1a3a']);
  each(last(m.frames), (r, g, b) => (iron += BALL.has(hex(r, g, b)) ? 1 : 0));
  assert.ok(iron >= 0.8 * Math.PI * 10 * 10, `the ball at the end is only ${iron} pixels`);
  // the blow: chips flung, the broken flags jumping up and down again, stones tumbling after it
  for (const t of m.tracks.filter((q) => q.name.startsWith('chip'))) assert.ok(t.at[impact - 1] === null && t.at[impact] !== null, `${t.name} not born on the blow`);
  const flags = m.tracks.filter((q) => q.name.startsWith('flag'));
  assert.ok(flags.length >= 4, `${flags.length} flags`);
  for (const t of flags) {
    const ys = t.at.filter((a) => a !== null).map((a) => a!.y);
    assert.ok(ys[0] - Math.min(...ys) >= 2 && Math.abs(last(ys) - ys[0]) < 0.5, `${t.name} does not jump and land`);
  }
  for (const t of m.tracks.filter((q) => q.name.startsWith('stone'))) {
    const born = t.at.findIndex((a) => a !== null);
    assert.ok(born > 13 && born < impact + 4, `${t.name} not after the ball`);
    assert.ok(last(t.at)!.y - t.at[born]!.y >= 25, `${t.name} falls only ${(last(t.at)!.y - t.at[born]!.y).toFixed(0)}`);
  }
  assert.ok(track(m.tracks, 'the pebble').findIndex((a) => a !== null) < 10, 'no pebble goes first');
});

test('floor 3, moments: the bars shake: a grate the height of the wall; two pink eyes rise into it, a matched pair, and huge hands come up out of the dark and grip; three heaves each a jolt; stones pop out and bounce; a bar bows out and its pin shoots out across the floor, bouncing; the hands slide down into the dark and the eyes go back', () => {
  const m = named('the bars shake');
  assert.ok(m.jolts.length === 3, `${m.jolts.length} heaves`);
  for (const film of [m, m.right!]) {
    const bars = track(film.tracks, 'the bars');
    for (const j of m.jolts) {
      const most = Math.max(...[0, 1, 2].map((k) => step(bars, j + k)));
      assert.ok(most >= 3, `the bars move only ${most.toFixed(1)} at heave ${j}`);
    }
    assert.ok(turnsOf(bars.map((a) => a!.x)) >= 12, 'the bars do not shake to and fro');
    // a grate the wall's height: its frames over sixty pixels tall
    assert.ok(film.frames[0].h * (film.frames[0].density ?? 1) >= 64, `the grate is only ${film.frames[0].h * (film.frames[0].density ?? 1)} tall`);
    // the hands: come and go bit by bit, sliding down as they go
    for (const n of ['his hand 1', 'his hand 2']) {
      const h = track(film.tracks, n);
      assert.ok(h[0]!.shown === 0 && last(h)!.shown === 0 && Math.max(...h.map((a) => a!.shown)) === 1, `${n} does not come and go`);
      assert.ok(h.filter((a) => a!.shown > 0 && a!.shown < 1).length >= 8, `${n} comes and goes too fast`);
      const gone = h.findIndex((a, i) => i > m.jolts[2] && a!.shown === 0);
      const held = h.findIndex((a, i) => i > m.jolts[2] && a!.shown < 1);
      assert.ok(h[gone - 1]!.y - h[held - 1]!.y >= 6, `${n} does not slide down as it goes`);
    }
    // his eyes: a matched pair, pink, at every heave; none at the start or the end; going over frames
    assert.ok(pink(film.frames[0]) === 0 && pink(last(film.frames)) === 0, 'pink at the start or the end');
    for (const j of m.jolts) {
      const s = film.frames[j];
      let left = 0;
      let right = 0;
      const cx = (s.ax * (s.density ?? 1));
      each(s, (r, g, b, _a, x) => {
        if (!FIRE.has(hex(r, g, b))) return;
        if (x < cx - (film === m ? 0 : 0)) left++;
        else right++;
      });
      assert.ok(left >= 2 && right >= 2 && Math.abs(left - right) <= 3, `his eyes at heave ${j} not a pair (${left}, ${right})`);
    }
    const eyes = track(film.tracks, 'his eyes');
    assert.ok(eyes.filter((a, i) => i > m.jolts[2] && a!.shown > 0 && a!.shown < 1).length >= 3, 'his eyes go back into the dark too fast');
    // the bowed bar: out of the grate at the last heave, and stays
    const bowed = track(film.tracks, 'the bowed bar');
    assert.ok(Math.hypot(last(bowed)!.x - bowed[0]!.x, last(bowed)!.y - bowed[0]!.y) >= 8, 'the bar does not bow out');
    // the pin: born at the last heave, shot well out, bouncing, lying still
    const pin = track(film.tracks, 'the pin');
    const j3 = m.jolts[2];
    assert.ok(pin[j3 - 1] === null && pin[j3] !== null, 'no pin at the last heave');
    const r = pin.filter((a) => a !== null).map((a) => a!);
    assert.ok(Math.hypot(last(r).x - r[0].x, last(r).y - r[0].y) >= 30, 'the pin is not shot far');
    assert.ok(turnsOf(r.map((a) => a.y)) >= 3, 'the pin does not bounce');
    assert.ok(Math.hypot(last(r).x - r[r.length - 2].x, last(r).y - r[r.length - 2].y) < 1, 'the pin still moving at the end');
    // stones popping out of the stone at the heaves, lying still
    const stones = film.tracks.filter((t) => t.name.startsWith('stone'));
    assert.ok(stones.length >= 6, `${stones.length} stones`);
    for (const t of stones) assert.ok(m.jolts.includes(t.at.findIndex((a) => a !== null)) && last(t.at) !== null, `${t.name} not born on a heave`);
    assert.ok(unlike(film.after![0], film.before![0]) > 80, 'what is left is what was there');
  }
});
