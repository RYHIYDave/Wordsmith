// THE GOLEM'S CHARGED SHOTS AND THE CONTRAPTION'S BOMBS AND BOLTS, READY FOR THE GAME (the art chat's helper, 31 Oct 2026).
//
// The same pictures as the films he said yes to (docs/mockups/golem_shots, his “Yes, that's them (Recommended)”;
// docs/mockups/contraption_shots, the same words), painted by the art's own hands (dev/golem_charge_fx.ts,
// dev/contraption_shots.ts), each laid on a canvas of its own at the game's grain (2 picture pixels a game pixel), its anchor
// a point of the floor the game knows. Nothing here draws anything new; it only cuts the films' effects into pieces the game
// can lay where its rules say things happen. Everything that glows is the friend's cyan and white: no pink, no gold.
//
//   golemChargeFx(view, gun)         EVERYTHING AT THE GOLEM, frame by frame by chargeFrame's frame `f` (0 to its last):
//                                    the charge (light gathering at its gun's mouth, motes of cyan drawn spiralling in, the ring
//                                    round it on the floor and its grit hopping, its stacks hissing, the coil's arcs, the flash
//                                    at its full; the loop's six frames the same each round), and after the shot what stays at
//                                    it (the cannon's great burst and its smoke, the stacks' steam, the dust of its skid; the
//                                    coil spitting and smoking). ANCHOR: the Golem's own floor point, as its picture's
//                                    (art/tinkerer_art.ts golemCharge); laid with it, flipped with it. `floor` under it, `air`
//                                    over it.
//   golemShellFlightFx(view, flip, dx, dy, frames?)
//                                    THE SHELL from its mouth to where it lands (dx, dy tiles from the Golem's floor point as
//                                    it fired), turned to its heading, smeared, its cyan trail thinning after it lands. ANCHOR:
//                                    the Golem's floor point as it fired (the event's x0, y0).
//   golemShellBlastFx(r?)            THE WIDE BLAST where it lands (2.5 tiles round as approved; `r` for a weaker one): flash,
//                                    dome, ring, tongues of fire, stone, smoke column; `floor` its scorch and glowing cracks.
//                                    ANCHOR: where it lands.
//   golemBeamFx(view, flip, dx, dy, up?)
//                                    THE BEAM from the coil's ball to its end (dx, dy tiles from the Golem's floor point; any
//                                    heading, any length to 8 tiles), frame by frame from the shot: two-thirds out, all of it,
//                                    held writhing, thinning to threads, gone. ANCHOR: the Golem's floor point AS IT IS DRAWN
//                                    THAT FRAME (it skids back as the beam pours; the beam goes with it, as in the film).
//   contraptionBombBlastFx(r?)       HER LITTLE BOMB GOING OFF (2.0 tiles round as approved). ANCHOR: where it goes off.
//   contraptionBoltFx(view, flip, dx, dy, up?)
//                                    THE ENERGY CONTRAPTION'S SHOT: the flash at its ball, the bolt streaking to what it hits
//                                    (dx, dy tiles from the Contraption's floor point; at `up` game pixels, a chest), its hit
//                                    crackling, its ball spitting and smoking. ANCHOR: the Contraption's floor point.
//
// Every one returns Sprites, painted when first asked for (art/kit.ts lazyFrames), frame `k` the k-th thirtieth of a second.
// A frame with nothing in it is an empty sprite of one game pixel. `...Piece` paints one frame as pixels (for its tests).
// `paintAhead` paints a list's frames ahead of time within a budget (the blasts are slow to paint: see it).
//
// LAYING THEM AS THE FILM DOES: every `floor` under what stands; the Golem; then its `air`; the shell's flight over it but
// for the shot's first two frames (k 0 and 1, the shell still in the great burst at its mouth: under it then); the blast's
// air last. In the films everything was one picture, its light over all smoke; laid as pieces, where two pieces cross the
// later one is on top (the only difference but the grain: tests/golem_shots_fx.test.ts 4).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { lazyFrames } from './kit';
import { UNITS_PER_TILE } from './moves3';
import { project } from './skeleton';
import type { V3 } from './skeleton';
import type { GameView } from './skin';
import { GCHARGE, GCHARGE_BEAM, GCHARGE_SHELL, chargeSkid } from '../dev/golem_moves';
import { BEAM_FX, SHELL_FX, beamFx, beamReach, beamWidth, bigBurst, chargeLayers, charging, layAir, layFloor, shellFlight, shellFlightFx, wideBlast } from '../dev/golem_charge_fx';
import type { ChargeAt, ChargeLayers } from '../dev/golem_charge_fx';
import { BOMB_FX, CBOLT, bombBlast, boltFlight, boltFx, boltFxLong, layShotAir, layShotFloor, shotLayers } from '../dev/contraption_shots';
import type { ShotAt } from '../dev/contraption_shots';
import { cloud } from '../dev/warlock_fx';
import { crackle } from '../dev/golem_gun_fx';
import { CONTRAPTION_BALL, GOLEM_SHOT_POINTS } from './golem_shots_points';

