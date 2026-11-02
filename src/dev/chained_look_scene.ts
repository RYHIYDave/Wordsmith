// Pictures of THE CHAINED ONE IN HIS NEW LOOK, the gaunt chain-wraith (art/chained_look.ts, CHAINED_LOOK, off), for the owner: the
// scenes of src/dev/action_f3_chained_scene.ts (his approved moves in his pit with the knight for size) with him in his new look, as
// much bigger as he now is (the lash ends LOOK_TRAVEL on; the hook and the ball leave his hands where they now are); and his stand and
// walk, struck and dying, his chains breaking. Made outside a browser (tools/chained_look_film.ts, tools/chained_look_sheet.ts).
// Nothing of the game imports it. As the action scene's own header has it: his lash
// combo and its crack, his whirl and its ring, his hook, drag and blow, his ball whipped down and its ring (art/chained_action.ts,
// CHAINED_ACTION; on the floor, art/chained_action_fx.ts), in his pit (floor 1's stand-in floor of old stone flags, an arena about
// 17 by 20 tiles: dev/action_f1_scene.ts), with the knight for size, each figure at its floor point and sorted by it, as the game
// sorts them. What the game draws in its own pixels (a slam's red warning circle, a lane, the hook and the ball out across the room
// on their chains) is drawn as the game draws it (the circle and the lane by the game's own code through `PxCtx`, a stand-in for a
// canvas; the hook and the ball by their own pictures, art/bosses3.ts, their chains a line of links). Made outside a browser
// (tools/action_f3_chained_film.ts, tools/action_f3_chained_sheet.ts). Nothing of the game imports it.

import { Px } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { BALL_LET, BALL_LAND, BALL_LONG, HOOK_BACK, HOOK_BITE, HOOK_BLOW, HOOK_LONG, LASH_HITS, LASH_LONG, WHIRL_HIT, WHIRL_LONG, WHIRL_LOOP, WHIRL_SPIN, WHIRL_STILL } from '../art/chained_action';
import { LOOK_K, LOOK_TRAVEL, chainedLookMob, collarOf, cuffOf, lookBallPath, lookHookPath, makeChainedLookArt } from '../art/chained_look';
import { CRACK, CRACK_CANVAS, CRACK_MID, RING, crackPainted, ringCanvas, ringPainted } from '../art/chained_action_fx';
import { CHAINED, CO_BREAK_TIME, CO_DIE_TIME, makeBallShotArt, makeHookShotArt } from '../art/bosses3';
import type { CoFreed } from '../art/bosses3';
import { TILE3, paintViewOf, skeletonAt } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { drawChargeLane } from '../art/charge_lane';
import { makeHeroArt3 } from '../art/heroes3';
import { P } from '../art/palette';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { PxCtx, frameAt } from './action_f3_scene';
import { spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};

// ---------------------------------------------------------------------------------------------
// The figures, and where things of his are on the floor

const ARTS: Partial<Record<CoFreed, ActorArt>> = {};
let HERO: ActorArt | null = null;
/** The Chained One in his new look as the game would hold him with CHAINED_LOOK on (at the game's pace), as free as he is; the knight. */
export function figures(freed: CoFreed = 0): { co: ActorArt; knight: ActorArt } {
  ARTS[freed] ??= makeChainedLookArt(CHAINED.pace, freed);
  HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt;
  return { co: ARTS[freed] as ActorArt, knight: HERO };
}
/** The way he faces on the floor (tiles): from in front, down-right (+x); from behind, up-right (-y); and the way his left is. */
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
const leftOf = (view: View): [number, number] => (view === 'front' ? [0, -1] : [-1, 0]);
/** A floor point `fwd` tiles before a spot and `left` to its left, as he faces. */
const before = (at: readonly [number, number], view: View, fwd: number, left = 0): [number, number] => {
  const [ax, ay] = ahead(view);
  const [lx, ly] = leftOf(view);
  return [at[0] + ax * fwd + lx * left, at[1] + ay * fwd + ly * left];
};
/** A point of his own space (his own lengths) on the scene, from his floor point there. */
const onScene = (p: V3, view: View, x: number, y: number, k: number): [number, number] => {
  const r = project(p, paintViewOf(CHAINED, view));
  return [x + r[0] * k, y + r[1] * k];
};

