// Pictures of THE PHYSICIAN'S MOVES DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): his rap, his
// draw, his Diagnosis and the operation after it, and his rounds (art/physician_action.ts, PHYSICIAN_ACTION; what he sends out,
// art/physician_action_fx.ts), in a stand-in for his operating theatre (the theatre's dark oak boards strewn with sawdust, its oak
// panelling and limewashed walls, the game's own iron ward beds and operating table from art/floor14.ts, and cast-iron pillars
// holding up the gallery, painted here), with the knight for size, each figure and piece at its floor point and sorted by it, as the
// game sorts them. Made outside a browser (tools/physician_action_film.ts, tools/physician_action_sheet.ts). Nothing of the game
// imports it. THE THEATRE IS A STAND-IN: the game's own Physician's Theatre is the game's (game/act2/housequiet.ts).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { houseOfQuietPieces } from '../art/floor14';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { DIAG, DRAW9, OP_HIT, OP_LONG, OP_STRIKE, RAP9_HIT, RAP9_LONG, DRAW9_LONG, ROUNDS9_HITS, ROUNDS9_LONG, lensAt, makePhysicianActionArt } from '../art/physician_action';
import { BEAM, FIELD, OPERATION, RINGS, diagnosis, isoAt, litRGB, opDark, opLight, paintBeam, paintBurnLine, paintDial, paintDraw, paintField, paintMark, paintRap, paintRounds, paintShaft, paintSpotCone, paintSpotEdge, paintTools, spot, waysOf } from '../art/physician_action_fx';
import type { At, Cover, Iso, Keep, Pt } from '../art/physician_action_fx';
import { PHYSICIAN } from '../art/physician_moves';
import { drawHeldWord, drawHushCloud, drawPhialFlight, HELD_WORD_UP } from '../art/physician_shots';
import { PH_TONIC } from '../art/physician_moves';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { PxCtx, frameAt } from './action_f3_scene';
import { frameOf, lay, shadow } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
/** How long he stands before each move begins (seconds). */
export const LEAD = 0.4;
/** THE THEATRE: 17 tiles each way, its middle the scene's. */
export const ROOM = { x0: -8.5, x1: 8.5, y0: -8.5, y1: 8.5 } as const;
const inRoom = (x: number, y: number): boolean => x >= ROOM.x0 && x <= ROOM.x1 && y >= ROOM.y0 && y <= ROOM.y1;

// ---------------------------------------------------------------------------------------------
// THE THEATRE (a stand-in)

const OAK = ['#1c1611', '#33271d', '#42332a', '#4f3e31', '#635040'];
const SAWDUST = ['#6e6448', '#8e815e', '#a69872'];
const PANEL = ['#130e0b', '#241b15', '#33271d', '#42332a', '#544234'];
const LIME = ['#6e6a5e', '#8a8676', '#a8a492', '#bdb9a6'];
const DARK = '#07060a';
/** THE THEATRE'S FLOOR AND ITS WALLS: oak boards laid along x, sawdust strewn thick in its middle; oak panelling and limewash along its two far sides, their copings along its near two (cut away, so that it is seen). */
export function theatreFloor(w: number, h: number, cx: number, cy: number, dust = true): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      if (!inRoom(x, y)) {
        px.set(X, Y, DARK);
        continue;
      }
      // (boards along x, a quarter of a tile wide, butt joints)
      const V = (y + 40) * 4;
      const j = Math.floor(V);
      const v = V - j;
      const len = 2.2 + Math.floor(hash(j, 0, 7961) * 3) * 0.8;
      const U = x + 40 + hash(j, 1, 7961) * len;
      const i = Math.floor(U / len);
      const u = U / len - i;
      const h0 = hash(i, j, 7962);
      let c = OAK[h0 > 0.72 ? 4 : h0 < 0.25 ? 2 : 3];
      if (v < 0.07 || u * len < 0.04) c = OAK[0];
      else if (v < 0.14) c = OAK[1];
      // (sawdust thick in the middle, thinning to grains)
      const r = Math.hypot(x - LAYOUT.table[0], (y - LAYOUT.table[1]) * 1.1) + 1.0 * (hash(Math.floor(x * 3), Math.floor(y * 3), 7963) - 0.5);
      const much = dust ? clamp01((3.2 - r) / 2) : 0;
      if (much > 0.6) {
        const g = hash(X >> 1, Y, 7964);
        c = g < 0.1 ? SAWDUST[2] : g < 0.24 ? SAWDUST[0] : SAWDUST[1];
      } else if (much > 0) {
        const g = hash(X >> 1, Y, 7965);
        if (g < much * 0.9) c = g < 0.1 ? SAWDUST[2] : g < 0.3 ? SAWDUST[0] : SAWDUST[1];
      }
      // (darker in toward the walls)
      if (Math.min(x - ROOM.x0, y - ROOM.y0) < 0.35) c = OAK[1];
      px.set(X, Y, c);
    }
  }
  // THE FAR WALLS: oak panelling to a rail, limewash above, a dark cornice
  const face = (x0: number, y0: number, x1: number, y1: number, left: boolean): void => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 0; d <= L; d += 1 / 40) {
      const q = d / L;
      const x = x0 + (x1 - x0) * q;
      const y = y0 + (y1 - y0) * q;
      const along = left ? y : x;
      const [X, Y] = onFloor(x, y, cx, cy, 1);
      const bay = ((along + 40) / 1.7) % 1;
      for (let z = 0; z < 70; z++) {
        let c: string;
        if (z < 30) c = bay < 0.06 || z < 3 ? PANEL[1] : z > 26 ? PANEL[4] : left ? PANEL[3] : PANEL[2];
        else if (z < 33) c = PANEL[4];
        else if (z > 64) c = PANEL[1];
        else c = LIME[(left ? 2 : 1) + (hash(Math.floor(along * 6), z >> 2, 7966) > 0.85 ? -1 : 0)];
        const py = Math.round(Y - z);
        if (py >= 0 && py < h && X >= 0 && X < w) px.set(Math.round(X), py, c);
      }
    }
  };
  face(ROOM.x0, ROOM.y1, ROOM.x0, ROOM.y0, true);
  face(ROOM.x0, ROOM.y0, ROOM.x1, ROOM.y0, false);
  const coping = (x0: number, y0: number, x1: number, y1: number): void => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 0; d <= L; d += 1 / 40) {
      const q = d / L;
      const [X, Y] = onFloor(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, cx, cy, 1);
      for (let z = 0; z < 7; z++) {
        const py = Math.round(Y - z);
        if (py >= 0 && py < h && X >= 0 && X < w) px.set(Math.round(X), py, z < 2 ? PANEL[0] : z > 5 ? PANEL[4] : PANEL[2]);
      }
    }
  };
  coping(ROOM.x1, ROOM.y0, ROOM.x1, ROOM.y1);
  coping(ROOM.x0, ROOM.y1, ROOM.x1, ROOM.y1);
  return px;
}

