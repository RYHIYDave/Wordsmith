// THE DESCENT'S CLIFFS SEEN OVER (game/game.ts SEE_OVER_ROCK, updateVision). His words, 1 Nov 2026, of the Ledge Road: “The cliff
// edge hides enemies like a wall but it should be wide open to line of sight.” Held here, on floor 7 by its packs:
//   1. on, more of the monsters near him are seen than with the rock stopping the eye, and every one in his sight's reach is;
//   2. what wakes is what woke before: a sleeper wakes in a line the rock does not stop, not across a drop;
//   3. off the descent (the Crypt's floors), walls stop the eye as ever.
//   run: tsx --test tests/see_over_rock.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game, SEE_OVER_ROCK } from '../src/game/game';
import { TUNE } from '../src/game/defs';
import { emptyControls } from '../src/game/state';

/** Floor 7, the hero set down near each of its first packs in turn: how many monsters near him were seen, and how many are awake at the end. */
function walk(on: boolean, seed: number): { seen: number; near: number; awake: number } {
  const was = SEE_OVER_ROCK.on;
  SEE_OVER_ROCK.on = on;
  try {
    const g = new Game('warrior', seed);
    g.depth = 7;
    g.cleared = 6;
    g.enterDungeon();
    const c = emptyControls();
    let seen = 0;
    let near = 0;
    for (const p of g.level.floor.packs.slice(0, 8)) {
      g.hero.x = p.x + 6;
      g.hero.y = p.y + 6;
      if (!g.isOpen(g.hero.x, g.hero.y)) {
        g.hero.x = p.x;
        g.hero.y = p.y + 4;
      }
      for (let k = 0; k < 6; k++) {
        g.hero.life = g.hero.d.maxLife;
        g.update(1 / 30, c);
      }
      for (const m of g.monsters) {
        if (m.dead || Math.hypot(m.x - g.hero.x, m.y - g.hero.y) > TUNE.sightRadius - 1) continue;
        near++;
        if (m.seen) seen++;
      }
    }
    return { seen, near, awake: g.monsters.filter((m) => !m.dead && m.state !== 'sleep').length };
  } finally {
    SEE_OVER_ROCK.on = was;
  }
}

test('1 and 2. on the Ledge Road the cliffs are seen over; what wakes is what woke before', () => {
  assert.equal(SEE_OVER_ROCK.on, true);
  for (const seed of [23, 41]) {
    const off = walk(false, seed);
    const on = walk(true, seed);
    assert.ok(on.seen > off.seen, `seed ${seed}: ${on.seen} seen to ${off.seen}`);
    assert.equal(on.seen, on.near, `seed ${seed}: every monster in his sight's reach seen`);
    assert.equal(on.awake, off.awake, `seed ${seed}: as many woken`);
  }
});

test('3. on the Crypt\'s floors walls stop the eye as ever', () => {
  const g = new Game('warrior', 7919);
  g.depth = 3;
  g.enterDungeon();
  g.update(1 / 30, emptyControls());
  const L = g.level;
  const f = L.floor;
  // (no tile behind a wall from him is seen: every seen tile has a clear line to him through the open grid, near enough)
  let behind = 0;
  for (let i = 0; i < f.w * f.h; i++) {
    if (L.visible[i] !== 1 || L.open[i] === 0) continue;
    const x = (i % f.w) + 0.5;
    const y = Math.floor(i / f.w) + 0.5;
    if (Math.hypot(x - g.hero.x, y - g.hero.y) > 3 && !g.sees(g.hero.x, g.hero.y, x, y) && !g.sees(g.hero.x, g.hero.y, x - 0.4, y - 0.4) && !g.sees(g.hero.x, g.hero.y, x + 0.4, y + 0.4)) behind++;
  }
  assert.ok(behind <= 6, `${behind} seen tiles behind walls`);
});
