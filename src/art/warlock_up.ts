// THE WARLOCK BROUGHT UP (the art chat's helper, 7 Nov 2026; docs/mockups/warlock_up/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF: `WARLOCK_UP`. Nothing of the game imports this file: the game's Warlock is exactly as he
// is (art/warlock_art.ts, his sculpt dev/sculpt_warlock.ts, his moves dev/warlock_*.ts and dev/demon_*.ts).
//
// HIS LOOK STAYS AS HE PASSED IT: sculpted already (dev/sculpt.ts), his look and every move given the owner's yes in the art chat
// (docs/mockups/classes/BRIEF.md on mockup/classes). The big man in the long dark coat, hunched and pained; the horned hood, two
// points of cyan for eyes; the spiked pauldron on his left shoulder; his left arm the demon's, red hide, spines and cracks of cyan
// light, its claws round a cyan hellfire; his right hand clamped on it; the red book chained at his right hip. This file paints
// that very sculpture, by its own painter (dev/sculpt_warlock.ts warlockSculpt, drawWarlockSculpt), only:
//   - FROM ALL EIGHT SIDES, EACH TRULY PAINTED, NONE FLIPPED (his rulebook's Heroes 7; the owner, 6 Nov: “Are you actually painting
//     8 drawings or flipping some?”, his pick “Paint all 8 (Recommended)”): the Warrior's eight (art/warrior_up.ts WuSide, WU_SPIN),
//     his figure truly turned under the game's camera (Sculpt.spin), so that the demon arm is his left, the pauldron on it, and the
//     book at his right hip, whichever way he faces. The three sides that face left are laid with his floor point 98 across his
//     canvas, as the Warrior's, the Ranger's and the Mage's.
//   - HIS BOOTS, REAL BOOTS TO THE KNEE (for his legs: the owner, of the Ranger's still, “Can you make sure his leg ratio is correct
//     cause it seems like all these guys have long upper legs and short legs below the knee”; and his rule, 6 Nov 15:18,
//     “Everything drawn should not just look like shapes.  That’s the rule”): the same boots, in the game's own brown hide, worn
//     dark; brought up to just under his knee with a turned cuff; the shin's curve and the calf's swell in the shaft; creases
//     at the ankle; a heel and a sole; the worn leather lit along its edges. So where his coat opens the knee the eye sees is his
//     knee, and not a point 6.3 game pixels down his shin.
//   - HIS COAT, STANDING, HUNG AS A HEAVY COAT OVER HIS LONGER STANCE: in place of the game's one smooth cone, the same black wool
//     hung from his hips in folds that run down from his shoulders and break at the hem, its hem ragged and uneven, its red lining
//     at the hem and its red-piped opening down the front kept; split at the back in a vent over his back leg, so that leg and its
//     boot show through it; heavier cloth swinging behind his front leg; narrow and hunched at the top as before. (Running, his
//     coat is flung open in panels, the game's own: unchanged.)
//   - on his moves re-posed where his legs need it (art/warlock_up_moves.ts).

import { CANVAS3 } from './skin';
import { hash } from './kit';
import type { Ramp } from './kit';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Posed, Skeleton, V3 } from './skeleton';
import { solve, bonesAt } from './skeleton';
import type { Drawn, Hit, Prim, Sculpt } from '../dev/sculpt';
import { COAT, SKIRT_OPEN, SKIRT_SWING, WARLOCK_SCULPT_BODY, drawWarlockSculpt, warlockSculpt } from '../dev/sculpt_warlock';
import { HIDE, shadeOf } from '../dev/sculpt_classes';
import { STANCE, withWarlockAt } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { WU_SIDES, WU_SPIN } from './warrior_up';
import type { WuSide } from './warrior_up';

/** THE SWITCH: off. The main chat's to turn on, on his yes to the pictures (and once his lists are brought up as well, stage 2). */
export const WARLOCK_UP = { on: false };

/** His sides: the Warrior's eight (art/warrior_up.ts). */
export type WlSide = WuSide;
export const WL_SIDES = WU_SIDES;

/** His build (dev/sculpt_warlock.ts): the knight's height, broad. */
export const WL_BODY = WARLOCK_SCULPT_BODY;

/**
 * HIS BOOTS TO THE KNEE: how far down his shin, from the knee joint, the top of each boot's cuff is (a share of knee to ankle). The
 * game's are 0.42 down (dev/sculpt_classes.ts tailorFor `boots`, high); these 0.06, just under the knee.
 */