// ---------------------------------------------------------------------------------------------
// WHAT STANDS IN IT: the beds, the table, the pillars (and what of them breaks the lens's line)

/** A cast-iron pillar painted limewash-cream, holding up the gallery: its base, its fluted shaft, its capital (cut off at the gallery's beam), standing on (x, y). */
const PIL = ['#3a3830', '#5e5a4c', '#8a8470', '#b0aa92', '#cec8ae'];
const PILLAR_R = 0.32;
const PILLAR_TALL = 104;
function pillarLaid(): Laid {
  const W = 40;
  const H = PILLAR_TALL + 12;
  const p = new Px(W, H);
  const ax = 20;
  const ay = H - 4;
  for (let z = 0; z < PILLAR_TALL; z++) {
    const base = z < 9;
    const cap = z > PILLAR_TALL - 12;
    const r = (base ? 15 : cap ? 13 + Math.min(4, (z - (PILLAR_TALL - 12)) * 0.6) : 10) * (z < 3 ? 1.08 : 1);
    for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) {
      const u = i / r;
      if (Math.abs(u) > 1) continue;
      // (lit from the upper left; fluted down its shaft)
      let tone = u < -0.55 ? 3 : u < 0.05 ? 2 : u < 0.6 ? 1 : 0;
      if (!base && !cap && Math.abs(Math.sin(u * 5.5)) < 0.18 && tone > 0) tone -= 1;
      if (u < -0.35 && u > -0.6 && !base) tone = 4;
      if (base && z === 8) tone = 0;
      if (cap && z === PILLAR_TALL - 11) tone = 0;
      const ey = Math.sqrt(1 - u * u) * (r / 2.2);
      p.set(ax + i, Math.round(ay - z + ey * 0.5), PIL[tone]);
    }
  }
  return { px: p, ax, ay };
}
/** THE THEATRE'S LAYOUT (tiles): where he stands for the Diagnosis over the whole theatre; the table; the beds (`k`: 0 along x, its head toward -x; 3 along y, its head toward -y); the pillars. */
export const LAYOUT = {
  table: [0.8, 1.2] as Pt,
  beds: [
    { at: [-4.4, 1.4] as Pt, k: 0, risen: false },
    { at: [4.6, -0.6] as Pt, k: 0, risen: true },
    { at: [-6.2, -7.6] as Pt, k: 3, risen: false },
    { at: [-3.7, -7.6] as Pt, k: 3, risen: true },
    { at: [3.6, -7.6] as Pt, k: 3, risen: false },
    { at: [6.1, -7.6] as Pt, k: 3, risen: false },
    { at: [-7.6, 4.6] as Pt, k: 0, risen: false },
  ],
  pillars: [[-4.6, -2.6], [3.4, -3.6], [-0.3, -5.6], [7.0, 3.4], [-7.0, -1.0]] as Pt[],
} as const;
/** Each bed's footprint on the floor (its frame, its rails and its castors: 1.35 tiles long by 0.6 wide, about its floor point). */
const bedBox = (at: Pt, k: number, pad = 0.05): Cover => (k === 0 ? { kind: 'bed', x0: at[0] - 0.7 - pad, x1: at[0] + 0.7 + pad, y0: at[1] - 0.32 - pad, y1: at[1] + 0.32 + pad } : { kind: 'bed', x0: at[0] - 0.32 - pad, x1: at[0] + 0.32 + pad, y0: at[1] - 0.7 - pad, y1: at[1] + 0.7 + pad });
/** WHAT BREAKS THE LENS'S LINE in the theatre: every bed, the operating table (a bed of its kind), every pillar. */
export const COVER: Cover[] = [
  ...LAYOUT.beds.map((b) => bedBox(b.at, b.k)),
  { kind: 'bed', x0: LAYOUT.table[0] - 0.78, x1: LAYOUT.table[0] + 0.78, y0: LAYOUT.table[1] - 0.33, y1: LAYOUT.table[1] + 0.33 },
  ...LAYOUT.pillars.map((p): Cover => ({ kind: 'pillar', x: p[0], y: p[1], r: PILLAR_R })),
];
let PIECES: { bed: Sprite[]; table: Sprite; pillar: Laid } | null = null;
function pieces(): NonNullable<typeof PIECES> {
  if (PIECES) return PIECES;
  const all = houseOfQuietPieces();
  const of = (n: string): Sprite[] => all.find((p) => p.name === n)!.frames as Sprite[];
  PIECES = { bed: of('an iron ward bed'), table: of('the operating table')[0], pillar: pillarLaid() };
  return PIECES;
}
const laidOfSprite = (sp: Sprite): Laid => ({ px: sp.img as unknown as Px, ax: sp.ax, ay: sp.ay });
/** The theatre's pieces as things standing at their floor points (or only those within `near` of a point). */
function furniture(cx: number, cy: number, near?: { at: Pt; r: number }): Stood[] {
  const P = pieces();
  const out: Stood[] = [];
  const keep = (a: Pt): boolean => !near || Math.hypot(a[0] - near.at[0], a[1] - near.at[1]) <= near.r;
  for (const b of LAYOUT.beds) if (keep(b.at)) out.push({ at: onFloor(b.at[0], b.at[1], cx, cy, 1), l: laidOfSprite(P.bed[(b.k === 0 ? 0 : 2) + (b.risen ? 1 : 0)]), shadow: 0 });
  if (keep(LAYOUT.table)) out.push({ at: onFloor(LAYOUT.table[0], LAYOUT.table[1], cx, cy, 1), l: laidOfSprite(P.table), shadow: 0 });
  for (const p of LAYOUT.pillars) if (keep(p)) out.push({ at: onFloor(p[0], p[1], cx, cy, 1), l: P.pillar, shadow: 0 });
  return out;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { physician: ActorArt; knight: ActorArt } | null = null;
export function figures(): NonNullable<typeof ART> {
  ART ??= { physician: makePhysicianActionArt(), knight: makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt };
  return ART;
}
/** The game's own Physician, as he is (his old tonic beside the new Diagnosis). */
export function oldFrame(move: string, t: number, view: View): Laid {
  return frameOf(PHYSICIAN, move, t, view);
}
const atOf = (cx: number, cy: number): At => isoAt({ cx, cy });
/** A figure at floor point P facing the floor way (dx, dy): its view and whether it is flipped (as the game shows them). */
function facingOf(dx: number, dy: number): { v: View; flip: boolean } {
  const sx = dx - dy;
  const sy = dx + dy;
  return { v: sy > 0 ? 'front' : 'back', flip: sx < 0 };
}
/** The knight at K, looking toward T: standing, running, struck. */
function knightAt(K: Pt, T: Pt, t: number, cx: number, cy: number, act: 'stand' | 'walk' | { reel: number } = 'stand'): Stood {
  const { knight } = figures();
  const { v, flip } = facingOf(T[0] - K[0], T[1] - K[1]);
  const l = typeof act === 'object' ? frameAt(knight, v, 'reel', act.reel) : frameAt(knight, v, act, t);
  return { at: onFloor(K[0], K[1], cx, cy, 1), l, flip, shadow: 9 };
}
/** Him at B, a frame of `move` (`m` seconds in: before it, his stand; after it, his stand again). */
function himAt(B: Pt, view: View, move: string, m: number, long: number, cx: number, cy: number): Stood {
  const { physician } = figures();
  const l = m < 0 ? frameAt(physician, view, 'stand', m + 10) : m < long ? frameAt(physician, view, move, m) : frameAt(physician, view, 'stand', m - long);
  return { at: onFloor(B[0], B[1], cx, cy, 1), l, flip: false, shadow: 14 };
}
/** A point of him (his own lengths) on the floor (tiles) and on the picture, him at B seen `view`. */
function ofHim(B: Pt, view: View, p: V3, cx: number, cy: number): { floor: Pt; pic: Pt } {
  const w = waysOf(view);
  const floor: Pt = [B[0] + (w.fwd[0] * p[0] + w.left[0] * p[1]) / TILE3, B[1] + (w.fwd[1] * p[0] + w.left[1] * p[1]) / TILE3];
  const [X0, Y0] = onFloor(B[0], B[1], cx, cy, 1);
  const r = project(p, view);
  return { floor, pic: [X0 + r[0], Y0 + r[1]] };
}
/** LAY A SCENE: the floor and what lies on it; the figures' shadows; then the figures and the pieces from the top of the picture down; then what is over everything. */
function scene(base: Px, floor: (p: Px) => void, figs: Stood[], over: (p: Px) => void = () => {}, shake: Pt = [0, 0]): Px {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  floor(p);
  for (const s of figs) if (s.shadow) shadow(p, s.at[0], s.at[1], s.shadow, 1);
  for (const s of [...figs].sort((a, b) => a.at[1] - b.at[1])) lay(p, s.l, s.at[0], s.at[1], 1, undefined, s.flip);
  over(p);
  return shaken(p, shake);
}
/** The floor shaking at `m` seconds (the game's shake as a blow lands): a few pixels, dying away. */
export function shakeOf(m: number, hits: ReadonlyArray<readonly [number, number]>): [number, number] {
  let a = 0;
  for (const [at, amount] of hits) {
    const s = m - at;
    if (s >= 0 && s < 0.35) a = Math.max(a, amount * (1 - s / 0.35));
  }
  const fr = Math.floor(m * 30);
  return [Math.round((hash(fr, 1, 7971) - 0.5) * 2 * a), Math.round((hash(fr, 2, 7971) - 0.5) * 2 * a)];
}
function shaken(p: Px, d: Pt): Px {
  if (!d[0] && !d[1]) return p;
  const out = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    const sy = Math.min(p.h - 1, Math.max(0, y - d[1]));
    for (let x = 0; x < p.w; x++) {
      const sx = Math.min(p.w - 1, Math.max(0, x - d[0]));
      const i = (sy * p.w + sx) * 4;
      out.d.set(p.d.subarray(i, i + 4), (y * p.w + x) * 4);
    }
  }
  return out;
}
/** A path of floor points (tiles) walked from moment to moment: where on it at `m`, whether moving, and where to. */
function along(path: ReadonlyArray<readonly [number, number, number]>, m: number): { at: Pt; moving: boolean; to: Pt } {
  if (m <= path[0][0]) return { at: [path[0][1], path[0][2]], moving: false, to: [path[1][1], path[1][2]] };
  for (let i = 1; i < path.length; i++) {
    const [t1, x1, y1] = path[i];
    const [t0, x0, y0] = path[i - 1];
    if (m <= t1) {
      const u = smooth((m - t0) / Math.max(1e-6, t1 - t0));
      const moving = (x1 !== x0 || y1 !== y0) && u > 0.02 && u < 0.98;
      return { at: [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u], moving, to: [x1, y1] };
    }
  }
  const last = path[path.length - 1];
  return { at: [last[1], last[2]], moving: false, to: [last[1], last[2]] };
}
/** A path said as tiles before him and to his left, made floor points. */
const pathFrom = (B: Pt, view: View, rel: ReadonlyArray<readonly [number, number, number]>): [number, number, number][] => rel.map(([t, f, l]) => {
  const q = spot(B, view, f, l);
  return [t, q[0], q[1]];
});

