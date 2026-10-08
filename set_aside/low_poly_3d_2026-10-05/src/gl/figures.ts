// The heroes and the monsters in low-poly 3D: the same people as the pixel art's (the Scarf
// Knight, the Feather-cap scout, the mage of the wide brim and the long scarf; the skeleton, the
// cultist, the bat, the brute), with the same colours and the same big heads.
//
// A figure is a few solids hung on a skeleton of joints, the way the pixel figures are a few
// shapes hung on a rig (art/kit.ts). It stands on the origin and faces +y; its right hand is at
// +x. A pose is the angle of each joint, in degrees.

import { Mesh, ball, box, hex, lathe, slab, tone } from './mesh';
import type { Paint, RGB } from './mesh';
import { C, skull } from './kit3';
import { mats, rotX, rotY, rotZ, scale, translate } from './vec';
import type { M4 } from './vec';

export interface Pose {
  /** The body tipped forward, and turned at the waist. */
  lean?: number;
  twist?: number;
  headYaw?: number;
  headPitch?: number;
  /** Each arm: swung forward, raised out to the side, bent at the elbow; and how the thing in its hand is tipped (-90: pointing forward). */
  armR?: readonly [number, number, number];
  armL?: readonly [number, number, number];
  wristR?: number;
  wristL?: number;
  /**
   * The thing in that hand is held upright whatever the arm does (a staff set on the ground, a bow
   * at rest). A number between 0 and 1 is part of the way from the wrist's own angle to upright:
   * so a sword carried upright can be swung and come back to rest without jumping.
   */
  plantR?: boolean | number;
  plantL?: boolean | number;
  /** The thing in the right hand is drawn this many times its size (a flame that swells before it is thrown). */
  growR?: number;
  /** Each leg: swung forward, bent at the knee. */
  legR?: readonly [number, number];
  legL?: readonly [number, number];
  /** Off the ground by this much (a leap, a bat). */
  lift?: number;
}

export interface Build {
  /** Lengths, in tiles. */
  thigh: number;
  shin: number;
  footH: number;
  pelvisH: number;
  /** From the top of the pelvis to the shoulders, and to the neck. */
  shoulderZ: number;
  neckZ: number;
  hipW: number;
  shoulderW: number;
  upper: number;
  fore: number;
  /** The solids. Limbs hang down from their joint (the origin of each); pelvis, torso and head stand on theirs. */
  parts: {
    pelvis: Mesh;
    torso: Mesh;
    head: Mesh;
    thigh: Mesh;
    shin: Mesh;
    foot: Mesh;
    upper: Mesh;
    fore: Mesh;
    hand: Mesh;
  };
  /** What each hand holds (its grip at the origin, its length along +z). */
  right?: Mesh;
  left?: Mesh;
  /** On the left forearm (a shield). */
  leftArm?: Mesh;
}

/** A limb that hangs from its joint: `len` long, `r0` thick at the joint and `r1` at its end. */
export function limb(len: number, r0: number, r1: number, paint: Paint | RGB, n = 6): Mesh {
  return lathe([[r1, -len], [r0 * 1.02, -len * 0.35], [r0, 0]], n, paint, 30);
}

/** A solid of a figure and where its joint has put it. */
export interface Joint {
  mesh: Mesh;
  m: M4;
}

/** Every solid of a figure in a pose, each with the matrix that puts it in its place (the figure stands on the origin, facing +y). */
export function joints(b: Build, p: Pose = {}): Joint[] {
  const out: Joint[] = [];
  const legR = p.legR ?? [0, 0];
  const legL = p.legL ?? [0, 0];
  const rad = Math.PI / 180;
  const reach = (l: readonly [number, number]): number => b.thigh * Math.cos(l[0] * rad) + b.shin * Math.cos((l[0] - l[1]) * rad);
  const pelvisZ = b.footH + Math.max(reach(legR), reach(legL)) + (p.lift ?? 0);
  const pelvis = translate(0, 0, pelvisZ);
  out.push({ mesh: b.parts.pelvis, m: pelvis });
  const torso = mats(pelvis, translate(0, 0, b.pelvisH), rotZ(p.twist ?? 0), rotX(-(p.lean ?? 0)));
  out.push({ mesh: b.parts.torso, m: torso });
  out.push({ mesh: b.parts.head, m: mats(torso, translate(0, 0, b.neckZ), rotZ(p.headYaw ?? 0), rotX(-(p.headPitch ?? 0))) });
  /** Where a joint has got to, without the turns it has made on the way. */
  const upright = (j: M4): M4 => mats(translate(j[12], j[13], j[14]), rotZ(p.twist ?? 0));
  const arm = (side: 1 | -1, a: readonly [number, number, number], wrist: number, held: Mesh | undefined, plant: number, onArm: Mesh | undefined, grow: number): void => {
    const shoulder = mats(torso, translate((side * b.shoulderW) / 2, 0, b.shoulderZ), rotY(-side * a[1]), rotX(a[0]));
    out.push({ mesh: b.parts.upper, m: shoulder });
    const elbow = mats(shoulder, translate(0, 0, -b.upper), rotX(a[2]));
    out.push({ mesh: b.parts.fore, m: elbow });
    // (a shield is strapped to the forearm, and is turned to the front whatever the arm does)
    if (onArm) out.push({ mesh: onArm, m: upright(mats(elbow, translate(0, 0, -b.fore * 0.5))) });
    const hand = mats(elbow, translate(0, 0, -b.fore));
    out.push({ mesh: b.parts.hand, m: hand });
    const grip = mats(hand, translate(0, 0, -0.05));
    if (held) {
      let m = plant >= 1 ? upright(grip) : plant <= 0 ? mats(grip, rotX(wrist)) : turnBetween(mats(grip, rotX(wrist)), upright(grip), plant);
      if (grow !== 1) m = mats(m, scale(grow));
      out.push({ mesh: held, m });
    }
  };
  const part = (v: boolean | number | undefined): number => (typeof v === 'number' ? v : v ? 1 : 0);
  arm(1, p.armR ?? [0, 8, 6], p.wristR ?? -90, b.right, part(p.plantR), undefined, p.growR ?? 1);
  arm(-1, p.armL ?? [0, 8, 6], p.wristL ?? -90, b.left, part(p.plantL), b.leftArm, 1);
  const leg = (side: 1 | -1, l: readonly [number, number]): void => {
    const hip = mats(pelvis, translate((side * b.hipW) / 2, 0, 0), rotX(l[0]));
    out.push({ mesh: b.parts.thigh, m: hip });
    const knee = mats(hip, translate(0, 0, -b.thigh), rotX(-l[1]));
    out.push({ mesh: b.parts.shin, m: knee });
    out.push({ mesh: b.parts.foot, m: mats(knee, translate(0, 0, -b.shin), rotX(l[1] - l[0])) });
  };
  leg(1, legR);
  leg(-1, legL);
  return out;
}

