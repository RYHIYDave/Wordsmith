// ACT 1: THE DROWNED EYE, THE ACT'S BOSS (FLOOR 10): his rules (game/act1_rules/types.ts).
//
// HIS DESIGN DOC (Level 10): the Act 1 finale, "kill the eldritch horror and break the siege"; three phases: 1, "The
// horror stays under the water. Tentacles burst up around the player"; 2, "It surfaces, a huge eye and maw rising out of
// the ruins, and spawns smaller horrors from the muck"; 3, "Desperate, it pulls the siege magic back into itself to
// survive". His words to the art chat, 15 Oct: 16:02, "Remember the drowned eye is the Act Boss.  I'd like him to have a
// couple of different phases, and a significant moveset"; 16:04, "And I want the fight to be engaging and long and
// exciting a very cool.  Lots of tentacle dodging and spells". His look, his phases and every move of his are the art
// chat's, each with his yes (art/drowned_eye.ts; docs/mockups/act1_fen/README.md). What each move hurts, how far, how
// often, and when his phases change, are these rules, the main chat's.
//
// WHERE HE IS: in the middle of his pool (Level.land.pool), which nobody walks in; the ruin's ring of paving round it is
// where the fight is. He never moves and never turns: his pictures face the camera always (his forward is straight down
// the screen), and each move of his is AIMED at the hero (`aim`: degrees round from his forward toward his left, as his
// pictures take it), as near as the few ways it is painted allow. The cult's three obelisks stand round the ring where
// his pictures bend their lines into him (bossAt).
//
// HIS PHASES, by his life: UNDER THE WATER (his eye glowing up through the pool) until he has lost PHASES.at[0] of it;
// then HE SURFACES (a forced act: his surfacing); RISEN until he has lost PHASES.at[1]; then HE PULLS THE SIEGE IN (a
// forced act: the obelisks' lines bend into him); and BLAZING to the end. Each phase has his basic blow (an arm bursting
// up under you from glowing cracks) and moves of its own (EYE_ACTS, PHASE_OF):
//   1  the bursts (four at once round you); the sweep from under the water
//   2  the bursts; his eyespawn (eggs spewed out over the ring, hatching); his splash (a wave over the whole ring)
//   3  the bursts, five; his call (the siege's bolts raining down round the ring, one on you); and all of it sooner
//
// HIS ROUND: his stand (and his lurk under the water) is a loop of 3 seconds, and every move of his figure was painted
// from its first moment, handing back to it as it will be when the move ends (the art's `clock`). So a move of his
// figure begins only as his stand comes round to its start, as the bosses of floors 2 to 5 stop only as their walks come
// round. His arms bursting up through the floor, the eggs as they land and the siege's bolts are pictures of their own:
// they need nothing of his figure, and come whenever he likes.
//
// WHAT HIS PICTURES COST, AND SO WHAT IS IN (art/act1_figs/eye.ts, EYE_COST, has the measure): a frame of him is a canvas
// of up to 860 by 790 of the art's pixels; it takes a third to two thirds of a second to paint, and risen about a
// megabyte to hold, where a frame of a boss of floors 2 to 5 takes a fiftieth of a second and a twentieth of a megabyte.
// So his moves are held at 15 frames a second or 10 (EYE_MOVES; the art's are painted for 30), each aimed move for a
// few aims, and of his art's moves only these are in: the burst, the sweep from under the water, the spew, the splash,
// the call and its bolts, his surfacing, the siege pulled in, and his death. Not in, each painted and each with his yes
// (to come if his pictures can be afforded, as EYE_MOVES says each would be held): the slam (a line wants many aims to
// fall on the hero), the sweep risen, his gaze, his bile, his breath and bite, his splash blazing, being struck.

import { MSG, TUNE } from '../defs';
import type { ActDef, BossRules } from '../bosses';
import type { Level, Monster } from '../state';
import type { Act1Rules } from './types';
import { RULES as SPAWN_RULES } from './spawn';

const D = Math.PI / 180;
const cl01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** Degrees round from `from`, within half a turn of it. */
const near180 = (deg: number, from: number): number => from + ((((deg - from) % 360) + 540) % 360) - 180;

// ---------------------------------------------------------------------------------------------
// HIS MEASURES: his pictures' own (art/drowned_eye.ts; tests/act1_eye.test.ts holds each equal to the art's)

/** His own lengths to a tile (art/new_mobs3.ts TILE3). */
export const EYE_TILE = 32 / Math.sqrt(2 / 3);
/**
 * His pool and the ruin's ring of paving round it, as his pictures paint them (EYE_POOL, EYE_RING): tiles from his middle
 * to the rim along the world's x (`rx`) and y (`ry`). His word of 15 Oct, 16:35, "The ring should be bigger, outer ring
 * and inner ring", and 20:23, "Can the ring be wider?": these are those.
 */