// ---------------------------------------------------------------------------------------------
// THE RAP: the knight 2.6 tiles before him, in the star; he steps back out of it while the cane is held up (or is struck)

export function rapScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const B: Pt = [0, 0];
  const at = atOf(cx, cy);
  const caught = view === 'back';
  const rel: [number, number, number][] = caught ? [[0, 2.6, 0.6], [1, 2.6, 0.6]] : [[0, 2.6, 0.4], [0.4, 2.6, 0.4], [0.85, 4.1, 1.2], [3, 4.1, 1.2]];
  const k = along(pathFrom(B, view, rel), m);
  const struck = caught && m >= RAP9_HIT && m < RAP9_HIT + 0.4;
  const figs = [himAt(B, view, 'attack', m, RAP9_LONG, cx, cy), knightAt(k.at, k.moving ? k.to : B, t, cx, cy, struck ? { reel: m - RAP9_HIT } : k.moving ? 'walk' : 'stand')];
  return scene(base, (p) => paintRap(p, at, m, B, view), figs, () => {}, shakeOf(m, [[RAP9_HIT, 4]]));
}
export const RAP_PASS = LEAD + RAP9_LONG;

// ---------------------------------------------------------------------------------------------
// THE DRAW: the knight 3 tiles before him in the lane; caught (from in front: his word hangs over the Physician's head after), or
// out of the lane while it is held (from behind)

