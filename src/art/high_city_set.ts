// ACT 2, PART TWO, THE HIGH CITY (floors 16 to 20): THE SET'S OWN PIECES, for all five of its floors (a mock-up; nothing
// of the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” The theme of these five is the High City (his doc "Wordsmith Act 2, Part Two: The High
// City (Levels 16–20)", "Yes, go (Recommended)"): "The royal family has locked itself in with that chapter. While the city
// below lost its voice, the court went on as if nothing were wrong: gardens, a masked ball, a hall of mirrors, a dying
// king in a silent palace." So the set's pieces are the court's, left as it was when the Hush came up the hill: its royal
// house's things (banners, a gilt lamp post, railings, a sentry box, a statue, a fountain, the state coach), the
// palace's rooms (doors, sconces, a portrait, chairs, a card table, the tea left out, a grand vase, a candelabrum, a
// carpet), the party it went on having (invitations, a dropped fan, cloaks never collected), what has gone silent (the
// heralds' trumpets stopped, the court's notice gone blank, a songbird's cage), and the Silent Order's mark on it all (its
// blank mask over the royal crest, on the railings, on a sealed door, gagging the king's statue).
//
// HIS EVENT, THE ROYAL CARDS ("on these levels some enemies are touched by one of the four royals, the Princess, the
// Prince, the Queen or the King, and show it (that royal's crest over them). They drop cards: each drops its royal's
// playing card."): the four royals' marks are drawn here once (`markTone`), each royal in colours of its own, and used
// on their banners, their cards and the fountain of the four royals. The marks are this chat's proposal, for his yes:
// the Princess a swan, wings raised (the palace guard's crest on her floor); the Prince a smiling gilt mask (his, at the
// Masque: never the Order's, which is white and has no mouth); the Queen a hand mirror; the King a crown. The house's
// own crest, on what all the court shares (the coach, the railings, the sentry box), is the King's crown.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says (built in depth in floor 4's Scene, a step quieter than any word through
// art/act2_quiet.ts, seams of ink where one thing ends before another). Nothing glows but honest flame: the gilt lamp
// post's, the sconce's and the candelabrum's (an honest orange). Nothing cyan, no pink (the royal wine is a claret, every
// hue of it past 350 degrees; the Queen's violet and the King's blue short of the cyans and the pinks). Real shapes, not
// circles and squares: each piece is the thing it is (a baluster vase's foot, belly, shoulder and lip; a cabriole leg's
// knee and foot; a coach's bowed body on its springs).
//
// HUNG ON A WALL: built as act2_set's are (art/act2_kit.ts frontPiece, both faces), each at a few SPOTS (Piece.spots, as
// Act 1's floors: the first on a room's wall, the game's walls of 80 picture pixels; along it; and higher, for a tall hall or
// a palace front, 150).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import type { Piece, Spot } from './floorkit';
import { hash, mix } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';
import { BLACK, HOLE, IRON, MASK, PAPER, cylinder, done, facing, frontPiece, local, lying, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);
const AX3: readonly [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const add3 = (a: readonly number[], b: readonly number[]): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a: readonly number[], b: readonly number[]): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a: readonly number[], k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const lerp3 = (a: readonly number[], b: readonly number[], t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dot3 = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm3 = (a: readonly number[]): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const cross3 = (a: readonly number[], b: readonly number[]): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const clamp4 = (i: number): number => Math.max(0, Math.min(4, i));

// =================================================================================================
// THE COURT'S MATERIALS (each from its deep shade to its lit top)

/** Old gold leaf on carved wood and bronze: dull, never a glow. */
export const GILT: Ramp = ['#3a2a14', '#5e4420', '#8a6a30', '#b4924a', '#d8bc72'];
/**
 * The royal wine, the court's livery (as the palace guard's tabard), a deep claret leaning to red: every hue of it past 350
 * degrees even on a wall's face in shade (where the kit takes it toward the dark), never the enemy's pink.
 */
export const WINE: Ramp = ['#2a1414', '#46201e', '#6a2e2a', '#8a3e38', '#a8564c'];
/** White marble, a little warm, its veins grey. */
export const MARBLE: Ramp = ['#3a3846', '#64606c', '#9a949a', '#c4bebc', '#e2dcd4'];
/** The palace's dressed stone, paler than the Lower City's. */
export const PALACE: Ramp = ['#2c2a36', '#555060', '#807a86', '#aaa2a6', '#d2c8c2'];
/** Paint gone ivory: the doors, the coach's mouldings, the sentry box's stripes. */
export const IVORY: Ramp = ['#3e3a40', '#6a6468', '#9a928e', '#c2b8ae', '#ddd4c6'];
/** Silver plate. */
export const SILVER: Ramp = ['#2a2a34', '#4c4c58', '#7a7a86', '#a6a6b0', '#cfcfd6'];
/** Porcelain, white. */
const PORCELAIN: Ramp = ['#4a4a56', '#78788a', '#a8a8b4', '#cfcdd2', '#e8e6e6'];
/** Black velvet: the Prince's. */
const VELVET: Ramp = ['#0c0a0e', '#16121a', '#221c26', '#302834', '#40363f'];
/** The Queen's dark violet. */
const VIOLET: Ramp = ['#1a1228', '#2a1c3e', '#402a5a', '#5a4076', '#7a5e96'];
/** The King's royal blue. */
export const ROYALBLUE: Ramp = ['#10142a', '#1a2244', '#283464', '#3a4a82', '#56689e'];
/** The Princess's deep hedge green. */
const HEDGE: Ramp = ['#0e1a14', '#16261c', '#203626', '#2e4a32', '#46603e'];
/** Her swans' white. */
const SWANW: Ramp = ['#4c4762', '#7d7591', '#aca4b3', '#d5cfd1', '#ece6df'];
/** A dusty dawn rose (every hue past 350 degrees). */
const ROSEDUST: Ramp = ['#3a2428', '#5a383c', '#7e5458', '#a07476', '#bc9894'];
/** The card table's baize, a dull green. */
const BAIZE: Ramp = ['#121c16', '#1a2a1e', '#26392a', '#344a36', '#465c46'];
/** Walnut, dark and close-grained. */
const WALNUT: Ramp = ['#1a1012', '#2a1a18', '#3e2820', '#56382a', '#6e4a36'];
/** Iron painted black-green, the railings', the lamp post's. */
const PAINTED: Ramp = ['#0c100e', '#141a17', '#202823', '#313b34', '#47524a'];
/** Slate, the sentry box's roof. */
const SLATE: Ramp = ['#14141e', '#20202e', '#30303f', '#454556', '#5e5e70'];
/** Candle wax. */
const WAX: Ramp = ['#5e584e', '#8a8272', '#b4ab96', '#d4cab2', '#e8dfc8'];
/** Water standing still. */
const STILL: Ramp = ['#16182a', '#22243a', '#30324c', '#46465e', '#6a6680'];
/** The Hush: the dead grey-violet of a silence (as the Lower City's). */
const HUSH: Ramp = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4'];
/** Cake: sponge, icing. */
const SPONGE: Ramp = ['#4a3a26', '#6e5636', '#927448', '#b0905c', '#c8a874'];

// =================================================================================================
// HELPERS: tubes, curves, prisms, a wall's own frame

/** A smooth line through `ctrl` (Catmull-Rom), `n` points to each stretch between two of them. */
function curve(ctrl: readonly V3[], n = 6): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t)) as V3);
    }
  }
  out.push([...ctrl[ctrl.length - 1]] as V3);
  return out;
}
/** A TUBE along `pts`, `r0` thick at its first and `r1` at its last. */
function tube(S: Scene, pts: readonly V3[], r0: number, r1: number, ramp: Ramp, id: number, keep?: (w: V3) => boolean): void {
  for (let i = 0; i + 1 < pts.length; i++) {
    const t0 = i / Math.max(1, pts.length - 1);
    const t1 = (i + 1) / Math.max(1, pts.length - 1);
    S.rod(pts[i], pts[i + 1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1, ramp, id, keep);
  }
}
/**
 * AN UPRIGHT PRISM, its section's radius `rAt(a)` round it (a in radians from +x; a lobed basin, an octagon), from z0 to
 * z1; `shade(n, a, z)` its side, `top(a, rr)` its top (null: open). As art/act2_kit.ts cylinder, but round by angle.
 */
function prism(S: Scene, cx: number, cy: number, rAt: (a: number) => number, z0: number, z1: number, shade: (n: V3, a: number, z: number) => string | null, id: number, top?: (a: number, rr: number) => string | null, N = 72): void {
  const STEPS = Math.max(2, Math.ceil((z1 - z0) / 3));
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const P = (a: number, z: number, k = 1): V3 => [cx + Math.cos(a) * rAt(a) * k, cy + Math.sin(a) * rAt(a) * k, z];
    const e = sub3(P(a1, 0), P(a0, 0));
    const n = facing(S, norm3([e[1], -e[0], 0]));
    for (let k = 0; k < STEPS; k++) {
      const za = z0 + ((z1 - z0) * k) / STEPS;
      const zb = z0 + ((z1 - z0) * (k + 1)) / STEPS;
      S.quad([P(a0, za), P(a1, za), P(a1, zb), P(a0, zb)], (u, v) => shade(n, a0 + (a1 - a0) * u, za + (zb - za) * v), id);
    }
    if (top) {
      for (let k = 0; k < 6; k++) {
        S.quad([P(a0, z1, k / 6), P(a1, z1, k / 6), P(a1, z1, (k + 1) / 6), P(a0, z1, (k + 1) / 6)], (u, v) => top(a0 + (a1 - a0) * u, (k + v) / 6), id);
      }
    }
  }
}

/** A box's side (0 +x, 1 -x, 2 +y, 3 -y), as floor 4's Scene paints it (u, v): how far along it (-1 to 1, as the world's y or x runs) and how far up it (0 to 1). */
function sideUV(f: number, u: number, v: number): [number, number] {
  return f < 2 ? [u * 2 - 1, v] : [v * 2 - 1, u];
}
/** Which way a royal's mark reads across a box's side as the eye sees it (the side turned to it): +1 or -1 to the side's own along. */
const READS: readonly number[] = [-1, 1, 1, -1];

/**
 * A BODY OF TURNING along `axis` from `base` (a trumpet's bell): `r(t)` its radius `t` along it (0 to `len`); `shade(n, t,
 * inside)` its colour, `inside` where the eye sees into it. Built of quads round it.
 */