/** A matrix whose turn is `t` of the way from a's to b's (neither stretches anything); it stays where `a` is. */
function turnBetween(a: M4, b: M4, t: number): M4 {
  const mix = (i: number): [number, number, number] => [a[i] + (b[i] - a[i]) * t, a[i + 1] + (b[i + 1] - a[i + 1]) * t, a[i + 2] + (b[i + 2] - a[i + 2]) * t];
  const unit = (v: [number, number, number]): [number, number, number] => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  // (the long axis of the thing held is its z: that is the one kept true, and the others squared to it)
  const z = unit(mix(8));
  const x0 = mix(0);
  const d = x0[0] * z[0] + x0[1] * z[1] + x0[2] * z[2];
  const x = unit([x0[0] - z[0] * d, x0[1] - z[1] * d, x0[2] - z[2] * d]);
  const y: [number, number, number] = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const m = new Float32Array(16);
  m.set([x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, a[12], a[13], a[14], 1]);
  return m;
}

/** A figure in a pose, as one mesh (for a still). */
export function figure(b: Build, p: Pose = {}): Mesh {
  const m = new Mesh();
  for (const j of joints(b, p)) m.add(j.mesh, j.m);
  return m;
}

// ---------------------------------------------------------------------------------------------
// Colours of the three heroes (art/kit.ts, a little lighter: the light is real here)

const H = {
  steel: hex('#9a94e0'),
  steelLight: hex('#c4c0f4'),
  steelDark: hex('#5a54ac'),
  teal: hex('#24b4a8'),
  tealDark: hex('#127a80'),
  tealDeep: hex('#0c5664'),
  red: hex('#ff4672'),
  redDark: hex('#c02858'),
  face: hex('#16142e'),
  green: hex('#34a644'),
  greenLight: hex('#86dc46'),
  greenDark: hex('#1e7038'),
  purple: hex('#8444e0'),
  purpleLight: hex('#b07af4'),
  purpleDark: hex('#522a9c'),
  plum: hex('#84405e'),
  plumDark: hex('#562646'),
  indigo: hex('#5a54c4'),
  indigoDark: hex('#38348a'),
  skin: hex('#b0a8e8'),
};

/** Two eyes that shine in the dark of a face: on the front of a head `r` wide, at height `z`. */
function eyes(r: number, y: number, z: number, col: RGB, wide = 0.42): Mesh {
  const m = new Mesh();
  for (const s of [-1, 1]) m.add(box(s * r * wide - r * 0.17, y, z - r * 0.16, s * r * wide + r * 0.17, y + 0.02, z + r * 0.16, { side: col, glow: 2.6 }));
  return m;
}

/** Cloth that streams from a point: a strip in `n` lengths, rising and falling as it goes. It leaves the origin along -y. */
function streamer(long: number, wide: number, col: RGB, dark: RGB, n = 5, seed = 0): Mesh {
  const m = new Mesh();
  let y0 = 0;
  let z0 = 0;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / n;
    const y1 = -long * t;
    const z1 = Math.sin(t * 5.2 + seed) * 0.07 * (0.4 + t) + t * 0.05;
    const w0 = (wide * (1 - (i / n) * 0.45)) / 2;
    const w1 = (wide * (1 - t * 0.45)) / 2;
    m.sheet([[-w0, y0, z0], [w0, y0, z0], [w1, y1, z1], [-w1, y1, z1]], i % 2 === 0 ? col : tone(col, 0.86), dark);
    y0 = y1;
    z0 = z1;
  }
  // (its end is cut to two points)
  m.sheet([[-wide * 0.27, y0, z0], [0, y0, z0], [-wide * 0.2, y0 - long * 0.16, z0 + 0.03]], col, dark);
  m.sheet([[0, y0, z0], [wide * 0.27, y0, z0], [wide * 0.2, y0 - long * 0.14, z0 - 0.02]], col, dark);
  return m;
}

// ---------------------------------------------------------------------------------------------
// The Scarf Knight

function sword(len: number, blade: RGB, glow: number, broad = 1): Mesh {
  const m = new Mesh();
  m.add(lathe([[0.03, -0.1 * broad], [0.026, 0.1]], 5, { side: H.plumDark }));
  m.add(ball(0.045 * broad, 0.045 * broad, 0.045 * broad, { side: C.goldLight }), translate(0, 0, -0.1 * broad - 0.03));
  m.add(box(-0.17 * broad, -0.035, 0.1, 0.17 * broad, 0.035, 0.15, { side: C.gold }));
  // the blade: flat, with a ridge, and a point
  const w = 0.075 * broad;
  m.add(slab([[-w, 0.15], [w, 0.15], [w * 0.92, len * 0.82], [0, len], [-w * 0.92, len * 0.82]], 0.035, { side: blade, top: tone(blade, 1.2), glow }));
  m.add(slab([[-0.014, 0.16], [0.014, 0.16], [0.014, len * 0.9], [-0.014, len * 0.9]], 0.05, { side: C.sparkWhite, glow: glow * 1.5 }));
  return m;
}

/** A kite shield, on the forearm: its face toward -x of the arm (outward, on a left arm). */
function kiteShield(): Mesh {
  const m = new Mesh();
  const face = slab([[-0.3, 0.34], [0.3, 0.34], [0.33, 0.05], [0.2, -0.3], [0, -0.52], [-0.2, -0.3], [-0.33, 0.05]], 0.06, { side: H.steel, top: H.steelLight });
  // its device: a red chevron
  const dev = new Mesh();
  dev.add(slab([[-0.24, 0.02], [0, 0.2], [0, 0.1], [-0.24, -0.08]], 0.075, { side: H.red }));
  dev.add(slab([[0, 0.2], [0.24, 0.02], [0.24, -0.08], [0, 0.1]], 0.075, { side: H.red }));
  m.add(face).add(dev);
  m.add(slab([[-0.3, 0.34], [0.3, 0.34], [0.3, 0.29], [-0.3, 0.29]], 0.08, { side: H.steelLight }));
  // (in front of the arm and a little out from it, turned a little outward)
  const out = new Mesh();
  out.add(m, mats(translate(-0.1, 0.1, -0.06), rotZ(20)));
  return out;
}