export function drawScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const B: Pt = [0, 0];
  const at = atOf(cx, cy);
  const caught = view === 'front';
  const rel: [number, number, number][] = caught ? [[0, 3.1, 0.2], [1, 3.1, 0.2]] : [[0, 3.1, 0.2], [0.45, 3.1, 0.2], [0.9, 3.0, -1.4], [4, 3.0, -1.4]];
  const k = along(pathFrom(B, view, rel), m);
  const struck = caught && m >= 32 / 30 && m < 32 / 30 + 0.4;
  const figs = [himAt(B, view, 'draw', m, DRAW9_LONG, cx, cy), knightAt(k.at, k.moving ? k.to : B, t, cx, cy, struck ? { reel: m - 32 / 30 } : k.moving ? 'walk' : 'stand')];
  const word = (p: Px): void => {
    // THE WORD HE TOOK, over his head (the game's own: art/physician_shots.ts drawHeldWord), from as he pushes the plunger home
    if (!caught || m < DRAW9.push[0]) return;
    // (the game's pixels are half the pictures' here: HELD_WORD_UP game pixels up, drawn at twice its size)
    const [X, Y] = onFloor(B[0], B[1], cx, cy, 1);
    drawHeldWord(new PxCtx(p, 2) as unknown as CanvasRenderingContext2D, X / 2, Y / 2 - HELD_WORD_UP, 'fire', m - DRAW9.push[0]);
  };
  return scene(base, (p) => paintDraw(p, at, m, B, view), figs, word, shakeOf(m, [[32 / 30, 2]]));
}
export const DRAW_PASS = LEAD + DRAW9_LONG + 0.3;

