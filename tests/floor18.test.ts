// FLOOR 18, THE GLASS GALLERY: ITS PIECES, the Queen's twenty-five (src/art/floor18.ts), built in the Act 2 kit
// (src/art/act2_kit.ts). A mock-up nothing of the game imports. His words for a set of floors, 10 Oct: “Going forward,
// let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” Held to his art rulebook as floor 16's are
// (tests/floor16.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: nothing gives light but the candles, an honest flame (the candelabrum's, the sconce's),
//     and the quest's own pale light (the apple on its dish); nothing cyan; no pink);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, the candles aside);
//   Places 4 (what stands stands on its foot); nothing of a piece cut off at its picture's edge;
//   Places 7 (twenty-five a boss);
// and what is its own: the hazards (a tall mirror whole, cracked and burst, its shards before it; a skylight whole,
// cracking and broken through); the mirrors' glass a cold grey-blue that gives back the floor; the apple from the book,
// white with a red cheek.
//   run: tsx --test tests/floor18.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT } from '../src/art/act2_quiet';
import { glassGalleryPieces } from '../src/art/floor18';
import type { Piece } from '../src/art/floorkit';
import { WORD_COLOR } from '../src/art/icons';
import { EMBER } from '../src/art/props';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hex, hsv, rgb, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const OWN = glassGalleryPieces();
const HONEST = new Set(['a silver candelabrum', 'a sconce of candles']);
const QUEST = new Set(['the apple on a silver dish']);
const FIRES = new Set([...EMBER].map((c) => c.toLowerCase()));
const of = (n: string): Piece => OWN.find((p) => p.name === n)!;

test('nothing of the game imports floor 18\'s pieces', () => {
  const art = new Set(['art/floor18']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/floor18\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports floor 18's pieces`);
    }
  }
});

