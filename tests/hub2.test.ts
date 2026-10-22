// ACT 2'S TOWN HUB IN VELLUM, THE CAMP INSIDE THE GATE (art/hub2.ts, art/hub2_folk.ts, art/hub2_camp.ts; a mock-up behind
// HUB2, off). His word, by 11:30 Pacific, 22 Oct 2026, shown it moving: “Yes, send to main (Recommended)”.
//   1. the switch is off, and nothing of the game imports the hub's files;
//   2. the three switches it added to the game's own files are off and change nothing while off: the broken gate
//      (art/floor11.ts cityGate `held`), the Gate Ward's ground (art/gateward.ts `swept`), the Hushed (art/hushed.ts
//      HUSH_FREED); on, each does what it says;
//   3. the hub's pieces: each its own name, each frame painted; nothing of the enemy's on them (no pink, no gold glow),
//      what gives light an honest fire or the friend's cyan;
//   4. the camp's people: the Hushed with their voices back: no pink in their eyes, no Hush, no edge of light, sat;
//   5. the camp as he said yes to it: every piece one there is, every service named, everything on open ground.
//   run: tsx --test tests/hub2.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { hushSetPieces } from '../src/art/act2_set';
import { cityGate, gateWardPieces } from '../src/art/floor11';
import { gateWardLook, gateWardPaintFloor } from '../src/art/gateward';
import { HUB2, hubPieces } from '../src/art/hub2';
import { campPlace } from '../src/art/hub2_camp';
import { CAMP_FOLK, TALK_LONG, campFolkFrame } from '../src/art/hub2_folk';
import { BREATH_PALE, HUSH_FREED, HUSHED_CANVAS } from '../src/art/hushed';
import { HUSHED_PORTER } from '../src/art/hushed_moves';
import { CYAN, toSprite } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { paintMob } from '../src/art/new_mobs3';
import { EMBER } from '../src/art/props';
import { paintTerrain, terrainOf } from '../src/art/terrain';
import type { Sprite } from '../src/engine/px';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { each, hex } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const PINKS = new Set([...FLAME, '#b4306a', '#e86a98', '#7a1a4e', '#4a1236', '#ff4f8a', '#c0206a', '#7a1058'].map((c) => c.toLowerCase()));
const FIRES = new Set([...EMBER].map((c) => c.toLowerCase()));
const CYANS = new Set([...CYAN].map((c) => c.toLowerCase()));

