// THE GOLEM'S ROCKET JUMP AND ITS RUN, READY FOR THE GAME (the art chat's helper, 2 Nov 2026). BEHIND GOLEM_ROCKET (off):
// NOTHING OF THE GAME IMPORTS THIS FILE (tests/golem_rocket.test.ts proves it) until the main chat brings it in, on his yes.
//
// His words to the main chat, 2 Nov 2026, 21:29: “And the golem is gonna need that rocket jump for positioning, and probably
// more movespeed”. Drawn on its own body (dev/golem_rocket.ts, dev/golem_rocket_fx.ts), cut here into pieces the game lays
// where its stand-in already puts things (game/game.ts, the Golem's act 'jump'; render/render.ts drawTinkerers; render/
// tinkerer_fx.ts). The film and the sheet (docs/mockups/golem_rocket) are these very pieces, laid as below.
//
// ITS TIME, in frames of 30 a second, from the moment it decides to jump (`f` = Math.floor(actT * 30)):
//   0 .. 14       THE TAKE-OFF, on the floor where it stands (the game holds it there): it crouches, its stacks swing down
//                 and lock (frame 8), it holds, its stacks' fire flaring
//   15            THE BLAST (ROCKET.blast): it leaves the floor. Its flight's frame k = f - 15
//   15 .. 35      THE FLIGHT, 21 frames (0.7 s, the stand-in's J.long): the game carries it from where it took off to where it
//                 comes down, rocketAlong(k) of the way (steady, as the stand-in), lifted rocketUp(k) game pixels (46 at the
//                 top, the stand-in's J.high; up fast, down like a stone)
//   36            THE LANDING (ROCKET.land): its feet and fist slam down. The stand-in's golemArrive and shake go here
//   36 .. 56      it takes the blow and stands up again (ROCKET.end): its stacks swing back up and lock (frame 51)
//
//   golemRocketFrames(view, gun)    ITS PICTURE at each frame f (0 to ROCKET.end), drawn at its floor point; lift it by
//                                   rocketUp(f - ROCKET.blast) game pixels in the air, as the stand-in lifts its stand.
//   golemRocketFx(view)             EVERYTHING AT IT, by f: `floor` (the light of its stacks' fire on the floor, grit hopping:
//                                   while it holds its crouch) under it; `behind` laid just before its picture, `over` just
//                                   after, both lifted with it and turned over with it.
//   golemLaunchFx(view, gun)        WHERE IT TOOK OFF, by k from the blast (LAUNCH_N frames): `floor` its scorch and glowing
//                                   cracks; `air` its flash, fire splashed over the floor, the ring of dust, stone, smoke, and
//                                   its after-image where it crouched (its outline, k 1 and 2). At the take-off floor point, turned over
//                                   with the Golem's picture as it took off.
//   rocketPuffFx()                  THE PUFFS OF ITS TRAIL: three of them, each PUFF_LIFE frames of its life;
//   rocketTrail(view, flip, dx, dy, k)
//                                   which puffs to lay k frames after it left the floor, where (tiles from where it took off)
//                                   and how high (game pixels): its trail out of its stacks' fire, hanging where it passed.
//   golemLandFx(view)               WHERE IT LANDS, by k from the slam (LAND_N frames): `floor` the crater and its cracks
//                                   (fading over the last LAND_FADE); `air` its dust, its ring of dust, stone. At the landing
//                                   floor point, turned over with the Golem's picture.
//   golemRunFrames(view, gun)       ITS RUN at 5.5 tiles a second (GRUN.round frames), in place of its walk; by the floor it
//                                   covers, RUN_STRIDE tiles a round (the game's walkStride), so its fist and feet grip.
//   rocketShadow(k)                 its shadow on the floor as it flies: as the main chat's, shrinking as it rises.
//
// Every list is lazyFrames (painted when first asked for); `...Piece` paints one frame as pixels (for the tests and the film).
// `view`: 'back' when g.fx + g.fy < -0.2, as render.ts picks the Golem's picture; `flip`: render.ts's (g.fx - g.fy < 0).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { lazyFrames, toSprite } from './kit';
import { UNITS_PER_TILE } from './moves3';
import { project } from './skeleton';
import type { V3 } from './skeleton';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import { GOLEM_PICK, GOLEM_POSE, sculptGolemBuild } from '../dev/sculpt_golem';
import type { GolemGun } from '../dev/sculpt_golem';
import { GRUN, ROCKET, ROCKET_ARC, ROCKET_GRAIN, golemRocket, golemRun, rocketAlong, rocketUp } from '../dev/golem_rocket';
import type { RocketPose } from '../dev/golem_rocket';
import { LAND_N, LAUNCH_N, PUFF_LIFE, landFx, launchFx, layRocketAir, layRocketFloor, liftOf, puffFx, puffsBorn, rocketAtGolem, rocketLayers, stackFire } from '../dev/golem_rocket_fx';
import type { RocketAt } from '../dev/golem_rocket_fx';
import { ROCKET_POINTS } from './golem_rocket_points';

