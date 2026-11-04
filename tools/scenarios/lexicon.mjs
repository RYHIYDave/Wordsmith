// HIS OWN LEXICON (WORD_LEX, ui/inventory.ts): his 3 Nov 2026, by 22:15, “a lexicon button near the gold and the level and keep the
// little bar of wards above the inventory ... hit the button to expand the full lexicon with all your words”. A hero holding many
// words, the inventory open: the line over the bag, LEXICON beside the gold; LEXICON pressed (a real touch): every word over the
// game's half, the line staying; closed and opened again: still open; a word in the lexicon pressed: in hand; LEXICON again: put away.
//   node tools/playtest.mjs --file dist/lex.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/lexicon.mjs --out shots/lex
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const check = (what, cond, more = '') => { console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const n = await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 5); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.wordLex.on = true;
    const h = d.game().hero;
    for (const w of Object.keys(h.words)) h.words[w] = 2;
    return Object.keys(h.words).length;
  });
  const look = () => page.evaluate(() => {
    const d = window.__dbg; const m = d.ui.marks;
    return { panel: m.has('words'), words: [...m.keys()].filter((k) => k.startsWith('word:')).length, lex: m.has('button:LEXICON'), bag: m.has('bag:0'), open: !!d.invUi.lex };
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(800);
  const a = await look();
  log('shut', JSON.stringify(a));
  await snap('a_line');
  check('the line over the bag, LEXICON, no panel', a.lex && a.bag && !a.panel && a.words > 0 && a.words < n, `${a.words} of ${n}`);
  log('pressed', await hands.press('button:LEXICON'));
  await page.waitForTimeout(500);
  const b = await look();
  log('open', JSON.stringify(b));
  await snap('b_lexicon');
  check('the lexicon open over the game: every word, the line still there', b.panel && b.open && b.bag && b.words === n, b.words);
  const at = await page.evaluate(() => window.__dbg.screen.toClient(20, 20));
  await page.touchscreen.tap(at.x, at.y);
  await page.waitForTimeout(500);
  check('closed', !(await page.evaluate(() => window.__dbg.ui.marks.has('page:gear'))));
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(600);
  const c = await look();
  check('opened again: the lexicon still open', c.panel && c.open, JSON.stringify(c));
  const w = await page.evaluate(() => { const m = window.__dbg.ui.marks; const r = m.get('words'); return [...m.entries()].find(([k, q]) => k.startsWith('word:') && q.x >= r.x && q.y >= r.y && q.x < r.x + r.w && q.y < r.y + r.h)?.[0]; });
  log('pressed', await hands.press(w));
  await page.waitForTimeout(400);
  check('a word in the lexicon pressed: in hand', await page.evaluate(() => !!window.__dbg.invUi.word), w);
  log('pressed', await hands.press('button:LEXICON'));
  await page.waitForTimeout(500);
  const e = await look();
  check('LEXICON again: put away', !e.panel && !e.open && e.lex, JSON.stringify(e));
}
