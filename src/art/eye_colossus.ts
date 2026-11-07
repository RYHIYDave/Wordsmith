// FLOOR 10'S BOSS, REDONE FROM NOTHING: THE SWAMP COLOSSUS (the art chat, 7 Nov 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game imports this file; `EYE2` is off. Nothing of the old Drowned Eye (art/drowned_eye.ts) is in it: not his solids, not his
// pictures, not his code. Stage 1: his look, still, for pictures; nothing moves yet.
//
// HIS WORDS, 7 Nov 2026, 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or
// intimidating.  the arena doesnt really work, and his entrance is not epic.”; 00:13: “just scrap his look and start fresh.  big
// ancient gross eldritch horror swamp monster with tentacles and a big eye.” His pick of the takes offered: “Swamp colossus
// (Recommended)”. Then, shown 3e7b6844: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still split up into sections.
// But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the center for the maw.
// Spittle and goo all over the place.  And have him like constantly melting and dripping”; and, 11:17: “And the eye waves around
// like its own tentacle”.
//
// WHAT HE IS, AS PAINTED: no body any more: A HUGE HEAD risen out of the black water across the top of the screen, ancient and
// gross, the head itself the creature, no face. Two great lobes of rotting grey-green flesh either side of A SEAM down his middle
// from crown to chin, wet and leaking drool, hooked fangs locked across it. THE WHOLE HEAD SPLITS OPEN down that seam: its two
// halves swing apart sideways like great jaws hinged at the back of his skull, rows of hooked teeth along both inner edges from top
// to bottom, between them his wet ribbed throat glowing faintly pink-gold deep inside, strings of spittle stretched across the gap.
// HIS EYE IS ON THE END OF HIS TONGUE: a long, thick, slimy tongue, as supple as a tentacle, its tip swollen into the huge bloodshot
// eye (the iris the enemy's pink burning to gold round a black slit); shut, it snakes out through the seam low on his head and rears
// in an S, the eye at its tip watching you; open, it rises out of his throat and waves above the split. SPITTLE AND GOO EVERYWHERE:
// drool in strings and ropes, goo sheeting down him, bubbles, slime webbed across every gap, foam where it hits the water. HE IS
// MELTING: his flesh sags and runs like wax, in runs down him that end in fat drips, gobs hanging off his overhangs and falling into
// the water, the outline of him always running down. His TENTACLES as they were, each now one continuous smooth taper from root to
// tip, no bands, no joints, no steps, the suckers in two rows along the underside all the way. An enemy: the pink edge round him,
// pink and gold his only glow; nothing cyan.
//
// HOW HE IS PAINTED: his own solids, smooth-joined, in his own space (across the screen X, toward the camera Y, up Z; his own
// lengths, as the game's figures', TILE3 to a tile), looked at as the game's camera looks (from above at 30 degrees: a length across
// the screen is SEEN pixels of the picture, an upright one is one pixel), ray by ray, two picture pixels to a game pixel. Lit from
// the upper left as everything is, in five tones a material, with the light's shadow and the dark of every fold; wet: a glint where
// the light catches the slime. What of him is under the water is seen through it, darker the deeper; only his eye's fire deep down.

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

export const COLOSSUS = {
  /** His head, shut: across at its widest (his cheeks), and over the water at his crown. */
  wide: 600,
  tall: 430,
  /** The eye on the end of his tongue: its radius. */
  eyeR: 50,
  /** The hinge his two halves swing on, at the back of his skull (toward the camera from his middle), and how far each swings, torn wide (radians). */
  hinge: -176,
  swing: 0.56,
  /** How deep he lies in phase 1, under the water (his crown a little below it). */
  sunk: 452,
  /** And how far back out in the water he lies then (so that what is seen of him is seen in the water, not under the stone). */
  sunkBack: 330,
  /** How deep under the water anything of him is still seen; his eye's fire, deeper. */
  seenDeep: 70,
  /** And while he lies under it (phase 1): his dark head seen faintly further down. */
  seenDeepSunk: 160,
} as const;

// =============================================================================================
// HIS COLOURS: the fen's dusk; rotten grey-green flesh, bruised; the enemy's pink burning to gold only in his eye and deep in his throat

type RGB = readonly [number, number, number];
type Ramp5 = readonly [RGB, RGB, RGB, RGB, RGB];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (...c: string[]): Ramp5 => c.map(hex) as unknown as Ramp5;

/** His hide: rotting grey-green flesh, dark in its folds. */
export const CO_FLESH = ramp('#0f110e', '#1d211a', '#30362a', '#47503a', '#646c4c');
/** Rot and bruise in it: a dull violet-brown. */
export const CO_BRUISE = ramp('#120c12', '#22171e', '#372630', '#4c3840', '#665050');
/** Bloated, drowned pale flesh (the undersides of his tentacles, his flesh at the water). */
export const CO_PALE = ramp('#1e1b18', '#37322a', '#56503e', '#7a7256', '#a09670');
/** Slime: dark, slick, catching the light. */
export const CO_SLIME = ramp('#0c120a', '#162214', '#24361c', '#3c5030', '#8a9a7a');
/** His melting flesh, running: paler and greasier than his hide, like old wax. */
export const CO_MELT = ramp('#18180f', '#2e2f1e', '#4b4d32', '#6f704c', '#9a986c');
/** The wet sheen on him: long pale highlights where the light runs along his slime. */
export const CO_SHEEN: RGB = hex('#aab29a');
/** A tentacle's back, dark; its flank. */
export const CO_ARMBACK = ramp('#0b0d0b', '#161a15', '#232a20', '#364030', '#4e5a42');
export const CO_ARMMID = ramp('#141412', '#262620', '#3c3c30', '#585644', '#7a7660');
/** His ripples: how far out each thin line is from where he breaks the water (his lengths), further apart further out. */
const RIPPLES = [7, 15, 26, 41, 60, 84];
/** Scum on the water where he breaks it. */
const SCUM: RGB = hex('#4a4a2a');
/** Barnacles crusting him at the water: ancient. */
export const CO_BARNACLE = ramp('#2a2a28', '#46443e', '#6a665c', '#8e897c', '#b2ac9c');
/** Raw flesh: his gums, the rim of flesh round his eye: wet, red, not glowing. */
export const CO_RAW = ramp('#200a0c', '#3e1216', '#5e1e20', '#7e302e', '#a04840');
/** The lips of his seam: rotten, swollen, wet, dark. */
export const CO_LIP = ramp('#0c070a', '#1c1016', '#2e1c22', '#46282e', '#62403e');
/** Inside him: a deep wet violet-red. */
export const CO_MAW = ramp('#0a050a', '#180a14', '#2a1020', '#40182c', '#5a2638');
/** His tongue: dark, slick, violet-red, paler along its underside. */
export const CO_TONGUE = ramp('#170e0f', '#2f1d1f', '#4a3031', '#6a4846', '#946c66');
/** Spittle: pale, grey-green, wet. */
export const CO_SPIT = ramp('#1c2019', '#2f362b', '#4b5546', '#6e7a66', '#a4ac96');
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
const INK_RGB = hex(INK);
const RIM_RGB = hex(ENEMY_RIM);

// materials
const M_FLESH = 1;
const M_EYE = 3;
const M_LID = 4;
const M_LIP = 5;
const M_TOOTH = 6;
const M_MAW = 7;
const M_ARM = 11;
const M_BARN = 12;
const M_BOIL = 13;
const M_SORE = 14;
const M_GUM = 16;
const M_TONGUE = 17;
const M_THROAT = 18;
const M_VEIN = 20;
const M_GOO = 22;
const M_BUBBLE = 23;
const M_STRAND = 24;
const M_GOB = 25;
/** What each pixel of him is made of, as `ColossusPicture.mat` says it (for the checks). */
export const MAT = { eye: M_EYE, lid: M_LID, lip: M_LIP, tooth: M_TOOTH, maw: M_MAW, arm: M_ARM, gum: M_GUM, tongue: M_TONGUE, throat: M_THROAT, goo: M_GOO, strand: M_STRAND, gob: M_GOB } as const;
const mixRGB = (a: RGB, b: RGB, k: number): RGB => [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k)];
const sm01 = (a: number, b: number, v: number): number => {
  const u = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

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
  /** Its spine, from where it leaves the water to its tip: points the curve passes through (and, for his tongue, its radius at each). */
  path: ReadonlyArray<readonly number[]>;
  /** Its thickness at its root (a tentacle: it tapers smoothly by its length to a whip of a tip). */
  r: number;
  /** A hint of the way its suckers face, where its tip does not curl enough to say. */
  belly: readonly [number, number, number];
  seed: number;
}
export interface ColossusPose {
  /** 'front', or 'back' (his back to the camera: the game's rulebook asks both). */
  view: 'front' | 'back';
  /** How far down he is: 0 risen, `COLOSSUS.sunk` under the water (phase 1); and how far back out in the water (sunk, further). Without his head at all: `body` false. */
  drop: number;
  back?: number;
  body: boolean;
  /** His head: 0 shut (the seam closed, his tongue snaking out of it), 1 split wide open (his tongue risen out of his throat). */
  maw: number;
  /** The way his eye looks (his own space). */
  gaze: readonly [number, number, number];
  arms: ReadonlyArray<ArmPose>;
  /** Under the water (phase 1), his tongue reared up the front of him, the eye on it between his two arms. */
  tongue?: 'under';
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
  /** What each pixel of him is made of (the materials above; 0 where he is not): for the checks. */
  mat: Uint8Array;
}

// =============================================================================================
// A TENTACLE (and his tongue): ONE SMOOTH TUBE, root to tip

interface Arm {
  /** Its spine sampled close: x, y, z, radius; the way its underside faces at each sample; how far along it each is; its suckers' count. */
  p: Float64Array;
  inner: Float64Array;
  s: Float64Array;
  sig: Float64Array;
  n: number;
  box: [number, number, number, number, number, number];
  seed: number;
  /** How far round it its box reaches (a bound outside it is this less a little). */
  margin: number;
  /** Runs of CH samples, each bounded (x, y, z, radius), so that a point far from a run skips it. */
  ch: Float64Array;
  suckers: boolean;
}
const CH = 8;

/** A Catmull-Rom curve through points (any number of numbers each), `n` samples. */
function catmull(pts: ReadonlyArray<readonly number[]>, n: number): number[][] {
  const out: number[][] = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const segs = pts.length - 1;
  const dim = pts[0].length;
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * segs;
    const k = Math.min(segs - 1, Math.floor(u));
    const t = u - k;
    const p0 = P[k];
    const p1 = P[k + 1];
    const p2 = P[k + 2];
    const p3 = P[k + 3];
    const q: number[] = [];
    for (let c = 0; c < dim; c++) {
      q.push(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t * t + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t * t * t));
    }
    out.push(q);
  }
  return out;
}

/**
 * A tube along a pose's spine: sampled close (no joints to see), its thickness ONE SMOOTH TAPER by its length (a tentacle: thick at
 * the water to a whip of a tip; his tongue: the radii its path gives, smoothly between them), and the way its underside faces carried
 * along it without a twist from the inside of its tip's curl (so its suckers run in two rows down one side of it, never jumping).
 */
