// THE MAGE'S UNIQUE STAVES IN HER HANDS (art/staff_skins.ts STAFF_SKINS, on at his yes, 14 Nov 2026: “Yes, switch them on
// (Recommended)”): which staff she holds picks her pictures, each
// staff's a set of its own, baked whole (his pick, 14 Nov 2026: “Bake each staff whole (Recommended)”), and only the set of the
// staff she holds is kept (render/baked.ts letGoGroup, holdOnly).
//   1. the switch is on; with it off nothing changes: no staff is worn, no staff's group is baked;
//   2. the four unique staves of the game are worn, each its own place in town and in a dungeon, its look that staff;
//   3. her pictures in a staff's place are painted with that staff (a frame of hers with it, not as with another);
//   4. each staff a bake group of its own, her in town and in a dungeon with it;
//   5. a staff's set let go of: its places put back as they were, its sheets closed, and taken in again when asked;
//      holding another staff lets the last one's go.

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { paintWithoutCanvas } from './helpers';
import { STAFF_SKINS, STAFF_SKIN_OF, staffWorn } from '../src/art/staff_skins';
import { STAFF_IDS, STAFF_PLACES, isTownPlace, lookOfPlace, staffOfPlace } from '../src/art/heroes';
import type { HeroArt, HeroPlace } from '../src/art/heroes';
import { makeHeroArt3, bakeLists } from '../src/art/heroes3';
import { BakedHeroes, bakeGroups, keyName, listLengths } from '../src/render/baked';
import { heroSides } from '../src/art/sides';
import type { AnimSet } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();

const uniqueStaff = (unique: string) => ({ rarity: 3, unique });

test('1. the switch is on; with it off nothing changes: no staff is worn, no staff\'s group is baked', () => {
  assert.equal(STAFF_SKINS.on, true);
  STAFF_SKINS.on = false;
  try {
    assert.equal(staffWorn(uniqueStaff('shepherdscrook')), null);
    assert.ok(!Object.keys(bakeGroups(true)).some((g) => g.startsWith('mage-')));
  } finally {
    STAFF_SKINS.on = true;
  }
});

test('2. on: the four unique staves of the game are worn, each its own place in town and in a dungeon, its look that staff', () => {
  STAFF_SKINS.on = true;
  try {
    assert.deepEqual(['shepherdscrook', 'tide', 'tuningstaff', 'kindlingrod'].map((u) => staffWorn(uniqueStaff(u))), ['crook', 'ebb', 'resonance', 'rod']);
    assert.equal(staffWorn({ rarity: 2, unique: 'tide' }), null, 'a rare is no unique');
    assert.equal(staffWorn(uniqueStaff('kingslayer')), null, 'another unique: her own staff');
    assert.equal(staffWorn(null), null);
    for (const id of STAFF_IDS) {
      const { town, dungeon } = STAFF_PLACES[id];
      assert.equal(staffOfPlace(town), id);
      assert.equal(staffOfPlace(dungeon), id);
      assert.deepEqual(lookOfPlace(town), { twoHanded: true, town: true, staff: id });
      assert.deepEqual(lookOfPlace(dungeon), { twoHanded: true, town: false, staff: id });
      assert.ok(isTownPlace(town) && !isTownPlace(dungeon));
      assert.ok(STAFF_SKIN_OF[id], `${id}: a skin`);
    }
    assert.equal(staffOfPlace('dungeon'), null);
  } finally {
    STAFF_SKINS.on = true;
  }
});

test('3. her pictures in a staff\'s place are painted with that staff', () => {
  const art = makeHeroArt3();
  const frame = (place: HeroPlace) => {
    const a = art.of('mage', lookOfPlace(place));
    return { a, s: heroSides(a)[0].idle[0] };
  };
  const plain = frame('dungeon');
  const px = (s: Sprite) => (s.img as unknown as { d: Uint8ClampedArray }).d;
  const seen: Uint8ClampedArray[] = [px(plain.s)];
  for (const id of ['crook', 'rod'] as const) {
    const f = frame(STAFF_PLACES[id].dungeon);
    assert.notEqual(f.a, plain.a);
    assert.equal(JSON.stringify(listLengths(heroSides(f.a))), JSON.stringify(listLengths(heroSides(plain.a))), `${id}: her lists, the same`);
    const d = px(f.s);
    for (const o of seen) assert.ok(d.length !== o.length || d.some((v, k) => v !== o[k]), `${id}: a staff of its own`);
    seen.push(d);
  }
});

