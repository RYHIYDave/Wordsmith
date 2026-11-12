// A HERO'S MOVES KEPT PACKED (render/baked.ts PACKS; the Brawler memory chat, 11 Nov 2026; his words to the main chat, 11 Nov 2026,
// 19:54: “How do we make the brawler so he’s playable without crashing the game?”). The Brawler from all eight sides always holds
// his stance, his run, struck and the first frame of every move; each move from each side is a pack, kept as its file's bytes,
// unpacked as it is asked for, and the least lately asked for let go past a budget, its places put back as they were.
// That the pictures themselves are as painted is checked as they are baked (tools/bake_heroes.mjs); that he fights from the
// packs in a browser, tools/scenarios/sides_more_fight.mjs.
//   run: tsx --test tests/baked_packs.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import type { HeroArt } from '../src/art/heroes';
import { heroLists } from '../src/art/heroes3';
import { asking } from '../src/art/asked';
import { HEAVY, lazyFrames } from '../src/art/kit';
import { EIGHT_ORDER, heroSides } from '../src/art/sides';
import { EIGHT_MORE } from '../src/art/sides_more';
import { VET_LISTS, makeVeteranArt, makeVeteranCardArt } from '../src/art/veteran_art';
import { vetFxFrames } from '../src/art/veteran_fx_art';
import { reapRetired } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { BakedHeroes, PACKS, bakedPlaces, listLengths, packName, packsOf } from '../src/render/baked';
import type { BakeFile, BakeKey, BakePack, PackOf } from '../src/render/baked';

const KEY: BakeKey = { cls: 'brawler', place: 'dungeon', vet: true };

test('the Brawler from eight sides: each move from each side is a pack; his stance, his run and struck are always held', () => {
  const was = EIGHT_MORE.brawler;
  EIGHT_MORE.brawler = true;
  try {
    const sides = heroSides(makeVeteranArt());
    assert.equal(sides.length, 8);
    const plan = packsOf(KEY, sides)!;
    assert.ok(plan);
    sides.forEach((side, v) => {
      const lists = heroLists(side);
      const at = (l: unknown): PackOf | null => plan[v][lists.indexOf(l as Sprite[])];
      const c = side.clips!;
      for (const id of VET_LISTS) {
        assert.deepEqual(at(c.vet![id].frames), { pack: id, lead: true }, `${id}: its frames, the first always held`);
        if (c.vetHalves![id]) assert.deepEqual(at(c.vetHalves![id].frames), { pack: id, lead: false }, `${id}: its half-frames`);
        for (const layer of ['ground', 'behind', 'front'] as const) assert.deepEqual(at(c.vetFx![id][layer]), { pack: id, lead: false }, `${id}: its lines, ${layer}`);
      }
      assert.deepEqual(at(c.fall!.frames), { pack: 'fall', lead: true });
      assert.equal(at(side.idle), null, 'his stance: always held');
      assert.equal(at(side.walk), null, 'his run: always held');
      assert.equal(at(c.reel!.frames), null, 'struck: always held (it cannot be seen coming)');
      // (every list with a frame in it is his stance, his run, struck, or in a pack)
      lists.forEach((l, li) => {
        if (l.length && l !== side.idle && l !== side.walk && l !== c.reel!.frames) assert.ok(plan[v][li], `side ${v}, list ${li}: in a pack`);
      });
    });
    assert.equal(new Set(plan.flat().filter((p) => p).map((p) => p!.pack)).size, VET_LISTS.length + 1, 'his eleven moves and his fall');
    // NOT PACKED: his class card; a hero who is not the Brawler; the Brawler from two sides
    assert.equal(packsOf({ ...KEY, place: 'card' }, heroSides(makeVeteranCardArt())), null);
    assert.equal(packsOf({ cls: 'ranger', place: 'dungeon', vet: false }, sides), null);
    assert.equal(packsOf({ ...KEY, vet: false }, sides), null);
    EIGHT_MORE.brawler = false;
    assert.equal(packsOf(KEY, heroSides(makeVeteranArt())), null, 'from two sides he is taken in whole, as before');
  } finally {
    EIGHT_MORE.brawler = was;
  }
});

