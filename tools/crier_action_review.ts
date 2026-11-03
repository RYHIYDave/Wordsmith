// THE CRIER'S NEW MOVES THROUGH THE WHOLE BOSSES' REVIEW (the helper's own, while drawing): every finding. Nothing of the game imports it.
//   npx tsx tools/crier_action_review.ts [moves,...]
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { CR_ACT_MOVES, CR_ACT_SHAPE, crierActionMob } from '../src/art/crier_action';

const moves = process.argv[2] ? process.argv[2].split(',') : [...CR_ACT_MOVES];
const found = checkBoss(crierActionMob(), CR_ACT_SHAPE, moves);
console.log(found.length ? findingsSaid(found).join('\n') : 'nothing found');
