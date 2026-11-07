// THE RECORDED SOUNDS IN A REAL BROWSER (engine/audio.ts), the page served as the published game is, its sounds beside it:
//   node tools/build.mjs; dist/page.html (shots/wrap's head line + dist/artifact.html)
//   node tools/playtest.mjs --serve --file dist/page.html --scenario tools/scenarios/sounds.mjs --out shots/sounds
// The title theme comes and plays once the sound is started by a tap; a run begun, it stops and is let go of, and the combat
// sounds and the hero's voice come; none fails. (Playwright's Chromium has no AAC: the title theme, title.mp4, cannot be decoded
// here and is said to fail; Safari and Chrome decode it.)
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.mouse.click(10, 10);
  let s = null;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(250);
    s = await page.evaluate(() => window.__dbg.sounds());
    if (s.title) break;
  }
  log(`title: ${JSON.stringify(s)}`);
  await snap('title');
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('mage', 9); d.god = true; });
  await page.mouse.click(10, 10);
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(250);
    s = await page.evaluate(() => window.__dbg.sounds());
    if (s.coming === 0 && s.come >= 22) break;
  }
  // (hurt him, and attack: his voice and the combat sounds asked for)
  await page.evaluate(() => { const g = window.__dbg.game(); for (let i = 0; i < 5; i++) g.hurtHero(3, 'phys', [], null, 'test', g.hero.x + 1, g.hero.y); });
  await page.waitForTimeout(500);
  s = await page.evaluate(() => window.__dbg.sounds());
  log(`in play: ${JSON.stringify(s)}`);
}
