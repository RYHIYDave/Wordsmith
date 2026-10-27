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
    // (kept two pixels in from the scene's edge: never cut off by it; and then none left alone)
    const inside = (x: number, y: number): boolean => x >= 2 && y >= 2 && x <= on.w - 3 && y <= on.h - 3;
    const has = (x: number, y: number): boolean => inside(x, y) && this.px.has((y + 1024) * 4096 + (x + 1024));
    for (const [q, k] of this.px) {
      const x = (q % 4096) - 1024;
      const y = Math.floor(q / 4096) - 1024;
      if (!inside(x, y)) continue;
      if (!has(x - 1, y) && !has(x + 1, y) && !has(x, y - 1) && !has(x, y + 1)) continue;
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

// ---------------------------------------------------------------------------------------------
// THE SMOKE STEP (his swipe; his word, 25 Oct: “I like smoke step, and we can have that apply the curse as well”): smoke
// boiling up off him as he coils; HE BREAKS UP INTO BLACK SMOKE (`dissolve`); the smoke, a rolling column of it, streaks
// to where the swipe takes him, a trail of it left on the floor behind, cursing whoever it passes through (they smolder,
// as the Curse leaves them); there it gathers, and he forms out of it.

/** How far the swipe takes him (as far as the other heroes' swipes: six tiles), along his own forward. */
export const STEP_REACH = 6 * UNITS_PER_TILE;
/** The ones in his way, in his own lengths (forward, left): two, beside the line he takes. */
export const STEP_TARGETS: readonly [number, number][] = [
  [2.0 * UNITS_PER_TILE, 0.7 * UNITS_PER_TILE],
  [4.0 * UNITS_PER_TILE, -0.7 * UNITS_PER_TILE],
];
/** The scene for it: his canvas where he starts (`x`, `y` its top left), room for all six tiles of it. */
export const STEP_SCENE = { w: 470, h: 300, ax: CANVAS3.ax, ay: CANVAS3.ay + 38, x: 0, y: 38 };
/** How long its trail of smoke lingers on the floor (seconds). */
export const TRAIL_LIFE = 1.1;

/** Where a point of his is in the smoke step's scene. */
function onStep(p: V3, view: GameView, turn: number): [number, number] {
  const a = (turn * Math.PI) / 180;
  const q: V3 = [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const s = project(q, view === 'back' ? 'rear' : view);
  return [STEP_SCENE.ax + s[0], STEP_SCENE.ay + s[1]];
}
/** How far along the step he is (0 where he starts, 1 where he ends), eased in and out across the move's flash (`dash`). */
export function stepAlong(m: WarlockMove, t: number): number {
  const [a, b] = m.dash ?? [0, 0];
  const u = Math.max(0, Math.min(1, (t - a) / Math.max(1e-6, b - a)));
  return u * u * (3 - 2 * u);
}
/** How far he is gone into smoke (0 all there, 1 all smoke) at a moment of the step. */
export function stepGone(m: WarlockMove, t: number): number {
  const [a, b] = m.dash ?? [0, 0];
  const s = (x: number): number => Math.max(0, Math.min(1, x));
  const e = (x: number): number => x * x * (3 - 2 * x);
  return t < a ? e(s((t - (a - 2.5 * FR)) / (3 * FR))) : e(s(1 - (t - b) / (3.5 * FR)));
}
/** Where his canvas is drawn in the scene at a moment of the step (its top left): carried along with him. */
export function stepCanvasAt(m: WarlockMove, t: number, view: GameView, turn = 0): [number, number] {
  const [x0, y0] = onStep([0, 0, 0], view, turn);
  const [x1, y1] = onStep([STEP_REACH * stepAlong(m, t), 0, 0], view, turn);
  return [Math.round(STEP_SCENE.x + x1 - x0), Math.round(STEP_SCENE.y + y1 - y0)];
}
/** When, as a share of the flash, the eased step reaches `v` of the way (the inverse of smoothstep). */
const unease = (v: number): number => 0.5 - Math.sin(Math.asin(Math.max(-1, Math.min(1, 1 - 2 * v))) / 3);
/** Where the ones in his way stand in the scene (the floor under them). */
export function stepFeet(view: GameView, turn = 0): [number, number][] {
  return STEP_TARGETS.map(([x, y]) => onStep([x, y, 0], view, turn));
}

/**
 * HIM BREAKING UP INTO SMOKE, `gone` of the way (0 all there, 1 all smoke): pixel by pixel, where the smoke's noise is under
 * how far he is gone, he is smoke (black smoke's colours) and then nothing; none left alone. A new picture.
 */
export function dissolve(px: Px, gone: number, t: number): Px {
  if (gone <= 0) return px;
  const out = new Px(px.w, px.h);
  const keep = new Uint8Array(px.w * px.h);
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      const i = (y * px.w + x) * 4;
      if (px.d[i + 3] === 0) continue;
      const n = noise2(x * 0.32 + 1.7, y * 0.32 - t * 6) * 0.75 + noise2(x * 0.9, y * 0.9 + 3.1) * 0.25;
      const edge = gone * 1.35 - 0.15;
      if (n < edge - 0.22) continue;
      keep[y * px.w + x] = n < edge ? 2 : 1;
    }
  }
  // (none left alone: a solid pixel with no solid one beside it goes, and an edge of light with no solid one beside it;
  // twice over, as each going may leave another alone)
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < px.w && y < px.h && keep[y * px.w + x] > 0 && (keep[y * px.w + x] === 2 || px.d[(y * px.w + x) * 4 + 3] === 255);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < px.h; y++) {
      for (let x = 0; x < px.w; x++) {
        if (!keep[y * px.w + x]) continue;
        if (!solid(x - 1, y) && !solid(x + 1, y) && !solid(x, y - 1) && !solid(x, y + 1)) keep[y * px.w + x] = 0;
      }
    }
  }
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      const k = keep[y * px.w + x];
      if (!k) continue;
      const i = (y * px.w + x) * 4;
      if (k === 2) {
        // (turning to smoke: its colours, lighter at what was his edge)
        const c = SMOKE[px.d[i + 3] === 255 ? (noise2(x * 0.5, y * 0.5 + t * 3) > 0.5 ? 1 : 2) : 3];
        out.set(x, y, c);
      } else {
        out.d[i] = px.d[i];
        out.d[i + 1] = px.d[i + 1];
        out.d[i + 2] = px.d[i + 2];
        out.d[i + 3] = px.d[i + 3];
      }
    }
  }
  return out;
}

