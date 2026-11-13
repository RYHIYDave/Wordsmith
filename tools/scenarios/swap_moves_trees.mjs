// THE MAGE'S AND THE RANGER'S TREES WITH THEIR MOVES TO SWAP, DRAFTED (game/talents.ts SWAP_MOVES; docs/mockups/swap_moves/README.md):
// pictures for him from the game's own TALENTS page, each hero at level 50: the tree clean, then the new stones' cards. Not a test.
//   node tools/build_to.mjs dist/swaptrees.html
//   node tools/playtest.mjs --file dist/swaptrees.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/swap_moves_trees.mjs --out shots/swaptrees/x
import { log, makeHands } from './lib.mjs';

async function treeOf(page, snap, hands, cls, cards) {
  await page.evaluate((cls) => {
    const d = window.__dbg;
    d.saving(false);
    d.talents.on = true;
    d.swapMoves.on = true;
    d.run(cls, 21);
    d.seasoned(50);
    const g = d.game();
    d.autoLevel = false; d.autoWords = false;
    g.hero.pending = 0;
    g.hero.talents = [];
    g.refresh();
    d.invUi.talents.sel = null;
  }, cls);
  await page.waitForTimeout(600);
  await hands.press('button:NEW TALENT');
  await page.waitForTimeout(700);
  await snap(`${cls}_1_clean`);
  for (const id of cards) {
    await hands.press(`talent:${id}`);
    await page.waitForTimeout(350);
    await snap(`${cls}_2_card_${id}`);
  }
  const n = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].filter((m) => m.startsWith('talent:')).length);
  log(cls, 'stones', n);
  await hands.press('button:CLOSE').catch(() => {});
  await page.waitForTimeout(300);
}

export default async function (page, snap) {
  const hands = await makeHands(page);
  await treeOf(page, snap, hands, 'mage', ['ball', 'beam', 'spear', 'aura', 'lasting']);
  await treeOf(page, snap, hands, 'ranger', ['snare', 'snipe', 'rally']);
}
