// THE TOWN'S WAYS: THE STAIRS DOWN TO FLOOR 1, THE SHAFT'S HEAD WITH ITS CAGE, THE GATE BARRED (the art chat's, 22 Oct
// 2026). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE; it is behind TOWN_WAYS, off.
//
// His words to the main chat, 22 Oct 2026, 11:21 (Pacific): “Let’s put the empty elevator cage in the bottom corner of
// the prison town so you come up to town from beating the fleshmancer.  Then you head out the big gate at the top of
// the town to enter the quarry and head back down the mountain to the town.  So the gate needs to be blocked or barred
// up until that point.  You’ll start a new game in town and the wordsmith will give you a quest to find the key to turn
// on the altar or whatever it is I can’t remember.  I guess have some stairs in town also and you go down the stairs to
// enter level 1.” To the art chat, 12:04, “Go”; shown floor 4's cave, by 12:51, “Yes, on to the town (Recommended)”.
//
// THE SHAPES THE RULES GIVE THEM (the main chat's game/ways.ts on its branch exits, behind EXITS): the stairs a
// stairwell open in the hall's floor (TOWN_STAIR, its corner and the way its steps go down); the shaft's head on the tile
// TOWN_SHAFT in the hall's near corner, its three tiles by three its own, the cage 'arriving' with him in it from floor 5
// for TOWN_ARRIVE, then 'still'; the gate in the back wall barred while the Fleshmancer lives, the rules sending
// { t: 'gateUnbarred' } as he comes up in the cage the first time.
//
// WHAT IS PAINTED HERE:
//   THE STAIRS DOWN (`townStairs`): a broad flight going down under the hall's floor into the dark, wider and longer
//     than the floors' stairwells, a low parapet of the hall's dressed stone round three sides of it, open at the top
//     of its steps: the way down to the Crypt, plainly the way.
//   THE SHAFT'S HEAD (`townShaft`): floor 5's miners' shaft come up through the hall's floor (art/shaft.ts): its hole and
//     its collar of squared timber, its four posts going up into the dark, its guides, and the cage standing in it at
//     the floor, its gate open toward the hall (-x); the onsetter's candle on its post. THE CAGE COMES UP (`arrives`):
//     out of the dark of the hole it rises, hauled up its guides, slowing; its feet come level with the floor and it
//     strikes the catches (a jolt), lifts a hand's breadth and settles back on them (a second); dust puffs out round the
//     collar; its gate rattles back, open. The hero rides in it, drawn between its two layers.
//   THE GATE BARRED (`gateBars`): heavy chains wound across the gate's portcullis in a cross, through rings on its two
//     pillars, and at their crossing a great padlock bearing the cult's seal, burning the enemy's pink: the Fleshmancer's
//     own lock on the way out. THE GATE UNBARRED (`unbarFilm`): the seal flares and dies, the lock bursts and drops, the
//     chains go slack and sag, their upper rings snap and they slither down into heaps at the pillars' feet, the lock
//     among them; dust. What is left (`gateLeft`) lies at the pillars' feet, out of the gate's way.
//
// THE RULES THEY KEEP (his art rulebook): crisp pixels, two to a game pixel, light from the upper left; nothing the
// player's glows but cyan, the cult's seal pink (the enemy's); an honest flame's orange for the candle.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { makeStairwellOf } from './crypt_ways';
import type { StairMeasures } from './crypt_ways';
import { DUST, Scene, XYZ, cloud, paintClouds, toneAt } from './floor4';
import type { Cloud, V3 } from './floor4';
import { BEYOND, DEEP, fastBlit, flame } from './floorkit';
import { ARCH, ARCH_WIDE, PILLAR, curveOf, inWay } from './gates';
import { VAULT } from './ground';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { IRON } from './mkit';
import { EMBER } from './props';
import { CABLE, DARK_FROM, DARK_GONE, DIM_IRON, IRONS, SHAFT, SHAFT_H, SHAFT_W, SMALL_IRON, intoTheDark, paintShaft } from './shaft';
import { TIMBER } from './crypt';

/** THE SWITCH: off, nothing of the game uses any of this. */
export const TOWN_WAYS = { on: false };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
const ease = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

// =================================================================================================
// THE STAIRS DOWN

/** The town's stairs: three tiles long, two across; their parapet a fifth of a tile wide and ten picture pixels high (the floors': 2.4 by 1.25, a kerb of 6). */
export const TOWN_STAIRS: StairMeasures = { long: 3.0, wide: 2.0, kerb: 0.22, kerbH: 10 };
const stairs = new Map<string, Sprite>();
/**
 * THE STAIRS DOWN TO FLOOR 1, in the hall's own stone (VAULT), its steps going down toward +x ('x': to the lower right
 * of the screen) or +y; anchored as the floors' stairwell is, at the corner of its opening up the screen; drawn over the
 * floor, before anything that stands. Its top step at that corner's end.
 */
