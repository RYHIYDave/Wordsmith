// THE KING'S CROWN'S WEIGHT, close, for the owner (his word, 31 Oct 2026, 12:27: “Let’s do a little better on the crown
// animation”): the King sends it up three times; the hero walks off under it the first, stands still the second, and runs out
// from under it the third. A picture every thirtieth of a second (python3 film_cut.py <dir> <out.mp4>).
//   node tools/playtest.mjs --file dist/floor19.html --size 1280x720 --scenario tools/scenarios/high19_crown.mjs --out shots/crown/k
const FPS = 30;
const PARTS = [
  [0, 'THE CROWN\'S WEIGHT', 'He sends his crown up off his head; it hangs over you and follows you.'],
  [3.2, 'THE DROP', 'It stops, rises and trembles, then slams down where you stand.'],
  [6, 'AGAIN, STANDING STILL', 'Under it when it drops: struck hard.'],
  [12, 'AGAIN, RUNNING', 'It follows slower than you run: keep moving and it misses.'],
];
export default async function (page, snap) {
  const seconds = 18;
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 7); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true; d.floorNames(false); d.calls(true);
    d.high(true, 19);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.monsters.find((q) => q.kind === 'gking');
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.bossReady(); g.bossMet = true; g.boss = m;
    m.life = m.maxLife = 1e7; m.words = []; m.state = 'chase'; m.moveCd = [99, 99, 0, 99, 99]; m.cd = 0;
    h.x = m.x + 0.5; h.y = m.y + 6;
    g.level.explored.fill(1);
    d.bot(false);
    window.__k = m;
  });
  snap.note('film', { fps: FPS, from: 0, parts: PARTS, size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  for (let i = 0; i < seconds * FPS; i++) {
    const s = i / FPS;
    await page.evaluate(([slow, s]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const m = window.__k;
      // (only his crown: his other blows put off, and the crown's ready at 0, 6 and 12 s)
      if (m && !m.dead) {
        m.moveCd = m.moveCd ?? [0, 0, 0, 0, 0];
        for (let k = 0; k < m.moveCd.length; k++) if (k !== 2) m.moveCd[k] = 99;
        if ([0.1, 6, 12].some((t) => Math.abs(s - t) < 0.02)) { m.moveCd[2] = 0; m.cd = 0; m.x = m.x; }
        if (m.act && m.act.id !== 'gking:weight') m.act = undefined;
      }
      // (the hero keeps about 6 tiles before where the King stood)
      window.__base = window.__base ?? { x: m.x + 0.5, y: m.y + 6 };
      const base = window.__base;
      const local = s % 6;
      if (s < 6) { const k = Math.min(1, local / 3); h.x = base.x + 2.2 * Math.sin(k * Math.PI); h.y = base.y; }
      else if (s < 12) { h.x = base.x; h.y = base.y; }
      else { const a = (local * 4.6) / 3; const nx = base.x + 3 * Math.sin(a); const ny = base.y - 3 + 3 * Math.cos(a); if (g.isOpen(nx, ny)) { h.x = nx; h.y = ny; } }
      const dx = m.x - h.x; const dy = m.y - h.y; const l = Math.hypot(dx, dy) || 1; h.fx = dx / l; h.fy = dy / l;
      d.slowmo = slow;
    }, [slow, s]);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + s, { polling: 'raf', timeout: 120000 });
    await snap(`f${String(i).padStart(4, '0')}`);
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; });
}
