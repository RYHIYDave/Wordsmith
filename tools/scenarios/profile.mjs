// Where the time goes: a stacked loadout in a live fight under the browser's profiler.
// Prints the functions that used the most processor time. Build with --dev first so they have names.
//   node tools/build.mjs --dev && CLS=mage SET="frost+twin|frost+twin/frost|frost" node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/profile.mjs --out shots/prof
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'mage';
  const secs = Number(process.env.SECS || 6);
  const parse = (s) => { const [f, b] = s.split('|'); return { front: (f || '').split('+').filter(Boolean), behind: (b || '').split('+').filter(Boolean) }; };
  const set = (process.env.SET || 'frost+twin|frost+twin/frost|frost').split('/').map(parse);
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate((c) => { const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; }, cls);
  await page.waitForTimeout(400);
  const hands = await makeHands(page);
  await page.evaluate((set) => {
    const g = window.__dbg.game(); const h = g.hero;
    for (const w of Object.keys(h.words)) h.words[w] = 4;
    for (let k = 0; k < 2; k++) { for (const w of set[k].front) g.socket(k, 'front', w); for (const w of set[k].behind) g.socket(k, 'behind', w); }
  }, set);
  const nearest = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; let best = null; let bd = 1e9;
    for (const m of g.monsters) { if (m.dead) continue; const k = Math.hypot(m.x - h.x, m.y - h.y); if (k < bd) { bd = k; best = m; } }
    return best ? d.at(best.x, best.y) : null;
  });
  await page.mouse.down({ button: 'left' });
  await page.mouse.down({ button: 'right' });
  // let the fight build up before measuring
  let t0 = Date.now();
  const fight = async (ms) => { t0 = Date.now(); while (Date.now() - t0 < ms) { const at = await nearest(); if (at) { const c = await hands.client(at.x, at.y - 10); await page.mouse.move(c.x, c.y); } await page.waitForTimeout(110); } };
  await fight(2500);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  await cdp.send('Profiler.start');
  await fight(secs * 1000);
  const { profile } = await cdp.send('Profiler.stop');
  await page.mouse.up({ button: 'left' });
  await page.mouse.up({ button: 'right' });
  const state = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); return { zones: g.zones.length, parts: d.fx.particles.length, names: g.hero.skills.slice(0, 2).map((k) => k.r.name) }; });
  log('loadout', state.names.join(' + '));
  log('at the end', `${state.zones} ground patches, ${state.parts} particles`);
  // self time by function
  const dt = profile.timeDeltas; const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map(); let total = 0;
  for (let i = 0; i < profile.samples.length; i++) {
    const n = byId.get(profile.samples[i]); const d = dt[i] || 0; total += d;
    const name = `${n.callFrame.functionName || '(anonymous)'}:${n.callFrame.lineNumber}`;
    self.set(name, (self.get(name) || 0) + d);
  }
  const rows = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22);
  for (const [name, us] of rows) log(name, `${(us / 1000).toFixed(0)} ms  ${((us / total) * 100).toFixed(1)}%`);
  log('total sampled (ms)', +(total / 1000).toFixed(0));
}
