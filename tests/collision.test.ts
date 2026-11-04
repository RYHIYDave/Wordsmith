// ROUNDING A CORNER, AND CAUGHT INSIDE SOMETHING (game.ts roundCorner, popOut). His words, 3 Nov 2026, 22:07: “The collision in
// this game sucks.  I’m constantly stuck on stuff.”; stuck most on “Furniture and props,Wall corners, doorways”.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';

const DT = 1 / 60;
function room(): Game {
  const g = Game.forPractice('warrior', 3);
  (g as unknown as { waveT: number }).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  return g;
}
/** An open square of floor about (x, y), `n` tiles each way. */
function openAbout(g: Game, x: number, y: number, n: number): boolean {
  const L = g.level;
  for (let ty = Math.floor(y) - n; ty <= Math.floor(y) + n; ty++) for (let tx = Math.floor(x) - n; tx <= Math.floor(x) + n; tx++) if (L.walk[ty * L.floor.w + tx] !== 1) return false;
  return true;
}

test('walking straight at a crate a little off its middle, he slips round it instead of stopping dead', () => {
  for (const off of [0.25, 0.4, -0.3]) {
    const g = room();
    const L = g.level;
    const f = L.floor;
    assert.ok(openAbout(g, 14.5, 15.5, 3), 'open floor');
    // (a crate two tiles ahead of him)
    L.walk[15 * f.w + 16] = 0;
    g.hero.x = 14.5;
    g.hero.y = 15.5 + off;
    const c = emptyControls();
    c.mx = 1;
    for (let k = 0; k < 90; k++) g.update(DT, c);
    assert.ok(g.hero.x > 17.3, `off ${off}: past it (${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
  }
});

test('walking straight at a wall, square on: no slipping, he stops', () => {
  const g = room();
  const L = g.level;
  const f = L.floor;
  for (let y = 12; y <= 19; y++) L.walk[y * f.w + 16] = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  const c = emptyControls();
  c.mx = 1;
  for (let k = 0; k < 60; k++) g.update(DT, c);
  assert.ok(g.hero.x < 16 - TUNE.heroRadius + 0.01 && Math.abs(g.hero.y - 15.5) < 0.01, `stopped square (${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
});

test('the ground under him turned to wall: he is set free at once and walks on', () => {
  const g = room();
  const L = g.level;
  const f = L.floor;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  L.walk[15 * f.w + 14] = 0;
  const c = emptyControls();
  c.my = 1;
  for (let k = 0; k < 30; k++) g.update(DT, c);
  assert.ok(g.hero.y > 16.2, `walked on (${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
});
