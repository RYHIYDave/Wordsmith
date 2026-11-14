// THE TEMPLE DOOR'S KEY-BEARERS (art/key_bearers.ts) standing, beside the cultists they are made from and the Brawler, as a picture's pixels:
//   node node_modules/tsx/dist/cli.mjs tools/key_bearers_sheet.ts [move] [t] > /tmp/kb.json   (then a picture is made of it)
import { FRENZY_CULTIST } from '../src/art/cultists';
import { KEY_BLADE, KEY_FLAME } from '../src/art/key_bearers';
import { paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { makeHeroArt3 } from '../src/art/heroes3';
import { frameAt } from '../src/dev/action_f1_scene';
import { Px } from '../src/engine/px';
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [which = 'stand', ts = '0', hero = 'brawler'] = process.argv.slice(2);
const out: { name: string; w: number; h: number; ax: number; ay: number; px: (string | null)[] }[] = [];
const take = (name: string, p: Px, ax: number, ay: number): void => {
  const px: (string | null)[] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) px.push(p.get(x, y));
  out.push({ name, w: p.w, h: p.h, ax, ay, px });
};
const add = (name: string, mob: Mob, view: 'front' | 'back', t: number, w = which): void => {
  const can = mob.canvas!;
  take(name, paintMob(mob, w, t, view).px, can.ax, can.ay);
};
for (const t of ts.split(',').map(Number)) {
  if (hero !== 'none') {
    const art = makeHeroArt3().of(hero as never, {} as never) as never;
    const l = frameAt(art, 'front', 'stand', t);
    take(`${hero} ${t}`, l.px, l.ax, l.ay);
  }
  add(`cultist ${t}`, FRENZY_CULTIST, 'front', t);
  add(`keybearer front ${t}`, KEY_BLADE, 'front', t);
  add(`keybearer back ${t}`, KEY_BLADE, 'back', t);
  add(`flame front ${t}`, KEY_FLAME, 'front', t);
  add(`flame back ${t}`, KEY_FLAME, 'back', t);
}
console.log(JSON.stringify(out));
