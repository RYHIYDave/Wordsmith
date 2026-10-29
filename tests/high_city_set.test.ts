// THE HIGH CITY (floors 16 to 20): THE SET'S OWN TWENTY-FIVE (src/art/high_city_set.ts), built in the Act 2 kit
// (src/art/act2_kit.ts). A mock-up nothing of the game imports. His words for a set of floors, 10 Oct: “Going forward, let’s
// do 25 that are the theme of the 5 levels, then 25 for each boss.” Held to his art rulebook as the Lower City's set is
// (tests/floor11.test.ts) and floor 16's own are (tests/floor16.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: nothing gives light but honest flame, the gilt lamp post's, the sconce's and the
//     candelabrum's, in orange; nothing cyan; no pink);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, the flames aside);
//   Places 4 (what stands stands on its foot; a floor tile inside its diamond); nothing of a piece cut off at its picture's edge;
//   Places 7 (twenty-five a set), every one its own name, its own among floor 16's too (the set's are laid on all five floors);
//   and his event, the Royal Cards: the four royals' cards and banners each in its own royal's colours.
//   run: tsx --test tests/high_city_set.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT, quietHex } from '../src/art/act2_quiet';
import { ROYALS, ROYAL_LOOK, highCitySetPieces } from '../src/art/high_city_set';
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

const SET = highCitySetPieces();
/** What gives light: an honest flame, each in orange. */
const HONEST = new Set(['a gilt lamp post', 'a gilt sconce', 'a standing candelabrum']);
const FIRES = new Set([...EMBER].map((c) => c.toLowerCase()));
/** Each piece's pictures (a wall piece's on one face at one spot), and for a wall piece its spots. */
const WANT: Record<string, number> = {
  "a royal's banner": 4,
  'a court portrait, faces painted out': 1,
  'a gilt sconce': 3,
  'a court notice, gone blank': 1,
  "the Order's mask over the crest": 1,
  'a palace door': 3,
  'a gilt lamp post': 2,
  'palace railings': 4,
  'a sentry box': 2,
  'a marble statue of a royal': 1,
  'the fountain of the four royals': 2,
  'a royal coach, abandoned': 2,
  'a velvet rope barrier': 2,
  'a gilt chair': 2,
  'a royal card table': 1,
  'a silver tea service, left out': 2,
  'a grand vase': 2,
  'a hat stand, cloaks left on it': 1,
  "the heralds' trumpets, stopped": 1,
  'a standing candelabrum': 3,
  "a songbird's cage, silent": 1,
  'a royal carpet': 2,
  'a heap of invitations': 1,
  'a dropped fan and a rose': 1,
  'a royal card': 4,
};
const SPOTS: Record<string, number> = { 'a palace door': 1 };
/** Which frames of a piece that gives light are lit (the rest are out). */
const LIT: Record<string, number[]> = { 'a gilt lamp post': [0, 1], 'a gilt sconce': [0, 1], 'a standing candelabrum': [0, 1] };

test('nothing of the game imports the High City\'s set', () => {
  const art = new Set(['art/high_city_set']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/high_city_set\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports the High City's set`);
    }
  }
});

