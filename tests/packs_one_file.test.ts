// A HERO'S PACKS IN ONE FILE, AND HIS GROUP LET GO OF WHOLE (the skins chat, 14 Nov 2026; render/baked.ts takePacks, letGoGroup,
// wantOf; tools/bake_heroes.mjs). The Brawler's and the Warlock's moves are kept in packs, one a move a side (render/baked.ts PACKS):
// each was a file of its own, some 200 of the game's page's 511 files, and their unique weapons (art/wrap_skins.ts,
// art/tome_skins.ts), each a set of him, would have been 700 more. So a group's packs are ONE FILE, each pack's PNG whole one after
// another, each read from its own bytes. And a hero kept in packs who takes up a unique weapon lets his last set go whole, his
// packs with it, as the Mage lets go of her last staff's.
//   1. the packs in one file: it is fetched once, and each pack opened is its own bytes of it (a bake of the old way, a file a
//      pack, is taken as before);
//   2. a group kept in packs let go of whole: its packs in hand let go (their places as they were), every one forgotten, one being
//      unpacked thrown away; taken in again, fetched again; wantOf asks whichever of his groups is in hand.
//   run: tsx --test tests/packs_one_file.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import type { HeroArt, HeroPlace } from '../src/art/heroes';
import { WRAP_PLACES, WRAP_SKINS } from '../src/art/heroes';
import { heroLists } from '../src/art/heroes3';
import { asking } from '../src/art/asked';
import { HEAVY, lazyFrames } from '../src/art/kit';
import { EIGHT_ORDER, heroSides } from '../src/art/sides';
import { sheetWhere } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { BakedHeroes, PACKS, bakedPlaces, classOfGroup, listLengths, packName, packsOf } from '../src/render/baked';
import type { BakeFile, BakePack } from '../src/render/baked';

interface Sheet { name: string; width: number; height: number; closed: boolean; close(): void }
/** (the browser's reading of a sheet's file, in the tests: the file's bytes are its name, and the sheet says it) */
(globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = async (src: Blob): Promise<Sheet> => {
  const name = typeof (src as { text?: unknown }).text === 'function' ? await src.text() : String((src as unknown as { name?: string }).name);
  const sheet: Sheet = { name, width: 16, height: 16, closed: false, close: () => { sheet.closed = true; } };
  return sheet;
};

const MOVES = ['jab', 'cross'] as const;
/** A small hero of the Veteran's shape: eight sides; a stance, a run, struck, a fall, two moves with half-frames and lines. */
function smallHero(): ActorArt {
  const paint = (): Sprite => ({ img: { width: 4, height: 4 } as unknown as HTMLCanvasElement, w: 2, h: 2, ax: 1, ay: 2 });
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
      vetFx[id] = { ground: lazyFrames(6, paint), behind: lazyFrames(6, paint), front: lazyFrames(6, paint) };
    }
    const reel: Clip = { frames: lazyFrames(3, paint, true, stand), fps: 30 };
    const fall: Clip = { frames: asking(lazyFrames(6, paint, true, stand)), fps: 30 };
    return { idle, walk, attack: idle, heavy: idle, idleFps: 30, walkFps: 30, clips: { attack: vet.jab, heavy: vet.cross, reel, fall, vet, vetHalves, vetFx } } as unknown as AnimSet;
  };
  const a = {} as Record<string, AnimSet>;
  for (const side of EIGHT_ORDER) a[side] = set();
  return a as unknown as ActorArt;
}

/**
 * A bake of him as the bake lays one out: what is always held on a sheet; each pack's sheet, in ONE FILE (`oneFile`), its bytes
 * its own name, or a file of its own as before. And the file's bytes.
 */
