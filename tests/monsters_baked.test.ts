// Tests for THE FLOORS' MONSTERS BAKED (render/monsters_baked.ts; the queue's make-floors-monsters-before-play, 11 Nov 2026): a
// floor's monsters' frames come from files beside the game's page, under the loading screen, in place of being painted as he
// fights. Which figures are baked; the taking in of a figure's pictures into the bestiary's own, and what becomes of them as
// the figure is forgotten (with stand-ins for the page's fetch and its pictures: there is no browser here; the pictures
// themselves are checked as they are baked, tools/bake_monsters.mjs, and in a browser, tools/scenarios/monsters_baked.mjs).
//   run: tsx --test tests/monsters_baked.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as fs from 'node:fs';

import { framesOf, makeBestiary, paintOrder } from '../src/art/bestiary';
import type { Bestiary, MonsterFigure } from '../src/art/bestiary';
import type { ActorArt } from '../src/art/actor_types';
import { PAINTING } from '../src/art/kit';
import type { Sprite } from '../src/engine/px';
import { BakedMonsters, CUT_MS, HOLD_MOST_MB, MONSTERS_BAKED, SMALL_MOST_MB, STAND_IN_MS, TOO_BIG, bakeName, bakedFigures, bringsOf, figureLens, monsterBakeMark } from '../src/render/monsters_baked';
import type { BakedMonstersOptions, Sheet } from '../src/render/monsters_baked';
import { PACK_TAIL, packName, readPack } from '../src/render/monsters_baked';
import { packFigure, readPack as readPackHere } from '../tools/monster_packs.mjs';
import type { MonsterBakeFile } from '../src/render/monsters_baked';
import { COLOSSUS } from '../src/game/colossus_fight';
import { ACT1_KINDS, ACT2_KINDS, HIGH_KINDS } from '../src/game/types';
import { act1Fx } from '../src/render/act1_fx/index';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void | Promise<void>) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

test('the figures that are baked: every one with pictures of its own, each once, each with a name a file can have', () => {
  const all = bakedFigures();
  assert.equal(new Set(all).size, all.length, 'none twice');
  for (const f of ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'guardian', 'warden', 'shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'] as MonsterFigure[]) assert.ok(all.includes(f), f);
  for (const f of ['headsman', 'chained', 'chained1', 'chained2', 'amalgam', 'beast', 'mite', 'fleshmancer', 'dagger', 'minifm'] as MonsterFigure[]) assert.ok(all.includes(f), f);
  for (const f of ['qgolem', 'rubbling', 'vulture', 'wolf', 'hushed', 'watch', 'footman', 'unfinished', 'queen', 'gking'] as MonsterFigure[]) assert.ok(all.includes(f), f);
  // (not the Drowned Eye while the Swamp Colossus is floor 10's boss: his own pictures are never shown; nor the Moth, too big to hold whole)
  assert.ok(!all.includes('eye'));
  assert.deepEqual([...TOO_BIG], ['moth']);
  assert.ok(!all.includes('moth'));
  assert.equal(HOLD_MOST_MB, 600);
  // (a kind's other looks, each a figure of its own: '<kind>:<form>', its files <kind>_<form>)
  const looks = all.filter((f) => f.includes(':'));
  assert.ok(looks.length > 0);
  for (const f of all) assert.ok(/^[a-z0-9_]+$/.test(bakeName(f)), `${f}: ${bakeName(f)}`);
  assert.equal(new Set(all.map(bakeName)).size, all.length, 'no two in one file');
  assert.equal(bakeName('fieldhand:1' as MonsterFigure), 'fieldhand_1');
  // (no bake in a page that was not built with one: the unit tests)
  assert.equal(monsterBakeMark(), '');
  assert.equal(BakedMonsters.toBeHad(), false);
});

test('the bake paints with the switches the game puts on as it starts: the same calls, in the same words, in main.ts and in the bake\'s page', () => {
  const read = (p: string): string => (fs as { readFileSync(p: string, e: string): string }).readFileSync(p, 'utf8');
  // (the calls that stand alone at the start of a line: `useEnemyMoves(ENEMY_MOVES.on);`)
  const calls = (src: string): string[] => src.split('\n').filter((l) => /^use[A-Z]\w*\(.*\);$/.test(l));
  const game = calls(read('src/main.ts'));
  const bake = calls(read('src/dev/bake_monsters_page.ts'));
  assert.ok(game.length >= 3, `main.ts puts ${game.length} on`);
  assert.deepEqual(bake, game, 'a switch put on as the game starts is put on in src/dev/bake_monsters_page.ts too');
  // (and before it makes a picture)
  const page = read('src/dev/bake_monsters_page.ts');
  for (const c of bake) assert.ok(page.indexOf(c) < page.indexOf('const bestiary = makeBestiary();'), c);
});