// ---------------------------------------------------------------------------------------------
// DIAGNOSIS AND THE OPERATION

/** His frame of the Diagnosis `m` seconds in, its look looped as the game would loop it. */
const diagT = (m: number): number => {
  const [l0, l1] = DIAG.loop;
  return m < l0 ? m : l0 + ((m - l0) % (l1 - l0));
};
interface Diag {
  B: Pt;
  view: View;
  hero: (m: number) => { at: Pt; moving: boolean; to: Pt };
  cover: ReadonlyArray<Cover>;
  /** What stands in the room (the beds, the table, the pillars), laid among the figures. */
  stuff: (cx: number, cy: number) => Stood[];
  /** The dial over his head's size (picture pixels). */
  dial?: number;
}
const FULL = new Map<Diag, number>();
/** When the mark comes full (seconds into the Diagnosis), as the beam follows the hero and the cover breaks its line. */
function fullOf(D: Diag, cx: number, cy: number): number {
  if (!FULL.has(D)) {
    const L = ofHim(D.B, D.view, lensAt('diagnose', DIAG.loop[0]), cx, cy).floor;
    FULL.set(D, diagnosis(L, (m) => D.hero(m).at, DIAG.up, 30, D.cover).full ?? 99);
  }
  return FULL.get(D)!;
}
/** A figure's picture lit at `l` (opLight at its floor point): every pixel of it darkened in the dark, or lit hard in the spotlight. */
function litLaid(l: Laid, k: number): Laid {
  if (Math.abs(k - 1) < 1e-3) return l;
  const q = new Px(l.px.w, l.px.h);
  const s = l.px.d;
  const d = q.d;
  for (let i = 0; i < s.length; i += 4) {
    if (!s[i + 3]) continue;
    const [r, g, b] = litRGB(s[i], s[i + 1], s[i + 2], k);
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = s[i + 3];
  }
  return { px: q, ax: l.ax, ay: l.ay };
}
/** The floor point (tiles) of a picture point on the floor. */
const floorAt = (X: number, Y: number, cx: number, cy: number): Pt => {
  const a = (X + 0.5 - cx) / 32;
  const b = (Y + 0.5 - cy) / 16;
  return [(a + b) / 2, (b - a) / 2];
};
/**
 * THE DIAGNOSIS AND THE OPERATION, `t` seconds into a scene: him at B, the hero along his path, the beam on him till the mark is full;
 * then (2 Nov, “Bigger operation”) THE THEATRE PLUNGED DARK, one hard spotlight from his lens on where the hero stood, his instruments
 * flung out round its edge, HELD, closing in from all round in two frames with the strike; stuck in the boards; plucked back; the light
 * back. `caught`: the hero stays in the light (else he runs out of it while they are held).
 */
