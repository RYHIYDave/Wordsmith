// Pictures of THE RAT KING DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): the sluices opening over
// the whole cistern from above, his bite, his stolen words and his unknotting by Movement 9 (art/ratking_action.ts, RATKING_ACTION;
// the lanes, the flood, the marks, the word and the swarm, art/ratking_action_fx.ts), on a stand-in for floor 12's King's Cistern,
// with the knight for size, each figure at its floor point and sorted by it, as the game sorts them. Made outside a browser
// (tools/ratking_action_film.ts, tools/ratking_action_sheet.ts). Nothing of the game imports it.
// THE CISTERN IS A STAND-IN, in the Undercity's own colours (art/undercity.ts): 16 tiles each way, wet brick walls on its two far
// sides (the sluice gates in the one to the left), its floor flagged in the lanes the water runs down and brick-paved on the dry
// ledges between them, coping stones along their edges, the drain's grating along its near right edge. The game's own ground is the
// game's.

import { Px, rgba } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { RK_ROLL, ROLL_PACE, makeRatKingArt } from '../art/rat_king';
import { BITE9, BITE9_HIT, ROLL9, ROLL9_HIT, UNKNOT9, UNKNOT9_HIT, WORDS9, WORDS9_HIT, makeRatKingActionArt, roll9Along } from '../art/ratking_action';
import { CISTERN, FLOOD, LANES, SLUICES, SWARM9, floodSpan, isoAt, laneOf, paintBurstRing, paintFlood, paintGate, paintLaneMarks, paintRollLane, paintSwarm9, paintWedge, paintWord, paintWordBurst, paintWordLine } from '../art/ratking_action_fx';
import type { At, Iso, Word } from '../art/ratking_action_fx';
import { drawChargeLane } from '../art/charge_lane';
import { frameAt } from './action_f3_scene';
import { lay, shadow } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
type P2 = [number, number];
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};
const H = CISTERN.half;
/** The wall's height (picture pixels). */
const WALL_H = 118;

// ---------------------------------------------------------------------------------------------
// THE CISTERN

