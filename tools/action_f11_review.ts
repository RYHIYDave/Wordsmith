// THE REVIEWS SAID (the floors 11 to 15 helper's own, while drawing): every boss check on the new moves, both ways round, what it finds.
//   npx tsx tools/action_f11_review.ts <who> [moves]
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import type { BossShape } from '../src/art/boss_checks';
import type { Mob } from '../src/art/new_mobs3';

const [who, list] = process.argv.slice(2);
void (async (): Promise<void> => {
  const sh = await import('../tests/action_f11_shapes');
  const rows: [string, Mob, BossShape, string[]][] = [];
  if (who === 'watch') {
    const m = await import('../src/art/action_f11_watch');
    rows.push(['watchman', m.LANTERN_WATCHMAN, sh.lanternShape(m.LANTERN_WATCHMAN), ['attack', 'lantern']]);
  } else if (who === 'watchall') {
    const m = await import('../src/art/action_f11_watch');
    for (const mob of [m.LANTERN_WATCHMAN, m.LANTERN_SERGEANT]) rows.push([mob.id, mob, sh.lanternShape(mob), []]);
  } else if (who === 'field') {
    const m = await import('../src/art/action_f11_field');
    rows.push(['reaper', m.HARVEST_REAPER, sh.harvestShape(), ['attack']]);
  } else if (who === 'orderly') {
    const m = await import('../src/art/action_f11_orderly');
    rows.push(['orderly', m.GURNEY_ORDERLY, sh.gurneyShape(), ['attack', 'gurney']]);
  } else if (who === 'warden') {
    const m = await import('../src/art/action_f11_warden');
    rows.push(['warden', m.BARRAGE_WARDEN, sh.barrageShape(), ['attack', 'barrage']]);
  }
  for (const [name, mob, shape, moves] of rows) {
    const mv = list ? list.split(',') : moves.length ? moves : undefined;
    const found = checkBoss(mob, shape, mv);
    console.log(name, found.length, 'found');
    for (const l of findingsSaid(found).slice(0, 40)) console.log('  ', l);
  }
})();