export const WL_BOOT_TOP = 0.06;
/** Before (the game's high boot), for the pictures' before. */
export const WL_BOOT_TOP_BEFORE = 0.42;
/** The book's red (dev/sculpt_warlock.ts BOOKRED): his coat's lining and the piping at its opening. */
const BOOKRED: Ramp = ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'];

/** His standing coat's skirt as laid (for the checks): its rings of points round him, top to hem, and which columns hang. */
export interface WlCoat {
  /** rings[row][column]: the cloth's points, top (at his hips) to hem. */
  rings: V3[][];
  /** Whether column `c` hangs in row `r` (false in the opening down the front, and in the vent at the back below its top). */
  hangs: (r: number, c: number) => boolean;
  /** The way each column hangs out from him (flat), and the middle it hangs round at each row. */
  out: V3[];
  centre: V3[];
}

/** What a painted frame of him is, for the checks and the pictures. */
export interface WlFrame {
  px: Drawn['px'];
  drawn: Drawn;
  sc: Sculpt;
  s: Skeleton;
  /** How far he was turned for the side he was seen from (degrees to his left). */
  spin: number;
  /** Where on his canvas the floor point under him is (WU_SPIN's `ax`: 98 for the three sides that face left), and its height. */
  ax: number;
  ay: number;
  /** The materials of his sculpture by what they are (for the measures and the checks): his coat, his trousers, his boots. */
  mats: { coat: number; trousers: number; boots: number };
  /** His standing coat's skirt, as laid (null running, or before). */
  coat: WlCoat | null;
}

/** His pose at a moment of a move (his moves' keys over his stance, as dev/warlock_moves.ts warlockPose). */
export function wlPose(m: WarlockMove, t: number): Posed {
  return bonesAt(m.motion.keys, STANCE, t);
}

const sig = (r: readonly string[]): string => r.join(',');

/**
 * HIM AT A MOMENT OF A MOVE, painted from one of his eight sides: his own sculpture (dev/sculpt_warlock.ts) on his own bones, the
 * coat's skirts trailing and the fire in his claws as the move has them (dev/warlock_moves.ts withWarlockAt), truly turned;
 * `boots`: how far down his shin his boot tops are (WL_BOOT_TOP; WL_BOOT_TOP_BEFORE, the game's boots and coat, for a before).
 */
export function paintWarlockUp(m: WarlockMove, t: number, side: WlSide, boots = WL_BOOT_TOP): WlFrame {
  const { spin, ax } = WU_SPIN[side];
  return withWarlockAt(m, t, spin, () => {
    const q = wlPose(m, t);
    const ws = warlockSculpt('front', q as unknown as Bones, spin);
    const mats = matsOf(ws.sc);
    let coat: WlCoat | null = null;
    if (boots < WL_BOOT_TOP_BEFORE - 1e-6) {
      mats.boots = realBoots(ws.sc, ws.s, mats.boots, boots);
      if (!SKIRT_OPEN.on) coat = heavyCoat(ws.sc, ws.s, mats.coat);
    }
    const drawn = drawWarlockSculpt(ws, undefined, { ...CANVAS3, ax });
    return { px: drawn.px, drawn, sc: ws.sc, s: ws.s, spin, ax, ay: CANVAS3.ay, mats, coat };
  });
}

/** His coat (the first of the coat's cloth made), his trousers (the second), his boots (the first hide after them). */
function matsOf(sc: Sculpt): WlFrame['mats'] {
  const C = sig(COAT);
  const Hd = sig(HIDE);
  const coat = sc.mats.findIndex((m) => sig(m.ramp) === C);
  const trousers = sc.mats.findIndex((m, i) => i > coat && sig(m.ramp) === C);
  const boots = sc.mats.findIndex((m, i) => i > trousers && sig(m.ramp) === Hd);
  return { coat, trousers, boots };
}

/** `v` made square to the unit `w`. */
const squareTo = (v: V3, w: V3, or: V3 = [1, 0, 0]): V3 => norm(sub(v, mul(w, dot(v, w))), or);

// ---------------------------------------------------------------------------------------------
// HIS BOOTS

/**
 * REAL BOOTS, in the game's own brown hide worn dark, to just under his knee (`top`, a share down his shin). The game's boot (its
 * shaft from below the middle of the shin, its foot and sole: dev/sculpt_classes.ts `boots`) is kept where it is, and given this
 * leather; over it: the shaft carried up over his trousers, following the shin's curve with the calf's swell behind; a turned
 * cuff at its top; a heel under it. Painted a tone darker than the game's lit brown, so it reads as dark worn leather on a dark
 * figure and never as a light patch: the light only along its edges (the cuff's lip, the shin's ridge, the toe), creases where it
 * folds at the ankle, the sole and heel darkest. Returns its material.
 */
