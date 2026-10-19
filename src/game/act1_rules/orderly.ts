// ACT 2, THE HUSH: FLOOR 14, THE HOUSE OF QUIET: THE PHYSICIAN'S ORDERLIES: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", the planning chat's, with his yes as ideas), level 14: "Enemies: Hushed patients
// who sit up in their beds as you pass, and the Physician's orderlies". Medium. Their pictures are the art chat's
// (art/orderlies.ts, orderlies_moves.ts, orderly_shots.ts; docs/mockups/act2_housequiet/README.md), made on his word to it of
// 18 Oct, 21:24 Pacific ("Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs.
// At least for 11-15"), read by the planning chat as his yes to go in, anything he flags mended: the House of Quiet's
// attendants in the Order's service, a head over the knight, THE QUIETING MALLET on the right shoulder; their heavy trudge
// (OD_PACE); and THE MALLET BLOW (OD_BLOW): lifted off the shoulder and raised high over the head, held shaking, its hoops
// glinting pink (the warning, 0.38 to 0.66); hips first, a step in, brought down over the top: THE BLOW at 25/30, IN THE
// FLOOR at 27/30 about 1.4 tiles before them, dust and splinters thrown up there; held, bent over it; heaved back up onto
// the shoulder. Its mark on the floor (art/orderly_shots.ts drawMalletSlam): a ring of dust rolling out SLAM_REACH, a star
// of cracks left in the boards fading by SLAM_CRACKS_FOR.
//
// WHAT IS THE RULES' (the art chat's "What is yours"), the planning chat's helper's picks, to be told him:
// - THE MALLET BLOW lands at its picture's blow (25/30) on whoever is under it as it comes down over the top: within
//   `blow.r` of where its head strikes the floor (`blow.at`, measured off the art at 27/30), or in its way there, before
//   them; with all their weight: a full blow and a little knock back (`blow.knock` of a Heavy blow's step). The floor
//   shakes as it goes in (27/30), and its mark lies there (`orderly:slam`, drawn by render/act1_fx/orderly.ts).
// - TWO ATTACKS, his rule (his rulebook, "Their attacks"): the art drew the orderlies one, the mallet blow, their basic
//   blow; their second is THE HELD BLOW (the main chat's, 19 Oct, game/act1_rules/held.ts): the same picture, the mallet
//   held up shaking two rounds longer, a red circle where it will come down (the art's ring of dust, SLAM_REACH 1.1 tiles,
//   and a little), and over all of it a blow and a half and a full Heavy step's throw; every 7 seconds at most.
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act2_orderly.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { dropCircle, fillCircle, heldAct, heldTime, landCircle, layCircle, tidyCircle } from './held';
import { TUNE } from '../defs';
import { beside, fromFigure } from '../facing';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE ORDERLIES' NUMBERS (tiles, seconds of their pictures). */
export const ORDERLY = {
  /**
   * THE MALLET BLOW (OD_BLOW): its blow at `hit` (25/30), in the floor at `floor` (27/30); where its head strikes the floor
   * then, tiles before them and to the left they are drawn with (art/orderlies.ts malletOf at 27/30); whoever is within `r`
   * of there, or in its way (from `from` tiles before them to there, `half` to either side), is struck, and knocked back
   * `knock` of a Heavy blow's step. Its mark lies `mark` seconds (SLAM_CRACKS_FOR).
   */
  blow: { hit: 25 / 30, floor: 27 / 30, at: [1.4398, -0.1219] as const, r: 0.75, from: 0.3, half: 0.5, knock: 0.5, mark: 1.6 },
};

/** Their trudge, painted for 0.8 tiles a second (OD_PACE: twelve frames at eight a second); they stop at any frame of it, as their pictures hand over from any. */
export const ORDERLY_GAIT: GaitDef = { pace: 0.8, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.3, slack: 0.3, trueBack: true };

/** Their basic blow, and THE HELD BLOW (held.ts): the warning (OD_BLOW.warn, 0.38 to 0.66: the mallet up, shaking) played round twice more. */
const BLOW: ActDef = { id: 'orderly:blow', clip: 'attack', long: 2.1, hit: ORDERLY.blow.hit, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.9 };
export const ORDERLY_HELD = { warn: [0.38, 0.66] as const, rounds: 2, r: 1.2, dmg: 1.6, knock: 1.0, cooldown: 7, first: 2.5 };
export const ORDERLY_ACTS: readonly ActDef[] = [
  BLOW,
  heldAct(BLOW, 'orderly:held', ORDERLY_HELD.warn, ORDERLY_HELD.rounds, ORDERLY_HELD.dmg, ORDERLY_HELD.cooldown, ORDERLY_HELD.first),
];

/** Where the mallet's head strikes the floor, from one that strikes facing (fx, fy), drawn with `hand`. */
export function slamSpot(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, hand, ORDERLY.blow.at[0], ORDERLY.blow.at[1]);
}

export const RULES: Act1Rules | null = {
  gait: ORDERLY_GAIT,
  acts: ORDERLY_ACTS,

  start(R, m, a) {
    // (THE HELD BLOW: its red circle where the mallet will come down, from the start)
    if (a.id !== 'orderly:held') return;
    const s = slamSpot(m, m.act!.hand);
    layCircle(R, m, s.x, s.y, ORDERLY_HELD.r);
  },
  tick(R, m) {
    tidyCircle(R, m, 'orderly:held');
    return false;
  },
  died(R, m) {
    dropCircle(R, m);
  },

  acting(R: BossRules, m: Monster, a, t0, t1) {
    if (a.id !== 'orderly:blow' && a.id !== 'orderly:held') return;
    const held = a.id === 'orderly:held';
    if (held && t1 < a.hit) fillCircle(R, m, a, t1);
    // (the held blow is the basic blow's picture with its warning played round: its moments are the basic blow's, after it)
    if (held) {
      t0 = heldTime(a, t0);
      t1 = heldTime(a, t1);
    }
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const B = ORDERLY.blow;
    if (held && at(B.hit)) {
      landCircle(R, m, a, ORDERLY_HELD.knock);
      g.sfx('swing', 0.7);
    } else if (at(B.hit)) {
      // (brought down over the top: whoever is under it, where it goes into the floor or in its way there)
      const s = slamSpot(m, act.hand);
      const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
      const onIt = Math.hypot(h.x - s.x, h.y - s.y) <= B.r + TUNE.heroRadius * 0.5;
      const inWay = r.fwd >= B.from && r.fwd <= B.at[0] && Math.abs(r.left - B.at[1]) <= B.half;
      if ((onIt || inWay) && !h.move && h.invuln <= 0 && !g.over) {
        R.blow(m, a.dmg);
        g.knockHero(m.x, m.y, B.knock);
      }
      g.sfx('swing', 0.6);
    }
    if (at(B.floor)) {
      // (in the floor: the boards cracked, the dust rolling out, a mark left)
      const s = slamSpot(m, act.hand);
      R.peril(m, 'act1', s.x, s.y, { a1: 'orderly:slam', dur: B.mark });
      g.emit({ t: 'shake', amount: 3 });
      g.sfx('slam', 0.7);
    }
  },
  // (its mark on the floor is a picture only, gone at its end: no step of its own)
};
