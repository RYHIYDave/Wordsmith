// FLOOR 20'S RIME SHADE: WHAT ITS BREATH DOES TO THE FLOOR, AND TO THE HERO (the art chat, 3 Nov 2026). A MOCK-UP: NOT IN THE
// GAME, behind RIME_SHADE_ON (art/rime_shade.ts, off). Nothing of the game imports it.
//
// His pick, 3 Nov 2026: “Rime Shade (Recommended)”, offered as: its breath sends a creeping line of rime along the floor that
// freezes you in place if it reaches you. By his Movement 9 (a big held wind-up, a strike of one or two frames, a big
// wind-down, and bigger areas to make up for the time you have to get out of the way):
//
//   THE MARK (`markPainted`): from `RS_BREATH.mark` into its breath, the line it will send is laid out on the floor before it,
//     from it toward you, plain to read before anything comes: its edges dashed in the enemy's pink, chevrons down it.
//   THE LINE OF RIME (`linePainted`): from the moment it breathes out (its `hit`), the rime creeps along the floor down the
//     marked line at `RIME_LINE.pace` tiles a second (slower than the hero runs: you can outrun it, or step out of it), ICE
//     CRYSTALS SPIKING UP at its creeping front as it grows and settling into a crust of rime behind it, feathered, its edge
//     flecked with the enemy's pink. Each stretch of it lies `RIME_LINE.lies` seconds after the front passes it, then melts
//     away over its last `RIME_LINE.melt`: the line melts from where it began first.
//   FROZEN IN PLACE (`frozenPainted`): where its front reaches the hero, frost closes over his feet and legs in two frames:
//     jagged plates of ice shoot up round them, leaning in over his shins, rime on the floor under him; he is held
//     `FROZEN.hold` seconds (the Drowned's grab's 0.8); then the ice cracks and shatters, its pieces flung, and he is free.
//
// The frost's colours are the game's frost (`RS_FROST`: hue 210 to 225, saturation under 0.18), never the friend's cyan; the
// enemy's pink on its edges.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { hash } from './kit';
import { TILE3 } from './new_mobs3';
import { RS_FROST, RS_ICE } from './rime_shade';
import { RS_BREATH } from './rime_shade_moves';

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};
/** The enemy's pink, for the edges of what it leaves: its body, its light, its dark. */
export const FX_PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;

/**
 * THE LINE'S NUMBERS (tiles, and seconds from its `hit`):
 *   from   where it begins, before it (its breath lands there)
 *   long   how long it is (from `from` on, along the way it faces: toward where you stood as it was marked)
 *   half   how far to either side of its middle (1 tile wide)
 *   pace   how fast its front creeps (the game's hero runs 4.6: you can outrun it)
 *   lies   how long each stretch of it lies after its front has passed it
 *   melt   melting away over the last of that
 *   markIn the mark laid out from it to its end over this long, from `RS_BREATH.mark`
 */
export const RIME_LINE = { from: 0.45, long: 6.0, half: 0.5, pace: 3.5, lies: 3.0, melt: 0.8, markIn: 0.15 } as const;
/** FROZEN IN PLACE: how long the hero is held (as the Drowned's frost grab: art/action_f9_fen.ts `FROST.hold`); the ice closing in two frames; shattering. */
export const FROZEN = { hold: 0.8, close: 2 / 30, shatter: 0.32 } as const;
/** The hero's speed in the game (src/game/defs.ts `TUNE.heroSpeed`, tiles a second), to measure the creep against. */
export const HERO_RUNS = 4.6;

/** Where its front is, `t` seconds after it breathes out: tiles before it (null before it breathes out). */
export function lineFront(t: number): number | null {
  if (t < 0) return null;
  return RIME_LINE.from + Math.min(RIME_LINE.long, RIME_LINE.pace * t);
}
/** When its front reaches a point `d` tiles before it (seconds after it breathes out), or null if the line never does. */
export function reachesAt(d: number): number | null {
  if (d < RIME_LINE.from - 1e-9 || d > RIME_LINE.from + RIME_LINE.long + 1e-9) return null;
  return (d - RIME_LINE.from) / RIME_LINE.pace;
}
/** Whether a point of the floor (`fwd` tiles before it, `side` to its left) is in the line. */
export function inLine(fwd: number, side: number): boolean {
  return Math.abs(side) <= RIME_LINE.half && reachesAt(fwd) !== null;
}
/** WHERE IT FREEZES: a hero standing at (`fwd`, `side`) is frozen in place when the front reaches him (seconds after it breathes out), or never (null). */
export function freezesAt(fwd: number, side: number): number | null {
  return inLine(fwd, side) ? reachesAt(fwd) : null;
}
/** When the last of it has melted (seconds after it breathes out). */
export const LINE_GONE = RIME_LINE.long / RIME_LINE.pace + RIME_LINE.lies;
/** How much of the rime is there `age` seconds after its front passed a point (1 whole; 0 melted). */
export function rimeLeft(age: number): number {
  if (age < 0) return 0;
  return 1 - smooth((age - (RIME_LINE.lies - RIME_LINE.melt)) / RIME_LINE.melt);
}

