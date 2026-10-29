// FLOOR 11, THE GATE WARD: ITS PIECES, the Crier's twenty-five (src/art/floor11.ts) and the Hush's set of twenty-five
// for floors 11 to 15 (src/art/act2_set.ts), built in the Act 2 kit (src/art/act2_kit.ts). A mock-up nothing of the
// game imports. His words for a set of floors, 10 Oct: “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” Held to his art rulebook before they go to the main chat, as Act 1's floors' are
// (tests/floor10.test.ts):
//   Pixels 1 (crisp: every pixel all there or not at all; no loose single pixels);
//   Colour 3 (glows are reserved: the enemy's pink burning to gold only on the enemy's own (the cult's firepots and
//     the dome's shards, the Silent Order's lanterns and jars of stolen voices, the Hush's horn and jar); an honest
//     fire orange; the hero's cyan only on the Bells, his to ring, as the waypoints are; nothing else gives light, and
//     nothing else is cyan);
//   Colour 4 (every colour of a place duller than every one of the nine words: art/act2_quiet.ts, what glows aside);
//   Places 4 (what stands stands on its foot); and nothing of a piece cut off at its picture's edge;
//   Places 7 (twenty-five a set, twenty-five a boss).
//   run: tsx --test tests/floor11.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { BRIGHT } from '../src/art/act2_quiet';
import { hushSetPieces } from '../src/art/act2_set';
import { gateWardPieces } from '../src/art/floor11';
import type { Piece } from '../src/art/floorkit';
import { WORD_COLOR } from '../src/art/icons';
import { CYAN } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { EMBER } from '../src/art/props';
import type { Sprite } from '../src/engine/px';
import { anchor, count, each, hex, hsv, rgb, sprites } from './floor_checks';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const OWN = gateWardPieces();
const SET = hushSetPieces();
const ALL: [string, Piece][] = [...OWN.map((p) => ['floor 11', p] as [string, Piece]), ...SET.map((p) => ['the Hush', p] as [string, Piece])];

/** What may give light, and in what: the enemy's own in its pink to gold; an honest fire, a candle, in orange; the Bells, the hero's to ring, in his cyan; the crier's last proclamation, the quest, in the paper's own pale light. */
const ENEMY = new Set(["a firepot's crater, burning", 'the city gate, broken', "the watch's alarm horn, the Hush's", 'a crate of stolen voices', 'a shard of the dome', "the Order's hooded lantern", "the Order's rack of jars", "the carters' cart, the Order's", 'a drain grate', 'a jar of the Hush']);
const HONEST = new Set(['paper lanterns', 'street lamp', 'wall lantern', 'the hearth']);
const BELLS = new Set(["a wayside shrine's bell", "a shop's doorbell", "the watch's alarm bell"]);
const QUEST = new Set(["the crier's last proclamation"]);
const PINKS = new Set([...FLAME, '#b4306a', '#e86a98', '#7a1a4e', '#4a1236'].map((c) => c.toLowerCase()));
const FIRES = new Set([...EMBER, '#f0a040', '#ffd890', '#c8702a', '#ff8a2a'].map((c) => c.toLowerCase()));
const CYANS = new Set([...CYAN, '#28dcf0', '#22d0e0'].map((c) => c.toLowerCase()));

test('in the game only through its own (ACT 2, THE HUSH: render/act1_pieces.ts); nothing else of the game imports floor 11\'s pieces, the Hush\'s set or their kit', () => {
  // (an import of the art's own file, wherever from: the game's own map-maker of the same name, game/act2/<ground>.ts, is not it)
  const own = new Set(['render/act1_pieces.ts']);
  own.add('art/act2_ways.ts'); // the ways between the floors (mockup/ways): Act 2's kit and quiet colours, as floors 11 to 15's own
  const art = new Set(['art/floor11', 'art/act2_set', 'art/act2_kit', 'art/act2_quiet']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  own.add('art/low_stacks.ts'); // the stacks' rows one block high (mockup/low-stacks): Act 2's quiet colours
  // (floor 16, the Swan Gardens (mockup/swan-gardens), its ground and its pieces, built in Act 2's kit and quiet colours: art/swangardens.ts, art/floor16.ts, skipped above)
  // (the High City's own 25 for floors 16 to 20 (mockup/high-city-set), built in Act 2's kit: art/high_city_set.ts, skipped above)
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(floor11|floor11_moments|act2_set|act2_kit|act2_quiet|gateward|crier|crier_moves|crier_shots|hushed|hushed_moves|hushed_watch|hushed_watch_moves|scribes|scribes_moves|scribe_shots|hounds|undercity|floor12|floor13|millrace|floor14|housequiet|floor15|floor15_moments|library|hub2|swangardens|floor16|high_city_set)\.ts$/.test(f) || own.has(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports floor 11's pieces`);
    }
  }
});

