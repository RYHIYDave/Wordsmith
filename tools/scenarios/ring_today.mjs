// THE WORDSMITH AND HIS RING AS THEY ARE (art/town.ts, art/townsfolk.ts): pictures for the owner
// before they are made new (8 Oct 2026, 22:41: "we probably need new art for the wordsmith and
// the runes around him with the new design rules"). The hero stands a little way off, so that the
// whole ring is seen; a picture every third of a second, to catch what moves.
//   node tools/build_to.mjs dist/ring_today.html
//   node tools/playtest.mjs --file dist/ring_today.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/ring_today.mjs --out shots/ring/today
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 31); });
  await page.waitForTimeout(800);
  // (down the screen and to the right of the ring, out of it, facing it)
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 12.6; g.hero.y = 17.2; g.hero.fx = -0.7; g.hero.fy = -0.7; });
  await page.waitForTimeout(1500);
  for (let k = 0; k < 12; k++) {
    await snap(`f${String(k).padStart(2, '0')}`);
    await page.waitForTimeout(330);
  }
  // and close, at his slab
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 10.5; g.hero.y = 15.5; });
  await page.waitForTimeout(900);
  await snap('close');
  snap.note('where', { smith: await page.evaluate(() => { const d = window.__dbg; return d.at(9, 14); }), hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }) });
}
