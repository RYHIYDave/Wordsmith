// THE KNIGHT OF THE OPENING, BUILT NEW (art/opening.ts). His words, 25 Oct 2026, of the box of the two walking: “The
// proportions are off, the knight needs beef.  The sword clips through his shoulder.”; and, asked how the people should be
// made from there, his pick: “Rebuild them new (Recommended)” (offered as: throw out the mock-up figures and build each
// character again from scratch, properly; one at a time, shown to him before going in the film).
//
// The game's own knight (art/hero3_knight.ts, his pick): over all of his head a round helm, out from his face a VISOR drawn
// to a point, over it the two slots he sees through with a point of the friend's light in each, in it the holes he
// breathes through; mail at his neck, arms and thighs; the RED TABARD over his trunk to the middle of his thighs, open at
// the sides, its hem cut into points, a PLUM BELT with its buckle of cyan; STEEL on his shoulders, elbows, forearms, knees,
// shins and feet; PLUM GLOVES; the DARK RED SCARF wound thick round his neck, its two ends flying; the GREAT SWORD, lit cyan.
//
// Built here as a big man: broad, deep in the chest, thick in the neck and the limbs; his plate standing out from him with
// its thickness, each plate with its rolled edge; his shoulders great domes with plates stepping down the arm under them
// and a ridge standing up at the neck; his elbows and knees each with its fan; the tabard a heavy cloth hanging off his
// chest before and behind, split at the sides. A tenth of a metre a unit, up z, his front toward -y (as art/cast.ts); his
// joints art/anatomy.ts's.

import type { Figure } from './sdf';
import type { V3 } from './comic';
import { INK } from './comic';
import { at, frameAt, onChest, onHead, pose } from './anatomy';
import type { Body, Build, Frame, Pose } from './anatomy';
import { T } from './cast';
import { HANDS, wireHand } from './opening_hand';

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const ax3 = (x: V3, y: V3, z: V3): readonly [V3, V3, V3] => [x, y, z];
/** Axes for a part lying along `z0`: its first line as near `hint` as can be at right angles to it. */
const along = (z0: V3, hint: V3): readonly [V3, V3, V3] => {
  const z = unit(z0);
  let x = sub(hint, mul(z, dot(hint, z)));
  if (len(x) < 1e-4) x = Math.abs(z[2]) < 0.9 ? cross(z, [0, 0, 1]) : cross(z, [1, 0, 0]);
  x = unit(x);
  return [x, cross(z, x), z];
};

/** His tones: the game's (art/cast.ts), and the darker steel of a plate's rolled edge. */
const EDGE = [INK, '#1a1840', '#2c2862', '#46408a', '#6460b0', '#8e88d4', '#bab4f0'];
/** The blade, lit from within: never darker than the deep cyan. */
const GLOW = ['#0c6a80', '#1aa8c0', '#22d0e0', '#5ae6ea', '#8af6f0', '#e6ffff'];
const LIGHT = ['#8af6f0', '#c8fff8', '#e6ffff'];
/** The dusk's horizon, given back by his steel. */
const SUNSET = '#f0a070';

/** How the knight is built: tall, broad, heavy (art/anatomy.ts). */
export const KNIGHT_BUILD: Build = { tall: 18.6, broad: 1.36, heavy: 1.45 };
/** How big his gloved hands are (art/anatomy.ts hand), in a man's units. */
const GLOVE = 1.22;
/** From the middle of the fist to the guard. */
const GUARD = 0.78;

export interface KnightSword {
  /** The fist that holds it (0 his right, 1 his left); `two`, the other fist on its grip too. */
  hand: 0 | 1;
  /** Where its point is. */
  tip: V3;
  two?: boolean;
  /** Which way the flat of its blade faces (by default, his front). */
  face?: V3;
}

