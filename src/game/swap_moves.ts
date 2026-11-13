// THE MAGE'S AND THE RANGER'S MOVES TO SWAP (behind game/talents.ts SWAP_MOVES, off; every word of his in
// docs/mockups/swap_moves/README.md). His picks, 12 Nov 2026: the Mage keeps her staff, and stones on her paths give her BALL,
// BEAM and SPEAR, moves of no element of their own (“i dont want spear to be ice spear, i want it to be spear, same with the
// others”); she puts any two of Wave, Orb, Ball, Beam and Spear on her tap and her hold, “She sets tap and hold (Recommended)”
// (Beam is held, so only on her hold). Her paths meet at AURA, a tap on her (game.ts, swapAura). The Ranger: “i like snare to swap
// for shot and snipe to swap for volley”, and Rally “as another swap for volley”: SNARE takes his Shot's place, SNIPE or RALLY his
// Volley's (with both, he picks which on his ATTACKS page). Asked the difference between Wave, Ball and Spear, he was told (22:0x):
// Wave wide and short, Ball stops and explodes, Spear thin and long; his words, 22:06: “nice, thats exactly what i was thinking”.
import type { SkillId } from './defs';
import { SWAP_MOVES } from './talents';
import type { ClassId } from './types';

/** What the new moves come to (ours, his to change). */
export const SWAP_TUNE = {
  /** BALL's burst where it hits: its reach (tiles), and the share of the hit the others round it take. */
  ball: { r: 1.6, share: 0.6 },
  /** SNARE: how long what walks in is held (s); how long it lies waiting (s); the burst's share of a hit, and its reach. */
  snare: { hold: 2.0, life: 10, share: 1.0, r: 1.3, max: 3 },
  /**
   * SNIPE: the draw to its fullest (s); the shot let go at once and at its fullest, as shares of a hit; and, drawn to its
   * fullest, how much wider the arrow is (its reach to either side: `wide` more, 1.5 = two and a half times), how much faster it
   * flies (`fast` more), and how far it knocks back what it hits (`push`, tiles). His words, 13 Nov 2026: “I want snipe to grow
   * in power as you hold, then do a little glint when it’s at full, then you release for a bigger arrow hitbox with more
   * momentum and force”.
   */
  snipe: { full: 1.5, least: 0.6, most: 2.6, wide: 1.5, fast: 0.7, push: 1.4 },
  /** RALLY: how long (s), and how much faster and harder his companions and allies near him attack (%). */
  rally: { secs: 5, atk: 30, dmg: 30 },
  /**
   * AURA: on (s) and the wait after (s); its reach; FIRE burns every enemy in it (`burn` of a hit a second); LIGHTNING a bolt to
   * every enemy in it every `every` s (`bolt` of a hit); FROST shields her (`shield` of her life, while it lasts) and chills (to
   * `chill` of their speed) every enemy in it.
   */
  aura: { secs: 6, wait: 10, r: 3.2, burn: 0.3, every: 0.8, bolt: 0.45, shield: 0.25, chill: 0.5 },
};

/** The Aura's three kinds, picked as she takes its stone (“She picks when she takes it”). */
export const AURA_KINDS = ['fire', 'lightning', 'frost'] as const;
export type AuraKind = (typeof AURA_KINDS)[number];

const has = (talents: readonly string[], id: string): boolean => talents.includes(id);

/** The moves the Mage may put in a place (0 her tap, 1 her hold), by what she has learned. */
export function mageMoves(talents: readonly string[], slot: number): SkillId[] {
  const out: SkillId[] = ['wave', 'orb'];
  if (has(talents, 'ball')) out.push('ball');
  if (has(talents, 'spear')) out.push('spear');
  if (slot === 1 && has(talents, 'beam')) out.push('beam');
  return out;
}

/** The Ranger's holds, by what he has learned: Volley, or Snipe or Rally in its place. */
export function rangerHolds(talents: readonly string[]): SkillId[] {
  const out: SkillId[] = [];
  if (has(talents, 'snipe')) out.push('snipe');
  if (has(talents, 'rally')) out.push('rally');
  return out.length ? out : ['volley'];
}

const pickIn = (p: string | undefined, list: readonly SkillId[]): SkillId | null => (p && (list as readonly string[]).includes(p) ? (p as SkillId) : null);

/** Where the pick of the move in a place is kept, in the hero's picks (saved with them). */
export const MOVE_PICK = ['@tap', '@hold'] as const;

/**
 * The moves in the places of a hero's tap and hold, with SWAP_MOVES on (`want`, as game.ts refresh has it, changed in place):
 * the Mage's as she has set them (Wave and Orb till she sets them; never one move in both); the Ranger's Snare for his Shot, and
 * Snipe or Rally for his Volley.
 */
export function swapInto(cls: ClassId, talents: readonly string[], picks: Readonly<Record<string, string>> | undefined, want: SkillId[]): void {
  if (!SWAP_MOVES.on) return;
  if (cls === 'mage') {
    const tap = pickIn(picks?.[MOVE_PICK[0]], mageMoves(talents, 0)) ?? 'wave';
    let hold = pickIn(picks?.[MOVE_PICK[1]], mageMoves(talents, 1)) ?? 'orb';
    if (hold === tap) hold = tap === 'orb' ? 'wave' : 'orb';
    want[0] = tap;
    want[1] = hold;
  } else if (cls === 'ranger') {
    if (has(talents, 'snare')) want[0] = 'snare';
    const holds = rangerHolds(talents);
    want[1] = pickIn(picks?.[MOVE_PICK[1]], holds) ?? holds[0];
  }
}

/** The moves a place could be changed to on the ATTACKS page (the one in it first), or none where there is no change to make. */
export function moveChoices(cls: ClassId, talents: readonly string[], slot: number, now: readonly SkillId[]): SkillId[] {
  if (!SWAP_MOVES.on || slot > 1) return [];
  let list: SkillId[] = [];
  if (cls === 'mage') list = mageMoves(talents, slot).filter((m) => m === now[slot] || m !== now[1 - slot]);
  else if (cls === 'ranger' && slot === 1) list = rangerHolds(talents);
  return list.length > 1 ? list : [];
}

/** The Aura's kind, as she picked it on its stone; none until she has. */
export function auraKindOf(picks: Readonly<Record<string, string>> | undefined): AuraKind | null {
  const p = picks?.aura;
  return (AURA_KINDS as readonly string[]).includes(p ?? '') ? (p as AuraKind) : null;
}