export function townStairs(way: 'x' | 'y'): Sprite {
  let s = stairs.get(way);
  if (!s) stairs.set(way, (s = makeStairwellOf(VAULT, way, TOWN_STAIRS)));
  return s;
}

// =================================================================================================
// THE SHAFT'S HEAD AND ITS CAGE

/** How the cage is: its floor's height over the hall's floor (below it, coming up); its sway; its gate (0 open, 1 shut). */
interface Pose { z: number; sway: number; gate: number }

/**
 * THE CAGE TURNED A QUARTER, its gate toward -x (the hall), as art/shaft.ts paints it with its gate toward +y: its floor,
 * its iron corners and rails, the bars down its sides, the gate's bars slid back toward its -y end as it opens, its roof,
 * its crosshead and bridle chains, the cable up from its shackle; and its shoes on the guides. Each part into the layer
 * it is in as the eye sees it, before or behind a hero standing in it.
 */
function paintCageTurned(S: { back: Scene; front: Scene }, k: Pose, id0: number): void {
  const h = SHAFT.cage;
  const H = SHAFT.cageH;
  const z0 = k.z;
  // (the cage's own frame turned to the world's: its +y side, the gate's, to -x; and its sway about its cable)
  const T = (x: number, y: number): [number, number] => {
    const c = Math.cos(k.sway);
    const s = Math.sin(k.sway);
    const X = -y;
    const Y = x;
    return [X * c - Y * s, X * s + Y * c];
  };
  const P = (x: number, y: number, z: number): V3 => {
    const [X, Y] = T(x, y);
    return [X, Y, z0 + z];
  };
  const layer = (x: number, y: number): Scene => {
    const [X, Y] = T(x, y);
    return X > 0.5 * h || Y > 0.5 * h ? S.front : S.back;
  };
  // its floor: planks on an iron frame
  S.back.quad([P(-h, -h, 1), P(h, -h, 1), P(h, h, 1), P(-h, h, 1)], (u, v) => (u < 0.06 || u > 0.94 || v < 0.06 || v > 0.94 ? IRONS[2] : Math.abs(((u * 5) % 1) - 0.5) < 0.06 ? TIMBER[0] : TIMBER[2]), id0);
  for (const [x, y] of [[-h, -h], [h, -h], [-h, h], [h, h]] as const) layer(x, y).rod(P(x, y, 0), P(x, y, H), 1.2, 1.2, IRONS, id0 + 1);
  for (const z of [1, H * 0.5, H]) {
    for (const [a, b] of [[[-h, -h], [h, -h]], [[-h, -h], [-h, h]], [[-h, h], [h, h]], [[h, -h], [h, h]]] as const) layer((a[0] + b[0]) / 2, (a[1] + b[1]) / 2).rod(P(a[0], a[1], z), P(b[0], b[1], z), 0.9, 0.9, IRONS, id0 + 2);
  }
  const BARS = 7;
  for (let i = 1; i < BARS; i++) {
    const t = -h + (2 * h * i) / BARS;
    layer(t, -h).rod(P(t, -h, 1), P(t, -h, H), 0.55, 0.55, DIM_IRON, id0 + 3);
    layer(-h, t).rod(P(-h, t, 1), P(-h, t, H), 0.55, 0.55, DIM_IRON, id0 + 3);
    layer(h, t).rod(P(h, t, 1), P(h, t, H), 0.55, 0.55, DIM_IRON, id0 + 4);
    const gx = h - (h - t) * (0.12 + 0.88 * k.gate);
    layer(gx, h).rod(P(gx, h, 2), P(gx, h, H - 2), 0.55, 0.55, SMALL_IRON, id0 + 5);
  }
  const gx0 = h - 2 * h * (0.12 + 0.88 * k.gate);
  for (const z of [3, H - 3]) layer(gx0, h).rod(P(gx0, h, z), P(h, h, z), 0.6, 0.6, SMALL_IRON, id0 + 5);
  S.back.quad([P(-h, -h, H + 0.5), P(h, -h, H + 0.5), P(h, h, H + 0.5), P(-h, h, H + 0.5)], (u, v) => (u > 0.95 || v > 0.95 ? IRONS[3] : Math.abs(((u * 4) % 1) - 0.5) < 0.05 ? IRONS[1] : IRONS[2]), id0 + 6);
  const [ax, ay] = T(1, 0);
  const [bx, by] = T(0, 1);
  S.front.box(P(0, 0, H + 3), [[ax, ay, 0], [bx, by, 0], [0, 0, 1]], [h, 1.6, 1.6], (f, _u, _v, n) => (f === 4 ? IRONS[3] : toneAt(n, IRONS, 0.1)), id0 + 7);
  const shackle = P(0, 0, H + 13);
  for (const x of [-h + 2, h - 2]) {
    const a = P(x, 0, H + 4.6);
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      S.front.egg(add(mul(a, 1 - t), mul(shackle, t)), XYZ, [0.9, 0.9, 1.2], (n) => toneAt(n, IRONS, 0.2), id0 + 8);
    }
  }
  S.front.ball(shackle, 1.6, SMALL_IRON, id0 + 8);
  // its shoes on the guides (the shaft's guides run along its x sides: the cage turned, its shoes are on its y sides)
  for (const y of [-h - 1.8, h + 1.8]) for (const z of [8, H - 8]) (y > 0 ? S.front : S.back).box([0, y, z0 + z], XYZ, [3, 1.4, 3], (f, _u, _v, n) => (f === 4 ? SMALL_IRON[3] : toneAt(n, IRONS, 0.1)), id0 + 9);
  // the cable, straight up into the dark
  S.front.rod(shackle, add(shackle, [0, 0, 150]), 1.15, 1.15, CABLE, id0 + 10);
}

