// FLOOR 9'S TWO SIDE BOSSES, THEIR PICTURES AS THE GAME HOLDS A MONSTER'S (art/act1_figs/f9_bosses.ts; behind game/f9_lairs.ts
// F9_LAIRS, off until his yes to them in play). Made from their sculpts (art/f9_bosses_sculpt.ts) and their moves (art/f9_bosses_moves.ts),
// as he saw them filmed at his phone's own size and said, 14 Nov 2026: “Yes, build them in (Recommended)”.
//
// Each seen from in front and from behind (its back as the camera truly sees it: his club stays in his right hand), each facing up or
// down the screen to the right and turned over for the left (render.ts), as every monster is: its stand, its walk, its moves (THE
// TROLL CHIEFTAIN: the club smash his `attack`, the ground slam, the war cry, the bull rush; THE MIST WOLF: the bite its `attack`, the
// claw sweep, the howl, the lunge, the mist cloud), struck, and its death (his: TURNED TO STONE on one knee, roaring; its: coming apart
// into the mist it was). Each move is kept over the floor point under it, the ground it covers covered by the rules moving it
// (game/act1_rules/f9_bosses.ts), so it ends each as it stands.
//
// WHAT FOLLOWS THE FIGURE IS IN ITS PICTURES, as his rulebook asks (Movement 9, the strike two frames smeared with after-images and
// speed lines; Animations 1, a notch too high): the after-images of each strike, the club's smear, the rage's fire licking off him
// and its embers, his roar's and its howl's arcs, the mist drawn into it and streaming off it, the jaws' and claws' crescents. What
// lies on the floor or bursts up from it (the warnings, the ground broken, the bursts where blows land, the mist's clouds) is painted
// where it is: render/act1_fx/f9_bosses.ts (art/f9_bosses_fx.ts).

