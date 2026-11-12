// WHAT THE LIVING SHADOW'S CLAWS LEAVE IN THE AIR (the Warlock chat, 11 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Its wide slash (dev/shadow_moves.ts slashMove; his word, 11 Nov, “really wide slashes with his claws”): the strike is a
// flash (his rulebook's Movement 9, big wind-up, lightning strike), so what is seen of it is what it leaves, as the game's
// demon's rake leaves it (dev/demon_fx.ts rakeLight; his word of the first rakes, 27 Oct, “Hard to see the swipe,The swing
// should come wide out to across the body.  The cyan streaks should follow the claws”): FOUR STREAKS OF HIS CYAN LIGHT, one
// off each talon, along the way it truly went, all the way round from behind its shoulder to past its other side, their
// heads on the talons' tips; the air between them lit for the two frames of the swing (a smear, not a shape); burning out
// from their tails once it has landed. What it does to the one it hits (the burst, the gashes, the curse) is the game's
// rake's own and is not drawn again here.

import { project, solve } from '../art/skeleton';
import type { Posed, V3 } from '../art/skeleton';
import { CYAN } from '../art/kit';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { Sculpt } from './sculpt';
import { RIG_CANVAS } from './sculpt_demon_rig';
import { DAMN_HIT, DM, FR, RK, SS, SWIPE_REACH } from './demon_moves';
import type { DemonMove } from './demon_moves';
import { DAMN_SCENE, chunk, crackStar, drawCrack, drawHole, embers, flung, inScene, jet, laid, nearEye } from './demon_fx';
import { smokeStepLight, swipeNear, swipeTo } from './demon_swipe_fx';
import { crumble } from './demon_return';
import { WOLF_B, claws } from './demon_new';
import type { Built, Kit } from './demon_new';
import { HELL } from './sculpt_warlock';
import { Light, burst, dissolve, smolder } from './warlock_fx';
import { drawWarlockAt } from './warlock_moves';
import type { WarlockMove } from './warlock_moves';
import { BACK_LONG, warlockSpells } from './warlock_spells';
import { DAMN_DIG, STEP_SLAM, drawShadowAt, shadowMoving, shadowPose } from './shadow_moves';
import type { ShadowMove } from './shadow_moves';

/** How long a streak burns after the strike. */
export const STREAK_LIFE = 0.3;
/** How finely its talons' way is followed through the swing: samples to a frame. */
const STEPS = 10;

