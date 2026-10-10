// HIS NOTE OF 9 OCT 2026, 22:12, IN PICTURES (a fix, before it goes live): "mobs shouldn't flash white when
// taking dot damage". In the practice room a skeleton that cannot die or move burns for three seconds
// (its fire hurts it twice a second), and then takes one blow of the warrior's Strike; filmed as the
// game draws it, a picture every thirtieth of a second of the game's time (the game slowed so that the
// camera keeps up). Run on the game as it is live and on the fixed one, for the two side by side.
//   node tools/build_to.mjs dist/fixes.html
//   node tools/playtest.mjs --file dist/fixes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/dot_flash.mjs --out shots/dot/now
// A note beside the pictures (<out>_where.json) says where on the screen the hero and the skeleton stand,
// and on which pictures the skeleton was white.
export default async function (page, snap) {
  const id = await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    // (a tile and a half to the right across the screen: half a step along x and half against y, for each tile)
    const x = h.x + 0.75 * 1.6; const y = h.y - 0.75 * 1.6;
    const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7;
    m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
    const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
    h.fx = -m.fx; h.fy = -m.fy;
    return m.id;
  });
  await page.waitForTimeout(Number(process.env.WAIT || 5000));
  const where = await page.evaluate((id) => {
    const d = window.__dbg; const g = d.game(); const m = g.monsters.find((q) => q.id === id);
    return { hero: d.at(g.hero.x, g.hero.y), mob: d.at(m.x, m.y), scale: d.screen.scale ?? null };
  }, id);

  const slow = 0.1;
  const step = 1000 / 30 / slow;
  const frames = 126;
  const STRIKE = 96;
  await page.evaluate(([id, slow]) => {
    const d = window.__dbg; const g = d.game(); const m = g.monsters.find((q) => q.id === id);
    d.slowmo = slow;
    // it catches fire: hurt every half second, the first a quarter of a second in (the same moments on both games)
    m.burnT = 99; m.burnDps = 40; m.flash = 0; g.dotT = 0.25;
  }, [id, slow]);
  const white = [];
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (i === STRIKE) {
      await page.evaluate((id) => {
        const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
        h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
        const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
        g.useBasic(m.x, m.y);
      }, id);
    }
    await snap(`f${String(i).padStart(3, '0')}`);
    const s = await page.evaluate((id) => { const m = window.__dbg.game().monsters.find((q) => q.id === id); return { flash: m.flash, life: m.life }; }, id);
    if (s.flash > 0) white.push(i);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  snap.note('where', { ...where, white, strike: STRIKE });
  console.log('where', JSON.stringify(where));
  console.log('white on', JSON.stringify(white));
  console.log('late by', Date.now() - (t0 + (frames - 1) * step), 'ms at the end');
}