/** `twoHanded`: the great sword in both hands, and no shield. */
export function knightBuild(twoHanded = false): Build {
  const head = new Mesh();
  // the helm: a bell with a point, a band round the brow, the dark of the face and two cyan eyes
  head.add(lathe([[0.17, 0], [0.225, 0.08], [0.235, 0.26], [0.19, 0.38], [0.09, 0.52], [0, 0.66]], 8, { side: H.steel, vary: 0.07 }, 22.5));
  head.add(lathe([[0.242, 0.235], [0.242, 0.285]], 8, { side: H.teal }, 22.5));
  head.add(box(-0.165, 0.12, 0.09, 0.165, 0.238, 0.225, { side: H.face }));
  head.add(eyes(0.2, 0.238, 0.175, C.spark));
  // the scarf: wound round the neck and over the mouth, its two tails streaming back
  head.add(lathe([[0.2, -0.04], [0.245, 0.02], [0.25, 0.1], [0.2, 0.14]], 8, { side: H.red, vary: 0.08 }, 22.5));
  head.add(streamer(0.95, 0.2, H.red, H.redDark, 6, 0.4), mats(translate(0.12, -0.19, 0.07), rotZ(58), rotX(4)));
  head.add(streamer(0.7, 0.16, H.red, H.redDark, 5, 2.1), mats(translate(0.08, -0.2, 0.03), rotZ(38), rotX(14)));
  const torso = new Mesh();
  torso.add(lathe([[0.17, 0.125, 0], [0.235, 0.16, 0.24], [0.225, 0.15, 0.36], [0.1, 0.09, 0.4]], 6, { side: H.teal, vary: 0.07 }));
  // a pale chevron at the collar, and steel on the shoulders
  torso.add(slab([[-0.11, 0.31], [0, 0.2], [0.11, 0.31]], 0.02, { side: C.spark, glow: 0.8 }), translate(0, 0.165, 0));
  for (const s of [-1, 1]) torso.add(ball(0.125, 0.12, 0.1, { side: H.steel, top: H.steelLight, vary: 0.06 }), translate(s * 0.27, 0, 0.35));
  const pelvis = new Mesh();
  pelvis.add(box(-0.17, -0.11, -0.02, 0.17, 0.11, 0.1, { side: H.plum }));
  pelvis.add(box(-0.04, 0.1, 0.01, 0.04, 0.125, 0.08, { side: C.goldLight }));
  // the skirt of the tunic: four flaps
  pelvis.add(lathe([[0.26, 0.19, -0.2], [0.18, 0.13, 0.02]], 6, { side: H.tealDark, vary: 0.1 }));
  const build: Build = {
    thigh: 0.2, shin: 0.24, footH: 0.1, pelvisH: 0.1, shoulderZ: 0.33, neckZ: 0.4, hipW: 0.19, shoulderW: 0.5, upper: 0.19, fore: 0.19,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.2, 0.085, 0.075, { side: H.tealDeep }),
      shin: limb(0.24, 0.085, 0.07, { side: H.steel, vary: 0.06 }),
      foot: box(-0.075, -0.09, -0.1, 0.075, 0.17, 0, { side: H.steelDark, top: H.steel }),
      upper: limb(0.19, 0.07, 0.062, { side: H.tealDark }),
      fore: limb(0.19, 0.07, 0.06, { side: H.steel, vary: 0.06 }),
      hand: box(-0.05, -0.05, -0.1, 0.05, 0.05, 0, { side: H.plumDark }),
    },
    right: twoHanded ? sword(1.12, C.spark, 1.5, 1.25) : sword(0.78, C.spark, 1.5),
    leftArm: twoHanded ? undefined : kiteShield(),
  };
  return build;
}

export const knight = (p: Pose = {}): Mesh => figure(knightBuild(), p);

// ---------------------------------------------------------------------------------------------
// The Feather-cap scout

function bow(): Mesh {
  const m = new Mesh();
  // two limbs that bend back from the grip, and the string between their tips
  const pts: [number, number][] = [[0, -0.46], [0.1, -0.3], [0.13, -0.1], [0.13, 0.1], [0.1, 0.3], [0, 0.46]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [y0, z0] = pts[i];
    const [y1, z1] = pts[i + 1];
    const len = Math.hypot(y1 - y0, z1 - z0);
    const ang = (Math.atan2(y1 - y0, z1 - z0) * 180) / Math.PI;
    m.add(lathe([[0.03, 0], [0.03, len]], 5, { side: i === 2 ? H.plumDark : H.indigo, vary: 0.1 }), mats(translate(0, y0, z0), rotX(-ang)));
  }
  m.add(box(-0.006, -0.006, -0.46, 0.006, 0.006, 0.46, { side: C.sparkWhite, glow: 0.8 }));
  // (turned so that its curve lies across the body, bowed outward from the hand that holds it)
  const out = new Mesh();
  out.add(m, rotZ(90));
  return out;
}

