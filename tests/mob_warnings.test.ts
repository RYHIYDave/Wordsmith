// THE NEW MONSTERS' WARNINGS ON THE FLOOR (src/art/mob_warnings.ts): A MOCK-UP, NOT IN THE GAME.
// His words, 9 Oct, 07:44: "When you get to attacks, I’d like to see something other than a big
// red circle on the ground." Each of the three new monsters warns of its blow in a shape of its own.
//   1. no file of the game draws them yet (the main chat's, with his yes), and the switch is off;
//   2. each shows from the first moment of its wind-up to the end of its blow's mark, and nothing
//      before or after;
//   3. only the enemy's colours (pink burning to gold), the floor's stone and its dust: nothing cyan;
//   4. WHERE, from the first moment: faint, it already reaches as far as the blow will;
//   5. WHEN: it lights up as the blow comes, nothing lit at first and most just before it;
//   6. the blow: a white-gold flash where it lands, then a mark that fades;
//   7. the same from frame to frame (nothing left to chance), and each Golem's blow its own cracks;
//   8. turned with the monster: facing to the left of the screen (shown mirrored) it is the mirror;
//   9. where the blow lands in its pictures (art/new_mobs3.ts) is inside its warning.
//   run: tsx --test tests/mob_warnings.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { FLAME } from '../src/art/mkit';
import { WARN, WARN_COLOURS, drawWarning, golemCracks, warnShowing } from '../src/art/mob_warnings';
import type { Warn } from '../src/art/mob_warnings';
import { BONEWARD, GOLEM, NEW_MOBS, NEW_MOBS_LIST, SHADE, TILE3, skeletonAt } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

/** The floor on the screen as the game has it: a tile 32 of its pixels across and 16 down. */
const ISO = (x: number, y: number): readonly [number, number] => [(x - y) * 16, (x + y) * 8];
/** And back: the floor point (tiles) under a pixel of the screen. */
const floorOf = (sx: number, sy: number): [number, number] => [(sx / 16 + sy / 8) / 2, (sy / 8 - sx / 16) / 2];

interface Dot {
  x: number;
  y: number;
  c: string;
  a: number;
}
interface Drawn {
  px: Dot[];
  glows: { x: number; y: number; r: number; c: string; a: number }[];
}
/** Everything a warning draws, pixel by pixel, on a canvas that only takes note. */
function drawn(w: Warn): Drawn {
  const px: Dot[] = [];
  const glows: Drawn['glows'] = [];
  const pen = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(x: number, y: number, ww: number, hh: number): void {
      for (let i = 0; i < ww; i++) for (let j = 0; j < hh; j++) px.push({ x: x + i, y: y + j, c: this.fillStyle, a: this.globalAlpha });
    },
  };
  drawWarning(pen as unknown as CanvasRenderingContext2D, w, ISO, (_g, x, y, r, c, a) => glows.push({ x, y, r, c, a }));
  return { px, glows };
}
const warnOf = (mob: Mob, t: number, more: Partial<Warn> = {}): Warn => ({ id: mob.id, x: 0, y: 0, fx: 1, fy: 0, t, windup: mob.hit, ...more });
/** The moments a warning lives through: its wind-up and its mark, a thirtieth of a second apart. */
function moments(mob: Mob): number[] {
  const out: number[] = [];
  for (let t = 0; t < mob.hit + WARN[mob.id].mark; t += 1 / 30) out.push(t);
  return out;
}
/** Lit: the brighter of the enemy's glowing colours (not its darkest, the faint one). */
const LIT = new Set([FLAME[1], FLAME[2], FLAME[3], FLAME[4]]);
const lit = (d: Drawn): number => d.px.filter((p) => LIT.has(p.c)).length;

/** True of a colour in the cyan family (as tests/new_mobs3.test.ts has it). */
function cyanish(c: string): boolean {
  const [r, g, b] = rgba(c);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 90 || max - min < 0.3 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 150 && h <= 215;
}

test('no file of the game draws them yet, and the switch is off', () => {
  assert.equal(NEW_MOBS.on, false);
  const files = fs.readdirSync('src', { recursive: true }).filter((f) => f.endsWith('.ts') && !f.startsWith('dev'));
  for (const f of files) {
    if (f.endsWith('mob_warnings.ts')) continue;
    assert.ok(!fs.readFileSync(path.join('src', f), 'utf8').includes('mob_warnings'), `${f} draws the mock-up's warnings`);
  }
});