function latheAlong(S: Scene, base: V3, axis: V3, len: number, r: (t: number) => number, shade: (n: V3, t: number, inside: boolean) => string | null, id: number, N = 28, STEPS = 14): void {
  const A = norm3(axis);
  const B0 = Math.abs(A[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const B = norm3(cross3(A, B0));
  const C = cross3(A, B);
  const P = (t: number, a: number): V3 => add3(add3(base, mul3(A, t)), add3(mul3(B, Math.cos(a) * r(t)), mul3(C, Math.sin(a) * r(t))));
  for (let k = 0; k < STEPS; k++) {
    const t0 = (len * k) / STEPS;
    const t1 = (len * (k + 1)) / STEPS;
    const slope = (r(t1) - r(t0)) / Math.max(0.001, t1 - t0);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2;
      const a1 = ((i + 1) / N) * Math.PI * 2;
      const am = (a0 + a1) / 2;
      const rad = add3(mul3(B, Math.cos(am)), mul3(C, Math.sin(am)));
      const n = facing(S, norm3(sub3(rad, mul3(A, slope))));
      const inside = dot3(n, [0.61, 0.61, 0.5]) < 0;
      S.quad([P(t0, a0), P(t0, a1), P(t1, a1), P(t1, a0)], (_u, v) => shade(n, t0 + (t1 - t0) * v, inside), id);
    }
  }
}

/** A point on a wall's face: `a` along it, `b` out of it, `z` up (art/act2_kit.ts frontPiece). */
type WallAt = (a: number, b: number, z: number) => V3;
/** A face's axes in the world: along it, out of it, up. */
function faceAxes(w: WallAt): [V3, V3, V3] {
  const o = w(0, 0, 0);
  return [sub3(w(1, 0, 0), o), sub3(w(0, 1, 0), o), [0, 0, 1]];
}
/** A world point as the face has it: along it, out of it, up. */
function onFace(w: WallAt, p: readonly number[]): [number, number, number] {
  const o = w(0, 0, 0);
  const [A, B] = faceAxes(w);
  const q = sub3(p, o);
  return [dot3(q, A), dot3(q, B), p[2]];
}
/** A flat panel on the face, `b` out of it, from a0 to a1 along and z0 to z1 up: `paint(a, z)` its colour. */
function panel(S: Scene, w: WallAt, a0: number, a1: number, z0: number, z1: number, b: number, paint: (a: number, z: number) => string | null, id: number): void {
  S.quad([w(a0, b, z0), w(a1, b, z0), w(a1, b, z1), w(a0, b, z1)], (u, v) => paint(a0 + (a1 - a0) * u, z0 + (z1 - z0) * v), id);
}
/** A box standing out of the face: its middle `a` along, `b` out, `z` up; half-sizes along, out, up. `front(u, v, n)`: its face toward the room (u up, v along). */
function faceBox(S: Scene, w: WallAt, a: number, b: number, z: number, ha: number, hb: number, hz: number, ramp: Ramp, id: number, front?: (u: number, v: number, n: V3) => string | null): void {
  const [A, B] = faceAxes(w);
  S.box(w(a, b, z), [A, B, [0, 0, 1]], [ha, hb, hz], (f, u, v, n) => {
    if (f === 2 && front) return front(u, v, n);
    return toneAt(n, ramp, f === 4 ? 0.35 : 0);
  }, id);
}
/** A carved, gilt frame standing out of the face round a0..a1, z0..z1, `t` broad: its four bars, their fronts beaded and lit on their upper left. */
function giltFrame(S: Scene, w: WallAt, a0: number, a1: number, z0: number, z1: number, t: number, depth: number, id: number, ramp: Ramp = GILT): void {
  const bead = (along: number, across: number, n: V3, lit: number): string => {
    // its moulding: a lit lip, a bead in a hollow, a dark inner step
    if (across > 0.8) return ramp[lit > 0 ? 4 : 2];
    if (across < 0.18) return ramp[1];
    if (Math.abs(across - 0.5) < 0.17) return fr(along * 0.5) < 0.5 ? toneAt(n, ramp, 0.3 + lit * 0.2) : toneAt(n, ramp, -0.2);
    return toneAt(n, ramp, lit * 0.25);
  };
  const ma = (a0 + a1) / 2;
  const mz = (z0 + z1) / 2;
  // top and foot (u up its height, v along)
  faceBox(S, w, ma, depth / 2, z1 - t / 2, (a1 - a0) / 2, depth / 2, t / 2, ramp, id, (u, v, n) => bead(v * (a1 - a0), u, n, 1));
  faceBox(S, w, ma, depth / 2, z0 + t / 2, (a1 - a0) / 2, depth / 2, t / 2, ramp, id, (u, v, n) => bead(v * (a1 - a0), 1 - u, n, -1));
  // the sides (v across them)
  faceBox(S, w, a0 + t / 2, depth / 2, mz, t / 2, depth / 2, (z1 - z0) / 2 - t, ramp, id, (u, v, n) => bead(u * (z1 - z0), 1 - v, n, 1));
  faceBox(S, w, a1 - t / 2, depth / 2, mz, t / 2, depth / 2, (z1 - z0) / 2 - t, ramp, id, (u, v, n) => bead(u * (z1 - z0), v, n, -1));
}

type WallMake = (S: Scene, w: WallAt, alongX: boolean) => void;
type WallLight = { at: V3; r: number; color: string; a?: number };
/**
 * A PIECE HUNG ON A WALL (art/act2_kit.ts frontPiece, both faces), frame by frame, at each of its spots: `du` along the
 * wall and `dv` up it (picture pixels); its first spot the one its left and right are.
 */
function onWall(frames: ReadonlyArray<{ make: WallMake; lights?: (w: WallAt) => WallLight[] }>, spots: ReadonlyArray<readonly [number, number]>, W = 104, H = 210, below = 16): { left: Sprite[]; right: Sprite[]; spots: Spot[] } {
  const out: Spot[] = spots.map(([du, dv]) => {
    const left: Sprite[] = [];
    const right: Sprite[] = [];
    for (const fm of frames) {
      const at = (w: WallAt): WallAt => (a, b, z) => w(a + du, b, z + dv);
      const sp = frontPiece((S, w, alongX) => fm.make(S, at(w), alongX), W, H, fm.lights ? (_S, w) => fm.lights!(at(w)) : undefined, below);
      left.push(sp.left);
      right.push(sp.right);
    }
    return { du, dv, left, right };
  });
  return { left: out[0].left, right: out[0].right, spots: out };
}
/** The spots a hung piece may take: on a room's wall; along it; higher, for a tall hall or a palace front. */
const HUNG: readonly (readonly [number, number])[] = [[0, 0], [-10, 0], [0, 34]];

// =================================================================================================
// THE FOUR ROYALS' MARKS (his Royal Cards: "that royal's crest over them"; "each drops its royal's playing card")

export type Royal = 'princess' | 'prince' | 'queen' | 'king';
export const ROYALS: readonly Royal[] = ['princess', 'prince', 'queen', 'king'];
/** Each royal's colours: the field a mark is set on, the mark, the trim round it. */
export const ROYAL_LOOK: Readonly<Record<Royal, { field: Ramp; mark: Ramp; trim: Ramp }>> = {
  princess: { field: HEDGE, mark: SWANW, trim: ROSEDUST },
  prince: { field: VELVET, mark: GILT, trim: GILT },
  queen: { field: VIOLET, mark: SILVER, trim: SILVER },
  king: { field: ROYALBLUE, mark: GILT, trim: GILT },
};

type Pt = readonly [number, number];
function inPoly(x: number, y: number, P: readonly Pt[]): boolean {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i];
    const [xj, yj] = P[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function lineD(x: number, y: number, pts: readonly Pt[]): number {
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const L2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L2));
    best = Math.min(best, Math.hypot(x - ax - (bx - ax) * t, y - ay - (by - ay) * t));
  }
  return best;
}
const inEll = (x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;

// THE PRINCESS'S: a swan, its wings raised over its back, its neck in its S, looking to the left
const SWAN_WING: readonly Pt[] = [[-0.14, -0.34], [-0.08, 0.06], [0.04, 0.42], [0.2, 0.74], [0.36, 0.94], [0.48, 0.76], [0.6, 0.88], [0.66, 0.66], [0.8, 0.7], [0.78, 0.48], [0.94, 0.44], [0.84, 0.24], [0.97, 0.12], [0.78, -0.02], [0.86, -0.2], [0.55, -0.3]];
const SWAN_NECK: readonly Pt[] = [[-0.34, -0.38], [-0.5, -0.16], [-0.42, 0.08], [-0.54, 0.3], [-0.55, 0.46]];
function swanIn(x: number, y: number): boolean {
  if (inEll(x, y, 0.1, -0.5, 0.66, 0.29) && y > -0.76) return true;
  if (inEll(x, y, -0.3, -0.44, 0.27, 0.22)) return true;
  if (inPoly(x, y, [[0.55, -0.36], [0.98, -0.24], [0.62, -0.66]])) return true;
  if (inPoly(x, y, SWAN_WING)) return true;
  if (lineD(x, y, SWAN_NECK) < 0.12) return true;
  if (inEll(x, y, -0.6, 0.52, 0.18, 0.14)) return true;
  return inPoly(x, y, [[-0.68, 0.6], [-0.98, 0.44], [-0.68, 0.43]]);
}
function swanDetail(x: number, y: number): number {
  // the bill dark; the wing's row of feathers; the back's line where the wing rises from it
  if (x < -0.7 && y > 0.4) return 1;
  if (inPoly(x, y, SWAN_WING)) {
    if (lineD(x, y, [[0.16, -0.22], [0.34, 0.24], [0.62, 0.62]]) < 0.045) return 2;
    const e = ((x - 0.1) / 0.66) ** 2 + ((y + 0.5) / 0.29) ** 2;
    if (Math.abs(e - 1) < 0.2 && y > -0.5) return 2;
  }
  return -1;
}

// THE PRINCE'S: a smiling mask of gilt, tied at its temples (never the Order's: theirs is white and has no mouth)
function maskHW(y: number): number {
  if (y > 0.8 || y < -0.9) return 0;
  if (y >= 0.1) return 0.74 * Math.sqrt(Math.max(0, 1 - ((y - 0.1) / 0.7) ** 2));
  return 0.74 * (1 - 0.7 * ((0.1 - y) / 1.0) ** 1.6);
}
function maskHole(x: number, y: number): boolean {
  // its eyes: almonds, their outer corners up; its mouth: a wide smile, its corners up
  for (const s of [-1, 1]) {
    const dx = x - s * 0.3;
    if (Math.abs(dx) < 0.22 && Math.abs(y - 0.2 - 0.14 * dx * s) < 0.11 * Math.sqrt(1 - (dx / 0.22) ** 2)) return true;
  }
  if (Math.abs(x) < 0.44) {
    const cy = -0.44 + 0.9 * x * x;
    if (Math.abs(y - cy) < 0.075 + 0.04 * (1 - (x / 0.44) ** 2)) return true;
  }
  return false;
}
function princeIn(x: number, y: number): boolean {
  for (const s of [-1, 1]) if (lineD(x * s, y, [[0.66, 0.26], [0.84, 0.12], [0.88, -0.14], [0.94, -0.36]]) < 0.065) return true;
  return Math.abs(x) < maskHW(y) && !maskHole(x, y);
}
function princeDetail(x: number, y: number): number {
  // its brows over its eyes
  for (const s of [-1, 1]) if (lineD(x * s, y, [[0.1, 0.4], [0.3, 0.48], [0.52, 0.42]]) < 0.04) return 2;
  return -1;
}

// THE QUEEN'S: a hand mirror, its oval glass catching the light
function queenIn(x: number, y: number): boolean {
  if (inEll(x, y, 0, 0.28, 0.56, 0.66)) return true;
  if (inEll(x, y, 0, 0.98, 0.13, 0.1)) return true;
  if (inEll(x, y, 0, -0.42, 0.2, 0.11)) return true;
  if (y < -0.42 && y > -0.96 && Math.abs(x) < 0.11 + 0.04 * Math.cos((y + 0.42) * 11)) return true;
  return inEll(x, y, 0, -0.93, 0.15, 0.1);
}
function queenDetail(x: number, y: number): number {
  if (inEll(x, y, 0, 0.28, 0.38, 0.47)) {
    // the glass, darker than its frame: its glint across it from the upper left
    const g = x + (y - 0.28) * 0.6;
    if (Math.abs(g + 0.08) < 0.08) return 4;
    return 1;
  }
  return -1;
}

// THE KING'S: a crown, five points pearled, jewels in its band
const CROWN_TIPS: readonly Pt[] = [[-0.76, 0.14], [-0.38, 0.42], [0, 0.64], [0.38, 0.42], [0.76, 0.14]];
function crownTop(x: number): number {
  const pts: Pt[] = [];
  CROWN_TIPS.forEach(([tx, ty], i) => {
    pts.push([tx, ty]);
    if (i + 1 < CROWN_TIPS.length) pts.push([(tx + CROWN_TIPS[i + 1][0]) / 2, -0.04]);
  });
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    if (x >= ax && x <= bx) return ay + ((x - ax) / (bx - ax)) * (by - ay);
  }
  return -1;
}
function kingIn(x: number, y: number): boolean {
  const base = -0.24 + 0.06 * x * x;
  if (Math.abs(x) <= 0.78 && y > -0.68 + 0.06 * x * x && y < base) return true;
  if (Math.abs(x) <= 0.78 && y >= base && y < crownTop(x)) return true;
  for (const [tx, ty] of CROWN_TIPS) if (inEll(x, y, tx, ty + 0.06, 0.13, 0.13)) return true;
  return false;
}
function kingDetail(x: number, y: number): number {
  for (const jx of [-0.42, 0, 0.42]) if (inEll(x, y, jx, -0.46, jx ? 0.12 : 0.14, 0.1)) return 0;
  return -1;
}

const MARK_IN: Record<Royal, (x: number, y: number) => boolean> = { princess: swanIn, prince: princeIn, queen: queenIn, king: kingIn };
const MARK_DETAIL: Record<Royal, (x: number, y: number) => number> = { princess: swanDetail, prince: princeDetail, queen: queenDetail, king: kingDetail };
/**
 * A ROYAL'S MARK at (x, y) of its square (-1 to 1, y up), as it is painted or inlaid: -1 where it is not; else the tone of
 * its ramp (0 to 4): lit along its upper left edges, in shade along its lower right, its own lines. `e`: a pixel's size in
 * the square (how broad its edges are).
 */
export function markTone(r: Royal, x: number, y: number, e: number): number {
  const In = MARK_IN[r];
  if (!In(x, y)) return -1;
  const d = MARK_DETAIL[r](x, y);
  if (d >= 0) return d;
  if (!In(x - e, y + e)) return 4;
  if (!In(x + e, y - e)) return 1;
  return 3;
}

// =================================================================================================
// HUNG ON THE WALL

/**
 * A ROYAL'S BANNER, hung down a wall from a gilt rod on two brackets: the cloth in that royal's field, bordered in its trim,
 * its foot cut in a swallowtail and fringed in gold, the royal's mark on it. One for each of the four.
 */
function royalBanner(r: Royal): WallMake {
  const L = ROYAL_LOOK[r];
  return (S, w) => {
    const Z = 82;
    const LEN = 62;
    const HW = 16;
    for (const a of [-10, 10]) S.rod(w(a, 0, Z + 1), w(a, 3, Z + 1), 0.6, 0.6, GILT, 1);
    S.rod(w(-HW - 3, 3, Z + 1), w(HW + 3, 3, Z + 1), 0.9, 0.9, GILT, 1);
    for (const s of [-1, 1]) {
      S.ball(w(s * (HW + 3.8), 3, Z + 1), 1.5, GILT, 1);
      S.rod(w(s * (HW + 4.8), 3, Z + 1), w(s * (HW + 7.6), 3, Z + 1), 0.9, 0.1, GILT, 1);
    }
    S.quad([w(-HW, 3.6, Z + 1.6), w(HW, 3.6, Z + 1.6), w(HW, 3.6, Z - LEN), w(-HW, 3.6, Z - LEN)], (u, v) => {
      const a = (u - 0.5) * 2 * HW;
      const z = Z + 1.6 - v * (LEN + 1.6);
      const cut = Z - LEN + 14 * (1 - Math.abs(a) / HW);
      if (z < cut) return null;
      const fold = Math.sin(u * Math.PI * 6 + 0.5);
      const sh = fold > 0.62 ? 1 : fold < -0.62 ? -1 : 0;
      const up = z - cut;
      // the fringe: threads of gold
      if (up < 3.2) return Math.floor((a + 40) * 1.25) % 2 ? GILT[up < 1.2 ? 1 : 3] : GILT[1];
      // the sleeve over the rod
      if (z > Z - 2) return L.field[clamp4(1 + sh)];
      const ed = Math.min(HW - Math.abs(a), up - 3.2, Z - 2 - z);
      if (ed < 2.2) return L.trim[clamp4((ed < 0.9 ? 2 : 3) + sh)];
      const t = markTone(r, a / 13, (z - (Z - 26)) / 13, 1.3 / 13);
      if (t >= 0) return L.mark[clamp4(t + (sh < 0 ? -1 : 0))];
      return L.field[clamp4(2 + sh)];
    }, 2);
  };
}

/**
 * A COURT PORTRAIT, ITS FACES PAINTED OUT: the King and the Queen, half-length, in a heavy gilt frame with a crown on its
 * crest: he crowned, in ermine over royal blue with a chain of gold; she in violet with a standing collar of lace and a
 * coronet; a wine drape behind them; and over both their faces a smear of the Hush's grey, brushed on thick, run down.
 */
function portrait(): WallMake {
  return (S, w) => {
    const Z = 50;
    const HW = 19;
    const HH = 17;
    const T = 3.6;
    giltFrame(S, w, -HW, HW, Z - HH, Z + HH, T, 2.4, 1);
    // its crest: a cartouche and a little crown on the frame's top
    const [A, B] = faceAxes(w);
    S.egg(w(0, 2.2, Z + HH + 1.2), [A, B, [0, 0, 1]], [4.6, 1.4, 2.6], (n) => toneAt(n, GILT, 0.1), 2);
    for (const k of [-2, -1, 0, 1, 2]) {
      S.rod(w(k * 1.5, 2.6, Z + HH + 3.2), w(k * 1.7, 2.6, Z + HH + 5.6 - Math.abs(k) * 0.5), 0.65, 0.3, GILT, 2);
      S.ball(w(k * 1.7, 2.6, Z + HH + 6.1 - Math.abs(k) * 0.5), 0.6, GILT, 2);
    }
    // the canvas (X across it, Y up it from its foot)
    const X0 = -HW + T;
    const Y0 = Z - HH + T;
    const ink = '#1c1418';
    const smear = (X: number, Y: number, cx: number, cy: number, rx: number, ry: number): string | null => {
      // the face painted out: pale grey laid on thick in strokes across, a run of it down from its chin
      if (inEll(X, Y, cx, cy, rx, ry) || (Math.abs(X - cx - 0.8) < 0.7 && Y < cy && Y > cy - ry - 2.6)) return Math.floor(Y * 1.25 + X * 0.15) % 3 === 0 ? '#86828e' : '#a19da8';
      return null;
    };
    const painted = (X: number, Y: number): string => {
      const fk = smear(X, Y, 5.6, 17.4, 3.9, 4.6);
      if (fk) return fk;
      const fq = smear(X, Y, -5.8, 15.2, 3.5, 4.2);
      if (fq) return fq;
      // the King's crown
      if (X > 2.2 && X < 9 && Y > 21.4 && Y < 23.6 + (fr((X - 2.2) / 1.7) < 0.5 ? 1.8 : 0)) return Y > 23.4 || X < 3.4 ? GILT[4] : GILT[3];
      // the Queen's coronet, her dark hair round her face and down to her shoulders
      if (X > -9 && X < -2.6 && Y > 19.2 && Y < 20.4 + (fr((X + 9) / 1.6) < 0.5 ? 1.3 : 0)) return Y > 20.2 ? GILT[4] : GILT[3];
      if (inEll(X, Y, -5.8, 15, 4.8, 5.6)) return X < -8 ? '#2e2224' : '#1e1618';
      // the King: an ermine collar over a robe of blue, a gold chain across it
      if (Y < 13.4 && Y > 9.8 && Math.abs(X - 5.6) < 8.2 - (Y - 9.8) * 1.2) return hash(Math.floor(X * 1.25), Math.floor(Y), 9101) < 0.14 ? ink : X < 4 ? IVORY[4] : IVORY[3];
      if (Y <= 9.8 && Math.abs(X - 5.6) < 8.4) {
        if (Math.abs(Y - 6.5 - Math.abs(X - 5.6) * 0.32) < 0.6 && Math.abs(X - 5.6) < 6) return GILT[3];
        return X < 2.5 ? ROYALBLUE[3] : X > 10 ? ROYALBLUE[1] : ROYALBLUE[2];
      }
      // the Queen: her gown of violet, its neck edged in lace, a string of pearls
      if (Y <= 10.6 && Math.abs(X + 5.8) < 7.2 - Math.max(0, Y - 8.4) * 1.4) {
        if (Math.abs(Y - 9.4 + Math.abs(X + 5.8) * 0.2) < 0.7 && Math.abs(X + 5.8) < 4.5) return IVORY[4];
        if (Math.abs(Y - 7.4 + Math.abs(X + 5.8) * 0.25) < 0.5 && Math.abs(X + 5.8) < 2.6 && fr(X) < 0.6) return IVORY[3];
        return X < -9 ? VIOLET[4] : X > -3 ? VIOLET[2] : VIOLET[3];
      }
      // the drape behind, looped up at the left; the dark of the room
      if (Y > 15 - (X - X0) * 0.55 && X < -1) return fr((X * 0.7 + Y * 0.35) / 2.4) < 0.4 ? WINE[1] : WINE[2];
      if (Y < 2) return '#241e1a';
      return Y > 18 ? '#2e2822' : '#362e26';
    };
    panel(S, w, X0, HW - T, Y0, Z + HH - T, 0.8, (a, z) => painted(a, z - Y0), 3);
  };
}

