// THE HIGH CITY, FLOOR 18: THE QUEEN'S GUARD, the mirror duellists (game/act1_rules/qguard.ts, behind HIGH_CITY, off). Here:
//   1. built: their rules, pictures and effects; their glide the art's; the slash, the fan, the steps through the glass;
//   2. the X before them and not beside or behind; the fan's five shards out along their ways;
//   3. in a fight: far off, they step into the glass and out beside him (not there between, nothing harming them); they slash
//      and throw, and strike.
//   run: tsx --test tests/act2_qguard.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { QGUARD_TUNE, RULES, inX, shardAt } from '../src/game/act1_rules/qguard';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { QG_GLIDE } from '../src/art/queens_guard_moves';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
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

test('1. built: rules, pictures, effects; the glide; the slash, the fan, the steps through the glass', () => high(() => {
  assert.ok(RULES && act1Rules('qguard') && act1Fig('qguard') && act1Fx('qguard'));
  assert.equal(RULES!.gait.pace, QG_GLIDE);
  assert.deepEqual(RULES!.acts.map((a) => a.id), ['qguard:slash', 'qguard:fan', 'qguard:stepIn', 'qguard:stepOut']);
}));

test('2. the X before them; the fan\'s shards out along their ways', () => {
  assert.ok(inX(0, 0, 1, 0, 1.2, 0) && inX(0, 0, 1, 0, 1.8, 0.7));
  assert.ok(!inX(0, 0, 1, 0, -1, 0) && !inX(0, 0, 1, 0, 1.2, 2) && !inX(0, 0, 1, 0, 3, 0));
  const mid = shardAt(0, 0, 1, 0, 2, 0.2)!;
  assert.ok(Math.abs(mid.y) < 1e-9 && mid.x > 3, 'the middle one straight ahead');
  assert.ok(shardAt(0, 0, 1, 0, 0, 0.2)!.y < -1 && shardAt(0, 0, 1, 0, 4, 0.2)!.y > 1, 'the outer ones out to either side');
  assert.equal(shardAt(0, 0, 1, 0, 2, 5), null, 'gone past its range');
});

test('3. in a fight: far off, they step through the glass to beside him; they slash and throw, and strike', () => high(() => {
  const g = new Game('warrior', 4);
  g.depth = 18;
  g.cleared = 17;
  g.wayDepth = 18;
  g.enterDungeon();
  for (const q of g.monsters) q.dead = true;
  g.monsters = g.monsters.filter((q) => !q.dead);
  const h = g.hero;
  let at: { x: number; y: number } | null = null;
  for (let dy = -8; dy <= 8 && !at; dy++) for (let dx = -8; dx <= 8 && !at; dx++) if (g.isOpen(h.x + dx, h.y + dy) && Math.hypot(dx, dy) >= 6 && Math.hypot(dx, dy) <= 7 && g.sees(h.x, h.y, h.x + dx, h.y + dy)) at = { x: h.x + dx, y: h.y + dy };
  const m = g.spawn('qguard', at!.x, at!.y, 970, 0, false, g.rng) as Monster;
  m.words = [];
  m.life = m.maxLife = 1e6;
  m.state = 'chase';
  h.life = h.d.maxLife = 1e7;
  const seen = new Set<string>();
  let away = false;
  let stepped = false;
  for (let k = 0; k < 30 / DT; k++) {
    // (he steps back off them now and then, so they step through the glass again, and throw)
    if (k % Math.round(8 / DT) === Math.round(4 / DT)) {
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      const nx = m.x + ((h.x - m.x) / d) * 6;
      const ny = m.y + ((h.y - m.y) / d) * 6;
      if (g.isOpen(nx, ny)) {
        h.x = nx;
        h.y = ny;
      }
    }
    const was = Math.hypot(h.x - m.x, h.y - m.y);
    g.update(DT, emptyControls());
    if (m.act) seen.add(m.act.id);
    if (!RULES!.reachable!(m)) away = true;
    if (was > QGUARD_TUNE.step && Math.hypot(h.x - m.x, h.y - m.y) < 2.5) stepped = true;
  }
  for (const a of ['qguard:slash', 'qguard:stepIn', 'qguard:stepOut']) assert.ok(seen.has(a), `${a} made (${[...seen].join(', ')})`);
  assert.ok(away, 'through the glass, not there');
  assert.ok(stepped, 'out of it beside him');
  assert.ok(h.life < h.d.maxLife, 'they struck');
}));
