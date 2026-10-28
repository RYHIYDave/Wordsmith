// THE BRAWLER (the main chat, from 28 Oct 2026). His design is the owner's, made with the art chat (docs/mockups/classes/
// BRIEF.md, HANDBACK.md); the rules here are the main chat's reading of it, the numbers his to try and change.
//
// His brief, 23 Oct 2026: “Bare-knuckle boxer”, “Light and bouncy”, “Bone-crunching (Recommended)”. His attacks, 24 Oct (in
// the art chat): “I want him to have combos using his tap and tap+hold.  So maybe tap is jab and tap+hold is cross.  Then
// tap>tap>tap+hold would be the combo you’re talking about”; “Yeah but let’s make it all three hit combos, so tap, tap, tap is
// a combo, tap, tap, tap+hold is a different combo”; how they are built, “By position (Recommended)” (1st hit, tap jab, hold
// cross; 2nd, tap hook, hold body blow; 3rd, tap uppercut, hold haymaker; any mix a combo, 8 in all); then “What happens when
// you just tap+hold?  I feel like that should have some weight.  Then hold, hold should be stronger.  Hold, hold, hold should
// be a massive slow combo that ends with some crazy punch that like sends whatever it hits out like a projectile or
// something.  I need a three tap combo to be much different than a three hold combo”; what each is for, “One target vs a
// crowd (Recommended)”: TAP, TAP, TAP for one enemy (the fastest damage on the one in front, any of its hits cancelled into
// the slip, the uppercut popping it up stunned); HOLD, HOLD, HOLD for a crowd (slow, he can be hit while he winds up, every
// blow knocks back; the body blow staggers all of them round him, and the last fires the one in front down the whole line,
// bowling over each it meets). The punches' names float over him as they land (his words: “Maybe we can have the names of
// each punch float over the character”; to them, “Good for now”). His swipe, “Slip and counter (Recommended)”, “Weaving
// dash, same reach (Recommended)”: he bobs and weaves up to 6 tiles the way you swipe, untouchable, and comes up with a
// counter hook into whatever is there.
//
// THE PUNCH A PRESS MAKES is by its place in the combo (the art chat's dev/brawler_punches.ts punchFor): the 1st a jab
// (tap) or a cross (hold); the 2nd a hook or a body blow; the 3rd an uppercut, or an overhand, or after two holds the
// haymaker. A press comes as the next of the combo while the one before is being seen out or soon after (COMBO_GAP); else
// the combo begins again.

import type { ClassId } from './types';

/** A page built to try him out says so (esbuild's define): the Brawler offered from the start. */
declare const __BRAWLER__: boolean | undefined;
/** THE BRAWLER OFFERED: on, a new hero may be made as him (the class cards). Off until the owner has played him and said yes. */
export const BRAWLER = { on: typeof __BRAWLER__ !== 'undefined' && __BRAWLER__ === true };

export const isBrawler = (cls: ClassId): boolean => cls === 'brawler';

/** His punches. */
export type PunchName = 'jab' | 'hook' | 'uppercut' | 'cross' | 'body blow' | 'overhand' | 'haymaker' | 'counter';

/**
 * Each punch: its wind-up and its follow-through (seconds: the art's, dev/brawler_punches.ts, a frame a thirtieth); its share
 * of the ability's hit; how far it reaches (tiles, to the enemy's edge); and what else it does: `stun` the one it hits
 * (seconds), `throw` it (tiles), `round` strike all within so far of him and `stagger` them (seconds), `launch` the one it
 * hits down the line as a cannonball. `big`: how its name is shown (0 a tap's, 1 a hold's, 2 the biggest).
 */
export const PUNCHES: Record<PunchName, { windup: number; follow: number; share: number; reach: number; stun?: number; throw?: number; round?: number; stagger?: number; launch?: boolean; big: 0 | 1 | 2 }> = {
  jab: { windup: 4 / 30, follow: 8 / 30, share: 0.55, reach: 1.7, big: 0 },
  hook: { windup: 5 / 30, follow: 10 / 30, share: 0.7, reach: 1.7, big: 0 },
  uppercut: { windup: 7 / 30, follow: 16 / 30, share: 1.2, reach: 1.7, stun: 0.9, big: 0 },
  cross: { windup: 10 / 30, follow: 14 / 30, share: 1.3, reach: 1.9, throw: 0.7, big: 1 },
  'body blow': { windup: 10 / 30, follow: 14 / 30, share: 0.9, reach: 1.9, round: 1.9, stagger: 0.6, throw: 0.4, big: 1 },
  overhand: { windup: 12 / 30, follow: 17 / 30, share: 1.7, reach: 1.9, throw: 1.1, big: 1 },
  haymaker: { windup: 16 / 30, follow: 24 / 30, share: 2.6, reach: 2.0, launch: true, big: 2 },
  // (his slip's counter hook, as he comes up: game.ts brawlerComesUp)
  counter: { windup: 0, follow: 0, share: 1, reach: 1.9, throw: 0.6, big: 0 },
};