/** A mass of black smoke, its foot at (`cx`, `cy`), `w` across and `h` high, rolling (`t`), torn ragged at its edges by noise; `thin` 0 dense to 1 gone. */
function cloud(sm: Light, cx: number, cy: number, w: number, h: number, t: number, thin: number, seed: number, light = 0): void {
  if (thin >= 1) return;
  for (let y = Math.floor(cy - h - 3); y <= Math.ceil(cy + 2); y++) {
    for (let x = Math.floor(cx - w / 2 - 4); x <= Math.ceil(cx + w / 2 + 4); x++) {
      const ex = (x - cx) / (w / 2);
      const ey = (y - (cy - h / 2)) / (h / 2);
      const n = noise2(x * 0.22 + seed, (y + t * 30) * 0.2) * 0.65 + noise2(x * 0.6 - t * 3, y * 0.6 + seed) * 0.35;
      const v = 1 - Math.hypot(ex, ey) + (n - 0.5) * 0.9 - thin * 1.1;
      if (v < 0) continue;
      // (dark through, its edge lighter only on top where the light catches it: no rimmed bubble)
      sm.put(x, y, Math.min(3, (v > 0.45 ? 0 : v > 0.25 ? 1 : v > 0.1 || y > cy - h / 2 ? 2 : 3) + light));
    }
  }
}

