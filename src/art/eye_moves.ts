// FLOOR 10'S BOSS, THE SWAMP COLOSSUS: HIS MOVES, PART 1 (the art chat, 7 Nov 2026): HIS STAND RISEN, HIS LURK UNDER THE WATER (phase
// 1), AND HIS ENTRANCE (the start of phase 2). A MOCK-UP: NOT IN THE GAME, behind EYE2 (art/eye_colossus.ts, off). His look is
// art/eye_colossus.ts, as it was at fe166263; this file says, frame by frame at 30 a second, what each layer of him is doing (his
// jaws, his spittle, his tongue and eye, each tentacle), where he is, and what the game's screen and the water do round him.
//
// HIS WORDS AND PICKS, 7 Nov 2026: shown him from his sketch (fe166263) and asked whether to make him taller like the sketch, “Yes,
// build on this”; his entrance, offered three, his pick “Rises shut, then splits” (offered as: “The jaws rise slowly, pressed together
// like a melting mound, then tear apart down the middle with the roar and the tongue-eye unfurls.”); then, “Nice job that’s awesome”.
// Earlier: “And the eye waves around like its own tentacle”; “have him like constantly melting and dripping”; “Spittle and goo all
// over the place”; his entrance today “is not epic”. And, 14:01, the entrance beat by beat: “And we want the screen to rumble and
// water pour off as it rises in the phase transition.  It opens with a big roar, more screen shake, the eye stalk comes out, let the
// moment breathe for a second, tentacles come up, phase 2.”
//
// HIS MOVES:
//   HIS STAND (`EYE_STAND`, a loop of EYE_LOOP that begins and ends on the same picture): never still. His flesh always melting
//     (art/eye_colossus.ts SLIDE: sheets of it welling up over his jaws' tops and sliding down him, their drips running longer; the
//     drips off his overhangs running longer until their gobs let go and fall and splash; new flesh welling up so that he never runs
//     out); his spittle stretching and snapping across his maw and knitting again (SPIT_ROUND); his jaws breathing open and shut a
//     little; his throat's glow pulsing with his breath; HIS TONGUE ALWAYS WEAVING like a tentacle, a wave running up it, the eye on
//     its tip turning to keep looking at the hero. His three tentacles sway at their roots (their own figures: their moves come later).
//   HIS LURK (`EYE_LURK`, a loop, phase 1): the dark shape of him deep under the black water, heaving slowly; his eye's fire drifting
//     and pulsing up through it on his tongue; bubbles and a slow swell on the surface; slicks of his goo rising.
//   HIS ENTRANCE (`EYE_ENTRANCE`, his pick, beat by beat as he set it at 14:01):
//     1. THE RISE: the eye's fire sinks into him and his jaws shut under the water; the water stirs, then boils; HE RISES SHUT, his
//        jaws pressed together like a huge melting mound, slowly, THE SCREEN RUMBLING all through it, WATER POURING OFF HIM in sheets
//        and streams, a swell rolling off him.
//     2. THE ROAR: the strain (his seam splitting slowly, strings of flesh and spittle stretched across it, his throat's glow through
//        it, held); then HE OPENS WITH A BIG ROAR: his jaws TEAR APART down the middle in four frames, the strings snapping, his teeth
//        unmeshing, his throat flaring, spray and goo blasted out, the water slammed flat in a ring, MORE SCREEN SHAKE.
//     3. THE EYE STALK COMES OUT: his tongue unfurls out of his throat and rears up, the eye on it SNAPPING OPEN to stare.
//     4. THE MOMENT BREATHES: a second with nothing new; he looms, melting and dripping, staring at the hero, the water settling.
//     5. THE TENTACLES COME UP: his three burst up out of the water at their roots, left, right, middle, water bursting round each
//        (their own move, `armBurst`, to be used again at the start of each phase): the water bulging over each, HELD; the burst in
//        two frames, smeared; curling over into their place.
//     6. PHASE 2: his stand, from its first frame.
//   The game's screen: `EYE_SCREEN` (rumble, shakes, darkening, the roar's sound) for the main chat and the sound chat.

import { ARMS_RISEN, ARMS_UNDER, ARM_LOOP, COLOSSUS, EYE_LOOP, EYE_RISEN, EYE_UNDER, GAZE_AT_YOU, STONE, TONGUE_RISEN, TONGUE_UNDER, armBelly, weaveTongue } from './eye_colossus';
import type { ArmPose, ColossusAnim, ColossusPose } from './eye_colossus';