export function armOf(a: ArmPose, N = 120, margin = 36, suckers = true): Arm {
  const withR = a.path[0].length > 3;
  const pts = catmull(a.path, N);
  const p = new Float64Array(N * 4);
  const inner = new Float64Array(N * 3);
  const s = new Float64Array(N);
  const sig = new Float64Array(N);
  for (let i = 1; i < N; i++) s[i] = s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
  const S = s[N - 1] || 1;
  const box: [number, number, number, number, number, number] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < N; i++) {
    const t = s[i] / S;
    const r = withR ? pts[i][3] : a.r * Math.pow(1 - t, 1.2) + 1.4;
    const q = pts[i];
    p[i * 4] = q[0];
    p[i * 4 + 1] = q[1];
    p[i * 4 + 2] = q[2];
    p[i * 4 + 3] = r;
    box[0] = Math.min(box[0], q[0] - r - margin);
    box[1] = Math.min(box[1], q[1] - r - margin);
    box[2] = Math.min(box[2], q[2] - r - margin);
    box[3] = Math.max(box[3], q[0] + r + margin);
    box[4] = Math.max(box[4], q[1] + r + margin);
    box[5] = Math.max(box[5], q[2] + r + margin);
    if (i > 0) sig[i] = sig[i - 1] + (s[i] - s[i - 1]) / (Math.max(1.6, r * 0.19) * 3.4);
  }
  // (its way along at each sample)
  const T = new Float64Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a0 = Math.max(0, i - 1);
    const a1 = Math.min(N - 1, i + 1);
    const tx = p[a1 * 4] - p[a0 * 4];
    const ty = p[a1 * 4 + 1] - p[a0 * 4 + 1];
    const tz = p[a1 * 4 + 2] - p[a0 * 4 + 2];
    const tl = Math.hypot(tx, ty, tz) || 1;
    T[i * 3] = tx / tl;
    T[i * 3 + 1] = ty / tl;
    T[i * 3 + 2] = tz / tl;
  }
  // (its underside at the tip's curl: the inside of the curl, turned a little toward the camera so that its suckers show)
  const iT = Math.max(1, Math.min(N - 2, N - 1 - Math.round(N * 0.12)));
  let kx = p[(iT + 1) * 4] + p[(iT - 1) * 4] - 2 * p[iT * 4];
  let ky = p[(iT + 1) * 4 + 1] + p[(iT - 1) * 4 + 1] - 2 * p[iT * 4 + 1];
  let kz = p[(iT + 1) * 4 + 2] + p[(iT - 1) * 4 + 2] - 2 * p[iT * 4 + 2];
  const kl = Math.hypot(kx, ky, kz);
  if (kl < 1e-3) {
    kx = a.belly[0];
    ky = a.belly[1];
    kz = a.belly[2];
  } else {
    kx /= kl;
    ky /= kl;
    kz /= kl;
  }
  let bx = kx * 0.9;
  let by = ky * 0.9 + 0.2;
  let bz = kz * 0.9;
  const bd = bx * T[iT * 3] + by * T[iT * 3 + 1] + bz * T[iT * 3 + 2];
  bx -= bd * T[iT * 3];
  by -= bd * T[iT * 3 + 1];
  bz -= bd * T[iT * 3 + 2];
  const bl = Math.hypot(bx, by, bz) || 1;
  inner[iT * 3] = bx / bl;
  inner[iT * 3 + 1] = by / bl;
  inner[iT * 3 + 2] = bz / bl;
  // (carried along it without a twist, both ways from there: the double reflection)
  const carry = (from: number, to: number): void => {
    const v1x = p[to * 4] - p[from * 4];
    const v1y = p[to * 4 + 1] - p[from * 4 + 1];
    const v1z = p[to * 4 + 2] - p[from * 4 + 2];
    const c1 = v1x * v1x + v1y * v1y + v1z * v1z || 1e-9;
    const r0x = inner[from * 3];
    const r0y = inner[from * 3 + 1];
    const r0z = inner[from * 3 + 2];
    const k1 = (2 / c1) * (v1x * r0x + v1y * r0y + v1z * r0z);
    const rLx = r0x - k1 * v1x;
    const rLy = r0y - k1 * v1y;
    const rLz = r0z - k1 * v1z;
    const k2 = (2 / c1) * (v1x * T[from * 3] + v1y * T[from * 3 + 1] + v1z * T[from * 3 + 2]);
    const tLx = T[from * 3] - k2 * v1x;
    const tLy = T[from * 3 + 1] - k2 * v1y;
    const tLz = T[from * 3 + 2] - k2 * v1z;
    const v2x = T[to * 3] - tLx;
    const v2y = T[to * 3 + 1] - tLy;
    const v2z = T[to * 3 + 2] - tLz;
    const c2 = v2x * v2x + v2y * v2y + v2z * v2z;
    let ox = rLx;
    let oy = rLy;
    let oz = rLz;
    if (c2 > 1e-12) {
      const k3 = (2 / c2) * (v2x * rLx + v2y * rLy + v2z * rLz);
      ox -= k3 * v2x;
      oy -= k3 * v2y;
      oz -= k3 * v2z;
    }
    const ol = Math.hypot(ox, oy, oz) || 1;
    inner[to * 3] = ox / ol;
    inner[to * 3 + 1] = oy / ol;
    inner[to * 3 + 2] = oz / ol;
  };
  for (let i = iT; i > 0; i--) carry(i, i - 1);
  for (let i = iT; i < N - 1; i++) carry(i, i + 1);
  // (and turned smoothly round it, the most at its root, none at its tip, so that low down its suckers face aside, not at the camera)
  if (suckers) {
    const b0 = [inner[0], inner[1], inner[2]];
    const n0 = [T[1] * b0[2] - T[2] * b0[1], T[2] * b0[0] - T[0] * b0[2], T[0] * b0[1] - T[1] * b0[0]];
    const R = Math.hypot(b0[1], n0[1]);
    let a0 = 0;
    if (R > 0.2) {
      const ph = Math.atan2(n0[1], b0[1]);
      const c = Math.acos(Math.min(1, 0.2 / R));
      const wrap = (v: number): number => Math.atan2(Math.sin(v), Math.cos(v));
      const a1 = wrap(ph + c);
      const a2 = wrap(ph - c);
      a0 = Math.abs(a1) < Math.abs(a2) ? a1 : a2;
    }
    for (let i = 0; i < N; i++) {
      const al = a0 * (1 - s[i] / S);
      const bx0 = inner[i * 3];
      const by0 = inner[i * 3 + 1];
      const bz0 = inner[i * 3 + 2];
      const tx = T[i * 3];
      const ty = T[i * 3 + 1];
      const tz = T[i * 3 + 2];
      const nx = ty * bz0 - tz * by0;
      const ny = tz * bx0 - tx * bz0;
      const nz = tx * by0 - ty * bx0;
      inner[i * 3] = Math.cos(al) * bx0 + Math.sin(al) * nx;
      inner[i * 3 + 1] = Math.cos(al) * by0 + Math.sin(al) * ny;
      inner[i * 3 + 2] = Math.cos(al) * bz0 + Math.sin(al) * nz;
    }
  }
  // (its runs, each bounded)
  const nch = Math.ceil((N - 1) / CH);
  const ch = new Float64Array(nch * 4);
  for (let c = 0; c < nch; c++) {
    const k0 = c * CH;
    const k1 = Math.min(N - 1, k0 + CH);
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let k = k0; k <= k1; k++) {
      cx += p[k * 4];
      cy += p[k * 4 + 1];
      cz += p[k * 4 + 2];
    }
    const m = k1 - k0 + 1;
    cx /= m;
    cy /= m;
    cz /= m;
    let rad = 0;
    for (let k = k0; k <= k1; k++) rad = Math.max(rad, Math.hypot(p[k * 4] - cx, p[k * 4 + 1] - cy, p[k * 4 + 2] - cz) + p[k * 4 + 3]);
    ch[c * 4] = cx;
    ch[c * 4 + 1] = cy;
    ch[c * 4 + 2] = cz;
    ch[c * 4 + 3] = rad;
  }
  return { p, inner, s, sig, n: N, box, seed: a.seed, margin, ch, suckers };
}

/** What a distance found (the solid nearest, and on a tube where along it and round it). */
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
  /** Deep in his throat: how much of its glow (0 to 1). */
  glowK: number;
  /** Where on his head, in the head's own (shut) space, so that what grows on a half moves with it. */
  lx: number;
  ly: number;
  lz: number;
}

/** A tooth: its root, a bend and its tip (x, y, z, radius at each), whether it is broken, and a box round it. */
interface Tooth {
  p: number[];
  broken: boolean;
  box: [number, number, number, number, number, number];
}
function toothOf(root: number[], dir: number[], len: number, r: number, bend: number[], broken: boolean): Tooth {
  const L = broken ? len * 0.45 : len;
  const mid = [root[0] + dir[0] * L * 0.55 + bend[0] * L * 0.12, root[1] + dir[1] * L * 0.55 + bend[1] * L * 0.12, root[2] + dir[2] * L * 0.55 + bend[2] * L * 0.12];
  const tip = [root[0] + dir[0] * L + bend[0] * L * 0.5, root[1] + dir[1] * L + bend[1] * L * 0.5, root[2] + dir[2] * L + bend[2] * L * 0.5];
  const rt = broken ? r * 0.62 : 0.5;
  const p = [root[0], root[1], root[2], r, mid[0], mid[1], mid[2], r * (broken ? 0.75 : 0.6), tip[0], tip[1], tip[2], rt];
  const box: [number, number, number, number, number, number] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let k = 0; k < 12; k += 4) {
    for (let c = 0; c < 3; c++) {
      box[c] = Math.min(box[c], p[k + c] - r - 1);
      box[c + 3] = Math.max(box[c + 3], p[k + c] + r + 1);
    }
  }
  return { p, broken, box };
}

/** A string of spittle or a rope of drool: points (x, y, z, radius) in his head's space, and a box round it. */
interface Strand {
  p: number[];
  box: [number, number, number, number, number, number];
}
function strandOf(pts: number[][]): Strand {
  const p: number[] = [];
  const box: [number, number, number, number, number, number] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const q of pts) {
    p.push(q[0], q[1], q[2], q[3]);
    for (let c = 0; c < 3; c++) {
      box[c] = Math.min(box[c], q[c] - q[3] - 2);
      box[c + 3] = Math.max(box[c + 3], q[c] + q[3] + 2);
    }
  }
  return { p, box };
}
/** A string hung between two points, sagging `sag` at its middle, beads of spittle on it. */
function sagging(a: readonly number[], b: readonly number[], sag: number, r: number, seed: number, n = 12): number[][] {
  const out: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const dip = 4 * t * (1 - t) * sag;
    // (thinner at its middle, where it is stretched; a bead here and there)
    const bead = h3(i, seed, 1, 170) < 0.14 && i > 0 && i < n ? 1.9 : 1;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - dip, r * (1 - 0.35 * 4 * t * (1 - t)) * bead]);
  }
  return out;
}

// =============================================================================================
// HIS HEAD (his own space, shut: across X, toward the camera Y, up Z, from the water under his middle)

/** The crack of his seam, shut (half its width). */
const CRACK = 0.8;
/** Where his tongue snakes out through his seam, shut: the slit's middle (up from the water), its half height and half width. */
const SLIT = { z: 60, h: 40, w: 25 } as const;
/** His seam wanders a little as it runs down him: how far across it is at a height. */
const seamX = (z: number): number => 5 * Math.sin(z * 0.019 + 0.6) + (vn(z * 0.025, 3, 1, 250) - 0.5) * 8;
/** The slit's half width at a height (0 outside it). */
const slitW = (z: number): number => {
  const q = 1 - ((z - SLIT.z) / SLIT.h) ** 2;
  return q > 0 ? SLIT.w * Math.pow(q, 0.6) : 0;
};

