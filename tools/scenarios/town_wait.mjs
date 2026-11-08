// (his 7 Nov 2026 answer on 25.2.3: “It didn’t crash but I couldn’t move for maybe 15 seconds.  Not ideal”) a fresh game, the
// phone's speed put on the test browser (CPU slowed, the network a phone's): how long after arriving in town he first moves, the
// long stalls of the page meanwhile, and what was fetched. Env: CLS (warrior), CPU (slowdown, 6), NET (1: a phone's network).
import { makeHands, log } from './lib.mjs';
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  const cpu = Number(process.env.CPU || 6);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  if (process.env.NET !== '0') {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (4e6 / 8), uploadThroughput: (1e6 / 8) });
  }
  const reqs = [];
  const t0 = Date.now();
  page.on('request', (r) => { const u = r.url(); if (/sounds\/|heroes\//.test(u)) reqs.push({ u: u.replace(/.*\/(sounds|heroes)\//, '$1/'), at: Date.now() - t0 }); });
  await page.evaluate(() => {
    window.__long = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch {}
  });
  if (process.env.LOADING === '1') await page.evaluate(() => { window.__dbg.loading.on = true; });
  const hands = await makeHands(page);
  const cls = process.env.CLS || 'warrior';
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press(`class:${cls}`, 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  // wait for the game to begin, then hold a way and see when he first moves
  let begun = null;
  for (let i = 0; i < 400; i++) {
    const g = await page.evaluate(() => { const g = window.__dbg.game(); return g ? { x: g.hero.x, y: g.hero.y, t: performance.now() } : null; });
    if (g) { begun = g; break; }
    await page.waitForTimeout(100);
  }
  if (!begun) { log('never began', ''); return; }
  const tBegin = Date.now();
  if (process.env.LOADING === '1') { await page.waitForTimeout(300); await snap('0_loading'); }
  await page.keyboard.down('KeyD');
  let moved = null;
  const samples = [];
  for (let i = 0; i < 160; i++) {
    const g = await page.evaluate(() => { const g = window.__dbg.game(); return { x: g.hero.x, y: g.hero.y, now: performance.now() }; });
    samples.push(g);
    if (!moved && Math.hypot(g.x - begun.x, g.y - begun.y) > 0.5) { moved = (Date.now() - tBegin) / 1000; }
    if (moved && Date.now() - tBegin > moved * 1000 + 3000) break;
    await page.waitForTimeout(250);
  }
  await page.keyboard.up('KeyD');
  log('cpu slowdown', cpu);
  log('first moved after (s)', moved);
  const long = await page.evaluate((s) => window.__long.filter((e) => e[0] > s - 2000).map((e) => [Math.round(e[0] - s), e[1]]), begun.t);
  log('long stalls after arriving [at ms, ms]', long.filter((e) => e[1] > 150).slice(0, 30));
  log('stall total ms', long.reduce((a, e) => a + e[1], 0));
  const since = tBegin - t0;
  log('fetched in the first 20 s after arriving', reqs.filter((r) => r.at > since - 3000 && r.at < since + 20000).length);
  log('heroes fetched', reqs.filter((r) => r.u.startsWith('heroes/')).map((r) => [r.u.slice(0, 40), r.at - since]));
  log('baked', await page.evaluate(() => window.__dbg.baked && window.__dbg.baked()));
  await snap('a_moved');
}