export type ShotGun = 'cannon' | 'tesla';
/** Picture pixels to a game pixel (the heroes' grain, as render/tinkerer_fx.ts lays her effects). */
export const FX_GRAIN = 2;
const T = UNITS_PER_TILE;
/** The Golem as the game draws it: turned 45 from in front, 135 truly from behind (art/tinkerer_art.ts GOLEM_TURN). */
export const SHOT_GOLEM_TURN: Record<GameView, number> = { front: 45, back: 135 };
/** The Contraption as the game draws it (art/tinkerer_art.ts CON_TURN). */
export const SHOT_CON_TURN: Record<GameView, number> = { front: 315, back: 45 };

/** One frame painted: its pixels, and its anchor (picture pixels). */
export interface Piece {
  px: Px;
  ax: number;
  ay: number;
}
/** What lies on the floor (laid under what stands) and what is in the air (over it). */
export interface Layered<T> {
  floor: T;
  air: T;
}

// ---- THE FLOOR AS THE GAME SEES IT ---------------------------------------------------------------------------------------

/** A point of the world (figure units, the floor's own measure, x and y along the floor, z up) to the picture, its floor point at (ax, ay). */
const screenOf = (ax: number, ay: number) => (p: V3): [number, number] => {
  const s = project(p, 'front');
  return [ax + s[0], ay + s[1]];
};
/** The game's tiles to the world: a tile along the game's x is T along the world's, along its y T back along the world's. */
const fromTiles = (dx: number, dy: number, z = 0): V3 => [dx * T, -dy * T, z];
const turnBy = (p: readonly number[], deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
};
/** A point seen in the mirror the game turns a picture over in (render.ts flipSprite): the picture's x the other way, its y the same. */
const mirror = (p: V3): V3 => [-p[1], -p[0], p[2]];
const EMPTY = (): Piece => ({ px: new Px(2, 2), ax: 0, ay: 0 });
/** A piece as a Sprite, cut down to the box that holds it on whole game pixels (as art/kit.ts toSprite does). */
export function spriteOf(p: Piece): Sprite {
  const box = p.px.bounds(FX_GRAIN);
  if (!box) return new Px(FX_GRAIN, FX_GRAIN).sprite(0, 0, FX_GRAIN);
  return p.px.crop(box.x, box.y, box.w, box.h).sprite(p.ax - box.x, p.ay - box.y, FX_GRAIN);
}
const even = (v: number): number => 2 * Math.round(v / 2);

// ---- WHERE THE GOLEM'S POINTS ARE ----------------------------------------------------------------------------------------

