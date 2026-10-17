// THE PHONE REPORT: how smoothly each kind of place runs, at a phone's size, the processor slowed THROTTLE times.
//   node tools/build_to.mjs dist/act1.html
//   THROTTLE=2 PLACES=town,1,3,5,6,7,8,9,10 node tools/playtest.mjs --file dist/act1.html --touch --size 844x390 --dpr 3 --init tools/canvas_room.js --scenario tools/scenarios/phone_report.mjs --out shots/phone/r
// Each place: come into it (and let the painter finish its heavy pictures, at full speed), then with the processor
// slowed: the bot playing there for SECS (12) seconds, and, on a floor with a boss, set before him and fighting him
// (the Drowned Eye also risen). Each measured as frames a second, the average frame, the longest, and how many frames
// took longer than 34 ms (a stutter: two frames of a 60-a-second screen) and 50 ms; then the canvases' room and the
// page process's. The hero is unkillable (god) and level 20. Ends with one line a place: `report <place> {...}`.
import { execSync } from 'node:child_process';
import { log } from './lib.mjs';

function room() {
  try {
    const out = execSync('ps -eo rss,args', { encoding: 'utf8' });
    let page = 0;
    for (const line of out.split('\n')) {
      const m = /^\s*(\d+)\s+(.*)$/.exec(line);
      if (m && /--type=renderer/.test(m[2])) page += Number(m[1]);
    }
    return Math.round(page / 1024);
  } catch { return -1; }
}

export default async function (page, snap) {
  const throttle = Number(process.env.THROTTLE || 2);
  const secs = Number(process.env.SECS || 12);
  const places = (process.env.PLACES || 'town,1,3,5,6,7,8,9,10').split(',');
  const cdp = await page.context().newCDPSession(page);
  const slow = (r) => cdp.send('Emulation.setCPUThrottlingRate', { rate: r });
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(1500);
  // (a hero who has cleared the Prison, as one coming to the descent would have: the town come into again)
  await page.evaluate(() => { const g = window.__dbg.game(); g.cleared = 5; g.enterTown(); });
  await page.waitForTimeout(1500);
  const frames = (ms) => page.evaluate((dur) => new Promise((done) => {
    let n = 0; let worst = 0; let s34 = 0; let s50 = 0; let last = performance.now(); const t0 = last;
    const tick = (now) => {
      const d = now - last; last = now; n++;
      if (d > worst) worst = d; if (d > 34) s34++; if (d > 50) s50++;
      if (now - t0 < dur) requestAnimationFrame(tick);
      else done({ fps: +(n / ((now - t0) / 1000)).toFixed(1), avg: +(((now - t0) / n)).toFixed(1), worst: Math.round(worst), over34: s34, over50: s50 });
    };
    requestAnimationFrame(tick);
  }), ms);
  const painterDone = async (cap) => {
    const t0 = Date.now(); let quiet = 0; let last = -1;
    while (Date.now() - t0 < cap * 1000) {
      await page.waitForTimeout(4000);
      const st = await page.evaluate(() => { const d = window.__dbg; const p = d.painter; return { given: p.stats.frames, busy: p.busy(), main: d.painting.frames }; });
      const now = st.given + st.main;
      quiet = now === last && !st.busy ? quiet + 1 : 0;
      last = now;
      if (quiet >= 2) break;
    }
    return Math.round((Date.now() - t0) / 1000);
  };
  // PROFILE=1: each measured stretch under the browser's profiler too, and the functions that took the most time named
  const profiling = process.env.PROFILE === '1';
  if (profiling) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 250 }); }
  const measure = async (name, ms) => {
    if (profiling) await cdp.send('Profiler.start');
    const f = await frames(ms);
    if (profiling) {
      const { profile } = await cdp.send('Profiler.stop');
      const byId = new Map(profile.nodes.map((n) => [n.id, n]));
      const self = new Map(); let total = 0;
      for (let i = 0; i < profile.samples.length; i++) {
        const n = byId.get(profile.samples[i]); const d = profile.timeDeltas[i] || 0; total += d;
        const k = `${n.callFrame.functionName || '(anonymous)'}:${n.callFrame.lineNumber}`;
        self.set(k, (self.get(k) || 0) + d);
      }
      const rows = [...self.entries()].sort((x, y) => y[1] - x[1]).slice(0, 14);
      log(`profile ${name}`, rows.map(([k, us]) => `${k} ${((us / total) * 100).toFixed(1)}%`).join(' | '));
    }
    return f;
  };
  const out = {};
  for (const place of places) {
    const town = place === 'town';
    const depth = town ? 0 : Number(place);
    await page.evaluate((n) => {
      const d = window.__dbg; const g = d.game();
      d.bot(false);
      if (n === 0) g.enterTown();
      else { g.depth = n; g.cleared = n - 1; g.enterDungeon(); g.level.explored.fill(1); }
    }, depth);
    // (arriving: the first seconds in a place, while what it shows first is painted; at the processor's own speed)
    const arrive = await frames(4000);
    const painted = town ? 0 : await painterDone(900);
    const r = { arrive: { worst: arrive.worst, over50: arrive.over50 }, painted };
    // the bot playing the place (after a few seconds of it, so that what the place shows has been painted once)
    await page.evaluate(() => { window.__dbg.bot(true); });
    await page.waitForTimeout(5000);
    await slow(throttle);
    r.play = await measure(`${place} play`, secs * 1000);
    await slow(1);
    await snap(`${place}_play`);
    // before its boss, fighting him
    const boss = town ? null : await page.evaluate(() => {
      const g = window.__dbg.game();
      const b = g.monsters.find((m) => m.boss && !m.dead);
      if (!b) return null;
      const st = g.level.floor.start; const sx = st.x - b.x; const sy = st.y - b.y; const k = Math.hypot(sx, sy) || 1;
      g.hero.x = b.x + (sx / k) * 3.5; g.hero.y = b.y + (sy / k) * 3.5;
      return b.kind;
    });
    if (boss) {
      await page.waitForTimeout(2500);
      await slow(throttle);
      r.boss = { kind: boss, ...(await measure(`${place} boss`, secs * 1000)) };
      await slow(1);
      await snap(`${place}_boss`);
      if (boss === 'eye') {
        await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss && !m.dead); if (b) b.life = Math.round(b.maxLife * 0.45); });
        await page.waitForTimeout(6000);
        await slow(throttle);
        r.risen = await frames(secs * 1000);
        await slow(1);
        await snap(`${place}_risen`);
      }
    }
    r.ground = await page.evaluate(() => { const st = window.__dbg.renderer.outdoor.stats; return { pieces: st.pieces, byWorker: st.worker }; });
    r.heroFrames = await page.evaluate(() => window.__dbg.painter.heroFrames);
    r.canvasMB = (await page.evaluate(() => (window.__canvasRoom ? window.__canvasRoom().mb : -1)));
    r.pageMB = room();
    out[place] = r;
    log(`report ${place}`, JSON.stringify(r));
  }
  await page.evaluate(() => window.__dbg.bot(false));
  log('throttle', String(throttle));
}
