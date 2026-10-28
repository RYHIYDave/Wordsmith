// THE WARLOCK (the main chat, from 28 Oct 2026). His design is the owner's, made with the art chat (docs/mockups/classes/
// BRIEF.md on branch mockup/classes); the rules here are the main chat's reading of it, the numbers his to try and change.
//
// The owner, 23 Oct 2026: “Warlock is str/int, will transform into a demon so keep that in mind”. Asked to put him in the
// game, 28 Oct, to the main chat: “We need to shelf this opening cinematic.  Art has been working on 3 new characters and we
// need them put in the game”, and of the three, “Warlock first”.
//
// AS A MAN (his words of 25 Oct): his tap, “Hellfire bolt (Recommended)”; his tap and hold, “I was thinking tap does a single
// target shot that hits an enemy and does a relatively strong DOT.  The tap and hold is an AOE that curses all enemies with a
// smaller DOT.  If a cursed enemy dies, it spreads all DOTs to other enemies in range.  So the play pattern is: try to get the
// tap DOT to spread via the curse.”; his swipe, “I like smoke step, and we can have that apply the curse as well”.
//   THE HELLFIRE BOLT (defs.ts SKILLS.hellbolt, a shot): what it hits burns in his hellfire, hard (HELL).
//   THE CURSE (kind 'curse'): every enemy near him is struck a little and cursed: it smoulders (CURSE), and when a cursed one
//     dies, every burn on it (his hellfire, the curse, fire, poison, bleeding) spreads to the enemies near it (SPREAD).
//   THE SMOKE STEP (kind 'smoke'): he streaks to a spot as smoke; nothing can hit him, and whoever he passes through is cursed.
//
// THE CHANGE (his words): “He’ll have a tap and a hold, the meter will charge, then something will give the player an
// indication that the meter is full, like he’s flashing red or cyan or his demon arm starts glowing, then you tap on the
// warlock and he transforms.”; the sign, “Arm blazes cyan (Recommended)”. His hits fill the PACT; full, a tap on him changes
// him (Controls.change); while he is the demon it runs dry, and empty, “Meter runs dry (Recommended)”, the demon “Burns out
// (Recommended)” and he is a man again.
//
// THE DEMON: its tap, “Claw rakes (Recommended)”, cursing what they hit (“So I think the tap claw rake has to apply the curse
// as well”); its tap and hold, DAMNING (“I want it to be called DAMN or DAMNING”), “Cash-in eruption (Recommended)”: the
// ground erupts under every one cursed or burning near it, and all their burns go off at once (“you can’t just take the
// enemies away, what if it doesn’t do enough damage to kill them?”: they are thrown, and stay unless it kills them); its
// swipe, “Smoke step (Recommended)”, the violent one: it rakes and curses whoever it passes through and bursts out at the end.

import type { SkillId } from './defs';
import type { ClassId } from './types';
import { CLASS_IDS } from './types';

/** THE WARLOCK OFFERED: on, a new hero may be made as him (the class cards). Off until the owner has played him and said yes. */
export const WARLOCK = { on: false };

/** The classes a new hero may be made as. */
export function playableClasses(): readonly ClassId[] {
  return WARLOCK.on ? [...CLASS_IDS, 'warlock'] : CLASS_IDS;
}

/** The demon's three, in the places of his (its words are his: they belong to the place, not to the move). */
export const DEMON_KIT: readonly [SkillId, SkillId, SkillId] = ['rake', 'damning', 'demonstep'];

/** What each of his burns and his pact come to (starting numbers, his to try and change). */
export const WARLOCK_TUNE = {
  /** THE HELLFIRE BOLT's burn: a share of the bolt's hit each second, for this long. Twice the hit over four seconds: “a relatively strong DOT”. */
  hell: { share: 0.5, secs: 4 },
  /** THE CURSE's smoulder: a share of the curse's own hit each second, for this long (“a smaller DOT”). */
  curse: { share: 0.4, secs: 6 },
  /** A cursed one dying spreads every burn on it to the enemies within this many tiles of it. */
  spread: { r: 3.5 },
  /** THE PACT: full at `full`; each hit of his as a man fills `hit`; as the demon it runs dry in `demonSecs`, each of its hits putting back `demonHit`. */
  pact: { full: 30, hit: 1, demonSecs: 18, demonHit: 0.2 },
  /** THE CHANGE, man to demon, and the burning out, demon to man: seconds, nothing harming him meanwhile; the demon's roar throws back what is within `roar` tiles. */
  change: { secs: 2.4, roar: 2.6 },
  burnOut: { secs: 2.0 },
  /** DAMNING: what it pays out of each burn still to come (all of it), and how far it throws what it strikes. */
  damning: { pay: 1, throw: 1.6 },
  /** The smoke steps: seconds to go their length; the demon's knocks aside what it passes and bursts at the end in this radius, at this share of its hit. */
  step: { secs: 0.28, demonSecs: 0.3, aside: 1.2, burst: 1.6, burstShare: 0.6 },
} as const;
