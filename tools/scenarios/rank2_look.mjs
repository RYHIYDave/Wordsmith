// RANK II (game/melds.ts), behind RANK2, which is off in the game: pictures for the owner, with it switched on
// by the test hook (__dbg.rank2). His words, 18 Oct 2026, 08:49: "Please add the second level (poison+poison)
// melding into the game"; to the reading of it, 08:56: "Yep go". Nothing here is in the game until he has seen it
// and said yes.
//   1. the wordsmith's melding page; two Poison laid in, Poison II shown as what comes out; Poison II made
//   2. the inventory: Poison II in the pouch and read; on the Strike, against Poison on it
// Checked as it goes: the melding is done by the game's own rules, and comes out as they say.
//   node tools/build_to.mjs dist/rank2.html
//   node tools/playtest.mjs --file dist/rank2.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/rank2_look.mjs --out shots/rank2/r
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const check = (what, cond, more = '') => { console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };

  // ---- 1. at the wordsmith ----
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.meld(true); d.rank2(true);
    d.run('ranger', 31); d.seasoned(6);
    const g = d.game(); g.depth = 6; g.cleared = 5;
    const h = g.hero;
    h.dust = 3; h.meld = 'open';
    h.words.poison = 3;
    for (const w of ['fire', 'frost']) h.words[w] = Math.max(1, h.words[w]);
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__dbg.open('wordsmith'));
  await page.waitForTimeout(400);
  await hands.press('button:MELD');
  await page.waitForTimeout(300);
  check('the tab turns his half to melding', await page.evaluate(() => window.__dbg.panels.meldPage));
  await snap('01_melding_empty');
  await page.evaluate(() => { window.__dbg.panels.meldIn = ['poison', 'poison']; window.__dbg.game().melded = null; });
  await page.waitForTimeout(300);
  check('two Poison may be melded', await page.evaluate(() => window.__dbg.game().meldProblem('poison', 'poison') === null));
  await snap('02_two_poison_laid_in');
  await hands.press('button:MELD: 1 RUNEDUST');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return { poison: h.words.poison, poison2: h.words.poison2, dust: h.dust, made: g.melded }; });
  check('MELD: two Poison used up, Poison II made, a runedust spent', after.poison === 1 && after.poison2 === 1 && after.dust === 2 && after.made && after.made.word === 'poison2', JSON.stringify(after));
  await snap('03_poison_ii_made');
  await hands.press('button:DONE');
  await page.waitForTimeout(300);

  // ---- 2. the inventory: Poison II, read, and on the Shot against Poison ----
  await page.evaluate(() => window.__dbg.inv(0));
  await page.waitForTimeout(500);
  for (const w of ['poison', 'poison2']) {
    await page.evaluate((word) => {
      const g = window.__dbg.game(); const h = g.hero; const s = h.skills[0];
      for (const x of [...s.front]) if (x) { h.words[x] = (h.words[x] ?? 0) + 1; }
      s.front = s.front.map(() => null);
      s.front[0] = word; h.words[word]--;
      g.refresh();
    }, w);
    // (the attack's new name is called out over the game first: it fades before the card is read; the inventory opened afresh, nothing being read)
    await page.waitForTimeout(3500);
    if (await hands.mark('button:DONE')) await hands.press('button:DONE');
    await page.waitForTimeout(300);
    await page.evaluate(() => window.__dbg.inv(0));
    await page.waitForTimeout(500);
    if (await hands.mark('socket:0:front:0')) await hands.press('socket:0:front:0');
    await page.waitForTimeout(300);
    const lines = await page.evaluate(() => window.__dbg.game().hero.skills[0].r.lines);
    check(`the Shot with ${w} in front`, true, JSON.stringify(lines));
    await snap(`05_shot_with_${w}`);
  }
  // (last: Poison II read in the pouch; pressed, it is in hand)
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.words.poison2 = (h.words.poison2 ?? 0) + 1; });
  await page.waitForTimeout(300);
  if (await hands.mark('word:poison2')) await hands.press('word:poison2');
  await page.waitForTimeout(300);
  await snap('06_poison_ii_in_the_pouch');
}
