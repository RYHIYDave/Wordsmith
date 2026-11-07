// HOW LONG THE HEROES' LEGS READ ON THE SCREEN (the art chat's helper, 7 Nov 2026; docs/mockups/ranger_up/README.md, "His legs").
// The owner, of the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like all these guys have long
// upper legs and short legs below the knee”.
//
// For every hero the game has from the bones (the Ranger before and now, the Warrior brought up, the Mage, the Warlock, the
// Tinkerer, the Brawler in his Veteran look), from in front, standing straight, in his stance and in a stride of his run:
//   BONES   on the screen, in game pixels (two picture pixels to one: art/kit.ts GRAIN), from the hip joint to the knee joint, and
//           from the knee joint to the floor (the shin to the ankle, and the ankle down to the floor under it);
//   EYE     what the eye reads: from where the thigh shows below what hangs over it (skirt, tabard, coat) to where the lower leg's
//           covering begins (the top of a boot, its cuff, a greave: the knee as it is SEEN), and from there to the sole.
// Each measured on the leg nearer the eye.
//
//   npx tsx tools/legs_measure.ts table            the table (JSON lines, then a plain table)
//   npx tsx tools/legs_measure.ts sheet <dir>      a picture of each, standing, in his stance and running, for looking at

// @ts-ignore - node typings are not part of this project
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { Ramp } from '../src/art/kit';
import { RIM_ALPHA } from '../src/art/kit';
import { MOVES3, MAGE_BODY, RANGER_BODY, KNIGHT_BODY } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { paintMove3 } from '../src/art/heroes3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { bonesAt, solve, standing } from '../src/art/skeleton';
import type { Build, Skeleton, V3 } from '../src/art/skeleton';
import { paintWu } from '../src/art/warrior_up_art';
import { WU_MOVES } from '../src/art/warrior_up_moves';
import { WU_MAIL, WU_RED, WU_STEEL } from '../src/art/warrior_up';
import { RU_HOSE, RU_LEAF, RU_PLUM } from '../src/art/ranger_up';
import { paintRuMove as paintRu } from '../src/art/ranger_up_art';
import { RU_MOVES } from '../src/art/ranger_up_moves';
import { LEAF, MAIL, PLUM } from '../src/art/kit';
import { WARLOCK_B, drawWarlockAt, warlockMoves, warlockPose } from '../src/dev/warlock_moves';
import { TINK_B, drawTinkerAt, tinkerMoves, tinkerPose } from '../src/dev/tinkerer_moves';
import { VET_BUILD, paintVeteran } from '../src/dev/sculpt_veteran';
import { VET_RUN, VET_STAND, vetAt } from '../src/dev/veteran_moves';
import type { Drawn, Mat } from '../src/dev/sculpt';
import { LAST } from '../src/dev/sculpt';
import { ROBE, CYAN } from '../src/art/kit';
import { paintMuMove } from '../src/art/mage_up_art';
import { MU_MOVES } from '../src/art/mage_up_moves';
import { MU_HOSE, MU_PLUM, MU_ROBE } from '../src/art/mage_up';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };

/** A part of the leg's covering, as the eye reads it. */
export type Cover = 'over' | 'upper' | 'lower' | 'skin' | 'other';

/** One figure measured: its bones, its picture, the stage it was drawn on, and how to tell what covers a pixel. */
export interface Sample {
  hero: string;
  pose: string;
  B: Build;
  s: Skeleton;
  px: Px;
  st: Stage;
  /** What covers the pixel (x, y). */
  cover: (x: number, y: number) => Cover;
}

const GAME = 2;
const STAND_T = 0.6;
/** How far through his run's round a stride is taken (the table takes eight, evenly, and gives their median). */
export const PHASE = { k: 0.25 };

