// ACT 2, THE HUSH, FILMED IN THE GAME FOR HIM (behind ACT2, off: switched on here by the test hook, __dbg.act2): a floor of it
// played by the test bot (src/dev/bot.ts) from where the hero comes in, its boss fought, or its Bells rung, as one film.
//   node tools/build_to.mjs dist/act2.html
//   PART=floor DEPTH=11 node tools/playtest.mjs --file dist/act2.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_film.mjs --out shots/film/f11
// PART: floor (the bot plays on from the start, its monsters as laid), boss (the hero a few tiles off the floor's boss, only
// he left, the bot fighting him), bells (the Muffled Bell struck, then each bell rung in turn as the bot fights what rises).
// DEPTH: 11 to 15. CLS: the hero (warrior). SEED: the run's (7). SECS: how long (25; the bells' as long as they take).
// A frame every 15th of a second of the game's time (the game slowed to a quarter), named f_0000...; the hero is struck by
// nothing (god), so the film is of the floor and its fights, not of his dying.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const part = process.env.PART || 'floor';
  const depth = Number(process.env.DEPTH || 11);
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 7);
  const secs = Number(process.env.SECS || 25);
  const FPS = 15;
  const SLOW = 0.25;
  await page.evaluate(([c, s, d]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run(c, s);
    D.seasoned(26);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
    D.act2(true, d);
  }, [cls, seed, depth]);
  await page.waitForTimeout(1500);
  const info = await page.evaluate((p) => {
    const g = window.__dbg.game();
    const L = g.level;
    const h = g.hero;
    const out = { land: L.land?.kind, depth: g.depth, boss: g.monsters.find((m) => m.boss)?.name ?? null, monsters: g.monsters.length };
    if (p === 'boss') {
      const b = g.monsters.find((m) => m.boss);
      g.monsters = g.monsters.filter((m) => m.boss);
      if (b) {
        // (the hero four tiles off him, toward the way in, on the floor)
        const sx = L.floor.start.x - b.x, sy = L.floor.start.y - b.y;
        const k = Math.hypot(sx, sy) || 1;
        for (let d = 4; d <= 8; d += 0.5) {
          const x = b.x + (sx / k) * d, y = b.y + (sy / k) * d;
          if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] === 1) { h.x = x; h.y = y; break; }
        }
        b.state = 'chase';
      }
    }
    if (p === 'bells') {
      const B = L.bells;
      out.bells = B ? B.plan.bells.length : 0;
      if (B) {
        g.monsters = g.monsters.filter((m) => m.boss);
        h.x = B.plan.muffled.x - 1.3;
        h.y = B.plan.muffled.y + 1.3;
      }
    }
    L.explored.fill(1);
    // (for the film: the town's line from the start of the run cleared, and no talent waiting to be picked on the screen)
    window.__dbg.fx.messages = [];
    g.talentsLeft = () => 0;
    return out;
  }, part);
  log('film', JSON.stringify({ part, depth, cls, ...info }));
  await page.evaluate(() => { window.__dbg.slowmo = 0.25; window.__dbg.bot(true); });
  const step = 1000 / FPS / SLOW;
  const t0 = Date.now();
  let i = 0;
  const frame = async () => {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f_${String(i).padStart(4, '0')}`);
    i++;
  };
  const hold = async (s) => { const n = Math.round(s * FPS); for (let k = 0; k < n; k++) await frame(); };
  if (part === 'bells') {
    if (!info.bells) { log('!!', 'no Bells on this floor'); return; }
    await hold(1.5);
    await page.evaluate(() => { const g = window.__dbg.game(); const m = g.level.bells.plan.muffled; g.bellsStruck(m.x, m.y, 0.5); });
    await hold(4);
    const n = info.bells;
    for (let b = 0; b < n; b++) {
      // (to the bell: put beside it, as if he had run there, a moment to look; then it is struck)
      await page.evaluate((k) => {
        const g = window.__dbg.game(); const L = g.level; const q = L.bells.plan.bells[k];
        for (const [dx, dy] of [[-1.4, 1.0], [1.0, 1.4], [-1.0, -1.4], [1.4, -1.0]]) {
          const x = q.x + dx, y = q.y + dy;
          if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] === 1) { g.hero.x = x; g.hero.y = y; break; }
        }
      }, b);
      await hold(0.8);
      await page.evaluate((k) => { const g = window.__dbg.game(); const q = g.level.bells.plan.bells[k]; g.bellsStruck(q.x, q.y, 0.6); }, b);
      await hold(b === n - 1 ? 5 : 2.6);
    }
    log('bells', JSON.stringify(await page.evaluate(() => { const B = window.__dbg.game().level.bells; return { phase: B.phase, t: +B.t.toFixed(1), risen: B.risen, left: B.left, first: B.first }; })));
  } else {
    await hold(secs);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; window.__dbg.bot(false); });
  log('end', JSON.stringify(await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, kills: g.stats?.kills ?? null, monsters: g.monsters.filter((m) => !m.dead).length, boss: g.monsters.find((m) => m.boss && !m.dead)?.life ?? 'down' }; })));
}
