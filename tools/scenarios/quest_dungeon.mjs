// THE MASTER RUNE-STONE IN THE FIRST DUNGEON (art/quest3.ts, QUEST3; a mock-up: not in the game):
// pictures for the owner. A new warrior in his first dungeon, standing a little way from the fallen
// wordsmith (no monster near: they are cleared away for the pictures), the stone lying beside him;
// then it is taken up (as the rules will one day have it: here the demo says so) and flies into the
// hero, and the screen shows it carried. The game is slowed so that the camera keeps up: a picture
// every twentieth of a second of the game's time while it flies.
//   node tools/build_to.mjs dist/quest.html
//   node tools/playtest.mjs --file dist/quest.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/quest_dungeon.mjs --out shots/quest/dungeon
export default async function (page, snap) {
  // (the guide that shows a new player the game is put aside for the pictures: its words and its shaft of light over the body are the main chat's to change for the quest)
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.first('warrior', 3); d.god = true; d.game().guide = null; d.smith3(true); d.quest3({ on: true, dark: true, lying: true, carried: false }); });
  await page.waitForTimeout(900);
  const where = await page.evaluate(() => {
    const g = window.__dbg.game();
    const L = g.level;
    const b = L.body;
    const f = L.floor;
    for (let i = g.monsters.length - 1; i >= 0; i--) if (!g.monsters[i].boss && Math.hypot(g.monsters[i].x - b.x, g.monsters[i].y - b.y) < 10) g.monsters.splice(i, 1);
    // (two tiles off, to the right of him on the screen: on open floor)
    for (const [dx, dy] of [[1.6, -1.2], [1.4, -1.5], [1.9, -0.9], [-1.2, 1.6], [-1.5, 1.4], [1.7, 1.2]]) {
      const x = b.x + dx;
      const y = b.y + dy;
      if (L.walk[Math.floor(y) * f.w + Math.floor(x)] !== 1) continue;
      g.hero.x = x;
      g.hero.y = y;
      const far = Math.hypot(dx, dy);
      g.hero.fx = -dx / far;
      g.hero.fy = -dy / far;
      return { body: [b.x, b.y], hero: [x, y] };
    }
    return { body: [b.x, b.y], hero: null };
  });
  console.log('where', JSON.stringify(where));
  await page.waitForTimeout(1800);
  for (let k = 0; k < 10; k++) {
    await snap(`lie_${String(k).padStart(2, '0')}`);
    await page.waitForTimeout(120);
  }
  const slow = 0.2;
  await page.evaluate((s) => { window.__dbg.slowmo = s; window.__dbg.quest3({ take: true }); }, slow);
  const step = 50 / slow;
  const t0 = Date.now();
  for (let i = 0; i < 34; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`take_${String(i).padStart(2, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  await page.waitForTimeout(800);
  await snap('carried');
}
