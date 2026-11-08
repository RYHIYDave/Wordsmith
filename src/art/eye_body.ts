// THE SWAMP COLOSSUS'S MOVES, PART 4: HIS BODY'S OWN ATTACKS, THE BILE ARC AND THE GAZE (painted by art/eye_colossus.ts, a layer each;
// a mock-up behind EYE2, off; nothing of the game imports it: tests/eye_body.test.ts). The owner, 8 Nov 2026 (by 10:53), asked “Next is
// his body's own attacks in phase 2, between the tentacles. The main chat suggested two. Draw these?” (offered as: he retches a huge
// glob of bile that arcs onto the stone and splashes into a burning pool; and his eye glares a beam of its pink-gold fire along a line):
// “Bile arc and gaze (Recommended)”; told how they would be drawn, 10:54: “That’s good”. His rules: Movement 9 (a big held wind-up, a
// fast smeared strike, a big wind-down), “Action, like a movie”, nothing through anything, nowhere safe (“Yes, nowhere safe
// (Recommended)”), “Everything drawn should not just look like shapes.  That’s the rule”, nothing ruled. The main chat's frame for them
// (board, 7 Nov 00:48): in phase 2 his body cannot be hurt and attacks every 5 s or so; in phase 3 it can be hurt.
//
// Both at his place (his stand, his middle 7.9 tiles out from the stone's back edge), each from his stand and back into it, his clock
// running on through it (so that he goes back into his stand at the frame he would have been at):
//   THE BILE ARC (`BILE`): THE WIND-UP, HELD (0.9 s): he rears back and up, his gullet heaving three times, his jaws flexing wider with
//     each heave, his throat's glow swelling with them, bile welling up in his maw and spilling over (the game's), his tongue-eye reared
//     up out of the way; the game's warning on the stone where it will land, on the Warrior's spot. THE STRIKE (two frames, smeared): he
//     lunges forward and retches, his jaws flung wide, his eye squeezed: a huge glob of bile hurled out of his throat (the game's) arcs
//     high over onto the stone. Held a beat, gaping, retching; THE WIND-DOWN: he settles back into his stand, drooling bile. The glob
//     crashes down and bursts, gobs and spatter flung; a BURNING POOL lies, bubbling, smoking, eating the stone, shrinking and fading.
//   THE GAZE (`GAZE`), as the main chat's rule has it (its board, 8 Nov 11:42; branch colossus 2cb0b495, colossus_fight.ts GAZE: a beam
//     from his eye laid 32 degrees to one side of the hero, warned 0.9 s with the arc it will sweep, swept to the other side in 1.2 s, 0.9
//     tiles wide; one painted gaze for phases 2 and 3): THE WIND-UP, HELD (0.9 s): his tongue-eye rears up out of his maw and forward,
//     fixing on the Warrior, its lids narrowing to aim, then peeling back, the eye swelling, its iris flaring from pink to white-gold (the
//     game's glow); on the stone the arc it will sweep, darkened, its sides the enemy's pink, its first side flaring gold as it fires.
//     THE STRIKE (two frames, smeared): his eye whips round to the arc's first side and the beam blasts on, the eye jolted back. THE
//     SWEEP (1.2 s): the beam swept across the arc, the eye shuddering with it, the stone burning along its line and glowing behind it,
//     sparks and chips flung up; held at the other side, guttering out. THE WIND-DOWN: the eye sinks back into his stand, blinking and
//     smoking; the stone it swept left scorched, smouldering.
//   The Warrior in each, twice: once just clear, once caught (by the splash; by the beam) and knocked flying.
// What the game draws for them (`BodyFx`; the pictures' tool draws it): the warnings, the bile in his maw and off him, the glob in
// flight, its splash and the pool, the gaze's arc and the dark in it, the beam and the fire along its line, the scorch, the eye's flare
// and smoke, the shakes. Their shapes are here (`globBlobs`, `poolEdge`, `warnEdge`, `arcEdge`, `beamEdge`, `fireEdge`, `scorchEdge`),
// so that the checks can hold that nothing of them is ruled.

