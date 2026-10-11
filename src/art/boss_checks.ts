// THE BOSSES' REVIEW (the art chat, 9 and 10 Oct 2026). A MOCK-UP TOOL: NOT IN THE GAME; nothing of the
// game imports this file. The owner's words to the art chat: at 23:35, "I need all bosses ran through
// all checks from now on.  These boss fights are important"; at 23:44, "Add it to the rulebook.  All
// checks must be made."; at 23:56, "And every boss gets the same treatment as characters". The art
// rulebook's How art is made 7 (his doc at rev 41).
//
// So every boss gets the whole review the heroes had on 8 Oct (docs/requests/hero_moves_review.md,
// tools/review_heroes/), on every frame the game would show of every move (his stand at its own frames
// a second, his walk at its own, every other move at 30, his death at 20), seen from in front and from
// behind, in game pixels:
//
//   SLIDE    (Movement 8, "Feet grip the floor"): a heel or a toe that is down must stay where it came
//            down until it lifts (walking, the floor going by under him counted). A foot moves only
//            lifted; it may turn on its toe, its heel coming up, or rock back on its heel.
//   FLOOR    anything of him below the floor: a toe or a heel, a knee, an elbow, a hand.
//   ARM      (Heroes 6, "Clean bodies. Arms never pass through clothing or the body, in any frame"): an
//            arm into his head, his neck, his trunk or what he wears on it; a hand into a thigh.
//   THROUGH  (Heroes 6) what he carries or drags (an axe, chains, a ball) into his body or what he wears,
//            but where it is held or hangs from (the hands on a haft, a chain along its own arm).
//   JERK     (Movement 5, "nothing jerky"; Movement 1, "slow to start and slow to stop"): a frame that
//            leaps, a motion that stalls and goes on, one that turns straight back at speed, one that
//            starts or stops at its fastest; a loop, the step from its last frame back to its first.
//   JUMP     (Movement 5) where one move hands over to the next (his stand, from whatever frame of it the
//            game has come to, into each move, and back; into his walk and out of it): the picture must
//            not leap, nor what he carries.
//   BLOW     (Movement 3, "Every attack winds up before it lands and follows through after"; Monsters
//            4, "The warning is a pose"): the end he strikes with is drawn back, held, and goes on
//            after the blow.
//   HIPS     (Movement 1, "A blow plants the feet, turns the hips and carries through"): the hips get
//            going first, then the chest, then the end he strikes with.
//   ALIVE    (Movement 6, "breathes, shifts its weight"): standing, his chest rises and his hips sway.
//
// (What is painted, the colour of every light, the pink edge, and crisp pixels, is asked of every frame in
// tests/bosses.test.ts.) Each boss says what he is (`BossShape`): his outside and what he wears, as
// solids; what he carries; the end he strikes with.

import type { Mob, MobMove } from './new_mobs3';
import { posedOfMob, skeletonAt } from './new_mobs3';
import { add, dot, len, lerp3, mul, norm, project, sub } from './skeleton';
import type { Posed, Rot, Skeleton, V3 } from './skeleton';

