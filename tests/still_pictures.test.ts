// A STEADY PLACE'S FLOOR, GLOWS AND DARK AS ONE PICTURE EACH (render/still_floor.ts, still_glows.ts, still_dark.ts; his words, 7
// Nov 2026, 23:11: “Still a ton of lag in the town”): what each lays into its picture and where, in the game's order; that the
// picture is drawn where the pieces were, whatever part of it is on the screen; that it is made once and made again only when
// what it hangs on is another; that it is left to the game (nothing drawn) wherever the picture could not be the same: a canvas
// turned or scaled by a part of a pixel, a camera not on a whole pixel, its switch off. On canvases that only write down what is
// drawn on them (this file's own): that the pictures are the same on the screen is the browser's to say
// (tools/scenarios/town_same.mjs).
//   run: tsx --test tests/still_pictures.test.ts

// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { Level } from '../src/game/state';
import type { Cam } from '../src/render/fx';
import type { LookLight } from '../src/render/looks';
import { STILL_DARK, StillDark } from '../src/render/still_dark';
import { STILL_FLOOR, StillFloor } from '../src/render/still_floor';
import { STILL_GLOWS, StillGlows } from '../src/render/still_glows';

// ---- a canvas that writes down what is drawn on it ------------------------------------------------------------------------
interface Call {
  op: 'drawImage' | 'fillRect';
  a: number[];
  img?: unknown;
  gco: string;
  alpha: number;
  smooth: boolean;
  fill: string;
  k: number;
}
interface Ctx {
  canvas: Can;
  calls: Call[];
  globalCompositeOperation: string;
  globalAlpha: number;
  imageSmoothingEnabled: boolean;
  fillStyle: string;
  T: number[];
}
interface Can {
  width: number;
  height: number;
  ctx: Ctx | null;
  opts: unknown;
  getContext(kind: string, opts?: unknown): unknown;
}
const made: Can[] = [];
function canvas(): Can {
  const can: Can = {
    width: 0,
    height: 0,
    ctx: null,
    opts: undefined,
    getContext(_kind: string, opts?: unknown): unknown {
      if (can.ctx) return can.ctx;
      can.opts = opts;
      const c = {
        canvas: can,
        calls: [] as Call[],
        globalCompositeOperation: 'source-over',
        globalAlpha: 1,
        imageSmoothingEnabled: true,
        fillStyle: '#000000',
        T: [1, 0, 0, 1, 0, 0],
        setTransform(a: number, b: number, cc: number, d: number, e: number, f: number): void {
          c.T = [a, b, cc, d, e, f];
        },
        getTransform(): { a: number; b: number; c: number; d: number; e: number; f: number } {
          return { a: c.T[0], b: c.T[1], c: c.T[2], d: c.T[3], e: c.T[4], f: c.T[5] };
        },
        drawImage(img: unknown, ...a: number[]): void {
          c.calls.push({ op: 'drawImage', a, img, gco: c.globalCompositeOperation, alpha: c.globalAlpha, smooth: c.imageSmoothingEnabled, fill: c.fillStyle, k: c.T[0] });
        },
        fillRect(...a: number[]): void {
          c.calls.push({ op: 'fillRect', a, gco: c.globalCompositeOperation, alpha: c.globalAlpha, smooth: c.imageSmoothingEnabled, fill: c.fillStyle, k: c.T[0] });
        },
        createRadialGradient(): { addColorStop(): void } {
          return { addColorStop(): void {} };
        },
      };
      can.ctx = c as unknown as Ctx;
      return can.ctx;
    },
  };
  made.push(can);
  return can;
}
(globalThis as unknown as { document: unknown }).document = { createElement: () => canvas() };

/** A screen as the game's is: `k` picture pixels to a game pixel, nothing smoothed. */
function screen(k = 2): Ctx {
  const c = canvas().getContext('2d') as unknown as Ctx & { setTransform(...a: number[]): void };
  c.setTransform(k, 0, 0, k, 0, 0);
  c.imageSmoothingEnabled = false;
  return c;
}
const G = (c: Ctx): CanvasRenderingContext2D => c as unknown as CanvasRenderingContext2D;
/** A place 10 tiles by 10, all of it seen. */
function place(): Level {
  return { explored: new Uint8Array(100).fill(1), floor: { w: 10, h: 10 } } as unknown as Level;
}
const W = 240;
const H = 135;
/** The pictures made since `n` canvases had been (the fakes made for a small soft glow are 64 by 64: left out). */
const since = (n: number): Can[] => made.slice(n).filter((c) => c.ctx && !(c.width === 64 && c.height === 64));

