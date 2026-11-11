// (his 7 Nov 2026, 23:11: “Still a ton of lag in the town”) a new game begun as he begins one, the phone's speed put on the test
// browser (CPU slowed by CPU, 6), then 30 s in town: walking each way, standing still (his idle gestures), walking again. The
// frames' times (how many over 50 and 100 ms, the longest), and a CPU profile of the walk to OUT (what the time went on).
import { makeHands, log } from './lib.mjs';
import { writeFileSync } from 'node:fs';
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  const cpu = Number(process.env.CPU || 6);
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press(`class:${process.env.CLS || 'warrior'}`, 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!window.__dbg.game())) break; await page.waitForTimeout(100); }
  // (till the loading screen, if any, is gone and his pictures are in)
  await page.waitForTimeout(8000);
  // OFF=all (or names): the renderer's speed switches turned off first (render/still_floor.ts, still_glows.ts, still_dark.ts), to
  // measure the town as it was drawn before them on the same page
  if (process.env.OFF) log('speed switches off', await page.evaluate((want) => { const R = window.__dbg.renderer; const all = Object.keys(R).filter((k) => R[k] && typeof R[k] === 'object' && R[k].sw && typeof R[k].sw.on === 'boolean' && R[k].stats); const names = want === 'all' ? all : all.filter((k) => want.split(',').includes(k)); for (const k of names) R[k].sw.on = false; return names.join(', ') || 'none'; }, process.env.OFF));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await page.evaluate(() => { window.__ft = []; let last = performance.now(); const step = (t) => { window.__ft.push(t - last); last = t; requestAnimationFrame(step); }; requestAnimationFrame(step); });
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 2000 });
  await cdp.send('Profiler.start');
  const walk = async (k, ms) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); };
  await walk('KeyW', 3000); await walk('KeyD', 3000); await walk('KeyS', 3000); await walk('KeyA', 3000);
  await page.waitForTimeout(9000); // standing: his gestures come after a few seconds
  await walk('KeyD', 3000); await walk('KeyW', 3000);
  const { profile } = await cdp.send('Profiler.stop');
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(profile));
  const ft = await page.evaluate(() => window.__ft.slice(2));
  const sorted = [...ft].sort((a, b) => a - b);
  const q = (p) => Math.round(sorted[Math.floor(p * (sorted.length - 1))]);
  log('cpu slowdown', cpu);
  log('frames', ft.length);
  log('median, 90%, 99%, longest (ms)', [q(0.5), q(0.9), q(0.99), Math.round(sorted[sorted.length - 1])]);
  log('frames over 50 / 100 / 250 ms', [ft.filter((x) => x > 50).length, ft.filter((x) => x > 100).length, ft.filter((x) => x > 250).length]);
  log('time in frames over 100 ms (s)', (ft.filter((x) => x > 100).reduce((a, b) => a + b, 0) / 1000).toFixed(1));
  log('baked', await page.evaluate(() => window.__dbg.baked && window.__dbg.baked()));
  await snap('town');
}
