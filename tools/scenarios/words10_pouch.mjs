// EVERY WORD CARRIED AT ONCE, AT A SERVICE ON A PHONE HELD SIDEWAYS (the ten new words live, 11 Nov 2026): with them there are
// 48 words and melded words; the panel's bottom turned to ALL has four lines, which held 44 of the narrow stones, so the stones
// sit a pixel closer there (ui/inventory.ts TIGHT_STONE). For the owner's picture of it. With FEW=1, 44 carried: as it was.
//   node tools/playtest.mjs --file dist/words10_live_sounds/words10_live.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words10_pouch.mjs --out shots/words10_live/pouch
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const few = !!process.env.FEW;
  const hands = await makeHands(page);
  const info = await page.evaluate((few) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 5); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.enterTown();
    const h = g.hero;
    const ids = Object.keys(h.words);
    let k = 0;
    for (const w of ids) h.words[w] = k++ < (few ? 44 : 999) ? 2 : 0;
    return { ids: ids.length, held: ids.filter((w) => h.words[w] > 0).length };
  }, few);
  log('words', JSON.stringify(info));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__dbg.open('armourer'));
  await page.waitForTimeout(900);
  log('pressed', await hands.press('button:ALL WORDS'));
  await page.waitForTimeout(600);
  const seen = (await hands.marks()).filter((m) => m.startsWith('word:')).length;
  console.log(`  ${seen === info.held ? 'ok' : '!!'} every word carried has its stone on the screen   (${seen} of ${info.held})`);
  await snap(few ? 'service_all_44' : 'service_all_48');
}
