// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: THE HUSHED GARDENERS (and what they share with the grooms, their
// rules game/act1_rules/groom.ts): their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2, Part Two: The High City (Levels 16–20)", level 16): "Enemies: the Hushed gardeners and grooms, the
// palace guard, and the swans." His answers to the art chat (28 Oct 2026; docs/mockups/swan_gardens/README.md): who, “A gardener
// and a groom (Recommended)”; their size, “Knight's size, in crowds (Recommended)”; how they move, “Rush at you”; their
// attack, “Shears snap, fork jab (Recommended)”; their death, “The Hush leaves them (Recommended)”; their sound, “Silent but
// their tools (Recommended)”; and to their pictures, “Yes, they're right (Recommended)”. The art chat's pictures
// (art/palace_hands.ts, palace_hands_moves.ts): STANDING, at their work till they see you (the gardener clipping at a hedge that
// is not there, the groom leaning on his fork): their stand, which is what a sleeping one shows; THE RUSH, painted for PH_PACE
// (1.6) tiles a second, ten frames at fifteen a second, each foot down half of it; THE GARDENER'S SHEARS SNAP (PH_BLOW, 1.3 s):
// lifted, raised high over his head and opened wide, the blades glinting pink, held shaking (THE WARNING, 0.26 to 0.48 s); hips
// first, a step in, driven down and out and snapped shut at 18/30 of a second (THE BLOW), a little over a tile before him;
// carried through low; back to his work. Struck, 0.4 s; THE HUSH LEAVES THEM (PH_DIES, 2.2 s), all in their pictures. Small: one
// attack each.
//
// WHAT THEY DO, by those (the main chat's helper's, as the art leaves it to the game):
// - THE SHEARS SNAP, the gardener's one blow: at its moment, whoever is in the strip before him, from his breast out past where
//   the blades shut (`snap.at`, their middle then, measured off the picture: shearsOf) and on through where they are carried
//   (`snap.out`) by `snap.more`, and `snap.half` to either side of where they shut, is struck. His rule of 28 Oct (“And bigger
//   AOE to compensate for the extra time the player gets to evade”): bigger than the Hush's like kind's (floor 13's sickle slash,
//   about 1.4 tiles before them and a tile and a sixth across): this one 1.72 before him and 1.6 across. Through his wind-up the
//   strip is marked on the floor in the enemy's pink (render/act1_fx/gardener.ts).
// - A CROWD OF THE TWO (his “Knight's size, in crowds”, “A gardener and a groom”): a pack of either is laid mixed, each one of it
//   a gardener or a groom in turn by its number in the game (as the Hushed townsfolk's three looks are given), so that a crowd
//   comes at you half shears and half forks. (The two are kinds of their own, each its own rules and pictures and death; the
//   same body, life, blow and rush: game/defs.ts MONSTERS.) One spawned alone (not of a pack) stays as it was asked for.
//
// Every number here that is a picture's is written down here; tests/act2_palace_hands.test.ts holds it to the art.

import { MONSTERS } from '../defs';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { MonsterKind } from '../types';
import type { Act1Rules } from './types';
import { CLIP_CANVAS, GARDENER_HEDGE, LUNGE, LUNGE_HIT, LUNGE_TRAVEL_TILES, lungeStrikes, snapAt } from '../../art/action_f16_gardener';
import { beside, fromFigure } from '../facing';

