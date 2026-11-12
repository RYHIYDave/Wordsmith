// THE VETERAN'S ACTION LINES AS FRAMES OF THE GAME'S (the main chat, 3 Nov 2026; behind game/veteran.ts VETERAN, off).
//
// What his blows throw off is the art chat's (dev/veteran_fx.ts; his word, 2 Nov 2026: “Those action lines will probably need
// to be bigger.  Remember, I’d rather have to pull back from a 10 then build up from a 1.  In terms of awesome looking
// animations”), painted by the art's own painters, at the frames and in the places the art's film has them
// (dev/veteran_scene.ts): the smears along every blow and the elbow's arc of light, the force past the fist or foot (shock
// cones, crescents, the spinning kick's crescent rolled out round him, the push kick's cone along the floor and its burst at
// the heel), dust off the floor, a heavy landing's ring of force, speed lines behind a leap. All of it is the same at the same
// frame of the same move (the game carries him as the art does: game/veteran_baked.ts), so it is painted ONCE, as frames
// (a tenth of a second and more each: the side painter's, as his own frames are), laid from where he stood as the move began
// along the way he faced then. Three layers a frame: what lies on the floor (under everyone), what is behind him at height
// (just behind him), and the rest (over everything). What changes with who is struck (the bursts on them, the rings under
// them, the stars of the launched) is render/veteran_fx.ts's.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { GRID } from './skeleton';
import type { Skeleton, V3 } from './skeleton';
import { HEAVY, LEFT_TO_PAINTER, toSprite } from './kit';
import { MORE_TURN } from './sides_more';
import type { MoreSide } from './sides_more';
import { forceFront, forceGeo, placeOf, poseAt, roundSpan, skel, worldOf } from '../dev/veteran_moves';
import type { Joint, Strike, VetMotion } from '../dev/veteran_moves';
import { FX_KICK, FX_PUNCH, coneBlast, crescent, dust, floorRing, floorTrace, impact, shockCone, smear, speedLines } from '../dev/veteran_fx';

/** How many frames a move's effects go on after it ends (its dust, its force breaking up): its lists are this much longer. */
export const VET_FX_AFTER = 16;
/** The three layers of a frame of his effects. */
export type VetFxLayer = 'ground' | 'behind' | 'front';
export const VET_FX_LAYERS: readonly VetFxLayer[] = ['ground', 'behind', 'front'];
/** The picture a frame of them is painted on (picture pixels), and where he stood as the move began in it. */
const FX_CANVAS = { w: 600, h: 460, ax: 300, ay: 300 };

const kindCols = (k: 'punch' | 'kick'): readonly string[] => (k === 'kick' ? FX_KICK : FX_PUNCH);
/** The grey-white of a heavy landing's ring of force (the art's). */
const QUAKE = ['#2a2438', '#6e6886', '#958fab', '#bcb6cc', '#f0eeff'];
/** The last frame his blow lands (the art's: the smear and after-images go on to it). */
export const vetLastHit = (s: Strike): number => Math.max(s.at, ...s.hits.map((h) => h.f));

/** His pose's skeleton at a frame of a move (fractional frames to a tenth), worked out once. */
const SKELS = new Map<string, Skeleton>();
export function vetSkelAt(m: VetMotion, g: number): Skeleton {
  const key = `${m.id}|${Math.round(g * 10)}`;
  let s = SKELS.get(key);
  if (!s) {
    s = skel(poseAt(m, g));
    SKELS.set(key, s);
  }
  return s;
}
/** Where a joint of his is at a frame, on the floor of the move's scene (his measure, from where he stood). */
export const vetJointAt = (m: VetMotion, g: number, j: Joint | 'pelvis' | 'neck' | 'head'): V3 => worldOf(m, g, vetSkelAt(m, g)[j] as V3);
/** How high off the floor he is at a frame (his lowest foot, his measure). */
export function vetLiftAt(m: VetMotion, f: number): number {
  const s = vetSkelAt(m, f);
  return Math.max(0, Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]));
}

/** How far a cone from a point along a way reaches to the circle of `reach` round where he stood (the art's: veteran_scene.ts). */
function coneLength(from: readonly number[], way: number, reach: number): number {
  const b = from[0] * Math.cos(way) + from[1] * Math.sin(way);
  return -b + Math.sqrt(Math.max(0, b * b - (from[0] * from[0] + from[1] * from[1]) + reach * reach));
}

