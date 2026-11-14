// FLOOR 9'S SIDE BOSS, THE MIST WOLF (docs/mockups/f9_side_bosses/README.md has every word of his). A MOCK-UP: nothing of the game
// imports this file yet. His task, 13 Nov 2026: “I need two side bosses for level 9 ... I was a spectral wolf boss” (read: I want); his
// pick of its look, “Giant mist wolf (Recommended)”, offered as: twice the size of the floor's wolves, pale and see-through, trailing
// mist, pink eyes; its ghost glow the enemy's pink (cyan is the friend's).
//
// MADE FROM THE FOG WOLF (art/fog_wolves.ts, the art chat's, his yes to it): the same solids and the same poses, the whole of it made
// MIST_K times as big from its floor point (its solids, its fraying fog and its loose wisps alike); its fog paler, a ghost's, nearly
// white at its brightest, a cold violet in its shadow; more of it streaming off him, and lying round his feet; his eyes the enemy's
// pink to gold, burning. Its edge the enemy's pink while it lives. Nothing cyan.
//
// THIS FIRST STEP: his look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before anything moves).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Shape } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';
import { FOG, PIVOT, WISP, basePose, eyeOf, grainsOf, laid, thinned, wolfSolids, worldOf } from './fog_wolves';

/** THE SWITCH, OFF: nothing of the game reads this file yet. */
export const MIST_WOLF = { on: false };

/** How much bigger he is than the floor's fog wolves: twice (his pick). */
export const MIST_K = 2.1;
/** His canvas: the fog wolf's, made as much bigger, and room for his mist round him. */
export const MIST_CANVAS = { w: 440, h: 360, ax: 214, ay: 270 };
export const MIST_AURA = { x: MIST_CANVAS.ax, y: MIST_CANVAS.ay - 40, r: 70, color: '#ff3a78', a: 0.12 };

/** His fog, paler than his wolves': a ghost's, near white at its brightest, a cold violet in its shadow. */
export const MIST: readonly string[] = ['#4e4a66', '#706c8c', '#9894b2', '#c4c0d8', '#eceaf6'];
const MIST_WISP: readonly string[] = ['#f4f2fa', '#e2def0', '#cac6dc', '#b2aec8', '#9a96b4'];

const P3 = (p: V3, k: number): V3 => [p[0] * k, p[1] * k, p[2] * k];
/** A solid made `k` times as big from the floor point. */
function grownShape(sh: Shape, k: number): Shape {
  const R = (r: { c: V3; u: V3; v: V3; pts?: ReadonlyArray<V3> }) => ({ ...r, c: P3(r.c, k), u: P3(r.u, k), v: P3(r.v, k), pts: r.pts ? r.pts.map((p) => P3(p, k)) : undefined });
  switch (sh.k) {
    case 'rod':
      return { ...sh, a: P3(sh.a, k), b: P3(sh.b, k), ra: sh.ra * k, rb: sh.rb * k };
    case 'ball':
      return { ...sh, c: P3(sh.c, k), ax: [P3(sh.ax[0], k), P3(sh.ax[1], k), P3(sh.ax[2], k)] };
    case 'cloth':
      return { ...sh, rings: sh.rings.map(R) };
    case 'band':
      return { ...sh, ring: R(sh.ring) };
    case 'panel':
      return { ...sh, c: P3(sh.c, k), u: P3(sh.u, k), v: P3(sh.v, k) };
    case 'thread':
      return { ...sh, a: P3(sh.a, k), b: P3(sh.b, k), lift: sh.lift * k };
    case 'dot':
      return { ...sh, p: P3(sh.p, k) };
    case 'teeth':
      return { ...sh, pts: sh.pts.map((p) => P3(p, k)) };
    case 'mote':
      return { ...sh, p: P3(sh.p, k) };
    case 'glow':
      return { ...sh, p: P3(sh.p, k), r: sh.r * k };
    case 'greatsword':
      return { ...sh, grip: P3(sh.grip, k) };
  }
}
/** A stage that lays a point of the fog wolf's own lengths where it is on him, MIST_K times as big. */
function grownStage(st: Stage, k: number): Stage {
  return { ...st, at: (p: V3) => st.at(P3(p, k)) } as Stage;
}
/** Each of the fog wolf's colours as his own (its fog, its wisps, the mist its thinning leaves). */
const RECOLOUR = new Map<string, string>([
  ...FOG.map((c, i) => [c.toLowerCase(), MIST[i]] as [string, string]),
  ...WISP.map((c, i) => [c.toLowerCase(), MIST_WISP[i]] as [string, string]),
  ['#cac6d0', MIST[4]],
]);
function recoloured(px: Px): void {
  for (let i = 0; i < px.d.length; i += 4) {
    if (px.d[i + 3] === 0) continue;
    const hex = '#' + [px.d[i], px.d[i + 1], px.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    const to = RECOLOUR.get(hex);
    if (!to) continue;
    px.d[i] = parseInt(to.slice(1, 3), 16);
    px.d[i + 1] = parseInt(to.slice(3, 5), 16);
    px.d[i + 2] = parseInt(to.slice(5, 7), 16);
  }
}

/** One frame of him: `which` (stand for now), `t` seconds in, from in front or behind. */
export function mistWolfPainted(which: string, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const k = MIST_K;
  const P = basePose(which, t);
  const bits: Bit[] = wolfSolids(which, t, view).map((b) => ({ ...b, shape: grownShape(b.shape, k) }));
  const C = MIST_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const lights = paintBits(st, bits, P3(worldOf(P, PIVOT), k));
  const px = st.whole(ENEMY_RIM);
  const big = grownStage(st, k);
  thinned(px, big, P);
  recoloured(px);
  // (his loose mist: the fog wolf's, as big as he is, twice over, a moment apart, so that more of it streams off him)
  for (const dt of [0, 0.37]) {
    for (const [p, col, size] of grainsOf(which, t + dt)) laid(px, big, p, RECOLOUR.get(col.toLowerCase()) ?? col, size + 1);
  }
  return { px, lights };
}
/** The same frame as the game holds a figure. */
export function mistWolfFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(mistWolfPainted(which, t, view), MIST_AURA, MIST_CANVAS.ax, MIST_CANVAS.ay);
}
