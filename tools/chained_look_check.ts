// The whole bosses' review of the new look (art/boss_checks.ts checkBoss), as tests/chained_look.test.ts runs it: what is found, the
// worst of each. `approved`: the new body on his bones at the size his moves were approved at; else at his new size.
//   npx tsx tools/chained_look_check.ts [freed] [approved] [moves,...]
import { chainedActionMob } from '../src/art/chained_action';
import { chainedLookMob, lookShape, lookShapeApproved } from '../src/art/chained_look';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
const freed = Number(process.argv[2] ?? 0) as 0 | 1 | 2;
const approved = process.argv[3] === 'approved';
const moves = process.argv[4] ? process.argv[4].split(',') : undefined;
const t0 = Date.now();
const found = approved ? checkBoss(chainedActionMob(freed), lookShapeApproved(chainedActionMob(freed)), moves) : checkBoss(chainedLookMob(freed), lookShape(chainedLookMob(freed)), moves);
console.log(`freed ${freed}${approved ? ' (approved size)' : ''}: ${found.length} found, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
for (const l of findingsSaid(found).slice(0, 40)) console.log(' ', l);
