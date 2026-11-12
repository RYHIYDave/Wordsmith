// THE LIVING SHADOW IN THE GAME'S SHAPE (art/shadow_art.ts, behind LIVING_SHADOW, off; the queue's
// finish-mage-and-warlock-eight-sides, step 3, 12 Nov 2026). What can be counted without the game running:
//   the switch off: the game's Warlock and his demon are as they were (the demon's lists and the change as the game has them);
//   the switch on: its lists in the game's shape, at the times its moves have (every list at thirty a second, its run and
//   its setting off at sixty), its blows where its moves land them, its eight rear-ups, its left claw's slash made walking
//   each of the four ways, the change the game's own length; and a frame of each kind painted, not empty.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { makeWarlockArt } from '../src/art/warlock_art';
import { LIVING_SHADOW, SHADOW_FPS } from '../src/art/shadow_art';
import { CHANGE_ALL } from '../src/dev/warlock_change';
import { DROP_INTO, DROP_PICTURES, REARS, SHADOW_RUN_ROUND, SHADOW_STAND_LONG, SLASH_HIT, SLASH_WAYS } from '../src/dev/shadow_moves';
import { SHADOW_CHANGE_ALL } from '../src/dev/shadow_change';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;
paintWithoutCanvas();

const near = (a: number, b: number, e = 1e-6): boolean => Math.abs(a - b) < e;
const painted = (s: Sprite): boolean => !!s && s.w > 10 && s.h > 10;

test('the switch off: the game\'s demon and the change as the game has them', () => {
  assert.equal(LIVING_SHADOW.on, false, 'off');
  const demon = makeWarlockArt({ form: 'demon', place: 'dungeon' });
  for (const set of [demon.front, demon.back]) {
    assert.equal(set.idleFps, 10, 'the game\'s demon\'s stand at ten a second');
    assert.ok(!set.start && !set.stops, 'no setting off or stopping of its own');
    assert.ok(!set.clips?.attackWalk, 'no slashes made walking');
  }
  const man = makeWarlockArt({ form: 'man', place: 'dungeon' });
  assert.equal(man.front.clips?.change?.frames.length, 48, 'the game\'s change, 48 pictures');
});

test('the switch on: its lists in the game\'s shape, at its moves\' own times; a frame of each kind painted', () => {
  LIVING_SHADOW.on = true;
  try {
    const it = makeWarlockArt({ form: 'demon', place: 'dungeon' });
    for (const set of [it.front, it.back]) {
      const c = set.clips!;
      const F = SHADOW_FPS.lists;
      assert.equal(set.idleFps, F);
      assert.equal(set.idle.length, Math.round(SHADOW_STAND_LONG * F), 'its stand, 96 pictures');
      assert.equal(set.walkFps, SHADOW_FPS.run);
      assert.equal(set.walk.length, Math.round(SHADOW_RUN_ROUND * SHADOW_FPS.run), 'its run');
      assert.ok((set.walkStride ?? 0) > 0, 'its feet grip the floor');
      assert.equal(set.start?.frames.length, DROP_PICTURES + 1, 'setting off: dropping onto all fours');
      assert.equal(set.start?.fps, SHADOW_FPS.run);
      assert.equal(set.startAt, DROP_INTO);
      assert.equal(set.stops?.length, REARS, 'a rear-up for each eighth of its run');
      assert.ok(c.attack && c.attack2 && near(c.attack.hit ?? -1, SLASH_HIT) && near(c.attack2.hit ?? -1, SLASH_HIT), 'its two slashes, the blow where the rake\'s lands');
      assert.equal(c.attackWalk?.length, SLASH_WAYS.length, 'its slash made walking, each of the four ways');
      assert.ok(c.attackWalk!.every((w) => near(w.hit ?? -1, SLASH_HIT)), 'each with the blow where it lands standing');
      assert.ok(c.heavy && (c.heavy.hit ?? 0) > 0, 'Damning, with its blow');
      assert.ok(c.leap && c.land && c.reel && c.lurch && c.change, 'the smoke step, struck, burning out');
      for (const k of ['attack', 'attack2', 'heavy', 'land', 'reel', 'lurch'] as const) assert.equal(c[k]!.fps, F, `${k} at thirty a second`);
      // (burning out laid out over its whole time, as the game's is: thirty a second to within a frame over it)
      assert.ok(near(c.change!.fps, F, 0.5), `burning out at thirty a second (${c.change!.fps.toFixed(2)})`);
      assert.equal(set.attack.length, 3);
    }
    // (a frame of each kind painted: its stand, its run, a slash at its blow, setting off, a rear-up)
    const f = it.front;
    for (const [what, s] of [['stand', f.idle[0]], ['run', f.walk[10]], ['slash', f.clips!.attack!.frames[Math.round(SLASH_HIT * 30)]], ['setting off', f.start!.frames[9]], ['rear-up', f.stops![3].frames[7]]] as const) {
      assert.ok(painted(s), `${what}: painted (${s?.w} x ${s?.h})`);
    }
    // (the man's change: the game's own length, thirty a second; his first picture and its roar's painted)
    const man = makeWarlockArt({ form: 'man', place: 'dungeon' });
    const ch = man.front.clips!.change!;
    assert.ok(near(SHADOW_CHANGE_ALL, CHANGE_ALL, 1e-9), 'the game\'s own length');
    assert.equal(ch.frames.length, Math.round(SHADOW_CHANGE_ALL * SHADOW_FPS.lists) + 1);
    assert.ok(painted(ch.frames[0]) && painted(ch.frames[ch.frames.length - 20]), 'him as it begins, it roaring at the end');
    // (in town and on his card he is never the demon and never changes: no change of its own there)
    assert.ok(!makeWarlockArt({ form: 'man', place: 'town' }).front.clips?.change, 'no change in town');
  } finally {
    LIVING_SHADOW.on = false;
  }
});
