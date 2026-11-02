// THE FLOORS 16 TO 19 ACTION SHEET (docs/mockups/action_f16/pictures/action_f16_sheet.png): key moments of each new move, each with the
// knight in its scene (from in front and from behind), and each old move beside its new one at the same scale. Raw panels are written
// here; tools/action_f16_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f16_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { Mob } from '../src/art/new_mobs3';
import { HEDGE_GARDENER, HEDGE_HITS } from '../src/art/action_f16_gardener';
import { WHISTLE_GROOM, WHISTLE_HIT, horsePainted, HORSE_CANVAS, HORSE_STRIDE } from '../src/art/action_f16_groom';
import { DRILL_HITS, DRILL_PARTISAN, DRILL_SWORD, THRUST9_HIT } from '../src/art/action_f16_guard';
import { THROW_GENT, THROW_HIT, THROW_LADY } from '../src/art/action_f16_dancer';
import { BANNER_HIT, BANNER_KNIGHT, STANDING_CANVAS, bannerPainted } from '../src/art/action_f16_knight';
import { PALACE_GARDENER, PALACE_GROOM, PH_BLOW } from '../src/art/palace_hands_moves';
import { GD_SWEEP, GD_THRUST, GUARD_PARTISAN } from '../src/art/palace_guard_moves';
import { DANCERS, DN_SPIN } from '../src/art/masque_dancers_moves';
import { KINGS_KNIGHT, KN_SWEEP } from '../src/art/kings_knights_moves';
import { LEAD, bannerScene, drillScene, frame, hedgeScene, standInFloor, throwScene, whistleScene } from '../src/dev/action_f16_scene';
import type { Ground, View } from '../src/dev/action_f16_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const f = (n: number): number => n / 30;
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
function cell(ground: Ground, w: number, h: number, x: number, y: number, mob: Mob, view: View, move: string, t: number, sh = 12): Px {
  const p = standInFloor(ground, w, h, x, y);
  if (sh) shadow(p, x, y, sh);
  lay(p, frame(mob, move, t, view), x, y, 1);
  return p;
}
const put = (name: string, p: Px): void => writeFileSync(`${out}/${name}.png`, png(p));
type SceneFn = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
const shot = (ground: Ground, scene: SceneFn, view: View, t: number, w: number, h: number, cx: number, cy: number, x: number, y: number, cw: number, ch: number): Px => cut(scene(view, t, standInFloor(ground, w, h, cx, cy), cx, cy), x, y, cw, ch);
const six = (name: string, ground: Ground, mob: Mob, move: string, ts: number[], x = 46, y = 110, h = 130, view: View = 'front'): void => put(name, row(ts.map((t) => cell(ground, 100, h, x, y, mob, view, move, t)), 2));
const oldNew = (name: string, ground: Ground, a: Mob, am: string, at: number[], b: Mob, bm: string, bt: number[], x = 62, y = 112, h = 130): void =>
  put(name, row([...at.map((t) => cell(ground, 150, h, x, y, a, 'front', am, t)), ...bt.map((t) => cell(ground, 150, h, x, y, b, 'front', bm, t))], 2));

