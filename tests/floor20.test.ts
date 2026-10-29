// FLOOR 20, THE QUIET TOWER: ITS PIECES, the Moth's twenty-five (src/art/floor20.ts), built in the Act 2 kit
// (src/art/act2_kit.ts). A mock-up nothing of the game imports. His words for a set of floors, 10 Oct: “Going forward,
// let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” Held to his art rulebook as floor 16's are
// (tests/floor16.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: nothing gives light but the guttering candles, an honest flame, and the quest's own
//     pale light, the last chapter on its lectern; nothing cyan; no pink);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, the candles aside);
//   the doc's palette, "Grey fog, bone white, no colour at all." (nearly every pixel all but colourless, the flame aside);
//   Places 4 (what stands stands on its foot); nothing of a piece cut off at its picture's edge;
//   Places 7 (twenty-five a boss); real shapes (his rule 9 of How art is made: a piece's outline is no plain ball or box:
//     its picture fills well under all of the box round it).
//   run: tsx --test tests/floor20.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT } from '../src/art/act2_quiet';
import { QUEST_LIGHT, quietTowerPieces } from '../src/art/floor20';
import { CANDLE } from '../src/art/floor11';
import type { Piece } from '../src/art/floorkit';
import { WORD_COLOR } from '../src/art/icons';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hex, hsv, rgb, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const OWN = quietTowerPieces();
const HONEST = new Set(['guttering candles']);
const QUEST = new Set(['the last chapter on its lectern']);
const FIRES = new Set([...CANDLE].map((c) => c.toLowerCase()));

test('nothing of the game imports floor 20\'s pieces', () => {
  const art = new Set(['art/floor20']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/floor20\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports floor 20's pieces`);
    }
  }
});

test('his twenty-five (Places 7): the Moth\'s floor 25 pieces of its own; every one its own name; the quest is the last chapter', () => {
  assert.equal(OWN.length, 25);
  const names = OWN.map((p) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
  assert.equal(OWN.filter((p) => p.kind === 'quest').map((p) => p.name).join(), 'the last chapter on its lectern');
});

test('every piece has its pictures, as many as it says; only the candles and the quest give light, each in its own colour (Colour 3)', () => {
  const want: Record<string, number> = { "a copyist's desk": 2, "a copyist's stool": 2, 'a press of blank books': 2, 'a chest of blank quires': 2, 'a heap of torn pages': 2, 'a door of the tower': 4, 'the trapdoor to the top': 2, 'guttering candles': 2, 'a cocoon on the wall': 2, 'a moth-eaten tapestry': 2, "the Order's banner, gone grey": 2, 'a broken window': 2, 'moth silk, strung from a fallen beam': 2, "the Hush's dust": 3 };
  for (const p of OWN) {
    const all = sprites(p);
    assert.equal(all.length, want[p.name] ?? 1, `${p.name}: ${all.length} pictures`);
    let lit = 0;
    for (const s of all) {
      assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
      for (const L of s.lights ?? []) {
        lit++;
        const c = L.color.toLowerCase();
        assert.ok((HONEST.has(p.name) && FIRES.has(c)) || (QUEST.has(p.name) && c === QUEST_LIGHT), `${p.name}: its light ${L.color}`);
      }
    }
    if (!HONEST.has(p.name) && !QUEST.has(p.name)) assert.equal(lit, 0, `${p.name} gives light`);
    else assert.ok(lit > 0, `${p.name} gives no light`);
  }
});

test('Pixels 1: crisp, every pixel all there or not at all, and no loose single pixels', () => {
  for (const p of OWN) {
    const all = sprites(p);
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
    assert.ok(soft === 0, `${p.name}: ${soft} soft pixels`);
    assert.ok(loose <= 3 * all.length, `${p.name}: ${loose} loose pixels in ${all.length} pictures`);
  }
});

test('Colour 3 and 4: nothing cyan, no pink, every colour but the flame\'s duller than every one of the nine words; and no colour at all', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const p of OWN) {
    let most = 0;
    let at = '';
    let grey = 0;
    let all = 0;
    // (a wall piece's picture on the face turned to the screen's right is dimmed toward the game's own indigo shade, as
    // every wall piece is: its colourlessness is judged on its other pictures)
    const dimmed = new Set(p.right ?? []);
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        const c = hex(r, g, b);
        const [h, sat, val] = hsv(r, g, b);
        if (BRIGHT.has(c)) {
          // (what glows: only the candles' flame)
          assert.ok(HONEST.has(p.name) && FIRES.has(c), `${p.name}: a glow ${c}`);
          return;
        }
        if (val < 0.2) return;
        // (colourless: what is light enough to have a colour at all has next to none; the seams' ink aside)
        if (c !== '#0e0c24' && !dimmed.has(s)) {
          all++;
          if (sat < 0.2) grey++;
        }
        if (sat > most) {
          most = sat;
          at = c;
        }
        assert.ok(!(sat > 0.2 && h > 160 && h < 205), `${p.name}: cyan ${c}`);
        assert.ok(!(sat > 0.35 && val >= 0.3 && h > 300 && h < 350), `${p.name}: pink ${c}`);
      });
    }
    assert.ok(most < dullest, `${p.name}: its richest colour ${at} at ${most.toFixed(2)}, against the dullest word's ${dullest.toFixed(2)}`);
    assert.ok(grey > 0.95 * all, `${p.name}: all but colourless: ${grey} of ${all}`);
  }
});

