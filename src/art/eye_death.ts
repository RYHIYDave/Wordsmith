// THE SWAMP COLOSSUS'S MOVES, PART 6: HIS DEATH (painted by art/eye_colossus.ts, a layer each; a mock-up behind EYE2, off; nothing of the
// game imports it: tests/eye_death.test.ts). The owner, 8 Nov 2026 (by 18:44), shown his phase 3: “Yes, on to his death (Recommended)”;
// asked “How should the Swamp colossus die?”, his pick: “Eye bursts, he melts (Recommended)” (offered as: his eye ruptures in a spray of
// dark ichor; he thrashes and roars, then melts down into black sludge and sinks, the water boiling and going still). His rules:
// Movement 9 (a big held wind-up, a fast smeared strike, a big wind-down), “Action, like a movie”, nothing through anything,
// “Everything drawn should not just look like shapes.  That’s the rule”, nothing ruled; his ichor dark, never cyan.
//
// From his phase-3 place (art/eye_phase3.ts: hauled up against the stone's back edge, his eye low over it), on the killing blow:
//   1. THE KILLING BLOW TAKEN (the wind-up, held): his eye seizes, swelling, veins bulging, its pupil blown wide, his tongue rigid and
//      trembling, the screen trembling.
//   2. THE EYE BURSTS (the strike, two smeared frames): it ruptures, a great spray of his dark ichor and gore over the stone, the screen
//      thrown hard.
//   3. HE THRASHES AND ROARS: his tongue whipping blind, his jaws flexing wide, a last roar, slime and spittle everywhere; his grip on the
//      stone's edge tearing loose, the edge cracking more, and he slides back down off it into the water.
//   4. HE MELTS: all of him slumping and running, going to black sludge (art/eye_colossus.ts `ColossusAnim.melt`), his teeth dropping out,
//      his jaws sagging and folding in, the mound settling; the sludge running off him onto the stone and pouring back off its edge.
//   5. HE SINKS: what is left goes under, the water boiling and heaving, bubbles and slicks, then still and dark; his ichor and sludge on
//      the stone fading; the bones and broken teeth he dropped lying in the shallows.
// His moves are his paintings; the ichor spray, the gore, the sludge on the stone, the splashes, the boiling and the shakes are the game's
// effects drawn over (`DeathFx`: their shapes here, the pictures' tool draws them).

import { toothSpots, meltedAt, TONGUE_RISEN, weaveTongue } from './eye_colossus';
import type { ColossusAnim, ColossusPose } from './eye_colossus';
import { QUAY, STONE_BOX, UNIT } from './eye_arms';
import { EYE_FPS, eyeFrame, standAnim } from './eye_moves';
import type { DeathFx, EyeFrame, EyeLayer, HeroAt } from './eye_moves';
import { TILE, mixPath, tipEye } from './eye_body';
import { H8, P3, P3_TONGUE, camAt, jolt, laid, p3Spit, p3StandTongue, p3Tongue, pillarsAt, toWorld } from './eye_phase3';

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

// =============================================================================================
// THE BEATS (frames from the killing blow landing; 30 a second)

/** HIS DEATH, beat by beat:
 *  - `seize`: THE WIND-UP, HELD (0 to 35, 1.2 s): his eye seizing, swelling, its pupil blown wide, his tongue rigid and trembling.
 *  - `burst`: THE STRIKE (36 and 37, smeared): his eye bursts on frame 36.
 *  - `thrash`: he thrashes, his tongue whipping blind, his jaws flexing wide; `roar` his last roar; his grip on the edge tearing loose on
 *    frame `tear` and him sliding back down off it into the water (`slip`).
 *  - `melt`: THE WIND-DOWN: he melts (0 to 1 across it); his teeth dropping out across `teeth`; `sink` going under; the water boiling
 *    across `boil`, still and dark at `still`; the fight may end at `end` (the victory). `frames` in all. */
export const DEATH = {
  seize: 36,
  burst: 36,
  strike: 2,
  thrash: [38, 100] as const,
  roar: [64, 100] as const,
  tear: 58,
  slip: [58, 100] as const,
  melt: [96, 196] as const,
  teeth: [100, 180] as const,
  sink: [176, 250] as const,
  boil: [170, 300] as const,
  still: 316,
  end: 300,
  frames: 360,
} as const;
/** How far he slides back off the edge as his grip tears loose (his lengths: back, and down), and how deep he sinks (his lengths). */
export const SLIP = { back: 38, down: 44 } as const;
export const SINK = 300;
/** The take (the film's): the Warrior's swing before the blow lands (`lead`), his clock at its first frame. */
export const DEATH_TAKE = { lead: 14, clock: 70, frames: 14 + 360 } as const;

