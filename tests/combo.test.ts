// STRIKE, A TWO-HIT COMBO, AND A STEP FORWARD WITH EVERY SWING (game/defs.ts, COMBO; game/game.ts,
// useBasic; the picture: render/figure.ts, attackClip, and art/moves3.ts, SLASH3). ON IN THE GAME
// SINCE VERSION 18.9 (his yes to its moving picture, 8 Oct 2026, 07:32: "Yeah looks good"): these
// tests set the switch for themselves and put it back.
//
// The owner, 7 Oct 2026, 23:18: "I’d like STRIKE to have two animations.  The first is the strike
// we have now.  That one always plays first.  If the player taps again quickly, then the second
// animation, I downward slash, plays.  Back to the first if they tap again.  If it’s not tapped for
// a set duration, it goes back to the first animation.  Like a two hit combo if you tap twice";
// 23:18: "And I want him to move forward a little every swing"; 23:19: "Not much, but some".
//
// What is held here:
//   1. the switch is on in the game; with it off, Strike is as it was: one swing, the same one, and no step;
//   2. Strike first; the next, if it comes soon enough, the downward slash; then Strike again;
//   3. a tap that comes after the set time is the first swing again, and one just inside it the second;
//   4. every swing steps him forward a third of a tile along the way he faces, and only that way;
//   5. a wall stops the step, and so does a monster;
//   6. the two swings do the same harm;
//   7. an evasive move or the slow attack between two Strikes makes the next the first swing;
//   8. the picture: the second swing is shown with the slash, which lands when the strike does.
//   run: tsx --test tests/combo.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { Clip } from '../src/art/actor_types';
import { makeHeroArt3 } from '../src/art/heroes3';
import type { RNG } from '../src/engine/rng';
import { COMBO, SKILLS, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { plainWeapon } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { Figure, attackClip, attackFrame } from '../src/render/figure';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

const DT = 1 / 120;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** With the combo's switch set for the length of `run`, and put back after. */
function combo<T>(on: boolean, run: () => T): T {
  const was = COMBO.on;
  COMBO.on = on;
  try {
    return run();
  } finally {
    COMBO.on = was;
  }
}

/** The practice room with nothing in it: the knight in the middle, facing `fx`, `fy`. `sword`: with the one-handed sword (Strike and Slam) in place of the great sword (Strike and Whirlwind). */
function room(fx = 1, fy = 0, seed = 3, sword = false): Game {
  const g = Game.forPractice('warrior', seed);
  if (sword) {
    g.hero.gear.mainhand = plainWeapon('sword', 1);
    g.refresh();
  }
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  const n = Math.hypot(fx, fy);
  g.hero.fx = fx / n;
  g.hero.fy = fy / n;
  g.events.length = 0;
  return g;
}

/** A monster that stands still, never strikes, and can take anything. */
function dummy(g: Game, dx: number, dy: number, life = 1e7): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}

/** What the player does: Strike pressed (or not), aimed straight ahead. */
function pressing(g: Game, fire: boolean): Controls {
  const h = g.hero;
  const c = emptyControls();
  c.aimX = h.x + h.fx * 2;
  c.aimY = h.y + h.fy * 2;
  c.fire = fire;
  return c;
}

/**
 * Tap Strike: the tap waits its turn, as a tap on a phone does (main.ts, `order`), and is held
 * until the swing it asks for has landed. Returns which swing it was: 0 Strike, 1 the slash.
 */
function swing(g: Game): number {
  const h = g.hero;
  const uses = h.skills[0].uses;
  for (let k = 0; k < Math.round(3 / DT); k++) {
    g.update(DT, pressing(g, true));
    if (h.skills[0].uses > uses) return h.combo;
  }
  throw new Error('a tap of Strike never made a swing');
}

/** Let time pass with nothing pressed. */
function wait(g: Game, seconds: number): void {
  for (let k = 0; k < Math.round(seconds / DT); k++) g.update(DT, pressing(g, false));
}

/** The weapon's time between blows, and how long a swing takes to wind up (game.ts, useBasic). */
function timing(g: Game): { between: number; wind: number } {
  const s = g.hero.skills[0];
  const rate = Math.max(0.3, s.r.rate);
  return { between: 1 / rate, wind: Math.min(SKILLS[s.id].windup, 0.4 / rate) };
}

