// THE SWAMP COLOSSUS'S MOVES, PART 2: HIS TENTACLES, EACH A FIGURE OF ITS OWN (painted by art/eye_colossus.ts, a layer each; a mock-up
// behind EYE2, off; nothing of the game imports it: tests/eye_arms.test.ts). The owner, 7 Nov 2026: shown the roar, “Yes, on to the
// tentacles (Recommended)”; of the old fight, 5 Nov, “You need some more time to dodge those tentacles.” (so every warning reads
// clearly and is held); 20:25, “Beyond just slamming down on the platform, I’d also like the tentacles to slam the water on the left
// sending a wave right across the platform, then on the right sending a wave to the left, then both sides simultaneously to send a big
// crash into the middle”; and how a wave is got past, “Outrun or dodge through”. His rules: Movement 9 (a big held wind-up, a strike
// of one or two smeared frames, a big wind-down), “Action, like a movie”, nothing through anything, and “Everything drawn should not
// just look like shapes.  That’s the rule”. The tentacles stay one smooth taper, no sections.
//
// What is here, 30 pictures a second:
//   ITS STAND (art/eye_moves.ts armStand: a loop of ARM_LOOP, never still);
//   THE SLAM ON THE STONE (`armSlam`): its wind-up held (rearing back and up, coiling, quivering at the top; the game's pink line
//     on the stone under where it will fall), its strike in two smeared frames, landing ALONG THE LINE lying on the stone, a beat
//     lying there, then dragged back up into its stand; for any turn of the line toward the hero (`ARM_TURNS`, every 15 degrees);
//   THE WATER SLAMS (`armSmash`, the left and right tentacles in phases 2 and 3): reared back, smashed down into the water off the
//     stone's end; the wave each sends across the stone and the two waves' crash in the middle are the game's own (`WAVE`, `CRASH`);
//   STRUCK (`armFlinch`): a big flinch, standing or lying slammed, his dark ichor spurting;
//   ITS DEATH (`armDeath`): convulsing (held), thrashing, then sinking back into the water through its root, coiling as it goes;
//   PHASE 1: his two tentacles bursting up out of his lurk (art/eye_moves.ts armBurst) and doing all the same;
//   and the films' shots (`fightFrame`): phase 1 and phase 2 as the player sees them, the Warrior dodging, outrunning and striking.

import { FLAME } from './mkit';
import { ARM_LOOP, STONE, armOf } from './eye_colossus';
import type { ArmPose } from './eye_colossus';
import { ARM_REST, ARM_STAND_FRAMES, EYE_FPS, armBurst, armLayer, armStand, armStandLayer, curlTip, eyeFrame } from './eye_moves';
import type { ArmFx, EyeFrame, EyeLayer, HeroAt } from './eye_moves';

type P3 = number[];
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
const pad = (n: number): string => String(n).padStart(3, '0');
const mod = (a: number, n: number): number => ((a % n) + n) % n;

// =============================================================================================
// WHERE THINGS ARE

/** The arena's unit (a tile: the game's 32 by 16 game pixels) in his lengths. */
export const UNIT = 32 / (2 / Math.sqrt(3));
/** The stone's back edge (his lengths from his middle at the water toward the camera), in the arena's units from the back of the water. */
export const QUAY = STONE.edge / UNIT;
/** The stone: from his `x0` to `x1` across, `y0` (its back edge, at the water) to `y1` (its front) toward the camera; its top at the water's height. */
export const STONE_BOX = { x0: -(STONE.across * Math.SQRT2 * UNIT) / 2, x1: (STONE.across * Math.SQRT2 * UNIT) / 2, y0: STONE.edge, y1: STONE.edge + STONE.deep * Math.SQRT2 * UNIT } as const;
/** A slam's line on the stone: from its root toward the hero. The main chat's of 7 Nov 00:48 is 6 of the arena's units long and 1.2
 *  wide, for the old Eye's arms; his tentacles as drawn now are 17 long and 3 thick at the water, so this is drawn to them: 8 long and
 *  1.6 wide (what of it lies on the stone is as wide as the line). The main chat sets the final numbers. */
export const LINE = { len: 8 * UNIT, wid: 1.6 * UNIT } as const;
/** The turns a slam's line is drawn for (radians from straight toward the camera; positive, to the screen's right): every 15 degrees. */
/** THE COLOURS OF WHAT THE GAME DRAWS ROUND THEM: the warning on the stone the enemy's pink (render/act1_fx/garden_warn.ts: its dashed
 *  edge FLAME 2 and 3, the stone inside shaded dark red); his ichor dark, the blood of a thing of the deep, maroon to black (never the
 *  friend's cyan); the stone's chips and its cracks. */
export const ARM_COLOURS = {
  warnEdge: [FLAME[2], FLAME[3]],
  warnShade: '#1a1016',
  ichor: ['#0e0609', '#220b14', '#3c1220', '#5a1c2c', '#7e2c3a'],
  stoneLit: '#9a96a6',
  stoneDark: '#4a4656',
  crack: '#16141c',
} as const;
export const ARM_TURNS: readonly number[] = [-60, -45, -30, -15, 0, 15, 30, 45, 60].map((d) => (d * Math.PI) / 180);
/** The turn nearest a way (from a root to the hero), of ARM_TURNS. */
export function turnToward(fromX: number, fromY: number, toX: number, toY: number): number {
  const a = Math.atan2(toX - fromX, toY - fromY);
  let best = ARM_TURNS[0];
  for (const t of ARM_TURNS) if (Math.abs(t - a) < Math.abs(best - a)) best = t;
  return best;
}
/** A tentacle's root (where it leaves the water: his space). */
export const rootOf = (w: number): [number, number] => [ARM_REST[w].path[0][0], ARM_REST[w].path[0][1]];

// =============================================================================================
// PATHS

