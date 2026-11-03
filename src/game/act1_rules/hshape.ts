// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE HUSH IN ITS OWN SHAPES: their rules (game/act1_rules/types.ts).
//
// His doc (level 20): "Enemies: the Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals." His
// pick to the art chat for how they move: “Drifting, then darting (Recommended)”; the brief with it: "grey fog pulled into a
// hunched, faceless figure with long thin arms and one open, silent mouth; about the knight's size, in swarms; it drifts slowly,
// then darts in fast; ... one attack, it wraps you in its arms for a moment, a grey grip that darkens your words"; then “Yes,
// that's them (Recommended)”. Their new rhythm after (the art chat's, mockup/hush-shapes c346805, handed over 31 Oct 18:00 with his
// yes; docs/mockups/hush_shapes/README.md, "Their rhythm"): the dart is no longer one of their moves; they go ROUND YOU.
//
// WHAT THEY DO (the art's numbers, art/hush_shapes_moves.ts; brought in by the main chat at his word of 2 Nov 2026, “All of it in
// this one”):
// - FAR OFF, THEY DRIFT in at HS_PACE, a tile and a half a second, bobbing on nothing; they come in swarms (HUSH_TUNE.swarm).
// - THEY CIRCLE YOU: within HS_CIRCLE.slow.ring (and a little more) of him, in sight, each goes ROUND HIM ON A RING, facing him, all
//   of a swarm the same way round, its ring closing at HS_CIRCLE.closing tiles a second down to the near ring (HS_CIRCLE.fast.ring),
//   its pace rising as it closes (circlePace); the slow glide outside HS_CIRCLE.switchAt, the fast one inside (its pictures by the
//   way it goes as its picture is turned: circleLeft, circleRight and their Fast ones).
// - THE SWOOP, one after another (none within HUSH_TUNE.swoop.gap of the last), from the near ring after a while on it: the game
//   carries it round him and in (swoopCarry) so that its last turn ends square before him on one of the four ways its pictures
//   face; its warning the round its arms will shut on, marked on the floor; then its grip as it always was (HS_SWOOP.hit): whoever
//   is in the round is struck, HELD until it lets go, and HIS WORDS GO DARK; it lets go and swirls off round him again (from
//   HS_SWOOP.off), its ring growing out (HUSH_TUNE.swoop.grow a second, to HUSH_TUNE.swoop.out), and then in once more.
// - ONE NOT CIRCLING (too close in, or with no room to go round) GRIPS as before (its attack, HS_GRIP, 1.7 s).
// Its coils round him (the art's gripPainted) and its warnings: render/act1_fx/hshape.ts.