const BRICK = ['#1c1418', '#2e2023', '#47302c', '#5a3c33', '#6e4a3c', '#86604a'];
const PAVE = ['#211a20', '#3c2a27', '#4b332b', '#563b30', '#6e4c3a'];
const FLAG = ['#1a1b22', '#262731', '#30313b', '#3a3b45', '#4a4b54', '#5e6268'];
const COPING = ['#26262e', '#45454c', '#56565b', '#6e6d70'];
const SLIME = ['#1e271c', '#2f3b24', '#45522f'];
const DEEP = '#07080c';
const IRON = ['#16171d', '#2a2b33', '#45454d'];
const BASES = new Map<string, Px>();
/** The cistern's floor and its two far walls (no gates: they are his, painted as they open), `w` by `h`, its middle at I. */
export function cisternBase(w: number, h: number, I: Iso): Px {
  const key = `${w}x${h}@${I.cx},${I.cy}`;
  const had = BASES.get(key);
  if (had) return had;
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - I.cx) / 32;
      const b = (Y + 0.5 - I.cy) / 16;
      const x = (a + b) / 2;
      const y = (b - a) / 2;
      const g = hash(X >> 1, Y >> 1, 7201);
      let c = DEEP;
      if (Math.abs(x) <= H && Math.abs(y) <= H) {
        const i = laneOf(y);
        if (x > H - 0.55) {
          // the drain along its near right edge: an iron grating over the dark
          const bar = Math.abs(((y + 8) % 0.25) - 0.125) < 0.05 || x > H - 0.1 || x < H - 0.48;
          c = bar ? IRON[(X + Y) % 3 === 0 ? 2 : 1] : '#030405';
        } else if (i >= 0) {
          // a lane: big wet flags laid along it, slime streaked down it the way the water runs, its far edge's step in shadow
          const L = LANES[i];
          const u = x * 1.0;
          const v = (y - L.y) / (2 * L.half) + 0.5;
          const joint = Math.abs(u - Math.round(u)) < 0.035 || Math.abs(v * 3 - Math.round(v * 3)) < 0.04;
          c = joint ? FLAG[0] : g > 0.8 ? FLAG[3] : FLAG[2];
          const streak = Math.sin(y * 9 + Math.sin(x * 0.7) * 2) + hash(Math.floor(x * 3), Math.floor(y * 10), 7202) * 0.8;
          if (streak > 1.35) c = SLIME[g > 0.5 ? 1 : 0];
          if (g > 0.985) c = FLAG[5];
          const fromNear = L.y + L.half - y;
          const fromFar = y - (L.y - L.half);
          if (fromFar < 0.16) c = fromFar < 0.06 ? '#120e10' : BRICK[1];
          if (fromNear < 0.05) c = COPING[0];
        } else {
          // a dry ledge: brick paving laid basket-wise, a coping of pale stones along each edge, a sheen of wet
          const near = LANES.map((L) => Math.min(Math.abs(y - (L.y - L.half)), Math.abs(y - (L.y + L.half)))).reduce((p, q) => Math.min(p, q), 9);
          if (near < 0.3) {
            const stone = Math.abs(((x + 8) % 0.9) - 0.45) > 0.42;
            c = stone ? COPING[0] : near < 0.07 ? COPING[3] : near > 0.24 ? COPING[1] : COPING[2];
          } else {
            const bx = Math.floor((x + 8) * 2);
            const by = Math.floor((y + 8) * 2);
            const flip = (bx + by) % 2 === 0;
            const fx = ((x + 8) * 2) % 1;
            const fy = ((y + 8) * 2) % 1;
            const along = flip ? fy : fx;
            const joint = fx < 0.07 || fy < 0.07 || Math.abs(along - 0.5) < 0.04;
            c = joint ? PAVE[0] : g > 0.75 ? PAVE[4] : g > 0.35 ? PAVE[3] : PAVE[2];
            if (hash(X >> 2, Y >> 1, 7203) > 0.97) c = PAVE[1];
          }
        }
        // the floor's edge along its near left side
        if (y > H - 0.12) c = COPING[x > H - 0.55 ? 1 : 2];
      }
      px.set(X, Y, c);
    }
  }
  // THE WALLS: wet brick rising from its two far edges, slime at their feet, darker toward the vault
  const at = isoAt(I);
  const wall = (X: number, Y: number, along: number, z: number, lit: boolean): void => {
    if (X < 0 || Y < 0 || X >= w || Y >= h) return;
    const row = Math.floor(z / 8);
    const off = row % 2 ? 0.25 : 0;
    const k = (along + off) * 2;
    const joint = z % 8 < 1.2 || Math.abs(k - Math.round(k)) < 0.05;
    const g = hash(Math.floor(k), row, 7211);
    let c = joint ? BRICK[0] : BRICK[g > 0.7 ? 4 : g > 0.3 ? 3 : 2];
    if (!lit && !joint) c = BRICK[g > 0.7 ? 3 : 2];
    if (z < 14 && hash(X, Y >> 1, 7212) < 1 - z / 14) c = SLIME[z < 5 ? 2 : 1];
    if (z > WALL_H - 26 && hash(X >> 1, Y >> 1, 7213) < (z - WALL_H + 26) / 30) c = BRICK[1];
    if (z > WALL_H - 3) c = COPING[z > WALL_H - 1 ? 3 : 2];
    px.set(X, Y, c);
  };
  for (let q = -H; q <= H; q += 1 / 32) {
    const [Xa, Ya] = at(-H, q);
    for (let z = 0; z <= WALL_H; z++) wall(Math.round(Xa), Math.round(Ya - z), q, z, true);
    const [Xb, Yb] = at(q, -H);
    for (let z = 0; z <= WALL_H; z++) wall(Math.round(Xb), Math.round(Yb - z), q, z, false);
  }
  // (each gate's arch left dark until he opens it)
  BASES.set(key, px);
  return px;
}

// ---------------------------------------------------------------------------------------------
// THE FIGURES