/** A curve through points, sampled close (Catmull-Rom, as the painter's tube). */
function dense(path: ReadonlyArray<readonly number[]>, n = 240): P3[] {
  const out: P3[] = [];
  const P = [path[0], ...path, path[path.length - 1]];
  const segs = path.length - 1;
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * segs;
    const k = Math.min(segs - 1, Math.floor(u));
    const t = u - k;
    const q: P3 = [];
    for (let c = 0; c < 3; c++) {
      const p0 = P[k][c];
      const p1 = P[k + 1][c];
      const p2 = P[k + 2][c];
      const p3 = P[k + 3][c];
      q.push(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t));
    }
    out.push(q);
  }
  return out;
}
function polyLen(p: ReadonlyArray<readonly number[]>): number {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]);
  return L;
}
/** `n` points evenly along a polyline (by length). */
function evenly(p: ReadonlyArray<readonly number[]>, n: number): P3[] {
  const cum = [0];
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]));
  const L = cum[cum.length - 1];
  const out: P3[] = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / (n - 1)) * L;
    while (j < p.length - 2 && cum[j + 1] < s) j++;
    const u = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push([0, 1, 2].map((c) => p[j][c] + (p[j + 1][c] - p[j][c]) * u));
  }
  return out;
}
/** How many points a move's paths have. */
export const NP = 60;
/** A path, its points evenly along its curve. */
const even = (path: ReadonlyArray<readonly number[]>): P3[] => evenly(dense(path), NP);
/** Each tentacle's length (his lengths, along its spine at rest). */
export const ARM_LEN: readonly number[] = ARM_REST.map((a) => polyLen(dense(a.path)));
/** A tentacle's radius `s` along it (as the painter's taper: art/eye_colossus.ts armOf). */
const radiusAt = (w: number, s: number): number => ARM_REST[w].r * Math.pow(Math.max(0, 1 - s / ARM_LEN[w]), 1.2) + 1.4;
/** Paths between keys (each `NP` points), point by point: Catmull-Rom through the keys, `u` from key `i` to `i + 1`. */
function through(keys: ReadonlyArray<ReadonlyArray<readonly number[]>>, i: number, u: number): P3[] {
  const K0 = keys[Math.max(0, i - 1)];
  const K1 = keys[i];
  const K2 = keys[Math.min(keys.length - 1, i + 1)];
  const K3 = keys[Math.min(keys.length - 1, i + 2)];
  return K1.map((_, j) => [0, 1, 2].map((c) => 0.5 * (2 * K1[j][c] + (-K0[j][c] + K2[j][c]) * u + (2 * K0[j][c] - 5 * K1[j][c] + 4 * K2[j][c] - K3[j][c]) * u * u + (-K0[j][c] + 3 * K1[j][c] - 3 * K2[j][c] + K3[j][c]) * u * u * u)));
}
/** A path from keys at frames `ks` (rising), at frame `k`: each number of each point by a smooth curve through its keys that never
 *  overshoots them (monotone: Fritsch and Carlson), so that nothing swings past where its keys have it (never down into the stone). */
function keyed(keys: ReadonlyArray<ReadonlyArray<readonly number[]>>, ks: readonly number[], k: number): P3[] {
  const n = ks.length;
  let i = 0;
  while (i < n - 2 && k >= ks[i + 1]) i++;
  const h = ks[i + 1] - ks[i];
  const u = clamp01((k - ks[i]) / h);
  const slope = (j: number, p: number, c: number): number => {
    // (the tangent at key j: 0 at the ends and where it turns; else the harmonic mean of the slopes either side)
    if (j === 0 || j === n - 1) return 0;
    const d0 = (keys[j][p][c] - keys[j - 1][p][c]) / (ks[j] - ks[j - 1]);
    const d1 = (keys[j + 1][p][c] - keys[j][p][c]) / (ks[j + 1] - ks[j]);
    if (d0 * d1 <= 0) return 0;
    return (2 * d0 * d1) / (d0 + d1);
  };
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
  const h10 = u ** 3 - 2 * u ** 2 + u;
  const h01 = -2 * u ** 3 + 3 * u ** 2;
  const h11 = u ** 3 - u ** 2;
  return keys[i].map((_, p) => [0, 1, 2].map((c) => h00 * keys[i][p][c] + h10 * h * slope(i, p, c) + h01 * keys[i + 1][p][c] + h11 * h * slope(i + 1, p, c)));
}
void through;
const pose = (w: number, path: P3[]): ArmPose => ({ ...ARM_REST[w], path });
/** A path drawn back along itself by `pull` (into the water at its root: beyond its root it goes straight down). */
function pullAlong(path: ReadonlyArray<readonly number[]>, pull: number): P3[] {
  const d = dense(path, 300);
  const cum = [0];
  for (let i = 1; i < d.length; i++) cum.push(cum[i - 1] + Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1], d[i][2] - d[i - 1][2]));
  const L = cum[cum.length - 1];
  const at = (s: number): P3 => {
    if (s <= 0) return [d[0][0], d[0][1], d[0][2] + s];
    let j = 1;
    while (j < d.length - 1 && cum[j] < s) j++;
    const u = (s - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
    return [0, 1, 2].map((c) => d[j - 1][c] + (d[j][c] - d[j - 1][c]) * u);
  };
  const out: P3[] = [];
  for (let i = 0; i <= 60; i++) out.push(at((i / 60) * L - pull));
  return out;
}
/** A tentacle's path lifted where it would go into the stone: over the stone its underside on its top at the least, and over the
 *  stone's edges clear of them (each point at its own thickness along it). */
function liftOver(w: number, path: P3[]): P3[] {
  const L = polyLen(path);
  const Lw = ARM_LEN[w];
  let s = 0;
  return path.map((q, i) => {
    if (i > 0) s += Math.hypot(q[0] - path[i - 1][0], q[1] - path[i - 1][1], q[2] - path[i - 1][2]);
    // (how far along it this is, as its length is now: the painter tapers it by its own length)
    const r = ARM_REST[w].r * Math.pow(Math.max(0, 1 - s / L), 1.2) + 1.4 + 2;
    void Lw;
    const dx = Math.max(STONE_BOX.x0 - q[0], 0, q[0] - STONE_BOX.x1);
    const dy = Math.max(STONE_BOX.y0 - q[1], 0, q[1] - STONE_BOX.y1);
    const d = Math.hypot(dx, dy);
    if (d >= r) return q;
    const need = d === 0 ? r : Math.sqrt(r * r - d * d);
    return q[2] < need ? [q[0], q[1], need] : q;
  });
}
/** How low a point of a tentacle may go: over the stone, its top (the water's height); elsewhere, anywhere. */
const floorAt = (x: number, y: number): number => (x > STONE_BOX.x0 - 4 && x < STONE_BOX.x1 + 4 && y > STONE_BOX.y0 - 4 && y < STONE_BOX.y1 ? 0 : -Infinity);

/** A tentacle's own frame on a line: from its root along `ang`, `a` along, `b` across (to the line's right as you look along it), `z` up. */
function lineFrame(w: number, ang: number): (a: number, b: number, z: number) => P3 {
  const [rx, ry] = rootOf(w);
  const s = Math.sin(ang);
  const c = Math.cos(ang);
  return (a, b, z) => [rx + a * s - b * c, ry + a * c + b * s, z];
}

// =============================================================================================
// THE SLAM ON THE STONE

/** A slam's frames: its wind-up (HELD: reared back and up, coiling, quivering at the top), its strike (two smeared frames, the second
 *  the landing), a beat lying on the stone (a rebound and a settle), its wind-down (dragged back, peeled off the stone, rising into its
 *  stand). Frames from its start; `hit` the frame it lands. */
