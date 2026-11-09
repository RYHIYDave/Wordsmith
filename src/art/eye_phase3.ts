// THE SWAMP COLOSSUS'S MOVES, PART 5: HIS PHASE 3 (painted by art/eye_colossus.ts, a layer each; a mock-up behind EYE2, off; nothing of the
// game imports it: tests/eye_phase3.test.ts). The owner, shown his bile arc and his gaze, 8 Nov 2026 (by 14:57): “Yes, on to phase 3
// (Recommended)”. His phase 3, in his words to the main chat (its board, 8 Nov 11:42): “Kill the tentacles, and he slides forward to use
// the eye and you can hit him.  Let’s scratch the tentacles for the third phase, and have strictly eye attacks and spells for the final
// phase?  Does that sound like a good idea?” (he was told yes). The pillars, his of 7 Nov (00:18): “maybe you use them on three pillars
// during the swamp fight to deactive the seige magic”. His rules: Movement 9 (a big held wind-up, a fast smeared strike, a big
// wind-down), “Action, like a movie”, nothing through anything, nowhere safe (“Yes, nowhere safe (Recommended)”), “Everything drawn
// should not just look like shapes.  That’s the rule”, nothing ruled. The friend's glow is cyan; the enemy's pink and gold.
//
// The main chat's rules drawn to (its board, 8 Nov 11:42; src/game/colossus_fight.ts on its branch `colossus`; “Change any number your
// pictures want; the rules follow your frames”), and where the pictures change them:
//   NO TENTACLES in phase 3: the last of them sinking as it begins.
//   HE SLIDES FORWARD (4.0 s, `SLIDE`) in three heaving lunges, and hauls himself up against the stone's back edge, his front gripping it,
//     the edge grinding and cracking, water surging over it. NOTHING THROUGH THE STONE: his heaps would cut into it short of where the main
//     chat put him (his middle 2.8 tiles off the edge), so he stops where they meet it, raised up out of the water (`P3`: his middle 3.67
//     tiles off the edge, 1.53 tiles up). His eye, on its tongue, weaves low over the edge (`P3_TONGUE`): within every hero's reach.
//   HIS STAND THERE (`p3Frame`): his own stand's jaws and drool, laid at his new place; his tongue drooping out of his maw over the edge,
//     the eye weaving low over the stone, never still.
//   THE THREE PILLARS, the cult's obelisks (art/floor10.ts `cultObelisk`), where the arena's plan put them: off the stone's two ends and
//     off its near edge (`PILLARS`). Dark until his phase 3 begins; then they blaze with the siege's pink fire, a line of its magic from
//     each into him, and while any one burns he is shielded (`SHIELD`: a ward of the siege's pink round him, blows flash and glance off
//     it). Put out by a piece of the ward-stone set into its foot (the friend's cyan, its line going dark); or broken by 12 blows at its
//     foot (cracking with each, toppling, its line snapping).
//   THE SIEGE'S BOLTS (`RAIN`): while any pillar burns, three every 2.6 s, each warned 1.1 s, hurting within a tile: the first where the
//     Warrior stands, the others round him.
//   HIS EYE'S TWO ATTACKS: THE EYE SLAM (`SLAM`) and THE GAZE (art/eye_body.ts, from his new place). HIS EYE STRUCK (`STRUCK`), and a
//     blow glancing off his ward.
// The takes (`P3_TAKES`), each the Warrior playing it: q1 the slide; q2 shielded, a blow glancing off, the left pillar put out; q3 the
// right pillar broken; q4 the near pillar put out and his shield broken; q5 the slam, just clear; q6 the slam, lying, struck; q7 the
// gaze from his new place; q8 his eye struck.

import { STONE, TONGUE_RISEN, weaveTongue } from './eye_colossus';
import type { ColossusAnim, ColossusPose } from './eye_colossus';
import { QUAY, STONE_BOX, UNIT } from './eye_arms';
import { EYE_FPS, eyeFrame, standAnim } from './eye_moves';
import type { BodyFx, EyeFrame, EyeLayer, HeroAt, P3Fx } from './eye_moves';
import { BEAM, BODY_SHAKE, GAZE, GAZE_FIRE, GAZE_LIM, GAZE_OUT, GAZE_SWEPT, TILE, aimedTongue, beamAngle, beamLine, beamOn, eyeAngle, gazeFlare, gazeLids, gazeSwell, mixPath, tipEye } from './eye_body';
import type { GazeArc } from './eye_body';

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
/** Seconds to frames. */
const fr = (s: number): number => Math.round(s * EYE_FPS);

// =============================================================================================
// HIS PLACE IN PHASE 3

/** WHERE HE STOPS: his middle this far forward toward the stone (his lengths) from his place, and raised this far up out of the water:
 *  as far as he can come before his heaps would cut into the stone's back edge, hauled up against it, his front gripping it. */
export const P3 = { fwd: 166, rise: 60 } as const;
/** His tongue drooping out of his maw over the edge in phase 3 (his own space, as painted: x y z and how thick): up out of the bottom of
 *  his V, arching forward over the front of it, down in front of him to the eye, low over the stone. */
export const P3_TONGUE: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -52, 28], [0, -30, 24], [2, -6, 34], [2, 18, 58], [0, 42, 84], [0, 70, 102], [0, 98, 108], [0, 126, 100], [0, 150, 82], [0, 168, 62],
  [0, 180, 44], [0, 188, 32], [0, 192, 28],
].map((q, i) => [q[0], q[1], q[2], TONGUE_RISEN[i][3]] as [number, number, number, number]);
/** His tongue as he stands in phase 3 at his clock `t`: woven as his stand's is (a little less, low over the stone). */
export const p3Tongue = (t: number): number[][] => weaveTongue(P3_TONGUE, t, 0.85);
/** From his own space (as painted) to the world's at his place in phase 3, and back. */
export const toWorld = (p: readonly number[], fwd: number = P3.fwd, rise: number = P3.rise): [number, number, number] => [p[0], p[1] + fwd, p[2] + rise];
export const toHis = (p: readonly number[]): [number, number, number] => [p[0], p[1] - P3.fwd, p[2] - P3.rise];
/** Where his eye looks as he stands: down at the Warrior, wherever he is (the world's). */
export function lookAt(eye: readonly number[], at: readonly number[] | null): [number, number, number] {
  if (!at) return norm([0.05, 0.9, -0.35]);
  const w = toWorld(eye);
  return norm([at[0] - w[0], at[1] - w[1], 30 - w[2]]);
}
const body = (an: ColossusAnim): ColossusPose => ({ view: 'front', drop: 0, back: 0, body: true, gaze: an.gaze, arms: [], anim: an });
/** His stand's frame at frame `k` of a take: his clock runs on through every take. */
const standK = (k: number): number => mod(k, 90);
/** A layer laid at his place in phase 3 (forward `fwd`, raised `rise`). */
export const laid = (L: EyeLayer, fwd: number, rise: number, jolt: readonly number[] = [0, 0]): EyeLayer => ({ ...L, back: L.back - fwd - jolt[0], drop: L.drop - rise - jolt[1] });

// =============================================================================================
// THE SLIDE

/** THE SLIDE (frames of it): three heaving lunges forward (`lunges`: each its first and last frame and how much of the way), rising up out
 *  of the water through the last as his front comes up against the stone's back edge (`rise`), gripping it on frame `grip`; `frames` in
 *  all (4.0 s, the main chat's). His tongue drawn down into its droop over the edge through the last lunge (`tongue`). */
export const SLIDE = { frames: 120, lunges: [[4, 30, 0.36], [42, 68, 0.34], [78, 104, 0.3]] as const, rise: [62, 102] as const, grip: 103, tongue: [80, 119] as const, tear: 112 } as const;
/** How far forward and how far up he is at frame `f` of the slide; how hard he heaves (0 to 1); how fast he comes on (his lengths a frame). */
export function slideAt(f: number): { fwd: number; rise: number; heave: number; v: number } {
  let fwd = 0;
  let heave = 0;
  let dip = 0;
  for (const [a, b, w] of SLIDE.lunges) {
    const u = sm(a, b, f);
    fwd += w * u;
    const h = f > a && f < b ? Math.sin((Math.PI * (f - a)) / (b - a)) : 0;
    heave = Math.max(heave, h);
    if (b < SLIDE.lunges[2][1]) dip += 7 * h;
  }
  const rise = P3.rise * sm(SLIDE.rise[0], SLIDE.rise[1], f);
  const n = (g: number): number => SLIDE.lunges.reduce((s, [a, b, w]) => s + w * sm(a, b, g), 0) * P3.fwd;
  return { fwd: fwd * P3.fwd, rise: rise - dip, heave, v: n(f + 1) - n(f) };
}

