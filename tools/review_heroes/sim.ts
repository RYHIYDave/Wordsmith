// THE HEROES' MOVES AS THE GAME PLAYS THEM: the simulation (see play.ts for what is measured with it,
// and src/dev/preview_play.ts for the films made with it). The game's own rules (game/game.ts) run at
// sixty steps a second in the practice room, and the game's own chooser of frames (render/figure.ts,
// `Figure`) picks the picture for each step, as the renderer asks it to (render/render.ts): only the
// pictures are stand-ins, each a note of which move, which moment of it and which view.
import type { ActorArt, AnimSet, Clip } from '../../src/art/actor_types';
import { PLANS } from '../../src/art/heroes3';
import type { Plan } from '../../src/art/heroes3';
import { MOVES3, runWaysOf, settlesOf, startsOf, walkingOf } from '../../src/art/moves3';
import type { Move3 } from '../../src/art/moves3';
import { lerp3 } from '../../src/art/skeleton';
import type { V3 } from '../../src/art/skeleton';
import type { Sprite } from '../../src/engine/px';
import { SKILLS } from '../../src/game/defs';
import { Game } from '../../src/game/game';
import { emptyControls } from '../../src/game/state';
import type { GameEvent } from '../../src/game/state';
import type { Controls } from '../../src/game/state';
import type { ClassId } from '../../src/game/types';
import { Figure, attackClip } from '../../src/render/figure';
import type { FigureState } from '../../src/render/figure';
import { at, endOf, pointsOf, seen } from './lib';
import type { View } from './lib';

// ---------------------------------------------------------------------------------------------
// The art, as stand-ins. THESE NUMBERS AND THIS LAYOUT ARE heroes3.ts's (animSet3), written again:
// play.ts holds the numbers to heroes3.ts's own before it plays.
export const IDLE_FPS3 = 10;
export const RUN_FPS3 = 30;
export const GRIP_FPS3 = 60;
export const CLIP_FPS3 = 30;
export const GESTURE_FPS3 = 20;
export const READY_HELD3 = 0.3;
export const READY_LEAST3 = 1;
export const LEAP_FRAMES3 = 16;
export const ROLL_FRAMES3 = 14;