export const SLAM = { wind: 27, strike: 2, lie: 15, down: 30, hit: 28, frames: 74 } as const;


/** Its part under the water, going straight down from where it leaves it (`D` long): local points from deep up to its root. */
function under(D: number): P3[] {
  const out: P3[] = [];
  for (let i = 0; i < 6; i++) {
    const s = D * (1 - i / 6);
    out.push([-0.12 * s, 0, -30 - s * 0.95]);
  }
  return out;
}
/** Its rear, its strike's first frame, its landing and its wind-down's two keys, for a line at `ang`. */
export function slamKeys(w: number, ang: number): { rear: P3[]; whip: P3[]; slam: P3[]; drag: P3[]; peel: P3[]; touch: number; end: number } {
  const L = ARM_LEN[w];
  const F = lineFrame(w, ang);
  // (REARED: drawn a little down into the water, the rest of it leaning back away from its line and up, its top coiled over toward
  // it, ready)
  const Dr = L * 0.18;
  // (the short middle one of phase 2 stretched up to rear as big as the others)
  const k = Math.max(L - Dr, 360) / 450;
  // (an S across its line, so that it reads coiled from the camera whichever way the line goes; its top a big hook rolled over
  // toward the line and in on itself, like a cobra's head drawn back)
  // (the coil: across the line, so it is seen whole, rolling up over its top and in on itself, leaning toward the line)
  const trunk: P3[] = [[-6, 12, 40], [-22, 28, 100], [-40, 22, 158], [-50, 0, 196]];
  const C = [-30, -30, 238];
  const th0 = Math.atan2(196 - C[2], 0 - C[1]);
  const coil: P3[] = [];
  for (let i = 1; i <= 12; i++) {
    const v = i / 12;
    const th = th0 + v * (300 * Math.PI) / 180;
    const R = Math.hypot(0 - C[1], 196 - C[2]) * (1 - v) + 15 * v;
    coil.push([-50 + 62 * v, C[1] + R * Math.cos(th), C[2] + R * Math.sin(th)]);
  }
  const rearLocal = [...under(Dr), [0, 0, -30], ...[...trunk, ...coil].map((q) => [q[0] * k, q[1] * k, q[2] * k])];
  const rear = even(rearLocal).map((q) => F(q[0], q[1], q[2]));
  // (LANDED: out of the water low over the stone's edge and ALONG THE LINE, lying on the stone, its tip curled up at the line's end;
  // the rest of it down in the water, so that what lies on the stone is as wide as the line)
  const [, ry] = rootOf(w);
  const cosA = Math.cos(ang);
  const edge = (STONE_BOX.y0 - ry) / Math.max(0.2, cosA);
  const end = LINE.len - 12;
  const touch = Math.min(end - 40, edge + 8);
  const curlLen = 34;
  const lieLen = end - touch;
  // (out of the water to the stone: a low hump over the edge)
  const hump: P3[] = [];
  for (let i = 1; i <= 16; i++) {
    const v = i / 16;
    hump.push([touch * v, 0, -30 + 52 * Math.min(1, (v / 0.75) ** 0.8) + 10 * Math.sin(Math.PI * v)]);
  }
  const humpLen = polyLen([[0, 0, -30], ...hump]);
  const D = Math.max(20, L - humpLen - lieLen - curlLen);
  // (each part of it on the stone at its own height there, as thick as it is there)
  const lieZ = (s: number): number => radiusAt(w, s) + 0.8;
  const sTouch = D + humpLen;
  hump[hump.length - 1][2] = lieZ(sTouch);
  for (let i = hump.length - 5; i < hump.length - 1; i++) hump[i][2] = Math.max(hump[i][2], lieZ(sTouch - (hump.length - 1 - i) * (touch / 16)) + 0.4);
  const lie: P3[] = [];
  for (let i = 1; i <= 14; i++) {
    const a = touch + (lieLen * i) / 14;
    lie.push([a, 4 * Math.sin(a * 0.04 + w), lieZ(sTouch + (a - touch))]);
  }
  const curl: P3[] = [];
  for (let i = 1; i <= 6; i++) {
    const ph = (i / 6) * Math.PI * 0.95;
    const R = curlLen / Math.PI;
    curl.push([end + R * Math.sin(ph), 4 * Math.sin(end * 0.04 + w), lieZ(L - curlLen) + R * (1 - Math.cos(ph))]);
  }
  const slamLocal = [...under(D), [0, 0, -30], ...hump, ...lie, ...curl];
  const slam = liftOver(w, evenly(slamLocal, NP).map((q) => F(q[0], q[1], q[2])));
  // (its strike's first frame: flung down out of its rear, its outer part still high in the air over the line, coming down)
  const whip = evenly(slamLocal.map((q) => {
    if (q[2] < -30) return q;
    const u = clamp01(q[0] / end);
    return [q[0] * (0.7 + 0.3 * u), q[1], q[2] + 70 * Math.sin(Math.PI * Math.min(1, u * 1.3)) + 110 * u ** 1.6];
  }), NP).map((q) => F(q[0], q[1], q[2]));
  // (wind-down: dragged back toward the water along its own length, scraping along the line; then peeled up off the stone from the
  // water out, its tip last)
  const drag = liftOver(w, evenly(pullAlong(slamLocal, 50), NP).map((q) => F(q[0], q[1], q[2])));
  const pulled = pullAlong(slamLocal, 80);
  const peel = liftOver(w, evenly(pulled.map((q) => {
    if (q[2] < -30) return q;
    const u = clamp01(q[0] / Math.max(1, end - 80));
    return [q[0], q[1], q[2] + 70 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (1 - u * 0.6)];
  }), NP).map((q) => F(q[0], q[1], q[2])));
  return { rear, whip, slam, drag, peel, touch, end };
}

/**
 * A SLAM ON THE STONE, its frame `k` (0 to SLAM.frames - 1) along a line at `ang`, begun as it stood at its clock `t0`. Its wind-up
 * held, its strike smeared, its landing along the line, its wind-down back into its stand at its clock then.
 */
