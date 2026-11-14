// FLOOR 9'S SIDE BOSSES: WHAT THEIR MOVES DO TO THE FLOOR AND THROW UP FROM IT, PAINTED WHERE IT IS (render/act1_fx/f9_bosses.ts paints it
// live, at the floor point where each move began, in the frame its picture is shown in: game/act1_rules/stoker.ts FRAMES). As he saw
// them filmed (tools/f9_bosses_film.ts, docs/mockups/f9_side_bosses/README.md), each wild in its own way (his rulebook, Animations 3):
// EACH BLOW ITS OWN (his word, 14 Nov 2026: “you have the same impact art for a big front paw stomp as a minion being raised from the
// mist.  these are two completely different things.”): no burst, no shock ring shared between them.
// THE TROLL CHIEFTAIN'S is the earth and brute force: the warning laid on the ground in the enemy's pink before each blow; the smash a
//   crater, cracks, stone skipping off and dust rolling out low; the slam as he saw it and liked it; the war cry no blow but a roar,
//   its waves out of his mouth, the dust round him blown flat, the rage's fire up round him; the bull rush its uppercut's great crescent
//   and the earth sprayed on before his skid;
// THE MIST WOLF'S is mist: the bite jaws of mist snapped shut; the rakes the ground torn and mist flicked off its claws; the stomp its
//   two forepaws' prints driven into the ground and the mist splashed up out of them like water; the howl no blow, its wolves rising
//   out of a coil of mist, their eyes kindling first; the lunge one long cut through, parting, the mist torn in two; the cloud a
//   spinning funnel, grass and leaves whirled in it, its claws flashing out of it where the hero is.
// `ground` is laid under everything that stands; `air` over it. Behind F9_LAIRS, off.

import type { Px } from '../engine/px';
import { FLAME } from './mkit';
import type { F9View } from './f9_bosses_art';
import { f9At } from './f9_bosses_art';
import { CHIEF_MOVES, CLAW_ARC, LUNGE_LONG, RUSH_LONG, WOLF_MOVES, chiefClubHead, chiefPose, wolfPose } from './f9_bosses_moves';
import type { V3 } from './skeleton';
import type { ChiefMove, WolfMove } from './f9_bosses_moves';
import { CK, WK } from './f9_bosses_sculpt';
import { MISTY, bigBurst, bigCrack, bigShock, blownFlat, crater, cutThrough, dustRoll, embers, eyesIn, fangSnap, fireRing, flung, gouges, line, mistCloud, mistRise, mistSplash, pawPrint, plume, radial, roarWaves, rocks, slash, smear, warnArc, warnLane, warnRing, whirl } from './f9_bosses_paint';
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
export const CLOUD = { f: 20, r: 130, hurts: [0.95, 1.35, 1.75, 2.15] as readonly number[], thins: 2.5 } as const;
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

/**
 * THE TROLL CHIEFTAIN'S MOVE `move`, `t` seconds in, what it does to the floor, laid on `px` (`layer`) in the frame `view` shows him in.
 * As far as each goes: his word, 14 Nov 2026, of them made too much: “The slam looks great, but it being the size of the entire arena
 * is where we pull it back”: every blow as fierce, its shockwaves and what it throws reaching about a third of the camp, not all of it.
 */