/** Seconds after a punch has been seen out in which a press is still the next of its combo. */
export const COMBO_GAP = 0.45;

/** The punch made by a press (a hold or a tap) at its place in the combo, after `holds` holds (the art chat's punchFor). */
export function punchFor(place: number, hold: boolean, holds: number): PunchName {
  if (place <= 0) return hold ? 'cross' : 'jab';
  if (place === 1) return hold ? 'body blow' : 'hook';
  if (hold) return holds >= 2 ? 'haymaker' : 'overhand';
  return 'uppercut';
}

/** His other numbers (starting numbers, his to try and change). */
export const BRAWL_TUNE = {
  /** THE CANNONBALL (the haymaker's launch): how far the one it hits flies (tiles) and how fast; the share of the punch each one it bowls over takes, and how near its path one must be to be bowled over. */
  cannonball: { far: 6, speed: 14, share: 0.6, near: 0.9 },
  /** THE SLIP AND COUNTER: seconds the dash takes; the counter hook's reach from where he comes up, and its share of the swipe's hit. */
  slip: { secs: 0.22, reach: 1.9, share: 1 },
  /** HIS SKILL TREE (game/talents.ts BRAWLER_TREE; its rules in game.ts, "THE BRAWLER'S TREE"): starting numbers, his to try and change. */
  talents: {
    /** Double Jab: seconds between the first jab landing and the second. */
    doubleJab: { gap: 0.12 },
    /** Tenderize: how much more an enemy takes from him for each punch he has landed on it in a row, and the most. */
    tenderize: { each: 0.05, most: 0.5 },
    /** Big Uppercut: how much harder; seconds up in the air, and how high it goes (pixels, the picture's); seconds stunned as it comes down. */
    bigUppercut: { mult: 2, up: 0.55, high: 26, stun: 2 },
    /** Knockout: below this share of its life his uppercut knocks it out; a boss is stunned this many seconds instead. */
    knockout: { below: 0.2, boss: 3 },
    /** Bleeders: the share of a body blow that each one it hits bleeds again, and over how many seconds. */
    bleeders: { share: 0.5, secs: 3 },
    /** Iron Chin: how much less harm while he winds up a hold. */
    ironChin: { less: 1 / 3 },
    /** Ten Pins: how far each one the cannonball bowls over is launched (tiles), and how far it veers off the line, away from it (0: straight on). */
    tenPins: { far: 4, veer: 0.5 },
    /** Pinball: the share of the blow that knocked it back that what it is knocked into takes; how far that is knocked back (tiles); how near is knocked into (tiles between their edges). */
    pinball: { share: 0.5, far: 1.1, touch: 0.1 },
    /** Shockwave: how far the wave goes on ahead (tiles), how wide it is either side of its line, how fast (tiles a second); the share of the hold's blow it strikes for. */
    shockwave: { far: 3, wide: 0.45, speed: 14, share: 0.5 },
    /** Slip Reflex: seconds between one slipped blow and the next; how far aside he slips (tiles). */
    slipReflex: { every: 6, far: 1.1 },
  },
};

/** What his talents keep going in the game (game.ts `brawl`); a level begins with none of it. */
export interface BrawlState {
  /** Tenderize: the enemy his punches are on, and how many he has landed on it in a row. */
  tender: { id: number; n: number } | null;
  /** Big Uppercut: those thrown up, and the seconds each has been up. */
  up: { id: number; t: number }[];
  /** Pinball: those he has knocked back, while they fly: what knocked them (the ability, the blow's share), and whom the knocks have struck (one list for the knocks that began with one blow). */
  pins: { id: number; skill: number; frac: number; hit: number[] }[];
  /** Shockwave: the waves of air going on ahead of his holds: where from, which way, how far they have gone and may go, and whom they have struck. */
  waves: { x: number; y: number; dx: number; dy: number; gone: number; far: number; skill: number; frac: number; hit: number[] }[];
  /** Set-Up: a counter has landed, and his next press is the combo's last punch. */
  setUp: boolean;
  /** Slip Reflex: when it last slipped a blow by itself (the level's clock). */
  reflexAt: number;
}

/** His talents' state at the start of a level. */
export const newBrawl = (): BrawlState => ({ tender: null, up: [], pins: [], waves: [], setUp: false, reflexAt: -1e9 });