/** A fist's frame closed round a haft along `dir`: its thumb toward the blade (art/anatomy.ts hand: the thumb at -x). */
function gripFrame(b: Body, j: 0 | 1, dir: V3): Frame {
  const F0 = b.handFrames[j];
  let z = sub(F0.z, mul(dir, dot(F0.z, dir)));
  if (len(z) < 0.2) z = sub(b.fwd, mul(dir, dot(b.fwd, dir)));
  z = unit(z);
  const F = frameAt(b.wrists[j], z, j === 0 ? cross(z, dir) : cross(dir, z));
  return j === 0 ? { ...F, x: mul(F.x, -1) } : F;
}
/** The middle of the haft in a fist closed round it. */
const inFist = (F: Frame, k: number): V3 => at(F, 0, -0.27 * GLOVE * k, 0.8 * GLOVE * k);

/** Where a shoulder's great plate is: its middle, its axes, its sizes (so that what rests on it can be put on it). */
function pauldron(b: Body, j: 0 | 1): { c: V3; A: readonly [V3, V3, V3]; r: V3; ua: V3; out: V3 } {
  const k = b.k;
  const s = j ? 1 : -1;
  const sh = b.shoulders[j];
  const ua = unit(sub(b.elbows[j], sh));
  // (it sits over the point of the shoulder however the arm is raised: its own up the trunk's, leaning a little with the arm)
  const lean = unit(add(mul(b.up, -1), mul(ua, 0.45)));
  const out = unit(sub(mul(b.across, s), mul(lean, dot(mul(b.across, s), lean))));
  const A = ax3(unit(cross(lean, out)), out, mul(lean, -1));
  return { c: add(add(sh, mul(b.up, 0.3 * k)), mul(out, 0.26 * k)), A, r: [1.22 * k, 1.14 * k, 0.94 * k], ua: lean, out };
}

/**
 * Where to put the point of his great sword, its blade `length` long, held in the fist of `hand` and lying on the top of
 * the shoulder `on`: just over the steel of it, so that it rests on it and does not go through it; and which way its flat
 * then faces (up, so that it lies on the shoulder flat). For a pose `P`.
 */
export function swordOnShoulder(P: Pose, handJ: 0 | 1, on: 0 | 1, length = 11): { tip: V3; face: V3 } {
  const b = pose(KNIGHT_BUILD, P);
  const k = b.k;
  const pd = pauldron(b, on);
  // (the top of the plate, along the trunk's up: the egg's reach that way; and the blade's half-thickness over it)
  const ext = Math.sqrt(pd.A.reduce((s, a, i) => s + (pd.r[i] * dot(a, b.up)) ** 2, 0));
  const rest = add(pd.c, mul(b.up, ext + 0.16 * k));
  let dir = unit(sub(rest, b.wrists[handJ]));
  let g: V3 = b.wrists[handJ];
  for (let i = 0; i < 3; i++) {
    g = inFist(gripFrame(b, handJ, dir), k);
    dir = unit(sub(rest, g));
  }
  const guard = add(g, mul(dir, GUARD * k));
  const face = unit(sub(b.up, mul(dir, dot(b.up, dir))));
  return { tip: add(guard, mul(dir, length)), face };
}

/**
 * THE KNIGHT sculpted into `f`, posed `P` (art/anatomy.ts): his great sword in the fist of `sword.hand` (both fists on it if
 * `two`), its point at `tip`, its flat turned to `face`; or none. `flap` how his scarf's ends fly; what his empty hands do.
 * The same as art/cast.ts's `knight`, for the opening's shots.
 */