// FLOOR 16: THE GARDENER
six('hedge', 'garden', HEDGE_GARDENER, 'attack', [0.45, HEDGE_HITS[0], 1.02, HEDGE_HITS[1], 1.7, HEDGE_HITS[2]], 22, 96, 120);
put('hedge_scene', row([shot('garden', hedgeScene, 'front', LEAD + HEDGE_HITS[1], 400, 225, 180, 110, 40, 10, 300, 124), shot('garden', hedgeScene, 'back', LEAD + HEDGE_HITS[2] + 0.15, 400, 225, 180, 150, 40, 40, 300, 124)], 2));
oldNew('hedge_old_new', 'garden', PALACE_GARDENER, 'attack', [0.4, PH_BLOW.hit], HEDGE_GARDENER, 'attack', [0.45, HEDGE_HITS[2]], 44, 100, 120);
// THE GROOM AND HIS HORSE
six('whistle', 'garden', WHISTLE_GROOM, 'attack', [0.15, 0.5, f(24), WHISTLE_HIT, 1.1, 1.7], 40, 100, 120);
const ws = (struck: boolean): SceneFn => (v, t, b, cx, cy) => whistleScene(v, t, b, cx, cy, struck);
put('whistle_scene', row([shot('garden', ws(true), 'front', LEAD + 0.6, 600, 338, 280, 150, 120, 60, 300, 124), shot('garden', ws(true), 'front', LEAD + WHISTLE_HIT + 0.42, 600, 338, 280, 150, 120, 60, 300, 124)], 2));
{
  const cells: Px[] = [];
  for (const v of ['front', 'back'] as const) for (const k of [0, 0.5]) {
    const p = standInFloor('garden', 150, 110, 75, 90);
    shadow(p, 75, 90, 13);
    const h = horsePainted(k * HORSE_STRIDE + 0.5, v, 1);
    lay(p, { px: h.px, ax: HORSE_CANVAS.ax, ay: HORSE_CANVAS.ay }, 75, 90, 1);
    cells.push(p);
  }
  put('horse', row(cells, 2));
}
oldNew('whistle_old_new', 'garden', PALACE_GROOM, 'attack', [0.4, PH_BLOW.hit], WHISTLE_GROOM, 'attack', [0.5, WHISTLE_HIT], 62, 100, 120);
// THE PALACE GUARD
six('thrust', 'garden', DRILL_PARTISAN, 'attack', [0.14, 0.45, f(19), THRUST9_HIT, 1.0, 1.5], 30, 120, 140);
oldNew('thrust_old_new', 'garden', GUARD_PARTISAN, 'attack', [0.4, GD_THRUST.hit], DRILL_PARTISAN, 'attack', [0.45, THRUST9_HIT], 40, 120, 140);
six('drill', 'garden', DRILL_PARTISAN, 'drill', [0.5, DRILL_HITS[0], 1.05, DRILL_HITS[1], 2.2, DRILL_HITS[2]], 50, 120, 140);
put('drill_scene', row([shot('garden', drillScene, 'front', LEAD + 1.05, 400, 225, 190, 120, 40, 10, 300, 124), shot('garden', drillScene, 'back', LEAD + DRILL_HITS[2] + 0.12, 400, 225, 190, 150, 50, 40, 300, 124)], 2));
oldNew('drill_old_new', 'garden', GUARD_PARTISAN, 'sweep', [0.5, GD_SWEEP.hit], DRILL_PARTISAN, 'drill', [DRILL_HITS[1], DRILL_HITS[2]], 70, 120, 140);
// FLOOR 17: THE DANCERS
const ts = (struck: boolean): SceneFn => (v, t, b, cx, cy) => throwScene(v, t, b, cx, cy, struck);
put('throw_scene_a', row([shot('ballroom', ts(true), 'front', LEAD + 0.85, 600, 338, 300, 150, 60, 40, 300, 124), shot('ballroom', ts(true), 'front', LEAD + THROW_HIT + 0.05, 600, 338, 300, 150, 60, 40, 300, 124)], 2));
put('throw_scene_b', row([shot('ballroom', ts(true), 'front', LEAD + THROW_HIT + 0.35, 600, 338, 300, 150, 120, 60, 300, 124), shot('ballroom', ts(false), 'back', LEAD + THROW_HIT + 0.55, 600, 338, 300, 200, 150, 40, 300, 124)], 2));
six('throw_lady', 'ballroom', THROW_LADY, 'attack', [0.2, 0.7, THROW_HIT, 1.5, 2.2, 2.8], 50, 110, 130);
oldNew('throw_old_new', 'ballroom', DANCERS.lady.violet, 'attack', [0.5, DN_SPIN.hit], THROW_GENT, 'attack', [0.8, THROW_HIT], 62, 110, 130);
// FLOOR 19: THE KING'S KNIGHT
const big = (mob: Mob, view: View, move: string, t: number, x = 100): Px => cell('hall', 200, 340, x, 322, mob, view, move, t, 22);
put('banner', row([big(BANNER_KNIGHT, 'front', 'banner', 0.42), big(BANNER_KNIGHT, 'front', 'banner', 1.1), big(BANNER_KNIGHT, 'front', 'banner', BANNER_HIT), big(BANNER_KNIGHT, 'front', 'banner', 2.3)], 1.5));
put('banner_back', row([big(BANNER_KNIGHT, 'front', 'stand', 0), big(BANNER_KNIGHT, 'back', 'stand', 0), big(BANNER_KNIGHT, 'back', 'walk', 0.4), big(BANNER_KNIGHT, 'front', 'attack', 0.9)], 1.5));
{
  const cells: Px[] = [];
  for (const [t, s, c] of [[1, -1, -1], [2, 0.15, -1], [2, -1, 0.25], [2, -1, 0.7]] as const) {
    const p = standInFloor('hall', 150, 170, 75, 160);
    const b = bannerPainted(t, 'front', s, c);
    lay(p, { px: b.px, ax: STANDING_CANVAS.ax, ay: STANDING_CANVAS.ay }, 75, 160, 1);
    cells.push(p);
  }
  put('banner_standing', row(cells, 2));
}
const bs = (cutAt: number): SceneFn => (v, t, b, cx, cy) => bannerScene(v, t, b, cx, cy, cutAt);
put('banner_scene', row([shot('hall', bs(-1), 'front', LEAD + BANNER_HIT + 0.08, 600, 338, 300, 268, 140, 90, 300, 190), shot('hall', bs(LEAD + BANNER_HIT + 2.2), 'front', LEAD + BANNER_HIT + 2.25, 600, 338, 300, 268, 140, 90, 300, 190)], 2));
put('banner_old_new', row([big(KINGS_KNIGHT, 'front', 'attack', 0.9, 110), big(KINGS_KNIGHT, 'front', 'attack', KN_SWEEP.hit, 110), big(BANNER_KNIGHT, 'front', 'banner', 1.1), big(BANNER_KNIGHT, 'front', 'banner', BANNER_HIT)], 1.5));
console.log('panels in', out);
