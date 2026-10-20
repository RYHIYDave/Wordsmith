// ACT 2, THE HUSH: FLOOR 15, THE GREAT LIBRARY: THE BOOKWARDENS: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", level 15): "Enemies: the Silent Order in force, and creatures of spilled ink."; its
// layout's "chained books". The art chat's pictures (art/bookwardens.ts, bookwardens_moves.ts, bookwarden_shots.ts;
// docs/mockups/act2_library/README.md), made on his word of 18 Oct 2026, 21:24 Pacific ("Hey go without my say so.  If
// something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"): the Order's men-at-arms, masked
// (nothing of them makes a sound with a mouth), a head over the knight, with THE CHAINED TOME, a great book on a chain from
// an iron haft. Their trudge, painted for 0.85 tiles a second; THE TOME SLAM, the haft heaved up and the tome whirled round
// over their head on its chain, its brass glinting pink (the warning, 0.32 to 0.8), then brought over the top and down
// (its blow at 27/30 of a second), FLAT ON THE FLOOR on its cover at 29/30, its middle about 1.9 tiles before them, held
// there to 1.3; dragged back up by 2.2. Where it lands it shoves a ring of dust out from under it (art/bookwarden_shots.ts
// TOME_REACH 1.2 tiles from its middle, stretched: out of its sides 1.15 of that, along the way they face 0.8 of it).
// Their basic blow. THEIR SECOND, THE PAGE STORM (Version 23.2), the art chat's (mockup/act2-seconds,
// docs/mockups/act2_seconds/README.md: WB_STORM, art/bookwarden_shots.ts), put in the game by the main chat on his word of
// 19 Oct 2026, 20:54 Pacific: "Second attacks are done": the tome caught in the left hand and drawn back, its brass glinting
// pink (the warning; a fan of pink on the floor before them, STORM_REACH out, STORM_HALF either side), then thrust out and
// thrown open, the stolen words tearing out of it in a storm of pages across the fan. The main chat's: the pages strike him
// as their front reaches him, if he is in the fan (once), a blow and two fifths, and push him back a little; every 7 seconds
// at most (his rule of a medium monster's two attacks, the bigger cooling down longer).
//
// WHAT THE ART LEFT TO THE GAME ("how hard each blow hits and how far ... what the tome slam does to the hero, and how wide
// the slam reaches"), the planning chat's helper's picks:
// - THE SLAM harms whoever is within its ring of dust as the tome comes flat on the floor (its picture's moment, `floor`):
//   the dust's own reach round the book's middle, stretched as the dust is (wider out of its sides than along their way),
//   the hero's own size with it; once; and shoves him back off the book a little (`knock` of a heavy blow's step). Close
//   in under the haft (nearer than the book's near edge) the book goes over him: he is not struck. Its cracks and its
//   loose pages lie as the art's mark has them (`mark`), a picture only.
// - THEIR DEATH: the chain snaps and the tome bursts in the air (their picture's): nothing more.
//
// Every number here that is a picture's is written down here; tests/act2_bookwarden.test.ts holds it to the art.

import { TUNE } from '../defs';
import { beside } from '../facing';
import type { ActDef, GaitDef } from '../bosses';
import type { Act1Rules } from './types';

/** THE BOOKWARDENS' NUMBERS (tiles, seconds of their pictures). */
export const BOOKWARDEN = {
  /**
   * The tome slam (art WB_SLAM, 2.2 s): the blow at `hit` (27/30), flat on the floor at `floor` (29/30) with its middle
   * `at` tiles before them and to their left (tomeAt then: 1.86 before them, 0.31 to their right, the haft in the right
   * hand); the dust shoved out to `reach` (TOME_REACH) round it, `side` of that out of its sides and `along` of it along
   * their way (the art's stretch), harming whoever is in it; thrown back `knock`. Its mark lies `mark` (TOME_MARK_FOR).
   */
  slam: { long: 2.2, hit: 27 / 30, floor: 29 / 30, at: [1.864, -0.313] as const, reach: 1.2, side: 1.15, along: 0.8, knock: 0.5, mark: 1.8 },
  /**
   * THE PAGE STORM (art WB_STORM, 2.8 s): the warning `warn` (0.5 to 1.0); the book thrown open at `open`, the pages pouring
   * out `pour` (1.1 to 1.95) across a fan from their feet `reach` (STORM_REACH) out and `half` (STORM_HALF, radians) either
   * side of the way they face, their front out from `from` (STORM_FROM) at `speed` (STORM_SPEED) tiles a second; whoever is in
   * the fan when the front reaches him is struck, and pushed back `knock`.
   */
  storm: { long: 2.8, warn: [0.5, 1.0] as const, hit: 33 / 30, open: 1.1, pour: [1.1, 1.95] as const, from: 1.1, speed: 6.0, reach: 3.4, half: 0.45, knock: 0.6 },
};

