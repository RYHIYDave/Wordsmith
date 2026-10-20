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
// - TWO ATTACKS, his rule (his rulebook, "Their attacks"): the mallet blow, their basic blow; and THE QUAKE, the art chat's
//   second move for them (mockup/act2-seconds, docs/mockups/act2_seconds/README.md: OD_QUAKE, art/orderly_shots.ts), put in
//   the game by the main chat on his word of 19 Oct 2026, 20:54 Pacific: "Second attacks are done". The mallet raised high,
//   crouched under it, its hoops glinting pink (the warning; its ring on the floor, QUAKE_REACH round where it will come
//   down); they leap, and the mallet and their feet hit the floor together (37/30), its head 1.48 tiles before them. The
//   main chat's: whoever is within the ring as it goes in is struck, a blow and a half, and thrown out from it a whole Heavy
//   blow's step; every 7 seconds at most (the bigger hit cooling down longer, his rule).
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act2_orderly.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
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
  /**
   * THE QUAKE (OD_QUAKE): the warning `warn` (0.5 to 0.86); the leap `jump`; the blow at `hit` (36/30) and the mallet in the
   * floor at `floor` (37/30), its head `at` tiles before them and to the left they are drawn with (1.48 on, 0.12 to their
   * right, the art's measure); whoever is within `r` of there (QUAKE_REACH, the ring its dust rolls out to) is struck and
   * thrown `knock` of a Heavy blow's step out from it. Its cracks lie `mark` seconds (QUAKE_CRACKS_FOR).
   */
  quake: { long: 2.7, warn: [0.5, 0.86] as const, jump: [0.93, 1.23] as const, hit: 36 / 30, floor: 37 / 30, at: [1.48, -0.12] as const, r: 2.2, knock: 1.0, mark: 2.0 },
};

/** Their trudge, painted for 0.8 tiles a second (OD_PACE: twelve frames at eight a second); they stop at any frame of it, as their pictures hand over from any. */
export const ORDERLY_GAIT: GaitDef = { pace: 0.8, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.3, slack: 0.3, trueBack: true };

/** Their basic blow, the mallet; and THE QUAKE, when he is within its ring, every 7 seconds at most. */
export const ORDERLY_ACTS: readonly ActDef[] = [
  { id: 'orderly:blow', clip: 'attack', long: 2.1, hit: ORDERLY.blow.hit, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.9 },
  { id: 'orderly:quake', clip: 'quake', long: ORDERLY.quake.long, hit: ORDERLY.quake.hit, dmg: 1.5, cooldown: 7, first: 2.5, after: 0.9, near: 0, far: 3.0 },
];

/** Where the quake's mallet strikes the floor, from one that strikes facing (fx, fy), drawn with `hand`: the middle of its ring. */
export function quakeSpot(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, hand, ORDERLY.quake.at[0], ORDERLY.quake.at[1]);
}

/** Where the mallet's head strikes the floor, from one that strikes facing (fx, fy), drawn with `hand`. */
export function slamSpot(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, hand, ORDERLY.blow.at[0], ORDERLY.blow.at[1]);
}

export const RULES: Act1Rules | null = {
  gait: ORDERLY_GAIT,
  acts: ORDERLY_ACTS,

  acting(R: BossRules, m: Monster, a, t0, t1) {
    if (a.id === 'orderly:quake') {
      quaking(R, m, t0, t1, a.dmg);
      return;
    }
    if (a.id !== 'orderly:blow') return;
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const B = ORDERLY.blow;
    if (at(B.hit)) {
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

/** THE QUAKE, from `t0` to `t1` of it: the leap, then the mallet and their feet in the floor, the ring of it shaken out. */
function quaking(R: BossRules, m: Monster, t0: number, t1: number, dmg: number): void {
  const g = R.g;
  const h = g.hero;
  const Q = ORDERLY.quake;
  const at = (T: number): boolean => t0 < T && t1 >= T;
  if (at(Q.jump[0])) g.sfx('swing', 0.7);
  if (!at(Q.floor)) return;
  const s = quakeSpot(m, m.act!.hand);
  if (Math.hypot(h.x - s.x, h.y - s.y) <= Q.r + TUNE.heroRadius * 0.5 && !h.move && h.invuln <= 0 && !g.over) {
    const was = h.life;
    R.blow(m, dmg);
    if (h.life < was) g.knockHero(s.x, s.y, Q.knock);
  }
  // (the floor shaken out round it, its cracks left lying: render/act1_fx/orderly.ts)
  R.peril(m, 'act1', s.x, s.y, { a1: 'orderly:quake', dur: Q.mark });
  g.emit({ t: 'shake', amount: 6 });
  g.sfx('slam', 1.0);
}
