// FLOOR 1, MORE ACTION IN THE GAME (game/defs.ts ACTION_F1; game/action_f1.ts; render/act1_fx/archer.ts and warden.ts): the
// rules the main chat put to the art chat's pictures (his yes to them, 31 Oct 2026). Held here:
//   1. off, the archer has its one shot and the Warden his slam, as ever; on, the archer has its rain and the Warden his Lockdown
//      in place of the slam, and the art's switches go on and off with it;
//   2. the rain: a hero whose middle is inside the ring at the strike is hit, one outside it is not, and not before the strike;
//   3. the Lockdown: at the crash a hero on a row is struck and one in a cell is not; the bars then stand as a cage he does not
//      walk through; if the Warden is no longer winding up before the crash, nothing comes down;
//   4. their pictures: each kind's floor pictures draw its peril, and nothing for the monster itself.
//   run: tsx --test tests/action_f1_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { LOCKDOWN, RAIN } from '../src/art/action_f1_fx';
import { ARCHER_RAIN } from '../src/art/monster_bones';
import { WARDEN_LOCKDOWN } from '../src/art/monster_warden';
import { useActionF1 } from '../src/art/bestiary';
import { ACTION_F1, MONSTER_MOVES, movesOf } from '../src/game/defs';
import { BARS_PERIL, RAIN_PERIL, barRows, cageHero } from '../src/game/action_f1';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Peril } from '../src/game/state';
import { FX as archerFx } from '../src/render/act1_fx/archer';
import { FX as wardenFx } from '../src/render/act1_fx/warden';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

function on<T>(fn: () => T): T {
  const was = ACTION_F1.on;
  useActionF1(true);
  try {
    return fn();
  } finally {
    useActionF1(was);
  }
}
/** (the switches off for the test, and as they were after: on since his “Switch them all on (Recommended)”, 2 Nov 2026) */
function off<T>(fn: () => T): T {
  const was = ACTION_F1.on;
  useActionF1(false);
  try {
    return fn();
  } finally {
    useActionF1(was);
  }
}

/** Floor 1 with no monster on it, the hero in its first big room's middle, nothing making him safe. */
function floor1(): Game {
  const g = new Game('warrior', 4242);
  g.depth = 1;
  g.enterDungeon();
  g.monsters = [];
  const r = g.level.floor.rooms.filter((q) => q.w >= 9 && q.h >= 9)[0];
  g.hero.x = r.x + r.w / 2;
  g.hero.y = r.y + r.h / 2;
  g.hero.invuln = 0;
  return g;
}

function peril(g: Game, a1: string, x: number, y: number, t: number, hit: number, dur: number): Peril {
  const p: Peril = { kind: 'act1', a1, x, y, fx: 1, fy: 0, t, hit, dur, dmg: 30, el: 'physical', words: [], half: false, from: 'a test', done: 0, a: -1, b: x - 4, c: y, d: 0, hand: 1 } as unknown as Peril;
  g.perils.push(p);
  return p;
}

function run(g: Game, secs: number): void {
  const c = emptyControls();
  for (let k = 0; k < Math.round(secs * 30); k++) {
    g.hero.invuln = 0;
    g.update(1 / 30, c);
  }
}

test('1. on (his yes): the rain and the Lockdown, and the art with them; off: the archer one shot, the Warden his slam', () => {
  assert.equal(ACTION_F1.on, true, 'his “Switch them all on (Recommended)”, 2 Nov 2026');
  assert.ok(ARCHER_RAIN.on && WARDEN_LOCKDOWN.on, "the art's switches on with it");
  assert.ok(movesOf({ kind: 'archer', champion: false })!.some((m) => m.id === 'rain'));
  const w = movesOf({ kind: 'warden', champion: false })!;
  assert.ok(w.some((m) => m.id === 'lockdown') && !w.some((m) => m.id === 'slam'), 'the Lockdown in place of the slam');
  off(() => {
    assert.equal(movesOf({ kind: 'archer', champion: false }), null);
    assert.equal(movesOf({ kind: 'warden', champion: false }), MONSTER_MOVES.warden);
    assert.ok(!ARCHER_RAIN.on && !WARDEN_LOCKDOWN.on, 'and the art off with it');
  });
  assert.ok(ARCHER_RAIN.on && WARDEN_LOCKDOWN.on, 'and on again');
});