function diagScene(D: Diag, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const at = atOf(cx, cy);
  const I: Iso = { cx, cy };
  const full = fullOf(D, cx, cy);
  const op = m - full;
  const L = ofHim(D.B, D.view, lensAt('diagnose', DIAG.loop[0]), cx, cy).floor;
  const k = D.hero(m);
  const field = D.hero(full).at;
  const st = op >= 0 ? null : diagnosis(L, (q) => D.hero(q).at, DIAG.up, Math.max(DIAG.up, m), D.cover);
  const hit = op >= OP_HIT && op < OP_HIT + 0.4 && Math.hypot(k.at[0] - field[0], k.at[1] - field[1]) <= FIELD.r;
  const him = op < 0 ? himAt(D.B, D.view, 'diagnose', m < 0 ? m : diagT(m), 99, cx, cy) : himAt(D.B, D.view, 'operate', op, OP_LONG, cx, cy);
  const knight = knightAt(k.at, k.moving ? k.to : D.B, t, cx, cy, hit ? { reel: op - OP_HIT } : k.moving ? 'walk' : 'stand');
  const dark = op >= 0 ? opDark(op) : 0;
  // (in the dark, each figure lit by how lit its own floor point is: the hero hard in the spotlight, the rest dark)
  const lightOf = (P: Pt): number => (dark > 0 ? opLight(P[0] - field[0], P[1] - field[1], op) : 1);
  const things: { s: Stood; floor: Pt }[] = [
    ...D.stuff(cx, cy).map((s0) => ({ s: s0, floor: floorAt(s0.at[0], s0.at[1], cx, cy) })),
    { s: him, floor: D.B },
    { s: knight, floor: k.at },
  ];
  const figs: Stood[] = things.map(({ s: s0, floor: f0 }) => (dark > 0 ? { ...s0, l: litLaid(s0.l, lightOf(f0)) } : s0));
  // (the beam on from as the lens comes up; tracking him; out as the theatre goes dark: his lens throws the spotlight then)
  const on = m < DIAG.up - 0.1 ? 0 : op < 0 ? clamp01((m - DIAG.up + 0.1) / 0.25) : 1 - clamp01(op / OPERATION.fall[1]);
  const aim = op < 0 ? (st?.aim ?? 0) : Math.atan2(field[1] - L[1], field[0] - L[0]);
  const lensNow = op < 0 ? lensAt('diagnose', m < 0 ? 0 : diagT(m)) : lensAt('operate', Math.min(op, OP_LONG));
  const lensPic = ofHim(D.B, D.view, lensNow, cx, cy).pic;
  const coat = at(D.B[0], D.B[1], 58);
  const [, kY] = at(k.at[0], k.at[1]);
  const floor = (p: Px): void => {
    paintBeam(p, I, L, aim, D.cover, on, inRoom);
    if (op < 0 && m >= DIAG.up && st) paintMark(p, at, k.at[0], k.at[1], st.fill, st.lit, m);
    if (op >= 0) paintField(p, at, field[0], field[1], op);
    // THE DARK over the floor and its walls, the spotlight lit hard; its edge
    if (dark > 0) {
      const d = p.d;
      for (let Y = 0; Y < p.h; Y++) {
        for (let X = 0; X < p.w; X++) {
          const [fx, fy] = floorAt(X, Y, cx, cy);
          const l = opLight(fx - field[0], fy - field[1], op);
          if (Math.abs(l - 1) < 1e-3) continue;
          const i = (Y * p.w + X) * 4;
          const [r, g, b] = litRGB(d[i], d[i + 1], d[i + 2], l);
          d[i] = r;
          d[i + 1] = g;
          d[i + 2] = b;
        }
      }
      paintSpotEdge(p, at, field[0], field[1], op);
    }
    if (op >= 0) paintTools(p, at, field[0], field[1], op, coat, D.B, (fy) => fy < kY);
  };
  const over = (p: Px): void => {
    if (op >= 0) paintTools(p, at, field[0], field[1], op, coat, D.B, (fy) => fy >= kY);
    // the shaft of light from the lens to where it falls (the hero, while he looks)
    const target = op < 0 ? k.at : field;
    const lit = op < 0 ? (st?.lit ? 1 : 0.35) : 1;
    if (on > 0 && op < 0) paintShaft(p, lensPic, at(target[0], target[1], 14), on * lit);
    // (the spotlight's cone from his lens down through the dark onto the field)
    if (op >= 0) paintSpotCone(p, lensPic, at(field[0], field[1]), 32 * FIELD.r * Math.SQRT2, 16 * FIELD.r * Math.SQRT2, op);
    if (op >= 0) paintBurnLine(p, lensPic, at(field[0], field[1]), op - OP_HIT);
    // the mark over him: the dial over his head (full and white as the field is marked)
    if (m >= DIAG.up && op < OP_STRIKE[0]) {
      const [X, Y] = at(k.at[0], k.at[1], 64);
      paintDial(p, X, Y, op >= 0 ? 1 : st?.fill ?? 0, op >= 0 || !!st?.lit, D.dial ?? 7);
    }
  };
  return scene(base, floor, figs, over, shakeOf(op, [[OP_HIT, 8]]));
}
/** OVER THE WHOLE THEATRE FROM ABOVE: him from behind at the theatre's near side; the knight in the open, ducking behind a bed as the mark fills, out, behind a pillar as it drains, caught in the open: it fills; the operation; he runs from the field. */
export const ARENA_DIAG: Diag = {
  B: [-1.2, 6.6],
  view: 'back',
  cover: COVER,
  hero: (m) => along(ARENA_PATH(), m),
  stuff: (cx, cy) => furniture(cx, cy),
};
let AP: [number, number, number][] | null = null;
function ARENA_PATH(): [number, number, number][] {
  if (AP) return AP;
  const A: Pt = [-1.6, -0.6];
  const H1: Pt = [-4.95, 0.75];
  const H2: Pt = [-4.85, -3.25];
  const C3: Pt = [-2.2, -4.4];
  const E: Pt = [-5.7, -5.6];
  // (2 Nov: the mark fills in 1.4 s now: he ducks behind the bed as it nears full, behind a pillar as it drains, and is caught in the open)
  const base: [number, number, number][] = [[0, A[0], A[1]], [1.4, A[0], A[1]], [1.95, H1[0], H1[1]], [2.75, H1[0], H1[1]], [3.3, H2[0], H2[1]], [3.95, H2[0], H2[1]], [4.35, C3[0], C3[1]]];
  AP = base;
  // (where the mark comes full, he sees the field marked round him and runs out of it while the Physician winds up)
  const L0 = ofHim(ARENA_DIAG.B, 'back', lensAt('diagnose', DIAG.loop[0]), 0, 0).floor;
  const full = diagnosis(L0, (m) => along(base, m).at, DIAG.up, 30, COVER).full ?? 99;
  AP = [...base, [full + 0.25, C3[0], C3[1]], [full + 1.0, E[0], E[1]]];
  return AP;
}
export function diagArena(t: number, base: Px, cx: number, cy: number): Px {
  return diagScene(ARENA_DIAG, t, base, cx, cy);
}
export const diagArenaFull = (): number => fullOf(ARENA_DIAG, 0, 0);
export const DIAG_ARENA_PASS = (): number => LEAD + diagArenaFull() + OP_HIT + 1.3;
/** The close one's bed, laid where the close one's cover is. */
function closeBed(view: View, cx: number, cy: number): Stood {
  const bedAt = spot([0, 0], view, 3.6, 1.6);
  return { at: onFloor(bedAt[0], bedAt[1], cx, cy, 1), l: laidOfSprite(pieces().bed[view === 'front' ? 2 : 0]), shadow: 0 };
}
/** CLOSE: him at (0, 0), the knight 4.5 tiles before him; one bed beside the knight's way; the mark fills, he ducks behind the bed, steps out, is caught; the operation; he runs from the field. */
const CLOSE = new Map<string, Diag>();
export function diagClose(view: View, caught = false): Diag {
  const key = `${view}${caught}`;
  if (CLOSE.has(key)) return CLOSE.get(key)!;
  const B: Pt = [0, 0];
  const bedAt = spot(B, view, 3.6, 1.6);
  const bedK = view === 'front' ? 3 : 0;
  const cover: Cover[] = [bedBox(bedAt, bedK)];
  const base = pathFrom(B, view, [[0, 4.4, -0.3], [1.5, 4.4, -0.3], [2.0, 4.6, 2.35], [2.9, 4.6, 2.35], [3.2, 4.3, 0.4]]);
  const D0: Diag = { B, view, cover, hero: (m) => along(base, m), stuff: (cx, cy) => [closeBed(view, cx, cy)] };
  const L = ofHim(B, view, lensAt('diagnose', DIAG.loop[0]), 0, 0).floor;
  const full = diagnosis(L, (m) => along(base, m).at, DIAG.up, 30, cover).full ?? 99;
  // (the dark falls; he runs out of the spotlight while the instruments are held round it; or, `caught`, he stays in it)
  const run = caught ? [] : pathFrom(B, view, [[full + 0.25, 4.3, 0.4], [full + 1.0, 4.7, -3.6]]);
  const path = [...base, ...run];
  const D: Diag = { ...D0, hero: (m) => along(path, m) };
  CLOSE.set(key, D);
  return D;
}