test('THE SWITCH IS ON IN THE GAME (Version 18.9), and with it off Strike is as it was: the same swing every time, and no step', () => {
  assert.equal(COMBO.on, true, 'the owner, 8 Oct 2026, 07:32, of its moving picture: "Yeah looks good"');
  combo(false, () => {
    const g = room();
    const h = g.hero;
    const x0 = h.x;
    const y0 = h.y;
    const seen: number[] = [];
    for (let k = 0; k < 5; k++) seen.push(swing(g));
    wait(g, 0.5);
    assert.deepEqual(seen, [0, 0, 0, 0, 0]);
    assert.ok(Math.abs(h.x - x0) < 1e-9 && Math.abs(h.y - y0) < 1e-9, `he has not moved: ${(h.x - x0).toFixed(4)}, ${(h.y - y0).toFixed(4)}`);
  });
});

test('Strike first; the next, if it comes soon enough, the downward slash; then Strike again ("Back to the first if they tap again")', () => {
  combo(true, () => {
    for (const sword of [false, true]) {
      const g = room(1, 0, 3, sword);
      const seen: number[] = [];
      for (let k = 0; k < 6; k++) seen.push(swing(g));
      assert.deepEqual(seen, [0, 1, 0, 1, 0, 1], sword ? 'the one-handed sword' : 'the great sword');
    }
  });
});

test('a tap after the set time is the first swing again ("If it’s not tapped for a set duration, it goes back to the first animation"); one just inside it is the second', () => {
  combo(true, () => {
    const g = room();
    const { between, wind } = timing(g);
    // (a swing has just landed, `wind` after it was begun: the next may be the slash until
    // `between + comboWindow` after it was begun)
    const left = between + TUNE.comboWindow - wind;
    assert.equal(swing(g), 0);
    wait(g, left - 0.05);
    assert.equal(swing(g), 1, 'tapped just inside the set time');
    wait(g, left + 0.05);
    assert.equal(swing(g), 0, 'tapped just after it');
    wait(g, left + 2);
    assert.equal(swing(g), 0, 'tapped long after');
    assert.equal(swing(g), 1, 'and the next, quickly');
  });
});

test('every swing steps him forward a third of a tile ("Not much, but some"), along the way he faces and only that way', () => {
  combo(true, () => {
    for (const [fx, fy] of [[1, 0], [0, -1], [-1, 1], [0.3, 0.9]]) {
      const g = room(fx, fy);
      const h = g.hero;
      for (let k = 0; k < 4; k++) {
        const x0 = h.x;
        const y0 = h.y;
        const ux = h.fx;
        const uy = h.fy;
        swing(g);
        wait(g, TUNE.swingStepTime + 0.05);
        const along = (h.x - x0) * ux + (h.y - y0) * uy;
        const aside = Math.abs(-(h.x - x0) * uy + (h.y - y0) * ux);
        assert.ok(Math.abs(along - TUNE.swingStep) < 1e-6, `facing ${fx}, ${fy}, swing ${k + 1}: ${along.toFixed(4)} forward`);
        assert.ok(aside < 1e-6, `and ${aside.toFixed(6)} aside`);
      }
    }
    assert.ok(TUNE.swingStep > 0.2 && TUNE.swingStep < 0.5, 'not much, but some');
  });
});

test('a wall stops the step as it stops him, and so does a monster', () => {
  combo(true, () => {
    // (the wall: the first tile along +x from the middle of the room that is not floor)
    const g = room();
    const h = g.hero;
    const L = g.level;
    const ty = Math.floor(h.y);
    let tx = Math.floor(h.x);
    while (L.walk[ty * L.floor.w + tx]) tx++;
    h.x = tx - TUNE.heroRadius - 0.05;
    for (let k = 0; k < 3; k++) {
      swing(g);
      wait(g, 0.3);
      assert.ok(h.x <= tx - TUNE.heroRadius + 1e-6, `swing ${k + 1}: he is ${(tx - h.x).toFixed(3)} from the wall`);
    }
    // (the monster: right in front of him)
    const g2 = room();
    const h2 = g2.hero;
    const m = dummy(g2, 0.9, 0);
    const min = TUNE.heroRadius + m.r * 0.8;
    for (let k = 0; k < 4; k++) {
      swing(g2);
      wait(g2, 0.3);
      assert.ok(Math.hypot(m.x - h2.x, m.y - h2.y) >= min - 1e-3, `swing ${k + 1}: he is ${Math.hypot(m.x - h2.x, m.y - h2.y).toFixed(3)} from it, and no nearer than ${min.toFixed(3)}`);
    }
  });
});