/**
 * THE SMOKE STEP'S SMOKE AND LIGHT AT A MOMENT of the move (`m`, its `dash` the flash the game carries him through): the
 * smoke boiling up off him as he coils; the rolling column of it carried across, its embers swirling in it; the trail it
 * leaves on the floor, lingering and thinning; the ones in his way cursed as it passes through them (smoldering from then
 * on); the smoke gathering where he comes out of it, and thinning away off him. On a scene of its own (STEP_SCENE).
 */
export function stepLight(m: WarlockMove, t: number, view: GameView, turn = 0): Px {
  const out = new Px(STEP_SCENE.w, STEP_SCENE.h);
  const l = new Light();
  const sm = new Light();
  const [a, b] = m.dash ?? [0, 0];
  const gone = stepGone(m, t);
  const here = stepAlong(m, t);
  const [hx, hy] = onStep([STEP_REACH * here, 0, 0], view, turn);
  // (THE COLUMN: boiling up off him as he coils and breaks up; carried across; gathering where he comes out, and thinning off him)
  const coil = Math.max(0, Math.min(1, (t - (a - 5 * FR)) / (5 * FR)));
  const after = Math.max(0, (t - b) / 0.5);
  const thin = t < a ? 1 - coil * 0.85 : t <= b ? 0.05 : Math.min(1, 0.15 + after);
  // (streaked out along the way it goes while it is carried fastest)
  const fast = t > a && t < b ? Math.sin(Math.PI * (t - a) / (b - a)) : 0;
  cloud(sm, hx, hy, (30 + 12 * gone) * (1 + 0.9 * fast), 30 + 26 * gone * (t <= b ? 0.6 : 1), t, thin, 3.3);
  // (embers swirling in it)
  if (thin < 0.9) {
    for (let e = 0; e < 6; e++) {
      const ang = t * 7 + e * 1.05;
      const ex = hx + Math.cos(ang) * (8 + 3 * Math.sin(e));
      const ey = hy - 14 - e * 4 - Math.sin(ang) * 4;
      l.put(ex, ey, 2);
      l.put(ex + 1, ey, 1);
    }
  }
  // (THE TRAIL)
  if (t >= a) {
    // (FLOWING ON THE GROUND, BILLOWING UP: his words, 25 Oct, of the trail: “Billowing, rising (Recommended)”, then “Eh
    // not quite.  I like it flowing on the ground, with smoke billowing up”: a river of smoke along the floor where the
    // column has passed, rolling on the way he went, and puffs billowing up off it, thinning away as it ages)
    const [sx, sy] = onStep([0, 0, 0], view, turn);
    const [ex, ey] = onStep([STEP_REACH * here, 0, 0], view, turn);
    const [fx2, fy2] = onStep([STEP_REACH, 0, 0], view, turn);
    const LEN = Math.hypot(fx2 - sx, fy2 - sy) || 1;
    const ux = (fx2 - sx) / LEN;
    const uy = (fy2 - sy) / LEN;
    const reach = Math.hypot(ex - sx, ey - sy);
    for (let y = Math.floor(Math.min(sy, ey) - 12); y <= Math.ceil(Math.max(sy, ey) + 8); y++) {
      for (let x = Math.floor(Math.min(sx, ex) - 10); x <= Math.ceil(Math.max(sx, ex) + 10); x++) {
        const along = (x - sx) * ux + (y - sy) * uy;
        if (along < -4 || along > reach + 2) continue;
        const v = Math.max(0, Math.min(1, along / LEN));
        const age = (t - (a + (b - a) * unease(v))) / TRAIL_LIFE;
        if (age >= 1) continue;
        // (across the floor from its line: on screen, mostly up from it, a little down)
        const off = (x - sx) * -uy + (y - sy) * ux + (noise2(along * 0.15 - t * 4, 7.7) - 0.5) * 3;
        const flow = noise2((along - t * 70) * 0.09, off * 0.35 + 2.3) * 0.7 + noise2((along - t * 110) * 0.25, off * 0.6) * 0.3;
        const half = (5 + 4 * flow) * (1 - 0.4 * Math.max(0, age));
        const up = -off;
        const depth = up > 0 ? up / (half * 1.3) : -up / (half * 0.45);
        const vv = 1 - depth + (flow - 0.5) * 0.8 - Math.max(0, age - 0.45) * 1.8;
        if (vv < 0) continue;
        sm.put(x, y, vv > 0.55 ? 0 : vv > 0.3 ? 1 : vv > 0.12 || up < half * 0.5 ? 2 : 3);
      }
    }
    // (puffs billowing up off it, each place along it sending one up after another while it lasts)
    for (let k = 0; k <= 12; k++) {
      const v = (k + 0.5) / 13;
      if (v > here) break;
      const born0 = a + (b - a) * unease(v);
      const life = 0.9;
      for (let j = 0; j < 3; j++) {
        const born = born0 + j * 0.26 + hash(k * 3 + j) * 0.12;
        const ph = (t - born) / life;
        if (ph < 0 || ph >= 1 || born > born0 + TRAIL_LIFE * 0.7) continue;
        const [px0, py0] = onStep([STEP_REACH * v, 0, 0], view, turn);
        const lift = 1 - (1 - ph) * (1 - ph);
        const drift = (noise2(k * 0.9 + j * 4, t * 0.7) - 0.5) * 16 * ph + (hash(k * 7 + j) - 0.5) * 8;
        const size = (13 + 11 * ph) * (0.8 + 0.4 * hash(k * 11 + j));
        // (born out of the river, rolling up off it, lighter than it as it thins)
        cloud(sm, px0 + drift, py0 + 3 - lift * 22, size, size * 0.95, t + k, Math.max(0, (ph - 0.45) / 0.55), 7 + k * 3 + j, ph > 0.3 ? 1 : 0);
      }
    }
  }
  // (THE ONES IN HIS WAY, CURSED as the column passes through them: smoldering from then on)
  stepFeet(view, turn).forEach(([gx, gy], i) => {
    const v = STEP_TARGETS[i][0] / STEP_REACH;
    const passed = a + (b - a) * unease(v);
    const since = t - passed;
    if (since < 0) return;
    if (since < 0.25) burst(l, gx, gy - TARGET_BOX.h * 0.5, 3 + since * 30, since / 0.25, 61 + i);
    smolder(l, sm, gx, gy, TARGET_BOX.w, TARGET_BOX.h, t, Math.min(1, since / 0.3), i + 4);
  });
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}