export function armSlam(w: number, ang: number, k: number, t0: number): ArmPose {
  const K = slamKeys(w, ang);
  const S = SLAM;
  const t = t0 + k / EYE_FPS;
  const stand = even(armStand(w, t).path);
  let path: P3[];
  if (k < S.wind) {
    // (rearing: fast out of its stand, slowing into the rear; then held, quivering at the top, coiling tighter)
    const u = sm(0, S.wind - 9, k);
    const from = even(armStand(w, t0).path);
    path = from.map((q, j) => q.map((v, c) => lerp(v, K.rear[j][c], u)));
    const held = sm(S.wind - 12, S.wind - 1, k);
    path = curlTip(path, 0.35 * held, 0.6);
    if (held > 0) path = path.map((q, j) => {
      const v = j / (NP - 1);
      const a = 3.2 * held * v ** 1.5;
      const jj = v * 23;
      return [q[0] + a * Math.sin(k * 2.9 + jj * 0.7), q[1] + a * Math.sin(k * 3.7 + jj), q[2] + a * Math.sin(k * 3.3 + jj * 0.5 + 1)];
    });
  } else if (k === S.wind) path = K.whip;
  else if (k < S.hit + S.lie) {
    // (landed: the line's part of it rebounding a little off the stone and settling, its tip curling)
    const f = k - S.hit;
    const b = 9 * Math.exp(-f / 3.2) * Math.abs(Math.sin(f * 0.95));
    path = K.slam.map((q, j) => {
      const v = j / (NP - 1);
      return [q[0], q[1], q[2] + b * Math.max(0, v - 0.45) * 1.8];
    });
    path = curlTip(path, 0.25 * Math.sin((f / S.lie) * Math.PI), 0.85);
  } else {
    const f = k - (S.hit + S.lie);
    path = keyed([K.slam, K.drag, K.peel, stand], [0, 9, 17, S.down - 1], f);
  }
  return pose(w, liftOver(w, path));
}
/** Where the part of it on the line lies (from its root, along the line): for the game's marks under it. */
export function slamLies(w: number, ang: number): { a0: number; a1: number } {
  const K = slamKeys(w, ang);
  return { a0: K.touch, a1: K.end + 6 };
}

// =============================================================================================
// THE WATER SLAM (phases 2 and 3: the left and the right tentacles)

/** Where each smashes into the water: off the stone's left end (the left, `w` 0) or its right (`w` 2), a little onto the depth of the stone. */
export const SMASH_AT: Record<number, [number, number]> = { 0: [STONE_BOX.x0 - 70, STONE_BOX.y0 + 60], 2: [STONE_BOX.x1 + 70, STONE_BOX.y0 + 60] };
/** A water slam's frames (as a slam on the stone's), the frame it smashes in (`hit`). */
export const SMASH = { wind: 27, strike: 2, lie: 15, down: 30, hit: 28, frames: 74 } as const;
/** How high it rears for a water slam (the camera lowered to see the stone: his lengths). */
const SMASH_TOP = 230;

export function smashKeys(w: number): { rear: P3[]; whip: P3[]; smash: P3[]; lift: P3[] } {
  const L = ARM_LEN[w];
  const [rx, ry] = rootOf(w);
  const [tx, ty] = SMASH_AT[w];
  const ang = Math.atan2(tx - rx, ty - ry);
  const dist = Math.hypot(tx - rx, ty - ry);
  const F = lineFrame(w, ang);
  const k = L / 450;
  // (reared back away from where it will smash and up, low enough to be seen with the stone, coiled hard)
  const rear = even([[0, 0, -30], [-14 * k, 4, 36 * k], [-48 * k, 8, 96 * k], [-92 * k, 10, 150 * k], [-120 * k, 8, 196 * k], [-112 * k, 4, (SMASH_TOP - 8) * k], [-80 * k, 0, SMASH_TOP * k], [-48 * k, -2, (SMASH_TOP - 14) * k], [-36 * k, -2, (SMASH_TOP - 40) * k], [-50 * k, 0, (SMASH_TOP - 54) * k], [-62 * k, 0, (SMASH_TOP - 40) * k], [-56 * k, 0, (SMASH_TOP - 28) * k]].map((q) => F(q[0], q[1], q[2])));
  // (smashed: a high arch flung out over the water and the stone's end, its outer part driven down deep into the water there)
  const arch: P3[] = [];
  for (let i = 0; i <= 50; i++) {
    const v = i / 50;
    arch.push([dist * v, 0, -30 + 0 * v + 190 * k * Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.92)), 0.8) - 120 * v ** 3]);
  }
  // (as long as it is: what is left of it goes on down into the water)
  const AL = polyLen(arch);
  const rest = Math.max(0, L - AL);
  const last = arch[arch.length - 1];
  const smashLocal = [...arch];
  for (let i = 1; i <= 6; i++) smashLocal.push([last[0] + (rest / 6) * i * 0.35, 0, last[2] - (rest / 6) * i * 0.94]);
  const smash = evenly(smashLocal, NP).map((q) => F(q[0], q[1], q[2]));
  const whip = evenly(smashLocal.map((q, i, arr) => {
    const u = i / (arr.length - 1);
    return [q[0] * (0.8 + 0.2 * u), q[1], q[2] + 30 + 130 * u ** 1.5];
  }), NP).map((q) => F(q[0], q[1], q[2]));
  // (drawing back out of the water)
  const lift = evenly(smashLocal.map((q, i, arr) => {
    const u = i / (arr.length - 1);
    return [q[0] * (1 - 0.35 * u), q[1], q[2] + 120 * u ** 1.2];
  }), NP).map((q) => F(q[0], q[1], q[2]));
  return { rear, whip, smash, lift };
}
/** A WATER SLAM, its frame `k` (0 to SMASH.frames - 1), begun as it stood at its clock `t0`. */
export function armSmash(w: number, k: number, t0: number): ArmPose {
  const K = smashKeys(w);
  const S = SMASH;
  const t = t0 + k / EYE_FPS;
  let path: P3[];
  if (k < S.wind) {
    const u = sm(0, S.wind - 9, k);
    const from = even(armStand(w, t0).path);
    path = from.map((q, j) => q.map((v, c) => lerp(v, K.rear[j][c], u)));
    const held = sm(S.wind - 12, S.wind - 1, k);
    path = curlTip(path, 0.4 * held, 0.6);
    if (held > 0) path = path.map((q, j) => {
      const v = j / (NP - 1);
      const a = 3.4 * held * v ** 1.5;
      const jj = v * 23;
      return [q[0] + a * Math.sin(k * 2.9 + jj * 0.7), q[1] + a * Math.sin(k * 3.7 + jj), q[2] + a * Math.sin(k * 3.3 + jj * 0.5 + 1)];
    });
  } else if (k === S.wind) path = K.whip;
  else if (k < S.hit + S.lie) {
    // (in the water: heaving there, churning it)
    const f = k - S.hit;
    path = K.smash.map((q, j) => {
      const v = j / (NP - 1);
      const a = 7 * Math.exp(-f / 6) * v;
      return [q[0] + a * Math.sin(f * 1.3 + v * 11.5), q[1], q[2] + a * Math.cos(f * 1.1 + v * 9.2)];
    });
  } else {
    const f = k - (S.hit + S.lie);
    path = keyed([K.smash, K.lift, even(armStand(w, t).path)], [0, 12, S.down - 1], f);
  }
  return pose(w, liftOver(w, path));
}

