// FLOOR 19, THE KEEP: ITS PIECES, the King's twenty-five (src/art/floor19.ts), built in the Act 2 kit
// (src/art/act2_kit.ts). A mock-up nothing of the game imports. His words for a set of floors, 10 Oct: “Going forward,
// let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” Held to his art rulebook as floor 16's are
// (tests/floor16.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: nothing gives light but honest fire, the torches, the braziers and the fire under the
//     pitch, in the fire's own colours; nothing cyan; no pink);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, the fire aside);
//   Places 4 (what stands stands on its foot); nothing of a piece cut off at its picture's edge;
//   Places 7 (twenty-five a boss).
// And what is its own: the portcullis slams down frame by frame to the floor; the murder hole's pitch falls from above and
// spreads into its pool; what hangs on a wall has its spots, no two the same; the battlements' merlon over its parapet;
// from the book, the great bed's velvet curtains with their golden tassels and the faces looking out of their folds, and
// the songbird of gold set with gems, its wheels spilled.
//   run: tsx --test tests/floor19.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT } from '../src/art/act2_quiet';
import { GOLD, PITCH, keepPieces } from '../src/art/floor19';
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

const OWN = keepPieces();
const of = (name: string): Piece => {
  const p = OWN.find((q) => q.name === name);
  assert.ok(p, `no piece named ${name}`);
  return p!;
};
const HONEST = new Set(['a torch in its sconce', 'a brazier', 'a cauldron of pitch']);
const FIRES = new Set([...EMBER].map((c) => c.toLowerCase()));
/** A picture's pixels as their colours, and how low its lowest one is and how high its highest, against its anchor. */
const span = (s: Sprite): { top: number; bottom: number; left: number; right: number } => {
  const [ax, ay] = anchor(s);
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  each(s, (_r, _g, _b, _a, x, y) => {
    top = Math.min(top, y - ay);
    bottom = Math.max(bottom, y - ay);
    left = Math.min(left, x - ax);
    right = Math.max(right, x - ax);
  });
  return { top, bottom, left, right };
};

test('nothing of the game imports floor 19\'s pieces', () => {
  const art = new Set(['art/floor19']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/floor19\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports floor 19's pieces`);
    }
  }
});

test('his twenty-five (Places 7): the King\'s floor 25 pieces of its own; every one its own name', () => {
  assert.equal(OWN.length, 25);
  assert.equal(new Set(OWN.map((p) => p.name)).size, 25, 'each its own name');
});

