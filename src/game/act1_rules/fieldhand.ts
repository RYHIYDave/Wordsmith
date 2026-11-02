// ACT 2, THE HUSH: FLOOR 13, THE MILLRACE: THE HUSHED WORKING THE FIELDS: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", level 13): "Enemies: the Silent Order's carters, and the Hushed working the
// fields." The art chat's pictures (art/fieldhands.ts, fieldhands_moves.ts; docs/mockups/act2_millrace/README.md), made on
// his word of 18 Oct, 21:24 Pacific ("Hey go without my say so.  If something is shit I’ll get it to it but you’re doing
// a great jobs. At least for 11-15"): floor 11's Hushed, here the farm folk outside the walls, still reaping at nothing,
// each a sickle; two of them, A REAPER and A GLEANER. Their shuffle, painted for 0.9 tiles a second; THE SICKLE SLASH, the
// blade raised over the right shoulder glinting pink (the warning, 0.24 to 0.44 s), then hips first, a step in, the blade
// crossing before them from their right to their left at 17/30 of a second, about 1.1 tiles before them; their death the
// Hush leaving them. Small: one attack. His words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's.
//
// WHAT THEY DO, by those (the planning chat's helper's, as the art leaves it to the game: "how hard each blow hits and how
// far, how many come and where"):
// - THE SICKLE SLASH, their one blow: at the moment the blade crosses before them, what is in the strip it sweeps through
//   is struck: before them as far as the blade's middle reaches then (`at`, measured off the picture) and a little more,
//   from their right, where it comes from, across to their left, where it is carried through (`SLASH`).
// - A REAPER OR A GLEANER: each one of the two (Monster.form: 0 the reaper, 1 the gleaner, by its own seed, about half
//   and half), its pictures the art chat's for that one (art/act1_figs/fieldhand.ts `looks`), its name with it.
//
// Every number here that is a picture's is written down here; tests/act2_fieldhand.test.ts holds it to the art.

import { BOOM, BOOM_BACK, BOOM_CATCH, BOOM_HIT, FIELD_HARVEST, boomStrikes } from '../../art/action_f11_field';
import { TILE3 } from '../../art/new_mobs3';
import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import { backView, flipped } from '../facing';
import type { Act1Rules } from './types';

/** THE FIELDHANDS' NUMBERS (tiles before them and to their left; seconds of their pictures). */
export const FIELDHAND = {
  /**
   * The slash: the blade crosses before them at `hit` (FH_SLASH.hit, frame 17 of 30), its middle `at` then (the picture's);
   * what is from `fwd[0]` to `fwd[1]` before them and from `left[0]` (their right, where it comes from) to `left[1]` (their
   * left, where it is carried) at that moment is struck.
   */
  slash: { hit: 17 / 30, at: [1.081, -0.037] as const, fwd: [-0.2, 1.08 + TUNE.heroRadius] as const, left: [-0.7, 0.45] as const },
  /** How many of them are gleaners (the rest reapers), by their own seed; and the gleaner's name for the reaper's word in it. */
  gleaners: 0.5,
  name: ['Reaper', 'Gleaner'] as const,
};

/** Their shuffle, painted for 0.9 tiles a second (FH_PACE); they stop at any frame of it, as the game's monsters on the bones always have. */
const GAIT: GaitDef = { pace: 0.9, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.95, slack: 0.25, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'fieldhand:slash', clip: 'attack', long: 1.3, hit: FIELDHAND.slash.hit, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.3 },
];

/**
 * THE SICKLE BOOMERANG (the art chat's art/action_f11_field.ts behind FIELD_HARVEST, his pick of 2 Nov 2026, 07:46: “Sickle boomerang
 * (Recommended)”, offered as: the sickle thrown spinning out in a wide curve and back to the hand. Dodge it going out and coming back),
 * in place of the slash: drawn back far, the way it will fly marked on the ground from BOOM.mark (a loop out to their left, round, and
 * back on their right); flung at BOOM_HIT, spinning out along the curve and back to the hand at BOOM_CATCH; a hero within BOOM.r of it
 * struck, once going out and once coming back (boomStrikes); caught, they stagger a step back (BOOM_BACK). Its curve drawn as they
 * face in their picture (one of the floor's four ways), so it is thrown straight along that way, the way nearest him (`start`).
 */
const BOOM_ACTS: readonly ActDef[] = [{ id: 'fieldhand:boom', clip: 'attack', long: BOOM.long, hit: BOOM_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.8, near: BOOM.near, far: BOOM.far }];
/** The way their picture faces (one of the floor's four, as backView and flipped choose it). */
function axisOf(fx: number, fy: number): [number, number] {
  const back = backView(fx, fy);
  const flip = flipped(fx, fy);
  return back ? (flip ? [-1, 0] : [0, -1]) : flip ? [0, 1] : [1, 0];
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  get acts() {
    return FIELD_HARVEST.on ? BOOM_ACTS : ACTS;
  },
  start(_R, m, a) {
    if (a.id === 'fieldhand:boom') [m.fx, m.fy] = axisOf(m.fx, m.fy);
  },
  end(R, m, a) {
    // (caught, staggered a step back)
    if (a.id !== 'fieldhand:boom') return;
    const g = R.g;
    const back = BOOM_BACK / TILE3;
    if (g.free(g.level.walk, m.x + m.fx * back, m.y + m.fy * back, Math.min(m.r, 0.42))) {
      m.x += m.fx * back;
      m.y += m.fy * back;
    }
  },
  spawned(_R, m) {
    // (a reaper or a gleaner: by its own seed, the dice the game threw for it as it came into the world)
    const gleaner = (m.seed * 9.73) % 1 < FIELDHAND.gleaners;
    m.form = gleaner ? 1 : 0;
    if (gleaner) m.name = m.name.replace(FIELDHAND.name[0], FIELDHAND.name[1]);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'fieldhand:boom') {
      if (at(BOOM_HIT)) g.sfx('whirl', 0.4);
      if (t1 <= BOOM_HIT || t0 >= BOOM_CATCH) return;
      const h = g.hero;
      const act = m.act!;
      if (h.move || h.invuln > 0 || g.over) return;
      const r = R.rel(m);
      const pass = boomStrikes(Math.min(t1, BOOM_CATCH - 1e-3), r.fwd, r.left);
      const bit = pass === 'out' ? 1 : pass === 'back' ? 2 : 0;
      if (bit && !(act.b & bit)) {
        act.b |= bit;
        R.blow(m, a.dmg);
      }
      return;
    }
    // (the sickle goes up over the shoulder: its swish as it comes down)
    if (at(0.46)) g.sfx('swing', 0.45);
    if (a.id !== 'fieldhand:slash' || !at(a.hit)) return;
    // (the blade crosses before them: what is in its sweep is struck)
    const S = FIELDHAND.slash;
    const r = R.rel(m);
    if (r.fwd >= S.fwd[0] && r.fwd <= S.fwd[1] && r.left >= S.left[0] && r.left <= S.left[1]) R.blow(m, a.dmg);
  },
};