/**
 * THE WAVES (the game's, drawn over the stone as his water is): a wall of black water rolling across the stone from where it smashed,
 * tallest at the back by the water, thinning toward the front and dying before the front edge: there, out of its reach, it is
 * outrun; anywhere it is dodged through. `speed` his lengths a second; `reach` how far onto the stone it comes from its back edge;
 * `high` how tall at the back; it forms over `form` seconds out of the smash.
 */
export const WAVE = { speed: 240, reach: 230, high: 58, form: 0.25, from: STONE_BOX.x0 - 40 } as const;
/** Where a wave's front is across the stone (his x), `s` seconds after its smash (`dir` 1 rolling right from the left, -1 left). */
export const waveFront = (dir: number, s: number): number => dir * (WAVE.from + WAVE.speed * s);
/** How tall a wave is at a depth onto the stone (his y), as it is at its full: tallest at the back, nothing at its reach. */
export const waveHigh = (y: number): number => WAVE.high * Math.pow(clamp01(1 - (y - STONE_BOX.y0) / WAVE.reach), 0.9);
/** THE CRASH as the two waves meet in the middle: a column of water, spray and slime thrown up, falling back across the middle. */
export const CRASH = { high: 230, rise: 0.35, fall: 1.4, wide: 70 } as const;
/** When the two waves of the both-at-once slam meet (seconds after their smash). */
export const CRASH_AT = (-WAVE.from) / WAVE.speed;

// =============================================================================================
// STRUCK, AND ITS DEATH

/** A flinch's frames. */
export const FLINCH = 14;
/** STRUCK: a big flinch, its frame `f` (0 to FLINCH - 1): flung back from the blow (the hero before it, toward the camera), shivering
 *  out along it, back. Lying slammed, it jerks up off the stone and slaps back. */
export function armFlinch(path: ReadonlyArray<readonly number[]>, f: number, lying: boolean): P3[] {
  const e = f < 2 ? [0.6, 1][f] : Math.exp(-(f - 1) / 3.5) * Math.cos((f - 1) * 0.9);
  return path.map((q, j) => {
    const v = j / (path.length - 1);
    const a = e * v ** 1.1;
    const shiver = 3 * Math.exp(-f / 5) * Math.sin(f * 2.3 + v * 25) * v;
    if (lying) return [q[0] + shiver, q[1] - 6 * a, q[2] + Math.max(0, 34 * a * Math.sin(Math.PI * clamp01((v - 0.4) / 0.6)))];
    return [q[0] + 10 * a + shiver, q[1] - 40 * a, q[2] + 14 * a];
  });
}
/** Its death's frames: convulsing (held), thrashing, sinking. */
export const DEATH = { convulse: 20, thrash: 22, sink: 48, frames: 90 } as const;
/**
 * ITS DEATH, frame `f`: CONVULSING (held: shudders through all of it, its tip curling and uncurling hard), THRASHING (whipping from side
 * to side, flung up off the stone and down), then SINKING back into the water through its root, sliding under, coiling as it goes.
 */
export function armDeath(w: number, from: ReadonlyArray<readonly number[]>, f: number): P3[] {
  const D = DEATH;
  const n = from.length - 1;
  let path: P3[] = from.map((q) => [...q]);
  const [rx, ry] = rootOf(w);
  if (f < D.convulse) {
    const g = sm(0, 4, f);
    path = path.map((q, j) => {
      const v = j / n;
      const a = g * 9 * v ** 0.8;
      const x = q[0] + a * Math.sin(f * 3.1 + v * 30);
      const y = q[1] + a * Math.sin(f * 2.7 + v * 23);
      return [x, y, Math.max(floorAt(x, y) + radiusOfJ(w, j, n) + 0.8, q[2] + a * Math.sin(f * 3.5 + v * 18))];
    });
    return curlTip(path, 0.5 * Math.sin(f * 1.4), 0.7);
  }
  // (from where its convulsing left it)
  const base = curlTip(from.map((q) => [...q]), 0.5 * Math.sin((D.convulse - 1) * 1.4), 0.7);
  if (f < D.convulse + D.thrash) {
    // (whipping: a wave out along it, side to side and up, big; never down into the stone)
    const g = f - D.convulse;
    const env = Math.sin((Math.PI * (g + 1)) / (D.thrash + 1));
    return base.map((q, j) => {
      const v = j / n;
      const ph = g * 0.75 - v * 3.2;
      const lift = 120 * env * v ** 1.2 * Math.abs(Math.sin(ph * 0.5 + 0.4));
      const x = q[0] + 115 * env * v ** 1.3 * Math.sin(ph);
      const y = q[1] - 34 * env * v;
      return [x, y, Math.max(floorAt(x, y) + radiusOfJ(w, j, n) + 0.8, q[2] + lift)];
    });
  }
  // (sinking: drawn back down into the water through its root, its part out of the water coiling up as it goes)
  const g = (f - D.convulse - D.thrash) / (D.sink - 1);
  const u = g * g * (3 - 2 * g);
  // (coiling as it goes: its spine curled up more and more from its tip, and drawn back down along that)
  const spineOf = curlTip(base, 1.1 * u, 0.5);
  const L = polyLen(spineOf);
  const pull = u * (L + 60);
  // (along its own spine, back from its tip by `pull`; beyond its root, straight down under the water)
  const spine = (s: number): P3 => {
    if (s <= 0) return [spineOf[0][0], spineOf[0][1], spineOf[0][2] + s];
    let acc = 0;
    for (let i = 1; i < spineOf.length; i++) {
      const d = Math.hypot(spineOf[i][0] - spineOf[i - 1][0], spineOf[i][1] - spineOf[i - 1][1], spineOf[i][2] - spineOf[i - 1][2]);
      if (acc + d >= s) {
        const t = (s - acc) / (d || 1);
        return [0, 1, 2].map((c) => spineOf[i - 1][c] + (spineOf[i][c] - spineOf[i - 1][c]) * t);
      }
      acc += d;
    }
    return [...spineOf[spineOf.length - 1]];
  };
  const out: P3[] = [];
  for (let j = 0; j <= n; j++) out.push(spine((j / n) * L - pull));
  return out;
}
const radiusOfJ = (w: number, j: number, n: number): number => radiusAt(w, (j / n) * ARM_LEN[w]);

// =============================================================================================
// THE FILMS' SHOTS: PHASE 1 AND PHASE 2, AS THE PLAYER SEES THEM

