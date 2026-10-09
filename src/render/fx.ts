// Visual effects: particles, damage numbers, shockwave rings, slashes, lightning, screen shake.
// Everything here is cosmetic. It reads the game's events and never changes the game.
//
// Power words show themselves here. An ability's events carry its words, and each word adds its
// own mark on top of the ability's plain effect, whatever the ability is and wherever the word
// sits. In front the mark is on the hit; behind, it is on what the ability leaves.
//
//   Power      weight     a thick white-hot cut, the floor cracks and glows, stone flies, the game
//                         holds still for an instant.   Behind: embers gather round the hero, one per stack.
//   Swift      a blur     thin cuts that are there at once, speed lines, a ring that snaps out.
//                         Behind: a gust, and the hero leaves afterimages while the haste lasts.
//   Twin       two        the second cut comes back the other way beside a phantom of the hero.
//                         Behind: a phantom stays where the hero stood, winds up, and repeats the move.
//   Flame      fire       flames that rise and cool to smoke, embers, a scorch left on the floor.
//                         Behind: the ground itself burns.
//   Frost      ice        spikes of ice burst out and break, snow, a frozen floor; the frozen shatter.
//                         Behind: the floor freezes over.
//   Lightning  a bolt     it comes down from above on the target, then forks to the rest.
//                         Behind: a thundercloud that keeps striking.
//   Leeching   blood      red wisps fly from every enemy hit into the hero.
//                         Behind: a life orb is torn out of the kill.
//   Volatile   unstable   violet crackle on everything it touches; what it kills blows apart.
//                         Behind: a rune is written on the floor, counts down, and goes off.
//   Poison     venom      a sour green spatter; what it touches bubbles and sickens, and its
//                         numbers keep coming.   Behind: a cloud of it hangs over the floor.

import { figureOf } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import { BONE, INDIGO, PINK, PLUM, TEAL } from '../art/kit';
import { BLOOD as M_BLOOD, FLAME as M_FLAME, FLESH, FUR, GLOOM, GORE, IRON, WING } from '../art/mkit';
import { ELEMENT_RAMP, P } from '../art/palette';
import type { Sfx } from '../engine/audio';
import { drawText, textWidth, wrapText } from '../engine/font';
import { RANGER_ARROW, WORDS } from '../game/defs';
import type { GameEvent, TownVoice } from '../game/state';
import type { Element, WordId } from '../game/types';

/** Where the world origin sits on screen this frame. */
export interface Cam {
  ox: number;
  oy: number;
  /**
   * LEDGES AND STAIRS: how far the ground at a place in the world is lifted, in pixels (0 on the
   * flat, over a pit and in a wall). Absent or null on a level that is all of one height. Whatever
   * is placed on the screen through `wy` is lifted with the ground it stands on.
   */
  lift?: ((x: number, y: number) => number) | null;
}

export const wx = (c: Cam, x: number, y: number): number => c.ox + (x - y) * 16;
export const wy = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8 - (c.lift ? c.lift(x, y) : 0);
/** Where a place in the world would be on the screen if the ground there were not lifted (a wall's foot, a tile's own corner). */
export const wyFlat = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8;

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  color: string;
  size: number;
  grav: number;
  /** Colours over its life, first to last: a flame cools, smoke darkens. */
  ramp?: readonly string[];
  life0?: number;
  /** Drawn as a line this many pixels long, back along the way it is moving: speed lines, shards. */
  streak?: number;
}

interface Floater {
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  t: number;
  big: boolean;
  drift: number;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  colors: readonly string[];
  fill: boolean;
  /** A heavy ring is drawn three dots deep. */
  heavy?: boolean;
  /** Seconds before it starts (a second wave behind the first). */
  delay?: number;
  /** Closes in on its centre instead of spreading (a countdown, a pull). */
  closing?: boolean;
  /** Lightning: the ring is a zigzag. */
  jag?: boolean;
  /** Twin: a second ring just inside the first. */
  double?: boolean;
  /** Swift: three arcs of wind that whirl round as they spread, instead of a whole ring. */
  swirl?: boolean;
}

interface Slash {
  x: number;
  y: number;
  a: number;
  reach: number;
  t: number;
  dur: number;
  colors: readonly string[];
  /** Power: a thick, wide cut that lingers. */
  heavy: boolean;
  /** Swift: three thin cuts, there at once. */
  fast?: boolean;
  /** Twin's second cut sweeps the other way. */
  rev?: boolean;
  /** Lightning: the edge is a zigzag. */
  jag?: boolean;
  /** An echo's cut is drawn thin and pale. */
  faint?: boolean;
}

/**
 * A beam that is being held (Version 12.1). The renderer says where it runs every frame it is held
 * (Fx.holdBeam); when it stops saying so, the beam thins away. Drawn as any ray is.
 */
interface HeldRay extends Ray {
  /** Which of a Twin pair. */
  n: number;
  /** Told of this frame. */
  fresh: boolean;
}

/** One turn of a whirlwind: the path of the blade round the hero, as two crescents that chase each other. */
interface Whirl {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  colors: readonly string[];
  heavy: boolean;
  jag: boolean;
  faint: boolean;
  /** Twin's second cut goes round the other way. */
  rev: boolean;
}

/** A crack in the floor, left by a Power hit: it opens glowing and cools to a dark line. */
interface Crack {
  /** World-space points along it: x0, y0, x1, y1 ... */
  pts: number[];
  t: number;
  dur: number;
  /** Seconds it glows. */
  hot: number;
}

/** A mark left on the floor: fire scorches it, frost rimes it. */
interface Decal {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  kind: 'scorch' | 'frost';
  seed: number;
}

/** A spike of ice lying out from the middle of a frost burst, with an icicle standing at its end. */
interface Spike {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  tall: number;
  t: number;
  dur: number;
}

/** A burst of light at an impact. */
interface Flash {
  x: number;
  y: number;
  z: number;
  r: number;
  t: number;
  dur: number;
  colors: readonly string[];
}

/** Lightning jumping along the ground from one point to another. */
interface Bolt {
  pts: number[];
  t: number;
  /** Core colours, freshest first (default: lightning's white to yellow). */
  colors?: readonly string[];
}

/** Lightning coming down from above. `offs` are the sideways steps of its joints, in pixels. */
interface SkyBolt {
  x: number;
  y: number;
  /** Height in pixels it starts from. */
  top: number;
  offs: number[];
  fork: number[];
  t: number;
  dur: number;
}

/** A column of light standing on the floor for an instant (a rune going off). */
interface Beam {
  x: number;
  y: number;
  w: number;
  t: number;
  dur: number;
  colors: readonly string[];
}

/**
 * The wand's beam (Version 12): a line of light a little above the floor, there along its whole
 * length at once (the owner: "phase in along the whole line"), and then gone.
 */
interface Ray {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
  /** Brightest first: its heart, then outward to its edge. */
  colors: readonly string[];
  /** Power: wider. */
  heavy: boolean;
  /** Lightning: its heart is a zigzag. */
  jag: boolean;
  /** Volatile: it will not hold still. */
  flicker: boolean;
  /** The weaker repeat that "of Echoes" leaves. */
  faint: boolean;
  /** A number of its own, so that its zigzag is not every other beam's. */
  seed: number;
}

/** Life on its way from an enemy to the hero. */
interface Wisp {
  sx: number;
  sy: number;
  t: number;
  dur: number;
  bend: number;
  lift: number;
}

/** A phantom of the hero, asked for here and drawn by the renderer (which has the pictures). */
export interface GhostAsk {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  /** Seconds it stays, and seconds before it appears. */
  dur: number;
  delay: number;
  /** How solid it is at its strongest, 0..1. */
  alpha: number;
}

/** A moment of light that pushes the darkness back (the renderer cuts it out of the dark). */
export interface Glow {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
}

export interface Message {
  text: string;
  color: string;
  t: number;
  /** Seconds it stays up: longer messages get longer to be read. */
  life: number;
}

/**
 * What a monster flies apart into when it dies: the colours it is painted in (Version 14: the
 * figures of art/bestiary.ts, in the tones of art/kit.ts and art/mkit.ts).
 */
const DEATH_COLORS: Record<MonsterFigure, readonly string[]> = {
  skeleton: [BONE[4], BONE[2], BONE[0], TEAL[3]],
  archer: [BONE[4], BONE[2], M_BLOOD[2], M_BLOOD[4]],
  cultist: [GLOOM[4], GLOOM[2], PINK[2], M_FLAME[3]],
  bat: [FUR[4], FUR[2], WING[2], WING[4]],
  brute: [FLESH[4], FLESH[2], FLESH[0], PLUM[2]],
  guardian: [GORE[4], GORE[2], IRON[4], M_FLAME[3]],
  warden: [M_FLAME[4], M_FLAME[2], IRON[4], IRON[2], M_BLOOD[2], INDIGO[2]],
};

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const pick = (list: readonly string[]): string => list[Math.floor(Math.random() * list.length)];

// Each word's colours, brightest first.
/** Power: white-hot to forge red. */
const POWER_HOT: readonly string[] = [P.white, P.fr6, P.fr5, P.fr4, P.bl4];
const STONE: readonly string[] = [P.st7, P.st6, P.st5, P.er5];
/** Swift: wind. */
const WIND: readonly string[] = [P.white, P.gn5, P.gn4, P.gn3];
/** Twin: a mirror's teal. */
const MIRROR: readonly string[] = [P.white, P.tl5, P.tl4, P.tl3];
/** A flame from its heart to the smoke it ends as. */
const FLAME: readonly string[] = [P.fr6, P.fr5, P.fr5, P.fr4, P.fr4, P.fr3, P.fr3, P.fr2, P.st3];
const EMBER: readonly string[] = [P.fr6, P.fr5, P.fr4, P.fr3];
const SMOKE: readonly string[] = [P.st5, P.st4, P.st3, P.st2];
const ICE: readonly string[] = [P.white, P.bu5, P.bu4, P.bu3];
const SNOW: readonly string[] = [P.white, P.white, P.bu5];
const VOLT: readonly string[] = [P.white, P.lt4, P.lt3, P.lt2];
const BLOOD: readonly string[] = [P.bl5, P.bl4, P.bl3, P.bl2];
const VIOLET: readonly string[] = [P.white, P.pu5, P.pu4, P.pu3, P.pu2];
/** Poison: a sour yellow-green. */
const VENOM: readonly string[] = [P.white, P.vn5, P.vn4, P.vn3, P.vn2];
/** An arrow with no word on it: a steel head, a wooden shaft. */
const ARROW: readonly string[] = [P.white, P.sl5, P.wd5, P.wd4];
/** How fast a volley's arrows fall and rise, in pixels a second. */
const ARROW_FALL = 560;
const BUBBLE: readonly string[] = [P.vn5, P.vn4, P.vn4, P.vn3];
/** The colour each word's name is shown in when it joins an ability. */
export const WORD_HUE: Record<WordId, string> = { power: P.bl4, swift: P.gn4, twin: P.tl4, fire: P.fr4, frost: P.bu4, lightning: P.lt3, leech: P.bl5, volatile: P.pu4, poison: P.vn4, heavy: '#ac8753', precise: '#eef4fa', frenzied: '#ff5c33', guarding: '#30a868', mystical: '#acbcfe', pulling: '#7a76e0', splitting: '#dcaaf6', hexing: '#b8b4c8', stilling: '#86eaae' };

/** No more particles than this are ever alive: past it, new ones are simply not made. */
const MAX_PARTICLES = 900;

/** Keep only the newest `max` things in a list. */
function trim(list: unknown[], max: number): void {
  if (list.length > max) list.splice(0, list.length - max);
}
/**
 * What only dresses the scene (flames off burning ground, trails, snow) starts to thin out when
 * this many particles are in the air, and stops altogether at AMBIENT_FULL. That leaves the rest
 * of the room, up to MAX_PARTICLES, for the hits themselves.
 */
const AMBIENT_EASY = 140;
const AMBIENT_FULL = 420;

/** Plot a 1-pixel line. */
export function pline(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const stepX = x0 < x1 ? 1 : -1;
  const stepY = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 400; n++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += stepX;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += stepY;
    }
  }
}

/** A steady pseudo-random number in 0..1 from two whole numbers (so a decal looks the same every frame). */
function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Seconds a line about a big kill stays over the hero's head. */
const QUIP_TIME = 2.6;
/** How many bodies lie in a dungeon at once (a fallen monster is one picture a frame to draw: this is far more than a screen shows). */
const MAX_FALLEN = 400;

/** A monster that has been killed (Fx.fallen): which figure, where, which way round, and how long ago. */
export interface Fallen {
  figure: MonsterFigure;
  x: number;
  y: number;
  /** It was facing away (up the screen), and to screen-left: its fall is drawn so. */
  back: boolean;
  flip: boolean;
  t: number;
}
/** How long a townsperson's line stays over them, and how far over their feet it is written (clear of their name, which hangs over them while the hero is near). */
const TAG_TIME = 3;
const TAG_LIFT: Record<TownVoice, number> = { armourer: 66, mystic: 102, wordsmith: 62, stranger: 56 };

type Words = readonly WordId[];
const has = (w: Words | undefined, id: WordId): boolean => !!w && w.includes(id);

export class Fx {
  particles: Particle[] = [];
  floaters: Floater[] = [];
  /** The line that last told of might gained ("MIGHT 2"): it is counted up in place while it is fresh. */
  private mightNote: Floater | null = null;
  rings: Ring[] = [];
  slashes: Slash[] = [];
  bolts: Bolt[] = [];
  skyBolts: SkyBolt[] = [];
  beams: Beam[] = [];
  rays: Ray[] = [];
  held: HeldRay[] = [];
  /**
   * Where the hero's figure was drawn this frame, if it was, in game pixels (the renderer says so
   * before drawAir; W and H are the size of the picture). A beam held away up the screen passes
   * behind it: see drawAir.
   */
  heroShape: { img: CanvasImageSource; x: number; y: number; w: number; h: number; W: number; H: number } | null = null;
  /**
   * A warp just made: where the mage vanished from, where they came out, and how long ago, in
   * seconds. The renderer phases the figure out at the one and in at the other (the owner, of the
   * Warp, on his page of notes: "phase out and phase back in"). Null when there has been none lately.
   */
  warp: { x0: number; y0: number; x1: number; y1: number; t: number } | null = null;
  private behindCv: HTMLCanvasElement | null = null;
  whirls: Whirl[] = [];
  /** Arrows of a volley that have come down and stand in the floor for a moment. */
  stuck: { x: number; y: number; t: number; dur: number; color: string; tip: string; lean: number }[] = [];
  /** Arrows of a volley on their way down: each is seen for the moment before it lands. */
  falling: { x: number; y: number; t: number; dur: number; colors: readonly string[]; heavy: boolean }[] = [];
  cracks: Crack[] = [];
  decals: Decal[] = [];
  spikes: Spike[] = [];
  flashes: Flash[] = [];
  wisps: Wisp[] = [];
  /** Phantoms waiting for the renderer to pick them up. */
  ghostAsks: GhostAsk[] = [];
  glows: Glow[] = [];
  messages: Message[] = [];
  shake = 0;
  shakeX = 0;
  shakeY = 0;
  /**
   * Seconds the game should hold almost still: the instant of a heavy hit. The frame loop reads
   * this, slows the game while it is above zero, and counts it down in real time.
   */
  freeze = 0;
  /** Where the hero stands (set by the frame loop): wisps fly to it, embers circle it. */
  hero = { x: 0, y: 0 };
  /** "of Power": how many stacks of might the hero holds, and the seconds they have left. */
  might = { stacks: 0, t: 0 };
  /** Real seconds since the last hold, so quick attacks cannot make the game stutter. */
  private sinceHold = 1;
  /**
   * THE FALLEN (the owner, 5 Oct 2026: "I think we want death animations and corpses for
   * enemies"): every monster killed in this dungeon whose figure has a death (art: AnimSet.clips.
   * die). `t` is the time since the blow: the renderer plays its fall by it, and after that draws
   * its body flat on the floor, where it stays until the hero leaves the dungeon (the renderer
   * empties this when the level is another). There is room for MAX_FALLEN: after that the oldest
   * bodies go.
   */
  fallen: Fallen[] = [];
  /** What the hero is saying about a big kill (it stays over their head for a moment). */
  quip: { text: string; t: number; long?: number } | null = null;
  /**
   * The hero has just come into the world by a warp (picked on a class card: main.ts): how long
   * ago, in seconds. The renderer brings the figure together out of slices for the first of it
   * (render.ts, ARRIVE_IN). Null when there has been none lately.
   */
  arrival: { t: number } | null = null;
  /** What one of the town's people is saying as the hero comes up to them: where they stand, and how high over their feet it is written. */
  tag: { text: string; t: number; x: number; y: number; lift: number } | null = null;
  /** How far above the hero's feet things over their head begin, in game pixels (the renderer says, every frame: heroes are not all one height). */
  headroom = 32;
  /** Words slotted and not yet celebrated, and the time until the next one may be. */
  private joins: { x: number; y: number; word: WordId; name: string }[] = [];
  private joinWait = 0;
  /** Life leeched and not yet shown as a number, and the seconds until it is. */
  private healSum = 0;
  private healWait = 0;
  private pulseWait = 0;
  private clock = 0;
  /** Things that happen a moment after the event that asked for them (Volatile keeps popping). */
  private later: { t: number; fn: () => void }[] = [];
  /** A Mage's untyped damage is drawn in arcane purple rather than steel. */
  arcane = false;

