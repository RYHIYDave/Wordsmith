// THE PILLARS (game/quests610.ts PILLARS, off): switched on for this page with QUESTS610, a hero carrying the ward-stone's three
// pieces on floor 10; the Drowned Eye woken and pushed through his phases (his bar emptied by script) into his last, the siege
// pulled in: the cult's three obelisks burn; struck, he is "Shielded"; the hero beside one, the prompt; the use button, it goes
// out (the friend's cyan); the other two set; the siege broken, he can be hurt. Pictures through it. '!!' where it goes wrong.
//   node tools/build_to.mjs dist/looks.html
//   node tools/playtest.mjs --file dist/looks.html --size 844x390 --dpr 2 --scenario tools/scenarios/pillars.mjs --out shots/pillars/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 5); d.seasoned(12); d.autoLevel = false; d.autoWords = false; d.god = true; d.quests610.on = true; d.pillars.on = true; });
  await page.waitForTimeout(600);
  const set = await page.evaluate(() => {
    const d = window.__dbg;
    const g = d.game();
    g.hero.ring = true; g.hero.pending = 0; g.guide = null;
    g.hero.feather = 'given'; g.hero.pieces = 7;
    g.depth = 10; g.cleared = 9; g.wayDepth = 10; g.enterDungeon();
    g.hero.invuln = 1e9;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const b = g.monsters.find((m) => m.boss);
    g.hero.x = b.x + 4.2; g.hero.y = b.y + 4.2;
    g.bossMet = true;
    g.level.explored.fill(1);
    if (b.state === 'sleep') g.wakeUp(b);
    const ob = g.level.props.filter((p) => p.kind === 'piece' && p.name === "the cult's obelisk").map((p) => [+p.x.toFixed(2), +p.y.toFixed(2)]);
    return { boss: b.kind, at: [b.x, b.y], obelisks: ob };
  });
  log('floor 10', JSON.stringify(set));
  await page.waitForTimeout(3000);
  // (his first two bars emptied in turn: he surfaces, then pulls the siege in)
  for (const k of [0, 1]) {
    let ph = null;
    for (let w = 0; w < 30; w++) {
      ph = await page.evaluate((k) => { const b = window.__dbg.game().monsters.find((m) => m.boss && !m.dead); if (b && b.phase === k && b.life > 1 && b.state !== 'act') b.life = 1; return b ? b.phase : null; }, k);
      if (ph === k + 1) break;
      await page.waitForTimeout(1000);
    }
    log(`phase after bar ${k + 1}`, ph);
    await page.waitForTimeout(1200);
  }
  const lit = await page.evaluate(() => { const ps = window.__dbg.game().level.pillars; return ps ? ps.map((p) => p.lit) : null; });
  log('pillars', JSON.stringify(lit));
  if (!lit || lit.length !== 3 || !lit.every(Boolean)) log('!! the three obelisks are not burning in his last phase');
  await snap('01_burning');
  // (struck while they burn)
  const shielded = await page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss && !m.dead);
    const was = b.life;
    g.damageMonster(b, 200, 'phys', false, -1);
    return { was: Math.round(was), now: Math.round(b.life) };
  });
  log('struck while they burn', JSON.stringify(shielded));
  if (shielded.now !== shielded.was) log('!! he was hurt while they burn');
  await page.waitForTimeout(150);
  await snap('02_shielded');
  // (the hero beside the obelisk nearest him: the prompt)
  const near = await page.evaluate(() => {
    const g = window.__dbg.game();
    const h = g.hero;
    const ps = g.level.pillars;
    let k = 0;
    for (let i = 1; i < ps.length; i++) if (Math.hypot(ps[i].x - h.x, ps[i].y - h.y) < Math.hypot(ps[k].x - h.x, ps[k].y - h.y)) k = i;
    const p = ps[k];
    // (on the floor beside it, toward his pool)
    const b = g.monsters.find((m) => m.boss && !m.dead);
    const dx = b.x - p.x, dy = b.y - p.y, n = Math.hypot(dx, dy);
    h.x = p.x + (dx / n) * 1.2; h.y = p.y + (dy / n) * 1.2;
    return { k, hint: g.interactHint() };
  });
  log('beside obelisk', JSON.stringify(near));
  if (!/ward-stone/.test(near.hint || '')) log('!! no prompt beside a burning obelisk with pieces in hand');
  await page.waitForTimeout(600);
  await snap('03_prompt');
  // (the use button)
  await page.evaluate(() => { window.__dbg.game().update(1 / 30, Object.assign({}, window.__dbg.emptyControls ? window.__dbg.emptyControls() : {}, { interact: true })); });
  await page.waitForTimeout(300);
  const one = await page.evaluate(() => window.__dbg.game().level.pillars.map((p) => [p.lit, p.by || null]));
  log('after the use button', JSON.stringify(one));
  if (one.filter((q) => !q[0]).length !== 1) log('!! the use button did not put one out');
  await page.waitForTimeout(900);
  await snap('04_one_out');
  // (the other two set, as the hero would going round)
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const p of g.level.pillars) if (p.lit) {
      g.hero.x = p.x; g.hero.y = p.y + 1.1;
      g.update(1 / 30, Object.assign({}, window.__dbg.emptyControls ? window.__dbg.emptyControls() : {}, { interact: true }));
    }
    const b = g.monsters.find((m) => m.boss && !m.dead);
    g.hero.x = b.x + 4.2; g.hero.y = b.y + 4.2;
  });
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss && !m.dead);
    const was = b.life;
    g.damageMonster(b, 200, 'phys', false, -1);
    return { lit: g.level.pillars.map((p) => p.lit), was: Math.round(was), now: Math.round(b.life) };
  });
  log('all set', JSON.stringify(after));
  if (after.lit.some(Boolean)) log('!! not all out');
  if (!(after.now < after.was)) log('!! he cannot be hurt with the siege broken');
  await page.waitForTimeout(200);
  await snap('05_siege_broken');
  await page.waitForTimeout(2500);
  await snap('06_after');
}
