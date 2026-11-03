// THE VETERAN'S RULES (game/veteran.ts, game.ts “THE VETERAN”, behind VETERAN): three globes, a tap a punch, a hold a kick, a
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

test('which move a press makes: the art chat\'s six combos, and the rest by the same rule', () => {
  const play = (inputs: VetInput[]): VetBlowId[] => {
    const out: VetBlowId[] = [];
    for (const i of inputs) out.push(vetMoveFor(i, out));
    return out;
  };
  assert.deepEqual(play(['tap', 'tap', 'tap']), ['jab', 'cross', 'hook']);
  assert.deepEqual(play(['tap', 'tap', 'swipeHold']), ['jab', 'cross', 'knee']);
  assert.deepEqual(play(['tap', 'tap', 'swipeTap']), ['jab', 'cross', 'uppercut']);
  assert.deepEqual(play(['hold', 'hold', 'swipeHold']), ['roundkick', 'push', 'spinkick']);
  assert.deepEqual(play(['hold', 'tap', 'hold']), ['roundkick', 'elbow', 'roundkick']);
  assert.deepEqual(play(['swipe']), ['dodge']);
  assert.deepEqual(play(['swipeHold']), ['spinkickClose']);
  // (a lone hold the round kick; a tap after the jump the jab)
  assert.deepEqual(play(['hold']), ['roundkick']);
  assert.deepEqual(play(['swipe', 'tap', 'tap']), ['dodge', 'jab', 'cross']);
});

test('off: the Brawler is as he was (his jab, cross and slip)', () => {
  const was = [VETERAN.on, BRAWLER.on];
  VETERAN.on = false;
  BRAWLER.on = true;
  try {
    const g = room();
    assert.deepEqual(g.hero.skills.map((s) => s.id), ['jab', 'cross', 'slip']);
    assert.equal(g.hero.vet, undefined);
  } finally {
    [VETERAN.on, BRAWLER.on] = was;
  }
});

test('three taps: three cyan globes, locked; the jab, the cross and the hook, each landing on the one in front; a fourth tap does not go in; the globes go out', () =>
  withVet(() => {
    const g = room();
    assert.deepEqual(g.hero.skills.map((s) => s.id), ['vpunch', 'vkick', 'vjump']);
    const m = dummy(g, 2.2, 0);
    const played = presses(g, 'ttt', m.x, m.y, 0.05);
    assert.deepEqual(g.hero.vet!.globes, ['punch', 'punch', 'punch'], 'three cyan globes');
    // (a fourth, locked out)
    presses(g, 't', m.x, m.y, 0.05);
    assert.equal(g.hero.vet!.globes.length, 3);
    let hits = 0;
    let last = hurt(m);
    const seen = [...played];
    for (let t = 0; t < 6; t += DT) {
      const c = emptyControls();
      c.aimX = m.x;
      c.aimY = m.y;
      g.update(DT, c);
      const mv = g.hero.vet!.move;
      if (mv && seen[seen.length - 1] !== mv.id) seen.push(mv.id);
      if (hurt(m) > last) hits++;
      last = hurt(m);
      // (kept where he can be reached: his blows drive it back for good, and he steps in after it)
    }
    assert.deepEqual(seen, ['jab', 'cross', 'hook'], 'the jab, the cross, the hook, and no fourth');
    assert.equal(hits, 3, 'each lands');
    assert.deepEqual(g.hero.vet!.globes, [], 'played out: the globes go out');
  }));

test('heavy: a move is played whole, its wind-up held; he does not walk while it is played', () =>
  withVet(() => {
    const g = room();
    const m = dummy(g, 2.2, 0);
    presses(g, 't', m.x, m.y, 0);
    const x0 = g.hero.x;
    const c = emptyControls();
    c.mx = 0;
    c.my = 1;
    c.aimX = m.x;
    c.aimY = m.y;
    for (let t = 0; t < 0.2; t += DT) g.update(DT, c);
    assert.ok(Math.abs(g.hero.y - 15.5) < 0.01, 'not walked');
    assert.ok(hurt(m) === 0 && Math.abs(g.hero.x - x0) < 0.01, 'the jab still held back at 0.2 s (its blow at frame 12 of 30 a second)');
    for (let t = 0; t < 0.3; t += DT) g.update(DT, c);
    assert.ok(hurt(m) > 0, 'landed by 0.5 s');
    assert.ok(g.hero.x > x0 + 0.4, 'his stamping step carried him in');
  }));

test('reach: about two and a half tiles in front (his step and the force past his fist); not behind him; not much further', () =>
  withVet(() => {
    for (const [dx, dy, want] of [[2.3, 0, true], [2.6, 0.5, true], [3.6, 0, false], [-1.5, 0, false], [0, 2.4, false]] as const) {
      const g = room();
      const m = dummy(g, dx, dy);
      presses(g, 't', g.hero.x + 2, g.hero.y, 1.0);
      assert.equal(hurt(m) > 0, want, `the jab, one at (${dx}, ${dy})`);
    }
  }));

