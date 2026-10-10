// THE BONE ARCHER ON THE HEROES' BONES (src/art/monster_bones3.ts, `makeArcherArt3`): A MOCK-UP,
// BEHIND A SWITCH THAT IS OFF (`ARCHER3` in src/art/bestiary.ts). The owner has not seen it; nothing
// that changes the look goes in before his yes. So:
//   1. the switch is off, and WITH IT OFF NOTHING CHANGES: the game's bone archer is today's (art/
//      monster_bones.ts), frame for frame and pixel for pixel, and its frames are painted ahead of
//      need in the order they always were;
//   2. a dev page or a playtest that throws the switch gets the mock-up, and putting it back gives
//      today's again;
//   3. THE SKELETON ON THE BONES, WHICH HE HAS SAID YES TO (8 Oct 2026, 08:23), IS NOT CHANGED BY IT:
//      the archer is painted by the same painter, and every frame of the skeleton is what it was
//      before the archer was put on it (its fingerprints, below);
//   4. the mock-up keeps the bargain every monster's pictures keep with the game
//      (tests/monsters.test.ts): both facings, its arrow going where the rules loose it, its pink
//      edge and nothing of a friend's cyan, its death ending as a body on the floor with no light
//      in it, its size.
//   run: tsx --test tests/archer3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { createHash } from 'node:crypto';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { ARCHER3, FIGURE_SIZE, SKELETON3, makeBestiary } from '../src/art/bestiary';
import * as beasts from '../src/art/bestiary';
import { CLIP_FPS, CYAN, GRAIN, IDLE_FRAMES, RIM_ALPHA, WALK_FRAMES } from '../src/art/kit';
import { DEATH_FPS, ENEMY_RIM } from '../src/art/mkit';
import { makeArcherArt } from '../src/art/monster_bones';
import { SHOT3_HIT, makeArcherArt3, makeSkeletonArt3 } from '../src/art/monster_bones3';
import { FRIEND_RIM } from '../src/art/hero3_knight';
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

/** A frame's fingerprint: its size, anchor, lights, pool of light and every pixel (tools/bones3_prints.ts makes the same). */
function print(s: Sprite): string {
  const p = paintingOf(s);
  const h = createHash('sha1');
  h.update(JSON.stringify([s.w, s.h, s.ax, s.ay, s.density, s.lights ?? [], s.aura ?? null]));
  h.update(new Uint8Array(p.d.buffer, p.d.byteOffset, p.d.byteLength));
  return h.digest('hex').slice(0, 12);
}

// =============================================================================================
// 1 and 2: the switch

test('the switch for the bone archer on the bones is off', () => {
  assert.equal(ARCHER3.on, false, "ARCHER3.on is false: the game shows today's bone archer");
});

test("with the switch off the game's bone archer is today's, frame for frame and pixel for pixel", () => {
  const game: ActorArt = makeBestiary().of('archer');
  const today: ActorArt = makeArcherArt();
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
  const today = makeArcherArt();
  // (its other moves, if it had any, before its death: the bestiary's order since Version 19.8)
  const order: Sprite[] = [];
  const picks: ((s: AnimSet) => readonly (readonly Sprite[])[])[] = [
    (s) => [s.idle],
    (s) => [s.walk],
    (s) => [clip(s, 'attack').frames],
    (s) => [s.clips?.heavy?.frames ?? []],
    (s) => Object.values(s.clips?.moves ?? {}).map((c) => c.frames),
    (s) => [clip(s, 'die').frames],
  ];
  for (const pick of picks) {
    for (const set of [today.front, today.back]) for (const frames of pick(set)) order.push(...Array.from(frames));
  }
  order.forEach((want, i) => {
    assert.equal(fresh.warm(['archer']), true, `frame ${i} of ${order.length} is painted`);
    const got = beasts.warmed;
    assert.ok(got !== undefined, 'something was painted');
    if (got) same(got, want, `frame ${i} painted ahead of need`);
  });
  assert.equal(fresh.warm(['archer']), false, 'and then there is nothing left to paint');
});

