// Tests for FRAMES KEPT IN THEIR SHEETS (engine/px.ts sheetSprite; the heroes' and the townsfolk's baked pictures:
// render/baked.ts, render/townsfolk_baked.ts). His phone, measured for the first time 12 Nov 2026 (docs/requests/phone_check.md):
// a picture made by the browser for every baked frame as it was taken in was 7.1 ms a frame on the game's own thread, 68.5 s
// of a 74-second load into town; his word, asked whether to build it: “Yes, build it (Recommended)”. So no picture is made
// for a frame as it comes: its picture is cut from its sheet when it is first asked for, the cut ones in hand are kept to a
// budget, and one let go of is cut again when it is asked for again.
// (There is no browser here: a cut picture is a stand-in of the frame's size. That the pixels are the frame's own is checked
// in a browser: tools/scenarios/sheet_frames.mjs.)
//   run: tsx --test tests/sheet_sprite.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CUT_BUDGET, RETIRE_MS, flipSprite, imgPx, inSheet, reapRetired, releaseSprite, retireSprite, retiredPixels, sheetCuts, sheetSprite } from '../src/engine/px';
import type { FrameSheet, Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import type { HeroArt } from '../src/art/heroes';
import { BakedHeroes, heroSides, listLengths } from '../src/render/baked';
import type { BakeFile } from '../src/render/baked';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

/**
 * The heroes' bake with stand-ins (there is no browser here): the Warrior's card, four frames on two sheets, the second
 * sheet's one frame for a place painted already; pictures that only say when they are opened and closed.
 */
class HeroBakeStandIn {
  opened = 0;
  closed = 0;
  given: Sprite[] = [];
  baked: BakedHeroes;
  constructor() {
    const A = makeHeroArt3() as unknown as HeroArt;
    const art = A.of('warrior', { ...lookOfPlace('card'), vet: false });
    const file: BakeFile = {
      mark: 'm1', group: 'cards', sheets: ['cards-0.png', 'cards-1.png'],
      frames: [[0, 0, 0, 4, 6, 0], [0, 4, 0, 4, 6, 1], [0, 8, 0, 4, 6, 0], [1, 0, 0, 4, 6, 0]],
      parts: [{ w: 2, h: 3, ax: 1, ay: 3, density: 2 }, { w: 2, h: 3, ax: 1, ay: 2, density: 2 }] as BakeFile['parts'],
      // (as side, list, frame, the frame's index: three places of the first list, one of the second)
      keys: [{ cls: 'warrior', place: 'card', vet: false, lens: listLengths(heroSides(art)), at: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 1, 0, 3] }],
    };
    (globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = async () => {
      this.opened++;
      return { width: 16, height: 16, close: () => { this.closed++; } };
    };
    // (the second list's place is painted already: its frame is not taken)
    const give = (_c: unknown, _p: unknown, _v: number, l: number, _i: number, sp: Sprite): boolean => {
      if (l === 1) return false;
      this.given.push(sp);
      return true;
    };
    const get = async (): Promise<Response> => ({ ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(file)), blob: async () => ({}) }) as unknown as Response;
    this.baked = new BakedHeroes('m1', () => A, give, false, get);
  }
  async load(): Promise<void> {
    this.baked.take('warrior', 'card', false);
    for (let n = 0; n < 400 && !this.baked.settled('cards'); n++) await new Promise((r) => setTimeout(r, 1));
  }
}

const sheetOf = (): FrameSheet & { closed: number } => {
  const sh = { closed: 0, img: null } as unknown as FrameSheet & { closed: number };
  sh.img = { width: 64, height: 64, close: () => { sh.closed++; } } as unknown as FrameSheet['img'];
  return sh;
};
const part = { w: 4, h: 6, ax: 2, ay: 6, density: 2, lights: [{ x: 1, y: 1, r: 2, col: '#fff' }] } as unknown as Omit<Sprite, 'img'>;

test('a frame kept in its sheet has no picture until it is asked for; then one, its own size, the same each time', () => {
  const sh = sheetOf();
  const made = sheetCuts().made;
  const s = sheetSprite(part, sh, 8, 0, 8, 12);
  assert.equal(inSheet(s), true);
  assert.deepEqual([s.w, s.h, s.ax, s.ay, s.density], [4, 6, 2, 6, 2], 'its other parts as baked');
  assert.ok(s.lights === (part as Sprite).lights, 'shared with the frames that have the same, as before');
  assert.equal(imgPx(s), 96, 'its size is known without cutting it');
  assert.equal(sheetCuts().made, made, 'nothing cut yet');
  const a = s.img;
  assert.deepEqual([a.width, a.height], [8, 12]);
  assert.equal(sheetCuts().made, made + 1);
  assert.ok(s.img === a && s.img === a, 'the same picture while it is in hand');
  assert.equal(sheetCuts().made, made + 1);
  assert.ok('img' in s && Object.keys(s).includes('img'), 'a Sprite as any other to whoever reads it');
  // (a copy of it, as the code that draws makes them, has the picture itself)
  const copy = { ...s };
  assert.ok(copy.img === a);
});

