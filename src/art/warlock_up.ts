// THE WARLOCK BROUGHT UP: THE MAN (the queue's finish-mage-and-warlock-eight-sides, step 4, 12 Nov 2026;
// docs/mockups/warlock_up2/README.md, "The man"). BEHIND A SWITCH THAT IS OFF: `WARLOCK_UP`. Off, the game's Warlock is exactly as
// he is, every frame the same picture (tests/warlock_up.test.ts); nothing of this is drawn.
//
// His words, 11 Nov 2026, asked how far to go with him: “I want the longer cloak as well”; and of all the heroes, 6 Nov: “Are you
// actually painting 8 drawings or flipping some?”, his pick “Paint all 8 (Recommended)”. THE RULE OF 7 NOV (his words of the
// Ranger's stance re-posed for a leg measure: “Cmon.  He’s not a gunfighter why is he so bow legged.  Just please do it right, I
// don’t want to have to correct every single one of these because we made a minuscule change to the leg length”; of the
// Warrior's re-posed run: “all that time and you screwed up his run.  why is he high stepping with his knees up?”): only the look,
// the legs (by the length of the bones) and the eight true sides change; how he stands, runs and casts stays the game's.
//
// FROM THE 7 NOV STILL (the art chat's helper, branch art/warlock-up 87bc4dd), KEPT:
//   - HIS EIGHT SIDES, each truly painted, none flipped: his own sculpture (dev/sculpt_warlock.ts) truly turned under the game's
//     camera, the Warrior's eight turns (art/warrior_up.ts WU_SPIN): his demon arm, its spiked pauldron and the fire in its claws
//     on his left and the book at his right hip, whichever way he faces.
//   - HIS COAT, standing, hung as a heavy coat, longer, in folds, ragged at the hem, open down the front, split up the back in a
//     vent (`heavyCoat`); running, flung open in panels, the game's own.
//   - HIS BOOTS real boots to the knee in the game's own brown hide worn dark (`realBoots`).
// FROM THE 7 NOV STILL, OUT: his feet set wider in his stance (its WL_FEET, WL_STAND) and his run re-posed (its WL_RUN). His
// stance, run and every move are the game's own keys. What he asked of his legs is in his bones (WL_UP_BODY, below), as the
// Ranger's, the Mage's: his knee joint raised, his hips and feet where the game has them.
//
// THE ONE MAN EVERYWHERE HE IS PAINTED: his sculptor reads this file's switch through dev/sculpt_warlock.ts WARLOCK_DRESS, so the
// change into his demon and its burning out (him on one knee, getting up) show him brought up too, his coat and boots torn away
// as the game's are.

import { hash } from './kit';
import type { Ramp } from './kit';
import { add, cross, dot, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Build, Skeleton, V3 } from './skeleton';
import type { Hit, Prim, Sculpt } from '../dev/sculpt';
void (0 as unknown as Prim);
import { COAT, SKIRT_OPEN, SKIRT_SWING, WARLOCK_DRESS, WARLOCK_SCULPT_BODY } from '../dev/sculpt_warlock';
import type { WarlockSculpt } from '../dev/sculpt_warlock';
import { HIDE, shadeOf } from '../dev/sculpt_classes';
import { warlockPose } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';

/** THE SWITCH: OFF. The main chat's to turn on, at his yes to him in play. */
export const WARLOCK_UP = { on: false };

// ---------------------------------------------------------------------------------------------
// HIS BONES: THE KNEE JOINT RAISED A LITTLE (as art/ranger_up_moves.ts RU_BODY, art/mage_up_moves.ts MU_BODY)
//
// The game's Warlock (dev/sculpt_warlock.ts WARLOCK_SCULPT_BODY) stands with his knee to the floor (the shin, and the ankle under
// it) 1.16 times his hip to his knee (the thigh). His knee joint is raised as the Ranger's and the Mage's were, to 1.3: the thigh
// shorter and the shin longer by as much. The whole leg is as long as it was, so his hips and his feet are where they were in every
// pose; only where the knee bends moves.
export const WL_SHIN_RATIO = 1.3;
const GB = WARLOCK_SCULPT_BODY;
/** How far his knee joint is raised (units). */
export const WL_KNEE_UP = GB.thigh - (GB.ankle + GB.shank + GB.thigh) / (1 + WL_SHIN_RATIO);
/** His body, brought up: the game's Warlock's, his knee joint raised by WL_KNEE_UP. */
export const WL_UP_BODY: Build = { ...GB, thigh: GB.thigh - WL_KNEE_UP, shank: GB.shank + WL_KNEE_UP };

/** HIS BOOTS TO THE KNEE: how far down his shin, from the knee joint, the top of each boot's cuff is (a share of knee to ankle). The
 * game's are 0.42 down (dev/sculpt_classes.ts tailorFor `boots`, high); these 0.06, just under the knee. */
export const WL_BOOT_TOP = 0.06;
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

/** The last coat laid (for the checks). */
export const WL_LAST: { coat: WlCoat | null } = { coat: null };

const sig = (r: readonly string[]): string => r.join(',');
/** His coat (the first of the coat's cloth made), his trousers (the second), his boots (the first hide after them). */
export function wlMats(sc: Sculpt): { coat: number; trousers: number; boots: number } {
  const C = sig(COAT);
  const Hd = sig(HIDE);
  const coat = sc.mats.findIndex((m) => sig(m.ramp) === C);
  const trousers = sc.mats.findIndex((m, i) => i > coat && sig(m.ramp) === C);
  const boots = sc.mats.findIndex((m, i) => i > trousers && sig(m.ramp) === Hd);
  return { coat, trousers, boots };
}

