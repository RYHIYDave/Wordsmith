// ACT 2, THE HUSH (floors 11 to 15): THE KIT OF ITS PIECES (a mock-up; nothing of the game imports it).
//
// The city's own materials at dusk, and the ways its pieces are built: standing on the floor (in depth, by
// floor 4's Scene, lit from the upper left), hung on a house front (the ground's house fronts, art/gateward.ts,
// 150 picture pixels high: no fade at their tops, out in the open), or laid flat on the floor along its lines.
//
// THE RULES THEY KEEP (his art rulebook): crisp pixels, two to a game pixel; light from the upper left; the
// indigo seam where one thing ends before another; a step quieter than the figures and duller than any word;
// pink burning to gold glows only on the enemy (the Silent Order's lanterns, the cult's firepots, the dome's
// shards, the stolen voices in their jars); an honest fire burns orange; nothing cyan.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Scene, faceWorld, inFaceLight, toneAt } from './floor4';
import type { V3 } from './floor4';
import { GRAIN, compose, mix } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// THE CITY'S MATERIALS, AT DUSK (each from its deep shade to its lit top)

/** Oak, old and dark (the houses' timbers, art/gateward.ts GW_OAK, lifted a little for what stands). */
export const OAK: Ramp = ['#22161a', '#382621', '#53392d', '#6e4f3b', '#8a684d'];
/** Pale deal, the market's planks and boxes, weathered grey-brown. */
export const DEAL: Ramp = ['#1e181b', '#30272a', '#463a35', '#5e4f43', '#766654'];
/** The city's grey stone (the house fronts' own, GW_STONE). */
export const STONE: Ramp = ['#363040', '#4f4652', '#6b5f63', '#887a75', '#a69486'];
/** Iron, dark blue-grey, its edges catching the light (as floor 6's). */
export const IRON: Ramp = ['#1e1c26', '#302e3c', '#4a4858', '#6c6a7c', '#9492a4'];
/** Brass: the crier's trumpet, a bell's bronze. Metal, never a glow. */
export const BRASS: Ramp = ['#3a2a18', '#5c4224', '#86622e', '#b08a40', '#d6b466'];
/** Bronze, darker and greener: the city's bells. */
export const BRONZE: Ramp = ['#2a2220', '#43362c', '#62503a', '#857048', '#a89060'];
/** Paper, blank: the Hush's proclamations, the pages. */
export const PAPER: Ramp = ['#5e5850', '#827a6c', '#a69c88', '#c4b9a2', '#ddd2ba'];
/** Hemp rope. */
export const ROPE: Ramp = ['#4a3e32', '#62533f', '#7e6c52', '#9a8766', '#b4a07c'];
/** The Silent Order's black cloth, with the least violet in it. */
export const BLACK: Ramp = ['#09080d', '#121019', '#1c1924', '#282331', '#352e40'];
/** The masks' white, a dead bone-white. */
export const MASK: Ramp = ['#7a766e', '#9c968a', '#bab4a6', '#d4cebe', '#e8e2d2'];
/** The market's awnings and the festival's bunting: canvas in dull dyes. */
export const OXBLOOD: Ramp = ['#2e161c', '#4a2226', '#6a302e', '#86423a', '#a05a48'];
export const CREAM: Ramp = ['#4e463c', '#6c6252', '#8e826a', '#ab9c80', '#c4b494'];
export const BOTTLE: Ramp = ['#18221e', '#24342c', '#34483a', '#46604a', '#5c7a5e'];
export const MUSTARD: Ramp = ['#3a2e1a', '#584424', '#7a5e30', '#9a783c', '#b48e4a'];
export const SLATEBLUE: Ramp = ['#1c1e2c', '#2a2e42', '#3c425a', '#525a74', '#6a728c'];
/** Brick, a dull red-brown (chimneys). */
export const BRICK: Ramp = ['#2a1618', '#432020', '#5e2e28', '#7a4032', '#94543e'];
/** Clay roof tiles (GW_CLAY). */
export const CLAY: Ramp = ['#371f26', '#53292b', '#6d3833', '#874a3c', '#9f5c47'];
/** Produce: apples (dull red), cabbages (dull green), bread (crust). */
export const APPLE: Ramp = ['#2e1216', '#4a1c1e', '#6a2a26', '#863a2e', '#a0503a'];
export const GREENS: Ramp = ['#1a2418', '#263622', '#364a2c', '#4a6236', '#627a44'];
export const CRUST: Ramp = ['#3a2416', '#5a3a20', '#7c552e', '#9c7040', '#b88c56'];
/** Straw, hay. */
export const STRAW: Ramp = ['#3e3220', '#5a4a2a', '#7a6636', '#9a8444', '#b8a058'];
/** Soot and char. */
export const CHAR: Ramp = ['#0e0b0e', '#181316', '#231c1e', '#30272a', '#3e3436'];
/** Water in a trough or a well, dark, a glint of the dusk. */
export const WATER: Ramp = ['#14141e', '#1e1e2c', '#2a2a3c', '#3e3c52', '#6a5e70'];
/** The deep dark of a hole, a doorway, a well's throat. */
export const HOLE = '#0a0810';