/** A tentacle's doing over a shot: from frame `k0`, a move. */
type Doing =
  | { k0: number; is: 'burst' }
  | { k0: number; is: 'slam'; ang: number }
  | { k0: number; is: 'smash' }
  | { k0: number; is: 'flinch'; lying: boolean; on: Doing }
  | { k0: number; is: 'death'; on: Doing };

/** The Warrior's way over a shot: where he is at each mark (frame, across, onto the stone), and what he does there. */
interface HeroMark {
  k: number;
  du: number;
  dv: number;
  act?: 'attack';
}
interface Shot {
  frames: number;
  /** Him: lurking (phase 1) or standing (phase 2). */
  him: 'lurk' | 'stand';
  /** His tentacles in it (of ARM_REST), each with its doings in order. */
  arms: Array<{ w: number; doings: Doing[] }>;
  hero: HeroMark[];
  /** The camera, lowered from the stills' (picture pixels), by frame: marks (frame, how far). */
  cam: Array<[number, number]>;
}

/** The camera lowered for the tentacles (picture pixels), so that the stone where they slam is seen (the stills' has only its edge). */
export const CAM_ARMS = 76;
/** And lowered further for the water slams, the stone's depth seen, where the waves run and die. */
export const CAM_WAVES = 168;

const heroSpot = (du: number, dv: number): [number, number] => [du * UNIT, (QUAY + dv) * UNIT];

/** PHASE 1: his lurk; his two tentacles burst up at the fight's start, then each slams the stone toward the Warrior twice, at two
 *  turns, as he dodges; the right one, lying slammed, is struck, and struck its last, and dies. */
export const SHOT_P1: Shot = (() => {
  const A = 3;
  const B = 4;
  const marks: HeroMark[] = [
    { k: 0, du: -2.0, dv: 3.0 },
    { k: 52, du: -2.0, dv: 3.0 },
    { k: 74, du: 1.6, dv: 2.6 },
    { k: 112, du: 1.6, dv: 2.6 },
    { k: 134, du: -1.0, dv: 3.4 },
    { k: 176, du: -1.0, dv: 3.4 },
    { k: 200, du: 3.0, dv: 3.3 },
    { k: 234, du: 3.0, dv: 3.3 },
    { k: 247, du: 1.2, dv: 2.6 },
    { k: 249, du: 1.2, dv: 2.6, act: 'attack' },
    { k: 259, du: 1.2, dv: 2.6, act: 'attack' },
    { k: 290, du: 1.2, dv: 2.6 },
    { k: 380, du: 1.2, dv: 2.6 },
  ];
  const at = (k: number): [number, number] => heroSpot(...heroAtMarks(marks, k));
  const [ax, ay] = rootOf(A);
  const [bx, by] = rootOf(B);
  const a1 = turnToward(ax, ay, ...at(40));
  const b1 = turnToward(bx, by, ...at(100));
  const a2 = turnToward(ax, ay, ...at(160));
  const b2 = turnToward(bx, by, ...at(222));
  const bSlam2: Doing = { k0: 222, is: 'slam', ang: b2 };
  const bHit1: Doing = { k0: 253, is: 'flinch', lying: true, on: bSlam2 };
  return {
    frames: 380,
    him: 'lurk',
    arms: [
      { w: A, doings: [{ k0: 0, is: 'burst' }, { k0: 40, is: 'slam', ang: a1 }, { k0: 160, is: 'slam', ang: a2 }] },
      { w: B, doings: [{ k0: 6, is: 'burst' }, { k0: 100, is: 'slam', ang: b1 }, bSlam2, bHit1, { k0: 263, is: 'death', on: bHit1 }] },
    ],
    hero: marks,
    cam: [[0, CAM_ARMS]],
  };
})();
/** PHASE 2: his stand with the three; the middle one slams the stone toward the Warrior as he dodges; he runs to the front of the stone
 *  as the left one rears; the water slams, left, right, then both at once, the waves meeting in the middle in the crash. */
export const SHOT_P2: Shot = (() => {
  const marks: HeroMark[] = [
    { k: 0, du: -2.6, dv: 3.0 },
    { k: 44, du: -2.6, dv: 3.0 },
    { k: 64, du: 0.6, dv: 2.4 },
    { k: 100, du: 0.6, dv: 2.4 },
    { k: 150, du: -0.8, dv: 10.6 },
    { k: 520, du: -0.8, dv: 10.6 },
  ];
  const [mx, my] = rootOf(1);
  const m1 = turnToward(mx, my, ...heroSpot(-2.6, 3.0));
  return {
    frames: 520,
    him: 'stand',
    arms: [
      { w: 0, doings: [{ k0: 112, is: 'smash' }, { k0: 322, is: 'smash' }] },
      { w: 1, doings: [{ k0: 30, is: 'slam', ang: m1 }] },
      { w: 2, doings: [{ k0: 212, is: 'smash' }, { k0: 322, is: 'smash' }] },
    ],
    hero: marks,
    cam: [[0, CAM_ARMS], [100, CAM_ARMS], [146, CAM_WAVES], [520, CAM_WAVES]],
  };
})();
/** THE SHEET'S FAN: frame `k` of it, the middle tentacle of phase 2 lying slammed along each turn (one turn a frame). */
export const SHOT_FAN = { frames: ARM_TURNS.length } as const;

function heroAtMarks(marks: HeroMark[], k: number): [number, number] {
  let i = 0;
  while (i < marks.length - 2 && k >= marks[i + 1].k) i++;
  const a = marks[i];
  const b = marks[Math.min(marks.length - 1, i + 1)];
  const u = b.k > a.k ? clamp01((k - a.k) / (b.k - a.k)) : 0;
  const e = u * u * (3 - 2 * u);
  return [lerp(a.du, b.du, e), lerp(a.dv, b.dv, e)];
}
/** The Warrior at a frame of a shot. */
function heroOf(marks: HeroMark[], k: number): HeroAt {
  const [du, dv] = heroAtMarks(marks, k);
  const [du1, dv1] = heroAtMarks(marks, k + 1);
  const moving = Math.hypot(du1 - du, dv1 - dv) > 0.01;
  // (striking at a mark that says so: the strike's frames from it)
  const hit = marks.filter((m) => m.act === 'attack' && k >= m.k - 4 && k < m.k + 10).pop();
  if (hit) return { du, dv, view: 'back', act: 'attack', f: k - (hit.k - 4) };
  if (moving) return { du, dv, view: dv1 > dv + 0.005 ? 'front' : 'back', act: 'run', f: k };
  return { du, dv, view: 'back', act: 'idle', f: k };
}

