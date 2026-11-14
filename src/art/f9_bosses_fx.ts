// FLOOR 9'S SIDE BOSSES: WHAT THEIR MOVES DO TO THE FLOOR AND THROW UP FROM IT, PAINTED WHERE IT IS (render/act1_fx/f9_bosses.ts paints it
// live, at the floor point where each move began, in the frame its picture is shown in: game/act1_rules/stoker.ts FRAMES). As he saw
// them filmed (tools/f9_bosses_film.ts, docs/mockups/f9_side_bosses/README.md), each wild in its own way (his rulebook, Animations 3):
// THE TROLL CHIEFTAIN'S is the earth and brute force: the warning laid on the ground in the enemy's pink before each blow (a ring where
//   the club will land, a lane where the crack will run and where he will charge), the ground broken (cracks glowing in their depths,
//   rock thrust up, shockwaves rolling out), stone and dust flung up, the burst where a blow lands, the rage's fire bursting up round him;
// THE MIST WOLF'S is mist and speed: its warnings (a ring, the claw's arc, the lunge's lane, the cloud's ring), the ground scored by its
//   claws, mist bursting where it strikes and pushes off, the mist where its wolves come out of it, the streak of mist where it went
//   through, its cloud (laid under what stands, so the hero is seen in it: Animations 4) with its glints and its eyes moving in it.
// `ground` is laid under everything that stands; `air` over it. Behind F9_LAIRS, off.

import type { Px } from '../engine/px';
import { FLAME } from './mkit';
import type { F9View } from './f9_bosses_art';
import { f9At } from './f9_bosses_art';
import { CHIEF_MOVES, CLAW_ARC, LUNGE_LONG, RUSH_LONG, WOLF_MOVES, chiefClubHead, chiefPose, wolfPose } from './f9_bosses_moves';
import type { ChiefMove, WolfMove } from './f9_bosses_moves';
import { CK, WK } from './f9_bosses_sculpt';
import { arcPath, bigBurst, bigCrack, bigShock, burst, crater, embers, fireRing, line, mistBurst, mistCloud, mistRing, plume, put, radial, rocks, slash, warnArc, warnLane, warnRing } from './f9_bosses_paint';
import type { Pr } from './f9_bosses_paint';

/** The canvas it is painted on (picture pixels), the floor point where the move began at (ax, ay). */
export const F9_FX_CANVAS = { w: 1200, h: 760, ax: 560, ay: 450 } as const;
/** How long after a move begins what it left is still to be seen (the cracks' glow dying, the dust settling). */
export const F9_FX_AFTER = 0.6;