// ---------------------------------------------------------------------------------------------
// THE CHANGE (his pick of his brief, “Violent burst (Recommended)”: he doubles over, the demon tears out of him in a blast of
// smoke and a shockwave): as he bursts (the move's CHANGE_BURST), HE IS GONE INTO SMOKE in a blink (`dissolve`); a BLAST OF
// BLACK SMOKE billows out where he stood, cyan embers flung out of it; a SHOCKWAVE runs out over the floor, a ring of
// smoke and cyan light; and out of the smoke THE DEMON forms where he stood (dev/sculpt_demon.ts, its own figure).

/** The scene for it: big enough for the demon (dev/demon_hulk.ts HULK_CANVAS), the floor point under them both at (`ax`, `ay`). */
export const CHANGE_SCENE = { w: 380, h: 380, ax: 190, ay: 284 };
/** Where his canvas and the demon's go in that scene (top left). */
export const CHANGE_MAN_AT: [number, number] = [CHANGE_SCENE.ax - CANVAS3.ax, CHANGE_SCENE.ay - CANVAS3.ay];
/** How long after he bursts the demon begins to form out of the smoke, and how long it takes. */
export const DEMON_FORMS: [number, number] = [0.12, 0.45];

/** How far the man is gone into smoke at a moment of the change (`burst`, the moment he bursts). */
export function changeGone(burst: number, t: number): number {
  const u = Math.max(0, Math.min(1, (t - (burst - FR)) / (2 * FR)));
  return u * u * (3 - 2 * u);
}
/** How far the demon is still smoke (1 all smoke, 0 all there) at a moment of the change. */
export function demonSmoke(burst: number, t: number): number {
  const u = Math.max(0, Math.min(1, (t - burst - DEMON_FORMS[0]) / DEMON_FORMS[1]));
  return 1 - u * u * (3 - 2 * u);
}

