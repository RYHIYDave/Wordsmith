// THE FLOORS 9 AND 10 ACTION SHEET (docs/mockups/action_f9/pictures/action_f9_sheet.png): key moments of each new move, from in front
// and from behind, each with the knight in its scene, and each old move beside its new one at the same scale. Raw panels are written
// here; tools/action_f9_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f9_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { ActorArt } from '../src/art/actor_types';
import { CHARGE, CHARGE_HIT, GORE_HIT, LEAP_HIT } from '../src/art/action_f9_pinewood';
import { FROST, GRAB_HIT, RETCH_HIT, SLICK } from '../src/art/action_f9_fen';
import { DEER_GORE, DEER_STOMP, makeDeerArt } from '../src/art/twisted_deer';
import { WOLF_BITE, makeWolfArt } from '../src/art/fog_wolves';
import { DR_GRAB, makeDrownedArt3 } from '../src/art/drowned';
import { frameAt } from '../src/dev/action_f3_scene';
import { LEAD, chargeScene, chargeTimes, figures, grabScene, grabTimes, packAbove, packScene, packTimes, retchScene, retchTimes, standInFloor } from '../src/dev/action_f9_scene';
import type { View } from '../src/dev/action_f9_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const F = figures();
const f = (n: number): number => n / 30;

/** A row of cells side by side, made `k` times as big, a dark line between them. */
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** A cell of a figure's move at `t`, standing at (x, y) on its floor. */
function cell(ground: 'pinewood' | 'fen', w: number, h: number, x: number, y: number, art: ActorArt, view: View, move: string, t: number, sh = 10, flip = false): Px {
  const p = standInFloor(ground, w, h, x, y);
  shadow(p, x, y, sh);
  lay(p, frameAt(art, view, move, t), x, y, 1, undefined, flip);
  return p;
}
const put = (name: string, p: Px): void => writeFileSync(`${out}/${name}.png`, png(p));
type SceneFn = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A cut of a scene at `t`: the scene made `w` by `h` round (cx, cy), cut to (x, y, cw, ch). */
const shot = (ground: 'pinewood' | 'fen', scene: SceneFn, view: View, t: number, w: number, h: number, cx: number, cy: number, x: number, y: number, cw: number, ch: number): Px => cut(scene(view, t, standInFloor(ground, w, h, cx, cy), cx, cy), x, y, cw, ch);

// THE DEER'S GORE BY MOVEMENT 9: lowered; HELD; lunging; hooked up; flung up; stepping back (twice as big)
const GORE_AT = [0.25, 0.5, f(18), GORE_HIT, 0.8, 1.3];
for (const v of ['front', 'back'] as const) put(`gore_${v}`, row(GORE_AT.map((t) => cell('pinewood', 100, 104, 46, 88, F.deer, v, 'attack', t, 16)), 2));
const oldDeer = makeDeerArt();
put('gore_old_new', row([cell('pinewood', 100, 96, 46, 78, oldDeer, 'front', 'attack', 0.4, 16), cell('pinewood', 100, 96, 46, 78, oldDeer, 'front', 'attack', DEER_GORE.hit, 16), cell('pinewood', 100, 96, 46, 78, F.deer, 'front', 'attack', 0.5, 16), cell('pinewood', 100, 96, 46, 78, F.deer, 'front', 'attack', GORE_HIT, 16)], 3));

// THE BRAMBLE CHARGE: stamping; HELD; bursting off; away; galloping; tossing its antlers (twice as big; the deer where the game has carried it is not shown here)
const CH_AT = [0.45, 0.8, f(29), CHARGE_HIT, 1.2, 1.75];
for (const v of ['front', 'back'] as const) put(`charge_${v}`, row(CH_AT.map((t) => cell('pinewood', 100, 100, 44, 84, F.deer, v, 'charge', t, 16)), 2));
const ct = chargeTimes();
const chShot = (t: number, view: View = 'front'): Px => shot('pinewood', chargeScene, view, t, 400, 225, 200, 150, 50, 35, 300, 175);
put('charge_scene_a', row([chShot(ct.aim + 0.5), chShot(ct.off + 0.2)], 2));
put('charge_scene_b', row([chShot(ct.stop + 0.1), chShot(ct.off + 1.6)], 2));
put('charge_old_new', row([cell('pinewood', 100, 108, 40, 96, oldDeer, 'front', 'stomp', 0.5, 16), cell('pinewood', 100, 108, 40, 96, oldDeer, 'front', 'stomp', DEER_STOMP.hit + 0.15, 16), cell('pinewood', 100, 108, 40, 96, F.deer, 'front', 'charge', 0.8, 16), cell('pinewood', 100, 108, 44, 96, F.deer, 'front', 'charge', CHARGE_HIT, 16)], 3));

