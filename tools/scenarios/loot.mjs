// loot labels on the floor: stand by the chests of a vault with a full bag
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('ranger', 9); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(500);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 3; g.cleared = 3; g.enterDungeon(); });
  await page.waitForTimeout(600);
  const n = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero; window.__dbg.god = true;
    g.monsters.length = 0;
    h.bag.fill(h.gear.mainhand);
    const f = g.level.floor;
    const chests = g.level.props.filter((p) => p.kind === 'chest' && p.state === 0);
    const vault = chests.find((p) => f.rooms.some((r) => r.kind === 'treasure' && p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h)) || chests[0];
    if (!vault) return 0;
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) g.level.explored[y * f.w + x] = 1;
    h.x = vault.x; h.y = vault.y + 1.0;
    return chests.length;
  });
  console.log('chests', n);
  await page.waitForTimeout(900);
  await snap('loot_labels');
  const labels = await page.evaluate(() => window.__dbg.game().drops.filter((d) => d.kind === 'item').map((d) => d.item.name));
  console.log('on the floor (full names, not shown):', labels.join(' | '));
}