test('each shows from the first moment of its wind-up to the end of its mark, and nothing before or after', () => {
  for (const mob of NEW_MOBS_LIST) {
    const W = mob.hit;
    const end = W + WARN[mob.id].mark;
    assert.ok(!warnShowing(warnOf(mob, -0.01)) && drawn(warnOf(mob, -0.01)).px.length === 0, `${mob.id}: nothing before its wind-up`);
    assert.ok(!warnShowing(warnOf(mob, end)) && drawn(warnOf(mob, end)).px.length === 0, `${mob.id}: nothing once its mark is gone`);
    for (const t of moments(mob)) {
      assert.ok(warnShowing(warnOf(mob, t)), `${mob.id} at ${t.toFixed(2)} s: showing`);
      const n = drawn(warnOf(mob, t)).px.length;
      assert.ok(n > 30, `${mob.id} at ${t.toFixed(2)} s: only ${n} pixels drawn`);
    }
  }
});

test('only the enemy’s colours, the floor’s stone and its dust: nothing cyan', () => {
  const allowed = new Set(WARN_COLOURS);
  for (const c of WARN_COLOURS) assert.ok(!cyanish(c), `${c} is not cyan`);
  for (const mob of NEW_MOBS_LIST) {
    for (const t of moments(mob)) {
      const d = drawn(warnOf(mob, t));
      for (const p of d.px) assert.ok(allowed.has(p.c), `${mob.id} at ${t.toFixed(2)} s: ${p.c} is not a warning's colour`);
      for (const l of d.glows) assert.ok((FLAME as readonly string[]).includes(l.c), `${mob.id} at ${t.toFixed(2)} s: a light of ${l.c}`);
    }
  }
});

test('WHERE, from the first moment: faint, it already reaches as far as the blow will', () => {
  for (const mob of NEW_MOBS_LIST) {
    const d = drawn(warnOf(mob, 0.01));
    assert.equal(lit(d), 0, `${mob.id}: nothing lit at the first moment (${lit(d)} pixels)`);
    const pts = d.px.map((p) => floorOf(p.x, p.y));
    if (mob.id === 'golem') {
      // hairlines out to the edge of what it will hit, all the way round where the club lands
      const { reach, side, r } = WARN.golem;
      const quarters = new Set<number>();
      let far = 0;
      for (const [x, y] of pts) {
        const dx = x - reach;
        const dy = y - side;
        far = Math.max(far, Math.hypot(dx, dy));
        quarters.add((dx >= 0 ? 1 : 0) + (dy >= 0 ? 2 : 0));
      }
      assert.ok(far > r * 0.75, `the Golem's cracks reach ${far.toFixed(2)} of ${r} tiles out`);
      assert.equal(quarters.size, 4, 'and all the way round');
    } else {
      const far = Math.max(...pts.map(([x]) => x));
      assert.ok(far > WARN[mob.id].reach * 0.85, `${mob.id}: reaches ${far.toFixed(2)} of ${WARN[mob.id].reach} tiles ahead at the first moment`);
    }
  }
});

test('WHEN: it lights up as the blow comes, nothing lit at first and most just before it', () => {
  for (const mob of NEW_MOBS_LIST) {
    const at = (k: number): number => lit(drawn(warnOf(mob, k * mob.hit)));
    const [a, b, c, e] = [at(0.02), at(0.35), at(0.7), at(0.97)];
    assert.equal(a, 0, `${mob.id}: nothing lit at first`);
    assert.ok(b > 0 && b < c, `${mob.id}: more lit as it goes on (${b}, then ${c})`);
    assert.ok(e >= c * 0.9, `${mob.id}: and as much or more just before the blow (${c}, then ${e})`);
  }
});

test('the blow: a white-gold flash where it lands, then a mark that fades', () => {
  for (const mob of NEW_MOBS_LIST) {
    const W = mob.hit;
    const mark = WARN[mob.id].mark;
    const flash = drawn(warnOf(mob, W + 0.02));
    const hot = flash.px.filter((p) => p.c === FLAME[4]).length;
    assert.ok(hot > 20, `${mob.id}: the blow flashes white-gold (${hot} pixels)`);
    const before = drawn(warnOf(mob, W - 0.02)).px.filter((p) => p.c === FLAME[4]).length;
    assert.ok(hot > before, `${mob.id}: whiter as it lands than just before (${before}, then ${hot})`);
    const weight = (d: Drawn): number => d.px.reduce((s, p) => s + p.a, 0);
    const late = drawn(warnOf(mob, W + mark * 0.95));
    assert.equal(late.px.filter((p) => p.c === FLAME[4]).length, 0, `${mob.id}: no flash left as its mark goes`);
    assert.ok(weight(late) < weight(drawn(warnOf(mob, W + mark * 0.3))) * 0.6, `${mob.id}: the mark fades`);
  }
});

