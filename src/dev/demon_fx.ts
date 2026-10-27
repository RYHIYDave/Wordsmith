// WHAT THE DEMON'S CLAWS LEAVE (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Its claw rake (dev/demon_moves.ts rakeMove; his pick, “Alternating rakes (Recommended)”): the strike is a flash (his
// rulebook's Movement 9, big wind-up, lightning strike), so what is seen of it is what it leaves: four streaks of its cyan
// hellfire in the air, one off each talon, along the arc it raked, burning out from their tails; where it lands, a burst of
// flecks and four gashes of fire across the one it hit, which glow and die; and that one cursed from then on (his word, 25
// Oct, “So I think the tap claw rake has to apply the curse as well”): seeping black smoke and cyan embers, as the warlock's
// curse leaves them (dev/warlock_fx.ts smolder).

import { project } from '../art/skeleton';
import type { Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { Sculpt } from './sculpt';
import { DEMON_B, GROWN, RIG_CANVAS, demonInto } from './sculpt_demon_rig';
import { solve } from '../art/skeleton';
import { FR, RK, demonPose } from './demon_moves';
import type { DemonMove } from './demon_moves';
import { Light, SMOKE, TARGET_BOX, burst, smolder } from './warlock_fx';

/** How far ahead of it the one it rakes stands (its own measure: within a claw's reach). */
export const RAKE_REACH = 80;
/** ... and a little to its right (nearer the eye in front: clear of its head, which hangs before it). */
export const RAKE_ASIDE = -6;
/** How long a streak burns after the strike, and a gash on the one it hit. */
const STREAK_LIFE = 0.28;
const GASH_LIFE = 0.75;

/** Where a point of it (its own space, turned `turn` on the spot) is on its picture (RIG_CANVAS). */
export function onRig(p: V3, view: GameView, turn = 0): [number, number] {
  const a = (turn * Math.PI) / 180;
  const q: V3 = [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const s = project(q, view === 'back' ? 'rear' : view);
  return [RIG_CANVAS.ax + s[0], RIG_CANVAS.ay + s[1]];
}
/** Where the one it rakes stands on its picture (the floor under it). */
export function rakeFoot(view: GameView, turn = 0): [number, number] {
  return onRig([RAKE_REACH, RAKE_ASIDE, 0], view, turn);
}

/** Its raking claw's talon tips at a moment (its own space, unturned). */
function talonsAt(m: DemonMove, t: number): V3[] {
  if (!m.rake) return [];
  const sc = new Sculpt();
  const s = solve(DEMON_B, demonPose(m.motion, t) as Posed);
  return demonInto(sc, s, 'front', 0, { rake: { side: m.rake.side, way: m.rake.way(t) } }, 1, GROWN, { spread: 1, beat: 0, sweep: 0, tip: 0, flex: 0, wind: 0, phase: 0 }).talons;
}
/** How finely its talons' way is followed through the swing: samples to a frame. */
const STEPS = 8;
const PATHS = new Map<DemonMove, { t: number; tips: V3[] }[]>();
/** Each moment of the swing, from where it held to where it landed, and where its talons' tips were then: the way they went. */
function pathOf(m: DemonMove): { t: number; tips: V3[] }[] {
  let p = PATHS.get(m);
  if (!p) {
    p = [];
    for (let f = RK.held * STEPS; f <= RK.hit * STEPS; f++) {
      const t = (f / STEPS) * FR;
      p.push({ t, tips: talonsAt(m, t) });
    }
    PATHS.set(m, p);
  }
  return p;
}
const hash = (i: number): number => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * THE RAKE'S LIGHT AT A MOMENT of a rake (`m`), and of every rake before it on the same one (`hits`: when each before it
 * landed, for its curse and its gashes): the streaks off its talons, the burst and the gashes where it lands, the one it hit
 * smoldering from then on. On a picture the demon's size (RIG_CANVAS), clear but for them.
 */
export function rakeLight(m: DemonMove, t: number, view: GameView, turn = 0, before: { m: DemonMove; at: number }[] = []): Px {
  const out = new Px(RIG_CANVAS.w, RIG_CANVAS.h);
  const l = new Light();
  const sm = new Light();
  const [gx, gy] = rakeFoot(view, turn);
  const strikes = [...before, { m, at: 0 }];
  // (cursed from the first that landed: smoldering, each new rake flaring it)
  const first = strikes.map((s) => s.at + (s.m.hit ?? 0)).filter((h) => h <= t + strikes[strikes.length - 1].at);
  for (const s of strikes) {
    const r = s.m;
    if (!r.rake || r.hit === undefined) continue;
    const local = t - s.at;
    const hit = r.hit;
    const held = RK.held * FR;
    // THE STREAKS, one off each talon, along the way it truly went, its head on the talon's tip as it rakes (his word of the
    // first rakes, 27 Oct, “The cyan streaks should follow the claws”), burning out from their tails once it has landed
    if (local > held && local < hit + STREAK_LIFE) {
      const path = pathOf(r).filter((p) => p.t <= local + 1e-6);
      const gone = Math.max(0, (local - hit) / STREAK_LIFE);
      const n = path.length;
      for (let k = 0; k < (path[0]?.tips.length ?? 0); k++) {
        const pts = path.map((p) => onRig(p.tips[k], view, turn));
        for (let i = 1; i < n; i++) {
          // (how far back along it from its head: hottest at the head, cooler behind; its tail burning out first)
          const back = (n - 1 - i) / Math.max(1, n - 1);
          if (back > 1 - gone) continue;
          const heat = back < 0.2 && gone < 0.4 ? 3 : back < 0.5 ? 2 : back < 0.85 ? 1 : 0;
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          const len = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
          for (let j = 0; j <= len; j++) {
            const x = x0 + ((x1 - x0) * j) / len;
            const y = y0 + ((y1 - y0) * j) / len;
            l.put(x, y, heat);
            l.put(x + 1, y, Math.max(0, heat - 1));
            l.put(x, y + 1, Math.max(0, heat - 1));
          }
        }
      }
    }
    if (local >= hit) {
      const since = local - hit;
      // THE BURST where it lands, at its chest
      if (since < 0.25) burst(l, gx, gy - TARGET_BOX.h * 0.55, 4 + since * 44, since / 0.25, 7 + Math.round(s.at * 10));
      // THE GASHES: four of fire across it, the way the claw raked (from its far side down to its near), glowing and dying
      if (since < GASH_LIFE) {
        // (the way the claw swept as it landed, on the picture)
        const path = pathOf(r);
        const a = onRig(path[Math.max(0, path.length - 5)].tips[1], view, turn);
        const b = onRig(path[path.length - 1].tips[1], view, turn);
        const dl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const [dx, dy] = [(b[0] - a[0]) / dl, (b[1] - a[1]) / dl];
        for (let g = 0; g < 4; g++) {
          // (four of them, side by side across the way it swept)
          const cx = gx - dy * (g - 1.5) * 3.5 + (hash(g + s.at) - 0.5) * 2;
          const cy = gy - TARGET_BOX.h * 0.55 + dx * (g - 1.5) * 3.5;
          const len = 18 - Math.abs(g - 1.5) * 2;
          for (let i = 0; i <= len; i++) {
            const u = i / len - 0.5;
            const x = cx + u * len * dx;
            const y = cy + u * len * dy;
            const k2 = since < 0.12 ? 3 : since < 0.3 ? 2 : since < 0.55 ? 1 : 0;
            l.put(x, y, k2);
            l.put(x + 1, y, Math.max(0, k2 - 1));
          }
        }
      }
    }
  }
  if (first.length) {
    const since = t - Math.min(...strikes.map((s) => s.at + (s.m.hit ?? 0)));
    if (since > 0.08) smolder(l, sm, gx, gy, TARGET_BOX.w, TARGET_BOX.h, t, Math.min(1, (since - 0.08) / 0.3), 3);
  }
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}
