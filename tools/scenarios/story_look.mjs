// THE PRISON'S STORIES in the game (game/stories.ts, STORIES): a still of each room of the way, in order from where he comes in
// to the last before the boss's hall, the hero at its foot. DEPTH (1 to 4), SEED; STORIES=0 for the same rooms without the story.
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 7919);
  const on = process.env.STORIES !== '0';
  const only = (process.env.ROOMS || '').split(',').filter(Boolean).map(Number);
  await page.evaluate(({ seed, on }) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.stories.on = on; if (d.lairStory) d.lairStory.on = on; d.run('warrior', seed); d.seasoned(5); d.autoLevel = false; d.autoWords = false; d.god = true; }, { seed, on });
  await page.evaluate((dep) => { window.__dbg.high(false, dep); }, Number(process.env.DEPTH || 1));
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const g = window.__dbg.game();
    const f = g.level.floor;
    const way = f.rooms.filter((r) => r.path > 0 && r.kind !== 'boss' && r.kind !== 'start' && !r.cell).sort((a, b) => a.path - b.path).map((r) => r.id);
    return { depth: g.depth, story: g.level.dress && g.level.dress.story, way };
  });
  console.log(JSON.stringify(info).slice(0, 1200));
  await page.evaluate(() => { const g = window.__dbg.game(); g.level.explored.fill(1); for (const m of g.monsters) m.dead = true; g.monsters = []; g.waveT = 1e9; window.__dbg.bot(false); });
  // (FIND: a still of the first of a piece laid, the hero a little before it: the threads' own new pieces, close)
  if (process.env.FIND) {
    for (const name of process.env.FIND.split('|')) {
      const at = await page.evaluate((name) => {
        const g = window.__dbg.game();
        const L = g.level;
        const f = L.floor;
        // (name#n: the n-th laid, from 1)
        const [nm, nth] = name.split('#');
        const at = Number(nth || 1) - 1;
        const w = L.dress.wall.filter((q) => q.name === nm)[at];
        const p = w ? null : L.props.filter((q) => q.name === nm)[at];
        if (!w && !p) return null;
        const x = w ? (w.i % f.w) + (w.side === 1 ? 1 : 0) + 0.5 : p.x;
        const y = w ? Math.floor(w.i / f.w) + (w.side === 0 ? 1 : 0) + 0.5 : p.y;
        let best = null;
        for (let ty = Math.floor(y) - 4; ty <= y + 4; ty++) for (let tx = Math.floor(x) - 4; tx <= x + 4; tx++) {
          if (!g.isOpen(tx + 0.5, ty + 0.5)) continue;
          const d = Math.hypot(tx + 0.5 - (x + 1.6), ty + 0.5 - (y + 1.6));
          if (!best || d < best[2]) best = [tx + 0.5, ty + 0.5, d];
        }
        if (best) { g.hero.x = best[0]; g.hero.y = best[1]; }
        g.hero.fx = -0.7; g.hero.fy = -0.7;
        return { x, y, up: g.hero.x + g.hero.y - (x + y) };
      }, name);
      console.log('FOUND ' + name + ' ' + JSON.stringify(at));
      if (!at) continue;
      await page.waitForTimeout(1500);
      await snap('find_' + name.replace(/[^a-z]+/gi, '_'));
    }
    return;
  }
  const named = new Map((info.story || []).map((s) => [s.room, s.name]));
  let k = 0;
  for (const id of info.way) {
    k++;
    if (only.length && !only.includes(k)) continue;
    // (the hero a step before the middle of the room's own pieces, so that they stand just up and to the left of him on the screen)
    await page.evaluate((id) => {
      const g = window.__dbg.game();
      const L = g.level;
      const f = L.floor;
      const r = f.rooms.find((q) => q.id === id);
      const inR = (x, y) => x >= r.x - 1 && x <= r.x + r.w && y >= r.y - 1 && y <= r.y + r.h;
      const pts = [];
      for (const p of L.props) if (p.kind === 'piece' && inR(p.tx, p.ty)) pts.push([p.x, p.y]);
      for (const t of L.dress.tiles) { const x = t.i % f.w; const y = (t.i - x) / f.w; if (inR(x, y)) pts.push([x + 0.5, y + 0.5]); }
      for (const w of L.dress.wall) { const x = w.i % f.w; const y = (w.i - x) / f.w; if (inR(x, y)) pts.push(w.side === 0 ? [x + 0.5, y + 1] : [x + 1, y + 0.5]); }
      // (what stands and lies there first: the scene's own things are what read; what is on its walls and its floor else)
      const things = L.props.filter((p) => p.kind === 'piece' && p.name !== 'yard foot' && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h).map((p) => [p.x, p.y]);
      const main = things.length ? things : pts;
      const cx = main.length ? main.reduce((a, q) => a + q[0], 0) / main.length : r.x + r.w / 2;
      const cy = main.length ? main.reduce((a, q) => a + q[1], 0) / main.length : r.y + r.h / 2;
      const h = g.hero;
      // (just below the scene's lowest piece on the screen, under its middle, in his own light; the nearest open place to it)
      const low = main.length ? Math.max(...main.map((q) => q[0] + q[1])) : cx + cy;
      const sum = low + 1.2;
      const dif = cx - cy;
      const want = [(sum + dif) / 2, (sum - dif) / 2];
      let best = null;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
        if (!g.isOpen(x + 0.5, y + 0.5)) continue;
        const d = Math.hypot(x + 0.5 - want[0], y + 0.5 - want[1]);
        if (!best || d < best[2]) best = [x + 0.5, y + 0.5, d];
      }
      h.x = best ? best[0] : r.x + r.w / 2;
      h.y = best ? best[1] : r.y + r.h / 2;
      h.fx = -0.7; h.fy = -0.7;
      window.__storyAt = [cx, cy];
      const names = [];
      for (const p of L.props) if (p.kind === 'piece' && inR(p.tx, p.ty)) names.push(`${p.name}@${p.tx},${p.ty}`);
      for (const w of L.dress.wall) { const x = w.i % f.w; const y = (w.i - x) / f.w; if (inR(x, y) || inR(x + 1, y + 1)) names.push(`[${w.name}]@${x},${y}`); }
      for (const t of L.dress.tiles) { const x = t.i % f.w; const y = (t.i - x) / f.w; if (inR(x, y)) names.push(`_${t.name}_@${x},${y}`); }
      return { room: [r.x, r.y, r.w, r.h], hero: [h.x, h.y], up: h.x + h.y - (cx + cy), names };
    }, id).then((o) => console.log('ROOM ' + String(k).padStart(2, '0') + ' ' + JSON.stringify(o)));
    await page.waitForTimeout(1500);
    await snap(`${String(k).padStart(2, '0')}_${(named.get(id) || 'nothing').replace(/[^a-z]+/gi, '_')}`);
  }
}
