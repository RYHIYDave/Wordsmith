// THE BOOK ON THE STARTING SCREEN IN THE LEXICON'S FIVE PAGES (ui/lexicon.ts drawLexicon, behind LEX_BOOK.pages), at any size of
// screen: every tab and every line of each page on the screen and inside its panel. For the owner's pictures of it (not his yes).
//   node tools/playtest.mjs --file dist/words10_live_sounds/words10_live.html --touch --size 390x844 --dpr 3 --scenario tools/scenarios/words10_book.mjs --out shots/words10_live/book_upright
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const ev = (f, a) => page.evaluate(f, a);
  const check = (what, ok, more = '') => console.log(`  ${ok ? 'ok' : '!!'} ${what}${more ? `   (${more})` : ''}`);
  // (a save with every word found, so that each page is at its fullest)
  await ev(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 5); d.seasoned(20);
    const g = d.game();
    for (const w of Object.keys(g.meta.known)) g.meta.known[w].found = true;
    d.saving(true); d.save(); d.toTitle();
  });
  await page.waitForTimeout(800);
  log('pressed', await hands.press('button:LEXICON'));
  await page.waitForTimeout(500);
  const size = await ev(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  for (let i = 0; i < 5; i++) {
    if (i > 0) { await hands.press(`lextab:${i}`); await page.waitForTimeout(450); }
    const m = await ev(() => [...window.__dbg.ui.marks].filter(([k]) => k.startsWith('lex')).map(([k, r]) => ({ k, x: r.x, y: r.y, w: r.w, h: r.h })));
    const tabs = m.filter((r) => r.k.startsWith('lextab:'));
    const words = m.filter((r) => r.k.startsWith('lex:'));
    const out = m.filter((r) => r.x < 0 || r.y < 0 || r.x + r.w > size.w || r.y + r.h > size.h - 2);
    check(`page ${i + 1}: five tabs, its words (${words.length}), all on the screen`, tabs.length === 5 && words.length >= 1 && words.length <= 9 && out.length === 0, out.map((r) => r.k).join(' '));
    await snap(`page_${i + 1}`);
  }
  await hands.press('button:x');
  await ev(() => window.__dbg.saving(false));
}