/** HIS SKULL, whole and shut, before what slides, runs and drips off him. */
function skull(x: number, y: number, z: number): number {
  // two great swollen lobes of his crown either side of the seam, overhanging what is below them; the left heaved higher, the right
  // slumped lower and further out
  let d = ell(x, y, z, -78, -44, 262, 150, 138, 150);
  d = smin(d, ell(x, y, z, 92, -34, 236, 156, 142, 140), 44);
  // the mass of his head beneath them, widest at his middle
  d = smin(d, ell(x, y, z, 0, -10, 160, 200, 158, 128), 48);
  // bulging forward low, toward his chin
  d = smin(d, ell(x, y, z, 0, 52, 84, 128, 108, 84), 40);
  // his jowls sagging, drooping down toward the water, the right the lower
  d = smin(d, ell(x, y, z, -170, 18, 96, 96, 108, 84), 34);
  d = smin(d, ell(x, y, z, 176, 8, 76, 100, 108, 76), 34);
  // his neck under it all, going down into the black water
  d = smin(d, ell(x, y, z, 0, -24, 16, 186, 156, 72), 42);
  // flesh run off him and slumped at the water in heaps
  d = smin(d, ell(x, y, z, -212, 4, 6, 74, 80, 36), 28);
  d = smin(d, ell(x, y, z, 226, -18, 0, 80, 90, 32), 28);
  d = smin(d, ell(x, y, z, -106, 92, 6, 62, 58, 26), 24);
  d = smin(d, ell(x, y, z, 118, 84, 2, 70, 60, 26), 24);
  // tumours swelling out of his crown
  d = smin(d, ell(x, y, z, -168, -56, 322, 46, 42, 38), 24);
  d = smin(d, ell(x, y, z, 64, -78, 338, 54, 50, 40), 24);
  d = smin(d, ell(x, y, z, 226, -36, 246, 46, 44, 42), 22);
  return d;
}

/** The hollow of his mouth inside him (each half's inner side), its wet ribs: less than 0 inside it. */
function cavity(x: number, y: number, z: number): number {
  const c = ell(x, y, z, 0, -14, 150, 136, 146, 134);
  if (c > 12) return c;
  // (ribbed across, like the roof of a mouth)
  return c + 2.4 * Math.sin(z * 0.16 + vn(x * 0.02, y * 0.02, z * 0.01, 171) * 3.0) * sm01(10, 30, z);
}

/**
 * HIS FLESH SLIDING OFF HIM LIKE MELTING WAX: two sheets of it slid down over him, the upper the thicker, each one's lower edge running
 * down in drips of every length, each drip a tongue of flesh necked where it leaves the sheet and swelling to a fat end; the height
 * of each sheet's edge (round him it wanders), how thick it lies on what is under it, how wide a drip may be, and how far one may run.
 */
const SHEETS: ReadonlyArray<{ z: number; t: number; W: number; L: number }> = [
  { z: 292, t: 18, W: 40, L: 190 },
  { z: 178, t: 11, W: 30, L: 120 },
];
/** A sheet's edge between its drips, at u round him. */
const hemOf = (k: number, u: number): number => SHEETS[k].z + (vn(u * 0.007 + k * 7.3, k * 3.1, 0.5, 230) - 0.5) * 56;
/** A sheet's drip in a cell round him: where (u), how wide at its top and at its fat end, how far down it has run (0 none). */
function sheetDrip(k: number, cell: number): [number, number, number, number] {
  const sh = SHEETS[k];
  if (h3(cell, k, 0, 240) < 0.18) return [0, 0, 0, 0];
  const wb = sh.W * (0.2 + 0.16 * h3(cell, k, 1, 241));
  const wt = wb * (0.6 + 0.25 * h3(cell, k, 2, 242));
  const uc = (cell + 0.5 + (h3(cell, k, 3, 243) - 0.5) * (1 - (2 * (wb + 2)) / sh.W)) * sh.W;
  const L = 14 + sh.L * h3(cell, k, 4, 244) ** 1.3;
  return [uc, wt, wb, L];
}
/** Where a sheet is, round him and up him (a flat map: u round, z up): less than 0 on it. Its edge, its drips, and how near a drip's fat end. */
function sheetMap(k: number, u: number, z: number, end: number[]): number {
  const sh = SHEETS[k];
  const hem = hemOf(k, u);
  let d = hem - z;
  const c0 = Math.floor(u / sh.W);
  end[0] = 0;
  for (let c = c0 - 1; c <= c0 + 1; c++) {
    const [uc, wt, wb, L] = sheetDrip(k, c);
    if (!L) continue;
    const top = hemOf(k, uc) + 4;
    const bot = top - L;
    // (a round cone in the map, from the edge down to its fat end)
    const t = Math.max(0, Math.min(1, (top - z) / L));
    const r = wt + (wb - wt) * t * t;
    const e = Math.hypot(u - uc, z - (top - L * t)) - r;
    const eb = Math.hypot(u - uc, (z - bot) * 0.85) - wb;
    const dd = Math.min(e, eb);
    d = smin(d, dd, 9);
    end[0] = Math.max(end[0], Math.max(0, 1 - Math.hypot(u - uc, z - bot) / (wb * 1.8)));
  }
  return d;
}
const END = [0];

/**
 * THIN RUNS OF GOO down him: here and there a strip of it standing out of him, from where it wells out to a fat bead where it has run
 * to. How far a run stands out at a point (his lengths), 0 off them. Round him by his azimuth (u, a length round him).
 */
/** Drool leaking out of his seam, running down beside it, over all of him: how far it stands out. */
function seamLeak(u: number, z: number): number {
  if (z < 6) return 0;
  {
    let v = 0;
    for (let i = 0; i < SEAM_LEAKS.length; i += 4) {
      const [uc, top, end, w] = [SEAM_LEAKS[i], SEAM_LEAKS[i + 1], SEAM_LEAKS[i + 2], SEAM_LEAKS[i + 3]];
      const du = (u - uc) / w;
      if (Math.abs(du) < 1.2 && z > end - w * 2 && z < top + 2) {
        const q = Math.max(0, 1 - du * du);
        let r = z > end ? q * q * sm01(top + 2, top - 10, z) : 0;
        const b = 1 - ((u - uc) / (w * 1.15)) ** 2 - ((z - end) / (w * 1.3)) ** 2;
        if (b > 0) r = Math.max(r, 1.4 * b * b);
        v = Math.max(v, r * w * 0.6);
      }
    }
    return v;
  }
}

function runAt(u: number, z: number): number {
  if (z < 6 || Math.abs(u) < 16) return 0;
  const W = 23;
  const cell = Math.floor(u / W);
  if (h3(cell, 9, 0, 164) > 0.5) return 0;
  const w = 3.5 + 3 * h3(cell, 9, 1, 165);
  const uc = (cell + 0.5 + (h3(cell, 9, 2, 166) - 0.5) * (1 - (2 * (w + 1)) / W)) * W;
  const top = 110 + 230 * h3(cell, 9, 3, 167);
  const end = Math.max(12, top - 50 - 200 * h3(cell, 9, 4, 168));
  const hgt = w * 0.6;
  const du = (u - uc) / w;
  let v = 0;
  if (z > end && z < top && Math.abs(du) < 1) {
    const q = 1 - du * du;
    v = q * q * sm01(top + 2, top - 18, z);
  }
  const bz = (z - end) / (w * 1.25);
  const bu = (u - uc) / (w * 1.12);
  const b = 1 - bu * bu - bz * bz;
  if (b > 0) v = Math.max(v, 1.4 * b * b);
  return v * hgt;
}

/** Drool leaking out of his seam: where round him (just beside it), from how high to how low, how wide. */
const SEAM_LEAKS = [-17, 330, 262, 4, 16, 300, 214, 3.5, -16, 240, 168, 4, 18, 196, 120, 3.5, -18, 150, 112, 3.2, 17, 352, 300, 3];

/** HIS FLESH: his skull with the sheets slid down it and the runs (no seam yet); `m[0]` says whether it is running goo there. */
function fleshAt(x: number, y: number, z: number, m: number[] | null): number {
  const base = skull(x, y, z);
  if (base > 50) return base - 30;
  const u = Math.atan2(x, y + 20) * 232;
  const run = runAt(u, z);
  let d = base - run;
  let melt = run > 1.5 ? 1 : 0;
  for (let k = 0; k < SHEETS.length; k++) {
    if (z < SHEETS[k].z - 40 - SHEETS[k].L - SHEETS[k].W) continue;
    const map = sheetMap(k, u, z, END);
    // (the sheet over him, its drips' fat ends standing out further)
    const sd = smax(base - SHEETS[k].t * (1 + 0.7 * END[0] * END[0]), map, 6);
    if (sd < d) melt = map > -8 || END[0] > 0.2 ? 1 : 0;
    d = Math.min(d, sd);
  }
  if (Math.abs(u) < 26) {
    const leak = seamLeak(u, z);
    if (leak > 0.6) melt = 1;
    d -= leak;
  }
  if (m) m[0] = melt;
  return d;
}
const MELT = [0];

