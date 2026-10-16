// FLOOR 10, THE SUNKEN FEN: ITS PIECES (src/art/floor10.ts; a mock-up nothing of the game imports), held to his art
// rulebook before he sees them, as the Pinewood's are:
//   Pixels 1 (crisp: every pixel all there or not at all, no loose single pixels), Colour 3 (nothing of a place
//   glows, nor is cyan or pink or red, but the cult's own fire on what is the cult's: its obelisk's runes, burning;
//   the sickness a dull violet), Colour 4 (duller than the nine words), Places 4 (what stands stands on its foot), and
//   what the game needs: a floor tile's pieces inside its diamond, and the boardwalk's halves laid together one walk.
//   run: tsx --test tests/floor10.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { CULT_FIRE } from '../src/art/act1_cult';
import { WALK_FORMS, fenPieces } from '../src/art/floor10';
import { WORD_COLOR } from '../src/art/icons';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hsv, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const pieces = fenPieces();
/** What burns with the cult's fire, and lights what is round it in its pink: the cult's own, at its work here. */
const BURNS = new Set(["the cult's obelisk"]);
const FIRE = new Set(CULT_FIRE.map((c) => c.toLowerCase()));
const hexOf = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const rgbOf = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

test('in the game only through its own (ACT 1: render/act1_pieces.ts); nothing else of the game imports it', () => {
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('floor10.ts')) continue;
    if (new Set(['render/act1_pieces.ts']).has(f.replace(/\\/g, '/'))) continue;
    assert.ok(!/from ['"][^'"]*\/floor10['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports floor 10's pieces`);
  }
});

test('every piece has its pictures, each its own name; only the cult\'s fire gives light, and its light is the cult\'s pink', () => {
  assert.ok(new Set(pieces.map((p) => p.name)).size === pieces.length, 'each its own name');
  for (const p of pieces) {
    const all = sprites(p);
    assert.ok(all.length > 0, `${p.name} has pictures`);
    for (const s of all) {
      assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
      if (!BURNS.has(p.name)) assert.ok(!s.lights || s.lights.length === 0, `${p.name} gives no light`);
      else assert.ok((s.lights ?? []).length > 0, `${p.name} lights what is round it`);
      for (const L of s.lights ?? []) assert.ok(FIRE.has(L.color.toLowerCase()), `${p.name}: its light ${L.color} is the cult's fire`);
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

test('Colour 3 and 4: no cyan, no pink or red but the cult\'s own fire, and duller than every one of the nine words', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgbOf((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const p of pieces) {
    let most = 0;
    let fire = 0;
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        if (BURNS.has(p.name) && FIRE.has(hexOf(r, g, b))) {
          fire++;
          return; // the cult's fire, burning
        }
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
    if (BURNS.has(p.name)) assert.ok(fire > 40, `${p.name}: its runes burn (${fire} pixels of the fire)`);
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

test('the boardwalk\'s halves laid together are one walk: its planks go on from one half into the next', () => {
  const walk = pieces.find((p) => p.name === 'the boardwalk');
  assert.ok(walk && walk.frames && walk.frames.length === WALK_FORMS.length, 'a picture for each way a tile of it lies');
  const half = (f: string): Sprite => walk!.frames![WALK_FORMS.indexOf(f as (typeof WALK_FORMS)[number])];
  // lay two halves as the game does, (dx, dy) picture pixels apart, and read the planks down each column (a way
  // across the screen) or along each row (a way up and down it), in the middle of the way
  const check = (a: Sprite, b: Sprite, dx: number, dy: number, flat: boolean): void => {
    const W = 64 + Math.abs(dx);
    const H = 34 + Math.abs(dy);
    const ox = dx < 0 ? -dx : 0;
    const grid: number[] = new Array(W * H).fill(0);
    for (const [s, x0, y0, id] of [[a, ox, 0, 1], [b, ox + dx, dy, 2]] as [Sprite, number, number, number][]) {
      const q = paintingOf(s);
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.has(x, y)) grid[(y + y0) * W + (x + x0)] = id;
    }
    // the way's middle: where both halves meet, the rows (columns) a third of the way in from each side
    let lines = 0;
    let broken = 0;
    for (let i = 0; i < (flat ? W : H); i++) {
      const seen = new Set<number>();
      const has = new Set<boolean>();
      for (let j = 0; j < (flat ? H : W); j++) {
        const [x, y] = flat ? [i, j] : [j, i];
        // (the band of the way's middle third: the way across the screen lies between the first half's middle and
        // its foot, 16 picture pixels; the way up and down it between the first half's left corner and its middle, 32)
        const inBand = flat ? y >= 22 && y <= 26 : x - ox >= 11 && x - ox <= 21;
        if (!inBand) continue;
        const id = grid[y * W + x];
        seen.add(id);
        has.add(id !== 0);
      }
      if (seen.has(1) && seen.has(2)) {
        lines++;
        if (has.size > 1) broken++;
      }
    }
    assert.ok(lines >= (flat ? 5 : 3), `${flat ? 'across' : 'up and down'} the screen: ${lines} planks that go from one half into the next`);
    assert.ok(broken <= 1, `${flat ? 'across' : 'up and down'} the screen: ${broken} of ${lines} planks broken where the halves meet`);
  };
  // across the screen: the lower half of a tile, the upper half of the tile one along x from it (half a tile right, a quarter down)
  check(half('lower'), half('upper'), 32, 16, true);
  // up and down it: the left half of a tile, the right half of the tile one along y from it (half a tile left, a quarter down)
  check(half('left'), half('right'), -32, 16, false);
});

test('his twenty-five: the floor\'s own pieces number 25 (his rule of 10 Oct: 25 for each boss)', () => {
  assert.equal(pieces.length, 25);
});
