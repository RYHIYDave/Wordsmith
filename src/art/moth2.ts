// FLOOR 20'S BOSS, THE MOTH, MADE GHOSTLY: HER NEW ATTACKS, WHERE THEY STRIKE (the rules, game/act1_rules/moth.ts, and what draws
// them, art/moth2_fx.ts and render/act1_fx/moth.ts, both take these numbers and shapes from here). Behind MOTH2, off until his yes.
//
// His words, 14 Nov 2026, 16:13 (Eastern): “as of right now the moth is the end boss of the compaign so it needs to be good.  dont
// make mistakes, make some cool original attacks.  very ethereal”. The set offered him, his pick “Yes, build these (Recommended)”:
//   GHOST WING (her basic, the buffet's own cone): as her wing comes down, a see-through ghost of her wings, their eyes and all,
//     breaks away and sweeps the ground before her.
//   ECLIPSE (in place of the Eyes' beams; her Eyes' own moves): a pale moon rises behind her; her shadow is thrown huge across the
//     top toward him; the eyes on her wings open in it; then the whole shadow strikes. Out into the moonlight, and it misses.
//   PHANTOMS (in place of the Swarm; her Swarm's own moves): three see-through copies of her peel away and glide across the top
//     in long passes, one after another, each down a lane marked before it.
//   THE HUSH (her Dust, its own rules): glowing scales drift down like slow snow; in it his words go dark.
//   THE UNWRITING (on the book, in place of the beat's wind; its own ring): the last chapter's pages tear loose and wheel out
//     round her as a ring of pale burning pages over the whole top.
//   HER DEATH: her scream and the words flying home as they were; she comes apart into drifting light, not grey dust.
// Her look and her body's moves are as he said yes to them (art/moth.ts, art/moth_moves.ts).
//
// Lengths here are tiles of the floor: `u` before her (the way she strikes), `v` to her left.

import { inWing, wingRim, EYE_AT, LF, LH } from './moth';
import { MOTH_EYES, MOTH_SWARM } from './moth_moves';

/** HIS SWITCH (art/moth2_switch.ts, kept apart for her pictures to ask). */
export { MOTH2 } from './moth2_switch';

// =============================================================================================
// ECLIPSE

/**
 * ECLIPSE'S NUMBERS: the moon rising behind her and setting after (seconds into her Eyes' move); her shadow growing out across
 * the top (from `grow[0]` to `grow[1]`, from a share `from` of its size), the warning's pink edge from `warn` to the blow (the
 * move's own: MOTH_EYES.hit); what is left of it after the blow (the strike rising out of it, `after` seconds); how hard it hits.
 */
export const ECLIPSE = {
  moon: [0.05, 0.9] as const,
  grow: [0.15, 0.95] as const,
  from: 0.35,
  warn: MOTH_EYES.warn[0] - 0.2,
  hit: MOTH_EYES.hit,
  after: 1.15,
  dmg: 1.3,
  /** The shadow's size: her forewing this long in it (tiles), her hindwing, her thorax this far before her, her body. */
  fore: 5.6,
  hind: 4.0,
  thorax: 4.4,
  /** Her wings' angles in it (degrees from her way: forewings forward of square, hindwings behind). */
  foreAt: 76,
  hindAt: 128,
} as const;

/** A wing of the shadow (or of a phantom): its root, its way along its length and its way across, its length (tiles; `v` to her left). */
export interface FlatWing {
  hind: boolean;
  side: 1 | -1;
  root: readonly [number, number];
  along: readonly [number, number];
  across: readonly [number, number];
  len: number;
}
/** Her wings laid flat, as in her shadow: their roots at her thorax `T` (u), the forewings `fore` long, the hindwings `hind`. */
export function flatWings(T: number, fore: number, hind: number, foreAt: number = ECLIPSE.foreAt, hindAt: number = ECLIPSE.hindAt): FlatWing[] {
  const out: FlatWing[] = [];
  for (const side of [1, -1] as const) {
    for (const h of [false, true]) {
      const a = ((h ? hindAt : foreAt) * Math.PI) / 180;
      const along: [number, number] = [Math.cos(a), side * Math.sin(a)];
      // (across a wing is toward its trailing edge: behind her)
      const across: [number, number] = [-Math.sin(a), side * Math.cos(a)];
      if (across[0] > 0) {
        across[0] = -across[0];
        across[1] = -across[1];
      }
      out.push({ hind: h, side, root: [T, side * 0.32], along, across, len: h ? hind : fore });
    }
  }
  return out;
}
/** A point of a flat wing (`x`, `y`: shares of its length along it and across it), in the shadow's own (u, v). */
export function onFlat(w: FlatWing, x: number, y: number): [number, number] {
  return [w.root[0] + (w.along[0] * x + w.across[0] * y) * w.len, w.root[1] + (w.along[1] * x + w.across[1] * y) * w.len];
}
/** A wing's own outline (shares), kept once made. */
const RIMS = new Map<string, [number, number][]>();
function rimOf(hind: boolean, n: number): [number, number][] {
  const key = `${hind ? 1 : 0}:${n}`;
  let r = RIMS.get(key);
  if (!r) RIMS.set(key, (r = wingRim(hind, n)));
  return r;
}
/** A flat wing's outline (u, v), its root closing it. */
export function flatRim(w: FlatWing, n = 40): [number, number][] {
  return [onFlat(w, 0.02, 0.05), ...rimOf(w.hind, n).map(([x, y]) => onFlat(w, x, y))];
}
/** Whether (u, v) lies on a flat wing, and how far in (shares; less than nothing, outside). */
export function inFlat(w: FlatWing, u: number, v: number): number {
  const du = u - w.root[0];
  const dv = v - w.root[1];
  const x = (du * w.along[0] + dv * w.along[1]) / w.len;
  const y = (du * w.across[0] + dv * w.across[1]) / w.len;
  return inWing(w.hind, x, y);
}
/** An eye of a flat wing: its middle (u, v), its radius (tiles). */
export function flatEye(w: FlatWing): { u: number; v: number; r: number } {
  const e = EYE_AT[w.hind ? 'hind' : 'fore'];
  const [u, v] = onFlat(w, e.x, e.y);
  return { u, v, r: (e.r / (w.hind ? LH : LF)) * w.len };
}
/** Her body in the shadow: thorax, head, abdomen (ellipses: middle u, v, half their length along her and across). */
export function flatBody(T: number, k = 1): { u: number; v: number; ru: number; rv: number }[] {
  return [
    { u: T, v: 0, ru: 0.75 * k, rv: 0.62 * k },
    { u: T + 0.95 * k, v: 0, ru: 0.42 * k, rv: 0.4 * k },
    { u: T - 1.7 * k, v: 0, ru: 1.45 * k, rv: 0.55 * k },
  ];
}

