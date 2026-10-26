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
  lay(on: Px, pal: readonly string[] = HELL): void {
    const has = (x: number, y: number): boolean => this.px.has((y + 1024) * 4096 + (x + 1024));
    for (const [q, k] of this.px) {
      const x = (q % 4096) - 1024;
      const y = Math.floor(q / 4096) - 1024;
      if (!has(x - 1, y) && !has(x + 1, y) && !has(x, y - 1) && !has(x, y + 1)) continue;
      // (kept two pixels in from the scene's edge: never cut off by it)
      if (x < 2 || y < 2 || x > on.w - 3 || y > on.h - 3) continue;
      on.set(x, y, pal[k]);
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

// ---------------------------------------------------------------------------------------------
// THE CURSE (his tap+hold): CHAINS OF BRAND whipping out of the demon's claws to every enemy in range, branding each; and
// then each cursed one seeping BLACK SMOKE, cyan embers in it, and no mark (his picks, 25 Oct: “Chains of brand”, “Smoke
// only”): a smaller burn than the bolt's, told apart from it at a glance.

/** Where the ones he curses stand, in his lengths (his own forward, left), on the floor: three of them, in range. */
export const CURSE_TARGETS: readonly [number, number][] = [
  [2.5 * UNITS_PER_TILE, 1.6 * UNITS_PER_TILE],
  [3.0 * UNITS_PER_TILE, 0.1 * UNITS_PER_TILE],
  [2.3 * UNITS_PER_TILE, -1.7 * UNITS_PER_TILE],
];
/** Where each of them stands in the scene (the floor under it). */
export function curseFeet(view: GameView, turn = 0): [number, number][] {
  return CURSE_TARGETS.map(([x, y]) => onScene([x, y, 0], view, turn));
}
/** How long a chain takes to reach its mark, how long it holds there, how long it takes to burn away to smoke (seconds). */
export const CHAIN_REACH = 10 * FR;
/** Each next chain leaves this much after the one before; he hauls them taut so long after they leave; they burn away so long after they leave, over CHAIN_FADE. */
export const CHAIN_LAG = 2 * FR;
export const CHAIN_YANK = 18 * FR;
export const CHAIN_GONE = 26 * FR;
export const CHAIN_FADE = 0.35;
/** How thin a cursed one's smoke is (more, thinner). */
export const SMOLDER = { thin: 0.22 };
/** Black smoke, darkest to lightest at its edge where the light catches it. */
export const SMOKE = ['#141018', '#28222e', '#3e3646', '#5a5066'];

/**
 * A CHAIN OF BLACK SMOKE (his word, 25 Oct, of the first: “Too fast, let them whip,Too straight,How about Smokey black
 * chains”) from his claws at (`ax`, `ay`) to the one it brands at (`bx`, `by`): link after link of black smoke, wisps
 * curling up off it and a cyan ember here and there in it, its tip a hot cyan brand. `u` how far out it has snaked (0 to 1);
 * `wave` how hard it whips (a wave running down it from his hand to its tip); `slack` how far it sags in the middle and
 * `swing` how far that sag swings across; burnt away to nothing from his claws out as far as `gone` (0 to 1).
 */
function chain(l: Light, sm: Light, ax: number, ay: number, bx: number, by: number, u: number, wave: number, slack: number, swing: number, gone: number, t: number, seed: number): void {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const at = (s: number): [number, number] => {
    // (the part of it out so far, as a share of it: the sag and the swing are of that, the wave runs down it to its tip)
    const v = u > 0 ? s / u : 0;
    const bow = 4 * v * (1 - v);
    const w = Math.sin(Math.PI * 2 * (1.3 * s - 2.4 * t) + seed) * wave * v * (1 - 0.4 * v);
    const side = w + bow * swing;
    return [ax + dx * s + nx * side, ay + dy * s + ny * side + bow * slack * u];
  };
  const LINK = 6;
  const reach = len * u;
  let last: [number, number] = [ax, ay];
  for (let along = 0; along <= reach; along += 0.5) {
    const s = along / len;
    const [x, y] = at(s);
    const [x2, y2] = at(Math.min(u, s + 0.01));
    const tl = Math.hypot(x2 - x, y2 - y) || 1;
    const cx = -(y2 - y) / tl;
    const cy = (x2 - x) / tl;
    last = [x, y];
    if (s < gone) continue;
    const n = Math.floor(along / LINK);
    const f = (along % LINK) / LINK;
    if (n % 2 === 0) {
      // (a link seen flat: a ring of black smoke round a hole, its rim catching the light)
      const half = Math.sin(Math.PI * f) * 2.8;
      sm.put(x + cx * half, y + cy * half, 3);
      sm.put(x - cx * half, y - cy * half, 2);
      if (f < 0.14 || f > 0.86) sm.put(x, y, 1);
    } else {
      // (a link seen edge-on: a dark bar through the next)
      sm.put(x, y, 0);
      sm.put(x + cx * 0.9, y + cy * 0.9, 2);
      sm.put(x - cx * 0.9, y - cy * 0.9, 1);
    }
    // (wisps of smoke curling up off it, and a cyan ember in it here and there)
    if (along % 6 < 0.5) {
      const k = Math.floor(along / 6);
      const tall = Math.round(2 + 4 * noise2(k * 0.7 + seed, t * 5));
      for (let h = 1; h <= tall; h++) {
        const sw = Math.round(Math.sin(h * 0.7 + t * 6 + k) * 1.2);
        sm.put(x + sw, y - 2 - h, h < tall * 0.5 ? 2 : 3);
        sm.put(x + sw + 1, y - 2 - h, 3);
      }
    }
    if (along % 9 < 0.5 && noise2(along * 0.3 + seed, t * 8) > 0.5) {
      l.put(x, y - 1, 2);
      l.put(x + 1, y - 1, 1);
    }
  }
  // (ITS TIP, A HOT CYAN BRAND: a ring of white-hot fire where it bites)
  if (gone < 1) {
    const [tx, ty] = last;
    for (let a = 0; a < 12; a++) {
      const r = 2.2;
      l.put(tx + Math.cos((a / 12) * Math.PI * 2) * r, ty + Math.sin((a / 12) * Math.PI * 2) * r, a % 3 === 0 ? 3 : 2);
    }
    l.put(tx, ty, 3);
    l.put(tx + 1, ty, 3);
  }
}

/**
 * A CURSED ONE SEEPING SMOKE, its floor point at (`gx`, `gy`), `w` across and `h` high: puffs of black smoke seeping up off
 * it and rising, swelling and thinning as they go, and a few cyan embers rising in them; `heat` 0 none to 1, more as each
 * bite of the curse flares it.
 */
function smolder(l: Light, sm: Light, gx: number, gy: number, w: number, h: number, t: number, heat: number, seed: number): void {
  if (heat <= 0) return;
  // (WISPS OF IT rising off its shoulders and crown and sides: each a column of smoke that winds up off it, widening and
  // thinning as it rises, torn by the air)
  for (let i = 0; i < 4; i++) {
    const k = seed * 13 + i * 5;
    const up = [0.62, 0.85, 0.4, 0.72][i];
    const x0 = gx + [-0.3, 0.05, 0.32, 0.22][i] * w;
    const y0 = gy - h * up;
    const TALL = 26 * heat;
    for (let y = Math.floor(y0 - TALL); y <= Math.ceil(y0 + 2); y++) {
      const rise = y0 - y;
      const bend = (noise2(k * 0.4, (y + t * 16) * 0.05) - 0.5) * rise * 0.5;
      const wide = 2.2 + rise * 0.22;
      for (let x = Math.floor(x0 - wide - 8); x <= Math.ceil(x0 + wide + 8); x++) {
        const off = Math.abs(x - x0 - bend) / wide;
        if (off > 1.4) continue;
        const v = noise2(x * 0.3 + k, (y + t * 18) * 0.16) * 0.7 + noise2(x * 0.7 + k * 2, (y + t * 26) * 0.32) * 0.4 - SMOLDER.thin - off * 0.3 - (rise / Math.max(1, TALL)) * 0.4;
        if (v < 0) continue;
        sm.put(x, y, v > 0.3 ? 0 : v > 0.18 ? 1 : v > 0.08 ? 2 : 3);
      }
    }
  }
  // (cyan embers rising in it, each a spark two pixels long)
  for (let e = 0; e < 4; e++) {
    const k = seed * 29 + e * 3;
    const ph = (((t * (0.7 + 0.2 * hash(k)) + hash(k + 1)) % 1) + 1) % 1;
    if (ph > 0.85) continue;
    const x = gx + (hash(k + 2) - 0.5) * w * 0.6 + Math.sin(ph * 6 + e) * 2;
    const y = gy - h * (0.3 + 0.5 * hash(k + 3)) - ph * 22;
    l.put(x, y, ph < 0.4 ? 2 : 1);
    l.put(x, y - 1, ph < 0.4 ? 2 : 1);
  }
}

/**
 * THE CURSE'S LIGHT AND SMOKE AT A MOMENT of the move that casts it (`m`, its blow the moment the chains leave the claws):
 * the chains whipping out to each of the ones in range (CURSE_TARGETS), holding as they brand them while he hauls back on
 * them, burning away to smoke; a flash where each brands; then the smoke seeping off every cursed one, and its embers. On a
 * scene of its own, clear but for them (BOLT_SCENE). Empty before it is cast.
 */
export function curseLight(m: WarlockMove, t: number, view: GameView, turn = 0): Px {
  const out = new Px(BOLT_SCENE.w, BOLT_SCENE.h);
  const l = new Light();
  const sm = new Light();
  const go = (m.blows ?? [])[0]?.at ?? 0;
  if (t < go) return out;
  const since = t - go;
  const hand = onScene(fireSeat(solve(WARLOCK_B, warlockPose(m.motion, Math.min(t, m.long))), 1.0), view, turn);
  const feet = curseFeet(view, turn);
  feet.forEach(([gx, gy], i) => {
    const late = i * CHAIN_LAG;
    const s = since - late;
    if (s < 0) return;
    const [bx, by] = [gx, gy - TARGET_BOX.h * 0.5];
    if (since < CHAIN_GONE + CHAIN_FADE) {
      // (snaking out, eased to a stop at its mark; whipping as it goes, the whip dying once it bites; slack and swinging
      // until he hauls it taut)
      const r = Math.min(1, s / CHAIN_REACH);
      const u = 1 - (1 - r) * (1 - r);
      const landed = Math.max(0, s - CHAIN_REACH);
      const wave = (i % 2 === 0 ? 1 : -1) * 7 * (r < 1 ? 1 : Math.exp(-landed * 7));
      const taut = Math.min(1, Math.max(0, (since - CHAIN_YANK) / (3 * FR)));
      const slack = 12 * (1 - 0.8 * taut);
      const swing = Math.sin(t * 7 + i * 2) * 4 * (1 - taut);
      const gone = Math.max(0, (since - CHAIN_GONE) / CHAIN_FADE);
      chain(l, sm, hand[0], hand[1], bx, by, u, wave, slack, swing, gone, t, i * 3.7 + 1);
    }
    // (the brand: a flash and a ring of flecks where the chain bites)
    const bit = s - CHAIN_REACH;
    if (bit >= 0 && bit < 0.25) burst(l, bx, by, 3 + bit * 40, bit / 0.25, 21 + i);
    // (and from then on it smolders, every bite of the curse flaring it a little)
    if (bit >= 0) {
      const flare = 1 + 0.3 * Math.max(0, 1 - ((bit % TICK) / TICK) * 5);
      smolder(l, sm, gx, gy, TARGET_BOX.w, TARGET_BOX.h, t, Math.min(1, bit / 0.3) * flare, i + 1);
    }
  });
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}

// ---------------------------------------------------------------------------------------------
// THE SPREAD (his design, 25 Oct: “If a cursed enemy dies, it spreads all DOTs to other enemies in range.  So the play
// pattern is: try to get the tap DOT to spread via the curse.”; his word to show it: “Good, show the spread next
// (Recommended)”): the three cursed (CURSE_TARGETS), the middle one burning from his bolt too; it dies, and as it falls its
// burns leap off it, a ball of his fire arcing to each of the others with a trail of its black smoke, bursting on each; and
// now each burns as well as smolders.

/** Which of CURSE_TARGETS dies; when its death begins; when its burns leap off it, how long they fly. */
export const SPREAD_FROM = 1;
export const DIES_AT = 1.0;
export const LEAP_AT = 1.3;
export const LEAP_FLIGHT = 0.42;
/** How high (pixels) a leaping burn arcs over the floor between them. */
const LEAP_ARC = 26;

/** THE SPREAD'S LIGHT AND SMOKE AT A MOMENT (seconds from the start of the scene): see above. On a scene of its own (BOLT_SCENE). */
export function spreadLight(t: number, view: GameView, turn = 0): Px {
  const out = new Px(BOLT_SCENE.w, BOLT_SCENE.h);
  const l = new Light();
  const sm = new Light();
  const feet = curseFeet(view, turn);
  const mid = (i: number): [number, number] => [feet[i][0], feet[i][1] - TARGET_BOX.h * 0.5];
  feet.forEach(([gx, gy], i) => {
    const dying = i === SPREAD_FROM;
    // (its curse: smoke off every one; off the dead one thinning away once it is down)
    const smoke = dying ? Math.max(0, 1 - Math.max(0, t - LEAP_AT) / 0.8) : 1;
    // (as it falls the dead one's smoke falls with it: its sources nearer the floor)
    const sink = dying ? Math.min(1, Math.max(0, (t - DIES_AT) / 0.7)) : 0;
    smolder(l, sm, gx, gy, TARGET_BOX.w, TARGET_BOX.h * (1 - 0.7 * sink), t, smoke, i + 1);
    // (its burn: the dying one burning until its burns leap off it; the others from when they land)
    const landed = t - (LEAP_AT + LEAP_FLIGHT);
    const heat = dying ? (t < LEAP_AT ? 1 : Math.max(0, 1 - (t - LEAP_AT) / 0.15)) : landed >= 0 ? Math.min(1, landed / 0.25) : 0;
    if (heat > 0) {
      const bite = ((t + i * 0.17) % TICK) / TICK;
      burn(l, gx, gy, TARGET_BOX.w, TARGET_BOX.h * (1 - 0.7 * sink), t, heat * (1 + 0.55 * Math.max(0, 1 - bite * 5)));
    }
  });
  // (AS IT DIES ITS BURNS LEAP OFF IT: a flare on it, then a ball of fire to each of the others, arcing, its smoke trailing)
  const since = t - LEAP_AT;
  const [fx, fy] = mid(SPREAD_FROM);
  if (since >= 0 && since < 0.22) burst(l, fx, fy, 5 + since * 50, since / 0.22, 41);
  feet.forEach((_, i) => {
    if (i === SPREAD_FROM || since < 0) return;
    const [tx, ty] = mid(i);
    const u = since / LEAP_FLIGHT;
    const arc = (v: number): [number, number] => [fx + (tx - fx) * v, fy + (ty - fy) * v - LEAP_ARC * 4 * v * (1 - v)];
    if (u <= 1) {
      // (its smoke trailing it, thinning behind)
      for (let k = 1; k <= 10; k++) {
        const v = u - k * 0.035;
        if (v <= 0) break;
        const [sx, sy] = arc(v);
        const r = 1.2 + k * 0.25;
        for (let y = Math.floor(sy - r); y <= Math.ceil(sy + r); y++) {
          for (let x = Math.floor(sx - r); x <= Math.ceil(sx + r); x++) {
            if (Math.hypot(x - sx, y - sy) > r || hash(x * 13 + y * 7 + k) < k * 0.06) continue;
            sm.put(x, y, k < 4 ? 1 : k < 7 ? 2 : 3);
          }
        }
      }
      // (the ball of fire, flying the way the arc goes)
      const [bx, by] = arc(u);
      const [ax, ay] = arc(Math.max(0, u - 0.05));
      const wl = Math.hypot(bx - ax, by - ay) || 1;
      bolt(l, bx, by, (bx - ax) / wl, (by - ay) / wl, 2.8, t, [fx, fy]);
    } else if (u - 1 < 0.25 / LEAP_FLIGHT) {
      // (bursting where it lands)
      const h = (u - 1) * LEAP_FLIGHT;
      burst(l, tx, ty, 4 + h * 40, h / 0.25, 51 + i);
    }
  });
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}
