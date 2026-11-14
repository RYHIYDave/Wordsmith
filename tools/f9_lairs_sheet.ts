// FLOOR 9'S TWO SIDE AREAS' PIECES (art/f9_lairs.ts), each as a picture's pixels, with the Brawler for size:
//   node node_modules/tsx/dist/cli.mjs tools/f9_lairs_sheet.ts > /tmp/f9l.json   (then tools/f9_lairs_sheet.py)
import { f9LairPieces } from '../src/art/f9_lairs';
import { makeHeroArt3 } from '../src/art/heroes3';
import { frameAt } from '../src/dev/action_f1_scene';
import { Px } from '../src/engine/px';
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out: { name: string; w: number; h: number; ax: number; ay: number; px: (string | null)[] }[] = [];
const take = (name: string, p: Px, ax: number, ay: number): void => {
  const px: (string | null)[] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) px.push(p.get(x, y));
  out.push({ name, w: p.w, h: p.h, ax, ay, px });
};
const art = makeHeroArt3().of('brawler' as never, {} as never) as never;
const l = frameAt(art, 'front', 'stand', 0);
take('the Brawler', l.px, l.ax, l.ay);
for (const pc of f9LairPieces()) {
  const fr = pc.frames ?? [];
  const sp = fr[0];
  take(pc.name, sp.img as unknown as Px, sp.ax, sp.ay);
  if (fr.length > 1 && !['the moonbeam', "the trolls' fire"].includes(pc.name)) take('', fr[1].img as unknown as Px, fr[1].ax, fr[1].ay);
}
console.log(JSON.stringify(out));
