// FLOOR 6, THE QUARRY: ITS PIECES (src/art/floor6.ts; a mock-up nothing of the game imports), held to his
// art rulebook before he sees them:
//   Pixels 1 (crisp: every pixel all there or not at all, no loose single pixels), Colour 3 (nothing of a
//   place glows cyan or pink: no lights at all here, and no cyan or pink in them), Colour 4 (duller than
//   the nine words), Pixels 4 (light from the upper left: a block's side to the lower left lighter than
//   its side to the lower right), Places 4 (what stands stands on its foot: nothing hangs far below it),
//   and what the game needs: a floor tile's pieces inside its diamond.
//   run: tsx --test tests/floor6.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CULT_FIRE } from '../src/art/act1_cult';
import { quarryPieces } from '../src/art/floor6';
import { WORD_COLOR } from '../src/art/icons';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hsv, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void };
paintWithoutCanvas();

const pieces = quarryPieces();
/** What burns with the cult's fire (his Colour 3: pink burning to gold is the enemy's): its braziers, and its mark on the redoubt's sealed door. Nothing else glows. */
const BURNS = new Set(["the cult's brazier", "the redoubt's gatehouse"]);
const FIRE = new Set(CULT_FIRE.map((c) => c.toLowerCase()));
const hexOf = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const rgbOf = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

test('every piece has its pictures, each its own name, and none gives light but the cult\'s fire, in its own pink', () => {
  assert.ok(new Set(pieces.map((p) => p.name)).size === pieces.length, 'each its own name');
  for (const p of pieces) {
    const all = sprites(p);
    assert.ok(all.length > 0, `${p.name} has pictures`);
    for (const s of all) {
      assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
      if (!BURNS.has(p.name)) assert.ok(!s.lights || s.lights.length === 0, `${p.name} gives no light`);
      for (const L of s.lights ?? []) assert.ok(FIRE.has(L.color.toLowerCase()), `${p.name}: its light ${L.color} is the cult's fire`);
    }
  }
});

test('Pixels 1: crisp, every pixel all there or not at all, and no loose single pixels', () => {
  for (const p of pieces) {
    let soft = 0;
    let loose = 0;
    for (const s of sprites(p)) {
      each(s, (_r, _g, _b, a) => (soft += a === 255 ? 0 : 1));
      const q = paintingOf(s);
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
        if (!q.has(x, y)) continue;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
        if (n === 0) loose++;
      }
    }
    assert.ok(soft === 0, `${p.name}: ${soft} soft pixels`);
    assert.ok(loose <= 2 * sprites(p).length, `${p.name}: ${loose} loose pixels`);
  }
});

test('Colour 3 and 4: no cyan, no pink, and duller than every one of the nine words', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgbOf((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const p of pieces) {
    let most = 0;
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        const [h, sat, val] = hsv(r, g, b);
        if (val < 0.2) return; // the indigo seam and the deepest shade: too dark to show a colour
        if (BURNS.has(p.name) && FIRE.has(hexOf(r, g, b))) return; // the cult's fire, burning
        most = Math.max(most, sat);
        if (sat > 0.25) {
          assert.ok(!(h > 165 && h < 205), `${p.name}: cyan ${r},${g},${b}`);
          assert.ok(!(h > 300 || h < 10), `${p.name}: pink ${r},${g},${b}`);
        }
      });
    }
    assert.ok(most < dullest, `${p.name}: its most saturated ${most.toFixed(2)} against the dullest word ${dullest.toFixed(2)}`);
  }
});

/** The mean lightness of a piece's pixels left and right of its anchor, in its lower half (its sides, not its top). */
function sides(s: Sprite): [number, number] {
  const [ax, ay] = anchor(s);
  let l = 0;
  let ln = 0;
  let r = 0;
  let rn = 0;
  each(s, (R, G, B, _a, x, y) => {
    if (y < ay - 22 || y > ay + 12) return;
    const v = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    if (x < ax - 2) {
      l += v;
      ln++;
    } else if (x > ax + 2) {
      r += v;
      rn++;
    }
  });
  return [l / Math.max(1, ln), r / Math.max(1, rn)];
}

test('Pixels 4: light from the upper left: a block\'s side to the lower left lighter than its side to the lower right', () => {
  for (const name of ['cut block', 'block split from the bed', 'stacked blocks']) {
    const s = pieces.find((p) => p.name === name)!.frames![0];
    const [l, r] = sides(s);
    assert.ok(l > r + 10, `${name}: left ${l.toFixed(0)}, right ${r.toFixed(0)}`);
  }
});

test('Places 4: what stands stands on its foot (nothing of it far below its anchor); a floor tile\'s inside its diamond', () => {
  for (const p of pieces) {
    for (const s of p.frames ?? []) {
      const [ax, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      if (p.kind === 'floor tile') {
        each(s, (_r, _g, _b, _a, x, y) => {
          const hw = 2 * Math.min(y + 0.5, 32 - (y + 0.5));
          assert.ok(Math.abs(x + 0.5 - ax) <= hw + 0.5, `${p.name}: (${x}, ${y}) outside its diamond`);
        });
      } else {
        // its foot's diamond reaches at most a tile and three quarters toward the eye (the obelisk, lying along x)
        assert.ok(lowest - ay <= 60, `${p.name}: ${lowest - ay} picture pixels below its anchor`);
      }
    }
  }
});
