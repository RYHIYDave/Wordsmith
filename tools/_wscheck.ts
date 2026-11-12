import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { WS_SHAPE, wsMob } from '../src/art/endless_boss';
const moves = (process.argv[2] ?? 'charge').split(',');
const f = checkBoss(wsMob(), WS_SHAPE, moves);
const said = findingsSaid(f);
console.log(said.length, 'findings');
for (const l of said.slice(0, 40)) console.log(l);