/** A part of him, a limb: from `a` to `b`, `r` thick (as painted: skin, sleeve, boot, a skirt round a leg). */
export interface CheckLimb {
  name: string;
  a: V3;
  b: V3;
  r: number;
}
/** A part of him, a solid: its middle, how it is turned, its half-lengths along its own forward, left and up (as painted: his ribs, his coat, an apron). */
export interface CheckLump {
  name: string;
  c: V3;
  rot: Rot;
  h: V3;
}
/** Something he carries or drags: points along its middle, how thick it is, and the parts of him it may touch (where it is held, or hangs from). */
export interface CheckThing {
  name: string;
  pts: ReadonlyArray<V3>;
  r: number;
  may?: ReadonlyArray<string>;
}
/** One move handing over to another: from this move at this moment (`'end'`: its last), to that one at that moment, he being then `mob` (if he has changed: a chain broken). */
export interface Handover {
  from: string;
  at: number | 'end';
  to: string;
  toAt: number;
  mob?: Mob;
}
/** One of his arms at a moment: where it comes out of him, its elbow and its hand. */
export interface CheckArm {
  name: string;
  sh: V3;
  el: V3;
  hand: V3;
}
/** A BOSS AS THE REVIEW SEES HIM. (Each is given his bones at the moment, and the pose they were solved from.) */
export interface BossShape {
  /** His outside as painted, at a moment: limbs (named legL, shinL, footL, upperL, foreL, ... neck, head) and solids (his trunk, his head, what he wears on them). An arm keeps out of all of these but his own; a thing out of all but where it is held. */
  body: (s: Skeleton, q: Posed) => { limbs: CheckLimb[]; lumps: CheckLump[] };
  /** What he carries or drags at a moment of a move (by its name), and where it is. */
  things?: (move: string, t: number, s: Skeleton, q: Posed) => CheckThing[];
  /** The end he strikes with at a moment of a move (an axe's edge, a chain's end), if he holds one then. */
  tip?: (move: string, t: number, s: Skeleton, q: Posed) => V3 | null;
  /**
   * ONE WHO IS NOT BUILT AS A MAN (a heap of the dead hauling itself on its arms): what of him grips the
   * floor (his hands, in place of heels and toes: down where they come down, as feet are), his arms (in
   * place of a man's two), and the points of him the review follows from frame to frame and where one
   * move hands over to the next (in place of a man's head, hands, knees and feet).
   */
  grips?: (move: string, t: number, s: Skeleton, q: Posed) => ReadonlyArray<{ name: string; p: V3 }>;
  arms?: (move: string, t: number, s: Skeleton, q: Posed) => ReadonlyArray<CheckArm>;
  follow?: (move: string, t: number, s: Skeleton, q: Posed) => Readonly<Record<string, V3>>;
  /** His solids that rest in the floor as he is made (a heap slumped on it, a tail trailing off into it): not held out of it. */
  floorFree?: ReadonlyArray<string>;
  /** Moves that are only pictures for the owner, never played (stills of how he holds his weapon): not reviewed. */
  pictures?: ReadonlyArray<string>;
  /** How far above the floor each of these must stay (the figure's own lengths): his knees, elbows and hands are round, and as thick as they are; what grips the floor (`grip`), where it is put down. */
  low?: Partial<Record<'knee' | 'elbow' | 'hand' | 'heel' | 'toe' | 'grip', number>>;
  /** Where his moves hand over to each other (if not said: his stand into each move and back, into his walk and out of it at any step). */
  handovers?: ReadonlyArray<Handover>;
  /** Who he is after a move that changes him (a chain broken): his stand after it is that one's. */
  after?: Readonly<Record<string, Mob>>;
  /** What he carries as that other one (his chains as they are once one has broken). */
  thingsOf?: (mob: Mob) => BossShape['things'];
}
/** What the review found: in which move, at what moment, of what kind, what, and by how much (game pixels, but FLOOR, ARM and THROUGH: the figure's own lengths). */
export interface Finding {
  move: string;
  t: number;
  kind: 'slide' | 'floor' | 'arm' | 'through' | 'jerk' | 'jump' | 'blow' | 'hips' | 'alive';
  what: string;
  by: number;
}

/** How far a heel or toe that is down may creep (game pixels: the bones' own rounding is less), and how deep anything may sink into anything (the figure's own lengths). */
export const SLIDE_MAX = 1.0;
export const SINK_MAX = 0.5;
/** How far the picture may leap where one move hands over to another (the mean of his points, game pixels: the heroes' that passed, 2.0 to 2.8). */
export const JUMP_MAX = 3;
/** A thing this thick or thicker (a ball, a blade) may press into him this far before it is through him. */
const THICK = 3;
const DEATH_FPS = 20;
const CLIP_FPS = 30;
const FR = 1 / CLIP_FPS;
type View = 'front' | 'back' | 'rear';
/** The two ways the game shows him: from in front, and from behind (over his right shoulder, not turned over, for one who is truly seen from behind: `Mob.trueBack`). */
const viewsOf = (mob: Mob): View[] => (mob.trueBack ? ['front', 'rear'] : ['front', 'back']);