test('the cut pictures in hand are kept to the budget: the least lately asked for are let go of, and cut again when asked for', () => {
  const was = CUT_BUDGET.px;
  // (whatever the tests before left in hand is let go of first)
  CUT_BUDGET.px = 0;
  const x = sheetSprite(part, sheetOf(), 0, 0, 8, 12);
  void x.img;
  releaseSprite(x);
  reapRetired(true);
  const base = sheetCuts();
  assert.deepEqual([base.inHand, base.px, base.waiting], [0, 0, 0]);
  try {
    CUT_BUDGET.px = base.px + 3 * 96;
    const sh = sheetOf();
    const f = [0, 1, 2, 3].map((i) => sheetSprite(part, sh, i * 8, 0, 8, 12));
    const p0 = f[0].img;
    void f[1].img;
    void f[2].img;
    assert.equal(sheetCuts().inHand, base.inHand + 3);
    // (the first asked for again: it goes to the back of the line)
    assert.ok(f[0].img === p0);
    void f[3].img;
    const now = sheetCuts();
    assert.equal(now.inHand, base.inHand + 3, 'three in hand still');
    assert.equal(now.px, base.px + 3 * 96);
    assert.equal(now.letGo, base.letGo + 1, 'one let go of');
    assert.ok(f[0].img === p0, 'not the one asked for since');
    assert.equal(sheetCuts().made, base.made + 4);
    // (the one let go of: cut again, a new picture; the old one is given back a moment on, not at once)
    assert.equal(p0.width, 8);
    const p1 = f[1].img;
    assert.equal(sheetCuts().made, base.made + 5, 'cut again');
    assert.deepEqual([p1.width, p1.height], [8, 12]);
    assert.ok(sheetCuts().waiting >= 2, 'those let go of wait to be given back');
    reapRetired(true);
    assert.equal(sheetCuts().waiting, 0);
  } finally {
    CUT_BUDGET.px = was;
  }
});

test('let go of (given the picture of nothing), it shows nothing and is of no sheet; its sheet is its holder\'s to close', () => {
  const sh = sheetOf();
  const s = sheetSprite(part, sh, 0, 0, 8, 12);
  const t = sheetSprite(part, sh, 8, 0, 8, 12);
  const cut = s.img;
  assert.equal(cut.width, 8);
  // (released as the townsfolk's are when the town is left; one never asked for is not cut for it)
  const made = sheetCuts().made;
  releaseSprite(s);
  releaseSprite(t);
  assert.equal(sheetCuts().made, made, 'nothing cut to let it go');
  assert.equal(s.img.width, 1, 'whoever still holds it draws nothing');
  assert.equal(t.img.width, 1);
  assert.equal(inSheet(s), false);
  assert.equal(sh.closed, 0, 'the sheet is not closed by its frames');
  // (what was cut for it is given back a moment on)
  assert.equal(cut.width, 8);
  reapRetired(true);
  assert.equal(cut.width, 0);
});

test('its sheet let go of first: it shows nothing, and breaks nothing', () => {
  const sh = sheetOf();
  const s = sheetSprite(part, sh, 0, 0, 8, 12);
  sh.img = null;
  assert.equal(s.img.width, 1);
  assert.equal(imgPx(s), 96);
});

test('retired, it is not cut for the counting; and the game\'s other ways with a picture take it as any other', () => {
  const sh = sheetOf();
  const s = sheetSprite(part, sh, 0, 0, 8, 12);
  const made = sheetCuts().made;
  const before = retiredPixels();
  retireSprite(s);
  assert.equal(retiredPixels(), before + 96);
  assert.equal(sheetCuts().made, made);
  reapRetired(true);
  assert.equal(s.img.width, 1);
  assert.equal(RETIRE_MS > 0, true);
  void flipSprite;
});

test('the heroes\' bake hands every frame over in its sheet: the sheets are the only pictures the browser makes, and they are held', async () => {
  const w = new HeroBakeStandIn();
  const made = sheetCuts().made;
  await w.load();
  assert.deepEqual(w.baked.stats.failed, []);
  assert.equal(w.baked.stats.given, 3, 'three frames wanted');
  assert.equal(w.baked.stats.unwanted, 1, 'one painted already');
  assert.equal(w.opened, 2, 'the two sheets, and no picture for a frame');
  assert.equal(w.closed, 1, 'the sheet none of whose frames was wanted is closed; the other is held');
  assert.deepEqual([w.baked.stats.sheets, w.baked.stats.sheetPx], [1, 16 * 16]);
  assert.equal(sheetCuts().made, made, 'no frame cut as they came');
  assert.ok(w.given.every((s) => inSheet(s)));
  assert.deepEqual([w.given[1].img.width, w.given[1].img.height], [4, 6]);
  assert.equal(w.given[1].ay, 2, 'with its other parts as baked');
});
