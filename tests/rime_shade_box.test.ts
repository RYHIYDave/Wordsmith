// FLOOR 20'S RIME SHADE: EACH LINE PAINTED ONLY OVER THE FLOOR IT COVERS (the queue's fix-boss-death-stall-and-rime-shade, 12 Nov
// 2026: three lines, each painted on the art's whole canvas, 640 by 400, cost about a third of a frame; src/art/rime_shade_fx.ts
// lineBox, src/render/act1_fx/rshade.ts). Nothing it paints may look different. Held so:
//   1. THE SAME PIXELS IN THE SAME PLACES: for both views, the ways a line can be turned (and the game's own: lineView), every
//      moment of the mark and the line, its crust, its crystals all at once and behind and before a point along it, the picture
//      painted on its box is the whole canvas's picture cut to the box, and the whole canvas has nothing outside the box;
//   2. its lights where they are on the whole canvas (moved with the box);
//   3. THE BOX ON WHOLE GAME PIXELS (its corner and size even: the game lays a picture two picture pixels to its own), inside the
//      canvas, and a quarter of it or less (7 to 22 in 100 of it, by the way the line runs).
//   run: tsx --test tests/rime_shade_box.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FX_CANVAS, LINE_GONE, RIME_LINE, lineBox, linePainted, markPainted } from '../src/art/rime_shade_fx';
import type { FxBox } from '../src/art/rime_shade_fx';
import { RS_BREATH } from '../src/art/rime_shade_moves';
import { lineView } from '../src/render/act1_fx/rshade';
import type { Px } from '../src/engine/px';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const VIEWS = ['front', 'back'] as const;
/** Turns sampled all round, and those the game gives lines aimed every way (lineView). */
const TURNS: { view: 'front' | 'back'; turn: number }[] = [
  ...VIEWS.flatMap((view) => Array.from({ length: 13 }, (_, i) => ({ view, turn: -Math.PI + (i * 2 * Math.PI) / 12 }))),
  ...Array.from({ length: 16 }, (_, i) => lineView(Math.cos((i / 16) * 2 * Math.PI + 0.1), Math.sin((i / 16) * 2 * Math.PI + 0.1))),
];

/** Whether `part` (painted on `box`) is `whole` cut to the box, and `whole` is empty outside it: the first difference, or ''. */
function sameAs(whole: Px, part: Px, box: FxBox): string {
  if (part.w !== box.w || part.h !== box.h) return `its size ${part.w}x${part.h}, not the box's ${box.w}x${box.h}`;
  for (let y = 0; y < whole.h; y++) {
    for (let x = 0; x < whole.w; x++) {
      const i = (y * whole.w + x) * 4;
      const inBox = x >= box.x && y >= box.y && x < box.x + box.w && y < box.y + box.h;
      if (!inBox) {
        if (whole.d[i + 3] !== 0) return `a pixel outside the box at ${x},${y}`;
        continue;
      }
      const j = ((y - box.y) * part.w + (x - box.x)) * 4;
      for (let k = 0; k < 4; k++) if (whole.d[i + k] !== part.d[j + k]) return `pixel ${x},${y} differs`;
    }
  }
  return '';
}

test('1, 2. the same pixels in the same places, and the same lights, every moment, every way it is turned', () => {
  let checked = 0;
  let solid = 0;
  for (const { view, turn } of TURNS) {
    const box = lineBox(view, turn);
    // (the mark through the breath, to the rime having crept over it)
    for (let t = RS_BREATH.mark - 0.05; t <= RS_BREATH.hit + RIME_LINE.long / RIME_LINE.pace + 0.15; t += 0.13) {
      const why = sameAs(markPainted(t, view, turn), markPainted(t, view, turn, box), box);
      assert.equal(why, '', `the mark ${view} turned ${turn.toFixed(2)} @${t.toFixed(2)}: ${why}`);
      checked++;
    }
    // (the line from its breath to melted away; its crust, its crystals all at once, behind and before points along it)
    for (let t = 0; t <= LINE_GONE + 0.1; t += 0.23) {
      const looks: [layer: 'floor' | 'air', near: 'behind' | 'before' | 'all', at: number][] = [
        ['floor', 'all', 0],
        ['air', 'all', 0],
        ['air', 'behind', RIME_LINE.from + 2.2],
        ['air', 'before', RIME_LINE.from + 2.2],
        ['air', 'behind', RIME_LINE.from + RIME_LINE.long],
        ['air', 'before', RIME_LINE.from],
      ];
      for (const [layer, near, at] of looks) {
        const whole = linePainted(t, view, layer, near, at, turn);
        const part = linePainted(t, view, layer, near, at, turn, box);
        const why = sameAs(whole.px, part.px, box);
        assert.equal(why, '', `the line ${layer} ${near} ${view} turned ${turn.toFixed(2)} @${t.toFixed(2)}: ${why}`);
        assert.equal(part.lights.length, whole.lights.length, `its lights ${view} @${t.toFixed(2)}`);
        whole.lights.forEach((l, k) => {
          const m = part.lights[k];
          assert.ok(m.x + box.x === l.x && m.y + box.y === l.y && m.r === l.r && m.color === l.color && m.a === l.a, `its light ${k} where it is on the whole canvas (${view} @${t.toFixed(2)})`);
        });
        for (let i = 3; i < whole.px.d.length; i += 4) if (whole.px.d[i]) solid++;
        checked++;
      }
    }
  }
  // (and it was looked at with something painted)
  assert.ok(checked > 2000 && solid > 1e6, `${checked} pictures checked, ${solid} pixels painted in them`);
});

test('3. the box on whole game pixels, inside the canvas, a quarter of it or less', () => {
  for (const { view, turn } of TURNS) {
    const b = lineBox(view, turn);
    const at = `${view} turned ${turn.toFixed(2)}`;
    assert.ok([b.x, b.y, b.w, b.h].every((v) => v % 2 === 0), `${at}: on whole game pixels ${JSON.stringify(b)}`);
    assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= FX_CANVAS.w && b.y + b.h <= FX_CANVAS.h && b.w > 0 && b.h > 0, `${at}: inside the canvas ${JSON.stringify(b)}`);
    assert.ok(b.w * b.h <= (FX_CANVAS.w * FX_CANVAS.h) / 4, `${at}: ${b.w}x${b.h}, a quarter of the canvas or less`);
  }
});
