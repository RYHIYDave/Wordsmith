// THE START SCREEN MADE NEW FOR THE NEW WORDSMITH (art/title_smith3.ts, behind TITLE_SMITH3, off): shown in
// the game itself (`__dbg.titleLook('smith3')`), on the screen as it is, a few moments of it; then the
// old one (`'floor'`) beside it.
//   node tools/build_to.mjs dist/title3.html
//   node tools/playtest.mjs --file dist/title3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/title_smith3.mjs --out shots/title3/phone
export default async function (page, snap) {
  await page.evaluate(() => window.__dbg.titleLook('smith3'));
  await page.waitForTimeout(1500);
  for (const n of [0, 1, 2]) {
    await snap(`new_${n}`);
    await page.waitForTimeout(1300);
  }
  await page.evaluate(() => window.__dbg.titleLook('floor'));
  await page.waitForTimeout(1200);
  await snap('old');
}