// =============================================================================================
// THE PICTURES: on a canvas anchored at the Rime Shade's own floor point, seen as it is (from in front, or truly from behind)

/** The canvas of the mark and the line (its anchor the Rime Shade's floor point). */
export const FX_CANVAS = { w: 640, h: 400, ax: 320, ay: 200 } as const;
type View = 'front' | 'back';
const G = Math.sqrt(2 / 3);
/**
 * A point of the floor (`fwd` tiles before it, `side` tiles to its left, `up` picture pixels over the floor) on the picture;
 * the line turned `turn` (radians) to its left of the way its picture faces (the game aims it straight at the hero: its
 * pictures face only four ways).
 */
export function fxAt(view: View, fwd: number, side: number, up = 0, ax: number = FX_CANVAS.ax, ay: number = FX_CANVAS.ay, turn = 0): [number, number] {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const f = (fwd * c - side * s) * TILE3;
  const l = (fwd * s + side * c) * TILE3;
  if (view === 'front') return [ax + G * (f + l), ay + G * 0.5 * (f - l) - up];
  return [ax + G * (f - l), ay + G * 0.5 * (-f - l) - up];
}
const fxAtTurned = (view: View, fwd: number, side: number, up: number, turn: number): [number, number] => fxAt(view, fwd, side, up, FX_CANVAS.ax, FX_CANVAS.ay, turn);

/** A part of the canvas of the mark and the line (picture pixels from its top left): what of it a line's pictures are painted on. */
export interface FxBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** All of it (as the art was drawn, and as its pages show it). (A function, not a constant: one more constant at the top of this
 * file is one more line in the monsters' bake's code, which brings in this file's FX_CANVAS, and a new bake: tools/bake_monsters.mjs.) */
function wholeFx(): FxBox {
  return { x: 0, y: 0, w: FX_CANVAS.w, h: FX_CANVAS.h };
}
/**
 * THE PART OF THE CANVAS ONE LINE COVERS, seen `view`, turned `turn` (the queue's fix-boss-death-stall-and-rime-shade, 12 Nov
 * 2026: three lines painted on the whole canvas cost about a third of a frame): every pixel its mark, its crust, its creeping
 * front, its frost-smoke and its crystals can be painted on, with a margin, on whole game pixels (`grain` picture pixels). Its
 * pictures are painted on this much and no more (7 to 22 in 100 of the canvas, by the way the line runs) and laid where they lie on the whole of it: the
 * same pixels in the same places (tests/rime_shade_box.test.ts).
 */
export function lineBox(view: View, turn = 0, grain = 2): FxBox {
  const C = FX_CANVAS;
  const { from, long, half } = RIME_LINE;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  // (the floor it lies on is a strip, its picture a slanted box: its corners, on the floor and as high as a crystal stands over it,
  // hold all of it. Along: from the mark's start to past the feathers at its end; across: past the front's bright edge)
  for (const a of [from - 0.3, from + long + 0.4]) {
    for (const s of [-half * 1.4, half * 1.4]) {
      for (const up of [0, 36]) {
        const [x, y] = fxAt(view, a, s, up, C.ax, C.ay, turn);
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    }
  }
  // (and a crystal's lean, width and edge to either side of its foot, and a pixel's rounding)
  const m = 12;
  const lo = (v: number): number => Math.max(0, Math.floor((v - m) / grain) * grain);
  const hiX = Math.min(C.w, Math.ceil((x1 + m) / grain) * grain);
  const hiY = Math.min(C.h, Math.ceil((y1 + m) / grain) * grain);
  const x = lo(x0);
  const y = lo(y0);
  return { x, y, w: hiX - x, h: hiY - y };
}

/**
 * A pen of whole pixels (only where nothing is yet, if `under`). `box`: the picture is that part of the canvas of the mark and the
 * line (its pixels where they are on the whole canvas, its edge the whole canvas's).
 */
function pen(px: Px, under = false, box: FxBox | null = null): (x: number, y: number, c: string) => void {
  const W = box ? FX_CANVAS.w : px.w;
  const H = box ? FX_CANVAS.h : px.h;
  const ox = box ? box.x : 0;
  const oy = box ? box.y : 0;
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 1 || Y < 1 || X >= W - 1 || Y >= H - 1) return;
    const bx = X - ox;
    const by = Y - oy;
    // (never, the box being as it should: tests/rime_shade_box.test.ts)
    if (bx < 0 || by < 0 || bx >= px.w || by >= px.h) return;
    if (under && px.d[(by * px.w + bx) * 4 + 3] !== 0) return;
    px.set(bx, by, c);
  };
}