export const EYE_ARENA = { pool: { rx: 2.9, ry: 2.5 }, ring: { rx: 8.0, ry: 7.0 } } as const;
/** His stand and his lurk: loops of `period` seconds, `frames` of them at `fps` (EYE_STAND, EYE_LURK). */
export const EYE_STAND = { period: 3.0, frames: 45, fps: 15 } as const;
/** The cult's obelisks round his ring: degrees round from his forward, each this many tiles beyond the ring's edge on its line (EYE_OBELISKS). */
export const EYE_OBELISKS = { at: [180, 62, -62] as const, out: 0.6 };

/** His sweep (EYE_SWEEP): an arm whipped round `arc` degrees through its aim, low over the stones, out to `reach` tiles from his middle; it hurts from `hurt` to `over` (low enough to strike the knight once it has flattened, and as it overshoots). */
export const EYE_SWEEP = { long: 2.4, cock: 0.6, sweep: [1.0, 1.42] as const, over: 1.68, arc: 170, reach: 6.2, hurt: 1.04 } as const;
/** His splash (EYE_SPLASH): he crashes down at `crash`; the wave rolls from the pool's rim (0) to the ring's edge (1) from `wave[0]` to `wave[1]`. */
export const EYE_SPLASH = { long: 3.6, hang: [1.0, 1.4] as const, crash: 1.62, wave: [1.62, 2.85] as const } as const;
/** His eyespawn (EYE_SPEW): the eggs leave his maw at `eggs` and land `fly` later, each `at` (degrees off the aim, how far across the ring: 0 its inner edge, 1 its outer). */
export const EYE_SPEW = { long: 3.0, retch: 0.85, eggs: [0.98, 1.16, 1.34] as const, fly: 0.6, at: [[-14, 0.3], [10, 0.55], [-4, 0.82]] as const } as const;
/** An egg, landed (EYE_SPAWN): it hatches at `hatch`; gone by `long`. */
export const EYE_EGG = { long: 3.0, hatch: 2.5 } as const;
/** An arm bursting up through the floor (EYE_BURST): the cracks glow (the warning) till `burst`; drawn back down by `long`. */
export const EYE_BURST = { long: 2.0, burst: 0.8 } as const;
/** His call (EYE_CALL), and the siege's bolts (EYE_BOLT): each strikes `strike` after its runes open, within `reach`. */
export const EYE_CALL = { long: 2.4, raise: 0.6 } as const;
export const EYE_BOLT = { long: 1.9, strike: 1.0, reach: 0.9 } as const;
/** His surfacing (EYE_SURFACE) and the siege pulled in (EYE_EMPOWER): when he breaks the water, roars, and the siege's fire bursts off him. */
export const EYE_SURFACE = { long: 4.2, boil: 1.3, roar: 2.15 } as const;
export const EYE_EMPOWER = { long: 4.0, reach: 0.6, burst: 2.95 } as const;

/**
 * HIS PICTURES' MOVES AS THE GAME HOLDS THEM (art/act1_figs/eye.ts paints them, render/act1_fx/eye.ts shows them): which of
 * the art's, how long, at how many frames a second, the aims each is painted for (one: it is not aimed, or not here),
 * and whether in phase 3's colours (the siege's lines bent into him, his veins blazing). His stands and his attacks at
 * his stand's own 15 a second; his phases' changes and his death, slow and great, at 10 (EYE_COST, art/act1_figs/eye.ts,
 * says why). The sweep's aims are spaced so that wherever the hero stands he is well within its 170 degrees of one of
 * them; the spew is painted one way only, toward the camera (its eggs land on the near side of the ring, and hatch
 * there, and come for him wherever he is).
 */
export const EYE_MOVES = {
  stand: { which: 'stand', long: 3.0, fps: 15, aims: [0], p3: 0 },
  lurk: { which: 'lurk', long: 3.0, fps: 15, aims: [0], p3: 0 },
  stand3: { which: 'stand', long: 3.0, fps: 15, aims: [0], p3: 1 },
  sweepUnder: { which: 'sweepUnder', long: 2.4, fps: 15, aims: [0, 120, -120], p3: 0 },
  surface: { which: 'surface', long: 4.2, fps: 10, aims: [0], p3: 0 },
  spew: { which: 'spew', long: 3.0, fps: 15, aims: [0], p3: 0 },
  splash: { which: 'splash', long: 3.6, fps: 15, aims: [0], p3: 0 },
  empower: { which: 'empower', long: 4.0, fps: 10, aims: [0], p3: 0 },
  call: { which: 'call', long: 2.4, fps: 15, aims: [0], p3: 1 },
  death: { which: 'death', long: 5.4, fps: 10, aims: [0], p3: 1 },
} as const satisfies Record<string, { which: string; long: number; fps: number; aims: readonly number[]; p3: 0 | 1 }>;
export type EyeMove = keyof typeof EYE_MOVES;
/** The name of one of his clips: the move's, and its aim where it is painted for more than one. */
export function eyeClip(move: EyeMove, aim = 0): string {
  return EYE_MOVES[move].aims.length > 1 ? `${move}@${aim}` : move;
}
/** Of the aims a move is painted for, the nearest to `aim`. */
export function nearestAim(move: EyeMove, aim: number): number {
  let best: number = EYE_MOVES[move].aims[0];
  for (const a of EYE_MOVES[move].aims) if (Math.abs(near180(aim, a) - a) < Math.abs(near180(aim, best) - best)) best = a;
  return best;
}

