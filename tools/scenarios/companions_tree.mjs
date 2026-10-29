// THE RANGER'S COMPANIONS ON HIS TREE (game/talents.ts COMPANIONS; a page built with it on): the inventory's TALENTS page for
// a ranger at level 30, nothing taken, then each companion talent's card read.
//   node tools/playtest.mjs --file dist/trial_comp.html [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/companions_tree.mjs --out shots/comp/pc
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.talents.on = true;
    d.run('ranger', 21);
    d.seasoned(30);
    const g = d.game();
    d.autoLevel = false; d.autoWords = false;
    g.hero.pending = 0;
    g.hero.talents = [];
    g.refresh();
    d.invUi.talents.sel = null;
  });
  await page.waitForTimeout(400);
  await hands.press('button:NEW TALENT');
  await page.waitForTimeout(600);
  await snap('tree');
  for (const id of ['huntcompanion', 'wildcompanion']) {
    await page.evaluate((id) => { window.__dbg.invUi.talents.sel = id; }, id);
    await page.waitForTimeout(400);
    await snap(id);
  }
  // (and with the way to each taken, as a ranger who has spent six points on both)
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.talents = ['keeneye', 'venom', 'huntcompanion', 'fleet', 'windrunner', 'wildcompanion']; g.refresh(); window.__dbg.invUi.talents.sel = null; });
  await page.waitForTimeout(400);
  await snap('both');
}
