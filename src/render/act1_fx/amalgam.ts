// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY (game/bosses.ts AM_ACTION): what its moves leave on the floor and send over
// it, drawn (render/act1_fx/types.ts), from the art chat's pictures (art/amalgam_action_fx.ts, his yes to them, 1 Nov 2026). Its
// moves are in its own pictures (art/amalgam_action.ts, AMALGAM_ACTION); its arms of the dead are render/bossfx.ts's; here:
// - WHILE IT ACTS: each of its grasping fan's dozen arms' lines marked on the floor from FAN.mark to their landing, a claw's three
//   slashes at each line's end (the art chat's scene, src/dev/action_fixes2_scene.ts fanScene); each rake's arc marked on the floor
//   from when its arm is hauled up to its blow; the devour's cone marked from its warning to its rake (the warning's own dots, as the
//   bosses' marks are drawn: art/boss_shots.ts);
// - A RING of its slam (AM_RING, `d` its radius): slamRingPainted, on the floor and in the air by halves;
// - A RAKE'S GOUGES (AM_RAKE, `c` which): rakeFloorPainted, on the floor, seen as it was;
// - A SKULL OF THE RAIN (AM_DROP): its shadow and its mark from the second before it lands, its burst and its scuff after
//   (dropPainted 'floor', 'air' by halves); the skull itself in flight from its niche (dropAt, makeRainSkullArt), over everything.
import { ACT_CANVAS, FAN, FAN_HIT, RAKES, SWIPE_HITS, DEVOUR_HITS, fanLines } from '../../art/amalgam_action';
import { DROP_CANVAS, RAIN, RAIN_SKULL_FRAMES, SLAM_RING, dropAt, dropPainted, makeRainSkullArt, rakeFloorPainted, slamRingCanvas, slamRingPainted } from '../../art/amalgam_action_fx';
import type { Drop } from '../../art/amalgam_action_fx';
import { toSprite } from '../../art/kit';
import { FLAME } from '../../art/mkit';
import { drawSprite, flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { AM2, AM_DROP, AM_RAKE, AM_RING, actDef } from '../../game/bosses';
import { backView, beside, flipped } from '../../game/facing';
import type { Peril } from '../../game/state';
import type { Act1Fx, Act1FxCtx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
type Layer = 'floor' | 'behind' | 'before';
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
function made(key: string, make: () => Sprite): Sprite {
  let s = MADE.get(key);
  if (!s) MADE.set(key, (s = make()));
  return s;
}
const ring = (what: Layer, k: number, r: number): Sprite =>
  made(`ring:${what}:${k}:${r}`, () => {
    const C = slamRingCanvas(r);
    return toSprite(slamRingPainted(k / FPS, what === 'floor' ? 'floor' : 'air', r, what === 'floor' ? 'all' : what), null, C.ax, C.ay);
  });
const gouge = (k: number, i: number, back: boolean): Sprite => made(`rake:${k}:${i}:${back ? 1 : 0}`, () => toSprite(rakeFloorPainted(k / FPS, i, back ? 'back' : 'front'), null, ACT_CANVAS.ax, ACT_CANVAS.ay));
const drop = (what: Layer, k: number, seed: number): Sprite =>
  made(`drop:${what}:${k}:${seed % 8}`, () => toSprite(dropPainted(k / FPS, what === 'floor' ? 'floor' : 'air', seed % 8, what === 'floor' ? 'all' : what), null, DROP_CANVAS.ax, DROP_CANVAS.ay));
let SKULLS: Sprite[] | null = null;

/** A dot of the warning, as the bosses' marks are drawn. */
function dot(g: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), 1, 1);
}
/** The warning's dots along a line of the floor from (x0, y0) to (x1, y1), `k` (0 to 1) of the way to its full strength. */
function dotLine(c: Act1FxCtx, x0: number, y0: number, x1: number, y1: number, k: number): void {
  const g = c.g!;
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) * 9));
  const was = g.globalAlpha;
  g.globalAlpha = was * Math.min(1, 0.25 + 0.75 * k);
  for (let i = 0; i <= n; i++) {
    const [sx, sy] = c.at(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
    dot(g, sx, sy, i % 3 === 0 ? FLAME[3] : FLAME[2]);
  }
  g.globalAlpha = was;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m) {
      // (its marks while it acts)
      const act = m.act;
      if (!act || m.state !== 'act' || !m.seen) return;
      const at = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
      const T = act.t;
      if (act.id === 'am:fan') {
        if (T < FAN.mark || T >= FAN_HIT) return;
        // (each arm's line, drawn out from it, full by 0.45 s; a claw's three slashes where it will close)
        const k = clamp01((T - FAN.mark) / 0.35);
        for (const { deg, reach } of fanLines()) {
          const th = (deg * Math.PI) / 180;
          const a = at(FAN.near * Math.cos(th), FAN.near * Math.sin(th));
          const end = FAN.near + (reach - FAN.near) * k;
          const b = at(end * Math.cos(th), end * Math.sin(th));
          dotLine(c, a.x, a.y, b.x, b.y, k);
          if (k > 0.95) {
            const [sx, sy] = c.at(b.x, b.y);
            for (let j = -1; j <= 1; j++) for (let i = -3; i <= 3; i++) dot(c.g, sx + i + j * 3, sy + i * 0.5 - j, FLAME[3]);
          }
        }
      } else if (act.id === 'swipe') {
        for (let i = 0; i < 2; i++) {
          if (T < AM2.rakeMark[i] || T >= SWIPE_HITS[i]) continue;
          const k = clamp01((T - AM2.rakeMark[i]) / (SWIPE_HITS[i] - AM2.rakeMark[i]));
          const [a0, a1] = AM2.arcs[i].map((d) => (d * Math.PI) / 180);
          const out = RAKES[i].out;
          // (its arc, and its two edges in from it)
          const n = Math.round((a1 - a0) * out * 6);
          const pts: { x: number; y: number }[] = [];
          for (let j = 0; j <= n; j++) {
            const a = a0 + ((a1 - a0) * j) / n;
            pts.push(at(Math.cos(a) * out, Math.sin(a) * out));
          }
          for (let j = 0; j < pts.length - 1; j++) dotLine(c, pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y, k);
          const e0 = at(Math.cos(a0) * 0.8, Math.sin(a0) * 0.8);
          const e1 = at(Math.cos(a1) * 0.8, Math.sin(a1) * 0.8);
          dotLine(c, e0.x, e0.y, pts[0].x, pts[0].y, k);
          dotLine(c, e1.x, e1.y, pts[pts.length - 1].x, pts[pts.length - 1].y, k);
        }
      } else if (act.id === 'devour' && actDef(m) && T >= AM2.devour.warn && T < DEVOUR_HITS[0]) {
        const D = AM2.devour;
        const k = clamp01((T - D.warn) / (DEVOUR_HITS[0] - D.warn));
        const P = [at(D.near, D.narrow), at(D.reach, D.wide), at(D.reach + D.end, 0), at(D.reach, -D.wide), at(D.near, -D.narrow)];
        for (let j = 0; j < P.length; j++) {
          const q = P[(j + 1) % P.length];
          dotLine(c, P[j].x, P[j].y, q.x, q.y, k);
        }
      }
      return;
    }
    if (!p) return;
    const k = Math.floor(p.t * FPS);
    if (p.a1 === AM_RING) {
      if (p.t < 0 || p.t > SLAM_RING.long) return;
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, ring('floor', k, p.d), sx, sy);
    } else if (p.a1 === AM_RAKE) {
      if (p.t < 0 || p.t > p.dur) return;
      const [sx, sy] = c.at(p.x, p.y);
      const s = gouge(k, p.c, backView(p.fx, p.fy));
      drawSprite(c.g, flipped(p.fx, p.fy) ? flipSprite(s) : s, sx, sy);
    } else if (p.a1 === AM_DROP) {
      // (its shadow and mark the second before it lands; its burst and scuff after)
      if (p.t < -RAIN.fly || p.t > RAIN.mite.scuff) return;
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, drop('floor', k, p.d), sx, sy);
    }
  },
  standing(c, m, p) {
    if (m || !p || p.t < 0) return;
    const k = Math.floor(p.t * FPS);
    if (p.a1 === AM_RING && p.t <= SLAM_RING.long) {
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y - 0.02, ring('behind', k, p.d), sx, sy);
      c.stand(p.x + p.y + 0.02, ring('before', k, p.d), sx, sy);
    } else if (p.a1 === AM_DROP && p.t <= RAIN.mite.scuff) {
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y - 0.02, drop('behind', k, p.d), sx, sy);
      c.stand(p.x + p.y + 0.02, drop('before', k, p.d), sx, sy);
    }
  },
  air(c, m, p) {
    if (m || !p || !c.g || p.a1 !== AM_DROP || p.t < -RAIN.fly || p.t >= 0) return;
    // (the skull in flight, out of its niche and down onto its shadow, tumbling)
    const d: Drop = { at: [p.x, p.y], wave: 0, leave: 0, land: 0, from: [p.b, p.c], seed: p.d };
    const [x, y, z] = dropAt(d, (p.t + RAIN.fly) / RAIN.fly);
    const frames = (SKULLS ??= makeRainSkullArt('front'));
    const s = frames[(Math.floor((p.t + RAIN.fly) * RAIN_SKULL_FRAMES * 2.2) + p.d) % RAIN_SKULL_FRAMES];
    const [sx, sy] = c.at(x, y);
    drawSprite(c.g, s, sx, Math.round(sy - z));
  },
};