/** Colours of ramps as a set, for the old painters (which leave no record of what each pixel is). */
const setOf = (...ramps: Ramp[]): Set<string> => new Set(ramps.flat().map((c) => c.toLowerCase()));
const hex = (px: Px, x: number, y: number): string => {
  const k = (y * px.w + x) * 4;
  return '#' + [0, 1, 2].map((i) => px.d[k + i].toString(16).padStart(2, '0')).join('');
};
/** A classifier by colour (old painters): the first set a pixel's colour is in. */
function byColour(px: Px, sets: [Cover, Set<string>][]): (x: number, y: number) => Cover {
  return (x, y) => {
    if (x < 0 || y < 0 || x >= px.w || y >= px.h) return 'other';
    const a = px.d[(y * px.w + x) * 4 + 3];
    if (a === 0 || a === RIM_ALPHA) return 'other';
    const c = hex(px, x, y);
    for (const [k, s] of sets) if (s.has(c)) return k;
    return 'other';
  };
}
/** A classifier by what the sculptor drew there (each pixel's material), its materials told apart by their ramps. */
function byStuff(d: Drawn, mats: { ramp: Ramp }[], sets: [Cover, Ramp[]][]): (x: number, y: number) => Cover {
  const kind = mats.map((m) => {
    for (const [k, rs] of sets) if (rs.some((r) => r === m.ramp || r.join() === m.ramp.join())) return k;
    return 'other' as Cover;
  });
  return (x, y) => {
    if (x < 0 || y < 0 || x >= d.px.w || y >= d.px.h) return 'other';
    const a = d.px.d[(y * d.px.w + x) * 4 + 3];
    if (a === 0 || a === RIM_ALPHA) return 'other';
    const m = d.stuff[y * d.px.w + x];
    return m >= 0 && m < kind.length ? kind[m] : 'other';
  };
}

// ---------------------------------------------------------------------------------------------
// The heroes

const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;

function rangerBefore(pose: 'straight' | 'stance' | 'run'): Sample {
  const m = pose === 'run' ? MOVES3.rrun : MOVES3.rstand;
  const t = pose === 'run' ? endOf(m) * PHASE.k : STAND_T;
  const q = pose === 'straight' ? (standing(RANGER_BODY) as never) : bonesAt(m.motion.keys, m.rest, t);
  const s = solve(RANGER_BODY, q);
  const px = pose === 'straight' ? oldStraight(m) : paintMove3(m, t, 'front').px;
  return { hero: 'Ranger, before', pose, B: RANGER_BODY, s, px, st: stage('front'), cover: byColour(px, [['over', setOf(LEAF)], ['upper', setOf(MAIL)], ['lower', setOf(PLUM)]]) };
}
/** (standing straight, the old painters: the move's own painting of the straight pose) */
function oldStraight(m: Move3): Px {
  const straight: Move3 = { ...m, rest: { ...m.rest, ...standing(m.build) }, motion: { keys: [{ at: 0, pose: {} }] } };
  return paintMove3(straight, 0, 'front').px;
}
function rangerNow(pose: 'straight' | 'stance' | 'run', legs = false): Sample {
  const paint = paintRu;
  const m0 = pose === 'run' ? MOVES3.rrun : legs ? RU_MOVES.rstand : MOVES3.rstand;
  const m: Move3 = pose === 'straight' ? { ...m0, rest: { ...m0.rest, ...standing(RANGER_BODY) }, motion: { keys: [{ at: 0, pose: {} }] } } : m0;
  const t = pose === 'run' ? endOf(m) * PHASE.k : pose === 'straight' ? 0 : STAND_T;
  const f = paint(m, t, 'front');
  return { hero: legs ? 'Ranger, legs true' : 'Ranger, now (first sculpt)', pose, B: RANGER_BODY, s: f.s, px: f.px, st: f.drawn.st, cover: byStuff(f.drawn, f.sc.mats, [['over', [RU_LEAF]], ['upper', [RU_HOSE]], ['lower', [RU_PLUM]]]) };
}
function warrior(pose: 'straight' | 'stance' | 'run'): Sample {
  const m0 = pose === 'run' ? WU_MOVES.krun : WU_MOVES.rear;
  const m: Move3 = pose === 'straight' ? { ...m0, rest: { ...m0.rest, ...standing(KNIGHT_BODY) }, motion: { keys: [{ at: 0, pose: {} }] } } : m0;
  const t = pose === 'run' ? endOf(m) * PHASE.k : pose === 'straight' ? 0 : 1.3;
  const f = paintWu(m, t, 'front');
  return { hero: 'Warrior (brought up)', pose, B: KNIGHT_BODY, s: f.s, px: f.px, st: f.drawn.st, cover: byStuff(f.drawn, f.sc.mats, [['over', [WU_RED]], ['upper', [WU_MAIL]], ['lower', [WU_STEEL]]]) };
}
function mage(pose: 'straight' | 'stance' | 'run'): Sample {
  const m = pose === 'run' ? MOVES3.mrun : MOVES3.mstand;
  const t = pose === 'run' ? endOf(m) * PHASE.k : STAND_T;
  const q = pose === 'straight' ? (standing(MAGE_BODY) as never) : bonesAt(m.motion.keys, m.rest, t);
  const s = solve(MAGE_BODY, q);
  const px = pose === 'straight' ? oldStraight(m) : paintMove3(m, t, 'front').px;
  return { hero: 'Mage', pose, B: MAGE_BODY, s, px, st: stage('front'), cover: mageCover(px) };
}
/** THE MAGE BROUGHT UP (art/mage_up.ts; the art chat's helper, 7 Nov 2026): her guard with her legs true (art/mage_up_moves.ts). */
function mageNow(pose: 'straight' | 'stance' | 'run'): Sample {
  const m0 = pose === 'run' ? MOVES3.mrun : MU_MOVES.mstand;
  const m: Move3 = pose === 'straight' ? { ...m0, rest: { ...m0.rest, ...standing(MAGE_BODY) }, motion: { keys: [{ at: 0, pose: {} }] } } : m0;
  const t = pose === 'run' ? endOf(m) * PHASE.k : pose === 'straight' ? 0 : STAND_T;
  const f = paintMuMove(m, t, 'front');
  return { hero: 'Mage, brought up', pose, B: MAGE_BODY, s: f.s, px: f.px, st: f.drawn.st, cover: byStuff(f.drawn, f.sc.mats, [['over', [MU_ROBE]], ['upper', [MU_HOSE]], ['lower', [MU_PLUM]]]) };
}
/** (the Mage, in her battle look, the game's: her short robe and its hem of light over dark hose, tall boots to the knee: art/hero3_mage.ts) */
const mageCover = (px: Px): ((x: number, y: number) => Cover) => byColour(px, [['over', setOf(ROBE, CYAN)], ['upper', setOf(MAIL)], ['lower', setOf(PLUM)]]);

