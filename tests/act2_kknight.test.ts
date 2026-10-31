// THE HIGH CITY, FLOOR 19: THE KING'S KNIGHTS (game/act1_rules/kknight.ts, behind HIGH_CITY, off). Here:
//   1. built: their rules, pictures and effects; their pace the art's; their sweep and cleave; in floor 19's packs one at a
//      time (his “Huge and slow, one each”), two in their lair;
//   2. the sweep strikes before him to its reach and not behind; the crack along its line, to eight tiles, and not beside it;
//   3. in a fight he makes both, and they strike.
//   run: tsx --test tests/act2_kknight.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { KNIGHT_TUNE, RULES, inSweep, onCrack } from '../src/game/act1_rules/kknight';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { KN_PACE } from '../src/art/kings_knights_moves';
import { act2Pack } from '../src/game/act2_mobs';
import { RNG } from '../src/engine/rng';
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

test('1. built: rules, pictures, effects; his pace; one at a time, two in their lair', () => high(() => {
  assert.ok(RULES && act1Rules('kknight') && act1Fig('kknight') && act1Fx('kknight'));
  assert.equal(RULES!.gait.pace, KN_PACE);
  assert.deepEqual(RULES!.acts.map((a) => a.id), ['kknight:sweep', 'kknight:cleave']);
  const rng = new RNG(5);
  let knights = 0;
  for (let i = 0; i < 300; i++) {
    const p = act2Pack(19, rng, 'normal');
    if (p.kind === 'kknight') {
      knights++;
      assert.equal(p.size, KNIGHT_TUNE.pack, 'one at a time');
    }
  }
  assert.ok(knights > 10, `knights among floor 19's packs (${knights})`);
  assert.deepEqual(act2Pack(19, rng, 'champion'), { kind: 'kknight', size: KNIGHT_TUNE.lair }, 'two in their lair');
}));

test('2. the sweep before him and not behind; the crack along its line and not beside it', () => {
  assert.ok(inSweep(0, 0, 1, 0, 4, 0) && inSweep(0, 0, 1, 0, 0.5, 3.5) && inSweep(0, 0, 1, 0, 0.3, -3.5), 'before him, and to either side');
  assert.ok(!inSweep(0, 0, 1, 0, -3, 0) && !inSweep(0, 0, 1, 0, 5, 0), 'not behind him, nor beyond its reach');
  assert.ok(onCrack(0, 0, 1, 0, 7.5, 0.6) && onCrack(0, 0, 1, 0, 3, -0.9), 'on its line, to eight tiles');
  assert.ok(!onCrack(0, 0, 1, 0, 4, 2) && !onCrack(0, 0, 1, 0, 9, 0) && !onCrack(0, 0, 1, 0, -1, 0), 'not beside it, beyond it or behind him');
});

test('3. in a fight he makes both, and they strike', () => high(() => {
  const g = new Game('warrior', 4);
  g.depth = 19;
  g.cleared = 18;
  g.wayDepth = 19;
  g.enterDungeon();
  for (const q of g.monsters) q.dead = true;
  g.monsters = g.monsters.filter((q) => !q.dead);
  const h = g.hero;
  // (a knight four tiles off him, on open floor)
  let at: { x: number; y: number } | null = null;
  for (let dy = -6; dy <= 6 && !at; dy++) for (let dx = -6; dx <= 6 && !at; dx++) if (g.isOpen(h.x + dx, h.y + dy) && Math.hypot(dx, dy) >= 4 && Math.hypot(dx, dy) <= 5) at = { x: h.x + dx, y: h.y + dy };
  const m = g.spawn('kknight', at!.x, at!.y, 970, 0, false, g.rng) as Monster;
  m.words = [];
  m.life = m.maxLife = 1e6;
  m.state = 'chase';
  h.life = h.d.maxLife = 1e7;
  const seen = new Set<string>();
  for (let k = 0; k < 40 / DT; k++) {
    // (he stands, then steps back a few tiles now and then, so both are made)
    if (k % Math.round(6 / DT) === 0) {
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      const nx = m.x + ((h.x - m.x) / d) * 5;
      const ny = m.y + ((h.y - m.y) / d) * 5;
      if (g.isOpen(nx, ny)) {
        h.x = nx;
        h.y = ny;
      }
    }
    g.update(DT, emptyControls());
    if (m.act) seen.add(m.act.id);
  }
  assert.ok(seen.has('kknight:sweep') && seen.has('kknight:cleave'), `both made (${[...seen].join(', ')})`);
  assert.ok(h.life < h.d.maxLife, 'and they struck');
}));