/** The shaft's anchor in its picture (its middle, on the floor): art/shaft.ts's own. */
const AX = SHAFT_W / 2;
const AY = 146;
/** Where the onsetter's candle burns (art/shaft.ts's own place for it). */
const CANDLE_TIP: V3 = [-SHAFT.post + 4.6, SHAFT.post + 5.2, 37];
const candleAt = (shake: number): [number, number] => [Math.round(AX + (CANDLE_TIP[0] - CANDLE_TIP[1]) * 0.8 + shake * 0.4), Math.round(AY + (CANDLE_TIP[0] + CANDLE_TIP[1]) * 0.4 - CANDLE_TIP[2])];
const candleLight = (s: Sprite): Sprite => {
  const [cx, cy] = candleAt(0);
  s.lights = [{ x: cx / GRAIN, y: (cy - 4) / GRAIN, r: 14, color: EMBER[2], a: 0.42 }];
  return s;
};

/**
 * One frame of the shaft's head: the shaft come up through the hall's floor (its collar, posts, guides, beams and candle,
 * art/shaft.ts's own, the guides along x so that the cage turned runs on them), the cage as it is, and whatever else
 * (dust); the dark taking what is high up, as the walls fade. In two layers, for a hero to stand between.
 */
function headFrame(k: Pose | null, shake: number, extra: ((S: { back: Scene; front: Scene }) => void) | null, flick: number): { back: Px; front: Px } {
  const S = { back: new Scene(new Px(SHAFT_W, SHAFT_H), AX, AY), front: new Scene(new Px(SHAFT_W, SHAFT_H), AX, AY) };
  paintShaft(S, shake);
  if (k) paintCageTurned(S, k, 100);
  if (extra) extra(S);
  for (const sc of [S.back, S.front]) {
    sc.seams();
    intoTheDark(sc);
  }
  const [cx, cy] = candleAt(shake);
  flame(S.back.p, cx, cy, 6 + (flick % 2), 1.4, [0, 1, 0, -1][flick % 4]);
  return { back: S.back.p, front: S.front.p };
}
const whole = (f: { back: Px; front: Px }): Px => {
  const p = compose(f.back, [], null);
  fastBlit(p, f.front, 0, 0);
  return p;
};

/** The shaft's head as the game stands it: its two layers and the whole. */
export interface HeadArt {
  back: Sprite;
  front: Sprite;
  whole: Sprite;
}
/** The cage's coming up, frame by frame: its two layers and the whole; how far its floor is over the hall's (below it: less than 0); its jolts; 30 a second. */
export interface ArriveFilm {
  fps: number;
  jolts: number[];
  back: Sprite[];
  front: Sprite[];
  whole: Sprite[];
  lift: number[];
}

/** THE CAGE COMES UP: its frames. */
export const ARRIVE = { frames: 101, catches: 56, settle: 62, gateFrom: 70, gateTo: 88 } as const;
/** How deep the cage starts, under the hall's floor (out of sight in the hole's dark). */
const DEEP_START = SHAFT.cageH + 46;

