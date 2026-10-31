// THE KING (floor 19's boss, behind HIGH_CITY, on here alone), in his own hall, the Throne Hall: the hero a few tiles off him,
// nothing can kill him, the hero keeping round him at a little over four tiles; his life brought to his second phase at 18 s and below a third (the Hush climbs
// off) at 34 s; he falls at 52 s. Stills every half second (STILLS=0: every thirtieth of the game's second, for a film).
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high19_king.mjs --out shots/h19k/k
const FPS = 30;
const PARTS = [
  [0, 'THE KING', 'Slow and heavy: his charge and its line of sparks, the Decree, the crown\'s weight, the Curtains.'],
  [18, 'HIS SECOND PHASE', 'His waits shorter.'],
  [34, 'THE HUSH CLIMBS OFF', 'Then it fights beside him: it grabs you and drags you to him, shields him, breathes grey fog.'],
  [52, 'HE FALLS', 'The Hush unwinds; his clockwork songbird winds itself up and sings.'],
];
export default async function (page, snap) {
  const stills = process.env.STILLS !== '0';
  const seconds = Number(process.env.SECONDS || 60);
  const process_calls = process.env.CALLS !== '0';
  await page.evaluate((process_calls) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 7); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true; d.floorNames(false); if (process_calls) d.calls(true);
    d.high(true, 19);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
  }, process_calls);
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.monsters.find((q) => q.kind === 'gking');
    if (!m) return { boss: g.boss?.kind ?? null };
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.projectiles.length = 0;
    h.x = m.x + 1; h.y = m.y + 5;
    m.state = 'chase'; m.cd = 0.5;
    m.life = m.maxLife = 1e7; m.words = []; m.shield = 0;
    g.boss = m; g.bossMet = true;
    g.level.explored.fill(1);
    // (the hero keeps round him, out of his blows' way where he can, striking at nothing: his moves seen clear, not flashing white under blows)
    d.bot(false);
    return { boss: m.kind, at: [m.x.toFixed(1), m.y.toFixed(1)] };
  });
  console.log('  boss', JSON.stringify(info));
  snap.note('film', { fps: FPS, from: 0, parts: PARTS, size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    const s = i / FPS;
    if (i === 18 * FPS) await page.evaluate(() => { const m = window.__dbg.game().monsters.find((q) => q.kind === 'gking'); if (m) m.life = m.maxLife * 0.6; });
    if (i === 34 * FPS) await page.evaluate(() => { const m = window.__dbg.game().monsters.find((q) => q.kind === 'gking'); if (m) m.life = m.maxLife * 0.3; });
    if (i === 52 * FPS) await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'gking'); if (m) g.kill(m); });
    // (a moment after he falls, the hero beside his songbird before the throne, to see it wind itself up and sing)
    if (i === 52 * FPS + 20) await page.evaluate(() => { const g = window.__dbg.game(); const b = g.perils.find((p) => p.a1 === 'gking:bird'); if (b) { g.hero.x = b.x - 1.6; g.hero.y = b.y + 1.6; } });
    await page.evaluate(([slow, s]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const m = g.monsters.find((q) => q.kind === 'gking' && !q.dead);
      // (held by the Hush's arms, he goes where he is dragged; after, he takes up his way round the King from where he is)
      if (m && (h.held ?? 0) > 0) { window.__ang = Math.atan2(h.y - m.y, h.x - m.x) - s * 0.35; }
      else if (m) {
        const a = (window.__ang ?? 1.2) + s * 0.35;
        const x = m.x + Math.cos(a) * 4.6;
        const y = m.y + Math.sin(a) * 4.6;
        if (g.isOpen(x, y)) { h.x = x; h.y = y; }
        const dx = m.x - h.x; const dy = m.y - h.y; const l = Math.hypot(dx, dy) || 1;
        h.fx = dx / l; h.fy = dy / l;
      }
      d.slowmo = slow;
    }, [slow, s]);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + s, { polling: 'raf', timeout: 120000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 60 === 0) console.log(`  ${s.toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'gking'); const per = {}; for (const p of g.perils) per[p.a1 ?? p.kind] = (per[p.a1 ?? p.kind] ?? 0) + 1; return `${m ? (m.dead ? 'dead' : (m.act ? m.act.id : m.state + ':' + m.anim)) : 'gone'} perils ${JSON.stringify(per)}`; }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
