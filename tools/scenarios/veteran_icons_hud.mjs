// The Veteran's icons on the game's own buttons, on a phone held sideways (tools/veteran_icons_page.mjs says how): the practice
// room with the Brawler, his buttons wearing the Veteran's three.
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice('brawler', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => { const h = window.__dbg.game().hero; return h.skills.map((s) => s.id).join(','); });
  console.log('skills', info);
  await snap('hud');
}
