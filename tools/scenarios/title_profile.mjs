// WHAT THE GAME'S OWN FRAME IS DOING ON THE HERO CARDS (the phone check, tried here, 11 Nov 2026: 3 frames a second there for
// some six seconds, the game's own frame 366 ms in the middle, in Chrome on a cloud machine). A readable build, served, a
// phone's screen: the title a few seconds, NEW GAME, and the browser's own profiler over the hero cards (SECS, default 6);
// then, PICK=<hero>, the card pressed, and the profiler over the hero making ready. The functions the time was spent IN
// (their own time, not what they call), the most first.
//   node tools/playtest.mjs --file dist/wrapped_dev.html --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/title_profile.mjs --out shots/title_profile/x
import { makeHands, log } from './lib.mjs';

export default async function (page) {
  const secs = Number(process.env.SECS || 6);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
  const hands = await makeHands(page);
  const profile = async (name, ms, begin) => {
    await cdp.send('Profiler.start');
    const t0 = Date.now();
    if (begin) await begin();
    await page.waitForTimeout(ms);
    const { profile: p } = await cdp.send('Profiler.stop');
    const own = new Map();
    const byId = new Map(p.nodes.map((n) => [n.id, n]));
    const dt = p.timeDeltas || [];
    let total = 0;
    for (let i = 0; i < p.samples.length; i++) {
      const n = byId.get(p.samples[i]);
      const f = n.callFrame;
      const key = `${f.functionName || '(anonymous)'}:${f.lineNumber + 1}`;
      own.set(key, (own.get(key) || 0) + (dt[i] || 0) / 1000);
      total += (dt[i] || 0) / 1000;
    }
    const rows = [...own].sort((a, b) => b[1] - a[1]).slice(0, Number(process.env.TOP || 28));
    // (WAYS=1: who asked for it: each sample's way down from the frame to where its time was spent, the last six steps
    // before the function it is in, the most first)
    if (process.env.WAYS === '1') {
      const parent = new Map();
      for (const n of p.nodes) for (const c of n.children || []) parent.set(c, n.id);
      const ways = new Map();
      for (let i = 0; i < p.samples.length; i++) {
        const path = [];
        for (let id = p.samples[i]; id !== undefined; id = parent.get(id)) { const f = byId.get(id).callFrame; path.push(`${f.functionName || '(anon)'}:${f.lineNumber + 1}`); }
        path.reverse();
        const cut = Number(process.env.DEEP || 9);
        const key = path.slice(1, 1 + cut).join(' > ');
        ways.set(key, (ways.get(key) || 0) + (dt[i] || 0) / 1000);
      }
      console.log(`${name}: the ways down`);
      for (const [k, v] of [...ways].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${String(Math.round(v)).padStart(6)} ms  ${k}`);
    }
    console.log(`${name}: ${((Date.now() - t0) / 1000).toFixed(1)} s on the wall, ${Math.round(total)} ms sampled`);
    for (const [k, v] of rows) console.log(`  ${String(Math.round(v)).padStart(6)} ms  ${k}`);
  };
  await page.waitForTimeout(4000);
  await profile('THE HERO CARDS', secs * 1000, () => hands.press('button:NEW GAME'));
  if (process.env.PICK) {
    await profile(`A HERO PICKED (${process.env.PICK})`, 2500, () => hands.press(`class:${process.env.PICK}`, 0, true));
  }
  log('done', 'profiled');
}
