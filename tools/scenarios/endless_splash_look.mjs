// ENDLESS MODE'S SPLASH, PAINTED BY THE ART CHAT (art/endless_splash.ts, ui/endless_splash_draw.ts, behind ENDLESS_SPLASH, off), IN
// THE GAME ITSELF: a hero in town as endless mode opens to him, the switch turned on for this page only; the splash as the game
// plays it (a few moments of it), then the card after it as before.
//   node tools/build_to.mjs dist/endless_splash.html
//   node tools/playtest.mjs --file dist/endless_splash.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/endless_splash_look.mjs --out shots/endless_splash/game
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.run('brawler', 21);
    d.autoLevel = false;
    d.autoWords = false;
  });
  await page.waitForTimeout(2500);
  const ms = await page.evaluate(() => {
    const d = window.__dbg;
    d.seasoned(30);
    d.fanfare.on = true;
    d.fanfare.painted.on = true;
    const t0 = performance.now();
    d.endlessFanfare();
    return t0;
  });
  const t0 = Date.now();
  for (const [at, name] of [[450, '1_waking'], [1300, '2_landed'], [2600, '3_whole']]) {
    const wait = t0 + at - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(name);
  }
  await page.waitForFunction(() => window.__dbg.fanfareShown() === 'card', null, { timeout: 30000 });
  console.log(`  the card up after ${((Date.now() - t0) / 1000).toFixed(1)} s of the wall's time (begun at ${Math.round(ms)} ms)`);
  await page.waitForTimeout(400);
  await snap('4_the_card');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__dbg.panels.open);
  console.log(`  after GO ON: ${after}`);
  if (after !== 'none') console.log('  !! the card did not close');
  // (with the switch off again, the splash painted in code as it has been)
  await page.evaluate(() => { const d = window.__dbg; d.fanfare.painted.on = false; d.endlessFanfare(); });
  await page.waitForTimeout(1700);
  await snap('5_switch_off');
  console.log(`  errors ${await page.evaluate(() => (window.__errors || []).length)}`);
}
