// THE TINKERER'S UNIQUE WRENCHES (art/wrench_skins.ts; dev/sculpt_tinkerer.ts WrenchSkin, PLAIN_WRENCH; in the game behind
// art/heroes.ts WRENCH_SKINS). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; shown
// the four wrenches on her: “Yes, all four (Recommended)”.
//   1. the switch is off; of the game only her art reads art/wrench_skins.ts;
//   2. her own wrench is the first skin, and painted with it she is the very frame she is painted as when nothing is said;
//   3. each wrench is a wrench of its own;
//   4. on: the four unique wrenches of the game are worn, each its own places in town and in a dungeon, its look that wrench,
//      and her pictures there painted with it; each a bake group of its own;
//   5. on: her own wrench's set and a wrench's let go of as she swaps (render/baked.ts holdOnly), and not by another hero's places.
// (Her own wrench painted exactly as before was checked over 528 frames, every fifth of every list from her eight sides, 14 Nov
// 2026: here a sample.)

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { readdirSync, readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
import { makeTinkererArt } from '../src/art/tinkerer_art';
import { PLAIN_WRENCH } from '../src/dev/sculpt_tinkerer';
import { WRENCH_SKIN_LIST, WRENCH_SKIN_OF } from '../src/art/wrench_skins';
import { WRENCH_IDS, WRENCH_PLACES, WRENCH_SKINS, isTownPlace, lookOfPlace, wornSkin, wrenchOfPlace, wrenchWorn } from '../src/art/heroes';
import type { HeroArt, HeroPlace } from '../src/art/heroes';
import { bakeLists, makeHeroArt3 } from '../src/art/heroes3';
import { BakedHeroes, bakeGroups, keyName, listLengths } from '../src/render/baked';
import { heroSides } from '../src/art/sides';
import type { AnimSet } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();

const px = (s: Sprite): Uint8ClampedArray => (s.img as unknown as { d: Uint8ClampedArray }).d;
const same = (a: Uint8ClampedArray, b: Uint8ClampedArray): boolean => a.length === b.length && a.every((v, k) => v === b[k]);
/** A few frames of her, as the game holds them: standing from three sides, her tap, her whistle, running. */
const sample = (art: ReturnType<typeof makeTinkererArt>): Sprite[] => {
  const sides = heroSides(art);
  return [sides[0].idle[0], sides[2 % sides.length].idle[3], sides[4 % sides.length].idle[0], sides[0].clips!.attack!.frames[4], sides[0].clips!.heavy!.frames[10], sides[1 % sides.length].walk[3]];
};

test('1. the switch is off; of the game only her art reads art/wrench_skins.ts', () => {
  assert.equal(WRENCH_SKINS.on, false);
  assert.equal(wrenchWorn({ rarity: 3, unique: 'stickywrench' }), null);
  assert.equal(wornSkin('tinkerer', { rarity: 3, unique: 'stickywrench' }), null);
  assert.ok(!Object.keys(bakeGroups(true)).some((k) => k.startsWith('tinkerer-')), 'off: none baked');
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  const readers = walk('src').filter((f) => f !== 'src/art/wrench_skins.ts' && !f.startsWith('src/dev/') && /from '[^']*wrench_skins'/.test(readFileSync(f, 'utf8'))).sort();
  assert.deepEqual(readers, ['src/art/heroes3.ts']);
});

test('2. her own wrench is the first skin; painted with it she is the very frame she is painted as when nothing is said', () => {
  assert.equal(WRENCH_SKIN_LIST[0], PLAIN_WRENCH);
  assert.deepEqual(WRENCH_SKIN_LIST.map((w) => w.id), ['plain', 'secondwhistle', 'stickywrench', 'foremanswrench', 'borrowedspanner']);
  const a = sample(makeTinkererArt());
  const b = sample(makeTinkererArt(PLAIN_WRENCH));
  a.forEach((s, i) => assert.ok(same(px(s), px(b[i])), `frame ${i}`));
});

test('3. each wrench is a wrench of its own', () => {
  const all = WRENCH_SKIN_LIST.map((w, j) => sample(makeTinkererArt(j === 0 ? undefined : w)));
  for (let f = 0; f < all[0].length; f++) {
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      // (from behind her wrench may be all but hidden: there two may be the same; standing from in front, never)
      if (f === 2) continue;
      assert.ok(!same(px(all[i][f]), px(all[j][f])), `${WRENCH_SKIN_LIST[i].id} and ${WRENCH_SKIN_LIST[j].id}, frame ${f}`);
    }
  }
});

