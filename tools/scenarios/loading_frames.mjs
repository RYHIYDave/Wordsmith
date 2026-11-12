// THE LOADING SCREEN'S OWN FRAMES (the queue's smooth-the-loading-screens-long-frames; his phone, 12 Nov 2026: two waits over a
// second under the loading screen into town, 1,718 ms and 1,413 ms). A page served, a phone's screen: the title, NEW GAME, a hero
// picked (CLS, default the Brawler), CONFIRM, into town as he does it; then, FLOORS=1,6 (default none), down to each floor in
// turn, the loading screen between floors. For each loading screen: every frame the game's own work took over SHOW ms (default
// 40), the longest, the sum, how many frames it was up; and the longest wait between two frames the browser showed, as he sees
// it. And the hero's frames handed over: the longest a sheet's took in one go (render/baked.ts stats.handMax).
// THROTTLE=<n>: the machine slowed n times (the browser's own), to look more like a phone. MOST=<ms>: a line starting "!!" for a
// loading screen with a frame of the game's own over it (default: none asked).
//   node tools/playtest.mjs --file dist/<page>.html --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/loading_frames.mjs --out shots/loading_frames/x
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'brawler';
  const SHOW = Number(process.env.SHOW || 40);
  const MOST = Number(process.env.MOST || 0);
  const floors = (process.env.FLOORS || '').split(',').filter(Boolean).map(Number);
  let bad = 0;
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  const cdp = await page.context().newCDPSession(page);
  if (Number(process.env.THROTTLE || 0) > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) });
  // (the waits between two frames as the browser shows them, from a frame loop of the page's own beside the game's)
  await page.evaluate(() => {
    const w = (window.__gaps = { last: 0, max: 0, over: 0, list: [] });
    const loop = (t) => {
      if (w.last) {
        const d = t - w.last;
        if (d > w.max) w.max = d;
        if (d > 100) { w.over++; if (w.list.length < 60) w.list.push(Math.round(d)); }
      }
      w.last = t;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  const gapsFrom = () => page.evaluate(() => { const w = window.__gaps; w.max = 0; w.over = 0; w.list = []; });
  const gaps = () => page.evaluate(() => ({ ...window.__gaps, list: window.__gaps.list.slice() }));
  const report = async (label) => {
    const L = await page.evaluate(() => window.__dbg.loadingLog());
    const e = L[L.length - 1];
    const g = await gaps();
    if (!e) { console.log(`  !! ${label}: no loading screen recorded`); bad++; return; }
    const worst = e.frames.reduce((m, f) => (f[1] > m[1] ? f : m), [0, 0, '']);
    const over = e.frames.filter((f) => f[1] > SHOW);
    log(label, `${e.frames.length} frames, the game's own work ${e.ms} ms in all; the longest frame ${worst[1]} ms (${worst[2] || 'waiting'}, frame ${worst[0]}); the longest wait the browser showed ${Math.round(g.max)} ms, ${g.over} over 100 ms ${JSON.stringify(g.list.slice(0, 16))}`);
    console.log(`     over ${SHOW} ms: ${over.map((f) => `${f[0]}:${f[1]}${f[2] ? ' ' + f[2] : ''}`).join(', ') || 'none'}`);
    for (const [ms, what] of e.slow || []) console.log(`     a step of ${ms} ms: ${what}`);
    if (MOST && worst[1] > MOST) { bad++; console.log(`  !! ${label}: a frame of ${worst[1]} ms, over ${MOST}`); }
  };
  const hands = await makeHands(page);
  await page.waitForTimeout(4000);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(3000);
  await hands.press(`class:${cls}`, 0, true);
  let c = null;
  for (let k = 0; k < 150 && !c; k++) { c = await hands.mark('button:CONFIRM'); if (!c) await page.waitForTimeout(20); }
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForFunction(() => !!window.__dbg.game(), null, { timeout: 60000 });
  await gapsFrom();
  await page.waitForFunction(() => !!window.__dbg.loadingNow(), null, { timeout: 60000, polling: 20 });
  await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 180000, polling: 50 });
  await page.waitForTimeout(300);
  await report(`into town (${cls})`);
  const b = await page.evaluate(() => window.__dbg.baked());
  log('his frames handed over', b ? `${b.given} given; the longest a sheet's took in one go ${b.handMax} ms, ${Math.round(b.handMs)} ms in all; the groups ${JSON.stringify(b.ms)}` : 'no bake');
  if (typeof snap === 'function') await snap('town');
  for (const f of floors) {
    await page.evaluate(() => { const d = window.__dbg; d.autoLevel = false; d.autoWords = false; });
    await gapsFrom();
    await page.evaluate((depth) => { const g = window.__dbg.game(); g.depth = depth; g.enterDungeon(); }, f);
    await page.waitForFunction(() => !!window.__dbg.loadingNow(), null, { timeout: 20000, polling: 20 }).catch(() => {});
    await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 180000, polling: 50 });
    await page.waitForTimeout(300);
    await report(`floor ${f}`);
    if (typeof snap === 'function') await snap(`floor${f}`);
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  if (errs.length) { bad++; console.log(`  !! errors on the page: ${errs.join(' | ').slice(0, 400)}`); }
  if (bad) console.log(`!! ${bad} thing(s) wrong`);
}