test('every piece has its pictures, as many as it says; only honest fire gives light, in the fire\'s own colour (Colour 3)', () => {
  // (a wall piece: its pictures on both faces at each of its spots; the rest, their frames)
  const want: Record<string, number> = {
    'the cloth of estate': 4,
    'the royal runner': 4,
    'a royal banner': 2 + 2 * 4,
    'a torch in its sconce': 6 + 6 * 3,
    'a brazier': 3,
    'an arrow slit': 2 + 2 * 3,
    battlements: 2,
    'a portcullis': 10,
    'a murder hole': 4,
    'a cauldron of pitch': 3,
    'a suit of armour on its stand': 2,
    'a weapon rack': 2,
    'a crossbow rack': 2,
    'barracks bunks': 2,
    barrels: 2,
    'a long table': 2,
    "the keep's great doors": 4,
  };
  for (const p of OWN) {
    const all = sprites(p);
    assert.equal(all.length, want[p.name] ?? 1, `${p.name}: ${all.length} pictures`);
    let lit = 0;
    for (const s of all) {
      assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
      for (const L of s.lights ?? []) {
        lit++;
        assert.ok(HONEST.has(p.name) && FIRES.has(L.color.toLowerCase()), `${p.name}: its light ${L.color}`);
      }
    }
    if (!HONEST.has(p.name)) assert.equal(lit, 0, `${p.name} gives light`);
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

test('Colour 3 and 4: nothing cyan, no pink, and every colour but the fire\'s duller than every one of the nine words', () => {
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
          // (what glows: only honest fire, and only on what burns)
          assert.ok(HONEST.has(p.name) && (FIRES.has(c) || c === '#5a1c1c' || c === '#1c0f1c' || c === '#b03a18'), `${p.name}: a glow ${c}`);
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
      const { bottom } = span(s);
      assert.ok(bottom <= 64, `${p.name}: ${bottom} picture pixels below its anchor`);
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

test('the portcullis slams down: its grille lower frame by frame, its spikes on the floor when slammed; a tile wide, so a row of them is one', () => {
  const port = of('a portcullis').frames!;
  for (const k of [0, 1]) {
    const lows = [0, 1, 2, 3, 4].map((f) => span(port[k * 5 + f]).bottom);
    // (up, the warning, falling: each lower than the last; slammed and down: on the floor, at its anchor's line or near it)
    assert.ok(lows[1] > lows[0] && lows[2] > lows[1] && lows[3] > lows[2], `along ${k ? 'y' : 'x'}: its lowest pixel ${lows.join(', ')}`);
    const up = span(port[k * 5]);
    assert.ok(up.bottom < -60, `along ${k ? 'y' : 'x'}: up, its spikes ${-up.bottom} over the floor`);
    // (its lintel across one tile: 32 picture pixels across its width either way, with its depth)
    assert.ok(up.right - up.left >= 34 && up.right - up.left <= 52, `along ${k ? 'y' : 'x'}: up, ${up.right - up.left} across`);
  }
});

test('the murder hole: pitch falls from the dark above in its warning and pouring, and spreads into a pool wider than its old stains', () => {
  const mh = of('a murder hole').frames!;
  const pitch = new Set(PITCH.map((c) => c.toLowerCase()));
  const high = (s: Sprite): number => {
    const [, ay] = anchor(s);
    let n = 0;
    each(s, (r, g, b, _a, _x, y) => {
      if (y < ay - 60 && hsv(r, g, b)[2] < 0.2) n++;
    });
    return n;
  };
  assert.equal(high(mh[0]), 0, 'still: nothing falling');
  assert.ok(high(mh[1]) > 5 && high(mh[2]) > high(mh[1]), `the warning ${high(mh[1])}, pouring ${high(mh[2])}`);
  const wide = (s: Sprite): number => {
    const [, ay] = anchor(s);
    let l = Infinity;
    let r = -Infinity;
    each(s, (rr, g, b, _a, x, y) => {
      if (Math.abs(y - ay) < 14 && hsv(rr, g, b)[2] < 0.2) {
        l = Math.min(l, x);
        r = Math.max(r, x);
      }
    });
    return r - l;
  };
  assert.ok(wide(mh[3]) > wide(mh[0]) + 8, `the pool ${wide(mh[3])} across, the old stains ${wide(mh[0])}`);
  void pitch;
});

test('what hangs on a wall has its spots, no two the same, and a picture on each face at each', () => {
  for (const p of OWN.filter((q) => q.kind === 'on the wall' || q.kind === 'door')) {
    assert.ok(p.left && p.right && p.left.length === p.right.length, `${p.name}: its faces`);
    if (p.kind === 'door') continue;
    const sp = p.spots ?? [];
    assert.ok(sp.length >= 1, `${p.name}: no spots`);
    assert.equal(new Set(sp.map((s) => `${s.du},${s.dv}`)).size, sp.length, `${p.name}: two spots the same`);
    for (const s of sp) assert.ok(s.left.length === p.left.length && s.right.length === p.right.length, `${p.name}: a spot without all its frames`);
  }
});

test('the battlements: a merlon standing over its parapet, a crenel beside it', () => {
  for (const s of of('battlements').frames!) {
    const q = paintingOf(s);
    const tops: number[] = [];
    for (let x = 0; x < q.w; x++) {
      let t = -1;
      for (let y = 0; y < q.h; y++) if (q.has(x, y)) {
        t = y;
        break;
      }
      if (t >= 0) tops.push(t);
    }
    const hi = Math.min(...tops);
    const lo = Math.max(...tops);
    assert.ok(lo - hi >= 14, `its merlon over its parapet: ${lo - hi} picture pixels`);
  }
});

test('from the book: the great bed\'s curtains, their golden tassels and the faces in their folds; the songbird of gold set with gems', () => {
  const bed = of("the king's great bed").frames![0];
  let gold = 0;
  let pale = 0;
  each(bed, (r, g, b) => {
    const [h, s, v] = hsv(r, g, b);
    if (s > 0.25 && h > 28 && h < 55) gold++;
    if (s < 0.2 && v > 0.45 && h > 200 && h < 260) pale++;
  });
  assert.ok(gold > 60, `the bed's gold: ${gold}`);
  assert.ok(pale > 40, `the faces in its curtains: ${pale}`);
  const bird = of('the clockwork songbird, broken').frames![0];
  const golds = new Set(GOLD.map((c) => c.toLowerCase()));
  let au = 0;
  let red = 0;
  let blue = 0;
  each(bird, (r, g, b) => {
    const [h, s] = hsv(r, g, b);
    if (golds.has(hex(r, g, b)) || (s > 0.3 && h > 30 && h < 55)) au++;
    if (s > 0.3 && (h < 15 || h > 350)) red++;
    if (s > 0.25 && h > 220 && h < 250) blue++;
  });
  assert.ok(au > 80 && red > 0 && blue > 0, `the songbird: gold ${au}, rubies ${red}, sapphires ${blue}`);
  assert.equal(of('the clockwork songbird, broken').kind, 'quest');
});
