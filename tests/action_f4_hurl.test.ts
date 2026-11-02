// FLOOR 4, MORE ACTION IN THE GAME (game/defs.ts ACTION_F4; game/action_f4.ts): the Ossuary Golem's skeleton hurl and its club
// swing by Movement 9, the rules the main chat put to the art chat's pictures (his yes to them, 1 Nov 2026). Held here:
//   1. off, its swing and its skull as ever, and its old art; on, its new moves (their blows where its pictures have them), and
//      the art's switch (GOLEM_HURL) with it;
//   2. it takes its aim where the hero stands as it begins to hold the skeleton (HURL.aim), lets go at its hit, and the skeleton
//      lands hurlFly(d) later: a hero who stands there is struck, once; one who runs out of the mark is not;
//   3. if the golem falls before it lets go, the mark goes and nothing comes;
//   4. its swing reaches further than it did, in the half of the floor before it, and not behind it.
//   run: tsx --test tests/action_f4_hurl.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { GOLEM_HURL, HURL, HURL_HIT, SWING, SWING_HIT, hurlFly } from '../src/art/action_f4_fx';
import { useActionF4 } from '../src/art/bestiary';
import { ACTION_F4, MONSTERS, movesOf } from '../src/game/defs';
import { HURL_PERIL } from '../src/game/action_f4';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster, Peril } from '../src/game/state';

function on<T>(fn: () => T): T {
  const was = ACTION_F4.on;
  useActionF4(true);
  try {
    return fn();
  } finally {
    useActionF4(was);
  }
}

/** A golem `d` tiles from the hero along +x, beginning its move `i` (0 its swing, 1 its throw) at him. */
function golem(d: number, i: number): { g: Game; m: Monster } {
  const g = new Game('warrior', 4245);
  g.depth = 4;
  g.enterDungeon();
  g.monsters = [];
  const h = g.hero;
  const m = g.spawn('golem', h.x + d, h.y, -1, 0, false, g.rng);
  g.monsters = [m];
  g.perils = [];
  m.state = 'chase';
  const G = g as unknown as { startMove(m: Monster, def: unknown, moves: unknown, i: number): void };
  G.startMove(m, MONSTERS.golem, movesOf(m), i);
  return { g, m };
}
/** Run it `secs` seconds; `each` is told the clock and the hurl's peril (if any) every frame. How many times the hero was struck. */
function run(g: Game, secs: number, each: (t: number, p: Peril | undefined) => void = () => undefined): number {
  const h = g.hero;
  const c = emptyControls();
  let hits = 0;
  for (let k = 1; k <= Math.round(secs * 30); k++) {
    h.invuln = 0;
    h.life = h.d.maxLife;
    g.update(1 / 30, c);
    if (h.life < h.d.maxLife) hits++;
    each(k / 30, g.perils.find((p) => p.a1 === HURL_PERIL));
  }
  return hits;
}

test('1. off, as ever; on, its new moves, their blows where its pictures have them, and the art with them', () => {
  assert.equal(ACTION_F4.on, false);
  assert.equal(GOLEM_HURL.on, false);
  const was = movesOf({ kind: 'golem', champion: false })!;
  assert.deepEqual(was.map((m) => [m.id, m.windup]), [['swing', 0.6], ['throw', 0.95]]);
  on(() => {
    assert.ok(GOLEM_HURL.on);
    const now = movesOf({ kind: 'golem', champion: false })!;
    assert.deepEqual(now.map((m) => m.id), ['swing', 'throw']);
    assert.ok(Math.abs(now[0].windup - SWING_HIT) < 1e-3 && Math.abs(now[0].windup + now[0].recover - SWING.long) < 1e-3, 'the swing as its picture has it');
    assert.ok(Math.abs(now[1].windup - HURL_HIT) < 1e-3 && Math.abs(now[1].windup + now[1].recover - 2.5) < 1e-3, 'the hurl as its picture has it');
  });
  assert.ok(!GOLEM_HURL.on);
});

test('2. aimed where he stands as it holds it up; lands a flight later; struck if he stays, not if he runs', () => {
  on(() => {
    const d = 6;
    // (he stays)
    const a = golem(d, 1);
    const at = { x: a.g.hero.x, y: a.g.hero.y };
    let aimed = -1;
    let burst = -1;
    const hits = run(a.g, HURL_HIT + hurlFly(d) + 0.5, (t, p) => {
      if (p && aimed < 0) {
        aimed = t;
        assert.ok(Math.hypot(p.x - at.x, p.y - at.y) < 1e-6, 'its mark where he stood');
      }
      if (p && p.done === 2 && burst < 0) burst = t;
    });
    assert.ok(Math.abs(aimed - HURL.aim) < 0.05, `aimed at ${aimed.toFixed(3)} s`);
    assert.ok(Math.abs(burst - (HURL_HIT + hurlFly(d))) < 0.07, `burst at ${burst.toFixed(3)} s (its flight ${hurlFly(d).toFixed(2)} s)`);
    assert.equal(hits, 1, 'struck once');
    // (he runs: out of its reach as soon as he sees the mark)
    const b = golem(d, 1);
    let ran = false;
    const missed = run(b.g, HURL_HIT + hurlFly(d) + 0.5, (_t, p) => {
      if (p && !ran) {
        ran = true;
        b.g.hero.y += HURL.r + 0.6;
      }
    });
    assert.ok(ran);
    assert.equal(missed, 0, 'out of the mark, not struck');
  });
});

test('3. the golem falls before it lets go: the mark goes, nothing comes', () => {
  on(() => {
    const { g, m } = golem(6, 1);
    let seen = false;
    let after = false;
    const hits = run(g, 3, (t, p) => {
      if (p && !seen) {
        seen = true;
        m.dead = true;
      } else if (seen && p) after = true;
      void t;
    });
    assert.ok(seen, 'it took its aim');
    assert.ok(!after, 'its mark gone');
    assert.equal(hits, 0);
  });
});

test('4. its swing reaches further, before it; not behind it', () => {
  const far = 3.1;
  const swing = (behind: boolean): number => {
    const { g, m } = golem(far, 0);
    if (behind) g.hero.x = m.x + far;
    return run(g, 1.0);
  };
  assert.equal(swing(false), 0, 'off: out of its old reach');
  on(() => {
    assert.equal(swing(false), 1, 'on: within its new');
    assert.equal(swing(true), 0, 'on: behind it');
  });
});