/**
 * HIM DRESSED AS HE IS BROUGHT UP, his sculpture made (dev/sculpt_warlock.ts WARLOCK_DRESS calls it): real boots to the knee, and
 * standing his heavy coat (running it is flung open, the game's own). `B`: the bones he is drawn on.
 */
export function dressWarlock(m: WarlockSculpt, B: Build): void {
  const mats = wlMats(m.sc);
  if (mats.boots >= 0) realBoots(m.sc, m.s, B, mats.boots, WL_BOOT_TOP);
  WL_LAST.coat = !SKIRT_OPEN.on && mats.coat >= 0 ? heavyCoat(m.sc, m.s, mats.coat, B) : null;
}

// (his sculptor dresses him so while the switch is on)
WARLOCK_DRESS.on = () => WARLOCK_UP.on;
WARLOCK_DRESS.body = () => WL_UP_BODY;
WARLOCK_DRESS.dress = dressWarlock;

/** His skeleton at a moment of a move, brought up (no painting). */
export function wlSkeleton(m: WarlockMove, t: number, B: Build = WL_UP_BODY): Skeleton {
  return solve(B, warlockPose(m.motion, t));
}

const squareTo = (v: V3, w: V3, or: V3 = [1, 0, 0]): V3 => norm(sub(v, mul(w, dot(v, w))), or);

// ---------------------------------------------------------------------------------------------
// HIS BOOTS

/**
 * REAL BOOTS, in the game's own brown hide worn dark, to just under his knee (`top`, a share down his shin). The game's boot (its
 * shaft from below the middle of the shin, its foot and sole: dev/sculpt_classes.ts `boots`) is kept where it is, and given this
 * leather; over it: the shaft carried up over his trousers, following the shin's curve with the calf's swell behind; a turned
 * cuff at its top; a heel under it. Painted a tone darker than the game's lit brown, so it reads as dark worn leather on a dark
 * figure and never as a light patch: the light only along its edges (the cuff's lip, the shin's ridge, the toe), creases where it
 * folds at the ankle, the sole and heel darkest. Made IN THE GAME'S BOOTS' OWN PLACE among his materials (so that the change tears
 * them away as it tears his boots: dev/warlock_change.ts tearsAt goes by a material's place). Returns its material.
 */
function realBoots(sc: Sculpt, s: Skeleton, B: Build, gameBoots: number, top: number): number {
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
  const boot0 = sc.mat({
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
  // the game's boot: its leather this, in its own place (the new material put there, its own place given back)
  sc.mats[gameBoots] = sc.mats[boot0];
  sc.mats.pop();
  const boot = gameBoots;
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
/** How far the opening and the vent are drawn round toward the leg that comes through each, at the most (degrees). */
const OPEN_LEAN = 25;
const VENT_HALF = 0;
const VENT_TOP = 0.3;
/** THE VENT UP HIS BACK, CLOSED AS HE STANDS (12 Nov): on the game's own stance his legs are close together under him, and a vent
 * hung open (the 7 Nov still's, 21 degrees either side of his back leg) showed as a dark gap down the middle of his back between
 * two halves of his coat: from behind it read as a pair of trousers. So it hangs closed, a seam piped in red from VENT_TOP down
 * (degrees either side of the way it hangs: VENT_SEAM), and a leg that comes back through it pushes the cloth out (the cloth is
 * kept clear of his legs everywhere, below). */
const VENT_SEAM = 3.2;

/**
 * THE COAT HUNG AS A HEAVY COAT (standing; the game's one smooth cone and the slit carved in it taken away): one sheet of the same
 * black wool hung from his hips, narrow there, falling in folds that open out as they go down (each column of it standing out or
 * falling in by its fold) and break at the hem, a ridge hanging lower than a hollow and each its own length, so the hem is ragged;
 * kept clear of his legs (each column as far out as a leg under it needs); open down the front where his front leg comes through,
 * piped in red; split up the back in a vent over his back leg; the lower cloth swinging behind as he moves (the game's SKIRT_SWING).
 * And on the coat over his back, its folds from his shoulders down. Returns it as laid, for the checks.
 */
function heavyCoat(sc: Sculpt, s: Skeleton, coatMat: number, B: Build): WlCoat | null {
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
  // (THE OPENING DOWN HIS FRONT AND THE VENT UP HIS BACK: before him and behind him, each drawn toward the leg that comes through
  // it by a third of the way, never more than OPEN_LEAN. The 7 Nov still put them where his ankles were, over its long stance; on
  // the game's own stance his feet are close under him, side by side, and that put the opening at his left side, the vent at his
  // right)
  const lean = (a: number, from: number): number => {
    const d = ((((a - from) % 360) + 540) % 360) - 180;
    return from + Math.max(-OPEN_LEAN, Math.min(OPEN_LEAN, d / 3));
  };
  const aFront = lean(angOf(frontAnkle, footC), 0);
  const aBack = lean(angOf(backAnkle, footC), 180);
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
        // (a point of a leg between this row and the next, above or below, is cleared at both: the cloth between two rows is
        // laid straight from one to the other, and a knee or a boot between them must not come through it. The 7 Nov still looked
        // only 2.6 either side, so a heel raised behind him as he gets up off one knee came through the vent's edge)
        const zUp = ri > 0 ? zAt(ROWS[ri - 1]) : z;
        const zDown = ri + 1 < ROWS.length ? zAt(ROWS[ri + 1]) : z;
        if (p[2] > Math.max(z + 2.6, zUp) || p[2] < Math.min(z - 2.6, zDown)) continue;
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
      // (the vent's seam down his back, piped in red, from its top to the hem)
      const seam = k > VENT_TOP && gap(a, aBack) < VENT_SEAM;
      if (edge || ventEdge || seam) return shadeOf(BOOKRED, h.tone);
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