interface GolemPoints {
  muzzle: V3;
  way: V3;
  coil: [V3, V3] | null;
  stacks: V3[];
  grip: V3[];
}
/** Its points at frame `f` of its charged shot (from before it fires to its end, held after), turned as the game draws it in `view`. */
function golemPoints(gun: ShotGun, f: number, view: GameView): GolemPoints {
  const B = GOLEM_SHOT_POINTS[gun];
  const end = gun === 'tesla' ? GCHARGE_BEAM.end : GCHARGE_SHELL.end;
  const i = Math.max(0, Math.min(B.n - 1, Math.min(f, end) - B.from));
  const v = B.v.slice(i * B.per, (i + 1) * B.per);
  const turn = SHOT_GOLEM_TURN[view];
  const at = (j: number): V3 => turnBy(v.slice(j, j + 3), turn);
  const c = gun === 'tesla' ? 6 : 0;
  return {
    muzzle: at(0),
    way: at(3),
    coil: gun === 'tesla' ? [at(6), at(9)] : null,
    stacks: [at(6 + c), at(9 + c)],
    grip: [at(12 + c), at(15 + c), at(18 + c)],
  };
}
/** The Golem's frame `f` as a ChargeAt on a picture whose floor point (under the Golem) is at (ax, ay): skidded back by its shot as the film's is (the game moves it; the picture's floor point goes with it). */
function golemAt(gun: ShotGun, f: number, view: GameView, S: (p: V3) => [number, number]): ChargeAt {
  const g = golemPoints(gun, f, view);
  // (the film's points are where the Golem is drawn: the game draws it where it has skidded to; so here, at its own floor point)
  return {
    S,
    muzzle: g.muzzle,
    way: g.way,
    // (its gun's own vents are quiet by his word, GUN_STEAM: only the coil's foot and tip are read, for its arcs)
    vents: g.coil ? [g.coil[0], g.coil[1], g.coil[0], g.coil[1]] : [],
    ventWays: [],
    stacks: g.stacks,
    grip: g.grip,
    fired: g.muzzle,
    aim: g.muzzle,
  };
}
/** (for its tests: its frame as the art's own chargeFx takes it, from the baked points) */
export const golemShotAt = golemAt;
/**
 * WHERE ITS GUN'S MOUTH IS at frame `f` of its charged shot (chargeFrame's frame), from the Golem's floor point: `x`, `y` in
 * the game's tiles, `up` in game pixels; `flip` as the game turns its picture over (render.ts: facing left).
 */
export function golemMuzzle(view: GameView, gun: ShotGun, f: number, flip = false): { x: number; y: number; up: number } {
  const m = golemPoints(gun, f, view).muzzle;
  const p = flip ? mirror(m) : m;
  return { x: p[0] / T, y: -p[1] / T, up: p[2] / FX_GRAIN };
}

// ---- EVERYTHING AT THE GOLEM ---------------------------------------------------------------------------------------------

/** Its canvas (picture pixels) and the Golem's floor point on it: room for all it throws off round it. */
export const CHARGE_CANVAS = { w: 186, h: 176, ax: 68, ay: 134 } as const;
/** The last frame (chargeFrame's) with anything of it still at the Golem: its smoke curling up off the barrel or the coil (by its move's end there is all but nothing to see). */
export const CHARGE_FX_LAST: Record<ShotGun, number> = { cannon: GCHARGE.fire + 8 + 2 * 7 + 24, tesla: GCHARGE_BEAM.held + 2 * 6 + 24 };

const hash = (i: number): number => {
  const x = Math.sin(i * 57.31 + 23.7) * 43758.5453;
  return x - Math.floor(x);
};
const onPicture = (S: (p: V3) => [number, number], p: V3, w: V3): [number, number] => {
  const a = S(p);
  const b = S([p[0] + w[0] * 10, p[1] + w[1] * 10, p[2] + w[2] * 10]);
  const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / n, (b[1] - a[1]) / n];
};
/**
 * After its shot, what stays at the Golem: dev/golem_charge_fx.ts chargeFx's own strokes, but for the shell's flight and its
 * blast and the beam (each a piece of its own here). tests/golem_shots_fx.test.ts holds them to chargeFx, light for light.
 */
