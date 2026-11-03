// THE NEW ENEMY MOVES, FLOORS 5 TO 19, SWITCHED ON TOGETHER (game/enemy_moves.ts): his “Yes, switch them on (Recommended)”, 2 Nov 2026.
//   1. on, by his word; every one of them, the Fleshmancer's two with them, put on and off together;
//   2. the game puts them on as it starts, before anything else of it runs (main.ts; the painter's worker runs the same script).
//   run: tsx --test tests/enemy_moves.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { ENEMY_MOVES, ENEMY_SWITCHES, useEnemyMoves } from '../src/game/enemy_moves';
import { FM_ACTION } from '../src/game/fm_action';
import { FLESH_ACTION } from '../src/art/fleshmancer_action';
import { PHYSICIAN_ACTION } from '../src/art/physician_action';
import { KNIGHT_BANNER } from '../src/art/action_f16_knight';
import { QUEEN_ACTION } from '../src/art/carrion_queen_action';
import { CHAINED_LOOK } from '../src/art/chained_look';
import { CO_LOOK } from '../src/game/bosses';

test('1. on, by his word; every one of them put on and off together', () => {
  assert.equal(ENEMY_MOVES.on, true, 'his “Yes, switch them on (Recommended)”');
  assert.equal(ENEMY_SWITCHES.length, 22);
  for (const sw of [PHYSICIAN_ACTION, KNIGHT_BANNER, QUEEN_ACTION]) assert.ok(ENEMY_SWITCHES.includes(sw));
  const was = ENEMY_SWITCHES.map((s) => s.on);
  const fm = [FM_ACTION.on, FLESH_ACTION.on];
  try {
    useEnemyMoves(true);
    for (const s of ENEMY_SWITCHES) assert.equal(s.on, true);
    assert.ok(FM_ACTION.on && FLESH_ACTION.on, 'the Fleshmancer\'s two with them');
    assert.ok(CHAINED_LOOK.on && CO_LOOK.on, 'and the Chained One\'s new body (his “Yes, both in (Recommended)”)');
    useEnemyMoves(false);
    assert.ok(!CHAINED_LOOK.on && !CO_LOOK.on);
    for (const s of ENEMY_SWITCHES) assert.equal(s.on, false);
  } finally {
    ENEMY_SWITCHES.forEach((s, i) => (s.on = was[i]));
    FM_ACTION.on = fm[0];
    FLESH_ACTION.on = fm[1];
  }
});

test('2. the game puts them on as it starts, before it boots or paints', () => {
  const src = (fs as { readFileSync(p: string, e: string): string }).readFileSync('src/main.ts', 'utf8');
  const on = src.indexOf('useEnemyMoves(ENEMY_MOVES.on);');
  assert.ok(on > 0, 'main.ts puts them on');
  assert.ok(on < src.indexOf('paintWorkerMain();\nelse boot();'), 'before the game or its painter starts');
});