/** A GILT SCONCE: a carved back-plate, two scrolled arms out from the wall, a candle in each, burning an honest flame (two frames), or out. */
function sconce(f: number): WallMake {
  const lit = f < 2;
  return (S, w) => {
    const Z = 47;
    const [A, B] = faceAxes(w);
    // the back-plate: a cartouche, scalloped at its top, a shell carved in it
    S.egg(w(0, 0.4, Z + 1), [A, B, [0, 0, 1]], [3.6, 0.9, 9], (n, p) => {
      const [a, , z] = onFace(w, p);
      if (z > Z + 7 && Math.abs(fr(a * 0.6) - 0.5) < 0.18) return toneAt(n, GILT, -0.4);
      if (Math.abs(z - Z - 4) < 2.4 && Math.abs(a) < 2 && fr((Math.atan2(z - Z - 2, a) / Math.PI) * 5) < 0.3) return GILT[1];
      return toneAt(n, GILT, 0.15);
    }, 1);
    // its arms: an S from the plate's foot out and up to each cup; a drip pan, a candle, its flame
    for (const s of [-1, 1]) {
      const pts = curve([w(0, 1, Z - 6), w(s * 3.5, 4, Z - 7), w(s * 7.5, 6.5, Z - 4), w(s * 8.5, 7.5, Z - 0.5)], 6);
      tube(S, pts, 0.9, 0.7, GILT, 2);
      const c = w(s * 8.5, 7.5, Z);
      cylinder(S, c[0], c[1], (z) => 1.4 + (z - c[2]) * 0.9, c[2] - 0.6, c[2] + 0.6, (n) => toneAt(n, GILT, 0.2), 3);
      cylinder(S, c[0], c[1], 0.95, c[2] + 0.6, c[2] + 7.5, (n, _a, z) => toneAt(n, WAX, z > c[2] + 6.8 ? 0.3 : 0), 4, (_a, rr) => (rr < 0.35 ? '#3a3026' : WAX[4]));
      // (a tear of wax run down it)
      S.rod([c[0] + 0.6, c[1] + 0.7, c[2] + 7], [c[0] + 0.6, c[1] + 0.7, c[2] + 4], 0.4, 0.35, WAX, 5);
      if (lit) flame(S, [c[0], c[1], c[2] + 8], f + (s > 0 ? 1 : 0), 4);
      else {
        const [px, py] = S.at([c[0], c[1], c[2] + 8]);
        S.put(Math.round(px), Math.round(py), 1e4, '#1a1418', 6);
      }
    }
  };
}

/** A COURT NOTICE, GONE BLANK: a board in a gilt frame under a crown, its sheet of the court's proclamations with nothing left on it but the ruled lines the words stood on, the royal seal in wine wax on its ribbons at its foot. */
function courtNotice(): WallMake {
  return (S, w) => {
    const Z = 47;
    giltFrame(S, w, -11.5, 11.5, Z - 15, Z + 13, 2.6, 1.8, 1);
    // its crown on top
    const [A, B] = faceAxes(w);
    S.egg(w(0, 1.6, Z + 14), [A, B, [0, 0, 1]], [4.6, 1, 1.6], (n) => toneAt(n, GILT, 0.1), 2);
    for (const k of [-2, -1, 0, 1, 2]) {
      S.rod(w(k * 1.8, 1.8, Z + 15), w(k * 2, 1.8, Z + 17.6 - Math.abs(k) * 0.5), 0.7, 0.3, GILT, 2);
      S.ball(w(k * 2, 1.8, Z + 18.2 - Math.abs(k) * 0.5), 0.6, GILT, 2);
    }
    // the sheet: pale, its lines ruled and empty, curling off the board at its lower right
    panel(S, w, -8.9, 8.9, Z - 12.4, Z + 10.4, 0.7, (a, z) => {
      const ra = a + 8.9;
      const rz = z - (Z - 12.4);
      if (ra > 13.6 && rz < 5.2 - (17.8 - ra) * 0.2 && ra - 13.6 > rz * 0.9) return null;
      if (ra > 12.8 && rz < 5.8 && Math.abs(ra - 13.6 - rz * 0.9) < 1) return PAPER[1];
      // its heading's rule, its lines (the words gone off them)
      if (rz > 17.4 && rz < 18.2 && Math.abs(a) < 5.5) return PAPER[1];
      if (rz > 6 && rz < 15.5 && fr(rz / 2.4) < 0.24 && Math.abs(a) < 7) return PAPER[3];
      return a < -6 || rz > 21 ? PAPER[3] : PAPER[4];
    }, 3);
    // the seal: wine wax pressed with the crown, two ribbons under it
    for (const s of [-1, 1]) panel(S, w, s > 0 ? 0.2 : -2.2, s > 0 ? 2.2 : -0.2, Z - 16.5, Z - 10.6, 1.0, (a, z) => (Math.abs(a - s * 1.2) < 1 - (Z - 10.6 - z) * 0.05 && !(z < Z - 15 && Math.abs(fr(a) - 0.5) < 0.3) ? WINE[s > 0 ? 2 : 3] : null), 4);
    S.egg(w(0, 1.2, Z - 10.4), [A, B, [0, 0, 1]], [2.6, 0.7, 2.4], (n, p) => {
      const [a, , z] = onFace(w, p);
      return Math.hypot(a, z - Z + 10.4) < 1.2 ? WINE[1] : toneAt(n, WINE, 0.15);
    }, 5);
  };
}

/**
 * THE ORDER'S MASK OVER THE CREST: the royal crest carved in the palace's pale stone (a shield with the crown on it in
 * relief, a carved crown over it), and nailed over its foot the Silent Order's blank white mask with no mouth, on a black
 * ribbon, two streamers of black crape hanging from the nail: the Order that opened the High City to the Hush.
 */
function maskOverCrest(): WallMake {
  return (S, w) => {
    const Z = 50;
    const [A, B] = faceAxes(w);
    const TOP = Z + 12;
    const shield = (a: number, z: number): boolean => {
      // a heater shield: straight top, sides curving in to its point
      const t = (TOP - z) / 28;
      if (t < 0 || t > 1) return false;
      return Math.abs(a) < 11 * (t < 0.42 ? 1 : Math.sqrt(Math.max(0, 1 - ((t - 0.42) / 0.58) ** 2)));
    };
    // the shield, standing out of the face: its rim lit on its upper left, in shade on its lower right; the crown on it in relief
    panel(S, w, -11.5, 11.5, TOP - 29, TOP + 0.5, 2.4, (a, z) => {
      if (!shield(a, z)) return null;
      if (!shield(a - 1.3, z + 1.3)) return PALACE[4];
      if (!shield(a + 1.3, z - 1.3)) return PALACE[1];
      if (!shield(a - 2.6, z + 2.6) || !shield(a + 2.6, z - 2.6)) return PALACE[2];
      const t = markTone('king', a / 6.4, (z - (TOP - 9)) / 6.4, 0.2);
      if (t >= 0) return PALACE[t === 0 ? 1 : t === 4 ? 4 : t === 1 ? 1 : 3];
      return PALACE[2];
    }, 1);
    // its thickness out of the wall, at its sides
    for (const s of [-1, 1]) panel(S, w, s * 11 - 0.5, s * 11 + 0.5, TOP - 12, TOP, 1.2, () => PALACE[1], 1);
    // a carved crown over it
    faceBox(S, w, 0, 1.4, TOP + 1.6, 7, 1.4, 1.4, PALACE, 2);
    for (const k of [-2, -1, 0, 1, 2]) {
      S.rod(w(k * 3.2, 1.4, TOP + 2.6), w(k * 3.2, 1.4, TOP + 6 - Math.abs(k) * 0.8), 1.2, 0.55, PALACE, 2);
      S.ball(w(k * 3.2, 1.4, TOP + 6.9 - Math.abs(k) * 0.8), 1, PALACE, 2);
    }
    // the nail, the black ribbon to the mask, the crape's two streamers hanging from the nail
    const nail = TOP - 15;
    S.ball(w(0, 3.8, nail), 0.75, IRON, 5);
    for (const s of [-1, 1]) {
      S.rod(w(0, 3.8, nail), w(s * 4.8, 4.2, nail - 3), 0.45, 0.45, BLACK, 6);
      S.quad([w(s * 1, 3.6, nail), w(s * 3.2, 3.6, nail), w(s * 6.2, 3.9, nail - 22), w(s * 3.6, 3.9, nail - 21)], (u, v) => (v > 0.88 && u > 0.5 ? null : u < 0.3 ? BLACK[3] : BLACK[1]), 6);
    }
    // the mask: dead white, two dark eyes, no mouth
    S.egg(w(0, 4.4, nail - 7), [A, B, [0, 0, 1]], [5.4, 1.6, 7], (n, p) => {
      const [a, , z] = onFace(w, p);
      for (const s of [-1, 1]) if (inEll(a, z, s * 2.2, nail - 5.6, 1.4, 0.9)) return BLACK[0];
      return toneAt(n, MASK, 0.15);
    }, 7);
  };
}

/**
 * A PALACE DOOR: tall double doors painted ivory, their panels moulded in gilt, under an entablature with the crown over it,
 * between pilasters of the palace's stone. Shut; open (the leaves swung in, the dark beyond); or sealed by the Order: a black
 * chain through its handles, a lock, the blank mask nailed over the meeting of its leaves.
 */
function palaceDoor(state: 'shut' | 'open' | 'sealed'): WallMake {
  return (S, w) => {
    const HW = 14.5;
    const HT = 64;
    // the pilasters: a base, a fluted shaft, a capital
    for (const s of [-1, 1]) {
      const a = s * (HW + 3.4);
      faceBox(S, w, a, 1.4, 3, 3.6, 1.4, 3, PALACE, 1);
      faceBox(S, w, a, 1.1, (HT + 6) / 2 + 3, 2.8, 1.1, (HT - 6) / 2 + 3, PALACE, 1, (u, v, n) => toneAt(n, PALACE, Math.abs(fr(v * 3) - 0.5) < 0.12 ? -0.45 : 0.05));
      faceBox(S, w, a, 1.6, HT + 4.5, 3.8, 1.6, 1.5, PALACE, 1);
    }
    // the entablature, its cornice lit; the crown over it on a little plinth
    faceBox(S, w, 0, 1.8, HT + 8, HW + 7.5, 1.8, 2, PALACE, 2, (u, v, n) => toneAt(n, PALACE, u > 0.7 ? 0.3 : Math.abs(fr(v * 12) - 0.5) < 0.1 ? -0.4 : -0.05));
    faceBox(S, w, 0, 2.4, HT + 10.6, HW + 8.5, 2.4, 0.6, PALACE, 2);
    faceBox(S, w, 0, 1.2, HT + 12.5, 5, 1.2, 1.3, PALACE, 3);
    const [A, B] = faceAxes(w);
    S.egg(w(0, 1.4, HT + 15), [A, B, [0, 0, 1]], [4.6, 1.4, 1.6], (n) => toneAt(n, GILT, 0.05), 4);
    for (const k of [-2, -1, 0, 1, 2]) {
      S.rod(w(k * 1.9, 1.4, HT + 15.5), w(k * 2.1, 1.4, HT + 19.5 - Math.abs(k) * 0.9), 0.75, 0.3, GILT, 4);
      S.ball(w(k * 2.1, 1.4, HT + 20.2 - Math.abs(k) * 0.9), 0.7, GILT, 4);
    }
    // the doorway's dark
    panel(S, w, -HW, HW, 0, HT, 0.2, () => HOLE, 5);
    // the leaves: three panels each, moulded in gilt; a handle each by the middle
    const leaf = (side: number, id: number): void => {
      const hinge = side * HW;
      const ang = state === 'open' ? 1.3 : 0;
      const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.6 - Math.abs(a - hinge) * Math.sin(ang), z);
      const a0 = side < 0 ? -HW : 0;
      const a1 = side < 0 ? 0 : HW;
      S.quad([P(a0, 0), P(a1, 0), P(a1, HT), P(a0, HT)], (u, v) => {
        const a = (side < 0 ? u : 1 - u) * HW; // from its outer edge in
        const z = v * HT;
        const panels: [number, number][] = [[5, 21], [25, 47], [51, 60]];
        for (const [p0, p1] of panels) {
          if (z > p0 && z < p1 && a > 2.6 && a < HW - 2.6) {
            const e = Math.min(a - 2.6, HW - 2.6 - a, z - p0, p1 - z);
            if (e < 0.9) return a - 2.6 < 0.9 || p1 - z < 0.9 ? GILT[4] : GILT[2];
            if (e < 1.7) return IVORY[1];
            return state === 'open' ? IVORY[2] : IVORY[3];
          }
        }
        if (a > HW - 0.8) return IVORY[1];
        return state === 'open' ? IVORY[1] : a < 1.2 ? IVORY[4] : IVORY[3];
      }, id);
      if (state !== 'open') S.rod(P(side * 1.6, 30), P(side * 1.6, 37), 0.55, 0.55, GILT, id + 1);
    };
    leaf(-1, 6);
    leaf(1, 8);
    if (state === 'sealed') {
      // the chain looped through both handles, the lock hanging off it; the mask nailed over the leaves' meeting
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const a = -2 + 4 * t;
        S.ball(w(a, 1.6, 33.5 - 3.2 * Math.sin(t * Math.PI)), 0.75, IRON, 10);
      }
      faceBox(S, w, 0.4, 2.2, 28.6, 1.5, 0.9, 1.8, IRON, 11);
      S.egg(w(0, 1.7, 47), [A, B, [0, 0, 1]], [4.4, 1.2, 5.8], (n, p) => {
        const [a, , z] = onFace(w, p);
        for (const s of [-1, 1]) if (inEll(a, z, s * 1.8, 48.2, 1.1, 0.7)) return BLACK[0];
        return toneAt(n, MASK, 0.15);
      }, 12);
      S.ball(w(0, 2.6, 52.4), 0.5, IRON, 13);
    }
  };
}

// =================================================================================================
// OUT ON THE HILL: lamps, railings, a sentry box, a statue, a fountain, the coach

/** A FLAME of honest fire on a wick at `c` (a few pixels, drawn over all): a teardrop, its heart the brightest, its tip leaning as it flickers (two frames). */
function flame(S: Scene, c: V3, f: number, tall = 3): void {
  const [px, py] = S.at(c);
  const X = Math.round(px);
  const Y = Math.round(py);
  const lean = f % 2 ? 1 : 0;
  const h = tall + (f % 2 ? 0 : 1);
  S.put(X - 1, Y, 1e4, EMBER[2], 90);
  S.put(X, Y, 1e4, EMBER[3], 90);
  for (let k = 1; k < h; k++) {
    const top = k === h - 1;
    const x = k > h / 2 ? X - lean : X;
    if (!top) S.put(x - 1, Y - k, 1e4, k > 2 ? EMBER[2] : EMBER[3], 90);
    S.put(x, Y - k, 1e4, top ? EMBER[2] : k < 3 ? EMBER[4] : EMBER[3], 90);
  }
}

/**
 * A GILT LAMP POST of the palace's courts: a stepped stone foot, a fluted iron post painted black-green with gilt collars, a
 * capital, and a lantern of four tapering panes in a gilt frame under a roof crowned with a small crown, its honest flame
 * within (two frames). 70 x 170 at (35, 150).
 */
