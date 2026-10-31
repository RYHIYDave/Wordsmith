// THE HIGH CITY, FLOOR 18: THE QUEEN, its boss (game/act1_rules/gqueen.ts, behind HIGH_CITY, off). Here:
//   1. she is built: her rules, pictures and what she casts; the boss of floor 18 with HIGH_CITY on; her four blows chosen (his
//      rulebook: a boss four), the comb first, each bigger one waiting longer; shorter waits each phase;
//   2. her hall as the art lays it on the floor: its twelve pier glasses inside the Mirror Hall, facing into it; Shatter's six lanes
//      and the gaps between them;
//   3. in a fight in her hall: she makes every one of her blows (the comb and its poison, Looking Glass out behind him,
//      Reflections stepping out of the awake glasses, more each phase, Shatter); another glass awake each phase; her mirror speaks;
//   4. as she dies, her poison goes and her mirror tells the truth.
//   run: tsx --test tests/act2_gqueen.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { AWAKE_ORDER, MIRROR_TRUTH, QUEEN_TUNE, RULES, hallAt, hallFrame, hallPeril, inLane, pierGlass, ringSpots } from '../src/game/act1_rules/gqueen';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { HALL_AT, HALL_MIRRORS } from '../src/art/queen_fx';
import { TILE3 } from '../src/art/new_mobs3';
import { bossKind } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const DT = 1 / 30;
function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
function onHerFloor(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 18;
  g.cleared = 17;
  g.wayDepth = 18;
  g.enterDungeon();
  return g;
}

test('1. built: the boss of floor 18; her five blows (four and the ring, at his word), the comb first, each bigger one waiting longer', () => {
  assert.ok(RULES && act1Rules('gqueen') && act1Fig('gqueen') && act1Fx('gqueen'));
  assert.notEqual(bossKind(18), 'gqueen', 'off: not her floor');
  high(() => assert.equal(bossKind(18), 'gqueen'));
  const chosen = RULES!.acts.filter((a) => !a.forced);
  // (her fifth, the ring of mirrors, at his word: “Add as a fifth move”)
  assert.deepEqual(chosen.map((a) => a.id), ['gqueen:comb', 'gqueen:glass', 'gqueen:reflect', 'gqueen:shatter', 'gqueen:ring']);
  assert.equal(chosen[0].cooldown, 0);
  for (let i = 1; i < chosen.length; i++) assert.ok(chosen[i].cooldown > chosen[i - 1].cooldown);
  assert.ok(QUEEN_TUNE.cd[0] > QUEEN_TUNE.cd[1] && QUEEN_TUNE.cd[1] > QUEEN_TUNE.cd[2], 'shorter waits each phase');
});

test('2. her hall on the floor: twelve pier glasses in it facing in; six lanes, the gaps between them safe', () => high(() => {
  for (const seed of [3, 8, 11]) {
    const g = onHerFloor(seed);
    const F = hallFrame(g)!;
    assert.ok(F, `${seed}: her hall`);
    const hall = g.level.land!.gallery!.rooms.find((q) => q.role === 'hall')!;
    for (let i = 0; i < HALL_MIRRORS.length; i++) {
      const p = pierGlass(F, i);
      assert.ok(p.x >= hall.r[0] && p.x <= hall.r[2] && p.y >= hall.r[1] && p.y <= hall.r[3], `${seed}: glass ${i} in the hall`);
      const inward = (F.x - p.x) * p.fx + (F.y - p.y) * p.fy;
      assert.ok(inward > 0, `${seed}: glass ${i} faces into the hall`);
    }
    for (const a of HALL_AT) {
      const c = hallAt(F, a * TILE3, 0);
      assert.ok(inLane(F, c.x, c.y), `${seed}: a lane at ${a}`);
      const gap = hallAt(F, (a + 1.5) * TILE3, 0);
      if (a < 7) assert.ok(!inLane(F, gap.x, gap.y), `${seed}: the gap after ${a} safe`);
    }
  }
}));