test('2. the rain: a hero inside the ring at the strike is hit, outside it not, and not before', () => {
  on(() => {
    for (const [dx, hurt] of [[0.3, true], [RAIN.radius + 0.6, false]] as const) {
      const g = floor1();
      const h = g.hero;
      peril(g, RAIN_PERIL, h.x + dx, h.y, 0, RAIN.delay, RAIN.delay + 1);
      const life0 = h.life;
      run(g, RAIN.delay - 0.2);
      assert.equal(h.life, life0, 'not before the strike');
      run(g, 0.4);
      assert.equal(h.life < life0, hurt, `${dx} tiles from its middle: ${hurt ? 'hit' : 'not hit'}`);
    }
  });
});

test('3. the Lockdown: on a row struck, in a cell not; then caged; and nothing if the Warden is not winding up', () => {
  on(() => {
    for (const [dy, hurt] of [[LOCKDOWN.cell / 2, true], [0, false]] as const) {
      const g = floor1();
      const h = g.hero;
      const p = peril(g, BARS_PERIL, h.x, h.y - dy, -0.05, 0, 1.9);
      const R = barRows(g, p)!;
      assert.ok(R.x.length >= 2 && R.y.length >= 2, 'rows both ways across his room');
      const life0 = h.life;
      run(g, 0.2);
      assert.equal(h.life < life0, hurt, `${dy} tiles off his cell's middle: ${hurt ? 'struck' : 'safe'}`);
      if (!hurt) {
        // (walking into the row before him while the bars stand: kept in his cell)
        const line = R.x.filter((y) => y > h.y).sort((a, b) => a - b)[0];
        const b = { x: h.x, y: line + 0.2 };
        cageHero(g, b, 0.3, h.x, h.y);
        assert.ok(b.y <= line - 0.3 + 1e-9, 'the cage holds him on his own side');
      }
    }
    // (no Warden winding up: before the crash it ends, and nothing comes down)
    const g = floor1();
    const h = g.hero;
    const p = peril(g, BARS_PERIL, h.x, h.y - LOCKDOWN.cell / 2, -1, 0, 1.9);
    const life0 = h.life;
    run(g, 1.3);
    assert.equal(h.life, life0, 'nothing came down');
    assert.ok(!g.perils.includes(p) || p.dur <= p.t, 'the peril over');
  });
});

test('4. the pictures: each draws its peril, and nothing of the monster itself', () => {
  on(() => {
    const g = floor1();
    const h = g.hero;
    const rain = peril(g, RAIN_PERIL, h.x, h.y, 0.6, RAIN.delay, 3);
    const bars = peril(g, BARS_PERIL, h.x, h.y, 0.3, 0, 1.9);
    let stood = 0;
    let drawn = 0;
    const ctx = { g: { drawImage: () => void drawn++ } as unknown as CanvasRenderingContext2D, at: (x: number, y: number) => [(x - y) * 16, (x + y) * 8] as [number, number], game: g, t: 0, bestiary: null as never, stand: () => void stood++, spot: () => undefined };
    archerFx!.ground!(ctx, null, rain);
    archerFx!.standing!(ctx, null, rain);
    assert.ok(drawn >= 1 && stood >= 2, `the rain: ${drawn} on the floor, ${stood} standing`);
    stood = 0;
    wardenFx!.standing!(ctx, null, bars);
    assert.ok(stood >= 10, `the bars: ${stood} tiles standing`);
    const before = stood + drawn;
    archerFx!.ground!(ctx, { kind: 'archer' } as never, null);
    wardenFx!.standing!(ctx, { kind: 'warden' } as never, null);
    assert.equal(stood + drawn, before, 'nothing for the monsters themselves');
  });
});
