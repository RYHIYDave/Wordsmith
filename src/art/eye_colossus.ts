// FLOOR 10'S BOSS, REDONE FROM NOTHING: THE SWAMP COLOSSUS (the art chat, 7 Nov 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game imports this file; `EYE2` is off. Nothing of the old Drowned Eye (art/drowned_eye.ts) is in it: not his solids, not his
// pictures, not his code. Stage 1: his look, still, for pictures; nothing moves yet.
//
// HIS WORDS, 7 Nov 2026, 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or
// intimidating.  the arena doesnt really work, and his entrance is not epic.”; 00:13: “just scrap his look and start fresh.  big
// ancient gross eldritch horror swamp monster with tentacles and a big eye.” His pick of the takes offered: “Swamp colossus
// (Recommended)”, offered as: “A rotting hill of moss-grown flesh filling the top of the screen; one huge bloodshot eye under a
// heavy brow; a split maw of teeth below; slime, weed and old bones on it; thick slimy tentacles.”
//
// WHAT HE IS, AS PAINTED: a hill of rotting flesh risen out of black water, the size of the top of the screen, always facing the
// camera. Hung in folds and sagging rolls, wet and slick; grey-green and bruised, patched with moss on all that faces up, streaked
// with slime that runs down him; old bones grown into his hide (a horned beast's skull on his left shoulder, the ribs of something
// great across his right, the skulls of the drowned), broken stones of the fen's ruin sunk in him, barnacles crusting him at the
// waterline, leeches on him; weed and slime hanging off every overhang. At his heart ONE HUGE EYE under a heavy overhanging brow:
// yellowed, bloodshot, its iris the enemy's pink burning to gold round a black slit, set deep between thick red-rimmed lids, looking
// at you. Below it his MAW, split down the middle: two lips that part sideways, rows of teeth along both, the gullet beyond. And his
// TENTACLES: thick, tapering, slick, each its own enemy, rising out of the water, pale suckers in two rows along the inside of each
// curl, old scars across them. An enemy: the pink edge round him, pink and gold his only glow; nothing cyan.
//
// HOW HE IS PAINTED: his own solids, smooth-joined, in his own space (across the screen X, toward the camera Y, up Z; his own
// lengths, as the game's figures', TILE3 to a tile), looked at as the game's camera looks (from above at 30 degrees: a length across
// the screen is SEEN pixels of the picture, an upright one is one pixel), ray by ray, two picture pixels to a game pixel. Lit from
// the upper left as everything is, in five tones a material, with the light's shadow (his brow shades his eye) and the dark of every
// fold; wet: a glint where the light catches the slime. What of him is under the water is seen through it, darker the deeper; only
// his eye's fire is seen deep down.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { INK, RIM_ALPHA } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const EYE2 = { on: false };

/** His own lengths to a tile (art/new_mobs3.ts TILE3: 32 / sqrt(2/3)). */
export const C_TILE = 32 / Math.sqrt(2 / 3);
/** A length across the screen is this many picture pixels (art/skin.ts SEEN); an upright one is one. */
const SEEN = 2 / Math.sqrt(3);
const SIN30 = 0.5;
const COS30 = Math.sqrt(3) / 2;

// =============================================================================================
// HIS MEASURES (his own lengths; a tile is C_TILE of them)

/**
 * His size, risen: his hill `wide` across at the water and `tall` over it at his crown; his eye's radius, and where its middle is
 * (up from the water, toward the camera from his middle); his maw from the water to `mawTop`.
 */
export const COLOSSUS = {
  wide: 760,
  tall: 310,
  eyeR: 66,
  eye: { y: 100, z: 150 },
  mawTop: 86,
  /** How deep he lies in phase 1, under the water (his crown a little below it). */
  sunk: 384,
  /** And how far back out in the water he lies then (so that what is seen of him is seen in the water, not under the stone). */
  sunkBack: 330,
  /** How deep under the water anything of him is still seen; his eye's fire, deeper. */
  seenDeep: 70,
  /** And while he lies under it (phase 1): his dark hill seen faintly further down. */
  seenDeepSunk: 160,
} as const;

// =============================================================================================
// HIS COLOURS: the fen's dusk; rotten grey-green flesh, bruised; the enemy's pink burning to gold only in his eye

type RGB = readonly [number, number, number];
type Ramp5 = readonly [RGB, RGB, RGB, RGB, RGB];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (...c: string[]): Ramp5 => c.map(hex) as unknown as Ramp5;

/** His hide: rotting grey-green flesh, dark in its folds. */
export const CO_FLESH = ramp('#0f110e', '#1d211a', '#30362a', '#47503a', '#646c4c');
/** Rot and bruise in it: a dull violet-brown. */
export const CO_BRUISE = ramp('#120c12', '#22171e', '#372630', '#4c3840', '#665050');
/** Bloated, drowned pale flesh (the undersides of his tentacles, his rolls at the water). */
export const CO_PALE = ramp('#1e1b18', '#37322a', '#56503e', '#7a7256', '#a09670');
/** Moss on what faces up. */
export const CO_MOSS = ramp('#10160c', '#192410', '#243318', '#31451f', '#405628');
/** Slime: dark, slick, catching the light. */
export const CO_SLIME = ramp('#0c120a', '#162214', '#24361c', '#3c5030', '#8a9a7a');
/** Old bone grown into him, yellowed. */
export const CO_BONE = ramp('#24201a', '#433c2e', '#6a6048', '#968a68', '#bfb28a');
/** The ruin's stone sunk in him (the fen's own old stone: art/floor10.ts RUIN's tones). */
export const CO_STONE = ramp('#29272e', '#3a3741', '#4e4a56', '#64606c', '#7c7884');
/** The wet sheen on him: long pale highlights where the light runs along his slime. */
export const CO_SHEEN: RGB = hex('#aab29a');
/** A tentacle's back, dark; its flank. */
export const CO_ARMBACK = ramp('#0b0d0b', '#161a15', '#232a20', '#364030', '#4e5a42');
export const CO_ARMMID = ramp('#141412', '#262620', '#3c3c30', '#585644', '#7a7660');
/** Dead wood grown out of his crown (the fen's dead trees: art/floor10.ts DEADWOOD). */
export const CO_WOOD = ramp('#24222a', '#363339', '#4a4648', '#605a58', '#787068');
/** His ripples: how far out each thin line is from where he breaks the water (his lengths), further apart further out. */
const RIPPLES = [7, 15, 26, 41, 60, 84];
/** Scum on the water where he breaks it. */
const SCUM: RGB = hex('#4a4a2a');
/** Barnacles crusting him. */
export const CO_BARNACLE = ramp('#2a2a28', '#46443e', '#6a665c', '#8e897c', '#b2ac9c');
/** Leeches: glossy black-violet. */
export const CO_LEECH = ramp('#0a070a', '#1a1016', '#2e1a24', '#4a2a36', '#6e4250');
/** His lids' raw rims and his gums: wet, red, not glowing. */
export const CO_RAW = ramp('#200a0c', '#3e1216', '#5e1e20', '#7e302e', '#a04840');
/** His lips: rotten, swollen, wet, dark. */
export const CO_LIP = ramp('#0c070a', '#1c1016', '#2e1c22', '#46282e', '#62403e');
/** His maw within: a deep wet violet-red. */
export const CO_MAW = ramp('#0a050a', '#180a14', '#2a1020', '#40182c', '#5a2638');
/** His teeth: old, yellowed, brown at the root. */
export const CO_TOOTH = ramp('#3a3022', '#62563e', '#8e8060', '#b8aa84', '#ddd2ae');
/** His eye's white: yellowed, wet. */
export const CO_SCLERA = ramp('#4a3e30', '#76664e', '#a08c6a', '#c4b08a', '#e2d4ae');
/** The blood in it. */
export const CO_VEIN = ramp('#2e080c', '#4e0e14', '#741a1c', '#9a2a26', '#b84034');
/** His iris: the enemy's fire, pink at its rim burning to gold at the slit (art/mkit.ts FLAME). */
export const CO_IRIS: Ramp5 = FLAME.map(hex) as unknown as Ramp5;
/** His pupil: a black slit. */
const PUPIL: RGB = hex('#0c060c');
/** The glint on his eye (warm, never cyan). */
const GLINT: RGB = hex('#fff2e2');
/** The fen's black water he is seen through (art/fen.ts C_FEN's darkest), and its foam where he breaks it. */
const WATER: RGB = hex('#0e1612');
const FOAM: Ramp5 = ramp('#1c2a22', '#2b3d32', '#3e5244', '#5a6e5c', '#7a8c76');
/** Weed hanging off him (the fen's hanging moss and weed, art/floor10.ts HANGMOSS, art/fen.ts C_WEED). */
const WEED: Ramp5 = ramp('#1a2214', '#28331c', '#363e2e', '#4a523c', '#5e6650');
const INK_RGB = hex(INK);
const RIM_RGB = hex(ENEMY_RIM);