function cageArrives(): ArriveFilm {
  const N = ARRIVE.frames;
  const zAt = (f: number): number => {
    if (f < ARRIVE.catches) {
      // (hauled up, slowing as it nears the top: the winding easing off)
      const t = f / ARRIVE.catches;
      return -DEEP_START * (1 - t) ** 1.6;
    }
    // (it strikes the catches, lifts a hand's breadth on its cable, and settles back on them)
    const u = f - ARRIVE.catches;
    if (u < ARRIVE.settle - ARRIVE.catches) return 3.2 * Math.sin((Math.PI * u) / (ARRIVE.settle - ARRIVE.catches));
    return 0;
  };
  const poseAt = (f: number): Pose => ({
    z: zAt(f),
    sway: f < ARRIVE.catches ? 0.04 * Math.sin(f * 0.37) : 0.05 * Math.exp(-(f - ARRIVE.catches) / 8) * Math.sin((f - ARRIVE.catches) * 0.9),
    gate: 1 - ease((f - ARRIVE.gateFrom) / (ARRIVE.gateTo - ARRIVE.gateFrom)) + (f > ARRIVE.gateFrom && f < ARRIVE.gateTo ? 0.03 * Math.sin(f * 2.6) : 0),
  });
  const shakeAt = (f: number): number => (f >= ARRIVE.catches && f < ARRIVE.catches + 10 ? 1.6 * Math.exp(-(f - ARRIVE.catches) / 3) * Math.cos((f - ARRIVE.catches) * 1.8) : f >= ARRIVE.settle && f < ARRIVE.settle + 6 ? 0.8 * Math.exp(-(f - ARRIVE.settle) / 2) * Math.cos((f - ARRIVE.settle) * 2) : 0);
  // the dust puffed out round the collar as it strikes the catches
  const h = SHAFT.cage;
  const clouds: Cloud[] = [
    cloud(ARRIVE.catches, [h + 6, 2, 3], [2.6, 1, 0.5], 11, 1, N - ARRIVE.catches - 4, 12, 20),
    cloud(ARRIVE.catches, [2, h + 6, 3], [1, 2.6, 0.5], 11, 2, N - ARRIVE.catches - 6, 12, 20),
    cloud(ARRIVE.catches + 1, [-h - 4, h - 2, 3], [-2.2, 1.6, 0.5], 9, 3, N - ARRIVE.catches - 10, 10, 18),
    cloud(ARRIVE.settle, [h + 4, h + 4, 2], [1.4, 1.4, 0.3], 7, 4, N - ARRIVE.settle - 4, 8, 14),
  ];
  // grit knocked off its roof as it comes up out of the hole, falling back into the dark
  const grit: { f0: number; p: V3; r: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const f0 = 30 + Math.floor(hash(i, 1, 920) * 22);
    grit.push({ f0, p: [(hash(i, 2, 920) - 0.5) * 2 * h, (hash(i, 3, 920) - 0.5) * 2 * h, 0], r: 1.1 + hash(i, 4, 920) * 1.1 });
  }
  const back: Sprite[] = [];
  const front: Sprite[] = [];
  const frames: Sprite[] = [];
  const lift: number[] = [];
  for (let f = 0; f < N; f++) {
    const k = poseAt(f);
    const fr = headFrame(k, shakeAt(f), (S) => {
      // (each bit of grit off the roof's edge as it rose past the floor, tumbling down the outside of the cage into the hole)
      for (const g of grit) {
        const kk = f - g.f0;
        if (kk < 0) continue;
        const top = zAt(g.f0) + SHAFT.cageH;
        const z = top + 2 * kk - 0.5 * kk * kk;
        if (z < 0.5) continue;
        const sc = g.p[0] > 0.5 * h || g.p[1] > 0.5 * h ? S.front : S.back;
        sc.egg([g.p[0] * 1.15, g.p[1] * 1.15, z], XYZ, [g.r * 1.2, g.r, g.r * 0.8], (n) => toneAt(n, DUST, 0.1), 300);
      }
      paintClouds(S.front, clouds, f);
    }, f % 4);
    back.push(fr.back.sprite(AX, AY, GRAIN));
    front.push(fr.front.sprite(AX, AY, GRAIN));
    frames.push(candleLight(whole(fr).sprite(AX, AY, GRAIN)));
    lift.push(k.z);
  }
  return { fps: 30, jolts: [ARRIVE.catches, ARRIVE.settle], back, front, whole: frames, lift };
}

