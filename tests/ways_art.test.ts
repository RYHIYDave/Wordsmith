// (Named ways_art.test.ts by the main chat, 22 Oct 2026: as tests/ways.test.ts on mockup/ways it took the place of the game's own
// tests of the ways through the Crypt, which keep that name.)
// THE WAYS BETWEEN THE FLOORS, THE ART CHAT'S (a mock-up nothing of the game imports; docs/mockups/ways/README.md):
// floor 4's skull wall giving way to the cave and floor 5's mouth (src/art/cave4.ts, behind CAVE4, off); the town's
// stairs down, the shaft's head and the cage coming up into it, the gate barred and unbarred, and floor 1's stairs up
// (src/art/town_ways.ts, behind TOWN_WAYS, off).
//   1. both switches off, and nothing of the game imports either file;
//   2. THE CAVE: the film both ways round, every frame painted, its jolts in it, its last frame the cave as it
//      stands, the wall before it the floor's own wall; nothing of the friend's cyan;
//   3. FLOOR 5'S MOUTH: both ways round, its two layers the whole, nothing cyan;
//   4. THE TOWN'S STAIRS, THE SHAFT'S HEAD AND FLOOR 1'S STAIRS UP: painted both ways, nothing of the enemy's pink
//      or gold glow and nothing cyan on them (they are nobody's);
//   5. THE CAGE COMES UP: its frames, its floor rising from out of sight to the hall's and staying there, the
//      rider cut where he is under the hall's floor and whole once up;
//   6. THE GATE: barred, its seal the enemy's pink (the cult's); its unbarring's frames, the seal gone before the
//      end; what is left nothing pink.
//   run: tsx --test tests/ways_art.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { CRYPT_FLOORS } from '../src/art/crypt';
import { CAVE4, CAVE_FRAMES, caveFilm, lairMouth } from '../src/art/cave4';
import { ARRIVE, TOWN_WAYS, UNBAR, floorStairsUp, gateBars, gateLeft, riderUnder, townArrives, townShaft, townStairs, unbarFilm } from '../src/art/town_ways';
import type { Sprite } from '../src/engine/px';
import { count, each, hsv } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;

/** The friend's cyan, bright: hue 175 to 200, strong. */
const cyan = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 175 && h <= 200 && s > 0.55 && v > 0.6;
};
/** The enemy's pink, bright: hue 320 to 350, strong. */
const pink = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 320 && h <= 350 && s > 0.5 && v > 0.55;
};
const how = (s: Sprite, f: (r: number, g: number, b: number) => boolean): number => {
  let n = 0;
  each(s, (r, g, b, a) => {
    if (a > 0 && f(r, g, b)) n++;
  });
  return n;
};
const lightsOf = (s: Sprite, f: (r: number, g: number, b: number) => boolean): number =>
  (s.lights ?? []).filter((l) => f(parseInt(l.color.slice(1, 3), 16), parseInt(l.color.slice(3, 5), 16), parseInt(l.color.slice(5, 7), 16))).length;

// (TOLD, the main chat, 22 Oct 2026: both switches on, his yes to each in the art chat; the game draws them only behind EXITS,
// game/ways.ts. The game's files that use them: the films' list, the floor's dress, the renderer.)
test('1. both switches on (his yes); only the films, the dress and the renderer use them, behind EXITS', () => {
  assert.equal(CAVE4.on, true, 'CAVE4 is on');
  assert.equal(TOWN_WAYS.on, true, 'TOWN_WAYS is on');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: unknown) => String(x).replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/(cave4|town_ways)\.ts$/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of (fs.readFileSync(path.join('src', f), 'utf8') as string).matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (/^art\/(cave4|town_ways)$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].sort().join(' '), 'art/films.ts render/dress.ts', 'game files that import them');
});

test('2. THE CAVE: the film both ways round, every frame painted, its jolts in it, its last frame the cave as it stands; nothing cyan', () => {
  for (const alongX of [true, false]) {
    const f = caveFilm(alongX);
    const side = alongX ? 'along x' : 'along y';
    assert.equal(f.frames.length, CAVE_FRAMES, `${side}: its frames`);
    f.frames.forEach((s, k) => assert.ok(count(s) > 500, `${side}: frame ${k} painted`));
    for (const j of f.jolts) assert.ok(j > 0 && j < CAVE_FRAMES, `${side}: jolt ${j} in the film`);
    assert.ok(f.jolts.length >= 3, `${side}: blows felt`);
    assert.ok(unlike(f.frames[CAVE_FRAMES - 1], f.after) < 20, `${side}: the last frame is the cave as it stands`);
    assert.ok(unlike(f.frames[0], f.before) < 20, `${side}: the first frame is the wall standing`);
    assert.ok(unlike(f.frames[0], f.after) > 2000, `${side}: the wall and the cave differ`);
    for (const s of [...f.frames, f.before, f.after, f.under, f.over]) assert.equal(how(s, cyan), 0, `${side}: nothing cyan`);
    assert.ok(count(f.under) > 500 && count(f.over) > 100, `${side}: both layers painted`);
  }
});

