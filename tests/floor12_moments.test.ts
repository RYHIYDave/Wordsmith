// FLOOR 12'S MOMENT AROUND THE HERO (src/art/floor12_moments.ts; a mock-up nothing of the game imports): the surge, made
// on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15”), sent him as a film. Held to the checks every floor's moments go through
// (tests/floor_checks.ts, its moments' part, written out here for the one, as tests/floor11_moments.test.ts does), and to
// his Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too
// high than a notch too low.”).
//   run: tsx --test tests/floor12_moments.test.ts

// @ts-ignore
import * as nodeFs from 'node:fs';
import { undercityMoments } from '../src/art/floor12_moments';
import { assert, count, each, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const [m] = undercityMoments();

test('floor 12, its moment: the surge, and nothing of the game imports it', () => {
  assert.ok(undercityMoments().length === 1, 'one moment');
  assert.ok(m.name === 'the surge', m.name);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/floor12_moments.ts') continue;
    if (/from ['"][^'"]*floor12_moments['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.ok(users.length === 0, `game files that import it: ${users.join(' ')}`);
});

test('floor 12, its moment: crisp, long enough to read, smooth (30 frames a second), every frame painted, nothing popping as it starts or ends', () => {
  assert.ok(m.frames.length >= 60 && m.fps >= 30, `${m.frames.length} frames at ${m.fps}`);
  let soft = 0;
  for (const s of [...m.frames, ...(m.before ?? []), ...(m.after ?? [])]) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
  assert.ok(soft === 0, `${soft} soft pixels`);
  assert.ok(m.before && unlike(m.frames[0], m.before[0]) === 0, 'its first frame is not what was there');
  assert.ok(m.after && unlike(m.frames[m.frames.length - 1], m.after[0]) === 0, 'its last frame is not what is left');
  assert.ok(m.holds.length === 0, 'nothing held');
  // (the two sudden changes meant: the flap flung open, and its clank shut)
  assert.ok(m.jolts.length === 2, `${m.jolts.length} jolts`);
});

test('floor 12, its moment: nothing jumps from one frame to the next; nothing pops in or out in the middle (but at its jolts); always moving', () => {
  for (const t of m.tracks) {
    let seen = false;
    for (let i = 1; i < t.at.length; i++) {
      const a = t.at[i - 1];
      const b = t.at[i];
      if (a && b && !m.jolts.includes(i)) {
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
    if (!m.jolts.some((j) => i >= j && i <= j + 2)) assert.ok(Math.abs(b - a) <= 0.45 * Math.max(a, b, 120), `frame ${i}: ${a} to ${b} pixels`);
    assert.ok(unlike(m.frames[i - 1], m.frames[i]) >= 4, `frame ${i} hardly changed`);
  }
});

test('floor 12, its moment: crisp, no speckle: hardly a loose single pixel in any frame', () => {
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

test('floor 12, the surge: the flap shut and dripping before; flung open; a wave that runs off down the channel and dies away; what it brings out comes to rest; the flap shut again at the end', () => {
  const flap = m.tracks.find((t) => t.name === 'the flap')!;
  const [burst, shut] = m.jolts;
  // (shut before and after: where it hangs is where it ends)
  const f0 = flap.at[0]!;
  const fN = flap.at[flap.at.length - 1]!;
  assert.ok(Math.hypot(fN.x - f0.x, fN.y - f0.y) < 0.5, 'the flap is not shut again at the end');
  const most = Math.max(...flap.at.map((a) => Math.hypot(a!.x - f0.x, a!.y - f0.y)));
  assert.ok(most > 8, `the flap only moves ${most.toFixed(1)} pixels`);
  assert.ok(m.before !== null && m.before.length >= 4 && unlike(m.before[0], m.before[2]) > 0, 'it drips before it plays');
  // (the wave: born at the burst, running off down the channel a long way, fast, and gone)
  const head = m.tracks.find((t) => t.name === 'the head of the wave')!;
  const seen = head.at.map((a, i) => [a, i] as const).filter(([a]) => a !== null && a.shown > 0);
  assert.ok(seen[0][1] >= burst && seen[0][1] <= burst + 3, 'the wave comes with the burst');
  const run = Math.hypot(seen[seen.length - 1][0]!.x - seen[0][0]!.x, seen[seen.length - 1][0]!.y - seen[0][0]!.y);
  assert.ok(run > 180, `the wave runs ${run.toFixed(0)} pixels down the channel`);
  const fastest = Math.max(...seen.slice(1).map(([a], k) => Math.hypot(a!.x - seen[k][0]!.x, a!.y - seen[k][0]!.y)));
  assert.ok(fastest >= 7, `the wave runs ${fastest.toFixed(1)} pixels a frame at its fastest`);
  assert.ok(head.at[head.at.length - 1]!.shown === 0, 'the wave is still there at the end');
  // (what it brings out: born at or after the burst, carried a long way, at rest at the end, still in the picture)
  for (const name of ['the corks', 'the notice', 'the plank']) {
    const t = m.tracks.find((x) => x.name === name)!;
    const i0 = t.at.findIndex((a) => a !== null);
    assert.ok(i0 >= burst && i0 < shut, `${name} comes out at frame ${i0}`);
    const a0 = t.at[i0]!;
    const end = t.at[t.at.length - 1]!;
    const prev = t.at[t.at.length - 2]!;
    assert.ok(Math.hypot(end.x - a0.x, end.y - a0.y) > 60, `${name} is carried only ${Math.hypot(end.x - a0.x, end.y - a0.y).toFixed(0)} pixels`);
    assert.ok(end.x === prev.x && end.y === prev.y, `${name} still moving at the end`);
    assert.ok(end.shown > 0.9, `${name} is not left floating where it came to rest`);
  }
  // (big: at its height, the most of it there is, many times what is there before)
  const peak = Math.max(...m.frames.map(count));
  assert.ok(peak > 20 * count(m.frames[0]), `at its height ${peak} pixels; before, ${count(m.frames[0])}`);
});

test('floor 12, the surge: nothing in a friend\'s cyan or the enemy\'s pink and gold (it is the sewer\'s water)', () => {
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