const keyOf = new Map<Move3, string>(Object.entries(MOVES3).map(([k, m]) => [m, k]));
/** A move by the name its stand-in carries: one of MOVES3, or a coming to a stand out of a run (`stop:<run>:<stance>:<which>`, moves3.ts settlesOf). */
export function moveOf(key: string): Move3 {
  if (key.startsWith('stop:')) {
    const [, run, stance, k] = key.split(':');
    return settlesOf(MOVES3[run], MOVES3[stance])[Number(k)];
  }
  if (key.startsWith('way:')) {
    const [, run, k] = key.split(':');
    return runWaysOf(MOVES3[run])[Number(k)];
  }
  if (key.startsWith('rock:')) {
    const [, rock, run, k] = key.split(':');
    return walkingOf(MOVES3[rock], MOVES3[run], false)[Number(k)];
  }
  if (key.startsWith('walk:')) {
    const [, attack, run, k] = key.split(':');
    return walkingOf(MOVES3[attack], MOVES3[run])[Number(k)];
  }
  if (key.startsWith('start:')) {
    const [, run, stance] = key.split(':');
    return (startsOf(MOVES3[run], MOVES3[stance]) as { move: Move3 }).move;
  }
  return MOVES3[key];
}
const span = (m: Move3): { end: number; from: number | undefined } => ({ end: endOf(m), from: m.motion.loop });
function standIn(m: Move3, t: number, view: View): Sprite {
  return { img: `${keyOf.get(m)}|${t}|${view}` as unknown as HTMLCanvasElement, w: 1, h: 1, ax: 0, ay: 0 };
}
function animSet(plan: Plan, view: View): AnimSet {
  const of = (key: string): Move3 => MOVES3[key];
  const atT = (m: Move3, t: number): Sprite => standIn(m, t, view);
  const frames = (n: number, f: (i: number) => Sprite): Sprite[] => Array.from({ length: n }, (_, i) => f(i));
  const round = (m: Move3, fps: number): Sprite[] => {
    const { end, from } = span(m);
    const t0 = from ?? 0;
    const n = Math.max(1, Math.round((end - t0) * fps));
    return frames(n, (i) => atT(m, t0 + i / fps));
  };
  const clip = (m: Move3, fps: number, t0 = 0, t1 = span(m).end): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: frames(n, (i) => atT(m, Math.min(t1, t0 + i / fps))), fps };
    if (m.motion.hit !== undefined && m.motion.hit >= t0 && m.motion.hit <= t1) c.hit = m.motion.hit - t0;
    if (m.motion.loop !== undefined) c.loop = m.motion.loop - t0;
    return c;
  };
  const spread = (m: Move3, n: number, t0: number, t1: number): Clip => ({ frames: frames(n, (i) => atT(m, t0 + ((t1 - t0) * i) / (n - 1))), fps: n / Math.max(1e-6, t1 - t0) });
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return frames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(of(plan.attack), CLIP_FPS3);
  const attack2 = plan.attack2 ? clip(of(plan.attack2), CLIP_FPS3) : undefined;
  const heavy = clip(of(plan.heavy), CLIP_FPS3);
  const walkStride = of(plan.walk).stride;
  const walkFps = walkStride !== undefined ? GRIP_FPS3 : RUN_FPS3;
  const set: AnimSet = { idle: round(of(plan.idle), IDLE_FPS3), walk: round(of(plan.walk), walkFps), attack: three(attack), heavy: three(heavy), idleFps: IDLE_FPS3, walkFps, clips: { attack, heavy } };
  if (walkStride !== undefined) set.walkStride = walkStride;
  const stops = settlesOf(of(plan.walk), of(plan.idle));
  stops.forEach((m, k) => keyOf.set(m, `stop:${plan.walk}:${plan.idle}:${k}`));
  if (stops.length) set.stops = stops.map((m) => clip(m, CLIP_FPS3));
  const ways = runWaysOf(of(plan.walk));
  ways.forEach((m, k) => keyOf.set(m, `way:${plan.walk}:${k}`));
  if (ways.length) set.walkWays = ways.map((m) => round(m, walkFps));
  for (const [which, key] of [['attackWalk', plan.attack], ['heavyWalk', plan.heavy]] as const) {
    const walkers = walkingOf(of(key), of(plan.walk));
    walkers.forEach((m, k) => keyOf.set(m, `walk:${key}:${plan.walk}:${k}`));
    if (walkers.length) (set.clips as NonNullable<AnimSet['clips']>)[which] = walkers.map((m) => clip(m, CLIP_FPS3));
  }
  const start = startsOf(of(plan.walk), of(plan.idle));
  if (start) {
    keyOf.set(start.move, `start:${plan.walk}:${plan.idle}`);
    set.start = clip(start.move, GRIP_FPS3);
    set.startAt = start.phase;
  }
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  if (attack2) clips.attack2 = attack2;
  if (plan.leap) {
    const m = of(plan.leap);
    const until = m.arc ? m.arc.until : span(m).end;
    clips.leap = spread(m, LEAP_FRAMES3, 0, until);
    const leap = clips.leap;
    set.leap = frames(3, (i) => leap.frames[Math.round([0.05, 0.45, 0.9][i] * (LEAP_FRAMES3 - 1))]);
    if (span(m).end > until + 1e-6) clips.land = clip(m, CLIP_FPS3, until);
  }
  if (plan.roll) {
    const m = of(plan.roll);
    const until = m.tumble ?? span(m).end;
    clips.roll = spread(m, ROLL_FRAMES3, 0, until);
    if (m.tumble !== undefined && span(m).end > until + 1e-6) clips.land = clip(m, CLIP_FPS3, until);
  }
  if (plan.hold) clips.hold = clip(of(plan.hold), CLIP_FPS3);
  if (plan.release) clips.release = clip(of(plan.release), CLIP_FPS3);
  if (plan.whirl) clips.whirl = { ...clip(of(plan.whirl), CLIP_FPS3), turns: true };
  if (plan.fall) clips.fall = clip(of(plan.fall), CLIP_FPS3);
  if (plan.reel) clips.reel = clip(of(plan.reel), CLIP_FPS3);
  if (plan.lurch) clips.lurch = clip(of(plan.lurch), CLIP_FPS3);
  for (const [which, key] of [['reelWalk', plan.reel], ['lurchWalk', plan.lurch]] as const) {
    if (!key) continue;
    const walkers = walkingOf(of(key), of(plan.walk), false);
    walkers.forEach((m, k) => keyOf.set(m, `rock:${key}:${plan.walk}:${k}`));
    if (walkers.length) clips[which] = walkers.map((m) => clip(m, CLIP_FPS3));
  }
  if (view === 'front') {
    if (plan.idleA) clips.idleA = clip(of(plan.idleA), GESTURE_FPS3);
    if (plan.idleB) clips.idleB = clip(of(plan.idleB), GESTURE_FPS3);
    if (plan.ready) {
      const m = of(plan.ready);
      clips.ready = clip(m, CLIP_FPS3, 0, Math.min(span(m).end, Math.max(READY_LEAST3, (m.ready ?? span(m).end) + READY_HELD3)));
    }
  }
  return set;
}
export const artOf = (cls: ClassId, place: 'dungeon' | 'town'): ActorArt => ({ front: animSet(PLANS[cls][place], 'front'), back: animSet(PLANS[cls][place], 'back') });

