// FLOORS 6 TO 10, THE CULT'S CAMP: the set's twenty camp pieces (src/art/act1_camp.ts; a mock-up nothing
// of the game imports), held to his art rulebook before he sees them:
//   Pixels 1 (crisp: every pixel all there or not at all, no loose single pixels), Colour 3 (pink burning
//   to gold is the enemy's: only the cult's fires give light, in its own fire's colours, and nothing else
//   of the camp is cyan or pink), Colour 4 (duller than the nine words), Places 4 (what stands stands on
//   its foot), and what the game needs: each its own name; a breakable whole and broken; a tile's
//   pictures inside its diamond.
//   run: tsx --test tests/act1_camp.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CAMP_BURNS, campPieces } from '../src/art/act1_camp';
import { CULT_FIRE } from '../src/art/act1_cult';
import { quarryPieces } from '../src/art/floor6';
import { redoubtPieces } from '../src/art/redoubt';
import { WORD_COLOR } from '../src/art/icons';
import { anchor, count, each, hsv, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void };
paintWithoutCanvas();

const pieces = campPieces();
const BURNS = new Set(CAMP_BURNS);
const FIRE = new Set(CULT_FIRE.map((c) => c.toLowerCase()));
const hexOf = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const rgbOf = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

test('twenty pieces, each its own name (none the same as a Quarry or redoubt piece), with their pictures', () => {
  assert.ok(pieces.length === 20, `${pieces.length} pieces`);
  const names = new Set(pieces.map((p) => p.name));
  assert.ok(names.size === pieces.length, 'each its own name');
  for (const q of [...quarryPieces(), ...redoubtPieces()]) assert.ok(!names.has(q.name), `${q.name} is already a piece`);
  for (const p of pieces) {
    for (const s of sprites(p)) assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
    if (p.kind === 'breakable') assert.ok(p.frames!.length === 2, `${p.name}: whole and broken`);
  }
});

test('Colour 3: only the cult\'s fires give light, and only in its own fire\'s colours', () => {
  for (const p of pieces) {
    for (const s of sprites(p)) {
      if (!BURNS.has(p.name)) assert.ok(!s.lights || s.lights.length === 0, `${p.name} gives no light`);
      for (const L of s.lights ?? []) assert.ok(FIRE.has(L.color.toLowerCase()), `${p.name}: its light ${L.color} is the cult's fire`);
    }
  }
  for (const name of ["the cult's watchfire", "the cult's cauldron"]) {
    for (const s of pieces.find((p) => p.name === name)!.frames!) assert.ok((s.lights ?? []).length > 0, `${name} burns, and lights what is round it`);
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

test('Colour 3 and 4: no cyan, no pink but the cult\'s fire, and duller than every one of the nine words', () => {
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

test('Places 4: what stands stands on its foot (nothing of it far below its anchor); a tile\'s inside its diamond', () => {
  for (const p of pieces) {
    (p.frames ?? []).forEach((s, i) => {
      const [ax, ay] = anchor(s);
      const tile = p.kind === 'floor tile' || (p.kind === 'trap' && i < 2);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, x, y) => {
        lowest = Math.max(lowest, y);
        if (tile) {
          const hw = 2 * Math.min(y + 0.5, 32 - (y + 0.5));
          assert.ok(Math.abs(x + 0.5 - ax) <= hw + 0.5, `${p.name} ${i}: (${x}, ${y}) outside its diamond`);
        }
      });
      if (!tile) assert.ok(lowest - ay <= 60, `${p.name} ${i}: ${lowest - ay} picture pixels below its anchor`);
    });
  }
});

test('the cult\'s mark is on its tents, its pavilion and its crates, painted bone-pale (no letters anywhere: only the skull)', () => {
  // the bone-pale paint of the mark shows on each
  const PAINTED = ["the cult's tent", "the cult's pavilion", 'supply crates'];
  for (const name of PAINTED) {
    const s = pieces.find((p) => p.name === name)!.frames![0];
    let paint = 0;
    each(s, (r, g, b) => (paint += hexOf(r, g, b) === '#d9d2c4' ? 1 : 0));
    assert.ok(paint > 12, `${name}: ${paint} pixels of the mark's paint`);
  }
});
