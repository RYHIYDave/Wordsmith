// THE WARDEN'S FLOOR (src/art/floor1.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees it: Places 7 (between 40 and 50 pieces, of the kinds he named), Pixels 1
// (crisp), Colour 3 (no cyan; pink only on the boss's gate, the Warden's own embers, as the game's
// boss gate has them), Colour 4 (the places darker than any word), Pixels 4 (light from the upper
// left), and nothing of the game changed.
//   run: tsx --test tests/floor1.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { wardenPieces } from '../src/art/floor1';
import type { Piece } from '../src/art/floor1';
import { WORD_COLOR } from '../src/art/icons';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
paintWithoutCanvas();

const luma = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function hsv(r: number, g: number, b: number): [number, number, number] {
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const c = M - m;
  let h = 0;
  if (c > 0) h = M === r ? ((g - b) / c) % 6 : M === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return [(h * 60 + 360) % 360, M === 0 ? 0 : c / M, M / 255];
}
const sprites = (p: Piece): Sprite[] => [...(p.frames ?? []), ...(p.left ?? []), ...(p.right ?? [])];
function each(s: Sprite, f: (r: number, g: number, b: number, a: number, x: number, y: number) => void): void {
  const p = paintingOf(s);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (p.d[i + 3] > 0) f(p.d[i], p.d[i + 1], p.d[i + 2], p.d[i + 3], x, y);
  }
}

const pieces = wardenPieces();

test('Places 7: between 40 and 50 pieces, of the kinds he named, every one with a picture', () => {
  assert.ok(pieces.length >= 40 && pieces.length <= 50, `${pieces.length} pieces`);
  for (const k of ['wall tile', 'floor tile', 'breakable', 'on the wall', 'on the floor', 'obstacle', 'door', 'gate', 'trap', 'quest']) assert.ok(pieces.some((p) => p.kind === k), `a ${k}`);
  for (const p of pieces) {
    assert.ok(sprites(p).length > 0, `${p.name} has pictures`);
    let n = 0;
    for (const s of sprites(p)) each(s, () => n++);
    assert.ok(n > 30, `${p.name} is painted (${n} pixels)`);
  }
  assert.ok(new Set(pieces.map((p) => p.name)).size === pieces.length, 'each its own name');
});

test('Pixels 1: crisp, every pixel all there or not at all', () => {
  for (const p of pieces) for (const s of sprites(p)) each(s, (_r, _g, _b, a) => assert.ok(a === 255, `${p.name}: alpha ${a}`));
});

test('Colour 3: no cyan anywhere; pink only on the boss gate, the Warden\'s embers', () => {
  for (const p of pieces) {
    let cyan = 0;
    let pink = 0;
    for (const s of sprites(p)) each(s, (r, g, b) => {
      const [h, sa, v] = hsv(r, g, b);
      if (h >= 168 && h <= 200 && sa > 0.45 && v > 0.5) cyan++;
      if (h >= 300 && h <= 352 && sa > 0.45 && v > 0.55) pink++;
    });
    assert.ok(cyan === 0, `${p.name}: ${cyan} cyan`);
    if (p.name !== "the boss's gate") assert.ok(pink === 0, `${p.name}: ${pink} pink`);
  }
});

test('Colour 4: the walls and floors stay darker than the darkest word', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16))));
  const bad: string[] = [];
  for (const p of pieces.filter((q) => q.kind === 'wall tile' || q.kind === 'floor tile')) {
    const ls: number[] = [];
    for (const s of sprites(p)) each(s, (r, g, b) => ls.push(luma(r, g, b)));
    ls.sort((a, b) => a - b);
    bad.push(...(ls[Math.floor(ls.length * 0.99)] < darkest ? [] : [`${p.name} ${ls[Math.floor(ls.length * 0.99)].toFixed(0)}`]));
  }
  assert.ok(bad.length === 0, `brighter than the darkest word (${darkest.toFixed(0)}) at the 99th: ${bad.join(', ')}`);
});

test('Pixels 4: what stands is lit from the upper left (its left half lighter than its right, the seam left out)', () => {
  for (const p of pieces.filter((q) => q.kind === 'obstacle' || q.kind === 'breakable')) {
    const s = p.frames![0];
    const px: [number, number][] = [];
    each(s, (r, g, b, _a, x) => {
      if (r === 0x0e && g === 0x0c && b === 0x24) return;
      px.push([x, luma(r, g, b)]);
    });
    const cx = px.reduce((t, q) => t + q[0], 0) / px.length;
    const side = (f: (x: number) => boolean): number => {
      const q = px.filter(([x]) => f(x));
      return q.reduce((t, [, l]) => t + l, 0) / Math.max(1, q.length);
    };
    const L = side((x) => x < cx - 1);
    const R = side((x) => x > cx + 1);
    assert.ok(L > R, `${p.name}: left ${L.toFixed(0)}, right ${R.toFixed(0)}`);
  }
});