test('the Swamp Colossus and his arms are not painted ahead: nothing of the Drowned Eye\'s own pictures is drawn while he is floor 10\'s boss', () => {
  assert.equal(COLOSSUS.on, true);
  assert.equal(act1Fx('eye')?.noFigure, true, 'the renderer leaves the kind out of the painting ahead');
  assert.ok(!bakedFigures().includes('eye'), 'and it is not baked');
  // (and no other kind: each of the others is shown by its own pictures)
  for (const k of [...ACT1_KINDS, ...ACT2_KINDS, ...HIGH_KINDS]) if (k !== 'eye') assert.ok(!act1Fx(k)?.noFigure, k);
  // (with the Colossus off the Drowned Eye is floor 10's boss as he was: painted by the painter, and baked)
  COLOSSUS.on = false;
  try {
    assert.ok(!act1Fx('eye')?.noFigure);
    assert.ok(bakedFigures().includes('eye'));
  } finally {
    COLOSSUS.on = true;
  }
});

test('what a figure brings into its floor is asked for with it: what it becomes, and what it calls up', () => {
  assert.deepEqual(bringsOf('chained'), ['chained1']);
  assert.deepEqual(bringsOf('chained1'), ['chained2']);
  assert.deepEqual(bringsOf('chained2'), []);
  assert.deepEqual(bringsOf('amalgam'), ['beast', 'mite']);
  assert.deepEqual(bringsOf('warden'), ['skeleton']);
  assert.deepEqual(bringsOf('skeleton'), []);
  // (a kind's stages, as the renderer has them: the next ones)
  assert.deepEqual(bringsOf('palimpsest', () => ['palimpsest:1' as MonsterFigure]), ['palimpsest:1']);
  assert.deepEqual(bringsOf('watch', () => ['hound']), ['hound']);
  // (every one of them is itself baked)
  const all = bakedFigures();
  for (const f of all) for (const b of bringsOf(f)) assert.ok(all.includes(b), `${f} brings ${b}`);
});

// ---------------------------------------------------------------------------------------------
// THE TAKING IN, with the bestiary's own pictures of the cave bat (none of them painted: reading a frame is what paints it)
// and stand-ins for the page: a bake of the bat laid out from the game's own order of its frames, a frame for each place but
// the last two, which show the same picture; two sheets, each opened and its frames cut from it a few at a time; and pictures
// that only say when they are let go of.

interface World {
  /** Let the second sheet come (it waits, where a test holds it back). */
  rest: () => void;
  bestiary: Bestiary;
  file: MonsterBakeFile;
  places: [number, number, number][];
  /** Sheets opened and frames cut; sheets closed and frames let go of. */
  opened: number;
  closed: number;
  /** How many turns the cutting took. */
  turns: number;
  fetched: string[];
  /** What the bake is made with: its files, its sheets, its one figure, and "a little later". */
  opts: BakedMonstersOptions;
}

const FIG: MonsterFigure = 'bat';