// ---------------------------------------------------------------------------------------------
// Scenarios: the hero in the practice room, with nothing else in it, and a script of what the
// player's thumbs do, step by step.

export interface Ctx {
  game: Game;
  t: number;
  c: Controls;
}
export interface Scenario {
  name: string;
  cls: ClassId;
  seconds: number;
  /** Which way the hero faces at the start (world x, y): (1, 0) is seen from in front, (0, -1) from behind. */
  face: [number, number];
  /** Before the first step: change the hero's gear, say. */
  setup?: (g: Game) => void;
  /** In town (the heroes' town figures), or (if not said) in a dungeon. */
  place?: 'dungeon' | 'town';
  /** Each step: set the thumbs. */
  step: (x: Ctx) => void;
  /** When a heavy blow rocks the hero (seconds from the start), if one does. */
  reelAt?: number;
  reelBehind?: boolean;
  /** The renderer's REEL_TIME: how long a blow's rocking lasts. */
}
const REEL_TIME = 0.4;
const between = (t: number, a: number, b: number): boolean => t >= a && t < b;
const ahead = (x: Ctx, d = 2): void => {
  const h = x.game.hero;
  x.c.aimX = h.x + h.fx * d;
  x.c.aimY = h.y + h.fy * d;
  x.c.castX = x.c.aimX;
  x.c.castY = x.c.aimY;
};
const tapAt = (x: Ctx, when: number): void => {
  if (between(x.t, when, when + 1 / 60)) {
    ahead(x);
    x.c.fire = true;
  }
};
const holdFrom = (x: Ctx, a: number, b: number): void => {
  if (between(x.t, a, b)) {
    ahead(x, 3);
    if (between(x.t, a, a + 1 / 60)) x.c.cast = true;
    x.c.hold = true;
  }
};
const walk = (x: Ctx, a: number, b: number, dx: number, dy: number): void => {
  if (between(x.t, a, b)) {
    x.c.mx = dx;
    x.c.my = dy;
  }
};
const equip = (g: Game, weapon: string): void => {
  const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
  if (i < 0) throw new Error(`no ${weapon} in the bag`);
  g.equipFromBag(i);
  // (and the piece for the other hand that came with it, if any)
  const j = g.hero.bag.findIndex((it) => it !== null && it.slot === 'offhand');
  if (j >= 0) g.equipFromBag(j);
};