let ART: { king: ActorArt; old: ActorArt; knight: ActorArt } | null = null;
export function figures(): { king: ActorArt; old: ActorArt; knight: ActorArt } {
  if (!ART) ART = { king: makeRatKingActionArt(), old: makeRatKingArt(), knight: makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt };
  return ART;
}
/** How a figure is drawn facing a way on the floor: from in front if it faces down the picture, from behind if up it; flipped if it faces to the picture's left. */
export function drawnAs(dx: number, dy: number): { view: View; flip: boolean } {
  return { view: dx + dy >= 0 ? 'front' : 'back', flip: dx - dy < 0 };
}
interface Standing {
  at: P2;
  l: Laid;
  flip?: boolean;
  shadow?: number;
}
function layScene(base: Px, floor: (p: Px) => void, stood: Standing[]): Px {
  const px = new Px(base.w, base.h);
  px.d.set(base.d);
  floor(px);
  for (const s of stood) if (s.shadow) shadow(px, s.at[0], s.at[1], s.shadow, 1);
  for (const s of [...stood].sort((a, b) => a.at[1] - b.at[1])) lay(px, s.l, s.at[0], s.at[1], 1, undefined, s.flip);
  return px;
}
/** The picture shaken a little at a blow (whole pixels). */
function shaken(p: Px, t: number, hits: ReadonlyArray<readonly [number, number]>): Px {
  let dx = 0;
  let dy = 0;
  for (const [at, big] of hits) {
    const s = t - at;
    if (s < 0 || s > 0.25) continue;
    const k = big * (1 - s / 0.25);
    dx += Math.round(Math.sin(s * 90) * k);
    dy += Math.round(Math.cos(s * 70) * k * 0.6);
  }
  if (!dx && !dy) return p;
  const out = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const X = Math.min(p.w - 1, Math.max(0, x - dx));
    const Y = Math.min(p.h - 1, Math.max(0, y - dy));
    const i = (Y * p.w + X) * 4;
    out.d.set(p.d.subarray(i, i + 4), (y * p.w + x) * 4);
  }
  return out;
}
/** The knight at a floor point, facing a way, walking or standing; bobbing and foam about him if he is being carried by the flood. */
function knightStood(I: Iso, at: P2, face: P2, moving: boolean, t: number, carried = 0): Standing[] {
  const { knight } = figures();
  const [X, Y] = isoAt(I)(at[0], at[1]);
  const { view, flip } = drawnAs(face[0], face[1]);
  let l = frameAt(knight, view, moving ? 'walk' : 'stand', t);
  if (carried > 0) l = { ...l, ay: l.ay - Math.round(3 * Math.sin(t * 18)) };
  return [{ at: [X, Y], l, flip, shadow: carried > 0 ? 0 : 9 }];
}
/** Splashes about the knight as the flood carries him. */
function splashAbout(px: Px, at: At, p: P2, t: number): void {
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + t * 3;
    const age = (t * 2.5 + hash(i, 1, 7221)) % 1;
    const r = 0.35 + 0.3 * age;
    const [x, y] = at(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, 14 * Math.sin(Math.PI * age));
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X > 0 && Y > 0 && X < px.w - 1 && Y < px.h - 1) px.set(X, Y, age < 0.5 ? '#eef0e4' : '#aab2a4');
  }
}

/** The gates, the lanes' warning and the flood, `h` seconds into an opening of the sluices (or none, `h` null: the gates shut), on a picture whose cistern's middle is at I; the flood parted round `him`. The cistern's own: nothing of his. */
function sluiceFloor(px: Px, I: Iso, h: number | null, him: P2 | null): void {
  LANES.forEach((L, i) => paintGate(px, I, L, i, h ?? -1));
  if (h === null) return;
  paintLaneMarks(px, isoAt(I), h);
  paintFlood(px, I, h, him);
}

// ---------------------------------------------------------------------------------------------
// THE WHOLE CISTERN FROM ABOVE (his fix, 2 Nov 2026: the sluices an arena hazard): THE SLUICES OPEN ON THEIR OWN while he fights. The
// first time while he spits a stolen word at the knight on a ledge (the knight steps along the ledge out of its line; the flood runs
// down every lane past them both); the knight crosses back over the drained lane; the second time while HE ROLLS down the ledge at
// him: the knight steps down into a lane out of the ball's way, sees the lanes marked, and is back up on the ledge before the
// gates burst. In the film the two are 7.6 s apart; in a fight, as often as the main chat sets (SLUICES.every, a suggestion of 14).

