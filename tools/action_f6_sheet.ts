// THE FLOORS 6 TO 8 ACTION SHEET (docs/mockups/action_f6/pictures/action_f6_sheet.png): key moments of each new move, from in front
// and from behind, each with the knight in its scene, and each old move beside its new one at the same scale. Raw panels are written
// here; tools/action_f6_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f6_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { ActorArt } from '../src/art/actor_types';
import { CAST_HIT, LOB_HIT } from '../src/art/action_f6_cult';
import { HAMMER_HIT, ROLL_HIT } from '../src/art/action_f6_golem';
import { SNAP_HIT, SPIT_HIT, TW_HIT } from '../src/art/action_f6_canyon';
import { CH_BOLT, POTS_LOB, makeChanterArt3, makeFirepotThrowerArt3 } from '../src/art/act1_cultists';
import { QG_PACE, QG_THROW_HIT, QUARRY_GOLEM } from '../src/art/floor6_mobs';
import { SC_STING, makeScorpionArt } from '../src/art/canyon_scorpions';
import { DD_LASH, makeDevilArt } from '../src/art/dust_devils';
import { mobSet } from '../src/art/new_mobs3';
import { frameAt } from '../src/dev/action_f3_scene';
import { LEAD, chainScene, chainTimes, figures, hammerScene, lobScene, lobTimes, rollScene, rollTimes, spitScene, spitTimes, standInFloor, twisterScene } from '../src/dev/action_f6_scene';
import type { View } from '../src/dev/action_f6_scene';
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
function cell(ground: 'quarry' | 'canyon', w: number, h: number, x: number, y: number, art: ActorArt, view: View, move: string, t: number, sh = 10): Px {
  const p = standInFloor(ground, w, h, x, y);
  shadow(p, x, y, sh);
  lay(p, frameAt(art, view, move, t), x, y);
  return p;
}
const put = (name: string, p: Px): void => writeFileSync(`${out}/${name}.png`, png(p));
type SceneFn = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A cut of a scene at `t`: the scene made `w` by `h` round (cx, cy), cut to (x, y, cw, ch). */
const shot = (ground: 'quarry' | 'canyon', scene: SceneFn, view: View, t: number, w: number, h: number, cx: number, cy: number, x: number, y: number, cw: number, ch: number): Px => cut(scene(view, t, standInFloor(ground, w, h, cx, cy), cx, cy), x, y, cw, ch);

// THE FIREPOT THROWER: whirling; wound and HELD; over the top; slung; bent after it; reaching back for another (twice as big)
const LOB_AT = [0.3, 0.75, f(29), LOB_HIT, 1.3, 1.75];
for (const v of ['front', 'back'] as const) put(`lob_${v}`, row(LOB_AT.map((t) => cell('quarry', 100, 96, 50, 84, F.pots, v, 'attack', t)), 2));
const lt = lobTimes();
const lobShot = (t: number, x: number, y: number): Px => shot('quarry', lobScene, 'front', t, 600, 340, 300, 175, x, y, 200, 150);
put('lob_scene', row([lobShot(lt.land - 0.25, 200, 60), lobShot(lt.land + 0.08, 283, 110), lobShot(lt.land + 1.2, 283, 110)], 2));
// old beside new: the old lob's whirl and its loosing; the new, held and slung (three times as big)
const oldPots = makeFirepotThrowerArt3();
put('lob_old_new', row([cell('quarry', 100, 96, 50, 84, oldPots, 'front', 'attack', 0.6), cell('quarry', 100, 96, 50, 84, oldPots, 'front', 'attack', POTS_LOB.hit), cell('quarry', 100, 96, 50, 84, F.pots, 'front', 'attack', 0.8), cell('quarry', 100, 96, 50, 84, F.pots, 'front', 'attack', LOB_HIT)], 3));

// THE CHANTER: heaving the book up; HELD, crackling; down at you; the lightning leaves it; rocked over; smoking (twice as big)
const CAST_AT = [0.25, 0.65, f(28), CAST_HIT, 1.15, 1.5];
for (const v of ['front', 'back'] as const) put(`cast_${v}`, row(CAST_AT.map((t) => cell('quarry', 100, 104, 50, 92, F.chanter, v, 'attack', t)), 2));
const ct = chainTimes();
const chainShot = (t: number): Px => shot('quarry', chainScene, 'front', t, 600, 340, 290, 170, 190, 75, 300, 180);
put('chain_scene', row([chainShot(ct.aim + 0.3), chainShot(ct.strike + 0.17)], 2));
const oldCh = makeChanterArt3();
put('cast_old_new', row([cell('quarry', 100, 104, 50, 92, oldCh, 'front', 'attack', 0.4), cell('quarry', 100, 104, 50, 92, oldCh, 'front', 'attack', CH_BOLT.hit), cell('quarry', 100, 104, 50, 92, F.chanter, 'front', 'attack', 0.7), cell('quarry', 100, 104, 50, 92, F.chanter, 'front', 'attack', CAST_HIT)], 3));