function lampPost(f: number): Sprite {
  const S = scene(70, 170, 35, 150);
  slab(S, -6.5, -6.5, 6.5, 6.5, 0, 3, PALACE, 1, 0.05);
  slab(S, -5, -5, 5, 5, 3, 6, PALACE, 1, 0.1);
  cylinder(S, 0, 0, (z) => 4.2 - (z - 6) * 0.25, 6, 14, (n) => toneAt(n, PAINTED, 0.05), 2, () => PAINTED[3]);
  cylinder(S, 0, 0, (z) => 2.1 - (z - 14) * 0.004, 14, 96, (n, a) => toneAt(n, PAINTED, fr((a / (Math.PI * 2)) * 10) < 0.3 ? -0.35 : 0.1), 3);
  for (const z of [26, 92]) cylinder(S, 0, 0, 2.9, z, z + 2, (n) => toneAt(n, GILT, 0.1), 4, () => GILT[3]);
  cylinder(S, 0, 0, (z) => 2.1 + (z - 96) * 0.55, 96, 101, (n) => toneAt(n, GILT, 0), 4, () => GILT[2]);
  // the lantern: four panes, wider at their tops; a gilt rod at each corner; its flame
  const Lz0 = 101;
  const Lz1 = 117;
  const R0 = 3.6;
  const R1 = 5.4;
  const corner = (k: number, z: number): V3 => {
    const r = R0 + ((z - Lz0) / (Lz1 - Lz0)) * (R1 - R0);
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    return [Math.cos(a) * r * Math.SQRT2, Math.sin(a) * r * Math.SQRT2, z];
  };
  for (let k = 0; k < 4; k++) {
    const q: [V3, V3, V3, V3] = [corner(k, Lz0), corner(k + 1, Lz0), corner(k + 1, Lz1), corner(k, Lz1)];
    const mid = lerp3(lerp3(q[0], q[1], 0.5), lerp3(q[2], q[3], 0.5), 0.5);
    const n = norm3([mid[0], mid[1], 0.2]);
    S.quad(q, (u, v) => {
      // the glass: the flame's warmth in it, its middle brightest; a mullion across
      if (Math.abs(v - 0.55) < 0.05) return toneAt(n, GILT, 0);
      const d = Math.abs(u - 0.5) + Math.abs(v - 0.4) * 0.7;
      return d < 0.18 ? EMBER[3] : d < 0.36 ? EMBER[2] : EMBER[1];
    }, 5);
  }
  for (let k = 0; k < 4; k++) S.rod(corner(k, Lz0 - 0.5), corner(k, Lz1 + 0.5), 0.6, 0.6, GILT, 6);
  // the flame within (seen through the near panes)
  flame(S, [0, 0, 107], f, 4);
  // its roof: four sloping faces to a neck; the crown on it
  for (let k = 0; k < 4; k++) {
    const e0 = corner(k, Lz1 + 0.6);
    const e1 = corner(k + 1, Lz1 + 0.6);
    const out0 = mul3([e0[0], e0[1], 0], 1.18);
    const out1 = mul3([e1[0], e1[1], 0], 1.18);
    const q: [V3, V3, V3, V3] = [[out0[0], out0[1], Lz1 + 0.6], [out1[0], out1[1], Lz1 + 0.6], [e1[0] * 0.3, e1[1] * 0.3, Lz1 + 6], [e0[0] * 0.3, e0[1] * 0.3, Lz1 + 6]];
    const mid = lerp3(q[0], q[2], 0.5);
    const n = norm3([mid[0], mid[1], 1.4]);
    S.quad(q, (u, v) => (v < 0.15 ? GILT[3] : toneAt(n, PAINTED, Math.abs(u - 0.5) < 0.06 ? 0.4 : 0.1)), 7);
  }
  cylinder(S, 0, 0, 2.2, Lz1 + 5.5, Lz1 + 7.2, (n) => toneAt(n, GILT, 0.1), 8, () => GILT[3]);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    S.rod([Math.cos(a) * 2, Math.sin(a) * 2, Lz1 + 7], [Math.cos(a) * 2.4, Math.sin(a) * 2.4, Lz1 + 10], 0.6, 0.25, GILT, 8);
  }
  S.ball([0, 0, Lz1 + 10.5], 1.1, GILT, 8);
  return done(S, 35, 150, [{ at: [0, 0, 108], r: 36 + f * 3, color: EMBER[2], a: 0.42 }]);
}

/**
 * PALACE RAILINGS, a tile of them: a plinth of the palace's stone, iron bars painted black-green rising to gilt spear-heads,
 * rails top and foot, the King's crown in gilt on a medallion at the middle. With `mask`: the Silent Order's blank mask tied
 * on the bars by its black ribbon, a black rag knotted under it. Along x (`k` 0) or along y (1). 100 x 110 at (50, 80).
 */
function railings(k: number, mask: boolean): Sprite {
  const S = turned(scene(100, 110, 50, 80), k);
  slab(S, -20, -3, 20, 3, 0, 6, PALACE, 1, 0.05);
  slab(S, -20.5, -3.5, 20.5, 3.5, 6, 7.5, PALACE, 1, 0.25);
  for (let i = 0; i < 10; i++) {
    const x = -18 + i * 4;
    S.rod([x, 0, 7.5], [x, 0, 44], 0.6, 0.6, PAINTED, 2);
    // the spear-head: a collar, a leaf of gilt to a point
    S.ball([x, 0, 44.3], 0.8, GILT, 3);
    S.egg([x, 0, 46.6], AX3, [1, 0.5, 1.9], (n) => toneAt(n, GILT, 0.15), 3);
    S.rod([x, 0, 48], [x, 0, 50], 0.6, 0.1, GILT, 3);
  }
  for (const z of [10, 39]) S.rod([-20, 0, z], [20, 0, z], 0.7, 0.7, PAINTED, 4);
  // between the rails at the foot, a row of small scrolls
  for (let i = 0; i < 9; i++) {
    const x = -16 + i * 4;
    for (let j = 0; j < 9; j++) {
      const t = (j / 9) * Math.PI * 2;
      S.ball([x + Math.cos(t) * 1.4 * (1 - j / 14), 0, 13 + Math.sin(t) * 1.6 * (1 - j / 14)], 0.35, PAINTED, 5);
    }
  }
  // the medallion: a gilt ring with the crown in it, on the middle bars
  const mz = 27;
  S.egg([0, 0.4, mz], AX3, [5.6, 0.7, 5.6], (n, w) => {
    const p = local(S, w);
    const r = Math.hypot(p[0], p[2] - mz);
    if (r > 4.4) return toneAt(n, GILT, 0.2);
    const t = markTone('king', p[0] / 3.6, (p[2] - mz) / 3.6, 0.8 / 3.6);
    return t >= 0 ? GILT[t] : PAINTED[1];
  }, 6);
  if (mask) {
    // the ribbon tied round two bars, the mask on it, a rag knotted under
    for (const x of [-6, -2]) S.rod([x - 0.4, 1, 41], [x + 0.4, 1, 39], 0.5, 0.5, BLACK, 7);
    S.rod([-6, 1.2, 40], [-4, 1.6, 36], 0.4, 0.4, BLACK, 7);
    S.rod([-2, 1.2, 40], [-4, 1.6, 36], 0.4, 0.4, BLACK, 7);
    S.egg([-4, 2, 31.5], AX3, [4.2, 1.2, 5.4], (n, w) => {
      const p = local(S, w);
      for (const s of [-1, 1]) if (inEll(p[0], p[2], -4 + s * 1.7, 32.6, 1.05, 0.7)) return BLACK[0];
      return toneAt(n, MASK, 0.15);
    }, 8);
    S.quad([[6, 1, 41], [10, 1, 40.5], [11, 1.4, 26], [7, 1.4, 29]], (u, v) => (v > 0.8 && fr(u * 3) > 0.5 ? null : Math.sin(u * 8) > 0.3 ? BLACK[3] : BLACK[1]), 9);
    S.ball([8, 1.4, 40.8], 1, BLACK, 9);
  }
  return done(S, 50, 80);
}

/**
 * A SENTRY BOX at the palace's gates, its guard gone: a narrow box of boards painted in the royal wine and ivory in broad
 * stripes, its front open on the dark inside, the King's crown painted over the opening, a pyramid roof of slate with a
 * gilt finial; a halberd left leaning by it. Its opening to +y (`k` 0) or to +x (1). 100 x 150 at (50, 110).
 */
function sentryBox(k: number): Sprite {
  const S = turned(scene(100, 150, 50, 110), k);
  const H = 62;
  const stripe = (along: number): boolean => fr((along + 11) / 5.5) < 0.5;
  slab(S, -12.5, -12.5, 12.5, 15, 0, 2, PALACE, 1, 0.05);
  S.box([0, 0, H / 2 + 2], AX3, [11, 11, H / 2], (f, u, v, n) => {
    // (its stripes run up it, the royal wine and ivory; a band of ivory at its foot and its head)
    if (f === 4) return toneAt(n, IVORY, 0);
    const [al, uu] = sideUV(f, u, v);
    const along = al * 11;
    const up = uu * H;
    if (up < 3 || up > H - 3) return toneAt(n, IVORY, up > H - 3 ? 0.3 : -0.2);
    const R = stripe(along) ? WINE : IVORY;
    return toneAt(n, R, fr((along + 11) / 5.5) < 0.06 || Math.abs(fr((along + 11) / 5.5) - 0.5) < 0.06 ? -0.3 : 0.05);
  }, 2);
  // the opening on its front: the dark inside, a sill, the crown over it
  S.quad([[-6.5, 11.05, 4], [6.5, 11.05, 4], [6.5, 11.05, 50], [-6.5, 11.05, 50]], (u, v) => {
    // the inside: dark, its back wall a little lit at its top
    const top = v > 0.92;
    const arch = v > 0.86 && Math.abs(u - 0.5) > 0.5 - (v - 0.86) * 3.5;
    if (arch) return null;
    return top ? '#1c1820' : u < 0.2 ? '#141018' : HOLE;
  }, 3);
  S.quad([[-6.5, 11.1, 4], [6.5, 11.1, 4], [6.5, 13, 4], [-6.5, 13, 4]], () => PALACE[3], 3);
  S.quad([[-5.5, 11.15, 52], [5.5, 11.15, 52], [5.5, 11.15, 61], [-5.5, 11.15, 61]], (u, v) => {
    const t = markTone('king', (u - 0.5) * 2.2, (v - 0.5) * 2.2, 0.28);
    if (t >= 0) return GILT[t];
    return u < 0.06 || u > 0.94 || v < 0.08 || v > 0.92 ? GILT[2] : ROYALBLUE[2];
  }, 4);
  // the roof: its eaves out over the walls, four slopes of slate to a gilt finial
  slab(S, -13, -13, 13, 13, H + 2, H + 3.6, GILT, 5, -0.1);
  const ap: V3 = [0, 0, H + 22];
  const E = 13.2;
  const eave: V3[] = [[-E, -E, H + 3.6], [E, -E, H + 3.6], [E, E, H + 3.6], [-E, E, H + 3.6]];
  for (let i = 0; i < 4; i++) {
    const a = eave[i];
    const b = eave[(i + 1) % 4];
    const mid = lerp3(lerp3(a, b, 0.5), ap, 0.3);
    const n = facing(S, norm3([mid[0], mid[1], 13]));
    S.quad([a, b, ap, ap], (u, v) => (fr(v * 6) < 0.12 ? toneAt(n, SLATE, -0.5) : toneAt(n, SLATE, Math.abs(u - 0.5) < 0.04 ? 0.3 : 0.05)), 6);
  }
  S.ball([0, 0, H + 23], 1.8, GILT, 7);
  S.rod([0, 0, H + 24], [0, 0, H + 29], 0.6, 0.1, GILT, 7);
  // the halberd: an ash shaft, its axe-blade and spike, leaning against its front's left
  S.rod([-15.5, 15.5, 0], [-12.5, 12.6, 60], 0.75, 0.7, ['#2a2014', '#3e3020', '#56442e', '#6e5a3e', '#86704e'], 8);
  const top: V3 = [-12.6, 12.7, 58];
  S.quad([add3(top, [0.8, 0.6, -10]), add3(top, [0.8, 0.6, -1]), add3(top, [-3.2, 4.6, -3]), add3(top, [-3.6, 5, -9])], (_u, v) => (v > 0.8 ? IRON[4] : IRON[3]), 9);
  S.rod(add3(top, [0, 0, 0]), add3(top, [-0.2, 0, 8]), 0.7, 0.1, IRON, 9);
  return done(S, 50, 110);
}

/**
 * A MARBLE STATUE OF A ROYAL: a king of the house, larger than life, on a plinth whose plaque is blank: crowned, bearded, in a
 * long robe belted at the waist, an ermine cape on his shoulders and a cloak hanging behind; his right hand raising the
 * sceptre high, his left on the pommel of a sword grounded before him; and tied across his mouth by the Order, a band of
 * black cloth, its ends hanging. 110 x 180 at (55, 150).
 */
function statue(): Sprite {
  const S = scene(110, 180, 55, 150);
  const vein = (n: V3, w: V3, b = 0): string => (Math.abs(Math.sin(w[0] * 0.7 + w[2] * 0.33 + Math.sin(w[1] * 0.5) * 2)) < 0.05 ? toneAt(n, MARBLE, b - 0.45) : toneAt(n, MARBLE, b));
  // the plinth: a base, a die with its blank plaque, a cornice
  slab(S, -12, -12, 12, 12, 0, 4, MARBLE, 1, 0);
  S.box([0, 0, 13], AX3, [9, 9, 9], (f, u, v, n) => {
    if (f < 4) {
      const [al, up] = sideUV(f, u, v);
      if (Math.abs(al) < 0.62 && up > 0.24 && up < 0.76) {
        // the plaque: a sunk panel, its words gone
        const e = Math.min(0.62 - Math.abs(al), up - 0.24, 0.76 - up);
        return e < 0.06 ? toneAt(n, MARBLE, -0.6) : toneAt(n, MARBLE, -0.15);
      }
    }
    return toneAt(n, MARBLE, 0.05);
  }, 2);
  slab(S, -11, -11, 11, 11, 22, 25, MARBLE, 3, 0.1);
  const Z = 25;
  // the cloak, hanging behind him from his shoulders to the plinth, wider than he is
  S.egg([0, -3.4, Z + 17], AX3, [9.6, 4.6, 18.5], (n, w) => (w[1] < -1.6 ? vein(n, w, -0.12) : null), 4, (w) => w[2] >= Z && w[2] <= Z + 34);
  // the robe: spread on the plinth, narrowing to his belted waist, its folds
  cylinder(S, 0, 0.4, (z) => 8.4 - ((z - Z) / 22) * 3.2, Z, Z + 22, (n, a, z) => vein(n, [Math.cos(a) * 8, Math.sin(a) * 8, z], fr((a / (Math.PI * 2)) * 10) < 0.26 ? -0.32 : 0.08), 5);
  cylinder(S, 0, 0.4, 5.5, Z + 21.6, Z + 23.4, (n) => toneAt(n, MARBLE, -0.2), 6);
  // his chest and shoulders; the ermine cape over them, flecked
  S.egg([0, 0.3, Z + 29], AX3, [6.2, 4.4, 7.4], (n, w) => vein(n, w, 0.05), 7);
  S.egg([0, 0, Z + 33.2], AX3, [7.6, 5.6, 3.2], (n, w) => (hash(Math.floor(w[0] * 0.9), Math.floor(w[2] * 0.9 + w[1] * 0.5), 9201) < 0.12 ? toneAt(n, MARBLE, -0.55) : toneAt(n, MARBLE, 0.18)), 8);
  // his head, the black band across his mouth, his beard under it, the crown
  cylinder(S, 0, 0.4, 2, Z + 34, Z + 37, (n) => toneAt(n, MARBLE, 0), 9);
  S.egg([0, 0.5, Z + 40.4], AX3, [3.4, 3.6, 4.2], (n, w) => vein(n, w, 0.05), 9);
  S.egg([0, 1.9, Z + 36.8], AX3, [2.4, 1.7, 1.9], (n, w) => (fr(w[0] * 0.9) < 0.3 ? toneAt(n, MARBLE, -0.25) : toneAt(n, MARBLE, 0.05)), 10);
  S.egg([0, 0.5, Z + 39.1], AX3, [3.75, 3.95, 0.95], (n) => toneAt(n, BLACK, 0.35), 11);
  tube(S, [[-2, -2.8, Z + 39], [-3.2, -4.4, Z + 35], [-3.6, -4.6, Z + 31.5]], 0.6, 0.45, BLACK, 11);
  cylinder(S, 0, 0.5, 3.5, Z + 43.6, Z + 45.6, (n) => toneAt(n, MARBLE, 0.15), 12, () => MARBLE[3]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    S.rod([Math.cos(a) * 3.3, 0.5 + Math.sin(a) * 3.3, Z + 45.4], [Math.cos(a) * 3.7, 0.5 + Math.sin(a) * 3.7, Z + 49], 0.8, 0.3, MARBLE, 12);
    S.ball([Math.cos(a) * 3.7, 0.5 + Math.sin(a) * 3.7, Z + 49.4], 0.55, MARBLE, 12);
  }
  // his right arm raised, the hand round the sceptre held high; its orb and cross
  tube(S, curve([[5.6, 0, Z + 32], [8.6, 1.4, Z + 36], [8.6, 2.4, Z + 42.4]], 4), 2, 1.5, MARBLE, 13);
  S.egg([8.4, 2.6, Z + 43.4], AX3, [1.5, 1.5, 1.7], (n) => toneAt(n, MARBLE, 0.12), 13);
  S.rod([8.4, 2.7, Z + 33], [8.4, 2.7, Z + 57], 0.75, 0.65, MARBLE, 14);
  S.ball([8.4, 2.7, Z + 58.4], 1.6, MARBLE, 14);
  S.rod([8.4, 2.7, Z + 59.6], [8.4, 2.7, Z + 63], 0.5, 0.5, MARBLE, 14);
  S.rod([7.2, 2.7, Z + 61.8], [9.6, 2.7, Z + 61.8], 0.5, 0.5, MARBLE, 14);
  // his left arm down, the hand on the pommel of the sword grounded before him
  tube(S, curve([[-5.6, 0, Z + 32], [-7.4, 1.8, Z + 26], [-3.2, 6.4, Z + 22.6]], 4), 2, 1.6, MARBLE, 15);
  S.egg([-2, 7.4, Z + 22.2], AX3, [1.7, 1.5, 1.6], (n) => toneAt(n, MARBLE, 0.12), 15);
  S.ball([-1, 9.4, Z + 21.2], 1.2, MARBLE, 16);
  S.rod([-1, 9.4, Z + 20.2], [-1, 9.4, Z + 17.6], 0.75, 0.75, MARBLE, 16);
  S.rod([-4.6, 9.4, Z + 17.2], [2.6, 9.4, Z + 17.2], 0.8, 0.8, MARBLE, 16);
  S.quad([[-2.1, 9.6, Z + 16.8], [0.1, 9.6, Z + 16.8], [-1, 9.8, Z + 0.4], [-1, 9.8, Z + 0.4]], (u) => (u < 0.5 ? MARBLE[4] : MARBLE[2]), 16);
  return done(S, 55, 150);
}

