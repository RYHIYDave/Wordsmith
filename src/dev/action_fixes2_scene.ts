// Pictures of THE SECOND ROUND OF FIXES (docs/mockups/action_fixes, 2 Nov 2026): the five that lost their hit-hit-slam combo, each with
// its new move on a stand-in for its own floor, with the knight: the Amalgamation's grasping fan (floor 4's ossuary), the Crier's toll
// (floor 11's square), the Hushed reaper's sickle boomerang (floor 13's fields), the Hushed gardener's shear lunge and the palace guard's
// javelin (floor 16's gardens). Each figure is laid at its floor point, and what it marks and sends out is placed through the figure's
// own projection (so that it lies where the figure's own picture puts it, both ways round). Made outside a browser
// (tools/action_fixes2_film.ts, tools/action_fixes2_sheet.ts). Nothing of the game imports it. THE FLOORS ARE STAND-INS.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { hash } from '../art/kit';
import { makeHeroArt3 } from '../art/heroes3';
import { TILE3, mobSet } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { markRing, pen } from '../art/action_f6_fx';
import { FAN, FAN_HIT, FAN_LONG, amalgamActionMob, fanLines } from '../art/amalgam_action';
import { TOLL, TOLL_HITS, TOLL_LONG, crierActionMob } from '../art/crier_action';
import { paintToll } from '../art/crier_action_fx';
import { BOOM, BOOM_CATCH, BOOM_HIT, BOOM_REAPER, SPIN_CANVAS, boomAt, boomCurve, sicklePainted } from '../art/action_f11_field';
import { CLIP_CANVAS, LUNGE, LUNGE_GARDENER, LUNGE_HIT, LUNGE_TRAVEL_TILES, clippingsPainted, snapAt } from '../art/action_f16_gardener';
import { FLIGHT_CANVAS, JAV, JAV_PARTISAN, JAV_PARTISAN_SWORD, JAV_SWORD, PULL, STUCK, STUCK_CANVAS, javAt, javFly, spearFlying, spearStuck } from '../art/action_f16_guard';
import { compose, laid } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
export const LEAD = 0.4;
const smooth = (k: number): number => {
  const u = k < 0 ? 0 : k > 1 ? 1 : k;
  return u * u * (3 - 2 * u);
};
const MARK = ['#7a1058', '#e0287a', '#3a0820'] as const;
const PINKS = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
const HUSHC = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4', '#d8d0f0'] as const;

// ---------------------------------------------------------------------------------------------
// FIGURES AND PLACES