// materials
const M_FLESH = 1;
const M_PALE = 2;
const M_EYE = 3;
const M_LID = 4;
const M_LIP = 5;
const M_TOOTH = 6;
const M_MAW = 7;
const M_BONE = 8;
const M_STONE = 9;
const M_LEECH = 10;
const M_ARM = 11;
const M_BARN = 12;
const M_BOIL = 13;
const M_GUM = 16;
const M_TONGUE = 17;
const M_THROAT = 18;
const M_SORE = 14;
const M_WOOD = 15;
const mixRGB = (a: RGB, b: RGB, k: number): RGB => [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k)];
const sm01 = (a: number, b: number, v: number): number => {
  const u = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
/** How much moss is on him at a point: clumps and mats, on his crown and over his brow only (0 none). */
function mossAt(x: number, y: number, z: number): number {
  const crown = sm01(170, 215, z + 0.15 * y);
  const brow = Math.abs(x) < 190 && y > 105 && y < 200 ? sm01(232, 248, z + 0.0018 * x * x) : 0;
  const where = Math.max(crown, brow);
  if (where <= 0) return 0;
  const c = vn(x * 0.03, y * 0.03, z * 0.03, 91) * 0.75 + vn(x * 0.09, y * 0.09, z * 0.09, 92) * 0.25;
  return Math.max(0, Math.min(1, (c - 0.5) * 5)) * where;
}

// =============================================================================================
// NOISE

function h3(x: number, y: number, z: number, s: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1440670441) + Math.imul(s | 0, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** A hash of a picture pixel, for the dither. */
const hp = (x: number, y: number, s: number): number => h3(x, y, 0, s);
function vn(x: number, y: number, z: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  let fx = x - xi;
  let fy = y - yi;
  let fz = z - zi;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  fz = fz * fz * (3 - 2 * fz);
  const a = h3(xi, yi, zi, s) + (h3(xi + 1, yi, zi, s) - h3(xi, yi, zi, s)) * fx;
  const b = h3(xi, yi + 1, zi, s) + (h3(xi + 1, yi + 1, zi, s) - h3(xi, yi + 1, zi, s)) * fx;
  const c = h3(xi, yi, zi + 1, s) + (h3(xi + 1, yi, zi + 1, s) - h3(xi, yi, zi + 1, s)) * fx;
  const d = h3(xi, yi + 1, zi + 1, s) + (h3(xi + 1, yi + 1, zi + 1, s) - h3(xi, yi + 1, zi + 1, s)) * fx;
  const e = a + (b - a) * fy;
  const f = c + (d - c) * fy;
  return e + (f - e) * fz;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const bayer = (x: number, y: number): number => BAYER[(y & 3) * 4 + (x & 3)];

// =============================================================================================
// SOLIDS (distances in his own lengths; each a little under the truth where it is bent, so the march steps short)

function ell(x: number, y: number, z: number, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number): number {
  const ax = (x - cx) / rx;
  const ay = (y - cy) / ry;
  const az = (z - cz) / rz;
  const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
  const bx = ax / rx;
  const by = ay / ry;
  const bz = az / rz;
  const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
  return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, ry, rz);
}
function smin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
function smax(a: number, b: number, k: number): number {
  return -smin(-a, -b, k);
}
/** A round cone from a (radius ra) to b (radius rb): near enough for a march. */
function cone(x: number, y: number, z: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, ra: number, rb: number): number {
  const ux = bx - ax;
  const uy = by - ay;
  const uz = bz - az;
  const L2 = ux * ux + uy * uy + uz * uz;
  let t = L2 > 1e-9 ? ((x - ax) * ux + (y - ay) * uy + (z - az) * uz) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = x - ax - ux * t;
  const dy = y - ay - uy * t;
  const dz = z - az - uz * t;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t);
}

// =============================================================================================
// A POSE (what a picture of him says)

export interface ArmPose {
  /** Its spine, from where it leaves the water (or his body) to its tip: points the curve passes through. */
  path: ReadonlyArray<readonly [number, number, number]>;
  /** Its thickness at its root, and the way its suckers face at its root (they turn with the curl after). */
  r: number;
  belly: readonly [number, number, number];
  seed: number;
}
export interface ColossusPose {
  /** 'front', or 'back' (his back to the camera: the game's rulebook asks both). */
  view: 'front' | 'back';
  /** How far down he is: 0 risen, `COLOSSUS.sunk` under the water (phase 1); and how far back out in the water (sunk, further). Without his body at all: `body` false. */
  drop: number;
  back?: number;
  body: boolean;
  /** His maw: 0 shut, 1 torn open. His lids: 1 open wide, 0.5 narrowed. */
  maw: number;
  lid: number;
  /** The way his eye looks (his own space). */
  gaze: readonly [number, number, number];
  arms: ReadonlyArray<ArmPose>;
}

/** The picture of him: its pixels (two to a game pixel), where the water under his middle is on it, and his lights. */
export interface ColossusPicture {
  px: Px;
  ax: number;
  ay: number;
  lights: Light[];
  /** How near the eye each pixel is (for laying things in front of or behind him), NaN where he is not. */
  near: Float32Array;
  /** What each pixel is: 0 nothing, 1 him over the water, 2 him under it, 3 the water round him, 4 what hangs off him. */
  kind: Uint8Array;
}

// =============================================================================================
// THE SCENE OF ONE PICTURE: his solids for a pose

interface Arm {
  /** Its spine sampled: x, y, z, radius; and the way its suckers face at each sample; how far along it each is. */
  p: Float64Array;
  inner: Float64Array;
  s: Float64Array;
  n: number;
  box: [number, number, number, number, number, number];
  seed: number;
}

function catmull(pts: ReadonlyArray<readonly [number, number, number]>, n: number): number[][] {
  const out: number[][] = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const segs = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * segs;
    const k = Math.min(segs - 1, Math.floor(u));
    const t = u - k;
    const p0 = P[k];
    const p1 = P[k + 1];
    const p2 = P[k + 2];
    const p3 = P[k + 3];
    const q: number[] = [];
    for (let c = 0; c < 3; c++) {
      q.push(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t * t + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t * t * t));
    }
    out.push(q);
  }
  return out;
}

function armOf(a: ArmPose): Arm {
  const N = 46;
  const pts = catmull(a.path, N);
  const p = new Float64Array(N * 4);
  const inner = new Float64Array(N * 3);
  const s = new Float64Array(N);
  const box: [number, number, number, number, number, number] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  let along = 0;
  let prevIn = a.belly;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const r = a.r * Math.pow(1 - t, 1.25) + 1.4;
    const q = pts[i];
    p[i * 4] = q[0];
    p[i * 4 + 1] = q[1];
    p[i * 4 + 2] = q[2];
    p[i * 4 + 3] = r;
    if (i > 0) along += Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1], q[2] - pts[i - 1][2]);
    s[i] = along;
    // (the suckers' side: the curl's inside where it curls, the belly's way where it runs straight, kept square to the spine)
    const a0 = pts[Math.max(0, i - 1)];
    const a1 = pts[Math.min(N - 1, i + 1)];
    let tx = a1[0] - a0[0];
    let ty = a1[1] - a0[1];
    let tz = a1[2] - a0[2];
    const tl = Math.hypot(tx, ty, tz) || 1;
    tx /= tl;
    ty /= tl;
    tz /= tl;
    let cx = a0[0] + a1[0] - 2 * q[0];
    let cy = a0[1] + a1[1] - 2 * q[1];
    let cz = a0[2] + a1[2] - 2 * q[2];
    const cl = Math.hypot(cx, cy, cz);
    const curl = Math.min(1, (cl / (Math.hypot(a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]) || 1)) * 8);
    let ix = prevIn[0] * (1 - curl) + (cl > 1e-6 ? cx / cl : 0) * curl;
    let iy = prevIn[1] * (1 - curl) + (cl > 1e-6 ? cy / cl : 0) * curl;
    let iz = prevIn[2] * (1 - curl) + (cl > 1e-6 ? cz / cl : 0) * curl;
    const dd = ix * tx + iy * ty + iz * tz;
    ix -= tx * dd;
    iy -= ty * dd;
    iz -= tz * dd;
    const il = Math.hypot(ix, iy, iz) || 1;
    inner[i * 3] = ix / il;
    inner[i * 3 + 1] = iy / il;
    inner[i * 3 + 2] = iz / il;
    prevIn = [ix / il, iy / il, iz / il];
    box[0] = Math.min(box[0], q[0] - r - 36);
    box[1] = Math.min(box[1], q[1] - r - 36);
    box[2] = Math.min(box[2], q[2] - r - 36);
    box[3] = Math.max(box[3], q[0] + r + 36);
    box[4] = Math.max(box[4], q[1] + r + 36);
    box[5] = Math.max(box[5], q[2] + r + 36);
  }
  return { p, inner, s, n: N, box, seed: a.seed };
}

/** What a distance found (the solid nearest, and on an arm where along it and round it). */
interface Found {
  mat: number;
  arm: number;
  armT: number;
  armPhi: number;
  armS: number;
  armR: number;
  /** On a tooth: how far from its root to its tip (0 to 1), and whether it is broken. */
  toothT: number;
  broken: boolean;
}

/** His maw: half its width; its upper lip's line (up from the water); how far down its jaw drops and its upper lip peels up when torn open. */
const MAW = { half: 116, top: 86, drop: 64, peel: 12 } as const;
/** The front of his face at the maw's height, at x across (how far toward the camera). */
const frontAt = (x: number): number => 166 - 0.0026 * x * x;
/** The seam of his lips: ragged, its corners dragged down. */
const mouthUp = (x: number): number => MAW.top - 0.0016 * x * x + (vn(x * 0.045, 0, 0, 120) - 0.5) * 9;
/** His lower jaw's edge: shut, just under the seam; torn open, dropped, most at the middle. */
const mouthLow = (o: number, x: number): number => mouthUp(x) - 3 - o * MAW.drop * Math.max(0, 1 - (Math.abs(x) / (MAW.half + 10)) ** 1.6);
/** How deep his gape runs into him at x across (back from the front of his face), torn open: into his throat at the middle. */
const throatBack = (x: number): number => 20 + 100 * Math.max(0, 1 - (Math.abs(x) / 70) ** 2);

/** A tooth: its root, a bend and its tip (x, y, z, radius at each), whether it is broken, and a box round it. */
interface Tooth {
  p: number[];
  broken: boolean;
  box: [number, number, number, number, number, number];
}
function toothOf(root: number[], dir: number[], len: number, r: number, bend: number[], broken: boolean): Tooth {
  const L = broken ? len * 0.45 : len;
  const mid = [root[0] + dir[0] * L * 0.55 + bend[0] * L * 0.12, root[1] + dir[1] * L * 0.55 + bend[1] * L * 0.12, root[2] + dir[2] * L * 0.55 + bend[2] * L * 0.12];
  const tip = [root[0] + dir[0] * L + bend[0] * L * 0.42, root[1] + dir[1] * L + bend[1] * L * 0.42, root[2] + dir[2] * L + bend[2] * L * 0.42];
  const rt = broken ? r * 0.62 : 0.5;
  const p = [root[0], root[1], root[2], r, mid[0], mid[1], mid[2], r * (broken ? 0.75 : 0.62), tip[0], tip[1], tip[2], rt];
  const box: [number, number, number, number, number, number] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let k = 0; k < 12; k += 4) {
    for (let c = 0; c < 3; c++) {
      box[c] = Math.min(box[c], p[k + c] - r - 1);
      box[c + 3] = Math.max(box[c + 3], p[k + c] + r + 1);
    }
  }
  return { p, broken, box };
}

