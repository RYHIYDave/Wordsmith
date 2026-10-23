// FLOORS 6 TO 10, THEIR WAYS ON AND WHERE EACH NEXT FLOOR BEGINS (src/art/act1_ways.ts, the ways' kit src/art/ways_kit.ts;
// the art chat's, a mock-up nothing of the game imports; docs/mockups/ways/README.md):
//   1. the switch off, and nothing of the game imports either file;
//   2. the ways round: a way leads from the boss's ground on toward where it is, to the nearest of the four; its own frame
//      turned and back again is itself;
//   3. EACH WAY ON: shut, its film and open painted; the film's frames all there, its jolts in it; it changes (the film's
//      first frame and last differ, the last is the way open); nothing of the friend's cyan; the enemy's pink only in the
//      sick roots' veins (floor 9);
//   4. WHERE EACH FLOOR BEGINS: painted, all four ways round; nothing cyan or pink; stood back from the start, so that
//      the tile he arrives on and the ring round it are clear.
//   run: tsx --test tests/ways_a1.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { A1_WAYS, canyonStart, canyonWay, fenStart, fenWay, ledgeStart, ledgeWay, pinewoodStart, pinewoodWay, quarryStart, quarryWay } from '../src/art/act1_ways';
import { WAY_DIRS, turnOf, unturnOf, wayDirOf } from '../src/art/ways_kit';
import type { StartArt, WayArt, WayDir } from '../src/art/ways_kit';
import type { Sprite } from '../src/engine/px';
import { count, each, hsv } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const cyan = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 175 && h <= 200 && s > 0.55 && v > 0.6;
};
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

test('1. the switch off, and nothing of the game imports either file', () => {
  assert.equal(A1_WAYS.on, false, 'A1_WAYS is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: unknown) => String(x).replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/(act1_ways|act2_ways|ways_kit)\.ts$/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of (fs.readFileSync(path.join('src', f), 'utf8') as string).matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (/^art\/(act1_ways|ways_kit)$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal(users.join(' '), '', 'game files that import them');
});

test('2. the ways round: on toward the way from the boss, the nearest of the four; turned and back is itself', () => {
  assert.equal(wayDirOf(5, 1), 'x+');
  assert.equal(wayDirOf(-5, 2), 'x-');
  assert.equal(wayDirOf(1, 6), 'y+');
  assert.equal(wayDirOf(-2, -8), 'y-');
  for (const d of WAY_DIRS) {
    const T = turnOf(d);
    const U = unturnOf(d);
    for (const [a, b] of [[10, 0], [0, 7], [-3, 5]] as const) {
      const w = T(a, b, 0);
      const back = U(w[0], w[1]);
      assert.ok(Math.abs(back[0] - a) < 1e-9 && Math.abs(back[1] - b) < 1e-9, `${d}: (${a}, ${b}) turned and back`);
    }
  }
});

const WAYS: [string, (d: WayDir) => WayArt, boolean][] = [
  ['floor 6, the cut', quarryWay, false],
  ['floor 7, the chimney', ledgeWay, false],
  ['floor 8, the slot', canyonWay, false],
  ['floor 9, the twisted way', pinewoodWay, true],
  ['floor 10, the causeway', fenWay, false],
];
test('3. each way on: shut, its film and open; it changes; nothing cyan; pink only in the sick roots', () => {
  WAYS.forEach(([name, make, veins], k) => {
    const d = WAY_DIRS[k % 4];
    const art = make(d);
    const N = art.film.frames.length;
    assert.ok(N >= 90, `${name}: its film (${N} frames)`);
    art.film.frames.forEach((s, i) => assert.ok(count(s) > 300, `${name}: frame ${i} painted`));
    for (const j of art.film.jolts) assert.ok(j >= 0 && j < N, `${name}: jolt ${j} in it`);
    assert.ok(art.film.jolts.length >= 1 && art.film.jolts.length === art.film.kicks.length, `${name}: its jolts and how hard`);
    const shutAll = count(art.shut.under) + count(art.shut.over);
    const openAll = count(art.open.under) + count(art.open.over);
    assert.ok(shutAll > 500 && openAll > 500, `${name}: shut and open painted`);
    assert.ok(unlike(art.film.frames[0], art.film.frames[N - 1]) > 1500, `${name}: it changes`);
    for (const s of [art.shut.under, art.shut.over, art.open.under, art.open.over, ...art.film.frames.filter((_, i) => i % 6 === 0)]) {
      assert.equal(how(s, cyan), 0, `${name}: nothing cyan`);
      if (!veins) assert.equal(how(s, pink), 0, `${name}: nothing pink`);
    }
    if (veins) assert.ok(how(art.shut.over, pink) > 0 && how(art.open.over, pink) === 0, `${name}: the roots' veins the enemy's pink while they live, gone once they are`);
  });
});

const STARTS: [string, (d: WayDir) => StartArt][] = [
  ['floor 6, the quarry gate', quarryStart],
  ['floor 7, the stair down the spur', ledgeStart],
  ['floor 8, the plank stair down the pillar', canyonStart],
  ['floor 9, the cleft', pinewoodStart],
  ['floor 10, out of the twisted wood', fenStart],
];
test('4. where each floor begins: painted, all four ways round; nothing cyan or pink; stood back from the start', () => {
  for (const [name, make] of STARTS) {
    for (const d of WAY_DIRS) {
      const s = make(d);
      assert.ok(count(s.over) > 800, `${name} (${d}): painted`);
      assert.equal(how(s.over, cyan) + how(s.over, pink), 0, `${name} (${d}): nothing cyan or pink`);
      assert.ok((s.back ?? 0) >= 1.5, `${name} (${d}): stood back at least a tile and a half`);
    }
  }
});