/** THE GAME'S WARNING CIRCLE (render/render.ts, a 'warn' zone): its faint ground, its fill growing from its middle, its dotted edge. */
function warnCircle(px: Px, cx: number, cy: number, r: number, k: number, kk: number): void {
  const g = new PxCtx(px, 2 * kk);
  const ellipse = (rr: number, color: string, alpha: number): void => {
    g.globalAlpha = alpha;
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(cx / (2 * kk), cy / (2 * kk), rr * 22.6, rr * 11.3);
    g.fill();
    g.globalAlpha = 1;
  };
  ellipse(r, P.bl3, 0.16 + 0.3 * k);
  ellipse(r * clamp01(k), P.bl4, 0.3);
  g.fillStyle = P.bl5;
  const n = Math.max(16, Math.round(r * 44));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.fillRect(Math.round(cx / (2 * kk) + (Math.cos(a) - Math.sin(a)) * 16 * r), Math.round(cy / (2 * kk) + (Math.cos(a) + Math.sin(a)) * 8 * r), 1, 1);
  }
}
/** The floor point (tiles from the scene's middle) where the game's own drawings put it: in the game's pixels. */
const gameAt = (cx: number, cy: number, k: number) => (x: number, y: number): readonly [number, number] => {
  const [X, Y] = onFloor(x, y, cx, cy, k);
  return [X / 2, Y / 2];
};
/** A chain out across the room, as a line of iron links from (x0, y0) to (x1, y1) on the scene, sagging `sag` scene pixels. */
function chainOut(px: Px, x0: number, y0: number, x1: number, y1: number, sag: number, k: number): void {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (2.4 * k)));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = x0 + (x1 - x0) * u;
    const y = y0 + (y1 - y0) * u + sag * 4 * u * (1 - u);
    const c = i % 2 ? '#4a4870' : '#8e8cb4';
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) px.set(Math.round(x) + a, Math.round(y) + b, c);
    if (i % 2 === 0) for (let a = 0; a < k; a++) px.set(Math.round(x) + a, Math.round(y) - 1, '#2a2840');
  }
}
/** A picture standing on the floor at a scene point, sorted with the rest. */
const standing = (at: [number, number], l: Laid, more: Partial<Stood> = {}): Stood => ({ at, l, ...more });
/** The air layer of a floor effect by halves, at its anchor (behind a figure there, and before it). */
const airHalves = (C: [number, number], behind: Laid, ahead2: Laid): Stood[] => [standing([C[0], C[1] - 0.5], behind), standing([C[0], C[1] + 0.5], ahead2)];
/** A scene's floor to draw on (a copy of `base`). */
function floorOf(base: Px): Px {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  return p;
}
/** The knight standing or walking at `K` (tiles), turned toward him at `B` (tiles), as the game turns a figure. */
function knightStood(knight: ActorArt, K: readonly [number, number], B: readonly [number, number], walking: boolean, t: number, cx: number, cy: number, k: number): Stood {
  const [kx, ky] = onFloor(K[0], K[1], cx, cy, k);
  const [bx, by] = onFloor(B[0], B[1], cx, cy, k);
  return standing([kx, ky], frameAt(knight, ky < by ? 'front' : 'back', walking ? 'walk' : 'stand', t), { flip: kx > bx, shadow: 9 });
}

/** How long he stands before he begins (seconds). */
export const LEAD = 0.4;

// ---------------------------------------------------------------------------------------------
// THE LASH: forehand, backhand, the finisher; the crack runs out along the floor

const LASH_FROM = -2.2;
/** The lash's scene at `t` seconds of its pass: he begins at LEAD; the knight a step out of his reach, giving ground; out of the crack's way as the finisher is held. */
export function lashScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, freed: CoFreed = 0): Px {
  const { co, knight } = figures(freed);
  const m = t - LEAD;
  const B0 = before([0, 0], view, LASH_FROM);
  const travel = LOOK_TRAVEL / TILE3;
  const done = m >= LASH_LONG;
  const at = done ? before(B0, view, travel) : B0;
  const fig = m < 0 ? frameAt(co, view, 'stand', t) : !done ? frameAt(co, view, 'attack', m) : frameAt(co, view, 'stand', m - LASH_LONG);
  // (the knight: a step out of reach; back a step as each blow comes; aside, out of the crack's lane, as the finisher is held)
  const back = 0.5 * smooth((m - 0.5) / 0.4) + 0.5 * smooth((m - 1.35) / 0.4);
  const aside = 3.0 * smooth((m - 2.3) / 0.5);
  const K = before(B0, view, 3.6 * LOOK_K + back, view === 'front' ? aside : -aside);
  const kWalk = (m > 0.5 && m < 0.9) || (m > 1.35 && m < 1.75) || (m > 2.3 && m < 2.8);
  const px0 = floorOf(base);
  // the finisher's lane, marked as the game marks a lane (from his fists going up), and the crack once it lands
  const hit = LASH_HITS[2];
  if (m >= 70 / 30 && m < hit) {
    const a = before(B0, view, 0.5);
    const b = before(B0, view, CRACK.to);
    drawChargeLane(new PxCtx(px0, 2 * k) as unknown as CanvasRenderingContext2D, { x0: a[0], y0: a[1], x1: b[0], y1: b[1], half: CRACK.half, k: clamp01((m - 70 / 30) / (hit - 70 / 30)) }, gameAt(cx, cy, k));
  }
  const since = m - hit;
  const C = onFloor(...before(B0, view, CRACK_MID), cx, cy, k);
  const way = ahead(view);
  const CC = CRACK_CANVAS;
  const stood: Stood[] = [
    standing(onFloor(at[0], at[1], cx, cy, k), fig, { shadow: 14 }),
    knightStood(knight, K, at, kWalk, t, cx, cy, k),
    ...airHalves(C, laid(crackPainted(since, 'air', way, 'behind'), CC.ax, CC.ay), laid(crackPainted(since, 'air', way, 'before'), CC.ax, CC.ay)),
  ];
  return compose(px0, [{ at: C, l: laid(crackPainted(since, 'floor', way), CC.ax, CC.ay) }], stood, k);
}
export const LASH_PASS = LEAD + LASH_LONG + 0.5;

