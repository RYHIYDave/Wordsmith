// Pictures of FLOOR 3'S ENEMIES' NEW MOVES, put together for the owner (the sheet, the film's frames): the green troll's rampage
// and bull rush (art/monster_brute.ts BRUTE_RAMPAGE; the slam's ring, art/action_f3_fx.ts), and the Boneward's shield wall
// (art/action_f3_fx.ts BONEWARD_WALL), on floor 1's stand-in floor (dev/action_f1_scene.ts), with the knight, each figure at its
// floor point and sorted by it, as the game sorts them. What the game draws on the floor in its own pixels (the slam's red
// warning circle, the charge's lane, the Boneward's spear flying and lying) is drawn by the game's own code (render/render.ts's
// circle, art/charge_lane.ts, art/mob_shots.ts) onto plain pixels through `PxCtx`, a stand-in for a canvas. Made outside a browser
// (tools/action_f3_film.ts, tools/action_f3_sheet.ts). Nothing of the game imports it.

import { Px, rgba } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { BRUTE_RAMPAGE, BRUTE_CANVAS, RAMPAGE_HITS, RAMPAGE_LONG, RAMPAGE_RAISE, RUSH_GO, RUSH_STOP, TROLL_MOVES, makeBruteArt, rampageTravel, rushStopTravel } from '../art/monster_brute';
import { RING, RING_CANVAS, RUSH, WALL, makeWallBonewardArt, ringPainted, rushLane, rushRunFor } from '../art/action_f3_fx';
import { drawChargeLane } from '../art/charge_lane';
import { drawSpearLying, drawSpearShot } from '../art/mob_shots';
import { BW_THROW_HIT, BONEWARD } from '../art/new_mobs3';
import { SPEAR } from '../game/defs';
import { makeHeroArt3 } from '../art/heroes3';
import { P } from '../art/palette';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';

// ---------------------------------------------------------------------------------------------
// A STAND-IN FOR A CANVAS: just what the game's floor drawings use, onto plain pixels (`k` pixels to one of theirs)

export class PxCtx {
  globalAlpha = 1;
  fillStyle = '#000000';
  private path: [number, number][][] = [];
  constructor(readonly px: Px, readonly k = 1) {}
  private blend(X: number, Y: number): void {
    if (X < 0 || Y < 0 || X >= this.px.w || Y >= this.px.h) return;
    const [r, g, b] = rgba(this.fillStyle);
    const a = Math.max(0, Math.min(1, this.globalAlpha));
    const i = (Y * this.px.w + X) * 4;
    const d = this.px.d;
    d[i] = Math.round(d[i] * (1 - a) + r * a);
    d[i + 1] = Math.round(d[i + 1] * (1 - a) + g * a);
    d[i + 2] = Math.round(d[i + 2] * (1 - a) + b * a);
    d[i + 3] = 255;
  }
  fillRect(x: number, y: number, w: number, h: number): void {
    const k = this.k;
    for (let Y = Math.round(y * k); Y < Math.round((y + h) * k); Y++) for (let X = Math.round(x * k); X < Math.round((x + w) * k); X++) this.blend(X, Y);
  }
  beginPath(): void {
    this.path = [];
  }
  moveTo(x: number, y: number): void {
    this.path.push([[x, y]]);
  }
  lineTo(x: number, y: number): void {
    (this.path[this.path.length - 1] ?? (this.path[0] = [])).push([x, y]);
  }
  closePath(): void {}
  ellipse(cx: number, cy: number, rx: number, ry: number): void {
    const ring: [number, number][] = [];
    for (let i = 0; i < 48; i++) ring.push([cx + Math.cos((i / 48) * Math.PI * 2) * rx, cy + Math.sin((i / 48) * Math.PI * 2) * ry]);
    this.path.push(ring);
  }
  fill(): void {
    const k = this.k;
    const polys = this.path.map((p) => p.map(([x, y]) => [x * k, y * k] as [number, number]));
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const p of polys) for (const [, y] of p) {
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    for (let Y = Math.floor(y0); Y <= Math.ceil(y1); Y++) {
      const yc = Y + 0.5;
      const xs: number[] = [];
      for (const p of polys) {
        for (let i = 0; i < p.length; i++) {
          const [ax, ay] = p[i];
          const [bx, by] = p[(i + 1) % p.length];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) for (let X = Math.ceil(xs[i] - 0.5); X <= Math.floor(xs[i + 1] - 0.5); X++) this.blend(X, Y);
    }
  }
}
/** As the game's own canvas sees it. */
const asCanvas = (c: PxCtx): CanvasRenderingContext2D => c as unknown as CanvasRenderingContext2D;
/** The floor point (tiles from the scene's middle) where the game's own drawings put it: in the game's pixels, half the scene's. */
const gameAt = (cx: number, cy: number, k: number) => (x: number, y: number): readonly [number, number] => {
  const [X, Y] = onFloor(x, y, cx, cy, k);
  return [X / 2, Y / 2];
};
/** THE SLAM'S WARNING, as the game draws a slam's (render/render.ts, a 'warn' zone): its faint ground, its fill growing from its middle, its dotted edge. */
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
  ellipse(r * k, P.bl4, 0.3);
  g.fillStyle = P.bl5;
  const n = Math.max(16, Math.round(r * 44));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.fillRect(Math.round(cx / (2 * kk) + (Math.cos(a) - Math.sin(a)) * 16 * r), Math.round(cy / (2 * kk) + (Math.cos(a) + Math.sin(a)) * 8 * r), 1, 1);
  }
}