export function diagCloseScene(view: View, t: number, base: Px, cx: number, cy: number, caught = false): Px {
  return diagScene(diagClose(view, caught), t, base, cx, cy);
}
export const diagClosePass = (view: View, caught = false): number => LEAD + fullOf(diagClose(view, caught), 0, 0) + OP_HIT + 1.2;
/** When the mark comes full in the close one (seconds into the scene). */
export const diagCloseFull = (view: View, caught = false): number => LEAD + fullOf(diagClose(view, caught), 0, 0);
/** When the mark comes full over the whole theatre (seconds into the scene). */
export const diagArenaFullAt = (): number => LEAD + fullOf(ARENA_DIAG, 0, 0);

// ---------------------------------------------------------------------------------------------
// ROUNDS: the knight 3 tiles from him; out past the marked ring while he holds the cane up (from behind), or caught by it

export function roundsScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const m = t - LEAD;
  const B: Pt = [0, 0];
  const at = atOf(cx, cy);
  const caught = view === 'front';
  const rel: [number, number, number][] = caught ? [[0, 3.0, -1.0], [1, 3.0, -1.0]] : [[0, 3.0, -0.6], [0.25, 3.0, -0.6], [0.95, 7.3, -1.6], [5, 7.3, -1.6]];
  const k = along(pathFrom(B, view, rel), m);
  const S = spot(B, view, RINGS.ahead, RINGS.left);
  const d = Math.hypot(k.at[0] - S[0], k.at[1] - S[1]);
  // (struck by a ring as it passes over him)
  let reel = -1;
  for (let i = 0; i < 3; i++) {
    const s = m - ROUNDS9_HITS[i];
    const r = s >= 0 && s <= RINGS.out ? 0.2 + (RINGS.reach - 0.2) * (1 - (1 - s / RINGS.out) ** 1.6) : -9;
    if (Math.abs(r - d) < 0.4 && caught) reel = 0;
  }
  void reel;
  const passed = caught ? ROUNDS9_HITS.map((h) => h + 0.08).find((h) => m >= h && m < h + 0.4) : undefined;
  const figs = [himAt(B, view, 'rounds', m, ROUNDS9_LONG, cx, cy), knightAt(k.at, k.moving ? k.to : B, t, cx, cy, passed !== undefined ? { reel: m - passed } : k.moving ? 'walk' : 'stand')];
  const hush = (p: Px): void => {
    // (the Hush on him: a puff of it round the caught knight after each ring passes)
    if (!caught) return;
    const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
    const first = ROUNDS9_HITS[0] + 0.08;
    if (m >= first) drawHushCloud(g, at as unknown as (x: number, y: number) => [number, number], k.at[0], k.at[1], Math.min(m - first, 3.0), 3);
  };
  return scene(base, (p) => paintRounds(p, at, m, B, view), figs, hush, shakeOf(m, ROUNDS9_HITS.map((h, i) => [h, 2 + i] as const)));
}
export const ROUNDS_PASS = LEAD + ROUNDS9_LONG;

