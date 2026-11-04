// THE WORDS' PANEL FOLDED (WORD_FOLD, ui/inventory.ts): his 3 Nov 2026, 22:03, “The bag of words needs to be collapsible in the
// inventory”. A hero holding many words, the inventory open: the words' panel over the game's half open; HIDE pressed (a real touch):
// folded to its line; closed and opened again: still folded; SHOW pressed: open again, its words all there; a word pressed: in hand.
//   node tools/playtest.mjs --file dist/fold.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/word_fold.mjs --out shots/fold
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const check = (what, cond, more = '') => { console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 5); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.wordFold.on = true;
    const h = d.game().hero;
    for (const w of Object.keys(h.words)) h.words[w] = 2;
  });
  const look = () => page.evaluate(() => {
    const d = window.__dbg; const m = d.ui.marks; const r = m.get('words');
    return { panel: r ? { y: r.y, h: r.h } : null, words: [...m.keys()].filter((k) => k.startsWith('word:')).length, hide: m.has('button:HIDE WORDS'), show: m.has('button:SHOW WORDS'), fold: !!d.invUi.fold };
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(800);
  const a = await look();
  log('open', JSON.stringify(a));
  await snap('a_open');
  check('the panel open, its words in it, HIDE at its line', a.panel && a.words > 10 && a.hide && !a.show, a.words);
  log('pressed', await hands.press('button:HIDE WORDS'));
  await page.waitForTimeout(500);
  const b = await look();
  log('folded', JSON.stringify(b));
  await snap('b_folded');
  check('folded to its line: no words, SHOW', b.panel && b.panel.h < 20 && b.words === 0 && b.show && !b.hide, b.panel && b.panel.h);
  check('the game still there: the inventory open', await page.evaluate(() => window.__dbg.ui.marks.has('page:gear')));
  // (closed: a touch on the game's half, away from the words' panel)
  const at = await page.evaluate(() => window.__dbg.screen.toClient(20, 20));
  await page.touchscreen.tap(at.x, at.y);
  await page.waitForTimeout(500);
  check('closed', !(await page.evaluate(() => window.__dbg.ui.marks.has('page:gear'))));
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(600);
  const c = await look();
  check('closed and opened again: still folded', c.words === 0 && c.show, JSON.stringify(c));
  log('pressed', await hands.press('button:SHOW WORDS'));
  await page.waitForTimeout(500);
  const e = await look();
  await snap('c_open_again');
  check('SHOW: open again, every word there', e.words === a.words && e.hide && e.panel.h === a.panel.h, e.words);
  const w = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].find((k) => k.startsWith('word:')));
  log('pressed', await hands.press(w));
  await page.waitForTimeout(400);
  check('a word pressed: in hand', await page.evaluate(() => !!window.__dbg.invUi.word));
}