/** How big her shadow is `t` seconds into her Eyes' move (a share of its whole size). */
export function eclipseSize(t: number): number {
  const [g0, g1] = ECLIPSE.grow;
  const k = Math.min(1, Math.max(0, (t - g0) / (g1 - g0)));
  return ECLIPSE.from + (1 - ECLIPSE.from) * (k * k * (3 - 2 * k));
}
/** Her shadow at its whole size: its wings and its body, in its own (u, v). */
export function eclipseShape(size = 1): { wings: FlatWing[]; body: { u: number; v: number; ru: number; rv: number }[] } {
  return { wings: flatWings(ECLIPSE.thorax * size, ECLIPSE.fore * size, ECLIPSE.hind * size), body: flatBody(ECLIPSE.thorax * size, size) };
}
/** Whether a point (u before her, v to her left, tiles) is in her shadow at its whole size. */
export function inEclipseAt(u: number, v: number): boolean {
  const S = eclipseShape();
  for (const w of S.wings) if (inFlat(w, u, v) >= 0) return true;
  for (const b of S.body) if (((u - b.u) / b.ru) ** 2 + ((v - b.v) / b.rv) ** 2 <= 1) return true;
  return false;
}
/** Whether (hx, hy) is in her shadow, cast from (x, y) toward (ax, ay) (a unit way), at the blow. */
export function inEclipse(x: number, y: number, ax: number, ay: number, hx: number, hy: number): boolean {
  const dx = hx - x;
  const dy = hy - y;
  return inEclipseAt(dx * ax + dy * ay, -dx * ay + dy * ax);
}
/** A point of the shadow's own (u, v) on the floor, cast from (x, y) toward (ax, ay). */
export function eclipseToWorld(x: number, y: number, ax: number, ay: number, u: number, v: number): [number, number] {
  return [x + ax * u - ay * v, y + ay * u + ax * v];
}

// =============================================================================================
// PHANTOMS

/**
 * PHANTOMS' NUMBERS: three of them, each down its own lane, the first at him and the others `fan` (radians) either side; each set
 * off `apart` seconds after the one before from her Swarm's burst (MOTH_SWARM.hit), `start` tiles before her, gliding `speed`
 * tiles a second for `long` tiles; striking him once each where its body passes over him (`reach` along its lane, `half` across);
 * how big each is (its forewing, its hindwing, tiles), how high it glides (game pixels), how hard it hits; their lanes marked
 * from `warn`.
 */
export const PHANTOMS = {
  n: 3,
  fan: 0.7,
  apart: 0.42,
  start: 1.0,
  speed: 11,
  long: 17,
  reach: 0.9,
  half: 2.0,
  fore: 2.6,
  hind: 1.9,
  high: 26,
  dmg: 0.8,
  warn: MOTH_SWARM.warn[0] - 0.2,
  hit: MOTH_SWARM.hit,
} as const;
/** The order they go in: down the middle lane (at him), then to her left, then to her right. */
export const PHANTOM_LANE: readonly number[] = [0, 1, -1];
/** A phantom's lane: its way (a unit), from her (x, y) aimed at (ax, ay). */
export function phantomWay(ax: number, ay: number, i: number): [number, number] {
  const a = Math.atan2(ay, ax) + PHANTOM_LANE[i] * PHANTOMS.fan;
  return [Math.cos(a), Math.sin(a)];
}
/** How far down its lane phantom `i` is `t` seconds after her Swarm's burst (tiles from her; less than its start, not yet set off). */
export function phantomAlong(i: number, t: number): number {
  const go = t - i * PHANTOMS.apart;
  return go < 0 ? -1 : PHANTOMS.start + go * PHANTOMS.speed;
}
/** How long the phantoms are about after the burst, the last of them gone off the end of its lane (seconds). */
export const PHANTOMS_LONG = (PHANTOMS.n - 1) * PHANTOMS.apart + (PHANTOMS.long - PHANTOMS.start) / PHANTOMS.speed + 0.3;
/** Whether phantom `i`, `t` seconds after the burst, from (x, y) aimed at (ax, ay), is over (hx, hy). */
export function phantomOver(x: number, y: number, ax: number, ay: number, i: number, t: number, hx: number, hy: number): boolean {
  const s = phantomAlong(i, t);
  if (s < PHANTOMS.start || s > PHANTOMS.long) return false;
  const [wx, wy] = phantomWay(ax, ay, i);
  const dx = hx - x;
  const dy = hy - y;
  const along = dx * wx + dy * wy;
  const across = -dx * wy + dy * wx;
  return Math.abs(along - s) <= PHANTOMS.reach && Math.abs(across) <= PHANTOMS.half;
}