/** A crescent's place at a frame of its move (the art's), or null if it is not out. */
function crescentOf(m: VetMotion, s: Strike, F: number): { o: V3; a0: number; a1: number; front: number; gone: number; thick: number; r0?: number } | null {
  const Fo = s.force;
  if (!Fo || Fo.shape === 'cone') return null;
  const fa = Fo.from ?? s.at;
  const age = F - fa;
  if (age < 0 || age > Fo.long + 7) return null;
  const g = forceGeo(m, s);
  const front = forceFront(m, s, F);
  const span = roundSpan(m, s, F);
  const a0 = g.shape === 'round' ? g.dir + (span[0] * Math.PI) / 180 : g.dir - g.half;
  const a1 = g.shape === 'round' ? g.dir + (span[1] * Math.PI) / 180 : g.dir + g.half;
  const gone = Math.max(0, Math.min(1, (age - Fo.long - 2) / 5));
  return { o: g.o as V3, a0, a1, front, gone, thick: g.shape === 'round' ? 18 : s.heavy ? 14 : 11, r0: g.shape === 'round' ? undefined : g.r0 };
}

/** How open a cone's rings must show to the eye to be left as they are (1 a full circle, 0 edge-on), and how far one that shows less is leaned (degrees). */
const CONE_OPEN = 0.4;
const CONE_LEAN = 30;
/**
 * A CONE SEEN SIDE-ON, LEANED (the Tinkerer chat, 11 Nov 2026; his six more sides, art/sides_more.ts). A straight blow's cone
 * of force (his jab, his cross, his flying knee) thrown straight to the left or right of the screen has its rings edge-on to
 * the game's eye: each a bar, and the air inside them a strip of noise, where from every other side they are the rings he
 * knows. So on those sides the rings' level axis is swung toward the cone's line (dev/veteran_fx.ts shockCone `lean`), the
 * side nearer the eye trailing, by up to CONE_LEAN degrees: the most where they would lie exactly edge-on, none where a ring
 * already shows CONE_OPEN of a circle (his uppercut's, which goes up, shows its ring from every side). NEVER from in front or
 * from behind (`front`, `back`): those two are the pictures the game has always had, to the pixel.
 */
function coneLean(view: MoreSide, to: (q: readonly number[]) => [number, number], o: readonly number[], dir: number, up: number): number {
  if (view === 'front' || view === 'back') return 0;
  const at = to(o);
  // (the cone's line, the rings' level axis (his left of the line) and their other axis, as shockCone has them, on the picture)
  const a = [Math.cos(up) * Math.cos(dir), Math.cos(up) * Math.sin(dir), Math.sin(up)];
  const v = [-Math.sin(dir), Math.cos(dir), 0];
  const w = [a[1] * v[2] - a[2] * v[1], a[2] * v[0] - a[0] * v[2], a[0] * v[1] - a[1] * v[0]];
  const seen = (d: number[]): [number, number] => {
    const q = to([o[0] + d[0], o[1] + d[1], o[2] + d[2]]);
    return [q[0] - at[0], q[1] - at[1]];
  };
  const A = seen(a);
  const V = seen(v);
  const W = seen(w);
  // (how open a ring shows: twice its two axes' area over the sum of their squares; 1 a circle, 0 a bar)
  const open = (2 * Math.abs(V[0] * W[1] - V[1] * W[0])) / Math.max(1e-9, V[0] * V[0] + V[1] * V[1] + W[0] * W[0] + W[1] * W[1]);
  if (open >= CONE_OPEN) return 0;
  // (the way it already opens, if it does; edge-on, the side nearer the eye, lower on the picture, trails)
  const way = Math.abs(V[0]) > 1e-9 ? Math.sign(V[0] * A[0]) || 1 : V[1] < 0 ? 1 : -1;
  return way * ((CONE_LEAN * Math.PI) / 180) * (1 - open / CONE_OPEN);
}

/**
 * ONE LAYER OF HIS EFFECTS AT A FRAME OF A MOVE (0 to its `long` + VET_FX_AFTER), in a view (from in front, or truly from
 * behind: turned 90°, as his frames), as the art's film paints them: a sprite at the game's grain whose anchor is the floor
 * point where he stood as the move began. (Mirrored, as his frames are, for a hero facing screen-left.)
 */