/** Every move of a boss by name: his stand, his walk, his blow, struck, his death, and the rest. */
export function movesOf(mob: Mob): string[] {
  return ['stand', 'walk', 'attack', 'reel', 'dying', ...Object.keys(mob.more ?? {})];
}
export function moveOf(mob: Mob, which: string): MobMove | undefined {
  if (which === 'stand' || which === 'walk' || which === 'attack' || which === 'reel') return mob[which];
  if (which === 'dying') return mob.dying;
  return mob.more?.[which];
}
/** How long a move is (seconds): a move going round, once round. */
export function longOf(mob: Mob, which: string): number {
  const mv = moveOf(mob, which);
  if (!mv) return 0;
  if (which === 'stand') return mob.idleFrames / mob.idleFps;
  if (which === 'walk') return mob.walkFrames / mob.walkFps;
  if (which === 'dying') return mob.dieTime;
  const keys = mv.motion.keys;
  return keys.length ? keys[keys.length - 1].at : 0;
}
/** Whether a move goes round (his stand, his walk, a held move). */
function loops(mob: Mob, which: string): boolean {
  const mv = moveOf(mob, which);
  return which === 'stand' || which === 'walk' || (mv?.motion.loop !== undefined && which !== 'dying');
}
/** The moments of a move that the game shows (seconds): its stand at its own frames a second, its walk at its own, a death at 20, every other move at 30; a move going round, once round (and its first again, to close it). */
export function framesOf(mob: Mob, which: string): number[] {
  const mv = moveOf(mob, which);
  if (!mv) return [];
  const out: number[] = [];
  if (which === 'stand') for (let i = 0; i <= mob.idleFrames; i++) out.push(i / mob.idleFps);
  else if (which === 'walk') for (let i = 0; i <= mob.walkFrames; i++) out.push(i / mob.walkFps);
  else if (which === 'dying') {
    const n = Math.round(mob.dieTime * DEATH_FPS) + 1;
    for (let i = 0; i < n; i++) out.push((i / (n - 1)) * mob.dieTime);
  } else if (mv.motion.loop !== undefined) {
    const walking = mv.ground !== undefined;
    const n = walking ? mob.walkFrames : mob.idleFrames;
    const fps = walking ? mob.walkFps : mob.idleFps;
    for (let i = 0; i <= n; i++) out.push(i / fps);
  } else {
    const n = Math.round(longOf(mob, which) * CLIP_FPS);
    for (let i = 0; i <= n; i++) out.push(i / CLIP_FPS);
  }
  return out;
}

/** How deep a point is inside a limb (below nothing: outside it). */
export function inLimb(q: V3, l: { a: V3; b: V3; r: number }): number {
  const ab = sub(l.b, l.a);
  const L2 = dot(ab, ab);
  const k = L2 > 1e-9 ? Math.max(0, Math.min(1, dot(sub(q, l.a), ab) / L2)) : 0;
  return l.r - len(sub(q, add(l.a, mul(ab, k))));
}
/** How deep a point is inside a solid (near enough: as for a ball the size of its shortest half-length). */
export function inLump(q: V3, o: { c: V3; rot: Rot; h: V3 }): number {
  const d = sub(q, o.c);
  const m = Math.hypot(dot(d, o.rot[0]) / o.h[0], dot(d, o.rot[1]) / o.h[1], dot(d, o.rot[2]) / o.h[2]);
  return (1 - m) * Math.min(o.h[0], o.h[1], o.h[2]);
}
/** A point as the game shows it, in game pixels from his floor point (across, and down the picture). */
function seen(p: V3, view: View): [number, number] {
  const r = project(p, view);
  return [r[0] / 2, r[1] / 2];
}
/** The points of him the review follows. */
function pointsOf(s: Skeleton): Record<string, V3> {
  return { head: s.head, chest: s.ribs, pelvis: s.pelvis, handL: s.handL, handR: s.handR, elbowL: s.elbowL, elbowR: s.elbowR, kneeL: s.kneeL, kneeR: s.kneeR, toeL: s.toeL, toeR: s.toeR, heelL: s.heelL, heelR: s.heelR };
}
/** The way his hips (or chest) face, as an angle on the floor and how far it tips (degrees), to measure their turning by. */
function facing(r: Rot): V3 {
  return r[0];
}
const angleBetween = (a: V3, b: V3): number => (Math.acos(Math.max(-1, Math.min(1, dot(norm(a), norm(b))))) * 180) / Math.PI;

