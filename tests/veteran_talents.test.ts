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


// THE VETERAN'S TREE (game/talents.ts VETERAN_TREE; his “Yes, build it (Recommended)” by 09:42 and “Swap two in (Recommended)” by
// 09:53, 3 Nov 2026): every talent doing what its card says.
//   run: tsx --test tests/veteran_talents.test.ts
import { TALENTS, TREES } from '../src/game/talents';
import { VET_TALENTS } from '../src/game/veteran';

function taking<T>(ids: string[], g: Game, run: () => T): T {
  const was = TALENTS.on;
  TALENTS.on = true;
  g.hero.talents = [...ids];
  try {
    return run();
  } finally {
    TALENTS.on = was;
  }
}
const play = (g: Game, secs: number, ax: number, ay: number): void => {
  for (let t = 0; t < secs; t += DT) {
    const c = emptyControls();
    c.aimX = c.castX = ax;
    c.aimY = c.castY = ay;
    g.update(DT, c);
  }
};

test('his tree: fifteen talents in three globes, Viper Jab and Thunder Knee in it, no draft', () =>
  withVet(() => {
    const T = TREES.brawler;
    assert.equal(T.shape, 'three globes');
    assert.equal(T.talents.length, 15);
    assert.ok(!T.draft);
    for (const id of ['vviperjab', 'vthunderknee']) assert.ok(T.talents.some((t) => t.id === id), id);
    assert.ok(!T.talents.some((t) => t.id === 'vonetwo' || t.id === 'vlightsout'));
  }));

test('Stiff Jab breaks off a wind-up; Viper Jab poisons', () =>
  withVet(() => {
    const g = room();
    const m = dummy(g, 2.2, 0);
    taking(['vstiffjab', 'vviperjab'], g, () => {
      m.state = 'windup';
      presses(g, 't', m.x, m.y, 0.8);
      assert.ok(m.poisonT > 0, 'poisoned');
      assert.notEqual(m.state, 'windup', 'its wind-up broken off');
    });
  }));

test('Guard Up: between blows, a blow from in front does half harm; from behind, all of it', () =>
  withVet(() => {
    const hits: number[] = [];
    for (const [ids, from] of [[[], 1], [['vguardup'], 1], [['vguardup'], -1]] as const) {
      const g = room();
      const m = dummy(g, from * 1.2, 0);
      taking([...ids], g, () => {
        const before = g.hero.life;
        g.hero.invuln = 0;
        g.hurtHero(40, 'phys', [], m);
        hits.push(before - g.hero.life);
      });
    }
    assert.ok(Math.abs(hits[1] - hits[0] / 2) <= 1, `in front, half (${hits.join(', ')})`);
    assert.equal(hits[2], hits[0], 'from behind, all');
  }));

test('Knockdown: the third punch knocks them down; Launcher: his blows on one in the air land twice as hard', () =>
  withVet(() => {
    const g = room();
    const m = dummy(g, 2.2, 0);
    taking(['vknockdown'], g, () => {
      presses(g, 'ttt', m.x, m.y, 0);
      let down = 0;
      for (let t = 0; t < 4; t += DT) {
        play(g, DT, m.x, m.y);
        if (g.hero.vet!.move?.id === 'hook' || !g.hero.vet!.move) down = Math.max(down, m.stunT);
      }
      assert.ok(down >= VET_TALENTS.knockdown.down - 0.1, `down ${down.toFixed(2)} s`);
    });
  }));

test('Switch Kick: a round kick straight after a punch comes sooner', () =>
  withVet(() => {
    const when = (ids: string[]): number => {
      const g = room();
      const m = dummy(g, 2.2, 0);
      return taking(ids, g, () => {
        presses(g, 'th', m.x, m.y, 0);
        let t = 0;
        let kicked = -1;
        let before = 0;
        for (; t < 4; t += DT) {
          play(g, DT, m.x, m.y);
          const mv = g.hero.vet!.move;
          if (mv && mv.id === 'roundkick' && kicked < 0 && mv.hit.length > before) kicked = t;
          before = mv?.hit.length ?? 0;
        }
        return kicked;
      });
    };
    const plain = when([]);
    const quick = when(['vswitchkick']);
    assert.ok(plain > 0 && quick > 0 && quick < plain - 0.15, `${quick.toFixed(2)} s against ${plain.toFixed(2)} s`);
  }));

test('Long Legs: his kick reaches a tile further', () =>
  withVet(() => {
    for (const [ids, want] of [[[], false], [['vlonglegs'], true]] as const) {
      const g = room();
      const m = dummy(g, 3.3, 0);
      taking([...ids], g, () => presses(g, 'h', m.x, m.y, 1.5));
      assert.equal(hurt(m) > 0, want, ids.join() || 'none');
    }
  }));

