// Tests for THE TOWN'S PEOPLE BAKED (render/townsfolk_baked.ts, art/townsfolk3.ts; the townsfolk bake chat, 11 Nov 2026): the
// sculpted four's frames come from files beside the game's page. Which lists the bake fills; where the sculpted four are the
// town's people and where the town's people are as they were; when each one's sound is heard; and the taking in and letting go
// of the pictures (with stand-ins for the page's fetch and its pictures: there is no browser here; the pictures themselves are
// checked as they are baked, tools/bake_townsfolk.mjs, and in a browser, tools/scenarios/townsfolk_baked.mjs).
//   run: tsx --test tests/townsfolk_baked.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { Sprite } from '../src/engine/px';
import { lazyFrames } from '../src/art/kit';
import { makeTownProps } from '../src/art/town';
import { folkSoundAt } from '../src/art/townscene';
import type { TownArt } from '../src/art/townscene';
import { makeTownsfolk } from '../src/art/townsfolk';
import { TOWNSFOLK3, TOWNSFOLK3_FILES, TOWNSFOLK3_HEAVY, folkLists, makeSmithDark3, makeTownsfolk3, smithDark3, townsfolk3Shown } from '../src/art/townsfolk3';
import type { FolkList } from '../src/art/townsfolk3';
import { VAULT } from '../src/art/ground';
import { BakedTownsfolk, TOWNSFOLK_BAKED, townsfolkBakeMark } from '../src/render/townsfolk_baked';
import type { FolkBakeFile } from '../src/render/townsfolk_baked';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void | Promise<void>) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

test('the lists the bake fills: 23 of them, each once, in the order the town wants them; 2,584 places', () => {
  const lists = folkLists(makeTownsfolk3(), makeSmithDark3());
  assert.deepEqual(lists.map((l) => l.name), [
    'armourer:idle', 'mystic:idle', 'wordsmith:idle', 'stranger:idle', 'smithDark:idle',
    'armourer:act', 'mystic:act', 'wordsmith:act', 'stranger:act',
    // (a loop turned the way of their work is the loop itself: the three at their benches face south-west)
    'armourer:se', 'armourer:ne', 'armourer:nw', 'mystic:se', 'mystic:ne', 'mystic:nw', 'wordsmith:se', 'wordsmith:ne', 'wordsmith:nw',
    // (the stranger never leaves his wall: his eyes to his left, and to his right)
    'stranger:se', 'stranger:sw',
    'smithDark:se', 'smithDark:ne', 'smithDark:nw',
  ]);
  assert.equal(lists.length, 23);
  assert.equal(new Set(lists.map((l) => l.list)).size, lists.length, 'no list twice');
  assert.equal(lists.reduce((n, l) => n + l.list.length, 0), 2584);
  // (the same lists however often they are asked for: the game asks as the files come)
  const folk = makeTownsfolk3();
  const dark = makeSmithDark3();
  const a = folkLists(folk, dark);
  const b = folkLists(folk, dark);
  assert.ok(a.every((l, i) => l.list === b[i].list));
  assert.ok(smithDark3() === smithDark3(), 'the dark wordsmith the town shows is one set');
});

test('the sculpted four are the town\'s people where their frames are to be had; elsewhere the town\'s people are as they were', () => {
  assert.equal(TOWNSFOLK3.on, true);
  assert.equal(TOWNSFOLK_BAKED.on, true);
  assert.equal(townsfolkBakeMark(), '', 'no bake built in here');
  assert.equal(BakedTownsfolk.toBeHad(), false);
  assert.equal(BakedTownsfolk.make(() => []), null);
  assert.equal(townsfolk3Shown(), false);
  assert.equal(makeTownsfolk().armourer.fps, undefined, 'as they were: the town\'s ten a second');
  try {
    // (the files to be had: the game's page, served, with a bake beside it)
    TOWNSFOLK3_FILES.had = true;
    assert.equal(townsfolk3Shown(), true);
    assert.equal(makeTownsfolk().armourer.fps, 30);
    TOWNSFOLK3_FILES.had = false;
    // (painted as they are asked for: the bake itself, the pictures and films)
    TOWNSFOLK3_HEAVY.on = false;
    assert.equal(townsfolk3Shown(), true);
    assert.equal(makeTownsfolk().mystic.fps, 30);
    // (and the switch off: as they were, whatever is to be had)
    TOWNSFOLK3.on = false;
    TOWNSFOLK3_FILES.had = true;
    assert.equal(townsfolk3Shown(), false);
    assert.equal(makeTownsfolk().armourer.fps, undefined);
  } finally {
    TOWNSFOLK3.on = true;
    TOWNSFOLK3_HEAVY.on = true;
    TOWNSFOLK3_FILES.had = false;
  }
});

