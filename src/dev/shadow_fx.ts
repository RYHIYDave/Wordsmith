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
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { Sculpt } from './sculpt';
import { RIG_CANVAS } from './sculpt_demon_rig';
import { FR, RK } from './demon_moves';
import { WOLF_B, claws } from './demon_new';
import type { Built, Kit } from './demon_new';
import { HELL } from './sculpt_warlock';
import { Light } from './warlock_fx';
import { shadowMoving, shadowPose } from './shadow_moves';
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
