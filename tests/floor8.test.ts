// FLOOR 8, ECHO CANYON: ITS PIECES (src/art/floor8.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees them, as floor 7's are:
//   Pixels 1 (crisp: every pixel all there or not at all, no loose single pixels), Colour 3 (nothing of a place
//   glows, nor is cyan or pink or red: the canyon's rock is red-orange, its hue kept off the pinks), Colour 4
//   (duller than the nine words), Places 4 (what stands stands on its foot), and what the game needs: a floor
//   tile's pieces inside its diamond.
//   run: tsx --test tests/floor8.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { canyonPieces } from '../src/art/floor8';
import { WORD_COLOR } from '../src/art/icons';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hsv, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const pieces = canyonPieces();
const rgbOf = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

test('nothing of the game imports them', () => {
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('floor8.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/floor8['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports floor 8's pieces`);
  }
});

test('every piece has its pictures, each its own name, and none gives light', () => {
  assert.ok(new Set(pieces.map((p) => p.name)).size === pieces.length, 'each its own name');
  for (const p of pieces) {
    const all = sprites(p);
    assert.ok(all.length > 0, `${p.name} has pictures`);
    for (const s of all) {
      assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
      assert.ok(!s.lights || s.lights.length === 0, `${p.name} gives no light`);
    }
  }
});

function crisp(name: string, all: Sprite[]): void {
  let soft = 0;
  let loose = 0;
  for (const s of all) {
    each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
    const q = paintingOf(s);
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
      if (n === 0) loose++;
    }
  }
  assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
  assert.ok(loose <= 2 * all.length, `${name}: ${loose} loose pixels`);
}

test('Pixels 1: crisp, every pixel all there or not at all, and no loose single pixels', () => {
  for (const p of pieces) crisp(p.name, sprites(p));
});

test('Colour 3 and 4: no cyan, no pink or red, and duller than every one of the nine words', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgbOf((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const p of pieces) {
    let most = 0;
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        const [h, sat, val] = hsv(r, g, b);
        if (val < 0.2) return; // the indigo seam and the deepest shade: too dark to show a colour
        most = Math.max(most, sat);
        if (sat > 0.25) {
          assert.ok(!(h > 165 && h < 205), `${p.name}: cyan ${r},${g},${b}`);
          assert.ok(!(h > 300 || h < 10), `${p.name}: pink or red ${r},${g},${b}`);
        }
      });
    }
    assert.ok(most < dullest, `${p.name}: its most saturated ${most.toFixed(2)} against the dullest word ${dullest.toFixed(2)}`);
  }
});

test('Places 4: what stands stands on its foot (nothing of it far below its anchor); a floor tile\'s inside its diamond', () => {
  for (const p of pieces) {
    for (const s of p.frames ?? []) {
      const [ax, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      if (p.kind === 'floor tile' || p.kind === 'trap') {
        each(s, (_r, _g, _b, _a, x, y) => {
          const hw = 2 * Math.min(y + 0.5, 32 - (y + 0.5));
          assert.ok(Math.abs(x + 0.5 - ax) <= hw + 0.5, `${p.name}: (${x}, ${y}) outside its diamond`);
        });
      } else assert.ok(lowest - ay <= 60, `${p.name}: ${lowest - ay} picture pixels below its anchor`);
    }
  }
});

test('nothing of a piece is cut off at its picture\'s edge', () => {
  for (const p of pieces) {
    for (const s of sprites(p)) {
      const q = paintingOf(s);
      let edge = 0;
      for (let x = 0; x < q.w; x++) for (const y of [0, q.h - 1]) if (q.has(x, y)) edge++;
      for (let y = 0; y < q.h; y++) for (const x of [0, q.w - 1]) if (q.has(x, y)) edge++;
      assert.ok(edge === 0, `${p.name}: ${edge} pixels on its picture's edge`);
    }
  }
});
