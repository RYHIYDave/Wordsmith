// Which picture of a hero to show this instant, and the things that fly from them.
//
// The game's rules say what the hero is doing (standing, walking, how far into which attack, how
// far through a leap). This turns that into one frame of the hero's art, moves the scarf and the
// feather that go with it, and decides when a hero who has been left standing does one of the two
// little things their class does (the owner: "Warrior tests the edge of his sword, mage snaps his
// finger and a mage light pops on and off, for the ranger a squirrel runs out from under his cloak
// and around his shoulders then back under"). The game screen and the class cards both use it.

import type { ActorArt, Clip } from '../art/actor_types';
import { HERO_TAILS } from '../art/heroes';
import { drawAura, drawGlow, drawLights, flipSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Tails } from '../engine/tails';
import { TUNE } from '../game/defs';
import type { SkillKind } from '../game/defs';
import type { ClassId } from '../game/types';
import { STRIDE, strideFrame } from './weight';
import type { AnimSet } from '../art/actor_types';

/** What the rules know about the hero that the picture needs. */
export interface FigureState {
  anim: string;
  animT: number;
  /** Facing, as a step in the world (see the renderer: x - y < 0 is screen-left, x + y < 0 is away from the camera). */
  fx: number;
  fy: number;
  /** The attack being made: 0 the quick one, 1 the slow one; how long ago it began; how long its wind-up is. */
  attackSkill: number;
  attackAge: number;
  attackWind: number;
  /** How far through a leap, 0..1, or -1 when not leaping. */
  leapK: number;
  /**
   * How long the attack has been HELD, in seconds (a beam that is burning now, a whirlwind that is
   * turning), or absent or less than 0 when none is. A figure with a picture of its own for that
   * (`clips.hold` for a beam, `clips.whirl` for a whirlwind) shows it going round for as long as
   * this goes on. `holdAs`: which of the two it is (a beam, if not said).
   */
  holdT?: number;
  holdAs?: 'beam' | 'whirl';
  /** How far through a roll, 0..1, or absent or -1 when not rolling. A figure with a picture of its own for it (`clips.roll`) shows that. */
  rollK?: number;
  /**
   * How long ago the hero's life ran out, in seconds, or absent or less than 0 while they live. A
   * figure with a fall of its own (`clips.fall`) is shown falling, and then as its last frame
   * leaves them, for as long as this goes on. Nothing else they were doing is shown.
   */
  fallT?: number;
  /**
   * How long ago a heavy blow rocked the hero, in seconds, or absent or less than 0 when none
   * has lately. A figure with a picture of its own for that (`clips.reel`) shows it while the
   * hero stands or walks; whatever else they are doing goes on as it was.
   */
  reelT?: number;
  /** ... and that the blow came from behind them: they are thrown forward (`clips.lurch`) where one from in front rocks them back. */
  reelBehind?: boolean;
  /**
   * Where the hero stands in the world, in tiles. Read only for a run played by the ground it
   * covers (render/weight.ts, STRIDE: the art chat's mock-up, OFF in the game); without it, or with
   * the switch off, the run is played by the clock (`animT`), as it always has been.
   */
  x?: number;
  y?: number;
}

/**
 * Turning. A hero is drawn from four sides (toward the camera or away from it, and each of those
 * mirrored), and nothing is drawn in between. Until Version 11.1 the picture simply changed from
 * one side to the next in a single frame, and the owner saw it at once: "The characters snap to a
 * direction and if that could be smoother I'd like it."
 *
 * So the figure TURNS: it is drawn narrower and narrower, as a thing turning on the spot is seen
 * to be, changes to its new side when it is at its narrowest, and widens again. Left to right is
 * half a turn (it goes all but edge-on); front to back, a quarter (it narrows a little). The whole
 * thing takes TURN_TIME, and the scarf whips round with it because the knot it hangs from moves.
 *
 * And the side is KEPT until the hero has clearly turned out of it (VIEW_STICK). Walking straight
 * up the screen is the line between two sides: without this, a thumb that wobbles on the stick
 * flips the hero from one to the other and back.
 */
