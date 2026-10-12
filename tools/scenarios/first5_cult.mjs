// THE FIRST FIVE FLOORS: THE CULT (game/defs.ts CULT; game/bosses.ts the mini fleshmancer). A floor of 4 or 5,
// one of its packs of dagger cultists (led by a mini fleshmancer, where one is), the rest of its monsters
// taken away; the hero a few tiles off, kept alive. Two of the cultists fall early: their bodies lie, and
// the mini fleshmancer raises them.
//   node tools/build_to.mjs dist/first5.html
//   DEPTH=5 node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_cult.mjs --out shots/first5/cult5
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 5);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  const info = await page.evaluate((n) => {
    const g = window.__dbg.game();
    let tries = 0;
    let pick = null;
    while (tries++ < 12) {
      g.depth = n; g.cleared = n - 1 + tries * 7; g.enterDungeon();
      const byPack = new Map();
      for (const m of g.monsters) if (!m.boss) { const l = byPack.get(m.packId) ?? []; l.push(m); byPack.set(m.packId, l); }
      const packs = [...byPack.values()].filter((l) => l.some((m) => m.kind === 'dagger'));
      pick = packs.find((l) => l.some((m) => m.kind === 'minifm')) ?? packs[0] ?? null;
      if (pick && pick.some((m) => m.kind === 'minifm')) break;
    }
    if (!pick) return { none: true, kinds: [...new Set(g.monsters.map((m) => m.kind))] };
    g.monsters = pick;
    g.level.explored.fill(1);
    const c = pick[0];
    // (the hero a few tiles off, on open floor)
    const L = g.level; const W = L.floor.w;
    let best = null;
    for (let ty = Math.floor(c.y) - 6; ty <= Math.floor(c.y) + 6; ty++) for (let tx = Math.floor(c.x) - 6; tx <= Math.floor(c.x) + 6; tx++) {
      const d = Math.hypot(tx + 0.5 - c.x, ty + 0.5 - c.y);
      if (d < 4 || d > 6 || L.walk[ty * W + tx] !== 1) continue;
      if (!best || tx + ty > best.s) best = { x: tx + 0.5, y: ty + 0.5, s: tx + ty };
    }
    if (best) { g.hero.x = best.x; g.hero.y = best.y; }
    for (const m of pick) { m.state = 'chase'; }
    return { pack: pick.map((m) => `${m.kind}${m.rarity === 'leader' ? '*' : ''}`), at: [c.x, c.y], hero: [g.hero.x, g.hero.y] };
  }, depth);
  log('cult', JSON.stringify(info));
  if (info.none) return;
  const t0 = Date.now();
  let shot = 0;
  while (Date.now() - t0 < 14000) {
    const s = (Date.now() - t0) / 1000;
    if (s > 2.5 && shot === 2) {
      await page.evaluate(() => { const g = window.__dbg.game(); const ds = g.monsters.filter((m) => m.kind === 'dagger' && !m.dead).slice(0, 2); for (const m of ds) g.kill(m); });
      log('killed two', JSON.stringify(await page.evaluate(() => window.__dbg.game().corpses.length)));
    }
    if (s >= shot * 1.6) { await snap(`s${String(shot).padStart(2, '0')}`); shot++; }
    const st = await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.map((m) => `${m.kind}:${m.state}${m.act ? '/' + m.act.id : ''}`).join(' ') + ` corpses=${g.corpses.length} risers=${g.risers.length}`; });
    if (shot % 2 === 0) log((Math.round(s * 10) / 10).toString(), st);
    await page.waitForTimeout(400);
  }
}
