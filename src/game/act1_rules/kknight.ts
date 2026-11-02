// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19, THE KEEP: THE KING'S KNIGHTS: their rules (game/act1_rules/types.ts).
//
// His doc (level 19): "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
// Silent Order's last." His picks to the art chat (docs/mockups/kings_knights/README.md): “Huge and slow, one each”, then
// “Bigger still”, then “Really big” (twice the knight's height, a greatsword, no shield, the royal swan on breast and back), and
// “Yes, that's them (Recommended)”. One at a time is his pick (a pack of them is one knight; the barracks, their lair, two);
// how many come at once the art chat left to the main chat.
//
// WHAT THEY DO (the art's numbers, art/kings_knights_moves.ts and kings_knights_fx.ts):
// - THEY WALK at KN_PACE, a tile and a half a second (the hero runs 4.6): slow and heavy.
// - THE SWEEP (his basic, KN_SWEEP, 2.7 s; the blade round at 1.1 s): wound back behind his right (the warning: the half
//   circle before him it will cross marked on the floor), the greatsword sweeps round before him to his left: whoever is within
//   SWEEP.r (4.6 tiles) of him and not behind him is struck.
// - THE CLEAVE (KN_CLEAVE, 2.3 s; down at 1.13 s): fists high over his helm (the warning: the line it will crack marked on the
//   floor), the blade comes down before him and THE FLOOR CRACKS on out in a line to CRACK.reach (8 tiles), CRACK.wide (2.1
//   tiles) across: whoever stands on it is struck, harder than the sweep. Made at one a few tiles off, not one beside him.
// What they leave on the floor, drawn: render/act1_fx/kknight.ts.

import { CRACK, SWEEP } from '../../art/kings_knights_fx';
import { CHOP_AT, KN_CLEAVE, KN_HALT, KN_PACE, KN_SETOFF, KN_SWEEP, KN_WALK } from '../../art/kings_knights_moves';
import { TILE3 } from '../../art/new_mobs3';
import type { ActDef, GaitDef } from '../bosses';
import { BANNER, BANNER_AT, BANNER_HIT, KNIGHT_BANNER, waveStrikes } from '../../art/action_f16_knight';
import { beside, fromFigure } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** Their numbers: the sweep's reach and how far round it goes (degrees each side of before him); the crack's start, end and width (tiles); the cleave's blow (times his own); a pack's size, and their lair's. */
export const KNIGHT_TUNE = {
  sweep: { r: SWEEP.r, arc: SWEEP.arc + 10 },
  crack: { from: CHOP_AT / TILE3 - 0.4, reach: CRACK.reach, wide: CRACK.wide },
  cleave: 1.4,
  pack: 1,
  lair: 2,
} as const;

const ACTS: readonly ActDef[] = [
  { id: 'kknight:sweep', clip: 'attack', long: KN_SWEEP.long, hit: KN_SWEEP.hit, dmg: 1, cooldown: 0, first: 0.5, after: 0.8, near: 0, far: KNIGHT_TUNE.sweep.r - 0.6 },
  { id: 'kknight:cleave', clip: 'cleave', long: KN_CLEAVE.long, hit: KN_CLEAVE.hit, dmg: KNIGHT_TUNE.cleave, cooldown: 5, first: 2, after: 0.8, near: 1.5, far: KNIGHT_TUNE.crack.reach - 0.5 },
];

/** Whether (x, y) is struck by a sweep laid from (sx, sy) facing (fx, fy): within its reach and not behind him. */
export function inSweep(sx: number, sy: number, fx: number, fy: number, x: number, y: number): boolean {
  const dx = x - sx;
  const dy = y - sy;
  const d = Math.hypot(dx, dy);
  if (d > KNIGHT_TUNE.sweep.r) return false;
  if (d < 0.6) return true;
  const cos = (dx * fx + dy * fy) / d;
  return cos >= Math.cos((KNIGHT_TUNE.sweep.arc * Math.PI) / 180);
}
/** Whether (x, y) is on the crack laid from (sx, sy) along (fx, fy). */
export function onCrack(sx: number, sy: number, fx: number, fy: number, x: number, y: number): boolean {
  const C = KNIGHT_TUNE.crack;
  const dx = x - sx;
  const dy = y - sy;
  const fwd = dx * fx + dy * fy;
  const side = Math.abs(-dx * fy + dy * fx);
  return fwd >= C.from - 0.3 && fwd <= C.reach + 0.2 && side <= C.wide / 2;
}

const GAIT: GaitDef = { pace: KN_PACE, cycle: KN_WALK.frames / KN_WALK.fps, setOff: KN_SETOFF, halt: KN_HALT, raise: 0, lower: 0, stopAt: 2.8, slack: 0.8, trueBack: true };
const OLD: Act1Rules = {
  gait: GAIT,
  acts: ACTS,
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (!m.act) return;
    if (a.id === 'kknight:sweep') {
      if (at(KN_SWEEP.strike[0])) g.sfx('swing', 0.8);
      if (!at(a.hit)) return;
      if (inSweep(m.x, m.y, m.fx, m.fy, h.x, h.y)) R.blow(m, a.dmg);
      R.peril(m, 'act1', m.x, m.y, { a1: 'kknight:sweep', dur: SWEEP.dust, hit: 0 });
      return;
    }
    if (a.id === 'kknight:cleave') {
      if (!at(a.hit)) return;
      g.sfx('slam', 0.9);
      g.emit({ t: 'shake', amount: 5 });
      if (onCrack(m.x, m.y, m.fx, m.fy, h.x, h.y)) R.blow(m, a.dmg);
      R.peril(m, 'act1', m.x, m.y, { a1: 'kknight:crack', dur: CRACK.long, hit: 0 });
    }
  },
};


