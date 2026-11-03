// THE TALENTS PAGE PRESSED AS HE PRESSES IT (his words, 31 Oct 2026, 00:23: "Dude fix the bag so I can allocate passives in the
// classes test"). For each class, a hero at level 30 with points to spend and a full pouch, the TALENTS page open: every stone
// of the tree pressed where it is drawn (not chosen by the test's hand), its card read; then an open one taken with TAKE.
//   node tools/playtest.mjs --file <page> [--touch --size 390x844 --dpr 3] --scenario tools/scenarios/talents_press.mjs --out shots/tp/phone
import { log, makeHands } from './lib.mjs';

const meets = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  const only = process.env.CLS ? process.env.CLS.split(',') : ['mage', 'ranger', 'warrior', 'warlock', 'tinkerer', 'brawler'];
  for (const cls of only) {
    const ok = await page.evaluate((cls) => {
      const d = window.__dbg;
      d.saving(false);
      try { d.run(cls, 21); } catch { return false; }
      if (d.game().hero.cls !== cls) return false;
      d.seasoned(30);
      const g = d.game();
      d.autoLevel = false; d.autoWords = false;
      g.hero.pending = 0;
      g.hero.talents = [];
      for (const [i, w] of Object.keys(g.hero.words).entries()) g.hero.words[w] = 1 + (i % 2);
      g.refresh();
      d.invUi.talents.sel = null;
      return true;
    }, cls);
    if (!ok) { log(`${cls}`, 'not on this page: skipped'); continue; }
    await page.waitForTimeout(400);
    await hands.press('button:NEW TALENT');
    await page.waitForTimeout(500);
    const marks = () => page.evaluate(() => {
      const d = window.__dbg;
      const m = (k) => { const r = d.ui.marks.get(k); return r ? { x: r.x, y: r.y, w: r.w, h: r.h } : null; };
      const stones = [...d.ui.marks.keys()].filter((k) => k.startsWith('talent:')).map((k) => ({ id: k.slice(7), r: m(k) }));
      const all = [...d.ui.marks.keys()];
      return { words: m('words'), bag: m('bag'), card: m('talent-card'), take: m('button:TAKE'), stones, page: d.invUi.page, sel: d.invUi.talents.sel, all };
    });
    let s = await marks();
    check(`${cls}: the TALENTS page`, s.page === 'talents', `page ${s.page}`);
    await snap(`${cls}_0_tree`);
    let read = 0;
    const missed = [];
    for (const st of s.stones) {
      await page.evaluate(() => { window.__dbg.invUi.talents.sel = null; });
      await page.waitForTimeout(40);
      await hands.press(`talent:${st.id}`);
      await page.waitForTimeout(80);
      const t = await marks();
      if (t.page === 'talents' && t.sel === st.id) read++;
      else missed.push(`${st.id}(${t.page},${t.sel})`);
    }
    check(`${cls}: every stone pressed is read (${read} of ${s.stones.length})`, read === s.stones.length, missed.join(' '));
    // the root taken with TAKE
    const root = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); return d.talentRoots ? null : null; });
    await page.evaluate(() => { window.__dbg.invUi.talents.sel = null; });
    let took = null;
    for (const st of s.stones) {
      const open = await page.evaluate((id) => window.__dbg.game().talentProblem(id) === null, st.id);
      if (!open) continue;
      await hands.press(`talent:${st.id}`);
      await page.waitForTimeout(150);
      s = await marks();
      await snap(`${cls}_1_read`);
      await hands.press('button:TAKE');
      await page.waitForTimeout(300);
      took = await page.evaluate((id) => window.__dbg.game().hero.talents.includes(id), st.id);
      check(`${cls}: ${st.id} taken with TAKE`, took, JSON.stringify({ take: s.take, words: s.words, card: s.card }));
      await snap(`${cls}_2_taken`);
      break;
    }
    if (took === null) check(`${cls}: an open talent to take`, false);
    await page.evaluate(() => { window.__dbg.invUi.talents.sel = null; });
  }
  log('talents pressed', fails ? `${fails} thing(s) wrong` : 'all as they should be');
}
