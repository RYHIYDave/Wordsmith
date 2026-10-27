// YOUR WORDSMITH IN THE OPENING, BUILT NEW (art/opening.ts). His words, 25 Oct 2026, of the box of the two walking, among
// what needed work: “The wordsmith”; and, asked how the people should be made from there, his pick: “Rebuild them new
// (Recommended)” (offered as: throw out the mock-up figures and build each character again from scratch, properly; one at a
// time, shown to him before going in the film). Nothing of the mock-up figure (art/cast.ts townWordsmith) is in him.
//
// The game's own wordsmith (art/smith3.ts, his “Yes, this is him (Recommended)”, 8 Oct; and the start screen's,
// art/title_smith3.ts): ANCIENT AND MIGHTY, a head taller than the heroes, broad, deep in the chest, a little stooped; a
// DEEP NIGHT-BLUE ROBE to the ground; over his shoulders the wordsmiths' TEAL MANTLE, its COWL over his head and open over
// his face, its edge marked with points of light; a LONG WHITE BEARD, heavy white brows; HIS EYES BURN CYAN; RUNES BURN ON
// HIM: down the front of his robe, round its hem, along the edge of his mantle, in the skin of his bare forearms and the
// backs of his hands, and one on his brow. No staff: his hands do the work. What glows on him is the friend's cyan.
//
// A tenth of a metre a unit, up z, his front toward -y (as art/cast.ts); his joints art/anatomy.ts's.

import type { Figure } from './sdf';
import type { V3 } from './comic';
import { INK } from './comic';
import { at, forearm, frameAt, onChest, onHead, pose, sculptFoot } from './anatomy';
import type { Body, Build, Frame, Pose } from './anatomy';
import { T } from './cast';
import { RUNES7 } from './smith3';
import { HANDS, wireHand } from './opening_hand';
import type { HandPose } from './opening_hand';

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

/**
 * CLOTH: a sheet through rows of points (each row a line across it, the rows down it), thin, `th` thick: over each four
 * points a flat egg lying in the cloth, overlapping the next. `wrap`: each row's last point joined to its first.
 */
function drape(f: Figure, st: number, rows: readonly (readonly V3[])[], th: number, wrap = false, blend = 0.14): void {
  for (let i = 0; i + 1 < rows.length; i++) {
    const n = rows[i].length;
    for (let j = 0; j < (wrap ? n : n - 1); j++) {
      const j2 = (j + 1) % n;
      const a = rows[i][j];
      const b2 = rows[i][j2];
      const c = rows[i + 1][j];
      const d = rows[i + 1][j2];
      const mid = mul(add(add(a, b2), add(c, d)), 0.25);
      const across = sub(add(b2, d), add(a, c));
      const down = sub(add(c, d), add(a, b2));
      const u = unit(across);
      const nn = unit(cross(u, unit(down)));
      const v = cross(nn, u);
      f.egg(st, mid, [len(across) * 0.36, th, len(down) * 0.34], ax3(u, nn, v), blend);
    }
  }
}

/** His small runes, three cells by five (art/smith3.ts's own: none of them a letter of any alphabet). */
const GLYPHS: readonly (readonly string[])[] = [
  ['#.#', '.#.', '.#.', '#.#', '#..'],
  ['##.', '#..', '###', '..#', '.##'],
  ['.#.', '#.#', '.#.', '.#.', '#.#'],
  ['#..', '#.#', '###', '#.#', '..#'],
  ['.##', '#..', '.#.', '..#', '##.'],
  ['#.#', '#.#', '.#.', '#..', '###'],
  ['###', '.#.', '#.#', '.#.', '###'],
  ['#..', '.#.', '..#', '.#.', '#..'],
];
/** A rune's cell lit, in a row of runes (`u` cells along, `v` cells down; a cell's gap between each two), or not. */
function runeRow(u: number, v: number, set: readonly (readonly string[])[], seed = 0): boolean {
  const cu = Math.floor(u);
  const cv = Math.floor(v);
  const g0 = set[0];
  const w = g0[0].length;
  const h = g0.length;
  if (cv < 0 || cv >= h) return false;
  const per = w + 1;
  const i = Math.floor(cu / per);
  const c = cu - i * per;
  if (c >= w) return false;
  const g = set[(((i + seed) % set.length) + set.length) % set.length];
  return g[cv][c] === '#';
}
/** A rune's colour, burning: its heart white-hot where it is thickest, the friend's cyan round it. */
const BURN = (u: number, v: number): string => ((Math.floor(u) + Math.floor(v)) % 3 === 0 ? '#e6ffff' : '#8af6f0');