test("thrown, the switch gives the bone archer on the bones; put back, today's again; the skeleton's switch is its own", () => {
  const b = makeBestiary();
  const today = b.of('archer');
  const skeleton = b.of('skeleton');
  ARCHER3.on = true;
  try {
    const bones = b.of('archer');
    assert.ok(bones !== today, 'another figure');
    assert.ok(b.of('archer') === bones, 'made once, however often it is asked for');
    assert.ok(b.of('skeleton') === skeleton, "the skeleton is whatever its own switch says (today's, with it off)");
    assert.equal(b.warm(['archer']), true);
    const got = beasts.warmed;
    assert.ok(got !== undefined && unlike(got, bones.front.idle[0]) === 0, 'the first frame painted ahead of need is the mock-up standing');
  } finally {
    ARCHER3.on = false;
  }
  assert.equal(SKELETON3.on, false, "and the skeleton's switch was not touched");
  assert.ok(b.of('archer') === today, "put back: today's bone archer, the very same pictures");
  assert.equal(b.warm(['archer']), true);
  const got = beasts.warmed;
  assert.ok(got !== undefined && unlike(got, today.front.idle[0]) === 0, "and painting ahead of need goes back to today's");
});

// =============================================================================================
// 3: the skeleton he has said yes to is as it was

/**
 * EVERY FRAME OF THE SKELETON ON THE BONES as it was on the branch mockup/skeleton-on-bones
 * (5d81df8), before the archer was put on the same painter: one line a list of frames, each frame's
 * fingerprint (`print`; tools/bones3_prints.ts printed these). If the skeleton is ever changed on
 * purpose, print them again.
 */
const SKELETON_PRINTS: Readonly<Record<string, string>> = {
  'front idle': '7d5a53f104ed a00b97b64d16 e6ddd79a6657 063236f4f110 2940606070d9 f7dee52eeb00 598defca3a45 01b485ae69ce 34e904b3d714 28d50eb0adf9 ad197081d15b aea17dee3bc4',
  'front walk': 'dd14a25b8642 55cc42339887 90382528f7bd bb5ece7498f2 0f04a2c67d3e a810aabc4bce e79f4823264a e14d891a2b05',
  'front attack3': '7569bfc17a8a c64b3ac4d67d c47b083f1367',
  'front attack': '7d5a53f104ed b6ff0588ea9f 5c7fbfb3c83c 16b24726fa72 0f4cbf066195 5ec0c942f24e 1a692a253b55 af29f2ff10e5 7569bfc17a8a 1c32fd9c5d26 b85268a33db3 24b72537d2a4 3d27d2b9f950 c64b3ac4d67d 1974e6897aab 4ba598cd2e04 52d48e42cdec c47b083f1367 26e592a22f5e 407eb445b0db c9f51bccffce 6bbe3a3ce9a6',
  'front die': '24e6fad25431 3c600bc5a7c5 653dc50e26e3 bd0843747ef9 ea7e1f4d8ae4 164f971d2b20 51b77522fa2b ce03ce4599e5 b2c4198462ca 1b739468dad0 620ecb982b91 b3024be91bbf 43074a2f0b7b 648a8f4bbfcc 718fa11511db 5aa62b9f0a60 7d4acd8fc244 717edd586ad8 0bf2760aae64 0bf2760aae64 0bf2760aae64',
  'back idle': 'cfe3d67438ab 1ae616c8c688 26e2e3ade0a6 8574c0f66448 baa0b6604573 b2c7f1d06c9b d4223243f6c5 8161b5cd4877 506cd9efc856 277c78c3466b ec7cd19b0577 0568034ea555',
  'back walk': 'f7185497d985 bfa712be1ba5 c13f885d9962 02197cba64b3 c943e1b313d4 a6aa7ce61231 ca32bcd5576c aafea831f481',
  'back attack3': '7ccc7bfead87 21d5f5b3ccaa b3fe50e8ffba',
  'back attack': 'cfe3d67438ab 9222c6191cc6 74745750b292 48df1caab90b 89809afdb9c0 681a5cc38f1f 3650dd46fd1d 8fe660e93f3e 7ccc7bfead87 eba78fd0beaf fe28c1f18b02 c3b34cf239df eb46c0d17ffb 21d5f5b3ccaa 9113dfe61813 4460261bb6d0 9def560b8fb2 b3fe50e8ffba bd9c3ef8f837 91c0c87a78d9 e7831b102562 7d4e2a752d52',
  'back die': 'ee1176ff02ad e57d0509d32d 80e0be77324a ba1d3e6310fc 4c7deb1e6a0e 4ddb06d11dea 51212b8c5283 4e52b27cc29a 932eec8b1e94 8ff976c06af8 efbfe291bfd2 8a566ce35223 9e9985a67370 b356e434cf5e 41e957a58ed9 02072a16df26 fcde6a8ff64c db130dcf7331 e665aaf02111 e665aaf02111 e665aaf02111',
};