function warlock(pose: 'straight' | 'stance' | 'run'): Sample {
  const [stand, run] = warlockMoves();
  const m = pose === 'run' ? run : stand;
  const t = pose === 'run' ? m.long * PHASE.k : pose === 'straight' ? 0 : STAND_T;
  const mm = pose === 'straight' ? { ...m, motion: { keys: [{ at: 0, pose: { ...standing(WARLOCK_B) } }] } } : m;
  const d = drawWarlockAt('front', mm, t);
  const mats = (LAST.sc as NonNullable<typeof LAST.sc>).mats;
  const s = solve(WARLOCK_B, warlockPose(mm.motion, t));
  return { hero: 'Warlock', pose, B: WARLOCK_B, s, px: d.px, st: d.st, cover: warlockCover(d, mats) };
}
function tinkerer(pose: 'straight' | 'stance' | 'run'): Sample {
  const [stand, run] = tinkerMoves();
  const m = pose === 'run' ? run : stand;
  const t = pose === 'run' ? m.long * PHASE.k : pose === 'straight' ? 0 : STAND_T;
  const mm = pose === 'straight' ? { ...m, motion: { keys: [{ at: 0, pose: { ...standing(TINK_B) } }] }, air: undefined } : m;
  const d = drawTinkerAt('front', mm, t, 0);
  const mats = (LAST.sc as NonNullable<typeof LAST.sc>).mats;
  const s = solve(TINK_B, tinkerPose(mm.motion, t));
  return { hero: 'Tinkerer', pose, B: TINK_B, s, px: d.px, st: d.st, cover: tinkererCover(d, mats) };
}
function veteran(pose: 'straight' | 'stance' | 'run'): Sample {
  const p = pose === 'run' ? vetAt(VET_RUN, Math.round(VET_RUN.long * PHASE.k) % VET_RUN.long) : vetAt(VET_STAND, 18);
  const bones = pose === 'straight' ? {} : p.bones;
  const vp = { ...p, bones };
  const d = paintVeteran(vp, 0, 'front');
  const s = solve(VET_BUILD, { ...standing(VET_BUILD), ...bones } as never);
  return { hero: 'Brawler (Veteran)', pose, B: VET_BUILD, s, px: d.px, st: d.st, cover: veteranCover(d, d.fig.sc.mats) };
}
/** By material, its ramp's colours as the sculpt names them, and which of several of one ramp (0 the first made). */
const sig = (r: Ramp): string => r.join(',').toLowerCase();
function byMats(d: Drawn, mats: Mat[], pick: (m: Mat, i: number, nth: number) => Cover): (x: number, y: number) => Cover {
  const seen = new Map<string, number>();
  const kind = mats.map((m, i) => {
    const k = sig(m.ramp);
    const nth = seen.get(k) ?? 0;
    seen.set(k, nth + 1);
    return pick(m, i, nth);
  });
  return (x, y) => {
    if (x < 0 || y < 0 || x >= d.px.w || y >= d.px.h) return 'other';
    const a = d.px.d[(y * d.px.w + x) * 4 + 3];
    if (a === 0 || a === RIM_ALPHA) return 'other';
    const m = d.stuff[y * d.px.w + x];
    return m >= 0 && m < kind.length ? kind[m] : 'other';
  };
}
// (their ramps, as dev/sculpt_warlock.ts, dev/sculpt_tinkerer.ts, dev/sculpt_classes.ts and dev/sculpt_veteran.ts have them)
const COAT = '#0e0b1c,#1e1832,#322a50,#4c4270,#6c6094';
const NAVY = '#0a0c1e,#141a36,#22305a,#364a84,#5070aa';
const HIDE = '#1e1018,#3a2026,#64382e,#94583c,#b8784e';
const VET_CLOTH = '#1a1c2c,#30364c,#4e5670,#727c96,#9aa2b8';
const VET_SKIN = '#341a22,#663634,#a0604a,#cc8e68,#ecbe96';
/** The Warlock: his coat's skirts to his ankles over trousers of the same cloth (the second of that ramp made), boots of hide (the first hide made after the trousers). */
function warlockCover(d: Drawn, mats: Mat[]): (x: number, y: number) => Cover {
  const trousers = mats.findIndex((m, i) => sig(m.ramp) === COAT && mats.slice(0, i).some((n) => sig(n.ramp) === COAT));
  return byMats(d, mats, (m, i) => (sig(m.ramp) === COAT ? (i === trousers ? 'upper' : 'over') : sig(m.ramp) === HIDE && i === trousers + 1 ? 'lower' : 'other'));
}
/** The Tinkerer: navy trousers (the second navy made: the first is her shirt), her boots of hide (made next). */
function tinkererCover(d: Drawn, mats: Mat[]): (x: number, y: number) => Cover {
  const trousers = mats.findIndex((m, i) => sig(m.ramp) === NAVY && mats.slice(0, i).some((n) => sig(n.ramp) === NAVY));
  return byMats(d, mats, (m, i) => (i === trousers ? 'upper' : sig(m.ramp) === NAVY ? 'over' : i === trousers + 1 ? 'lower' : 'other'));
}
/** The Veteran: his trousers hacked off below the knee; below them his bare shins (one bound) and bare feet. */
function veteranCover(d: Drawn, mats: Mat[]): (x: number, y: number) => Cover {
  return byMats(d, mats, (m) => (sig(m.ramp) === VET_CLOTH ? 'upper' : sig(m.ramp) === VET_SKIN ? 'lower' : 'other'));
}

