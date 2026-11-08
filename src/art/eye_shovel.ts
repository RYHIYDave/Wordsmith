// THE SWAMP COLOSSUS'S MOVES, PART 3: HIS SHOVEL (painted by art/eye_colossus.ts, a layer each; a mock-up behind EYE2, off; nothing of
// the game imports it: tests/eye_shovel.test.ts). The owner, 7 Nov 2026: shown the tentacles, “Yes, on to the shovel (Recommended)”;
// 20:29, “I’d also like it to submerge, and then pop up on a random end of the platform and try to shovel the player into its mouth.
// Tentacles scrape down the platform and you find the gap in the top and bottom or dodge over.  If you get hit it knocks you closer to
// the mouth.  Get too close and it snaps shut for massive damage.  Goes for a few seconds, I’m thinking like a tight waveform pattern
// gets you through the hitboxes of the incoming tentacles”; 20:31, with his drawing, “P is the player, weaves up and down as the
// tentacles come in”. His rules: Movement 9 (a big held wind-up, a fast smeared strike, a big wind-down), “Action, like a movie”,
// nothing through anything, “Everything drawn should not just look like shapes.  That’s the rule”, and nowhere safe.
//
// What is here, 30 pictures a second, at either end of the stone (`End`):
//   HE SINKS out of his stand, his tentacles with him, quicker than he rose;
//   THE TELL, held: the water boiling and heaving off the end where he will come up, the stone's end shuddering;
//   HE BURSTS UP AT THAT END, his maw turned on its side (`ORIENT`: turned a quarter round, his front along the stone, one jaw along its
//     back edge and the other along its near edge, gaping across its whole depth), water pouring off him, a short roar; then his maw
//     gaping, trembling, his tongue-eye weaving in it, never still;
//   THE SHOVEL: tentacles out of the water past the far end, scraping along the stone toward his mouth one after another, one along the
//     back edge (its tip hooked down on the stone), the next along the near edge (its tip curled up), each leaving its gap at the other
//     edge; each runs into his maw and is drawn back. Each is drawn as the game would slide it: its head (`headLocal`: its hook and what
//     of it comes up out of the water over the edge, writhing in a loop of a second, `HEAD_LOOP`) and its body behind it in the water
//     (`bodyWorld`: the same tube running on, swimming, its humps' backs breaking the surface here and there), both slid along together;
//   THE SNAP: the Warrior close, his jaws flex wider, held; then lunging up out of the water, leaning out over the stone's end and
//     slamming shut in two smeared frames; held clenched a beat, his teeth clashed, spittle and spray bursting from between them; then
//     back and gaping again;
//   and what the game draws over it, given here (the pictures' tool draws them): the water pouring off him as he bursts up (`pourSheet`,
//   `pourRope`), the gouges each tip leaves in the stone along its own path (`scorePath`, `scoreMarks`); nothing of it ruled;
//   HE GOES BACK: the last tentacle drawn under, he sinks at the end and rises at his place, into his stand.
// (The arena's pieces on the stone, its two broken columns at the back corners, the mossy stones and the fallen drums, are left out of
// his shovel: the tentacles sweep through where each lies. The pictures' tool leaves them out, and the reeds off the end he comes up at,
// under him.)

import { GAZE_AT_YOU, STONE, armBelly, armOf } from './eye_colossus';
import type { ArmPose, ColossusAnim, ColossusPose } from './eye_colossus';
import { CAM_ARMS, QUAY, STONE_BOX, UNIT } from './eye_arms';
import { EYE_FPS, armStandLayer, standAnim, standLayersAt } from './eye_moves';
import type { EyeFrame, EyeLayer, EyeWater, HeroAt, ShovelFx } from './eye_moves';

type P3 = number[];
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const pad = (n: number): string => String(n).padStart(3, '0');
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const TAU = Math.PI * 2;

// =============================================================================================
// WHERE HE COMES UP

export type End = 'left' | 'right';
/** Which way his end is across (-1 the left end, 1 the right). */
export const sideOf = (e: End): number => (e === 'left' ? -1 : 1);
/** How far off the stone's end his middle is (his lengths): as near as he can come up and be clear of the stone (his heaps at the water,
 *  the widest of him, a few lengths off its end: tests/eye_shovel.test.ts). */
export const OFF_END = 185;
/** His place at an end (his middle at the water, in the world): off the stone's end, at the middle of its depth. */
export const placeOf = (e: End): [number, number] => [sideOf(e) * (STONE_BOX.x1 + OFF_END), (STONE_BOX.y0 + STONE_BOX.y1) / 2];
/** HIS MAW TURNED ON ITS SIDE: where his own axes point in the world. Turned a quarter round about the up, his front along the stone
 *  toward its far end; his jaws (his left and right) along its back and near edges. Upright still, so that all that drips and hangs off
 *  him falls straight down into the water. */
export const ORIENT: Record<End, { x: readonly [number, number, number]; y: readonly [number, number, number]; z: readonly [number, number, number] }> = {
  left: { x: [0, -1, 0], y: [1, 0, 0], z: [0, 0, 1] },
  right: { x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] },
};
/** His maw tipped forward over the stone by `pitch` (radians) as he lunges in his snap: his up leaning toward the far end. */
export function orientOf(e: End, pitch: number): { x: readonly [number, number, number]; y: readonly [number, number, number]; z: readonly [number, number, number] } {
  if (!pitch) return ORIENT[e];
  const s = -sideOf(e);
  const c = Math.cos(pitch);
  const n = Math.sin(pitch);
  return { x: ORIENT[e].x, y: [s * c, 0, -n], z: [s * n, 0, c] };
}
/** A point of the world in his own space: him at `at`, `drop` down, lunged (`lunge`: along the stone, up, tipped). */
function toHis(e: End, p: readonly number[], at: readonly number[], drop: number, lunge: readonly number[]): P3 {
  const O = orientOf(e, lunge[2] ?? 0);
  const dx = p[0] - at[0] + sideOf(e) * lunge[0];
  const dy = p[1] - at[1];
  const dz = p[2] + drop - lunge[1];
  return [dx * O.x[0] + dy * O.x[1] + dz * O.x[2], dx * O.y[0] + dy * O.y[1] + dz * O.y[2], dx * O.z[0] + dy * O.z[1] + dz * O.z[2]];
}

// =============================================================================================
// THE BEATS (frames at 30 a second, from his stand)

/**
 * The shovel's beats. `sink`: he sinks out of his stand. `tell` (HELD, the wind-up): the boil off the end, the stone shuddering, clear
 * for over a second before he comes up. `burst` (THE STRIKE, 4 frames, smeared): up through it; `settle` and `roar` (the wind-down):
 * settling, roaring, gaping. `shovel`: the tentacles. `back`: he sinks at the end; `rise`: up at his place, into his stand at `frames`.
 */
export const SHOVEL = { sink: [0, 22], tell: [22, 56], burst: [56, 60], settle: [60, 70], roar: [64, 84], shovel: [84, 300], back: [300, 314], rise: [318, 348], frames: 352 } as const;
/** How far down he goes (his lengths): his jaws' peaks under the water. */
export const SUNK_DOWN = 330;
/** His maw as it gapes (how open: his stand's 1 or so; the roar's widest; his snap's flex), and how much it trembles. */
export const GAPE_SIDE = { roar: 1.42, gape: 1.32, flex: 1.5, tremble: 0.035 } as const;
/** THE SNAP (left only in the film): his twitch as the Warrior is close (HELD, `twitch` frames: drawn back, his jaws flexing wider), the
 *  strike (2 frames, smeared: lunging up out of the water and on, his jaws thrown forward out over the stone's end, slamming shut), held
 *  shut, then back and gaping again. Frames from its first. `lunge`: how far he comes on toward the stone, how far up out of the water,
 *  how far he tips forward over it (radians), and how far he leans (`ColossusPose.lean`: his flesh carried forward that much for each of
 *  his lengths of height): as far as he can and stay clear of the stone (his heaps at the water before its end, over its top). */