// ---- the steady glows -----------------------------------------------------------------------------------------------------
const glow = (x: number, y: number, r: number, a: number, more: Partial<LookLight> = {}): LookLight => ({ x, y, up: 0, r: 0, strength: 0, glow: { r, color: '#ffeccc', a }, still: true, ...more });
const LIGHTS: LookLight[] = [
  glow(2.5, 2.5, 40, 0.05),
  glow(6, 3, 30, 0.08, { up: 20, dx: 3 }),
  // (a fire's: it flickers, and is the game's to draw)
  glow(4, 4, 25, 0.3, { still: false }),
  glow(7.25, 7.75, 50, 0.04),
  // (a hole with no glow)
  { x: 5, y: 5, up: 0, r: 40, strength: 0.6, glow: null, still: true },
];
/** Where the game draws a glow with the camera's corner at the world's: its middle (render.ts: wx + dx, wy - up). */
const mid = (q: LookLight): [number, number] => [(q.x - q.y) * 16 + (q.dx ?? 0), (q.x + q.y) * 8 - q.up];

test('the steady glows are laid once into one picture, each where and as the game draws it, and the picture is added where they were', () => {
  const S = new StillGlows();
  const L = place();
  const g = screen();
  const n0 = made.length;
  const cam: Cam = { ox: 100, oy: -20 };
  assert.equal(S.draw(G(g), cam, W, H, L, LIGHTS), true);
  assert.equal(S.stats.made, 1);
  const pics = since(n0);
  assert.equal(pics.length, 1, 'one picture');
  const pic = pics[0];
  const steady = LIGHTS.filter((q) => q.glow && q.still);
  // (its corner: a game pixel clear of the glow furthest up and left)
  const x0 = Math.floor(Math.min(...steady.map((q) => mid(q)[0] - q.glow!.r))) - 1;
  const y0 = Math.floor(Math.min(...steady.map((q) => mid(q)[1] - q.glow!.r))) - 1;
  const x1 = Math.ceil(Math.max(...steady.map((q) => mid(q)[0] + q.glow!.r))) + 1;
  const y1 = Math.ceil(Math.max(...steady.map((q) => mid(q)[1] + q.glow!.r))) + 1;
  assert.deepEqual([pic.width, pic.height], [(x1 - x0) * 2, (y1 - y0) * 2], 'as large as the glows, at the screen’s grain');
  const laid = pic.ctx!.calls;
  assert.equal(laid.length, steady.length, 'a glow each, and none of the fire’s nor of the hole with no glow');
  laid.forEach((c, i) => {
    const q = steady[i];
    const [mx, my] = mid(q);
    assert.equal(c.gco, 'lighter');
    assert.equal(c.alpha, q.glow!.a);
    assert.equal(c.smooth, false, 'stretched as the screen stretches it');
    assert.equal(c.k, 2);
    assert.deepEqual(c.a, [mx - x0 - q.glow!.r, my - y0 - q.glow!.r, q.glow!.r * 2, q.glow!.r * 2], `glow ${i} where the game draws it`);
  });
  // on the screen: one picture, added, the part of it that is on the screen, a picture pixel to a pixel
  assert.equal(g.calls.length, 1);
  const d = g.calls[0];
  assert.equal(d.img, pic);
  assert.equal(d.gco, 'lighter');
  assert.equal(d.alpha, 1);
  const [sx, sy, sw, sh, dx, dy, dw, dh] = d.a;
  assert.deepEqual([sw, sh], [dw * 2, dh * 2], 'not stretched');
  assert.deepEqual([sx, sy], [(dx - (cam.ox + x0)) * 2, (dy - (cam.oy + y0)) * 2], 'each of its pixels where its glows fall');
  assert.ok(dx >= 0 && dy >= 0 && dx + dw <= W && dy + dh <= H, 'only what is on the screen');
  assert.deepEqual([dx, dy, dx + dw, dy + dh], [Math.max(0, cam.ox + x0), Math.max(0, cam.oy + y0), Math.min(W, cam.ox + x1), Math.min(H, cam.oy + y1)]);
  assert.deepEqual([g.globalCompositeOperation, g.globalAlpha], ['source-over', 1], 'the screen left as it was');
  // the camera moved: the same picture, moved with it
  const cam2: Cam = { ox: 63, oy: 11 };
  assert.equal(S.draw(G(g), cam2, W, H, L, LIGHTS), true);
  assert.equal(S.stats.made, 1, 'not made again');
  const e = g.calls[1].a;
  assert.deepEqual([e[0], e[1]], [(e[4] - (cam2.ox + x0)) * 2, (e[5] - (cam2.oy + y0)) * 2]);
  assert.equal(S.stats.drawn, 2);
  assert.ok(S.bytes() > 0);
  S.forget();
  assert.equal(S.bytes(), 0);
  assert.deepEqual([pic.width, pic.height], [0, 0], 'its room given back');
});

