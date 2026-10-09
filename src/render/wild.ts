// BIG AND WILD: what the effects add when art/moves3.ts WILD is on. A MOCK-UP BEHIND A SWITCH THAT
// IS OFF (the art chat, 8 Oct 2026). The owner, by 20:14, of the mage's power getting away from her:
// "there's not even a glow on the staff, it just gets lighter.  there should be energy crackling and
// bolts shooting out, barely able to contain it.  this goes for all the animations we've created.
// i think we need to amend the rules for effects and animations change it to big and wild.  why dont
// you redo the WAVE animation as big and wild as you think is appropriate and ill tell you if it
// needs to go more or less wild".
//
// So, the Wave first, as the measure of how wild:
//   - THE CRYSTAL CRACKLES. The power the mage holds (where her crystal is in each picture, and how
//     hot it burns: art/kit.ts, Charge) throws little arcs and sparks all the time, a few in her
//     guard and a storm of them as she gathers a spell; and when it burns hottest, bolts jump from it
//     to the floor round her.
//   - THE WAVE IS LET GO with a blast: a flash at the crystal, a ring, a fan of sparks, and bolts that
//     shoot out ahead of it and strike the floor; the screen kicks.
//   - IN FLIGHT it stands up tall and boils (render.ts, drawWildWave below), arcs crawl along its
//     crest and leap off it, sparks stream back off it, and bolts fork ahead of it to the floor.
//   - WHAT IT HITS crackles: a flash, arcs crawling over the struck, sparks, a bolt to the floor.
// Her power crackles in the friend's cyan, white at its heart (the crystal's own colours: what glows
// on a friend is cyan); the wave keeps the violet of her magic.
//
// Then Strike and Shot, each hero in his own way (the owner, of a first try that crackled: "Each
// character has a style, the crackling works for the mage, but not the warrior.   Try again using
// their style as inspiration."):
//   - THE WARRIOR'S STRIKE (swing, blowHit): a big crescent of the blade's light, a second sweep after
//     it as the blade follows through, wind off its edge, dust at his feet; each blow lands hard.
//   - THE RANGER'S SHOT (loose, arrowHit): wind, not power: a gust at the bow, hoops of air, a trail
//     of air behind the arrow, and it punches into what it hits.
//   - WHAT FLIES OFF A HIT is what the struck is made of (MATTER, debris): bone and dust off a
//     skeleton, yellow sparks off armour.
// Nothing here changes the game.

import { figureOf } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import { BONE } from '../art/kit';
import { BLOOD as M_BLOOD, FLESH, FUR, GLOOM, IRON } from '../art/mkit';
import { WILD } from '../art/moves3';
import { OSSUARY, PALLOR, PLANK, SHROUD } from '../art/new_mobs3';
import { P } from '../art/palette';
import type { MonsterKind } from '../game/types';
import type { Cam, Fx } from './fx';

/** Her power's own colours, brightest first: white at its heart, the crystal's cyan, and its deep edge. */
export const CRACKLE: readonly string[] = ['#ffffff', '#b8fff8', '#22d0e0', '#0c6a80'];
/** ... and with the violet of her magic, for what the wave throws off. */
const SPARKS: readonly string[] = ['#ffffff', '#b8fff8', '#22d0e0', P.pu5, P.pu4];
/** The ranger's: WIND, not power (the owner: "Can we make the blue effects just like wind instead of energy?"). Pale and cool, and seen through, brightest first. */
export const AIR: readonly string[] = ['#ffffff', '#e6eef8', '#c8d4e8', '#a4b2cc'];
/** Sparks struck off armour (the owner: "yellow sparks hitting an armored target"), brightest first. */
const STRUCK_STEEL: readonly string[] = ['#ffffff', P.gd5, P.gd4];
/** The warrior's blade's light, brightest first: the friend's cyan, white at its edge (the Strike he said yes to). */
const BLADE: readonly string[] = [P.white, CRACKLE[1], CRACKLE[2], CRACKLE[3]];
/** How high a leap carries him, big and wild, in game pixels (the game's own: 24): render.ts lifts him so. */
export const LEAP_LIFT = 40;
/** How high an orb hangs, in game pixels: where its middle is (render.ts draws it 13 up, bobbing). */
const ORB_Z = 16;

/**
 * WHAT FLIES OFF A MONSTER WHEN IT IS HIT, by what it is (the owner, of Strike: "I'd rather have bone
 * fragments or dust from the skeletons, or yellow sparks hitting an armored target.  So maybe that's a
 * mob particle effect as opposed to the weapon effect"): bone and dust off the skeletons; yellow sparks
 * and flakes of iron off the armoured; scraps of robe off a cultist; a little blood off flesh (a
 * little: the art rulebook); tufts off a bat. In the monsters' own colours (art/kit.ts, art/mkit.ts).
 */
const MATTER: Record<MonsterFigure, { bits: readonly string[]; sparks: boolean; blood: boolean; dust: boolean }> = {
  skeleton: { bits: [BONE[4], BONE[3], BONE[2]], sparks: false, blood: false, dust: true },
  archer: { bits: [BONE[4], BONE[3], BONE[2]], sparks: false, blood: false, dust: true },
  cultist: { bits: [GLOOM[4], GLOOM[2]], sparks: false, blood: true, dust: false },
  bat: { bits: [FUR[4], FUR[2]], sparks: false, blood: true, dust: false },
  brute: { bits: [FLESH[2]], sparks: false, blood: true, dust: true },
  guardian: { bits: [IRON[4], IRON[2]], sparks: true, blood: false, dust: false },
  warden: { bits: [IRON[4], IRON[2]], sparks: true, blood: false, dust: false },
  // THE NEW MONSTERS (Version 19.9): wisps of the Shade's shroud; the Boneward's bone planks and iron;
  // the Golem's bones; the champion's bones off his rusted plate
  shade: { bits: [SHROUD[3], PALLOR[3], PALLOR[2]], sparks: false, blood: false, dust: false },
  boneward: { bits: [PLANK[4], PLANK[3], IRON[2]], sparks: true, blood: false, dust: true },
  golem: { bits: [OSSUARY[4], OSSUARY[3], OSSUARY[2]], sparks: false, blood: false, dust: true },
  champion: { bits: [BONE[4], BONE[3], IRON[2]], sparks: true, blood: false, dust: true },
};

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const pick = (list: readonly string[]): string => list[Math.floor(Math.random() * list.length)];
const smooth = (a: number, b: number, v: number): number => {
  const k = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const sx = (c: Cam, x: number, y: number): number => c.ox + (x - y) * 16;
const sy = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8 - (c.lift ? c.lift(x, y) : 0);

/** A line of whole pixels from one point of the screen to another. */
function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  let ax = Math.round(x0);
  let ay = Math.round(y0);
  const bx = Math.round(x1);
  const by = Math.round(y1);
  const dx = Math.abs(bx - ax);
  const dy = -Math.abs(by - ay);
  const stx = ax < bx ? 1 : -1;
  const sty = ay < by ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 400; n++) {
    g.fillRect(ax, ay, 1, 1);
    if (ax === bx && ay === by) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      ax += stx;
    }
    if (e2 <= dx) {
      err += dx;
      ay += sty;
    }
  }
}

/** An arc of power: a jagged line through the air, its points places in the world and their heights (x, y, z, x, y, z ...). */
interface Arc {
  pts: number[];
  t: number;
  dur: number;
  /** A bolt: drawn two pixels thick while it is fresh. */
  bolt: boolean;
}

/** A place in the world `right` game pixels to the right of another on the screen and `up` pixels higher. */
function beside(x: number, y: number, z: number, right: number, up: number): [number, number, number] {
  return [x + right / 32, y - right / 32, z + up];
}

/**
 * What the frame loop says of the world each step (main.ts, through `see`), for what goes on for as
 * long as it lasts: the hero and the move he is in (a leap, a roll), the orbs set down, the volleys
 * coming down, and the traps lying in wait.
 */
export interface WildWorld {
  hero: { x: number; y: number; fx: number; fy: number; move: { kind: string; t: number; dur: number; x0: number; y0: number; x1: number; y1: number } | null };
  orbs: ReadonlyArray<{ id: number; x: number; y: number; t: number; life: number }>;
  volleys: ReadonlyArray<{ id: number; x: number; y: number; r: number; t: number }>;
  traps: ReadonlyArray<{ x: number; y: number }>;
}

/** A whirlwind of air standing up off the floor (a trap bursting): where, how wide, and how far through its short life. */
interface Twister {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  spin: number;
}

/** A ring of wind going round a place on the floor (a volley's patch; the whirlwind round the warrior): where, how wide, how high, how strong (0..1), and how far round. */
interface Vortex {
  key: string;
  x: number;
  y: number;
  r: number;
  z: number;
  k: number;
  spin: number;
  /** Seen this step: one no longer told of fades away. */
  fresh: boolean;
  /** The colours of the wind: air, or the blade's light. */
  blade: boolean;
}

export class Wild {
  arcs: Arc[] = [];
  /** Where the power the hero holds burns, as the renderer last said, how hot, the way the hero faces, and how long ago it was said. */
  private held: { x: number; y: number; z: number; heat: number; fx: number; fy: number; age: number } | null = null;
  /** The hero's waves in flight, as last seen: what they hit crackles. */
  private waves: { x: number; y: number; r: number }[] = [];
  /** Arcs, sparks and bolts owed to the crystal by how hot it burns, carried from one moment to the next. */
  private owed = { arcs: 0, sparks: 0, bolts: 0 };
  private later: { t: number; fn: () => void }[] = [];
  /** Seconds, as the effects count them. */
  private clock = 0;
  /** The hero's last swing (Strike): from where, how far it reached, and when. What it hits a moment later is struck hard. */
  private swung: { x: number; y: number; reach: number; at: number } | null = null;
  /** The hero's arrows in flight, as last seen, and every arrow already seen let go. */
  private arrows: { x: number; y: number }[] = [];
  private seen = new WeakSet<object>();
  /**
   * The streak of light each of the hero's arrows leaves: from where it was let go, the way it flies,
   * how high, where its point is (as last seen), how far it has come, and how long since it struck
   * (or flew out), as the streak draws in after it.
   */
  private tracers: { shot: object; x0: number; y0: number; ux: number; uy: number; z: number; hx: number; hy: number; gone: number; spin: number }[] = [];
  /** The monsters, as last seen: where each is and what it is (what flies off it when it is hit). */
  private mobs: { x: number; y: number; figure: MonsterFigure }[] = [];
  /** Which swing of Strike the hero is in: 1 the second, the swipe back (the rules' Hero.combo). */
  private heroCombo = 0;
  /** Rings of air thrown off at the loose, standing across the arrow's way: where, how high, the way it goes, and how far through their short lives. */
  private rings: { x: number; y: number; z: number; ux: number; uy: number; t: number; dur: number }[] = [];
  /** The world as the frame loop last told it (see), and the step before's (what has just begun or just gone). */
  private world: WildWorld | null = null;
  /** The leap or roll last seen begun (a move is begun once). */
  private moveSeen: object | null = null;
  /** The whirlwind the warrior is in, if he is: since when, and how wide its blade reaches. */
  private whirling: { since: number; r: number } | null = null;
  /** Where a heavy blow fell a moment ago (a leap's landing, a whirlwind's turn): what is hit there is struck hard. */
  private slams: { x: number; y: number; r: number; at: number; force: number }[] = [];
  /** Where the mage's power burst a moment ago (an orb's wave, her arrival from a warp): what is hit there crackles. */
  private novas: { x: number; y: number; r: number; at: number }[] = [];
  /** Where a volley's arrows came down a moment ago: what is hit there is struck by an arrow. */
  private rain: { x: number; y: number; at: number }[] = [];
  /** A warp begun this step: where she went from (the second burst says where she came out). */
  private warpFrom: { x: number; y: number; at: number } | null = null;
  private twisters: Twister[] = [];
  private vortices: Vortex[] = [];
  /** The orbs as last seen, by id (one gone has burst out). */
  private orbsSeen = new Map<number, { x: number; y: number }>();

