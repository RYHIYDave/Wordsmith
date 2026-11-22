// THE WARLOCK'S DEMON, THE LIVING SHADOW, FROM ALL EIGHT SIDES (art/sides_more.ts EIGHT_MORE.demon; art/shadow_art.ts
// makeShadowArt; the queue's draw-the-demon-from-eight-sides, 22 Nov 2026; docs/mockups/demon_eight/README.md; ON at his yes to
// its film, 22 Nov 2026, by 09:41: “Yes, all eight are right (Recommended)”). Five sides truly
// turned and three their mirrors, at his word of 22 Nov 2026, 09:01: “He can flip since he doesn’t have a weapon or anything in
// one hand so it should be exactly 8.” Held here:
//   1. off, its two sides as ever; on, all eight, in the game's order, each mirror's turn the very side it stands for;
//   2. every side the same lists as its two of before: as long, at the same speeds, its blows at the same moments;
//   3. its two of before the very same pictures, on or off (from in front; from behind, turned 90), but where its picture was too
//      short under its feet: on, SHADOW_BELOW more room there, every pixel it had where it was and only what was cut new;
//   4. the three mirrors their sources mirrored, anchor and all, its slashes made walking to its left and right swapped;
//   5. its burning out never mirrored (the man getting up in it has his demon arm on one side): truly turned on those three;
//   6. the bake: all eight sides packed as its two are; asked for ahead from the man's own side.
//   run: tsx --test tests/shadow_eight.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { EIGHT_MORE, MORE_SIDES, MORE_TURN } from '../src/art/sides_more';
import { EIGHT_ORDER, heroSides, isEight } from '../src/art/sides';
import { SHADOW_MIRRORS, makeShadowArt, ownTurn, shadowDemonSet } from '../src/art/shadow_art';
import { makeWarlockArt } from '../src/art/warlock_art';
import { bakeLists } from '../src/art/heroes3';
import type { AnimSet, Clip } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';
import { packsOf } from '../src/render/baked';
import type { BakeKey, PackOf } from '../src/render/baked';
import { warlockAskAhead } from '../src/render/warlock_packs';
import { SHADOW_BELOW } from '../src/dev/demon_new';
import { drawShadowAt, shadowMoves } from '../src/dev/shadow_moves';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();

/** With the switch set so, and put back after. */
function eight<T>(on: boolean, f: () => T): T {
  const was = EIGHT_MORE.demon;
  EIGHT_MORE.demon = on;
  try {
    return f();
  } finally {
    EIGHT_MORE.demon = was;
  }
}
type Sides = Record<string, AnimSet>;
const art = (on: boolean): Sides => eight(on, () => makeShadowArt() as unknown as Sides);

/** Two pictures the very same: size, anchor and every pixel. */
function same(a: Sprite, b: Sprite, what: string): void {
  assert.deepEqual([a.w, a.h, a.ax, a.ay], [b.w, b.h, b.ax, b.ay], `${what}: its size and anchor`);
  const da = paintingOf(a).d;
  const db = paintingOf(b).d;
  assert.equal(da.length, db.length, `${what}: as many pixels`);
  let off = 0;
  for (let i = 0; i < da.length; i++) if (da[i] !== db[i]) off++;
  assert.equal(off, 0, `${what}: every pixel the same`);
}
/** `b` is `a` mirrored left to right: its pixels, and its anchor as the far edge's pixel (render's own flipSprite). */
function mirrorOf(a: Sprite, b: Sprite, what: string): void {
  const da = paintingOf(a).d;
  const db = paintingOf(b).d;
  const k = a.density ?? 1;
  assert.deepEqual([b.w, b.h, b.ay], [a.w, a.h, a.ay], `${what}: its size, and its feet as high`);
  assert.ok(Math.abs(b.ax - (a.w - 1 / k - a.ax)) < 1e-9, `${what}: its anchor mirrored (${b.ax} for ${a.ax} of ${a.w})`);
  const W = a.w * k;
  const H = a.h * k;
  let off = 0;
  let ink = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const j = (y * W + (W - 1 - x)) * 4;
      if (da[i + 3]) ink++;
      for (let c = 0; c < 4; c++) if (da[i + c] !== db[j + c]) off++;
    }
  }
  assert.ok(ink > 500, `${what}: painted`);
  assert.equal(off, 0, `${what}: every pixel its source's mirrored`);
}
/** What a side's lists are, without painting them: how long each, how fast, where its blows land. */
function shape(s: AnimSet): unknown {
  const c = (x?: Clip) => (x ? [x.frames.length, x.fps, x.hit ?? null, !!x.tail] : null);
  const cl = s.clips ?? {};
  return {
    idle: [s.idle.length, s.idleFps], walk: [s.walk.length, s.walkFps, s.walkStride], start: c(s.start), startAt: s.startAt,
    stops: (s.stops ?? []).map(c), attack: s.attack.length, heavy: s.heavy?.length, drop: s.dropAfterSwing,
    clips: Object.fromEntries(Object.entries(cl).map(([k, v]) => [k, Array.isArray(v) ? v.map(c) : c(v as Clip)])),
  };
}

