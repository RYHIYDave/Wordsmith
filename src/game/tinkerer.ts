// THE TINKERER (the main chat, from 28 Oct 2026). Her design is the owner's, made with the art chat (docs/mockups/classes/
// BRIEF.md, HANDBACK.md); the rules here are the main chat's reading of it, the numbers his to try and change.
//
// Her brief, 23 Oct 2026: “Gleeful mad bomber (Recommended)”, “Quick and nimble (Recommended)”; how she fights: “K this is
// where the tinkering is changing the character.  She’s going to have minions.  I think she’ll set turrets on the ground that
// fire something.  Not an arrow or a bolt.  That’s the tap.  We’ll call those “Contraption”.  Tap and hold will be “Golem”.
// And this is gonna be clockwork Automaton that follows her around and attacks.  It will just go around and I guess punch
// things or whatever but tap+hold will have him do a bigger move.”; what the Contraptions fire, “Lobbed vials
// (Recommended)”; the Golem's bigger move, “Ground pound (Recommended)”; its ranged arm, “Cannon”; her swipe, “Blast jump
// (Recommended)”. And to the main chat, 28 Oct, by 13:57: how many Contraptions at once, “Three at once (Recommended)”
// (offered as: a fourth replaces the oldest; each lobs her vials for about 12 seconds); how the Golem comes and goes,
// “Always with her (Recommended)” (offered as: the first hold brings it out; it follows her, punches up close and fires its
// cannon at range; each hold after has it ground pound; it winds down only when she falls).
//
//   HER VIAL TOSS (defs.ts SKILLS.vialtoss, kind 'vialtoss'), her tap since his words of 28 Oct, by 16:31: “I think for her
//     I’d like her to start with golem and a vial toss.  Then in the skill tree you can swap the vial toss to a contraption
//     that throws the vials”: she lobs a vial off her belt where she taps (no further than its range); it bursts where it
//     comes down, hurting all within the ability's radius. Her throw is the Contraption's, a vial in her hand in its place.
//     Filmed in the game for him (vialtoss_film.mp4), his pick by 18:15: “Yes, keep it (Recommended)”.
//   HER CONTRAPTION (defs.ts SKILLS.contraption, kind 'contraption'), a swap for the Vial Toss on her skill tree: she throws a little mortar down where she taps (no
//     further than its range); it comes down, bounces, springs open and is lit (TINKER_TUNE.contraption.set); then every
//     `every` seconds it lobs a vial of her brew at the nearest enemy awake within `reach`, which bursts where it comes
//     down, hurting all within the ability's radius. It stands `life` seconds; three at once, a fourth putting the oldest
//     out of action.
//   HER GOLEM (kind 'golem'): her first tap and hold whistles it out beside her; from then on it is always with her (it
//     cannot be broken: monsters do not fight it). It knuckles along after her; it punches what is near it and fires its
//     cannon at what is further off; each tap and hold of hers after sets it on to GROUND POUND where it stands, hurting
//     everything round it. It winds down where it stands when she falls; left far behind (a way taken, a portal), it is
//     whistled up beside her again.
//   HER BLAST JUMP (kind 'blastjump'): a bomb slapped down at her feet goes off: what is by her is hurt and blown away, and
//     she rides the blast to a spot, nothing hurting her in the air.
// What her words do: on the Contraption, each vial's burst; on the Golem, its punches, shots and pounds; on the blast jump,
// its blast. (The hits are hers, made with that ability's words, as the mage's familiars' are.)

import type { ClassId } from './types';

/** A page built to try her out says so (esbuild's define): the Tinkerer offered from the start. */
declare const __TINKERER__: boolean | undefined;
/** THE TINKERER OFFERED: on, a new hero may be made as her (the class cards). Off until the owner has played her and said yes. */
export const TINKERER = { on: typeof __TINKERER__ !== 'undefined' && __TINKERER__ === true };

/**
 * HER GOLEM'S UPPERCUT in place of its punch (the main chat, at the owner's word of 28 Oct 2026, 20:26: “And his normal
 * punch doesn’t really look very good”): dev/golem_moves.ts golemUppercut, its fist dragged back along the floor and
 * scooped up through them. Filmed in the game beside the old punch (golem_film.mjs); his pick, 28 Oct, by 21:41: “Yes, use
 * the uppercut (Recommended)”. Off, the old punch (dev/golem_moves.ts golemPunch).
 */
export const GOLEM_LOOK = { uppercut: true };

/** Is this hero the Tinkerer. */
export const isTinkerer = (cls: ClassId): boolean => cls === 'tinkerer';