test('the skeleton on the bones, which he has said yes to, is frame for frame what it was before the archer', () => {
  const art = makeSkeletonArt3();
  const got: Record<string, string> = {};
  for (const view of VIEWS) {
    const set = art[view];
    got[`${view} idle`] = Array.from(set.idle).map(print).join(' ');
    got[`${view} walk`] = Array.from(set.walk).map(print).join(' ');
    got[`${view} attack3`] = Array.from(set.attack).map(print).join(' ');
    got[`${view} attack`] = Array.from(clip(set, 'attack').frames).map(print).join(' ');
    got[`${view} die`] = Array.from(clip(set, 'die').frames).map(print).join(' ');
  }
  assert.deepEqual(Object.keys(got).sort(), Object.keys(SKELETON_PRINTS).sort(), 'the same lists of frames');
  for (const [k, v] of Object.entries(SKELETON_PRINTS)) assert.equal(got[k], v, `the skeleton's ${k}: every frame as it was`);
});

// =============================================================================================
// 4: the mock-up keeps the bargain every monster keeps

const BONES: ActorArt = makeArcherArt3();

test('the bone archer on the bones has every animation, facing the camera and facing away', () => {
  for (const view of VIEWS) {
    const set = BONES[view];
    const name = `on the bones, ${view}`;
    assert.deepEqual([set.idle.length, set.walk.length], [IDLE_FRAMES, WALK_FRAMES], `${name}: a standing loop of twelve frames and a walk of eight`);
    assert.ok((set.idleFps ?? 0) >= 6 && (set.idleFps ?? 0) <= 24 && (set.walkFps ?? 0) >= 8 && (set.walkFps ?? 0) <= 20, `${name}: at paces of its own (${set.idleFps} and ${set.walkFps} a second)`);
    const c = clip(set, 'attack');
    assert.equal(c.fps, CLIP_FPS, `${name}: the shot at thirty frames a second`);
    assert.ok(c.frames.length >= 14, `${name}: the shot is a draw and a loose (${c.frames.length} frames)`);
    assert.equal(set.attack.length, 3, `${name}: and three stills of it for older code`);
    for (const [what, frames] of lists(set)) {
      Array.from(frames).forEach((f, i) => {
        assert.equal(f.density, GRAIN, `${name}: ${what}, frame ${i}, at the finer grain`);
        assert.ok(pixels(f) > 60, `${name}: ${what}, frame ${i}, is a picture`);
        const p = paintingOf(f);
        const left = -f.ax * GRAIN;
        const top = -f.ay * GRAIN;
        assert.ok(left > -CANVAS3.ax && top > -CANVAS3.ay && left + p.w < CANVAS3.w - CANVAS3.ax && top + p.h < CANVAS3.h - CANVAS3.ay, `${name}: ${what}, frame ${i}, keeps clear of the edge of its canvas`);
      });
    }
    // it is no statue: it listens standing, and walking moves it
    assert.ok(different(set.idle) >= 4, `${name}: ${different(set.idle)} different pictures standing`);
    assert.ok(different(set.walk) >= 6, `${name}: ${different(set.walk)} different pictures in eight of its walk`);
    for (const f of [...Array.from(set.idle), ...Array.from(set.walk)]) {
      const below = paintingOf(f).h - f.ay * GRAIN;
      assert.ok(below >= -4 && below <= 12, `${name}: its feet are on the floor (the picture ends ${below} below the floor point)`);
    }
  }
  const whole = pixels(BONES.front.idle[0]);
  assert.ok(unlike(BONES.front.idle[0], BONES.back.idle[0]) > whole * 0.12, 'its back is not its front');
});