export const SNAP = { at: 196, twitch: 6, strike: 2, held: 8, back: 15, frames: 31, lunge: [35, 80, (15 * Math.PI) / 180, 0.9] } as const;
/** Slammed shut on the strike's last frame (open 0: where the game's snap lands, `SNAP_REACH`), then held clenched (how open): his teeth
 *  clashed, both rows meeting at the front of the seam, his lips curled back off them; then gaping again from there. */
export const SNAP_CLENCH = 0.3;
/** How far his jaws reach over the stone as they snap shut, from its end (his lengths; across the middle of its depth): the game's
 *  snap's place (tests/eye_shovel.test.ts measures it). */
export const SNAP_REACH = 92;

/** His jaws: how open, at frame `k` of his shovel at an end (`snap` whether this one snaps). */
export function openAt(k: number, snap: boolean): number {
  const S = SHOVEL;
  const tr = GAPE_SIDE.tremble * Math.sin((TAU * (k - S.roar[0])) / 30) + 0.012 * Math.sin(k * 2.7);
  if (k < S.roar[0]) return 0.95;
  if (k < 70) return lerp(0.95, GAPE_SIDE.roar, sm(S.roar[0], 70, k)) + 0.02 * Math.sin(k * 3.1);
  if (k < 80) return GAPE_SIDE.roar + 0.025 * Math.sin(k * 3.1);
  if (k < S.roar[1]) return lerp(GAPE_SIDE.roar, GAPE_SIDE.gape, sm(80, S.roar[1], k)) + tr * sm(80, S.roar[1], k);
  if (snap) {
    const f = k - SNAP.at;
    if (f >= 0 && f < SNAP.twitch) return lerp(GAPE_SIDE.gape, GAPE_SIDE.flex, sm(0, 3, f)) + 0.03 * Math.sin(f * 4.1);
    if (f === SNAP.twitch) return 0.62;
    if (f === SNAP.twitch + 1) return 0;
    if (f > SNAP.twitch && f < SNAP.twitch + SNAP.strike + SNAP.held) return SNAP_CLENCH;
    if (f >= SNAP.twitch + SNAP.strike + SNAP.held && f < SNAP.frames) return lerp(SNAP_CLENCH, GAPE_SIDE.gape, sm(SNAP.twitch + SNAP.strike + SNAP.held, SNAP.frames, f)) + tr * sm(SNAP.frames - 4, SNAP.frames, f);
  }
  return GAPE_SIDE.gape + tr;
}
/** How far he has lunged (on toward the stone, up, tipped forward, leaning), frame `k`. */
export function lungeAt(k: number, snap: boolean): [number, number, number, number] {
  if (!snap) return [0, 0, 0, 0];
  const f = k - SNAP.at;
  const L = SNAP.lunge;
  if (f < 0 || f >= SNAP.frames) return [0, 0, 0, 0];
  // (drawn back through his twitch, held; flung up, forward and over on the strike; held; easing back)
  if (f < SNAP.twitch) {
    const u = sm(0, SNAP.twitch - 2, f);
    return [-10 * u, 8 * u, (-9 * Math.PI * u) / 180, 0];
  }
  if (f === SNAP.twitch) return [L[0] * 0.55, L[1] * 0.55, L[2] * 0.55, L[3] * 0.55];
  if (f < SNAP.twitch + SNAP.strike + SNAP.held) return [L[0], L[1], L[2], L[3]];
  const u = sm(SNAP.twitch + SNAP.strike + SNAP.held, SNAP.frames - 3, f);
  return [L[0] * (1 - u), L[1] * (1 - u), L[2] * (1 - u), L[3] * (1 - u)];
}
/** His lean as the painter takes it (from the water up, eased in over 60 of his lengths). */
export const leanOf = (k: number): { k: number; from: number; ease: number } | undefined => (k > 0 ? { k, from: 0, ease: 60 } : undefined);
/** How far his tongue is drawn in (0 out, 1 in his throat), frame `k`. */
export function tongueInAt(k: number, snap: boolean): number {
  if (k < SHOVEL.burst[0]) return 1;
  if (!snap) return 0;
  const f = k - SNAP.at;
  if (f < 0 || f >= SNAP.frames) return 0;
  if (f < SNAP.twitch) return sm(0, SNAP.twitch - 1, f);
  if (f < SNAP.twitch + SNAP.strike + SNAP.held + 4) return 1;
  return 1 - sm(SNAP.twitch + SNAP.strike + SNAP.held + 4, SNAP.frames, f);
}
/** How far down he is (his lengths) at frame `k` of his shovel, at the end (`SHOVEL.burst` on) or at his place (before, and his rise). */
export function dropAt(k: number): number {
  const S = SHOVEL;
  if (k < S.sink[1]) return SUNK_DOWN * sm(S.sink[0], S.sink[1], k) ** 1.2;
  if (k < S.burst[0]) return SUNK_DOWN;
  // (bursting up: in four frames, past where he stands, settling)
  if (k < S.burst[1]) return [SUNK_DOWN * 0.72, SUNK_DOWN * 0.38, SUNK_DOWN * 0.08, -16][k - S.burst[0]];
  if (k < S.settle[1]) return -16 * Math.cos(((k - S.burst[1]) / (S.settle[1] - S.burst[1])) * Math.PI * 0.5) * Math.exp(-(k - S.burst[1]) / 6);
  if (k < S.back[0]) return 0;
  if (k < S.back[1]) return SUNK_DOWN * sm(S.back[0], S.back[1], k) ** 1.3;
  if (k < S.rise[0]) return SUNK_DOWN;
  if (k < S.rise[1]) return SUNK_DOWN * (1 - sm(S.rise[0], S.rise[1], k)) ** 1.6;
  return 0;
}
/** Deeper still, out of sight (his lengths, more than `dropAt`): under the water he goes on down out of sight before he goes to the end
 *  (his eye's fire, the last of him seen, fading into the deep), and as he sinks at the end; and he comes up out of the deep at his
 *  place. So nothing of him is seen going from one place to the other. */
export const DEEP = 570;
export function deepAt(k: number): number {
  const S = SHOVEL;
  if (k >= S.tell[0] && k < S.burst[0]) return DEEP * sm(S.tell[0], S.tell[0] + 18, k);
  if (k >= S.back[0] + 4 && k < S.back[1] + 2) return DEEP * sm(S.back[0] + 4, S.back[1] + 2, k);
  if (k >= S.back[1] + 2 && k < S.rise[0] + 14) return DEEP * (1 - sm(S.rise[0] - 2, S.rise[0] + 14, k));
  return 0;
}
/** Whether he is at the end of the stone (true) or at his place, frame `k`. */
export const atEnd = (k: number): boolean => k >= SHOVEL.tell[1] && k < SHOVEL.back[1] + 2;

// =============================================================================================
// THE SCRAPING TENTACLES

/** How fast they scrape along the stone (his lengths a frame: 12 tiles a second); they are drawn back about twice as fast (`SCRAPE.back`). */
export const SCRAPE_V = (12 * 39.19) / EYE_FPS;
/** Each one's beats (frames from its first): up out of the water past the far end, the scrape to his maw, held there, its hook drawn
 *  back off the stone into the water, slid back along the stone's side, under. */
export const SCRAPE = { up: 8, held: 3, retract: 6, back: 24, under: 8 } as const;
/** Where its hook's front stops at his maw (his lengths onto the stone from its end): as near as it can come, clear of him. (The arena's
 *  pieces on the stone are left out of his shovel: the tentacles sweep through where each lies; the owner's to decide.) */
export const STOP_IN = 25;
/** Where it comes up, past the far end (his lengths). */
export const START_OUT = 70;
/** Its lane in the water beside the edge (how far out from the edge, how deep its middle, under the water): and its body's thickness
 *  there. Only its hook comes up out of the water, over the edge and across the stone. */
export const LANE = { out: 34, z: -40, r: 26 } as const;
/** How deep its head's root is where it joins its body, curving up out of the deep (its middle under the water at 300, 240 and 180 of its
 *  lengths back from its front): deep enough that, riding up over rubble, it stays under. */
