// FLOORS 11 TO 15, THEIR WAYS ON AND WHERE EACH NEXT FLOOR BEGINS (src/art/act2_ways.ts, with the kit src/art/ways_kit.ts;
// the art chat's, a mock-up nothing of the game imports; docs/mockups/ways/README.md):
//   1. the switch off, and nothing of the game imports the file;
//   2. EACH WAY ON: shut, its film and open painted; the film's frames all there, its jolts in it; it changes; nothing of
//      the friend's cyan; the enemy's pink only where the Order's seal burns (the grate's, shut; the Censor's bars) and
//      gone once open; every colour as quiet as Act 2's places (no richer than act2_quiet.ts's QUIET_MOST, but what glows);
//   3. THE WAYS IN A BACK WALL (floors 12, 14, 15): the wall's face painted as the floor's own ground paints it, its
//      pattern running on with where it stands;
//   4. WHERE EACH FLOOR BEGINS: painted, all four ways round; nothing cyan or pink; stood back at least a tile and a half.
//   run: tsx --test tests/ways_a2.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { A2_WAYS, gateWardStart, gateWardWay, houseOfQuietStart, houseOfQuietWay, libraryStart, libraryWay, millraceStart, millraceWay, undercityStart, undercityWay } from '../src/art/act2_ways';
import { BRIGHT, QUIET_MOST } from '../src/art/act2_quiet';
import { WAY_DIRS } from '../src/art/ways_kit';
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
const hex2 = (v: number): string => v.toString(16).padStart(2, '0');
const loud = (r: number, g: number, b: number): boolean => {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  return M > 0 && (M - m) / M > QUIET_MOST + 0.02 && !BRIGHT.has('#' + hex2(r) + hex2(g) + hex2(b));
};
const how = (s: Sprite, f: (r: number, g: number, b: number) => boolean): number => {
  let n = 0;
  each(s, (r, g, b, a) => {
    if (a > 0 && f(r, g, b)) n++;
  });
  return n;
};

test('1. the switch off, and nothing of the game imports the file', () => {
  assert.equal(A2_WAYS.on, false, 'A2_WAYS is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: unknown) => String(x).replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/act2_ways.ts') continue;
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of (fs.readFileSync(path.join('src', f), 'utf8') as string).matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (parts.join('/') === 'art/act2_ways') users.push(f);
    }
  }
  assert.equal(users.join(' '), '', 'game files that import it');
});

/** Each way: its name, its maker leading `d`, the way it is seen best (a back wall's: x- or y-), and whether the enemy's pink burns on it shut. */
const WAYS: [string, (d: WayDir) => WayArt, WayDir, boolean][] = [
  ['floor 11, the grate', gateWardWay, 'x+', true],
  ['floor 12, the outfall', (d) => undercityWay(d), 'x-', false],
  ['floor 13, the postern', millraceWay, 'y+', false],
  ['floor 14, the stitched door', (d) => houseOfQuietWay(d), 'y-', false],
  ['floor 15, the great doors', (d) => libraryWay(d), 'x-', true],
];
test('2. each way on: shut, its film and open; it changes; nothing cyan; pink only in the seals, gone once open; quiet colours', () => {
  for (const [name, make, d, seal] of WAYS) {
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
      assert.equal(how(s, loud), 0, `${name}: nothing richer than Act 2's places but what glows`);
    }
    const shutPink = how(art.shut.under, pink) + how(art.shut.over, pink);
    if (seal) assert.ok(shutPink > 0, `${name}: the Order's seal burning the enemy's pink, shut`);
    else assert.equal(shutPink, 0, `${name}: nothing pink`);
    assert.equal(how(art.open.under, pink) + how(art.open.over, pink), 0, `${name}: nothing pink once open`);
  }
});

test('3. a way in a back wall: its face as the floor\'s own wall, the pattern running on with where it stands', () => {
  for (const [name, make] of [['floor 12', undercityWay], ['floor 14', houseOfQuietWay], ['floor 15', libraryWay]] as const) {
    const a = make('y-', { x: 10, y: 4 });
    const b = make('y-', { x: 13, y: 4 });
    const c = make('y-', { x: 10, y: 4 });
    assert.ok(a === c, `${name}: the same place, the same picture (kept)`);
    assert.ok(unlike(a.shut.over, b.shut.over) > 200, `${name}: three tiles on, the wall's pattern runs on (a different stretch of it)`);
    assert.ok(count(a.shut.under) > 200 && count(a.shut.over) > 2000, `${name}: the opening (under) and the wall round it (over)`);
  }
});

const STARTS: [string, (d: WayDir) => StartArt][] = [
  ['floor 11, past the camp\'s barricade', gateWardStart],
  ['floor 12, the ladder\'s foot', undercityStart],
  ['floor 13, the outfall\'s mouth', millraceStart],
  ['floor 14, the infirmary\'s back door', (d) => houseOfQuietStart(d)],
  ['floor 15, the library\'s side door', (d) => libraryStart(d)],
];
test('4. where each floor begins: painted, all four ways round; nothing cyan or pink; stood back', () => {
  for (const [name, make] of STARTS) {
    for (const d of WAY_DIRS) {
      const s = make(d);
      assert.ok(count(s.over) > 800, `${name} (${d}): painted`);
      assert.equal(how(s.over, cyan) + how(s.over, pink) + how(s.under, cyan) + how(s.under, pink), 0, `${name} (${d}): nothing cyan or pink`);
      assert.ok((s.back ?? 0) >= 1.5, `${name} (${d}): stood back at least a tile and a half`);
    }
  }
});