let arriveFilm: ArriveFilm | null = null;
let headStill: HeadArt | null = null;
/** THE CAGE COMES UP into the shaft's head, frame by frame (the hero in it is drawn between its two layers, `lift` up: what of him is under the hall's floor is not drawn, `riderUnder`). */
export function townArrives(): ArriveFilm {
  return arriveFilm ?? (arriveFilm = cageArrives());
}
/** THE SHAFT'S HEAD AS IT STANDS: the cage in it at the floor, its gate open toward the hall (the coming up's last frame, to the pixel). */
export function townShaft(): HeadArt {
  if (headStill) return headStill;
  const fr = headFrame({ z: 0, sway: 0, gate: 0 }, 0, null, 0);
  return (headStill = { back: fr.back.sprite(AX, AY, GRAIN), front: fr.front.sprite(AX, AY, GRAIN), whole: candleLight(whole(fr).sprite(AX, AY, GRAIN)) });
}
/** THE HERO COMING UP IN IT: whether a pixel of him `h` up his height (0 his feet, 1 the top of his head) is still under the hall's floor, the cage's floor `lift` over it (townArrives().lift): not drawn. (His height as the dark takes him on floor 5: art/shaft.ts riderDark.) */
export function riderUnder(lift: number, h: number): boolean {
  return lift + Math.max(0, Math.min(1, h)) * DARK_FROM < 0;
}

// =================================================================================================
// THE GATE BARRED, AND UNBARRED

/**
 * A PICTURE IN THE GATE'S PLANE, as art/gates.ts paints the arch and the portcullis: (u, v) picture pixels along the
 * plane from the arch's start (the outer edge of its first pillar) and up from the floor; set along +x (`alongX`, a
 * face turned to screen-left) or along +y. Its anchor where u = 0 on the floor: stand it where the arch's strips begin
 * (render.ts standDoors: at(-wide)), at the portcullis's depth.
 */
class Plane {
  readonly p: Px;
  readonly ax: number;
  readonly ay = 112;
  constructor(readonly alongX: boolean) {
    this.p = new Px(ARCH_WIDE + 8, 112 + ARCH_WIDE / 2 + 12);
    this.ax = alongX ? 4 : ARCH_WIDE + 4;
  }
  xy(u: number, v: number): [number, number] {
    const uu = Math.round(u);
    return [this.alongX ? this.ax + uu : this.ax - (uu + 1), this.ay + Math.floor((uu - 1) / 2) - Math.round(v)];
  }
  set(u: number, v: number, c: string): void {
    const [x, y] = this.xy(u, v);
    // (in a face turned to screen-right, a shade darker: Places 4)
    this.p.set(x, y, this.alongX || SHINE.has(c) ? c : mix(c, '#06051a', 0.32));
  }
  sprite(lights: Light[] = []): Sprite {
    const s = this.p.sprite(this.ax, this.ay, GRAIN);
    if (lights.length) s.lights = lights;
    return s;
  }
}
/** The cult's seal, the enemy's pink (his Colour 3): its dark when out, kindling, burning, and flaring white-hot. */
const SEAL: readonly string[] = ['#3a0c2a', '#7a1058', '#c0206a', '#ff4f8a', '#ffc4dc'];
const SHINE = new Set<string>([...SEAL.slice(1), ...EMBER]);
const CHAIN: Ramp = [IRON[0], IRON[1], IRON[2], IRON[3], '#b4b0e4'];
const LINK = 3;

/** A chain's links: a run of points, each LINK apart, from its first to its last. */
type Chain = { u: number; v: number; pu: number; pv: number }[];
/** Paint a chain: each link in turn face on (an oval, its hole dark) or edge on (a bar), lit from above. */
function paintChain(P: Plane, ch: Chain): void {
  for (let i = 0; i + 1 < ch.length; i++) {
    const a = ch[i];
    const b = ch[i + 1];
    const du = b.u - a.u;
    const dv = b.v - a.v;
    const L = Math.hypot(du, dv) || 1;
    const nu = -dv / L;
    const nv = du / L;
    for (let s = 0; s <= 1; s += 0.2) {
      const u = a.u + du * s;
      const v = a.v + dv * s;
      if (i % 2 === 0) {
        // face on: a ring, its upper rim lit
        for (const o of [-1, 1]) P.set(u + nu * o, v + nv * o, o * nv > 0 || (nv === 0 && o > 0) ? CHAIN[3] : CHAIN[1]);
        if (s > 0.3 && s < 0.7) P.set(u, v, CHAIN[0]);
      } else P.set(u, v, s > 0.4 && s < 0.6 ? CHAIN[4] : CHAIN[2]);
    }
  }
}
/** A straight chain from (u0, v0) to (u1, v1). */
function chainLine(u0: number, v0: number, u1: number, v1: number): Chain {
  const n = Math.max(2, Math.round(Math.hypot(u1 - u0, v1 - v0) / LINK));
  const out: Chain = [];
  for (let i = 0; i <= n; i++) {
    const u = u0 + ((u1 - u0) * i) / n;
    const v = v0 + ((v1 - v0) * i) / n;
    out.push({ u, v, pu: u, pv: v });
  }
  return out;
}

