// THE PHYSICIAN'S NEW MOVES THROUGH THE WHOLE BOSSES' REVIEW (the helper's own, while drawing): every finding. Nothing of the game imports it.
//   npx tsx tools/physician_action_review.ts [moves,...]
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { PH_ACT_MOVES, PH_ACT_SHAPE, physicianActionMob } from '../src/art/physician_action';

const moves = process.argv[2] ? process.argv[2].split(',') : [...PH_ACT_MOVES];
const found = checkBoss(physicianActionMob(), PH_ACT_SHAPE, moves);
console.log(found.length ? findingsSaid(found).join('\n') : 'nothing found');
