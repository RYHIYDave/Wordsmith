// ACT 1: WHO IS ON EACH FLOOR OF THE DESCENT, AND IN WHAT PACKS.
//
// His doc's "Mobs by area" (the planning chat's table, kept with his yes; the art chat's briefs and pictures,
// each with his yes): "The Prison's cult (cultists, dagger cultists and mini fleshmancers) turns up in every
// area, with two new variants. Each area adds mobs of its own." His words of 12 Oct, 18:11: "The cultists from
// the prison are probably good in all areas.  Maybe a couple more variants.  Golems in the quarry, vultures on
// the cliffs, mutated deer in the forest.  Need a few more"; 18:13, "Swap the goats for something else", and
// his pick, "Cliff crawlers".
//
// HOW OFTEN EACH COMES (the main chat's): about three packs in five are the floor's own creatures, two in five
// the cult's; a yellow pack of the cult's dagger cultists is led by a mini fleshmancer as on floor 5.

import type { RNG } from '../engine/rng';
import { act1Floor, cityFloor } from './act1';
import { act2Pack, act2Ready } from './act2_mobs';
// (the pack sizes of the descent's kinds are his rulebook's, by size: tiny 6 to 10, small 4 to 7, medium 3 to 5)
import { PACK_BY_SIZE, sizeOf } from './defs';
import type { MonsterKind } from './types';
import { act1Rules } from './act1_rules/index';

export interface Act1Mob {
  kind: MonsterKind;
  /** How heavily it is drawn for a pack on its floor. */
  weight: number;
}

/** The cult, on every floor of the descent: the Prison's fire-throwing cultists and dagger cultists, and the two new kinds. */
export const ACT1_CULT: readonly Act1Mob[] = [
  { kind: 'dagger', weight: 3 },
  { kind: 'cultist', weight: 1.5 },
  { kind: 'chanter', weight: 1.5 },
  { kind: 'firepot', weight: 1.5 },
];
/** Each floor's own creatures. */
export const ACT1_OWN: Readonly<Record<number, readonly Act1Mob[]>> = {
  6: [
    { kind: 'qgolem', weight: 6 },
    { kind: 'rubbling', weight: 5 },
  ],
  7: [
    { kind: 'vulture', weight: 6 },
    { kind: 'crawler', weight: 5 },
  ],
  8: [
    { kind: 'scorpion', weight: 6 },
    { kind: 'devil', weight: 5 },
  ],
  9: [
    { kind: 'deer', weight: 5 },
    { kind: 'wolf', weight: 6 },
  ],
  10: [
    { kind: 'drowned', weight: 6 },
    { kind: 'leech', weight: 4 },
    { kind: 'spawn', weight: 3 },
  ],
};

/**
 * WHICH OF THEM ARE IN THE GAME YET: the Prison's own, and each of the descent's own whose rules are built
 * (game/act1_rules/: its pictures with them, art/act1_figs/). One that is not yet is stood in for by the cult's
 * dagger cultists (so a floor is always filled).
 */
export const ACT1_READY = new Set<MonsterKind>(['dagger', 'cultist']);
export function act1Ready(k: MonsterKind): boolean {
  return ACT1_READY.has(k) || act1Rules(k) !== null || act2Ready(k);
}

/** What stands in for a kind of the descent that is not in the game yet. */
function standIn(k: MonsterKind): MonsterKind {
  return act1Ready(k) ? k : 'dagger';
}

/** A pack for a floor of the descent: its kind, and how many. A lair's is a guardian's: one big one and its own (the floor's medium creature as the guardian). */
export function act1Pack(depth: number, rng: RNG, tier: 'normal' | 'elite' | 'champion'): { kind: MonsterKind; size: number } {
  // (ACT 2, THE HUSH: its own, game/act2_mobs.ts)
  if (cityFloor(depth)) return act2Pack(depth, rng, tier);
  const n = act1Floor(depth) || 6;
  const own = ACT1_OWN[n];
  const pool: Act1Mob[] = [...own.map((m) => ({ ...m })), ...ACT1_CULT];
  // (an elite area's yellow pack is never the tiny ones: they are not led)
  const elite = tier === 'elite';
  const list = pool.filter((m) => !(elite && (m.kind === 'rubbling' || m.kind === 'leech')));
  const pick = rng.weighted(list, (m) => m.weight);
  const kind = standIn(pick.kind);
  if (tier === 'champion') return { kind: 'brute', size: rng.int(3, 4) };
  const [lo, hi] = PACK_BY_SIZE[sizeOf(kind)];
  return { kind, size: rng.int(lo, hi) };
}
