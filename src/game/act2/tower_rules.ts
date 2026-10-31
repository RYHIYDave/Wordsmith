// THE HIGH CITY, FLOOR 20: THE QUIET TOWER'S WAY UP AND DOWN. His doc, level 20: "a climb up the tower's spiralling floors ... to
// the open top under the sky." The top is a place of its own on the map (game/act2/quiettower.ts): walking up THE TOWER'S STAIR
// at the stairhead the screen darkens and he comes up through THE TRAPDOOR onto the top; standing on the trapdoor takes him back
// down to the foot of the stair. The main chat's picks, his to try and change: as he steps off it, with the Moth alive, the
// trapdoor slams shut behind him (as a boss's gate drops behind the hero in his hall) and stays shut until the Moth is dead.

import type { Hero, Level, PropInst } from '../state';
import type { TowerPlan } from './quiettower';

/** How near the stair's middle takes him up (tiles); how near the trapdoor's middle takes him down; how far off it he must be before it slams. */
export const TOWER = { up: 1.75, down: 0.6, slamFrom: 2.4 } as const;

/** The trapdoor's frames (art/floor20.ts): shut, open. */
export const TRAP_FRAME = { shut: 0, open: 1 } as const;

/** The trapdoor's piece, if the floor has one. */
export function trapdoorOf(L: Level): PropInst | null {
  const T = L.land?.tower;
  if (!T) return null;
  return L.props.find((p) => p.kind === 'piece' && p.name === 'the trapdoor to the top' && p.tx === T.top.trap.x && p.ty === T.top.trap.y) ?? null;
}

/** Whether the trapdoor stands open. */
export function trapOpen(L: Level): boolean {
  const p = trapdoorOf(L);
  return !!p && p.variant === TRAP_FRAME.open;
}

/**
 * A STEP OF THE WAY UP AND DOWN: 'up' as he walks into the tower's stair, 'down' as he stands on the open trapdoor, 'slam' as it
 * shuts behind him (the Moth alive, he off it), 'open' as it opens again (the Moth dead); null otherwise.
 */
export function stepTower(L: Level, h: Hero, bossAlive: boolean): 'up' | 'down' | 'slam' | 'open' | null {
  const T: TowerPlan | undefined = L.land?.tower;
  if (!T) return null;
  const trap = trapdoorOf(L);
  const tx = T.top.trap.x + 0.5;
  const ty = T.top.trap.y + 0.5;
  if (trap && bossAlive && trap.variant === TRAP_FRAME.open && Math.hypot(h.x - tx, h.y - ty) > TOWER.slamFrom && h.x >= T.split) {
    trap.variant = TRAP_FRAME.shut;
    return 'slam';
  }
  if (trap && !bossAlive && trap.variant === TRAP_FRAME.shut) {
    trap.variant = TRAP_FRAME.open;
    return 'open';
  }
  if (Math.hypot(h.x - T.stair.x, h.y - T.stair.y) < TOWER.up) return 'up';
  if (trap && trap.variant === TRAP_FRAME.open && Math.hypot(h.x - tx, h.y - ty) < TOWER.down) return 'down';
  return null;
}