const ARTS = new Map<string, ActorArt>();
/** A figure as the game would hold it (its frames painted once). */
export function artOf(mob: Mob): ActorArt {
  let a = ARTS.get(mob.id);
  if (!a) ARTS.set(mob.id, (a = { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) }));
  return a;
}
const hero = (): ActorArt => artOf2('hero', () => makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt);
function artOf2(key: string, make: () => ActorArt): ActorArt {
  let a = ARTS.get(key);
  if (!a) ARTS.set(key, (a = make()));
  return a;
}
/** Where a point of the floor in a figure's own space (its own lengths; it at `A` on the scene) is on the scene, as its picture puts it. */
export function onFig(A: readonly [number, number], view: View, p: V3, trueBack = false): [number, number] {
  const q = project(p, view === 'back' && trueBack ? 'rear' : view);
  return [A[0] + q[0], A[1] + q[1]];
}
/** A figure-space floor point `x` tiles before it and `y` to its left. */
const T = (x: number, y = 0): V3 => [x * TILE3, y * TILE3, 0];
/** One doing a move from `start`, standing before and after it. */
function doing(art: ActorArt, view: View, move: string, long: number, t: number, start: number): Laid {
  const m = t - start;
  if (m >= 0 && m < long) return frameAt(art, view, move, m);
  return frameAt(art, view, 'stand', ((m < 0 ? t : m - long) % 2.4 + 2.4) % 2.4);
}
/** The knight at scene point `K`, facing the figure at `F`: seen from behind if he is below it (he faces up the screen), turned if he is right of it. */
function knightAt(K: [number, number], F: readonly [number, number], walking: boolean, t: number, struck = -1): Stood {
  const v: View = K[1] > F[1] ? 'back' : 'front';
  let l = struck >= 0 && struck < 8 / 30 ? frameAt(hero(), v, 'reel', struck) : frameAt(hero(), v, walking ? 'walk' : 'stand', walking ? t * 1.4 : t);
  if (struck >= 0 && struck < 0.25) l = { ...l, ax: l.ax + Math.round(3 * Math.sin((struck / 0.25) * Math.PI)) };
  return { at: K, l, flip: K[0] > F[0], shadow: 9 };
}
const copy = (base: Px): Px => {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  return p;
};
function layLights(px: Px, lights: Light[]): void {
  for (const l of lights) {
    const [lr, lg, lb] = [parseInt(l.color.slice(1, 3), 16), parseInt(l.color.slice(3, 5), 16), parseInt(l.color.slice(5, 7), 16)];
    const r = Math.round(l.r);
    for (let y = Math.max(0, Math.round(l.y - r)); y < Math.min(px.h, Math.round(l.y + r)); y++) {
      for (let x = Math.max(0, Math.round(l.x - r)); x < Math.min(px.w, Math.round(l.x + r)); x++) {
        const d = Math.hypot(x - l.x, (y - l.y) * 1.3) / r;
        if (d >= 1) continue;
        const k = (Math.round((1 - d) * (l.a ?? 0) * 4) / 4) * 0.6;
        if (k <= 0) continue;
        const i = (y * px.w + x) * 4;
        px.d[i] = Math.min(255, px.d[i] + (lr - px.d[i] * 0.3) * k * 0.5);
        px.d[i + 1] = Math.min(255, px.d[i + 1] + (lg - px.d[i + 1] * 0.3) * k * 0.5);
        px.d[i + 2] = Math.min(255, px.d[i + 2] + (lb - px.d[i + 2] * 0.3) * k * 0.5);
      }
    }
  }
}
/** A dashed line of the enemy's pink on the floor between two scene points, `k` of it laid from the first. */
function dashLine(px: Px, a: [number, number], b: [number, number], k: number, thick = 1): void {
  const dot = pen(px, true);
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]));
  for (let i = 0; i <= n * k; i++) {
    if (i % 7 >= 5) continue;
    const x = a[0] + ((b[0] - a[0]) * i) / n;
    const y = a[1] + ((b[1] - a[1]) * i) / n;
    dot(x, y, i % 7 === 1 ? MARK[1] : MARK[0]);
    dot(x, y + 1, MARK[2]);
    if (thick > 1) {
      dot(x + 1, y, MARK[1]);
      dot(x, y - 1, MARK[0]);
    }
  }
}
/** A ring of the enemy's pink round a scene point (`r` tiles). */
const ringAt = (px: Px, C: [number, number], r: number, k: number, spin = 0): void => markRing(px, Math.round(C[0]), Math.round(C[1]), r, k, MARK, spin);
const withLaid = (p: { px: Px }, ax: number, ay: number): Laid => laid(p.px, ax, ay);

// ---------------------------------------------------------------------------------------------
// 1. THE AMALGAMATION'S GRASPING FAN: each arm's line marked; the dozen arms out across the floor, snatching, hauled back