/** THE WHOLE REVIEW of `moves` (all his moves, but pictures, if not said): what was found, the worst first. */
export function checkBoss(mob: Mob, shape: BossShape, moves: ReadonlyArray<string> = movesOf(mob).filter((m) => !shape.pictures?.includes(m))): Finding[] {
  const found: Finding[] = [];
  const VIEWS = viewsOf(mob);
  const low = { knee: 1.5, elbow: 1.2, hand: 0.4, heel: -0.6, toe: -0.6, grip: -0.6, ...shape.low };
  const free = new Set(shape.floorFree ?? []);
  /** What grips the floor at a moment: his heels and toes, or what his shape says. */
  const gripsAt = (which: string, t: number, s: Skeleton, q: Posed): ReadonlyArray<{ name: string; p: V3 }> =>
    shape.grips ? shape.grips(which, t, s, q) : [{ name: 'heelL', p: s.heelL }, { name: 'toeL', p: s.toeL }, { name: 'heelR', p: s.heelR }, { name: 'toeR', p: s.toeR }];
  /** His arms at a moment: a man's two, or what his shape says. */
  const armsAt = (which: string, t: number, s: Skeleton, q: Posed): ReadonlyArray<CheckArm> =>
    shape.arms ? shape.arms(which, t, s, q) : [{ name: 'L', sh: s.shoulderL, el: s.elbowL, hand: s.handL }, { name: 'R', sh: s.shoulderR, el: s.elbowR, hand: s.handR }];
  for (const which of moves) {
    const mv = moveOf(mob, which);
    if (!mv) continue;
    const ts = framesOf(mob, which);
    const round = loops(mob, which);
    // (walking, the floor goes by under him: a foot on it goes back with it)
    const ground = mv.ground ?? 0;
    const sk = ts.map((t) => skeletonAt(mob, which, t));
    const qs = ts.map((t) => posedOfMob(mob, which, t));
    const tips = ts.map((t, i) => shape.tip?.(which, t, sk[i], qs[i]) ?? null);
    // --- SLIDE: each heel and toe (or what grips), from where it came down, until it lifts (a loop: followed round twice, so that one down where it closes is followed across) ---
    const grips = ts.map((t, i) => gripsAt(which, t, sk[i], qs[i]));
    for (const g of grips[0] ?? []) {
      const name = g.name;
      for (const view of VIEWS) {
        let start: [number, number] | null = null;
        let from = 0;
        const n = ts.length;
        const list = round ? [...ts.keys(), ...ts.keys()].map((i, j) => ({ i, lap: j >= n ? 1 : 0 })) : [...ts.keys()].map((i) => ({ i, lap: 0 }));
        for (const { i, lap } of list) {
          const p = grips[i].find((e) => e.name === name)?.p;
          if (!p || p[2] > 0.6) {
            start = null;
            continue;
          }
          // (the game carries a walking figure on at its pace: where the foot is on the floor itself)
          const T = ts[i] + lap * (ts[n - 1] - ts[0]);
          const [x, y] = seen([p[0] + ground * T, p[1], p[2]], view);
          if (!start) {
            start = [x, y];
            from = ts[i];
            continue;
          }
          const d = Math.hypot(x - start[0], y - start[1]);
          if (d > SLIDE_MAX) found.push({ move: which, t: ts[i], kind: 'slide', what: `${name} (down from ${from.toFixed(2)} s)`, by: d });
        }
      }
    }
    for (let fi = 0; fi < ts.length; fi++) {
      const t = ts[fi];
      const s = sk[fi];
      const q = qs[fi];
      const { limbs, lumps } = shape.body(s, q);
      const arms = armsAt(which, t, s, q);
      // --- FLOOR ---
      if (!shape.arms) {
        for (const side of ['L', 'R'] as const) {
          const parts: [keyof typeof low, V3][] = [['knee', side === 'L' ? s.kneeL : s.kneeR], ['elbow', side === 'L' ? s.elbowL : s.elbowR], ['hand', side === 'L' ? s.handL : s.handR]];
          for (const [name, p] of parts) if (p[2] < low[name] - SINK_MAX) found.push({ move: which, t, kind: 'floor', what: `${name}${side}`, by: low[name] - p[2] });
        }
      } else {
        for (const a of arms) for (const [name, p] of [['elbow', a.el], ['hand', a.hand]] as const) if (p[2] < low[name] - SINK_MAX) found.push({ move: which, t, kind: 'floor', what: `${name} ${a.name}`, by: low[name] - p[2] });
      }
      for (const g of grips[fi]) {
        const lo = shape.grips ? low.grip : low[g.name.startsWith('heel') ? 'heel' : 'toe'];
        if (g.p[2] < lo - SINK_MAX) found.push({ move: which, t, kind: 'floor', what: g.name, by: lo - g.p[2] });
      }
      // (and his trunk and head, lying on the floor: not into it)
      for (const o of lumps) {
        if (free.has(o.name)) continue;
        const under = o.c[2] - Math.hypot(o.h[0] * o.rot[0][2], o.h[1] * o.rot[1][2], o.h[2] * o.rot[2][2]);
        if (under < -SINK_MAX) found.push({ move: which, t, kind: 'floor', what: o.name, by: -under });
      }
      for (const l of limbs) {
        if (l.name !== 'head' && l.name !== 'neck') continue;
        const under = Math.min(l.a[2], l.b[2]) - l.r;
        if (under < -SINK_MAX) found.push({ move: which, t, kind: 'floor', what: l.name, by: -under });
      }
      // --- ARM: into his head, his neck, his trunk or what he wears; a hand into a thigh ---
      for (const a of arms) {
        const { sh, el } = a;
        const ha = a.hand;
        for (let k = 0; k <= 12; k++) {
          // (the top of the upper arm is in the shoulder: from its middle on)
          const pt = k <= 6 ? add(sh, mul(sub(el, sh), 0.45 + 0.55 * (k / 6))) : add(el, mul(sub(ha, el), (k - 6) / 6));
          const bit = k <= 6 ? 'upper' : 'fore';
          for (const o of lumps) {
            const d = inLump(pt, o);
            if (d > SINK_MAX) found.push({ move: which, t, kind: 'arm', what: `${bit}${a.name} in ${o.name}`, by: d });
          }
          for (const l of limbs) {
            if (l.name !== 'head' && l.name !== 'neck') continue;
            const d = inLimb(pt, l);
            if (d > SINK_MAX) found.push({ move: which, t, kind: 'arm', what: `${bit}${a.name} in ${l.name}`, by: d });
          }
        }
        for (const l of limbs) {
          if (!/^leg[LR]$/.test(l.name)) continue;
          const d = inLimb(ha, l);
          if (d > SINK_MAX) found.push({ move: which, t, kind: 'arm', what: `hand${a.name} in ${l.name}`, by: d });
        }
      }
      // --- THROUGH ---
      for (const th of shape.things?.(which, t, s, q) ?? []) {
        const may = new Set(th.may ?? []);
        const tol = th.r >= THICK ? THICK : th.r + SINK_MAX;
        for (const q of th.pts) {
          // (how far into him it goes: a thin thing, its middle; a thick one, its side)
          for (const l of limbs) {
            if (may.has(l.name)) continue;
            const d = inLimb(q, l) + th.r;
            if (d > tol) found.push({ move: which, t, kind: 'through', what: `${th.name} in ${l.name}`, by: th.r >= THICK ? d : d - th.r });
          }
          for (const o of lumps) {
            if (may.has(o.name)) continue;
            const d = inLump(q, o) + th.r;
            if (d > tol) found.push({ move: which, t, kind: 'through', what: `${th.name} in ${o.name}`, by: th.r >= THICK ? d : d - th.r });
          }
        }
      }
    }
    // --- JERK: the points that carry a move, frame to frame, as the game shows them ---
    const fol = shape.follow ? ts.map((t, i) => (shape.follow as NonNullable<BossShape['follow']>)(which, t, sk[i], qs[i])) : null;
    const followed: [string, (i: number) => V3 | null][] = fol
      ? [['tip', (i) => tips[i]], ...Object.keys(fol[0] ?? {}).map((k): [string, (i: number) => V3 | null] => [k, (i) => fol[i][k] ?? null])]
      : [['tip', (i) => tips[i]], ['handR', (i) => sk[i].handR], ['handL', (i) => sk[i].handL], ['head', (i) => sk[i].head], ['pelvis', (i) => sk[i].pelvis]];
    const jerks = new Set<string>();
    for (const [name, at] of followed) {
      for (const view of VIEWS) {
        const pts = ts.map((_, i) => at(i));
        if (pts.some((p) => !p)) continue;
        const xy = pts.map((p) => seen(p as V3, view));
        const st: [number, number][] = [];
        // (a loop's frames end with its first again: its closing step is the last of these)
        for (let i = 1; i < xy.length; i++) st.push([xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]]);
        const sp = st.map(([x, y]) => Math.hypot(x, y));
        const n = sp.length;
        if (n < 3 || Math.max(...sp) < 2) continue;
        const say = (what: string, i: number, by: number): void => {
          const key = `${name} ${what}`;
          if (jerks.has(key)) return;
          jerks.add(key);
          found.push({ move: which, t: ts[Math.min(ts.length - 1, i + 1)], kind: 'jerk', what: `${name} ${what} (${view})`, by });
        };
        for (let i = 0; i < n; i++) {
          const a = sp[(i - 1 + n) % n];
          const b = sp[i];
          const c = sp[(i + 1) % n];
          const edge = !round && (i === 0 || i === n - 1);
          if (!edge && b > 4 && b > 2.2 * Math.max(a, c)) say('leaps', i, b);
          if (!edge && a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) {
            const sa = st[(i - 1 + n) % n];
            const sc = st[(i + 1) % n];
            if ((sa[0] * sc[0] + sa[1] * sc[1]) / (Math.hypot(...sa) * Math.hypot(...sc) || 1) > 0.5) say('stalls', i, Math.min(a, c) - b);
          }
          if (i > 0 || round) {
            const sa = st[(i - 1 + n) % n];
            const sb = st[i];
            if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) say('turns straight back at speed', i, Math.min(a, b));
          }
        }
        // (but struck, or struck down: the blow throws him at once, as a blow does)
        if (!round && which !== 'reel' && which !== 'dying' && sp[0] > 3 && sp[0] >= 0.95 * Math.max(...sp.slice(0, 4))) say('starts at its fastest', 0, sp[0]);
        if (!round && sp[n - 1] > 3 && sp[n - 1] >= 0.95 * Math.max(...sp.slice(-4))) say('stops dead from its fastest', n - 1, sp[n - 1]);
      }
    }
    // --- BLOW and HIPS: a blow drawn back, held, and carried through; the hips first ---
    const hit = mv.motion.hit;
    if (hit !== undefined && which !== 'stand' && which !== 'walk' && tips.every((p, i) => p || Math.abs(ts[i] - hit) > 0.2)) {
      const tipAt = (t: number): V3 | null => shape.tip?.(which, t, skeletonAt(mob, which, t), posedOfMob(mob, which, t)) ?? null;
      const h0 = tipAt(Math.max(0, hit - FR / 2));
      const h1 = tipAt(hit + FR / 2);
      if (h0 && h1 && len(sub(h1, h0)) > 1e-6) {
        const way = norm(sub(h1, h0));
        const atHit = lerp3(h0, h1, 0.5);
        let back = 0;
        let on = 0;
        let still = 0;
        let stillMost = 0;
        for (let i = 0; i < ts.length; i++) {
          const p = tips[i];
          if (!p) continue;
          const along = dot(sub(p, atHit), way);
          if (ts[i] <= hit) back = Math.max(back, -along);
          else on = Math.max(on, along);
          // (the warning: the end he strikes with held nearly still a while before the blow, or his body held while it whirls overhead)
          if (i > 0 && ts[i] > 0.15 && ts[i] < hit - 0.08 && tips[i - 1]) {
            const moved = (a: V3, b: V3): number => Math.max(...VIEWS.map((v) => Math.hypot(seen(a, v)[0] - seen(b, v)[0], seen(a, v)[1] - seen(b, v)[1])));
            const d = Math.min(moved(p, tips[i - 1] as V3), Math.max(moved(sk[i].ribs, sk[i - 1].ribs), moved(sk[i].pelvis, sk[i - 1].pelvis), moved(sk[i].head, sk[i - 1].head)));
            still = d < 1.5 ? still + 1 : 0;
            stillMost = Math.max(stillMost, still);
          }
        }
        // (in game pixels, near enough: the figure's own lengths are about half of one up and down, and more across)
        if (back * 0.6 < 8) found.push({ move: which, t: hit, kind: 'blow', what: 'not drawn back before the blow', by: back * 0.6 });
        if (on * 0.6 < 3) found.push({ move: which, t: hit, kind: 'blow', what: 'no follow-through after the blow', by: on * 0.6 });
        if (stillMost < 2) found.push({ move: which, t: hit, kind: 'blow', what: 'no held warning before the blow', by: stillMost });
        // HIPS: where in the blow each gets going (the first frame at which it moves at most of its own top speed through the blow): the hips, then the chest, then the end he strikes with
        // (the blow itself: from the end of its held warning, the last moment before it that the end he strikes with was nearly still, to just after it)
        let from = hit - 0.5;
        for (let i = 1; i < ts.length; i++) {
          if (ts[i] >= hit - 0.04 || !tips[i] || !tips[i - 1]) continue;
          const d = Math.max(...VIEWS.map((v) => Math.hypot(seen(tips[i] as V3, v)[0] - seen(tips[i - 1] as V3, v)[0], seen(tips[i] as V3, v)[1] - seen(tips[i - 1] as V3, v)[1])));
          if (d < 1.5 && ts[i] > from) from = ts[i];
        }
        const going = (of: (s: Skeleton, i: number) => V3 | null, angle: boolean): number => {
          const sp: [number, number][] = [];
          for (let i = 1; i < ts.length; i++) {
            if (ts[i] < from || ts[i] > hit + 0.1) continue;
            const a = of(sk[i - 1], i - 1);
            const b = of(sk[i], i);
            if (!a || !b) continue;
            sp.push([i, angle ? angleBetween(a, b) : len(sub(b, a))]);
          }
          const top = Math.max(0, ...sp.map(([, v]) => v));
          if (top <= (angle ? 1.5 : 1)) return -1;
          return sp.find(([, v]) => v >= 0.6 * top)?.[0] ?? -1;
        };
        const fh = going((s) => facing(s.hips), true);
        const fc = going((s) => facing(s.chest), true);
        const ft = going((_, i) => tips[i], false);
        if (fh >= 0 && fc >= 0 && ft >= 0 && !(fh <= fc && fc <= ft)) found.push({ move: which, t: hit, kind: 'hips', what: `gets going: hips at ${ts[fh].toFixed(2)} s, chest ${ts[fc].toFixed(2)}, the blow's end ${ts[ft].toFixed(2)}`, by: Math.max(0, ts[fh] - ts[fc], ts[fc] - ts[ft]) * 30 });
      }
    }
    // --- ALIVE: standing, his chest rises and his hips sway ---
    if (which === 'stand') {
      const zs = sk.map((s) => s.ribs[2] / 2);
      const rise = Math.max(...zs) - Math.min(...zs);
      let sway = 0;
      for (const view of VIEWS) {
        const xs = sk.map((s) => seen(s.pelvis, view)[0]);
        sway = Math.max(sway, Math.max(...xs) - Math.min(...xs));
      }
      if (rise < 0.6) found.push({ move: which, t: 0, kind: 'alive', what: 'his chest barely rises', by: rise });
      if (sway < 0.6) found.push({ move: which, t: 0, kind: 'alive', what: 'his weight never shifts', by: sway });
    }
  }
  // --- JUMP: where one move hands over to the next ---
  const all = movesOf(mob).filter((m) => !shape.pictures?.includes(m));
  const hand: Handover[] = shape.handovers
    ? [...shape.handovers]
    : [
        ...all.filter((m) => m !== 'stand' && m !== 'walk').flatMap((m): Handover[] => (m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0, mob: shape.after?.[m] }])),
        { from: 'stand', at: 0, to: 'walk', toAt: 0 },
        ...framesOf(mob, 'walk').map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
      ];
  // (his stand the game leaves at whatever frame it has come to, as it left the heroes' standing: from every frame of it)
  const stands = framesOf(mob, 'stand');
  /** The points of him at a moment of a move (`who`: as he is then): a man's head, hands, knees and feet, or what his shape follows. */
  const pointsAt = (who: Mob, move: string, t: number, s: Skeleton): Record<string, V3> => (shape.follow ? { ...shape.follow(move, t, s, posedOfMob(who, move, t)) } : pointsOf(s));
  for (const h of hand) {
    if (!moves.includes(h.from) && !moves.includes(h.to)) continue;
    const froms = h.from === 'stand' ? stands : [h.at === 'end' ? longOf(mob, h.from) : h.at];
    const b = skeletonAt(h.mob ?? mob, h.to, h.toAt);
    const pb = pointsAt(h.mob ?? mob, h.to, h.toAt, b);
    const thB = (h.mob ? (shape.thingsOf?.(h.mob) ?? shape.things) : shape.things)?.(h.to, h.toAt, b, posedOfMob(h.mob ?? mob, h.to, h.toAt)) ?? [];
    let worst = 0;
    let worstAt = froms[0];
    const carried = new Map<string, { by: number; t: number }>();
    for (const ta of froms) {
      const a = skeletonAt(mob, h.from, ta);
      const pa = pointsAt(mob, h.from, ta, a);
      for (const view of VIEWS) {
        let sum = 0;
        let n = 0;
        for (const k of Object.keys(pa)) {
          if (!pb[k]) continue;
          const [x0, y0] = seen(pa[k], view);
          const [x1, y1] = seen(pb[k], view);
          sum += Math.hypot(x1 - x0, y1 - y0);
          n++;
        }
        if (sum / n > worst) {
          worst = sum / n;
          worstAt = ta;
        }
      }
      // (and what he carries or drags: a chain swinging at the end of one move and hanging still at the start of the next leaps)
      for (const x of shape.things?.(h.from, ta, a, posedOfMob(mob, h.from, ta)) ?? []) {
        const y = thB.find((z) => z.name === x.name);
        if (!y || y.pts.length !== x.pts.length || !x.pts.length) continue;
        for (const view of VIEWS) {
          let sum = 0;
          for (let i = 0; i < x.pts.length; i++) {
            const [x0, y0] = seen(x.pts[i], view);
            const [x1, y1] = seen(y.pts[i], view);
            sum += Math.hypot(x1 - x0, y1 - y0);
          }
          const w = sum / x.pts.length;
          if (w > (carried.get(x.name)?.by ?? 0)) carried.set(x.name, { by: w, t: ta });
        }
      }
    }
    const when = (t: number): string => (h.at === 'end' ? 'its end' : `${t.toFixed(2)} s`);
    if (worst > JUMP_MAX) found.push({ move: `${h.from} > ${h.to}`, t: worstAt, kind: 'jump', what: `${h.from} at ${when(worstAt)} into ${h.to}${h.mob ? ` (${h.mob.id})` : ''}`, by: worst });
    for (const [name, { by, t }] of carried) if (by > JUMP_MAX * 1.5) found.push({ move: `${h.from} > ${h.to}`, t, kind: 'jump', what: `his ${name}, ${h.from} at ${when(t)} into ${h.to}`, by });
  }
  return found.sort((a, b) => b.by - a.by);
}

/** What was found, put shortly: the worst of each kind of thing in each move, with when. */
export function findingsSaid(found: ReadonlyArray<Finding>): string[] {
  const worst = new Map<string, Finding & { n: number }>();
  for (const f of found) {
    const k = `${f.move} ${f.kind} ${f.what.replace(/ \(down from [\d.]+ s\)/, '')}`;
    const w = worst.get(k);
    if (!w) worst.set(k, { ...f, n: 1 });
    else {
      w.n++;
      if (f.by > w.by) Object.assign(w, { t: f.t, by: f.by, what: f.what });
    }
  }
  return [...worst.values()].sort((a, b) => (a.move === b.move ? b.by - a.by : a.move < b.move ? -1 : 1)).map((w) => `${w.move}: ${w.kind} ${w.what}, ${w.by.toFixed(1)} at ${w.t.toFixed(2)} s (${w.n} frame${w.n > 1 ? 's' : ''})`);
}
