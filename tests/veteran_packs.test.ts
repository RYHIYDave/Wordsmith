// THE BRAWLER'S MOVES ASKED FOR A MOMENT AHEAD (render/veteran_fx.ts askAhead; render/baked.ts PACKS: his moves are kept packed and
// unpacked as they are thrown). What his drawing asks for as a fight goes: the move a press would make next, from the side he
// faces and from the side of the nearest enemy, so that a blow at an enemy is in hand before its first frame is shown; the move
// he is playing, and its lines for as long as they go on; his fall.
//   run: tsx --test tests/veteran_packs.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { EIGHT_MORE, MORE_SIDES, moreSideOf } from '../src/art/sides_more';
import { BRAWLER } from '../src/game/brawler';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { VETERAN } from '../src/game/veteran';
import { VeteranFx } from '../src/render/veteran_fx';

const DT = 1 / 60;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inner = (g: Game): any => g;
const sideOf = (fx: number, fy: number): number => MORE_SIDES.indexOf(moreSideOf(fx, fy));

function withHim<T>(run: () => T): T {
  const was = [VETERAN.on, BRAWLER.on, EIGHT_MORE.brawler];
  VETERAN.on = true;
  BRAWLER.on = true;
  EIGHT_MORE.brawler = true;
  try {
    return run();
  } finally {
    [VETERAN.on, BRAWLER.on, EIGHT_MORE.brawler] = was;
  }
}
function room(): Game {
  const g = Game.forPractice('brawler', 3);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}
function dummy(g: Game, dx: number, dy: number): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng) as Monster;
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}

/**
 * A fight played with his drawing's step beside it: `keys` pressed a frame apart (t a tap, h a hold, s a swipe) at (ax, ay), then
 * `secs` of the game. Every move as it began: its name, its side, and whether it had been asked for AHEAD on an earlier frame;
 * and everything asked for as shown (`now`).
 */
function fight(g: Game, fx: VeteranFx, keys: string, ax: number, ay: number, secs: number): { began: { id: string; side: number; ahead: boolean }[]; now: Set<string>; ahead: Set<string> } {
  const ahead = new Set<string>();
  const now = new Set<string>();
  let late = new Set<string>();
  fx.packs = (move, side, shown) => (shown ? now : late).add(`${move}:${side}`);
  const began: { id: string; side: number; ahead: boolean }[] = [];
  let was = '';
  const step = (press: string): void => {
    const c = emptyControls();
    c.aimX = c.castX = ax;
    c.aimY = c.castY = ay;
    if (press === 't') c.fire = true;
    if (press === 'h') c.cast = true;
    if (press === 's') {
      c.evade = true;
      c.evadeX = g.hero.x - 3;
      c.evadeY = g.hero.y;
    }
    g.update(DT, c);
    const mv = g.hero.vet?.move;
    const key = mv ? `${mv.id}#${mv.globe}#${mv.x0}` : '';
    if (mv && key !== was) began.push({ id: mv.id, side: sideOf(mv.fx, mv.fy), ahead: ahead.has(`${mv.id}:${sideOf(mv.fx, mv.fy)}`) });
    was = key;
    // (his drawing's step comes after the game's: what it asks for ahead on this frame is in hand for the next)
    late = new Set();
    fx.step(g, { shake: 0 }, DT);
    for (const k of late) ahead.add(k);
  };
  step('');
  for (const k of keys) {
    step(k);
    step('');
  }
  for (let t = 0; t < secs; t += DT) step('');
  return { began, now, ahead };
}

test('standing: the moves a tap, a hold and a swipe would make are asked for ahead, from the side he faces and the nearest enemy\'s', () => {
  withHim(() => {
    const g = room();
    const fx = new VeteranFx();
    const none = fight(g, fx, '', g.hero.x + 2, g.hero.y, 0.1);
    const front = sideOf(1, 0);
    assert.deepEqual([...none.ahead].sort(), [`dodge:${front}`, `jab:${front}`, `roundkick:${front}`].sort(), 'nobody near: from the side he faces');
    assert.equal(none.now.size, 0, 'nothing shown: nothing asked for as shown');
    // (an enemy down and to the left of him, behind his shoulder: his next blow goes at it)
    dummy(g, -0.9, 0.9);
    const there = sideOf(-0.9, 0.9);
    assert.notEqual(there, front);
    const one = fight(g, fx, '', g.hero.x + 2, g.hero.y, 0.1);
    assert.ok(one.ahead.has(`jab:${there}`) && one.ahead.has(`roundkick:${there}`), 'and from the side of the nearest enemy');
    assert.ok(one.ahead.has(`jab:${front}`) && one.ahead.has(`dodge:${front}`));
    assert.ok(!one.ahead.has(`dodge:${there}`), 'his jump springs away from the way he faces: not asked for at the enemy');
  });
});

test('a fight: every blow at the enemy was asked for before its first frame; what is shown is asked for as shown, its lines to their end', () => {
  withHim(() => {
    for (const [dx, dy] of [[1.1, 0.2], [-0.9, 0.9], [0.1, -1.2]] as const) {
      const g = room();
      const m = dummy(g, dx, dy);
      const fx = new VeteranFx();
      // (three punches; then two kicks; then a punch after a kick)
      const a = fight(g, fx, 'ttt', m.x, m.y, 4.5);
      assert.deepEqual(a.began.map((b) => b.id), ['jab', 'cross', 'hook']);
      const b = fight(g, fx, 'hht', m.x, m.y, 5);
      assert.deepEqual(b.began.map((x) => x.id), ['roundkick', 'push', 'elbow']);
      for (const mv of [...a.began, ...b.began]) {
        assert.ok(mv.ahead, `${mv.id} at (${dx}, ${dy}): asked for before it began`);
        assert.ok(a.now.has(`${mv.id}:${mv.side}`) || b.now.has(`${mv.id}:${mv.side}`), `${mv.id}: asked for as shown while it played`);
      }
    }
  });
});

test('a swipe and a press on it: the move it sets in fire is asked for ahead; his jump is asked for as it is shown', () => {
  withHim(() => {
    const g = room();
    const m = dummy(g, 1.1, 0);
    const fx = new VeteranFx();
    // (a swipe, and a tap before its jump has left the floor: the flying uppercut)
    const a = fight(g, fx, 'st', m.x, m.y, 2.5);
    assert.deepEqual(a.began.map((b) => b.id), ['dodge', 'uppercut'], 'his jump begun, and set in fire before it left the floor');
    assert.ok(a.began[1].ahead, 'the flying uppercut: asked for before it began');
    // (a swipe alone, his jump ready again: a new room)
    const g2 = room();
    const b = fight(g2, new VeteranFx(), 's', g2.hero.x + 1, g2.hero.y, 2);
    assert.deepEqual(b.began.map((x) => x.id), ['dodge']);
    assert.ok(b.now.has(`dodge:${b.began[0].side}`));
  });
});

test('fallen: his fall is asked for as shown; and with nobody to tell, his drawing asks for nothing', () => {
  withHim(() => {
    const g = room();
    const fx = new VeteranFx();
    inner(g).over = true;
    const a = fight(g, fx, '', g.hero.x + 1, g.hero.y, 0.05);
    assert.ok([...a.now].some((k) => k.startsWith('fall:')));
    fx.packs = null;
    fx.step(g, { shake: 0 }, DT);
  });
});
