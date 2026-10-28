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
//   HER CONTRAPTION (defs.ts SKILLS.contraption, kind 'contraption'): she throws a little mortar down where she taps (no
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
    /** ITS CANNON: from `near` to `far` away, seen; its time (GCANNON.end), the shot at GCANNON.fire; its share of the Golem's hit; the wait after. */
    cannon: { near: 2.6, far: 8, long: 50 / 30, hit: 15 / 30, share: 0.9, wait: 3.0, speed: 16 },
    /** ITS GROUND POUND, on her tap and hold: its time (GP.end), the blow at GP.hit (after HOLD.lead, her whistle first); all within the ability's radius. */
    pound: { lead: 8 / 30, long: 50 / 30, hit: 25 / 30 },
    /** Whistled out: it drops in beside her in a burst of steam, ready after this long. */
    arrive: 0.6,
    /** Winding down when she falls (GDOWN.end). */
    down: 72 / 30,
  },
  blast: {
    /** Seconds in the air for her six tiles (the art: BJ.boom to BJ.land, 18 frames), and how far the blast throws what is by her. */
    secs: 18 / 30,
    throw: 2.0,
  },
};
