// FLOOR 9'S TWO SIDE BOSSES (dev/sculpt_f9_bosses.ts, sculpted), standing, beside the figures they are made from and the Brawler,
// as a picture's pixels:   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_sheet.ts [t] > /tmp/f9.json   (then tools/f9_bosses_sheet.py)
import { wolfPainted, WOLF_CANVAS } from '../src/art/fog_wolves';
import { CHIEF9_CANVAS, WOLF9_CANVAS, sculptChief9, sculptWolf9 } from '../src/art/f9_bosses_sculpt';
import { makeHeroArt3 } from '../src/art/heroes3';
import { frameAt } from '../src/dev/action_f1_scene';
import { spriteLaid } from '../src/dev/king_scene';
import { makeGuardianArt } from '../src/art/monster_brute';
import { Px } from '../src/engine/px';
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const t = Number(process.argv[2] ?? 0);
const only = process.argv[3] ?? 'wolf';
const out: { name: string; w: number; h: number; ax: number; ay: number; px: (string | null)[] }[] = [];
const take = (name: string, p: Px, ax: number, ay: number): void => {
  const px: (string | null)[] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) px.push(p.get(x, y));
  out.push({ name, w: p.w, h: p.h, ax, ay, px });
};
const art = makeHeroArt3().of('brawler' as never, {} as never) as never;
const l = frameAt(art, 'front', 'stand', t);
take('THE BRAWLER\n(for size)', l.px, l.ax, l.ay);
if (only === 'wolf') {
  take('A FOG WOLF\n(floor 9)', wolfPainted('stand', t, 'front').px, WOLF_CANVAS.ax, WOLF_CANVAS.ay);
  take('THE MIST WOLF', sculptWolf9('front', { t }).px, WOLF9_CANVAS.ax, WOLF9_CANVAS.ay);
  take('behind', sculptWolf9('back', { t }).px, WOLF9_CANVAS.ax, WOLF9_CANVAS.ay);
}
if (only === 'troll') {
  const g = spriteLaid((makeGuardianArt() as { front: { idle: never[] } }).front.idle[0]);
  take('A TROLL GUARDIAN\n(for size)', g.px, g.ax, g.ay);
  take('THE TROLL CHIEFTAIN\n(floor 9)', sculptChief9('front', { breath: t }).px, CHIEF9_CANVAS.ax, CHIEF9_CANVAS.ay);
  take('behind', sculptChief9('back', { breath: t }).px, CHIEF9_CANVAS.ax, CHIEF9_CANVAS.ay);
}
console.log(JSON.stringify(out));