export function knight4(f: Figure, P: Pose, sword: KnightSword | null, flap = 0, kinds: readonly ['fist' | 'flat' | 'open', 'fist' | 'flat' | 'open'] = ['fist', 'fist']): Body {
  const b = pose(KNIGHT_BUILD, P);
  const k = b.k;
  const hb = 1.12;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  // (his hips' own lines: tipped when his weight is on one leg, his belt and the hang of his tabard with them)
  const hx = unit(sub(b.hips[1], b.hips[0]));
  const hz = unit(sub(b.up, mul(hx, dot(b.up, hx))));
  const PA = ax3(hx, cross(hz, hx), hz);
  const steel = f.stuff({ tones: T.steel, shine: 0.4, crease: 0.55, grain: 0.04, metal: 0.72, horizon: SUNSET });
  const edge = f.stuff({ tones: EDGE, shine: 0.34, crease: 0.4, grain: 0.03, metal: 0.6, horizon: SUNSET });
  // (mail: rings in rows, each ring's lower curve dark and, in the light, its upper curve bright: fine, a texture more than
  // a pattern)
  const mail = f.stuff({
    tones: T.mail, crease: 0.7, grain: 0.1, folds: 0.4, shine: 0.12,
    paint: (q, n, v) => {
      const rw = q[2] * 5.2;
      const row = Math.floor(rw);
      const fr = rw - row;
      const hc = Math.abs(n[1]) > Math.abs(n[0]) ? q[0] : q[1];
      const ring = hc * 5.2 + (row % 2) * 0.5;
      const fc = ring - Math.floor(ring);
      const d = Math.hypot(fc - 0.5, (fr - 0.55) * 1.25);
      const band = Math.max(1, Math.min(T.mail.length - 1, Math.round(v * (T.mail.length - 1))));
      if (d > 0.3 && d < 0.46 && fr < 0.55) return T.mail[Math.max(1, band - 1)];
      if (d > 0.28 && d < 0.42 && fr > 0.62 && v > 0.35) return T.mail[Math.min(T.mail.length - 1, band + 1)];
      return null;
    },
  });
  const red = f.stuff({ tones: T.red, crease: 0.85, grain: 0.1 });
  const wine = f.stuff({ tones: T.wine, crease: 0.85, grain: 0.12 });
  const plum = f.stuff({ tones: T.plum, crease: 0.6, grain: 0.12 });
  const blade = f.stuff({ tones: GLOW, shine: 0.5, crease: 0.2, grain: 0.0 });
  const light = f.stuff({ tones: LIGHT, crease: 0, grain: 0 });

  /** A rolled edge round a plate: a ring round `c` square to `n`, `r` out, from `from` to `to` (radians from `x`). */
  const rim = (c: V3, n: V3, x: V3, r: number, th: number, from = 0, to = Math.PI * 2, steps = 18): void => {
    const A = along(n, x);
    let prev: V3 | null = null;
    for (let i = 0; i <= steps; i++) {
      const an = from + ((to - from) * i) / steps;
      const q = add(c, add(mul(A[0], Math.cos(an) * r), mul(A[1], Math.sin(an) * r)));
      if (prev) f.rod(edge, prev, q, th, th, 0.04);
      prev = q;
    }
  };
  const rivet = (q: V3, r = 0.1): void => void f.egg(edge, q, [r * k, r * k, r * k], TA, 0.01);

  // THE SWORD'S LINE, and the fists on it
  let sdir: V3 = [0, 0, 1];
  let gM: V3 = [0, 0, 0];
  const frames: Frame[] = [b.handFrames[0], b.handFrames[1]];
  if (sword) {
    sdir = unit(sub(sword.tip, b.wrists[sword.hand]));
    for (let i = 0; i < 3; i++) {
      frames[sword.hand] = gripFrame(b, sword.hand, sdir);
      gM = inFist(frames[sword.hand], k);
      sdir = unit(sub(sword.tip, gM));
    }
    if (sword.two) frames[1 - sword.hand] = gripFrame(b, (1 - sword.hand) as 0 | 1, sdir);
  }

  // THE BODY under it all, in mail where it shows: a deep barrel of a chest, broad over the shoulders, a thick waist
  f.egg(mail, onChest(b, 0, 0.05, -0.1), [1.7 * k * hb, 1.32 * k * hb, 1.6 * k], TA, 0.6);
  f.egg(mail, onChest(b, 0, -0.3, 0.6), [2.0 * k * hb, 0.98 * k * hb, 0.8 * k], TA, 0.6);
  f.rod(mail, onChest(b, 0, 0.0, -1.0), b.waist, 1.42 * k * hb, 1.34 * k * hb, 0.5);
  f.egg(mail, b.pelvis, [1.62 * k * hb, 1.22 * k * hb, 1.0 * k], PA, 0.5);
  // (his neck, thick, in the mail of his coif, from under his helm down to his shoulders)
  f.rod(mail, onHead(b, 0, -0.15, -0.6), onChest(b, 0, -0.15, 1.35), 1.0 * k, 0.95 * k, 0.4);
  f.egg(mail, onChest(b, 0, -0.15, 1.62), [1.3 * k * hb, 1.0 * k * hb, 0.42 * k], TA, 0.4);

  // THE TABARD over his trunk: heavy red cloth over his chest and back, a little off him; from under his chest it hangs before
  // him and behind him to the middle of his thighs, clear of his legs however they go; open at the sides, where his mail
  // shows; its hem cut into points; the plum belt round it, its buckle of cyan
  f.egg(red, onChest(b, 0, 0.1, -0.05), [1.76 * k * hb, 1.42 * k * hb, 1.64 * k], TA, 0.5);
  f.egg(red, onChest(b, 0, -0.28, 0.86), [2.12 * k * hb, 1.12 * k * hb, 0.94 * k], TA, 0.5);
  f.rod(red, onChest(b, 0, 0.05, -1.0), add(b.waist, mul(b.up, -0.3 * k)), 1.5 * k * hb, 1.42 * k * hb, 0.5);
  const hemZ = b.pelvis[2] - 2.85 * k;
  /** Where a leg comes down to a height (along the thigh, then the shin). */
  const legAt = (j: 0 | 1, z: number): V3 => {
    const ch = [b.hips[j], b.knees[j], b.ankles[j]];
    for (let i = 0; i < 2; i++) if ((ch[i][2] - z) * (ch[i + 1][2] - z) <= 0 && ch[i][2] !== ch[i + 1][2]) return lerp(ch[i], ch[i + 1], (ch[i][2] - z) / (ch[i][2] - ch[i + 1][2]));
    return ch[2];
  };
  const fwdFlat = unit([b.fwd[0], b.fwd[1], 0]);
  const acFlat = unit([b.across[0], b.across[1], 0]);
  /** A point of cloth pushed out of his legs, to `r` from the bone of the nearer (a knee raised, a leg bent under him). */
  const clearOfLegs = (q: V3, r: number): V3 => {
    let out = q;
    for (const j of [0, 1] as const) {
      for (const [a0, a1] of [[b.hips[j], b.knees[j]], [b.knees[j], b.ankles[j]]] as const) {
        const ab = sub(a1, a0);
        const t = Math.max(0, Math.min(1, dot(sub(out, a0), ab) / dot(ab, ab)));
        const c = add(a0, mul(ab, t));
        const d = sub(out, c);
        const L = len(d);
        if (L < r) out = add(c, mul(L > 1e-4 ? mul(d, 1 / L) : b.fwd, r));
      }
    }
    return out;
  };
  const top0 = add(b.waist, mul(b.up, -0.15 * k));
  const legMid = lerp(legAt(0, hemZ), legAt(1, hemZ), 0.5);
  const hemC: V3 = [legMid[0], legMid[1], hemZ];
  for (const e of [-1, 1]) {
    // (a panel before him and one behind: falling from his belt in heavy folds round the front (the back) of his thighs to
    // the middle of them, clear of his legs however they go; its hem a row of points; between the two, at each side, mail)
    let reachOut = 0;
    for (const j of [0, 1] as const) reachOut = Math.max(reachOut, dot(sub(legAt(j, hemZ + 0.3 * k), hemC), fwdFlat) * e);
    const fy = Math.max(reachOut, 0) + 1.2 * k * hb;
    const N = 9;
    for (let i = 0; i < N; i++) {
      const th = (-1 + (2 * i) / (N - 1)) * 1.08;
      const a = add(top0, add(mul(acFlat, Math.sin(th) * 1.5 * k * hb), mul(fwdFlat, e * Math.cos(th) * 1.38 * k * hb)));
      const wob = 0.09 * k * Math.sin(i * 2.3 + e);
      const z = hemZ + (i % 2 ? 0.14 * k : -0.04 * k);
      const bq = clearOfLegs(add([hemC[0], hemC[1], z], add(mul(acFlat, Math.sin(th) * 1.85 * k * hb), mul(fwdFlat, e * (Math.cos(th) * fy + wob)))), 1.12 * k * hb);
      f.rod(red, a, bq, 0.24 * k, 0.3 * k, 0.32);
      f.rod(red, bq, clearOfLegs(add(bq, [0, 0, -0.6 * k]), 0.95 * k * hb), 0.28 * k, 0.03 * k, 0.1);
    }
  }
  // (the belt over the tabard at his waist; its buckle, a stone of the friend's cyan in it)
  const beltAt = add(b.waist, mul(b.up, -0.15 * k));
  f.egg(plum, beltAt, [1.8 * k * hb, 1.68 * k * hb, 0.3 * k], PA, 0.05);
  const buckle = add(beltAt, mul(b.fwd, 1.76 * k * hb));
  f.block(edge, buckle, [0.36 * k, 0.1 * k, 0.28 * k], 0.06 * k, PA, 0.02);
  f.egg(light, add(buckle, mul(b.fwd, 0.08 * k)), [0.12 * k, 0.06 * k, 0.12 * k], TA, 0);

  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    const sh = b.shoulders[j];
    // THE SHOULDER: a great dome of steel over its point, its rolled edge; three plates stepping down the arm under it, each
    // with its edge and a rivet; a ridge of steel standing up from it at the side of his neck
    const pd = pauldron(b, j);
    f.egg(steel, pd.c, pd.r, pd.A, 0.04);
    const c2 = add(pd.c, mul(pd.ua, 0.62 * k));
    f.egg(steel, c2, [1.14 * k, 1.08 * k, 0.74 * k], pd.A, 0.3);
    rim(add(c2, mul(pd.ua, 0.44 * k)), pd.ua, pd.out, 1.0 * k, 0.09 * k, -2.1, 2.1);
    const c3 = add(pd.c, mul(pd.ua, 1.5 * k));
    f.egg(steel, c3, [1.02 * k, 0.96 * k, 0.32 * k], pd.A, 0.02);
    rivet(add(add(c2, mul(pd.out, 1.0 * k)), mul(pd.ua, 0.1 * k)), 0.09);
    f.block(steel, add(add(sh, mul(b.up, 1.02 * k)), mul(b.across, -s * 0.48 * k)), [0.08 * k, 0.66 * k, 0.38 * k], 0.06 * k, TA, 0.05);
    // (the upper arm in mail, thick; the elbow's cop, a cup over its point, and its fan; the forearm in a shell of steel)
    f.rod(mail, lerp(sh, b.elbows[j], 0.2), b.elbows[j], 0.86 * k * hb, 0.68 * k * hb, 0.35);
    f.egg(mail, add(sh, mul(b.up, -0.4 * k)), [0.72 * k, 0.72 * k, 0.66 * k], TA, 0.3);
    const fa = sub(b.wrists[j], b.elbows[j]);
    const ua = unit(sub(b.elbows[j], sh));
    const outE = unit(sub(mul(b.across, s), mul(ua, dot(mul(b.across, s), ua))));
    // (the point of the elbow: away from the inside of its bend; behind the arm if it is straight)
    let pt = sub(ua, unit(fa));
    if (len(pt) < 0.15) pt = sub(mul(b.fwd, -1), mul(ua, dot(mul(b.fwd, -1), ua)));
    pt = unit(pt);
    const cup = add(b.elbows[j], mul(pt, 0.3 * k));
    f.egg(steel, cup, [0.74 * k, 0.74 * k, 0.6 * k], along(pt, outE), 0.06);
    f.egg(steel, add(cup, mul(outE, 0.55 * k)), [0.16 * k, 0.72 * k, 0.64 * k], along(fa, outE), 0.04);
    f.rod(steel, lerp(b.elbows[j], b.wrists[j], 0.14), lerp(b.elbows[j], b.wrists[j], 0.86), 0.74 * k * hb, 0.56 * k * hb, 0.1);
    rim(lerp(b.elbows[j], b.wrists[j], 0.16), fa, b.fwd, 0.82 * k * hb, 0.07 * k);
    // (the glove, plum leather, its cuff flared over the end of the steel)
    f.rod(plum, lerp(b.elbows[j], b.wrists[j], 0.8), b.wrists[j], 0.7 * k * hb, 0.44 * k, 0.1);
    const holds = !!sword && (sword.hand === j || !!sword.two);
    // (his glove on the hand's wire: art/opening_hand.ts)
    wireHand(f, plum, frames[j], GLOVE * k, HANDS[holds ? 'grip' : kinds[j]]);

    // THE LEG: the thigh in mail, thick; the knee's cop and its fan; the greave down the shin, its ridge, the calf in it; the
    // foot in plates
    const hip = b.hips[j];
    const kn = b.knees[j];
    const an = b.ankles[j];
    const sn = sub(an, kn);
    const kf = unit(sub(b.fwd, mul(unit(sn), dot(b.fwd, unit(sn)))));
    f.rod(mail, hip, kn, 1.06 * k * hb, 0.8 * k * hb, 0.4);
    f.egg(steel, add(kn, mul(kf, 0.46 * k)), [0.8 * k, 0.68 * k, 0.76 * k], along(sn, b.across), 0.08);
    f.egg(steel, add(add(kn, mul(kf, 0.14 * k)), mul(b.across, s * 0.7 * k)), [0.16 * k, 0.74 * k, 0.7 * k], along(sn, mul(b.across, s)), 0.04);
    f.rod(steel, lerp(kn, an, 0.12), lerp(kn, an, 0.9), 0.8 * k * hb, 0.58 * k * hb, 0.1);
    f.egg(steel, add(lerp(kn, an, 0.36), mul(kf, -0.18 * k)), [0.8 * k * hb, 0.76 * k * hb, 1.3 * k], along(sn, b.across), 0.3);
    f.line([add(lerp(kn, an, 0.16), mul(kf, 0.86 * k * hb)), add(lerp(kn, an, 0.5), mul(kf, 0.76 * k * hb)), add(lerp(kn, an, 0.88), mul(kf, 0.64 * k * hb))], '#3a3478', 1);
    rim(lerp(kn, an, 0.88), sn, b.fwd, 0.66 * k * hb, 0.07 * k);
    const dir = unit([b.fwd[0], b.fwd[1], 0]);
    const ground = Math.max(0, an[2] - 0.8 * k);
    const heel: V3 = add([an[0], an[1], ground + 0.46 * k], mul(dir, -0.6 * k));
    const toe: V3 = add([an[0], an[1], ground + 0.26 * k], mul(dir, 2.35 * k));
    f.rod(steel, an, heel, 0.58 * k, 0.48 * k, 0.2);
    f.rod(steel, heel, toe, 0.54 * k, 0.24 * k, 0.25);
    for (const u of [0.38, 0.56, 0.74]) {
      const c = lerp(heel, toe, u);
      const r = (0.54 - u * 0.3) * k;
      rim(c, sub(toe, heel), [0, 0, 1], r * 1.04, 0.045 * k, -Math.PI / 2 - 0.25, Math.PI / 2 + 0.25, 10);
    }
  }

  // THE SCARF wound thick round his neck, up to hide his chin; its knot at the back; its two ends flying from it
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const lift = 0.36 + 0.18 * Math.cos(a) + 0.08 * Math.sin(a * 3);
    f.egg(wine, onChest(b, Math.sin(a) * 1.18, Math.cos(a) * 1.0 - 0.08, 1.55 + lift), [0.62 * k, 0.6 * k, 0.52 * k], TA, 0.3);
  }
  f.egg(wine, onChest(b, 0, 0.8, 2.45), [1.0 * k, 0.55 * k, 0.4 * k], TA, 0.3);
  f.egg(wine, onChest(b, 0.15, 0.9, 1.62), [1.25 * k, 0.55 * k, 0.4 * k], TA, 0.3);
  const knot = onChest(b, 0.5, -1.1, 1.95);
  f.egg(wine, knot, [0.45 * k, 0.42 * k, 0.45 * k], TA, 0.2);
  for (const e of [0, 1]) {
    let prev = knot;
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const wave = Math.sin(u * 4.4 + flap * 2.2 + e * 1.4);
      const q = add(knot, add(add(mul(b.fwd, -(0.5 + 2.1 * u + e * 0.5 * u) * k), mul(b.across, (0.35 + (1.6 + e * 0.5) * u) * k)), mul(b.up, (-0.25 - (1.5 + e * 0.6) * u + wave * 0.35 * u) * k)));
      const d = unit(sub(q, prev));
      const side = unit(cross(d, b.up));
      const nrm = unit(cross(side, d));
      const wide = (e ? 0.36 : 0.42) * (1 - u * 0.35) * k;
      const tw = wave * 0.6;
      f.egg(wine, lerp(prev, q, 0.5), [wide, 0.1 * k, len(sub(q, prev)) * 0.6], ax3(unit(add(mul(side, Math.cos(tw)), mul(nrm, Math.sin(tw)))), unit(add(mul(nrm, Math.cos(tw)), mul(side, -Math.sin(tw)))), d), 0.15);
      prev = q;
    }
  }

  // THE HELM over all of his head: the round skull of steel, its rolled rim round its foot; a ridge over its crown from brow
  // to nape; out from his face and a little down the visor, a snout of steel drawn to a point, hung on a rivet at each
  // temple; over it the two slots he sees through, a point of the friend's light in each; in it the holes he breathes through
  const HC: V3 = [0, -0.04, 0.2];
  const HR: V3 = [1.3, 1.42, 1.36];
  /** A point on the skull of the helm: `az` round from his nose (+ to his left), at height `c` (a man's head units). */
  const onSkull = (az: number, c: number, out = 0): V3 => {
    const rr = Math.sqrt(Math.max(0, 1 - ((c - HC[2]) / HR[2]) ** 2));
    return onHead(b, Math.sin(az) * (HR[0] * rr + out), HC[1] + Math.cos(az) * (HR[1] * rr + out), c);
  };
  f.egg(steel, onHead(b, HC[0], HC[1], HC[2]), [HR[0] * k, HR[1] * k, HR[2] * k], HA, 0.3);
  rim(onHead(b, 0, -0.04, -0.8), b.hup, b.hacross, 1.12 * k, 0.12 * k);
  {
    const crest: V3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = -1.25 + (i / 10) * 2.5;
      crest.push(onHead(b, 0, Math.sin(t) * (HR[1] + 0.04), HC[2] + Math.cos(t) * (HR[2] + 0.04)));
    }
    for (let i = 1; i < crest.length; i++) f.rod(steel, crest[i - 1], crest[i], 0.13 * k, 0.13 * k, 0.12);
  }
  const root = onHead(b, 0, 0.72, -0.32);
  const point = onHead(b, 0, 2.48, -0.62);
  const snout = add(lerp(root, point, 0.55), mul(b.hup, 0.04 * k));
  f.rod(steel, root, snout, 0.92 * k, 0.56 * k, 0.24);
  f.rod(steel, snout, point, 0.56 * k, 0.12 * k, 0.2);
  f.egg(steel, onHead(b, 0, 0.9, -0.36), [1.02 * k, 0.7 * k, 0.78 * k], HA, 0.28);
  // (the visor's edge where it lies on the skull; the ridge down its snout)
  {
    const vr: V3[] = [];
    for (let i = 0; i <= 16; i++) {
      const az = -1.3 + (i / 16) * 2.6;
      vr.push(onSkull(az, 0.4 - 0.66 * Math.abs(az / 1.3) ** 1.5, 0.06));
    }
    for (let i = 1; i < vr.length; i++) f.rod(edge, vr[i - 1], vr[i], 0.07 * k, 0.07 * k, 0.03);
    f.rod(edge, onHead(b, 0, 1.1, 0.48), onHead(b, 0, 1.75, 0.12), 0.07 * k, 0.06 * k, 0.05);
    f.rod(edge, onHead(b, 0, 1.75, 0.12), onHead(b, 0, 2.44, -0.5), 0.06 * k, 0.05 * k, 0.05);
  }
  for (const s of [-1, 1]) {
    // (the slot: cut across the skull over the visor, from near his nose round toward his temple; its light)
    const sl: V3[] = [];
    for (let i = 0; i <= 6; i++) sl.push(onSkull(s * (0.12 + i * 0.13), 0.5 - i * 0.012, 0.02));
    for (let i = 1; i < sl.length; i++) f.rod(steel, sl[i - 1], sl[i], 0.1 * k, 0.1 * k, 0.04, true);
    f.egg(light, onSkull(s * 0.4, 0.5, -0.06), [0.09 * k, 0.07 * k, 0.07 * k], HA, 0);
    // (the hinge's rivet at the temple)
    f.egg(edge, onSkull(s * 1.45, 0.05, 0.06), [0.17 * k, 0.17 * k, 0.17 * k], HA, 0.02);
    // (the holes he breathes through, in rows down the side of the snout)
    for (let i = 0; i < 3; i++)
      for (let jj = 0; jj < 2; jj++) {
        const u = 0.22 + i * 0.13;
        const c = lerp(root, point, u);
        const r = u < 0.55 ? 0.92 + (0.56 - 0.92) * (u / 0.55) : 0.56 + (0.12 - 0.56) * ((u - 0.55) / 0.45);
        const q = add(c, add(mul(b.hacross, s * (r * 0.72) * k), mul(b.hup, (0.22 - jj * 0.3) * r * k)));
        f.egg(steel, q, [0.06 * k, 0.06 * k, 0.06 * k], HA, 0, true);
        f.mark(q, [INK], 1);
      }
  }

  // THE GREAT SWORD: a long grip bound in plum, a wheel of steel for its pommel; the cross of its guard, its ends turned to the
  // blade; the long blade, lit cyan, its fuller down the middle of each flat, drawn to its point
  if (sword) {
    let face = sword.face ?? b.fwd;
    face = sub(face, mul(sdir, dot(face, sdir)));
    if (len(face) < 0.2) face = sub(b.up, mul(sdir, dot(b.up, sdir)));
    face = unit(face);
    const side = unit(cross(sdir, face));
    const SA = ax3(side, face, sdir);
    const G = add(gM, mul(sdir, GUARD * k));
    const end = add(G, mul(sdir, -2.5 * k));
    f.rod(plum, end, G, 0.16 * k, 0.17 * k, 0);
    for (let i = 0; i < 7; i++) {
      const u0 = (i + 0.3) / 7.5;
      f.line([add(lerp(end, G, u0), mul(face, 0.17 * k)), add(add(lerp(end, G, u0 + 0.07), mul(side, 0.17 * k)), mul(face, 0.02 * k))], T.plum[1], 1);
    }
    const pom = add(end, mul(sdir, -0.34 * k));
    f.egg(edge, pom, [0.52 * k, 0.24 * k, 0.52 * k], SA, 0.02);
    f.egg(steel, pom, [0.22 * k, 0.32 * k, 0.22 * k], SA, 0.02);
    f.rod(edge, end, add(end, mul(sdir, -0.1 * k)), 0.22 * k, 0.24 * k, 0.02);
    f.block(edge, G, [1.3 * k, 0.15 * k, 0.15 * k], 0.07 * k, SA, 0.02);
    for (const e of [-1, 1]) f.rod(edge, add(G, mul(side, e * 1.25 * k)), add(add(G, mul(side, e * 1.45 * k)), mul(sdir, 0.36 * k)), 0.15 * k, 0.1 * k, 0.05);
    f.block(edge, add(G, mul(sdir, 0.22 * k)), [0.4 * k, 0.14 * k, 0.2 * k], 0.06 * k, SA, 0.02);
    const bl = len(sub(sword.tip, G));
    const W = 0.32 * k;
    f.block(blade, add(G, mul(sdir, bl / 2 + 0.15 * k)), [W, 0.07 * k, bl / 2 - 0.15 * k], 0.03 * k, SA, 0);
    // (its point: each edge cut away to it in a long straight slope)
    const taper = 1.6 * k;
    for (const e of [-1, 1]) {
      const nL = Math.hypot(taper, W);
      const n = add(mul(side, (e * taper) / nL), mul(sdir, W / nL));
      const d = add(mul(side, (-e * W) / nL), mul(sdir, taper / nL));
      const m = add(G, add(mul(side, (e * W) / 2), mul(sdir, bl - taper / 2)));
      f.block(blade, add(m, mul(n, 0.6 * k)), [0.6 * k, 0.4 * k, nL / 2 + 0.8 * k], 0, ax3(n, face, d), 0, true);
    }
    for (const e of [-1, 1]) f.line([add(add(G, mul(sdir, 0.7 * k)), mul(face, e * 0.08 * k)), add(add(G, mul(sdir, bl * 0.72)), mul(face, e * 0.08 * k))], GLOW[0], 1);
  }
  return b;
}