/** Where he is (his middle forward toward the stone, raised, and sunk) at frame `f` of his death (before it: his phase-3 place). */
export function placeAt(f: number): { fwd: number; rise: number; sink: number } {
  const s = sm(DEATH.slip[0], DEATH.slip[1], f);
  // (tearing loose: jerked in three heaves as his grip goes, then sliding)
  const heave = f >= DEATH.slip[0] && f < DEATH.slip[0] + 18 ? 4 * Math.sin(((f - DEATH.slip[0]) * Math.PI) / 6) * (1 - (f - DEATH.slip[0]) / 18) : 0;
  const sink = SINK * sm(DEATH.sink[0], DEATH.sink[1], f) ** 1.3;
  return { fwd: P3.fwd - SLIP.back * s, rise: P3.rise - SLIP.down * s + heave, sink };
}
/** How far he has melted (0 to 1), and how many of his teeth are gone (0 to 1). */
export const meltK = (f: number): number => sm(DEATH.melt[0], DEATH.melt[1], f);
export const teethGone = (f: number): number => clamp01((f - DEATH.teeth[0]) / (DEATH.teeth[1] - DEATH.teeth[0]));
/** His eye seized (0 to 1). */
export const seizeK = (f: number): number => (f < DEATH.burst ? sm(1, 26, f) : 0);

// =============================================================================================
// HIS TONGUE THROUGH IT (his own space, as painted)

/** Rigid, trembling: his tongue drawn up out of its droop and straightened up and out, the eye held high over the edge as it swells. */
const SEIZE_UP: ReadonlyArray<readonly number[]> = [
  [0, -52, 28], [0, -32, 30], [0, -10, 48], [0, 10, 74], [0, 30, 100], [0, 52, 124], [0, 76, 142], [0, 100, 154], [0, 122, 160], [0, 140, 162],
  [0, 154, 160], [0, 164, 156], [0, 170, 152],
].map((q, i) => [q[0], q[1], q[2], TONGUE_RISEN[i][3]]);
/** Whipped up and back as it bursts. */
const BURST_UP: ReadonlyArray<readonly number[]> = SEIZE_UP.map((q, i) => {
  const u = (i / 12) ** 1.5;
  return [q[0], q[1] - 46 * u, q[2] + 26 * u, q[3]];
});
/** Limp, dead: from the root of his V up and out over the front of his maw, arched over his heaps, down over the edge and lying out on
 *  the stone (held clear of it, `deathTongue`). */
const LIMP: ReadonlyArray<readonly number[]> = [
  [0, -52, 28], [0, -30, 30], [0, -6, 46], [2, 20, 62], [4, 48, 70], [6, 76, 70], [8, 104, 64], [10, 130, 54], [12, 154, 40], [14, 176, 22],
  [16, 196, 6], [18, 214, -4], [18, 228, -8],
].map((q, i) => [q[0], q[1], q[2], TONGUE_RISEN[i][3]]);
/** The frame the last of his tongue has run away into the sludge on the stone, stretched in strings over the edge as he goes under. */
export const TONGUE_GONE = DEATH.sink[0] + 24;

/** A path turned about the root of his tongue (about the up), more along it than at its root: a whip. */
function yawed(path: ReadonlyArray<readonly number[]>, yaw: (i: number) => number): number[][] {
  const R = path[0];
  return path.map((q, i) => {
    const a = yaw(i) * (i / 12) ** 1.25;
    const dx = q[0] - R[0];
    const dy = q[1] - R[1];
    return [R[0] + dx * Math.cos(a) + dy * Math.sin(a), R[1] - dx * Math.sin(a) + dy * Math.cos(a), q[2], q[3]];
  });
}
/** HIS TONGUE at frame `f` of his death, his clock `t` (his own space). `stoneZ`: the stone's top in his own space where he is now (his
 *  tongue never below it, over the stone); `edgeY`: the stone's back edge in his own space. */