test('1. off, its two sides; on, all eight in the game\'s order, each mirror\'s turn the side it stands for', () => {
  const off = art(false);
  assert.deepEqual(Object.keys(off).sort(), ['back', 'front'], 'off: from in front and from behind');
  // (ON at his yes to its film, 22 Nov 2026, by 09:41: “Yes, all eight are right (Recommended)”)
  assert.equal(EIGHT_MORE.demon, true, 'on in the game, at his yes');
  const on = art(true);
  assert.deepEqual(Object.keys(on).sort(), [...MORE_SIDES].sort(), 'on: its eight');
  assert.ok(isEight(on as never), 'the game reads it as eight-sided');
  eight(true, () => assert.equal(heroSides(makeWarlockArt({ form: 'demon', place: 'dungeon' })).length, 8, 'the Warlock\'s demon, eight sides'));
  assert.deepEqual(EIGHT_ORDER, MORE_SIDES, 'in the game\'s order');
  for (const [mirror, source] of Object.entries(SHADOW_MIRRORS)) {
    assert.equal(ownTurn(MORE_TURN[source]), MORE_TURN[mirror as keyof typeof MORE_TURN], `${mirror} is ${source} mirrored`);
  }
  assert.deepEqual([ownTurn(0), ownTurn(45), ownTurn(90), ownTurn(-45), ownTurn(135)], [-90, -135, 180, -45, 135], 'the turns as mirrored');
});

test('2. every side the same lists as its two of before: as long, as fast, its blows at the same moments', () => {
  const was = shape(art(false).front);
  const on = art(true);
  for (const side of MORE_SIDES) assert.deepEqual(shape(on[side]), was, side);
  assert.equal(on.front.clips!.attackWalk!.length, 4, 'its left claw\'s slash made walking, four ways');
  assert.equal(on.front.clips!.attack2Walk!.length, 4, 'its right claw\'s, four ways');
});

test('3. its two of before the very same pictures, on or off', () => {
  const off = art(false);
  const on = art(true);
  same(on.front.idle[10], off.front.idle[10], 'its stand from in front');
  same(on.back.idle[10], off.back.idle[10], 'its stand from behind');
  const hit = Math.round(on.front.clips!.attack!.hit! * on.front.clips!.attack!.fps);
  same(on.front.clips!.attack!.frames[hit], off.front.clips!.attack!.frames[hit], 'its slash\'s blow from in front');
  same(on.back.walk[7], off.back.walk[7], 'its run from behind');
  // (dropping down from in front, its picture 6 of 20 at sixty a second: a forepaw's tip was cut off flat by its picture's foot)
  const drop = shadowMoves()[4];
  const was = eight(false, () => drawShadowAt('front', drop, 6 / 60).px);
  const now = eight(true, () => drawShadowAt('front', drop, 6 / 60).px);
  assert.deepEqual([now.w, now.h], [was.w, was.h + SHADOW_BELOW], 'its picture taller at the foot only');
  let moved = 0;
  for (let i = 0; i < was.d.length; i++) if (was.d[i] !== now.d[i]) moved++;
  assert.equal(moved, 0, 'every pixel it had where it was');
  let cut = 0;
  let room = 0;
  for (let x = 0; x < was.w; x++) if (was.d[((was.h - 1) * was.w + x) * 4 + 3]) cut++;
  for (let i = was.d.length; i < now.d.length; i += 4) if (now.d[i + 3]) room++;
  assert.ok(cut > 0 && room > 0, `what was cut at its foot (${cut} pixels on its last row) now there (${room})`);
});