/**
 * THE FOUNTAIN OF THE FOUR ROYALS: a basin of four lobes in white marble, its water still (it no longer plays); in it a
 * pedestal, on each of its four faces a royal's mark inlaid in that royal's colours; on it a shallow bowl, the crown on a
 * cushion over all. Two tiles across. Seen from before (the Princess's and the Prince's faces: `k` 0) or from behind (the
 * Queen's and the King's: 2). 180 x 180 at (90, 128).
 */
function fountain(k: number): Sprite {
  const S = turned(scene(180, 180, 90, 128), k);
  const R = (a: number): number => 34 + 5 * Math.cos(4 * a) ** 2 - 2;
  prism(S, 0, 0, R, 0, 11, (n, a, z) => toneAt(n, MARBLE, (z < 2 ? -0.3 : 0) + (Math.abs(fr((a / (Math.PI * 2)) * 16) - 0.5) < 0.04 ? -0.4 : 0.05)), 1, (a, rr) => {
    const rim = rr > 0.84;
    if (rim) return rr > 0.95 ? MARBLE[4] : MARBLE[3];
    // the water: still, the sky's one colour in it, a line of light here and there
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (hash(Math.floor((x - y) * 14), Math.floor((x + y) * 9), 9301) > 0.93) return STILL[3];
    return rr > 0.78 ? STILL[1] : STILL[2];
  });
  // the pedestal: a sunk panel on each face, a royal's mark in it
  const faces: Royal[] = ['princess', 'prince', 'queen', 'king'];
  S.box([0, 0, 24], AX3, [8, 8, 14], (f, u, v, n) => {
    if (f >= 4) return toneAt(n, MARBLE, 0.2);
    // (f 0: +x, the Prince's; f 1: -x, the King's; f 2: +y, the Princess's; f 3: -y, the Queen's)
    const r = f === 2 ? faces[0] : f === 0 ? faces[1] : f === 3 ? faces[2] : faces[3];
    const L = ROYAL_LOOK[r];
    // (in world units: along the side 8 either way, up it 28 from the basin's rim)
    const [al, up] = sideUV(f, u, v);
    const a = al * 8;
    const zz = up * 28 - 15;
    if (Math.abs(zz) < 10.5 && Math.abs(a) < 6.6) {
      if (Math.abs(zz) > 9.6 || Math.abs(a) > 5.8) return toneAt(n, MARBLE, -0.5);
      const t = markTone(r, (READS[f] * a) / 5.4, zz / 6.4, 0.2);
      if (t >= 0) return L.mark[t];
      return L.field[2];
    }
    return toneAt(n, MARBLE, Math.abs(a) > 7.2 ? 0.2 : 0);
  }, 2);
  slab(S, -9.5, -9.5, 9.5, 9.5, 10.5, 12.5, MARBLE, 3, 0.1);
  slab(S, -9.8, -9.8, 9.8, 9.8, 38, 40.5, MARBLE, 3, 0.15);
  // the bowl on its stem, still water in it
  cylinder(S, 0, 0, (z) => 2.4 + Math.max(0, z - 43) * 1.9, 40.5, 47, (n) => toneAt(n, MARBLE, 0.05), 4, (_a, rr) => (rr > 0.88 ? MARBLE[4] : STILL[2]));
  // the crown on its cushion
  S.egg([0, 0, 49.5], AX3, [4.4, 4.4, 2.6], (n) => toneAt(n, WINE, 0.1), 5);
  crownAt(S, [0, 0, 51.4], 3.4, 6);
  return done(S, 90, 128);
}

/** A CROWN standing at `c`, `r` across its band: a band of gilt, five points each with its pearl, an orb on top. */
function crownAt(S: Scene, c: V3, r: number, id: number): void {
  cylinder(S, c[0], c[1], r, c[2], c[2] + r * 0.8, (n, _a, z) => toneAt(n, GILT, Math.abs(z - c[2] - r * 0.4) < r * 0.12 ? -0.3 : 0.12), id, () => GILT[1]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 4;
    const p: V3 = [c[0] + Math.cos(a) * r * 0.92, c[1] + Math.sin(a) * r * 0.92, c[2] + r * 0.7];
    S.rod(p, [p[0] + Math.cos(a) * r * 0.12, p[1] + Math.sin(a) * r * 0.12, p[2] + r * 0.9], r * 0.36, r * 0.16, GILT, id);
    S.ball([p[0] + Math.cos(a) * r * 0.14, p[1] + Math.sin(a) * r * 0.14, p[2] + r * 1.05], r * 0.24, GILT, id);
  }
  S.ball([c[0], c[1], c[2] + r * 1.2], r * 0.34, GILT, id);
}

/** A WHEEL of a coach: its rim, its spokes, its hub of gilt; `face` the way its outer side looks. */
function wheel(S: Scene, c: V3, face: V3, R: number, id: number): void {
  const F = norm3(face);
  const A = norm3([F[1], -F[0], 0]);
  const B = cross3(F, A);
  S.egg(c, [F, A, B], [1.5, R, R], (n, w0) => {
    const q = sub3(local(S, w0), c);
    const a = dot3(q, A);
    const b = dot3(q, B);
    const r = Math.hypot(a, b);
    if (r > R - 2.4) return r > R - 0.9 ? IRON[2] : toneAt(n, WINE, b > 0 ? 0.25 : -0.15);
    if (r < 2.6) return r < 1.2 ? GILT[4] : toneAt(n, GILT, 0.1);
    if (Math.abs(fr((Math.atan2(b, a) / (Math.PI * 2)) * 12) - 0.5) > 0.4) return toneAt(n, WINE, 0.05);
    return null;
  }, id);
}

/**
 * A ROYAL COACH, ABANDONED: the state coach left in the forecourt when the gates shut, its horses gone: a body painted the
 * royal wine, its upper half boxed with great windows framed in gilt, its lower half bowed under like a boat, the crown on
 * its door panels, hung on its springs between great wheels; its near door hanging open on the dark inside; a gilt rail
 * round its roof and the crown on it; the coachman's seat up in front; its lamps; its pole down on the ground. Its pole to
 * +y (`k` 0) or to +x (1). 220 x 200 at (110, 140).
 */
function coach(k: number): Sprite {
  // (built half as big again as it is measured: a state coach stands well over a man's head)
  const S = turned(scene(220, 200, 110, 140), k, 1.45);
  // the wheels, the axles, the perch under the body, its springs
  for (const s of [-1, 1]) {
    wheel(S, [s * 15, -20, 14], [s, 0, 0], 14, 1 + (s > 0 ? 1 : 0));
    wheel(S, [s * 14, 18, 10], [s, 0, 0], 10, 3 + (s > 0 ? 1 : 0));
  }
  S.rod([-15, -20, 14], [15, -20, 14], 1, 1, IRON, 5);
  S.rod([-14, 18, 10], [14, 18, 10], 1, 1, IRON, 5);
  S.rod([0, -22, 14], [0, 20, 11], 1.4, 1.4, WINE, 6);
  for (const y of [-20, 15]) for (const s of [-1, 1]) tube(S, curve([[s * 6, y, 13], [s * 8.5, y + (y < 0 ? -3 : 3), 18], [s * 7.5, y + (y < 0 ? 0 : 0), 24]], 4), 0.9, 0.9, GILT, 7);
  const Y0 = -18.5;
  const Y1 = 14.5;
  const YM = (Y0 + Y1) / 2;
  const HL = (Y1 - Y0) / 2;
  const ZW = 32;
  // the lower body: bowed under like a boat's hull, its waist moulded in gilt, the crown on its side
  S.egg([0, YM, ZW], AX3, [10, HL, 9.5], (n, w0) => {
    const w = local(S, w0);
    const z = w[2] - ZW;
    if (z > -1.4) return toneAt(n, GILT, 0.25);
    if (Math.abs(w[0]) > 5 && Math.abs(w[1] - YM + 3) < 4 && z > -8.5 && z < -2) {
      const t = markTone('king', (w[1] - YM + 3) / 3.4, (z + 5.2) / 3.4, 0.3);
      if (t >= 0) return GILT[t];
    }
    return toneAt(n, WINE, fr((w[1] - YM) * 0.16) < 0.05 ? -0.35 : 0);
  }, 8, (w) => local(S, w)[2] <= ZW + 0.2);
  // the upper body: boxed, its corners posts of gilt, its great windows dark in gilt frames
  const ZT = ZW + 13;
  S.box([0, YM, (ZW + ZT) / 2], AX3, [10, HL, (ZT - ZW) / 2], (f, u, v, n) => {
    if (f >= 4) return toneAt(n, WINE, 0.1);
    const [al, up] = sideUV(f, u, v);
    const half = f < 2 ? HL : 10;
    const a = al * half;
    if (Math.abs(a) > half - 1.3 || up > 0.86 || up < 0.1) return toneAt(n, GILT, up > 0.86 ? 0.3 : 0.05);
    if (up > 0.24 && up < 0.8) {
      const panes = f < 2 ? [[-10.2, -4.4], [-2.2, 3.4], [5.6, 11.6]] : [[-7.4, 7.4]];
      for (const [p0, p1] of panes) {
        if (a > p0 - 1 && a < p1 + 1) {
          if (a < p0 || a > p1 || up < 0.3 || up > 0.74) return GILT[a < p0 || up > 0.74 ? 3 : 2];
          return fr((a + up * 16) * 0.22) < 0.1 ? '#3a3448' : '#141220';
        }
      }
    }
    return toneAt(n, WINE, 0);
  }, 9);
  // its near door hanging open: the dark inside where it stood (the middle window's bay), its leaf swung out on its hinge
  const DY0 = -2.2;
  const DY1 = 3.4;
  S.quad([[10.05, DY0, ZW - 7], [10.05, DY1, ZW - 7], [10.05, DY1, ZT - 1.5], [10.05, DY0, ZT - 1.5]], () => HOLE, 10);
  const swing = 1.0;
  const D = (along: number, z: number): V3 => [10.3 + Math.sin(swing) * along, DY1 - Math.cos(swing) * along, z];
  const dn = facing(S, [Math.cos(swing), Math.sin(swing), 0]);
  S.quad([D(0, ZW - 7), D(DY1 - DY0, ZW - 7), D(DY1 - DY0, ZT - 1.5), D(0, ZT - 1.5)], (u, v) => {
    if (u < 0.1 || u > 0.9 || v < 0.05 || v > 0.95) return toneAt(dn, GILT, 0);
    if (v > 0.58 && v < 0.9) return '#141220';
    if (Math.abs(v - 0.3) < 0.15 && Math.abs(u - 0.5) < 0.22) return GILT[2];
    return toneAt(dn, WINE, 0);
  }, 11);
  S.box([12.6, (DY0 + DY1) / 2, ZW - 9], AX3, [1.4, 2.2, 0.4], (_f, _u, _v, n) => toneAt(n, GILT, 0.1), 12);
  // the roof: its lid a little over the body, a gilt rail round it, the crown on it
  slab(S, -10.8, Y0 - 0.8, 10.8, Y1 + 0.8, ZT, ZT + 1.8, WINE, 13, 0.1);
  for (let i = 0; i <= 12; i++) {
    const y = Y0 + 1 + ((Y1 - Y0 - 2) * i) / 12;
    for (const s of [-1, 1]) S.ball([s * 9.4, y, ZT + 3.6], 0.5, GILT, 14);
  }
  for (let i = 0; i <= 6; i++) for (const y of [Y0 + 1, Y1 - 1]) S.ball([-9.4 + (18.8 * i) / 6, y, ZT + 3.6], 0.5, GILT, 14);
  for (const s of [-1, 1]) for (const y of [Y0 + 1, Y1 - 1]) S.rod([s * 9.4, y, ZT + 1.8], [s * 9.4, y, ZT + 3.6], 0.5, 0.5, GILT, 14);
  crownAt(S, [0, YM, ZT + 1.8], 3.6, 15);
  // the coachman's seat up in front on its irons, its cushion; the lamps at the body's front corners
  for (const s of [-1, 1]) tube(S, [[s * 5, 15, 13], [s * 5.5, 20, 25], [s * 5, 22, 31]], 0.7, 0.7, IRON, 16);
  slab(S, -6.5, 19, 6.5, 25, 30, 32, WINE, 17, 0.1);
  S.box([0, 22, 33], AX3, [6.2, 3, 1.1], (f, _u, _v, n) => (f === 4 ? toneAt(n, WINE, 0.2) : toneAt(n, GILT, 0)), 17);
  for (const s of [-1, 1]) {
    S.rod([s * 10, Y1, ZW + 6], [s * 11.2, Y1 + 1.2, ZW + 7], 0.5, 0.5, GILT, 18);
    S.box([s * 11.4, Y1 + 1.6, ZW + 9], AX3, [1.5, 1.5, 2.4], (f, _u, _v, n) => (f >= 4 ? toneAt(n, GILT, 0.1) : '#1e1a26'), 18);
    S.ball([s * 11.4, Y1 + 1.6, ZW + 12.2], 0.9, GILT, 18);
  }
  // the pole, forward and down onto the ground
  S.rod([0, 20, 11], [0, 58, 1.6], 1.3, 1.1, WINE, 19);
  S.ball([0, 58.6, 1.5], 1.4, GILT, 19);
  return done(S, 110, 140);
}

// =================================================================================================
// IN THE PALACE'S ROOMS

/** A VELVET ROPE BARRIER: three brass posts on round feet, their tops knobbed, a rope of wine velvet sagging between them on brass hooks. Along x (`k` 0) or along y (1). 100 x 80 at (50, 56). */
function ropeBarrier(k: number): Sprite {
  const S = turned(scene(100, 80, 50, 56), k);
  const posts = [-17, 0, 17];
  for (const x of posts) {
    S.egg([x, 0, 0.6], AX3, [3.6, 3.6, 1.6], (n) => toneAt(n, GILT, 0.1), 1, (w) => w[2] >= 0);
    cylinder(S, x, 0, (z) => (z < 4 ? 1.4 - (z - 1.5) * 0.15 : z > 22 ? 1.1 + (z - 22) * 0.3 : 0.95), 1.5, 24, (n) => toneAt(n, GILT, 0.05), 2);
    S.ball([x, 0, 26], 1.8, GILT, 3);
  }
  for (let i = 0; i + 1 < posts.length; i++) {
    const a: V3 = [posts[i] + 1.6, 0, 23];
    const b: V3 = [posts[i + 1] - 1.6, 0, 23];
    const pts: V3[] = [];
    for (let j = 0; j <= 10; j++) {
      const t = j / 10;
      pts.push([a[0] + (b[0] - a[0]) * t, 0.4, 23 - 6.5 * Math.sin(t * Math.PI)]);
    }
    tube(S, pts, 1.15, 1.15, WINE, 4);
    for (const p of [a, b]) S.ball(p, 0.8, GILT, 5);
  }
  return done(S, 50, 56);
}

/** Carry a piece built about its own (0, 0, 0) to stand turned `t` about its x axis (tipped back) and moved by `at`. */
type Xf = (p: V3) => V3;
/** Carry a piece built about its own (0, 0, 0) to lie turned `t` about its y axis (fallen on its side) and moved by `at`. */
const tipY = (t: number, at: V3): Xf => (p) => [p[0] * Math.cos(t) + p[2] * Math.sin(t) + at[0], p[1] + at[1], -p[0] * Math.sin(t) + p[2] * Math.cos(t) + at[2]];
const dirOf = (X: Xf) => (d: readonly number[]): V3 => norm3(sub3(X([d[0], d[1], d[2]]), X([0, 0, 0])));

/**
 * A GILT CHAIR of the court: a fauteuil on four cabriole legs, its seat and its oval back upholstered in the royal wine,
 * its frame carved and gilt, its arms padded; its front to +y. Broken: knocked over onto its side, a leg snapped off and
 * lying by it. 90 x 100 at (45, 76).
 */