/**
 * THE MARK, `t` seconds into its breath (`RS_BREATH`): laid out from it toward you from `RS_BREATH.mark` over `markIn`, its
 * edges dashed in the enemy's pink, a chevron down it every tile; brighter as it is about to come; where the rime has crept
 * over it, gone under the rime. Gone with the line. `box`: only that part of the canvas painted (lineBox), the picture that big.
 */
export function markPainted(t: number, view: View, turn = 0, box: FxBox = wholeFx()): Px {
  const fxAt = (v: View, a: number, b: number, up = 0): [number, number] => fxAtTurned(v, a, b, up, turn);
  const px = new Px(box.w, box.h);
  const since = t - RS_BREATH.mark;
  if (since < 0) return px;
  const after = t - RS_BREATH.hit;
  if (after > RIME_LINE.long / RIME_LINE.pace + 0.1) return px;
  const dot = pen(px, true, box);
  const { from, long, half } = RIME_LINE;
  const upTo = from + long * smooth(since / RIME_LINE.markIn);
  const front = lineFront(after) ?? -1;
  // (pulsing brighter in its last moments before it comes)
  const hot = t > RS_BREATH.warn[1] - 0.2 && t < RS_BREATH.hit && Math.floor(t * 15) % 2 === 0;
  for (let a = from; a <= upTo; a += 0.05) {
    if (a < front + 0.15) continue;
    const i = Math.round(a / 0.05);
    if (i % 5 >= 3) continue;
    for (const sd of [1, -1]) {
      const [x, y] = fxAt(view, a, sd * half);
      dot(x, y, hot ? FX_PINK[1] : FX_PINK[0]);
      dot(x + 1, y, FX_PINK[0]);
      dot(x, y + 1, FX_PINK[2]);
      dot(x + 1, y + 1, FX_PINK[2]);
    }
  }
  // its end, across it
  if (upTo >= from + long - 0.01) {
    for (let s = -half; s <= half; s += 0.06) {
      const [x, y] = fxAt(view, from + long, s);
      dot(x, y, FX_PINK[0]);
      dot(x + 1, y, FX_PINK[2]);
    }
  }
  // its chevrons, pointing down it, every tile
  for (let a = from + 0.7; a <= upTo - 0.2; a += 1.0) {
    if (a < front + 0.3) continue;
    for (let s = -1; s <= 1; s += 0.07) {
      const [x, y] = fxAt(view, a - Math.abs(s) * 0.3, s * half * 0.62);
      dot(x, y, hot ? FX_PINK[1] : FX_PINK[0]);
      dot(x + 1, y, FX_PINK[0]);
      dot(x, y + 1, FX_PINK[2]);
    }
  }
  return px;
}