// ---------------------------------------------------------------------------------------------
// The figures

let BRUTE: ActorArt | null = null;
let WALLED: ActorArt | null = null;
let HERO: ActorArt | null = null;
/** The green troll as the game would hold him with BRUTE_RAMPAGE on; the Boneward behind its wall; the knight. */
export function figures(): { brute: ActorArt; boneward: ActorArt; knight: ActorArt } {
  if (!BRUTE) {
    const a = BRUTE_RAMPAGE.on;
    const b = TROLL_MOVES.on;
    BRUTE_RAMPAGE.on = true;
    TROLL_MOVES.on = true;
    try {
      BRUTE = makeBruteArt();
    } finally {
      BRUTE_RAMPAGE.on = a;
      TROLL_MOVES.on = b;
    }
  }
  WALLED ??= makeWallBonewardArt(1.5);
  HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt;
  return { brute: BRUTE, boneward: WALLED, knight: HERO };
}
/** A frame of a figure: standing or walking (its loops), its attack, or another of its moves, `t` seconds in. */
export function frameAt(art: ActorArt, view: View, move: string, t: number): Laid {
  const set = view === 'front' ? art.front : art.back;
  let sp: Sprite;
  if (move === 'stand') sp = set.idle[Math.floor(t * (set.idleFps ?? 10) + 1e-6) % set.idle.length];
  else if (move === 'walk') sp = set.walk[Math.floor(t * (set.walkFps ?? 10) + 1e-6) % set.walk.length];
  else {
    const c = (move === 'attack' ? set.clips?.attack : move === 'reel' ? set.clips?.reel : set.clips?.moves?.[move]) as Clip;
    const n = c.frames.length;
    let i = Math.floor(t * c.fps + 1e-6);
    if (c.loop !== undefined) i = ((i % n) + n) % n;
    sp = c.frames[Math.max(0, Math.min(n - 1, i))];
  }
  return spriteLaid(sp);
}
const clipLong = (art: ActorArt, move: string): number => {
  const c = (move === 'attack' ? art.front.clips?.attack : art.front.clips?.moves?.[move]) as Clip;
  return (c.frames.length - 1) / c.fps;
};

/** The way a figure faces on the floor: from in front, down-right (+x); from behind, up-right (-y). */
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
/** The knight, seen the other way about from what he faces. */
const knightView = (view: View): View => (view === 'front' ? 'back' : 'front');

// ---------------------------------------------------------------------------------------------
// THE RAMPAGE: he steps in at the knight, two swings, the leap and the slam; the ring goes out over the floor

/** How long he stands before he begins (seconds). */
export const LEAD = 0.4;
/** Where he begins, and where the knight stands (tiles from the scene's middle, along the way he faces). */
const RAMP_FROM = -2.2;

