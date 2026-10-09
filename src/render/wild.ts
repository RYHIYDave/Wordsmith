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
  }

  /** The frame loop, each step: the monsters, and which swing of Strike the hero is in. */
  see(monsters: ReadonlyArray<{ x: number; y: number; kind: MonsterKind; champion: boolean; dead?: boolean }>, combo: number): void {
    this.heroCombo = combo;
    if (!WILD.on) return;
    this.mobs = [];
    for (const m of monsters) if (!m.dead) this.mobs.push({ x: m.x, y: m.y, figure: figureOf(m) });
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
    return false;
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