/** Where the gate's chains run: from a ring high on each pillar, across the portcullis, through the lock where they cross, to a ring low on the other pillar. */
const RINGS = { hiL: [7, 64], hiR: [ARCH_WIDE - 7, 64], loL: [7, 6], loR: [ARCH_WIDE - 7, 6] } as const;
const LOCK = { u: ARCH_WIDE / 2, v: 33 };

/** An iron ring set in a pillar's face, a chain through it. */
function ring(P: Plane, u: number, v: number): void {
  for (let a = 0; a < Math.PI * 2; a += 0.3) P.set(u + Math.cos(a) * 2.6, v + Math.sin(a) * 2.6, Math.sin(a) > 0.3 ? CHAIN[3] : Math.sin(a) < -0.4 ? CHAIN[0] : CHAIN[2]);
  P.set(u - 3.4, v, CHAIN[0]);
}
/** The great padlock at the chains' crossing, the cult's seal on its face (burning `burn`: 0 out, 1 burning, 2 flaring); `open` its shackle sprung, `drop` how far it has fallen, `turn` how far it has tipped. */
function padlock(P: Plane, burn: number, open: number, du: number, dv: number, turn: number): void {
  const cu = LOCK.u + du;
  const cv = LOCK.v + dv;
  const rot = (x: number, y: number): [number, number] => [cu + x * Math.cos(turn) - y * Math.sin(turn), cv + x * Math.sin(turn) + y * Math.cos(turn)];
  // its shackle: a loop over its body, sprung up on one side
  for (let a = 0; a <= Math.PI; a += 0.12) {
    const [u, v] = rot(Math.cos(a) * 5, 9 + Math.sin(a) * 6 + (Math.cos(a) > 0 ? open * 5 : 0));
    P.set(u, v, a < 1.6 ? CHAIN[3] : CHAIN[2]);
    const [u2, v2] = rot(Math.cos(a) * 4, 9 + Math.sin(a) * 5 + (Math.cos(a) > 0 ? open * 5 : 0));
    P.set(u2, v2, CHAIN[1]);
  }
  // its body: a heavy iron block, rounded below, its rim lit
  for (let y = -9; y <= 9; y++) {
    for (let x = -8; x <= 8; x++) {
      if (y < -4 && (x * x) / 64 + ((y + 4) * (y + 4)) / 25 > 1) continue;
      const [u, v] = rot(x, y);
      const rim = y > 7 || x < -6;
      P.set(u, v, rim ? CHAIN[3] : x > 6 || y < -7 ? CHAIN[0] : (x + y) % 5 === 0 ? CHAIN[1] : CHAIN[2]);
    }
  }
  // the cult's seal on its face: a ring with a point in it, burning
  const col = burn <= 0 ? SEAL[0] : burn < 1 ? SEAL[1] : burn < 1.6 ? SEAL[3] : SEAL[4];
  const rim = burn <= 0 ? SEAL[0] : burn < 1 ? SEAL[1] : SEAL[2];
  for (let a = 0; a < Math.PI * 2; a += 0.25) {
    const [u, v] = rot(Math.cos(a) * 4, Math.sin(a) * 4);
    P.set(u, v, col);
    const [u2, v2] = rot(Math.cos(a) * 5, Math.sin(a) * 5);
    if (burn > 0) P.set(u2, v2, rim);
  }
  const [mu, mv] = rot(0, 0);
  P.set(mu, mv, col);
  P.set(mu + 1, mv, col);
  // (its keyhole, below the seal)
  const [ku, kv] = rot(0, -6);
  P.set(ku, kv, CHAIN[0]);
  P.set(ku, kv - 1, CHAIN[0]);
}
/** The seal's light: the enemy's pink, as strong as it burns. */
const sealLight = (P: Plane, burn: number): Light[] => {
  if (burn <= 0) return [];
  const [x, y] = P.xy(LOCK.u, LOCK.v);
  return [{ x: x / GRAIN, y: y / GRAIN, r: 10 + 6 * Math.min(1, burn - 1), color: SEAL[3], a: burn < 1 ? 0.18 : burn < 1.6 ? 0.34 : 0.55 }];
};

