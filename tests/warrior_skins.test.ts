// THE WARRIOR'S UNIQUE WEAPONS (art/sword_skins.ts: his great swords; art/heavy_skins.ts: his battle axes and warhammers; in the
// game behind art/heroes.ts WARRIOR_SKINS). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the
// cast”; shown the great swords on him: “Yes, all three (Recommended)”; the axes and hammers: “Yes, all seven (Recommended)”.
//   1. the switch is off; of the game only his art reads art/sword_skins.ts and art/heavy_skins.ts;
//   2. his own great sword and his war axe are the first skins, and painted with them he is the very frame he is painted as when
//      nothing is said;
//   3. each is a weapon of its own;
//   4. on: his ten unique weapons are worn only as the kind he is drawn with (a great sword while he holds his own, an axe or a
//      hammer once his tree has given him that weapon), each its own places in town and in a dungeon, its look that weapon, his
//      pictures there painted with it; each a bake group of its own;
//   5. on: his own sword's set and a unique sword's let go of as he swaps, and not by another hero's places.

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { readdirSync, readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
import { paintWu } from '../src/art/warrior_up_art';
import { WU_REAR3, WU_STRIKE3, WU_TOWN3 } from '../src/art/warrior_up_moves';
import { PLAIN_SWORD } from '../src/art/warrior_up';
import { SWORD_SKIN_LIST } from '../src/art/sword_skins';
import { AXE_SKIN_LIST, HAMMER_SKIN_LIST } from '../src/art/heavy_skins';
import { AXE } from '../src/art/warrior_up_axe_moves';
import { makeWarriorHeavyArt } from '../src/art/warrior_up_heavy_art';
import { WARRIOR_SKINS, WARRIOR_SKIN_IDS, WARRIOR_SKIN_KIND, WARRIOR_SKIN_PLACES, isTownPlace, lookOfPlace, warriorSkinOfPlace, warriorWorn, wornSkin } from '../src/art/heroes';
import type { HeroArt, HeroPlace } from '../src/art/heroes';
import { bakeLists, makeHeroArt3 } from '../src/art/heroes3';
import { BakedHeroes, bakeGroups, keyName, listLengths } from '../src/render/baked';
import { heroSides } from '../src/art/sides';
import type { AnimSet } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();

const px = (s: Sprite): Uint8ClampedArray => (s.img as unknown as { d: Uint8ClampedArray }).d;
const same = (a: { d: Uint8ClampedArray } | Uint8ClampedArray, b: { d: Uint8ClampedArray } | Uint8ClampedArray): boolean => {
  const x = 'd' in a ? a.d : a;
  const y = 'd' in b ? b.d : b;
  return x.length === y.length && x.every((v, k) => v === y[k]);
};
const u = (unique: string) => ({ rarity: 3, unique });

test('1. the switch is off; of the game only his art reads art/sword_skins.ts and art/heavy_skins.ts', () => {
  assert.equal(WARRIOR_SKINS.on, false);
  assert.equal(warriorWorn(u('millstone'), null), null);
  assert.equal(wornSkin('warrior', u('millstone')), null);
  assert.ok(!Object.keys(bakeGroups(true)).some((k) => (WARRIOR_SKIN_IDS as readonly string[]).includes(k.replace('warrior-', ''))), 'off: none baked');
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  for (const f of ['sword_skins', 'heavy_skins']) {
    const readers = walk('src').filter((x) => x !== `src/art/${f}.ts` && !x.startsWith('src/dev/') && new RegExp(`from '[^']*${f}'`).test(readFileSync(x, 'utf8'))).sort();
    assert.deepEqual(readers, ['src/art/heroes3.ts'], f);
  }
});

test('2. his own great sword and war axe are the first skins; painted with them he is the very frame he is as ever', () => {
  assert.equal(SWORD_SKIN_LIST[0], PLAIN_SWORD);
  assert.equal(AXE_SKIN_LIST[0], AXE);
  for (const [m, t] of [[WU_REAR3, 0.5], [WU_STRIKE3, 11 / 30], [WU_TOWN3, 0.4]] as const) {
    for (const side of ['front', 'sideL', 'backL'] as const) {
      const a = paintWu(m, t, side);
      const b = paintWu(m, t, side, undefined, PLAIN_SWORD);
      assert.ok(same(a.px, b.px), `${m.name} ${side}`);
      assert.deepEqual(a.lights, b.lights);
    }
  }
  const a = makeWarriorHeavyArt('axe', 'dungeon');
  const b = makeWarriorHeavyArt('axe', 'dungeon', AXE);
  for (const side of ['front', 'backL'] as const) assert.ok(same(px(a[side].idle[0]), px(b[side].idle[0])), side);
});

test('3. each is a weapon of its own', () => {
  const swords = SWORD_SKIN_LIST.map((sw) => paintWu(WU_REAR3, 0.5, 'front', undefined, sw).px);
  for (let i = 0; i < swords.length; i++) for (let j = i + 1; j < swords.length; j++) assert.ok(!same(swords[i], swords[j]), `${SWORD_SKIN_LIST[i].id} and ${SWORD_SKIN_LIST[j].id}`);
  for (const [kind, list] of [['axe', AXE_SKIN_LIST], ['hammer', HAMMER_SKIN_LIST]] as const) {
    const frames = list.map((t, j) => px(makeWarriorHeavyArt(kind, 'dungeon', j === 0 ? undefined : t).front.idle[0]));
    for (let i = 0; i < frames.length; i++) for (let j = i + 1; j < frames.length; j++) assert.ok(!same(frames[i], frames[j]), `${list[i].id} and ${list[j].id}`);
  }
});

test('4. on: worn only as the kind he is drawn with; their places, looks, his pictures with each, a bake group each', () => {
  WARRIOR_SKINS.on = true;
  try {
    assert.equal(warriorWorn(u('millstone'), null), 'millstone');
    assert.equal(warriorWorn(u('millstone'), 'axe'), null, 'a great sword while his tree has given him the axe: his axe');
    assert.equal(warriorWorn(u('gyre'), null), null, 'an axe while he holds his great sword: his sword');
    assert.equal(warriorWorn(u('gyre'), 'axe'), 'gyre');
    assert.equal(warriorWorn(u('starbreaker'), 'hammer'), 'starbreaker');
    assert.equal(warriorWorn(u('starbreaker'), 'axe'), null);
    assert.equal(warriorWorn({ rarity: 2, unique: 'millstone' }, null), null, 'a rare is no unique');
    assert.equal(wornSkin('mage', u('millstone')), null, 'not on the Mage');
    assert.deepEqual(wornSkin('warrior', u('redtithe'), 'axe'), { look: { warriorSkin: 'redtithe' }, places: WARRIOR_SKIN_PLACES.redtithe });
    for (const id of WARRIOR_SKIN_IDS) {
      const { town, dungeon } = WARRIOR_SKIN_PLACES[id];
      assert.equal(warriorSkinOfPlace(town), id);
      assert.equal(warriorSkinOfPlace(dungeon), id);
      const kind = WARRIOR_SKIN_KIND[id];
      assert.deepEqual(lookOfPlace(dungeon), { twoHanded: true, town: false, ...(kind ? { weapon: kind } : {}), warriorSkin: id });
      assert.ok(isTownPlace(town) && !isTownPlace(dungeon));
    }
    const art = makeHeroArt3();
    const own = art.of('warrior', lookOfPlace('dungeon'));
    const mill = art.of('warrior', lookOfPlace('millstone'));
    assert.notEqual(mill, own);
    assert.equal(JSON.stringify(listLengths(heroSides(mill))), JSON.stringify(listLengths(heroSides(own))));
    assert.ok(!same(px(heroSides(own)[0].idle[0]), px(heroSides(mill)[0].idle[0])), 'painted with Millstone');
    const axe = art.of('warrior', lookOfPlace('axe'));
    const gyre = art.of('warrior', lookOfPlace('gyre'));
    assert.notEqual(gyre, axe);
    assert.equal(JSON.stringify(listLengths(heroSides(gyre))), JSON.stringify(listLengths(heroSides(axe))), 'his axe\'s lists');
    assert.ok(!same(px(heroSides(axe)[0].idle[0]), px(heroSides(gyre)[0].idle[0])), 'painted with Gyre');
    const g = bakeGroups(true);
    for (const id of WARRIOR_SKIN_IDS) assert.deepEqual(g[`warrior-${id}`].map(keyName), [`warrior:${WARRIOR_SKIN_PLACES[id].town}`, `warrior:${WARRIOR_SKIN_PLACES[id].dungeon}`]);
    assert.deepEqual(g.warrior.map(keyName), ['warrior:town', 'warrior:dungeon']);
    const all = Object.values(g).flat().map(keyName);
    assert.equal(new Set(all).size, all.length, 'none twice');
  } finally {
    WARRIOR_SKINS.on = false;
  }
});

test('5. on: his own sword\'s set and a unique sword\'s let go of as he swaps; the Mage\'s are not his to let go', async () => {
  WARRIOR_SKINS.on = true;
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
    const placeOf = (look: { warriorSkin?: string; town?: boolean }): HeroPlace => (look.warriorSkin ? (look.town ? WARRIOR_SKIN_PLACES[look.warriorSkin as 'millstone'].town : WARRIOR_SKIN_PLACES[look.warriorSkin as 'millstone'].dungeon) : look.town ? 'town' : 'dungeon');
    const art = { of: (_cls: string, look: { warriorSkin?: string; town?: boolean }) => of(placeOf(look)) } as unknown as HeroArt;
    const give = (_cls: string, place: HeroPlace, v: number, l: number, i: number, sp: Sprite): boolean => {
      const list = bakeLists(heroSides(of(place) as never)[v])[l];
      const d = Object.getOwnPropertyDescriptor(list, i);
      if (!d || typeof d.get !== 'function') return false;
      Object.defineProperty(list, i, { value: sp, writable: true, configurable: true, enumerable: true });
      return true;
    };
    const fileOf = (group: string) => {
      const keys = group === 'warrior' ? ['town', 'dungeon'] : [WARRIOR_SKIN_PLACES[group.slice(8) as 'millstone'].town, WARRIOR_SKIN_PLACES[group.slice(8) as 'millstone'].dungeon];
      return { mark: 'abc', group, sheets: [`${group}-0.png`], frames: [[0, 0, 0, 1, 1, 0]], parts: [{ w: 1, h: 1, ax: 0, ay: 0 }], keys: keys.map((place) => ({ cls: 'warrior', place, vet: false, lens: listLengths(heroSides(of(place as HeroPlace) as never)), at: [0, 0, 0, 0] })) };
    };
    const get = async (name: string) => (name.endsWith('.json') ? ({ ok: true, json: async () => fileOf(name.replace('.json', '')) }) : ({ ok: true, blob: async () => new Blob([]) })) as unknown as Response;
    const b = new BakedHeroes('abc', () => art, give as never, false, get);
    const settle = async (g: string) => {
      for (let i = 0; i < 200 && !b.settled(g); i++) await new Promise((r) => setTimeout(r, 2));
      assert.ok(b.done(g), `${g}: come (${b.stats.failed.join('; ')})`);
    };
    const first = (place: HeroPlace) => Object.getOwnPropertyDescriptor(bakeLists(heroSides(of(place) as never)[0])[0], 0)!;
    assert.equal(b.take('warrior', 'town', false), true);
    await settle('warrior');
    assert.ok('value' in first('town'));
    b.holdOnly('warrior', 'millstoneTown', false);
    assert.equal(typeof first('town').get, 'function', 'his own sword\'s put back');
    assert.equal(closed, 1);
    assert.equal(b.take('warrior', 'millstoneTown', false), true);
    await settle('warrior-millstone');
    assert.ok('value' in first('millstoneTown'));
    b.holdOnly('mage', 'crookTown', false);
    assert.ok('value' in first('millstoneTown'), 'still his');
  } finally {
    WARRIOR_SKINS.on = false;
    g0.createImageBitmap = had;
  }
});
