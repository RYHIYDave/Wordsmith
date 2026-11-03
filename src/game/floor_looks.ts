// THE FIRST FIVE FLOORS' NEW LOOKS, SWITCHED ON TOGETHER: his word to the main chat, 2 Nov 2026, 15:25, “New looks for the first 5
// floors are almost done.  We want those in the release as well”; and, shown pictures of floors 3, 4 and 5 from the game itself
// (look3_sheet, look4_sheet, look5_sheet), his “Yes, switch them on (Recommended)” (2 Nov 2026, 18:11). Each was brought into the game
// behind the art chat's own switches, off (the art's tests hold each off as its files are imported): FLOOR 3, THE BLACK IRON PRISON
// (art/prison.ts PRISON: its look, the fire channel down each cell block; PRISON_GATE, his black iron gate; PRISON_EXIT, the door
// out the back of his hall, the way down); FLOOR 4, THE BURIED CHAPEL OF BONES (art/chapel.ts CHAPEL; CHAPEL_GATE, the bone grille);
// FLOOR 5, THE MINE THAT BECOMES HIS TEMPLE (art/lair_temple.ts LAIR_TEMPLE; LAIR_GATE, the hooked bars). And, shown pictures from the
// game of the first town as the castle's hall and of floor 1 as the king's tomb (castle_sheet, look1_sheet3), his “Yes, switch both
// on (Recommended)” (2 Nov 2026, 19:50): FLOOR 1, THE KING'S TOMB (art/tomb.ts TOMB; TOMB_GATE, the Warden's gate) and THE FIRST
// TOWN, THE CASTLE'S HALL (art/castle_hall.ts CASTLE_HALL). Here, as the game itself
// starts (main.ts, and so in the side painter's worker too, which runs the game's own script), they are put on, every one. The unit
// tests (which do not start the game) see each as its own file has it, and turn on what they test.
import { PRISON } from '../art/prison';
import { PRISON_GATE } from '../art/prison_gate';
import { PRISON_EXIT } from '../art/prison_exit';
import { CHAPEL } from '../art/chapel';
import { CHAPEL_GATE } from '../art/chapel_gate';
import { LAIR_TEMPLE } from '../art/lair_temple';
import { LAIR_GATE } from '../art/lair_gate';
import { TOMB } from '../art/tomb';
import { TOMB_GATE } from '../art/tomb_gate';
import { CASTLE_HALL } from '../art/castle_hall';

/** His yes: on. */
export const FLOOR_LOOKS = { on: true };
/** Every switch it puts on. */
export const FLOOR_LOOK_SWITCHES: readonly { on: boolean }[] = [PRISON, PRISON_GATE, PRISON_EXIT, CHAPEL, CHAPEL_GATE, LAIR_TEMPLE, LAIR_GATE, TOMB, TOMB_GATE, CASTLE_HALL];
/** Put them all on (or off). */
export function useFloorLooks(on: boolean): void {
  for (const s of FLOOR_LOOK_SWITCHES) s.on = on;
}
