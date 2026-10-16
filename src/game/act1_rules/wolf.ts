// ACT 1: THE FOG WOLVES (FLOOR 9, THE PINEWOOD): its rules (game/act1_rules/types.ts).
//
// His design doc: "Fog Wolves | Small | A bite. They circle to come at you from behind." The art chat's pictures,
// each with his yes (art/fog_wolves.ts; 15 Oct, by 15:05, "Yes, as shown (Recommended)"): its glide, painted for 3
// tiles a second, its legs never touching the floor (so it may turn and stop at any frame); its bite, a lunge out of
// the fog, its jaws shutting 0.5 s in, 48 of its lengths (about 1.2 tiles) before it. Small: one attack.
//
// HOW THEY CIRCLE ROUND TO COME AT YOU FROM BEHIND (the art chat: "how the pack circles to come at you from behind is
// yours"): a wolf that is awake and in sight of the hero, between `from` and `to` tiles off him and not yet at his
// back, glides round him at its pace, the shorter way, drawing in to `ring` tiles; each makes for a place of its own
// round his back (a little to one side or the other, so that a pack spreads round behind him). Once it is behind him
// (within `behind` of its place), it comes straight in and bites, as any of them. A hero who keeps turning to face
// them is not circled for ever: after `most` seconds of it a wolf comes straight in for `rest` seconds, whatever;
// and one that is blocked (a tree, a wall) comes straight in too. One that is near enough to bite bites.
//
// Every number here that is a picture's is written down here; tests/act1_wolf.test.ts holds it to the art.

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import type { Act1Rules } from './types';

const D = Math.PI / 180;

/** THE FOG WOLF'S NUMBERS (tiles, seconds of its pictures). */
export const WOLF = {
  /** Its bite: its jaws shut at `hit`, `reach` tiles before it (WOLF_BITE.reach, 48 of its lengths), in a strip `half` to either side. */
  bite: { hit: 0.5, reach: 1.225, half: 0.5 },
  /** Its circling (above): from how near to how far off it circles; the ring it draws in to; how far round from its place behind him it may be and count as there; how far apart a pack's places are spread round his back (radians, the whole spread); how long it circles before it comes straight in, and for how long then. */
  circle: { from: 1.7, to: 6.5, ring: 2.3, behind: 25 * D, spread: 80 * D, most: 3.5, rest: 2.0 },
};

/** Its glide, painted for 3 tiles a second; with no foot on the floor it may stop at any frame (the art's JUMP: "its glide, from any frame, back to its stand"). */
const GAIT: GaitDef = { pace: 3, cycle: 1 / 16, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.0, slack: 0.3, trueBack: false };

const ACTS: readonly ActDef[] = [{ id: 'wolf:bite', clip: 'attack', long: 1.0, hit: WOLF.bite.hit, dmg: 1, cooldown: 0, first: 0, after: 0.55, near: 0, far: 1.3 }];

const wrap = (a: number): number => {
  let v = a % (Math.PI * 2);
  if (v > Math.PI) v -= Math.PI * 2;
  if (v <= -Math.PI) v += Math.PI * 2;
  return v;
};

/** How far round it still has to go to its place behind the hero (radians, the way it goes: to his left is up): 0, there. */
export function roundToBack(m: { x: number; y: number; seed: number }, h: { x: number; y: number; fx: number; fy: number }): number {
  const C = WOLF.circle;
  const want = Math.atan2(-h.fy, -h.fx) + (m.seed - 0.5) * C.spread;
  return wrap(want - Math.atan2(m.y - h.y, m.x - h.x));
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  tick(R, m, dt, dist) {
    if (m.state === 'act') return false;
    const C = WOLF.circle;
    const a1 = (m.a1 ??= { circ: 0, rest: 0 });
    a1.rest = Math.max(0, (a1.rest ?? 0) - dt);
    const g = R.g;
    const h = g.hero;
    if (g.over || a1.rest > 0 || dist < C.from || dist > C.to || !g.sees(m.x, m.y, h.x, h.y)) {
      a1.circ = 0;
      return false;
    }
    const off = roundToBack(m, h);
    // (at his back: it comes in)
    if (Math.abs(off) <= C.behind) {
      a1.circ = 0;
      return false;
    }
    a1.circ += dt;
    if (a1.circ > C.most) {
      a1.circ = 0;
      a1.rest = C.rest;
      return false;
    }
    // ROUND HIM, the shorter way to its place, drawing in to its ring
    const bx = (m.x - h.x) / dist;
    const by = (m.y - h.y) / dist;
    const side = off >= 0 ? 1 : -1;
    const pull = Math.max(-0.6, Math.min(0.6, (dist - C.ring) * 0.8));
    let vx = -by * side - bx * pull;
    let vy = bx * side - by * pull;
    const n = Math.hypot(vx, vy) || 1;
    vx /= n;
    vy /= n;
    const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
    const x0 = m.x;
    const y0 = m.y;
    g.slide(m, Math.min(m.r, 0.42), vx * sp * dt, vy * sp * dt, g.level.walk, true);
    // (blocked: it comes straight in)
    if (Math.hypot(m.x - x0, m.y - y0) < sp * dt * 0.3) {
      a1.circ = 0;
      a1.rest = C.rest;
      return false;
    }
    m.fx = vx;
    m.fy = vy;
    m.state = 'chase';
    m.anim = 'walk';
    // (gliding: its legs never land, so it goes at once, and its glide runs at its pace)
    if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
    m.gait.t += (dt * sp) / GAIT.pace;
    return true;
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'wolf:bite' || !(t0 < a.hit && t1 >= a.hit)) return;
    const g = R.g;
    const h = g.hero;
    const B = WOLF.bite;
    const r = R.rel(m);
    if (r.fwd > -0.2 && Math.hypot(h.x - m.x, h.y - m.y) <= B.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= B.half) R.blow(m, a.dmg);
    g.sfx('swing', 0.45);
  },
};
