// THE TRY-OUT PAGE (tools/build_tryout.mjs): its options take a seasoned hero straight to a floor of the
// first five, by pressing, as he would.
//   node tools/build_tryout.mjs
//   node tools/playtest.mjs --file dist/tryout_page.html --scenario tools/scenarios/tryout.mjs --out shots/first5/tryout
// FLOOR: which floor (3).
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const want = Number(process.env.FLOOR || 3);
  const hands = await makeHands(page);
  await page.waitForTimeout(800);
  await hands.press('button:OPTIONS');
  for (let k = 1; k < want; k++) await hands.press('button:TRY: FLOOR');
  await snap('options');
  await hands.press('button:GO TO FLOOR');
  await hands.press('class:warrior');
  await page.waitForTimeout(2500);
  const st = await page.evaluate(() => { const g = window.__dbg.game(); return g ? { depth: g.depth, practice: g.practice, town: g.level.town, dressed: !!g.level.dress, level: g.hero.level, boss: g.monsters.find((m) => m.boss)?.kind } : null; });
  log('tryout', JSON.stringify(st));
  await snap('floor');
}
