// THE HEADSMAN'S YARD, OUTDOORS, AT NIGHT (src/art/yard.ts; behind YARD, off; nothing of the game imports it), held to his
// art rulebook before it goes to the main chat: crisp (every pixel all there or not at all, a floor tile covering its
// whole diamond, no pixel standing alone); nothing cyan, nothing pink (Colour 3: the friend's and the enemy's glows); the
// floor and the wall darker than the darkest word (Colour 4); light from the upper left (Pixels 4: a wall's face turned to
// screen-left lighter than one turned to screen-right; what stands lit on its left); the torch's fire as bright in shade as
// in the light; every picture painted, and anchored where the game will lay it.
//   run: tsx --test tests/yard.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import { YARD, YARD_WALL, makeYardArt } from '../src/art/yard';
import type { Sprite } from '../src/engine/px';
import { WORD_COLOR } from '../src/art/icons';
import { EMBER } from '../src/art/props';
import { assert, count, each, hex, hsv, luma, mean, rgb, sprites, test } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

paintWithoutCanvas();
const Y = makeYardArt();
const floors: Sprite[] = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) floors.push(Y.floor(x, y));
const walls = [...Y.faceLeft, ...Y.faceRight, ...Y.arch];
const all: [string, Sprite][] = [
  ...floors.map((s, i) => [`cobbles ${i}`, s] as [string, Sprite]),
  ...Y.tiles.map((p) => [p.name, p.frames![0]] as [string, Sprite]),
  ...walls.map((s, i) => [`wall ${i}`, s] as [string, Sprite]),
  ['the tower', Y.tower],
  ['what is seen over the wall', Y.beyond],
  ...Y.pieces.flatMap((p) => sprites(p).map((s, i) => [`${p.name} ${i}`, s] as [string, Sprite])),
];

test('the yard: off, and nothing of the game imports it', () => {
  assert.ok(YARD.on === false, 'YARD is off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(`${join('src', 'dev')}`) && !p.endsWith(join('art', 'yard.ts')) && /from '\.\.?\/(art\/)?yard'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('the yard: every picture painted', () => {
  for (const [n, s] of all) assert.ok(count(s) > 20, `${n}: ${count(s)} pixels`);
  assert.ok(Y.tiles.length >= 7 && Y.pieces.length >= 3, `${Y.tiles.length} tiles, ${Y.pieces.length} pieces`);
});

test('the yard, Pixels 1: crisp, every pixel all there or not at all; a floor tile covers its whole diamond', () => {
  for (const [n, s] of all) {
    let soft = 0;
    each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
  }
  for (const s of [...floors, ...Y.tiles.map((p) => p.frames![0])]) {
    const q = paintingOf(s);
    const ax = Math.round(s.ax * (s.density ?? 1));
    const ay = Math.round(s.ay * (s.density ?? 1));
    const holes: string[] = [];
    for (let y = 2; y <= 29; y++) {
      const hw = 2 * Math.min(y, 32 - y);
      for (let x = -hw + 3; x <= hw - 4; x++) if (!q.get(ax + x, ay + y)) holes.push(`(${x}, ${y})`);
    }
    assert.ok(holes.length === 0, `${holes.length} holes in a floor tile: ${holes.slice(0, 6).join(' ')}`);
  }
});

test('the yard, Pixels 1: no loose single pixels standing alone (but a glint, a star)', () => {
  for (const [n, s] of all) {
    const q = paintingOf(s);
    let loose = 0;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) k++;
      if (k === 0) loose++;
    }
    assert.ok(loose <= 2, `${n}: ${loose} loose pixels`);
  }
});

test('the yard, Colour 3: nothing cyan, nothing pink (the friend\'s and the enemy\'s glows)', () => {
  for (const [n, s] of all) {
    let cyan = 0;
    let pink = 0;
    each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 168 && h <= 200 && sa > 0.45 && v > 0.5) cyan++;
      if (h >= 300 && h <= 352 && sa > 0.45 && v > 0.55) pink++;
    });
    assert.ok(cyan === 0 && pink === 0, `${n}: ${cyan} cyan, ${pink} pink`);
  }
});