export function rangerBuild(): Build {
  const head = new Mesh();
  // a masked face under a soft cap, a long feather in it
  head.add(ball(0.2, 0.2, 0.2, { side: H.skin, vary: 0.05 }, true), translate(0, 0, 0.19));
  head.add(box(-0.15, 0.13, 0.13, 0.15, 0.205, 0.25, { side: H.face }));
  head.add(eyes(0.18, 0.205, 0.19, C.sparkWhite));
  head.add(lathe([[0.235, 0.24], [0.25, 0.3], [0.2, 0.4], [0.06, 0.46]], 8, { side: H.teal, vary: 0.08 }, 22.5), mats(translate(0.01, -0.02, 0), rotX(8)));
  head.add(lathe([[0.27, 0.24], [0.25, 0.27]], 8, { side: H.tealDark }, 22.5), mats(translate(0.01, -0.02, 0), rotX(8)));
  // the feather: a quill that sweeps up and back
  const feather = new Mesh();
  const fp: [number, number, number][] = [[0, 0, 0.04], [-0.06, 0.16, 0.085], [-0.2, 0.34, 0.1], [-0.4, 0.46, 0.085], [-0.6, 0.48, 0.05], [-0.74, 0.42, 0.012]];
  for (let i = 0; i < fp.length - 1; i++) {
    const [y0, z0, w0] = fp[i];
    const [y1, z1, w1] = fp[i + 1];
    feather.sheet([[-w0, y0, z0], [w0, y0, z0], [w1, y1, z1], [-w1, y1, z1]], i % 2 ? C.spark : tone(C.spark, 0.85), tone(C.spark, 0.7), 0.5);
  }
  head.add(feather, mats(translate(0.12, 0.02, 0.36), rotZ(12), scale(0.82)));
  // the neckerchief
  head.add(lathe([[0.17, -0.03], [0.21, 0.03], [0.18, 0.09]], 7, { side: H.red, vary: 0.08 }));
  head.add(slab([[-0.09, 0.02], [0.09, 0.02], [0, -0.15]], 0.03, { side: H.red }), translate(0, 0.17, 0));
  const torso = new Mesh();
  torso.add(lathe([[0.15, 0.11, 0], [0.2, 0.14, 0.24], [0.19, 0.13, 0.34], [0.09, 0.08, 0.38]], 6, { side: H.green, vary: 0.08 }));
  // a strap across the chest, and the cloak down the back
  torso.add(box(-0.2, 0.1, 0.1, 0.2, 0.15, 0.15, { side: H.plum }), mats(translate(0, 0, 0.08), rotY(28)));
  const cloak = new Mesh();
  for (let i = 0; i < 4; i++) {
    const x0 = -0.2 + i * 0.1;
    const fall = 0.62 + (i % 2) * 0.08;
    cloak.sheet([[x0, 0, 0], [x0 + 0.1, 0, 0], [x0 + 0.13 + (i - 1.5) * 0.02, -0.18, -fall], [x0 - 0.02 + (i - 1.5) * 0.02, -0.16, -fall + 0.05]], i % 2 ? H.teal : H.tealDark, H.tealDeep);
  }
  torso.add(cloak, translate(0, -0.13, 0.36));
  // a quiver behind the right shoulder
  torso.add(lathe([[0.06, 0], [0.07, 0.4]], 6, { side: H.plum, top: H.plumDark }), mats(translate(0.12, -0.17, 0.08), rotY(-18), rotX(-10)));
  for (let i = 0; i < 3; i++) torso.add(box(-0.012, -0.012, 0, 0.012, 0.012, 0.14, { side: C.sparkWhite }), mats(translate(0.2 + i * 0.03, -0.2 - i * 0.02, 0.46), rotY(-18)));
  const pelvis = new Mesh();
  pelvis.add(box(-0.15, -0.1, -0.02, 0.15, 0.1, 0.09, { side: H.plum }));
  // the skirt of the tunic, cut in leaves
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const b2 = ((i + 1) / 8) * Math.PI * 2;
    const r0 = 0.17;
    const r1 = 0.25;
    const mid = (a + b2) / 2;
    pelvis.sheet([[Math.cos(a) * r0, Math.sin(a) * r0 * 0.75, 0.03], [Math.cos(b2) * r0, Math.sin(b2) * r0 * 0.75, 0.03], [Math.cos(mid) * r1, Math.sin(mid) * r1 * 0.75, -0.2 - (i % 2) * 0.04]], i % 2 ? H.greenLight : tone(H.greenLight, 0.85), H.greenDark);
  }
  const build: Build = {
    thigh: 0.21, shin: 0.25, footH: 0.09, pelvisH: 0.09, shoulderZ: 0.31, neckZ: 0.38, hipW: 0.17, shoulderW: 0.42, upper: 0.19, fore: 0.19,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.21, 0.075, 0.065, { side: H.indigoDark }),
      shin: limb(0.25, 0.08, 0.07, { side: H.plum, vary: 0.06 }),
      foot: box(-0.07, -0.08, -0.09, 0.07, 0.17, 0, { side: H.plumDark, top: H.plum }),
      upper: limb(0.19, 0.06, 0.055, { side: H.greenDark }),
      fore: limb(0.19, 0.06, 0.05, { side: H.green }),
      hand: box(-0.045, -0.045, -0.09, 0.045, 0.045, 0, { side: H.plum }),
    },
    left: bow(),
  };
  return build;
}

export const ranger = (p: Pose = {}): Mesh => figure(rangerBuild(), p);

// ---------------------------------------------------------------------------------------------
// The mage of the wide brim and the long scarf

function staff(): Mesh {
  const m = new Mesh();
  m.add(lathe([[0.028, -0.75], [0.024, 0.62]], 5, { side: H.indigo, vary: 0.08 }));
  // a claw of two prongs, and the crystal alight between them
  for (const s of [-1, 1]) m.add(lathe([[0.024, 0], [0.012, 0.2]], 4, { side: H.indigoDark }), mats(translate(s * 0.02, 0, 0.6), rotY(s * 26)));
  m.add(lathe([[0, 0], [0.075, 0.1], [0, 0.26]], 4, { side: C.sparkWhite, glow: 4 }, 45), translate(0, 0, 0.7));
  return m;
}

export function mageBuild(): Build {
  const head = new Mesh();
  head.add(ball(0.19, 0.19, 0.19, { side: H.face }, true), translate(0, 0, 0.18));
  head.add(eyes(0.18, 0.185, 0.2, C.sparkWhite));
  // the hat: a wide brim that dips at the front, a soft crown that leans back, a band and a feather
  const hat = new Mesh();
  hat.add(lathe([[0.47, 0.42, 0], [0.45, 0.4, 0.03], [0.22, 0.2, 0.06]], 10, { side: H.purple, vary: 0.07, bottom: H.purpleDark }));
  hat.add(lathe([[0.215, 0.05], [0.2, 0.2], [0.12, 0.32], [0.03, 0.4]], 8, { side: H.purpleLight, vary: 0.08 }, 22.5), mats(translate(0, -0.03, 0), rotX(10)));
  hat.add(lathe([[0.222, 0.06], [0.215, 0.12]], 8, { side: C.gold }, 22.5));
  head.add(hat, mats(translate(0, -0.05, 0.3), rotX(24)));
  const feather = new Mesh();
  const fp: [number, number, number][] = [[0, 0, 0.03], [-0.1, 0.12, 0.06], [-0.26, 0.2, 0.06], [-0.44, 0.2, 0.03], [-0.56, 0.15, 0.008]];
  for (let i = 0; i < fp.length - 1; i++) feather.sheet([[-fp[i][2], fp[i][0], fp[i][1]], [fp[i][2], fp[i][0], fp[i][1]], [fp[i + 1][2], fp[i + 1][0], fp[i + 1][1]], [-fp[i + 1][2], fp[i + 1][0], fp[i + 1][1]]], C.spark, tone(C.spark, 0.7), 0.5);
  head.add(feather, mats(translate(0.14, -0.04, 0.4), rotZ(14)));
  // the scarf, up to the eyes, and its long tail
  head.add(lathe([[0.19, -0.05], [0.235, 0.02], [0.235, 0.12], [0.2, 0.16]], 8, { side: H.teal, vary: 0.08 }, 22.5));
  head.add(streamer(1.05, 0.22, H.teal, H.tealDark, 6, 1.2), mats(translate(0.13, -0.17, 0.06), rotZ(62), rotX(6)));
  const torso = new Mesh();
  torso.add(lathe([[0.17, 0.13, 0], [0.2, 0.14, 0.2], [0.18, 0.125, 0.32], [0.09, 0.08, 0.37]], 6, { side: H.purple, vary: 0.07 }));
  for (let i = 0; i < 3; i++) torso.add(box(-0.018, 0.13, 0.05 + i * 0.09, 0.018, 0.15, 0.085 + i * 0.09, { side: C.sparkWhite, glow: 0.5 }));
  const pelvis = new Mesh();
  // the robe: a bell to the ankles, a pale hem, buttons down the front, a satchel at the hip
  pelvis.add(lathe([[0.3, 0.25, -0.5], [0.3, 0.25, -0.46]], 8, { side: H.purpleLight }, 22.5));
  pelvis.add(lathe([[0.29, 0.24, -0.46], [0.22, 0.17, -0.2], [0.17, 0.13, 0.1]], 8, { side: H.purple, vary: 0.08 }, 22.5));
  for (let i = 0; i < 4; i++) pelvis.add(box(-0.018, 0.17 + (3 - i) * 0.022, -0.4 + i * 0.1, 0.018, 0.2 + (3 - i) * 0.022, -0.365 + i * 0.1, { side: C.sparkWhite, glow: 0.5 }));
  pelvis.add(box(-0.3, -0.06, -0.12, -0.2, 0.1, 0.04, { side: H.plum, top: H.plumDark }));
  pelvis.add(box(-0.31, -0.04, -0.02, -0.19, 0.08, 0.05, { side: H.plumDark }));
  const build: Build = {
    thigh: 0.2, shin: 0.22, footH: 0.09, pelvisH: 0.1, shoulderZ: 0.3, neckZ: 0.37, hipW: 0.16, shoulderW: 0.42, upper: 0.19, fore: 0.19,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.2, 0.07, 0.06, { side: H.purpleDark }),
      shin: limb(0.22, 0.07, 0.06, { side: H.purpleDark }),
      foot: box(-0.07, -0.08, -0.09, 0.07, 0.17, 0, { side: H.plumDark, top: H.plum }),
      // (wide sleeves)
      upper: limb(0.19, 0.07, 0.075, { side: H.purple }),
      fore: lathe([[0.1, -0.19], [0.07, 0]], 6, { side: H.purpleLight, bottom: H.purpleDark }, 30),
      hand: box(-0.04, -0.04, -0.08, 0.04, 0.04, 0, { side: H.skin }),
    },
    right: staff(),
  };
  return build;
}

