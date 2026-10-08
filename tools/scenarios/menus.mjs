// The menus, for whoever is trimming or restyling them: the starting screen with a saved run and
// without, the options, the class cards, the pause menu.
//   node tools/playtest.mjs --scenario tools/scenarios/menus.mjs --out shots/menus
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(400);
  await snap('01_title');
  await hands.press('button:OPTIONS');
  await page.waitForTimeout(200);
  await snap('02_options');
  await hands.press('button:PRACTICE ROOM');
  await page.waitForTimeout(200);
  await snap('03_practice_classes');
  await hands.press('button:BACK');
  await page.waitForTimeout(150);
  await hands.press('button:BACK');
  await page.waitForTimeout(150);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(200);
  await snap('04_classes');
  await hands.press('class:warrior');
  await page.waitForTimeout(900);
  await hands.press('button:II');
  await page.waitForTimeout(300);
  await snap('05_pause');
}