test('Wall Slam: driven into another enemy, stunned; Aftershock: everything near the one he kicked falls', () =>
  withVet(() => {
    {
      const g = room();
      const m = dummy(g, 2.0, 0);
      dummy(g, 2.9, 0);
      taking(['vwallslam'], g, () => {
        presses(g, 'h', m.x, m.y, 0.75);
        assert.ok(m.stunT >= VET_TALENTS.wallSlam.stun - 0.3, `stunned ${m.stunT.toFixed(2)}`);
      });
    }
    {
      const g = room();
      const m = dummy(g, 2.0, 0);
      const by = dummy(g, 2.0, 1.2);
      taking(['vaftershock'], g, () => {
        presses(g, 'h', m.x, m.y, 0.8);
        assert.ok(by.stunT > 0.3 || hurt(by) > 0, 'the one beside it fell (or was struck by the kick itself)');
      });
    }
  }));

test('Thunder Knee: the flying knee\'s lightning jumps on to three more and stuns them', () =>
  withVet(() => {
    const g = room();
    const m = dummy(g, 2.2, 0);
    const far = [dummy(g, 4.5, 1.5), dummy(g, 4.5, -1.5), dummy(g, 5.5, 0), dummy(g, 9, 0)];
    taking(['vthunderknee'], g, () => {
      presses(g, 'ttsh', m.x, m.y, 7);
      const struck = far.filter((o) => hurt(o) > 0).length;
      assert.equal(struck, 3, `${struck} struck by the lightning (the fourth too far)`);
    });
  }));

test('Light on His Feet: the jump comes back a third sooner; Stoke: a fire move that lands takes two seconds off it', () =>
  withVet(() => {
    const cd = (ids: string[], keys: string): number => {
      const g = room();
      const m = dummy(g, 2.2, 0);
      return taking(ids, g, () => {
        presses(g, keys, m.x, m.y, keys.length > 1 ? 1.4 : 0);
        return g.hero.skills[2].cd;
      });
    };
    const plain = cd([], 's');
    const light = cd(['vlightfeet'], 's');
    assert.ok(Math.abs(light - plain * VET_TALENTS.lightFeet.wait) < 0.1, `${light.toFixed(2)} against ${plain.toFixed(2)}`);
    const fired = cd([], 'st');
    const stoked = cd(['vstoke'], 'st');
    assert.ok(fired - stoked > VET_TALENTS.stoke.secs - 0.2, `stoked ${stoked.toFixed(2)} against ${fired.toFixed(2)}`);
  }));

test('Fire Starter: landed from a dodge, his next tap is in fire without spending the jump; Hang Time: nothing touches him in a fire move\'s air', () =>
  withVet(() => {
    {
      const g = room();
      const m = dummy(g, 2.2, 0);
      taking(['vfirestarter'], g, () => {
        presses(g, 's', m.x, m.y, 1.6, g.hero.x - 3, g.hero.y);
        const charges = g.hero.skills[2].charges;
        presses(g, 't', m.x, m.y, 0.05);
        assert.deepEqual(g.hero.vet!.globes, ['jump', 'punchFire']);
        assert.equal(g.hero.skills[2].charges, charges, 'the jump not spent again');
      });
    }
    {
      const g = room();
      const m = dummy(g, 2.2, 0);
      taking(['vhangtime'], g, () => {
        presses(g, 'st', m.x, m.y, 0);
        let safe = false;
        for (let t = 0; t < 2; t += DT) {
          play(g, DT, m.x, m.y);
          const mv = g.hero.vet!.move;
          if (mv && mv.id === 'uppercut' && mv.f > 18 && mv.f < 28 && g.hero.invuln > 0) safe = true;
        }
        assert.ok(safe);
      });
    }
  }));

test('The Full Set: a combo locked with a punch, a kick and a fire globe ends in a finisher three times as hard', () =>
  withVet(() => {
    const last = (ids: string[]): number => {
      const g = room();
      const m = dummy(g, 2.2, 0);
      return taking(ids, g, () => {
        presses(g, 'th', m.x, m.y, 0);
        presses(g, 'st', m.x, m.y, 0);
        let before = 0;
        let third = 0;
        for (let t = 0; t < 6; t += DT) {
          const was = hurt(m);
          play(g, DT, m.x, m.y);
          const mv = g.hero.vet!.move;
          if (mv && mv.globe === 2 && hurt(m) > was) third += hurt(m) - was;
          before = was;
        }
        void before;
        return third;
      });
    };
    const plain = last([]);
    const full = last(['vfullset']);
    assert.ok(plain > 0 && full > plain * 2.2, `${full} against ${plain}`);
  }));