function realBoots(sc: Sculpt, s: Skeleton, gameBoots: number, top: number): number {
  const B = WL_BODY;
  const [, lK, lA] = B.legR;
  const legs = {
    L: { knee: s.kneeL, ankle: s.ankleL, heel: s.heelL, toe: s.toeL },
    R: { knee: s.kneeR, ankle: s.ankleR, heel: s.heelR, toe: s.toeR },
  };
  /** How far down its shin a point of a boot is (0 the knee, 1 the ankle), and how far round to its front (1 the shin's ridge). */
  const onShin = (p: V3, piece: string): { down: number; front: number } => {
    const g = legs[piece.endsWith('L') ? 'L' : 'R'];
    const d = sub(g.ankle, g.knee);
    const L = Math.hypot(d[0], d[1], d[2]) || 1;
    const dn = mul(d, 1 / L);
    const v = sub(p, g.knee);
    const down = dot(v, dn) / L;
    const fw = squareTo(sub(g.toe, g.heel), dn);
    const across = sub(v, mul(dn, dot(v, dn)));
    const r = Math.hypot(across[0], across[1], across[2]) || 1;
    return { down, front: dot(across, fw) / r };
  };
  const boot = sc.mat({
    ramp: HIDE,
    crease: 0.42,
    paint: (h: Hit) => {
      const tg = h.prim.tag ?? '';
      // (worn dark: a tone under the game's brown everywhere; the light only where an edge of the leather catches it)
      const t = h.tone - 1;
      if (tg === 'sole') return shadeOf(HIDE, Math.min(1, h.tone - 2));
      if (tg === 'heel') return shadeOf(HIDE, Math.min(1, h.tone - 1));
      if (tg === 'cuff') {
        // (the cuff: the leather turned down, its lip lit along the top, its underside in shadow on the shaft)
        const { down } = onShin(h.p, h.prim.piece);
        if (down < top + 0.035 && h.tone >= 2) return shadeOf(HIDE, Math.min(3, h.tone));
        if (down > top + 0.13) return shadeOf(HIDE, t - 1);
        return shadeOf(HIDE, h.tone >= 3 ? 2 : Math.min(1, t));
      }
      if (tg === 'foot') {
        // (the toe worn pale along its top where the light finds it)
        return shadeOf(HIDE, h.tone >= 4 ? 3 : h.tone >= 3 ? 2 : Math.min(1, t));
      }
      // THE SHAFT
      const { down, front } = onShin(h.p, h.prim.piece);
      // (creases where it folds at the ankle: two or three dark lines across it, a little slanted)
      if (down > 0.66 && down < 0.95 && (down * 5.5 + front * 0.35) % 1 < 0.3) return shadeOf(HIDE, Math.min(1, t - 1));
      // (the shin's ridge down its front, worn and catching the light)
      if (front > 0.72 && h.tone >= 2) return shadeOf(HIDE, hash(h.x, h.y, 7) < 0.25 ? 3 : 2);
      // (darker in the shade: the game's brown only where the light is on it)
      return shadeOf(HIDE, h.tone >= 3 ? 2 : Math.min(1, t));
    },
  });
  // the game's boot: its leather this
  for (const p of sc.prims) if (p.mat === gameBoots) (p as Prim & { mat: number }).mat = boot;
  for (const sd of ['L', 'R'] as const) {
    const g = legs[sd];
    const piece = `leg${sd}`;
    const dn = norm(sub(g.ankle, g.knee));
    const fw = squareTo(sub(g.toe, g.heel), dn);
    const across = norm(cross(dn, fw));
    const at = (k: number): V3 => lerp3(g.knee, g.ankle, k);
    // the shaft: over his trousers from under the knee to where the game's boot is fuller than they are; the shin's curve (the
    // front a little forward under the knee, straight down the bone) and the calf's swell behind
    sc.cone(boot, piece, at(top + 0.06), at(0.5), lK + 0.95, lK + (lA - lK) * 0.5 + 0.85, 1.0, { tag: 'shaft' });
    sc.cone(boot, piece, at(0.5), at(0.8), lK + (lA - lK) * 0.5 + 0.85, lK + (lA - lK) * 0.8 + 0.85, 1.0, { tag: 'shaft' });
    sc.ell(boot, piece, add(at(0.3), mul(fw, -0.9)), [mul(dn, lK * 1.5), mul(fw, lK * 0.95), mul(across, lK * 0.98)], 1.0, { tag: 'shaft' });
    // the turned cuff: a fold of leather round the top, a little wider than the shaft, its lip out
    sc.cone(boot, piece, at(top), at(top + 0.15), lK + 1.45, lK + 1.25, 0.35, { tag: 'cuff' });
    // the heel: a block of stacked leather under the back of the foot, on the floor and never in it
    const fd = norm(sub(g.toe, g.heel));
    const side = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    const hc: V3 = [g.heel[0] + fd[0] * 0.5, g.heel[1] + fd[1] * 0.5, 0.75];
    if (Math.max(g.heel[2], g.toe[2]) < 0.6) sc.box(boot, piece, hc, [mul(norm([fd[0], fd[1], 0]), 1.2), mul(side, 1.45), [0, 0, 0.7]], 0.3, 0.3, { tag: 'heel', cuts: [{ n: [0, 0, -1], o: 0 }] });
  }
  return boot;
}

