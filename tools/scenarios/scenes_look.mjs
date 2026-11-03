// FLOOR 1's SCENES in the game: a still of each room laid as a scene (SCENES), the hero at its foot
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 7919);
  await page.evaluate((seed) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', seed); d.seasoned(5); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  await page.evaluate((dep) => { window.__dbg.high(false, dep); }, Number(process.env.DEPTH || 1));
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: !!g.level.town, scenes: g.level.dress && g.level.dress.scenes }; });
  console.log(JSON.stringify(info).slice(0, 400));
  if (!info.scenes) return;
  await page.evaluate(() => { const g = window.__dbg.game(); g.level.explored.fill(1); for (const m of g.monsters) m.dead = true; g.monsters = []; g.waveT = 1e9; window.__dbg.bot(false); });
  const seen = new Set();
  for (const s of info.scenes) {
    if (seen.has(s.name)) continue;
    seen.add(s.name);
    // (the hero a step before the middle of the scene's own pieces, so that they stand just up and to the left of him on the screen)
    await page.evaluate((id) => {
      const g = window.__dbg.game();
      const L = g.level;
      const f = L.floor;
      const r = f.rooms.find((q) => q.id === id);
      const inR = (x, y) => x >= r.x - 1 && x <= r.x + r.w && y >= r.y - 1 && y <= r.y + r.h;
      const pts = [];
      for (const p of L.props) if (p.kind === 'piece' && inR(p.tx, p.ty)) pts.push([p.x, p.y]);
      for (const w of L.dress.wall) { const x = w.i % f.w; const y = (w.i - x) / f.w; if (inR(x, y)) pts.push(w.side === 0 ? [x + 0.5, y + 1] : [x + 1, y + 0.5]); }
      const cx = pts.length ? pts.reduce((a, q) => a + q[0], 0) / pts.length : r.x + r.w / 2;
      const cy = pts.length ? pts.reduce((a, q) => a + q[1], 0) / pts.length : r.y + r.h / 2;
      const h = g.hero;
      h.x = Math.min(r.x + r.w - 0.6, cx + 2.6);
      h.y = Math.min(r.y + r.h - 0.6, cy + 2.6);
      if (!g.isOpen(h.x, h.y)) { h.x = r.x + r.w / 2 + 1.5; h.y = r.y + r.h / 2 + 1.5; }
      h.fx = -0.7; h.fy = -0.7;
    }, s.room);
    await page.waitForTimeout(1600);
    await snap(s.name.replace(/[^a-z]+/gi, '_'));
  }
}
