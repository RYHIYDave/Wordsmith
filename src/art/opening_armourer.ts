// THE ARMOURER OF THE OPENING, BUILT NEW (art/opening.ts). His pick, 25 Oct 2026, of how the people should be made: “Rebuild
// them new (Recommended)” (offered as: throw out the mock-up figures and build each character again from scratch, properly;
// one at a time, shown to him before going in the film). Of the old figure, 25 Oct: “The armorer’s eyes glow for some
// reason”: his eyes here are a man's, dark, a point of the light in each. Nothing of the mock-up figure (art/cast.ts
// armourer) is in him.
//
// The game's own armourer (art/townsfolk.ts): a smith, BALD, with A GREAT PALE BEARD; A TEAL SHIRT WITH THE SLEEVES ROLLED;
// A LEATHER APRON; his legs indigo, his boots plum with their cuffs turned down. Built here as a smith is: heavy, a barrel of
// a chest and a belly before it, shoulders like a yoke, a bull's neck; forearms as thick as another man's calves, bare out of
// the rolled sleeves, scarred and burnt; big hands. His face broad and weathered: a heavy brow over small deep eyes, a nose
// broken flat and broad, ruddy cheeks; his ears; his brows and his beard pale, the beard full from his cheekbones and down
// over the top of his apron. The apron heavy leather, scorched, its strap round his neck and its ties round his waist.
//
// A tenth of a metre a unit, up z, his front toward -y (as art/cast.ts); his joints art/anatomy.ts's.

import type { Figure } from './sdf';
import type { V3 } from './comic';
import { INK } from './comic';
import { ear, forearm, frameAt, onChest, pose } from './anatomy';
import type { Body, Build, Pose } from './anatomy';
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
const along = (z0: V3, hint: V3): readonly [V3, V3, V3] => {
  const z = unit(z0);
  let x = sub(hint, mul(z, dot(hint, z)));
  if (len(x) < 1e-4) x = Math.abs(z[2]) < 0.9 ? cross(z, [0, 0, 1]) : cross(z, [1, 0, 0]);
  x = unit(x);
  return [x, cross(z, x), z];
};
/** Cloth or leather through rows of points: a flat egg over each four, lying in it (art/opening_smith.ts's way). */
function drape(f: Figure, st: number, rows: readonly (readonly V3[])[], th: number, blend = 0.14): void {
  for (let i = 0; i + 1 < rows.length; i++) {
    for (let j = 0; j + 1 < rows[i].length; j++) {
      const a = rows[i][j];
      const b2 = rows[i][j + 1];
      const c = rows[i + 1][j];
      const d = rows[i + 1][j + 1];
      const mid = mul(add(add(a, b2), add(c, d)), 0.25);
      const across = sub(add(b2, d), add(a, c));
      const down = sub(add(c, d), add(a, b2));
      const u = unit(across);
      const nn = unit(cross(u, unit(down)));
      f.egg(st, mid, [len(across) * 0.4, th, len(down) * 0.4], ax3(u, nn, cross(nn, u)), blend);
    }
  }
}

/** His legs' indigo and his boots' plum (art/kit.ts INDIGO, PLUM), darkest first. */
const INDIGO = [INK, '#100e2c', '#18153e', '#211c50', '#2a2466', '#363080', '#443e98'];
const PLUM_BOOT = [INK, '#180c16', '#24121f', '#311a2b', '#43233a', '#58304a', '#6e3d5a'];
/** His apron's leather, scorched: darkest first. */
const APRON = [INK, '#1c100a', '#2e1c12', '#44291a', '#5c3a24', '#7a5032', '#966842'];

/** How the armourer is built: of middle height, broad, very heavy. */
export const ARMOURER_BUILD: Build = { tall: 17.9, broad: 1.24, heavy: 1.6 };

/**
 * THE ARMOURER sculpted into `f`, posed `P` (art/anatomy.ts); what his hands do. The same as art/cast.ts's `armourer`.
 */