const bars = new Map<boolean, Sprite>();
/** THE GATE BARRED: the chains across the portcullis through their rings and the lock where they cross, the seal burning; in a plane along +x (`alongX`) or +y. */
export function gateBars(alongX: boolean): Sprite {
  let s = bars.get(alongX);
  if (s) return s;
  const P = new Plane(alongX);
  for (const [u, v] of Object.values(RINGS)) ring(P, u, v);
  paintChain(P, chainLine(RINGS.hiL[0], RINGS.hiL[1], LOCK.u, LOCK.v));
  paintChain(P, chainLine(RINGS.hiR[0], RINGS.hiR[1], LOCK.u, LOCK.v));
  paintChain(P, chainLine(LOCK.u, LOCK.v, RINGS.loR[0], RINGS.loR[1]));
  paintChain(P, chainLine(LOCK.u, LOCK.v, RINGS.loL[0], RINGS.loL[1]));
  padlock(P, 1, 0, 0, 0, 0);
  bars.set(alongX, (s = P.sprite(sealLight(P, 1))));
  return s;
}

/** THE GATE UNBARRED: its frames (30 a second), its jolts (the lock bursting; the upper rings snapping; the lock striking the floor). */
export const UNBAR = { frames: 66, burst: 10, snap: 26, lockDown: 21 } as const;
/** The film of the gate unbarred, as the game stands one: whole pictures in the gate's plane, frame by frame; and what is left. */
export interface UnbarFilm {
  fps: number;
  jolts: number[];
  frames: Sprite[];
  left: Sprite;
}

