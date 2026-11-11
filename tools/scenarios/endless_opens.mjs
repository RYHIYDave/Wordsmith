// ENDLESS MODE OPENING AS THE GAME ITSELF OPENS IT (25.3.2): the last floor beaten, the hero taken home to town, the town's
// loading screen up, and THEN the splash (ui/endless_fanfare.ts; the painted one, art/endless_stair.ts, while ENDLESS_SPLASH is
// on). The splash's own playtests (endless_fanfare_look.mjs, endless_splash_look.mjs) begin it in a town already loaded, so none
// of them saw that the loading screen between floors (25.2.9) was up over the splash's first seconds. Held to:
//   - the loading screen comes up as he comes to town, and goes;
//   - as it lifts the splash is at its beginning (not part way through, not already over), and it is the splash that shows;
//   - the first frame of the splash is not a long one (its picture was painted under the loading screen);
//   - the splash runs its time, the card comes, GO ON closes it, no errors.
// A line starting "!!" is something wrong.
//   node tools/build_to.mjs dist/x.html
//   node tools/playtest.mjs --file dist/x.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/endless_opens.mjs --out shots/endless_opens/phone
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 7); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__dbg.seasoned(30));
  const lastFloor = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.endless = 0;
    g.inEndless = false;
    g.depth = 20;
    g.enterDungeon();
    return g.depth;
  });
  console.log(`  on floor ${lastFloor}`);
  // (its own loading screen come and gone)
  const gone = async (ms) => {
    const t0 = Date.now();
    let seen = false;
    while (Date.now() - t0 < ms) {
      const l = await page.evaluate(() => window.__dbg.loadingNow());
      if (l) seen = true;
      if (!l && (seen || Date.now() - t0 > 1500)) return seen;
      await page.waitForTimeout(30);
    }
    return null;
  };
  await gone(40000);
  await page.evaluate(() => window.__dbg.loadedHere());
  await page.waitForTimeout(600);
  // THE LAST FLOOR BEATEN: the way on, as the game takes it
  const before = await page.evaluate(() => { const g = window.__dbg.game(); return { endless: g.endless, town: !!g.level.town }; });
  await page.evaluate(() => {
    const d = window.__dbg;
    // (each frame: is the loading screen up, is the splash up and how far in, how long the frame took)
    const log = [];
    let lastAt = performance.now();
    const tick = () => {
      const now = performance.now();
      log.push({ ms: Math.round(now - lastAt), loading: !!d.loadingNow(), shown: d.fanfareShown(), t: d.fanfareT ? d.fanfareT() : null });
      lastAt = now;
      if (log.length < 4000 && !window.__endlessOpensDone) requestAnimationFrame(tick);
    };
    window.__endlessOpensLog = log;
    requestAnimationFrame(tick);
    d.game().takeWay('on');
  });
  const t0 = Date.now();
  let lifted = null;
  let sawLoading = false;
  while (Date.now() - t0 < 40000) {
    const s = await page.evaluate(() => ({ l: !!window.__dbg.loadingNow(), shown: window.__dbg.fanfareShown() }));
    if (s.l) sawLoading = true;
    if (!s.l && sawLoading) { lifted = s; break; }
    await page.waitForTimeout(15);
  }
  await snap('1_as_the_loading_screen_lifts');
  const after = await page.evaluate(() => { const g = window.__dbg.game(); return { endless: g.endless, town: !!g.level.town, panel: window.__dbg.panels.open }; });
  console.log(`  before ${JSON.stringify(before)}, after ${JSON.stringify(after)}`);
  if (!sawLoading) console.log('  !! no loading screen as he came to town');
  if (!lifted) console.log('  !! the loading screen did not go');
  if (after.endless !== 1 || !after.town) console.log('  !! endless mode did not open in town');
  if (after.panel !== 'endless') console.log(`  !! the splash's panel is not open: ${after.panel}`);
  await page.waitForTimeout(700);
  await snap('2_the_splash_waking');
  await page.waitForTimeout(900);
  await snap('3_the_word_landed');
  try {
    await page.waitForFunction(() => window.__dbg.fanfareShown() === 'card', null, { timeout: 30000 });
  } catch {
    console.log('  !! the card did not come up after the splash');
  }
  await page.waitForTimeout(700);
  await snap('4_the_card');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const end = await page.evaluate(() => { window.__endlessOpensDone = true; return { panel: window.__dbg.panels.open, log: window.__endlessOpensLog }; });
  if (end.panel !== 'none') console.log(`  !! the card did not close: ${end.panel}`);
  // WHAT THE FRAMES SAW
  const log = end.log;
  const firstLoading = log.findIndex((f) => f.loading);
  const firstAfter = log.findIndex((f, i) => i > firstLoading && firstLoading >= 0 && !f.loading);
  const loadingMs = firstLoading >= 0 && firstAfter > 0 ? log.slice(firstLoading, firstAfter).reduce((n, f) => n + f.ms, 0) : null;
  const first = firstAfter > 0 ? log[firstAfter] : null;
  const splash = log.filter((f, i) => i >= firstAfter && firstAfter > 0 && f.shown === 'splash');
  const splashMs = splash.reduce((n, f) => n + f.ms, 0);
  const longest = splash.reduce((n, f) => Math.max(n, f.ms), 0);
  const most = splash.reduce((n, f) => Math.max(n, f.t ?? 0), 0);
  console.log(`  the loading screen up ${loadingMs} ms; as it lifted: shown ${first ? first.shown : null}, the splash ${first && first.t !== null ? first.t.toFixed(2) : null} s in`);
  console.log(`  the splash shown ${splash.length} frames, ${splashMs} ms of the wall's time, to ${most.toFixed(2)} s of its own; its longest frame ${longest} ms (its first ${splash.length ? splash[0].ms : null} ms)`);
  if (!first || first.shown !== 'splash') console.log(`  !! as the loading screen lifted the splash was not showing: ${first ? first.shown : null}`);
  else if (first.t === null || first.t > 0.25) console.log(`  !! the splash was already ${first.t} s in as the loading screen lifted`);
  if (most < 3.0) console.log(`  !! the splash did not run its time: ${most.toFixed(2)} s`);
  if (splash.length && splash[0].ms > 250) console.log(`  !! the splash's first frame took ${splash[0].ms} ms (its picture painted in the dark?)`);
  console.log(`  errors ${await page.evaluate(() => (window.__errors || []).length)}`);
}