// ---------------------------------------------------------------------------------------------
// WHERE THINGS ARE, AS HIS PICTURES HAVE THEM

/** The way from his middle to a point (world offsets), as his pictures aim: degrees round from his forward (world (1, 1), down the screen) toward his left (world (1, -1), screen right). */
export function aimOf(dx: number, dy: number): number {
  return Math.atan2((dx - dy) * Math.SQRT1_2, (dx + dy) * Math.SQRT1_2) / D;
}
/** A point `r` tiles from his middle on the line `aim` (world offsets). */
export function onAim(aim: number, r: number): { x: number; y: number } {
  const f = Math.cos(aim * D) * r;
  const l = Math.sin(aim * D) * r;
  return { x: (f + l) * Math.SQRT1_2, y: (f - l) * Math.SQRT1_2 };
}
const edgeOn = (e: { rx: number; ry: number }, aim: number): number => {
  const p = onAim(aim, 1);
  return 1 / Math.hypot(p.x / e.rx, p.y / e.ry);
};
/** How far out from his middle his pool's rim is on the line `aim`, and the ring's outer edge (tiles). */
export const rimOn = (aim: number): number => edgeOn(EYE_ARENA.pool, aim);
export const ringOn = (aim: number): number => edgeOn(EYE_ARENA.ring, aim);

/** Where his sweep's arm lies at `t` (degrees round from his forward), aimed `aim`: drawn round the far side and whipped back past it (the art's sweepPose). */
export function sweepAngle(t: number, aim: number): number {
  const S = EYE_SWEEP;
  const a0 = aim + S.arc / 2;
  const a1 = aim - S.arc / 2;
  if (t < S.cock) return a0 + 14 * sm(t / S.cock);
  if (t < S.sweep[0]) return a0 + 14 + 12 * sm((t - S.cock) / (S.sweep[0] - S.cock));
  if (t < S.sweep[1]) {
    const k = (t - S.sweep[0]) / (S.sweep[1] - S.sweep[0]);
    const e = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k);
    return a0 + 26 + (a1 - 12 - (a0 + 26)) * e;
  }
  if (t < S.over) return a1 - 12 - 14 * sm((t - S.sweep[1]) / (S.over - S.sweep[1]));
  return a1 - 26;
}
/** How far across the ring his splash's wave has rolled at `t` (0 at the pool's rim, 1 at the ring's edge), or null (the art's waveAt). */
export function waveAt(t: number): number | null {
  const S = EYE_SPLASH;
  if (t < S.wave[0] || t > S.wave[1]) return null;
  return 1 - Math.pow(1 - (t - S.wave[0]) / (S.wave[1] - S.wave[0]), 1.6);
}
/** Where egg `i` of a spew aimed `aim` lands (world offsets from his middle; the art's spawnLanding). */
export function eggLanding(aim: number, i: number): { x: number; y: number } {
  const [off, far] = EYE_SPEW.at[i % EYE_SPEW.at.length];
  const a = aim + off;
  const rim = rimOn(a) + 8 / EYE_TILE;
  return onAim(a, rim + (ringOn(a) - 8 / EYE_TILE - rim) * far);
}
/** Where obelisk `i` of the cult's stands (world offsets from his middle: the foot under obeliskTop). */
export function obeliskAt(i: number): { x: number; y: number } {
  const a = EYE_OBELISKS.at[i % EYE_OBELISKS.at.length];
  return onAim(a, ringOn(a) + EYE_OBELISKS.out);
}

// ---------------------------------------------------------------------------------------------
// THE FIGHT: the rules' numbers

