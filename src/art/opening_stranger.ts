// THE STRANGER OF THE OPENING, BUILT NEW (art/opening.ts). His pick, 25 Oct 2026, of how the people should be made: “Rebuild
// them new (Recommended)” (offered as: throw out the mock-up figures and build each character again from scratch, properly;
// one at a time, shown to him before going in the film). Nothing of the mock-up figure (art/cast.ts stranger) is in him.
//
// The game's own stranger (art/townsfolk.ts; the owner: "he's just leaned up against a wall in the shadows."): A LONG DARK
// CLOAK, THE HOOD DOWN OVER HIS FACE, TWO POINTS OF GOLD all that is seen of it; his arms folded under the cloak; boots; now
// and then a hand comes out from under it and tosses a coin. And the opening's: a baldric across his chest, knives along
// it, his belt and its purse. Built here lean and long, a man who keeps to himself: the cloak heavy wool, falling from his
// shoulders in long folds to his calves, open down his front from his chest, so that his dark clothes and his boots show
// between its edges; a short cape over his shoulders, the hood rising out of it, deep, its peak hanging back; his gloves and
// his boots dark leather, his boots to the knee, turned down. What is under the cloak is pushed clear of his limbs, so that
// nothing of him goes through it.
//
// A tenth of a metre a unit, up z, his front toward -y (as art/cast.ts); his joints art/anatomy.ts's.

import type { Figure } from './sdf';
import type { V3 } from './comic';
import { INK } from './comic';
import { forearm, onChest, onHead, pose } from './anatomy';
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
/** Cloth through rows of points: a flat egg over each four, lying in it (art/opening_smith.ts's way). */
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

/** His cloak's wool, nearly black, a little warm; what he wears under it darker still. */
const CLOAK = [INK, '#0a0810', '#110e17', '#18141f', '#201a28', '#2a2233', '#352b40'];
const UNDER = [INK, '#0a0810', '#120e18', '#1a1522', '#231d2c', '#2e2638'];
const LEATHER = [INK, '#0a0706', '#120d0a', '#1a140f', '#231b15', '#2e241c', '#3a2e24'];
const GOLD_EYES = ['#ffd866', '#e8c060', '#d09a20'];

/** How the stranger is built: tall and lean. */
export const STRANGER_BUILD: Build = { tall: 17.9, broad: 1.02, heavy: 0.9 };

/**
 * THE STRANGER sculpted into `f`, posed `P` (art/anatomy.ts); what his hands do; `seatZ`: the height he sits on, if he sits
 * (his cloak lies on it round him); `closed`: the cloak drawn round him over his chest, his folded arms under it. The same as
 * art/cast.ts's `stranger`.
 */