/** Where a point of it (its own space, turned `turn` on the spot) is on its picture (RIG_CANVAS). */
function onScene(p: V3, view: GameView, turn: number, scene: Scene): [number, number] {
  const a = (turn * Math.PI) / 180;
  const q: V3 = [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const s = project(q, view === 'back' ? 'rear' : view);
  return [scene.ax + s[0], scene.ay + s[1]];
}
/** A picture's size and where the demon's floor point is on it. */
export interface Scene {
  w: number;
  h: number;
  ax: number;
  ay: number;
}
/** Room for the whole of a slash's streaks round it (they go wider than its own picture, RIG_CANVAS: the game lays its rakes' light over the floor, not on the demon's picture). */
export const SLASH_SCENE: Scene = { w: RIG_CANVAS.w + 160, h: RIG_CANVAS.h + 100, ax: RIG_CANVAS.ax + 80, ay: RIG_CANVAS.ay + 50 };

/** Its slashing claw's four talon tips at a moment (its own space, unturned): the claw built as the picture builds it, not drawn. */
export function slashTips(m: ShadowMove, t: number): V3[] {
  if (!m.slash) return [];
  const pose = shadowPose(m, t);
  const { more } = shadowMoving(m, t, pose);
  const sc = new Sculpt();
  const s = solve(WOLF_B, pose as Posed);
  const k: Kit = { sc, s, far: () => false, tail: 0, paws: false, palm: more.palm, grip: more.grip };
  const mat = sc.mat({ ramp: CYAN });
  const out: Built = { floor: [], flames: [], smoke: [], jaw: s.head };
  claws(k, mat, mat, 1.15, out);
  return out.tips?.find((c) => c.side === m.slash?.side)?.at ?? [];
}

const PATHS = new Map<ShadowMove, { t: number; tips: V3[] }[]>();
/** Each moment of the swing, from where it held to where it landed, and where its talons' tips were then. */
function pathOf(m: ShadowMove): { t: number; tips: V3[] }[] {
  let p = PATHS.get(m);
  if (!p) {
    p = [];
    for (let f = RK.held * STEPS; f <= RK.hit * STEPS; f++) {
      const t = (f / STEPS) * FR;
      const tips = slashTips(m, t);
      if (tips.length === 4) p.push({ t, tips });
    }
    PATHS.set(m, p);
  }
  return p;
}

/** The slash's light at a moment of it, on a picture of its own (`scene`), clear but for it: laid over the demon's picture, floor point on floor point. */
export function slashLight(m: ShadowMove, t: number, view: GameView, turn = 0, scene: Scene = SLASH_SCENE): Px {
  const out = new Px(scene.w, scene.h);
  const onRig = (p: V3, v: GameView, tn: number): [number, number] => onScene(p, v, tn, scene);
  if (!m.slash || m.hit === undefined) return out;
  const hit = m.hit;
  const held = RK.held * FR;
  if (t <= held || t >= hit + STREAK_LIFE) return out;
  const l = new Light();
  const path = pathOf(m).filter((p) => p.t <= t + 1e-6);
  const n = path.length;
  if (n < 2) return out;
  const gone = Math.max(0, (t - hit) / STREAK_LIFE);
  const line = (x0: number, y0: number, x1: number, y1: number, heat: number, fat: boolean): void => {
    const len = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let j = 0; j <= len; j++) {
      const x = x0 + ((x1 - x0) * j) / len;
      const y = y0 + ((y1 - y0) * j) / len;
      l.put(x, y, heat);
      l.put(x + 1, y, Math.max(0, heat - 1));
      l.put(x, y + 1, Math.max(0, heat - 1));
      if (fat) {
        l.put(x - 1, y, Math.max(0, heat - 1));
        l.put(x, y - 1, Math.max(0, heat - 1));
      }
    }
  };
  // THE AIR BETWEEN THEM, LIT: only while it swings and for a frame after it lands (the smear of the strike), the last of
  // the way it went
  if (t < hit + 1.5 * FR) {
    for (let i = Math.max(1, Math.floor(n * 0.45)); i < n; i++) {
      const a0 = onRig(path[i - 1].tips[0], view, turn);
      const b0 = onRig(path[i - 1].tips[3], view, turn);
      const a1 = onRig(path[i].tips[0], view, turn);
      const b1 = onRig(path[i].tips[3], view, turn);
      for (let q = 0; q <= 6; q++) {
        const u = q / 6;
        line(a0[0] + (b0[0] - a0[0]) * u, a0[1] + (b0[1] - a0[1]) * u, a1[0] + (b1[0] - a1[0]) * u, a1[1] + (b1[1] - a1[1]) * u, 0, false);
      }
    }
  }
  // THE STREAKS, one off each talon: hottest at the head, cooler behind; the tail burning out first
  for (let k = 0; k < 4; k++) {
    const pts = path.map((p) => onRig(p.tips[k], view, turn));
    for (let i = 1; i < n; i++) {
      const back = (n - 1 - i) / Math.max(1, n - 1);
      if (back > 1 - gone) continue;
      const heat = back < 0.22 && gone < 0.4 ? 3 : back < 0.5 ? 2 : back < 0.85 ? 1 : 0;
      line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], heat, back < 0.5 && gone < 0.5);
    }
  }
  l.lay(out, HELL);
  return out;
}

// =====================================================================================================================
// ITS OTHER MOVES' PICTURES, WHOLE (dev/shadow_moves.ts shadowOthers; the Warlock chat of the night of 11 Nov 2026). Each
// of these moves is the game's own with the Living Shadow making it up on two legs, so what the move does to the floor
// and to the air is the game's own too, only laid where THIS body's claws are: Damning's light at its claws
// (clawsLight: dev/demon_fx.ts damningLight's own, its claws' part, of that file's own pieces; that file, which the game
// takes pieces from, is not touched); the smoke step's (dev/demon_swipe_fx.ts smokeStepLight, given `own`: a mock-up
// file nothing of the game takes from); dev/demon_return.ts crumble; and dev/warlock_fx.ts dissolve, as the man goes into
// smoke. What they do to the ones they strike is the game's own and is not drawn again here. Each on the slash's scene
// (SLASH_SCENE), its floor point where it always is.

