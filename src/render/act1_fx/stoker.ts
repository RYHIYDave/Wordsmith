// FLOOR 3'S SIDE BOSS, THE STOKER: what his fire does, drawn (render/act1_fx/types.ts). His stand, walk, three attacks, struck and
// his death are his own pictures (art/stoker_moves.ts); here, the art chat's (art/stoker_fx.ts, art/stoker_room.ts):
// - THE COALS: where each will come down marked on the floor in the enemy's pink, then each coal in the air, then its fire burning
//   and dying to a scorch;
// - THE RAKE: its arc marked, then the sheet of fire springing up behind the blade and burning;
// - THE FURNACE'S RING: marked, rolling out with its three gaps, the floor it passed scorched;
// - HIS DEATH'S BLAST on the floor under him, and THE GEAR lying where it came to rest once his death is done, until it is taken.
// Each painted in the frame his picture is shown in (game/act1_rules/stoker.ts FRAMES: in front or behind, turned over or not),
// at his floor point as his act began, afresh at PAINT_FPS, its pictures let go once it is done.

import { toSprite } from '../../art/kit';
import { TILE3 } from '../../art/new_mobs3';
import { COALS, FX_CANVAS, coalAt, coalInAir, fxAt, fxPainted } from '../../art/stoker_fx';
import { ST_COALS, ST_DIES, stokerBonesOf, stokerShovelAt } from '../../art/stoker_moves';
import { GEAR_GLINT, STOKER_ROOM } from '../../art/stoker_room';
import { Px, drawLights } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { BLAST_PERIL, COALS_PERIL, FRAMES, GEAR_PERIL, LASTS, RAKE_PERIL, RING_PERIL, spotOf } from '../../game/act1_rules/stoker';
import type { Peril } from '../../game/state';
import { liveDone, liveFrom } from './live';
import type { Act1Fx, Act1FxCtx } from './types';

/** How often his fire is painted afresh (a canvas the size of the floor round him: the Rime Shade's fifteen a second). */
const PAINT_FPS = 15;

const names = new WeakMap<Peril, string>();
let made = 0;
function nameOf(p: Peril): string {
  let n = names.get(p);
  if (!n) names.set(p, (n = `st${++made}`));
  return n;
}

/** A picture drawn at (sx, sy), turned over about its anchor where `flip` (his picture turned over: the fire painted as it is). */
function drawAt(c: Act1FxCtx, s: Sprite, sx: number, sy: number, flip: boolean): void {
  const g = c.g;
  if (!g) return;
  const x = Math.round(sx);
  const y = Math.round(sy);
  if (!flip) {
    g.drawImage(s.img, x - s.ax, y - s.ay, s.w, s.h);
    drawLights(g, s, x, y, 1, 1);
    return;
  }
  g.save();
  g.translate(x, 0);
  g.scale(-1, 1);
  g.drawImage(s.img, -s.ax, y - s.ay, s.w, s.h);
  drawLights(g, s, 0, y, 1, 1);
  g.restore();
}

/** Where the coals leave his shovel (tiles along his forward, to his left, and up): its lip at the hit (the art's film, tools/stoker_pics.ts). */
let coalFrom: [number, number, number] | null = null;
function fromOf(): [number, number, number] {
  if (!coalFrom) {
    const s = stokerBonesOf('attack', ST_COALS.hit);
    const sv = stokerShovelAt('attack', ST_COALS.hit, s);
    coalFrom = [sv.lip[0] / TILE3, sv.lip[1] / TILE3, sv.lip[2]];
  }
  return coalFrom;
}

function ground(c: Act1FxCtx, p: Peril): void {
  const which = p.a1 === COALS_PERIL ? 'coals' : p.a1 === RAKE_PERIL ? 'rake' : p.a1 === RING_PERIL ? 'ring' : 'blast';
  const last = which === 'coals' ? LASTS.coals : which === 'rake' ? LASTS.rake : which === 'ring' ? LASTS.ring : LASTS.blast;
  const n = nameOf(p);
  if (p.t >= last - 0.05 || p.t >= p.dur) {
    liveDone(`${n}:floor`);
    return;
  }
  const F = FRAMES[p.a];
  const stamp = `${Math.floor(p.t * PAINT_FPS + 1e-6)}`;
  const aim: [number, number] = [p.b, p.c];
  const s = liveFrom(`${n}:floor`, stamp, FX_CANVAS.ax, FX_CANVAS.ay, () => fxPainted(which, p.t, F.view, aim));
  if (!s) return;
  const [sx, sy] = c.at(p.x, p.y);
  drawAt(c, s, sx, sy, F.flip);
}

/** The coals in the air, each a burning lump with its trail, among the figures at its own depth. */
function air(c: Act1FxCtx, p: Peril): void {
  const since = p.t - ST_COALS.hit;
  if (since < 0 || since > 1.2) return;
  const F = FRAMES[p.a];
  const from = fromOf();
  const aim: [number, number] = [p.b, p.c];
  for (let i = 0; i < COALS.n; i++) {
    const q = coalAt(i, since, from, aim);
    if (!q) continue;
    const q0 = coalAt(i, Math.max(0, since - 1 / 30), from, aim) ?? q;
    const [wx, wy] = spotOf(F, p.x, p.y, q[0], q[1]);
    const [sx, sy] = c.at(wx, wy);
    // (picture pixels: the way it came, for its trail; its height)
    const [ax, ay] = fxAt(F.view, q[0], q[1], q[2] * TILE3 * 0.82);
    const [bx, by] = fxAt(F.view, q0[0], q0[1], q0[2] * TILE3 * 0.82);
    const [gx, gy] = fxAt(F.view, q[0], q[1], 0);
    const flip = F.flip ? -1 : 1;
    const px = new Px(40, 40);
    coalInAir(px, 20, 20, since, i, [(bx - ax) * flip, by - ay]);
    const s = toSprite({ px, lights: [] }, null, 20, 20 - (ay - gy));
    c.stand(wx + wy, s, sx, sy);
    c.spot(sx, sy + (ay - gy) / 2, 14, 0.4);
  }
}

/** THE GEAR, lying where it came to rest, glinting, until it is taken: once his death is done (his last frame shows it till then). */
function gear(c: Act1FxCtx, p: Peril): void {
  if (p.t < ST_DIES.long || p.t >= p.dur) return;
  const f = Math.floor(c.t * GEAR_GLINT.fps) % GEAR_GLINT.frames;
  const s = STOKER_ROOM.gearDropped(f);
  const [sx, sy] = c.at(p.x, p.y);
  c.stand(p.x + p.y, s, sx, sy);
  c.spot(sx, sy, 16, 0.35);
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p) return;
    if (p.a1 === COALS_PERIL || p.a1 === RAKE_PERIL || p.a1 === RING_PERIL || p.a1 === BLAST_PERIL) ground(c, p);
  },
  standing(c, m, p) {
    if (m || !p) return;
    if (p.a1 === COALS_PERIL) air(c, p);
    else if (p.a1 === GEAR_PERIL) gear(c, p);
  },
};