// =================================================================================================
// STANDING ON THE FLOOR: built in depth (floor 4's Scene: 40 units to a tile along x and y, picture pixels up)

/** A canvas to build a standing piece on: `w` by `h` picture pixels, the world's (0, 0, 0) at (ox, oy) on it. */
export function scene(w: number, h: number, ox: number, oy: number): Scene {
  return new Scene(new Px(w, h), ox, oy);
}

/**
 * A SCENE TURNED a quarter at a time about the upright through its (0, 0): what is built in it with its
 * front looking along +y is built looking along +y (`k` 0), +x (1), -y (2, its back to the eye) or -x (3);
 * its light is still the world's (the upper left), so a thing turned is lit as it now stands. `K`: built that
 * many times as big as it is measured (its stones and planks with it), about the same point.
 */
export function turned(S: Scene, k: number, K = 1): Scene {
  const q = ((k % 4) + 4) % 4;
  if (q === 0 && K === 1) return S;
  const Rd = (p: readonly number[]): V3 => (q === 0 ? [p[0], p[1], p[2]] : q === 1 ? [p[1], -p[0], p[2]] : q === 2 ? [-p[0], -p[1], p[2]] : [-p[1], p[0], p[2]]);
  const Rdi = (p: readonly number[]): V3 => (q === 0 ? [p[0], p[1], p[2]] : q === 1 ? [-p[1], p[0], p[2]] : q === 2 ? [-p[0], -p[1], p[2]] : [p[1], -p[0], p[2]]);
  const R = (p: readonly number[]): V3 => {
    const r = Rd(p);
    return [r[0] * K, r[1] * K, r[2] * K];
  };
  const Ri = (w: readonly number[]): V3 => Rdi([w[0] / K, w[1] / K, w[2] / K]);
  const T = Object.create(S) as Scene;
  T.egg = (c, A, r, shade, id, keep) => S.egg(R(c), [Rd(A[0]), Rd(A[1]), Rd(A[2])], [r[0] * K, r[1] * K, r[2] * K], shade, id, keep ? (w) => keep(Ri(w)) : undefined);
  T.ball = (c, r, ramp, id, keep, bias) => S.ball(R(c), r * K, ramp, id, keep ? (w) => keep(Ri(w)) : undefined, bias);
  T.quad = (qd, shade, id) => S.quad([R(qd[0]), R(qd[1]), R(qd[2]), R(qd[3])], shade, id);
  T.box = (c, A, r, shade, id) => S.box(R(c), [Rd(A[0]), Rd(A[1]), Rd(A[2])], [r[0] * K, r[1] * K, r[2] * K], shade, id);
  T.rod = (a, b, r0, r1, ramp, id, keep) => S.rod(R(a), R(b), r0 * K, r1 * K, ramp, id, keep ? (w) => keep(Ri(w)) : undefined);
  const t = T as unknown as Turned;
  t.turnN = Rd;
  t.turnBack = Ri;
  t.turnPt = R;
  return T;
}