import { HS_CIRCLE, HS_DRIFT, HS_GRIP, HS_PACE, HS_SWOOP, circlePace, swoopCarry, swoopPace } from '../../art/hush_shapes_moves';
import type { ActDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** A round of a glide's pictures (12 at 10 a second), played round and round as it circles. */
const GLIDE_LONG = HS_DRIFT.frames / HS_DRIFT.fps;

/** Their numbers: the grip's round (its middle `at` tiles before it, `r` round), how long his words go dark; a swarm's size; circling: how far out they begin to (beyond the far ring), the wait on the near ring before a swoop, the least time between two swoops of a floor, its ring growing out after. */
export const HUSH_TUNE = {
  grip: { at: 1.5, r: 1.15, hush: 3, hold: HS_GRIP.hold - HS_GRIP.hit, slow: 0.95 },
  swarm: [4, 6] as const,
  circle: { from: HS_CIRCLE.slow.ring + 1.5, least: HS_CIRCLE.fast.ring - 0.7 },
  swoop: { wait: [0.6, 1.8] as const, gap: 1.3, grow: 1.2, out: 4.6 },
} as const;

/** A glide's act for each way round and pace; a swoop's for each way round. */
const glide = (id: string, clip: string): ActDef => ({ id: `hshape:${id}`, clip, long: GLIDE_LONG * 60, hit: 1e9, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true, loop: { at: 0, span: GLIDE_LONG, extra: GLIDE_LONG * 59 } });
const ACTS: readonly ActDef[] = [
  { id: 'hshape:grip', clip: 'attack', long: HS_GRIP.long, hit: HS_GRIP.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.4, near: 0, far: HUSH_TUNE.grip.at + HUSH_TUNE.grip.r - 0.2 },
  glide('glideL', 'circleLeft'),
  glide('glideR', 'circleRight'),
  glide('glideLF', 'circleLeftFast'),
  glide('glideRF', 'circleRightFast'),
  { id: 'hshape:swoopL', clip: 'swoopLeft', long: HS_SWOOP.long, hit: HS_SWOOP.hit, dmg: 1, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'hshape:swoopR', clip: 'swoopRight', long: HS_SWOOP.long, hit: HS_SWOOP.hit, dmg: 1, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
];
const isGlide = (id: string): boolean => id.startsWith('hshape:glide');
const isSwoop = (id: string): boolean => id.startsWith('hshape:swoop');

/** Where its grip shuts: the middle of its round, before it as it faces. */
export function gripPoint(m: { x: number; y: number; fx: number; fy: number }): { x: number; y: number } {
  return { x: m.x + m.fx * HUSH_TUNE.grip.at, y: m.y + m.fy * HUSH_TUNE.grip.at };
}

/** How far round him (radians) its swoop's last turn carries it: worked out from the art's carrying, round and in. */
export const SWOOP_TURN = ((): number => {
  let a = 0;
  const n = 360;
  const T = HS_SWOOP.turn[1];
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * T;
    const t1 = ((i + 1) / n) * T;
    const c0 = swoopCarry(t0);
    const c1 = swoopCarry(t1);
    const r = HS_CIRCLE.fast.ring - (c0.inward + c1.inward) / 2;
    a += (c1.round - c0.round) / r;
  }
  return a;
})();

/** What each keeps (Monster.a1): the way it goes round (1 its own left, -1 its right), its ring growing out after a swoop (1), how long it has been on the near ring and how long it waits there, the way its swoop goes. */
interface HushKept { side: number; out: number; near: number; wait: number; swoop: number }
function kept(R: Parameters<Act1Rules['acting']>[0], m: Monster): HushKept {
  const a = (m.a1 ??= {});
  if (a.side === undefined) {
    // (a swarm all going round the same way reads as one swirl: the way of the floor's first)
    const way = (swirls.get(R.g) ?? (swirls.set(R.g, R.g.rng.next() < 0.5 ? 1 : -1), swirls.get(R.g)!));
    a.side = way;
    a.out = 0;
    a.near = 0;
    a.wait = R.g.rng.range(HUSH_TUNE.swoop.wait[0], HUSH_TUNE.swoop.wait[1]);
    a.swoop = 0;
  }
  return a as unknown as HushKept;
}
/** Each game's way round, and when its last swoop began. */
const swirls = new WeakMap<object, number>();
const lastSwoop = new WeakMap<object, number>();

/** Its place round him: the way from him to it, its ring (tiles). */
function round(R: Parameters<Act1Rules['acting']>[0], m: Monster): { ux: number; uy: number; r: number } {
  const h = R.g.hero;
  const r = Math.hypot(m.x - h.x, m.y - h.y) || 1e-6;
  return { ux: (m.x - h.x) / r, uy: (m.y - h.y) / r, r };
}
/** Facing him from where it is. */
function faceHim(m: Monster, ux: number, uy: number): void {
  m.fx = -ux;
  m.fy = -uy;
}
/** Is its picture turned over (facing to the screen's left): render.ts turns one so when fx - fy < 0. */
const turnedOver = (fx: number, fy: number): boolean => fx - fy < 0;
/** The glide's act for the way it goes round, as its picture is turned (turned over, the same pictures go the mirror way), and its pace. */
function glideFor(side: number, fx: number, fy: number, r: number): string {
  const left = (turnedOver(fx, fy) ? -side : side) > 0;
  const fast = r < HS_CIRCLE.switchAt;
  return `hshape:glide${left ? 'L' : 'R'}${fast ? 'F' : ''}`;
}
/** Carried to (ring `r`, angle `a` round him), if the floor there is open: true if it went. */
function carryTo(R: Parameters<Act1Rules['acting']>[0], m: Monster, r: number, a: number): boolean {
  const h = R.g.hero;
  const x = h.x + Math.cos(a) * r;
  const y = h.y + Math.sin(a) * r;
  if (!R.g.isOpen(x, y)) return false;
  m.x = x;
  m.y = y;
  return true;
}

export const RULES: Act1Rules | null = {
  gait: { pace: HS_PACE, cycle: HS_DRIFT.frames / HS_DRIFT.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.9, slack: 0.5, trueBack: true },
  acts: ACTS,
  forced(R, m, acts) {
    const g = R.g;
    if (g.over) return -1;
    const s = kept(R, m);
    const { ux, uy, r } = round(R, m);
    const h = g.hero;
    // (THE SWOOP, when its moment came on the near ring)
    if (s.swoop) {
      const id = s.swoop > 0 ? 'hshape:swoopL' : 'hshape:swoopR';
      return acts.findIndex((a) => a.id === id);
    }
    // (circling: in reach of its rings and in sight; too close in, it grips as before)
    if (r > HUSH_TUNE.circle.from || r < HUSH_TUNE.circle.least || !g.sees(m.x, m.y, h.x, h.y)) return -1;
    faceHim(m, ux, uy);
    return acts.findIndex((a) => a.id === glideFor(s.side, m.fx, m.fy, r));
  },
  can(_R, _m, a) {
    // (the glides and the swoop come only when the rules bring them)
    return !a.forced;
  },
  start(R, m, a) {
    if (!isSwoop(a.id)) return;
    lastSwoop.set(R.g, R.g.time);
    // (its picture held facing the way it will face, square before him, as its last turn ends: the swoop's pictures are of that)
    const s = kept(R, m);
    s.swoop = 0;
    const { ux, uy } = round(R, m);
    const end = Math.atan2(uy, ux) + s.side * SWOOP_TURN;
    m.fx = -Math.cos(end);
    m.fy = -Math.sin(end);
    if (m.act) {
      m.act.a = s.side;
      m.act.x = m.fx;
      m.act.y = m.fy;
    }
  },
  end(R, m, a) {
    if (!isSwoop(a.id)) return;
    const s = kept(R, m);
    s.out = 1;
    s.near = 0;
    s.wait = R.g.rng.range(HUSH_TUNE.swoop.wait[0], HUSH_TUNE.swoop.wait[1]);
  },
  acting(R, m, a, t0, t1, dt) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (isGlide(a.id)) {
      // GOING ROUND HIM on its ring, facing him, its ring closing (or growing out again after a swoop)
      const s = kept(R, m);
      const { ux, uy, r } = round(R, m);
      const C = HS_CIRCLE;
      let r1 = r;
      if (s.out) {
        r1 = Math.min(HUSH_TUNE.swoop.out, r + HUSH_TUNE.swoop.grow * dt);
        if (r1 >= HUSH_TUNE.swoop.out - 1e-6) s.out = 0;
      } else r1 = Math.max(C.fast.ring, r - C.closing * dt);
      const a0 = Math.atan2(uy, ux);
      const a1 = a0 + (s.side * circlePace(r1) * dt) / Math.max(0.5, r1);
      if (!carryTo(R, m, r1, a1) && !carryTo(R, m, r, a1)) {
        // (no room that way round: it turns and goes round the other way)
        s.side = -s.side;
      }
      const now = round(R, m);
      faceHim(m, now.ux, now.uy);
      // (its pictures: the glide for the way it goes round as its picture is turned, and its pace; another, the act ends)
      const want = glideFor(s.side, m.fx, m.fy, now.r);
      let done = want !== a.id || now.r > HUSH_TUNE.circle.from + 0.5 || !g.sees(m.x, m.y, h.x, h.y);
      // (on the near ring, after a while, and none of the swarm swooping just now: its swoop, begun where its last turn will end
      // square before him)
      if (!done && !s.out && now.r <= C.fast.ring + 0.2) {
        s.near += dt;
        const last = lastSwoop.get(g) ?? -1e9;
        if (s.near >= s.wait && g.time - last >= HUSH_TUNE.swoop.gap) {
          const ends = Math.atan2(now.uy, now.ux) + s.side * SWOOP_TURN;
          const q = Math.PI / 2;
          const off = Math.abs(ends - Math.round(ends / q) * q);
          if (off <= (circlePace(now.r) * dt) / now.r + 0.02) {
            s.swoop = s.side;
            done = true;
          }
        }
      }
      if (done && m.act) m.act.t = a.long;
      return;
    }
    if (isSwoop(a.id)) {
      // CARRIED ROUND HIM AND IN through its last turn; still through its grip; swirling off round him again as it lets go
      const side = m.act?.a ?? 1;
      const { ux, uy, r } = round(R, m);
      const a0 = Math.atan2(uy, ux);
      const turn = HS_SWOOP.turn[1];
      if (t0 < turn) {
        const c0 = swoopCarry(Math.min(t0, turn));
        const c1 = swoopCarry(Math.min(t1, turn));
        const r1 = Math.max(HS_CIRCLE.grip, r - (c1.inward - c0.inward));
        carryTo(R, m, r1, a0 + (side * (c1.round - c0.round)) / Math.max(0.5, r1));
      } else if (t1 > HS_SWOOP.off[0]) {
        const r1 = r + HUSH_TUNE.swoop.grow * dt;
        carryTo(R, m, r1, a0 + (side * swoopPace(t1) * dt) / Math.max(0.5, r1));
      }
      // (its picture held facing the way it faces as its grip shuts, till it lets go)
      if (t1 < HS_SWOOP.off[0] && m.act && m.act.x !== undefined && m.act.y !== undefined) {
        m.fx = m.act.x;
        m.fy = m.act.y;
      } else {
        const now = round(R, m);
        faceHim(m, now.ux, now.uy);
      }
    }
    if (a.id === 'hshape:grip' || isSwoop(a.id)) {
      if (!at(a.hit)) return;
      const P = gripPoint(m);
      const caught = Math.hypot(h.x - P.x, h.y - P.y) <= HUSH_TUNE.grip.r && !h.move;
      // (the coils where it shut: round him if it caught him)
      R.peril(m, 'act1', caught ? h.x : P.x, caught ? h.y : P.y, { a1: 'hshape:grip', dur: 0.8, hit: 0, a: caught ? 1 : 0 });
      if (!caught) return;
      R.blow(m, a.dmg);
      g.hush(HUSH_TUNE.grip.hush);
      // (held: he cannot move until it lets go)
      const was = (h.slowT ?? 0) > 0 ? h.slowBy ?? 0 : 0;
      h.slowT = Math.max(h.slowT ?? 0, HUSH_TUNE.grip.hold);
      h.slowBy = Math.max(was, HUSH_TUNE.grip.slow);
    }
  },
};