/** When each opening begins and when he spits his word and rolls (seconds of the scene). */
export const ARENA = { him: [-6.0, 2.4] as P2, open1: 0.0, words: 0.25, roll: 7.0, open2: 7.6, long: 14.2 } as const;
/** His roll from above: along the ledge, the way the picture's x runs. */
const ROLL_WAY: P2 = [1, 0];
/** His word: where the knight stands as its line locks, and where it ends (the line run on to the cistern's edge). */
const WORD_AT: P2 = [1.6, -2.4];
const KNIGHT_WAY: [number, P2][] = [
  [0, WORD_AT],
  [ARENA.words + WORDS9.lock + 0.03, WORD_AT],
  [ARENA.words + WORDS9.lock + 0.55, [3.9, -2.4]],
  [5.95, [3.9, -2.4]],
  [6.95, [1.2, 2.4]],
  [ARENA.roll + 0.3, [1.2, 2.4]],
  [ARENA.roll + 0.75, [1.2, 4.05]],
  [ARENA.roll + 1.95, [1.2, 4.05]],
  [ARENA.roll + 2.35, [0.7, 2.45]],
];
/** The knight in the arena at `t`: where, which way, walking. */
export function knightIn(t: number): { at: P2; face: P2; moving: boolean } {
  const kingAt = rollerAt(t);
  for (let i = 0; i + 1 < KNIGHT_WAY.length; i++) {
    const [t0, a] = KNIGHT_WAY[i];
    const [t1, b] = KNIGHT_WAY[i + 1];
    if (t >= t0 && t < t1) {
      const k = smooth((t - t0) / (t1 - t0));
      const moving = Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.01;
      const at: P2 = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      return { at, face: moving ? [b[0] - a[0], b[1] - a[1]] : [kingAt[0] - at[0], kingAt[1] - at[1]], moving };
    }
  }
  const p = KNIGHT_WAY[KNIGHT_WAY.length - 1][1];
  return { at: p, face: [kingAt[0] - p[0], kingAt[1] - p[1]], moving: false };
}
/** Which opening of the sluices is under way at `t` and how far in (seconds), or null: the cistern's own clock. */
export function openingAt(t: number): number | null {
  for (const s of [ARENA.open2, ARENA.open1]) if (t >= s && t < s + SLUICES.burst + FLOOD.runs + FLOOD.drain + 0.5) return t - s;
  return null;
}
/** Where he is at `t` (carried down the ledge by his roll). */
function rollerAt(t: number): P2 {
  const m = t - ARENA.roll;
  const d = m > 0 ? roll9Along(Math.min(m, ROLL9.long)) : 0;
  return [ARENA.him[0] + ROLL_WAY[0] * d, ARENA.him[1] + ROLL_WAY[1] * d];
}
function wordLineEnd(from: P2, through: P2): P2 {
  const dx = through[0] - from[0];
  const dy = through[1] - from[1];
  const len = Math.hypot(dx, dy);
  let d = 0;
  while (d < WORDS9.reach && Math.abs(from[0] + (dx / len) * (d + 0.05)) < H - 0.4 && Math.abs(from[1] + (dy / len) * (d + 0.05)) < H - 0.4) d += 0.05;
  return [from[0] + (dx / len) * d, from[1] + (dy / len) * d];
}
/** THE WHOLE CISTERN FROM ABOVE, `t` seconds in: the game's own picture pixels, the cistern's middle at (cx, cy). */
export function arenaScene(t: number, w: number, h: number, cx: number, cy: number): Px {
  const I: Iso = { cx, cy };
  const at = isoAt(I);
  const { king } = figures();
  const base = cisternBase(w, h, I);
  const o = openingAt(t);
  const K = knightIn(t);
  const B = rollerAt(t);
  const mw = t - ARENA.words;
  const mr = t - ARENA.roll;
  // (him: his word, facing the knight; his stand; his roll down the ledge; his stand where he burst open)
  const toKnight: P2 = [WORD_AT[0] - ARENA.him[0], WORD_AT[1] - ARENA.him[1]];
  let face: P2 = toKnight;
  let l: Laid;
  if (mw >= 0 && mw < WORDS9.long) l = frameAt(king, drawnAs(...face).view, 'words', mw);
  else if (mr >= 0 && mr < ROLL9.long) {
    face = ROLL_WAY;
    l = frameAt(king, drawnAs(...face).view, 'roll', mr);
  } else {
    if (mr >= ROLL9.long) face = [K.at[0] - B[0], K.at[1] - B[1]];
    l = frameAt(king, drawnAs(...face).view, 'stand', t);
  }
  const S = at(B[0], B[1]);
  const stood: Standing[] = [{ at: S, l, flip: drawnAs(...face).flip, shadow: mr > ROLL9.curl && mr < ROLL9.stop ? 16 : 22 }, ...knightStood(I, K.at, K.face, K.moving, t)];
  const mouth: P2 = [ARENA.him[0] + (toKnight[0] / Math.hypot(...toKnight)) * 0.62, ARENA.him[1] + (toKnight[1] / Math.hypot(...toKnight)) * 0.62];
  const end = wordLineEnd(mouth, WORD_AT);
  const flight = Math.hypot(end[0] - mouth[0], end[1] - mouth[1]) / WORDS9.speed;
  const flying = mw - WORDS9_HIT;
  const px = layScene(base, (p) => {
    sluiceFloor(p, I, o, B);
    if (mw >= 0) {
      const aimAt = mw < WORDS9.lock ? K.at : WORD_AT;
      paintWordLine(p, at, mouth[0], mouth[1], ...wordLineEnd(mouth, aimAt), mw);
      if (flying >= flight) paintWordBurst(p, at, 'fire', end[0], end[1], flying - flight);
    }
    if (mr >= 0 && mr < ROLL9.long + 1.2) paintRollLane(p, at, mr, ARENA.him, Math.atan2(ROLL_WAY[1], ROLL_WAY[0]));
  }, stood);
  if (flying >= 0) paintWord(px, at, 'fire', mouth[0], mouth[1], 40, end[0], end[1], flying);
  const hits: [number, number][] = [[ARENA.open1 + SLUICES.burst, 3], [ARENA.open2 + SLUICES.burst, 3], [ARENA.roll + ROLL9.stop, 4]];
  return shaken(px, t, hits);
}