export const HEROES: Record<string, (pose: 'straight' | 'stance' | 'run') => Sample> = {
  'ranger-before': rangerBefore,
  'ranger-now': (p) => rangerNow(p),
  'ranger-legs': (p) => rangerNow(p, true),
  warrior,
  mage,
  'mage-now': mageNow,
  warlock,
  tinkerer,
  veteran,
};

// ---------------------------------------------------------------------------------------------
// The measures

const sub2 = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

export interface Measure {
  hero: string;
  pose: string;
  leg: 'L' | 'R';
  /** Bones on the screen, game pixels. */
  thigh: number;
  lower: number;
  /** As the eye reads them, game pixels (NaN where it cannot be told). */
  eyeThigh: number;
  eyeLower: number;
  /** Where the eye's knee is below the joint, game pixels down the shin (the top of the boot, cuff or greave). */
  seenKneeBelow: number;
  /** Where on the picture (picture pixels) the hem over the thigh ends, and the eye's knee is; null where it cannot be told. */
  hemAt?: [number, number] | null;
  seenAt?: [number, number] | null;
}

export function measure(sm: Sample): Measure {
  const { s, st, px } = sm;
  const near = st.near(s.kneeL) >= st.near(s.kneeR) ? 'L' : 'R';
  const hip = near === 'L' ? s.hipL : s.hipR;
  const knee = near === 'L' ? s.kneeL : s.kneeR;
  const ankle = near === 'L' ? s.ankleL : s.ankleR;
  // (the foot: the ankle's own height above the sole, as the build has it, under the ankle wherever the foot is: a lifted foot's
  // air is not leg)
  const floor: V3 = [ankle[0], ankle[1], ankle[2] - sm.B.ankle];
  const P = (p: V3): [number, number] => {
    const [x, y] = st.at(p);
    return [x, y];
  };
  const [H, K, A, F] = [P(hip), P(knee), P(ankle), P(floor)];
  const thigh = sub2(H, K) / GAME;
  const lower = (sub2(K, A) + sub2(A, F)) / GAME;
  // THE EYE: walk down the leg's line, hip to knee to ankle to the floor, a quarter pixel at a time, and see what covers it
  const path: [number, number][] = [];
  const legs: [[number, number], [number, number]][] = [[H, K], [K, A], [A, F]];
  for (const [a, b] of legs) {
    const n = Math.max(1, Math.ceil(sub2(a, b) * 4));
    for (let i = 0; i < n; i++) path.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
  }
  path.push(F);
  const along: number[] = [0];
  for (let i = 1; i < path.length; i++) along.push(along[i - 1] + sub2(path[i], path[i - 1]));
  const kneeAt = (() => {
    let best = 0;
    for (let i = 0; i < path.length; i++) if (sub2(path[i], K) < sub2(path[best], K)) best = i;
    return best;
  })();
  // (a covering counts where it holds the line for at least a pixel and a half: an ink line or a strap does not break it)
  const kinds = path.map(([x, y]) => {
    // (the pixel, or one beside it across the line, so an ink seam does not hide what is there)
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = sm.cover(Math.floor(x) + dx, Math.floor(y) + dy);
      if (c !== 'other') return c;
    }
    return 'other' as Cover;
  });
  // the hem: the last point, above the knee, where what hangs over the thigh covers it
  let hem = -1;
  for (let i = 0; i <= kneeAt; i++) if (kinds[i] === 'over') hem = i;
  // the seen knee: where the upper leg's covering ends and the lower leg's begins (the top of a boot, its cuff, a greave, the
  // hem of trousers cut off below the knee): the first point of the lower's covering after the last of the upper's
  let lastUpper = -1;
  for (let i = 0; i < path.length; i++) if (kinds[i] === 'upper') lastUpper = i;
  let seen = -1;
  for (let i = Math.max(0, hem, lastUpper); i < path.length; i++) if (kinds[i] === 'lower') {
    seen = i;
    break;
  }
  // the sole: the lowest painted pixel of the figure under the ankle (within three game pixels either side of it)
  let soleY = -1;
  for (let y = px.h - 1; y >= 0 && soleY < 0; y--) for (let x = Math.round(A[0]) - 6; x <= Math.round(A[0]) + 6; x++) {
    if (x < 0 || x >= px.w) continue;
    const a = px.d[(y * px.w + x) * 4 + 3];
    if (a === 255) {
      soleY = y;
      break;
    }
  }
  const eyeThigh = hem >= 0 && seen > hem ? (along[seen] - along[hem]) / GAME : hem < 0 && seen >= 0 ? along[seen] / GAME : NaN;
  // (from the seen knee down to the sole: along the shin to the ankle, then straight down to the sole)
  let lowerSeen = NaN;
  if (seen >= 0 && soleY >= 0) {
    const ankleAt = path.findIndex((p) => sub2(p, A) < 0.3);
    const toAnkle = seen <= ankleAt ? along[ankleAt] - along[seen] : 0;
    lowerSeen = (toAnkle + Math.max(0, soleY + 1 - A[1])) / GAME;
  }
  return {
    hero: sm.hero,
    pose: sm.pose,
    leg: near,
    thigh: +thigh.toFixed(1),
    lower: +lower.toFixed(1),
    eyeThigh: +eyeThigh.toFixed(1),
    eyeLower: +lowerSeen.toFixed(1),
    seenKneeBelow: seen >= 0 ? +((along[seen] - along[kneeAt]) / GAME).toFixed(1) : NaN,
    hemAt: hem >= 0 ? [+path[hem][0].toFixed(1), +path[hem][1].toFixed(1)] : null,
    seenAt: seen >= 0 ? [+path[seen][0].toFixed(1), +path[seen][1].toFixed(1)] : null,
  };
}