export function paintVetFx(m: VetMotion, F: number, view: MoreSide, layer: VetFxLayer): Sprite {
  const px = new Px(FX_CANVAS.w, FX_CANVAS.h);
  // (turned as his frames are for the side: art/sides_more.ts MORE_TURN, from in front 0 and from behind 90 as ever)
  const V = MORE_TURN[view];
  const r = (V * Math.PI) / 180;
  const c = Math.cos(r);
  const sn = Math.sin(r);
  /** The picture's point for a point of the move's scene (his measure: forward, left, up, from where he stood). */
  const to = (q: readonly number[]): [number, number] => {
    const a = q[0] * c - q[1] * sn;
    const b = q[0] * sn + q[1] * c;
    return [FX_CANVAS.ax + GRID * (a + b), FX_CANVAS.ay + GRID * 0.5 * (a - b) - (q[2] ?? 0)];
  };
  const live = F < m.long;
  // (where his feet are on the screen at this frame: what is above that on the screen is behind him)
  const at = placeOf(m, Math.min(F, m.long)).at;
  const heroY = to([at[0], at[1], 0])[1];
  const behind = (q: readonly number[]): boolean => to([q[0], q[1], 0])[1] < heroY;
  const strikesNow = live ? m.strikes.filter((s) => F > s.from && F <= vetLastHit(s) + 4) : [];
  const smearOf = (s: Strike): void => {
    const last = vetLastHit(s);
    const until = Math.min(F, last);
    const path: [number, number][] = [];
    for (let k = 0; ; k++) {
      const g = s.from - 0.5 + k * 0.1;
      if (g > until + 1e-6) break;
      path.push(to(vetJointAt(m, g, s.joint)));
    }
    smear(px, path, s.w ?? (s.heavy ? 13 : 9), kindCols(s.kind), F <= last ? 1 : Math.max(0, 1 - (F - last) / 4));
  };
  const arcOf = (): { path: [number, number][]; behind: boolean[]; w: number; cols: readonly string[]; show: number } | null => {
    const a = m.arc;
    if (!a || !live || F < a.from) return null;
    const show = F <= a.to ? 1 : Math.max(0, 1 - (F - a.to) / 5);
    const until = Math.min(F, a.to);
    if (show <= 0 || until <= a.from) return null;
    const path: [number, number][] = [];
    const back: boolean[] = [];
    for (let g = a.from; g <= until + 1e-6; g += 0.2) {
      const j = vetJointAt(m, g, a.joint);
      const n = vetJointAt(m, g, 'neck');
      const dx = j[0] - n[0];
      const dy = j[1] - n[1];
      const dn = Math.hypot(dx, dy) || 1;
      const w: V3 = [j[0] + (dx / dn) * (a.out ?? 0), j[1] + (dy / dn) * (a.out ?? 0), j[2]];
      path.push(to(w));
      back.push(behind(w));
    }
    return { path, behind: back, w: a.w, cols: kindCols(a.kind), show };
  };
  const dusts: [number, number, number, boolean, number][] = [];
  for (const d of m.dust ?? []) {
    const age = F - d.f;
    if (age < 0 || age > 14) continue;
    for (const side of d.at === 'both' ? (['L', 'R'] as const) : [d.at]) {
      const q = vetJointAt(m, d.f, side === 'L' ? 'toeL' : 'toeR');
      const [x, y] = to([q[0], q[1], 0]);
      dusts.push([x, y, age, !!d.big, d.f + (side === 'L' ? 0 : 50)]);
    }
  }
  if (layer === 'ground') {
    // DUST off the floor behind him; HIS HEAVY LANDINGS' ring of force; THE PUSH KICK'S BLAST along the floor; where a
    // crescent is over the floor
    for (const d of dusts) if (d[1] < heroY) dust(px, d[0], d[1], d[2], d[3], d[4]);
    for (const qf of m.quake ?? []) {
      const age = F - qf;
      if (age < 0 || age > 9) continue;
      const p = vetJointAt(m, qf, 'pelvis');
      const [x, y] = to([p[0], p[1], 0]);
      floorRing(px, x, y, age, QUAKE, 1.7);
    }
    for (const s of m.strikes) {
      if (s.cone) {
        const age = F - s.at;
        if (age < 0 || age > 14) continue;
        const heel = vetJointAt(m, s.at, s.joint);
        const o = worldOf(m, s.at, [0, 0, 0]);
        const fw = worldOf(m, s.at, [1, 0, 0]);
        const way = Math.atan2(fw[1] - o[1], fw[0] - o[0]);
        coneBlast(px, (rr, a) => {
          const w = way + (a * Math.PI) / 180;
          return to([heel[0] + Math.cos(w) * rr, heel[1] + Math.sin(w) * rr, 0]);
        }, s.cone.deg, coneLength(heel, way, s.cone.reach), age, FX_KICK, s.at);
        continue;
      }
      const cr = crescentOf(m, s, F);
      if (cr) floorTrace(px, to, cr.o, cr.a0, cr.a1, cr.front, kindCols(s.kind)[1], cr.gone);
    }
  } else if (layer === 'behind') {
    // the crescents' stretches behind him; the turn in light behind him; the smears painted under him (so the limb that
    // strikes is seen leading them)
    for (const s of m.strikes) {
      const cr = crescentOf(m, s, F);
      if (cr) crescent(px, to, cr.o, cr.a0, cr.a1, cr.front, cr.thick, kindCols(s.kind), cr.gone, s.at * 13, behind, cr.r0);
    }
    const arc = arcOf();
    if (arc) smear(px, arc.path, arc.w, arc.cols, arc.show, arc.behind);
    for (const s of strikesNow) if (s.under) smearOf(s);
  } else {
    // dust before him; the turn in light before him; speed lines behind a leap; the smears; his force before him (the shock
    // cones, the crescents' near stretches); a cone's burst at the heel as it lands
    for (const d of dusts) if (d[1] >= heroY) dust(px, d[0], d[1], d[2], d[3], d[4]);
    const arc = arcOf();
    if (arc) smear(px, arc.path, arc.w, arc.cols, arc.show, arc.behind.map((b) => !b));
    if (live && vetLiftAt(m, F) > 3) {
      const a = to(vetJointAt(m, F, 'pelvis'));
      const b = to(vetJointAt(m, F - 1, 'pelvis'));
      speedLines(px, a[0], a[1] - 4, (a[0] - b[0]) * 1.4, (a[1] - b[1]) * 1.4, 14, Math.floor(F / 2) * 13, ['', '', '#6a64b0', '#b4b0e6', '#f0eeff']);
    }
    for (const s of strikesNow) if (!s.under) smearOf(s);
    for (const s of m.strikes) {
      const Fo = s.force;
      if (Fo) {
        const fa = Fo.from ?? s.at;
        const age = F - fa;
        if (age < 0 || age > Fo.long + 7) continue;
        const g = forceGeo(m, s);
        if (g.shape === 'cone') shockCone(px, to, g.o, g.dir, g.up, g.half, forceFront(m, s, F), age, Fo.long + 1, kindCols(s.kind), s.at * 13, coneLean(view, to, g.o, g.dir, g.up));
        else {
          const cr = crescentOf(m, s, F);
          if (cr) crescent(px, to, cr.o, cr.a0, cr.a1, cr.front, cr.thick, kindCols(s.kind), cr.gone, s.at * 13, (q) => !behind(q), cr.r0);
        }
      }
      if (s.cone) {
        const age = F - s.at;
        if (age >= 0 && age <= 6) {
          const [x, y] = to(vetJointAt(m, s.at, s.joint));
          impact(px, x, y, age, kindCols(s.kind), s.heavy, s.at * 7, s.burst ?? 1);
        }
      }
    }
  }
  return toSprite({ px, lights: [] }, null, FX_CANVAS.ax, FX_CANVAS.ay);
}

