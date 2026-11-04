// VOLATILE MELDED AT THE WORDSMITH BY HAND (ui/meld.ts). His words, 4 Nov 2026, 00:18: “They’re already in the game but I can’t meld
// them”: the rules let Volatile meld with a damage word since Version 23.9, but the melding page let in damage words only (the old
// playtest laid its words in by code). Here, by real presses: Volatile and Fire tapped into the hollows; MELD: Powder Keg.
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/volatile_meld_ui.mjs --out shots/vmeld
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const check = (what, cond, more = '') => { console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.meld(true);
    d.run('tinkerer', 31); d.seasoned(3);
    const g = d.game(); g.depth = 6; g.cleared = 5;
    const h = g.hero;
    h.dust = 3; h.meld = 'open';
    h.words.volatile = Math.max(1, h.words.volatile); h.words.fire = Math.max(1, h.words.fire);
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__dbg.open('wordsmith'));
  await page.waitForTimeout(400);
  await hands.press('button:MELD');
  await page.waitForTimeout(300);
  check('melding open', await page.evaluate(() => window.__dbg.panels.meldPage));
  for (const [i, w] of ['volatile', 'fire'].entries()) {
    await hands.press(`word:${w}`);
    await page.waitForTimeout(250);
    // (a word pressed is in hand: a press on the next hollow lays it in, as the page says)
    await hands.press(`meld:${i}`);
    await page.waitForTimeout(250);
  }
  const laid = await page.evaluate(() => window.__dbg.panels.meldIn.slice());
  await snap('laid');
  check('Volatile and Fire laid in', laid.includes('volatile') && laid.includes('fire'), JSON.stringify(laid));
  await hands.press('button:MELD: 1 RUNEDUST');
  await page.waitForTimeout(600);
  const made = await page.evaluate(() => { const g = window.__dbg.game(); return { melded: g.melded, keg: g.hero.words.powderkeg }; });
  check('melded: Powder Keg', made.keg >= 1, JSON.stringify(made));
}
