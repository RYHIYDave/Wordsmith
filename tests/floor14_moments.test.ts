// FLOOR 14'S MOMENT AROUND THE HERO (src/art/floor14_moments.ts; a mock-up nothing of the game imports): the screen
// falls, made on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15”), sent him as a film. Held to the checks every floor's moments go through
// (tests/floor_checks.ts, its moments' part, written out here for the one, as tests/floor11_moments.test.ts does), and to
// his Animations 1 (10 Oct, 07:47: “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too
// high than a notch too low.”).
//   run: tsx --test tests/floor14_moments.test.ts

// @ts-ignore
import * as nodeFs from 'node:fs';
import { houseOfQuietMoments } from '../src/art/floor14_moments';
import { assert, count, each, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const [m] = houseOfQuietMoments();

// (ACT 2, THE HUSH: in the game now, behind ACT2, off: the films' maker alone imports it, art/films.ts, for the painter to make
// its film, laid by game/act2_moments.ts and played by render/act1_pieces.ts; nothing else of the game)
test('floor 14, its moment: the screen falls, and nothing of the game imports it but the films\' maker (art/films.ts)', () => {
  assert.ok(houseOfQuietMoments().length === 1, 'one moment');
  assert.ok(m.name === 'the screen falls', m.name);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/floor14_moments.ts') continue;
    if (/from ['"][^'"]*floor14_moments['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.ok(users.join(' ') === 'art/films.ts', `game files that import it: ${users.join(' ')}`);
});

test('floor 14, its moment: crisp, long enough to read, smooth (30 frames a second), every frame painted, nothing popping as it starts or ends', () => {
  assert.ok(m.frames.length >= 60 && m.fps >= 30, `${m.frames.length} frames at ${m.fps}`);
  let soft = 0;
  for (const s of [...m.frames, ...(m.before ?? []), ...(m.after ?? [])]) each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
  assert.ok(soft === 0, `${soft} soft pixels`);
  assert.ok(m.before && unlike(m.frames[0], m.before[0]) === 0, 'its first frame is not what was there');
  assert.ok(m.after && unlike(m.frames[m.frames.length - 1], m.after[0]) === 0, 'its last frame is not what is left');
  assert.ok(m.holds.length === 0, 'nothing held');
  // (one sudden thing: the screen striking the floor)
  assert.ok(m.jolts.length === 1, `${m.jolts.length} jolts`);
});

test('floor 14, its moment: nothing jumps from one frame to the next; nothing pops in or out in the middle (but at its jolts); always moving', () => {
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

test('floor 14, its moment: crisp, no speckle: hardly a loose single pixel in any frame', () => {
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

test('floor 14, the screen: stirring before; it rocks, tips toward the hero and comes down gathering speed; it strikes the floor at its jolt, bounces and lies still; the dust rolls out from it and is gone', () => {
  assert.ok(m.before !== null && m.before.length >= 4 && unlike(m.before[0], m.before[1]) > 0, 'the linen stirs before it plays');
  const screen = m.tracks.find((t) => t.name === 'the screen')!;
  const ys = screen.at.map((a) => a!.y);
  const jolt = m.jolts[0];
  // (its top: down the picture as it falls, lowest at the jolt or just after, and lying still at the end)
  const top0 = ys[0];
  const fell = Math.max(...ys.slice(jolt - 1, jolt + 2));
  assert.ok(fell - top0 > 40, `its top comes down only ${(fell - top0).toFixed(0)} pixels`);
  // (gathering speed: each of the last frames before it strikes moves its top further than the one before)
  const step = (i: number): number => Math.hypot(screen.at[i]!.x - screen.at[i - 1]!.x, screen.at[i]!.y - screen.at[i - 1]!.y);
  for (let i = jolt - 6; i < jolt; i++) assert.ok(step(i + 1) >= step(i) - 0.01, `frame ${i + 1}: it slows as it falls (${step(i).toFixed(1)} then ${step(i + 1).toFixed(1)})`);
  // (it rocks before it goes: its top moves, and comes back, before it tips)
  const early = ys.slice(1, jolt - 20);
  assert.ok(Math.max(...early) - Math.min(...early) > 2, 'it does not rock before it goes');
  const end = screen.at[screen.at.length - 1]!;
  const prev = screen.at[screen.at.length - 2]!;
  assert.ok(end.x === prev.x && end.y === prev.y, 'still moving at the end');
  const dust = m.tracks.find((t) => t.name === 'the dust')!;
  assert.ok(dust.at.slice(0, jolt).every((a) => a === null), 'dust before it strikes');
  assert.ok(dust.at.some((a) => a !== null && a.shown > 0.5), 'no dust as it strikes');
  assert.ok(dust.at[dust.at.length - 1] === null, 'the dust still there at the end');
  // (big as it lands: more of it, the dust and the screen flat, than before)
  const peak = Math.max(...m.frames.slice(jolt).map(count));
  assert.ok(peak > 1.3 * count(m.frames[0]), `as it lands ${peak} pixels; before, ${count(m.frames[0])}`);
});

test('floor 14, the screen: nothing in a friend\'s cyan or the enemy\'s pink and gold (it is the wards\' linen and iron, and the boards\' dust)', () => {
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