// -----------------------------------------------------------------------------------------------
// THE PACKS TAKEN IN, UNPACKED AND LET GO: a small hero of the Brawler's shape (eight sides; a stance, a run, struck, a fall,
// two moves with half-frames and lines), a bake of him made as the bake's page makes one, and pictures that say where they
// were cut from.

interface Cut { sheet: string; x: number; y: number; width: number; height: number; closed: boolean; close(): void }
const cut = (sheet: string, x: number, y: number, w: number, h: number): Cut => ({ sheet, x, y, width: w, height: h, closed: false, close() { this.closed = true; this.width = 0; this.height = 0; } });
(globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = async (src: { name?: string; sheet?: string }, x?: number, y?: number, w?: number, h?: number): Promise<Cut> =>
  typeof x !== 'number' ? cut(src.name ?? '?', 0, 0, 1, 1) : cut(src.sheet ?? '?', x, y!, w!, h!);

const MOVES = ['jab', 'cross'] as const;
let painted = 0;
function smallHero(): ActorArt {
  const paint = (): Sprite => {
    painted++;
    return { img: { width: 4, height: 4 } as unknown as HTMLCanvasElement, w: 2, h: 2, ax: 1, ay: 2 };
  };
  const set = (): AnimSet => {
    const idle = lazyFrames(4, paint, true);
    const walk = lazyFrames(3, paint, true, () => idle);
    const stand = (): readonly Sprite[] => idle;
    const vet: Record<string, Clip> = {};
    const vetHalves: Record<string, { from: number; frames: Sprite[] }> = {};
    const vetFx: Record<string, Record<'ground' | 'behind' | 'front', Sprite[]>> = {};
    for (const id of MOVES) {
      const c: Clip = { frames: asking(lazyFrames(5, paint, true, stand)), fps: 30 };
      vet[id] = c;
      vetHalves[id] = { from: 1.5, frames: asking(lazyFrames(2, paint, true, () => c.frames)) };
      vetFx[id] = { ground: vetFxFrames(6, paint), behind: vetFxFrames(6, paint), front: vetFxFrames(6, paint) };
    }
    const reel: Clip = { frames: lazyFrames(3, paint, true, stand), fps: 30 };
    const fall: Clip = { frames: asking(lazyFrames(6, paint, true, stand)), fps: 30 };
    return { idle, walk, attack: idle, heavy: idle, idleFps: 30, walkFps: 30, clips: { attack: vet.jab, heavy: vet.cross, reel, fall, vet, vetHalves, vetFx } } as unknown as AnimSet;
  };
  const a = {} as Record<string, AnimSet>;
  for (const side of EIGHT_ORDER) a[side] = set();
  return a as unknown as ActorArt;
}

/** A bake of him as the bake's page lays one out (dev/bake_heroes_page.ts group): what is always held on a sheet, each pack on one of its own. */
function bakeOf(art: ActorArt, mark: string): BakeFile {
  const sides = heroSides(art);
  const plan = packsOf(KEY, sides)!;
  const frames: BakeFile['frames'] = [];
  const at: number[] = [];
  const packs = new Map<string, BakePack>();
  // (a picture is laid once however many places show it: a move that is also the game's `attack` is the same list twice)
  const laid = new Map<Sprite[], Map<number, number>>();
  for (const [v, l, i] of bakedPlaces(sides, false)) {
    const pp = plan[v][l];
    const list = heroLists(sides[v])[l];
    let had = laid.get(list);
    if (!had) laid.set(list, (had = new Map()));
    if (!pp || (pp.lead && i === 0)) {
      if (!had.has(i)) {
        had.set(i, frames.length);
        frames.push([0, frames.length, 7, 4, 4, 0]);
      }
      at.push(v, l, i, had.get(i)!);
      continue;
    }
    const name = packName(pp.pack, v);
    let p = packs.get(name);
    if (!p) packs.set(name, (p = { name, sheet: `brawler-${pp.pack}-${v}.png`, frames: [], at: [], bytes: 0 }));
    if (!had.has(i)) {
      had.set(i, p.frames.length);
      p.frames.push([p.frames.length, 3, 4, 4, 0]);
      p.bytes += 4 * 4 * 4;
    }
    // (both of his places, the town and the dungeon, are the same lists: the dungeon's is key 1)
    p.at.push(1, v, l, i, had.get(i)!);
  }
  const lens = listLengths(sides);
  return { mark, group: 'brawler', sheets: ['brawler-0.png'], frames, parts: [{ w: 2, h: 2, ax: 1, ay: 2 }], keys: [{ cls: 'brawler', place: 'town', vet: true, lens, at }, { cls: 'brawler', place: 'dungeon', vet: true, lens, at }], packs: [...packs.values()] };
}

function setUp(): { art: ActorArt; b: BakedHeroes; file: BakeFile; fetched: string[]; done(): Promise<void>; idle(): Promise<void> } {
  const art = smallHero();
  const heroes = { of: () => art } as unknown as HeroArt;
  const file = bakeOf(art, 'm1');
  const fetched: string[] = [];
  const give = (_c: unknown, _p: unknown, v: number, l: number, i: number, s: Sprite): boolean => {
    const list = heroLists(heroSides(art)[v])[l];
    const d = Object.getOwnPropertyDescriptor(list, i);
    if (!d || typeof d.get !== 'function') return false;
    Object.defineProperty(list, i, { value: s, writable: true, configurable: true, enumerable: true });
    return true;
  };
  const get = async (name: string): Promise<Response> => {
    fetched.push(name);
    return { ok: true, json: async () => file, blob: async () => ({ name, size: 100 }) } as unknown as Response;
  };
  const b = new BakedHeroes('m1', () => heroes, give as never, true, get);
  const wait = async (till: () => boolean): Promise<void> => {
    for (let n = 0; n < 400 && !till(); n++) await new Promise((r) => setTimeout(r, 2));
    assert.ok(till(), 'it came');
  };
  return { art, b, file, fetched, done: () => wait(() => b.settled('brawler')), idle: () => wait(() => b.packsIdle()) };
}

const isPicture = (list: readonly Sprite[], i: number): boolean => 'value' in (Object.getOwnPropertyDescriptor(list, i) ?? {});
/** As the game's drawing reads a frame: one not there yet is shown as another, and asked for. */
function shown<T>(read: () => T): T {
  HEAVY.defer = true;
  try {
    return read();
  } finally {
    HEAVY.defer = false;
  }
}
const sheetOf = (s: Sprite): string => (s.img as unknown as Cut).sheet;

test('taken in: what he always holds is given; every pack is fetched and kept packed, none unpacked, nothing painted', async () => {
  const was = { ...PACKS };
  try {
    painted = 0;
    const { art, b, file, fetched, done } = setUp();
    assert.equal(b.take('brawler', 'dungeon', true), true);
    await done();
    assert.deepEqual(b.stats.failed, []);
    assert.equal(b.done('brawler'), true);
    assert.equal(file.packs!.length, 8 * 3, 'two moves and his fall, from eight sides');
    assert.equal(fetched.length, 1 + 1 + 24, 'his file, his one sheet, and every pack\'s');
    const P = b.stats.packs;
    assert.deepEqual([P.all, P.held, P.bytes, P.unpacked], [24, 0, 0, 0]);
    assert.equal(P.packed, 24 * 100, 'their files\' bytes kept');
    for (const side of heroSides(art)) {
      const c = side.clips!;
      for (const list of [side.idle, side.walk, c.reel!.frames]) for (let i = 0; i < list.length; i++) assert.ok(isPicture(list, i), 'his stance, his run, struck: in hand');
      for (const id of MOVES) {
        assert.ok(isPicture(c.vet![id].frames, 0), `${id}: its first frame in hand`);
        for (let i = 1; i < 5; i++) assert.ok(!isPicture(c.vet![id].frames, i), `${id}: the rest packed`);
        assert.ok(!isPicture(c.vetHalves![id].frames, 0));
        assert.ok(!isPicture(c.vetFx![id].front, 0));
      }
      assert.ok(isPicture(c.fall!.frames, 0) && !isPicture(c.fall!.frames, 1));
    }
    assert.equal(painted, 0);
  } finally {
    Object.assign(PACKS, was);
  }
});

test('a move thrown: until its pack is unpacked its first frame is shown; then every frame of it from that side is in hand, and no other', async () => {
  const was = { ...PACKS };
  try {
    painted = 0;
    const { art, b, done, idle } = setUp();
    b.take('brawler', 'dungeon', true);
    await done();
    const side = heroSides(art)[2];
    const jab = side.clips!.vet!.jab.frames;
    const first = jab[0];
    assert.equal(shown(() => jab[3]), first, 'not unpacked yet: its first frame, his stance');
    assert.equal(b.stats.packs.missed, 1);
    await idle();
    assert.deepEqual(b.packsHeld(), ['brawler/jab:2']);
    const s = shown(() => jab[3]);
    assert.notEqual(s, first);
    assert.equal(sheetOf(s), 'brawler-jab-2.png', 'cut from its own sheet');
    assert.equal(jab[0], first, 'its first frame is the one always held');
    for (let i = 1; i < 5; i++) assert.ok(isPicture(jab, i));
    for (let i = 0; i < 2; i++) assert.ok(isPicture(side.clips!.vetHalves!.jab.frames, i), 'its half-frames');
    for (const layer of ['ground', 'behind', 'front'] as const) for (let i = 0; i < 6; i++) assert.ok(isPicture(side.clips!.vetFx!.jab[layer], i), 'its lines');
    assert.ok(!isPicture(side.clips!.vet!.cross.frames, 1), 'another move from the same side: still packed');
    assert.ok(!isPicture(heroSides(art)[3].clips!.vet!.jab.frames, 1), 'the same move from another side: still packed');
    assert.equal(b.stats.packs.bytes, (4 + 2 + 18) * 64);
    // (each picture its own: no two places of the pack show the same cut)
    const cuts = new Set([1, 2, 3, 4].map((i) => (jab[i].img as unknown as Cut).x));
    assert.equal(cuts.size, 4);
    // A LINE NOT THERE YET IS NOT SHOWN AT ALL, and asks for its pack
    const lines = heroSides(art)[5].clips!.vetFx!.cross.front;
    shown(() => lines[2]);
    await idle();
    assert.ok(isPicture(lines, 2));
    assert.deepEqual(b.packsHeld(), ['brawler/jab:2', 'brawler/cross:5']);
    // ASKED FOR AHEAD OF NEED (render/veteran_fx.ts askAhead): unpacked before it is shown
    assert.equal(b.want('brawler', 'fall', 0, false), true);
    assert.equal(b.want('brawler', 'nothing', 0, false), false, 'no such pack');
    await idle();
    assert.equal(b.stats.packs.ahead, 1);
    assert.equal(b.stats.packs.missed, 2);
    assert.ok(isPicture(heroSides(art)[0].clips!.fall!.frames, 5));
    assert.equal(painted, 0, 'nothing of his was painted where the game is played');
  } finally {
    Object.assign(PACKS, was);
  }
});

test('past the budget the least lately asked for is let go: its places as they were, its pictures given back; thrown again, it is unpacked again', async () => {
  const was = { ...PACKS };
  try {
    painted = 0;
    const { art, b, done, idle } = setUp();
    const each = (4 + 2 + 18) * 64;
    PACKS.budget = 2 * each;
    PACKS.fresh = 0;
    b.take('brawler', 'dungeon', true);
    await done();
    const sides = heroSides(art);
    const jab0 = sides[0].clips!.vet!.jab.frames;
    const before = Object.getOwnPropertyDescriptor(jab0, 2)!;
    b.want('brawler', 'jab', 0);
    await idle();
    const pic = jab0[2];
    const picture = pic.img as unknown as Cut;
    await new Promise((r) => setTimeout(r, 3));
    b.want('brawler', 'cross', 0);
    await idle();
    await new Promise((r) => setTimeout(r, 3));
    assert.deepEqual(b.packsHeld(), ['brawler/jab:0', 'brawler/cross:0']);
    assert.equal(b.stats.packs.letGo, 0, 'within the budget: none let go');
    // (the jab asked for again: now the cross is the least lately asked for)
    b.want('brawler', 'jab', 0);
    await new Promise((r) => setTimeout(r, 3));
    b.want('brawler', 'jab', 1);
    await idle();
    assert.deepEqual(b.packsHeld(), ['brawler/jab:0', 'brawler/jab:1']);
    assert.equal(b.stats.packs.letGo, 1);
    assert.ok(b.stats.packs.bytes <= PACKS.budget);
    assert.equal(b.stats.packs.most, 3 * each, 'three for the moment the third came');
    const cross0 = sides[0].clips!.vet!.cross.frames;
    assert.ok(!isPicture(cross0, 2), 'let go: its places as they were');
    assert.ok(isPicture(cross0, 0), 'its first frame is still in hand');
    assert.equal(shown(() => cross0[2]), cross0[0], 'and shown, it stands on its first frame and is asked for again');
    await idle();
    assert.ok(isPicture(cross0, 2), 'unpacked again');
    assert.deepEqual(b.packsHeld(), ['brawler/jab:1', 'brawler/cross:0']);
    assert.equal(b.stats.packs.letGo, 2);
    // (the jab's pictures from in front: its places are the frame's own painter again, and their room is given back)
    assert.deepEqual(Object.getOwnPropertyDescriptor(jab0, 2), before);
    assert.equal(pic.img as unknown, picture, 'not yet: whoever holds it for a moment has done with it first');
    assert.equal(picture.closed, false);
    reapRetired(true);
    assert.equal(picture.closed, true, 'given back');
    assert.notEqual(pic.img as unknown, picture, 'and whoever still holds it draws nothing (engine/px.ts)');
    assert.equal((cross0[2].img as unknown as Cut).closed, false, 'the pictures in hand are not');
    assert.equal(painted, 0);
  } finally {
    Object.assign(PACKS, was);
  }
});

test('what was asked for a moment ago is never let go, whatever the budget', async () => {
  const was = { ...PACKS };
  try {
    const { b, done, idle } = setUp();
    PACKS.budget = 1;
    PACKS.fresh = 60000;
    b.take('brawler', 'dungeon', true);
    await done();
    for (let v = 0; v < 4; v++) b.want('brawler', 'jab', v);
    await idle();
    assert.equal(b.packsHeld().length, 4);
    assert.equal(b.stats.packs.letGo, 0);
    // (and once they are no longer fresh, all but what the budget allows go)
    PACKS.fresh = 0;
    await new Promise((r) => setTimeout(r, 3));
    b.want('brawler', 'cross', 7);
    await idle();
    assert.deepEqual(b.packsHeld(), ['brawler/cross:7'], 'the one just asked for is the last to go, and is kept though over the budget');
    b.letGoAll();
    assert.deepEqual(b.packsHeld(), []);
    assert.equal(b.stats.packs.bytes, 0);
  } finally {
    Object.assign(PACKS, was);
  }
});

test('a place painted already keeps its picture: it is not the pack\'s to give or to take back', async () => {
  const was = { ...PACKS };
  try {
    painted = 0;
    const { art, b, done, idle } = setUp();
    PACKS.fresh = 0;
    b.take('brawler', 'dungeon', true);
    await done();
    const jab = heroSides(art)[4].clips!.vet!.jab.frames;
    const own = jab[2];
    assert.equal(painted, 1, 'read where nothing is deferred (a test, a tool): painted, as any frame');
    b.want('brawler', 'jab', 4);
    await idle();
    assert.equal(jab[2], own);
    assert.notEqual(jab[3], own);
    b.letGoAll();
    assert.equal(jab[2], own, 'still his own');
    assert.ok(!isPicture(jab, 3));
  } finally {
    Object.assign(PACKS, was);
  }
});

test('PACKS off: every pack is unpacked as he is taken in, and none is let go', async () => {
  const was = { ...PACKS };
  try {
    const { art, b, file, done } = setUp();
    PACKS.on = false;
    PACKS.budget = 1;
    PACKS.fresh = 0;
    b.take('brawler', 'dungeon', true);
    await done();
    assert.equal(b.packsHeld().length, 24);
    assert.equal(b.stats.packs.letGo, 0);
    assert.equal(b.stats.packs.bytes, file.packs!.reduce((n, p) => n + p.bytes, 0));
    for (const side of heroSides(art)) for (const l of heroLists(side)) for (let i = 0; i < l.length; i++) assert.ok(isPicture(l, i), 'every frame of his in hand');
  } finally {
    Object.assign(PACKS, was);
  }
});
