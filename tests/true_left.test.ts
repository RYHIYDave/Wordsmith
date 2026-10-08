// TRUE LEFT-FACING HEROES: A MOCK-UP FOR THE OWNER, NOT IN THE GAME (8 Oct 2026; art/heroes3.ts,
// TRUE_LEFT; docs/mockups/true_left/README.md). Today a hero facing screen-left is his
// right-facing picture turned over. The mock-up paints the figure itself turned to face left
// (skeleton.ts, `frontL` and `backL`), behind a switch that is OFF. What is held here, above all,
// is that WITH THE SWITCH OFF NOTHING CHANGES: the game makes no frames of the mock-up, a hero who
// faces left is shown as before, and every frame it paints is the picture it painted before.
//
// A plain painting stands in for the canvas (tests/helpers.ts), so what is read is the very frame
// the game would show.
//   run: tsx --test tests/true_left.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet } from '../src/art/actor_types';
import type { HeroLook } from '../src/art/heroes';
import { TRUE_LEFT, makeHeroArt3, paintMove3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { CANVAS3 } from '../src/art/skin';
import { GRID, project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { flipSprite } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { CLASS_IDS } from '../src/game/types';
import { Figure } from '../src/render/figure';
import type { FigureState } from '../src/render/figure';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const LOOKS: HeroLook[] = [{ twoHanded: true }, { twoHanded: true, town: true }, { twoHanded: true, card: true }];
/** Every frame list of one view of a figure, by name. */
function lists(set: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', set.idle], ['walk', set.walk], ['attack', set.attack]];
  if (set.heavy) out.push(['heavy', set.heavy]);
  if (set.leap) out.push(['leap', set.leap]);
  for (const [k, c] of Object.entries(set.clips ?? {})) if (c) out.push([`clips.${k}`, c.frames]);
  return out;
}
/** Two frames are the same picture: the same pixels, laid down at the same spot, with the same lights, pool of light and tails. */
function same(a: Sprite, b: Sprite): boolean {
  const pa = paintingOf(a);
  const pb = paintingOf(b);
  if (pa.w !== pb.w || pa.h !== pb.h || a.ax !== b.ax || a.ay !== b.ay || a.w !== b.w || a.h !== b.h) return false;
  for (let i = 0; i < pa.d.length; i++) if (pa.d[i] !== pb.d[i]) return false;
  return JSON.stringify([a.lights, a.aura, a.tails, a.density]) === JSON.stringify([b.lights, b.aura, b.tails, b.density]);
}
/** A canvas that does nothing, for as long as `fn` runs (a frame turned over is drawn on one). */
function withBlankCanvas(fn: () => void): void {
  const g = globalThis as unknown as { document?: unknown };
  const had = g.document;
  const pen = { translate(): void {}, scale(): void {}, drawImage(): void {} };
  g.document = { createElement: (): unknown => ({ width: 0, height: 0, getContext: (): unknown => pen }) };
  try {
    fn();
  } finally {
    if (had === undefined) delete g.document;
    else g.document = had;
  }
}
const standing = (fx: number, fy: number, t: number): FigureState => ({ anim: 'idle', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 });

test('the switch is off: the game makes no frames of the mock-up, and a hero facing left is his right-facing picture turned over, as before', () => {
  assert.equal(TRUE_LEFT.on, false, 'the true-left mock-up is switched off in the game');
  const art = makeHeroArt3();
  for (const cls of CLASS_IDS) {
    for (const look of LOOKS) {
      const a = art.of(cls, look);
      assert.ok(a.left === undefined, `${cls}: a figure with frames of its own for facing left`);
      assert.equal(Object.keys(a).sort().join(','), 'back,front', `${cls}: the figure holds only its two views`);
    }
  }
  // a hero facing down-left and up-left: the frames he shows facing down-right and up-right, turned over
  withBlankCanvas(() => {
    const knight = art.of('warrior', LOOKS[0]);
    for (const [fx, fy, set] of [[0, 1, knight.front], [-1, 0, knight.back]] as [number, number, AnimSet][]) {
      const left = new Figure();
      const right = new Figure();
      for (let k = 0; k < 6; k++) {
        const t = 2 + k * 0.1;
        const shown = left.frame(knight, standing(fx, fy, t), 0.1, 0, 0, false);
        // (a facing is a step in the world: the screen's left and right are its two world axes swapped)
        const plain = right.frame(knight, standing(fy, fx, t), 0.1, 0, 0, false);
        assert.ok(set.idle.includes(plain), 'facing right: a frame of the view he is seen from');
        assert.ok(shown === flipSprite(plain), `facing (${fx}, ${fy}): the mirror image of the frame for facing right`);
      }
    }
  });
});

test('the switch leaves no trace: the frames of the two views are the same pictures, pixel for pixel, with it off and on; it only ever adds', () => {
  // (a figure is made, and the switch read, the first time it is asked for)
  const was = TRUE_LEFT.on;
  const a: ActorArt = makeHeroArt3().of('warrior', LOOKS[0]);
  let b: ActorArt;
  TRUE_LEFT.on = true;
  try {
    b = makeHeroArt3().of('warrior', LOOKS[0]);
  } finally {
    TRUE_LEFT.on = was;
  }
  assert.ok(a.left === undefined && b.left !== undefined, 'only the figure made with the switch on has frames of its own for facing left');
  let n = 0;
  for (const view of ['front', 'back'] as const) {
    const la = lists(a[view]);
    const lb = lists(b[view]);
    assert.equal(la.map(([k, f]) => `${k} ${f.length}`).join(', '), lb.map(([k, f]) => `${k} ${f.length}`).join(', '), `${view}: the same lists of frames`);
    la.forEach(([k, fa], i) => {
      const fb = lb[i][1];
      for (let j = 0; j < fa.length; j++) {
        assert.ok(same(fa[j], fb[j]), `${view} ${k} frame ${j}: another picture`);
        n++;
      }
    });
  }
  assert.ok(n > 300, `every frame of the knight's figure in a dungeon was compared (${n})`);
});

test("the game's two views see every point of a figure where they always have", () => {
  // (the arithmetic of `project` before the mock-up, for the views the game uses)
  const before = (p: V3, back: boolean): readonly [number, number, number] => {
    const a = back ? p[1] : p[0];
    const b = back ? p[0] : p[1];
    return [GRID * (a + b), GRID * 0.5 * (a - b) - p[2], 0.612 * (a - b) + 0.5 * p[2]];
  };
  let seed = 7;
  const rnd = (): number => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 120 - 60;
  for (let i = 0; i < 500; i++) {
    const p: V3 = [rnd(), rnd(), rnd()];
    for (const back of [false, true]) {
      const got = project(p, back ? 'back' : 'front');
      const want = before(p, back);
      assert.ok(got[0] === want[0] && got[1] === want[1] && got[2] === want[2], `(${p.map((v) => v.toFixed(2)).join(', ')}) seen ${back ? 'from behind' : 'from in front'}: somewhere else`);
    }
  }
});

test('switched on, for pictures only: facing left he shows frames of his own, not turned over; and up-left he is the view from behind turned over, lit from the other side', () => {
  const was = TRUE_LEFT.on;
  TRUE_LEFT.on = true;
  let knight: ActorArt;
  try {
    knight = makeHeroArt3().of('warrior', LOOKS[0]);
  } finally {
    TRUE_LEFT.on = was;
  }
  const own = knight.left as { front: AnimSet; back: AnimSet };
  for (const [fx, fy, set] of [[0, 1, own.front], [-1, 0, own.back]] as [number, number, AnimSet][]) {
    const fig = new Figure();
    for (let k = 0; k < 4; k++) {
      const shown = fig.frame(knight, standing(fx, fy, 2 + k * 0.1), 0.1, 0, 0, false);
      assert.ok(set.idle.includes(shown), `facing (${fx}, ${fy}): a frame of his own for facing left, as it is`);
    }
  }
  // facing right he is as he always is
  const fig = new Figure();
  for (const [fx, fy, set] of [[1, 0, knight.front], [0, -1, knight.back]] as [number, number, AnimSet][]) assert.ok(set.idle.includes(fig.frame(knight, standing(fx, fy, 2), 0.1, 0, 0, false)), `facing (${fx}, ${fy}): one of his frames for facing right`);
  // UP-LEFT: the same figure as the view from behind turned over (the view from behind is already
  // over his left shoulder, turned over: skeleton.ts), and lit from the top left, not the top right
  for (const t of [0, 0.7]) {
    const back = paintMove3(MOVES3.rear, t, 'back').px;
    const left = paintMove3(MOVES3.rear, t, 'backL').px;
    let n = 0;
    let shape = 0;
    let tone = 0;
    for (let y = 0; y < back.h; y++) {
      for (let x = 0; x < back.w; x++) {
        // (a picture turned over about the floor point: the anchor names a pixel)
        const xm = 2 * CANVAS3.ax - 1 - x;
        const a = back.has(x, y);
        const b = left.has(xm, y);
        if (a) n++;
        if (a !== b) shape++;
        else if (a && back.get(x, y) !== left.get(xm, y)) tone++;
      }
    }
    assert.ok(shape < n * 0.02, `the stance at ${t} s: up-left is the view from behind turned over (${shape} of ${n} pixels are not)`);
    assert.ok(tone > n * 0.2, `the stance at ${t} s: and lit from the other side (${tone} of ${n} pixels change their tone)`);
  }
});