function afterAtGolem(kind: 'shell' | 'beam', ly: ChargeLayers, at: ChargeAt, f: number, t: number): void {
  const C = GCHARGE;
  const k = f - C.fire;
  const m = at.S(at.muzzle);
  const [dx, dy] = onPicture(at.S, at.muzzle, at.way);
  // (its recoil: steam bursting out of its stacks; dust kicked up where it grips the floor as it skids)
  at.stacks.forEach((p, i) => {
    const s = at.S(p);
    for (let j = 0; j < 4; j++) {
      const age = k - j * 2;
      if (age < 0 || age > 22) continue;
      const r = (3 + age * 0.55) * (kind === 'shell' ? 1.15 : 1);
      cloud(ly.st, s[0] + Math.sin(j * 1.7 + i) * 2, s[1] - 3 - age * 1.6, 2 * r, 1.6 * r, t + j * 0.3, Math.min(1, 0.03 + age / 23), 8000 + i * 13 + j);
    }
  });
  const skidding = kind === 'shell' ? k < 14 : k < 20;
  if (skidding) {
    at.grip.forEach((p, i) => {
      const g = at.S([p[0], p[1], 0]);
      const r = (kind === 'shell' ? 4.5 : 3) * (1 - k / 16) + 1.5;
      cloud(ly.st, g[0] + (i - 1) * 2, g[1] + 1, 2.4 * r, 1.3 * r, t + i * 0.4, Math.min(1, 0.15 + k / 18), 8500 + i * 7 + k);
    });
  }
  if (kind === 'shell') {
    bigBurst(ly.l, m[0] + dx * 2, m[1] + dy * 2, dx, dy, k, 77);
    // (smoke rolling out of its mouth, and then curling up off it as the barrel cools)
    if (k < 30) {
      for (let i = 0; i < 6; i++) {
        const out = (6 + 20 * hash(91 + i)) * (1 - Math.exp(-k / 4));
        const up = k * (0.35 + 0.3 * hash(97 + i));
        const r = 5 + i * 1.1 + k * 0.5;
        cloud(ly.sm, m[0] + dx * (6 + out) + (hash(93 + i) - 0.5) * 12, m[1] + dy * (6 + out) - up, 2 * r, 1.6 * r, t + i, Math.min(1, 0.02 + k / 32), 9000 + i);
      }
    }
    for (let j = 0; j < 3; j++) {
      const age = k - 8 - j * 7;
      if (age < 0 || age > 24) continue;
      const r = 2 + age * 0.3;
      cloud(ly.sm, m[0] + Math.sin(age * 0.35 + j) * 3, m[1] - 2 - age * 1.1, 2 * r, 1.6 * r, t + j, Math.min(1, 0.15 + age / 25), 9100 + j);
    }
    return;
  }
  // (the coil spitting as it cools, and smoke curling off its ball)
  if (f > GCHARGE_BEAM.gone - 2 && f < GCHARGE_BEAM.gone + 16 && f % 3 === 0) crackle(ly.l, m[0], m[1], 6, 1, 1200 + f);
  for (let j = 0; j < 3; j++) {
    const age = f - GCHARGE_BEAM.held - j * 6;
    if (age < 0 || age > 24) continue;
    const r = 2 + age * 0.3;
    cloud(ly.sm, m[0] + Math.sin(age * 0.35 + j) * 3, m[1] - 3 - age * 1.0, 2 * r, 1.6 * r, t + j, Math.min(1, 0.15 + age / 25), 9200 + j);
  }
}
/** The lights of everything at the Golem at frame `f` (on a picture through `S`), at time `t`. */
export function golemChargeLights(gun: ShotGun, view: GameView, f: number, t: number, S: (p: V3) => [number, number]): ChargeLayers {
  const kind = gun === 'tesla' ? 'beam' : 'shell';
  const ly = chargeLayers();
  if (f < GCHARGE.aimed || f > CHARGE_FX_LAST[gun]) return ly;
  const at = golemAt(gun, f, view, S);
  if (f < GCHARGE.fire) charging(kind, ly, at, f);
  else afterAtGolem(kind, ly, at, f, t);
  return ly;
}
/** EVERYTHING AT THE GOLEM, one frame: `f` chargeFrame's frame, anchored at the Golem's floor point. */
export function golemChargePiece(view: GameView, gun: ShotGun, f: number): Layered<Piece> {
  const { w, h, ax, ay } = CHARGE_CANVAS;
  const ly = golemChargeLights(gun, view, f, f / 30, screenOf(ax, ay));
  return { floor: { px: layFloor(w, h, ly), ax, ay }, air: { px: layAir(w, h, ly), ax, ay } };
}
const chargeKept = new Map<string, Layered<Sprite[]>>();
/**
 * EVERYTHING AT THE GOLEM, frame by frame (index: chargeFrame's frame, 0 to CHARGE_FX_LAST[gun]; past its move's end it is
 * only smoke). Lay `floor[f]` under the Golem and `air[f]` over it, at its floor point, flipped as its picture is.
 */
