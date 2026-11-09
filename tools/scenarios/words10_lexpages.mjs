// THE LEXICON'S 28 WORDS IN PAGES BY WHAT THEY DO (ui/lexicon28.ts, way 'groups', behind LEX28: 'rows', the game's own): the
// Lexicon at its lectern in town on a phone held sideways, for the sheet (tools/words10_sheet.py pages). His words, 9 Nov 2026:
// “Categorize them into pages”, then “By what they do”. Three pictures: all 28 found, every use known, open on HOW IT STRIKES with
// Vast's page; the same, open on BLOOD AND SPOILS with Reaping's page (the longest); and a player's part way through, twelve found,
// open on HOW IT STRIKES with Heavy's page, Leech just found (its page's tab marked). The ten new words' stones are the art chat's
// runes (render/words7.ts, render/words10.ts), laid in for the picture.
//   node tools/build_to.mjs dist/words10_looks.html
//   node tools/playtest.mjs --file dist/words10_looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words10_lexpages.mjs --out /dev/shm/w10p/pg
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
  await page.evaluate(() => { window.__dbg.lex28.switch.way = 'groups'; });
  await page.waitForTimeout(300);

  const shot = async (name, word) => {
    await page.evaluate((w) => { window.__dbg.lexUi.sel = w; }, word);
    await page.waitForTimeout(400);
    const got = await page.evaluate((w) => {
      const d = window.__dbg; const L = d.lex28.last(); const meta = d.meta();
      const heights = d.lex28.heights(L.page.w);
      return {
        last: L, sel: d.lexUi.sel,
        need: heights.find((q) => q[0] === w)[1], most: heights[0],
        // (the room the game's own rows leave a page, in the same half)
        old: d.lex28.layout(L.body, true, 'rows', w).page.h,
        found: d.lex28.pages.flatMap((p) => p.words).filter((k) => meta.known[k].found).length,
        screen: { w: d.screen.w, h: d.screen.h, scale: d.screen.scale },
      };
    }, word);
    const L = got.last;
    const tabName = (await page.evaluate(() => window.__dbg.lex28.pages.map((p) => p.name)))[L.tab];
    console.log(name, `open on ${tabName} (tab ${L.tab}), ${word}'s page: needs ${got.need}, room ${L.page.w} by ${L.page.h}; the longest of all (${got.most[0]}) ${got.most[1]}; ${L.cells.length} stones; ${got.found} found`);
    if (got.sel !== word) bad(`${name}: the open word is ${got.sel}, not ${word}`);
    if (got.most[1] > L.page.h) bad(`${name}: the longest page (${got.most[0]}, ${got.most[1]}) has ${L.page.h}`);
    for (const t of L.tabs) if (t.w < 18 || t.h < 18) bad(`${name}: a tab ${t.w} by ${t.h}`);
    for (const c of L.cells) if (c.r.w < 18 || c.r.h < 18) bad(`${name}: a stone ${c.r.w} by ${c.r.h}`);
    snap.note(name, { ...got, tabName });
    await snap(name);
  };

  // 1. all found, open on HOW IT STRIKES with Vast's page
  await shot('vast', 'vast');
  // 2. all found, open on BLOOD AND SPOILS with Reaping's page (the longest)
  await shot('reaping', 'reaping');
  // 3. part way through a game: twelve found, some uses not yet known; Leech just found, not yet looked at (its tab marked)
  await page.evaluate(() => {
    const d = window.__dbg; const meta = d.meta();
    const found = {
      power: [1, 1, 1, 1], poison: [1, 1, 1, 0], fire: [1, 1, 1, 1], frost: [1, 1, 0, 1], lightning: [1, 0, 1, 0],
      twin: [1, 1, 0, 0], heavy: [1, 0, 0, 0], precise: [1, 1, 1, 0], swift: [1, 1, 1, 0], frenzied: [1, 0, 0, 0],
      guarding: [1, 1, 0, 0], leech: [0, 0, 0, 0],
    };
    for (const w of Object.keys(meta.known)) {
      const f = found[w];
      Object.assign(meta.known[w], f ? { found: true, front: !!f[0], behind: !!f[1], gear: !!f[2], dungeon: !!f[3] } : { found: false, front: false, behind: false, gear: false, dungeon: false });
    }
    for (const w of Object.keys(meta.lexicon)) meta.lexicon[w] = 0;
    Object.assign(meta.lexicon, { fire: 2, frost: 1 });
    d.lex28.switch.fresh = ['leech'];
  });
  await shot('early', 'heavy');
  await page.evaluate(() => { const d = window.__dbg; d.lex28.switch.way = 'rows'; d.lex28.switch.fresh = []; d.lex28.switch.tab = null; });
}
