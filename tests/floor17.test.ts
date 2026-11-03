// FLOOR 17, THE MASQUE: ITS PIECES, the Prince's twenty-five (src/art/floor17.ts), built in the Act 2 kit
// (src/art/act2_kit.ts). A mock-up nothing of the game imports. His words for a set of floors, 10 Oct: “Going forward,
// let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” Held to his art rulebook as floor 16's are
// (tests/floor16.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: nothing gives light but honest flames, an honest orange (the braziers, the candles of
//     the candelabra, the chandelier and the sconces), that fire through the black room's scarlet panes (the curtained
//     window), and the quest's own pale light; nothing cyan; no pink);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, the fire aside);
//   Places 4 (what stands stands on its foot); nothing of a piece cut off at its picture's edge;
//   Places 7 (twenty-five a boss).
// And what is the floor's own: the great ebony clock (his doc's hazard) gigantic, its pendulum swinging frame by frame,
// its chime two frames more; what hangs from the roof hangs (nothing of it on the floor); the royal crest the house's own,
// the same drawing the palace guard wears.
//   run: tsx --test tests/floor17.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT } from '../src/art/act2_quiet';
import { CLOCK_FRAMES, RED_WINDOW_LIGHT, masquePieces } from '../src/art/floor17';
import { CANDLE } from '../src/art/floor11';
import type { Piece } from '../src/art/floorkit';
import { WORD_COLOR } from '../src/art/icons';
import { EMBER } from '../src/art/props';
import { MQ_SCARLET } from '../src/art/masque';
import type { Sprite } from '../src/engine/px';
import { HIGH_CITY } from '../src/game/act1';
import { anchor, count, each, hex, hsv, rgb, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const OWN = masquePieces();
/** What burns with an honest flame (Colour 3); the curtained window, that fire through the scarlet glass; the quest, its own pale light. */
const FLAMES = new Set(['a brazier on its tripod', 'a gilt candelabrum', 'a crystal chandelier', 'a gilt sconce']);
const WINDOW = 'black velvet at a window lit red';
const QUEST = "the prince's bargain with the Order";
const FIRES = new Set([...EMBER, ...CANDLE].map((c) => c.toLowerCase()));
const SCARLET = new Set([...MQ_SCARLET, ...EMBER].map((c) => c.toLowerCase()));
/** What hangs from the roof: nothing of it on the floor. */
const HANGS = new Set(['a crystal chandelier', 'gilt ornaments hanging from the roof']);

// (Since his “Yes, on to 17 (Recommended)”, 30 Oct 2026, the game takes floor 17's pieces in, on floor 17 behind HIGH_CITY
// (game/act1.ts, docs/high_city_build.md); nothing of it is seen until he has played the floor and said yes.)
test('floor 17\'s pieces are in the game only behind HIGH_CITY, off until his yes', () => {
  assert.equal(HIGH_CITY.on, false);
});

test('his twenty-five (Places 7): the Prince\'s floor 25 pieces of its own; every one its own name', () => {
  assert.equal(OWN.length, 25);
  const names = OWN.map((p) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
});

test('every piece has its pictures, as many as it says; only the honest flames, the window lit red and the quest give light, each in its own colour (Colour 3)', () => {
  const want: Record<string, number> = {
    'the great ebony clock': 12,
    'a brazier on its tripod': 4,
    'a gilt candelabrum': 2,
    'a crystal chandelier': 2,
    'a gilt sconce': 4,
    [WINDOW]: 2,
    'a tapestry of the masque': 4,
    'a pier glass, its glass gone': 2,
    'gilt ornaments hanging from the roof': 2,
    'a gilt chair': 2,
    'a fainting couch': 2,
    'a card table with royal cards': 2,
    'a buffet of a feast gone cold': 2,
    'a harpsichord': 2,
    'a viol and its stand': 2,
    'a folding screen of arabesques': 2,
    "a footman's tray": 2,
    'the great doors': 4,
    'the iron gates, their bolts welded': 4,
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
        const ok = (FLAMES.has(p.name) && FIRES.has(c)) || (p.name === WINDOW && c === RED_WINDOW_LIGHT.toLowerCase()) || (p.name === QUEST && c === '#e8e2d2');
        assert.ok(ok, `${p.name}: its light ${L.color}`);
      }
    }
    // (a candle's light is its lit frame's: the chandelier and the sconce have a frame put out)
    if (!FLAMES.has(p.name) && p.name !== WINDOW && p.name !== QUEST) assert.equal(lit, 0, `${p.name} gives light`);
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
    // (the brazier throws a spark a frame)
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
          // (what glows: only the honest flames, and their fire through the scarlet glass)
          assert.ok((FLAMES.has(p.name) && (FIRES.has(c) || SCARLET.has(c))) || (p.name === WINDOW && SCARLET.has(c)) || (p.name === 'a crystal chandelier' && FIRES.has(c)), `${p.name}: a glow ${c}`);
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

test('Places 4: what stands stands on its foot (nothing of it far below its anchor); what hangs from the roof hangs, nothing of it on the floor', () => {
  for (const p of OWN) {
    for (const s of p.frames ?? []) {
      const [, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      assert.ok(lowest - ay <= 64, `${p.name}: ${lowest - ay} picture pixels below its anchor`);
      if (HANGS.has(p.name)) assert.ok(ay - lowest > 40, `${p.name}: its lowest ${ay - lowest} picture pixels over the floor`);
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

test('the great ebony clock (his doc\'s hazard): gigantic, near three times the knight\'s height; its pendulum swings frame by frame; its chime two frames more, the bell struck', () => {
  const clock = OWN.find((p) => p.name === 'the great ebony clock')!;
  const fr = clock.frames!;
  for (const k of [0, CLOCK_FRAMES.perFacing]) {
    const f0 = fr[k];
    const [, ay] = anchor(f0);
    let top = Infinity;
    each(f0, (_r, _g, _b, _a, _x, y) => (top = Math.min(top, y)));
    // (the knight stands 58 picture pixels)
    assert.ok(ay - top > 2.5 * 58, `the clock stands ${ay - top} picture pixels`);
    // the pendulum: out to one side, through the middle, out to the other
    assert.ok(unlike(fr[k + 0], fr[k + 2]) > 20, `its pendulum's two sides differ by ${unlike(fr[k], fr[k + 2])} pixels`);
    assert.ok(unlike(fr[k + 0], fr[k + 1]) > 10, 'its pendulum moves through the middle');
    // the chime: the hammer drawn back, then the bell struck and its note going out
    const [c1, c2] = CLOCK_FRAMES.chime.map((i) => fr[k + i]);
    assert.ok(unlike(c1, c2) > 40, `its chime's two frames differ by ${unlike(c1, c2)} pixels`);
    assert.ok(count(c2) > count(fr[k]) + 40, 'the struck bell\'s note goes out of the cupola');
  }
});

test('the royal crest in the floor is the house\'s own: the same drawing the palace guard wears', () => {
  const body = (src: string): string => {
    const a = src.indexOf('function swanCrest(');
    const b = src.indexOf('\n}\n', a);
    return src.slice(src.indexOf('{', a), b).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');
  };
  const guard = fs.readFileSync('src/art/palace_guard.ts', 'utf8');
  const mine = fs.readFileSync('src/art/floor17.ts', 'utf8');
  assert.ok(guard.includes('function swanCrest('), 'the palace guard\'s crest is where it was');
  assert.equal(body(mine), body(guard), 'the crest drawn the same');
});