interface Turned {
  /** A direction of the piece's own, as the world has it. */
  turnN?: (n: readonly number[]) => V3;
  /** A point of the world, in the piece's own frame. */
  turnBack?: (w: readonly number[]) => V3;
  /** A point of the piece's own frame, in the world. */
  turnPt?: (p: readonly number[]) => V3;
}
/** A direction of the piece's own frame (a face's), as the world has it (the same unless turned): for lighting a face built by hand. */
export function facing(S: Scene, n: readonly number[]): V3 {
  const t = (S as unknown as Turned).turnN;
  return t ? t(n) : [n[0], n[1], n[2]];
}
/** Ids from here up are soft (a haze, a glow on the air): no seam is drawn round them (floor 4's Scene). */
export const SOFT_ID = 1 << 20;
/** Whether the picture's pixel under the world's point `w` is on, in a fine checker (for what is half there). */
export function checker(S: Scene, w: readonly number[], every = 2): boolean {
  const [x, y] = S.at(w);
  const X = Math.floor(x);
  const Y = Math.floor(y);
  return every === 2 ? ((X + Y) & 1) === 0 : X % every === 0 && Y % every === 0;
}

/** A point of the world (as a shade is handed it), in the frame the piece is built in (the same unless turned). */
export function local(S: Scene, w: readonly number[]): V3 {
  const t = (S as unknown as Turned).turnBack;
  return t ? t(w) : [w[0], w[1], w[2]];
}

/** Finish a standing piece: its seams, anchored at (ox, oy); its lights, each a world point, a radius and a colour. */
export function done(S: Scene, ox: number, oy: number, lights: readonly { at: V3; r: number; color: string; a?: number }[] = []): Sprite {
  S.seams();
  const sp = compose(null, [S.p], null).sprite(ox, oy, GRAIN);
  if (lights.length) {
    const tp = (S as unknown as Turned).turnPt;
    sp.lights = lights.map((l) => {
      const [x, y] = S.at(tp ? tp(l.at) : l.at);
      return { x: x / GRAIN, y: y / GRAIN, r: l.r, color: l.color, a: l.a ?? 0.4 };
    });
  }
  return sp;
}

/** A plain box of one ramp along the world's axes: x0..x1, y0..y1, z0..z1; lit as it faces, a lit edge along its top. */
export function slab(S: Scene, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, r: Ramp, id: number, bias = 0, grain?: (f: number, u: number, v: number) => number): void {
  S.box([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2], (f, u, v, n) => {
    const g = grain ? grain(f, u, v) : 0;
    // the edge where a side meets the top catches the light
    if (f !== 4 && v > 0.96) return toneAt(n, r, bias + 0.45 + g);
    return toneAt(n, r, bias + g);
  }, id);
}

/** A tone shift for planks on a box's faces: a dark gap every 1/k across each side (along u) and across the top (along v). */
export const planks = (k: number) => (f: number, u: number, v: number): number => {
  const t = (f === 4 || f === 5 ? v : u) * k;
  return Math.abs(t - Math.round(t)) < 0.05 ? -0.7 : 0;
};

/**
 * AN UPRIGHT CYLINDER (a barrel, a well, a pier): its middle at (cx, cy), radius `r` (or `rAt(z)`), from z0 to
 * z1, `shade(n, a, z)` its colour where its side is turned `n`, `a` round it (radians from +x), `z` up; its top
 * `top(a, rr)` (rr 0..1 out from its middle; null: open). Built of narrow upright strips.
 */