test('3-4. a fight in her hall: every blow; the glasses wake; her mirror speaks; dying, the truth', () => high(() => {
  const g = onHerFloor(3);
  const m = g.monsters.find((q) => q.kind === 'gqueen');
  assert.ok(m, 'she is on her floor');
  assert.ok(hallPeril(g), 'her hall stands before the fight');
  for (const q of g.monsters) if (q !== m) q.dead = true;
  const h = g.hero;
  h.x = m!.x - 4;
  h.y = m!.y + 1;
  h.invuln = 1e9;
  m!.state = 'chase';
  m!.life = m!.maxLife = 1e7;
  const seen = new Set<string>();
  let behind = 0;
  let clouds = 0;
  let mostCopies = 0;
  let said = 0;
  let awakeMost = 0;
  for (let k = 0; k < 80 / DT; k++) {
    if (k === Math.round(30 / DT)) m!.life = m!.maxLife * 0.5;
    if (k === Math.round(55 / DT)) m!.life = m!.maxLife * 0.2;
    const before = m!.act?.id ?? '';
    g.update(DT, emptyControls());
    const id = m!.act?.id ?? '';
    if (id) seen.add(id);
    if (before !== 'gqueen:out' && id === 'gqueen:out') {
      // (out of a glass behind him, facing him)
      const d = Math.hypot(m!.x - h.x, m!.y - h.y);
      if (d > 2 && d < 4.5 && (h.x - m!.x) * m!.fx + (h.y - m!.y) * m!.fy > 0) behind++;
    }
    clouds = Math.max(clouds, g.perils.filter((p) => p.a1 === 'gqueen:cloud').length);
    mostCopies = Math.max(mostCopies, g.monsters.filter((q) => !q.dead && q.kind === 'reflection').length);
    awakeMost = Math.max(awakeMost, hallPeril(g)!.a);
    if (g.events.some((e) => e.t === 'bossSay')) said++;
    // (his copies kept few, so that hers keep coming)
    for (const q of g.monsters) if (q.kind === 'reflection' && Math.random() < 0.004) q.dead = true;
  }
  for (const a of ['gqueen:comb', 'gqueen:glass', 'gqueen:out', 'gqueen:reflect', 'gqueen:shatter']) assert.ok(seen.has(a), `she made ${a}`);
  assert.ok(behind >= 1, 'out of a glass behind him, facing him');
  assert.ok(clouds >= 1, 'her poison where the comb struck');
  assert.ok(mostCopies >= 2, `his copies out of her glasses (${mostCopies})`);
  assert.equal(awakeMost, AWAKE_ORDER.length, 'a glass more awake each phase');
  assert.ok(said >= 3, `her mirror speaks through the fight (${said})`);
  // (dying: her poison gone, her mirror's truth)
  g.perils.push({ ...g.perils.find((p) => p.a1 === 'gqueen:hall')!, a1: 'gqueen:cloud', dur: 2, t: 0 });
  m!.life = 1;
  RULES!.died!(g.bosses, m!);
  assert.equal(g.perils.filter((p) => p.a1 === 'gqueen:cloud').length, 0, 'her poison gone');
  assert.equal(hallPeril(g)!.c, 2, 'her mirror tells the truth');
  assert.ok(g.events.some((e) => e.t === 'bossSay' && e.text === MIRROR_TRUTH), 'the truth said');
}));

/** Her gate fallen and her line said: she fights (game.ts bossWaits). */
function meet(g: Game, m: { act?: unknown }): void {
  const waits = (): boolean => (g as unknown as { bossWaits(q: unknown): boolean }).bossWaits(m);
  for (let k = 0; k < 12 / DT && waits(); k++) g.update(DT, emptyControls());
  assert.ok(!waits(), 'she fights');
  for (let k = 0; k < 3 / DT && m.act; k++) g.update(DT, emptyControls());
}

