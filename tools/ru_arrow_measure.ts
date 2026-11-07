// THE RANGER BROUGHT UP: where his arrow is on the string the frame before it goes (art/ranger_up_moves.ts RU_SHOT3, RU_VOLLEY3),
// measured as tests/ranger_stances.test.ts measures the game's knight-era ranger, for game/defs.ts RANGER_ARROW.
//   npx tsx tools/ru_arrow_measure.ts
import { UNITS_PER_TILE, arrowTip } from '../src/art/moves3';
import { RU_SHOT3, RU_VOLLEY3, RU_SHOT_HIT, RU_VOLLEY_HIT } from '../src/art/ranger_up_moves';
for (const [key, m, hit] of [['shot', RU_SHOT3, RU_SHOT_HIT], ['volley', RU_VOLLEY3, RU_VOLLEY_HIT]] as const) {
  const t = Math.round(hit * 30 - 1) / 30;
  const tip = arrowTip(m, t);
  console.log(key, 'hit', hit, 'frame before', t.toFixed(3), 'ahead', (tip[0] / UNITS_PER_TILE).toFixed(3), 'tiles; up', (tip[2] / 2).toFixed(2), 'game px; across', (tip[1]).toFixed(2));
}