test('4. the three mirrors their sources mirrored; walking to its left and to its right swapped', () => {
  const on = art(true);
  mirrorOf(on.front.idle[10], on.frontL.idle[10], 'its stand, down and to the left');
  mirrorOf(on.side.walk[5], on.sideL.walk[5], 'its run, to the left');
  const hit = Math.round(on.back.clips!.attack2!.hit! * on.back.clips!.attack2!.fps);
  mirrorOf(on.back.clips!.attack2!.frames[hit], on.backL.clips!.attack2!.frames[hit], 'its right claw\'s blow, up and to the left');
  // (ways as the figure counts them from the way it faces: ahead, to its left, back, to its right)
  mirrorOf(on.front.clips!.attackWalk![3].frames[10], on.frontL.clips!.attackWalk![1].frames[10], 'a slash made walking to its left, mirrored from one to its right');
  mirrorOf(on.side.clips!.attackWalk![0].frames[10], on.sideL.clips!.attackWalk![0].frames[10], 'a slash made walking ahead');
});

test('5. its burning out never mirrored: on the three mirrored sides, truly turned', () => {
  const on = art(true);
  const last = on.frontL.clips!.change!.frames.length - 1;
  same(on.frontL.clips!.change!.frames[last], shadowDemonSet('front', MORE_TURN.frontL).clips!.change!.frames[last], 'him up again, down and to the left');
  same(on.backL.clips!.change!.frames[40], shadowDemonSet('front', MORE_TURN.backL).clips!.change!.frames[40], 'it crumbling, up and to the left');
});

const key: BakeKey = { cls: 'warlock', place: 'demon', vet: false };
/** The pack each named list of a side is in ('' held, '?' not there). */
function named(side: AnimSet, plan: (PackOf | null)[]): Record<string, string> {
  const lists = bakeLists(side);
  const at = (l: readonly unknown[] | undefined): string => {
    if (!l || !l.length) return '?';
    const i = lists.indexOf(l as never);
    return i < 0 ? '?' : plan[i]?.pack ?? '';
  };
  const c = side.clips ?? {};
  return {
    walk: at(side.walk), idle: at(side.idle), start: at(side.start?.frames), stop: at(side.stops?.[7]?.frames), attack: at(c.attack?.frames),
    attack2: at(c.attack2?.frames), walkSlash: at(c.attackWalk?.[2]?.frames), walkSlashR: at(c.attack2Walk?.[3]?.frames),
    heavy: at(c.heavy?.frames), leap: at(c.leap?.frames), land: at(c.land?.frames), reel: at(c.reel?.frames), lurch: at(c.lurch?.frames),
    change: at(c.change?.frames),
  };
}

test('6. the bake: all eight sides packed as its two are; asked for ahead from the man\'s own side', () => {
  eight(true, () => {
    const sides = heroSides(makeWarlockArt({ form: 'demon', place: 'dungeon' }));
    const plan = packsOf(key, sides);
    assert.ok(plan && plan.length === 8, 'its eight sides planned');
    sides.forEach((side, v) => {
      assert.deepEqual(
        named(side, plan![v]),
        {
          walk: '', idle: 'it-stand', start: 'it-drop', stop: 'it-rear7', attack: 'it-slashL', attack2: 'it-slashR', walkSlash: 'it-walkSlash2',
          walkSlashR: 'it-walkSlashR3', heavy: 'it-damning', leap: 'it-step', land: 'it-step', reel: 'it-struck', lurch: 'it-struck', change: 'it-burn',
        },
        `side ${v}`,
      );
    });
    // (asked for ahead: its side the man's, whichever of the eight it faces)
    const asked = (h: Parameters<typeof warlockAskAhead>[1]): string[] => {
      const out: string[] = [];
      warlockAskAhead((p, s, now) => out.push(`${p}:${s}${now ? '!' : ''}`), h, false, false, false, 1000);
      return out;
    };
    for (const [fx, fy] of [[1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71]]) {
      const man = asked({ fx, fy })[0].replace(/^stand:(\d)!$/, '$1');
      assert.deepEqual(asked({ fx, fy, form: 'demon' })[0], `it-stand:${man}!`, `facing ${fx}, ${fy}`);
    }
  });
});