/** The crystals of the line: where each stands (tiles along, tiles to the side), how tall at its tallest (picture pixels), how wide, how it leans; along every 0.2 tiles, two or three across. */
const CRYSTALS: { a: number; s: number; tall: number; w: number; lean: number; seed: number }[] = ((): { a: number; s: number; tall: number; w: number; lean: number; seed: number }[] => {
  const out: { a: number; s: number; tall: number; w: number; lean: number; seed: number }[] = [];
  let seed = 0;
  for (let a = RIME_LINE.from + 0.05; a <= RIME_LINE.from + RIME_LINE.long; a += 0.2) {
    const n = 2 + (hash(Math.round(a * 50), 1, 9101) > 0.5 ? 1 : 0);
    for (let j = 0; j < n; j++) {
      const h = hash(seed, 2, 9101);
      const s = (j - (n - 1) / 2) * 0.32 + (hash(seed, 3, 9101) - 0.5) * 0.16;
      out.push({ a: a + (hash(seed, 4, 9101) - 0.5) * 0.12, s, tall: 15 + 13 * h - 7 * Math.abs(s), w: 2 + Math.round(2 * hash(seed, 5, 9101)), lean: s * 7 + (hash(seed, 6, 9101) - 0.5) * 3, seed });
      seed++;
    }
  }
  return out;
})();
/** How tall a crystal stands `age` seconds after the front reached it (a share of its tallest): spiking up as the front comes, settling into the crust, melting away. */
export function crystalUp(age: number): number {
  if (age < 0) return 0;
  const spike = age < 0.06 ? 1 - (1 - age / 0.06) ** 2 : 1;
  const settle = 1 - 0.72 * smooth((age - 0.12) / 0.45);
  return spike * settle * rimeLeft(age);
}

/**
 * THE LINE OF RIME, `t` seconds after it breathes out (from where the Rime Shade stood, as it faced). 'floor': the crust of
 * rime, feathered, its edges flecked with the enemy's pink, a bright edge at its creeping front (under the figures). 'air':
 * the crystals standing up out of it, spiking up at its front, settled behind, melting (sorted with the figures: `near`
 * 'behind' only those farther from the eye than a point `at` tiles along it, 'before' only those nearer, 'all' every one).
 * `box`: only that part of the canvas painted (lineBox), the picture that big, its lights where they are on it.
 */
