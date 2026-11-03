// THE RANGER'S COMPANIONS (the main chat, from 28 Oct 2026). His words, 23:09: “I’d like the ranger to have a passive that
// summons a hawk companion that applies PRECISE on hit, a snake companion, that applies “of POISON”, and a third something I
// need help with”; 23:10: “And that should be an Or for those companions.  You pick one, not all three”; his picks, the hawk
// “It marks its prey (Recommended)”, “One at a time, I pick”, “Any time in town (Recommended)”; offered a wolf, a bat, a fox
// and a tortoise: “Okay maybe we have two separate passive with three each cause I love all of these.  Let’s put them
// opposite each other on the tree so if you want one companion that’s fine but if you want two it’s going to take some
// investment.  So we need 6 total”; shown his tree, by 23:24, “Really good stuff”; 23:25, “Yeah keep the groups”.
//
// So, two talents on his tree (game/talents.ts COMPANIONS, off until he has seen them at work and said yes), one on each feather:
//   THE HUNTING COMPANION (`huntcompanion`): a hawk, a snake or a wolf;
//   THE WILD COMPANION (`wildcompanion`): a bat, a fox or a tortoise.
// Each brings one animal of its three, the one picked (in town; the first of the three until then). It keeps by him, goes
// for an enemy awake near him and bites it (the hawk dives on it), and each bite does what one of his words does:
//   the HAWK's marks it, as Precise behind does: his next hit on it is a certain critical;
//   the SNAKE's poisons it, as Poison in front does: a dose, and doses add up;
//   the WOLF's holds it in place a moment, as Binding in front does;
//   the BAT's heals him a little, as Leeching does;
//   the FOX's gives him a burst of speed, as Swift behind does;
//   the TORTOISE's gives him a brief shield, as Guarding in front does; it keeps close by him, going only for what is near him.
// A bite hurts for a share of his own hit (not his words: what it does is its own). Nothing fights them: they cannot be hurt.
// Left far behind (a way taken), one is at his side again. The numbers are first guesses, his to try and change.

/** The six. */
export type CompanionKind = 'hawk' | 'snake' | 'wolf' | 'bat' | 'fox' | 'tortoise';
/** Which talent brings it. */
export type CompanionGroup = 'hunt' | 'wild';

export const COMPANION_GROUPS: Record<CompanionGroup, { talent: string; kinds: readonly CompanionKind[] }> = {
  hunt: { talent: 'huntcompanion', kinds: ['hawk', 'snake', 'wolf'] },
  wild: { talent: 'wildcompanion', kinds: ['bat', 'fox', 'tortoise'] },
};
export const COMPANION_GROUP_IDS: readonly CompanionGroup[] = ['hunt', 'wild'];

/** What each is called, and what its bite does (the picker's words). */
export const COMPANION_INFO: Record<CompanionKind, { name: string; does: string; short: string }> = {
  hawk: { name: 'Hawk', does: 'Dives on an enemy and marks it: your next hit on it is a certain critical.', short: 'Your next hit on what it marks is a sure critical.' },
  snake: { name: 'Snake', does: 'Its bite poisons. The doses add up.', short: 'Its bite poisons.' },
  wolf: { name: 'Wolf', does: 'Its bite holds an enemy in place for a moment.', short: 'Its bite holds them in place.' },
  bat: { name: 'Bat', does: 'Its bite heals you a little.', short: 'Its bite heals you.' },
  fox: { name: 'Fox', does: 'Each enemy it bites gives you a burst of speed.', short: 'Its bite gives you a burst of speed.' },
  tortoise: { name: 'Tortoise', does: 'It stays by you. Each hit it lands gives you a brief shield.', short: 'It stays by you; its hits shield you.' },
};

/** The group a companion talent brings (null: not one). */
export function groupOfTalent(id: string): CompanionGroup | null {
  return id === COMPANION_GROUPS.hunt.talent ? 'hunt' : id === COMPANION_GROUPS.wild.talent ? 'wild' : null;
}

/** Times in seconds, distances in tiles. Starting numbers, his to try and change. */
export const COMPANION_TUNE = {
  /** How fast they go (his run is 4.6), how near him they keep with nothing to fight, how far behind before one is at his side again. */
  speed: 5.4,
  near: 1.2,
  lost: 12,
  /** They go for enemies awake within this of him (they do not wander off from him); the tortoise, only what is this near him. */
  leash: 7,
  tortoiseLeash: 2.5,
  /** A bite: its blow lands this long after it begins, and it is over after `long`. */
  // (the art chat's bite, his yes to all six by 30 Oct 2026: its strike lands at 12/30 and it is over at 24/30, art/companions_art_moves.ts COMP_ATTACK)
  bite: { hit: 12 / 30, long: 24 / 30 },
  /** Each: how near it must be to bite (from its middle to the enemy's edge), how often it may, and its share of his hit. */
  kinds: {
    hawk: { reach: 1.1, every: 2.4, share: 0.3 },
    snake: { reach: 0.9, every: 1.3, share: 0.2, dose: 0.6 },
    wolf: { reach: 1.0, every: 2.2, share: 0.35, hold: 1.0 },
    bat: { reach: 0.9, every: 1.2, share: 0.2, heal: 0.5 },
    fox: { reach: 0.9, every: 1.4, share: 0.25, haste: 25, secs: 2 },
    tortoise: { reach: 1.0, every: 2.0, share: 0.25, shield: 0.06 },
  },
};

/** Is `k` one of the six. */
export function isCompanion(k: unknown): k is CompanionKind {
  return typeof k === 'string' && (COMPANION_GROUPS.hunt.kinds as readonly string[]).concat(COMPANION_GROUPS.wild.kinds).includes(k);
}

/** The group a kind is of. */
export function groupOf(k: CompanionKind): CompanionGroup {
  return COMPANION_GROUPS.hunt.kinds.includes(k) ? 'hunt' : 'wild';
}

/** The kind picked for a group: the one picked if it is of that group, else the first of the three. */
export function pickedIn(picks: Partial<Record<CompanionGroup, CompanionKind>> | undefined, group: CompanionGroup): CompanionKind {
  const p = picks?.[group];
  return p && COMPANION_GROUPS[group].kinds.includes(p) ? p : COMPANION_GROUPS[group].kinds[0];
}

/** What a save holds of the picks, made sound: only kinds of their own group. */
export function cleanPicks(v: unknown): Partial<Record<CompanionGroup, CompanionKind>> {
  const out: Partial<Record<CompanionGroup, CompanionKind>> = {};
  if (!v || typeof v !== 'object') return out;
  for (const g of COMPANION_GROUP_IDS) {
    const k = (v as Record<string, unknown>)[g];
    if (isCompanion(k) && groupOf(k) === g) out[g] = k;
  }
  return out;
}