test('4. on: each staff a bake group of its own, her in town and in a dungeon with it', () => {
  STAFF_SKINS.on = true;
  try {
    const g = bakeGroups(true);
    for (const id of STAFF_IDS) assert.deepEqual(g[`mage-${id}`].map(keyName), [`mage:${STAFF_PLACES[id].town}`, `mage:${STAFF_PLACES[id].dungeon}`]);
    assert.deepEqual(g.mage.map(keyName), ['mage:town', 'mage:dungeon'], 'her own staff\'s as ever');
    const all = Object.values(g).flat().map(keyName);
    assert.equal(new Set(all).size, all.length, 'none twice');
  } finally {
    STAFF_SKINS.on = true;
  }
});

test('5. a staff\'s set let go of: its places put back, its sheets closed, taken in again when asked; another staff lets the last go', async () => {
  STAFF_SKINS.on = true;
  const g0 = globalThis as unknown as { createImageBitmap?: unknown };
  const had = g0.createImageBitmap;
  let closed = 0;
  g0.createImageBitmap = async () => ({ width: 8, height: 8, close: () => { closed++; } });
  try {
    // (a fake Mage: two sides, lists of lazy frames, as the game's art has them)
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
    const art = { of: (_cls: string, look: { staff?: string; town?: boolean }) => of((look.staff ? (look.town ? STAFF_PLACES[look.staff as 'crook'].town : STAFF_PLACES[look.staff as 'crook'].dungeon) : look.town ? 'town' : 'dungeon') as HeroPlace) } as unknown as HeroArt;
    const give = (_cls: string, place: HeroPlace, v: number, l: number, i: number, s: Sprite): boolean => {
      const list = bakeLists(heroSides(of(place) as never)[v])[l];
      const d = Object.getOwnPropertyDescriptor(list, i);
      if (!d || typeof d.get !== 'function') return false;
      Object.defineProperty(list, i, { value: s, writable: true, configurable: true, enumerable: true });
      return true;
    };
    const fileOf = (group: string) => {
      const keys = group === 'mage' ? ['town', 'dungeon'] : [STAFF_PLACES[group.slice(5) as 'crook'].town, STAFF_PLACES[group.slice(5) as 'crook'].dungeon];
      return { mark: 'abc', group, sheets: [`${group}-0.png`], frames: [[0, 0, 0, 1, 1, 0]], parts: [{ w: 1, h: 1, ax: 0, ay: 0 }], keys: keys.map((place) => ({ cls: 'mage', place, vet: false, lens: listLengths(heroSides(of(place as HeroPlace) as never)), at: [0, 0, 0, 0] })) };
    };
    const get = async (name: string) => (name.endsWith('.json') ? ({ ok: true, json: async () => fileOf(name.replace('.json', '')) }) : ({ ok: true, blob: async () => new Blob([]) })) as unknown as Response;
    const b = new BakedHeroes('abc', () => art, give as never, false, get);
    const settle = async (g: string) => {
      for (let i = 0; i < 200 && !b.settled(g); i++) await new Promise((r) => setTimeout(r, 2));
      assert.ok(b.done(g), `${g}: come (${b.stats.failed.join('; ')})`);
    };
    const first = (place: HeroPlace) => Object.getOwnPropertyDescriptor(bakeLists(heroSides(of(place) as never)[0])[0], 0)!;
    assert.equal(b.take('mage', 'crookTown', false), true);
    await settle('mage-crook');
    assert.ok('value' in first('crookTown'), 'given');
    // (she takes up the Rod: the Crook's set let go of, its place as it was, its sheet closed)
    b.holdOnly('mage', 'rodTown', false);
    assert.equal(typeof first('crookTown').get, 'function', 'put back');
    assert.equal(closed, 1);
    assert.equal(b.done('mage-crook'), false);
    assert.equal(b.take('mage', 'rodTown', false), true);
    await settle('mage-rod');
    // (and back to the Crook: taken in again)
    b.holdOnly('mage', 'crook', false);
    assert.equal(b.take('mage', 'crook', false), true);
    await settle('mage-crook');
    assert.ok('value' in first('crook'));
    assert.equal(typeof Object.getOwnPropertyDescriptor(bakeLists(heroSides(of('rodTown') as never)[0])[0], 0)!.get, 'function', 'the Rod\'s let go of');
  } finally {
    STAFF_SKINS.on = true;
    g0.createImageBitmap = had;
  }
});