export function deathTongue(f: number, t: number): number[][] {
  const P = placeAt(f);
  const edgeY = STONE_BOX.y0 - P.fwd;
  const stoneZ = P.sink - P.rise;
  let path: number[][];
  if (f < DEATH.burst) {
    // (THE BLOW TAKEN: jerked back as it is struck, then drawn up rigid, held, trembling harder and harder)
    const jerk = f < 3 ? f / 3 : Math.exp(-(f - 3) / 5);
    const up = sm(3, 30, f);
    const base = mixPath(p3Tongue(t), SEIZE_UP, up);
    path = base.map((q, i) => {
      const u = (i / 12) ** 2;
      const tr = (1 + 3.4 * sm(6, 34, f)) * u;
      return [q[0] + tr * (h1(f, 1101 + i) * 2 - 1), q[1] - 30 * jerk * u + tr * 0.6 * (h1(f, 1131 + i) * 2 - 1), q[2] + 22 * jerk * u + tr * (h1(f, 1161 + i) * 2 - 1), q[3]];
    });
  } else if (f < DEATH.thrash[0]) {
    // (THE BURST: whipped up and back)
    path = mixPath(SEIZE_UP, BURST_UP, f === DEATH.burst ? 0.6 : 1).map((q) => [...q]);
  } else if (f < DEATH.melt[0] + 14) {
    // (THRASHING, BLIND: whipping side to side and up and down, the whip running out along it; slowing, going limp as he melts)
    const g = f - DEATH.thrash[0];
    // (out of the burst's whip into the thrash over its first frames: no leap)
    const into = sm(-1, 12, g);
    const fade = (1 - sm(DEATH.roar[1] - 10, DEATH.melt[0] + 14, f)) * into;
    const lift = 1 - into + into * (0.5 + 0.5 * Math.sin(g * 0.24 + 0.6) * fade);
    const limp = sm(DEATH.roar[1] - 14, DEATH.melt[0] + 14, f);
    const base = mixPath(mixPath(P3_TONGUE, BURST_UP, lift * (1 - limp)), LIMP, limp);
    path = yawed(base, (i) => fade * (0.42 * Math.sin((g - i * 0.9) * 0.18 + 0.3) + 0.16 * Math.sin((g - i * 0.7) * 0.37 + 1.7)));
  } else {
    // (LIMP, MELTING: lying out over the edge on the stone, twitching less and less, running away to sludge from its end back (the
    // sludge left lying on the stone is the game's); the last of it stretched in strings over the edge as he goes under)
    const k = meltK(f);
    path = LIMP.map((q, i) => {
      const u = (i / 12) ** 2;
      const tw = 2 * u * (1 - k) * Math.sin(f * 1.7 + i);
      return [q[0] + tw, q[1], q[2], q[3] * (1 - 0.82 * sm(0.4, 0.95, k) * (i / 12) ** 0.6)];
    });
  }
  // (over the stone, or within its thickness of the edge: never below its top; melting, a little higher, for it settles as it melts)
  const lift0 = 6 + 14 * meltK(f);
  return path.map((q) => (q[1] + q[3] > edgeY - 4 ? [q[0], q[1], Math.max(q[2], stoneZ + q[3] + lift0), q[3]] : q));
}

// =============================================================================================
// HIM, FRAME BY FRAME

/** His jaws through it: flung wide as his eye bursts, flexing as he thrashes, gaping in his last roar, sagging and folding in as he
 *  melts. */