export function golemChargeFx(view: GameView, gun: ShotGun): Layered<Sprite[]> {
  const key = `${view}:${gun}`;
  let s = chargeKept.get(key);
  if (!s) {
    const n = CHARGE_FX_LAST[gun] + 1;
    const one = new Map<number, Layered<Piece>>();
    const at = (f: number): Layered<Piece> => {
      let p = one.get(f);
      if (!p) one.set(f, (p = golemChargePiece(view, gun, f)));
      return p;
    };
    s = { floor: lazyFrames(n, (f) => spriteOf(at(f).floor)), air: lazyFrames(n, (f) => spriteOf(at(f).air)) };
    chargeKept.set(key, s);
  }
  return s;
}

// ---- A PIECE ALONG A LINE (the shell's flight, the beam, the bolt) -------------------------------------------------------

/**
 * A canvas round the points `pts` (the world, its floor point the anchor), `pad` picture pixels all round; painted by
 * `paint`, its layers laid by `lay`. If the line runs to the left of the picture it is painted as it runs to the right and
 * the picture turned over (as the films drew them: the shell lit from above whichever way it flies).
 */
function along<L>(pts: V3[], pad: number, left: boolean, make: () => L, paint: (ly: L, S: (p: V3) => [number, number], pts: V3[]) => void, lay: (w: number, h: number, ly: L) => Px): Piece {
  const use = left ? pts.map(mirror) : pts;
  const raw = screenOf(0, 0);
  const sp = use.flatMap((p) => [raw(p), raw([p[0], p[1], 0])]);
  const x0 = even(Math.floor(Math.min(...sp.map((p) => p[0]))) - pad - 1);
  const y0 = even(Math.floor(Math.min(...sp.map((p) => p[1]))) - pad - 1);
  const x1 = Math.ceil(Math.max(...sp.map((p) => p[0]))) + pad;
  const y1 = Math.ceil(Math.max(...sp.map((p) => p[1]))) + pad;
  const w = even(x1 - x0 + 2);
  const h = even(y1 - y0 + 2);
  const ax = -x0;
  const ay = -y0;
  const ly = make();
  paint(ly, screenOf(ax, ay), use);
  const px = lay(w, h, ly);
  return left ? { px: px.flipX(), ax: w - 1 - ax, ay } : { px, ax, ay };
}
/** Whether the line from `a` to `b` runs to the left of the picture (straight up or down it: whether the picture is turned over, `flip`). */
const goesLeft = (a: V3, b: V3, flip: boolean): boolean => {
  const s = screenOf(0, 0);
  const d = s(b)[0] - s(a)[0];
  return d < -1e-6 || (d <= 1e-6 && flip);
};
const layCharge = (w: number, h: number, ly: ChargeLayers): Px => {
  const px = layFloor(w, h, ly);
  const air = layAir(w, h, ly);
  for (let i = 0; i < air.d.length; i += 4) if (air.d[i + 3]) for (let c = 0; c < 4; c++) px.d[i + c] = air.d[i + c];
  return px;
};

// ---- THE SHELL -----------------------------------------------------------------------------------------------------------