function bakeOf(art: ActorArt, group: string, places: [HeroPlace, HeroPlace], oneFile: boolean): { file: BakeFile; bundle: string } {
  const sides = heroSides(art);
  const plan = packsOf({ cls: 'brawler', place: places[1], vet: true }, sides)!;
  const frames: BakeFile['frames'] = [];
  const at: number[] = [];
  const packs = new Map<string, BakePack>();
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
    if (!p) packs.set(name, (p = { name, sheet: `${group}-${pp.pack}-${v}.png`, frames: [], at: [], bytes: 0 }));
    if (!had.has(i)) {
      had.set(i, p.frames.length);
      p.frames.push([p.frames.length, 3, 4, 4, 0]);
      p.bytes += 4 * 4 * 4;
    }
    p.at.push(1, v, l, i, had.get(i)!);
  }
  // (in one file: each pack's bytes, one after another; here each is its own sheet's old name)
  let bundle = '';
  if (oneFile) {
    for (const p of packs.values()) {
      const bytes = p.sheet;
      p.off = bundle.length;
      p.len = bytes.length;
      p.sheet = `${group}-packs.png`;
      bundle += bytes;
    }
  }
  const lens = listLengths(sides);
  const file: BakeFile = { mark: 'm1', group, sheets: [`${group}-0.png`], frames, parts: [{ w: 2, h: 2, ax: 1, ay: 2 }], keys: [{ cls: 'brawler', place: places[0], vet: true, lens, at }, { cls: 'brawler', place: places[1], vet: true, lens, at }], packs: [...packs.values()] };
  return { file, bundle };
}

const isPicture = (list: readonly Sprite[], i: number): boolean => 'value' in (Object.getOwnPropertyDescriptor(list, i) ?? {});
const sheetOf = (s: Sprite): string => (sheetWhere(s)!.sheet.img as unknown as Sheet).name;
function shown<T>(read: () => T): T {
  HEAVY.defer = true;
  try {
    return read();
  } finally {
    HEAVY.defer = false;
  }
}

/** Him and a set of him with unique wraps (THE LAST ROUND's places), each a group of the bake, each its own art. */
function setUp(oneFile = true) {
  const arts = new Map<string, ActorArt>();
  const placeGroup = (place: HeroPlace): string => (place === 'town' || place === 'dungeon' ? 'brawler' : 'brawler-lastround');
  const artOf = (g: string): ActorArt => {
    let a = arts.get(g);
    if (!a) arts.set(g, (a = smallHero()));
    return a;
  };
  const files = new Map<string, { file: BakeFile; bundle: string }>();
  const fileOf = (g: string) => {
    let f = files.get(g);
    if (!f) files.set(g, (f = bakeOf(artOf(g), g, g === 'brawler' ? ['town', 'dungeon'] : [WRAP_PLACES.lastround.town, WRAP_PLACES.lastround.dungeon], oneFile)));
    return f;
  };
  const heroes = { of: (_c: string, look: { wraps?: string }) => artOf(look.wraps ? 'brawler-lastround' : 'brawler') } as unknown as HeroArt;
  const fetched: string[] = [];
  const give = (_c: unknown, place: HeroPlace, v: number, l: number, i: number, s: Sprite): boolean => {
    const list = heroLists(heroSides(artOf(placeGroup(place)))[v])[l];
    const d = Object.getOwnPropertyDescriptor(list, i);
    if (!d || typeof d.get !== 'function') return false;
    Object.defineProperty(list, i, { value: s, writable: true, configurable: true, enumerable: true });
    return true;
  };
  const get = async (name: string): Promise<Response> => {
    fetched.push(name);
    const g = name.endsWith('.json') ? name.slice(0, -5) : name.replace(/-(packs|0|jab|cross|fall)(-\d)?\.png$/, '');
    const f = fileOf(g);
    if (name.endsWith('.json')) return { ok: true, json: async () => f.file } as unknown as Response;
    const bytes = name.endsWith('-packs.png') ? f.bundle : name;
    return { ok: true, blob: async () => new Blob([bytes]) } as unknown as Response;
  };
  const b = new BakedHeroes('m1', () => heroes, give as never, true, get);
  const wait = async (till: () => boolean): Promise<void> => {
    for (let n = 0; n < 400 && !till(); n++) await new Promise((r) => setTimeout(r, 2));
    assert.ok(till(), 'it came');
  };
  return { b, fetched, artOf, settled: (g: string) => wait(() => b.settled(g)), idle: () => wait(() => b.packsIdle()) };
}

