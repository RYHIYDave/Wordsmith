// SET 1'S PICTURES: the six bag pictures (art/items_unique.ts SET1_PAINTERS) and their looks in play (render/set1_fx.ts, behind
// SET1_LOOK, off until his yes). Held:
//   1. the six bag pictures: 32 by 32, crisp, a clear pixel round each, the uniques' orange rim round its ink, big enough, each
//      its own; kept apart from the 62's list (UNIQUE_ART_IDS), as Set 1 is behind its own switch;
//   2. the looks' switch off: nothing told is kept, nothing owned, nothing drawn; on, the meteor seen falling, its stand-in left
//      out, and drawn without a fault.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SET1_ART_IDS, UNIQUE_ART_IDS, paintUnique } from '../src/art/items_unique';
import { RARITY_COLOR } from '../src/art/palette';
import type { Px } from '../src/engine/px';
import type { GameEvent } from '../src/game/state';
import { SET1_DEFS } from '../src/game/uniques';
import { SET1_LOOK, Set1Fx } from '../src/render/set1_fx';

const N = 32;
const has = (p: Px, x: number, y: number): boolean => x >= 0 && y >= 0 && x < N && y < N && p.d[(y * N + x) * 4 + 3] > 0;
const same = (a: Px, b: Px): boolean => a.d.length === b.d.length && a.d.every((v, i) => v === b.d[i]);

test('1. the six bag pictures: sound, each its own, apart from the 62\'s', () => {
  assert.deepEqual([...SET1_ART_IDS].sort(), SET1_DEFS.map((d) => d.id).sort(), 'one for each of the six');
  for (const id of SET1_ART_IDS) assert.ok(!UNIQUE_ART_IDS.includes(id), `${id}: not among the 62's`);
  const rim = RARITY_COLOR[3];
  const pics = SET1_ART_IDS.map((id) => [id, paintUnique(id)!] as const);
  for (const [id, p] of pics) {
    assert.ok(p, `${id} is painted`);
    assert.deepEqual([p.w, p.h], [N, N], `${id}: 32 by 32`);
    let n = 0, rims = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const a = p.d[(y * N + x) * 4 + 3];
      assert.ok(a === 0 || a === 255, `${id}: a soft pixel at ${x},${y}`);
      if (!a) continue;
      n++;
      assert.ok(x > 0 && y > 0 && x < N - 1 && y < N - 1, `${id}: touches its frame at ${x},${y}`);
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !has(p, x + dx, y + dy))) {
        rims++;
        assert.equal(p.get(x, y), rim, `${id}: its outermost pixel at ${x},${y} is the rim's orange`);
      }
    }
    assert.ok(n >= 150, `${id}: only ${n} pixels`);
    assert.ok(rims >= 50, `${id}: its rim has only ${rims} pixels`);
  }
  for (let i = 0; i < pics.length; i++) for (let j = i + 1; j < pics.length; j++) assert.ok(!same(pics[i][1], pics[j][1]), `${pics[i][0]} and ${pics[j][0]} are the same picture`);
});

/** A canvas that only counts what is drawn on it. */
function counting(): { g: CanvasRenderingContext2D; n: () => number } {
  let n = 0;
  const g = new Proxy({} as Record<string, unknown>, {
    get: (_t, k) => (k === 'canvas' ? {} : typeof k === 'string' && /^(fill|stroke|draw|ellipse|arc|rect|beginPath|moveTo|lineTo|save|restore|translate|scale|closePath|clip)/.test(k) ? () => { n++; } : undefined),
    set: () => true,
  }) as unknown as CanvasRenderingContext2D;
  return { g, n: () => n };
}

test('2. their looks in play: off, nothing; on, the meteor falling, its stand-in left out', () => {
  assert.equal(SET1_LOOK.on, false, 'off until his yes to their pictures');
  const cam = { ox: 0, oy: 0 } as Parameters<Set1Fx['drawAir']>[1];
  const fall: GameEvent = { t: 'unique', id: 'starbreaker', what: 'fall', x: 3, y: 3, r: 1.6, secs: 0.6 };
  const land: GameEvent = { t: 'unique', id: 'starbreaker', what: 'land', x: 3, y: 3, r: 1.6 };
  const stand: GameEvent = { t: 'burst', x: 3, y: 3, r: 1.6, el: 'fire', style: 'blast' };
  {
    const fx = new Set1Fx();
    fx.handle(fall);
    fx.update(0.2);
    const c = counting();
    fx.drawGround(c.g, cam);
    fx.drawAir(c.g, cam);
    assert.equal(c.n(), 0, 'off: nothing drawn');
    fx.handle(land);
    assert.equal(fx.owns(stand), false, 'off: the stand-in shown');
  }
  SET1_LOOK.on = true;
  try {
    const fx = new Set1Fx();
    fx.handle(fall);
    fx.update(0.3);
    const c = counting();
    fx.drawAir(c.g, cam);
    assert.ok(c.n() > 10, 'on: the meteor drawn falling');
    fx.handle(land);
    assert.equal(fx.owns(stand), true, 'its stand-in left out');
    assert.equal(fx.owns({ ...stand, x: 9 }), false, 'not another burst');
    fx.update(0.1);
    const d = counting();
    fx.drawGround(d.g, cam);
    fx.drawAir(d.g, cam);
    assert.ok(d.n() > 0, 'its strike drawn');
  } finally {
    SET1_LOOK.on = false;
  }
});
