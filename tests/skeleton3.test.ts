// THE SKELETON ON THE HEROES' BONES (src/art/monster_bones3.ts): A MOCK-UP, BEHIND A SWITCH THAT IS
// OFF (`SKELETON3` in src/art/bestiary.ts). The owner has not seen it; nothing that changes the look
// goes in before his yes. So:
//   1. the switch is off, and WITH IT OFF NOTHING CHANGES: the game's skeleton is today's (art/
//      monster_bones.ts), frame for frame and pixel for pixel, and its frames are painted ahead of
//      need in the order they always were;
//   2. a dev page or a playtest that throws the switch gets the mock-up, and putting it back gives
//      today's again;
//   3. the mock-up keeps the bargain every monster's pictures keep with the game
//      (tests/monsters.test.ts): both facings, its blow where the rules land it, its pink edge, its
//      death ending as a body on the floor with no light in it, its size.
//   run: tsx --test tests/skeleton3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { FIGURE_SIZE, SKELETON3, makeBestiary } from '../src/art/bestiary';
import * as beasts from '../src/art/bestiary';
import { CLIP_FPS, GRAIN, IDLE_FRAMES, RIM_ALPHA, WALK_FRAMES } from '../src/art/kit';
import { DEATH_FPS, ENEMY_RIM } from '../src/art/mkit';
import { makeSkeletonArt } from '../src/art/monster_bones';
import { CHOP_HIT, makeSkeletonArt3 } from '../src/art/monster_bones3';
import { CANVAS3 } from '../src/art/skin';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { MONSTERS, TUNE } from '../src/game/defs';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const VIEWS = ['front', 'back'] as const;

function clip(set: AnimSet, k: 'attack' | 'die'): Clip {
  const c = set.clips ? set.clips[k] : undefined;
  if (!c) throw new Error(`no ${k} clip`);
  return c;
}

/** Every list of frames of one facing, by name. */
function lists(set: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['standing', set.idle], ['walking', set.walk], ['attack', clip(set, 'attack').frames], ['the three stills of the attack', set.attack]];
  if (set.clips && set.clips.die) out.push(['death', set.clips.die.frames]);
  return out;
}

/** How many pixels of a frame are painted. */
function pixels(s: Sprite): number {
  const p = paintingOf(s);
  let n = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) n++;
  return n;
}

/** How many different pictures there are in a list of frames. */
function different(frames: Sprite[]): number {
  const kept: Sprite[] = [];
  for (const f of Array.from(frames)) if (!kept.some((k) => unlike(k, f) === 0)) kept.push(f);
  return kept.length;
}

/** The same picture, laid down in the same place, giving off the same light. */
function same(a: Sprite, b: Sprite, what: string): void {
  assert.deepEqual([a.w, a.h, a.ax, a.ay, a.density], [b.w, b.h, b.ax, b.ay, b.density], `${what}: the same size and place`);
  assert.equal(unlike(a, b), 0, `${what}: the same picture, pixel for pixel`);
  assert.deepEqual(a.lights ?? [], b.lights ?? [], `${what}: the same lights`);
  assert.deepEqual(a.aura ?? null, b.aura ?? null, `${what}: the same pool of light behind it`);
}

// =============================================================================================
// 1 and 2: the switch

test('the switch for the skeleton on the bones is off', () => {
  assert.equal(SKELETON3.on, false, 'SKELETON3.on is false: the game shows today\'s skeleton');
});

test("with the switch off the game's skeleton is today's, frame for frame and pixel for pixel", () => {
  const game: ActorArt = makeBestiary().of('skeleton');
  const today: ActorArt = makeSkeletonArt();
  for (const view of VIEWS) {
    const a = game[view];
    const b = today[view];
    assert.deepEqual([a.idleFps, a.walkFps, a.idle.length, a.walk.length, a.attack.length], [b.idleFps, b.walkFps, b.idle.length, b.walk.length, b.attack.length], `${view}: the same loops at the same paces`);
    for (const k of ['attack', 'die'] as const) {
      const ca = clip(a, k);
      const cb = clip(b, k);
      assert.deepEqual([ca.fps, ca.hit, ca.loop, ca.frames.length], [cb.fps, cb.hit, cb.loop, cb.frames.length], `${view}: the same ${k}, as long and at the same pace`);
    }
    const la = lists(a);
    const lb = lists(b);
    la.forEach(([what, frames], i) => Array.from(frames).forEach((f, j) => same(f, lb[i][1][j], `${view}, ${what}, frame ${j}`)));
  }
});