// (TOLD, BY THE MAIN CHAT, 22 Oct 2026: the camp comes into the game behind EXITS, game/ways.ts, off: made only by game/camp.ts,
// asked for only while EXITS is on (Game.campTown); drawn by render.ts and render/act1_pieces.ts, its art chosen in main.ts.
// Those four are the only game files that import the hub's.)
const HUB_USERS = ['game/camp.ts', 'main.ts', 'render/act1_pieces.ts', 'render/render.ts'];
test('1. the switch is off, and nothing of the game imports the hub\'s files but the camp\'s own, behind EXITS', () => {
  assert.equal(HUB2.on, false, 'HUB2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/hub2(_folk|_camp)?\.ts$/.test(f)) continue;
    const text = fs.readFileSync(`src/${f}`, 'utf8');
    if (/from ['"][./a-z0-9_]*\/hub2(_folk|_camp)?['"]/.test(text)) users.push(f);
  }
  assert.equal(users.sort().join(' '), HUB_USERS.join(' '), 'game files that import the hub');
});

test('2. the switches it added to the game\'s files: off, and nothing changes; on, each does what it says', () => {
  // the broken gate: as the Gate Ward has it, unless held; held, the Order's banner and the dome's shard gone
  const broken = gateWardPieces().find((p) => p.name === 'the city gate, broken')!;
  for (const k of [0, 1]) {
    assert.equal(unlike(cityGate(k), broken.frames![k]), 0, `the gate, frame ${k}: as it was`);
    const held = cityGate(k, true);
    assert.ok(unlike(held, broken.frames![k]) > 0, `held, frame ${k}: changed`);
    assert.ok(!held.lights || held.lights.length === 0, 'held: no light of the dome\'s shard');
  }
  // the Hushed: HUSH_FREED off at rest, and off again after the camp's people are painted
  assert.equal(HUSH_FREED.on, false);
  const can = HUSHED_CANVAS;
  const before = toSprite(paintMob(HUSHED_PORTER, 'stand', 0.7, 'front'), null, can.ax, can.ay);
  campFolkFrame('porter', 0.5, 'front');
  assert.equal(HUSH_FREED.on, false, 'off again after');
  const after = toSprite(paintMob(HUSHED_PORTER, 'stand', 0.7, 'front'), null, can.ax, can.ay);
  assert.equal(unlike(before, after), 0, 'the Hushed painted as they were');
  // the Gate Ward's ground: `swept` unset is as it was; set, it changes the ground
  const W = 24;
  const tiles = new Uint8Array(W * W).fill(T_WALL);
  for (let y = 6; y < 18; y++) for (let x = 6; x < 18; x++) tiles[y * W + x] = T_FLOOR;
  const floor = { depth: 11, seed: 5, w: W, h: W, tiles, cut: new Uint8Array(W * W), variant: new Uint8Array(W * W), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
  const paint = (swept?: boolean): Uint8ClampedArray => {
    const land = { floor, zone: () => 1, squares: [], houses: [], ...(swept === undefined ? {} : { swept }) };
    const T = terrainOf(gateWardPaintFloor(land, 'open'), gateWardLook(land, 'open'));
    return paintTerrain(T, -200, 300, 400, 300).rgba;
  };
  const a = paint();
  const b = paint(false);
  const c = paint(true);
  let same = true;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) same = false;
    if (a[i] !== c[i]) diff++;
  }
  assert.ok(same, 'swept unset or false: the same ground');
  assert.ok(diff > 0, 'swept: the ground changed');
});

/** Every pixel's colour of a sprite, as hex. */
function colours(s: Sprite): Set<string> {
  const out = new Set<string>();
  each(s, (r, g, b, a) => {
    if (a > 0) out.add(hex(r, g, b));
  });
  return out;
}

test('3. the hub\'s pieces: each its own name, each frame painted; nothing of the enemy\'s; light only an honest fire or the friend\'s cyan', () => {
  const ps = hubPieces();
  const names = ps.map((p) => p.name);
  assert.equal(new Set(names).size, names.length, 'each its own name');
  for (const p of ps) {
    p.frames.forEach((sp, k) => {
      const cs = colours(sp);
      // (painted: something there; the chalk ring is chalk and little else, so a few colours may be all)
      let n = 0;
      each(sp, (_r, _g, _b, a) => {
        if (a > 0) n++;
      });
      assert.ok(cs.size > 0 && n > 20, `${p.name} ${k}: painted`);
      for (const c of cs) assert.ok(!PINKS.has(c), `${p.name} ${k}: the enemy's pink (${c})`);
      for (const L of sp.lights ?? []) {
        const c = L.color.toLowerCase();
        assert.ok(FIRES.has(c) || CYANS.has(c), `${p.name} ${k}: a light of ${c}`);
      }
    });
  }
});

test('4. the camp\'s people: the Hushed with their voices back: no pink in their eyes, no Hush, no edge of light; sat by the fire', () => {
  for (const who of ['porter', 'goodwife', 'baker'] as const) {
    assert.ok(CAMP_FOLK[who].stand.motion.keys.length > 2, `${who}: a talk`);
    for (const view of ['front', 'back'] as const) {
      for (const t of [0, TALK_LONG / 3, (2 * TALK_LONG) / 3]) {
        const sp = campFolkFrame(who, t, view);
        const cs = colours(sp);
        assert.ok(cs.size > 6, `${who} ${view} ${t}: painted`);
        for (const c of cs) {
          assert.ok(!PINKS.has(c), `${who} ${view} ${t}: the cult's pink (${c})`);
          assert.ok(c !== BREATH_PALE.toLowerCase(), `${who} ${view} ${t}: the Hush's breath`);
        }
        // sat: their picture no taller than four fifths of the Hushed standing
        let top = Infinity;
        let bottom = -Infinity;
        each(sp, (_r, _g, _b, a, _x, y) => {
          if (a > 0) {
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
          }
        });
        let top2 = Infinity;
        let bottom2 = -Infinity;
        const stood = toSprite(paintMob(HUSHED_PORTER, 'stand', 0.5, view), null, HUSHED_CANVAS.ax, HUSHED_CANVAS.ay);
        each(stood, (_r, _g, _b, a, _x, y) => {
          if (a > 0) {
            top2 = Math.min(top2, y);
            bottom2 = Math.max(bottom2, y);
          }
        });
        assert.ok(bottom - top < (bottom2 - top2) * 0.85, `${who} ${view}: sat (${bottom - top} tall, standing ${bottom2 - top2})`);
      }
    }
  }
});

test('5. the camp as he said yes to it: every piece one there is, every service named, everything on open ground', () => {
  const pl = campPlace(false);
  const pieces = new Map([...gateWardPieces(), ...hushSetPieces(), ...hubPieces()].map((p) => [p.name, p] as [string, { frames?: Sprite[]; left?: Sprite[]; right?: Sprite[] }]));
  for (const l of pl.dress) {
    const p = pieces.get(l.name);
    assert.ok(p, `no piece "${l.name}"`);
    const fr = l.on === 'left' ? p!.left : l.on === 'right' ? p!.right : p!.frames;
    assert.ok(fr && l.frame < fr.length, `${l.name}: frame ${l.frame}`);
  }
  const names = new Set(pl.labels.map((l) => l[0]));
  for (const n of ['GATE', 'ARMOURER', 'MYSTIC', 'WORDSMITH', 'LEXICON', 'STASH', 'STRANGER']) assert.ok(names.has(n), `the ${n} named`);
  const inR = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
  const open = (x: number, y: number): boolean => inR(pl.open, x, y) || pl.streets.some((r) => inR(r, x, y));
  for (const t of pl.town) assert.ok(open(t.x + 0.5, t.y + 0.5), `${t.kind} at (${t.x}, ${t.y}): on open ground`);
  for (const f of pl.folk ?? []) assert.ok(open(f.x, f.y), `${f.who}: on open ground`);
  for (const l of pl.dress) if (!l.on && l.name !== 'the city gate, held') assert.ok(open(l.x, l.y), `${l.name} at (${l.x}, ${l.y}): on open ground`);
  assert.ok(open(pl.hero[0], pl.hero[1]), 'the hero on open ground');
});