test("its arrow goes on a frame, where the rules loose the archer's, and the draw is held and unmistakable", () => {
  const windup = MONSTERS.archer.windup;
  for (const view of VIEWS) {
    const set = BONES[view];
    const c = clip(set, 'attack');
    const hit = c.hit ?? -1;
    const name = `on the bones, ${view}`;
    assert.equal(hit, SHOT3_HIT, `${name}: the clip says when the arrow goes`);
    assert.ok(Math.abs(hit * c.fps - Math.round(hit * c.fps)) < 1e-6, `${name}: the arrow goes on a frame`);
    assert.ok(Math.abs(hit - windup) <= 0.5 / c.fps + 1e-9, `${name}: it draws for ${hit} s; the rules, ${windup} s`);
    const after = (c.frames.length - 1) / c.fps - hit;
    assert.ok(Math.abs(after - TUNE.monsterRecover) <= 1 / c.fps + 1e-9, `${name}: ${after.toFixed(3)} s after the arrow goes, the rules' rest`);
    const rest = set.idle[0];
    const whole = pixels(rest);
    const n = c.frames.length;
    const loose = Math.round(hit * c.fps);
    assert.ok(unlike(c.frames[0], rest) <= whole * 0.08, `${name}: it begins as it stands`);
    assert.ok(unlike(c.frames[n - 1], rest) <= whole * 0.12, `${name}: it ends as it stands`);
    assert.ok(unlike(c.frames[Math.round(loose * 0.75)], rest) > whole * 0.35, `${name}: drawn, it looks nothing like itself standing`);
    const held = unlike(c.frames[Math.round(loose * 0.7)], c.frames[loose - 1]);
    const goes = unlike(c.frames[loose - 1], c.frames[loose]);
    assert.ok(held < goes, `${name}: the draw is held (${held} pixels change while it is held, ${goes} as the string goes)`);
    // the spark on the arrowhead: lit while the draw is held, gone with the arrow (its light is
    // bigger than the light in a socket: 4.5 game pixels and more, where a socket's is under 3)
    const sparks = (f: Sprite): number => (f.lights ?? []).filter((l) => l.r > 3.5).length;
    assert.ok(sparks(c.frames[loose - 1]) > 0, `${name}: drawn, the arrowhead burns`);
    assert.equal(sparks(c.frames[loose]), 0, `${name}: the frame the string goes, the arrow (and its spark) is gone: the game's own arrow flies from there`);
    assert.equal(sparks(rest), 0, `${name}: standing, the arrowhead is rusted iron, not a spark`);
  }
  assert.deepEqual([clip(BONES.front, 'attack').frames.length, clip(BONES.front, 'attack').hit], [clip(BONES.back, 'attack').frames.length, clip(BONES.back, 'attack').hit], 'front and back agree');
});

test("alive it has the enemy's pink edge all round it, what glows on it is pink, and nothing of it is a friend's cyan", () => {
  const pink = rgba(ENEMY_RIM);
  const cyan = [...CYAN, FRIEND_RIM].map((c) => rgba(c));
  for (const view of VIEWS) {
    const set = BONES[view];
    const c = clip(set, 'attack');
    for (const f of [set.idle[0], set.idle[5], set.walk[3], c.frames[8], c.frames[Math.round(SHOT3_HIT * c.fps) - 1], c.frames[Math.round(SHOT3_HIT * c.fps)]]) {
      const p = paintingOf(f);
      const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < p.w && y < p.h && p.d[(y * p.w + x) * 4 + 3] === 255;
      let rim = 0;
      let bare = 0;
      let friendly = 0;
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          const i = (y * p.w + x) * 4;
          const near = solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1);
          if (p.d[i + 3] === RIM_ALPHA && p.d[i] === pink[0] && p.d[i + 1] === pink[1] && p.d[i + 2] === pink[2]) rim++;
          else if (p.d[i + 3] === 0 && near) bare++;
          if (p.d[i + 3] > 0 && cyan.some((k) => k[0] === p.d[i] && k[1] === p.d[i + 1] && k[2] === p.d[i + 2])) friendly++;
        }
      }
      assert.ok(rim > 40, `${view}: an edge of pink light (${rim} pixels)`);
      assert.equal(bare, 0, `${view}: all the way round`);
      assert.equal(friendly, 0, `${view}: no pixel of a friend's cyan`);
      for (const l of f.lights ?? []) {
        const [r, g, b] = rgba(l.color);
        assert.ok(r >= 150 && r >= g && r >= b, `${view}: a light of ${l.color}`);
      }
      assert.ok(f.aura && rgba(f.aura.color)[0] > rgba(f.aura.color)[2] && (f.aura.a ?? 1) <= 0.25, `${view}: a dim pink pool of light behind it`);
    }
  }
  assert.ok((BONES.front.idle[0].lights ?? []).length > 0, 'its sockets glow');
});

test('it falls apart, and its last frame is its bones, its bow and its hood lying on the floor with no light in it', () => {
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
    assert.equal(burning, 0, `${name}: the fire is out of its sockets and off its arrowhead (${burning} pixels still burn)`);
    assert.equal(rim, 0, `${name}: no edge of light on the dead`);
  }
});

test('it stands as tall as the game takes a bone archer to be', () => {
  const size = FIGURE_SIZE.archer;
  const s = BONES.front.idle[0];
  const p = paintingOf(s);
  const ax = Math.round(s.ax * GRAIN);
  const ay = Math.round(s.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 4; x <= ax + 4; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game hangs an archer's bar ${size.top} game pixels up; this one's head is ${head}`);
  const reach = Math.max(s.ax, s.w - s.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `the game takes it to be ${size.half} either side; the picture reaches ${reach}`);
});