test('the glows’ picture is made again when another of them is lit, and is left to the game wherever it could not be the same', () => {
  const S = new StillGlows();
  const L = place();
  const g = screen();
  const cam: Cam = { ox: 100, oy: -20 };
  const n0 = made.length;
  assert.equal(S.draw(G(g), cam, W, H, L, LIGHTS), true);
  // (the tile of the last glow not yet seen: the game would not draw it)
  L.explored[7 * 10 + 7] = 0;
  assert.equal(S.draw(G(g), cam, W, H, L, LIGHTS), true);
  assert.equal(S.stats.made, 2);
  const pics = since(n0);
  assert.equal(pics[pics.length - 1].ctx!.calls.length, 2, 'only the two that are lit');
  L.explored[7 * 10 + 7] = 1;
  const before = g.calls.length;
  // a camera part way between pixels (it never is: the game rounds it), a screen turned, one scaled by a part of a pixel, one moved by one
  assert.equal(S.draw(G(g), { ox: 100.5, oy: -20 }, W, H, L, LIGHTS), false);
  for (const T of [[0, 2, -2, 0, 0, 0], [1.5, 0, 0, 1.5, 0, 0], [2, 0, 0, 2, 0.5, 0], [2, 0, 0, 3, 0, 0]]) {
    const t = screen();
    t.T = T;
    assert.equal(S.draw(G(t), cam, W, H, L, LIGHTS), false, `not on a screen set ${T}`);
    assert.equal(t.calls.length, 0, 'and nothing drawn');
  }
  // a single steady glow is the game's to draw
  assert.equal(S.draw(G(g), cam, W, H, L, [LIGHTS[0], LIGHTS[2]]), false);
  // its switch off
  STILL_GLOWS.on = false;
  try {
    assert.equal(S.draw(G(g), cam, W, H, L, LIGHTS), false);
  } finally {
    STILL_GLOWS.on = true;
  }
  assert.equal(g.calls.length, before, 'nothing drawn on the screen by any of those');
  // too large a picture is not made
  const most = STILL_GLOWS.most;
  STILL_GLOWS.most = 1000;
  try {
    const S2 = new StillGlows();
    assert.equal(S2.draw(G(g), cam, W, H, L, LIGHTS), false);
    assert.equal(S2.bytes(), 0);
  } finally {
    STILL_GLOWS.most = most;
  }
});

// ---- the floor ------------------------------------------------------------------------------------------------------------
test('the floor is laid once on the game’s black into one picture, by the game’s own drawing, and drawn where its tiles were', () => {
  const F = new StillFloor();
  const g = screen();
  const tileA = { name: 'a' };
  const tileB = { name: 'b' };
  let lays = 0;
  // (the game's own drawing of the floor: two pictures, from the camera's corner)
  const lay = (c: CanvasRenderingContext2D, cam: Cam): void => {
    lays++;
    c.drawImage(tileA as unknown as CanvasImageSource, cam.ox - 40.5, cam.oy + 16, 32, 17);
    c.drawImage(tileB as unknown as CanvasImageSource, cam.ox + 200, cam.oy + 96, 64, 80);
  };
  const key = [tileA, 7];
  const cam: Cam = { ox: 30, oy: -60 };
  const n0 = made.length;
  assert.equal(F.draw(G(g), cam, W, H, '#07050a', key, lay), true);
  assert.equal(lays, 2, 'laid once to see how large it is, once on its picture');
  const pic = since(n0)[0];
  const [x0, y0, x1, y1] = [-41, 16, 264, 176];
  assert.deepEqual([pic.width, pic.height], [(x1 - x0) * 2, (y1 - y0) * 2]);
  assert.deepEqual(pic.opts, { alpha: false }, 'a picture with nothing clear in it');
  const laid = pic.ctx!.calls;
  assert.deepEqual([laid[0].op, laid[0].fill, laid[0].a, laid[0].k], ['fillRect', '#07050a', [0, 0, pic.width, pic.height], 1], 'the game’s black first, over all of it');
  assert.deepEqual(laid.slice(1).map((c) => [c.img, c.a, c.k, c.smooth, c.gco]), [
    [tileA, [-x0 - 40.5, -y0 + 16, 32, 17], 2, false, 'source-over'],
    [tileB, [-x0 + 200, -y0 + 96, 64, 80], 2, false, 'source-over'],
  ]);
  assert.equal(g.calls.length, 1);
  const [sx, sy, sw, sh, dx, dy, dw, dh] = g.calls[0].a;
  assert.equal(g.calls[0].img, pic);
  assert.deepEqual([sw, sh], [dw * 2, dh * 2], 'not stretched');
  assert.deepEqual([sx, sy], [(dx - (cam.ox + x0)) * 2, (dy - (cam.oy + y0)) * 2]);
  assert.deepEqual([dx, dy, dx + dw, dy + dh], [Math.max(0, cam.ox + x0), Math.max(0, cam.oy + y0), Math.min(W, cam.ox + x1), Math.min(H, cam.oy + y1)]);
  // the same floor, the camera moved: not made again
  assert.equal(F.draw(G(g), { ox: -100, oy: 20 }, W, H, '#07050a', [tileA, 7], lay), true);
  assert.equal(lays, 2);
  assert.equal(F.stats.made, 1);
  // what it hangs on is another (a tile seen that was not): made again
  assert.equal(F.draw(G(g), cam, W, H, '#07050a', [tileA, 8], lay), true);
  assert.equal(lays, 4);
  assert.equal(F.stats.made, 2);
  assert.deepEqual([pic.width, pic.height], [0, 0], 'the old one’s room given back');
  F.forget();
  assert.equal(F.bytes(), 0);
});