/** THE HUSHED GARDENERS' AND GROOMS' NUMBERS (tiles before them and to their left; seconds of their pictures). */
export const PALACE = {
  /** Their rush's pace (PH_PACE, tiles a second), and its round (PH_RUN: ten frames at fifteen a second). */
  pace: 1.6,
  round: 10 / 15,
  /** Their blows (PH_BLOW, the same timing for both): how long, the warning held from and to, the blow's moment. */
  blow: { long: 1.3, warn: [0.26, 0.48] as const, hit: 18 / 30 },
  /**
   * THE SHEARS SNAP: the blades' middle `at` as they shut (shearsOf(...).mid at the blow), carried on through to `out` before him;
   * struck, whoever is from `from` before him to `out` and `more` beyond, within `half` of the line the blades shut on.
   */
  snap: { at: [1.143, 0.158] as const, out: 1.223, from: -0.2, more: 0.5, half: 0.8 },
  /**
   * THE FORK JAB: the tines' tip `at` as it is jabbed out (forkOf(...).tip at the blow), carried on through to `out` before him;
   * struck, whoever is from `from` before him to `out` and `more` beyond, within `half` of the fork's line: a longer, narrower
   * strip than the shears'.
   */
  jab: { at: [1.53, -0.096] as const, out: 1.668, from: -0.2, more: 0.5, half: 0.6 },
};

/** A blow's strip before one of them: from `from` to `to` tiles before him, from `left0` to `left1` to the left he is drawn with. */
export interface Strip {
  from: number;
  to: number;
  left0: number;
  left1: number;
}
/** The strip the shears snap shut on. */
export const SNAP_STRIP: Strip = { from: PALACE.snap.from, to: PALACE.snap.out + PALACE.snap.more, left0: PALACE.snap.at[1] - PALACE.snap.half, left1: PALACE.snap.at[1] + PALACE.snap.half };
/** The strip the fork is jabbed along. */
export const JAB_STRIP: Strip = { from: PALACE.jab.from, to: PALACE.jab.out + PALACE.jab.more, left0: PALACE.jab.at[1] - PALACE.jab.half, left1: PALACE.jab.at[1] + PALACE.jab.half };

/** Is the hero in strip `s` of one of them as it strikes? */
export function inStrip(R: BossRules, m: Monster, s: Strip): boolean {
  const r = R.rel(m);
  return r.fwd >= s.from && r.fwd <= s.to && r.left >= s.left0 && r.left <= s.left1;
}

/**
 * Their rush, ten frames round; they stop only where a foot comes down (each half of the round), and so a little nearer than
 * they mean to. Who stops where: a gardener a tile off, a groom a little further (his fork is longer).
 */
export function palaceGait(stopAt: number): GaitDef {
  return { pace: PALACE.pace, cycle: PALACE.round / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt, slack: 0.3, trueBack: true };
}

/** A CROWD OF THE TWO: one laid in a pack is a gardener or a groom in turn by its number, its name with it. */
export function mixCrowd(m: Monster): void {
  if (m.packId < 0) return;
  const want: MonsterKind = m.id % 2 === 0 ? 'gardener' : 'groom';
  if (m.kind === want) return;
  m.name = m.name.replace(MONSTERS[m.kind].name, MONSTERS[want].name);
  m.kind = want;
}

const ACTS: readonly ActDef[] = [
  // (made from no further than the strip reaches with half a round of his rush to spare: wherever he stops, it reaches the hero)
  { id: 'gardener:snap', clip: 'attack', long: PALACE.blow.long, hit: PALACE.blow.hit, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.5 },
];

const OLD: Act1Rules = {
  gait: palaceGait(1.0),
  acts: ACTS,
  spawned(_R, m) {
    mixCrowd(m);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    // (silent but their tools: the shears' rush through the air as they are driven down at you)
    if (at(PALACE.blow.hit - 0.08)) g.sfx('swing', 0.4);
    if (a.id !== 'gardener:snap' || !at(a.hit)) return;
    // (the blades snap shut before him: whoever is in the strip they are driven down along is struck)
    if (inStrip(R, m, SNAP_STRIP)) R.blow(m, a.dmg);
  },
};