export function chiefFxPaint(px: Px, layer: 'ground' | 'air', move: ChiefMove, t: number, view: F9View): void {
  const C = F9_FX_CANVAS;
  const pr: Pr = f9At(view, CK, C.ax, C.ay);
  const M = CHIEF_MOVES[move];
  const beat = M.beats[0].at;
  const since = t - beat;
  const fr = Math.floor(t * 30);
  const pose = chiefPose(move, Math.min(t, M.long));
  if (move === 'smash') {
    // (THE CLUB DRIVEN INTO THE EARTH: its crater, cracks run out from it, chips of stone skipping off low and fast, a wall of brown
    // dust rolling out over the ground, the dust then boiling up; no light but where it bit)
    const [cf, cl] = CHIEF_LANDS.smash;
    if (layer === 'ground') {
      if (t > 0.4 && since < 0) warnBig(px, pr, cf, cl, SMASH_RING, t);
      crater(px, pr, cf, cl, 30, since / 0.08, (since - 0.9) / 1.0, 77, 11);
      dustRoll(px, pr, cf, cl, 78, since / 0.9, 9201);
    } else {
      rocks(px, pr, cf, cl, since, 9703, 12, 9, 60);
      flung(px, pr, cf, cl, 0, Math.PI, since, 18, 150, 9704, 'dirt');
      plume(px, pr, cf, cl, (since - 0.15) / 1.5, 46, 9701, 12, 28);
    }
  } else if (move === 'slam') {
    const [cf, cl] = CHIEF_LANDS.slam;
    const K = SLAM_CRACK;
    if (layer === 'ground') {
      if (t > 0.35 && since < 0) laneBig(px, pr, cf - K.back, cf + K.long - K.back, cl, K.half + 6, t);
      if (since >= 0) bigCrack(px, pr, cf - K.back, cl, K.long, Math.min(1, since / K.runs), (since - 0.9) / 0.9, 81, 12);
      crater(px, pr, cf, cl, 40, since / 0.08, (since - 0.9) / 0.9, 83, 12);
      bigShock(px, pr, cf, cl, 100, since / 0.6, 18, 9211);
      bigShock(px, pr, cf, cl, 65, (since - 0.12) / 0.5, 12, 9213);
    } else {
      const c = pr(cf, cl, 6);
      bigBurst(px, c[0], c[1], since / 0.3, 75, 9707);
      radial(px, c[0], c[1], since / 0.35, 22, 50, 170, 9712);
      rocks(px, pr, cf, cl, since, 9703, 24, 11, 90);
      plume(px, pr, cf, cl, since / 1.6, 70, 9701, 18, 36);
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
    // (THE ROAR: waves of it out of his open mouth, again and again while he roars; the dust round him blown flat and out by it, pebbles
    // skittering off; the rage's fire bursting up round him; no blow, so nothing bursts)
    if (layer === 'ground') {
      blownFlat(px, pr, ROAR_RING + 20, since / 0.9, 9221);
      if (since > 0.2) crater(px, pr, 0, 0, 10, 1, (since - 1.5) / 1.0, 9227, 14);
    } else {
      fireRing(px, pr, 0, 0, 52, since / 1.4, fr, 12, 115);
      const head = pr(pose.hip[0] + 12, 0, 116);
      const ahead = pr(pose.hip[0] + 50, 0, 140);
      roarWaves(px, head[0], head[1], ahead[0] - head[0], ahead[1] - head[1], since, 0.85, 9233);
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
      // (THE UPPERCUT: the club's swing up from under, a great crescent of it; and the skid, the earth sprayed on before his feet)
      if (since >= -0.03 && since < 0.3) {
        // (a great crescent before him, from down at the ground up over his head, in the club's hand's side)
        const hf = Math.max(0, Math.min(RUSH_LONG, pose.hip[0])) + 26;
        const arc = (R: number): V3[] => Array.from({ length: 13 }, (_, i) => {
          const th = (-75 + (i / 12) * 165) * (Math.PI / 180);
          return [hf + Math.cos(th) * R, -14, 64 + Math.sin(th) * R] as V3;
        });
        const k = since < 0.05 ? Math.max(0.1, (since + 0.03) / 0.08) : 1 - (since - 0.05) / 0.25;
        smear(px, arc(78).map((v) => pr(v[0], v[1], v[2])), 0, [FLAME[2], FLAME[3], FLAME[4]], Math.max(0.05, k), arc(46).map((v) => pr(v[0], v[1], v[2])));
      }
      flung(px, pr, at + 20, 0, 0, 0.7, since, 16, 170, 9957, 'dirt');
      plume(px, pr, at + 18, 0, since / 1.3, 40, 9955, 10, 26);
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
  return { x: c[0], y: c[1], r: 190 * (0.5 + 0.5 * k), a: (move === 'warcry' ? 0.35 : 0.7) * k * k, flash: since < 0.12 && (move === 'smash' || move === 'slam') ? (1 - since / 0.12) * (move === 'slam' ? 0.35 : 0.25) : 0 };
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
  const fr = Math.floor(t * 30);
  const pose = wolfPose(move, Math.min(t, M.long));
  const CRESCENT = [MIST_PALE, FLAME[2], '#fffaf0'];
  if (move === 'bite') {
    // (THE BITE: jaws of mist snapped shut where its own jaws close, spit flung off them; where it pushed off, the ground torn up)
    if (layer === 'ground') {
      if (t > 0.2 && since < 0) warnBig(px, pr, BITE_RING.f, 0, BITE_RING.r + 6, t);
      plume(px, pr, -15, 0, (t - 0.55) / 0.9, 40, 9963, 10, 26, MISTY);
    } else {
      // (at its jaws as they close)
      const bp = wolfPose('bite', M.beats[0].at);
      const at = pr(bp.root[0] + 58, 0, 54 + bp.root[2]);
      fangSnap(px, at[0], at[1], (since + 0.08) / 0.5, 40, 9961);
    }
  } else if (move === 'claw') {
    const S = CLAW_SWEEP;
    if (layer === 'ground') {
      if (t > 0.25 && since < 0) {
        warnArc(px, pr, S.f, 0, S.r0, S.r1, S.a0, S.a1, t);
        warnArc(px, pr, S.f, 0, S.r0 + 3, S.r1 - 3, S.a0 + 0.03, S.a1 - 0.03, t + 0.05);
      }
      // (THE RAKES: the ground torn by each, the first across one way, the second back the other. THE STOMP: both forepaws driven into
      // the ground, their prints stamped deep in it and cracked out from)
      const [b0, b1, b2] = M.beats.map((b) => t - b.at);
      if (b0 >= 0) gouges(px, pr, [CLAW_ARC.about[0], CLAW_ARC.about[1], 0], [CLAW_ARC.from[0] + 24, CLAW_ARC.from[1], 0], [CLAW_ARC.to[0] + 6, CLAW_ARC.to[1], 0], 3, b0 / 0.06, (b0 - 1.0) / 0.8, 9871);
      if (b1 >= 0) gouges(px, pr, [CLAW_ARC.about[0], -CLAW_ARC.about[1], 0], [CLAW_ARC.from[0] + 24, -CLAW_ARC.from[1], 0], [CLAW_ARC.to[0] + 6, -CLAW_ARC.to[1], 0], 3, b1 / 0.06, (b1 - 1.0) / 0.8, 9873);
      for (const [pf, pl] of STOMP) pawPrint(px, pr, pf, pl, 13, 0, b2 / 0.05, (b2 - 1.1) / 0.7, 9875 + pl);
    } else {
      // (mist flicked off the claws the way each rake swept; and the stomp, the mist splashed up out of the prints like water)
      const [b0, b1, b2] = M.beats.map((b) => t - b.at);
      flung(px, pr, CLAW_ARC.to[0], CLAW_ARC.to[1], Math.atan2(CLAW_ARC.to[1] - CLAW_ARC.from[1], CLAW_ARC.to[0] - CLAW_ARC.from[0]), 0.45, b0, 9, 110, 9971, 'mist');
      flung(px, pr, CLAW_ARC.to[0], -CLAW_ARC.to[1], Math.atan2(-CLAW_ARC.to[1] + CLAW_ARC.from[1], CLAW_ARC.to[0] - CLAW_ARC.from[0]), 0.45, b1, 9, 110, 9972, 'mist');
      for (const [pf, pl] of STOMP) mistSplash(px, pr, pf, pl, b2, 52, 9973 + pl, 10);
    }
  } else if (move === 'howl') {
    // (THE HOWL: no blow. Where each of its wolves comes, mist seeps up out of the ground and coils up into a column, two eyes kindling
    // in it, and the wolf steps out of it)
    HOWL_FOGS.forEach((q, i) => {
      if (layer === 'air') mistRise(px, pr, q.f, q.l, t - q.at, 9983 + i);
    });
  } else if (move === 'lunge') {
    const L = LUNGE_LANE;
    if (layer === 'ground') {
      if (t > 0.3 && t < 0.72) laneBig(px, pr, L.from, L.to, 0, L.half + 4, t);
    } else {
      // (THROUGH: one long cut along where it went, parting; the mist it went through torn in two and pushed off either side)
      cutThrough(px, pr, L.from, LUNGE_LONG, 28, since, 9997);
    }
  } else if (move === 'cloud') {
    const cf = pose.root[0] + CLOUD.f;
    if (layer === 'ground') {
      if (t > 0.25 && since < 0) warnBig(px, pr, CLOUD.f, 0, CLOUD.r * 0.85, t);
      const g = since < 0 ? 0 : Math.min(1, since / 0.18);
      const thin = t < CLOUD.thins ? 0 : (t - CLOUD.thins) / 0.7;
      mistCloud(px, pr, cf, 0, CLOUD.r, g, t, thin * 1.2);
    } else {
      // (THE FUNNEL: grass and leaves torn up and whirled round in it, bands of mist wound round it; its claws flashing out of it where
      // the hero is, as each of its blows strikes him; its eyes, many, moving in it)
      const g = since < 0 ? 0 : Math.min(1, since / 0.3) * (t < CLOUD.thins ? 1 : Math.max(0, 1 - (t - CLOUD.thins) / 0.6));
      whirl(px, pr, cf, 0, CLOUD.r * 0.9, t, g, 9343);
      if (hero) {
        const at = pr(hero.f, hero.l, 30);
        CLOUD.hurts.forEach((q, i) => {
          if (!(hero.struck & (1 << i))) return;
          for (let c = -1; c <= 1; c++) slash(px, at[0] - 2, at[1] - 4, 30 + c * 7, (q * 3) % 6.28, ((q * 3) % 6.28) + 2.4, (t - q + 0.06) / 0.25, CRESCENT, 5);
          flung(px, pr, hero.f, hero.l, (q * 3) % 6.28, 0.6, t - q, 5, 70, 9805 + i, 'mist');
        });
      }
      if (since > 0 && t < CLOUD.thins + 0.3) eyesIn(px, pr, cf, 0, CLOUD.r * 0.8, 7, t, 9807);
      void fr;
    }
  }
}
/** Where its forepaws come down in the claw's stomp (its own lengths: forward, to its left). */
const STOMP: readonly (readonly [number, number])[] = (() => {
  const q = wolfPose('claw', WOLF_MOVES.claw.beats[2].at);
  return [[q.pawFL[0], q.pawFL[1]], [q.pawFR[0], q.pawFR[1]]];
})();

/** ITS BLOWS' LIGHT AND FLASH (as the chieftain's: chiefFxGlow), and how dark its howl and its cloud make the screen (0..1). */
export function wolfFxGlow(move: WolfMove, t: number, view: F9View): { x: number; y: number; r: number; a: number; flash: number; dark: number } | null {
  const C = F9_FX_CANVAS;
  const pr: Pr = f9At(view, WK, C.ax, C.ay);
  const M = WOLF_MOVES[move];
  const since = t - M.beats[move === 'claw' ? 2 : 0].at;
  const dark = move === 'howl' ? Math.max(0, Math.min(1, (t - 0.6) / 0.4)) * Math.max(0, Math.min(1, (M.long - t) / 0.6)) : move === 'cloud' ? Math.max(0, Math.min(1, since / 0.3)) * Math.max(0, Math.min(1, (CLOUD.thins + 0.5 - t) / 0.6)) * 0.7 : 0;
  if ((since < 0 || since > 0.8) && dark <= 0) return null;
  const f = move === 'bite' ? BITE_RING.f : move === 'claw' ? CLAW_SWEEP.f + (CLAW_SWEEP.r0 + CLAW_SWEEP.r1) / 2 : move === 'lunge' ? LUNGE_LONG * 0.5 : CLOUD.f;
  const c = pr(f, 0, 20);
  const k = since >= 0 && since <= 0.8 ? 1 - since / 0.8 : 0;
  const strong = move === 'claw' ? 0.25 : 0;
  return { x: c[0], y: c[1], r: 170 * (0.5 + 0.5 * k), a: (move === 'claw' ? 0.6 : move === 'cloud' ? 0 : 0.3) * k * k, flash: since >= 0 && since < 0.12 && move !== 'howl' ? (1 - since / 0.12) * strong : 0, dark };
}
const MIST_PALE = '#9692b2';
