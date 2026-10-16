// ACT 1: THE EYESPAWN (FLOOR 10, THE SUNKEN FEN): its rules (game/act1_rules/types.ts).
//
// His picks (the art chat's brief, 16 Oct, by 00:58): "An eye on tentacles (Recommended)", the knight's height, 3 to 5
// a pack; its basic attack "A tentacle lash (Recommended)", its big attack "A gold gaze beam (Recommended)"; they hatch
// from the Drowned Eye's eggs. The art chat's pictures, each with his yes (art/eyespawn.ts; by 08:46, "Yes, as shown
// (Recommended)"): its haul, painted for 1.1 tiles a second; its lash (1.1 s), the blow 0.533 s in, before it, out to
// 1.15 tiles; its gaze (2.2 s): the line of light on the floor (its warning, painted by it) from 0.15 s, then its beam
// burning from 1.0 to 1.65 s, striking the floor along its forward from 0.4 out to 2.6 tiles, the burnt line painted
// by it too; hatching (1.3 s), small and shut at first, its eye open by 0.95 s. Medium: two attacks.
//
// WHAT ITS GAZE HURTS (the art chat: "What hurts (the beam's point, or the line behind it too) and its cooldown are
// yours"): the beam's point, and the line it has burnt behind it while the beam still burns, once a gaze: fire, so it
// leaves the hero burning a while, as the cult's fire does. ITS LINE IS ITS PICTURE'S: a figure is drawn one of four
// ways round (render.ts monsterSprite), and its beam runs along the way its picture faces; so as it begins its gaze it
// is turned to the way its picture faces it, and it gazes only at a hero who stands on that line.
//
// HATCHING (for the Drowned Eye's eggs, game/act1_rules/eye.ts): one spawned where an egg bursts, with
//     m.a1 = { hatch: 1 }
// and woken (state 'chase'), makes its hatching (`spawn:hatch`, a forced act: its hatch picture played whole) as its
// first act, and is itself after it (a1.hatch 0). It may be struck while it hatches. Until its first step its picture is
// its hatching's first (render/act1_fx/spawn.ts).
//
// Every number here that is a picture's is written down here; tests/act1_spawn.test.ts holds it to the art.

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import { backView, flipped, handOf } from '../facing';
import type { Act1Rules } from './types';

/** THE EYESPAWN'S NUMBERS (tiles, seconds of its pictures). */
export const SPAWN = {
  /** Its lash: the blow at `hit` (ES_LASH.hit, frame 16 of 30), whipped across before it out to `reach` (ES_LASH.reach), as far as `half` to either side. */
  lash: { hit: 16 / 30, reach: 1.15, half: 0.9, knock: 0.4 },
  /** Its gaze: its beam burns from `beam[0]` to `beam[1]` (ES_GAZE.beam), striking the floor along its forward from `near` out to `reach` (ES_GAZE.near, .reach) as beamAt(t) has it; it hurts within `half` of its line. */
  gaze: { beam: [1.0, 1.65] as const, near: 0.4, reach: 2.6, half: 0.4 },
  /** Hatching: how long (ES_HATCH.long), and when its eye is open (ES_HATCH.open[1]). */
  hatch: { long: 1.3, open: 0.95 },
};

/** Its haul, painted for 1.1 tiles a second; it stops at any frame of it. */
const GAIT: GaitDef = { pace: 1.1, cycle: 1 / 15, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.95, slack: 0.25, trueBack: false };

const ACTS: readonly ActDef[] = [
  { id: 'spawn:lash', clip: 'attack', long: 1.1, hit: SPAWN.lash.hit, dmg: 1, cooldown: 0, first: 0, after: 0.55, near: 0, far: 1.25 },
  { id: 'spawn:gaze', clip: 'gaze', long: 2.2, hit: SPAWN.gaze.beam[0], dmg: 1.5, cooldown: 8, first: 3, after: 0.6, near: 0, far: 2.75 },
  { id: 'spawn:hatch', clip: 'hatch', long: SPAWN.hatch.long, hit: SPAWN.hatch.open, dmg: 0, cooldown: 0, first: 0, after: 0.3, near: 0, far: 0, forced: true },
];