test('with the switch off its frames are painted ahead of need in the order they always were', () => {
  const fresh = makeBestiary();
  const today = makeSkeletonArt();
  // (standing, walking, the attack, a second attack if it had one, and last its death; facing
  // the camera and then facing away; the bestiary as it was before the switch was there)
  const order: Sprite[] = [];
  for (const pick of [(s: AnimSet) => s.idle, (s: AnimSet) => s.walk, (s: AnimSet) => clip(s, 'attack').frames, (s: AnimSet) => s.clips?.heavy?.frames ?? [], (s: AnimSet) => clip(s, 'die').frames]) {
    for (const set of [today.front, today.back]) order.push(...Array.from(pick(set)));
  }
  order.forEach((want, i) => {
    assert.equal(fresh.warm(['skeleton']), true, `frame ${i} of ${order.length} is painted`);
    const got = beasts.warmed;
    assert.ok(got !== undefined, 'something was painted');
    if (got) same(got, want, `frame ${i} painted ahead of need`);
  });
  assert.equal(fresh.warm(['skeleton']), false, 'and then there is nothing left to paint');
});

test("thrown, the switch gives the skeleton on the bones; put back, today's again", () => {
  const b = makeBestiary();
  const today = b.of('skeleton');
  SKELETON3.on = true;
  try {
    const bones = b.of('skeleton');
    assert.ok(bones !== today, 'another figure');
    assert.ok(b.of('skeleton') === bones, 'made once, however often it is asked for');
    assert.ok(b.of('archer') === b.of('archer') && b.of('archer') !== bones, 'the bone archer is its own, as it was');
    // (painting ahead of need follows the switch: the frames it paints are the mock-up's)
    assert.equal(b.warm(['skeleton']), true);
    const got = beasts.warmed;
    assert.ok(got !== undefined && unlike(got, bones.front.idle[0]) === 0, 'the first frame painted ahead of need is the mock-up standing');
  } finally {
    SKELETON3.on = false;
  }
  assert.ok(b.of('skeleton') === today, "put back: today's skeleton, the very same pictures");
  assert.equal(b.warm(['skeleton']), true);
  const got = beasts.warmed;
  assert.ok(got !== undefined && unlike(got, today.front.idle[0]) === 0, "and painting ahead of need goes back to today's");
});

// =============================================================================================
// 3: the mock-up keeps the bargain every monster keeps

const BONES: ActorArt = makeSkeletonArt3();

