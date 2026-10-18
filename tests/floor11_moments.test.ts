// FLOOR 11'S MOMENT AROUND THE HERO (src/art/floor11_moments.ts; a mock-up nothing of the game imports): the
// pigeons, his one pick for the Gate Ward, 18 Oct: “Pigeons burst off a roof (Recommended)”. Held to the checks
// every floor's moments go through (tests/floor_checks.ts, its moments' part, written out here for the one), and
// to his Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be a
// notch too high than a notch too low.”).
//   run: tsx --test tests/floor11_moments.test.ts

import { gateWardMoments } from '../src/art/floor11_moments';
import { assert, count, each, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();

const [m] = gateWardMoments();

test('floor 11, its moment: the pigeons, and nothing of the game imports it', () => {
  assert.ok(gateWardMoments().length === 1, 'one moment');
  assert.ok(m.name === 'the pigeons burst off a roof', m.name);
});

test('floor 11, its moment: crisp, long enough to read, smooth (30 frames a second), every frame painted, nothing popping as it starts or ends', () => {
  assert.ok(m.frames.length >= 10 && m.fps >= 30, `${m.frames.length} frames at ${m.fps}`);
  let soft = 0;
  for (const s of [...m.frames, ...(m.before ?? []), ...(m.after ?? [])]) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
  assert.ok(soft === 0, `${soft} soft pixels`);
  assert.ok(m.before && unlike(m.frames[0], m.before[0]) === 0, 'its first frame is not what was there');
  assert.ok(m.after && unlike(m.frames[m.frames.length - 1], m.after[0]) === 0, 'its last frame is not what is left');
  assert.ok(m.holds.length === 0 && m.jolts.length === 0, 'nothing held, nothing jolted');
});

test('floor 11, its moment: nothing jumps from one frame to the next; nothing pops in or out in the middle; always moving', () => {
  for (const t of m.tracks) {
    let seen = false;
    for (let i = 1; i < t.at.length; i++) {
      const a = t.at[i - 1];
      const b = t.at[i];
      if (a && b) {
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        assert.ok(d <= (a.size + b.size) / 2 + 2, `${t.name}, frame ${i}: moved ${d.toFixed(1)}`);
      }
      const now = b ? b.shown : 0;
      const was = a ? a.shown : 0;
      if (now > 0) seen = true;
      if (now - was > 0.35) assert.ok(t.fromEdge || (b !== null && b.size <= 8), `${t.name}: popped in at frame ${i}`);
      assert.ok(was - now <= 0.35, `${t.name}: frame ${i} lost ${((was - now) * 100).toFixed(0)}% of it at once`);
    }
    assert.ok(seen || (t.at[0]?.shown ?? 0) > 0, `${t.name}: seen at all`);
  }
  for (let i = 1; i < m.frames.length; i++) {
    const a = count(m.frames[i - 1]);
    const b = count(m.frames[i]);
    assert.ok(Math.abs(b - a) <= 0.45 * Math.max(a, b, 120), `frame ${i}: ${a} to ${b} pixels`);
    assert.ok(unlike(m.frames[i - 1], m.frames[i]) >= 4, `frame ${i} hardly changed`);
  }
});

test('floor 11, its moment: crisp, no speckle: hardly a loose single pixel in any frame', () => {
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

test('floor 11, the pigeons: a flock on the roof, bobbing; up off it one hard on another; out low over the street, then wheeling away as one and climbing out of the picture, bit by bit; their feathers settle on the roof and stay', () => {
  const birds = m.tracks.filter((t) => t.name.startsWith('pigeon'));
  assert.ok(birds.length >= 8, `${birds.length} pigeons: a flock`);
  // they bob and peck before it plays
  assert.ok(m.before !== null && m.before.length >= 4 && unlike(m.before[0], m.before[2]) > 0, 'they bob before it plays');
  const leaps: number[] = [];
  for (const b of birds) {
    const y0 = b.at[0]!.y;
    const leap = b.at.findIndex((a) => a !== null && Math.hypot(a.x - b.at[0]!.x, a.y - y0) > 10);
    assert.ok(leap > 0, `${b.name} never leaves the roof`);
    leaps.push(leap);
    const seen = b.at.filter((a) => a !== null && a.shown > 0);
    // out low over the street first: well down the picture from where it sat (the roofs he sees are at the top of his screen)
    const low = Math.max(...seen.map((a) => a!.y));
    assert.ok(low - y0 >= 40, `${b.name} swoops only ${(low - y0).toFixed(0)} pixels down over the street`);
    // then away: high up the picture before it is gone
    const top = Math.min(...seen.map((a) => a!.y));
    assert.ok(y0 - top >= 150, `${b.name} climbs only ${(y0 - top).toFixed(0)} pixels`);
    // out of the picture bit by bit, and gone by the end
    const fading = b.at.filter((a) => a !== null && a.shown > 0 && a.shown < 1).length;
    assert.ok(fading >= 3, `${b.name} goes in ${fading} frames`);
    assert.ok(b.at[b.at.length - 1]!.shown === 0, `${b.name} is still there at the end`);
    // fast: as his Animations 1 asks
    const fastest = Math.max(...b.at.slice(1).map((a, i) => (a && b.at[i] ? Math.hypot(a.x - b.at[i]!.x, a.y - b.at[i]!.y) : 0)));
    assert.ok(fastest >= 8, `${b.name}: ${fastest.toFixed(1)} pixels a frame at its fastest`);
  }
  // one hard on another: all up within a fifth of a second
  assert.ok(Math.max(...leaps) - Math.min(...leaps) <= 7, `they leap over ${Math.max(...leaps) - Math.min(...leaps)} frames`);
  // as one: where they go out of the picture, all on one side of it, together
  const last = birds.map((b) => {
    const seen = b.at.filter((a) => a !== null && a.shown > 0);
    return seen[seen.length - 1]!;
  });
  assert.ok(Math.max(...last.map((a) => a.x)) - Math.min(...last.map((a) => a.x)) <= 120, 'the flock breaks up');
  // the feathers: each falls and lies still at the end, on the roof
  const feathers = m.tracks.filter((t) => t.name.startsWith('feather'));
  assert.ok(feathers.length >= 8, `${feathers.length} feathers`);
  for (const t of feathers) {
    const seen = t.at.filter((a) => a !== null);
    const end = seen[seen.length - 1]!;
    const prev = seen[seen.length - 2]!;
    assert.ok(end.x === prev.x && end.y === prev.y, `${t.name} still falling at the end`);
    assert.ok(end.y - Math.min(...seen.map((a) => a!.y)) >= 8, `${t.name} hardly falls`);
  }
  assert.ok(count(m.after![0]) > 40, 'nothing left on the roof');
});

test('floor 11, the pigeons: nothing in a friend\'s cyan or the enemy\'s pink and gold (they are the city\'s birds)', () => {
  const ENEMY = new Set(['#ff4f8a', '#c0206a', '#7a1058', '#ffb070', '#fff0a0']);
  for (const s of [...m.frames, ...(m.before ?? [])]) {
    each(s, (r, g, b) => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      if (max > min) h = max === r ? ((g - b) / (max - min)) * 60 : max === g ? (2 + (b - r) / (max - min)) * 60 : (4 + (r - g) / (max - min)) * 60;
      h = (h + 360) % 360;
      assert.ok(!(max >= 150 && max - min >= 0.45 * max && h >= 165 && h <= 205), `cyan, ${r},${g},${b}`);
      const hx = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      assert.ok(!ENEMY.has(hx), `the enemy's ${hx}`);
    });
  }
});