// THE QUARRY GOLEM'S BOULDER ROLL: torn up; swung up; HELD overhead; over and down; bowled; bent after it (two rows of three, twice as big)
const ROLL_AT = [0.5, 0.92, 1.35, f(47), ROLL_HIT, 2.0];
for (const v of ['front', 'back'] as const) {
  const cells = ROLL_AT.map((t) => cell('quarry', 200, 190, 100, 160, F.golem, v, 'throw', t, 26));
  put(`roll_${v}_a`, row(cells.slice(0, 3), 2));
  put(`roll_${v}_b`, row(cells.slice(3), 2));
}
const rt = rollTimes();
const rollShot = (t: number, x: number, y: number): Px => shot('quarry', rollScene, 'front', t, 600, 340, 320, 212, x, y, 200, 150);
put('roll_scene', row([rollShot(rt.aim + 0.5, 130, 30), rollShot(rt.loose + 0.45, 253, 150), rollShot(rt.smash + 0.12, 406, 190)], 2));
// its hammer by Movement 9: raised; HELD; over and down; on the floor; crouched after it (twice as big)
const HAM_AT = [0.45, 0.85, f(28), HAMMER_HIT, 1.35];
put('hammer', row(HAM_AT.map((t) => cell('quarry', 120, 190, 60, 160, F.golem, 'front', 'attack', t, 26)), 2));
const hamShot = (t: number): Px => shot('quarry', hammerScene, 'front', t, 360, 230, 180, 125, 60, 20, 240, 190);
put('hammer_scene', row([hamShot(LEAD + HAMMER_HIT + 0.05), hamShot(LEAD + HAMMER_HIT + 0.3)], 2));
// old beside new: the chunk torn off its shoulder and wound back; the boulder held over its head (twice as big)
const oldGolem: ActorArt = { front: mobSet(QUARRY_GOLEM, 'front', QG_PACE), back: mobSet(QUARRY_GOLEM, 'back', QG_PACE) };
put('roll_old_new', row([cell('quarry', 150, 190, 75, 160, oldGolem, 'front', 'throw', 0.95, 26), cell('quarry', 150, 190, 75, 160, oldGolem, 'front', 'throw', QG_THROW_HIT + 0.03, 26), cell('quarry', 150, 190, 75, 160, F.golem, 'front', 'throw', 1.35, 26), cell('quarry', 150, 190, 75, 160, F.golem, 'front', 'throw', ROLL_HIT, 26)], 2));

// THE SCORPION'S ACID SPIT: cocked; HELD, dripping; flung over; spat; on down; settling (twice as big)
const SPIT_AT = [0.3, 0.65, f(25), SPIT_HIT, 1.05, 1.4];
for (const v of ['front', 'back'] as const) put(`spit_${v}`, row(SPIT_AT.map((t) => cell('canyon', 100, 80, 50, 62, F.scorpion, v, 'spit', t, 14)), 2));
const SNAP_AT = [0.25, 0.45, f(16), SNAP_HIT, 0.7, 0.9];
put('snap', row(SNAP_AT.map((t) => cell('canyon', 100, 80, 50, 62, F.scorpion, 'front', 'attack', t, 14)), 2));
const st = spitTimes();
const spitShot = (t: number): Px => shot('canyon', spitScene, 'front', t, 600, 340, 300, 170, 190, 70, 300, 180);
put('spit_scene', row([spitShot(st.land - 0.2), spitShot(st.land + 1.6)], 2));
const oldSc = makeScorpionArt();
put('spit_old_new', row([cell('canyon', 100, 80, 50, 62, oldSc, 'front', 'sting', 0.5, 14), cell('canyon', 100, 80, 50, 62, oldSc, 'front', 'sting', SC_STING.hit + 0.25, 14), cell('canyon', 100, 80, 50, 62, F.scorpion, 'front', 'spit', 0.65, 14), cell('canyon', 100, 80, 50, 62, F.scorpion, 'front', 'spit', SPIT_HIT, 14)], 3));

// THE DUST DEVIL'S TWISTER: spinning up; HELD, crackling; bursting up; the twister; the twister crackling; collapsing (twice as big)
const TW_AT = [0.35, 0.7, f(25), TW_HIT + 0.1, 2.3, 4.6];
for (const v of ['front', 'back'] as const) put(`twister_${v}`, row(TW_AT.map((t) => cell('canyon', 100, 150, 50, 136, F.devil, v, 'attack', t, 7)), 2));
const twShot = (t: number): Px => shot('canyon', twisterScene, 'front', t, 600, 340, 300, 200, 150, 50, 200, 190);
const bolt = LEAD + TW_HIT + 0.25 + 0.04;
put('twister_scene', row([twShot(LEAD + 0.7), twShot(bolt), twShot(LEAD + 2.6)], 2));
const oldDd = makeDevilArt();
put('twister_old_new', row([cell('canyon', 100, 150, 50, 136, oldDd, 'front', 'attack', DD_LASH.warn + 0.05, 7), cell('canyon', 100, 150, 50, 136, oldDd, 'front', 'attack', DD_LASH.hit, 7), cell('canyon', 100, 150, 50, 136, F.devil, 'front', 'attack', 0.7, 7), cell('canyon', 100, 150, 50, 136, F.devil, 'front', 'attack', 2.3, 7)], 3));
console.log('panels in', out);
