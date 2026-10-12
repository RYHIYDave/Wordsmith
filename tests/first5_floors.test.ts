// THE FIRST FIVE FLOORS: the floors themselves (game/ways.ts, the mine shaft; game/first5.ts, what each
// floor is laid with), held to the art chat's pictures and to the owner's words.
//   1. the shaft's times are its films' own
//   2. every fifth floor has the shaft at the back of its boss's hall, and no stairwell and no portal
//   3. the Fleshmancer dead, the cage comes down; no monster steps into it; walked into, it takes the
//      hero up to town, nothing touching him on the way, the Crypt cleared
//   4. the dead he raised fall with him
//   run: tsx --test tests/first5_floors.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { cageDown, cageUp } from '../src/art/shaft';
import { doorTiles } from '../src/game/doors';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { FIRST5, SHAFT, shaftTiles } from '../src/game/ways';
import { flowField } from '../src/game/nav';
import { paintWithoutCanvas, seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const near = (a: number, b: number, by: number, what: string): void => assert.ok(Math.abs(a - b) <= by, `${what}: ${a} against ${b}`);

/** A game on floor `depth` of the Crypt, the hero as he comes in. */
function floor(depth: number, seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 8);
  g.depth = depth;
  g.cleared = depth - 1;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

test('1. the shaft\'s times are its films\' own (art/shaft.ts)', () => {
  const down = cageDown().m;
  const up = cageUp().m;
  near(SHAFT.down, down.frames.length / down.fps, 1e-9, 'the cage coming down');
  assert.equal(SHAFT.downJolts.map((j) => Math.round(j * down.fps)).join(' '), down.jolts.join(' '), 'it strikes the catches, and bounces');
  near(SHAFT.up, up.frames.length / up.fps, 1e-9, 'the ride up');
  assert.equal(SHAFT.upJolts.map((j) => Math.round(j * up.fps)).join(' '), up.jolts.join(' '), 'its gate slams, its cable snaps taut');
  assert.equal(cageUp().layers.lift.length, up.frames.length, 'how far up it is, frame by frame');
});

test('2. every fifth floor: the shaft at the back of its boss\'s hall (three tiles by three of plain floor), its gate side open to the hall and reached from where he comes in; no stairwell, no portal', () => {
  assert.equal(FIRST5.on, true);
  for (let seed = 1; seed <= 40; seed++) {
    const g = floor(5, seed * 7919);
    const L = g.level;
    const f = L.floor;
    const W = L.ways!;
    const sh = W.shaft;
    const at = `seed ${seed * 7919}`;
    assert.ok(sh, `${at}: the shaft`);
    assert.equal(W.stair, null, `${at}: no stairwell`);
    assert.equal(W.stairs.length, 0, `${at}: nor places for one`);
    assert.equal(L.portal, null, `${at}: no portal`);
    const hall = f.rooms.find((r) => r.kind === 'boss')!;
    assert.ok(sh!.x - 1 >= hall.x && sh!.y - 1 >= hall.y && sh!.x + 1 < hall.x + hall.w && sh!.y + 1 < hall.y + hall.h, `${at}: in the boss's hall`);
    assert.ok(!L.props.some((p) => Math.abs(p.tx - sh!.x) <= 1 && Math.abs(p.ty - sh!.y) <= 1), `${at}: nothing stands or lies round it`);
    for (const i of [...shaftTiles(f, sh!), sh!.y * f.w + sh!.x]) assert.equal(L.walk[i], 0, `${at}: its timbers and its middle not walked on`);
    // (the hero reaches the tile before its gate: the cage is then walked into from there)
    const walk = L.walk.slice();
    for (const d of L.doors) for (const i of doorTiles(f, d.spot)) walk[i] = 1;
    const reach = flowField(walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, L.step);
    assert.ok(reach[(sh!.y + 1) * f.w + sh!.x] < 0xffff, `${at}: the way to its gate`);
    // (and the boss is the Fleshmancer)
    assert.equal(g.monsters.find((m) => m.boss)?.kind, 'fleshmancer', `${at}: his hall`);
  }
  // (and none on the floors above)
  for (let d = 1; d <= 4; d++) assert.equal(floor(d, 77).level.ways!.shaft ?? null, null, `floor ${d}: no shaft`);
});

test('3. the Fleshmancer dead, the cage comes down; no monster steps into it; walked into, it takes the hero up to town, nothing touching him on the way: the Crypt cleared', () => {
  const g = floor(5, 31337);
  const L = g.level;
  const f = L.floor;
  const sh = L.ways!.shaft!;
  const boss = g.monsters.find((m) => m.boss)!;
  g.hero.x = sh.x + 0.5;
  g.hero.y = sh.y + 3.5;
  g.kill(boss);
  g.events.length = 0;
  assert.equal(sh.state, 'coming', 'it comes down as he dies');
  const shakes: number[] = [];
  let t = 0;
  while (sh.state === 'coming' && t < 10) {
    g.update(1 / 60, emptyControls());
    t += 1 / 60;
    for (const e of g.events) if (e.t === 'shake') shakes.push(+t.toFixed(2));
    g.events.length = 0;
  }
  near(t, SHAFT.down, 0.05, 'down when its film is over');
  assert.ok(shakes.length >= 2 && Math.abs(shakes[0] - SHAFT.downJolts[0]) < 0.05, `the screen kicked as it strikes (${shakes.join(', ')})`);
  const i = sh.y * f.w + sh.x;
  assert.equal(L.walk[i], 1, 'its middle walked into now');
  assert.ok(L.shut && L.shut[i] === 1, 'but held against monsters, as a shut door is');
  for (const j of shaftTiles(f, sh)) assert.equal(L.walk[j], 0, 'its timbers still not');
  // (he walks into it, from before its gate)
  const cleared = g.cleared;
  g.hero.x = sh.x + 0.5;
  g.hero.y = sh.y + 1.6;
  const c = emptyControls();
  c.my = -1;
  let k = 0;
  while (!g.leaving && k++ < 120) g.update(1 / 60, c);
  assert.ok(g.leaving && g.leaving.to === 'up', 'walked into, it takes him up');
  assert.equal(sh.state, 'going');
  assert.ok(Math.abs(g.hero.x - (sh.x + 0.5)) < 1e-9 && Math.abs(g.hero.y - (sh.y + 0.5)) < 1e-9, 'standing in its middle');
  const life = g.hero.life;
  // (a monster at him as he goes)
  const o = g.spawn('skeleton', sh.x + 0.5, sh.y + 1.6, 0, 0, false, g.rng);
  g.monsters.push(o);
  let ride = 0;
  while (!g.level.town && ride < 10) {
    g.update(1 / 60, emptyControls());
    ride += 1 / 60;
  }
  near(ride, SHAFT.up, 0.05, 'up in the time of its film');
  assert.ok(g.level.town, 'in town');
  assert.equal(g.cleared, cleared + 1, 'the floor cleared');
  assert.ok(g.hero.life >= life, 'nothing touched him on the way up');
});

test('4. the dead the Fleshmancer raised fall with him, worth nothing; those of a pack of his own kind stand', () => {
  const g = floor(5, 4242);
  const boss = g.monsters.find((m) => m.boss)!;
  const mine = [0, 1, 2].map((k) => g.spawn('skeleton', boss.x + 1 + k * 0.6, boss.y + 1, boss.packId, 0, false, g.rng));
  const other = g.spawn('skeleton', boss.x - 2, boss.y + 1, 999, 0, false, g.rng);
  g.monsters.push(...mine, other);
  const kills = g.kills;
  const xp = g.hero.xp;
  g.kill(boss);
  assert.ok(mine.every((m) => m.dead), 'his raised dead fall');
  assert.ok(!other.dead, 'another skeleton stands');
  assert.equal(g.kills, kills + 1, 'only he is counted');
  assert.ok(g.hero.xp - xp <= boss.xp * 3, 'no more than his worth');
});