type V3 = readonly [number, number, number];
export const EYE_FPS = 30;
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (a: number, b: number, v: number): number => {
  const u = clamp01((v - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const h1 = (n: number, s: number): number => {
  let h = (Math.imul(n | 0, 374761393) + Math.imul(s | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
/** Smooth noise over time (frames), -1 to 1. */
const wob = (x: number, s: number): number => {
  const i = Math.floor(x);
  const u = x - i;
  const e = u * u * (3 - 2 * u);
  return (h1(i, s) + (h1(i + 1, s) - h1(i, s)) * e) * 2 - 1;
};

// =============================================================================================
// WHERE THINGS ARE

/** A length across the screen (his own lengths) is this many picture pixels; the arena's units (u, v: art's tools) are 27.7 of his. */
const SEEN = 2 / Math.sqrt(3);
const UNIT = 16 * 2 / SEEN;
/** The hero at his spot in the pictures (1.5 of the arena's units left of his middle, 1.4 onto the stone), his own space, at his
 *  eyes' height: what his eye keeps looking at. */
export const HERO_SPOT: V3 = [-1.5 * UNIT, ((STONE.edge * 0.5773502691896258) / 16 + 1.4) * UNIT, 40];
const norm = (v: readonly number[]): [number, number, number] => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
/** His eye's gaze from where it is: toward the camera, and down at the hero. */
export function gazeAt(eye: readonly number[]): [number, number, number] {
  const h = norm([HERO_SPOT[0] - eye[0], HERO_SPOT[1] - eye[1], HERO_SPOT[2] - eye[2]]);
  return norm([GAZE_AT_YOU[0] * 0.6 + h[0] * 0.4, GAZE_AT_YOU[1] * 0.6 + h[1] * 0.4, GAZE_AT_YOU[2] * 0.6 + h[2] * 0.4]);
}

// =============================================================================================
// HIS STAND

/** His stand: a loop of EYE_LOOP (90 frames at 30 a second) that begins and ends on the same picture. How far his jaws breathe (of
 *  open), how much his throat's glow pulses. */
export const EYE_STAND = { frames: Math.round(EYE_LOOP * EYE_FPS), breathe: 0.05, pulse: 0.24 } as const;
/** His jaws breathing: a slow breath a loop, opening a little and shutting a little. */
export const standOpen = (t: number): number => 1 + EYE_STAND.breathe * Math.sin((TAU * t) / EYE_LOOP - Math.PI / 2);
/** His throat's glow: swelling as he breathes out, a quicker flicker in it. */
export const standGlow = (t: number): number => 1 + EYE_STAND.pulse * Math.sin((TAU * t) / EYE_LOOP - Math.PI / 2 + 0.5) + 0.07 * Math.sin((TAU * 2 * t) / EYE_LOOP + 1.3);

/** A tongue woven (art/eye_colossus.ts `weaveTongue`): a wave running up it. */
const weave = weaveTongue;
/** His tongue as he stands: always weaving like a tentacle, the eye on its tip; the eye's middle where the tip has carried it. */
export function standTongue(t: number): { path: number[][]; eye: [number, number, number] } {
  const path = weave(TONGUE_RISEN, t, 1);
  const n = path.length - 1;
  const R = TONGUE_RISEN[n];
  return { path, eye: [EYE_RISEN[0] + path[n][0] - R[0], EYE_RISEN[1] + path[n][1] - R[1], EYE_RISEN[2] + path[n][2] - R[2]] };
}
/** His stand at his clock `t`: what his jaws, his spittle and his tongue are doing. */
export function standAnim(t: number): ColossusAnim {
  const T = standTongue(t);
  return { t, open: standOpen(t), tongue: T.path, eye: T.eye, gaze: gazeAt(T.eye), lids: 1, glow: standGlow(t) };
}

/** His tentacles' rests, their suckers held to the way each tip curls at rest: 0, 1, 2 phases 2 and 3 (ARMS_RISEN: left, middle,
 *  right); 3, 4 phase 1 (ARMS_UNDER: at a third and two thirds along the stone). */
export const ARM_REST: ArmPose[] = [...ARMS_RISEN, ...ARMS_UNDER].map((a) => ({ ...a, belly: armBelly(a), fixed: true }));
export { ARM_LOOP };
/** How far a tentacle's tip sways as it stands (his lengths), and how far its tip curls and uncurls (radians, all along its curl). */
export const ARM_SWAY = 22;
export const ARM_CURL = 0.34;
/** A tentacle's frames as it stands: a loop of `ARM_LOOP` (two of them in his stand's one, so that they close together). */
export const ARM_STAND_FRAMES = Math.round(ARM_LOOP * EYE_FPS);
/** A point rotated about an axis (unit) through a point, by an angle. */
function turnAbout(q: readonly number[], o: readonly number[], ax: readonly number[], a: number): number[] {
  const v = [q[0] - o[0], q[1] - o[1], q[2] - o[2]];
  const c = Math.cos(a);
  const s = Math.sin(a);
  const d = ax[0] * v[0] + ax[1] * v[1] + ax[2] * v[2];
  const x = [ax[1] * v[2] - ax[2] * v[1], ax[2] * v[0] - ax[0] * v[2], ax[0] * v[1] - ax[1] * v[0]];
  return [o[0] + v[0] * c + x[0] * s + ax[0] * d * (1 - c), o[1] + v[1] * c + x[1] * s + ax[1] * d * (1 - c), o[2] + v[2] * c + x[2] * s + ax[2] * d * (1 - c)];
}
/** A path's tip curled more (`a` radians all along it, more toward its end) from `from` (0 to 1 along its points) out. */
export function curlTip(path: ReadonlyArray<readonly number[]>, a: number, from = 0.55): number[][] {
  const n = path.length - 1;
  const j0 = Math.round(from * n);
  // (the way it curls: the turn of its tip at rest)
  let ax = [0, 0, 0];
  for (let j = j0; j + 2 <= n; j++) {
    const u = [path[j + 1][0] - path[j][0], path[j + 1][1] - path[j][1], path[j + 1][2] - path[j][2]];
    const v = [path[j + 2][0] - path[j + 1][0], path[j + 2][1] - path[j + 1][1], path[j + 2][2] - path[j + 1][2]];
    ax = [ax[0] + u[1] * v[2] - u[2] * v[1], ax[1] + u[2] * v[0] - u[0] * v[2], ax[2] + u[0] * v[1] - u[1] * v[0]];
  }
  const al = Math.hypot(ax[0], ax[1], ax[2]);
  if (al < 1e-6) return path.map((q) => [...q]);
  ax = [ax[0] / al, ax[1] / al, ax[2] / al];
  const out = path.map((q) => [...q]);
  // (each point beyond the curl's start turned about the one before it, by a share of the angle growing toward the tip)
  for (let j = j0 + 1; j <= n; j++) {
    const w = (j - j0) / (n - j0);
    const da = (a * 2 * w) / (n - j0);
    for (let m = j; m <= n; m++) {
      const r = turnAbout(out[m], out[j - 1], ax, da);
      out[m][0] = r[0];
      out[m][1] = r[1];
      out[m][2] = r[2];
    }
  }
  return out;
}
/** A tentacle as it stands (`w` of ARM_REST) at its clock `t`: never still; a slow wave of sway out along it from its root (its root
 *  where it is), its body breathing up and down, its tip curling and uncurling. A loop of ARM_LOOP. */
export function armStand(w: number, t: number): ArmPose {
  const a = ARM_REST[w];
  const ph = (TAU * t) / ARM_LOOP + w * 2.1;
  const n = a.path.length - 1;
  const swayed = a.path.map((q, j) => {
    const u = j / n;
    const A = ARM_SWAY * u ** 1.5;
    return [q[0] + A * Math.sin(ph - 2.2 * u), q[1] + 0.4 * A * Math.sin(ph - 1.8 * u + 2.1), q[2] + 0.35 * A * Math.sin(ph - 2 * u + 1.2) + 5 * u * Math.sin(ph + 0.4)];
  });
  return { ...a, path: curlTip(swayed, ARM_CURL * Math.sin(ph + 0.8)) };
}

// =============================================================================================
// HIS LURK (phase 1)

/** His lurk: a loop of EYE_LOOP; how far he heaves (his lengths, down and back), his tongue's weave under the water (of TONGUE_WEAVE). */
export const EYE_LURK = { frames: Math.round(EYE_LOOP * EYE_FPS), heave: 6, weave: 0.8 } as const;
/** Where he lies, lurking (how far down, how far back out in the water). */
export function lurkAt(t: number): { drop: number; back: number } {
  const ph = (TAU * t) / EYE_LOOP;
  return { drop: COLOSSUS.sunk + EYE_LURK.heave * Math.sin(ph), back: COLOSSUS.sunkBack + EYE_LURK.heave * 0.6 * Math.sin(ph + 1) };
}
/** His tongue under the water, reared forward before him, weaving slowly, the eye on it looking up. */
export function lurkTongue(t: number): { path: number[][]; eye: [number, number, number] } {
  const path = weave(TONGUE_UNDER, t, EYE_LURK.weave);
  const n = path.length - 1;
  const R = TONGUE_UNDER[n];
  return { path, eye: [EYE_UNDER[0] + path[n][0] - R[0], EYE_UNDER[1] + path[n][1] - R[1], EYE_UNDER[2] + path[n][2] - R[2]] };
}
/** How bright his eye's fire is seen through the water, pulsing. */
export const lurkPulse = (t: number): number => 0.78 + 0.22 * Math.sin((TAU * 2 * t) / EYE_LOOP) + 0.08 * Math.sin((TAU * 5 * t) / EYE_LOOP + 0.7);

// =============================================================================================
// HIS ENTRANCE

/**
 * HIS ENTRANCE, beat by beat (frames at 30 a second, from the first frame after his lurk; each beat's first frame and the frame after
 * its last). It ends on the frame before his stand's first: `frames` long.
 */
export const EYE_ENTRANCE = {
  frames: 270,
  /** 1. The eye's fire sinks into him, his jaws shut under the water; the water stirs, then boils. */
  stir: [0, 30] as const,
  /** 1. He rises shut, a melting mound, water pouring off him (his top breaks the water at `breaks`). */
  rise: [30, 108] as const,
  breaks: 38,
  /** 2. The wind-up, short and big: at the top of his rise the shut mound swells and shudders, the lips of his seam bulging, his
   *  throat's fire glowing through them. Nothing opens or cracks. */
  strain: [108, 117] as const,
  /** 2. THE ROAR, from the very first parting of his seam (`tear[0]`): his jaws peel apart roaring, gaping wider than he stands at the
   *  height of it (`GAPE`, at `tear[1] - 1`), the strings across his seam stretching and snapping, slime and spittle flung everywhere. */
  tear: [117, 131] as const,
  /** 2. ...roaring on at his full gape, his jaws trembling and his throat pulsing with it. */
  gape: [131, 141] as const,
  /** 2. ...then easing back onto his stand (his stand's own jaws from `settle[1]`; his tongue already starting up his gullet inside him). */
  settle: [141, 161] as const,
  /** 3. The eye stalk: his tongue unfurls out of his throat and rears; its eye snaps open (`lids`). */
  stalk: [156, 192] as const,
  lids: [186, 189] as const,
  /** 4. The moment breathes: nothing new. */
  breathe: [192, 222] as const,
  /** 5. The tentacles come up: each bursts (two frames) at its frame, left, right, middle, after the water bulges over it. */
  arms: [222, 270] as const,
  bursts: [232, 242, 237] as const,
  bulge: 10,
  settleArm: 20,
} as const;
const E = EYE_ENTRANCE;
/** His clock at a frame of his entrance: it ends on his stand's first frame (his clock 0). */
export const entranceClock = (k: number): number => (k - E.frames) / EYE_FPS;

/** Where he is at a frame of his entrance (how far down, how far back out). Sinking a little as he gathers himself; then rising,
 *  slowly at first and last. */
export function entranceAt(k: number): { drop: number; back: number } {
  const L = lurkAt(k / EYE_FPS);
  if (k < E.rise[0]) {
    const g = sm(4, E.rise[0], k);
    return { drop: lerp(L.drop, COLOSSUS.sunk + 14, g), back: lerp(L.back, COLOSSUS.sunkBack - 12, g) };
  }
  const u = clamp01((k - E.rise[0]) / (E.rise[1] - E.rise[0]));
  // (eased so that he rises slowly: from still, a little faster through the middle, slow again as he comes to his height)
  const v = 0.5 - 0.5 * Math.cos(Math.PI * u);
  return { drop: (COLOSSUS.sunk + 14) * (1 - v), back: (COLOSSUS.sunkBack - 12) * (1 - v) };
}
/** How wide his jaws gape at the height of his roar (his stand breathes between 0.95 and 1.05). */
export const GAPE = 1.38;
/** How open his jaws are at a frame of his entrance. */
export function entranceOpen(k: number): number {
  if (k < E.rise[0]) return 1 - sm(10, 27, k);
  // (shut through his rise and his wind-up: nothing opens before he roars)
  if (k < E.tear[0]) return 0;
  // (the roar: peeling apart from the first frame, fast and then slower, to his full gape)
  if (k < E.tear[1]) {
    const u = clamp01((k - E.tear[0] + 0.5) / (E.tear[1] - E.tear[0]));
    return GAPE * (1 - (1 - u) ** 2);
  }
  // (roaring on at his full gape, trembling with it)
  if (k < E.gape[1]) return GAPE + 0.025 * Math.sin((k - E.gape[0]) * 2.1) - 0.02 * sm(E.gape[0], E.gape[1], k);
  // (easing back onto his stand)
  const st = standOpen(entranceClock(k));
  const from = GAPE - 0.02 + 0.025 * Math.sin((E.gape[1] - E.gape[0]) * 2.1);
  return lerp(from, st, sm(E.gape[1], E.settle[1], k));
}
/** His wind-up at a frame of his entrance (0 to 1): swelling into it, held, let go as he roars. */
export function entrancePuff(k: number): number {
  if (k < E.strain[0] - 2 || k >= E.tear[0]) return 0;
  return sm(E.strain[0] - 2, E.strain[0] + 5, k);
}
/** His shudder as he winds up (his lengths: down, back): quick, uneven, growing. */
export function entranceShudder(k: number): [number, number] {
  const p = entrancePuff(k);
  if (!p) return [0, 0];
  return [p * 2.4 * (h1(k, 31) * 2 - 1), p * 3 * (h1(k, 32) * 2 - 1)];
}
/** His throat's glow at a frame of his entrance: low while he is shut; showing through his seam as it splits; flaring as he roars;
 *  dying back onto his stand's. */
export function entranceGlow(k: number): number {
  const st = standGlow(entranceClock(k));
  if (k < E.strain[0]) return 0.7;
  // (winding up: his fire rising behind his shut seam, beating)
  if (k < E.tear[0]) return lerp(0.7, 1.9, sm(E.strain[0], E.tear[0] - 1, k)) + 0.15 * Math.sin((k - E.strain[0]) * 1.6);
  // (roaring: flaring as he parts, pulsing with his roar)
  const pulse = 0.35 * Math.sin((k - E.tear[0]) * 1.25);
  if (k < E.gape[1]) return lerp(2.2, 2.6, sm(E.tear[0], E.tear[0] + 3, k)) + pulse;
  return lerp(2.6 + pulse, st, sm(E.gape[1], E.settle[1], k));
}

/** His tongue drawn down into him (a path down out of his gullet into the dark under the water). */
const DRAWN_IN: number[][] = TONGUE_RISEN.map((q, i) => [0, -52 - i * 1.2, 28 - i * 19, q[3]]);
/** His tongue, out of his gullet, rising bowed over to one side, its tip hooked over into its eye from the side (as it meets it when it
 *  stands: the stalk joining under it); then rearing, taller than it stands. */
const UNFURL_CURLED: number[][] = [[0, -52, 28], [0, -38, 26], [1, -24, 40], [0, -12, 58], [-4, -2, 78], [-10, 4, 98], [-16, 8, 116], [-20, 10, 132], [-20, 10, 146], [-16, 10, 156], [-9, 10, 162], [-1, 10, 165], [7, 10, 166]].map((q, i) => [...q, TONGUE_RISEN[i][3]]);
const UNFURL_REARED: number[][] = [[0, -52, 28], [0, -30, 24], [3, -6, 32], [10, 12, 54], [22, 22, 84], [28, 30, 116], [22, 34, 148], [8, 36, 176], [-8, 36, 198], [-18, 36, 214], [-20, 38, 228], [-16, 40, 238], [-10, 42, 242]].map((q, i) => [...q, TONGUE_RISEN[i][3]]);
/** A curve through keys (each a path), at `u` between key `i` and `i + 1` (Catmull-Rom, point by point). */
function through(keys: number[][][], i: number, u: number): number[][] {
  const P0 = keys[Math.max(0, i - 1)];
  const P1 = keys[i];
  const P2 = keys[Math.min(keys.length - 1, i + 1)];
  const P3 = keys[Math.min(keys.length - 1, i + 2)];
  return P1.map((_, j) => P1[j].map((_, c) => 0.5 * (2 * P1[j][c] + (-P0[j][c] + P2[j][c]) * u + (2 * P0[j][c] - 5 * P1[j][c] + 4 * P2[j][c] - P3[j][c]) * u * u + (-P0[j][c] + 3 * P1[j][c] - 3 * P2[j][c] + P3[j][c]) * u * u * u)));
}
const tipEye = (path: number[][]): [number, number, number] => {
  const n = path.length - 1;
  const R = TONGUE_RISEN[n];
  return [EYE_RISEN[0] + path[n][0] - R[0], EYE_RISEN[1] + path[n][1] - R[1], EYE_RISEN[2] + path[n][2] - R[2]];
};
/** His tongue at a frame of his entrance: the lurk's, drawn down into him as he shuts; none while he rises and roars; unfurling out
 *  of his throat; then his stand's. With the eye's middle, its gaze and its lids. Null: drawn in. */
export function entranceTongue(k: number): { path: number[][]; eye: [number, number, number]; gaze: [number, number, number]; lids: number; roll: number; swell: number } | null {
  if (k < 22) {
    const L = lurkTongue(k / EYE_FPS);
    const w = sm(2, 21, k);
    const path = L.path.map((q, i) => q.map((v, c) => lerp(v, DRAWN_IN[i][c], w)));
    const n = path.length - 1;
    const eye: [number, number, number] = [L.eye[0] + path[n][0] - L.path[n][0], L.eye[1] + path[n][1] - L.path[n][1], L.eye[2] + path[n][2] - L.path[n][2]];
    return { path, eye, gaze: norm([0, 0.87 - w * 0.5, 0.5 - w * 0.9]), lids: 1 - sm(3, 12, k), roll: 0, swell: 1 };
  }
  if (k < E.stalk[0]) return null;
  if (k >= E.stalk[1]) return null;
  // (keys: drawn in; its tip out of his gullet, curled; reared high, uncurling; his stand's, where it is at the end)
  const kk = [E.stalk[0], E.stalk[0] + 11, E.stalk[0] + 23, E.stalk[1] - 1];
  const keys = [DRAWN_IN.map((q, i) => (i < 2 ? q : [q[0], q[1], q[2] + 40, q[3]])), UNFURL_CURLED, UNFURL_REARED, standTongue(entranceClock(E.stalk[1] - 1)).path];
  let i = 0;
  while (i < kk.length - 2 && k >= kk[i + 1]) i++;
  const u = clamp01((k - kk[i]) / (kk[i + 1] - kk[i]));
  // (out at a steady rush, slowing as it rears)
  const path = through(keys, i, i === 0 ? u : sm(0, 1, u) * 0.5 + u * 0.5);
  const eye = tipEye(path);
  // (its shut lids turned to you as it comes, as it looks when it stands, his fire leaking through their crease; snapping open)
  const gaze = gazeAt(eye);
  const lids = k < E.lids[0] ? 0 : [0.3, 0.72, 1][Math.min(2, k - E.lids[0])];
  // (up on its edge as it comes up out of his throat between his jaws, where they are narrowest; lying down on its side as it rears
  // clear of them)
  const roll = (Math.PI / 2) * (1 - sm(96, 150, eye[2]));
  // (squeezed small as it comes up out of his throat, swelling to its size as it clears his jaws)
  const swell = 0.42 + 0.58 * sm(30, 130, eye[2]);
  return { path, eye, gaze, lids, roll, swell };
}

/** HIS TENTACLES' OWN MOVE, THEIR BURST UP OUT OF THE WATER (at his entrance; to be used again at the start of each phase): coiled
 *  deep under the water, rising, the water bulging over it (the wind-up, HELD: `EYE_ENTRANCE.bulge` frames); BURSTING up in two
 *  frames, tall and straight, its tip whipping (the strike, smeared); curling over into its place with a bounce (`settleArm` frames);
 *  then swaying as he stands. Frames from its burst (`k` less its burst frame); null before it stirs. */
export function armBurst(i: number, k: number, t: number): ArmPose | null {
  const rest = armStand(i, t);
  const R = ARM_REST[i];
  const x0 = R.path[0][0];
  const y0 = R.path[0][1];
  const n = R.path.length - 1;
  const out = x0 < 0 ? -1 : x0 > 0 ? 1 : 0.4;
  const tall = n >= 10 ? 400 : 310;
  // (coiled deep under the water, rising toward its surface as the water bulges)
  const coil = (lift: number): number[][] => R.path.map((_, j) => {
    const a = (j / n) * 4.2 + i;
    const rr = 46 * (1 - (j / n) * 0.5);
    // (back from the stone's foot under the water: never into it)
    return [x0 + rr * Math.cos(a) * 0.9, y0 - 26 + rr * Math.sin(a) * 0.5, -40 - j * 6 - 70 * (1 - lift)];
  });
  // (burst up: tall, straight, leaning a little out, its tip hooked)
  const up: number[][] = R.path.map((_, j) => {
    const u = j / n;
    return [x0 + out * 36 * u * u - (u > 0.85 ? out * 30 * (u - 0.85) / 0.15 : 0), y0 + 24 * u, -30 + (tall + 30) * u + (u > 0.9 ? -16 * (u - 0.9) / 0.1 : 0)];
  });
  const b = E.bulge;
  if (k < -b) return null;
  let path: number[][];
  if (k < 0) path = coil(sm(-b, -1, k));
  else if (k === 0) path = coil(1).map((q, j) => q.map((v, c) => lerp(v, up[j][c], 0.58)));
  else if (k === 1) path = up;
  else {
    // (curling over into its place, overshooting a little and back)
    const u = clamp01((k - 1) / (E.settleArm - 1));
    const back = 1 + 0.16 * Math.sin(Math.PI * u) * (1 - u);
    const e = 1 - (1 - u) ** 2.2;
    path = up.map((q, j) => q.map((v, c) => lerp(v, rest.path[j][c], Math.min(1.12, e * back))));
    if (u >= 1) path = rest.path.map((q) => [...q]);
  }
  return { ...rest, path };
}

// =============================================================================================
// THE GAME'S SCREEN, FOR THE MAIN CHAT AND THE SOUND CHAT

/**
 * THE SCREEN AT HIS ENTRANCE (frames from its first): THE RUMBLE all through his rise (from `rumble[0]`, growing to `rumble[2]`
 * game pixels at its strongest through his wind-up, ending as he roars); THE ROAR'S BIG RUMBLE from his jaws' first parting
 * (`roar[0]`), building to `roar[1]` game pixels at his full gape, rolling off to still by `roar[2]`; a jolt as each tentacle bursts
 * (`jolt` game pixels, `joltLong` frames); THE DARK (the fen's dusk dropping toward night while he rises, `dark[2]` at its deepest,
 * lifting as he roars); THE ROAR'S SOUND from the first frame his jaws part.
 */
export const EYE_SCREEN = {
  rumble: [18, E.tear[0], 2.4] as const,
  /** THE ROAR'S RUMBLE: from the first parting, building to its strongest (game pixels) at his full gape, held while he roars there,
   *  rolling off by the third. */
  roar: [E.tear[0], 8, E.settle[1] + 6] as const,
  jolt: 2,
  joltLong: 6,
  dark: [4, 36, 0.32, E.tear[0], E.tear[0] + 14] as const,
  roarSound: E.tear[0],
  rumbleSound: 18,
} as const;
const S = EYE_SCREEN;
/** How far the screen is thrown at a frame of his entrance (game pixels, across and down: whole pixels, as the game's camera moves). */
export function shakeAt(k: number): [number, number] {
  let x = 0;
  let y = 0;
  if (k >= S.rumble[0] && k < S.rumble[1]) {
    const a = S.rumble[2] * (0.45 + 0.55 * sm(S.rumble[0], E.strain[1] - 4, k));
    x += a * wob(k * 0.55, 11);
    y += a * 0.7 * wob(k * 0.55, 12);
  }
  if (k >= S.roar[0] && k < S.roar[2]) {
    // (a rumble, not a swing: thrown every frame, unevenly, both ways; building as he parts, strongest at his gape, rolling off)
    const s = k - S.roar[0];
    const build = 0.35 + 0.65 * sm(E.tear[0], E.tear[1] - 1, k);
    const a = S.roar[1] * build * (k < E.gape[1] ? 1 : 1 - sm(E.gape[1], S.roar[2], k) ** 0.7);
    x += a * (h1(s, 13) * 2 - 1);
    y += a * 0.8 * (h1(s, 14) * 2 - 1);
  }
  for (const b of E.bursts) {
    const s = k - b;
    if (s >= 0 && s < S.joltLong) y += S.jolt * (1 - s / S.joltLong) * (s % 2 ? -1 : 1);
  }
  return [Math.round(x), Math.round(y)];
}
/** How dark the screen has gone at a frame of his entrance (0 the fen's dusk as it is; his eye's fire and the throat's glow never darken). */
export function darkAt(k: number): number {
  return S.dark[2] * sm(S.dark[0], S.dark[1], k) * (1 - sm(S.dark[3], S.dark[4], k));
}

// =============================================================================================
// A FRAME: EACH LAYER OF HIM, WHERE IT IS, AND WHAT THE WATER DOES

/** A layer of him to paint (`pose`, raw: art/eye_colossus.ts), laid where he is now: painted at his middle, moved down `drop` and back
 *  `back` (his lengths) as he lies or rises. Frames with the same `key` share one painting. */
export interface EyeLayer {
  key: string;
  pose: ColossusPose;
  drop: number;
  back: number;
  /** Moved across (his lengths; his shovel's layers, painted where they are and laid where he is). */
  dx?: number;
  /** Laid flipped left to right about his own middle (the painting's own across 0): his shovel at the right end, the left end's paintings
   *  mirrored (art/eye_shovel.ts `SHOVEL_PAINTED_RIGHT`). */
  mirror?: boolean;
}
/** What the water and the air round him do in a frame (the pictures' tool paints them). */
export interface EyeWater {
  /** How deep he is seen into the water: 0 risen, 1 lurking (deep things seen further, darker). */
  sunk: number;
  /** His eye's fire seen through the water (1 as it is). */
  pulse: number;
  /** Bubbles rising and breaking (0 to 1), the swell, slicks of goo rising, the water churning to foam. */
  bubbles: number;
  swell: number;
  slicks: number;
  boil: number;
  /** He breaks the water (the frame of his entrance), and his rise (how far down he was each frame: for the water pouring off him). */
  rising: boolean;
  /** The roar's frame (spray and goo blasted out, the water slammed flat in a ring); each tentacle's burst frame and root. */
  roar: number | null;
  bursts: Array<{ k: number; x: number; y: number }>;
  /** Where his water is (his middle at the water, in the world: his shovel, at an end of the stone; absent, his own place). */
  at?: [number, number];
}
/** What the game draws over the stone and the water for his tentacles (art/eye_arms.ts; the pictures' tool draws it). */
export interface ArmFx {
  /** Where a slam will land, on the stone, through its wind-up (the game's warning): from the root (his space, at the water) along
   *  `ang` (radians from straight toward the camera, positive to his left... to the screen's right), `len` long, `wid` wide; `k` how far
   *  through the wind-up (0 to 1). */
  lines: Array<{ x: number; y: number; ang: number; len: number; wid: number; k: number }>;
  /** A tentacle hitting the stone: where along its line it lay (from `a0` to `a1`), `s` seconds since. */
  hits: Array<{ x: number; y: number; ang: number; a0: number; a1: number; s: number; seed: number }>;
  /** The slime trail it leaves dragging back: the stretch of the line it lay along, `s` seconds since it began to drag. */
  trails: Array<{ x: number; y: number; ang: number; a0: number; a1: number; s: number; seed: number }>;
  /** A tentacle smashing into the water (a water slam), `s` seconds since. */
  smashes: Array<{ x: number; y: number; s: number; seed: number }>;
  /** The waves of the water slams: `dir` 1 rolling right, -1 left; `s` seconds since the smash. */
  waves: Array<{ dir: number; s: number }>;
  /** The two waves' crash in the middle, `s` seconds since they met (or less than 0: not yet). */
  crash: number | null;
  /** Where a water slam's wave will run (the game's warning, through the wind-up): `k` 0 to 1. */
  waveWarn: number | null;
  /** His ichor spurting where a tentacle is struck (his space), `s` seconds since. */
  ichor: Array<{ x: number; y: number; z: number; s: number; seed: number }>;
  /** A tentacle sinking as it dies, where it goes under (his space, at the water), `s` seconds since it began to sink. */
  sinks: Array<{ x: number; y: number; s: number; seed: number }>;
}
/** WHAT THE GAME DRAWS FOR HIS SHOVEL (art/eye_shovel.ts; the pictures' tool draws it): where he is; the tell (the water boiling
 *  and heaving off the end of the stone where he will come up, the stone's end shuddering: 0 to 1); his burst up through it (seconds
 *  since); the water pouring off him (0 to 1); his jaws' clash in a snap (seconds since); the scraping tentacles' tips (where, which way
 *  across and how fast, his lengths a second) and the lines they score in the stone (at a depth, from where to where, seconds since it
 *  left the stone); the Warrior struck (where, seconds since). */
export interface ShovelFx {
  at: [number, number];
  tell: number | null;
  burst: number | null;
  pour: number;
  snap: number | null;
  scrapes: Array<{ x: number; y: number; dir: number; speed: number; seed: number }>;
  /** Where each tip has scored the stone so far (art/eye_shovel.ts `scorePath`): its points with how long ago (seconds). */
  scores: Array<{ seed: number; pts: Array<[number, number, number]> }>;
  hit: { x: number; y: number; s: number } | null;
  /** The end he has come up at (from his burst on: the reeds in the water there are under him, crushed), or none yet. */
  up?: 'left' | 'right' | null;
}
/** WHAT THE GAME DRAWS FOR HIS BODY'S OWN ATTACKS (art/eye_body.ts; the pictures' tool draws it), at frame `f` of the attack. THE BILE
 *  ARC: the warning where it lands (`k` through the wind-up and the flight, 0 to 1; `flare` its gold at the end); the bile welling in his
 *  maw (0 to 1), drooling off him (0 to 1), his gullet's heave (-1 to 1) and how far he has drawn back and up (his lengths); the glob in
 *  flight (the world's, its way, seconds since it left him); the splash and its pool (where, seconds since it landed). THE GAZE: the
 *  arc it sweeps (turning about the water under his eye, `ox`, `oy`; from angle `a0` to `a1`, radians round from straight out over the
 *  stone toward +x; warned from `from` on; `k` through the wind-up; its first side flaring as it fires); the stone darkened in it (0 to
 *  1); the beam (its line now at angle `a`, from where it comes onto the stone to where it leaves it, and where it comes down; seconds
 *  since it fired, how far along the line it has burst, how strong); the scorch (where the beam has passed, from `a0` to `to`, at frame
 *  `f` of the gaze); his eye (its middle, its gaze, how big), its iris's flare (0 to 1), its smoke (seconds since). */
export interface BodyFx {
  kind: 'bile' | 'gaze';
  shot: string;
  f: number;
  warn?: { x: number; y: number; k: number; flare: number };
  well?: number;
  drool?: number;
  heave?: number;
  lunge?: { back: number; drop: number };
  glob?: { x: number; y: number; z: number; vx: number; vy: number; vz: number; s: number };
  splash?: { x: number; y: number; s: number };
  arc?: { ox: number; oy: number; a0: number; a1: number; from: number; k: number; flare: number };
  /** The gaze's arc when it is laid at another place than his (phase 2's) own (art/eye_phase3.ts): where its line turns, toward whom,
   *  its sides, how far out the beam comes down. */
  geo?: { ox: number; oy: number; toward: number; a0: number; a1: number; far: number };
  dark?: number;
  beam?: { sx: number; sy: number; ex: number; ey: number; ax: number; ay: number; a: number; s: number; reach: number; k: number };
  scorch?: { ox: number; oy: number; a0: number; a1: number; to: number; f: number };
  eye?: [number, number, number];
  gaze?: [number, number, number];
  flare?: number;
  swell?: number;
  smoke?: number;
}
/** WHAT THE GAME DRAWS IN HIS PHASE 3 (art/eye_phase3.ts; the pictures' tool draws it). THE PILLARS, the cult's three obelisks (where each
 *  stands, the world's; burning, put out by a piece of the ward-stone set into it, or broken by blows; seconds since it was so; blows
 *  taken; for one broken, which way it falls), and THE LINES of the siege's magic from each into him (`to`, the world's); HIS SHIELD (how
 *  strong, 0 to 1; a blow glancing off it, where and seconds since); THE SIEGE'S BOLTS (where each comes down, the world's; seconds
 *  since it was warned: it strikes `warn` seconds after); THE WARD-STONE PIECE (lying, held in the Warrior's hand, or flying from his
 *  hand into a pillar's foot); THE SLIDE (how hard he heaves, his front against the stone's edge, seconds since it gripped); THE EYE
 *  SLAM (where it comes down, the warning's progress, seconds since it struck, how far the eye is up off the stone); HIS EYE STRUCK
 *  (where, seconds since, blow by blow); the blows the Warrior strikes (where each lands, seconds since). */
export interface P3Fx {
  shot: string;
  f: number;
  pillars: Array<{ x: number; y: number; state: 'dark' | 'lit' | 'out' | 'broken'; s: number; hits: number; to: [number, number, number]; fall?: [number, number]; lit?: number }>;
  shield: { k: number; flash?: { x: number; y: number; z: number; s: number } };
  bolts: Array<{ x: number; y: number; s: number; seed: number; warn: number }>;
  piece?: { x: number; y: number; z: number; held: boolean; set?: number };
  slide?: { heave: number; grip?: number; fwd: number; rise: number; v: number; tear?: number };
  slam?: { x: number; y: number; k: number; flare: number; s: number; lift: number };
  struck?: Array<{ x: number; y: number; z: number; s: number }>;
  blows?: Array<{ x: number; y: number; z: number; s: number; on: 'eye' | 'ward' | 'pillar' }>;
}
/** The Warrior in a frame of the tentacles' films: where (the arena's units: across, and onto the stone from the back of the water),
 *  facing him ('back') or the camera ('front'), standing, running or striking, and the frame of it. */
export interface HeroAt {
  du: number;
  dv: number;
  view: 'back' | 'front';
  act: 'idle' | 'run' | 'attack' | 'roll' | 'knock' | 'down';
  f: number;
  /** Thrown up off the stone (his lengths: knocked flying). */
  lift?: number;
}
export interface EyeFrame {
  move: 'stand' | 'lurk' | 'entrance' | 'p1' | 'p2' | 'fan' | 's1' | 's2' | 'b1' | 'b2' | 'g1' | 'g2' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8';
  /** The tentacles' films: the Warrior, how far the camera has come down from the stills' (picture pixels), and what the game draws
   *  for the tentacles. */
  hero?: HeroAt;
  camY?: number;
  /** The camera moved across (picture pixels; his shovel: following the Warrior to the end of the stone where he is). */
  camX?: number;
  fx?: ArmFx;
  /** What the game draws for his shovel (art/eye_shovel.ts). */
  sfx?: ShovelFx;
  /** What the game draws for his body's own attacks (art/eye_body.ts). */
  bfx?: BodyFx;
  /** What the game draws in his phase 3 (art/eye_phase3.ts). */
  p3?: P3Fx;
  k: number;
  /** His clock (the stand's: 0 at its first frame). */
  t: number;
  jaws: EyeLayer;
  spit: EyeLayer | null;
  tongue: EyeLayer | null;
  arms: Array<EyeLayer | null>;
  /** Arms in their strike (two frames): drawn smeared, with their last frame behind them. */
  smear: Array<EyeLayer | null>;
  shake: [number, number];
  dark: number;
  water: EyeWater;
}

const body = (anim: ColossusAnim, drop = 0, back = 0): ColossusPose => ({ view: 'front', drop, back, body: true, gaze: anim.gaze, arms: [], anim });
const pad = (n: number): string => String(n).padStart(3, '0');
const mod = (a: number, n: number): number => ((a % n) + n) % n;

/** His stand's layers at its frame `k` (0 to 89): for his shovel too (art/eye_shovel.ts), as he sinks out of it and rises into it. */
export const standLayersAt = (k: number): Pick<EyeFrame, 'jaws' | 'spit' | 'tongue' | 'arms'> => standLayers(k);
/** His stand's layers at its frame `k` (0 to 89). */
function standLayers(k: number): Pick<EyeFrame, 'jaws' | 'spit' | 'tongue' | 'arms'> {
  const t = k / EYE_FPS;
  const an = standAnim(t);
  return {
    jaws: { key: `J.s.${pad(k)}`, pose: body({ ...an, parts: 'jaws' }), drop: 0, back: 0 },
    spit: { key: `S.s.${pad(k)}`, pose: body({ ...an, parts: 'spit' }), drop: 0, back: 0 },
    tongue: { key: `T.s.${pad(k)}`, pose: body({ ...an, parts: 'tongue' }), drop: 0, back: 0 },
    arms: [0, 1, 2].map((i) => armStandLayer(i, k)),
  };
}
/** A tentacle alone, a layer of its own; its own clock (in its loop) for its suckers' flexing and its drips. */
export function armLayer(a: ArmPose, t: number): ColossusPose {
  const an: ColossusAnim = { t: mod(t, ARM_LOOP), open: 1, tongue: null, eye: EYE_RISEN, gaze: GAZE_AT_YOU, lids: 1, glow: 1 };
  return { view: 'front', drop: 0, body: false, gaze: GAZE_AT_YOU, arms: [a], anim: an };
}
/** A tentacle's stand layer at frame `k` of its loop (any frame: its loop's frame taken). */
export function armStandLayer(w: number, k: number): EyeLayer {
  const f = mod(k, ARM_STAND_FRAMES);
  return { key: `A${w}.s.${pad(f)}`, pose: armLayer(armStand(w, f / EYE_FPS), f / EYE_FPS), drop: 0, back: 0 };
}
const STILL_WATER: EyeWater = { sunk: 0, pulse: 1, bubbles: 0, swell: 0.15, slicks: 0, boil: 0, rising: false, roar: null, bursts: [] };

/** EVERY FRAME OF HIS MOVES: his stand (0 to 89), his lurk (0 to 89), his entrance (0 to 269). */
export function eyeFrame(move: 'stand' | 'lurk' | 'entrance', k: number): EyeFrame {
  if (move === 'stand') {
    return { move, k, t: k / EYE_FPS, ...standLayers(k), smear: [null, null, null], shake: [0, 0], dark: 0, water: { ...STILL_WATER, bursts: armRoots() } };
  }
  if (move === 'lurk') {
    const t = k / EYE_FPS;
    const at = lurkAt(t);
    return {
      move, k, t,
      jaws: { key: 'J.lurk', pose: body({ ...standAnim(0), open: 1, parts: 'jaws' }), drop: at.drop, back: at.back },
      spit: null,
      tongue: { key: `T.l.${pad(k)}`, pose: tonguePose(lurkTongue(t), t, at), drop: 0, back: 0 },
      arms: [null, null, null],
      smear: [null, null, null],
      shake: [0, 0],
      dark: 0,
      water: { sunk: 1, pulse: lurkPulse(t), bubbles: 0.3, swell: 1, slicks: 1, boil: 0, rising: false, roar: null, bursts: [] },
    };
  }
  // HIS ENTRANCE
  const t = entranceClock(k);
  const at = entranceAt(k);
  const open = entranceOpen(k);
  const glow = entranceGlow(k);
  const tore = entranceClock(E.tear[0]);
  const knit = entranceClock(E.stalk[1]);
  const st = standAnim(t);
  // (his tongue as it is at his entrance: drawn in, or unfurling; his spittle that his tongue holds goes with it)
  const TE = k < E.stalk[1] ? entranceTongue(k) : null;
  const puff = entrancePuff(k);
  const base: ColossusAnim = puff > 0 ? { ...st, open, glow, tore, knit, puff, tongue: null, lids: 0 } : k < E.stalk[1] ? { ...st, open, glow, tore, knit, tongue: TE ? TE.path : null, eye: TE ? TE.eye : st.eye, gaze: TE ? TE.gaze : st.gaze, lids: TE ? TE.lids : 0, roll: TE ? TE.roll : 0, swell: TE ? TE.swell : 1 } : { ...st, open, glow, tore, knit };
  // (his stand's own layers at the frame of it his entrance has come to: it ends on the frame before the stand's first)
  const SL = standLayers(mod(k - E.frames, EYE_STAND.frames));
  // (his jaws: closing under the water in ten steps; the shut mound, painted once, rising; each frame of his strain, his tear and his
  // settling; then his stand's own)
  let jaws: EyeLayer;
  let spit: EyeLayer | null;
  if (k < E.rise[0]) {
    const step = Math.round((1 - open) * 9);
    jaws = step === 0 ? { key: 'J.lurk', pose: body({ ...standAnim(0), open: 1, parts: 'jaws' }), drop: at.drop, back: at.back } : { key: `J.c.${step}`, pose: body({ ...standAnim(entranceClock(E.rise[1])), open: 1 - step / 9, glow: 0.7, tore, knit, parts: 'jaws' }), drop: at.drop, back: at.back };
    spit = null;
  } else if (k < E.strain[0]) {
    const tm = entranceClock(E.strain[0]);
    const mound: ColossusAnim = { ...standAnim(tm), open: 0, glow: entranceGlow(E.strain[0]), tore, knit };
    jaws = { key: 'J.mound', pose: body({ ...mound, parts: 'jaws' }), drop: at.drop, back: at.back };
    spit = { key: 'S.mound', pose: body({ ...mound, parts: 'spit' }), drop: at.drop, back: at.back };
  } else {
    // (from the end of his settling his jaws are his stand's own frames; his spittle once all of it is back on its round)
    // (winding up, shuddering)
    const [sd, sb] = entranceShudder(k);
    jaws = k >= E.settle[1] ? SL.jaws : { key: `J.e.${pad(k)}`, pose: body({ ...base, parts: 'jaws' }), drop: sd, back: sb };
    spit = k >= 240 ? SL.spit : { key: `S.e.${pad(k)}`, pose: body({ ...base, parts: 'spit' }), drop: sd, back: sb };
  }
  // (his tongue)
  let tongue: EyeLayer | null = null;
  if (k >= E.stalk[1]) tongue = SL.tongue;
  else if (TE) tongue = { key: `T.e.${pad(k)}`, pose: { ...body({ ...base, parts: 'tongue' }, k < E.rise[0] ? at.drop : 0, k < E.rise[0] ? at.back : 0), gaze: TE.gaze }, drop: 0, back: 0 };
  // (his tentacles: each its burst, then his stand's)
  const arms: Array<EyeLayer | null> = [];
  const smear: Array<EyeLayer | null> = [];
  for (let i = 0; i < 3; i++) {
    const s = k - E.bursts[i];
    if (s >= E.settleArm) {
      arms.push(SL.arms[i]);
      smear.push(null);
      continue;
    }
    arms.push(armEntrance(i, k));
    // (in its strike, its last frame behind it)
    smear.push(s === 0 || s === 1 ? armEntrance(i, k - 1) : null);
  }
  const rise = sm(E.rise[0], E.rise[1], k);
  const water: EyeWater = {
    sunk: 1 - sm(E.rise[0], E.breaks + 20, k),
    pulse: k < 22 ? lurkPulse(k / EYE_FPS) * (1 - sm(4, 20, k)) : 1,
    bubbles: k < E.rise[0] ? 0.3 + 0.7 * sm(6, 26, k) : k < E.breaks ? 1 : 0.6 * (1 - rise),
    swell: k < E.rise[0] ? 1 + sm(6, 28, k) : 1.6 * (1 - sm(E.breaks, E.rise[1], k)) + 0.15,
    slicks: k < E.rise[0] ? 1 : 1 - sm(E.rise[0], E.breaks, k),
    boil: k < 10 ? 0 : k < E.breaks ? sm(10, 28, k) : 1 - sm(E.breaks, E.rise[1] + 10, k) * 0.85,
    rising: k >= E.rise[0],
    roar: E.tear[0],
    bursts: armRoots(),
  };
  return { move: 'entrance', k, t, jaws, spit, tongue, arms, smear, shake: shakeAt(k), dark: darkAt(k), water };
}
/** A tentacle at a frame of his entrance, before it is his stand's. */
function armEntrance(i: number, k: number): EyeLayer | null {
  const t = entranceClock(k);
  const a = armBurst(i, k - E.bursts[i], t);
  return a ? { key: `A${i}.e.${pad(k)}`, pose: armLayer(a, t), drop: 0, back: 0 } : null;
}
/** Where each tentacle rises (his space, at the water), with its burst frame. */
function armRoots(): Array<{ k: number; x: number; y: number }> {
  return ARMS_RISEN.map((a, i) => ({ k: E.bursts[i], x: a.path[0][0], y: a.path[0][1] }));
}
function tonguePose(T: { path: number[][]; eye: [number, number, number] }, t: number, at: { drop: number; back: number }): ColossusPose {
  const an: ColossusAnim = { t, open: 1, tongue: T.path, eye: T.eye, gaze: [0, 0.87, 0.5], lids: 1, glow: 1, parts: 'tongue' };
  return { view: 'front', drop: at.drop, back: at.back, body: true, gaze: an.gaze, arms: [], anim: an };
}