/** His phases: below these shares of his life he surfaces, then pulls the siege in. */
export const PHASES = { at: [0.7, 0.35] as const };
/** His bursts: how many at once in each phase, the first under the hero, the rest `near` to `far` tiles round him, `apart` seconds after each other; each harms within `reach` of its middle. */
export const BURSTS = { n: [4, 4, 5] as const, near: 1.3, far: 2.6, apart: 0.12, reach: 0.95 };
/** His call: `n` of the siege's bolts, the first `from` seconds in and `apart` after each other; the first on the hero, `nearHim` more round him (1.6 to 3 tiles), the rest anywhere on the ring. */
export const CALL = { n: 6, from: 0.35, apart: 0.15, nearHim: 2 };
/** His eyespawn: no more than `most` of them alive (and in their eggs) at once. */
export const SPAWN = { most: 3 };
/** He sees what is in sight of this far out from his middle, toward it (tiles: past his pool's rim and the cut stones round it). */
export const SIGHT_FROM = 3.6;
/** In phase 3 he is quicker to move again, by this much (his waits between moves, and his moves' cooldowns). */
export const BLAZING = { hurry: 0.75 };

/**
 * HIS ACTS: his basic blow first and his biggest last; `forced` ones are his phases' changes. `clip`: the picture each
 * is (EYE_MOVES' name; 'burst' is his arm's own picture, his figure standing meanwhile).
 */
export const EYE_ACTS: readonly ActDef[] = [
  // (his basic blow: an arm bursting up where you stand, the cracks glowing first)
  { id: 'eye:burst', clip: 'burst', long: 1.0, hit: EYE_BURST.burst, dmg: 0.75, cooldown: 0, first: 0, after: 1.0, near: 0, far: 12 },
  // (several at once round you, the first under you)
  { id: 'eye:bursts', clip: 'burst', long: 1.4, hit: EYE_BURST.burst, dmg: 0.85, cooldown: 7, first: 3, after: 0.7, near: 0, far: 12 },
  // (phase 1: an arm out of the pool, cocked back, whipped round 170 degrees low over the ring: step out of its reach, or leap or roll over it)
  { id: 'eye:sweep', clip: 'sweepUnder', long: EYE_SWEEP.long, hit: EYE_SWEEP.sweep[0], dmg: 1.2, cooldown: 8, first: 4, after: 0.5, near: 0, far: EYE_SWEEP.reach + 0.6 },
  // (phase 2: eggs spewed out over the ring, each hatching an eyespawn)
  { id: 'eye:spew', clip: 'spew', long: EYE_SPEW.long, hit: EYE_SPEW.eggs[0], dmg: 0, cooldown: 15, first: 3, after: 0.5, near: 0, far: 13 },
  // (phase 2: he heaves his bulk up and crashes down, a wave rolling out over the whole ring: leap or roll through it)
  { id: 'eye:splash', clip: 'splash', long: EYE_SPLASH.long, hit: EYE_SPLASH.crash, dmg: 1.3, cooldown: 11, first: 7, after: 0.5, near: 0, far: 9.5 },
  // (phase 3: he calls the siege down: its bolts rain on the ring, one where you stand)
  { id: 'eye:call', clip: 'call', long: EYE_CALL.long, hit: CALL.from + EYE_BOLT.strike, dmg: 1.0, cooldown: 8, first: 2, after: 0.5, near: 0, far: 14 },
  // (his phases' changes)
  { id: 'eye:surface', clip: 'surface', long: EYE_SURFACE.long, hit: EYE_SURFACE.boil, dmg: 0.5, cooldown: 0, first: 0, after: 0.8, near: 0, far: 0, forced: true },
  { id: 'eye:empower', clip: 'empower', long: EYE_EMPOWER.long, hit: EYE_EMPOWER.burst, dmg: 0.6, cooldown: 0, first: 0, after: 0.8, near: 0, far: 0, forced: true },
];
/** In which of his phases (0 under the water, 1 risen, 2 blazing) each of his acts is his. */
export const PHASE_OF: Record<string, readonly number[]> = {
  'eye:burst': [0, 1, 2],
  'eye:bursts': [0, 1, 2],
  'eye:sweep': [0],
  'eye:spew': [1],
  'eye:splash': [1],
  'eye:call': [2],
};

/** What his rules keep on him (Monster.a1): his phase; his stand's clock (`base`: his stand is at m.animT - base); the clock his act began at (`c0`), how far a burst's act has run (`el`); the wave's last reckoning (`ws`); where he stands (`hx`, `hy`). */
interface EyeState {
  ph: number;
  base: number;
  c0: number;
  el: number;
  pc: number;
  ws: number;
  hx: number;
  hy: number;
}
function st(m: Monster): EyeState {
  if (!m.a1 || m.a1.hx === undefined) m.a1 = { ph: 0, base: 0, c0: 0, el: 0, pc: 0, ws: 0, hx: m.x, hy: m.y };
  return m.a1 as unknown as EyeState;
}
/** His phase: 0 under the water, 1 risen, 2 blazing. */
export function eyePhase(m: Monster): number {
  return m.a1?.ph ?? 0;
}
/** Where his stand (or his lurk) is in its round now (seconds), standing or under an act of his arms' alone. */
export function eyeClock(m: Monster): number {
  const s = m.a1;
  if (!s) return 0;
  const T = EYE_STAND.period;
  const c = m.state === 'act' && m.act ? (s.c0 ?? 0) + m.animT : m.animT - (s.base ?? 0);
  return ((c % T) + T) % T;
}
/** Is this act his figure's own (a move of his painted from his stand's start), or only of his arms bursting up? */
export function figureAct(a: ActDef): boolean {
  return a.clip !== 'burst';
}
/** The move of his pictures an act of his figure's is shown by (null: one of his arms' alone). */
export function moveOf(a: ActDef): EyeMove | null {
  return a.clip in EYE_MOVES ? (a.clip as EyeMove) : null;
}