export function deathOpen(f: number, open0: number): number {
  if (f < DEATH.burst) return open0;
  if (f < DEATH.thrash[0]) return lerp(open0, 1.3, f === DEATH.burst ? 0.6 : 1);
  if (f < DEATH.roar[0]) {
    const g = f - DEATH.thrash[0];
    return 1.12 + 0.2 * Math.abs(Math.sin(g * 0.32)) + 0.06 * Math.sin(g * 1.1);
  }
  if (f < DEATH.roar[1]) {
    // (the last roar: flung wide, held, trembling, then failing)
    const g = f - DEATH.roar[0];
    return 1.2 + 0.28 * sm(0, 8, g) - 0.18 * sm(20, 36, g) + 0.03 * Math.sin(g * 2.3);
  }
  return lerp(1.3, 0.84, sm(DEATH.roar[1], DEATH.melt[1] - 10, f));
}
/** His throat's fire: flaring as he dies, roaring, dying out. */
export function deathGlow(f: number, glow0: number): number {
  if (f < DEATH.burst) return glow0 + 0.6 * sm(10, 34, f);
  if (f < DEATH.roar[0]) return 1.8 + 0.4 * Math.sin(f * 0.7);
  if (f < DEATH.roar[1]) return 2.0 - 0.9 * sm(DEATH.roar[0] + 14, DEATH.roar[1], f);
  return 1.2 * (1 - sm(DEATH.roar[1], DEATH.melt[0] + 50, f));
}
/** HIM at frame `f` of his death (his clock `t`): all of him (his anim; `parts` as the layer asks). */
export function deathAnim(f: number, t: number): ColossusAnim {
  const S = standAnim(t);
  const path = deathTongue(f, t);
  const eye = tipEye(path);
  const P = placeAt(f);
  const an: ColossusAnim = {
    ...S,
    open: deathOpen(f, S.open),
    glow: deathGlow(f, S.glow),
    tongue: path,
    eye,
    // (his eye staring, blind: straight out and a little up as it seizes)
    gaze: f < DEATH.burst ? norm([0.04, 0.82, 0.12 + 0.2 * sm(4, 30, f)]) : norm([0.05, 0.9, -0.3]),
    lids: 1,
    swell: f < DEATH.burst ? 1 + 0.42 * sm(3, 34, f) + 0.03 * Math.sin(f * 1.9) * sm(10, 30, f) : 1 - 0.72 * sm(0.4, 0.92, meltK(f)),
  };
  // (gone: run away into the sludge on the stone)
  if (f >= TONGUE_GONE) an.tongue = null;
  if (f < DEATH.burst) an.seize = seizeK(f);
  else an.burst = 1;
  // (his spittle as in his phase 3: torn away long ago by his tongue thrust out through it, never knitting; his drool and drips as ever)
  an.tore = t - 10;
  an.knit = 1e9;
  if (f >= DEATH.melt[0]) an.melt = { k: meltK(f), floor: P.sink - P.rise, teeth: teethGone(f) };
  return an;
}
const pose = (an: ColossusAnim, drop = 0): ColossusPose => ({ view: 'front', drop, back: 0, body: true, gaze: an.gaze, arms: [], anim: an });

/** HIS LAYERS at frame `f` of his death (f < 0: his stand at the edge), his edge stand's clock at the blow `c0` (frames): laid where he is.
 *  Through the wind-up, his stand's jaws and drool and his own tongue (`T.d.###`); from the burst, all of him in one layer (`D.###`),
 *  sinking as he goes under (painted sunk, `pose.drop`, so that what is deep under the water is never painted); the burst's two frames
 *  with the frame before behind them (`smear`). Once he is under, his last layer laid on down. */
export function deathLayers(f: number, c0: number = DEATH_TAKE.clock + DEATH_TAKE.lead): { jaws: EyeLayer; spit: EyeLayer | null; tongue: EyeLayer | null; smear: EyeLayer[]; fwd: number; rise: number } {
  const c = c0 + f;
  const t = c / EYE_FPS;
  const P = placeAt(f);
  if (f < DEATH.burst) {
    const base = eyeFrame('stand', mod(c, 90));
    const tongue = f < 0 ? p3StandTongue(mod(c, 90)) : { key: `T.d.${pad(f)}`, pose: pose({ ...deathAnim(f, t), parts: 'tongue' }), drop: 0, back: 0 };
    return { jaws: laid(base.jaws, P.fwd, P.rise), spit: laid(p3Spit(mod(c, 90)), P.fwd, P.rise), tongue: laid(tongue, P.fwd, P.rise), smear: [], fwd: P.fwd, rise: P.rise };
  }
  const g = Math.min(f, DEATH_GONE);
  const all = (h: number): EyeLayer => {
    const Q = placeAt(h);
    return laid({ key: `D.${pad(h)}`, pose: pose(deathAnim(h, (c0 + h) / EYE_FPS), Q.sink), drop: 0, back: 0 }, Q.fwd, Q.rise);
  };
  const L = all(g);
  // (gone under: his last layer laid on down as the water closes over it)
  if (f > DEATH_GONE) L.drop += (f - DEATH_GONE) * 4;
  const smear = f >= DEATH.burst && f < DEATH.burst + DEATH.strike ? [all(f - 1 >= DEATH.burst ? f - 1 : f)] : [];
  if (f === DEATH.burst) smear[0] = laid({ key: `T.d.${pad(f - 1)}`, pose: pose({ ...deathAnim(f - 1, (c - 1) / EYE_FPS), parts: 'tongue' }), drop: 0, back: 0 }, P.fwd, P.rise);
  return { jaws: L, spit: null, tongue: null, smear, fwd: P.fwd, rise: P.rise };
}
/** The last frame of him painted: past it he is under the water, out of sight. */
export const DEATH_GONE = 250;