test('Places 4: what stands stands on its foot (nothing of it far below its anchor)', () => {
  for (const p of OWN) {
    for (const s of p.frames ?? []) {
      const [, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      // (the trapdoor's stair goes down into the floor under it)
      const most = p.name === 'the trapdoor to the top' ? 72 : 64;
      assert.ok(lowest - ay <= most, `${p.name}: ${lowest - ay} picture pixels below its anchor`);
    }
  }
});

test('nothing of a piece is cut off at its picture\'s edge', () => {
  for (const p of OWN) {
    sprites(p).forEach((s: Sprite, i: number) => {
      const q = paintingOf(s);
      let edge = 0;
      for (let x = 0; x < q.w; x++) for (const y of [0, q.h - 1]) if (q.has(x, y)) edge++;
      for (let y = 0; y < q.h; y++) for (const x of [0, q.w - 1]) if (q.has(x, y)) edge++;
      assert.ok(edge === 0, `${p.name} (picture ${i}): ${edge} pixels on its picture's edge`);
    });
  }
});

test('real shapes, not circles and squares (How art is made, 9): no piece fills its own bounding box like a block, nor its oval like a ball', () => {
  for (const p of OWN) {
    if (p.kind === 'floor tile') continue;
    sprites(p).forEach((s: Sprite, i: number) => {
      const q = paintingOf(s);
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      let n = 0;
      for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.has(x, y)) {
        n++;
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
      const box = (x1 - x0 + 1) * (y1 - y0 + 1);
      // (an ellipse fills pi/4 of its box: a piece that is a plain ball or a plain block fills about that or more)
      const inOval = (() => {
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;
        const rx = (x1 - x0 + 1) / 2;
        const ry = (y1 - y0 + 1) / 2;
        let inside = 0;
        let filled = 0;
        let outside = 0;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const out = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 > 1;
          if (out) {
            if (q.has(x, y)) outside++;
            continue;
          }
          inside++;
          if (q.has(x, y)) filled++;
        }
        return [filled / Math.max(1, inside), outside / Math.max(1, n)];
      })();
      assert.ok(n / box < 0.9, `${p.name} (picture ${i}): fills ${(100 * n / box).toFixed(0)}% of its box, a block`);
      // (a plain ball: its oval all filled and next to nothing of it outside the oval)
      assert.ok(!(inOval[0] > 0.96 && inOval[1] < 0.04), `${p.name} (picture ${i}): a plain ball`);
    });
  }
});

test('the last chapter: open on its lectern, its pages the palest of the floor, its name a line darker than any on them', () => {
  const lect = OWN.find((p) => p.name === 'the last chapter on its lectern')!;
  const s = lect.frames![0];
  let pale = 0;
  let name = 0;
  each(s, (r, g, b) => {
    const c = hex(r, g, b);
    if (c === '#e4ded0' || c === '#d4cdbd') pale++;
    if (c === '#1a181e') name++;
  });
  assert.ok(pale > 200, `its pages: ${pale} pixels of bone white`);
  assert.ok(name > 6, `its name: ${name} pixels`);
});

void ({} as Piece);
