// FLOOR 9'S WARD-STONE HUNT ON THE QUEST LINE (quests610.ts PIECE_BOSSES; ui/guide.ts huntBanner), pictures for him at his phone's size:
// coming into the Pinewood after the ward-stone (the line up, a DEFEAT for each boss), and the Mist Wolf fallen (its line ticked).
//   node tools/playtest.mjs --file dist/f9bosses.html --touch --size 852x393 --dpr 2 --scenario tools/scenarios/f9_hunt_shot.mjs --out shots/f9hunt/h
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.f9Bosses.sw.on = true;
    d.run('brawler', 9);
    d.seasoned(14);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    const g = d.game();
    g.talentsLeft = () => 0;
    g.hero.feather = 'given';
    g.hero.pieces = 0;
    g.depth = 9;
    g.cleared = 8;
    g.enterDungeon();
    g.talentsLeft = () => 0;
  });
  await page.waitForTimeout(2500);
  await snap('enter');
  // (gone in its time: never the whole level)
  await page.waitForFunction(() => { const h = window.__dbg.game().hunt; return !h || h.t <= 0; }, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  await snap('gone');
  const left = await page.evaluate(() => {
    const g = window.__dbg.game();
    const w = g.monsters.find((m) => m.kind === 'mistwolf');
    g.kill(w);
    return g.hunt;
  });
  log('hunt', JSON.stringify(left));
  await page.waitForTimeout(1500);
  await snap('wolf_down');
  await page.waitForFunction(() => { const h = window.__dbg.game().hunt; return !h || h.t <= 0; }, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  await snap('gone_again');
  log('gone', JSON.stringify(await page.evaluate(() => ({ hunt: window.__dbg.game().hunt, time: window.__dbg.game().time }))));
}
