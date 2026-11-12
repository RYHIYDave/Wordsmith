// EVEN PIXELS (engine/screen.ts EVEN_PIXELS; the queue's check-pixel-size-on-his-iphone): his iPhone in the Claude app, the page
// upright and the game turned for him, 393 by 723 at 3 to a point (his phone check of 12 Nov 2026): the town and floor 1 as the
// game is now (5 screen pixels to a game pixel: the picture's pixels 2 and 3 wide by turns), then with the switch on (4: every one
// 2 wide). For his pictures.
//   node tools/build_to.mjs dist/even.html
//   node tools/playtest.mjs --file dist/even.html --touch --size 393x723 --dpr 3 --scenario tools/scenarios/even_pixels_look.mjs --out shots/even/a
export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok) => { if (!ok) { fails++; console.log(`  !! ${label}`); } else console.log(`  ok ${label}`); };
  const scale = () => page.evaluate(() => { const s = window.__dbg.screen; return { scale: s.scale, w: s.w, h: s.h, turned: s.turned, touch: s.touch }; });
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.run('brawler', 21);
  });
  await page.waitForTimeout(8000);
  for (const [where, go] of [['town', null], ['floor1', 1], ['floor11', 11]]) {
    if (go) {
      await page.evaluate((n) => { const d = window.__dbg; const g = d.game(); g.depth = n; g.enterDungeon(); }, go);
      await page.waitForTimeout(9000);
    }
    await page.evaluate(() => window.__dbg.evenPixels(false));
    await page.waitForTimeout(700);
    const a = await scale();
    console.log(`  ${where}, as now: ${JSON.stringify(a)}`);
    await snap(`${where}_now`);
    await page.evaluate(() => window.__dbg.evenPixels(true));
    await page.waitForTimeout(700);
    const b = await scale();
    console.log(`  ${where}, even: ${JSON.stringify(b)}`);
    await snap(`${where}_even`);
    if (where === 'town') {
      check('his phone upright, the game turned: 5 to a game pixel as now', a.turned && a.scale === 5);
      check('with the switch: 4', b.scale === 4);
    }
  }
  await page.evaluate(() => window.__dbg.evenPixels(false));
  if (fails) throw new Error(`${fails} thing(s) wrong`);
}
