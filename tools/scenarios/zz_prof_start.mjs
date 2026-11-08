// a CPU profile of a new game's first seconds (the stall as he arrives in town)
import { makeHands, log } from './lib.mjs';
import { writeFileSync } from 'node:fs';
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  if (process.env.LOADING === '1') await page.evaluate(() => { window.__dbg.loading.on = true; });
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press(`class:${process.env.CLS || 'warrior'}`, 0, true);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
  await cdp.send('Profiler.start');
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  for (let i = 0; i < 200; i++) { if (await page.evaluate(() => !!window.__dbg.game())) break; await page.waitForTimeout(50); }
  await page.waitForTimeout(Number(process.env.AFTER || 4000));
  const { profile } = await cdp.send('Profiler.stop');
  writeFileSync(process.env.OUT || 'prof.json', JSON.stringify(profile));
  // self time by function, and total (inclusive) by function
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const ch of n.children || []) parent.set(ch, n.id);
  const self = new Map();
  const dt = profile.timeDeltas;
  const cnt = new Map();
  profile.samples.forEach((s, i) => cnt.set(s, (cnt.get(s) || 0) + (dt[i] || 0)));
  const incl = new Map();
  for (const [id, us] of cnt) {
    const n = byId.get(id);
    const key = (n) => `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop().slice(0, 20)}:${n.callFrame.lineNumber}`;
    self.set(key(n), (self.get(key(n)) || 0) + us);
    const seen = new Set();
    let p = id;
    while (p !== undefined) { const m = byId.get(p); const k = key(m); if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) || 0) + us); } p = parent.get(p); }
  }
  const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${(v / 1000).toFixed(0).padStart(6)} ms  ${k}`);
  console.log('SELF'); for (const l of top(self).slice(0, 20)) console.log(l);
  console.log('INCLUSIVE'); for (const l of top(incl)) console.log(l);
}
