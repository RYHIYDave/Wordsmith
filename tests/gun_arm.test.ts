// THE TINKERER'S GUN ARM AND HER CONTRAPTION'S PICK (game/talents.ts, game/game.ts; the art chat's dev/golem_moves.ts GCHARGE
// and dev/contraption_shots.ts). His words to the art chat, 30 Oct 23:55 and 31 Oct 00:00 to 00:04; to the main chat, 31 Oct:
// “Turn Tesla Coil into it (Recommended)”, “On the talent itself (Recommended)”, “A weaker shot fires”. Here:
//   1. the Gun Arm stands where the Tesla Coil stood, with its pick of two; a save with the Tesla Coil has the Gun Arm;
//   2. the pick: the first as she takes it, switched on its card, kept in the save;
//   3. her Golem with the cannon stands off and fires from range; with the tesla coil, it zaps from range;
//   4. her hold: it braces and charges while she holds, fires as she lets go: held a second, all its might; let go at once, a
//      weaker shot once braced; the shell bursts round where she pointed; the beam strikes all along its line;
//   5. what they grow with: the cannon and the bombs Dexterity, the tesla coil and the energy Intelligence;
//   6. the Contraption's pick: BOMBS lob little bombs that go off a moment after they land; ENERGY fires bolts at the nearest.
//   run: tsx --test tests/gun_arm.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { TINKER_TUNE } from '../src/game/tinkerer';
import { TREES } from '../src/game/talents';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;
const C = TINKER_TUNE.golem.charge;

function room(seed = 3): Game {
  const g = Game.forPractice('tinkerer', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}
function take(g: Game, ...ids: string[]): Game {
  g.hero.talents = ['bombsaway', ...ids];
  g.refresh();
  return g;
}
function dummy(g: Game, dx: number, dy: number, awake = true): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  if (awake) a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}
const hurt = (m: Monster): number => m.maxLife - m.life;
function ready(g: Game): void {
  for (const s of g.hero.skills) {
    s.charges = s.maxCharges;
    s.cd = 0;
  }
}
function wait(g: Game, seconds: number, c: Controls = emptyControls()): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    ev.push(...g.events);
    g.events.length = 0;
  }
  return ev;
}
const of = <K extends GameEvent['t']>(ev: GameEvent[], t: K): Extract<GameEvent, { t: K }>[] => ev.filter((e) => e.t === t) as Extract<GameEvent, { t: K }>[];
/** Her hold pressed at (dx, dy) from her, held `secs` (the button down all the while, asking each step), then let go; what came of it in `after` more. */
function hold(g: Game, dx: number, dy: number, secs: number, after: number): GameEvent[] {
  ready(g);
  const c = emptyControls();
  c.castX = c.aimX = g.hero.x + dx;
  c.castY = c.aimY = g.hero.y + dy;
  c.cast = true;
  c.hold = true;
  const ev = wait(g, Math.max(DT, secs), c);
  c.cast = false;
  c.hold = false;
  return [...ev, ...wait(g, after, c)];
}
function golemOut(g: Game): void {
  hold(g, 3, 0, DT, TINKER_TUNE.golem.arrive + 0.05);
  for (const q of g.golems) q.punchCd = q.cannonCd = 1e9;
}

test('1. the Gun Arm stands where the Tesla Coil stood, with its pick; a save with the Tesla Coil has it', () => {
  const tree = TREES.tinkerer;
  const arm = tree.talents.find((t) => t.id === 'gunarm')!;
  assert.ok(arm && arm.pick && arm.pick.ids.join() === 'cannon,tesla');
  assert.deepEqual(arm.at, [0, 2]);
  assert.ok(!tree.talents.some((t) => t.id === 'teslacoil'));
  assert.deepEqual(tree.talents.find((t) => t.id === 'contraptions')!.pick!.ids, ['bombs', 'energy']);
  const g = take(room(), 'lightningrod', 'shrapnel', 'gunarm');
  g.hero.level = 30;
  const save = JSON.parse(JSON.stringify(g.save()).replace('"gunarm"', '"teslacoil"'));
  const g2 = Game.restore(save);
  assert.ok(g2.hero.talents.includes('gunarm'), 'the Tesla Coil taken before is the Gun Arm');
});

test('2. the pick: the first as she takes it, switched on its card, kept in the save', () => {
  const g = take(room(), 'lightningrod', 'shrapnel', 'gunarm');
  assert.equal(g.pickOf('gunarm'), 'cannon');
  assert.equal(g.armOf(), 'cannon');
  assert.equal(g.choosePick('gunarm', 'tesla'), null);
  assert.equal(g.armOf(), 'tesla');
  assert.equal(Game.restore(JSON.parse(JSON.stringify(g.save()))).pickOf('gunarm'), 'tesla', 'kept in the save');
  assert.ok(g.choosePick('gunarm', 'nonsense'));
  const g2 = take(room());
  assert.ok(g2.choosePick('gunarm', 'tesla'), 'not taken: nothing to switch');
  assert.equal(g2.armOf(), null);
});

