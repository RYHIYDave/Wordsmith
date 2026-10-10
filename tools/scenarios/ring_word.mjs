// HIS NOTES OF 9 OCT 2026, 22:12, IN PICTURES (the fixes, before they go live): "The quest is too in your
// face with all the text and reminder constantly at the top of the screen" (asked: "A few seconds, then
// gone (Recommended)") and "The wordsmith should give you the word after the altar powers up". A new
// player's first run, by the game's own rules: the stone carried into town; its line at the top on
// arriving (`line_on`) and a few seconds later gone (`line_gone`); then the hero at the wordsmith: the
// ring powers up, and only then the word, and the inventory opening for it (frames `fNNN`, a picture
// every tenth of a second of the town's time, the game slowed so that the camera keeps up).
//   node tools/build_to.mjs dist/fixes.html
//   node tools/playtest.mjs --file dist/fixes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/ring_word.mjs --out shots/ring/ph
export default async function (page, snap) {
  const set = await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.first('warrior', 31);
    const g = d.game(); const h = g.hero;
    // (the stone taken from the fallen wordsmith, by the rules: walk up to him)
    const b = g.level.body; h.x = b.x + 0.4; h.y = b.y;
    return { quest: null, body: !!b };
  });
  await page.waitForTimeout(600);
  const carried = await page.evaluate(() => window.__dbg.game().hero.quest);
  console.log('stone', JSON.stringify(set), carried);
  // into town, standing a few steps from the wordsmith's slab
  const at = await page.evaluate(() => {
    const g = window.__dbg.game(); g.enterTown();
    // (a player who has walked the first dungeon: the lesson's first prompt, to move, long done)
    if (g.guide) g.guide.walked = 999;
    const st = g.level.stations.find((s) => s.kind === 'wordsmith');
    g.hero.x = st.x + 3.2; g.hero.y = st.y + 2.2; g.hero.fx = -0.83; g.hero.fy = -0.55;
    return { x: st.x, y: st.y };
  });
  await page.waitForTimeout(1200);
  await snap('line_on');
  console.log('step', await page.evaluate(() => window.__dbg.game().guideStep()));
  await page.waitForTimeout(6500);
  await snap('line_gone');
  console.log('step later', await page.evaluate(() => window.__dbg.game().guideStep()));
  // to the wordsmith: the ring powers up, then the word
  const slow = 0.25;
  await page.evaluate(([s, at]) => { const d = window.__dbg; d.slowmo = s; const h = d.game().hero; h.x = at.x + 1.1; h.y = at.y + 0.9; }, [slow, at]);
  const step = 100 / slow;
  const t0 = Date.now();
  const told = [];
  for (let i = 0; i < 64; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f${String(i).padStart(3, '0')}`);
    const s = await page.evaluate(() => { const g = window.__dbg.game(); return { word: g.hero.words.power || 0, ring: g.hero.ring, open: window.__dbg.panels ? window.__dbg.panels.open : '?' }; });
    if (!told.length || told[told.length - 1].word !== s.word || told[told.length - 1].open !== s.open) told.push({ i, ...s });
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log('what happened', JSON.stringify(told));
}
