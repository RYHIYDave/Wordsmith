// THE WARLOCK'S HELLFIRE IN FLIGHT AND BURNING (the art chat, 25 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His design of his tap, 25 Oct (Pacific): “Hellfire bolt (Recommended)”, and “I was thinking tap does a single target shot
// that hits an enemy and does a relatively strong DOT.” His art rulebook: Animations 1, as big and wild as it can be; 3,
// each hero wild his own way (his is cyan hellfire, real fire, not the mage's crackle); 4, nothing covers a hero but for a
// blink; 8, effects are pixel art too, crisp, none of it a pixel alone; and what glows on a friend is cyan (Colour), the
// hero's fire burning on an enemy as much as in his hand.
//
// THE BOLT: a ball of his hellfire hurled from the demon's claws, white-hot at its nose, its flames streaming back behind it
// (his fire's own shape, dev/sculpt_warlock.ts fireAt, laid on its side: its rounded foot is the bolt's nose). It leaves in a
// burst of flame off the claws, flies straight and fast, and bursts on the one it hits; and that one BURNS: tongues of his
// fire licking up off it, flaring as each tick of the burn bites.
//
// Drawn as light over the scene (the game would draw them over the figures): a scene with the warlock's own canvas on it,
// and room for the enemy ahead of him.

import { UNITS_PER_TILE } from '../art/moves3';
import { project, solve } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { HELL, fireAt, fireFoot, fireSeat, noise2 } from './sculpt_warlock';
import { FR, WARLOCK_B, warlockPose } from './warlock_moves';
import type { WarlockMove } from './warlock_moves';

/** The scene: the warlock's canvas at its left (`x`, `y` its top left), room ahead of him for the one he hits, whichever way he faces. */
export const BOLT_SCENE = { w: 300, h: 300, ax: CANVAS3.ax, ay: CANVAS3.ay + 60, x: 0, y: 60 };
/** How far ahead of him the one he hits stands, in his lengths (three tiles), and how high on it the bolt strikes. */
export const BOLT_RANGE = 3 * UNITS_PER_TILE;
export const AIM_UP = 30;
/** How long the bolt takes to get there, seconds. */
export const BOLT_FLIGHT = 8 * FR;
/** How long its burst lasts where it hits; how often the burn bites. */
export const BURST_LIFE = 0.3;
export const TICK = 0.5;

