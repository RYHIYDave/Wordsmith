import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { WS_SHAPE, wsMob } from '../src/art/endless_boss';
const found = checkBoss(wsMob(), WS_SHAPE, (process.argv[2] ?? 'fall').split(','));
for (const l of findingsSaid(found)) console.log(l);
console.log('findings', found.length);
