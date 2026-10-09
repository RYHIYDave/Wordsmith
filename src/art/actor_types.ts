// Shape of an animated character's art. Heroes and monsters both use it.

import type { Sprite } from '../engine/px';

/**
 * One facing of a character. Every frame is drawn facing screen-RIGHT; the renderer mirrors
 * frames for screen-left. All frames of one character share the same canvas size and anchor.
 */
/** A timed animation: frames at a steady rate, played once. */
export interface Clip {
  frames: Sprite[];
  /** Frames a second. */
  fps: number;
  /** An attack: seconds from its start at which the blow lands (the arrow leaves, the spell goes off). */
  hit?: number;
  /** A held move: seconds from its start at which its loop begins (see art/clip.ts, Timeline.loop). */
  loop?: number;
  /**
   * The figure in it TURNS ALL THE WAY ROUND, seen from one place (a whirlwind painted over the
   * bones: art/heroes3.ts). While it is shown the game does not also turn the figure to face the
   * way the rules have the hero facing (render/figure.ts).
   */
  turns?: boolean;
}

export interface AnimSet {
  /** A loop: breathing, and whatever blows in the wind. Two frames in the art of the first builds. */
  idle: Sprite[];
  /** A walk cycle: one full stride of both feet. Four frames in the art of the first builds. */
  walk: Sprite[];
  /** 3 frames: wind-up, strike/release, recover. */
  attack: Sprite[];
  /** Frames per second of the idle loop and of the walk. Absent = 2 and 8. */
  idleFps?: number;
  walkFps?: number;
  /** Heroes: 3 frames for the slow attack (a slam, a toss, a nova). Absent = it looks like `attack`. */
  heavy?: Sprite[];
  /** Heroes that leap: 3 frames (pushing off, in the air, coming down). Absent = the walk is shown. */
  leap?: Sprite[];
  /**
   * Art at the finer grain: the same moves as whole timelines, with the frames between the key
   * poses (art/clip.ts). Where these are present the renderer plays them and the three-frame lists
   * above are only stills taken from them. `leap` is laid out over the leap, start to landing;
   * `idleA` and `idleB` are what the hero does when left standing (front view only).
   */
  clips?: {
    attack?: Clip;
    heavy?: Clip;
    leap?: Clip;
    idleA?: Clip;
    idleB?: Clip;
    /**
     * What the figure does for as long as an attack is HELD (the mage's beam): a loop, its last
     * frame the same as its first. Shown in place of the one frozen frame of the attack that a
     * held attack showed up to Version 15.0. Before its `loop` moment it is played once (the
     * blast arriving); from there it goes round and round.
     */
    hold?: Clip;
    /** What the figure does when a held attack is let go, in place of the rest of the attack. */
    release?: Clip;
    /** The same two for a WHIRLWIND, which is held too: the spin, round and round, and coming out of it. */
    whirl?: Clip;
    whirlEnd?: Clip;
    /** A roll (the ranger's evasive move), laid out over it as `leap` is over a leap: diving, tucked and turning, coming up. */
    roll?: Clip;
    /** Coming down from a leap: what the figure does once it has landed, if it is then left standing (the weight of it going into the floor, and getting up). */
    land?: Clip;
    /**
     * A monster's death (the owner, 5 Oct 2026: "I think we want death animations and corpses for
     * enemies"): how it falls, played once from where it stood; and its LAST FRAME IS ITS BODY,
     * which lies where it fell until the hero leaves the dungeon. No pool of light and, by the
     * end, no light of its own: what is dead does not glow.
     */
    die?: Clip;
    /**
     * A HERO'S fall when their life runs out: played once from standing; its last frame is how
     * they are left, held for as long as the game shows them, the light gone out of whatever
     * glowed on them (kit.ts: Pose.out).
     */
    fall?: Clip;
    /**
     * A HERO IN TOWN MAKING READY: the weapon drawn (off the back, where the art has it there) and
     * the hero come into the stance they fight in, which is its last frame, held. What a class
     * card shows when its hero is picked (the owner, 6 Oct 2026, 22:24: "when you select the
     * character in the selection screen, they go into their battle stance, then warp out, and
     * warp into the beginning of the dungeon"). Front view only.
     */
    ready?: Clip;
    /** A HERO rocked back by a heavy blow, and upright again: a quarter of a second, shown while they stand or walk. */
    reel?: Clip;
    /** ... and thrown forward a step by one that comes from behind them. */
    lurch?: Clip;
    /**
     * A MONSTER'S OTHER MOVES, by name (the owner, 9 Oct 2026: tiny and small monsters have one
     * attack, medium two, large two or three, the boss four, and always a basic single-target
     * attack to use while the big ones cool down). `attack` is still its first; these are the rest,
     * each a clip as `attack` is (its `hit` where the blow lands, a held one's `loop` where its loop
     * begins): the trolls' 'swing', the red troll's 'chargeWind', 'charge' (a loop, run for as long
     * as the charge lasts) and 'chargeStop', ... Which is played when is the rules' (game/).
     * Absent: the monster has `attack` (and `heavy`) only.
     */
    moves?: Record<string, Clip>;
  };
}

export interface ActorArt {
  /** Facing the camera (moving down the screen): we see the face. */
  front: AnimSet;
  /** Facing away (moving up the screen): we see the back. */
  back: AnimSet;
}