/** What is placed on his head once (in the head's own space): drips off his overhangs, gobs falling off, his teeth, the front of his seam. */
interface Placed {
  /** Drips hanging off his overhangs: top x, y, z, how far down, its radius at the top and at its bulb. */
  drips: number[];
  /** Gobs fallen off him, in the air: x, y, z (their middle), radius, how long. */
  gobs: number[];
  /** Splashes where they hit the water: x, y, size. */
  splashes: number[];
  /** His teeth, along each half's inner edge: [left, right]. */
  teeth: [Tooth[], Tooth[]];
  /** The front of his head at the seam, by height (every 2 of his lengths, from 0): how far toward the camera. */
  front: Float64Array;
}
let PLACED: Placed | null = null;
/** How far toward the camera the front of his head is at the seam, at a height. */
const frontAt = (z: number): number => {
  const F = placed().front;
  const i = Math.max(0, Math.min(F.length - 2, Math.floor(z / 2)));
  const t = Math.max(0, Math.min(1, z / 2 - i));
  return F[i] + (F[i + 1] - F[i]) * t;
};
function placed(): Placed {
  if (PLACED) return PLACED;
  const body = (x: number, y: number, z: number): number => fleshAt(x, y, z, null);
  // THE FRONT OF HIS SEAM, by height
  const front = new Float64Array(200);
  for (let i = 0; i < 200; i++) {
    const z = i * 2;
    let y = 260;
    while (y > -260 && body(7, y, z) > 0) y -= 2;
    front[i] = y;
  }
  // DRIPS HANGING OFF HIS OVERHANGS: where, looking up from under him, he is over the air (not the water), a drip hangs down
  const drips: number[] = [];
  const gobs: number[] = [];
  const splashes: number[] = [];
  for (let gx = -40; gx <= 40; gx++) {
    for (let gy = -24; gy <= 24; gy++) {
      const x = gx * 8 + (h3(gx, gy, 0, 180) - 0.5) * 6;
      const y = gy * 9 + (h3(gx, gy, 1, 180) - 0.5) * 6;
      if (Math.abs(x) < 24) continue;
      if (h3(gx, gy, 2, 181) > 0.34) continue;
      let z = 4;
      while (z < 330 && body(x, y, z) > 0) z += 2;
      if (z >= 330 || z < 40) continue;
      // (only from what overhangs: open air for a good way under it)
      if (body(x, y, z - 14) < 6 || body(x, y, z - 30) < 10) continue;
      const big = h3(gx, gy, 9, 188) < 0.3;
      const len = big ? 40 + 80 * h3(gx, gy, 3, 182) : 12 + 40 * h3(gx, gy, 3, 182);
      const r0 = big ? 6 + 4 * h3(gx, gy, 4, 183) : 3.2 + 2.2 * h3(gx, gy, 4, 183);
      const rb = r0 * (1.4 + 0.5 * h3(gx, gy, 5, 184));
      drips.push(x, y, z + 3, Math.min(len, z - 12), r0, rb);
      // (some have let go: a gob falling below, and where it will hit the water, a splash)
      if (h3(gx, gy, 6, 185) < 0.55) {
        const gz = z - len - 16 - (z - len) * 0.6 * h3(gx, gy, 7, 186);
        if (gz > 14) gobs.push(x, y, gz, rb * 0.95, 1.6 + 0.6 * h3(gx, gy, 8, 187));
        splashes.push(x, y, 5 + rb);
      }
    }
  }
  // HIS TEETH: rows of hooked fangs along each half's inner edge, top to bottom, set into the raw ring of gum between his outside
  // and the hollow of his mouth; pointing across at the other half, each hooked back toward his throat; crooked, of every size
  const teeth: [Tooth[], Tooth[]] = [[], []];
  for (const side of [-1, 1]) {
    const list = teeth[side < 0 ? 0 : 1];
    for (const row of [0, 1]) {
      let phi = -1.28 + h3(row, side + 2, 0, 190) * 0.06;
      let i = 0;
      while (phi < 1.9) {
        const cy = Math.cos(phi);
        const cz = Math.sin(phi);
        // (along the ray from the hollow's middle in the plane of the seam: his outside, and the hollow's)
        let r = 60;
        while (r < 340 && body(side * 7, -14 + cy * r, 150 + cz * r) < 0) r += 2;
        const rOut = r;
        const seed = side * 1000 + row * 100 + i;
        const step = (row ? 0.075 : 0.1) * (0.8 + 0.4 * h3(seed, 0, 0, 191));
        phi += step;
        i++;
        const depth = row ? 30 : 13;
        const rr = rOut - depth;
        const ry = -14 + cy * rr;
        const rz = 150 + cz * rr;
        if (rz < 12 || cavity(0, ry, rz) < 4) continue;
        const long = row === 0 && h3(seed, 1, 0, 192) < 0.22;
        const broken = row === 0 && !long && h3(seed, 2, 0, 193) < 0.14;
        const len = row ? 12 + 12 * h3(seed, 3, 0, 194) : long ? 38 + 12 * h3(seed, 3, 0, 194) : 18 + 16 * h3(seed, 4, 0, 195);
        const rad = row ? 3.2 + 1.4 * h3(seed, 5, 0, 196) : long ? 6.4 : 4.4 + 2 * h3(seed, 6, 0, 197);
        // (across at the other half; a little toward his front and crooked; hooked back toward his throat, the hollow's middle)
        const tilt = (h3(seed, 7, 0, 198) - 0.5) * 0.5;
        const dir = [-side, 0.25 + tilt * 0.4, tilt];
        const dl = Math.hypot(dir[0], dir[1], dir[2]);
        const bend = [-side * 0.1, -cy * 0.9, -cz * 0.9];
        list.push(toothOf([side * (CRACK + 1) + seamX(rz), ry, rz], [dir[0] / dl, dir[1] / dl, dir[2] / dl], len, rad, bend, broken));
      }
    }
  }
  PLACED = { drips, gobs, splashes, teeth, front };
  return PLACED;
}

/** HIS TONGUE, as supple as a tentacle, the eye on its tip: shut, snaking out through his seam low on his head and reared in an S;
 *  open, risen out of his throat in an S, waving above the split. Its spine (x, y, z, radius); the eye's middle at its end. */
export const TONGUE_SHUT: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -84, 96, 24], [0, 60, 66, 23], [0, 150, 54, 21], [-12, 200, 42, 20], [-44, 214, 40, 19], [-78, 214, 66, 17],
  [-84, 212, 100, 15], [-60, 210, 126, 14], [-48, 210, 150, 13], [-66, 210, 174, 14], [-86, 210, 192, 18],
];
export const EYE_SHUT: readonly [number, number, number] = [-92, 210, 218];
export const TONGUE_OPEN: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -100, 118, 24], [0, -64, 148, 23], [-10, -6, 188, 21], [-32, 56, 228, 19], [-26, 108, 276, 17], [8, 138, 326, 15],
  [22, 154, 366, 14], [4, 164, 404, 13], [-18, 168, 428, 15], [-24, 172, 440, 18], [-24, 174, 446, 20],
];
export const EYE_OPEN: readonly [number, number, number] = [-24, 178, 462];
/** Under the water (phase 1): his tongue out of his seam and reared up the front of him in an S, the eye on it looking up at you
 *  between his two arms, all of it under the water. */
export const TONGUE_UNDER: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -84, 96, 24], [0, 60, 66, 23], [0, 150, 54, 21], [-12, 200, 52, 20], [-30, 226, 80, 19], [-24, 236, 120, 17],
  [8, 240, 160, 15], [22, 240, 200, 14], [6, 238, 236, 13], [-6, 236, 262, 15], [-4, 236, 276, 18],
];
export const EYE_UNDER: readonly [number, number, number] = [-2, 238, 296];

/** The way he looks at you (toward the camera, a little down at the hero). */
export const GAZE_AT_YOU: readonly [number, number, number] = [0.05, 0.95, 0.22];

class Scene {
  readonly arms: Arm[];
  /** His tongue (a tube, no suckers), and the eye on its tip. */
  readonly tongue: Arm | null;
  readonly eyeC: [number, number, number];
  readonly drop: number;
  readonly back: number;
  readonly body: boolean;
  /** How far he is split open (0 to 1), and each half's swing. */
  readonly open: number;
  readonly c: number;
  readonly s: number;
  readonly gaze: readonly [number, number, number];
  readonly flip: number;
  /** His eye's own across and up (its lids part round its gaze). */
  readonly eyeA: [number, number, number];
  readonly eyeV: [number, number, number];
  /** Spittle and drool, in his head's space. */
  readonly strands: Strand[] = [];
  /** Where what falls off him hits the water (x, y, size), in his head's space. */
  readonly splashes: number[] = [];
  constructor(pose: ColossusPose) {
    this.arms = pose.arms.map((a) => armOf(a));
    this.drop = pose.drop;
    this.back = pose.back ?? 0;
    this.body = pose.body;
    this.open = Math.max(0, Math.min(1, pose.maw));
    const th = this.open * COLOSSUS.swing;
    this.c = Math.cos(th);
    this.s = Math.sin(th);
    const g = pose.gaze;
    const gl = Math.hypot(g[0], g[1], g[2]) || 1;
    this.gaze = [g[0] / gl, g[1] / gl, g[2] / gl];
    this.flip = pose.view === 'back' ? -1 : 1;
    {
      const G = this.gaze;
      const al = Math.hypot(G[1], G[0]) || 1;
      const A: [number, number, number] = [G[1] / al, -G[0] / al, 0];
      let V: [number, number, number] = [A[1] * G[2] - A[2] * G[1], A[2] * G[0] - A[0] * G[2], A[0] * G[1] - A[1] * G[0]];
      if (V[2] < 0) V = [-V[0], -V[1], -V[2]];
      this.eyeA = A;
      this.eyeV = V;
    }
    // HIS TONGUE: between its shut and its open lie, as far as he is open
    const o = this.open;
    const lerp = (a: readonly number[], b: readonly number[]): number[] => a.map((v, i) => v + (b[i] - v) * o);
    const path = pose.tongue === 'under' ? TONGUE_UNDER : TONGUE_SHUT.map((q, i) => lerp(q, TONGUE_OPEN[i]));
    const e = pose.tongue === 'under' ? EYE_UNDER : lerp(EYE_SHUT, EYE_OPEN);
    this.eyeC = [e[0], e[1], e[2]];
    this.tongue = pose.body ? armOf({ path, r: 30, belly: [0, 0, -1], seed: 9 }, 120, 30, false) : null;
    if (!pose.body) return;
    const P = placed();
    // (a point on a half, from its own space into his)
    const world = (side: number, x: number, y: number, z: number, r: number): number[] => {
      const Y = y - COLOSSUS.hinge;
      return [x * this.c + side * Y * this.s, -side * x * this.s + Y * this.c + COLOSSUS.hinge, z, r];
    };
    if (o < 0.3) {
      // SHUT: slime webbed across his seam, every so often from crown to chin; drool hanging from the slit and his chin in ropes
      for (let z = 40, i = 0; z < 336; z += 30 + 30 * h3(i, 0, 0, 200), i++) {
        if (slitW(z) > 0 || slitW(z + 8) > 0 || slitW(z - 8) > 0) continue;
        const yf = frontAt(z) - 4 - 6 * h3(i, 1, 0, 201);
        const dz = (h3(i, 2, 0, 202) - 0.5) * 10;
        this.strands.push(strandOf(sagging([-CRACK - 12 + seamX(z), yf, z + dz], [CRACK + 12 + seamX(z), yf - 2, z - dz], 7 + 7 * h3(i, 3, 0, 203), 1.9, i)));
      }
      // (across the slit, from its lips to his tongue)
      for (let i = 0; i < 5; i++) {
        const z = SLIT.z - SLIT.h * 0.6 + i * SLIT.h * 0.3;
        const side = i % 2 ? 1 : -1;
        const yf = frontAt(z) - 6;
        this.strands.push(strandOf(sagging([side * (slitW(z) + 6) + seamX(z), yf, z + 4], [side * 8 + seamX(z), yf + 6, z - 4], 5, 1.5, 20 + i)));
      }
      const ropes: [number, number, number][] = [[-10, frontAt(SLIT.z - SLIT.h) - 4, SLIT.z - SLIT.h + 2], [9, frontAt(SLIT.z - SLIT.h + 6) - 4, SLIT.z - SLIT.h + 6], [-3, frontAt(26) - 3, 26]];
      ropes.forEach(([x, y, z], i) => this.drool(x + seamX(z), y, z, 3.6, i));
    } else {
      // OPEN: strings of spittle stretched across the gap between his halves, top to bottom, some snapped and hanging
      for (let z = 40, i = 0; z < 320; z += 16 + 16 * h3(i, 0, 0, 210), i++) {
        const yf = frontAt(z) - 22 - 60 * h3(i, 1, 0, 211);
        if (cavity(0, yf, z) < -6) continue;
        const a = world(-1, -CRACK - 1 + seamX(z), yf, z + (h3(i, 2, 0, 212) - 0.5) * 16, 0);
        const b = world(1, CRACK + 1 + seamX(z), yf + (h3(i, 3, 0, 213) - 0.5) * 24, z + (h3(i, 4, 0, 214) - 0.5) * 16, 0);
        const span = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const r = 1.3 + 1.3 * h3(i, 5, 0, 215);
        if (h3(i, 6, 0, 216) < 0.2) {
          // (snapped: hanging from one half)
          const from = h3(i, 7, 0, 217) < 0.5 ? a : b;
          const to = [from[0] + (a === from ? 1 : -1) * span * 0.2, from[1], from[2] - span * 0.3];
          this.strands.push(strandOf(sagging(from, to, -span * 0.05, r, 40 + i, 8)));
        } else this.strands.push(strandOf(sagging(a, b, span * (0.1 + 0.16 * h3(i, 8, 0, 218)), r, 40 + i)));
      }
      // drool in ropes off his halves' lower front edges into the water
      for (const side of [-1, 1]) {
        for (let i = 0; i < 2; i++) {
          const z = 30 + 26 * i;
          const q = world(side, side * (CRACK + 14 + 10 * i) + seamX(z), frontAt(z) - 8, z, 0);
          this.drool(q[0], q[1], q[2], 3.2, side * 10 + i);
        }
      }
    }
    // the gobs falling off him hit the water: there, splashes
    for (let i = 0; i < P.splashes.length; i += 3) {
      const x = P.splashes[i];
      const side = x < 0 ? -1 : 1;
      const q = o > 0 ? world(side, x, P.splashes[i + 1], 0, 0) : [x, P.splashes[i + 1]];
      this.splashes.push(q[0], q[1], P.splashes[i + 2]);
    }
  }

