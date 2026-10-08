// Shared by the tests. (This is not a test file: `tsx --test tests/*.test.ts` does not pick it up.)
//
// 1. For the tests that press an attack and then look at what came of it: `land`.
//    Since Version 11 an attack takes a moment to make (the owner: "spells have a cast time even
//    if they are really short"): pressing it only begins it, and the blow lands, the arrow leaves,
//    the spell goes off when its wind-up is over (Hero.windup in src/game/state.ts). A test that
//    wants to see what an attack does steps the game on until it has landed.
//
// 2. For the tests that look at painted frames: `paintWithoutCanvas`, `paintingOf`, `unlike`.
//    A frame of a hero is painted as plain numbers (a Px) and only then put on a canvas, which
//    is what a Sprite holds; and there is no canvas outside a browser.

import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { Game } from '../src/game/game';
import type { Controls } from '../src/game/state';

/** No attack takes this long to land: the slowest wind-up in the game is about a quarter of a second. */
export const LAND_LIMIT = 1;

/**
 * Let the attack the hero has begun land: step the game on until nothing is being wound up, and
 * return how many steps that took (none, if no attack had been begun).
 *
 * `c` is what the player does meanwhile. Let go of the attack first (c.fire = c.cast = false), as
 * the tests did before there was a wind-up. (A slow attack asked for during the quick one's
 * wind-up follows it at once: then this waits for both.)
 * `each` is called after every step: to collect the events, or to check that nothing goes wrong
 * on the way.
 *
 * An attack that has still not landed after LAND_LIMIT seconds is an error, not a wait.
 */
export function land(g: Game, c: Controls, dt: number, each?: () => void): number {
  let steps = 0;
  while (g.hero.windup !== null) {
    if (steps * dt >= LAND_LIMIT) throw new Error(`an attack begun ${LAND_LIMIT} s ago has still not landed`);
    g.update(dt, c);
    steps++;
    if (each) each();
  }
  return steps;
}

/**
 * Let frames be painted where there is no canvas: from now on, in this test file's own process,
 * the "canvas" of every Sprite made from a painting is the painting itself. Nothing else about
 * how a frame is made changes (it is trimmed, anchored and given its lights and tails by the
 * code under test), so a test can read the very frame the game would show, pixel by pixel.
 * Call it once, at the top of a test file that paints.
 */
export function paintWithoutCanvas(): void {
  (Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
    return this;
  };
}

/** The painting behind a Sprite that was made after `paintWithoutCanvas()`: its pixels, in picture pixels. */
export function paintingOf(s: Sprite): Px {
  const p = s.img as unknown;
  if (!(p instanceof Px)) throw new Error('this sprite was not painted under paintWithoutCanvas()');
  return p;
}

/**
 * How many picture pixels differ between two frames of one figure when each is laid down with its
 * anchor on the same spot, as the game lays them down. 0 = the same picture in the same place.
 */
export function unlike(a: Sprite, b: Sprite): number {
  const pa = paintingOf(a);
  const pb = paintingOf(b);
  const da = a.density ?? 1;
  const db = b.density ?? 1;
  if (da !== db) throw new Error('frames of different grain');
  // where each painting's top left corner falls, measured from the anchor, in picture pixels
  const ax = Math.round(a.ax * da);
  const ay = Math.round(a.ay * da);
  const bx = Math.round(b.ax * db);
  const by = Math.round(b.ay * db);
  let n = 0;
  for (let y = Math.min(-ay, -by); y < Math.max(pa.h - ay, pb.h - by); y++) {
    for (let x = Math.min(-ax, -bx); x < Math.max(pa.w - ax, pb.w - bx); x++) {
      if (pa.get(x + ax, y + ay) !== pb.get(x + bx, y + by)) n++;
    }
  }
  return n;
}