// ---------------------------------------------------------------------------------------------
// THE WHIRL: gathered, the spin (the game plays two turns of it round once more, and walks him after you), the slam and its ring

/** How much longer the game makes his spin in the film (one more round of its loop). */
export const WHIRL_EXTRA = WHIRL_LOOP.span;
/** Where in his pictures the whirl is, `m` seconds in, its loop played round `WHIRL_EXTRA` more. */
export function whirlClock(m: number): number {
  const L = WHIRL_LOOP;
  if (m < L.at + L.span) return m;
  if (m < L.at + L.span + WHIRL_EXTRA) return L.at + ((m - L.at) % L.span);
  return m - WHIRL_EXTRA;
}
const WHIRL_FROM = -1.4;
/** The chase: how far the game has walked him after the knight, `m` seconds in (tiles; 1.7 a second as he spins). */
const chased = (m: number): number => 1.7 * Math.max(0, Math.min(m, WHIRL_STILL + WHIRL_EXTRA) - WHIRL_SPIN);
/** The whirl's scene at `t` seconds of its pass. */
export function whirlScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, freed: CoFreed = 0): Px {
  const { co, knight } = figures(freed);
  const m = t - LEAD;
  const pic = whirlClock(Math.max(0, m));
  const long = WHIRL_LONG + WHIRL_EXTRA;
  const B = before([0, 0], view, WHIRL_FROM + chased(m));
  const fig = m < 0 ? frameAt(co, view, 'stand', t) : m < long ? frameAt(co, view, 'whirl', pic) : frameAt(co, view, 'stand', m - long);
  // (the knight gives ground as he comes on spinning, just out of his chains; and runs out of the ring as his fists go up)
  const hitAt = WHIRL_HIT + WHIRL_EXTRA;
  const upAt = WHIRL_STILL - 0.25 + WHIRL_EXTRA;
  const out = smooth((m - upAt) / 0.5);
  const kd = 3.25 * LOOK_K + 1.4 * out;
  const K = before(B, view, kd);
  const kWalk = (m > WHIRL_SPIN && m < upAt + 0.5);
  const px0 = floorOf(base);
  const at = onFloor(B[0], B[1], cx, cy, k);
  if (m >= upAt && m < hitAt) warnCircle(px0, at[0], at[1], RING.whirl, (m - upAt) / (hitAt - upAt), k);
  const since = m - hitAt;
  const RC = ringCanvas(RING.whirl);
  const stood: Stood[] = [
    standing(at, fig, { shadow: 14 }),
    knightStood(knight, K, B, kWalk, t, cx, cy, k),
    ...airHalves(at, laid(ringPainted(since, 'air', RING.whirl, 'behind', 43), RC.ax, RC.ay), laid(ringPainted(since, 'air', RING.whirl, 'before', 43), RC.ax, RC.ay)),
  ];
  return compose(px0, [{ at, l: laid(ringPainted(since, 'floor', RING.whirl, 'all', 43), RC.ax, RC.ay) }], stood, k);
}
export const WHIRL_PASS = LEAD + WHIRL_LONG + WHIRL_EXTRA + 0.5;

// ---------------------------------------------------------------------------------------------
// THE HOOK: whirled, aimed, held, flung; the knight caught and dragged in; the blow waiting, its ring