class Scene {
  readonly arms: Arm[];
  readonly drop: number;
  readonly back: number;
  readonly body: boolean;
  readonly maw: number;
  readonly lid: number;
  readonly gaze: readonly [number, number, number];
  readonly flip: number;
  /** His teeth. */
  readonly teeth: Tooth[] = [];
  /** His lips, upper and lower, and his gums: each a line of points (x, y, z, radius). */
  readonly lips: number[][] = [];
  readonly gums: number[][] = [];
  constructor(pose: ColossusPose) {
    this.arms = pose.arms.map(armOf);
    this.drop = pose.drop;
    this.back = pose.back ?? 0;
    this.body = pose.body;
    this.maw = pose.maw;
    this.lid = pose.lid;
    const g = pose.gaze;
    const gl = Math.hypot(g[0], g[1], g[2]) || 1;
    this.gaze = [g[0] / gl, g[1] / gl, g[2] / gl];
    this.flip = pose.view === 'back' ? -1 : 1;
    // HIS MAW: a wide ragged seam of rotten, swollen lips, crooked fangs of every size over it, some long and curved, some broken.
    // Torn open, his jaw drops and his lips peel back from his gums: rows of fangs running back into a dark wet throat
    const o = this.maw;
    const M = MAW;
    // (his lips: swollen and lumpy along the seam, the upper peeling up and the lower dropping as he opens)
    const up: number[] = [];
    const low: number[] = [];
    const gumU: number[] = [];
    const gumL: number[] = [];
    for (let k = 0; k <= 16; k++) {
      const x = -M.half - 4 + (k / 16) * (2 * M.half + 8);
      const sw = 7 + 6 * vn(x * 0.06, 1, 0, 121);
      up.push(x, frontAt(x) - 4, mouthUp(x) + sw * 0.7 + o * M.peel, sw);
      const sl = 8 + 6 * vn(x * 0.055, 2, 0, 122);
      low.push(x, frontAt(x) - 4 - o * 8, mouthLow(o, x) - sl * 0.6, sl);
      gumU.push(x, frontAt(x) - 9, mouthUp(x) - 1 + o * M.peel * 0.6, 7);
      gumL.push(x, frontAt(x) - 11 - o * 8, mouthLow(o, x) + 1, 7);
    }
    this.lips.push(up, low);
    this.gums.push(gumU, gumL);
    // (the fangs: crooked, of every size, spaced unevenly; two long and curved, three broken; the lower front row jutting up over
    // the upper lip at its corners; two rows more behind each, smaller, running back into his throat)
    const fang = (x: number, upper: boolean, row: number, i: number): void => {
      const seed = (upper ? 0 : 50) + row * 17 + i;
      const long = row === 0 && (upper ? i === 1 || i === 6 : i === 0 || i === 6);
      const broken = row === 0 && (upper ? i === 4 || i === 8 : i === 3);
      // (shut, the lower ones short of the upper lip but for the long ones at its corners, jutting up over it)
      const len = (long ? 34 + 10 * h3(seed, 1, 0, 130) : (row === 0 ? (upper ? 16 : 9) : 9 - row) + (upper ? 14 : 8) * h3(seed, 2, 0, 131)) * (1 + o * (upper ? 0.15 : 0.6));
      const r = (long ? 6.5 : row === 0 ? 4.6 + 2 * h3(seed, 3, 0, 132) : 3.6 - row * 0.4) * 1.0;
      const back = row * (14 + 26 * o);
      // (the front rows, shut, hang out over the seam in front of the other lip)
      const y = frontAt(x) - 8 - back + (row === 0 ? 12 * (1 - o) : 0);
      const z = upper ? mouthUp(x) + o * M.peel * 0.6 - (row ? 2 : 0) : mouthLow(o, x) + 1 + (row ? 2 : 0);
      const tilt = (h3(seed, 4, 0, 133) - 0.5) * 0.6 + (long ? Math.sign(-x || 1) * 0.18 : 0);
      const fwd = row === 0 ? 0.12 + 0.25 * (1 - o) : 0.08;
      const dir = upper ? [tilt, fwd, -1] : [tilt, fwd, 1];
      const dl = Math.hypot(dir[0], dir[1], dir[2]);
      const bend = long ? [Math.sign(-x || 1) * 0.5, 0.5, 0] : [(h3(seed, 5, 0, 134) - 0.5) * 0.5, 0.2, 0];
      this.teeth.push(toothOf([x, y, z], [dir[0] / dl, dir[1] / dl, dir[2] / dl], len, r, bend, broken));
    };
    const rowXs = (n: number, seed: number, half: number): number[] => {
      const xs: number[] = [];
      for (let i = 0; i < n; i++) xs.push(-half + ((i + 0.5 + (h3(i, seed, 0, 135) - 0.5) * 0.7) / n) * 2 * half);
      return xs;
    };
    rowXs(9, 1, M.half - 10).forEach((x, i) => fang(x, true, 0, i));
    rowXs(7, 2, M.half - 16).forEach((x, i) => fang(x, false, 0, i));
    if (o > 0.3) {
      for (const row of [1, 2]) {
        rowXs(9 - row, 3 + row, (M.half - 18) * (1 - row * 0.22)).forEach((x, i) => fang(x, true, row, i));
        rowXs(8 - row, 6 + row, (M.half - 22) * (1 - row * 0.24)).forEach((x, i) => fang(x, false, row, i));
      }
    }
  }

  /** His body's distance at a point of his own space (before his drop), and what is nearest (`f`). */
  bodyAt(x: number, y: number, z: number, f: Found | null): number {
    // THE HILL: hunched; a high back heaved up behind his brow, knotted along its ridge; heavy shoulders lower either side
    let d = ell(x, y, z, 0, -84, 48, 250, 165, 212);
    d = smin(d, ell(x, y, z, -150, -60, 214, 64, 60, 52), 30);
    d = smin(d, ell(x, y, z, -58, -92, 254, 62, 58, 46), 30);
    d = smin(d, ell(x, y, z, 44, -82, 262, 66, 60, 48), 30);
    d = smin(d, ell(x, y, z, 136, -52, 222, 58, 56, 46), 30);
    d = smin(d, ell(x, y, z, -232, 0, 100, 136, 126, 120), 46);
    d = smin(d, ell(x, y, z, 232, 0, 100, 136, 126, 120), 46);
    d = smin(d, ell(x, y, z, -296, 34, 112, 78, 88, 84), 34);
    d = smin(d, ell(x, y, z, 296, 34, 112, 78, 88, 84), 34);
    d = smin(d, ell(x, y, z, 0, 66, 120, 176, 100, 128), 40);
    // his jowls sagging down into the water in folds; his chin under the maw; the rolls of his belly
    d = smin(d, ell(x, y, z, -130, 112, 40, 92, 70, 92), 24);
    d = smin(d, ell(x, y, z, 130, 112, 40, 92, 70, 92), 24);
    d = smin(d, ell(x, y, z, -152, 122, -12, 70, 60, 58), 22);
    d = smin(d, ell(x, y, z, 152, 122, -12, 70, 60, 58), 22);
    d = smin(d, ell(x, y, z, 0, 118, -6, 130, 60, 50), 28);
    d = smin(d, ell(x, y, z, -180, 76, -22, 168, 92, 68), 40);
    d = smin(d, ell(x, y, z, 180, 76, -22, 168, 92, 68), 40);
    // HIS BROW: a cliff jutting out over his eye, flat beneath, sagging at its ends
    {
      const cx = Math.max(-172, Math.min(172, x));
      const sag = 0.0019 * cx * cx;
      const cz = 236 - sag;
      let b = Math.hypot(x - cx, (y - 138) * 0.85, (z - cz) * 1.1) - (50 - 0.0004 * cx * cx);
      // (cut flat beneath, a cliff over his eye)
      b = smax(b, cz - 34 - z, 10);
      d = smin(d, b, 22);
    }
    // FOLDS: hung down him in curtains, rolls sagging across him
    if (d < 30) {
      const w = vn(x * 0.011, y * 0.011, z * 0.006, 11);
      const fold = Math.sin(x * 0.062 + w * 7.0);
      const roll = Math.sin(z * 0.08 + vn(x * 0.008, y * 0.01, z * 0.01, 12) * 6.5);
      const face = 1 - 0.7 * (1 - sm01(80, 160, Math.abs(x))) * sm01(20, 80, y) * sm01(40, 90, z) * (1 - sm01(200, 240, z));
      d -= (fold * 9 * (1 - Math.abs(roll) * 0.4) + roll * 6.5) * face;
      d -= (vn(x * 0.022, y * 0.022, z * 0.022, 13) - 0.5) * 16;
      // (moss in clumps and mats on his crown and over his brow only)
      if (!BARE) {
        const m = mossAt(x, y, z);
        if (m > 0) d -= m * (2.5 + 3.5 * vn(x * 0.16, y * 0.16, z * 0.16, 15));
        // boils and open sores
        if (z > 50) {
          const S2 = 18;
          const ix = Math.floor(x / S2);
          const iy = Math.floor(y / S2);
          const iz = Math.floor(z / S2);
          const roll2 = h3(ix, iy, iz, 41);
          if (roll2 < 0.085 && m <= 0) {
            const rr = Math.hypot(x - (ix + 0.3 + 0.4 * h3(ix, iy, iz, 42)) * S2, y - (iy + 0.3 + 0.4 * h3(ix, iy, iz, 43)) * S2, z - (iz + 0.3 + 0.4 * h3(ix, iy, iz, 44)) * S2);
            const br = 4.5 + 3.5 * h3(ix, iy, iz, 45);
            if (rr < br) {
              const sore = roll2 < 0.012;
              d -= sore ? -1.6 * (1 - rr / br) : 3.4 * Math.sqrt(1 - (rr / br) ** 2);
              if (f && rr < br * 0.85) f.mat = sore ? M_SORE : M_BOIL;
            }
          }
        }
      }
    }
    if (BARE) return d;
    // HIS EYE'S SOCKET, cut deep under the brow
    const E = COLOSSUS.eye;
    d = smax(d, -ell(x, y, z, 0, E.y + 40, E.z, 94, 70, 68), 16);
    // HIS LIDS: thick, closing the socket round his eye but for its almond
    {
      const ex = x;
      const ey = y - E.y;
      const ez = z - E.z;
      const R = COLOSSUS.eyeR;
      const de = Math.hypot(ex, ey, ez);
      if (de < R + 30) {
        const shell = Math.abs(de - (R + 6)) - 7;
        const W = 74;
        const k = Math.max(0, 1 - (ex / W) ** 2);
        const up = 46 * this.lid * k - 4;
        const low = -38 * this.lid * k + 4;
        const out = Math.max(ez - up, low - ez);
        let lid = Math.max(shell, -out);
        lid = Math.max(lid, -ey - 12);
        if (lid < d + 6) {
          const was = d;
          d = smin(d, lid, 7);
          if (f && lid < was) f.mat = M_LID;
        }
      }
    }
    // HIS MAW
    const o = this.maw;
    if (Math.abs(x) < MAW.half + 34 && y > 30 && z < MAW.top + 40 && z > -40) {
      // (the gape, torn open: from his upper gums down to his lower, back into his throat, which narrows and folds)
      if (o > 0.05) {
        const zu = mouthUp(x) + o * MAW.peel * 0.6 - 2;
        const zl = mouthLow(o, x) + 2;
        const back = frontAt(x) - throatBack(x) * o;
        const folds = Math.sin(y * 0.3 + x * 0.04) * 2.2 * sm01(150, 110, y);
        const cav = Math.max(z - zu, zl - z, Math.abs(x) - MAW.half + 6, back - y) + folds;
        d = smax(d, -cav, 7);
        if (f && cav < 3) f.mat = y < frontAt(x) - 30 ? M_THROAT : M_MAW;
        // his tongue, on the floor of his mouth
        const tg = ell(x, y, z, 0, frontAt(0) - 52, zl + 6, 46, 50, 13) - (vn(x * 0.08, y * 0.08, 0, 136) - 0.5) * 3;
        if (tg < d) {
          d = smin(d, tg, 4);
          if (f && tg < d + 2) f.mat = M_TONGUE;
        }
      }
      // his lips, swollen and lumpy, and his gums where they curl back
      let lipD = Infinity;
      for (const lip of this.lips) for (let k = 0; k + 4 < lip.length; k += 4) lipD = Math.min(lipD, cone(x, y, z, lip[k], lip[k + 1], lip[k + 2], lip[k + 4], lip[k + 5], lip[k + 6], lip[k + 3], lip[k + 7]));
      lipD -= (vn(x * 0.12, y * 0.12, z * 0.12, 137) - 0.5) * 4;
      let gumD = Infinity;
      for (const gum of this.gums) for (let k = 0; k + 4 < gum.length; k += 4) gumD = Math.min(gumD, cone(x, y, z, gum[k], gum[k + 1], gum[k + 2], gum[k + 4], gum[k + 5], gum[k + 6], gum[k + 3], gum[k + 7]));
      const was = d;
      if (gumD < d) {
        d = smin(d, gumD, 4);
        if (f && gumD < was) f.mat = M_GUM;
      }
      const was2 = d;
      d = smin(d, lipD, 8);
      if (f && lipD < was2 + 2) f.mat = M_LIP;
      // his fangs
      for (const T of this.teeth) {
        const b = T.box;
        if (x < b[0] || y < b[1] || z < b[2] || x > b[3] || y > b[4] || z > b[5]) continue;
        const P = T.p;
        const a1 = cone(x, y, z, P[0], P[1], P[2], P[4], P[5], P[6], P[3], P[7]);
        const a2 = cone(x, y, z, P[4], P[5], P[6], P[8], P[9], P[10], P[7], P[11]);
        const td = Math.min(a1, a2);
        if (td < d) {
          d = td;
          if (f) {
            f.mat = M_TOOTH;
            f.broken = T.broken;
            // (how far along it: from its root to its tip)
            const L1 = Math.hypot(P[4] - P[0], P[5] - P[1], P[6] - P[2]);
            const L2 = Math.hypot(P[8] - P[4], P[9] - P[5], P[10] - P[6]);
            const along = a1 <= a2 ? Math.min(1, Math.hypot(x - P[0], y - P[1], z - P[2]) / (L1 || 1)) * (L1 / (L1 + L2)) : L1 / (L1 + L2) + Math.min(1, Math.hypot(x - P[4], y - P[5], z - P[6]) / (L2 || 1)) * (L2 / (L1 + L2));
            f.toothT = along;
          }
        }
      }
    }
    // HIS EYE
    {
      const de = Math.hypot(x, y - E.y, z - E.z) - COLOSSUS.eyeR;
      if (de < d) {
        d = de;
        if (f) f.mat = M_EYE;
      }
    }
    // OLD BONES AND STONES GROWN INTO HIS HIDE
    if (z > 120 || Math.abs(x) > 170) {
      const b = this.bones(x, y, z, f, d);
      if (b < d) d = b;
    }
    // LEECHES on him
    {
      const L = placed().leeches;
      for (let i = 0; i < L.length; i += 7) {
        const ux = L[i + 3];
        const uy = L[i + 4];
        const uz = L[i + 5];
        const half = L[i + 6];
        const ld = cone(x, y, z, L[i] - ux * half, L[i + 1] - uy * half, L[i + 2] - uz * half, L[i] + ux * half, L[i + 1] + uy * half, L[i + 2] + uz * half, 4.6, 3.2);
        if (ld < d) {
          d = ld;
          if (f) f.mat = M_LEECH;
        }
      }
    }
    // BARNACLES crusting him at the water
    if (z < 70 && d < 8 && !(Math.abs(x) < 160 && y > 110)) {
      const S = 10;
      const ix = Math.floor(x / S);
      const iy = Math.floor(y / S);
      const iz = Math.floor(z / S);
      if (h3(ix, iy, iz, 31) < 0.42 - z / 260) {
        const cx = (ix + 0.25 + 0.5 * h3(ix, iy, iz, 32)) * S;
        const cy = (iy + 0.25 + 0.5 * h3(ix, iy, iz, 33)) * S;
        const cz = (iz + 0.25 + 0.5 * h3(ix, iy, iz, 34)) * S;
        const rr = Math.hypot(x - cx, y - cy, z - cz);
        if (rr < 5.5) {
          const bump = 3.4 * (1 - rr / 5.5) - (rr < 1.6 ? 2.2 : 0);
          d -= bump;
          if (f && bump > 0.6) f.mat = M_BARN;
        }
      }
    }
    return d;
  }