/** What her minions do, and when (starting numbers, his to try and change). Times in seconds, distances in tiles. */
export const TINKER_TUNE = {
  contraption: {
    /** How many at once: his pick, three. */
    most: 3,
    /** From leaving her hand to set up and lit (the art: dev/contraption_fx.ts CT, letGo to open1, 38 frames). */
    set: 38 / 30,
    /** Its first shot after it is set up, and then one every so often (the art: CT.shots, 62 and 100). */
    first: 9 / 30,
    every: 38 / 30,
    /** How long a vial flies (CT.flight), and how far it can lob one. */
    flight: 20 / 30,
    reach: 7,
    /** How long it stands once set up: “about 12 seconds”. */
    life: 12,
    /** Broken (put out of action, or its time up): seconds it takes to fall apart (CDOWN.end). */
    broke: 56 / 30,
  },
  golem: {
    /** How fast it knuckles along (tiles a second; her run is 4.6), and how near her it keeps when nothing is to be fought. */
    speed: 3.0,
    near: 1.7,
    /** Further from her than this, it is whistled up beside her again. */
    lost: 12,
    /** It goes for enemies awake within this of her (it does not wander off from her). */
    leash: 8,
    /** ITS PUNCH: reach (from its middle to the enemy's edge); the punch's time (GPUNCH.end), its blow landing at GPUNCH.hit; its share of the Golem's hit; the wait after. */
    punch: { reach: 1.7, long: 40 / 30, hit: 17 / 30, share: 0.7, wait: 0.5 },
    /** ITS UPPERCUT, when it throws that in place of its punch (GOLEM_LOOK): its time (GUPPER.end), its blow landing at GUPPER.hit. */
    upper: { long: 36 / 30, hit: 15 / 30 },
    /** ITS CANNON: from `near` to `far` away, seen; its time (GCANNON.end), the shot at GCANNON.fire; its share of the Golem's hit; the wait after. */
    cannon: { near: 2.6, far: 8, long: 50 / 30, hit: 15 / 30, share: 0.9, wait: 3.0, speed: 16 },
    /**
     * ITS GROUND POUND, on her tap and hold: a moment after her whistle (`lead`), its time (GP.end), the blow at GP.hit; all
     * within the ability's radius. Quicker since his word of 28 Oct, 20:25: “The golem’s slam is too slow to really plan a
     * good hit” (it was lead 8, long 50, hit 25 frames: its blow 1.1 seconds after her whistle; now 13 frames, 0.43).
     */
    pound: { lead: 2 / 30, long: 33 / 30, hit: 11 / 30 },
    /** Whistled out: it drops in beside her in a burst of steam, ready after this long. */
    arrive: 0.6,
    /** Winding down when she falls (GDOWN.end). */
    down: 72 / 30,
  },
  /** HER VIAL TOSS: how long a vial she throws flies, and how far to one side Twin's second lands from the first. */
  toss: { flight: 18 / 30, twin: 0.9 },
  blast: {
    /** Seconds in the air for her six tiles (the art: BJ.boom to BJ.land, 18 frames), and how far the blast throws what is by her. */
    secs: 18 / 30,
    throw: 2.0,
  },
  /** HER SKILL TREE'S TALENTS (game/talents.ts TINKERER_TREE, as their cards say them): starting numbers, his to try and change. */
  talents: {
    /** Bombs Away: the second bomb where she lands, its size and its hit as shares of her blast jump's. */
    bombsAway: { size: 1, share: 1 },
    /** Fortune: how much harder she hits for each gold she carries (1% of her gold, as a percent: 1,000 gold, 10% more). */
    fortune: 0.0001,
    /** Cluster Vials: how many little ones; how far they bounce out (tiles) and how long they are in the air; their bursts' size and hit, as shares of the vial's. */
    cluster: { n: 3, far: 1.5, flight: 12 / 30, size: 0.5, share: 0.35 },
    /** Tar: how long a puddle lasts; its size, a share of the burst's; what walks in it moves at this share of its speed (“slowed to a crawl”). */
    tar: { secs: 3, size: 0.9, crawl: 0.2 },
    /** Mad Mixture: its burn and its poison, each this share of the vial's hit over their time; its freezing, a chill this strong (a second freezes, as frost does). */
    mixture: { burn: 0.6, poison: 0.6, chill: 0.5 },
    /** The Big One: every `every`th vial of hers; `wide` times as wide; what it catches knocked down (stunned) `down` seconds, and thrown `far` tiles. */
    bigOne: { every: 5, wide: 3, down: 1.2, far: 0.8 },
    /** Lightning Rod: how long after its ground pound; how near the Golem (from its middle) an enemy goes after it. */
    rod: { secs: 3, near: 4 },
    /** Shrapnel: how far its burst reaches where the shot lands, and its hit, a share of the shot's. */
    shrapnel: { r: 1.4, share: 0.6 },
    /** Tesla Coil: a zap every `every` seconds at the enemy nearest the Golem within `reach`, leaping on to `leaps` more, each within `jump` of the last; each zap this share of the Golem's hit. */
    tesla: { every: 1, reach: 5, leaps: 2, jump: 3.5, share: 0.35 },
    /** Mark II: how many Golems she may have out at once. */
    markII: 2,
    /** Prospector: how many little piles of gold each ground pound digs up (between them about one ordinary gold drop of the floor). */
    prospector: { n: 4 },
    /** Overdrive: how long, and how many times as fast it moves and strikes. */
    overdrive: { secs: 5, fast: 2 },
    /** Growth Serum: a vial bursting within this of the Golem's edge (beyond the burst's own); how long; how many times as big and as strong. */
    growth: { near: 0.6, secs: 5, big: 2, strong: 2 },
  },
};

/** How long the Golem's blow up close takes, and when it lands: its punch's, or its uppercut's (GOLEM_LOOK). */
export function golemBlow(): { long: number; hit: number } {
  const G = TINKER_TUNE.golem;
  return GOLEM_LOOK.uppercut ? G.upper : { long: G.punch.long, hit: G.punch.hit };
}