function world(change: (f: MonsterBakeFile) => void = () => {}, missing: string[] = [], hold = false, more: Partial<BakedMonstersOptions> & { noCanvasAfter?: number; slow?: boolean; cutShort?: boolean } = {}): World {
  const w = { opened: 0, closed: 0, turns: 0, fetched: [] as string[] } as World;
  const held = new Promise<void>((ok) => { w.rest = ok; });
  w.bestiary = makeBestiary();
  const art = w.bestiary.of(FIG);
  w.places = paintOrder(art);
  const n = w.places.length;
  // (a frame for each place, but the last place shows the picture of the one before it; the second half on the second sheet)
  const frames: MonsterBakeFile['frames'] = [];
  const at: number[] = [];
  for (let k = 0; k < n; k++) {
    const fi = Math.min(k, n - 2);
    if (fi === k) frames.push([k < n >> 1 ? 0 : 1, k * 4, 0, 4, 6, k % 2]);
    at.push(...w.places[k], fi);
  }
  w.file = {
    mark: 'm1', figure: FIG, sheets: ['bat-0.png', 'bat-1.png'], frames,
    parts: [{ w: 2, h: 3, ax: 1, ay: 3, density: 2 }, { w: 2, h: 3, ax: 1, ay: 2, density: 2 }] as MonsterBakeFile['parts'],
    lens: figureLens(art), at,
  };
  change(w.file);
  // (its pack as the build makes it, tools/monster_packs.mjs: each sheet's bytes say which sheet they are; `more.cutShort`, a pack
  // that did not come whole)
  const get = async (name: string): Promise<Response> => {
    w.fetched.push(name);
    const ok = !missing.includes(name);
    const pack = packFigure(JSON.parse(JSON.stringify(w.file)), w.file.sheets.map((sh) => new TextEncoder().encode(`the bytes of ${sh}`)));
    return { ok, status: ok ? 200 : 404, blob: async () => new Blob([more.cutShort ? pack.subarray(0, pack.length - 5) : pack]) } as unknown as Response;
  };
  let cuts = 0;
  const open = async (bytes: Blob, name: string): Promise<Sheet> => {
    w.fetched.push(name);
    // (each sheet opened from its own part of the pack, and nothing more)
    assert.equal(await bytes.text(), `the bytes of ${name}`);
    if (hold && name === 'bat-1.png') await held;
    if (missing.includes(name)) throw new Error(`${name}: will not open`);
    w.opened++;
    return {
      cut(_x, _y, cw, ch) {
        if (more.noCanvasAfter !== undefined && cuts >= more.noCanvasAfter) return null;
        cuts++;
        // (a slow device: a frame takes longer to cut than a turn is long)
        if (more.slow) for (const t0 = performance.now(); performance.now() - t0 < 1.2; );
        w.opened++;
        return { width: cw, height: ch, close: () => { w.closed++; } } as unknown as HTMLCanvasElement;
      },
      close() { w.closed++; },
    };
  };
  const later = (f: () => void): void => { w.turns++; setTimeout(f, 0); };
  const { noCanvasAfter: _n, slow: _s, cutShort: _c, ...given } = more;
  w.opts = { get, open, names: [FIG], later, ...given };
  return w;
}

const listsOf = (art: ActorArt): Sprite[][][] => [framesOf(art.front), framesOf(art.back)];
const isPainter = (art: ActorArt, [v, l, i]: [number, number, number]): boolean => typeof Object.getOwnPropertyDescriptor(listsOf(art)[v][l], i)?.get === 'function';
/** How many of a figure's places are still unpainted. */
const unpainted = (w: World, art: ActorArt): number => w.places.filter((p) => isPainter(art, p)).length;
async function settle(b: BakedMonsters, f: MonsterFigure = FIG): Promise<void> {
  for (let n = 0; n < 400 && !b.settled(f); n++) await new Promise((r) => setTimeout(r, 1));
}
async function quiet(): Promise<void> {
  for (let n = 0; n < 40; n++) await new Promise((r) => setTimeout(r, 1));
}

test('taken in: every place of the figure is given its picture from the sheets, nothing is painted; a place painted already keeps its own', async () => {
  const w = world();
  const art = w.bestiary.of(FIG);
  const n = w.places.length;
  assert.ok(n > 40, `the bat has ${n} places`);
  assert.equal(unpainted(w, art), n, 'none painted yet');
  // (the game had painted one frame itself before the files came)
  const [v0, l0, i0] = w.places[3];
  const before = PAINTING.frames;
  const own = listsOf(art)[v0][l0][i0];
  assert.equal(PAINTING.frames, before + 1);
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  assert.equal(b.settled(FIG), false, 'not asked for yet: the loading screen has it to wait for');
  assert.equal(b.take(FIG), true, 'coming');
  assert.equal(b.coming(FIG), true);
  assert.equal(b.settled(FIG), false);
  assert.equal(b.take(FIG), true, 'asked for twice, fetched once');
  await settle(b);
  assert.equal(b.done(FIG), true);
  assert.equal(b.coming(FIG), false);
  assert.deepEqual(w.fetched, ['bat-pack.png', 'bat-0.png', 'bat-1.png'], 'its pack fetched, one file; its two sheets opened from it');
  assert.equal(unpainted(w, art), 0, 'every place has its picture');
  assert.equal(PAINTING.frames, before + 1, 'none painted here');
  assert.ok(listsOf(art)[v0][l0][i0] === own, 'the place the game had painted keeps its own picture');
  // (n - 1 frames in the file; the one for the place painted already is not wanted, and is not cut)
  assert.deepEqual({ ...b.stats, ms: 0, cutMs: 0, cutLongest: 0 }, { given: n - 2, unwanted: 1, loads: 1, stopped: 0, noRoom: 0, ms: 0, cutMs: 0, cutLongest: 0, failed: [] });
  // (and which of its pictures are the bake's is known)
  assert.equal(b.isBaked(listsOf(art)[v0][l0][i0]), false, 'the one painted here');
  assert.equal(b.isBaked(listsOf(art)[w.places[0][0]][w.places[0][1]][w.places[0][2]]), true);
  // (a picture shown in two places is one picture; with its other parts as baked)
  const [va, la, ia] = w.places[n - 2];
  const [vb, lb, ib] = w.places[n - 1];
  assert.ok(listsOf(art)[va][la][ia] === listsOf(art)[vb][lb][ib]);
  const [v1, l1, i1] = w.places[1];
  assert.equal(listsOf(art)[v1][l1][i1].ay, 2);
  assert.equal(listsOf(art)[v1][l1][i1].density, 2);
  // (the two sheets opened and closed again; a canvas cut for each frame wanted, all in hand)
  assert.equal(w.opened, 2 + (n - 2));
  assert.equal(w.closed, 2);
  // (and it is the same asked again: nothing more is fetched)
  assert.equal(b.take(FIG), true);
  assert.equal(w.fetched.length, 3);
});

