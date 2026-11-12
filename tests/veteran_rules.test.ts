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
import { VETERAN, VET_MOVES, vetMoveFor, vetWalkable } from '../src/game/veteran';
import type { VetBlowId, VetInput } from '../src/game/veteran';
import { EIGHT_MORE } from '../src/art/sides_more';

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

test('heavy: a move is played whole, its wind-up held; he walks himself in it only at a share of his pace (25.0.2, his word: until then not at all)', () =>
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
    const walked = g.hero.y - 15.5;
    assert.ok(walked > 0.05 && walked < 0.2 * 4.6 * 0.8, `walked a little in its wind-up: ${walked.toFixed(2)} tiles`);
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

// (25.0's “the tap stopped working”: the quick attack HELD, as ONE HAND throws it by itself while an enemy is in reach, or a pad's
// trigger or the mouse held down, went in once and no more)
test('an attack held: his punches keep going in, combo after combo, as taps in time would; a kick held likewise', () => withVet(() => {
  for (const [what, i] of [['fire', 0], ['cast', 1]] as const) {
    const g = room();
    const m = dummy(g, 1.6, 0);
    for (let k = 0; k < 60 * 5; k++) {
      const c = emptyControls();
      c.aimX = c.castX = m.x;
      c.aimY = c.castY = m.y;
      c[what] = true;
      g.update(DT, c);
    }
    assert.ok(g.hero.skills[i].uses >= 5, `${what} held five seconds: ${g.hero.skills[i].uses} went in`);
    assert.ok(hurt(m) > 0, 'and they landed');
  }
}));

// (25.0.1: what he found playing 25.0, 3 Nov 2026, 19:05 to 20:02: “the tap stopped working”; “tapping didn’t do anything to fill
// the globes until I input a kick”; “It happened when I took a lot of damage”; “Can’t cancel a combo” while “getting wailed on”;
// “the auto aim is really bad, I spend most of the time attacking the wrong direction”)
const vin = (g: Game): { tap: boolean; hold: boolean; fireWas: boolean; castWas: boolean } => (g as unknown as { vetIn: { tap: boolean; hold: boolean; fireWas: boolean; castWas: boolean } }).vetIn;
const ctl = (ax: number, ay: number, more: Partial<Controls> = {}): Controls => ({ ...emptyControls(), aimX: ax, aimY: ay, castX: ax, castY: ay, ...more });

test('25.0.1: a tap still asked for when the last one went in, with no frame between them, goes in (it went in never)', () => withVet(() => {
  const g = room();
  const m = dummy(g, 1.6, 0);
  // (the attack asked for, unbroken from the last ask: as a phone's tap that came while the one before it still stood)
  vin(g).fireWas = true;
  vin(g).tap = false;
  const u0 = g.hero.skills[0].uses;
  g.update(DT, ctl(m.x, m.y, { fire: true }));
  assert.equal(g.hero.skills[0].uses, u0 + 1, 'it went in');
  assert.deepEqual(g.hero.vet!.globes, ['punch']);
}));

test('25.0.1: a touch on his globes (c.change) cancels his combo, locked or not: the move cut short, the rest let go, the globes out', () => withVet(() => {
  const g = room();
  const m = dummy(g, 1.6, 0);
  presses(g, 'ttt', m.x, m.y, 0.1);
  const v = g.hero.vet!;
  assert.equal(v.globes.length, 3, 'locked');
  assert.ok(v.move && v.move.id !== 'dodge', 'a blow being played');
  g.update(DT, ctl(m.x, m.y, { change: true }));
  assert.equal(v.move, null, 'cut short');
  assert.equal(v.queue.length, 0);
  assert.equal(v.globes.length, 0, 'the globes out');
  // (and he is free: a tap now is the first of a new combo)
  presses(g, 't', m.x, m.y, 0.05);
  assert.deepEqual(v.globes, ['punch']);
}));

test('25.0.1: a swipe with his jump ready breaks a locked combo and he jumps out at once; with none, “No jump” and the combo goes on', () => withVet(() => {
  {
    const g = room();
    const m = dummy(g, 1.6, 0);
    presses(g, 'ttt', m.x, m.y, 0.1);
    const v = g.hero.vet!;
    assert.equal(v.globes.length, 3);
    const charges = g.hero.skills[2].charges;
    g.update(DT, ctl(m.x, m.y, { evade: true, evadeX: g.hero.x - 3, evadeY: g.hero.y }));
    assert.equal(v.move?.id, 'dodge', 'jumping out now');
    assert.deepEqual(v.globes, ['jump']);
    assert.equal(g.hero.skills[2].charges, charges - 1, 'the jump spent');
  }
  {
    const g = room();
    const m = dummy(g, 1.6, 0);
    presses(g, 'ttt', m.x, m.y, 0.1);
    const v = g.hero.vet!;
    g.hero.skills[2].charges = 0;
    g.hero.skills[2].cd = 9;
    const was = v.move?.id;
    g.update(DT, ctl(m.x, m.y, { evade: true, evadeX: g.hero.x - 3, evadeY: g.hero.y }));
    assert.equal(v.globes.length, 3, 'still locked');
    assert.equal(v.move?.id, was, 'its blow goes on');
  }
}));

test('25.0.1: each blow goes straight at what it was aimed at, though his picture faces the nearest of his eight ways (of his four, his eight sides off)', () => withVet(() => {
  // (an enemy off the nearest of his ways, a tile and a half off: struck. From eight sides, art/sides_more.ts EIGHT_MORE.brawler,
  // on since 11 Nov 2026, his picture is at most 22.5 degrees off it; with that off, of his four ways, at most 45)
  const eightWas = EIGHT_MORE.brawler;
  assert.equal(eightWas, true, 'his eight sides are on in the game');
  try {
    for (const eight of [true, false]) {
      EIGHT_MORE.brawler = eight;
      for (const deg of [-40, -25, -20, 20, 25, 40]) {
        const g = room();
        const a = (deg * Math.PI) / 180;
        const m = dummy(g, 1.5 * Math.cos(a), 1.5 * Math.sin(a));
        presses(g, 't', m.x, m.y, 1.0);
        assert.ok(hurt(m) > 0, `${eight ? 'eight ways' : 'four ways'}, ${deg} degrees off: the jab lands`);
      }
    }
  } finally {
    EIGHT_MORE.brawler = eightWas;
  }
  // (the second and third of a combo at where their enemy is now, not the way he happened to face)
  const g = room();
  const m = dummy(g, 1.6, 0);
  presses(g, 't', m.x, m.y, 0.02);
  presses(g, 't', m.x, m.y, 0.02);
  // (it is carried round to his other side before the cross begins)
  m.x = g.hero.x - 1.2;
  m.y = g.hero.y + 1.0;
  const before = hurt(m);
  presses(g, '', m.x, m.y, 1.5);
  assert.ok(hurt(m) > before, 'the cross went round to it, where it is now');
  // (its enemy fallen before its move begins: it goes at the nearest in his reach)
  const g2 = room();
  const a2 = dummy(g2, 1.6, 0, 1);
  const b2 = dummy(g2, -1.4, 0.6);
  presses(g2, 'tt', a2.x, a2.y, 2.0);
  assert.ok(a2.dead || a2.life <= 0, 'the first one down');
  assert.ok(hurt(b2) > 0, 'the cross went on to the other one');
}));

test('25.0.1: the first levels: his hold and swipe not before their levels, as every hero\'s', () => withVet(() => {
  const g = room();
  const m = dummy(g, 1.6, 0);
  const open = g as unknown as { moveOpen(i: number): boolean };
  const was = open.moveOpen.bind(g);
  open.moveOpen = (i: number) => i === 0;
  try {
    const k0 = g.hero.skills[1].uses;
    g.update(DT, ctl(m.x, m.y, { cast: true }));
    g.update(DT, ctl(m.x, m.y));
    g.update(DT, ctl(m.x, m.y, { evade: true, evadeX: g.hero.x - 3, evadeY: g.hero.y }));
    assert.equal(g.hero.skills[1].uses, k0, 'no kick');
    assert.deepEqual(g.hero.vet!.globes, [], 'no globe');
  } finally {
    open.moveOpen = was;
  }
}));

// (25.0.2: his word, 3 Nov 2026, 20:52: “can i get the ability to move around during the windups and wind downs of the hits?  that
// would probably help”)
test('25.0.2: he walks himself in a blow\'s wind-up and wind-down, at a share of his pace, not as it goes out; and it goes out from where he is', () => withVet(() => {
  const S = VET_MOVES.jab.strike!;
  // (frames: walkable before its strike, not as it goes out, walkable after; never in the dodge, nor in the air)
  assert.ok(vetWalkable('jab', S.from - 1) && !vetWalkable('jab', S.from) && !vetWalkable('jab', S.at + 1) && vetWalkable('jab', VET_MOVES.jab.long - 1));
  assert.ok(!vetWalkable('dodge', 5));
  const air = VET_MOVES.knee.air!;
  assert.ok(!vetWalkable('knee', (air[0] + air[1]) / 2));
  // (an enemy out of his jab's reach where he stands: walked toward through its wind-up, it is struck; standing, it is not)
  const out = (walk: boolean): number => {
    const g = room();
    const m = dummy(g, 3.6, 0);
    const c0 = ctl(m.x, m.y, { fire: true });
    g.update(DT, c0);
    for (let k = 0; k < 60; k++) g.update(DT, ctl(m.x, m.y, walk ? { mx: 1, my: 0 } : {}));
    return hurt(m);
  };
  assert.equal(out(false), 0, 'standing: out of reach');
  assert.ok(out(true) > 0, 'walked in through its wind-up: struck');
  // (walking during its strike frames carries him no further than the art's own step)
  const g = room();
  const m = dummy(g, 1.6, 0);
  g.update(DT, ctl(m.x, m.y, { fire: true }));
  const mv = g.hero.vet!.move!;
  while (mv.f < S.from) g.update(DT, ctl(m.x, m.y));
  const wx0 = mv.wx ?? 0;
  for (let k = 0; k < 3; k++) g.update(DT, ctl(m.x, m.y, { mx: 0, my: 1 }));
  assert.equal(mv.wx ?? 0, wx0, 'not walked as it goes out');
}));
