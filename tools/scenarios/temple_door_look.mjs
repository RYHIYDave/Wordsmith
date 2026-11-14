// FLOOR 5'S TEMPLE DOOR (art/temple_door.ts, game/temple_door.ts, behind TEMPLE_DOOR), pictured for him from the game itself: the
// door barred, seen from the mine; then, both keys in hand, the keys turning, the chains falling, the leaves swinging into the temple.
//   node tools/build_to.mjs dist/templedoor.html
//   node tools/playtest.mjs --file dist/templedoor.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/temple_door_look.mjs --out shots/templedoor/d
//   env CLS=warrior|mage|..., SEED=n, STEP=seconds between pictures of the opening (0.1)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 9);
  const step = Number(process.env.STEP || 0.1);
  const at = await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.templeDoor.sw.on = true;
    d.trial(cls, 5, seed);
    d.god = true;
    const g = d.game();
    g.monsters.length = 0;
    return { depth: g.depth, door: d.templeDoor.state() };
  }, [cls, seed]);
  log('floor', JSON.stringify(at));
  if (!at.door) {
    log('!! no temple door on floor 5');
    return;
  }
  // (the floor's coming-in played out first: the game's own clock under way)
  await page.waitForFunction(() => window.__dbg.game().time > 2, null, { timeout: 120000 });
  // (barred: seen from the mine)
  log('stood', JSON.stringify(await page.evaluate(() => window.__dbg.templeDoor.standBefore(3.2))));
  const t0 = await page.evaluate(() => window.__dbg.game().time);
  await page.waitForFunction((t0) => window.__dbg.game().time > t0 + 1.2, t0, { timeout: 60000 });
  log('hero', JSON.stringify(await page.evaluate(() => { const h = window.__dbg.game().hero; return { x: h.x, y: h.y }; })));
  await snap('1_barred');
  await page.evaluate(() => window.__dbg.templeDoor.standBefore(1.9));
  const t1 = await page.evaluate(() => window.__dbg.game().time);
  await page.waitForFunction((t1) => window.__dbg.game().time > t1 + 1, t1, { timeout: 60000 });
  await snap('2_barred_near');
  log('told', JSON.stringify(await page.evaluate(() => window.__dbg.templeDoor.state())));
  // (both keys: the unlocking, a picture every `step` seconds of the game's time)
  await page.evaluate(() => {
    const d = window.__dbg;
    d.templeDoor.keys(2);
    d.templeDoor.standBefore(3.2);
    d.slowmo = 0.25;
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__dbg.templeDoor.standBefore(2.2));
  let k = 0;
  let last = -1;
  for (let i = 0; i < 400 && k < 60; i++) {
    const s = await page.evaluate(() => window.__dbg.templeDoor.state());
    if (s.began >= 0) {
      const into = s.time - s.began;
      if (into - last >= step) {
        last = into;
        await page.evaluate(() => { window.__dbg.slowmo = 1e-6; });
        await snap(`3_open_${String(k).padStart(2, '0')}`);
        await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
        k++;
        if (s.open >= 1 && into > 5) break;
      }
    }
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  log('after', JSON.stringify(await page.evaluate(() => window.__dbg.templeDoor.state())));
}
