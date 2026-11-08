// FLOOR 10'S BOSS, REDONE FROM NOTHING: THE SWAMP COLOSSUS (the art chat, 7 Nov 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game imports this file; `EYE2` is off. Nothing of the old Drowned Eye (art/drowned_eye.ts) is in it: not his solids, not his
// pictures, not his code. Stage 1: his look, still, for pictures. Stage 2 (his moves, part 1: his stand, his lurk, his entrance):
// art/eye_moves.ts says each frame (`ColossusAnim`); this file paints it, in layers (his jaws, his tongue, each tentacle) laid
// together with the water by the pictures' tool. Without `anim`, he is the still exactly as drawn.
//
// HIS WORDS, 7 Nov 2026, 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or
// intimidating.  the arena doesnt really work, and his entrance is not epic.”; 00:13: “just scrap his look and start fresh.  big
// ancient gross eldritch horror swamp monster with tentacles and a big eye.” His pick of the takes offered: “Swamp colossus
// (Recommended)”. Then, shown 3e7b6844: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still split up into sections.
// But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the center for the maw.
// Spittle and goo all over the place.  And have him like constantly melting and dripping”; and, 11:17: “And the eye waves around
// like its own tentacle”. Shown the splitting head (bfb16ba3): “That’s pretty good, I like the direction, but I have a drawing of
// what I was kinda thinking”; he sent his drawing (docs/ref/eye_drawing_from_owner_2026-11-07.jpg), and, 12:45: “Not EXACTLY like
// that but that’s kinda what I meant about the maw splitting and the tongue eye”.
//
// WHAT HE IS, AS PAINTED (his drawing taken as the idea): he rises out of the black water ALREADY SPLIT WIDE OPEN, from the water
// up, in a deep V: a vast maw. Its two halves are great jaws pried apart, tall and pointed, each leaning out to its peak (his left
// the lower and further out, his right the taller and sharper): rotting grey-green flesh melting off them like wax, drips running
// down them into the water, heaps of it slumped round them at the water. Down both inner edges of the V, rows of crooked hooked
// teeth set in raw gum; inside it his wet ribbed throat, glowing faintly pink-gold low down, spittle strung across. Out of the bottom
// of the V HIS TONGUE rises in a long S, thick at the root and tapering, smooth wet flesh, towering over his jaws; ON ITS TIP, THE
// HIGHEST OF ALL OF HIM, HIS EYE: lying on its side, wider than tall, in a bulb of the tongue's flesh drawn to a point at each
// corner like a lens, raw lids parted in an almond round it, the iris the enemy's pink burning to gold round a tall black slit.
// SPITTLE AND GOO EVERYWHERE: drool in strings and ropes, goo sheeting down him, bubbles, foam where it hits the water. His
// TENTACLES as they were, each one continuous smooth taper from root to tip, the suckers in two rows along the underside all the
// way. An enemy: the pink edge round him, pink and gold his only glow; nothing cyan.
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
  /** His eye on the tip of his tongue, lying on its side: half its width, half its height, half its depth. */
  eyeW: 58,
  eyeH: 24,
  eyeD: 30,
  /** How deep he lies in phase 1, under the water (his jaws' peaks a little below it). */
  sunk: 215,
  /** And how far back out in the water he lies then (so that what is seen of him is seen in the water, not under the stone). */
  sunkBack: 330,
  /** How deep under the water anything of him is still seen; his eye's fire, deeper. */
  seenDeep: 70,
  /** And while he lies under it (phase 1): his dark jaws seen faintly further down. */
  seenDeepSunk: 130,
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
/** His eye's lids shut over it: thin skin over the ball, paler than the raw rim round it. */
export const CO_SHUTLID = ramp('#2a1618', '#4c2a2a', '#72423e', '#9a6256', '#c08a74');
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
/** His eye's lids shut over it (in the almond its lids part in when open). */
const M_SHUT = 26;
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
  /** Moving (art/eye_moves.ts): `belly` says the way its suckers face at its tip's curl outright (its rest's, `armBelly`), so that
   *  they never jump to another side of it as it curls and uncurls. */
  fixed?: boolean;
  /** Slapped down flat on the stone (art/eye_arms.ts, a slam's hit): how squashed what of it lies low is (0 round; 1.2 flattened to
   *  three quarters of its thickness and bulging out half as wide again; below 0, springing up taller than wide as it rebounds).
   *  Only what lies low, from `squashFrom` along it (0 its root, 1 its tip) out, is squashed; the rest of it is round. */
  squash?: number;
  squashFrom?: number;
}
export interface ColossusPose {
  /** 'front', or 'back' (his back to the camera: the game's rulebook asks both). */
  view: 'front' | 'back';
  /** How far down he is: 0 risen, `COLOSSUS.sunk` under the water (phase 1); and how far back out in the water (sunk, further). Without his head at all: `body` false. */
  drop: number;
  back?: number;
  body: boolean;
  /** The way his eye looks (his own space). */
  gaze: readonly [number, number, number];
  arms: ReadonlyArray<ArmPose>;
  /** Under the water (phase 1), his tongue reared forward before him in the water, the eye on it between his two arms. */
  tongue?: 'under';
  /** A frame of a move (art/eye_moves.ts); absent, the still as drawn. */
  anim?: ColossusAnim;
  /** TURNED (his shovel, art/eye_shovel.ts): where each of his own axes points in the world (x across, y toward the camera, z up), a
   *  turn of him as a whole (his maw turned on its side). The camera's ray, the light and the way to the eye are turned into his own
   *  space; how near each pixel is, how high over the water, and where his lights are, turned back out of it. Only as a layer
   *  (`Frame.raw`): the water round him is the pictures' tool's. */
  orient?: { x: readonly [number, number, number]; y: readonly [number, number, number]; z: readonly [number, number, number] };
  /** LEANING, his snap from the end of the stone (art/eye_shovel.ts): his flesh above `from` (his height) carried forward, toward the
   *  camera in his own space, `k` of his lengths for each of height over it (eased in over `ease`), his heaps at the water staying where
   *  they are: so that his jaws come out over the stone and his breadth at the water does not. */
  lean?: { k: number; from: number; ease: number };
}

/** WHAT A FRAME OF HIS MOVES SAYS (art/eye_moves.ts), beyond a still. */
export interface ColossusAnim {
  /** His clock (seconds): what runs on him (the sheets of his flesh sliding down, his drips, his gobs, his spittle) runs by it, each
   *  repeating in EYE_LOOP, so that his stand closes on itself. */
  t: number;
  /** His jaws: 1 open as drawn; 0 shut, upright and pressed together; more than 1 flung wider. */
  open: number;
  /** His tongue's spine (x, y, z, radius at each, as TONGUE_RISEN), and its eye's middle; null: drawn down into him, not painted. */
  tongue: ReadonlyArray<readonly number[]> | null;
  eye: readonly [number, number, number];
  /** The way his eye looks. */
  gaze: readonly [number, number, number];
  /** His eye's lids: 0 shut, 1 open. */
  lids: number;
  /** His eye turned up on its edge (radians about the way it looks): 0 lying on its side, as it always does; π/2, its long way up
   *  (as it comes up out of his throat between his jaws, where it is narrowest). */
  roll?: number;
  /** How big his eye is (1 as drawn): squeezed small as it comes up out of his throat, swelling to its size as it clears his jaws. */
  swell?: number;
  /** His throat's glow: 1 as drawn, more as it flares. */
  glow: number;
  /** His wind-up at his entrance (0 to 1): shut, his mound swelling, the lips of his seam bulging, his throat's glow showing through
   *  them (nothing opens). Absent: none. */
  puff?: number;
  /** When (his clock) his jaws tore apart at his entrance: the strings of flesh and spittle across his seam hold before it and snap as
   *  he opens; his spittle across the V stays snapped until it knits again after `knit`. Absent: long ago. */
  tore?: number;
  knit?: number;
  /** Which of him: his jaws, his throat and what drips off them ('jaws'); his spittle and drool ('spit'); his tongue and eye
   *  ('tongue'); all (absent). */
  parts?: 'jaws' | 'spit' | 'tongue';
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
  /** RAW (a layer of a move, `Frame.raw`): nothing of the water painted; each pixel his own colour as if in air, how high over the
   *  water what it shows is (his own lengths, the camera's up), whether it is fire (his eye's iris, his throat's glow: seen deep
   *  through the water), and whether it is his outline (the pink edge goes outside it, over the water only). */
  zh?: Float32Array;
  fire?: Uint8Array;
  seam?: Uint8Array;
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
  /** A tentacle moving (a pose of a move): its suckers flex. */
  flex?: boolean;
  /** Squashed flat where it lies low (`ArmPose.squash`), at each sample: 0 round. */
  sq?: Float64Array;
}
/** A squashed tube's cross-section (`ArmPose.squash` `q`): its height and its width against a round one's. */
export const squashOf = (q: number): { high: number; wide: number } => ({ high: (1 + 0.55 * q) / (1 + q), wide: 1 + 0.55 * q });
const CH = 8;
const TAU_C = Math.PI * 2;
/** A tentacle's own loop as it stands (seconds): its suckers' flexing and its drips repeat in it (art/eye_moves.ts ARM_LOOP). */
export const ARM_LOOP = 1.5;

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
  // (slapped flat: what of it lies low squashed, the rest round, smoothly between)
  let sq: Float64Array | undefined;
  if (a.squash) {
    sq = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const r = p[i * 4 + 3];
      sq[i] = a.squash * Math.max(0, Math.min(1, (r * 1.6 + 6 - p[i * 4 + 2]) / (r * 0.8 + 4))) * Math.max(0, Math.min(1, (s[i] / S - (a.squashFrom ?? 0)) / 0.04));
    }
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
  if (kl < 1e-3 || a.fixed) {
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
    for (let k = k0; k <= k1; k++) rad = Math.max(rad, Math.hypot(p[k * 4] - cx, p[k * 4 + 1] - cy, p[k * 4 + 2] - cz) + p[k * 4 + 3] * (sq ? 1 + 0.55 * Math.max(0, sq[k]) : 1));
    ch[c * 4] = cx;
    ch[c * 4 + 1] = cy;
    ch[c * 4 + 2] = cz;
    ch[c * 4 + 3] = rad;
  }
  return { p, inner, s, sig, n: N, box, seed: a.seed, margin, ch, suckers, ...(sq ? { sq } : {}) };
}

/** The way a tentacle's tip curls at rest: its suckers held to it as it moves (`ArmPose.fixed`), so that at rest it is as drawn. */
export function armBelly(a: ArmPose, N = 120): [number, number, number] {
  const pts = catmull(a.path, N);
  const iT = Math.max(1, Math.min(N - 2, N - 1 - Math.round(N * 0.12)));
  const kx = pts[iT + 1][0] + pts[iT - 1][0] - 2 * pts[iT][0];
  const ky = pts[iT + 1][1] + pts[iT - 1][1] - 2 * pts[iT][1];
  const kz = pts[iT + 1][2] + pts[iT - 1][2] - 2 * pts[iT][2];
  const kl = Math.hypot(kx, ky, kz);
  return kl < 1e-3 ? [a.belly[0], a.belly[1], a.belly[2]] : [kx / kl, ky / kl, kz / kl];
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
  /** A string of his flesh (at his entrance), not spittle. */
  flesh?: boolean;
  /** Held by his tongue at its first end. */
  held?: boolean;
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
// HIS JAWS (his own space: across X, toward the camera Y, up Z, from the water under his middle)
//
// His drawing of 7 Nov: he rises out of the water ALREADY SPLIT WIDE OPEN in a deep V from the water up: two tall pointed halves like
// great jaws pried apart, each leaning out to a peak (his left the lower and further out, his right the taller and sharper); teeth
// down both inner edges of the V; his throat inside it, glowing low down; his tongue up out of the bottom of it in a long S, the eye
// on its tip the highest of all. Each jaw is his own flesh, sculpted, melting and running; its inner side the V's face, cut by a
// plane leaning out from the line the two faces meet along (under the water, at the back of him) and turned a little toward you,
// hollowed and ribbed inside its rim of raw gum, the teeth set along that rim.

/** The crack between his jaws where they meet, under the water at the back of the V (half its width). */
const CRACK = 0.8;
/** The line the V's two faces meet along: under the water (ZP), its back end (Y0); how far each face is turned toward you (radians). */
const ZP = -12;
const Y0 = -60;
const TURN = 0.08;

/**
 * EACH JAW, as his right one is (his left mirrored, X = -x, and made differently): its spine from deep in the water up through its
 * mass to its peak (x, y, z, its thickness: round across, deeper front to back), the heaps of his flesh slumped at the water round
 * it and what bulges out of it (ellipsoids: x, y, z, rx, ry, rz).
 */
interface JawMake {
  spine: ReadonlyArray<readonly [number, number, number, number]>;
  lumps: ReadonlyArray<readonly [number, number, number, number, number, number, number]>;
  /** Where it leans round (for what runs down it: an upright line through it), and a box round all of it. */
  ax: number;
  box: readonly [number, number, number, number, number, number];
}
/** How far each face of the V leans out from upright (radians): his left the further. */
const TILT: readonly [number, number] = [0.77, 0.68];
/** Each jaw's peak, up from the water and back from his middle (his left the lower), and its x worked out to sit on its face's edge. */
const PEAK_Z: readonly [number, number] = [128, 146];
const PEAK_Y = -22;
const peakX = (k: number): number => {
  const t = TILT[k];
  // (the face's x at the peak's height and depth, a hair inside the jaw: see faceOf)
  const ct = Math.cos(t);
  const st = Math.sin(t);
  return (CRACK + 3 + ct * Math.sin(TURN) * (PEAK_Y - Y0) + st * (PEAK_Z[k] - ZP)) / (ct * Math.cos(TURN));
};
/** A jaw, as his right one is: from deep in the water up out of the narrow trunk he rises from, tall, leaning and flaring a little
 *  out to its peak `px`, `pz` (on its face's edge), tapering to a point. */
const fang = (px: number, pz: number, fat: number): Array<[number, number, number, number]> => [
  [px - 132, 40, -70, 112 * fat], [px - 124, 34, -10, 108 * fat], [px - 96, 22, pz * 0.25, 88 * fat], [px - 60, 8, pz * 0.5, 62 * fat],
  [px - 30, -4, pz * 0.72, 38 * fat], [px - 10, -14, pz * 0.88, 16 * fat], [px, PEAK_Y, pz, 2],
];
const JAW_MAKE: readonly [JawMake, JawMake] = [
  // HIS LEFT: the lower, leaning further out; heavier, sagging
  {
    spine: fang(peakX(0), PEAK_Z[0], 1.08),
    lumps: [
      // the flesh run off him slumped at the water round him, wide and low, in heaps; a jowl of melting flesh sagging off his outer
      // flank, hanging out over the water; tumours bulging out of him
      [120, 24, -16, 140, 120, 38, 32], [214, -6, -6, 84, 84, 24, 24], [74, 116, -4, 66, 44, 22, 20], [184, 76, -2, 54, 44, 20, 18],
      [190, 30, 60, 34, 42, 26, 20], [150, 60, 36, 24, 22, 20, 12], [150, -20, 90, 22, 24, 18, 12],
    ],
    ax: 90,
    box: [-90, -170, -200, 350, 190, 150],
  },
  // HIS RIGHT: the taller and sharper
  {
    spine: fang(peakX(1), PEAK_Z[1], 1),
    lumps: [
      [114, 22, -16, 134, 116, 36, 32], [206, -4, -4, 80, 82, 24, 24], [70, 114, -2, 64, 44, 22, 20], [178, 74, -2, 52, 44, 20, 18],
      [178, 26, 72, 30, 38, 24, 20], [140, 56, 46, 22, 20, 18, 12], [140, -18, 108, 20, 22, 16, 12],
    ],
    ax: 86,
    box: [-90, -170, -200, 340, 190, 172],
  },
];
/** Each jaw's peak (his own space): the end of its spine. */
export const PEAKS: readonly [readonly [number, number, number], readonly [number, number, number]] = [
  [-JAW_MAKE[0].spine[6][0], JAW_MAKE[0].spine[6][1], JAW_MAKE[0].spine[6][2]],
  [JAW_MAKE[1].spine[6][0], JAW_MAKE[1].spine[6][1], JAW_MAKE[1].spine[6][2]],
];

/**
 * EACH JAW'S FACE ON THE V: a plane through the line under the water, leaning out by its tilt and turned a little toward you; above
 * where it leaves the jaw, the jaw's horn runs on up and out to its peak. Its frame: `n` into the jaw, `b` along the face toward you, `c` along the face up the
 * V's edge; and each jaw's tilt.
 */
interface Face {
  n: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  tilt: number;
}
function faceOf(side: number, tilt: number): Face {
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const cp = Math.cos(TURN);
  const sp = Math.sin(TURN);
  return { n: [side * ct * cp, -ct * sp, -st], b: [side * sp, cp, 0], c: [side * st * cp, -st * sp, ct], tilt };
}
/** How deep into a face's jaw a point is (less than 0 out in the V). */
const faceDepth = (F: Face, x: number, y: number, z: number): number => F.n[0] * x + F.n[1] * (y - Y0) + F.n[2] * (z - ZP);
export const FACES: readonly [Face, Face] = [faceOf(-1, TILT[0]), faceOf(1, TILT[1])];
/** The face wanders a little as it runs up the V (how far, by how far up it). */
const wander = (c: number): number => 3 * Math.sin(c * 0.021 + 0.6) + (vn(c * 0.03, 3, 1, 250) - 0.5) * 5;

// =============================================================================================
// HIS JAWS MOVING (a frame of a move, art/eye_moves.ts): each jaw swings on the line its face meets the other's along (under the
// water at the back of the V): shut, its face upright and turned square to the other's, the two pressed together down his seam;
// breathing, a little either way; flung wider as he roars. What has run off him and slumped round him at the water (the first
// four of each jaw's lumps) stays where it lies; what slides and drips off him runs straight down, as wax does, however his jaws
// lean. Everything else of a jaw (its flesh, its face, its teeth, its gums) swings with it.

/** The point his jaws swing about: where the line under the water meets the back of the V. */
const PIVOT: readonly [number, number, number] = [0, Y0, ZP];
/** How many of each jaw's lumps lie slumped round him at the water (they stay where they lie). */
const HEAPS = 4;
/** How far apart the two faces stand when he is shut (each from the middle, his lengths, over the crack): never through each other. */
const SHUT_GAP = 7;

/** The frame being painted, while he moves (null: the still). One frame is painted at a time. */
interface Now {
  t: number;
  open: number;
  glow: number;
  /** Each jaw's swing: its own frame to his space (rows), about PIVOT; its inverse; how much shorter a distance in its frame may be. */
  m: [number[], number[]];
  inv: [number[], number[]];
  kd: [number, number];
  /** Pressed (null: only swung): each jaw's swing as a turn only (rows), and where each of its teeth's roots has gone beyond that turn,
   *  so that its teeth stay as they are, only moved with the gum they are set in. */
  rigid: [number[], number[]] | null;
  teethAt: [number[][], number[][]] | null;
  faces: [Face, Face];
  gap: number;
  /** Drips hanging off his overhangs where they hang now (his space): top x, y, z, how far down, radius at the top and at its bulb. */
  drips: number[];
  /** Gobs falling off him now: x, y, z (middle), radius, how long. */
  gobs: number[];
  parts: 'jaws' | 'spit' | 'tongue' | 'all';
  /** His wind-up (0 none). */
  puff: number;
  /** The sheets of his flesh sliding down him now (oldest first). */
  slides: Array<{ k: number; z0: number; th: number; lk: number }>;
}
let NOW: Now | null = null;
/** The point of his space being asked, while a jaw is asked in its own frame (what lies slumped at the water, and what runs and drips
 *  down him, is in his space). */
let WX = 0;
let WY = 0;
let WZ = 0;

/** How much of his closing is his jaws PRESSED together rather than swung: shut, each jaw's face is pushed upright against the
 *  other's with every part of it kept at its own height (a lean taken out, not a turn), so that shut he is his own open jaws pressed
 *  together, two tall peaks meeting over his seam (swung shut, rigid, his outer flanks would rise round over his peaks: two lobes);
 *  opening, the swing takes over, nothing of him changing shape as it tears apart. 0 from 0.9 open (his breath, his roar). */
/** How much of the way his jaws swing up as they press shut (the rest pressed upright): none, or his outer flanks rise round over his
 *  peaks. Instead each stands taller as it is pressed upright, its face as long as it is (as a swing would stand it), every part of it
 *  rising with it in its own measure, so that his peaks stay his highest. */
const PRESS_TURN = 0;
function pressOf(open: number): number {
  return open >= 0.9 ? 0 : 1 - sm01(0.55, 0.9, open);
}
/** A jaw's swing for how open he is, its inverse (rows, his space to its own frame) and how much shorter a distance in its own frame
 *  may be than in his (its least stretch; 1 while it only turns). */
interface Swing {
  m: number[];
  inv: number[];
  kd: number;
  press: number;
}
function swingFull(side: number, open: number, puff = 0): Swing {
  const m0 = swingOf0(side, open);
  const w = pressOf(open);
  if (w === 0 && !puff) return { m: m0, inv: [m0[0], m0[3], m0[6], m0[1], m0[4], m0[7], m0[2], m0[5], m0[8]], kd: 1, press: 0 };
  // (pressed: swung up part of the way, so that his peaks rise with it as they lean in (`PRESS_TURN`); the rest of its lean taken out
  // by a shear across, about the line under the water, every height kept; then turned square to the other)
  const k = side < 0 ? 0 : 1;
  const sh = Math.max(0, Math.min(1, 1 - open));
  const tilt = TILT[k];
  const dr = PRESS_TURN * tilt * sh;
  const cr = Math.cos(dr);
  const sr = Math.sin(dr);
  const ry = [cr, 0, -side * sr, 0, 1, 0, side * sr, 0, cr];
  const n0 = FACES[k].n;
  const n1 = [ry[0] * n0[0] + ry[1] * n0[1] + ry[2] * n0[2], ry[3] * n0[0] + ry[4] * n0[1] + ry[5] * n0[2], ry[6] * n0[0] + ry[7] * n0[1] + ry[8] * n0[2]];
  // (its lean, from what is left after the swing to what it is at this much open)
  const l1 = tilt - dr;
  const l2 = tilt * (1 - sh);
  const a = (n1[2] / n1[0]) * (Math.abs(Math.tan(l1)) > 1e-6 ? 1 - Math.tan(l2) / Math.tan(l1) : 0);
  // (turned square: its face's way out of it, along the water, turned onto the other's)
  const phi = Math.atan2(n1[1], n1[0]);
  let th = (n1[0] >= 0 ? 0 : Math.PI) - phi;
  th = Math.atan2(Math.sin(th), Math.cos(th)) * sh;
  const cz = Math.cos(th);
  const sz = Math.sin(th);
  // (rows: the turn, after standing taller, after the shear, after the swing)
  // (and a little more, as tall as he rose swung shut before: his top breaking the water as it did)
  const tall = (Math.cos(l2) / Math.cos(l1)) * (1 + 0.084 * sh);
  const sk = [1, 0, a, 0, 1, 0, 0, 0, tall];
  const rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  const mul = (A: number[], B: number[]): number[] => {
    const o: number[] = [];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) o.push(A[r * 3] * B[q] + A[r * 3 + 1] * B[3 + q] + A[r * 3 + 2] * B[6 + q]);
    return o;
  };
  const ms = mul(rz, mul(sk, ry));
  // (winding up: swelling, every part of him out from the line under the water a little)
  const sw = 1 + 0.05 * puff;
  const m = m0.map((v, i) => (v + (ms[i] - v) * w) * sw);
  // (its inverse)
  const [A, B, C, D, E, F, G, H, I] = m;
  const det = A * (E * I - F * H) - B * (D * I - F * G) + C * (D * H - E * G);
  const inv = [(E * I - F * H) / det, (C * H - B * I) / det, (B * F - C * E) / det, (F * G - D * I) / det, (A * I - C * G) / det, (C * D - A * F) / det, (D * H - E * G) / det, (B * G - A * H) / det, (A * E - B * D) / det];
  // (the most the inverse stretches: a distance in its own frame is at most that times one in his)
  let v = [0.3, 0.5, 0.8];
  let big = 1;
  for (let it = 0; it < 40; it++) {
    const u = [inv[0] * v[0] + inv[1] * v[1] + inv[2] * v[2], inv[3] * v[0] + inv[4] * v[1] + inv[5] * v[2], inv[6] * v[0] + inv[7] * v[1] + inv[8] * v[2]];
    const r = [inv[0] * u[0] + inv[3] * u[1] + inv[6] * u[2], inv[1] * u[0] + inv[4] * u[1] + inv[7] * u[2], inv[2] * u[0] + inv[5] * u[1] + inv[8] * u[2]];
    const l = Math.hypot(r[0], r[1], r[2]) || 1;
    big = Math.sqrt(l);
    v = [r[0] / l, r[1] / l, r[2] / l];
  }
  return { m, inv, kd: Math.min(1, 0.97 / big), press: w };
}
/** A jaw's swing for how open he is (rows, its own frame to his space): pressed and swung (`swingFull`). */
function swingOf(side: number, open: number, puff = 0): number[] {
  return swingFull(side, open, puff).m;
}
/** A jaw swung for how open he is: about the line under the water (closing, by its own lean out; shut, upright), and turned square
 *  to the other jaw as it shuts. Rows, its own frame to his space. */
