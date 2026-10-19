// FLOOR 13'S MOMENT AROUND THE HERO (src/art/floor13_moments.ts; a mock-up nothing of the game imports): the whirl of
// pages, made
// on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15”), sent him as a film. Held to the checks every floor's moments go through
// (tests/floor_checks.ts, its moments' part, written out here for the one, as tests/floor11_moments.test.ts does), and to
// his Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too
// high than a notch too low.”).
//   run: tsx --test tests/floor13_moments.test.ts

// @ts-ignore
import * as nodeFs from 'node:fs';
import { millraceMoments } from '../src/art/floor13_moments';
import { assert, count, each, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const [m] = millraceMoments();

test('floor 13, its moment: the whirl of pages, and nothing of the game imports it', () => {
  assert.ok(millraceMoments().length === 1, 'one moment');
  assert.ok(m.name === 'the whirl of pages', m.name);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/floor13_moments.ts') continue;
    if (/from ['"][^'"]*floor13_moments['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.ok(users.length === 0, `game files that import it: ${users.join(' ')}`);
});

test('floor 13, its moment: crisp, long enough to read, smooth (30 frames a second), every frame painted, nothing popping as it starts or ends', () => {
  assert.ok(m.frames.length >= 60 && m.fps >= 30, `${m.frames.length} frames at ${m.fps}`);
  let soft = 0;
  for (const s of [...m.frames, ...(m.before ?? []), ...(m.after ?? [])]) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
  assert.ok(soft === 0, `${soft} soft pixels`);
  assert.ok(m.before && unlike(m.frames[0], m.before[0]) === 0, 'its first frame is not what was there');
  assert.ok(m.after && unlike(m.frames[m.frames.length - 1], m.after[0]) === 0, 'its last frame is not what is left');
  assert.ok(m.holds.length === 0, 'nothing held');
  // (nothing sudden: the gust comes in from the edge, the whirl spins up and falls apart)
  assert.ok(m.jolts.length === 0, `${m.jolts.length} jolts`);
});

test('floor 13, its moment: nothing jumps from one frame to the next; nothing pops in or out in the middle (but at its jolts); always moving', () => {
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

test('floor 13, its moment: crisp, no speckle: hardly a loose single pixel in any frame', () => {
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

test('floor 13, the whirl: the sheets stirring before; a gust from the edge; the whirl spins up, carries every sheet up high and round, and falls apart; the sheets come down somewhere else and lie still', () => {
  assert.ok(m.before !== null && m.before.length >= 4 && unlike(m.before[0], m.before[1]) > 0, 'the sheets stir before it plays');
  const gust = m.tracks.find((t) => t.name === 'the gust')!;
  const g = gust.at.map((a, i) => [a, i] as const).filter(([a]) => a !== null);
  assert.ok(g.length > 10 && g[0][1] < 10, 'the gust comes first');
  const whirl = m.tracks.find((t) => t.name === 'the whirl')!;
  assert.ok(whirl.at.some((a) => a !== null && a.shown === 1), 'the whirl spins up');
  assert.ok(whirl.at[whirl.at.length - 1] === null, 'the whirl is gone at the end');
  const sheets = m.tracks.filter((t) => t.name.startsWith('a sheet'));
  assert.ok(sheets.length >= 5, `${sheets.length} sheets`);
  for (const t of sheets) {
    const a0 = t.at[0]!;
    const high = Math.min(...t.at.map((a) => a!.y));
    const end = t.at[t.at.length - 1]!;
    const prev = t.at[t.at.length - 2]!;
    assert.ok(a0.y - high > 80, `${t.name} is carried up only ${(a0.y - high).toFixed(0)} pixels`);
    assert.ok(Math.hypot(end.x - a0.x, end.y - a0.y) > 30, `${t.name} comes down where it was`);
    assert.ok(end.x === prev.x && end.y === prev.y && end.shown === 1, `${t.name} still moving at the end, or gone`);
  }
  // (big: at its height, the most of it there is, many times what is there before)
  const peak = Math.max(...m.frames.map(count));
  assert.ok(peak > 3 * count(m.frames[0]), `at its height ${peak} pixels; before, ${count(m.frames[0])}`);
});

test('floor 13, the whirl: nothing in a friend\'s cyan or the enemy\'s pink and gold (it is the field\'s chaff and the mill\'s paper)', () => {
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