  constructor(private fx: Fx) {}

  clear(): void {
    this.arcs = [];
    this.held = null;
    this.waves = [];
    this.later = [];
    this.swung = null;
    this.arrows = [];
    this.tracers = [];
    this.rings = [];
    this.world = null;
    this.moveSeen = null;
    this.whirling = null;
    this.slams = [];
    this.novas = [];
    this.rain = [];
    this.warpFrom = null;
    this.twisters = [];
    this.vortices = [];
    this.orbsSeen.clear();
    this.hoops = [];
    this.gusts = [];
    this.trapsBefore = [];
    this.warpTo = null;
  }

  /** The frame loop, each step: the monsters, which swing of Strike the hero is in, and (for what goes on as long as it lasts) the world. */
  see(monsters: ReadonlyArray<{ x: number; y: number; kind: MonsterKind; champion: boolean; dead?: boolean }>, combo: number, world: WildWorld | null = null): void {
    this.heroCombo = combo;
    if (!WILD.on) return;
    this.mobs = [];
    for (const m of monsters) if (!m.dead) this.mobs.push({ x: m.x, y: m.y, figure: figureOf(m) });
    this.world = world;
    // (the traps as they lie now: the rules take one away as it goes off, before its burst is told)
    this.trapsBefore = world ? world.traps.map((t) => ({ x: t.x, y: t.y })) : [];
  }

  /** What is at (x, y): the monster nearest it, within a tile. */
  private figureAt(x: number, y: number): MonsterFigure | null {
    let best: MonsterFigure | null = null;
    let near = 1;
    for (const m of this.mobs) {
      const d = Math.hypot(m.x - x, m.y - y);
      if (d < near) {
        near = d;
        best = m.figure;
      }
    }
    return best;
  }

  /** What flies off what was hit at (x, y), struck the way `a` (radians, in the world) with `force` (1 a blow of Strike, less an arrow). */
  private debris(x: number, y: number, a: number, force: number): void {
    const figure = this.figureAt(x, y);
    const matter = figure ? MATTER[figure] : { bits: [P.st6, P.st5], sparks: false, blood: false, dust: true };
    const n = Math.round(11 * force);
    for (let i = 0; i < n; i++) {
      // (most of it flung on the way the blow went, the rest anywhere; chips big enough to see)
      const q = i < n * 0.65 ? a + rnd(-0.8, 0.8) : Math.random() * Math.PI * 2;
      const v = rnd(1.2, 3.6) * (0.6 + 0.4 * force);
      this.spark(x, y, rnd(8, 20), Math.cos(q) * v, Math.sin(q) * v, rnd(50, 140), rnd(0.35, 0.6), matter.bits, 320, 0, Math.random() < 0.2 ? 3 : 2);
    }
    if (matter.sparks) {
      // (a spray of them, bright, flung on and bouncing off the floor)
      for (let i = 0; i < Math.round(24 * force); i++) {
        const q = a + rnd(-1.3, 1.3);
        const v = rnd(2.5, 6.5);
        this.spark(x, y, rnd(12, 24), Math.cos(q) * v, Math.sin(q) * v, rnd(40, 140), rnd(0.25, 0.5), STRUCK_STEEL, 300, i % 2 === 0 ? 4 : 0, 2);
      }
      this.fx.flashes.push({ x, y, z: 18, r: 0.3, t: 0, dur: 0.08, colors: [P.white, P.gd5, P.gd4] });
    }
    if (matter.blood) {
      for (let i = 0; i < Math.round(4 * force); i++) {
        const q = a + rnd(-0.7, 0.7);
        const v = rnd(1, 2.6);
        this.spark(x, y, rnd(10, 18), Math.cos(q) * v, Math.sin(q) * v, rnd(20, 70), rnd(0.3, 0.5), [M_BLOOD[2], M_BLOOD[3]], 300);
      }
    }
    if (matter.dust) {
      // (a puff of it where the blow fell, that hangs a moment as it drifts on and settles)
      for (let i = 0; i < Math.round(6 * force); i++) {
        const q = a + rnd(-1.3, 1.3);
        const v = rnd(0.3, 1.1);
        this.spark(x, y, rnd(9, 19), Math.cos(q) * v, Math.sin(q) * v, rnd(-4, 10), rnd(0.45, 0.8), [matter.bits[matter.bits.length - 1], P.st5], 14, 0, 2);
      }
      for (let i = 0; i < Math.round(6 * force); i++) {
        const q = Math.random() * Math.PI * 2;
        const v = rnd(0.3, 1);
        this.spark(x + Math.cos(q) * 0.15, y + Math.sin(q) * 0.15, rnd(2, 10), Math.cos(q) * v, Math.sin(q) * v, rnd(8, 30), rnd(0.4, 0.7), [P.st6, P.st5, P.st4], 40);
      }
    }
  }

  /** The renderer, each frame the hero is drawn: where the power they hold burns (a place in the world and its height), how hot, and the way they face. */
  charge(x: number, y: number, z: number, heat: number, fx: number, fy: number): void {
    this.held = { x, y, z, heat, fx, fy, age: 0 };
  }

  private spark(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, colors: readonly string[], grav = 180, streak = 0, size = Math.random() < 0.22 ? 2 : 1): void {
    if (this.fx.particles.length >= 880) return;
    const p = { x, y, z, vx, vy, vz, life, color: pick(colors), size, grav, ...(streak > 0 ? { streak } : {}) };
    this.fx.particles.push(p);
  }

  /** A jagged arc from one point to another (places in the world and their heights), in `n` pieces, each joint thrown `jit` tiles aside and `jz` pixels up or down; bowed up by `bow` pixels in the middle. */
  private arc(a: readonly number[], b: readonly number[], n: number, jit: number, jz: number, dur: number, bolt = false, bow = 0): void {
    const pts: number[] = [a[0], a[1], a[2]];
    for (let i = 1; i < n; i++) {
      const k = i / n;
      pts.push(a[0] + (b[0] - a[0]) * k + rnd(-jit, jit), a[1] + (b[1] - a[1]) * k + rnd(-jit, jit), a[2] + (b[2] - a[2]) * k + rnd(-jz, jz) + Math.sin(Math.PI * k) * bow);
    }
    pts.push(b[0], b[1], b[2]);
    this.arcs.push({ pts, t: 0, dur, bolt });
    if (this.arcs.length > 240) this.arcs.shift();
  }

  /** A bolt from a point in the air down onto the floor, and where it strikes: a flash, sparks, a moment's light. */
  private strike(a: readonly number[], x: number, y: number, big: boolean): void {
    this.arc(a, [x, y, 0], big ? 10 : 7, big ? 0.16 : 0.1, big ? 4 : 3, big ? 0.13 : 0.1, true, big ? 7 : 4);
    this.fx.flashes.push({ x, y, z: 2, r: big ? 0.28 : 0.18, t: 0, dur: 0.09, colors: CRACKLE });
    for (let i = 0; i < (big ? 7 : 4); i++) {
      const q = Math.random() * Math.PI * 2;
      const s = rnd(0.6, 2.2);
      this.spark(x, y, 1, Math.cos(q) * s, Math.sin(q) * s, rnd(30, 110), rnd(0.15, 0.35), CRACKLE, 300);
    }
    if (this.fx.glows.length < 40) this.fx.glows.push({ x, y, r: big ? 40 : 28, t: 0, dur: 0.1 });
  }