function swingOf0(side: number, open: number): number[] {
  const k = side < 0 ? 0 : 1;
  const tilt = TILT[k];
  const d = tilt * (1 - open);
  const c = Math.cos(d);
  const s = Math.sin(d);
  // (about the line along y: closing brings its top in toward the middle)
  const ry = [c, 0, -side * s, 0, 1, 0, side * s, 0, c];
  // (and turned square: its face's turn toward you taken out as it shuts)
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const psi = side * Math.atan2(ct * Math.sin(TURN), ct * ct * Math.cos(TURN) + st * st) * Math.max(0, Math.min(1, 1 - open));
  const cz = Math.cos(psi);
  const sz = Math.sin(psi);
  const rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  const m: number[] = [];
  for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) m.push(rz[r * 3] * ry[q] + rz[r * 3 + 1] * ry[3 + q] + rz[r * 3 + 2] * ry[6 + q]);
  return m;
}
/** A point of a jaw's own frame, in his space now (and a way, `way`: no PIVOT). */
function jawToHim(m: readonly number[], p: readonly number[], way = false): [number, number, number] {
  const o = way ? [0, 0, 0] : PIVOT;
  const x = p[0] - o[0];
  const y = p[1] - o[1];
  const z = p[2] - o[2];
  return [m[0] * x + m[1] * y + m[2] * z + o[0], m[3] * x + m[4] * y + m[5] * z + o[1], m[6] * x + m[7] * y + m[8] * z + o[2]];
}
const J_PT: [number, number, number] = [0, 0, 0];
/** A point of his space, in a jaw's own frame (into J_PT), by the swing's inverse (rows). */
function himToJaw(inv: readonly number[], x: number, y: number, z: number): void {
  const a = x - PIVOT[0];
  const b = y - PIVOT[1];
  const c = z - PIVOT[2];
  J_PT[0] = inv[0] * a + inv[1] * b + inv[2] * c + PIVOT[0];
  J_PT[1] = inv[3] * a + inv[4] * b + inv[5] * c + PIVOT[1];
  J_PT[2] = inv[6] * a + inv[7] * b + inv[8] * c + PIVOT[2];
}
function faceNow(F: Face, W: Swing): Face {
  const m = W.m;
  if (!W.press) return { n: jawToHim(m, F.n, true), b: jawToHim(m, F.b, true), c: jawToHim(m, F.c, true), tilt: F.tilt };
  // (pressed: its face's way out of it by the inverse's transpose, its ways along it by the swing; each its length 1)
  const iv = W.inv;
  const unit = (v: number[]): [number, number, number] => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const n = unit([iv[0] * F.n[0] + iv[3] * F.n[1] + iv[6] * F.n[2], iv[1] * F.n[0] + iv[4] * F.n[1] + iv[7] * F.n[2], iv[2] * F.n[0] + iv[5] * F.n[1] + iv[8] * F.n[2]]);
  return { n, b: unit(jawToHim(m, F.b, true)), c: unit(jawToHim(m, F.c, true)), tilt: F.tilt };
}
/** What lies slumped round him at the water: a box round all of each jaw's heaps (his space; x as his right jaw's, mirrored). */
const HEAP_BOX: readonly [number, number, number, number, number, number] = (() => {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const J of JAW_MAKE) {
    for (let i = 0; i < HEAPS; i++) {
      const L = J.lumps[i];
      for (let c = 0; c < 3; c++) {
        b[c] = Math.min(b[c], L[c] - L[c + 3] - L[6]);
        b[c + 3] = Math.max(b[c + 3], L[c] + L[c + 3] + L[6]);
      }
    }
  }
  return b as unknown as readonly [number, number, number, number, number, number];
})();

/** A JAW'S MASS (before what slides, runs and drips off it): `side` -1 his left, 1 his right. (The last asked kept: it is asked
 *  twice at each point, for the flesh and for the hollow behind its face.) */
let JB_S = 0;
let JB_X = NaN;
let JB_Y = NaN;
let JB_Z = NaN;
let JB_W = NaN;
let JB_V = 0;
function jawBase(side: number, x: number, y: number, z: number): number {
  const w = NOW ? WX * 7.13 + WY * 3.71 + WZ : 0;
  if (side === JB_S && x === JB_X && y === JB_Y && z === JB_Z && w === JB_W) return JB_V;
  const v = jawBase0(side, x, y, z);
  JB_S = side;
  JB_X = x;
  JB_Y = y;
  JB_Z = z;
  JB_W = w;
  JB_V = v;
  return v;
}
function jawBase0(side: number, x: number, y: number, z: number): number {
  const J = JAW_MAKE[side < 0 ? 0 : 1];
  const X = x * side;
  // (thinner front to back than across: a slab of a jaw, not a dome; his own space stretched toward you, the distance shrunk to match)
  const KY = 1.25;
  const Y = y * KY;
  const S = J.spine;
  let d = Infinity;
  for (let k = 0; k + 1 < S.length; k++) {
    d = Math.min(d, cone(X, Y, z, S[k][0], S[k][1] * KY, S[k][2], S[k + 1][0], S[k + 1][1] * KY, S[k + 1][2], S[k][3], S[k + 1][3]) / KY);
  }
  // (what has slumped round him at the water lies where it lies: in his space while he moves)
  const hx = NOW ? WX * side : X;
  const hy = NOW ? WY : y;
  const hz = NOW ? WZ : z;
  for (let i = 0; i < J.lumps.length; i++) {
    const L = J.lumps[i];
    d = i < HEAPS ? smin(d, ell(hx, hy, hz, L[0], L[1], L[2], L[3], L[4], L[5]), L[6]) : smin(d, ell(X, y, z, L[0], L[1], L[2], L[3], L[4], L[5]), L[6]);
  }
  return d;
}

/** The hollow of a jaw behind its face (the inside of his mouth, wet and ribbed, curved as the jaw is): less than 0 inside it. `a`
 *  how deep into the jaw from its face. */
function hollow(side: number, x: number, y: number, z: number, a: number): number {
  const c = Math.max(jawBase(side, x, y, z) + 19 + (vn(x * 0.03, y * 0.03, z * 0.03, 175) - 0.5) * 14, a - 130);
  if (c > 12) return c;
  // (ribbed across, like the roof of a mouth)
  return c + 2.4 * Math.sin(z * 0.16 + vn(x * 0.02, y * 0.02, z * 0.01, 171) * 3.0) * sm01(6, 26, z);
}

/**
 * HIS FLESH SLIDING OFF HIM LIKE MELTING WAX: two sheets of it slid down over each jaw, the upper the thicker, each one's lower edge
 * running down in drips of every length, each drip a tongue of flesh necked where it leaves the sheet and swelling to a fat end; the
 * height of each sheet's edge (round him it wanders), how thick it lies on what is under it, how wide a drip may be, and how far one
 * may run. They run straight down, as wax does, however his jaws lean.
 */
const SHEETS: ReadonlyArray<{ z: number; t: number; W: number; L: number }> = [
  { z: 104, t: 12, W: 24, L: 80 },
  { z: 48, t: 8, W: 18, L: 44 },
];
/** A sheet's edge between its drips, at u round him. */
const hemOf = (k: number, u: number): number => SHEETS[k].z + (vn(u * 0.009 + k * 7.3, k * 3.1, 0.5, 230) - 0.5) * 40;
/** A sheet's drip in a cell round him: where (u), how wide at its top and at its fat end, how far down it has run (0 none). Each
 *  worked out once. */
