// FLOOR 1, MORE ACTION (game/defs.ts ACTION_F1; the art chat's art/action-f1, his yes to its pictures, 31 Oct 2026): what the
// bone archer's ARROW RAIN and the Warden's LOCKDOWN do on the floor. Each is a peril of kind 'act1' by name (its picture drawn
// by render/act1_fx/archer.ts and warden.ts), stepped here (game/bosses.ts stepPerils, for a peril whose kind has no rules of
// its own).
//   THE ARROW RAIN: where the hero stood as the archer looses, a ring (art/action_f1_fx.ts RAIN.radius); RAIN.delay later the
//     arrows strike, and a hero whose middle is inside it is hit.
//   THE LOCKDOWN: as the Warden's keys go up, the bars' shadows lie across his room in rows both ways (LOCKDOWN.cell apart, so
//     that he stands in the middle of a cell: lockRows); at the crash a hero within LOCKDOWN.band of a row is struck, a cell is
//     safe; then the bars stand LOCKDOWN.stand as a cage. His rule, 31 Oct: “You’re caged but you can swipe to move around”:
//     walking, the hero cannot cross a row while they stand (cageHero); his swipe carries him through. If the Warden falls, or
//     is stopped, before the crash, nothing comes down.

import { LOCKDOWN, LOCKDOWN_LONG, RAIN, RAIN_LONG, lockRows, lockStrikes } from '../art/action_f1_fx';
import type { Game } from './game';
import type { Monster, Peril } from './state';
import type { Room } from './types';

/** The perils' names. */
export const RAIN_PERIL = 'archer:rain';
export const BARS_PERIL = 'warden:bars';
/** How long each lasts (seconds, from its blow: the rain from the loose, the bars from the crash). */
export const RAIN_LASTS = RAIN_LONG;
export const BARS_LASTS = LOCKDOWN_LONG;

/** The room (tiles) that holds a point, if any. */
export function roomAt(g: Game, x: number, y: number): Room | null {
  for (const r of g.level.floor.rooms) if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return r;
  return null;
}

/**
 * The rows of the Lockdown peril `p` (cast with the Warden at p.x, p.y, the middle of his cell): `x` rows lie along the floor's x
 * way at a fixed y, `y` rows along y at a fixed x (tiles, the floor's own), each within his room; and the room.
 */
export function barRows(g: Game, p: Peril): { x: number[]; y: number[]; room: Room } | null {
  const room = roomAt(g, p.x, p.y);
  if (!room) return null;
  const reach = Math.max(room.w, room.h) + LOCKDOWN.cell;
  const rel = lockRows([0, 0], reach);
  return {
    x: rel.x.map((d) => p.y + d).filter((y) => y > room.y && y < room.y + room.h),
    y: rel.y.map((d) => p.x + d).filter((x) => x > room.x && x < room.x + room.w),
    room,
  };
}

/** A step of a floor 1 peril (game/bosses.ts stepPerils). False: it is none of these. */
export function stepActionF1(g: Game, p: Peril, hurt: () => void): boolean {
  const h = g.hero;
  if (p.a1 === RAIN_PERIL) {
    if (!p.done && p.t >= p.hit) {
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= RAIN.radius) hurt();
      g.sfx('hit', 0.55);
    }
    return true;
  }
  if (p.a1 === BARS_PERIL) {
    // (his keys still going up: if he has fallen, or been stopped in his wind-up, nothing comes down)
    if (p.t < -0.1) {
      const m = g.monsters.find((o: Monster) => o.id === p.a);
      if (!m || m.dead || m.state !== 'windup') p.dur = p.t;
      return true;
    }
    if (!p.done && p.t >= 0) {
      p.done = 1;
      const R = barRows(g, p);
      if (R && lockStrikes({ x: R.x.map((y) => y - p.y), y: R.y.map((x) => x - p.x) }, h.x - p.x, h.y - p.y)) hurt();
      g.sfx('slam', 0.9);
      g.emit({ t: 'shake', amount: 4 });
    }
    return true;
  }
  return false;
}

/** Whether the Lockdown's bars stand as a cage now (from the crash, for LOCKDOWN.stand). */
export function barsStand(p: Peril): boolean {
  return p.kind === 'act1' && p.a1 === BARS_PERIL && p.t >= 0 && p.t < LOCKDOWN.stand;
}

/**
 * THE CAGE: a hero who has walked from (wasX, wasY) to where he is now, of radius `r`, is kept on his own side of every row of
 * standing bars in the room he is in (his swipe moves him by other ways, and is not kept: “you can swipe to move around”).
 */
export function cageHero(g: Game, b: { x: number; y: number }, r: number, wasX: number, wasY: number): void {
  for (const p of g.perils) {
    if (!barsStand(p)) continue;
    const R = barRows(g, p);
    if (!R) continue;
    const room = R.room;
    if (wasX < room.x || wasX >= room.x + room.w || wasY < room.y || wasY >= room.y + room.h) continue;
    const x0 = b.x;
    const y0 = b.y;
    for (const line of R.x) b.y = keepSide(b.y, wasY, line, r);
    for (const line of R.y) b.x = keepSide(b.x, wasX, line, r);
    // (never into a wall: a row of bars by a wall leaves him no room on its far side; where keeping him off it would put him in
    // the wall, he stays where he was, as walking into the wall would leave him)
    if ((b.x !== x0 || b.y !== y0) && !bodyFits(g, b.x, b.y, r)) {
      b.x = wasX;
      b.y = wasY;
    }
  }
}

/** Whether a body of radius `r` at (x, y) stands clear of the walls. */
function bodyFits(g: Game, x: number, y: number, r: number): boolean {
  const k = r * 0.95;
  return g.isOpen(x - k, y - k) && g.isOpen(x + k, y - k) && g.isOpen(x - k, y + k) && g.isOpen(x + k, y + k);
}

/** A coordinate kept at least `r` from `line`, on the side it was on (`was`). */
function keepSide(now: number, was: number, line: number, r: number): number {
  return was >= line ? Math.max(now, line + r) : Math.min(now, line - r);
}
