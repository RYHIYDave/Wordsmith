// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18, THE GLASS GALLERY: ITS MIRRORS, THE HAZARD. His doc: "mirrors that crack and burst
// into shards when anything strikes near them". (Its other hazard, the skylights, is the floor's trap: game/traps.ts, laid by
// its dresser, game/act2/glassgallery.ts.)
//
// A TALL MIRROR on a gallery's wall (the art's 'a tall mirror', art/floor18.ts: whole, cracked, burst on each face; its frame
// `variant` >> 1, its face `variant` & 1) CRACKS at a blow landing near it, anyone's (his, a monster's on him, another mirror's
// shards); at the next it BURSTS a moment after (MIRROR.warn: the cracks spreading, a ring of glass), its shards flying out
// across the floor before it, hurting everything they meet, him and monsters alike (a share of each one's life, as the spike
// floor's); a burst cracks the mirrors beside it. A burst mirror stays burst, its frame empty, its glass on the floor.

import type { Hero, Level, Monster, PropInst } from '../state';

/** The art's name of the floor's tall mirror (art/floor18.ts). */
export const TALL_MIRROR = 'a tall mirror';
/** Its frames (`variant` >> 1): whole, cracked, burst. */
export const MIRROR_FRAME = { whole: 0, cracked: 1, burst: 2 } as const;

/**
 * THE MIRRORS' NUMBERS: how near its glass a blow must land to crack it (tiles from the floor before it, besides the blow's own
 * reach); the moment between the second blow and the burst (seconds); how far its shards fly over the floor before it (tiles)
 * and how wide either side; what they take (a share of his life, of a monster's); how near a burst cracks another.
 */
export const MIRROR = { near: 1.3, warn: 0.3, reach: 2.6, half: 1.6, hero: 0.14, mob: 0.3, chain: 2.2 };

/** A tall mirror where the rules see it: the middle of its foot on the wall line, the way it faces (into the room), its burst to come. */
export interface MirrorAt {
  p: PropInst;
  x: number;
  y: number;
  fx: number;
  fy: number;
  /** Seconds to its burst (>0: cracked and struck again, the cracks spreading); 0 none to come. */
  pending: number;
}

const held = new WeakMap<Level, MirrorAt[]>();

/** The level's tall mirrors (found once, from its pieces). */
export function mirrorsOf(L: Level): MirrorAt[] {
  let list = held.get(L);
  if (!list) {
    list = L.props
      .filter((p) => p.kind === 'piece' && p.name === TALL_MIRROR)
      .map((p) => ((p.variant & 1) === 0 ? { p, x: p.tx + 0.5, y: p.ty, fx: 0, fy: 1, pending: 0 } : { p, x: p.tx, y: p.ty + 0.5, fx: 1, fy: 0, pending: 0 }));
    held.set(L, list);
  }
  return list;
}

/** A mirror's frame now. */
export const frameOf = (m: MirrorAt): number => m.p.variant >> 1;
const setFrame = (m: MirrorAt, f: number): void => {
  m.p.variant = (m.p.variant & 1) | (f << 1);
};

/** A blow lands within `rad` of (x, y): the mirrors near it crack, or, cracked already, are set to burst. Those it cracked now. */
export function strikeMirrors(L: Level, x: number, y: number, rad: number): MirrorAt[] {
  const cracked: MirrorAt[] = [];
  for (const m of mirrorsOf(L)) {
    const f = frameOf(m);
    if (f === MIRROR_FRAME.burst || m.pending > 0) continue;
    const d = Math.hypot(m.x + m.fx * 0.5 - x, m.y + m.fy * 0.5 - y);
    if (d > rad + MIRROR.near) continue;
    if (f === MIRROR_FRAME.whole) {
      setFrame(m, MIRROR_FRAME.cracked);
      cracked.push(m);
    } else m.pending = MIRROR.warn;
  }
  return cracked;
}

/** A step of the mirrors: those whose burst comes now (each burst, its frame empty). */
export function stepMirrors(L: Level, dt: number): MirrorAt[] {
  const out: MirrorAt[] = [];
  for (const m of mirrorsOf(L)) {
    if (m.pending <= 0) continue;
    m.pending -= dt;
    if (m.pending > 0) continue;
    m.pending = 0;
    setFrame(m, MIRROR_FRAME.burst);
    out.push(m);
  }
  return out;
}

/** Whether (x, y) is in a burst mirror's shards: on the floor before it, out to MIRROR.reach and MIRROR.half either side. */
export function inShards(m: MirrorAt, x: number, y: number): boolean {
  const ax = x - m.x;
  const ay = y - m.y;
  const along = ax * m.fx + ay * m.fy;
  const across = Math.abs(ax * m.fy - ay * m.fx);
  return along > -0.2 && along <= MIRROR.reach && across <= MIRROR.half;
}

/** Who a burst mirror's shards strike: him (if he is in them and can be hurt) and every monster in them. */
export function shardsHit(m: MirrorAt, hero: Hero, monsters: readonly Monster[]): { hero: boolean; mobs: Monster[] } {
  return {
    hero: inShards(m, hero.x, hero.y) && !hero.move && hero.invuln <= 0,
    mobs: monsters.filter((q) => !q.dead && !q.boss && inShards(m, q.x, q.y)),
  };
}