/** The rampage's scene at `t` seconds of its pass: he begins at LEAD; the knight stands before him. */
export function rampageScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { brute, knight } = figures();
  const m = t - LEAD;
  const [fx, fy] = ahead(view);
  const T = rampageTravel(Math.max(0, Math.min(RAMPAGE_LONG, m)));
  const at = (d: number): [number, number] => [fx * d, fy * d];
  const B = at(RAMP_FROM + T);
  // (the knight keeps a step before him as he steps in; and once the ring is marked he gets out of it, sideways)
  const out = Math.max(0, Math.min(1, (m - RAMPAGE_RAISE - 0.1) / 0.6));
  const aside = 3.3 * out * out * (3 - 2 * out);
  const side: [number, number] = view === 'front' ? [0, 1] : [1, 0];
  const along = RAMP_FROM + 1.7 + Math.min(0.9, rampageTravel(Math.max(0, m)));
  const K: [number, number] = [fx * along + side[0] * aside, fy * along + side[1] * aside];
  const [kx, ky] = onFloor(K[0], K[1], cx, cy, k);
  const [bx, by] = onFloor(B[0], B[1], cx, cy, k);
  const kWalk = (m > 0.7 && m < 0.95) || (m > 1.27 && m < 1.5) || (out > 0 && out < 1);
  const fig = m >= 0 && m <= RAMPAGE_LONG ? frameAt(brute, view, 'attack', m) : frameAt(brute, view, 'stand', m < 0 ? t : m - RAMPAGE_LONG);
  const px0 = new Px(base.w, base.h);
  px0.d.set(base.d);
  // the slam's ring: marked on the floor (the game's red circle) from when the club goes up, and going out from the slam
  const centre = at(RAMP_FROM + 2.0 + RING.ahead);
  const C = onFloor(centre[0], centre[1], cx, cy, k);
  const since = m - RAMPAGE_HITS[2];
  if (m >= RAMPAGE_RAISE && since < 0) warnCircle(px0, C[0], C[1], RING.radius, (m - RAMPAGE_RAISE) / (RAMPAGE_HITS[2] - RAMPAGE_RAISE), k);
  const RC = RING_CANVAS;
  const stood: Stood[] = [
    { at: onFloor(B[0], B[1], cx, cy, k), l: fig, shadow: 13 },
    { at: [kx, ky], l: frameAt(knight, ky < by ? 'front' : 'back', kWalk ? 'walk' : 'stand', t), flip: kx > bx, shadow: 9 },
    { at: [C[0], C[1] - 0.5], l: laid(ringPainted(since, 'air', RING.radius, 'behind'), RC.ax, RC.ay) },
    { at: [C[0], C[1] + 0.5], l: laid(ringPainted(since, 'air', RING.radius, 'before'), RC.ax, RC.ay) },
  ];
  return compose(px0, [{ at: C, l: laid(ringPainted(since, 'floor'), RC.ax, RC.ay) }], stood, k);
}
export const RAMPAGE_PASS = LEAD + RAMPAGE_LONG + RING.long - (RAMPAGE_LONG - RAMPAGE_HITS[2]) + 0.2;

// ---------------------------------------------------------------------------------------------
// THE BULL RUSH: head down, the lane marked; he runs it, past where the knight stood; stumbles to a stop

