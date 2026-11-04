// FLOOR 8'S WALLS (docs/mockups/f8f9_fixes): where on a floor of Echo Canyon the most of a far wall's face was lost under a jutting
// point of the plateau (painted with F8F9_FIX off and on, the picture pixels that turn from the top to a face counted round each
// point of the main way), for the pictures to stand the hero there.
//   npx tsx tools/f8f9_spots.ts [floor seed] [how many]
import { generateAct1 } from '../src/game/act1_layout';
import { F8F9_FIX } from '../src/game/f8f9';
import { CANYON_LOOK } from '../src/art/canyon';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';

const seed = Number(process.argv[2] ?? 925158);
const many = Number(process.argv[3] ?? 6);
const { floor, land } = generateAct1(8, seed);
const T = terrainOf(floor, CANYON_LOOK);
const out: { x: number; y: number; turned: number }[] = [];
for (let k = 0; k < land.way.length; k += 2) {
  const [x, y] = land.way[k];
  const [px, py] = pictureOf(x, y);
  const w = 1020;
  const h = 470;
  const x0 = Math.round(px - w / 2);
  const y0 = Math.round(py - h / 2);
  F8F9_FIX.on = false;
  const a = paintTerrain(T, x0, y0, w, h);
  F8F9_FIX.on = true;
  const b = paintTerrain(T, x0, y0, w, h);
  let turned = 0;
  for (let i = 0; i < w * h; i++) if (a.kind[i] !== TK.Face && b.kind[i] === TK.Face) turned++;
  out.push({ x: +x.toFixed(2), y: +y.toFixed(2), turned });
}
out.sort((p, q) => q.turned - p.turned);
console.log(JSON.stringify(out.slice(0, many)));