test('each one\'s sound at its moment: the anvil as the hammer lands, the crystal as it blazes, the coin as it is flicked; the wordsmith\'s and the old townsfolk\'s as they begin', () => {
  const folk = makeTownsfolk3();
  assert.ok(Math.abs((folk.armourer.soundAt ?? 0) - 26 / 30) < 1e-9, 'the blow lands in frame 26, 0.87 s in');
  assert.ok(Math.abs((folk.mystic.soundAt ?? 0) - 34 / 30) < 1e-9, 'the crystal blazes in frame 34, 1.13 s in');
  assert.ok(Math.abs((folk.stranger.soundAt ?? 0) - 16 / 30) < 1e-9, 'the coin is flicked in frame 16, 0.53 s in');
  assert.equal(folk.wordsmith.soundAt ?? 0, 0, 'the wordsmith writes his rune as he begins, as before');
  // (each is heard before what he does is over)
  for (const who of ['armourer', 'mystic', 'stranger'] as const) assert.ok((folk[who].soundAt ?? 0) < folk[who].act.length / 30, who);
  const town = makeTownProps(VAULT);
  const now: TownArt = { town, folk };
  const before: TownArt = { town, folk: makeTownsfolk() };
  assert.ok(Math.abs(folkSoundAt(now, 'armourer') - 26 / 30) < 1e-9);
  for (const who of ['armourer', 'mystic', 'wordsmith', 'stranger']) assert.equal(folkSoundAt(before, who), 0, `${who} as he was: as his act begins`);
  assert.equal(folkSoundAt(now, 'anvil'), 0, 'a thing that is not one of them');
});

// ---------------------------------------------------------------------------------------------
// THE TAKING IN AND THE LETTING GO, with stand-ins: three small lists whose frames paint themselves when asked (as the
// townsfolk's do), a bake of five frames on two sheets, and pictures that only say when they are closed.

interface World {
  lists: FolkList[];
  painted: number;
  file: FolkBakeFile;
  opened: number;
  closed: number;
  fetched: string[];
  get: (name: string) => Promise<Response>;
}