test('the skeleton on the bones has every animation, facing the camera and facing away', () => {
  for (const view of VIEWS) {
    const set = BONES[view];
    const name = `on the bones, ${view}`;
    assert.deepEqual([set.idle.length, set.walk.length], [IDLE_FRAMES, WALK_FRAMES], `${name}: a standing loop of twelve frames and a walk of eight`);
    assert.ok((set.idleFps ?? 0) >= 6 && (set.idleFps ?? 0) <= 24 && (set.walkFps ?? 0) >= 8 && (set.walkFps ?? 0) <= 20, `${name}: at paces of its own (${set.idleFps} and ${set.walkFps} a second)`);
    const c = clip(set, 'attack');
    assert.equal(c.fps, CLIP_FPS, `${name}: the attack at thirty frames a second`);
    assert.ok(c.frames.length >= 14, `${name}: the attack is a swing (${c.frames.length} frames)`);
    assert.equal(set.attack.length, 3, `${name}: and three stills of it for older code`);
    for (const [what, frames] of lists(set)) {
      Array.from(frames).forEach((f, i) => {
        assert.equal(f.density, GRAIN, `${name}: ${what}, frame ${i}, at the finer grain`);
        assert.ok(pixels(f) > 60, `${name}: ${what}, frame ${i}, is a picture`);
        // (cut down to what is painted and anchored: measured back from its anchor, it is clear of the bones' canvas's edge)
        const p = paintingOf(f);
        const left = -f.ax * GRAIN;
        const top = -f.ay * GRAIN;
        assert.ok(left > -CANVAS3.ax && top > -CANVAS3.ay && left + p.w < CANVAS3.w - CANVAS3.ax && top + p.h < CANVAS3.h - CANVAS3.ay, `${name}: ${what}, frame ${i}, keeps clear of the edge of its canvas`);
      });
    }
    // it is no statue: it creaks standing, and walking moves it
    assert.ok(different(set.idle) >= 4, `${name}: ${different(set.idle)} different pictures standing`);
    assert.ok(different(set.walk) >= 6, `${name}: ${different(set.walk)} different pictures in eight of its walk`);
    // its feet are on the floor
    for (const f of [...Array.from(set.idle), ...Array.from(set.walk)]) {
      const below = paintingOf(f).h - f.ay * GRAIN;
      assert.ok(below >= -4 && below <= 12, `${name}: its feet are on the floor (the picture ends ${below} below the floor point)`);
    }
  }
  const whole = pixels(BONES.front.idle[0]);
  assert.ok(unlike(BONES.front.idle[0], BONES.back.idle[0]) > whole * 0.12, 'its back is not its front');
});

test("its blow is on a frame, where the rules land the skeleton's, and the wind-up is held and unmistakable", () => {
  const windup = MONSTERS.skeleton.windup;
  assert.equal(CHOP_HIT, windup, "the chop's blow is the skeleton's wind-up in the rules");
  for (const view of VIEWS) {
    const set = BONES[view];
    const c = clip(set, 'attack');
    const hit = c.hit ?? -1;
    const name = `on the bones, ${view}`;
    assert.ok(Math.abs(hit * c.fps - Math.round(hit * c.fps)) < 1e-6, `${name}: the blow is on a frame`);
    assert.ok(Math.abs(hit - windup) <= 0.5 / c.fps + 1e-9, `${name}: it winds up for ${hit} s; the rules, ${windup} s`);
    const after = (c.frames.length - 1) / c.fps - hit;
    assert.ok(Math.abs(after - TUNE.monsterRecover) <= 1 / c.fps + 1e-9, `${name}: ${after.toFixed(3)} s after the blow, the rules' rest`);
    const rest = set.idle[0];
    const whole = pixels(rest);
    const n = c.frames.length;
    const blow = Math.round(hit * c.fps);
    assert.ok(unlike(c.frames[0], rest) <= whole * 0.08, `${name}: it begins as it stands`);
    assert.ok(unlike(c.frames[n - 1], rest) <= whole * 0.12, `${name}: it ends as it stands`);
    assert.ok(unlike(c.frames[Math.round(blow * 0.75)], rest) > whole * 0.35, `${name}: wound up, it looks nothing like itself standing`);
    const held = unlike(c.frames[Math.round(blow * 0.7)], c.frames[Math.round(blow * 0.85)]);
    const falls = unlike(c.frames[Math.round(blow * 0.85)], c.frames[blow]);
    assert.ok(held < falls, `${name}: the wound-up pose is held (${held} pixels change while it is held, ${falls} as the blow falls)`);
  }
  assert.deepEqual([clip(BONES.front, 'attack').frames.length, clip(BONES.front, 'attack').hit], [clip(BONES.back, 'attack').frames.length, clip(BONES.back, 'attack').hit], 'front and back agree');
});