/** A tentacle at a frame of a shot: its layer (and its last frame's, smeared, in a strike), and what the game draws for it. */
function armIn(w: number, doings: Doing[], k: number, fx: ArmFx, tag: string): { layer: EyeLayer | null; smear: EyeLayer | null } {
  const lay = (path: P3[] | ArmPose, kk: number, key: string): EyeLayer => {
    const a = Array.isArray(path) ? pose(w, path) : path;
    return { key, pose: armLayer(a, kk / EYE_FPS), drop: 0, back: 0 };
  };
  // (the doing it is in: the last begun)
  const now = doings.filter((d) => d.k0 <= k).pop();
  // (before any, or after one ends: standing)
  const standing = (): { layer: EyeLayer; smear: null } => ({ layer: armStandLayer(w, k), smear: null });
  if (!now) {
    const first = doings[0];
    if (first && first.is === 'burst') {
      const p = armBurst(w, k - first.k0 - 10, k / EYE_FPS);
      return { layer: p ? lay(p, k, `A${w}.b${tag}.${pad(k)}`) : null, smear: null };
    }
    return standing();
  }
  const f = k - now.k0;
  const pathOf = (d: Doing, kk: number): P3[] | null => {
    const g = kk - d.k0;
    if (d.is === 'slam') return g < SLAM.frames ? armSlam(w, d.ang, g, d.k0 / EYE_FPS).path as P3[] : null;
    if (d.is === 'smash') return g < SMASH.frames ? armSmash(w, g, d.k0 / EYE_FPS).path as P3[] : null;
    if (d.is === 'burst') {
      const p = armBurst(w, g - 10, kk / EYE_FPS);
      return p && g < 10 + 21 ? (p.path as P3[]) : null;
    }
    if (d.is === 'flinch') {
      const base = pathOf(d.on, kk) ?? (armStand(w, kk / EYE_FPS).path as P3[]);
      return g < FLINCH ? armFlinch(base, g, d.lying) : base;
    }
    const from = pathOf(d.on, d.k0) ?? (armStand(w, d.k0 / EYE_FPS).path as P3[]);
    return g < DEATH.frames ? armDeath(w, even(from), g) : null;
  };
  // (the game's marks for it)
  if (now.is === 'slam') {
    const [rx, ry] = rootOf(w);
    if (f < SLAM.hit) fx.lines.push({ x: rx, y: ry, ang: now.ang, len: LINE.len, wid: LINE.wid, k: f / (SLAM.hit - 1) });
    const lies = slamLies(w, now.ang);
    if (f >= SLAM.hit) fx.hits.push({ x: rx, y: ry, ang: now.ang, a0: lies.a0, a1: lies.a1, s: (f - SLAM.hit) / EYE_FPS, seed: w * 31 + now.k0 });
    if (f >= SLAM.hit + SLAM.lie) fx.trails.push({ x: rx, y: ry, ang: now.ang, a0: lies.a0 - 50, a1: lies.a1, s: (f - SLAM.hit - SLAM.lie) / EYE_FPS, seed: w * 37 + now.k0 });
  }
  if (now.is === 'smash') {
    const [sx, sy] = SMASH_AT[w];
    if (f >= SMASH.hit) fx.smashes.push({ x: sx, y: sy, s: (f - SMASH.hit) / EYE_FPS, seed: w * 41 + now.k0 });
  }
  // (a slam's marks go on under a flinch, and a death's, while they last)
  const under = now.is === 'flinch' || now.is === 'death' ? now.on : null;
  const under2 = under && (under.is === 'flinch' || under.is === 'death') ? under.on : under;
  if (under2 && under2.is === 'slam') {
    const [rx, ry] = rootOf(w);
    const lies = slamLies(w, under2.ang);
    const s = (k - under2.k0 - SLAM.hit) / EYE_FPS;
    fx.hits.push({ x: rx, y: ry, ang: under2.ang, a0: lies.a0, a1: lies.a1, s, seed: w * 31 + under2.k0 });
    if (now.is === 'death' && f >= DEATH.convulse + DEATH.thrash) fx.trails.push({ x: rx, y: ry, ang: under2.ang, a0: lies.a0 - 50, a1: lies.a1, s: (f - DEATH.convulse - DEATH.thrash) / EYE_FPS, seed: w * 37 + under2.k0 });
  }
  if (now.is === 'flinch' && f < 8) {
    const p = pathOf(now, now.k0);
    if (p) {
      const j = Math.round((now.lying ? 0.7 : 0.5) * (p.length - 1));
      fx.ichor.push({ x: p[j][0], y: p[j][1], z: p[j][2], s: f / EYE_FPS, seed: w * 13 + now.k0 });
    }
  }
  if (now.is === 'death') {
    const [rx, ry] = rootOf(w);
    if (f < 6) {
      const p = pathOf(now.on, now.k0);
      if (p) {
        const j = Math.round(0.65 * (p.length - 1));
        fx.ichor.push({ x: p[j][0], y: p[j][1], z: p[j][2], s: f / EYE_FPS, seed: w * 17 + now.k0 });
      }
    }
    if (f >= DEATH.convulse + DEATH.thrash) fx.sinks.push({ x: rx, y: ry + 8, s: (f - DEATH.convulse - DEATH.thrash) / EYE_FPS, seed: w * 19 });
    if (f >= DEATH.frames) return { layer: null, smear: null };
  }
  const p = pathOf(now, k);
  if (!p) return now.is === 'death' ? { layer: null, smear: null } : standing();
  // (drawn with points close enough that its curve between them never cuts the stone's edge)
  const fine = (q: P3[]): P3[] => liftOver(w, evenly(dense(q), 64));
  const layer = lay(fine(p), k, `A${w}.${now.is[0]}${tag}${now.k0}.${pad(f)}`);
  // (in a strike, its last frame behind it, smeared)
  const strike = (now.is === 'slam' && (f === SLAM.wind || f === SLAM.hit)) || (now.is === 'smash' && (f === SMASH.wind || f === SMASH.hit));
  let smear: EyeLayer | null = null;
  if (strike) {
    const q = pathOf(now, k - 1);
    if (q) smear = lay(fine(q), k - 1, `A${w}.${now.is[0]}${tag}${now.k0}.${pad(f - 1)}`);
  }
  return { layer, smear };
}

