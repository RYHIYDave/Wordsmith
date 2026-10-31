// THE SEVEN BOSSES MADE QUICKER (game/bosses.ts BOSS_PACE; his words, 31 Oct 2026, 01:36: “I’d like the speed check to be ruled on
// all the bosses”, and to the list, “Yes, all seven (Recommended)”): each on its own floor, woken seven tiles off the hero, who
// stands; it comes at him at its new pace and strikes. A film: every thirtieth of the game's second (tools: film_cut.py).
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/boss_paces_film.mjs --out shots/paces/p
const FPS = 30;
const EACH = 7;
const BOSSES = [
  [2, 'headsman', 'THE HEADSMAN, FLOOR 2', 'His prowl, low and quick: 1.6 → 2.6 tiles a second (you walk 4.6)'],
  [5, 'fleshmancer', 'THE FLESHMANCER, FLOOR 5', '1.0 → 1.6 tiles a second'],
  [8, 'cantor', 'THE CANTOR, FLOOR 8', '0.8 → 1.4 tiles a second'],
  [12, 'ratking', 'THE RAT KING, FLOOR 12', 'A swarm of rats: 1.2 → 2.4 tiles a second'],
  [13, 'scraper', 'THE SCRAPER, FLOOR 13', 'It scuttles: 1.0 → 2.2 tiles a second'],
  [14, 'physician', 'THE PHYSICIAN, FLOOR 14', 'Brisk on his rounds: 1.0 → 1.8 tiles a second'],
  [15, 'censor', 'THE CENSOR, FLOOR 15', 'Leader of the Order, still then sudden: 0.8 → 1.6 tiles a second'],
];
export default async function (page, snap) {
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const list = BOSSES.filter((b) => !only || only.includes(b[1]));
  snap.note('film', { fps: FPS, from: 0, parts: list.map((b, i) => [i * EACH, b[2], b[3]]), size: await page.evaluate(() => [innerWidth, innerHeight]) });
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 5); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
  for (let b = 0; b < list.length; b++) {
    const [depth, kind] = list[b];
    const info = await page.evaluate(([depth, kind]) => {
      const d = window.__dbg;
      d.high(depth >= 11, depth);
      if (d.fx && d.fx.messages) d.fx.messages.length = 0;
      const g = d.game();
      const m = g.monsters.find((q) => q.kind === kind);
      if (!m) return { none: g.monsters.filter((q) => q.boss).map((q) => q.kind) };
      for (const q of g.monsters) if (q !== m) q.dead = true;
      g.projectiles.length = 0;
      const h = g.hero;
      // (the hero seven tiles off it, where the floor is open between them)
      let best = null;
      for (let k = 0; k < 16 && !best; k++) {
        const a = (k / 16) * Math.PI * 2 + 0.6;
        const x = m.x + Math.cos(a) * 7;
        const y = m.y + Math.sin(a) * 7;
        if (g.isOpen(x, y) && g.sees(m.x, m.y, x, y)) best = { x, y };
      }
      if (best) { h.x = best.x; h.y = best.y; }
      m.state = 'chase'; m.cd = 1.2;
      m.life = m.maxLife = 1e7; m.words = []; m.shield = 0;
      g.boss = m; g.bossMet = true;
      // (his wait over, his gate down and no line said: he comes at once)
      g.bossReady();
      g.level.explored.fill(1);
      return { kind: m.kind, speed: m.speed, at: [m.x.toFixed(2), m.y.toFixed(2)], hero: best };
    }, [depth, kind]);
    console.log('  ', JSON.stringify(info));
    await page.waitForTimeout(1200);
    // (put back seven tiles off him, standing, as the film begins)
    await page.evaluate(([kind, hero, at]) => {
      const g = window.__dbg.game();
      const m = g.monsters.find((q) => q.kind === kind && !q.dead);
      if (!m || !hero) return;
      g.hero.x = hero.x; g.hero.y = hero.y;
      m.x = Number(at[0]); m.y = Number(at[1]);
      m.act = undefined; m.state = 'chase'; m.cd = 0.8;
    }, [kind, info.hero, info.at]);
    const c0 = await page.evaluate(() => window.__dbg.clock());
    for (let i = 0; i < EACH * FPS; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      await snap(`f${String(b * EACH * FPS + i).padStart(4, '0')}`);
    }
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