test('let go with the floor: forgotten by the bestiary, its pictures\' room is given back, and they come again the next time it is asked for', async () => {
  const w = world();
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  b.take(FIG);
  await settle(b);
  const n = w.places.length;
  const art = w.bestiary.of(FIG);
  const [v, l, i] = w.places[0];
  const had = listsOf(art)[v][l][i];
  w.bestiary.forgetOthers(new Set());
  assert.equal(w.closed, 2 + (n - 1), 'every picture in hand given back');
  assert.equal(had.img.width, 1, 'whoever still holds one draws nothing');
  assert.equal(b.done(FIG), false);
  assert.equal(b.coming(FIG), false);
  assert.equal(b.settled(FIG), false, 'the loading screen has it to wait for again');
  // (asked for again: the figure's pictures are made anew, and filled from the files)
  assert.equal(b.take(FIG), true);
  const anew = w.bestiary.of(FIG);
  assert.ok(anew !== art);
  await settle(b);
  assert.equal(b.done(FIG), true);
  assert.equal(unpainted(w, anew), 0);
  assert.equal(b.stats.loads, 2);
  assert.equal(w.fetched.length, 6);
});

test('forgotten while its pictures are still coming: the load stops, nothing of it is left in hand, and nothing is painted', async () => {
  const w = world(() => {}, [], true);
  const before = PAINTING.frames;
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  b.take(FIG);
  // (the first sheet's have come; the second is held back)
  for (let n = 0; n < 400 && w.fetched.length < 3; n++) await new Promise((r) => setTimeout(r, 1));
  await quiet();
  const art = w.bestiary.of(FIG);
  assert.ok(unpainted(w, art) > 0 && unpainted(w, art) < w.places.length, 'half of them here');
  assert.equal(b.coming(FIG), true);
  w.bestiary.forget(FIG);
  assert.equal(b.coming(FIG), false);
  w.rest();
  await quiet();
  assert.equal(b.stats.stopped, 1);
  assert.equal(b.stats.loads, 0);
  assert.deepEqual(b.stats.failed, []);
  assert.equal(w.opened, w.closed, 'whatever was opened is closed');
  assert.equal(w.bestiary.made(FIG), undefined, 'and the stopped load made nothing of the figure again');
  assert.equal(PAINTING.frames, before);
});

test('still coming after five seconds (a slow line): no longer stood in for, painted as it is shown as before, and the files fill the rest as they come', async () => {
  const w = world(() => {}, [], true);
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  b.take(FIG);
  assert.equal(b.coming(FIG), true);
  const real = performance.now;
  (performance as { now: () => number }).now = () => real.call(performance) + STAND_IN_MS + 1;
  try {
    assert.equal(b.coming(FIG), false);
    assert.equal(b.settled(FIG), false);
    assert.equal(b.take(FIG), true, 'still the bake\'s: nobody else is set to paint it');
  } finally {
    (performance as { now: () => number }).now = real;
  }
  w.rest();
  await settle(b);
  assert.equal(b.done(FIG), true);
  assert.equal(unpainted(w, w.bestiary.of(FIG)), 0);
});