export function scenariosOf(cls: ClassId): Scenario[] {
  const front: [number, number] = [1, 0];
  const back: [number, number] = [0, -1];
  const list: Scenario[] = [
    { name: 'stands', cls, seconds: 3, face: front, step: () => {} },
    { name: 'runs, seen from in front', cls, seconds: 1.4, face: front, step: (x) => walk(x, 0, 9, 1, 0) },
    { name: 'runs, seen from behind', cls, seconds: 1.4, face: back, step: (x) => walk(x, 0, 9, 0, -1) },
    { name: 'runs a short way', cls, seconds: 0.9, face: front, step: (x) => walk(x, 0, 9, 1, 0) },
    // (between two of the four ways a figure is drawn facing: straight across the screen, and straight down it)
    { name: 'runs across the screen', cls, seconds: 1.4, face: [Math.SQRT1_2, -Math.SQRT1_2], step: (x) => walk(x, 0, 9, Math.SQRT1_2, -Math.SQRT1_2) },
    // (0.9 seconds: much further and the practice room's wall stops him)
    { name: 'runs down the screen', cls, seconds: 0.9, face: [Math.SQRT1_2 + 0.01, Math.SQRT1_2 - 0.01], step: (x) => walk(x, 0, 9, Math.SQRT1_2 + 0.01, Math.SQRT1_2 - 0.01) },
    { name: 'runs up the screen', cls, seconds: 0.9, face: [-Math.SQRT1_2 + 0.01, -Math.SQRT1_2 - 0.01], step: (x) => walk(x, 0, 9, -Math.SQRT1_2 + 0.01, -Math.SQRT1_2 - 0.01) },
    { name: 'runs a little off the way he faces', cls, seconds: 1.4, face: [Math.cos(0.3), Math.sin(0.3)], step: (x) => walk(x, 0, 9, Math.cos(0.3), Math.sin(0.3)) },
    { name: 'starts and stops', cls, seconds: 2, face: front, step: (x) => walk(x, 0.5, 1.2, 1, 0) },
    { name: 'starts and stops in town', cls, seconds: 2, face: front, place: 'town', step: (x) => walk(x, 0.5, 1.2, 1, 0) },
    { name: 'runs, stops and shoots', cls, seconds: 2.2, face: front, step: (x) => { walk(x, 0.2, 0.75, 1, 0); tapAt(x, 1.05); } },
    { name: 'stops, starts and stops', cls, seconds: 2.6, face: front, step: (x) => { walk(x, 0, 0.62, 1, 0); walk(x, 1.2, 1.75, 1, 0); } },
    { name: 'quick attack, standing', cls, seconds: 1.3, face: front, step: (x) => tapAt(x, 0.2) },
    { name: 'quick attack, walking', cls, seconds: 1.2, face: front, step: (x) => { walk(x, 0, 9, 1, 0); tapAt(x, 0.3); } },
    // (his mark ahead of him all the while, he walks away from it, and across it)
    { name: 'quick attack, walking backward', cls, seconds: 1.2, face: front, step: (x) => { walk(x, 0, 9, -1, 0); x.c.face = true; x.c.aimX = x.game.hero.x + 4; x.c.aimY = x.game.hero.y; x.c.castX = x.c.aimX; x.c.castY = x.c.aimY; if (between(x.t, 0.3, 0.3 + 1 / 60)) x.c.fire = true; } },
    { name: 'quick attack, walking across', cls, seconds: 1.2, face: front, step: (x) => { walk(x, 0, 9, 0, -1); x.c.face = true; x.c.aimX = x.game.hero.x + 4; x.c.aimY = x.game.hero.y; x.c.castX = x.c.aimX; x.c.castY = x.c.aimY; if (between(x.t, 0.3, 0.3 + 1 / 60)) x.c.fire = true; } },
    { name: 'quick attack, from behind', cls, seconds: 1.3, face: back, step: (x) => tapAt(x, 0.2) },
    { name: 'rocked by a blow, standing', cls, seconds: 1, face: front, step: () => {}, reelAt: 0.2 },
    { name: 'rocked by a blow, walking', cls, seconds: 1, face: front, step: (x) => walk(x, 0, 9, 1, 0), reelAt: 0.3 },
    { name: 'thrown forward by a blow from behind', cls, seconds: 1, face: front, step: () => {}, reelAt: 0.2, reelBehind: true },
    { name: 'swipe move', cls, seconds: 1.6, face: front, step: (x) => { if (between(x.t, 0.3, 0.3 + 1 / 60)) { const h = x.game.hero; x.c.evade = true; x.c.evadeX = h.x + 4; x.c.evadeY = h.y; } } },
    { name: 'swipe move while running', cls, seconds: 1.4, face: front, step: (x) => { walk(x, 0, 0.3, 1, 0); walk(x, 0.7, 9, 1, 0); if (between(x.t, 0.3, 0.3 + 1 / 60)) { const h = x.game.hero; x.c.evade = true; x.c.evadeX = h.x + 4; x.c.evadeY = h.y; } } },
  ];
  if (cls === 'warrior') {
    list.push(
      { name: 'the combo, two taps', cls, seconds: 1.6, face: front, step: (x) => { tapAt(x, 0.2); if (between(x.t, 0.62, 0.9) && x.game.hero.combo === 0) { ahead(x); x.c.fire = true; } } },
      { name: 'whirlwind held, standing', cls, seconds: 2.2, face: front, step: (x) => holdFrom(x, 0.2, 1.3) },
      { name: 'whirlwind held, walking', cls, seconds: 2.2, face: front, step: (x) => { walk(x, 0, 9, 1, 0); holdFrom(x, 0.2, 1.3); } },
      { name: 'slam (sword and shield), standing', cls, seconds: 1.4, face: front, setup: (g) => equip(g, 'sword'), step: (x) => holdFrom(x, 0.2, 0.2 + 1 / 60) },
      { name: 'slam (sword and shield), walking', cls, seconds: 1.4, face: front, setup: (g) => equip(g, 'sword'), step: (x) => { walk(x, 0, 9, 1, 0); holdFrom(x, 0.2, 0.2 + 1 / 60); } },
    );
  } else if (cls === 'ranger') {
    list.push(
      { name: 'volley, standing', cls, seconds: 1.4, face: front, step: (x) => holdFrom(x, 0.2, 0.2 + 1 / 60) },
      { name: 'volley, walking', cls, seconds: 1.4, face: front, step: (x) => { walk(x, 0, 9, 1, 0); holdFrom(x, 0.2, 0.2 + 1 / 60); } },
      { name: 'volley, then walks off', cls, seconds: 1.4, face: front, step: (x) => { holdFrom(x, 0.2, 0.2 + 1 / 60); walk(x, 0.6, 9, 1, 0); } },
    );
  } else {
    list.push(
      { name: 'orb, standing', cls, seconds: 1.4, face: front, step: (x) => holdFrom(x, 0.2, 0.2 + 1 / 60) },
      { name: 'orb, walking', cls, seconds: 1.4, face: front, step: (x) => { walk(x, 0, 9, 1, 0); holdFrom(x, 0.2, 0.2 + 1 / 60); } },
      { name: 'beam (wand) held, standing', cls, seconds: 2.2, face: front, setup: (g) => equip(g, 'wand'), step: (x) => holdFrom(x, 0.2, 1.3) },
      { name: 'beam (wand) held, walking', cls, seconds: 2.2, face: front, setup: (g) => equip(g, 'wand'), step: (x) => { walk(x, 0, 9, 1, 0); holdFrom(x, 0.2, 1.3); } },
    );
  }
  return list;
}

