// A move painted at moments, from a side, as pixels for a picture (tools only):
//   node node_modules/tsx/dist/cli.mjs tools/move_strip.ts ranger|mage <export name> <side> t,t,t > strip.json
import * as A from '../src/art/swap_moves_art';
import { paintMuMove } from '../src/art/mage_up_art';
import { paintRuMove } from '../src/art/ranger_up_art';
const [who, name, side, ts] = process.argv.slice(2);
const m = (A as unknown as Record<string, any>)[name];
const out: { t: number; w: number; h: number; px: (string | null)[] }[] = [];
for (const t of ts.split(',').map(Number)) {
  const f = who === 'mage' ? paintMuMove(m, t, side as never) : paintRuMove(m, t, side as never);
  const px: (string | null)[] = [];
  for (let y = 0; y < f.px.h; y++) for (let x = 0; x < f.px.w; x++) px.push(f.px.get(x, y));
  out.push({ t, w: f.px.w, h: f.px.h, px });
}
console.log(JSON.stringify(out));
