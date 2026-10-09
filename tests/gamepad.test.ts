// A GAME CONTROLLER (engine/gamepad.ts, GAMEPAD: OFF until the owner has seen the layout and said
// yes): how a pad is read. What its sticks and buttons do in the game is played in
// tools/scenarios/gamepad.mjs.
//   run: tsx --test tests/gamepad.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BTN, DEAD, GAMEPAD, POINTER_SPEED, Pad, TRIGGER, deadZone } from '../src/engine/gamepad';
import type { PadLike } from '../src/engine/gamepad';

/** A pad with these sticks and these buttons down (triggers by how far down). */
function padOf(axes: number[], down: number[] = [], triggers: Partial<Record<number, number>> = {}): PadLike {
  const buttons = Array.from({ length: 17 }, (_, i) => ({ pressed: down.includes(i), value: triggers[i] ?? (down.includes(i) ? 1 : 0) }));
  return { connected: true, mapping: 'standard', axes, buttons };
}

test('the switch is off', () => {
  assert.equal(GAMEPAD.on, false);
});

test('a stick has a still middle, then rises to full at its rim, in its own direction', () => {
  assert.deepEqual(deadZone(0.1, 0.1), { x: 0, y: 0, m: 0 });
  const half = deadZone(0, (1 + DEAD) / 2);
  assert.ok(Math.abs(half.m - 0.5) < 1e-9 && half.x === 0 && half.y > 0);
  const rim = deadZone(1, 1);
  assert.equal(rim.m, 1, 'a pad reads past 1 on the diagonal: still full, not more');
  assert.ok(Math.abs(rim.x - Math.SQRT1_2) < 1e-9 && Math.abs(rim.y - Math.SQRT1_2) < 1e-9);
});

test('a button counts once as pressed, the frame it goes down; a trigger counts when it is far enough down', () => {
  const p = new Pad();
  p.poll([null, padOf([0, 0, 0, 0], [BTN.A])], 1 / 60);
  assert.equal(p.connected, true, 'the first pad there is, wherever it sits');
  assert.equal(p.pressed(BTN.A), true);
  assert.equal(p.down(BTN.A), true);
  p.poll([padOf([0, 0, 0, 0], [BTN.A])], 1 / 60);
  assert.equal(p.pressed(BTN.A), false, 'held: not pressed again');
  assert.equal(p.down(BTN.A), true);
  p.poll([padOf([0, 0, 0, 0], [], { [BTN.RT]: TRIGGER / 2 })], 1 / 60);
  assert.equal(p.down(BTN.RT), false, 'a trigger barely touched');
  p.poll([padOf([0, 0, 0, 0], [], { [BTN.RT]: 0.9 })], 1 / 60);
  assert.equal(p.pressed(BTN.RT), true);
});

test('the pad is "live" while it is played with, and not after a while left alone, nor when it is gone', () => {
  const p = new Pad();
  p.poll([padOf([0.6, 0, 0, 0])], 1 / 60);
  assert.equal(p.live(), true);
  for (let k = 0; k < 60 * 9; k++) p.poll([padOf([0, 0, 0, 0])], 1 / 60);
  assert.equal(p.live(), false, 'left alone for nine seconds');
  p.poll([padOf([0, 0, 0, 0], [BTN.B])], 1 / 60);
  assert.equal(p.live(), true, 'a press wakes it');
  p.poll([], 1 / 60);
  assert.equal(p.connected, false);
  assert.equal(p.live(), false);
});

test("the menus' pointer goes with the left stick and stays on the screen", () => {
  const p = new Pad();
  p.px = 100;
  p.py = 100;
  p.poll([padOf([1, 0, 0, 0])], 1 / 60);
  p.steer(0.5, 480, 270);
  assert.ok(Math.abs(p.px - (100 + POINTER_SPEED * 0.5)) < 1e-6);
  p.steer(10, 480, 270);
  assert.equal(p.px, 479, 'not off the edge');
});
