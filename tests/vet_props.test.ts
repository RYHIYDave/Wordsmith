// THE VETERAN'S BLOWS REACH WHAT STANDS ON THE FLOOR (game.ts vetStrike, 25.1.1). His word, 7 Nov 2026, 00:05 (Eastern): “fix the
// hush encounters with the bells in 11-16”. The Brawler's blows struck monsters only: he could not strike the Muffled Bell, ring a
// bell, nor break a barrel. Now each move's blow reaches them too, once, as it is thrown.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { VETERAN } from '../src/game/veteran';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { seasoned } from './helpers';

/** The hero beside (x, y), on the floor's own walkable tile, facing it; taps for two seconds. */
function punchAt(g: Game, x: number, y: number): void {
  const L = g.level;
  const W = L.floor.w;
  const h = g.hero;
  let put = false;
  for (const [dx, dy] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
    const tx = Math.floor(x) + dx;
    const ty = Math.floor(y) + dy;
    if (L.walk[ty * W + tx] === 1) {
      h.x = tx + 0.5;
      h.y = ty + 0.5;
      put = true;
      break;
    }
  }
  assert.ok(put, 'a tile beside it to stand on');
  for (let k = 0; k < 60; k++) {
    const c = emptyControls();
    c.aimX = x;
    c.aimY = y;
    c.fire = k % 6 < 2;
    g.update(1 / 30, c);
  }
}

test('the Brawler (the Veteran) strikes the Muffled Bell and rings a bell, on every floor of the Hush', () => {
  assert.equal(VETERAN.on, true, 'the Brawler is the Veteran in the game');
  for (const depth of [11, 12, 13, 14, 15]) {
    const g = seasoned(new Game('brawler', 3), 30);
    (g as unknown as { god: boolean }).god = true;
    g.depth = depth;
    g.cleared = depth - 1;
    g.enterDungeon();
    assert.ok(g.level.bells, `floor ${depth} has its Bells`);
    const B = g.level.bells!;
    g.monsters = g.monsters.filter((m) => m.boss);
    punchAt(g, B.plan.muffled.x, B.plan.muffled.y);
    assert.equal(B.phase, 'on', `floor ${depth}: his punches strike the Muffled Bell`);
    const b = B.plan.bells[0];
    punchAt(g, b.x, b.y);
    assert.equal(B.rung[0], true, `floor ${depth}: his punches ring a bell`);
  }
});

test("the Brawler's kick breaks a barrel", () => {
  const g = seasoned(new Game('brawler', 5), 10);
  g.depth = 2;
  g.cleared = 1;
  g.enterDungeon();
  g.monsters.length = 0;
  const L = g.level;
  const h = g.hero;
  const W = L.floor.w;
  const SIDES = [[-1, 0], [0, 1], [1, 0], [0, -1]] as const;
  const found = L.props.find((q) => (q.kind === 'barrel' || q.kind === 'urn') && q.state === 0 && SIDES.some(([dx, dy]) => L.walk[(q.ty + dy) * W + q.tx + dx] === 1));
  assert.ok(found, 'a barrel or an urn on the floor, with a tile beside it to stand on');
  const p = found!;
  const [dx, dy] = SIDES.find(([sx, sy]) => L.walk[(p.ty + sy) * W + p.tx + sx] === 1)!;
  h.x = p.tx + dx + 0.5;
  h.y = p.ty + dy + 0.5;
  for (let k = 0; k < 75; k++) {
    const c = emptyControls();
    c.aimX = p.x;
    c.aimY = p.y;
    c.hold = k < 6;
    c.fire = false;
    c.cast = k < 6;
    c.castX = p.x;
    c.castY = p.y;
    g.update(1 / 30, c);
  }
  assert.equal(p.state, 1, 'his kick breaks it');
});
