// A QUICK ATTACK FOLLOWS THE ENEMY IT WAS AIMED AT (game.ts TRACK_AIM). His words, 7 Nov 2026, 15:12: “I think something
// happened to the ranger’s aim in auto aim.  Especially his tap.” His draw is held since 25.2.0; pressed at an enemy, the arrow
// now goes to where it is as the string is let go (led for its flight), not to where it was as he pressed.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game, TRACK_AIM } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';

const DT = 1 / 30;
type Inside = { spawn(kind: string, x: number, y: number, n: number, rank: number, boss: boolean, rng: unknown): Monster; wakeUp(m: Monster): void; rng: unknown; waveT: number };

/** The practice room, nothing in it but the hero and one skeleton walking across in front of him, 5 tiles off. */
function room(): { g: Game; m: Monster } {
  const g = Game.forPractice('ranger', 3);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  const m = a.spawn('skeleton', g.hero.x + 5, g.hero.y - 1.5, 1, 0, false, a.rng);
  m.life = m.maxLife = 1e6;
  m.cd = 1e9;
  m.seen = true;
  g.events.length = 0;
  return { g, m };
}

/** Press the quick attack at the enemy, it walking across meanwhile (moved by hand: 2.4 tiles a second down the screen), until the arrow leaves. */
function shoot(g: Game, m: Monster): { at: [number, number]; arrow: [number, number] } {
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  for (let k = 0; k < 40 && g.projectiles.length === 0; k++) {
    g.update(DT, c);
    c.fire = false;
    m.y += 2.4 * DT;
    m.state = 'chase';
  }
  const p = g.projectiles[0];
  assert.ok(p, 'an arrow left');
  return { at: [m.x, m.y], arrow: [p.vx, p.vy] };
}

test('on: the arrow goes to where the enemy is as it leaves, not where it was as he pressed', () => {
  const { g, m } = room();
  const was: [number, number] = [m.x, m.y];
  const { at, arrow } = shoot(g, m);
  const h = g.hero;
  const toNow = Math.atan2(at[1] - h.y, at[0] - h.x);
  const toThen = Math.atan2(was[1] - h.y, was[0] - h.x);
  const went = Math.atan2(arrow[1], arrow[0]);
  assert.ok(Math.abs(toNow - toThen) > 0.08, 'the enemy moved a good way in the draw');
  assert.ok(Math.abs(went - toNow) < Math.abs(went - toThen), 'nearer to where it is now than where it was');
  assert.ok(Math.abs(went - toNow) < 0.12, `toward it now (${(went - toNow).toFixed(3)} rad off)`);
});

test('off: as before, the way he turned as he pressed', () => {
  TRACK_AIM.on = false;
  try {
    const { g, m } = room();
    const was: [number, number] = [m.x, m.y];
    const { arrow } = shoot(g, m);
    const h = g.hero;
    const toThen = Math.atan2(was[1] - h.y, was[0] - h.x);
    assert.ok(Math.abs(Math.atan2(arrow[1], arrow[0]) - toThen) < 0.05, 'where it was');
  } finally {
    TRACK_AIM.on = true;
  }
});

test('pressed at nothing: the way he faces, as before', () => {
  const { g, m } = room();
  m.dead = true;
  const c = emptyControls();
  c.fire = true;
  c.aimX = g.hero.x;
  c.aimY = g.hero.y + 4;
  for (let k = 0; k < 40 && g.projectiles.length === 0; k++) {
    g.update(DT, c);
    c.fire = false;
  }
  const p = g.projectiles[0];
  assert.ok(p && Math.abs(Math.atan2(p.vy, p.vx) - Math.PI / 2) < 0.05, 'down the way it was pressed');
});