const tiny = (a: number, b: number, s: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Where the smash and the slam land (his own lengths, from where he stood as the move began). */
export const CHIEF_LANDS = {
  smash: chiefClubHead(chiefPose('smash', CHIEF_MOVES.smash.beats[0].at)),
  slam: chiefClubHead(chiefPose('slam', CHIEF_MOVES.slam.beats[0].at)),
} as const;
/** How the slam's crack runs from where it lands: back a little, and on before him so far, in so long; how wide it strikes (his own lengths). */
export const SLAM_CRACK = { back: 8, long: 132, runs: 0.3, half: 13 } as const;
/** How far round where the smash lands it strikes (his own lengths: its ring). */
export const SMASH_RING = 34;
/** The bull rush's lane: from, to (his own lengths before him), and half its width. */
export const RUSH_LANE = { from: 10, to: RUSH_LONG + 20, half: 24 } as const;
/** The war cry's roar: how far round him it strikes and throws back (his own lengths). */
export const ROAR_RING = 70;

/** The bite's ring (its own lengths: where, how far round); the claw's arc (round where, from, to, from angle to angle, its left the way of positive); the lunge's lane; the cloud (round where, how far). */
export const BITE_RING = { f: 74, r: 20 } as const;
export const CLAW_SWEEP = { f: 22, r0: 30, r1: 78, a0: -1.1, a1: 1.2 } as const;
export const LUNGE_LANE = { from: 20, to: LUNGE_LONG + 30, half: 16 } as const;
export const CLOUD = { f: 20, r: 120, hurts: [0.95, 1.35, 1.75, 2.15] as readonly number[], thins: 2.5 } as const;
/** Where the wolves it howls for come out of the mist (its own lengths: forward, to its left), and when. */
export const HOWL_FOGS: readonly { f: number; l: number; at: number }[] = [
  { f: 50, l: 80, at: 1.2 },
  { f: 0, l: -80, at: 1.45 },
];

/** A WARNING laid on the ground, thick: two rings, dashed, the enemy's pink, pulsing. */
function warnBig(px: Px, pr: Pr, cf: number, cl: number, r: number, t: number): void {
  warnRing(px, pr, cf, cl, r, t);
  warnRing(px, pr, cf, cl, r - 3, t + 0.05);
  if (Math.floor(t * 8) % 2 === 0) warnRing(px, pr, cf, cl, r * 0.55, t);
}
function laneBig(px: Px, pr: Pr, f0: number, f1: number, l: number, half: number, t: number): void {
  warnLane(px, pr, f0, f1, l, half, t);
  warnLane(px, pr, f0, f1, l, half - 2.5, t + 0.05);
}

/** THE TROLL CHIEFTAIN'S MOVE `move`, `t` seconds in, what it does to the floor, laid on `px` (`layer`) in the frame `view` shows him in. */
export function chiefFxPaint(px: Px, layer: 'ground' | 'air', move: ChiefMove, t: number, view: F9View): void {
  const C = F9_FX_CANVAS;
  const pr: Pr = f9At(view, CK, C.ax, C.ay);
  const M = CHIEF_MOVES[move];
  const beat = M.beats[0].at;
  const since = t - beat;
  const fr = Math.floor(t * 30);
  const pose = chiefPose(move, Math.min(t, M.long));
  if (move === 'smash') {
    const [cf, cl] = CHIEF_LANDS.smash;
    if (layer === 'ground') {
      if (t > 0.4 && since < 0) warnBig(px, pr, cf, cl, SMASH_RING, t);
      crater(px, pr, cf, cl, 34, since / 0.08, (since - 0.9) / 1.0, 77, 11);
      bigShock(px, pr, cf, cl, 210, since / 0.65, 22, 9201);
      bigShock(px, pr, cf, cl, 130, (since - 0.1) / 0.6, 14, 9203);
    } else {
      const c = pr(cf, cl, 6);
      bigBurst(px, c[0], c[1], since / 0.26, 100, 9707);
      radial(px, c[0], c[1], since / 0.3, 46, 60, 520, 9708);
      rocks(px, pr, cf, cl, since, 9703, 22, 11, 130);
      plume(px, pr, cf, cl, since / 1.5, 100, 9701, 18, 40);
      if (since >= 0 && since < 1.4) embers(px, c[0], c[1], 90, 120, since, 30, 9709);
    }
  } else if (move === 'slam') {
    const [cf, cl] = CHIEF_LANDS.slam;
    const K = SLAM_CRACK;
    if (layer === 'ground') {
      if (t > 0.35 && since < 0) laneBig(px, pr, cf - K.back, cf + K.long - K.back, cl, K.half + 6, t);
      if (since >= 0) bigCrack(px, pr, cf - K.back, cl, K.long, Math.min(1, since / K.runs), (since - 0.9) / 0.9, 81, 12);
      crater(px, pr, cf, cl, 40, since / 0.08, (since - 0.9) / 0.9, 83, 12);
      bigShock(px, pr, cf, cl, 250, since / 0.7, 26, 9211);
      bigShock(px, pr, cf, cl, 160, (since - 0.12) / 0.6, 16, 9213);
    } else {
      const c = pr(cf, cl, 6);
      bigBurst(px, c[0], c[1], since / 0.3, 120, 9707);
      radial(px, c[0], c[1], since / 0.35, 60, 70, 600, 9712);
      rocks(px, pr, cf, cl, since, 9703, 28, 12, 160);
      plume(px, pr, cf, cl, since / 1.6, 130, 9701, 22, 44);
      if (since >= 0 && since < 1.4) embers(px, c[0], c[1], 110, 140, since, 34, 9709);
      // (rock flung up all along the crack as it runs)
      for (let i = 1; i <= 6; i++) {
        const ff = cf + (i * K.long) / 6.5;
        const s2 = since - ((i / 6.5) * K.runs);
        if (s2 < 0) continue;
        rocks(px, pr, ff, cl, s2, 9713 + i, 6, 8, 60);
        plume(px, pr, ff, cl, s2 / 1.1, 34, 9715 + i, 6, 24);
      }
    }
  } else if (move === 'warcry') {
    if (layer === 'ground') {
      bigShock(px, pr, 0, 0, 290, since / 0.75, 28, 9221);
      bigShock(px, pr, 0, 0, 190, (since - 0.15) / 0.7, 18, 9223);
      bigShock(px, pr, 0, 0, 115, (since - 0.3) / 0.6, 12, 9225);
      // (the ground scorched in a ring round him where the fire burst up)
      if (since > 0.2) crater(px, pr, 0, 0, 10, 1, (since - 1.5) / 1.0, 9227, 14);
    } else {
      fireRing(px, pr, 0, 0, 50, since / 1.7, fr, 16, 170);
      fireRing(px, pr, 0, 0, 100, (since - 0.12) / 1.5, fr + 3, 22, 120);
      fireRing(px, pr, 0, 0, 160, (since - 0.25) / 1.2, fr + 5, 30, 80);
      rocks(px, pr, 0, 0, since, 9229, 22, 9, 170);
      plume(px, pr, 0, 0, since / 1.2, 180, 9231, 24, 36);
      const head = pr(pose.hip[0] + 30, 0, 130);
      radial(px, head[0], head[1], since / 0.5, 50, 40, 480, 9233, FLAME[4]);
      for (const [ts, sd] of [[2.3, -1], [2.4, 1], [2.5, -1], [2.6, 1]] as const) {
        plume(px, pr, Math.max(0, pose.hip[0]) + 12, sd * 18, (t - ts) / 0.7, 28, Math.round(9931 + ts * 10), 6, 22);
        rocks(px, pr, Math.max(0, pose.hip[0]) + 12, sd * 18, t - ts, Math.round(9941 + ts * 10), 5, 7, 40);
      }
    }
  } else if (move === 'rush') {
    const L = RUSH_LANE;
    const at = Math.max(0, Math.min(RUSH_LONG, pose.hip[0]));
    if (layer === 'ground') {
      if (t > 0.3 && t < 1.15) laneBig(px, pr, L.from, L.to, 0, L.half + 4, t);
      // (the trench he tears in the ground as he runs, fading)
      if (t > 1.15) {
        const fade = Math.max(0, (t - 1.9) / 1.2);
        for (let i = 0; i < 30; i++) {
          const f0 = (i / 30) * at;
          const f1 = ((i + 1) / 30) * at;
          const w = (hash01(i, 1) - 0.5) * 6;
          if (hash01(i, 2) < fade) continue;
          line(px, pr(f0, w, 0), pr(f1, w, 0), '#140c10', 10);
          line(px, pr(f0, w + 6, 0), pr(f1, w + 6, 0), '#3a2c22', 3);
          line(px, pr(f0, w - 6, 0), pr(f1, w - 6, 0), '#5a4636', 3);
        }
      }
      bigShock(px, pr, RUSH_LONG + 10, 0, 160, since / 0.6, 12, 9241);
    } else {
      for (const ts of [0.52, 0.76]) {
        plume(px, pr, 0, -18, (t - ts) / 0.7, 30, Math.round(9941 + ts * 100), 7, 22);
        rocks(px, pr, 0, -18, t - ts, Math.round(9943 + ts * 100), 6, 7, 50);
      }
      if (t > 1.15 && t < 1.6) {
        // (clods of earth thrown off to either side of him as he runs, dust boiling up behind)
        rocks(px, pr, at, 0, (t - 1.15) * 0.7, 9945 + Math.floor(t * 20), 8, 8, 70);
        for (let i = 0; i < 7; i++) plume(px, pr, at - 20 - i * 26, (hash01(i, 3) - 0.5) * 30, 0.25 + i * 0.1, 26, 9951 + i + fr, 3, 26);
      }
      const hc = pr(RUSH_LONG - 10, 0, 50);
      bigBurst(px, hc[0], hc[1], since / 0.26, 110, 9953);
      radial(px, hc[0], hc[1], since / 0.3, 46, 60, 520, 9954);
      rocks(px, pr, RUSH_LONG + 24, 0, since, 9957, 22, 11, 130);
      plume(px, pr, RUSH_LONG + 24, 0, since / 1.3, 80, 9955, 16, 36);
    }
  }
}
const hash01 = (a: number, b: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + 9.7) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * HIS HEAVY BLOWS' LIGHT, and their flash over the whole screen (render/act1_fx/f9_bosses.ts): `t` seconds into `move`, where on the
 * canvas it shines (picture pixels), how wide, how strongly; and how white the screen is flashed (0..1).
 */
export function chiefFxGlow(move: ChiefMove, t: number, view: F9View): { x: number; y: number; r: number; a: number; flash: number } | null {
  const C = F9_FX_CANVAS;
  const pr: Pr = f9At(view, CK, C.ax, C.ay);
  const M = CHIEF_MOVES[move];
  const since = t - M.beats[0].at;
  if (since < 0 || since > 0.9) return null;
  const at = move === 'smash' ? CHIEF_LANDS.smash : move === 'slam' ? CHIEF_LANDS.slam : move === 'rush' ? [RUSH_LONG - 10, 0] : [0, 0];
  const c = pr(at[0], at[1], 20);
  const k = 1 - since / 0.9;
  return { x: c[0], y: c[1], r: 260 * (0.5 + 0.5 * k), a: 0.95 * k * k, flash: since < 0.14 ? (1 - since / 0.14) * (move === 'slam' ? 0.75 : 0.6) : 0 };
}

/**
 * THE MIST WOLF'S MOVE `move`, `t` seconds in, what it does to the floor, laid on `px` (`layer`) in the frame `view` shows it in. `hero`:
 * where the hero is (its own lengths from where it stood, forward and to its left), and which of the cloud's blows have struck him
 * (one bit each): its claws are seen in the cloud where he is.
 */
export function wolfFxPaint(px: Px, layer: 'ground' | 'air', move: WolfMove, t: number, view: F9View, hero?: { f: number; l: number; struck: number }): void {
  const C = F9_FX_CANVAS;
  const pr: Pr = f9At(view, WK, C.ax, C.ay);
  const M = WOLF_MOVES[move];
  const since = t - M.beats[0].at;
  const pose = wolfPose(move, Math.min(t, M.long));
  if (move === 'bite') {
    if (layer === 'ground') {
      if (t > 0.25 && since < 0) warnRing(px, pr, BITE_RING.f, 0, BITE_RING.r, t);
    } else {
      const at = pr(BITE_RING.f, 0, 30);
      burst(px, at[0], at[1], since / 0.18, 16, 9961);
      mistBurst(px, pr, -15, 0, (t - 0.55) / 0.5, 9963);
      mistBurst(px, pr, BITE_RING.f, 0, since / 0.5, 9965);
    }
  } else if (move === 'claw') {
    const S = CLAW_SWEEP;
    if (layer === 'ground') {
      if (t > 0.3 && since < 0) warnArc(px, pr, S.f, 0, S.r0, S.r1, S.a0, S.a1, t);
      // (the ground scored by its three claws along the sweep, glowing, fading)
      if (since >= 0) {
        for (let c = 0; c < 3; c++) {
          const pts = arcPath([CLAW_ARC.about[0], CLAW_ARC.about[1], 0], [CLAW_ARC.from[0] + 20, CLAW_ARC.from[1] + c * 6, 0], [CLAW_ARC.to[0] + 6 - c * 4, CLAW_ARC.to[1] + c * 3, 0], 16);
          for (let i = 1; i < pts.length; i++) {
            if (i / pts.length > Math.min(1, since / 0.06)) break;
            const a = pr(pts[i - 1][0], pts[i - 1][1], 0);
            const b = pr(pts[i][0], pts[i][1], 0);
            line(px, a, b, '#1e1820', 2);
            if (since < 1.0 && tiny(i, c, 9871) > since) line(px, a, b, FLAME[2], 1);
          }
        }
      }
    } else {
      const at = pr(S.f + (S.r0 + S.r1) / 2, 0, 30);
      burst(px, at[0], at[1], since / 0.2, 22, 9971);
      mistBurst(px, pr, S.f + (S.r0 + S.r1) / 2, 0, since / 0.5, 9973);
      mistBurst(px, pr, CLAW_ARC.to[0], CLAW_ARC.to[1], since / 0.6, 9977);
    }
  } else if (move === 'howl') {
    HOWL_FOGS.forEach((q, i) => {
      if (layer === 'ground') mistCloud(px, pr, q.f, q.l, 34, Math.min(1, Math.max(0, (t - 0.95 - i * 0.2) / 0.3)), t, Math.max(0, (t - q.at - 0.6) / 0.6));
      else mistBurst(px, pr, q.f, q.l, (t - q.at) / 0.6, 9983 + i);
    });
  } else if (move === 'lunge') {
    const L = LUNGE_LANE;
    if (layer === 'ground') {
      if (t > 0.35 && t < 0.72) warnLane(px, pr, L.from, L.to, 0, L.half, t);
      // (the streak of mist where it went through)
      if (t > 0.7) {
        const reach = Math.min(LUNGE_LONG, pose.root[0]);
        for (let i = 0; i < 14; i++) {
          const ff = reach - i * 13;
          if (ff < -16) break;
          mistCloud(px, pr, ff, (tiny(i, 1, 9993) - 0.5) * 10, 12, 1, t + i, Math.min(1.4, Math.max(0, (t - 0.84) * 1.6) + i * 0.05));
        }
      }
    } else {
      const mid = pr(LUNGE_LONG * 0.55, 0, 30);
      burst(px, mid[0], mid[1], since / 0.2, 18, 9997);
      mistBurst(px, pr, LUNGE_LONG, 0, (t - 0.84) / 0.6, 9999);
    }
  } else if (move === 'cloud') {
    const cf = pose.root[0] + CLOUD.f;
    if (layer === 'ground') {
      if (t > 0.3 && since < 0) warnRing(px, pr, CLOUD.f, 0, 100, t);
      const g = since < 0 ? 0 : Math.min(1, since / 0.18);
      const thin = t < CLOUD.thins ? 0 : (t - CLOUD.thins) / 0.7;
      mistCloud(px, pr, cf, 0, CLOUD.r, g, t, thin * 1.2);
    } else {
      mistRing(px, pr, cf, 0, 150, since / 0.35);
      // (its claws in the cloud where the hero is, as each of its blows strikes him; its eyes moving in it)
      if (hero) {
        const at = pr(hero.f, hero.l, 30);
        CLOUD.hurts.forEach((q, i) => {
          if (!(hero.struck & (1 << i))) return;
          slash(px, at[0] - 2, at[1] - 4, 18, (q * 3) % 6.28, ((q * 3) % 6.28) + 2.2, (t - q + 0.06) / 0.25, [MIST_PALE, FLAME[2], '#fffaf0'], 3);
          burst(px, at[0], at[1], (t - q) / 0.12, 8, 9805);
        });
      }
      if (since > 0 && t < 2.6) {
        const a = t * 2.2;
        const c = pr(cf + Math.cos(a) * 50, Math.sin(a) * 50, 50);
        put(px, c[0], c[1], FLAME[4]);
        put(px, c[0] + 4, c[1] - 1, FLAME[4]);
        put(px, c[0] + 1, c[1], FLAME[2]);
        put(px, c[0] + 5, c[1] - 1, FLAME[2]);
      }
    }
  }
}
const MIST_PALE = '#9692b2';