test('where they will not come (another bake\'s file, a figure not as it was baked, a sheet missing, no file): it is not asked for again, and is painted as before', async () => {
  // (each in a world of its own, made as its turn comes: a world's stand-ins are the page's)
  const cases: [string, () => World, number][] = [
    ['of another bake', () => world((f) => { f.mark = 'm0'; }), 0],
    ['another figure\'s file', () => world((f) => { f.figure = 'brute'; }), 0],
    ['a list longer than it was baked', () => world((f) => { f.lens[0][0]++; }), 0],
    ['a list more', () => world((f) => { f.lens[1].push(4); }), 0],
    ['the second sheet missing', () => world(() => {}, ['bat-1.png']), 1],
    ['no file at all', () => world(() => {}, ['bat-pack.png']), 0],
    ['a pack that did not come whole', () => world(() => {}, [], false, { cutShort: true }), 0],
  ];
  for (const [what, make, some] of cases) {
    const w = make();
    const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
    assert.equal(b.take(FIG), true, what);
    await settle(b);
    assert.equal(b.done(FIG), false, what);
    assert.equal(b.coming(FIG), false, what);
    assert.equal(b.settled(FIG), true, `${what}: nothing for the loading screen to wait for`);
    assert.equal(b.stats.failed.length, 1, what);
    assert.equal(b.take(FIG), false, `${what}: the painter's and the game's to paint, as before`);
    // (what had come of it before it failed, if any had, stays, the figure's own: let go of with the figure)
    const art = w.bestiary.of(FIG);
    if (!some) assert.equal(unpainted(w, art), w.places.length, what);
    w.bestiary.forget(FIG);
    assert.equal(w.opened, w.closed, `${what}: whatever was opened is closed`);
    assert.equal(b.take(FIG), false, `${what}: not asked for again`);
    // (but by hand: main.ts __dbg)
    b.again();
    assert.equal(b.take(FIG), true, what);
    await settle(b);
    assert.equal(b.stats.failed.length, 2, `${what}: and fails as it did`);
  }
});

test('the frames are cut a few at a time, the page given back to draw between: a turn is never long, however slow the device', async () => {
  // (a device on which one frame takes longer to cut than a turn is long: one a turn, never none)
  const w = world(() => {}, [], false, { slow: true, slice: () => 0.5 });
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  b.take(FIG);
  await settle(b);
  assert.equal(b.done(FIG), true);
  const n = w.places.length;
  assert.equal(b.stats.given, n - 1);
  assert.ok(w.turns >= n - 1, `${w.turns} turns for ${n - 1} frames`);
  assert.ok(b.stats.cutLongest < 15, `the longest turn ${b.stats.cutLongest.toFixed(1)} ms`);
  // (and where it is quick, many a turn: under the loading screen eight thousandths of a second at a time, two in play)
  const q = world();
  const c = new BakedMonsters('m1', () => q.bestiary, q.opts);
  c.take(FIG);
  await settle(c);
  assert.ok(q.turns < 20, `${q.turns} turns`);
  assert.deepEqual(CUT_MS, { loading: 8, play: 2 });
});

test('a phone (little room): a boss\'s pictures are not taken in, the painter\'s as before; and no more of the others at once than it has room for', async () => {
  const w = world(() => {}, [], false, { small: true, names: [FIG, 'queen', 'brute'] });
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  assert.equal(b.has('queen'), false);
  assert.equal(b.take('queen'), false);
  assert.equal(b.settled('queen'), true, 'nothing for the loading screen to wait for');
  assert.equal(b.has(FIG), true);
  assert.equal(b.take(FIG), true);
  await settle(b);
  assert.equal(b.done(FIG), true, 'a small one comes as anywhere');
  // (where there is room for all of it, a boss is the bake's)
  const big = new BakedMonsters('m1', () => w.bestiary, { ...w.opts, small: false });
  assert.equal(big.has('queen'), true);
  // (the room: 64 MB of them at once. A figure that would take it over is left out, as before, and asked for again in the next place)
  assert.equal(SMALL_MOST_MB, 64);
  const full = world((f) => { f.frames[0][3] = 4000; f.frames[0][4] = 4001; }, [], false, { small: true });
  const c = new BakedMonsters('m1', () => full.bestiary, full.opts);
  assert.equal(c.take(FIG), true);
  await settle(c);
  assert.equal(c.done(FIG), false);
  assert.equal(c.settled(FIG), true);
  assert.deepEqual({ noRoom: c.stats.noRoom, failed: c.stats.failed, given: c.stats.given }, { noRoom: 1, failed: [], given: 0 });
  assert.equal(c.take(FIG), false, 'not asked for again in this place');
  c.newPlace();
  assert.equal(c.take(FIG), true, 'but in the next');
  await settle(c);
});