test('4. on: the four unique wrenches worn, their places and looks, her pictures painted with each, a bake group each', () => {
  WRENCH_SKINS.on = true;
  try {
    assert.deepEqual(['secondwhistle', 'stickywrench', 'foremanswrench', 'borrowedspanner'].map((u) => wrenchWorn({ rarity: 3, unique: u })), ['secondwhistle', 'stickywrench', 'foremanswrench', 'borrowedspanner']);
    assert.equal(wrenchWorn({ rarity: 2, unique: 'stickywrench' }), null, 'a rare is no unique');
    assert.equal(wornSkin('mage', { rarity: 3, unique: 'stickywrench' }), null, 'not on the Mage');
    assert.deepEqual(wornSkin('tinkerer', { rarity: 3, unique: 'foremanswrench' }), { look: { wrench: 'foremanswrench' }, places: WRENCH_PLACES.foremanswrench });
    for (const id of WRENCH_IDS) {
      const { town, dungeon } = WRENCH_PLACES[id];
      assert.equal(wrenchOfPlace(town), id);
      assert.equal(wrenchOfPlace(dungeon), id);
      assert.deepEqual(lookOfPlace(town), { twoHanded: true, town: true, wrench: id });
      assert.deepEqual(lookOfPlace(dungeon), { twoHanded: true, town: false, wrench: id });
      assert.ok(isTownPlace(town) && !isTownPlace(dungeon));
      assert.ok(WRENCH_SKIN_OF[id]);
    }
    const art = makeHeroArt3();
    const plain = art.of('tinkerer', lookOfPlace('dungeon'));
    const tar = art.of('tinkerer', lookOfPlace('stickywrench'));
    assert.notEqual(tar, plain);
    assert.equal(art.of('tinkerer', lookOfPlace('stickywrenchTown')), tar, 'one set of her for town and a dungeon, as her own');
    assert.equal(JSON.stringify(listLengths(heroSides(tar))), JSON.stringify(listLengths(heroSides(plain))));
    assert.ok(!same(px(heroSides(plain)[0].idle[0]), px(heroSides(tar)[0].idle[0])), 'painted with Tarwrench');
    const g = bakeGroups(true);
    for (const id of WRENCH_IDS) assert.deepEqual(g[`tinkerer-${id}`].map(keyName), [`tinkerer:${WRENCH_PLACES[id].town}`, `tinkerer:${WRENCH_PLACES[id].dungeon}`]);
    assert.deepEqual(g.tinkerer.map(keyName), ['tinkerer:town', 'tinkerer:dungeon']);
    const all = Object.values(g).flat().map(keyName);
    assert.equal(new Set(all).size, all.length, 'none twice');
  } finally {
    WRENCH_SKINS.on = false;
  }
});

test('5. on: her own wrench\'s set and a unique wrench\'s let go of as she swaps; the Ranger\'s are not hers to let go', async () => {
  WRENCH_SKINS.on = true;
  const g0 = globalThis as unknown as { createImageBitmap?: unknown };
  const had = g0.createImageBitmap;
  let closed = 0;
  g0.createImageBitmap = async () => ({ width: 8, height: 8, close: () => { closed++; } });
  try {
    const arts = new Map<string, { front: AnimSet; back: AnimSet }>();
    const lazy = (n: number): Sprite[] => {
      const l: Sprite[] = [];
      for (let i = 0; i < n; i++) Object.defineProperty(l, i, { configurable: true, enumerable: true, get: () => ({ painted: true }) as unknown as Sprite });
      l.length = n;
      return l;
    };
    const set = (): AnimSet => ({ idle: lazy(2), walk: lazy(2), attack: lazy(1), heavy: lazy(1), idleFps: 1, walkFps: 1 }) as unknown as AnimSet;
    const of = (place: HeroPlace) => {
      let a = arts.get(place);
      if (!a) arts.set(place, (a = { front: set(), back: set() }));
      return a;
    };
    const placeOf = (look: { wrench?: string; town?: boolean }): HeroPlace => (look.wrench ? (look.town ? WRENCH_PLACES[look.wrench as 'stickywrench'].town : WRENCH_PLACES[look.wrench as 'stickywrench'].dungeon) : look.town ? 'town' : 'dungeon');
    const art = { of: (_cls: string, look: { wrench?: string; town?: boolean }) => of(placeOf(look)) } as unknown as HeroArt;
    const give = (_cls: string, place: HeroPlace, v: number, l: number, i: number, sp: Sprite): boolean => {
      const list = bakeLists(heroSides(of(place) as never)[v])[l];
      const d = Object.getOwnPropertyDescriptor(list, i);
      if (!d || typeof d.get !== 'function') return false;
      Object.defineProperty(list, i, { value: sp, writable: true, configurable: true, enumerable: true });
      return true;
    };
    const fileOf = (group: string) => {
      const keys = group === 'tinkerer' ? ['town', 'dungeon'] : [WRENCH_PLACES[group.slice(9) as 'stickywrench'].town, WRENCH_PLACES[group.slice(9) as 'stickywrench'].dungeon];
      return { mark: 'abc', group, sheets: [`${group}-0.png`], frames: [[0, 0, 0, 1, 1, 0]], parts: [{ w: 1, h: 1, ax: 0, ay: 0 }], keys: keys.map((place) => ({ cls: 'tinkerer', place, vet: false, lens: listLengths(heroSides(of(place as HeroPlace) as never)), at: [0, 0, 0, 0] })) };
    };
    const get = async (name: string) => (name.endsWith('.json') ? ({ ok: true, json: async () => fileOf(name.replace('.json', '')) }) : ({ ok: true, blob: async () => new Blob([]) })) as unknown as Response;
    const b = new BakedHeroes('abc', () => art, give as never, false, get);
    const settle = async (g: string) => {
      for (let i = 0; i < 200 && !b.settled(g); i++) await new Promise((r) => setTimeout(r, 2));
      assert.ok(b.done(g), `${g}: come (${b.stats.failed.join('; ')})`);
    };
    const first = (place: HeroPlace) => Object.getOwnPropertyDescriptor(bakeLists(heroSides(of(place) as never)[0])[0], 0)!;
    assert.equal(b.take('tinkerer', 'town', false), true);
    await settle('tinkerer');
    assert.ok('value' in first('town'));
    b.holdOnly('tinkerer', 'stickywrenchTown', false);
    assert.equal(typeof first('town').get, 'function', 'her own wrench\'s put back');
    assert.equal(closed, 1);
    assert.equal(b.take('tinkerer', 'stickywrenchTown', false), true);
    await settle('tinkerer-stickywrench');
    assert.ok('value' in first('stickywrenchTown'));
    b.holdOnly('ranger', 'rainwalkerTown', false);
    assert.ok('value' in first('stickywrenchTown'), 'still hers');
  } finally {
    WRENCH_SKINS.on = false;
    g0.createImageBitmap = had;
  }
});