/** One picture laid on another, so far across and down it (as it is, its edge of light too). */
function over(on: Px, top: Px, dx = 0, dy = 0): void {
  for (let y = 0; y < top.h; y++) {
    for (let x = 0; x < top.w; x++) {
      const i = (y * top.w + x) * 4;
      if (!top.d[i + 3] || !on.inside(x + dx, y + dy)) continue;
      const j = ((y + dy) * on.w + x + dx) * 4;
      for (let c = 0; c < 4; c++) on.d[j + c] = top.d[i + c];
    }
  }
}
/** A move of its as the game's demon's effects ask for one (they read only where it has gone and how far it is smoke). */
const asDemon = (m: ShadowMove): DemonMove => ({
  name: m.name,
  motion: m.motion,
  long: m.long,
  loops: m.loops,
  wings: () => ({ spread: 1, beat: 0, sweep: 0, tip: 0, flex: 0, wind: 0, phase: 0 }),
  along: m.along,
  gone: m.gone,
});
/** Where its picture goes on the slash's scene. */
const MINE = { dx: SLASH_SCENE.ax - RIG_CANVAS.ax, dy: SLASH_SCENE.ay - RIG_CANVAS.ay };

/**
 * Its own picture at a moment of a move; and PAST THE MOVE'S END (a film goes on a moment after it, so that what the move
 * left on the floor is seen to cool where it lies and does not vanish as the move ends) the move it is in then (`after`: its
 * stand), so long into it.
 */
function mineAt(m: ShadowMove, t: number, view: GameView, turn: number, after?: ShadowMove): Px {
  return t > m.long && after ? drawShadowAt(view, after, t - m.long, turn).px : drawShadowAt(view, m, Math.min(t, m.long), turn).px;
}

/** Where its claws bite into the floor in Damning (its own measure): under each palm (as dev/demon_fx.ts digSpots, for the demon's). */
export const SHADOW_DIGS: V3[] = [[DAMN_DIG[0] + 4, DAMN_DIG[1], 0], [DAMN_DIG[0] + 4, -DAMN_DIG[1], 0]];
const hash = (i: number): number => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};
/**
 * DAMNING'S LIGHT AT ITS CLAWS at a moment `t` of the move, for claws that bite into the floor at `digs` (its own measure):
 * what is on the floor (the cracks round them, run out as they bite and further as it heaves, as hot as its fire is built
 * up; the holes it tears; what has fallen and lies there) and what is at its claws (chips kicked up as they drive in; as
 * it rips them up, stone flung up and his fire bursting out of the holes, dying down, a little smoke out of them as they
 * cool), and how near the eye that is. THE GAME'S DEMON'S OWN (dev/demon_fx.ts damningLight, the part of it that is its
 * claws', number for number, of that file's own pieces): for the demon's own claws it is the same picture, pixel for pixel
 * (tests/shadow_moves.test.ts). On a scene round its picture (dev/demon_fx.ts DAMN_SCENE). Nothing of the ones it damns.
 */