export function armourer4(f: Figure, P: Pose, hands: readonly ['fist' | 'grip' | 'flat' | 'open', 'fist' | 'grip' | 'flat' | 'open'] = ['fist', 'fist']): Body {
  const b = pose(ARMOURER_BUILD, P);
  const k = b.k;
  const h = ARMOURER_BUILD.heavy;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  // (his head a little big for a man, as a smith's is drawn: its own measure, a little up on his thick neck)
  const kh = k * 1.13;
  const headAt = add(b.head, mul(b.hup, 0.12 * k));
  const oh = (a: number, fw: number, c: number): V3 => add(add(add(headAt, mul(b.hacross, a * kh)), mul(b.hfwd, fw * kh)), mul(b.hup, c * kh));
  // (his forearms' skin: burnt here and there, a pale scar or two, the hair on them in the light)
  const forearms: [V3, V3][] = [[b.elbows[0], b.wrists[0]], [b.elbows[1], b.wrists[1]]];
  const skin = f.stuff({
    tones: T.skinLight, crease: 0.5, grain: 0.14,
    paint: (q, _n, v) => {
      for (const [e, w] of forearms) {
        const ax = sub(w, e);
        const t = dot(sub(q, e), ax) / dot(ax, ax);
        if (t < 0.2 || t > 0.95 || len(sub(sub(q, e), mul(ax, t))) > 0.9 * k) continue;
        const hx = Math.sin(q[0] * 31 + q[1] * 17) * Math.sin(q[2] * 23 + q[0] * 7);
        if (hx > 0.86 && v > 0.45) return T.skinLight[Math.max(1, Math.min(T.skinLight.length - 1, Math.round(v * 4)))];
        if (Math.abs(Math.sin((q[0] - q[2]) * 9) * 0.5 + Math.sin(q[1] * 6)) < 0.03 && t > 0.45 && t < 0.7) return '#e6c0b0';
      }
      return null;
    },
  });
  const shirt = f.stuff({ tones: T.shirt, crease: 0.85, grain: 0.03, folds: 0.45 });
  const apron = f.stuff({
    tones: APRON, crease: 0.7, grain: 0.2,
    paint: (q, _n, v) => {
      // (scorched where the sparks have struck it: dark spots and rings)
      const s = Math.sin(q[0] * 5.3 + 1.3) * Math.sin(q[2] * 4.1) * Math.sin(q[1] * 6.7 + q[2]);
      if (s > 0.86) return APRON[Math.max(1, Math.round(v * 2))];
      return null;
    },
  });
  const strap = f.stuff({ tones: T.leather, crease: 0.6, grain: 0.12 });
  const iron = f.stuff({ tones: [INK, '#121218', '#22222c', '#363644', '#55556a', '#8a8aa0'], shine: 0.3, crease: 0.4 });
  const pale = f.stuff({ tones: [INK, '#5a5450', '#8e8780', '#bdb6aa', '#ded8cc', '#f2eee6', '#fffcf6'], meld: true, crease: 0.6, grain: 0.08, folds: 2.8 });
  const legs = f.stuff({ tones: INDIGO, crease: 0.85, grain: 0.1, folds: 0.9 });
  const boot = f.stuff({ tones: PLUM_BOOT, crease: 0.7, grain: 0.14 });
  const nail = f.stuff({ tones: [INK, '#8a6a72', '#c8a8a8', '#ecd2d0', '#fff0f0'], crease: 0.2, grain: 0, shine: 0.3 });
  const eye = f.stuff({ tones: ['#0a0806', '#120c08', '#2a1c14', '#3e2a1e'], crease: 0, grain: 0 });

  // THE TRUNK in his teal shirt: a barrel of a chest, his belly before it, shoulders like a yoke; the shirt open at his neck
  f.egg(shirt, onChest(b, 0, 0.1, 0.0), [1.62 * k * h ** 0.45, 1.36 * k * h ** 0.45, 1.6 * k], TA, 0.6);
  f.egg(shirt, onChest(b, 0, -0.22, 0.8), [1.9 * k * h ** 0.3, 1.0 * k * h ** 0.4, 0.84 * k], TA, 0.6);
  f.egg(shirt, onChest(b, 0, 0.75, -1.5), [1.5 * k * h ** 0.5, 1.35 * k * h ** 0.6, 1.15 * k], TA, 0.6);
  f.rod(shirt, onChest(b, 0, 0.1, -1.0), b.waist, 1.4 * k * h ** 0.45, 1.42 * k * h ** 0.45, 0.5);
  f.egg(legs, b.pelvis, [1.78 * k * h ** 0.4, 1.36 * k * h ** 0.45, 1.1 * k], TA, 0.5);
  // (his neck, a bull's; the open neck of the shirt, its edges turned back, the skin of his chest in the V of it)
  f.rod(skin, oh(0, -0.15, -0.75), b.neck, 0.72 * k * h ** 0.35, 0.86 * k * h ** 0.35, 0.4);
  f.egg(skin, onChest(b, 0, 0.62, 1.2), [0.5 * k, 0.4 * k, 0.55 * k], TA, 0.3);
  for (const s of [-1, 1]) f.rod(shirt, onChest(b, s * 0.85, 0.42, 1.62), onChest(b, s * 0.12, 1.02, 0.55), 0.16 * k, 0.12 * k, 0.15);
  // (his belt, under the apron's ties; its iron buckle)
  f.egg(strap, add(b.waist, mul(b.up, -0.35 * k)), [1.64 * k * h ** 0.45, 1.6 * k * h ** 0.45, 0.24 * k], TA, 0.06);

  // HIS ARMS: the shirt's sleeves to above the elbow, rolled up in a thick band; the forearms bare, great and corded; his
  // hands big, the knuckles knocked about
  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    const sh = b.shoulders[j];
    const el = b.elbows[j];
    const wr = b.wrists[j];
    f.egg(shirt, add(sh, mul(b.up, -0.3 * k)), [0.6 * k * h ** 0.3, 0.62 * k * h ** 0.3, 0.64 * k], TA, 0.6);
    // (the slope of his shoulder from his neck, thick with muscle)
    f.egg(shirt, onChest(b, s * 0.95, -0.12, 1.45), [1.0 * k, 0.62 * k * h ** 0.3, 0.42 * k], TA, 0.5);
    f.rod(shirt, sh, lerp(sh, el, 0.82), 0.66 * k * h ** 0.3, 0.64 * k * h ** 0.3, 0.4);
    const ua = unit(sub(el, sh));
    f.rod(shirt, lerp(sh, el, 0.74), lerp(sh, el, 0.9), 0.74 * k * h ** 0.3, 0.72 * k * h ** 0.3, 0.1);
    // (the bare arm below the roll, into the elbow)
    f.rod(skin, lerp(sh, el, 0.86), el, 0.64 * k * h ** 0.3, 0.56 * k * h ** 0.3, 0.3);
    forearm(f, skin, el, wr, 0.62 * k * h ** 0.3, mul(b.across, s));
    wireHand(f, skin, b.handFrames[j], 1.24 * k, HANDS[hands[j] === 'open' ? 'relaxed' : hands[j]], { nails: nail });
    void ua;
  }

  /** How far forward of his chest's middle the front of him is (his shirt), `a` across and `c` up (a man's units): his own units. */
  const TRUNK: readonly (readonly [number, number, number, number, number])[] = [
    [0.1, 0.0, 1.62 * h ** 0.45, 1.36 * h ** 0.45, 1.6],
    [-0.22, 0.8, 1.9 * h ** 0.3, 1.0 * h ** 0.4, 0.84],
    [0.75, -1.5, 1.5 * h ** 0.5, 1.35 * h ** 0.6, 1.15],
  ];
  const frontAt = (a: number, c: number): number => {
    let best = 0;
    for (const [f0, c0, rx, ry, rz] of TRUNK) {
      const t = 1 - (a / rx) ** 2 - ((c - c0) / rz) ** 2;
      if (t > 0) best = Math.max(best, f0 + ry * Math.sqrt(t));
    }
    return best * k;
  };

  // THE APRON, heavy leather: over his chest from under his collarbones, over his belly and down before his thighs to his
  // knees; its strap round his neck; its ties round his waist; if he sits, falling between his knees
  {
    const top = 1.15;
    const rows: V3[][] = [];
    const kneeZ = Math.max(b.knees[0][2], b.knees[1][2]);
    const seated = kneeZ > b.pelvis[2] - 2.0 * k;
    const legMid = lerp(b.knees[0], b.knees[1], 0.5);
    const n = 9;
    for (let r = 0; r <= 12; r++) {
      const u = r / 12;
      const row: V3[] = [];
      for (let i = 0; i < n; i++) {
        const a = -1 + (2 * i) / (n - 1);
        if (u <= 0.45) {
          // (over the chest and belly: lying on them, a little off them, wider as it goes down)
          const c = top - (u / 0.45) * 2.95;
          const wide = 1.38 + (u / 0.45) * 0.2;
          const ac = a * wide * (1 - Math.abs(a) * 0.08);
          row.push(onChest(b, ac, frontAt(ac, c) / k + 0.14 - Math.abs(a) ** 3 * 0.25, c));
        } else {
          // (below the belt, hanging: before the thighs to the knees, or down between them if he sits)
          const v = (u - 0.45) / 0.55;
          const from = onChest(b, a * 1.58, frontAt(a * 1.58, top - 2.95) / k + 0.14 - Math.abs(a) ** 3 * 0.25, top - 2.95);
          const to: V3 = seated
            ? add(add(legMid, mul(b.across, a * 1.0 * k)), add(mul(b.fwd, 0.8 * k), [0, 0, -1.6 * k]))
            : add(add([legMid[0], legMid[1], kneeZ + 0.4 * k], mul(b.across, a * 1.62 * k)), mul(b.fwd, (1.25 - a * a * 0.4) * k));
          row.push(lerp(from, to, v));
        }
      }
      rows.push(row);
    }
    drape(f, apron, rows, 0.11 * k, 0.16);
    // (its hem, cut straight)
    const hem = rows[rows.length - 1];
    for (let i = 1; i < hem.length; i++) f.rod(apron, hem[i - 1], hem[i], 0.1 * k, 0.1 * k, 0.1);
    // (its strap up round his neck; its ties round to the back of his waist)
    for (const s of [-1, 1]) {
      f.rod(strap, rows[0][s > 0 ? n - 1 : 0], onChest(b, s * 0.8, -0.25, 1.85), 0.1 * k, 0.1 * k, 0.05);
      f.rod(strap, rows[5][s > 0 ? n - 1 : 0], onChest(b, s * 1.55, -1.05, top - 2.95), 0.09 * k, 0.09 * k, 0.05);
    }
    f.rod(strap, onChest(b, -0.8, -0.25, 1.85), onChest(b, 0.8, -0.25, 1.85), 0.1 * k, 0.1 * k, 0.05);
    // (an iron ring at each corner of its top, where the strap is through it)
    for (const s of [0, n - 1]) f.egg(iron, rows[0][s], [0.14 * k, 0.14 * k, 0.14 * k], TA, 0.02);
  }

  // HIS LEGS in indigo, thick; HIS BOOTS plum, to the middle of the calf, their cuffs turned down
  for (const j of [0, 1] as const) {
    const hip = b.hips[j];
    const kn = b.knees[j];
    const an = b.ankles[j];
    f.rod(legs, hip, kn, 1.12 * k * h ** 0.4, 0.74 * k * h ** 0.4, 0.4);
    f.egg(legs, kn, [0.62 * k, 0.62 * k, 0.62 * k], TA, 0.3);
    f.rod(legs, kn, lerp(kn, an, 0.56), 0.7 * k * h ** 0.4, 0.62 * k * h ** 0.4, 0.3);
    f.rod(boot, lerp(kn, an, 0.52), an, 0.6 * k * h ** 0.35, 0.48 * k, 0.2);
    f.rod(boot, lerp(kn, an, 0.46), lerp(kn, an, 0.56), 0.68 * k * h ** 0.35, 0.66 * k * h ** 0.35, 0.08);
    const dir = unit([b.fwd[0], b.fwd[1], 0]);
    const ground = Math.max(0, an[2] - 0.8 * k);
    const heel: V3 = add([an[0], an[1], ground + 0.4 * k], mul(dir, -0.5 * k));
    const toe: V3 = add([an[0], an[1], ground + 0.3 * k], mul(dir, 1.9 * k));
    f.rod(boot, an, heel, 0.52 * k, 0.44 * k, 0.2);
    f.rod(boot, heel, toe, 0.46 * k, 0.36 * k, 0.25);
    f.egg(boot, add(toe, mul(dir, 0.15 * k)), [0.45 * k, 0.5 * k, 0.3 * k], along([0, 0, 1], dir), 0.2);
  }

  // HIS HEAD: bald, broad, weathered; a heavy brow over small deep-set eyes, dark, a point of light in each; a nose broken
  // flat and broad; ruddy cheeks; his ears
  f.egg(skin, oh(0, -0.12, 0.25), [0.92 * kh, 1.04 * kh, 1.04 * kh], HA, 0.4);
  f.egg(skin, oh(0, 0.42, -0.5), [0.72 * kh, 0.58 * kh, 0.62 * kh], HA, 0.45);
  f.egg(skin, oh(0, 0.62, 0.4), [0.66 * kh, 0.32 * kh, 0.36 * kh], HA, 0.35);
  f.egg(skin, oh(0, 0.82, 0.24), [0.66 * kh, 0.18 * kh, 0.15 * kh], HA, 0.22);
  for (const s of [-1, 1]) {
    f.egg(skin, oh(s * 0.3, 0.9, 0.06), [0.17 * kh, 0.12 * kh, 0.1 * kh], HA, 0.06, true);
    f.egg(eye, oh(s * 0.3, 0.82, 0.05), [0.07 * kh, 0.05 * kh, 0.05 * kh], HA, 0);
    f.egg(skin, oh(s * 0.52, 0.66, -0.2), [0.26 * kh, 0.2 * kh, 0.18 * kh], HA, 0.22);
    f.egg(skin, oh(s * 0.31, 0.88, -0.1), [0.15 * kh, 0.06 * kh, 0.05 * kh], HA, 0.06);
    ear(f, skin, frameAt(oh(s * 0.98, -0.02, -0.08), b.hup, mul(b.hacross, s)), 1.4 * kh);
    // (the lines of his face: at the corners of his eyes; down from the wings of his nose)
    for (const dz of [-0.05, 0.05]) f.line([oh(s * 0.48, 0.8, 0.04 + dz), oh(s * 0.6, 0.7, 0.03 + dz * 1.5)], '#6a4248', 1);
  }
  // (the furrows across his brow, deep)
  for (const c of [0.52, 0.66]) {
    const ln: V3[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = -0.42 + (i / 6) * 0.84;
      ln.push(oh(a, 0.9 - a * a * 0.85, c + Math.sin(i * 1.3) * 0.02));
    }
    f.line(ln, '#6a4248', 1);
  }
  // (his nose: broad and flattened, its bridge broken, its tip heavy)
  f.rod(skin, oh(0, 0.92, 0.12), oh(0.03, 1.12, -0.32), 0.13 * kh, 0.17 * kh, 0.12);
  f.egg(skin, oh(0.02, 1.13, -0.4), [0.19 * kh, 0.15 * kh, 0.14 * kh], HA, 0.1);
  for (const s of [-1, 1]) f.egg(skin, oh(s * 0.15, 1.04, -0.45), [0.12 * kh, 0.11 * kh, 0.09 * kh], HA, 0.08);
  // HIS BROWS, pale and bushy; HIS BEARD, great and pale, full from his cheekbones, his moustache over his mouth, down over
  // his throat and the top of his apron, broad and blunt
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) f.rod(pale, oh(s * (0.08 + i * 0.13), 1.06 - i * 0.07, 0.3 + i * 0.02), oh(s * (0.22 + i * 0.14), 1.0 - i * 0.1, 0.37 + i * 0.03), 0.1 * kh, 0.07 * kh, 0.06);
    f.rod(pale, oh(s * 0.05, 1.02, -0.56), oh(s * 0.42, 0.88, -0.66), 0.15 * kh, 0.12 * kh, 0.1);
    f.egg(pale, oh(s * 0.55, 0.48, -0.62), [0.26 * kh, 0.34 * kh, 0.44 * kh], HA, 0.3);
  }
  f.egg(pale, oh(0, 0.6, -0.92), [0.8 * k, 0.5 * k, 0.55 * k], HA, 0.3);
  {
    const top = oh(0, 0.72, -1.12);
    let prev = top;
    const steps = 7;
    const strands: V3[][] = [[], [], [], [], [], [], []];
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const c = 1.7 - u * 1.75;
      const q = onChest(b, 0, frontAt(0, c) / k + 0.45, c);
      const wide = (1.05 - u * 0.5) * k;
      const d = sub(q, prev);
      f.egg(pale, lerp(prev, q, 0.5), [wide, 0.42 * k * (1 - u * 0.3), len(d) * 0.64], along(d, b.across), 0.3);
      for (let st = 0; st < 7; st++) {
        const a = (st - 3) / 3 + Math.sin(u * 6 + st * 2.1) * 0.06;
        strands[st].push(add(add(lerp(prev, q, 0.5), mul(b.across, a * wide * 0.75)), mul(b.fwd, 0.34 * k * (1 - a * a * 0.5) + 0.03 * k)));
      }
      prev = q;
    }
    strands.forEach((sl, i) => f.line(sl, i % 2 ? '#b8ac90' : '#8a7e68', 1));
    // (its edges in soft waves, so that its outline is of hair)
    for (let i = 0; i < 10; i++) {
      const u = 0.08 + i * 0.09;
      const c = 1.7 - u * 1.75;
      const sd = i % 2 ? 1 : -1;
      const w = (1.05 - u * 0.5) * 0.8;
      f.egg(pale, onChest(b, sd * w, frontAt(sd * w, c) / k + 0.3, c - 0.15), [0.24 * k, 0.18 * k, 0.36 * k], TA, 0.3);
    }
    // (its curls: tufts all over its front, so that it is bushy and not combed flat)
    for (let i = 0; i < 26; i++) {
      const u = ((i * 0.618034) % 1) * 0.9 + 0.05;
      const c = 1.7 - u * 1.75;
      const wmax = (1.05 - u * 0.5) * 0.85;
      const a2 = (((i * 0.381966 + 0.2) % 1) * 2 - 1) * wmax;
      const fw = frontAt(a2, c) / k + 0.45 + 0.42 * (1 - u * 0.3) * Math.sqrt(Math.max(0, 1 - (a2 / (wmax + 0.15)) ** 2));
      const r = 0.15 + ((i * 7) % 5) * 0.02;
      f.egg(pale, onChest(b, a2, fw, c), [r * k, r * 0.8 * k, r * 1.3 * k], TA, 0.18);
    }
    for (let i = 0; i < 7; i++) {
      const a = (i - 3) / 3;
      f.egg(pale, onChest(b, a * 0.62, frontAt(a * 0.62, -0.1) / k + 0.35, -0.1 - (1 - Math.abs(a)) * 0.2), [0.2 * k, 0.16 * k, 0.32 * k], TA, 0.3);
    }
  }
  return b;
}