export const TURN_TIME = 0.14;
/**
 * Whether a figure narrows and flips as it changes sides at all. OFF since Version 14.5. The owner,
 * 5 Oct 2026, once the heroes were drawn facing the grid's four ways in earnest: "Can you remove
 * the flip we added a long time ago. I'd like to see them now with the correct alignment". The
 * narrowing was made (Version 11.1) to hide that the four pictures were two flat ones and their
 * mirror images; with each picture a true view of its own, the figure simply faces the new way.
 * (The side is still KEPT until the hero has clearly turned out of it: VIEW_STICK. The machinery
 * of the turn is left in place below, and tested with this switched on, in case he wants it back.)
 */
export const TURN_FLIP = { on: false };
/** How wide the figure is drawn at the middle of a turn, as a part of its width. */
export const TURN_NARROW = { half: 0.2, quarter: 0.62 };
/** How far past the line between two sides the hero must face before the picture changes sides (0.16 is about six degrees). */
export const VIEW_STICK = 0.16;

interface View {
  /** Mirrored: the hero faces screen-left. */
  left: boolean;
  /** Seen from behind: the hero faces away from the camera. */
  away: boolean;
}

/** How far apart the slices of a figure that is wholly out of phase are pulled, in game pixels (a warp: render.ts, and `drawPhased` below). */
export const PHASE_APART = 7;

/** Seconds a hero stands before the first of the things they do when left standing, and between one and the next. */
export const GESTURE_FIRST = 4;
export const GESTURE_GAP: readonly [number, number] = [5, 9];

function frameOf(c: Clip, seconds: number): Sprite {
  const n = c.frames.length;
  return c.frames[Math.max(0, Math.min(n - 1, Math.floor(seconds * c.fps + 1e-6)))];
}

/**
 * Which of a figure's two attack animations goes with the attack being made: 0 its first (the
 * `attack` clip), 1 its second (`heavy`). They were drawn for each class's own two attacks, and
 * until each hero is drawn with each weapon they serve for whatever is in hand: the quick attack
 * plays the first, the slow attack the second. One exception: the mage's two are the staff thrust
 * out and the staff brought down on the floor, and a BEAM is thrust out, not brought down (the
 * owner: "Have the character flick the wand out and the beam fires out the end of the wand").
 * And a whirlwind, whoever spins it, is the first animation's blow held and carried round.
 * `slot`: 0 the quick attack, 1 the slow one. `kind`: how that attack is delivered.
 */
export function attackClip(cls: ClassId, slot: number, kind: SkillKind): 0 | 1 {
  if (cls === 'mage' && kind === 'beam') return 0;
  // (a whirlwind is the swing held out and carried round, not the blow brought down)
  if (kind === 'whirl') return 0;
  return slot === 1 ? 1 : 0;
}

/**
 * The frame of a held move `t` seconds after it began to be held: what comes before the clip's
 * `loop` moment once, then the rest of it round and round (its last frame is the first of the loop
 * again, and is not shown twice).
 */
export function heldFrame(c: Clip, t: number): Sprite {
  const n = c.frames.length;
  const from = Math.max(0, Math.min(n - 1, Math.round((c.loop ?? 0) * c.fps)));
  const i = Math.floor(Math.max(0, t) * c.fps + 1e-6);
  if (i < from) return c.frames[i];
  const len = Math.max(1, n - 1 - from);
  return c.frames[from + ((i - from) % len)];
}

/** The frame of an attack `age` seconds after it was begun, when the rules give it a wind-up of `wind` seconds. */
export function attackFrame(c: Clip, age: number, wind: number): Sprite {
  // The picture's own wind-up ends at c.hit. It is played faster or slower to end when the
  // rules' does; from the blow onward the picture runs at its own pace.
  const hit = c.hit ?? 0;
  const t = age < wind ? (wind > 0 ? (age / wind) * hit : hit) : hit + (age - wind);
  return frameOf(c, t);
}