/** A FRAME OF A SHOT: him (his lurk or his stand), his tentacles, the Warrior, the camera, and what the game draws. */
export function fightFrame(shot: 'p1' | 'p2' | 'fan', k: number): EyeFrame {
  const fx: ArmFx = { lines: [], hits: [], trails: [], smashes: [], waves: [], crash: null, waveWarn: null, ichor: [], sinks: [] };
  if (shot === 'fan') {
    // (the middle tentacle of phase 2 landed along each turn in turn, alone, him standing; the line under it)
    const ang = ARM_TURNS[k];
    const base = eyeFrame('stand', 0);
    const p = armSlam(1, ang, SLAM.hit + 3, 0);
    const [rx, ry] = rootOf(1);
    const lies = slamLies(1, ang);
    fx.hits.push({ x: rx, y: ry, ang, a0: lies.a0, a1: lies.a1, s: 3 / EYE_FPS, seed: k });
    return { ...base, move: 'fan', k, arms: [armStandLayer(0, 0), { key: `A1.fan.${pad(k)}`, pose: armLayer(p, 0), drop: 0, back: 0 }, armStandLayer(2, 0)], smear: [null, null, null], hero: { du: -1.0, dv: QUAY + 4.2 - QUAY, view: 'back', act: 'idle', f: 0 }, camY: CAM_ARMS, fx };
  }
  const S = shot === 'p1' ? SHOT_P1 : SHOT_P2;
  const base = S.him === 'lurk' ? eyeFrame('lurk', mod(k, 90)) : eyeFrame('stand', mod(k, 90));
  const arms: Array<EyeLayer | null> = [];
  const smear: Array<EyeLayer | null> = [];
  for (const a of S.arms) {
    const r = armIn(a.w, a.doings, k, fx, shot);
    arms.push(r.layer);
    smear.push(r.smear);
  }
  // (the water slams' waves and their crash)
  if (shot === 'p2') {
    for (const a of S.arms) {
      for (const d of a.doings) {
        if (d.is !== 'smash') continue;
        const f = k - d.k0;
        if (f >= 0 && f < SMASH.hit) fx.waveWarn = Math.max(fx.waveWarn ?? 0, f / (SMASH.hit - 1));
        const s = (f - SMASH.hit) / EYE_FPS;
        const both = a.doings.length > 1 && d === a.doings[a.doings.length - 1];
        const dir = a.w === 0 ? 1 : -1;
        // (the two of the both-at-once slam meet in the middle and are spent in the crash)
        if (s >= 0 && (both ? s < CRASH_AT + 0.05 : waveFront(dir, s) * dir < STONE_BOX.x1 + 160)) fx.waves.push({ dir, s });
        if (both && a.w === 0 && s >= CRASH_AT - 0.2) fx.crash = s - CRASH_AT;
      }
    }
  }
  const cam = camAt(S.cam, k);
  // (phase 1's tentacles bursting up out of the water: its bulge over each and the crown thrown up, as at his entrance)
  const water = { ...base.water, bursts: S.arms.filter((a) => a.doings[0]?.is === 'burst').map((a) => ({ k: a.doings[0].k0 + 10, x: rootOf(a.w)[0], y: rootOf(a.w)[1] })) };
  return { ...base, move: shot, k, arms, smear, hero: heroOf(S.hero, k), camY: cam, fx, water, shake: shakeOf(shot, k, fx) };
}
function camAt(marks: Array<[number, number]>, k: number): number {
  let i = 0;
  while (i < marks.length - 2 && k >= marks[i + 1][0]) i++;
  const a = marks[i];
  const b = marks[Math.min(marks.length - 1, i + 1)];
  const u = b[0] > a[0] ? clamp01((k - a[0]) / (b[0] - a[0])) : 0;
  return Math.round(lerp(a[1], b[1], u * u * (3 - 2 * u)));
}
/** THE SCREEN'S JOLTS (game pixels): a slam landing on the stone, a smash into the water, the crash. */
export const ARM_SHAKE = { slam: 4, slamLong: 9, smash: 3, smashLong: 9, crash: 7, crashLong: 30 } as const;
function shakeOf(shot: 'p1' | 'p2', k: number, fx: ArmFx): [number, number] {
  let x = 0;
  let y = 0;
  const S = ARM_SHAKE;
  for (const h of fx.hits) {
    const f = Math.round(h.s * EYE_FPS);
    if (f >= 0 && f < S.slamLong) {
      const a = S.slam * (1 - f / S.slamLong);
      y += a * (f % 2 ? -1 : 1);
      x += a * 0.5 * (h1(f, 51) * 2 - 1);
    }
  }
  for (const m of fx.smashes) {
    const f = Math.round(m.s * EYE_FPS);
    if (f >= 0 && f < S.smashLong) y += S.smash * (1 - f / S.smashLong) * (f % 2 ? -1 : 1);
  }
  if (fx.crash !== null && fx.crash >= 0) {
    const f = Math.round(fx.crash * EYE_FPS);
    if (f < S.crashLong) {
      const a = S.crash * (1 - f / S.crashLong) ** 0.8;
      x += a * (h1(f, 61) * 2 - 1);
      y += a * (h1(f, 62) * 2 - 1);
    }
  }
  void shot;
  void k;
  return [Math.round(x), Math.round(y)];
}
/** How many frames each shot has. */
export const SHOTS = { p1: SHOT_P1.frames, p2: SHOT_P2.frames, fan: SHOT_FAN.frames } as const;
/** Its tube (the painter's), for the checks. */
export const tubeOf = (a: ArmPose) => armOf(a);
/** How clear a tentacle is of the stone (his lengths, at the nearest; less than 0, through it): its tube against the stone's block, whose
 *  top is at the water's height and whose sides go down under it. Where it lies on the stone this is its underside's gap. */
export function armStoneGap(a: ArmPose): { gap: number; at: number[] } {
  const T = armOf(a);
  let gap = Infinity;
  let at: number[] = [];
  for (let k = 0; k < T.n; k++) {
    const x = T.p[k * 4];
    const y = T.p[k * 4 + 1];
    const z = T.p[k * 4 + 2];
    const r = T.p[k * 4 + 3];
    const dx = Math.max(STONE_BOX.x0 - x, 0, x - STONE_BOX.x1);
    const dy = Math.max(STONE_BOX.y0 - y, 0, y - STONE_BOX.y1);
    const dxy = Math.hypot(dx, dy);
    const g = dxy === 0 ? z - r : z <= 0 ? dxy - r : Math.hypot(dxy, z) - r;
    if (g < gap) {
      gap = g;
      at = [x, y, z, r];
    }
  }
  return { gap, at };
}
/** How clear two tentacles are of each other (his lengths, between their skins at the nearest). */
export function armsGap(a: ArmPose, b: ArmPose): number {
  const A = armOf(a);
  const B = armOf(b);
  let g = Infinity;
  for (let i = 0; i < A.n; i += 2) for (let j = 0; j < B.n; j += 2) g = Math.min(g, Math.hypot(A.p[i * 4] - B.p[j * 4], A.p[i * 4 + 1] - B.p[j * 4 + 1], A.p[i * 4 + 2] - B.p[j * 4 + 2]) - A.p[i * 4 + 3] - B.p[j * 4 + 3]);
  return g;
}
void TAU;
void ARM_LOOP;
void ARM_STAND_FRAMES;
