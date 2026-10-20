// Bench: how long each of floors 11 to 15's ground takes to work out and to paint (the art chat, 20 Oct 2026).
//   npx tsx tools/bench_act2_ground.ts
import { ACT2 } from '../src/game/act1';
import { Game } from '../src/game/game';
import { paintTerrain } from '../src/art/terrain';
import { landTerrain, PIECE } from '../src/render/outdoor';
import { seasoned } from '../tests/helpers';

ACT2.on = true;
for (const d of [11, 12, 13, 14, 15]) {
  const g = seasoned(new Game('warrior', 3), 20);
  g.depth = d;
  g.enterDungeon();
  const L = g.level;
  const t0 = performance.now();
  const T = landTerrain(L.land!, L.floor);
  const tT = performance.now() - t0;
  const h = g.hero;
  const pi = Math.floor(((h.x - h.y) * 32) / PIECE);
  const pj = Math.floor(((h.x + h.y) * 16) / PIECE);
  const times: number[] = [];
  for (let j = pj - 3; j <= pj + 3; j++) for (let i = pi - 4; i <= pi + 4; i++) {
    const t1 = performance.now();
    paintTerrain(T, i * PIECE, j * PIECE, PIECE, PIECE);
    times.push(performance.now() - t1);
  }
  times.sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  console.log(`floor ${d} (${L.land!.kind}, ${L.floor.w} x ${L.floor.h}): terrain ${Math.round(tT)} ms; a piece ${Math.round(sum / times.length)} ms on average, ${Math.round(times[times.length - 1])} the most; the 63 round the hero ${Math.round(sum)} ms`);
}