/**
 * How long ago a MONSTER's attack began, by the rules' own clock, for attackFrame.
 *
 * The rules count a monster's wind-up DOWN (`t`, from its `windup`; more slowly while it is
 * chilled), land the blow when it reaches nothing, and then count down TUNE.monsterRecover in
 * which the monster does nothing else. So how far through the wind-up it is is read off what is
 * left of it, not off a clock of the picture's own: a chilled skeleton raises its sword slowly
 * and still brings it down in the step the blow lands.
 * `windingUp`: the blow has not landed yet. `t`: what the rules have left to count.
 *
 * While it winds up it has not struck, however little is left to count (the rules' count can
 * stop a rounding error short of nothing, and take one more step to land the blow): the picture
 * then stays a hair short of its blow, which is shown in the step the rules land theirs.
 */
export function monsterAttackAge(windingUp: boolean, t: number, windup: number): number {
  const left = Math.max(0, t);
  if (windingUp) return windup > 0 ? windup * (1 - Math.max(NOT_YET, Math.min(1, left / windup))) : 0;
  return windup + TUNE.monsterRecover - Math.min(TUNE.monsterRecover, left);
}
/** The least of a wind-up that is still to come while the blow has not landed, as a share of it. */
const NOT_YET = 1e-4;

export class Figure {
  readonly tails = new Tails(HERO_TAILS);
  /** How long the hero has stood (since the last thing done), the wait before the next thing, and which it will be. */
  private stood = 0;
  private wait = GESTURE_FIRST;
  private turn = 0;
  /** The thing being done now (0 none, 1 or 2), and how long it has been going. */
  private doing = 0;
  private doingT = 0;
  /** The standing loop starts from its first frame at this moment of the hero's animation clock. */
  private loopFrom = 0;
  /** How long ago a held attack was let go, in seconds (-1: none was, or another attack has begun since), and the attack's clock when last seen. */
  private sinceHeld = -1;
  private lastAge = 0;
  private heldAs: 'beam' | 'whirl' = 'beam';
  /** How long ago a leap came down, in seconds, while the hero has stood there since (-1: not so). */
  private sinceLand = -1;
  /** How much of the light has gone out of a hero who has fallen, 0..1: what glows on their tails (a feather) goes with it. */
  private gone = 0;
  /**
   * A RUN PLAYED BY THE GROUND IT COVERS (render/weight.ts, STRIDE; off in the game): the floor the
   * hero has covered since the run began, in tiles, and where they stood when last drawn running.
   */
  private ground = 0;
  private ranAt: { x: number; y: number } | null = null;
  /** What was last shown, for the lights. */
  last: Sprite | null = null;
  /** Which thing was begun this frame (1 or 2), for whoever wants to make a sound: 0 otherwise. */
  began = 0;

  /** Seconds between one thing done and the next, when it is to be the same every time (the class cards take turns); 0 = it varies. */
  private gap = 0;

  /** The side the figure is drawn from just now (null before its first frame), and the side it is turning to (the same, when it is not turning). */
  private view: View | null = null;
  private goal: View = { left: false, away: false };
  /**
   * How far through a turn: 0 the old side at full width, 0.5 the narrowest (where the side
   * changes), 1 the new side at full width. `turnDir` -1: the hero thought better of it before
   * the half way, and is turning back.
   */
  private turnK = 1;
  private turnDir = 1;
  private narrow = 1;
  /** How wide the figure is drawn just now, as a part of its width: 1 except in a turn. Whoever draws the frame must use it (see draw). */
  squash = 1;

  /** Start over: a new hero, or a card that has just come on screen. `wait` is how long before the first thing done. */
  reset(wait = GESTURE_FIRST, turn = 0, gap = 0): void {
    this.stood = 0;
    this.wait = wait;
    this.turn = turn;
    this.gap = gap;
    this.doing = 0;
    this.doingT = 0;
    this.loopFrom = 0;
    this.sinceHeld = -1;
    this.sinceLand = -1;
    this.gone = 0;
    this.ground = 0;
    this.ranAt = null;
    this.view = null;
    this.turnK = 1;
    this.squash = 1;
    this.tails.reset();
  }

  /** Is the figure in the middle of turning from one side to another? */
  get turning(): boolean {
    return this.turnK < 1;
  }