test('the yard, Colour 4: its floor and its wall darker than the darkest word (at the 99th of their pixels; fire, a lit window and the moon are light)', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  for (const [n, s] of all.filter(([n]) => n.startsWith('cobbles') || n.startsWith('wall') || Y.tiles.some((p) => p.name === n) || n === 'the tower')) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      if (EMBER.includes(hex(r, g, b))) return;
      h[Math.round(luma(r, g, b))]++;
    });
    const total = h.reduce((t, k) => t + k, 0);
    let seen = 0;
    let p99 = 255;
    for (let l = 0; l < 256; l++) {
      seen += h[l];
      if (seen >= total * 0.99) {
        p99 = l;
        break;
      }
    }
    if (p99 >= darkest) bad.push(`${n} ${p99}`);
  }
  assert.ok(bad.length === 0, `brighter than the darkest word (${darkest.toFixed(0)}): ${bad.join(', ')}`);
});

test('the yard, Pixels 4: light from the upper left: the wall turned to screen-left lighter than the one turned to screen-right; what stands lit on its left', () => {
  const ml = Y.faceLeft.reduce((t, s) => t + mean(s), 0) / Y.faceLeft.length;
  const mr = Y.faceRight.reduce((t, s) => t + mean(s), 0) / Y.faceRight.length;
  assert.ok(ml > mr + 3, `turned left ${ml.toFixed(0)}, turned right ${mr.toFixed(0)}`);
  for (const p of Y.pieces.filter((q) => q.kind === 'obstacle')) {
    const s = p.frames![0];
    const px: [number, number][] = [];
    each(s, (r, g, b, _a, x) => px.push([x, luma(r, g, b)]));
    const cx = px.reduce((t, q) => t + q[0], 0) / px.length;
    const side = (f: (x: number) => boolean): number => {
      const q = px.filter(([x]) => f(x));
      return q.reduce((t, [, l]) => t + l, 0) / Math.max(1, q.length);
    };
    assert.ok(side((x) => x < cx - 1) > side((x) => x > cx + 1), `${p.name}: lit on its right`);
  }
});

test("the yard's torch: four frames, its fire as bright in shade as in the light, its light given; set high on the wall", () => {
  const t = Y.pieces.find((p) => p.name === "the yard's torch")!;
  assert.ok(t.left!.length === 4 && t.right!.length === 4, 'four frames each way');
  const fire = (s: Sprite): number => {
    let n = 0;
    each(s, (r, g, b) => (n += EMBER.includes(hex(r, g, b)) ? 1 : 0));
    return n;
  };
  for (let f = 0; f < 4; f++) {
    assert.ok(fire(t.left![f]) > 30 && fire(t.right![f]) >= fire(t.left![f]) * 0.9, `frame ${f}: fire ${fire(t.left![f])} lit, ${fire(t.right![f])} in shade`);
    assert.ok((t.left![f].lights ?? []).length === 1 && (t.right![f].lights ?? []).length === 1, `frame ${f}: its light`);
    // (its fire well up the wall: above half its height)
    const s = t.left![f];
    let top = Infinity;
    each(s, (r, g, b, _a, _x, y) => {
      if (EMBER.includes(hex(r, g, b))) top = Math.min(top, y);
    });
    const up = s.ay * (s.density ?? 1) - top;
    assert.ok(up > YARD_WALL / 2, `frame ${f}: its fire ${up} up the wall`);
  }
});

test('the yard: anchored where the game lays it (a wall tile at its top corner\'s floor point, its face hanging to the floor; a floor tile at its top corner)', () => {
  for (const s of walls) {
    const q = paintingOf(s);
    const ay = Math.round(s.ay * (s.density ?? 1));
    // (the face reaches down to the floor line of the tile's near edges: the tile's bottom corner, 32 below its top corner)
    let low = -1;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.has(x, y)) low = Math.max(low, y);
    assert.ok(low >= ay + 28 && low <= ay + 33, `a wall tile's foot ${low - ay} below its anchor`);
  }
  for (const s of floors) assert.ok(Math.round(s.ay * (s.density ?? 1)) === 0 && Math.round(s.ax * (s.density ?? 1)) === 32, 'a floor tile at its top corner');
});