export function cylinder(S: Scene, cx: number, cy: number, r: number | ((z: number) => number), z0: number, z1: number, shade: (n: V3, a: number, z: number) => string | null, id: number, top?: (a: number, rr: number) => string | null): void {
  const R = typeof r === 'number' ? () => r : r;
  // turned: its sides lit as they face in the world
  const turnN = (S as unknown as Turned).turnN;
  const N = 40;
  const STEPS = Math.max(2, Math.ceil((z1 - z0) / 3));
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    for (let k = 0; k < STEPS; k++) {
      const za = z0 + ((z1 - z0) * k) / STEPS;
      const zb = z0 + ((z1 - z0) * (k + 1)) / STEPS;
      const ra = R(za);
      const rb = R(zb);
      const P = (aa: number, rr: number, z: number): V3 => [cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr, z];
      const am = (a0 + a1) / 2;
      const slope = (ra - rb) / Math.max(0.001, zb - za);
      const n0: V3 = [Math.cos(am), Math.sin(am), slope];
      const nl = Math.hypot(n0[0], n0[1], n0[2]);
      const n: V3 = [n0[0] / nl, n0[1] / nl, n0[2] / nl];
      const nw = turnN ? turnN(n) : n;
      S.quad([P(a0, ra, za), P(a1, ra, za), P(a1, rb, zb), P(a0, rb, zb)], (u, v) => shade(nw, a0 + (a1 - a0) * u, za + (zb - za) * v), id);
    }
  }
  if (top) {
    const rt = R(z1);
    const RINGS = 6;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2;
      const a1 = ((i + 1) / N) * Math.PI * 2;
      for (let k = 0; k < RINGS; k++) {
        const r0 = (rt * k) / RINGS;
        const r1 = (rt * (k + 1)) / RINGS;
        const P = (aa: number, rr: number): V3 => [cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr, z1];
        S.quad([P(a0, r0), P(a1, r0), P(a1, r1), P(a0, r1)], (u, v) => top(a0 + (a1 - a0) * u, (r0 + (r1 - r0) * v) / Math.max(0.001, rt)), id);
      }
    }
  }
}

// =================================================================================================
// ON A HOUSE FRONT: built in front of the face, the face's foot under the piece's middle

/** A house front's frame in the world (along it, out of it, up), as floor 4's (alongX: the face turned to screen-left, in the light). */
export const onFront = faceWorld;

/**
 * A PIECE HUNG ON A HOUSE FRONT, on both faces: built by `make(S, w, alongX)` with `w(a, b, z)` the world's
 * point `a` along the face (picture pixels of the world, 0.8 to a picture pixel across), `b` out of it, `z`
 * up; the face in shade a shade darker, lit as that face is seen (floor 4's inFaceLight). `W` by `H`
 * picture pixels, anchored at the face's foot under its middle (AX, AY).
 */
export function frontPiece(make: (S: Scene, w: (a: number, b: number, z: number) => V3, alongX: boolean) => void, W = 72, H = 190, lights?: (S: Scene, w: (a: number, b: number, z: number) => V3) => { at: V3; r: number; color: string; a?: number }[]): { left: Sprite; right: Sprite } {
  const AX = Math.floor(W / 2);
  const AY = H - 12;
  const one = (alongX: boolean): Sprite => {
    const S = scene(W, H, AX, AY);
    const F = faceWorld(alongX);
    inFaceLight(alongX, 1, () => make(S, F, alongX));
    return done(S, AX, AY, lights ? lights(S, F) : []);
  };
  return { left: one(true), right: one(false) };
}

// =================================================================================================
// LAID ON THE FLOOR, flat along its lines: a picture of the floor's own grid, painted in the floor's (u, v)

/** A flat thing on the floor, `w` by `h` picture pixels, anchored at (ax, ay); `paint(u, v)` its colour at the floor's point (u, v) in tiles from the anchor (null: nothing). */
export function lying(w: number, h: number, ax: number, ay: number, paint: (u: number, v: number, px: number, py: number) => string | null, lights: Light[] = []): Sprite {
  const p = new Px(w, h);
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const a = (px + 0.5 - ax) / 32;
      const b = (py + 0.5 - ay) / 16;
      const c = paint((a + b) / 2, (b - a) / 2, px, py);
      if (c) p.set(px, py, c);
    }
  }
  const sp = p.sprite(ax, ay, GRAIN);
  if (lights.length) sp.lights = lights;
  return sp;
}

/** A colour taken toward the deep dark, `t` of the way (for what lies in shade). */
export const dim = (c: string, t: number): string => mix(c, '#0a0810', t);
