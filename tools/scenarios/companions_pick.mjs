// THE RANGER'S COMPANIONS PICKED IN TOWN (game/companions.ts; a page built with COMPANIONS on): a ranger at level 35 (a point to spend, so that NEW TALENT opens the page) with both
// companion talents taken, in town, on the inventory's TALENTS page: the Hunting Companion's card with its three to pick
// from; the wolf picked; the Wild Companion's card. Then out of town: the card says to pick another in town.
//   node tools/playtest.mjs --file dist/trial_comp.html [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/companions_pick.mjs --out shots/comp/pick
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  let fails = 0;
  const check = (label, ok) => { if (!ok) { fails++; console.log(`  !! ${label}`); } else console.log(`  ok ${label}`); };
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.talents.on = true;
    d.run('ranger', 21);
    d.seasoned(35);
    const g = d.game();
    d.autoLevel = false; d.autoWords = false;
    g.hero.pending = 0;
    g.hero.talents = ['keeneye', 'venom', 'huntcompanion', 'fleet', 'windrunner', 'wildcompanion'];
    g.refresh();
    d.invUi.talents.sel = 'huntcompanion';
  });
  await page.waitForTimeout(400);
  check('in town', await page.evaluate(() => window.__dbg.game().level.town));
  await hands.press('button:NEW TALENT');
  await page.waitForTimeout(600);
  await snap('hunt');
  check('the hawk at his side first', await page.evaluate(() => window.__dbg.game().pets.map((p) => p.kind).join() === 'hawk,bat'));
  await hands.press('button:WOLF');
  await page.waitForTimeout(400);
  await snap('hunt_wolf');
  check('the wolf picked', await page.evaluate(() => window.__dbg.game().pets.some((p) => p.kind === 'wolf') && window.__dbg.game().hero.pets.hunt === 'wolf'));
  await page.evaluate(() => { window.__dbg.invUi.talents.sel = 'wildcompanion'; });
  await page.waitForTimeout(400);
  await snap('wild');
  if (fails) throw new Error(`${fails} thing(s) wrong with picking a companion`);
}
