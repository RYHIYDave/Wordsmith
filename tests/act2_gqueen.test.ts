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
import { AWAKE_ORDER, MIRROR_TRUTH, QUEEN_TUNE, RULES, hallAt, hallFrame, hallPeril, inLane, pierGlass } from '../src/game/act1_rules/gqueen';
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

test('1. built: the boss of floor 18; her four blows, the comb first, each bigger one waiting longer', () => {
  assert.ok(RULES && act1Rules('gqueen') && act1Fig('gqueen') && act1Fx('gqueen'));
  assert.notEqual(bossKind(18), 'gqueen', 'off: not her floor');
  high(() => assert.equal(bossKind(18), 'gqueen'));
  const chosen = RULES!.acts.filter((a) => !a.forced);
  assert.deepEqual(chosen.map((a) => a.id), ['gqueen:comb', 'gqueen:glass', 'gqueen:reflect', 'gqueen:shatter']);
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