/** Where he stands, and where the knight stood when the lane was marked (tiles along the way he faces). */
const RUSH_FROM = -3.6;
const RUSH_AT = 1.4;
/** The knight steps out of the lane: when (seconds into the pass) and how far to the side (tiles). */
const ASIDE: readonly [number, number, number] = [LEAD + 0.5, LEAD + 0.95, 2.1];
export function rushTimes(): { go: number; run: number; stop: number; end: number } {
  const go = LEAD + RUSH_GO;
  const run = rushRunFor(RUSH_AT - RUSH_FROM);
  return { go, run, stop: go + run, end: go + run + RUSH_STOP.all };
}
/** The bull rush's scene at `t` seconds of its pass. */
export function rushScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { brute, knight } = figures();
  const { go, run, stop, end } = rushTimes();
  const [fx, fy] = ahead(view);
  const side: [number, number] = view === 'front' ? [0, 1] : [1, 0];
  let d = RUSH_FROM;
  let fig: Laid;
  if (t < LEAD) fig = frameAt(brute, view, 'stand', t);
  else if (t < go) fig = frameAt(brute, view, 'chargeWind', t - LEAD);
  else if (t < stop) {
    d += RUSH.pace * (t - go);
    fig = frameAt(brute, view, 'charge', t - go);
  } else {
    d += RUSH.pace * run + rushStopTravel(Math.min(RUSH_STOP.all, t - stop));
    fig = t < end ? frameAt(brute, view, 'chargeStop', t - stop) : frameAt(brute, view, 'stand', t - end);
  }
  const px0 = new Px(base.w, base.h);
  px0.d.set(base.d);
  // the lane, as the game draws the red troll's: from where he stands, through where the knight stood, to the end of his stop
  if (t >= LEAD && t < end + 0.3) {
    const k0 = Math.min(1, (t - LEAD) / RUSH_GO);
    const gone = t >= go ? Math.min(1, (d - RUSH_FROM) / (RUSH_AT - RUSH_FROM + RUSH.past + RUSH.stop)) : undefined;
    const lane = rushLane([fx * RUSH_FROM, fy * RUSH_FROM], [fx * RUSH_AT, fy * RUSH_AT], k0, gone);
    drawChargeLane(asCanvas(new PxCtx(px0, 2 * k)), lane, gameAt(cx, cy, k));
  }
  const a = Math.max(0, Math.min(1, (t - ASIDE[0]) / (ASIDE[1] - ASIDE[0])));
  const s = ASIDE[2] * a * a * (3 - 2 * a);
  const K: [number, number] = [fx * RUSH_AT + side[0] * s, fy * RUSH_AT + side[1] * s];
  const walking = t > ASIDE[0] && t < ASIDE[1];
  const kv = knightView(view);
  const stood: Stood[] = [
    { at: onFloor(fx * d, fy * d, cx, cy, k), l: fig, shadow: 13 },
    { at: onFloor(K[0], K[1], cx, cy, k), l: frameAt(knight, kv, walking ? 'walk' : 'stand', t), flip: true, shadow: 9 },
  ];
  return compose(px0, [], stood, k);
}

// ---------------------------------------------------------------------------------------------
// THE SHIELD WALL: it comes on behind its shield; a blow from in front glances off; one from the side lands; it lowers its
// shield and throws

