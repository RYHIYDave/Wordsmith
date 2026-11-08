// after the loading screen: is the hero still painted here? a profile of 3 s standing, then 3 s walking
import { makeHands, log } from './lib.mjs';
import { writeFileSync } from 'node:fs';
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(() => { window.__dbg.loading.on = true; });
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  for (let i = 0; i < 300; i++) { if (await page.evaluate(() => !!window.__dbg.game())) break; await page.waitForTimeout(50); }
  await page.waitForTimeout(6000);
  log('baked', await page.evaluate(() => window.__dbg.baked()));
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
  for (const [name, key] of [['stand', null], ['walk', 'KeyD'], ['walk2', 'KeyW']]) {
    await cdp.send('Profiler.start');
    if (key) await page.keyboard.down(key);
    await page.waitForTimeout(3000);
    if (key) await page.keyboard.up(key);
    const { profile } = await cdp.send('Profiler.stop');
    writeFileSync(`${process.env.OUT}_${name}.json`, JSON.stringify(profile));
  }
}