export const ROOT = [LANE.z - 34, LANE.z - 20, LANE.z + 6] as const;
/** How far its hook reaches in across the stone from its edge (his lengths: 6.5 tiles), so its gap at the other edge. */
export const HOOK_IN = 254;
/** The tentacles of a shovel: each its edge and its first frame. */
export const SCRAPERS: ReadonlyArray<{ edge: 'back' | 'near'; k0: number }> = [
  { edge: 'back', k0: 84 },
  { edge: 'near', k0: 128 },
  { edge: 'back', k0: 190 },
  { edge: 'near', k0: 234 },
];
/** A scraper's sweep's frames (from the far end to his maw). */
export const SWEEP = Math.round((STONE_BOX.x1 - STONE_BOX.x0 + START_OUT - STOP_IN) / SCRAPE_V);
/** The frames of a scraper, all told. */
export const SCRAPE_FRAMES = SCRAPE.up + SWEEP + SCRAPE.held + SCRAPE.retract + SCRAPE.back + SCRAPE.under;
/** The head's writhe: a loop of a second. */
export const HEAD_LOOP = 30;

/** Its head as it lies on the stone (along its own way back from its front, `u`; in across the stone from its edge, `v`; up, `z`),
 *  hooked (its tip hooked down into the stone, the back edge's; curled up, the near edge's), writhing at `t` of its loop; or drawn back
 *  (`back` 0 to 1) off the stone into its lane in the water. Each point its own thickness: thick at the water, to a whip of a tip. */
export function headLocal(edge: 'back' | 'near', t: number, back: number): P3[] {
  const ph = TAU * t;
  // (up out of the deep in its lane, curving up out of the water and arching up over the edge, then lying along the stone across it,
  // dragged on it: its height there 0, so that it lies on the stone (`clearOfStone` sets it on it))
  const hooked: P3[] = [
    [300, -LANE.out, ROOT[0]],
    [240, -LANE.out, ROOT[1]],
    [180, -LANE.out, ROOT[2]],
    [128, -LANE.out, -10],
    [96, -30, 14],
    [70, -14, 32],
    [44, 20, 30],
    [22, 60, 0],
    [9, 104, 0],
    [3, 150, 0],
    [7, 196, 0],
    [22, 228, 0],
  ];
  const tip: P3[] = edge === 'back' ? [[42, 248, 0], [62, 255, 0], [78, 250, 0]] : [[38, 246, 14], [50, 250, 32], [56, 243, 46]];
  const H = [...hooked, ...tip].map((q, i, a) => {
    // (writhing: what is over the stone swaying along the way it goes, a wave out to its tip, its tip curling and uncurling)
    const w = clamp01((q[1] + 10) / 80);
    const f = i / (a.length - 1);
    return [q[0] + w * (9 * Math.sin(ph - f * 4.2) + (f > 0.8 ? 8 * Math.sin(ph * 1 + 1.3) : 0)), q[1] + w * 5 * Math.sin(ph * 1 - f * 3 + 0.7), q[2] + w * 3 * Math.sin(ph - f * 5 + 2) + (f > 0.85 ? (edge === 'back' ? -2 : 5) * Math.sin(ph + 0.4) : 0)];
  });
  if (back <= 0) return H;
  // (drawn back: its hook pulled off the stone, back over the edge into its lane, gathered short along it, bowing out and writhing in the
  // water, its tip curled up out of it; from its root on, never folding back on itself)
  const R: P3[] = H.map((q, i, a) => {
    if (i < 3) return q;
    const f = (i - 3) / (a.length - 4);
    const curl = sm(0.6, 1, f);
    return [128 - 96 * f + 12 * curl * curl + 4 * f * Math.sin(ph - 4 * f), -LANE.out - 12 * Math.sin(Math.PI * f) + 5 * f * Math.sin(ph - 3 * f), -10 + 12 * f + 52 * curl ** 1.5];
  });
  return H.map((q, i) => q.map((v, c) => lerp(v, R[i][c], sm(0, 1, back))));
}
/** Its thickness along its head, by how far from its tip (his lengths), over the `span` it tapers along: a whip of a tip to the thickness
 *  of its body in its lane. */
export const headR = (sFromTip: number, span = 330): number => 3 + (LANE.r - 3) * Math.min(1, sFromTip / span) ** 0.85;
/** A path in the world from a head's local points: at an end (it scrapes toward `e`), along an edge, its front at `X`. */
export function headWorld(e: End, edge: 'back' | 'near', H: P3[], X: number): P3[] {
  const s = sideOf(e);
  const yE = edge === 'back' ? STONE_BOX.y0 : STONE_BOX.y1;
  const inw = edge === 'back' ? 1 : -1;
  // (each point's thickness by how far it is from the tip along it)
  const L: number[] = [0];
  for (let i = H.length - 2; i >= 0; i--) L.unshift(L[0] + Math.hypot(H[i][0] - H[i + 1][0], H[i][1] - H[i + 1][1], H[i][2] - H[i + 1][2]));
  // (tapering along the half of it nearest its tip, as the half of its hook does: drawn back and gathered short, the same)
  const span = Math.min(330, 0.55 * L[0]);
  const P = H.map((q, i) => [X - s * q[0], yE + inw * q[1], q[2], headR(L[i], span)]);
  return clearOfStone(P);
}
/** A tube (points with their thickness) lifted where it would go into the stone: over it its underside on its top at the least, and over
 *  its edges clear of them; 4 of his lengths to spare. */
export function clearOfStone(P: P3[]): P3[] {
  return P.map((q) => {
    const r = q[3] + 4;
    const dx = Math.max(STONE_BOX.x0 - q[0], 0, q[0] - STONE_BOX.x1);
    const dy = Math.max(STONE_BOX.y0 - q[1], 0, q[1] - STONE_BOX.y1);
    const d = Math.hypot(dx, dy);
    if (d >= r) return q;
    const need = d === 0 ? r : Math.sqrt(r * r - d * d);
    return q[2] < need ? [q[0], q[1], need, q[3]] : q;
  });
}
/** Where a hook scrapes the stone (the world's across and depth): of what of it lies lowest on the stone, the furthest across from its
 *  edge (the back edge's, its tip hooked down; the near edge's, where it curls up off the stone). `t` its writhe's clock; `X` its front. */
export function scrapeAt(e: End, edge: 'back' | 'near', t: number, X: number): [number, number] {
  const P = headWorld(e, edge, headLocal(edge, t, 0), X);
  const on = P.filter((q) => q[1] > STONE_BOX.y0 && q[1] < STONE_BOX.y1);
  const low = Math.min(...on.map((q) => q[2] - q[3]));
  let best = on[0];
  for (const q of on) if (q[2] - q[3] <= low + 1 && (edge === 'back' ? q[1] > best[1] : q[1] < best[1])) best = q;
  return [best[0], best[1]];
}
/** Its body behind its head, in the water: the same tube running on from where its head goes down into its lane (his lengths along its way
 *  back from the head's front, `from` to `to`; on the head's own lane, as thick, to `join`), then swimming: humped, its humps a wave
 *  running back along it (`wave` his lengths from crest to crest, one wave a second, so that they go on through the water at a little
 *  over half the speed it slides), each crest's back just breaking the surface (`crest` over it), each hump arched (`arch`), the troughs down under it
 *  (`trough`), swaying out
 *  and in from the stone (`sway`); swimming out from the stone as it goes (`out` more than its hook's lane: at the back edge, so that
 *  the water, not the stone's edge, is in front of it and it is seen through it), going down out of sight from `dive` on (never seen there: past the far end
 *  of the stone wherever its hook is), as thick as its head's root (one smooth taper with its head; no thicker, so that its humps' backs
 *  stay round); a painting each frame of its second (`loop`). Its suckers held
 *  the way its head's face where they meet (`bodyBelly`): one tube, no seam. */