test('his twenty-five (Places 7): the Queen\'s floor 25 pieces of its own; every one its own name', () => {
  assert.equal(OWN.length, 25);
  const names = OWN.map((p) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
});

test('every piece has its pictures, as many as it says; only the candles and the quest give light, each in its own colour (Colour 3)', () => {
  // (a wall piece's are on both faces: the tall mirror whole, cracked, burst on each; the doors shut and open on each)
  const want: Record<string, number> = {
    'a tall mirror': 6, 'a cheval mirror': 2, 'a dressing table': 2, 'a dressing screen': 2, 'a wardrobe of gowns': 2, 'a velvet banquette': 2, 'a console table': 2,
    'a sconce of candles': 2, 'a bust on a plinth': 2, 'a tapestry in rags': 2, "the queen's doors": 4, 'a gate of wrought silver': 4, 'a stained-glass window': 2,
    'a chapel pew': 2, 'a bench of dead orchids': 2, 'an orchid in its pot, dead': 2, 'a skylight': 3,
  };
  for (const p of OWN) {
    const all = sprites(p);
    assert.equal(all.length, want[p.name] ?? 1, `${p.name}: ${all.length} pictures`);
    let lit = 0;
    for (const s of all) {
      assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
      for (const L of s.lights ?? []) {
        lit++;
        const c = L.color.toLowerCase();
        assert.ok((HONEST.has(p.name) && FIRES.has(c)) || (QUEST.has(p.name) && c === '#e8e2d2'), `${p.name}: its light ${L.color}`);
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

test('Colour 3 and 4: nothing cyan, no pink, and every colour but the candles\' duller than every one of the nine words', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const p of OWN) {
    let most = 0;
    let at = '';
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        const c = hex(r, g, b);
        const [h, sat, val] = hsv(r, g, b);
        if (BRIGHT.has(c)) {
          // (what glows: only the candles)
          assert.ok(HONEST.has(p.name) && FIRES.has(c), `${p.name}: a glow ${c}`);
          return;
        }
        if (val < 0.2) return;
        if (sat > most) {
          most = sat;
          at = c;
        }
        assert.ok(!(sat > 0.2 && h > 160 && h < 205), `${p.name}: cyan ${c}`);
        assert.ok(!(sat > 0.35 && val >= 0.3 && h > 300 && h < 350), `${p.name}: pink ${c}`);
      });
    }
    assert.ok(most < dullest, `${p.name}: its richest colour ${at} at ${most.toFixed(2)}, against the dullest word's ${dullest.toFixed(2)}`);
  }
});

test('Places 4: what stands stands on its foot (nothing of it far below its anchor)', () => {
  for (const p of OWN) {
    for (const s of p.frames ?? []) {
      const [, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      assert.ok(lowest - ay <= 64, `${p.name}: ${lowest - ay} picture pixels below its anchor`);
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

/** The pixels of a picture, as [r, g, b] (opaque ones). */
const pixels = (s: Sprite): [number, number, number][] => {
  const out: [number, number, number][] = [];
  each(s, (r, g, b) => out.push([r, g, b]));
  return out;
};
/** A mirror's glass: a cold grey-blue (hue 215 to 250), not grey, not the dark of a seam. */
const glassy = ([r, g, b]: [number, number, number]): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return v > 0.2 && s > 0.08 && h >= 215 && h < 250;
};

test('THE HAZARD, a tall mirror: whole, its glass a cold grey-blue giving back the floor; cracked, its cracks lit and pieces gone; burst, its glass gone and its shards strewn before the wall', () => {
  const m = of('a tall mirror');
  assert.equal(m.kind, 'trap');
  for (const side of [m.left!, m.right!]) {
    const [whole, cracked, burst] = side;
    const g0 = pixels(whole).filter(glassy).length;
    const g1 = pixels(cracked).filter(glassy).length;
    const g2 = pixels(burst).filter(glassy).length;
    assert.ok(g0 > 600, `the whole mirror's glass: ${g0} pixels of it`);
    assert.ok(g1 < g0 && g1 > 0.6 * g0, `cracked, most of its glass still there: ${g1} of ${g0}`);
    assert.ok(g2 < 0.5 * g0, `burst, its glass gone: ${g2} of ${g0}`);
    // its shards on the floor before the wall: glass below the frame's foot
    const [, ay] = anchor(burst);
    let below = 0;
    each(burst, (r, g, b, _a, _x, y) => {
      if (y > ay - 6 && glassy([r, g, b])) below++;
    });
    assert.ok(below > 15, `the shards before the wall: ${below} pixels`);
  }
  // the glass gives back the floor: the galleries' violet squares in it
  let violet = 0;
  each(m.left![0], (r, g, b) => {
    const [h, s] = hsv(r, g, b);
    if (h >= 250 && h < 300 && s > 0.15) violet++;
  });
  assert.ok(violet > 10, `the floor's violet in the glass: ${violet} pixels`);
});

test('THE HAZARD, a skylight: whole (frosted panes in an iron grid); cracking (more of its glass lit by cracks); broken through (the dark of the drop, and the hall below)', () => {
  const s = of('a skylight');
  assert.equal(s.kind, 'trap');
  const [whole, cracking, broken] = s.frames!;
  const lum = (p: [number, number, number]): number => 0.3 * p[0] + 0.5 * p[1] + 0.2 * p[2];
  const bright = (sp: Sprite): number => pixels(sp).filter((p) => lum(p) > 150).length;
  const dark = (sp: Sprite): number => pixels(sp).filter((p) => lum(p) < 30).length;
  assert.ok(bright(cracking) > bright(whole), `the cracks catch the light: ${bright(cracking)} against ${bright(whole)}`);
  assert.ok(dark(broken) > 3 * Math.max(1, dark(whole)), `broken through, the drop: ${dark(broken)} dark pixels against ${dark(whole)}`);
  assert.equal(count(whole), count(broken), 'it covers its tile the same, whole or broken');
});

test('THE QUEST, the apple she made (the book): white, its cheek red; its own pale light', () => {
  const a = of('the apple on a silver dish');
  assert.equal(a.kind, 'quest');
  let red = 0;
  let white = 0;
  each(a.frames![0], (r, g, b) => {
    const [h, s, v] = hsv(r, g, b);
    if ((h < 15 || h > 350) && s > 0.4 && v > 0.3) red++;
    if (s < 0.2 && v > 0.7) white++;
  });
  assert.ok(red > 10 && white > 10, `red ${red}, white ${white}`);
});
