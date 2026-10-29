// The Queen's boss review, said shortly (art/boss_checks.ts on art/queen_moves.ts): every finding, the worst of each
// kind in each move. Nothing of the game imports it.
//   tsx tools/queen_check.ts [move ...]
import { checkBoss, findingsSaid, movesOf } from '../src/art/boss_checks';
import { QN_SHAPE, QUEEN } from '../src/art/queen_moves';

const want = process.argv.slice(2);
const moves = want.length ? want : movesOf(QUEEN);
const found = checkBoss(QUEEN, QN_SHAPE, moves);
console.log(`${found.length} findings in ${moves.join(', ')}`);
for (const line of findingsSaid(found).slice(0, 60)) console.log('  ' + line);