const HOOK_FROM = -2.6;
const HOOK_AT = 5.0;
/** Where the hammer's fists come down (tiles before him), and the knight's way out. */
export const HAMMER_AHEAD = 2.0;
/** The hook's scene at `t` seconds of its pass. */
export function hookScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, freed: CoFreed = 0): Px {
  const { co, knight } = figures(freed);
  const m = t - LEAD;
  const B = before([0, 0], view, HOOK_FROM);
  const fig = m < 0 ? frameAt(co, view, 'stand', t) : m < HOOK_LONG ? frameAt(co, view, 'hook', m) : frameAt(co, view, 'stand', m - HOOK_LONG);
  const px0 = floorOf(base);
  const at = onFloor(B[0], B[1], cx, cy, k);
  const hook = m >= 0 ? lookHookPath(m, HOOK_AT) : null;
  // (the knight: caught as it bites, dragged in with it; free as it is in, and out from under the blow, sideways)
  let kf = HOOK_AT;
  let side = 0;
  let walking = false;
  if (m >= HOOK_BITE && m < HOOK_BACK && hook) kf = Math.max(hook.at[0], 0.9);
  else if (m >= HOOK_BACK) {
    const end = lookHookPath(HOOK_BACK - 1e-4, HOOK_AT);
    kf = Math.max(end ? end.at[0] : 1.1, 0.9);
    side = 2.1 * smooth((m - HOOK_BACK - 0.1) / 0.4);
    walking = m < HOOK_BACK + 0.5;
  }
  const K = before(B, view, kf, -side);
  const ring = before(B, view, HAMMER_AHEAD);
  const R = onFloor(ring[0], ring[1], cx, cy, k);
  const warnFrom = HOOK_BACK + 0.1;
  if (m >= warnFrom && m < HOOK_BLOW) warnCircle(px0, R[0], R[1], RING.hammer, (m - warnFrom) / (HOOK_BLOW - warnFrom), k);
  const since = m - HOOK_BLOW;
  const RC = ringCanvas(RING.hammer);
  const stood: Stood[] = [
    standing(at, fig, { shadow: 14 }),
    knightStood(knight, K, B, walking, t, cx, cy, k),
    ...airHalves(R, laid(ringPainted(since, 'air', RING.hammer, 'behind', 45), RC.ax, RC.ay), laid(ringPainted(since, 'air', RING.hammer, 'before', 45), RC.ax, RC.ay)),
  ];
  let over: ((px: Px) => void) | null = null;
  if (hook) {
    // the hook and its chain out across the room, as the game draws them
    const p = before(B, view, hook.at[0], hook.at[1]);
    const [hx, hy] = onFloor(p[0], p[1], cx, cy, k);
    const hz = hook.at[2] * 2 * k;
    const [qx, qy] = onScene(cuffOf(skeletonAt(chainedLookMob(freed), 'hook', m), 'R'), view, at[0], at[1], k);
    const set = (HOOKS[view] ??= makeHookShotArt(view));
    const sp = hook.flying ? set[Math.floor(m * 2.5 * 8) % 8] : set[8];
    stood.push(standing([hx, hy], { ...spriteLaid(sp), ay: spriteLaid(sp).ay + hz / k }));
    over = (px) => chainOut(px, qx, qy, hx, hy - hz, hook.flying ? 4 * k : k, k);
  }
  const out = compose(px0, [{ at: R, l: laid(ringPainted(since, 'floor', RING.hammer, 'all', 45), RC.ax, RC.ay) }], stood, k);
  over?.(out);
  return out;
}
const HOOKS: Partial<Record<View, ReturnType<typeof makeHookShotArt>>> = {};
export const HOOK_PASS = LEAD + HOOK_LONG + 0.5;

// ---------------------------------------------------------------------------------------------
// THE BALL: held high, drawn back, whipped down; the ring where it crashes; the knight out of it

