// THE RANGER'S UNIQUE BOWS (art/bow_skins.ts; art/ranger_up.ts BowSkin, PLAIN_BOW; in the game behind art/heroes.ts BOW_SKINS).
// His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; shown the four bows on him:
// “Yes, all four (Recommended)”.
//   1. the switch is on (his yes to him in play: “Yes, switch them on (Recommended)”); off, no bow is worn and none baked; of the
//      game only his art reads art/bow_skins.ts;
//   2. his own bow is the first skin, and painted with it he is the very frame he is painted as when nothing is said;
//   3. each bow is a bow of its own, and nothing of it glows: his lights with it are his own bow's;
//   4. on: the four unique bows of the game are worn, each its own places in town and in a dungeon, its look that bow, and his
//      pictures there painted with it; each a bake group of its own;
//   5. on: his own bow's set and a bow's let go of as he swaps (render/baked.ts holdOnly), and not by another hero's places.
// (His own bow painted exactly as before was checked over 1000 frames, his twenty moves from eight sides, 14 Nov 2026: here a
// sample.)

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { readdirSync, readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
import { paintRuMove } from '../src/art/ranger_up_art';
import { RU_SHOT3, RU_STAND3, RU_TOWN3 } from '../src/art/ranger_up_moves';
import { PLAIN_BOW } from '../src/art/ranger_up';
import { BOW_SKIN_LIST, BOW_SKIN_OF, THREEFOLD_BOW } from '../src/art/bow_skins';
import { BOW_IDS, BOW_PLACES, BOW_SKINS, bowOfPlace, bowWorn, isTownPlace, lookOfPlace, wornSkin } from '../src/art/heroes';
import type { HeroPlace } from '../src/art/heroes';
import { makeHeroArt3 } from '../src/art/heroes3';
import { BakedHeroes, bakeGroups, keyName, listLengths } from '../src/render/baked';
import { bakeLists } from '../src/art/heroes3';
import type { HeroArt } from '../src/art/heroes';
import type { AnimSet } from '../src/art/actor_types';
import { heroSides } from '../src/art/sides';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();

const same = (a: { d: Uint8ClampedArray }, b: { d: Uint8ClampedArray }): boolean => a.d.length === b.d.length && a.d.every((v, k) => v === b.d[k]);

test('1. the switch is on (his yes); off, no bow is worn; of the game only his art reads art/bow_skins.ts', () => {
  assert.equal(BOW_SKINS.on, true);
  BOW_SKINS.on = false;
  try {
    assert.equal(bowWorn({ rarity: 3, unique: 'rainwalker' }), null);
    assert.equal(wornSkin('ranger', { rarity: 3, unique: 'rainwalker' }), null);
    assert.ok(!Object.keys(bakeGroups(true)).some((k) => k.startsWith('ranger-')), 'off: none baked');
  } finally {
    BOW_SKINS.on = true;
  }
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  const readers = walk('src').filter((f) => f !== 'src/art/bow_skins.ts' && !f.startsWith('src/dev/') && /from '[^']*bow_skins'/.test(readFileSync(f, 'utf8'))).sort();
  assert.deepEqual(readers, ['src/art/heroes3.ts']);
});

test('2. his own bow is the first skin; painted with it he is the very frame he is painted as when nothing is said', () => {
  assert.equal(BOW_SKIN_LIST[0], PLAIN_BOW);
  assert.deepEqual(BOW_SKIN_LIST.map((b) => b.id), ['plain', 'rainwalker', 'threefold', 'poachers', 'fledgling']);
  for (const [m, t] of [[RU_STAND3, 0.5], [RU_SHOT3, 9 / 30], [RU_TOWN3, 0.4]] as const) {
    for (const side of ['front', 'sideL', 'backL'] as const) {
      const a = paintRuMove(m, t, side);
      const b = paintRuMove(m, t, side, undefined, PLAIN_BOW);
      assert.ok(same(a.px, b.px), `${m.name} ${t} ${side}`);
      assert.deepEqual(a.lights, b.lights);
    }
  }
});

test('3. each bow is a bow of its own, and nothing of it glows', () => {
  for (const [m, t, side] of [[RU_STAND3, 0.5, 'front'], [RU_SHOT3, 9 / 30, 'side'], [RU_TOWN3, 0.4, 'frontL']] as const) {
    const frames = BOW_SKIN_LIST.map((b) => paintRuMove(m, t, side, undefined, b));
    for (let i = 0; i < frames.length; i++) for (let j = i + 1; j < frames.length; j++) assert.ok(!same(frames[i].px, frames[j].px), `${BOW_SKIN_LIST[i].id} and ${BOW_SKIN_LIST[j].id}, ${m.name} ${side}`);
    for (const f of frames.slice(1)) assert.deepEqual(f.lights, frames[0].lights, `${m.name} ${side}: his own lights`);
  }
  assert.deepEqual(THREEFOLD_BOW.fan, [0, -24, 24]);
});

test('4. on: the four unique bows worn, their places and looks, his pictures painted with each, a bake group each, let go of as he swaps', () => {
  BOW_SKINS.on = true;
  try {
    assert.deepEqual(['rainwalker', 'fan', 'poachersbow', 'fledgling'].map((u) => bowWorn({ rarity: 3, unique: u })), ['rainwalker', 'threefold', 'poachers', 'fledgling']);
    assert.equal(bowWorn({ rarity: 2, unique: 'fan' }), null, 'a rare is no unique');
    assert.equal(bowWorn({ rarity: 3, unique: 'tide' }), null, "the Mage's staff: his own bow");
    assert.equal(wornSkin('mage', { rarity: 3, unique: 'rainwalker' }), null, 'not on the Mage');
    assert.deepEqual(wornSkin('ranger', { rarity: 3, unique: 'fan' }), { look: { bow: 'threefold' }, places: BOW_PLACES.threefold });
    for (const id of BOW_IDS) {
      const { town, dungeon } = BOW_PLACES[id];
      assert.equal(bowOfPlace(town), id);
      assert.equal(bowOfPlace(dungeon), id);
      assert.deepEqual(lookOfPlace(town), { twoHanded: true, town: true, bow: id });
      assert.deepEqual(lookOfPlace(dungeon), { twoHanded: true, town: false, bow: id });
      assert.ok(isTownPlace(town) && !isTownPlace(dungeon));
      assert.ok(BOW_SKIN_OF[id]);
    }
    // (his art in a bow's place: painted with it, its lists his own's)
    const art = makeHeroArt3();
    const plain = art.of('ranger', lookOfPlace('dungeon'));
    const rain = art.of('ranger', lookOfPlace('rainwalker'));
    assert.notEqual(rain, plain);
    assert.equal(JSON.stringify(listLengths(heroSides(rain))), JSON.stringify(listLengths(heroSides(plain))));
    const px = (s: Sprite) => (s.img as unknown as { d: Uint8ClampedArray }).d;
    const a = px(heroSides(plain)[0].idle[0]);
    const b = px(heroSides(rain)[0].idle[0]);
    assert.ok(a.length !== b.length || a.some((v, k) => v !== b[k]), 'painted with the Rainwalker');
    // (a bake group each, his own bow's as ever)
    const g = bakeGroups(true);
    for (const id of BOW_IDS) assert.deepEqual(g[`ranger-${id}`].map(keyName), [`ranger:${BOW_PLACES[id].town}`, `ranger:${BOW_PLACES[id].dungeon}`]);
    assert.deepEqual(g.ranger.map(keyName), ['ranger:town', 'ranger:dungeon']);
    const all = Object.values(g).flat().map(keyName);
    assert.equal(new Set(all).size, all.length, 'none twice');
  } finally {
    BOW_SKINS.on = true;
  }
});

test('5. on: his own bow\'s set and a unique bow\'s let go of as he swaps; the Mage\'s are not his to let go', async () => {
  BOW_SKINS.on = true;
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
    const placeOf = (look: { bow?: string; town?: boolean }): HeroPlace => (look.bow ? (look.town ? BOW_PLACES[look.bow as 'threefold'].town : BOW_PLACES[look.bow as 'threefold'].dungeon) : look.town ? 'town' : 'dungeon');
    const art = { of: (_cls: string, look: { bow?: string; town?: boolean }) => of(placeOf(look)) } as unknown as HeroArt;
    const give = (_cls: string, place: HeroPlace, v: number, l: number, i: number, sp: Sprite): boolean => {
      const list = bakeLists(heroSides(of(place) as never)[v])[l];
      const d = Object.getOwnPropertyDescriptor(list, i);
      if (!d || typeof d.get !== 'function') return false;
      Object.defineProperty(list, i, { value: sp, writable: true, configurable: true, enumerable: true });
      return true;
    };
    const fileOf = (group: string) => {
      const keys = group === 'ranger' ? ['town', 'dungeon'] : [BOW_PLACES[group.slice(7) as 'threefold'].town, BOW_PLACES[group.slice(7) as 'threefold'].dungeon];
      return { mark: 'abc', group, sheets: [`${group}-0.png`], frames: [[0, 0, 0, 1, 1, 0]], parts: [{ w: 1, h: 1, ax: 0, ay: 0 }], keys: keys.map((place) => ({ cls: 'ranger', place, vet: false, lens: listLengths(heroSides(of(place as HeroPlace) as never)), at: [0, 0, 0, 0] })) };
    };
    const get = async (name: string) => (name.endsWith('.json') ? ({ ok: true, json: async () => fileOf(name.replace('.json', '')) }) : ({ ok: true, blob: async () => new Blob([]) })) as unknown as Response;
    const b = new BakedHeroes('abc', () => art, give as never, false, get);
    const settle = async (g: string) => {
      for (let i = 0; i < 200 && !b.settled(g); i++) await new Promise((r) => setTimeout(r, 2));
      assert.ok(b.done(g), `${g}: come (${b.stats.failed.join('; ')})`);
    };
    const first = (place: HeroPlace) => Object.getOwnPropertyDescriptor(bakeLists(heroSides(of(place) as never)[0])[0], 0)!;
    // (his own bow first, then Threefold put on: his own bow's set let go of)
    assert.equal(b.take('ranger', 'town', false), true);
    await settle('ranger');
    assert.ok('value' in first('town'));
    b.holdOnly('ranger', 'threefoldTown', false);
    assert.equal(typeof first('town').get, 'function', 'his own bow\'s put back');
    assert.equal(closed, 1);
    assert.equal(b.take('ranger', 'threefoldTown', false), true);
    await settle('ranger-threefold');
    assert.ok('value' in first('threefoldTown'));
    // (the Mage's places do not let his go)
    b.holdOnly('mage', 'crookTown', false);
    assert.ok('value' in first('threefoldTown'), 'still his');
  } finally {
    BOW_SKINS.on = true;
    g0.createImageBitmap = had;
  }
});