function giltChair(broken: boolean): Sprite {
  const S = scene(90, 100, 45, 76);
  const X: Xf = broken ? tipY(Math.PI / 2, [-16, -2, 9.6]) : (p) => p;
  const D = dirOf(X);
  const Ax: [V3, V3, V3] = [D([1, 0, 0]), D([0, 1, 0]), D([0, 0, 1])];
  const P = (x: number, y: number, z: number): V3 => X([x, y, z]);
  // the legs: from under the seat out at the knee, in at the ankle, out to the foot
  const legs: [number, number][] = [[-7, 6.5], [7, 6.5], [-6.5, -6], [6.5, -6]];
  legs.forEach(([x, y], i) => {
    if (broken && i === 0) return;
    tube(S, curve([P(x, y, 14), P(x * 1.13, y * 1.15, 10), P(x * 0.96, y * 0.95, 3.4), P(x * 1.06, y * 1.06, 0.7)], 4), 1.15, 0.7, GILT, 1);
  });
  // the seat rail, carved; the cushion
  S.box(P(0, 0.2, 14.8), Ax, [8.2, 7.6, 1.6], (f, u, v, n) => (f === 4 ? toneAt(n, GILT, 0) : toneAt(n, GILT, Math.abs(fr(u * 3 + v * 5) - 0.5) < 0.1 ? -0.3 : 0.1)), 2);
  S.egg(P(0, 0.4, 16.4), Ax, [7.6, 7.1, 2.2], (n) => toneAt(n, WINE, 0.1), 3);
  // the back: two posts curving up to a crest, the oval panel of velvet in its gilt frame
  for (const s of [-1, 1]) tube(S, curve([P(s * 6.6, -6.4, 16), P(s * 6.9, -7.6, 26), P(s * 5.6, -8.6, 35)], 4), 1, 0.85, GILT, 4);
  const backC = P(0, -7.9, 26.5);
  const tilt = norm3(D([0, -0.12, 1]));
  const across = Ax[0];
  const outB = norm3(cross3(across, tilt));
  S.egg(backC, [across, outB, tilt], [6.6, 1.1, 9.6], (n, w) => {
    const q = sub3(w, backC);
    const e = (dot3(q, across) / 6.6) ** 2 + (dot3(q, tilt) / 9.6) ** 2;
    if (e > 0.72) return toneAt(n, GILT, 0.15);
    if (e > 0.62) return GILT[1];
    return toneAt(n, WINE, 0.1);
  }, 5);
  // its crest: a carved shell of gilt over the oval
  S.egg(add3(backC, mul3(tilt, 9.8)), [across, outB, tilt], [2.6, 1, 1.6], (n) => toneAt(n, GILT, 0.2), 5);
  // the arms: from the back posts forward, padded on top, down to the front legs
  for (const s of [-1, 1]) {
    tube(S, curve([P(s * 7, -6.2, 24), P(s * 8.2, 0, 23.5), P(s * 8.4, 4.6, 22), P(s * 7.4, 6.3, 16)], 4), 0.8, 0.8, GILT, 6);
    S.egg(P(s * 8.1, -1, 24.4), Ax, [1.2, 4.2, 0.9], (n) => toneAt(n, WINE, 0.15), 7);
  }
  if (broken) {
    // the snapped leg on the floor by it
    tube(S, curve([[-24, 12, 1.2], [-20, 15, 1.6], [-15, 15.5, 1.2], [-12.5, 14, 1.2]], 4), 1.1, 0.7, GILT, 8);
    // (its splintered stump, up in the air)
    S.rod(P(-7, 6.5, 14), P(-7.7, 7.3, 11.2), 1.15, 0.5, ['#4a3a26', '#6a5436', '#8a7048', '#a88a5c', '#c4a472'], 10);
  }
  return done(S, 45, 76);
}

/** A playing card's little picture on a table: its border, its royal's field, a fleck of its mark. */
function tinyCard(S: Scene, c: V3, t: number, r: Royal, id: number): void {
  const A: V3 = [Math.cos(t) * 2.4, Math.sin(t) * 2.4, 0];
  const B: V3 = [-Math.sin(t) * 3.4, Math.cos(t) * 3.4, 0];
  const L = ROYAL_LOOK[r];
  S.quad([sub3(sub3(c, A), B), sub3(add3(c, A), B), add3(add3(c, A), B), add3(sub3(c, A), B)], (u, v) => {
    if (u < 0.16 || u > 0.84 || v < 0.12 || v > 0.88) return IVORY[4];
    if (Math.abs(u - 0.5) < 0.18 && Math.abs(v - 0.5) < 0.16) return L.mark[4];
    return L.field[3];
  }, id);
}

/**
 * A ROYAL CARD TABLE, the court's game left mid-hand: a square table on cabriole legs, gilt, its top of green baize; on it
 * a hand of the four royals' cards fanned out (the Princess, the Prince, the Queen, the King), the deck, stacks of gilt
 * counters, a pair of silver candlesticks long out. 100 x 90 at (50, 62).
 */
function cardTable(): Sprite {
  const S = scene(100, 90, 50, 62);
  for (const [x, y] of [[-11, -11], [11, -11], [-11, 11], [11, 11]] as const) {
    tube(S, curve([[x, y, 20], [x * 1.12, y * 1.12, 14], [x * 0.96, y * 0.96, 4], [x * 1.05, y * 1.05, 0.7]], 4), 1.2, 0.7, GILT, 1);
  }
  S.box([0, 0, 19.2], AX3, [12.4, 12.4, 2], (f, u, v, n) => (f === 4 ? toneAt(n, GILT, 0) : toneAt(n, GILT, Math.abs(fr((f < 2 ? v : u) * 6) - 0.5) < 0.14 ? -0.35 : 0.1)), 2);
  S.box([0, 0, 22], AX3, [13.6, 13.6, 0.9], (f, u, v, n) => {
    if (f !== 4) return toneAt(n, GILT, 0.2);
    if (u < 0.07 || u > 0.93 || v < 0.07 || v > 0.93) return toneAt(n, GILT, 0.1 + (u < 0.07 || v > 0.93 ? 0.3 : 0));
    return hash(Math.floor(u * 40), Math.floor(v * 40), 9401) < 0.08 ? BAIZE[2] : BAIZE[3];
  }, 3);
  // the hand fanned out, the deck, counters
  ROYALS.forEach((r, i) => tinyCard(S, [-3 + i * 2.2, 3.4 - i * 0.4, 23 + i * 0.05], -0.5 + i * 0.32, r, 4 + i));
  S.box([5.5, -5.5, 24], [[0.9, 0.4, 0], [-0.4, 0.9, 0], [0, 0, 1]], [2.4, 3.4, 1.1], (f, _u, v, n) => (f === 4 ? (v < 0.15 || v > 0.85 ? IVORY[3] : WINE[2]) : fr(v * 9) < 0.5 ? IVORY[2] : IVORY[3]), 8);
  for (const [x, y, h] of [[-6.5, -6, 3], [-3.5, -7.5, 2], [8.5, 4.5, 4]] as const) {
    cylinder(S, x, y, 1.6, 23, 23 + h * 0.8, (n, _a, z) => (fr(z / 0.8) < 0.3 ? toneAt(n, GILT, -0.4) : toneAt(n, GILT, 0.15)), 9, () => GILT[4]);
  }
  // the candlesticks, at its back corners
  for (const [x, y] of [[-9.5, -9.5], [9.5, -9.5]] as const) {
    cylinder(S, x, y, (z) => (z < 24.5 ? 2.2 : z > 31 ? 1.5 : 0.8 + Math.abs(Math.sin((z - 24.5) * 0.7)) * 0.4), 23, 32, (n) => toneAt(n, SILVER, 0.1), 10);
    cylinder(S, x, y, 0.8, 32, 35, (n) => toneAt(n, WAX, 0.1), 11, () => WAX[3]);
    const [px, py] = S.at([x, y, 35.5]);
    S.put(Math.round(px), Math.round(py), 1e4, '#1a1418', 11);
  }
  return done(S, 50, 62);
}

/**
 * A SILVER TEA SERVICE, LEFT OUT: a round tea table on a tripod, on it a silver teapot, its sugar bowl, cups and saucers of
 * white porcelain banded in blue and gold, a tiered stand of cakes gone stale. Broken: the table knocked over, the teapot on
 * its side, the cups smashed, the cakes across the floor. 100 x 90 at (50, 66).
 */
function teaService(broken: boolean): Sprite {
  const S = scene(100, 90, 50, 66);
  const cup = (x: number, y: number, z: number, id: number): void => {
    cylinder(S, x, y, (zz) => 2.3 - (zz - z) * 0.6, z, z + 0.7, (n) => toneAt(n, PORCELAIN, 0.1), id, () => PORCELAIN[4]);
    cylinder(S, x, y, (zz) => 1.2 + (zz - z - 0.7) * 0.25, z + 0.7, z + 2.9, (n, _a, zz) => (Math.abs(zz - z - 2.2) < 0.35 ? ROYALBLUE[3] : toneAt(n, PORCELAIN, 0.1)), id, (_a, rr) => (rr > 0.8 ? GILT[3] : '#3a2a20'));
  };
  if (!broken) {
    // the table: its top, a turned column, three legs splayed
    cylinder(S, 0, 0, 11, 21, 22.5, (n) => toneAt(n, WALNUT, 0.1), 1, (_a, rr) => (rr > 0.92 ? WALNUT[4] : rr > 0.86 ? WALNUT[2] : WALNUT[3]));
    cylinder(S, 0, 0, (z) => 1.5 + Math.abs(Math.sin(z * 0.35)) * 0.8, 6, 21, (n) => toneAt(n, WALNUT, 0.05), 2);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      tube(S, curve([[Math.cos(a) * 1.5, Math.sin(a) * 1.5, 8], [Math.cos(a) * 6, Math.sin(a) * 6, 5], [Math.cos(a) * 9.5, Math.sin(a) * 9.5, 0.8]], 4), 1.2, 0.8, WALNUT, 3);
    }
    // the teapot: its belly, its lid and knob, its spout, its handle
    S.egg([-2, 1, 26.2], AX3, [3.8, 3.8, 3.4], (n, w) => (Math.abs(w[2] - 26.4) < 0.4 ? toneAt(n, SILVER, -0.4) : toneAt(n, SILVER, 0.15)), 4, (w) => w[2] > 22.5);
    cylinder(S, -2, 1, (z) => 2.2 - (z - 29.2) * 0.6, 29.2, 30.6, (n) => toneAt(n, SILVER, 0.1), 5, () => SILVER[3]);
    S.ball([-2, 1, 31.2], 0.8, SILVER, 5);
    tube(S, curve([[0.8, 3, 25.6], [2.6, 4.4, 27], [3.8, 5.6, 29.6]], 3), 0.9, 0.45, SILVER, 6);
    tube(S, curve([[-4.8, -1.4, 28.4], [-6.8, -3, 27.6], [-6.4, -3, 25], [-4.8, -1.6, 24.4]], 4), 0.55, 0.55, SILVER, 7);
    cylinder(S, 4.5, -3, (z) => 1.8 - (z - 22.5) * 0.15, 22.5, 25, (n) => toneAt(n, SILVER, 0.1), 8, (_a, rr) => (rr > 0.8 ? SILVER[4] : '#e8e6e6'));
    cup(5.5, 4.5, 22.5, 9);
    cup(-5.5, 6.2, 22.5, 10);
    cup(1.2, 7.4, 22.5, 11);
    // the cake stand: a silver rod, three plates, the cakes on them
    S.rod([-3, -6, 22.5], [-3, -6, 32.5], 0.5, 0.5, SILVER, 12);
    [[23.6, 4.8], [28.6, 3.6]].forEach(([z, r], i) => {
      cylinder(S, -3, -6, r, z, z + 0.6, (n) => toneAt(n, SILVER, 0.1), 13 + i, (_a, rr) => (rr > 0.84 ? SILVER[4] : SILVER[2]));
      const nC = i ? 2 : 3;
      for (let j = 0; j < nC; j++) {
        const a = (j / nC) * Math.PI * 2 + i;
        const cx = -3 + Math.cos(a) * r * 0.5;
        const cy = -6 + Math.sin(a) * r * 0.5;
        cylinder(S, cx, cy, 1.2, z + 0.6, z + 2.2, (n) => toneAt(n, SPONGE, 0), 16 + i, () => (j % 2 ? WINE[3] : SPONGE[4]));
      }
    });
    S.ball([-3, -6, 33.2], 0.9, SILVER, 12);
  } else {
    // the table on its side, its top standing up on edge, the column and legs out toward the eye
    S.egg([-6, -6, 11], [[0.7, -0.7, 0], [0, 0, 1], [0.7, 0.7, 0]], [11, 11, 1], (n, w) => (Math.hypot(w[0] + 6, w[1] + 6, w[2] - 11) > 10 ? WALNUT[4] : toneAt(n, WALNUT, 0.05)), 1, (w) => w[2] >= 0);
    tube(S, [[-5, -5, 11], [5, 5, 9]], 1.6, 1.4, WALNUT, 2);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      tube(S, curve([[5, 5, 9], [8 + Math.cos(a) * 3, 8 + Math.sin(a) * 3, 9 + Math.sin(a) * 5], [9 + Math.cos(a) * 7, 9 + Math.sin(a) * 7, 9 + Math.sin(a) * 9 + 2]], 4), 1.1, 0.8, WALNUT, 3);
    }
    // the teapot on its side, its lid rolled off
    S.egg([12, -8, 3.4], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [3.8, 3.4, 3.4], (n) => toneAt(n, SILVER, 0.15), 4, (w) => w[2] >= 0);
    tube(S, curve([[13.5, -4.8, 2.6], [15, -2.6, 2.4], [16.6, -1.6, 2.6]], 3), 0.9, 0.45, SILVER, 6);
    S.egg([18, -12, 0.7], AX3, [1.8, 1.8, 0.8], (n) => toneAt(n, SILVER, 0.1), 5, (w) => w[2] >= 0);
    // the cups smashed: shards of porcelain, a blue band on some; the cakes strewn
    for (let i = 0; i < 16; i++) {
      const a = hash(i, 1, 9501) * Math.PI * 2;
      const d = 9 + hash(i, 2, 9501) * 14;
      const x = 4 + Math.cos(a) * d;
      const y = 6 + Math.sin(a) * d * 0.8;
      S.box([x, y, 0.5], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [1.2 + hash(i, 3, 9501), 0.9, 0.5], (_f, _u, v, n) => (i % 3 === 0 && v > 0.6 ? ROYALBLUE[3] : toneAt(n, PORCELAIN, 0.2)), 20 + i);
    }
    for (let i = 0; i < 5; i++) {
      const x = -14 + i * 4.5 + hash(i, 4, 9501) * 3;
      const y = 10 + hash(i, 5, 9501) * 8;
      cylinder(S, x, y, 1.1, 0, 1.4, (n) => toneAt(n, SPONGE, 0), 40 + i, () => (i % 2 ? WINE[3] : IVORY[4]));
    }
  }
  return done(S, 50, 66);
}

/**
 * A GRAND VASE on its pedestal: a baluster vase of porcelain, royal blue, a white reserve on its belly with the crown in gilt,
 * gilt bands at its foot, its shoulder and its lip, its lid knobbed; on a square pedestal of marble. Broken: knocked from it
 * and smashed, its shards across the floor, its lid rolled away, the pedestal standing bare. 70 x 130 at (35, 104).
 */