export { ROCKET, ROCKET_ARC, GRUN, rocketUp, rocketAlong, LAUNCH_N, LAND_N, PUFF_LIFE };

/** THE SWITCH: off until he has seen the pictures and said yes (CLAUDE.md, PICTURES FIRST). */
export const GOLEM_ROCKET = { on: false };

const T = UNITS_PER_TILE;
/** Picture pixels to a game pixel. */
export const ROCKET_FX_GRAIN = ROCKET_GRAIN;
/** The Golem as the game draws it: turned 45 from in front, 135 truly from behind (art/tinkerer_art.ts GOLEM_TURN). */
export const ROCKET_GOLEM_TURN: Record<GameView, number> = { front: 45, back: 135 };
/** Its run's stride: the floor it covers a round, in tiles (the game's walkStride for it). */
export const RUN_STRIDE = GRUN.stride;

/** One frame painted: its pixels, and its anchor (picture pixels). */
export interface Piece {
  px: Px;
  ax: number;
  ay: number;
}
const EMPTY = (): Piece => ({ px: new Px(2, 2), ax: 0, ay: 0 });
/** A piece as a Sprite, cut down to the box that holds it on whole game pixels. */
export function spriteOf(p: Piece): Sprite {
  const box = p.px.bounds(ROCKET_GRAIN);
  if (!box) return new Px(ROCKET_GRAIN, ROCKET_GRAIN).sprite(0, 0, ROCKET_GRAIN);
  return p.px.crop(box.x, box.y, box.w, box.h).sprite(p.ax - box.x, p.ay - box.y, ROCKET_GRAIN);
}
/** A point of the world (turned as the picture is) to the picture, its floor point at (ax, ay). */
const screenOf = (ax: number, ay: number) => (p: V3): [number, number] => {
  const s = project(p, 'front');
  return [ax + s[0], ay + s[1]];
};
const turnBy = (p: readonly number[], deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
};
/** A point seen in the mirror the game turns a picture over in (render.ts flipSprite). */
const mirror = (p: V3): V3 => [-p[1], -p[0], p[2]];

// ---- WHERE ITS PARTS ARE ---------------------------------------------------------------------------------------------------

/** Its stacks' mouths, ways and feet, its feet and its fist at frame `f`, turned as the game draws it in `view`. */
function partsAt(f: number, view: GameView): Omit<RocketAt, 'S' | 'lift'> {
  const B = ROCKET_POINTS;
  const i = Math.max(0, Math.min(B.n - 1, Math.round(f)));
  const v = B.v.slice(i * B.per, (i + 1) * B.per);
  const turn = ROCKET_GOLEM_TURN[view];
  const at = (j: number): V3 => turnBy(v.slice(j, j + 3), turn);
  return { mouths: [at(0), at(3)], ways: [at(6), at(9)], feet: [at(12), at(15)], grip: [at(18), at(21)], fist: at(24) };
}
/** (for its tests) its parts at frame `f` as RocketAt on a picture through `S`. */
export function rocketAtOf(f: number, view: GameView, S: (p: V3) => [number, number]): RocketAt {
  return { S, ...partsAt(f, view), lift: liftOf(f) };
}
/**
 * WHERE ITS STACKS' MOUTHS ARE at frame `f`, from its floor point: `x`, `y` tiles, `up` game pixels (not counting its lift in
 * the air); `flip` as the game turns its picture over. For anything more the game would hang on them.
 */
