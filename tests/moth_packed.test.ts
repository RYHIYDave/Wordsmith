// THE MOTH'S PICTURES KEPT PACKED, UNPACKED A MOVE AT A TIME (render/painter.ts PACKED; the queue's
// keep-moths-pictures-from-filling-memory, 12 Nov 2026). The page's side, with a worker that is only a stand-in: what is taken in,
// asked for, let go of and given back. (The worker's own packing and unpacking is the browser's: tools/scenarios/moth_memory.mjs.)
//   test: tsx --test tests/moth_packed.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { LEFT_TO_PAINTER, STAND_IN, lazyFrames, unpaintFrame } from '../src/art/kit';
import { framesOf, giveFrame } from '../src/art/bestiary';
import type { Bestiary } from '../src/art/bestiary';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { RETIRE_MS, reapRetired, retireSprite } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { PACKED, PAINTER_MARK, Painter } from '../src/render/painter';

/** A picture handed over (an ImageBitmap's stand-in): its size, and whether it was closed. */
interface Pic {
  width: number;
  height: number;
  closed: boolean;
  close(): void;
}
const pic = (w = 100, h = 50): Pic => ({ width: w, height: h, closed: false, close() { this.closed = true; this.width = 0; this.height = 0; } });
const sprite = (p: Pic): Sprite => ({ img: p as unknown as HTMLCanvasElement, w: p.width / 2, h: p.height / 2, ax: 1, ay: 2, density: 2 });

/** How many frames were painted here (none should be, for a figure left to the painter). */
let paintedHere = 0;
const list = (n: number): Sprite[] => lazyFrames(n, () => (paintedHere++, sprite(pic())));
const set = (): AnimSet => ({ idle: list(6), walk: list(6), idleFps: 15, walkFps: 15, clips: { attack: { frames: list(8), fps: 30, hit: 0.1 }, die: { frames: list(5), fps: 20 }, reel: { frames: list(3), fps: 30 }, moves: { dust: { frames: list(7), fps: 30 } } } });

test('a frame of lazy frames made lazy again: painted again when asked for, or shown a stand-in while the painter has it', () => {
  paintedHere = 0;
  const frames = list(5);
  const a = frames[2];
  assert.equal(paintedHere, 1);
  assert.equal(unpaintFrame(frames, 2), a, 'its picture handed back to be given back');
  assert.equal(unpaintFrame(frames, 2), null, 'once');
  const d = Object.getOwnPropertyDescriptor(frames, 2);
  assert.equal(typeof d?.get, 'function', 'lazy again');
  // (left to the painter: the nearest painted shown, and which was asked for told)
  void frames[0];
  LEFT_TO_PAINTER.on = true;
  const n0 = STAND_IN.n;
  try {
    assert.equal(frames[2], frames[0]);
  } finally {
    LEFT_TO_PAINTER.on = false;
  }
  assert.equal(STAND_IN.n, n0 + 1);
  assert.equal(STAND_IN.list, frames);
  assert.equal(STAND_IN.i, 2);
  // (the painter's picture taken in again, as the first time)
  const b = sprite(pic());
  assert.ok(giveFrame({ front: { idle: frames, walk: [], idleFps: 1, walkFps: 1 }, back: { idle: [], walk: [], idleFps: 1, walkFps: 1 } }, 0, 0, 2, b));
  assert.equal(frames[2], b);
});

test('a picture given back sooner than RETIRE_MS when asked', () => {
  reapRetired(true);
  const soon = pic();
  const late = pic();
  retireSprite(sprite(late));
  retireSprite(sprite(soon), 0);
  reapRetired();
  assert.ok(soon.closed, 'its moment up');
  assert.ok(!late.closed, `not before RETIRE_MS (${RETIRE_MS} ms)`);
  reapRetired(true);
  assert.ok(late.closed);
});

/** A worker that is only a stand-in: what the page asks of it, kept. */
class FakeWorker {
  static made: FakeWorker[] = [];
  asked: { t: string; [k: string]: unknown }[] = [];
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onerror: unknown = null;
  constructor() {
    FakeWorker.made.push(this);
  }
  postMessage(m: { t: string }): void {
    this.asked.push(m);
  }
  terminate(): void {}
  tell(data: unknown): void {
    this.onmessage?.({ data });
  }
}

/** A painter on a page with a stand-in worker, a bestiary of one figure (the Moth's lists, few and small). */
function rig(): { p: Painter; w: () => FakeWorker; art: ActorArt; done: () => void } {
  const g = globalThis as unknown as Record<string, unknown>;
  const had = { Worker: g.Worker, OffscreenCanvas: g.OffscreenCanvas };
  g.Worker = FakeWorker;
  g.OffscreenCanvas = class {};
  FakeWorker.made = [];
  const art: ActorArt = { front: set(), back: set() };
  const bestiary = { of: () => art, forget: () => {} } as unknown as Bestiary;
  const p = new Painter(`/* ${PAINTER_MARK} */`, () => bestiary, { small: true, many: 1 });
  return {
    p,
    w: () => FakeWorker.made[FakeWorker.made.length - 1],
    art,
    done: () => {
      p.restart();
      g.Worker = had.Worker;
      g.OffscreenCanvas = had.OffscreenCanvas;
    },
  };
}
/** Frames of a list as handed over: [way round, list, frame] with a picture of their own. */
const given = (at: [number, number, number][]): { v: number; l: number; i: number; s: Sprite }[] => at.map(([v, l, i]) => ({ v, l, i, s: sprite(pic()) }));
const firsts = (art: ActorArt): [number, number, number][] => [art.front, art.back].flatMap((s, v) => framesOf(s).map((_, l) => [v, l, 0] as [number, number, number]));