export const BODY = { from: 240, to: 880, join: 300, out: 52, loop: 30, wave: 211.7, crest: 2.5, trough: 100, arch: 1.6, sway: 7, dive: 740 } as const;
export function bodyWorld(e: End, edge: 'back' | 'near', X: number, t = 0): P3[] {
  const s = sideOf(e);
  const yE = edge === 'back' ? STONE_BOX.y0 : STONE_BOX.y1;
  const inw = edge === 'back' ? 1 : -1;
  const ph = TAU * t;
  const out: P3[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const u = lerp(BODY.from, BODY.to, i / N);
    // (on its head's root to the join, as deep, going on down; humped from there: each crest's back just breaking the surface, `crest`
    // over it, the troughs `trough` down, out of sight)
    const r = LANE.r;
    const a = sm(BODY.join, BODY.join + 120, u);
    const w = (TAU * (u - BODY.join)) / BODY.wave - ph - Math.PI / 2;
    const zC = -(r - BODY.crest);
    // (each hump arched: rounder over its crest than a swell, `arch`)
    const zH = -BODY.trough + (zC + BODY.trough) * ((1 + Math.cos(w)) / 2) ** BODY.arch;
    // (going on down as its root does, easing off)
    const dRoot = (ROOT[0] - ROOT[1]) / (BODY.join - 240);
    const zRoot = u <= BODY.join ? ROOT[0] + dRoot * (u - BODY.join) : ROOT[0] + dRoot * 40 * (1 - Math.exp(-(u - BODY.join) / 40));
    // (and past the far end of the stone, going on down out of sight)
    const z = lerp(lerp(zRoot, zH, a), -100, sm(BODY.dive, BODY.to, u));
    // (swaying out and in as it swims)
    const o = LANE.out + BODY.out * sm(BODY.join - 20, 540, u) + BODY.sway * a * (1 + Math.sin(w));
    out.push([X - s * u, yE - inw * o, z, r]);
  }
  return out;
}
/** A scraper's body where it is in the world at frame `k` of the shovel at end `e` (as laid: the painted end's, flipped at the mirrored
 *  end, slid along, down as far as it is); empty when it is not up. */
export function bodyPath(e: End, i: number, k: number): P3[] {
  const A = scraperAt(e, i, k);
  if (!A) return [];
  const pe = paintedAt(e);
  const lf = mod(k, HEAD_LOOP);
  return bodyWorld(pe, SCRAPERS[i].edge, 0, Math.floor(lf / (HEAD_LOOP / BODY.loop)) / BODY.loop).map((q) => [(pe === e ? q[0] : -q[0]) + A.X, q[1], q[2] - A.drop, q[3]]);
}
/** Where a scraper is at frame `k` of the shovel: its head's front (`X`, the world's across), how far down it is (coming up or going under),
 *  how far its hook is drawn back, its writhe's clock, and what it is doing. Null before it comes up and after it has gone under. */
export function scraperAt(e: End, i: number, k: number): { X: number; drop: number; back: number; t: number; is: 'up' | 'sweep' | 'held' | 'retract' | 'back' | 'under'; f: number } | null {
  const S = SCRAPERS[i];
  const f = k - S.k0;
  if (f < 0 || f >= SCRAPE_FRAMES) return null;
  const s = sideOf(e);
  // (his end and the far end, across)
  const xEnd = s * STONE_BOX.x1;
  const xStart = -s * (STONE_BOX.x1 + START_OUT);
  const xStop = xEnd - s * STOP_IN;
  const t = mod(k, HEAD_LOOP) / HEAD_LOOP;
  const C = SCRAPE;
  if (f < C.up) return { X: xStart, drop: 90 * (1 - sm(0, C.up, f + 1)), back: 0, t, is: 'up', f };
  if (f < C.up + SWEEP) return { X: lerp(xStart, xStop, (f - C.up) / SWEEP), drop: 0, back: 0, t, is: 'sweep', f };
  if (f < C.up + SWEEP + C.held) return { X: xStop, drop: 0, back: 0, t, is: 'held', f };
  if (f < C.up + SWEEP + C.held + C.retract) return { X: xStop, drop: 0, back: sm(0, C.retract, f - C.up - SWEEP - C.held + 1), t, is: 'retract', f };
  if (f < C.up + SWEEP + C.held + C.retract + C.back) {
    const g = (f - C.up - SWEEP - C.held - C.retract + 1) / C.back;
    return { X: lerp(xStop, xStart, sm(0, 1, g)), drop: 0, back: 1, t, is: 'back', f };
  }
  return { X: xStart, drop: 90 * sm(0, C.under, f - C.up - SWEEP - C.held - C.retract - C.back + 1), back: 1, t, is: 'under', f };
}

// =============================================================================================
// THE WARRIOR

/** The Warrior's way through each shovel (his lengths: how far onto the stone from his end, `x`; how deep onto it, `y`), by frame, and
 *  what he does there. Left: dodging the first, caught by the second and knocked toward the mouth, down, up as the jaws twitch and
 *  rolling clear of the snap, through the last two. Right: weaving through all four. */
interface Mark {
  k: number;
  x: number;
  y: number;
  act?: 'roll' | 'knock' | 'down';
}
export const HERO_WAY: Record<End, Mark[]> = {
  left: [
    { k: 0, x: 300, y: 560 },
    { k: 84, x: 330, y: 560 },
    { k: 106, x: 330, y: 680 },
    { k: 128, x: 330, y: 680 },
    { k: 160, x: 330, y: 476 },
    { k: 161, x: 330, y: 474, act: 'knock' },
    { k: 171, x: 75, y: 430, act: 'down' },
    { k: 193, x: 75, y: 430 },
    { k: 194, x: 76, y: 430, act: 'roll' },
    { k: 203, x: 150, y: 430 },
    { k: 233, x: 140, y: 680 },
    { k: 240, x: 140, y: 680 },
    { k: 274, x: 160, y: 395 },
    { k: 352, x: 160, y: 395 },
  ],
  right: [
    { k: 0, x: 300, y: 560 },
    { k: 84, x: 330, y: 560 },
    { k: 106, x: 330, y: 680 },
    { k: 124, x: 330, y: 680 },
    { k: 158, x: 330, y: 395 },
    { k: 168, x: 330, y: 395 },
    { k: 216, x: 330, y: 680 },
    { k: 228, x: 330, y: 680 },
    { k: 262, x: 330, y: 395 },
    { k: 352, x: 330, y: 395 },
  ],
};
/** Where the Warrior is (the world's across and depth) at frame `k` of a shovel; what he does. */
export function heroWorld(e: End, k: number): { x: number; y: number; act: HeroAt['act']; f: number; lift: number; moving: [number, number] } {
  const M = HERO_WAY[e];
  let i = 0;
  while (i < M.length - 2 && k >= M[i + 1].k) i++;
  const a = M[i];
  const b = M[Math.min(M.length - 1, i + 1)];
  const u = b.k > a.k ? clamp01((k - a.k) / (b.k - a.k)) : 0;
  // (knocked flying: thrown, fastest at first; else running at an even pace)
  const e2 = b.act === 'down' ? 1 - (1 - u) ** 2 : u;
  const xr = lerp(a.x, b.x, e2);
  const y = lerp(a.y, b.y, e2);
  const s = sideOf(e);
  const x = s * STONE_BOX.x1 - s * xr;
  let act: HeroAt['act'] = 'idle';
  let lift = 0;
  if (b.act === 'down' && u < 1) {
    act = 'knock';
    lift = 70 * Math.sin(Math.PI * u);
  } else if (a.act === 'down' && u < 1) act = 'down';
  else if (a.act === 'roll' || (b.act === 'roll' && u > 0.9)) act = 'roll';
  else if (Math.hypot(b.x - a.x, b.y - a.y) > 1 && u > 0 && u < 1) act = 'run';
  const u1 = b.k > a.k ? clamp01((k + 1 - a.k) / (b.k - a.k)) : 0;
  const e3 = b.act === 'down' ? 1 - (1 - u1) ** 2 : u1;
  const moving: [number, number] = [s * STONE_BOX.x1 - s * lerp(a.x, b.x, e3) - x, lerp(a.y, b.y, e3) - y];
  return { x, y, act, f: k - a.k, lift, moving };
}
/** Whether he is struck in frame `k` (the knock's first frames: the one place he may touch a tentacle). */
export const heroStruck = (e: End, k: number): boolean => e === 'left' && k >= 159 && k <= 163;
/** WHERE A TIP HAS SCORED THE STONE by frame `k`: the point it drags on the stone (`scrapeAt`) in each frame of its sweep so far while
 *  that is on the stone, and how long ago (seconds); none once all of it has faded (4 s). */