export function rocketStacks(view: GameView, f: number, flip = false): { x: number; y: number; up: number }[] {
  return partsAt(f, view).mouths.map((m) => {
    const p = flip ? mirror(m) : m;
    return { x: p[0] / T, y: -p[1] / T, up: p[2] / ROCKET_GRAIN };
  });
}

// ---- ITS PICTURE -------------------------------------------------------------------------------------------------------------

/** The heroes' pool of light under the Golem, as art/tinkerer_art.ts gives it. */
const AURA = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };
/** The Golem posed so, drawn (its pose put back after: its rocket's own three left out again). */
function golemPx(view: GameView, pose: RocketPose, gun: GolemGun): Px {
  Object.assign(GOLEM_POSE, REST, pose);
  try {
    return sculptGolemBuild('front', GOLEM_PICK.build, ROCKET_GOLEM_TURN[view], -14, GOLEM_PICK.giant, gun).px;
  } finally {
    Object.assign(GOLEM_POSE, REST);
    delete GOLEM_POSE.stacks;
    delete GOLEM_POSE.splay;
    delete GOLEM_POSE.flare;
    delete GOLEM_POSE.hips;
  }
}
const bodyKept = new Map<string, Px>();
/** ITS PICTURE at frame `f` of its rocket jump (its floor point at CANVAS3.ax, CANVAS3.ay). */
export function golemRocketPiece(view: GameView, gun: GolemGun, f: number): Piece {
  const key = `${view}:${gun}:${f}`;
  let px = bodyKept.get(key);
  if (!px) bodyKept.set(key, (px = golemPx(view, golemRocket(f), gun)));
  return { px, ax: CANVAS3.ax, ay: CANVAS3.ay };
}
/** ITS PICTURE at frame `f` of its run. */
export function golemRunPiece(view: GameView, gun: GolemGun, f: number): Piece {
  return { px: golemPx(view, golemRun(f), gun), ax: CANVAS3.ax, ay: CANVAS3.ay };
}
const asSprite = (p: Piece): Sprite => toSprite({ px: p.px, lights: [] }, AURA, p.ax, p.ay);
const framesKept = new Map<string, Sprite[]>();
/** ITS PICTURE through its rocket jump, frame by frame (0 to ROCKET.end): lift frame f by rocketUp(f - ROCKET.blast) game pixels. */
export function golemRocketFrames(view: GameView, gun: GolemGun = 'cannon'): Sprite[] {
  const key = `rocket:${view}:${gun}`;
  let s = framesKept.get(key);
  if (!s) framesKept.set(key, (s = lazyFrames(ROCKET.end + 1, (f) => asSprite(golemRocketPiece(view, gun, f)))));
  return s;
}
/** ITS RUN, a round of GRUN.round frames: shown by the floor it covers, RUN_STRIDE tiles a round (its fist and feet grip). */
export function golemRunFrames(view: GameView, gun: GolemGun = 'cannon'): Sprite[] {
  const key = `run:${view}:${gun}`;
  let s = framesKept.get(key);
  if (!s) framesKept.set(key, (s = lazyFrames(GRUN.round, (f) => asSprite(golemRunPiece(view, gun, f)))));
  return s;
}

// ---- EVERYTHING AT IT ----------------------------------------------------------------------------------------------------------