// ---------------------------------------------------------------------------------------------
// HIS OLD TONIC (the game's own, as he is: art/physician_moves.ts and art/physician_shots.ts), for beside the new Diagnosis

export function oldTonicScene(t: number, base: Px, cx: number, cy: number): Px {
  const m = t;
  const B: Pt = [0, 0];
  const K: Pt = [3.6, 0.4];
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
  const at = (x: number, y: number): [number, number] => onFloor(x, y, cx, cy, 1);
  const from: Pt = [B[0] + 0.99, B[1] - 0.23];
  const s = m - PH_TONIC.hit;
  const lands: Pt[] = [K, [K[0], K[1] - 1.7], [K[0], K[1] + 1.7]];
  shadow(p, ...at(B[0], B[1]), 14);
  shadow(p, ...at(K[0], K[1]), 9);
  lands.forEach((q, i) => {
    if (s >= 0 && s < 0.55) drawPhialFlight(g, at, from[0], from[1], q[0], q[1], s, i * 1.7);
    if (s >= 0.55) drawHushCloud(g, at, q[0], q[1], s - 0.55, i);
  });
  const figs: Stood[] = [{ at: at(B[0], B[1]), l: oldFrame('tonic', Math.min(m, 1.99), 'front'), shadow: 0 }, knightAt(K, B, m, cx, cy)];
  for (const f of figs.sort((a, b) => a.at[1] - b.at[1])) lay(p, f.l, f.at[0], f.at[1], 1, undefined, f.flip);
  return p;
}
export { BEAM, furniture };
export type { Keep };
