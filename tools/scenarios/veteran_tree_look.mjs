// THE VETERAN'S TREE, DRAFTED (game/talents.ts VETERAN_TREE, behind game/veteran.ts VETERAN; his 3 Nov 2026, 09:18: “And redo the
// skill tree to better match his new style”): pictures for him from the game's own TALENTS page, the Brawler at level 50 (all ten
// points): the tree clean; a few taken; a card of each kind read. Not a test. A page built with the Brawler in:
//   node tools/build_brawler_to.mjs dist/brawler.html
//   node tools/playtest.mjs --file dist/brawler.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/veteran_tree_look.mjs --out shots/vtree/x
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.talents.on = true;
    d.veteran.on = true;
    d.run('brawler', 21);
    d.seasoned(50);
    const g = d.game();
    d.autoLevel = false; d.autoWords = false;
    g.hero.pending = 0;
    g.hero.talents = [];
    g.refresh();
    d.invUi.talents.sel = null;
  });
  await page.waitForTimeout(600);
  await hands.press('button:NEW TALENT');
  await page.waitForTimeout(700);
  await snap('1_clean');
  for (const id of ['vlauncher', 'vviperjab', 'vthunderknee', 'vfirestarter', 'vfullset', 'vaftershock']) {
    await hands.press(`talent:${id}`);
    await page.waitForTimeout(350);
    await snap(`2_card_${id}`);
  }
  await page.evaluate(() => { const d = window.__dbg; const g = d.game(); g.hero.talents = ['vstiffjab', 'vviperjab', 'vknockdown', 'vlauncher', 'vlightfeet', 'vstoke', 'vhangtime', 'vfullset']; g.refresh(); d.invUi.talents.sel = null; });
  await page.waitForTimeout(500);
  await snap('3_taken');
  const n = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].filter((m) => m.startsWith('talent:')).length);
  log('stones', n);
}