const DRIP_MEMO = new Map<number, [number, number, number, number]>();
function sheetDrip(k: number, cell: number): [number, number, number, number] {
  const key = k * 100000 + cell;
  let r = DRIP_MEMO.get(key);
  if (!r) {
    r = sheetDrip0(k, cell);
    DRIP_MEMO.set(key, r);
  }
  return r;
}
function sheetDrip0(k: number, cell: number): [number, number, number, number] {
  const sh = SHEETS[k];
  if (h3(cell, k, 0, 240) < 0.18) return [0, 0, 0, 0];
  const wb = sh.W * (0.2 + 0.16 * h3(cell, k, 1, 241));
  const wt = wb * (0.6 + 0.25 * h3(cell, k, 2, 242));
  const uc = (cell + 0.5 + (h3(cell, k, 3, 243) - 0.5) * (1 - (2 * (wb + 2)) / sh.W)) * sh.W;
  const L = 12 + sh.L * h3(cell, k, 4, 244) ** 1.3;
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

/** His loop (seconds): everything that runs on him repeats in it, so that his stand closes on itself. */
export const EYE_LOOP = 3;
/**
 * WHILE HE MOVES, HIS FLESH NEVER STOPS SLIDING OFF HIM: three sheets of it, one after another, each welling up over the tops of his
 * jaws, sliding down him (`top` to `bottom` over the water, a loop's time), its drips running longer the further it has slid, and
 * melting away into what lies slumped round him at the water as the next comes down; each laid over the ones it slides down over (the
 * newest outermost), so that he never runs out. How thick each lies, how wide a drip may be and how far one may run.
 */
export const SLIDE = { n: 3, top: 158, bottom: 26, t: 11, W: 22, L: 76 } as const;
/** A sliding sheet's drip in a cell round him: where, how wide at its top and at its fat end, how far it may run (0 none). */
function slideDrip(k: number, cell: number): [number, number, number, number] {
  const key = 50000000 + k * 100000 + cell;
  let r = DRIP_MEMO.get(key);
  if (!r) {
    const W = SLIDE.W;
    const s = 300 + k;
    if (h3(cell, k, 0, s) < 0.16) r = [0, 0, 0, 0];
    else {
      const wb = W * (0.2 + 0.16 * h3(cell, k, 1, s + 10));
      const wt = wb * (0.6 + 0.25 * h3(cell, k, 2, s + 20));
      const uc = (cell + 0.5 + (h3(cell, k, 3, s + 30) - 0.5) * (1 - (2 * (wb + 2)) / W)) * W;
      r = [uc, wt, wb, 12 + SLIDE.L * h3(cell, k, 4, s + 40) ** 1.3];
    }
    DRIP_MEMO.set(key, r);
  }
  return r;
}
/** A sliding sheet's edge between its drips, its hem `z0` up him now. */
const slideHem = (k: number, z0: number, u: number): number => z0 + (vn(u * 0.009 + k * 5.7 + 20, k * 2.3 + 9, 0.5, 231) - 0.5) * 36;
const HEM_MEMO = new Map<number, number>();
/** A sliding sheet's edge over its hem at a drip's cell (worked out once). */
function slideHemAt(k: number, cell: number, uc: number): number {
  const key = k * 100000 + cell;
  let v = HEM_MEMO.get(key);
  if (v === undefined) {
    v = slideHem(k, 0, uc);
    HEM_MEMO.set(key, v);
  }
  return v;
}
/** Where a sliding sheet is (less than 0 on it), its drips run `lk` of how far they may; how near a drip's fat end (`end[0]`). */
function slideMap(k: number, z0: number, lk: number, u: number, z: number, end: number[]): number {
  const W = SLIDE.W;
  let d = slideHem(k, z0, u) - z;
  const c0 = Math.floor(u / W);
  end[0] = 0;
  for (let c = c0 - 1; c <= c0 + 1; c++) {
    const [uc, wt, wb, L0] = slideDrip(k, c);
    if (!L0) continue;
    const L = L0 * lk;
    const top = z0 + slideHemAt(k, c, uc) + 4;
    const bot = top - L;
    const t = Math.max(0, Math.min(1, (top - z) / L));
    const r = wt + (wb - wt) * t * t;
    const e = Math.hypot(u - uc, z - (top - L * t)) - r;
    const eb = Math.hypot(u - uc, (z - bot) * 0.85) - wb;
    d = smin(d, Math.min(e, eb), 9);
    end[0] = Math.max(end[0], Math.max(0, 1 - Math.hypot(u - uc, z - bot) / (wb * 1.8)));
  }
  return d;
}
/** Each sliding sheet now: its hem's height, how thick it lies, how far its drips have run; oldest (lowest) first. */
function slidesAt(t: number): Array<{ k: number; z0: number; th: number; lk: number }> {
  const out: Array<{ k: number; z0: number; th: number; lk: number; p: number }> = [];
  for (let k = 0; k < SLIDE.n; k++) {
    const q = t / EYE_LOOP + k / SLIDE.n;
    const p = q - Math.floor(q);
    // (welling up over the first third, lying full, melting away into the heaps over the last: the three always sum the same)
    const e = p < 1 / 3 ? sm01(0, 1 / 3, p) : p > 2 / 3 ? sm01(1, 2 / 3, p) : 1;
    out.push({ k, z0: SLIDE.top - (SLIDE.top - SLIDE.bottom) * p, th: SLIDE.t * e, lk: 0.3 + 0.7 * sm01(0, 0.85, p), p });
  }
  return out.sort((a, b) => b.p - a.p);
}

/**
 * THIN RUNS OF GOO down him: here and there a strip of it standing out of him, from where it wells out to a fat bead where it has run
 * to. How far a run stands out at a point (his lengths), 0 off them. Round him by his azimuth (u, a length round him).
 */
function runAt(u: number, z: number): number {
  if (z < 6) return 0;
  const W = 21;
  const cell = Math.floor(u / W);
  if (h3(cell, 9, 0, 164) > 0.5) return 0;
  const w = 3.2 + 2.8 * h3(cell, 9, 1, 165);
  const uc = (cell + 0.5 + (h3(cell, 9, 2, 166) - 0.5) * (1 - (2 * (w + 1)) / W)) * W;
  const top = 50 + 100 * h3(cell, 9, 3, 167);
  const end = Math.max(10, top - 30 - 90 * h3(cell, 9, 4, 168));
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

/** A JAW'S FLESH: its mass with the sheets slid down it and the runs (its face not cut yet); `m[0]` says whether it is running goo there. */
function fleshAt(side: number, x: number, y: number, z: number, m: number[] | null): number {
  const base = jawBase(side, x, y, z);
  // (far from it: a bound, far enough out that the water's rings round him never meet the step)
  if (base > 100) return base - 25;
  const J = JAW_MAKE[side < 0 ? 0 : 1];
  if (NOW) {
    // WHILE HE MOVES: what runs and slides down him, in his space (straight down, however his jaws lean), the sheets laid one over
    // another, the newest outermost
    const u = Math.atan2((WX - side * J.ax) * side, WY + 10) * 150;
    const run = runAt(u, WZ);
    let cur = base - run;
    let melt = run > 1.5 ? 1 : 0;
    for (const s of NOW.slides) {
      if (s.th < 0.05 || WZ < s.z0 - 30 - SLIDE.L * s.lk - SLIDE.W) continue;
      const map = slideMap(s.k, s.z0, s.lk, u, WZ, END);
      const sd = smax(cur - s.th * (1 + 0.7 * END[0] * END[0]), map, 6);
      if (sd < cur) melt = map > -8 || END[0] > 0.2 ? 1 : 0;
      cur = Math.min(cur, sd);
    }
    if (m) m[0] = melt;
    return cur;
  }
  const u = Math.atan2((x - side * J.ax) * side, y + 10) * 150;
  const run = runAt(u, z);
  let d = base - run;
  let melt = run > 1.5 ? 1 : 0;
  for (let k = 0; k < SHEETS.length; k++) {
    if (z < SHEETS[k].z - 30 - SHEETS[k].L - SHEETS[k].W) continue;
    const map = sheetMap(k, u, z, END);
    // (the sheet over him, its drips' fat ends standing out further)
    const sd = smax(base - SHEETS[k].t * (1 + 0.7 * END[0] * END[0]), map, 6);
    if (sd < d) melt = map > -8 || END[0] > 0.2 ? 1 : 0;
    d = Math.min(d, sd);
  }
  if (m) m[0] = melt;
  return d;
}
const MELT = [0];
/** A jaw whole: its flesh, its face cut (the V). */
function jawCut(side: number, x: number, y: number, z: number): number {
  const F = FACES[side < 0 ? 0 : 1];
  const a = faceDepth(F, x, y, z);
  const c = F.c[0] * x + F.c[1] * (y - Y0) + F.c[2] * (z - ZP);
  return smax(fleshAt(side, x, y, z, null), CRACK + wander(c) - a, 16);
}

/** What is placed on him once: drips off his overhangs, gobs falling off, his teeth, the edges of his jaws' faces. */
interface Placed {
  /** Drips hanging off his overhangs: top x, y, z, how far down, its radius at the top and at its bulb. */
  drips: number[];
  /** Gobs fallen off him, in the air: x, y, z (their middle), radius, how long. */
  gobs: number[];
  /** Splashes where they hit the water: x, y, size. */
  splashes: number[];
  /** His teeth, along each jaw's inner edge: [left, right]. */
  teeth: [Tooth[], Tooth[]];
  /** Along each jaw's edge on the V, from low at the front up to its peak: points of its raw rim (x, y, z). */
  rims: [number[][], number[][]];
  /** Under each drip off his overhangs, how high what is below it is (the water, or what lies slumped at it): where its gobs land. */
  dripAir: number[];
}
let PLACED: Placed | null = null;
/** How far a point is from his tongue's skin, risen or under the water (its spine taken as a chain of round cones): nothing of him
 *  may pass through it. */
function tongueGap(x: number, y: number, z: number): number {
  let d = Infinity;
  for (const T of [TONGUE_RISEN, TONGUE_UNDER]) {
    for (let k = 0; k + 1 < T.length; k++) d = Math.min(d, cone(x, y, z, T[k][0], T[k][1], T[k][2], T[k + 1][0], T[k + 1][1], T[k + 1][2], T[k][3], T[k + 1][3]));
  }
  return d;
}
function placed(): Placed {
  if (PLACED) return PLACED;
  // (placed on him as drawn, still, whatever frame is being painted)
  const was = NOW;
  NOW = null;
  try {
    return placed0();
  } finally {
    NOW = was;
  }
}
function placed0(): Placed {
  const body = (x: number, y: number, z: number): number => Math.min(jawCut(-1, x, y, z), jawCut(1, x, y, z));
  // DRIPS HANGING OFF HIS OVERHANGS: where, looking up from under him, he is over the air (not the water), a drip hangs down
  const drips: number[] = [];
  const dripAir: number[] = [];
  const gobs: number[] = [];
  const splashes: number[] = [];
  for (let gx = -42; gx <= 42; gx++) {
    for (let gy = -26; gy <= 24; gy++) {
      const x = gx * 8 + (h3(gx, gy, 0, 180) - 0.5) * 6;
      const y = gy * 9 + (h3(gx, gy, 1, 180) - 0.5) * 6;
      if (Math.abs(x) < 20) continue;
      if (h3(gx, gy, 2, 181) > 0.4) continue;
      // (up through any heap of him at the water, up through the air over it, to what overhangs it)
      let z = 4;
      while (z < 200 && body(x, y, z) < 0) z += 2;
      const air = z;
      while (z < 200 && body(x, y, z) > 0) z += 2;
      if (z >= 200 || z < 26 || z - air < 16) continue;
      // (only from what overhangs: open air for a good way under it)
      if (body(x, y, z - 10) < 4) continue;
      const big = h3(gx, gy, 9, 188) < 0.3;
      const len = big ? 30 + 60 * h3(gx, gy, 3, 182) : 10 + 30 * h3(gx, gy, 3, 182);
      const r0 = big ? 5 + 3.5 * h3(gx, gy, 4, 183) : 3 + 2 * h3(gx, gy, 4, 183);
      const rb = r0 * (1.4 + 0.5 * h3(gx, gy, 5, 184));
      drips.push(x, y, z + 3, Math.min(len, z - air - 4), r0, rb);
      dripAir.push(air);
      // (some have let go: a gob falling below, and where it will hit the water, a splash)
      if (h3(gx, gy, 6, 185) < 0.55) {
        const gz = z - len - 14 - (z - len - air) * 0.6 * h3(gx, gy, 7, 186);
        if (gz > air + 10) gobs.push(x, y, gz, rb * 0.95, 1.6 + 0.6 * h3(gx, gy, 8, 187));
        splashes.push(x, y, 5 + rb);
      }
    }
  }
  // HIS TEETH: rows of hooked fangs along each jaw's inner edge, from the water up to its peak and down its back, set into the raw
  // rim of gum between its outside and its hollow; pointing across the V at the other jaw, each hooked back toward his throat;
  // crooked, of every size, the front row the bigger
  const teeth: [Tooth[], Tooth[]] = [[], []];
  const rims: [number[][], number[][]] = [[], []];
  for (const side of [-1, 1]) {
    const F = FACES[side < 0 ? 0 : 1];
    const list = teeth[side < 0 ? 0 : 1];
    const rim = rims[side < 0 ? 0 : 1];
    const on = (b: number, c: number, a: number): number[] => {
      const w = wander(c);
      return [
        F.n[0] * (CRACK + w + a) + F.b[0] * b + F.c[0] * c,
        Y0 + F.n[1] * (CRACK + w + a) + F.b[1] * b + F.c[1] * c,
        ZP + F.n[2] * (CRACK + w + a) + F.b[2] * b + F.c[2] * c,
      ];
    };
    // (the middle of its face over the water, in the face's own frame: along it toward you, and up it)
    let B0 = 0;
    let C0 = 0;
    let nIn = 0;
    for (let b = 0; b <= 400; b += 8) {
      for (let c = 0; c <= 320; c += 8) {
        const q = on(b, c, 1);
        if (q[2] > 4 && fleshAt(side, q[0], q[1], q[2], null) < 0) {
          B0 += b;
          C0 += c;
          nIn++;
        }
      }
    }
    B0 /= nIn || 1;
    C0 /= nIn || 1;
    // (where the peak is round the middle of the face: the teeth run up the front edge of the V to it)
    const PK = PEAKS[side < 0 ? 0 : 1];
    const phiPeak = Math.atan2(F.c[0] * PK[0] + F.c[1] * (PK[1] - Y0) + F.c[2] * (PK[2] - ZP) - C0, F.b[0] * PK[0] + F.b[1] * (PK[1] - Y0) + F.b[2] * (PK[2] - ZP) - B0);
    for (const row of [0, 1]) {
      let phi = -1.5 + h3(row, side + 2, 0, 190) * 0.1;
      let i = 0;
      while (phi < phiPeak - (row ? 0.14 : 0.02)) {
        const cb = Math.cos(phi);
        const cc = Math.sin(phi);
        // (out along the face from its middle to the jaw's outside)
        let r = 10;
        while (r < 360) {
          const q = on(B0 + cb * r, C0 + cc * r, 1);
          if (fleshAt(side, q[0], q[1], q[2], null) > 0) break;
          r += 2;
        }
        const seed = side * 1000 + row * 100 + i;
        // (spaced by how far out the rim is, so that they stand as thick along it everywhere; the front row the sparser and bigger)
        const step = ((row ? 13 : 17) / Math.max(40, r)) * (0.7 + 0.6 * h3(seed, 0, 0, 191));
        phi += step;
        i++;
        const depth = row ? 26 : 10;
        const root = on(B0 + cb * (r - depth), C0 + cc * (r - depth), 1);
        if (root[2] < 6) continue;
        if (row === 0) rim.push(on(B0 + cb * (r - 3), C0 + cc * (r - 3), 0));
        if (row === 1 && h3(seed, 9, 0, 199) < 0.35) continue;
        const long = row === 0 && h3(seed, 1, 0, 192) < 0.26;
        const broken = row === 0 && !long && h3(seed, 2, 0, 193) < 0.12;
        // (smaller toward the peak)
        const up = 1 - 0.5 * sm01(0.45, 1, root[2] / PK[2]);
        const len = (row ? 12 + 12 * h3(seed, 3, 0, 194) : long ? 44 + 18 * h3(seed, 3, 0, 194) : 18 + 20 * h3(seed, 4, 0, 195)) * up;
        const rad = (row ? 3.2 + 1.4 * h3(seed, 5, 0, 196) : long ? 7.4 : 4.6 + 2.6 * h3(seed, 6, 0, 197)) * (0.4 + 0.6 * up);
        // (across the V at the other jaw, a little toward you and crooked; hooked back toward his throat, the middle of the face)
        const tilt = (h3(seed, 7, 0, 198) - 0.5) * 0.7;
        const dir = [-F.n[0] + F.b[0] * (0.25 + tilt * 0.4) + F.c[0] * tilt, -F.n[1] + F.b[1] * (0.25 + tilt * 0.4) + F.c[1] * tilt, -F.n[2] + F.b[2] * (0.25 + tilt * 0.4) + F.c[2] * tilt];
        const dl = Math.hypot(dir[0], dir[1], dir[2]);
        const bend = [-F.n[0] * 0.1 - (F.b[0] * cb + F.c[0] * cc) * 0.9, -F.n[1] * 0.1 - (F.b[1] * cb + F.c[1] * cc) * 0.9, -F.n[2] * 0.1 - (F.b[2] * cb + F.c[2] * cc) * 0.9];
        const T = toothOf(root, [dir[0] / dl, dir[1] / dl, dir[2] / dl], len, rad, bend, broken);
        // (never through his tongue)
        if (tongueGap(T.p[4], T.p[5], T.p[6]) < T.p[7] + 5 || tongueGap(T.p[8], T.p[9], T.p[10]) < 6) continue;
        list.push(T);
      }
    }
  }
  PLACED = { drips, gobs, splashes, teeth, rims, dripAir };
  return PLACED;
}

/** HIS TONGUE, as supple as a tentacle, the eye on its tip: out of his gullet at the bottom of the V and up in a long S, towering
 *  over his jaws, the eye on its tip the highest of all of him. Its spine (x, y, z, radius); the eye's middle at its end. */
export const TONGUE_RISEN: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -52, 28, 21], [0, -30, 24, 25], [3, -6, 32, 27], [10, 12, 54, 26], [30, 22, 84, 24], [46, 30, 114, 22], [36, 36, 142, 20],
  [4, 40, 160, 19], [-30, 42, 174, 18], [-50, 44, 188, 17], [-44, 45, 200, 17], [-26, 46, 208, 18], [-10, 46, 212, 20],
];
export const EYE_RISEN: readonly [number, number, number] = [-6, 46, 224];
/** Under the water (phase 1): his tongue out of the V and reared forward in the water before him, the eye on it looking up at you
 *  between his two arms, all of it under the water. */
export const TONGUE_UNDER: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -52, 28, 19], [0, -32, 24, 22], [2, -6, 24, 24], [0, 26, 28, 23], [-6, 66, 38, 22], [-12, 106, 50, 21], [-10, 146, 64, 19],
  [0, 184, 78, 18], [8, 208, 90, 17], [6, 222, 98, 16], [0, 230, 102, 16], [-2, 234, 106, 17], [-2, 236, 108, 19],
];
export const EYE_UNDER: readonly [number, number, number] = [-2, 240, 120];

/** The way he looks at you (toward the camera, a little down at the hero). */
export const GAZE_AT_YOU: readonly [number, number, number] = [0.05, 0.95, 0.22];

// =============================================================================================
// WHAT RUNS ON HIM WHILE HE MOVES (a frame of a move: art/eye_moves.ts)

/** How far each point of his tongue's spine (TONGUE_RISEN's) may weave from its rest as he stands (his lengths): little at its root,
 *  most at the eye. art/eye_moves.ts weaves it within these; his spittle is strung only clear of all of it. */
export const TONGUE_WEAVE: readonly number[] = [0, 2, 4, 6, 8, 11, 15, 21, 28, 36, 42, 46, 48];
/** His tongue woven (art/eye_moves.ts): a wave running up it, `k` of TONGUE_WEAVE at each point; each a loop's round (13 points, x y z r). */
export function weaveTongue(base: ReadonlyArray<readonly number[]>, t: number, k: number): number[][] {
  const ph = (Math.PI * 2 * t) / EYE_LOOP;
  return base.map((q, i) => {
    const A = TONGUE_WEAVE[i] * k;
    const dx = A * (0.74 * Math.sin(ph - 0.62 * i) + 0.26 * Math.sin(2 * ph + 1.1 - 0.4 * i));
    const dy = A * 0.32 * Math.sin(ph + 0.8 - 0.5 * i);
    const dz = A * 0.3 * Math.sin(2 * ph + 0.3 - 0.45 * i);
    return [q[0] + dx, q[1] + dy, q[2] + dz, q[3]];
  });
}
/** Gravity (his lengths a second, a second): a tile is 39 of his lengths. */
export const FALL_G = 420;

/** A strand of his spittle (or, at his entrance, of his flesh): which rim points of his left and right jaws it hangs between, how
 *  far back into the V each end is, how thick, how much it sags at rest, its round. */