/** How far round its line the shell's flight reaches (picture pixels): the shell, its after-images, its trail. */
const SHELL_PAD = 30;
/** Where the cannon's mouth is as it fires, and where the shell lands, for a Golem drawn in `view` (flipped if `flip`), the landing (dx, dy) tiles from its floor point. */
function shellLine(view: GameView, flip: boolean, dx: number, dy: number): [V3, V3] {
  const m = golemPoints('cannon', GCHARGE.fire, view).muzzle;
  return [flip ? mirror(m) : m, fromTiles(dx, dy, 0)];
}
/** Frames the shell flies from its mouth to (dx, dy): at SHELL_FX.speed, as the art's. */
export function shellFrames(view: GameView, flip: boolean, dx: number, dy: number): number {
  const [a, b] = shellLine(view, flip, dx, dy);
  return shellFlight({ fired: a, aim: b } as ChargeAt);
}
/** THE SHELL IN FLIGHT, `k` frames after it fired (its flight `n` frames): anchored at the Golem's floor point as it fired. */
export function shellFlightPiece(view: GameView, flip: boolean, dx: number, dy: number, k: number, n: number): Piece {
  if (k < 0 || k > n + 3) return EMPTY();
  const [a, b] = shellLine(view, flip, dx, dy);
  return along([a, b], SHELL_PAD, goesLeft(a, b, flip), chargeLayers, (ly, S, [fa, fb]) => {
    shellFlightFx(ly, { S, fired: fa, aim: fb } as ChargeAt, k, n);
  }, layCharge);
}
/**
 * THE SHELL'S FLIGHT, frame by frame from the shot (frame 0 the frame it fires): the shell landing at frame `n` - 1, its
 * trail gone by `n` + 3. `frames` the game's own flight in frames (round(flight x 30)), so that it lands as the game's blast
 * goes off; left out, the art's (SHELL_FX.speed from its mouth).
 */
export function golemShellFlightFx(view: GameView, flip: boolean, dx: number, dy: number, frames?: number): { frames: Sprite[]; n: number } {
  const n = Math.max(2, Math.round(frames ?? shellFrames(view, flip, dx, dy)));
  return { frames: lazyFrames(n + 4, (k) => spriteOf(shellFlightPiece(view, flip, dx, dy, k, n))), n };
}

/** THE BLAST's canvas (picture pixels) and where it lands on it. */
export const BLAST_CANVAS = { w: 256, h: 222, ax: 128, ay: 152 } as const;
/** THE WIDE BLAST `k` frames after the shell lands, `r` tiles round (SHELL_FX.blast as approved). */
export function shellBlastPiece(k: number, r: number = SHELL_FX.blast, t = k / 30): Layered<Piece> {
  const { w, h, ax, ay } = BLAST_CANVAS;
  const ly = chargeLayers();
  const was = SHELL_FX.blast;
  SHELL_FX.blast = r;
  try {
    wideBlast(ly, screenOf(ax, ay), [0, 0, 0], k, t, 61);
  } finally {
    SHELL_FX.blast = was;
  }
  return { floor: { px: layFloor(w, h, ly), ax, ay }, air: { px: layAir(w, h, ly), ax, ay } };
}
const blastKept = new Map<string, Layered<Sprite[]>>();
/** A blast's radius as it is painted: to the half tile (each one painted is kept; a blast costs some 60 thousandths of a second a frame to paint), no more than as approved. */
const radiusOf = (r: number, most: number): number => Math.max(0.5, Math.min(most, Math.round(r * 2) / 2));
/** THE WIDE BLAST, frame by frame from its landing (SHELL_FX.long frames, then gone): `floor` its scorch, `air` the rest. At where it lands. */
export function golemShellBlastFx(r: number = SHELL_FX.blast): Layered<Sprite[]> {
  const rr = radiusOf(r, SHELL_FX.blast);
  const key = `shell${rr}`;
  let s = blastKept.get(key);
  if (!s) {
    const one = new Map<number, Layered<Piece>>();
    const at = (k: number): Layered<Piece> => {
      let p = one.get(k);
      if (!p) one.set(k, (p = shellBlastPiece(k, rr)));
      return p;
    };
    s = { floor: lazyFrames(SHELL_FX.long, (k) => spriteOf(at(k).floor)), air: lazyFrames(SHELL_FX.long, (k) => spriteOf(at(k).air)) };
    blastKept.set(key, s);
  }
  return s;
}

// ---- THE BEAM ------------------------------------------------------------------------------------------------------------