/** THE CHANGE'S SMOKE AND LIGHT AT A MOMENT (seconds from the start of the change move; `burst` the moment he bursts): see above. On a scene of its own (CHANGE_SCENE). */
export function changeLight(burst: number, t: number, view: GameView): Px {
  const out = new Px(CHANGE_SCENE.w, CHANGE_SCENE.h);
  const l = new Light();
  const sm = new Light();
  const since = t - burst;
  if (since < -FR) return out;
  const { ax, ay } = CHANGE_SCENE;
  void view;
  // (THE SHOCKWAVE: a ring running out over the floor, flat as the floor lies, smoke boiling up off it, light on its edge)
  if (since >= 0 && since < 0.5) {
    const u = since / 0.5;
    const r = 8 + u * 120;
    const ring = 7 + 8 * u;
    for (let y = Math.floor(ay - r * 0.5 - 12); y <= Math.ceil(ay + r * 0.5 + 4); y++) {
      for (let x = Math.floor(ax - r - 6); x <= Math.ceil(ax + r + 6); x++) {
        const d = Math.hypot(x - ax, (y - ay) * 2);
        const off = r - d;
        if (off < 0 || off > ring) continue;
        const n = noise2(x * 0.3, y * 0.3 + since * 9);
        if (n < 0.15 + u * 0.55) continue;
        // (its leading edge light, smoke behind it)
        if (off < 2.4 && u < 0.75) l.put(x, y, u < 0.3 ? 3 : off < 1.2 ? 2 : 1);
        else sm.put(x, y - Math.round((off / ring) * 4), off > ring * 0.6 ? 2 : 1);
      }
    }
  }
  // (THE BLAST OF SMOKE where he stood: billowing out and up, thinning as the demon forms in it)
  const grow = Math.min(1, Math.max(0, since + FR) / 0.25);
  const thin = Math.max(0, Math.min(1, (since - 0.35) / 0.7));
  if (thin < 1) {
    cloud(sm, ax, ay + 4, 60 + 70 * grow, 70 + 50 * grow, t, 0.15 + thin * 0.85, 31);
    for (const [ox, oy, k] of [[-46, -10, 0], [44, -16, 1], [-24, -60, 2], [30, -70, 3], [0, -90, 4]] as const) {
      cloud(sm, ax + ox * grow, ay + oy * grow, 30 + 20 * grow, 30 + 20 * grow, t + k, 0.25 + thin * 0.75, 40 + k);
    }
  }
  // (cyan embers flung out of it)
  if (since >= 0 && since < 0.9) {
    for (let e = 0; e < 18; e++) {
      const ang = hash(e * 3) * Math.PI * 2;
      const sp = 60 + 120 * hash(e * 3 + 1);
      const x = ax + Math.cos(ang) * sp * since;
      const y = ay - 40 + Math.sin(ang) * sp * since * 0.6 + 60 * since * since;
      if (hash(e * 3 + 2) < since * 1.1) continue;
      l.put(x, y, since < 0.3 ? 3 : 2);
      l.put(x + 1, y, since < 0.3 ? 2 : 1);
    }
  }
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}

// THE CHANGE SEEN HAPPENING (his word of the first change, 26 Oct: “I’d like a little bit of an actual transition from one to
// the other.  Not just a smoke cloud obscuring the change.”; dev/warlock_change.ts): no cloud over him. Only where a piece of
// him tears away, a puff of smoke and a spark or two where it was, gone in a moment; cyan embers whirling up round him as he
// changes; and when it has come, its ROAR: a shockwave running out over the floor.

/** A piece of him torn away in the change: where it was (his own space, turned as he is) and the moment (seconds) it went. */
export interface TornAt {
  at: V3;
  t: number;
}
/** How long a torn piece's puff of smoke lasts (seconds). */
export const PUFF_LIFE = 0.45;
/** How long the roar's shockwave runs (seconds). */
export const ROAR_LIFE = 0.55;