  update(dt: number): void {
    this.clock += dt;
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const q = this.tracers[i];
      q.spin += dt * 40;
      if (q.gone >= 0) q.gone += dt;
      if (q.gone > 0.2) this.tracers.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      this.rings[i].t += dt;
      if (this.rings[i].t >= this.rings[i].dur) this.rings.splice(i, 1);
    }
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      this.arcs[i].t += dt;
      if (this.arcs[i].t >= this.arcs[i].dur) this.arcs.splice(i, 1);
    }
    for (let i = this.later.length - 1; i >= 0; i--) {
      this.later[i].t -= dt;
      if (this.later[i].t <= 0) {
        const fn = this.later[i].fn;
        this.later.splice(i, 1);
        fn();
      }
    }
    for (let i = this.twisters.length - 1; i >= 0; i--) {
      const w = this.twisters[i];
      w.t += dt;
      w.spin += dt * 16;
      if (w.t >= w.dur) this.twisters.splice(i, 1);
    }
    for (let i = this.hoops.length - 1; i >= 0; i--) {
      const o = this.hoops[i];
      o.t += dt;
      if (o.t > 0) o.z += o.vz * dt;
      if (o.t >= o.dur) this.hoops.splice(i, 1);
    }
    this.gusts = this.gusts.filter((s) => this.clock - s.at < 0.3);
    for (let i = this.vortices.length - 1; i >= 0; i--) {
      const v = this.vortices[i];
      v.spin += dt * (v.blade ? 15 : 5.5);
      // (one no longer told of dies down)
      if (!v.fresh) v.k -= dt * 3.5;
      v.fresh = false;
      if (v.k <= 0) this.vortices.splice(i, 1);
    }
    this.slams = this.slams.filter((s) => this.clock - s.at < 0.3);
    this.novas = this.novas.filter((s) => this.clock - s.at < 0.3);
    this.rain = this.rain.filter((s) => this.clock - s.at < 0.15);
    if (WILD.on && dt > 0) this.ongoing(dt);
    const h = this.held;
    if (!WILD.on || !h || h.age > 0.12 || dt <= 0) return;
    h.age += dt;
    // THE CRYSTAL CRACKLES, by how hot it burns: a few little arcs in her guard, a storm of them as a
    // spell gathers, and from the hottest, bolts that jump to the floor round her
    const s = smooth(1.2, 3, h.heat);
    // (and from a power that is only beginning to gather, as at the point of an arrow half drawn, less)
    const low = Math.min(1, h.heat / 1.2);
    this.owed.arcs += dt * (1.5 * low + 44 * s);
    this.owed.sparks += dt * (2 * low + 60 * s);
    this.owed.bolts += dt * 9 * smooth(2.3, 3, h.heat);
    const reach = 5 + 11 * s;
    while (this.owed.arcs >= 1) {
      this.owed.arcs--;
      // (out from the crystal, mostly up and away, and now and then one that loops back into it)
      const q = rnd(-Math.PI, Math.PI * 0.25);
      const long = rnd(0.5, 1) * reach;
      const end = beside(h.x, h.y, h.z, Math.cos(q) * long, -Math.sin(q) * long);
      const from = beside(h.x, h.y, h.z, rnd(-1, 1), rnd(-1, 1));
      if (Math.random() < 0.3) {
        const back = beside(h.x, h.y, h.z, rnd(-2, 2), rnd(-2, 2));
        this.arc(from, end, 3, 0.03, 1.5, rnd(0.04, 0.07));
        this.arc(end, back, 3, 0.03, 1.5, rnd(0.04, 0.07));
      } else this.arc(from, end, Math.random() < 0.5 ? 3 : 4, 0.04, 1.8, rnd(0.04, 0.09));
    }
    while (this.owed.sparks >= 1) {
      this.owed.sparks--;
      const q = Math.random() * Math.PI * 2;
      const v = rnd(0.5, 2.6);
      this.spark(h.x, h.y, h.z, Math.cos(q) * v, Math.sin(q) * v, rnd(-20, 80), rnd(0.15, 0.42), CRACKLE, 170, Math.random() < 0.35 ? 2 : 0);
    }
    while (this.owed.bolts >= 1) {
      this.owed.bolts--;
      const q = Math.atan2(h.fy, h.fx) + rnd(-1.5, 1.5);
      const d = rnd(0.7, 1.8);
      this.strike([h.x, h.y, h.z], h.x + Math.cos(q) * d, h.y + Math.sin(q) * d, false);
    }
    // (and its light flickers with it)
    if (s > 0.05 && this.fx.glows.length < 40) this.fx.glows.push({ x: h.x, y: h.y, r: 16 + 30 * s + rnd(0, 8 * s), t: 0, dur: 0.05 });
  }

  // -------------------------------------------------------------------------------------------
  // THE REST OF THE SKILLS, BIG AND WILD (the owner, 9 Oct 2026, 00:05: "let's reimagine the rest of
  // the animations for the main skills using the new rules"; then, of which: "We don't need slam or
  // familiar for now", "Don't need beam either"). Each hero in his own way: the warrior's WHIRLWIND
  // and LEAP in the blade's light, dust and a kick; the ranger's VOLLEY and TRAP in wind; the mage's
  // ORB and WARP crackle.

  /** A ring of wind (or of the blade's light) going round a place, told of again each step it lasts. */
  private vortex(key: string, x: number, y: number, r: number, z: number, k: number, blade: boolean): void {
    let v = this.vortices.find((q) => q.key === key);
    if (!v) {
      v = { key, x, y, r, z, k: 0, spin: Math.random() * 6, fresh: true, blade };
      this.vortices.push(v);
    }
    v.x = x;
    v.y = y;
    v.r = r;
    v.z = z;
    v.k = Math.min(1, Math.max(v.k, k));
    v.fresh = true;
  }

  /** What goes on for as long as it lasts, each frame: a leap and a roll as they go, the whirlwind round the warrior, the wind over a volley's patch, an orb crackling where it hangs. */
  private ongoing(dt: number): void {
    const w = this.world;
    if (!w) return;
    const h = w.hero;
    const fx = this.fx;
    const rate = (perSec: number): number => Math.floor(dt * perSec + Math.random());
    const mv = h.move;
    if (mv && mv !== this.moveSeen) {
      this.moveSeen = mv;
      if (mv.kind === 'leap') this.leapOff(mv.x0, mv.y0, mv.x1, mv.y1);
      else if (mv.kind === 'roll') this.rollOff(mv.x0, mv.y0, mv.x1, mv.y1);
    }
    if (mv) {
      const k = Math.min(1, mv.t / Math.max(1e-6, mv.dur));
      const len = Math.hypot(mv.x1 - mv.x0, mv.y1 - mv.y0) || 1;
      const ux = (mv.x1 - mv.x0) / len;
      const uy = (mv.y1 - mv.y0) / len;
      if (mv.kind === 'leap') {
        // (in the air: wind tearing off him back the way he came, and the blade's light trailing over his head)
        const up = Math.sin(k * Math.PI) * LEAP_LIFT;
        for (let i = rate(110); i > 0; i--) {
          const v = rnd(4, 8);
          this.spark(h.x + rnd(-0.15, 0.15), h.y + rnd(-0.15, 0.15), up + rnd(4, 34), -ux * v + rnd(-0.6, 0.6), -uy * v + rnd(-0.6, 0.6), rnd(-20, 20), rnd(0.08, 0.14), [AIR[0], AIR[1]], 0, rnd(5, 9));
        }
        for (let i = rate(70); i > 0; i--) this.spark(h.x - ux * 0.15, h.y - uy * 0.15, up + rnd(30, 44), -ux * rnd(0.5, 1.5), -uy * rnd(0.5, 1.5), rnd(-10, 10), rnd(0.12, 0.22), BLADE, 60, 0, 2);
      } else if (mv.kind === 'roll') {
        // (a swoosh of air along his tumble, curling off behind him; and grit kicked up)
        const side = Math.sin(this.clock * 30);
        for (let i = rate(120); i > 0; i--) {
          const v = rnd(1.5, 3.5);
          this.spark(h.x - ux * 0.25 + rnd(-0.1, 0.1), h.y - uy * 0.25 + rnd(-0.1, 0.1), rnd(2, 16), -ux * v - uy * side * 1.6, -uy * v + ux * side * 1.6, rnd(-10, 30), rnd(0.12, 0.2), [AIR[0], AIR[1], AIR[2]], 0, rnd(4, 7));
        }
        for (let i = rate(40); i > 0; i--) {
          const q = Math.random() * Math.PI * 2;
          this.spark(h.x + Math.cos(q) * 0.2, h.y + Math.sin(q) * 0.2, 1, Math.cos(q) * rnd(0.4, 1.2) - ux, Math.sin(q) * rnd(0.4, 1.2) - uy, rnd(10, 40), rnd(0.25, 0.45), [P.st6, P.st5, P.st4], 180);
        }
      }
    }
    // THE WHIRLWIND: a ring of the blade's light round him and a wider one of the wind it raises;
    // lines of wind flung off the blade's edge; dust and grit kicked up round his feet and flung out
    const wh = this.whirling;
    if (wh) {
      this.vortex('whirl', h.x, h.y, wh.r * 0.92, 11, 1, true);
      this.vortex('whirlAir', h.x, h.y, wh.r * 1.28, 5, 0.85, false);
      for (let i = rate(110); i > 0; i--) {
        const q = Math.random() * Math.PI * 2;
        const rr = wh.r * rnd(0.75, 1.05);
        const v = rnd(4, 8);
        // (round the way he turns, and outward)
        this.spark(h.x + Math.cos(q) * rr, h.y + Math.sin(q) * rr, rnd(5, 16), -Math.sin(q) * v + Math.cos(q) * rnd(1, 3), Math.cos(q) * v + Math.sin(q) * rnd(1, 3), 0, rnd(0.08, 0.14), [P.white, AIR[1]], 0, rnd(6, 10));
      }
      for (let i = rate(70); i > 0; i--) {
        const q = Math.random() * Math.PI * 2;
        const v = rnd(1.2, 3);
        this.spark(h.x + Math.cos(q) * rnd(0.2, 0.7), h.y + Math.sin(q) * rnd(0.2, 0.7), 1, Math.cos(q) * v - Math.sin(q) * v * 0.6, Math.sin(q) * v + Math.cos(q) * v * 0.6, rnd(20, 70), rnd(0.25, 0.5), [P.st6, P.st5, P.st4], 220);
      }
      if (fx.glows.length < 40) fx.glows.push({ x: h.x, y: h.y, r: 44 + rnd(0, 10), t: 0, dur: 0.05 });
    }
    // THE VOLLEYS: wind gathers round the patch while the arrows are up, and turns over it while they come down
    for (const v of w.volleys) {
      const up = v.t < 0 ? Math.max(0, Math.min(1, 1 + v.t / 0.45)) : 1;
      this.vortex(`volley${v.id}`, v.x, v.y, v.r * (1.35 - 0.3 * up), 7, 0.5 + 0.5 * up, false);
      this.vortex(`volleyLow${v.id}`, v.x, v.y, v.r * (0.95 - 0.25 * up), 2, 0.4 + 0.4 * up, false);
      for (let i = rate(46); i > 0; i--) {
        const q = Math.random() * Math.PI * 2;
        const rr = v.r * rnd(0.3, 1.15);
        const sp = rnd(1.5, 3.2);
        this.spark(v.x + Math.cos(q) * rr, v.y + Math.sin(q) * rr, rnd(1, 12), -Math.sin(q) * sp - Math.cos(q) * 0.5, Math.cos(q) * sp - Math.sin(q) * 0.5, rnd(10, 50), rnd(0.3, 0.6), [P.st6, P.st5, AIR[2], AIR[3]], 60);
      }
    }
    // THE ORBS: each crackles as it hangs there, arcs jumping off it, sparks, now and then a bolt to the floor
    const now = new Set<number>();
    for (const o of w.orbs) {
      now.add(o.id);
      this.orbsSeen.set(o.id, { x: o.x, y: o.y });
      const born = Math.min(1, o.t / 0.2);
      for (let i = rate(34 * born); i > 0; i--) {
        const q = rnd(-Math.PI, Math.PI);
        const long = rnd(6, 15);
        const from = beside(o.x, o.y, ORB_Z, rnd(-2, 2), rnd(-2, 2));
        const end = beside(o.x, o.y, ORB_Z, Math.cos(q) * long, -Math.sin(q) * long * 0.8);
        this.arc(from, end, Math.random() < 0.5 ? 3 : 4, 0.04, 2, rnd(0.04, 0.08));
      }
      for (let i = rate(36 * born); i > 0; i--) {
        const q = Math.random() * Math.PI * 2;
        const v = rnd(0.6, 2.4);
        this.spark(o.x, o.y, ORB_Z, Math.cos(q) * v, Math.sin(q) * v, rnd(-30, 70), rnd(0.15, 0.4), CRACKLE, 160, Math.random() < 0.35 ? 2 : 0);
      }
      for (let i = rate(3 * born); i > 0; i--) {
        const q = Math.random() * Math.PI * 2;
        const d = rnd(0.6, 1.5);
        this.strike([o.x, o.y, ORB_Z], o.x + Math.cos(q) * d, o.y + Math.sin(q) * d, false);
      }
      if (fx.glows.length < 40) fx.glows.push({ x: o.x, y: o.y, r: 30 + rnd(0, 14), t: 0, dur: 0.05 });
    }
    for (const [id, o] of this.orbsSeen) {
      if (now.has(id)) continue;
      this.orbsSeen.delete(id);
      this.orbGone(o.x, o.y);
    }
  }

  /** THE LEAP BEGINS: he drives up off the floor; it cracks under him, dust bursts out round his feet, and wind tears off him back the way he came; the screen jolts. */
  private leapOff(x0: number, y0: number, x1: number, y1: number): void {
    const fx = this.fx;
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    this.cracksAt(x0, y0, 0.7, 4, 1.4);
    fx.rings.push({ x: x0, y: y0, r: 0.9, t: 0, dur: 0.2, colors: [P.st6, P.st5, P.st4], fill: false, heavy: true });
    for (let i = 0; i < 20; i++) {
      const q = Math.atan2(-uy, -ux) + rnd(-1.6, 1.6);
      const v = rnd(0.8, 2.6);
      this.spark(x0 + Math.cos(q) * 0.15, y0 + Math.sin(q) * 0.15, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(20, 90), rnd(0.3, 0.6), [P.st6, P.st5, P.st4], 230, 0, Math.random() < 0.3 ? 2 : 1);
    }
    for (let i = 0; i < 12; i++) {
      const v = rnd(4, 9);
      this.spark(x0 + rnd(-0.2, 0.2), y0 + rnd(-0.2, 0.2), rnd(4, 26), -ux * v, -uy * v, rnd(20, 60), rnd(0.08, 0.14), [P.white, AIR[1]], 0, rnd(6, 10));
    }
    fx.flashes.push({ x: x0, y: y0, z: 3, r: 0.5, t: 0, dur: 0.08, colors: [P.white, AIR[1], P.st6] });
    fx.shake = Math.max(fx.shake, 1.4);
  }

  /** Cracks torn in the floor out from a place: `n` of them, about `long` tiles, lasting `dur` seconds; cold (the warrior's: no glow in them). */
  private cracksAt(x: number, y: number, long: number, n: number, dur: number): void {
    const a0 = Math.random() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      const a = a0 + (k / n) * Math.PI * 2 + rnd(-0.3, 0.3);
      const len = long * rnd(0.7, 1.1);
      const segs = 4;
      const pts: number[] = [x + Math.cos(a) * 0.08, y + Math.sin(a) * 0.08];
      for (let i = 1; i <= segs; i++) {
        const d = (len * i) / segs;
        const j = rnd(-0.14, 0.14) * (i < segs ? 1 : 0.4);
        pts.push(x + Math.cos(a) * d - Math.sin(a) * j, y + Math.sin(a) * d + Math.cos(a) * j);
      }
      this.fx.cracks.push({ pts, t: 0, dur, hot: 0 });
    }
    while (this.fx.cracks.length > 70) this.fx.cracks.shift();
  }

  /**
   * HE LANDS ('burst' land): the blade comes down into the floor ahead of him. A white flash, a cut
   * of the blade's light; the floor cracked open round him; stone and dust thrown up and a wall of
   * dust rolling out, with a ring of wind past it; the game holding still a tenth of a second (the
   * rulebook: heavy blows land with a freeze) and the screen kicking hard. What is struck there is
   * struck hard (hit, below).
   */
  landing(x: number, y: number, r: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    const h = this.world?.hero;
    const a = h ? Math.atan2(h.fy, h.fx) : 0;
    const fwd: [number, number] = [x + Math.cos(a) * 0.55, y + Math.sin(a) * 0.55];
    fx.flashes.push({ x: fwd[0], y: fwd[1], z: 5, r: 1.1, t: 0, dur: 0.12, colors: [P.white, AIR[1], P.st6, P.st5] });
    fx.slashes.push({ x, y, a, reach: 1.05, t: 0, dur: 0.22, colors: BLADE, heavy: true, jag: false, faint: false });
    this.cracksAt(fwd[0], fwd[1], r * 0.95, 7, 2.2);
    for (let i = 0; i < 24; i++) {
      const q = Math.random() * Math.PI * 2;
      const d = rnd(0.1, 0.6) * r;
      const v = rnd(1.5, 4.8);
      this.spark(fwd[0] + Math.cos(q) * d, fwd[1] + Math.sin(q) * d, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(80, 210), rnd(0.45, 0.85), [P.st7, P.st6, P.st5, P.er5], 430, 0, Math.random() < 0.45 ? 3 : 2);
    }
    for (let i = 0; i < 30; i++) {
      // (the wall of dust: slow, rolling out, hanging)
      const q = Math.random() * Math.PI * 2;
      const v = rnd(1.4, 3.2);
      this.spark(x + Math.cos(q) * 0.3, y + Math.sin(q) * 0.3, rnd(1, 8), Math.cos(q) * v, Math.sin(q) * v, rnd(4, 26), rnd(0.55, 1.0), [P.st6, P.st5, P.st4], 18, 0, 2);
    }
    for (let i = 0; i < 16; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(6, 10);
      this.spark(x, y, rnd(4, 14), Math.cos(q) * v, Math.sin(q) * v, 0, rnd(0.08, 0.13), [P.white, AIR[1]], 0, rnd(7, 11));
    }
    fx.rings.push({ x, y, r: r * 1.05, t: 0, dur: 0.26, colors: [P.st7, P.st6, P.st5], fill: false, heavy: true });
    fx.rings.push({ x, y, r: r * 1.5, t: 0, dur: 0.3, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true, heavy: true, delay: 0.05 });
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 80, t: 0, dur: 0.16 });
    fx.shake = Math.max(fx.shake, 4.2);
    fx.freeze = Math.max(fx.freeze, 0.1);
    this.slams.push({ x, y, r: r + 0.4, at: this.clock, force: 1.4 });
  }

  /** THE WHIRLWIND BEGINS (the 'channel' of a whirl): a kick of dust off the floor round him, a flash on the blade, and the screen jolts. */
  whirlStart(x: number, y: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    this.whirling = { since: this.clock, r: this.whirling?.r ?? 2 };
    fx.rings.push({ x, y, r: 1.0, t: 0, dur: 0.22, colors: [P.st6, P.st5, P.st4], fill: false, heavy: true });
    for (let i = 0; i < 22; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(1, 3);
      this.spark(x + Math.cos(q) * 0.2, y + Math.sin(q) * 0.2, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(30, 90), rnd(0.3, 0.55), [P.st6, P.st5, P.st4], 230);
    }
    fx.flashes.push({ x, y, z: 12, r: 0.7, t: 0, dur: 0.1, colors: BLADE });
    fx.shake = Math.max(fx.shake, 1.8);
  }

  /** Each turn of the whirlwind ('burst' whirl): a ring of wind thrown out past the blade, and a jolt. What the blade meets is struck hard. */
  whirlTurn(x: number, y: number, r: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    if (!this.whirling) this.whirling = { since: this.clock, r };
    this.whirling.r = r;
    fx.rings.push({ x, y, r: r * 1.3, t: 0, dur: 0.26, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true, heavy: true });
    this.slams.push({ x, y, r: r + 0.5, at: this.clock, force: 0.8 });
    fx.shake = Math.max(fx.shake, 1.2);
  }

  /** THE WHIRLWIND ENDS (its 'channelEnd'): one last sweep of the blade flung wide, and he plants his feet: dust, a ring, wind flung out, and a kick. */
  whirlEnd(x: number, y: number): void {
    const wh = this.whirling;
    this.whirling = null;
    if (!WILD.on || !wh) return;
    const fx = this.fx;
    const h = this.world?.hero;
    const a = h ? Math.atan2(h.fy, h.fx) : rnd(0, Math.PI * 2);
    fx.slashes.push({ x, y, a, reach: wh.r * 1.05, t: 0, dur: 0.26, colors: BLADE, heavy: true, rev: false, jag: false, faint: false });
    this.later.push({ t: 0.05, fn: () => fx.slashes.push({ x, y, a: a + 1.6, reach: wh.r, t: 0, dur: 0.22, colors: BLADE, heavy: false, rev: false, jag: false, faint: true }) });
    fx.rings.push({ x, y, r: wh.r * 1.1, t: 0, dur: 0.25, colors: [P.st6, P.st5, P.st4], fill: false, heavy: true });
    for (let i = 0; i < 18; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(5, 9);
      this.spark(x, y, rnd(5, 15), Math.cos(q) * v, Math.sin(q) * v, 0, rnd(0.08, 0.14), [P.white, AIR[1]], 0, rnd(6, 10));
    }
    fx.shake = Math.max(fx.shake, 2.2);
  }

  /** THE ROLL BEGINS: grit kicked up where he dives, and a breath of wind round him. */
  private rollOff(x0: number, y0: number, x1: number, y1: number): void {
    const fx = this.fx;
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    for (let i = 0; i < 12; i++) {
      const q = Math.atan2(-uy, -ux) + rnd(-1.2, 1.2);
      const v = rnd(0.6, 2);
      this.spark(x0, y0, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(20, 60), rnd(0.3, 0.5), [P.st6, P.st5, P.st4], 200);
    }
    fx.rings.push({ x: x0, y: y0, r: 0.7, t: 0, dur: 0.2, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true });
    fx.shake = Math.max(fx.shake, 0.7);
  }

  /** A TRAP IS SET ('trapSet'): the glint of its jaws as they open, a breath of wind round it, grit. */
  trapSet(x: number, y: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    fx.flashes.push({ x, y, z: 3, r: 0.3, t: 0, dur: 0.08, colors: [P.white, AIR[1], AIR[2]] });
    fx.rings.push({ x, y, r: 0.6, t: 0, dur: 0.22, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true, delay: 0.03 });
    for (let i = 0; i < 6; i++) {
      const q = Math.random() * Math.PI * 2;
      this.spark(x, y, 1, Math.cos(q) * rnd(0.5, 1.4), Math.sin(q) * rnd(0.5, 1.4), rnd(20, 50), rnd(0.25, 0.45), [P.st6, P.st5], 200);
    }
  }

  /**
   * A 'burst' of the kind a trap goes off in ('blast'): if a trap lay there, IT GOES OFF IN WIND. Its
   * jaws snap with a white flash and a whirlwind tears up out of it: a funnel of air turning, grit
   * and dust flung round in it, a ring of wind tearing outward past its edge; the screen kicks.
   */
  blast(x: number, y: number, r: number): void {
    if (!WILD.on) return;
    const w = this.world;
    // (only where a trap lay a moment ago: the rules take it away as it goes off)
    if (!w || !this.trapsBefore.some((t) => Math.hypot(t.x - x, t.y - y) < 0.4)) return;
    const fx = this.fx;
    this.twisters.push({ x, y, r: Math.max(0.55, r * 0.42), t: 0, dur: 0.8, spin: 0 });
    fx.flashes.push({ x, y, z: 5, r: 0.6, t: 0, dur: 0.09, colors: [P.white, AIR[1], AIR[2]] });
    fx.rings.push({ x, y, r: r * 1.2, t: 0, dur: 0.28, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true, heavy: true });
    fx.rings.push({ x, y, r: r * 0.75, t: 0, dur: 0.24, colors: [AIR[0], AIR[1]], fill: false, swirl: true, delay: 0.05 });
    for (let i = 0; i < 30; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(1.5, 4);
      this.spark(x + Math.cos(q) * 0.2, y + Math.sin(q) * 0.2, rnd(1, 10), Math.cos(q) * v - Math.sin(q) * v, Math.sin(q) * v + Math.cos(q) * v, rnd(40, 150), rnd(0.35, 0.7), [P.st6, P.st5, P.st4, P.st7], 300, 0, Math.random() < 0.3 ? 2 : 1);
    }
    for (let i = 0; i < 18; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(6, 10);
      this.spark(x, y, rnd(3, 18), Math.cos(q) * v, Math.sin(q) * v, rnd(-10, 30), rnd(0.08, 0.14), [P.white, AIR[1]], 0, rnd(6, 10));
    }
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 50, t: 0, dur: 0.12 });
    fx.shake = Math.max(fx.shake, 2.8);
    fx.freeze = Math.max(fx.freeze, 0.04);
    this.gusts.push({ x, y, r: r + 0.4, at: this.clock });
  }
  /** The traps as the step before saw them (one gone off is gone from the world's list by the time its burst is told). */
  private trapsBefore: { x: number; y: number }[] = [];
  /** Where a trap's whirlwind tore up a moment ago: what it caught is buffeted (no debris: only sword and arrows throw it). */
  private gusts: { x: number; y: number; r: number; at: number }[] = [];

  /**
   * A VOLLEY IS LOOSED ('volleyUp'): a gust bursts off the bow, upward; a column of wind spirals up
   * with the arrows, hoops of air standing round it as it goes; grit kicked up round his knee; the
   * screen kicks. (`bx`, `by`, `bz`: where the bow is; `tx`, `ty`: where they will come down.)
   */
  volleyUp(bx: number, by: number, bz: number, echo: boolean): void {
    if (!WILD.on) return;
    const fx = this.fx;
    fx.flashes.push({ x: bx, y: by, z: bz + 2, r: echo ? 0.3 : 0.5, t: 0, dur: 0.09, colors: [P.white, AIR[1], AIR[2]] });
    for (let i = 0; i < (echo ? 2 : 4); i++) this.hoops.push({ x: bx, y: by, z: bz + 3 + i * 9, r: 0.28 + i * 0.05, t: -i * 0.03, dur: 0.3, vz: 90 });
    for (let i = 0; i < (echo ? 10 : 26); i++) {
      // (the column of wind: lines of it spiralling up off the bow with the arrows)
      const q = Math.random() * Math.PI * 2;
      const v = rnd(0.6, 1.6);
      this.spark(bx + Math.cos(q) * 0.12, by + Math.sin(q) * 0.12, bz + rnd(0, 6), -Math.sin(q) * v, Math.cos(q) * v, rnd(160, 300), rnd(0.18, 0.32), [AIR[0], AIR[1], AIR[2]], 0, rnd(7, 12));
    }
    const h = this.world?.hero;
    const fx0 = h ? h.x : bx;
    const fy0 = h ? h.y : by;
    for (let i = 0; i < (echo ? 4 : 12); i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(0.6, 1.8);
      this.spark(fx0 + Math.cos(q) * 0.2, fy0 + Math.sin(q) * 0.2, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(15, 50), rnd(0.3, 0.55), [P.st6, P.st5, P.st4], 200);
    }
    fx.rings.push({ x: fx0, y: fy0, r: 0.8, t: 0, dur: 0.2, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true });
    if (!echo) fx.shake = Math.max(fx.shake, 1.4);
  }
  /** Hoops of air lying round a column of wind as it rises: where, how high, how wide (tiles), how far through their lives, and how fast they rise. */
  private hoops: { x: number; y: number; z: number; r: number; t: number; dur: number; vz: number }[] = [];

  /** AN ARROW OF THE VOLLEY COMES DOWN ('volleyDrop'), `inSec` from landing: a streak of wind falls with it. */
  volleyDrop(x: number, y: number, inSec: number): void {
    if (!WILD.on) return;
    const t = Math.max(0.05, inSec);
    this.spark(x + rnd(-0.03, 0.03), y + rnd(-0.03, 0.03), 72, 0, 0, -72 / t, t, [AIR[0], AIR[1]], 0, 22, 1);
  }

  /** IT LANDS ('volleyFall'): a puff of air and grit where it goes in; and if it struck something, it punches into it (`hits`: how many it struck). */
  volleyFall(x: number, y: number, hits: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    fx.rings.push({ x, y, r: 0.32, t: 0, dur: 0.14, colors: [AIR[0], AIR[1], AIR[2]], fill: false });
    for (let i = 0; i < 4; i++) {
      const q = Math.random() * Math.PI * 2;
      this.spark(x, y, 1, Math.cos(q) * rnd(0.4, 1.2), Math.sin(q) * rnd(0.4, 1.2), rnd(15, 45), rnd(0.25, 0.45), [P.st6, P.st5], 200);
    }
    if (hits > 0) {
      fx.flashes.push({ x, y, z: 12, r: 0.32, t: 0, dur: 0.07, colors: [P.white, AIR[1], AIR[2]] });
      this.debris(x, y, rnd(0, Math.PI * 2), 0.55);
      for (let i = 0; i < 5; i++) this.spark(x, y, rnd(14, 24), rnd(-0.6, 0.6), rnd(-0.6, 0.6), -rnd(120, 200), rnd(0.06, 0.1), [AIR[0], AIR[1]], 0, rnd(6, 10));
      fx.shake = Math.max(fx.shake, 0.9);
    }
  }

  /**
   * THE ORB IS SET ('orbSet'): the staff comes down and the power bursts out round her, a ring of
   * arcs and bolts striking the floor about her; a great bolt leaps from her crystal to where the
   * orb hangs, and it bursts into being with bolts of its own; the screen kicks.
   */
  orbSet(x: number, y: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    const h = this.world?.hero;
    const hx = h ? h.x : x;
    const hy = h ? h.y : y;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rnd(-0.2, 0.2);
      const b = a + rnd(0.4, 0.75);
      this.arc([hx + Math.cos(a) * 1.05, hy + Math.sin(a) * 1.05, 2], [hx + Math.cos(b) * 1.05, hy + Math.sin(b) * 1.05, 2], 4, 0.07, 3, 0.12);
    }
    for (let i = 0; i < 4; i++) {
      const q = Math.random() * Math.PI * 2;
      const d = rnd(0.7, 1.4);
      this.later.push({ t: i * 0.02, fn: () => this.strike([hx, hy, 24], hx + Math.cos(q) * d, hy + Math.sin(q) * d, false) });
    }
    const top: [number, number, number] = [hx + (h ? h.fx : 0) * 0.5, hy + (h ? h.fy : 0) * 0.5, 34];
    this.arc(top, [x, y, ORB_Z], 12, 0.2, 6, 0.16, true, 14);
    this.arc(top, [x, y, ORB_Z], 9, 0.14, 4, 0.11, false, 8);
    fx.flashes.push({ x, y, z: ORB_Z, r: 0.8, t: 0, dur: 0.12, colors: [P.white, CRACKLE[1], CRACKLE[2], P.pu4] });
    for (let i = 0; i < 6; i++) {
      const q = (i / 6) * Math.PI * 2 + rnd(-0.3, 0.3);
      const d = rnd(0.8, 1.6);
      this.later.push({ t: 0.03 + i * 0.015, fn: () => this.strike([x, y, ORB_Z], x + Math.cos(q) * d, y + Math.sin(q) * d, true) });
    }
    for (let i = 0; i < 26; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(1.5, 4.5);
      this.spark(x, y, ORB_Z, Math.cos(q) * v, Math.sin(q) * v, rnd(-20, 110), rnd(0.2, 0.45), SPARKS, 220, 2);
    }
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 90, t: 0, dur: 0.2 });
    fx.shake = Math.max(fx.shake, 2.5);
  }

  /** AN ORB IS GONE (its time up): its power folds in on it with a crack, and is spent in a last spray of sparks. */
  private orbGone(x: number, y: number): void {
    const fx = this.fx;
    for (let i = 0; i < 8; i++) {
      const q = (i / 8) * Math.PI * 2;
      this.arc(beside(x, y, ORB_Z, Math.cos(q) * 16, Math.sin(q) * 12), [x, y, ORB_Z], 4, 0.05, 2.5, 0.08);
    }
    this.later.push({
      t: 0.07,
      fn: () => {
        fx.flashes.push({ x, y, z: ORB_Z, r: 0.45, t: 0, dur: 0.1, colors: [P.white, CRACKLE[1], CRACKLE[2]] });
        for (let i = 0; i < 18; i++) {
          const q = Math.random() * Math.PI * 2;
          const v = rnd(1, 3);
          this.spark(x, y, ORB_Z, Math.cos(q) * v, Math.sin(q) * v, rnd(-10, 90), rnd(0.2, 0.4), CRACKLE, 200, 2);
        }
      },
    });
  }

  /**
   * A 'burst' of the mage's power ('nova'): AN ORB'S WAVE, or the burst she comes out of a warp in.
   * An orb's: a ring of arcs runs out from it, bolts lash out to what is near, sparks fly; the
   * screen jolts. Her arrival's is a thunderclap (thunder, below). What is caught crackles.
   */
  nova(x: number, y: number, r: number): void {
    if (!WILD.on) return;
    const to = this.warpTo;
    if (to && this.clock - to.at < 0.06 && Math.hypot(to.x - x, to.y - y) < 0.3) {
      this.warpTo = null;
      this.thunder(x, y, r);
      return;
    }
    const fx = this.fx;
    this.arcRing(x, y, r * 0.92, 10, 3);
    fx.rings.push({ x, y, r, t: 0, dur: 0.28, colors: [CRACKLE[0], CRACKLE[1], CRACKLE[2]], fill: false, heavy: true, jag: true });
    let lashed = 0;
    for (const m of this.mobs) {
      if (lashed >= 5 || Math.hypot(m.x - x, m.y - y) > r) continue;
      lashed++;
      this.arc([x, y, ORB_Z], [m.x, m.y, rnd(10, 18)], 8, 0.12, 4, 0.12, true, 5);
    }
    for (let i = lashed; i < 3; i++) {
      const q = Math.random() * Math.PI * 2;
      const d = rnd(0.6, r * 0.9);
      this.strike([x, y, ORB_Z], x + Math.cos(q) * d, y + Math.sin(q) * d, false);
    }
    for (let i = 0; i < 16; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(2, 4.5);
      this.spark(x, y, ORB_Z, Math.cos(q) * v, Math.sin(q) * v, rnd(-10, 80), rnd(0.2, 0.4), SPARKS, 200, 2);
    }
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 70, t: 0, dur: 0.14 });
    fx.shake = Math.max(fx.shake, 1.3);
    this.novas.push({ x, y, r, at: this.clock });
  }

  /** A ring of arcs on the floor round a place: `n` of them, each from one point of the ring to the next, at `z` pixels up. */
  private arcRing(x: number, y: number, r: number, n: number, z: number): void {
    const a0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2;
      const b = a + ((Math.PI * 2) / n) * rnd(0.7, 1.05);
      this.arc([x + Math.cos(a) * r, y + Math.sin(a) * r, z], [x + Math.cos(b) * r, y + Math.sin(b) * r, z], 4, 0.06, 3, rnd(0.09, 0.14));
    }
  }

  /**
   * THE WARP ('burst' warp, twice in one step: where she went from, then where she came out). At the
   * first her power folds in on her with a crack; at the second a great bolt joins the two places,
   * the way she went, sparks strewn along it.
   */
  warp(x: number, y: number): void {
    if (!WILD.on) return;
    const fx = this.fx;
    const from = this.warpFrom;
    if (!from || this.clock - from.at > 0.04) {
      this.warpFrom = { x, y, at: this.clock };
      for (let i = 0; i < 10; i++) {
        const q = (i / 10) * Math.PI * 2 + rnd(-0.2, 0.2);
        this.arc([x + Math.cos(q) * rnd(0.6, 1), y + Math.sin(q) * rnd(0.6, 1), rnd(4, 34)], [x, y, 16], 4, 0.05, 3, rnd(0.07, 0.1));
      }
      fx.flashes.push({ x, y, z: 16, r: 0.55, t: 0, dur: 0.1, colors: [P.white, CRACKLE[1], CRACKLE[2]] });
      for (let i = 0; i < 14; i++) {
        const q = Math.random() * Math.PI * 2;
        const v = rnd(1, 2.5);
        this.spark(x + Math.cos(q) * 0.5, y + Math.sin(q) * 0.5, rnd(4, 28), -Math.cos(q) * v, -Math.sin(q) * v, rnd(-20, 40), rnd(0.12, 0.25), CRACKLE, 60, 2);
      }
      return;
    }
    this.warpFrom = null;
    this.arc([from.x, from.y, 18], [x, y, 18], 14, 0.2, 6, 0.18, true, 16);
    this.arc([from.x, from.y, 14], [x, y, 16], 10, 0.15, 4, 0.13, false, 9);
    const len = Math.hypot(x - from.x, y - from.y);
    for (let i = 0; i < Math.round(8 + len * 4); i++) {
      const k = Math.random();
      const q = Math.random() * Math.PI * 2;
      this.spark(from.x + (x - from.x) * k, from.y + (y - from.y) * k, rnd(8, 26), Math.cos(q) * rnd(0.3, 1.2), Math.sin(q) * rnd(0.3, 1.2), rnd(-20, 50), rnd(0.15, 0.35), CRACKLE, 120, 2);
    }
    this.warpTo = { x, y, at: this.clock };
  }
  /** Where she came out of a warp this step (the burst that follows there is her thunderclap). */
  private warpTo: { x: number; y: number; at: number } | null = null;

  /** SHE COMES OUT OF A WARP: a thunderclap. A great flash, bolts striking out all round her to the floor, a ring of arcs, a fountain of sparks; the game holds an instant and the screen kicks hard. */
  private thunder(x: number, y: number, r: number): void {
    const fx = this.fx;
    fx.flashes.push({ x, y, z: 14, r: 1.25, t: 0, dur: 0.13, colors: [P.white, CRACKLE[1], CRACKLE[2], P.pu4] });
    const a0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < 8; i++) {
      const q = a0 + (i / 8) * Math.PI * 2 + rnd(-0.25, 0.25);
      const d = r * rnd(0.85, 1.35);
      this.later.push({ t: i * 0.012, fn: () => this.strike([x, y, 24], x + Math.cos(q) * d, y + Math.sin(q) * d, true) });
    }
    this.arcRing(x, y, r * 0.8, 9, 3);
    fx.rings.push({ x, y, r: r * 1.15, t: 0, dur: 0.3, colors: [CRACKLE[0], CRACKLE[1], CRACKLE[2]], fill: false, heavy: true, jag: true });
    for (let i = 0; i < 40; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(1, 4.5);
      this.spark(x, y, rnd(6, 20), Math.cos(q) * v, Math.sin(q) * v, rnd(40, 170), rnd(0.25, 0.55), SPARKS, 260, 2);
    }
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 110, t: 0, dur: 0.2 });
    fx.shake = Math.max(fx.shake, 3.4);
    fx.freeze = Math.max(fx.freeze, 0.05);
    this.novas.push({ x, y, r, at: this.clock });
  }

  /**
   * THE WAVE IS LET GO: a flash at the crystal and a ring before her, a fan of sparks, and bolts that
   * shoot out ahead of it and strike the floor; the screen kicks. (`x`, `y`: where the rules send it
   * from; `dx`, `dy`: the way it goes.)
   */
  cast(x: number, y: number, dx: number, dy: number, echo: boolean): void {
    if (!WILD.on) return;
    // (from where the crystal comes down, in front of her: the rules let it go a moment before the
    // picture has the staff there, so not from where the crystal was last seen)
    const from: [number, number, number] = [x + dx * 0.9, y + dy * 0.9, 9];
    const fx = this.fx;
    fx.flashes.push({ x: from[0], y: from[1], z: from[2], r: echo ? 0.45 : 0.8, t: 0, dur: 0.12, colors: [P.white, CRACKLE[1], CRACKLE[2], P.pu4] });
    fx.flashes.push({ x: x + dx, y: y + dy, z: 6, r: echo ? 0.35 : 0.62, t: 0, dur: 0.1, colors: [P.white, P.pu5, P.pu4] });
    fx.rings.push({ x: x + dx * 0.7, y: y + dy * 0.7, r: 1.1, t: 0, dur: 0.2, colors: [CRACKLE[1], CRACKLE[2], P.pu4], fill: false });
    const base = Math.atan2(dy, dx);
    for (let i = 0; i < (echo ? 12 : 30); i++) {
      const q = base + rnd(-1.1, 1.1);
      const v = rnd(3, 8);
      this.spark(from[0], from[1], from[2], Math.cos(q) * v, Math.sin(q) * v, rnd(-10, 90), rnd(0.2, 0.45), SPARKS, 200, 3);
    }
    const n = echo ? 2 : 4;
    for (let i = 0; i < n; i++) {
      const q = base + rnd(-0.85, 0.85);
      const d = rnd(1.4, 3);
      this.later.push({ t: i * 0.025, fn: () => this.strike(from, x + Math.cos(q) * d, y + Math.sin(q) * d, true) });
    }
    if (!echo) fx.shake = Math.max(fx.shake, 1.8);
    if (fx.glows.length < 40) fx.glows.push({ x: from[0], y: from[1], r: 100, t: 0, dur: 0.22 });
  }

  /**
   * STRIKE, BIG AND WILD, A SWORDSMAN'S (the owner: "I like the big crescent and the kick.  More
   * technique and follow through"; and "the crackling works for the mage, but not the warrior"). The
   * hero swings (fx.ts, the 'swing' event): a thick crescent of the friend's light where the blade
   * went, white at its leading edge and a little longer than the blade reaches; a second, slimmer
   * sweep of light a moment after it that runs on past it, as the blade follows through; white lines
   * of wind off its edge; dust kicked up and a ring at his feet; and the screen kicks. The second
   * swing of the combo, the swipe back (the rules' Hero.combo), sweeps the other way. Says whether it
   * drew the crescent (then the plain one is not drawn): it does for a swing whose words leave the
   * cut its plain shape.
   */
  swing(x: number, y: number, dx: number, dy: number, reach: number, plain: boolean, echo: boolean): boolean {
    if (!WILD.on) return false;
    const fx = this.fx;
    const a = Math.atan2(dy, dx);
    const r = reach * 1.15;
    const back = this.heroCombo === 1;
    const dir = back ? -1 : 1;
    const light: readonly string[] = [P.white, CRACKLE[1], CRACKLE[2], CRACKLE[3]];
    if (plain) {
      fx.slashes.push({ x, y, a, reach: r, t: 0, dur: 0.24, colors: light, heavy: true, rev: back, jag: false, faint: echo });
      // (the follow-through: on past where the blow fell, round to his other side)
      this.later.push({ t: 0.05, fn: () => fx.slashes.push({ x, y, a: a + 1.55 * dir, reach: r * 0.94, t: 0, dur: 0.2, colors: light, heavy: false, rev: back, jag: false, faint: true }) });
    }
    /** A point of the crescent, `u` from its start (0) to its end (1), and how high it is drawn. */
    const at = (u: number, rr = r): [number, number, number] => {
      const q = a + (-1.25 + 2.5 * u) * dir;
      return [x + Math.cos(q) * rr, y + Math.sin(q) * rr, 10];
    };
    // (white lines of wind off the blade's edge, along the way it went)
    for (let i = 0; i < (echo ? 4 : 12); i++) {
      const u = rnd(0.45, 1);
      const p = at(u, r * rnd(0.85, 1.05));
      const q = a + (-1.25 + 2.5 * u) * dir + (Math.PI / 2) * dir;
      const v = rnd(5, 9);
      this.spark(p[0], p[1], p[2] + rnd(-2, 3), Math.cos(q) * v, Math.sin(q) * v, 0, rnd(0.08, 0.14), [P.white, AIR[1]], 0, rnd(5, 9));
    }
    // (dust and grit kicked up where his feet bite the floor, and a ring of it)
    for (let i = 0; i < (echo ? 4 : 12); i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(0.6, 1.8);
      this.spark(x + Math.cos(q) * 0.3, y + Math.sin(q) * 0.3, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(20, 60), rnd(0.25, 0.55), [P.st6, P.st5, P.st4], 200);
    }
    fx.rings.push({ x, y, r: 0.9, t: 0, dur: 0.2, colors: [P.st6, P.st5, P.st4], fill: false });
    if (!echo) fx.shake = Math.max(fx.shake, 1.4);
    const mid = at(0.6);
    if (fx.glows.length < 40) fx.glows.push({ x: mid[0], y: mid[1], r: 60, t: 0, dur: 0.12 });
    this.swung = { x, y, reach: r, at: this.clock };
    return plain;
  }

  /**
   * The hero's shots, once a game step (fx.ts, follow): a WAVE IN FLIGHT throws sparks back off its
   * crest, arcs crawl along the crest and leap off it, and bolts fork ahead of it to the floor; an
   * ARROW is let go in a gust (loose, below) and flies trailing air, lines of wind peeling off its
   * point. `k`: how much of a step of sixty to the second this was, thinned when the air is full.
   * `arrowZ`: how high the hero's arrows fly, in pixels.
   */
  follow(shots: ReadonlyArray<{ x: number; y: number; vx: number; vy: number; hostile: boolean; look?: string; r?: number; age?: number; dist?: number }>, k: number, arrowZ = 10): void {
    this.waves = [];
    this.arrows = [];
    if (!WILD.on) return;
    const live = new Set<object>();
    for (const p of shots) {
      if (p.hostile || p.look !== 'arrow') continue;
      live.add(p);
      this.arrows.push({ x: p.x, y: p.y });
      const v = Math.hypot(p.vx, p.vy) || 1;
      const ux = p.vx / v;
      const uy = p.vy / v;
      if (!this.seen.has(p)) {
        this.seen.add(p);
        this.loose(p.x - ux * 0.2, p.y - uy * 0.2, ux, uy, arrowZ, p);
      }
      for (const q of this.tracers) {
        if (q.shot !== p) continue;
        q.hx = p.x;
        q.hy = p.y;
      }
      // (now and then a line of wind peels off its point)
      if (k > 0 && Math.random() < 0.5 * k) this.spark(p.x - ux * 0.1, p.y - uy * 0.1, arrowZ + rnd(-2, 2), -ux * rnd(1, 3) - uy * rnd(-0.8, 0.8), -uy * rnd(1, 3) + ux * rnd(-0.8, 0.8), 0, rnd(0.08, 0.14), [AIR[0], AIR[1]], 0, 4);
    }
    // (an arrow no longer in the air has struck, or flown its course: its streak draws in after it)
    for (const q of this.tracers) if (q.gone < 0 && !live.has(q.shot)) q.gone = 0;
    for (const p of shots) {
      if (p.hostile || p.look !== 'wave') continue;
      const r = (p.r ?? 1) * 1.1;
      this.waves.push({ x: p.x, y: p.y, r });
      if (k <= 0) continue;
      const v = Math.hypot(p.vx, p.vy) || 1;
      const fwx = p.vx / v;
      const fwy = p.vy / v;
      const born = Math.min(1, (p.age ?? 1) / 0.09);
      const fade = Math.max(0, Math.min(1, (p.dist ?? 9) / 1.8));
      const span = 1;
      const R = r / Math.sin(span);
      /** A point of its crest, `a` from its middle (radians), and how high the crest stands there. */
      const crest = (a: number): [number, number, number] => {
        const ca = Math.cos(a) * R - R;
        const sa = Math.sin(a) * R;
        const mid = 1 - Math.abs(a) / span;
        return [p.x + fwx * ca - fwy * sa, p.y + fwy * ca + fwx * sa, 3 + 9 * mid * born];
      };
      const roll = (q: number): boolean => Math.random() < q * k * fade;
      for (let i = 0; i < 3; i++) {
        if (!roll(1)) continue;
        const c = crest(rnd(-span, span));
        const back = rnd(0.5, 2.5);
        this.spark(c[0], c[1], c[2] + rnd(0, 3), -fwx * back + rnd(-0.6, 0.6), -fwy * back + rnd(-0.6, 0.6), rnd(30, 110), rnd(0.25, 0.5), SPARKS, 260);
      }
      if (roll(0.9)) {
        const a = rnd(-span, span);
        const b = Math.max(-span, Math.min(span, a + rnd(0.15, 0.45) * (Math.random() < 0.5 ? -1 : 1)));
        this.arc(crest(a), crest(b), 5, 0.05, 3.5, 0.06);
      }
      if (roll(0.4)) {
        const a = rnd(-span, span);
        const c = crest(a);
        this.arc(c, crest(a + rnd(-0.12, 0.12)).map((v, i) => (i === 2 ? c[2] + rnd(8, 18) : v)), 3, 0.03, 2, 0.06);
      }
      if (roll(0.22)) {
        const c = crest(rnd(-span * 0.6, span * 0.6));
        const ahead = rnd(0.5, 1.3);
        const side = rnd(-0.5, 0.5);
        this.strike(c, c[0] + fwx * ahead - fwy * side, c[1] + fwy * ahead + fwx * side, false);
      }
    }
  }

  /**
   * AN ARROW IS LET GO, AN ARCHER'S WAY, IN WIND (the owner: "This just looks like he's firing a
   * lightning arrow"; and "Can we make the blue effects just like wind instead of energy?"): a puff
   * of white at the bow, two rings of air thrown off across the arrow's way, lines of wind ahead of
   * it, a puff of dust at his feet, and the screen kicks; and the arrow's trail of air begins.
   */
  private loose(x: number, y: number, ux: number, uy: number, z: number, shot: object): void {
    const fx = this.fx;
    fx.flashes.push({ x, y, z, r: 0.3, t: 0, dur: 0.07, colors: [P.white, AIR[1], AIR[2]] });
    this.rings.push({ x: x + ux * 0.2, y: y + uy * 0.2, z, ux, uy, t: 0, dur: 0.22 });
    this.rings.push({ x: x + ux * 0.65, y: y + uy * 0.65, z, ux, uy, t: -0.04, dur: 0.24 });
    for (let i = 0; i < 6; i++) {
      const q = Math.atan2(uy, ux) + rnd(-0.25, 0.25);
      const v = rnd(7, 11);
      this.spark(x + rnd(-0.1, 0.1), y + rnd(-0.1, 0.1), z + rnd(-3, 3), Math.cos(q) * v, Math.sin(q) * v, 0, rnd(0.06, 0.12), [AIR[0], AIR[1]], 0, rnd(6, 10));
    }
    for (let i = 0; i < 6; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(0.4, 1.2);
      this.spark(x - ux * 0.6 + Math.cos(q) * 0.2, y - uy * 0.6 + Math.sin(q) * 0.2, 1, Math.cos(q) * v, Math.sin(q) * v, rnd(10, 40), rnd(0.25, 0.5), [P.st6, P.st5], 160);
    }
    this.tracers.push({ shot, x0: x, y0: y, ux, uy, z, hx: x, hy: y, gone: -1, spin: Math.random() * 6 });
    fx.shake = Math.max(fx.shake, 1.2);
  }

  /**
   * Something was hit at (x, y). If one of the hero's waves is there, it crackles over what it hit;
   * if the hero swung a moment ago and it is in reach, the blow lands hard (blowHit); if one of the
   * hero's arrows is there, it punches into it (arrowHit). Either way what flies off is what the
   * struck is made of (debris). Says whether any did.
   */
  hit(x: number, y: number): boolean {
    if (!WILD.on) return false;
    if (this.waves.some((w) => Math.hypot(w.x - x, w.y - y) <= w.r * 1.3 + 0.8)) return this.waveHit(x, y);
    const sw = this.swung;
    if (sw && this.clock - sw.at < 0.25 && Math.hypot(sw.x - x, sw.y - y) <= sw.reach + 0.9) return this.blowHit(x, y, Math.atan2(y - sw.y, x - sw.x));
    if (this.arrows.some((a) => Math.hypot(a.x - x, a.y - y) <= 1.1)) return this.arrowHit(x, y);
    // (the rest of the skills: a leap's landing and a whirlwind's turn strike hard; the mage's bursts crackle over what they catch; a trap's whirlwind buffets)
    const sl = this.slams.find((s) => Math.hypot(s.x - x, s.y - y) <= s.r);
    if (sl) return this.slamHit(x, y, Math.atan2(y - sl.y, x - sl.x), sl.force);
    if (this.novas.some((s) => Math.hypot(s.x - x, s.y - y) <= s.r + 0.6)) return this.waveHit(x, y);
    const gu = this.gusts.find((s) => Math.hypot(s.x - x, s.y - y) <= s.r);
    if (gu) return this.gustHit(x, y, Math.atan2(y - gu.y, x - gu.x));
    return false;
  }

  /** A heavy blow of the blade lands (a leap's landing, a whirlwind's turn): a white burst and a cut across the struck, what it is made of flung away from the blow, and a kick. */
  private slamHit(x: number, y: number, a: number, force: number): boolean {
    const fx = this.fx;
    fx.flashes.push({ x, y, z: 14, r: 0.45 + 0.15 * force, t: 0, dur: 0.1, colors: [P.white, AIR[1], AIR[2], AIR[3]] });
    fx.slashes.push({ x, y, a: a + Math.PI * 0.5, reach: 0.4, t: 0, dur: 0.11, colors: [P.white, AIR[1], AIR[2]], heavy: true, jag: false, faint: false });
    this.debris(x, y, a, force);
    fx.shake = Math.max(fx.shake, 1.2 + force);
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 40, t: 0, dur: 0.1 });
    return true;
  }

  /** A trap's whirlwind catches something: a white puff and a hoop of wind round it, and lines of wind tearing past it. */
  private gustHit(x: number, y: number, a: number): boolean {
    const fx = this.fx;
    fx.flashes.push({ x, y, z: 12, r: 0.38, t: 0, dur: 0.08, colors: [P.white, AIR[1], AIR[2]] });
    fx.rings.push({ x, y, r: 0.5, t: 0, dur: 0.16, colors: [AIR[0], AIR[1], AIR[2]], fill: false, swirl: true });
    for (let i = 0; i < 8; i++) {
      const q = a + rnd(-0.5, 0.5);
      const v = rnd(5, 9);
      this.spark(x, y, rnd(6, 20), Math.cos(q) * v, Math.sin(q) * v, rnd(-10, 40), rnd(0.08, 0.14), [AIR[0], AIR[1]], 0, rnd(5, 9));
    }
    return true;
  }

  /** A blow of Strike lands: a white cut across what it struck, a white burst and ring, what it is made of flung on the way the blade went (bone, sparks off armour, blood, dust), the game holding still an instant, and the screen kicking. */
  private blowHit(x: number, y: number, a: number): boolean {
    const fx = this.fx;
    // (the cut and the burst are white, not the blade's blue: what flies off a hit is the struck's, the owner said)
    fx.flashes.push({ x, y, z: 14, r: 0.6, t: 0, dur: 0.11, colors: [P.white, AIR[1], AIR[2], AIR[3]] });
    fx.slashes.push({ x, y, a: a + Math.PI * 0.5, reach: 0.42, t: 0, dur: 0.12, colors: [P.white, AIR[1], AIR[2]], heavy: true, jag: false, faint: false });
    fx.rings.push({ x, y, r: 0.7, t: 0, dur: 0.14, colors: [P.white, AIR[1], AIR[2]], fill: false });
    this.debris(x, y, a, 1.4);
    fx.shake = Math.max(fx.shake, 2.2);
    fx.freeze = Math.max(fx.freeze, 0.045);
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 50, t: 0, dur: 0.12 });
    return true;
  }

  /** An arrow strikes: a white burst, a ring of air, what it is made of flung out (bone, sparks off armour, blood, dust), wind punched on out the far side the way it was going, the game holding still an instant, and the screen kicking. */
  private arrowHit(x: number, y: number): boolean {
    const fx = this.fx;
    // (which way it was going: the trail of the arrow that is nearest)
    let ux = 1;
    let uy = 0;
    let near = Infinity;
    for (const q of this.tracers) {
      const d = Math.hypot(q.hx - x, q.hy - y);
      if (d < near) {
        near = d;
        ux = q.ux;
        uy = q.uy;
      }
    }
    fx.flashes.push({ x, y, z: 12, r: 0.42, t: 0, dur: 0.08, colors: [P.white, AIR[1], AIR[2]] });
    fx.rings.push({ x, y, r: 0.55, t: 0, dur: 0.16, colors: [AIR[0], AIR[1], AIR[2]], fill: false });
    this.debris(x, y, Math.atan2(uy, ux), 0.9);
    // (punched on through: lines of wind out of the far side of it)
    for (let i = 0; i < 8; i++) {
      const q = Math.atan2(uy, ux) + rnd(-0.35, 0.35);
      const v = rnd(5, 9);
      this.spark(x + ux * 0.2, y + uy * 0.2, rnd(8, 16), Math.cos(q) * v, Math.sin(q) * v, 0, rnd(0.08, 0.15), [AIR[0], AIR[1]], 0, rnd(5, 9));
    }
    fx.shake = Math.max(fx.shake, 1.5);
    fx.freeze = Math.max(fx.freeze, 0.03);
    return true;
  }

  /** The Wave crackles over what it hit. */
  private waveHit(x: number, y: number): boolean {
    const fx = this.fx;
    fx.flashes.push({ x, y, z: 12, r: 0.5, t: 0, dur: 0.1, colors: [P.white, CRACKLE[1], CRACKLE[2], P.pu4] });
    const crawl = (n: number): void => {
      for (let i = 0; i < n; i++) this.arc([x + rnd(-0.22, 0.22), y + rnd(-0.22, 0.22), rnd(3, 26)], [x + rnd(-0.22, 0.22), y + rnd(-0.22, 0.22), rnd(3, 26)], 4, 0.05, 2.5, 0.07);
    };
    crawl(4);
    this.later.push({ t: 0.05, fn: () => crawl(3) });
    this.later.push({ t: 0.11, fn: () => crawl(2) });
    for (let i = 0; i < 10; i++) {
      const q = Math.random() * Math.PI * 2;
      const v = rnd(1.5, 3.5);
      this.spark(x, y, rnd(8, 20), Math.cos(q) * v, Math.sin(q) * v, rnd(40, 120), rnd(0.2, 0.42), SPARKS, 220);
    }
    const q = Math.random() * Math.PI * 2;
    this.strike([x, y, 14], x + Math.cos(q) * 0.6, y + Math.sin(q) * 0.6, false);
    if (fx.glows.length < 40) fx.glows.push({ x, y, r: 44, t: 0, dur: 0.12 });
    return true;
  }

  /**
   * After the darkness: the trail of air each arrow leaves, a straight line from where it was let go
   * to its point, pale and seen through and thinning away behind, with air spinning round its last
   * stretch (the arrow spins), drawing in after it once it has struck; the hoops of air thrown off at
   * the loose; and the mage's arcs, white at the heart while fresh, cooling to the crystal's cyan,
   * with a glow either side.
   */
  draw(g: CanvasRenderingContext2D, c: Cam): void {
    for (const q of this.tracers) {
      const flown = Math.hypot(q.hx - q.x0, q.hy - q.y0);
      const long = Math.min(flown, 2.6) * (q.gone < 0 ? 1 : Math.max(0, 1 - q.gone / 0.2));
      if (long < 0.05) continue;
      const hx = sx(c, q.hx, q.hy);
      const hy = sy(c, q.hx, q.hy) - q.z;
      const tx = sx(c, q.hx - q.ux * long, q.hy - q.uy * long);
      const ty = sy(c, q.hx - q.ux * long, q.hy - q.uy * long) - q.z;
      const at = (k: number): [number, number] => [tx + (hx - tx) * k, ty + (hy - ty) * k];
      // (A TRAIL OF AIR, pale and seen through, thinning away behind it)
      const [ax, ay] = at(0.4);
      const [bx, by] = at(0.75);
      g.globalAlpha = 0.25;
      line(g, tx, ty, ax, ay, AIR[2]);
      g.globalAlpha = 0.45;
      line(g, ax, ay, bx, by, AIR[1]);
      g.globalAlpha = 0.7;
      line(g, bx, by, hx, hy, AIR[0]);
      if (q.gone < 0) {
        // (the air spinning round its last stretch)
        const len = Math.hypot(hx - tx, hy - ty) || 1;
        const ox = -(hy - ty) / len;
        const oy = (hx - tx) / len;
        g.fillStyle = AIR[0];
        for (let i = 1; i <= 12; i++) {
          const k = 1 - i * 0.055;
          if (k < 0.2) break;
          const [px, py] = at(k);
          const w = Math.sin(q.spin - i * 0.9);
          const h = Math.cos(q.spin - i * 0.9);
          if (h < -0.3) continue;
          g.globalAlpha = 0.65 * k;
          g.fillRect(Math.round(px + ox * w * 2.5), Math.round(py + oy * w * 2.5 - h), 1, 1);
        }
      }
      g.globalAlpha = 1;
    }
    for (const r of this.rings) {
      if (r.t < 0) continue;
      const k = r.t / r.dur;
      const cx = sx(c, r.x, r.y);
      const cy = sy(c, r.x, r.y) - r.z;
      // (a hoop of air seen a little from the side: thin along the way the arrow goes, wide across it)
      const fx0 = (r.ux - r.uy) * 16;
      const fy0 = (r.ux + r.uy) * 8;
      const fl = Math.hypot(fx0, fy0) || 1;
      const ax = fx0 / fl;
      const ay = fy0 / fl;
      const big = 2 + 9 * k;
      g.fillStyle = k < 0.4 ? AIR[0] : AIR[1];
      g.globalAlpha = 0.8 * (1 - k);
      for (let i = 0; i < 18; i++) {
        const t = (i / 18) * Math.PI * 2;
        const along = Math.cos(t) * big * 0.3;
        const across = Math.sin(t) * big;
        g.fillRect(Math.round(cx + ax * along - ay * across), Math.round(cy + ay * along + ax * across), 1, 1);
      }
      g.globalAlpha = 1;
    }
    // RINGS OF WIND going round a place (a volley's patch; round the warrior in his whirlwind), and
    // the ring of the blade's light round him: three sweeps each, thin and faint at their tails and
    // brightest at their heads, going round
    for (const v of this.vortices) {
      const cx = sx(c, v.x, v.y);
      const cy = sy(c, v.x, v.y) - v.z;
      const rx = v.r * 22.6;
      const ry = v.r * 11.3;
      const sweeps = v.blade ? 2 : 3;
      const span = v.blade ? 2.1 : 1.3;
      for (let s = 0; s < sweeps; s++) {
        const head = v.spin + (s / sweeps) * Math.PI * 2;
        const n = Math.max(10, Math.round(span * v.r * 16));
        for (let i = 0; i <= n; i++) {
          const u = i / n;
          const a = head - span * (1 - u);
          const px = Math.round(cx + Math.cos(a) * rx);
          const py = Math.round(cy + Math.sin(a) * ry);
          if (v.blade) {
            g.globalAlpha = v.k * (0.25 + 0.75 * u);
            g.fillStyle = u > 0.86 ? P.white : u > 0.5 ? BLADE[1] : BLADE[2];
            g.fillRect(px, py, 2, u > 0.6 ? 2 : 1);
            // (thick at its head, as the Strike's crescent is)
            if (u > 0.7) g.fillRect(px, py - 2, 2, 1);
          } else {
            if (i % 2 === 1 && u < 0.6) continue;
            g.globalAlpha = v.k * (0.15 + 0.6 * u);
            g.fillStyle = u > 0.8 ? AIR[0] : u > 0.4 ? AIR[1] : AIR[2];
            g.fillRect(px, py, 1, 1);
          }
        }
      }
      g.globalAlpha = 1;
    }
    // A TRAP'S WHIRLWIND: a funnel of air turning, narrow at the floor and wide at its top, rising as it tears up and thinning away
    for (const w of this.twisters) {
      const k = w.t / w.dur;
      const cx = sx(c, w.x, w.y);
      const cy = sy(c, w.x, w.y);
      const grow = Math.min(1, w.t / 0.12);
      const layers = 9;
      for (let j = 0; j < layers; j++) {
        const f = j / (layers - 1);
        const z = f * 44 * grow;
        const rr = w.r * (0.25 + 0.9 * f) * (0.7 + 0.3 * grow);
        const n = 10 + Math.round(rr * 12);
        for (let i = 0; i < n; i++) {
          const a = w.spin * (1.2 - f * 0.5) + (i / n) * Math.PI * 2 + j * 0.7;
          const front = Math.sin(a) > -0.2;
          if (!front && i % 2 === 0) continue;
          g.globalAlpha = (1 - k) * (front ? 0.75 : 0.3) * (0.5 + 0.5 * (1 - f));
          g.fillStyle = f < 0.3 ? AIR[0] : f < 0.65 ? AIR[1] : AIR[2];
          g.fillRect(Math.round(cx + Math.cos(a) * rr * 22.6), Math.round(cy - z + Math.sin(a) * rr * 11.3), front ? 2 : 1, 1);
        }
      }
      g.globalAlpha = 1;
    }
    // HOOPS OF AIR lying round a rising column of wind (a volley loosed)
    for (const o of this.hoops) {
      if (o.t < 0) continue;
      const k = o.t / o.dur;
      const cx = sx(c, o.x, o.y);
      const cy = sy(c, o.x, o.y) - o.z;
      const rr = o.r * (1 + 0.9 * k);
      g.globalAlpha = 0.85 * (1 - k);
      g.fillStyle = k < 0.4 ? AIR[0] : AIR[1];
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2;
        g.fillRect(Math.round(cx + Math.cos(a) * rr * 22.6), Math.round(cy + Math.sin(a) * rr * 11.3), 1, 1);
      }
      g.globalAlpha = 1;
    }
    for (const a of this.arcs) {
      const k = a.t / a.dur;
      const core = k < 0.4 ? CRACKLE[0] : k < 0.75 ? CRACKLE[1] : CRACKLE[2];
      for (let i = 0; i + 5 < a.pts.length; i += 3) {
        const x0 = sx(c, a.pts[i], a.pts[i + 1]);
        const y0 = sy(c, a.pts[i], a.pts[i + 1]) - a.pts[i + 2];
        const x1 = sx(c, a.pts[i + 3], a.pts[i + 4]);
        const y1 = sy(c, a.pts[i + 3], a.pts[i + 4]) - a.pts[i + 5];
        // (across the way it runs: what is beside it)
        const flat = Math.abs(x1 - x0) > Math.abs(y1 - y0);
        const ox = flat ? 0 : 1;
        const oy = flat ? 1 : 0;
        if (k < 0.55) {
          // (the glow either side; a bolt's is wider)
          line(g, x0 - ox, y0 - oy, x1 - ox, y1 - oy, a.bolt ? CRACKLE[2] : CRACKLE[3]);
          line(g, x0 + ox * (a.bolt ? 2 : 1), y0 + oy * (a.bolt ? 2 : 1), x1 + ox * (a.bolt ? 2 : 1), y1 + oy * (a.bolt ? 2 : 1), CRACKLE[2]);
        }
        line(g, x0, y0, x1, y1, core);
        // (a fresh bolt is two pixels thick at its heart)
        if (a.bolt && k < 0.4) line(g, x0 + ox, y0 + oy, x1 + ox, y1 + oy, CRACKLE[0]);
      }
    }
  }
}