export const FAN_PASS = LEAD + FAN_LONG + 0.3;
/** `caught`: the knight stands in an arm's line and is snatched; else he steps into the gap between two. */
export function fanScene(view: View, t: number, base: Px, A: [number, number], caught: boolean): Px {
  const mob = amalgamActionMob();
  const m = t - LEAD;
  const px = new Px(base.w, base.h);
  // (the knight: 3.4 tiles before it; stepping aside into the gap between two arms as the lines are marked, or not)
  const step = caught ? 0 : smooth((m - 0.45) / 0.35) * 0.62;
  const Kp = T(3.4, -0.1 + step);
  const K = onFig(A, view, Kp);
  // THE LINES, each arm's, marked on the floor from its first swelling, full by 0.45 s; gone as they land
  if (m > FAN.mark && m < FAN_HIT + 0.05) {
    const k = smooth((m - FAN.mark) / 0.35);
    for (const { deg, reach } of fanLines()) {
      const th = (deg * Math.PI) / 180;
      const a = onFig(A, view, T(FAN.near * Math.cos(th), FAN.near * Math.sin(th)));
      const b = onFig(A, view, T(reach * Math.cos(th), reach * Math.sin(th)));
      dashLine(px, a, b, k, 2);
      if (k > 0.95) {
        // (a claw's mark where it will close: three short slashes)
        const dot = pen(px, true);
        for (let j = -1; j <= 1; j++) for (let i = -3; i <= 3; i++) dot(b[0] + i + j * 3, b[1] + i * 0.5 - j, MARK[1]);
      }
    }
  }
  const stood: Stood[] = [
    { at: A, l: doing(artOf(mob), view, 'attack', FAN_LONG, t, LEAD), shadow: 30 },
    knightAt(K, A, !caught && m > 0.45 && m < 0.8, t, caught ? m - FAN_HIT : -1),
  ];
  return compose(copy(base), [{ at: [0, 0], l: laid(px, 0, 0) }], stood);
}

// ---------------------------------------------------------------------------------------------
// 2. THE CRIER'S TOLL: each toll marks where the knight is then; it bursts a beat later

// (the toll's floor painter: moved into art/crier_action_fx.ts paintToll as it was brought in, 2 Nov 2026)
const tollFloor = paintToll;
export const TOLL_PASS = LEAD + TOLL_LONG + 0.4;
/** The knight's way round the Crier (tiles from him: before him, to his left), `m` seconds into the toll: `still` he stands through the first two tolls, then runs. */
export function tollPath(m: number, still: boolean): [number, number, boolean] {
  const start = still ? TOLL_HITS[1] + 0.25 : 0.4;
  const u = Math.max(0, m - start);
  const a = -0.5 + u * 1.25;
  const run = m > start && m < TOLL_HITS[4] + 0.35;
  const uu = Math.min(u, TOLL_HITS[4] + 0.35 - start);
  const aa = -0.5 + uu * 1.25;
  void a;
  return [3.9 * Math.cos(aa), 3.9 * Math.sin(aa), run];
}
export function tollScene(view: View, t: number, base: Px, A: [number, number], still: boolean): Px {
  const mob = crierActionMob();
  const m = t - LEAD;
  const px = new Px(base.w, base.h);
  const [kx, ky, run] = tollPath(m, still);
  const K = onFig(A, view, T(kx, ky));
  // (each toll's mark where he stood as it was rung; struck if he is within it as it bursts)
  let struck = -1;
  for (const h of TOLL_HITS) {
    const [x0, y0] = tollPath(h, still);
    tollFloor(px, onFig(A, view, T(x0, y0)), m - h);
    const [x1, y1] = tollPath(h + TOLL.burst, still);
    if (m >= h + TOLL.burst && Math.hypot(x1 - x0, y1 - y0) <= TOLL.r) struck = Math.max(struck, m - h - TOLL.burst);
  }
  const stood: Stood[] = [
    { at: A, l: doing(artOf(mob), view, 'attack', TOLL_LONG, t, LEAD), shadow: 16 },
    knightAt(K, A, run, t, struck),
  ];
  return compose(copy(base), [{ at: [0, 0], l: laid(px, 0, 0) }], stood);
}

// ---------------------------------------------------------------------------------------------
// 3. THE REAPER'S SICKLE BOOMERANG: its curve marked; flung; spinning out and round and back; caught, a stagger

