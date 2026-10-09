// THE FOUR NEW WORDS (Version 19.3: Heavy, Precise, Frenzied, Guarding): the screens they appear
// on, photographed for the owner (pictures first). A character who has found all thirteen words
// and holds some of each. Not part of tools/regress.sh.
//   node tools/build_to.mjs dist/w193.html
//   node tools/playtest.mjs --file dist/w193.html --scenario tools/scenarios/words193_look.mjs --out shots/w193/pc
//   node tools/playtest.mjs --file dist/w193.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words193_look.mjs --out shots/w193/ph
//   ONLY=inv,lexicon,title (a comma list); CLS=warrior|ranger|mage
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const want = (k) => only.length === 0 || only.includes(k);
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(400);
  await page.evaluate((cls) => {
    const d = window.__dbg; d.run(cls, 11); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); const h = g.hero;
    while (h.level < 8) g.gainXp(200);
    const prim = { warrior: 'str', ranger: 'dex', mage: 'int' }[cls];
    while (h.pending > 0) g.chooseAttr(prim);
    for (const w of Object.keys(h.words)) { h.words[w] = 1; g.meta.known[w].found = true; }
    Object.assign(h.words, { heavy: 2, guarding: 2 });
    h.gold = 900;
    g.refresh();
  }, cls);
  await page.waitForTimeout(700);
  if (want('inv')) {
    await page.evaluate(() => window.__dbg.inv());
    await page.waitForTimeout(400);
    await hands.press('tab:attacks');
    await page.waitForTimeout(300);
    await snap('01_inv_attacks_all_words');
    // Heavy in front of the quick attack, of Warding behind the slow one
    await page.evaluate(() => { const g = window.__dbg.game(); g.socket(0, 'front', 'heavy'); g.socket(1, 'behind', 'guarding'); });
    await page.waitForTimeout(300);
    await snap('02_inv_attacks_worded');
    const s0 = await hands.mark('socket:0:front:0');
    if (s0) { await hands.pressAt(s0.x, s0.y); await page.waitForTimeout(250); await snap('03_inv_heavy_set'); }
    await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
    await page.waitForTimeout(200);
  }
  if (want('lexicon')) {
    await page.evaluate(() => window.__dbg.open('lexicon'));
    await page.waitForTimeout(300);
    await snap('04_lexicon_all');
    for (const w of ['heavy', 'precise', 'frenzied', 'guarding']) {
      await hands.press(`lex:${w}`);
      await page.waitForTimeout(200);
      await snap(`05_lexicon_${w}`);
    }
    await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
    await page.waitForTimeout(200);
  }
  if (want('title')) {
    await page.evaluate(() => window.__dbg.toTitle());
    await page.waitForTimeout(600);
    await hands.press('button:LEXICON');
    await page.waitForTimeout(400);
    await snap('06_title_lexicon');
    await hands.press('lex:heavy');
    await page.waitForTimeout(200);
    await snap('07_title_lexicon_heavy');
  }
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
