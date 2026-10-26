// THE OPENING'S WAGON AND ITS HORSE, MADE AGAIN (art/opening.ts). His words, 25 Oct 2026, of the first box: “The crag and
// the prison,The road,The wagons and horses ... Everything else is wrong.  It’s like you slapped the art together to get
// the mockup out quickly then just tried to make the crappy art look less crappy instead of actually doing better work.”
//
// So they are made from the ground up, sculpted (art/sdf.ts) as everything of the opening is, a fifth of a metre a unit:
//
// THE HORSE, a draft horse by its anatomy: a bay, black in his mane, tail and lower legs, white down his face and in the
// feathering that hangs over his hooves; deep in the chest and the girth, the shoulder sloping back from the point of it to
// the withers; the back dipping a little to the loin and rising to a broad rounded croup over big hindquarters; a thick
// neck arched along its crest; a long head, broad at the jowl, flat down the face, soft and deep at the muzzle, nostrils
// open, ears small and pricked. His legs by their bones: the forearm's muscle tapering to a flat cannon below the knee; the
// gaskin to the hock, which points back; fetlocks; pasterns sloping to broad hooves. He walks (four beats, each foot in
// turn) or gallops (the hind feet, then the fore, then all in the air), by `ph`. His harness: a heavy collar with its hames,
// the saddle and girth holding the shafts, the breeching round his quarters, the traces back to the wagon, his bridle with
// its blinkers.
//
// THE WAGON: a bed of planks on its running gear, its sides flared a little and strapped with iron; a canvas cover drawn
// tight over its bows, the bows standing through it in ridges and the canvas sagging a little between them; its ends
// flaring out and gathered by a drawstring to a puckered mouth; tied down to the bed along its sides. Big wheels behind,
// smaller before, each a felloe and an iron tyre on many spokes from a turned hub. The driver's box and its footboard; the
// shafts out to the horse; the lantern on its iron crook at the front corner.
//
// Each as sculptWagon and sculptHorse in opening.ts were, in the same measures and with the same options, to take their
// place: sculptWagon2, sculptHorse2.

import { INK, fbm } from './comic';
import type { Tones } from './comic';
import { Figure, cross, unit } from './sdf';
import type { V3 } from './sdf';
import * as Cast from './cast';

const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dt3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
/** Three unit lines: z along `z0`, x as near `xHint` as it can be across it. */
function frame(z0: V3, xHint: V3): readonly [V3, V3, V3] {
  const z = unit(z0);
  const x = unit(sub3(xHint, scale3(z, dt3(xHint, z))));
  return [x, cross(z, x), z];
}

// =============================================================================================
// THE HORSE

/** His coat, a bay; his points (mane, tail, lower legs) near black; the white of his face and feathering; his hooves. */
const COAT: Tones = [INK, '#2a150d', '#4a2716', '#744222', '#a26a36'];
const POINTS: Tones = [INK, '#140c0a', '#241814', '#3a2a22'];
const WHITE: Tones = [INK, '#4a4448', '#8e8680', '#c8c0b0', '#ece4d4'];
const HORN: Tones = [INK, '#141010', '#262020', '#3e3430'];
const LEATHER: Tones = [INK, '#160c08', '#2c180e', '#462816', '#643c20'];
const BRASS: Tones = [INK, '#3a2a10', '#6a4e1c', '#a07a2a', '#e0b850'];

/** Where each hoof is in its cycle (`u` 0..1): on the ground, going back under him from `fore` to `aft` (in front of and
 * behind where it hangs), or lifted and swung forward, `lift` high at most; and how far through its swing (0 on the ground). */
function stride(u: number, duty: number, fore: number, aft: number, lift: number): { dx: number; up: number; swing: number } {
  const w = ((u % 1) + 1) % 1;
  if (w < duty) return { dx: fore - (w / duty) * (fore + aft), up: 0, swing: 0 };
  const v = (w - duty) / (1 - duty);
  const e = smooth(v);
  // (the foot leaves the ground behind, rises quickly as the leg folds, and reaches forward before it lands)
  return { dx: -aft + e * (fore + aft), up: Math.sin(Math.min(1, v * 1.15) * Math.PI) * lift, swing: v };
}

/** Where the knee of a limb from `a` to `b` is, its two bones `l1` and `l2` long, bent toward `pole`. */
function knee(a: V3, b: V3, l1: number, l2: number, pole: V3): V3 {
  const d = sub3(b, a);
  const L = Math.min(l1 + l2 - 0.02, Math.hypot(d[0], d[1], d[2]));
  const u = unit(d);
  const al = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, l1 * l1 - al * al));
  const pp = sub3(pole, scale3(u, dt3(pole, u)));
  return add3(add3(a, scale3(u, al)), scale3(unit(pp), h));
}

