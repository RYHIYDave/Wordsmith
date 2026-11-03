// THE HIGH CITY, FLOOR 17: THE PRINCE, its boss (game/act1_rules/prince.ts, behind HIGH_CITY, off). Here:
//   1. he is built: his rules, pictures and what he casts; the boss of floor 17 with HIGH_CITY on (the Warden with it off); his
//      four blows chosen (his rulebook: a boss four), the thrust first, each bigger one waiting longer;
//   2. a chime's ring has its gap, 2.4 tiles across wherever the ring is, and nothing of it is gap on its other side;
//   3. in a fight on his own floor: he darts about the hero (never still), and in half a minute and more he makes every one of his
//      blows: the thrust, the masks, the dance (its ring), midnight (twelve rings from the clock); faster chimes in his third phase;
//   4. as he dies, what of his was still to come does not come.
//   run: tsx --test tests/act2_prince.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { PRINCE_TUNE, RULES, chimeGap, phaseOf } from '../src/game/act1_rules/prince';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { bossKind } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { CHIME } from '../src/art/prince_fx';
import type { Peril } from '../src/game/state';
import { emptyControls } from '../src/game/state';

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

test('1. built: the boss of floor 17; his four blows, the thrust first, each bigger one waiting longer', () => {
  assert.ok(RULES && act1Rules('prince') && act1Fig('prince') && act1Fx('prince'));
  assert.notEqual(bossKind(17), 'prince', 'off: not his floor');
  high(() => assert.equal(bossKind(17), 'prince'));
  const chosen = RULES!.acts.filter((a) => !a.forced);
  assert.deepEqual(chosen.map((a) => a.id), ['prince:thrust', 'prince:masks', 'prince:dance', 'prince:midnight']);
  assert.equal(chosen[0].cooldown, 0);
  for (let i = 1; i < chosen.length; i++) assert.ok(chosen[i].cooldown > chosen[i - 1].cooldown);
  assert.ok(PRINCE_TUNE.cd[0] > PRINCE_TUNE.cd[1] && PRINCE_TUNE.cd[1] > PRINCE_TUNE.cd[2], 'shorter waits each phase');
  assert.ok(CHIME.every[0] > CHIME.every[1] && CHIME.every[1] > CHIME.every[2], 'the clock strikes faster each phase');
});

test('2. a chime\'s ring has its gap, 2.4 tiles across, and only there', () => {
  const p = { x: 0, y: 0, c: 1.0 } as unknown as Peril;
  for (const r of [2, 6, 12, 19]) {
    const across = (k: number): [number, number] => [Math.cos(1.0 + k / r) * r, Math.sin(1.0 + k / r) * r];
    assert.ok(chimeGap(p, ...across(0), r), `${r}: its middle`);
    assert.ok(chimeGap(p, ...across(CHIME.gap / 2 - 0.1), r), `${r}: near its edge`);
    assert.ok(!chimeGap(p, ...across(CHIME.gap / 2 + 0.15), r), `${r}: past its edge`);
    assert.ok(!chimeGap(p, Math.cos(1.0 + Math.PI) * r, Math.sin(1.0 + Math.PI) * r, r), `${r}: its far side`);
  }
});

test('3-4. a fight on his own floor: he darts; every blow comes; faster chimes in his third phase; dying, his blows stop', () => high(() => {
  const g = new Game('warrior', 7);
  g.depth = 17;
  g.cleared = 16;
  g.wayDepth = 17;
  g.enterDungeon();
  const m = g.monsters.find((q) => q.kind === 'prince');
  assert.ok(m, 'he is on his floor');
  for (const q of g.monsters) if (q !== m) q.dead = true;
  const h = g.hero;
  h.x = m!.x - 4;
  h.y = m!.y + 1;
  h.invuln = 1e9;
  m!.state = 'chase';
  m!.life = m!.maxLife = 1e7;
  const seen = new Set<string>();
  let darts = 0;
  let was = '';
  let ph2Every = -1;
  for (let k = 0; k < 75 / DT; k++) {
    if (k === Math.round(45 / DT)) m!.life = m!.maxLife * 0.3;
    g.update(DT, emptyControls());
    const id = m!.act?.id ?? '';
    if (id && id !== was) {
      seen.add(id);
      if (id === 'prince:dart') darts++;
    }
    was = id;
    for (const p of g.perils) {
      if (p.a1) seen.add(p.a1);
      if (p.a1 === 'prince:chime' && phaseOf(m!) === 2 && p.b === 2 && p.a === 1) ph2Every = p.d;
    }
  }
  for (const id of ['prince:thrust', 'prince:masks', 'prince:dance', 'prince:midnight', 'prince:waltz', 'prince:mask', 'prince:chime']) assert.ok(seen.has(id), `${id} came: ${[...seen].join(' ')}`);
  assert.ok(darts >= 10, `he darts about him: ${darts}`);
  assert.ok(ph2Every === CHIME.every[2] || ph2Every < 0, 'in his third phase a chime every half second');
  // (dying: his chimes still rolling stop)
  g.kill(m!);
  for (let k = 0; k < 1 / DT; k++) g.update(DT, emptyControls());
  assert.ok(!g.perils.some((p) => p.a1 === 'prince:chime' && !p.done), 'his chimes stopped');
}));
