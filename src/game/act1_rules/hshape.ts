// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE HUSH IN ITS OWN SHAPES: their rules (game/act1_rules/types.ts).
//
// His doc (level 20): "Enemies: the Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals." His
// pick to the art chat for how they move: “Drifting, then darting (Recommended)”; the brief with it: "grey fog pulled into a
// hunched, faceless figure with long thin arms and one open, silent mouth; about the knight's size, in swarms; it drifts slowly,
// then darts in fast; ... one attack, it wraps you in its arms for a moment, a grey grip that darkens your words"; then “Yes,
// that's them (Recommended)” (docs/mockups/hush_shapes/README.md, every number).
//
// WHAT THEY DO (the art's numbers, art/hush_shapes_moves.ts):
// - THEY DRIFT at HS_PACE, a tile and a half a second, bobbing on nothing; they come in swarms (HUSH_TUNE.swarm).
// - THE DART (HS_DART, 1.0 s): from HUSH_TUNE.dart.near to .far tiles off him, seen, the way clear, every HUSH_TUNE.dart.every
//   seconds at most: drawn in and held shivering (the warning: the line it will go marked on the floor), then FOUR TILES IN TWO
//   FRAMES at him; it goes in its own picture, and at its end the game moves it there. It strikes nothing: it closes on him.
// - THE GRIP (its attack, HS_GRIP, 1.7 s): its arms spread wide two tiles hand to hand and held (the warning: the round they will
//   shut on marked on the floor, HUSH_TUNE.grip.at tiles before it, HUSH_TUNE.grip.r round), then snapped shut in two frames:
//   whoever is in the round is struck, HELD (he cannot move) until it lets go (HS_GRIP.hold), and HIS WORDS GO DARK
//   (Game.hush) for HUSH_TUNE.grip.hush seconds: "a grey grip that darkens your words". Its coils round him (the art's
//   gripPainted): render/act1_fx/hshape.ts.

import { HS_DART, HS_DRIFT, HS_GRIP, HS_PACE } from '../../art/hush_shapes_moves';
import type { ActDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** Their numbers: the dart's reach (it goes four tiles, so made from `near` to `far` tiles off him) and its wait; the grip's round (its middle `at` tiles before it, `r` round), how long his words go dark; a swarm's size. */
export const HUSH_TUNE = {
  dart: { near: 4.4, far: 7.2, every: 3.5, carry: 4 },
  grip: { at: 1.5, r: 1.15, hush: 3, hold: HS_GRIP.hold - HS_GRIP.hit, slow: 0.95 },
  swarm: [4, 6] as const,
} as const;

const ACTS: readonly ActDef[] = [
  { id: 'hshape:grip', clip: 'attack', long: HS_GRIP.long, hit: HS_GRIP.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.4, near: 0, far: HUSH_TUNE.grip.at + HUSH_TUNE.grip.r - 0.2 },
  { id: 'hshape:dart', clip: 'dart', long: HS_DART.long, hit: HS_DART.strike[1], dmg: 0, cooldown: HUSH_TUNE.dart.every, first: 0.8, after: 0, near: HUSH_TUNE.dart.near, far: HUSH_TUNE.dart.far },
];

/** Where its grip shuts: the middle of its round, before it as it faces. */
export function gripPoint(m: { x: number; y: number; fx: number; fy: number }): { x: number; y: number } {
  return { x: m.x + m.fx * HUSH_TUNE.grip.at, y: m.y + m.fy * HUSH_TUNE.grip.at };
}

/** Whether the way `len` tiles before it (as it faces) is open the whole way. */
function clearAhead(R: Parameters<Act1Rules['acting']>[0], m: Monster, len: number): boolean {
  for (let s = 1; s <= Math.ceil(len / 0.25); s++) {
    const d = Math.min(len, s * 0.25);
    if (!R.g.isOpen(m.x + m.fx * d, m.y + m.fy * d)) return false;
  }
  return true;
}

export const RULES: Act1Rules | null = {
  gait: { pace: HS_PACE, cycle: HS_DRIFT.frames / HS_DRIFT.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.9, slack: 0.5, trueBack: true },
  acts: ACTS,
  can(R, m, a, _dist, los) {
    // (the dart only where he is seen and the way to him is clear)
    if (a.id !== 'hshape:dart') return true;
    if (!los) return false;
    const h = R.g.hero;
    const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
    return clearAhead(R, { ...m, fx: (h.x - m.x) / d, fy: (h.y - m.y) / d }, HUSH_TUNE.dart.carry + 0.4);
  },
  reachable(m) {
    // (darting: gone from where it was, not yet where it will be)
    return !(m.act && m.act.id === 'hshape:dart' && m.act.t >= HS_DART.strike[0]);
  },
  end(R, m, a) {
    if (a.id !== 'hshape:dart') return;
    // (the dart's end: it is where its picture went, four tiles on, so far as the floor lets it)
    const L = HUSH_TUNE.dart.carry;
    for (let s = 1; s <= Math.ceil(L / 0.1); s++) {
      const x = m.x + m.fx * 0.1;
      const y = m.y + m.fy * 0.1;
      if (!R.g.isOpen(x, y)) break;
      m.x = x;
      m.y = y;
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'hshape:dart') {
      if (at(HS_DART.strike[0])) g.sfx('whirl', 0.25);
      return;
    }
    if (a.id === 'hshape:grip') {
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