export const mage = (p: Pose = {}): Mesh => figure(mageBuild(), p);

// ---------------------------------------------------------------------------------------------
// Monsters

const M = {
  bone: hex('#e4dcf0'),
  boneDark: hex('#a89cc8'),
  rag: hex('#1c8a8a'),
  rose: hex('#f04a8a'),
  roseDark: hex('#a82a66'),
  robe: hex('#3a2060'),
  robeDark: hex('#241440'),
  bat: hex('#6a3aa8'),
  batDark: hex('#40246e'),
  hide: hex('#6a82c0'),
  hideDark: hex('#42548c'),
  hideLight: hex('#8ea6dc'),
};

/** The skeleton: bones, a few rags, pink eyes, and a blade of the same pink. */
export function skeletonBuild(hood: RGB | null = null, held: 'blade' | 'bow' = 'blade'): Build {
  const head = new Mesh();
  head.add(skull(0.19, C.foe), mats(translate(0, 0.01, 0.2), rotX(0)));
  if (hood) {
    head.add(lathe([[0.19, 0.19, -0.03], [0.225, 0.21, 0.12], [0.22, 0.21, 0.3], [0.13, 0.14, 0.42], [0, 0.47]], 8, { side: hood, vary: 0.08 }, 22.5), translate(0, -0.085, 0));
    head.add(lathe([[0.21, 0.2, -0.06], [0.25, 0.23, 0.04]], 8, { side: tone(hood, 0.8) }, 22.5), translate(0, -0.04, 0));
  }
  const torso = new Mesh();
  // a spine, three ribs that are hoops, collar bones
  torso.add(lathe([[0.035, 0], [0.03, 0.36]], 5, { side: M.boneDark }));
  for (let i = 0; i < 3; i++) torso.add(lathe([[0.15 - i * 0.012, 0.11, 0.1 + i * 0.085], [0.155 - i * 0.012, 0.115, 0.14 + i * 0.085]], 7, { side: M.bone, vary: 0.06, top: M.boneDark, bottom: M.boneDark }));
  torso.add(box(-0.2, -0.03, 0.33, 0.2, 0.03, 0.37, { side: M.bone }));
  const pelvis = new Mesh();
  pelvis.add(lathe([[0.1, 0.07, -0.02], [0.15, 0.09, 0.07], [0.06, 0.05, 0.1]], 6, { side: M.bone, vary: 0.07 }));
  // what is left of a cloth
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const b2 = ((i + 1) / 6) * Math.PI * 2;
    pelvis.sheet([[Math.cos(a) * 0.14, Math.sin(a) * 0.1, 0.04], [Math.cos(b2) * 0.14, Math.sin(b2) * 0.1, 0.04], [Math.cos((a + b2) / 2) * 0.17, Math.sin((a + b2) / 2) * 0.12, -0.12 - (i % 3) * 0.05]], i % 2 ? M.rag : tone(M.rag, 0.75), tone(M.rag, 0.5));
  }
  const blade = new Mesh();
  blade.add(lathe([[0.025, -0.09], [0.022, 0.08]], 4, { side: M.boneDark }));
  blade.add(box(-0.1, -0.025, 0.08, 0.1, 0.025, 0.11, { side: M.roseDark }));
  blade.add(slab([[-0.06, 0.11], [0.06, 0.11], [0.075, 0.5], [0.02, 0.68], [-0.05, 0.56]], 0.03, { side: M.rose, top: tone(M.rose, 1.2), glow: 0.5 }));
  const build: Build = {
    thigh: 0.2, shin: 0.23, footH: 0.05, pelvisH: 0.1, shoulderZ: 0.35, neckZ: 0.39, hipW: 0.16, shoulderW: 0.4, upper: 0.2, fore: 0.2,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.2, 0.035, 0.03, { side: M.bone }, 5),
      shin: limb(0.23, 0.034, 0.026, { side: M.bone }, 5),
      foot: box(-0.045, -0.05, -0.05, 0.045, 0.15, 0, { side: M.boneDark, top: M.bone }),
      upper: limb(0.2, 0.03, 0.026, { side: M.bone }, 5),
      fore: limb(0.2, 0.03, 0.024, { side: M.bone }, 5),
      hand: box(-0.035, -0.035, -0.08, 0.035, 0.035, 0, { side: M.bone }),
    },
    right: held === 'blade' ? blade : undefined,
    left: held === 'bow' ? bow() : undefined,
  };
  return build;
}

export const skeleton = (p: Pose = {}, hood: RGB | null = null, held: 'blade' | 'bow' = 'blade'): Mesh => figure(skeletonBuild(hood, held), p);

