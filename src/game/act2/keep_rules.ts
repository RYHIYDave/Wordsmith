// THE HIGH CITY, FLOOR 19: THE KEEP'S PORTCULLISES, its hazard. His doc, level 19: "portcullises that slam down to cut a hall in
// two." (Its other hazard, the murder holes dropping pitch, is the floor's trap: game/traps.ts, laid by its dresser,
// game/act2/keep.ts.)
//
// A PORTCULLIS is a row of tiles right across a hall (KeepPlan.portcullises; each tile the art's 'a portcullis', art/floor19.ts:
// up, the warning, falling, slammed, down; five along x, then five along y: the piece's `variant`). The main chat's numbers, his
// to try and change: it stands up a while (PORTCULLIS.up, its own share of it first, so the floor's do not all fall together);
// shakes in its slot (the warning, PORTCULLIS.warn); falls and SLAMS: whatever is under it is struck (a share of his life, of a
// monster's) and thrown clear to the nearer side; it stays down a while (PORTCULLIS.down), the hall cut in two (its tiles not
// walked, by him or by anything), and is wound up again (falling's frame, run back).

import type { Level, PropInst } from '../state';
import type { PortcullisAt } from './keep';

/** Its frames (art/floor19.ts): up, the warning, falling, slammed, down; and how many along each way. */
export const PORT_FRAME = { up: 0, warn: 1, falling: 2, slammed: 3, down: 4, perWay: 5 } as const;

/**
 * THE PORTCULLISES' NUMBERS (seconds; shares of life): up, its warning, falling, slammed, down, wound up; what its slam takes from
 * him and from a monster under it; how far near it he must be for it to fall at all (tiles: those far off stand up).
 */
export const PORTCULLIS = { up: 9, warn: 1.3, fall: 0.15, slam: 0.35, down: 4.5, rise: 0.6, hero: 0.18, mob: 0.3, near: 18 } as const;

export type PortPhase = 'up' | 'warn' | 'fall' | 'slam' | 'down' | 'rise';

/** A portcullis where the rules see it: its row, its tiles' pieces, what it is doing and for how long more. */
export interface PortState {
  at: PortcullisAt;
  pieces: PropInst[];
  phase: PortPhase;
  t: number;
}

const held = new WeakMap<Level, PortState[]>();

/** The floor's portcullises (found once, from its plan and its pieces); none on any other floor. */
export function portcullisesOf(L: Level): PortState[] {
  let list = held.get(L);
  if (!list) {
    const K = L.land?.kind === 'keep' ? L.land.keep : undefined;
    list = (K?.portcullises ?? []).map((at, i) => {
      const pieces: PropInst[] = [];
      for (let k = 0; k < at.n; k++) {
        const x = at.alongX ? at.x + k : at.x;
        const y = at.alongX ? at.y : at.y + k;
        const p = L.props.find((q) => q.kind === 'piece' && q.name === 'a portcullis' && q.tx === x && q.ty === y);
        if (p) pieces.push(p);
      }
      // (each its own share of its first wait, so they do not all fall together)
      return { at, pieces, phase: 'up' as PortPhase, t: PORTCULLIS.up * (0.35 + 0.6 * (((i * 0.618) % 1 + 1) % 1)) };
    });
    held.set(L, list);
  }
  return list;
}

/** The tiles of a portcullis's row (indices). */
export function portTiles(at: PortcullisAt, w: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < at.n; k++) out.push(at.alongX ? at.y * w + at.x + k : (at.y + k) * w + at.x);
  return out;
}

/** Whether (x, y) is under a portcullis's row. */
export function underPort(at: PortcullisAt, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return at.alongX ? ty === at.y && tx >= at.x && tx < at.x + at.n : tx === at.x && ty >= at.y && ty < at.y + at.n;
}

/** Where something under a row is thrown to: out to the nearer side of it, across the row. */
export function clearOf(at: PortcullisAt, x: number, y: number): { x: number; y: number } {
  if (at.alongX) return { x, y: y < at.y + 0.5 ? at.y - 0.4 : at.y + 1.4 };
  return { x: x < at.x + 0.5 ? at.x - 0.4 : at.x + 1.4, y };
}

const FRAME_OF: Readonly<Record<PortPhase, number>> = { up: PORT_FRAME.up, warn: PORT_FRAME.warn, fall: PORT_FRAME.falling, slam: PORT_FRAME.slammed, down: PORT_FRAME.down, rise: PORT_FRAME.falling };
const NEXT: Readonly<Record<PortPhase, PortPhase>> = { up: 'warn', warn: 'fall', fall: 'slam', slam: 'down', down: 'rise', rise: 'up' };
const LONG: Readonly<Record<PortPhase, number>> = { up: PORTCULLIS.up, warn: PORTCULLIS.warn, fall: PORTCULLIS.fall, slam: PORTCULLIS.slam, down: PORTCULLIS.down, rise: PORTCULLIS.rise };

/**
 * A step of the floor's portcullises (`hero` where he stands): each on through its phases, its tiles' frames set; its tiles not
 * walked from its slam till it is wound up again. Those that slam this step (the game strikes what is under them and throws it
 * clear).
 */
export function stepPortcullises(L: Level, hero: { x: number; y: number }, dt: number): PortState[] {
  const slammed: PortState[] = [];
  const W = L.floor.w;
  for (const s of portcullisesOf(L)) {
    // (one far from him stands up, and waits: it does not fall unseen)
    const mx = s.at.alongX ? s.at.x + s.at.n / 2 : s.at.x + 0.5;
    const my = s.at.alongX ? s.at.y + 0.5 : s.at.y + s.at.n / 2;
    if (s.phase === 'up' && Math.hypot(hero.x - mx, hero.y - my) > PORTCULLIS.near) continue;
    s.t -= dt;
    if (s.t > 0) continue;
    s.phase = NEXT[s.phase];
    s.t = LONG[s.phase];
    const base = s.at.alongX ? 0 : PORT_FRAME.perWay;
    for (const p of s.pieces) p.variant = base + FRAME_OF[s.phase];
    if (s.phase === 'slam') {
      for (const i of portTiles(s.at, W)) L.walk[i] = 0;
      slammed.push(s);
    } else if (s.phase === 'up') {
      for (const i of portTiles(s.at, W)) if (!L.props.some((p) => p.solid && p.ty * W + p.tx === i)) L.walk[i] = 1;
    }
  }
  return slammed;
}

/** Whether a portcullis is down across its hall (slammed or down: its tiles not walked). */
export function portDown(s: PortState): boolean {
  return s.phase === 'slam' || s.phase === 'down';
}
