// THE PRINCE (floor 17's boss, behind HIGH_CITY, on here alone), on his own floor, the Black Room: the hero five tiles off him,
// nothing can kill him, the bot fighting for him; his life brought to his second phase at 16 s and his third at 30 s; he falls at
// 44 s. Stills every half second (STILLS=0: every thirtieth of the game's second, for a film: tools/princess_film.py).
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high17_prince.mjs --out shots/h17p/p
const FPS = 30;
const PARTS = [
  [0, 'THE PRINCE', 'Fast and never still: he darts round you between his blows.'],
  [16, 'HIS SECOND PHASE', 'Shorter waits; the clock strikes faster.'],
  [30, 'HIS THIRD PHASE', 'Faster still: a chime every half second.'],
  [44, 'HE FALLS', 'His mask cracks; under it, only the Hush.'],
];
export default async function (page, snap) {
  const stills = process.env.STILLS !== '0';
  const seconds = Number(process.env.SECONDS || 50);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 7); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 17);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
  });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.monsters.find((q) => q.kind === 'prince');
    if (!m) return { boss: g.boss?.kind ?? null };
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.projectiles.length = 0;
    h.x = m.x - 4; h.y = m.y + 2;
    m.state = 'chase'; m.cd = 0.5;
    m.life = m.maxLife = 1e7; m.words = []; m.shield = 0;
    g.boss = m; g.bossMet = true;
    g.level.explored.fill(1);
    d.bot(true);
    return { boss: m.kind, at: [m.x.toFixed(1), m.y.toFixed(1)] };
  });
  console.log('  boss', JSON.stringify(info));
  snap.note('film', { fps: FPS, from: 0, parts: PARTS, size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    const s = i / FPS;
    if (i === 16 * FPS) await page.evaluate(() => { const m = window.__dbg.game().monsters.find((q) => q.kind === 'prince'); if (m) m.life = m.maxLife * 0.6; });
    if (i === 30 * FPS) await page.evaluate(() => { const m = window.__dbg.game().monsters.find((q) => q.kind === 'prince'); if (m) m.life = m.maxLife * 0.3; });
    if (i === 44 * FPS) await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'prince'); if (m) g.kill(m); });
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + s, { polling: 'raf', timeout: 120000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 60 === 0) console.log(`  ${s.toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'prince'); const per = {}; for (const p of g.perils) per[p.a1 ?? p.kind] = (per[p.a1 ?? p.kind] ?? 0) + 1; return `${m ? (m.dead ? 'dead' : (m.act ? m.act.id : m.state + ':' + m.anim)) : 'gone'} perils ${JSON.stringify(per)}`; }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