/**
 * AN ARROW IN FLIGHT, BIG AND WILD (render.ts draws it before the arrow itself while WILD is on): a
 * glint at its point and the last of its streak hot white behind it (the rest of the streak, and its
 * spin, are Wild's, drawn over the darkness). (`sx`, `sy`: where its point is on the screen; `ux`,
 * `uy`: the way it flies there, one pixel long.)
 */
export function drawWildArrow(g: CanvasRenderingContext2D, sx: number, sy: number, ux: number, uy: number): void {
  line(g, sx - ux * 6, sy - uy * 6, sx, sy, CRACKLE[0]);
  g.fillStyle = CRACKLE[0];
  g.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
}

/**
 * A WAVE IN FLIGHT, BIG AND WILD (render.ts draws it in place of the plain one while WILD is on): a
 * crest of force as tall again as the plain one, stood on a wall of its own light that reaches down
 * to the floor; its white edge boils, a pixel or two up and down from moment to moment, under a
 * flickering line of the crystal's cyan; behind it the body of the wave streams back along the
 * floor as before, brighter; and it is a tenth wider than what it strikes. The arcs, sparks and
 * bolts are the effects' (Wild).
 * `tones`: its colours, darkest first (the violet of her magic, or what its words make of it).
 */
export function drawWildWave(g: CanvasRenderingContext2D, c: Cam, p: { x: number; y: number; vx: number; vy: number; r: number; age: number; dist: number }, tones: readonly string[], t: number, jx: number, jy: number): void {
  const v = Math.hypot(p.vx, p.vy) || 1;
  const fwx = p.vx / v;
  const fwy = p.vy / v;
  const span = 1;
  const r = p.r * 1.1;
  const R = r / Math.sin(span);
  const born = Math.min(1, p.age / 0.09);
  const fade = Math.max(0, Math.min(1, p.dist / 1.8));
  const layers = 10;
  const run = Math.floor(t * 24);
  for (let j = layers + 2; j >= 0; j--) {
    const ripple = j > layers;
    const back = ripple ? layers + (j - layers) * 4 : j;
    const rj = R - back * 0.08;
    const sj = span * Math.max(0.2, 1 - back * (ripple ? 0.04 : 0.07)) * (0.45 + 0.55 * born);
    const steps = Math.max(8, Math.ceil(sj * rj * 2 * 22));
    for (let k = 0; k <= steps; k++) {
      if (back >= 3 && (k + run * (j % 2 === 0 ? 1 : -1) + j * 3) % (ripple ? 3 : 5) === 0) continue;
      const a = -sj + (2 * sj * k) / steps;
      const ca = Math.cos(a) * rj - R;
      const sa = Math.sin(a) * rj;
      const qx = p.x + fwx * ca - fwy * sa;
      const qy = p.y + fwy * ca + fwx * sa;
      const mid = 1 - Math.abs(a) / sj;
      const px = Math.round(sx(c, qx, qy)) + jx;
      const py = Math.round(sy(c, qx, qy)) + jy;
      if (back === 0) {
        // THE CREST: stood up on a wall of its own light, its white edge boiling
        const up = 3 + Math.round(9 * mid * born) + (Math.random() < 0.35 ? 1 : 0) + (mid > 0.4 && Math.random() < 0.18 ? 2 : 0);
        g.globalAlpha = fade * 0.55;
        for (let h = 0; h < up; h++) {
          g.fillStyle = h < up * 0.35 ? tones[0] : h < up * 0.7 ? tones[1] : tones[2];
          g.fillRect(px, py - h, 2, 1);
        }
        g.globalAlpha = fade;
        g.fillStyle = tones[3];
        g.fillRect(px, py - up, 2, 2 + Math.round(mid));
        g.fillStyle = Math.random() < 0.5 ? CRACKLE[1] : CRACKLE[0];
        g.fillRect(px, py - up - 1, 2, 1);
        continue;
      }
      g.fillStyle = ripple ? tones[1] : back <= 2 ? tones[2] : back <= 5 ? tones[1] : tones[0];
      g.globalAlpha = ripple ? 0.32 * fade * born : fade * (back < 3 ? 1 : back < 6 ? 0.85 : 0.55);
      const up = back === 1 ? 2 + Math.round(5 * mid * born) : back === 2 ? 1 + Math.round(2 * mid * born) : back === 3 ? 1 : 0;
      g.fillRect(px, py - up, 2, back <= 2 ? 2 : 1);
    }
  }
  g.globalAlpha = 1;
}