/** Its canvas (picture pixels) and the Golem's floor point on it. */
export const AT_CANVAS = { w: 248, h: 300, ax: 124, ay: 196 } as const;
/** EVERYTHING AT THE GOLEM at frame `f`: its floor's, what is behind it, what is over it (lifted with it in the air). */
export function rocketAtPiece(view: GameView, f: number): { floor: Piece; behind: Piece; over: Piece } {
  const { w, h, ax, ay } = AT_CANVAS;
  const ly = rocketLayers();
  if (f >= 1 && f <= ROCKET.end) rocketAtGolem(ly, rocketAtOf(f, view, screenOf(ax, ay)), f, view === 'front');
  // (lifted with it: what is at it is painted up with it on its canvas; laid at its floor point lifted the same, so here put back down)
  const lift = liftOf(f);
  const drop = (px: Px): Px => {
    if (!lift) return px;
    const out = new Px(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const sy = y - lift;
      if (sy < 0 || sy >= h) continue;
      const i = (sy * w + x) * 4;
      if (!px.d[i + 3]) continue;
      const j = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) out.d[j + c] = px.d[i + c];
    }
    return out;
  };
  return {
    floor: { px: layRocketFloor(w, h, ly), ax, ay },
    behind: { px: drop(layRocketAir(w, h, ly.behind)), ax, ay },
    over: { px: drop(layRocketAir(w, h, ly.over)), ax, ay },
  };
}
const atKept = new Map<GameView, { floor: Sprite[]; behind: Sprite[]; over: Sprite[] }>();
/**
 * EVERYTHING AT THE GOLEM, frame by frame (0 to ROCKET.end), at its floor point: `floor` under what stands; `behind` laid
 * just before the Golem's picture and `over` just after it, both lifted with it (rocketUp) and turned over with it.
 */
export function golemRocketFx(view: GameView): { floor: Sprite[]; behind: Sprite[]; over: Sprite[] } {
  let s = atKept.get(view);
  if (!s) {
    const one = new Map<number, ReturnType<typeof rocketAtPiece>>();
    const at = (f: number): ReturnType<typeof rocketAtPiece> => {
      let p = one.get(f);
      if (!p) one.set(f, (p = rocketAtPiece(view, f)));
      return p;
    };
    const n = ROCKET.end + 1;
    s = { floor: lazyFrames(n, (f) => spriteOf(at(f).floor)), behind: lazyFrames(n, (f) => spriteOf(at(f).behind)), over: lazyFrames(n, (f) => spriteOf(at(f).over)) };
    atKept.set(view, s);
  }
  return s;
}

// ---- WHERE IT TOOK OFF ---------------------------------------------------------------------------------------------------------