export function clawsLight(digs: readonly V3[], t: number, view: GameView, turn = 0): { floor: Px; claws: Px; clawsNear: number } {
  const W = DAMN_SCENE.w;
  const H = DAMN_SCENE.h;
  const f = Math.round(((t - DAMN_HIT) / FR) * 1000) / 1000;
  const fm = t / FR;
  const S = (p: V3): [number, number] => inScene(p, view, turn);
  const fd = new Light();
  const fl = new Light();
  const dug = fm - DM.dig;
  const strain = Math.max(0, Math.min(1, (fm - DM.strain) / (DM.held - DM.strain)));
  const runOut = dug < 0 ? 0 : 0.35 * (1 - Math.pow(1 - Math.min(1, dug / 2), 2)) + 0.65 * (1 - Math.pow(1 - strain, 2));
  const clawHeat =
    dug < 0 ? -1
    : dug < 1 ? 3
    : f < 0 ? 1.5 + 1.3 * strain + 0.35 * Math.sin(fm * 1.7) * strain
    : f < 2 ? 3.4
    : 3 - (f - 2) / 6;
  digs.forEach((d, c) => {
    const stars = crackStar(d[0], d[1], 7, 40, 3, 40 + c * 17);
    for (const k of stars) drawCrack(fd, fl, k, runOut, clawHeat, S);
    if (f >= 0) drawHole(fd, fl, d[0] + 1, d[1], 7, f < 3 ? 3.4 : 3 - (f - 3) / 7, 70 + c, S);
    if (f < 0 && dug > 2) embers(fl, stars.slice(0, 6).map((k) => S([...k.pts[Math.floor(k.pts.length * 0.5)], 0] as V3)), t, 0.3 + 0.7 * strain, 90 + c);
  });
  const cl = new Light();
  const cs = new Light();
  const csm = new Light();
  digs.forEach((d, c) => {
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2 + hash(c * 9 + j);
      const v: V3 = [Math.cos(a) * (0.5 + 0.5 * hash(j + c)), Math.sin(a) * (0.5 + 0.5 * hash(j * 3 + c)), 2.6 + 1.6 * hash(j * 5 + c)];
      if (dug < 0) break;
      const fly = flung([d[0], d[1], 1], v, dug);
      const [x, y] = S(fly.at);
      chunk(fly.landed ? fd : cs, cl, x, y, 1.2, j + c, 500 + c * 10 + j, 0);
    }
    if (f < 0) return;
    const [hx, hy] = S([d[0] + 1, d[1], 0]);
    const size = f < 1 ? 4 : f < 4 ? 6 : Math.max(0, 6 - (f - 4) * 0.36);
    jet(cl, hx, hy - 1, size, t * 1.5 + c, 0, hy + 3);
    for (let k = 0; k < 9; k++) {
      const age = f - k * 0.6;
      const life = 7 + 4 * hash(c * 41 + k);
      if (age < 0 || age > life) continue;
      const rise = (7 + 3 * hash(c * 43 + k)) * age - 0.3 * age * age;
      const sz = (4 + 1.5 * hash(c * 47 + k)) * Math.min(1, (1 - age / life) * 1.6);
      jet(cl, hx + (k % 2 ? 1 : -1) * (2 + 6 * hash(c * 53 + k)), hy - 4 - rise, sz, t * 2 + k * 0.41 + c, 0, H);
    }
    if (f < 4) burst(cl, hx, hy - 8, 5 + f * 6, f / 4, 60 + c);
    if (f > 10) embers(cl, [[hx - 2, hy - 2], [hx + 2, hy - 1], [hx, hy - 3]], t, Math.max(0, 1 - (f - 10) / 30), 120 + c);
    for (let j = 0; j < 7; j++) {
      const a = (hash(c * 31 + j) - 0.5) * 3.6;
      const sp = 0.6 + 1.3 * hash(c * 7 + j * 3);
      const v: V3 = [Math.cos(a) * sp, Math.sin(a) * sp + (c ? -0.3 : 0.3), 5.5 + 4.5 * hash(c * 5 + j * 11)];
      const fly = flung([d[0] + 1, d[1], 2], v, f);
      const [x, y] = S(fly.at);
      const r = 2 + 2 * hash(c * 13 + j);
      chunk(fly.landed ? fd : cs, cl, x, y, r, fly.landed ? j : j + f * (0.25 + 0.3 * hash(j)), 600 + c * 10 + j, fly.landed ? 0 : 3 - f / 7);
    }
    if (f > 8) smolder(cl, csm, hx, hy + 2, 10, 4, t, Math.max(0, Math.min(1, (f - 8) / 6) * Math.min(1, 1 - (f - 30) / 40)), 7 + c);
  });
  const near = digs.map((d) => nearEye(d, view, turn));
  return { floor: laid(W, H, new Light(), fd, fl), claws: laid(W, H, csm, cs, cl), clawsNear: near.reduce((a, b) => a + b, 0) / near.length };
}
/**
 * DAMNING, UP ON TWO LEGS, WHOLE at a moment: the floor cracked round its claws as they bite, the cracks running further
 * and glowing hotter as it heaves; the floor torn up with them, stone flung up, his fire bursting out of the holes; it
 * itself; laid in the order the eye sees them.
 */
export function damningScene(m: ShadowMove, t: number, view: GameView, turn = 0, after?: ShadowMove): Px {
  const out = new Px(SLASH_SCENE.w, SLASH_SCENE.h);
  const dx = SLASH_SCENE.ax - (DAMN_SCENE.ox + RIG_CANVAS.ax);
  const dy = SLASH_SCENE.ay - (DAMN_SCENE.oy + RIG_CANVAS.ay);
  const light = clawsLight(SHADOW_DIGS, t, view, turn);
  over(out, light.floor, dx, dy);
  const me = mineAt(m, t, view, turn, after);
  // (what is at its claws: over it where they are nearer the eye than it is, from in front; under it from behind)
  if (light.clawsNear > nearEye([0, 0, 0], view, turn)) {
    over(out, me, MINE.dx, MINE.dy);
    over(out, light.claws, dx, dy);
  } else {
    over(out, light.claws, dx, dy);
    over(out, me, MINE.dx, MINE.dy);
  }
  return out;
}