import { STONE, TONGUE_RISEN, EYE_RISEN, weaveTongue } from './eye_colossus';
import type { ColossusAnim, ColossusPose } from './eye_colossus';
import { QUAY, STONE_BOX, UNIT } from './eye_arms';
import { EYE_FPS, eyeFrame, gazeAt, standAnim, standTongue } from './eye_moves';
import type { BodyFx, EyeFrame, EyeLayer, HeroAt } from './eye_moves';

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (a: number, b: number, v: number): number => {
  const u = clamp01((v - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const pad = (n: number): string => String(n).padStart(3, '0');
const norm = (v: readonly number[]): [number, number, number] => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const h1 = (n: number, s: number): number => {
  let h = (Math.imul(n | 0, 374761393) + Math.imul(s | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
/** Smooth noise along `x`, 0 to 1. */
const vn1 = (x: number, s: number): number => {
  const i = Math.floor(x);
  const u = x - i;
  const e = u * u * (3 - 2 * u);
  return h1(i, s) + (h1(i + 1, s) - h1(i, s)) * e;
};
/** A tile of the game (his lengths). */
export const TILE = UNIT * Math.SQRT2;

// =============================================================================================
// THE TAKES

/** A film of an attack: `b1` the bile arc, the Warrior just clear; `b2` caught by the splash; `g1` the gaze, the Warrior just clear;
 *  `g2` caught by the beam. */
export type BodyShot = 'b1' | 'b2' | 'g1' | 'g2';
/** Each take: his stand, then the attack from frame `lead`, then his stand again; `frames` in all. */
export const BODY_TAKE = { lead: 24, frames: 180 } as const;
export const BODY_SHOTS: readonly BodyShot[] = ['b1', 'b2', 'g1', 'g2'];

// =============================================================================================
// THE BILE ARC

/** Its beats (frames from the attack's first): the wind-up, held (he rears back, his gullet heaving `heaves` times); the strike, two
 *  frames (smeared: he lunges and retches; the glob leaves his throat on its second); held gaping, retching; the wind-down, back into his
 *  stand. The glob in flight `flight` frames, as high over the stone as `apex` (his lengths); the splash; the pool (`POOL`). */
export const BILE = { wind: 27, heaves: 3, strike: 2, retch: 6, down: 30, frames: 65, flight: 21, apex: 240 } as const;
/** The frame the glob leaves his throat, and the frame it lands. */
export const BILE_RELEASE = BILE.wind + BILE.strike - 1;
export const BILE_LAND = BILE_RELEASE + BILE.flight;
/** How wide the splash hits (his lengths, round where it lands); the pool: how wide it spreads (in `spread` s), how long it burns at
 *  its widest, then shrinking to nothing (`life` s in all). */
export const SPLASH_R = 2.2 * TILE;
export const POOL = { r: 1.9 * TILE, spread: 0.2, hold: 1.2, life: 3.0 } as const;
/** His pose rearing back (the most of it), and lunging as he retches: how far he leans (his flesh carried that much forward for each of
 *  height, his lengths; less than 0 back), how far back and up his whole self (his lengths), his jaws, his throat's glow (never so
 *  bright that the floor of his throat glows as a band: the bile welling over it is the game's). */
const REAR = { lean: -0.16, back: 18, drop: -10, open: 1.16, glow: 1.4 } as const;
const LUNGE = { lean: 0.22, back: -16, drop: 4, open: 1.38, glow: 1.6 } as const;
/** His tongue reared up out of the way of the glob (as at his entrance), woven a little. */
const REARED: ReadonlyArray<readonly number[]> = [[0, -52, 28], [0, -30, 24], [3, -6, 32], [10, 12, 54], [22, 22, 84], [28, 30, 116], [22, 34, 148], [8, 36, 176], [-8, 36, 198], [-18, 36, 214], [-20, 38, 228], [-16, 40, 238], [-10, 42, 242]].map((q, i) => [...q, TONGUE_RISEN[i][3]]);

/** How much of the attack is on him (0 his stand, 1 all of it): eased in through the wind-up's start, out through the wind-down. */
const bileW = (f: number): number => sm(0, 10, f) * (1 - sm(BILE.wind + BILE.strike + BILE.retch, BILE.frames - 1, f));
/** His gullet heaving through the wind-up (-1 to 1): `heaves` times, growing. */
const heave = (f: number): number => (f < BILE.wind ? Math.sin((TAU * (f - 2)) / (BILE.wind / BILE.heaves)) * sm(2, 10, f) : 0);
/** HIS POSE AT FRAME `f` OF THE BILE ARC (before its blend with his stand): lean, back, drop, open, glow. */
export function bilePose(f: number): { lean: number; back: number; drop: number; open: number; glow: number } {
  const hv = heave(f);
  if (f < BILE.wind) {
    const r = sm(0, 16, f);
    return { lean: REAR.lean * r - 0.035 * hv, back: REAR.back * r + 3 * hv, drop: REAR.drop * r - 2 * hv, open: lerp(1, REAR.open, r) + 0.07 * hv, glow: lerp(1, REAR.glow, sm(0, 24, f)) + 0.1 * hv };
  }
  if (f === BILE.wind) return { lean: 0.05, back: 2, drop: -3, open: 1.3, glow: 1.5 };
  if (f === BILE.wind + 1) return { ...LUNGE };
  // (held, gaping, retching: a shudder in it)
  const g = clamp01((f - BILE.wind - BILE.strike) / (BILE.retch + 4));
  const sh = f < BILE.wind + BILE.strike + BILE.retch ? Math.sin(f * 2.3) * 0.6 : 0;
  return { lean: LUNGE.lean - 0.05 * g, back: LUNGE.back + 4 * g + sh, drop: LUNGE.drop, open: LUNGE.open - 0.1 * g, glow: LUNGE.glow - 0.25 * g + 0.05 * sh };
}
/** His tongue reared out of the way through the bile arc (0 his stand's, 1 reared). */
const bileRear = (f: number): number => sm(0, 14, f) * (1 - sm(BILE.wind + BILE.strike + BILE.retch + 3, BILE.frames - 3, f));
/** His eye squeezed as he retches. */
const bileLids = (f: number): number => 1 - 0.65 * sm(BILE.wind - 2, BILE.wind, f) * (1 - sm(BILE.wind + BILE.strike + 2, BILE.wind + BILE.strike + 10, f));

// =============================================================================================
// THE GAZE: A BEAM SWEPT ACROSS THE STONE (the main chat's rule, its board 8 Nov 11:42; branch colossus 2cb0b495, colossus_fight.ts
// GAZE: “a beam from his eye, laid toward the hero `half` degrees to one side of him (the warning, `warn` seconds: the arc it will
// sweep, the enemy's pink), swept to the other side over `sweep` seconds; `width` tiles wide”: warn 0.9, sweep 1.2, half 32, width 0.9)

/** Its beats (frames from the attack's first): the wind-up, held 0.9 s (his eye fixing on the Warrior, the arc it will sweep warned on
 *  the stone); the strike, two frames (smeared: his eye whipped round to the arc's first side, the beam blasting on); the sweep, `sweep`
 *  frames (1.2 s), the beam swept across the arc to its other side; guttering out there (`gutter`); the wind-down, back into his stand.
 *  How far to each side of the Warrior (`half` degrees); the scorch left smouldering `scorch` s after the beam has passed. */
export const GAZE = { wind: 27, strike: 2, sweep: 36, gutter: 9, down: 30, frames: 102, half: 32, scorch: 3.0 } as const;
export const GAZE_FIRE = GAZE.wind;
/** The frame the beam reaches the arc's other side, and the frame it is out. */
export const GAZE_SWEPT = GAZE.wind + GAZE.sweep;
export const GAZE_OUT = GAZE_SWEPT + GAZE.gutter;
/** The beam: as wide as it hits along its line on the stone (his lengths: 0.9 tiles, the main chat's); the beam itself from his eye, how
 *  thick at the eye and where it comes down (half of it, his lengths). */
export const BEAM = { w: 0.9 * TILE, eye: 10, land: 17 } as const;
/** How far forward and down his tongue's tip rears to aim (his lengths), how far it bends across toward where it looks, and how far the
 *  eye is jolted back as it fires. */
const AIM = { forward: 96, down: 60, across: 0.62, recoil: [8, 14] as const, pitch: (20 * Math.PI) / 180 } as const;
export const gazeQ = (f: number): number => sm(0, 12, f) * (1 - sm(GAZE_OUT + 1, GAZE.frames - 3, f));
/** His eye's lids through the gaze: narrowing to aim, peeling back wide, blinking as it sinks back. */
export function gazeLids(f: number): number {
  if (f < GAZE.wind) return 1 - 0.55 * sm(2, 8, f) * (1 - sm(13, 22, f));
  const b1 = Math.max(0, 1 - Math.abs(f - (GAZE_OUT + 6)) / 3);
  const b2 = Math.max(0, 1 - Math.abs(f - (GAZE_OUT + 16)) / 3);
  return 1 - 0.9 * Math.max(b1, b2);
}
/** How big his eye is: swelling as it fixes, held through the beam, sinking back. */
export const gazeSwell = (f: number): number => 1 + 0.2 * sm(12, 24, f) + 0.05 * sm(GAZE.wind - 1, GAZE.wind + 1, f) - 0.25 * sm(GAZE_OUT - 4, GAZE_OUT + 14, f);
/** His iris flaring (0 his own pink, 1 white-gold): through the wind-up, held while it sweeps, dying as it gutters. */
export const gazeFlare = (f: number): number => sm(6, GAZE.wind - 1, f) * (1 - sm(GAZE_SWEPT, GAZE_OUT + 4, f));

// =============================================================================================
// THE WARRIOR

/** The Warrior's way through each take (his lengths: across, and how deep onto the stone from the water's back edge; the world's), by
 *  frame of the take, and what he does: `knock`, thrown flying from there to the next mark; then down until the next. */
interface Mark { k: number; x: number; y: number; act?: 'knock' | 'down' }
const L = BODY_TAKE.lead;
const B0: [number, number] = [-70, 440];
/** Where the Warrior stands as the gaze begins (both takes). */
const G0: [number, number] = [-30, 362];
/** The Warrior's size (his lengths: the main chat's HERO_R, 0.3 tiles), and how fast he runs (his lengths a frame). */
const HERO_R = 0.3 * TILE;
const RUN = 8;
const BILE_MARKS: Record<'b1' | 'b2', Mark[]> = {
  // (the bile: he stands where the warning lands; clear, running out of it late, just past the splash as it lands)
  b1: [{ k: 0, x: B0[0], y: B0[1] }, { k: L + 34, x: B0[0], y: B0[1] }, { k: L + 48, x: B0[0] + 112, y: B0[1] - 4 }, { k: 180, x: B0[0] + 112, y: B0[1] - 4 }],
  // (caught: running too late, knocked flying out of the splash, down, up)
  b2: [{ k: 0, x: B0[0], y: B0[1] }, { k: L + 41, x: B0[0], y: B0[1] }, { k: L + BILE_LAND, x: B0[0] + 56, y: B0[1] - 2 }, { k: L + BILE_LAND + 1, x: B0[0] + 58, y: B0[1] - 2, act: 'knock' }, { k: L + BILE_LAND + 11, x: B0[0] + 170, y: B0[1] + 26, act: 'down' }, { k: L + BILE_LAND + 35, x: B0[0] + 170, y: B0[1] + 26 }, { k: 180, x: B0[0] + 170, y: B0[1] + 26 }],
};
/** When the Warrior sets off out of the arc in each take of the gaze (frames of the attack): at once, just clear; frozen until the beam is
 *  nearly on him, caught in his first steps (`START`: his first steps, this many frames, this far, his lengths). */
const GAZE_GO = { g1: 6, g2: 38 } as const;
const START = { n: 6, d: 12 } as const;
let GAZE_MARKS: Record<'g1' | 'g2', Mark[]> | null = null;
/** Where a way of marks has him at frame `k` (running evenly between them). */
const along = (M: readonly Mark[], k: number): [number, number] => {
  let i = 0;
  while (i < M.length - 2 && k >= M[i + 1].k) i++;
  const a = M[i];
  const b = M[Math.min(M.length - 1, i + 1)];
  const u = b.k > a.k ? clamp01((k - a.k) / (b.k - a.k)) : 0;
  return [lerp(a.x, b.x, u), lerp(a.y, b.y, u)];
};
/** THE WARRIOR IN THE GAZE: he runs out of the arc away from the side it starts, toward the side it ends, to a spot just past where it
 *  stops (`gazeClear`): in the first take setting off at once and standing there as it sweeps up to him and stops just short; in the
 *  second frozen until the beam is nearly on him, then going too late, caught in his first steps as it sweeps over him and knocked
 *  flying out away from his eye and back to the side it has swept (left behind it), down, up. (Once going he turns about his eye faster than the beam: it never catches a Warrior already
 *  running.) */
function gazeMarks(): Record<'g1' | 'g2', Mark[]> {
  if (GAZE_MARKS) return GAZE_MARKS;
  const C = gazeClear();
  const way = (go: number): Mark[] => {
    const d = Math.hypot(C[0] - G0[0], C[1] - G0[1]);
    const ux = (C[0] - G0[0]) / d;
    const uy = (C[1] - G0[1]) / d;
    const S: [number, number] = [G0[0] + ux * START.d, G0[1] + uy * START.d];
    return [{ k: 0, x: G0[0], y: G0[1] }, { k: L + go, x: G0[0], y: G0[1] }, { k: L + go + START.n, x: S[0], y: S[1] }, { k: L + go + START.n + Math.ceil((d - START.d) / RUN), x: C[0], y: C[1] }, { k: 180, x: C[0], y: C[1] }];
  };
  const g1 = way(GAZE_GO.g1);
  // (caught: the first frame the beam's edge is on him as it sweeps)
  const w2 = way(GAZE_GO.g2);
  let fc = -1;
  for (let f = GAZE_FIRE; f <= GAZE_SWEPT && fc < 0; f++) if (beamOn(along(w2, L + f), f) >= 0) fc = f;
  if (fc < 0) throw new Error('the second take of the gaze: the beam never reaches him');
  const A = gazeArc();
  const out = lerp(A.a0, A.a1, (fc - GAZE_FIRE) / GAZE.sweep);
  const P = along(w2, L + fc);
  const Q = along(w2, L + fc + 1);
  // (thrown outward from his eye and back to the side it has swept: left behind it, never under it again)
  const T: [number, number] = [Q[0] + Math.sin(out) * 110 - Math.cos(out) * 30, Q[1] + Math.cos(out) * 110 + Math.sin(out) * 30];
  const g2: Mark[] = [...w2.filter((m) => m.k < L + fc), { k: L + fc, x: P[0], y: P[1] }, { k: L + fc + 1, x: Q[0], y: Q[1], act: 'knock' }, { k: L + fc + 11, x: T[0], y: T[1], act: 'down' }, { k: L + fc + 35, x: T[0], y: T[1] }, { k: 180, x: T[0], y: T[1] }];
  GAZE_MARKS = { g1, g2 };
  return GAZE_MARKS;
}
/** The Warrior's way through each take (his lengths, the world's), by frame of the take. */
export const heroMarks = (shot: BodyShot): readonly Mark[] => (shot === 'b1' || shot === 'b2' ? BILE_MARKS[shot] : gazeMarks()[shot]);
/** Where the Warrior is in frame `k` of a take (the world's), and what he does. */
export function heroWorldB(shot: BodyShot, k: number): { x: number; y: number; act: HeroAt['act']; f: number; lift: number } {
  const M = heroMarks(shot);
  let i = 0;
  while (i < M.length - 2 && k >= M[i + 1].k) i++;
  const a = M[i];
  const b = M[Math.min(M.length - 1, i + 1)];
  const u = b.k > a.k ? clamp01((k - a.k) / (b.k - a.k)) : 0;
  // (knocked flying: thrown, fastest at first; else running at an even pace)
  const e2 = b.act === 'down' ? 1 - (1 - u) ** 2 : u;
  const x = lerp(a.x, b.x, e2);
  const y = lerp(a.y, b.y, e2);
  let act: HeroAt['act'] = 'idle';
  let lift = 0;
  if (b.act === 'down' && u < 1) {
    act = 'knock';
    lift = 60 * Math.sin(Math.PI * u);
  } else if (a.act === 'down' && u < 1) act = 'down';
  else if (Math.hypot(b.x - a.x, b.y - a.y) > 1 && u > 0 && u < 1) act = 'run';
  return { x, y, act, f: k - a.k, lift };
}
const heroAtB = (shot: BodyShot, k: number): HeroAt => {
  const h = heroWorldB(shot, k);
  const n = heroWorldB(shot, k + 1);
  return { du: h.x / UNIT, dv: h.y / UNIT - QUAY, view: n.y > h.y + 0.5 && h.act === 'run' ? 'front' : 'back', act: h.act, f: h.f, lift: h.lift };
};
/** Whether the Warrior is struck in frame `k` (the knock's frames). */
export const bodyStruck = (shot: BodyShot, k: number): boolean => heroWorldB(shot, k).act === 'knock';

// =============================================================================================
// WHERE THINGS GO

/** Where the bile lands (the world's, on the stone): the Warrior's spot as the wind-up begins (both takes the same). */
export const bileTarget = (): [number, number] => [B0[0], B0[1]];
/** Where the glob leaves him (his space, as painted): out of his throat beside his tongue's root, in front of it. */
export const THROAT: [number, number, number] = [-28, 14, 44];
/** THE GLOB IN FLIGHT, `s` seconds after it leaves his throat (the world's): out of his throat as he lunges, high over, down onto where
 *  it lands; null before it leaves and after it lands. Its way (his lengths a second) for its stretch. */
export function globAt(s: number): { x: number; y: number; z: number; vx: number; vy: number; vz: number } | null {
  const T = BILE.flight / EYE_FPS;
  if (s < 0 || s > T) return null;
  const [tx, ty] = bileTarget();
  const x0 = THROAT[0];
  const y0 = THROAT[1] - LUNGE.back;
  const z0 = THROAT[2] - LUNGE.drop;
  const u = s / T;
  const z = lerp(z0, 0, u) + 4 * BILE.apex * u * (1 - u);
  return { x: lerp(x0, tx, u), y: lerp(y0, ty, u), z, vx: (tx - x0) / T, vy: (ty - y0) / T, vz: (-z0 + 4 * BILE.apex * (1 - 2 * u)) / T };
}
/** The pool's size (his lengths across its middle) `s` seconds after the glob lands; 0 gone. */
export function poolR(s: number): number {
  if (s < 0 || s >= POOL.life) return 0;
  if (s < POOL.spread) return POOL.r * (1 - (1 - s / POOL.spread) ** 2);
  if (s < POOL.spread + POOL.hold) return POOL.r;
  const u = (s - POOL.spread - POOL.hold) / (POOL.life - POOL.spread - POOL.hold);
  return POOL.r * (1 - u ** 1.4);
}
/** THE GAZE'S ARC (the world's; angles in radians round from straight out over the stone, toward his right, +x): turning about the
 *  water under his eye as it aims (`ox`, `oy`); toward where the Warrior stands as it begins (`toward`, the same in both takes); laid
 *  `half` to the side it starts (`a0`), swept to the other (`a1`); where the beam comes down on it (`far`: as far out as he stood). */
let ARC: { ox: number; oy: number; toward: number; a0: number; a1: number; far: number } | null = null;
export function gazeArc(): { ox: number; oy: number; toward: number; a0: number; a1: number; far: number } {
  if (ARC) return ARC;
  const e = tipEye(aimedTongue(0, 0, 0));
  const toward = Math.atan2(G0[0] - e[0], G0[1] - e[1]);
  const h = (GAZE.half * Math.PI) / 180;
  ARC = { ox: e[0], oy: e[1], toward, a0: toward - h, a1: toward + h, far: Math.hypot(G0[0] - e[0], G0[1] - e[1]) };
  return ARC;
}
/** A gaze's arc (`gazeArc`'s, or one laid at another place: his phase 3, art/eye_phase3.ts). */
export type GazeArc = ReturnType<typeof gazeArc>;
/** The beam's angle at frame `f` of the gaze (null while it is off): laid at the arc's first side as it fires, swept evenly across it
 *  in `sweep` frames, held at its other side as it gutters out. */
export function beamAngle(f: number, A: GazeArc = gazeArc()): number | null {
  if (f < GAZE_FIRE || f >= GAZE_OUT) return null;
  return lerp(A.a0, A.a1, clamp01((f - GAZE_FIRE) / GAZE.sweep));
}
/** Where his eye looks (the angle), frame `f` of the gaze: at the Warrior through the wind-up, cocked a little toward the arc's first side
 *  at its end; whipped round to it as it fires; with the beam after. */
export function eyeAngle(f: number, A: GazeArc = gazeArc()): number {
  if (f < GAZE_FIRE) return A.toward + (A.a0 - A.toward) * 0.22 * sm(17, GAZE.wind - 1, f);
  return lerp(A.a0, A.a1, clamp01((f - GAZE_FIRE) / GAZE.sweep));
}
/** THE BEAM'S LINE at angle `a` (the world's): where it comes onto the stone at its back edge (`sx`, `sy`), where it leaves the stone
 *  (`ex`, `ey`: its far edge or an end); where the beam comes down on it (`ax`, `ay`: as far out as the Warrior stood). */
export function beamLine(a: number, A: GazeArc = gazeArc()): { sx: number; sy: number; ex: number; ey: number; ax: number; ay: number } {
  const ux = Math.sin(a);
  const uy = Math.cos(a);
  const t0 = (STONE_BOX.y0 - A.oy) / uy;
  let t1 = (STONE_BOX.y1 - A.oy) / uy;
  const xe = A.ox + ux * t1;
  if (Math.abs(xe) > STONE_BOX.x1) t1 = (Math.sign(ux) * STONE_BOX.x1 - A.ox) / ux;
  return { sx: A.ox + ux * t0, sy: A.oy + uy * t0, ex: A.ox + ux * t1, ey: A.oy + uy * t1, ax: A.ox + ux * A.far, ay: A.oy + uy * A.far };
}
/** Whether the beam is on a point of the stone (the world's) at frame `f`, the Warrior's size counted: how far inside its edge (his
 *  lengths), or less than 0 clear of it. */
export function beamOn(p: readonly number[], f: number, A: GazeArc = gazeArc()): number {
  const a = beamAngle(f, A);
  if (a === null) return -1;
  const dx = p[0] - A.ox;
  const dy = p[1] - A.oy;
  const along = dx * Math.sin(a) + dy * Math.cos(a);
  if (along < 0) return -1;
  return BEAM.w / 2 + HERO_R - Math.abs(dx * Math.cos(a) - dy * Math.sin(a));
}
/** Where the Warrior is just clear of the gaze: as far out as he stood, just past where the beam stops at the arc's other side (his edge
 *  0.3 tiles past its edge). */
export function gazeClear(): [number, number] {
  const A = gazeArc();
  const lat = BEAM.w / 2 + HERO_R + 0.3 * TILE;
  const d = A.far * 1.1;
  return [A.ox + Math.sin(A.a1) * d + Math.cos(A.a1) * lat, A.oy + Math.cos(A.a1) * d - Math.sin(A.a1) * lat];
}
/** How long ago (seconds) the beam passed over angle `b` at frame `f` (less than 0: not yet; null outside the arc). */
export function sweptAgo(b: number, f: number): number | null {
  const A = gazeArc();
  const u = (b - A.a0) / (A.a1 - A.a0);
  if (u < 0 || u > 1) return null;
  return (f - (GAZE_FIRE + u * GAZE.sweep)) / EYE_FPS;
}

// =============================================================================================
// HIS FRAMES

/** His tongue reared and aimed along angle `a` (see `gazeArc`), from UNFURL's reared tongue: its upper part bent forward and down out
 *  over the stone, and across toward where it looks. */
export function aimedTongue(a: number, t: number, f: number): number[][] {
  const base = weaveTongue(REARED, t, 0.3);
  const dx = Math.sin(a) * AIM.across;
  // (the eye jolted back as it fires; shuddering while it sweeps)
  const rec = f === GAZE.wind ? AIM.recoil[0] : f === GAZE.wind + 1 ? AIM.recoil[1] : f > GAZE.wind + 1 && f < GAZE_OUT ? 6 * (1 - (f - GAZE.wind - 2) / (GAZE_OUT - GAZE.wind - 2)) : 0;
  const shud = f >= GAZE.wind && f < GAZE_SWEPT ? 1 : f >= GAZE_SWEPT && f < GAZE_OUT ? 0.5 : 0;
  return base.map((q, i) => {
    const u = (i / (base.length - 1)) ** 2;
    const jx = shud * 2.5 * u * (h1(f, 801 + i) * 2 - 1);
    const jz = shud * 2.5 * u * (h1(f, 851 + i) * 2 - 1);
    return [q[0] + dx * AIM.forward * u + jx, q[1] + AIM.forward * u * Math.cos(a) ** 0.5 - rec * u, q[2] - AIM.down * u + rec * 0.5 * u + jz, q[3]];
  });
}
export const tipEye = (path: ReadonlyArray<readonly number[]>): [number, number, number] => {
  const n = path.length - 1;
  const R = TONGUE_RISEN[n];
  return [EYE_RISEN[0] + path[n][0] - R[0], EYE_RISEN[1] + path[n][1] - R[1], EYE_RISEN[2] + path[n][2] - R[2]];
};
export const mixPath = (a: ReadonlyArray<readonly number[]>, b: ReadonlyArray<readonly number[]>, w: number): number[][] => a.map((q, i) => q.map((v, c) => lerp(v, b[i][c], w)));
const body = (an: ColossusAnim, lean = 0): ColossusPose => ({ view: 'front', drop: 0, back: 0, body: true, gaze: an.gaze, arms: [], anim: an, ...(lean ? { lean: { k: lean, from: 0, ease: 60 } } : {}) });

/** HIM AT FRAME `f` OF AN ATTACK (his clock `t` running on): his anim, how far he leans, back and up (his lengths). */
export function attackAnim(kind: 'bile' | 'gaze', f: number, t: number): { an: ColossusAnim; lean: number; back: number; drop: number } {
  const S = standAnim(t);
  if (kind === 'bile') {
    const w = bileW(f);
    const P = bilePose(f);
    const q = bileRear(f);
    const path = mixPath(S.tongue as number[][], weaveTongue(REARED, t, 0.35), q);
    const eye = tipEye(path);
    const an: ColossusAnim = { ...S, open: lerp(S.open, P.open, w), glow: lerp(S.glow, P.glow, w), tongue: path, eye, gaze: gazeAt(eye), lids: lerp(1, bileLids(f), w) };
    return { an, lean: P.lean * w, back: P.back * w, drop: P.drop * w };
  }
  const q = gazeQ(f);
  const a = eyeAngle(f);
  const path = mixPath(standTongue(t).path, aimedTongue(a, t, f), q);
  const eye = tipEye(path);
  const L0 = beamLine(a);
  // (his eye glares out along the beam's way, no steeper than `AIM.pitch` below level: aimed straight down at the stone it would turn its
  // iris away from the Warrior and from you, its lid's dome all that is seen; the beam leaves its iris's face and comes down)
  const hl = Math.hypot(L0.ax - eye[0], L0.ay - eye[1]) || 1;
  const at = norm([((L0.ax - eye[0]) / hl) * Math.cos(AIM.pitch), ((L0.ay - eye[1]) / hl) * Math.cos(AIM.pitch), -Math.sin(AIM.pitch)]);
  const st = gazeAt(eye);
  const gaze = norm([lerp(st[0], at[0], q), lerp(st[1], at[1], q), lerp(st[2], at[2], q)]);
  const an: ColossusAnim = { ...S, tongue: path, eye, gaze, lids: gazeLids(f), swell: gazeSwell(f) };
  return { an, lean: 0, back: 0, drop: 0 };
}
/** The stand's frame at take frame `k` (his clock runs on through the take). */
const standK = (k: number): number => mod(k, 90);

/** THE SCREEN'S JOLTS (game pixels): the retch, the bile crashing down, the beam firing, its rumble while it is held. */
export const BODY_SHAKE = { retch: 4, retchLong: 8, splash: 8, splashLong: 14, beam: 9, beamLong: 6, rumble: 2 } as const;
/** The camera, lowered from the stills' (picture pixels), by frame of the take: on all of him in his stand; the bile: down through the
 *  wind-up to the warning and the Warrior, following the glob down to where it lands, back up to him as the pool dies; the gaze: lowered
 *  as it fires so that the beam sweeps across the stone with his eye still in sight, and back. */
const CAMS: Record<'bile' | 'gaze', Array<[number, number]>> = {
  bile: [[0, -10], [L + 2, -10], [L + 20, 90], [L + BILE.wind, 90], [L + BILE_LAND - 4, 160], [L + BILE_LAND + 70, 160], [L + BILE_LAND + 100, -16], [BODY_TAKE.frames, -16]],
  gaze: [[0, 10], [L + 14, 60], [L + GAZE_FIRE + 2, 72], [L + GAZE_FIRE + 10, 100], [L + GAZE_SWEPT + 4, 100], [L + GAZE_OUT + 22, 10], [BODY_TAKE.frames, 10]],
};
function camAt(marks: Array<[number, number]>, k: number): number {
  let i = 0;
  while (i < marks.length - 2 && k >= marks[i + 1][0]) i++;
  const a = marks[i];
  const b = marks[Math.min(marks.length - 1, i + 1)];
  const u = b[0] > a[0] ? clamp01((k - a[0]) / (b[0] - a[0])) : 0;
  return Math.round(lerp(a[1], b[1], u * u * (3 - 2 * u)));
}
const jolt = (g: number, a: number, long: number, s: number): [number, number] => {
  if (g < 0 || g >= long) return [0, 0];
  const v = a * (1 - g / long);
  return [Math.round(v * 0.5 * (h1(g, s) * 2 - 1)), Math.round(v * (g % 2 ? -1 : 1))];
};

/** THE GAZE: how far his middle tentacle ducks (his lengths: down under the water, back from the stone's edge), and how much of it at
 *  frame `f` of the gaze (0 standing, 1 ducked): down through the wind-up's first 22 frames, up again through the wind-down. */
export const DUCK = { down: 200, back: 40 } as const;
export const duckAt = (f: number): number => sm(0, 22, f) * (1 - sm(GAZE_OUT + 2, GAZE.frames - 2, f));
/** A FRAME OF A TAKE (`k` from 0 to `BODY_TAKE.frames`): him (his stand, the attack, his stand), his three tentacles standing, the
 *  Warrior, the camera, the shakes, and what the game draws (`bfx`). */
export function bodyFrame(shot: BodyShot, k: number): EyeFrame {
  const kind: 'bile' | 'gaze' = shot[0] === 'b' ? 'bile' : 'gaze';
  const A = kind === 'bile' ? BILE : GAZE;
  const f = k - L;
  const base = eyeFrame('stand', standK(k));
  let jaws = base.jaws;
  let spit = base.spit;
  let tongue = base.tongue;
  const smear: Array<EyeLayer | null> = [null, null, null];
  const t = standK(k) / EYE_FPS;
  const layersAt = (g: number): { jaws: EyeLayer; spit: EyeLayer | null; tongue: EyeLayer | null } => {
    const tg = standK(L + g) / EYE_FPS;
    const P = attackAnim(kind, g, tg);
    const c = kind === 'bile' ? 'b' : 'g';
    if (kind === 'bile') {
      return {
        jaws: { key: `J.${c}.${pad(g)}`, pose: body({ ...P.an, parts: 'jaws' }, P.lean), drop: P.drop, back: P.back },
        spit: { key: `S.${c}.${pad(g)}`, pose: body({ ...P.an, parts: 'spit' }, P.lean), drop: P.drop, back: P.back },
        tongue: { key: `T.${c}.${pad(g)}`, pose: body({ ...P.an, parts: 'tongue' }, P.lean), drop: P.drop, back: P.back },
      };
    }
    // (the gaze: only his tongue and eye are its own; his jaws and spittle his stand's)
    const B = eyeFrame('stand', standK(L + g));
    return { jaws: B.jaws, spit: B.spit, tongue: { key: `T.${c}.${pad(g)}`, pose: body({ ...P.an, parts: 'tongue' }), drop: 0, back: 0 } };
  };
  if (f >= 0 && f < A.frames) {
    const Ly = layersAt(f);
    jaws = Ly.jaws;
    spit = Ly.spit;
    tongue = Ly.tongue;
    // (the strike's two frames: smeared, the last frame behind)
    if (f >= A.wind && f < A.wind + A.strike) {
      const P = layersAt(f - 1);
      if (kind === 'bile') smear.push(P.jaws, P.tongue);
      else smear.push(P.tongue);
    }
  }
  void t;
  // (what the game draws)
  const bfx: BodyFx = { kind, shot, f };
  let shake: [number, number] = [0, 0];
  const add = (j: [number, number]): void => {
    shake = [shake[0] + j[0], shake[1] + j[1]];
  };
  if (kind === 'bile') {
    const [tx, ty] = bileTarget();
    const sGlob = (f - BILE_RELEASE) / EYE_FPS;
    const sLand = (f - BILE_LAND) / EYE_FPS;
    // (the warning on the stone through the wind-up and the flight, flaring gold as it comes down)
    if (f >= 0 && f < BILE_LAND) bfx.warn = { x: tx, y: ty, k: f / (BILE_LAND - 1), flare: sm(BILE_LAND - 9, BILE_LAND - 1, f) };
    // (bile welling up in his maw through the wind-up, hurled out as he retches; drooling off him as he settles)
    if (f >= 0 && f < BILE.frames + 30) {
      bfx.well = f < BILE.wind ? sm(4, BILE.wind - 1, f) : f < BILE_RELEASE ? 1 : 0;
      bfx.drool = f >= BILE_RELEASE ? (1 - sm(BILE.frames - 10, BILE.frames + 28, f)) : f >= 8 ? 0.5 * sm(8, BILE.wind, f) : 0;
      bfx.heave = heave(f);
      bfx.lunge = { back: attackAnim('bile', f, t).back, drop: attackAnim('bile', f, t).drop };
    }
    const g = globAt(sGlob);
    if (g) bfx.glob = { ...g, s: sGlob };
    if (sLand >= 0 && sLand < POOL.life + 0.6) bfx.splash = { x: tx, y: ty, s: sLand };
    add(jolt(f - BILE.wind, BODY_SHAKE.retch, BODY_SHAKE.retchLong, 71));
    add(jolt(f - BILE_LAND, BODY_SHAKE.splash, BODY_SHAKE.splashLong, 72));
  } else {
    const A = gazeArc();
    const a = beamAngle(f);
    // (the warning: the arc it will sweep, its first side flaring as it fires; while it sweeps, the part of it still to come)
    if (f >= 0 && f < GAZE_SWEPT) bfx.arc = { ox: A.ox, oy: A.oy, a0: A.a0, a1: A.a1, from: a ?? A.a0, k: f < GAZE_FIRE ? f / (GAZE.wind - 1) : 1, flare: f < GAZE_FIRE ? sm(GAZE.wind - 9, GAZE.wind - 1, f) : 0 };
    if (f >= 0 && f < GAZE_OUT) bfx.dark = f < GAZE_FIRE ? 0.5 * sm(0, 10, f) : 0.5 * (1 - sm(GAZE_SWEPT, GAZE_OUT, f));
    if (a !== null) bfx.beam = { ...beamLine(a), a, s: (f - GAZE_FIRE) / EYE_FPS, reach: f === GAZE_FIRE ? 0.5 : 1, k: 1 - sm(GAZE_SWEPT - 1, GAZE_OUT, f) };
    // (the scorch: the stone burnt where the beam has passed, smouldering, cooling, fading)
    if (f > GAZE_FIRE && (f - GAZE_SWEPT) / EYE_FPS < GAZE.scorch) bfx.scorch = { ox: A.ox, oy: A.oy, a0: A.a0, a1: A.a1, to: lerp(A.a0, A.a1, clamp01((f - GAZE_FIRE) / GAZE.sweep)), f };
    if (f >= 0 && f < GAZE.frames) {
      const P = attackAnim('gaze', f, t);
      bfx.eye = P.an.eye as [number, number, number];
      bfx.gaze = P.an.gaze as [number, number, number];
      bfx.flare = gazeFlare(f);
      bfx.swell = gazeSwell(f);
      if (f >= GAZE_SWEPT) bfx.smoke = (f - GAZE_SWEPT) / EYE_FPS;
    }
    add(jolt(f - GAZE_FIRE, BODY_SHAKE.beam, BODY_SHAKE.beamLong, 73));
    if (f >= GAZE_FIRE + BODY_SHAKE.beamLong && f < GAZE_SWEPT) add([Math.round((h1(f, 74) * 2 - 1) * BODY_SHAKE.rumble), Math.round((h1(f, 75) * 2 - 1) * BODY_SHAKE.rumble)]);
  }
  // (the gaze: his middle tentacle, standing in the water between his eye and the stone, right in the arc, ducks down under the water
  // and draws back from the stone's edge through the wind-up, out of the beam's way, and comes back up through the wind-down)
  let arms = base.arms;
  if (kind === 'gaze') {
    const d = duckAt(f);
    if (d > 0) arms = base.arms.map((A, i) => (A && i === 1 ? { ...A, drop: A.drop + DUCK.down * d, back: A.back + DUCK.back * d } : A));
  }
  return { ...base, move: shot, k, jaws, spit, tongue, arms, smear, hero: heroAtB(shot, k), camY: camAt(CAMS[kind], k), shake, bfx };
}

// =============================================================================================
// THE SHAPES OF WHAT THE GAME DRAWS (never ruled: each edge ragged, wavering, alive)

/** The bile's colours: sick yellow-green and black, its burning the enemy's gold (art/mkit.ts FLAME). Dark to light. */
export const BILE_COLOURS = { bile: ['#0c0c06', '#25270c', '#4a4e14', '#7a7c1e', '#b4ac34'], black: '#08080a', weed: ['#1c2a12', '#33461c'], bone: ['#8a8068', '#c4b894'], burn: ['#c0206a', '#ff4f8a', '#ffb070', '#fff0a0'] } as const;
/** The beam's colours, out to in: the enemy's pink to gold, a white-hot core (art/mkit.ts FLAME). */
export const BEAM_COLOURS = ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0', '#fffbe8'] as const;
/** THE GLOB: a heaving ropy mass of bile (lobes of it round its middle, each its own size, swelling and shrinking as it tumbles), black
 *  clots, weed and a bone or two in it, strands of it trailing back along its way; each a blob (across and up from its middle, picture
 *  pixels at the game's size times two; how big; what). `s` seconds into its flight; its way on the screen (`vi`, `vj`). */
export interface Blob { di: number; dj: number; r: number; kind: 'bile' | 'black' | 'weed' | 'bone' | 'strand' }
export function globBlobs(s: number, vi: number, vj: number, seed = 1): Blob[] {
  const out: Blob[] = [];
  const vl = Math.hypot(vi, vj) || 1;
  const ui = vi / vl;
  const uj = vj / vl;
  const R = 34;
  const n = 11;
  for (let q = 0; q < n; q++) {
    const a = (q / n) * TAU + s * (3 + q * 0.4) + h1(q, seed) * 2;
    const rr = R * (0.45 + 0.25 * Math.sin(s * 9 + q * 1.7));
    out.push({ di: Math.cos(a) * rr, dj: Math.sin(a) * rr * 0.85, r: R * (0.42 + 0.22 * h1(q, seed + 1) + 0.08 * Math.sin(s * 11 + q)), kind: q % 4 === 3 ? 'black' : 'bile' });
  }
  out.push({ di: 0, dj: 0, r: R * 0.75, kind: 'bile' });
  // (weed and a bone caught in it, tumbling with it)
  for (let q = 0; q < 3; q++) {
    const a = s * 5 + q * 2.1 + seed;
    out.push({ di: Math.cos(a) * R * 0.6, dj: Math.sin(a) * R * 0.5, r: q === 2 ? 4 : 3, kind: q === 2 ? 'bone' : 'weed' });
  }
  // (strands trailing back along its way, waving, breaking into beads)
  for (let st = 0; st < 3; st++) {
    const off = (st - 1) * 9;
    for (let q = 1; q <= 9; q++) {
      const back = R * 0.7 + q * 6;
      const wv = Math.sin(q * 0.8 + s * 14 + st * 2) * (2 + q * 0.6);
      if (q > 5 && h1(q, seed * 7 + st + Math.floor(s * 30)) < 0.3) continue;
      out.push({ di: -ui * back + -uj * (off + wv), dj: -uj * back + ui * (off + wv), r: Math.max(1.2, 4.5 - q * 0.38), kind: 'strand' });
    }
  }
  return out;
}
/** Smooth noise round a turn (`x` 0 to 1 once round, `n` points round it, so that it meets itself). */
const vnRound = (x: number, n: number, seed: number): number => {
  const i = Math.floor(x);
  const u = x - i;
  const e = u * u * (3 - 2 * u);
  return h1(mod(i, n), seed) + (h1(mod(i + 1, n), seed) - h1(mod(i, n), seed)) * e;
};
/** A ragged edge: how far out at angle `a` (1 its middle's size), wavering with time `s`: `amp` of it in lobes and bights, and a crinkle
 *  all round it, never even (seen from above at the game's slant, a round's top and bottom are long and flat: the crinkle keeps them
 *  from ever lying straight). */
const ragged = (a: number, s: number, seed: number, amp: number): number => {
  const x = mod(a, TAU) / TAU;
  return 1 + amp * ((vnRound(x * 11 + s * 1.7, 11, seed) - 0.5) * 1.3 + (vnRound(x * 23 - s * 2.3, 23, seed + 5) - 0.5) * 0.7) + 0.03 * Math.sin(34 * a + 3 * vnRound(x * 5 + s * 0.8, 5, seed + 9) + s * 4);
};
/** The pool's edge at angle `a` (its size at its middle 1), `s` seconds after it lands: lobed where it splashed, eating outward, ragged. */
export const poolEdge = (a: number, s: number): number => ragged(a, s * 0.3, 9101, 0.24) * (1 + 0.12 * Math.sin(a * 3 + 0.7) + 0.08 * Math.sin(a * 5 + 2.1));
/** The warning's edge at angle `a`, frame `f` of the attack: a ragged ring, crawling. */
export const warnEdge = (a: number, f: number): number => ragged(a, f / EYE_FPS, 9201, 0.12);
/** The beam's half-width (his lengths) `u` along it from the eye (0) to where it lands (1), on side `side` (-1 or 1), `s` seconds after
 *  it fires: licking, flickering, never straight. */
export const beamEdge = (u: number, s: number, side: number): number => (BEAM.eye + (BEAM.land - BEAM.eye) * u) * (0.72 + 0.4 * vn1(u * 9 - s * 40 + (side > 0 ? 0 : 17), 9301) + 0.22 * (vn1(u * 37 - s * 90 + (side > 0 ? 5 : 29), 9302) - 0.5)) + 1.9 * Math.sin(u * 95 - s * 60 + 3 * vn1(u * 6 + (side > 0 ? 3 : 9), 9303));
/** The fire along the line's half-width (his lengths) `v` along it (his lengths from its start), on side `side`, `s` seconds after it
 *  fires: tongues licking out from it. */
export const fireEdge = (v: number, s: number, side: number): number => (BEAM.w / 2) * (0.68 + 0.5 * vn1(v / 14 - s * 6 + (side > 0 ? 0 : 23), 9401) + 0.2 * (vn1(v / 4 - s * 25 + (side > 0 ? 3 : 47), 9402) - 0.5) + 0.07 * Math.sin(v / 2.6 - s * 30 + 3 * vn1(v / 30 + (side > 0 ? 1 : 7), 9403)));
/** The arc's sides (the gaze's warning): how far each wavers off the straight (his lengths, across it), `r` out along it, `s` seconds in;
 *  `side` -1 its first, 1 its other. */
export const arcEdge = (r: number, s: number, side: number): number => 7 * (vn1(r / 12 - s * 4 + (side > 0 ? 0 : 31), 9601) - 0.5) + 3 * (vn1(r / 3.5 + s * 9 + (side > 0 ? 11 : 53), 9602) - 0.5) + 1.2 * Math.sin(r / 2.3 + s * 7 + side);
/** The scorch's sides (`side` -1 its first, where the beam fired; 1 where the beam is, or stopped): how far out past the line the stone
 *  is burnt (his lengths, across), `r` out along it; ragged. */
export const scorchEdge = (r: number, side: number): number => (BEAM.w / 2) * (0.6 + 0.5 * vn1(r / 11 + (side > 0 ? 0 : 41), 9501) + 0.25 * vn1(r / 3 + (side > 0 ? 7 : 61), 9502)) + 1.5 * Math.sin(r / 2.1 + side);

// =============================================================================================
// THE NUMBERS (for the main chat; the checks)

/** The glob's flight: how far (tiles, from his throat to where it lands), how long (s), how high over the stone (tiles); the splash and
 *  the pool; the beam (how wide it hits, how long its line is, the frames it fires and goes out). */
export function bodyNumbers(): { glob: { tiles: number; s: number; apexTiles: number }; splashTiles: number; pool: { tiles: number; s: number }; beam: { wideTiles: number; longTiles: [number, number]; reachTiles: number; deg: number; fire: number; swept: number; out: number } } {
  const g0 = globAt(0) as NonNullable<ReturnType<typeof globAt>>;
  const [tx, ty] = bileTarget();
  const A = gazeArc();
  // (its line on the stone, at its shortest and longest across the arc; how far from under his eye its line runs to the stone's edge)
  let lo = Infinity;
  let hi = 0;
  let reach = 0;
  for (let u = 0; u <= 1; u += 1 / 64) {
    const Ln = beamLine(lerp(A.a0, A.a1, u));
    const l = Math.hypot(Ln.ex - Ln.sx, Ln.ey - Ln.sy);
    lo = Math.min(lo, l);
    hi = Math.max(hi, l);
    reach = Math.max(reach, Math.hypot(Ln.ex - A.ox, Ln.ey - A.oy));
  }
  return {
    glob: { tiles: Math.hypot(tx - g0.x, ty - g0.y) / TILE, s: BILE.flight / EYE_FPS, apexTiles: BILE.apex / TILE },
    splashTiles: SPLASH_R / TILE,
    pool: { tiles: POOL.r / TILE, s: POOL.life },
    beam: { wideTiles: BEAM.w / TILE, longTiles: [lo / TILE, hi / TILE], reachTiles: reach / TILE, deg: GAZE.half * 2, fire: GAZE_FIRE, swept: GAZE_SWEPT, out: GAZE_OUT },
  };
}
void STONE;
