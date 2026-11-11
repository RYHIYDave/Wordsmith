// THE LOADING SCREEN'S PICTURE (art/loading_ring.ts, behind LOADING_RING, off), for his pictures: a hero in town goes down
// into the first dungeon with the switch turned on for this page only and the screen held up (LOADING.betweenLeast, for this
// page only), so that its life can be seen: the screen at a few moments of its own time (the game's clock stopped while each
// picture is taken: `__dbg.loadingAt`); then the floor, to show the game goes on. With OLD=1 the screen as it is, the same
// way, to set beside it.
//   node tools/build_to.mjs dist/loading_ring.html
//   node tools/playtest.mjs --file dist/loading_ring.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/loading_ring_look.mjs --out shots/loading_ring/phone
//   AT=0,0.4,0.8   the moments (seconds of its own time)
//   CPU=6          the processor slowed six times, as a phone's: what the screen costs is told (its first drawing, its longest since)
//   FILM=96        instead of the pictures, that many frames of it, thirty to a second, numbered (<out>_film_0001.png ...), the
//                  town before it and the floor after it as stills: for an mp4 (ffmpeg -framerate 30 -i <out>_film_%04d.png ...)
export default async function (page, snap) {
  const old = process.env.OLD === '1';
  if (process.env.CPU) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.CPU) });
    console.log(`  the processor slowed ${process.env.CPU} times`);
  }
  const film = Number(process.env.FILM || 0);
  const name = old ? 'old' : 'new';
  let shot = 0;
  const frame = async () => snap(`film_${String(++shot).padStart(4, '0')}`);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 7); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(2500);
  const size = await page.evaluate((on) => {
    const d = window.__dbg;
    d.seasoned(8);
    d.loadedHere();
    d.loadingRing.on = on;
    // (held up until the pictures are taken)
    d.loading.betweenLeast = 1e6;
    const c = document.querySelector('canvas');
    return { canvas: [c.width, c.height] };
  }, !old);
  console.log(`  the canvas ${JSON.stringify(size.canvas)} picture pixels`);
  if (film) for (let k = 0; k < 12; k++) await frame();
  await page.evaluate(() => window.__dbg.game().enterDungeon());
  const t0 = Date.now();
  // (up at once; the place's pictures are made under it, the page standing still meanwhile)
  await page.waitForFunction(() => { const l = window.__dbg.loadingNow(); return !!l && l.frames > 3; }, null, { timeout: 120000 });
  console.log(`  the place made under it after ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (!old) console.log(`  its cost over its first frames: ${JSON.stringify(await page.evaluate(() => window.__dbg.loadingRingCost()))}`);
  if (process.env.CPU) {
    // (left to run a while at that speed, for what its frames cost)
    await page.waitForTimeout(4000);
    if (!old) console.log(`  its cost after four seconds more: ${JSON.stringify(await page.evaluate(() => window.__dbg.loadingRingCost()))}`);
  }
  // (each picture at its moment: the game's clock stopped, the screen's own time set)
  await page.evaluate(() => { window.__dbg.slowmo = 0; });
  const at = async (t) => {
    await page.evaluate((v) => new Promise((ok) => { window.__dbg.loadingAt(v); requestAnimationFrame(() => requestAnimationFrame(() => ok(null))); }), t);
    if (!(await page.evaluate(() => window.__dbg.loadingNow()))) console.log('  !! the loading screen went before its pictures were taken');
  };
  if (film) {
    for (let k = 0; k < film; k++) {
      await at(k / 30);
      await frame();
    }
  } else {
    let n = 0;
    for (const want of (process.env.AT || '0,0.25,0.45,0.65,1.25').split(',').map(Number)) {
      await at(want);
      await snap(`${name}_${n++}`);
      console.log(`    at ${want.toFixed(2)} s of its own time`);
    }
  }
  if (!old) console.log(`  its cost in all: ${JSON.stringify(await page.evaluate(() => window.__dbg.loadingRingCost()))}`);
  // (let go: its own time set past the least it was to be up, the clock running, the least as the game has it again)
  await page.evaluate(() => { const d = window.__dbg; d.loading.betweenLeast = 0.2; d.slowmo = 1; d.loadingAt(2e6); });
  await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 120000 });
  await page.waitForTimeout(900);
  if (film) for (let k = 0; k < 24; k++) await frame();
  else await snap(`${name}_after`);
  const where = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: !!g.level.town }; });
  console.log(`  now ${JSON.stringify(where)}`);
  if (where.town || where.depth !== 1) console.log('  !! not on floor 1 after it');
  console.log(`  errors ${await page.evaluate(() => (window.__errors || []).length)}`);
}