test('the same from frame to frame, and each Golem’s blow its own cracks', () => {
  for (const mob of NEW_MOBS_LIST) {
    for (const t of [0.1, mob.hit * 0.8, mob.hit + 0.1]) assert.deepEqual(drawn(warnOf(mob, t)), drawn(warnOf(mob, t)), `${mob.id} at ${t}: the same twice`);
  }
  const one = golemCracks(1, WARN.golem.r);
  const two = golemCracks(2, WARN.golem.r);
  assert.ok(JSON.stringify(one) !== JSON.stringify(two), 'two blows, two sets of cracks');
  assert.ok(one.filter((c) => c.main).length === 8, 'eight cracks from the middle');
});

test('turned with the monster: facing to the left of the screen (shown mirrored) it is the mirror', () => {
  for (const mob of NEW_MOBS_LIST) {
    for (const t of [mob.hit * 0.9, mob.hit + 0.05]) {
      const right = drawn(warnOf(mob, t)).px;
      const left = drawn(warnOf(mob, t, { fx: 0, fy: 1 })).px;
      const box = (ps: Dot[]): number[] => [Math.min(...ps.map((p) => p.x)), Math.max(...ps.map((p) => p.x)), Math.min(...ps.map((p) => p.y)), Math.max(...ps.map((p) => p.y))];
      const [l0, l1, l2, l3] = box(left);
      const [r0, r1, r2, r3] = box(right);
      for (const [a, b, what] of [[l0, -r1, 'left edge'], [l1, -r0, 'right edge'], [l2, r2, 'top'], [l3, r3, 'foot']] as [number, number, string][]) {
        assert.ok(Math.abs(a - b) <= 2, `${mob.id} at ${t.toFixed(2)}: its ${what} mirrored (${a} against ${b})`);
      }
      assert.ok(Math.abs(left.length - right.length) <= right.length * 0.05, `${mob.id}: as much of it either way`);
    }
  }
});

test('where the blow lands in its pictures (art/new_mobs3.ts) is inside its warning', () => {
  /** A point of the figure (its own lengths: forward, to its left, up) on the floor, in tiles, facing down the screen to the right (+x). */
  const tiles = (p: readonly number[]): [number, number] => [p[0] / TILE3, -p[1] / TILE3];
  // the Shade's claws, both hands: between its marks' ends, and no further to the side than its marks
  const sh = skeletonAt(SHADE, 'attack', SHADE.hit);
  for (const hand of [sh.handL, sh.handR]) {
    const [a, c] = tiles(hand);
    assert.ok(a > 0.25 && a < WARN.shade.reach && Math.abs(c) < WARN.shade.r, `the Shade's claw comes down ${a.toFixed(2)} ahead, ${c.toFixed(2)} across`);
  }
  // the Boneward's spear: its hand and its head (23 of its lengths on from the hand), each on the lane, within its half-width
  const bw = skeletonAt(BONEWARD, 'attack', BONEWARD.hit);
  const head = [bw.handR[0] + 23, bw.handR[1], bw.handR[2]];
  for (const p of [bw.handR, head]) {
    const [a, c] = tiles(p);
    assert.ok(a > 0.3 && a < WARN.boneward.reach && Math.abs(c - WARN.boneward.side) < WARN.boneward.r * 1.25, `the Boneward's spear at ${a.toFixed(2)} ahead, ${c.toFixed(2)} across`);
  }
  // the Golem's club, in its left hand: well inside the cracks, near where they start
  const go = skeletonAt(GOLEM, 'attack', GOLEM.hit);
  const [a, c] = tiles(go.handL);
  const off = Math.hypot(a - WARN.golem.reach, c - WARN.golem.side);
  assert.ok(off < WARN.golem.r * 0.25, `the Golem's club hand ${off.toFixed(2)} tiles from where its cracks start`);
});
