// THE NEW ENEMY MOVES, FLOORS 5 TO 19, SWITCHED ON TOGETHER: his “All of them together” (2 Nov 2026, about 10:25, asked how the new
// moves go live) and, shown pictures of every one of them from the game, his “Yes, switch them on (Recommended)” (2 Nov 2026, 15:13).
// Each was brought into the game behind the art chat's own switch, off (the art's tests hold each off as its files are imported, and
// hash the game's old frames by it); here, as the game itself starts (main.ts, and so in the side painter's worker too, which runs the
// game's own script), they are put on, every one: the Fleshmancer's and the mini fleshmancer's (FM_ACTION, with the art's FLESH_ACTION);
// floors 6 to 8's mobs and the Carrion Queen; floors 9 and 10's and the Hollow Stag; floors 11 to 15's mobs, the Crier, the Rat King and
// the Physician; floors 16 to 19's (behind HIGH_CITY, off: no one reaches them yet). And THE CHAINED ONE'S NEW BODY (art/chained_look.ts
// CHAINED_LOOK with the rules' CO_LOOK: art/bestiary.ts useChainedLook), shown him from the game with the Amalgamation's grasping fan:
// “Yes, both in (Recommended)”, 2 Nov 2026, 15:24. The unit tests (which do not start the game) see each as its own file has it, and
// turn on what they test.
import { useChainedLook, useFmAction } from '../art/bestiary';
import { FIREPOT_BLAZE } from './act1_rules/firepot';
import { CHANTER_LIGHTNING } from './act1_rules/chanter';
import { GOLEM_BOULDER } from './act1_rules/qgolem';
import { SCORPION_SPIT } from './act1_rules/scorpion';
import { DEVIL_TWISTER } from './act1_rules/devil';
import { QUEEN_ACTION } from './act1_rules/queen';
import { DEER_BRAMBLE } from './act1_rules/deer';
import { WOLF_PACK } from './act1_rules/wolf';
import { DROWNED_RETCH } from './act1_rules/drowned';
import { STAG_ACTION } from './act1_rules/stag';
import { WATCH_LANTERN } from './act1_rules/watch';
import { FIELD_HARVEST } from './act1_rules/fieldhand';
import { ORDERLY_GURNEY } from './act1_rules/orderly';
import { WARDEN_BARRAGE } from './act1_rules/bookwarden';
import { CRIER_ACTION } from './act1_rules/crier';
import { RATKING_ACTION } from './act1_rules/ratking';
import { PHYSICIAN_ACTION } from './act1_rules/physician';
import { GARDENER_HEDGE } from './act1_rules/gardener';
import { GROOM_HORSE } from './act1_rules/groom';
import { GUARD_DRILL } from './act1_rules/pguard';
import { DANCER_THROW } from './act1_rules/dancer';
import { KNIGHT_BANNER } from './act1_rules/kknight';

/** His yes: on. */
export const ENEMY_MOVES = { on: true };
/** Every switch it puts on (the Fleshmancer's two go together: useFmAction). */
export const ENEMY_SWITCHES: readonly { on: boolean }[] = [
  FIREPOT_BLAZE, CHANTER_LIGHTNING, GOLEM_BOULDER, SCORPION_SPIT, DEVIL_TWISTER, QUEEN_ACTION,
  DEER_BRAMBLE, WOLF_PACK, DROWNED_RETCH, STAG_ACTION,
  WATCH_LANTERN, FIELD_HARVEST, ORDERLY_GURNEY, WARDEN_BARRAGE, CRIER_ACTION, RATKING_ACTION, PHYSICIAN_ACTION,
  GARDENER_HEDGE, GROOM_HORSE, GUARD_DRILL, DANCER_THROW, KNIGHT_BANNER,
];
/** All of them on (or off) together. */
export function useEnemyMoves(on: boolean): void {
  for (const sw of ENEMY_SWITCHES) sw.on = on;
  useFmAction(on);
  useChainedLook(on);
}
