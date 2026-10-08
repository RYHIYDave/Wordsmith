// Pictures of "of Power" being built by an attack that lands many times (a beam, a whirlwind, a
// volley), taken close together and slowly, for looking at. Not a test: it checks nothing.
//   CLS=mage WEAPON=wand node tools/playtest.mjs --scenario tools/scenarios/power_look.mjs --out shots/power
export default async function (page, snap) {
  const cls = process.env.CLS || 'mage';
  const weapon = process.env.WEAPON || 'wand';
  await page.evaluate(([cls, weapon]) => {
    const d = window.__dbg; d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.slowmo = 1;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero;
    if (g.weapon() !== weapon) { const i = h.bag.findIndex((it) => it && it.weapon === weapon); if (i >= 0) g.equipFromBag(i); }
    g.socket(1, 'behind', 'power');
  }, [cls, weapon]);
  await page.waitForTimeout(400);
  const where = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const c = d.cam();
    for (const [dx, dy] of [[1.6, -1.6], [2.6, -2.6], [1.2, -0.4]]) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
    }
    const x = h.x + 2.2; const y = h.y - 2.2;
    return d.screen.toClient(c.ox + (x - y) * 16, c.oy + (x + y) * 8);
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__dbg.slowmo = 0.15; });
  await page.mouse.move(where.x, where.y);
  await page.mouse.down({ button: 'right' });
  for (let k = 0; k < 10; k++) {
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return `might ${h.might.toFixed(1)}, ${h.channel ? h.channel.bites + ' bites' : 'not held'}`; });
    console.log(`picture ${k}: ${t}`);
    await snap(`${String(k).padStart(2, '0')}`);
  }
  await page.mouse.up({ button: 'right' });
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