// =============================================================================================
// WHERE THINGS ARE (the world's)

/** His eye's middle in the world at frame `f` (before the burst; the burst's sac after). */
export function eyeWorld(f: number, t: number): [number, number, number] {
  const an = deathAnim(f, t);
  const P = placeAt(f);
  const e = an.melt ? meltedAt(an, an.eye as readonly number[]) : (an.eye as readonly number[]);
  const w = toWorld(e, P.fwd, P.rise);
  return [w[0], w[1], w[2] - P.sink];
}
/** HIS TEETH DROPPING OUT: each, the frame it lets go (as `teethGone` passes its share), where it is then (the world's), and which way it
 *  points. */
export function fallingTeeth(c0: number = DEATH_TAKE.clock + DEATH_TAKE.lead): Array<{ f: number; x: number; y: number; z: number; dx: number; dy: number; dz: number; r: number; broken: boolean; seed: number }> {
  const out: Array<{ f: number; x: number; y: number; z: number; dx: number; dy: number; dz: number; r: number; broken: boolean; seed: number }> = [];
  const T0 = toothSpots(deathAnim(DEATH.teeth[0], (c0 + DEATH.teeth[0]) / EYE_FPS));
  for (const T of T0) {
    const f = Math.ceil(DEATH.teeth[0] + T.goneAt * (DEATH.teeth[1] - DEATH.teeth[0]));
    const an = deathAnim(f, (c0 + f) / EYE_FPS);
    const S = toothSpots(an).find((q) => q.side === T.side && q.i === T.i) ?? T;
    const P = placeAt(f);
    const a = meltedAt(an, S.root);
    const b = meltedAt(an, S.tip);
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const w = toWorld(m, P.fwd, P.rise);
    out.push({ f, x: w[0], y: w[1], z: w[2] - P.sink, dx: b[0] - a[0], dy: b[1] - a[1], dz: b[2] - a[2], r: S.r, broken: S.broken, seed: T.side * 100 + T.i });
  }
  return out.sort((p, q) => p.f - q.f);
}
/** Where his front meets the stone's back edge (the world's, across), at frame `f`: where his sludge spills onto the stone and off it. */
export const FRONT: readonly [number, number] = [-150, 150];

// =============================================================================================
// WHAT THE GAME DRAWS (`DeathFx`), AND THE SCREEN

/** THE BURST'S SPRAY (the game's): gobs, drops, strings and a sheet of his dark ichor flung out of his eye as it ruptures, mostly forward
 *  and up over the stone; `n` of each. Its splats lie on the stone `gore` seconds, fading. */
export const SPRAY = { gobs: 80, drops: 220, strings: 9, sheet: 14, gore: 9 } as const;
/** THE SLUDGE on the stone (the game's): running off his front onto the stone and spreading (his lengths round, at its widest), pouring
 *  back off the edge into the water; dried and gone `fade` seconds after he is under. */
export const SLUDGE = { r: 3.4 * TILE, fade: 4 } as const;
// (THE SHAPES of what the game draws as he dies: never ruled, every edge ragged and alive)
const vn1 = (x: number, s: number): number => {
  const i = Math.floor(x);
  const u = x - i;
  const e = u * u * (3 - 2 * u);
  return h1(i, s) + (h1(i + 1, s) - h1(i, s)) * e;
};
const h2 = (i: number, j: number, s: number): number => h1(i * 7919 + j * 104729, s);
const vn2 = (x: number, y: number, s: number): number => {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const u = x - i;
  const v = y - j;
  const a = u * u * (3 - 2 * u);
  const b = v * v * (3 - 2 * v);
  const top = h2(i, j, s) + (h2(i + 1, j, s) - h2(i, j, s)) * a;
  const bot = h2(i, j + 1, s) + (h2(i + 1, j + 1, s) - h2(i, j + 1, s)) * a;
  return top + (bot - top) * b;
};
/** A SPLAT OF HIS ICHOR on the stone (screen pixels from its middle: `al` along the way it flew, `ac` across it), `R` round, `size` its
 *  gob's: how far in (1 its edge): a wet blot, lobed; a tail drawn out ahead of it, wavering, thinning; beads flung beyond. */
