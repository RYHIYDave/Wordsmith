// THE HEROES' ANIMATIONS CHECKED AGAINST THE ART RULEBOOK (the art chat, 8 Oct 2026; the owner, 14:20:
// "I want you to go through all animations for the three characters and see if they pass our
// ruleset"). What the review's scripts share: where the points of a hero are at a moment of a move,
// seen as the game shows them, in game pixels.
import { heroOf } from '../../src/art/heroes3';
import { GREAT_BLADE, MOVES3, STAFF_UP } from '../../src/art/moves3';
import type { Move3 } from '../../src/art/moves3';
import { add, bonesAt, mul, project, solve } from '../../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../../src/art/skeleton';

export type View = 'front' | 'back';
export const VIEWS: View[] = ['front', 'back'];
export const FR = 1 / 30;

export const endOf = (m: Move3): number => (m.motion.keys.length ? m.motion.keys[m.motion.keys.length - 1].at : 0);

export interface At {
  q: Posed;
  s: Skeleton;
}
export function at(m: Move3, t: number): At {
  const q = bonesAt(m.motion.keys, m.rest, Math.max(0, t));
  return { q, s: solve(m.build, q) };
}

/** The far end of what is held: the great sword's point, the staff's crystal, the bow's upper tip. */
export function tipOf(m: Move3, s: Skeleton): V3 {
  const hero = heroOf(m);
  if (hero === 'knight') return add(s.handR, mul(s.point, 1.3 + GREAT_BLADE));
  if (hero === 'mage') return add(s.handR, mul(s.point, STAFF_UP));
  // (the bow is held in the left hand; its limbs run along `across`)
  return add(s.handL, mul(s.across, 0.45 * m.build.tall));
}

/** The points the review follows, by name. */
export function pointsOf(m: Move3, s: Skeleton): Record<string, V3> {
  return { head: s.head, chest: s.ribs, pelvis: s.pelvis, handL: s.handL, handR: s.handR, elbowL: s.elbowL, elbowR: s.elbowR, kneeL: s.kneeL, kneeR: s.kneeR, toeL: s.toeL, toeR: s.toeR, heelL: s.heelL, heelR: s.heelR, tip: tipOf(m, s) };
}

/** A point as the game shows it, in game pixels from the feet (x right, y down the screen). */
export function seen(p: V3, view: View): [number, number] {
  const r = project(p, view);
  return [r[0] / 2, r[1] / 2];
}