export function scorePath(e: End, i: number, k: number): Array<[number, number, number]> {
  const Sc = SCRAPERS[i];
  const out: Array<[number, number, number]> = [];
  for (let g = Sc.k0 + SCRAPE.up; g <= Math.min(k, Sc.k0 + SCRAPE.up + SWEEP - 1); g++) {
    const A = scraperAt(e, i, g);
    if (!A || A.is !== 'sweep') continue;
    const p = scrapeAt(e, Sc.edge, mod(g, HEAD_LOOP) / HEAD_LOOP, A.X);
    if (Math.abs(p[0]) > STONE_BOX.x1 - 2) continue;
    const age = (k - g) / EYE_FPS;
    if (age < SCORE_FADE[1]) out.push([p[0], p[1], age]);
  }
  return out;
}
/** A score's marks fading (seconds after they were made: the gouges from the first to the second; the wet slime smear sooner). */
export const SCORE_FADE = [1.2, 4] as const;
export const SMEAR_FADE = [0.2, 1.8] as const;
const hs = (a: number, b: number, c: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return v - Math.floor(v);
};
/** A SCORE'S MARKS, as the game draws them along a tip's path (its points, `scorePath`): in each frame's step of it, two or three short
 *  ragged scratches gouged side by side, each a part of the step only, its ends jittered across, so that none runs on straight; grit
 *  thrown out of them; and a wet smear of slime over them. Each a piece (the world's across and depth, his lengths): its two ends, how
 *  wide, how strong (0 to 1, by how long ago), and what. */
export interface ScoreMark { x0: number; y0: number; x1: number; y1: number; w: number; a: number; kind: 'gouge' | 'grit' | 'slime' }
export function scoreMarks(seed: number, pts: ReadonlyArray<readonly [number, number, number]>): ScoreMark[] {
  const out: ScoreMark[] = [];
  for (let n = 1; n < pts.length; n++) {
    const [xa, ya, age] = pts[n];
    const [xb, yb] = pts[n - 1];
    const fade = 1 - sm(SCORE_FADE[0], SCORE_FADE[1], age);
    const wet = 1 - sm(SMEAR_FADE[0], SMEAR_FADE[1], age);
    const m = 2 + Math.floor(hs(seed, n, 1) * 2);
    for (let q = 0; q < m; q++) {
      // (a scratch: a part of the step only, beside the path and across it a little, ragged at its ends; now and then none)
      if (hs(seed, n, 40 + q) < 0.35) continue;
      const off = (hs(seed, n, 10 + q) - 0.5) * 14 + (q - (m - 1) / 2) * 5;
      const u0 = 0.05 + 0.45 * hs(seed, n, 20 + q);
      const u1 = u0 + 0.2 + 0.35 * hs(seed, n, 30 + q);
      out.push({
        x0: lerp(xa, xb, u0), y0: lerp(ya, yb, u0) + off + (hs(seed, n, 50 + q) - 0.5) * 6,
        x1: lerp(xa, xb, Math.min(1, u1)), y1: lerp(ya, yb, Math.min(1, u1)) + off + (hs(seed, n, 60 + q) - 0.5) * 6,
        w: hs(seed, n, 70 + q) < 0.3 ? 2 : 1, a: fade, kind: 'gouge',
      });
    }
    // (grit out of it)
    for (let q = 0; q < 3; q++) {
      const u = hs(seed, n, 80 + q);
      const x = lerp(xa, xb, u) + (hs(seed, n, 90 + q) - 0.5) * 6;
      const y = lerp(ya, yb, u) + (hs(seed, n, 100 + q) - 0.5) * 16;
      out.push({ x0: x, y0: y, x1: x, y1: y, w: 1, a: fade, kind: 'grit' });
    }
    // (the slime it leaves: a blotch or two of a wet smear in the step, here and there across the path, never a band)
    if (wet > 0) for (let q = 0; q < 2; q++) {
      if (hs(seed, n, 113 + q) < 0.35) continue;
      const u0 = 0.6 * hs(seed, n, 115 + q);
      const u1 = u0 + 0.15 + 0.3 * hs(seed, n, 117 + q);
      const off = (hs(seed, n, 119 + q) - 0.5) * 16;
      out.push({ x0: lerp(xa, xb, u0), y0: lerp(ya, yb, u0) + off, x1: lerp(xa, xb, Math.min(1, u1)), y1: lerp(ya, yb, Math.min(1, u1)) + off + (hs(seed, n, 121 + q) - 0.5) * 5, w: 3 + 4 * hs(seed, n, 112 + q), a: wet, kind: 'slime' });
    }
  }
  return out;
}

// =============================================================================================
// THE WATER POURING OFF HIM AS HE BURSTS UP (the game's, drawn over him by the pictures' tool)

