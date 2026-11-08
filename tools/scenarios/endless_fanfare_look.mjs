// ENDLESS MODE'S FANFARE (ui/endless_fanfare.ts, behind ENDLESS_FANFARE, off), for his pictures: a hero in town as endless mode
// opens to him, the switch turned on for this page only: the splash as it comes up (a few moments of it), then the card.
//   node tools/build_to.mjs dist/fanfare.html
//   node tools/playtest.mjs --file dist/fanfare.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/endless_fanfare_look.mjs --out shots/fanfare/phone
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.run('warrior', 21);
    d.autoLevel = false;
    d.autoWords = false;
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.seasoned(30);
    d.fanfare.on = true;
    d.endlessFanfare();
  });
  const t0 = Date.now();
  for (const [ms, name] of [[250, '1_splash_dark'], [800, '2_splash_word'], [1600, '3_splash_whole']]) {
    const wait = t0 + ms - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(name);
  }
  // (the game's clock, not the wall's: a slow headless page runs it slower)
  await page.waitForFunction(() => window.__dbg.fanfareShown() === 'card', null, { timeout: 30000 });
  console.log(`  the card up after ${((Date.now() - t0) / 1000).toFixed(1)} s of the wall's time`);
  await page.waitForTimeout(400);
  await snap('4_the_card');
  const open = await page.evaluate(() => window.__dbg.panels.open);
  console.log(`  panel open: ${open}`);
  // (GO ON: Enter, as a press of the button)
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__dbg.panels.open);
  console.log(`  after GO ON: ${after}`);
  if (after !== 'none') console.log('  !! the card did not close');
  await snap('5_after');
  // (as the game itself opens endless mode: its event, and the splash comes up of itself)
  await page.evaluate(() => { const g = window.__dbg.game(); g.events.push({ t: 'endlessOpens' }); });
  try {
    await page.waitForFunction(() => window.__dbg.fanfareShown() === 'splash', null, { timeout: 10000 });
    console.log('  the game\'s event brings up the splash');
  } catch {
    console.log('  !! the game\'s event did not bring up the splash');
  }
  console.log(`  errors ${await page.evaluate(() => (window.__errors || []).length)}`);
}
