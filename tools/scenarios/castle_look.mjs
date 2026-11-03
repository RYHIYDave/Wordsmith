// THE FIRST TOWN AS THE CASTLE'S HALL in the game (CASTLE_HALL on in the page built for it): the town as a new game starts in it, the
// hero set in a few of its places in turn (where a new arrival stands; the middle of the hall; before the gate; by the smithy, the owl
// over it; by the windows; the wordsmith's ring; the stairs down and the shaft), the game stepped a moment at each, pictured.
//   node tools/playtest.mjs --file dist/castle.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/castle_look.mjs --out shots/castle
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 31); });
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => {
    const g = window.__dbg.game();
    const r = window.__dbg.renderer;
    return { town: g.level.town, castle: r.castle ? r.castle.on(g.level) : null, pots: g.level.props.filter((p) => p.kind === 'piece').map((p) => `${p.name}@${p.tx},${p.ty}`).join('; ') };
  });
  log('town / castle', `${info.town} / ${info.castle}`);
  log('pots', info.pots);
  const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const places = [['arrival', 15.5, 14.5], ['middle', 13.5, 12.5], ['gate', 14.7, 7.4], ['smithy', 17.6, 9.2], ['windows', 8.2, 12.4], ['ring', 11.2, 16.2], ['stairs', 15.4, 16.0], ['corner', 7.6, 7.6]];
  for (const [name, x, y] of places) {
    if (ONLY && !ONLY.includes(name)) continue;
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [x, y]);
    await page.waitForTimeout(Number(process.env.SETTLE || 700));
    await snap(name);
  }
}
