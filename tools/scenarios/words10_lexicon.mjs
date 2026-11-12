// THE LEXICON'S 28 WORDS (ui/lexicon28.ts, behind LEX28: 'rows', the game's own): the Lexicon at its lectern in town on a phone
// held sideways, all 28 words found and every use of each known, open on the word with the longest page; a picture of each way
// to lay out its stones, for the sheet (tools/words10_sheet.py lexicon). The ten new words' stones are the art chat's runes
// (render/words7.ts, render/words10.ts), laid in for the picture.
//   node tools/build_to.mjs dist/words10_looks.html
//   node tools/playtest.mjs --file dist/words10_looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words10_lexicon.mjs --out /dev/shm/w10/lex
export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 11); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); const h = g.hero; const meta = d.meta();
    for (const w of Object.keys(meta.known)) Object.assign(meta.known[w], { found: true, front: true, behind: true, gear: true, dungeon: true });
    // (a few kept on the shelf for the next character, as a player's would be)
    Object.assign(meta.lexicon, { fire: 2, binding: 1, lasting: 1 });
    h.gold = 900;
    g.refresh();
  });
  // the art chat's runes for the ten new words, in place of the stand-ins (pictures only)
  await page.evaluate(async () => {
    const d = window.__dbg;
    const load = (url) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.src = url; });
    for (const w of d.words7.words) d.lex28.switch.stones[w] = { img: await load(d.words7.runePng(w)), w: 12, h: 12, ax: 6, ay: 10 };
    for (const w of d.words10.words) d.lex28.switch.stones[w] = { img: await load(d.words10.runePng(w)), w: 12, h: 12, ax: 6, ay: 10 };
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__dbg.open('lexicon'));
  await page.waitForTimeout(500);
  // the word with the longest page, at the width the game's own way gives it
  await page.evaluate(() => { window.__dbg.lex28.switch.way = 'side'; });
  await page.waitForTimeout(300);
  const body = await page.evaluate(() => { const d = window.__dbg; const b = d.lex28.last().body; d.lex28.switch.way = 'rows'; return b; });
  const own = await page.evaluate((b) => window.__dbg.lex28.layout(b, true, 'rows', null), body);
  const tall = await page.evaluate((pw) => window.__dbg.lex28.heights(pw).slice(0, 5), own.page.w);
  console.log('the half', JSON.stringify(body), 'the longest pages at the game\'s own width', own.page.w, JSON.stringify(tall));
  const word = tall[0][0];
  await page.evaluate((w) => { window.__dbg.lexUi.sel = w; }, word);
  const out = { word, ways: {} };
  for (const way of ['rows', 'side', 'small', 'pages']) {
    await page.evaluate((way) => { window.__dbg.lex28.switch.way = way; }, way);
    await page.waitForTimeout(400);
    const L = await page.evaluate((way) => {
      const d = window.__dbg; const L = d.lex28;
      // ('rows' is the game's own: its layout as the mock-up reads it)
      const last = way === 'rows' ? null : L.last();
      return { last, screen: { w: d.screen.w, h: d.screen.h, scale: d.screen.scale } };
    }, way);
    const lay = way === 'rows' ? await page.evaluate(([b, w]) => window.__dbg.lex28.layout(b, true, 'rows', w), [body, word]) : L.last;
    const need = await page.evaluate(([w, pw]) => window.__dbg.lex28.heights(pw).find((q) => q[0] === w)[1], [word, lay.page.w]);
    const most = await page.evaluate((pw) => window.__dbg.lex28.heights(pw)[0], lay.page.w);
    const small = Math.min(...lay.cells.map((c) => Math.min(c.r.w, c.r.h)));
    out.ways[way] = { page: lay.page, need, most, stones: lay.cells.length, small, arrows: lay.arrows };
    console.log(way, `page ${lay.page.w} by ${lay.page.h}; ${word}'s page needs ${need}; the longest of all (${most[0]}) ${most[1]}; ${lay.cells.length} stones shown, the smallest ${small}`);
    if (small < 18) bad(`${way}: a stone ${small} across`);
    snap.note(`way_${way}`, { ...out.ways[way], screen: L.screen });
    await snap(`way_${way}`);
  }
  snap.note('lex', out);
  await page.evaluate(() => { window.__dbg.lex28.switch.way = 'rows'; });
}