test('the jump: every swipe spends it (a white globe, the dodge, nothing touching him in the air); with it not ready, a swipe does nothing', () =>
  withVet(() => {
    const g = room();
    const s = g.hero.skills[2];
    const was = s.charges;
    const x0 = g.hero.x;
    presses(g, 's', g.hero.x + 2, g.hero.y, 0, g.hero.x - 3, g.hero.y);
    assert.equal(s.charges, was - 1, 'spent');
    assert.deepEqual(g.hero.vet!.globes, ['jump']);
    let safe = false;
    for (let t = 0; t < 1.5; t += DT) {
      g.update(DT, emptyControls());
      if (g.hero.invuln > 0) safe = true;
    }
    assert.ok(safe, 'untouchable in the air');
    assert.ok(g.hero.x < x0 - 0.7, `sprung the way he swiped (${(x0 - g.hero.x).toFixed(2)} tiles)`);
    // (none left: a swipe goes in as nothing)
    presses(g, 's', g.hero.x + 2, g.hero.y, 0.05);
    assert.equal(g.hero.vet!.globes.length, 1, 'no second globe');
  }));

test('fire: tap, tap, swipe and hold is the flying knee; tap, tap, swipe and tap the flying uppercut, the one it hits thrown up stunned', () =>
  withVet(() => {
    {
      const g = room();
      const m = dummy(g, 2.2, 0);
      const seen = presses(g, 'ttsh', m.x, m.y, 8);
      assert.deepEqual(seen, ['jab', 'cross', 'knee']);
      assert.equal(g.hero.vet!.globes.length, 0);
    }
    {
      const g = room();
      const m = dummy(g, 2.2, 0);
      let globes: string[] = [];
      const seen: VetBlowId[] = [];
      presses(g, 'tts', m.x, m.y, 0);
      presses(g, 't', m.x, m.y, 0);
      globes = [...g.hero.vet!.globes];
      let stunned = false;
      for (let t = 0; t < 8; t += DT) {
        const c = emptyControls();
        c.aimX = m.x;
        c.aimY = m.y;
        g.update(DT, c);
        const mv = g.hero.vet!.move;
        if (mv && seen[seen.length - 1] !== mv.id) seen.push(mv.id);
        if (mv && mv.id === 'uppercut' && m.stunT > 0.5) stunned = true;
      }
      assert.deepEqual(globes, ['punch', 'punch', 'punchFire'], 'the third globe in cyan fire');
      assert.deepEqual(seen, ['jab', 'cross', 'uppercut']);
      assert.ok(stunned, 'thrown up, stunned');
    }
  }));

test('a swipe and a hold first: the spinning jump kick that closes in; hold, hold, swipe and hold: the round kick, the push kick, the spinning jump kick, its crescent all round him', () =>
  withVet(() => {
    {
      const g = room();
      const m = dummy(g, 3.5, 0);
      const seen = presses(g, 'sh', m.x, m.y, 3);
      // (the swipe's jump begun, its crouch, and set in fire as the hold comes: the spinning kick from its own start)
      assert.deepEqual(seen.filter((id) => id !== 'dodge'), ['spinkickClose']);
      assert.ok(seen.length <= 2);
      assert.ok(hurt(m) > 0, 'reached, three and a half tiles off');
    }
    {
      const g = room();
      const front = dummy(g, 2.2, 0);
      const seen = presses(g, 'hhsh', front.x, front.y, 3.0);
      assert.deepEqual(seen.slice(0, 2), ['roundkick', 'push']);
      // (round him as the spin begins: one behind, one to each side)
      const h = g.hero;
      const others = [dummy(g, -2.5, 0), dummy(g, 0, 2.5), dummy(g, 0, -2.5)];
      for (let t = 0; t < 4; t += DT) g.update(DT, emptyControls());
      for (const o of others) assert.ok(hurt(o) > 0, `the spinning kick reaches all round (${(o.x - h.x).toFixed(1)}, ${(o.y - h.y).toFixed(1)})`);
    }
  }));

test('hold, tap, hold: the round kick, the spinning elbow, the round kick', () =>
  withVet(() => {
    const g = room();
    const m = dummy(g, 2.2, 0);
    const seen = presses(g, 'hth', m.x, m.y, 6);
    assert.deepEqual(seen, ['roundkick', 'elbow', 'roundkick']);
  }));

test('his moves\' numbers: every blow reaches 2.5 tiles (the push kick and the spinning kicks 3.5); the flying knee the strongest single blow', () => {
  for (const [id, m] of Object.entries(VET_MOVES)) {
    if (!m.force) continue;
    const far = id === 'push' || id === 'spinkick' || id === 'spinkickClose' ? 3.5 : 2.5;
    assert.equal(m.force.reach, far, id);
  }
  const top = Object.entries(VET_MOVES).sort((a, b) => b[1].share - a[1].share)[0][0];
  assert.equal(top, 'knee');
});