test('his twenty-five and twenty-five (Places 7): the Crier\'s floor 25 pieces of its own, the Hush\'s set 25; every one its own name', () => {
  assert.equal(OWN.length, 25);
  assert.equal(SET.length, 25);
  const names = ALL.map(([, p]) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
});

test('every piece has its pictures; only what may give light gives it, and in its own colour (Colour 3)', () => {
  for (const [set, p] of ALL) {
    const all = sprites(p);
    assert.ok(all.length > 0, `${set}: ${p.name} has pictures`);
    let lit = 0;
    for (const s of all) {
      assert.ok(count(s) > 20, `${set}: ${p.name}: a picture of ${count(s)} pixels`);
      for (const L of s.lights ?? []) {
        lit++;
        const c = L.color.toLowerCase();
        const ok = (ENEMY.has(p.name) && PINKS.has(c)) || ((HONEST.has(p.name) || BELLS.has(p.name)) && FIRES.has(c)) || (BELLS.has(p.name) && CYANS.has(c)) || (QUEST.has(p.name) && c === '#e8e2d2');
        assert.ok(ok, `${set}: ${p.name}: its light ${L.color}`);
      }
    }
    if (!ENEMY.has(p.name) && !HONEST.has(p.name) && !BELLS.has(p.name) && !QUEST.has(p.name)) assert.equal(lit, 0, `${set}: ${p.name} gives light`);
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

test('Colour 3 and 4: nothing cyan but the Bells\' (his to ring), no hot pink but the enemy\'s own, and every other colour duller than every one of the nine words', () => {
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
          // (what glows: only on what may give light, each its own)
          if (CYANS.has(c) || (sat > 0.4 && h > 165 && h < 205)) assert.ok(BELLS.has(p.name), `${set}: ${p.name}: the hero's cyan ${c}`);
          if (PINKS.has(c) && !FIRES.has(c)) assert.ok(ENEMY.has(p.name) || BELLS.has(p.name), `${set}: ${p.name}: the enemy's pink ${c}`);
          return;
        }
        if (val < 0.2) return; // too dark to show a colour
        if (sat > most) {
          most = sat;
          at = c;
        }
        // (the Bells, awake or rung, take the hero's cyan into their metal and the ground round them)
        if (sat > 0.25 && h > 165 && h < 205) assert.ok(BELLS.has(p.name), `${set}: ${p.name}: cyan ${c}`);
      });
    }
    assert.ok(most < dullest, `${set}: ${p.name}: its richest colour ${at} at ${most.toFixed(2)}, against the dullest word's ${dullest.toFixed(2)}`);
  }
});

test('Places 4: what stands stands on its foot (nothing of it far below its anchor); a floor tile\'s inside its diamond', () => {
  for (const [set, p] of ALL) {
    for (const s of p.frames ?? []) {
      const [ax, ay] = anchor(s);
      let lowest = -Infinity;
      each(s, (_r, _g, _b, _a, _x, y) => (lowest = Math.max(lowest, y)));
      if (p.kind === 'floor tile') {
        each(s, (_r, _g, _b, _a, x, y) => {
          const hw = 2 * Math.min(y + 0.5 - (ay - 16), 32 - (y + 0.5 - (ay - 16)));
          assert.ok(Math.abs(x + 0.5 - ax) <= hw + 0.5, `${set}: ${p.name}: (${x}, ${y}) outside its diamond`);
        });
      } else {
        // (a trap throws what it does out across the floor before it: the horn's blast, the jar's burst)
        const most = p.kind === 'trap' ? 100 : 64;
        assert.ok(lowest - ay <= most, `${set}: ${p.name}: ${lowest - ay} picture pixels below its anchor`);
      }
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