/** Where a point of the changing figure (its own space, already turned) is in the change's scene. */
function onChange(p: V3, view: GameView): [number, number] {
  const s = project(p, view === 'back' ? 'rear' : view);
  return [CHANGE_SCENE.ax + s[0], CHANGE_SCENE.ay + s[1]];
}

/**
 * THE CHANGE'S SMOKE AND LIGHT AT A MOMENT (`t`, seconds from his being tapped): the puffs where the pieces `torn` from him
 * went; the embers whirling round `heart` (his chest, his own space, turned) as strong as `whirl` (0 to 1); and from `roar`
 * (seconds) the shockwave. On the change's scene (CHANGE_SCENE).
 */
export function morphLight(torn: readonly TornAt[], t: number, whirl: number, heart: V3, roar: number, view: GameView): Px {
  const out = new Px(CHANGE_SCENE.w, CHANGE_SCENE.h);
  const l = new Light();
  const sm = new Light();
  // (THE PUFFS: each where its piece was, swelling, rising and thinning away; a spark flung from some)
  torn.forEach((p, i) => {
    const age = t - p.t;
    if (age < 0 || age >= PUFF_LIFE) return;
    const u = age / PUFF_LIFE;
    const [x, y] = onChange(p.at, view);
    const side = (hash(i * 5 + 1) - 0.5) * 10;
    cloud(sm, x + side * u, y + 5 - 14 * u, 7 + 9 * u, 7 + 9 * u, t, 0.12 + 0.88 * u * u, 50 + i);
    // (a spark from one in three)
    if (hash(i * 5 + 9) < 0.34) {
      const a = hash(i * 5 + 2) * Math.PI * 2;
      const r = 4 + 22 * u;
      const k = u < 0.35 ? 3 : u < 0.7 ? 2 : 1;
      const ex = x + Math.cos(a) * r;
      const ey = y + Math.sin(a) * r * 0.6 - 10 * u;
      l.put(ex, ey, k);
      l.put(ex, ey - 1, Math.max(0, k - 1));
    }
  });
  // (THE EMBERS whirling up round him as he changes: each on its own ring round him, rising as it goes round, two pixels long)
  if (whirl > 0.05) {
    const [cx, cy] = onChange(heart, view);
    for (let e = 0; e < 16; e++) {
      if (hash(e * 7 + 3) > whirl) continue;
      const ph = (t * (0.55 + 0.3 * hash(e * 7)) + hash(e * 7 + 1)) % 1;
      const a = ph * Math.PI * 4 + e;
      const r = 26 + 22 * hash(e * 7 + 2);
      const x = cx + Math.cos(a) * r;
      const y = cy + 30 - ph * 80 + Math.sin(a) * r * 0.3;
      const k = ph < 0.5 ? 3 : 2;
      l.put(x, y, k);
      l.put(x, y + 1, k - 1);
    }
  }
  // (THE ROAR'S SHOCKWAVE: a ring running out over the floor, flat as the floor lies, light on its leading edge, smoke boiling
  // up behind it)
  const since = t - roar;
  if (since >= 0 && since < ROAR_LIFE) {
    const { ax, ay } = CHANGE_SCENE;
    const u = since / ROAR_LIFE;
    const r = 14 + u * 130;
    const ring = 7 + 8 * u;
    for (let y = Math.floor(ay - r * 0.5 - 12); y <= Math.ceil(ay + r * 0.5 + 4); y++) {
      for (let x = Math.floor(ax - r - 6); x <= Math.ceil(ax + r + 6); x++) {
        const d = Math.hypot(x - ax, (y - ay) * 2);
        const off = r - d;
        if (off < 0 || off > ring) continue;
        const n = noise2(x * 0.3, y * 0.3 + since * 9);
        if (n < 0.15 + u * 0.55) continue;
        if (off < 2.4 && u < 0.75) l.put(x, y, u < 0.3 ? 3 : off < 1.2 ? 2 : 1);
        else sm.put(x, y - Math.round((off / ring) * 4), off > ring * 0.6 ? 2 : 1);
      }
    }
  }
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}