// ---------------------------------------------------------------------------------------------
// HIS COAT, STANDING

/** Its columns round him, and its rows top to hem (shares of the way down). */
const COLS = 28;
const ROWS = [0, 0.3, 0.64, 0.92, 1];
/** Its folds round him, from his front round by his left: how far each column stands out (a ridge) or falls in (a hollow); none
 * quite the same. */
const FOLD = [0.2, 0.9, -0.5, 1.2, -0.7, 0.8, -0.4, 1.3, -0.6, 1.0, -0.3, 1.25, -0.75, 0.9, -0.45, 1.35, -0.6, 0.85, -0.5, 1.15, -0.7, 1.0, -0.35, 1.2, -0.55, 0.95, -0.4, 0.7];
/** The opening down his front (degrees either side of the way his front leg goes out), and the vent up his back (either side of
 * the way his back leg goes), and how far up the vent is split (a share of the way down: below this). */
const OPEN_HALF = 30;
const VENT_HALF = 21;
const VENT_TOP = 0.3;

/**
 * THE COAT HUNG AS A HEAVY COAT (standing; the game's one smooth cone and the slit carved in it taken away): one sheet of the same
 * black wool hung from his hips, narrow there, falling in folds that open out as they go down (each column of it standing out or
 * falling in by its fold) and break at the hem, a ridge hanging lower than a hollow and each its own length, so the hem is ragged;
 * kept clear of his legs (each column as far out as a leg under it needs); open down the front where his front leg comes through,
 * piped in red; split up the back in a vent over his back leg; the lower cloth swinging behind as he moves (the game's SKIRT_SWING).
 * And on the coat over his back, its folds from his shoulders down. Returns it as laid, for the checks.
 */