function world(change: (f: FolkBakeFile) => void = () => {}, missing: string[] = []): World {
  const w = { painted: 0, opened: 0, closed: 0, fetched: [] as string[] } as World;
  const frame = (): Sprite => {
    w.painted++;
    return { img: { width: 2, height: 2 } as unknown as HTMLCanvasElement, w: 1, h: 1, ax: 0, ay: 0 } as Sprite;
  };
  w.lists = [
    { name: 'a:idle', list: lazyFrames(3, frame, true) },
    { name: 'a:act', list: lazyFrames(2, frame, true) },
    { name: 'a:se', list: lazyFrames(3, frame, true) },
  ];
  // (five frames for eight places: the turned loop's first and last are the loop's own pictures)
  w.file = {
    mark: 'm1', group: 'townsfolk', sheets: ['townsfolk-0.png', 'townsfolk-1.png'],
    frames: [[0, 0, 0, 4, 6, 0], [0, 4, 0, 4, 6, 0], [0, 8, 0, 4, 6, 1], [1, 0, 0, 4, 6, 0], [1, 4, 0, 4, 6, 1]],
    parts: [{ w: 2, h: 3, ax: 1, ay: 3, density: 2 }, { w: 2, h: 3, ax: 1, ay: 2, density: 2 }] as FolkBakeFile['parts'],
    lists: [{ name: 'a:idle', at: [0, 1, 2] }, { name: 'a:act', at: [3, 4] }, { name: 'a:se', at: [0, 4, 2] }],
  };
  change(w.file);
  w.get = async (name: string): Promise<Response> => {
    w.fetched.push(name);
    const ok = !missing.includes(name);
    return { ok, status: ok ? 200 : 404, json: async () => JSON.parse(JSON.stringify(w.file)), blob: async () => ({}) } as unknown as Response;
  };
  (globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = async (_from: unknown, _x?: number, _y?: number, bw?: number, bh?: number) => {
    w.opened++;
    return { width: bw ?? 16, height: bh ?? 16, close: () => { w.closed++; } };
  };
  return w;
}

const isPainter = (list: Sprite[], i: number): boolean => typeof Object.getOwnPropertyDescriptor(list, i)?.get === 'function';
/** Wait for the pictures to come or fail. */
async function settle(b: BakedTownsfolk): Promise<void> {
  for (let n = 0; n < 200 && !b.settled(); n++) await new Promise((r) => setTimeout(r, 1));
}

test('taken in: every unpainted place is given its picture from the sheets, nothing is painted; a place painted already keeps its own', async () => {
  const w = world();
  // (the game had painted one frame itself before the files came)
  const own = w.lists[1].list[0];
  assert.equal(w.painted, 1);
  const b = new BakedTownsfolk('m1', () => w.lists, w.get);
  assert.equal(b.take(), true, 'coming');
  assert.equal(b.settled(), false);
  assert.equal(b.take(), true, 'asked for twice, fetched once');
  await settle(b);
  assert.equal(b.done(), true);
  assert.deepEqual(w.fetched, ['townsfolk.json', 'townsfolk-0.png', 'townsfolk-1.png']);
  assert.deepEqual({ ...b.stats, ms: 0 }, { given: 4, unwanted: 1, ms: 0, loads: 1, letGo: 0, held: 4, failed: [] });
  for (const l of w.lists) for (let i = 0; i < l.list.length; i++) assert.ok(!isPainter(l.list, i), `${l.name} ${i} has its picture`);
  assert.equal(w.painted, 1, 'none painted here');
  assert.ok(w.lists[1].list[0] === own, 'the place the game had painted keeps its own picture');
  // (a picture shown in two places is one picture; with its other parts as baked)
  assert.ok(w.lists[0].list[0] === w.lists[2].list[0]);
  assert.ok(w.lists[1].list[1] === w.lists[2].list[1]);
  assert.equal(w.lists[0].list[2].ay, 2);
  assert.equal(w.lists[0].list[1].ay, 3);
  // (the two sheets and the frame nobody wanted are closed; the four in hand are not)
  assert.equal(w.opened, 2 + 5);
  assert.equal(w.closed, 2 + 1);
});

test('let go as the town is left: every place is unpainted again, the pictures\' room given back; and they come again the next time', async () => {
  const w = world();
  const b = new BakedTownsfolk('m1', () => w.lists, w.get);
  b.take();
  await settle(b);
  const had = w.lists[0].list[0];
  b.letGo();
  assert.equal(b.done(), false);
  assert.equal(b.holding(), false);
  assert.equal(b.stats.held, 0);
  assert.equal(b.stats.letGo, 1);
  for (const l of w.lists) for (let i = 0; i < l.list.length; i++) assert.ok(isPainter(l.list, i), `${l.name} ${i} unpainted again`);
  assert.equal(w.closed, 2 + 5, 'all five given back');
  assert.equal(had.img.width, 1, 'whoever still holds one draws nothing');
  b.letGo();
  assert.equal(b.stats.letGo, 1, 'nothing in hand, nothing to let go');
  assert.equal(b.take(), true);
  await settle(b);
  assert.equal(b.done(), true);
  assert.equal(b.stats.loads, 2);
  assert.equal(b.stats.given, 5);
  assert.equal(b.stats.held, 5);
  assert.equal(w.painted, 0);
});

test('let go while they are still coming: the load stops, nothing is left in hand', async () => {
  const w = world();
  const b = new BakedTownsfolk('m1', () => w.lists, w.get);
  b.take();
  b.letGo();
  assert.equal(b.holding(), false);
  for (let n = 0; n < 30; n++) await new Promise((r) => setTimeout(r, 1));
  assert.equal(b.settled(), false);
  assert.equal(b.stats.held, 0);
  assert.equal(w.opened, w.closed, 'whatever was opened is closed');
  for (const l of w.lists) for (let i = 0; i < l.list.length; i++) assert.ok(isPainter(l.list, i));
  assert.deepEqual(b.stats.failed, []);
});

test('where they will not come (another bake\'s file, lists not as baked, a sheet missing): none are kept, the game is told once, and they are not asked for again', async () => {
  const cases: [string, World][] = [
    ['of another bake', world((f) => { f.mark = 'm0'; })],
    ['a list longer than it was baked', world((f) => { f.lists[1].at.pop(); })],
    ['a list of another name', world((f) => { f.lists[2].name = 'a:nw'; })],
    ['a list more', world((f) => { f.lists.pop(); })],
    ['the second sheet missing', world(() => {}, ['townsfolk-1.png'])],
    ['no file at all', world(() => {}, ['townsfolk.json'])],
  ];
  for (const [what, w] of cases) {
    const b = new BakedTownsfolk('m1', () => w.lists, w.get);
    let told = 0;
    b.onFail = () => { told++; };
    assert.equal(b.take(), true, what);
    await settle(b);
    assert.equal(b.done(), false, what);
    assert.equal(b.settled(), true, what);
    assert.equal(told, 1, what);
    assert.equal(b.stats.failed.length, 1, what);
    assert.equal(b.stats.held, 0, what);
    assert.equal(w.opened, w.closed, `${what}: whatever was opened is closed`);
    for (const l of w.lists) for (let i = 0; i < l.list.length; i++) assert.ok(isPainter(l.list, i), `${what}: ${l.name} ${i}`);
    assert.equal(b.take(), false, `${what}: not asked for again`);
    assert.equal(told, 1, what);
  }
});
