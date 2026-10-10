// The three heroes painted over the bones, as the game shows them (src/art/heroes3.ts; begun
// 6 Oct 2026). THEY ARE THE GAME'S HEROES FROM VERSION 16 (the owner, 7 Oct 2026, 00:34: "im
// happy with all three.  run the tests, throw them in the game"); the first heroes (art/heroes.ts)
// are shown only to a page opened with #heroes=old. What is held here is that they are whole: a
// figure for the dungeon and one for the town,
// loops that go round, attacks that keep the moment their blow lands, a weapon that changes
// between the back and the hand without a jump, and the picture of making ready that a class card
// plays when its hero is picked.
//
// A plain painting stands in for the canvas (tests/helpers.ts), so what is read is the very frame
// the game would show.
//   run: tsx --test tests/heroes3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, Clip } from '../src/art/actor_types';
import { onBack } from '../src/art/carried';
import { makeHeroArt } from '../src/art/heroes';
import type { HeroLook } from '../src/art/heroes';
import { PLANS, makeHeroArt3, windAt } from '../src/art/heroes3';
import { MAGE_STANCES, MOVES3, WILD, useMageStances, useWild } from '../src/art/moves3';
import { about, aimFor, bonesAt, dot, heading, len, norm, solve, sub } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { CLASS_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';
import { Figure, heldFrame } from '../src/render/figure';
import type { Art } from '../src/render/render';
import { ENTER_OUT, enterLength } from '../src/ui/panels';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

// (VERSION 19.7: the mage's stances and every hero's moves big and wild are the game's own, art/moves3.ts
// MAGE_STANCES and WILD, put in place as moves3.ts loads. This file's tests were written with them off,
// and hold them off, as they were then; tests/wild.test.ts and tests/mage_stances.test.ts ask of them on.)
useWild(false);
useMageStances(false);

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const art = makeHeroArt3();
const DUNGEON: HeroLook = { twoHanded: true };
const TOWN: HeroLook = { twoHanded: true, town: true };
const VIEWS = ['front', 'back'] as const;
/** What flies from each: the tails every one of their frames must name. */
const TAILS: Record<ClassId, string[]> = { warrior: ['w-scarf-a', 'w-scarf-b'], ranger: ['r-feather'], mage: ['m-braid-a', 'm-braid-b'] };
/** The moves each stands in and runs with, in a dungeon and in town, and the two attacks. */
const MOVES: Record<ClassId, { stand: [string, string]; run: [string, string]; attack: string; heavy: string; ready: string }> = {
  warrior: { stand: ['rear', 'ktown'], run: ['krun', 'ktownrun'], attack: 'strike', heavy: 'slam', ready: 'kdraw' },
  ranger: { stand: ['rstand', 'rtown'], run: ['rrun', 'rtownrun'], attack: 'shot', heavy: 'volley', ready: 'rdraw' },
  mage: { stand: ['mstand', 'mstand'], run: ['mrun', 'mrun'], attack: 'wave', heavy: 'orb', ready: 'mready' },
};
const endOf = (key: string): number => {
  const keys = MOVES3[key].motion.keys;
  return keys[keys.length - 1].at;
};
const seconds = (c: Clip): number => (c.frames.length - 1) / c.fps;
const near = (a: number, b: number, by = 1e-6): boolean => Math.abs(a - b) <= by;
/** How many pixels of a frame are painted at all. */
const painted = (s: { img: unknown }): number => {
  const p = paintingOf(s as never);
  let n = 0;
  for (let i = 3; i < p.d.length; i += 4) if (p.d[i] > 0) n++;
  return n;
};

test('each hero has a figure for the dungeon and another for the town, each made once', () => {
  for (const cls of CLASS_IDS) {
    const d = art.of(cls, DUNGEON);
    const t = art.of(cls, TOWN);
    assert.ok(d === art.of(cls, DUNGEON) && t === art.of(cls, TOWN), `${cls}: asked for twice, made twice`);
    assert.ok(d !== t, `${cls}: the town's figure is the dungeon's`);
    // (the knight is painted with the great sword only, so far: whatever he carries, it is that figure)
    assert.ok(d === art.of(cls, { twoHanded: false }), `${cls}: another figure for another weapon`);
  }
});

test('standing and running go round: whole loops, at ten and at thirty frames a second (a run that grips, sixty)', () => {
  for (const cls of CLASS_IDS) {
    for (const [i, look] of [DUNGEON, TOWN].entries()) {
      const a = art.of(cls, look);
      // (the ranger's runs grip the floor, with his new stances, since Version 19.4: a picture each sixtieth of a second, tests/grip_runs.test.ts)
      const grips = MOVES3[MOVES[cls].run[i]].stride !== undefined;
      assert.equal(grips, cls === 'ranger', `${cls}: the run grips the floor only for the ranger`);
      const fps = grips ? 60 : 30;
      for (const view of VIEWS) {
        const set = a[view];
        const where = `${cls}, ${i === 0 ? 'dungeon' : 'town'}, ${view}`;
        assert.equal(set.idleFps, 10, `${where}: the standing loop's rate`);
        assert.equal(set.walkFps, fps, `${where}: the run's rate`);
        assert.ok(near(set.idle.length / 10, endOf(MOVES[cls].stand[i])), `${where}: the standing loop is ${set.idle.length} frames, its move ${endOf(MOVES[cls].stand[i])} s`);
        assert.ok(near(set.walk.length / fps, endOf(MOVES[cls].run[i])), `${where}: the run is ${set.walk.length} frames, its move ${endOf(MOVES[cls].run[i])} s`);
      }
    }
  }
});

test('every frame of standing and running is the hero, on their feet, with what flies from them', () => {
  for (const cls of CLASS_IDS) {
    for (const [i, look] of [DUNGEON, TOWN].entries()) {
      const a = art.of(cls, look);
      for (const view of VIEWS) {
        for (const [what, frames] of [['standing', a[view].idle], ['running', a[view].walk]] as const) {
          frames.forEach((s, k) => {
            const where = `${cls}, ${i === 0 ? 'dungeon' : 'town'}, ${view}, ${what}, frame ${k}`;
            assert.equal(s.density, 2, `${where}: its grain`);
            assert.ok(painted(s) > 800, `${where}: only ${painted(s)} pixels of it`);
            // (the floor point is under the figure: most of the picture is above it, and it is within the picture from side to side)
            assert.ok(s.ay > s.h * 0.7 && s.ay <= s.h + 1, `${where}: its feet are at ${s.ay} of ${s.h}`);
            assert.ok(s.ax > 4 && s.ax < s.w - 4, `${where}: its middle is at ${s.ax} of ${s.w}`);
            const ids = (s.tails ?? []).map((r) => r.id).sort();
            assert.equal(ids.join(','), [...TAILS[cls]].sort().join(','), `${where}: what flies from it`);
            assert.ok(s.aura !== undefined, `${where}: no pool of light behind it`);
          });
          // (a loop that moves: its middle is not its beginning)
          assert.ok(unlike(frames[0], frames[Math.floor(frames.length / 2)]) > 20, `${cls}, ${view}, ${what}: nothing moves in it`);
        }
      }
    }
  }
});

test('the attacks are whole, and keep the moment their blow lands', () => {
  for (const cls of CLASS_IDS) {
    const a = art.of(cls, DUNGEON);
    for (const view of VIEWS) {
      const clips = a[view].clips;
      assert.ok(clips && clips.attack && clips.heavy, `${cls}, ${view}: an attack is missing`);
      if (!clips || !clips.attack || !clips.heavy) continue;
      for (const [c, key] of [[clips.attack, MOVES[cls].attack], [clips.heavy, MOVES[cls].heavy]] as const) {
        assert.equal(c.fps, 30, `${cls}, ${key}: its rate`);
        assert.ok(near(c.hit ?? -1, MOVES3[key].motion.hit ?? -2), `${cls}, ${key}: the blow lands at ${c.hit}, the move says ${MOVES3[key].motion.hit}`);
        assert.ok(seconds(c) >= endOf(key) - 1e-6 && seconds(c) < endOf(key) + 1 / 30, `${cls}, ${key}: ${seconds(c)} s of pictures for ${endOf(key)} s of move`);
        assert.equal(a[view].attack.length, 3, `${cls}: the three stills of an attack`);
      }
    }
  }
  // what each has besides: the knight leaps, lands and whirls; the ranger rolls; the mage holds a beam and lets it go
  const k = art.of('warrior', DUNGEON).front.clips;
  assert.ok(k && k.leap && k.land && k.whirl && k.whirl.turns === true && k.whirl.loop === 0 && k.fall && k.reel && k.lurch, 'the knight is missing a move');
  const r = art.of('ranger', DUNGEON).front.clips;
  assert.ok(r && r.roll && r.fall && r.reel && r.lurch && r.idleA && r.idleB, 'the ranger is missing a move');
  const m = art.of('mage', DUNGEON).front.clips;
  assert.ok(m && m.hold && m.hold.loop !== undefined && m.release && m.fall && m.reel && m.lurch && m.idleA && m.idleB, 'the mage is missing a move');
});

test('in town the knight and the ranger have their hands empty; the mage is as she is everywhere', () => {
  for (const cls of ['warrior', 'ranger'] as const) {
    for (const view of VIEWS) {
      const n = unlike(art.of(cls, TOWN)[view].idle[0], art.of(cls, DUNGEON)[view].idle[0]);
      assert.ok(n > 300, `${cls}, ${view}: in town they stand as in a dungeon (${n} pixels differ)`);
    }
  }
  for (const view of VIEWS) assert.equal(unlike(art.of('mage', TOWN)[view].idle[0], art.of('mage', DUNGEON)[view].idle[0]), 0, `the mage, ${view}: she stands otherwise in town`);
});

test('making ready: a hero in town has the picture of it, and it ends in another stance, held', () => {
  for (const cls of CLASS_IDS) {
    const town = art.of(cls, TOWN);
    const c = town.front.clips?.ready;
    assert.ok(c !== undefined, `${cls}: no picture of making ready`);
    if (!c) continue;
    assert.ok(town.back.clips?.ready === undefined, `${cls}: a picture of making ready seen from behind`);
    assert.ok(art.of(cls, DUNGEON).front.clips?.ready === undefined, `${cls}: one who is ready already makes ready`);
    const ready = MOVES3[MOVES[cls].ready].ready;
    assert.ok(ready !== undefined && ready > 0.3, `${cls}: the move does not say when they are ready`);
    // (at least a second of it, and the stance held at its end)
    assert.ok(seconds(c) >= 1 - 1e-6 && seconds(c) >= (ready ?? 0) + 0.3 - 1e-6 && seconds(c) < 2, `${cls}: it lasts ${seconds(c)} s`);
    assert.equal(unlike(c.frames[0], town.front.idle[0]), 0, `${cls}: it does not begin as they stand in town`);
    const last = c.frames[c.frames.length - 1];
    assert.ok(unlike(c.frames[0], last) > 300, `${cls}: they end as they began`);
    // (held: the last fifth of a second hardly moves)
    assert.ok(unlike(c.frames[c.frames.length - 6], last) < unlike(c.frames[0], last) / 3, `${cls}: the stance is not held at the end`);
  }
});

test('on a class card, and in town, no hero passes the time by drawing their weapon into the battle stance: that is kept for when they are picked', () => {
  // The owner, 6 Oct 2026, 22:58: "lets not have the battle stance be an idle animation during
  // the character select screen.  that way its something different when you select them". And
  // of town, 7 Oct 2026, 23:09: "Don’t use the battle stance as an idle animations while in town
  // stance" (until Version 18.8 it was the first of their two things to do in town).
  const CARD: HeroLook = { twoHanded: true, town: true, card: true };
  for (const cls of CLASS_IDS) {
    const plan = PLANS[cls].card;
    assert.ok(plan.ready !== undefined, `${cls}: nothing to play when they are picked`);
    assert.ok(plan.idleA !== plan.ready && plan.idleB !== plan.ready, `${cls}: on their card they draw their weapon to pass the time`);
    const inTown = PLANS[cls].town;
    assert.ok(inTown.ready === plan.ready, `${cls}: in town they make ready as on their card`);
    assert.ok(inTown.idleA !== inTown.ready && inTown.idleB !== inTown.ready, `${cls}: in town they draw their weapon to pass the time`);
    assert.ok(inTown.idleA !== undefined, `${cls}: nothing at all to do in town`);
    const card = art.of(cls, CARD);
    const town = art.of(cls, TOWN);
    assert.ok(card !== town, `${cls}: the card's figure is the town's`);
    // as they stand, a card's hero is the town's; and the picture of making ready is the same one
    assert.equal(unlike(card.front.idle[0], town.front.idle[0]), 0, `${cls}: on a card they do not stand as in town`);
    const ready = card.front.clips?.ready;
    const drawn = town.front.clips?.ready;
    assert.ok(ready !== undefined && drawn !== undefined && ready.frames.length === drawn.frames.length, `${cls}: the card's picture of making ready`);
    // whatever they do on a card, they never come to the stance that making ready ends in
    if (!ready) continue;
    const stance = ready.frames[ready.frames.length - 1];
    for (const [where, c] of [['card', card.front.clips?.idleA], ['card', card.front.clips?.idleB], ['town', town.front.clips?.idleA], ['town', town.front.clips?.idleB]] as const) {
      if (!c) continue;
      for (let i = 0; i < c.frames.length; i += 4) assert.ok(unlike(c.frames[i], stance) > 150, `${cls}: frame ${i} of a thing done ${where === 'card' ? 'on the card' : 'in town'} is the battle stance`);
    }
  }
  // (each has something to do there, all the same)
  for (const cls of CLASS_IDS) assert.ok(art.of(cls, CARD).front.clips?.idleA !== undefined, `${cls}: nothing at all to do on a card`);
});

test('a run begins at once for heroes with no picture of making ready, and after it for those with one', () => {
  const old = { heroes: makeHeroArt() } as unknown as Art;
  const fresh = { heroes: art } as unknown as Art;
  for (const cls of CLASS_IDS) {
    assert.equal(enterLength(old, cls), 0, `${cls}: the first heroes make ready`);
    const c = art.of(cls, TOWN).front.clips?.ready;
    assert.ok(c !== undefined && near(enterLength(fresh, cls), seconds(c) + ENTER_OUT), `${cls}: how long the entrance is`);
  }
});

test('a weapon changes between the back and the hand exactly where it lies on the back', () => {
  const angle = (a: V3, b: V3): number => (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI;
  // (the knight takes his sword up and puts it away again; the ranger, since Version 19.4, makes ready into his battle stance, the bow kept out in front of him: taken up once)
  for (const [key, what, left, times] of [['kdraw', 'sword', false, 2], ['rdraw', 'bow', true, 1]] as const) {
    const move = MOVES3[key];
    const keys = move.motion.keys;
    let changes = 0;
    for (let i = 1; i < keys.length; i++) {
      const was = { ...move.rest, ...keys[i - 1].pose }.stow;
      const is = { ...move.rest, ...keys[i].pose }.stow;
      if (was === is) continue;
      changes++;
      const q = bonesAt(keys, move.rest, keys[i].at);
      const s = solve(move.build, q);
      const b = onBack(move.build, s, what);
      const hand = left ? s.handL : s.handR;
      assert.ok(len(sub(hand, b.grip)) < 0.01, `${key}, key ${i}: the hand is ${len(sub(hand, b.grip)).toFixed(3)} from where the ${what} lies`);
      assert.ok(angle(s.point, b.point) < 0.1, `${key}, key ${i}: the ${what} is turned ${angle(s.point, b.point).toFixed(2)} degrees from how it lies`);
      assert.ok(angle(s.across, b.across) < 0.1, `${key}, key ${i}: the ${what} is rolled ${angle(s.across, b.across).toFixed(2)} degrees from how it lies`);
    }
    assert.equal(changes, times, `${key}: it is taken up once${times === 2 ? ' and put away once' : ', and kept in hand'}`);
    assert.equal(move.rest.stow, 1, `${key}: it does not begin with the ${what} put away`);
  }
});

test('aimFor gives the three numbers that make a weapon lie along two given lines', () => {
  let seed = 7;
  const rnd = (): number => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 200; i++) {
    const point = heading(rnd() * 360 - 180, rnd() * 170 - 85);
    // (any line across it)
    const rough = norm([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], [0, 0, 1]);
    const across = norm(sub(rough, [point[0] * dot(rough, point), point[1] * dot(rough, point), point[2] * dot(rough, point)]), [1, 0, 0]);
    const a = aimFor(point, across);
    const p2 = heading(a.wAz, a.wEl);
    let flat: V3 = sub([0, 0, 1], [p2[0] * p2[2], p2[1] * p2[2], p2[2] * p2[2]]);
    flat = norm(flat, [-1, 0, 0]);
    const ac2 = about(flat, p2, a.wRoll);
    assert.ok(len(sub(p2, point)) < 1e-6 && len(sub(ac2, across)) < 1e-6, `try ${i}: asked for ${point} across ${across}, got ${p2} across ${ac2}`);
  }
});

test('the wind goes from nothing to nothing in a move played once, and whole turns in one that goes round', () => {
  for (const [key, move] of Object.entries(MOVES3)) {
    const end = endOf(key);
    const from = move.motion.loop;
    assert.ok(near(windAt(move, from ?? 0), 0), `${key}: the wind does not begin at nothing`);
    // (a hair before the end it has all but come round)
    const last = windAt(move, end - 1e-4);
    assert.ok(last > 0.99, `${key}: at its end the wind is at ${last}`);
    for (let t = from ?? 0; t < end; t += 1 / 30) assert.ok(windAt(move, t) >= 0 && windAt(move, t) < 1, `${key}: the wind at ${t}`);
  }
});

test('the light goes out of a hero who has fallen', () => {
  const glow = (s: { img: unknown }): number => {
    const p = paintingOf(s as never);
    let n = 0;
    // (the brightest tones of what glows on a hero, and of the edge of light round them)
    for (let i = 0; i < p.d.length; i += 4) {
      if (p.d[i + 3] === 0) continue;
      const c = (p.d[i] << 16) | (p.d[i + 1] << 8) | p.d[i + 2];
      if (c === 0x22d0e0 || c === 0x8af6f0 || c === 0xb8fff8) n++;
    }
    return n;
  };
  for (const cls of CLASS_IDS) {
    for (const view of VIEWS) {
      const fall = art.of(cls, DUNGEON)[view].clips?.fall;
      assert.ok(fall !== undefined, `${cls}: no fall`);
      if (!fall) continue;
      const first = fall.frames[0];
      const last = fall.frames[fall.frames.length - 1];
      assert.ok(glow(first) > 40, `${cls}, ${view}: nothing glows on them as they stand (${glow(first)})`);
      assert.equal(glow(last), 0, `${cls}, ${view}: something still glows on them when they have fallen`);
      assert.ok(first.aura !== undefined && last.aura === undefined, `${cls}, ${view}: the pool of light behind them`);
      assert.ok(!last.lights || last.lights.length === 0, `${cls}, ${view}: a fallen hero gives off light`);
    }
  }
});

test('a whirlwind that turns by itself is shown from the front, whichever way the rules have the hero facing', () => {
  const knight: ActorArt = art.of('warrior', DUNGEON);
  const whirl = knight.front.clips?.whirl;
  assert.ok(whirl !== undefined, 'no whirlwind');
  if (!whirl) return;
  // (facing down the screen, up it, and each of those to the left)
  for (const [fx, fy] of [[0.7071, 0.7071], [-0.7071, -0.7071], [-0.7071, 0.7071], [0.7071, -0.7071]] as const) {
    const fig = new Figure();
    for (const held of [0, 0.1, 0.2, 0.4]) {
      const s = fig.frame(knight, { anim: 'attack', animT: 0, fx, fy, attackSkill: 0, attackAge: 0.3 + held, attackWind: 0.12, leapK: -1, holdT: held, holdAs: 'whirl' }, 1 / 60, 0, 0);
      assert.ok(s === heldFrame(whirl, held), `facing ${fx}, ${fy}, held ${held} s: not the whirlwind's own frame, as painted`);
    }
    // (let go, and standing: he is seen from the side the rules have him facing again. Not tried
    // facing left: a picture is turned over for that on a canvas, and there is none here.)
    if (fx - fy < 0) continue;
    const after = fig.frame(knight, { anim: 'idle', animT: 0, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }, 1 / 60, 0, 0, false);
    assert.ok(after === (fx + fy < -0.2 ? knight.back : knight.front).idle[0], `facing ${fx}, ${fy}: after the whirlwind he is not seen as the rules have him facing`);
  }
});
