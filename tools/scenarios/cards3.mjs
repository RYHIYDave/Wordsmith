// THE CLASS CARDS THREE ACROSS IN TWO ROWS, AND CONFIRM (CARDS3; the owner, 31 Oct 2026, 01:16: "Can I get the character select
// screen to have a confirm? Button when you select a character", "And can it be 3 across 2 rows for portraits"). On a page built
// with CARDS3 on: the cards three to a row; a card pressed is chosen and nothing starts; CONFIRM starts that hero; BACK and back
// again, none chosen.
//   node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/cards3.mjs --out shots/cards3/side
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.toTitle && d.toTitle(); d.titlePage('class'); });
  await page.waitForTimeout(3000);
  const marks = () => page.evaluate(() => {
    const d = window.__dbg;
    const cards = [...d.ui.marks.keys()].filter((k) => k.startsWith('class:')).map((k) => ({ id: k.slice(6), ...d.ui.marks.get(k) }));
    const c = d.ui.marks.get('button:CONFIRM');
    return { cards, confirm: c ? { x: c.x, y: c.y, w: c.w, h: c.h } : null, game: !!d.game(), w: d.ui.w, h: d.ui.h };
  });
  let s = await marks();
  const rows = [...new Set(s.cards.map((c) => c.y))];
  check(`six cards, three to a row, in two rows (${s.w} by ${s.h})`, s.cards.length === 6 && rows.length === 2 && rows.every((y) => s.cards.filter((c) => c.y === y).length === 3), JSON.stringify(s.cards.map((c) => [c.id, c.x, c.y, c.w, c.h])));
  check('the cards clear of the buttons at the foot', s.cards.every((c) => c.y + c.h <= s.confirm.y - 2), JSON.stringify(s.confirm));
  await snap('0_none_chosen');
  await hands.press('class:warlock');
  await page.waitForTimeout(600);
  s = await marks();
  check('a card pressed: nothing starts', !s.game);
  await snap('1_warlock_chosen');
  await hands.press('class:mage');
  await page.waitForTimeout(400);
  await hands.press('button:CONFIRM');
  await page.waitForTimeout(4000);
  s = await marks();
  const cls = await page.evaluate(() => window.__dbg.game()?.hero.cls ?? null);
  check('CONFIRM: the chosen hero starts', s.game && cls === 'mage', String(cls));
  await snap('2_started');
  log('the cards and CONFIRM', fails ? `${fails} thing(s) wrong` : 'all as they should be');
}