/** Where a point of his (his own space, turned `turn` on the spot) is in the scene. */
function onScene(p: V3, view: GameView, turn: number): [number, number] {
  const a = (turn * Math.PI) / 180;
  const q: V3 = [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  // (from behind as he is painted: as the camera truly sees him, dev/sculpt_warlock.ts)
  const s = project(q, view === 'back' ? 'rear' : view);
  return [BOLT_SCENE.ax + s[0], BOLT_SCENE.ay + s[1]];
}
/** Where the one he hits stands in the scene (the floor under it). */
export function targetFoot(view: GameView, turn = 0): [number, number] {
  return onScene([BOLT_RANGE, 0, 0], view, turn);
}

const hash = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Pixels of light gathered before they are laid on: the hottest wins at each; none is left alone. */
class Light {
  private px = new Map<number, number>();
  put(x: number, y: number, k: number): void {
    const q = (Math.round(y) + 1024) * 4096 + (Math.round(x) + 1024);
    if ((this.px.get(q) ?? -1) < k) this.px.set(q, k);
  }
  lay(on: Px): void {
    const has = (x: number, y: number): boolean => this.px.has((y + 1024) * 4096 + (x + 1024));
    for (const [q, k] of this.px) {
      const x = (q % 4096) - 1024;
      const y = Math.floor(q / 4096) - 1024;
      if (!has(x - 1, y) && !has(x + 1, y) && !has(x, y - 1) && !has(x, y + 1)) continue;
      // (kept two pixels in from the scene's edge: never cut off by it)
      if (x < 2 || y < 2 || x > on.w - 3 || y > on.h - 3) continue;
      on.set(x, y, HELL[k]);
    }
  }
}

/** A fire of `size` at (`cx`, `cy`), its heart there, leaning `lean`, at moment `t`. */
function fire(l: Light, cx: number, cy: number, size: number, t: number, lean = 0): void {
  const H = Math.round(size * 3.3);
  const reach = Math.ceil(size * 1.5 * 1.6 + Math.abs(lean) * H * 1.3);
  for (let yy = -Math.round(H * 1.25); yy <= Math.ceil(fireFoot(size)); yy++) {
    for (let x = -reach; x <= reach; x++) {
      const k = fireAt(x, yy, size, t, lean);
      if (k >= 0) l.put(cx + x, cy + yy, k);
    }
  }
}

/** THE BOLT, its nose at (`cx`, `cy`), flying the way (`wx`, `wy`) (a unit, on the picture): his fire laid on its side, streaming back. */
function bolt(l: Light, cx: number, cy: number, wx: number, wy: number, size: number, t: number, from: [number, number]): void {
  // (a pixel of the picture, as the fire sees it: `across` it, and `yy` up it, which is back along the way it flies; its
  // tail drawn out half as long again by its speed)
  const H = Math.round(size * 3.3);
  const R = Math.ceil(H * 1.25 * 2.0 + 4);
  const heart = fireFoot(size) * 0.9;
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      // (none of it behind the claws it left: it never streams back over him, Animations 4)
      if ((cx + dx - from[0]) * wx + (cy + dy - from[1]) * wy < 1) continue;
      const back = -(dx * wx + dy * wy) - heart;
      const across = dx * -wy + dy * wx;
      const k = fireAt(Math.round(across), Math.round(-back / 2.0), size, t * 1.6);
      if (k >= 0) l.put(cx + dx, cy + dy, k);
    }
  }
}

/** A ring of flame flecks bursting out from (`cx`, `cy`), `r` across, fading as `u` goes 0 to 1 (two pixels each, none alone). */
function burst(l: Light, cx: number, cy: number, r: number, u: number, seed: number): void {
  const n = Math.max(10, Math.round(r * 2.2));
  for (let i = 0; i < n; i++) {
    if (hash(seed * 31 + i) < u * 0.9) continue;
    const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.4;
    const rr = r * (0.75 + 0.35 * hash(seed * 7 + i));
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr * 0.7;
    const k = u < 0.3 ? 3 : u < 0.6 ? 2 : 1;
    l.put(x, y, k);
    l.put(x + 1, y, k);
    // (a tongue licking out after each fleck)
    l.put(x - Math.cos(a) * 1.5, y - Math.sin(a), Math.max(0, k - 1));
    l.put(x - Math.cos(a) * 1.5 + 1, y - Math.sin(a), Math.max(0, k - 1));
  }
}

/** The burn on the one burning: how many tongues of fire on it at once, how long each lives (seconds), how big each swells. */
export const BURN = { tongues: 11, life: 0.7, size: 3.0 };
/** How big the one he hits is on the picture (a man of the game: the cultist's own picture), pixels across and high. */
export const TARGET_BOX = { w: 36, h: 62 };

/**
 * A FIGURE BURNING IN HIS HELLFIRE, its floor point at (`gx`, `gy`), `w` across and `h` high: tongues of his fire licking up
 * off it all over, each its own: born low on it, swelling, licking up and tearing free and burning out as the next is born
 * under it, the figure seen between them. `heat` 0 none to 1 burning, more as a bite of the burn flares it.
 */