// =============================================================================================
// THE EYE SLAM (the main chat's EYE_SLAM: warned 28 frames, the hit on frame 28, lying to 2.2 s, back up by 2.8 s, 1.5 tiles round)

/** Its beats (frames from its first): the wind-up, held (the eye reared up and back, the warning on the stone where it will come down,
 *  where the Warrior stands); the strike, two frames (smeared: whipped over and slammed down, the hit on frame `hit`); lying on the stone
 *  to `up` (twitching, its lids clenched, slime pooling: the time to strike it); dragged back up into his stand by `frames`. How far it
 *  hurts round where it comes down (his lengths), and how far from where his eye weaves it can reach (`reach`, his lengths: his tongue
 *  stretched at most 1.62 times its length, straight out ahead; 1.37 for the slam painted here). */
export const SLAM = { wind: 27, strike: 2, hit: 28, up: 66, frames: 84, r: 1.5 * TILE, reach: 4 * TILE, rear: 16 } as const;
/** How much of its height the slam's rearing keeps (above his maw's floor). */
const REAR_LOW = 0.8;
/** The eye reared up and back over his maw through the slam's wind-up (his own space). */
const SLAM_REAR: ReadonlyArray<readonly number[]> = [
  [0, -52, 28], [0, -30, 24], [2, -6, 36], [4, 12, 62], [6, 22, 92], [6, 24, 122], [4, 18, 148], [0, 8, 166], [-2, -6, 176], [-2, -20, 180],
  [0, -32, 180], [0, -40, 177], [0, -46, 173],
  // (lowered by a quarter above his maw's floor: reared high, but kept within the screen with the stone it slams down on)
].map((q, i) => [q[0], q[1], q[2] > 36 ? 36 + (q[2] - 36) * REAR_LOW : q[2], TONGUE_RISEN[i][3]]);
/** A point on a cubic curve. */
const bez = (a: readonly number[], b: readonly number[], c: readonly number[], d: readonly number[], u: number): number[] => [0, 1, 2].map((i) => (1 - u) ** 3 * a[i] + 3 * (1 - u) ** 2 * u * b[i] + 3 * (1 - u) * u * u * c[i] + u ** 3 * d[i]);
/** THE TONGUE LYING OVER THE EDGE (his own space), the eye slammed down on the stone at `at` (the world's): up out of his V, arched high
 *  over the stone's back edge, down onto the stone; thinner as it is stretched. */
export function slamLying(at: readonly number[]): number[][] {
  const tip = toHis([at[0], at[1], SLAM_EYE_Z]);
  tip[2] -= 12;
  tip[0] -= 4;
  const R: number[] = [0, -52, 28];
  const c1 = [0, 30, 170];
  const c2 = [tip[0] * 0.55, tip[1] - 70, 120];
  const pts: number[][] = [];
  for (let i = 0; i < 13; i++) {
    const u = (i / 12) ** 0.85;
    pts.push(bez(R, c1, c2, tip, u));
  }
  const L = pts.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1], q[2] - pts[i - 1][2]) : 0), 0);
  const thin = Math.max(0.78, Math.min(1, TONGUE_LEN / L) ** 0.5);
  return pts.map((q, i) => [q[0], q[1], q[2], TONGUE_RISEN[i][3] * (i < 2 ? 1 : thin)]);
}
/** How high his eye's middle lies on the stone, slammed down (the world's: its underside just on it). */
export const SLAM_EYE_Z = 36;
/** His tongue's length as it droops in phase 3 (his lengths, along its spine). */
export const TONGUE_LEN = P3_TONGUE.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - P3_TONGUE[i - 1][0], q[1] - P3_TONGUE[i - 1][1], q[2] - P3_TONGUE[i - 1][2]) : 0), 0);
/** His eye's lids through the slam: narrowed in the wind-up, clenched as it hits and lies, opening as it comes back up. */
const slamLids = (f: number): number => (f < SLAM.wind ? 1 - 0.45 * sm(4, 14, f) : f < SLAM.up ? 0.12 : lerp(0.12, 1, sm(SLAM.up, SLAM.frames - 4, f)));

/** HIM IN FRAME `f` OF THE EYE SLAM at `at` (the world's), his clock `t`; struck by the Warrior on the frames `hits` as it lies. */
export function slamAnim(f: number, t: number, at: readonly number[], hits: readonly number[] = []): ColossusAnim {
  const S = standAnim(t);
  const stand = p3Tongue(t);
  const lie = slamLying(at);
  const rear = weaveTongue(SLAM_REAR, t, 0.25);
  let path: number[][];
  if (f < SLAM.wind) {
    // (reared up and back in half a second, then held, quivering, cocked further as it is held)
    const w = sm(0, SLAM.rear, f);
    path = mixPath(stand, rear, w).map((q, i) => {
      const u = (i / 12) ** 2;
      const shiv = sm(10, 18, f) * 2.2 * u;
      return [q[0] + shiv * (h1(f, 901 + i) * 2 - 1), q[1] - 10 * u * sm(12, SLAM.wind, f), q[2] + 6 * u * sm(12, SLAM.wind, f) + shiv * (h1(f, 931 + i) * 2 - 1), q[3]];
    });
  } else if (f < SLAM.hit) {
    // (whipped over: most of the way down, flung forward and high, out before his jaws)
    path = mixPath(rear, lie, 0.7).map((q, i) => {
      const u = i / 12;
      return [q[0], q[1] + 30 * Math.sin(Math.PI * u), q[2] + 50 * Math.sin(Math.PI * u) + 30 * u * u, q[3]];
    });
  } else if (f < SLAM.up) {
    // (lying, twitching: a shudder in the last of it; jolted where it is struck)
    path = lie.map((q, i) => {
      const u = (i / 12) ** 2;
      const tw = (f < SLAM.hit + 4 ? 2.5 : 1.2) * u;
      let jx = tw * (h1(f, 961 + i) * 2 - 1);
      let jz = Math.max(0, tw * (h1(f, 991 + i) * 2 - 1));
      for (const hf of hits) {
        const g = f - hf;
        if (g >= 0 && g < 8) {
          const e = g < 2 ? 1 : Math.exp(-(g - 2) / 2.2);
          jx += 9 * e * u * (g % 2 ? -1 : 1);
          jz += 10 * e * u;
        }
      }
      return [q[0] + jx, q[1], q[2] + jz, q[3]];
    });
  } else {
    // (dragged back up: lifted off the stone, drawn back over the edge into its droop)
    const w = sm(SLAM.up, SLAM.frames - 1, f);
    path = mixPath(lie, stand, w).map((q, i) => {
      const u = (i / 12) ** 1.5;
      return [q[0], q[1], q[2] + 34 * Math.sin(Math.PI * w) * u, q[3]];
    });
  }
  const eye = tipEye(path);
  let lids = slamLids(f);
  for (const hf of hits) if (f >= hf && f < hf + 6) lids = 0.02;
  const gaze = f >= SLAM.hit && f < SLAM.up ? norm([0.1, 0.85, -0.5]) : lookAt(eye, f < SLAM.hit ? at : null);
  return { ...S, tongue: path, eye, gaze, lids, swell: f >= SLAM.hit && f < SLAM.hit + 3 ? 0.9 : 1 };
}

// =============================================================================================
// HIS EYE STRUCK

/** HIS EYE STRUCK as it weaves (frames from the blow): a big flinch, jerked up and back, its lids clenched, shuddering; back into its
 *  weave by `frames`. Its dark ichor spurting is the game's. */