export function linePainted(t: number, view: View, layer: 'floor' | 'air', near: 'behind' | 'before' | 'all' = 'all', at = 0, turn = 0, box: FxBox = wholeFx()): { px: Px; lights: Light[] } {
  const fxAt = (v: View, a: number, b: number, up = 0): [number, number] => fxAtTurned(v, a, b, up, turn);
  const px = new Px(box.w, box.h);
  const lights: Light[] = [];
  const front = lineFront(t);
  if (front === null || t > LINE_GONE + 0.05) return { px, lights };
  const dot = pen(px, false, box);
  const under = pen(px, true, box);
  const { from, half } = RIME_LINE;
  const fr = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    // the crust: dense in its middle, ragged at its edges; feathers of frost branching out across it
    for (let a = from; a <= front; a += 0.035) {
      const reached = reachesAt(a) ?? 0;
      const age = t - reached;
      const left = rimeLeft(age);
      if (left <= 0.02) continue;
      const k = Math.round(a / 0.035);
      // (its edge on either side, ragged, melting in from its edges)
      const edge = half * (0.78 + 0.22 * hash(k, 1, 9111)) * (0.35 + 0.65 * left);
      for (let s = -edge; s <= edge; s += 0.05) {
        const j = Math.round(s / 0.05);
        const hh = hash(k, j, 9113);
        if (hh > 0.5 + 0.5 * left) continue;
        const [x, y] = fxAt(view, a, s);
        const mid = 1 - Math.abs(s) / Math.max(0.05, edge);
        under(x, y, hh < 0.22 ? RS_FROST[4] : mid > 0.35 ? RS_FROST[3] : hh < 0.55 ? RS_FROST[2] : RS_FROST[1]);
        under(x + 1, y, mid > 0.3 ? RS_FROST[3] : RS_FROST[2]);
        under(x, y + 1, mid > 0.5 ? RS_FROST[2] : RS_FROST[1]);
      }
      // (its edge flecked with the enemy's pink while it lies whole)
      if (left > 0.6 && k % 3 === 0) {
        for (const sd of [1, -1]) {
          const [x, y] = fxAt(view, a, sd * edge * 1.02);
          dot(x, y, k % 6 === 0 ? FX_PINK[0] : FX_PINK[2]);
        }
      }
      // (feathers: branching lines of frost out across it, every so often)
      if (k % 9 === 0 && left > 0.3) {
        for (const sd of [1, -1]) {
          for (let q = 0; q < 10; q++) {
            const u = q / 10;
            const [x, y] = fxAt(view, a + u * 0.18, sd * u * edge * 0.95);
            dot(x, y, RS_FROST[4]);
          }
        }
      }
    }
    // the creeping front: a bright edge of new frost across it, spreading, while it creeps
    if (front < from + RIME_LINE.long - 1e-6 || t < RIME_LINE.long / RIME_LINE.pace + 0.1) {
      for (let s = -half * 1.05; s <= half * 1.05; s += 0.03) {
        const wob = 0.06 * Math.sin(s * 19 + fr * 1.7);
        for (let d = 0; d < 0.12; d += 0.03) {
          const [x, y] = fxAt(view, front + wob - d, s);
          dot(x, y, d < 0.03 ? '#ffffff' : RS_FROST[4]);
        }
      }
      // (frost-smoke rising off the front)
      for (let i = 0; i < 14; i++) {
        const life = ((t * 2.4 + i / 14) % 1 + 1) % 1;
        const s = (hash(i, 7, 9115) - 0.5) * 2 * half;
        const [x, y] = fxAt(view, front - 0.2 * life, s, 4 + 18 * life);
        if (life < 0.7) dot(x, y, life < 0.3 ? RS_FROST[4] : RS_FROST[3]);
      }
      const [lx, ly] = fxAt(view, front, 0);
      lights.push({ x: lx - box.x, y: ly - 6 - box.y, r: 30, color: RS_FROST[3], a: 0.16 });
    }
    return { px, lights };
  }
  // THE CRYSTALS: jagged wedges of ice standing up out of it, leaning out from its middle; tall at the front, settled behind; glinting
  const atSeen = fxAt(view, at, 0)[1];
  for (const c of CRYSTALS) {
    if (c.a > front) continue;
    const age = t - (reachesAt(Math.max(from, c.a)) ?? 0);
    const up = crystalUp(age);
    if (up <= 0.03) continue;
    const [bx, by] = fxAt(view, c.a, c.s);
    if (near === 'behind' && by > atSeen) continue;
    if (near === 'before' && by <= atSeen) continue;
    const tall = Math.max(2, Math.round(c.tall * up));
    const lean = c.lean * (view === 'front' ? 1 : -1);
    const big = up > 0.55;
    for (let h = 0; h < tall; h++) {
      const ww = Math.max(0, Math.round(c.w * (1 - h / tall)));
      const cx = bx + (lean * h) / Math.max(1, tall);
      for (let x = -ww; x <= ww; x++) dot(cx + x, by - h, x < 0 ? RS_FROST[3] : x === 0 ? RS_FROST[4] : RS_ICE[1]);
      // (its edge: the ice's own dark; the enemy's pink at its foot while it stands tall)
      dot(cx - ww - 1, by - h, RS_FROST[1]);
      dot(cx + ww + 1, by - h, h < 2 && big && c.seed % 2 === 0 ? FX_PINK[0] : RS_FROST[0]);
    }
    // (a crack across it, and a glint at its point)
    if (tall > 6) dot(bx + (lean * 0.45), by - Math.round(tall * 0.45), RS_FROST[1]);
    if ((fr + c.seed) % 7 < 2 || age < 0.1) dot(bx + lean, by - tall, '#ffffff');
  }
  return { px, lights };
}

// =============================================================================================
// FROZEN IN PLACE: the frost closing over the hero's feet and legs

/** Its canvas (its anchor the hero's floor point). */
export const FROZEN_CANVAS = { w: 120, h: 110, ax: 60, ay: 84 } as const;
/** The ice round his legs: plates standing round them on a ring, each its place on the ring, how tall, how wide, how far it leans in over him. */
const PLATES = Array.from({ length: 13 }, (_, i) => {
  const a = (i / 13) * TAU + 0.35 * hash(i, 1, 9121);
  return { a, tall: 19 + 10 * hash(i, 2, 9121), w: 2 + Math.round(2.2 * hash(i, 3, 9121)), lean: 4 + 3 * hash(i, 4, 9121), seed: i };
});
/** How far the ice has closed over him `t` seconds after the front reached him (0 none, 1 closed): in two frames; then climbing a little higher while he is held. */
export function frozenUp(t: number): number {
  if (t < 0 || t >= FROZEN.hold) return 0;
  const shut = t <= FROZEN.close ? t / FROZEN.close : 1;
  return shut * (0.86 + 0.14 * smooth((t - FROZEN.close) / 0.3));
}
/**
 * THE FROST OVER THE HERO, `t` seconds after the line's front reached him (at his floor point; from in front or behind as the
 * game shows him): the rime on the floor under him; jagged plates of ice shot up round his feet and legs in two frames,
 * leaning in over his shins, glinting, cracking as he is about to be let go; at `FROZEN.hold` they shatter, their pieces flung
 * and falling, gone by `FROZEN.hold + FROZEN.shatter`. `half`: 'far' (behind him: drawn under him), 'near' (before him:
 * over him), or 'all'.
 */