  private ramp(el: Element): readonly string[] {
    if (el === 'phys') return this.arcane ? ELEMENT_RAMP.arcane : ELEMENT_RAMP.phys;
    return ELEMENT_RAMP[el];
  }

  /** The colours of a spell, brightest first: its element's, or with none the violet of magic (whoever cast it). */
  private magic(el: Element): readonly string[] {
    return (el === 'phys' ? ELEMENT_RAMP.arcane : ELEMENT_RAMP[el]).slice().reverse();
  }

  clear(): void {
    this.particles = [];
    this.floaters = [];
    this.mightNote = null;
    this.rings = [];
    this.warp = null;
    this.slashes = [];
    this.bolts = [];
    this.skyBolts = [];
    this.beams = [];
    this.rays = [];
    this.held = [];
    this.whirls = [];
    this.stuck = [];
    this.falling = [];
    this.cracks = [];
    this.decals = [];
    this.spikes = [];
    this.flashes = [];
    this.wisps = [];
    this.ghostAsks = [];
    this.glows = [];
    this.freeze = 0;
    this.quip = null;
    this.arrival = null;
    this.fallen = [];
    this.joins = [];
    this.might.stacks = 0;
    this.might.t = 0;
    this.healSum = 0;
    this.later = [];
  }

  // =============================================================================================
  // Building blocks

  private add(p: Particle): void {
    if (this.particles.length < MAX_PARTICLES) this.particles.push(p);
  }

  /**
   * How much room is left in the air for what only dresses the scene: 1 (plenty) down to 0 (none).
   * Flames off burning ground, trails and snow are thinned by this, so that when a great deal is
   * going on at once the hits themselves still show.
   */
  room(): number {
    const n = this.particles.length;
    return n <= AMBIENT_EASY ? 1 : Math.max(0, 1 - (n - AMBIENT_EASY) / (AMBIENT_FULL - AMBIENT_EASY));
  }

  /** Ask for the game to hold still for a moment (at most a few times a second). (Heavy's look asks too: words3.ts.) */
  hold(sec: number): void {
    if (this.sinceHold < 0.2) return;
    this.sinceHold = 0;
    this.freeze = Math.max(this.freeze, sec);
  }

  private glow(x: number, y: number, r: number, dur: number): void {
    if (this.glows.length < 24) this.glows.push({ x, y, r, t: 0, dur });
  }

