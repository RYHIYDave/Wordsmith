// THE ENDLESS TOWN, THE SHAFT'S RIM (game/rim.ts, render/rim.ts; behind ENDLESS_TOWN, switched on here by the test hook,
// __dbg.endlessTown): ITS PICTURES FROM THE GAME, FOR HIM (pictures first: nothing of it goes live before his yes to these).
// A hero as one who has come this far is (his quests done, nothing asked of him in town), 23 endless levels reached.
//   1. home, before the gate: the pit before him, the record stone's newest notch glowing;
//   2. at the gate, three words laid on it, one in each socket; the record stone and the trophies wall beside it;
//   3. the gate's panel;
//   4. at the brink, by the way down (the waypoint at the stair's head);
//   5. out on the portal's landing;
//   6. in the wordsmith's ring, at the bench with the tablet's socket;
//   7. before the bazaar, the front right;
//   8. by the stash and the Lexicon, the left.
//   node tools/build_to.mjs dist/rim.html
//   node tools/playtest.mjs --file dist/rim.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/rim_town_look.mjs --out shots/rim_look/phone
// With --video DIR it is also filmed: he is sent round the town by touches (the stash, the wordsmith, the mystic, the armourer,
// the waypoint), walking each way himself.
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); });
  await page.waitForTimeout(300);
  const home = await page.evaluate(() => {
    const d = window.__dbg;
    d.run('warrior', 61);
    d.seasoned(30);
    d.autoLevel = false; d.autoWords = false;
    d.endless(true);
    if (d.talents) d.talents.on = false;
    const g = d.game(); const h = g.hero;
    h.ring = true; h.feather = 'given'; h.furnace = 'done'; h.meldAsk = true; h.meld = 'open'; g.questGiven = true; h.pending = 0;
    // (22 levels cut already; he comes home with the 23rd reached: its notch glows)
    g.rimSeen = 22;
    d.endlessTown(true, 23);
    g.speakTo = null;
    return { town: !!g.level.town, rim: !!g.level.rim, notches: g.level.rim && g.level.rim.notches, fresh: g.level.rim && g.level.rim.fresh };
  });
  log('home', home);
  const clean = () => page.evaluate(() => { const d = window.__dbg; d.fx.messages.length = 0; d.game().speakTo = null; });
  const stand = async (x, y, name, fx = 0.7071, fy = 0.7071, wait = 900) => {
    await page.evaluate(([hx, hy, ax, ay]) => { const g = window.__dbg.game(); g.hero.x = hx; g.hero.y = hy; g.hero.fx = ax; g.hero.fy = ay; }, [x, y, fx, fy]);
    await clean();
    await page.waitForTimeout(wait);
    await hands.settle();
    if (!touch) await page.mouse.move(4, 4);
    await snap(name);
  };
  await page.waitForTimeout(2500);
  await stand(8.5, 8.4, '01_home_before_the_gate', 0.7071, 0.7071, 600);
  // (three words laid on the gate: one in each socket)
  const laid = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    const out = [];
    for (const w of ['power', 'swift', 'fire']) { h.words[w] = (h.words[w] || 0) + 1; out.push(g.planWord(w)); }
    return { out, words: [...g.level.rim.words] };
  });
  log('three words laid on the gate', laid);
  await stand(9.2, 7.9, '02_at_the_gate_three_words', -0.7071, -0.7071);
  if (touch) await hands.press('button:Gate');
  else await hands.key('KeyE');
  await page.waitForTimeout(700);
  await snap('03_the_gates_panel');
  const shut = (await hands.mark('button:x')) ? 'button:x' : (await hands.mark('button:DONE')) ? 'button:DONE' : null;
  if (!shut || !(await hands.press(shut))) await hands.key('Escape');
  await page.waitForTimeout(300);
  await stand(13.6, 8.0, '04_at_the_brink_by_the_way_down', -0.7071, 0.7071);
  await stand(10.3, 12.25, '05_on_the_portals_landing', 1, 0);
  await stand(11.6, 18.2, '06_in_the_wordsmiths_ring', -1, 0);
  await stand(18.6, 15.7, '07_before_the_bazaar', 0, -1);
  await stand(6.6, 13.3, '08_by_the_stash_and_the_lexicon', -0.7071, 0.7071);

  // ---- the film: round the town by touches -----------------------------------------------------------------------------
  if (snap.videoAt) {
    await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 8.5; g.hero.y = 8.4; g.hero.fx = 0.7071; g.hero.fy = 0.7071; });
    await clean();
    await page.waitForTimeout(900);
    await hands.settle();
    const at = snap.videoAt();
    log('the film begins at', `${at.toFixed(1)} s`);
    const where = (kind) => page.evaluate((k) => { const d = window.__dbg; const g = d.game(); const s = g.level.stations.find((q) => q.kind === k); return { at: d.at(s.x, s.y), lift: s.lift ?? d.nameLift(k) }; }, kind);
    const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
    for (const kind of ['stash', 'wordsmith', 'mystic', 'armourer']) {
      const w = await where(kind);
      const low = w.at.y > view.h - 80;
      await hands.pressAt(w.at.x, low ? w.at.y - w.lift + 3 : w.at.y - (kind === 'mystic' ? 6 : 12));
      for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__dbg.panels.open !== 'none')) break; await page.waitForTimeout(100); }
      await page.waitForTimeout(700);
      const shut2 = (await hands.mark('button:x')) ? 'button:x' : (await hands.mark('button:DONE')) ? 'button:DONE' : null;
      if (!shut2 || !(await hands.press(shut2))) await hands.key('Escape');
      await page.waitForTimeout(300);
      await hands.settle();
      await clean();
    }
    const wayAt = await page.evaluate(() => { const d = window.__dbg; const w = d.game().level.ways.way; return d.at(w.x, w.y); });
    await hands.pressAt(wayAt.x, wayAt.y - 4);
    for (let i = 0; i < 120; i++) { if (await page.evaluate(() => !window.__dbg.game().level.town)) break; await page.waitForTimeout(100); }
    await page.waitForTimeout(2500);
    log('the film ends at', `${snap.videoAt().toFixed(1)} s`);
  }
}