// ---------------------------------------------------------------------------------------------
// CLOSE: each move with the knight, from in front and from behind

export const LEAD = 0.4;
/** The cistern placed so that floor point B is at (cx, cy) of the picture. */
const placedAt = (B: P2, cx: number, cy: number): Iso => ({ cx: cx - 32 * (B[0] - B[1]), cy: cy - 16 * (B[0] + B[1]) });
const wayOf = (view: View): P2 => (view === 'front' ? [1, 0] : [0, -1]);
const sideOf = (view: View): P2 => (view === 'front' ? [0, 1] : [1, 0]);
function kingDoing(view: View, move: string, t: number, start: number, long: number): Laid {
  const { king } = figures();
  const m = t - start;
  if (m >= 0 && m <= long) return frameAt(king, view, move, m);
  return frameAt(king, view, 'stand', m < 0 ? t : m - long);
}

/**
 * HIS ROLL, close: down the dry ledge, its lane marked; the knight in it steps down off the ledge out of the ball's way while he
 * holds, and watches him burst open at its end. From in front he rolls down the picture to the right; from behind, up it.
 */
export const ROLL_PASS = LEAD + ROLL9.long + 0.5;
export function rollStart(view: View): P2 {
  return view === 'front' ? [-5.6, 2.4] : [2.4, 5.6];
}
export function rollScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const B0 = rollStart(view);
  const I = placedAt(B0, cx, cy);
  const at = isoAt(I);
  const m = t - LEAD;
  const base = cisternBase(w, h, I);
  const [fx, fy] = wayOf(view);
  const [sx, sy] = sideOf(view);
  const d = m > 0 ? roll9Along(Math.min(m, ROLL9.long)) : 0;
  const B: P2 = [B0[0] + fx * d, B0[1] + fy * d];
  // the knight: in the lane 6 tiles on; down off the ledge out of it as it is marked (into the lane beside, dry), turned to watch
  const K0: P2 = [B0[0] + fx * 6.4 + sx * 0.2, B0[1] + fy * 6.4 + sy * 0.2];
  const K1: P2 = [B0[0] + fx * 6.0 + sx * 2.9, B0[1] + fy * 6.0 + sy * 2.9];
  const k = smooth((m - 0.35) / 0.55);
  const kp: P2 = [K0[0] + (K1[0] - K0[0]) * k, K0[1] + (K1[1] - K0[1]) * k];
  const moving = m > 0.35 && m < 0.9;
  const kface: P2 = moving ? [K1[0] - K0[0], K1[1] - K0[1]] : [B[0] - kp[0], B[1] - kp[1]];
  const stood: Standing[] = [{ at: at(B[0], B[1]), l: kingDoing(view, 'roll', t, LEAD, ROLL9.long), shadow: m > ROLL9.curl && m < ROLL9.stop ? 16 : 22 }, ...knightStood(I, kp, kface, moving, t)];
  const px = layScene(base, (p) => {
    LANES.forEach((L, i) => paintGate(p, I, L, i, -1));
    paintRollLane(p, at, m, B0, Math.atan2(fy, fx));
  }, stood);
  return shaken(px, m, [[ROLL9_HIT, 2], [ROLL9.stop, 4]]);
}