  /** A rope of drool from (x, y, z) down to the water, swaying a little, beads on it, a gob at its end where it meets the water. */
  drool(x: number, y: number, z: number, r: number, seed: number): void {
    const pts: number[][] = [];
    const n = Math.max(3, Math.round(z / 8));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const sway = Math.sin(t * 3.1 + seed) * 2.5 * t;
      const bead = i > 0 && i < n && h3(i, seed, 0, 220) < 0.18 ? 1.6 : 1;
      pts.push([x + sway, y + t * 3, z - t * (z + 2), r * (1 - 0.45 * Math.sin(t * Math.PI)) * bead]);
    }
    this.strands.push(strandOf(pts));
    this.splashes.push(x, y + 3, 6 + r);
  }

  /** How far apart his halves' lips are at his seam (half), at a point of a half's own space. */
  parting(y: number, z: number): number {
    const w = slitW(z);
    return CRACK + (w > 0 ? w * (1 - this.open) * sm01(70, 130, y) : 0);
  }

  /** ONE HALF OF HIS HEAD (`side` -1 his left, 1 his right; 0 both, shut), at a point of his head's space. */
  halfAt(side: number, x: number, y: number, z: number, f: Found | null): number {
    let xl = x;
    let yl = y;
    if (side !== 0) {
      const Y = y - COLOSSUS.hinge;
      xl = x * this.c - side * Y * this.s;
      yl = side * x * this.s + Y * this.c + COLOSSUS.hinge;
    }
    // (well clear of him: how far, as a bound)
    const out = ell(xl, yl, z, 0, -24, 160, 370, 260, 270);
    if (out > 24) return out - 6;
    let h = fleshAt(xl, yl, z, f ? MELT : null);
    const sx = side === 0 ? (xl < 0 ? -1 : 1) : side;
    if (f) {
      f.mat = M_FLESH;
      f.lx = xl;
      f.ly = yl;
      f.lz = z;
    }
    const P = placed();
    if (h < 34) {
      // HIS HIDE: ancient, wrinkled, lumpy; rolls of it sagging down
      const w = vn(xl * 0.011, yl * 0.011, z * 0.006, 11);
      const roll = Math.sin(z * 0.075 + w * 6.5 + xl * 0.004);
      h -= roll * 3.6 * sm01(30, 90, z);
      h -= (vn(xl * 0.024, yl * 0.024, z * 0.024, 13) - 0.5) * 13;
      h -= (vn(xl * 0.06, yl * 0.06, z * 0.03, 14) - 0.5) * 3;
      // MELTING: where his flesh runs like wax, it is goo
      if (f && MELT[0]) f.mat = M_GOO;
      // boils and open sores; bubbles in the goo
      if (z > 30) {
        const S2 = 16;
        const ix = Math.floor(xl / S2);
        const iy = Math.floor(yl / S2);
        const iz = Math.floor(z / S2);
        const roll2 = h3(ix, iy, iz, 41);
        if (roll2 < 0.064) {
          const rr = Math.hypot(xl - (ix + 0.3 + 0.4 * h3(ix, iy, iz, 42)) * S2, yl - (iy + 0.3 + 0.4 * h3(ix, iy, iz, 43)) * S2, z - (iz + 0.3 + 0.4 * h3(ix, iy, iz, 44)) * S2);
          const bubble = roll2 < 0.05;
          const br = bubble ? 2.4 + 2 * h3(ix, iy, iz, 45) : 4.5 + 3.5 * h3(ix, iy, iz, 45);
          if (rr < br && (!bubble || MELT[0] > 0)) {
            const sore = roll2 > 0.058;
            h -= sore ? -1.4 * (1 - rr / br) : (bubble ? 1.0 : 0.8) * br * Math.sqrt(1 - (rr / br) ** 2);
            if (f && rr < br * 0.9) f.mat = bubble ? M_BUBBLE : sore ? M_SORE : M_BOIL;
          }
        }
      }
      // VEINS standing out of him, branching out from his seam
      if (z > 40) {
        const vq = Math.abs(vn(xl * 0.026, yl * 0.026, z * 0.026, 140) - 0.5);
        const vq2 = Math.abs(vn(xl * 0.06, yl * 0.06, z * 0.06, 141) - 0.5);
        const near = 1 - sm01(20, 120, Math.abs(xl));
        const wv = 0.002 + 0.0045 * near;
        if (vq < wv || (vq2 < wv * 0.45 && near > 0.6)) {
          h -= 1.8;
          if (f && h < 1.5) f.mat = M_VEIN;
        }
      }
      // BARNACLES crusting him at the water: he is very old
      if (z < 64 && Math.abs(xl) > 30) {
        const S = 10;
        const ix = Math.floor(xl / S);
        const iy = Math.floor(yl / S);
        const iz = Math.floor(z / S);
        if (h3(ix, iy, iz, 31) < 0.3 - z / 220) {
          const cx = (ix + 0.25 + 0.5 * h3(ix, iy, iz, 32)) * S;
          const cy = (iy + 0.25 + 0.5 * h3(ix, iy, iz, 33)) * S;
          const cz = (iz + 0.25 + 0.5 * h3(ix, iy, iz, 34)) * S;
          const rr = Math.hypot(xl - cx, yl - cy, z - cz);
          if (rr < 5.5) {
            const bump = 3.4 * (1 - rr / 5.5) - (rr < 1.6 ? 2.2 : 0);
            h -= bump;
            if (f && bump > 0.6) f.mat = M_BARN;
          }
        }
      }
      // DRIPS hanging off his overhangs, swelling to a bulb
      const D = P.drips;
      for (let i = 0; i < D.length; i += 6) {
        if ((D[i] < 0 ? -1 : 1) !== sx && side !== 0) continue;
        const dx = xl - D[i];
        const dy = yl - D[i + 1];
        if (dx * dx + dy * dy > (D[i + 5] + 8) ** 2) continue;
        const z0 = D[i + 2];
        const len = D[i + 3];
        if (z > z0 + 8 || z < z0 - len - D[i + 5] * 2) continue;
        let dd = cone(xl, yl, z, D[i], D[i + 1], z0 + 4, D[i], D[i + 1], z0 - len + D[i + 5] * 0.6, D[i + 4], D[i + 5] * 0.7);
        dd = Math.min(dd, ell(xl, yl, z, D[i], D[i + 1], z0 - len, D[i + 5], D[i + 5], D[i + 5] * 1.25));
        if (dd < h + 4) {
          const was = h;
          h = smin(h, dd, 6);
          if (f && dd < was) f.mat = M_GOO;
        }
      }
    }
    // HIS SEAM: the head split down its middle, its lips swollen and rounded; and the hollow of his mouth inside
    const p = this.parting(yl, z);
    const sxz = seamX(z);
    const cut = side === 0 ? p - Math.abs(xl - sxz) : p - side * (xl - sxz);
    let d = smax(h, cut, 16);
    const cv = cavity(xl, yl, z);
    d = smax(d, -cv, 8);
    if (f) {
      if (-cv > Math.max(h, cut) - 2) f.mat = yl < -70 ? M_THROAT : M_MAW;
      else if (cut > h - 2) f.mat = cut > h + 5 ? M_GUM : M_LIP;
    }
    // GOBS fallen off him, in the air below his overhangs
    const G = P.gobs;
    for (let i = 0; i < G.length; i += 5) {
      if ((G[i] < 0 ? -1 : 1) !== sx && side !== 0) continue;
      const r = G[i + 3];
      const gz = z - G[i + 2];
      if (Math.abs(gz) > r * G[i + 4] + 2 || Math.abs(xl - G[i]) > r + 2 || Math.abs(yl - G[i + 1]) > r + 2) continue;
      // (a drop: round below, drawn out to a point above)
      const k = gz > 0 ? G[i + 4] : 1;
      const rr = gz > 0 ? r * (1 - 0.55 * (gz / (r * G[i + 4]))) : r;
      const gd = (Math.hypot(xl - G[i], yl - G[i + 1], gz / k) - rr) * Math.min(1, 1 / k + 0.3);
      if (gd < d) {
        d = gd;
        if (f) f.mat = M_GOB;
      }
    }
    // HIS TEETH along the inner edge of each half
    if (Math.abs(xl) < 70 && z > 0) {
      for (const which of side === 0 ? [0, 1] : [side < 0 ? 0 : 1]) {
        for (const T of P.teeth[which]) {
          const b = T.box;
          if (xl < b[0] || yl < b[1] || z < b[2] || xl > b[3] || yl > b[4] || z > b[5]) continue;
          const Pt = T.p;
          // (shut, his fangs are locked away inside his seam)
          if (this.open < 0.3) break;
          const a1 = cone(xl, yl, z, Pt[0], Pt[1], Pt[2], Pt[4], Pt[5], Pt[6], Pt[3], Pt[7]);
          const a2 = cone(xl, yl, z, Pt[4], Pt[5], Pt[6], Pt[8], Pt[9], Pt[10], Pt[7], Pt[11]);
          const td = Math.min(a1, a2);
          if (td < d) {
            d = td;
            if (f) {
              f.mat = M_TOOTH;
              f.broken = T.broken;
              const L1 = Math.hypot(Pt[4] - Pt[0], Pt[5] - Pt[1], Pt[6] - Pt[2]);
              const L2 = Math.hypot(Pt[8] - Pt[4], Pt[9] - Pt[5], Pt[10] - Pt[6]);
              f.toothT = a1 <= a2 ? Math.min(1, Math.hypot(xl - Pt[0], yl - Pt[1], z - Pt[2]) / (L1 || 1)) * (L1 / (L1 + L2)) : L1 / (L1 + L2) + Math.min(1, Math.hypot(xl - Pt[4], yl - Pt[5], z - Pt[6]) / (L2 || 1)) * (L2 / (L1 + L2));
            }
          }
        }
      }
    }
    return d;
  }

  /** WHAT STAYS WHEN HE SPLITS (hidden inside him while he is shut): the back of his throat, a wall of wet ribbed flesh between his
   *  halves, his gullet a dark hole in it going down and back, glowing deep inside; and the floor of his mouth. */
  coreAt(x: number, y: number, z: number, f: Found | null): number {
    let d = ell(x, y, z, 0, -124, 150, 100, 56, 140);
    d = smin(d, ell(x, y, z, 0, -10, 0, 118, 150, 48), 30);
    if (d > 20) return d;
    const g = ell(x, y, z, 0, -86, 132, 40, 66, 70);
    d = smax(d, -g, 12);
    // (ribbed across)
    d -= 2.6 * Math.sin(z * 0.17 + Math.abs(x) * 0.012) * sm01(-150, -90, y);
    d -= (vn(x * 0.05, y * 0.05, z * 0.05, 172) - 0.5) * 3;
    if (f) {
      f.mat = z < 46 && y > -60 ? M_MAW : M_THROAT;
      // (deep in his gullet it glows; round its rim, faintly)
      f.glowK = g < 3 ? 0.35 + 0.65 * sm01(-90, -146, y) : 0.4 * sm01(26, 0, g);
      f.lx = x;
      f.ly = y;
      f.lz = z;
    }
    return d;
  }

  /** His tongue, and the eye on its tip in a cup of raw flesh. */
  tongueAt(x: number, y: number, z: number, f: Found | null, exact = false): number {
    const E = this.eyeC;
    const R = COLOSSUS.eyeR;
    const g = this.gaze;
    const qx = x - E[0];
    const qy = y - E[1];
    const qz = z - E[2];
    const ql = Math.hypot(qx, qy, qz);
    // (his eye)
    const de = ql - R;
    if (de > 60 && this.tongue && !exact) {
      const b = this.tongue.box;
      if (x < b[0] - 30 || y < b[1] - 30 || z < b[2] - 30 || x > b[3] + 30 || y > b[4] + 30 || z > b[5] + 30) return Math.min(de - 8, Math.max(b[0] - x, x - b[3], b[1] - y, y - b[4], b[2] - z, z - b[5]));
    }
    // (the bulb his tongue's tip swells into round it, its lids parted in an almond round his gaze, their rims raw)
    const fw = qx * g[0] + qy * g[1] + qz * g[2];
    const A = this.eyeA;
    const V = this.eyeV;
    const au = Math.atan2(qx * A[0] + qy * A[1] + qz * A[2], fw);
    const av = Math.atan2(qx * V[0] + qy * V[1] + qz * V[2], fw);
    const lidOpen = Math.hypot(au / 0.98, av / 0.62) - 1;
    let cup = ql - (R + 5);
    cup = smax(cup, -lidOpen * R * 0.5, 5);
    const along = lidOpen < 0.3 ? 1 : 0;
    let d = Math.min(de, cup);
    let tg = Infinity;
    if (this.tongue) {
      const fT = f ? TONGUE_F : null;
      tg = this.armAt(200, x, y, z, fT, this.tongue, exact);
      d = Math.min(de, smin(cup, tg, 14));
    }
    if (f) {
      if (de <= d + 0.01) f.mat = M_EYE;
      else {
        if (tg < cup) Object.assign(f, TONGUE_F);
        f.mat = cup < tg + 4 && along > 0 ? M_LID : M_TONGUE;
      }
      // (all of it his, not an arm)
      f.arm = -1;
    }
    return d;
  }

  /** His spittle and drool (`exact`: no bounds, for the water's rings round him). */
  strandsAt(x: number, y: number, z: number, exact = false): number {
    let d = Infinity;
    for (const S of this.strands) {
      const b = S.box;
      if (!exact && (x < b[0] - 6 || y < b[1] - 6 || z < b[2] - 6 || x > b[3] + 6 || y > b[4] + 6 || z > b[5] + 6)) {
        d = Math.min(d, Math.max(b[0] - x, x - b[3], b[1] - y, y - b[4], b[2] - z, z - b[5]));
        continue;
      }
      const P = S.p;
      for (let k = 0; k + 4 < P.length; k += 4) d = Math.min(d, cone(x, y, z, P[k], P[k + 1], P[k + 2], P[k + 4], P[k + 5], P[k + 6], P[k + 3], P[k + 7]));
    }
    return d;
  }

  /** HIS HEAD's distance at a point of his own space (before his drop), and what is nearest (`f`). */
  bodyAt(x: number, y: number, z: number, f: Found | null, exact = false): number {
    let d: number;
    if (this.open === 0) d = this.halfAt(0, x, y, z, f);
    else {
      const a = this.halfAt(-1, x, y, z, f ? F_A : null);
      const b = this.halfAt(1, x, y, z, f ? F_B : null);
      d = Math.min(a, b);
      if (f) Object.assign(f, a < b ? F_A : F_B);
      const c = this.coreAt(x, y, z, f ? F_C : null);
      if (c < d) {
        if (f && c < d) Object.assign(f, F_C);
        d = Math.min(d, c);
      }
    }
    const t = this.tongueAt(x, y, z, f ? F_T : null, exact);
    if (t < d) {
      if (f) Object.assign(f, F_T);
      d = t;
    }
    const s = this.strandsAt(x, y, z, exact);
    if (s < d) {
      if (f) f.mat = M_STRAND;
      d = s;
    }
    return d;
  }

  /** A tube's distance (an arm `i`, or his tongue), and where on it. */
  armAt(i: number, x: number, y: number, z: number, f: Found | null, A: Arm = this.arms[i], exact = false): number {
    const b = A.box;
    if (!exact && (x < b[0] || y < b[1] || z < b[2] || x > b[3] || y > b[4] || z > b[5])) {
      // (outside its box: how far to the box, as a bound)
      const dx = Math.max(b[0] - x, 0, x - b[3]);
      const dy = Math.max(b[1] - y, 0, y - b[4]);
      const dz = Math.max(b[2] - z, 0, z - b[5]);
      return Math.hypot(dx, dy, dz) + A.margin - 6;
    }
    const P = A.p;
    const CHs = A.ch;
    let d = Infinity;
    let bestK = 0;
    let bestT = 0;
    for (let c = 0; c * 4 < CHs.length; c++) {
      const lb = Math.hypot(x - CHs[c * 4], y - CHs[c * 4 + 1], z - CHs[c * 4 + 2]) - CHs[c * 4 + 3];
      if (lb > d && !exact) continue;
      const kEnd = Math.min(A.n - 1, c * CH + CH);
      for (let k = c * CH; k < kEnd; k++) {
        const ax = P[k * 4];
        const ay = P[k * 4 + 1];
        const az = P[k * 4 + 2];
        const ux = P[k * 4 + 4] - ax;
        const uy = P[k * 4 + 5] - ay;
        const uz = P[k * 4 + 6] - az;
        const L2 = ux * ux + uy * uy + uz * uz || 1e-9;
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
    }
    if (d > 16 || exact) return d;
    // ITS SKIN: smooth muscle; its suckers in two rows along its underside, root to tip
    const k = bestK;
    const t = bestT;
    const cxp = P[k * 4] + (P[k * 4 + 4] - P[k * 4]) * t;
    const cyp = P[k * 4 + 1] + (P[k * 4 + 5] - P[k * 4 + 1]) * t;
    const czp = P[k * 4 + 2] + (P[k * 4 + 6] - P[k * 4 + 2]) * t;
    const r = P[k * 4 + 3] + (P[k * 4 + 7] - P[k * 4 + 3]) * t;
    const s = A.s[k] + (A.s[k + 1] - A.s[k]) * t;
    const sg = A.sig[k] + (A.sig[k + 1] - A.sig[k]) * t;
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
    const dd0 = ix * tx + iy * ty + iz * tz;
    ix -= tx * dd0;
    iy -= ty * dd0;
    iz -= tz * dd0;
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
    d -= (vn(s * 0.02, Math.cos(phi) * 0.7 + 5, Math.sin(phi) * 0.7 + 5, A.seed + 1) - 0.5) * 1.2;
    if (!A.suckers) {
      // (his tongue: a groove down its back, its skin rough with papillae)
      d += 1.6 * Math.exp(-((Math.abs(phi) - Math.PI) ** 2) * 10);
      d -= (vn(s * 0.32, Math.cos(phi) * 2.6 + 3, Math.sin(phi) * 2.6 + 3, 77) - 0.5) * 1.3;
    }
    let sucker = 0;
    if (A.suckers && Math.abs(phi) < 1.2 && r > 3.6 && s > 34) {
      const sr = Math.max(1.6, r * 0.19);
      const space = sr * 3.4;
      for (const row of [-0.46, 0.46]) {
        const off = row > 0 ? 0.5 : 0;
        const c = Math.round(sg - off) + off;
        const du = (sg - c) * space;
        const dv = (phi - row) * r;
        const rho = Math.hypot(du, dv);
        if (rho < sr) {
          const q = rho / sr;
          sucker = q > 0.5 ? 1 : 2;
          d -= q > 0.5 ? 0.9 * sr * 0.22 : -0.32 * sr * (1 - q / 0.5);
        }
      }
    }
    if (f) {
      f.mat = M_ARM;
      f.arm = i;
      f.armT = s / (A.s[A.n - 1] || 1);
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
      for (let k = 0; k + 1 < A.n; k += 2) d = Math.min(d, cone(x, y, 0, P[k * 4], P[k * 4 + 1], P[k * 4 + 2], P[Math.min(A.n - 1, k + 2) * 4], P[Math.min(A.n - 1, k + 2) * 4 + 1], P[Math.min(A.n - 1, k + 2) * 4 + 2], P[k * 4 + 3], P[Math.min(A.n - 1, k + 2) * 4 + 3]));
    }
    if (this.body) {
      const z = this.drop;
      const yb = y + this.back;
      const out = ell(x, yb, z, 0, -20, 60, 470, 310, 330);
      d = Math.min(d, out > 100 ? out : this.bodyAt(x, yb, z, null, true));
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
      // (well clear of his head: how far, as a bound)
      const out = ell(x, yb, z, 0, -10, 230, 480, 360, 430);
      if (out > 30) d = out;
      else d = this.bodyAt(x, yb, z, f);
    }
    for (let i = 0; i < this.arms.length; i++) {
      const a = this.armAt(i, x, y, Z, f ? ARM_F : null);
      if (a < d) {
        if (f) Object.assign(f, ARM_F);
        d = a;
      }
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
  glowK = 0;
  lx = 0;
  ly = 0;
  lz = 0;
}
const ARM_F = new Found0();
const TONGUE_F = new Found0();
const F_A = new Found0();
const F_B = new Found0();
const F_C = new Found0();
const F_T = new Found0();

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
  /** How high over the water each pixel of him is (the camera's up), what it is, and on a tube which and how far along it. */
  const zh = new Float32Array(w * h);
  const mt = new Uint8Array(w * h);
  const aid = new Int16Array(w * h).fill(-1);
  const as = new Float32Array(w * h);
  const D = px.d;
  const f = new Found0();
  const T0 = 760;
  const eps = 0.6;
  const E = S.eyeC;
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
      for (let n = 0; n < 240 && t < T0 * 2; n++) {
        d = S.at(x, y, z, null);
        if (d < eps) {
          hit = true;
          break;
        }
        const step = d * 0.72;
        t += step;
        y -= EYE_V[1] * step;
        z -= EYE_V[2] * step;
        if (z < -360) break;
      }
      const k = j * w + i;
      // where the ray meets the water
      const wy = sd * SIN30 + (sd * COS30 / EYE_V[2]) * EYE_V[1];
      if (!hit || z < -0.5) {
        // THE WATER ROUND HIM, dark and oily: foam and scum and bubbles where he breaks it and where his goo and drool hit it; thin
        // broken lines of ripples spreading from it, further apart further out, catching his eye's glow
        const wd = S.waterDist(X, wy);
        // (splashes: a ring of foam round each, flecks inside)
        let spl = 0;
        const SP = S.splashes;
        for (let q = 0; q < SP.length; q += 3) {
          const sx2 = SP[q] * S.flip;
          const sy2 = SP[q + 1] * S.flip - S.back * S.flip;
          const rr = Math.hypot(X - sx2, (wy - sy2) * 1.0);
          if (rr < SP[q + 2] + 2) spl = Math.max(spl, Math.abs(rr - SP[q + 2]) < 1.3 ? 2 : 1);
        }
        if (wd < RIPPLES[RIPPLES.length - 1] + 2 || spl) {
          let c: RGB | null = null;
          let a = 255;
          const sh = hp(i, j, 5);
          const foamBand = 3.4 + 3.4 * vn(X * 0.06, wy * 0.06, 0, 8);
          if (S.drop < 60 && spl === 2) c = sh < 0.6 ? FOAM[4] : FOAM[3];
          else if (S.drop < 60 && spl === 1 && sh < 0.35) c = FOAM[3];
          else if ((wd < foamBand && S.drop < 60) || (S.drop >= 60 && wd < 3.2 && S.armsAt(X, wy, 0) < 3.2)) {
            // (foam, and bubbles in it: a ring with a dark middle)
            const bb = vn(X * 0.4, wy * 0.4, 0, 9);
            c = bb > 0.78 ? FOAM[1] : bb > 0.7 ? FOAM[4] : sh < 0.5 ? FOAM[4] : sh < 0.8 ? FOAM[3] : FOAM[1];
          } else if (wd < 12 && sh < 0.08) c = SCUM;
          else {
            for (let r = 0; r < RIPPLES.length; r++) {
              const R = RIPPLES[r];
              if (Math.abs(wd - R) < 0.55 && vn(X * 0.045 + r * 3.1, wy * 0.02, r, 6) > 0.4) {
                // (his glow caught in the ripples before him)
                const pinkK = S.body && S.drop < 60 && r < 4 ? Math.max(0, 1 - Math.abs(X - E[0] * S.flip) / 240) : 0;
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
      f.glowK = 0;
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
      // (the light's shadow: a short march toward it; his eye, wet and burning, is never lost in it)
      if (lit > -0.1 && f.mat !== M_EYE) {
        let st = 3;
        const sx = x + Nx * 2;
        const sy = y + Ny * 2;
        const sz = z + Nz * 2;
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
      const mat = f.mat;
      const onHead = f.arm < 0 && mat !== M_EYE && mat !== M_STRAND;
      // (into the dark toward his edges: the further from the middle of him, the darker)
      const far = S.body && pose.view === 'front' ? sm01(170, 440, Math.hypot(fx, (fz + 0) - 150)) : sm01(200, 420, Math.hypot(x, z - 120));
      const tube = mat === M_ARM || mat === M_TONGUE;
      // (his eye and the tongue it is on are never lost in the dark: it is the brightest thing on him)
      const own = mat === M_EYE || mat === M_LID || mat === M_TONGUE ? 0 : 1;
      const v = lit * 0.86 - 0.1 - occ * 1.35 - (tube ? far * 0.25 : far * 0.42) * own + bayer(i, j) * (tube ? 0.3 : 0.14);
      const tn = tone(v);
      const upN = Nz;
      let col: RGB;
      let gloss = 0.5;
      let glow = false;
      if (mat === M_EYE) {
        // HIS EYE: yellowed and bloodshot, his iris the enemy's fire round a black slit, looking where his gaze is
        const ex = fx - E[0];
        const ey = fy - E[1];
        const ez = fz - E[2];
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
        const IR = 29;
        if (A < IR) {
          const slit = 4.6 * Math.sqrt(Math.max(0, 1 - (av / (IR - 2)) ** 2));
          const stria = vn(Math.atan2(av, au) * 7, A * 0.18, 0, 61);
          if (Math.abs(au) < slit) col = PUPIL;
          else if (Math.abs(au) < slit + 1.6) col = CO_IRIS[0];
          else {
            const band = A > IR - 2.5 ? 0 : A > IR - 7 ? 1 : A > IR - 13 ? 2 : A > 7 ? 3 : 4;
            const b2 = Math.max(0, Math.min(4, band + (stria > 0.68 ? 1 : stria < 0.3 ? -1 : 0)));
            col = CO_IRIS[Math.max(0, b2 - (lit < 0.05 ? 1 : 0))];
          }
          glow = true;
          gloss = 1.2;
        } else {
          // the white, veined; redder toward the cup round it
          const vein = Math.abs(vn(ux * 11, uy * 11, uz * 11, 62) - 0.5) < 0.03 + (A / 90) * 0.05 || Math.abs(vn(ux * 23, uy * 23, uz * 23, 63) - 0.5) < 0.018 + (A / 90) * 0.03;
          const ramp0 = vein ? CO_VEIN : A > 56 && hp(i, j, 64) < (A - 56) / 30 ? CO_VEIN : CO_SCLERA;
          col = ramp0[Math.max(vein ? 1 : 0, Math.min(4, tn))];
          gloss = 1.0;
        }
        if (spec > 0.985 && lit > 0.2) col = GLINT;
      } else if (mat === M_ARM) {
        // A TENTACLE: one smooth taper of muscle, dark along its back shading to pale along its underside by a dither (no line,
        // no band); its suckers cupped rings, lit rims and dark middles, in two rows along the underside, root to tip
        const phi = f.armPhi;
        const under = (Math.cos(phi) + 1) / 2;
        const band = Math.max(0, Math.min(2, Math.floor(under * 2.6 - 0.45 + bayer(i, j) * 1.0 + 0.5)));
        if (f.armR === 1) col = CO_PALE[Math.max(1, Math.min(4, tn + 1))];
        else if (f.armR === 2) col = CO_PALE[Math.max(0, Math.min(2, tn - 1))];
        else col = (band === 2 ? CO_PALE : band === 1 ? CO_ARMMID : CO_ARMBACK)[tn];
        gloss = 0.9;
      } else if (mat === M_TONGUE) {
        // HIS TONGUE: slick, smooth, paler along its underside; wet all over; veined where it swells round his eye
        const under = Math.max(0, -Nz) + bayer(i, j) * 0.5;
        col = CO_TONGUE[Math.max(0, Math.min(4, tn + (under > 0.55 ? 1 : 0)))];
        const ed = Math.hypot(fx - E[0], fy - E[1], fz - E[2]);
        if (ed < COLOSSUS.eyeR + 10) {
          const vq = Math.abs(vn(fx * 0.09, fy * 0.09, fz * 0.09, 66) - 0.5);
          const vq2 = Math.abs(vn(fx * 0.2, fy * 0.2, fz * 0.2, 67) - 0.5);
          if (vq < 0.035 || vq2 < 0.02) col = CO_VEIN[Math.max(0, Math.min(2, tn - 1))];
        }
        gloss = 1.8;
      } else if (mat === M_LID) {
        // the raw rim of his tongue's tip, cupped round his eye
        col = CO_RAW[Math.max(0, Math.min(4, tn))];
        gloss = 1.3;
      } else if (mat === M_LIP) {
        // his seam's lips: rotten, swollen, wet and dark
        col = CO_LIP[Math.max(0, Math.min(4, tn))];
        gloss = 1.4;
      } else if (mat === M_GUM) {
        // the raw ring his teeth are set in; shut, the deep of his seam, dark and running with drool
        col = S.open < 0.3 ? (hp(i, j, 85) < 0.2 + 0.4 * Math.max(0, lit) ? CO_SLIME[3] : CO_MAW[Math.max(0, Math.min(1, tn))]) : CO_RAW[Math.max(0, Math.min(3, tn))];
        gloss = 1.8;
      } else if (mat === M_TOOTH) {
        // yellowed, brown toward the root; a broken one's end dark and chipped
        const t2 = f.toothT;
        const step = t2 < 0.22 ? -2 : t2 < 0.45 ? -1 : 0;
        col = f.broken && t2 > 0.85 ? CO_TOOTH[Math.max(0, tn - 2)] : CO_TOOTH[Math.max(0, Math.min(4, tn + 1 + step))];
        gloss = 0.7;
      } else if (mat === M_THROAT || mat === M_MAW) {
        // inside him: dark and wet, ribbed; his throat lit faintly from within, pink burning to gold, the deeper the more
        const deepIn = f.glowK + bayer(i, j) * 0.22;
        const base = CO_MAW[Math.max(0, Math.min(3, tn))];
        col = deepIn > 0.85 ? mixRGB(CO_MAW[1], CO_IRIS[3], 0.45) : deepIn > 0.55 ? mixRGB(CO_MAW[1], CO_IRIS[2], 0.36) : deepIn > 0.3 ? mixRGB(base, CO_IRIS[0], 0.3) : base;
        if (deepIn > 0.55) glow = true;
        gloss = 1.3;
      } else if (mat === M_STRAND) {
        // spittle and drool: pale, wet, catching the light even in the dark of his mouth
        col = CO_SPIT[Math.max(2, Math.min(4, tn + 1))];
        gloss = 0;
      } else if (mat === M_GOB || mat === M_GOO) {
        // his flesh running off him like wax, slick with goo; a gob of it falling
        col = CO_MELT[Math.max(0, Math.min(4, tn))];
        gloss = 1.7;
      } else if (mat === M_BUBBLE) {
        // a bubble in his goo: a dark film, a bright rim on its lit side
        col = tn >= 2 ? CO_SLIME[4] : CO_SLIME[1];
        gloss = 2;
      } else if (mat === M_VEIN) {
        // a vein standing out of him, dark with old blood
        col = mixRGB(CO_BRUISE[Math.max(0, Math.min(3, tn))], CO_VEIN[1], 0.35);
        gloss = 1.2;
      } else if (mat === M_BOIL) {
        col = (tn >= 2 ? CO_PALE : CO_BRUISE)[Math.min(3, tn)];
        gloss = 1.6;
      } else if (mat === M_SORE) {
        col = CO_RAW[Math.max(0, Math.min(2, tn - 1))];
        gloss = 1.6;
      } else if (mat === M_BARN) {
        col = CO_BARNACLE[Math.min(4, tn + (hp(i, j, 83) < 0.3 ? 1 : 0))];
        gloss = 0.1;
      } else {
        // HIS HIDE: rotting, wet, sagging; deep dark creases going to bruise; bruising in soft gradients, never patches; goo
        // sheeting down him in long streaks; pale, drowned flesh toward the water
        const lx = f.lx;
        const ly = f.ly;
        const lz = f.lz;
        const sheet = vn(lx * 0.09, ly * 0.09, lz * 0.008, 93) > 0.66 && upN < 0.6;
        const bruise = vn(lx * 0.007, ly * 0.007, lz * 0.007, 94) + bayer(i, j) * 0.22;
        const drowned = sm01(40, 0, lz) + bayer(i, j) * 0.3;
        if (occ > 0.34) {
          col = CO_BRUISE[tn];
          gloss = 0.6;
        } else if (sheet) {
          col = CO_SLIME[tn];
          gloss = 1.7;
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
      // HIS EYE'S GLOW on what is round it: pink, and gold nearest
      if (S.body && pose.view === 'front' && mat !== M_EYE && onHead) {
        const ex = E[0] - fx;
        const ey = E[1] - fy;
        const ez = E[2] - fz;
        const el = Math.hypot(ex, ey, ez) || 1;
        const facing = (Nx * S.flip * ex + Ny * S.flip * ey + Nz * ez) / el;
        const g = facing * Math.max(0, 1 - (el - COLOSSUS.eyeR) / 150) + bayer(i, j) * 0.12;
        if (g > 0.62) col = mixRGB(col, CO_IRIS[3], 0.28);
        else if (g > 0.4) col = mixRGB(col, CO_IRIS[1], 0.2);
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
      if (mat === M_ARM || mat === M_TONGUE) {
        aid[k] = mat === M_TONGUE ? 200 : f.arm;
        as[k] = f.armS;
      }
    }
  }
  // THE SEAM where one part of him ends in front of another, and round him (not round a thin string of spittle, nor where a tube runs
  // on over itself); THE PINK EDGE outside it (over the water only)
  const seam = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (kind[k] !== 1 || mt[k] === M_STRAND) continue;
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
        else if (kind[kk] === 1 && mt[kk] !== M_STRAND && near[kk] - n0 > 9) {
          // (a tube running on over itself: one skin, no line, unless it truly crosses over itself further along)
          if (aid[k] >= 0 && aid[k] === aid[kk] && Math.abs(as[k] - as[kk]) < 70) continue;
          s = true;
        }
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
  // (spittle, drool and goo hanging off him, before the edge)
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
  // HIS LIGHTS: his eye's fire (the game draws it over the dark); open, his throat's
  const lights: Light[] = [];
  if (pose.body && pose.view === 'front') {
    const zz = E[2] - pose.drop;
    const yy = E[1] - (pose.back ?? 0);
    lights.push({ x: ax + E[0] * SEEN * zoom, y: ay + zoom * (yy * SIN30 * SEEN - zz), r: 110 * zoom, color: FLAME[2], a: zz < 0 ? 0.35 : 0.22 });
    if (S.open > 0.3) lights.push({ x: ax, y: ay + zoom * ((-90 - (pose.back ?? 0)) * SIN30 * SEEN - (130 - pose.drop)), r: 90 * zoom, color: FLAME[3], a: 0.14 * S.open });
  }
  for (let k = 0; k < w * h; k++) if (kind[k] !== 1 && kind[k] !== 2) mt[k] = 0;
  return { px, ax, ay, lights, near, kind, mat: mt };
}

/**
 * SPITTLE, DROOL AND GOO HANGING OFF HIM: from the lower edge of everything of him that overhangs the air, drool in strings off his
 * lips, teeth and tongue; his melting flesh in drips, each running to a fat bead at its end; strings of slime off his tentacles.
 * Each hangs no further than the water under where it hangs from.
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
  const string = (i: number, j: number, len0: number, n: number, seed: number, jaw = false): void => {
    // (most hang a little way; one in five all the way down)
    const len = h3(i, j, 9, seed) < 0.2 ? len0 : Math.min(len0, Math.round((10 + 50 * h3(i, j, 8, seed)) * zoom));
    for (let s = 1; s <= len; s++) {
      const bead = h3(i, s, 3, seed) < 0.06;
      // (between his jaws: a string stops where it meets what is below)
      if (jaw && j + s < h && kind[(j + s) * w + i] === 1 && near[(j + s) * w + i] > n - 25) return;
      if (!put(i, j + s, s % 13 === 4 ? CO_SPIT[4] : CO_SPIT[bead ? 3 : 1 + ((s >> 3) & 1)], n)) return;
      if (bead) put(i + 1, j + s, CO_SPIT[1], n);
    }
    put(i, j + len + 1, CO_SPIT[3], n);
    put(i + 1, j + len + 1, CO_SPIT[1], n);
    put(i, j + len + 2, CO_SPIT[4], n);
  };
  const drip = (i: number, j: number, len: number, n: number): void => {
    // (a drip of his melting flesh: a neck running down, then its fat bead, lit on the left, a glint)
    for (let s = 1; s <= len; s++) if (!put(i, j + s, CO_MELT[s < 3 ? 2 : 1], n)) return;
    const y0 = j + len;
    put(i - 1, y0 + 1, CO_MELT[3], n);
    put(i, y0 + 1, CO_MELT[2], n);
    put(i + 1, y0 + 1, CO_MELT[1], n);
    put(i - 1, y0 + 2, CO_MELT[2], n);
    put(i, y0 + 2, CO_MELT[1], n);
    put(i + 1, y0 + 2, CO_MELT[0], n);
    put(i, y0 + 3, CO_MELT[0], n);
    put(i - 1, y0 + 1, CO_SHEEN, n);
  };
  for (let i = 1; i < w - 1; i++) {
    for (let j = 2; j < h - 2; j++) {
      const k = j * w + i;
      if (kind[k] !== 1) continue;
      const below = (j + 1) * w + i;
      const under = kind[below] === 0 || kind[below] === 3 || (kind[below] === 1 && near[k] - near[below] > 18);
      if (!under) continue;
      const m = mt[k];
      if (m === M_EYE || m === M_STRAND) continue;
      const toWater = Math.max(0, zh[k]) * zoom;
      const roll = h3(i, j, 0, 101);
      if (m === M_TOOTH || m === M_LIP || m === M_MAW || m === M_GUM || m === M_TONGUE || m === M_THROAT || m === M_LID) {
        // drool, and slime strung between his jaws
        if (roll < (m === M_LIP ? 0.08 : m === M_TONGUE ? 0.05 : m === M_TOOTH ? 0.012 : 0.006)) string(i, j, Math.round(toWater * (h3(i, j, 2, 102) < 0.2 ? 0.6 + 0.4 * h3(i, j, 1, 102) : 0.06 + 0.3 * h3(i, j, 1, 102))), near[k], 103, true);
      } else if (m === M_ARM) {
        if (roll < 0.05) string(i, j, Math.round(Math.min(toWater, (8 + 26 * h3(i, j, 1, 104)) * zoom)), near[k], 105);
      } else {
        // (his melting flesh: drips everywhere it hangs over the air, and strings of goo to the water)
        if (roll < 0.14) drip(i, j, Math.round(Math.min(toWater, (2 + 16 * h3(i, j, 1, 106) ** 2) * zoom)), near[k]);
        else if (roll < 0.146) string(i, j, Math.round(toWater * (0.2 + 0.8 * h3(i, j, 1, 109))), near[k], 110);
      }
    }
  }
}

// =============================================================================================
// HIS POSES FOR THE PICTURES (stage 1: stills)

/**
 * THE ARENA HE LIES BEFORE (the main chat's, 7 Nov: the stone 17 tiles across the screen by 11 deep, its far long edge open on the
 * water): how far toward the camera from his middle at the water the stone's edge is, in his lengths. His word, 7 Nov, “he needs to
 * slide back a little so the tentacles don’t clip through him or the stage”: 310, 7.9 tiles, so that each arm rises in open water
 * between him and the stone, its root clear of both.
 */
export const STONE = { across: 17, deep: 11, edge: 310 } as const;
/** Where his arms rise (his lengths across, and toward the camera from his middle): just off the stone's edge, in the water. Phase 1 at a third and two thirds along it; phases 2 and 3 left, middle and right. */
export const ARM_ROOTS = {
  under: [-111, 111] as const,
  risen: [-222, 0, 222] as const,
  y: 256,
} as const;

/** HIS THREE ARMS RISEN (phases 2 and 3): out of the water just off the stone, left, middle and right; the outer two reared up in an S, their tips curling; the middle one lower, coiled aside. */
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

/** Him risen: his head shut (`maw` 0) or split open (1), from in front or behind. */
export function poseRisen(maw = 0, view: 'front' | 'back' = 'front'): ColossusPose {
  return { view, drop: 0, body: true, maw, gaze: GAZE_AT_YOU, arms: ARMS_RISEN };
}
export function poseUnder(): ColossusPose {
  return { view: 'front', drop: COLOSSUS.sunk, back: COLOSSUS.sunkBack, body: true, maw: 0, gaze: [0, 0.87, 0.5], arms: ARMS_UNDER, tongue: 'under' };
}
export function poseArm(): ColossusPose {
  return { view: 'front', drop: 0, body: false, maw: 0, gaze: GAZE_AT_YOU, arms: ARM_ALONE };
}

// =============================================================================================
// HIS ARMS CLEAR OF HIM AND OF THE STONE; HIS PARTS

/**
 * How clear his arms are, along every one of them (his lengths): of his head and all of him (the least gap between an arm's skin and
 * his, where they are nearest), and of the stone (the least gap, toward the camera, between any part of an arm low enough to meet the
 * stone and the stone's edge; parts higher than the stone are over it, in the air); and whether every root is under the water before
 * the stone.
 */
export function armClearances(pose: ColossusPose): { body: number; stone: number; rootsInWater: boolean; where: number[] } {
  const S = new Scene(pose);
  let body = Infinity;
  let where: number[] = [];
  let stone = Infinity;
  let rootsInWater = true;
  for (const A of S.arms) {
    const P = A.p;
    for (let k = 0; k < A.n; k++) {
      const x = P[k * 4];
      const y = P[k * 4 + 1];
      const z = P[k * 4 + 2];
      const r = P[k * 4 + 3];
      if (S.body) {
        const b = S.bodyAt(x, y + S.back, z + S.drop, null, true) - r;
        if (b < body) {
          body = b;
          where = [x, y, z, r];
        }
      }
      // (low enough to meet the stone: its underside below the stone's top, at the water's height, or within a few lengths of it)
      if (z - r < 4) stone = Math.min(stone, STONE.edge - (y + r));
    }
    if (!(P[2] < 0 && P[1] + P[3] < STONE.edge)) rootsInWater = false;
  }
  return { body, stone, rootsInWater, where };
}

/**
 * HOW SMOOTH A TUBE OF HIM IS (a tentacle, or his tongue): along its whole length, the most its thickness changes from one sample to
 * the next (his lengths), the most its underside turns from one to the next (degrees), and whether its suckers' count only ever
 * grows along it. One continuous taper, no bands, no joints, no steps.
 */
export function tubeSmoothness(a: ArmPose): { radiusStep: number; turnDeg: number; samples: number; suckersInOrder: boolean; taperOnly: boolean } {
  const A = armOf(a);
  let radiusStep = 0;
  let turn = 0;
  let suckersInOrder = true;
  let taperOnly = true;
  for (let k = 1; k < A.n; k++) {
    const dr = A.p[k * 4 + 3] - A.p[(k - 1) * 4 + 3];
    radiusStep = Math.max(radiusStep, Math.abs(dr));
    if (dr > 1e-9 && a.path[0].length <= 3) taperOnly = false;
    const c = A.inner[k * 3] * A.inner[(k - 1) * 3] + A.inner[k * 3 + 1] * A.inner[(k - 1) * 3 + 1] + A.inner[k * 3 + 2] * A.inner[(k - 1) * 3 + 2];
    turn = Math.max(turn, (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI);
    if (A.sig[k] < A.sig[k - 1]) suckersInOrder = false;
  }
  return { radiusStep, turnDeg: turn, samples: A.n, suckersInOrder, taperOnly };
}

/** HOW HE MELTS: how many drips hang off his overhangs, gobs are falling off him, splashes where they hit the water; how many drips run
 *  off the edges of the sheets of his flesh, and the longest (his lengths). */
export function meltParts(): { drips: number; gobs: number; splashes: number; sheetDrips: number; longest: number } {
  const P = placed();
  let sheetDrips = 0;
  let longest = 0;
  SHEETS.forEach((sh, k) => {
    for (let c = Math.floor(-760 / sh.W); c <= Math.ceil(760 / sh.W); c++) {
      const [, , , L] = sheetDrip(k, c);
      if (L) {
        sheetDrips++;
        longest = Math.max(longest, L);
      }
    }
  });
  return { drips: P.drips.length / 6, gobs: P.gobs.length / 5, splashes: P.splashes.length / 3, sheetDrips, longest };
}

/** Where his eye is (his own space), shut and open; and how far his halves are apart at his front, torn open (his lengths). */
export function headParts(maw: number): { eye: readonly [number, number, number]; gap: number; frontShut: number } {
  const S = new Scene(poseRisen(maw));
  const zF = 160;
  const yF = frontAt(zF);
  const Y = yF - COLOSSUS.hinge;
  return { eye: S.eyeC, gap: 2 * (Y * S.s + CRACK * S.c), frontShut: yF };
}

// =============================================================================================
// WHAT HE COSTS

/** A frame of him risen at the game's size (picture pixels, two to a game pixel: what he spans with his arms and what hangs off him, and a little room), and what it holds at 4 bytes a pixel. */
export const COLOSSUS_FRAME = { w: 960, h: 680 } as const;
export function costOf(fps: number, seconds: number, frame: { w: number; h: number } = COLOSSUS_FRAME): { frameMB: number; perSecondMB: number; totalMB: number } {
  const frameMB = (frame.w * frame.h * 4) / (1024 * 1024);
  return { frameMB, perSecondMB: frameMB * fps, totalMB: frameMB * fps * seconds };
}