test('1. the packs in one file: fetched once, each pack opened from its own bytes of it; a file a pack, as before', async () => {
  const was = { ...PACKS };
  try {
    const { b, fetched, artOf, settled, idle } = setUp(true);
    assert.equal(b.take('brawler', 'dungeon', true), true);
    await settled('brawler');
    assert.deepEqual(b.stats.failed, []);
    assert.deepEqual(fetched, ['brawler.json', 'brawler-0.png', 'brawler-packs.png'], 'his file, his one sheet, and his packs\' one file');
    assert.equal(b.stats.packs.all, 8 * 3, 'two moves and his fall, from eight sides');
    const jab = heroSides(artOf('brawler'))[2].clips!.vet!.jab.frames;
    shown(() => jab[3]);
    await idle();
    assert.equal(sheetOf(jab[3]), 'brawler-jab-2.png', 'the jab from side 2: its own bytes of the file');
    const fall = heroSides(artOf('brawler'))[7].clips!.fall!.frames;
    b.want('brawler', 'fall', 7);
    await idle();
    assert.equal(sheetOf(fall[4]), 'brawler-fall-7.png');
    // (a bake of the old way, a file a pack: as before)
    const old = setUp(false);
    old.b.take('brawler', 'dungeon', true);
    await old.settled('brawler');
    assert.equal(old.fetched.length, 2 + 24);
    const j2 = heroSides(old.artOf('brawler'))[2].clips!.vet!.jab.frames;
    shown(() => j2[3]);
    await old.idle();
    assert.equal(sheetOf(j2[3]), 'brawler-jab-2.png');
  } finally {
    Object.assign(PACKS, was);
  }
});

test('2. a group kept in packs let go of whole as he takes up unique wraps: its packs let go and forgotten; back, fetched again', async () => {
  const was = { ...PACKS };
  const on = WRAP_SKINS.on;
  WRAP_SKINS.on = true;
  try {
    assert.equal(classOfGroup('brawler-lastround'), 'brawler');
    assert.equal(classOfGroup('warlock-demon'), 'warlock');
    assert.equal(classOfGroup('cards'), 'cards');
    const { b, fetched, artOf, settled, idle } = setUp(true);
    b.holdOnly('brawler', 'dungeon', true);
    b.take('brawler', 'dungeon', true);
    await settled('brawler');
    const own = heroSides(artOf('brawler'))[1].clips!.vet!.cross.frames;
    assert.equal(b.wantOf('brawler', 'cross', 1), true, 'asked of whichever group of his is in hand');
    await idle();
    assert.ok(isPicture(own, 2));
    // (one being unpacked as he swaps: thrown away)
    b.want('brawler', 'jab', 5);
    // HE TAKES UP THE LAST ROUND: his own set let go of whole, packs and all
    b.holdOnly('brawler', WRAP_PLACES.lastround.dungeon, true);
    assert.equal(b.done('brawler'), false, 'his own set let go of');
    assert.ok(!isPicture(own, 2), 'its places as they were');
    assert.equal(b.stats.packs.all, 0, 'every pack of it forgotten');
    assert.equal(b.stats.packs.packed, 0, 'its file\'s bytes given back');
    await idle();
    assert.deepEqual(b.packsHeld(), [], 'the one being unpacked thrown away');
    assert.ok(!isPicture(heroSides(artOf('brawler'))[5].clips!.vet!.jab.frames, 2));
    b.take('brawler', WRAP_PLACES.lastround.dungeon, true);
    await settled('brawler-lastround');
    assert.deepEqual(b.stats.failed, []);
    assert.equal(b.wantOf('brawler', 'jab', 0), true, 'his set with the Last Round asked');
    await idle();
    assert.deepEqual(b.packsHeld(), ['brawler-lastround/jab:0']);
    assert.ok(isPicture(heroSides(artOf('brawler-lastround'))[0].clips!.vet!.jab.frames, 3));
    // BACK TO HIS OWN: the Last Round's set let go of, his own fetched again
    const n = fetched.length;
    b.holdOnly('brawler', 'dungeon', true);
    assert.deepEqual(b.packsHeld(), []);
    b.take('brawler', 'dungeon', true);
    await settled('brawler');
    assert.deepEqual(fetched.slice(n), ['brawler.json', 'brawler-0.png', 'brawler-packs.png']);
    // (the switch off: nothing of his is let go of whole, as before)
    WRAP_SKINS.on = false;
    b.holdOnly('brawler', WRAP_PLACES.lastround.dungeon, true);
    assert.equal(b.done('brawler'), true);
  } finally {
    WRAP_SKINS.on = on;
    Object.assign(PACKS, was);
  }
});