interface Spit {
  a: number;
  b: number;
  dyA: number;
  dyB: number;
  r: number;
  sag: number;
  span0: number;
  seed: number;
  ph: number;
  u: number;
  flesh: boolean;
  /** Only at his entrance: a string across his seam as he tears open (it snaps and drips away for good). */
  tear: boolean;
  /** Strung from his tongue (the point `tg` of its spine) to a rim point (`b`) of the jaw on `side`: stretched as his tongue weaves. */
  tg?: number;
  side?: number;
}
/** How long his spittle's round is (seconds): it snaps and knits again twice in his loop. */
export const SPIT_ROUND = EYE_LOOP / 2;
let SPITS: Spit[] | null = null;
/** His spittle (strung across the V, clear of all his tongue may weave through) and the strings across his seam at his entrance. */
function spitList(): Spit[] {
  if (SPITS) return SPITS;
  const [RL, RR] = placed().rims;
  const out: Spit[] = [];
  // (clear of his tongue wherever it weaves as he stands: its spine sampled through his loop, and its eye's bulb)
  const TS: number[][][] = [];
  for (let n = 0; n < 45; n++) TS.push(weaveTongue(TONGUE_RISEN, (n / 45) * EYE_LOOP, 1));
  const TUBES = TS.map((W) => armOf({ path: W, r: 30, belly: [0, 0, -1], seed: 9 }, 120, 30, false));
  const clearOfTongue = (q: readonly number[]): boolean => {
    for (const T of TS) {
      for (let k = 0; k + 1 < T.length; k++) {
        if (cone(q[0], q[1], q[2], T[k][0], T[k][1], T[k][2], T[k + 1][0], T[k + 1][1], T[k + 1][2], T[k][3] + 5, T[k + 1][3] + 5) < q[3]) return false;
      }
      const e = T[T.length - 1];
      if (Math.hypot((q[0] - e[0]) / (COLOSSUS.eyeW + 14), (q[1] - e[1]) / (COLOSSUS.eyeD + 10), (q[2] - e[2] - 12) / (COLOSSUS.eyeH + 12)) < 1) return false;
    }
    return true;
  };
  for (let n = 0; n < RL.length * 3 && out.length < 9; n++) {
    // (each rim point of his left jaw tried against three heights on his right)
    const i = n % RL.length;
    const try3 = Math.floor(n / RL.length);
    const a = RL[i];
    if (a[2] < 12 || a[2] > 136) continue;
    if (out.some((q) => q.a === i)) continue;
    const want = a[2] + (h3(i, 1, try3, 281) - 0.5) * 60;
    let bi = 0;
    for (let j = 0; j < RR.length; j++) if (Math.abs(RR[j][2] - want) < Math.abs(RR[bi][2] - want)) bi = j;
    const b = RR[bi];
    // (on the wet lip at the edge of each face, or a little back into the V)
    const dyA = 3 - 16 * h3(i, 3, try3, 283);
    const dyB = 3 - 16 * h3(i, 4, try3, 284);
    const A = [a[0], a[1] + dyA, a[2]];
    const B = [b[0], b[1] + dyB, b[2]];
    const span0 = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
    const r = 0.8 + 1.0 * h3(i, 5, 0, 285);
    const sag = 0.08 + 0.34 * h3(i, 8, 0, 286) ** 1.3;
    // (clear of all his tongue may weave through, sagging as much as it ever does, and its halves hanging)
    const pts = sagging(A, B, span0 * sag * 1.3, r, 0, 12);
    if (!pts.every((q) => clearOfTongue(q) && clearOfTongue([q[0], q[1], q[2] - span0 * 0.25, q[3]]))) continue;
    out.push({ a: i, b: bi, dyA, dyB, r, sag, span0, seed: 40 + i, ph: h3(i, 9, 0, 287), u: h3(i, 10, 0, 288), flesh: false, tear: false });
  }
  // (strung from his tongue's lower body to the nearest teeth, left and right, stretching as it weaves)
  // (only those that never pass through his tongue as it weaves, but where it holds them)
  for (const [tg, side] of [[2, -1], [2, 1], [3, -1], [3, 1], [4, -1], [4, 1], [5, -1], [5, 1], [6, -1], [6, 1]] as const) {
    const T = TONGUE_RISEN[tg];
    const R = side < 0 ? RL : RR;
    let bi = 0;
    for (let j = 0; j < R.length; j++) if (Math.abs(R[j][2] - T[2] - 6) < Math.abs(R[bi][2] - T[2] - 6)) bi = j;
    const b = R[bi];
    const r0 = 0.9 + 0.7 * h3(tg, side + 2, 0, 296);
    const sag0 = 0.12 + 0.12 * h3(tg, side + 2, 1, 297);
    if (tg < 4) continue;
    const clear = TS.every((W, wi) => {
      const q = W[tg];
      const B = [b[0], b[1] - 4, b[2]];
      const dl = Math.hypot(B[0] - q[0], B[1] - q[1], B[2] - q[2]) || 1;
      const A = [q[0] + ((B[0] - q[0]) / dl) * (q[3] - 1), q[1] + ((B[1] - q[1]) / dl) * (q[3] - 1), q[2] + ((B[2] - q[2]) / dl) * (q[3] - 1)];
      // (as painted: his tongue's tube through its points, the strand sagging as much as it ever does)
      const tube = TUBES[wi];
      // (and straight, as the half it keeps when it snaps)
      const pts = [...sagging(A, B, dl * sag0 * 0.9, r0, 0, 12), ...sagging(A, B, 0, r0 * 1.2, 0, 12)];
      return pts.every((p) => {
        if (Math.hypot(p[0] - A[0], p[1] - A[1], p[2] - A[2]) < 8) return true;
        const P = tube.p;
        for (let k = 0; k + 1 < tube.n; k++) if (cone(p[0], p[1], p[2], P[k * 4], P[k * 4 + 1], P[k * 4 + 2], P[k * 4 + 4], P[k * 4 + 5], P[k * 4 + 6], P[k * 4 + 3], P[k * 4 + 7]) < p[3] + 2.5) return false;
        return true;
      });
    });
    if (!clear) continue;
    out.push({ a: -1, b: bi, dyA: 0, dyB: -4, r: r0, sag: sag0, span0: Math.hypot(b[0] - T[0], b[1] - T[1], b[2] - T[2]) - T[3], seed: 70 + tg * 3 + side, ph: h3(tg, side + 2, 2, 298), u: 0, flesh: false, tear: false, tg, side });
  }
  // (at his entrance: strings of his flesh and spittle across his seam, from low down to near his peaks, each between the points of
  // his two jaws' rims that meet across it when he is shut)
  // (dozens of them: from each rim point, two or three, back and forth across the seam's depth, some to the points beside its match)
  for (let i = 1; i < RL.length; i++) {
    const a = RL[i];
    if (a[2] < 8 || a[2] > 150) continue;
    let bi = 0;
    for (let j = 0; j < RR.length; j++) if (Math.abs(RR[j][2] - a[2]) + Math.abs(RR[j][1] - a[1]) * 0.5 < Math.abs(RR[bi][2] - a[2]) + Math.abs(RR[bi][1] - a[1]) * 0.5) bi = j;
    for (let n = 0; n < 3; n++) {
      if (n === 2 && h3(i, 0, 2, 290) > 0.5) continue;
      const bj = Math.max(0, Math.min(RR.length - 1, bi + (n === 0 ? 0 : h3(i, n, 6, 290) < 0.5 ? -1 : 1)));
      const b = RR[bj];
      const flesh = h3(i, 1, n, 291) < 0.14;
      const dy = (h3(i, 2, n, 292) - 0.6) * 18;
      out.push({ a: i, b: bj, dyA: dy, dyB: dy + (h3(i, 6, n, 292) - 0.5) * 6, r: flesh ? 1.8 + 1.4 * h3(i, 3, n, 293) : 0.8 + 1.1 * h3(i, 3, n, 293), sag: 0.12 + 0.3 * h3(i, 4, n, 294), span0: Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), seed: 90 + i * 3 + n, ph: h3(i, 7, n, 295), u: h3(i, 5, n, 295), flesh, tear: true });
    }
  }
  SPITS = out;
  return out;
}
/** Where a strand is in its round now: whole (`neck`: how far it has necked at its middle), or snapped (`half`: how long each half
 *  still is, of half its span; `fall`: how far down it has whipped); neither, gone. */
function spitState(S: Spit, an: ColossusAnim): { whole: boolean; neck: number; half: number; fall: number; age?: number } {
  const t = an.t;
  const P = SPIT_ROUND;
  const cycle = (): { whole: boolean; neck: number; half: number; fall: number } => {
    const q = t / P + S.ph;
    const p = q - Math.floor(q);
    if (p < 0.55) return { whole: true, neck: sm01(0.36, 0.55, p), half: 0, fall: 0 };
    if (p < 0.8) return { whole: false, neck: 0, half: 1 - sm01(0.55, 0.8, p), fall: sm01(0.55, 0.65, p) };
    return { whole: false, neck: 0, half: sm01(0.8, 1, p), fall: 0.3 * (1 - sm01(0.88, 1, p)) };
  };
  if (an.tore === undefined) return S.tear ? { whole: false, neck: 0, half: 0, fall: 0 } : cycle();
  const none = { whole: false, neck: 0, half: 0, fall: 0 };
  if (S.tg !== undefined) {
    // (at his entrance, his tongue's strands come only once it is out, and on their own round once `knit` has passed)
    const n0 = Math.ceil((an.knit ?? 0) / P + S.ph - 0.8 - 1e-9);
    return t < (n0 + 0.8 - S.ph) * P ? none : cycle();
  }
  // (his entrance: whole across his seam until his jaws begin to part; then, stretching as he roars them open, each snaps in its turn,
  // the flesh last; the halves whip as they break and hang off his teeth in ropes, swinging, running longer, then dripping away)
  if (S.tear) {
    const sn = an.tore + (S.flesh ? 0.08 + 0.3 * S.u : 0.03 + 0.3 * S.u);
    if (t < sn) return { whole: true, neck: sm01(sn - 0.12, sn, t), half: 0, fall: 0 };
    const age = t - sn;
    if (age > 1.6) return { whole: false, neck: 0, half: 0, fall: 0 };
    return { whole: false, neck: 0, half: (1 + 0.35 * sm01(0, 0.6, age)) * (1 - sm01(0.9, 1.6, age)), fall: sm01(0, 0.16, age), age };
  }
  const snap = an.tore + (S.flesh ? 0.04 + 0.3 * S.u : 0.02 + 0.14 * S.u);
  if (t < snap) return { whole: true, neck: sm01(snap - 0.1, snap, t), half: 0, fall: 0 };
  if (t < snap + 0.7) return { whole: false, neck: 0, half: 1 - sm01(snap, snap + 0.7, t), fall: sm01(snap, snap + 0.12, t) };
  // (his spittle across the V knits again on its own round, once `knit` has passed)
  const from = Math.max(an.knit ?? 0, snap + 0.7);
  const n = Math.ceil(from / P + S.ph - 0.8 - 1e-9);
  const first = (n + 0.8 - S.ph) * P;
  return t < first ? { whole: false, neck: 0, half: 0, fall: 0 } : cycle();
}

/**
 * THE DRIPS OFF HIS OVERHANGS, MOVING: each on its own round (one, one and a half or three seconds), running longer and its bulb
 * swelling until it lets go: the gob falls (FALL_G) and lands where it hangs over (the water, a splash; or what lies slumped there, a
 * splat), the drip springing back short. None while he is shut (nothing of him overhangs then). Where each hangs and each gob is now
 * (his space), and where gobs have hit the water (x, y, how long ago, how big).
 */
function dripsNow(an: ColossusAnim, m: [number[], number[]]): { drips: number[]; gobs: number[]; splashes: number[] } {
  const P = placed();
  const D = P.drips;
  const drips: number[] = [];
  const gobs: number[] = [];
  const splashes: number[] = [];
  const t = an.t;
  const on = sm01(0.45, 0.92, an.open);
  for (let i = 0, j = 0; i < D.length; i += 6, j++) {
    const side = D[i] < 0 ? -1 : 1;
    const top = jawToHim(m[side < 0 ? 0 : 1], [D[i], D[i + 1], D[i + 2]]);
    const len = D[i + 3];
    const r0 = D[i + 4];
    const rb = D[i + 5];
    const air = P.dripAir[j];
    const per = [1, 1.5, 3][Math.min(2, Math.floor(h3(j, 0, 0, 260) * 3))];
    const ph = h3(j, 1, 0, 261);
    const q = t / per + ph;
    const p = q - Math.floor(q);
    const L = len * (p < 0.85 ? 0.3 + 0.7 * (p / 0.85) ** 1.5 : 0.3 + 0.14 * (1 - sm01(0.85, 0.92, p)));
    const bulb = p < 0.85 ? r0 * 1.1 + (rb - r0 * 1.1) * sm01(0.15, 0.85, p) : r0 * 1.1;
    if (on > 0.02) drips.push(top[0], top[1], top[2], L * on, r0 * (0.5 + 0.5 * on), bulb * (0.5 + 0.5 * on));
    // (its gobs: let go at 0.85 of each round, falling; the last two rounds' may still be in the air)
    const n1 = Math.floor(q - 0.85);
    for (const n of [n1, n1 - 1]) {
      const tr = (n + 0.85 - ph) * per;
      const age = t - tr;
      if (age < 0) continue;
      const z0 = top[2] - len + rb * 0.4;
      const zg = z0 - 0.5 * FALL_G * age * age;
      const land = Math.sqrt((2 * Math.max(0, z0 - air - rb)) / FALL_G);
      if (age < land) {
        if (on > 0.5) gobs.push(top[0], top[1], zg, rb * 0.95, 1.4 + Math.min(1.2, (FALL_G * age) / 260));
      } else if (air < 10 && age - land < 0.6 && on > 0.5) splashes.push(top[0], top[1], age - land, rb);
    }
  }
  return { drips, gobs, splashes };
}
/** Where gobs off him have hit the water in a frame of a move (his space: x, y, how long ago in seconds, how big): for the water's
 *  splashes, painted by the pictures' tool. */
export function meltSplashes(an: ColossusAnim): number[] {
  return dripsNow(an, [swingOf(-1, an.open, an.puff), swingOf(1, an.open, an.puff)]).splashes;
}
/** While pressed, each jaw's turn alone, and how far each tooth's root has gone beyond it. */
function teethPressed(open: number, WL: Swing, WR: Swing): { rigid: [number[], number[]] | null; teethAt: [number[][], number[][]] | null } {
  if (!WL.press && !WR.press) return { rigid: null, teethAt: null };
  const P = placed();
  const rigid: [number[], number[]] = [swingOf0(-1, open), swingOf0(1, open)];
  const W = [WL, WR];
  const at = [0, 1].map((k) =>
    P.teeth[k].map((T) => {
      const R = [T.p[0], T.p[1], T.p[2]];
      const a = jawToHim(W[k].m, R);
      const b = jawToHim(rigid[k], R);
      return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }),
  ) as [number[][], number[][]];
  return { rigid, teethAt: at };
}
/** How strongly his throat's fire glows through his shut seam as he winds up (0 none: open, or not winding up). */
function shutGlow(pose: ColossusPose): number {
  const an = pose.anim;
  if (!an || !an.puff || an.open > 0.02) return 0;
  return Math.max(0, Math.min(1, ((an.glow - 1) / 1.2) * an.puff));
}
/** How strongly his fire glows through his shut seam at a point of its lips (in its jaw's own frame, `f`): brightest down the seam,
 *  fading out over its lips. */
function seamGlow(S: Scene, pose: ColossusPose, f: Found): number {
  const wk = shutGlow(pose);
  if (!wk || !S.now) return 0;
  const side = f.lx < 0 ? 0 : 1;
  const a = faceDepth(FACES[side], f.lx, f.ly, f.lz) - CRACK - S.now.gap;
  return wk * (1 - sm01(-6, 9, a)) ** 2;
}
/** The frame being painted. */
function nowOf(an: ColossusAnim): Now {
  const WL = swingFull(-1, an.open, an.puff);
  const WR = swingFull(1, an.open, an.puff);
  const mL = WL.m;
  const mR = WR.m;
  const { drips, gobs } = dripsNow(an, [mL, mR]);
  return {
    t: an.t,
    open: an.open,
    glow: an.glow,
    m: [mL, mR],
    inv: [WL.inv, WR.inv],
    kd: [WL.kd, WR.kd],
    ...teethPressed(an.open, WL, WR),
    puff: an.puff ?? 0,
    faces: [faceNow(FACES[0], WL), faceNow(FACES[1], WR)],
    gap: SHUT_GAP * sm01(0.15, 0.85, 1 - an.open),
    drips,
    gobs,
    parts: an.parts ?? 'all',
    slides: slidesAt(an.t),
  };
}

class Scene {
  readonly arms: Arm[];
  /** His tongue (a tube, no suckers), and the eye on its tip. */
  readonly tongue: Arm | null;
  readonly eyeC: [number, number, number];
  readonly drop: number;
  readonly back: number;
  readonly body: boolean;
  readonly gaze: readonly [number, number, number];
  readonly flip: number;
  /** His eye's own across and up (it lies on its side across his gaze). */
  readonly eyeA: [number, number, number];
  readonly eyeV: [number, number, number];
  /** Spittle and drool, in his own space. */
  readonly strands: Strand[] = [];
  /** Where what falls off him hits the water (x, y, size), in his own space. */
  readonly splashes: number[] = [];
  /** A frame of a move: what of him it holds, how his jaws stand, what runs on him now (null: the still). */
  readonly now: Now | null = null;
  readonly lids: number = 1;
  /** How big his eye is now (1 as drawn). */
  readonly eyeK: number = 1;
  /** Leaning (`ColossusPose.lean`): how far forward his flesh at height `z` is carried; and his distances' bound's share, leaning. */
  readonly lean: { k: number; from: number; ease: number } | null = null;
  readonly leanK: number = 1;
  leanAt(z: number): number {
    const L = this.lean;
    if (!L) return 0;
    const u = z - L.from;
    if (u <= 0) return 0;
    return L.k * (u < L.ease ? (u * u) / (2 * L.ease) : u - L.ease / 2);
  }
  constructor(pose: ColossusPose) {
    this.arms = pose.arms.map((a) => {
      const A = armOf(a);
      if (pose.anim) A.flex = true;
      return A;
    });
    this.drop = pose.drop;
    this.back = pose.back ?? 0;
    this.body = pose.body;
    if (pose.lean && pose.lean.k) {
      this.lean = pose.lean;
      this.leanK = 1 / Math.hypot(1, pose.lean.k);
    }
    const an = pose.anim;
    if (an) {
      this.now = nowOf(an);
      NOW = this.now;
      this.lids = an.lids;
      this.eyeK = an.swell ?? 1;
    } else NOW = null;
    const g = an ? an.gaze : pose.gaze;
    const gl = Math.hypot(g[0], g[1], g[2]) || 1;
    this.gaze = [g[0] / gl, g[1] / gl, g[2] / gl];
    this.flip = pose.view === 'back' ? -1 : 1;
    {
      const G = this.gaze;
      const al = Math.hypot(G[1], G[0]) || 1;
      const A: [number, number, number] = [G[1] / al, -G[0] / al, 0];
      let V: [number, number, number] = [A[1] * G[2] - A[2] * G[1], A[2] * G[0] - A[0] * G[2], A[0] * G[1] - A[1] * G[0]];
      if (V[2] < 0) V = [-V[0], -V[1], -V[2]];
      const ro = an?.roll ?? 0;
      if (ro) {
        const c = Math.cos(ro);
        const s = Math.sin(ro);
        const A2: [number, number, number] = [A[0] * c + V[0] * s, A[1] * c + V[1] * s, A[2] * c + V[2] * s];
        V = [V[0] * c - A[0] * s, V[1] * c - A[1] * s, V[2] * c - A[2] * s];
        this.eyeA = A2;
      } else this.eyeA = A;
      this.eyeV = V;
    }
    const path = an ? an.tongue : pose.tongue === 'under' ? TONGUE_UNDER : TONGUE_RISEN;
    const e = an ? an.eye : pose.tongue === 'under' ? EYE_UNDER : EYE_RISEN;
    this.eyeC = [e[0], e[1], e[2]];
    this.tongue = pose.body && path && (!this.now || this.now.parts === 'tongue' || this.now.parts === 'all') ? armOf({ path, r: 30, belly: [0, 0, -1], seed: 9 }, 120, 30, false) : null;
    if (!pose.body) {
      // (a tentacle alone, moving: slime dripping off it)
      if (an) for (const A of this.arms) this.armDrips(A, an.t);
      return;
    }
    if (this.now) {
      if (this.now.parts === 'spit' || this.now.parts === 'all') this.spittle(an as ColossusAnim);
      return;
    }
    const P = placed();
    // SPITTLE strung across the V between his jaws' inner edges, here and there, at every height and slant, sagging each its own way,
    // some snapped and hanging; never through his tongue
    const [RL, RR] = P.rims;
    let made = 0;
    for (let i = 0; i < RL.length && made < 9; i++) {
      const a = RL[i];
      if (a[2] < 18 || a[2] > 120 || h3(i, 0, 0, 210) > 0.42) continue;
      const want = a[2] + (h3(i, 1, 0, 211) - 0.5) * 70;
      let b = RR[0];
      for (const q of RR) if (Math.abs(q[2] - want) < Math.abs(b[2] - want)) b = q;
      // (a little back into the V, or out toward you)
      const dy = -6 - 46 * h3(i, 2, 0, 212);
      const A2 = [a[0], a[1] + dy * (0.5 + h3(i, 3, 0, 213)), a[2]];
      const B2 = [b[0], b[1] + dy * (0.5 + h3(i, 4, 0, 214)), b[2]];
      const span = Math.hypot(B2[0] - A2[0], B2[1] - A2[1], B2[2] - A2[2]);
      const r = 1.1 + 1.4 * h3(i, 5, 0, 215);
      let pts: number[][];
      if (h3(i, 6, 0, 216) < 0.3) {
        // (snapped: hanging from one jaw, curling down)
        const from = h3(i, 7, 0, 217) < 0.5 ? A2 : B2;
        const sgn = from === A2 ? 1 : -1;
        const to = [from[0] + sgn * span * (0.1 + 0.15 * h3(i, 9, 0, 209)), from[1], from[2] - span * (0.2 + 0.25 * h3(i, 10, 0, 208))];
        pts = sagging(from, to, -span * 0.06, r, 40 + i, 8);
      } else pts = sagging(A2, B2, span * (0.06 + 0.3 * h3(i, 8, 0, 218) ** 1.5), r, 40 + i);
      if (this.tongue && pts.some((q) => this.armAt(200, q[0], q[1], q[2], null, this.tongue as Arm, true) < 3)) continue;
      this.strands.push(strandOf(pts));
      made++;
    }
    // drool in ropes off his jaws' low front edges, into the water
    for (const [s, R] of [[-1, RL], [1, RR]] as const) {
      let n = 0;
      for (let i = 0; i < R.length && n < 2; i++) {
        const q = R[i];
        if (q[2] < 26 || q[2] > 70 || h3(i, s + 3, 0, 219) > 0.4) continue;
        this.drool(q[0] - s * 3, q[1] + 2, q[2], 3.2, s * 10 + n);
        n++;
      }
    }
    for (let i = 0; i < P.splashes.length; i++) this.splashes.push(P.splashes[i]);
  }

