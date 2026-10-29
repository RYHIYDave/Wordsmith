// FLOOR 16, THE SWAN GARDENS: ITS PIECES, the Princess's twenty-five (src/art/floor16.ts), built in the Act 2 kit
// (src/art/act2_kit.ts). A mock-up nothing of the game imports. His words for a set of floors, 10 Oct: “Going forward,
// let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” Held to his art rulebook as floor 13's are
// (tests/floor13.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: nothing gives light but the lantern's candle, an honest flame, and the quest's own pale
//     light, the nettle shirt half woven; nothing cyan; no pink);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, the candle aside);
//   Places 4 (what stands stands on its foot: the Swan Pavilion's likeness in the water before it aside); nothing of a
//   piece cut off at its picture's edge;
//   Places 7 (twenty-five a boss).
// And HER VINES IN THE GARDENS (herVinesPieces), his ask beyond the twenty-five (28 Oct: “Can you put some of these vines
// into the map as well?  Around where the hushed gardeners are at.”, “Once we lock in the look.  So they match”), held to
// all the same; drawn by her whip's own recipe (src/art/princess_vine.ts); the yew's draws back into it.
//   run: tsx --test tests/floor16.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT } from '../src/art/act2_quiet';
import { herVinesPieces, swanGardensPieces } from '../src/art/floor16';
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

const OWN = swanGardensPieces();
const VINES = herVinesPieces();
const ALL: [string, Piece][] = [...OWN.map((p) => ['floor 16', p] as [string, Piece]), ...VINES.map((p) => ['her vines', p] as [string, Piece])];
const HONEST = new Set(['a lantern on a post', 'a lantern on a post, her vine up it']);
const QUEST = new Set(['a nettle shirt, half woven']);
const FIRES = new Set([...EMBER, '#ffc860', '#fff3b0'].map((c) => c.toLowerCase()));

test('nothing of the game imports floor 16\'s pieces', () => {
  const art = new Set(['art/floor16']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/floor16\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports floor 16's pieces`);
    }
  }
});

test('his twenty-five (Places 7): the Princess\'s floor 25 pieces of its own; every one its own name', () => {
  assert.equal(OWN.length, 25);
  const names = ALL.map(([, p]) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
});

test('every piece has its pictures, as many as it says; only the lantern and the quest give light, each in its own colour (Colour 3)', () => {
  const want: Record<string, number> = { 'a terrace wall': 2, "a stair's pier": 2, 'the terrace stair': 2, 'box edging': 2, 'a rose bush': 2, 'a stone bench': 2, 'an urn of roses': 2, 'a rose arbour': 4, nettles: 2, 'a garden gate': 4, "a gardener's barrow": 2, 'a terrace wall, her vine over it': 2, 'box edging, her vine through it': 2, 'her vine across the walk': 2, 'a yew cone, her vine reaching out of it': 4 };
  for (const [set, p] of ALL) {
    const all = sprites(p);
    assert.equal(all.length, want[p.name] ?? 1, `${set}: ${p.name}: ${all.length} pictures`);
    let lit = 0;
    for (const s of all) {
      assert.ok(count(s) > 20, `${set}: ${p.name}: a picture of ${count(s)} pixels`);
      for (const L of s.lights ?? []) {
        lit++;
        const c = L.color.toLowerCase();
        assert.ok((HONEST.has(p.name) && FIRES.has(c)) || (QUEST.has(p.name) && c === '#e8e2d2'), `${set}: ${p.name}: its light ${L.color}`);
      }
    }
    if (!HONEST.has(p.name) && !QUEST.has(p.name)) assert.equal(lit, 0, `${set}: ${p.name} gives light`);
    else assert.ok(lit > 0, `${set}: ${p.name} gives no light`);
  }
});

test('Pixels 1: crisp, every pixel all there or not at all, and no loose single pixels', () => {
  for (const [set, p] of ALL) {
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
    assert.ok(soft === 0, `${set}: ${p.name}: ${soft} soft pixels`);
    assert.ok(loose <= 3 * all.length, `${set}: ${p.name}: ${loose} loose pixels in ${all.length} pictures`);
  }
});

test('Colour 3 and 4: nothing cyan, no pink, and every colour but the candle\'s duller than every one of the nine words', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const [set, p] of ALL) {
    let most = 0;
    let at = '';
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        const c = hex(r, g, b);
        const [h, sat, val] = hsv(r, g, b);
        if (BRIGHT.has(c)) {
          // (what glows: only the lantern's candle)
          assert.ok(HONEST.has(p.name) && FIRES.has(c), `${set}: ${p.name}: a glow ${c}`);
          return;
        }
        if (val < 0.2) return;
        if (sat > most) {
          most = sat;
          at = c;
        }
        assert.ok(!(sat > 0.2 && h > 160 && h < 205), `${set}: ${p.name}: cyan ${c}`);
        assert.ok(!(sat > 0.35 && val >= 0.3 && h > 300 && h < 350), `${set}: ${p.name}: pink ${c}`);
      });
    }
    assert.ok(most < dullest, `${set}: ${p.name}: its richest colour ${at} at ${most.toFixed(2)}, against the dullest word's ${dullest.toFixed(2)}`);
  }
});

