// The hero's line on a big kill: how it looks over their head, in a dungeon.
//   node tools/playtest.mjs --scenario tools/scenarios/quip.mjs --out shots/quip
import { log } from './lib.mjs';

export default async function (page, snap) {
  const lines = { warrior: 'Shh. This is a library.', ranger: 'Pick your poison.', mage: "I'm just warming up." };
  for (const cls of ['warrior', 'ranger', 'mage']) {
    await page.evaluate((cls) => {
      const d = window.__dbg; d.saving(false); d.run(cls, 21); d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game(); g.enterDungeon();
    }, cls);
    await page.waitForTimeout(700);
    // a real one: kill elites until the hero has something to say
    const said = await page.evaluate(() => {
      const g = window.__dbg.game();
      for (let i = 0; i < 400; i++) {
        const m = g.monsters.find((o) => !o.dead && !o.boss);
        if (!m) break;
        m.elite = true; m.lastSkill = 0; g.runTime += 60; g.events.length = 0;
        g.kill(m);
        const q = g.events.find((e) => e.t === 'quip');
        if (q) return q.text;
      }
      return null;
    });
    log(`${cls} said`, said);
    await page.waitForTimeout(350);
    await snap(`${cls}_real`);
    await page.waitForTimeout(2600);
    await page.evaluate((text) => { const g = window.__dbg.game(); g.emit({ t: 'quip', text, boss: false }); }, lines[cls]);
    await page.waitForTimeout(350);
    await snap(`${cls}_long`);
  }
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