  /**
   * SLIME DRIPPING OFF A TENTACLE (a tentacle alone, moving): from points along its underside where it hangs over (not where it runs
   * upright: there the slime runs down it), a drip of slime running longer, its bulb swelling, letting go and falling (a gob, drawn
   * out above as it falls), each on its own round in its loop (`ARM_LOOP`), the drip springing back short. Never below what is under
   * it (the water and the stone at their height).
   */
  armDrips(A: Arm, t: number): void {
    const P = A.p;
    const In = A.inner;
    const N = A.n;
    for (let d = 0; d < 7; d++) {
      const u = 0.28 + 0.09 * d + 0.03 * h3(d, A.seed, 0, 230);
      const k = Math.min(N - 2, Math.round(u * (N - 1)));
      const r = P[k * 4 + 3];
      if (r < 3) continue;
      const tx = P[k * 4 + 4] - P[k * 4];
      const ty = P[k * 4 + 5] - P[k * 4 + 1];
      const tz = P[k * 4 + 6] - P[k * 4 + 2];
      const tl = Math.hypot(tx, ty, tz) || 1;
      // (hanging over: its way along it not too steep)
      if (Math.abs(tz / tl) > 0.72) continue;
      // (its lowest point round it: straight down, off the way along it)
      let nx = -(tz / tl) * (tx / tl);
      let ny = -(tz / tl) * (ty / tl);
      let nz = -1 + (tz / tl) * (tz / tl);
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;
      // (its underside, its suckers' side, drips most: a little round toward it)
      const bx = P[k * 4] + nx * (r - 0.6) + In[k * 3] * 0.1;
      const by = P[k * 4 + 1] + ny * (r - 0.6) + In[k * 3 + 1] * 0.1;
      const bz = P[k * 4 + 2] + nz * (r - 0.6);
      if (bz < 14) continue;
      const room = bz - 2;
      const per = h3(d, A.seed, 1, 231) < 0.5 ? ARM_LOOP : ARM_LOOP / 2;
      const q = t / per + h3(d, A.seed, 2, 232);
      const p = q - Math.floor(q);
      const len = Math.min(room - 3, (8 + 18 * h3(d, A.seed, 3, 233)) * (p < 0.82 ? 0.25 + 0.75 * (p / 0.82) ** 1.4 : 0.25));
      const rb = 1.3 + 1.4 * h3(d, A.seed, 4, 234) * (p < 0.82 ? 0.5 + 0.5 * p / 0.82 : 0.5);
      const pts: number[][] = [];
      for (let i = 0; i <= 5; i++) {
        const v = i / 5;
        pts.push([bx, by, bz - len * v, i === 5 ? rb : 1.1 + 0.5 * (1 - v)]);
      }
      this.strands.push(strandOf(pts));
      // (let go: the gob falling, drawn out above it)
      if (p >= 0.82) {
        const age = (p - 0.82) * per;
        const z0 = bz - len - age * age * 0.5 * FALL_G;
        if (z0 > 2) this.strands.push(strandOf([[bx, by, z0 + rb * 2.2, 0.6], [bx, by, z0, rb]]));
      }
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

  /**
   * WHILE HE MOVES, HIS SPITTLE: strung across the V between his jaws' inner edges (where his jaws stand now), each strand on its own
   * round (`SPIT.per`): sagging, stretched thinner as his jaws breathe open, necking at its middle and SNAPPING, its two halves
   * whipping back and hanging off each jaw, dripping, running shorter; then knitting across again. Never where his tongue weaves.
   * At his entrance (`tore`): while he is shut they bridge his seam, with strings of his flesh among them; as his jaws tear apart they
   * stretch and snap one after another, the halves hanging and dripping away; his spittle knits across the V again only after `knit`.
   * Drool in ropes off his jaws' low front edges into the water, swaying.
   */
  spittle(an: ColossusAnim): void {
    const N = this.now as Now;
    const t = an.t;
    const [RL, RR] = placed().rims;
    const toHim = (side: number, q: readonly number[]): [number, number, number] => {
      const F = FACES[side < 0 ? 0 : 1];
      // (the rim moves in with its face as it shuts: SHUT_GAP)
      return jawToHim(N.m[side < 0 ? 0 : 1], [q[0] + F.n[0] * N.gap, q[1] + F.n[1] * N.gap, q[2] + F.n[2] * N.gap]);
    };
    for (const S of spitList()) {
      let A: [number, number, number];
      let B: [number, number, number];
      if (S.tg !== undefined) {
        // (from his tongue, where it is now, to the rim of the jaw beside it; none while his tongue is drawn in)
        if (!an.tongue) continue;
        const T = an.tongue[S.tg];
        B = toHim(S.side as number, (S.side as number) < 0 ? RL[S.b] : RR[S.b]);
        B[1] += S.dyB;
        const dl = Math.hypot(B[0] - T[0], B[1] - T[1], B[2] - T[2]) || 1;
        const rr = T[3] - 1;
        A = [T[0] + ((B[0] - T[0]) / dl) * rr, T[1] + ((B[1] - T[1]) / dl) * rr, T[2] + ((B[2] - T[2]) / dl) * rr];
      } else {
        A = toHim(-1, RL[S.a]);
        B = toHim(1, RR[S.b]);
        A[1] += S.dyA;
        B[1] += S.dyB;
      }
      const st = spitState(S, an);
      const span = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
      const stretch = span / S.span0;
      if (st.whole) {
        // (the more it is stretched, the less it sags and the thinner it is; necking at its middle before it snaps; one across his seam
        // as he roars open, slack and drooping, stretching longer and thinner, sagging less as it necks)
        const tearing = S.tear && an.tore !== undefined;
        const sag = tearing ? span * S.sag * 0.55 * (1 - 0.7 * st.neck) * (S.flesh ? 0.6 : 1) : S.span0 * S.sag * Math.max(0.12, 1.25 - 0.6 * stretch) * (S.flesh ? 0.4 : 1);
        const r = tearing ? S.r * Math.max(0.4, 1 / Math.sqrt(Math.max(1, stretch / 3))) : S.r / Math.sqrt(Math.max(0.6, stretch));
        const pts = sagging(A, B, Math.min(sag, span * 0.6), r, S.seed, 12);
        if (st.neck > 0) for (let i = 1; i < pts.length - 1; i++) pts[i][3] *= 1 - 0.72 * st.neck * Math.sin((i / (pts.length - 1)) * Math.PI) ** 6;
        this.strands.push({ ...strandOf(pts), flesh: S.flesh, held: S.tg !== undefined });
      } else if (st.half > 0) {
        // (snapped: a half off each jaw, whipped back toward its jaw and hanging, dripping, a bead at its end)
        for (const [P0, P1] of [[A, B], [B, A]] as const) {
          // (the half his tongue holds springs back onto it, short, not hanging down across it)
          const onTongue = S.tg !== undefined && P0 === A;
          const L = (span / 2) * st.half * (onTongue ? 0.45 : 1);
          const fall = onTongue ? 0 : st.fall;
          const dx = (P1[0] - P0[0]) / (span || 1);
          const dy = (P1[1] - P0[1]) / (span || 1);
          const dz = (P1[2] - P0[2]) / (span || 1);
          const pts: number[][] = [];
          // (a string across his seam: whipping as it breaks, a wave running down it and dying; then a rope off his teeth, swinging)
          const age = st.age ?? -1;
          const wl = Math.hypot(dx, dy) || 1;
          const px = -dy / wl;
          const py = dx / wl;
          for (let i = 0; i <= 8; i++) {
            const u = i / 8;
            // (out along where it ran, bending down: the further the more, and the longer since it snapped the more)
            const th = fall * (0.35 + 1.15 * u) * 1.2;
            const along = L * u;
            const c = Math.cos(Math.min(1.45, th));
            const s = Math.sin(Math.min(1.45, th));
            const bead = i === 8 ? 1.9 : 1;
            let ox = 0;
            let oy = 0;
            if (age >= 0) {
              const whip = L * 0.3 * Math.sin(u * Math.PI * 2.4 - age * 30 + S.seed) * u * Math.exp(-age * 6);
              const swing = L * u * 0.55 * Math.sin(age * 5.5 + S.seed * 1.7) * Math.exp(-age * 1.2);
              ox = px * whip + swing * (P0[0] < 0 ? -1 : 1) * 0.6;
              oy = py * whip + swing * 0.5;
            }
            pts.push([P0[0] + dx * along * c + ox, P0[1] + dy * along * c + oy, P0[2] + dz * along * c - along * s, S.r * (1 - 0.3 * u) * bead]);
          }
          this.strands.push({ ...strandOf(pts), flesh: S.flesh, held: S.tg !== undefined && P0 === A });
        }
      }
    }
    // drool in ropes off his jaws' low front edges, into the water, swaying (while he is open enough for his jaws to overhang)
    // (at his entrance they run down out of him to the water after his jaws tear apart)
    const grow = an.tore !== undefined ? sm01(an.tore, an.tore + 0.9, t) : 1;
    if (N.open > 0.4 && grow > 0.02) {
      for (const [s, R] of [[-1, RL], [1, RR]] as const) {
        let n = 0;
        for (let i = 0; i < R.length && n < 2; i++) {
          const q = R[i];
          if (q[2] < 26 || q[2] > 70 || h3(i, s + 3, 0, 219) > 0.4) continue;
          const p = toHim(s, q);
          const seed = s * 10 + n;
          const pts: number[][] = [];
          const m = Math.max(3, Math.round(p[2] / 8));
          const ph = (t / (EYE_LOOP / 2) + h3(seed, 1, 0, 221)) * Math.PI * 2;
          for (let k = 0; k <= m; k++) {
            const u = k / m;
            const sway = (Math.sin(u * 3.1 + seed) * 2.5 + Math.sin(ph - u * 2.2) * 3.2) * u;
            const bead = k > 0 && k < m && h3(k, seed, 0, 220) < 0.18 ? 1.6 : 1;
            pts.push([p[0] - s * 3 + sway, p[1] + 2 + u * 3, p[2] - u * (p[2] + 2) * grow, 3.2 * (1 - 0.45 * Math.sin(u * Math.PI)) * (k === m && grow < 1 ? 1.7 : bead)]);
          }
          this.strands.push(strandOf(pts));
          n++;
        }
      }
    }
  }

  /** ONE JAW (`side` -1 his left, 1 his right), at a point of his own space (pressed, its distance shortened to stay under the truth). */
  halfAt(side: number, x: number, y: number, z: number, f: Found | null, exact = false, nobound = false): number {
    const d = this.halfAt0(side, x, y, z, f, exact, nobound);
    const N = this.now;
    if (!N) return d;
    const kd = N.kd[side < 0 ? 0 : 1];
    return kd === 1 ? d : d * kd;
  }
  halfAt0(side: number, x: number, y: number, z: number, f: Found | null, exact = false, nobound = false): number {
    const J = JAW_MAKE[side < 0 ? 0 : 1];
    const Bx = J.box;
    const N = this.now;
    // (while he moves: the point in his space, and in this jaw's own frame, which swings)
    const xw = x;
    const yw = y;
    const zw = z;
    if (N) {
      WX = x;
      WY = y;
      WZ = z;
      himToJaw(N.inv[side < 0 ? 0 : 1], x, y, z);
      x = J_PT[0];
      y = J_PT[1];
      z = J_PT[2];
    }
    // (well clear of it: how far, as a bound; `exact`, no bound, for the water's rings round him)
    const X = x * side;
    const ox = Math.max(Bx[0] - X, 0, X - Bx[3]);
    const oy = Math.max(Bx[1] - y, 0, y - Bx[4]);
    const oz = Math.max(Bx[2] - z, 0, z - Bx[5]);
    let out = Math.hypot(ox, oy, oz);
    if (N) {
      // (and of what lies slumped round him at the water, which stays where it lies)
      const Xw = xw * side;
      const hb = HEAP_BOX;
      out = Math.min(out, Math.hypot(Math.max(hb[0] - Xw, 0, Xw - hb[3]), Math.max(hb[1] - yw, 0, yw - hb[4]), Math.max(hb[2] - zw, 0, zw - hb[5])));
    }
    if (out > 24 && !exact && !nobound) return out - 6;
    let h = fleshAt(side, x, y, z, f ? MELT : null);
    if (f) {
      f.mat = M_FLESH;
      f.lx = x;
      f.ly = y;
      f.lz = z;
    }
    const P = placed();
    if (h < 34 && !exact) {
      // HIS HIDE: ancient, wrinkled, lumpy; rolls of it sagging down
      const w = vn(x * 0.011, y * 0.011, z * 0.006, 11);
      const roll = Math.sin(z * 0.085 + w * 6.5 + x * 0.004);
      h -= roll * 3.2 * sm01(20, 60, z);
      h -= (vn(x * 0.024, y * 0.024, z * 0.024, 13) - 0.5) * 12;
      h -= (vn(x * 0.06, y * 0.06, z * 0.03, 14) - 0.5) * 3;
      // MELTING: where his flesh runs like wax, it is goo
      if (f && MELT[0]) f.mat = M_GOO;
      // boils and open sores; bubbles in the goo
      if (z > 20) {
        const S2 = 16;
        const ix = Math.floor(x / S2);
        const iy = Math.floor(y / S2);
        const iz = Math.floor(z / S2);
        const roll2 = h3(ix, iy, iz, 41);
        if (roll2 < 0.064) {
          const rr = Math.hypot(x - (ix + 0.3 + 0.4 * h3(ix, iy, iz, 42)) * S2, y - (iy + 0.3 + 0.4 * h3(ix, iy, iz, 43)) * S2, z - (iz + 0.3 + 0.4 * h3(ix, iy, iz, 44)) * S2);
          const bubble = roll2 < 0.05;
          const br = bubble ? 2.4 + 2 * h3(ix, iy, iz, 45) : 4.5 + 3.5 * h3(ix, iy, iz, 45);
          if (rr < br && (!bubble || MELT[0] > 0)) {
            const sore = roll2 > 0.058;
            h -= sore ? -1.4 * (1 - rr / br) : (bubble ? 1.0 : 0.8) * br * Math.sqrt(1 - (rr / br) ** 2);
            if (f && rr < br * 0.9) f.mat = bubble ? M_BUBBLE : sore ? M_SORE : M_BOIL;
          }
        }
      }
      // VEINS standing out of him, branching out from the V
      if (z > 24) {
        const vq = Math.abs(vn(x * 0.026, y * 0.026, z * 0.026, 140) - 0.5);
        const vq2 = Math.abs(vn(x * 0.06, y * 0.06, z * 0.06, 141) - 0.5);
        const near = 1 - sm01(30, 150, Math.abs(x));
        const wv = 0.002 + 0.0045 * near;
        if (vq < wv || (vq2 < wv * 0.45 && near > 0.6)) {
          h -= 1.8;
          if (f && h < 1.5) f.mat = M_VEIN;
        }
      }
      // BARNACLES crusting him at the water: he is very old
      if (z < 50 && Math.abs(x) > 30) {
        const S = 10;
        const ix = Math.floor(x / S);
        const iy = Math.floor(y / S);
        const iz = Math.floor(z / S);
        if (h3(ix, iy, iz, 31) < 0.3 - z / 170) {
          const cx = (ix + 0.25 + 0.5 * h3(ix, iy, iz, 32)) * S;
          const cy = (iy + 0.25 + 0.5 * h3(ix, iy, iz, 33)) * S;
          const cz = (iz + 0.25 + 0.5 * h3(ix, iy, iz, 34)) * S;
          const rr = Math.hypot(x - cx, y - cy, z - cz);
          if (rr < 5.5) {
            const bump = 3.4 * (1 - rr / 5.5) - (rr < 1.6 ? 2.2 : 0);
            h -= bump;
            if (f && bump > 0.6) f.mat = M_BARN;
          }
        }
      }
      // DRIPS hanging off his overhangs, swelling to a bulb (while he moves, where they hang now, straight down in his space)
      const D = N ? N.drips : P.drips;
      const qx = N ? xw : x;
      const qy = N ? yw : y;
      const qz = N ? zw : z;
      for (let i = 0; i < D.length; i += 6) {
        if ((D[i] < 0 ? -1 : 1) !== side) continue;
        const dx = qx - D[i];
        const dy = qy - D[i + 1];
        if (dx * dx + dy * dy > (D[i + 5] + 8) ** 2) continue;
        const z0 = D[i + 2];
        const len = D[i + 3];
        if (qz > z0 + 8 || qz < z0 - len - D[i + 5] * 2) continue;
        let dd = cone(qx, qy, qz, D[i], D[i + 1], z0 + 4, D[i], D[i + 1], z0 - len + D[i + 5] * 0.6, D[i + 4], D[i + 5] * 0.7);
        dd = Math.min(dd, ell(qx, qy, qz, D[i], D[i + 1], z0 - len, D[i + 5], D[i + 5], D[i + 5] * 1.25));
        if (dd < h + 4) {
          const was = h;
          h = smin(h, dd, 6);
          if (f && dd < was) f.mat = M_GOO;
        }
      }
    }
    // ITS FACE ON THE V: cut, its rim of raw gum rounded; and its hollow behind it
    const F = FACES[side < 0 ? 0 : 1];
    const a = faceDepth(F, x, y, z);
    const c = F.c[0] * x + F.c[1] * (y - Y0) + F.c[2] * (z - ZP);
    // (the raw gum lumpy and wet, never flat)
    // (while he moves: shut, the faces stand apart by SHUT_GAP, never through each other)
    const gap = N ? N.gap : 0;
    // (winding up: the lips of his seam bulging, swelling out along it)
    if (N && N.puff > 0) h -= N.puff * 7 * Math.exp(-(((a - CRACK - gap - 6) / 16) ** 2)) * sm01(4, 40, z);
    const cut = CRACK + wander(c) + gap - a - (vn(x * 0.09, y * 0.09, z * 0.09, 173) - 0.5) * 5;
    let d = smax(h, cut, 14);
    const cv = hollow(side, x, y, z, a - CRACK - gap);
    d = smax(d, -cv, 8);
    if (f) {
      if (-cv > Math.max(h, cut) - 2) f.mat = M_MAW;
      else if (cut > h - 2) f.mat = cut > h + 5 ? M_GUM : M_LIP;
    }
    if (exact) return d;
    // GOBS fallen off him, in the air below his overhangs (while he moves, falling now, in his space)
    const G = N ? N.gobs : P.gobs;
    const gx = N ? xw : x;
    const gy = N ? yw : y;
    const gz0 = N ? zw : z;
    for (let i = 0; i < G.length; i += 5) {
      if ((G[i] < 0 ? -1 : 1) !== side) continue;
      const r = G[i + 3];
      const gz = gz0 - G[i + 2];
      if (Math.abs(gz) > r * G[i + 4] + 2 || Math.abs(gx - G[i]) > r + 2 || Math.abs(gy - G[i + 1]) > r + 2) continue;
      // (a drop: round below, drawn out to a point above)
      const k = gz > 0 ? G[i + 4] : 1;
      const rr = gz > 0 ? r * (1 - 0.55 * (gz / (r * G[i + 4]))) : r;
      const gd = (Math.hypot(gx - G[i], gy - G[i + 1], gz / k) - rr) * Math.min(1, 1 / k + 0.3);
      if (gd < d) {
        d = gd;
        if (f) f.mat = M_GOB;
      }
    }
    // HIS TEETH along its inner edge (shut, moved in with its face)
    if (a < 80) {
      if (gap) {
        x -= F.n[0] * gap;
        y -= F.n[1] * gap;
        z -= F.n[2] * gap;
      }
      const TA = N && N.teethAt ? N.teethAt[side < 0 ? 0 : 1] : null;
      const MR = N && N.rigid ? N.rigid[side < 0 ? 0 : 1] : null;
      const TT = P.teeth[side < 0 ? 0 : 1];
      for (let ti = 0; ti < TT.length; ti++) {
        const T = TT[ti];
        if (TA && MR) {
          // (pressed: each tooth only turned, moved with its gum)
          const o = TA[ti];
          const a0 = xw - o[0] - PIVOT[0];
          const b0 = yw - o[1] - PIVOT[1];
          const c0 = zw - o[2] - PIVOT[2];
          x = MR[0] * a0 + MR[3] * b0 + MR[6] * c0 + PIVOT[0] - F.n[0] * gap;
          y = MR[1] * a0 + MR[4] * b0 + MR[7] * c0 + PIVOT[1] - F.n[1] * gap;
          z = MR[2] * a0 + MR[5] * b0 + MR[8] * c0 + PIVOT[2] - F.n[2] * gap;
        }
        const b = T.box;
        if (x < b[0] || y < b[1] || z < b[2] || x > b[3] || y > b[4] || z > b[5]) continue;
        const Pt = T.p;
        const a1 = cone(x, y, z, Pt[0], Pt[1], Pt[2], Pt[4], Pt[5], Pt[6], Pt[3], Pt[7]);
        const a2 = cone(x, y, z, Pt[4], Pt[5], Pt[6], Pt[8], Pt[9], Pt[10], Pt[7], Pt[11]);
        const td = Math.min(a1, a2);
        if (td < d) {
          d = td;
          if (f) {
            f.mat = M_TOOTH;
            f.broken = T.broken;
            const L1 = Math.hypot(Pt[4] - Pt[0], Pt[5] - Pt[1], Pt[6] - Pt[2]);
            const L2 = Math.hypot(Pt[8] - Pt[4], Pt[9] - Pt[5], Pt[10] - Pt[6]);
            f.toothT = a1 <= a2 ? Math.min(1, Math.hypot(x - Pt[0], y - Pt[1], z - Pt[2]) / (L1 || 1)) * (L1 / (L1 + L2)) : L1 / (L1 + L2) + Math.min(1, Math.hypot(x - Pt[4], y - Pt[5], z - Pt[6]) / (L2 || 1)) * (L2 / (L1 + L2));
          }
        }
      }
    }
    return d;
  }

  /** HIS THROAT, inside the V between his jaws: the floor of his mouth low at the water; across the back of the V a wall of wet ribbed
   *  flesh, its top sagging between his jaws; his gullet a dark hole in it going down and back, glowing deep inside. */
  coreAt(x: number, y: number, z: number, f: Found | null): number {
    let d = Infinity;
    {
      // (the back of his throat: a wall between his jaws' faces, sunk into each, its top sagging between them below their peaks)
      // (while he moves, between his jaws' faces where they stand now)
      const FS = this.now ? this.now.faces : FACES;
      const gp = this.now ? this.now.gap : 0;
      const aL = faceDepth(FS[0], x, y, z) - gp;
      const aR = faceDepth(FS[1], x, y, z) - gp;
      const top = 40 + 0.42 * Math.abs(x);
      // (its foot sloping forward low in the V, under his tongue's root, to the water at the front of his jaws: the floor of his mouth;
      // its back rounded, the back of his throat between his jaws seen from behind)
      const yF = -21 + 124 * sm01(56, -6, z);
      const back = ell(x, y, z, 0, -24, -10, 240, 40, 150);
      let w = smax(Math.max(back, y - yF), Math.max(aL, aR) - 22, 8);
      w = smax(w, z - top, 20);
      w = smax(w, -40 - z, 10);
      d = w;
    }
    if (d > 20) return d;
    const g = ell(x, y, z, 0, -40, 30, 22, 30, 22);
    d = smax(d, -g, 8);
    // (ribbed across, and lumpy)
    d -= 2.6 * Math.sin(z * 0.2 + y * 0.12 + Math.abs(x) * 0.012 + vn(x * 0.03, y * 0.03, z * 0.03, 174) * 2.5);
    d -= (vn(x * 0.05, y * 0.05, z * 0.05, 172) - 0.5) * 4;
    if (f) {
      // (inside him, wet; at its back, seen from behind, his hide)
      f.mat = y < -46 ? M_FLESH : z < 8 && y > -16 ? M_MAW : M_THROAT;
      // (deep in his gullet it glows; round its rim, faintly; and the throat round it, faintly, low down)
      f.glowK = g < 3 ? 0.4 + 0.6 * sm01(-30, -60, y) : Math.max(0.5 * sm01(22, 0, g), 0.44 * sm01(44, 0, z));
      f.lx = x;
      f.ly = y;
      f.lz = z;
    }
    return d;
  }

  /** His tongue, and the eye on its tip: an eye lying on its side, wider than tall, in a bulb of his tongue's flesh pointed at its
   *  corners like a lens, its raw lids parted in an almond round it. */
  tongueAt(x: number, y: number, z: number, f: Found | null, exact = false): number {
    const E = this.eyeC;
    const g = this.gaze;
    const A = this.eyeA;
    const V = this.eyeV;
    const qx = x - E[0];
    const qy = y - E[1];
    const qz = z - E[2];
    const W = COLOSSUS.eyeW * this.eyeK;
    const H = COLOSSUS.eyeH * this.eyeK;
    const Dp = COLOSSUS.eyeD * this.eyeK;
    const ql = Math.hypot(qx, qy, qz);
    if (ql - W - 14 > 60 && this.tongue && !exact) {
      const b = this.tongue.box;
      if (x < b[0] - 30 || y < b[1] - 30 || z < b[2] - 30 || x > b[3] + 30 || y > b[4] + 30 || z > b[5] + 30) return Math.min(ql - W - 22, Math.max(b[0] - x, x - b[3], b[1] - y, y - b[4], b[2] - z, z - b[5]));
    }
    // (in the eye's own frame: across it, out of it toward its gaze, up it)
    const u = qx * A[0] + qy * A[1] + qz * A[2];
    const w = qx * g[0] + qy * g[1] + qz * g[2];
    const v = qx * V[0] + qy * V[1] + qz * V[2];
    // his eye: a ball wider than tall (a little sunk into its bulb while its lids are shut over it)
    const lids = this.lids;
    const de = ell(u, w, v, 0, 0, 0, W, Dp, H) + (1 - lids) * 1.5;
    // the bulb of his tongue's tip round it: rounder in the middle, drawn to a point at each corner (a lens)
    const Rw = W + 6;
    const Rh = H + 6;
    const R = (Rw * Rw + Rh * Rh) / (2 * Rh);
    const K = R - Rh;
    let bulb = ell(u, w + 3, v, 0, 0, 0, W + 8, Dp + 4, H + 7);
    bulb = smax(bulb, Math.max(Math.hypot(u, w * 0.8, v + K) - R, Math.hypot(u, w * 0.8, v - K) - R), 5);
    // its lids parted in an almond in front, pointed at its corners
    let hole: number;
    let lid = Infinity;
    if (lids >= 1) hole = Math.max(Math.abs(v) - (H - 1.5) * Math.max(0, 1 - (u / (W + 2)) ** 2), -(w + 8));
    else {
      // SHUT (and opening): the same almond as when open, and in it his lids shut over the ball, bulging with it, meeting along a wet
      // crease a little below its middle; parting along it as it opens
      const al = Math.max(0, 1 - (u / (W + 2)) ** 2);
      hole = Math.max(Math.abs(v) - (H - 1.5) * al, -(w + 8));
      const vc = -0.24 * H * Math.max(0, 1 - (u / W) ** 2) * (1 - lids);
      const cv = Math.abs(v - vc);
      lid = ell(u, w, v, 0, 0, 0, W + 1.6, Dp + 1.6, H + 1.6);
      lid += 1.5 * Math.max(0, 1 - (cv / (2 * this.eyeK + 0.5)) ** 2);
      lid = Math.max(lid, (H - 1.5) * lids * al - cv);
    }
    const cup = smax(bulb, -hole, 4);
    let d = Math.min(de, cup, lid);
    let tg = Infinity;
    if (this.tongue) {
      const fT = f ? TONGUE_F : null;
      tg = this.armAt(200, x, y, z, fT, this.tongue, exact);
      d = Math.min(de, lid, smin(cup, tg, 14));
    }
    if (f) {
      if (de <= d + 0.01) f.mat = M_EYE;
      else if (lid <= d + 0.01) f.mat = M_SHUT;
      else {
        if (tg < cup) Object.assign(f, TONGUE_F);
        f.mat = cup < tg + 4 && hole < 7 && w > -12 ? M_LID : M_TONGUE;
      }
      // (all of it his, not an arm)
      f.arm = -1;
    }
    return d;
  }

  /** His spittle and drool (`exact`: no bounds, for the water's rings round him). */
  strandsAt(x: number, y: number, z: number, exact = false): number {
    let d = Infinity;
    STRAND_FLESH = false;
    for (const S of this.strands) {
      const b = S.box;
      if (!exact && (x < b[0] - 6 || y < b[1] - 6 || z < b[2] - 6 || x > b[3] + 6 || y > b[4] + 6 || z > b[5] + 6)) {
        d = Math.min(d, Math.max(b[0] - x, x - b[3], b[1] - y, y - b[4], b[2] - z, z - b[5]));
        continue;
      }
      const P = S.p;
      const was = d;
      for (let k = 0; k + 4 < P.length; k += 4) d = Math.min(d, cone(x, y, z, P[k], P[k + 1], P[k + 2], P[k + 4], P[k + 5], P[k + 6], P[k + 3], P[k + 7]));
      if (d < was) STRAND_FLESH = !!S.flesh;
    }
    return d;
  }

  /** ALL OF HIM BUT HIS ARMS: his distance at a point of his own space (before his drop), and what is nearest (`f`). While he moves,
   *  only the part of him the frame holds (his jaws, or his tongue and eye). */
  bodyAt(x: number, y: number, z: number, f: Found | null, exact = false): number {
    const N = this.now;
    const jaws = !N || N.parts === 'jaws' || N.parts === 'all';
    const spit = !N || N.parts === 'spit' || N.parts === 'all';
    const tongue = !N || ((N.parts === 'tongue' || N.parts === 'all') && this.tongue !== null);
    let d = Infinity;
    if (jaws) {
      const a = this.halfAt(-1, x, y, z, f ? F_A : null, exact);
      const b = this.halfAt(1, x, y, z, f ? F_B : null, exact);
      d = Math.min(a, b);
      if (f) Object.assign(f, a < b ? F_A : F_B);
      const c = this.coreAt(x, y, z, f ? F_C : null);
      if (c < d) {
        if (f) Object.assign(f, F_C);
        d = c;
      }
    }
    if (tongue) {
      const t = this.tongueAt(x, y, z, f ? F_T : null, exact);
      if (t < d) {
        if (f) Object.assign(f, F_T);
        d = t;
      }
    }
    if (spit) {
      const s = this.strandsAt(x, y, z, exact);
      if (s < d) {
        if (f) f.mat = STRAND_FLESH ? M_GUM : M_STRAND;
        d = s;
      }
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
        let e: number;
        const q = A.sq ? A.sq[k] + (A.sq[k + 1] - A.sq[k]) * t : 0;
        if (q !== 0) {
          // (squashed: its section an ellipse, flattened and bulging out along the stone; a bound, never more than the distance)
          const f = 1 + q;
          e = (Math.hypot(x - ax - ux * t, y - ay - uy * t, (z - az - uz * t) * f) - r * (1 + 0.55 * q)) / Math.max(1, f);
        } else e = Math.hypot(x - ax - ux * t, y - ay - uy * t, z - az - uz * t) - r;
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
      const sr0 = Math.max(1.6, r * 0.19);
      const space = sr0 * 3.4;
      for (const row of [-0.46, 0.46]) {
        const off = row > 0 ? 0.5 : 0;
        const c = Math.round(sg - off) + off;
        // (while it moves, its suckers flexing: a wave of them opening and closing down each row, `ARM_LOOP` a round)
        const sr = NOW && A.flex ? sr0 * (1 + 0.2 * Math.sin((TAU_C * NOW.t) / ARM_LOOP - c * 0.9 + (row > 0 ? 1.3 : 0))) : sr0;
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
      const out = ell(x, yb, z, 0, 0, 40, 440, 330, 300);
      if (out > 100) d = Math.min(d, out);
      else {
        // (his jaws, his tongue, his drool: his throat is inside his V; while he lies deep, his jaws whole, the rings round them smooth)
        const jaws = this.drop >= 60 ? Math.min(fleshAt(-1, x, yb, z, null), fleshAt(1, x, yb, z, null)) : Math.min(this.halfAt(-1, x, yb, z, null, true), this.halfAt(1, x, yb, z, null, true));
        d = Math.min(d, jaws, this.tongueAt(x, yb, z, null, true), this.strandsAt(x, yb, z, true));
      }
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
      const yb = y + this.back - (this.lean ? this.leanAt(z) : 0);
      // (well clear of all of him: how far, as a bound)
      const out = ell(x, yb, z, 0, 0, 60, 440, 340, 320);
      if (out > 30) d = out;
      else d = this.bodyAt(x, yb, z, f);
      if (this.lean) d *= this.leanK;
    }
    for (let i = 0; i < this.arms.length; i++) {
      const a = this.armAt(i, x, y, Z, f ? ARM_F : null);
      if (a < d) {
        if (f) Object.assign(f, ARM_F);
        d = a;
      }
    }
    // (a tentacle alone: the slime dripping off it)
    if (!this.body && this.strands.length) {
      const s = this.strandsAt(x, y, Z);
      if (s < d) {
        if (f) {
          f.mat = M_STRAND;
          f.arm = -1;
        }
        d = s;
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
let STRAND_FLESH = false;
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
  /** A layer of a move: nothing of the water painted, nor the pink edge (the pictures' tool lays the layers together over the water). */
  raw?: boolean;
  /** A layer's box (i0, j0, i1, j1 on its picture): outside it there is nothing of him, so no ray is cast there (a tentacle's layer, its
   *  box worked out from its tube, its drips and what falls off it). */
  box?: readonly [number, number, number, number];
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
  try {
    return paint0(pose, fr);
  } finally {
    NOW = null;
  }
}
function paint0(pose: ColossusPose, fr: Frame): ColossusPicture {
  const S = new Scene(pose);
  const raw = !!fr.raw;
  const glowK = S.now ? S.now.glow : 1;
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
  /** Fire (seen deep through the water); and while he moves, which bit of him each pixel is (for what hangs off him to stay put). */
  const fire = new Uint8Array(w * h);
  const cell = new Int32Array(w * h);
  const D = px.d;
  const f = new Found0();
  const T0 = 760;
  const eps = 0.6;
  const E = S.eyeC;
  const box = raw ? fr.box : undefined;
  // (turned, `pose.orient`: from the world into his own space, and back)
  const OX = pose.orient?.x ?? [1, 0, 0];
  const OY = pose.orient?.y ?? [0, 1, 0];
  const OZ = pose.orient?.z ?? [0, 0, 1];
  const toHis = (v: readonly number[]): [number, number, number] => [v[0] * OX[0] + v[1] * OX[1] + v[2] * OX[2], v[0] * OY[0] + v[1] * OY[1] + v[2] * OY[2], v[0] * OZ[0] + v[1] * OZ[1] + v[2] * OZ[2]];
  const toWorld = (a: number, b: number, c: number): [number, number, number] => [a * OX[0] + b * OY[0] + c * OZ[0], a * OX[1] + b * OY[1] + c * OZ[1], a * OX[2] + b * OY[2] + c * OZ[2]];
  const LF = toHis(L_FIG);
  const EV = toHis(EYE_V);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (box && (i < box[0] || i >= box[2] || j < box[1] || j >= box[3])) continue;
      const X = (i + 0.5 - ax) / (SEEN * zoom);
      const sd = (j + 0.5 - ay) / (SEEN * zoom);
      // the ray: from in front of him, toward the plane of the picture and on through it (in his own space)
      const R0 = toHis([X, sd * SIN30 + EYE_V[1] * T0, -sd * COS30 + EYE_V[2] * T0]);
      let x = R0[0];
      let y = R0[1];
      let z = R0[2];
      // (how high over the water the ray is)
      let zw = -sd * COS30 + EYE_V[2] * T0;
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
        x -= EV[0] * step;
        y -= EV[1] * step;
        z -= EV[2] * step;
        zw -= EYE_V[2] * step;
        if (zw < (raw ? -120 : -360)) break;
      }
      const k = j * w + i;
      // where the ray meets the water
      const wy = sd * SIN30 + (sd * COS30 / EYE_V[2]) * EYE_V[1];
      if (raw && !hit) continue;
      if (!raw && (!hit || z < -0.5)) {
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
      let lit = Nx * LF[0] + Ny * LF[1] + Nz * LF[2];
      // (the light's shadow: a short march toward it; his eye, wet and burning, is never lost in it)
      if (lit > -0.1 && f.mat !== M_EYE) {
        let st = 3;
        const sx = x + Nx * 2;
        const sy = y + Ny * 2;
        const sz = z + Nz * 2;
        let shade = 1;
        for (let n = 0; n < 28 && st < 170; n++) {
          const q = S.at(sx + LF[0] * st, sy + LF[1] * st, sz + LF[2] * st, null);
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
      const rl = 2 * (Nx * LF[0] + Ny * LF[1] + Nz * LF[2]);
      const rx = rl * Nx - LF[0];
      const ry = rl * Ny - LF[1];
      const rz = rl * Nz - LF[2];
      const spec = Math.max(0, rx * EV[0] + ry * EV[1] + rz * EV[2]);
      // his own space at the point (for what grows where)
      const fx = x * S.flip;
      const fz = z + (f.arm < 0 && S.body ? S.drop : 0);
      const fy = y * S.flip + (f.arm < 0 && S.body ? S.back - S.leanAt(fz) : 0);
      const mat = f.mat;
      const onHead = f.arm < 0 && mat !== M_EYE && mat !== M_STRAND;
      // (into the dark toward his edges: the further from the middle of him, the darker)
      const far = S.body && pose.view === 'front' ? sm01(170, 380, Math.hypot(fx, fz - 50)) : sm01(200, 420, Math.hypot(x, z - 80));
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
        // HIS EYE: lying on its side, wider than tall; yellowed and bloodshot, his iris a round of the enemy's fire burning from pink
        // at its rim to gold at a tall black slit, looking where his gaze is
        const ex = fx - E[0];
        const ey = fy - E[1];
        const ez = fz - E[2];
        const g = S.gaze;
        const EA = S.eyeA;
        const EV = S.eyeV;
        const au = ex * EA[0] + ey * EA[1] + ez * EA[2];
        const aw = ex * g[0] + ey * g[1] + ez * g[2];
        const av = ex * EV[0] + ey * EV[1] + ez * EV[2];
        const rI = Math.hypot(au, av);
        const IR = COLOSSUS.eyeH * S.eyeK - 1;
        if (rI < IR && aw > 0) {
          const slit = 4.4 * Math.sqrt(Math.max(0, 1 - (av / (IR - 1)) ** 2));
          const stria = vn(Math.atan2(av, au) * 7, rI * 0.22, 0, 61);
          if (Math.abs(au) < slit) col = PUPIL;
          else if (Math.abs(au) < slit + 1.4) col = CO_IRIS[0];
          else {
            const band = rI > IR - 2.2 ? 0 : rI > IR - 6 ? 1 : rI > IR - 11 ? 2 : rI > 6.5 ? 3 : 4;
            const b2 = Math.max(0, Math.min(4, band + (stria > 0.68 ? 1 : stria < 0.3 ? -1 : 0)));
            col = CO_IRIS[Math.max(0, b2 - (lit < 0.05 ? 1 : 0))];
          }
          glow = true;
          gloss = 1.2;
        } else {
          // the white, veined; redder toward its corners and the lids round it
          const k = Math.hypot(au / (COLOSSUS.eyeW * S.eyeK), av / (COLOSSUS.eyeH * S.eyeK));
          const vein = Math.abs(vn(au * 0.19, av * 0.19, aw * 0.19, 62) - 0.5) < 0.03 + k * 0.05 || Math.abs(vn(au * 0.4, av * 0.4, aw * 0.4, 63) - 0.5) < 0.018 + k * 0.03;
          const ramp0 = vein ? CO_VEIN : k > 0.66 && hp(i, j, 64) < (k - 0.66) / 0.4 ? CO_VEIN : CO_SCLERA;
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
        if (ed < COLOSSUS.eyeW * S.eyeK + 10) {
          const vq = Math.abs(vn(fx * 0.09, fy * 0.09, fz * 0.09, 66) - 0.5);
          const vq2 = Math.abs(vn(fx * 0.2, fy * 0.2, fz * 0.2, 67) - 0.5);
          if (vq < 0.035 || vq2 < 0.02) col = CO_VEIN[Math.max(0, Math.min(2, tn - 1))];
        }
        gloss = 1.8;
      } else if (mat === M_LID) {
        // the raw rim of his tongue's tip, cupped round his eye
        col = CO_RAW[Math.max(0, Math.min(4, tn))];
        gloss = 1.3;
      } else if (mat === M_SHUT) {
        // HIS LIDS SHUT over his eye: thin wet skin over the ball, paler than the raw rim of the almond round it, bulging with it, veined;
        // the fold of the upper lid arched over the ball; where they meet, a wet dark crease dipping to its middle; his burning iris
        // glowing through the thin skin, a round of pink fire under the lids, and leaking pink and gold through the crease over it
        const ex = fx - E[0];
        const ey = fy - E[1];
        const ez = fz - E[2];
        const EA = S.eyeA;
        const EV = S.eyeV;
        const au = ex * EA[0] + ey * EA[1] + ez * EA[2];
        const av = ex * EV[0] + ey * EV[1] + ez * EV[2];
        const Wk = COLOSSUS.eyeW * S.eyeK;
        const Hk = COLOSSUS.eyeH * S.eyeK;
        const lids = S.lids;
        const across = Math.max(0, 1 - (au / Wk) ** 2);
        const vc = -0.24 * Hk * across * (1 - lids);
        const cv = av - vc;
        const up = 0.62 * (Hk - vc) * Math.pow(across, 0.7);
        const lo = -0.5 * (Hk + vc) * Math.pow(across, 0.7);
        const vein = Math.abs(vn(au * 0.15, av * 0.15, fz * 0.05, 68) - 0.5) < 0.02 + 0.02 * (1 - across) || Math.abs(vn(au * 0.33, av * 0.33, fz * 0.1, 69) - 0.5) < 0.013;
        const cw = 0.9 + 0.8 * S.eyeK;
        const tl = Math.max(0, Math.min(4, tn));
        // (the round of his iris under the lids: how near its middle)
        const IRk = COLOSSUS.eyeH * S.eyeK - 1;
        const ri = Math.hypot(au, av) / IRk;
        const through = ri < 1 ? (1 - ri) ** 0.8 : 0;
        if (Math.abs(cv) < cw * 0.6 && ri < 1.15 && vn(au * 0.14, 0, 0, 71) > 0.2 + 0.4 * ri) {
          // (his fire through the crease over his iris, in glints, gold at its middle)
          col = CO_IRIS[ri < 0.45 ? 4 : ri < 0.8 ? 3 : 2];
          glow = true;
        } else if (Math.abs(cv) < cw) col = ri < 1 ? CO_IRIS[0] : CO_RAW[0];
        else if (through > 0 && hp(i, j, 73) < 0.25 + 0.75 * through) {
          // (his iris glowing through the thin skin: pink, brighter to its middle)
          col = CO_IRIS[Math.max(0, Math.min(3, Math.floor(through * 3.2 + bayer(i, j) * 0.8 + (tl > 2 ? 0.5 : 0))))];
          glow = through > 0.35;
        }
        else if (cv > 0 && cv < cw + 1.4) col = CO_SHUTLID[Math.min(4, tl + 1)];
        else if (Math.abs(cv - up) < 0.8 * S.eyeK + 0.3 && across > 0.1) col = CO_SHUTLID[Math.max(0, tl - 2)];
        else if (Math.abs(cv - lo) < 0.6 * S.eyeK + 0.2 && across > 0.2) col = CO_SHUTLID[Math.max(0, tl - 1)];
        else if (vein) col = CO_VEIN[Math.max(1, Math.min(3, tl))];
        else if (Math.abs(cv) < cw + 4 * S.eyeK && across > 0.3 && hp(i, j, 72) < 0.5 * across) col = CO_IRIS[Math.max(0, Math.min(1, tl - 1))];
        else col = CO_SHUTLID[Math.max(0, Math.min(4, tl + (cv > 0 && cv < up ? 1 : 0)))];
        gloss = 1.6;
      } else if (mat === M_LIP) {
        // his seam's lips: rotten, swollen, wet and dark
        col = CO_LIP[Math.max(0, Math.min(4, tn))];
        gloss = 1.4;
        // (shut and winding up: his throat's fire glowing through them, pulsing, nothing open)
        // (shut and winding up: his throat's fire glowing through them along the seam, warm, fading out over them)
        const g = fz > 6 ? seamGlow(S, pose, f) : 0;
        if (g > 0.05) {
          col = mixRGB(col, CO_IRIS[Math.max(0, Math.min(4, Math.floor(g * 4 + bayer(i, j) * 0.7)))], Math.min(0.8, g * 1.1));
          glow = g > 0.55;
        }
      } else if (mat === M_GUM) {
        // the raw ring his teeth are set in; shut, the deep of his seam, dark and running with drool
        col = CO_RAW[Math.max(0, Math.min(3, tn))];
        gloss = 1.8;
        const g = fz > 6 ? seamGlow(S, pose, f) : 0;
        if (g > 0.05) {
          col = mixRGB(col, CO_IRIS[Math.max(0, Math.min(4, Math.floor(1 + g * 3.6 + bayer(i, j) * 0.7)))], Math.min(0.9, g * 1.3));
          glow = g > 0.45;
        }
      } else if (mat === M_TOOTH) {
        // yellowed, brown toward the root; a broken one's end dark and chipped
        const t2 = f.toothT;
        const step = t2 < 0.22 ? -2 : t2 < 0.45 ? -1 : 0;
        col = f.broken && t2 > 0.85 ? CO_TOOTH[Math.max(0, tn - 2)] : CO_TOOTH[Math.max(0, Math.min(4, tn + 1 + step))];
        gloss = 0.7;
      } else if (mat === M_THROAT || mat === M_MAW) {
        // inside him: dark and wet, ribbed; his throat lit faintly from within, pink burning to gold, the deeper the more
        // (while he moves, its glow breathing, and flaring as he roars)
        const deepIn = f.glowK * glowK + bayer(i, j) * 0.22;
        const base = CO_MAW[Math.max(0, Math.min(3, tn - 1))];
        col = deepIn > 1.5 ? mixRGB(CO_IRIS[3], CO_IRIS[4], Math.min(1, (deepIn - 1.5) * 0.8)) : deepIn > 1.15 ? mixRGB(CO_MAW[1], CO_IRIS[3], 0.7) : deepIn > 0.85 ? mixRGB(CO_MAW[1], CO_IRIS[3], 0.45) : deepIn > 0.55 ? mixRGB(CO_MAW[1], CO_IRIS[2], 0.36) : deepIn > 0.3 ? mixRGB(base, CO_IRIS[0], 0.3) : base;
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
      // HIS EYE'S GLOW on what is round it: pink, and gold nearest (while he moves, only while it is out and open)
      if (S.body && pose.view === 'front' && mat !== M_EYE && onHead && (!pose.anim || (pose.anim.tongue && pose.anim.lids > 0.3))) {
        const ex = E[0] - fx;
        const ey = E[1] - fy;
        const ez = E[2] - fz;
        const el = Math.hypot(ex, ey, ez) || 1;
        const facing = (Nx * S.flip * ex + Ny * S.flip * ey + Nz * ez) / el;
        const g = facing * Math.max(0, 1 - (el - COLOSSUS.eyeH * 1.6) / 150) + bayer(i, j) * 0.12;
        if (g > 0.62) col = mixRGB(col, CO_IRIS[3], 0.28);
        else if (g > 0.4) col = mixRGB(col, CO_IRIS[1], 0.2);
      }
      let r0 = col[0];
      let g0 = col[1];
      let b0 = col[2];
      let a = 255;
      let kd = 1;
      if (!raw && z < -0.5) {
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
      const PW = toWorld(x, y, z);
      near[k] = PW[0] * EYE_V[0] + PW[1] * EYE_V[1] + PW[2] * EYE_V[2];
      kind[k] = kd;
      zh[k] = zw;
      mt[k] = mat;
      if (glow) fire[k] = 1;
      if (S.now) {
        // (which bit of him: on a tube, how far along it and round it; elsewhere, a little cube of him where he is drawn)
        cell[k] = tube ? ((f.arm + 3) * 7919 + Math.floor(f.armS / 5) * 131 + Math.floor((f.armPhi + Math.PI) * 2)) | 0 : (Math.floor(f.lx / 4) * 73856093) ^ (Math.floor(f.ly / 4) * 19349663) ^ (Math.floor(f.lz / 4) * 83492791) ^ (mat * 2654435761);
      }
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
  // (spittle, drool and goo hanging off him, before the edge; while he moves, each held to the bit of him it hangs off, and moving)
  if (S.now) hangingsMoving(px, near, kind, zh, mt, cell, w, h, zoom, S.now.t);
  else hangings(px, near, kind, zh, mt, w, h, zoom);
  for (let j = 0; j < h && !raw; j++) {
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
  // HIS LIGHTS: his eye's fire (the game draws it over the dark); risen, his throat's, low in the V (while he moves: the eye's only
  // with its tongue and open; the throat's with his jaws, as it glows)
  const lights: Light[] = [];
  if (pose.body && pose.view === 'front') {
    const zz = E[2] - pose.drop;
    const yy = E[1] - (pose.back ?? 0);
    const N = S.now;
    // (where they are in the world: turned back out of his space)
    const EW = toWorld(E[0], yy, zz);
    const TW = toWorld(0, -40 - (pose.back ?? 0), 30 - pose.drop);
    if (!N || ((N.parts === 'tongue' || N.parts === 'all') && S.tongue)) lights.push({ x: ax + EW[0] * SEEN * zoom, y: ay + zoom * (EW[1] * SIN30 * SEEN - EW[2]), r: 110 * zoom, color: FLAME[2], a: (EW[2] < 0 ? 0.35 : 0.22) * (N ? 0.15 + 0.85 * S.lids : 1) });
    if ((pose.drop < 60 || raw) && (!N || N.parts === 'jaws' || N.parts === 'all')) lights.push({ x: ax + TW[0] * SEEN * zoom, y: ay + zoom * (TW[1] * SIN30 * SEEN - TW[2]), r: 70 * zoom * (N ? Math.min(1.8, 0.6 + 0.4 * glowK) : 1), color: FLAME[3], a: 0.16 * (N ? Math.min(2.6, glowK * sm01(0.02, 0.5, N.open)) : 1) });
  }
  for (let k = 0; k < w * h; k++) if (kind[k] !== 1 && kind[k] !== 2) mt[k] = 0;
  if (raw) return { px, ax, ay, lights, near, kind, mat: mt, zh, fire, seam };
  return { px, ax, ay, lights, near, kind, mat: mt };
}

/**
 * WHILE HE MOVES, WHAT HANGS OFF HIM (as `hangings`, but each held to the bit of him it hangs off, `cell`, so that it stays put as he
 * moves, and moving): his melting flesh in drips that run longer, their beads swelling until they let go and fall; drool in strings
 * off his lips, teeth, throat and tongue, swaying a little, a bead sliding down each; strings of slime off his tentacles. Each hangs
 * no further than the water under where it hangs from; how high each pixel of it is over the water goes in `zh`.
 */
function hangingsMoving(px: Px, near: Float32Array, kind: Uint8Array, zh: Float32Array, mt: Uint8Array, cell: Int32Array, w: number, h: number, zoom: number, t: number): void {
  const D = px.d;
  const put = (i: number, j: number, c: RGB, n: number, z: number): boolean => {
    if (i < 0 || j < 0 || i >= w || j >= h) return false;
    const k = j * w + i;
    if (kind[k] === 1 && mt[k] === M_EYE) return false;
    if (kind[k] === 1 && near[k] > n + 1) return true;
    if (kind[k] === 2) return false;
    D[k * 4] = c[0];
    D[k * 4 + 1] = c[1];
    D[k * 4 + 2] = c[2];
    D[k * 4 + 3] = 255;
    if (kind[k] !== 1) near[k] = n;
    kind[k] = 4;
    zh[k] = z;
    return true;
  };
  const frac = (v: number): number => v - Math.floor(v);
  const edge = (i: number, j: number): boolean => {
    if (i < 1 || i >= w - 1 || j < 2 || j >= h - 2) return false;
    const k = j * w + i;
    if (kind[k] !== 1) return false;
    const below = (j + 1) * w + i;
    return kind[below] === 0 || kind[below] === 3 || (kind[below] === 1 && near[k] - near[below] > 18);
  };
  // (what hangs is drawn after all is found, so that one drawn never makes another's edge)
  const todo: Array<() => void> = [];
  for (let i = 1; i < w - 1; i++) {
    for (let j = 2; j < h - 2; j++) {
      if (!edge(i, j)) continue;
      const k = j * w + i;
      const m = mt[k];
      if (m === M_EYE || m === M_STRAND) continue;
      const id = cell[k];
      // (one from each bit of him: not where the pixel to the left hangs off the same bit)
      if (edge(i - 1, j) && cell[j * w + i - 1] === id) continue;
      if (edge(i - 1, j - 1) && cell[(j - 1) * w + i - 1] === id) continue;
      if (edge(i - 1, j + 1) && cell[(j + 1) * w + i - 1] === id) continue;
      const toWater = Math.max(0, zh[k]) * zoom;
      const z0 = zh[k];
      const n = near[k];
      const roll = h3(id, 0, 0, 101);
      const ph = h3(id, 6, 0, 108);
      const isMouth = m === M_TOOTH || m === M_LIP || m === M_MAW || m === M_GUM || m === M_TONGUE || m === M_THROAT || m === M_LID;
      const rate = isMouth ? (m === M_LIP ? 0.22 : m === M_TONGUE ? 0.15 : m === M_TOOTH ? 0.04 : 0.018) : m === M_ARM ? 0.14 : 0.4;
      if (roll >= rate) continue;
      if (isMouth || m === M_ARM || (roll > rate * 0.96 && toWater > 4)) {
        // DROOL: a string, swaying a little in length, a bead sliding down it
        const full = m === M_ARM ? Math.min(toWater, (8 + 26 * h3(id, 1, 0, 104)) * zoom) : h3(id, 2, 0, 102) < 0.2 ? toWater * (0.6 + 0.4 * h3(id, 1, 0, 102)) : toWater * (0.06 + 0.3 * h3(id, 1, 0, 102));
        const per = EYE_LOOP / (1 + Math.floor(h3(id, 3, 0, 109) * 2));
        const len = Math.round(full * (0.86 + 0.14 * Math.sin((t / per + ph) * Math.PI * 2)));
        const beadAt = Math.round(frac(t / per + ph * 3) * len);
        const between = isMouth && m !== M_TONGUE;
        todo.push(() => {
          for (let s = 1; s <= len; s++) {
            if (between && j + s < h && kind[(j + s) * w + i] === 1 && near[(j + s) * w + i] > n - 25) return;
            if (!put(i, j + s, s === beadAt ? CO_SPIT[4] : s % 13 === 4 ? CO_SPIT[3] : CO_SPIT[1 + ((s >> 3) & 1)], n, z0 - s / zoom)) return;
            if (s === beadAt) put(i + 1, j + s, CO_SPIT[2], n, z0 - s / zoom);
          }
          put(i, j + len + 1, CO_SPIT[3], n, z0 - (len + 1) / zoom);
          put(i + 1, j + len + 1, CO_SPIT[1], n, z0 - (len + 1) / zoom);
          put(i, j + len + 2, CO_SPIT[4], n, z0 - (len + 2) / zoom);
        });
      } else {
        // A DRIP of his melting flesh: running longer, its bead swelling, until it lets go and falls; the neck springing back
        const full = Math.min(toWater, (2 + 16 * h3(id, 1, 0, 106) ** 2) * zoom);
        const per = [1, 1.5, 3][Math.min(2, Math.floor(h3(id, 5, 0, 107) * 3))];
        const p = frac(t / per + ph);
        const len = Math.round(full * (p < 0.8 ? 0.3 + 0.7 * (p / 0.8) : 0.3 + 0.2 * (1 - sm01(0.8, 0.88, p))));
        const age = p < 0.8 ? -1 : (p - 0.8) * per;
        const fallTo = Math.round(full + 0.5 * FALL_G * zoom * age * age);
        todo.push(() => {
          for (let s = 1; s <= len; s++) if (!put(i, j + s, CO_MELT[s < 3 ? 2 : 1], n, z0 - s / zoom)) return;
          const bead = (y0: number, big: boolean): void => {
            const z = z0 - (y0 - j) / zoom;
            if (big) put(i - 1, y0 + 1, CO_MELT[3], n, z);
            put(i, y0 + 1, CO_MELT[2], n, z);
            if (big) put(i + 1, y0 + 1, CO_MELT[1], n, z);
            if (big) put(i - 1, y0 + 2, CO_MELT[2], n, z);
            put(i, y0 + 2, CO_MELT[1], n, z);
            if (big) put(i + 1, y0 + 2, CO_MELT[0], n, z);
            put(i, y0 + 3, CO_MELT[0], n, z);
            put(i - (big ? 1 : 0), y0 + 1, CO_SHEEN, n, z);
          };
          // (its bead: on its end while it swells; let go, falling, until it meets the water under it)
          if (age < 0) bead(j + len, p > 0.35);
          else if (fallTo < toWater) bead(j + fallTo, true);
        });
      }
    }
  }
  for (const f of todo) f();
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
/**
 * THE PHASE 2 VIEW (the pictures' camera, leaned toward him as the Moth's is, so that the hero stands at the foot of the screen): the
 * phone's screen (engine/screen.ts, held sideways) in game pixels, and how far down it his middle at the water sits. His eye, the
 * highest of all of him, must be on it.
 */
export const LEANED = { w: 507, h: 234, waterAt: 125 } as const;
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

/** Him risen, his maw split wide open in its V as his drawing has him, his tongue towering out of it: from in front or behind. */
export function poseRisen(view: 'front' | 'back' = 'front'): ColossusPose {
  return { view, drop: 0, body: true, gaze: GAZE_AT_YOU, arms: ARMS_RISEN };
}
export function poseUnder(): ColossusPose {
  return { view: 'front', drop: COLOSSUS.sunk, back: COLOSSUS.sunkBack, body: true, gaze: [0, 0.87, 0.5], arms: ARMS_UNDER, tongue: 'under' };
}
export function poseArm(): ColossusPose {
  return { view: 'front', drop: 0, body: false, gaze: GAZE_AT_YOU, arms: ARM_ALONE };
}

// =============================================================================================
// HIS ARMS CLEAR OF HIM AND OF THE STONE; HIS PARTS

/** How many gobs are falling off him in a frame of a move. */
export function meltGobs(an: ColossusAnim): number {
  return dripsNow(an, [swingOf(-1, an.open, an.puff), swingOf(1, an.open, an.puff)]).gobs.length / 5;
}
/** Where gobs off him have landed on what lies slumped round him at the water in a frame of a move (his space: x, y, how high, how
 *  long ago in seconds, how big): for their splats, painted by the pictures' tool. */
export function meltLandings(an: ColossusAnim): number[] {
  const P = placed();
  const D = P.drips;
  const m = [swingOf(-1, an.open, an.puff), swingOf(1, an.open, an.puff)];
  const out: number[] = [];
  const on = sm01(0.45, 0.92, an.open);
  if (on <= 0.5) return out;
  for (let i = 0, j = 0; i < D.length; i += 6, j++) {
    const air = P.dripAir[j];
    if (air < 10) continue;
    const top = jawToHim(m[D[i] < 0 ? 0 : 1], [D[i], D[i + 1], D[i + 2]]);
    const per = [1, 1.5, 3][Math.min(2, Math.floor(h3(j, 0, 0, 260) * 3))];
    const ph = h3(j, 1, 0, 261);
    const q = an.t / per + ph;
    const n1 = Math.floor(q - 0.85);
    for (const n of [n1, n1 - 1]) {
      const age = an.t - (n + 0.85 - ph) * per;
      if (age < 0) continue;
      const z0 = top[2] - D[i + 3] + D[i + 5] * 0.4;
      const land = Math.sqrt((2 * Math.max(0, z0 - air - D[i + 5])) / FALL_G);
      if (age >= land && age - land < 0.4) out.push(top[0], top[1], air, age - land, D[i + 5]);
    }
  }
  return out;
}
/** How many strands of spittle are strung across his V as he stands, and how many strings across his seam tear at his entrance. */
export function spitCounts(): { across: number; held: number; seam: number; seamFlesh: number } {
  const L = spitList();
  return { across: L.filter((q) => !q.tear).length, held: L.filter((q) => q.tg !== undefined).length, seam: L.filter((q) => q.tear).length, seamFlesh: L.filter((q) => q.tear && q.flesh).length };
}
/** How many strands of his spittle are whole and how many snapped (hanging) in a frame of a move. */
export function spitStates(an: ColossusAnim): { whole: number; snapped: number } {
  let whole = 0;
  let snapped = 0;
  for (const S of spitList()) {
    if (S.tg !== undefined && !an.tongue) continue;
    const st = spitState(S, an);
    if (st.whole) whole++;
    else if (st.half > 0.05) snapped++;
  }
  return { whole, snapped };
}
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
        const yb = y + S.back;
        const zb = z + S.drop;
        let b = S.bodyAt(x, yb, zb, null, true) - r;
        // (and what hangs off him: the drips off his overhangs, the gobs falling)
        const P = placed();
        for (let i = 0; i < P.drips.length; i += 6) b = Math.min(b, cone(x, yb, zb, P.drips[i], P.drips[i + 1], P.drips[i + 2], P.drips[i], P.drips[i + 1], P.drips[i + 2] - P.drips[i + 3], P.drips[i + 5], P.drips[i + 5]) - r);
        for (let i = 0; i < P.gobs.length; i += 5) b = Math.min(b, Math.hypot(x - P.gobs[i], yb - P.gobs[i + 1], zb - P.gobs[i + 2]) - P.gobs[i + 3] * P.gobs[i + 4] - r);
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
 * HIS SHOVEL (art/eye_shovel.ts): him turned (`pose.orient`), his middle at the water at `at` in the world. How clear he is (his lengths at
 * the nearest; less than 0, into it) of a block whose top is at the water (the stone: from `x0` to `x1` across, `y0` to `y1` toward the
 * camera): its top, its end faces and its sides down to 80 under the water, sampled every 3 of his lengths within 360 across of him; and
 * how clear of him each of some tubes is (in the world: their spines and radii), and where he is nearest each.
 */
export function turnedClear(pose: ColossusPose, at: readonly [number, number], box: { x0: number; x1: number; y0: number; y1: number }, tubes: ReadonlyArray<ReadonlyArray<readonly number[]>> = []): { stone: number; where: number[]; tubes: number[] } {
  const S = new Scene(pose);
  const O = pose.orient ?? { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  const d = (x: number, y: number, z: number): number => {
    const dx = x - at[0];
    const dy = y - at[1];
    const h = [dx * O.x[0] + dy * O.x[1] + z * O.x[2], dx * O.y[0] + dy * O.y[1] + z * O.y[2], dx * O.z[0] + dy * O.z[1] + z * O.z[2]];
    return S.at(h[0], h[1], h[2], null);
  };
  let stone = Infinity;
  let where: number[] = [];
  const see = (x: number, y: number, z: number): void => {
    const v = d(x, y, z);
    if (v < stone) {
      stone = v;
      where = [x, y, z];
    }
  };
  const xa = Math.max(box.x0, at[0] - 360);
  const xb = Math.min(box.x1, at[0] + 360);
  if (xa <= xb) {
    for (let x = xa; x <= xb; x += 3) for (let y = box.y0; y <= box.y1; y += 3) see(x, y, 0);
    for (let x = xa; x <= xb; x += 3) for (let z = -80; z <= 0; z += 3) {
      see(x, box.y0, z);
      see(x, box.y1, z);
    }
  }
  for (const xe of [box.x0, box.x1]) if (Math.abs(xe - at[0]) < 360) for (let y = box.y0; y <= box.y1; y += 3) for (let z = -80; z <= 0; z += 3) see(xe, y, z);
  const out = tubes.map((t) => {
    let m = Infinity;
    for (let i = 0; i < t.length; i++) m = Math.min(m, d(t[i][0], t[i][1], t[i][2]) - t[i][3]);
    return m;
  });
  return { stone, where, tubes: out };
}
/** His solid at points of the world (his lengths from his skin; less than 0, inside him), him in `pose` (turned by `pose.orient`) with his
 *  middle at `at`: how far his maw reaches over the stone, measured. */
export function turnedAt(pose: ColossusPose, at: readonly [number, number], pts: ReadonlyArray<readonly number[]>): number[] {
  const S = new Scene(pose);
  const O = pose.orient ?? { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  return pts.map(([x, y, z]) => {
    const dx = x - at[0];
    const dy = y - at[1];
    return S.at(dx * O.x[0] + dy * O.x[1] + z * O.x[2], dx * O.y[0] + dy * O.y[1] + z * O.y[2], dx * O.z[0] + dy * O.z[1] + z * O.z[2], null);
  });
}

/**
 * WHILE HE MOVES, NOTHING OF HIM THROUGH ANYTHING ELSE OF HIM (a frame of a move, `pose.anim`, all of him): how clear (his lengths, at
 * the nearest) his tongue is of his jaws and their teeth, and of his spittle; the eye's bulb of his jaws and their teeth; and his two
 * jaws of each other (each jaw's skin sampled against the other). Only what is over the water (or within `deep` under it) is asked:
 * what is deeper is not seen. Where his tongue leaves his throat (its root, in his gullet) is its own.
 */
export function bodyClearances(pose: ColossusPose, deep = 20): { tongue: number; eye: number; spit: number; jaws: number; where: string } {
  // (which strand is which: S.strands in the order spitList() strings them, those that are whole or hanging now)
  const an = pose.anim;
  if (!an) throw new Error('a frame of a move');
  const S = new Scene({ ...pose, anim: { ...an, parts: undefined } });
  try {
    // (the true distance, not a bound: his flesh, his teeth, his drips and gobs)
    const jaws = (x: number, y: number, z: number): number => Math.min(S.halfAt(-1, x, y, z, null, false, true), S.halfAt(1, x, y, z, null, false, true));
    let tongue = Infinity;
    let eye = Infinity;
    let spit = Infinity;
    let where = '';
    let spitWhere = '';
    const T = S.tongue;
    if (T) {
      const P = T.p;
      for (let k = 0; k < T.n; k++) {
        const x = P[k * 4];
        const y = P[k * 4 + 1];
        const z = P[k * 4 + 2] - S.drop;
        const r = P[k * 4 + 3];
        // (its root in his gullet is his throat's own; under the water deeper than `deep`, not seen)
        if (T.s[k] < 40 || z + r < -deep) continue;
        // (down his gullet, the way into him at the bottom of his throat that it is drawn down into: his own)
        if (P[k * 4 + 2] < 40 && Math.abs(x) < 30 && y < -20) continue;
        // (his tongue's spine is in his own space, as his jaws are)
        const jb = jaws(x, y, P[k * 4 + 2]) - r;
        if (jb < tongue) {
          tongue = jb;
          where = `tongue at ${k} (${x.toFixed(0)}, ${y.toFixed(0)}, ${P[k * 4 + 2].toFixed(0)})`;
        }
        // (his spittle: none through his tongue, but where his tongue holds a strand, at its end)
        S.strands.forEach((St, si) => {
          const Q = St.p;
          for (let m = 0; m + 4 < Q.length; m += 4) {
            // (where his tongue holds it: its end on his tongue)
            if (St.held && Math.hypot(Q[m] - Q[0], Q[m + 1] - Q[1], Q[m + 2] - Q[2]) < 8) continue;
            const v = cone(x, y, P[k * 4 + 2], Q[m], Q[m + 1], Q[m + 2], Q[m + 4], Q[m + 5], Q[m + 6], Q[m + 3], Q[m + 7]) - r;
            if (v < spit) {
              spit = v;
              spitWhere = `strand ${si}${St.held ? ' (held)' : ''} at its point ${m / 4} (${Q[m].toFixed(0)}, ${Q[m + 1].toFixed(0)}, ${Q[m + 2].toFixed(0)}), tongue at ${k}`;
            }
          }
        });
      }
      // (the bulb his eye is in: points round it)
      const E = S.eyeC;
      const g = S.gaze;
      const A = S.eyeA;
      const V = S.eyeV;
      for (let a = 0; a < 16; a++) {
        for (let b = 1; b < 8; b++) {
          const th = (a / 16) * Math.PI * 2;
          const ph = (b / 8) * Math.PI - Math.PI / 2;
          const u = Math.cos(ph) * Math.cos(th) * (COLOSSUS.eyeW * S.eyeK + 8);
          const w = Math.cos(ph) * Math.sin(th) * (COLOSSUS.eyeD * S.eyeK + 4) - 3;
          const v = Math.sin(ph) * (COLOSSUS.eyeH * S.eyeK + 7);
          const x = E[0] + A[0] * u + g[0] * w + V[0] * v;
          const y = E[1] + A[1] * u + g[1] * w + V[1] * v;
          const z = E[2] + A[2] * u + g[2] * w + V[2] * v;
          if (z - S.drop < -deep) continue;
          // (still down his gullet, coming up out of him)
          if (z < 40 && Math.abs(x) < 30 && y < -20) continue;
          eye = Math.min(eye, jaws(x, y, z));
        }
      }
    }
    // (his two jaws: the skin of each sampled where it faces the other, against the other)
    let jj = Infinity;
    if (S.now) {
      for (let z = 4; z <= 150; z += 6) {
        for (let y = -80; y <= 140; y += 8) {
          // (along x from the middle out, the first point of his left jaw, then is it in his right?)
          for (let x = -2; x >= -200; x -= 2) {
            const l = S.halfAt(-1, x, y, z, null, true);
            if (l < 0.5) {
              jj = Math.min(jj, S.halfAt(1, x, y, z, null, true));
              break;
            }
          }
        }
      }
    }
    return { tongue, eye, spit, jaws: jj, where: `${where}; spit: ${spitWhere}` };
  } finally {
    NOW = null;
  }
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

/**
 * HIS MAW'S MEASURES (his own lengths): where his eye is; each jaw's peak, and how far each face of the V leans out (degrees); how
 * wide the V is at the water at its front and between his peaks; how high over the water his eye's top is and his peaks are.
 */
export function mawParts(): { eye: readonly [number, number, number]; peaks: typeof PEAKS; tiltDeg: [number, number]; vAtWater: number; vAtPeaks: number; eyeTop: number; teeth: number; toothToTongue: number } {
  // (a face's x at a height and a depth toward you: where it meets the V)
  const faceX = (side: number, y: number, z: number): number => {
    const F = FACES[side < 0 ? 0 : 1];
    return (CRACK - F.n[1] * (y - Y0) - F.n[2] * (z - ZP)) / F.n[0];
  };
  return {
    eye: EYE_RISEN,
    peaks: PEAKS,
    tiltDeg: [(FACES[0].tilt * 180) / Math.PI, (FACES[1].tilt * 180) / Math.PI],
    vAtWater: faceX(1, 60, 0) - faceX(-1, 60, 0),
    vAtPeaks: PEAKS[1][0] - PEAKS[0][0],
    eyeTop: EYE_RISEN[2] + COLOSSUS.eyeH + 6,
    teeth: placed().teeth[0].length + placed().teeth[1].length,
    // (the nearest any tooth's bend or tip comes to his tongue's skin, risen or under the water)
    toothToTongue: Math.min(...placed().teeth.flat().map((T) => Math.min(tongueGap(T.p[4], T.p[5], T.p[6]) - T.p[7], tongueGap(T.p[8], T.p[9], T.p[10])))),
  };
}

// =============================================================================================
// WHAT HE COSTS

/** A frame of him risen at the game's size (picture pixels, two to a game pixel: what he spans with his arms and what hangs off him, and a little room), and what it holds at 4 bytes a pixel. */
export const COLOSSUS_FRAME = { w: 800, h: 480 } as const;
export function costOf(fps: number, seconds: number, frame: { w: number; h: number } = COLOSSUS_FRAME): { frameMB: number; perSecondMB: number; totalMB: number } {
  const frameMB = (frame.w * frame.h * 4) / (1024 * 1024);
  return { frameMB, perSecondMB: frameMB * fps, totalMB: frameMB * fps * seconds };
}