/** How many frames the beam is drawn, from its shot (GCHARGE.fire) to gone (GCHARGE_BEAM.gone). */
export const BEAM_FRAMES = GCHARGE_BEAM.gone - GCHARGE.fire;
/** Its end's height (game pixels) as the film drew it: a body's middle. */
export const BEAM_END_UP = 11;
const BEAM_PAD = 56;
/** Where the coil's ball is at beam frame `k`, and where the beam ends, for a Golem drawn in `view` (flipped if `flip`). */
function beamLine(view: GameView, flip: boolean, dx: number, dy: number, up: number, k: number): [V3, V3] {
  const m = golemPoints('tesla', GCHARGE.fire + k, view).muzzle;
  return [flip ? mirror(m) : m, fromTiles(dx, dy, up * FX_GRAIN)];
}
/** THE BEAM, `k` frames after it fires, to (dx, dy) tiles from the Golem's floor point at `up` game pixels: anchored at the Golem's floor point that frame. */
export function beamPiece(view: GameView, flip: boolean, dx: number, dy: number, k: number, up = BEAM_END_UP): Piece {
  const f = GCHARGE.fire + k;
  const w = beamWidth(f);
  if (k < 0 || w <= 0) return EMPTY();
  const [a, b] = beamLine(view, flip, dx, dy, up, k);
  return along([a, b], BEAM_PAD, goesLeft(a, b, flip), chargeLayers, (ly, S, [ma, mb]) => {
    const reach = beamReach(f);
    const m = S(ma);
    const e = S([ma[0] + (mb[0] - ma[0]) * reach, ma[1] + (mb[1] - ma[1]) * reach, ma[2] + (mb[2] - ma[2]) * reach]);
    beamFx(ly.l, m[0], m[1], e[0], e[1], Math.max(1.5, BEAM_FX.drawn * T * w), f, f > GCHARGE_BEAM.held);
  }, layCharge);
}
/**
 * THE BEAM, frame by frame from the shot (BEAM_FRAMES of them), to (dx, dy) tiles from the Golem's floor point (the event's
 * x1 - x0, y1 - y0; up to 8 tiles), its end `up` game pixels above the floor. Lay frame k at the Golem's floor point as it
 * is drawn that frame (it skids back as the beam pours, and the beam with it).
 */
export function golemBeamFx(view: GameView, flip: boolean, dx: number, dy: number, up = BEAM_END_UP): Sprite[] {
  return lazyFrames(BEAM_FRAMES, (k) => spriteOf(beamPiece(view, flip, dx, dy, k, up)));
}
/** How far back the Golem has skidded `k` frames after its shot (tiles; the game's own, game/game.ts, is the same): for laying the beam where it is if the game keeps only the shot's point. */
export function golemSkid(gun: ShotGun, k: number): number {
  return chargeSkid(gun === 'tesla' ? 'beam' : 'shell', GCHARGE.fire + k);
}

// ---- HER CONTRAPTION'S BOMB ----------------------------------------------------------------------------------------------

export const BOMB_CANVAS = { w: 212, h: 176, ax: 106, ay: 118 } as const;
/** HER LITTLE BOMB GOING OFF, `k` frames on, `r` tiles round (BOMB_FX.blast as approved). */
export function bombBlastPiece(k: number, r: number = BOMB_FX.blast, t = k / 30): Layered<Piece> {
  const { w, h, ax, ay } = BOMB_CANVAS;
  const ly = shotLayers();
  const was = BOMB_FX.blast;
  BOMB_FX.blast = r;
  try {
    bombBlast(ly, screenOf(ax, ay), [0, 0, 0], k, t, 61);
  } finally {
    BOMB_FX.blast = was;
  }
  return { floor: { px: layShotFloor(w, h, ly), ax, ay }, air: { px: layShotAir(w, h, ly), ax, ay } };
}
/** HER LITTLE BOMB GOING OFF, frame by frame (BOMB_FX.long frames, then gone): `floor` its scorch, `air` the rest. Where it goes off. */
export function contraptionBombBlastFx(r: number = BOMB_FX.blast): Layered<Sprite[]> {
  const rr = radiusOf(r, BOMB_FX.blast);
  const key = `bomb${rr}`;
  let s = blastKept.get(key);
  if (!s) {
    const one = new Map<number, Layered<Piece>>();
    const at = (k: number): Layered<Piece> => {
      let p = one.get(k);
      if (!p) one.set(k, (p = bombBlastPiece(k, rr)));
      return p;
    };
    s = { floor: lazyFrames(BOMB_FX.long, (k) => spriteOf(at(k).floor)), air: lazyFrames(BOMB_FX.long, (k) => spriteOf(at(k).air)) };
    blastKept.set(key, s);
  }
  return s;
}

