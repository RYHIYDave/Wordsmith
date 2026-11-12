// THE HEROES BAKED (render/baked.ts; his pick, 6 Nov 2026: “Inside the game file”): what is baked and where it goes. That the
// pictures themselves are as painted is checked as they are baked, every pixel of every frame (tools/bake_heroes.mjs, check);
// that a run takes them in, in a browser (tools/scenarios/baked.mjs).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BAKED, BakedHeroes, bakeGroups, bakeMark, bakedFirst, bakedPlaces, keyName, listLengths } from '../src/render/baked';
import { READY_LIST } from '../src/art/heroes3';
import type { AnimSet } from '../src/art/actor_types';
import type { HeroArt } from '../src/art/heroes';

const fake = (n: number): AnimSet => {
  const f = (k: number): never[] => Array.from({ length: k }, () => ({}) as never);
  return { idle: f(n), walk: f(n + 1), attack: { frames: f(3) }, heavy: { frames: f(2) }, idleFps: 1, walkFps: 1 } as unknown as AnimSet;
};

test('every hero in every place the painter paints him is in one group, and the cards are one', () => {
  const g = bakeGroups(true);
  assert.deepEqual(g.cards.map(keyName), ['warrior:card', 'ranger:card', 'mage:card', 'warlock:card', 'tinkerer:card', 'brawler:card:vet']);
  assert.deepEqual(g.warlock.map(keyName), ['warlock:town', 'warlock:dungeon', 'warlock:demon', 'warlock:blaze']);
  assert.deepEqual(g.brawler.map(keyName), ['brawler:town:vet', 'brawler:dungeon:vet']);
  const all = Object.values(g).flat().map(keyName);
  assert.equal(new Set(all).size, all.length, 'none twice');
  assert.deepEqual(bakeGroups(false).brawler.map(keyName), ['brawler:town', 'brawler:dungeon'], 'the Brawler as he was, with the Veteran off');
});

test('every frame of a hero has its place once, standing and running first; a card everything a card shows, of the front', () => {
  const front = fake(4);
  const back = fake(4);
  const lens = listLengths([front, back]);
  const total = lens.flat().reduce((a, b) => a + b, 0);
  const at = bakedPlaces([front, back], false);
  assert.equal(at.length, total);
  assert.equal(new Set(at.map((p) => p.join(':'))).size, total, 'none twice');
  // (the first: the front's standing, the back's, then the running)
  const idle = lens[0].findIndex((n) => n === 4);
  assert.deepEqual(at[0], [0, idle, 0]);
  const card = bakedPlaces([front, back], true);
  assert.equal(card.length, 4 + 5);
  assert.ok(card.every(([v]) => v === 0));
  assert.equal(bakedFirst([front, back], true), 4 + 5);
  assert.equal(bakedFirst([front, back], false), total, 'a hero in a place: his group is laid a place after another');
  // (THE HERO CARDS FROM THE BAKE, 12 Nov 2026: a hero who comes to a stand out of his run, does things of his own left standing
  // and makes ready: all of it on his card, standing and running first; in a place, every list but his making ready, a card's only)
  const f = (k: number): never[] => Array.from({ length: k }, () => ({}) as never);
  const rich = { ...fake(4), stops: [{ frames: f(2), fps: 1 }, { frames: f(2), fps: 1 }], clips: { idleA: { frames: f(3), fps: 1 }, idleB: { frames: f(7), fps: 1 }, ready: { frames: f(6), fps: 1 } } } as unknown as AnimSet;
  const richCard = bakedPlaces([rich, back], true);
  assert.equal(richCard.length, 4 + 5 + 2 + 2 + 3 + 7 + 6);
  assert.ok(richCard.every(([v]) => v === 0));
  assert.equal(new Set(richCard.map((p) => p.join(':'))).size, richCard.length, 'none twice');
  assert.equal(bakedFirst([rich, back], true), 4 + 5, 'standing and running before anything else');
  const firstLists = new Set(richCard.slice(0, 9).map(([, l]) => l));
  assert.equal(firstLists.size, 2);
  assert.ok(richCard.slice(9).every(([, l]) => !firstLists.has(l)));
  assert.equal(richCard.filter(([, l]) => l === READY_LIST).length, 6, 'his making ready, whole');
  const richLens = listLengths([rich, back]);
  const inPlace = bakedPlaces([rich, back], false);
  assert.equal(inPlace.length, richLens.flat().reduce((a, b) => a + b, 0) - 6);
  assert.ok(inPlace.every(([, l]) => l !== READY_LIST), 'never in a place');
  assert.equal(richLens[0][READY_LIST], 6);
  assert.equal(richLens[0].length - 1, READY_LIST, 'the last list: every other keeps its place');
});

test('no bake in this build (the tests bundle none): none is looked for, and the heroes are painted as before', () => {
  assert.equal(bakeMark(), '');
  assert.equal(BakedHeroes.make(() => ({}) as HeroArt, () => true, true), null);
  assert.equal(BAKED.on, true);
});

test('a group that fails is painted instead: once failed, it is not taken again', async () => {
  const gave: string[] = [];
  const b = new BakedHeroes('abc', () => ({}) as HeroArt, () => { gave.push('x'); return true; }, true, async () => ({ ok: false, status: 404 }) as Response);
  {
    assert.equal(b.take('warrior', 'town', false), true, 'asked for: coming');
    for (let i = 0; i < 20 && !b.stats.failed.length; i++) await new Promise((r) => setTimeout(r, 5));
    assert.equal(b.stats.failed.length, 1);
    assert.equal(b.take('warrior', 'dungeon', false), false, 'failed: painted instead');
    assert.equal(b.take('mage', 'town', false), true, 'another group still comes');
    assert.equal(b.take('warrior', 'nowhere' as never, false), false, 'not baked');
    assert.equal(gave.length, 0);
  }
});

test('a group of another bake is not taken', async () => {
  const b = new BakedHeroes('abc', () => ({}) as HeroArt, () => true, true, async (n) => ({ ok: true, json: async () => ({ mark: 'old', group: n.replace('.json', ''), sheets: [], frames: [], parts: [], keys: [] }) }) as unknown as Response);
  assert.equal(b.take('mage', 'dungeon', false), true);
  for (let i = 0; i < 20 && !b.stats.failed.length; i++) await new Promise((r) => setTimeout(r, 5));
  assert.match(b.stats.failed[0], /another bake/);
  assert.equal(b.take('mage', 'town', false), false);
});