const BALL_FROM = -2.6;
export const BALL_AT = 4.5;
/** The ball's scene at `t` seconds of its pass. */
export function ballScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, freed: CoFreed = 0): Px {
  const { co, knight } = figures(freed);
  const m = t - LEAD;
  const B = before([0, 0], view, BALL_FROM);
  const fig = m < 0 ? frameAt(co, view, 'stand', t) : m < BALL_LONG ? frameAt(co, view, 'ball', m) : frameAt(co, view, 'stand', m - BALL_LONG);
  const px0 = floorOf(base);
  const at = onFloor(B[0], B[1], cx, cy, k);
  const land = before(B, view, BALL_AT);
  const L = onFloor(land[0], land[1], cx, cy, k);
  const warnFrom = 1.5;
  if (m >= warnFrom && m < BALL_LAND) warnCircle(px0, L[0], L[1], RING.ball, (m - warnFrom) / (BALL_LAND - warnFrom), k);
  // (the knight where it will land: out of the ring, sideways, as it is held high)
  const side = 3.4 * smooth((m - 1.7) / 0.55);
  const K = before(B, view, BALL_AT, view === 'front' ? side : -side);
  const since = m - BALL_LAND;
  const RC = ringCanvas(RING.ball);
  const stood: Stood[] = [
    standing(at, fig, { shadow: 14 }),
    knightStood(knight, K, B, m > 1.7 && m < 2.25, t, cx, cy, k),
    ...airHalves(L, laid(ringPainted(since, 'air', RING.ball, 'behind', 47), RC.ax, RC.ay), laid(ringPainted(since, 'air', RING.ball, 'before', 47), RC.ax, RC.ay)),
  ];
  const ball = m >= 0 ? lookBallPath(m, BALL_AT) : null;
  let over: ((px: Px) => void) | null = null;
  if (ball) {
    const p = before(B, view, ball.at[0], ball.at[1]);
    const [bx, by] = onFloor(p[0], p[1], cx, cy, k);
    const bz = ball.at[2] * 2 * k;
    const [qx, qy] = onScene(collarOf(skeletonAt(chainedLookMob(freed), 'ball', m)), view, at[0], at[1], k);
    const set = (BALLS[view] ??= makeBallShotArt(view));
    const sp = set[ball.flying ? Math.floor(m * 1.6 * 8) % 8 : 0];
    const l = spriteLaid(sp);
    stood.push(standing([bx, by], { ...l, ay: l.ay + bz / k }));
    over = (px) => chainOut(px, qx, qy, bx, by - bz, ball.flying ? 6 * k : 2 * k, k);
  }
  const out = compose(px0, [{ at: L, l: laid(ringPainted(since, 'floor', RING.ball, 'all', 47), RC.ax, RC.ay) }], stood, k);
  over?.(out);
  return out;
}
const BALLS: Partial<Record<View, ReturnType<typeof makeBallShotArt>>> = {};
export const BALL_PASS = LEAD + BALL_LONG + 0.4;
void BALL_LET;

// ---------------------------------------------------------------------------------------------
// HIS STAND AND HIS WALK; STRUCK AND DYING; HIS CHAINS BREAKING: him by himself (with the knight for size)

/** Him standing `still` seconds, then walking (at the game's 1.1 tiles a second) toward the knight, who gives ground. */
export function walkScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, freed: CoFreed = 0, still = 1.4): Px {
  const { co, knight } = figures(freed);
  const m = Math.max(0, t - still);
  const B = before([0, 0], view, -2.4 + 1.1 * m);
  const fig = t < still ? frameAt(co, view, 'stand', t) : frameAt(co, view, 'walk', m);
  const K = before([0, 0], view, 2.4 + 0.9 * Math.max(0, m - 0.6), 1.4);
  const at = onFloor(B[0], B[1], cx, cy, k);
  const stood: Stood[] = [standing(at, fig, { shadow: 14 }), knightStood(knight, K, B, m > 0.6, t, cx, cy, k)];
  return compose(floorOf(base), [], stood, k);
}
/** His death's frame `t` seconds in (the game's: 20 a second, no edge of light). */
function dyingAt(co: ActorArt, view: View, t: number): Laid {
  const c = (view === 'front' ? co.front : co.back).clips!.die!;
  return spriteLaid(c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.floor(t * c.fps + 1e-6)))]);
}
/** A move of his played once where he stands (struck, dying, a chain breaking), after LEAD seconds standing, the knight before him. */
export function moveScene(view: View, move: string, long: number, t: number, base: Px, cx: number, cy: number, k = 1, freed: CoFreed = 0): Px {
  const { co, knight } = figures(freed);
  const m = t - LEAD;
  const B = before([0, 0], view, -1.2);
  const play = (u: number): Laid => (move === 'dying' ? dyingAt(co, view, u) : frameAt(co, view, move, u));
  const fig = m < 0 ? frameAt(co, view, 'stand', t) : m < long ? play(m) : move === 'dying' ? play(long - 1e-3) : frameAt(co, view, 'stand', m - long);
  // (the knight well out of the way of where he falls)
  const K = move === 'dying' ? before(B, view, 5.2, 2.2) : before(B, view, 3.4, 0.8);
  const at = onFloor(B[0], B[1], cx, cy, k);
  return compose(floorOf(base), [], [standing(at, fig, { shadow: 14 }), knightStood(knight, K, B, false, t, cx, cy, k)], k);
}
export const DIE_LONG = CO_DIE_TIME;
export const BREAK_LONG = CO_BREAK_TIME;
