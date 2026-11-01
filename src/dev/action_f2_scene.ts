// Pictures of FLOOR 2'S ENEMIES' NEW MOVES AND THE HEADSMAN'S MEND, put together for the owner (the sheet, the film's frames): the
// cultist's fire sigil (art/monster_cultist.ts CULTIST_SIGIL; on the floor, art/action_f2_fx.ts), the Shade's frost rake and its
// rime (art/action_f2_fx.ts SHADE_FROST), and the Headsman before and after his axe was mended (art/headsman2.ts AXE_HELD), on a
// stand-in floor of old stone flags (floor 1's: dev/action_f1_scene.ts), with the knight for size, each figure at its floor point
// and sorted by it, as the game sorts them. Plain pixels (Px): made outside a browser (tools/action_f2_film.ts). Nothing of the
// game imports it.

import type { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { CULTIST_SIGIL, SIGIL_SLAM, makeCultistArt } from '../art/monster_cultist';
import { RIME, RIME_CANVAS, SIGIL, SIGIL_CANVAS, makeFrostShadeArt, rimePainted, sigilPainted } from '../art/action_f2_fx';
import type { View } from '../art/action_f1_fx';
import { SHADE_HIT } from '../art/new_mobs3';
import { AXE_HELD } from '../art/headsman2';
import { HEADSMAN_2, headsman2Mob } from '../art/headsman2_moves';
import type { Mob } from '../art/new_mobs3';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameOf, knight, spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

let CULTIST: ActorArt | null = null;
let SHADE: ActorArt | null = null;
/** The cultist and the Shade as the game would hold them with the new moves' switches on. */
export function figures(): { cultist: ActorArt; shade: ActorArt } {
  if (!CULTIST) {
    const c = CULTIST_SIGIL.on;
    CULTIST_SIGIL.on = true;
    try {
      CULTIST = makeCultistArt();
    } finally {
      CULTIST_SIGIL.on = c;
    }
  }
  SHADE ??= makeFrostShadeArt();
  return { cultist: CULTIST, shade: SHADE };
}
/** A frame of a figure: standing (its loop at its own frames a second) or its attack (at 30 a second), `t` seconds in. */
export function frameAt(art: ActorArt, view: View, move: 'stand' | 'attack', t: number): Laid {
  const set = view === 'front' ? art.front : art.back;
  let sp: Sprite;
  if (move === 'stand') sp = set.idle[Math.floor(t * (set.idleFps ?? 10)) % set.idle.length];
  else {
    const c = set.clips?.attack as Clip;
    sp = c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
  }
  return spriteLaid(sp);
}
const longOf = (art: ActorArt): number => (art.front.clips?.attack as Clip).frames.length / 30;

/** A pass: where the figure stands, where the knight stands (tiles from the scene's middle), how each is seen. */
export interface Pass {
  view: View;
  at: [number, number];
  knight: [number, number];
  knightView: View;
}
/** The cultist faces the knight from 3.5 tiles off; the sigil comes down under him. */
export const SIGIL_FRONT: Pass = { view: 'front', at: [-2.5, 0], knight: [1, 0], knightView: 'back' };
export const SIGIL_BACK: Pass = { view: 'back', at: [0, 2.5], knight: [0, -1], knightView: 'front' };
/** How long each stands before it begins (seconds). */
export const LEAD = 0.4;

/** The cultist's scene at `t` seconds of its pass (it begins its cast at LEAD), the scene's middle at (cx, cy). */
export function sigilScene(p: Pass, t: number, base: Px, cx: number, cy: number, k = 1): Px {
  const { cultist } = figures();
  const m = t - LEAD;
  const long = longOf(cultist);
  const c = m >= 0 && m < long ? frameAt(cultist, p.view, 'attack', m) : frameAt(cultist, p.view, 'stand', Math.max(0, m < 0 ? t : m - long));
  const since = m - SIGIL_SLAM;
  const C = SIGIL_CANVAS;
  const A = onFloor(p.at[0], p.at[1], cx, cy, k);
  const K = onFloor(p.knight[0], p.knight[1], cx, cy, k);
  const floor = [{ at: K, l: laid(sigilPainted(since, 'floor'), C.ax, C.ay) }];
  const stood: Stood[] = [
    { at: A, l: c, shadow: 9 },
    { at: K, l: knight(p.knightView, Math.floor(t * 6)), flip: true, shadow: 9 },
    { at: [K[0], K[1] - 0.5], l: laid(sigilPainted(since, 'air', SIGIL.radius, 'behind'), C.ax, C.ay) },
    { at: [K[0], K[1] + 0.5], l: laid(sigilPainted(since, 'air', SIGIL.radius, 'before'), C.ax, C.ay) },
  ];
  return compose(base, floor, stood, k);
}

/** The Shade rakes the knight before it; the rime spreads where it rakes. */
export const FROST_FRONT: Pass = { view: 'front', at: [-0.8, 0], knight: [0.3, 0], knightView: 'back' };
export const FROST_BACK: Pass = { view: 'back', at: [0, 0.8], knight: [0, -0.3], knightView: 'front' };
/** Where the rime lies for a pass: RIME.ahead tiles before the Shade, the way it faces. */
export const rimeAt = (p: Pass): [number, number] => (p.view === 'front' ? [p.at[0] + RIME.ahead, p.at[1]] : [p.at[0], p.at[1] - RIME.ahead]);

/** The Shade's scene at `t` seconds of its pass (it begins its rake at LEAD); `knightAt` moves the knight (as he walks out of the rime, slowed). */
export function frostScene(p: Pass, t: number, base: Px, cx: number, cy: number, k = 1, knightAt: [number, number] = p.knight): Px {
  const { shade } = figures();
  const m = t - LEAD;
  const long = longOf(shade);
  const s = m >= 0 && m < long ? frameAt(shade, p.view, 'attack', m) : frameAt(shade, p.view, 'stand', Math.max(0, m < 0 ? t : m - long));
  const since = m - SHADE_HIT;
  const [rx, ry] = rimeAt(p);
  const floor = [{ at: onFloor(rx, ry, cx, cy, k), l: laid(rimePainted(since), RIME_CANVAS.ax, RIME_CANVAS.ay) }];
  const stood: Stood[] = [
    { at: onFloor(p.at[0], p.at[1], cx, cy, k), l: s, shadow: 7 },
    { at: onFloor(knightAt[0], knightAt[1], cx, cy, k), l: knight(p.knightView, Math.floor(t * 6)), flip: true, shadow: 9 },
  ];
  return compose(base, floor, stood, k);
}

// ---------------------------------------------------------------------------------------------
// THE HEADSMAN, BEFORE AND AFTER: as he was (AXE_HELD off, made and painted so) and as he is (the game's, the mend on)

let WAS: Mob | null = null;
/** A frame of the Headsman's move `move`, `t` seconds in: as he was before the mend, or as he is. */
export function headsmanFrame(was: boolean, move: string, t: number, view: View): Laid {
  if (!was) return frameOf(HEADSMAN_2, move, t, view);
  const on = AXE_HELD.on;
  AXE_HELD.on = false;
  try {
    WAS ??= headsman2Mob();
    return frameOf(WAS, move, t, view);
  } finally {
    AXE_HELD.on = on;
  }
}