/** The cultist: a dark robe, a hood with two pink eyes in it, a pink flame over one hand. */
export function cultistBuild(): Build {
  const head = new Mesh();
  head.add(ball(0.17, 0.17, 0.18, { side: H.face }, true), translate(0, 0.02, 0.18));
  head.add(eyes(0.17, 0.185, 0.19, C.foe));
  head.add(lathe([[0.2, 0.22, -0.04], [0.25, 0.25, 0.1], [0.25, 0.26, 0.28], [0.15, 0.18, 0.44], [0.02, 0.05, 0.56]], 8, { side: M.robe, vary: 0.1 }, 22.5), mats(translate(0, -0.06, 0), rotX(6)));
  const torso = new Mesh();
  torso.add(lathe([[0.19, 0.14, 0], [0.22, 0.15, 0.2], [0.2, 0.13, 0.33], [0.1, 0.08, 0.38]], 6, { side: M.robe, vary: 0.08 }));
  // a stole down the front
  torso.add(box(-0.05, 0.12, 0.0, 0.05, 0.16, 0.36, { side: M.rose }));
  const pelvis = new Mesh();
  pelvis.add(lathe([[0.31, 0.26, -0.5], [0.23, 0.18, -0.2], [0.19, 0.14, 0.1]], 8, { side: M.robe, vary: 0.09, bottom: M.robeDark }, 22.5));
  pelvis.add(box(-0.05, 0.16, -0.48, 0.05, 0.26, 0.1, { side: M.rose }), mats(rotX(-9)));
  const flame = new Mesh();
  flame.add(lathe([[0.05, 0], [0.085, 0.07], [0.05, 0.2], [0, 0.34]], 5, { side: M.rose, glow: 2.2 }));
  flame.add(lathe([[0.03, 0.02], [0.045, 0.08], [0, 0.22]], 4, { side: hex('#ffd0e4'), glow: 4 }));
  const build: Build = {
    thigh: 0.2, shin: 0.22, footH: 0.08, pelvisH: 0.1, shoulderZ: 0.31, neckZ: 0.38, hipW: 0.16, shoulderW: 0.44, upper: 0.19, fore: 0.19,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.2, 0.07, 0.06, { side: M.robeDark }),
      shin: limb(0.22, 0.07, 0.06, { side: M.robeDark }),
      foot: box(-0.07, -0.08, -0.08, 0.07, 0.16, 0, { side: M.robeDark }),
      upper: limb(0.19, 0.075, 0.08, { side: M.robe }),
      fore: lathe([[0.11, -0.19], [0.075, 0]], 6, { side: M.robe, bottom: M.robeDark }, 30),
      hand: box(-0.04, -0.04, -0.08, 0.04, 0.04, 0, { side: M.boneDark }),
    },
    right: flame,
  };
  return build;
}

export const cultist = (p: Pose = {}): Mesh => figure(cultistBuild(), p);

/** The bat's solids: a small furred body with big ears and pink eyes, and a wing of skin for each side (each hinged at its own origin, reaching out along x). */
export function batParts(): { body: Mesh; wingR: Mesh; wingL: Mesh } {
  const body = new Mesh();
  body.add(ball(0.16, 0.2, 0.17, { side: M.bat, vary: 0.1 }, true));
  body.add(ball(0.13, 0.13, 0.13, { side: M.bat, vary: 0.1 }), translate(0, 0.17, 0.08));
  for (const s of [-1, 1]) {
    body.add(lathe([[0.055, 0], [0, 0.2]], 4, { side: M.batDark }), mats(translate(s * 0.08, 0.15, 0.17), rotY(s * 16)));
    body.add(box(s * 0.05 - 0.025, 0.285, 0.07, s * 0.05 + 0.025, 0.305, 0.115, { side: C.foe, glow: 3 }));
  }
  // a wing: an arm of two bones, and skin in panels from it down to scalloped points
  const w = new Mesh();
  const a: [number, number, number] = [0, 0, 0];
  const b: [number, number, number] = [0.36, 0.04, 0.16];
  const c: [number, number, number] = [0.72, -0.04, 0.05];
  const tips: [number, number, number][] = [[0.14, -0.2, -0.16], [0.42, -0.24, -0.2], [0.66, -0.2, -0.14]];
  w.sheet([a, b, tips[0]], M.rose, M.roseDark);
  w.sheet([b, tips[1], tips[0]], tone(M.rose, 0.88), M.roseDark);
  w.sheet([b, c, tips[1]], M.rose, M.roseDark);
  w.sheet([c, tips[2], tips[1]], tone(M.rose, 0.88), M.roseDark);
  for (const [p0, p1] of [[a, b], [b, c]] as const) {
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    const yaw = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
    const pitch = (Math.asin((p1[2] - p0[2]) / len) * 180) / Math.PI;
    w.add(lathe([[0.022, 0], [0.016, len]], 4, { side: M.batDark }), mats(translate(p0[0], p0[1], p0[2]), rotZ(yaw), rotY(90 - pitch)));
  }
  const wingL = new Mesh();
  wingL.add(w, scale(-1, 1, 1));
  return { body, wingR: w, wingL };
}

/** Where the bat's solids are with its wings at `flap`: -1 (down) to 1 (up). Its middle is at the origin; it looks along +y. */
export function batJoints(parts: { body: Mesh; wingR: Mesh; wingL: Mesh }, flap: number): Joint[] {
  const up = flap * 34;
  return [
    { mesh: parts.body, m: translate(0, 0, 0) },
    { mesh: parts.wingR, m: mats(translate(0.1, 0, 0.06), rotY(-up)) },
    { mesh: parts.wingL, m: mats(translate(-0.1, 0, 0.06), rotY(up)) },
  ];
}

/** The bat, as one mesh (for a still). */
export function bat(flap = 0.4): Mesh {
  const m = new Mesh();
  for (const j of batJoints(batParts(), flap)) m.add(j.mesh, j.m);
  return m;
}

/**
 * The brute: slate-blue, all shoulders, small eyes under a heavy brow, tusks, a studded club.
 * `guardian`: the same beast in the red of what guards a place, with iron on it (it is drawn a third bigger).
 */