test('3. with the cannon it stands off and fires from range; with the tesla coil it zaps from range', () => {
  for (const arm of ['cannon', 'tesla'] as const) {
    const g = take(room(), 'lightningrod', 'shrapnel', 'gunarm');
    g.choosePick('gunarm', arm);
    golemOut(g);
    for (const q of g.golems) q.cannonCd = 0;
    const gm = g.golem!;
    const m = dummy(g, gm.x - g.hero.x + 5.5, gm.y - g.hero.y);
    const from = { x: gm.x, y: gm.y };
    const ev = wait(g, 4);
    assert.ok(Math.hypot(gm.x - m.x, gm.y - m.y) > 3, `${arm}: it keeps off what it fights`);
    void from;
    assert.ok(hurt(m) > 0, `${arm}: and strikes it from there`);
    assert.ok(arm === 'cannon' ? of(ev, 'golemShot').length >= 1 : of(ev, 'teslaZap').length >= 2, `${arm}: its own shot`);
  }
});

test('4. her hold: braced and charging while held, firing as she lets go; held a second, all its might; let go at once, weaker', () => {
  const shot = (arm: 'cannon' | 'tesla', secs: number): { power: number; hurt: number; ev: GameEvent[] } => {
    const g = take(room(), 'lightningrod', 'shrapnel', 'gunarm');
    g.choosePick('gunarm', arm);
    golemOut(g);
    const gm = g.golem!;
    const m = dummy(g, gm.x - g.hero.x + 4, gm.y - g.hero.y);
    const ev = hold(g, m.x - g.hero.x, m.y - g.hero.y, secs, 2.5);
    const fired = of(ev, 'golemCharged');
    assert.equal(fired.length, 1, `${arm}, held ${secs}: one great shot`);
    assert.equal(fired[0].kind, arm === 'cannon' ? 'shell' : 'beam');
    return { power: fired[0].power, hurt: hurt(m), ev };
  };
  for (const arm of ['cannon', 'tesla'] as const) {
    const full = shot(arm, C.build + 0.3);
    const quick = shot(arm, 0.1);
    assert.equal(full.power, 1, `${arm}: held a second, all its might`);
    assert.ok(quick.power < 0.2, `${arm}: let go at once, little (${quick.power.toFixed(2)})`);
    assert.ok(full.hurt > quick.hurt * 1.8 && quick.hurt > 0, `${arm}: and weaker for it (${quick.hurt.toFixed(0)} to ${full.hurt.toFixed(0)})`);
    assert.ok(of(full.ev, 'golemCharge').length >= 1, `${arm}: braced and charging`);
  }
  // (the beam strikes all along its line)
  const g = take(room(), 'lightningrod', 'shrapnel', 'gunarm');
  g.choosePick('gunarm', 'tesla');
  golemOut(g);
  const gm = g.golem!;
  const line = [2.5, 4.5, 6.5].map((d) => dummy(g, gm.x - g.hero.x + d, gm.y - g.hero.y));
  const aside = dummy(g, gm.x - g.hero.x + 4, gm.y - g.hero.y + 3);
  for (const q of [...line, aside]) q.life = q.maxLife = 1e9;
  const before = line.map(hurt);
  hold(g, line[2].x - g.hero.x, line[2].y - g.hero.y, C.build + 0.1, 2);
  line.forEach((m, k) => assert.ok(hurt(m) > before[k], `the beam strikes the one ${[2.5, 4.5, 6.5][k]} out`));
});

test('5. what they grow with: the cannon and the bombs Dexterity, the tesla coil and the energy Intelligence', () => {
  for (const [talent, pick, attr, other] of [['gunarm', 'cannon', 'dex', 'int'], ['gunarm', 'tesla', 'int', 'dex'], ['contraptions', 'bombs', 'dex', 'int'], ['contraptions', 'energy', 'int', 'dex']] as const) {
    const g = take(room(), ...(talent === 'gunarm' ? ['lightningrod', 'shrapnel', 'gunarm'] : ['fortune', 'contraptions']));
    g.choosePick(talent, pick);
    const slot = talent === 'gunarm' ? 1 : 0;
    const base = g.hero.skills[slot].r.dmgMult;
    // (more of its attribute: a bigger hit; more of the other: none)
    const grow = (a: 'dex' | 'int'): number => {
      g.hero.attrs[a] += 100;
      g.refresh();
      const v = g.hero.skills[slot].r.dmgMult;
      g.hero.attrs[a] -= 100;
      g.refresh();
      return v;
    };
    assert.ok(grow(attr) > base, `${pick}: grows with ${attr}`);
    assert.ok(Math.abs(grow(other) - base) < 1e-9, `${pick}: not with ${other}`);
  }
});

test('6. the Contraption: BOMBS go off a moment after they land; ENERGY fires bolts at the nearest', () => {
  for (const pick of ['bombs', 'energy'] as const) {
    const g = take(room(), 'fortune', 'contraptions');
    g.choosePick('contraptions', pick);
    const m = dummy(g, 5, 0);
    ready(g);
    const c = emptyControls();
    c.aimX = c.castX = g.hero.x + 2;
    c.aimY = c.castY = g.hero.y;
    c.fire = true;
    g.update(DT, c);
    c.fire = false;
    const ev = wait(g, TINKER_TUNE.contraption.set + 3, c);
    assert.ok(hurt(m) > 0, `${pick}: it strikes`);
    if (pick === 'bombs') {
      const v = of(ev, 'vial');
      assert.ok(v.length >= 1 && v.every((e) => e.bomb !== undefined), 'little bombs in place of vials');
      assert.ok(of(ev, 'vialBurst').some((e) => e.bomb), 'that go off');
    } else {
      assert.ok(of(ev, 'contraptionBolt').length >= 2, 'bolts of energy');
      assert.equal(of(ev, 'vial').length, 0, 'and no vials');
    }
  }
});