export function goreIn(al: number, ac: number, R: number, size: number, seed: number): number {
  const ang = Math.atan2(ac, al);
  const lobe = 1 + 0.2 * Math.sin(ang * 3 + seed) + 0.07 * Math.sin(ang * 7 + seed * 2);
  let inside = Math.hypot(al, ac) / (R * lobe);
  const tl = R * (0.8 + 0.9 * h1(seed, 9214));
  if (al > 0 && al < tl) inside = Math.min(inside, Math.abs(ac + Math.sin(al * 0.5 + seed) * 0.8) / (R * 0.5 * (1 - al / (tl * 1.1)) + 0.5));
  for (let b = 0; b < 5; b++) {
    const bd = R * (1.6 + 1.6 * h1(seed * 5 + b, 9211));
    const ba = (h1(seed * 5 + b, 9212) - 0.5) * (b < 3 ? 1.4 : 5);
    const br = 0.8 + size * 0.3 * h1(seed * 5 + b, 9213);
    inside = Math.min(inside, Math.hypot(al - Math.cos(ba) * bd, ac - Math.sin(ba) * bd) / br);
  }
  return inside;
}
/** HIS SLUDGE ON THE STONE: how far it has run out from the edge (his lengths) at `x` across, `grow` of it (0 to 1): lobed, tongues of it
 *  running out further here and there, most under his front; and its edge creeping, ragged (`d` out, `t` seconds, `r0` its reach there:
 *  where it ends, his lengths). */
export const sludgeReach = (x: number, grow: number): number =>
  SLUDGE.r * grow * (0.25 + 0.55 * vn1(x * 0.011 + 3.7, 9301) + 0.35 * sm(0.6, 0.9, vn1(x * 0.05 + 8.1, 9313))) * Math.max(0, 1 - ((x - 4) / 220) ** 2) + (Math.abs(x - 8) < 34 ? 46 * grow * (1 - Math.abs(x - 8) / 34) : 0);
export const sludgeEdge = (x: number, d: number, t: number, r0: number): number => r0 * (0.86 + 0.28 * vn2(x * 0.06 + t * 0.2, d * 0.03, 9302)) + 6 * (vn1(x * 0.3 + t * 0.5, 9315) - 0.5) + 3 * (vn1(x * 0.9 - t, 9316) - 0.5);

/** THE SCREEN'S SHAKES (game pixels, and how long, frames): the blow; trembling through the wind-up (rising to); the burst (thrown hard);
 *  his thrashing (a rumble); his grip tearing; his last roar; the rumble as he melts and as he goes under. */
export const DEATH_SHAKE = { blow: 5, blowLong: 6, tremble: 3, burst: 14, burstLong: 16, thrash: 3, tear: 7, tearLong: 10, roar: 6, sink: 3 } as const;

/** THE WARRIOR in the film: at the edge before his eye, the killing blow (his swing from frame 2 of the take, landing on `lead`); leaping
 *  back out of the spray as it bursts; backing off to watch him die. */
interface Mark { k: number; x: number; y: number; act?: 'attack' | 'roll'; view?: 'back' | 'front' }
const L0 = DEATH_TAKE.lead;
const DEATH_HERO: Mark[] = [
  { k: 0, x: H8[0], y: H8[1], view: 'back' }, { k: 2, x: H8[0], y: H8[1], act: 'attack', view: 'back' }, { k: L0 + DEATH.burst, x: H8[0], y: H8[1], view: 'back' },
  { k: L0 + DEATH.burst + 1, x: H8[0], y: H8[1], act: 'roll' }, { k: L0 + DEATH.burst + 10, x: H8[0] + 30, y: H8[1] + 62 },
  { k: L0 + DEATH.burst + 10, x: H8[0] + 30, y: H8[1] + 62 }, { k: L0 + DEATH.burst + 22, x: H8[0] + 70, y: H8[1] + 140, view: 'back' },
  { k: DEATH_TAKE.frames, x: H8[0] + 70, y: H8[1] + 140, view: 'back' },
];
export function heroDeath(k: number): { x: number; y: number; act: HeroAt['act']; f: number; lift: number; view: 'back' | 'front' } {
  const M = DEATH_HERO;
  let i = 0;
  while (i < M.length - 1 && k >= M[i + 1].k) i++;
  const a = M[i];
  const b = M[Math.min(M.length - 1, i + 1)];
  const u = b.k > a.k ? clamp01((k - a.k) / (b.k - a.k)) : 0;
  const moving = Math.hypot(b.x - a.x, b.y - a.y) > 1 && b.k > a.k;
  let act: HeroAt['act'] = 'idle';
  if (a.act === 'attack') act = 'attack';
  else if (a.act === 'roll' && moving) act = 'roll';
  else if (moving) act = 'run';
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), act, f: k - a.k, lift: 0, view: a.view ?? 'back' };
}
/** The camera through the take: on his eye and the Warrior for the blow; drawn back for the burst and his thrashing; down onto the edge
 *  as he melts and sinks; on the still water and the stone at the end. */
