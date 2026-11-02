// (the floors 11 to 15 helper's own, while drawing: the rest poses and where the hands are)
import { WATCH_REST, WATCH_BODY } from '../src/art/hushed_watch';
import { FH_REST, FH_BODY } from '../src/art/fieldhands';
import { ORDERLY_REST, ORDERLY_BODY } from '../src/art/orderlies';
import { WB_REST, WB_BODY } from '../src/art/bookwardens';
import { solve } from '../src/art/skeleton';
import type { Posed } from '../src/art/skeleton';
import { TILE3 } from '../src/art/new_mobs3';
console.log('TILE3', TILE3);
for (const [n, R, B] of [['watch', WATCH_REST, WATCH_BODY], ['field', FH_REST, FH_BODY], ['orderly', ORDERLY_REST, ORDERLY_BODY], ['warden', WB_REST, WB_BODY]] as const) {
  const s = solve(B, R as Posed);
  const r = (v: number[]) => v.map((x) => x.toFixed(1)).join(',');
  console.log(n, JSON.stringify(R));
  console.log('  head', r(s.head), 'shL', r(s.shoulderL), 'shR', r(s.shoulderR), 'handL', r(s.handL), 'handR', r(s.handR), 'pelvis', r(s.pelvis), 'hipL', r(s.hipL), 'upperArm', B.upperArm, 'foreArm', B.foreArm);
}