// ---------------------------------------------------------------------------------------------
// Playing one

export interface Shown {
  t: number;
  key: string;
  mt: number;
  view: View;
  left: boolean;
  /** Where the hero's feet are on the screen (game px), and how far the figure is lifted. */
  x: number;
  y: number;
  lift: number;
  /** The game's own arrows in flight after this step (where they are on the screen, game px; which way they go, tiles a second; how long they have flown), and what the game told of in it. */
  arrows: { x: number; y: number; vx: number; vy: number; age: number; hostile: boolean }[];
  events: GameEvent[];
}

export function play(sc: Scenario): Shown[] {
  const game = Game.forPractice(sc.cls, 3);
  (game as unknown as { waveT: number }).waveT = 1e9;
  game.monsters.length = 0;
  sc.setup?.(game);
  const h = game.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = sc.face[0];
  h.fy = sc.face[1];
  const art = artOf(sc.cls, sc.place ?? 'dungeon');
  const fig = new Figure();
  const out: Shown[] = [];
  const dt = 1 / 60;
  // (how far the hero has walked, as the renderer counts it)
  let walked = 0;
  let from: [number, number] | null = null;
  for (let i = 0; i * dt < sc.seconds; i++) {
    const t = i * dt;
    const c = emptyControls();
    sc.step({ game, t, c });
    game.update(dt, c);
    const leapK = h.move && h.move.kind === 'leap' ? Math.min(1, h.move.t / h.move.dur) : -1;
    const rollK = h.move && h.move.kind === 'roll' ? Math.min(1, h.move.t / h.move.dur) : -1;
    const s = h.skills[h.attackSkill];
    const reelT = sc.reelAt !== undefined && t >= sc.reelAt && t - sc.reelAt <= REEL_TIME ? t - sc.reelAt : -1;
    const st: FigureState = {
      anim: h.anim, animT: h.animT, fx: h.fx, fy: h.fy,
      attackSkill: s ? attackClip(h.cls, h.attackSkill, SKILLS[s.id].kind, h.combo) : h.attackSkill,
      attackAge: h.attackAge, attackWind: h.attackWind, leapK,
      holdT: h.channel ? h.channel.t : -1,
      holdAs: h.channel && SKILLS[h.skills[h.channel.skill].id].kind === 'whirl' ? 'whirl' : 'beam',
      rollK, fallT: -1, reelT, reelBehind: sc.reelBehind ?? false,
    };
    let moved: [number, number] = [0, 0];
    if (from && !h.move) {
      const d = Math.hypot(h.x - from[0], h.y - from[1]);
      if (d < 1) {
        walked += d;
        moved = [h.x - from[0], h.y - from[1]];
      }
    }
    from = [h.x, h.y];
    st.walked = walked;
    st.moved = moved;
    const sp = fig.frame(art, st, dt, 0, 0, true);
    const img = sp.img as unknown as string | { src: string };
    const left = typeof img !== 'string';
    const [key, mt, view] = (typeof img === 'string' ? img : img.src).split('|');
    const lift = leapK >= 0 ? Math.sin(leapK * Math.PI) * 24 : 0;
    const arrows = game.projectiles.filter((q) => q.look === 'arrow').map((q) => ({ x: (q.x - q.y) * 16, y: (q.x + q.y) * 8, vx: q.vx, vy: q.vy, age: q.age, hostile: q.hostile }));
    out.push({ t, key, mt: Number(mt), view: view as View, left, x: (h.x - h.y) * 16, y: (h.x + h.y) * 8, lift, arrows, events: game.events.splice(0) });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// What the pictures do on the floor

export const BALL = 0.72;
export interface Placed {
  pts: Record<string, [number, number]>;
  holds: Record<string, [number, number] | null>;
  /** feet drawn standing while lifted off the floor */
  floating: number;
}
export function place(sh: Shown): Placed {
  const m = moveOf(sh.key);
  const { s } = at(m, sh.mt);
  const pts: Record<string, [number, number]> = {};
  const mirror = sh.left ? -1 : 1;
  for (const [k, p] of Object.entries(pointsOf(m, s))) {
    const [x, y] = seen(p as V3, sh.view);
    pts[k] = [sh.x + mirror * x, sh.y + y - sh.lift];
  }
  const holds: Record<string, [number, number] | null> = {};
  let floating = 0;
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const ball = lerp3(heel, toe, BALL);
    const by = ball[2] < 0.6 ? ball : heel[2] < 0.5 ? heel : null;
    if (by && sh.lift > 0.5) floating = Math.max(floating, sh.lift);
    if (!by || sh.lift > 0.5) {
      holds[side] = null;
      continue;
    }
    const [x, y] = seen(by, sh.view);
    holds[side] = [sh.x + mirror * x, sh.y + y];
    holds[`${side}by`] = by === ball ? [1, 0] : [0, 1];
  }
  return { pts, holds, floating };
}