  /** The bones and stones in him. */
  bones(x: number, y: number, z: number, f: Found | null, best: number): number {
    let d = Infinity;
    let m = 0;
    // a horned beast's skull on his left shoulder, its snout down and toward you
    const PL = placed();
    const [sx, sy, sz] = PL.horn;
    if (Math.abs(x - sx) < 70 && Math.abs(y - sy) < 70 && Math.abs(z - sz) < 70) {
      let s = ell(x, y, z, sx, sy, sz, 22, 24, 19);
      s = smin(s, ell(x, y, z, sx, sy + 26, sz - 14, 12, 20, 11), 8);
      s = smax(s, -ell(x, y, z, sx - 11, sy + 17, sz + 3, 6.5, 8, 6), 3);
      s = smax(s, -ell(x, y, z, sx + 11, sy + 17, sz + 3, 6.5, 8, 6), 3);
      s = smax(s, -ell(x, y, z, sx, sy + 42, sz - 18, 4, 6, 4), 2);
      for (const side of [-1, 1]) {
        s = Math.min(s, cone(x, y, z, sx + side * 18, sy + 2, sz + 12, sx + side * 40, sy + 4, sz + 26, 6.4, 4.2));
        s = Math.min(s, cone(x, y, z, sx + side * 40, sy + 4, sz + 26, sx + side * 50, sy + 14, sz + 46, 4.2, 1.2));
      }
      if (s < d) {
        d = s;
        m = M_BONE;
      }
    }
    // the ribs of something great across his right shoulder
    if (x > 90 && x < 340 && z > 120) {
      for (let i = 0; i < 4; i++) {
        let prev: number[] | null = null;
        for (let k = 0; k <= 5; k++) {
          const th = 0.15 * Math.PI + (k / 5) * 0.62 * Math.PI;
          const q = [212 + 104 * Math.cos(th), -46 + i * 30 + 10 * Math.sin(th), 116 + 102 * Math.sin(th) - i * 9];
          if (prev) {
            const s = cone(x, y, z, prev[0], prev[1], prev[2], q[0], q[1], q[2], 7, 7);
            if (s < d) {
              d = s;
              m = M_BONE;
            }
          }
          prev = q;
        }
      }
    }
    // the skulls of the drowned
    const SK = PL.skulls;
    for (let i = 0; i < SK.length; i += 4) {
      const cx = SK[i];
      const cy = SK[i + 1];
      const cz = SK[i + 2];
      const r = SK[i + 3];
      if (Math.abs(x - cx) > r * 2 || Math.abs(y - cy) > r * 2 || Math.abs(z - cz) > r * 2) continue;
      let s = ell(x, y, z, cx, cy, cz, r, r * 1.08, r * 1.02);
      s = smin(s, ell(x, y, z, cx, cy + r * 0.6, cz - r * 0.8, r * 0.62, r * 0.5, r * 0.42), r * 0.3);
      s = smax(s, -ell(x, y, z, cx - r * 0.36, cy + r * 0.88, cz - r * 0.08, r * 0.27, r * 0.3, r * 0.3), 1.2);
      s = smax(s, -ell(x, y, z, cx + r * 0.36, cy + r * 0.88, cz - r * 0.08, r * 0.27, r * 0.3, r * 0.3), 1.2);
      s = smax(s, -ell(x, y, z, cx, cy + r * 1.0, cz - r * 0.5, r * 0.12, r * 0.2, r * 0.16), 1);
      if (s < d) {
        d = s;
        m = M_BONE;
      }
    }
    // a drum of a fallen column, and a broken slab, sunk in his crown
    if (z > 170) {
      // (the drum: its axis tipped)
      const ax = 0.34;
      const ay = 0.22;
      const az = 0.914;
      const px = x - PL.drum[0];
      const py = y - PL.drum[1];
      const pz = z - PL.drum[2];
      const along = px * ax + py * ay + pz * az;
      const rad = Math.hypot(px - ax * along, py - ay * along, pz - az * along);
      const chip = (h3(Math.floor(Math.atan2(py, px) * 4), 0, 0, 51) - 0.5) * 4;
      const s = Math.max(Math.abs(along) - 15, rad - 27 + chip);
      if (s < d) {
        d = s;
        m = M_STONE;
      }
      // (the slab: a box leaning back)
      const qx = x - PL.slab[0];
      const qy = y - PL.slab[1];
      const qz = z - PL.slab[2];
      const c = Math.cos(0.5);
      const sn = Math.sin(0.5);
      const ly = qy * c - qz * sn;
      const lz = qy * sn + qz * c;
      const bx = Math.abs(qx) - 30;
      const by = Math.abs(ly) - 7;
      const bz = Math.abs(lz) - 26 + (h3(Math.floor(qx / 6), 0, 0, 52) - 0.5) * 6 * (lz > 0 ? 1 : 0);
      const sb = Math.min(Math.max(bx, by, bz), 0) + Math.hypot(Math.max(bx, 0), Math.max(by, 0), Math.max(bz, 0)) - 1.5;
      if (sb < d) {
        d = sb;
        m = M_STONE;
      }
    }
    // great horns of old bone broken out of his back, a tusk out of his shoulder, and dead wood grown up out of his crown: his outline
    if (z > 150) {
      for (const H of PL.spurs) {
        for (let k = 0; k + 7 < H.length; k += 4) {
          const sd = cone(x, y, z, H[k], H[k + 1], H[k + 2], H[k + 4], H[k + 5], H[k + 6], H[k + 3], H[k + 7]);
          if (sd < d) {
            d = sd;
            m = M_BONE;
          }
        }
      }
      for (const H of PL.wood) {
        for (let k = 0; k + 7 < H.length; k += 4) {
          const sd = cone(x, y, z, H[k], H[k + 1], H[k + 2], H[k + 4], H[k + 5], H[k + 6], H[k + 3], H[k + 7]);
          if (sd < d) {
            d = sd;
            m = M_WOOD;
          }
        }
      }
    }
    if (f && d < best) f.mat = m;
    return d;
  }