/** How many of his eyespawn are alive, or still in their eggs. */
function brood(R: BossRules, m: Monster): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o.kind === 'spawn' && o.packId === m.packId) n++;
  for (const p of R.g.perils) if (p.a1 === 'eye:egg' && !p.done && p.a === m.packId) n++;
  return n + (m.act && m.act.id === 'eye:spew' ? EYE_SPEW.eggs.length : 0);
}

/** A spot on his ring that can be stood on, `r` tiles round from (x, y) or anywhere on it: for a burst, a bolt, an egg. */
function spotOn(R: BossRules, m: Monster, near: { x: number; y: number } | null, lo: number, hi: number): { x: number; y: number } | null {
  const g = R.g;
  for (let k = 0; k < 24; k++) {
    let x: number;
    let y: number;
    if (near) {
      const a = g.rng.range(0, Math.PI * 2);
      const d = g.rng.range(lo, hi);
      x = near.x + Math.cos(a) * d;
      y = near.y + Math.sin(a) * d;
    } else {
      const a = g.rng.range(-180, 180);
      const p = onAim(a, g.rng.range(rimOn(a) + 0.6, ringOn(a) - 0.5));
      x = m.x + p.x;
      y = m.y + p.y;
    }
    // (on the paving or the mud, not in his pool)
    if (!g.free(g.level.walk, x, y, 0.3)) continue;
    const p = { x: x - m.x, y: y - m.y };
    if (Math.hypot(p.x / EYE_ARENA.pool.rx, p.y / EYE_ARENA.pool.ry) < 1.08) continue;
    return { x, y };
  }
  return null;
}

/** An arm bursting up at (x, y), its cracks glowing from now (`k`: which of the act's, for its picture's turn). */
function burstAt(R: BossRules, m: Monster, a: ActDef, x: number, y: number, k: number): void {
  R.peril(m, 'act1', x, y, { a1: 'eye:burst', hit: EYE_BURST.burst, dur: EYE_BURST.long, dmg: R.g.rollMonsterDmg(m) * a.dmg, c: (m.act ? m.act.n * 7 + k : k) % 4 });
}

// ---------------------------------------------------------------------------------------------
// HIS RULES