import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Light } from '../engine/px';
import { Px } from '../engine/px';
import { lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { FLAME } from './mkit';
import { project } from './skeleton';
import type { V3 } from './skeleton';
import { CHIEF9_CANVAS, CK, WK, WOLF9_CANVAS, sculptChief9, sculptWolf9 } from './f9_bosses_sculpt';
import type { ChiefPose, WolfPose } from './f9_bosses_sculpt';
import { CHIEF_MOVES, CHIEF_PLAY, CLAW_ARC, chiefClubHead, WOLF_MOVES, WOLF_PLAY, chiefCarry, chiefDie, chiefInPlay, chiefReel, chiefStill, chiefWalk, wolfCarry, wolfDie, wolfInPlay, wolfReel, wolfStill, wolfWalk } from './f9_bosses_moves';
import type { ChiefMove, WolfMove } from './f9_bosses_moves';
import { MIST, arcPath, arcs, embers, embersMist, ghost, put, rage, slash, smear, speedLines } from './f9_bosses_paint';
import type { Pr } from './f9_bosses_paint';

/** The two views the game shows them in: from in front, and from behind as the camera truly sees them. */
export type F9View = 'front' | 'rear';
/** Frames a second of their moves (the heroes' and the bosses': a strike two frames), and of their deaths. */
export const F9_FPS = 30;
export const F9_DIE_FPS = 20;
/** Their turn, as they are drawn: each faces screen-right, a little down (front) or up (behind), along the floor's grid. */
const YAW = 45;
/** The room round a picture for what follows it (a bull rush's after-images run far behind him), in picture pixels. */
const PAD = 210;
/** Their pools of light: the enemy's pink, dim. */
const CHIEF_AURA: Light = { x: CHIEF9_CANVAS.ax - 2, y: CHIEF9_CANVAS.ay - 70, r: 84, color: '#ff3a78', a: 0.12 };
const WOLF_AURA: Light = { x: WOLF9_CANVAS.ax, y: WOLF9_CANVAS.ay - 44, r: 70, color: '#ff3a78', a: 0.1 };

/** Where a point of a figure's ground (its own lengths) is on its canvas, seen `view`, it grown `k`. */
export function f9At(view: F9View, k: number, ax: number, ay: number): Pr {
  return (f, l, u) => {
    const p = project([f * k, l * k, u * k], view);
    return [ax + p[0], ay + p[1]];
  };
}
/** How far on the picture a step of `d` (its own lengths) along its forward is. */
const stepOf = (view: F9View, k: number, d: number): [number, number] => {
  const p = project([d * k, 0, 0], view);
  return [p[0], p[1]];
};
/** The way forward on the picture (a unit). */
const fwdOf = (view: F9View): [number, number] => {
  const p = stepOf(view, 1, 1);
  const n = Math.hypot(p[0], p[1]) || 1;
  return [p[0] / n, p[1] / n];
};

/** A figure laid on a picture, its (0, 0) at (ox, oy). */
function lay(px: Px, fig: Px, ox: number, oy: number): void {
  for (let y = 0; y < fig.h; y++) {
    for (let x = 0; x < fig.w; x++) {
      const i = (y * fig.w + x) * 4;
      if (fig.d[i + 3] === 0) continue;
      const X = ox + x;
      const Y = oy + y;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      px.d.set(fig.d.subarray(i, i + 4), (Y * px.w + X) * 4);
    }
  }
}

/** A picture with room round it for what follows the figure. */
const roomy = (c: { w: number; h: number }): Px => new Px(c.w + PAD * 2, c.h + PAD * 2);

/**
 * THE PICTURES OF A MOVE'S STRIKE BEFORE THIS ONE, for its after-images: kept a moment, by name, so that each frame's after-images are
 * the frames before it (not painted again). Only those inside a strike are kept.
 */
const KEPT = new Map<string, Px>();
const KEEP_MOST = 48;
function kept(key: string, make: () => Px): Px {
  let p = KEPT.get(key);
  if (p) return p;
  p = make();
  if (KEPT.size >= KEEP_MOST) KEPT.delete(KEPT.keys().next().value as string);
  KEPT.set(key, p);
  return p;
}

// =================================================================================================
// THE TROLL CHIEFTAIN

/** Him at a pose, painted on his canvas. */
function chiefPx(view: F9View, pose: ChiefPose): Px {
  return sculptChief9(view, pose, YAW, CHIEF9_CANVAS).px;
}

/** HIM, frame `i` of `move` (F9_FPS), seen `view`: kept over his floor point, with what follows him. */
export function chiefMovePainted(view: F9View, move: ChiefMove, i: number): Painted & { ax: number; ay: number } {
  const C = CHIEF9_CANVAS;
  const M = CHIEF_MOVES[move];
  const t = i / F9_FPS;
  const pose = chiefInPlay(move, t);
  const body = chiefPx(view, pose);
  const out = roomy(C);
  const pr = f9At(view, CK, C.ax + PAD, C.ay + PAD);
  const lights: Light[] = [];
  const carry = chiefCarry(move, t);
  // (UNDER HIM: his after-images through each strike, the frames before this one, left where he was: the rush's run far behind him)
  const strike = M.strikes.find(([a, b]) => t >= a && t <= b + 0.1);
  if (strike) {
    const [a, b] = strike;
    const n = move === 'rush' || (move === 'warcry' && a > 2) ? 5 : 2;
    const fade = t > b ? 1 - (t - b) / 0.1 : 1;
    for (let k = n; k >= 1; k--) {
      const q = Math.max(a - 0.05, Math.min(t, b) - (k * (b - a)) / n);
      const j = Math.max(0, Math.min(i - 1, Math.round(q * F9_FPS)));
      if (j >= i) continue;
      const g = kept(`chief:${view}:${move}:${j}`, () => chiefPx(view, chiefInPlay(move, j / F9_FPS)));
      const [dx, dy] = stepOf(view, CK, chiefCarry(move, j / F9_FPS) - carry);
      ghost(out, g, FLAME, (1 - k / (n + 1)) * fade, 9800 + k, Math.round(PAD + dx), Math.round(PAD + dy));
    }
  }
  lay(out, body, PAD, PAD);
  // (OVER HIM)
  const fr = i;
  if (strike && (move === 'smash' || move === 'slam' || (move === 'warcry' && strike[0] < 2))) {
    // (the club's smear, from where the strike began to where it is)
    const [a, b] = strike;
    const p0 = chiefInPlay(move, a);
    const p1 = chiefInPlay(move, Math.min(t, b));
    const piv: V3 = [p1.hip[0], p1.hip[1] - 12, p1.hip[2] + 76];
    const mid = (q: ChiefPose): V3 => {
      const h = chiefClubHead(q);
      return [(h[0] + q.fistR[0] + q.hip[0]) / 2, (h[1] + q.fistR[1] + q.hip[1]) / 2, (h[2] + q.fistR[2] + q.hip[2]) / 2];
    };
    const outer = arcPath(piv, chiefClubHead(p0), chiefClubHead(p1), 14).map((q) => pr(q[0], q[1], q[2]));
    const inner = arcPath(piv, mid(p0), mid(p1), 14).map((q) => pr(q[0], q[1], q[2]));
    smear(out, outer, 22, FLAME, t > b ? 1 - (t - b) / 0.1 : 1, inner);
  }
  const [ux, uy] = fwdOf(view);
  const hip = pr(pose.hip[0], pose.hip[1], 0);
  if (move === 'warcry') {
    const head = pr(pose.hip[0] + 30, 0, 118);
    const feet = pr(pose.hip[0], 0, 0);
    // (gathering it in: embers drawn in to him)
    if (t > 0.3 && t < 0.97) for (let k = 0; k < 18; k++) {
      const ph = ((t - 0.3) * 1.6 + hashOf(k, 1, 9921)) % 1;
      const an = hashOf(k, 2, 9921) * Math.PI * 2;
      const r = 80 * (1 - ph);
      put(out, feet[0] + Math.cos(an) * r, feet[1] - 50 + Math.sin(an) * r * 0.6, ph > 0.6 ? FLAME[4] : FLAME[2]);
    }
    const since = t - M.beats[0].at;
    // (the roar: its arcs; and THE RAGE on him, its fire licking off him, its embers rising)
    if (since > 0 && since < 0.95) arcs(out, head[0], head[1], since / 0.95, -Math.PI / 2, 1.5, 4, FLAME);
    if (since > 0.6 && since < 1.6) arcs(out, head[0], head[1], (since - 0.6) / 1.0, -Math.PI / 2, 1.5, 3, FLAME);
    if (since > 0) {
      rage(out, body, fr, Math.min(1, since / 0.2), PAD, PAD);
      embers(out, feet[0], feet[1], 70, 150, t, 26, 9925);
      lights.push({ x: feet[0] - PAD, y: feet[1] - PAD - 60, r: 70, color: FLAME[3], a: 0.22 });
    }
    if (t > 2.2 && t < 2.7) speedLines(out, hip[0], hip[1] - 60, ux, uy, 10, 40, 9933 + fr, FLAME[2]);
  }
  if (move === 'rush') {
    // (breath steaming off his snout as he paws; the charge's speed lines)
    if (t > 0.3 && t < 1.15) {
      const sn = pr(pose.hip[0] + 40, 0, 72);
      for (let k = 0; k < 8; k++) {
        const ph = (t * 2 + hashOf(k, 1, 9945)) % 1;
        put(out, sn[0] + ph * 14 * ux * 1.4 + (hashOf(k, 2, 9945) - 0.5) * 6, sn[1] - ph * 8, ph < 0.5 ? '#d8d4e0' : '#9a96a8');
      }
    }
    if (t > 1.15 && t < 1.5) speedLines(out, hip[0], hip[1] - 50, ux, uy, 16, 50, 9947 + fr, '#d8d0c0');
  }
  void WK;
  return { px: out, lights, ax: C.ax + PAD, ay: C.ay + PAD };
}

/** A tiny hash (the paint's own). */
function hashOf(a: number, b: number, s: number): number {
  const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

/** HIS PICTURES SEEN ONE WAY: his stand, his walk, his four moves, struck, his death. */
function chiefSet(view: F9View): AnimSet {
  const C = CHIEF9_CANVAS;
  const plain = (pose: ChiefPose, aura: Light | null = CHIEF_AURA) => toSprite({ px: chiefPx(view, pose), lights: [] }, aura, C.ax, C.ay);
  const I = CHIEF_PLAY.idle;
  const Wk = CHIEF_PLAY.walk;
  const idle = lazyFrames(I.frames, (i) => plain(chiefStill(i / I.fps)));
  const walk = lazyFrames(Wk.frames, (i) => plain(chiefWalk(i / Wk.fps)));
  const moveClip = (move: ChiefMove): Clip => {
    const M = CHIEF_MOVES[move];
    const n = Math.round(M.long * F9_FPS) + 1;
    return { frames: lazyFrames(n, (i) => {
      const f = chiefMovePainted(view, move, i);
      return toSprite(f, CHIEF_AURA, f.ax, f.ay);
    }), fps: F9_FPS, hit: M.beats[0].at };
  };
  const smash = moveClip('smash');
  const rn = Math.round(CHIEF_PLAY.reel * F9_FPS) + 1;
  const reel: Clip = { frames: lazyFrames(rn, (i) => plain(chiefReel(i / F9_FPS))), fps: F9_FPS };
  const dn = Math.round(CHIEF_PLAY.dies * F9_DIE_FPS) + 1;
  const die: Clip = { frames: lazyFrames(dn, (i) => plain(chiefDie(i / F9_DIE_FPS), null)), fps: F9_DIE_FPS };
  const hitAt = Math.round(CHIEF_MOVES.smash.beats[0].at * F9_FPS);
  return {
    idle,
    walk,
    attack: lazyFrames(3, (i) => smash.frames[[Math.round(hitAt * 0.7), hitAt + 1, Math.round((hitAt + smash.frames.length) / 2)][i]]),
    idleFps: I.fps,
    walkFps: Wk.fps,
    clips: { attack: smash, die, reel, moves: { slam: moveClip('slam'), warcry: moveClip('warcry'), rush: moveClip('rush') } },
  };
}

/** THE TROLL CHIEFTAIN'S PICTURES, as the game holds a monster's. */
export function makeWarchiefArt(): ActorArt {
  return { front: chiefSet('front'), back: chiefSet('rear') };
}

// =================================================================================================
// THE MIST WOLF

function wolfPx(view: F9View, pose: WolfPose): Px {
  return sculptWolf9(view, pose, YAW, WOLF9_CANVAS).px;
}

/** IT, frame `i` of `move` (F9_FPS), seen `view`: kept over its floor point, with what follows it. */
export function wolfMovePainted(view: F9View, move: WolfMove, i: number): Painted & { ax: number; ay: number } {
  const C = WOLF9_CANVAS;
  const M = WOLF_MOVES[move];
  const t = i / F9_FPS;
  const pose = wolfInPlay(move, t);
  const body = wolfPx(view, pose);
  const out = roomy(C);
  const pr = f9At(view, WK, C.ax + PAD, C.ay + PAD);
  const carry = wolfCarry(move, t);
  // (UNDER IT: its after-images through each strike, but its howl's and its cloud's)
  const strike = M.strikes.find(([a, b]) => t >= a && t <= b + 0.1);
  if (strike && move !== 'howl' && move !== 'cloud') {
    const [a, b] = strike;
    const n = 4;
    const fade = t > b ? 1 - (t - b) / 0.1 : 1;
    for (let k = n; k >= 1; k--) {
      const q = Math.max(a - 0.04, Math.min(t, b) - (k * (b - a)) / n);
      const j = Math.max(0, Math.min(i - 1, Math.round(q * F9_FPS)));
      if (j >= i) continue;
      const g = kept(`wolf:${view}:${move}:${j}`, () => wolfPx(view, { ...wolfInPlay(move, j / F9_FPS), ghost: 0 }));
      const [dx, dy] = stepOf(view, WK, wolfCarry(move, j / F9_FPS) - carry);
      ghost(out, g, MIST, (1 - k / (n + 1)) * fade, 9810 + k, Math.round(PAD + dx), Math.round(PAD + dy));
    }
  }
  lay(out, body, PAD, PAD);
  // (OVER IT)
  const fr = i;
  const [ux, uy] = fwdOf(view);
  const root = pr(pose.root[0], pose.root[1], 0);
  const muzzle = pr(pose.root[0] + 72, 0, 74 + pose.root[2]);
  const since = t - M.beats[0].at;
  const CRESCENT = [MIST[2], FLAME[2], '#fffaf0'];
  if (move === 'bite') {
    // (the jaws' crescents closing on what it bites, huge; its speed)
    const at = pr(74 - carry, 0, 30);
    if (t > 0.58) {
      slash(out, at[0] - 4, at[1] + 4, 22, -2.6, -0.4, (t - 0.58) / 0.2, CRESCENT, 4);
      slash(out, at[0] - 4, at[1] - 2, 22, 2.6, 0.4, (t - 0.6) / 0.2, CRESCENT, 4);
    }
    if (strike) speedLines(out, muzzle[0], muzzle[1], ux, uy, 12, 20, 9967 + fr, MIST[4]);
  }
  if (move === 'claw') {
    // (three great claw crescents along the sweep, round from above its shoulder: white at the heart, edged with its pink)
    const [s0, s1] = M.strikes[0];
    const at = pr(76 - carry, 0, 30);
    if (t >= s0 && since < 0.25) {
      const sp = pr(CLAW_ARC.about[0] - carry, CLAW_ARC.about[1], CLAW_ARC.about[2]);
      const dx = at[0] - sp[0];
      const dy = at[1] - sp[1];
      const r = Math.hypot(dx, dy);
      const ah = Math.atan2(dy, dx);
      const k = since < 0 ? ((t - s0) / (s1 - s0)) * 0.5 : 0.5 + since / 0.5;
      for (let c = -1; c <= 1; c++) slash(out, sp[0], sp[1], r + c * 7, ah - 1.7, ah + 1.0, k, CRESCENT, 6);
    }
    // (the mist streaming up off it as it rears)
    if (t > 0.2 && t < 0.62) embersMist(out, root[0] + 10, root[1] - 40, 70, 110, t, 26, 9975);
    if (t >= s0 && t <= s1 + 0.05) speedLines(out, at[0], at[1], -ux, uy * 0.3, 16, 30, 9979 + fr, MIST[4]);
  }
  if (move === 'howl') {
    const head = pr(pose.root[0] + 40, 0, 112);
    if (t > 0.88 && t < 2.4) {
      arcs(out, head[0], head[1], ((t - 0.88) % 0.5) / 0.5, -Math.PI / 2 - 0.25, 1.4, 3, [MIST[2], MIST[3], MIST[4]]);
      arcs(out, head[0], head[1], ((t - 0.63) % 0.5) / 0.5, -Math.PI / 2 - 0.25, 1.4, 3, [MIST[2], MIST[3], FLAME[2]]);
    }
    if (t > 0.9 && t < 2.3) embersMist(out, root[0], root[1], 120, 40, t, 20, 9985);
  }
  if (move === 'lunge') {
    // (the mist drawn into it as it gathers; its speed as it goes through)
    if (t > 0.35 && t < 0.7) for (let k = 0; k < 20; k++) {
      const ph = ((t - 0.35) * 2.2 + hashOf(k, 1, 9991)) % 1;
      const an = hashOf(k, 2, 9991) * Math.PI * 2;
      const r = 60 * (1 - ph);
      put(out, root[0] + Math.cos(an) * r, root[1] - 26 + Math.sin(an) * r * 0.6, ph > 0.6 ? MIST[4] : MIST[3]);
    }
    if (strike) speedLines(out, root[0], root[1] - 30, ux, uy, 18, 26, 9995 + fr, MIST[4]);
  }
  if (move === 'cloud' && t > 0.2 && t < 0.66) {
    // (the mist drawn in to it before it blasts it out)
    for (let k = 0; k < 24; k++) {
      const ph = ((t - 0.2) * 2.4 + hashOf(k, 1, 9801)) % 1;
      const an = hashOf(k, 2, 9801) * Math.PI * 2;
      const r = 90 * (1 - ph);
      put(out, muzzle[0] + Math.cos(an) * r, muzzle[1] + Math.sin(an) * r * 0.6, ph > 0.6 ? MIST[4] : MIST[3]);
    }
  }
  return { px: out, lights: [], ax: C.ax + PAD, ay: C.ay + PAD };
}

/** ITS PICTURES SEEN ONE WAY: its stand, its walk, its five moves, struck, its death. */
function wolfSet(view: F9View): AnimSet {
  const C = WOLF9_CANVAS;
  const plain = (pose: WolfPose, aura: Light | null = WOLF_AURA) => toSprite({ px: wolfPx(view, pose), lights: [] }, aura, C.ax, C.ay);
  const I = WOLF_PLAY.idle;
  const Wk = WOLF_PLAY.walk;
  const idle = lazyFrames(I.frames, (i) => plain(wolfStill(i / I.fps)));
  const walk = lazyFrames(Wk.frames, (i) => plain(wolfWalk(i / Wk.fps)));
  const moveClip = (move: WolfMove): Clip => {
    const M = WOLF_MOVES[move];
    const n = Math.round(M.long * F9_FPS) + 1;
    return { frames: lazyFrames(n, (i) => {
      const f = wolfMovePainted(view, move, i);
      return toSprite(f, WOLF_AURA, f.ax, f.ay);
    }), fps: F9_FPS, hit: M.beats[0].at };
  };
  const bite = moveClip('bite');
  const rn = Math.round(WOLF_PLAY.reel * F9_FPS) + 1;
  const reel: Clip = { frames: lazyFrames(rn, (i) => plain(wolfReel(i / F9_FPS))), fps: F9_FPS };
  const dn = Math.round(WOLF_PLAY.dies * F9_DIE_FPS) + 1;
  const die: Clip = { frames: lazyFrames(dn, (i) => plain(wolfDie(i / F9_DIE_FPS), null)), fps: F9_DIE_FPS };
  const hitAt = Math.round(WOLF_MOVES.bite.beats[0].at * F9_FPS);
  return {
    idle,
    walk,
    attack: lazyFrames(3, (i) => bite.frames[[Math.round(hitAt * 0.7), hitAt + 1, Math.round((hitAt + bite.frames.length) / 2)][i]]),
    idleFps: I.fps,
    walkFps: Wk.fps,
    clips: { attack: bite, die, reel, moves: { claw: moveClip('claw'), howl: moveClip('howl'), lunge: moveClip('lunge'), cloud: moveClip('cloud') } },
  };
}

/** THE MIST WOLF'S PICTURES, as the game holds a monster's. */
export function makeMistWolfArt(): ActorArt {
  return { front: wolfSet('front'), back: wolfSet('rear') };
}
