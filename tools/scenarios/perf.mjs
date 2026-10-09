// Rough frame-rate check: counts frames while the bot fights, with many ground effects out.
export default async function (page, snap) {
  // (THE FIRST LEVELS, the game's own since Version 19.5: a hero some way in, the ring lit and every move and slot open)
  await page.evaluate(() => { const d = window.__dbg; d.run('mage', 11); d.seasoned(10); d.god = true; d.speed = 8; d.bot(true); });
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; h.words.fire = 2; h.words.twin = 2; g.socket(0, 'behind', 'fire'); g.socket(0, 'front', 'twin'); g.socket(1, 'behind', 'fire'); });
  for (let i = 0; i < 100; i++) { await page.waitForTimeout(100); const ok = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return !g.level.town && g.monsters.filter((m) => !m.dead && m.state !== 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) < 7).length >= 2; }); if (ok) break; }
  await page.evaluate(() => { window.__dbg.speed = 1; });
  const r = await page.evaluate(() => new Promise((res) => {
    let n = 0; let worst = 0; let last = performance.now(); const t0 = last; let zones = 0;
    const tick = (now) => { n++; worst = Math.max(worst, now - last); last = now; zones = Math.max(zones, window.__dbg.game().zones.length);
      if (now - t0 < 6000) requestAnimationFrame(tick); else res({ fps: +(n / ((now - t0) / 1000)).toFixed(1), worstMs: +worst.toFixed(1), zones, view: `${window.__dbg.screen.w}x${window.__dbg.screen.h}` }); };
    requestAnimationFrame(tick);
  }));
  console.log('frame rate', JSON.stringify(r));
  await snap('perf');
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