test('his twenty-five (Places 7): the set for floors 16 to 20, every one its own name, and none of floor 16\'s own', () => {
  assert.equal(SET.length, 25);
  const names = SET.map((p) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
  const f16 = new Set([...swanGardensPieces(), ...herVinesPieces()].map((p) => p.name));
  for (const n of names) assert.ok(!f16.has(n), `${n} is a name of floor 16's own`);
});

test('every piece has its pictures, as many as it says; a wall piece on both faces at each of its spots, the first its own', () => {
  for (const p of SET) {
    const want = WANT[p.name];
    assert.ok(want !== undefined, `${p.name}: how many pictures it has is known`);
    if (p.left || p.right) {
      assert.ok(p.kind === 'on the wall' || p.kind === 'door', `${p.name}: hung on a wall, a ${p.kind}`);
      assert.equal(p.left!.length, want, `${p.name}: ${p.left!.length} pictures on the face in the light`);
      assert.equal(p.right!.length, want, `${p.name}: ${p.right!.length} pictures on the face in shade`);
      const spots = p.spots ?? [];
      assert.equal(spots.length, SPOTS[p.name] ?? 3, `${p.name}: ${spots.length} spots`);
      assert.ok(spots[0].left === p.left && spots[0].right === p.right, `${p.name}: its first spot is its own`);
      for (const sp of spots) assert.ok(sp.left.length === want && sp.right.length === want, `${p.name}: at (${sp.du}, ${sp.dv}), every frame on both faces`);
      assert.equal(new Set(spots.map((sp) => `${sp.du},${sp.dv}`)).size, spots.length, `${p.name}: its spots each a place of its own`);
    } else {
      assert.equal(p.frames?.length, want, `${p.name}: ${p.frames?.length} pictures`);
    }
    for (const s of sprites(p)) assert.ok(count(s) > 20, `${p.name}: a picture of ${count(s)} pixels`);
  }
});

test('Colour 3: only honest flame gives light, in orange; the lit frames give it and the frames put out do not', () => {
  for (const p of SET) {
    // (a picture's frame: its place in its own list)
    const lists: Sprite[][] = p.left ? [...(p.spots ?? []).flatMap((sp) => [sp.left, sp.right])] : [p.frames ?? []];
    for (const list of lists) {
      list.forEach((s, f) => {
        const lights = s.lights ?? [];
        if (!HONEST.has(p.name)) {
          assert.equal(lights.length, 0, `${p.name} gives light`);
          return;
        }
        if (LIT[p.name].includes(f)) assert.ok(lights.length > 0, `${p.name} (frame ${f}): lit, and gives no light`);
        else assert.equal(lights.length, 0, `${p.name} (frame ${f}): put out, and gives light`);
        for (const L of lights) assert.ok(FIRES.has(L.color.toLowerCase()), `${p.name}: its light ${L.color}`);
      });
    }
  }
});

test('Pixels 1: crisp, every pixel all there or not at all, and no loose single pixels', () => {
  for (const p of SET) {
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

test('Colour 3 and 4: nothing cyan, no pink, and every colour but an honest flame\'s duller than every one of the nine words', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(...rgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  for (const p of SET) {
    let most = 0;
    let at = '';
    for (const s of sprites(p)) {
      each(s, (r, g, b) => {
        const c = hex(r, g, b);
        const [h, sat, val] = hsv(r, g, b);
        if (BRIGHT.has(c)) {
          // (what glows: only an honest flame)
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

test('Places 4: what stands stands on its foot (nothing of it far below its anchor); a floor tile inside its diamond', () => {
  for (const p of SET) {
    for (const s of p.frames ?? []) {
      const [ax, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      if (p.kind === 'floor tile') {
        each(s, (_r, _g, _b, _a, x, y) => {
          const hw = 2 * Math.min(y + 0.5 - (ay - 16), 32 - (y + 0.5 - (ay - 16)));
          assert.ok(Math.abs(x + 0.5 - ax) <= hw + 0.5, `${p.name}: (${x}, ${y}) outside its diamond`);
        });
      } else {
        assert.ok(lowest - ay <= 64, `${p.name}: ${lowest - ay} picture pixels below its anchor`);
      }
    }
  }
});

test('nothing of a piece is cut off at its picture\'s edge', () => {
  for (const p of SET) {
    sprites(p).forEach((s: Sprite, i: number) => {
      const q = paintingOf(s);
      let edge = 0;
      for (let x = 0; x < q.w; x++) for (const y of [0, q.h - 1]) if (q.has(x, y)) edge++;
      for (let y = 0; y < q.h; y++) for (const x of [0, q.w - 1]) if (q.has(x, y)) edge++;
      assert.ok(edge === 0, `${p.name} (picture ${i}): ${edge} pixels on its picture's edge`);
    });
  }
});

test('his Royal Cards: the four royals\' cards and banners, each in its own royal\'s colours and none of another\'s', () => {
  const field = (r: string): string => quietHex(ROYAL_LOOK[r as keyof typeof ROYAL_LOOK].field[2]).toLowerCase();
  const of = (name: string): Piece => SET.find((p) => p.name === name)!;
  const card = of('a royal card');
  const banner = of("a royal's banner");
  ROYALS.forEach((r, i) => {
    for (const [what, s] of [['card', card.frames![i]], ['banner', banner.left![i]]] as const) {
      const seen = new Set<string>();
      each(s, (rr, gg, bb) => seen.add(hex(rr, gg, bb)));
      assert.ok(seen.has(field(r)), `the ${r}'s ${what} is in the ${r}'s colours`);
      for (const o of ROYALS) if (o !== r) assert.ok(!seen.has(field(o)), `the ${r}'s ${what} has the ${o}'s colour in it`);
    }
  });
});