/** Their trudge, painted for 0.85 tiles a second (WB_PACE; twelve frames at eight a second); stopped at any frame of it. */
const GAIT: GaitDef = { pace: 0.85, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.7, slack: 0.3, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'bookwarden:slam', clip: 'attack', long: BOOKWARDEN.slam.long, hit: BOOKWARDEN.slam.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 2.4 },
  { id: 'bookwarden:storm', clip: 'storm', long: BOOKWARDEN.storm.long, hit: BOOKWARDEN.storm.hit, dmg: 1.4, cooldown: 7, first: 2.5, after: 0.8, near: 0, far: 3.2 },
];

/** Where the tome comes down, from one who faces (fx, fy) at (x, y) drawn with `hand`: the book's middle on the floor. */
export function tomeSpot(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  const S = BOOKWARDEN.slam;
  return beside(m.x, m.y, m.fx, m.fy, hand, S.at[0], S.at[1]);
}

/** Is (x, y) inside the slam's ring of dust round the book at (bx, by), they facing (fx, fy), with `pad` more all round? */
export function inDust(bx: number, by: number, fx: number, fy: number, x: number, y: number, pad = 0): boolean {
  const S = BOOKWARDEN.slam;
  const dx = x - bx;
  const dy = y - by;
  const u = dx * fx + dy * fy;
  const v = dx * fy - dy * fx;
  const ru = S.reach * S.along + pad;
  const rv = S.reach * S.side + pad;
  return (u * u) / (ru * ru) + (v * v) / (rv * rv) <= 1;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  acting(R, m, a, t0, t1) {
    if (a.id === 'bookwarden:storm') {
      // THE PAGE STORM: its front out across the fan; whoever is in it when the front reaches him is struck, once
      const g = R.g;
      const h = g.hero;
      const act = m.act!;
      const W = BOOKWARDEN.storm;
      if (t0 < W.warn[0] && t1 >= W.warn[0]) g.sfx('swing', 0.4);
      if (t0 < W.open && t1 >= W.open) g.sfx('fire', 0.5);
      if (act.b || t1 <= W.pour[0] || t0 >= W.pour[1]) return;
      const fwd = (h.x - m.x) * m.fx + (h.y - m.y) * m.fy;
      const side = (h.x - m.x) * m.fy - (h.y - m.y) * m.fx;
      const d = Math.hypot(fwd, side);
      const front = Math.min(W.reach, W.from + W.speed * (Math.min(t1, W.pour[1]) - W.pour[0]));
      const inFan = fwd > 0 && Math.abs(Math.atan2(side, fwd)) <= W.half + TUNE.heroRadius / Math.max(1, d) && d <= W.reach + TUNE.heroRadius * 0.5;
      if (!inFan || d > front + TUNE.heroRadius * 0.5 || h.move || h.invuln > 0 || g.over) return;
      act.b = 1;
      const was = h.life;
      R.blow(m, a.dmg);
      if (h.life < was) g.knockHero(m.x, m.y, W.knock);
      return;
    }
    if (a.id !== 'bookwarden:slam') return;
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const S = BOOKWARDEN.slam;
    if (at(0.32)) g.sfx('swing', 0.5);
    if (!at(S.floor)) return;
    // FLAT ON THE FLOOR: whoever is in its dust is struck, and shoved back off the book
    const b = tomeSpot(m, act.hand);
    if (inDust(b.x, b.y, m.fx, m.fy, h.x, h.y, TUNE.heroRadius * 0.5)) {
      const was = h.life;
      R.blow(m, a.dmg);
      if (h.life < was) g.knockHero(b.x, b.y, S.knock);
    }
    // (its cracks and loose pages, the art's mark, drawn by render/act1_fx/bookwarden.ts)
    R.peril(m, 'act1', b.x, b.y, { a1: 'bookwarden:mark', hit: 0, dur: S.mark, done: 1 });
    g.emit({ t: 'shake', amount: 3 });
    g.sfx('slam', 0.75);
  },
};

/** (for the tests) Their acts. */
export const BOOKWARDEN_ACTS = ACTS;