/** Where its claws come down as it bursts out of the smoke step (its own measure, from where it set off): its left's, its right's. */
export const SHADOW_STEP_ENDS: [[number, number], [number, number]] = [[SWIPE_REACH + STEP_SLAM[0] + 3, STEP_SLAM[1]], [SWIPE_REACH + STEP_SLAM[0] + 3, -STEP_SLAM[1]]];
/**
 * THE SMOKE STEP, WHOLE at a moment, THE EYE GOING WITH IT (its floor point where it always is on the scene; the floor
 * goes by under it as far as it has gone, ShadowMove.along): it hunkering down, bursting into smoke (pixel by pixel, as
 * the man does: dev/warlock_fx.ts dissolve); the game's own storm of black smoke and his fire across the floor, its
 * gouges and its river of smoke left behind it; it bursting out of the smoke, its claws slammed into the floor, which
 * breaks under them; rising. NO SMOKE BOILS OFF IT AS IT COILS (his word, 11 Nov, “get rid of the smoke and just leave
 * the wings”); the step's own smoke, which IS the move, is the game's as it was.
 */
export function stepScene(m: ShadowMove, t: number, view: GameView, turn = 0, after?: ShadowMove): Px {
  const out = new Px(SLASH_SCENE.w, SLASH_SCENE.h);
  const here = m.along?.(t) ?? 0;
  const [x0, y0] = swipeTo(view, turn)([here, 0, 0]);
  const dx = Math.round(SLASH_SCENE.ax - x0);
  const dy = Math.round(SLASH_SCENE.ay - y0);
  const light = smokeStepLight(asDemon(m), t, view, turn, { coil: [], ends: SHADOW_STEP_ENDS, alone: true, noBoil: true });
  over(out, light.floor, dx, dy);
  // (the storm's layer is laid as near the eye as it itself is, and a little nearer; but once it has burst out, what is left
  // in that layer is the smoke blasted out from before it where it came out: laid as near as THAT is, so that from behind
  // it is beyond it, not over its back)
  const out2 = t >= (SS.slam - 1) * FR;
  const things = light.layers.map((l, i) => ({ px: l.px, near: i === 1 && out2 ? swipeNear([SWIPE_REACH + 20, 0, 0], view, turn) : l.near, dx, dy }));
  const gone = m.gone?.(t) ?? 0;
  if (gone < 1) things.push({ px: dissolve(mineAt(m, t, view, turn, after), gone, t), near: swipeNear([here, 0, 0], view, turn), dx: MINE.dx, dy: MINE.dy });
  things.sort((a, b) => a.near - b.near);
  for (const th of things) over(out, th.px, th.dx, th.dy);
  return out;
}

/** How long it takes to crumble away once it has sagged (seconds; as the game has it, art/warlock_art.ts). */
export const BURN_CRUMBLE = 0.9;
/** How long its burning out is in all: its sagging, its crumbling, him getting up. */
export const burnOutAll = (m: ShadowMove): number => m.long + BURN_CRUMBLE + BACK_LONG;
const KEPT = new Map<string, Px>();
const kept = (key: string, make: () => Px): Px => {
  let p = KEPT.get(key);
  if (!p) KEPT.set(key, (p = make()));
  return p;
};
/**
 * ITS BURNING OUT, WHOLE at a moment (seconds from its start), as the game lays it over the rules' time (art/warlock_art.ts):
 * it sags down off its legs as what burns on it gutters (ShadowMove.glow); then it crumbles from its edges in, a band of
 * its dying fire eating in over it and ash behind that (dev/demon_return.ts crumble), and where it crumbles away there he
 * is, on one knee where it sank down; and he gets up (dev/warlock_spells.ts comeBack). Both at the one floor point.
 */
export function burnOutScene(m: ShadowMove, t: number, view: GameView, turn = 0): Px {
  const out = new Px(SLASH_SCENE.w, SLASH_SCENE.h);
  const back = warlockSpells().find((w) => w.name.startsWith('Meter dry: he comes back')) as WarlockMove;
  const man = (at: number): Px => drawWarlockAt(view, back, at, turn).px;
  const manAt = { dx: SLASH_SCENE.ax - CANVAS3.ax, dy: SLASH_SCENE.ay - CANVAS3.ay };
  const SAG = m.long;
  if (t <= SAG) over(out, drawShadowAt(view, m, t, turn).px, MINE.dx, MINE.dy);
  else if (t < SAG + BURN_CRUMBLE) {
    // (the very same picture of it, sagged its last, crumbles; and the same picture of him on one knee under it)
    over(out, kept(`man:${view}:${turn}`, () => man(0)), manAt.dx, manAt.dy);
    over(out, crumble(kept(`sagged:${view}:${turn}`, () => drawShadowAt(view, m, SAG, turn).px), (t - SAG) / BURN_CRUMBLE), MINE.dx, MINE.dy);
  } else over(out, man(t - SAG - BURN_CRUMBLE), manAt.dx, manAt.dy);
  return out;
}
