// WHAT THE LONG FRAMES UNDER THE LOADING SCREEN ARE (the queue's smooth-the-loading-screens-long-frames; his phone, 12 Nov 2026,
// the phone check's run rmwdh7eupd67: two waits over a second as he comes into town, 1,718 ms and 1,413 ms). A readable build,
// served, a phone's screen: the title, NEW GAME, a hero picked (CLS, default the Brawler), CONFIRM, and the browser's own
// profiler from then until he plays in town. Every stretch the page was busy for over SPAN ms (default 150) without a pause,
// with where its time went: the ways down from what began it (the frame, a file come, a picture decoded), the most first.
// THROTTLE=<n>: the machine slowed n times (the browser's own), to look more like a phone.
//   node tools/playtest.mjs --file dist/<page>.html --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/loading_profile.mjs --out shots/loading_profile/x
import { makeHands, log } from './lib.mjs';

export default async function (page) {
  const cls = process.env.CLS || 'brawler';
  const SPAN = Number(process.env.SPAN || 150);
  const DEEP = Number(process.env.DEEP || 7);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
  const hands = await makeHands(page);
  await page.waitForTimeout(4000);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(3000);
  await hands.press(`class:${cls}`, 0, true);
  let c = null;
  for (let k = 0; k < 150 && !c; k++) { c = await hands.mark('button:CONFIRM'); if (!c) await page.waitForTimeout(20); }
  if (Number(process.env.THROTTLE || 0) > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) });
  await cdp.send('Profiler.start');
  const t0 = Date.now();
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForFunction(() => !!window.__dbg.game(), null, { timeout: 60000 });
  await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 120000, polling: 50 });
  await page.waitForTimeout(800);
  const { profile: p } = await cdp.send('Profiler.stop');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const wall = Date.now() - t0;
  const byId = new Map(p.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of p.nodes) for (const ch of n.children || []) parent.set(ch, n.id);
  const pathOf = (id) => {
    const out = [];
    for (let x = id; x !== undefined; x = parent.get(x)) { const f = byId.get(x).callFrame; out.push(`${f.functionName || '(anon)'}:${f.lineNumber + 1}`); }
    return out.reverse();
  };
  // (only the browser's own idle is a pause: the garbage collector and the browser's own work, `(program)`, are busy)
  const idle = (path) => path[path.length - 1].startsWith('(idle)');
  // (the samples in time, and the stretches busy without a pause)
  let t = p.startTime;
  const spans = [];
  let cur = null;
  for (let i = 0; i < p.samples.length; i++) {
    t += p.timeDeltas[i] || 0;
    const path = pathOf(p.samples[i]);
    if (!idle(path)) {
      if (!cur || t - cur.end > 8000) { cur = { start: t, end: t, n: 0, ways: new Map(), own: new Map() }; spans.push(cur); }
      const dt = (p.timeDeltas[i + 1] || p.timeDeltas[i] || 0) / 1000;
      cur.end = t;
      cur.n += dt;
      const key = path.slice(1, 1 + DEEP).join(' > ');
      cur.ways.set(key, (cur.ways.get(key) || 0) + dt);
      const leaf = path[path.length - 1];
      cur.own.set(leaf, (cur.own.get(leaf) || 0) + dt);
    } else cur = null;
  }
  const long = spans.filter((s) => (s.end - s.start) / 1000 >= SPAN);
  log('the loading screen', `${(wall / 1000).toFixed(1)} s on the wall; ${long.length} stretches busy over ${SPAN} ms`);
  for (const s of long) {
    console.log(`\n== at ${((s.start - p.startTime) / 1e6).toFixed(2)} s: ${Math.round((s.end - s.start) / 1000)} ms busy (${Math.round(s.n)} ms sampled)`);
    for (const [k, v] of [...s.ways].sort((a, b) => b[1] - a[1]).slice(0, Number(process.env.TOP || 10))) console.log(`  ${String(Math.round(v)).padStart(6)} ms  ${k}`);
    console.log('  their own time:');
    for (const [k, v] of [...s.own].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${String(Math.round(v)).padStart(6)} ms  ${k}`);
  }
}