test('5. the ring of mirrors: her in one of six round him; found, she is stunned and takes more; not found in time, the whole ones strike', () => high(() => {
  const ringAct = RULES!.acts.find((a) => a.id === 'gqueen:ring')!;
  // (found)
  {
    const g = onHerFloor(3);
    const m = g.monsters.find((q) => q.kind === 'gqueen')!;
    for (const q of g.monsters) if (q !== m) q.dead = true;
    const h = g.hero;
    h.x = m.x - 3;
    h.y = m.y;
    h.invuln = 1e9;
    m.state = 'chase';
    meet(g, m);
    RULES!.end!(g.bosses, m, ringAct);
    const p = g.perils.find((q) => q.a1 === 'gqueen:ring')!;
    assert.ok(p, 'the ring risen');
    const spots = ringSpots(g, p);
    assert.equal(spots.length, QUEEN_TUNE.ring.n);
    for (const q of spots) assert.ok(Math.hypot(q.x - p.x, q.y - p.y) <= QUEEN_TUNE.ring.r + 0.01, 'round him');
    assert.ok(Math.hypot(m.x - spots[p.a].x, m.y - spots[p.a].y) < 0.01, 'she is in one of them');
    assert.equal(RULES!.reachable!({ ...m, act: { id: 'gqueen:inring', t: 0 } } as never), false, 'nothing reaches her in it');
    const other = (p.a + 1) % spots.length;
    g.bosses.floorBlow(spots[other].x, spots[other].y, 0.5, 'phys');
    assert.ok(p.b & (1 << other), 'a wrong one broken');
    assert.equal(p.c, 0, 'not found yet');
    g.bosses.floorBlow(spots[p.a].x, spots[p.a].y, 0.5, 'phys');
    assert.equal(p.c, 1, 'found');
    let stunned = false;
    for (let k = 0; k < 2 / DT; k++) {
      g.update(DT, emptyControls());
      if (m.act?.id === 'gqueen:stunned') stunned = true;
    }
    assert.ok(stunned, 'stunned');
    assert.ok((m.hexMore ?? 0) >= QUEEN_TUNE.ring.more && (m.hexT ?? 0) > 0, 'taking more from everything');
  }
  // (not found: the whole ones strike him at once)
  {
    const g = onHerFloor(3);
    const m = g.monsters.find((q) => q.kind === 'gqueen')!;
    for (const q of g.monsters) if (q !== m) q.dead = true;
    const h = g.hero;
    h.x = m.x - 3;
    h.y = m.y;
    h.invuln = 1e9;
    m.state = 'chase';
    meet(g, m);
    RULES!.end!(g.bosses, m, ringAct);
    const p = g.perils.find((q) => q.a1 === 'gqueen:ring')!;
    const spots = ringSpots(g, p);
    const wrong = [0, 1, 2, 3, 4, 5].filter((i) => i !== p.a).slice(0, 2);
    for (const i of wrong) g.bosses.floorBlow(spots[i].x, spots[i].y, 0.3, 'phys');
    // (what strikes him, counted, not taken: he would not live through it at his level here)
    const hits: number[] = [];
    (g as unknown as { hurtHero(raw: number): void }).hurtHero = (raw: number) => void hits.push(raw);
    let out = false;
    for (let k = 0; k < (QUEEN_TUNE.ring.long + 4) / DT; k++) {
      g.update(DT, emptyControls());
      if (m.act?.id === 'gqueen:out') out = true;
    }
    assert.equal(p.c, 2, 'its time ran out');
    const whole = spots.length - wrong.length;
    assert.ok(hits.some((v) => Math.abs(v - p.dmg * whole) < 1e-6), `the ${whole} whole ones struck him at once (${hits.join(', ')})`);
    assert.ok(out, 'she steps out of her glass');
  }
}));