export function stranger4(f: Figure, P: Pose, hands: readonly ['fist' | 'grip' | 'flat' | 'open', 'fist' | 'grip' | 'flat' | 'open'] = ['fist', 'fist'], o: { seatZ?: number; closed?: boolean } = {}): Body {
  const b = pose(STRANGER_BUILD, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  const cloak = f.stuff({ tones: CLOAK, crease: 0.9, grain: 0.12, folds: 1.3 });
  const hoodS = f.stuff({ tones: CLOAK, crease: 0.9, grain: 0.12, folds: 0.8 });
  const under = f.stuff({ tones: UNDER, crease: 0.8, grain: 0.1, folds: 0.6 });
  const leather = f.stuff({ tones: LEATHER, crease: 0.6, grain: 0.14 });
  const brass = f.stuff({ tones: T.gold, shine: 0.5, crease: 0.4 });
  const steel = f.stuff({ tones: T.steel, shine: 0.45, crease: 0.4 });
  const dark = f.stuff({ tones: [INK, INK, '#06050a', '#0a0810'], crease: 0, grain: 0 });
  const eyes = f.stuff({ tones: GOLD_EYES, crease: 0, grain: 0 });

  // THE BODY under the cloak, in his dark clothes: lean, long in the leg
  f.egg(under, onChest(b, 0, 0.05, -0.1), [1.45 * k, 1.1 * k, 1.55 * k], TA, 0.6);
  f.egg(under, onChest(b, 0, -0.3, 0.7), [1.75 * k, 0.85 * k, 0.85 * k], TA, 0.6);
  f.rod(under, onChest(b, 0, 0.0, -1.0), b.waist, 1.15 * k, 1.1 * k, 0.5);
  f.egg(under, b.pelvis, [1.4 * k, 1.05 * k, 0.95 * k], TA, 0.5);
  f.rod(under, onHead(b, 0, -0.1, -0.8), b.neck, 0.5 * k, 0.6 * k, 0.35);
  // (his legs in dark cloth; his boots to the knee, dark leather, turned down at the top)
  for (const j of [0, 1] as const) {
    const kn = b.knees[j];
    const an = b.ankles[j];
    f.rod(under, b.hips[j], kn, 0.82 * k, 0.56 * k, 0.4);
    f.rod(leather, lerp(kn, an, 0.12), an, 0.56 * k, 0.42 * k, 0.2);
    f.rod(leather, lerp(kn, an, 0.04), lerp(kn, an, 0.16), 0.64 * k, 0.62 * k, 0.06);
    const dir = unit([b.fwd[0], b.fwd[1], 0]);
    const ground = Math.max(o.seatZ ?? -99, Math.max(0, an[2] - 0.8 * k));
    const heel: V3 = add([an[0], an[1], ground + 0.36 * k], mul(dir, -0.45 * k));
    const toe: V3 = add([an[0], an[1], ground + 0.24 * k], mul(dir, 1.75 * k));
    f.rod(leather, an, heel, 0.44 * k, 0.38 * k, 0.2);
    f.rod(leather, heel, toe, 0.38 * k, 0.24 * k, 0.25);
  }
  // HIS ARMS in the cloak's own wool where it falls over them (wide sleeves of it to the forearm), his gloved hands
  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    const sh = b.shoulders[j];
    const el = b.elbows[j];
    const wr = b.wrists[j];
    f.egg(cloak, sh, [0.66 * k, 0.66 * k, 0.7 * k], TA, 0.5);
    f.rod(cloak, sh, el, 0.6 * k, 0.56 * k, 0.4);
    if (o.closed) {
      // (his arms folded under the cloak, his hands tucked away under them: only the fold of his arms is seen, through it)
      f.rod(cloak, el, wr, 0.56 * k, 0.5 * k, 0.3);
      continue;
    }
    f.rod(cloak, el, lerp(el, wr, 0.7), 0.56 * k, 0.5 * k, 0.3);
    forearm(f, leather, lerp(el, wr, 0.6), wr, 0.38 * k, mul(b.across, s));
    wireHand(f, leather, b.handFrames[j], 1.08 * k, HANDS[hands[j] === 'open' ? 'cup' : hands[j]]);
  }

  // THE CLOAK, heavy wool: from the round of his shoulders falling in long folds round his back and sides to the middle of
  // his calves; its two edges down his front from his chest, open, his dark clothes and boots between them. Each point of it
  // pushed clear of his arms and legs; sitting, what falls below the seat lies on it round him
  {
    const limbs: [V3, V3, number][] = [];
    for (const j of [0, 1] as const) {
      limbs.push([b.hips[j], b.knees[j], 0.95 * k], [b.knees[j], b.ankles[j], 0.72 * k]);
      limbs.push([b.shoulders[j], b.elbows[j], 0.72 * k], [b.elbows[j], b.wrists[j], 0.62 * k]);
      if (!o.closed) limbs.push([b.wrists[j], add(b.wrists[j], mul(b.handFrames[j].z, 1.1 * k)), 0.55 * k]);
    }
    const clear = (q: V3): V3 => {
      let out = q;
      for (const [a0, a1, r] of limbs) {
        const ab = sub(a1, a0);
        const t = Math.max(0, Math.min(1, dot(sub(out, a0), ab) / dot(ab, ab)));
        const c = add(a0, mul(ab, t));
        const d = sub(out, c);
        const L = len(d);
        if (L < r) out = add(c, mul(L > 1e-4 ? mul(d, 1 / L) : mul(b.fwd, -1), r));
      }
      return out;
    };
    const seat = o.seatZ;
    const ground = seat ?? Math.min(b.ankles[0][2], b.ankles[1][2]) - 0.75 * k;
    const hemZ = seat !== undefined ? seat + 0.15 * k : ground + 2.4 * k;
    const top = onChest(b, 0, -0.08, 1.35);
    const fwF = unit([b.fwd[0], b.fwd[1], 0]);
    const acF = unit([b.across[0], b.across[1], 0]);
    const N = 22;
    const rows: V3[][] = [];
    const R = 10;
    for (let r = 0; r <= R; r++) {
      const u = r / R;
      const row: V3[] = [];
      for (let i = 0; i < N; i++) {
        // (round from his front's left edge, by his back, to its right edge: the front open between)
        const th = 0.32 + (i / (N - 1)) * (Math.PI * 2 - 0.64);
        const fold = Math.sin(i * 2.3 + 0.4) * 0.12 * k * u;
        const ra = (2.25 + u * 0.55) * k + fold;
        const rf = (1.45 + u * 0.55) * k + fold;
        const z = top[2] + (hemZ - top[2]) * u;
        const c0: V3 = [lerp(top, b.pelvis, Math.min(1, u * 1.3))[0], lerp(top, b.pelvis, Math.min(1, u * 1.3))[1], z];
        let q = add(c0, add(mul(acF, Math.sin(th) * ra), mul(fwF, Math.cos(th) * rf)));
        // (the front edges drawn in over his chest, falling open below)
        if (Math.cos(th) > 0.6) q = add(q, mul(acF, -Math.sign(Math.sin(th)) * (1 - u) * 0.5 * k));
        q = clear(q);
        if (seat !== undefined && q[2] < seat + 0.15 * k) q = [q[0], q[1], seat + 0.15 * k];
        row.push(q);
      }
      rows.push(row);
    }
    drape(f, cloak, rows, 0.12 * k, 0.18);
    if (o.closed) {
      // (drawn round him over his chest and his folded arms, to his belt: the front closed there, over what is under it)
      const front: V3[][] = [];
      for (let r = 0; r <= Math.round(R * 0.5); r++) {
        const u = r / R;
        const row: V3[] = [];
        for (let i = 0; i <= 6; i++) {
          const th = -0.42 + (i / 6) * 0.84;
          const ra = (2.25 + u * 0.55) * k;
          const rf = (1.5 + u * 0.55) * k;
          const z = top[2] + (hemZ - top[2]) * u;
          const c0: V3 = [lerp(top, b.pelvis, Math.min(1, u * 1.3))[0], lerp(top, b.pelvis, Math.min(1, u * 1.3))[1], z];
          row.push(clear(add(c0, add(mul(acF, Math.sin(th) * ra), mul(fwF, Math.cos(th) * rf)))));
        }
        front.push(row);
      }
      drape(f, cloak, front, 0.12 * k, 0.18);
    }
    // (its hem, a rolled edge; its front edges)
    for (let i = 1; i < N; i++) f.rod(cloak, rows[R][i - 1], rows[R][i], 0.1 * k, 0.1 * k, 0.1);
    for (const j of [0, N - 1]) for (let r = 1; r <= R; r++) f.rod(cloak, rows[r - 1][j], rows[r][j], 0.1 * k, 0.1 * k, 0.1);
    // THE CAPE over his shoulders, short, its hem ragged across his chest and back; the hood rising out of it
    const cape: V3[][] = [];
    for (let r = 0; r <= 3; r++) {
      const u = r / 3;
      const row: V3[] = [];
      for (let i = 0; i <= 24; i++) {
        const th = (i / 24) * Math.PI * 2;
        const ragged = r === 3 ? Math.sin(i * 2.9) * 0.18 : 0;
        const ra = (1.05 + u * 1.5) * k;
        const rf = (0.95 + u * 0.75) * k;
        const c = 1.85 - u * (1.1 + Math.cos(th) * 0.25) + ragged;
        row.push(clear(add(onChest(b, 0, -0.1, c), add(mul(b.across, Math.sin(th) * ra), mul(b.fwd, Math.cos(th) * rf)))));
      }
      cape.push(row);
    }
    drape(f, cloak, cape, 0.12 * k, 0.16);
  }

  // THE BALDRIC across his chest from his left shoulder to his right hip, over his clothes, its buckle of brass; three knives
  // sheathed along it, their hilts up; his belt and its purse
  {
    const pts: V3[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const a = 1.25 - u * 2.45;
      const c = 1.3 - u * 2.55;
      const front = Math.sqrt(Math.max(0.05, 1 - (a / 1.5) ** 2 - ((c + 0.1) / 1.6) ** 2));
      pts.push(onChest(b, a, 0.05 + 1.12 * front + 0.1, c));
    }
    for (let i = 1; i < pts.length; i++) f.rod(leather, pts[i - 1], pts[i], 0.13 * k, 0.13 * k, 0.05);
    f.block(brass, pts[3], [0.2 * k, 0.07 * k, 0.16 * k], 0.04 * k, TA, 0.02);
    for (const i of [2, 5, 6]) {
      const q = pts[i];
      const d = unit(sub(pts[i + 1] ?? pts[i], pts[i - 1]));
      const A = along(d, b.fwd);
      f.block(leather, add(q, mul(b.fwd, 0.12 * k)), [0.12 * k, 0.08 * k, 0.42 * k], 0.04 * k, ax3(A[0], A[1], b.up), 0.04);
      f.rod(steel, add(add(q, mul(b.fwd, 0.14 * k)), mul(b.up, 0.4 * k)), add(add(q, mul(b.fwd, 0.14 * k)), mul(b.up, 0.75 * k)), 0.06 * k, 0.06 * k, 0.02);
      f.egg(brass, add(add(q, mul(b.fwd, 0.14 * k)), mul(b.up, 0.8 * k)), [0.07 * k, 0.07 * k, 0.07 * k], TA, 0.02);
    }
    f.egg(leather, add(b.waist, mul(b.up, -0.3 * k)), [1.22 * k, 1.16 * k, 0.18 * k], TA, 0.05);
    f.block(leather, add(add(b.waist, mul(b.across, -0.85 * k)), add(mul(b.fwd, 0.95 * k), mul(b.up, -0.75 * k))), [0.3 * k, 0.16 * k, 0.32 * k], 0.12 * k, TA, 0.1);
  }

  // THE HOOD, deep, down over his face, its peak hanging back over his cape; in the dark of it, two points of gold
  f.egg(hoodS, onHead(b, 0, -0.18, 0.28), [1.18 * k, 1.32 * k, 1.36 * k], HA, 0.3);
  f.rod(hoodS, onHead(b, 0, -0.75, 0.75), onHead(b, 0, -1.7, 0.1), 0.6 * k, 0.12 * k, 0.4);
  for (const s of [-1, 1]) f.rod(hoodS, onHead(b, s * 0.95, -0.2, -0.5), onChest(b, s * 1.15, -0.1, 1.75), 0.5 * k, 0.55 * k, 0.4);
  // (its mouth, low and narrow, its brow drawn forward over his face; the dark in it; his eyes)
  f.egg(hoodS, onHead(b, 0, 0.98, -0.3), [0.66 * k, 0.75 * k, 0.86 * k], HA, 0.06, true);
  f.egg(hoodS, onHead(b, 0, 0.72, 0.62), [0.85 * k, 0.5 * k, 0.32 * k], HA, 0.25);
  f.egg(dark, onHead(b, 0, 0.42, -0.25), [0.62 * k, 0.5 * k, 0.72 * k], HA, 0.1);
  for (const s of [-1, 1]) f.egg(eyes, onHead(b, s * 0.26, 0.9, 0.06), [0.065 * k, 0.04 * k, 0.045 * k], HA, 0);
  return b;
}