export const LAUNCH_CANVAS = { w: 300, h: 250, ax: 150, ay: 168 } as const;
/** Where its column of fire drives into the floor as it blasts off (from its floor point, turned as it is drawn in `view`). */
function launchPoint(view: GameView): V3 {
  const p = partsAt(ROCKET.blast, view);
  const hits = p.mouths.map((m, i) => {
    const w = p.ways[i];
    const t = w[2] < -0.05 ? m[2] / -w[2] : 0;
    return [m[0] + w[0] * t, m[1] + w[1] * t];
  });
  return [(hits[0][0] + hits[1][0]) / 2, (hits[0][1] + hits[1][1]) / 2, 0];
}
/** WHERE IT TOOK OFF, `k` frames after the blast: `floor` and `air`, at the take-off floor point. */
export function launchPiece(view: GameView, gun: GolemGun, k: number): { floor: Piece; air: Piece } {
  if (k < 0 || k >= LAUNCH_N) return { floor: EMPTY(), air: EMPTY() };
  const { w, h, ax, ay } = LAUNCH_CANVAS;
  const ly = rocketLayers();
  launchFx(ly, ly.over, screenOf(ax, ay), launchPoint(view), k, 41);
  const air = layRocketAir(w, h, ly.over);
  // (ITS AFTER-IMAGE where it crouched, as it is flung up: its outline in the friend's cyan, then darker, then gone)
  if (k === 1 || k === 2) {
    const g = golemRocketPiece(view, gun, ROCKET.blast - 1);
    const ox = ax - g.ax;
    const oy = ay - g.ay;
    const inG = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < g.px.w && y < g.px.h && g.px.d[(y * g.px.w + x) * 4 + 3] === 255;
    const col = k === 1 ? [0x22, 0xd0, 0xe0] : [0x0c, 0x6a, 0x80];
    for (let y = 0; y < g.px.h; y++) for (let x = 0; x < g.px.w; x++) {
      if (!inG(x, y)) continue;
      // (its edge, two pixels in)
      if (inG(x - 1, y) && inG(x + 1, y) && inG(x, y - 1) && inG(x, y + 1) && inG(x - 2, y) && inG(x + 2, y) && inG(x, y - 2) && inG(x, y + 2)) continue;
      const X = ox + x;
      const Y = oy + y;
      if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
      const j = (Y * w + X) * 4;
      if (air.d[j + 3]) continue;
      air.d[j] = col[0];
      air.d[j + 1] = col[1];
      air.d[j + 2] = col[2];
      air.d[j + 3] = 255;
    }
  }
  return { floor: { px: layRocketFloor(w, h, ly), ax, ay }, air: { px: air, ax, ay } };
}
const launchKept = new Map<string, { floor: Sprite[]; air: Sprite[] }>();
/** WHERE IT TOOK OFF, frame by frame from the blast (LAUNCH_N): `floor` under what stands, `air` over it (see the README for its depth). */
export function golemLaunchFx(view: GameView, gun: GolemGun = 'cannon'): { floor: Sprite[]; air: Sprite[] } {
  const key = `${view}:${gun}`;
  let s = launchKept.get(key);
  if (!s) {
    const one = new Map<number, ReturnType<typeof launchPiece>>();
    const at = (k: number): ReturnType<typeof launchPiece> => {
      let p = one.get(k);
      if (!p) one.set(k, (p = launchPiece(view, gun, k)));
      return p;
    };
    s = { floor: lazyFrames(LAUNCH_N, (k) => spriteOf(at(k).floor)), air: lazyFrames(LAUNCH_N, (k) => spriteOf(at(k).air)) };
    launchKept.set(key, s);
  }
  return s;
}

// ---- ITS TRAIL ----------------------------------------------------------------------------------------------------------------

export const PUFF_CANVAS = { w: 44, h: 52, ax: 22, ay: 34 } as const;
/** A PUFF of its trail, variant `v` (0 to 2), `age` frames old: anchored where it was born. */
export function puffPiece(v: number, age: number): Piece {
  const { w, h, ax, ay } = PUFF_CANVAS;
  const ly = rocketLayers();
  puffFx(ly.over, ax, ay, age, 5 + v * 17);
  return { px: layRocketAir(w, h, ly.over), ax, ay };
}
let puffsKept: Sprite[][] | null = null;
/** THE PUFFS OF ITS TRAIL: three, each PUFF_LIFE frames of its life. */
export function rocketPuffFx(): Sprite[][] {
  return (puffsKept ??= [0, 1, 2].map((v) => lazyFrames(PUFF_LIFE, (age) => spriteOf(puffPiece(v, age)))));
}
/** A puff of its trail to lay: `x`, `y` tiles from where it took off, `up` game pixels over the floor; `v` which puff, `age` its frame. */
export interface TrailPuff {
  x: number;
  y: number;
  up: number;
  v: number;
  age: number;
}
/**
 * ITS TRAIL `k` frames after it left the floor, it going (dx, dy) tiles (the stand-in's ax - jx, ay - jy) in `flight` frames
 * (ROCKET.flight): each puff born out of the fire of one of its stacks where that was, hanging there, aging. Lay each over
 * what stands: rocketPuffFx()[p.v][p.age] at (x0 + p.x, y0 + p.y) lifted p.up.
 */
