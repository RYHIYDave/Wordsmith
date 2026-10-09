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
// on a friend is cyan); the wave keeps the violet of her magic. Nothing here changes the game.

import { WILD } from '../art/moves3';
import { P } from '../art/palette';
import type { Cam, Fx } from './fx';

/** Her power's own colours, brightest first: white at its heart, the crystal's cyan, and its deep edge. */
export const CRACKLE: readonly string[] = ['#ffffff', '#b8fff8', '#22d0e0', '#0c6a80'];
/** ... and with the violet of her magic, for what the wave throws off. */
const SPARKS: readonly string[] = ['#ffffff', '#b8fff8', '#22d0e0', P.pu5, P.pu4];

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

  constructor(private fx: Fx) {}

  clear(): void {
    this.arcs = [];
    this.held = null;
    this.waves = [];
    this.later = [];
  }

  /** The renderer, each frame the hero is drawn: where the power they hold burns (a place in the world and its height), how hot, and the way they face. */
  charge(x: number, y: number, z: number, heat: number, fx: number, fy: number): void {
    this.held = { x, y, z, heat, fx, fy, age: 0 };
  }

  private spark(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, colors: readonly string[], grav = 180, streak = 0): void {
    if (this.fx.particles.length >= 880) return;
    const p = { x, y, z, vx, vy, vz, life, color: pick(colors), size: Math.random() < 0.22 ? 2 : 1, grav, ...(streak > 0 ? { streak } : {}) };
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
    this.owed.arcs += dt * (1.5 + 44 * s);
    this.owed.sparks += dt * (2 + 60 * s);
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
   * The hero's shots, once a game step (fx.ts, follow): a WAVE IN FLIGHT throws sparks back off its
   * crest, arcs crawl along the crest and leap off it, and bolts fork ahead of it to the floor.
   * `k`: how much of a step of sixty to the second this was, thinned when the air is full.
   */
  follow(shots: ReadonlyArray<{ x: number; y: number; vx: number; vy: number; hostile: boolean; look?: string; r?: number; age?: number; dist?: number }>, k: number): void {
    this.waves = [];
    if (!WILD.on) return;
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

  /** Something was hit at (x, y): if one of the hero's waves is there, it crackles over what it hit. Says whether it did. */
  hit(x: number, y: number): boolean {
    if (!WILD.on || !this.waves.some((w) => Math.hypot(w.x - x, w.y - y) <= w.r * 1.3 + 0.8)) return false;
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

  /** The arcs, after the darkness (they are light): white at the heart while fresh, cooling to the crystal's cyan, with a glow either side. */
  draw(g: CanvasRenderingContext2D, c: Cam): void {
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