test('no more canvases to be had (an iPhone\'s limit met): the figure coming stops, nothing more is taken in on this page, and all are painted as before', async () => {
  const w = world(() => {}, [], false, { noCanvasAfter: 5, names: [FIG, 'brute'] });
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  assert.equal(b.take(FIG), true);
  await settle(b);
  assert.equal(b.done(FIG), false);
  assert.equal(b.stats.given, 5);
  assert.equal(b.stats.failed.length, 1);
  assert.ok(/no room for more pictures/.test(b.stats.failed[0]), b.stats.failed[0]);
  assert.equal(b.take(FIG), false);
  assert.equal(b.take('brute'), false, 'nor any other figure');
  assert.equal(b.settled('brute'), true);
  // (the five that came are the figure's own, let go of with it; both sheets are closed)
  w.bestiary.forget(FIG);
  assert.equal(w.opened, w.closed);
});

test('a figure that is not baked, and the switch off: nothing is fetched, nothing waited for', async () => {
  const w = world();
  const b = new BakedMonsters('m1', () => w.bestiary, w.opts);
  assert.equal(b.take('brute'), false);
  assert.equal(b.settled('brute'), true);
  assert.equal(b.coming('brute'), false);
  MONSTERS_BAKED.on = false;
  try {
    assert.equal(b.take(FIG), false);
    assert.equal(b.settled(FIG), true);
    assert.equal(b.coming(FIG), false);
  } finally {
    MONSTERS_BAKED.on = true;
  }
  await quiet();
  assert.deepEqual(w.fetched, []);
  assert.equal(w.bestiary.made(FIG) !== undefined, true, 'the world made the bat; the switch made nothing more');
});

test('a figure\'s pack, as the build makes it (tools/monster_packs.mjs) and the game reads it: its file whole, each sheet its own bytes; one file a figure', async () => {
  // (sheets of different lengths, bytes of every value: a PNG's bytes are not text)
  const sheets = [0, 1, 2].map((k) => Uint8Array.from({ length: 300 + 97 * k }, (_, i) => (i * 7 + k * 31) % 256));
  const file = { mark: 'm1', figure: 'fieldhand:1', sheets: ['fieldhand_1-0.png', 'fieldhand_1-1.png', 'fieldhand_1-2.png'], frames: [[0, 0, 0, 4, 6, 0]], parts: [{ w: 2, h: 3, ax: 1, ay: 3 }], lens: [[1], []], at: [0, 0, 0, 0], note: 'é and ü' };
  const pack = packFigure(file, sheets);
  assert.equal(packName(bakeName('fieldhand:1')), 'fieldhand_1-pack.png');
  // (a PNG by its first bytes: the page serves only the kinds of file it knows)
  assert.deepEqual([...pack.subarray(0, 4)], [...sheets[0].subarray(0, 4)]);
  assert.equal(new TextDecoder().decode(pack.subarray(pack.length - 12, pack.length - 8)), PACK_TAIL);
  const got = await readPack(new Blob([pack]), 'fieldhand_1');
  const { packed, ...rest } = got.file;
  assert.deepEqual(rest, file, 'its file as it was made, a letter that is not plain ASCII among it');
  assert.equal(packed!.length, 3);
  for (let s = 0; s < 3; s++) assert.deepEqual(new Uint8Array(await got.sheet(s).arrayBuffer()), sheets[s], `sheet ${s}`);
  assert.equal(got.sheet(1).type, 'image/png');
  // (the tool's own reading of it, for the build's check, the same)
  assert.deepEqual(readPackHere(pack).sheets.map((b) => b.length), sheets.map((b) => b.length));
  // (what is not a pack is not read as one)
  for (const bad of [pack.subarray(0, pack.length - 1), sheets[0], new Uint8Array(0)]) assert.equal(await readPack(new Blob([bad as Uint8Array<ArrayBuffer>])).then(() => 'read', (e: Error) => e.message), 'a pack: not a pack');
});