/** A beat of the Boneward's pass: what it does, for how long, how far it goes (tiles a second, the way it faces). */
interface Beat {
  move: string;
  long: number;
  go?: number;
}
const WALL_BEATS: Beat[] = [
  { move: 'stand', long: 0.3 },
  { move: 'walk', long: 1.6, go: 1.5 },
  { move: 'stand', long: 0.35 },
  // (the knight's blow from in front lands as the glance begins)
  { move: 'glance', long: WALL.glance },
  { move: 'stand', long: 0.5 },
  // (the knight round at its side: his blow lands)
  { move: 'reel', long: 0.3 },
  { move: 'stand', long: 0.6 },
  { move: 'throw', long: 1.33 },
  { move: 'standBare', long: 0.8 },
];
export const WALL_PASS = WALL_BEATS.reduce((a, b) => a + b.long, 0);
function beatAt(t: number): { move: string; at: number; d: number; i: number; from: number } {
  let s = t;
  let d = 0;
  let from = 0;
  for (let i = 0; i < WALL_BEATS.length; i++) {
    const b = WALL_BEATS[i];
    if (s < b.long || i === WALL_BEATS.length - 1) return { move: b.move, at: Math.min(s, b.long - 1e-3), d: d + (b.go ?? 0) * Math.min(s, b.long), i, from };
    s -= b.long;
    d += (b.go ?? 0) * b.long;
    from += b.long;
  }
  return { move: 'stand', at: 0, d, i: 0, from: 0 };
}
/** When each of the knight's blows lands, and where he stands for it (tiles from where the Boneward ends its walk: along, aside). */
const STRIKE_FRONT = WALL_BEATS.slice(0, 3).reduce((a, b) => a + b.long, 0);
const STRIKE_SIDE = WALL_BEATS.slice(0, 5).reduce((a, b) => a + b.long, 0);
const THROW_AT = WALL_BEATS.slice(0, 7).reduce((a, b) => a + b.long, 0);
/** The shield wall's scene at `t` seconds of its pass. */
export function wallScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { boneward, knight } = figures();
  const [fx, fy] = ahead(view);
  const side: [number, number] = view === 'front' ? [0, -1] : [-1, 0];
  const { move, at, d } = beatAt(t);
  const start = -2.6;
  const B: [number, number] = [fx * (start + d), fy * (start + d)];
  const end = start + 1.6 * 1.5;
  // the knight: before it as it comes on (1.2 tiles from where it stops) and strikes; then round at its side, and strikes; then backed off
  const kAttack = (art: ActorArt, v: View, s: number): Laid | null => {
    const c = (v === 'front' ? art.front : art.back).clips?.attack as Clip | undefined;
    if (!c || s < 0) return null;
    const hit = c.hit ?? 0.3;
    const i = Math.floor((s + hit) * c.fps);
    return i < c.frames.length ? spriteLaid(c.frames[Math.max(0, i)]) : null;
  };
  let K: [number, number];
  let blow = -1;
  if (t < STRIKE_FRONT + 0.6) {
    // (before it, a little to its left: within its front, and not between it and the eye)
    K = [fx * (end + 1.9) + side[0] * 0.8, fy * (end + 1.9) + side[1] * 0.8];
    blow = t - STRIKE_FRONT;
  } else if (t < THROW_AT - 0.2) {
    const s = Math.min(1, (t - STRIKE_FRONT - 0.6) / 0.35);
    const e = s * s * (3 - 2 * s);
    // (round to its side: along to beside it, and out)
    K = [fx * (end + 1.9 - 1.75 * e) + side[0] * (0.8 + 0.7 * e), fy * (end + 1.9 - 1.75 * e) + side[1] * (0.8 + 0.7 * e)];
    if (e >= 1) blow = t - STRIKE_SIDE;
  } else {
    const s = Math.min(1, (t - THROW_AT + 0.2) / 0.3);
    const e = s * s * (3 - 2 * s);
    K = [fx * (end + 0.15 + 3.4 * e) + side[0] * 1.5 * (1 - e), fy * (end + 0.15 + 3.4 * e) + side[1] * 1.5 * (1 - e)];
  }
  // (he faces the Boneward: seen from in front if he is further up the scene than it, flipped if he is to its right)
  const [kx, ky] = onFloor(K[0], K[1], cx, cy, k);
  const [bx, by] = onFloor(B[0], B[1], cx, cy, k);
  const kv: View = ky < by ? 'front' : 'back';
  const flip = kx > bx;
  const walking = t > STRIKE_FRONT + 0.6 && t < STRIKE_FRONT + 0.95;
  const kFig = kAttack(knight, kv, blow) ?? frameAt(knight, kv, walking || (t > THROW_AT - 0.2 && t < THROW_AT + 0.1) ? 'walk' : 'stand', t);
  const px0 = new Px(base.w, base.h);
  px0.d.set(base.d);
  // the spear thrown: flying to where the knight stood, then lying there (the game's own drawing of it)
  const since = t - THROW_AT - BW_THROW_HIT;
  if (since >= 0) {
    const from: [number, number] = [B[0] + fx * SPEAR.hand, B[1] + fy * SPEAR.hand];
    const to: [number, number] = [fx * (end + 3.3), fy * (end + 3.3)];
    const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const u = Math.min(1, (since * SPEAR.speed) / dist);
    const g = asCanvas(new PxCtx(px0, 2 * k));
    const atG = gameAt(cx, cy, k);
    if (u < 1) drawSpearShot(g, atG, from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, SPEAR.z * (1 - u * 0.8), fx, fy);
    else drawSpearLying(g, atG, to[0], to[1], fx, fy);
  }
  const stood: Stood[] = [
    { at: onFloor(B[0], B[1], cx, cy, k), l: frameAt(boneward, view, move, at), shadow: 11 },
    { at: onFloor(K[0], K[1], cx, cy, k), l: kFig, flip, shadow: 9 },
  ];
  return compose(px0, [], stood, k);
}
void BONEWARD;
void BRUTE_CANVAS;