/** His robe: a blue nearly black (art/smith3.ts ROBE), its lit side no paler than the night's blue. */
const ROBE = [INK, '#0c0a22', '#14113a', '#1c1850', '#24205e', '#2e2a74', '#3c388e'];

/** How the wordsmith is built: a head taller than the heroes, broad, heavy in the chest (art/smith3.ts SMITH_BODY). */
export const WORDSMITH_BUILD: Build = { tall: 20.2, broad: 1.12, heavy: 1.08 };

/**
 * YOUR WORDSMITH sculpted into `f`, posed `P` (art/anatomy.ts). `palm`: his right hand held out, its palm up (a rune burns
 * over it, painted by the shot); `sway` how his beard swings. The same as art/cast.ts's `townWordsmith`, for the opening.
 */
export function wordsmith4(f: Figure, P: Pose, o: { palm?: boolean; sway?: number; hands?: readonly [HandPose, HandPose] } = {}): Body {
  const b = pose(WORDSMITH_BUILD, P);
  const k = b.k;
  const TA = ax3(b.across, mul(b.fwd, -1), b.up);
  const HA = ax3(b.hacross, mul(b.hfwd, -1), b.hup);
  const sway = o.sway ?? 0;

  /** Where a point is round his trunk: how far round from his front (+ to his left), how high above his chest (his units). */
  const roundOf = (q: V3): { th: number; c: number; a: number; fw: number } => {
    const d = sub(q, b.chest);
    const a = dot(d, b.across);
    const fw = dot(d, b.fwd);
    return { th: Math.atan2(a, fw), c: dot(d, b.up) / k, a: a / k, fw: fw / k };
  };

  // HIS STUFFS: his old skin, the runes burning in it on his forearms and the backs of his hands; the robe, a blue nearly
  // black, runes down its front and round its hem; the mantle and its cowl, the wordsmiths' teal, runes along its edge, points
  // of light round the cowl's; his beard and brows white; his boots plum; what burns, cyan
  const handBack: { F: Frame; s: number }[] = [];
  const skin = f.stuff({
    tones: T.skinOld, crease: 0.5, grain: 0.1,
    paint: (q, n) => {
      // (runes in the skin of his bare forearms: a column of them down the outer side of each, from the sleeve to the wrist)
      for (const j of [0, 1] as const) {
        const e = b.elbows[j];
        const ax = sub(b.wrists[j], e);
        const L = len(ax);
        const t = dot(sub(q, e), ax) / (L * L);
        if (t < 0.44 || t > 0.92) continue;
        const rad = sub(sub(q, e), mul(ax, t));
        if (len(rad) > 0.75 * k) continue;
        const out = mul(b.across, j ? 1 : -1);
        const o1 = unit(sub(out, mul(ax, dot(out, ax) / (L * L))));
        const o2 = unit(cross(ax, o1));
        const ph = Math.atan2(dot(rad, o2), dot(rad, o1));
        if (Math.abs(ph) > 0.9) continue;
        const u = (ph * 0.42) / 0.085 + 1.5;
        const v = ((t - 0.46) * L) / (0.085 * k);
        const vv = v % 6.2;
        if (u >= 0 && u < 3 && vv < 5 && runeRow(u, vv, GLYPHS, Math.floor(v / 6.2) + j * 3)) return BURN(u, vv);
      }
      // (a rune on the back of each hand)
      for (const hb of handBack) {
        const d = sub(q, at(hb.F, 0, 0, 0.5 * hb.s));
        if (dot(d, hb.F.y) < 0 || dot(n, hb.F.y) < 0.4) continue;
        const u = dot(d, hb.F.x) / (0.075 * hb.s / 1.12) + 1.5;
        const v = -dot(d, hb.F.z) / (0.075 * hb.s / 1.12) + 2.5;
        if (u >= 0 && u < 3 && v >= 0 && v < 5) return runeRow(u, v, GLYPHS, 5) ? BURN(u, v) : null;
      }
      return null;
    },
  });
  const robe = f.stuff({
    tones: ROBE, crease: 0.85, grain: 0.1, folds: 1.1,
    paint: (q) => {
      const r = roundOf(q);
      // (down his front: a column of his great runes, from his breast to his hem)
      if (r.fw > 0.6 && Math.abs(r.a) < 0.34 && r.c < -0.2) {
        const u = r.a / 0.12 + 2.5;
        const v = (-0.2 - r.c) / 0.12;
        const vv = v % 8.5;
        if (u >= 0 && u < 5 && vv < 7 && runeRow(u, vv, RUNES7, Math.floor(v / 8.5))) return BURN(u, vv);
      }
      // (round his hem: a band of the small ones)
      const z = (q[2] - hemZ) / k;
      if (z > 0.18 && z < 0.18 + 5 * 0.1) {
        const u = (r.th * 2.25) / 0.1;
        const v = (0.18 + 5 * 0.1 - z) / 0.1;
        if (runeRow(u + 400, v, GLYPHS)) return BURN(u, v);
      }
      return null;
    },
  });
  const mantle = f.stuff({
    tones: T.teal, crease: 0.85, grain: 0.1, folds: 0.9,
    paint: (q) => {
      // (along its edge, a band of runes all the way round)
      const r = roundOf(q);
      const ce = mantleEdge(r.th);
      const up = r.c - ce;
      if (up > 0.12 && up < 0.12 + 5 * 0.085) {
        const u = (r.th * 2.4) / 0.085;
        const v = (0.12 + 5 * 0.085 - up) / 0.085;
        if (runeRow(u + 400, v, GLYPHS, 2)) return BURN(u, v);
      }
      return null;
    },
  });
  const cowl = f.stuff({ tones: T.teal, crease: 0.85, grain: 0.1, folds: 0.7 });
  const sleeve = f.stuff({ tones: ROBE, crease: 0.85, grain: 0.1, folds: 0.8 });
  const white = f.stuff({ tones: T.white, meld: true, crease: 0.55, grain: 0.08, folds: 2.6 });
  const boot = f.stuff({ tones: [INK, '#1a0c20', '#2a1430', '#3a1e40', '#4a2850', '#5e3460'], crease: 0.6, grain: 0.1 });
  const sash = f.stuff({ tones: T.plum, crease: 0.8, grain: 0.12 });
  const nail = f.stuff({ tones: [INK, '#8a6a72', '#c8a8a8', '#ecd2d0', '#fff0f0'], crease: 0.2, grain: 0, shine: 0.3 });
  const fire = f.stuff({ tones: ['#8af6f0', '#c8fff8', '#e6ffff'], crease: 0, grain: 0 });
  const eyeFire = f.stuff({ tones: ['#22d0e0', '#5ae6ea', '#8af6f0', '#c8fff8'], crease: 0, grain: 0 });
  const hemZ = Math.min(b.ankles[0][2], b.ankles[1][2]) - 0.5 * k;

  // THE BODY UNDER THE ROBE: broad, deep in the chest, his belly a little heavy with age; the robe over it all
  f.egg(robe, onChest(b, 0, 0.08, -0.1), [1.62 * k, 1.3 * k, 1.62 * k], TA, 0.6);
  f.egg(robe, onChest(b, 0, -0.2, 0.75), [1.95 * k, 0.98 * k, 0.9 * k], TA, 0.6);
  f.egg(robe, onChest(b, 0, 0.42, -1.5), [1.32 * k, 1.12 * k, 0.95 * k], TA, 0.6);
  f.rod(robe, onChest(b, 0, 0.05, -1.0), b.waist, 1.42 * k, 1.38 * k, 0.5);
  f.egg(robe, b.pelvis, [1.62 * k, 1.25 * k, 1.0 * k], TA, 0.5);
  // (the sash at his waist, plum, over the top of the skirt; its knot at his left hip)
  const sashAt = add(b.waist, mul(b.up, -0.12 * k));
  f.egg(sash, sashAt, [1.86 * k, 1.76 * k, 0.32 * k], TA, 0.08);
  f.egg(sash, add(add(sashAt, mul(b.across, 1.45 * k)), mul(b.fwd, 1.2 * k)), [0.3 * k, 0.26 * k, 0.3 * k], TA, 0.1);

  // THE ROBE'S SKIRT to the ground: falling from his waist in heavy folds all round him, wide at its hem, clear of his legs
  // however they go (a stride swings it), its hem just off the ground over his boots
  {
    const mid = lerp(b.ankles[0], b.ankles[1], 0.5);
    const hc: V3 = [lerp(b.pelvis, mid, 0.8)[0], lerp(b.pelvis, mid, 0.8)[1], hemZ];
    const fwdF = unit([b.fwd[0], b.fwd[1], 0]);
    const acF = unit([b.across[0], b.across[1], 0]);
    const top0 = add(b.waist, mul(b.up, -0.2 * k));
    const N = 18;
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      const d = add(mul(acF, Math.sin(th)), mul(fwdF, Math.cos(th)));
      let push = 0;
      for (const j of [0, 1] as const) push = Math.max(push, dot(sub([b.ankles[j][0], b.ankles[j][1], hemZ], hc), d));
      const a = add(top0, add(mul(acF, Math.sin(th) * 1.42 * k), mul(fwdF, Math.cos(th) * 1.34 * k)));
      const wob = (i % 2 ? 0.16 : -0.08) * k;
      const r0 = Math.hypot(Math.sin(th) * 1.98, Math.cos(th) * 1.78) * k;
      const bq = add(hc, mul(d, Math.max(r0, push + 1.0 * k) + wob));
      // (each fold a little fuller below the knee)
      const knee = add(lerp(a, bq, 0.55), mul(d, 0.12 * k));
      f.rod(robe, a, knee, 0.34 * k, 0.4 * k, 0.4);
      f.rod(robe, knee, bq, 0.4 * k, 0.46 * k, 0.4);
    }
  }
  // (his boots' toes out from under its hem)
  for (const j of [0, 1] as const) sculptFoot(f, boot, b, j, undefined, 1.12);

  // HIS ARMS: wide sleeves to just past the elbow, open, hanging; his forearms bare out of them, old and corded, the runes
  // burning in them; his big old hands
  for (const j of [0, 1] as const) {
    const s = j ? 1 : -1;
    const sh = b.shoulders[j];
    const el = b.elbows[j];
    const wr = b.wrists[j];
    f.egg(robe, sh, [0.68 * k, 0.68 * k, 0.74 * k], TA, 0.5);
    f.rod(sleeve, add(sh, mul(unit(sub(el, sh)), 0.3 * k)), el, 0.62 * k, 0.6 * k, 0.4);
    const fa = sub(wr, el);
    // (the sleeve's bell: from the elbow, open, wider to its mouth a third of the way down the forearm, its lower side
    // hanging lower; thin cloth, its inside in the dark)
    const A0 = along(fa, [0, 0, 1]);
    const rows: V3[][] = [];
    for (let r = 0; r <= 3; r++) {
      const u = r / 3;
      const c = lerp(lerp(el, wr, -0.06), lerp(el, wr, 0.36), u);
      const R = (0.62 + 0.4 * u) * k;
      const row: V3[] = [];
      for (let i = 0; i < 14; i++) {
        const an = (i / 14) * Math.PI * 2;
        const sag = Math.max(0, -Math.cos(an)) * 0.55 * k * u * u;
        row.push(add(add(c, add(mul(A0[0], Math.cos(an) * R), mul(A0[1], Math.sin(an) * R))), [0, 0, -sag]));
      }
      rows.push(row);
    }
    drape(f, sleeve, rows, 0.09 * k, true, 0.12);
    forearm(f, skin, lerp(el, wr, 0.1), wr, 0.46 * k, mul(b.across, s));
    const F = b.handFrames[j];
    handBack.push({ F, s: 1.18 * k });
    // (his hand on the hand's wire, art/opening_hand.ts: palm up and easy if it is held out, else hanging relaxed)
    wireHand(f, skin, F, 1.18 * k, o.hands?.[j] ?? (o.palm && j === 0 ? HANDS.cup : HANDS.relaxed), { nails: nail });
  }

  // THE MANTLE over his shoulders: the wordsmiths' teal, falling from his neck over his shoulders in folds, to the middle of
  // his breast before him, over the round of his shoulders at his sides, to his shoulder blades behind; its rolled edge; the
  // runes burning along it
  function mantleEdge(th: number): number {
    const c = Math.cos(th);
    return 0.42 - (c > 0 ? 0.92 : 1.05) * c * c;
  }
  {
    const N = 30;
    const rows: V3[][] = [[], [], [], [], []];
    const pts: V3[] = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      const sn = Math.sin(th);
      const cs = Math.cos(th);
      const ring = (c: number, ra: number, rf: number, wob = 0): V3 => add(onChest(b, 0, -0.08, c), add(mul(b.across, sn * (ra * k + wob)), mul(b.fwd, cs * (rf * k + wob))));
      // (its folds: falling from the neck, deeper toward the edge)
      const fold = Math.sin(i * 2.1 + 0.5) * 0.12 * k;
      const ce = mantleEdge(th);
      rows[0].push(ring(1.78, 1.02, 0.86));
      rows[1].push(ring(1.62 * cs * cs + 1.95 * sn * sn, 1.75, 1.18, fold * 0.3));
      rows[2].push(ring(1.3 * cs * cs + 1.78 * sn * sn, 2.32, 1.4, fold * 0.6));
      rows[3].push(ring((1.3 * cs * cs + 1.78 * sn * sn + ce) / 2 + 0.05, 2.62, 1.5, fold));
      rows[4].push(ring(ce, 2.78, 1.56, fold * 1.2));
      pts.push(ring(ce, 2.78, 1.56, fold * 1.2 + 0.04 * k));
    }
    drape(f, mantle, rows, 0.12 * k, true, 0.16);
    // (its edge rolled)
    for (let i = 0; i < N; i++) f.rod(mantle, pts[i], pts[(i + 1) % N], 0.1 * k, 0.1 * k, 0.1);
  }

  // HIS HEAD: old and lean, the skull big under the cowl; a high brow lined across, the ridge of the brow heavy over deep
  // eyes that burn cyan; high cheekbones; a long nose with a hump to its bridge; his moustache drooping into his beard
  f.rod(skin, onHead(b, 0, -0.2, -0.8), b.neck, 0.56 * k, 0.66 * k, 0.35);
  f.egg(skin, onHead(b, 0, -0.1, 0.25), [0.84 * k, 1.0 * k, 1.04 * k], HA, 0.4);
  f.egg(skin, onHead(b, 0, 0.42, -0.48), [0.6 * k, 0.55 * k, 0.6 * k], HA, 0.45);
  f.egg(skin, onHead(b, 0, 0.6, 0.42), [0.6 * k, 0.32 * k, 0.38 * k], HA, 0.35);
  f.egg(skin, onHead(b, 0, 0.8, 0.25), [0.62 * k, 0.17 * k, 0.14 * k], HA, 0.2);
  for (const s of [-1, 1]) {
    f.egg(skin, onHead(b, s * 0.3, 0.88, 0.06), [0.2 * k, 0.13 * k, 0.12 * k], HA, 0.06, true);
    f.egg(eyeFire, onHead(b, s * 0.3, 0.78, 0.04), [0.066 * k, 0.05 * k, 0.05 * k], HA, 0);
    f.egg(skin, onHead(b, s * 0.31, 0.86, -0.12), [0.17 * k, 0.07 * k, 0.06 * k], HA, 0.06);
    f.egg(skin, onHead(b, s * 0.48, 0.64, -0.16), [0.22 * k, 0.18 * k, 0.16 * k], HA, 0.2);
    // (the lines at the corners of his eyes; the furrow down his cheek)
    for (const dz of [-0.06, 0.02, 0.1]) f.line([onHead(b, s * 0.5, 0.78, 0.04 + dz), onHead(b, s * 0.62, 0.68, 0.04 + dz * 1.6)], '#5a4250', 1);
    f.line([onHead(b, s * 0.2, 1.02, -0.38), onHead(b, s * 0.36, 0.9, -0.62)], '#5a4250', 1);
  }
  // (his brow lined across; the furrow between his brows)
  for (const [c, w] of [[0.5, 0.42], [0.62, 0.36], [0.74, 0.28]] as const) {
    const ln: V3[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = -w + (i / 6) * w * 2;
      ln.push(onHead(b, a, 0.86 - a * a * 0.9 + 0.02, c + Math.sin(i * 1.7) * 0.015));
    }
    f.line(ln, '#5a4250', 1);
  }
  for (const s of [-1, 1]) f.line([onHead(b, s * 0.05, 0.98, 0.2), onHead(b, s * 0.07, 0.95, 0.36)], '#5a4250', 1);
  // (the rune on his brow, burning)
  {
    const R: V3 = onHead(b, 0, 0.93, 0.56);
    const g = (a: number, c: number): V3 => add(R, add(mul(b.hacross, a * 0.08 * k), mul(b.hup, c * 0.08 * k)));
    f.line([g(0, 1.4), g(0, -1.2)], '#e6ffff', 2);
    f.line([g(-0.9, 0.6), g(0, 0), g(0.9, 0.6)], '#8af6f0', 1);
    f.line([g(-0.7, -0.9), g(0.7, -0.9)], '#8af6f0', 1);
  }
  // (his nose: long, a hump to its bridge, its tip hanging)
  f.rod(skin, onHead(b, 0, 0.9, 0.16), onHead(b, 0, 1.18, -0.3), 0.1 * k, 0.12 * k, 0.12);
  f.egg(skin, onHead(b, 0, 1.0, -0.02), [0.1 * k, 0.09 * k, 0.12 * k], HA, 0.1);
  f.egg(skin, onHead(b, 0, 1.18, -0.38), [0.12 * k, 0.13 * k, 0.12 * k], HA, 0.1);
  for (const s of [-1, 1]) f.egg(skin, onHead(b, s * 0.11, 1.06, -0.42), [0.09 * k, 0.09 * k, 0.07 * k], HA, 0.08);
  // HIS BROWS, heavy and white, bushy, sweeping up and out
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const a0 = s * (0.1 + i * 0.13);
      const lift = i * 0.04;
      f.rod(white, onHead(b, a0, 1.0 - i * 0.07, 0.29 + lift), onHead(b, s * (0.24 + i * 0.15), 0.95 - i * 0.09, 0.38 + lift + i * 0.04), 0.08 * k, 0.055 * k, 0.06);
    }
  }
  // HIS MOUSTACHE drooping round his mouth into HIS BEARD, long and white, down over his chest to his sash, its point swinging
  for (const s of [-1, 1]) {
    f.rod(white, onHead(b, s * 0.05, 1.04, -0.52), onHead(b, s * 0.38, 0.9, -0.78), 0.13 * k, 0.11 * k, 0.1);
    f.rod(white, onHead(b, s * 0.38, 0.9, -0.78), onHead(b, s * 0.48, 0.74, -1.25), 0.11 * k, 0.08 * k, 0.1);
  }
  {
    // (from his cheeks and jaw, full; then down his front, narrowing to its point at his sash)
    f.egg(white, onHead(b, 0, 0.62, -0.86), [0.66 * k, 0.42 * k, 0.5 * k], HA, 0.3);
    for (const s of [-1, 1]) f.egg(white, onHead(b, s * 0.5, 0.35, -0.55), [0.24 * k, 0.32 * k, 0.48 * k], HA, 0.3);
    const BF: readonly (readonly [number, number])[] = [[1.6, 1.25], [1.3, 1.62], [0.45, 1.8], [-0.5, 1.86], [-1.2, 1.74], [-2.1, 1.68]];
    const beardFront = (c: number): number => {
      for (let i = 1; i < BF.length; i++) if (c >= BF[i][1 - 1]) {
        const [c0, f0] = BF[i - 1];
        const [c1, f1] = BF[i];
        return f0 + ((f1 - f0) * (c0 - c)) / (c0 - c1);
      }
      return BF[BF.length - 1][1];
    };
    const top = onHead(b, 0, 0.72, -1.15);
    const steps = 7;
    let prev = top;
    const strands: V3[][] = [[], [], [], [], [], [], [], [], []];
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const c = 1.55 - u * 3.55;
      // (lying over his mantle, then falling clear of it down his robe)
      const front = beardFront(c);
      const q = add(onChest(b, sway * u * u * 0.6, front, c), [0, 0, 0]);
      const wide = (0.86 - u * 0.66) * k;
      const d = sub(q, prev);
      f.egg(white, lerp(prev, q, 0.5), [wide, 0.28 * k * (1 - u * 0.5), len(d) * 0.62], along(d, b.across), 0.3);
      for (let st = 0; st < 9; st++) {
        const a = (st - 4) / 4 + Math.sin(u * 7 + st * 1.9) * 0.06;
        strands[st].push(add(add(lerp(prev, q, 0.5), mul(b.across, a * wide * 0.7)), mul(b.fwd, 0.28 * k * (1 - u * 0.5) * (1 - a * a * 0.5) + 0.03 * k)));
      }
      prev = q;
    }
    strands.forEach((sl, i) => f.line(sl, i % 2 ? '#aeaac4' : '#7e7a96', 1));
    // (its locks: soft waves at its edges, so that its outline is of hair and not of a cone)
    for (let i = 0; i < 12; i++) {
      const u = 0.1 + i * 0.07;
      const c = 1.55 - u * 3.55;
      const sd = i % 2 ? 1 : -1;
      const w = (0.86 - u * 0.66) * 0.78;
      const q0 = onChest(b, sway * u * u * 0.6 + sd * w, beardFront(c) - 0.02, c - 0.2);
      f.egg(white, q0, [0.2 * k * (1 - u * 0.5), 0.16 * k, 0.42 * k], TA, 0.3);
    }
  }

  // HIS COWL over his head, open over his face, its edge rolled and marked with points of light; falling to his mantle at his
  // neck and shoulders
  f.egg(cowl, onHead(b, 0, -0.22, 0.32), [1.24 * k, 1.36 * k, 1.4 * k], HA, 0.3);
  f.rod(cowl, onHead(b, 0, -0.7, 0.9), onHead(b, 0, -1.55, 0.95), 0.62 * k, 0.12 * k, 0.4);
  for (const s of [-1, 1]) f.rod(cowl, onHead(b, s * 0.95, -0.25, -0.5), onChest(b, s * 1.3, -0.2, 1.6), 0.55 * k, 0.6 * k, 0.4);
  f.rod(cowl, onHead(b, 0, -0.9, -0.3), onChest(b, 0, -1.0, 1.55), 0.7 * k, 0.75 * k, 0.4);
  const opening: V3 = onHead(b, 0, 1.02, -0.18);
  f.egg(cowl, opening, [0.74 * k, 0.86 * k, 1.04 * k], HA, 0.08, true);
  {
    // (the edge where the opening is cut from the cowl: for each way round the opening, how far out on it the two meet)
    const cowlFw = (a: number, c: number): number => -0.22 + 1.36 * Math.sqrt(Math.max(0, 1 - (a / 1.24) ** 2 - ((c - 0.32) / 1.4) ** 2));
    const rimPts: V3[] = [];
    for (let i = 0; i <= 18; i++) {
      const ph = -2.5 + (i / 18) * 5.0;
      let lo = 0;
      let hi = 1;
      for (let it = 0; it < 30; it++) {
        const m = (lo + hi) / 2;
        const a = 0.74 * m * Math.sin(ph);
        const c = -0.18 + 1.04 * m * Math.cos(ph);
        const fwCarve = 1.02 - 0.86 * Math.sqrt(1 - m * m);
        if (fwCarve < cowlFw(a, c)) lo = m;
        else hi = m;
      }
      const a = 0.74 * lo * Math.sin(ph);
      const c = -0.18 + 1.04 * lo * Math.cos(ph);
      rimPts.push(onHead(b, a, cowlFw(a, c), c));
    }
    for (let i = 1; i < rimPts.length; i++) f.rod(cowl, rimPts[i - 1], rimPts[i], 0.12 * k, 0.12 * k, 0.08);
    for (let i = 1; i < rimPts.length; i += 3) f.egg(fire, add(rimPts[i], mul(b.hfwd, 0.1 * k)), [0.055 * k, 0.055 * k, 0.055 * k], HA, 0);
  }
  void INK;
  return b;
}
