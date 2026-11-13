// ARCS KEEP JUMPING (game/defs.ts ARC_CHAIN): the practice room's Mage with Lightning on her tap, a crowd before her; two taps as the
// game is today, then two with the switch on. Filmed frame by frame, 30 a second (the game's clock stepped so no frame is missed).
//   node tools/build_to.mjs dist/arc_chain.html
//   node tools/playtest.mjs --file dist/arc_chain.html --size 852x393 --dpr 3 --touch --scenario tools/scenarios/arc_chain_look.mjs --out shots/arc_chain/a
export default async function (page) {
  const outAt = process.argv.indexOf('--out');
  const out = outAt >= 0 ? process.argv[outAt + 1] : 'shots/arc_chain/a';
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false); d.loading.on = false;
    d.practice('mage', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.arcChain.on = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    const s = h.skills[0]; s.front = ['lightning', null]; s.behind = [null, null]; g.refresh();
    const put = (ax, dn) => {
      const x = h.x + ((ax + dn) / 2) * 1.4; const y = h.y + ((dn - ax) / 2) * 1.4;
      const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
      g.wakeUp(m); m.life = m.maxLife = 1e7; m.words = [];
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
    };
    // (one before her, a crowd spread out beyond it)
    put(1.6, 0);
    for (let k = 0; k < 16; k++) put(2.6 + (k % 4) * 1.1, Math.floor(k / 4) * 1.15 - 1.7 + (k % 2) * 0.3);
  });
  await page.waitForTimeout(2500);
  const shootAt = async () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.monsters.filter((q) => !q.dead).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
    h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) s.cd = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
  });
  const plan = { 10: 'shoot', 40: 'shoot', 78: 'on', 90: 'shoot', 120: 'shoot' };
  const mid = await page.evaluate(() => [innerWidth / 2, innerHeight / 2]);
  const clip = { x: Math.round(mid[0] - 110), y: Math.round(mid[1] - 160), width: 420, height: 260 };
  const c0 = await page.evaluate(() => window.__dbg.clock());
  for (let i = 0; i < 160; i++) {
    if (plan[i] === 'shoot') await shootAt();
    if (plan[i] === 'on') await page.evaluate(() => { window.__dbg.arcChain.on = true; });
    await page.evaluate(() => { const f = window.__dbg.fx; f.floaters = f.floaters.filter((q) => !/^\d+$/.test(q.text)); window.__dbg.slowmo = 0.3; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + (i + 1) / 30, { polling: 'raf', timeout: 120000 });
    await page.screenshot({ path: `${out}_f${String(i).padStart(4, '0')}.png`, clip });
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log('  filmed 160 frames');
}