  /** An arm's distance (`i`), and where on it. */
  armAt(i: number, x: number, y: number, z: number, f: Found | null): number {
    const A = this.arms[i];
    const b = A.box;
    if (x < b[0] || y < b[1] || z < b[2] || x > b[3] || y > b[4] || z > b[5]) {
      // (outside its box: how far to the box, as a bound)
      const dx = Math.max(b[0] - x, 0, x - b[3]);
      const dy = Math.max(b[1] - y, 0, y - b[4]);
      const dz = Math.max(b[2] - z, 0, z - b[5]);
      return Math.hypot(dx, dy, dz) + 30;
    }
    const P = A.p;
    let d = Infinity;
    let bestK = 0;
    let bestT = 0;
    for (let k = 0; k + 1 < A.n; k++) {
      const ax = P[k * 4];
      const ay = P[k * 4 + 1];
      const az = P[k * 4 + 2];
      const ux = P[k * 4 + 4] - ax;
      const uy = P[k * 4 + 5] - ay;
      const uz = P[k * 4 + 6] - az;
      const L2 = ux * ux + uy * uy + uz * uz;
      let t = ((x - ax) * ux + (y - ay) * uy + (z - az) * uz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const r = P[k * 4 + 3] + (P[k * 4 + 7] - P[k * 4 + 3]) * t;
      const e = Math.hypot(x - ax - ux * t, y - ay - uy * t, z - az - uz * t) - r;
      if (e < d) {
        d = e;
        bestK = k;
        bestT = t;
      }
    }
    if (d > 16) return d;
    // ITS SKIN: smooth muscle, its suckers in two rows along its underside
    const k = bestK;
    const t = bestT;
    const cxp = P[k * 4] + (P[k * 4 + 4] - P[k * 4]) * t;
    const cyp = P[k * 4 + 1] + (P[k * 4 + 5] - P[k * 4 + 1]) * t;
    const czp = P[k * 4 + 2] + (P[k * 4 + 6] - P[k * 4 + 2]) * t;
    const r = P[k * 4 + 3] + (P[k * 4 + 7] - P[k * 4 + 3]) * t;
    const s = A.s[k] + (A.s[k + 1] - A.s[k]) * t;
    const In = A.inner;
    let ix = In[k * 3] + (In[k * 3 + 3] - In[k * 3]) * t;
    let iy = In[k * 3 + 1] + (In[k * 3 + 4] - In[k * 3 + 1]) * t;
    let iz = In[k * 3 + 2] + (In[k * 3 + 5] - In[k * 3 + 2]) * t;
    let tx = P[k * 4 + 4] - P[k * 4];
    let ty = P[k * 4 + 5] - P[k * 4 + 1];
    let tz = P[k * 4 + 6] - P[k * 4 + 2];
    const tl = Math.hypot(tx, ty, tz) || 1;
    tx /= tl;
    ty /= tl;
    tz /= tl;
    const il = Math.hypot(ix, iy, iz) || 1;
    ix /= il;
    iy /= il;
    iz /= il;
    const sx = ty * iz - tz * iy;
    const sy = tz * ix - tx * iz;
    const sz = tx * iy - ty * ix;
    const vx = x - cxp;
    const vy = y - cyp;
    const vz = z - czp;
    const phi = Math.atan2(vx * sx + vy * sy + vz * sz, vx * ix + vy * iy + vz * iz);
    d -= (vn(s * 0.03, phi * 0.8, 0, A.seed + 1) - 0.5) * 1.6;
    const sr = Math.max(1.6, r * 0.27);
    const space = sr * 2.5;
    let sucker = 0;
    if (Math.abs(phi) < 1.25 && r > 4.5) {
      for (const row of [-0.48, 0.48]) {
        const off = row > 0 ? 0.5 : 0;
        const c = Math.round(s / space - off) + off;
        const du = (s / space - c) * space;
        const dv = (phi - row) * r;
        const rho = Math.hypot(du, dv);
        if (rho < sr) {
          const q = rho / sr;
          sucker = q > 0.62 ? 1 : 2;
          d -= q > 0.62 ? 0.9 * sr * 0.22 : -0.38 * sr * (1 - q / 0.62);
        }
      }
    }
    if (f) {
      f.mat = M_ARM;
      f.arm = i;
      f.armT = (k + t) / (A.n - 1);
      f.armPhi = phi;
      f.armS = s;
      f.armR = sucker;
    }
    return d;
  }

  /** How far a point of the water is from him, truly (no bounds), for its ripples. */
  waterDist(X: number, Y: number): number {
    const x = X * this.flip;
    const y = Y * this.flip;
    let d = Infinity;
    for (let i = 0; i < this.arms.length; i++) {
      const A = this.arms[i];
      const P = A.p;
      for (let k = 0; k + 1 < A.n; k++) d = Math.min(d, cone(x, y, 0, P[k * 4], P[k * 4 + 1], P[k * 4 + 2], P[k * 4 + 4], P[k * 4 + 5], P[k * 4 + 6], P[k * 4 + 3], P[k * 4 + 7]));
    }
    if (this.body) {
      const z = this.drop;
      const yb = y + this.back;
      const out = ell(x, yb, z, 0, -10, 40, 420, 260, 290);
      d = Math.min(d, out > 100 ? out : this.bodyAt(x, yb, z, null));
    }
    return d;
  }

  /** His arms alone (where they break the water). */
  armsAt(X: number, Y: number, Z: number): number {
    let d = Infinity;
    for (let i = 0; i < this.arms.length; i++) d = Math.min(d, this.armAt(i, X * this.flip, Y * this.flip, Z, null));
    return d;
  }

  /** Everything of him at a point of the camera's space (X across, Y toward the camera, Z up, from the water under his middle). */
  at(X: number, Y: number, Z: number, f: Found | null): number {
    const x = X * this.flip;
    const y = Y * this.flip;
    let d = Infinity;
    if (this.body) {
      const z = Z + this.drop;
      const yb = y + this.back;
      // (well clear of his hill: how far, as a bound)
      const out = ell(x, yb, z, 0, -10, 40, 420, 260, 290);
      if (out > 30) d = out;
      else d = this.bodyAt(x, yb, z, f);
    }
    for (let i = 0; i < this.arms.length; i++) {
      const a = this.armAt(i, x, y, Z, f ? ARM_F : null);
      if (a < d) {
        // (where an arm leaves his body, the two run together)
        if (f) Object.assign(f, ARM_F);
        d = this.body && d < 40 ? smin(d, a, 10) : a;
      } else if (this.body && a < d + 10) d = smin(d, a, 10);
    }
    return d;
  }
}
class Found0 implements Found {
  mat = M_FLESH;
  arm = -1;
  armT = 0;
  armPhi = 0;
  armS = 0;
  armR = 0;
  toothT = 0;
  broken = false;
}
const ARM_F = new Found0();

/** The skulls of the drowned in him: across, up, size (a man's skull is about 9 of his lengths: the knight stands 58); each set into his hide where it is there. */
const SKULLS_AT = [-118, 200, 10, -96, 186, 9, 152, 160, 9.5, 286, 74, 10, 196, 22, 9, -262, 64, 9.5, -150, 128, 9, 56, 34, 8.5];
/** The leeches on him: across, up, the way each lies, half its length. */
const LEECHES_AT = [-150, 72, 0.3, 0, -0.95, 10, 96, 28, -0.2, 0, -0.98, 9, -96, 150, 0.9, 0, -0.3, 8, 206, 92, 0.1, 0.2, -0.97, 11, 250, 150, -0.4, 0, -0.9, 9];
/** Placing what is set in his hide: his bare body only (no bones, no eye, no maw). */
let BARE = false;
interface Placed {
  skulls: number[];
  leeches: number[];
  horn: number[];
  drum: number[];
  slab: number[];
  /** Horns and a tusk of bone, and dead wood: each a line of points (x, y, z, radius). */
  spurs: number[][];
  wood: number[][];
}
let PLACED: Placed | null = null;
function placed(): Placed {
  if (PLACED) return PLACED;
  const S = new Scene({ view: 'front', drop: 0, body: true, maw: 0, lid: 1, gaze: [0, 1, 0], arms: [] });
  BARE = true;
  /** How far toward the camera his hide is at (x, z); and how high it is at (x, y). */
  const surfY = (x: number, z: number): number => {
    let y = 340;
    while (y > -320 && S.bodyAt(x, y, z, null) > 0) y -= 2;
    let lo = y;
    let hi = y + 2;
    for (let i = 0; i < 12; i++) {
      const m = (lo + hi) / 2;
      if (S.bodyAt(x, m, z, null) > 0) hi = m;
      else lo = m;
    }
    return lo;
  };
  const surfZ = (x: number, y: number): number => {
    let z = 420;
    while (z > -100 && S.bodyAt(x, y, z, null) > 0) z -= 2;
    return z;
  };
  const skulls: number[] = [];
  for (let i = 0; i < SKULLS_AT.length; i += 3) skulls.push(SKULLS_AT[i], surfY(SKULLS_AT[i], SKULLS_AT[i + 1]) - SKULLS_AT[i + 2] * 0.45, SKULLS_AT[i + 1], SKULLS_AT[i + 2]);
  const leeches: number[] = [];
  for (let i = 0; i < LEECHES_AT.length; i += 6) leeches.push(LEECHES_AT[i], surfY(LEECHES_AT[i], LEECHES_AT[i + 1]) + 1.5, LEECHES_AT[i + 1], LEECHES_AT[i + 2], LEECHES_AT[i + 3], LEECHES_AT[i + 4], LEECHES_AT[i + 5]);
  const horn = [-196, surfY(-196, 206) - 8, 206];
  const drum = [-78, -58, surfZ(-78, -58) - 3];
  const slab = [104, -30, surfZ(104, -30) + 8];
  /** A line of points from his hide at (x, y) (each further point given from the one before), radii along it. */
  const grow = (x: number, y: number, steps: number[][], r: number[]): number[] => {
    const out: number[] = [];
    let p = [x, y, surfZ(x, y) - 10];
    out.push(p[0], p[1], p[2], r[0]);
    steps.forEach((st, i) => {
      p = [p[0] + st[0], p[1] + st[1], p[2] + st[2]];
      out.push(p[0], p[1], p[2], r[i + 1]);
    });
    return out;
  };
  const spurs = [
    grow(-120, -64, [[-14, 0, 36], [-26, 4, 30], [-30, 8, 14], [-22, 10, -6]], [12, 10, 7, 4, 1.5]),
    grow(98, -84, [[10, -2, 40], [24, 0, 30], [30, 4, 8]], [11, 9, 5, 1.5]),
    grow(270, 30, [[30, 10, 18], [30, 16, 4], [18, 14, -12]], [10, 8, 5, 1.5]),
    grow(-280, 40, [[-26, 6, 26], [-22, 8, 22]], [8, 6, 1.5]),
  ];
  const wood = [
    grow(-10, -112, [[4, -2, 44], [-10, 0, 30], [-22, 0, 16]], [7, 5.5, 3.5, 1.2]),
    grow(-6, -112, [[6, -2, 40], [22, 2, 26], [18, 2, 18]], [5, 4, 2.6, 1]),
    grow(40, -100, [[8, 0, 22], [16, 0, 10]], [4, 2.6, 1]),
  ];
  BARE = false;
  PLACED = { skulls, leeches, horn, drum, slab, spurs, wood };
  return PLACED;
}

// =============================================================================================
// THE PAINTER

/** How a picture is laid out: its size in picture pixels, where the water under his middle is on it, and how big (1: the game's). */
export interface Frame {
  w: number;
  h: number;
  ax: number;
  ay: number;
  zoom?: number;
}

const L_FIG: readonly [number, number, number] = (() => {
  // the light as the game has it (art/skin.ts: from the left, from above, a little from the eye's side), in the camera's space
  const lx = -0.52;
  const ly = -0.62;
  const lz = 0.59;
  const v = [lx, ly * SIN30 + lz * COS30, -ly * COS30 + lz * SIN30];
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l] as const;
})();
/** The way to the eye, and the way down the picture, in the camera's space. */
const EYE_V: readonly [number, number, number] = [0, COS30, SIN30];
const DOWN_V: readonly [number, number, number] = [0, SIN30, -COS30];