export const STRUCK = { frames: 20, back: 34, up: 30 } as const;
export function struckAnim(f: number, t: number, at: readonly number[] | null): ColossusAnim {
  const S = standAnim(t);
  const e = f < 0 ? 0 : f < 3 ? f / 3 : Math.exp(-(f - 3) / 4.5);
  const path = p3Tongue(t).map((q, i) => {
    const u = (i / 12) ** 2;
    const sh = f >= 0 && f < 10 ? 2.5 * u * (h1(f, 1001 + i) * 2 - 1) : 0;
    return [q[0] + sh, q[1] - STRUCK.back * e * u, q[2] + STRUCK.up * e * u + sh, q[3]];
  });
  const eye = tipEye(path);
  const lids = f >= 0 && f < 6 ? 0.05 : f < 14 ? lerp(0.05, 1, sm(6, 14, f)) : 1;
  return { ...S, tongue: path, eye, gaze: lookAt(eye, at), lids, swell: f >= 0 && f < 3 ? 0.88 : 1 };
}

// =============================================================================================
// THE PILLARS, HIS SHIELD, THE SIEGE'S BOLTS

/** THE CULT'S THREE OBELISKS (the world's: where each foot stands, off the stone's left end, its right end and its near edge, as the
 *  arena's plan has them) and where each one's line of the siege's magic goes into him (his own space: deep in his left heap, his right,
 *  the foot of his left jaw: each line seen going into him, hidden where it meets him; the near one's clear of his eye as it droops
 *  and of the Warrior striking at it). Each is 151 of his lengths to the fire at its point (art/floor10.ts `cultObelisk`). */
export const PILLARS = [
  { id: 'left', x: STONE_BOX.x0 - 0.9 * TILE, y: STONE_BOX.y0 + 0.55 * (STONE_BOX.y1 - STONE_BOX.y0), to: [-210, -20, 30] },
  { id: 'right', x: STONE_BOX.x1 + 0.9 * TILE, y: STONE_BOX.y0 + 0.55 * (STONE_BOX.y1 - STONE_BOX.y0), to: [210, -20, 30] },
  { id: 'near', x: 0, y: STONE_BOX.y1 + 0.9 * TILE, to: [-150, 40, 20] },
] as const;
export const PILLAR_TOP = 151;
/** Blows that break one (the main chat's PILLARS.blows). */
export const PILLAR_BLOWS = 12;
/** HIS SHIELD (while any pillar burns): coming on as they blaze (`on` frames), broken with the last (`off` frames). */
export const SHIELD = { on: 20, off: 24 } as const;
/** THE SIEGE'S BOLTS (the main chat's RAIN): three every `every` frames, each warned `warn` frames, hurting within `r` (his lengths); the
 *  first where the Warrior stands, the others `near` to `far` round him. */
export const RAIN = { every: fr(2.6), n: 3, warn: fr(1.1), r: 1.0 * TILE, near: 1.5 * TILE, far: 3.5 * TILE } as const;
/** A bolt's way down out of the sky (the world's: across and deep for each of his lengths it falls): coming down from in front of him and a
 *  little to the left, so that none passes through him (his eye droops over where the Warrior stands). */
export const BOLT_SLANT = [-0.15, 0.6] as const;
/** How fast a pillar's fire dies once a piece is set in it, and its line goes dark (frames). */
export const PILLAR_OUT = 30;
/** A broken one's shaft toppling (frames, from the blow that breaks it), and where it lands. */
export const TOPPLE = { frames: 14 } as const;

// =============================================================================================
// THE TAKES

