// THE TALENT CARD AND THE WORDS' PANEL (his words, 30 Oct 2026, 08:31: “The rune pouch covers the talent tree descriptions and
// allocation button”). For each class, a hero at level 30 with a pouch full of words (WORD_HALF: their own panel over the
// game's half), the TALENTS page open, and talents read from the top of the tree to its foot: the card is never on the words'
// panel, and its TAKE is pressed and takes.
//   node tools/playtest.mjs --file <page> [--touch --size 390x844 --dpr 3] --scenario tools/scenarios/talents_words.mjs --out shots/tw/phone
import { log, makeHands } from './lib.mjs';

const BUILDS = {
  mage: { taken: ['kindling', 'searing', 'flamewarp', 'charged'], take: 'fuel' },
  ranger: { taken: ['fleet', 'windrunner', 'quickdraw', 'longshot'], take: 'lightstep' },
  warrior: { taken: ['honededge', 'cadence', 'drilledleap', 'sweepingcut'], take: 'earthshaker' },
  warlock: { taken: ['hunger', 'terribleroar', 'blazingarm', 'souldebt'], take: 'bloodlust', draft: true },
  tinkerer: { taken: ['bombsaway', 'fortune', 'contraptions', 'clustervials'], take: 'tar', draft: true },
  brawler: { taken: ['doublejab', 'tenderize', 'flurry', 'bobweave'], take: 'knockout', draft: true },
};

const meets = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  const only = process.env.CLS ? process.env.CLS.split(',') : Object.keys(BUILDS);
  for (const cls of only) {
    const b = BUILDS[cls];
    const ok = await page.evaluate(([cls, taken]) => {
      const d = window.__dbg;
      d.saving(false);
      window.__talentsWere ??= d.talents.on;
      d.talents.on = true;
      try { d.run(cls, 21); } catch { return false; }
      if (d.game().hero.cls !== cls) return false;
      d.seasoned(30);
      const g = d.game();
      d.autoLevel = false; d.autoWords = false;
      g.hero.pending = 0;
      g.hero.talents = [...taken];
      g.hero.gold = 1000;
      // (a pouch full of words: every word, one or two of each)
      for (const [i, w] of Object.keys(g.hero.words).entries()) g.hero.words[w] = 1 + (i % 2);
      g.refresh();
      d.invUi.talents.sel = null;
      return true;
    }, [cls, b.taken]);
    if (!ok) { log(`${cls}`, 'not on this page: skipped'); continue; }
    await page.waitForTimeout(400);
    await hands.press('button:NEW TALENT');
    await page.waitForTimeout(500);
    const marks = () => page.evaluate(() => {
      const d = window.__dbg;
      const m = (k) => { const r = d.ui.marks.get(k); return r ? { x: r.x, y: r.y, w: r.w, h: r.h } : null; };
      const stones = [...d.ui.marks.keys()].filter((k) => k.startsWith('talent:')).map((k) => ({ id: k.slice(7), r: m(k) }));
      return { words: m('words'), card: m('talent-card'), take: m('button:TAKE'), undo: m('button:UNDO'), stones, page: d.invUi.page, n: Object.values(d.game().hero.words).filter((v) => v > 0).length };
    });
    let s = await marks();
    check(`${cls}: the TALENTS page, with the words' panel (${s.n} words)`, s.page === 'talents' && !!s.words, JSON.stringify(s.words));
    await snap(`${cls}_0_tree`);
    // every talent read, top to foot: its card clear of the words' panel
    const order = [...s.stones].sort((p, q) => p.r.y - q.r.y);
    let clear = 0;
    let bad = [];
    for (const st of order) {
      await page.evaluate((id) => { window.__dbg.invUi.talents.sel = id; }, st.id);
      await page.waitForTimeout(60);
      const t = await marks();
      if (t.card && !meets(t.card, t.words)) clear++;
      else bad.push(st.id);
    }
    check(`${cls}: every talent's card clear of the words (${clear} of ${order.length})`, clear === order.length, bad.join(', '));
    // the lowest talent read (where the card came down onto the words), and the one to take, read and taken with TAKE
    await page.evaluate((id) => { window.__dbg.invUi.talents.sel = id; }, order[order.length - 1].id);
    await page.waitForTimeout(200);
    await snap(`${cls}_1_lowest`);
    await page.evaluate(() => { window.__dbg.invUi.talents.sel = null; });
    await page.waitForTimeout(100);
    await hands.press(`talent:${b.take}`);
    await page.waitForTimeout(300);
    s = await marks();
    check(`${cls}: ${b.take} read, its TAKE clear of the words`, !!s.take && !meets(s.take, s.words), JSON.stringify({ take: s.take, words: s.words }));
    await snap(`${cls}_2_read`);
    await hands.press('button:TAKE');
    await page.waitForTimeout(400);
    const took = await page.evaluate((id) => window.__dbg.game().hero.talents.includes(id), b.take);
    check(`${cls}: TAKE pressed: taken`, took);
    await snap(`${cls}_3_taken`);
    await page.evaluate(() => { const d = window.__dbg; d.invUi.talents.sel = null; });
  }
  await page.evaluate(() => { window.__dbg.talents.on = window.__talentsWere; });
  log('talents and words', fails ? `${fails} thing(s) wrong` : 'all as they should be');
}