/** Nothing: a frame of his effects not painted yet where the game is played (another frame's would be in the wrong place). */
const NONE: Sprite = { img: null as unknown as HTMLCanvasElement, w: 0, h: 0, ax: 0, ay: 0 };
/** Is it the frame that stands for one not painted yet? */
export const vetFxNone = (s: Sprite | undefined): boolean => !s || s === NONE;

/**
 * A LIST OF FRAMES OF HIS EFFECTS, each painted the first time it is asked for, as his frames are (art/kit.ts lazyFrames),
 * but where the game is played one not painted yet is NOTHING (vetFxNone), for the side painter to paint: never the nearest
 * painted, which would be the force or a smear of another frame, in the wrong place.
 */
export function vetFxFrames(n: number, make: (i: number) => Sprite): Sprite[] {
  const out: Sprite[] = new Array<Sprite>(n);
  for (let i = 0; i < n; i++) {
    Object.defineProperty(out, i, {
      configurable: true,
      enumerable: true,
      get(): Sprite {
        if (HEAVY.defer || LEFT_TO_PAINTER.on) {
          HEAVY.asked?.(out);
          HEAVY.deferred++;
          return NONE;
        }
        const s = make(i);
        Object.defineProperty(out, i, { value: s, writable: true, configurable: true, enumerable: true });
        return s;
      },
    });
  }
  return out;
}