  spray(x: number, y: number, n: number, colors: readonly string[], speed: number, up: number, z = 8): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(0.3, 1) * speed;
      this.add({
        x, y, z: z + rnd(-3, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(0.4, 1) * up,
        life: rnd(0.25, 0.6), color: pick(colors), size: Math.random() < 0.3 ? 2 : 1, grav: 140,
      });
    }
  }

  /** A slow rising mote: embers over fire, sparkles over magic. */
  /** The hero arrives by a warp at (x, y), in tiles: the ring and the motes of one; and the renderer phases the figure in (`arrival`). */
  arrive(x: number, y: number): void {
    this.arrival = { t: 0 };
    this.rings.push({ x, y, r: 0.9, t: 0, dur: 0.3, colors: [P.tl5, P.tl4, P.white], fill: false });
    for (let i = 0; i < 18; i++) this.mote(x, y, [P.tl5, P.tl4, P.white]);
  }

  /** The hero says a line: over their head, as their word about a big kill is shown. `long`: for how many seconds (the usual, if not given). */
  say(text: string, long?: number): void {
    this.quip = long === undefined ? { text, t: 0 } : { text, t: 0, long };
  }

  mote(x: number, y: number, colors: readonly string[]): void {
    this.add({
      x: x + rnd(-0.4, 0.4), y: y + rnd(-0.4, 0.4), z: rnd(0, 6), vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2), vz: rnd(14, 30),
      life: rnd(0.4, 0.9), color: pick(colors), size: 1, grav: 0,
    });
  }

  float(x: number, y: number, text: string, color: string, big = false, z = 26): void {
    // (what rises from the hero begins above the bar of life over their head, not on it)
    // (the hero may have moved a step since the thing happened: nothing else stands this near them)
    if (Math.abs(x - this.hero.x) < 0.3 && Math.abs(y - this.hero.y) < 0.3) z = Math.max(z, this.headroom + (big ? 18 : 15));
    // numbers that rise from the same spot at the same moment are stacked one above another,
    // not printed on top of one another (a Twin hit, an arc and a burn can all land at once)
    let lift = 0;
    for (const f of this.floaters) if (f.t < 0.3 && Math.abs(f.x - x) < 0.45 && Math.abs(f.y - y) < 0.45) lift += f.big ? 10 : 7;
    this.floaters.push({ x, y, z: z + Math.min(lift, 42), text, color, t: 0, big, drift: lift > 0 ? rnd(-3, 3) : rnd(-6, 6) });
    if (this.floaters.length > 60) this.floaters.shift();
  }

  /** Lines that fly: wind, sparks, shards. `out` = straight out from (x, y); otherwise along (dx, dy). */
  private streaks(x: number, y: number, n: number, colors: readonly string[], speed: number, len: number, o: { dx?: number; dy?: number; spread?: number; z?: number; up?: number; grav?: number; life?: number; r?: number } = {}): void {
    const base = o.dx !== undefined && o.dy !== undefined ? Math.atan2(o.dy, o.dx) : null;
    for (let i = 0; i < n; i++) {
      const a = base === null ? Math.random() * Math.PI * 2 : base + rnd(-1, 1) * (o.spread ?? 0.4);
      const s = rnd(0.6, 1) * speed;
      const d = rnd(0, o.r ?? 0.2);
      this.add({
        x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 9) + rnd(-3, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(0.3, 1) * (o.up ?? 0),
        life: rnd(0.6, 1) * (o.life ?? 0.22), color: pick(colors), size: 1, grav: o.grav ?? 0, streak: len,
      });
    }
  }

  // =============================================================================================
  // The words' own parts

  /** Flames: they rise, cool from white through orange to red, and end as a wisp of smoke. */
  flames(x: number, y: number, r: number, n: number, up = 1): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      const life = rnd(0.32, 0.7);
      this.add({
        x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(0, 5), vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), vz: rnd(26, 62) * up,
        life, life0: life, ramp: FLAME, color: P.fr5, size: Math.random() < 0.4 ? 3 : 2, grav: -40,
      });
    }
  }

  private smoke(x: number, y: number, r: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      const life = rnd(0.6, 1.2);
      this.add({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(8, 16), vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), vz: rnd(16, 34), life, life0: life, ramp: SMOKE, color: P.st4, size: Math.random() < 0.5 ? 3 : 2, grav: -6 });
    }
  }

  /** Fire lands: a flash, flames over the whole area, embers, smoke, and the floor is left scorched. */
  private fireball(x: number, y: number, r: number, big: boolean): void {
    this.flashes.push({ x, y, z: 6, r: Math.min(1.5, r * 0.5), t: 0, dur: 0.12, colors: [P.white, P.fr6, P.fr5] });
    // (a wide blast needs more fire to look as fierce as a small one)
    this.flames(x, y, r * 0.75, big ? Math.min(44, Math.round(10 + r * r * 3.6)) : 11);
    // a wall of flame round the edge of a big one
    if (big) {
      const n = Math.min(34, Math.round(r * 10));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd(-0.1, 0.1);
        this.flames(x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92, 0.12, 1, 1.25);
      }
    }
    this.streaks(x, y, big ? 12 : 7, EMBER, 4.5, 2, { up: 90, grav: 180, life: 0.5, r: r * 0.4 });
    this.smoke(x, y, r * 0.5, big ? 6 : 3);
    this.scorch(x, y, r * 0.9);
    this.glow(x, y, 30 + r * 22, 0.3);
  }

  private scorch(x: number, y: number, r: number): void {
    // one mark where several overlap: refresh the biggest
    for (const d of this.decals) {
      if (d.kind === 'scorch' && Math.hypot(d.x - x, d.y - y) < 0.5 && d.r >= r - 0.2) {
        d.t = Math.min(d.t, 0.02);
        return;
      }
    }
    this.decals.push({ x, y, r, t: 0, dur: 4.5, kind: 'scorch', seed: Math.floor(Math.random() * 1e6) });
    if (this.decals.length > 36) this.decals.shift();
  }

  private rime(x: number, y: number, r: number, dur = 3.4): void {
    for (const d of this.decals) {
      if (d.kind === 'frost' && Math.hypot(d.x - x, d.y - y) < 0.5 && d.r >= r - 0.2) {
        d.t = Math.min(d.t, 0.02);
        return;
      }
    }
    this.decals.push({ x, y, r, t: 0, dur, kind: 'frost', seed: Math.floor(Math.random() * 1e6) });
    if (this.decals.length > 36) this.decals.shift();
  }

  private snow(x: number, y: number, r: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      this.add({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(12, 30), vx: rnd(-0.5, 0.5), vy: rnd(-0.5, 0.5), vz: rnd(-22, -8), life: rnd(0.7, 1.4), color: pick(SNOW), size: Math.random() < 0.25 ? 2 : 1, grav: 0 });
    }
  }

  /** Splinters of ice thrown out and falling. */
  private shards(x: number, y: number, n: number, speed: number): void {
    this.streaks(x, y, n, ICE, speed, 3, { up: 110, grav: 380, life: 0.55, r: 0.25, z: 10 });
  }

  /**
   * Frost lands: spikes of ice shoot out along the floor from the middle, each ending in an icicle
   * that stands for a moment and breaks; snow drifts down; the floor is left rimed.
   */
  private iceBurst(x: number, y: number, r: number, big: boolean): void {
    const n = big ? Math.min(14, Math.round(6 + r * 3)) : 7;
    const a0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2 + rnd(-0.18, 0.18);
      const r0 = r * (big ? 0.45 : 0.15);
      const r1 = r * rnd(0.82, 1.08);
      this.spikes.push({ x0: x + Math.cos(a) * r0, y0: y + Math.sin(a) * r0, x1: x + Math.cos(a) * r1, y1: y + Math.sin(a) * r1, tall: rnd(4, big ? 10 : 7), t: 0, dur: rnd(0.5, 0.8) });
    }
    while (this.spikes.length > 90) this.spikes.shift();
    this.flashes.push({ x, y, z: 6, r: Math.min(1.2, r * 0.4), t: 0, dur: 0.1, colors: [P.white, P.bu5, P.bu4] });
    this.shards(x, y, big ? 10 : 6, big ? 5 : 3.5);
    this.snow(x, y, r * 0.9, big ? 14 : 7);
    this.rime(x, y, r * 0.95);
  }

  /** The ice breaks: shards and a puff of snow. */
  private shatter(x: number, y: number): void {
    this.flashes.push({ x, y, z: 12, r: 0.45, t: 0, dur: 0.08, colors: [P.white, P.bu5] });
    this.shards(x, y, 12, 4.5);
    this.snow(x, y, 0.5, 6);
  }

  /** A bolt from above onto (x, y): a jagged white line, a fork, a flash where it lands. */
  private skyBolt(x: number, y: number, big: boolean): void {
    const top = big ? 150 : 120;
    const joints = 7;
    const offs: number[] = [];
    let drift = 0;
    for (let i = 0; i < joints; i++) {
      drift += rnd(-7, 7);
      drift *= 0.8;
      offs.push(drift);
    }
    const fork: number[] = [];
    const at = 2 + Math.floor(Math.random() * 3);
    let fx = offs[at];
    const side = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; i < 3; i++) {
      fx += side * rnd(4, 9);
      fork.push(at, fx);
    }
    this.skyBolts.push({ x, y, top, offs, fork, t: 0, dur: big ? 0.2 : 0.16 });
    if (this.skyBolts.length > 14) this.skyBolts.shift();
    this.flashes.push({ x, y, z: 6, r: big ? 0.7 : 0.45, t: 0, dur: 0.1, colors: VOLT });
    this.streaks(x, y, big ? 9 : 5, VOLT, 5, 2, { up: 40, grav: 160, life: 0.28, z: 6 });
    this.glow(x, y, big ? 70 : 46, 0.18);
  }

  /** Lightning along the ground between two points. */
  groundBolt(x0: number, y0: number, x1: number, y1: number, colors?: readonly string[]): void {
    const pts: number[] = [x0, y0];
    const segs = Math.max(3, Math.min(7, Math.round(Math.hypot(x1 - x0, y1 - y0) * 1.6)));
    for (let i = 1; i < segs; i++) {
      const k = i / segs;
      pts.push(x0 + (x1 - x0) * k + rnd(-0.32, 0.32), y0 + (y1 - y0) * k + rnd(-0.32, 0.32));
    }
    pts.push(x1, y1);
    this.bolts.push({ pts, t: 0, colors });
    if (this.bolts.length > 40) this.bolts.shift();
  }

  /** Volatile: the air pops with violet sparks that will not hold still. */
  private crackle(x: number, y: number, r: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      const life = rnd(0.14, 0.32);
      this.add({ x: px, y: py, z: rnd(6, 16), vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), vz: rnd(-10, 30), life, life0: life, ramp: VIOLET, color: P.pu5, size: 3, grav: 0 });
      this.streaks(px, py, 3, VIOLET, 4.5, 3, { life: 0.16, z: 10 });
    }
  }

  /**
   * Volatile over an area: violet arcs jump about inside it, it pops all over, and it goes on
   * popping for a moment after, as if it had not finished going off.
   */
  private unstable(x: number, y: number, r: number): void {
    const arcs = Math.min(7, Math.round(3 + r * 1.5));
    for (let i = 0; i < arcs; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = a + rnd(1.6, 3.4);
      this.groundBolt(x + Math.cos(a) * r * rnd(0.3, 0.95), y + Math.sin(a) * r * rnd(0.3, 0.95), x + Math.cos(b) * r * rnd(0.3, 0.95), y + Math.sin(b) * r * rnd(0.3, 0.95), VIOLET);
    }
    this.crackle(x, y, r * 0.9, Math.min(9, Math.round(3 + r * 2)));
    for (let k = 1; k <= 3; k++) {
      this.later.push({
        t: 0.09 * k + rnd(0, 0.05),
        fn: () => {
          const a = Math.random() * Math.PI * 2;
          const d = Math.sqrt(Math.random()) * r * 0.9;
          this.crackle(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.25, 2);
          this.flashes.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: 8, r: 0.22, t: 0, dur: 0.07, colors: VIOLET });
        },
      });
    }
  }

  /** Volatile on one target: it pops violet, a little arc jumps off it, and it pops again a moment later. */
  private pop(x: number, y: number): void {
    this.flashes.push({ x, y, z: 12, r: 0.34, t: 0, dur: 0.08, colors: VIOLET });
    this.crackle(x, y, 0.4, 3);
    const a = Math.random() * Math.PI * 2;
    this.groundBolt(x, y, x + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, VIOLET);
    this.later.push({
      t: rnd(0.1, 0.16),
      fn: () => {
        const b = Math.random() * Math.PI * 2;
        this.crackle(x + Math.cos(b) * 0.3, y + Math.sin(b) * 0.3, 0.25, 2);
        this.flashes.push({ x: x + Math.cos(b) * 0.3, y: y + Math.sin(b) * 0.3, z: 10, r: 0.2, t: 0, dur: 0.07, colors: VIOLET });
      },
    });
  }

  /** Something Volatile goes off: a violet blast with debris. `big` is a rune; otherwise a monster bursting. */
  private ruin(x: number, y: number, r: number, big: boolean): void {
    this.flashes.push({ x, y, z: 8, r: Math.min(1.7, r * (big ? 0.6 : 0.45)), t: 0, dur: 0.13, colors: VIOLET });
    this.rings.push({ x, y, r: r * 1.08, t: 0, dur: 0.3, colors: VIOLET, fill: false, heavy: big, delay: 0.05 });
    const n = big ? 26 : 14;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(1.5, big ? 6 : 4.5);
      const life = rnd(0.35, 0.75);
      this.add({ x: x + Math.cos(a) * 0.2, y: y + Math.sin(a) * 0.2, z: rnd(2, 10), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(60, big ? 190 : 140), life, life0: life, ramp: VIOLET, color: P.pu4, size: Math.random() < 0.4 ? 3 : 2, grav: 420 });
    }
    this.crackle(x, y, r * 0.8, big ? 7 : 4);
    if (big) this.beams.push({ x, y, w: 9, t: 0, dur: 0.2, colors: VIOLET });
    this.shake = Math.max(this.shake, big ? 4 : 2.4);
    this.glow(x, y, 34 + r * 20, 0.25);
  }

  /** Life drawn out of (x, y): red wisps that curve their way to the hero. */
  private siphon(x: number, y: number, n: number): void {
    if (this.wisps.length > 40) return;
    for (let i = 0; i < n; i++) {
      this.wisps.push({ sx: x + rnd(-0.2, 0.2), sy: y + rnd(-0.2, 0.2), t: -i * 0.04, dur: rnd(0.34, 0.5), bend: rnd(0.5, 1.3) * (i % 2 === 0 ? 1 : -1), lift: rnd(8, 20) });
    }
    this.flashes.push({ x, y, z: 12, r: 0.3, t: 0, dur: 0.1, colors: [P.bl5, P.bl4, P.bl3] });
    this.streaks(x, y, 4, BLOOD, 2.2, 2, { up: 50, grav: 260, life: 0.3, z: 12 });
  }

  /** Poison: bubbles of it rise from (x, y), swell and are gone. */
  bubbles(x: number, y: number, r: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      const life = rnd(0.45, 0.95);
      this.add({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(2, 12), vx: rnd(-0.25, 0.25), vy: rnd(-0.25, 0.25), vz: rnd(9, 24), life, life0: life, ramp: BUBBLE, color: P.vn4, size: Math.random() < 0.35 ? 3 : 2, grav: -8 });
    }
  }

  /** Poison lands: it spatters out low over the floor, a ring of it runs to the edge, and the place bubbles. */
  private venomSplash(x: number, y: number, r: number, big: boolean): void {
    this.flashes.push({ x, y, z: 5, r: Math.min(1.2, r * 0.4), t: 0, dur: 0.12, colors: [P.white, P.vn5, P.vn4] });
    this.rings.push({ x, y, r, t: 0, dur: 0.34, colors: VENOM, fill: true, heavy: big });
    this.rings.push({ x, y, r: r * 0.7, t: 0, dur: 0.3, colors: VENOM, fill: false, delay: 0.08 });
    // droplets thrown out low, that fall and stick
    const n = big ? Math.min(30, Math.round(10 + r * 7)) : 9;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(1.2, big ? 5 : 3.2);
      this.add({ x: x + Math.cos(a) * 0.15, y: y + Math.sin(a) * 0.15, z: rnd(3, 8), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(30, 90), life: rnd(0.4, 0.8), color: pick(VENOM.slice(1)), size: Math.random() < 0.4 ? 3 : 2, grav: 330 });
    }
    this.bubbles(x, y, r * 0.8, big ? Math.min(18, Math.round(6 + r * 4)) : 5);
    // it goes on bubbling for a moment after
    for (let k = 1; k <= 3; k++) this.later.push({ t: 0.16 * k, fn: () => this.bubbles(x, y, r * 0.8, big ? 5 : 2) });
    this.glow(x, y, 26 + r * 16, 0.3);
  }

  /** A breath of wind round (x, y): Swift. */
  private gust(x: number, y: number, r: number): void {
    this.rings.push({ x, y, r, t: 0, dur: 0.22, colors: WIND, fill: false, swirl: true, heavy: true });
    this.rings.push({ x, y, r: r * 0.7, t: 0, dur: 0.2, colors: WIND, fill: false, swirl: true, delay: 0.04 });
    this.streaks(x, y, 12, WIND, r / 0.14, 9, { life: 0.18, z: 3, r: r * 0.25 });
  }

  /**
   * The mark of the Power word where a hit lands: the floor cracks and glows, stone is thrown up,
   * sparks fly, the screen kicks. `big` is an area ability (cracks out to its edge); otherwise it
   * is the knock of a single hit.
   */
  private powerImpact(x: number, y: number, r: number, big: boolean): void {
    const n = big ? 7 : 4;
    const a0 = Math.random() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      const a = a0 + (k / n) * Math.PI * 2 + rnd(-0.25, 0.25);
      const len = r * rnd(0.7, 1.1);
      const segs = big ? 5 : 3;
      const pts: number[] = [x + Math.cos(a) * r * 0.1, y + Math.sin(a) * r * 0.1];
      for (let i = 1; i <= segs; i++) {
        const d = (len * i) / segs;
        const j = rnd(-0.2, 0.2) * (i < segs ? 1 : 0.4);
        pts.push(x + Math.cos(a) * d - Math.sin(a) * j, y + Math.sin(a) * d + Math.cos(a) * j);
      }
      this.cracks.push({ pts, t: 0, dur: big ? 2.4 : 1.5, hot: big ? 0.55 : 0.32 });
      // a short fork off the middle of a long crack
      if (big && Math.random() < 0.55) {
        const m = 2 * (1 + Math.floor(segs / 2));
        const b = a + (Math.random() < 0.5 ? 0.8 : -0.8);
        const bl = len * rnd(0.25, 0.4);
        this.cracks.push({ pts: [pts[m], pts[m + 1], pts[m] + Math.cos(b) * bl * 0.5 + rnd(-0.08, 0.08), pts[m + 1] + Math.sin(b) * bl * 0.5 + rnd(-0.08, 0.08), pts[m] + Math.cos(b) * bl, pts[m + 1] + Math.sin(b) * bl], t: 0, dur: 2.0, hot: 0.4 });
      }
    }
    while (this.cracks.length > 70) this.cracks.shift();
    // stone thrown up: heavier and bigger than sparks, and it falls fast
    const chunks = big ? 18 : 7;
    for (let i = 0; i < chunks; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = rnd(0.1, 0.6) * r;
      const sp = rnd(1.5, big ? 5 : 3.5);
      this.add({
        x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: 1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(70, big ? 190 : 130),
        life: rnd(0.45, 0.85), color: pick(STONE), size: Math.random() < 0.45 ? 3 : 2, grav: 430,
      });
    }
    this.spray(x, y, big ? 16 : 9, POWER_HOT, big ? 5.5 : 4, 100, 6);
    this.flashes.push({ x, y, z: big ? 3 : 10, r: big ? Math.min(1.6, r * 0.5) : 0.55, t: 0, dur: 0.11, colors: POWER_HOT });
    this.shake = Math.max(this.shake, big ? 5.5 : 3.2);
    this.hold(big ? 0.07 : 0.045);
  }

  /**
   * A word has just been put into an ability: its colour bursts from the hero and the new name rises.
   * Several words slotted in one visit to the panel take their turns, so the names can be read.
   */
  wordJoined(x: number, y: number, word: WordId, name: string): void {
    this.joins.push({ x, y, word, name });
  }

  private playJoin(x: number, y: number, word: WordId, name: string): void {
    const hue = WORD_HUE[word];
    const colors = [P.white, hue, hue];
    this.rings.push({ x, y, r: 1.6, t: 0, dur: 0.45, colors, fill: true, heavy: true });
    this.rings.push({ x, y, r: 2.4, t: 0, dur: 0.5, colors, fill: false, delay: 0.12 });
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      this.add({ x: x + Math.cos(a) * 0.5, y: y + Math.sin(a) * 0.5, z: 2, vx: Math.cos(a) * 1.2, vy: Math.sin(a) * 1.2, vz: rnd(50, 110), life: rnd(0.6, 1.1), color: colors[i % 3], size: i % 4 === 0 ? 2 : 1, grav: 50 });
    }
    this.float(x, y, name.toUpperCase(), hue, true, 44);
  }

  /** "of Swiftness": wind streams off a hasted hero as they run. */
  hasteWake(x: number, y: number, dx: number, dy: number): void {
    this.streaks(x, y, 2, WIND, 3, 5, { dx: -dx, dy: -dy, spread: 0.5, life: 0.2, z: 4, r: 0.25 });
  }

  /**
   * What the hero's own shots shed as they fly, by the words in front of them. Call once per game
   * step with the length of the step in sixtieths of a second (see Renderer.draw's `pace`).
   */
  follow(shots: ReadonlyArray<{ x: number; y: number; vx: number; vy: number; hostile: boolean; words: Words; element: Element; n: number }>, pace = 1): void {
    const k = pace * this.room();
    if (k <= 0) return;
    const roll = (p: number): boolean => Math.random() < p * k;
    for (const p of shots) {
      if (p.hostile) continue;
      const w = p.words;
      if (has(w, 'power')) {
        for (let i = 0; i < 2; i++) {
          if (!roll(1)) continue;
          this.add({
            x: p.x + rnd(-0.12, 0.12), y: p.y + rnd(-0.12, 0.12), z: 10 + rnd(-2, 2), vx: rnd(-0.7, 0.7), vy: rnd(-0.7, 0.7), vz: rnd(-12, 26),
            life: rnd(0.16, 0.38), color: POWER_HOT[Math.floor(Math.random() * 4)], size: Math.random() < 0.35 ? 2 : 1, grav: 60,
          });
        }
      }
      // wind peels off a swift shot, straight back along its path
      if (has(w, 'swift') && roll(0.8)) this.streaks(p.x, p.y, 1, WIND, 1.5, 5, { dx: -p.vx, dy: -p.vy, spread: 0.25, life: 0.16, z: 10, r: 0.15 });
      if (has(w, 'twin') && roll(p.n > 0 ? 0.9 : 0.4)) this.add({ x: p.x + rnd(-0.08, 0.08), y: p.y + rnd(-0.08, 0.08), z: 10, vx: 0, vy: 0, vz: 0, life: rnd(0.2, 0.34), color: pick(MIRROR), size: p.n > 0 && Math.random() < 0.5 ? 2 : 1, grav: 0 });
      if (p.element === 'fire' && roll(0.85)) {
        this.flames(p.x, p.y, 0.12, 1, 0.6);
        if (Math.random() < 0.2) this.smoke(p.x, p.y, 0.1, 1);
      }
      if (p.element === 'frost' && roll(0.7)) this.snow(p.x, p.y, 0.2, 1);
      if (p.element === 'lightning' && roll(0.3)) {
        const a = Math.random() * Math.PI * 2;
        this.groundBolt(p.x, p.y, p.x + Math.cos(a) * 0.7, p.y + Math.sin(a) * 0.7);
      }
      if (has(w, 'leech') && roll(0.5)) this.add({ x: p.x + rnd(-0.1, 0.1), y: p.y + rnd(-0.1, 0.1), z: 9, vx: 0, vy: 0, vz: 0, life: rnd(0.25, 0.45), color: pick(BLOOD), size: Math.random() < 0.3 ? 2 : 1, grav: 220 });
      if (has(w, 'volatile') && roll(0.45)) this.crackle(p.x, p.y, 0.25, 1);
      // a poisoned shot drips as it flies
      if (has(w, 'poison') && roll(0.7)) this.add({ x: p.x + rnd(-0.1, 0.1), y: p.y + rnd(-0.1, 0.1), z: 9, vx: 0, vy: 0, vz: rnd(-6, 6), life: rnd(0.3, 0.55), color: pick(BUBBLE), size: Math.random() < 0.4 ? 2 : 1, grav: 170 });
    }
  }

  // =============================================================================================
  // Events

  handle(events: GameEvent[], play: (name: Sfx, vol?: number) => void): void {
    for (const e of events) {
      switch (e.t) {
        case 'hit': {
          if (e.poison) {
            // poison working: its own colour, a bubble, and no more than that (it ticks all the time)
            this.float(e.x, e.y, e.onHero ? `-${e.amount}` : `${e.amount}`, e.onHero ? P.vn4 : P.vn5, false, e.onHero ? 30 : 22);
            if (Math.random() < 0.6) this.bubbles(e.x, e.y, 0.2, 1);
            break;
          }
          const ramp = this.ramp(e.el);
          if (e.onHero) this.float(e.x, e.y, `-${e.amount}`, P.bl4, false, 30);
          else this.float(e.x, e.y, e.crit ? `${e.amount}!` : `${e.amount}`, e.crit ? P.gd4 : e.el === 'phys' ? P.white : ramp[ramp.length - 2], e.crit || !!e.heavy);
          this.spray(e.x, e.y, e.onHero ? 5 : 3, e.onHero ? [P.bl4, P.bl3] : ramp, 2.2, 50, 12);
          if (e.heavy) {
            // Power lands: a burst of light on the target, and the game holds its breath
            this.flashes.push({ x: e.x, y: e.y, z: 12, r: 0.5, t: 0, dur: 0.1, colors: POWER_HOT });
            this.spray(e.x, e.y, 6, POWER_HOT, 3.5, 80, 12);
            this.shake = Math.max(this.shake, 2.6);
            this.hold(0.045);
          }
          // each word in front leaves its own mark on what it hits
          const w = e.words;
          if (w) {
            if (has(w, 'swift')) {
              this.streaks(e.x, e.y, 6, WIND, 9, 6, { life: 0.13, z: 12 });
              this.rings.push({ x: e.x, y: e.y, r: 0.62, t: 0, dur: 0.16, colors: WIND, fill: false, swirl: true });
            }
            if (has(w, 'twin')) this.spray(e.x, e.y, 4, MIRROR, 2.6, 60, 12);
            if (has(w, 'fire')) {
              this.flames(e.x, e.y, 0.25, 3);
              this.streaks(e.x, e.y, 3, EMBER, 3.5, 2, { up: 70, grav: 180, life: 0.4 });
            }
            if (has(w, 'frost')) {
              this.shards(e.x, e.y, 3, 3);
              this.snow(e.x, e.y, 0.3, 3);
            }
            if (has(w, 'lightning')) this.streaks(e.x, e.y, 5, VOLT, 5, 2, { up: 30, grav: 120, life: 0.22, z: 12 });
            if (has(w, 'leech')) this.streaks(e.x, e.y, 4, BLOOD, 2.4, 2, { up: 60, grav: 300, life: 0.4, z: 12 });
            if (has(w, 'volatile')) this.pop(e.x, e.y);
            if (has(w, 'poison')) {
              this.streaks(e.x, e.y, 5, VENOM.slice(1), 2.6, 2, { up: 70, grav: 300, life: 0.4, z: 12 });
              this.bubbles(e.x, e.y, 0.25, 3);
            }
          }
          break;
        }
        case 'poisoned':
          // poison takes hold: a sour puff closes on it
          this.rings.push({ x: e.x, y: e.y, r: 0.7, t: 0, dur: 0.26, colors: VENOM, fill: true, closing: true });
          this.bubbles(e.x, e.y, 0.3, 6);
          play('leech', 0.35);
          break;
        case 'swing': {
          const w = e.words;
          const heavy = has(w, 'power');
          const plain = e.el === 'phys' ? [P.sl5, P.sl4, P.sl3] : this.ramp(e.el).slice().reverse();
          const a = Math.atan2(e.dy, e.dx);
          const second = (e.n ?? 0) > 0;
          // Power on a plain blade burns white-hot; on an element it keeps the element's colours
          let colors: readonly string[] = heavy && e.el === 'phys' ? POWER_HOT : plain;
          const fast = has(w, 'swift');
          if (e.el === 'phys' && !heavy) {
            if (fast) colors = WIND;
            else if (has(w, 'leech')) colors = [P.white, P.bl5, P.bl4];
            else if (has(w, 'volatile')) colors = [P.white, P.pu5, P.pu4];
            else if (has(w, 'poison')) colors = [P.white, P.vn5, P.vn4];
          }
          if (second && e.el === 'phys' && !heavy) colors = MIRROR;
          if (e.echo) colors = MIRROR;
          this.slashes.push({ x: e.x, y: e.y, a, reach: e.reach, t: 0, dur: fast ? 0.13 : heavy ? 0.24 : 0.16, colors, heavy, fast, rev: second, jag: e.el === 'lightning', faint: e.echo });
          const tipX = e.x + e.dx * e.reach * 0.85;
          const tipY = e.y + e.dy * e.reach * 0.85;
          if (fast) {
            // wind thrown off the cut, and a blur of the hero behind it
            this.streaks(e.x + e.dx * e.reach * 0.4, e.y + e.dy * e.reach * 0.4, 11, WIND, 11, 11, { dx: e.dx, dy: e.dy, spread: 0.9, life: 0.16, z: 10, r: e.reach * 0.5 });
            if (!e.echo) {
              this.ghostAsks.push({ x: e.x - e.dx * 0.6, y: e.y - e.dy * 0.6, dx: e.dx, dy: e.dy, color: P.gn4, dur: 0.18, delay: 0, alpha: 0.42 });
              this.ghostAsks.push({ x: e.x - e.dx * 1.2, y: e.y - e.dy * 1.2, dx: e.dx, dy: e.dy, color: P.gn3, dur: 0.26, delay: 0, alpha: 0.24 });
            }
          }
          if (second && !e.echo) {
            // the twin: a phantom beside the hero makes the second cut
            this.ghostAsks.push({ x: e.x + e.dy * 0.7, y: e.y - e.dx * 0.7, dx: e.dx, dy: e.dy, color: P.tl4, dur: 0.32, delay: 0, alpha: 0.85 });
            this.spray(e.x + e.dy * 0.7, e.y - e.dx * 0.7, 8, MIRROR, 2.2, 70, 10);
            this.flashes.push({ x: e.x + e.dy * 0.7, y: e.y - e.dx * 0.7, z: 14, r: 0.3, t: 0, dur: 0.09, colors: MIRROR });
            play('echo', 0.35);
          }
          if (e.el === 'fire') {
            // flames stand along the path of the blade
            for (let i = 0; i < 6; i++) {
              const b = a + (i / 5 - 0.5) * 1.6;
              this.flames(e.x + Math.cos(b) * e.reach * 0.88, e.y + Math.sin(b) * e.reach * 0.88, 0.1, 1);
            }
            this.streaks(tipX, tipY, 4, EMBER, 4, 2, { dx: e.dx, dy: e.dy, spread: 1.2, up: 60, grav: 160, life: 0.4 });
          } else if (e.el === 'frost') {
            for (let i = 0; i < 5; i++) {
              const b = a + (i / 4 - 0.5) * 1.6;
              this.shards(e.x + Math.cos(b) * e.reach * 0.88, e.y + Math.sin(b) * e.reach * 0.88, 1, 2.5);
            }
            this.snow(tipX, tipY, 0.6, 4);
          } else if (e.el === 'lightning') {
            const b = a + rnd(-0.6, 0.6);
            this.groundBolt(e.x + Math.cos(a - 0.7) * e.reach * 0.9, e.y + Math.sin(a - 0.7) * e.reach * 0.9, e.x + Math.cos(a + 0.7) * e.reach * 0.9, e.y + Math.sin(a + 0.7) * e.reach * 0.9);
            this.streaks(e.x + Math.cos(b) * e.reach, e.y + Math.sin(b) * e.reach, 4, VOLT, 4, 2, { life: 0.2 });
          }
          if (has(w, 'leech')) this.streaks(tipX, tipY, 5, BLOOD, 2, 2, { dx: e.dx, dy: e.dy, spread: 1.4, up: 20, grav: 260, life: 0.4, z: 12, r: 0.4 });
          if (has(w, 'volatile')) {
            for (let i = 0; i < 3; i++) {
              const b = a + rnd(-0.8, 0.8);
              this.crackle(e.x + Math.cos(b) * e.reach * 0.9, e.y + Math.sin(b) * e.reach * 0.9, 0.15, 1);
            }
          }
          if (has(w, 'poison')) {
            // venom flies off the blade along its path
            for (let i = 0; i < 5; i++) {
              const b = a + (i / 4 - 0.5) * 1.6;
              this.streaks(e.x + Math.cos(b) * e.reach * 0.88, e.y + Math.sin(b) * e.reach * 0.88, 1, VENOM.slice(1), 2.4, 2, { dx: Math.cos(b), dy: Math.sin(b), spread: 0.5, up: 30, grav: 260, life: 0.35, z: 11 });
            }
            this.bubbles(tipX, tipY, 0.3, 2);
          }
          break;
        }
        case 'cast': {
          const w = e.words;
          const mx = e.x + e.dx * 0.5;
          const my = e.y + e.dy * 0.5;
          if (e.echo) {
            // the phantom lets go
            this.flashes.push({ x: e.x, y: e.y, z: 12, r: 0.5, t: 0, dur: 0.1, colors: MIRROR });
            this.spray(e.x, e.y, 8, MIRROR, 2.4, 70, 10);
          } else if (has(w, 'swift')) play('gust', e.kind === 'melee' || e.kind === 'projectile' || e.kind === 'wave' || e.kind === 'leap' || e.kind === 'roll' || e.kind === 'warp' ? 0.22 : 0.5);
          if (e.kind === 'projectile' || e.kind === 'wave' || e.kind === 'volley') {
            // the launch shows what the shot carries
            if (has(w, 'power')) {
              this.rings.push({ x: e.x, y: e.y, r: 0.9, t: 0, dur: 0.18, colors: POWER_HOT, fill: false });
              this.spray(mx, my, 7, POWER_HOT, 3, 60, 10);
              this.shake = Math.max(this.shake, 1.6);
            }
            if (has(w, 'swift')) {
              this.rings.push({ x: e.x, y: e.y, r: 0.8, t: 0, dur: 0.16, colors: WIND, fill: false, swirl: true });
              this.streaks(e.x, e.y, 8, WIND, 9, 10, { dx: -e.dx, dy: -e.dy, spread: 0.5, life: 0.16, z: 10 });
            }
            if (has(w, 'twin') && !e.echo) {
              // one shot splits in two
              for (const side of [-1, 1]) this.flashes.push({ x: mx - e.dy * 0.3 * side, y: my + e.dx * 0.3 * side, z: 10, r: 0.22, t: 0, dur: 0.09, colors: MIRROR });
              this.spray(mx, my, 6, MIRROR, 2.2, 40, 10);
              play('echo', 0.35);
            }
            if (e.el === 'fire') this.flames(mx, my, 0.2, 4);
            else if (e.el === 'frost') this.snow(mx, my, 0.3, 5);
            else if (e.el === 'lightning') this.streaks(mx, my, 5, VOLT, 4, 2, { life: 0.2 });
            if (has(w, 'leech')) this.streaks(mx, my, 4, BLOOD, 2, 2, { up: 30, grav: 240, life: 0.35 });
            if (has(w, 'volatile')) this.crackle(mx, my, 0.3, 3);
            if (has(w, 'poison')) this.bubbles(mx, my, 0.3, 4);
          }
          // every word behind the ability stirs at the hero's feet as it is used
          if (!e.echo) {
            for (const b of e.behind) {
              const hue = WORD_HUE[b];
              // (Might, Swiftness and Echoes have their own sign round the hero; the others get a pulse)
              if (b !== 'power' && b !== 'swift' && b !== 'twin') this.rings.push({ x: e.x, y: e.y, r: 0.7, t: 0, dur: 0.2, colors: [P.white, hue, hue], fill: false });
              for (let i = 0; i < 4; i++) {
                const a = Math.random() * Math.PI * 2;
                this.add({ x: e.x + Math.cos(a) * 0.35, y: e.y + Math.sin(a) * 0.35, z: 1, vx: Math.cos(a) * 0.5, vy: Math.sin(a) * 0.5, vz: rnd(30, 60), life: rnd(0.3, 0.55), color: i === 0 ? P.white : hue, size: 1, grav: 30 });
              }
            }
          }
          break;
        }
        case 'worded':
          break; // the frame loop places this one: it knows where the hero stands
        case 'quip':
          this.quip = { text: e.text, t: 0 };
          break;
        case 'tag':
          this.tag = { text: e.text, t: 0, x: e.x, y: e.y, lift: TAG_LIFT[e.who] };
          break;
        case 'burst': {
          const w = e.words;
          const ramp = this.ramp(e.el);
          const power = has(w, 'power');
          const second = (e.n ?? 0) > 0;
          const area = e.style !== 'shock';
          if (e.style === 'ruin') {
            // a rune goes off
            this.rings.push({ x: e.x, y: e.y, r: e.r, t: 0, dur: 0.3, colors: VIOLET, fill: true, heavy: true });
            this.ruin(e.x, e.y, e.r, true);
            break;
          }
          if (e.style === 'whirl') {
            // One turn of a whirlwind: the path of the blade, in the colours a sword cut has, and
            // a little of whatever the blade carries thrown off round it. (It comes three times a
            // second: no fireballs.)
            const quick = has(w, 'swift');
            let cs: readonly string[] = power && e.el === 'phys' ? POWER_HOT : e.el === 'phys' ? [P.sl5, P.sl4, P.sl3] : ramp.slice().reverse();
            if (e.el === 'phys' && !power) {
              if (quick) cs = WIND;
              else if (has(w, 'leech')) cs = [P.white, P.bl5, P.bl4];
              else if (has(w, 'volatile')) cs = [P.white, P.pu5, P.pu4];
              else if (has(w, 'poison')) cs = [P.white, P.vn5, P.vn4];
            }
            if (e.echo || (second && e.el === 'phys' && !power)) cs = MIRROR;
            this.whirls.push({ x: e.x, y: e.y, r: e.r, t: 0, dur: quick ? 0.22 : 0.3, colors: cs, heavy: power, jag: e.el === 'lightning', faint: !!e.echo, rev: second });
            if (power) this.shake = Math.max(this.shake, 1.2);
            if (second && !e.echo) play('echo', 0.25);
            const bits = e.echo ? 2 : 4;
            const a0 = Math.random() * Math.PI * 2;
            for (let i = 0; i < bits; i++) {
              const a = a0 + (i / bits) * Math.PI * 2;
              const x = e.x + Math.cos(a) * e.r * 0.85;
              const y = e.y + Math.sin(a) * e.r * 0.85;
              if (e.el === 'fire') this.flames(x, y, 0.2, 1);
              else if (e.el === 'frost') this.snow(x, y, 0.3, 2);
              else if (e.el === 'lightning') this.streaks(x, y, 2, VOLT, 4, 2, { life: 0.2 });
              if (quick) this.streaks(x, y, 1, WIND, 9, 8, { dx: -Math.sin(a), dy: Math.cos(a), spread: 0.2, life: 0.15, z: 10 });
              if (has(w, 'leech') && i % 2 === 0) this.streaks(x, y, 1, BLOOD, 2, 2, { up: 20, grav: 240, life: 0.4, z: 10 });
              if (has(w, 'volatile') && i % 2 === 1) this.crackle(x, y, 0.15, 1);
              if (has(w, 'poison') && i % 2 === 0) this.bubbles(x, y, 0.2, 1);
            }
            break;
          }
          let colors: readonly string[] = e.style === 'slam' || e.style === 'land' ? (e.el === 'phys' ? [P.st7, P.st6, P.er5] : ramp) : ramp;
          const fast = has(w, 'swift');
          if (e.el === 'phys' && !power) {
            if (fast) colors = WIND;
            else if (has(w, 'leech')) colors = BLOOD;
            else if (has(w, 'volatile')) colors = VIOLET;
            else if (has(w, 'poison')) colors = VENOM;
          }
          if (e.echo) colors = MIRROR;
          else if (second && e.el === 'phys') colors = MIRROR;
          if (area) {
            this.rings.push({
              x: e.x, y: e.y, r: e.r, t: 0, dur: fast ? 0.14 : e.style === 'nova' ? 0.32 : 0.26, colors,
              fill: e.style !== 'warp' && !e.echo, heavy: power, jag: e.el === 'lightning', double: second || e.echo,
            });
          }
          if (power) {
            // Power's own mark, on top of whatever the ability does
            this.powerImpact(e.x, e.y, e.r, area);
            this.rings.push({ x: e.x, y: e.y, r: e.r * (area ? 1.12 : 1), t: 0, dur: area ? 0.34 : 0.22, colors: e.el === 'phys' ? POWER_HOT : ramp, fill: false, heavy: area, delay: area ? 0.07 : 0 });
          }
          if (!area) break;
          if (e.style === 'warp') {
            for (let i = 0; i < 14; i++) this.mote(e.x, e.y, [P.tl5, P.tl4, P.white]);
            // (the rules send two of these in one step: where the mage went from, then where they came out)
            if (this.warp && this.warp.t <= 0) {
              this.warp.x1 = e.x;
              this.warp.y1 = e.y;
            } else this.warp = { x0: e.x, y0: e.y, x1: e.x, y1: e.y, t: 0 };
            break;
          }
          // the element's body
          if (e.el === 'fire') this.fireball(e.x, e.y, e.r, e.r > 1.7);
          else if (e.el === 'frost') this.iceBurst(e.x, e.y, e.r, e.r > 1.7);
          else if (e.el === 'lightning') {
            // bolts run out from the middle to the edge, and one comes down in the centre
            const n = Math.min(7, Math.round(3 + e.r));
            const a0 = Math.random() * Math.PI * 2;
            for (let i = 0; i < n; i++) {
              const a = a0 + (i / n) * Math.PI * 2 + rnd(-0.3, 0.3);
              this.groundBolt(e.x, e.y, e.x + Math.cos(a) * e.r * 0.95, e.y + Math.sin(a) * e.r * 0.95);
            }
            if (e.r > 1.7) this.skyBolt(e.x, e.y, true);
            this.streaks(e.x, e.y, 8, VOLT, e.r * 3, 2, { life: 0.25, r: e.r * 0.6 });
          } else {
            const n = Math.min(40, Math.round(8 + e.r * 9));
            for (let i = 0; i < n; i++) {
              const a = Math.random() * Math.PI * 2;
              const d = rnd(0.2, 1) * e.r;
              this.add({
                x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, z: 1, vx: Math.cos(a) * rnd(1, 3), vy: Math.sin(a) * rnd(1, 3), vz: rnd(30, 80),
                life: rnd(0.25, 0.55), color: pick(colors), size: Math.random() < 0.4 ? 2 : 1, grav: 160,
              });
            }
          }
          // the other words, each in its own colour and shape
          if (fast) {
            // the blast is there at once, and a whirl of wind tears outward past its edge
            this.rings.push({ x: e.x, y: e.y, r: e.r * 1.25, t: 0, dur: 0.24, colors: WIND, fill: false, swirl: true, heavy: true });
            this.rings.push({ x: e.x, y: e.y, r: e.r * 0.8, t: 0, dur: 0.2, colors: WIND, fill: false, swirl: true, delay: 0.05 });
            this.streaks(e.x, e.y, 20, WIND, e.r / 0.1, 12, { life: 0.17, z: 3, r: e.r * 0.3 });
            this.shake = Math.max(this.shake, 1.4);
          }
          if (second && !e.echo) {
            // the twin: a phantom of the hero on the far side of the blast brings down the second one
            const px = 2 * e.x - this.hero.x;
            const py = 2 * e.y - this.hero.y;
            const far = Math.hypot(px - this.hero.x, py - this.hero.y) > 0.6;
            const gx = far ? px : e.x + 0.8;
            const gy = far ? py : e.y - 0.8;
            const len = Math.hypot(e.x - gx, e.y - gy) || 1;
            this.ghostAsks.push({ x: gx, y: gy, dx: (e.x - gx) / len, dy: (e.y - gy) / len, color: P.tl4, dur: 0.36, delay: 0, alpha: 0.85 });
            this.flashes.push({ x: gx, y: gy, z: 14, r: 0.32, t: 0, dur: 0.1, colors: MIRROR });
            this.spray(gx, gy, 8, MIRROR, 2.2, 70, 8);
            this.rings.push({ x: e.x, y: e.y, r: e.r * 0.9, t: 0, dur: 0.28, colors: MIRROR, fill: true, heavy: true, delay: 0.03 });
            play('echo', 0.45);
          } else if (e.echo && e.el !== 'phys') this.rings.push({ x: e.x, y: e.y, r: e.r * 0.9, t: 0, dur: 0.24, colors: MIRROR, fill: false, delay: 0.04 });
          if (has(w, 'leech')) {
            // the blast pulls back toward its middle
            this.rings.push({ x: e.x, y: e.y, r: e.r, t: 0, dur: 0.3, colors: BLOOD, fill: false, closing: true, delay: 0.08, heavy: e.r > 1.7 });
            this.streaks(e.x, e.y, Math.min(24, Math.round(6 + e.r * 5)), BLOOD, 2.5, 2, { up: 70, grav: 240, life: 0.45, r: e.r * 0.8 });
          }
          if (has(w, 'poison')) this.venomSplash(e.x, e.y, e.r, e.r > 1.7);
          if (has(w, 'volatile')) {
            if (e.style === 'blast' && w && w.length === 1) this.ruin(e.x, e.y, e.r, false);
            else {
              this.unstable(e.x, e.y, e.r);
              this.rings.push({ x: e.x, y: e.y, r: e.r * 0.85, t: 0, dur: 0.24, colors: VIOLET, fill: false, jag: true, heavy: true, delay: 0.06 });
            }
          }
          break;
        }
        case 'arc': {
          if (e.sky) {
            this.skyBolt(e.x1, e.y1, false);
            break;
          }
          this.groundBolt(e.x0, e.y0, e.x1, e.y1);
          this.flashes.push({ x: e.x1, y: e.y1, z: 10, r: 0.3, t: 0, dur: 0.08, colors: VOLT });
          this.streaks(e.x1, e.y1, 4, VOLT, 4, 2, { up: 30, grav: 120, life: 0.22, z: 12 });
          break;
        }
        case 'buff': {
          if (e.kind === 'haste') {
            // Swift behind: a gust lifts round the hero
            this.gust(e.x, e.y, 1.3);
            this.streaks(e.x, e.y, 8, WIND, 0.6, 5, { up: 150, life: 0.3, z: 2, r: 0.5 });
            play('gust', 0.6);
          } else {
            // Power behind: strength is drawn in from all round and stacks up, an ember for each stack
            const full = e.stacks >= 5;
            const grew = e.stacks > this.might.stacks;
            this.might.stacks = e.stacks;
            this.might.t = 5;
            // (Might is built by blows that land, since Version 12.2: a beam, a whirlwind or a
            // volley lands several a second. One that only keeps the might up is not shown again:
            // the embers round the hero already say how much there is.)
            if (!grew) break;
            this.rings.push({ x: e.x, y: e.y, r: 1.3 + e.stacks * 0.12, t: 0, dur: 0.26, colors: [P.bl4, P.fr4, P.fr5, P.white], fill: false, heavy: true, closing: true });
            for (let i = 0; i < 6 + e.stacks * 3; i++) {
              const life = rnd(0.3, 0.6);
              this.add({ x: e.x + rnd(-0.3, 0.3), y: e.y + rnd(-0.3, 0.3), z: rnd(0, 8), vx: 0, vy: 0, vz: rnd(60, 160), life, life0: life, ramp: POWER_HOT, color: P.fr5, size: i % 3 === 0 ? 3 : 2, grav: -40 });
            }
            if (grew) {
              this.flashes.push({ x: e.x, y: e.y, z: 12, r: 0.35 + e.stacks * 0.07, t: 0, dur: 0.1, colors: POWER_HOT });
              // (five stacks can come inside a second, from a beam, a whirlwind or a volley: the
              // count is then one line that counts up, not five lines climbing over each other)
              const text = full ? 'FULL MIGHT' : `MIGHT ${e.stacks}`;
              const last = this.mightNote;
              if (last && last.t < 0.45 && this.floaters.includes(last)) {
                last.text = text;
                last.color = full ? P.fr6 : P.fr4;
                last.big = full;
              } else {
                this.float(e.x, e.y, text, full ? P.fr6 : P.fr4, full, 40);
                this.mightNote = this.floaters[this.floaters.length - 1] ?? null;
              }
              this.shake = Math.max(this.shake, full ? 3 : 1.2);
            }
            play('might', 0.35 + e.stacks * 0.08);
          }
          break;
        }
        case 'echo': {
          // Twin behind: a phantom stays where the hero stood, a ring closes on it, and then it acts
          // (it stands a step to one side, so it shows even if the hero has not moved)
          const gx = e.x + e.dy * 0.85;
          const gy = e.y - e.dx * 0.85;
          this.ghostAsks.push({ x: gx, y: gy, dx: e.dx, dy: e.dy, color: P.tl4, dur: e.delay + 0.25, delay: 0.04, alpha: 0.75 });
          this.rings.push({ x: gx, y: gy, r: 1.2, t: 0, dur: e.delay, colors: [P.tl3, P.tl4, P.tl5, P.white], fill: false, closing: true, heavy: true });
          this.spray(gx, gy, 8, MIRROR, 1.6, 60, 6);
          this.later.push({ t: e.delay, fn: () => this.flashes.push({ x: gx, y: gy, z: 14, r: 0.5, t: 0, dur: 0.12, colors: MIRROR }) });
          play('echo', 0.5);
          break;
        }
        case 'zone': {
          // The moment the ground is changed. A shot leaves a small patch every step of its way:
          // those get a lighter touch each (there are many), and lighter still when the air is full.
          const small = e.r < 1.2;
          const k = small ? this.room() : 1;
          const few = (n: number): number => Math.floor(n * k) + (Math.random() < (n * k) % 1 ? 1 : 0);
          if (e.kind === 'burn') {
            this.flames(e.x, e.y, e.r * 0.8, small ? few(4) : Math.min(14, Math.round(5 + e.r * 5)));
            this.streaks(e.x, e.y, small ? few(2) : 5, EMBER, 3.5, 2, { up: 80, grav: 170, life: 0.45, r: e.r * 0.5 });
            this.scorch(e.x, e.y, e.r * 0.95);
          } else if (e.kind === 'ice') {
            const n = small ? 3 : Math.min(10, Math.round(4 + e.r * 3));
            const a0 = Math.random() * Math.PI * 2;
            for (let i = 0; i < n; i++) {
              const a = a0 + (i / n) * Math.PI * 2 + rnd(-0.2, 0.2);
              this.spikes.push({ x0: e.x + Math.cos(a) * e.r * 0.5, y0: e.y + Math.sin(a) * e.r * 0.5, x1: e.x + Math.cos(a) * e.r * rnd(0.85, 1.05), y1: e.y + Math.sin(a) * e.r * rnd(0.85, 1.05), tall: rnd(3, 7), t: 0, dur: rnd(0.6, 0.9) });
            }
            this.snow(e.x, e.y, e.r, small ? few(3) : Math.min(10, Math.round(4 + e.r * 3)));
          } else if (e.kind === 'storm') {
            if (!small || Math.random() < 0.5) this.flashes.push({ x: e.x, y: e.y, z: small ? 34 : 44, r: small ? 0.4 : 0.6, t: 0, dur: 0.1, colors: VOLT });
            this.streaks(e.x, e.y, small ? few(3) : 6, VOLT, 3, 2, { life: 0.25, r: e.r * 0.6, z: 4 });
          } else if (e.kind === 'venom') {
            // the cloud billows out from where the attack hit
            this.rings.push({ x: e.x, y: e.y, r: e.r, t: 0, dur: 0.4, colors: VENOM.slice(1), fill: true });
            this.bubbles(e.x, e.y, e.r * 0.8, Math.min(16, Math.round(6 + e.r * 4)));
          } else if (e.kind === 'rune') {
            // a rune is written (cracked ground and a ward are the new words' looks: words3.ts)
            this.rings.push({ x: e.x, y: e.y, r: 1.0, t: 0, dur: 0.22, colors: VIOLET, fill: false, closing: true });
            this.crackle(e.x, e.y, 0.5, 4);
          }
          break;
        }
        case 'mark': {
          // "of Leeching" on something still alive: it is marked for the harvest
          this.rings.push({ x: e.x, y: e.y, r: 0.6, t: 0, dur: 0.24, colors: BLOOD, fill: false, closing: true });
          this.streaks(e.x, e.y, 3, BLOOD, 1.2, 2, { up: 80, grav: 300, life: 0.4, z: 14 });
          this.flashes.push({ x: e.x, y: e.y, z: 22, r: 0.16, t: 0, dur: 0.12, colors: [P.white, P.bl5, P.bl4] });
          break;
        }
        case 'leech': {
          this.siphon(e.x, e.y, Math.max(3, Math.min(6, Math.round(2 + e.n / 2))));
          this.healSum += e.n;
          break;
        }
        case 'orb': {
          // the life is torn out of it: a red column, and the orb is left
          const life = 0.5;
          for (let i = 0; i < 12; i++) this.add({ x: e.x + rnd(-0.15, 0.15), y: e.y + rnd(-0.15, 0.15), z: rnd(4, 14), vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), vz: rnd(70, 150), life: rnd(0.3, life), color: pick(BLOOD), size: i % 3 === 0 ? 2 : 1, grav: 120 });
          this.rings.push({ x: e.x, y: e.y, r: 0.8, t: 0, dur: 0.3, colors: BLOOD, fill: false, closing: true });
          this.flashes.push({ x: e.x, y: e.y, z: 10, r: 0.35, t: 0, dur: 0.1, colors: [P.white, P.bl5, P.bl4] });
          break;
        }
        case 'heal': {
          const h = this.hero;
          this.rings.push({ x: h.x, y: h.y, r: 1.0, t: 0, dur: 0.3, colors: [P.white, P.bl5, P.bl4], fill: true });
          for (let i = 0; i < 10; i++) this.mote(h.x, h.y, [P.bl5, P.white, P.bl4]);
          this.float(h.x, h.y, `+${e.amount}`, P.bl5, true, 34);
          break;
        }
        case 'ignite':
          this.flames(e.x, e.y, 0.3, 7);
          this.flashes.push({ x: e.x, y: e.y, z: 10, r: 0.3, t: 0, dur: 0.08, colors: [P.fr6, P.fr5] });
          break;
        case 'freeze':
          // it freezes solid: ice bursts up round it
          this.iceBurst(e.x, e.y, 0.8, false);
          break;
        case 'shatter': {
          // (a monster killed while it was frozen goes to pieces with the ice: it leaves no body.
          // The rules say `die` and then `shatter`, in the one step; ice that only wears off says `shatter` alone.)
          const last = this.fallen[this.fallen.length - 1];
          if (last && last.t === 0 && last.x === e.x && last.y === e.y) this.fallen.pop();
          this.shatter(e.x, e.y);
          break;
        }
        case 'die': {
          const colors = DEATH_COLORS[figureOf(e)];
          // (it falls as its figure falls, facing the way it was; the renderer leaves it out if its figure has no death)
          this.fallen.push({ figure: figureOf(e), x: e.x, y: e.y, back: e.fx + e.fy < -0.2, flip: e.fx - e.fy < 0, t: 0 });
          if (this.fallen.length > MAX_FALLEN) this.fallen.shift();
          this.spray(e.x, e.y, e.boss ? 70 : e.champion ? 44 : e.elite ? 26 : 12, colors, e.boss ? 5 : e.champion ? 4 : 3, e.boss ? 120 : e.champion ? 100 : 80, 10);
          if (e.boss || e.elite) this.rings.push({ x: e.x, y: e.y, r: e.boss ? 3 : e.champion ? 2.3 : 1.6, t: 0, dur: 0.4, colors: [P.fr6, P.fr5, P.fr4, P.fr3], fill: true });
          break;
        }
        case 'text':
          this.float(e.x, e.y, e.text, e.color, false, 34);
          break;
        case 'spark':
          this.spray(e.x, e.y, e.n, this.ramp(e.el), 2.4, 60, 10);
          break;
        case 'msg':
          this.messages.push({ text: e.text, color: e.color, t: 0, life: Math.max(5, 2.5 + e.text.length * 0.08) });
          if (this.messages.length > 5) this.messages.shift();
          break;
        case 'sfx':
          play(e.name, e.vol);
          break;
        case 'shake':
          this.shake = Math.max(this.shake, e.amount);
          break;
        case 'wordDrop': {
          // a word falls to the floor: its colour bursts up where it lands, and it is heard
          const hue = WORD_HUE[e.word];
          const colors = [P.white, hue, hue];
          this.rings.push({ x: e.x, y: e.y, r: 1.5, t: 0, dur: 0.5, colors, fill: false, heavy: true });
          this.rings.push({ x: e.x, y: e.y, r: 2.3, t: 0, dur: 0.55, colors, fill: false, delay: 0.14 });
          for (let i = 0; i < 20; i++) this.add({ x: e.x + rnd(-0.2, 0.2), y: e.y + rnd(-0.2, 0.2), z: 2, vx: rnd(-0.6, 0.6), vy: rnd(-0.6, 0.6), vz: rnd(70, 190), life: rnd(0.5, 1.0), color: colors[i % 3], size: i % 4 === 0 ? 2 : 1, grav: 110 });
          this.glow(e.x, e.y, 70, 0.6);
          play('rare', 0.8);
          break;
        }
        case 'wordGot': {
          // ...and is taken: it flies up off the hero with its name
          const h = this.hero;
          const hue = WORD_HUE[e.word];
          this.rings.push({ x: h.x, y: h.y, r: 1.3, t: 0, dur: 0.35, colors: [P.white, hue, hue], fill: true });
          for (let i = 0; i < 14; i++) this.mote(h.x, h.y, [P.white, hue]);
          this.float(h.x, h.y, `+ ${WORDS[e.word].name.toUpperCase()}`, hue, true, 46);
          break;
        }
        case 'guide':
          // the first dungeon has something new to say
          if (e.step !== 'move') play('pickup', 0.9);
          break;
        case 'search': {
          // the satchel is opened: a breath of gold, and a ring
          const gold = [P.white, P.gd5, P.gd4, P.gd3];
          this.rings.push({ x: e.x, y: e.y, r: 1.2, t: 0, dur: 0.4, colors: gold, fill: true });
          for (let i = 0; i < 16; i++) this.mote(e.x, e.y, gold);
          this.glow(e.x, e.y, 60, 0.5);
          break;
        }
        case 'wave': {
          // the staff is swung: a breath of light leaves it the way the wave goes
          const cs = e.echo ? MIRROR : this.magic(e.el);
          this.flashes.push({ x: e.x + e.dx * 0.5, y: e.y + e.dy * 0.5, z: 12, r: 0.4, t: 0, dur: 0.09, colors: cs });
          this.streaks(e.x + e.dx * 0.4, e.y + e.dy * 0.4, 6, cs, 5, 6, { dx: e.dx, dy: e.dy, spread: 0.9, life: 0.18, z: 10 });
          break;
        }
        case 'orbSet': {
          const cs = this.magic(e.el);
          // the staff comes down: a pulse runs out round the caster ...
          this.rings.push({ x: this.hero.x, y: this.hero.y, r: 1.25, t: 0, dur: 0.22, colors: cs, fill: false });
          this.spray(this.hero.x, this.hero.y, 6, cs, 2.2, 30, 2);
          // ... and the orb is there (the ball itself is drawn by the renderer; its waves are 'burst' events)
          this.flashes.push({ x: e.x, y: e.y, z: 13, r: 0.55, t: 0, dur: 0.12, colors: cs });
          for (let i = 0; i < 8; i++) this.mote(e.x, e.y, cs);
          break;
        }
        case 'orbEnd': {
          const cs = this.magic(e.el);
          this.flashes.push({ x: e.x, y: e.y, z: 13, r: 0.3, t: 0, dur: 0.1, colors: cs });
          for (let i = 0; i < 6; i++) this.mote(e.x, e.y, cs);
          break;
        }
        case 'familiar': {
          const cs = e.echo ? MIRROR : this.magic(e.el);
          // it pops into being at the shoulder
          this.flashes.push({ x: e.x, y: e.y, z: 19, r: 0.3, t: 0, dur: 0.12, colors: cs });
          this.rings.push({ x: e.x, y: e.y, r: 0.7, t: 0, dur: 0.2, colors: cs, fill: false });
          this.spray(e.x, e.y, 7, cs, 2, 60, 18);
          break;
        }
        case 'familiarShot':
          this.flashes.push({ x: e.x + e.dx * 0.2, y: e.y + e.dy * 0.2, z: 19, r: 0.16, t: 0, dur: 0.07, colors: this.magic(e.el) });
          break;
        case 'familiarEnd':
          this.spray(e.x, e.y, 6, this.magic(e.el), 1.6, 40, 18);
          break;
        case 'beam': {
          const w = e.words;
          const heavy = has(w, 'power');
          const fast = has(w, 'swift');
          const second = e.n > 0;
          const colors = this.beamColors(e.el, w, e.n, e.echo);
          this.rays.push({ x0: e.x0, y0: e.y0, x1: e.x1, y1: e.y1, t: 0, dur: fast ? 0.16 : heavy ? 0.28 : 0.22, colors, heavy, jag: e.el === 'lightning', flicker: has(w, 'volatile'), faint: e.echo, seed: Math.floor(Math.random() * 1000) });
          const len = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
          const dx = len > 0.01 ? (e.x1 - e.x0) / len : 1;
          const dy = len > 0.01 ? (e.y1 - e.y0) / len : 0;
          // where it leaves the wand, and where it ends
          this.flashes.push({ x: e.x0 + dx * 0.4, y: e.y0 + dy * 0.4, z: 12, r: heavy ? 0.4 : 0.26, t: 0, dur: 0.1, colors });
          this.spray(e.x1, e.y1, e.echo ? 3 : 7, colors, 2.4, 50, 10);
          if (e.echo) break;
          this.glow((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, 60, 0.12);
          if (heavy) {
            this.shake = Math.max(this.shake, 1.8);
            this.spray(e.x0 + dx * 0.5, e.y0 + dy * 0.5, 8, POWER_HOT, 3, 60, 10);
          }
          if (second) {
            // the twin: the second beam is the mirror's
            this.flashes.push({ x: e.x0, y: e.y0, z: 12, r: 0.24, t: 0, dur: 0.09, colors: MIRROR });
            play('echo', 0.35);
          }
          // every other word shows along the line, a pace apart (no more than a dozen of each)
          this.alongBeam(e.x0, e.y0, e.x1, e.y1, e.el, w, Math.min(12, Math.max(1, Math.floor(len / 1.1))));
          if (e.el === 'lightning') this.groundBolt(e.x0, e.y0, e.x1, e.y1);
          break;
        }
        case 'beamBite': {
          // One bite of a beam that is being held. The beam itself is drawn from where the renderer
          // says it is (holdBeam); here, what a bite adds: light where it leaves the wand as it
          // begins, sparks where it ends, and the signs of its words along it, fewer than a struck
          // beam shows, since it bites five times a second.
          const w = e.words;
          const heavy = has(w, 'power');
          const colors = this.beamColors(e.el, w, e.n, false);
          const len = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
          const dx = len > 0.01 ? (e.x1 - e.x0) / len : 1;
          const dy = len > 0.01 ? (e.y1 - e.y0) / len : 0;
          this.spray(e.x1, e.y1, 3, colors, 2.2, 50, 10);
          if (e.first) {
            this.flashes.push({ x: e.x0 + dx * 0.4, y: e.y0 + dy * 0.4, z: 12, r: heavy ? 0.4 : 0.26, t: 0, dur: 0.1, colors });
            if (heavy) this.shake = Math.max(this.shake, 1.4);
            if (e.n > 0) {
              // the twin: the second beam is the mirror's
              this.flashes.push({ x: e.x0, y: e.y0, z: 12, r: 0.24, t: 0, dur: 0.09, colors: MIRROR });
              play('echo', 0.35);
            }
          }
          this.alongBeam(e.x0, e.y0, e.x1, e.y1, e.el, w, Math.min(5, Math.max(1, Math.floor(len / 2))));
          if (e.el === 'lightning' && e.hits > 0) this.groundBolt(e.x0, e.y0, e.x1, e.y1);
          break;
        }
        case 'channel':
        case 'channelEnd':
          break; // (what is seen of these is the first bite and the beam thinning away)
        case 'trapSet':
          // (the trap itself is drawn on the floor by the renderer: here, the snap of its being set)
          this.spray(e.x, e.y, 4, [P.sl5, P.sl4, P.sl3], 1.6, 40, 2);
          break;
        case 'volleyUp': {
          // A volley leaves the bow: a handful of arrows straight up and off the top of the
          // screen, fanned a little toward where they will come down. (Where that is, the
          // renderer marks on the floor from the rules' own list.)
          const colors = this.arrowColors(e.el, e.words, 0, e.echo);
          const dx = e.tx - e.x;
          const dy = e.ty - e.y;
          const n = e.echo ? 3 : 6;
          // (they leave from the bow, which is held up on the figure's right as the screen shows
          // it, whichever way the figure faces: ten pixels to the right of the feet, a head higher)
          // (with the ranger's new pictures, from where his bow is when they go: game/defs.ts, RANGER_ARROW)
          const along = Math.hypot(dx, dy) || 1;
          const bx = RANGER_ARROW.on ? e.x + (dx / along) * RANGER_ARROW.volleyFrom : e.x + 10 / 32;
          const by = RANGER_ARROW.on ? e.y + (dy / along) * RANGER_ARROW.volleyFrom : e.y - 10 / 32;
          const bz = RANGER_ARROW.on ? RANGER_ARROW.volleyHeight : 27;
          for (let i = 0; i < n; i++) {
            this.add({
              x: bx + rnd(-0.1, 0.1), y: by + rnd(-0.1, 0.1), z: bz + rnd(-2, 2), vx: dx * 0.5 + rnd(-0.5, 0.5), vy: dy * 0.5 + rnd(-0.5, 0.5), vz: ARROW_FALL * rnd(0.85, 1.1),
              life: 0.34 + i * 0.015, color: colors[Math.min(colors.length - 1, 1 + (i % 2))], size: 1, grav: 0, streak: 9,
            });
          }
          this.flashes.push({ x: bx, y: by, z: bz + 1, r: has(e.words, 'power') ? 0.34 : 0.22, t: 0, dur: 0.09, colors });
          break;
        }
        case 'volleyDrop': {
          // One arrow of it on its way down: seen for the moment before it lands (drawn as an
          // arrow, head first: see drawAir).
          const colors = this.arrowColors(e.el, e.words, e.n, e.echo);
          if (this.falling.length < 80) this.falling.push({ x: e.x, y: e.y, t: 0, dur: Math.max(0.02, e.in), colors, heavy: has(e.words, 'power') });
          break;
        }
        case 'volleyFall': {
          // It lands: it stands in the floor for a while (so that a volley leaves the patch
          // bristling), with a puff of dust; what it hit shows its own sparks (the hit says so
          // itself). An element's arrow is a point of light as it lands.
          const colors = this.arrowColors(e.el, e.words, e.n, e.echo);
          const heavy = has(e.words, 'power');
          if (this.stuck.length < 70) this.stuck.push({ x: e.x, y: e.y, t: 0, dur: e.echo ? 0.8 : 1.5, color: colors[Math.min(colors.length - 1, 2)], tip: colors[1], lean: e.n > 0 ? -1 : 1 });
          this.spray(e.x, e.y, heavy ? 4 : 2, e.el === 'phys' ? [P.st7, P.st6, P.st5] : colors.slice(1), 1.3, 34, 1);
          // (a glow's size is in pixels)
          if (e.el !== 'phys' || heavy) this.glow(e.x, e.y, heavy ? 26 : 18, 0.16);
          if (heavy && e.hits > 0) this.shake = Math.max(this.shake, 0.8);
          if (has(e.words, 'swift')) this.streaks(e.x, e.y, 2, WIND, 4, 5, { life: 0.12, z: 3 });
          break;
        }
        case 'volleyEnd':
          break;
        case 'burned':
          break; // the inventory screen shows what the word became
        case 'levelup':
        case 'station':
          break;
      }
    }
  }

  /** Gold sparkles around a point (level up). */
  celebrate(x: number, y: number): void {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      this.add({ x: x + Math.cos(a) * 0.8, y: y + Math.sin(a) * 0.8, z: 2, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5, vz: rnd(40, 90), life: rnd(0.5, 0.9), color: [P.gd5, P.gd4, P.gd3][i % 3], size: 1, grav: 60 });
    }
    this.float(x, y, 'LEVEL UP', P.gd4, true, 40);
  }

  /** A beam's colours: the element's; with none, the violet of magic; a word that has a colour of its own takes it. */
  private beamColors(el: Element, w: readonly WordId[] | undefined, n: number, echo: boolean): readonly string[] {
    const heavy = has(w, 'power');
    let colors: readonly string[] = this.magic(el);
    if (el === 'phys') {
      if (heavy) colors = POWER_HOT;
      else if (has(w, 'swift')) colors = WIND;
      else if (has(w, 'leech')) colors = [P.white, P.bl5, P.bl4, P.bl3];
      else if (has(w, 'poison')) colors = VENOM;
      else if (has(w, 'volatile')) colors = VIOLET;
    }
    if (echo || (n > 0 && el === 'phys' && !heavy)) colors = MIRROR;
    return colors;
  }

  /** An arrow's colours, brightest first: plain steel and wood, or what its words make of it (as a beam's). */
  private arrowColors(el: Element, w: readonly WordId[] | undefined, n: number, echo: boolean): readonly string[] {
    const plain = el === 'phys' && !has(w, 'power') && !has(w, 'swift') && !has(w, 'leech') && !has(w, 'poison') && !has(w, 'volatile');
    if (plain && !echo && n === 0) return ARROW;
    return this.beamColors(el, w, n, echo);
  }

  /** The signs of a beam's words along it, `n` of each, a pace apart. */
  private alongBeam(x0: number, y0: number, x1: number, y1: number, el: Element, w: readonly WordId[] | undefined, n: number): void {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const dx = len > 0.01 ? (x1 - x0) / len : 1;
    const dy = len > 0.01 ? (y1 - y0) / len : 0;
    const fast = has(w, 'swift');
    for (let i = 0; i < n; i++) {
      const d = ((i + 0.5 + rnd(-0.3, 0.3)) / n) * len;
      const x = x0 + dx * d;
      const y = y0 + dy * d;
      if (el === 'fire') this.flames(x, y, 0.15, 1);
      else if (el === 'frost') {
        if (i % 2 === 0) this.shards(x, y, 1, 2.2);
        else this.snow(x, y, 0.3, 2);
      } else if (el === 'lightning' && i % 3 === 0) this.streaks(x, y, 2, VOLT, 4, 2, { life: 0.2 });
      if (fast) this.streaks(x, y, 1, WIND, 12, 10, { dx, dy, spread: 0.15, life: 0.15, z: 12 });
      if (has(w, 'leech') && i % 2 === 0) this.streaks(x, y, 1, BLOOD, 2, 2, { up: 20, grav: 240, life: 0.4, z: 12 });
      if (has(w, 'volatile') && i % 2 === 1) this.crackle(x, y, 0.15, 1);
      if (has(w, 'poison')) {
        if (i % 2 === 0) this.bubbles(x, y, 0.2, 1);
        else this.streaks(x, y, 1, VENOM.slice(1), 1.6, 2, { up: 10, grav: 260, life: 0.35, z: 12 });
      }
    }
  }

  /**
   * A beam is being held, and this frame it runs from (x0, y0) to (x1, y1), in the world. The
   * renderer says so every frame for as long as it is held (once for each of a Twin pair, `n` 0
   * and 1): so it turns smoothly with the finger, and not five times a second with its bites.
   */
  holdBeam(n: number, x0: number, y0: number, x1: number, y1: number, el: Element, w: readonly WordId[]): void {
    let r = this.held.find((q) => q.n === n && q.t < 0.45);
    if (!r) {
      r = { n, fresh: true, x0, y0, x1, y1, t: 0, dur: 1, colors: [], heavy: false, jag: false, flicker: false, faint: false, seed: Math.floor(Math.random() * 1000) };
      this.held.push(r);
    }
    r.fresh = true;
    r.x0 = x0;
    r.y0 = y0;
    r.x1 = x1;
    r.y1 = y1;
    r.colors = this.beamColors(el, w, n, false);
    r.heavy = has(w, 'power');
    r.jag = el === 'lightning';
    r.flicker = has(w, 'volatile');
  }

  /** `real` is the true frame time: `dt` is shorter while the game is holding still. */
  update(dt: number, real: number = dt): void {
    this.clock += dt;
    this.sinceHold += real;
    // Nothing here may pile up without limit, whatever is slotted and however fast it is used:
    // when a list is over its length, the oldest things in it go.
    trim(this.rings, 140);
    trim(this.flashes, 120);
    trim(this.slashes, 40);
    trim(this.beams, 24);
    trim(this.rays, 24);
    trim(this.whirls, 16);
    trim(this.skyBolts, 30);
    trim(this.ghostAsks, 24);
    trim(this.glows, 60);
    trim(this.later, 160);
    for (const f of this.fallen) f.t += dt;
    if (this.quip) {
      this.quip.t += real;
      if (this.quip.t > (this.quip.long ?? QUIP_TIME)) this.quip = null;
    }
    if (this.tag) {
      this.tag.t += real;
      if (this.tag.t > TAG_TIME) this.tag = null;
    }
    this.joinWait -= real;
    if (this.joins.length && this.joinWait <= 0) {
      const j = this.joins.shift() as { x: number; y: number; word: WordId; name: string };
      this.playJoin(j.x, j.y, j.word, j.name);
      this.joinWait = 0.55;
    }
    // life leeched is shown as one number every so often, not one per hit
    this.healWait -= dt;
    if (this.healSum >= 1 && this.healWait <= 0) {
      this.float(this.hero.x, this.hero.y, `+${Math.round(this.healSum)}`, P.bl5, false, 30);
      this.healSum = 0;
      this.healWait = 0.7;
    }
    this.pulseWait -= dt;
    for (let i = this.later.length - 1; i >= 0; i--) {
      this.later[i].t -= dt;
      if (this.later[i].t <= 0) {
        const fn = this.later[i].fn;
        this.later.splice(i, 1);
        fn();
      }
    }
    if (this.might.t > 0) {
      this.might.t -= dt;
      if (this.might.t <= 0) this.might.stacks = 0;
      else if (this.might.stacks >= 5 && Math.random() < 0.35 * dt * 60) this.flames(this.hero.x, this.hero.y, 0.22, 1, 1.1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vz -= p.grav * dt;
      if (p.z < 0) {
        p.z = 0;
        p.vz = -p.vz * 0.35;
        p.vx *= 0.5;
        p.vy *= 0.5;
      }
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.t += dt;
      f.z += (f.t < 0.15 ? 60 : 16) * dt;
      if (f.t > 0.8) this.floaters.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      if (r.delay && r.delay > 0) {
        r.delay -= dt;
        continue;
      }
      r.t += dt;
      if (r.t >= r.dur) this.rings.splice(i, 1);
    }
    for (let i = this.wisps.length - 1; i >= 0; i--) {
      const w = this.wisps[i];
      w.t += dt;
      if (w.t >= w.dur) {
        this.wisps.splice(i, 1);
        // the life arrives: the hero pulses (not for every single wisp)
        if (this.pulseWait <= 0) {
          this.pulseWait = 0.22;
          this.rings.push({ x: this.hero.x, y: this.hero.y, r: 0.6, t: 0, dur: 0.2, colors: [P.white, P.bl5, P.bl4], fill: true });
        }
      }
    }
    const age = <T extends { t: number; dur: number }>(list: T[]): void => {
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].t += dt;
        if (list[i].t >= list[i].dur) list.splice(i, 1);
      }
    };
    if (this.warp) {
      this.warp.t += dt;
      if (this.warp.t > 0.6) this.warp = null;
    }
    if (this.arrival) {
      this.arrival.t += dt;
      if (this.arrival.t > 1) this.arrival = null;
    }
    age(this.slashes);
    age(this.cracks);
    age(this.decals);
    age(this.spikes);
    age(this.flashes);
    age(this.skyBolts);
    age(this.beams);
    age(this.rays);
    age(this.whirls);
    age(this.stuck);
    age(this.falling);
    // A beam that is being held comes in over its first moments and stays at full width while the
    // renderer goes on saying where it is; left unsaid, it thins away. (`t` runs along the same
    // course a struck beam's does: in by 0.2, full to 0.45, gone at 1.)
    for (let i = this.held.length - 1; i >= 0; i--) {
      const r = this.held[i];
      if (r.fresh) {
        r.fresh = false;
        r.t = Math.min(0.3, r.t + dt * (0.2 / 0.07));
      } else {
        r.t = Math.max(r.t, 0.45) + dt * (0.55 / 0.14);
        if (r.t >= 1) this.held.splice(i, 1);
      }
    }
    age(this.glows);
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      this.bolts[i].t += dt;
      if (this.bolts[i].t >= 0.16) this.bolts.splice(i, 1);
    }
    for (let i = this.messages.length - 1; i >= 0; i--) {
      this.messages[i].t += dt;
      if (this.messages[i].t > this.messages[i].life) this.messages.splice(i, 1);
    }
    this.shake = Math.max(0, this.shake - dt * 22);
    this.shakeX = this.shake > 0.3 ? Math.round(rnd(-this.shake, this.shake)) : 0;
    this.shakeY = this.shake > 0.3 ? Math.round(rnd(-this.shake, this.shake) * 0.6) : 0;
  }

  // =============================================================================================
  // Drawing

  /** Flat effects on the floor: scorch and frost, cracks, ice, shockwave rings. Drawn under the characters. */
  drawGround(g: CanvasRenderingContext2D, c: Cam): void {
    // arrows of a volley standing in the floor: a short shaft leaning back the way it fell, its
    // fletching at the top; they fade out where they stand
    for (const a of this.stuck) {
      const k = a.t / a.dur;
      const px = Math.round(wx(c, a.x, a.y));
      const py = Math.round(wy(c, a.x, a.y));
      // (it quivers as it strikes: a pixel to the side for its first instant)
      const top = px + a.lean * (a.t < 0.05 ? 3 : 2);
      g.globalAlpha = k < 0.7 ? 1 : Math.max(0, 1 - (k - 0.7) / 0.3);
      pline(g, px, py, top, py - 8, a.color);
      g.fillStyle = a.tip;
      g.fillRect(top - 1, py - 10, 3, 2);
      g.fillRect(top, py - 11, 1, 1);
      g.fillStyle = P.black;
      g.globalAlpha *= 0.4;
      g.fillRect(px - 1, py, 4, 1);
      g.globalAlpha = 1;
    }
    // (and the shadow of each arrow still in the air, closing on the place it will land)
    for (const a of this.falling) {
      const k = Math.min(1, a.t / a.dur);
      const px = Math.round(wx(c, a.x, a.y));
      const py = Math.round(wy(c, a.x, a.y));
      const half = k > 0.6 ? 1 : 2;
      g.globalAlpha = 0.15 + 0.3 * k;
      g.fillStyle = P.black;
      g.fillRect(px - half, py, half * 2 + 1, 1);
    }
    g.globalAlpha = 1;
    for (const d of this.decals) {
      const cx = wx(c, d.x, d.y);
      const cy = wy(c, d.x, d.y);
      const age = d.t / d.dur;
      const fade = age < 0.7 ? 1 : Math.max(0, 1 - (age - 0.7) / 0.3);
      if (d.kind === 'scorch') {
        g.globalAlpha = 0.26 * fade;
        g.fillStyle = P.black;
        g.beginPath();
        g.ellipse(cx, cy, d.r * 22.6, d.r * 11.3, 0, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 0.2 * fade;
        g.beginPath();
        g.ellipse(cx, cy, d.r * 14, d.r * 7, 0, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
        // its edge glows while it is fresh, and cinders wink in it for a while
        if (d.t < 0.7) {
          g.fillStyle = d.t < 0.25 ? P.fr5 : d.t < 0.5 ? P.fr3 : P.fr2;
          const n = Math.max(14, Math.round(d.r * 30));
          for (let i = 0; i < n; i += 2) {
            const a = (i / n) * Math.PI * 2;
            g.fillRect(Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * d.r), Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * d.r), 1, 1);
          }
        }
        if (age < 0.6) {
          const n = Math.round(d.r * 7);
          for (let i = 0; i < n; i++) {
            if ((hash(d.seed + i, Math.floor(this.clock * 6)) > 0.35)) continue;
            const a = hash(d.seed, i) * Math.PI * 2;
            const dd = hash(d.seed + 7, i) * d.r * 0.85;
            g.fillStyle = hash(d.seed + 3, i) < 0.5 ? P.fr4 : P.fr2;
            g.fillRect(Math.round(wx(c, d.x + Math.cos(a) * dd, d.y + Math.sin(a) * dd)), Math.round(wy(c, d.x + Math.cos(a) * dd, d.y + Math.sin(a) * dd)), 1, 1);
          }
        }
      } else {
        // rime: it spreads in its first moment, then lies pale with white flecks
        const grown = Math.min(1, d.t / 0.12);
        const r = d.r * (0.5 + 0.5 * grown);
        g.globalAlpha = 0.3 * fade;
        g.fillStyle = P.bu5;
        g.beginPath();
        g.ellipse(cx, cy, r * 22.6, r * 11.3, 0, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = fade;
        const n = Math.round(d.r * 12);
        for (let i = 0; i < n; i++) {
          const a = hash(d.seed, i) * Math.PI * 2;
          const dd = Math.sqrt(hash(d.seed + 5, i)) * r * 0.95;
          g.fillStyle = hash(d.seed + 9, i) < 0.4 ? P.white : P.bu5;
          const px = Math.round(wx(c, d.x + Math.cos(a) * dd, d.y + Math.sin(a) * dd));
          const py = Math.round(wy(c, d.x + Math.cos(a) * dd, d.y + Math.sin(a) * dd));
          g.fillRect(px, py, hash(d.seed + 11, i) < 0.3 ? 2 : 1, 1);
        }
        g.globalAlpha = 1;
      }
    }
    for (const k of this.cracks) {
      // it tears open outward in its first instant, glows, cools, and fades at the end of its life
      const grown = Math.min(1, k.t / 0.06);
      const segs = k.pts.length / 2 - 1;
      const upto = Math.max(1, Math.ceil(segs * grown));
      const age = k.t / k.dur;
      const glow = k.t < k.hot ? (k.t < k.hot * 0.3 ? P.fr6 : k.t < k.hot * 0.65 ? P.fr4 : P.fr2) : null;
      g.globalAlpha = age < 0.6 ? 1 : Math.max(0, 1 - (age - 0.6) / 0.4);
      for (let i = 0; i < upto; i++) {
        const x0 = wx(c, k.pts[i * 2], k.pts[i * 2 + 1]);
        const y0 = wy(c, k.pts[i * 2], k.pts[i * 2 + 1]);
        const x1 = wx(c, k.pts[i * 2 + 2], k.pts[i * 2 + 3]);
        const y1 = wy(c, k.pts[i * 2 + 2], k.pts[i * 2 + 3]);
        pline(g, x0, y0 + 1, x1, y1 + 1, P.black);
        // wider near the middle of the impact
        if (i < 2) pline(g, x0 + 1, y0, x1 + 1, y1, glow ? P.fr3 : P.st1);
        pline(g, x0, y0, x1, y1, glow ?? P.ink);
      }
      g.globalAlpha = 1;
    }
    for (const s of this.spikes) {
      // a blade of ice along the floor; it shoots out, stands, and fades as it breaks
      const k = s.t / s.dur;
      const grown = Math.min(1, s.t / 0.05);
      const x0 = wx(c, s.x0, s.y0);
      const y0 = wy(c, s.x0, s.y0);
      const x1 = x0 + (wx(c, s.x1, s.y1) - x0) * grown;
      const y1 = y0 + (wy(c, s.x1, s.y1) - y0) * grown;
      g.globalAlpha = k < 0.6 ? 1 : Math.max(0, 1 - (k - 0.6) / 0.4);
      pline(g, x0, y0 + 1, x1, y1 + 1, P.bu3);
      pline(g, x0, y0, x1, y1, k < 0.25 ? P.white : P.bu5);
      // the icicle at its end
      const tall = Math.round(s.tall * grown);
      g.fillStyle = P.bu4;
      g.fillRect(Math.round(x1) + 1, Math.round(y1) - tall + 1, 1, tall);
      g.fillStyle = P.white;
      g.fillRect(Math.round(x1), Math.round(y1) - tall, 1, tall);
      g.fillStyle = P.bu5;
      g.fillRect(Math.round(x1) - 1, Math.round(y1) - Math.round(tall * 0.6), 1, Math.round(tall * 0.6));
      g.globalAlpha = 1;
    }
    if (this.might.stacks > 0) {
      // "of Power": the floor under the hero glows hotter with every stack
      const n = this.might.stacks;
      const cx = wx(c, this.hero.x, this.hero.y);
      const cy = wy(c, this.hero.x, this.hero.y);
      const rad = 0.42 + n * 0.05 + 0.03 * Math.sin(this.clock * 9);
      g.globalAlpha = (0.1 + n * 0.05) * (this.might.t < 1 ? this.might.t : 1);
      g.fillStyle = n >= 4 ? P.fr4 : P.fr3;
      g.beginPath();
      g.ellipse(cx, cy, rad * 22.6, rad * 11.3, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.fillStyle = n >= 5 ? P.fr6 : n >= 3 ? P.fr5 : P.fr4;
      const dots = 30;
      for (let i = 0; i < dots; i++) {
        if (this.might.t < 1 && (i + Math.floor(this.clock * 12)) % 2 === 0) continue;
        const a = (i / dots) * Math.PI * 2;
        g.fillRect(Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * rad), Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * rad), 1, 1);
      }
    }
    for (const r of this.rings) {
      if (r.delay && r.delay > 0) continue;
      const k = r.t / r.dur;
      const rad = r.closing ? r.r * (1 - 0.82 * k) : r.r * (0.25 + 0.75 * Math.sqrt(k));
      const cx = wx(c, r.x, r.y);
      const cy = wy(c, r.x, r.y);
      const col = r.colors[Math.min(r.colors.length - 1, Math.floor((r.closing ? k : 1 - k) * r.colors.length))];
      if (r.fill && k < 0.5) {
        g.globalAlpha = 0.35 * (1 - k * 2);
        g.fillStyle = r.colors[r.colors.length - 1];
        g.beginPath();
        g.ellipse(cx, cy, r.r * 22.6, r.r * 11.3, 0, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
      g.fillStyle = col;
      const n = Math.max(20, Math.round(rad * 46));
      for (const scale of r.double ? [1, 0.84] : [1]) {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          // a lightning ring is a zigzag: every few dots step in and out
          if (r.swirl && (a + k * 5.5 + r.x) % 2.094 > 1.15) continue;
          const rr = rad * scale * (r.jag ? 1 + ((i >> 1) % 2 === 0 ? 0.06 : -0.06) : 1);
          const px = Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * rr);
          const py = Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * rr);
          if (r.heavy) g.fillRect(px - 1, py - 1, 3, k < 0.7 ? 3 : 2);
          else g.fillRect(px, py, k < 0.6 ? 2 : 1, 1);
        }
      }
    }
  }

  /** One ray (a beam being held, or a phantom's). */
  private drawRay(g: CanvasRenderingContext2D, c: Cam, r: Ray): void {
    // The wand's beam. It comes in over its first fifth, thin to full, along its whole length at
    // once; it holds; it thins away. Lines one pixel apart, stacked across the way it runs
    // (down the screen if it runs across, across if it runs down), so there are no gaps.
    const k = r.t / r.dur;
    const inK = Math.min(1, k / 0.2);
    const outK = k < 0.45 ? 1 : Math.max(0, 1 - (k - 0.45) / 0.55);
    let x0 = wx(c, r.x0, r.y0);
    let y0 = wy(c, r.x0, r.y0) - 12;
    let x1 = wx(c, r.x1, r.y1);
    let y1 = wy(c, r.x1, r.y1) - 12;
    if (r.flicker) {
      const j = Math.round(rnd(-1, 1));
      y0 += j;
      y1 -= j;
    }
    const flat = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
    const sx = flat ? 0 : 1;
    const sy = flat ? 1 : 0;
    const half = Math.max(0, Math.round((r.heavy ? 5 : 3) * inK * outK));
    const cs = r.colors;
    const last = cs.length - 1;
    g.globalAlpha = (r.faint ? 0.55 : 1) * (0.4 + 0.6 * outK);
    for (let o = half; o >= 1; o--) {
      const col = cs[Math.min(last, o > half * 0.6 ? 3 : o > half * 0.3 ? 2 : 1)];
      pline(g, x0 + sx * o, y0 + sy * o, x1 + sx * o, y1 + sy * o, col);
      pline(g, x0 - sx * o, y0 - sy * o, x1 - sx * o, y1 - sy * o, col);
    }
    const heart = r.flicker && Math.floor(this.clock * 24) % 2 === 0 ? cs[Math.min(last, 1)] : k < 0.6 ? cs[0] : cs[Math.min(last, 1)];
    if (r.jag) {
      // lightning: its heart runs in a zigzag, a new one every few frames
      const steps = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 14));
      let px = x0;
      let py = y0;
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        const off = i === steps ? 0 : (hash(r.seed + i, Math.floor(this.clock * 20)) - 0.5) * (half + 2) * 2;
        const qx = x0 + (x1 - x0) * f + sx * off;
        const qy = y0 + (y1 - y0) * f + sy * off;
        pline(g, px, py, qx, qy, heart);
        px = qx;
        py = qy;
      }
    } else if (half > 0 || inK < 1) pline(g, x0, y0, x1, y1, heart);
    g.globalAlpha = 1;
  }

  /** Effects in the air, drawn over the characters and over the darkness so they glow. */
  drawAir(g: CanvasRenderingContext2D, c: Cam): void {
    for (const q of this.whirls) {
      // A whirlwind's turn: two crescents, opposite each other, going round the hero. Each is
      // thin at its tail and thick at its leading edge, which is white. They go round with the
      // clock and not from where each began, so one turn runs into the next without a jump.
      const k = q.t / q.dur;
      const dir = q.rev ? -1 : 1;
      const lead0 = this.clock * Math.PI * 2 * 2.6 * dir;
      const sweep = q.heavy ? 2.3 : 1.9;
      const fade = k < 0.6 ? 1 : Math.max(0, 1 - (k - 0.6) / 0.4);
      const col = q.colors[Math.min(q.colors.length - 1, Math.floor(k * q.colors.length))];
      const bands = q.heavy ? 5 : 3;
      g.globalAlpha = (q.faint ? 0.55 : 1) * (0.35 + 0.65 * fade);
      for (const half of [0, Math.PI]) {
        for (let u = 0; u < 1; u += 0.016) {
          const a = lead0 + half - sweep * (1 - u) * dir;
          for (let band = 0; band < bands; band++) {
            // (fattest just behind the leading edge)
            if (band > u * u * (bands - 0.3)) continue;
            const jag = q.jag ? 1 + (Math.floor(u * 40) % 2 === 0 ? 0.04 : -0.04) : 1;
            const rr = q.r * (1 - band * 0.07) * jag;
            const x = q.x + Math.cos(a) * rr;
            const y = q.y + Math.sin(a) * rr;
            g.fillStyle = band === 0 && u > 0.72 ? P.white : u > 0.5 ? q.colors[0] : col;
            g.fillRect(Math.round(wx(c, x, y)), Math.round(wy(c, x, y)) - 10, 2, band === 0 ? 2 : 1);
          }
        }
      }
      g.globalAlpha = 1;
    }
    for (const s of this.slashes) {
      const k = s.t / s.dur;
      const col = s.colors[Math.min(s.colors.length - 1, Math.floor(k * s.colors.length))];
      // which way the cut travels: the twin's second cut comes back the other way
      const dir = s.rev ? -1 : 1;
      // The mark of a cut lies on the floor round whoever made it, and is drawn after them. The
      // part of it that is beyond them (further up the screen) would be drawn across their body:
      // their own cut over their own head. That part is left out where they stand. (Seen while
      // the Strike was being redone for Version 15.1: facing away, the arcs crossed the helm.)
      const sx0 = wx(c, s.x, s.y);
      const sy0 = wy(c, s.x, s.y);
      const hid = (x: number, y: number): boolean => {
        if (x + y >= s.x + s.y) return false;
        const dx = wx(c, x, y) - sx0;
        const dy = wy(c, x, y) - 10 - sy0;
        return Math.abs(dx) < 9 && dy > -38 && dy < 2;
      };
      if (s.faint) g.globalAlpha = 0.65;
      if (s.heavy) {
        // Power: a thick crescent, wider than a plain cut, bright at its leading edge
        const sweep = 2.5;
        const from = s.a - (sweep / 2) * dir;
        const lead = Math.min(1, k * 2.2 + 0.2);
        const tail = Math.max(0, k * 1.6 - 0.6);
        for (let u = tail; u < lead; u += 0.014) {
          const a = from + sweep * u * dir;
          const edge = (u - tail) / Math.max(0.01, lead - tail); // 0 at the tail, 1 at the leading edge
          for (let band = 0; band < 5; band++) {
            // the crescent is fattest in the middle of the sweep
            const mid = 1 - Math.abs(u - 0.5) * 2;
            if (band > 1 + mid * 3.5) continue;
            const jag = s.jag ? 1 + (Math.floor(u * 40) % 2 === 0 ? 0.035 : -0.035) : 1;
            const rr = s.reach * (1.02 - band * 0.075) * jag;
            const x = s.x + Math.cos(a) * rr;
            const y = s.y + Math.sin(a) * rr;
            if (hid(x, y)) continue;
            g.fillStyle = band === 0 && edge > 0.55 ? P.white : edge > 0.8 ? s.colors[0] : col;
            g.fillRect(Math.round(wx(c, x, y)), Math.round(wy(c, x, y)) - 10, 2, band === 0 ? 2 : 1);
          }
        }
        g.globalAlpha = 1;
        continue;
      }
      if (s.fast) {
        // Swift: three hair-thin cuts over the whole sweep, all there in the first instant, then gone
        const sweep = 2.2;
        const from = s.a - (sweep / 2) * dir;
        const alive = 1 - k;
        for (let u = 0; u < 1; u += 0.012) {
          // it thins out from the tail as it fades
          if (u < k * 0.9) continue;
          const a = from + sweep * u * dir;
          const radii = [1.0, 0.86, 0.72];
          for (let b = 0; b < 3; b++) {
            const jag = s.jag ? 1 + (Math.floor(u * 40) % 2 === 0 ? 0.035 : -0.035) : 1;
            const rr = s.reach * radii[b] * jag;
            const x = s.x + Math.cos(a) * rr;
            const y = s.y + Math.sin(a) * rr;
            if (hid(x, y)) continue;
            g.fillStyle = u > 0.8 && alive > 0.5 ? P.white : b === 0 ? s.colors[0] : col;
            g.fillRect(Math.round(wx(c, x, y)), Math.round(wy(c, x, y)) - 10, b === 0 ? 2 : 1, 1);
          }
        }
        g.globalAlpha = 1;
        continue;
      }
      // A plain cut: a slim crescent that runs round the sweep and is gone, bright at the edge
      // that leads and fattest in the middle. (Up to Version 15.0: two dotted lines over the
      // whole sweep, which lay about as grey dashes after the blade had gone.)
      const sweep = 1.9;
      const from = s.a - (sweep / 2) * dir;
      const lead = Math.min(1, k * 1.8 + 0.3);
      const tail = Math.max(0, k * 1.8 - 0.5);
      for (let u = tail; u < lead; u += 0.012) {
        const a = from + sweep * u * dir;
        const jag = s.jag ? 1 + (Math.floor(u * 38) % 2 === 0 ? 0.05 : -0.05) : 1;
        const edge = (u - tail) / Math.max(0.01, lead - tail);
        const mid = 1 - Math.abs(u - 0.5) * 2;
        for (let band = 0; band < 3; band++) {
          if (band > 0.6 + mid * 2) continue;
          const rr = s.reach * (0.95 - band * 0.07) * jag;
          const x = s.x + Math.cos(a) * rr;
          const y = s.y + Math.sin(a) * rr;
          if (hid(x, y)) continue;
          g.fillStyle = band === 0 && edge > 0.6 ? P.white : edge > 0.85 ? s.colors[0] : col;
          g.fillRect(Math.round(wx(c, x, y)), Math.round(wy(c, x, y)) - 10, band === 0 ? 2 : 1, 1);
        }
      }
      g.globalAlpha = 1;
    }
    for (const b of this.beams) {
      // a column of light: wide and white at first, thin and coloured as it goes
      const k = b.t / b.dur;
      const cx = Math.round(wx(c, b.x, b.y));
      const cy = Math.round(wy(c, b.x, b.y));
      const w = Math.max(1, Math.round(b.w * (1 - k)));
      g.globalAlpha = 0.85 * (1 - k * 0.6);
      g.fillStyle = b.colors[Math.min(b.colors.length - 1, Math.floor(k * b.colors.length) + 1)];
      g.fillRect(cx - w, cy - 150, w * 2 + 1, 150);
      g.fillStyle = P.white;
      g.fillRect(cx - Math.floor(w / 2), cy - 150, Math.max(1, w), 150);
      g.globalAlpha = 1;
    }
    for (const f of this.flashes) {
      // a burst of light: a bright core with four rays
      const k = f.t / f.dur;
      const cx = Math.round(wx(c, f.x, f.y));
      const cy = Math.round(wy(c, f.x, f.y) - f.z);
      const rad = f.r * (0.7 + 0.5 * k);
      g.globalAlpha = 0.9 * (1 - k * 0.7);
      g.fillStyle = f.colors[Math.min(f.colors.length - 1, Math.floor(k * f.colors.length))];
      g.beginPath();
      g.ellipse(cx, cy, rad * 15, rad * 9, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = f.colors[0];
      const ray = Math.round(rad * 30);
      g.fillRect(cx - ray, cy, ray * 2, 1);
      g.fillRect(cx, cy - Math.round(ray * 0.6), 1, Math.round(ray * 1.2));
      g.globalAlpha = 1;
    }
    // A beam held away up the screen leaves the wand on the far side of the hero, so the hero
    // stands in front of its first stretch. Beams are light, drawn after the darkness, and cannot
    // simply be drawn before the hero: so such a beam is drawn to one side, the hero's shape is
    // cut out of it, and it is laid down.
    const shape = this.heroShape;
    const away = shape ? this.held.filter((r) => wy(c, r.x1, r.y1) < wy(c, r.x0, r.y0) - 1) : [];
    if (shape && away.length) {
      const cv = this.behindCv ?? (this.behindCv = document.createElement('canvas'));
      if (cv.width !== shape.W || cv.height !== shape.H) {
        cv.width = shape.W;
        cv.height = shape.H;
      }
      const b = cv.getContext('2d') as CanvasRenderingContext2D;
      b.globalCompositeOperation = 'source-over';
      b.globalAlpha = 1;
      b.clearRect(0, 0, cv.width, cv.height);
      for (const r of away) this.drawRay(b, c, r);
      b.globalCompositeOperation = 'destination-out';
      b.globalAlpha = 1;
      b.drawImage(shape.img, shape.x, shape.y, shape.w, shape.h);
      b.globalCompositeOperation = 'source-over';
      g.drawImage(cv, 0, 0);
    }
    for (const r of this.rays) this.drawRay(g, c, r);
    for (const r of this.held) if (!away.includes(r)) this.drawRay(g, c, r);
    for (const b of this.bolts) {
      const cs = b.colors ?? VOLT;
      const col = b.t < 0.06 ? cs[0] : b.t < 0.11 ? cs[2] : cs[3];
      for (let i = 0; i + 3 < b.pts.length; i += 2) {
        const x0 = wx(c, b.pts[i], b.pts[i + 1]);
        const y0 = wy(c, b.pts[i], b.pts[i + 1]) - 10;
        const x1 = wx(c, b.pts[i + 2], b.pts[i + 3]);
        const y1 = wy(c, b.pts[i + 2], b.pts[i + 3]) - 10;
        // a glow either side of the white core while it is fresh
        if (b.t < 0.08) pline(g, x0, y0 + 1, x1, y1 + 1, cs[3]);
        pline(g, x0, y0, x1, y1, col);
      }
    }
    for (const b of this.skyBolts) {
      const k = b.t / b.dur;
      const bx = wx(c, b.x, b.y);
      const by = wy(c, b.x, b.y) - 4;
      const step = b.top / b.offs.length;
      const core = k < 0.4 ? P.white : k < 0.7 ? P.lt3 : P.lt2;
      let px = bx;
      let py = by;
      for (let i = 0; i < b.offs.length; i++) {
        const nx = bx + b.offs[i];
        const ny = by - (i + 1) * step;
        if (k < 0.55) {
          pline(g, px - 1, py, nx - 1, ny, P.lt3);
          pline(g, px + 1, py, nx + 1, ny, P.lt2);
        }
        pline(g, px, py, nx, ny, core);
        px = nx;
        py = ny;
      }
      // the fork leaves the main bolt part-way up and runs down beside it
      if (k < 0.7) {
        for (let i = 0; i + 1 < b.fork.length; i += 2) {
          const at = b.fork[i];
          const x0 = i === 0 ? bx + b.offs[at] : bx + b.fork[i - 1];
          const y0 = by - (at + 1) * step + (i / 2) * step * 0.7;
          pline(g, x0, y0, bx + b.fork[i + 1], y0 + step * 0.7, P.lt3);
        }
      }
    }
    for (const w of this.wisps) {
      if (w.t < 0) continue;
      // a bead of light with a red tail, along a curve to the hero
      const h = this.hero;
      const at = (k: number): [number, number] => {
        const e = k * k * (3 - 2 * k);
        const dx = h.x - w.sx;
        const dy = h.y - w.sy;
        const side = Math.sin(Math.PI * k) * w.bend * 0.5;
        const x = w.sx + dx * e - dy * side;
        const y = w.sy + dy * e + dx * side;
        return [wx(c, x, y), wy(c, x, y) - 10 - Math.sin(Math.PI * k) * w.lift];
      };
      const k1 = w.t / w.dur;
      let [px, py] = at(k1);
      for (let tail = 1; tail <= 5; tail++) {
        const k = k1 - tail * 0.07;
        if (k < 0) break;
        const [qx, qy] = at(k);
        pline(g, px, py, qx, qy, tail < 2 ? P.bl5 : tail < 4 ? P.bl4 : P.bl3);
        px = qx;
        py = qy;
      }
      const [hx, hy] = at(k1);
      g.fillStyle = P.bl5;
      g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3);
      g.fillStyle = P.white;
      g.fillRect(Math.round(hx), Math.round(hy), 1, 1);
    }
    // A volley's arrows coming down: each an arrow, head first, its fletching last, with a pale
    // line of the air it has come through. (They fall straight: the picture is of a rain.)
    for (const a of this.falling) {
      const px = Math.round(wx(c, a.x, a.y));
      const py = Math.round(wy(c, a.x, a.y) - ARROW_FALL * Math.max(0, a.dur - a.t));
      const w = a.heavy ? 2 : 1;
      g.globalAlpha = 0.3;
      g.fillStyle = a.colors[1];
      g.fillRect(px, py - 30, 1, 18);
      g.globalAlpha = 1;
      g.fillStyle = a.colors[Math.min(a.colors.length - 1, 2)];
      g.fillRect(px, py - 12, w, 10);
      g.fillStyle = a.colors[1];
      g.fillRect(px - 1, py - 13, w + 2, 2);
      g.fillStyle = a.colors[0];
      g.fillRect(px, py - 3, w, 3);
    }
    for (const p of this.particles) {
      const px = Math.round(wx(c, p.x, p.y));
      const py = Math.round(wy(c, p.x, p.y) - p.z);
      const color = p.ramp && p.life0 ? p.ramp[Math.min(p.ramp.length - 1, Math.floor((1 - p.life / p.life0) * p.ramp.length))] : p.color;
      if (p.streak) {
        // a line back along its motion as it looks on screen
        const sx = (p.vx - p.vy) * 16;
        const sy = (p.vx + p.vy) * 8 - p.vz;
        const len = Math.hypot(sx, sy) || 1;
        pline(g, px, py, px - (sx / len) * p.streak, py - (sy / len) * p.streak, color);
      } else {
        g.fillStyle = color;
        g.fillRect(px, py, p.size, p.size);
      }
    }
    // "of Power": an ember circles the hero for every stack held. (From Version 15.1, as the owner
    // asked on his page of notes, "Power's orbs spinning round the character": they go round on a
    // ring that is tilted, high behind the hero and low in front; the ones on the far side of the
    // hero are drawn small and dull and the near ones big and bright, so that they are seen to
    // pass behind and come round in front; each drags a tail of where it has just been; and the
    // more of them there are the faster the ring turns. Up to 15.0 they were all one size, on a
    // level ring, with a stub of a tail.)
    if (this.might.stacks > 0) {
      const h = this.hero;
      const n = this.might.stacks;
      const fading = this.might.t < 1;
      const spin = this.clock * (3.4 + n * 0.5);
      const R = 0.62;
      const at = (b: number): [number, number] => {
        const x = h.x + Math.cos(b) * R;
        const y = h.y + Math.sin(b) * R;
        // (the ring is tilted: highest up the screen, behind the hero; lowest in front)
        const z = 13 - (Math.cos(b) + Math.sin(b)) * 3.2;
        return [Math.round(wx(c, x, y)), Math.round(wy(c, x, y) - z)];
      };
      for (const pass of [0, 1]) {
        for (let i = 0; i < n; i++) {
          const a = spin + (i / n) * Math.PI * 2;
          // (beyond the hero: further up the screen than they stand)
          const far = Math.cos(a) + Math.sin(a) < 0;
          if ((pass === 0) !== far) continue;
          if (fading && Math.floor(this.clock * 12) % 2 === 0) continue;
          const [px, py] = at(a);
          let fx0 = px;
          let fy0 = py;
          for (let k = 1; k <= (far ? 3 : 5); k++) {
            const [qx, qy] = at(a - k * 0.17);
            pline(g, fx0, fy0 + 1, qx, qy + 1, far ? P.fr3 : k <= 2 ? P.fr5 : k <= 4 ? P.fr4 : P.fr3);
            if (!far && k <= 2) pline(g, fx0, fy0, qx, qy, P.fr5);
            fx0 = qx;
            fy0 = qy;
          }
          if (far) {
            g.fillStyle = P.fr3;
            g.fillRect(px - 1, py - 1, 3, 3);
            g.fillStyle = P.fr5;
            g.fillRect(px, py, 1, 1);
          } else {
            g.fillStyle = P.fr4;
            g.fillRect(px - 2, py - 1, 5, 3);
            g.fillRect(px - 1, py - 2, 3, 5);
            g.fillStyle = P.fr6;
            g.fillRect(px - 1, py - 1, 3, 3);
            g.fillStyle = P.white;
            g.fillRect(px, py, 1, 1);
          }
        }
      }
    }
  }

  /** Damage numbers and other floating text. */
  drawText(g: CanvasRenderingContext2D, c: Cam): void {
    const viewW = g.canvas.width / (g.getTransform().a || 1);
    for (const f of this.floaters) {
      const x = Math.round(wx(c, f.x, f.y) + f.drift * Math.min(1, f.t * 3));
      const y = Math.round(wy(c, f.x, f.y) - f.z);
      const w = f.big ? textWidth(f.text) : 0;
      if (w > viewW - 8) {
        // (an attack's new name with four words on it is wider than a phone held upright: it is
        // written on as many lines as it needs, the last where one line would have been)
        const rows = wrapText(f.text, viewW - 8);
        rows.forEach((row, i) => drawText(g, row, Math.round(viewW / 2), y - (rows.length - 1 - i) * 10, f.color, { align: 'center', shadow: P.ink }));
      } else {
        // (and a wide one is kept on the screen, whichever side of it the thing happened on)
        const half = w / 2 + 4;
        drawText(g, f.text, f.big && viewW > 2 * half ? Math.max(half, Math.min(viewW - half, x)) : x, y, f.color, { align: 'center', font: f.big ? 'normal' : 'small', shadow: P.ink });
      }
    }
    // what the hero has to say about a big kill: over their head, on a dark slip so that it reads over anything
    const q = this.quip;
    if (q) {
      const long = q.long ?? QUIP_TIME;
      const a = q.t < long - 0.4 ? 1 : Math.max(0, (long - q.t) / 0.4);
      // (a line too long for a narrow screen is set in two rows, and its slip is kept on the
      // screen: a line said on coming into a dungeon is a whole sentence, not a word or two)
      const rows = textWidth(q.text) + 10 > viewW - 4 ? wrapText(q.text, viewW - 16) : [q.text];
      const w = rows.reduce((n, r) => Math.max(n, textWidth(r)), 0) + 10;
      const px = Math.round(wx(c, this.hero.x, this.hero.y));
      const x = rows.length > 1 || w > viewW - 4 ? Math.max(Math.ceil(w / 2) + 2, Math.min(viewW - Math.ceil(w / 2) - 2, px)) : px;
      // (clear of the bar of life that hangs over the hero's head, and of a taller hero's hat)
      const y = Math.round(wy(c, this.hero.x, this.hero.y)) - Math.max(52, this.headroom + 20) - Math.round(Math.min(1, q.t / 0.12) * 4) - (rows.length - 1) * 10;
      const foot = y + 1 + rows.length * 10;
      g.globalAlpha = 0.72 * a;
      g.fillStyle = P.ink;
      g.fillRect(x - Math.floor(w / 2), y - 3, w, 4 + rows.length * 10);
      // (the tail of the slip points down at the hero)
      const tx = Math.max(x - Math.floor(w / 2) + 3, Math.min(x + Math.floor(w / 2) - 4, px));
      g.fillRect(tx - 2, foot, 5, 1);
      g.fillRect(tx - 1, foot + 1, 3, 1);
      g.fillRect(tx, foot + 2, 1, 1);
      g.globalAlpha = a;
      rows.forEach((r, i) => drawText(g, r, x, y + i * 10, q.t < 0.1 ? P.gd5 : P.white, { align: 'center', shadow: P.ink }));
      g.globalAlpha = 1;
    }
    // what one of the town's people says as the hero comes up: over their head, on a slip like the hero's own, kept on the screen
    const tag = this.tag;
    if (tag) {
      const a = tag.t < TAG_TIME - 0.4 ? 1 : Math.max(0, (TAG_TIME - tag.t) / 0.4);
      const w = textWidth(tag.text) + 10;
      const px = Math.round(wx(c, tag.x, tag.y));
      const x = viewW > w + 4 ? Math.max(Math.ceil(w / 2) + 2, Math.min(viewW - Math.ceil(w / 2) - 2, px)) : px;
      const y = Math.max(4, Math.round(wy(c, tag.x, tag.y)) - tag.lift - Math.round(Math.min(1, tag.t / 0.12) * 4));
      g.globalAlpha = 0.72 * a;
      g.fillStyle = P.ink;
      g.fillRect(x - Math.floor(w / 2), y - 3, w, 14);
      // (the tail of the slip points down at whoever is speaking)
      const tx = Math.max(x - Math.floor(w / 2) + 3, Math.min(x + Math.floor(w / 2) - 4, px));
      g.fillRect(tx - 2, y + 11, 5, 1);
      g.fillRect(tx - 1, y + 12, 3, 1);
      g.fillRect(tx, y + 13, 1, 1);
      g.globalAlpha = a;
      drawText(g, tag.text, x, y, tag.t < 0.1 ? P.gd5 : P.white, { align: 'center', shadow: P.ink });
      g.globalAlpha = 1;
    }
  }
}
