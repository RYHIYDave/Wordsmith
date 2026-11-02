// THE REVIEWS SAID (the floors 16 to 19 helper's own, while drawing): every boss check on the new moves, both ways round, what it finds.
//   npx tsx tools/action_f16_review.ts <who> [moves]
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import type { BossShape } from '../src/art/boss_checks';
import type { Mob } from '../src/art/new_mobs3';

const [who, list] = process.argv.slice(2);
void (async (): Promise<void> => {
  const sh = await import('../tests/action_f16_shapes');
  const rows: [string, Mob, BossShape, string[]][] = [];
  if (who === 'gardener') {
    const m = await import('../src/art/action_f16_gardener');
    rows.push(['gardener', m.LUNGE_GARDENER, sh.lungeShape(), ['attack']]);
  } else {
    const all = sh as unknown as Record<string, () => [string, Mob, BossShape, string[]][]>;
    if (all[`${who}Rows`]) rows.push(...all[`${who}Rows`]());
  }
  for (const [name, mob, shape, moves] of rows) {
    const mv = list ? (list === 'all' ? undefined : list.split(',')) : moves.length ? moves : undefined;
    const found = checkBoss(mob, shape, mv);
    console.log(name, found.length, 'found');
    for (const l of findingsSaid(found).slice(0, 40)) console.log('  ', l);
  }
})();