export type P3Shot = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8';
export const P3_SHOTS: readonly P3Shot[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
/** Each take: its frames; where his move in it begins (`at`); the stand's clock at its first frame (`clock`). */
export const P3_TAKES: Record<P3Shot, { frames: number; at: number; clock: number }> = {
  q1: { frames: 204, at: 24, clock: 0 },
  q2: { frames: 150, at: 0, clock: 20 },
  q3: { frames: 196, at: 0, clock: 40 },
  q4: { frames: 104, at: 0, clock: 60 },
  q5: { frames: 120, at: 10, clock: 30 },
  q6: { frames: 120, at: 10, clock: 30 },
  q7: { frames: 124, at: 10, clock: 45 },
  q8: { frames: 64, at: 2 + 12, clock: 70 },
};
/** In q3, the cut: blows 3 to 10 left out of the film (their cracks there after it). */
export const Q3_CUT = 80;

/** THE WARRIOR'S WAY through a take (his lengths, the world's), by frame: where he is from each mark to the next (running evenly); what he
 *  does from a mark (`attack`: a blow, its clip from that frame; `knock`: thrown flying to the next mark; `down`; `leap`: leaping out of
 *  the way); which way he faces (`back`, toward him; `front`, toward you). */
interface Mark { k: number; x: number; y: number; act?: 'attack' | 'knock' | 'down' | 'roll'; view?: 'back' | 'front' }
/** Where the Warrior's blow lands in his attack (frames into it). */
export const BLOW_AT = 12;
const E0: [number, number] = [40, 352];
const PIECE_AT: [number, number] = [-170, 430];
const LS: [number, number] = [PILLARS[0].x + 52, PILLARS[0].y - 6];
const RS: [number, number] = [PILLARS[1].x - 52, PILLARS[1].y - 6];
/** Where the Warrior comes from to the right pillar. */
const RS0: [number, number] = [PILLARS[1].x - 52 - 160, PILLARS[1].y - 36];
const NS: [number, number] = [PILLARS[2].x + 56, PILLARS[2].y - 34];
/** Where the slam comes down (both takes: where the Warrior stands as it begins). */
export const SLAM_AT: [number, number] = [34, 440];
const SLAM_CLEAR: [number, number] = [SLAM_AT[0] + 82, SLAM_AT[1] + 12];
/** Beside the eye as it lies (clear of it), where the Warrior strikes it. */
const SLAM_BY: [number, number] = [SLAM_AT[0] + 74, SLAM_AT[1] + 26];
const G7: [number, number] = [-40, 420];
export const H8: [number, number] = [24, 344];
export const P3_HERO: Record<P3Shot, Mark[]> = {
  // (the slide: he stands back from the edge, watching him come)
  q1: [{ k: 0, x: 60, y: 470 }, { k: 204, x: 60, y: 470 }],
  // (shielded: a blow at the eye glancing off his ward; off to the piece of the ward-stone lying on the stone, picked up; to the left
  // pillar, the piece set in its foot; away out of the bolts' way)
  q2: [
    { k: 0, x: E0[0], y: E0[1], view: 'back' }, { k: 2, x: E0[0], y: E0[1], act: 'attack', view: 'back' }, { k: 31, x: E0[0], y: E0[1], view: 'back' },
    { k: 60, x: PIECE_AT[0] + 14, y: PIECE_AT[1] - 6 }, { k: 70, x: PIECE_AT[0] + 14, y: PIECE_AT[1] - 6 }, { k: 95, x: LS[0], y: LS[1], view: 'back' },
    { k: 110, x: LS[0], y: LS[1], view: 'back' }, { k: 121, x: LS[0] + 32, y: LS[1] + 80 }, { k: 150, x: LS[0] + 32, y: LS[1] + 80 },
  ],
  // (the right pillar: running in, two blows; the cut (blows 3 to 10); the eleventh, a leap out of a bolt's way and back, the twelfth: it
  // cracks across and topples into the water; he steps back)
  q3: [
    { k: 0, x: RS0[0], y: RS0[1] }, { k: 20, x: RS[0], y: RS[1], view: 'back' }, { k: 20, x: RS[0], y: RS[1], act: 'attack', view: 'back' },
    { k: 49, x: RS[0], y: RS[1], act: 'attack', view: 'back' }, { k: 78, x: RS[0], y: RS[1], view: 'back' },
    { k: Q3_CUT, x: RS[0], y: RS[1], act: 'attack', view: 'back' }, { k: 109, x: RS[0], y: RS[1], act: 'roll' }, { k: 117, x: RS[0] - 70, y: RS[1] + 46 },
    { k: 118, x: RS[0] - 70, y: RS[1] + 46 }, { k: 129, x: RS[0], y: RS[1], view: 'back' }, { k: 129, x: RS[0], y: RS[1], act: 'attack', view: 'back' },
    { k: 158, x: RS[0], y: RS[1], view: 'back' }, { k: 172, x: RS[0] - 110, y: RS[1], view: 'back' }, { k: 196, x: RS[0] - 110, y: RS[1], view: 'back' },
  ],
  // (the near pillar: running down to it, a piece set in its foot; the last goes dark, and his ward breaks)
  q4: [{ k: 0, x: NS[0] + 20, y: NS[1] - 175 }, { k: 22, x: NS[0], y: NS[1], view: 'front' }, { k: 104, x: NS[0], y: NS[1], view: 'front' }],
  // (the slam, just clear: going as it hits, out of the warning by the frame it comes down)
  q5: [{ k: 0, x: SLAM_AT[0], y: SLAM_AT[1], view: 'back' }, { k: 10 + 18, x: SLAM_AT[0], y: SLAM_AT[1], view: 'back' }, { k: 10 + 28, x: SLAM_CLEAR[0], y: SLAM_CLEAR[1] }, { k: 120, x: SLAM_CLEAR[0], y: SLAM_CLEAR[1], view: 'back' }],
  // (the slam, struck as it lies: clear by a leap, then in at it, two blows)
  q6: [
    { k: 0, x: SLAM_AT[0], y: SLAM_AT[1], view: 'back' }, { k: 10 + 16, x: SLAM_AT[0], y: SLAM_AT[1], act: 'roll' }, { k: 10 + 26, x: SLAM_CLEAR[0], y: SLAM_CLEAR[1] },
    { k: 10 + 28, x: SLAM_CLEAR[0], y: SLAM_CLEAR[1] }, { k: 10 + 34, x: SLAM_BY[0], y: SLAM_BY[1], view: 'back' },
    { k: 10 + 34, x: SLAM_BY[0], y: SLAM_BY[1], act: 'attack', view: 'back' }, { k: 10 + 50, x: SLAM_BY[0], y: SLAM_BY[1], act: 'attack', view: 'back' },
    { k: 10 + 79, x: SLAM_BY[0], y: SLAM_BY[1], view: 'back' }, { k: 120, x: SLAM_BY[0], y: SLAM_BY[1], view: 'back' },
  ],
  // (the gaze from his new place: out of its arc at once, away from the side it starts)
  q7: [{ k: 0, x: G7[0], y: G7[1], view: 'back' }],
  // (his eye struck: at the edge before it, a blow)
  q8: [{ k: 0, x: H8[0], y: H8[1], view: 'back' }, { k: 2, x: H8[0], y: H8[1], act: 'attack', view: 'back' }, { k: 31, x: H8[0], y: H8[1], view: 'back' }, { k: 64, x: H8[0], y: H8[1], view: 'back' }],
};
/** The frames the Warrior's blows land in each take (and on what). */
export function blowsOf(shot: P3Shot): Array<{ k: number; on: 'eye' | 'ward' | 'pillar' }> {
  const on = shot === 'q2' ? 'ward' : shot === 'q3' ? 'pillar' : 'eye';
  return P3_HERO[shot].filter((m) => m.act === 'attack').map((m) => ({ k: m.k + BLOW_AT, on }));
}

/** THE GAZE FROM HIS NEW PLACE (q7): its arc laid from under his eye there, toward the Warrior where he stands as it begins. */
let ARC3: GazeArc | null = null;
export function gazeArc3(): GazeArc {
  if (ARC3) return ARC3;
  const e = toWorld(tipEye(aimedTongue(0, 0, 0)));
  const toward = Math.atan2(G7[0] - e[0], G7[1] - e[1]);
  const h = (GAZE.half * Math.PI) / 180;
  ARC3 = { ox: e[0], oy: e[1], toward, a0: toward - h, a1: toward + h, far: Math.hypot(G7[0] - e[0], G7[1] - e[1]) };
  return ARC3;
}
/** How far into the gaze his tongue is (0 his droop, 1 reared to aim): reared up over his first 16 frames (from low over the stone it has
 *  further to go than at his place), back down after the beam is out. */
export const gazeQ3 = (f: number): number => sm(0, 16, f) * (1 - sm(GAZE_OUT + 1, GAZE.frames - 3, f));
/** His tongue through the gaze from his new place: reared up out of its droop to aim (and back down into it), carried out before his jaws
 *  as it goes (his own space). */
export function gazePath3(f: number, t: number, a: number): number[][] {
  const q = gazeQ3(f);
  const out = Math.sin(Math.PI * q);
  return mixPath(p3Tongue(t), aimedTongue(a, t, f), q).map((p, i) => {
    const u = (i / 12) ** 2;
    return [p[0], p[1] + 34 * out * u, p[2] + 26 * out * u, p[3]];
  });
}
/** The gaze's Warrior: off at once out of the arc toward the side it ends, to just past where it stops. */
let G7_MARKS: Mark[] | null = null;
function gazeMarks(): Mark[] {
  if (G7_MARKS) return G7_MARKS;
  const A = gazeArc3();
  const lat = BEAM.w / 2 + 0.3 * TILE + 0.3 * TILE;
  const d = Math.hypot(G7[0] - A.ox, G7[1] - A.oy);
  const C: [number, number] = [A.ox + Math.sin(A.a1) * d + Math.cos(A.a1) * lat, A.oy + Math.cos(A.a1) * d - Math.sin(A.a1) * lat];
  const n = Math.ceil(Math.hypot(C[0] - G7[0], C[1] - G7[1]) / 8);
  const go = 10 + 6;
  G7_MARKS = [{ k: 0, x: G7[0], y: G7[1], view: 'back' }, { k: go, x: G7[0], y: G7[1], view: 'back' }, { k: go + n, x: C[0], y: C[1] }, { k: 124, x: C[0], y: C[1], view: 'back' }];
  return G7_MARKS;
}
const marksOf = (shot: P3Shot): Mark[] => (shot === 'q7' ? gazeMarks() : P3_HERO[shot]);
/** Where the Warrior is in frame `k` of a take (the world's), and what he does. */
export function heroP3(shot: P3Shot, k: number): { x: number; y: number; act: HeroAt['act']; f: number; lift: number; view: 'back' | 'front' } {
  const M = marksOf(shot);
  let i = 0;
  while (i < M.length - 1 && k >= M[i + 1].k) i++;
  const a = M[i];
  const b = M[Math.min(M.length - 1, i + 1)];
  const u = b.k > a.k ? clamp01((k - a.k) / (b.k - a.k)) : 0;
  const x = lerp(a.x, b.x, u);
  const y = lerp(a.y, b.y, u);
  const moving = Math.hypot(b.x - a.x, b.y - a.y) > 1 && b.k > a.k;
  let act: HeroAt['act'] = 'idle';
  if (a.act === 'attack') act = 'attack';
  else if (a.act === 'roll' && moving) act = 'roll';
  else if (moving) act = 'run';
  const view = a.view ?? (moving && b.y > a.y + 0.5 ? 'front' : 'back');
  return { x, y, act, f: k - a.k, lift: 0, view };
}
const heroAt = (shot: P3Shot, k: number): HeroAt => {
  const h = heroP3(shot, k);
  return { du: h.x / UNIT, dv: h.y / UNIT - QUAY, view: h.view, act: h.act, f: h.f, lift: h.lift };
};

/** THE SIEGE'S BOLTS in a take: each volley's frame (`warn`, when they are warned), where each comes down (the first where the Warrior
 *  stands then, the others round him). None once the last pillar is out. */
export function boltsOf(shot: P3Shot): Array<{ x: number; y: number; warn: number; seed: number }> {
  const first: Partial<Record<P3Shot, number>> = { q2: 6, q3: 8, q4: 10 };
  const k0 = first[shot];
  if (k0 === undefined) return [];
  const out: Array<{ x: number; y: number; warn: number; seed: number }> = [];
  const T = P3_TAKES[shot].frames;
  for (let v = 0, k = k0; k < T; v++, k += RAIN.every) {
    // (none after the last pillar is out)
    if (shot === 'q4' && k > Q4_SET) break;
    const h = heroP3(shot, k);
    out.push({ x: h.x, y: h.y, warn: k, seed: v * 3 });
    // (the others round where he was; in the pictures, where he has gone by the time they strike is clear of them: he dodges them)
    const then = heroP3(shot, Math.min(T - 1, k + RAIN.warn));
    for (let n = 1; n < RAIN.n; n++) {
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 6; tries++) {
        const a = TAU * (h1(v * 7 + n, shot.charCodeAt(1) * 31) + n / RAIN.n + tries * 0.2);
        const d = lerp(RAIN.near, RAIN.far, h1(v * 11 + n, shot.charCodeAt(1) * 37 + 1));
        // (on the stone, or the water just off it)
        x = Math.max(STONE_BOX.x0 - 20, Math.min(STONE_BOX.x1 + 20, h.x + Math.cos(a) * d));
        y = Math.max(STONE_BOX.y0 + 20, Math.min(STONE_BOX.y1 + 20, h.y + Math.sin(a) * d * 0.8));
        if (Math.hypot(x - then.x, y - then.y) > RAIN.r + 0.3 * TILE + 0.3 * TILE && Math.hypot(x - h.x, y - h.y) > RAIN.near * 0.75) break;
      }
      out.push({ x, y, warn: k, seed: v * 3 + n });
    }
  }
  return out;
}

