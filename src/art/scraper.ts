// FLOOR 13'S DOUBLE BOSS, THE FIRST OF THE TWO: THE SCRAPER (the art chat, 20 Oct 2026). A MOCK-UP: NOT IN THE GAME (PAIR_ON,
// off). The other is the Quill (art/quill.ts); what they are made of, art/pair_skins.ts, with his words.
//
// THE SCRAPER: a giant crayfish of sodden, layered pages, as long as four tiles from the tip of its claws to its tail fan, its
// back as high as the knight's chest. Its shell is plate on plate of wet grey paper written over in the Order's black ink;
// where the plates part, the old writing under them, brown on yellowed vellum, the stolen words burning in it the enemy's
// pink. Its two great claws are the Order's ink, black and wet and glossy, their inner edges scraping knives. Long whips of
// antennae sweep back over it; its eyes on stalks burn pink. It is what scrapes a page clean.
//
// NOT ON THE HEROES' BONES: eight legs, two claws and a tail; painted from its own solids, as the canyon scorpion is
// (art/canyon_scorpions.ts), in the same painter (art/new_mobs3.ts paintBits).
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before anything
// moves), and its stand.

import type { Px, Sprite } from '../engine/px';
import { hash, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';
import { INK, OLDV, PULPG, SODDEN, inkSkin, leafSkin, oldLayers, rolledSkin } from './pair_skins';
import type { Skin } from './skin';

/** Its legs' rolled pulp, dark and wet. */
const DARKP: typeof INK = ['#121110', '#22201d', '#3a3732', '#57534a', '#746e62'];
/** Its fan's pages: sodden grey, soaked darker toward their ends, their torn ends dipped in the Order's ink. */
function fanSkin(seed: number, lu: number, lv: number): import('./new_mobs3').PanelSkin {
  const page = leafSkin(seed, lu, lv, SODDEN, false, 0, 0.6);
  return (a, b, front, tone) => {
    const c = page(a, b, front, tone);
    if (c === null) return null;
    if (b > lv * 0.55) return INK[Math.max(0, Math.min(4, tone - 1))];
    if (b > lv * 0.2) return SODDEN[Math.max(0, Math.min(4, tone - 2))];
    return c;
  };
}
/** Under its plates, where they part: the old layers deep in shadow, a stolen word burning in them here and there. */
function deepLayers(seed: number, scale: V3): Skin {
  const old = oldLayers(seed, scale, 0.6) as (u: V3, tone: number) => string | null;
  return (u, tone) => {
    const c = old(u, tone);
    if (c && (c.startsWith('#ff') || c.startsWith('#c0'))) return c;
    return OLDV[Math.max(0, Math.min(2, tone - 2))];
  };
}

/** THE SWITCH, OFF: nothing of the game reads this file (nor art/quill.ts). */
export const PAIR_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high). x forward, y to its left, z up; its own frame has the middle of its
// shell at the origin.

