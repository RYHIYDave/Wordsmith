// A DUNGEON'S FRAMES OVER ITS FIRST MINUTE: a hero brought into a dungeon of the first five floors (DEPTH, 2) with all
// of it revealed, standing where a pack is in sight (as dungeon.mjs stands him), and every STEP seconds for SECS a frame's
// median and worst over 60 frames, with what the painter has handed over by then. For A/B of one version against another.
//   node tools/playtest.mjs --file <page> --scenario tools/scenarios/dungeon_frames.mjs --out shots/df
import { log } from './lib.mjs';

export default async function (page) {
  const depth = Number(process.env.DEPTH || 2);
  const secs = Number(process.env.SECS || 60);
  const step = Number(process.env.STEP || 5);
  await page.evaluate((n) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 7); if (d.seasoned) d.seasoned(10); d.autoLevel = false; d.god = true;
    const g = d.game(); g.depth = n; g.cleared = n - 1; g.enterDungeon(); g.level.explored.fill(1);
  }, depth);
  await page.waitForTimeout(300);
  const at = await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
    let best = null;
    for (const m of g.monsters) if (!m.boss && !m.dead && (!best || m.elite)) best = m;
    if (!best) return null;
    for (const m of g.monsters) if (m.state !== 'sleep') m.state = 'sleep';
    for (let r = 4; r <= 7; r++) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (L.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return { kind: best.kind, r }; }
    }
    return null;
  });
  log('standing by', JSON.stringify(at));
  const t0 = Date.now();
  while (Date.now() - t0 < secs * 1000) {
    const r = await page.evaluate(() => new Promise((done) => {
      const times = []; let last = performance.now(); let n = 0;
      const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 60) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); const d = window.__dbg; const p = d.painter; done({ median: Math.round(times[30] * 10) / 10, worst: Math.round(times[59] * 10) / 10, mob: p && p.stats ? p.stats.frames : -1, side: p && p.sideFrames !== undefined ? p.sideFrames : -1, hero: p && p.heroFrames !== undefined ? p.heroFrames : -1, main: d.painting.frames }); } };
      requestAnimationFrame(tick);
    }));
    log(`at ${Math.round((Date.now() - t0) / 1000)} s`, JSON.stringify(r));
    await page.waitForTimeout(Math.max(0, step * 1000 - 1000));
  }
}