function grandVase(broken: boolean): Sprite {
  const S = scene(70, 130, 35, 104);
  slab(S, -7.5, -7.5, 7.5, 7.5, 0, 3, MARBLE, 1, 0.05);
  S.box([0, 0, 12.5], AX3, [5.6, 5.6, 9.5], (f, u, v, n) => {
    if (f < 4 && u > 0.12 && u < 0.88 && v > 0.16 && v < 0.84 && Math.min(u - 0.12, 0.88 - u, v - 0.16, 0.84 - v) < 0.05) return toneAt(n, MARBLE, -0.5);
    return toneAt(n, MARBLE, Math.abs(Math.sin(u * 7 + v * 3)) < 0.05 ? -0.4 : 0.05);
  }, 2);
  slab(S, -7, -7, 7, 7, 22, 24.5, MARBLE, 3, 0.15);
  const Z = 24.5;
  const prof = (z: number): number => {
    const t = z - Z;
    if (t < 1.6) return 4.4;
    if (t < 3.4) return 3.1 + (t - 1.6) * 0.1;
    if (t < 13) return 3.3 + Math.sin(((t - 3.4) / 9.6) * Math.PI * 0.5) * 4.9;
    if (t < 22) return 8.2 - ((t - 13) / 9) ** 1.4 * 4.6;
    if (t < 25) return 3.6;
    return 3.6 + (t - 25) * 0.55;
  };
  if (!broken) {
    cylinder(S, 0, 0, prof, Z, Z + 27, (n, a, z) => {
      const t = z - Z;
      if (t < 1.6 || Math.abs(t - 3.2) < 0.5 || Math.abs(t - 20.4) < 0.6 || t > 26) return toneAt(n, GILT, 0.1);
      // the reserve on its front: a white oval with the crown in it
      const ra = a - Math.PI / 4;
      const da = Math.atan2(Math.sin(ra), Math.cos(ra));
      if (Math.abs(da) < 0.85 && Math.abs(t - 11.5) < 5.5) {
        const ex = da / 0.85;
        const ez = (t - 11.5) / 5.5;
        if (ex * ex + ez * ez < 1) {
          if (ex * ex + ez * ez > 0.8) return GILT[3];
          const m = markTone('king', -ex * 1.25, ez * 1.25, 0.2);
          return m >= 0 ? GILT[clamp4(m)] : toneAt(n, PORCELAIN, 0.15);
        }
      }
      // the blue, with a pattern of scrolling leaves in a darker blue
      return Math.abs(Math.sin(a * 5 + t * 0.8)) < 0.12 ? toneAt(n, ROYALBLUE, -0.4) : toneAt(n, ROYALBLUE, 0.1);
    }, 4);
    // the lid, its knob a little crown of gilt
    cylinder(S, 0, 0, (z) => 4.3 - (z - Z - 27) * 0.9, Z + 27, Z + 30.5, (n) => toneAt(n, ROYALBLUE, 0.15), 5);
    S.ball([0, 0, Z + 31.4], 1.3, GILT, 6);
  } else {
    // the shards: curved pieces of blue, white and gilt across the floor; its foot left on the pedestal; the lid rolled away
    cylinder(S, 0, 0, prof, Z, Z + 3, (n) => toneAt(n, GILT, 0.1), 4, () => HOLE);
    for (let i = 0; i < 14; i++) {
      const a = hash(i, 1, 9601) * Math.PI * 2;
      const d = 10 + hash(i, 2, 9601) * 14;
      const s = 1.6 + hash(i, 3, 9601) * 1.6;
      S.egg([Math.cos(a) * d, 4 + Math.sin(a) * d * 0.7, 0.4], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [s, s * 0.7, 0.9], (n) => (i % 4 === 0 ? toneAt(n, PORCELAIN, 0.15) : i % 5 === 1 ? toneAt(n, GILT, 0.1) : toneAt(n, ROYALBLUE, 0.15)), 10 + i, (w) => w[2] >= 0);
    }
    S.egg([-14, 12, 2.4], [[0.6, 0.8, 0], [0, 0, 1], [0.8, -0.6, 0]], [4.2, 2.6, 2.6], (n) => toneAt(n, ROYALBLUE, 0.1), 30, (w) => w[2] >= 0);
  }
  return done(S, 35, 104);
}

/**
 * A HAT STAND, CLOAKS LEFT ON IT: a turned walnut stand on three scrolled feet, gilt hooks at its head; on it a velvet cloak
 * of the royal wine with a gilt clasp, a broad hat with a swan-white plume, a gilt mask for the masque hung by its ribbon:
 * the guests never came back for them. 80 x 130 at (40, 108).
 */
function hatStand(): Sprite {
  const S = scene(80, 130, 40, 108);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.9;
    tube(S, curve([[0, 0, 7], [Math.cos(a) * 4, Math.sin(a) * 4, 4], [Math.cos(a) * 8, Math.sin(a) * 8, 1], [Math.cos(a) * 9.5, Math.sin(a) * 9.5, 1.6]], 4), 1.3, 0.8, WALNUT, 1);
  }
  cylinder(S, 0, 0, (z) => (z < 10 ? 2 - (z - 5) * 0.12 : 1.3 + (Math.abs(Math.sin(z * 0.2)) < 0.15 ? 0.5 : 0)), 5, 62, (n) => toneAt(n, WALNUT, 0.05), 2);
  S.ball([0, 0, 63], 1.9, WALNUT, 2);
  // the hooks: four, each a gilt arm out and up
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    tube(S, curve([[Math.cos(a) * 1.2, Math.sin(a) * 1.2, 57], [Math.cos(a) * 4, Math.sin(a) * 4, 56], [Math.cos(a) * 5.2, Math.sin(a) * 5.2, 59]], 3), 0.55, 0.45, GILT, 3);
  }
  // the cloak, hung by its collar off the hook to the front left: falling in folds to near the floor
  const ca = 0.4 + Math.PI / 2;
  const cx = Math.cos(ca) * 3.5;
  const cy = Math.sin(ca) * 3.5;
  cylinder(S, cx, cy, (z) => {
    const t = (57 - z) / 44;
    return 2.2 + Math.sqrt(Math.max(0, t)) * 7.2;
  }, 12, 57, (n, a, z) => {
    const fold = Math.sin(a * 7 + z * 0.05);
    if (z < 13.5 + Math.sin(a * 5) * 1.2) return null;
    return toneAt(n, WINE, fold > 0.5 ? 0.25 : fold < -0.5 ? -0.35 : 0);
  }, 4, () => WINE[1]);
  S.ball([cx + 1.4, cy + 2.6, 54], 1, GILT, 5);
  // the hat on the stand's head: its crown, its broad brim, the plume curling off the back
  cylinder(S, 0, 0, (z) => 3.6 - (z - 65) * 0.12, 65, 69.5, (n) => toneAt(n, VELVET, 0.1), 6, () => VELVET[2]);
  S.egg([0, 0, 65], [[0.96, 0, 0.28], [0, 1, 0], [-0.28, 0, 0.96]], [8, 7.4, 0.9], (n, w) => (Math.hypot(w[0], w[1]) < 3.8 && w[2] > 65 ? null : toneAt(n, VELVET, 0.15)), 6);
  S.rod([-3.5, 0.6, 66.6], [3.6, 0.6, 66.6], 0.5, 0.5, GILT, 7);
  const plume = curve([[2.6, -2.4, 68], [6.5, -4, 71], [10, -3.4, 69.5], [11.6, -1.4, 66]], 4);
  plume.forEach((p, i) => S.egg(p, AX3, [2.1 - i * 0.08, 1.6, 1.5], (n, w) => (fr(w[0] * 0.8) < 0.25 ? toneAt(n, SWANW, -0.3) : toneAt(n, SWANW, 0.15)), 8));
  // the gilt mask on the hook to the right, hung by its black ribbon
  const ma = 0.4;
  const mp: V3 = [Math.cos(ma) * 5.6, Math.sin(ma) * 5.6, 52];
  S.rod([Math.cos(ma) * 5.2, Math.sin(ma) * 5.2, 59], add3(mp, [0, 0, 2.6]), 0.35, 0.35, BLACK, 9);
  const F = norm3([Math.cos(ma), Math.sin(ma) + 0.4, 0]);
  const Aside = norm3([F[1], -F[0], 0]);
  S.egg(mp, [Aside, F, [0, 0, 1]], [3.4, 0.9, 2.2], (n, w) => {
    const q = sub3(w, mp);
    const a = dot3(q, Aside);
    const z = q[2];
    for (const s of [-1, 1]) if (inEll(a, z, s * 1.4, 0.3, 0.75, 0.5)) return BLACK[0];
    return toneAt(n, GILT, 0.15);
  }, 10);
  return done(S, 40, 108);
}

/**
 * THE HERALDS' TRUMPETS, STOPPED: a rack of walnut, and on its pegs two long straight trumpets of brass, their bells flaring
 * toward the eye; a banner of the royal wine hanging from the nearer with the crown on it; and both bells stopped by the
 * Order with a plug of black wax, the blank mask pressed in it. 120 x 110 at (60, 82).
 */
function heraldsTrumpets(): Sprite {
  const S = scene(120, 110, 60, 82);
  for (const x of [-14, 10]) {
    S.box([x, 0, 1], AX3, [1.6, 6, 1], (_f, _u, _v, n) => toneAt(n, WALNUT, 0), 1);
    S.rod([x, 0, 2], [x, 0, 48], 1.1, 1, WALNUT, 2);
    S.ball([x, 0, 49], 1.4, GILT, 2);
    for (const z of [44.4, 34.4]) S.rod([x, 0, z], [x, 3.4, z + 0.5], 0.5, 0.5, WALNUT, 3);
  }
  const d: V3 = [1, 0, 0];
  const trumpet = (z: number, y: number, banner: boolean, id: number): void => {
    const p0: V3 = [-23, y, z];
    const at = (t: number): V3 => add3(p0, mul3(d, t));
    // the mouthpiece, the pipe, a knop on it; the bell
    S.egg(at(-0.6), [d, [0, 1, 0], [0, 0, 1]], [1, 1.1, 1.1], (n) => toneAt(n, GILT, 0.2), id);
    S.rod(at(0), at(31), 0.6, 0.7, GILT, id);
    S.ball(at(14), 1.1, GILT, id);
    const BL = 11;
    const br = (t: number): number => 0.75 + (t / BL) ** 2.6 * 4.6;
    latheAlong(S, at(31), d, BL, br, (n, t, inside) => {
      if (inside) return t > BL - 1.6 ? GILT[2] : GILT[1];
      if (t > BL - 0.7) return GILT[4];
      return toneAt(n, GILT, 0.15);
    }, id + 1);
    // the plug of black wax just inside its mouth, the mask pressed in it
    const c = at(31 + BL - 0.9);
    S.egg(c, [d, [0, 1, 0], [0, 0, 1]], [0.4, br(BL - 0.9) - 0.15, br(BL - 0.9) - 0.15], (_n, w) => {
      const a = w[1] - c[1];
      const zz = w[2] - c[2];
      if (inEll(a, zz, 0, 0, 2.2, 2.8)) {
        for (const s of [-1, 1]) if (inEll(a, zz, s * 0.9, 0.6, 0.55, 0.45)) return BLACK[0];
        return zz > 1 ? MASK[3] : MASK[2];
      }
      return Math.hypot(a, zz) > br(BL - 0.9) - 0.9 ? BLACK[3] : BLACK[1];
    }, id + 2);
    if (!banner) return;
    // its banner, hung from the pipe: the wine, a gilt fringe, the crown
    const y1 = y + 1;
    S.quad([[-17, y1, z - 0.7], [1, y1, z - 0.7], [1, y1, z - 19], [-17, y1, z - 19]], (u, v) => {
      const a = (u - 0.5) * 18;
      const zz = (1 - v) * 18.3;
      const cut = 4 * (1 - Math.abs(a) / 9);
      if (zz < cut) return null;
      if (zz - cut < 1.8) return Math.floor((a + 20) * 1.25) % 2 ? GILT[3] : GILT[1];
      if (Math.min(9 - Math.abs(a), 18.3 - zz) < 1.3) return GILT[2];
      const t = markTone('king', a / 6, (zz - 11.2) / 6, 0.22);
      if (t >= 0) return GILT[t];
      const fold = Math.sin(u * 14);
      return WINE[fold > 0.55 ? 3 : fold < -0.55 ? 1 : 2];
    }, id + 3);
  };
  trumpet(45.2, 1.6, false, 10);
  trumpet(35.2, 2.6, true, 20);
  return done(S, 60, 82);
}

/**
 * A STANDING CANDELABRUM, a girandole as tall as a man: three scrolled feet, a turned baluster stem, five branches curving up
 * from its head, a drip pan and a candle on each, burning an honest flame (two frames); or out. 80 x 140 at (40, 120).
 */
function candelabrum(f: number): Sprite {
  const S = scene(80, 140, 40, 120);
  const lit = f < 2;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    tube(S, curve([[0, 0, 8], [Math.cos(a) * 4, Math.sin(a) * 4, 5], [Math.cos(a) * 8, Math.sin(a) * 8, 3], [Math.cos(a) * 9.6, Math.sin(a) * 9.6, 0.9]], 4), 1.4, 0.9, GILT, 1);
    S.ball([Math.cos(a) * 9.6, Math.sin(a) * 9.6, 1], 1.1, GILT, 1);
  }
  cylinder(S, 0, 0, (z) => {
    if (z < 12) return 2.6 - (z - 6) * 0.15;
    if (z < 16) return 1.6 + Math.sin(((z - 12) / 4) * Math.PI) * 1.4;
    if (z < 52) return 1.1 + ((z - 16) / 36) * 0.4;
    if (z < 58) return 1.5 + Math.sin(((z - 52) / 6) * Math.PI) * 1.6;
    return 1.4;
  }, 6, 62, (n, a, z) => toneAt(n, GILT, z > 16 && z < 52 && fr((a / (Math.PI * 2)) * 8) < 0.25 ? -0.3 : 0.1), 2);
  const tips: V3[] = [[0, 0, 76]];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const tip: V3 = [Math.cos(a) * 10, Math.sin(a) * 10, 70];
    tube(S, curve([[0, 0, 61], [Math.cos(a) * 4, Math.sin(a) * 4, 60.5], [Math.cos(a) * 9, Math.sin(a) * 9, 63], [tip[0], tip[1], tip[2] - 1.5]], 4), 0.9, 0.75, GILT, 3);
    tips.push(tip);
  }
  S.rod([0, 0, 62], [0, 0, 74.5], 1, 0.85, GILT, 3);
  tips.forEach((c, i) => {
    cylinder(S, c[0], c[1], (z) => 1.1 + (z - c[2] + 1.4) * 0.5, c[2] - 1.4, c[2], (n) => toneAt(n, GILT, 0.2), 4 + i, () => GILT[3]);
    cylinder(S, c[0], c[1], 0.85, c[2], c[2] + 7, (n) => toneAt(n, WAX, 0.05), 10 + i, (_a, rr) => (rr < 0.4 ? '#3a3026' : WAX[4]));
    if (lit) flame(S, [c[0], c[1], c[2] + 7.6], f + i, 3);
    else {
      const [px, py] = S.at([c[0], c[1], c[2] + 7.6]);
      S.put(Math.round(px), Math.round(py), 1e4, '#1a1418', 16);
    }
  });
  return done(S, 40, 120, lit ? [{ at: [0, 0, 78], r: 46 + f * 3, color: EMBER[2], a: 0.45 }] : []);
}

/**
 * A ROYAL CARPET, a tile of a runner laid down a hall or out to the coach: the royal wine, bordered in gold, a chain of
 * lozenges down its middle, worn pale where the court walked; it runs on into the next tile seamlessly. Along x (`k` 0) or
 * along y (1). A floor tile. 70 x 38 at (35, 19).
 */
function royalCarpet(k: number): Sprite {
  return lying(70, 38, 35, 19, (u0, v0) => {
    const u = k ? v0 : u0;
    const v = k ? u0 : v0;
    if (Math.abs(u) > 0.497 || Math.abs(v) > 0.33) return null;
    const av = Math.abs(v);
    if (av > 0.305) return WINE[1];
    if (av > 0.27) return GILT[av > 0.29 ? 2 : 3];
    if (av > 0.25) return WINE[1];
    // the lozenges: two to a tile, gold outlined, a darker wine within
    const lu = fr(u * 2 + 0.5) - 0.5;
    const d = Math.abs(lu) / 0.5 + av / 0.2;
    if (Math.abs(d - 1) < 0.12) return GILT[2];
    if (d < 0.22) return GILT[3];
    if (d < 1) return WINE[1];
    // worn down its middle, where the court walked
    const worn = Math.abs(v) < 0.12 && hash(Math.floor(fr(u + 0.5) * 30), Math.floor(v * 30 + 20), 9701) < 0.35;
    return worn ? WINE[3] : WINE[2];
  });
}

/**
 * A HEAP OF INVITATIONS: a silver salver dropped on the floor, and spilled from it the court's invitations to the masque,
 * never sent: gilt-edged cards with the crown at their heads and folded letters sealed in wine wax, a ribbon among them.
 * On the floor. 110 x 64 at (55, 36).
 */
