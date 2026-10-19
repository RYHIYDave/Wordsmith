// ACT 2, THE HUSH: FLOOR 12: THE KING'S RATS: their rules (game/act1_rules/types.ts).
//
// His doc's floor 12, the Undercity (with his yes as ideas): "Enemies: the Hushed, the Silent Order, and things that live in
// the sewers." These are the things that live in the sewers: the King's rats, the sewer's own, swollen on the voices the
// King's brood drank from the Order's broken jars. Their pictures are the art chat's (art/rats.ts, makeRatArt), made on his
// word of 18 Oct, 21:24 Pacific ("Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15"), its notes docs/mockups/act2_undercity/README.md: their stand (sniffing, the head turning);
// LOOKING ROUND (up on the hind legs, forepaws drawn up, and down: "the game's to play now and then from its stand"); their
// scurry, painted for RAT_PACE; THE LEAP AND BITE (crouched, the rump wiggling, the warning; the spring, all four feet off the
// floor, and the snap, 24 of its lengths on, held a tenth; scrambling back to where it was); struck; their death (flipped
// onto the back, the voice puffing out of them, pink going pale). His standing word on the act's enemies: "let’s keep the
// acts separate" (they are the Hush's own, nothing of Act 1's).
//
// WHAT THEY DO, by those (the planning chat's helper's, as the main chat's were for the descent):
// - TINY (game/defs.ts sizeOf): one blow (his rule of 9 Oct, "Tiny and small mobs should have one attack"); in packs of six to
//   ten, as the rubblings come (PACK_BY_SIZE.tiny); never a yellow pack (game/act2_mobs.ts).
// - THE LEAP AND BITE, their blow: it lands at its picture's snap, on whoever is where the rat's jaws go as it springs: from
//   where its mouth is as it crouches to where it snaps, 1.19 tiles before it (measured off the picture: tests/act2_rat.test.ts).
// - THEY SCURRY at their picture's pace, so their feet do not slide; they stop a tile from you and spring from there.
// - LOOKING ROUND, how often (the art left it to the game): while a pack lies in the sewer not yet woken, each rat now and then
//   rears up and looks round, every `LOOK.every` seconds or so, each by its own clock (render/act1_fx/rat.ts draws it so); one
//   woken in the middle of a look finishes it before it comes for you (its head is up: it has seen you).
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and tests/act2_rat.test.ts
// holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { fromFigure } from '../facing';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE RAT'S NUMBERS: its pictures' own (art/rats.ts, in tiles and seconds) and the rules'. */
export const RAT = {
  /**
   * THE LEAP AND BITE (RAT_BITE): as it crouches its mouth is `from` tiles before its floor point; it springs and snaps `to`
   * before it (its body 24 of its lengths on, its jaws before that: measured), at its moment; whoever's middle is within `r`
   * of the way its jaws go is bitten.
   */
  bite: { from: 0.568, to: 1.187, r: 0.5 },
  /** LOOKING ROUND (RAT_LOOK): how long it is, and how often one not yet woken does it (seconds, from one to the next: each rat's own, between these by its seed). */
  look: { long: 1.3, every: [4.5, 8] as const },
};

/** Its scurry (RAT_PACE, RAT_WALK: six frames at twenty-four a second, a round of a quarter second, looping from its stand). */
export const RAT_GAIT: GaitDef = { pace: 2.8, cycle: 0.25, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.0, slack: 0.3, trueBack: true };

export const RAT_ACTS: readonly ActDef[] = [
  // THE LEAP AND BITE (RAT_BITE: 1.0 s, the snap at 0.5)
  { id: 'rat:bite', clip: 'attack', long: 1.0, hit: 0.5, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 1.45 },
];

/** Where a rat not yet woken is in its own round of looking round (seconds into its look; beyond `RAT.look.long`, not looking). */
export function lookPhase(m: { animT: number; seed: number }): number {
  const [lo, hi] = RAT.look.every;
  const every = lo + (hi - lo) * m.seed;
  const t = m.animT + m.seed * 11.3;
  return t - Math.floor(t / every) * every;
}

/** Is it looking round now (up on its hind legs): seconds into its look, or -1. */
export function looking(m: Monster): number {
  if (m.state === 'act') return -1;
  if (m.state === 'sleep') {
    const p = lookPhase(m);
    return p < RAT.look.long ? p : -1;
  }
  return m.a1 && m.a1.look >= 0 ? m.a1.look : -1;
}

export const RULES: Act1Rules | null = {
  gait: RAT_GAIT,
  acts: RAT_ACTS,

  spawned(_R, m) {
    m.a1 = { look: -1, woke: 0 };
  },

  tick(_R, m, dt) {
    const a = m.a1 ?? (m.a1 = { look: -1, woke: 0 });
    // (woken in the middle of looking round: it finishes its look, its head up, before it comes)
    if (!a.woke) {
      a.woke = 1;
      const p = lookPhase(m);
      if (p < RAT.look.long) a.look = p;
    }
    if (a.look < 0) return false;
    a.look += dt;
    if (a.look >= RAT.look.long) {
      a.look = -1;
      return false;
    }
    m.anim = 'idle';
    return true;
  },

  acting(R: BossRules, m: Monster, a: ActDef, t0: number, t1: number): void {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id !== 'rat:bite') return;
    // (the spring: a scrabble of claws)
    if (at(0.36)) g.sfx('swing', 0.2);
    if (!at(a.hit)) return;
    // THE SNAP: whoever is where its jaws have gone, from its crouch to its snap
    const B = RAT.bite;
    const h = g.hero;
    const r = fromFigure(m.x, m.y, m.fx, m.fy, 1, h.x, h.y);
    const along = Math.max(B.from, Math.min(B.to, r.fwd));
    if (Math.hypot(r.fwd - along, r.left) <= B.r) R.blow(m, a.dmg);
    g.sfx('hit', 0.25);
  },
};