/** Its shell's middle over the floor, at rest. */
export const SR_BODY_Z = 17;
/** Its shell (the carapace): its middle and half-lengths; its snout's tip. */
const CARA_C: V3 = [4, 0, 1];
const CARA_R: V3 = [26, 15, 12.5];
const SNOUT: V3 = [36, 0, 3];
/** Its tail: where it starts, each of its six segments' length and half-widths across and up; then its fan. */
const ABD_ROOT: V3 = [-21, 0, 0];
const ABD_LEN = [10.5, 10, 9.6, 9.2, 8.6, 8];
const ABD_RY = [15.5, 14.5, 13.2, 11.8, 10.2, 8.6];
const ABD_RZ = [11.5, 10.8, 10, 9, 8, 7];
/** Its tail at rest: how far each segment points down from straight back (degrees): laid out behind it, curving to the floor. */
const ABD_REST = [-2, 6, 10, 13, 15, 16];
/** Its eight legs: where each comes out from under its shell (its own frame), front pair first; its feet at rest, splayed wide. */
const HIP: V3[] = [
  [17, 10, -9], [17, -10, -9],
  [8, 12, -10], [8, -12, -10],
  [-1, 12.5, -10], [-1, -12.5, -10],
  [-10, 11.5, -9], [-10, -11.5, -9],
];
export const SR_FEET: V3[] = [
  [24, 22, 0], [24, -22, 0],
  [12, 25, 0], [12, -25, 0],
  [0, 26, 0], [0, -26, 0],
  [-12, 23, 0], [-12, -23, 0],
];
/** Its claws: each arm's shoulder (its own frame), its hand at rest, held out before it and a little raised; the palm's half-lengths; a finger's length. */
const SHOULDER: V3 = [26, 10, -3];
const HAND: V3 = [64, 30, 19];
const PALM_R: V3 = [19, 11, 9.5];
const FINGER = 26;
/** Its antennae: where each rises, and its four lengths; the way each points at rest (degrees: round from straight ahead toward its side, and up). */
const ANT_ROOT: V3 = [35, 5, 6];
const ANT_LEN = [16, 22, 26, 30];
const ANT_REST: [number, number][] = [[10, 44], [38, 32], [80, 18], [122, 6]];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: ten frames a second, a loop of 2.4 s: heavy and still, breathing, its antennae sweeping, its claws working. */
export const SR_STAND = { frames: 24, fps: 10, period: 2.4 } as const;
/** The canvas it is painted on, and its floor point on it: room for its claws out before it and its tail behind, and for its moves. */
export const SR_CANVAS = { w: 780, h: 560, ax: 390, ay: 350 };
/** Its pool of light while it lives (the enemy's pink, faint). */
const SR_AURA = { x: SR_CANVAS.ax, y: SR_CANVAS.ay - 12, r: 70, color: '#ff3a78', a: 0.07 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

export interface SrPose {
  /** Its middle, forward and to its left and up, from its floor point; how it is turned (degrees: to its left, nose down, rolled to its right). */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Each foot's place on the floor's own grid, and how high each knee arches over its leg. */
  feet: V3[];
  knee: number[];
  /** Its tail: how far each segment points down from straight back (degrees); its fan spread (0 shut, 1 wide). */
  abd: number[];
  fan: number;
  /** Each claw's hand (its own frame), how far each is open (0 shut, 1 wide), and its edge's glint (0 to 1). */
  hands: [V3, V3];
  open: [number, number];
  glint: number;
  /** Its antennae: each one's three angles (up from straight back, out to its side), left then right. */
  ants: [[number, number][], [number, number][]];
  /** Its eyes' burn (0 out) and its stalks' lean (degrees forward). */
  eyes: number;
  stalk: number;
  alive: boolean;
  /** Grains its moves throw off (place, colour, size), laid over its picture; and lights. */
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

/** Its stand: heavy and still; it breathes, its plates lifting a little; its antennae sweep slowly, each its own way; its claws open and shut by turns; ink drips off them. */
function standPose(t: number): SrPose {
  const a = (Math.PI * 2 * t) / SR_STAND.period;
  const ant = (side: number): [number, number][] => ANT_REST.map(([round, up], i) => [round + 10 * Math.sin(a * 0.5 + side * 2 + i * 0.5) * (i / 3), up + 6 * Math.sin(a + side * 1.3 + i * 0.6)]);
  const drip: [V3, string, number][] = [];
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const ph = (t / SR_STAND.period + k * 0.5) % 1;
    const z = 10 - 70 * ph * ph;
    if (z > 0.6) drip.push([[SR_BODY_Z * 0 + HAND[0] + 4, side * HAND[1], z], INK[1], 2]);
  }
  return {
    x: 0,
    y: 0,
    z: SR_BODY_Z + 0.5 * Math.sin(a),
    yaw: 0,
    pitch: 0.8 * Math.sin(a),
    roll: 0,
    feet: SR_FEET.map((f) => f),
    knee: SR_FEET.map(() => 9),
    abd: ABD_REST.map((d, i) => d + 2 * Math.sin(a + i * 0.5) * (i / 5)),
    fan: 0.85 + 0.1 * Math.sin(a),
    hands: [
      [HAND[0], HAND[1], HAND[2] + 1.5 * Math.sin(a)],
      [HAND[0], -HAND[1], HAND[2] + 1.5 * Math.sin(a + Math.PI)],
    ],
    open: [0.2 + 0.25 * Math.max(0, Math.sin(a)), 0.2 + 0.25 * Math.max(0, Math.sin(a + Math.PI))],
    glint: 0,
    ants: [ant(1), ant(-1)],
    eyes: 1 + 0.15 * Math.sin(2 * a),
    stalk: 4 * Math.sin(a * 0.5),
    alive: true,
    chips: drip,
    flares: [],
  };
}

function poseOf(which: string, t: number): SrPose {
  void which;
  return standPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A point of its own frame, where it is: turned and moved with its body. */
function worldOf(P: SrPose, p: V3): V3 {
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const cp = Math.cos(P.pitch * D), sp = Math.sin(P.pitch * D);
  const cr = Math.cos(P.roll * D), sr = Math.sin(P.roll * D);
  const r1: V3 = [p[0], p[1] * cr - p[2] * sr, p[1] * sr + p[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  const r3: V3 = [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
  return [P.x + r3[0], P.y + r3[1], P.z + r3[2]];
}
function turned(P: SrPose, v: V3): V3 {
  return sub(worldOf(P, v), worldOf(P, [0, 0, 0]));
}

/** A point on an upright ellipsoid (its own frame): `s` along it (-1 its back, 1 its front), `ang` round it from its top (degrees, to its left); with the way out of it there. */
function onShell(c: V3, r: V3, s: number, ang: number, frameX: V3 = [1, 0, 0], frameY: V3 = [0, 1, 0], frameZ: V3 = [0, 0, 1]): { p: V3; n: V3 } {
  const q = Math.sqrt(Math.max(0, 1 - s * s));
  const lx = r[0] * s;
  const ly = r[1] * q * Math.sin(ang * D);
  const lz = r[2] * q * Math.cos(ang * D);
  const p = add(c, add(add(mul(frameX, lx), mul(frameY, ly)), mul(frameZ, lz)));
  const n = norm(add(add(mul(frameX, lx / (r[0] * r[0])), mul(frameY, ly / (r[1] * r[1]))), mul(frameZ, lz / (r[2] * r[2]))));
  return { p, n };
}

/** A plate of page laid on a shell at (s, ang), shingled back toward its tail: its middle, across and down (its own frame). */
function plate(c: V3, r: V3, s: number, ang: number, w: number, h: number, back: V3, frameX?: V3, frameY?: V3, frameZ?: V3, lift = 0.9): { c: V3; u: V3; v: V3 } {
  const { p, n } = onShell(c, r, s, ang, frameX, frameY, frameZ);
  // (down the plate: toward its tail along the shell, and out a little, so each plate overlaps the one behind it)
  const along = norm(sub(back, mul(n, dot(back, n))), [-1, 0, 0]);
  const v = norm(add(along, mul(n, 0.28)));
  const u = cross(v, n);
  return { c: add(add(p, mul(n, lift)), mul(v, h * 0.35)), u: mul(u, w), v: mul(v, h) };
}

/** Its tail's joints, from its root to its fan's root, each segment's middle and the way it points (its own frame). */
export function tailOf(P: Pick<SrPose, 'abd'>): { pts: V3[]; dirs: V3[] } {
  const pts: V3[] = [ABD_ROOT];
  const dirs: V3[] = [];
  let p = ABD_ROOT;
  for (let i = 0; i < ABD_LEN.length; i++) {
    const a = P.abd[i] * D;
    const dir: V3 = [-Math.cos(a), 0, -Math.sin(a)];
    dirs.push(dir);
    p = add(p, mul(dir, ABD_LEN[i]));
    pts.push(p);
  }
  return { pts, dirs };
}

/** THE SCRAPER AS SOLIDS: its shell and its plates, its tail and fan, its claws, its eight legs, its antennae and eyes. */
function scraperBits(P: SrPose, put: Put): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const T = (v: V3): V3 => turned(P, v);
  const X: V3 = [1, 0, 0];
  const Y: V3 = [0, 1, 0];
  const Z: V3 = [0, 0, 1];
  // ITS SHELL: the old layers under it all (seen where the plates part), the plates over them in rows, shingled back
  put('body', 'shell', { k: 'ball', c: W(CARA_C), ax: [T(mul(X, CARA_R[0])), T(mul(Y, CARA_R[1])), T(mul(Z, CARA_R[2]))], skin: deepLayers(5, CARA_R) });
  // (the ridge down the middle of its shell, and the groove across it where its head meets its back: dark seams of ink)
  for (let j = 0; j <= 10; j++) {
    const sj = 0.85 - j * 0.17;
    const { p, n } = onShell(CARA_C, CARA_R, sj, 0);
    put('body', 'ridge', { k: 'mote', p: W(add(p, mul(n, 1.6))), c: INK[2], size: 2 });
  }
  for (let j = -6; j <= 6; j++) {
    const { p, n } = onShell(CARA_C, CARA_R, 0.38, j * 16);
    put('body', 'groove', { k: 'mote', p: W(add(p, mul(n, 1.4))), c: INK[1], size: 2 });
  }
  // (its snout: a beak of shell running forward to a point between its eyes)
  put('body', 'snout', { k: 'rod', a: W([24, 0, 6]), b: W(SNOUT), ra: 4.2, rb: 0.8, ramp: SODDEN });
  let seed = 11;
  const PLATES: [number, number, number, number, number, number][] = [
    [0.74, -64, 64, 3, 7.6, 6.6],
    [0.36, -104, 104, 5, 9.4, 8.6],
    [-0.08, -112, 112, 5, 10, 9.4],
    [-0.5, -100, 100, 5, 9.4, 8.6],
  ];
  for (const [s, a0, a1, n, w, h] of PLATES) {
    for (let i = 0; i < n; i++) {
      const ang = a0 + ((i + 0.5) / n) * (a1 - a0) + (hash(seed, 1, 8301) - 0.5) * 8;
      const pl = plate(CARA_C, CARA_R, s + (hash(seed, 2, 8301) - 0.5) * 0.06, ang, w * (0.9 + 0.2 * hash(seed, 3, 8301)), h * (0.9 + 0.2 * hash(seed, 4, 8301)), [-1, 0, -0.15]);
      put('body', 'plate', { k: 'panel', c: W(pl.c), u: T(pl.u), v: T(pl.v), skin: leafSkin(seed, w, h, SODDEN) });
      seed++;
    }
  }
  // ITS TAIL: six segments, each a hoop of shell with a broad plate of page over its back and one down each side; then its fan
  const { pts, dirs } = tailOf(P);
  for (let i = 0; i < ABD_LEN.length; i++) {
    const mid = lerpV(pts[i], pts[i + 1], 0.5);
    const fx = dirs[i];
    const fz = norm(cross(fx, Y), Z);
    const fz2 = dot(fz, Z) < 0 ? mul(fz, -1) : fz;
    const rx = ABD_LEN[i] * 0.62;
    put('tail', `seg${i}`, { k: 'ball', c: W(mid), ax: [T(mul(fx, rx)), T(mul(Y, ABD_RY[i])), T(mul(fz2, ABD_RZ[i]))], skin: oldLayers(20 + i, [rx, ABD_RY[i], ABD_RZ[i]], 0.4) });
    const segR: V3 = [rx, ABD_RY[i], ABD_RZ[i]];
    // (its plates lie from front to back down it: `back` is the way along it toward the fan)
    for (const ang of [0, -62, 62]) {
      const w = ang === 0 ? ABD_RY[i] * 0.62 : ABD_RZ[i] * 0.55;
      const h = ang === 0 ? ABD_LEN[i] * 0.6 + 1.2 : ABD_LEN[i] * 0.5 + 1;
      const pl = plate(mid, segR, 0.25, ang, w, h, fx, fx, Y, fz2, 0.7);
      put('tail', `plate${i}`, { k: 'panel', c: W(pl.c), u: T(pl.u), v: T(pl.v), skin: leafSkin(400 + i * 3 + (ang > 0 ? 1 : ang < 0 ? 2 : 0), w, h, SODDEN) });
    }
  }
  // (the seams between its tail's segments: a dark line of ink across its back at each joint)
  for (let i = 1; i < ABD_LEN.length; i++) {
    const j = pts[i];
    const fxj = dirs[i];
    const upj0 = norm(cross(fxj, Y), Z);
    const upj = dot(upj0, Z) < 0 ? mul(upj0, -1) : upj0;
    for (let a = -70; a <= 70; a += 14) {
      const out = add(mul(upj, Math.cos(a * D) * (ABD_RZ[i] + 1.4)), mul(Y, Math.sin(a * D) * (ABD_RY[i] + 1.4)));
      put('tail', 'seam', { k: 'mote', p: W(add(j, out)), c: INK[1], size: 2 });
    }
  }
  // its fan: five broad pages spread from the end of its tail, the middle one longest
  const end = pts[pts.length - 1];
  const fx = dirs[dirs.length - 1];
  const fz0 = norm(cross(fx, Y), Z);
  const fz = dot(fz0, Z) < 0 ? mul(fz0, -1) : fz0;
  for (let k = -2; k <= 2; k++) {
    const spread = (k * (12 + 16 * P.fan)) * D;
    const d = norm(add(mul(fx, Math.cos(spread)), mul(Y, Math.sin(spread))));
    const L = k === 0 ? 17 : 16 - Math.abs(k) * 1.0;
    const c = add(end, mul(d, L * 0.9));
    const across = norm(cross(fz, d));
    const v = norm(add(d, mul(fz, -0.08)));
    put('tail', 'fan', { k: 'panel', c: W(c), u: T(mul(across, 7.5)), v: T(mul(v, L)), skin: fanSkin(500 + k, 7.5, L) });
  }
  // ITS CLAWS: an arm from each side of its head, the elbow out wide; a great palm and two fingers, all the Order's ink
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const sh: V3 = [SHOULDER[0], side * SHOULDER[1], SHOULDER[2]];
    const hand = P.hands[k];
    const elbow: V3 = [(sh[0] + hand[0]) / 2 - 4, (sh[1] + hand[1]) / 2 + side * 11, Math.max(sh[2], hand[2]) + 5];
    const wrist = lerpV(elbow, hand, 0.62);
    put(`arm${k}`, `upper${k}`, { k: 'rod', a: W(sh), b: W(elbow), ra: 4.6, rb: 4.4, ramp: SODDEN });
    put(`arm${k}`, `elbow${k}`, { k: 'ball', c: W(elbow), ax: [T([5, 0, 0]), T([0, 5, 0]), T([0, 0, 5])], skin: rolledSkin(SODDEN, 61 + k) });
    put(`arm${k}`, `fore${k}`, { k: 'rod', a: W(elbow), b: W(wrist), ra: 5, rb: 6, ramp: INK });
    const fwd = norm(sub(hand, elbow), [1, 0, 0]);
    const inward = norm(cross([0, 0, side], fwd), [0, -side, 0]);
    const up = norm(cross(fwd, inward));
    put(`arm${k}`, `palm${k}`, { k: 'ball', c: W(hand), ax: [T(mul(fwd, PALM_R[0])), T(mul(inward, PALM_R[1])), T(mul(up, PALM_R[2]))], skin: inkSkin(P.glint) });
    // (a plate of page stuck on the palm's back, its writing running across it)
    const pc = add(add(hand, mul(up, PALM_R[2] * 0.85)), mul(fwd, -3));
    put(`arm${k}`, `palmPlate${k}`, { k: 'panel', c: W(pc), u: T(mul(inward, 7)), v: T(mul(norm(add(mul(fwd, -1), mul(up, 0.3))), 9)), skin: leafSkin(600 + k, 7, 9, SODDEN) });
    // the fingers: the fixed one on the inside, the moving one on the outside, swung out as it opens; their inner edges knives
    const root = add(hand, mul(fwd, PALM_R[0] * 0.78));
    const open = P.open[k];
    const fixedTip = add(add(root, mul(fwd, FINGER)), mul(inward, 2.2));
    const moveDir = norm(add(fwd, mul(inward, -0.3 - 1.2 * open)));
    const moveTip = add(add(root, mul(inward, -3.2)), mul(moveDir, FINGER * 0.95));
    put(`arm${k}`, `fixed${k}`, { k: 'rod', a: W(add(root, mul(inward, 3.2))), b: W(fixedTip), ra: 6, rb: 0.8, ramp: INK });
    put(`arm${k}`, `moving${k}`, { k: 'rod', a: W(add(root, mul(inward, -3.6))), b: W(moveTip), ra: 5.6, rb: 0.8, ramp: INK });
    // (the knives' edges: a bright line along each finger's inner side, burning the enemy's pink when it is about to scrape)
    const edgeC = P.glint > 0.05 ? (P.glint > 0.6 ? FLAME[3] : FLAME[2]) : INK[4];
    for (let j = 1; j <= 6; j++) {
      const q = j / 7;
      put(`arm${k}`, 'edge', { k: 'mote', p: W(lerpV(add(root, mul(inward, 1.0)), add(fixedTip, mul(inward, -0.6)), q)), c: edgeC, size: 1 });
      put(`arm${k}`, 'edge', { k: 'mote', p: W(lerpV(add(root, mul(inward, -1.6)), add(moveTip, mul(moveDir, -0.5)), q)), c: edgeC, size: 1 });
    }
  }
  // ITS LEGS: eight, of rolled grey pulp, the knee arched high, the foot a point on the floor
  P.feet.forEach((foot, i) => {
    const hip = W(HIP[i]);
    const side = Math.sign(HIP[i][1]);
    const mid = lerpV(hip, foot, 0.42);
    const outward = norm([foot[0] - hip[0], foot[1] - hip[1], 0], [0, side, 0]);
    const knee: V3 = [mid[0] + outward[0] * 2, mid[1] + outward[1] * 2, Math.max(hip[2], foot[2]) + P.knee[i]];
    const toe: V3 = [foot[0], foot[1], foot[2] + 0.8];
    put(`leg${i}`, `thigh${i}`, { k: 'rod', a: hip, b: knee, ra: 2.0, rb: 1.7, ramp: DARKP });
    put(`leg${i}`, `shin${i}`, { k: 'rod', a: knee, b: toe, ra: 1.6, rb: 0.6, ramp: INK });
    put(`leg${i}`, `knee${i}`, { k: 'ball', c: knee, ax: [[1.9, 0, 0], [0, 1.9, 0], [0, 0, 1.9]], skin: INK });
  });
  // ITS ANTENNAE: two long whips of the Order's ink, sweeping back over it
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    let p: V3 = [ANT_ROOT[0], side * ANT_ROOT[1], ANT_ROOT[2]];
    P.ants[k].forEach(([round, up], i) => {
      // (forward and up from its head, then swept out and back along its side, long as its whole body)
      const d: V3 = [Math.cos(round * D) * Math.cos(up * D), side * Math.sin(round * D) * Math.cos(up * D), Math.sin(up * D)];
      const q = add(p, mul(d, ANT_LEN[i]));
      put(`ant${k}`, `ant${k}`, { k: 'rod', a: W(p), b: W(q), ra: 2.0 - i * 0.38, rb: 1.65 - i * 0.38, ramp: INK });
      p = q;
    });
    // (its short feelers, a pair either side, between its eyes)
    const fr0: V3 = [35, side * 2, 5];
    put(`ant${k}`, 'feeler', { k: 'rod', a: W(fr0), b: W(add(fr0, [9, side * 3, 4])), ra: 0.9, rb: 0.5, ramp: SODDEN });
  }
  // ITS EYES: on short stalks either side of its snout, burning the enemy's pink
  if (P.eyes > 0.2) {
    for (const s of [1, -1]) {
      const root: V3 = [31, s * 5.5, 8];
      const tip = add(root, [3 + P.stalk * 0.15, s * 2.5, 6]);
      put('body', `stalk${s}`, { k: 'rod', a: W(root), b: W(tip), ra: 1.7, rb: 1.5, ramp: PULPG });
      put('body', `eye${s}`, { k: 'ball', c: W(tip), ax: [[2.6, 0, 0], [0, 2.6, 0], [0, 0, 2.6]], skin: INK });
      put('body', `pupil${s}`, { k: 'dot', p: W(add(tip, [1.6, s * 0.8, 0.8])), c: FLAME[2], facing: T([0.8, s * 0.4, 0.4]), c2: FLAME[3] });
    }
    put('glow', 'eyes', { k: 'glow', p: W([34, 0, 14]), c: FLAME[2], r: 9, a: 0.22 * Math.min(1, P.eyes) });
  }
}

/** One frame of the Scraper: `which` (stand, for now), `t` seconds in, from in front or behind. */
export function scraperPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, SR_CANVAS.ax, SR_CANVAS.ay, SR_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  scraperBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [P.x, P.y, P.z]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function scraperFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(scraperPainted(which, t, view), which === 'dying' ? null : SR_AURA, SR_CANVAS.ax, SR_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function scraperSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  scraperBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}
