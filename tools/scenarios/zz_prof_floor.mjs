// a CPU profile of a few seconds on a floor (FLOOR, 1), the hero standing
import { writeFileSync } from 'node:fs';
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate((k) => { const d = window.__dbg; d.saving(false); d.run('warrior', 5); const g = d.game(); g.depth = k; g.cleared = k - 1; g.enterDungeon(); }, Number(process.env.FLOOR || 1));
  await page.waitForTimeout(6000);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
  await cdp.send('Profiler.start');
  const f0 = await page.evaluate(() => new Promise((ok) => { let n = 0; const t0 = performance.now(); const step = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(step); else ok(n); }; requestAnimationFrame(step); }));
  const { profile } = await cdp.send('Profiler.stop');
  writeFileSync(process.env.OUT, JSON.stringify(profile));
  console.log('frames in 3 s', f0);
  await snap('floor');
}