/** How much water is still pouring off him (1 as he bursts up, thinning over the roar), frame `k`. */
export const pourAt = (k: number): number => (k >= SHOVEL.burst[0] ? 1 - sm(SHOVEL.burst[0] + 10, SHOVEL.burst[0] + 50, k) : 0);
/** A smooth noise in two numbers (0 to 1). */
function vn2(x: number, y: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hs(xi, yi, s);
  const b = hs(xi + 1, yi, s);
  const c = hs(xi, yi + 1, s);
  const d = hs(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}
/** THE SHEETS OF WATER SLIDING DOWN OFF HIM, at a pixel of him (picture pixels: `i` across, `jp` down his own painting), frame `k`: 0
 *  none, 1 a thin sheet of black water over him, 2 a thick one, 3 its leading lip catching the light. Broad sheets and narrow ropes,
 *  each sliding down at its own pace, wandering as they go, never in ruled columns; fewer and thinner as he roars. */
export function pourSheet(i: number, jp: number, k: number): 0 | 1 | 2 | 3 {
  const p = pourAt(k);
  if (p <= 0.02) return 0;
  const age = (k - SHOVEL.burst[0]) / EYE_FPS;
  // (across: warped by how far down, so that a sheet's edges wander as it runs)
  const v = i * 0.06 + 0.7 * Math.sin(jp * 0.035 + i * 0.013) + 0.4 * Math.sin(jp * 0.083 + i * 0.041 + 1.3) + 0.25 * Math.sin(jp * 0.19 + i * 0.07 + 2.6) + 0.16 * Math.sin(jp * 0.33 + i * 0.03 + 0.9);
  // (its own pace: by where across, smoothly; its front ragged across, never level)
  const pace = 1.4 + 1.2 * vn2(v * 0.7, 3.1, 501);
  const u = jp * 0.024 - age * pace * 2.2 + 0.2 * Math.sin(i * 0.13 + jp * 0.02 + 0.4) + 0.1 * Math.sin(i * 0.31 + 1.7);
  // (the noise's own grid turned a little off the picture's, so that none of its edges lies along a row or a column)
  const R = (a: number, b: number): number => vn2(a * 0.978 + b * 0.208, b * 0.978 - a * 0.208, 502);
  // (its edges wet and ragged, pixel by pixel)
  const jit = 0.06 * (hs(i, jp, 7) - 0.5);
  const n = R(v, u) + jit;
  const th = 0.78 - 0.3 * p;
  if (n < th) return 0;
  const lip = R(v, u + 0.09) + jit < th;
  return lip ? 3 : n > th + 0.1 ? 2 : 1;
}
/** A ROPE OF WATER POURING OFF AN OVERHANG of him, `len` picture pixels down to the water, `age` seconds after he burst up: its blobs
 *  (picture pixels from where it leaves him: across, down; how wide; what): a rope of black water wavering and necking as it falls,
 *  breaking into gobs and drops below, a gob of slime or a strand of weed in it now and then; at the bottom the foam it crashes into. */
export interface PourBlob { di: number; dj: number; r: number; kind: 'water' | 'lit' | 'slime' | 'weed' | 'foam' }
export function pourRope(seed: number, len: number, age: number, p: number): PourBlob[] {
  const out: PourBlob[] = [];
  if (p <= 0.02 || len < 4) return out;
  const unbroken = len * (0.2 + 0.35 * hs(seed, 1, 0)) * p;
  const ph = hs(seed, 2, 0) * TAU;
  const lean = (hs(seed, 3, 0) - 0.5) * 0.12;
  const wob = (s: number): number => (0.9 + 1.4 * (s / len)) * Math.sin(s * 0.19 + ph + age * 9) + 0.5 * Math.sin(s * 0.47 + ph * 2 + age * 13) + lean * s;
  // (the rope: wavering, necking)
  for (let s = 0; s < unbroken; s++) {
    const r = (1.1 + 0.9 * p) * (1 - 0.45 * (s / Math.max(1, unbroken))) + 0.5 * Math.sin(s * 0.31 + ph);
    out.push({ di: wob(s), dj: s, r: Math.max(0.5, r), kind: s % 7 < 2 ? 'lit' : 'water' });
  }
  // (below it, gobs and drops, falling faster the further they fall, each its own size; slime and weed among them)
  const gap = 7 + 6 * hs(seed, 4, 0);
  const fall = (age * 30 * (5 + 3 * hs(seed, 5, 0))) % gap;
  for (let s = unbroken + fall, q = 0; s < len; s += gap * (1 + 0.04 * (s - unbroken)), q++) {
    const w = hs(seed, 6, q);
    if (w > 0.55 + 0.4 * p) continue;
    const kind = w < 0.06 ? 'slime' : w < 0.1 ? 'weed' : w < 0.35 ? 'lit' : 'water';
    const r = kind === 'weed' ? 0.8 : 0.6 + 1.4 * hs(seed, 7, q) * p;
    out.push({ di: wob(s) + (hs(seed, 8, q) - 0.5) * 2, dj: s, r, kind });
    if (kind !== 'weed' && r > 1) out.push({ di: wob(s) + (hs(seed, 8, q) - 0.5) * 2, dj: s - r * 1.4, r: r * 0.6, kind });
  }
  // (crashing into the water: foam thrown up round where it lands)
  for (let q = 0; q < 6; q++) {
    const a = hs(seed, 9, q) * TAU;
    const rr = 2 + 4 * hs(seed, 10, q) * p;
    out.push({ di: wob(len) + Math.cos(a) * rr, dj: len - Math.abs(Math.sin(a)) * rr * 0.5 - hs(seed, 11, q) * 3 * p, r: 0.6 + 0.8 * hs(seed, 12, q), kind: 'foam' });
  }
  return out;
}

/** The Warrior as the pictures' tool draws him. */
function heroAt(e: End, k: number): HeroAt {
  const h = heroWorld(e, k);
  const view = h.moving[1] > 0.5 ? 'front' : 'back';
  return { du: h.x / UNIT, dv: h.y / UNIT - QUAY, view, act: h.act, f: h.f, lift: h.lift };
}

// =============================================================================================
// HIS POSES AND THE FRAMES

const ROLL0: [number, number, number, number] = [0, 0, 0, 0];
/** His animation at frame `k` at an end: his stand's own clock (his tongue weaving, his flesh sliding, his drips), his jaws as open as
 *  the shovel has them, his eye's gaze on the Warrior, his throat glowing hot as he roars. */
export function sideAnim(e: End, k: number, snap: boolean, pe: End = e): ColossusAnim {
  const t = k / EYE_FPS;
  const st = standAnim(t);
  const open = openAt(k, snap);
  const tin = tongueInAt(k, snap);
  // (his tongue drawn in toward its root, into his throat)
  const T0 = st.tongue as number[][];
  const root = T0[0];
  const tongue = tin >= 0.92 || open < 0.9 ? null : T0.map((q) => q.map((v, c) => (c < 3 ? lerp(v, root[c], tin) : v)));
  const eye = st.eye.map((v, c) => lerp(v, root[c], tin)) as [number, number, number];
  // (looking at the Warrior: his gaze in his own space, and a little toward you; painted as at end `pe`, mirrored, the Warrior where the
  // mirror puts him)
  const h = heroWorld(e, k);
  const hx = pe === e ? h.x : -h.x;
  e = pe;
  const at = placeOf(e);
  const H = toHis(e, [hx, h.y, 40 + h.lift], at, 0, lungeAt(k, snap));
  const g = [H[0] - eye[0], H[1] - eye[1], H[2] - eye[2]];
  const gl = Math.hypot(g[0], g[1], g[2]) || 1;
  const you = toHis(e, [at[0] + GAZE_AT_YOU[0] * 100, at[1] + GAZE_AT_YOU[1] * 100, GAZE_AT_YOU[2] * 100], at, 0, ROLL0);
  const yl = Math.hypot(you[0], you[1], you[2]) || 1;
  const gaze: [number, number, number] = [(g[0] / gl) * 0.75 + (you[0] / yl) * 0.25, (g[1] / gl) * 0.75 + (you[1] / yl) * 0.25, (g[2] / gl) * 0.75 + (you[2] / yl) * 0.25];
  const roar = sm(SHOVEL.roar[0], 68, k) * (1 - sm(78, SHOVEL.roar[1], k));
  const glow = st.glow * (1 + 0.9 * roar) + (snap && k >= SNAP.at && k < SNAP.at + SNAP.twitch + 1 ? 0.6 : 0);
  return { ...st, open, tongue, eye, gaze, glow, lids: tongue ? 1 : 0 };
}
/** His pose at an end, a part of him, lunged (`L`, as `lungeAt`: up out of the water, tipped forward, leaning; painted so, for what of
 *  him comes up out of the water to be painted). */
export function sidePose(e: End, an: ColossusAnim, parts: 'jaws' | 'spit' | 'tongue' | 'all', L: readonly number[] = ROLL0): ColossusPose {
  const lean = leanOf(L[3] ?? 0);
  return { view: 'front', drop: -(L[1] ?? 0), back: 0, body: true, gaze: an.gaze, arms: [], anim: { ...an, parts: parts === 'all' ? undefined : parts }, orient: orientOf(e, L[2] ?? 0), ...(lean ? { lean } : {}) };
}
/** The frame of his jaws' painting at frame `k`: the same painting wherever his jaws are the same (his burst up; his gaping's loop of a
 *  second; held shut). */
function jawsKey(e: End, k: number, snap: boolean): { key: string; k: number } {
  const c = e[0];
  if (k < SHOVEL.roar[0]) return { key: `VJ.${c}.burst`, k: SHOVEL.roar[0] - 1 };
  if (k < SHOVEL.roar[1]) return { key: `VJ.${c}.r.${pad(k)}`, k };
  const f = k - SNAP.at;
  if (snap && f >= 0 && f < SNAP.frames) {
    if (f === SNAP.twitch + 1) return { key: `VJ.${c}.shut`, k: SNAP.at + SNAP.twitch + 1 };
    if (f > SNAP.twitch + 1 && f < SNAP.twitch + SNAP.strike + SNAP.held) return { key: `VJ.${c}.clench`, k: SNAP.at + SNAP.twitch + 2 };
    return { key: `VJ.${c}.n.${pad(f)}`, k };
  }
  // (his gaping: a loop of a second)
  const lf = mod(k - SHOVEL.roar[1], 30);
  return { key: `VJ.${c}.g.${pad(lf)}`, k: SHOVEL.roar[1] + lf };
}
/** THE PAINTED RIGHT END (his word, 8 Nov: “Mirror it but save the old one just in case.”): off, at the right end he and his
 *  tentacles are the left end's paintings flipped about his own middle (the stone, the water, the hero and the game's effects never
 *  flipped); on, the right end's own paintings (him turned his own way round there), kept so they can be brought back. */
export const SHOVEL_PAINTED_RIGHT = { on: false };
/** The end whose paintings show at end `e`: its own, or at the right end the left's, mirrored. */
export const paintedAt = (e: End): End => (e === 'right' && !SHOVEL_PAINTED_RIGHT.on ? 'left' : e);
/** The frames of a shovel: `s1` at the left end (with the snap), `s2` at the right. */
export const SHOVEL_SHOTS = { s1: { end: 'left' as End, snap: true }, s2: { end: 'right' as End, snap: false } } as const;

/** A FRAME OF HIS SHOVEL. */
export function shovelFrame(shot: 's1' | 's2', k: number): EyeFrame {
  const { end: e, snap } = SHOVEL_SHOTS[shot];
  const S = SHOVEL;
  // (whose paintings: this end's own, or the left end's mirrored)
  const pe = paintedAt(e);
  const MR = pe !== e;
  const c = pe[0];
  const t = k / EYE_FPS;
  const at = placeOf(e);
  const drop = dropAt(k);
  const lunge = lungeAt(k, snap);
  const s = sideOf(e);
  // (him: at his place, his stand's own layers going down or coming up; at the end, his side's)
  let jaws: EyeLayer;
  let spit: EyeLayer | null = null;
  let tongue: EyeLayer | null = null;
  const arms: Array<EyeLayer | null> = [];
  const smear: Array<EyeLayer | null> = [];
  if (!atEnd(k)) {
    const SL = standLayersAt(mod(k, 90));
    const d = drop + deepAt(k);
    jaws = { ...SL.jaws, drop: d };
    spit = SL.spit ? { ...SL.spit, drop: d } : null;
    tongue = SL.tongue ? { ...SL.tongue, drop: d } : null;
    for (let i = 0; i < 3; i++) {
      arms.push(d < SUNK_DOWN ? { ...armStandLayer(i, k), drop: d } : null);
      smear.push(null);
    }
  } else {
    // (painted as at end `pe`: its own, or the left end's mirrored; laid where he is at this end)
    const an = sideAnim(e, k, snap, pe);
    const J = jawsKey(pe, k, snap);
    const anJ = J.k === k ? an : sideAnim(e, J.k, snap, pe);
    const lay = (key: string, pose: ColossusPose): EyeLayer => ({ key, pose, drop: drop + deepAt(k), back: -at[1], dx: at[0] - s * lunge[0], ...(MR ? { mirror: true } : {}) });
    jaws = lay(J.key, sidePose(pe, { ...anJ, tongue: null }, 'jaws', lungeAt(J.k, snap)));
    if (k >= S.burst[0]) spit = lay(`VS.${c}.${pad(k)}`, sidePose(pe, an, 'spit', lunge));
    if (an.tongue && k >= S.burst[0]) tongue = lay(`VT.${c}.${pad(k)}`, sidePose(pe, an, 'tongue', lunge));
    // (bursting up and slamming shut: the frame before, smeared behind)
    const f = k - SNAP.at;
    if ((k > S.burst[0] && k < S.burst[1]) || (snap && f >= SNAP.twitch && f < SNAP.twitch + SNAP.strike)) {
      const Jp = jawsKey(pe, k - 1, snap);
      const pl = lungeAt(k - 1, snap);
      smear.push({ key: Jp.key, pose: sidePose(pe, { ...sideAnim(e, Jp.k, snap, pe), tongue: null }, 'jaws', lungeAt(Jp.k, snap)), drop: dropAt(k - 1), back: -at[1], dx: at[0] - s * pl[0], ...(MR ? { mirror: true } : {}) });
    }
  }
  // (the scrapers: each its head and its body)
  const scores: ShovelFx['scores'] = [];
  const scrapes: ShovelFx['scrapes'] = [];
  SCRAPERS.forEach((Sc, i) => {
    const A = scraperAt(e, i, k);
    // (where its tip has dragged on the stone so far, frame by frame, each with how long ago: the game gouges it there, fading)
    const pts = scorePath(e, i, k);
    if (pts.length) scores.push({ seed: i * 17 + (e === 'left' ? 0 : 5), pts });
    if (!A) {
      arms.push(null);
      arms.push(null);
      smear.push(null);
      smear.push(null);
      return;
    }
    const lf = mod(k, HEAD_LOOP);
    const H = headLocal(Sc.edge, lf / HEAD_LOOP, A.back);
    // (painted with its front at 0 across, laid where it is)
    const headP = headWorld(pe, Sc.edge, H, 0);
    const key = `AH.${c}.${Sc.edge[0]}.${A.back >= 1 ? `b${pad(lf)}` : A.back > 0 ? `r${Math.round(A.back * 6)}.${pad(lf)}` : `h${pad(lf)}`}`;
    const mr = MR ? { mirror: true } : {};
    arms.push({ key, pose: scraperPose(headP, k, hookBelly(pe, Sc.edge)), drop: A.drop, back: 0, dx: A.X, ...mr });
    const bl = Math.floor(lf / (HEAD_LOOP / BODY.loop));
    arms.push({ key: `AB.${c}.${Sc.edge[0]}.${pad(bl)}`, pose: scraperPose(bodyWorld(pe, Sc.edge, 0, bl / BODY.loop), 0, bodyBelly(pe, Sc.edge, bl)), drop: A.drop, back: 0, dx: A.X, ...mr });
    smear.push(null);
    smear.push(null);
    if (A.is === 'sweep' && A.drop === 0) {
      // (where it scrapes the stone, and how fast)
      const tp = scrapeAt(e, Sc.edge, lf / HEAD_LOOP, A.X);
      if (tp[0] * s < STONE_BOX.x1 && tp[0] * -s < STONE_BOX.x1) scrapes.push({ x: tp[0], y: tp[1], dir: s, speed: SCRAPE_V * EYE_FPS, seed: i * 7 + (e === 'left' ? 0 : 3) });
    }
  });
  // (the Warrior struck)
  const hitK = 159;
  const hit = e === 'left' && k >= hitK && k < hitK + 30 ? (() => {
    const h = heroWorld(e, hitK);
    return { x: h.x, y: h.y, s: (k - hitK) / EYE_FPS };
  })() : null;
  const sfx: ShovelFx = {
    at,
    tell: k >= S.tell[0] && k < S.burst[1] ? sm(S.tell[0], S.tell[1], k) : null,
    burst: k >= S.burst[0] && k < S.burst[0] + 60 ? (k - S.burst[0]) / EYE_FPS : null,
    pour: pourAt(k),
    snap: snap && k >= SNAP.at + SNAP.twitch + 1 && k < SNAP.at + SNAP.twitch + 50 ? (k - SNAP.at - SNAP.twitch - 1) / EYE_FPS : null,
    scrapes,
    scores,
    hit,
    up: k >= S.burst[0] ? e : null,
  };
  // (the water: where he is; sinking, the bubbles and the swell over him; the boil off the end, held; his burst)
  const water: EyeWater = {
    sunk: k < S.tell[1] ? sm(S.sink[0], S.sink[1], k) : k < S.burst[1] ? 1 : k >= S.back[0] && k < S.rise[1] ? sm(S.back[0], S.back[1], k) * (1 - sm(S.rise[0], S.rise[1], k)) : 0,
    pulse: 1,
    bubbles: k < S.burst[0] ? 0.4 + 0.6 * sm(S.sink[0] + 8, S.tell[1], k) : k >= S.back[0] && k < S.rise[1] ? 0.8 : 0.1,
    swell: k < S.burst[0] ? 0.4 + 1.2 * sm(S.sink[0], S.tell[1], k) : 0.15 + (k >= S.back[0] && k < S.rise[1] ? 1 : 0),
    slicks: 0,
    boil: k >= S.tell[0] && k < S.burst[1] + 6 ? sm(S.tell[0], S.tell[1] - 6, k) * (1 - sm(S.burst[1], S.burst[1] + 6, k)) : k >= S.rise[0] - 10 && k < S.rise[1] ? sm(S.rise[0] - 10, S.rise[0] + 4, k) * (1 - sm(S.rise[0] + 16, S.rise[1], k)) : 0,
    rising: false,
    roar: null,
    bursts: [],
    at: k >= S.tell[0] && k < S.back[1] + 4 ? at : [0, 0],
  };
  // (the screen: rumbling as he sinks and as the end shudders; jolted as he bursts up; the roar; the snap's clash; the Warrior struck)
  const shake = shakeAt(e, k, snap);
  const camX = camAt(e, k);
  return { move: shot, k, t, jaws, spit, tongue, arms, smear, shake, dark: 0, water, hero: heroAt(e, k), camY: camYAt(k), camX, sfx };
}
/** Which way a hook's suckers face: the inside of its hook as it lies at rest (`armBelly`), held so as it writhes and is drawn back. */
const BELLY = new Map<string, [number, number, number]>();
export function hookBelly(e: End, edge: 'back' | 'near'): [number, number, number] {
  const key = `${e}.${edge}`;
  let b = BELLY.get(key);
  if (!b) {
    b = armBelly({ path: headWorld(e, edge, headLocal(edge, 0, 0), 0), r: LANE.r, belly: [0, 0, -1], seed: 41 });
    BELLY.set(key, b);
  }
  return b;
}
/** Which way its BODY's suckers are held (`bodyWorld`), so that where it meets its hook it is painted as its hook is there: the way its
 *  hook's underside faces at its root (where the body begins, 240 back from its front: as the painter carries it along the hook, from its
 *  tip's curl), given so that the painter, carrying it along the body from near its far end, brings it there the same way round (within a
 *  few degrees). For the hook as it lies at `lf` of its writhe. */
const BODY_BELLY = new Map<string, [number, number, number]>();
export function bodyBelly(e: End, edge: 'back' | 'near', lf: number): [number, number, number] {
  const key = `${e}.${edge}.${lf}`;
  let b = BODY_BELLY.get(key);
  if (b) return b;
  const H = headWorld(e, edge, headLocal(edge, lf / HEAD_LOOP, 0), 0);
  const A = armOf({ path: H, r: LANE.r, belly: hookBelly(e, edge), seed: 41, fixed: true });
  let best = 0;
  const d = (i: number): number => Math.hypot(A.p[i * 4] - H[1][0], A.p[i * 4 + 1] - H[1][1], A.p[i * 4 + 2] - H[1][2]);
  for (let i = 0; i < A.n; i++) if (d(i) < d(best)) best = i;
  // (the painter sets a tube's underside from what it is given as 0.9 of it and a little up, 0.2: so given back so; and if, carried along
  // the body's humps and turned at its root, it does not come out the hook's way there, the way that does, of those all round)
  const g = [A.inner[best * 3], A.inner[best * 3 + 1], A.inner[best * 3 + 2]];
  const P = bodyWorld(e, edge, 0, lf / BODY.loop);
  const off = (c: [number, number, number]): number => {
    const B = armOf({ path: P, r: LANE.r, belly: c, seed: 41, fixed: true });
    return Math.acos(Math.max(-1, Math.min(1, B.inner[0] * g[0] + B.inner[1] * g[1] + B.inner[2] * g[2])));
  };
  b = [g[0] / 0.9, (g[1] - 0.2) / 0.9, g[2] / 0.9];
  let bo = off(b);
  if (bo > 0.15) {
    const n = 240;
    for (let q = 0; q < n; q++) {
      const zz = 1 - (2 * (q + 0.5)) / n;
      const rr = Math.sqrt(1 - zz * zz);
      const th = q * 2.399963;
      const c: [number, number, number] = [rr * Math.cos(th), rr * Math.sin(th), zz];
      const o = off(c);
      if (o < bo) {
        bo = o;
        b = c;
      }
    }
  }
  BODY_BELLY.set(key, b);
  return b;
}
/** A scraper's pose for the painter: a tube of the given points and thicknesses, its suckers held facing `belly`, its clock. */
function scraperPose(P: P3[], k: number, belly: [number, number, number]): ColossusPose {
  const a: ArmPose = { path: P, r: LANE.r, belly, seed: 41, fixed: true };
  const an: ColossusAnim = { t: mod(k, HEAD_LOOP) / EYE_FPS, open: 1, tongue: null, eye: [0, 0, 0], gaze: [0, 1, 0], lids: 1, glow: 1 };
  return { view: 'front', drop: 0, body: false, gaze: [0, 1, 0], arms: [a], anim: an };
}
/** What his shovel throws that the game draws, its colours: the sparks struck off the stone by a scraping tip, white-hot cooling to gold
 *  and an ember as they fly (the enemy's, never cyan). */
export const SHOVEL_COLOURS = { spark: ['#fff6dc', '#ffe08a', '#f0a040', '#a0502a'] } as const;
/** THE SCREEN'S SHAKE (game pixels): the rumble as he sinks and as the stone's end shudders (`rumble`), the jolt of his burst (`burst`),
 *  his roar, the snap's clash, the Warrior struck. */
export const SHOVEL_SHAKE = { rumble: 2, burst: 9, burstLong: 14, roar: 5, snap: 10, snapLong: 16, hit: 5, hitLong: 8 } as const;
const h1 = (n: number, s: number): number => {
  const v = Math.sin(n * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export function shakeAt(e: End, k: number, snap: boolean): [number, number] {
  const S = SHOVEL;
  const Z = SHOVEL_SHAKE;
  // (the rumble: as he sinks, as the stone's end shudders, as he roars, as he goes back; every way, at random)
  let r = 0;
  if (k < S.sink[1] + 6) r = Math.max(r, Z.rumble * sm(S.sink[0], 6, k));
  if (k >= S.tell[0] && k < S.burst[0]) r = Math.max(r, Z.rumble * (0.5 + 0.5 * sm(S.tell[0], S.tell[1], k)));
  if (k >= S.roar[0] + 2 && k < S.roar[1]) r = Math.max(r, Z.roar * sm(S.roar[0], 68, k) * (1 - sm(76, S.roar[1], k)));
  if (k >= S.back[0] && k < S.back[1]) r = Math.max(r, Z.rumble);
  if (k >= S.rise[0] && k < S.rise[1]) r = Math.max(r, Z.rumble * (1 - sm(S.rise[1] - 8, S.rise[1], k)));
  let x = r * (h1(k, 1) * 2 - 1);
  let y = r * (h1(k, 2) * 2 - 1);
  // (the jolts: his burst, the snap's clash, the Warrior struck; thrown up and down, dying away, a little aside)
  const jolt = (f: number, a: number, long: number): void => {
    if (f < 0 || f >= long) return;
    const v = a * (1 - f / long);
    y += v * (f % 2 ? -1 : 1);
    x += v * 0.5 * (h1(f + k, 3) * 2 - 1);
  };
  jolt(k - S.burst[1] + 1, Z.burst, Z.burstLong);
  if (snap) jolt(k - SNAP.at - SNAP.twitch - 1, Z.snap, Z.snapLong);
  if (e === 'left') jolt(k - 159, Z.hit, Z.hitLong);
  return [Math.round(x), Math.round(y)];
}
/** THE CAMERA, following the Warrior to the end where he is (picture pixels across): there, his whole maw and most of the stone; and
 *  lowered from the stills' (picture pixels down) so that the whole depth of the stone is seen, its near edge and the water before it. */
export const CAM_END = 320;
export const CAM_Y = 262;
/** How far the camera has gone to the end (0 at his place, 1 at the end), frame `k`. */
const camU = (k: number): number => sm(SHOVEL.tell[0], SHOVEL.tell[1], k) * (1 - sm(SHOVEL.back[1], SHOVEL.rise[1], k));
function camAt(e: End, k: number): number {
  return Math.round(sideOf(e) * CAM_END * camU(k));
}
/** At his place the camera as the tentacles' films have it (`CAM_ARMS`), lowered to `CAM_Y` as it goes to the end. */
const camYAt = (k: number): number => Math.round(CAM_ARMS + (CAM_Y - CAM_ARMS) * camU(k));
/** The frames of each shot. */
export const SHOVEL_FRAMES = { s1: SHOVEL.frames, s2: SHOVEL.frames } as const;
/** His stone's measures (for the checks). */
export const STONE_ = STONE;
