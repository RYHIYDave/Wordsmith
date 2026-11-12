// THE HERO CARDS FROM THE BAKE (12 Nov 2026; his words, 11 Nov: “Then, character screen lags.  Selecting a character lags.”), in
// a real browser, the page served over the web as the published game is, its bake beside it:
//   node tools/build.mjs; then the page as published (its folders beside it)
//   node tools/playtest.mjs --serve --file <page> --touch --size 844x390 --dpr 3 --scenario tools/scenarios/hero_cards_baked.mjs --out shots/hero_cards/x
// On his phone, 12 Nov 2026 (docs/requests/phone_check.md), the cards ran at 3 to 5 frames a second: of the Warrior, the Ranger
// and the Mage every frame their cards showed was painted where the game is drawn, as it was shown (the bake had only their
// front's standing and running, and a hero painted from eight sides is not seen from the front on his card), and of every hero
// what he does left standing and his making ready. Now everything a card shows comes from the bake's group `cards`, asked for
// as the game starts. It asks:
//   1. the cards' group is asked for and comes whole WITH NOTHING PRESSED (on the starting screen);
//   2. the cards up for SECS seconds (default 14: the first three cards' gestures are begun in it): NO FRAME IS PAINTED where
//      the game is drawn and none is stood in for by its nearest; how the frames went by;
//   3. each card chosen in turn (its hero runs; the one before comes to a stand): none painted, none stood in for;
//   4. PICK (default the Mage) confirmed: she makes ready: none painted, none stood in for, until she has gone.
// SLOW=<seconds>: THE CARDS' PICTURES LATE (their file held back that long, as on a slow line), and NEW GAME pressed at once: the
// cards are up before their pictures are. It asks instead: no hero's card paints more than one frame of him while they are
// awaited (the nearest painted stands in), none begins anything of his own, and once they have come nothing more is painted.
// Lines marked !! are problems.
import { makeHands, log } from './lib.mjs';

/** SLOW: the cards' file held back (set before the page is loaded again). */
async function slowCards(page, secs) {
  await page.route('**/heroes/*/cards.json', async (route) => {
    await new Promise((r) => setTimeout(r, secs * 1000));
    await route.continue();
  });
  await page.reload();
}