export const BOOM_PASS = LEAD + BOOM.long + 0.3;
/** The knight's place (tiles before the reaper, to its left) `m` seconds into the throw: on the curve's way out; ducking out of it as it comes, and out of its way back. */
export function boomKnight(m: number): [number, number, boolean] {
  const a = smooth((m - 0.62) / 0.3);
  const b = smooth((m - 1.45) / 0.3);
  return [4.6 - 0.3 * a, 1.2 - 1.15 * a - 0.1 * b, (m > 0.62 && m < 0.92) || (m > 1.45 && m < 1.75)];
}
export function boomScene(view: View, t: number, base: Px, A: [number, number]): Px {
  const m = t - LEAD;
  const px = new Px(base.w, base.h);
  // THE CURVE, marked from the drawing back; gone behind it as it comes home
  if (m > BOOM.mark && m < BOOM_CATCH) {
    const k = smooth((m - BOOM.mark) / 0.4);
    const gone = m > BOOM_HIT ? (m - BOOM_HIT) / BOOM.fly : 0;
    const pts = boomCurve(240).map(([x, y]) => onFig(A, view, T(x, y)));
    const dot = pen(px, true);
    const n = Math.round(pts.length * k);
    for (let i = Math.round(pts.length * gone); i < n; i++) {
      if (i % 6 >= 4) continue;
      const [x, y] = pts[i];
      dot(x, y, '#ffb0cc');
      dot(x + 1, y, MARK[1]);
      dot(x - 1, y, MARK[1]);
      dot(x, y - 1, MARK[1]);
      dot(x + 1, y - 1, MARK[0]);
      dot(x, y + 1, MARK[2]);
      dot(x + 1, y + 1, MARK[2]);
    }
    // (its edges, as far out as it strikes, dotted)
    const c = boomCurve(120);
    for (let i = Math.round(c.length * gone); i < Math.round(c.length * k); i += 2) {
      const [x, y] = c[i];
      const [nx, ny] = c[Math.min(c.length - 1, i + 1)];
      const L = Math.hypot(nx - x, ny - y) || 1;
      for (const sg of [-1, 1]) {
        const q = onFig(A, view, T(x - ((ny - y) / L) * BOOM.r * sg, y + ((nx - x) / L) * BOOM.r * sg));
        dot(q[0], q[1], MARK[0]);
        dot(q[0], q[1] + 1, MARK[2]);
      }
    }
  }
  const [kx, ky, kw] = boomKnight(m);
  const K = onFig(A, view, T(kx, ky));
  const stood: Stood[] = [
    { at: A, l: doing(artOf(BOOM_REAPER), view, 'attack', BOOM.long, t, LEAD), shadow: 10 },
    knightAt(K, A, kw, t),
  ];
  const lights: Light[] = [];
  const p = boomAt(m);
  if (p) {
    const F = onFig(A, view, T(p.x, p.y));
    // (its shadow on the floor under it)
    const dot = pen(px, true);
    for (let j = -2; j <= 2; j++) for (let i = -5 + Math.abs(j); i <= 5 - Math.abs(j); i++) if ((i + j) % 2 === 0) dot(F[0] + i, F[1] + j, '#0e0c14');
    const s = sicklePainted(m, view);
    stood.push({ at: F, l: withLaid(s, SPIN_CANVAS.ax, SPIN_CANVAS.ay) });
    lights.push(...s.lights.map((l) => ({ ...l, x: l.x + F[0] - SPIN_CANVAS.ax, y: l.y + F[1] - SPIN_CANVAS.ay })));
  }
  const out = compose(copy(base), [{ at: [0, 0], l: laid(px, 0, 0) }], stood);
  layLights(out, lights);
  return out;
}

// ---------------------------------------------------------------------------------------------
// 4. THE GARDENER'S SHEAR LUNGE: the lane marked through the long crouch; three tiles in two frames; the blades shut

