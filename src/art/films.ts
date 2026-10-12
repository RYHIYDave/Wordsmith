// THE FIRST FIVE FLOORS: THE FILMS OF A FLOOR, BY NAME, for whoever paints them: the painter's worker
// (render/painter.ts), or the game itself where there is no worker.
//
// A film is seconds of painting in one call, and tens of megabytes of pictures: a floor's moments
// (art/floor1.ts to floor5_moments.ts), the stairwell breaking open as its boss dies
// (art/stairwell_open.ts), the cage coming down the mine shaft and the ride up (art/shaft.ts). The art
// chat's makers make each the first time it is asked for and keep it. Here each has a key:
//   moments:<floor>            floors 1 to 3: all three of the floor's moments (they are made together)
//   moment:<floor>:<n>         floors 4 and 5: one of the floor's moments
//   stair:<floor>:<way>:<x>:<y>  the stairwell's opening on that floor, its steps going down toward +x
//                              or +y, its anchor on tile (x, y)
//   shaft:down, shaft:up       the cage coming down as the Fleshmancer dies; the ride up to town
// and comes as plain things and pictures (no functions), so that it can be handed from the worker to
// the page.

import type { Sprite } from '../engine/px';
import { CRYPT_FLOORS } from './crypt';
import { wardenMoments } from './floor1';
import { headsmanMoments } from './floor2';
import { chainedMoments } from './floor3';
import { ossuaryMoment } from './floor4';
import { lairMoment } from './floor5_moments';
import type { Moment } from './floorkit';
import { LAIR } from './lair';
import { cageDown, cageUp } from './shaft';
import { stairwellKicks, stairwellOpens } from './stairwell_open';

/** One of a floor's moments, as the game plays it. */
export interface MomentFilm {
  name: string;
  fps: number;
  /** The frames on which the screen is kicked and a blow is heard. */
  jolts: number[];
  frames: Sprite[];
  /** What is there before it plays (a loop or a still; none: nothing is), and what is left after. */
  before: Sprite[] | null;
  after: Sprite[] | null;
  /** The same for a wall's face turned to screen-right, where it plays in a wall. */
  right?: { frames: Sprite[]; before: Sprite[] | null; after: Sprite[] | null };
}
/** The stairwell's opening: its frames (drawn in depth at the opening's middle), the screen's kick at each jolt (game pixels). */
export interface StairFilm {
  fps: number;
  jolts: number[];
  kicks: number[];
  frames: Sprite[];
}
/** A film of the mine shaft's cage, in two layers frame by frame (a hero is drawn between them); the ride's `lift`: how far up the cage's floor is, frame by frame, in picture pixels. */
export interface ShaftFilm {
  fps: number;
  jolts: number[];
  back: Sprite[];
  front: Sprite[];
  lift?: number[];
}

const plain = (m: Moment): MomentFilm => ({
  name: m.name, fps: m.fps, jolts: [...m.jolts], frames: m.frames, before: m.before, after: m.after,
  ...(m.right ? { right: { frames: m.right.frames, before: m.right.before, after: m.right.after } } : {}),
});

/** The moments of a floor that are made together (floors 1 to 3), or null for a floor whose moments are made one by one. */
function momentsOf(floor: number): Moment[] | null {
  return floor === 1 ? wardenMoments() : floor === 2 ? headsmanMoments() : floor === 3 ? chainedMoments() : null;
}

/** The keys of a floor's moments' films: one for all three (floors 1 to 3), or one each (4 and 5). */
export function momentKeys(floor: number): string[] {
  if (floor >= 1 && floor <= 3) return [`moments:${floor}`];
  if (floor === 4 || floor === 5) return [0, 1, 2].map((n) => `moment:${floor}:${n}`);
  return [];
}

/**
 * How much room a film takes while it is being made, in megabytes (its frames whole, before each is
 * cut down to what is painted in it), measured 11 Oct 2026 (src/dev/measure_first5.ts): a small device
 * makes only the films it has room for (render/painter.ts).
 */
export function filmRoom(key: string): number {
  const [kind, a, b] = key.split(':');
  if (kind === 'moments') return a === '1' ? 57 : a === '2' ? 71 : 16;
  if (kind === 'moment') return a === '4' ? [147, 154, 63][Number(b)] ?? 150 : [88, 48, 52][Number(b)] ?? 90;
  if (kind === 'stair') return 26;
  return 57;
}

/** The key of the film of a stairwell's opening: on floor `floor` (its look, 1 to 4), its steps going down `way`, its anchor on tile (x, y). */
export function stairKey(floor: number, s: { x: number; y: number; way: 'x' | 'y' }): string {
  return `stair:${floor}:${s.way}:${s.x}:${s.y}`;
}

/** Make the film of that name. Throws for a name that is none. (Seconds of work: not where the game is being played.) */
export function makeFilm(key: string): MomentFilm[] | MomentFilm | StairFilm | ShaftFilm {
  const [kind, a, b, c, d] = key.split(':');
  if (kind === 'moments') {
    const list = momentsOf(Number(a));
    if (!list) throw new Error(`no film ${key}`);
    return list.map(plain);
  }
  if (kind === 'moment') {
    const floor = Number(a);
    const n = Number(b);
    if (floor === 4) return plain(ossuaryMoment(n));
    if (floor === 5) return plain(lairMoment(n));
    throw new Error(`no film ${key}`);
  }
  if (kind === 'stair') {
    const floor = Number(a);
    const theme = floor === 5 ? LAIR : CRYPT_FLOORS[Math.max(1, Math.min(4, floor)) - 1];
    const m = stairwellOpens(theme, b === 'y' ? 'y' : 'x', [Number(c) || 0, Number(d) || 0]);
    return { fps: m.fps, jolts: [...m.jolts], kicks: [...stairwellKicks(m)], frames: m.frames };
  }
  if (kind === 'shaft') {
    if (a === 'down') {
      const f = cageDown();
      return { fps: f.m.fps, jolts: [...f.m.jolts], back: f.layers.back, front: f.layers.front };
    }
    const f = cageUp();
    return { fps: f.m.fps, jolts: [...f.m.jolts], back: f.layers.back, front: f.layers.front, lift: [...f.layers.lift] };
  }
  throw new Error(`no film ${key}`);
}
