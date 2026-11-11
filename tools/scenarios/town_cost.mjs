// WHAT A FRAME OF THE TOWN COSTS (his 7 Nov 2026, 23:11: “Still a ton of lag in the town”): a new game begun as he begins one,
// then SECS seconds standing in town and SECS walking about it, and for each the page's own working time for a frame (all the
// time its main thread was busy, the script and the drawing it asks for, divided by the frames drawn: the browser's own count,
// Performance.getMetrics TaskDuration). Not held to the screen's beat as the time between frames is (town_lag.mjs), so two
// builds can be told apart to a millisecond. CPU: the processor slowed that many times (1 if not given; 6 is the phone's speed
// town_lag uses). OFF: speed switches of the renderer to turn off first (renderer.<name>.sw.on), "all" for every one.
//   node tools/build_to.mjs dist/town_new.html
//   node tools/playtest.mjs --file dist/town_new.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/town_cost.mjs --out shots/town_cost
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  const cpu = Number(process.env.CPU || 1);
  const secs = Number(process.env.SECS || 8);
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press(`class:${process.env.CLS || 'warrior'}`, 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!window.__dbg.game())) break; await page.waitForTimeout(100); }
  // (till the loading screen is gone and his pictures are in)
  await page.waitForTimeout(8000);
  const off = await page.evaluate((want) => {
    const R = window.__dbg.renderer;
    const all = Object.keys(R).filter((k) => R[k] && typeof R[k] === 'object' && R[k].sw && typeof R[k].sw.on === 'boolean' && R[k].stats);
    const names = want === 'all' ? all : all.filter((k) => want.split(',').includes(k));
    for (const k of names) R[k].sw.on = false;
    return { all, off: names };
  }, process.env.OFF || '');
  log('speed switches', `${off.all.join(', ') || 'none in this build'}${off.off.length ? `; OFF for this run: ${off.off.join(', ')}` : ''}`);
  await cdp.send('Performance.enable');
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await page.evaluate(() => { window.__frames = 0; const step = () => { window.__frames++; requestAnimationFrame(step); }; requestAnimationFrame(step); });
  const busy = async () => { const { metrics } = await cdp.send('Performance.getMetrics'); const m = Object.fromEntries(metrics.map((q) => [q.name, q.value])); return { task: m.TaskDuration, script: m.ScriptDuration, frames: await page.evaluate(() => window.__frames) }; };
  const span = async (name, act) => {
    await page.waitForTimeout(600);
    const a = await busy();
    await act();
    const b = await busy();
    const n = b.frames - a.frames;
    log(name, `${n} frames in ${secs} s; a frame's work ${(((b.task - a.task) * 1000) / n).toFixed(1)} ms (its script ${(((b.script - a.script) * 1000) / n).toFixed(1)} ms)`);
  };
  const walk = async (k, ms) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); };
  await span('standing', async () => { await page.waitForTimeout(secs * 1000); });
  await span('walking', async () => { const each = (secs * 1000) / 4; await walk('KeyW', each); await walk('KeyD', each); await walk('KeyS', each); await walk('KeyA', each); });
  log('cpu slowdown', cpu);
  await snap('town');
}
