// THE WARRIOR'S NEW TREE, DRAFTED (game/talents.ts WARRIOR2, behind WARRIOR_TREE2; his 7 Nov 2026: “Show me your idea for the tree
// and I’ll look at it”): pictures for him from the game's own TALENTS page, the Warrior at level 50: the tree clean; a card of each
// kind read; the Greatsword taken with some of its row and of IRON. Not a test.
//   node tools/build_to.mjs dist/wtree.html
//   node tools/playtest.mjs --file dist/wtree.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/warrior_tree2_look.mjs --out shots/wtree/x
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.talents.on = true;
    d.warriorTree2.on = true;
    d.run('warrior', 21);
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
  for (const id of ['greatsword', 'gswhirlwind', 'honededge', 'mastertop', 'thickskin']) {
    await hands.press(`talent:${id}`);
    await page.waitForTimeout(350);
    await snap(`2_card_${id}`);
  }
  await page.evaluate(() => { const d = window.__dbg; const g = d.game(); g.hero.talents = ['greatsword', 'gswhirlwind', 'sweepingcut', 'drilledleap', 'honededge', 'thickskin', 'shieldwall']; g.refresh(); d.invUi.talents.sel = null; });
  await page.waitForTimeout(500);
  await snap('3_taken');
  const n = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].filter((m) => m.startsWith('talent:')).length);
  log('stones', n);
}