  /**
   * Move the turn on by `dt` seconds toward the side wanted, and return the side to draw now.
   * `dur` is how long a whole turn takes.
   */
  private turnTo(want: View, dt: number, dur: number): View {
    if (!this.view) {
      // the first frame of a new figure: it simply stands as it is wanted
      this.view = { ...want };
      this.goal = { ...want };
      this.turnK = 1;
      this.squash = 1;
      return this.view;
    }
    if (!TURN_FLIP.on) {
      // no flip: the figure faces the way it is wanted, at once and at its full width
      this.view = { ...want };
      this.goal = { ...want };
      this.turnK = 1;
      this.squash = 1;
      return this.view;
    }
    const same = (a: View, b: View): boolean => a.left === b.left && a.away === b.away;
    const kind = (a: View, b: View): number => (a.left !== b.left ? TURN_NARROW.half : TURN_NARROW.quarter);
    if (!same(want, this.goal)) {
      if (this.turnK >= 1) {
        // standing square: a new turn
        this.turnK = 0;
        this.turnDir = 1;
        this.narrow = kind(this.view, want);
      } else if (this.turnK < 0.5) {
        // not yet half way, still showing the old side: back to it, or on to another
        if (same(want, this.view)) this.turnDir = -1;
        else {
          this.turnDir = 1;
          this.narrow = Math.min(this.narrow, kind(this.view, want));
        }
      } else {
        // past half way, showing the side that was wanted a moment ago: a new turn from as narrow as it is now
        this.turnK = 1 - this.turnK;
        this.turnDir = 1;
      }
      this.goal = { ...want };
    }
    if (this.turnK < 1 && dt > 0) {
      const before = this.turnK;
      this.turnK += (this.turnDir * dt) / Math.max(0.02, dur);
      if (this.turnDir > 0 && before < 0.5 && this.turnK >= 0.5) this.view = { ...this.goal };
      if (this.turnK >= 1) this.turnK = 1;
      else if (this.turnK <= 0) {
        // turned back: it stands as it stood
        this.turnK = 1;
        this.turnDir = 1;
      }
    }
    // (as a card turning on the spot is seen: slowly narrower at first, fastest through edge-on)
    this.squash = this.turnK >= 1 ? 1 : this.narrow + (1 - this.narrow) * Math.abs(Math.cos(Math.PI * this.turnK));
    return this.view;
  }

  /** Do one of the two things now (1 or 2), whatever the wait: for the art tools. */
  play(which: 1 | 2): void {
    this.doing = which;
    this.doingT = 0;
  }

  /** Is the hero in the middle of one of the things they do when left standing? */
  get busy(): boolean {
    return this.doing !== 0;
  }

