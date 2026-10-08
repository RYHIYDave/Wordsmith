// Pictures of a volley, taken close together and slowly, for looking at: the arrows going up, the
// rain coming down, the arrows left standing. Not a test (it checks nothing): a way to SEE it.
//   node tools/playtest.mjs --scenario tools/scenarios/volley_look.mjs --out shots/volley
//   WORDS="fire|power" node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/volley_look.mjs --out shots/volley_phone
// WORDS: "front words|behind words", comma-separated (none by default).
export default async function (page, snap) {
  const [front, behind] = (process.env.WORDS ?? '|').split('|').map((s) => s.split(',').filter(Boolean));
  const touch = await page.evaluate(() => window.__dbg.screen.touch);
  await page.evaluate(([front, behind]) => {
    const d = window.__dbg; d.practice('ranger', 7); d.autoLevel = false; d.autoWords = false; d.slowmo = 1;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    for (const w of front) g.socket(1, 'front', w);
    for (const w of behind) g.socket(1, 'behind', w);
  }, [front, behind]);
  await page.waitForTimeout(400);
  const where = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const c = d.cam();
    const out = [];
    for (const [dx, dy] of [[3.6, -3.6], [4.4, -2.6], [2.6, -4.6], [5.2, -4.2]]) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
      out.push(m.id);
    }
    const x = h.x + 3.9; const y = h.y - 3.6;
    return d.screen.toClient(c.ox + (x - y) * 16, c.oy + (x + y) * 8);
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__dbg.slowmo = 0.12; });
  if (touch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(where.x), y: Math.round(where.y), id: 5 }] });
    await page.waitForTimeout(520);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await page.mouse.click(where.x, where.y, { button: 'right' });
  }
  // (0.12 of real time: a picture every 250 ms is one every 30 ms of the game's)
  for (let k = 0; k < 16; k++) {
    await page.waitForTimeout(k < 4 ? 500 : 1500);
    const t = await page.evaluate(() => { const g = window.__dbg.game(); const v = g.volleys[0]; return v ? `${v.t.toFixed(2)} s, ${v.n} of ${v.total}` : 'no volley'; });
    console.log(`picture ${k}: ${t}`);
    await snap(`${String(k).padStart(2, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
