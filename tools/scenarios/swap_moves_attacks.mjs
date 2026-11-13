// THE MAGE'S ATTACKS PAGE WITH HER MOVES TO SWAP (game/swap_moves.ts, behind SWAP_MOVES): her tap touched, its read-out with
// CHANGE TO ..., then pressed, through the game's own page; pictures for him. Not a test.
//   node tools/playtest.mjs --file dist/swapfilm.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/swap_moves_attacks.mjs --out shots/swapatk/a
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.swapMoves.on = true;
    d.run('mage', 21);
    d.seasoned(20);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game();
    g.hero.talents = ['kindling', 'ball', 'charged', 'beam', 'bittercold', 'spear'];
    g.hero.pending = 0;
    g.refresh();
  });
  await page.waitForTimeout(500);
  // (a press on her tap's plate opens the inventory at it, its ATTACKS page)
  await hands.press('button:INVENTORY');
  await page.waitForTimeout(600);
  await hands.press('tab:attacks').catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => { window.__dbg.invUi.focus = 0; });
  await page.waitForTimeout(700);
  await snap('1_tap_touched');
  for (let k = 0; k < 3; k++) {
    await hands.press('button:CHANGE');
    await page.waitForTimeout(400);
    await snap(`2_changed_${k + 1}`);
  }
  log('her tap and hold now', await page.evaluate(() => window.__dbg.game().hero.skills.map((s) => s.id).slice(0, 2).join(', ')));
}
