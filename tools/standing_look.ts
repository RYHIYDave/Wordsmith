// The ground and the walls standing whole (art/standing.ts), composed, round the hero's start on a floor (the art chat, 20 Oct 2026):
//   npx tsx tools/standing_look.ts <depth> <out prefix> <thick: 0 for all of it> -> <out>_now.raw, <out>_whole.raw (RGBA), <out>.json
import { writeFileSync } from 'node:fs';
import { ACT2 } from '../src/game/act1';
import { Game } from '../src/game/game';
import { paintTerrain } from '../src/art/terrain';
import { nearOf, paintStanding, standingOf } from '../src/art/standing';
import { landTerrain } from '../src/render/outdoor';
import { seasoned } from '../tests/helpers';
ACT2.on = true;
const d = Number(process.argv[2] ?? 15);
const out = process.argv[3];
const thick = Number(process.argv[4] ?? 1);
const W = 1100, H = 640;
const g = seasoned(new Game('warrior', 3), 20);
g.depth = d;
g.enterDungeon();
const T = landTerrain(g.level.land!, g.level.floor, true);
const h = g.hero;
const cx = Math.round((h.x - h.y) * 32), cy = Math.round((h.x + h.y) * 16);
const x0 = cx - W / 2, y0 = cy - H / 2;
const a = paintTerrain(T, x0, y0, W, H);
const stands = standingOf(T, thick > 0 ? thick : Infinity);
const t0 = performance.now();
const b = paintStanding(T, stands, x0, y0, W, H, nearOf(T, thick > 0 ? thick : Infinity));
console.log('standing', Math.round(performance.now() - t0), 'ms');
const both = new Uint8ClampedArray(W * H * 4);
const ground = new Uint8ClampedArray(W * H * 4);
for (let i = 0; i < W * H * 4; i += 4) {
  const s = b.rgba[i + 3] > 0 ? b.rgba : a.rgba;
  both[i] = s[i]; both[i + 1] = s[i + 1]; both[i + 2] = s[i + 2]; both[i + 3] = 255;
  ground[i] = a.rgba[i]; ground[i + 1] = a.rgba[i + 1]; ground[i + 2] = a.rgba[i + 2]; ground[i + 3] = 255;
}
writeFileSync(out + '_whole.raw', both);
writeFileSync(out + '_now.raw', ground);
writeFileSync(out + '.json', JSON.stringify({ W, H }));
