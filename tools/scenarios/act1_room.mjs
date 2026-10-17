// ACT 1, THE DESCENT: WHAT ROOM THE PAGE TAKES, floor by floor, in one run as a player would go (for a phone's limits).
//   node tools/build_to.mjs dist/act1.html
//   FLOORS=4,6,7,8,9,10 node tools/playtest.mjs --file dist/act1.html --touch --size 844x390 --dpr 2 --init tools/canvas_room.js --scenario tools/scenarios/act1_room.mjs --out shots/room/run
// On each floor the hero is set before its boss, and the painter left to paint everything heavy (SECS at most, 1200).
// Then, after the garbage is taken out: the canvases alive and their room (tools/canvas_room.js; what an iPhone's
// Safari limits), the heavy figures' frames as held (ImageBitmaps from the painter, canvases painted by the game),
// and what the operating system says the page and picture processes hold. Last, back in town: what was given back.
import { execSync } from 'node:child_process';
import { log } from './lib.mjs';

function room() {
  try {
    const out = execSync('ps -eo rss,args', { encoding: 'utf8' });
    let page = 0; let gpu = 0;
    for (const line of out.split('\n')) {
      const m = /^\s*(\d+)\s+(.*)$/.exec(line);
      if (!m) continue;
      if (/--type=renderer/.test(m[2])) page += Number(m[1]);
      else if (/--type=gpu-process/.test(m[2])) gpu += Number(m[1]);
    }
    return { page: Math.round(page / 1024), gpu: Math.round(gpu / 1024) };
  } catch { return null; }
}

export default async function (page, snap) {
  const floors = (process.env.FLOORS || '6,7,8,9,10').split(',').map(Number);
  const secs = Number(process.env.SECS || 1200);
  const cdp = await page.context().newCDPSession(page);
  const measure = async (label) => {
    await cdp.send('HeapProfiler.collectGarbage');
    await page.waitForTimeout(1500);
    await cdp.send('HeapProfiler.collectGarbage');
    const inPage = await page.evaluate(() => {
      const b = window.__dbg.renderer.art.bestiary;
      const g = window.__dbg.game();
      const kinds = [...new Set(g.monsters.map((m) => m.figure || m.kind))];
      const heavy = {};
      for (const f of ['headsman', 'chained', 'chained1', 'chained2', 'amalgam', 'fleshmancer', 'unfinished', 'queen', 'cantor', 'stag', 'eye', ...kinds]) {
        let art;
        try { art = b.of(f); } catch { continue; }
        let n = 0; let bm = 0; let cv = 0; let lazy = 0;
        const seen = new Set();
        for (const set of [art.front, art.back]) {
          if (!set) continue;
          const lists = [set.idle, set.walk];
          const c = set.clips || {};
          for (const k of ['attack', 'heavy', 'die', 'reel']) if (c[k]) lists.push(c[k].frames);
          for (const m of Object.values(c.moves || {})) lists.push(m.frames);
          for (const list of lists) {
            if (!list) continue;
            for (let i = 0; i < list.length; i++) {
              const d = Object.getOwnPropertyDescriptor(list, i);
              if (!d || !('value' in d) || !d.value) { lazy++; continue; }
              if (seen.has(d.value)) continue;
              seen.add(d.value);
              n++;
              const px = d.value.img.width * d.value.img.height * 4 / 1048576;
              if (typeof d.value.img.close === 'function') bm += px; else cv += px;
            }
          }
        }
        if (n) heavy[f] = { n, lazy, bitmapMB: +bm.toFixed(1), canvasMB: +cv.toFixed(1) };
      }
      return { where: g.level.town ? 'town' : 'depth ' + g.depth, canvas: window.__canvasRoom(), figures: heavy, painter: { state: window.__dbg.painter.state, ...window.__dbg.painter.stats } };
    });
    log('room ' + label, JSON.stringify({ ...inPage, os: room() }));
  };
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(3000);
  await measure('start');
  for (const depth of floors) {
    await page.evaluate((n) => {
      const g = window.__dbg.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      g.level.explored.fill(1);
      const boss = g.monsters.find((m) => m.boss);
      if (boss) {
        const L = g.level;
        const st = L.floor ? L.floor.start : { x: g.hero.x, y: g.hero.y };
        const sx = st.x - boss.x, sy = st.y - boss.y;
        const k = Math.hypot(sx, sy) || 1;
        g.hero.x = boss.x + (sx / k) * 4.5; g.hero.y = boss.y + (sy / k) * 4.5;
      }
    }, depth);
    const t0 = Date.now();
    let quiet = 0; let last = -1;
    while (Date.now() - t0 < secs * 1000) {
      await page.waitForTimeout(5000);
      const st = await page.evaluate(() => {
        const d = window.__dbg; const p = d.painter;
        return { given: p.stats.frames, busy: p.busy(), main: d.painting.frames, films: p.stats.films };
      });
      const now = st.given + st.main;
      quiet = now === last && !st.busy ? quiet + 1 : 0;
      last = now;
      if (quiet >= 2) break;
    }
    log('painted', JSON.stringify({ depth, secs: Math.round((Date.now() - t0) / 1000) }));
    await snap(`floor${depth}`);
    await measure('floor ' + depth);
  }
  await page.evaluate(() => { window.__dbg.game().enterTown(); });
  await page.waitForTimeout(4000);
  await measure('town after');
}
