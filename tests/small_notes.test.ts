// THE SMALL OLDER ART NOTES (art/small_notes.ts; the queue's "Fix the small older art notes", 11 Nov 2026): four small mends, each
// behind a switch of its own, all off. With a switch off its art is as it was, pixel for pixel; with it on: floor 20's royal shadows
// the same shapes in deeper fog, their lights kept, no colour; the Order's last masks' cloak there to see, grey, thinning to nothing
// at the floor, scattered and gone as they die; the quest marker the great rune, flashing. (The Tower Top drawn back is main.ts's
// own and is looked at in play: tools/scenarios/small_notes_moth.mjs. His triggers for "Speak to the ...": tests/speak_new.test.ts.)
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { Px, rgba } from '../src/engine/px';
import { SMALL_NOTES } from '../src/art/small_notes';
import { DEEP, EYE, EYE_LIT, FOG, ROYALS, ROYAL_IDS, shadowFrame } from '../src/art/royal_shadows';
import { canvasOf, deathOfMob, paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { FOG_FOLD } from '../src/art/silent_order';
import { ORDER_MASK } from '../src/art/silent_order_moves';
import { GREAT_RUNE } from '../src/art/smith3';
import { RUNE_COLORS, RUNE_FINE, RUNE_FLASH, RUNE_HOT, RUNE_MARK, runeFlash } from '../src/render/quest_mark';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { equal(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void };

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const VIEWS = ['front', 'back'] as const;
const same = (a: Uint8ClampedArray, b: Uint8ClampedArray): boolean => a.length === b.length && a.every((v, i) => v === b[i]);
/** With a switch on, and off again whatever happens. */
function withOn<T>(key: keyof typeof SMALL_NOTES, fn: () => T): T {
  SMALL_NOTES[key] = true;
  try {
    return fn();
  } finally {
    SMALL_NOTES[key] = false;
  }
}

test('1. ALL FOUR SWITCHES ARE OFF', () => {
  assert.deepEqual(SMALL_NOTES, { shadows: false, masks: false, mothView: false, questRune: false });
});

test('2. THE ROYAL SHADOWS SET APART: the same shape, deeper, its bone white lights kept, no colour; off, as it was', () => {
  // (where each tone goes: never lighter, in order, the three lightest where they were)
  assert.equal(DEEP.length, FOG.length);
  for (let i = 0; i < DEEP.length; i++) {
    assert.ok(DEEP[i] <= i, `tone ${i} made lighter`);
    if (i > 0) assert.ok(DEEP[i] >= DEEP[i - 1], `tone ${i} out of order`);
  }
  assert.deepEqual(DEEP.slice(8), [8, 9, 10]);
  const eyes = [rgba(EYE), rgba(EYE_LIT)];
  const lights = FOG.slice(8).map((c) => rgba(c));
  const is = (d: Uint8ClampedArray, i: number, c: readonly number[]): boolean => d[i] === c[0] && d[i + 1] === c[1] && d[i + 2] === c[2];
  for (const id of ROYAL_IDS) {
    for (const view of VIEWS) {
      const off = shadowFrame(ROYALS[id], 'stand', 0, view).px;
      const on = withOn('shadows', () => shadowFrame(ROYALS[id], 'stand', 0, view).px);
      const again = shadowFrame(ROYALS[id], 'stand', 0, view).px;
      assert.ok(same(off.d, again.d), `${id} ${view}: off, not as it was`);
      assert.equal(on.w, off.w);
      assert.equal(on.h, off.h);
      let sumOff = 0;
      let sumOn = 0;
      let n = 0;
      let litOff = 0;
      let litOn = 0;
      for (let i = 0; i < on.d.length; i += 4) {
        assert.equal(on.d[i + 3], off.d[i + 3], `${id} ${view}: its shape changed`);
        if (on.d[i + 3] !== 255) continue;
        if (eyes.some((c) => is(on.d, i, c))) {
          assert.ok(eyes.some((c) => is(off.d, i, c)), `${id} ${view}: an eye where none was`);
          continue;
        }
        // (no colour: fog and bone)
        const spread = Math.max(on.d[i], on.d[i + 1], on.d[i + 2]) - Math.min(on.d[i], on.d[i + 1], on.d[i + 2]);
        assert.ok(spread <= 20, `${id} ${view}: a colour in it, ${on.d[i]},${on.d[i + 1]},${on.d[i + 2]}`);
        sumOff += off.d[i] + off.d[i + 1] + off.d[i + 2];
        sumOn += on.d[i] + on.d[i + 1] + on.d[i + 2];
        n++;
        if (lights.some((c) => is(off.d, i, c))) litOff++;
        if (lights.some((c) => is(on.d, i, c))) litOn++;
      }
      assert.ok(n > 400, `${id} ${view}: ${n} pixels of it`);
      // (deeper: a sixth darker and more, taken all together)
      assert.ok(sumOn < sumOff * 0.84, `${id} ${view}: not deeper, ${(sumOn / sumOff).toFixed(2)} of what it was`);
      // (its lights where they were)
      assert.equal(litOn, litOff, `${id} ${view}: its bone white lights`);
    }
  }
});

test("3. THE LAST MASKS' CLOAK THERE TO SEE: more of it, grey, thinning to nothing at the floor; gone as they die; off, as it was", () => {
  const mob: Mob = ORDER_MASK;
  const can = canvasOf(mob);
  /** Pixels of it in a band of rows over its floor point (picture pixels up from the floor). */
  const band = (px: Px, from: number, to: number): number => {
    let n = 0;
    for (let y = Math.max(0, can.ay - to); y < Math.min(px.h, can.ay - from); y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3]) n++;
    return n;
  };
  assert.equal(FOG_FOLD.length, 3);
  for (const c of FOG_FOLD) {
    const [r, g, b] = rgba(c);
    assert.ok(Math.max(r, g, b) - Math.min(r, g, b) <= 12 && Math.max(r, g, b) < 64, `${c}: the folds' fog is dark and grey`);
  }
  for (const view of VIEWS) {
    const off = paintMob(mob, 'stand', 0, view).px;
    const on = withOn('masks', () => paintMob(mob, 'stand', 0, view).px);
    const again = paintMob(mob, 'stand', 0, view).px;
    assert.ok(same(off.d, again.d), `${view}: off, not as it was`);
    // (the cloak, between the knees and the shoulders: three times as much of it and more)
    const was = band(off, 12, 40);
    const now = band(on, 12, 40);
    assert.ok(now > was * 3 && now > 250, `${view}: the cloak ${now} pixels, ${was} before`);
    // (thinning to nothing at the floor: its last four rows far thinner than its middle, row for row)
    assert.ok(band(on, 0, 4) / 4 < (now / 28) * 0.4, `${view}: ${band(on, 0, 4)} pixels at the floor, ${now} in its middle`);
    // (grey: nothing of the cloak coloured; the dull pink is in the mask's eye holes and its edge alone, over the shoulders)
    for (let y = can.ay - 34; y < can.ay; y++) {
      for (let x = 0; x < on.w; x++) {
        const i = (y * on.w + x) * 4;
        if (on.d[i + 3] !== 255 || (off.d[i + 3] === 255 && off.d[i] === on.d[i] && off.d[i + 1] === on.d[i + 1] && off.d[i + 2] === on.d[i + 2])) continue;
        const spread = Math.max(on.d[i], on.d[i + 1], on.d[i + 2]) - Math.min(on.d[i], on.d[i + 1], on.d[i + 2]);
        assert.ok(spread <= 16, `${view}: a colour in the cloak, ${on.d[i]},${on.d[i + 1]},${on.d[i + 2]}`);
      }
    }
    // (as they die: the fog scattered and gone, as before; the halves of the mask put aside)
    const rest: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] as [number, number] }; } };
    const dead = withOn('masks', () => deathOfMob(rest, 1, view).px);
    let left = 0;
    for (let i = 3; i < dead.d.length; i += 4) if (dead.d[i]) left++;
    assert.ok(left < 30, `${view}: the fog not gone, ${left} pixels`);
  }
});

