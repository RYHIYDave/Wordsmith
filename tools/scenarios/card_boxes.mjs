// THE CLASS CARDS' PORTRAITS, CUT OR WHOLE (the queue's item of his own, 12 Nov 2026: “the warlock has the entire box for his
// idle animations and i can see the line in all the other portraits where the cutoff is.  go ahead and make all of them like the
// warlock”). Stills of the class cards as they stand (WAIT ms for their pictures to be painted), then with each card chosen in
// turn (a chosen hero walks on the spot), for the pictures.
//   node tools/playtest.mjs --file <page> --touch --size 844x390 --dpr 3 --scenario tools/scenarios/card_boxes.mjs --out shots/cards/x
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.toTitle && d.toTitle(); d.titlePage('class'); });
  await page.waitForTimeout(Number(process.env.WAIT || 30000));
  for (let k = 0; k < Number(process.env.STILLS || 3); k++) {
    await snap(`idle_${k}`);
    await page.waitForTimeout(1300);
  }
  for (const id of (process.env.CHOOSE || 'warrior,ranger,mage,tinkerer,brawler').split(',')) {
    const ok = await page.evaluate((id) => window.__dbg.ui.marks.has(`class:${id}`), id);
    if (!ok) continue;
    await hands.press(`class:${id}`, 0, true);
    await page.waitForTimeout(1500);
    await snap(`chosen_${id}`);
  }
  log('cards', 'done');
}