export default async function (page, snap) {
  const secs = Number(process.env.SECS || 14);
  const pick = process.env.PICK || 'mage';
  let bad = 0;
  const check = (what, ok, detail = '') => {
    if (!ok) bad++;
    console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  };
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  const slow = Number(process.env.SLOW || 0);
  if (slow) await slowCards(page, slow);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  const has = await page.evaluate(() => !!window.__dbg.painter.baked);
  check('the page has the heroes\' bake', has);
  if (slow) {
    // THE CARDS UP BEFORE THEIR PICTURES
    const peek = () => page.evaluate(() => ({ painted: window.__dbg.painting.frames, ms: Math.round(window.__dbg.painting.ms), stoodIn: window.__dbg.stoodIn(), came: window.__dbg.baked().ms.cards !== undefined, failed: window.__dbg.baked().failed.length }));
    const b0 = await peek();
    check('the cards\' pictures have not come yet', !b0.came && !b0.failed, JSON.stringify(b0));
    await hands.press('button:NEW GAME');
    let waited = b0;
    let looks = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < (slow + 20) * 1000) {
      const p = await peek();
      if (p.came || p.failed) break;
      waited = p;
      looks++;
      await page.waitForTimeout(100);
    }
    await snap('awaited');
    log('while they were awaited', JSON.stringify({ looks, before: b0, last: waited }));
    check('the cards were up while their pictures were awaited', looks > 5, `${looks} looks`);
    check('awaited: no more than a frame of each hero painted where the game is drawn', waited.painted - b0.painted <= 6, `${waited.painted - b0.painted} painted, ${waited.ms - b0.ms} ms`);
    await page.waitForTimeout(400);
    const c0 = await peek();
    check('they came', c0.came && !c0.failed, JSON.stringify(c0));
    await page.waitForTimeout(9000);
    const c1 = await peek();
    check('once they have come: nothing more painted in 9 s (the gestures begun in it), none stood in for', c1.painted === c0.painted && c1.stoodIn === c0.stoodIn, `${c1.painted - c0.painted} painted, ${c1.stoodIn - c0.stoodIn} stood in`);
    await snap('came');
    check('no error on the page', errs.length === 0, errs.slice(0, 3).join(' | '));
    console.log(bad ? `!! ${bad} problems` : 'finished clean');
    return;
  }
  // 1. the cards' group, with nothing pressed
  const t0 = Date.now();
  let st = null;
  while (Date.now() - t0 < 30000) {
    st = await page.evaluate(() => window.__dbg.baked());
    if (!st || st.failed.length || st.ms.cards !== undefined) break;
    await page.waitForTimeout(100);
  }
  check('the cards\' pictures came from the bake with nothing pressed', !!st && st.failed.length === 0 && st.ms.cards !== undefined, JSON.stringify(st));
  log('the cards\' group', JSON.stringify({ given: st && st.given, unwanted: st && st.unwanted, ms: st && st.ms, sheets: st && st.sheets, sheetPx: st && st.sheetPx, cuts: await page.evaluate(() => window.__dbg.sheetCuts()) }));
  const count = () => page.evaluate(() => ({ painted: window.__dbg.painting.frames, ms: Math.round(window.__dbg.painting.ms), stoodIn: window.__dbg.stoodIn() }));
  /** The browser's own frames for `ms`: how many, the longest wait between two, how many waits over 34 ms. */
  const frames = (ms) => page.evaluate((ms) => new Promise((done) => {
    const out = { n: 0, worst: 0, over34: 0, over100: 0 };
    let last = performance.now();
    const t0 = last;
    const step = (now) => {
      const gap = now - last;
      last = now;
      out.n++;
      out.worst = Math.max(out.worst, gap);
      if (gap > 34) out.over34++;
      if (gap > 100) out.over100++;
      if (now - t0 < ms) requestAnimationFrame(step);
      else done({ ...out, worst: Math.round(out.worst), perSec: +(out.n / ((now - t0) / 1000)).toFixed(1) });
    };
    requestAnimationFrame(step);
  }), ms);
  // 2. the cards up
  const before = await count();
  await hands.press('button:NEW GAME');
  const up = await frames(secs * 1000);
  const after = await count();
  log(`the cards up ${secs} s`, JSON.stringify({ frames: up, before, after, cuts: await page.evaluate(() => window.__dbg.sheetCuts()) }));
  check(`the cards up ${secs} s: no frame painted where the game is drawn`, after.painted === before.painted, `${after.painted - before.painted} painted, ${after.ms - before.ms} ms`);
  check('and none stood in for by its nearest', after.stoodIn === before.stoodIn, `${after.stoodIn - before.stoodIn}`);
  check('no wait between two frames over a tenth of a second', up.over100 === 0, JSON.stringify(up));
  await snap('cards');
  // 3. each card chosen in turn
  const ids = (await page.evaluate(() => [...window.__dbg.ui.marks.keys()])).filter((k) => k.startsWith('class:'));
  check('six cards', ids.length === 6, ids.join(', '));
  const b3 = await count();
  for (const id of [...ids, ids[0]]) {
    await hands.press(id, 0, true);
    await page.waitForTimeout(650);
  }
  await page.waitForTimeout(600);
  const a3 = await count();
  check('each card chosen in turn (its hero runs, the one before comes to a stand): none painted', a3.painted === b3.painted, `${a3.painted - b3.painted} painted, ${a3.ms - b3.ms} ms`);
  check('and none stood in for', a3.stoodIn === b3.stoodIn, `${a3.stoodIn - b3.stoodIn}`);
  await snap('chosen');
  // 4. one picked: making ready
  const b4 = await count();
  await hands.press(`class:${pick}`, 0, true);
  const c = await page.evaluate(() => { const m = window.__dbg.ui.marks.get('button:CONFIRM'); return m ? { x: m.x + m.w / 2, y: m.y + m.h / 2 } : null; });
  check('CONFIRM is on the screen', !!c);
  let seen = 0;
  let last = b4;
  let long = 0;
  if (c) {
    const afterPick = await count();
    check(`${pick} chosen: none painted`, afterPick.painted === b4.painted && afterPick.stoodIn === b4.stoodIn, JSON.stringify(afterPick));
    await hands.pressAt(c.x, c.y);
    const t1 = Date.now();
    while (Date.now() - t1 < 15000) {
      // (read in one go, so that what is counted is counted while they are still on their card)
      const s = await page.evaluate(() => ({ e: window.__dbg.entering(), painted: window.__dbg.painting.frames, ms: Math.round(window.__dbg.painting.ms), stoodIn: window.__dbg.stoodIn() }));
      if (!s.e) break;
      seen++;
      long = s.e.long;
      last = s;
      await page.waitForTimeout(30);
    }
  }
  check(`${pick} was seen making ready`, seen > 3, `${seen} looks, ${long.toFixed ? long.toFixed(2) : long} s long`);
  check('making ready: none painted', last.painted === b4.painted, `${last.painted - b4.painted} painted, ${last.ms - b4.ms} ms`);
  check('and none stood in for', last.stoodIn === b4.stoodIn, `${last.stoodIn - b4.stoodIn}`);
  check('no error on the page', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(bad ? `!! ${bad} problems` : 'finished clean');
}