// ---- HER CONTRAPTION'S ENERGY BOLT ---------------------------------------------------------------------------------------

/** What the bolt strikes, as the film aimed it: a chest (game pixels up). */
export const BOLT_HIT_UP = 12;
const BOLT_PAD = 64;
/** The energy Contraption's ball as it fires and the way it points, drawn in `view` (flipped if `flip`); and what it hits. */
function boltLine(view: GameView, flip: boolean, dx: number, dy: number, up: number): { ball: V3; way: V3; hit: V3 } {
  const turn = SHOT_CON_TURN[view];
  const b = turnBy(CONTRAPTION_BALL.p, turn);
  const w = turnBy(CONTRAPTION_BALL.way, turn);
  return { ball: flip ? mirror(b) : b, way: flip ? mirror(w) : w, hit: fromTiles(dx, dy, up * FX_GRAIN) };
}
const boltAt = (S: (p: V3) => [number, number], ball: V3, way: V3, hit: V3): ShotAt => ({ S, mouth: ball, way, fuse: null, coil: null, fired: ball, aim: hit });
/** How many frames the bolt's shot lasts, from its flash to the last of its crackle and its ball's smoke; and its flight (frames) to what it hits. */
export function boltFrames(view: GameView, flip: boolean, dx: number, dy: number, up = BOLT_HIT_UP): { long: number; n: number } {
  const L = boltLine(view, flip, dx, dy, up);
  const at = boltAt(screenOf(0, 0), L.ball, L.way, L.hit);
  return { long: boltFxLong(at) + 1, n: boltFlight(at) };
}
/** THE ENERGY SHOT `k` frames after it fires, at what is (dx, dy) tiles from the Contraption's floor point: anchored at that floor point. */
export function boltPiece(view: GameView, flip: boolean, dx: number, dy: number, k: number, up = BOLT_HIT_UP): Piece {
  const { long } = boltFrames(view, flip, dx, dy, up);
  if (k < 0 || k >= long) return EMPTY();
  const L = boltLine(view, flip, dx, dy, up);
  const left = goesLeft(L.ball, L.hit, flip);
  const way = left ? mirror(L.way) : L.way;
  return along([L.ball, L.hit], BOLT_PAD, left, shotLayers, (ly, S, [ball, hit]) => {
    boltFx(ly, boltAt(S, ball, way, hit), CBOLT.fire + k, k / 30, 0);
  }, (w, h, ly) => {
    const px = layShotFloor(w, h, ly);
    const air = layShotAir(w, h, ly);
    for (let i = 0; i < air.d.length; i += 4) if (air.d[i + 3]) for (let c = 0; c < 4; c++) px.d[i + c] = air.d[i + c];
    return px;
  });
}
/**
 * THE ENERGY CONTRAPTION'S SHOT, frame by frame from its firing: its ball's flash, the bolt (BOLT_FX.speed) reaching what
 * it hits at frame `n`, the hit crackling BOLT_FX.crackle frames, its ball spitting and smoking. What it hits (dx, dy)
 * tiles from the Contraption's floor point, `up` game pixels up. Lay frame k at the Contraption's floor point.
 */
export function contraptionBoltFx(view: GameView, flip: boolean, dx: number, dy: number, up = BOLT_HIT_UP): { frames: Sprite[]; n: number } {
  const { long, n } = boltFrames(view, flip, dx, dy, up);
  return { frames: lazyFrames(long, (k) => spriteOf(boltPiece(view, flip, dx, dy, k, up))), n };
}

/**
 * PAINT AHEAD: paint the frames of `lists` not yet painted, first to last, for at most `ms` thousandths of a second; true
 * when all are. (The blasts are slow to paint: a shell's 40 frames some 2.5 seconds, a bomb's 36 some 1.2. Call it each
 * frame while the Golem charges, or when her pick is made, so that none is painted as it is shown.)
 */
export function paintAhead(lists: readonly (readonly Sprite[])[], ms: number): boolean {
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

