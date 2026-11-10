// A QUICK LOOK at the Warrior's new weapons (src/art/warrior_up_weapons.ts), for whoever paints them: one take in one hold from
// his eight sides, side by side, `scale` times as big, with what the checks find printed. Nothing of the game imports it.
//   npx tsx tools/warrior_weapons_peek.ts <take> <hold> <out.png> [scale] [sides]
import { Px } from '../src/engine/px';
import { paintWithoutCanvas } from '../tests/helpers';
import { writePng } from './px_png';
import { TAKES, armedThrough, handsOnHaft, paintAlone, paintHold, takeSeen } from '../src/art/warrior_up_weapons';
import type { Hold, TakeId } from '../src/art/warrior_up_weapons';
import { WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';

declare const process: { argv: string[] };
paintWithoutCanvas();

const [id, hold, out, k0, sides0] = process.argv.slice(2);
const k = Number(k0 ?? 3);
const take = TAKES[id as TakeId];
const sides = (sides0 ? sides0.split(',') : WU_SIDES) as WuSide[];
const pics: Px[] = [];
if (hold === 'alone' || hold === 'fly') {
  for (const turn of hold === 'alone' ? [0, 40, 90, 140] : [0, 45, 90, 135, 180, 225, 270, 315]) pics.push(paintAlone(take, hold === 'alone' ? 'stand' : 'fly', turn, { w: 120, h: 120 }, 60, 100).px);
} else {
  for (const side of sides) {
    const f = paintHold(take, hold as Hold, side);
    const seen = takeSeen(f);
    const through = armedThrough(f);
    const hands = hold === 'town' ? [] : handsOnHaft(f);
    console.log(`${side}: head ${seen.head} px, all ${seen.all} px; ${through.length ? 'THROUGH: ' + through.join('; ') : 'nothing through'}; ${hands.length ? hands.join('; ') : 'hands on it'}`);
    pics.push(f.px);
  }
}
// (each cut to the box round all of them)
let x0 = 999, y0 = 999, x1 = -1, y1 = -1;
for (const p of pics) for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) {
  x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
}
const w = x1 - x0 + 3;
const h = y1 - y0 + 3;
const sheet = new Px(w * pics.length, h);
pics.forEach((p, i) => sheet.blit(p.crop(x0 - 1, y0 - 1, w, h), i * w, 0));
writePng(sheet, out, k);