// THE RALLYING BANNER (KNIGHT_BANNER: art/action_f16_knight.ts, the art chat's, his pick of 31 Oct 2026, “The rallying banner”, and his
// pick of 2 Nov, 08:01, its reach about twice as big, 7 tiles; brought in by the main chat, 2 Nov 2026, behind the same switch, off until
// his yes here). The knight carries it furled on his back (his look, form 0). THE CLEAVE stays his blow (his `attack` now, its numbers the
// game's own). THE BANNER, once a knight: drawn off his back, unfurled, HELD aloft; in two frames driven into the floor before him to his
// left (BANNER_AT, at BANNER_HIT): a SHOCKWAVE, a hero within BANNER.wave of it struck and knocked BANNER.knock (`waveStrikes`). IT STANDS
// (`BANNER_PERIL`): while it stands every enemy within BANNER.reach of it HITS HARDER (by RALLY: game.ts rollMonsterDmg, `rallyOf`); the
// hero's blows cut it down (BANNER_LIFE of them: the rules' `floorBlow`): it shudders as each lands; cut down, its staff splinters, its
// glow goes out, and it is gone. After the move he is his look without it (form 1).
/** The banner standing (x, y where its foot is; `a` the knight's id; `c` the blows on it; `b` when it was last struck, -1 none; `d` when it was cut down, -1 none; t from the plant). */
export const BANNER_PERIL = 'kknight:banner';
/** How much harder those within its reach hit while it stands; how many of the hero's blows cut it down. */
export const RALLY = 1.3;
export const BANNER_LIFE = 3;
const BANNER_ACTS: readonly ActDef[] = [
  { id: 'kknight:cleave', clip: 'attack', long: KN_CLEAVE.long, hit: KN_CLEAVE.hit, dmg: KNIGHT_TUNE.cleave, cooldown: 0, first: 0.5, after: 0.8, near: 0, far: KNIGHT_TUNE.crack.reach - 0.5 },
  { id: 'kknight:banner', clip: 'banner', long: BANNER.long, hit: BANNER_HIT, dmg: 0.6, cooldown: 0, first: 2, after: 0.8, near: BANNER.near, far: BANNER.far },
];
const BANNERED: Act1Rules = {
  gait: GAIT,
  acts: BANNER_ACTS,
  can(_R, m, a) {
    // (one banner a knight)
    return a.id !== 'kknight:banner' || !m.form;
  },
  acting(R, m, a, t0, t1, dt) {
    if (a.id === 'kknight:cleave') return OLD.acting(R, m, a, t0, t1, dt);
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (!at(BANNER_HIT)) return;
    // PLANTED: the shockwave; and it stands
    const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
    if (waveStrikes(r.fwd, r.left) && !h.move && h.invuln <= 0 && !g.over) {
      R.blow(m, a.dmg);
      g.knockHero(m.x + m.fx * BANNER_AT[0], m.y + m.fy * BANNER_AT[0], BANNER.knock);
    }
    const w = beside(m.x, m.y, m.fx, m.fy, act.hand, BANNER_AT[0], BANNER_AT[1]);
    R.peril(m, 'act1', w.x, w.y, { a1: BANNER_PERIL, dur: 1e9, a: m.id, b: -1, c: 0, d: -1 });
    g.emit({ t: 'shake', amount: 4 });
    g.sfx('slam', 0.8);
    m.form = 1;
  },
  floorBlow(R, p, x, y, rad) {
    // THE HERO'S BLOWS CUT IT DOWN
    if (p.a1 !== BANNER_PERIL || p.d >= 0 || Math.hypot(p.x - x, p.y - y) > rad + 0.35) return;
    p.c += 1;
    p.b = p.t;
    if (p.c < BANNER_LIFE) {
      R.g.sfx('hit', 0.4);
      return;
    }
    p.d = p.t;
    p.dur = p.t + 1.6;
    R.g.sfx('shatter', 0.7);
    R.g.msg('The banner is cut down', '#e8b23a');
  },
  died(R, m) {
    // (its knight dead, the banner still stands: the hero must cut it down)
    void R;
    void m;
  },
};
/** HOW MUCH HARDER one hits now: RALLY within the reach of a standing banner (game.ts rollMonsterDmg). */
export function rallyOf(perils: readonly Peril[], m: Monster): number {
  if (!KNIGHT_BANNER.on) return 1;
  for (const p of perils) if (p.kind === 'act1' && p.a1 === BANNER_PERIL && p.d < 0 && p.t >= 0 && Math.hypot(m.x - p.x, m.y - p.y) <= BANNER.reach) return RALLY;
  return 1;
}

const pick = (): Act1Rules => (KNIGHT_BANNER.on ? BANNERED : OLD);
export const RULES: Act1Rules | null = {
  get gait() {
    return pick().gait;
  },
  get acts() {
    return pick().acts;
  },
  can: (R, m, a, dist, los) => pick().can?.(R, m, a, dist, los) ?? true,
  acting: (R, m, a, t0, t1, dt) => pick().acting(R, m, a, t0, t1, dt),
  floorBlow: (R, p, x, y, rad, el) => pick().floorBlow?.(R, p, x, y, rad, el),
};