function invitations(): Sprite {
  const S = scene(110, 64, 55, 36);
  S.egg([-12, -8, 0.9], AX3, [10, 10, 1.1], (n, w) => {
    const r = Math.hypot(w[0] + 12, w[1] + 8);
    if (r > 8.6) return toneAt(n, SILVER, 0.35);
    if (r > 7.8) return SILVER[1];
    return toneAt(n, SILVER, -0.05);
  }, 1, (w) => w[2] >= 0);
  const items: [number, number, number, boolean][] = [[-12, -8, 0.35, false], [-1, -7, -0.5, true], [-6, 4, 0.2, false], [6, 3, 0.9, false], [-14, 10, -0.3, true], [14, -4, 0.2, false], [4, 14, -0.7, false]];
  items.forEach(([cx, cy, t, card], i) => {
    const hw = card ? 4.4 : 5.8;
    const hh = card ? 3.2 : 3.9;
    const z = 1.3 + i * 0.15 + (Math.hypot(cx + 12, cy + 8) < 9 ? 1 : 0);
    const P = (u: number, v: number): V3 => [cx + Math.cos(t) * u * hw - Math.sin(t) * v * hh, cy + Math.sin(t) * u * hw + Math.cos(t) * v * hh, z];
    S.quad([P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)], (u, v) => {
      // its edge, all round, a step darker, so that each one reads from the next
      if (u < 0.05 || u > 0.95 || v < 0.07 || v > 0.93) return card ? GILT[1] : IVORY[1];
      if (card) {
        if (u < 0.13 || u > 0.87 || v < 0.18 || v > 0.82) return GILT[3];
        if (Math.abs(u - 0.5) < 0.12 && v > 0.26 && v < 0.42) return GILT[3];
        return IVORY[4];
      }
      // a letter: its flap's fold to the middle, the seal on it
      const sd = Math.hypot((u - 0.5) * 1.45, v - 0.55);
      if (sd < 0.16) return sd < 0.07 ? WINE[1] : WINE[3];
      if (Math.abs(v - 0.55 + Math.abs(u - 0.5) * 0.95) < 0.05 && v < 0.55) return IVORY[2];
      return IVORY[4];
    }, 2 + i);
  });
  tube(S, curve([[-8, 15, 1.4], [-4, 11, 1.6], [0, 16, 1.4], [6, 21, 1]], 4), 0.65, 0.6, WINE, 30);
  return done(S, 55, 36);
}

/**
 * A DROPPED FAN AND A ROSE: a lady's folding fan lying open on the floor where it fell, its pleated leaf spread wide, light and
 * shade by turns, painted with a band of roses, its outer edge scalloped, its guards of gilt; and a rose
 * dropped by it. On the floor. 100 x 64 at (50, 34).
 */
function droppedFan(): Sprite {
  const S = scene(100, 64, 50, 34);
  const piv: V3 = [-12, 6, 0.7];
  const a0 = -2.25;
  const a1 = 0.65;
  const PLEATS = 18;
  const R0 = 4;
  const R1 = 21;
  const E = (t: number, r: number, z: number): V3 => [piv[0] + Math.cos(t) * r, piv[1] + Math.sin(t) * r, z];
  for (let i = 0; i < PLEATS; i++) {
    const t0 = a0 + ((a1 - a0) * i) / PLEATS;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / PLEATS;
    const lit = i % 2 === 0;
    const z0 = lit ? 0.7 : 1.6;
    const z1 = lit ? 1.6 : 0.7;
    S.quad([E(t0, R0, 0.8), E(t1, R0, 0.8), E(t1, R1, z1), E(t0, R1, z0)], (u, v) => {
      // its scalloped edge: each pleat's end rounded
      if (v > 0.94 - 0.06 * Math.abs(u - 0.5) * 2) return v > 0.97 - 0.06 * Math.abs(u - 0.5) * 2 ? null : GILT[lit ? 3 : 2];
      // a band of roses painted round it near its edge, between two gilt lines
      if (v > 0.66 && v < 0.8 && i % 3 === 1) return ROSEDUST[lit ? 3 : 2];
      if (Math.abs(v - 0.62) < 0.025 || Math.abs(v - 0.84) < 0.025) return GILT[lit ? 3 : 2];
      return lit ? IVORY[4] : IVORY[1];
    }, 1 + i);
  }
  // the sticks from the pivot to the leaf, its two guards, the rivet
  for (let i = 1; i < PLEATS; i += 2) S.rod(piv, E(a0 + ((a1 - a0) * i) / PLEATS, R0 + 0.4, 0.8), 0.35, 0.35, IVORY, 30);
  for (const t of [a0, a1]) S.rod(E(t, 0, 1.2), E(t, R1 - 0.6, 1.4), 0.75, 0.6, GILT, 31);
  S.ball(piv, 1, GILT, 32);
  // the rose: its stem, two leaves, its bloom
  S.rod([4, 16, 0.8], [15, 13, 0.8], 0.55, 0.45, HEDGE, 40);
  for (const [x, y, s] of [[7.5, 15.6, 1], [11, 14, -1]] as const) S.egg([x + s * 0.6, y + s * 1.2, 0.9], [[0.9, -0.3, 0], [0.3, 0.9, 0], [0, 0, 1]], [1.6, 0.9, 0.5], (n) => toneAt(n, HEDGE, 0.3), 41);
  S.egg([16.6, 12.6, 2], AX3, [2.4, 2.4, 1.9], (n, w) => (Math.abs(Math.sin(Math.atan2(w[1] - 12.6, w[0] - 16.6) * 2 + Math.hypot(w[0] - 16.6, w[1] - 12.6) * 2.2)) < 0.3 ? toneAt(n, ROSEDUST, -0.35) : toneAt(n, ROSEDUST, 0.2)), 42);
  return done(S, 50, 34);
}

/**
 * A ROYAL CARD (his Royal Cards: "each drops its royal's playing card"): the card a touched enemy drops, lying face up,
 * square to the eye: a white border, the royal's field, its mark large in the middle, the mark small in two corners. One
 * for each of the four: the Princess, the Prince, the Queen, the King. On the floor. 52 x 34 at (26, 17).
 */
function royalCard(r: Royal): Sprite {
  const L = ROYAL_LOOK[r];
  const p = new Px(52, 34);
  // (its face, flat on the floor and square to the eye: 30 across, 21 up the picture; the floor shortens it by half)
  const X0 = 11;
  const Y0 = 6;
  const W = 30;
  const H = 21;
  for (let y = 0; y < H + 1; y++) {
    for (let x = 0; x < W + 1; x++) {
      const px = X0 + x;
      const py = Y0 + y;
      // its edge: the card's thickness, along its foot and its right
      if (y === H || x === W) {
        if (y === H && x === 0) continue;
        if (x === W && y === 0) continue;
        p.set(px, py, IVORY[1]);
        continue;
      }
      // (its corners rounded)
      if ((x === 0 || x === W - 1) && (y === 0 || y === H - 1)) continue;
      const bx = Math.min(x, W - 1 - x);
      const by = Math.min(y, H - 1 - y);
      if (bx < 2 || by < 1.5) {
        p.set(px, py, bx < 1 || by < 1 ? IVORY[3] : IVORY[4]);
        continue;
      }
      // the mark: in the middle, large; small in the top left and bottom right corners
      const mx = (x + 0.5 - W / 2) / 7.6;
      const my = -(y + 0.5 - H / 2) / 4.6;
      const t = markTone(r, mx, my, 0.15);
      if (t >= 0) {
        p.set(px, py, L.mark[t]);
        continue;
      }
      for (const [cx, cy] of [[5.2, 3.4], [W - 5.2, H - 3.4]] as const) {
        const t2 = markTone(r, (x + 0.5 - cx) / 2.6, -(y + 0.5 - cy) / 1.7, 0.45);
        if (t2 >= 0 && t2 !== 1) {
          p.set(px, py, L.mark[Math.max(3, t2)]);
          break;
        }
      }
      if (p.get(px, py)) continue;
      // the field, its inner rule of the trim
      const inner = bx === 2 || by === 2 ? L.trim[3] : L.field[(x + y) % 7 === 0 ? 1 : 2];
      p.set(px, py, inner);
    }
  }
  return lying(52, 34, 26, 17, (_u, _v, px, py) => p.get(px, py));
}

/**
 * A SONGBIRD'S CAGE, SILENT: a tall gilt stand on three feet, its arm reaching out to a hook, and hung from it a domed cage
 * of gilt wire, its door standing open, its perch empty, a feather on its floor: the court's songbird gone. 80 x 140 at (40, 120).
 */
function birdCage(): Sprite {
  const S = scene(80, 140, 40, 120);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.2;
    tube(S, curve([[0, 0, 6], [Math.cos(a) * 5, Math.sin(a) * 5, 2.5], [Math.cos(a) * 9, Math.sin(a) * 9, 0.8]], 4), 1.1, 0.8, GILT, 1);
  }
  S.rod([0, 0, 2], [0, 0, 74], 0.9, 0.8, GILT, 2);
  S.ball([0, 0, 75], 1.3, GILT, 2);
  tube(S, curve([[0, 0, 72], [3, 3, 75], [7, 7, 75], [9.5, 9.5, 72.5]], 5), 0.65, 0.55, GILT, 3);
  // the cage: hung from the hook, its ring, its dome of wires, its body of bars, its tray
  const C: V3 = [9.5, 9.5, 0];
  const R = 7.4;
  const zB = 34;
  const zT = 52;
  tube(S, curve([[C[0], C[1], 72.5], [C[0] + 0.6, C[1], 70.5], [C[0], C[1], 69]], 3), 0.45, 0.45, GILT, 4);
  cylinder(S, C[0], C[1], R + 0.4, zB - 2, zB, (n) => toneAt(n, GILT, 0.05), 5, (_a, rr) => (rr > 0.9 ? GILT[3] : '#2a2024'));
  const BARS = 16;
  for (let i = 0; i < BARS; i++) {
    const a = (i / BARS) * Math.PI * 2;
    // (the door: three bars on the near side swung out on its hinge)
    const door = i >= 1 && i <= 2;
    if (door) continue;
    const p0: V3 = [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R, zB];
    const p1: V3 = [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R, zT];
    S.rod(p0, p1, 0.42, 0.42, GILT, 6);
    // the dome over it: each wire curving in to the top
    const dome: V3[] = [];
    for (let j = 0; j <= 6; j++) {
      const t = (j / 6) * (Math.PI / 2);
      dome.push([C[0] + Math.cos(a) * R * Math.cos(t), C[1] + Math.sin(a) * R * Math.cos(t), zT + Math.sin(t) * 9]);
    }
    tube(S, dome, 0.42, 0.42, GILT, 6);
  }
  for (const z of [zB + 0.5, zT, zT - 7]) {
    const ring: V3[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      if (z !== zT && a > ((0.5) / BARS) * Math.PI * 2 && a < ((2.5) / BARS) * Math.PI * 2) continue;
      ring.push([C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R, z]);
    }
    for (let i = 0; i + 1 < ring.length; i++) if (Math.hypot(ring[i][0] - ring[i + 1][0], ring[i][1] - ring[i + 1][1]) < 2) S.rod(ring[i], ring[i + 1], 0.45, 0.45, GILT, 7);
  }
  S.ball([C[0], C[1], zT + 9.3], 1.3, GILT, 7);
  // the door, swung open on its left edge
  const h0: V3 = [C[0] + Math.cos((0.5 / BARS) * Math.PI * 2) * R, C[1] + Math.sin((0.5 / BARS) * Math.PI * 2) * R, 0];
  const dir = norm3([1, 0.5, 0]);
  for (let j = 0; j <= 2; j++) {
    const p = add3(h0, mul3(dir, 1.6 + j * 2.2));
    S.rod([p[0], p[1], zB + 0.6], [p[0], p[1], zT - 7.4], 0.42, 0.42, GILT, 8);
  }
  for (const z of [zB + 0.6, zT - 7.4]) S.rod([h0[0], h0[1], z], add3(add3(h0, mul3(dir, 6.2)), [0, 0, z]), 0.45, 0.45, GILT, 8);
  // inside: its perch, empty; its seed cup; a feather on its floor
  S.rod([C[0] - 5.5, C[1] + 3, 42], [C[0] + 3, C[1] - 5.5, 42], 0.5, 0.5, WALNUT, 9);
  cylinder(S, C[0] - 4, C[1] - 4, 1.4, zB, zB + 2, (n) => toneAt(n, PORCELAIN, 0.1), 10, () => '#3a2a20');
  S.rod([C[0] + 1, C[1] + 1.5, zB + 0.4], [C[0] + 3.4, C[1] + 0.6, zB + 0.4], 0.5, 0.2, SWANW, 11);
  return done(S, 40, 120);
}

// =================================================================================================

let made: Piece[] | null = null;
/** THE HIGH CITY'S OWN PIECES, the set's twenty-five for floors 16 to 20, made the first time they are asked for and kept. */
export function highCitySetPieces(): Piece[] {
  if (made) return made;
  made = [
    // HUNG ON THE WALL (each at its spots: on a room's wall, along it, higher for a tall hall or a palace front)
    // (frames: the Princess's, the Prince's, the Queen's, the King's)
    { name: "a royal's banner", kind: 'on the wall', ...onWall(ROYALS.map((r) => ({ make: royalBanner(r) })), HUNG) },
    { name: 'a court portrait, faces painted out', kind: 'on the wall', ...onWall([{ make: portrait() }], HUNG) },
    // (lit, two frames; out)
    { name: 'a gilt sconce', kind: 'on the wall', ...onWall([0, 1, 2].map((f) => ({ make: sconce(f), lights: f < 2 ? (w: WallAt): WallLight[] => [{ at: w(0, 7, 55), r: 30 + f * 3, color: EMBER[2], a: 0.4 }] : undefined })), HUNG) },
    { name: 'a court notice, gone blank', kind: 'on the wall', ...onWall([{ make: courtNotice() }], HUNG) },
    { name: "the Order's mask over the crest", kind: 'on the wall', ...onWall([{ make: maskOverCrest() }], HUNG) },
    // (shut, open, sealed by the Order)
    { name: 'a palace door', kind: 'door', ...onWall((['shut', 'open', 'sealed'] as const).map((s) => ({ make: palaceDoor(s) })), [[0, 0]]) },
    // OUT ON THE HILL
    { name: 'a gilt lamp post', kind: 'obstacle', frames: [lampPost(0), lampPost(1)], shadow: 0.25 },
    // (frames: along x, along y; the Order's mask on them along x, along y)
    { name: 'palace railings', kind: 'obstacle', frames: [railings(0, false), railings(1, false), railings(0, true), railings(1, true)], shadow: 0.2 },
    // (its opening to +y, to +x)
    { name: 'a sentry box', kind: 'obstacle', frames: [sentryBox(0), sentryBox(1)], shadow: 0.5 },
    { name: 'a marble statue of a royal', kind: 'obstacle', frames: [statue()], shadow: 0.5 },
    // (seen from before, from behind)
    { name: 'the fountain of the four royals', kind: 'obstacle', frames: [fountain(0), fountain(2)], shadow: 1.2 },
    // (its pole to +y, to +x)
    { name: 'a royal coach, abandoned', kind: 'obstacle', frames: [coach(0), coach(1)], shadow: 1.1 },
    // IN THE PALACE'S ROOMS
    // (along x, along y)
    { name: 'a velvet rope barrier', kind: 'obstacle', frames: [ropeBarrier(0), ropeBarrier(1)], shadow: 0.2 },
    { name: 'a gilt chair', kind: 'breakable', frames: [giltChair(false), giltChair(true)], shadow: 0.3 },
    { name: 'a royal card table', kind: 'obstacle', frames: [cardTable()], shadow: 0.55 },
    { name: 'a silver tea service, left out', kind: 'breakable', frames: [teaService(false), teaService(true)], shadow: 0.4 },
    { name: 'a grand vase', kind: 'breakable', frames: [grandVase(false), grandVase(true)], shadow: 0.3 },
    { name: 'a hat stand, cloaks left on it', kind: 'obstacle', frames: [hatStand()], shadow: 0.3 },
    { name: "the heralds' trumpets, stopped", kind: 'obstacle', frames: [heraldsTrumpets()], shadow: 0.35 },
    // (lit, two frames; out)
    { name: 'a standing candelabrum', kind: 'obstacle', frames: [candelabrum(0), candelabrum(1), candelabrum(2)], shadow: 0.25 },
    { name: "a songbird's cage, silent", kind: 'obstacle', frames: [birdCage()], shadow: 0.3 },
    // ON THE FLOOR
    // (a tile of a runner: along x, along y; it runs on seamlessly)
    { name: 'a royal carpet', kind: 'floor tile', frames: [royalCarpet(0), royalCarpet(1)] },
    { name: 'a heap of invitations', kind: 'on the floor', frames: [invitations()] },
    { name: 'a dropped fan and a rose', kind: 'on the floor', frames: [droppedFan()] },
    // HIS ROYAL CARDS: the card each touched enemy drops (the Princess's, the Prince's, the Queen's, the King's)
    { name: 'a royal card', kind: 'quest', frames: ROYALS.map(royalCard) },
  ];
  return made;
}

void mix;
