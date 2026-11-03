// (helpers as tests/veteran_rules.test.ts) THE VETERAN'S RULES (game/veteran.ts, game.ts “THE VETERAN”, behind VETERAN): three globes, a tap a punch, a hold a kick, a
// swipe the jump; three in and the combo is locked; a tap or a hold on a swipe's jump not yet off the floor sets its globe in
// fire; every swipe spends the jump (his “Swipes spend the jump (Recommended)”); the art chat's six combos (its post of 3 Nov,
// 08:52, and docs/mockups/brawler_looks/README.md); every punch and kick reaching about two and a half tiles, the push kick's
// cone and the spinning jump kick's crescent three and a half (his “About 2½ tiles (Recommended)”).
//   run: tsx --test tests/veteran_rules.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { BRAWLER } from '../src/game/brawler';
import { VETERAN, VET_MOVES, vetMoveFor } from '../src/game/veteran';
import type { VetBlowId, VetInput } from '../src/game/veteran';

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
function room(seed = 3): Game {
  const g = Game.forPractice('brawler', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}
function dummy(g: Game, dx: number, dy: number, life = 1e7): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}
const hurt = (m: Monster): number => m.maxLife - m.life;
/** Presses in a row, a frame apart (t a tap, h a hold, s a swipe), aimed at (ax, ay); then `secs` of the game, the moves he plays logged. */
function presses(g: Game, keys: string, ax: number, ay: number, secs: number, sx = g.hero.x - 3, sy = g.hero.y): VetBlowId[] {
  const played: VetBlowId[] = [];
  const step = (c: Controls): void => {
    g.update(DT, c);
    const mv = g.hero.vet?.move;
    if (mv && played[played.length - 1] !== mv.id + '#' + mv.globe) played.push((mv.id + '#' + mv.globe) as VetBlowId);
  };
  for (const k of keys) {
    const c = emptyControls();
    c.aimX = c.castX = ax;
    c.aimY = c.castY = ay;
    if (k === 't') c.fire = true;
    if (k === 'h') c.cast = true;
    if (k === 's') {
      c.evade = true;
      c.evadeX = sx;
      c.evadeY = sy;
    }
    step(c);
    // (the press let go)
    const up = emptyControls();
    up.aimX = up.castX = ax;
    up.aimY = up.castY = ay;
    step(up);
  }
  for (let t = 0; t < secs; t += DT) {
    const c = emptyControls();
    c.aimX = c.castX = ax;
    c.aimY = c.castY = ay;
    step(c);
  }
  return played.map((p) => p.split('#')[0] as VetBlowId);
}


// THE VETERAN'S WORDS (behind VETERAN): every word in front of his punch and of his kick acts as his blow lands (game.ts vetHit:
// the game's own hit, its words with it), and every word behind leaves what it leaves where his blow lands (`wake`).
//   run: tsx --test tests/veteran_words.test.ts
import { WORD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';

const STATUS: Partial<Record<WordId, (m: Monster) => boolean>> = {
  fire: (m) => m.burnT > 0,
  frost: (m) => m.chillT > 0 || m.frozenT > 0,
  lightning: (m) => m.shockT > 0,
  poison: (m) => m.poisonT > 0,
  hexing: (m) => (m.hexT ?? 0) > 0,
  stilling: (m) => (m.stillT ?? 0) > 0,
};

for (const [i, keys, name] of [[0, 't', 'punch'], [1, 'h', 'kick']] as const) {
  test(`every word in front of his ${name}: his blow lands, and the word acts`, () =>
    withVet(() => {
      for (const w of WORD_IDS) {
        const g = room();
        const m = dummy(g, 2.2, 0);
        g.hero.skills[i].front[0] = w;
        g.refresh();
        assert.doesNotThrow(() => presses(g, keys, m.x, m.y, 1.4), w);
        assert.ok(hurt(m) > 0, `${w}: landed`);
        const st = STATUS[w];
        if (st) assert.ok(st(m), `${w}: on the one it hit`);
      }
    }));
}

test('every word behind his punch: nothing goes wrong, his blow lands', () =>
  withVet(() => {
    for (const w of WORD_IDS) {
      const g = room();
      const m = dummy(g, 2.2, 0);
      const s = g.hero.skills[0] as unknown as { behind?: (WordId | null)[] };
      if (!s.behind) return;
      s.behind[0] = w;
      g.refresh();
      assert.doesNotThrow(() => presses(g, 't', m.x, m.y, 1.4), w);
      assert.ok(hurt(m) > 0, `${w} behind: landed`);
    }
  }));