test("3. FLOOR 5'S MOUTH: both ways round, its two layers the whole, nothing cyan", () => {
  for (const alongX of [true, false]) {
    const m = lairMouth(alongX);
    assert.ok(count(m.under) > 500 && count(m.over) > 100, 'both layers painted');
    assert.ok(count(m.whole) >= Math.max(count(m.under), count(m.over)), 'the whole is at least either layer');
    for (const s of [m.under, m.over, m.whole]) assert.equal(how(s, cyan), 0, 'nothing cyan');
  }
});

test("4. THE TOWN'S STAIRS, THE SHAFT'S HEAD AND FLOOR 1'S STAIRS UP: painted both ways, nothing of the enemy's pink and nothing cyan", () => {
  const pieces: [string, Sprite][] = [
    ['the stairs down, along x', townStairs('x')],
    ['the stairs down, along y', townStairs('y')],
    ["the shaft's head, back", townShaft().back],
    ["the shaft's head, front", townShaft().front],
    ["floor 1's stairs up, along x", floorStairsUp(CRYPT_FLOORS[0], true)],
    ["floor 1's stairs up, along y", floorStairsUp(CRYPT_FLOORS[0], false)],
  ];
  for (const [name, s] of pieces) {
    assert.ok(count(s) > 300, `${name}: painted`);
    assert.equal(how(s, pink), 0, `${name}: nothing pink`);
    assert.equal(how(s, cyan), 0, `${name}: nothing cyan`);
    assert.equal(lightsOf(s, pink) + lightsOf(s, cyan), 0, `${name}: no pink or cyan light`);
  }
});

test('5. THE CAGE COMES UP: its frames; its floor rising from out of sight to the hall\'s and staying there; the rider cut under the floor, whole once up', () => {
  const f = townArrives();
  assert.equal(f.back.length, ARRIVE.frames);
  assert.equal(f.front.length, ARRIVE.frames);
  assert.equal(f.lift.length, ARRIVE.frames);
  assert.ok(f.lift[0] < -40, 'it starts deep in the shaft');
  for (let k = ARRIVE.settle; k < ARRIVE.frames; k++) assert.equal(f.lift[k], 0, `frame ${k}: at the hall's floor`);
  assert.ok(Math.max(...f.lift) <= 4, 'never far over the floor');
  for (const j of f.jolts) assert.ok(j > 0 && j < ARRIVE.frames, `jolt ${j} in the film`);
  assert.equal(riderUnder(0, 0), false, 'up: his feet are drawn');
  assert.equal(riderUnder(0, 0.9), false, 'up: his head is drawn');
  assert.equal(riderUnder(-20, 0), true, 'under the floor: his feet are not');
  for (const s of [...f.back, ...f.front]) assert.equal(how(s, pink) + how(s, cyan), 0, 'nothing pink or cyan');
});

test('6. THE GATE: barred, its seal the enemy\'s pink; its unbarring, the seal gone before the end; what is left nothing pink', () => {
  for (const alongX of [true, false]) {
    const bars = gateBars(alongX);
    assert.ok(bars.length > 0, 'the bars, as strips');
    const barred = bars.reduce((n, q) => n + how(q.s, pink) + lightsOf(q.s, pink), 0);
    assert.ok(barred > 0, "the seal burns the enemy's pink");
    const film = unbarFilm(alongX);
    assert.equal(film.frames.length, UNBAR.frames);
    const last = film.frames[UNBAR.frames - 1];
    assert.equal(last.reduce((n, q) => n + how(q.s, pink) + lightsOf(q.s, pink), 0), 0, 'the seal gone by the end');
    const left = gateLeft(alongX);
    assert.equal(left.reduce((n, q) => n + how(q.s, pink) + lightsOf(q.s, pink), 0), 0, 'what is left: nothing pink');
    for (const fr of film.frames) for (const q of fr) assert.equal(how(q.s, cyan), 0, 'nothing cyan');
  }
});