test('alive it has the enemy\'s pink edge all round it, and what glows on it is pink, never a friend\'s cyan', () => {
  const pink = rgba(ENEMY_RIM);
  for (const view of VIEWS) {
    const set = BONES[view];
    for (const f of [set.idle[0], set.walk[3], clip(set, 'attack').frames[8], clip(set, 'attack').frames[12]]) {
      const p = paintingOf(f);
      const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < p.w && y < p.h && p.d[(y * p.w + x) * 4 + 3] === 255;
      let rim = 0;
      let bare = 0;
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          const i = (y * p.w + x) * 4;
          const near = solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1);
          if (p.d[i + 3] === RIM_ALPHA && p.d[i] === pink[0] && p.d[i + 1] === pink[1] && p.d[i + 2] === pink[2]) rim++;
          else if (p.d[i + 3] === 0 && near) bare++;
        }
      }
      assert.ok(rim > 40, `${view}: an edge of pink light (${rim} pixels)`);
      assert.equal(bare, 0, `${view}: all the way round`);
      for (const l of f.lights ?? []) {
        const [r, g, b] = rgba(l.color);
        assert.ok(r >= 150 && r >= g && r >= b, `${view}: a light of ${l.color}`);
      }
      assert.ok(f.aura && rgba(f.aura.color)[0] > rgba(f.aura.color)[2] && (f.aura.a ?? 1) <= 0.25, `${view}: a dim pink pool of light behind it`);
    }
  }
  assert.ok((BONES.front.idle[0].lights ?? []).length > 0, 'its sockets glow');
});

test('it falls apart, and its last frame is a heap of bones lying on the floor with no light in it', () => {
  const hot = ['#ff4f8a', '#ffb070', '#fff0a0'].map((c) => rgba(c));
  for (const view of VIEWS) {
    const set = BONES[view];
    const die = clip(set, 'die');
    const name = `on the bones, ${view}`;
    assert.equal(die.fps, DEATH_FPS, `${name}: at twenty frames a second`);
    const frames = Array.from(die.frames);
    const seconds = (frames.length - 1) / DEATH_FPS;
    assert.ok(seconds >= 0.8 - 0.01 && seconds <= 2.5, `${name}: it takes ${seconds} s`);
    const stood = paintingOf(set.idle[0]);
    const first = paintingOf(frames[0]);
    assert.ok(Math.abs(first.w - stood.w) <= 6 && Math.abs(first.h - stood.h) <= 6, `${name}: it begins as it stood`);
    assert.ok(different(frames) >= frames.length * 0.7, `${name}: ${different(frames)} different pictures in ${frames.length}`);
    const body = frames[frames.length - 1];
    const lying = paintingOf(body);
    const tallest = Math.max(...frames.map((f) => paintingOf(f).h));
    const below = lying.h - body.ay * GRAIN;
    assert.ok(lying.h <= tallest * 0.72, `${name}: it lies (${lying.h} high; dying, ${tallest})`);
    assert.ok(below >= 0 && below <= 12, `${name}: on the floor (it ends ${below} below the floor point)`);
    assert.ok(pixels(body) > 400, `${name}: there is something of it left to see (${pixels(body)} pixels)`);
    assert.equal((body.lights ?? []).length, 0, `${name}: no light on the body`);
    for (const f of frames) assert.ok(!f.aura, `${name}: no pool of light behind a dying thing`);
    let burning = 0;
    let rim = 0;
    for (let i = 0; i < lying.d.length; i += 4) {
      if (lying.d[i + 3] === 0) continue;
      if (hot.some((c) => c[0] === lying.d[i] && c[1] === lying.d[i + 1] && c[2] === lying.d[i + 2])) burning++;
      if (lying.d[i + 3] === RIM_ALPHA) rim++;
    }
    assert.equal(burning, 0, `${name}: the fire is out of its sockets (${burning} pixels still burn)`);
    assert.equal(rim, 0, `${name}: no edge of light on the dead`);
  }
});

test('it stands as tall as the game takes a skeleton to be', () => {
  const size = FIGURE_SIZE.skeleton;
  const s = BONES.front.idle[0];
  const p = paintingOf(s);
  const ax = Math.round(s.ax * GRAIN);
  const ay = Math.round(s.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game hangs a skeleton's bar ${size.top} game pixels up; this one's head is ${head}`);
  const reach = Math.max(s.ax, s.w - s.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `the game takes it to be ${size.half} either side; the picture reaches ${reach}`);
});