export const LUNGE_PASS = LEAD + LUNGE.long + 0.4;
export function lungeScene(view: View, t: number, base: Px, A: [number, number], caught: boolean): Px {
  const m = t - LEAD;
  const px = new Px(base.w, base.h);
  // THE LANE, from him across the lawn, while he crouches
  if (m > LUNGE.mark && m < LUNGE_HIT + 0.05) {
    const k = smooth((m - LUNGE.mark) / 0.35);
    for (const sg of [-1, 1]) dashLine(px, onFig(A, view, T(0.3, sg * LUNGE.half)), onFig(A, view, T(LUNGE.lane, sg * LUNGE.half)), k, 2);
    dashLine(px, onFig(A, view, T(LUNGE.lane, -LUNGE.half)), onFig(A, view, T(LUNGE.lane, LUNGE.half)), k);
    const [sx, sy] = snapAt();
    if (k > 0.5) ringAt(px, onFig(A, view, T(sx, sy)), LUNGE.snap, smooth((k - 0.5) * 2), m * 0.6);
  }
  // (the knight 3.3 tiles off: out of the lane sideways just before, or caught at its end)
  const aside = caught ? 0 : smooth((m - 0.82) / 0.3) * 1.5;
  const K = onFig(A, view, T(3.6, -0.15 - aside));
  const done = m >= LUNGE.long;
  const F = done ? onFig(A, view, T(LUNGE_TRAVEL_TILES)) : A;
  const stood: Stood[] = [
    { at: F, l: doing(artOf(LUNGE_GARDENER), view, 'attack', LUNGE.long, t, LEAD), shadow: 0 },
    knightAt(K, A, !caught && m > 0.82 && m < 1.12, t, caught ? m - LUNGE_HIT : -1),
  ];
  // (the shadow under him, where he is)
  const lights: Light[] = [];
  if (m >= LUNGE_HIT) {
    const [sx, sy] = snapAt();
    const P = onFig(A, view, T(sx, sy));
    const C = CLIP_CANVAS;
    const air = (side: 'behind' | 'before'): Laid => withLaid(clippingsPainted(m - LUNGE_HIT, 'air', side, 0.75), C.ax, C.ay);
    stood.push({ at: [P[0], P[1] - 0.5], l: air('behind') }, { at: [P[0], P[1] + 0.5], l: air('before') });
  }
  const out = compose(copy(base), [{ at: [0, 0], l: laid(px, 0, 0) }], stood);
  layLights(out, lights);
  return out;
}

// ---------------------------------------------------------------------------------------------
// 5. THE PALACE GUARD'S JAVELIN: where you stand marked; hurled; it sticks quivering in a burst of turf; his sword drawn