test('the floor is left to the game wherever its picture could not be the same', () => {
  const F = new StillFloor();
  const tile = {};
  const lay = (c: CanvasRenderingContext2D, cam: Cam): void => c.drawImage(tile as unknown as CanvasImageSource, cam.ox, cam.oy, 32, 17);
  const cam: Cam = { ox: 30, oy: 20 };
  for (const T of [[0, 2, -2, 0, 0, 0], [1.5, 0, 0, 1.5, 0, 0], [2, 0, 0, 2, 0, 0.25]]) {
    const t = screen();
    t.T = T;
    assert.equal(F.draw(G(t), cam, W, H, '#07050a', [1], lay), false);
    assert.equal(t.calls.length, 0);
  }
  const g = screen();
  assert.equal(F.draw(G(g), { ox: 30.5, oy: 20 }, W, H, '#07050a', [1], lay), false);
  // something being drawn faint, or added, when the floor's turn comes (it never is): left
  g.globalAlpha = 0.5;
  assert.equal(F.draw(G(g), cam, W, H, '#07050a', [1], lay), false);
  g.globalAlpha = 1;
  // a floor laid with a part of a picture (none is): it cannot be measured, and is left
  const part = (c: CanvasRenderingContext2D, at: Cam): void => c.drawImage(tile as unknown as CanvasImageSource, 0, 0, 8, 8, at.ox, at.oy, 8, 8);
  assert.equal(F.draw(G(g), cam, W, H, '#07050a', [2], part), false);
  STILL_FLOOR.on = false;
  try {
    assert.equal(F.draw(G(g), cam, W, H, '#07050a', [1], lay), false);
  } finally {
    STILL_FLOOR.on = true;
  }
  assert.equal(g.calls.length, 0, 'nothing drawn on the screen by any of those');
  assert.equal(F.draw(G(g), cam, W, H, '#07050a', [1], lay), true);
  assert.equal(g.calls.length, 1);
});