export function bruteBuild(guardian = false): Build {
  // (the guardian's hide is the crimson of the pixel one; everything else is the brute's)
  const K = guardian ? { ...M, hide: hex('#b83a5a'), hideDark: hex('#7a2244'), hideLight: hex('#d85a72') } : M;
  const head = new Mesh();
  head.add(ball(0.2, 0.22, 0.19, { side: K.hide, vary: 0.08 }, true), translate(0, 0.02, 0.15));
  head.add(box(-0.2, 0.12, 0.2, 0.2, 0.27, 0.26, { side: K.hideDark }));
  head.add(eyes(0.17, 0.245, 0.165, hex('#ffe060'), 0.5));
  head.add(box(-0.15, 0.1, 0.0, 0.15, 0.27, 0.09, { side: K.hideLight }));
  for (const s of [-1, 1]) head.add(lathe([[0.03, 0], [0, 0.1]], 4, { side: K.bone }), translate(s * 0.1, 0.24, 0.08));
  const torso = new Mesh();
  torso.add(lathe([[0.33, 0.27, 0], [0.44, 0.32, 0.2], [0.46, 0.3, 0.42], [0.2, 0.16, 0.54]], 7, { side: K.hide, vary: 0.08 }));
  torso.add(box(-0.46, 0.1, 0.16, 0.46, 0.33, 0.22, { side: H.plumDark }), mats(rotY(20)));
  const pelvis = new Mesh();
  pelvis.add(lathe([[0.36, 0.28, -0.16], [0.33, 0.27, 0.1]], 7, { side: H.plum, vary: 0.1 }));
  const club = new Mesh();
  club.add(lathe([[0.05, -0.12], [0.06, 0.3], [0.13, 0.4], [0.16, 0.72], [0.1, 0.84]], 7, { side: H.indigo, vary: 0.1 }));
  for (let i = 0; i < 8; i++) club.add(lathe([[0.03, 0], [0, 0.07]], 4, { side: H.steelLight }), mats(rotZ(i * 45 + (i % 2) * 20), translate(0.14, 0, 0.48 + (i % 3) * 0.1), rotY(90)));
  const build: Build = {
    thigh: 0.2, shin: 0.2, footH: 0.1, pelvisH: 0.1, shoulderZ: 0.4, neckZ: 0.5, hipW: 0.34, shoulderW: 0.98, upper: 0.3, fore: 0.3,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.2, 0.14, 0.12, { side: K.hide, vary: 0.06 }),
      shin: limb(0.2, 0.13, 0.11, { side: K.hide, vary: 0.06 }),
      foot: box(-0.13, -0.12, -0.1, 0.13, 0.22, 0, { side: K.hideDark, top: K.hide }),
      upper: limb(0.3, 0.17, 0.14, { side: K.hide, vary: 0.06 }),
      fore: limb(0.3, 0.14, 0.16, { side: K.hideLight, vary: 0.06 }),
      hand: ball(0.15, 0.15, 0.14, { side: K.hide, vary: 0.08 }),
    },
    right: club,
  };
  if (guardian) {
    // iron: a cap with a spike, a plate on each shoulder with studs, bands on the forearms
    head.add(lathe([[0.215, 0.235, 0.2], [0.2, 0.22, 0.3], [0.1, 0.11, 0.37], [0, 0.46]], 7, { side: C.iron, vary: 0.08 }), translate(0, 0.01, 0));
    for (const s2 of [-1, 1]) {
      torso.add(ball(0.2, 0.19, 0.13, { side: C.iron, top: H.steel, vary: 0.08 }), translate(s2 * 0.47, 0, 0.46));
      torso.add(lathe([[0.045, 0], [0, 0.16]], 4, { side: H.steelLight }), mats(translate(s2 * 0.52, 0, 0.55), rotY(s2 * 28)));
    }
    build.parts.fore = new Mesh().add(build.parts.fore).add(lathe([[0.168, -0.2], [0.16, -0.1]], 6, { side: C.iron }, 30));
  }
  return build;
}

export const brute = (p: Pose = {}): Mesh => figure(bruteBuild(), p);

/**
 * The Warden, who ends a dungeon: one of the dead in black iron, twice the height of anything
 * else in the place. A horned helm over a skull, a rune on the breastplate, a red cloak in
 * tatters, keys at the belt, and a maul whose head carries the same rune and goes hot before it
 * comes down. (Built at a man's size: it is drawn large.)
 */
export function wardenBuild(): Build {
  const iron = hex('#4a4870');
  const ironDark = hex('#2e2c4c');
  const ironLight = hex('#6a68a0');
  const head = new Mesh();
  head.add(skull(0.17, C.foe), translate(0, 0.03, 0.19));
  // the helm: open at the face, a ridge over the crown, a horn swept up from each temple
  head.add(lathe([[0.2, 0.21, 0.2], [0.225, 0.235, 0.3], [0.19, 0.2, 0.42], [0.08, 0.09, 0.5]], 8, { side: iron, vary: 0.08 }, 22.5), translate(0, -0.015, 0));
  head.add(box(-0.215, -0.2, 0.02, 0.215, 0.05, 0.3, { side: iron }));
  head.add(box(-0.03, -0.2, 0.3, 0.03, 0.22, 0.54, { side: ironLight }));
  for (const sd of [-1, 1]) {
    head.add(box(sd * 0.215 - 0.03, -0.06, -0.02, sd * 0.215 + 0.03, 0.2, 0.26, { side: ironDark }));
    const horn = new Mesh();
    horn.add(lathe([[0.07, 0], [0.055, 0.14]], 5, { side: M.bone, vary: 0.08 }));
    horn.add(lathe([[0.055, 0], [0.03, 0.14]], 5, { side: M.bone, vary: 0.08 }), mats(translate(0, 0, 0.13), rotY(sd * 34)));
    horn.add(lathe([[0.03, 0], [0, 0.16]], 5, { side: M.boneDark }), mats(translate(sd * 0.075, 0, 0.24), rotY(sd * 58)));
    head.add(horn, mats(translate(sd * 0.2, -0.02, 0.33), rotY(sd * 52)));
  }
  const torso = new Mesh();
  torso.add(lathe([[0.2, 0.15, 0], [0.3, 0.2, 0.26], [0.3, 0.19, 0.4], [0.13, 0.11, 0.47]], 7, { side: iron, vary: 0.08 }));
  // the rune on the breastplate: a diamond, and a bar through it
  torso.add(slab([[0, 0.34], [-0.08, 0.25], [0, 0.16], [0.08, 0.25]], 0.02, { side: M.rose, glow: 2.2 }), translate(0, 0.2, 0));
  torso.add(box(-0.12, 0.195, 0.24, 0.12, 0.215, 0.262, { side: M.rose, glow: 2.2 }));
  for (const sd of [-1, 1]) {
    torso.add(ball(0.17, 0.16, 0.13, { side: ironLight, top: ironLight, vary: 0.08 }, true), translate(sd * 0.36, 0, 0.42));
    torso.add(lathe([[0.05, 0], [0, 0.17]], 4, { side: ironDark }), mats(translate(sd * 0.42, 0, 0.5), rotY(sd * 30)));
  }
  // the cloak: from the shoulders to the ankles, torn into tongues at its foot
  const cloak = new Mesh();
  const strips = 6;
  for (let i = 0; i < strips; i++) {
    const x0 = -0.36 + (i * 0.72) / strips;
    const x1 = x0 + 0.72 / strips;
    const fall = 1.02 + ((i * 7) % 3) * 0.07;
    const out = 0.2 + Math.abs(i - 2.5) * 0.015;
    cloak.sheet([[x0, 0, 0], [x1, 0, 0], [x1 * 1.2, -out * 0.6, -fall * 0.5], [x0 * 1.2, -out * 0.6, -fall * 0.5]], i % 2 ? C.crimson : tone(C.crimson, 0.86), C.crimsonDark);
    cloak.sheet([[x0 * 1.2, -out * 0.6, -fall * 0.5], [x1 * 1.2, -out * 0.6, -fall * 0.5], [(x0 + x1) * 0.66, -out, -fall]], i % 2 ? tone(C.crimson, 0.9) : tone(C.crimson, 0.78), C.crimsonDark);
  }
  torso.add(cloak, translate(0, -0.15, 0.43));
  const pelvis = new Mesh();
  pelvis.add(lathe([[0.3, 0.22, -0.2], [0.21, 0.16, 0.12]], 7, { side: ironDark, vary: 0.1 }));
  pelvis.add(box(-0.22, -0.16, 0.04, 0.22, 0.17, 0.11, { side: H.plumDark }));
  pelvis.add(box(-0.045, 0.16, 0.03, 0.045, 0.19, 0.12, { side: C.goldLight }));
  // the keys of the place, on a ring at the hip
  for (let i = 0; i < 3; i++) pelvis.add(box(-0.012, -0.012, -0.16 - i * 0.02, 0.012, 0.012, 0, { side: C.gold }), mats(translate(0.2, 0.12, 0.03), rotY(-14 + i * 14), rotX(8)));
  // the maul: a long haft, an iron head with the rune on its face, spikes on its ends
  const maul = new Mesh();
  maul.add(lathe([[0.035, -0.42], [0.03, 0.78]], 6, { side: H.plumDark, vary: 0.08 }));
  maul.add(lathe([[0.05, -0.46], [0.05, -0.4]], 6, { side: C.gold }));
  const hd = new Mesh();
  hd.add(box(-0.26, -0.14, -0.15, 0.26, 0.14, 0.15, { side: iron, vary: 0.1 }));
  hd.add(box(-0.3, -0.16, -0.17, -0.2, 0.16, 0.17, { side: ironLight }));
  hd.add(box(0.2, -0.16, -0.17, 0.3, 0.16, 0.17, { side: ironLight }));
  for (const sd of [-1, 1]) hd.add(lathe([[0.08, 0], [0, 0.16]], 4, { side: ironDark }), mats(translate(sd * 0.3, 0, 0), rotY(sd * 90)));
  for (const fy of [-1, 1]) {
    hd.add(slab([[0, 0.09], [-0.09, 0], [0, -0.09], [0.09, 0]], 0.02, { side: M.rose, glow: 2.6 }), translate(0, fy * 0.145, 0));
  }
  maul.add(hd, translate(0, 0, 0.82));
  const build: Build = {
    thigh: 0.26, shin: 0.3, footH: 0.1, pelvisH: 0.13, shoulderZ: 0.4, neckZ: 0.47, hipW: 0.24, shoulderW: 0.68, upper: 0.25, fore: 0.25,
    parts: {
      pelvis, torso, head,
      thigh: limb(0.26, 0.11, 0.095, { side: ironDark, vary: 0.06 }),
      shin: limb(0.3, 0.11, 0.09, { side: iron, vary: 0.06 }),
      foot: box(-0.1, -0.11, -0.1, 0.1, 0.22, 0, { side: ironDark, top: iron }),
      upper: limb(0.25, 0.095, 0.085, { side: ironDark, vary: 0.06 }),
      fore: limb(0.25, 0.095, 0.08, { side: iron, vary: 0.06 }),
      hand: box(-0.065, -0.065, -0.12, 0.065, 0.065, 0, { side: ironDark }),
    },
    right: maul,
  };
  return build;
}