test('the two swings do the same harm: a fight with the combo is the fight without it, blow for blow', () => {
  const blows = (on: boolean): number[] =>
    combo(on, () => {
      const g = room();
      // (the dice of the blows held still: every blow its middle harm, none a critical one; so what
      // is compared is what each swing does, and not where the dice fell)
      const dice = inner(g).rng as unknown as { range: (lo: number, hi: number) => number; chance: (p: number) => boolean };
      dice.range = (lo: number, hi: number): number => (lo + hi) / 2;
      dice.chance = (): boolean => false;
      const m = dummy(g, 1.2, 0);
      const out: number[] = [];
      for (let k = 0; k < 6; k++) {
        const before = m.life;
        swing(g);
        out.push(Math.round((before - m.life) * 1000) / 1000);
      }
      return out;
    });
  const off = blows(false);
  const on = blows(true);
  assert.ok(off.every((d) => d > 0), `every blow lands: ${off.join(', ')}`);
  assert.ok(on.every((d) => d === on[0]), `the first swing and the second alike: ${on.join(', ')}`);
  assert.deepEqual(on, off);
});

test('an evasive move, or the slow attack, between two Strikes makes the next the first swing again', () => {
  combo(true, () => {
    // (the slow attack: with the one-handed sword, Slam)
    const g = room(1, 0, 3, true);
    const h = g.hero;
    assert.equal(SKILLS[h.skills[1].id].id, 'slam');
    assert.equal(swing(g), 0);
    const c = pressing(g, false);
    c.cast = true;
    c.castX = h.x + 1.5;
    c.castY = h.y;
    g.update(DT, c);
    const slams = h.skills[1].uses;
    for (let k = 0; k < 240 && h.skills[1].uses === slams; k++) g.update(DT, pressing(g, false));
    assert.equal(h.skills[1].uses, slams + 1, 'the slam landed');
    assert.equal(swing(g), 0, 'after the slam: Strike');
    assert.equal(swing(g), 1, 'and then the slash');
    // (an evasive move: the knight's leap)
    const g2 = room();
    const h2 = g2.hero;
    assert.equal(swing(g2), 0);
    const e = pressing(g2, false);
    e.evade = true;
    e.evadeX = h2.x + 3;
    e.evadeY = h2.y;
    g2.update(DT, e);
    assert.ok(h2.move !== null, 'he leaps');
    assert.equal(h2.step, null, 'and the swing’s step is over');
    for (let k = 0; k < 240 && h2.move; k++) g2.update(DT, pressing(g2, false));
    assert.equal(swing(g2), 0, 'after the leap: Strike');
    assert.equal(swing(g2), 1, 'and then the slash');
  });
});

test('the picture: the second swing is shown with the downward slash, whose blow lands when the strike’s does, in both views', () => {
  assert.equal(attackClip('warrior', 0, 'melee', 0), 0);
  assert.equal(attackClip('warrior', 0, 'melee', 1), 2);
  assert.equal(attackClip('warrior', 1, 'burst', 1), 1, 'the slow attack is the slow attack');
  assert.equal(attackClip('ranger', 0, 'projectile', 1), 0, 'only a blade has two swings');
  const art = makeHeroArt3().of('warrior', { twoHanded: true });
  const DTF = 1 / 60;
  for (const [view, set] of [['front', art.front], ['back', art.back]] as const) {
    const strike = set.clips?.attack as Clip;
    const slash = set.clips?.attack2 as Clip;
    assert.ok(slash && slash.frames.length > 4, `${view}: the slash is painted`);
    assert.equal(slash.hit, strike.hit, `${view}: its blow lands when the strike's does`);
    // (it is over by the time the rules have the swing over: Strike's wind-up and follow-through)
    const length = (slash.frames.length - 1) / slash.fps;
    assert.ok(length <= SKILLS.strike.windup + SKILLS.strike.follow + 1 / 30 + 1e-9, `${view}: it lasts ${length.toFixed(3)} s`);
    // (the figure shows it for the second swing, frame by frame, and the strike for the first)
    const fy = view === 'front' ? 0 : -1;
    const fx = view === 'front' ? 1 : 0;
    for (const age of [0.02, 0.1, 0.15, 0.3]) {
      const two = new Figure().frame(art, { anim: 'attack', animT: 0, fx, fy, attackSkill: 2, attackAge: age, attackWind: 0.12, leapK: -1 }, DTF, 0, 0, false);
      const one = new Figure().frame(art, { anim: 'attack', animT: 0, fx, fy, attackSkill: 0, attackAge: age, attackWind: 0.12, leapK: -1 }, DTF, 0, 0, false);
      assert.ok(two === attackFrame(slash, age, 0.12), `${view}, ${age} s in: the slash`);
      assert.ok(one === attackFrame(strike, age, 0.12), `${view}, ${age} s in: the strike`);
    }
  }
});