export function rocketTrail(view: GameView, flip: boolean, dx: number, dy: number, k: number, flight: number = ROCKET.flight): TrailPuff[] {
  const out: TrailPuff[] = [];
  for (let b = 1; b <= Math.min(k, flight); b++) {
    const age = k - b;
    if (age >= PUFF_LIFE) continue;
    const f = ROCKET.blast + Math.round((b / flight) * ROCKET.flight);
    const p = partsAt(f, view);
    const reach = Math.min(30, stackFire(f).len) * 0.45;
    for (const i of puffsBorn(Math.round((b / flight) * ROCKET.flight))) {
      const m0 = p.mouths[i];
      const w0 = p.ways[i];
      const m: V3 = [m0[0] + w0[0] * reach, m0[1] + w0[1] * reach, m0[2] + w0[2] * reach];
      const q = flip ? mirror(m) : m;
      const u = rocketAlong(b, flight);
      out.push({ x: dx * u + q[0] / T, y: dy * u - q[1] / T, up: Math.max(2, (q[2] / ROCKET_GRAIN) + rocketUp(b, flight)), v: (b + i) % 3, age });
    }
  }
  return out;
}

// ---- WHERE IT LANDS ------------------------------------------------------------------------------------------------------------

export const LAND_CANVAS = { w: 320, h: 230, ax: 160, ay: 140 } as const;
/** Where it lands hardest (from its floor point, turned as drawn in `view`): between its feet and its fist as they slam down. */
function landPoint(view: GameView): V3 {
  const p = partsAt(ROCKET.land, view);
  const pts = [...p.grip, p.fist, p.fist];
  return [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length, 0];
}
/** WHERE IT LANDS, `k` frames after the slam: `floor` and `air`, at the landing floor point. */
export function landPiece(view: GameView, k: number): { floor: Piece; air: Piece } {
  if (k < 0 || k >= LAND_N) return { floor: EMPTY(), air: EMPTY() };
  const { w, h, ax, ay } = LAND_CANVAS;
  const ly = rocketLayers();
  landFx(ly, ly.over, screenOf(ax, ay), landPoint(view), k, 23);
  return { floor: { px: layRocketFloor(w, h, ly), ax, ay }, air: { px: layRocketAir(w, h, ly.over), ax, ay } };
}
const landKept = new Map<GameView, { floor: Sprite[]; air: Sprite[] }>();
/** WHERE IT LANDS, frame by frame from the slam (LAND_N): `floor` its crater under what stands, `air` its dust and stone over it. */
export function golemLandFx(view: GameView): { floor: Sprite[]; air: Sprite[] } {
  let s = landKept.get(view);
  if (!s) {
    const one = new Map<number, ReturnType<typeof landPiece>>();
    const at = (k: number): ReturnType<typeof landPiece> => {
      let p = one.get(k);
      if (!p) one.set(k, (p = landPiece(view, k)));
      return p;
    };
    s = { floor: lazyFrames(LAND_N, (k) => spriteOf(at(k).floor)), air: lazyFrames(LAND_N, (k) => spriteOf(at(k).air)) };
    landKept.set(view, s);
  }
  return s;
}

// ---- ITS SHADOW ----------------------------------------------------------------------------------------------------------------

/**
 * ITS SHADOW `k` frames after it left the floor, as the main chat's (render.ts: GOLEM_SHADOW 0.6 round, its strength
 * min(1, SHADOW x 1.2)), shrinking and fading as it rises: `r` times its size on the floor, `a` times its strength.
 */
export function rocketShadow(k: number, flight: number = ROCKET.flight): { r: number; a: number } {
  const come = 1 - 0.45 * (rocketUp(k, flight) / ROCKET_ARC.high);
  return { r: 0.6 + 0.4 * come, a: come };
}

/**
 * PAINT AHEAD: paint the frames of `lists` not yet painted, first to last, for at most `ms` thousandths of a second; true when
 * all are. (Its picture is some 50 thousandths a frame to paint, its pieces some 5 to 30: paint them while it crouches, or
 * when she is picked, so that none is painted as it is shown.)
 */
export function paintRocketAhead(lists: readonly (readonly Sprite[])[], ms: number): boolean {
  const t0 = performance.now();
  for (const list of lists) {
    for (let i = 0; i < list.length; i++) {
      const d = Object.getOwnPropertyDescriptor(list, i);
      if (d && 'value' in d) continue;
      if (performance.now() - t0 > ms) return false;
      void list[i];
    }
  }
  return true;
}