// THE FOG WOLF'S LUNGE: crouched; HELD; in the air; snapped shut; skidding; back into its fog (two rows of three, twice as big)
const LEAP_AT = [0.25, 0.5, f(18), LEAP_HIT, 0.8, 1.2];
const leapCells = LEAP_AT.map((t) => cell('pinewood', 200, 112, 160, 98, F.wolf, 'front', 'attack', t, 8));
put('leap_front_a', row(leapCells.slice(0, 3), 2));
put('leap_front_b', row(leapCells.slice(3), 2));
put('leap_back', row([0.5, LEAP_HIT, 1.2].map((t) => cell('pinewood', 200, 112, 160, 60, F.wolf, 'back', 'attack', t, 8)), 2));
const pt = packTimes();
const packShot = (t: number): Px => shot('pinewood', packScene, 'front', t, 400, 225, 200, 122, 50, 32, 300, 175);
put('pack_scene_a', row([packShot(pt.gathered + 0.2), packShot(pt.at[0] + LEAP_HIT)], 2));
put('pack_scene_b', row([packShot(pt.at[2] + LEAP_HIT), packShot(pt.at[3] + 1.4)], 2));
put('pack_above', row([packAbove(pt.at[1] + LEAP_HIT + 0.02, 600, 338), packAbove(pt.at[3] + LEAP_HIT + 0.02, 600, 338)], 1));
const oldWolf = makeWolfArt();
put('leap_old_new', row([cell('pinewood', 150, 104, 80, 90, oldWolf, 'front', 'attack', 0.3, 8), cell('pinewood', 150, 104, 80, 90, oldWolf, 'front', 'attack', WOLF_BITE.hit, 8), cell('pinewood', 150, 104, 80, 90, F.wolf, 'front', 'attack', 0.5, 8), cell('pinewood', 150, 104, 120, 90, F.wolf, 'front', 'attack', LEAP_HIT, 8)], 2));

// THE DROWNED'S FROST GRAB: arms up; HELD, frost on its hands; lunging; clutching; wrenching; hunched (twice as big)
const GRAB_AT = [0.3, 0.6, f(21), GRAB_HIT, 1.3, 1.75];
for (const v of ['front', 'back'] as const) put(`grab_${v}`, row(GRAB_AT.map((t) => cell('fen', 100, 96, 42, 84, F.drowned, v, 'attack', t, 12)), 2));
const gt = grabTimes();
const grabShot = (t: number): Px => shot('fen', grabScene, 'front', t, 400, 225, 190, 140, 45, 45, 300, 160);
put('grab_scene', row([grabShot(gt.hit + 0.3), grabShot(gt.free + 0.08)], 2));
const oldDr = makeDrownedArt3();
put('grab_old_new', row([cell('fen', 100, 96, 42, 84, oldDr, 'front', 'attack', 0.4, 12), cell('fen', 100, 96, 42, 84, oldDr, 'front', 'attack', DR_GRAB.hit, 12), cell('fen', 100, 96, 42, 84, F.drowned, 'front', 'attack', 0.6, 12), cell('fen', 100, 96, 42, 84, F.drowned, 'front', 'attack', GRAB_HIT, 12)], 3));

// THE BOG RETCH: risen; HELD, heaving; lurching; retching; pouring; hunched (twice as big)
const RETCH_AT = [0.35, 0.65, f(24), RETCH_HIT, 1.1, 1.8];
for (const v of ['front', 'back'] as const) put(`retch_${v}`, row(RETCH_AT.map((t) => cell('fen', 100, 96, 42, 84, F.drowned, v, 'retch', t, 12)), 2));
const rt = retchTimes();
const retchShot = (t: number): Px => shot('fen', retchScene, 'front', t, 400, 225, 190, 120, 40, 20, 300, 175);
put('retch_scene', row([retchShot(rt.hit - 0.15), retchShot(rt.hit + 0.15)], 2));
put('retch_scene_b', row([retchShot(rt.lands + 0.5), retchShot(rt.lands + 1.6)], 2));
console.log('panels in', out, LEAD, CHARGE.long, FROST.hold, SLICK.stays);