test('THE MOTH KEPT PACKED: its moves first frames held, a move asked for as it is shown, taken in, and let go of over its budget', () => {
  const { p, w, art, done } = rig();
  const was = { ...PACKED.budgetMB };
  const hold = PACKED.holdMs;
  try {
    paintedHere = 0;
    assert.ok(p.mob('moth'));
    const worker = w();
    worker.tell({ t: 'ready' });
    assert.equal(p.packs('moth'), false, 'not known yet');
    // (its first frames, as its worker hands them over, saying it packs it)
    const first = given(firsts(art));
    worker.tell({ t: 'frames', figure: 'moth', list: first, left: 100, packs: true, packed: first.length, packedBytes: 1000 });
    assert.equal(p.packs('moth'), true);
    let st = p.packedStats('moth')!;
    assert.equal(st.kept, firsts(art).length);
    assert.equal(st.unpacked, 0);
    assert.ok(first.every((g) => !(g.s.img as unknown as Pic).closed));
    // (a frame of a move not asked for, on its way: not taken)
    const stray = given([[0, 2, 3]]);
    worker.tell({ t: 'frames', figure: 'moth', list: stray, left: 99, packs: true });
    assert.ok((stray[0].s.img as unknown as Pic).closed, 'closed, not held');
    assert.equal(typeof Object.getOwnPropertyDescriptor(art.front.clips!.attack!.frames, 3)?.get, 'function');
    // ITS ATTACK SHOWN: a stand-in for frame 3 (only its first frame is here), and so asked for from frame 3
    const attack = art.front.clips!.attack!.frames;
    LEFT_TO_PAINTER.on = true;
    const n0 = STAND_IN.n;
    const shownNow = attack[3];
    LEFT_TO_PAINTER.on = false;
    assert.equal(shownNow, first.find((g) => g.v === 0 && g.l === 2)!.s, 'its first frame stands in');
    assert.equal(paintedHere, 0, 'nothing painted here');
    p.shown('moth', shownNow, STAND_IN.n !== n0);
    const ask = worker.asked.filter((a) => a.t === 'unpack');
    assert.deepEqual(ask.map((a) => [a.v, a.l, a.from]), [[0, 2, 3]]);
    p.shown('moth', shownNow, false);
    assert.equal(worker.asked.filter((a) => a.t === 'unpack').length, 1, 'asked once');
    // (unpacked, taken in)
    const up = given([3, 4, 5, 6, 7, 1, 2].map((i) => [0, 2, i] as [number, number, number]));
    worker.tell({ t: 'unpacked', figure: 'moth', list: up });
    st = p.packedStats('moth')!;
    assert.equal(st.unpacked, 7);
    assert.equal(attack[5], up[2].s);
    // OVER ITS BUDGET, ANOTHER MOVE SHOWN: the attack, shown longest ago, let go of
    PACKED.budgetMB.small = 0.00001;
    PACKED.holdMs = -1;
    const dust = art.front.clips!.moves!.dust.frames;
    p.shown('moth', dust[0], false);
    st = p.packedStats('moth')!;
    assert.equal(st.letGo >= 1, true);
    assert.equal(typeof Object.getOwnPropertyDescriptor(attack, 5)?.get, 'function', 'lazy again');
    assert.deepEqual(worker.asked.filter((a) => a.t === 'unwant').map((a) => [a.v, a.l]).slice(0, 1), [[0, 2]]);
    reapRetired(true);
    assert.ok(up.every((g) => (g.s.img as unknown as Pic).closed), 'given back');
    assert.ok(!(first[2].s.img as unknown as Pic).closed, 'its first frame held still');
    // (a frame of it still on its way after it was let go of: not taken)
    const late = given([[0, 2, 4]]);
    worker.tell({ t: 'unpacked', figure: 'moth', list: late });
    assert.ok((late[0].s.img as unknown as Pic).closed);
    // (shown again: asked for again)
    p.shown('moth', attack[0], false);
    assert.equal(worker.asked.filter((a) => a.t === 'unpack' && a.l === 2).length, 2);
    // ITS WORKER KEPT ONCE ITS PAINTING IS DONE (ended, what it packed would be gone)
    worker.tell({ t: 'frames', figure: 'moth', list: [], left: 0, packs: true });
    assert.equal(p.packs('moth'), true);
    p.shown('moth', dust[0], false);
    assert.ok(worker.asked.some((a) => a.t === 'unpack' && a.l !== 2));
  } finally {
    PACKED.budgetMB.small = was.small;
    PACKED.budgetMB.big = was.big;
    PACKED.holdMs = hold;
    done();
  }
});

test('where its worker cannot pack, every frame is taken in as before, and nothing is let go of', () => {
  const { p, w, art, done } = rig();
  try {
    assert.ok(p.mob('moth'));
    const worker = w();
    worker.tell({ t: 'ready' });
    const all = given([...firsts(art), [0, 2, 3], [1, 5, 1]]);
    worker.tell({ t: 'frames', figure: 'moth', list: all, left: 50, packs: false });
    assert.equal(p.packs('moth'), false);
    assert.ok(all.every((g) => !(g.s.img as unknown as Pic).closed));
    assert.equal(art.front.clips!.attack!.frames[3], all[all.length - 2].s);
    p.shown('moth', art.front.clips!.attack!.frames[3], false);
    assert.equal(worker.asked.filter((a) => a.t === 'unpack').length, 0);
  } finally {
    done();
  }
});

test('the Moth is the one kept packed, and on', () => {
  assert.ok(PACKED.on);
  assert.deepEqual([...PACKED.figures], ['moth']);
});