/** THE BITE, close: the knight walks in to the front of the heap as it rears, and steps back out of the wedge while it is held. */
export const BITE_PASS = LEAD + BITE9.long + 0.3;
export function biteScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const B: P2 = [0, 0];
  const I = placedAt(B, cx, cy);
  const at = isoAt(I);
  const m = t - LEAD;
  const base = cisternBase(w, h, I);
  const [fx, fy] = wayOf(view);
  const [sx, sy] = sideOf(view);
  const back = smooth((m - 0.35) / 0.4);
  const d = 2.5 + 2.1 * back;
  const aside = view === 'front' ? 0.6 - 1.2 * back : 0.6 + 0.6 * back;
  const kp: P2 = [fx * d + sx * aside, fy * d + sy * aside];
  const moving = m > 0.35 && m < 0.75;
  const stood: Standing[] = [{ at: at(0, 0), l: kingDoing(view, 'attack', t, LEAD, BITE9.long), shadow: 22 }, ...knightStood(I, kp, [-fx, -fy], moving, t)];
  const aim = Math.atan2(fy, fx);
  const px = layScene(base, (p) => {
    LANES.forEach((L, i) => paintGate(p, I, L, i, -1));
    paintWedge(p, at, m, B, aim);
  }, stood);
  return shaken(px, m, [[BITE9_HIT, 2]]);
}