test('Places 4: what stands stands on its foot (nothing of it far below its anchor; the pavilion\'s likeness in the water aside)', () => {
  for (const [set, p] of ALL) {
    for (const s of p.frames ?? []) {
      const [, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      const most = p.name === 'the Swan Pavilion on its island' ? 200 : 64;
      assert.ok(lowest - ay <= most, `${set}: ${p.name}: ${lowest - ay} picture pixels below its anchor`);
    }
  }
});

test('nothing of a piece is cut off at its picture\'s edge', () => {
  for (const [set, p] of ALL) {
    sprites(p).forEach((s: Sprite, i: number) => {
      const q = paintingOf(s);
      let edge = 0;
      for (let x = 0; x < q.w; x++) for (const y of [0, q.h - 1]) if (q.has(x, y)) edge++;
      for (let y = 0; y < q.h; y++) for (const x of [0, q.w - 1]) if (q.has(x, y)) edge++;
      assert.ok(edge === 0, `${set}: ${p.name} (picture ${i}): ${edge} pixels on its picture's edge`);
    });
  }
});

test('a terrace wall\'s face fills its row: 32 picture pixels of stone straight up from its tile\'s near edge', () => {
  const wall = OWN.find((p) => p.name === 'a terrace wall')!.frames![0];
  const q = paintingOf(wall);
  const [ax, ay] = anchor(wall);
  // (at the middle of its face, a quarter tile left of its anchor: the near edge 8 below the anchor's line there)
  const x = Math.round(ax - 16);
  let solid = 0;
  for (let y = Math.round(ay + 8) - 32; y < Math.round(ay + 8); y++) if (q.has(x, y)) solid++;
  assert.ok(solid >= 31, `the face at its middle: ${solid} of 32`);
});

test('her vines in the gardens: her whip\'s own recipe, and the yew\'s vine draws back into it, frame by frame', () => {
  const src = fs.readFileSync('src/art/floor16.ts', 'utf8');
  assert.ok(/from '\.\/princess_vine'/.test(src) && /herVine\(/.test(src), 'floor 16 draws her vines with art/princess_vine.ts');
  const whip = fs.readFileSync('src/art/princess.ts', 'utf8');
  assert.ok(/from '\.\/princess_vine'/.test(whip) && /herVine\(/.test(whip), 'her whip is drawn with art/princess_vine.ts');
  const yew = VINES.find((p) => p.name === 'a yew cone, her vine reaching out of it')!;
  const left = (s: Sprite): number => {
    const q = paintingOf(s);
    for (let x = 0; x < q.w; x++) for (let y = 0; y < q.h; y++) if (q.has(x, y)) return x;
    return q.w;
  };
  const reach = yew.frames!.map(left);
  assert.ok(reach[2] > reach[0] + 8 && reach[3] > reach[2] + 8, `her vine out of the yew reaches to ${reach.join(', ')} from its picture's left`);
});