/** In q2: the piece of the ward-stone lying, picked up (frames), carried, set into the left pillar's foot (it leaves his hand, lands). */
export const Q2_PIECE = { pick: [60, 70] as const, throw: 100, set: 108 } as const;
/** In q4: a piece held up out of his bag and set into the near pillar's foot. */
export const Q4_PIECE = { up: 24, throw: 34, set: 42 } as const;
const Q4_SET = Q4_PIECE.set;
/** The frame the twelfth blow breaks the right pillar in q3. */
export const Q3_BREAK = 129 + BLOW_AT;

/** Each pillar's state in frame `k` of a take: dark, lit (with how lit: kindling), out, broken; seconds since; blows taken. */
export function pillarsAt(shot: P3Shot, k: number): P3Fx['pillars'] {
  return PILLARS.map((P, i) => {
    const to = toWorld(P.to);
    const base = { x: P.x, y: P.y, to, hits: 0 } as const;
    if (shot === 'q1') {
      const g = k - (P3_TAKES.q1.at + SLIDE.frames + 2 + i * 5);
      return g < 0 ? { ...base, state: 'dark' as const, s: 0 } : { ...base, state: 'lit' as const, s: g / EYE_FPS, lit: sm(0, 26, g) };
    }
    const order: P3Shot[] = ['q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
    const now = order.indexOf(shot);
    // (the left: put out in q2; the right: broken in q3; the near: put out in q4)
    const ends: Array<[P3Shot, number, 'out' | 'broken']> = [['q2', Q2_PIECE.set, 'out'], ['q3', Q3_BREAK, 'broken'], ['q4', Q4_SET, 'out']];
    const [es, ek, how] = ends[i];
    const ei = order.indexOf(es);
    // (the right one's blows: two before the cut, eight in it, two after)
    let hits = 0;
    if (i === 1 && now > ei) hits = PILLAR_BLOWS;
    else if (i === 1 && now === ei) hits = blowsOf('q3').filter((b) => b.k <= k).length + (k >= Q3_CUT ? 8 : 0);
    if (now < ei || (now === ei && k < ek)) return { ...base, state: 'lit' as const, s: 9, hits, lit: 1 };
    const s = now === ei ? (k - ek) / EYE_FPS : 30;
    return { ...base, state: how, s, hits, ...(how === 'broken' ? { fall: [1, 0] as [number, number] } : {}) };
  });
}
/** His shield in frame `k` (0 to 1): on as the pillars blaze, broken with the last. */
function shieldAt(shot: P3Shot, k: number): number {
  if (shot === 'q1') return sm(0, SHIELD.on, k - (P3_TAKES.q1.at + SLIDE.frames + 12));
  if (shot === 'q2' || shot === 'q3') return 1;
  if (shot === 'q4') return 1 - sm(0, SHIELD.off, k - Q4_SET - 4);
  return 0;
}

// =============================================================================================
// HIS FRAMES

/** The camera in each take (picture pixels: across, and down from the stills'), by frame. */
const CAMS: Record<P3Shot, Array<[number, number, number]>> = {
  q1: [[0, 0, 20], [24, 0, 30], [130, 0, 80], [204, 0, 110]],
  q2: [[0, 0, 100], [30, 0, 100], [64, -120, 150], [95, -250, 170], [112, -250, 170], [134, -250, 196], [150, -250, 196]],
  q3: [[0, 200, 170], [196, 200, 170]],
  // (down with the Warrior to the near pillar; as the piece is set, up to him as his ward breaks; back down to the Warrior)
  q4: [[0, 0, 230], [20, 0, 300], [46, 0, 300], [56, 0, 170], [76, 0, 170], [100, 0, 250], [104, 0, 250]],
  // (the slam: up with his eye as it rears, down with it onto the stone as it hits, back up as it is dragged back)
  q5: [[0, 0, 80], [10, 0, 80], [24, 0, 58], [32, 0, 58], [39, 0, 104], [48, 0, 124], [76, 0, 124], [96, 0, 84], [120, 0, 84]],
  q6: [[0, 0, 80], [10, 0, 80], [24, 0, 58], [32, 0, 58], [39, 0, 104], [48, 0, 124], [76, 0, 124], [96, 0, 84], [120, 0, 84]],
  q7: [[0, 0, 115], [124, 0, 115]],
  q8: [[0, 0, 70], [64, 0, 70]],
};
export function camAt(marks: Array<[number, number, number]>, k: number): [number, number] {
  let i = 0;
  while (i < marks.length - 2 && k >= marks[i + 1][0]) i++;
  const a = marks[i];
  const b = marks[Math.min(marks.length - 1, i + 1)];
  const u = b[0] > a[0] ? clamp01((k - a[0]) / (b[0] - a[0])) : 0;
  const e = u * u * (3 - 2 * u);
  return [Math.round(lerp(a[1], b[1], e)), Math.round(lerp(a[2], b[2], e))];
}
export const jolt = (g: number, a: number, long: number, s: number): [number, number] => {
  if (g < 0 || g >= long) return [0, 0];
  const v = a * (1 - g / long);
  return [Math.round(v * 0.5 * (h1(g, s) * 2 - 1)), Math.round(v * (g % 2 ? -1 : 1))];
};
/** THE SCREEN'S JOLTS (game pixels, and how long): his front gripping the stone's edge; the slam; a pillar toppling into the water; a bolt
 *  striking; his ward broken. */
export const P3_SHAKE = { grip: 7, gripLong: 10, slam: 9, slamLong: 10, topple: 6, toppleLong: 8, bolt: 3, boltLong: 5, ward: 5, wardLong: 8 } as const;

/** His tongue's layer in phase 3 (his own space; laid at his place): `key`, his anim. */
const tongueLayer = (key: string, an: ColossusAnim): EyeLayer => ({ key, pose: body({ ...an, parts: 'tongue' }), drop: 0, back: 0 });
/** His stand's tongue in phase 3 at clock frame `c` (0 to 89). */
export function p3StandTongue(c: number): EyeLayer {
  const t = c / EYE_FPS;
  const S = standAnim(t);
  const path = p3Tongue(t);
  const eye = tipEye(path);
  return tongueLayer(`T.p.${pad(c)}`, { ...S, tongue: path, eye, gaze: lookAt(eye, null), lids: 1 });
}
/** His drool in phase 3: the spittle strung across his maw torn away by his tongue thrust out through it as he hauls himself up (long
 *  ago, never knitting again while it droops there); the rest of his drool and his drips as ever. */
export function p3Spit(c: number): EyeLayer {
  const t = c / EYE_FPS;
  const S = standAnim(t);
  const path = p3Tongue(t);
  return { key: `S.p.${pad(c)}`, pose: body({ ...S, tongue: path, eye: tipEye(path), tore: t - 10, knit: 1e9, parts: 'spit' }), drop: 0, back: 0 };
}

/** A FRAME OF A TAKE OF HIS PHASE 3. */
export function p3Frame(shot: P3Shot, k: number): EyeFrame {
  const T = P3_TAKES[shot];
  const c = standK(T.clock + k);
  const t = c / EYE_FPS;
  const base = eyeFrame('stand', c);
  const f = k - T.at;
  let fwd: number = P3.fwd;
  let rise: number = P3.rise;
  let tongue: EyeLayer = p3StandTongue(c);
  let spit: EyeLayer | null = p3Spit(c);
  let arms: Array<EyeLayer | null> = [null, null, null];
  const smear: Array<EyeLayer | null> = [null, null, null];
  const fx: P3Fx = { shot, f, pillars: pillarsAt(shot, k), shield: { k: shieldAt(shot, k) }, bolts: [] };
  let shake: [number, number] = [0, 0];
  const add = (j: [number, number]): void => {
    shake = [shake[0] + j[0], shake[1] + j[1]];
  };
  let bfx: BodyFx | undefined;
  const hero = heroP3(shot, k);
  const heroW: [number, number, number] = [hero.x, hero.y, 30];
  if (shot === 'q1') {
    // THE SLIDE: his stand at his place; the last tentacle sinking; three lunges, hauled up against the edge, gripping it
    if (f < 0) {
      fwd = 0;
      rise = 0;
      tongue = base.tongue as EyeLayer;
      spit = base.spit;
    } else if (f < SLIDE.frames) {
      const S = slideAt(f);
      fwd = S.fwd;
      rise = S.rise;
      fx.slide = { heave: S.heave, fwd: S.fwd, rise: S.rise, v: S.v, ...(f >= SLIDE.grip ? { grip: (f - SLIDE.grip) / EYE_FPS } : {}) };
      if (f < SLIDE.tongue[0]) {
        tongue = base.tongue as EyeLayer;
        spit = base.spit;
      } else {
        const w = sm(SLIDE.tongue[0], SLIDE.tongue[1], f);
        const St = standAnim(t);
        const path = mixPath(St.tongue as number[][], p3Tongue(t), w);
        const eye = tipEye(path);
        tongue = tongueLayer(`T.q.${pad(f)}`, { ...St, tongue: path, eye, gaze: lookAt(eye, null), lids: 1 });
        spit = f < SLIDE.tear ? base.spit : p3Spit(c);
        if (f >= SLIDE.tear) fx.slide = { ...(fx.slide as NonNullable<P3Fx['slide']>), tear: (f - SLIDE.tear) / EYE_FPS };
      }
    } else {
      fx.slide = { heave: 0, fwd: P3.fwd, rise: P3.rise, v: 0, grip: (f - SLIDE.grip) / EYE_FPS, tear: (f - SLIDE.tear) / EYE_FPS };
    }
    // (the last of his tentacles going down into the water, dead)
    if (k < 34) {
      const A = base.arms[1];
      const u = sm(-6, 34, k);
      if (A) arms = [null, { ...A, drop: A.drop + 300 * u ** 1.4, back: A.back + 20 * u }, null];
    }
    add(jolt(f - SLIDE.grip, P3_SHAKE.grip, P3_SHAKE.gripLong, 81));
    for (const [a, b] of SLIDE.lunges) if (f >= a && f < b) add([0, Math.round(1.5 * Math.sin(f * 2.1))]);
  } else if (shot === 'q5' || shot === 'q6') {
    // THE EYE SLAM, at where the Warrior stands as it begins
    const at = [SLAM_AT[0], SLAM_AT[1]];
    if (f >= 0 && f < SLAM.frames) {
      const hits = shot === 'q6' ? blowsOf('q6').map((b) => b.k - T.at) : [];
      const struckNow = hits.some((h) => f >= h && f < h + 8);
      const an = slamAnim(f, t, at, hits);
      tongue = tongueLayer(`T.${struckNow ? 'e2' : 'e'}.${pad(f)}`, an);
      if (f >= SLAM.wind && f < SLAM.hit + 1) {
        const prev = slamAnim(f - 1, standK(T.clock + k - 1) / EYE_FPS, at, hits);
        smear.push(tongueLayer(`T.e.${pad(f - 1)}`, prev));
      }
      const eyeW = toWorld(an.eye as readonly number[]);
      fx.slam = { x: at[0], y: at[1], k: clamp01(f / (SLAM.hit - 1)), flare: sm(SLAM.hit - 9, SLAM.hit - 1, f), s: (f - SLAM.hit) / EYE_FPS, lift: eyeW[2] - SLAM_EYE_Z };
      if (shot === 'q6') fx.struck = hits.filter((h) => f >= h).map((h) => ({ x: eyeW[0], y: eyeW[1], z: eyeW[2], s: (f - h) / EYE_FPS }));
    } else if (f >= SLAM.frames) {
      fx.slam = { x: at[0], y: at[1], k: 1, flare: 0, s: (f - SLAM.hit) / EYE_FPS, lift: 999 };
    }
    add(jolt(f - SLAM.hit, P3_SHAKE.slam, P3_SHAKE.slamLong, 82));
  } else if (shot === 'q7') {
    // THE GAZE, from his new place: his tongue reared up out of its droop, the beam swept across the stone
    const A = gazeArc3();
    if (f >= 0 && f < GAZE.frames) {
      const q = gazeQ3(f);
      const a = eyeAngle(f, A);
      const path = gazePath3(f, t, a);
      const eye = tipEye(path);
      const L0 = beamLine(a, A);
      const ew = toWorld(eye);
      const hl = Math.hypot(L0.ax - ew[0], L0.ay - ew[1]) || 1;
      const pitch = (20 * Math.PI) / 180;
      const at = norm([((L0.ax - ew[0]) / hl) * Math.cos(pitch), ((L0.ay - ew[1]) / hl) * Math.cos(pitch), -Math.sin(pitch)]);
      const st = lookAt(eye, heroW);
      const gaze = norm([lerp(st[0], at[0], q), lerp(st[1], at[1], q), lerp(st[2], at[2], q)]);
      const an: ColossusAnim = { ...standAnim(t), tongue: path, eye, gaze, lids: gazeLids(f), swell: gazeSwell(f) };
      tongue = tongueLayer(`T.h.${pad(f)}`, an);
      if (f >= GAZE.wind && f < GAZE.wind + GAZE.strike) {
        const tp = standK(T.clock + k - 1) / EYE_FPS;
        const pp = gazePath3(f - 1, tp, eyeAngle(f - 1, A));
        smear.push(tongueLayer(`T.h.${pad(f - 1)}`, { ...standAnim(tp), tongue: pp, eye: tipEye(pp), gaze, lids: gazeLids(f - 1), swell: gazeSwell(f - 1) }));
      }
      // (what the game draws: as his own gaze's, from here)
      const ba = beamAngle(f, A);
      bfx = { kind: 'gaze', shot, f, geo: A, eye: ew, gaze, flare: gazeFlare(f), swell: gazeSwell(f) };
      if (f < GAZE_SWEPT) bfx.arc = { ox: A.ox, oy: A.oy, a0: A.a0, a1: A.a1, from: ba ?? A.a0, k: f < GAZE_FIRE ? f / (GAZE.wind - 1) : 1, flare: f < GAZE_FIRE ? sm(GAZE.wind - 9, GAZE.wind - 1, f) : 0 };
      if (f < GAZE_OUT) bfx.dark = f < GAZE_FIRE ? 0.5 * sm(0, 10, f) : 0.5 * (1 - sm(GAZE_SWEPT, GAZE_OUT, f));
      if (ba !== null) bfx.beam = { ...beamLine(ba, A), a: ba, s: (f - GAZE_FIRE) / EYE_FPS, reach: f === GAZE_FIRE ? 0.5 : 1, k: 1 - sm(GAZE_SWEPT - 1, GAZE_OUT, f) };
      if (f > GAZE_FIRE) bfx.scorch = { ox: A.ox, oy: A.oy, a0: A.a0, a1: A.a1, to: lerp(A.a0, A.a1, clamp01((f - GAZE_FIRE) / GAZE.sweep)), f };
      if (f >= GAZE_SWEPT) bfx.smoke = (f - GAZE_SWEPT) / EYE_FPS;
    } else if (f >= GAZE.frames) {
      bfx = { kind: 'gaze', shot, f, geo: A, scorch: { ox: A.ox, oy: A.oy, a0: A.a0, a1: A.a1, to: A.a1, f } };
    }
    add(jolt(f - GAZE_FIRE, BODY_SHAKE.beam, BODY_SHAKE.beamLong, 73));
    if (f >= GAZE_FIRE + BODY_SHAKE.beamLong && f < GAZE_SWEPT) add([Math.round((h1(f, 74) * 2 - 1) * BODY_SHAKE.rumble), Math.round((h1(f, 75) * 2 - 1) * BODY_SHAKE.rumble)]);
  } else if (shot === 'q8') {
    // HIS EYE STRUCK as it weaves
    const g = f;
    if (g >= 0 && g < STRUCK.frames) {
      const an = struckAnim(g, t, heroW);
      tongue = tongueLayer(`T.k.${pad(g)}`, an);
      const ew = toWorld(an.eye as readonly number[]);
      fx.struck = [{ x: ew[0], y: ew[1], z: ew[2], s: g / EYE_FPS }];
    }
  }
  // THE BLOWS: where each lands (on his eye, on his ward round it, at a pillar's foot)
  const B = blowsOf(shot);
  if (B.length) {
    fx.blows = B.filter((b) => k >= b.k && k < b.k + 20).map((b) => {
      const an = tongue.pose.anim as ColossusAnim;
      const e = toWorld(an.eye as readonly number[]);
      if (b.on === 'pillar') return { x: PILLARS[1].x - 14, y: PILLARS[1].y, z: 22, s: (k - b.k) / EYE_FPS, on: b.on };
      return { x: e[0], y: e[1] + 20, z: e[2] - 6, s: (k - b.k) / EYE_FPS, on: b.on };
    });
    if (shot === 'q2') {
      const g = fx.blows.find((b) => b.on === 'ward');
      if (g) fx.shield.flash = { x: g.x, y: g.y, z: g.z, s: g.s };
    }
  }
  // THE PIECE OF THE WARD-STONE
  if (shot === 'q2') {
    const P = PILLARS[0];
    if (k < Q2_PIECE.pick[0]) fx.piece = { x: PIECE_AT[0], y: PIECE_AT[1], z: 0, held: false };
    else if (k < Q2_PIECE.throw) fx.piece = { x: hero.x, y: hero.y, z: k < Q2_PIECE.pick[1] ? 26 * sm(Q2_PIECE.pick[0], Q2_PIECE.pick[1], k) : 26, held: true };
    else if (k < Q2_PIECE.set) {
      const u = (k - Q2_PIECE.throw) / (Q2_PIECE.set - Q2_PIECE.throw);
      fx.piece = { x: lerp(hero.x, P.x + 6, u), y: lerp(hero.y, P.y + 4, u), z: 26 * (1 - u) + 30 * Math.sin(Math.PI * u) + 8 * u, held: false };
    } else fx.piece = { x: P.x + 6, y: P.y + 4, z: 8, held: false, set: (k - Q2_PIECE.set) / EYE_FPS };
  } else if (shot === 'q4') {
    const P = PILLARS[2];
    if (k >= Q4_PIECE.up && k < Q4_PIECE.throw) fx.piece = { x: hero.x, y: hero.y, z: 26 + 14 * sm(Q4_PIECE.up, Q4_PIECE.up + 6, k), held: true };
    else if (k >= Q4_PIECE.throw && k < Q4_PIECE.set) {
      const u = (k - Q4_PIECE.throw) / (Q4_PIECE.set - Q4_PIECE.throw);
      fx.piece = { x: lerp(hero.x, P.x, u), y: lerp(hero.y, P.y - 4, u), z: 40 * (1 - u) + 24 * Math.sin(Math.PI * u) + 8 * u, held: false };
    } else if (k >= Q4_PIECE.set) fx.piece = { x: P.x, y: P.y - 4, z: 8, held: false, set: (k - Q4_PIECE.set) / EYE_FPS };
  }
  // THE BOLTS (each from its warning to well after it strikes)
  for (const b of boltsOf(shot)) {
    const s = (k - b.warn) / EYE_FPS;
    if (s >= 0 && s < RAIN.warn / EYE_FPS + 2.2) fx.bolts.push({ x: b.x, y: b.y, s, seed: b.seed, warn: RAIN.warn / EYE_FPS });
    add(jolt(k - b.warn - RAIN.warn, P3_SHAKE.bolt, P3_SHAKE.boltLong, 90 + b.seed));
  }
  if (shot === 'q3') add(jolt(k - Q3_BREAK - TOPPLE.frames, P3_SHAKE.topple, P3_SHAKE.toppleLong, 83));
  if (shot === 'q4') add(jolt(k - Q4_SET - 4, P3_SHAKE.ward, P3_SHAKE.wardLong, 84));
  const jaws = laid(base.jaws, fwd, rise);
  return {
    ...base,
    move: shot,
    k,
    t,
    jaws,
    spit: spit ? laid(spit, fwd, rise) : null,
    tongue: laid(tongue, fwd, rise),
    arms,
    smear: smear.map((L) => (L ? laid(L, fwd, rise) : null)),
    hero: heroAt(shot, k),
    camX: camAt(CAMS[shot], k)[0],
    camY: camAt(CAMS[shot], k)[1],
    shake,
    ...(bfx ? { bfx } : {}),
    p3: fx,
  };
}

// =============================================================================================
// MOVE BY MOVE, FOR THE GAME'S BAKE (the main chat's ask, 8 Nov: frame functions as `eyeFrame` and `shovelFrame`, layers with key, pose,
// drop, back)

/** His phase-3 moves, each from its first frame (his stand at the edge loops): how many frames. */
export type P3Move = 'slide' | 'edge' | 'slam' | 'struck' | 'gaze';
export const P3_MOVES: Record<P3Move, number> = { slide: SLIDE.frames, edge: 90, slam: SLAM.frames, struck: STRUCK.frames, gaze: GAZE.frames };
/** Each move's clock (his stand's, frames) at its first frame: as the film plays it, so that its layers are the film's. */
export const P3_CLOCK: Record<P3Move, number> = { slide: P3_TAKES.q1.at, edge: 0, slam: P3_TAKES.q5.clock + P3_TAKES.q5.at, struck: P3_TAKES.q8.clock + P3_TAKES.q8.at, gaze: P3_TAKES.q7.clock + P3_TAKES.q7.at };
/** A FRAME OF A MOVE OF HIS PHASE 3 (`f` from 0): his layers laid where he is (forward `fwd`, raised `rise`: in `back` and `drop`), the
 *  strike's frames with the frame before behind them (`smear`). The slam comes down at `at` (the world's; the film's spot if not given),
 *  struck as it lies on the frames `hits`; the gaze aimed at `aim` (radians, as art/eye_body.ts `gazeArcAt`; the film's if not given:
 *  its tongue-eye painted aimed so, its layers named for the aim to the degree). The film's takes are made of these. */
export function phase3Frame(move: P3Move, f: number, opt: { at?: readonly [number, number]; aim?: number; hits?: readonly number[] } = {}): { move: P3Move; f: number; t: number; jaws: EyeLayer; spit: EyeLayer | null; tongue: EyeLayer; smear: EyeLayer[]; fwd: number; rise: number } {
  const c = standK(P3_CLOCK[move] + f);
  const t = c / EYE_FPS;
  const base = eyeFrame('stand', c);
  let fwd: number = P3.fwd;
  let rise: number = P3.rise;
  let tongue: EyeLayer = p3StandTongue(c);
  let spit: EyeLayer | null = p3Spit(c);
  const smear: EyeLayer[] = [];
  if (move === 'slide') {
    const S = slideAt(f);
    fwd = S.fwd;
    rise = S.rise;
    if (f < SLIDE.tongue[0]) {
      tongue = base.tongue as EyeLayer;
      spit = base.spit;
    } else {
      const w = sm(SLIDE.tongue[0], SLIDE.tongue[1], f);
      const St = standAnim(t);
      const path = mixPath(St.tongue as number[][], p3Tongue(t), w);
      const eye = tipEye(path);
      tongue = tongueLayer(`T.q.${pad(f)}`, { ...St, tongue: path, eye, gaze: lookAt(eye, null), lids: 1 });
      spit = f < SLIDE.tear ? base.spit : p3Spit(c);
    }
  } else if (move === 'slam') {
    const at = opt.at ?? SLAM_AT;
    const hits = opt.hits ?? [];
    const struckNow = hits.some((h) => f >= h && f < h + 8);
    // (the film's spot and no blows: its layers the film's; elsewhere, named for where it comes down)
    const where = opt.at ? `${Math.round(at[0])}_${Math.round(at[1])}.` : '';
    tongue = tongueLayer(`T.${struckNow ? 'e2' : 'e'}.${where}${pad(f)}`, slamAnim(f, t, at, hits));
    if (f >= SLAM.wind && f < SLAM.hit + 1) smear.push(tongueLayer(`T.e.${where}${pad(f - 1)}`, slamAnim(f - 1, standK(P3_CLOCK.slam + f - 1) / EYE_FPS, at, hits)));
  } else if (move === 'struck') {
    tongue = tongueLayer(`T.k.${pad(f)}`, struckAnim(f, t, toWorldHero('q8', P3_TAKES.q8.at + f)));
  } else if (move === 'gaze') {
    const A = opt.aim === undefined ? gazeArc3() : gazeArc3At(opt.aim);
    const aimKey = opt.aim === undefined ? '' : `a${Math.round((opt.aim * 180) / Math.PI)}.`;
    const layerAt = (g: number, tg: number, gazeOf?: readonly [number, number, number]): EyeLayer => {
      const q = gazeQ3(g);
      const a = eyeAngle(g, A);
      const path = gazePath3(g, tg, a);
      const eye = tipEye(path);
      const L0 = beamLine(a, A);
      const ew = toWorld(eye);
      const hl = Math.hypot(L0.ax - ew[0], L0.ay - ew[1]) || 1;
      const pitch = (20 * Math.PI) / 180;
      const aimed = norm([((L0.ax - ew[0]) / hl) * Math.cos(pitch), ((L0.ay - ew[1]) / hl) * Math.cos(pitch), -Math.sin(pitch)]);
      // (as it begins, fixed on the Warrior: the film's where he stands; aimed anywhere, at the arc's middle as far out as it lands)
      let st = lookAt(eye, opt.aim === undefined ? toWorldHero('q7', P3_TAKES.q7.at + g) : [A.ox + Math.sin(A.toward) * A.far, A.oy + Math.cos(A.toward) * A.far, 30]);
      // (aimed anywhere: as it sinks back into its droop, its look going back to its stand's)
      if (opt.aim !== undefined) {
        const home = lookAt(eye, null);
        const w = sm(GAZE_OUT, GAZE.frames - 6, g);
        st = norm([lerp(st[0], home[0], w), lerp(st[1], home[1], w), lerp(st[2], home[2], w)]);
      }
      const gaze = gazeOf ?? norm([lerp(st[0], aimed[0], q), lerp(st[1], aimed[1], q), lerp(st[2], aimed[2], q)]);
      return tongueLayer(`T.h.${aimKey}${pad(g)}`, { ...standAnim(tg), tongue: path, eye, gaze, lids: gazeLids(g), swell: gazeSwell(g) });
    };
    tongue = layerAt(f, t);
    // (the strike's frame before, behind it: its tongue then, looking as it looks now, as the film has it)
    if (f >= GAZE.wind && f < GAZE.wind + GAZE.strike) smear.push(layerAt(f - 1, standK(P3_CLOCK.gaze + f - 1) / EYE_FPS, (tongue.pose.anim as ColossusAnim).gaze));
  }
  return { move, f, t, jaws: laid(base.jaws, fwd, rise), spit: spit ? laid(spit, fwd, rise) : null, tongue: laid(tongue, fwd, rise), smear: smear.map((L) => laid(L, fwd, rise)), fwd, rise };
}
/** The film's Warrior where he stands in frame `k` of a take (the world's, at the height he is looked at). */
const toWorldHero = (shot: P3Shot, k: number): [number, number, number] => {
  const h = heroP3(shot, k);
  return [h.x, h.y, 30];
};
/** The gaze from his new place aimed anywhere (`aim`, radians): its arc about the same water under his eye. */
export function gazeArc3At(aim: number, far: number = gazeArc3().far): GazeArc {
  const A = gazeArc3();
  const h = (GAZE.half * Math.PI) / 180;
  return { ox: A.ox, oy: A.oy, toward: aim, a0: Math.max(-GAZE_LIM, aim - h), a1: Math.min(GAZE_LIM, aim + h), far };
}

// =============================================================================================
// THE SHAPES OF WHAT THE GAME DRAWS (never ruled: each edge ragged, wavering, alive; the pictures' tool draws them)

/** Smooth noise along `x`, and over a plane, 0 to 1. */
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
/** A line of the siege's magic: how far it wavers off its way (screen pixels, across it), `u` along it from its pillar (0) into him (1),
 *  `t` seconds; never straight, steadiest at its two ends. */
export const siegeWobble = (u: number, t: number, seed: number): number => (6 * (vn1(u * 7 - t * 3, seed + 9950) - 0.5) + 2.5 * (vn1(u * 23 + t * 9, seed + 9951) - 0.5)) * Math.sin(Math.PI * u) ** 0.5 + 3.4 * (vn1(u * 95 + t * 24, seed + 9952) - 0.5) + 1.6 * (vn1(u * 210 - t * 30, seed + 9953) - 0.5);
/** How far out from him his ward's edge lies (screen pixels) at a pixel (`i`, `j`), `t` seconds: breathing, crawling, ragged. */
export const wardEdge = (i: number, j: number, t: number): number => 9 + 4 * vn2(i * 0.045 + t * 0.6, j * 0.06 - t * 0.4, 9960) + 1.5 * Math.sin(i * 0.21 + j * 0.13 + t * 5) + 4 * (vn2(i * 0.3 + t * 2, j * 0.3 - t * 1.5, 9964) - 0.5) + 2 * (vn2(i * 0.7, j * 0.7 + t * 4, 9965) - 0.5);
/** The eye slam's slime pooling under it: how far out its edge is at angle `a` (1 its size). */
export const slimeEdge = (a: number): number => 0.8 + 0.35 * vn1(((a + TAU) / TAU) * 7 + 3, 9985) + 0.1 * Math.sin(a * 7) + 0.04 * Math.sin(a * 23 + 1);

// =============================================================================================
// THE NUMBERS (for the main chat)

/** His place, his eye's, the slam's reach and size, the pillars, the bolts: in the game's tiles (and the stone's own: across from its left
 *  end, deep from its back edge). */
export function p3Numbers(): { middleOff: number; up: number; eyeOver: [number, number]; eyeUp: [number, number]; slam: { r: number; reach: number; at: number }; pillars: Array<[number, number]>; tongue: number } {
  let eo = [Infinity, -Infinity];
  let ez = [Infinity, -Infinity];
  for (let c = 0; c < 90; c++) {
    const an = p3StandTongue(c).pose.anim as ColossusAnim;
    const e = toWorld(an.eye as readonly number[]);
    eo = [Math.min(eo[0], e[1] - STONE_BOX.y0), Math.max(eo[1], e[1] - STONE_BOX.y0)];
    ez = [Math.min(ez[0], e[2]), Math.max(ez[1], e[2])];
  }
  const home = toWorld(p3StandTongue(0).pose.anim?.eye as readonly number[]);
  return {
    middleOff: (STONE_BOX.y0 - P3.fwd) / TILE,
    up: P3.rise / TILE,
    eyeOver: [eo[0] / TILE, eo[1] / TILE],
    eyeUp: [ez[0] / TILE, ez[1] / TILE],
    slam: { r: SLAM.r / TILE, reach: SLAM.reach / TILE, at: Math.hypot(SLAM_AT[0] - home[0], SLAM_AT[1] - home[1]) / TILE },
    pillars: PILLARS.map((P) => [(P.x - STONE_BOX.x0) / TILE, (P.y - STONE_BOX.y0) / TILE] as [number, number]),
    tongue: TONGUE_LEN / TILE,
  };
}
void STONE;
void beamOn;