/** Which of five tones for the share of the light (art/skin.ts toneOf's steps). */
function tone(v: number): number {
  return v > 0.93 ? 4 : v > 0.5 ? 3 : v > 0.16 ? 2 : v > -0.3 ? 1 : 0;
}

/** PAINT HIM: a pose, laid on a frame. */
export function paintColossus(pose: ColossusPose, fr: Frame): ColossusPicture {
  const S = new Scene(pose);
  const zoom = fr.zoom ?? 1;
  const { w, h, ax, ay } = fr;
  const px = new Px(w, h);
  const near = new Float32Array(w * h).fill(NaN);
  /** 0 nothing; 1 him over the water; 2 him under it; 3 the water's foam round him. */
  const kind = new Uint8Array(w * h);
  /** How high over the water each pixel of him is (the camera's up), and what it is. */
  const zh = new Float32Array(w * h);
  const mt = new Uint8Array(w * h);
  const D = px.d;
  const f = new Found0();
  const T0 = 700;
  const eps = 0.6;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const X = (i + 0.5 - ax) / (SEEN * zoom);
      const sd = (j + 0.5 - ay) / (SEEN * zoom);
      // the ray: from in front of him, toward the plane of the picture and on through it
      let x = X;
      let y = sd * SIN30 + EYE_V[1] * T0;
      let z = -sd * COS30 + EYE_V[2] * T0;
      let t = 0;
      let hit = false;
      let d = 0;
      for (let n = 0; n < 220 && t < T0 * 2; n++) {
        d = S.at(x, y, z, null);
        if (d < eps) {
          hit = true;
          break;
        }
        const step = d * 0.72;
        t += step;
        y -= EYE_V[1] * step;
        z -= EYE_V[2] * step;
        if (z < -COLOSSUS.seenDeep - 140) break;
      }
      const k = j * w + i;
      // where the ray meets the water
      const wy = sd * SIN30 + (sd * COS30 / EYE_V[2]) * EYE_V[1];
      if (!hit || z < -0.5) {
        // THE WATER ROUND HIM, dark and oily: foam and scum where he breaks it; thin broken lines of ripples spreading from it,
        // further apart further out, catching his eye's glow
        const wd = S.waterDist(X, wy);
        if (wd < RIPPLES[RIPPLES.length - 1] + 2) {
          let c: RGB | null = null;
          let a = 255;
          const sh = hp(i, j, 5);
          if (wd < 3.2 && S.drop < 60 || (S.drop >= 60 && wd < 3.2 && S.armsAt(X, wy, 0) < 3.2)) c = sh < 0.5 ? FOAM[4] : sh < 0.8 ? FOAM[3] : FOAM[1];
          else if (wd < 10 && sh < 0.07) c = SCUM;
          else {
            for (let r = 0; r < RIPPLES.length; r++) {
              const R = RIPPLES[r];
              if (Math.abs(wd - R) < 0.55 && vn(X * 0.045 + r * 3.1, wy * 0.02, r, 6) > 0.4) {
                // (his glow caught in the ripples before him)
                const pinkK = S.body && S.drop < 60 && r < 4 ? Math.max(0, 1 - Math.abs(X) / 240) : 0;
                const base = r < 2 ? FOAM[3] : FOAM[2];
                c = pinkK > 0.35 && hp(i, j, 7) < pinkK ? CO_IRIS[r < 2 ? 1 : 0] : base;
                a = r < 3 ? 255 : 190;
                break;
              }
            }
          }
          if (!c && wd < 46) {
            // (oily dark round him)
            c = WATER;
            a = 70;
          }
          if (c) {
            D[k * 4] = c[0];
            D[k * 4 + 1] = c[1];
            D[k * 4 + 2] = c[2];
            D[k * 4 + 3] = a;
            kind[k] = 3;
            near[k] = wy * EYE_V[1];
            if (!hit || a === 255) continue;
          }
        }
      }
      if (!hit) continue;
      // WHAT IS THERE: its solid, its turn to the light, its shadow and the dark of its folds
      f.mat = M_FLESH;
      f.arm = -1;
      S.at(x, y, z, f);
      const e = 0.9;
      const nx = S.at(x + e, y, z, null) - S.at(x - e, y, z, null);
      const ny = S.at(x, y + e, z, null) - S.at(x, y - e, z, null);
      const nz = S.at(x, y, z + e, null) - S.at(x, y, z - e, null);
      const nl = Math.hypot(nx, ny, nz) || 1;
      const Nx = nx / nl;
      const Ny = ny / nl;
      const Nz = nz / nl;
      let lit = Nx * L_FIG[0] + Ny * L_FIG[1] + Nz * L_FIG[2];
      // (the light's shadow: a short march toward it)
      if (lit > -0.1) {
        let st = 3;
        let sx = x + Nx * 2;
        let sy = y + Ny * 2;
        let sz = z + Nz * 2;
        let shade = 1;
        for (let n = 0; n < 28 && st < 170; n++) {
          const q = S.at(sx + L_FIG[0] * st, sy + L_FIG[1] * st, sz + L_FIG[2] * st, null);
          if (q < 0.4) {
            shade = 0;
            break;
          }
          shade = Math.min(shade, (5 * q) / st);
          st += Math.max(1.5, q * 0.8);
        }
        lit = lit * (0.25 + 0.75 * Math.max(0, Math.min(1, shade))) - (1 - Math.max(0, Math.min(1, shade))) * 0.25;
      }
      // (the dark of his folds: how shut in this point is)
      let occ = 0;
      for (const [dd, wgt] of [[4, 0.5], [10, 0.32], [22, 0.18]] as const) {
        const q = S.at(x + Nx * dd, y + Ny * dd, z + Nz * dd, null);
        occ += wgt * Math.max(0, (dd - q) / dd);
      }
      // (the glint of wet: the light thrown back toward the eye)
      const rl = 2 * (Nx * L_FIG[0] + Ny * L_FIG[1] + Nz * L_FIG[2]);
      const rx = rl * Nx - L_FIG[0];
      const ry = rl * Ny - L_FIG[1];
      const rz = rl * Nz - L_FIG[2];
      const spec = Math.max(0, rx * EYE_V[0] + ry * EYE_V[1] + rz * EYE_V[2]);
      // his own space at the point (for what grows where)
      const fx = x * S.flip;
      const fy = y * S.flip + (f.arm < 0 && S.body ? S.back : 0);
      const fz = z + (f.arm < 0 && S.body ? S.drop : 0);
      // (into the dark toward his edges: the further from his eye, the darker)
      const E0 = COLOSSUS.eye;
      const far = S.body && pose.view === 'front' ? sm01(150, 430, Math.hypot(x, z + S.drop - E0.z)) : sm01(200, 420, Math.hypot(x, z - 120));
      const v = lit * 0.86 - 0.1 - occ * 1.35 - far * 0.42 + bayer(i, j) * 0.14;
      let tn = tone(v);
      const upN = Nz;
      let col: RGB;
      let gloss = 0.5;
      let glow = false;
      const mat = f.mat;
      if (mat === M_EYE) {
        // HIS EYE: yellowed and bloodshot, his iris the enemy's fire round a black slit, looking where his gaze is
        const E = COLOSSUS.eye;
        const ex = fx;
        const ey = fy - E.y;
        const ez = fz - E.z;
        const el = Math.hypot(ex, ey, ez) || 1;
        const ux = ex / el;
        const uy = ey / el;
        const uz = ez / el;
        const g = S.gaze;
        const ca = ux * g[0] + uy * g[1] + uz * g[2];
        const A = (Math.acos(Math.max(-1, Math.min(1, ca))) * 180) / Math.PI;
        // (across and up the iris)
        let ax0 = g[1];
        let ay0 = -g[0];
        const al = Math.hypot(ax0, ay0) || 1;
        ax0 /= al;
        ay0 /= al;
        const vxu = -g[2] * ay0;
        const vyu = g[2] * ax0;
        const vzu = g[0] * ay0 - g[1] * ax0;
        const au = (Math.asin(Math.max(-1, Math.min(1, ux * ax0 + uy * ay0))) * 180) / Math.PI;
        const av = (Math.asin(Math.max(-1, Math.min(1, -(ux * vxu + uy * vyu + uz * vzu)))) * 180) / Math.PI;
        const IR = 27;
        if (A < IR) {
          const slit = 4.4 * Math.sqrt(Math.max(0, 1 - (av / (IR - 2)) ** 2));
          const stria = vn(Math.atan2(av, au) * 7, A * 0.18, 0, 61);
          if (Math.abs(au) < slit) col = PUPIL;
          else if (Math.abs(au) < slit + 1.6) col = CO_IRIS[0];
          else {
            const band = A > IR - 2.5 ? 0 : A > IR - 7 ? 1 : A > IR - 13 ? 2 : A > 7 ? 3 : 4;
            const b2 = Math.max(0, Math.min(4, band + (stria > 0.68 ? 1 : stria < 0.3 ? -1 : 0)));
            // (his brow's shadow dims it a step; it burns all the same)
            col = CO_IRIS[Math.max(0, b2 - (lit < 0.05 ? 1 : 0))];
          }
          glow = true;
          gloss = 1.2;
        } else {
          // the white, veined; redder toward his lids
          const vein = Math.abs(vn(ux * 11, uy * 11, uz * 11, 62) - 0.5) < 0.03 + (A / 90) * 0.05 || Math.abs(vn(ux * 23, uy * 23, uz * 23, 63) - 0.5) < 0.018 + (A / 90) * 0.03;
          const ramp0 = vein ? CO_VEIN : A > 64 && hp(i, j, 64) < (A - 64) / 40 ? CO_VEIN : CO_SCLERA;
          col = ramp0[Math.max(vein ? 1 : 0, Math.min(4, tn + (vein ? 0 : 0)))];
          gloss = 1.0;
        }
        if (spec > 0.985 && lit > 0.2) col = GLINT;
      } else if (mat === M_ARM) {
        // A TENTACLE: smooth muscle, dark along its back shading to pale along its underside; its suckers cupped rings, lit rims
        // and dark middles; a few old scars across its back
        const phi = f.armPhi;
        const under = (Math.cos(phi) + 1) / 2 + bayer(i, j) * 0.3;
        const scar = Math.abs(vn(f.armS * 0.03, phi * 0.45, f.arm, 72) - 0.5) < 0.012 && under < 0.4;
        if (f.armR === 1) col = CO_PALE[Math.max(2, Math.min(4, tn + 1))];
        else if (f.armR === 2) col = CO_MAW[Math.max(0, Math.min(2, tn - 1))];
        else if (scar) col = CO_ARMMID[Math.min(4, Math.max(2, tn + 1))];
        else col = (under > 0.78 ? CO_PALE : under > 0.5 ? CO_ARMMID : CO_ARMBACK)[tn];
        gloss = 1.1;
      } else if (mat === M_LID) {
        // his lids: his hide, their rims raw and wet
        const E = COLOSSUS.eye;
        const de = Math.hypot(fx, fy - E.y, fz - E.z);
        col = de < COLOSSUS.eyeR + 7 ? CO_RAW[Math.min(4, tn)] : CO_FLESH[tn];
        gloss = 0.9;
      } else if (mat === M_LIP) {
        // his lips: rotten, swollen, wet and dark
        col = CO_LIP[Math.max(0, Math.min(4, tn))];
        gloss = 1.4;
      } else if (mat === M_GUM) {
        col = CO_RAW[Math.max(0, Math.min(3, tn))];
        gloss = 1.4;
      } else if (mat === M_TOOTH) {
        // yellowed, brown toward the root; a broken one's end dark and chipped
        const t2 = f.toothT;
        const step = t2 < 0.22 ? -2 : t2 < 0.45 ? -1 : 0;
        col = f.broken && t2 > 0.85 ? CO_TOOTH[Math.max(0, tn - 2)] : CO_TOOTH[Math.max(0, Math.min(4, tn + 1 + step))];
        gloss = 0.7;
      } else if (mat === M_TONGUE) {
        col = tn >= 3 ? CO_RAW[2] : CO_MAW[Math.max(0, Math.min(3, tn))];
        gloss = 1.4;
      } else if (mat === M_THROAT || mat === M_MAW) {
        // his throat: dark and wet, lit faintly from within by his eye's pink-gold, the deeper the more
        const deep = sm01(frontAt(fx) - 40, frontAt(fx) - 120, fy) * sm01(70, 10, Math.abs(fx)) + bayer(i, j) * 0.2;
        const base = CO_MAW[Math.max(0, Math.min(2, tn - 1))];
        col = deep > 0.92 ? mixRGB(CO_MAW[1], CO_IRIS[3], 0.32) : deep > 0.68 ? mixRGB(CO_MAW[1], CO_IRIS[1], 0.26) : base;
        gloss = 1.2;
      } else if (mat === M_BONE) {
        col = CO_BONE[tn];
        gloss = 0.2;
      } else if (mat === M_STONE) {
        col = (mossAt(fx, fy, fz + 6) > 0.2 && upN > 0.3 ? CO_MOSS : CO_STONE)[tn];
        gloss = 0.1;
      } else if (mat === M_LEECH) {
        col = CO_LEECH[tn];
        gloss = 1.3;
      } else if (mat === M_BOIL) {
        col = (tn >= 2 ? CO_PALE : CO_BRUISE)[Math.min(3, tn)];
        gloss = 1.6;
      } else if (mat === M_SORE) {
        col = CO_RAW[Math.max(0, Math.min(2, tn - 1))];
        gloss = 1.6;
      } else if (mat === M_WOOD) {
        col = CO_WOOD[tn];
        gloss = 0.1;
      } else if (mat === M_BARN) {
        col = CO_BARNACLE[Math.min(4, tn + (hp(i, j, 83) < 0.3 ? 1 : 0))];
        gloss = 0.1;
      } else {
        // HIS HIDE: rotting, wet, sagging; deep dark creases going to bruise; bruising in soft gradients, never patches; slime
        // running down him; pale, drowned flesh toward the water; moss only in clumps on his crown and over his brow
        const moss = mossAt(fx, fy, fz);
        const slime = vn(fx * 0.13, fy * 0.04, fz * 0.012, 93) > 0.72 && upN < 0.45;
        const bruise = vn(fx * 0.007, fy * 0.007, fz * 0.007, 94) + bayer(i, j) * 0.22;
        const drowned = sm01(36, 0, fz) + bayer(i, j) * 0.3;
        if (moss > 0.12 && upN > 0.05) {
          // (clumps: dark beneath, their lit tips catching the light)
          const tip = vn(fx * 0.3, fy * 0.3, fz * 0.3, 96);
          col = CO_MOSS[Math.max(0, Math.min(4, tn + (tip > 0.66 && tn >= 2 ? 1 : tip < 0.3 ? -1 : 0)))];
          gloss = 0.05;
        } else if (occ > 0.34) {
          col = CO_BRUISE[Math.max(0, tn - 1)];
          gloss = 0.6;
        } else if (slime) {
          col = CO_SLIME[tn];
          gloss = 1.6;
        } else if (drowned > 0.75) {
          col = CO_PALE[Math.max(0, tn - 1)];
          gloss = 0.9;
        } else if (bruise > 0.66) {
          col = CO_BRUISE[tn];
          gloss = 0.9;
        } else {
          col = CO_FLESH[tn];
          gloss = 0.75;
        }
      }
      // (wet: where the light is thrown straight back, a glint)
      if (gloss > 0.4 && Math.pow(spec, 26) * gloss * (0.75 + bayer(i, j)) > 0.5 && lit > 0.2 && mat !== M_EYE && f.armR === 0) col = CO_SHEEN;
      // HIS EYE'S GLOW on the folds round it: pink, and gold nearest
      if (S.body && pose.view === 'front' && mat !== M_EYE) {
        const E = COLOSSUS.eye;
        const ex = 0 - fx;
        const ey = E.y - fy;
        const ez = E.z - fz;
        const el = Math.hypot(ex, ey, ez) || 1;
        const facing = (Nx * S.flip * ex + Ny * S.flip * ey + Nz * ez) / el;
        const g = facing * Math.max(0, 1 - el / 200) + bayer(i, j) * 0.12;
        if (g > 0.42) col = mixRGB(col, CO_IRIS[3], 0.32);
        else if (g > 0.2) col = mixRGB(col, CO_IRIS[1], 0.24);
      }
      let r0 = col[0];
      let g0 = col[1];
      let b0 = col[2];
      let a = 255;
      let kd = 1;
      if (z < -0.5) {
        // UNDER THE WATER: seen through it, darker and greener the deeper; only his eye's fire is seen deep down
        const deep = -z;
        const sunk = S.drop > 60;
        const keep = glow ? Math.exp(-deep / 220) : Math.exp(-deep / (sunk ? 40 : 15));
        const m = Math.max(0, Math.min(1, keep));
        r0 = WATER[0] + (r0 - WATER[0]) * m;
        g0 = WATER[1] + (g0 - WATER[1]) * m;
        b0 = WATER[2] + (b0 - WATER[2]) * m;
        const vis = glow ? Math.min(1, Math.exp(-deep / 280) * 1.5) : Math.max(0, 1 - deep / (sunk ? COLOSSUS.seenDeepSunk : COLOSSUS.seenDeep));
        // (four steps of seeing through, dithered: every pixel crisp)
        const q = Math.max(0, Math.min(4, Math.floor(vis * 4 + bayer(i, j) + 0.5)));
        if (q === 0) continue;
        a = [0, 80, 140, 200, 240][q];
        kd = 2;
      }
      D[k * 4] = r0;
      D[k * 4 + 1] = g0;
      D[k * 4 + 2] = b0;
      D[k * 4 + 3] = a;
      near[k] = y * EYE_V[1] + z * EYE_V[2];
      kind[k] = kd;
      zh[k] = z;
      mt[k] = mat;
    }
  }
  // THE SEAM where one part of him ends in front of another, and round him; THE PINK EDGE outside it (over the water only)
  const seam = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (kind[k] !== 1) continue;
      const n0 = near[k];
      let s = false;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const ii = i + di;
        const jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= w || jj >= h) {
          s = true;
          continue;
        }
        const kk = jj * w + ii;
        if (kind[kk] === 0 || kind[kk] === 3) s = true;
        else if (kind[kk] === 1 && near[kk] - n0 > 9) s = true;
      }
      if (s) seam[k] = 1;
    }
  }
  for (let k = 0; k < w * h; k++) {
    if (!seam[k]) continue;
    D[k * 4] = INK_RGB[0];
    D[k * 4 + 1] = INK_RGB[1];
    D[k * 4 + 2] = INK_RGB[2];
  }
  // (weed and slime hanging off his overhangs, before the edge)
  hangings(px, near, kind, zh, mt, w, h, zoom);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (kind[k] !== 0 && kind[k] !== 3) continue;
      let by = false;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const ii = i + di;
        const jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue;
        if (kind[jj * w + ii] === 1 && seam[jj * w + ii]) by = true;
      }
      if (by) {
        D[k * 4] = RIM_RGB[0];
        D[k * 4 + 1] = RIM_RGB[1];
        D[k * 4 + 2] = RIM_RGB[2];
        D[k * 4 + 3] = RIM_ALPHA;
      }
    }
  }
  // HIS LIGHT: his eye's fire (the game draws it over the dark)
  const lights: Light[] = [];
  if (pose.body && pose.view === 'front') {
    const E = COLOSSUS.eye;
    const zz = E.z - pose.drop;
    const yy = E.y - (pose.back ?? 0);
    lights.push({ x: ax + 0, y: ay + zoom * (yy * SIN30 * SEEN - zz), r: 120 * zoom, color: FLAME[2], a: zz < 0 ? 0.35 : 0.22 });
  }
  return { px, ax, ay, lights, near, kind };
}

