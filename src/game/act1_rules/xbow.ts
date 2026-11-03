// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: THE CROSSBOWMEN ON THE WALLS: their rules (game/act1_rules/types.ts).
//
// His doc (level 19): "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
// Silent Order's last." His pick to the art chat for how they move, not the one recommended: “Stand and shoot” ("they plant and
// hold their spot"); to their pictures, “Yes, that's them (Recommended)” (docs/mockups/keep_crossbowmen/README.md). The art
// chat's pictures (art/keep_crossbowmen.ts, keep_crossbowmen_moves.ts): standing behind the pavise planted before them; THE
// AIMED SHOT (CB_SHOT, 2.1 s): the crank's two turns, raised to the shoulder, THE RED AIM LINE drawn out across the floor
// (0.62 to 0.76 s) and HELD at full length (the warning) to 41/30 s, steadied at its end; the bolt down the whole line in two
// frames, landing on the second (43/30 s); THE RELOAD after every shot (CB_RELOAD, 2.2 s: five turns of the crank, a bolt laid
// in); struck; the Hush leaving him. Small: one attack.
//
// WHAT THEY DO, by those (the main chat's, as the art leaves it to the game):
// - TURRETS: they stand at their posts on the walls, their pavises planted (as they are drawn standing), and HOLD THEIR SPOT:
//   awake, they never walk; they turn to face him and shoot when he is in their sight and in their line's reach. (Their jog and
//   the planting of the pavise are the art's, kept for one that is to come to its post: XBOW_TUNE.posted, all of them posted now.)
// - THE AIMED SHOT: aimed at him as it begins; the aim follows him through the crank and the raise, and is HELD from as the line
//   is drawn out (CB_SHOT.line[0]): the warning lies where it will strike, and he has the held line's while to step out of it.
//   At the bolt's moment, whoever is in THE LANE (from before the pavise out along the aim to the line's end, 12 tiles, cut
//   short at a wall; 0.8 of a tile across) is struck: one bolt, hard (XBOW_TUNE.dmg). The lane drawn red on the floor, the bolt
//   and its wake: render/act1_fx/xbow.ts, as the art draws them (art/keep_crossbowmen_fx.ts: LINE_RED, BOLT_HOT, CB_FX).
// - THE RELOAD after every shot, always: no shot again until it is done.
// Sounds (his sound rule, the brief's): the crank, the thunk of the prod as the bolt flies; no voices.

import { CB_PACE, CB_PLANT, CB_RELOAD, CB_RUN, CB_SHOT, CB_LINE } from '../../art/keep_crossbowmen_moves';
import type { ActDef, BossRules } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/**
 * THE CROSSBOWMEN'S NUMBERS: the lane (tiles: where it begins before them, its length, how wide); how hard the bolt strikes
 * (times their own blow); how near he must be for them to loose at him; the wait after a reload before the next shot; whether
 * they stand posted (planted where they are put).
 */
export const XBOW_TUNE = {
  lane: { from: 0.69, tiles: CB_LINE.tiles, wide: 0.8 },
  dmg: 1.4,
  far: CB_LINE.tiles - 1,
  after: 0.35,
  posted: true,
} as const;