export function sculptHorse2(f: Figure, o: V3, yaw: number, ph: number, gallop = true): void {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const unrot = (q: V3): V3 => [q[0] * c + q[1] * sn, -q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const fr = (z: V3, x: V3 = [1, 0, 0]): readonly [V3, V3, V3] => frame(z, x).map(rot) as unknown as readonly [V3, V3, V3];
  const AX: readonly [V3, V3, V3] = [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]];
  const cyc = ph / (Math.PI * 2);

  // HOW HE MOVES: his body's rise and fall and its pitch; his neck and head's carriage
  const bob = gallop ? Math.sin(ph * 2 - 0.6) * 0.32 : Math.sin(ph * 4) * 0.07;
  const pitch = gallop ? Math.sin(ph * 2 + 0.9) * 0.05 : 0;
  const B = (q: V3): V3 => [q[0], q[1], q[2] + bob + q[0] * pitch];
  const nodA = gallop ? Math.sin(ph * 2 + 2.2) * 0.12 : Math.sin(ph * 4 + 1.2) * 0.05;

  // (where his head and neck are: the poll, the head's line down from it)
  const withers = B([2.35, 0, 8.45]);
  const poll = B(gallop ? [7.35, 0, 9.85 + nodA * 2] : [5.95, 0, 11.35 + nodA * 2]);
  const hd = unit(gallop ? [0.78 + nodA, 0, -0.62] : [0.4 + nodA * 0.5, 0, -0.92]);
  const fwd = unit(cross([0, 1, 0], hd));
  // (`face`: the direction the front of his face looks: forward and up from the line of his head)
  const face: V3 = [-fwd[0], 0, -fwd[2]];
  const muzzle = add3(poll, scale3(hd, 3.55));

  // his colour: the blaze down his face (white), on the coat where it lies down the front of his head
  const coat = f.stuff({
    tones: COAT,
    crease: 0.12,
    paint: (q) => {
      const l = unrot(sub3(q, o));
      const rel = sub3(l, poll);
      const along = dt3(rel, hd);
      if (along < 0.15 || along > 3.8) return null;
      const out = dt3(rel, face);
      const wide = Math.abs(l[1]);
      // (on the front of the face, a stripe down it, wider at the muzzle)
      const w = 0.16 + Math.max(0, along - 2.6) * 0.22 + (along < 0.7 ? 0.12 : 0);
      if (out > 0.25 && wide < w) return wide > w - 0.08 ? '#c4bcae' : '#ece4d4';
      return null;
    },
  });
  const points = f.stuff({ tones: POINTS, crease: 0.35 });
  const white = f.stuff({ tones: WHITE, crease: 0.9 });
  const horn = f.stuff({ tones: HORN, crease: 0.4 });
  const leather = f.stuff({ tones: LEATHER, crease: 0.5 });
  const brass = f.stuff({ tones: BRASS, crease: 0.3, shine: 0.35 });

  // THE BODY
  // (the barrel of his ribs; the deep chest and the forehand before it; the breast between his forelegs)
  f.egg(coat, at(B([0.3, 0, 6.75])), [3.0, 1.62, 1.68], AX, 0.5);
  f.egg(coat, at(B([2.6, 0, 6.55])), [1.5, 1.45, 1.85], AX, 0.5);
  f.egg(coat, at(B([3.75, 0, 6.0])), [0.72, 1.0, 1.0], AX, 0.45);
  // (the withers: the top of the shoulders, a little higher than the back behind them)
  f.egg(coat, at(withers), [1.15, 0.72, 0.55], AX, 0.6);
  // (the shoulder blades, sloping from the withers down and forward to the point of the shoulder, standing out each side)
  for (const s of [-1, 1]) {
    f.egg(coat, at(B([3.1, s * 1.02, 7.15])), [0.62, 0.42, 1.5], fr([0.62, 0, -0.79]), 0.5);
    // (the point of the shoulder, and the muscle of the arm down from it to the elbow)
    f.egg(coat, at(B([3.85, s * 0.95, 6.45])), [0.52, 0.48, 0.58], AX, 0.4);
    f.egg(coat, at(B([3.2, s * 0.92, 5.65])), [0.55, 0.45, 0.75], fr([0.3, 0, 1]), 0.4);
  }
  // (the back and loin, dipping a little behind the withers and rising to the croup)
  f.egg(coat, at(B([-0.5, 0, 7.7])), [2.1, 1.2, 0.6], AX, 0.6);
  // (the quarters: big and round; the croup over them; each buttock and the thigh down toward the stifle)
  f.egg(coat, at(B([-2.75, 0, 7.0])), [1.85, 1.62, 1.65], AX, 0.5);
  f.egg(coat, at(B([-2.5, 0, 8.0])), [1.45, 1.38, 0.68], AX, 0.6);
  f.egg(coat, at(B([-4.3, 0, 7.0])), [0.6, 1.15, 0.85], AX, 0.45);
  for (const s of [-1, 1]) {
    f.egg(coat, at(B([-3.6, s * 0.88, 6.65])), [0.95, 0.72, 1.25], AX, 0.45);
    f.egg(coat, at(B([-2.45, s * 1.12, 5.85])), [1.0, 0.52, 1.1], fr([-0.25, 0, 1]), 0.45);
  }

  // (his build drawn in, as the comic draws a body: the back edge of the shoulder; the arm's muscle down to the elbow;
  // the hip's point; the stifle's line up into the flank; the last ribs; the line of the jaw)
  for (const s of [-1, 1]) {
    const L = (pts: V3[]): void => void f.line(pts.map((q) => at(B([q[0], s * q[1], q[2]]))), '#2a150d', 1);
    L([[2.55, 1.32, 8.05], [2.35, 1.48, 7.2], [2.55, 1.5, 6.3], [2.95, 1.35, 5.45]]);
    L([[3.9, 1.2, 6.0], [3.55, 1.25, 5.45], [3.25, 1.2, 4.95]]);
    L([[-1.75, 1.48, 7.6], [-1.95, 1.58, 7.25], [-2.3, 1.6, 7.0]]);
    L([[-1.55, 1.58, 5.25], [-1.25, 1.62, 6.0], [-1.25, 1.66, 6.6]]);
    L([[0.4, 1.64, 5.6], [0.15, 1.66, 6.3]]);
    L([[-0.35, 1.62, 5.7], [-0.6, 1.64, 6.35]]);
  }

  // THE NECK, thick at its root, arched along its crest to the poll; the throat in under the jaw
  {
    const root = B([3.35, 0, 7.4]);
    const mid = add3(lerp3(root, poll, 0.5), [0, 0, 0.25]);
    f.rod(coat, at(root), at(mid), 1.35, 0.9, 0.6);
    f.rod(coat, at(mid), at(add3(poll, scale3(hd, 0.2))), 0.9, 0.62, 0.5);
    // (the crest: a ridge of muscle along its top, from behind the withers to the poll, arched)
    const crest0 = B([2.2, 0, 8.55]);
    const crestM = add3(lerp3(crest0, poll, 0.5), [-0.25, 0, 0.6]);
    f.rod(coat, at(crest0), at(crestM), 0.66, 0.62, 0.6);
    f.rod(coat, at(crestM), at(add3(poll, [-0.15, 0, 0.1])), 0.62, 0.45, 0.5);
  }

  // THE HEAD: the skull at the poll; the cheek, broad and round, behind and below the eye; the face long and flat down to
  // the muzzle, which is soft and deeper; the chin; the nostrils; the eyes; the ears
  {
    const down = scale3(face, -1);
    f.egg(coat, at(add3(poll, scale3(hd, 0.45))), [0.75, 0.62, 0.7], fr(hd, face), 0.45);
    f.egg(coat, at(add3(add3(poll, scale3(hd, 1.1)), scale3(down, 0.55))), [1.05, 0.62, 0.95], fr(hd, face), 0.5);
    f.rod(coat, at(add3(add3(poll, scale3(hd, 0.9)), scale3(face, 0.12))), at(add3(add3(poll, scale3(hd, 3.15)), scale3(face, 0.02))), 0.56, 0.42, 0.5);
    f.egg(coat, at(add3(muzzle, scale3(down, 0.1))), [0.5, 0.5, 0.58], fr(hd, face), 0.45);
    f.egg(coat, at(add3(add3(muzzle, scale3(hd, -0.3)), scale3(down, 0.58))), [0.42, 0.36, 0.26], fr(hd, face), 0.3);
    for (const s of [-1, 1]) {
      // (the nostril: a dark hollow on the front of the muzzle, toward its side)
      f.egg(coat, at(add3(add3(muzzle, scale3(hd, 0.25)), [0, s * 0.27, 0])), [0.13, 0.08, 0.16], fr(hd, face), 0.08, true);
      // (the eye, under its brow, toward the side of the head)
      const eye = add3(add3(add3(poll, scale3(hd, 0.85)), scale3(face, 0.18)), [0, s * 0.6, 0]);
      f.egg(coat, at(add3(eye, [0, s * 0.02, 0.1])), [0.24, 0.12, 0.12], fr(hd, face), 0.2);
      f.mark(at(add3(eye, [0, s * 0.08, -0.02])), ['#07060d', '#3a2418'], 2);
      // (the ears: small, pricked forward, cupped, their tips pointed)
      const e0 = add3(add3(poll, scale3(face, 0.2)), [0, s * 0.32, 0.3]);
      const tip = add3(e0, add3(scale3(face, 0.85), add3(scale3(hd, -0.25), [0, s * 0.2, gallop ? -0.25 : 0])));
      f.rod(coat, at(e0), at(lerp3(e0, tip, 0.55)), 0.22, 0.17, 0.12);
      f.rod(coat, at(lerp3(e0, tip, 0.55)), at(tip), 0.17, 0.03, 0.1);
    }
  }
  // (the mouth's line, the chin's)
  f.line([at(add3(muzzle, add3(scale3(hd, -0.55), scale3(face, -0.42)))), at(add3(muzzle, add3(scale3(hd, 0.2), scale3(face, -0.38))))], '#1e110b', 1);

  // THE MANE: thick, lying over to his far side along the crest, its ends ragged; lifted and streaming back as he gallops.
  // The forelock over his brow.
  {
    const fly = gallop ? 1 : 0.15;
    const crest0 = B([2.1, 0, 8.75]);
    for (let i = 0; i <= 11; i++) {
      const u = i / 11;
      const q = add3(lerp3(crest0, add3(poll, [-0.3, 0, 0.35]), u), [0, 0, 0.6 * Math.sin(u * Math.PI)]);
      const len = 1.0 + 0.35 * Math.sin(u * 7.3 + 1) + (1 - u) * 0.3;
      const back: V3 = gallop
        ? [-len * (0.9 + fly * 0.4), 0.35, 0.15 + Math.sin(ph * 3 + i) * 0.2]
        : [-len * 0.35, 0.55, -len * 0.85];
      f.rod(points, at(q), at(add3(q, back)), 0.34, 0.1, 0.4);
    }
    const fl = add3(poll, add3(scale3(face, 0.3), scale3(hd, 0.1)));
    f.rod(points, at(fl), at(add3(fl, add3(scale3(hd, 0.75), scale3(face, gallop ? -0.2 : 0.18)))), 0.24, 0.08, 0.2);
  }

  // THE TAIL: from its dock under the croup, full and long, hanging to the hocks; streaming out behind at the gallop
  {
    const dock = B([-4.2, 0, 7.75]);
    const d1 = add3(dock, gallop ? [-1.1, 0, 0.15] : [-0.65, 0, -0.55]);
    f.rod(points, at(dock), at(d1), 0.42, 0.36, 0.4);
    for (let i = 0; i < 6; i++) {
      const sw = (i - 2.5) * 0.12;
      const swayT = Math.sin(ph * (gallop ? 2 : 1) + i * 0.6) * (gallop ? 0.35 : 0.15);
      const mid: V3 = gallop ? add3(d1, [-1.6, sw * 1.5, -0.4 + swayT]) : add3(d1, [-0.35 + sw * 0.6, sw, -2.0]);
      const end: V3 = gallop ? add3(mid, [-1.5, sw * 2, -0.9 + swayT * 1.4]) : add3(mid, [-0.15 + sw * 0.8 + swayT, sw * 1.4, -2.0 + Math.abs(sw) * 1.5]);
      f.rod(points, at(d1), at(mid), 0.42, 0.34, 0.45);
      f.rod(points, at(mid), at(end), 0.34, 0.08, 0.4);
    }
  }

  // THE LEGS, by their bones: each hoof where his gait has it at `ph`; the joints between found from the bones' lengths
  // (fore: elbow, knee, fetlock; the knee bending forward as the foot folds up behind; hind: stifle, hock, fetlock; the
  // hock pointing back)
  const duty = gallop ? 0.36 : 0.63;
  const legs: { fore: boolean; y: number; off: number }[] = gallop
    ? [
        { fore: false, y: -0.85, off: 0 },
        { fore: false, y: 0.85, off: 0.1 },
        { fore: true, y: -0.78, off: 0.4 },
        { fore: true, y: 0.78, off: 0.5 },
      ]
    : [
        { fore: false, y: -0.85, off: 0 },
        { fore: true, y: -0.78, off: 0.25 },
        { fore: false, y: 0.85, off: 0.5 },
        { fore: true, y: 0.78, off: 0.75 },
      ];
  for (const lg of legs) {
    const st = stride(cyc + lg.off, duty, lg.fore ? (gallop ? 2.6 : 1.15) : gallop ? 1.9 : 0.95, lg.fore ? (gallop ? 1.6 : 1.0) : gallop ? 2.4 : 1.1, gallop ? 2.3 : 1.05);
    const home = lg.fore ? 3.1 : -3.95;
    // (the hoof, and the fetlock over it: the pastern sloping up and back from the hoof when it bears; folding back as the
    // foot comes up)
    const fold = clamp01(st.up / (gallop ? 1.2 : 0.7));
    const hoof: V3 = [home + st.dx, lg.y, 0.02 + st.up];
    const past: V3 = unit([-0.45 - fold * 0.9, 0, 0.9 - fold * 0.75]);
    const fet = add3(hoof, add3(scale3(past, 0.95), [0, 0, 0.3]));
    if (lg.fore) {
      const elbow = B([3.0, lg.y * 1.08, 5.25]);
      const kn = knee(elbow, fet, 2.45, 1.7, [1, 0, 0.05]);
      // (the forearm: thick and muscled under the elbow, narrowing to the knee; the knee's flat bone; the cannon, flat and
      // lean; the fetlock's knob)
      f.rod(coat, at(add3(elbow, [0.12, 0, 0.1])), at(lerp3(elbow, kn, 0.5)), 0.52, 0.38, 0.3);
      f.rod(coat, at(lerp3(elbow, kn, 0.5)), at(kn), 0.38, 0.27, 0.25);
      f.block(points, at(kn), [0.3, 0.27, 0.34], 0.18, fr(sub3(elbow, kn)), 0.2);
      f.rod(points, at(kn), at(fet), 0.24, 0.22, 0.15);
      // (the back of the leg below the knee: the tendons, a ridge down behind the cannon)
      f.rod(points, at(add3(kn, [-0.18, 0, -0.35])), at(add3(fet, [-0.2, 0, 0.15])), 0.17, 0.16, 0.18);
    } else {
      const stifle = B([-2.1, lg.y * 1.3, 5.45]);
      const hk = knee(stifle, fet, 3.05, 2.0, [-1, 0, 0.1]);
      // (the gaskin: the second thigh's muscle, down to the hock; the hock, its point standing out behind; the cannon)
      f.rod(coat, at(stifle), at(lerp3(stifle, hk, 0.5)), 0.6, 0.42, 0.4);
      f.rod(coat, at(lerp3(stifle, hk, 0.5)), at(hk), 0.42, 0.28, 0.3);
      // (the back of the thigh: from the point of the buttock down to the hock's point, the hamstring)
      const butt = B([-4.35, lg.y * 0.95, 6.3]);
      f.rod(coat, at(butt), at(lerp3(butt, add3(hk, [-0.25, 0, 0.3]), 0.55)), 0.55, 0.36, 0.45);
      f.rod(coat, at(lerp3(butt, add3(hk, [-0.25, 0, 0.3]), 0.55)), at(add3(hk, [-0.25, 0, 0.3])), 0.36, 0.18, 0.3);
      f.egg(points, at(add3(hk, [-0.3, 0, 0.15])), [0.26, 0.22, 0.3], AX, 0.2);
      f.egg(points, at(hk), [0.32, 0.28, 0.36], AX, 0.18);
      f.rod(points, at(hk), at(fet), 0.26, 0.23, 0.15);
      f.rod(points, at(add3(hk, [-0.25, 0, -0.3])), at(add3(fet, [-0.2, 0, 0.15])), 0.17, 0.16, 0.18);
    }
    // (the fetlock; the pastern; the hoof, broad and big as a draft horse's are, its toe forward)
    f.egg(points, at(fet), [0.31, 0.28, 0.3], AX, 0.18);
    const coronet = add3(hoof, add3(scale3(past, 0.25), [0, 0, 0.32]));
    f.rod(white, at(fet), at(coronet), 0.3, 0.33, 0.25);
    const toe = unit([1 - fold * 0.7, 0, -fold * 0.9]);
    f.block(horn, at(add3(hoof, add3(scale3(toe, 0.12), [0, 0, 0.24]))), [0.52, 0.45, 0.25], 0.18, fr([fold * 0.8 * -1, 0, 1], toe), 0.15);
    // (the feathering: long hair from the back of the fetlock and round the top of the hoof, falling over its heel)
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 0.45 + (i / 6) * Math.PI * 1.1;
      const from = add3(fet, [Math.cos(a) * 0.26 - 0.08, Math.sin(a) * 0.26, -0.05 + (i % 2) * 0.12]);
      const to = add3(hoof, [Math.cos(a) * 0.48 - 0.25 - fold * 0.4, Math.sin(a) * 0.46, 0.1 + ((i * 37) % 5) * 0.03 + fold * 0.25]);
      f.rod(white, at(from), at(to), 0.15, 0.06, 0.25);
    }
  }

  // THE HARNESS. The collar: a thick padded ring of leather round the root of his neck, in front of his shoulders, its
  // hames of brass along its front, their tops standing up over it
  {
    const cc = B([3.7, 0, 7.6]);
    const na = unit([1, 0, gallop ? 0.4 : 0.62]);
    const e1: V3 = [0, 1, 0];
    const e2 = unit([-na[2], 0, na[0]]);
    let prev: V3 | null = null;
    let hp: V3 | null = null;
    for (let i = 0; i <= 20; i++) {
      const an = (i / 20) * Math.PI * 2;
      const bottom = Math.max(0, -Math.sin(an));
      const q = add3(cc, add3(scale3(e1, Math.cos(an) * (1.45 + bottom * 0.08)), scale3(e2, Math.sin(an) * 1.55 - bottom * 0.12)));
      const thick = 0.3 + bottom * 0.1;
      if (prev) f.rod(leather, at(prev), at(q), thick, thick, 0.3);
      // (the hames: along the collar's front, each side)
      const h = add3(q, scale3(na, 0.32));
      if (hp && Math.abs(Math.cos(an)) > 0.35) f.rod(brass, at(hp), at(h), 0.11, 0.11, 0.05);
      hp = h;
      prev = q;
    }
    for (const s of [-1, 1]) {
      const top = add3(cc, add3(scale3(e1, s * 0.55), scale3(e2, 1.95)));
      f.rod(brass, at(top), at(add3(top, add3(scale3(e2, 0.45), scale3(na, 0.2)))), 0.11, 0.07, 0.04);
      f.egg(brass, at(add3(top, add3(scale3(e2, 0.5), scale3(na, 0.22)))), [0.12, 0.12, 0.12], AX, 0.02);
      // (the traces, from the hames back along his sides to the wagon)
      const tr0 = add3(cc, add3(scale3(e1, s * 1.62), scale3(e2, -0.55)));
      f.rod(leather, at(tr0), at(B([-2.0, s * 1.68, 6.3])), 0.1, 0.1, 0.05);
      f.rod(leather, at(B([-2.0, s * 1.68, 6.3])), at([-7.2, s * 1.55, 4.6]), 0.1, 0.1, 0.05);
    }
  }
  // (the saddle on his back behind the withers, its girth round under him; the tugs that hold the shafts at his sides; the
  // back strap to the crupper under his tail; the breeching round his quarters)
  {
    const sd = B([0.95, 0, 8.25]);
    f.block(leather, at(sd), [0.65, 0.95, 0.24], 0.16, AX, 0.2);
    for (const s of [-1, 1]) {
      const tug = B([0.95, s * 1.75, 6.95]);
      f.rod(leather, at(add3(sd, [0, s * 0.9, -0.1])), at(tug), 0.13, 0.13, 0.05);
      f.egg(brass, at(tug), [0.18, 0.12, 0.2], AX, 0.02);
    }
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * Math.PI;
      const a1 = ((i + 1) / 10) * Math.PI;
      const g = (a: number): V3 => B([0.95, Math.cos(a) * 1.68, 6.45 - Math.sin(a) * 1.95]);
      f.rod(leather, at(g(a0)), at(g(a1)), 0.13, 0.13, 0.05);
    }
    f.rod(leather, at(add3(sd, [-0.5, 0, 0.12])), at(B([-2.4, 0, 8.55])), 0.09, 0.09, 0.05);
    f.rod(leather, at(B([-2.4, 0, 8.55])), at(B([-4.05, 0, 7.95])), 0.09, 0.09, 0.05);
    let prev: V3 | null = null;
    for (let i = 0; i <= 12; i++) {
      const a = -Math.PI / 2 + (i / 12) * Math.PI;
      const q = B([-3.05 - Math.cos(a) * 1.6, Math.sin(a) * 1.72, 6.25 - Math.cos(a) * 0.2]);
      if (prev) f.rod(leather, at(prev), at(q), 0.12, 0.12, 0.05);
      prev = q;
    }
  }
  // (the bridle: the headstall over the poll behind the ears, the cheek pieces down to the bit, the noseband, the brow
  // band; the blinkers by his eyes; the reins from the bit back to the driver)
  {
    const down = scale3(face, -1);
    for (const s of [-1, 1]) {
      const side: V3 = [0, s * 0.66, 0];
      const top = add3(add3(poll, scale3(hd, -0.1)), [0, s * 0.45, 0.35]);
      const bit = add3(add3(muzzle, add3(scale3(hd, -0.45), scale3(down, 0.35))), [0, s * 0.52, 0]);
      f.rod(leather, at(top), at(add3(add3(poll, scale3(hd, 0.6)), add3(side, scale3(face, -0.15)))), 0.07, 0.07, 0.03);
      f.rod(leather, at(add3(add3(poll, scale3(hd, 0.6)), add3(side, scale3(face, -0.15)))), at(bit), 0.07, 0.07, 0.03);
      f.egg(brass, at(bit), [0.12, 0.06, 0.12], AX, 0.02);
      // (the blinker: a cup of leather beside and behind the eye)
      f.block(leather, at(add3(add3(add3(poll, scale3(hd, 0.75)), scale3(face, 0.15)), [0, s * 0.78, 0.15])), [0.36, 0.06, 0.3], 0.06, fr([0, 1, 0], hd), 0.05);
      // (the reins, back over his neck through the hame terrets to the driver's hands)
      f.rod(leather, at(bit), at(B([3.85, s * 1.05, 9.15])), 0.06, 0.06, 0.02);
      f.rod(leather, at(B([3.85, s * 1.05, 9.15])), at([-6.8, s * 0.5, 8.6]), 0.06, 0.06, 0.02);
    }
    // (the noseband, round the face above the muzzle; the brow band under the forelock)
    const nb = add3(poll, scale3(hd, 2.4));
    f.rod(leather, at(add3(nb, [0, -0.6, 0])), at(add3(nb, [0, 0.6, 0])), 0.08, 0.08, 0.03);
    const bb = add3(add3(poll, scale3(hd, 0.25)), scale3(face, 0.35));
    f.rod(leather, at(add3(bb, [0, -0.55, 0])), at(add3(bb, [0, 0.55, 0])), 0.07, 0.07, 0.03);
  }
}

