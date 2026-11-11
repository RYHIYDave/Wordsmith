// PICTURES GIVEN BACK, NOT ONLY FORGOTTEN (engine/px.ts retireSprite, reapRetired; render/act1_fx/kept.ts). His words, 11 Nov
// 2026: “Please check on some lag and freezing issues after playing a few levels on my game.  Don’t know if it’s just memory
// leak or if something else is going on”; his pick, asked how to have it fixed: “Fix it here (Recommended)”.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { FLIP_BUDGET, TINT_BUDGET, flipSprite, flippedPixels, reapRetired, releaseSprite, retireSprite, retiredPixels, silhouette, tintedPixels } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { forgetUnusedPictures, keptPictures, onNewPlace } from '../src/render/act1_fx/kept';

/** A canvas that takes whatever is drawn on it and does nothing: sizes are what is counted. */
function withCanvases(run: () => void): void {
  const g = globalThis as unknown as { document?: unknown };
  const had = g.document;
  const pen = { drawImage(): void {}, fillRect(): void {}, translate(): void {}, scale(): void {}, globalCompositeOperation: '', fillStyle: '' };
  g.document = { createElement: (): unknown => ({ width: 0, height: 0, getContext: (): unknown => pen }) };
  try {
    run();
  } finally {
    g.document = had;
  }
}
const frame = (w: number, h: number): Sprite => ({ img: { width: w, height: h } as unknown as HTMLCanvasElement, w: w / 2, h: h / 2, ax: 7, ay: 9, density: 2 });
/** Given back: its picture is the picture of nothing, and the canvas it had has no size. */
const gone = (s: Sprite, was: { width: number; height: number }): boolean => s.img !== (was as unknown) && s.img.width === 1 && was.width === 0 && was.height === 0;

test('silhouettes pushed out of their budget are given back a moment later, not left for the browser to notice', () => {
  withCanvases(() => {
    reapRetired(true);
    const a = frame(100, 120);
    const white = silhouette(a, '#ffffff');
    const canvas = white.img as unknown as { width: number; height: number };
    assert.equal(retiredPixels(), 0);
    // a long fight: more copies than the budget holds, so the lot is let go at least once
    for (let i = 0; i < 200; i++) silhouette(frame(180, 240), '#ffffff');
    assert.ok(tintedPixels() <= TINT_BUDGET);
    assert.ok(retiredPixels() > 0, 'those let go are waiting to be given back');
    assert.ok(!gone(white, canvas), 'not yet: an afterimage may hold one for a moment');
    assert.equal(reapRetired(), 0, 'nothing is given back before its moment is up');
    assert.ok(reapRetired(true) > 0);
    assert.equal(retiredPixels(), 0);
    assert.ok(gone(white, canvas), 'given back: its canvas has no size, and it shows nothing');
    // and one wanted again is simply made again
    const again = silhouette(a, '#ffffff');
    assert.ok(again !== white && again.img.width === 100);
  });
});

test('a big mirror image pushed out of its budget is given back only where nobody who may keep it has had it', () => {
  withCanvases(() => {
    reapRetired(true);
    const big = (): Sprite => frame(300, 300);
    // (one drawn and done with, the world's way; one kept by a list of its own)
    const passing = big();
    const kept = big();
    const fp = flipSprite(passing, true);
    const fk = flipSprite(kept);
    const cp = fp.img as unknown as { width: number; height: number };
    const ck = fk.img as unknown as { width: number; height: number };
    assert.ok(flipSprite(passing, true) === fp, 'the same mirror image while it is kept');
    for (let i = 0; i < Math.ceil(FLIP_BUDGET / 90000) + 4; i++) flipSprite(big(), true);
    assert.ok(flippedPixels() <= FLIP_BUDGET);
    reapRetired(true);
    assert.ok(gone(fp, cp), 'the one only drawn is given back');
    assert.ok(!gone(fk, ck) && ck.width === 300, 'the one someone may keep is only forgotten, as before');
    // one handed to a keeper after the world had it is the keeper's from then on
    const both = big();
    const fb = flipSprite(both, true);
    assert.ok(flipSprite(both) === fb);
    const cb = fb.img as unknown as { width: number; height: number };
    for (let i = 0; i < Math.ceil(FLIP_BUDGET / 90000) + 4; i++) flipSprite(big(), true);
    reapRetired(true);
    assert.ok(!gone(fb, cb));
  });
});

test('a mirror image given back by itself is forgotten by the lists that hold it: asked for again, it is made again', () => {
  withCanvases(() => {
    reapRetired(true);
    for (const size of [40, 300]) {
      const s = frame(size, size);
      const f = flipSprite(s);
      const before = flippedPixels();
      releaseSprite(f);
      assert.equal(f.img.width, 1, 'given back');
      if (size === 300) assert.equal(flippedPixels(), before - size * size, 'and its room counted as given back');
      const again = flipSprite(s);
      assert.ok(again !== f && again.img.width === size, `a new one, whole (${size})`);
      // (and the picture itself with its mirror image, either first)
      retireSprite(again);
      retireSprite(s);
      reapRetired(true);
      assert.equal(s.img.width, 1);
      assert.equal(again.img.width, 1);
    }
    assert.equal(retiredPixels(), 0);
  });
});

test("a kind's effects' pictures are kept for the floor after it was last met, then let go; its own are given back", () => {
  withCanvases(() => {
    reapRetired(true);
    forgetUnusedPictures();
    const own = keptPictures<string, Sprite>(true);
    const lent = keptPictures<string, Sprite>();
    let hooks = 0;
    onNewPlace(() => hooks++);
    const a = frame(60, 60);
    const b = frame(60, 60);
    const ca = a.img as unknown as { width: number; height: number };
    const cb = b.img as unknown as { width: number; height: number };
    // floor 1: both met
    own.set('ring:0', a);
    lent.set('ring:0', b);
    // floor 2 come into: both were used on floor 1, so both are kept
    assert.deepEqual(forgetUnusedPictures(), { lists: 0, pictures: 0 });
    assert.equal(hooks, 1);
    assert.equal(own.size, 1);
    // floor 2: only the first is met
    assert.ok(own.get('ring:0') === a);
    // floor 3 come into: the one not met on floor 2 is emptied
    assert.deepEqual(forgetUnusedPictures(), { lists: 1, pictures: 1 });
    assert.equal(own.size, 1);
    assert.equal(lent.size, 0);
    // floor 4 come into: neither was met on floor 3
    assert.deepEqual(forgetUnusedPictures(), { lists: 1, pictures: 1 });
    assert.equal(own.size, 0);
    reapRetired(true);
    assert.ok(gone(a, ca), 'its own picture given back');
    assert.ok(!gone(b, cb) && cb.width === 60, 'one that may be another list\'s too is only forgotten');
    // met again: made again, and kept again
    own.set('ring:0', frame(60, 60));
    assert.deepEqual(forgetUnusedPictures(), { lists: 0, pictures: 0 });
    assert.equal(own.size, 1);
  });
});
