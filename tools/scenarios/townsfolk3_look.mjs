// THE TOWN'S PEOPLE SCULPTED (art/townsfolk3.ts, behind TOWNSFOLK3): photographs of each at their place in the town, as they
// are (OLD=1) or sculpted, with a hero standing by for size. Nothing is pressed; the switch is put on for the pictures only.
//   CLS=brawler node tools/playtest.mjs --file dist/tf_look.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/townsfolk3_look.mjs --out shots/townsfolk3/new
//   T=<seconds> sets the town's clock for the picture (each of the four has their own: art/townscene.ts).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'brawler';
  const old = process.env.OLD === '1';
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 31); }, cls);
  await page.waitForTimeout(500);
  if (!old) await page.evaluate(() => window.__dbg.townsfolk3(true, false));
  const stand = (x, y) => page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [x, y]);
  // (the hero two tiles off, so that each is at their work; then right up to them, so that they turn)
  const places = (process.env.PLACES || 'smithy,bazaar,ring,stranger').split(',');
  const at = { smithy: [[20.5, 9.7], [19.6, 9.3]], bazaar: [[19.6, 15.4], [19.5, 14.6]], ring: [[11.7, 15.7], [10.6, 15.3]], stranger: [[8.7, 8.3], [7.7, 8.0]] };
  for (const name of places) {
    const [far, near] = at[name];
    await stand(far[0], far[1]);
    await page.waitForTimeout(900);
    await snap(`${name}_work`);
    if (process.env.NEAR === '1') {
      await stand(near[0], near[1]);
      await page.waitForTimeout(900);
      await snap(`${name}_turned`);
    }
  }
  log('photographed', places.join(', '));
}