/** How far the throw goes (tiles: where the knight stood as it left the hand). */
export const JAV_D = 4.6;
export const javLands = (who: 'partisan' | 'sword'): number => JAV[who].hit + javFly(JAV_D);
export const javPass = (who: 'partisan' | 'sword'): number => LEAD + JAV[who].long + 0.7;
export function javScene(view: View, t: number, base: Px, A: [number, number], who: 'partisan' | 'sword'): Px {
  const m = t - LEAD;
  const px = new Px(base.w, base.h);
  const J = JAV[who];
  const mob = who === 'partisan' ? JAV_PARTISAN : JAV_SWORD;
  const land = javLands(who);
  const L = onFig(A, view, T(JAV_D), true);
  // (where he stands MARKED while it is held back; the knight dives out of it as it is hurled)
  if (m > J.haul - 0.3 && m < land) ringAt(px, L, JAV.r, smooth((m - J.haul + 0.3) / 0.3), m * 0.5);
  const dive = smooth((m - J.strike[0] + 0.05) / 0.3) * 2.1;
  const K = onFig(A, view, T(JAV_D + 0.2, -dive), true);
  const lights: Light[] = [];
  const stood: Stood[] = [
    { at: A, l: m < J.long ? doing(artOf(mob), view, 'javelin', J.long, t, LEAD) : frameAt(artOf(who === 'partisan' ? JAV_PARTISAN_SWORD : mob), view, 'stand', m - J.long), shadow: 13 },
    knightAt(K, A, m > J.strike[0] - 0.05 && m < J.strike[0] + 0.3, t),
  ];
  if (m > J.hit && m < land) {
    const u = m - J.hit;
    const j = javAt(who, u, JAV_D);
    const P = onFig(A, view, T(j.x), true);
    const f = spearFlying(who, u, JAV_D, view);
    stood.push({ at: P, l: withLaid(f, FLIGHT_CANVAS.ax, FLIGHT_CANVAS.ay) });
  }
  if (m >= land) {
    const s = spearStuck(who, m - land, view);
    stood.push({ at: L, l: withLaid(s, STUCK_CANVAS.ax, STUCK_CANVAS.ay) });
    const C = CLIP_CANVAS;
    const fl = clippingsPainted(m - land, 'floor', 'all', 1);
    const floor = [{ at: L, l: withLaid(fl, C.ax, C.ay) }];
    stood.push({ at: [L[0], L[1] - 0.5], l: withLaid(clippingsPainted(m - land, 'air', 'behind', 1), C.ax, C.ay) }, { at: [L[0], L[1] + 0.5], l: withLaid(clippingsPainted(m - land, 'air', 'before', 1), C.ax, C.ay) });
    const out = compose(copy(base), [{ at: [0, 0] as [number, number], l: laid(px, 0, 0) }, ...floor], stood);
    layLights(out, lights);
    return out;
  }
  return compose(copy(base), [{ at: [0, 0], l: laid(px, 0, 0) }], stood);
}
/** THE PULL-OUT: the partisan guard, his sword out, walks to his partisan stuck in the turf and wrenches it out. */
export const PULL_WALK = 1.4;
export const PULL_PASS = LEAD + PULL_WALK + PULL.long + 0.4;
export function pullScene(view: View, t: number, base: Px, A: [number, number]): Px {
  const m = t - LEAD;
  const px = new Px(base.w, base.h);
  const stuckAt = JAV_D;
  const to = stuckAt - STUCK.tip[0] / TILE3;
  const along = Math.min(1, Math.max(0, m / PULL_WALK)) * to;
  const F = onFig(A, view, T(along), true);
  const S = onFig(A, view, T(stuckAt), true);
  const sw = artOf(JAV_PARTISAN_SWORD);
  const pull = m - PULL_WALK;
  const fig = m < 0 ? frameAt(sw, view, 'stand', t) : m < PULL_WALK ? frameAt(sw, view, 'walk', m) : pull < PULL.long ? frameAt(sw, view, 'pullOut', pull) : frameAt(artOf(JAV_PARTISAN), view, 'stand', pull - PULL.long);
  const stood: Stood[] = [{ at: F, l: fig, shadow: 13 }];
  if (pull < 0) stood.push({ at: S, l: withLaid(spearStuck('partisan', 3, view), STUCK_CANVAS.ax, STUCK_CANVAS.ay) });
  const K = onFig(A, view, T(stuckAt + 2.2, 1.6), true);
  stood.push(knightAt(K, F, false, t));
  if (pull > PULL.free - 0.05 && pull < PULL.free + 1.4) {
    const C = CLIP_CANVAS;
    const u = pull - PULL.free + 0.05;
    stood.push({ at: [S[0], S[1] - 0.5], l: withLaid(clippingsPainted(u, 'air', 'behind', 0.6), C.ax, C.ay) }, { at: [S[0], S[1] + 0.5], l: withLaid(clippingsPainted(u, 'air', 'before', 0.6), C.ax, C.ay) });
  }
  return compose(copy(base), [{ at: [0, 0], l: laid(px, 0, 0) }], stood);
}