/** Which of the game's places a move is used in, and how it is played there (heroes3.ts: animSet3 and PLANS). */
export interface Use {
  /** 'loop' (idle, run: frames round and round), 'clip' (played by the clock), 'spread' (by how far through: leap, roll), 'held' (a beam, a whirlwind), 'gesture' (left standing). */
  how: 'loop' | 'clip' | 'spread' | 'held' | 'gesture';
  fps: number;
  role: string;
}
export const USES: Record<string, Use> = {
  // the knight
  rear: { how: 'loop', fps: 10, role: 'stands (dungeon)' },
  krun: { how: 'loop', fps: 30, role: 'runs (dungeon)' },
  strike: { how: 'clip', fps: 30, role: 'Strike (tap)' },
  kslash: { how: 'clip', fps: 30, role: "Strike's second swing (the combo)" },
  slam: { how: 'clip', fps: 30, role: 'Slam (hold, sword and shield)' },
  whirl: { how: 'held', fps: 30, role: 'Whirlwind (hold, great sword)' },
  leap: { how: 'spread', fps: 30, role: 'Leap (swipe) and its landing' },
  kreel: { how: 'clip', fps: 30, role: 'rocked back by a heavy blow' },
  klurch: { how: 'clip', fps: 30, role: 'thrown forward by a heavy blow from behind' },
  kfall: { how: 'clip', fps: 30, role: 'falls when his life runs out' },
  ktown: { how: 'loop', fps: 10, role: 'stands (town, class card)' },
  ktownrun: { how: 'loop', fps: 30, role: 'runs (town)' },
  klook: { how: 'gesture', fps: 20, role: 'passes the time (town)' },
  kdraw: { how: 'clip', fps: 30, role: 'draws the sword when picked' },
  // the ranger
  rstand: { how: 'loop', fps: 10, role: 'stands (dungeon)' },
  rrun: { how: 'loop', fps: 30, role: 'runs (dungeon)' },
  shot: { how: 'clip', fps: 30, role: 'Shot (tap)' },
  volley: { how: 'clip', fps: 30, role: 'Volley (hold)' },
  roll: { how: 'spread', fps: 30, role: 'the roll of Trap (swipe)' },
  rreel: { how: 'clip', fps: 30, role: 'rocked back by a heavy blow' },
  rlurch: { how: 'clip', fps: 30, role: 'thrown forward by a heavy blow from behind' },
  rfall: { how: 'clip', fps: 30, role: 'falls when his life runs out' },
  squirrel: { how: 'gesture', fps: 20, role: 'passes the time: the squirrel (dungeon)' },
  sighting: { how: 'gesture', fps: 20, role: 'passes the time: sights an arrow (dungeon)' },
  rtown: { how: 'loop', fps: 10, role: 'stands (town, class card)' },
  rtownrun: { how: 'loop', fps: 30, role: 'runs (town)' },
  tsquirrel: { how: 'gesture', fps: 20, role: 'passes the time: the squirrel (town)' },
  tsighting: { how: 'gesture', fps: 20, role: 'passes the time: sights an arrow (town)' },
  rdraw: { how: 'clip', fps: 30, role: 'draws the bow when picked' },
  // the mage
  mstand: { how: 'loop', fps: 10, role: 'stands (everywhere)' },
  mrun: { how: 'loop', fps: 30, role: 'runs (everywhere)' },
  wave: { how: 'clip', fps: 30, role: 'Wave (tap, staff); also Familiar (tap, wand)' },
  orb: { how: 'clip', fps: 30, role: 'Orb (hold, staff)' },
  beam: { how: 'held', fps: 30, role: 'Beam, held (wand)' },
  beamend: { how: 'clip', fps: 30, role: 'Beam, let go' },
  mreel: { how: 'clip', fps: 30, role: 'rocked back by a heavy blow' },
  mlurch: { how: 'clip', fps: 30, role: 'thrown forward by a heavy blow from behind' },
  mfall: { how: 'clip', fps: 30, role: 'falls when her life runs out' },
  mlight: { how: 'gesture', fps: 20, role: 'passes the time: a light in her fingers' },
  reading: { how: 'gesture', fps: 20, role: 'passes the time: reads' },
  mready: { how: 'clip', fps: 30, role: 'makes ready when picked' },
};

/** Every move, in the order the review goes through them: the knight's, the ranger's, the mage's. */
export const ORDER = ['rear', 'krun', 'strike', 'kslash', 'slam', 'whirl', 'leap', 'kreel', 'klurch', 'kfall', 'ktown', 'ktownrun', 'klook', 'kdraw', 'rstand', 'rrun', 'shot', 'volley', 'roll', 'rreel', 'rlurch', 'rfall', 'squirrel', 'sighting', 'rtown', 'rtownrun', 'tsquirrel', 'tsighting', 'rdraw', 'mstand', 'mrun', 'wave', 'orb', 'beam', 'beamend', 'mreel', 'mlurch', 'mfall', 'mlight', 'reading', 'mready'];

/** (a check that the list is every move there is) */
export function checkOrder(): void {
  const all = Object.keys(MOVES3).sort();
  const mine = [...ORDER].sort();
  if (JSON.stringify(all) !== JSON.stringify(mine)) throw new Error(`the review's list of moves is not MOVES3's: ${all.filter((k) => !mine.includes(k))} / ${mine.filter((k) => !all.includes(k))}`);
}