// THE SHEAR LUNGE (GARDENER_HEDGE: art/action_f16_gardener.ts, the art chat's, his pick of 2 Nov 2026, 07:46, “Shear lunge”, in place of
// the hedge cut he had said yes to on 31 Oct; brought in by the main chat, 2 Nov 2026, behind the same switch, off until his yes here).
// His one attack: sunk into a deep crouch, the shears out low and opened their widest, the lane marked before him (from LUNGE.mark),
// HELD; in two frames flung low and long through the air, the blades SNAPPING SHUT at its end (LUNGE_HIT): whoever is in the lane
// (LUNGE.lane long, LUNGE.half to either side) or within LUNGE.snap of where they shut is struck (`lungeStrikes`, from where he began);
// a spray of cut grass there (`CLIP_PERIL`); stumbling on, straightened, LUNGE_TRAVEL_TILES on from where he began (the game moves him
// there as it ends). He rushes in to where he can lunge (no further than LUNGE.far), and lunges only where the lawn is clear before him.
/** The spray of cut grass where the blades snap shut (its clock from the snap). */
export const CLIP_PERIL = 'gardener:clip';
const LUNGE_ACTS: readonly ActDef[] = [{ id: 'gardener:lunge', clip: 'attack', long: LUNGE.long, hit: LUNGE_HIT, dmg: 1.1, cooldown: 0, first: 0, after: 0.8, near: 0, far: LUNGE.far }];
/** Whether the lawn is clear for him to be flung across and stumble on, from (x, y) the way (fx, fy). */
function clearLunge(R: BossRules, m: Monster, fx: number, fy: number): boolean {
  const g = R.g;
  for (let d = 0.3; d <= LUNGE_TRAVEL_TILES + 0.2; d += 0.25) if (!g.free(g.level.walk, m.x + fx * d, m.y + fy * d, Math.min(m.r, 0.35))) return false;
  return true;
}
const LUNGER: Act1Rules = {
  gait: palaceGait(2.6),
  acts: LUNGE_ACTS,
  spawned: OLD.spawned,
  can(R, m, _a, dist) {
    const h = R.g.hero;
    return clearLunge(R, m, (h.x - m.x) / (dist || 1), (h.y - m.y) / (dist || 1));
  },
  start(_R, m) {
    // (where he began: the lane and the snap are from there)
    m.act!.a = m.x;
    m.act!.b = m.y;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (at(LUNGE_HIT - 0.12)) g.sfx('swing', 0.5);
    if (!at(LUNGE_HIT)) return;
    const r = fromFigure(act.a, act.b, m.fx, m.fy, act.hand, h.x, h.y);
    if (lungeStrikes(r.fwd, r.left) && !h.move && h.invuln <= 0 && !g.over) R.blow(m, a.dmg);
    const [sx, sy] = snapAt();
    const w = beside(act.a, act.b, m.fx, m.fy, act.hand, sx, sy);
    R.peril(m, 'act1', w.x, w.y, { a1: CLIP_PERIL, dur: 1.8 });
    g.sfx('slam', 0.35);
  },
  end(R, m) {
    // (stumbled on and straightened, LUNGE_TRAVEL_TILES on: he is moved there, as far as the lawn lets him)
    const g = R.g;
    const act = m.act;
    const x0 = act ? act.a : m.x;
    const y0 = act ? act.b : m.y;
    for (let d = LUNGE_TRAVEL_TILES; d >= 0; d -= 0.1) {
      if (!g.free(g.level.walk, x0 + m.fx * d, y0 + m.fy * d, Math.min(m.r, 0.42))) continue;
      m.x = x0 + m.fx * d;
      m.y = y0 + m.fy * d;
      break;
    }
  },
};
void CLIP_CANVAS;

const pick = (): Act1Rules => (GARDENER_HEDGE.on ? LUNGER : OLD);
export const RULES: Act1Rules | null = {
  get gait() {
    return pick().gait;
  },
  get acts() {
    return pick().acts;
  },
  spawned: (R, m) => pick().spawned?.(R, m),
  can: (R, m, a, dist, los) => pick().can?.(R, m, a, dist, los) ?? true,
  start: (R, m, a) => pick().start?.(R, m, a),
  acting: (R, m, a, t0, t1, dt) => pick().acting(R, m, a, t0, t1, dt),
  end: (R, m, a) => pick().end?.(R, m, a),
};

/** Its switch, for game/enemy_moves.ts (the new enemy moves of floors 5 to 19 switched on together). */
export { GARDENER_HEDGE };