/** The way its picture faces for one that faces (fx, fy): one of the floor's four (front: along x; turned over, along y; from behind, along -y; behind and turned over, along -x). */
export function pictureWay(fx: number, fy: number): { x: number; y: number } {
  const back = backView(fx, fy);
  const flip = flipped(fx, fy);
  return back ? (flip ? { x: -1, y: 0 } : { x: 0, y: -1 }) : flip ? { x: 0, y: 1 } : { x: 1, y: 0 };
}

/** How far along its beam's line it strikes the floor, `t` seconds into its gaze (art/eyespawn.ts beamAt, in tiles); null while it does not burn. */
export function beamFar(t: number): number | null {
  const G = SPAWN.gaze;
  if (t < G.beam[0] || t > G.beam[1]) return null;
  const u = Math.max(0, Math.min(1, (t - G.beam[0]) / (G.beam[1] - G.beam[0])));
  return G.near + (G.reach - G.near) * u * u * (3 - 2 * u);
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  forced(_R, m, acts) {
    return m.a1 && m.a1.hatch === 1 ? acts.findIndex((a) => a.id === 'spawn:hatch') : -1;
  },
  can(R, m, a, dist) {
    if (a.id !== 'spawn:gaze') return true;
    // (only at a hero who stands on the line its picture would burn)
    const h = R.g.hero;
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const w = pictureWay(dx / Math.max(0.01, dist), dy / Math.max(0.01, dist));
    const along = dx * w.x + dy * w.y;
    const side = Math.abs(dx * w.y - dy * w.x);
    return along >= SPAWN.gaze.near - 0.2 && along <= SPAWN.gaze.reach && side <= SPAWN.gaze.half;
  },
  start(_R, m, a) {
    if (a.id === 'spawn:hatch') {
      if (m.a1) m.a1.hatch = 2;
    } else if (a.id === 'spawn:gaze' && m.act) {
      // (turned to the way its picture faces it: its beam goes where its picture burns)
      const w = pictureWay(m.fx, m.fy);
      m.fx = w.x;
      m.fy = w.y;
      m.act.hand = handOf(false, m.fx, m.fy);
    }
  },
  end(_R, m, a) {
    if (a.id === 'spawn:hatch' && m.a1) m.a1.hatch = 0;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const free = !h.move && h.invuln <= 0 && !g.over;
    if (a.id === 'spawn:lash') {
      if (!at(a.hit)) return;
      // (its arm whipped across before it)
      const L = SPAWN.lash;
      const r = R.rel(m);
      if (free && r.fwd > -0.2 && Math.hypot(h.x - m.x, h.y - m.y) <= L.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= L.half) {
        R.blow(m, a.dmg);
        g.knockHero(m.x, m.y, L.knock);
      }
      g.emit({ t: 'shake', amount: 1 });
      g.sfx('swing', 0.6);
    } else if (a.id === 'spawn:gaze') {
      const G = SPAWN.gaze;
      if (at(G.beam[0])) {
        g.sfx('beam', 0.6);
        g.emit({ t: 'shake', amount: 2 });
      }
      if (act.b || t1 <= G.beam[0] || t0 >= G.beam[1]) return;
      // (the beam's point, and the line it has burnt behind it: once a gaze)
      const far = beamFar(Math.min(t1, G.beam[1])) ?? G.reach;
      const r = R.rel(m);
      if (free && r.fwd >= G.near - TUNE.heroRadius && r.fwd <= far + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= G.half) {
        act.b = 1;
        g.hurtHero(g.rollMonsterDmg(m) * a.dmg, 'fire', m.words, m);
      }
    }
  },
};