const ACTS: readonly ActDef[] = [
  { id: 'xbow:shot', clip: 'attack', long: CB_SHOT.long, hit: CB_SHOT.hit, dmg: XBOW_TUNE.dmg, cooldown: 0, first: 0.6, after: XBOW_TUNE.after, near: 0, far: XBOW_TUNE.far },
  { id: 'xbow:reload', clip: 'reload', long: CB_RELOAD.long, hit: CB_RELOAD.long, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
  { id: 'xbow:plant', clip: 'plant', long: CB_PLANT.long, hit: CB_PLANT.slam, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
];
const SHOT = 0;
const RELOAD = 1;
const PLANT = 2;

/** How far the lane runs along (fx, fy) from (x, y) before a wall stops it (tiles from its foot), at most its length. */
export function laneLength(R: BossRules, x: number, y: number, fx: number, fy: number): number {
  const g = R.g;
  const L = XBOW_TUNE.lane;
  let d = L.from;
  for (; d < L.tiles; d += 0.1) if (!g.isOpen(x + fx * d, y + fy * d)) break;
  return Math.min(L.tiles, d);
}

/** Whether (px, py) is in a lane from (x, y) along (fx, fy), `len` long. */
export function inLane(x: number, y: number, fx: number, fy: number, len: number, px: number, py: number): boolean {
  const dx = px - x;
  const dy = py - y;
  const fwd = dx * fx + dy * fy;
  const side = Math.abs(-dx * fy + dy * fx);
  return fwd >= XBOW_TUNE.lane.from - 0.3 && fwd <= len + 0.3 && side <= XBOW_TUNE.lane.wide / 2 + 0.25;
}

const a1Of = (m: Monster): Record<string, number> => m.a1 ?? (m.a1 = {});

/** Whether one of them is planted at his post (his pavise before him). */
export const planted = (m: Monster): boolean => !!m.a1?.planted;

export const RULES: Act1Rules | null = {
  gait: { pace: CB_PACE, cycle: CB_RUN.frames / CB_RUN.fps / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 8, slack: 1.0, trueBack: true },
  acts: ACTS,
  spawned(_R, m) {
    if (XBOW_TUNE.posted) a1Of(m).planted = 1;
  },
  forced(R, m) {
    // (one not yet at his post plants his pavise where he stops, once he sees the hero near enough to shoot)
    if (planted(m)) return -1;
    const h = R.g.hero;
    const d = Math.hypot(h.x - m.x, h.y - m.y);
    return d <= XBOW_TUNE.far && R.g.sees(m.x, m.y, h.x, h.y) ? PLANT : -1;
  },
  tick(R, m, _dt, dist) {
    if (!planted(m) || m.state === 'act') return false;
    // PLANTED: he holds his spot, never walks; turned to the hero; the reload after every shot; a shot when he may
    const g = R.g;
    const h = g.hero;
    m.anim = 'idle';
    if (m.gait) m.gait.mode = 'stand';
    const a1 = a1Of(m);
    if (a1.reload) {
      a1.reload = 0;
      R.startAct(m, ACTS, RELOAD);
      return true;
    }
    if (dist > 0.01) {
      m.fx = (h.x - m.x) / dist;
      m.fy = (h.y - m.y) / dist;
    }
    if (m.cd <= 0 && dist <= XBOW_TUNE.far && g.sees(m.x, m.y, h.x, h.y)) R.startAct(m, ACTS, SHOT);
    return true;
  },
  start(R, m, a) {
    if (a.id === 'xbow:plant') a1Of(m).planted = 1;
    if (a.id === 'xbow:shot' && m.act) m.act.a = laneLength(R, m.x, m.y, m.fx, m.fy);
  },
  end(_R, m, a) {
    if (a.id === 'xbow:shot') a1Of(m).reload = 1;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'xbow:reload') {
      // (five turns of the crank, a click each; the bolt laid in)
      const [c0, c1] = CB_RELOAD.crank;
      for (let k = 0; k < CB_RELOAD.turns; k++) if (at(c0 + ((c1 - c0) * (k + 0.5)) / CB_RELOAD.turns)) g.sfx('click', 0.25);
      return;
    }
    if (a.id !== 'xbow:shot' || !m.act) return;
    // (the crank's two turns)
    for (const T of [CB_SHOT.crank[0] + 0.09, CB_SHOT.crank[0] + 0.27]) if (at(T)) g.sfx('click', 0.3);
    // (the aim follows him till the line is drawn out; from then it is held)
    if (t1 < CB_SHOT.line[0]) {
      const h = g.hero;
      const d = Math.hypot(h.x - m.x, h.y - m.y);
      if (d > 0.01) {
        m.fx = (h.x - m.x) / d;
        m.fy = (h.y - m.y) / d;
      }
      m.act.a = laneLength(R, m.x, m.y, m.fx, m.fy);
    }
    if (at(CB_SHOT.strike[0])) g.sfx('shot', 0.7);
    if (!at(a.hit)) return;
    // (the bolt down the whole lane: whoever is in it is struck)
    const h = g.hero;
    if (inLane(m.x, m.y, m.fx, m.fy, m.act.a, h.x, h.y)) R.blow(m, a.dmg);
  },
};
