// THE MAGE AS SHE WAS (art/mage_up.ts MAGE_UP, on since 25.3.4, 11 Nov 2026, his yes in the Mage chat): for the tests that ask of
// the old Mage's pictures (art/moves3.ts, art/heroes3.ts PLANS), which are kept: her switch off. Called at the top of such a
// test file, beside heroesAsBefore() (each file is run alone). In a file of its own, not in helpers.ts, so that it does not
// pull every test into a --changed run (his rule of 7 Nov 2026).
import { MAGE_UP } from '../src/art/mage_up';

export function mageAsBefore(): void {
  MAGE_UP.on = false;
}