const CAM: Array<[number, number, number]> = [[0, 0, 70], [L0 + 30, 0, 60], [L0 + 40, 0, 50], [L0 + 96, 0, 50], [L0 + 140, 0, 90], [L0 + 240, 0, 110], [DEATH_TAKE.frames, 0, 110]];

/** A FRAME OF THE FILM'S TAKE of his death (`k` from 0; the blow lands on `DEATH_TAKE.lead`). */
export function deathFrame(k: number): EyeFrame {
  const f = k - DEATH_TAKE.lead;
  const c = DEATH_TAKE.clock + k;
  const t = c / EYE_FPS;
  const base = eyeFrame('stand', mod(c, 90));
  const Ly = deathLayers(f);
  const P = placeAt(f);
  let shake: [number, number] = [0, 0];
  const add = (j: [number, number]): void => {
    shake = [shake[0] + j[0], shake[1] + j[1]];
  };
  add(jolt(f, DEATH_SHAKE.blow, DEATH_SHAKE.blowLong, 151));
  if (f >= 6 && f < DEATH.burst) {
    const a = DEATH_SHAKE.tremble * sm(6, 34, f);
    add([Math.round(a * (h1(f, 152) * 2 - 1)), Math.round(a * (h1(f, 153) * 2 - 1))]);
  }
  add(jolt(f - DEATH.burst, DEATH_SHAKE.burst, DEATH_SHAKE.burstLong, 154));
  if (f >= DEATH.burst + DEATH_SHAKE.burstLong && f < DEATH.roar[0]) add([Math.round(DEATH_SHAKE.thrash * (h1(f, 155) * 2 - 1)), Math.round(DEATH_SHAKE.thrash * (h1(f, 156) * 2 - 1))]);
  add(jolt(f - DEATH.tear, DEATH_SHAKE.tear, DEATH_SHAKE.tearLong, 157));
  if (f >= DEATH.roar[0] && f < DEATH.roar[1]) {
    const a = DEATH_SHAKE.roar * (1 - sm(DEATH.roar[0] + 10, DEATH.roar[1], f));
    add([Math.round(a * (h1(f, 158) * 2 - 1)), Math.round(a * (h1(f, 159) * 2 - 1))]);
  }
  if (f >= DEATH.sink[0] && f < DEATH.sink[1]) {
    const a = DEATH_SHAKE.sink * Math.sin(Math.PI * sm(DEATH.sink[0], DEATH.sink[1], f));
    add([Math.round(a * (h1(f, 160) * 2 - 1)), Math.round(a * (h1(f, 161) * 2 - 1))]);
  }
  const fx: DeathFx = {
    f,
    seize: f >= 0 && f < DEATH.burst ? seizeK(f) : 0,
    thrash: f >= DEATH.thrash[0] ? 1 - sm(DEATH.roar[1] - 6, DEATH.melt[0] + 20, f) : 0,
    melt: f >= DEATH.melt[0] ? meltK(f) : 0,
    fwd: P.fwd,
    rise: P.rise,
    sink: P.sink,
    teeth: fallingTeeth().filter((T) => f >= T.f).map((T) => ({ ...T, s: (f - T.f) / EYE_FPS })),
  };
  if (f >= 0) fx.eye = eyeWorld(Math.min(f, DEATH.burst - 1), (DEATH_TAKE.clock + DEATH_TAKE.lead + Math.min(f, DEATH.burst - 1)) / EYE_FPS);
  if (f >= DEATH.burst) fx.burst = { x: (fx.eye as number[])[0], y: (fx.eye as number[])[1], z: (fx.eye as number[])[2], s: (f - DEATH.burst) / EYE_FPS };
  if (f >= DEATH.tear) fx.tear = (f - DEATH.tear) / EYE_FPS;
  if (f >= DEATH.roar[0]) fx.roar = (f - DEATH.roar[0]) / EYE_FPS;
  if (f >= DEATH.melt[0]) fx.sludge = { k: meltK(f), s: (f - DEATH.melt[0]) / EYE_FPS, gone: f > DEATH.sink[1] ? (f - DEATH.sink[1]) / EYE_FPS : -1 };
  if (f >= DEATH.sink[0]) fx.bones = sm(DEATH.sink[0] + 20, DEATH.sink[1] + 10, f);
  // (the water: churned as he thrashes and slides back into it; boiling and heaving as he goes under; still and dark at the end)
  const boil = f >= DEATH.boil[0] ? Math.sin(Math.PI * sm(DEATH.boil[0], DEATH.boil[1], f)) ** 0.7 : 0;
  const churn = f >= DEATH.thrash[0] && f < DEATH.melt[0] + 40 ? 0.5 * (1 - sm(DEATH.melt[0], DEATH.melt[0] + 40, f)) : 0;
  const water = {
    ...base.water,
    bursts: [],
    at: [0, P.fwd] as [number, number],
    boil: Math.max(boil, churn * 0.6),
    bubbles: Math.max(boil, churn),
    slicks: f >= DEATH.melt[0] ? sm(DEATH.melt[0], DEATH.sink[0], f) * (1 - sm(DEATH.still - 30, DEATH.still + 30, f)) : 0,
    swell: 0.15 + 0.9 * boil,
    sunk: sm(DEATH.sink[0], DEATH.sink[1], f),
    pulse: f < DEATH.burst ? 1 : 0,
  };
  const cam = camAt(CAM, k);
  const h = heroDeath(k);
  return {
    ...base,
    move: 'd1',
    k,
    t,
    jaws: Ly.jaws,
    spit: Ly.spit,
    tongue: Ly.tongue,
    arms: [null, null, null],
    smear: Ly.smear,
    hero: { du: h.x / UNIT, dv: h.y / UNIT - QUAY, view: h.view, act: h.act, f: h.f, lift: h.lift },
    camX: cam[0],
    camY: cam[1],
    shake,
    dark: 0,
    water,
    // (the arena as the fight left it: two of the cult's obelisks put out, one broken; his ward gone; no bolts)
    p3: { shot: 'q8', f, pillars: pillarsAt('q8', 0), shield: { k: 0 }, bolts: [], slide: { heave: f >= DEATH.thrash[0] ? fx.thrash * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.31))) : 0, fwd: P.fwd, rise: P.rise, v: 0, grip: 10 + f / EYE_FPS } },
    dfx: fx,
  };
}

