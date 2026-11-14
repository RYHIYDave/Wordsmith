// FLOOR 9'S TWO SIDE BOSSES (art/mist_wolf.ts, art/troll_chief9.ts), standing, beside the figures they are made from and the Brawler,
// as a picture's pixels:   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_sheet.ts [t] > /tmp/f9.json   (then tools/f9_bosses_sheet.py)
import { wolfPainted, WOLF_CANVAS } from '../src/art/fog_wolves';
import { MIST_CANVAS, mistWolfPainted } from '../src/art/mist_wolf';
import { makeHeroArt3 } from '../src/art/heroes3';
import { frameAt } from '../src/dev/action_f1_scene';
import { spriteLaid } from '../src/dev/king_scene';
import { makeChief9Art, makeChieftainArt, makeGuardianArt } from '../src/art/monster_brute';
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
  take('THE MIST WOLF', mistWolfPainted('stand', t, 'front').px, MIST_CANVAS.ax, MIST_CANVAS.ay);
  take('behind', mistWolfPainted('stand', t, 'back').px, MIST_CANVAS.ax, MIST_CANVAS.ay);
}
if (only === 'troll') {
  const g = spriteLaid((makeGuardianArt() as { front: { idle: never[] } }).front.idle[0]);
  take('THE RED TROLL\nGUARDIAN', g.px, g.ax, g.ay);
  const c = makeChieftainArt() as { front: { idle: never[] }; back: { idle: never[] } };
  const f = spriteLaid(c.front.idle[0]);
  take("THE PACK LEADERS'\nCHIEFTAIN", f.px, f.ax, f.ay);
  const c9 = makeChief9Art() as { front: { idle: never[] }; back: { idle: never[] } };
  const f9 = spriteLaid(c9.front.idle[0]);
  take('THE TROLL CHIEFTAIN\n(floor 9)', f9.px, f9.ax, f9.ay);
  const b9 = spriteLaid(c9.back.idle[0]);
  take('behind', b9.px, b9.ax, b9.ay);
}
console.log(JSON.stringify(out));