// ---- the dark -------------------------------------------------------------------------------------------------------------
test('the dark’s steady holes are cut once in a veil, each where and as the game cuts it, and that veil laid over the whole of the dark', () => {
  const D = new StillDark();
  const pool = { name: 'pool' } as unknown as CanvasImageSource;
  const spots = [
    { x: 10.4, y: 20.6, r: 40, strength: 0.6 },
    { x: 150.5, y: 90, r: 24.3, strength: 0.85 },
    // (no light at all: the game cuts nothing for it)
    { x: 60, y: 60, r: 50, strength: 0 },
    { x: 300, y: 140, r: 48, strength: 1.4 },
  ];
  const dark = canvas().getContext('2d') as unknown as Ctx;
  const veil = 'rgba(26,18,12,0.1)';
  const n0 = made.length;
  let asked = 0;
  const cam: Cam = { ox: -20, oy: 10 };
  assert.equal(D.draw(G(dark), cam, W, H, veil, pool, [1], () => (asked++, spots)), true);
  assert.equal(asked, 1);
  const pic = since(n0)[0];
  // (render.ts light, `spot`: a hole's box, each side rounded to a whole pixel)
  const box = (q: { x: number; y: number; r: number }): number[] => [Math.round(q.x - q.r), Math.round(q.y - q.r * 0.62), Math.round(q.r * 2), Math.round(q.r * 1.24)];
  const lit = spots.filter((q) => q.strength > 0);
  const x0 = Math.min(...lit.map((q) => box(q)[0]));
  const y0 = Math.min(...lit.map((q) => box(q)[1]));
  const x1 = Math.max(...lit.map((q) => box(q)[0] + box(q)[2]));
  const y1 = Math.max(...lit.map((q) => box(q)[1] + box(q)[3]));
  assert.deepEqual([pic.width, pic.height], [x1 - x0, y1 - y0], 'a game pixel to a pixel, as the dark is');
  const laid = pic.ctx!.calls;
  assert.deepEqual([laid[0].op, laid[0].fill, laid[0].a, laid[0].gco], ['fillRect', veil, [0, 0, x1 - x0, y1 - y0], 'source-over'], 'the veil first');
  assert.deepEqual(laid.slice(1).map((c) => [c.img, c.gco, c.smooth, c.alpha, c.a]), lit.map((q) => [pool, 'destination-out', true, Math.min(1, q.strength), [box(q)[0] - x0, box(q)[1] - y0, box(q)[2], box(q)[3]]]), 'each hole cut as the game cuts it, in its order');
  // on the dark: the picture copied where it is, the plain veil wherever it does not reach: every pixel of the dark once
  const cover = new Uint8Array(W * H);
  for (const c of dark.calls) {
    const [x, y, w, h] = c.op === 'drawImage' ? c.a.slice(4) : c.a;
    assert.equal(c.gco, 'source-over');
    assert.equal(c.alpha, 1);
    if (c.op === 'drawImage') {
      assert.equal(c.img, pic);
      assert.equal(c.smooth, false, 'copied as it is');
      assert.deepEqual([c.a[2], c.a[3]], [w, h], 'not stretched');
      assert.deepEqual([c.a[0], c.a[1]], [x - (cam.ox + x0), y - (cam.oy + y0)]);
    } else assert.equal(c.fill, veil);
    assert.ok(x >= 0 && y >= 0 && x + w <= W && y + h <= H);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) cover[j * W + i]++;
  }
  assert.ok(cover.every((v) => v === 1), 'the whole of the dark laid once');
  assert.equal(dark.imageSmoothingEnabled, true, 'the dark’s smoothing left as it was');
  // the camera far off: the plain veil over all of it
  const far = canvas().getContext('2d') as unknown as Ctx;
  assert.equal(D.draw(G(far), { ox: 5000, oy: 0 }, W, H, veil, pool, [1], () => spots), true);
  assert.deepEqual(far.calls.map((c) => [c.op, c.a, c.fill]), [['fillRect', [0, 0, W, H], veil]]);
  assert.equal(D.stats.made, 1, 'not made again');
  // another veil (a boss's dark, another place's): made again
  assert.equal(D.draw(G(far), cam, W, H, 'rgba(6,4,14,0.8)', pool, [1], () => spots), true);
  assert.equal(D.stats.made, 2);
  D.forget();
  assert.equal(D.bytes(), 0);
});

test('the dark is left to the game wherever its picture could not be laid', () => {
  const D = new StillDark();
  const pool = {} as unknown as CanvasImageSource;
  const spots = [{ x: 10, y: 20, r: 40, strength: 0.6 }, { x: 100, y: 60, r: 30, strength: 0.6 }];
  const cam: Cam = { ox: 0, oy: 0 };
  const scaled = canvas().getContext('2d') as unknown as Ctx;
  scaled.T = [2, 0, 0, 2, 0, 0];
  assert.equal(D.draw(G(scaled), cam, W, H, 'v', pool, [1], () => spots), false);
  const dark = canvas().getContext('2d') as unknown as Ctx;
  assert.equal(D.draw(G(dark), { ox: 0.5, oy: 0 }, W, H, 'v', pool, [1], () => spots), false);
  // one steady hole alone is the game's to cut
  assert.equal(D.draw(G(dark), cam, W, H, 'v', pool, [2], () => spots.slice(0, 1)), false);
  STILL_DARK.on = false;
  try {
    assert.equal(D.draw(G(dark), cam, W, H, 'v', pool, [1], () => spots), false);
  } finally {
    STILL_DARK.on = true;
  }
  assert.equal(scaled.calls.length + dark.calls.length, 0, 'nothing drawn by any of those');
  assert.equal(D.draw(G(dark), cam, W, H, 'v', pool, [1], () => spots), true);
});