/**
 * WEED AND SLIME HANGING OFF HIM: from the lower edge of every overhang of him (his brow, his jowls, his shoulders' folds, the bones),
 * curtains of the fen's weed hang straight down into the water, thickest in clumps; strings of slime with beads on them; and from
 * his maw, drool in strings off his lips and teeth. Each hangs as far as the water under where it hangs from.
 */
function hangings(px: Px, near: Float32Array, kind: Uint8Array, zh: Float32Array, mt: Uint8Array, w: number, h: number, zoom: number): void {
  const D = px.d;
  /** A pixel of something hanging, as near as what it hangs from; false where it stops (his eye, or the edge of the picture). */
  const put = (i: number, j: number, c: RGB, n: number): boolean => {
    if (i < 0 || j < 0 || i >= w || j >= h) return false;
    const k = j * w + i;
    if (kind[k] === 1 && mt[k] === M_EYE) return false;
    if (kind[k] === 1 && near[k] > n + 1) return true;
    if (kind[k] === 2) return false;
    D[k * 4] = c[0];
    D[k * 4 + 1] = c[1];
    D[k * 4 + 2] = c[2];
    D[k * 4 + 3] = 255;
    kind[k] = 4;
    return true;
  };
  const weed = (i: number, j: number, len: number, n: number, seed: number): void => {
    // (a clump: two or three strands together, the left one lit, ragged where each ends)
    const thick = len * (0.45 + 0.4 * h3(i, j, 2, seed));
    const third = len * (0.2 + 0.3 * h3(i, j, 4, seed));
    for (let s = 1; s <= len; s++) {
      const x = Math.round(i + Math.sin((s + i * 3) * 0.09) * 1.8 * (s / Math.max(8, len)));
      const c = WEED[s < len * 0.2 ? 4 : s < len * 0.6 ? 3 : 2];
      if (!put(x, j + s, c, n)) return;
      if (s < thick) put(x + 1, j + s, WEED[s < len * 0.4 ? 2 : 1], n);
      if (s < third) put(x + 2, j + s, WEED[1], n);
    }
    put(i - 1, j + len + 1, FOAM[2], n);
    put(i + 1, j + len + 1, FOAM[2], n);
  };
  const string = (i: number, j: number, len: number, n: number, seed: number, jaw = false): void => {
    for (let s = 1; s <= len; s++) {
      const bead = h3(i, s, 3, seed) < 0.06;
      // (between his jaws: a string stops where it meets the jaw below)
      if (jaw && j + s < h && kind[(j + s) * w + i] === 1 && near[(j + s) * w + i] > n - 25) return;
      if (!put(i, j + s, s % 9 === 2 ? CO_SHEEN : CO_SLIME[bead ? 3 : 2], n)) return;
      if (bead) put(i + 1, j + s, CO_SLIME[1], n);
    }
    put(i, j + len + 1, CO_SLIME[3], n);
    put(i + 1, j + len + 1, CO_SLIME[1], n);
    put(i, j + len + 2, CO_SHEEN, n);
  };
  for (let i = 1; i < w - 1; i++) {
    for (let j = 2; j < h - 2; j++) {
      const k = j * w + i;
      if (kind[k] !== 1) continue;
      const below = (j + 1) * w + i;
      const under = kind[below] === 0 || kind[below] === 3 || (kind[below] === 1 && near[k] - near[below] > 18);
      if (!under) continue;
      const m = mt[k];
      if (m === M_EYE) continue;
      const toWater = Math.max(0, zh[k]) * zoom;
      const roll = h3(i, j, 0, 101);
      if (m === M_TOOTH || m === M_LIP || m === M_MAW || m === M_GUM || m === M_TONGUE || m === M_THROAT) {
        // drool, and slime strung between his jaws
        if (roll < (m === M_LIP || m === M_TOOTH ? 0.16 : 0.03)) string(i, j, Math.round(toWater * (0.35 + 0.65 * h3(i, j, 1, 102))), near[k], 103, true);
      } else if (m === M_ARM) {
        if (roll < 0.05) string(i, j, Math.round(Math.min(toWater, (8 + 26 * h3(i, j, 1, 104)) * zoom)), near[k], 105);
      } else {
        const clump = vn(i * 0.07 / zoom, j * 0.05 / zoom, 0, 107);
        const p = clump > 0.58 ? 0.2 : 0.025;
        if (roll < p) weed(i, j, Math.round(toWater * (0.3 + 0.7 * h3(i, j, 1, 106))), near[k], 108);
        else if (roll < p + 0.02) string(i, j, Math.round(toWater * (0.2 + 0.6 * h3(i, j, 1, 109))), near[k], 110);
      }
    }
  }
}