function heavyCoat(sc: Sculpt, s: Skeleton, coatMat: number): WlCoat | null {
  const ci = sc.prims.findIndex((p) => p.k === 'cone' && p.piece === 'skirt' && p.tag === 'skirt');
  if (ci < 0) return null;
  const cone = sc.prims[ci] as Prim & { a: V3; b: V3; ra: number; rb: number };
  const top = cone.a;
  const foot0 = cone.b;
  const ra = cone.ra;
  const rb = cone.rb;
  // (the game's cone and its slit go)
  for (let i = sc.prims.length - 1; i >= 0; i--) {
    const p = sc.prims[i];
    if (p.piece === 'skirt' && ((p.k === 'cone' && p.tag === 'skirt') || p.carve)) sc.prims.splice(i, 1);
  }
  const B = WL_BODY;
  const [lH, lK, lA] = B.legR;
  const sw = SKIRT_SWING.v;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l = norm([s.hips[1][0], s.hips[1][1], 0], [0, 1, 0]);
  const hemZ = 2.0;
  const footC: V3 = [foot0[0] - sw[0], foot0[1] - sw[1], hemZ];
  const D = Math.PI / 180;
  const angOf = (p: V3, c: V3): number => {
    const v: V3 = [p[0] - c[0], p[1] - c[1], 0];
    return Math.atan2(dot(v, l), dot(v, f)) / D;
  };
  const gap = (a: number, b: number): number => Math.abs(((((a - b) % 360) + 540) % 360) - 180);
  // (which ankle is before him and which behind, along the way his hips face)
  const frontAnkle = dot(sub(s.ankleL, s.ankleR), f) >= 0 ? s.ankleL : s.ankleR;
  const backAnkle = frontAnkle === s.ankleL ? s.ankleR : s.ankleL;
  const aFront = angOf(frontAnkle, footC);
  const aBack = angOf(backAnkle, footC);
  const angs = Array.from({ length: COLS }, (_, i) => aFront + (i * 360) / COLS);
  const inOpen = angs.map((a) => gap(a, aFront) < OPEN_HALF);
  const inVent = angs.map((a) => gap(a, aBack) < VENT_HALF);
  const outs = angs.map((a) => norm(add(mul(f, Math.cos(a * D)), mul(l, Math.sin(a * D))), f));
  const centreAt = (k: number): V3 => {
    const c = lerp3(top, footC, k);
    // (the lower cloth swings behind as he moves, more the further down)
    return add(c, mul(sw, Math.pow(k, 1.6) * 0.9));
  };
  const zAt = (k: number): number => top[2] + (hemZ - top[2]) * k;
  // (each leg as points down it with its radius there)
  const legPts: [V3, number][] = [];
  for (const [hip, knee, ankle] of [[s.hipL, s.kneeL, s.ankleL], [s.hipR, s.kneeR, s.ankleR]] as const) {
    for (let i = 0; i <= 8; i++) legPts.push([lerp3(hip, knee, i / 8), lH + (lK - lH) * (i / 8) + 0.9]);
    for (let i = 1; i <= 8; i++) legPts.push([lerp3(knee, ankle, i / 8), lK + (lA - lK) * (i / 8) + 1.6]);
  }
  // how far out each column must hang at each row to clear his legs (and the boots on them), or as the game's cone hung
  const rings: V3[][] = [];
  const radii: number[][] = ROWS.map((k) => angs.map(() => ra + (rb - ra) * Math.pow(k, 0.75)));
  ROWS.forEach((k, ri) => {
    if (ri === 0) return;
    const z = zAt(k);
    const c = centreAt(k);
    angs.forEach((_, i) => {
      for (const [p, r] of legPts) {
        if (Math.abs(p[2] - z) > 2.6) continue;
        const rel: V3 = [p[0] - c[0], p[1] - c[1], 0];
        const radial = dot(rel, outs[i]);
        const acr = Math.abs(dot(rel, [-outs[i][1], outs[i][0], 0]));
        if (radial > 0 && acr < r + 1.4) radii[ri][i] = Math.max(radii[ri][i], radial + r + 0.8 - acr * 0.15);
      }
    });
  });
  // (cloth: each column eased toward its neighbours so it drapes between them and never spikes; and never narrower going down)
  for (let ri = 1; ri < ROWS.length; ri++) {
    const r = radii[ri];
    radii[ri] = r.map((n, i) => Math.max(n, 0.5 * n + 0.25 * r[(i + COLS - 1) % COLS] + 0.25 * r[(i + 1) % COLS], radii[ri - 1][i]));
  }
  ROWS.forEach((k, ri) => {
    const c = centreAt(k);
    // (its top a little over the belt and round it, as the game's cone was, so it hangs from under the belt)
    const z = ri === 0 ? zAt(k) + 1.0 : zAt(k);
    if (ri === 0) radii[0] = radii[0].map((r) => r + 0.6);
    rings.push(angs.map((_, i) => {
      // (the fold: gathered to nothing at his hips, standing out more as it falls)
      const fold = FOLD[i] * Math.min(1, k * 1.5);
      const r = radii[ri][i] + fold * 0.85;
      // (at the hem a ridge hangs lower than a hollow, and each its own length: the hem ragged and uneven)
      const ragged = ri >= ROWS.length - 2 ? -Math.max(0, FOLD[i]) * 0.7 + Math.max(0, -FOLD[i]) * 0.5 + (hash(i, 3, 41) - 0.5) * 1.1 : 0;
      return [c[0] + outs[i][0] * r, c[1] + outs[i][1] * r, Math.max(ri === ROWS.length - 1 ? 0.6 : 1.4, z + ragged * (ri === ROWS.length - 1 ? 1 : 0.6))];
    }));
  });
  // (its top as the game's: the game's own cone, rounded over his hips and the belt and melted into the coat above, down to where
  // the folds open out and the vent begins)
  sc.cone(coatMat, 'skirt', top, lerp3(top, foot0, ROWS[1]), ra, ra + (rb - ra) * ROWS[1], 1.4, { tag: 'cskirt' });
  const hangs = (ri: number, i: number): boolean => !inOpen[i] && !(inVent[i] && ROWS[ri] >= VENT_TOP);
  for (let ri = 0; ri + 1 < ROWS.length; ri++) for (let i = 0; i < COLS; i++) {
    const j = (i + 1) % COLS;
    // (a panel of the sheet between two columns, where both hang at both rows; the vent's edges hang down to the hem)
    if (!hangs(ri, i) || !hangs(ri, j) || !hangs(ri + 1, i) || !hangs(ri + 1, j)) continue;
    const tag = ri === ROWS.length - 2 ? 'chem' : 'cskirt';
    const a = rings[ri][i];
    const b = rings[ri][j];
    const c = rings[ri + 1][i];
    const d = rings[ri + 1][j];
    sc.tri(coatMat, 'skirt', a, b, d, 0.5, 0.9, { tag });
    sc.tri(coatMat, 'skirt', a, d, c, 0.5, 0.9, { tag });
  }
  // HOW IT IS PAINTED: its folds read as folds whatever the light (a hollow a tone darker, a ridge lit); its edges at the opening
  // and the vent piped in red; its red lining at the hem; and on the coat over his back, its folds running down from his shoulders
  const mat = sc.mats[coatMat];
  const before = mat.paint;
  const [F, L] = s.upper;
  const backFold = (h: Hit): string | null => {
    // (four long folds from his shoulder blades down to his waist, a hollow each with its edge lit, on the back of his coat)
    const v = sub(h.p, s.neck);
    if (dot(h.n, F) > -0.25 || v[2] > -2.2 || h.p[2] < top[2]) return null;
    const a = Math.atan2(dot(v, L), -dot(v, F)) / D;
    const depth = Math.min(1, (-v[2] - 2.2) / 5);
    for (const [at, w] of [[-34, 5], [-12, 4], [13, 4], [36, 5]] as const) {
      const off = a - at - v[2] * (at > 0 ? 0.6 : -0.6);
      if (Math.abs(off) < w * 0.5 * depth + 0.8) return shadeOf(COAT, h.tone - 1);
      if (off > w * 0.5 * depth + 0.8 && off < w * depth + 1.6 && h.tone >= 2) return shadeOf(COAT, Math.min(3, h.tone + 1));
    }
    return null;
  };
  mat.paint = (h: Hit) => {
    const tg = h.prim.tag ?? '';
    if (tg === 'cskirt' || tg === 'chem') {
      const k = Math.max(0, Math.min(1, (top[2] - h.p[2]) / Math.max(1, top[2] - hemZ)));
      const c = centreAt(k);
      const a = angOf(h.p, c);
      // (its edges, at the opening down the front and the vent up the back, piped in red)
      const x = ((a - aFront) % 360 + 360) % 360;
      const fi = x / (360 / COLS);
      const i0 = Math.floor(fi) % COLS;
      const i1 = (i0 + 1) % COLS;
      const ri = Math.min(ROWS.length - 1, ROWS.findIndex((r) => r >= k));
      const edge = (inOpen[(i0 + COLS - 1) % COLS] && fi - Math.floor(fi) < 0.28) || (inOpen[(i1 + 1) % COLS] && fi - Math.floor(fi) > 0.72);
      const ventEdge = ROWS[Math.max(0, ri)] > VENT_TOP && ((inVent[(i0 + COLS - 1) % COLS] && fi - Math.floor(fi) < 0.22) || (inVent[(i1 + 1) % COLS] && fi - Math.floor(fi) > 0.78));
      if (edge || ventEdge) return shadeOf(BOOKRED, h.tone);
      // (the red lining of its hem)
      if (tg === 'chem' && hash(h.x, h.y, 5) < 0.85) return shadeOf(BOOKRED, h.tone - 1);
      const fold = (FOLD[i0] + (FOLD[i1] - FOLD[i0]) * (fi - Math.floor(fi))) * Math.min(1, k * 1.5);
      if (fold < -0.3) return shadeOf(COAT, h.tone - 1);
      if (fold > 0.75 && h.tone >= 2) return shadeOf(COAT, Math.min(3, h.tone + 1));
      return shadeOf(COAT, Math.min(3, h.tone));
    }
    if (h.prim.piece === 'torso') {
      const b = backFold(h);
      if (b) return b;
    }
    return before ? before(h) : null;
  };
  return { rings, hangs, out: outs, centre: ROWS.map((k) => centreAt(k)) };
}

/** His skeleton at a moment of a move (no painting). */
export function wlSkeleton(m: WarlockMove, t: number): Skeleton {
  return solve(WL_BODY, wlPose(m, t));
}