// =============================================================================================
// THE NUMBERS (for the main chat) AND THE SOUND'S CUES

/** The sounds' cues (frames from the killing blow; the sound chat's to make). */
export const DEATH_CUES: ReadonlyArray<{ f: number; what: string }> = [
  { f: 0, what: 'the killing blow lands: a wet, heavy hit; his shriek begins, high and rising' },
  { f: 6, what: 'his eye seizing: a strained, rising whine under a slow, hard heartbeat, the water trembling' },
  { f: DEATH.burst, what: 'THE BURST: a wet, tearing rupture, a great splatter across the stone' },
  { f: DEATH.thrash[0], what: 'thrashing: his tongue whipping and slapping, gurgling, the water churning' },
  { f: DEATH.tear, what: 'his grip tearing loose: stone grinding and cracking, a heavy slide back into the water' },
  { f: DEATH.roar[0], what: 'his last roar: deep, ragged, breaking into a gurgle' },
  { f: DEATH.melt[0], what: 'melting: a long wet sizzle, bubbling, sludge running and pouring off the stone' },
  { f: DEATH.teeth[0], what: 'his teeth dropping out, one by one (each tooth’s frame in `fallingTeeth`): a clack on the stone, a plop in the water' },
  { f: DEATH.sink[0], what: 'going under: a deep gurgle, the water boiling, big bubbles bursting' },
  { f: DEATH.still, what: 'still: silence but for drips; the fen’s own sounds come back' },
];
/** His death's numbers, in the game's tiles and seconds. */
export function deathNumbers(): { seconds: number; burst: number; end: number; slip: [number, number]; sink: number; sludge: number; teeth: number } {
  return {
    seconds: DEATH.frames / EYE_FPS,
    burst: DEATH.burst / EYE_FPS,
    end: DEATH.end / EYE_FPS,
    slip: [SLIP.back / TILE, SLIP.down / TILE],
    sink: SINK / TILE,
    sludge: SLUDGE.r / TILE,
    teeth: fallingTeeth().length,
  };
}
void weaveTongue;