  /**
   * The picture for this instant, already mirrored if the hero faces screen-left. `dt` is how much
   * time has passed since the last call (0 while the game is paused): it moves the tails and the
   * clock of whatever the hero is doing. (ox, oy) is where the hero's feet are in the world as it
   * is laid out on the screen (see Tails.step); `gestures` false keeps the hero from doing
   * anything of their own (monsters are near; the game is in a hurry).
   */
  frame(art: ActorArt, st: FigureState, dt: number, ox: number, oy: number, gestures = true): Sprite {
    this.began = 0;
    let s: Sprite;
    /** (the run is shown this frame: see runFrame) */
    let ran = false;
    const down = st.fallT !== undefined && st.fallT >= 0;
    // (rocked back by a blow, for as long as the picture of that lasts: both views' are the same length)
    const rock = art.front.clips?.reel;
    const struck = rock !== undefined && st.reelT !== undefined && st.reelT >= 0 && st.reelT < (rock.frames.length - 1) / rock.fps;
    const standing = st.anim === 'idle' && st.leapK < 0 && !down && !struck;
    if (!standing || !gestures) {
      this.doing = 0;
      this.stood = 0;
      this.loopFrom = 0;
    }
    // Which side the hero is wanted from: the side they face, kept until they have clearly turned
    // out of it. (For one of the things they do when left standing, they turn to the camera.)
    const across = st.fx - st.fy;
    const toward = st.fx + st.fy;
    const g0 = this.view ? this.goal : null;
    // (A whirlwind whose picture is the hero turning all the way round, `Clip.turns`: the rules
    // turn the hero's facing too, and the figure is not to be flipped from side to side by that
    // on top of its own turning. It is seen from the front for as long as it goes round.)
    const spins = st.anim === 'attack' && st.holdT !== undefined && st.holdT >= 0 && (st.holdAs ?? 'beam') === 'whirl' && art.front.clips?.whirl?.turns === true;
    const want: View = spins
      ? { left: false, away: false }
      : {
          left: g0 ? (g0.left ? across < VIEW_STICK : across < -VIEW_STICK) : across < 0,
          away: this.doing ? false : g0 ? (g0.away ? toward < -0.2 + VIEW_STICK : toward < -0.2 - VIEW_STICK) : toward < -0.2,
        };
    // (a hero who turns to strike is round by the time the blow lands)
    const winding = st.anim === 'attack' && st.attackAge < st.attackWind;
    const { left, away } = this.turnTo(want, dt, winding ? Math.min(TURN_TIME, Math.max(0.05, st.attackWind * 0.8)) : TURN_TIME);
    const set = away ? art.back : art.front;
    // (a leap that has come down: see `land`. Anything the hero then does but stand ends it. The
    // rules still call the hero walking in the step the leap ends, as they do all through it:
    // that step is not walking off.)
    const justDown = this.sinceLand >= 0 && this.sinceLand < 0.06;
    const anim = st.anim === 'walk' && st.leapK < 0 && justDown ? 'idle' : st.anim;
    if (st.leapK >= 0) this.sinceLand = 0;
    else if (this.sinceLand >= 0) this.sinceLand = anim === 'idle' ? this.sinceLand + dt : -1;
    const tumble = st.rollK !== undefined && st.rollK >= 0 ? set.clips?.roll : undefined;
    const reel = st.reelT !== undefined && st.reelT >= 0 ? ((st.reelBehind ? set.clips?.lurch : undefined) ?? set.clips?.reel) : undefined;
    const reeling = reel && (st.reelT as number) < (reel.frames.length - 1) / reel.fps ? reel : undefined;
    // (a hero whose life has run out: the fall, and then how it leaves them, whatever they were doing)
    const fall = down ? set.clips?.fall : undefined;
    this.gone = fall ? Math.min(1, (st.fallT as number) / Math.max(0.1, (fall.frames.length - 1) / fall.fps)) : 0;
    if (fall) {
      s = frameOf(fall, st.fallT as number);
      this.sinceHeld = -1;
      this.sinceLand = -1;
    } else if (tumble) {
      s = tumble.frames[Math.max(0, Math.min(tumble.frames.length - 1, Math.floor(st.rollK as number * tumble.frames.length)))];
    } else if (st.leapK >= 0 && (set.clips?.leap || set.leap)) {
      const c = set.clips?.leap;
      s = c ? c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.floor(st.leapK * c.frames.length)))] : (set.leap as Sprite[])[st.leapK < 0.18 ? 0 : st.leapK < 0.7 ? 1 : 2];
    } else if (anim === 'attack') {
      const c = (st.attackSkill === 1 ? set.clips?.heavy : undefined) ?? set.clips?.attack;
      const holding = st.holdT !== undefined && st.holdT >= 0;
      const kind = st.holdAs ?? 'beam';
      const held = holding ? (kind === 'whirl' ? set.clips?.whirl : set.clips?.hold) : undefined;
      if (holding) this.heldAs = kind;
      // A held attack that has been let go: the figure lets go of it too (`release`), in place of
      // the rest of the attack, until another attack is begun (its clock then starts again).
      if (holding) this.sinceHeld = 0;
      else if (this.sinceHeld >= 0) this.sinceHeld = st.attackAge < this.lastAge ? -1 : this.sinceHeld + dt;
      this.lastAge = st.attackAge;
      const letGo = this.sinceHeld >= 0 && !holding ? (this.heldAs === 'whirl' ? set.clips?.whirlEnd : set.clips?.release) : undefined;
      if (held && held.frames.length > 1) s = heldFrame(held, st.holdT as number);
      else if (letGo) s = frameOf(letGo, this.sinceHeld);
      else if (c) s = attackFrame(c, st.attackAge, st.attackWind);
      else {
        const list = st.attackSkill === 1 && set.heavy ? set.heavy : set.attack;
        const k = st.attackAge < st.attackWind ? 0 : st.attackAge - st.attackWind < 0.14 ? 1 : 2;
        s = list[k];
      }
    } else if (reeling) {
      // (rocked back by a blow: in place of the walk or the standing loop, for as long as it lasts)
      this.sinceHeld = -1;
      this.sinceLand = -1;
      s = frameOf(reeling, st.reelT as number);
      // (the standing loop takes up from its first frame when they are upright again)
      this.loopFrom = st.animT;
    } else if (anim === 'walk') {
      this.sinceHeld = -1;
      s = this.runFrame(set, st);
      ran = true;
    } else {
      this.sinceHeld = -1;
      const land = this.sinceLand >= 0 ? set.clips?.land : undefined;
      if (land && this.sinceLand < (land.frames.length - 1) / land.fps) {
        s = frameOf(land, this.sinceLand);
        // (the standing loop takes up from its first frame when he is up)
        this.loopFrom = st.animT;
        this.stood = 0;
      } else {
        this.sinceLand = -1;
        s = this.standingFrame(art, away, st.animT, dt, standing && gestures);
      }
    }
    // (a run played by the ground it covers begins again from its first picture the next time)
    if (!ran) {
      this.ground = 0;
      this.ranAt = null;
    }
    if (left) s = flipSprite(s);
    // (in a turn the knots the tails hang from close in on the middle with the figure)
    const q = this.squash;
    const roots = q < 1 && s.tails ? s.tails.map((r) => ({ ...r, x: s.ax + (r.x - s.ax) * q })) : s.tails;
    this.tails.step(dt, roots, s.ax, s.ay, left ? -1 : 1, ox, oy);
    this.last = s;
    return s;
  }

  /**
   * The picture of the run for this instant. By the clock, as the game has always played it (so
   * many pictures a second, however fast the hero goes); or, with STRIDE switched on (the art
   * chat's mock-up, OFF in the game: render/weight.ts) and the art saying how much floor a turn of
   * its run covers (`walkGround`), by the ground the hero has covered since the run began, so that
   * the foot that is down stays where it was put.
   */
  private runFrame(set: AnimSet, st: FigureState): Sprite {
    const n = set.walk.length;
    if (STRIDE.on && set.walkGround && st.x !== undefined && st.y !== undefined) {
      const was = this.ranAt;
      const step = was ? Math.hypot(st.x - was.x, st.y - was.y) : 0;
      // (a tile or more in one frame is not ground covered at a run: a warp, a new level)
      if (step < 1) this.ground += step;
      this.ranAt = { x: st.x, y: st.y };
      return set.walk[strideFrame(this.ground, set.walkGround, n)];
    }
    return set.walk[Math.floor(st.animT * (set.walkFps ?? 8)) % n];
  }

  /**
   * The standing loop, or the thing the hero is doing in place of it. Those things are painted for
   * the view that faces the camera: a hero who stands with their back to us turns round to do
   * theirs, and turns back when it is done.
   */
  private standingFrame(art: ActorArt, away: boolean, animT: number, dt: number, free: boolean): Sprite {
    const set = away ? art.back : art.front;
    const fps = set.idleFps ?? 2;
    const n = set.idle.length;
    const a = art.front.clips?.idleA;
    const b = art.front.clips?.idleB;
    if (this.doing) {
      const c = this.doing === 1 ? a : b;
      this.doingT += dt;
      // (still seen from behind: the hero is in the middle of turning round to the camera for it)
      if (c && this.doingT < (c.frames.length - 1) / c.fps) return away ? set.idle[0] : frameOf(c, this.doingT);
      // done: the loop takes up again from its first frame
      this.doing = 0;
      this.stood = 0;
      this.wait = this.gap > 0 ? this.gap : GESTURE_GAP[0] + Math.random() * (GESTURE_GAP[1] - GESTURE_GAP[0]);
      this.loopFrom = animT;
    }
    const at = Math.floor(Math.max(0, animT - this.loopFrom) * fps);
    const i = ((at % n) + n) % n;
    if (free && (a || b)) {
      this.stood += dt;
      // (begun as the loop comes round to its first frame, so that nothing jumps)
      if (this.stood >= this.wait && i === 0 && dt > 0) {
        const pickB = (this.turn % 2 === 1 && b) || !a;
        this.doing = pickB ? 2 : 1;
        this.turn++;
        this.doingT = 0;
        this.began = this.doing;
        const c = this.doing === 1 ? a : b;
        // (a hero with their back to us turns round first: see `frame`)
        if (c && !away) return c.frames[0];
      }
    }
    return set.idle[i];
  }

  /**
   * Draw the figure with its feet at (x, y): the pool of light behind it, the tails that go behind,
   * the picture, the tails that go in front. `scale` is how many times its size in the game.
   * (Its lights are separate: see lights.)
   */
  draw(g: CanvasRenderingContext2D, s: Sprite, x: number, y: number, scale = 1, aura = true): void {
    if (aura) drawAura(g, s, x, y, scale);
    this.tails.draw(g, x, y, false, scale);
    const [left, wide] = this.span(s, x, scale);
    g.drawImage(s.img, left, y - s.ay * scale, wide, s.h * scale);
    this.tails.draw(g, x, y, true, scale);
  }

  /**
   * A frame the caller has chosen, shown on this figure (a class card's hero making ready, with
   * the picture of that from the art): its tails are moved on for it as for any other frame, and
   * its lights are the figure's.
   */
  show(s: Sprite, dt: number, ox = 0, oy = 0): Sprite {
    this.began = 0;
    this.squash = 1;
    this.tails.step(dt, s.tails, s.ax, s.ay, 1, ox, oy);
    this.last = s;
    return s;
  }

  /**
   * Draw the figure OUT OF PHASE, as one who warps away is seen (the renderer draws the hero so
   * in the game: render.ts, PHASE_OUT): in slices two game pixels tall, each pulled the other way
   * from the one above it. `phase`: 0 whole, 1 wholly apart. `alpha`: how faint. Its tails go
   * with it, as faint.
   */
  drawPhased(g: CanvasRenderingContext2D, s: Sprite, x: number, y: number, scale: number, phase: number, alpha: number): void {
    const was = g.globalAlpha;
    g.globalAlpha = was * Math.max(0, Math.min(1, alpha));
    this.tails.draw(g, x, y, false, scale);
    const d = s.density ?? 1;
    const left = x - s.ax * scale;
    const top = y - s.ay * scale;
    for (let j = 0; j * 2 < s.h; j++) {
      const tall = Math.min(2, s.h - j * 2);
      const off = Math.round((j % 2 === 0 ? 1 : -1) * phase * (PHASE_APART - (j % 3) * 2)) * scale;
      g.drawImage(s.img, 0, j * 2 * d, s.w * d, tall * d, left + off, top + j * 2 * scale, s.w * scale, tall * scale);
    }
    this.tails.draw(g, x, y, true, scale);
    g.globalAlpha = was;
  }

  /**
   * Where the frame lies from side to side when its feet are at x: its left edge and its width.
   * In a turn it is narrower, and closes in on the line through its feet. (To the half pixel: the
   * picture has two of its own pixels to every game pixel.)
   */
  span(s: Sprite, x: number, scale = 1): [left: number, wide: number] {
    const q = this.squash;
    if (q >= 1) return [x - s.ax * scale, s.w * scale];
    const half = (v: number): number => Math.round(v * 2) / 2;
    return [half(x - s.ax * scale * q), Math.max(0.5, half(s.w * scale * q))];
  }

  /** Add the lights of the figure last shown (a lit blade, a crystal, a glowing feather). Call it after any darkness is laid down. */
  lights(g: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
    const s = this.last;
    if (s) {
      // (in a turn the lights close in on the middle with the figure that carries them)
      const q = this.squash;
      drawLights(g, q < 1 && s.lights ? { ...s, lights: s.lights.map((l) => ({ ...l, x: s.ax + (l.x - s.ax) * q })) } : s, x, y, scale);
    }
    // (the light goes out of a fallen hero's feather as it goes out of the rest of them)
    const lit = 1 - this.gone;
    if (lit > 0.02) for (const l of this.tails.lights()) drawGlow(g, x + l.x * scale, y + l.y * scale, l.r * scale, l.color, l.a * lit);
  }
}