// =============================================================================================
// THE WAGON

/** The canvas of the cover, darkest first; old wood; black iron; the cord of its ropes. */
const CANVAS: Tones = [INK, '#2a221c', '#4a3e30', '#6e5e48', '#9a8662', '#c4ae84', '#e4d0a4'];
const WOOD: Tones = [INK, '#1a120c', '#2e2016', '#463020', '#64462c', '#86603a'];
const IRON: Tones = [INK, '#16161e', '#2a2a34', '#44444e', '#6a6a78'];
const ROPE: Tones = [INK, '#3a3024', '#5e503a', '#8a7a58'];

export function sculptWagon2(
  f: Figure,
  o: V3,
  yaw: number,
  w: { roll?: number; horse?: { ph: number; gallop: boolean }; lampSide?: 1 | -1; burn?: number; burnAt?: V3; driver?: boolean | 'armourer'; ribs?: boolean; backOpen?: boolean; hollow?: boolean } = {},
): { lamp: V3 | null } {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const rot = (q: V3): V3 => [q[0] * c - q[1] * sn, q[0] * sn + q[1] * c, q[2]];
  const unrot = (q: V3): V3 => [q[0] * c + q[1] * sn, -q[0] * sn + q[1] * c, q[2]];
  const at = (q: V3): V3 => add3(o, rot(q));
  const AX: readonly [V3, V3, V3] = [rot([1, 0, 0]), rot([0, 1, 0]), [0, 0, 1]];
  const fr = (z: V3, x: V3 = [1, 0, 0]): readonly [V3, V3, V3] => frame(z, x).map(rot) as unknown as readonly [V3, V3, V3];
  const burn = w.burn ?? 0;
  const roll = w.roll ?? 0;
  const wood = f.stuff({ tones: WOOD, crease: 0.6 });
  const iron = f.stuff({ tones: IRON, crease: 0.4 });
  const rope = f.stuff({ tones: ROPE, crease: 0.4 });

  // THE BED: a box of planks on its running gear, its floor at 3.9, its sides up to 5.5, flared a little, strapped with
  // iron; its end boards; under it the reach and the bolsters over the axles
  const Z0 = 5.5;
  f.block(wood, at([0, 0, 4.05]), [8.1, 2.85, 0.32], 0.08, AX, 0.05);
  for (const s of [-1, 1]) {
    f.block(wood, at([0, s * 3.0, 4.75]), [8.2, 0.14, 0.82], 0.06, fr([0, -s * 0.12, 1], [1, 0, 0]), 0.05);
    // (its planks, three, their seams; its iron straps and their bolts)
    for (const z of [4.35, 4.9]) f.line([at([-8.15, s * 3.08 + s * (z - 4.75) * 0.12, z]), at([8.15, s * 3.08 + s * (z - 4.75) * 0.12, z])], '#120c08', 1);
    for (const x of [-7.6, -4.2, -0.6, 3.0, 6.4]) {
      f.line([at([x, s * 3.17, 5.48]), at([x, s * 3.0, 3.95])], '#2a2a34', 1);
      f.mark(at([x, s * 3.15, 5.2]), ['#6a6a78'], 1);
      f.mark(at([x, s * 3.08, 4.2]), ['#6a6a78'], 1);
    }
    // (the rub rail along its top edge)
    f.rod(wood, at([-8.2, s * 3.2, 5.5]), at([8.2, s * 3.2, 5.5]), 0.14, 0.14, 0.05);
  }
  for (const x of [-8.2, 8.2]) {
    f.block(wood, at([x, 0, 4.75]), [0.14, 3.05, 0.82], 0.05, AX, 0.05);
    for (const z of [4.35, 4.9]) f.line([at([x * 1.02, -3.0, z]), at([x * 1.02, 3.0, z])], '#120c08', 1);
  }
  f.rod(wood, at([-5.4, 0, 3.4]), at([5.6, 0, 3.0]), 0.28, 0.28, 0.1);
  for (const x of [-5.4, 5.6]) f.block(wood, at([x, 0, 3.6]), [0.35, 3.0, 0.28], 0.08, AX, 0.05);
  // (a water barrel lashed to its side, toward the front)
  f.rod(wood, at([5.0, -3.55, 4.0]), at([5.0, -3.55, 5.6]), 0.5, 0.5, 0.25);
  f.egg(wood, at([5.0, -3.55, 4.8]), [0.6, 0.6, 0.7], AX, 0.4);
  for (const z of [4.2, 5.4]) f.line([at([4.42, -3.8, z]), at([5.58, -3.8, z])], '#2a2a34', 1);

  // THE WHEELS: a felloe of wood round, an iron tyre on it, spokes from a turned hub; the hind pair taller
  for (const [x, R, n] of [[-5.4, 3.35, 14], [5.6, 2.7, 12]] as const) {
    for (const s of [-1, 1]) {
      const y = s * 3.75;
      const ring = (r: number, k = 20): V3[] =>
        Array.from({ length: k + 1 }, (_, i) => {
          const a = roll + (i / k) * Math.PI * 2;
          return [x + Math.cos(a) * r, y, R + Math.sin(a) * r] as V3;
        });
      const fel = ring(R - 0.24);
      const tyre = ring(R - 0.03);
      for (let i = 0; i < 20; i++) {
        f.rod(wood, at(fel[i]), at(fel[i + 1]), 0.26, 0.26, 0.1);
        f.rod(iron, at(tyre[i]), at(tyre[i + 1]), 0.11, 0.11, 0.05);
      }
      // (the spokes, from the hub a little in from the felloe (the wheel's dish), each tapering)
      for (let i = 0; i < n; i++) {
        const a = roll + (i / n) * Math.PI * 2 + 0.13;
        const h0: V3 = [x + Math.cos(a) * 0.45, y + s * 0.18, R + Math.sin(a) * 0.45];
        const h1: V3 = [x + Math.cos(a) * (R - 0.42), y, R + Math.sin(a) * (R - 0.42)];
        f.rod(wood, at(h0), at(h1), 0.14, 0.1, 0.08);
      }
      // (the hub: a turned drum, banded with iron at both ends; the axle's nut)
      f.rod(wood, at([x, y - s * 0.35, R]), at([x, y + s * 0.55, R]), 0.55, 0.42, 0.1);
      for (const dy of [-0.32, 0.5]) f.rod(iron, at([x, y + s * dy - 0.06, R]), at([x, y + s * dy + 0.06, R]), 0.5 - dy * 0.12, 0.5 - dy * 0.12, 0.02);
      f.egg(iron, at([x, y + s * 0.62, R]), [0.2, 0.12, 0.2], AX, 0.03);
    }
    f.rod(iron, at([x, -3.4, R]), at([x, 3.4, R]), 0.18, 0.18, 0.05);
  }

  // THE COVER: canvas drawn tight over its bows, its sides standing straight up from the bed and rounding over the top,
  // half again as high as the bed is wide; the bows standing through it in ridges, the canvas sagging a little between;
  // its ends flaring out, gathered round a drawstring to a puckered mouth; tied down to the bed along its sides. Seen
  // through its mouths, dark inside.
  const HX = [-6.9, -3.45, 0, 3.45, 6.9];
  const CW = 3.3;
  const CTOP = 12.0;
  const CR = 3.3;
  const mouths: { s: number; r: number; z: number }[] = [{ s: 1, r: 1.75, z: 8.9 }];
  if (!w.backOpen) mouths.push({ s: -1, r: 0.95, z: 8.6 });
  else mouths.push({ s: -1, r: 2.6, z: 8.2 });
  const ba = w.burnAt ?? [8.5, 0, 9];
  const canvas = f.stuff({
    tones: CANVAS,
    crease: 0.25,
    paint: (q, nn, lit) => {
      const l = unrot(sub3(q, o));
      const ln = unrot(nn);
      // (hollow, seen from within: its inside, under the bows, in the cold light inside it, dark away from it)
      if (w.hollow && ln[1] * -l[1] + ln[2] * (CTOP - CR - l[2]) > 0.2 && Math.abs(l[0]) < 7.4) {
        // (two lights in it: the cold of what glows inside, and the warm of the dusk in at its open back; the canvas its own
        // cream where neither is strong, dark away from both; stained, a patch sewn over a tear)
        const COLD = ['#07060a', '#0c0e14', '#11181f', '#16242b', '#1d343a', '#2a4c50', '#44706e', '#7aa49a', '#b4d0c0'];
        const WARM = ['#07060a', '#110d0e', '#1c1612', '#2a2018', '#3a2e20', '#4e3e2a', '#685236', '#846a44'];
        const PATCH = ['#07060a', '#0e0a0c', '#181010', '#241814', '#34221a', '#463020', '#5c4028'];
        // (between each two bows the canvas sags: lit in the middle of the bay, darker by the bow it hangs from, a shadow
        // down the bow's far side; wrinkles running down from the bows)
        const bay = (((l[0] + 6.9) % 3.45) + 3.45) % 3.45 / 3.45;
        const sag = Math.sin(bay * Math.PI) * 0.9 - (bay > 0.9 ? 1.2 : 0);
        const wr = Math.sin(l[0] * 7.3 + Math.sin(l[2] * 2.1) * 1.4) > 0.86 ? -1 : 0;
        const stain = fbm(l[0] * 0.55 + 3, l[2] * 0.7 + l[1] * 0.3, 1311) > 0.62 ? -1 : 0;
        const cold = lit * lit * 7;
        const dusk = 1.6 + 2.6 * Math.max(0, Math.min(1, (-l[0] - 1.5) / 5.5)) + (ln[2] < -0.3 ? 0.6 : 0);
        const inPatch = l[0] > 0.6 && l[0] < 2.6 && l[2] > 8.4 && l[2] < 10.6 && l[1] > 0;
        if (inPatch) {
          const edge = l[0] < 0.75 || l[0] > 2.45 || l[2] < 8.55 || l[2] > 10.45;
          if (edge && Math.round(l[0] * 6 + l[2] * 6) % 2 === 0) return '#8a7a5a';
          return PATCH[Math.max(0, Math.min(PATCH.length - 1, Math.round(Math.max(cold, dusk) * 0.8 + sag)))];
        }
        if (cold > dusk) return COLD[Math.max(0, Math.min(COLD.length - 1, Math.round(cold + sag + wr + stain)))];
        return WARM[Math.max(0, Math.min(WARM.length - 1, Math.round(dusk + sag + wr + stain)))];
      }
      // (inside, through a mouth: dark)
      if (Math.abs(l[0]) > 7.3 && ln[0] * l[0] < -0.2) return '#120e0c';
      for (const m of mouths) {
        if (l[0] * m.s < 7.9) continue;
        const d = Math.hypot(l[1], (l[2] - m.z) / 1.06);
        if (d < m.r) return d > m.r - 0.25 ? '#2a221c' : '#0c0a08';
      }
      if (burn > 0) {
        const n = fbm(l[0] * 0.32 + 7, l[2] * 0.42 + l[1] * 0.25, 1301) + (0.6 - Math.hypot(l[0] - ba[0], l[1] - ba[1], l[2] - ba[2]) / 10) * 0.6 * burn;
        const th = 0.86 - burn * 0.22;
        if (n > th + 0.05) return INK;
        if (n > th + 0.025) return '#ffb040';
        if (n > th) return '#c4401c';
        if (n > th - 0.04) return '#3a2a1e';
      }
      // (weathered: the canvas stained a little lower down, where the road's dust has reached it)
      if (l[2] < Z0 + 1.0 && fbm(l[0] * 0.8, l[2] * 1.2, 1303) > 0.68) return '#9a8662';
      return null;
    },
  });
  // (the body of it: one sheet, straight sides, round top; cut off at the bed's top)
  const cz = (CTOP + 1.6) / 2;
  const chz = (CTOP - 1.6) / 2;
  f.block(canvas, at([0, 0, cz]), [7.2, CW, chz], CR, AX, 0.4);
  // (its ends flaring out: at each end a short sheet leaning outward, melted into the body)
  // (standing on the bed's ends, not hanging below them)
  const ez = (CTOP + Z0 - 0.3) / 2;
  const ehz = (CTOP - Z0 + 0.3) / 2;
  for (const s of [-1, 1]) {
    f.block(canvas, at([s * 7.8, 0, ez - 0.15]), [0.85, CW * 1.01, ehz], Math.min(CR * 0.98, ehz * 0.95), fr([s * 0.13, 0, 1], [1, 0, 0]), 0.9);
  }
  // (the sags between the bows: the canvas pressed in, a little, in a broad groove over the top and down each side)
  const arch = (x: number, out: number, k = 22): V3[] => {
    const pts: V3[] = [];
    for (let j = 0; j <= k; j++) {
      const u = j / k;
      // (down the near side, round the top, down the far side)
      const L = Math.PI * CR + 2 * (CTOP - CR - Z0);
      const sd = u * L;
      const side = CTOP - CR - Z0;
      let y: number;
      let z: number;
      if (sd < side) {
        y = -(CW + out);
        z = Z0 + sd;
      } else if (sd > L - side) {
        y = CW + out;
        z = Z0 + (L - sd);
      } else {
        const a = Math.PI - (sd - side) / CR;
        y = Math.cos(a) * (CR + out);
        z = CTOP - CR + Math.sin(a) * (CR + out);
      }
      pts.push([x, y, z]);
    }
    return pts;
  };
  // (the bows under it: each a line where the canvas lies on it, a little darker; between them, where it sags, a soft
  // shadow along the bow's far side)
  for (const x of HX) {
    const pts = arch(x, 0.03, 26).map((q) => at(q));
    f.line(pts, '#9a8662', 1);
    const sh = arch(x - 0.22, 0.02, 26).map((q) => at(q));
    f.line(sh, '#c4ae84', 1);
  }
  // (cut level at the bed's top, inside it)
  f.block(canvas, at([0, 0, 2.5]), [9.5, 4.5, Z0 - 0.15 - 2.5 + 0.4], 0.01, AX, 0.05, true);
  // (hollow, to be seen from within: the canvas a sheet over the bows, the bows bent wood standing under it)
  if (w.hollow) {
    f.block(canvas, at([0, 0, cz - 0.05]), [7.25, CW - 0.18, chz - 0.2], CR - 0.18, AX, 0, true);
    for (const x of HX) {
      const pts = arch(x, -0.3, 18);
      for (let j = 0; j < pts.length - 1; j++) f.rod(wood, at(pts[j]), at(pts[j + 1]), 0.13, 0.13, 0.04);
    }
  }
  // THE MOUTHS: each end gathered by its drawstring to a puckered round mouth (the front's wider, the driver looking out
  // through it); the folds running in to it; the cord round it
  for (const m of mouths) {
    const ex = m.s * 8.75;
    f.egg(canvas, at([ex, 0, m.z]), [1.6, m.r, m.r * 1.08], AX, 0.25, true);
    // (the folds: ridges of canvas running out from the mouth to the rim, and the creases between them)
    // (thrown wide open, there is no gathering left to fold)
    const folds = m.r > 2 ? 0 : 11;
    for (let k = 0; k < folds; k++) {
      const a = (k / folds) * Math.PI * 2 + 0.2;
      const r0 = m.r + 0.2;
      const p0: V3 = [ex + m.s * 0.05, Math.cos(a) * r0, m.z + Math.sin(a) * r0];
      // (out to where the end's rim is, in that direction)
      const ry = Math.cos(a) * 3.1;
      const rz = m.z + Math.sin(a) * 3.0;
      const p1: V3 = [m.s * 7.6, Math.max(-3.2, Math.min(3.2, ry)), Math.max(Z0 + 0.2, Math.min(CTOP - 0.1, rz))];
      f.rod(canvas, at(p0), at(lerp3(p0, p1, 0.55)), 0.24, 0.12, 0.35);
      f.line([at(add3(p0, [m.s * 0.12, Math.cos(a + 0.28) * 0.15, Math.sin(a + 0.28) * 0.15])), at(lerp3(p0, p1, 0.45))], '#4a3e30', 1);
    }
    const cord: V3[] = [];
    for (let k = 0; k <= 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      cord.push([ex + m.s * 0.1, Math.cos(a) * (m.r + 0.12), m.z + Math.sin(a) * (m.r + 0.12) * 1.06]);
    }
    // (thrown wide open, its drawstring let out and gone slack inside: no cord round it)
    if (m.r <= 2) for (let k = 0; k < 16; k++) f.rod(rope, at(cord[k]), at(cord[k + 1]), 0.06, 0.06, 0.03);
  }
  // (tied down along its sides: a rope from each bow's foot to a cleat on the bed)
  for (const x of HX) {
    for (const s of [-1, 1]) {
      f.rod(rope, at([x - 0.4, s * (CW + 0.05), Z0 + 0.5]), at([x + 0.25, s * 3.28, 5.0]), 0.07, 0.07, 0.03);
      f.egg(iron, at([x + 0.3, s * 3.28, 4.95]), [0.14, 0.08, 0.1], AX, 0.02);
    }
  }
  if (w.ribs !== false) {
    // (the bows' feet, where they stand in their staples on the bed's sides)
    for (const x of HX) for (const s of [-1, 1]) f.rod(wood, at([x, s * 3.25, 4.6]), at([x, s * 3.3, Z0 + 0.6]), 0.12, 0.12, 0.05);
  }

  // THE DRIVER'S BOX: the seat across the front of the bed, on its risers; the footboard below it, sloping out
  f.block(wood, at([8.55, 0, 6.35]), [0.55, 2.8, 0.16], 0.06, AX, 0.05);
  for (const s of [-1, 1]) f.rod(wood, at([8.35, s * 2.6, 5.4]), at([8.6, s * 2.6, 6.25]), 0.12, 0.12, 0.05);
  f.block(wood, at([8.25, 0, 7.0]), [0.12, 2.8, 0.55], 0.05, AX, 0.05);
  f.block(wood, at([9.85, 0, 5.0]), [0.95, 2.5, 0.12], 0.05, fr(unit([-0.5, 0, 0.86]), [0.86, 0, 0.5]), 0.05);
  f.block(wood, at([9.0, 0, 4.55]), [0.9, 2.6, 0.12], 0.05, AX, 0.05);
  // (the brake's lever up beside the seat)
  f.rod(iron, at([8.1, 3.15, 4.4]), at([8.9, 3.25, 8.2]), 0.09, 0.07, 0.03);
  f.egg(wood, at([8.92, 3.25, 8.3]), [0.12, 0.12, 0.25], AX, 0.03);

  // THE DRIVER
  if (w.driver === 'armourer') {
    // (the armourer, the company's own driver (art/cast.ts), at half the measure: hunched forward over his knees on the
    // seat, the reins in his fists, out to the horse)
    const leath = f.stuff({ tones: [INK, '#1a0e08', '#40261a', '#583420', '#704628'] });
    Cast.place(f, at([8.7, -0.6, 4.18]), yaw + Math.PI / 2, () => {
      const b = Cast.armourer(f, {
        pelvis: [0, 0.2, 5.45],
        lean: 0.42,
        nod: -0.3,
        turn: 0,
        hands: [[-1.0, -4.4, 8.4], [1.0, -4.3, 8.5]],
        elbows: [[-0.6, 0.4, -1], [0.6, 0.4, -1]],
        fingers: [[0.2, -1, -0.35], [-0.2, -1, -0.35]],
        palms: [[0.5, 0, -1], [-0.5, 0, -1]],
        feet: [[-1.2, -3.8, 0.4], [1.2, -3.4, 0.3]],
        knees: [[-0.3, -1, 0.6], [0.3, -1, 0.6]],
      }, ['grip', 'grip']);
      for (const j of [0, 1] as const) f.rod(leath, b.wrists[j], [j ? 0.7 : -0.7, -16, 4.5], 0.12, 0.12, 0);
    }, 0.5);
  } else if (w.driver) {
    // (a driver hunched on the seat in his cloak and hood, the reins in his hands)
    const cloak = f.stuff({ tones: [INK, '#120e14', '#1e1822', '#2c2432', '#3e3446'], crease: 0.8 });
    f.egg(cloak, at([8.5, -0.7, 7.6]), [0.9, 0.85, 1.35], [rot(unit([1, 0, -0.3])), rot([0, 1, 0]), rot(unit([0.3, 0, 1]))] as const, 0.5);
    f.egg(cloak, at([8.95, -0.7, 9.1]), [0.5, 0.48, 0.55], undefined, 0.4);
    f.rod(cloak, at([8.95, -0.7, 9.4]), at([8.6, -0.7, 9.9]), 0.32, 0.08, 0.3);
    f.rod(cloak, at([8.7, -0.7, 8.2]), at([9.8, -0.7, 7.4]), 0.3, 0.22, 0.3);
    f.rod(cloak, at([8.7, -0.7, 7.0]), at([10.0, -0.7, 6.6]), 0.4, 0.3, 0.3);
    f.rod(cloak, at([10.0, -0.7, 6.6]), at([10.4, -0.7, 5.1]), 0.32, 0.26, 0.3);
  }

  // THE SHAFTS out along the horse's sides to his shoulders, held up in the tugs of his saddle; the swingletree across
  // the front of the bed for his traces
  if (w.horse) {
    for (const s of [-1, 1]) {
      f.rod(wood, at([8.1, s * 1.75, 3.75]), at([12.6, s * 1.75, 6.2]), 0.17, 0.15, 0.05);
      f.rod(wood, at([12.6, s * 1.75, 6.2]), at([16.35, s * 1.75, 6.95]), 0.15, 0.14, 0.05);
      f.rod(wood, at([16.35, s * 1.75, 6.95]), at([18.6, s * 1.68, 7.15]), 0.14, 0.1, 0.05);
      f.egg(iron, at([18.65, s * 1.68, 7.15]), [0.14, 0.1, 0.14], AX, 0.02);
    }
    f.rod(wood, at([8.6, -1.5, 4.35]), at([8.6, 1.5, 4.35]), 0.13, 0.13, 0.05);
    sculptHorse2(f, at([15.4, 0, 0]), yaw, w.horse.ph, w.horse.gallop);
  }

  // THE LANTERN on its iron crook off the front corner, lit
  let lamp: V3 | null = null;
  if (w.lampSide) {
    const s = w.lampSide;
    const glass = f.stuff({ tones: ['#7a3a10', '#c8641c', '#ff9a2a', '#ffd060', '#fff2b0'], paint: (_q, nn) => (nn[2] > 0.6 ? '#2a2a34' : '#ffd060') });
    // (high on a tall crook, out over the horse's rump, above the driver's head: lighting him and the road before them)
    const X = 10.4;
    const Z = 11.9;
    f.rod(iron, at([8.0, s * 3.15, 5.3]), at([8.3, s * 3.25, Z + 1.1]), 0.13, 0.11, 0.05);
    f.rod(iron, at([8.3, s * 3.25, Z + 1.1]), at([X, s * 3.25, Z + 1.2]), 0.1, 0.1, 0.05);
    f.rod(iron, at([X, s * 3.25, Z + 1.2]), at([X, s * 3.25, Z + 0.65]), 0.06, 0.06, 0.02);
    f.block(glass, at([X, s * 3.25, Z]), [0.36, 0.36, 0.5], 0.08, AX, 0.05);
    f.egg(iron, at([X, s * 3.25, Z + 0.6]), [0.42, 0.42, 0.16], undefined, 0.05);
    f.egg(iron, at([X, s * 3.25, Z - 0.58]), [0.42, 0.42, 0.1], undefined, 0.05);
    for (const [u, v] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) f.rod(iron, at([X + u * 0.36, s * 3.25 + v * 0.36, Z - 0.55]), at([X + u * 0.36, s * 3.25 + v * 0.36, Z + 0.55]), 0.05, 0.05, 0.02);
    lamp = at([X, s * 3.25, Z]);
  }
  return { lamp };
}