function burn(l: Light, gx: number, gy: number, w: number, h: number, t: number, heat: number): void {
  if (heat <= 0) return;
  for (let i = 0; i < BURN.tongues; i++) {
    // (where on it this one burns: spread over it, more on its upper half, as fire climbs)
    const up = 0.12 + 0.78 * Math.pow(hash(i * 5 + 2), 0.8);
    const fy = -h * up;
    // (narrower as it climbs: a figure is narrower at its head than its hem)
    const fx = (hash(i * 5 + 1) - 0.5) * w * 0.8 * (1 - 0.55 * up);
    const life = BURN.life * (0.8 + 0.4 * hash(i * 5 + 3));
    const ph = ((t / life + hash(i * 5 + 4)) % 1 + 1) % 1;
    // (it swells, then licks up off its place and burns out as it rises)
    const size = BURN.size * heat * (0.7 + 0.5 * hash(i * 5)) * Math.sin(Math.PI * Math.min(1, ph * 1.15));
    if (size < 0.9) continue;
    const rise = Math.max(0, ph - 0.45) * 14;
    const H = Math.round(size * 3.3);
    const reach = Math.ceil(size * 1.5 * 1.6);
    for (let yy = -Math.round(H * 1.25); yy <= 1; yy++) {
      for (let x = -reach; x <= reach; x++) {
        const k = fireAt(x, yy, size, t + i * 0.7, 0);
        if (k < 0) continue;
        // (its foot in the figure, not a line across it: the lowest of it ragged, as the fire's own noise has it)
        if (yy > -2 && noise2(x * 0.8 + i * 3.1, t * 11 + i) < 0.5) continue;
        l.put(gx + fx + x, gy + fy - rise + yy, k);
      }
    }
  }
}

/** Where the demon's claws hold the fire at a moment of a move, as small as it is when it leaves them (as his own fire is seated: dev/sculpt_warlock.ts fireSeat). */
function claws(m: WarlockMove, t: number): V3 {
  return fireSeat(solve(WARLOCK_B, warlockPose(m.motion, t)), 1.0);
}

/**
 * THE BOLT'S LIGHT AT A MOMENT of the move that throws it (`m`, its blow the moment it leaves the claws): the burst off the
 * claws as it goes, the bolt in flight, its burst where it hits, and the burn on the one it hit, every bite of it. On a
 * scene of its own, clear but for them (BOLT_SCENE). Empty before it is thrown.
 */
export function boltLight(m: WarlockMove, t: number, view: GameView, turn = 0): Px {
  const out = new Px(BOLT_SCENE.w, BOLT_SCENE.h);
  const l = new Light();
  const go = (m.blows ?? [])[0]?.at ?? 0;
  if (t < go) return out;
  const from = claws(m, go);
  const to: V3 = [BOLT_RANGE, 0, AIM_UP];
  const [fx, fy] = onScene(from, view, turn);
  const [tx, ty] = onScene(to, view, turn);
  const since = t - go;
  // (the burst off the claws as it leaves)
  if (since < 0.2) {
    burst(l, fx, fy, 5 + since * 70, since / 0.2, 3);
    if (since < 0.07) fire(l, fx, fy, 4.6 - since * 30, t);
  }
  // (the bolt, flying)
  if (since <= BOLT_FLIGHT) {
    const u = since / BOLT_FLIGHT;
    const len = Math.hypot(tx - fx, ty - fy) || 1;
    bolt(l, fx + (tx - fx) * u, fy + (ty - fy) * u, (tx - fx) / len, (ty - fy) / len, 5.0, t, [fx, fy]);
  } else {
    const hit = since - BOLT_FLIGHT;
    // (its burst where it hits)
    if (hit < BURST_LIFE) {
      burst(l, tx, ty, 6 + hit * 50, hit / BURST_LIFE, 11);
      if (hit < 0.12) fire(l, tx, ty + 4, 4.2 - hit * 10, t);
    }
    // (THE BURN: tongues of his fire licking up off it, each its own, flaring as each tick bites)
    const bite = (hit % TICK) / TICK;
    const flare = 1 + 0.55 * Math.max(0, 1 - bite * 5);
    const [gx, gy] = targetFoot(view, turn);
    burn(l, gx, gy, TARGET_BOX.w, TARGET_BOX.h, t, Math.min(1, hit / 0.25) * flare);
  }
  l.lay(out);
  return out;
}
