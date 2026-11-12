// WHAT THE GAME KEEPS FROM FLOOR TO FLOOR: a hero plays floor after floor in one sitting (a bot, at speed), and at each floor,
// as it is come into and again after play, what the page holds is written down (tools/mem_probe.js) with what a frame costs.
// Made 11 Nov 2026 for his “lag and freezing issues after playing a few levels”. Compare a long sitting with each floor alone:
//   node tools/playtest.mjs --file <page> --serve --touch --size 844x390 --dpr 3 --init tools/mem_probe.js --scenario tools/scenarios/mem_floors.mjs
//   FROM=1 TO=10 PLAY=40 SPEED=6        the long sitting (PLAY: seconds of the bot's play a floor, SPEED: game steps a frame)
//   FROM=8 TO=8 PLAY=0 SKIPTOWN=1       floor 8 alone, in a page of its own
//   OUT=shots/mem_floors.json           every row, with who made the canvases still held (name them: a readable build)
//   CENSUS=1                            the game's own lists counted too (it touches lazy lists, which paints them: off by default)
//   PROFILE=8,10                        a CPU profile of five seconds as those floors are come into (<OUT>_prof<k>.json)
//   PACKS=0                             a hero whose moves are kept packed (render/baked.ts PACKS) holds them all, none let go
//   BUDGET=40                           the packs' budget, MB (the game's own if not given)
// The page must be served with the heroes', sounds' and Colossus's files beside it (dist/, after tools/build.mjs).
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const env = (k, d) => (process.env[k] === undefined ? d : process.env[k]);
const FROM = Number(env('FROM', 1)); const TO = Number(env('TO', 6)); const PLAY = Number(env('PLAY', 40)); const SPEED = Number(env('SPEED', 6));
const CLS = env('CLS', 'warrior'); const OUT = path.resolve(env('OUT', 'shots/mem_floors.json')); const TOWN = env('TOWN', '0') === '1';
const rss = () => {
  const rows = execSync('ps -eo rss,args').toString().split('\n').filter((l) => /chrom|headless_shell/i.test(l));
  const by = { renderer: 0, gpu: 0, other: 0 };
  for (const l of rows) { const kb = Number(l.trim().split(/\s+/)[0]) || 0; const t = /--type=renderer/.test(l) ? 'renderer' : /--type=gpu/.test(l) ? 'gpu' : 'other'; by[t] += kb; }
  return { rendererMB: Math.round(by.renderer / 1024), gpuMB: Math.round(by.gpu / 1024), otherMB: Math.round(by.other / 1024) };
};
export default async function (page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.enable');
  const gc = async () => { for (let i = 0; i < 3; i++) { await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(150); } };
  const rows = [];
  const measure = async (label, extra = {}) => {
    await gc();
    const heap = await cdp.send('Runtime.getHeapUsage');
    const dom = await cdp.send('Memory.getDOMCounters').catch(() => ({}));
    const c = await page.evaluate(() => ({ counts: window.__probe.counts(), lis: window.__probe.listeners(), who: window.__probe.who(80), workers: window.__probe.workers ? window.__probe.workers() : null, churn: window.__probe.churn ? window.__probe.churn() : null }));
    const census = process.env.CENSUS === '1' ? await page.evaluate(() => { const d = window.__dbg; return window.__probe.census({ game: d.game(), dbg: d }); }) : null;
    const g = await page.evaluate(() => { const g = window.__dbg.game(); return g ? { depth: g.depth, cleared: g.cleared, town: !!g.level.town, monsters: g.monsters.length, alive: g.monsters.filter((m) => !m.dead).length, time: +(g.time ?? 0).toFixed?.(0) } : null; });
    const sounds = await page.evaluate(() => { try { return window.__dbg.sounds(); } catch (e) { return String(e); } });
    // (A HERO'S MOVES KEPT PACKED, render/baked.ts PACKS: how many packs are in hand and their bytes, how many came and went)
    const packs = await page.evaluate(() => { const b = window.__dbg.baked && window.__dbg.baked(); return b && b.packs && b.packs.all ? b.packs : null; });
    if (packs) console.log(`   packs: ${packs.held} of ${packs.all} in hand, ${(packs.bytes / 1048576).toFixed(1)} MB (the most ${(packs.most / 1048576).toFixed(1)}) | unpacked ${packs.unpacked}, let go ${packs.letGo} | asked for with nothing to show ${packs.missed}, ahead ${packs.ahead} | unpacking ${Math.round(packs.ms)} ms in all, ${Math.round(packs.worst)} at worst | of it on the game's own thread ${Math.round(packs.work)} ms in all, ${packs.workWorst.toFixed(1)} at worst in one go | their files ${(packs.packed / 1048576).toFixed(2)} MB kept`);
    if (g && !g.town && /^floor \d+/.test(label) && g.depth !== Number(label.split(' ')[1])) console.log(`   (the bot has gone down by itself: now on floor ${g.depth})`);
    const row = { label, ...extra, g, packs, heapMB: +(heap.usedSize / 1048576).toFixed(1), heapTotalMB: +(heap.totalSize / 1048576).toFixed(1), dom, rss: rss(), ...c, sounds, census };
    rows.push(row);
    const k = c.counts;
    if (c.churn) console.log(`   churn: canvases given ${c.churn.allocMB}MB in all | given back by hand ${c.churn.byHandMB}MB | left to the collector ${c.churn.leftToCollectorMB}MB (${c.churn.leftN})`);
    console.log(`[${label}] heap ${row.heapMB}MB | canvas ${k.canvas.n} ${k.canvas.mb}MB | bitmap ${k.bitmap.n} ${k.bitmap.mb}MB | img ${k.image.n} ${k.image.mb}MB | audioBuf ${k.audioBuf.n} ${k.audioBuf.mb}MB | nodes alive ${k.audioNodes.alive} playing ${k.audioNodes.playing} con ${k.audioNodes.connects}/${k.audioNodes.disconnects} | timers ${k.timers.intervals}/${k.timers.timeoutsPending} | rss r${row.rss.rendererMB} g${row.rss.gpuMB} | lis ${dom.jsEventListeners} nodes ${dom.nodes}` + (extra.idle ? ` | idle work p50 ${extra.idle.workP50} mean ${extra.idle.workMean} p95 ${extra.idle.workP95}` : '') + (extra.play ? ` | play work p50 ${extra.play.workP50} mean ${extra.play.workMean} p95 ${extra.play.workP95} max ${extra.play.workMax} >50ms ${extra.play.over50} >200ms ${extra.play.over200} n ${extra.play.n}` : ''));
    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(rows));
  };
  const frames = async (ms) => { await page.evaluate(() => window.__probe.framesReset()); await page.waitForTimeout(ms); return page.evaluate(() => window.__probe.frames()); };
  const settle = async () => { for (let i = 0; i < 400; i++) { const l = await page.evaluate(() => window.__dbg.loadingNow()); if (!l) break; await page.waitForTimeout(50); } };

  // (the packs' switch and budget, set before the hero is first taken in)
  await page.evaluate(([off, mb]) => { const P = window.__dbg.packs && window.__dbg.packs.PACKS; if (!P) return; if (off) P.on = false; if (mb) P.budget = mb * 1048576; }, [process.env.PACKS === '0', Number(process.env.BUDGET || 0)]);
  await page.evaluate((cls) => { const d = window.__dbg; d.saving(false); d.run(cls, 5); d.autoLevel = false; d.autoWords = false; }, CLS);
  await page.waitForTimeout(1500);
  // (a tap, so that the sound starts as it does under a thumb)
  if (process.env.SOUND !== '0') { await page.touchscreen.tap(700, 60).catch(() => page.mouse.click(700, 60)); await page.waitForTimeout(300); await page.touchscreen.tap(700, 60).catch(() => {}); }
  await page.evaluate(() => { const d = window.__dbg; d.seasoned(10); d.god = true; d.loadedHere(); });
  await page.waitForTimeout(3000);
  if (process.env.SKIPTOWN !== '1') await measure('town');
  for (let k = FROM; k <= TO; k++) {
    const t0 = Date.now();
    // (each floor come into by its number: the bot, strong as it is, clears a floor now and then and goes down by itself, and a
    // floor come into by "one more" would then be one further than its row says: so it was on 11 Nov 2026, rows 2 to 10 a floor out)
    await page.evaluate((k) => { const d = window.__dbg; d.bot(false); d.speed = 1; const g = d.game(); g.depth = k; g.cleared = k - 1; g.enterDungeon(); }, k);
    await page.waitForTimeout(300);
    await settle();
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(4000); // (the painter's first pictures)
    const idle = await frames(5000);
    if ((process.env.PROFILE || '').split(',').includes(String(k))) {
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
      await cdp.send('Profiler.start');
      const fr = await frames(5000);
      const { profile } = await cdp.send('Profiler.stop');
      writeFileSync(OUT.replace(/\.json$/, `_prof${k}.json`), JSON.stringify({ frames: fr, profile }));
      console.log(`   profiled floor ${k} start: ${fr.n} frames, work p50 ${fr.workP50} mean ${fr.workMean}`);
    }
    await measure(`floor ${k} start`, { loadMs, idle });
    if (PLAY > 0) {
      await page.evaluate((s) => { const d = window.__dbg; d.bot(true); d.speed = s; }, SPEED);
      const play = await frames(PLAY * 1000);
      await page.evaluate(() => { const d = window.__dbg; d.speed = 1; });
      const play1 = await frames(6000);
      await page.evaluate(() => { const d = window.__dbg; d.bot(false); });
      await page.waitForTimeout(1500);
      const idleAfter = await frames(4000);
      await measure(`floor ${k} played`, { play, play1, idle: idleAfter });
    }
    if (TOWN) {
      await page.evaluate(() => { const g = window.__dbg.game(); g.enterTown(null); });
      await page.waitForTimeout(300); await settle(); await page.waitForTimeout(3000);
      await measure(`town after ${k}`);
    }
  }
  console.log('errors', await page.evaluate(() => (window.__errors || []).length));
}
