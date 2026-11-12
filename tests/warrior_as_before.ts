// THE WARRIOR AS HE WAS (game/talents.ts WARRIOR_TREE2, on since 12 Nov 2026 at his “Yes, put it live (Recommended)”): for the
// tests of the game's own ways that were written with the Warrior's old moves (his hold Whirlwind from the start: a held attack;
// the old tree). With his new tree on, a Warrior begins with the greatsword's Strike, Whirl (one spin, not held) and Lunge, and
// Whirlwind is a talent of his tree; those ways are held by tests/warrior_tree*.test.ts. Called at the top of such a test file
// (each file is run alone). In a file of its own, not in helpers.ts, so that it does not pull every test into a --changed run
// (his rule of 7 Nov 2026).
import { WARRIOR_TREE2 } from '../src/game/talents';

export function warriorAsBefore(): void {
  WARRIOR_TREE2.on = false;
}