function unbar(alongX: boolean): UnbarFilm {
  const N = UNBAR.frames;
  const GRAV = 0.42;
  // the two chains, each from its upper ring through the lock to its lower ring on the other pillar
  const chains: Chain[] = [
    [...chainLine(RINGS.hiL[0], RINGS.hiL[1], LOCK.u, LOCK.v), ...chainLine(LOCK.u, LOCK.v, RINGS.loR[0], RINGS.loR[1]).slice(1)],
    [...chainLine(RINGS.hiR[0], RINGS.hiR[1], LOCK.u, LOCK.v), ...chainLine(LOCK.u, LOCK.v, RINGS.loL[0], RINGS.loL[1]).slice(1)],
  ];
  const rest = chains.map((ch) => ch.map((_, i) => (i === 0 ? 0 : Math.hypot(ch[i].u - ch[i - 1].u, ch[i].v - ch[i - 1].v))));
  const lockAt = chains.map((ch) => {
    let best = 0;
    ch.forEach((q, i) => {
      if (Math.hypot(q.u - LOCK.u, q.v - LOCK.v) < Math.hypot(ch[best].u - LOCK.u, ch[best].v - LOCK.v)) best = i;
    });
    return best;
  });
  /** One step of a chain: each link falls and swings, held at its pinned ends, kept its length from the next, never through the floor; on the floor it drags. */
  const step = (ch: Chain, len: number[], pins: Set<number>): void => {
    for (let i = 0; i < ch.length; i++) {
      if (pins.has(i)) continue;
      const q = ch[i];
      const onFloor = q.v <= 1.2;
      const vu = (q.u - q.pu) * (onFloor ? 0.6 : 0.985);
      const vv = (q.v - q.pv) * 0.985;
      q.pu = q.u;
      q.pv = q.v;
      q.u += vu;
      q.v += vv - GRAV;
    }
    for (let it = 0; it < 8; it++) {
      for (let i = 1; i < ch.length; i++) {
        const a = ch[i - 1];
        const b = ch[i];
        const du = b.u - a.u;
        const dv = b.v - a.v;
        const d = Math.hypot(du, dv) || 1e-6;
        const k = (d - len[i]) / d;
        const wa = pins.has(i - 1) ? 0 : pins.has(i) ? 1 : 0.5;
        const wb = pins.has(i) ? 0 : pins.has(i - 1) ? 1 : 0.5;
        a.u += du * k * wa;
        a.v += dv * k * wa;
        b.u -= du * k * wb;
        b.v -= dv * k * wb;
      }
      for (const q of ch) {
        if (q.v < 1) q.v = 1;
        // (kept between the pillars' outer edges: the chains fall at the pillars' feet)
        q.u = Math.max(1, Math.min(ARCH_WIDE - 1, q.u));
      }
    }
  };
  // the lock: held by the chains; bursting, it falls and tips
  let lockV = 0;
  let lockVel = 0;
  let lockTurn = 0;
  let lockU = 0;
  // the dust as the chains and the lock come down
  const puffs: { f0: number; u: number; r: number }[] = [
    { f0: UNBAR.lockDown, u: LOCK.u, r: 7 },
    { f0: UNBAR.snap + 9, u: 14, r: 9 },
    { f0: UNBAR.snap + 10, u: ARCH_WIDE - 14, r: 9 },
    { f0: UNBAR.snap + 16, u: 22, r: 6 },
    { f0: UNBAR.snap + 17, u: ARCH_WIDE - 22, r: 6 },
  ];
  const frames: Sprite[] = [];
  let leftSprite: Sprite | null = null;
  for (let f = 0; f < N; f++) {
    // (the chains: taut through the lock until it bursts; slack, hanging from both rings; their upper rings snapped, falling to the pillars' feet)
    if (f > UNBAR.burst) {
      chains.forEach((ch, c) => {
        const pins = new Set<number>([ch.length - 1]);
        if (f < UNBAR.snap) pins.add(0);
        // (the first frames after it bursts, a kick out from the lock as the tension goes)
        if (f === UNBAR.burst + 1) {
          const i = lockAt[c];
          for (let j = Math.max(1, i - 4); j < Math.min(ch.length - 1, i + 5); j++) ch[j].pv = ch[j].v - 1.2;
        }
        step(ch, rest[c], pins);
      });
    }
    // (the lock: after it bursts it drops, tips over and comes to rest at the foot of the gate)
    if (f > UNBAR.burst) {
      lockVel -= GRAV * 1.6;
      lockV += lockVel;
      lockTurn = Math.min(1.3, lockTurn + 0.13);
      lockU += 0.35;
      const floor = -LOCK.v + 9;
      if (lockV < floor) {
        lockV = floor;
        lockVel = Math.abs(lockVel) > 2 ? -lockVel * 0.3 : 0;
      }
    }
    const P = new Plane(alongX);
    for (const [u, v] of Object.values(RINGS)) {
      // (an upper ring snapped from its pillar: gone, a broken stub left)
      if (f >= UNBAR.snap && v > 30) {
        P.set(u - 3, v, CHAIN[0]);
        P.set(u - 2, v + 1, CHAIN[2]);
        continue;
      }
      ring(P, u, v);
    }
    for (const ch of chains) paintChain(P, ch);
    const burn = f < UNBAR.burst - 4 ? 1 + 0.15 * Math.sin(f * 1.7) : f < UNBAR.burst ? 2 : f < UNBAR.burst + 3 ? 0.6 : 0;
    padlock(P, burn, f > UNBAR.burst ? Math.min(1, (f - UNBAR.burst) / 3) : 0, lockU, lockV, lockTurn);
    // (sparks off the lock as it bursts: the enemy's pink going out)
    if (f >= UNBAR.burst && f < UNBAR.burst + 6) {
      for (let j = 0; j < 10; j++) {
        const a = hash(j, 1, 930) * Math.PI * 2;
        const r = (f - UNBAR.burst + 1) * (2 + hash(j, 2, 930) * 2.5);
        P.set(LOCK.u + Math.cos(a) * r, LOCK.v + 9 + Math.sin(a) * r - (f - UNBAR.burst) * 0.6, f - UNBAR.burst < 2 ? SEAL[4] : SEAL[2]);
      }
    }
    // the dust: rolling out low along the gate's foot, thinning
    for (const pf of puffs) {
      const k = f - pf.f0;
      if (k < 0 || k > 26) continue;
      const R = pf.r * (0.5 + Math.min(1, k / 6) * 0.8) * (k > 16 ? 1 - (k - 16) / 10 : 1);
      for (let du = -R * 1.8; du <= R * 1.8; du++) {
        for (let dv = 0; dv <= R; dv++) {
          if ((du / (R * 1.8)) ** 2 + (dv / R) ** 2 > 1) continue;
          if (k > 10 && hash(Math.floor((pf.u + du) / 2), Math.floor(dv / 2), 931 + k) < (k - 10) / 18) continue;
          P.set(pf.u + du, dv + 1, dv > R * 0.55 ? DUST[3] : DUST[2]);
        }
      }
    }
    const s = P.sprite(sealLight(P, burn));
    frames.push(s);
    if (f === N - 1) leftSprite = s;
  }
  return { fps: 30, jolts: [UNBAR.burst, UNBAR.lockDown, UNBAR.snap], frames, left: leftSprite! };
}
const unbars = new Map<boolean, UnbarFilm>();
/** THE GATE UNBARRED, in a plane along +x (`alongX`) or +y: made the first time it is asked for and kept. */
export function unbarFilm(alongX: boolean): UnbarFilm {
  let f = unbars.get(alongX);
  if (!f) unbars.set(alongX, (f = unbar(alongX)));
  return f;
}
/** What is left once the gate is unbarred: the chains in heaps at the pillars' feet, the lock among them (the film's last frame). */
export function gateLeft(alongX: boolean): Sprite {
  return unbarFilm(alongX).left;
}

// (kept for the checks: what of the shaft the dark takes, and the gate's opening)
export const TOWN_WAYS_MEASURES = { darkGone: DARK_GONE, beyond: BEYOND, deep: DEEP, inGate: (u: number, v: number): boolean => inWay(ARCH, curveOf(ARCH), u, v), pillar: PILLAR };