export const RULES: Act1Rules = {
  // (he does not walk: speed 0 in his MONSTERS entry, and a gait that never sets off: his rules' tick does all he does
  // standing, and gives a step of his to BossRules only while he makes an act)
  gait: { pace: 1, cycle: EYE_STAND.period, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 99, slack: 0, trueBack: false },
  acts: EYE_ACTS,

  bossAt(L: Level) {
    const P = L.land?.pool;
    if (!P) return null;
    // THE CULT'S THREE OBELISKS round his ring, where his pictures bend their lines into him (floor 10's own piece;
    // render/act1_pieces.ts draws it by its name): solid, as a thing that stands is
    const W = L.floor.w;
    EYE_OBELISKS.at.forEach((_a, i) => {
      const o = obeliskAt(i);
      const x = P.x + o.x;
      const y = P.y + o.y;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx < 0 || ty < 0 || tx >= W || ty >= L.floor.h) return;
      if (L.props.some((q) => q.kind === 'piece' && q.name === "the cult's obelisk" && q.tx === tx && q.ty === ty)) return;
      L.props.push({ kind: 'piece', name: "the cult's obelisk", tx, ty, x, y, solid: true, state: 0, variant: 0 });
      L.walk[ty * W + tx] = 0;
    });
    // (he waits in the middle of his pool, facing the camera)
    return { x: P.x, y: P.y, fx: Math.SQRT1_2, fy: Math.SQRT1_2 };
  },

  // (always: his eye is in his pool, and whatever reaches it from the ring strikes him)
  reachable: () => true,

  spawned(R, m) {
    st(m);
    m.fx = Math.SQRT1_2;
    m.fy = Math.SQRT1_2;
    m.phase = 0;
  },

  forced(R, m, acts) {
    const s = st(m);
    const frac = m.life / m.maxLife;
    if (s.ph === 0 && frac < PHASES.at[0]) return acts.findIndex((a) => a.id === 'eye:surface');
    if (s.ph === 1 && frac < PHASES.at[1]) return acts.findIndex((a) => a.id === 'eye:empower');
    return -1;
  },

  can(R, m, a) {
    const ph = st(m).ph;
    if (!(PHASE_OF[a.id] ?? []).includes(ph)) return false;
    if (a.id === 'eye:spew' && brood(R, m) + EYE_SPEW.eggs.length > SPAWN.most + 1) return false;
    return true;
  },

  tick(R, m, dt, dist) {
    const g = R.g;
    const s = st(m);
    // (held in the middle of his pool, facing the camera: nothing moves him)
    m.x = s.hx;
    m.y = s.hy;
    if (m.state === 'act' && m.act) {
      // (an act: BossRules runs its clock; his arms' acts keep how far his stand has run under them)
      s.el = m.animT;
      return false;
    }
    m.fx = Math.SQRT1_2;
    m.fy = Math.SQRT1_2;
    m.anim = 'idle';
    m.state = 'chase';
    const acts = EYE_ACTS;
    if (!m.moveCd || m.moveCd.length !== acts.length) m.moveCd = acts.map((a) => a.first * g.rng.range(0.7, 1.2));
    const hurry = s.ph >= 2 ? 1 / BLAZING.hurry : 1;
    for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt * hurry;
    if (hurry !== 1) m.cd -= dt * (hurry - 1);
    // (his round: has his stand come round to its start since the last step?)
    const c = eyeClock(m);
    const round = c < s.pc;
    s.pc = c;
    // what he does now: a phase's change; or the biggest of his moves that is ready and the hero is in reach of
    let want = RULES.forced!(R, m, acts);
    if (want < 0 && m.cd <= 0) {
      const h = g.hero;
      // (he sees whoever is in sight of the ring's inner stones: from his middle the rim's stones, cut corner to corner,
      // stand in the way of a line, as they stop a shot up to SIGHT_FROM tiles out)
      const toward = aimOf(h.x - m.x, h.y - m.y);
      const from = onAim(toward, Math.min(dist, SIGHT_FROM));
      const los = dist < 16 && (dist <= SIGHT_FROM || g.sees(m.x + from.x, m.y + from.y, h.x, h.y));
      for (let i = acts.length - 1; i >= 0 && want < 0; i--) {
        const a = acts[i];
        if (a.forced || m.moveCd[i] > 0 || dist < a.near || dist > a.far || !los) continue;
        if (!RULES.can!(R, m, a, dist, los)) continue;
        want = i;
      }
    }
    if (want < 0) return true;
    const a = acts[want];
    // (a move of his figure waits for his round; his arms' bursts do not)
    if (figureAct(a) && !round) return true;
    s.c0 = figureAct(a) ? 0 : c;
    R.startAct(m, acts, want);
    return true;
  },

  start(R, m, a) {
    const g = R.g;
    const h = g.hero;
    const s = st(m);
    const act = m.act!;
    // (turned to the hero by BossRules; his pictures face the camera always, and aim instead)
    m.fx = Math.SQRT1_2;
    m.fy = Math.SQRT1_2;
    m.x = s.hx;
    m.y = s.hy;
    const aim = aimOf(h.x - m.x, h.y - m.y);
    const mv = moveOf(a);
    act.a = mv ? nearestAim(mv, aim) : aim;
    act.b = 0;
    s.ws = 0;
    if (a.id === 'eye:sweep') {
      // (the reach of his sweep, laid on the ring's stones while his arm is cocked: the warning, drawn by render/act1_fx/eye.ts;
      // where it lies is a point of the ring before the hero, his middle and the sweep's aim kept with it)
      const p = onAim(aimOf(h.x - m.x, h.y - m.y), Math.min(EYE_SWEEP.reach, Math.max(rimOn(act.a) + 0.8, Math.hypot(h.x - m.x, h.y - m.y))));
      R.peril(m, 'act1', m.x + p.x, m.y + p.y, { a1: 'eye:reach', hit: 1e9, dur: EYE_SWEEP.sweep[0] + 0.05, a: act.a, b: m.x, c: m.y });
    } else if (a.id === 'eye:burst') burstAt(R, m, a, h.x, h.y, 0);
    else if (a.id === 'eye:bursts') burstAt(R, m, a, h.x, h.y, 0);
    else if (a.id === 'eye:surface') {
      g.sfx('bossRoar', 0.6);
      g.msg(`${m.name} rises from the pool`, MSG.foe);
    } else if (a.id === 'eye:empower') {
      g.sfx('bossRoar', 0.9);
      g.msg(`${m.name} draws the siege into himself`, MSG.foe);
    } else if (a.id === 'eye:call') g.sfx('bossRoar', 0.5);
    else if (a.id === 'eye:splash') g.sfx('bossRoar', 0.4);
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const s = st(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy);
    switch (a.id) {
      case 'eye:burst':
        break;
      case 'eye:bursts': {
        // (the rest round him, one after another)
        const n = BURSTS.n[Math.min(2, s.ph)];
        for (let k = 1; k < n; k++) {
          if (!at(BURSTS.apart * k)) continue;
          const p = spotOn(R, m, { x: act.x, y: act.y }, BURSTS.near, BURSTS.far) ?? spotOn(R, m, null, 0, 0);
          if (p) burstAt(R, m, a, p.x, p.y, k);
        }
        break;
      }
      case 'eye:sweep': {
        if (at(EYE_SWEEP.sweep[0])) g.sfx('swing', 1);
        if (act.b || t1 <= EYE_SWEEP.hurt || t0 >= EYE_SWEEP.over) break;
        if (dist > EYE_SWEEP.reach + TUNE.heroRadius) break;
        // (the arm passes where he stands: it sweeps from the far side round to the near)
        const b0 = sweepAngle(Math.max(EYE_SWEEP.hurt, t0), act.a);
        const b1 = sweepAngle(Math.min(EYE_SWEEP.over, t1), act.a);
        const hb = near180(aimOf(dx, dy), (b0 + b1) / 2);
        const pad = (TUNE.heroRadius / Math.max(1, dist)) / D;
        if (hb <= b0 + pad && hb >= b1 - pad) {
          act.b = 1;
          if (!h.move && h.invuln <= 0) {
            R.blow(m, a.dmg);
            g.knockHero(m.x, m.y, 1);
          }
          g.emit({ t: 'shake', amount: 4 });
          g.sfx('slam', 0.8);
        }
        break;
      }
      case 'eye:spew': {
        if (at(0.05)) g.sfx('fire', 0.5);
        // (each egg lands where his picture throws it, and lies there till it hatches)
        EYE_SPEW.eggs.forEach((te, i) => {
          if (!at(te + EYE_SPEW.fly)) return;
          const o = eggLanding(act.a, i);
          let x = m.x + o.x;
          let y = m.y + o.y;
          if (!g.free(g.level.walk, x, y, 0.4)) {
            const alt = spotOn(R, m, { x, y }, 0.4, 1.4);
            if (!alt) return;
            x = alt.x;
            y = alt.y;
          }
          R.peril(m, 'act1', x, y, { a1: 'eye:egg', hit: EYE_EGG.hatch, dur: EYE_EGG.long, a: m.packId, c: (act.n * 3 + i) % 3 });
          g.sfx('slam', 0.3);
        });
        break;
      }
      case 'eye:splash': {
        const S = EYE_SPLASH;
        if (at(S.hang[0])) g.sfx('wave', 0.6);
        if (at(S.crash)) {
          g.emit({ t: 'shake', amount: 8 });
          g.sfx('slam', 1);
          g.sfx('wave', 1);
        }
        const w = waveAt(t1);
        if (w === null || act.b) break;
        // (the wave's front passes over where he stands: knee-high, foaming; leap or roll through it)
        const b = aimOf(dx, dy);
        const rim = rimOn(b);
        const u = (dist - rim) / Math.max(0.1, ringOn(b) - rim);
        const was = s.ws;
        const now = u - w;
        s.ws = now;
        if (u > 1.03 || u < -0.2) break;
        if ((was > 0 || t0 < S.wave[0]) && now <= 0) {
          act.b = 1;
          if (!h.move && h.invuln <= 0) {
            R.blow(m, a.dmg);
            g.knockHero(m.x, m.y, 1.2);
          }
        }
        break;
      }
      case 'eye:call': {
        if (at(EYE_CALL.raise)) g.sfx('thunder', 0.5);
        for (let k = 0; k < CALL.n; k++) {
          if (!at(CALL.from + CALL.apart * k)) continue;
          const p = k === 0 ? { x: h.x, y: h.y } : k <= CALL.nearHim ? spotOn(R, m, { x: h.x, y: h.y }, 1.6, 3.0) : spotOn(R, m, null, 0, 0);
          if (!p) continue;
          R.peril(m, 'act1', p.x, p.y, { a1: 'eye:bolt', hit: EYE_BOLT.strike, dur: EYE_BOLT.long, dmg: g.rollMonsterDmg(m) * a.dmg, el: 'lightning', c: (act.n + k) % 3 });
        }
        break;
      }
      case 'eye:surface': {
        // (he breaks the water: whoever stands at its rim is thrown back)
        if (at(EYE_SURFACE.boil)) {
          g.emit({ t: 'shake', amount: 7 });
          g.sfx('slam', 1);
          g.sfx('wave', 0.8);
          if (dist <= rimOn(aimOf(dx, dy)) + 1.2) {
            R.blow(m, a.dmg);
            g.knockHero(m.x, m.y, 1.2);
          }
        }
        if (at(EYE_SURFACE.roar)) {
          g.sfx('bossRoar', 1);
          g.emit({ t: 'shake', amount: 5 });
        }
        break;
      }
      case 'eye:empower': {
        if (at(EYE_EMPOWER.reach)) g.sfx('power', 0.8);
        // (the siege's fire bursts off him: whoever is near his pool is burned and thrown back)
        if (at(EYE_EMPOWER.burst)) {
          g.emit({ t: 'shake', amount: 7 });
          g.sfx('explode', 1);
          if (dist <= rimOn(aimOf(dx, dy)) + 1.6) {
            g.hurtHero(g.rollMonsterDmg(m) * a.dmg, 'fire', m.words, m);
            g.knockHero(m.x, m.y, 1.2);
          }
        }
        break;
      }
    }
  },

  end(R, m, a) {
    const s = st(m);
    // (his stand runs on from where the act leaves it: a move of his figure hands back to it `long` past its start)
    s.base = -(s.c0 + (figureAct(a) ? a.long : s.el));
    s.pc = eyeClock(m);
    m.fx = Math.SQRT1_2;
    m.fy = Math.SQRT1_2;
    if (a.id === 'eye:surface') s.ph = 1;
    else if (a.id === 'eye:empower') s.ph = 2;
    m.phase = s.ph;
    if (s.ph >= 2) m.cd *= BLAZING.hurry;
  },

  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    void dt;
    if (p.a1 === 'eye:burst' || p.a1 === 'eye:bolt') {
      if (p.done || p.t < p.hit) return;
      p.done = 1;
      const bolt = p.a1 === 'eye:bolt';
      if (Math.hypot(h.x - p.x, h.y - p.y) <= (bolt ? EYE_BOLT.reach : BURSTS.reach) + TUNE.heroRadius * 0.5) {
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
        if (!bolt) g.knockHero(p.x, p.y, 0.7);
      }
      g.emit({ t: 'shake', amount: bolt ? 3 : 2 });
      g.sfx(bolt ? 'thunder' : 'slam', bolt ? 0.7 : 0.5);
    } else if (p.a1 === 'eye:egg') {
      if (p.done || p.t < p.hit) return;
      p.done = 1;
      // IT HATCHES: an eyespawn out of it (the Eyespawn's own rules begin its hatching: Monster.a1.hatch)
      const mom = g.monsters.find((o) => o.kind === 'eye' && o.packId === p.a && !o.dead);
      if (!mom) return;
      let alive = 0;
      for (const o of g.monsters) if (!o.dead && o.kind === 'spawn' && o.packId === p.a) alive++;
      if (alive >= SPAWN.most) return;
      const add = g.spawn('spawn', p.x, p.y, p.a, 0, false, g.rng);
      // (his: worth nothing of its own, as the dead the Fleshmancer raises are)
      add.xp = 0;
      const dx = h.x - add.x;
      const dy = h.y - add.y;
      const d = Math.hypot(dx, dy) || 1;
      add.fx = dx / d;
      add.fy = dy / d;
      // (it hatches: its own rules begin its hatching for one that comes with Monster.a1.hatch; given it only now that
      // it is made, they are told of it again, unless they began an act of its own as it came)
      const began: boolean = add.state === 'act';
      add.a1 = { ...(add.a1 ?? {}), hatch: 1 };
      if (!began && SPAWN_RULES && SPAWN_RULES.spawned) SPAWN_RULES.spawned(R, add);
      if ((add.state as string) !== 'act') add.state = 'chase';
      g.sfx('hit', 0.5);
    }
  },

  died(R, m) {
    const g = R.g;
    // (his eyespawn and what of his is on the floor go with him: the siege is broken)
    for (const o of [...g.monsters]) if (!o.dead && o.kind === 'spawn' && o.packId === m.packId) g.kill(o);
    for (const p of g.perils) if (p.kind === 'act1' && p.a1 && p.a1.startsWith('eye:') && !p.done) p.dur = Math.min(p.dur, p.t);
  },
};

/** (for the tests) The world point of his pool's middle on a level, and of each obelisk. */
export function arenaOf(L: Level): { pool: { x: number; y: number }; obelisks: { x: number; y: number }[] } | null {
  const P = L.land?.pool;
  if (!P) return null;
  return { pool: { x: P.x, y: P.y }, obelisks: EYE_OBELISKS.at.map((_a, i) => {
    const o = obeliskAt(i);
    return { x: P.x + o.x, y: P.y + o.y };
  }) };
}