// ---------------------------------------------------------------------------------------------

function sheet(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const [name, f] of Object.entries(HEROES)) {
    for (const pose of ['straight', 'stance', 'run'] as const) {
      const sm = f(pose);
      writeFileSync(`${dir}/${name}_${pose}.raw`, new Uint8Array(sm.px.d.buffer, sm.px.d.byteOffset, sm.px.d.byteLength));
      writeFileSync(`${dir}/${name}_${pose}.json`, JSON.stringify({ w: sm.px.w, h: sm.px.h, m: measure(sm), at: ['hipL', 'kneeL', 'ankleL', 'hipR', 'kneeR', 'ankleR'].map((k) => sm.st.at((sm.s as unknown as Record<string, V3>)[k])) }));
    }
  }
}

/** A hero's measures: standing straight, in his stance (the moment the stills show), and his run (the mean of eight strides of it). */
export function measuresOf(f: (pose: 'straight' | 'stance' | 'run') => Sample): Measure[] {
  const out = [measure(f('straight')), measure(f('stance'))];
  const runs: Measure[] = [];
  for (let i = 0; i < 8; i++) {
    PHASE.k = i / 8;
    runs.push(measure(f('run')));
  }
  PHASE.k = 0.25;
  // (the middle of the eight: a leg crossed by the other, or by an arm, in a stride or two does not throw it)
  const mean = (k: 'thigh' | 'lower' | 'eyeThigh' | 'eyeLower' | 'seenKneeBelow'): number => {
    const v = runs.map((r) => r[k]).filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    return v.length ? +((v[(v.length - 1) >> 1] + v[v.length >> 1]) / 2).toFixed(1) : NaN;
  };
  out.push({ ...runs[0], pose: 'run (8 strides, median)', thigh: mean('thigh'), lower: mean('lower'), eyeThigh: mean('eyeThigh'), eyeLower: mean('eyeLower'), seenKneeBelow: mean('seenKneeBelow') });
  return out;
}

function table(only?: string[]): void {
  const rows: Measure[] = [];
  for (const [name, f] of Object.entries(HEROES)) if (!only || only.includes(name)) rows.push(...measuresOf(f));
  for (const r of rows) console.log(JSON.stringify(r));
  const n = (v: number): string => (Number.isFinite(v) ? v.toFixed(1) : '-');
  console.log('| Hero | Pose | Bones: hip-knee | knee-floor | lower/upper | Eye: thigh shown | knee to sole | Seen knee below joint |');
  for (const r of rows) console.log(`| ${r.hero} | ${r.pose} | ${n(r.thigh)} | ${n(r.lower)} | ${Number.isFinite(r.lower / r.thigh) ? (r.lower / r.thigh).toFixed(2) : '-'} | ${n(r.eyeThigh)} | ${n(r.eyeLower)} | ${n(r.seenKneeBelow)} |`);
}

if ((process.argv[1] ?? '').replace(/\\/g, '/').endsWith('tools/legs_measure.ts')) {
  paintWithoutCanvas();
  const [mode, dir] = process.argv.slice(2);
  if (mode === 'sheet') sheet(dir);
  else table(dir ? dir.split(',') : undefined);
}