export function frozenPainted(t: number, view: View, half: 'far' | 'near' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = FROZEN_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > FROZEN.hold + FROZEN.shatter) return { px, lights };
  const dot = pen(px);
  const under = pen(px, true);
  const at = (x: number, y: number): [number, number] => [C.ax + x, C.ay + y];
  const fr = Math.floor(t * 30 + 1e-6);
  const flip = view === 'back' ? -1 : 1;
  // the rime under him (far: it is on the floor)
  if (half !== 'near' && t < FROZEN.hold + 0.1) {
    const r = 16 * Math.min(1, t / FROZEN.close + 0.3);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * TAU;
      const rr = r * (0.75 + 0.25 * hash(i, 1, 9131));
      for (let q = 0; q < rr; q += 1.5) {
        if (hash(i, Math.round(q), 9133) > 0.55) continue;
        const [x, y] = at(Math.cos(a) * q, Math.sin(a) * q * 0.5);
        under(x, y, q < rr * 0.5 ? RS_FROST[4] : RS_FROST[3]);
      }
      if (i % 3 === 0) {
        const [x, y] = at(Math.cos(a) * rr, Math.sin(a) * rr * 0.5);
        dot(x, y, FX_PINK[0]);
      }
    }
  }
  const up = frozenUp(t);
  const broke = t - FROZEN.hold;
  for (const p of PLATES) {
    const sn = Math.sin(p.a);
    const isNear = sn >= 0;
    if (half === 'far' && isNear) continue;
    if (half === 'near' && !isNear) continue;
    const bx0 = Math.cos(p.a) * 9 * flip;
    const by0 = sn * 4.5;
    const [bx, by] = at(bx0, by0);
    // (leaning in over him: its point toward his middle)
    const lean = -Math.cos(p.a) * p.lean * flip;
    const tall = Math.round(p.tall * up);
    if (broke < 0) {
      if (tall < 1) continue;
      for (let h = 0; h < tall; h++) {
        const k = h / tall;
        const ww = Math.max(0, Math.round(p.w * (1 - k * 0.85)));
        const cx = bx + lean * k;
        for (let x = -ww; x <= ww; x++) dot(cx + x, by - h, x < -ww / 2 ? RS_FROST[3] : x <= 0 ? RS_FROST[4] : x < ww ? RS_ICE[2] : RS_ICE[1]);
        dot(cx - ww - 1, by - h, RS_FROST[1]);
        dot(cx + ww + 1, by - h, h < 3 && p.seed % 2 === 0 ? FX_PINK[0] : RS_FROST[0]);
      }
      // (cracks running up it as he is about to be let go; a glint)
      if (t > FROZEN.hold - 0.22) for (let h = 2; h < tall; h += 3) dot(bx + lean * (h / tall) + ((h + p.seed) % 2 ? 1 : -1), by - h, RS_FROST[0]);
      else if ((fr + p.seed) % 9 === 0) dot(bx + lean, by - tall + 1, '#ffffff');
    } else {
      // (shattered: its pieces flung out and falling, gone before they lie)
      for (let j = 0; j < 5; j++) {
        const aa = p.a + (hash(p.seed, j, 9135) - 0.5) * 1.4;
        const sp = 40 + 40 * hash(p.seed, j + 5, 9135);
        const x = bx + Math.cos(aa) * sp * broke * flip;
        const y = by - p.tall * (j / 5) + Math.sin(aa) * sp * broke * 0.5 - 70 * broke + 260 * broke * broke;
        if (hash(p.seed, j + 9, 9135) < broke / FROZEN.shatter || y > by + 6) continue;
        dot(x, y, j % 2 ? RS_FROST[4] : RS_ICE[3]);
        dot(x + 1, y, j % 3 ? RS_FROST[2] : FX_PINK[1]);
      }
    }
  }
  if (broke < 0 && up > 0.5) lights.push({ x: C.ax, y: C.ay - 10, r: 32, color: RS_FROST[3], a: 0.14 });
  return { px, lights };
}