export const warden = (p: Pose = {}): Mesh => figure(wardenBuild(), p);

/**
 * The fallen wordsmith of a character's first dungeon: someone in a plum robe and a teal hood,
 * face down, one arm flung out to a book. Until the body has been searched the book is shut and
 * shines; after, it lies open and pale. Lying along the x axis, the head toward -x, on the origin.
 */
export function fallen(searched: boolean): Mesh {
  const m = new Mesh();
  const hood = searched ? tone(H.teal, 0.7) : H.teal;
  // the robe: narrow at the waist, spread at the hem; a sash round it; boots
  m.add(lathe([[0.13, 0.2, -0.1], [0.15, 0.24, 0.2], [0.14, 0.2, 0.42], [0.15, 0.31, 0.8], [0.11, 0.38, 1.02]], 7, { side: H.plum, vary: 0.1, top: H.plumDark }), mats(translate(-0.42, 0, 0.14), rotY(90)));
  m.add(lathe([[0.155, 0.215, 0.3], [0.155, 0.215, 0.36]], 7, { side: hood }), mats(translate(-0.42, 0, 0.14), rotY(90)));
  for (const sd of [-1, 1]) {
    m.add(limb(0.3, 0.07, 0.06, { side: H.plumDark }), mats(translate(0.52, sd * 0.11, 0.1), rotZ(sd * 16), rotY(-92)));
    m.add(box(-0.06, -0.07, -0.09, 0.09, 0.07, 0.05, { side: C.iron }), mats(translate(0.84, sd * 0.2, 0.1), rotZ(sd * 20)));
  }
  // the hood, and the mantle over the shoulders
  m.add(ball(0.2, 0.2, 0.16, { side: hood, vary: 0.08 }, true), translate(-0.62, 0, 0.17));
  m.add(ball(0.26, 0.24, 0.13, { side: hood, vary: 0.08 }), translate(-0.4, 0, 0.19));
  // one arm under the body's side, the other flung out past the head to the book
  m.add(limb(0.42, 0.075, 0.06, { side: H.plum }), mats(translate(-0.42, 0.2, 0.1), rotZ(118), rotY(-90)));
  m.add(ball(0.05, 0.05, 0.04, { side: H.skin }), translate(-0.63, 0.57, 0.08));
  m.add(limb(0.3, 0.07, 0.06, { side: H.plumDark }), mats(translate(-0.3, -0.22, 0.1), rotZ(-70), rotY(-90)));
  const book = new Mesh();
  if (searched) {
    // open, its pages pale and bare
    book.add(box(-0.2, -0.14, 0, 0, 0.14, 0.035, { side: M.bone, top: tone(M.bone, 1.05) }), rotY(8));
    book.add(box(0, -0.14, 0, 0.2, 0.14, 0.035, { side: M.bone, top: tone(M.bone, 0.94) }), rotY(-8));
    book.add(box(-0.01, -0.15, -0.01, 0.01, 0.15, 0.02, { side: hood }));
  } else {
    book.add(box(-0.13, -0.17, 0, 0.13, 0.17, 0.08, { side: H.teal, top: H.teal, vary: 0.06 }));
    book.add(box(-0.12, -0.16, 0.01, 0.135, 0.16, 0.07, { side: M.bone }));
    // the sign on its cover, alight
    book.add(slab([[0, 0.07], [-0.05, 0], [0, -0.07], [0.05, 0]], 0.012, { side: C.sparkWhite, glow: 3 }), mats(translate(0, 0, 0.086), rotX(90)));
  }
  m.add(book, mats(translate(-0.82, 0.62, 0.02), rotZ(24)));
  return m;
}

/** Turned to face a point of the compass (0 = +y, 90 = -x ... counter-clockwise seen from above) and set down at a place. */
export function stand(m: Mesh, x: number, y: number, z: number, turn: number, size = 1): Mesh {
  const o = new Mesh();
  o.add(m, mats(translate(x, y, z), rotZ(turn), scale(size)) as M4);
  return o;
}