test('4. THE QUEST MARKER A RUNE THAT FLASHES: the great rune itself, whole, seamed all round, the friend\'s cyan; its flash a blink, then gone', () => {
  const w = RUNE_FINE[0].length;
  const h = RUNE_FINE.length;
  // (about the old gem's size and a little over: 14 game pixels across, 17 tall)
  assert.equal(w, 28);
  assert.equal(h, 34);
  const at = (x: number, y: number): string => (x < 0 || y < 0 || x >= w || y >= h ? '.' : RUNE_FINE[y][x]);
  let core = 0;
  for (let y = 0; y < h; y++) {
    assert.equal(RUNE_FINE[y].length, w, `row ${y}`);
    // (its two sides alike, as the rune's are)
    assert.equal(RUNE_FINE[y], [...RUNE_FINE[y]].reverse().join(''), `row ${y}: its sides unlike`);
    for (let x = 0; x < w; x++) {
      const c = at(x, y);
      if (c === '.') continue;
      assert.ok(RUNE_COLORS[c] && RUNE_HOT[c], `(${x},${y}): no colour for ${c}`);
      if (c === 'w') core++;
      // (the seam all round: nothing of its light lies against the open air)
      if (c !== 'X') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) assert.ok(at(x + dx, y + dy) !== '.', `(${x},${y}): ${c} with no seam beside it`);
    }
  }
  assert.ok(core > 100, `${core} pixels of its strokes`);
  // (the great rune: the ends and the middle of every one of its strokes are in its strokes' core)
  for (const [x0, y0, x1, y1] of GREAT_RUNE) {
    for (const u of [0, 0.5, 1]) {
      const x = w / 2 + (x0 + (x1 - x0) * u) * RUNE_MARK.half;
      const y = h / 2 - (y0 + (y1 - y0) * u) * RUNE_MARK.half;
      const near = [at(Math.floor(x - 0.01), Math.floor(y - 0.01)), at(Math.floor(x + 0.01), Math.floor(y + 0.01)), at(Math.floor(x - 0.01), Math.floor(y + 0.01)), at(Math.floor(x + 0.01), Math.floor(y - 0.01))];
      assert.ok(near.includes('w'), `stroke ${x0},${y0} to ${x1},${y1} at ${u}: ${near.join('')}`);
    }
  }
  // (the friend's cyan at rest; white-hot in its flash)
  for (const c of 'wo') {
    const [r, g, b] = rgba(RUNE_COLORS[c]);
    assert.ok(g > r && b > r, `${c}: not cyan`);
  }
  assert.equal(RUNE_HOT.w, '#ffffff');
  // (its flash: nothing as a beat begins, whole in a blink, gone in under half a second, and round again)
  assert.equal(runeFlash(0), 0);
  assert.ok(Math.abs(runeFlash(RUNE_FLASH.rise) - 1) < 1e-9);
  assert.ok(RUNE_FLASH.rise <= 0.07 && RUNE_FLASH.rise + RUNE_FLASH.fall < 0.5);
  for (let t = RUNE_FLASH.rise + RUNE_FLASH.fall; t < RUNE_FLASH.every; t += 0.05) assert.equal(runeFlash(t), 0, `at ${t.toFixed(2)} s`);
  for (const t of [0.02, 0.05, 0.2, 0.9]) assert.ok(Math.abs(runeFlash(t) - runeFlash(t + RUNE_FLASH.every * 3)) < 1e-6, `not round again at ${t}`);
  for (let t = 0; t < 4; t += 0.01) assert.ok(runeFlash(t) >= 0 && runeFlash(t) <= 1);
});
