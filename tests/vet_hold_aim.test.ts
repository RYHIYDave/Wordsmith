// THE BRAWLER'S HELD KICK UNDER AUTO AIM (25.3.10; game.ts vetAimOf): a hold aims where the hold is given (the cast point), as every
// hero's slow attack does. Under auto aim main.ts gives a hold's place as the enemy auto aim picked (c.castX, c.castY) and leaves his
// aim a tile ahead of him: the kick went the way he faced, at nothing (found by the chat that brought his eight sides in, 11 Nov
// 2026: on the live game, a skeleton behind him, the round kick thrown down-right, 0). A tap goes where it went.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { BRAWLER } from '../src/game/brawler';
import { VETERAN } from '../src/game/veteran';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function withVet<T>(run: () => T): T {
  const was = [VETERAN.on, BRAWLER.on];
  VETERAN.on = true;
  BRAWLER.on = true;
  try {
    return run();
  } finally {
    [VETERAN.on, BRAWLER.on] = was;
  }
}
function room(): Game {
  const g = Game.forPractice('brawler', 3);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 1;
  g.events.length = 0;
  return g;
}
function dummy(g: Game, dx: number, dy: number): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}
/** One press (t a tap, h a hold) with the aim a tile ahead of him and the cast point on `at`, as auto aim gives them; then `secs`. */
function press(g: Game, k: 't' | 'h', at: Monster, secs: number): void {
  const h = g.hero;
  const give = (down: boolean): Controls => {
    const c = emptyControls();
    c.aimX = h.x + h.fx;
    c.aimY = h.y + h.fy;
    c.castX = at.x;
    c.castY = at.y;
    if (down && k === 't') c.fire = true;
    if (down && k === 'h') c.cast = true;
    return c;
  };
  g.update(DT, give(true));
  for (let t = 0; t < secs; t += DT) g.update(DT, give(false));
}

test('under auto aim a held kick goes at the enemy picked for it, ahead of him, behind him and to his side', () => {
  withVet(() => {
    for (const [dx, dy, where] of [[1.1, 1.1, 'ahead'], [-1.1, -1.1, 'behind'], [-1.4, 0.6, 'to his left']] as const) {
      const g = room();
      const m = dummy(g, dx, dy);
      press(g, 'h', m, 1.6);
      assert.ok(m.maxLife - m.life > 0, `the kick lands on the skeleton ${where}`);
    }
  });
});

test('a tap goes where it went: at what his aim is on (a tile ahead of him under auto aim), not the hold\'s place', () => {
  withVet(() => {
    const g = room();
    const behind = dummy(g, -1.1, -1.1);
    press(g, 't', behind, 0.8);
    assert.equal(behind.maxLife - behind.life, 0, 'the jab thrown ahead, not at the one behind');
  });
});
