// THE TOWNS AS THEY WERE (art/shaft_rim.ts ENDLESS_TOWN, on since 25.3.7, 11 Nov 2026, his yes to the Endless town in the game):
// for the tests of the camp's ways that beat floor 15 and ask that home is the camp. In the tests floor 15 is the last floor
// built (the High City is put on by main.ts, not here: game/act1.ts lastFloor), so beating it opens endless, and with the Endless
// town on home is then the Shaft's Rim (tests/rim_town.test.ts holds that). In the game the last floor is 20, and floor 15's home
// is the camp for as long as endless is not open to him. Called at the top of such a test file (each file is run alone). In a
// file of its own, not in helpers.ts, so that it does not pull every test into a --changed run (his rule of 7 Nov 2026).
import { ENDLESS_TOWN } from '../src/art/shaft_rim';

export function townsAsBefore(): void {
  ENDLESS_TOWN.on = false;
}