/** STOLEN WORDS, close: the knight walks across before him, the word's line following; it LOCKS; he steps out of it; the word is spat down the line and bursts at its end. */
export const WORDS_PASS = LEAD + WORDS9.long + 0.5;
const WORD_OF: Record<View, Word> = { front: 'fire', back: 'lightning' };
function wordsGeometry(view: View): { B: P2; k0: P2; k1: P2; k2: P2; mouth: P2; end: P2 } {
  const B: P2 = view === 'front' ? [-2.2, 0] : [0, -1.5];
  const [fx, fy] = wayOf(view);
  const [sx, sy] = sideOf(view);
  const P = (a: number, s: number): P2 => [B[0] + fx * a + sx * s, B[1] + fy * a + sy * s];
  const k0 = P(5.2, -1.2);
  const k1 = P(5.2, 1.0);
  const k2 = P(5.0, -1.4);
  const mouth = P(0.62, 0);
  // (the line from his mouth through where the knight stood when it locked, to the cistern's edge: a wall stops it)
  const dx = k1[0] - mouth[0];
  const dy = k1[1] - mouth[1];
  const len = Math.hypot(dx, dy);
  let d = 0;
  while (d < WORDS9.reach && Math.abs(mouth[0] + (dx / len) * (d + 0.05)) < H - 0.4 && Math.abs(mouth[1] + (dy / len) * (d + 0.05)) < H - 0.4) d += 0.05;
  return { B, k0, k1, k2, mouth, end: [mouth[0] + (dx / len) * d, mouth[1] + (dy / len) * d] };
}
export function wordsScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const G = wordsGeometry(view);
  const I = placedAt(G.B, cx, cy);
  const at = isoAt(I);
  const m = t - LEAD;
  const base = cisternBase(w, h, I);
  // the knight: across before him (the line following) until it locks, then out of its way
  const a = smooth((m - 0.1) / 0.8);
  const b = smooth((m - WORDS9.lock - 0.03) / 0.22);
  const kp: P2 = m < WORDS9.lock ? [G.k0[0] + (G.k1[0] - G.k0[0]) * a, G.k0[1] + (G.k1[1] - G.k0[1]) * a] : [G.k1[0] + (G.k2[0] - G.k1[0]) * b, G.k1[1] + (G.k2[1] - G.k1[1]) * b];
  const moving = (m > 0.1 && m < 0.9) || (m > WORDS9.lock && m < WORDS9.lock + 0.28);
  const face: P2 = moving ? (m < WORDS9.lock ? [G.k1[0] - G.k0[0], G.k1[1] - G.k0[1]] : [G.k2[0] - G.k1[0], G.k2[1] - G.k1[1]]) : [G.B[0] - kp[0], G.B[1] - kp[1]];
  // (the line follows the knight until it locks)
  const aimAt: P2 = m < WORDS9.lock ? kp : G.k1;
  const dx = aimAt[0] - G.mouth[0];
  const dy = aimAt[1] - G.mouth[1];
  const len = Math.hypot(dx, dy);
  let reach = 0;
  while (reach < WORDS9.reach && Math.abs(G.mouth[0] + (dx / len) * (reach + 0.05)) < H - 0.4 && Math.abs(G.mouth[1] + (dy / len) * (reach + 0.05)) < H - 0.4) reach += 0.05;
  const end: P2 = [G.mouth[0] + (dx / len) * reach, G.mouth[1] + (dy / len) * reach];
  const flying = m - WORDS9_HIT;
  const flight = Math.hypot(G.end[0] - G.mouth[0], G.end[1] - G.mouth[1]) / WORDS9.speed;
  const stood: Standing[] = [{ at: at(G.B[0], G.B[1]), l: kingDoing(view, 'words', t, LEAD, WORDS9.long), shadow: 22 }, ...knightStood(I, kp, face, moving, t)];
  const px = layScene(base, (p) => {
    LANES.forEach((L, i) => paintGate(p, I, L, i, -1));
    paintWordLine(p, at, G.mouth[0], G.mouth[1], end[0], end[1], m);
    if (flying >= flight) paintWordBurst(p, at, WORD_OF[view], G.end[0], G.end[1], flying - flight);
  }, stood);
  // (the word in the air over everything standing)
  if (flying >= 0) paintWord(px, at, WORD_OF[view], G.mouth[0], G.mouth[1], 52, G.end[0], G.end[1], flying);
  return shaken(px, m, [[WORDS9_HIT + flight, 3]]);
}

/** UNKNOT, close: the heap swells, held; bursts outward round him; the swarm streams past the knight to his far side, and they knot again there. */
export const UNKNOT_PASS = LEAD + UNKNOT9.out + SWARM9.for + RK_ROLL.curl + 0.95;
function unknotGeometry(view: View): { B: P2; kp: P2; to: P2 } {
  const B: P2 = view === 'front' ? [-2.4, -0.3] : [0.3, 2.6];
  const [fx, fy] = wayOf(view);
  const [sx, sy] = sideOf(view);
  const P = (a: number, s: number): P2 => [B[0] + fx * a + sx * s, B[1] + fy * a + sy * s];
  return { B, kp: P(3.3, 0.5), to: P(7.2, 0.9) };
}
export function unknotScene(view: View, t: number, w: number, h: number, cx: number, cy: number): Px {
  const G = unknotGeometry(view);
  const I = placedAt(G.B, cx, cy);
  const at = isoAt(I);
  const m = t - LEAD;
  const base = cisternBase(w, h, I);
  const { king, old } = figures();
  const swarm = m - UNKNOT9.out;
  const knot = swarm - SWARM9.for;
  const stood: Standing[] = [];
  if (m < UNKNOT9.out) stood.push({ at: at(G.B[0], G.B[1]), l: kingDoing(view, 'unknot', t, LEAD, UNKNOT9.out), shadow: m < UNKNOT9_HIT ? 22 : 0 });
  else if (knot >= 0) {
    // (knotting again: the game's own; then his stand, facing the knight)
    const kv: View = view;
    const l = knot < 0.95 ? frameAt(old, kv, 'knot', knot) : frameAt(king, kv, 'stand', knot);
    stood.push({ at: at(G.to[0], G.to[1]), l, flip: true, shadow: knot > 0.5 ? 22 : 0 });
  }
  const turned = knot > 0.3;
  stood.push(...knightStood(I, G.kp, turned ? [G.to[0] - G.kp[0], G.to[1] - G.kp[1]] : [G.B[0] - G.kp[0], G.B[1] - G.kp[1]], false, t));
  const px = layScene(base, (p) => {
    LANES.forEach((L, i) => paintGate(p, I, L, i, -1));
    paintBurstRing(p, at, G.B, m - UNKNOT9_HIT);
    paintSwarm9(p, at, G.B[0], G.B[1], G.to[0], G.to[1], swarm);
  }, stood);
  return shaken(px, m, [[UNKNOT9_HIT, 3]]);
}

