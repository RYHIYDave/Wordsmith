// THE MAGE BROUGHT UP, A MOMENT OF A MOVE PAINTED (the art chat's helper, 7 Nov 2026; behind art/mage_up.ts MAGE_UP, off).
// Stage 1: a moment of any of her moves, from any of her eight sides, with the figure a frame and three frames before (cloth
// follows) and the wind, as art/ranger_up_art.ts paints the Ranger. Her lists in the game's shape (as makeRangerUpArt gives his)
// come in stage 2.

import type { Move3 } from './moves3';
import { bonesAt, solve } from './skeleton';
import type { Posed, Skeleton } from './skeleton';
import { lightsOut } from './kit';
import { paintMageUp } from './mage_up';
import type { MuFrame, MuSide } from './mage_up';

const FRAME = 1 / 30;
/** How long the wind takes to go once round, where nothing else decides it (as art/heroes3.ts WIND). */
const WIND = 1.2;

function spanOf(m: Move3): { end: number; from: number | undefined } {
  const k = m.motion.keys;
  return { end: k.length ? k[k.length - 1].at : 0, from: m.motion.loop };
}
/** Where the wind has got to (0..1): as art/heroes3.ts windAt, so the cloth does not jump where a loop closes. */
function windOf(m: Move3, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : end;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / WIND));
  const k = ((t - (from ?? 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}
export function muPosed(m: Move3, t: number): { q: Posed; s: Skeleton } {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let when = Math.max(0, t);
  if (from !== undefined && long > 1e-6 && when >= end) when = from + ((when - from) % long);
  const q = bonesAt(m.motion.keys, m.rest, when);
  return { q, s: solve(m.build, q) };
}
function before(m: Move3, t: number, back: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let w = t - back;
  if (from !== undefined && long > 1e-6 && w < from && end > from) w += long;
  return Math.max(0, w);
}

/** HER AT A MOMENT OF A MOVE, painted: with the figure a frame and three frames before (cloth follows), and the wind. */
export function paintMuMove(m: Move3, t: number, view: MuSide, rim: string | null | undefined = undefined): MuFrame {
  const { q, s } = muPosed(m, t);
  const prev = muPosed(m, before(m, t, FRAME));
  const past = muPosed(m, before(m, t, 3 * FRAME)).s;
  const f = paintMageUp(s, q, view, m.build, { prev: prev.s, past, wind: windOf(m, t) }, rim === undefined ? undefined : rim);
  if (q.out > 0.01) return { ...f, ...lightsOut(f, q.out) };
  return f;
}
