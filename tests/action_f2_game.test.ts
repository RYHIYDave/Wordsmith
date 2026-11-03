// FLOOR 2, MORE ACTION IN THE GAME (game/defs.ts ACTION_F2; game/action_f2.ts; render/act1_fx/cultist.ts and shade.ts): the
// rules the main chat put to the art chat's pictures (his yes to them). Held here:
//   1. off, the cultist shoots its bolt and the Shade is as it was; on, the cultist's sigil in place of its bolt, and the art's
//      switches (CULTIST_SIGIL, SHADE_FROST) on and off with it;
//   2. the sigil: a hero inside the ring at the eruption is struck, one outside it not, and not before; the floor burns on;
//      if its cultist is no longer casting before the eruption, nothing erupts;
//   3. the rime: a hero in it is slowed while it lies, one beside it not;
//   4. their pictures: each draws its peril, and nothing for the monster itself.
//   run: tsx --test tests/action_f2_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RIME, SHADE_FROST, SIGIL } from '../src/art/action_f2_fx';
import { CULTIST_SIGIL } from '../src/art/monster_cultist';
import { useActionF2 } from '../src/art/bestiary';
import { ACTION_F2, movesOf } from '../src/game/defs';
import { RIME_PERIL, SIGIL_PERIL } from '../src/game/action_f2';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Peril } from '../src/game/state';
import { FX as cultistFx } from '../src/render/act1_fx/cultist';
import { FX as shadeFx } from '../src/render/act1_fx/shade';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

function on<T>(fn: () => T): T {
  const was = ACTION_F2.on;
  useActionF2(true);
  try {
    return fn();
  } finally {
    useActionF2(was);
  }
}
/** (the switches off for the test, and as they were after: on since his “Switch them all on (Recommended)”, 2 Nov 2026) */
function off<T>(fn: () => T): T {
  const was = ACTION_F2.on;
  useActionF2(false);
  try {
    return fn();
  } finally {
    useActionF2(was);
  }
}

function floor2(): Game {
  const g = new Game('warrior', 4243);
  g.depth = 2;
  g.enterDungeon();
  g.monsters = [];
  const r = g.level.floor.rooms.filter((q) => q.w >= 8 && q.h >= 8)[0];
  g.hero.x = r.x + r.w / 2;
  g.hero.y = r.y + r.h / 2;
  g.hero.invuln = 0;
  return g;
}

function peril(g: Game, a1: string, x: number, y: number, t: number, dur: number, a = -1): Peril {
  const p = { kind: 'act1', a1, x, y, fx: 1, fy: 0, t, hit: 0, dur, dmg: 30, el: 'fire', words: [], half: false, from: 'a test', done: 0, a, b: x - 3, c: y, d: 0, hand: 1 } as unknown as Peril;
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

test('1. on (his yes): its sigil, and the art with it; off: the cultist its bolt', () => {
  assert.equal(ACTION_F2.on, true, 'his “Switch them all on (Recommended)”, 2 Nov 2026');
  assert.ok(CULTIST_SIGIL.on && SHADE_FROST.on, "the art's switches on with it");
  assert.deepEqual(movesOf({ kind: 'cultist', champion: false })!.map((m) => m.id), ['sigil']);
  off(() => {
    assert.equal(movesOf({ kind: 'cultist', champion: false }), null);
    assert.ok(!CULTIST_SIGIL.on && !SHADE_FROST.on, 'and the art off with it');
  });
  assert.ok(CULTIST_SIGIL.on && SHADE_FROST.on, 'and on again');
});

test('2. the sigil: inside struck, outside not, not before; the floor burns on; nothing if its cultist stops', () => {
  on(() => {
    for (const [dx, hurt] of [[0.4, true], [SIGIL.radius + 0.6, false]] as const) {
      const g = floor2();
      const h = g.hero;
      peril(g, SIGIL_PERIL, h.x + dx, h.y, -0.04, 4);
      const life0 = h.life;
      run(g, 0.1);
      assert.equal(h.life < life0, hurt, `${dx} tiles from its middle: ${hurt ? 'struck' : 'not struck'}`);
    }
    // (standing in the fire after: burned again)
    const g = floor2();
    const h = g.hero;
    peril(g, SIGIL_PERIL, h.x, h.y, -0.04, 4);
    run(g, 0.1);
    const life1 = h.life;
    run(g, 1.2);
    assert.ok(h.life < life1, 'burned standing in it');
    // (no cultist casting: nothing erupts)
    const g2 = floor2();
    const life2 = g2.hero.life;
    peril(g2, SIGIL_PERIL, g2.hero.x, g2.hero.y, -1, 4);
    run(g2, 1.5);
    assert.equal(g2.hero.life, life2, 'nothing erupted');
  });
});

test('3. the rime: in it slowed, beside it not', () => {
  on(() => {
    for (const [dx, slowed] of [[0.2, true], [RIME.radius + 1, false]] as const) {
      const g = floor2();
      const h = g.hero;
      h.slowT = 0;
      peril(g, RIME_PERIL, h.x + dx, h.y, 0.5, RIME.lie);
      run(g, 0.1);
      assert.equal((h.slowT ?? 0) > 0 && (h.slowBy ?? 0) >= RIME.slow - 1e-9, slowed, `${dx} tiles from its middle`);
    }
  });
});

test('4. the pictures: each draws its peril, and nothing of the monster itself', () => {
  on(() => {
    const g = floor2();
    const h = g.hero;
    const sig = peril(g, SIGIL_PERIL, h.x, h.y, 0.1, 4);
    const rime = peril(g, RIME_PERIL, h.x, h.y, 0.5, RIME.lie);
    let stood = 0;
    let drawn = 0;
    const ctx = { g: { drawImage: () => void drawn++ } as unknown as CanvasRenderingContext2D, at: (x: number, y: number) => [(x - y) * 16, (x + y) * 8] as [number, number], game: g, t: 0, bestiary: null as never, stand: () => void stood++, spot: () => undefined };
    cultistFx!.ground!(ctx, null, sig);
    cultistFx!.standing!(ctx, null, sig);
    shadeFx!.ground!(ctx, null, rime);
    assert.ok(drawn >= 2 && stood >= 2, `${drawn} on the floor, ${stood} standing`);
    const before = drawn + stood;
    cultistFx!.ground!(ctx, { kind: 'cultist' } as never, null);
    shadeFx!.ground!(ctx, { kind: 'shade' } as never, null);
    assert.equal(drawn + stood, before, 'nothing for the monsters themselves');
  });
});