// =============================================================================================
// HIS POSES FOR THE PICTURES (stage 1: stills)

/** Looking at you (toward the camera, a little down at the hero). */
export const GAZE_AT_YOU: readonly [number, number, number] = [0, 0.95, 0.22];

/**
 * THE ARENA HE LIES BEFORE (the main chat's, 7 Nov: the stone 17 tiles across the screen by 11 deep, its far long edge open on the
 * water): how far toward the camera from his middle at the water the stone's edge is, in his lengths. His word, 7 Nov, “he needs to
 * slide back a little so the tentacles don’t clip through him or the stage”: 310, 7.9 tiles (it was 233, 5.9: he slid back 2 tiles),
 * so that each arm rises in open water between him and the stone, its root clear of both.
 */
export const STONE = { across: 17, deep: 11, edge: 310 } as const;
/** Where his arms rise (his lengths across, and toward the camera from his middle): just off the stone's edge, in the water. Phase 1 at a third and two thirds along it; phases 2 and 3 left, middle and right. */
export const ARM_ROOTS = {
  under: [-111, 111] as const,
  risen: [-222, 0, 222] as const,
  y: 256,
} as const;

/** HIS THREE ARMS RISEN (phases 2 and 3): out of the water just off the stone, left, middle and right; the outer two reared up in an S, their tips curling; the middle one lower, coiled aside off his maw. */
export const ARMS_RISEN: ReadonlyArray<ArmPose> = [
  { path: [[-222, 256, -30], [-252, 262, 50], [-250, 272, 130], [-212, 282, 188], [-200, 292, 246], [-230, 300, 288], [-272, 304, 298], [-298, 304, 280], [-296, 304, 262], [-282, 304, 260], [-278, 304, 268]], r: 42, belly: [0.6, 0.5, -0.4], seed: 1 },
  { path: [[0, 256, -30], [22, 264, 28], [84, 274, 62], [126, 286, 98], [120, 298, 130], [88, 304, 126], [80, 306, 108], [90, 306, 98], [98, 306, 104]], r: 36, belly: [-0.2, 0.4, -0.9], seed: 3 },
  { path: [[222, 256, -30], [258, 262, 46], [264, 272, 118], [232, 284, 172], [204, 294, 222], [214, 302, 266], [252, 306, 280], [278, 308, 262], [274, 308, 244], [260, 308, 244], [258, 308, 252]], r: 42, belly: [-0.6, 0.5, -0.3], seed: 2 },
];
/** HIS TWO ARMS BURST UP (phase 1): out of the water just off the stone, at a third and two thirds along it, while he lies under it. */
export const ARMS_UNDER: ReadonlyArray<ArmPose> = [
  { path: [[-111, 256, -30], [-141, 262, 50], [-139, 272, 130], [-101, 282, 188], [-89, 292, 246], [-119, 300, 288], [-161, 304, 298], [-187, 304, 280], [-185, 304, 262], [-171, 304, 260], [-167, 304, 268]], r: 42, belly: [0.6, 0.5, -0.4], seed: 4 },
  { path: [[111, 256, -30], [147, 262, 46], [153, 272, 118], [121, 284, 172], [93, 294, 222], [103, 302, 266], [141, 306, 280], [167, 308, 262], [163, 308, 244], [149, 308, 244], [147, 308, 252]], r: 42, belly: [-0.6, 0.5, -0.3], seed: 5 },
];
/** ONE ARM ALONE (its close-up): risen out of the water and curled over. */
export const ARM_ALONE: ReadonlyArray<ArmPose> = [
  { path: [[0, 0, -30], [-34, 8, 50], [-28, 18, 130], [16, 28, 186], [30, 38, 246], [0, 46, 290], [-44, 50, 300], [-70, 50, 282], [-68, 50, 264], [-54, 50, 262], [-50, 50, 270]], r: 44, belly: [0.6, 0.5, -0.4], seed: 6 },
];

export function poseRisen(maw = 0.2, view: 'front' | 'back' = 'front'): ColossusPose {
  return { view, drop: 0, body: true, maw, lid: 1, gaze: GAZE_AT_YOU, arms: ARMS_RISEN };
}
export function poseUnder(): ColossusPose {
  return { view: 'front', drop: COLOSSUS.sunk, back: COLOSSUS.sunkBack, body: true, maw: 0, lid: 1, gaze: [0, 0.87, 0.5], arms: ARMS_UNDER };
}
export function poseArm(): ColossusPose {
  return { view: 'front', drop: 0, body: false, maw: 0, lid: 1, gaze: GAZE_AT_YOU, arms: ARM_ALONE };
}

// =============================================================================================
// HIS ARMS CLEAR OF HIM AND OF THE STONE

/**
 * How clear his arms are, along every one of them (his lengths): of his body (the least gap between an arm's skin and his, where
 * they are nearest), and of the stone (the least gap, toward the camera, between any part of an arm low enough to meet the stone and
 * the stone's edge; parts higher than the stone are over it, in the air); and whether every root is under the water before the stone.
 */
export function armClearances(pose: ColossusPose): { body: number; stone: number; rootsInWater: boolean } {
  const S = new Scene(pose);
  let body = Infinity;
  let stone = Infinity;
  let rootsInWater = true;
  for (const A of S.arms) {
    const P = A.p;
    for (let k = 0; k < A.n; k++) {
      const x = P[k * 4];
      const y = P[k * 4 + 1];
      const z = P[k * 4 + 2];
      const r = P[k * 4 + 3];
      if (S.body) body = Math.min(body, S.bodyAt(x, y + S.back, z + S.drop, null) - r);
      // (low enough to meet the stone: its underside below the stone's top, at the water's height, or within a few lengths of it)
      if (z - r < 4) stone = Math.min(stone, STONE.edge - (y + r));
    }
    if (!(P[2] < 0 && P[1] + P[3] < STONE.edge)) rootsInWater = false;
  }
  return { body, stone, rootsInWater };
}

// =============================================================================================
// WHAT HE COSTS

/** A frame of him risen at the game's size (picture pixels, two to a game pixel: what he spans, his arms, horns and hanging weed with him, 882 by 595, and a little room), and what it holds at 4 bytes a pixel. */
export const COLOSSUS_FRAME = { w: 900, h: 610 } as const;
export function costOf(fps: number, seconds: number, frame: { w: number; h: number } = COLOSSUS_FRAME): { frameMB: number; perSecondMB: number; totalMB: number } {
  const frameMB = (frame.w * frame.h * 4) / (1024 * 1024);
  return { frameMB, perSecondMB: frameMB * fps, totalMB: frameMB * fps * seconds };
}