// ---------------------------------------------------------------------------------------------
// HIS OLD ROLL (the game's own pictures and its lane, drawn by the game's own code), for the sheet

/** A canvas's 2-D pen over plain pixels: what the game's drawing of his roll's lane asks of one. */
function penOf(px: Px): CanvasRenderingContext2D {
  let pts: [number, number][] = [];
  const blend = (X: number, Y: number, c: readonly number[], a: number): void => {
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) return;
    const i = (Y * px.w + X) * 4;
    const f = (Math.max(0, Math.min(1, a)) * (c[3] ?? 255)) / 255;
    px.d[i] = Math.round(px.d[i] * (1 - f) + c[0] * f);
    px.d[i + 1] = Math.round(px.d[i + 1] * (1 - f) + c[1] * f);
    px.d[i + 2] = Math.round(px.d[i + 2] * (1 - f) + c[2] * f);
    px.d[i + 3] = 255;
  };
  const g = {
    fillStyle: '#000' as string,
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number): void {
      const c = rgba(g.fillStyle);
      for (let Y = Math.round(y); Y < Math.round(y + h); Y++) for (let X = Math.round(x); X < Math.round(x + w); X++) blend(X, Y, c, g.globalAlpha);
    },
    beginPath(): void {
      pts = [];
    },
    moveTo(x: number, y: number): void {
      pts.push([x, y]);
    },
    lineTo(x: number, y: number): void {
      pts.push([x, y]);
    },
    closePath(): void {},
    fill(): void {
      if (pts.length < 3) return;
      const c = rgba(g.fillStyle);
      const ys = pts.map((p) => p[1]);
      for (let Y = Math.floor(Math.min(...ys)); Y <= Math.ceil(Math.max(...ys)); Y++) {
        const yc = Y + 0.5;
        const xs: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const [x0, y0] = pts[i];
          const [x1, y1] = pts[(i + 1) % pts.length];
          if ((y0 <= yc && y1 > yc) || (y1 <= yc && y0 > yc)) xs.push(x0 + ((yc - y0) / (y1 - y0)) * (x1 - x0));
        }
        xs.sort((p, q) => p - q);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let X = Math.round(xs[k]); X < Math.round(xs[k + 1]); X++) blend(X, Y, c, g.globalAlpha);
      }
    },
  };
  return g as unknown as CanvasRenderingContext2D;
}
/** HIS OLD ROLL: curled (its lane marked), rolling down it (the lane fading behind), `t` seconds in; the game's own pictures. */
export function oldRollScene(t: number, w: number, h: number, cx: number, cy: number): Px {
  const B: P2 = [-2.6, 0];
  const I = placedAt(B, cx, cy);
  const at = isoAt(I);
  const { old } = figures();
  const base = cisternBase(w, h, I);
  const C = RK_ROLL;
  const pace = ROLL_PACE;
  const ran = Math.max(0, t - C.curl) * pace;
  const l = t < C.curl ? frameAt(old, 'front', 'curl', t) : frameAt(old, 'front', 'roll', (t - C.curl) % (C.frames / C.fps));
  const px = layScene(base, (p) => {
    LANES.forEach((L, i) => paintGate(p, I, L, i, -1));
    const far = 2 * 0.8 * pace + 0.74;
    const lane = { x0: B[0], y0: B[1], x1: B[0] + far, y1: B[1], half: 0.74, k: clamp01(t / C.curl) };
    drawChargeLane(penOf(p), t < C.curl ? lane : { ...lane, k: 1, gone: clamp01((t - C.curl) / 1.6) }, (x, y) => at(x, y));
  }, [{ at: at(B[0] + ran, B[1]), l, shadow: 18 }]);
  return px;
}
export { floodSpan };
void splashAbout;
