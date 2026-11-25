// THE STRONGHOLDS' FRONTS, A FLOOR'S OWN EACH (art/hold_fronts.ts, behind OWN_FRONTS in game/act1_dress.ts; the owner, 25 Nov 2026,
// 08:58: “Endless mode is adding strongholds to every level, and I need the facades of the strongholds that you go into to match
// each of the levels.”; docs/mockups/hold_fronts/README.md). Held here:
//   1. every floor of the twenty has a front, by its own name, each name once; the art paints one for every floor but the Quarry's
//      and Echo Canyon's, which have theirs;
//   2. each built and anchored as the Quarry's gatehouse is (its door's foot at its anchor), sealed with the cult's mark burning
//      pink and its light, open with the dark of the way in; the cult's banners and pink fire on it either way;
//   3. off, the stronghold's gate as it was (the Quarry's gatehouse, the waystation's gate on 8); on, a floor's own, story and endless
//      alike, 6 and 8 unchanged;
//   4. on, the floors' pieces hold their front (on 7, 9 and 10 the court before it in their own stone; on 11 to 20, which have no
//      stronghold of the story's, the cult's altar, braziers and banners); off, as they were.
//   run: tsx --test tests/hold_fronts.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { FRONT_NAMES, HOLD, OWN_FRONTS } from '../src/game/act1_dress';
import { HOLD_FRONTS, holdFrontOf } from '../src/art/hold_fronts';
import { FLAME } from '../src/art/mkit';
import { act1Pieces, forgetAct1 } from '../src/render/act1_pieces';
import { lookPieces } from '../src/art/floors';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();

const hex = (r: number, g: number, b: number): string => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
/** How many of a picture's pixels are each of the given colours. */
function count(s: Sprite, colours: readonly string[]): number {
  const want = new Set(colours);
  const d = paintingOf(s).d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] && want.has(hex(d[i], d[i + 1], d[i + 2]))) n++;
  return n;
}
/** How many of a picture's pixels are painted. */
function inked(s: Sprite): number {
  const d = paintingOf(s).d;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
  return n;
}
const with_ = <T>(on: boolean, f: () => T): T => {
  const was = OWN_FRONTS.on;
  OWN_FRONTS.on = on;
  try {
    return f();
  } finally {
    OWN_FRONTS.on = was;
  }
};

test('1. every floor of the twenty its own front, each name once; painted for all but the Quarry and Echo Canyon', () => {
  const names = Object.entries(FRONT_NAMES);
  assert.deepEqual(names.map(([n]) => Number(n)), Array.from({ length: 20 }, (_, i) => i + 1), 'floors 1 to 20');
  assert.equal(new Set(names.map(([, v]) => v)).size, 20, 'each its own name');
  assert.equal(FRONT_NAMES[6], "the redoubt's gatehouse", "the Quarry's, its gatehouse, as it was");
  assert.equal(FRONT_NAMES[8], "the waystation's gate", "Echo Canyon's, its waystation's gate, as it was");
  assert.deepEqual(HOLD_FRONTS.map((h) => h.floor), [1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 'painted for the eighteen others');
  for (const h of HOLD_FRONTS) assert.equal(h.name, FRONT_NAMES[h.floor], `floor ${h.floor}: its name`);
  assert.equal(OWN_FRONTS.on, false, 'off in the game until his yes to their pictures');
});

test('2. each anchored as the gatehouse is; sealed, the mark burning and its light; open, the way in dark', () => {
  for (const h of HOLD_FRONTS) {
    const sealed = h.make(false, 0);
    const flick = h.make(false, 2);
    const open = h.make(true, 0);
    const what = `floor ${h.floor}, ${h.name}`;
    assert.deepEqual([sealed.w, sealed.h, sealed.ax, sealed.ay], [150, 220, 50, 196], `${what}: on the gatehouse's canvas, its door's foot at its anchor`);
    assert.deepEqual([open.w, open.h, open.ax, open.ay], [sealed.w, sealed.h, sealed.ax, sealed.ay], `${what}: open, the same`);
    assert.ok(inked(sealed) > 4000, `${what}: painted (${inked(sealed)})`);
    const pink = [FLAME[1], FLAME[2], FLAME[3], FLAME[4]];
    assert.ok(count(sealed, pink) > count(open, pink) + 40, `${what}: the mark burning on its door sealed (${count(sealed, pink)} pink against ${count(open, pink)} open)`);
    assert.ok(count(open, pink) > 6, `${what}: the cult's pink fire on it, open too`);
    const seal = (sealed.lights ?? []).filter((l) => l.color === FLAME[2]);
    assert.ok(seal.length >= 3, `${what}: its lights (the seal's and its sconces')`);
    assert.ok((open.lights ?? []).filter((l) => l.color === FLAME[2]).length === seal.length - 1, `${what}: open, the seal's light gone`);
    assert.ok(count(flick, pink) > 40, `${what}: its flicker's frames burning too`);
  }
});

test('3. off, the gate as it was; on, a floor\'s own, 6 and 8 unchanged', () => {
  with_(false, () => {
    for (const n of [6, 7, 9, 10]) assert.equal(HOLD.gate(n), "the redoubt's gatehouse", `off: floor ${n}`);
    assert.equal(HOLD.gate(8), "the waystation's gate", 'off: floor 8');
  });
  with_(true, () => {
    assert.equal(HOLD.gate(6), "the redoubt's gatehouse", "on: the Quarry's own");
    assert.equal(HOLD.gate(7), 'the cliff watch-fort', "on: the Ledge Road's own");
    assert.equal(HOLD.gate(8), "the waystation's gate", "on: Echo Canyon's own");
    assert.equal(HOLD.gate(9), 'the stockade gate', "on: the Pinewood's own");
    assert.equal(HOLD.gate(10), 'the drowned shrine', "on: the Fen's own");
    for (let n = 1; n <= 20; n++) assert.equal(HOLD.gate(n), FRONT_NAMES[n], `on: floor ${n}`);
  });
});

test('4. on, the floors\' pieces hold their front and the cult\'s yard; off, as they were', () => {
  forgetAct1(-1);
  with_(false, () => assert.ok(!act1Pieces(7).has('the cliff watch-fort'), 'off: the Ledge Road as it was'));
  with_(false, () => assert.equal(HOLD.courtOf(7), "the court's flagstones", "off: the Quarry's court"));
  with_(true, () => {
    const p7 = act1Pieces(7);
    assert.ok(p7.has('the cliff watch-fort'), "on: the Ledge Road's front");
    assert.equal(p7.get('the cliff watch-fort')?.frames?.length, 5, 'its five frames');
    assert.equal(p7.get("the watch-fort's flagstones")?.frames?.length, 3, "and its court in the Ledge's own stone");
    assert.equal(HOLD.courtOf(7), "the watch-fort's flagstones", "the court laid in the Ledge's stone");
    assert.equal(HOLD.courtOf(6), "the court's flagstones", "the Quarry's as it was");
    forgetAct1(-1);
    const p11 = act1Pieces(11);
    for (const name of ['the watch-house', 'the altar of the words', "the cult's brazier", "the cult's banner"]) assert.ok(p11.has(name), `on: the Gate Ward holds ${name}`);
    forgetAct1(-1);
    assert.ok(lookPieces(2).has("the condemned's block"), "on: the Headsman's Yard holds its front");
    assert.ok(lookPieces(2).has('the altar of the words'), "on: and the cult's altar");
    const f = holdFrontOf(2);
    assert.ok(f && f.kind === 'gate' && f.frames.length === 5, 'a gate of five frames');
  });
  forgetAct1(-1);
});
